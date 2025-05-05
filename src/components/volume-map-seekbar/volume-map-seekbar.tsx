import {h} from 'preact';
import {useEffect, useState, useRef, useCallback} from 'preact/hooks';
import {ui, KalturaPlayer} from '@playkit-js/kaltura-player-js';
import {VolumeMapEntry, AudioPlayerSizes} from '../../types';
import {processVolumeMap, normalizeDbLevel} from '../../utils';
import {AudioPlayer} from '../../audio-player';
import {AudioSeekbar} from '..';

import * as styles from './volume-map-seekbar.scss';
import * as audioSeekbarStyles from '../audio-seekbar/audio-seekbar.scss';

const {Components, utils, redux} = ui;
// @ts-ignore
const {withPlayer} = Components;
const {toHHMMSS} = utils;
const {connect} = redux;

interface VolumeMapSeekbarProps {
  player: KalturaPlayer;
  size: AudioPlayerSizes;
  eventManager: any;
  engineDuration: number;
  currentTime: number;
}

// Constants for drawing
const BAR_WIDTH = 2;
const GAP = 1;
const MIN_DB = -60; // dBFS value to map to 0 height
const MAX_DB = 0; // dBFS value to map to full height

const mapStateToProps = (state: any) => ({
  currentTime: state.engine.currentTime,
  engineDuration: state.engine.duration
});

export const VolumeMapSeekbar = withPlayer(
  connect(mapStateToProps)(({player, size, engineDuration, currentTime}: VolumeMapSeekbarProps) => {
    const [originalVolumeMap, setOriginalVolumeMap] = useState<VolumeMapEntry[]>([]);
    const [processedVolumeMap, setProcessedVolumeMap] = useState<VolumeMapEntry[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const duration = engineDuration || player.sources.duration;
    // @ts-ignore
    const activeColor = player.ui._uiManager.getCSSVariable('--playkit-tone-1-color') ?? '#FFFFFF';
    const inactiveColor = activeColor ? `${activeColor}80` : '#FFFFFF80';

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        return;
      }
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const {width} = entry.contentRect;
          setContainerWidth(width); // Update container width state
          canvas.width = width; // Set canvas width
          canvas.height = size === AudioPlayerSizes.Large ? 56 : 32;
        }
      });
      resizeObserver.observe(container);

      setContainerWidth(container.clientWidth);
      return () => {
        resizeObserver.disconnect();
      };
    }, [originalVolumeMap, size]);

    // Fetch original volume map data
    useEffect(() => {
      const audioPlayerPlugin = player.plugins['audioPlayer'] as AudioPlayer | undefined;
      audioPlayerPlugin?.getVolumeMap().then((mapData: VolumeMapEntry[]) => {
        setOriginalVolumeMap(mapData);
      });
    }, []);

    // Process volume map when original data or container width changes
    useEffect(() => {
      if (containerWidth > 0 && originalVolumeMap.length > 0) {
        const maxBars = Math.floor(containerWidth / (BAR_WIDTH + GAP));
        const newProcessedMap = processVolumeMap(originalVolumeMap, maxBars);
        setProcessedVolumeMap(newProcessedMap);
      }
    }, [originalVolumeMap, containerWidth]);

    // Drawing function - uses processedVolumeMap
    const drawWaveform = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !processedVolumeMap.length || !duration) {
        return;
      }

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const currentTimeMs = currentTime * 1000;

      let currentBarIndex = -1;
      // Iterate over processedVolumeMap
      for (let i = 0; i < processedVolumeMap.length; i++) {
        if (processedVolumeMap[i].pts <= currentTimeMs) {
          currentBarIndex = i;
        } else {
          break;
        }
      }

      // Iterate over processedVolumeMap
      for (let i = 0; i < processedVolumeMap.length; i++) {
        const x = i * (BAR_WIDTH + GAP);
        const normalizedLevel = normalizeDbLevel(processedVolumeMap[i].rms_level, MIN_DB, MAX_DB);
        const barHeight = normalizedLevel * canvasHeight;
        const y = (canvasHeight - barHeight) / 2;

        ctx.fillStyle = i <= currentBarIndex ? activeColor : inactiveColor;
        ctx.fillRect(x, y, BAR_WIDTH, barHeight);
      }
    }, [processedVolumeMap, duration, currentTime]);

    // Redraw when processed map changes
    useEffect(() => {
      drawWaveform();
    }, [processedVolumeMap, drawWaveform]);

    // Handle seeking on click - uses processedVolumeMap
    const handleCanvasClick = (event: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !processedVolumeMap.length || !duration) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const clickedBarIndex = Math.floor(x / (BAR_WIDTH + GAP));
      const validIndex = Math.max(0, Math.min(clickedBarIndex, processedVolumeMap.length - 1));

      const newTime = processedVolumeMap[validIndex].pts / 1000;
      if (isFinite(newTime)) {
        player.currentTime = newTime;
      }
    };

    // Render fallback or the canvas
    if (!originalVolumeMap.length) {
      return <AudioSeekbar />;
    }

    return (
      <div ref={containerRef} class={styles.volumeMapContainer} data-testid="volume-map-seekbar" onClick={handleCanvasClick}>
        <canvas ref={canvasRef} class={styles.volumeMapCanvas} style={{height: size === AudioPlayerSizes.Large ? '56px' : '32px'}} />
        <div className={styles.timeContainer}>
          <div className={audioSeekbarStyles.currentTime}>{toHHMMSS(currentTime)}</div>
          <div className={audioSeekbarStyles.duration}>{toHHMMSS(duration as number)}</div>
        </div>
      </div>
    );
  })
);

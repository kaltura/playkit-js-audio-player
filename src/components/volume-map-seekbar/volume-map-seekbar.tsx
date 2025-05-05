import {h} from 'preact';
import {useEffect, useState, useRef, useCallback} from 'preact/hooks';
import {ui, KalturaPlayer} from '@playkit-js/kaltura-player-js';
import {VolumeMapEntry, AudioPlayerSizes} from '../../types';
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

// Constants for drawing - BASE_BAR_WIDTH and BASE_GAP become reference/minimums
const BASE_BAR_WIDTH = 2;
const BASE_GAP = 1;
const MIN_DB = -60; // dBFS value to map to 0 height
const MAX_DB = 0; // dBFS value to map to full height

// Normalize dBFS level to a 0-1 range for bar height
// This function takes a dBFS level and maps it to a value between 0 and 1, where 0 corresponds to MIN_DB
// and 1 corresponds to MAX_DB. It ensures that the value is clamped between 0 and 1.
function normalizeDbLevel(dbLevel: number, minDb: number, maxDb: number): number {
  const level = (dbLevel - minDb) / (maxDb - minDb);
  return Math.max(0.01, Math.min(1, level)); // Clamp between 0 and 1
}

// Function to downsample volume map data
// This function takes the original volume map and reduces it to fit within the maxBars limit
// by averaging the RMS levels of groups of entries. It returns a new array of VolumeMapEntry objects.
function processVolumeMap(originalMap: VolumeMapEntry[], maxBars: number): VolumeMapEntry[] {
  if (!originalMap || originalMap.length === 0 || maxBars <= 0) {
    return [];
  }

  if (originalMap.length <= maxBars) {
    return originalMap; // No processing needed
  }

  const processedMap: VolumeMapEntry[] = [];
  const groupSize = Math.ceil(originalMap.length / maxBars);

  for (let i = 0; i < originalMap.length; i += groupSize) {
    const group = originalMap.slice(i, i + groupSize);
    if (group.length > 0) {
      const sumRms = group.reduce((acc, entry) => acc + entry.rms_level, 0);
      const avgRms = sumRms / group.length;
      processedMap.push({
        pts: group[0].pts, // Use the timestamp of the first entry in the group
        rms_level: avgRms
      });
    }
  }
  // Ensure we don't exceed maxBars due to rounding
  return processedMap.slice(0, maxBars);
}

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
    // @ts-expect-error Property '_uiManager' is private and only accessible within class 'UIWrapper'
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
          setContainerWidth(width);
          canvas.width = width;
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
        const maxBars = Math.floor(containerWidth / (BASE_BAR_WIDTH + BASE_GAP));
        const newProcessedMap = processVolumeMap(originalVolumeMap, maxBars);
        setProcessedVolumeMap(newProcessedMap);
      } else {
        setProcessedVolumeMap([]);
      }
    }, [originalVolumeMap, containerWidth]);

    // Drawing function - uses processedVolumeMap
    const drawWaveform = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !processedVolumeMap.length || !duration || !containerWidth) {
        return;
      }

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const currentTimeMs = currentTime * 1000;

      let currentBarIndex = -1;
      for (let i = 0; i < processedVolumeMap.length; i++) {
        if (processedVolumeMap[i].pts <= currentTimeMs) {
          currentBarIndex = i;
        } else {
          break;
        }
      }

      const numBars = processedVolumeMap.length;
      if (numBars === 0) return; // Nothing to draw

      // --- Calculate dynamic bar width and gap to fill the space ---
      // Keep the ratio of base gap to base bar width
      const gapToBarRatio = BASE_GAP / BASE_BAR_WIDTH;
      // Total space = (numBars * barWidth) + ((numBars - 1) * gap)
      // Total space = (numBars * barWidth) + ((numBars - 1) * barWidth * gapToBarRatio)
      // Total space = barWidth * (numBars + (numBars - 1) * gapToBarRatio)
      let barWidth = canvasWidth / (numBars + Math.max(0, numBars - 1) * gapToBarRatio);
      let gap = barWidth * gapToBarRatio;

      // Ensure gap is at least 1 logical pixel if possible, adjust barWidth accordingly
      if (numBars > 1 && gap < 1) {
        gap = 1;
        barWidth = (canvasWidth - (numBars - 1) * gap) / numBars;
      }
      // Ensure barWidth is at least 1 logical pixel
      barWidth = Math.max(1, barWidth);
      // --- End dynamic calculation ---

      for (let i = 0; i < numBars; i++) {
        // Use dynamic barWidth and gap
        const x = i * (barWidth + gap);
        const normalizedLevel = normalizeDbLevel(processedVolumeMap[i].rms_level, MIN_DB, MAX_DB);
        const barHeight = normalizedLevel * canvasHeight;
        const y = (canvasHeight - barHeight) / 2;

        ctx.fillStyle = i <= currentBarIndex ? activeColor : inactiveColor;
        // Draw with exact fractional width and position
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    }, [processedVolumeMap, duration, currentTime, containerWidth, activeColor, inactiveColor]); // Added dependencies

    // Redraw when processed map or other relevant state changes
    useEffect(() => {
      drawWaveform();
    }, [processedVolumeMap, currentTime, duration, containerWidth, drawWaveform]); // Added dependencies

    // Handle seeking on click - uses dynamic widths
    const handleCanvasClick = (event: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !processedVolumeMap.length || !duration || !containerWidth) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const numBars = processedVolumeMap.length;

      // --- Recalculate dynamic widths used for drawing ---
      // This needs to match the calculation in drawWaveform
      const gapToBarRatio = BASE_GAP / BASE_BAR_WIDTH;
      let barWidth = containerWidth / (numBars + Math.max(0, numBars - 1) * gapToBarRatio);
      let gap = barWidth * gapToBarRatio;
      if (numBars > 1 && gap < 1) {
        gap = 1;
        barWidth = (containerWidth - (numBars - 1) * gap) / numBars;
      }
      barWidth = Math.max(1, barWidth);
      const unitWidth = barWidth + gap;
      // --- End recalculation ---

      // Estimate clicked index based on dynamic unit width
      const clickedBarIndex = Math.floor(x / unitWidth);
      const validIndex = Math.max(0, Math.min(clickedBarIndex, numBars - 1));

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
      // TODO: handle accessibility
      <div ref={containerRef} class={styles.volumeMapContainer} data-testid="volume-map-seekbar">
        <canvas
          ref={canvasRef}
          class={styles.volumeMapCanvas}
          style={{height: size === AudioPlayerSizes.Large ? '56px' : '32px'}}
          onClick={handleCanvasClick}
        />
        <div className={styles.timeContainer}>
          <div className={audioSeekbarStyles.currentTime}>{toHHMMSS(currentTime)}</div>
          <div className={audioSeekbarStyles.duration}>{toHHMMSS(duration as number)}</div>
        </div>
      </div>
    );
  })
);

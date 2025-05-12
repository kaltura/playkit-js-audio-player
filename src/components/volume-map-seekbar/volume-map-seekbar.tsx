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
const MIN_DURATION = 20; // Minimum duration to show the volume map

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

    // Drawing function - uses processedVolumeMap and scales height to actual max RMS
    const drawWaveform = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !processedVolumeMap.length || !duration || !containerWidth) {
        return;
      }

      // Handle high DPI displays for sharp rendering
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Set the canvas size accounting for device pixel ratio
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale the context to match device pixel ratio
      ctx.scale(dpr, dpr);
      
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const numBars = processedVolumeMap.length;
      if (numBars === 0) return;

      // Find the actual maximum RMS level in the processed data
      let maxRmsLevelInData = MIN_DB; // Start with the minimum possible value
      for (const entry of processedVolumeMap) {
        if (entry.rms_level > maxRmsLevelInData) {
          maxRmsLevelInData = entry.rms_level;
        }
      }
      // Ensure the effective max DB for scaling is slightly above MIN_DB to avoid division by zero/issues
      const effectiveMaxDb = Math.max(maxRmsLevelInData, MIN_DB + 1e-6);
      const dbRange = effectiveMaxDb - MIN_DB;

      const currentTimeMs = currentTime * 1000;

      let currentBarIndex = -1;
      for (let i = 0; i < processedVolumeMap.length; i++) {
        if (processedVolumeMap[i].pts <= currentTimeMs) {
          currentBarIndex = i;
        } else {
          break;
        }
      }

      // Calculate dimensions to use the entire canvas width
      const minGap = 1; // 1px minimum gap for separation
      const totalGaps = numBars - 1;
      
      // Calculate bar width by distributing the entire canvas width
      // We want to stretch the bars to fill the entire width with minimal gaps
      const barWidth = (canvasWidth - (totalGaps * minGap)) / numBars;
      
      // We want the first bar to start at x=0 and the last bar to end at x=canvasWidth
      for (let i = 0; i < numBars; i++) {
        // Calculate precise pixel position - first bar starts at x=0
        const x = i * (barWidth + minGap);

        // Normalize using the actual max level found in the data
        let normalizedLevel = 0;
        if (dbRange > 0) {
          normalizedLevel = (processedVolumeMap[i].rms_level - MIN_DB) / dbRange;
        }
        normalizedLevel = Math.max(0, Math.min(1, normalizedLevel)); // Clamp 0-1

        let barHeight = normalizedLevel * canvasHeight;
        // Ensure minimum bar height of 1px
        barHeight = Math.max(1, barHeight);
        // Ensure bar height does not exceed canvas height
        barHeight = Math.min(barHeight, canvasHeight);

        // Use integer values for pixel-aligned coordinates
        const y = Math.floor((canvasHeight - barHeight) / 2);

        ctx.fillStyle = i <= currentBarIndex ? activeColor : inactiveColor;
        
        // For the last bar, ensure it extends all the way to the edge
        const actualBarWidth = i === numBars - 1 
          ? canvasWidth - x // Make the last bar extend to the edge
          : barWidth;
        
        // Draw pixel-perfect rectangle
        ctx.fillRect(x, y, actualBarWidth, barHeight);
      }
    }, [processedVolumeMap, duration, currentTime, containerWidth, activeColor, inactiveColor]);

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

      // Use same calculations as in drawWaveform to determine bar positions
      const minGap = 1;
      const totalGaps = numBars - 1;
      
      // Calculate bar width to match drawing function (use full width)
      const barWidth = (rect.width - (totalGaps * minGap)) / numBars;
      
      // Since we now start at x=0 with no padding, we can directly determine which bar was clicked
      // Each bar+gap unit takes (barWidth + minGap) pixels, except the last bar which may be wider
      const unitWidth = barWidth + minGap;
      let barIndex = Math.floor(x / unitWidth);
      
      // Ensure index is in valid range
      barIndex = Math.max(0, Math.min(barIndex, numBars - 1));
      
      const newTime = processedVolumeMap[barIndex].pts / 1000;
      if (isFinite(newTime)) {
        player.currentTime = newTime;
      }
    };

    // Render fallback or the canvas
    if (!originalVolumeMap.length || (duration as number) < MIN_DURATION) {
      return <AudioSeekbar />;
    }

    return (
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

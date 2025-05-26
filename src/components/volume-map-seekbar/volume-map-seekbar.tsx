import {h} from 'preact';
import {useEffect, useState, useRef, useCallback} from 'preact/hooks';
import {ui, KalturaPlayer} from '@playkit-js/kaltura-player-js';
import {VolumeMapEntry, AudioPlayerSizes} from '../../types';
import {AudioPlayer} from '../../audio-player';
import {AudioSeekbar} from '..';

import * as styles from './volume-map-seekbar.scss';
import * as audioSeekbarStyles from '../audio-seekbar/audio-seekbar.scss';

const {Components, utils, redux, reducers} = ui;
const {withText, Text} = ui.preacti18n;
const {withPlayer, withKeyboardEvent, withEventDispatcher, IconType} = Components;
// @ts-expect-error Property 'getDurationAsText' does not exist on type 'typeof Utils'
const {toHHMMSS, getDurationAsText, bindActions, KeyMap} = utils;
const {connect} = redux;
const {shell, overlayAction, seekbar} = reducers;

interface VolumeMapSeekbarProps {
  player: KalturaPlayer;
  size: AudioPlayerSizes;
  eventManager: any;
  engineDuration: number;
  currentTime: number;

  sliderAriaLabel?: string;
  valuetextLabel?: string;

  isDraggingActive?: boolean;
  isMobile?: boolean;

  registerKeyboardEvents?: (events: Array<any>) => void;
  notifyChange?: (data: any) => void;
  updatePlayerHoverState?: (isHover: boolean) => void;
  updateOverlayActionIcon?: (iconType: any) => void;
  updateSeekbarDraggingStatus?: (isDragging: boolean) => void;
}

const translates = {
  sliderAriaLabel: <Text id="controls.seekBarSlider">Seek bar</Text>,
  valuetextLabel: <Text id="controls.valuetextLabel">of</Text>
};

const COMPONENT_NAME = 'VolumeSeekBar';
const KEYBOARD_DEFAULT_SEEK_JUMP: number = 5;

const BASE_BAR_WIDTH = 2;
const BASE_GAP = 1;
const MIN_DB = -60; // dBFS value to map to 0 height

// This function processes the original volume map to match the requested number of bars (maxBars).
// It can both reduce (through averaging) or increase (through interpolation) the number of data points.
function processVolumeMap(originalMap: VolumeMapEntry[], maxBars: number): VolumeMapEntry[] {
  if (!originalMap || originalMap.length === 0 || maxBars <= 0) {
    return [];
  }

  // Case 1: Original map already matches the requested size
  if (originalMap.length === maxBars) {
    return originalMap; // No processing needed
  }

  // Case 2: We need to reduce the number of data points
  if (originalMap.length > maxBars) {
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

  // Case 3: We need to increase the number of data points through interpolation
  const processedMap: VolumeMapEntry[] = [];
  
  // Calculate time range of the audio, using 0 as the starting point if needed
  const startPts = 0; // Always start from 0 seconds
  const endPts = originalMap[originalMap.length - 1].pts;
  
  // Generate evenly spaced timestamps
  for (let i = 0; i < maxBars; i++) {
    // Calculate the desired timestamp position
    const position = i / (maxBars - 1); // 0 to 1
    const targetPts = startPts + position * endPts;
    
    // Find the two closest points for interpolation
    let beforeIndex = 0;
    let afterIndex = 0;
    
    // Handle case where targetPts is before first data point
    if (targetPts < originalMap[0].pts) {
      // For points before the first data point, we'll use the first available point's level
      // but with the correct timestamp
      processedMap.push({
        pts: Math.round(targetPts),
        rms_level: MIN_DB // Use minimum level (silence) for points before first data
      });
      continue;
    }
    
    // Find points to interpolate between for timestamps that exist in our data range
    for (let j = 0; j < originalMap.length - 1; j++) {
      if (originalMap[j].pts <= targetPts && originalMap[j + 1].pts >= targetPts) {
        beforeIndex = j;
        afterIndex = j + 1;
        break;
      }
    }
    
    // Handle edge case for the last point
    if (i === maxBars - 1) {
      processedMap.push({
        pts: endPts,
        rms_level: originalMap[originalMap.length - 1].rms_level
      });
      continue;
    }
    
    // Handle case where targetPts is beyond the last data point
    if (targetPts > originalMap[originalMap.length - 1].pts) {
      processedMap.push({
        pts: Math.round(targetPts),
        rms_level: MIN_DB // Use minimum level for points after last data point
      });
      continue;
    }
    
    // Linear interpolation between the two points
    const beforePoint = originalMap[beforeIndex];
    const afterPoint = originalMap[afterIndex];
    
    // Avoid division by zero
    if (afterPoint.pts === beforePoint.pts) {
      processedMap.push({
        pts: Math.round(targetPts),
        rms_level: beforePoint.rms_level
      });
      continue;
    }
    
    // Calculate the weight for interpolation (0 to 1)
    const weight = (targetPts - beforePoint.pts) / (afterPoint.pts - beforePoint.pts);
    
    // Linear interpolation formula: value = start + weight * (end - start)
    const interpolatedRms = beforePoint.rms_level + weight * (afterPoint.rms_level - beforePoint.rms_level);
    
    processedMap.push({
      pts: Math.round(targetPts),
      rms_level: interpolatedRms
    });
  }
  
  return processedMap;
}

const mapStateToProps = (state: any) => ({
  currentTime: state.engine.currentTime,
  engineDuration: state.engine.duration,

  isDraggingActive: state.seekbar.draggingActive,
  isMobile: state.shell.isMobile
});

export const VolumeMapSeekbar = withText(translates)(
  withEventDispatcher(COMPONENT_NAME)(
    withKeyboardEvent(COMPONENT_NAME)(
      withPlayer(
        connect(
          mapStateToProps,
          bindActions({...shell.actions, ...seekbar.actions, ...overlayAction.actions})
        )(({player, size, engineDuration, currentTime, ...otherProps}: VolumeMapSeekbarProps) => {
          const [originalVolumeMap, setOriginalVolumeMap] = useState<VolumeMapEntry[]>([]);
          const [processedVolumeMap, setProcessedVolumeMap] = useState<VolumeMapEntry[]>([]);
          const canvasRef = useRef<HTMLCanvasElement>(null);
          const containerRef = useRef<HTMLDivElement>(null);
          const [containerWidth, setContainerWidth] = useState<number>(0);

          const duration = (engineDuration || player.sources.duration) as number;
          // @ts-expect-error Property '_uiManager' is private and only accessible within class 'UIWrapper'
          const activeColor = player.ui._uiManager.getCSSVariable('--playkit-tone-1-color') ?? '#FFFFFF';
          const inactiveColor = activeColor ? `${activeColor}80` : '#FFFFFF80';

          // Register keyboard events for accessibility
          useEffect(() => {
            const _keyboardEventHandlers: Array<any> = [
              {
                key: {
                  code: KeyMap.LEFT
                },
                action: (event: KeyboardEvent) => {
                  handleKeydown(event, false);
                }
              },
              {
                key: {
                  code: KeyMap.RIGHT
                },
                action: (event: KeyboardEvent) => {
                  handleKeydown(event, false);
                }
              },
              {
                key: {
                  code: KeyMap.HOME
                },
                action: (event: KeyboardEvent) => {
                  handleKeydown(event, false);
                }
              },
              {
                key: {
                  code: KeyMap.END
                },
                action: (event: KeyboardEvent) => {
                  handleKeydown(event, false);
                }
              }
            ];
            otherProps.registerKeyboardEvents!(_keyboardEventHandlers);
          }, []);

          // Fetch volume map data
          useEffect(() => {
            const audioPlayerPlugin = player.plugins['audioPlayer'] as AudioPlayer | undefined;
            audioPlayerPlugin?.getVolumeMap().then((mapData: VolumeMapEntry[]) => {
              setOriginalVolumeMap(mapData);
            });
          }, []);

          // Resize observer to adjust canvas size based on container width
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
            const barWidth = (canvasWidth - totalGaps * minGap) / numBars;

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
              const actualBarWidth =
                i === numBars - 1
                  ? canvasWidth - x // Make the last bar extend to the edge
                  : barWidth;

              // Draw rectangle
              ctx.fillRect(x, y, actualBarWidth, barHeight);
            }
          }, [processedVolumeMap, duration, currentTime, containerWidth, activeColor, inactiveColor]);

          // Redraw when processed map or other relevant state changes
          useEffect(() => {
            drawWaveform();
          }, [processedVolumeMap, currentTime, duration, containerWidth, drawWaveform]);

          // Player control functions
          const changeCurrentTime = (time: number) => {
            player.currentTime = time;
          };
          const togglePlayPause = (): void => {
            player.paused ? player.play() : player.pause();
          };

          // Get the time from the mouse/touch event
          const getTime = (event: MouseEvent | TouchEvent): number => {
            const canvas = canvasRef.current;
            if (!canvas || !processedVolumeMap.length || !duration || !containerWidth) {
              return 0;
            }

            const clientX = (event as MouseEvent).clientX;
            const xMousePosition = typeof clientX === 'number' ? clientX : (event as TouchEvent)?.changedTouches[0]?.clientX;

            const rect = canvas.getBoundingClientRect();
            const x = xMousePosition - rect.left;
            const numBars = processedVolumeMap.length;

            // Use same calculations as in drawWaveform to determine bar positions
            const minGap = 1;
            const totalGaps = numBars - 1;

            // Calculate bar width to match drawing function (use full width)
            const barWidth = (rect.width - totalGaps * minGap) / numBars;

            // Since we now start at x=0 with no padding, we can directly determine which bar was clicked
            // Each bar+gap unit takes (barWidth + minGap) pixels, except the last bar which may be wider
            const unitWidth = barWidth + minGap;
            let barIndex = Math.floor(x / unitWidth);

            // Ensure index is in valid range
            barIndex = Math.max(0, Math.min(barIndex, numBars - 1));

            const newTime = processedVolumeMap[barIndex].pts / 1000;
            if (isFinite(newTime)) {
              return newTime;
            }
            return 0;
          };

          // Seekbar keyboard event handlers
          const handleKeydown = (event: KeyboardEvent, isAccessibility: boolean): void => {
            const seek = (from: number, to: number) => {
              changeCurrentTime(to);
              otherProps.notifyChange!({
                from: from,
                to: to
              });
            };
            let newTime: number;
            otherProps.updatePlayerHoverState!(true);
            switch (event.keyCode) {
              case KeyMap.LEFT:
                if (!isAccessibility) {
                  otherProps.updateOverlayActionIcon!(IconType.Rewind);
                }
                newTime = currentTime - KEYBOARD_DEFAULT_SEEK_JUMP > 0 ? currentTime - KEYBOARD_DEFAULT_SEEK_JUMP : 0;
                seek(currentTime, newTime);
                break;
              case KeyMap.RIGHT:
                if (!isAccessibility) {
                  otherProps.updateOverlayActionIcon!(IconType.Forward);
                }
                newTime = currentTime + KEYBOARD_DEFAULT_SEEK_JUMP > duration ? duration : currentTime + KEYBOARD_DEFAULT_SEEK_JUMP;
                seek(currentTime, newTime);
                break;
              case KeyMap.HOME:
                if (!isAccessibility) {
                  otherProps.updateOverlayActionIcon!(IconType.StartOver);
                }
                newTime = 0;
                seek(currentTime, newTime);
                break;
              case KeyMap.END:
                if (!isAccessibility) {
                  otherProps.updateOverlayActionIcon!(IconType.SeekEnd);
                }
                newTime = duration;
                seek(currentTime, newTime);
                break;
            }
          };
          const onKeyDown = (e: KeyboardEvent): void => {
            switch (e.keyCode) {
              case KeyMap.LEFT:
              case KeyMap.RIGHT:
                handleKeydown(e, true);
                break;
              case KeyMap.ENTER:
              case KeyMap.SPACE:
                e.preventDefault();
                togglePlayPause();
                break;
            }
          };

          // Seekbar touch event handlers
          const onSeekbarTouchStart = (e: TouchEvent): void => {
            otherProps.updateSeekbarDraggingStatus!(true);
            if (otherProps.isDraggingActive) {
              let time = getTime(e);
              changeCurrentTime(time);
            }
          };
          const onSeekbarTouchMove = (e: TouchEvent): void => {
            let time = getTime(e);
            if (otherProps.isDraggingActive) {
              changeCurrentTime(time);
            }
            e.preventDefault();
          };
          const onSeekbarTouchEnd = (e: TouchEvent): void => {
            if (otherProps.isDraggingActive) {
              let time = getTime(e);
              const oldTime = currentTime;
              const newTime = time;
              changeCurrentTime(newTime);
              otherProps.notifyChange!({
                from: oldTime,
                to: newTime
              });
            }
            otherProps.updateSeekbarDraggingStatus!(false);
          };

          // Seekbar mouse event handlers
          const onSeekbarMouseDown = (e: MouseEvent): void => {
            if (otherProps.isMobile) {
              return;
            }
            e.preventDefault(); // fixes firefox mouseup not firing after dragging the scrubber
            e.stopPropagation(); // prevent other dragging effects
            otherProps.updateSeekbarDraggingStatus!(true);
            let time = getTime(e);
            changeCurrentTime(time);
          };

          // Render fallback when no data or duration is too short
          if (!originalVolumeMap.length) {
            return <AudioSeekbar />;
          }

          const canvasA11yProps = {
            tabIndex: 0,
            role: 'slider',
            'aria-label': otherProps.sliderAriaLabel,
            'aria-valuenow': Math.round(currentTime),
            'aria-valuemin': 0,
            'aria-valuemax': Math.round(duration),
            'aria-valuetext': `${getDurationAsText(currentTime, player.config.ui.locale, true)} ${otherProps.valuetextLabel} ${getDurationAsText(duration, player.config.ui.locale, true)}`
          };
          const canvasEventHandlers = {
            // mouse events
            onMouseDown: onSeekbarMouseDown,
            // keyboard events
            onKeyDown: onKeyDown,
            // touch events
            onTouchStart: onSeekbarTouchStart,
            onTouchMove: onSeekbarTouchMove,
            onTouchEnd: onSeekbarTouchEnd
          };

          return (
            <div ref={containerRef} class={['playkit-nav', styles.volumeMapContainer, styles[size]].join(' ')} data-testid="volume-map-seekbar">
              <canvas
                ref={canvasRef}
                class={styles.volumeMapCanvas}
                style={{height: size === AudioPlayerSizes.Large ? '56px' : '32px'}}
                {...canvasA11yProps}
                {...canvasEventHandlers}
              />
              <div className={styles.timeContainer}>
                <div className={audioSeekbarStyles.currentTime}>{toHHMMSS(currentTime)}</div>
                <div className={audioSeekbarStyles.duration}>{toHHMMSS(duration)}</div>
              </div>
            </div>
          );
        })
      )
    )
  )
);

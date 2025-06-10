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

  withVolumeMapBar?: boolean;

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

const MIN_DB = -100; // dBFS value representing silence (1px height)
const MAX_DB = 0; // dBFS value representing maximum volume (full canvas height)

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
        )(({player, size, engineDuration, currentTime, withVolumeMapBar, ...otherProps}: VolumeMapSeekbarProps) => {
          const [originalVolumeMap, setOriginalVolumeMap] = useState<VolumeMapEntry[]>([]);
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
            // No processing needed anymore - we'll use original data directly
          }, [originalVolumeMap, containerWidth]);

          // Drawing function - uses originalVolumeMap and scales bars based on canvas width
          const drawWaveform = useCallback(() => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx || !originalVolumeMap.length || !duration || !containerWidth) {
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

            const numBars = originalVolumeMap.length;

            // Use fixed dB range from MIN_DB (-100) to MAX_DB (0)
            const dbRange = MAX_DB - MIN_DB; // This will be 100

            const currentTimeMs = currentTime * 1000;

            let currentBarIndex = -1;
            for (let i = 0; i < originalVolumeMap.length; i++) {
              if (originalVolumeMap[i].pts <= currentTimeMs) {
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

              // Normalize using the fixed dB range from MIN_DB (-100) to MAX_DB (0)
              // Clamp the RMS level to the valid range first
              const clampedRms = Math.max(MIN_DB, Math.min(MAX_DB, originalVolumeMap[i].rms_level));
              
              // Map from [MIN_DB, MAX_DB] to [1px, canvasHeight]
              let normalizedLevel = 0;
              if (dbRange > 0) {
                normalizedLevel = (clampedRms - MIN_DB) / dbRange;
              }
              normalizedLevel = Math.max(0, Math.min(1, normalizedLevel)); // Clamp 0-1

              // Scale to canvas height with minimum 1px for silence
              const minBarHeight = 1; // Minimum height for silence (-100 dB)
              const maxBarHeight = canvasHeight; // Maximum height for loudest sound (0 dB)
              let barHeight = minBarHeight + normalizedLevel * (maxBarHeight - minBarHeight);
              
              // Ensure bar height is within bounds and round to integer pixels
              barHeight = Math.round(Math.max(minBarHeight, Math.min(barHeight, maxBarHeight)));
              
              // Ensure bars maintain proper center alignment with minimum 2px difference
              // This ensures bars stay centered by using only odd heights (1px, 3px, 5px, etc.)
              if (barHeight > 1 && barHeight % 2 === 0) {
                barHeight += 1; // Convert even heights to odd heights for perfect centering
              }
              
              // Ensure we don't exceed canvas height after adjustment
              barHeight = Math.min(barHeight, maxBarHeight);

              // Center the bar vertically on the canvas - use integer coordinates for pixel alignment
              const y = Math.floor((canvasHeight - barHeight) / 2);

              ctx.fillStyle = i <= currentBarIndex ? activeColor : inactiveColor;

              // For the last bar, ensure it extends all the way to the edge
              const actualBarWidth =
                i === numBars - 1
                  ? canvasWidth - x // Make the last bar extend to the edge
                  : barWidth;

              // Draw rounded rectangle with 8px border radius
              const borderRadius = 8;
              ctx.beginPath();
              ctx.roundRect(x, y, actualBarWidth, barHeight, borderRadius);
              ctx.fill();
            }
          }, [originalVolumeMap, duration, currentTime, containerWidth, activeColor, inactiveColor]);

          // Redraw when original map or other relevant state changes
          useEffect(() => {
            drawWaveform();
          }, [originalVolumeMap, currentTime, duration, containerWidth, drawWaveform]);

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
            if (!canvas || !originalVolumeMap.length || !duration || !containerWidth) {
              return 0;
            }

            const clientX = (event as MouseEvent).clientX;
            const xMousePosition = typeof clientX === 'number' ? clientX : (event as TouchEvent)?.changedTouches[0]?.clientX;

            const rect = canvas.getBoundingClientRect();
            const x = xMousePosition - rect.left;
            const numBars = originalVolumeMap.length;

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

            const newTime = originalVolumeMap[barIndex].pts / 1000;
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
            return <AudioSeekbar withVolumeMapBar={withVolumeMapBar} size={size} />;
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

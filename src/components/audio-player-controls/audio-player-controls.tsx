import {h, VNode} from 'preact';
import {useRef, useEffect, useState} from 'preact/hooks';
import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './audio-player-controls.scss';
import {LoopButton} from '../loop-button';
import {LiveTagComponent} from '../live-tag';
import {MorePluginsButtonWrapper} from '../plugins';
import {AudioPlayerConfig} from '../../types';
const {Rewind, Forward, PlaylistButton, PlayPause, Volume, SpeedMenu} = ui.Components;
const {
  redux: {useSelector}
} = ui;
const {Event} = ui;

interface AudioPlayerControlsProps {
  pluginConfig: AudioPlayerConfig;
  player: any;
  onPluginsControlClick: () => void;
  showMorePluginsIcon: boolean;
  eventManager: any;
}

export const AudioPlayerControls = Event.withEventManager(({pluginConfig, player, onPluginsControlClick, showMorePluginsIcon, eventManager}: AudioPlayerControlsProps) => {
  const playlist = useSelector((state: any) => state.engine.playlist);
  const ref = useRef<HTMLDivElement>();
  const [currentRate, setCurrentRate] = useState(player.playbackRate);

    useEffect(() => {
      const element = ref.current;
      if (!element || !eventManager) return;
      element.setAttribute('tabindex', '0');

      const handleKeyDown = (event: KeyboardEvent) => {
        if (!Array.isArray(player.playbackRates) || !player.playbackRates.length) return;
        const rates = player.playbackRates;
        const currentIndex = rates.indexOf(player.playbackRate);

        if (event.shiftKey && event.key === '>') {
          event.preventDefault();
          const newIndex = Math.min(currentIndex + 1, rates.length - 1);
          player.playbackRate = rates[newIndex];
          setCurrentRate(rates[newIndex]);
        } else if (event.shiftKey && event.key === '<') {
          event.preventDefault();
          const newIndex = Math.max(currentIndex - 1, 0);
          player.playbackRate = rates[newIndex];
          setCurrentRate(rates[newIndex]);
        }
      };

      eventManager.listen(element, 'keydown', handleKeyDown);
    }, [eventManager, player]);

    const _renderSpeedOptions = (playbackRates: number[]) => {
      return playbackRates.map((speed) => ({
        value: speed,
        label: `${speed}x`,
        active: speed === currentRate
      }));
    };

    const _renderLoopOrSpeedMenuButton = (): VNode<any> | null => {
      if (player.isLive()) {
        return null;
      }
      if (pluginConfig.showReplayButton) {
        return <LoopButton />;
      }
      return (
        <div data-testid="audio-player-speed-menu" className={styles.speedMenuWrapper}>
          <SpeedMenu pushRef={(node: any) => (ref.current = node)} optionsRenderer={_renderSpeedOptions} />
        </div>
      );
    };

    const targetId: HTMLDivElement | Document = (document.getElementById(player.config.targetId) as HTMLDivElement) || document;
    return (
      <div className={styles.playbackControlsWrapper}>
        <LiveTagComponent />
        <div className={styles.playbackControls}>
          <div className={styles.buttonContainer}>{_renderLoopOrSpeedMenuButton()}</div>
          <div className={styles.buttonContainer} data-testid={playlist ? 'audio-player-prev-button' : 'audio-player-rewind-button'}>
            {playlist ? (
              <div>
                <PlaylistButton type="prev" showPreview={false} />
              </div>
            ) : (
              <Rewind
                step={10}
                onToggle={() => {
                  /**/
                }}
              />
            )}
          </div>
          <div className={styles.buttonContainer} data-testid="audio-player-play-button">
            <PlayPause />
          </div>
          <div className={styles.buttonContainer} data-testid={playlist ? 'audio-player-next-button' : 'audio-player-forward-button'}>
            {playlist ? (
              <PlaylistButton type="next" showPreview={false} />
            ) : (
              <Forward
                step={10}
                onToggle={() => {
                  /**/
                }}
              />
            )}
          </div>
          <div className={styles.buttonContainer} data-testid="audio-player-volume-control">
            <Volume horizontal />
          </div>
          {showMorePluginsIcon && <div className={styles.buttonContainer}>
            <MorePluginsButtonWrapper onClick={onPluginsControlClick} />
          </div>}
        </div>
      </div>
    );
  }
);

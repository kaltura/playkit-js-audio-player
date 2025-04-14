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
  const [playbackRateState, setPlaybackRateState] = useState(player.playbackRate);

  useEffect(() => {
    ref.current?.setAttribute('tabindex', '0');
  }, []);
  
  useEffect(() => {
    const element = ref.current;
    if (!element || !eventManager) return;
  
    const handleKeydown = (event: KeyboardEvent) => {  
      const rates = player.playbackRates;
      const index = rates.indexOf(player.playbackRate); 
  
      if (event.shiftKey) {
        let newRate = player.playbackRate;
        switch (event.code) {
          case 'Period':
            if (index < rates.length - 1) newRate = rates[index + 1];
            break;
          case 'Semicolon':
            newRate = player.defaultPlaybackRate;
            break;
          case 'Comma':
            if (index > 0) newRate = rates[index - 1];
            break;
          default:
            return;
        }
  
        player.playbackRate = newRate;
        setPlaybackRateState(newRate);
      }
    };
  
    eventManager.listen(element, 'keydown', handleKeydown);
  }, [eventManager, player]);

  const _renderSpeedOptions = (playbackRates: Array<number>) => {
    return playbackRates.reduce((acc: Array<object>, speed) => {
      const speedOption = {
        value: speed,
        label: `${speed}x`,
        active: speed === playbackRateState
      };
      return [...acc, speedOption];
    }, []);
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
});


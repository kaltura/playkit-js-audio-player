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

interface AudioPlayerControlsProps {
  pluginConfig: AudioPlayerConfig;
  player: any;
  onPluginsControlClick: () => void;
  showMorePluginsIcon: boolean;
}

const AudioPlayerControls = ({pluginConfig, player, onPluginsControlClick, showMorePluginsIcon}: AudioPlayerControlsProps) => {
  const playlist = useSelector((state: any) => state.engine.playlist);
  const ref = useRef<HTMLDivElement>();
  const [selectedSpeedIndex, setSelectedSpeedIndex] = useState(1);
  const speedValuesArray: Array<number> = [];

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.setAttribute('tabindex', '0');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!speedValuesArray.length) return;

      if (event.shiftKey && event.key === '>') {
        event.preventDefault();
        setSelectedSpeedIndex(prev => {
          const newIndex = Math.min(prev + 1, speedValuesArray.length - 1);
          player.playbackRate = speedValuesArray[newIndex];
          return newIndex;
        });
      } else if (event.shiftKey && event.key === '<') {
        event.preventDefault();
        setSelectedSpeedIndex(prev => {
          const newIndex = Math.max(prev - 1, 0);
          player.playbackRate = speedValuesArray[newIndex];
          return newIndex;
        });
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [speedValuesArray]);

  const _renderSpeedOptions = (playbackRates: Array<number>) => {
    speedValuesArray.length = 0;
    return playbackRates.reduce((acc: Array<object>, speed) => {
      speedValuesArray.push(speed);
      const speedOption = {
        value: speed,
        label: `${speed}x`,
        active: speed === player.playbackRate
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
};

export {AudioPlayerControls};

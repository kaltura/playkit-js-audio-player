import {useRef, useEffect} from 'preact/hooks';
import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './audio-player-controls.scss';
import {AudioPlayerConfig} from '../../types';
import {LoopButton} from '../loop-button';
import {LiveTagComponent} from '../live-tag';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const {Rewind, Forward, PlaylistButton, PlayPause, Volume, LiveTag, SpeedMenu} = ui.Components;
const {
  redux: {useSelector}
} = ui;

interface AudioPlayerControlsProps {
  pluginConfig: AudioPlayerConfig;
  player: any;
}

const AudioPlayerControls = ({pluginConfig, player}: AudioPlayerControlsProps) => {
  const playlist = useSelector((state: any) => state.engine.playlist);
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    ref.current?.setAttribute('tabindex', '0');
  }, []);

  const _renderSpeedOptions = (playbackRates: Array<number>) => {
    return playbackRates.reduce((acc: Array<object>, speed) => {
      const speedOption = {
        value: speed,
        label: `${speed}x`,
        active: speed === player.playbackRate
      };
      return [...acc, speedOption];
    }, []);
  };

  const _renderLoopOrSpeedMenuButton = () => {
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

  return (
    <div className={styles.playbackControlsWrapper}>
      <LiveTagComponent />
      <div className={styles.playbackControls}>
        <div className={styles.buttonContainer}>{_renderLoopOrSpeedMenuButton()}</div>
        <div className={styles.buttonContainer} data-testid={playlist ? 'audio-player-prev-button' : 'audio-player-revind-button'}>
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
      </div>
    </div>
  );
};

export {AudioPlayerControls};

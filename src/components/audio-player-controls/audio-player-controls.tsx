import {useRef, useEffect} from 'preact/hooks';
import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './audio-player-controls.scss';
import {AudioPlayerConfig} from '../../types';
import {LoopButton} from '../loop-button';

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
  const playbackStarted = useSelector((state: any) => state.engine.isPlaybackStarted);
  const playbackEnded = useSelector((state: any) => state.engine.isPlaybackEnded);
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

  const _renderLiveTag = () => {
    if (player.isLive() && playbackStarted && !playbackEnded) {
      return <LiveTag />;
    }
    return null;
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
      {_renderLiveTag()}
      <div className={styles.playbackControls}>
        {_renderLoopOrSpeedMenuButton()}
        {playlist ? (
          <div data-testid="audio-player-prev-button">
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
        <div data-testid="audio-player-play-button">
          <PlayPause />
        </div>
        {playlist ? (
          <div data-testid="audio-player-next-button">
            <PlaylistButton type="next" showPreview={false} />
          </div>
        ) : (
          <Forward
            step={10}
            onToggle={() => {
              /**/
            }}
          />
        )}
        <Volume horizontal />
      </div>
    </div>
  );
};

export {AudioPlayerControls};

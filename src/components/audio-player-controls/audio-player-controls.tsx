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
  return (
    <div className={styles.playbackControlsWrapper}>
      {_renderLiveTag()}
      <div className={styles.playbackControls}>
        {pluginConfig.showReplayButton || player.isLive() ? (
          <LoopButton />
        ) : (
          <div className={styles.speedMenuWrapper}>
            <SpeedMenu pushRef={(node: any) => (ref.current = node)} optionsRenderer={_renderSpeedOptions} />
          </div>
        )}
        {playlist ? (
          <PlaylistButton type="prev" showPreview={false} />
        ) : (
          <Rewind
            step={10}
            onToggle={() => {
              /**/
            }}
          />
        )}
        <PlayPause />
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
        <Volume horizontal />
      </div>
    </div>
  );
};

export {AudioPlayerControls};

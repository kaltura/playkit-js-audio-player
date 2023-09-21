import {h} from 'preact';
import {KalturaPlayer, ui} from '@playkit-js/kaltura-player-js';
import * as styles from './audio-player-controls.scss';
import {AudioPlayerConfig} from '../../types';

//@ts-ignore
const {Rewind, Forward, PlaylistButton, PlayPause, Volume, LiveTag, SpeedMenu, withPlayer} = ui.Components;
const {
  redux: {useSelector}
} = ui;

interface AudioPlayerControlsProps {
  pluginConfig: AudioPlayerConfig;
  player: any;
}

const AudioPlayerControls = withPlayer(({pluginConfig, player}: AudioPlayerControlsProps) => {
  const playlist = useSelector((state: any) => state.engine.playlist);

  const _renderSpeedOptons = (playbackRates: Array<number>) => {
    return playbackRates.reduce((acc: Array<{}>, speed) => {
      const speedOption = {
        value: speed,
        label: `${speed}x`,
        active: speed === player.playbackRate
      };
      return [...acc, speedOption];
    }, []);
  };
  return (
    <div className={styles.playbackControlsWrapper}>
      {player.isLive() && <LiveTag />}
      <div className={styles.playbackControls}>
        {pluginConfig.showReplayButton ? (
          <Rewind step={10} />
        ) : (
          <div className={styles.speedMenuWrapper}>
            <SpeedMenu pushRef={() => null} optionsRenderer={_renderSpeedOptons} />
          </div>
        )}
        {playlist ? <PlaylistButton type="prev" showPreview={false} /> : <Rewind step={10} />}
        <PlayPause />
        {playlist ? <PlaylistButton type="next" showPreview={false} /> : <Forward step={10} />}
        <Volume horizontal />
      </div>
    </div>
  );
});

export {AudioPlayerControls};

import {h} from 'preact';
import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './audio-player-controls.scss';
import {AudioPlayerConfig} from '../../types';

//@ts-ignore
const {Rewind, Forward, PlaylistButton, PlayPause, Volume} = ui.Components;
const {
  redux: {useSelector}
} = ui;

interface AudioPlayerControlsProps {
  pluginConfig: AudioPlayerConfig;
}

const AudioPlayerControls = ({pluginConfig}: AudioPlayerControlsProps) => {
  const playlist = useSelector((state: any) => state.engine.playlist);
  return (
    <div className={styles.playbackContlolsWrapper}>
      {playlist ? <PlaylistButton type="prev" showPreview={false} /> : <Rewind step={10} />}
      <PlayPause />
      {playlist ? <PlaylistButton type="next" showPreview={false} /> : <Forward step={10} />}
      <Volume horizontal />
    </div>
  );
};

export {AudioPlayerControls};

import * as styles from './audio-player-view.scss';

import {ui} from '@playkit-js/kaltura-player-js';
const {connect} = ui.redux;

import {AudioSeekbar} from '../audio-seekbar';
import {AudioPlayerControls} from '../audio-player-controls';
import {AudioPlayerConfig} from '../../types';

const {PLAYER_SIZE} = ui.Components;

const mapStateToProps = (state: any) => {
  const {shell} = state;

  let sizeClass = '';
  switch (shell.playerSize) {
    case PLAYER_SIZE.EXTRA_LARGE:
    case PLAYER_SIZE.LARGE:
    case PLAYER_SIZE.MEDIUM: {
      sizeClass = styles.medium;
      break;
    }
    case PLAYER_SIZE.SMALL: {
      sizeClass = styles.small;
      break;
    }
    case PLAYER_SIZE.EXTRA_SMALL: {
      sizeClass = styles.extraSmall;
      break;
    }
    default: {
      break;
    }
  }

  return {
    sizeClass
  };
};

interface AudioPlayerViewProps {
  sizeClass?: string;
  pluginConfig: AudioPlayerConfig;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const AudioPlayerView = connect(mapStateToProps)(({sizeClass, pluginConfig, live}: AudioPlayerViewProps) => {
  return (
    <div className={`${styles.audioPlayerView} ${sizeClass}`} style="position: relative; background-color: red">
      <AudioSeekbar />
      <AudioPlayerControls pluginConfig={pluginConfig} />
    </div>
  );
});

AudioPlayerView.displayName = 'AudioPlayer';

export {AudioPlayerView};

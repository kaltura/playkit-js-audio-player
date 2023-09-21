import * as styles from './audio-player-view.scss';

import {ui} from '@playkit-js/kaltura-player-js';
const {connect} = ui.redux;

import {AudioSeekbar} from '../audio-seekbar';
import {AudioPlayerControls} from '../audio-player-controls';

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
  poster?: string;
  sizeClass?: string;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const AudioPlayerView = connect(mapStateToProps)(({sizeClass, poster}: AudioPlayerViewProps) => {
  return (
    <div className={`${styles.audioPlayerView} ${sizeClass}`}>
      <div>{poster ? <img src={poster} /> : undefined}</div>
      <AudioSeekbar />
      <AudioPlayerControls pluginConfig={{}} />
    </div>
  );
});

export {AudioPlayerView};

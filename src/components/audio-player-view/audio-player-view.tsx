import {AudioPlayerControls, AudioSeekbar} from '..';
import {AudioPlayerConfig} from '../../types';
import * as styles from './audio-player-view.scss';

import {ui} from '@playkit-js/kaltura-player-js';
const {connect} = ui.redux;

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
  title?: string;
  description?: string;
  sizeClass?: string;
  pluginConfig: AudioPlayerConfig;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const AudioPlayerView = connect(mapStateToProps)(({sizeClass, poster, title, description, pluginConfig}: AudioPlayerViewProps) => {
  if (sizeClass === styles.extraSmall) {
    return (
      <div className={`${styles.audioPlayerView} ${sizeClass}`}>
        <div className={styles.topControls}>
          <div className={styles.leftControls}>{poster ? <img src={poster} /> : undefined}</div>
          <div className={styles.rightControls}>
            <div className={styles.audioPlayerDetails}>
              <div className={styles.header}>
                <div className={styles.audioIcon}>[Icon]</div>
                <div className={styles.title}>{title}</div>
              </div>
              <div className={styles.description}>{description}</div>
            </div>
          </div>
        </div>
        <div className={styles.bottomControls}>
          <AudioSeekbar />
          <AudioPlayerControls pluginConfig={pluginConfig} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.audioPlayerView} ${sizeClass}`}>
      <div className={styles.leftControls}>{poster ? <img src={poster} /> : undefined}</div>
      <div className={styles.rightControls}>
        <div className={styles.topControls}>
          <div className={styles.audioPlayerDetails}>
            <div className={styles.header}>
              <div className={styles.audioIcon}>[Icon]</div>
              <div className={styles.title}>{title}</div>
            </div>
            <div className={styles.description}>{description || ''}</div>
          </div>
        </div>
        <div className={styles.bottomControls}>
          <AudioSeekbar />
          <AudioPlayerControls pluginConfig={pluginConfig} />
        </div>
      </div>
    </div>
  );
});

export {AudioPlayerView};

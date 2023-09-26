import {Fragment} from 'preact';
import {AudioPlayerControls, AudioSeekbar} from '..';
import {AudioPlayerConfig} from '../../types';
import * as styles from './audio-player-view.scss';
import {ErrorSlate} from '../error-slate';

import {ui} from '@playkit-js/kaltura-player-js';
const {connect} = ui.redux;

const {PLAYER_SIZE} = ui.Components;

const mapStateToProps = (state: any) => {
  const {shell, engine} = state;

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
    sizeClass,
    hasError: engine.hasError
  };
};

interface AudioPlayerViewProps {
  poster?: string;
  title?: string;
  description?: string;
  sizeClass?: string;
  hasError?: boolean;
  pluginConfig: AudioPlayerConfig;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const AudioPlayerView = connect(mapStateToProps)(({sizeClass, poster, title, description, pluginConfig, hasError}: AudioPlayerViewProps) => {
  const _renderErrorSlate = () => {
    return <ErrorSlate />;
  };

  const _renderView = () => {
    if (sizeClass === styles.extraSmall) {
      return (
        <Fragment>
          <div className={styles.topControls}>
            <div className={styles.leftControls}>{poster ? <img src={poster} className={styles.poster} /> : undefined}</div>
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
        </Fragment>
      );
    }
    return (
      <Fragment>
        <div className={styles.leftControls}>{poster ? <img src={poster} className={styles.poster} /> : undefined}</div>
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
      </Fragment>
    );
  };

  return <div className={`${styles.audioPlayerView} ${sizeClass}`}>{hasError ? _renderErrorSlate() : _renderView()}</div>;
});

export {AudioPlayerView};

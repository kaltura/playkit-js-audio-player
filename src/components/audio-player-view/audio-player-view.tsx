import {Fragment} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {
  AudioIcon,
  AudioPlayerControls,
  AudioSeekbar,
  ControlsPlaceholder,
  SeekbarPlaceholder,
  ThumbPlaceholder,
  SmallDetailsPlaceholder,
  LargeDetailsPlaceholder
} from '..';
import {AudioPlayerConfig} from '../../types';
import * as styles from './audio-player-view.scss';
import {ErrorSlate} from '../error-slate';

import {ui} from '@playkit-js/kaltura-player-js';
const {connect} = ui.redux;

const {PLAYER_SIZE} = ui.Components;

const mapStateToProps = (state: any) => {
  const {shell, engine} = state;
  const {isPlaying, hasError} = engine;

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
    isPlaying,
    hasError
  };
};

interface AudioPlayerViewProps {
  poster?: string;
  title?: string;
  description?: string;
  sizeClass?: string;
  isPlaying?: boolean;
  hasError?: boolean;
  pluginConfig: AudioPlayerConfig;
  ready: Promise<any>;
}

const AudioPlayerView = connect(mapStateToProps)(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ({sizeClass, isPlaying = false, poster, title, description, pluginConfig, hasError, ready}: AudioPlayerViewProps) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      ready.then(() => {
        setLoading(false);
      });
    }, [ready]);

    const _renderPoster = () => {
      if (loading) {
        return <ThumbPlaceholder />;
      }
      return poster ? <img src={poster} className={styles.poster} /> : null;
    };

    const _renderAudioDetails = () => {
      if (loading) {
        return sizeClass === styles.extraSmall ? <SmallDetailsPlaceholder /> : <LargeDetailsPlaceholder />;
      }
      return (
        <Fragment>
          <div className={styles.header}>
            <div className={styles.audioIconContainer}>
              <AudioIcon isLarge={sizeClass === styles.medium} isActive={isPlaying} />
            </div>
            <div className={styles.title}>{title}</div>
          </div>
          <div className={styles.description}>{description || ''}</div>
        </Fragment>
      );
    };

    const _renderSeekBar = () => {
      return loading ? <SeekbarPlaceholder /> : <AudioSeekbar />;
    };

    const _renderPlayerControls = () => {
      return loading ? <ControlsPlaceholder /> : <AudioPlayerControls pluginConfig={pluginConfig} />;
    };

    const _renderView = () => {
      if (sizeClass === styles.extraSmall) {
        return (
          <Fragment>
            <div className={styles.topControls}>
              <div className={styles.leftControls}>{_renderPoster()}</div>
              <div className={styles.rightControls}>
                <div className={styles.audioPlayerDetails}>{_renderAudioDetails()}</div>
              </div>
            </div>
            <div className={styles.bottomControls}>
              {_renderSeekBar()}
              {_renderPlayerControls()}
            </div>
          </Fragment>
        );
      }
      return (
        <Fragment>
          <div className={styles.leftControls}>{_renderPoster()}</div>
          <div className={styles.rightControls}>
            <div className={styles.topControls}>
              <div className={styles.audioPlayerDetails}>{_renderAudioDetails()}</div>
            </div>
            <div className={styles.bottomControls}>
              {_renderSeekBar()}
              {_renderPlayerControls()}
            </div>
          </div>
        </Fragment>
      );
    };

    return <div className={`${styles.audioPlayerView} ${sizeClass}`}>{hasError ? <ErrorSlate /> : _renderView()}</div>;
  }
);

export {AudioPlayerView};

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
const {
  redux: {connect},
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  reducers: {shell}
} = ui;
const {withText, Text} = ui.preacti18n;
const {PLAYER_SIZE} = ui.Components;

const AUDIO_PLAYER_CLASSNAME = 'audio-player';

const mapStateToProps = (state: any) => {
  const {shell, engine} = state;
  const {isPlaying, hasError, isPlaybackStarted} = engine;

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
    isPlaybackStarted,
    hasError
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    addPlayerClass: () => dispatch(shell.actions.addPlayerClass(AUDIO_PLAYER_CLASSNAME)),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    removePlayerClass: () => dispatch(shell.actions.removePlayerClass(AUDIO_PLAYER_CLASSNAME))
  };
};

interface AudioPlayerViewProps {
  poster?: string;
  title?: string;
  description?: string;
  sizeClass?: string;
  isPlaying?: boolean;
  isPlaybackStarted?: boolean;
  hasError?: boolean;
  pluginConfig: AudioPlayerConfig;
  ready: Promise<any>;
  mediaThumb?: string;
  addPlayerClass?: () => void;
  removePlayerClass?: () => void;
}

const translates = {
  mediaThumb: <Text id="audioPlayer.mediaThumb">Media thumbnail</Text>
};

const AudioPlayerView = withText(translates)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ({
      sizeClass,
      isPlaying = false,
      isPlaybackStarted = false,
      poster,
      title,
      description,
      pluginConfig,
      hasError,
      ready,
      mediaThumb,
      addPlayerClass,
      removePlayerClass
    }: AudioPlayerViewProps) => {
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        addPlayerClass!();
        return () => {
          removePlayerClass!();
        };
      }, []);

      useEffect(() => {
        ready.then(() => {
          setLoading(false);
        });
      }, [ready]);

      const _renderPoster = () => {
        if (loading) {
          return <ThumbPlaceholder />;
        }
        return poster ? <img src={poster} className={styles.poster} alt={mediaThumb} /> : null;
      };

      const _renderAudioDetails = () => {
        if (loading) {
          return [styles.extraSmall, styles.small].includes(sizeClass) ? <SmallDetailsPlaceholder /> : <LargeDetailsPlaceholder />;
        }
        return (
          <Fragment>
            <div className={styles.header}>
              <div className={styles.audioIconContainer}>
                {isPlaybackStarted ? <AudioIcon isLarge={sizeClass === styles.medium} isActive={isPlaying} /> : undefined}
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
                  <div className={styles.audioPlayerDetails} tabIndex={0}>
                    {_renderAudioDetails()}
                  </div>
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
                <div className={styles.audioPlayerDetails} tabIndex={0}>
                  {_renderAudioDetails()}
                </div>
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
  )
);

export {AudioPlayerView};

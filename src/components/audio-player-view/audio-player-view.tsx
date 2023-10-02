import {Fragment} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {
  AudioPlayerControls,
  AudioSeekbar,
  ControlsPlaceholder,
  SeekbarPlaceholder,
  ThumbPlaceholder,
  SmallDetailsPlaceholder,
  LargeDetailsPlaceholder,
  AudioDetails
} from '..';
import {AudioPlayerConfig, AudioPlayerSizes} from '../../types';
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
// @ts-ignore
const {PLAYER_SIZE} = ui.Components;

const AUDIO_PLAYER_CLASSNAME = 'audio-player';

const mapStateToProps = (state: any) => {
  const {shell, engine} = state;
  const {hasError} = engine;

  let size = '';
  switch (shell.playerSize) {
    case PLAYER_SIZE.EXTRA_LARGE:
    case PLAYER_SIZE.LARGE: {
      size = AudioPlayerSizes.Medium;
      break;
    }
    case PLAYER_SIZE.SMALL:
    case PLAYER_SIZE.MEDIUM: {
      size = AudioPlayerSizes.Small;
      break;
    }
    case PLAYER_SIZE.EXTRA_SMALL:
    case PLAYER_SIZE.TINY: {
      size = AudioPlayerSizes.XSmall;
      break;
    }
    default: {
      break;
    }
  }

  return {
    size,
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
  size?: AudioPlayerSizes;
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
    ({size, poster, title, description = '', pluginConfig, hasError, ready, mediaThumb, addPlayerClass, removePlayerClass}: AudioPlayerViewProps) => {
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
          return [AudioPlayerSizes.XSmall, AudioPlayerSizes.Small].includes(size!) ? <SmallDetailsPlaceholder /> : <LargeDetailsPlaceholder />;
        }
        return <AudioDetails title={title} description={description} size={size!} />;
      };

      const _renderSeekBar = () => {
        return loading ? <SeekbarPlaceholder /> : <AudioSeekbar />;
      };

      const _renderPlayerControls = () => {
        return loading ? <ControlsPlaceholder /> : <AudioPlayerControls pluginConfig={pluginConfig} />;
      };

      const _renderView = () => {
        if (size === AudioPlayerSizes.XSmall) {
          return (
            <Fragment>
              <div className={styles.topControls}>
                <div className={styles.leftControls}>{_renderPoster()}</div>
                <div className={styles.rightControls}>{_renderAudioDetails()}</div>
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
              <div className={styles.topControls}>{_renderAudioDetails()}</div>
              <div className={styles.bottomControls}>
                {_renderSeekBar()}
                {_renderPlayerControls()}
              </div>
            </div>
          </Fragment>
        );
      };

      return <div className={`${styles.audioPlayerView} ${styles[size!]}`}>{hasError ? <ErrorSlate /> : _renderView()}</div>;
    }
  )
);

export {AudioPlayerView};

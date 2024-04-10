import {Fragment} from 'preact';
import {useState, useEffect} from 'preact/hooks';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {ui, core} from '@playkit-js/kaltura-player-js';
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
import {AudioPlayerConfig, AudioPlayerSizes, MediaMetadata} from '../../types';
import * as styles from './audio-player-view.scss';
import {ErrorSlate} from '../error-slate';
import {PluginsMenuOverlay} from '../plugins';

// @ts-ignore
const {withPlayer} = ui.Components;

const {
  redux: {connect},
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  reducers: {shell},
  Event
} = ui;
const {withText, Text} = ui.preacti18n;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
      size = AudioPlayerSizes.Large;
      break;
    }
    case PLAYER_SIZE.SMALL:
    case PLAYER_SIZE.MEDIUM: {
      size = AudioPlayerSizes.Medium;
      break;
    }
    case PLAYER_SIZE.EXTRA_SMALL:
    case PLAYER_SIZE.TINY: {
      size = AudioPlayerSizes.Small;
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
  size: AudioPlayerSizes;
  isPlaying?: boolean;
  isPlaybackStarted?: boolean;
  hasError?: boolean;
  pluginConfig: AudioPlayerConfig;
  player: any;
  eventManager: any;
  mediaThumb?: string;
  addPlayerClass?: () => void;
  removePlayerClass?: () => void;
}

const translates = {
  mediaThumb: <Text id="audioPlayer.mediaThumb">Media thumbnail</Text>
};

const AudioPlayerView = Event.withEventManager(
  withPlayer(
    withText(translates)(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ({size, pluginConfig, hasError, mediaThumb, addPlayerClass, removePlayerClass, player, eventManager}: AudioPlayerViewProps) => {
          const [mediaMetadata, setMediaMetadata] = useState<MediaMetadata | null>(null);
          const [imageHasError, setImageHasError] = useState(false);
          const isLoading = !mediaMetadata;
          const {poster, title, description} = mediaMetadata || {};
          const [showPluginsMenuOverlay, seShowPluginsMenuOverlay] = useState(false);
          const [wasPlaying, setWasPlaying] = useState(false);

          useEffect(() => {
            addPlayerClass!();
            eventManager.listen(player, core.EventType.CHANGE_SOURCE_ENDED, _handleMediaMetadata);
            eventManager.listen(player, core.EventType.PLAYER_RESET, _handleMediaMetadataReset);
            return () => {
              removePlayerClass!();
            };
          }, []);

          const _handleMediaMetadataReset = () => {
            setMediaMetadata(null);
          };

          const _handleMediaMetadata = () => {
            const poster = player.sources.poster;
            const title = player.sources.metadata?.name || '';
            const description = player.sources.metadata?.description || '';
            setMediaMetadata({
              poster,
              title,
              description
            });
          };

          const _renderPoster = () => {
            if (isLoading) {
              return <ThumbPlaceholder animate={true} />;
            }
            if (!poster || imageHasError) {
              return <ThumbPlaceholder animate={false} />;
            }

            return (
              <img
                data-testid="audio-player-thumbnail"
                src={poster}
                className={styles.poster}
                alt={mediaThumb}
                onError={() => setImageHasError(true)}
              />
            );
          };

          const openOverlay = () => {
            if (!player.paused) {
              player.pause();
              setWasPlaying(true);
            }
            seShowPluginsMenuOverlay(true);
          };
          const closeOverlay = () => {
            if (wasPlaying) player.play();
            setWasPlaying(false);
            seShowPluginsMenuOverlay(false);
          };

          const _renderAudioDetails = () => {
            if (isLoading) {
              return [AudioPlayerSizes.Small, AudioPlayerSizes.Medium].includes(size!) ? <SmallDetailsPlaceholder /> : <LargeDetailsPlaceholder />;
            }
            return <AudioDetails title={title} description={description} size={size!} />;
          };

          const _renderSeekBar = () => {
            return isLoading ? <SeekbarPlaceholder /> : <AudioSeekbar eventManager={eventManager} />;
          };

          const _renderPlayerControls = () => {
            return isLoading ? (
              <ControlsPlaceholder />
            ) : (
              <AudioPlayerControls pluginConfig={pluginConfig} player={player} onPluginsControlClick={openOverlay} />
            );
          };

          const _renderView = () => {
            if (size === AudioPlayerSizes.Small) {
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
              // <PlayerArea name={'GuiArea'}>
              <Fragment>
                {size === AudioPlayerSizes.Large && poster ? (
                  <div data-testid="audio-player-background-image" style={{backgroundImage: `url(${poster})`}} className={styles.backgroundImage} />
                ) : null}
                <div className={styles.leftControls}>{_renderPoster()}</div>
                <div className={styles.rightControls}>
                  <div className={styles.topControls}>{_renderAudioDetails()}</div>
                  <div className={styles.bottomControls}>
                    {_renderSeekBar()}
                    {_renderPlayerControls()}
                  </div>
                </div>
              </Fragment>
              // </PlayerArea>
            );
          };

          return (
            <div data-testid="audio-player-view" className={`${styles.miniAudioPlayerView} ${styles[size!]}`}>
              {hasError ? <ErrorSlate /> : _renderView()}
              {showPluginsMenuOverlay && (
                // @ts-ignore
                <PluginsMenuOverlay
                  poster={player.sources.poster}
                  playerContainerId={player.config.targetId}
                  onClose={closeOverlay}
                  player={player}
                  size={size}
                />
              )}
            </div>
          );
        }
      )
    )
  )
);

export {AudioPlayerView};

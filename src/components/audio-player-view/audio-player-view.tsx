import {h, Fragment} from 'preact';
import {useState, useEffect, useLayoutEffect} from 'preact/hooks';
import {ui, core, KalturaPlayer} from '@playkit-js/kaltura-player-js';
import {FakeEvent} from '@playkit-js/playkit-js';
import {AUDIO_PLAYER_VISUALIZATION_STATE} from '../../events/events';
import {
  AudioPlayerControls,
  VolumeMapSeekbar,
  ControlsPlaceholder,
  SeekbarPlaceholder,
  ThumbPlaceholder,
  SmallDetailsPlaceholder,
  LargeDetailsPlaceholder,
  AudioDetails
} from '..';
import {AudioPlayerSizes, MediaMetadata, AudioPlayerConfig} from '../../types';
import * as styles from './audio-player-view.scss';
import {ErrorSlate} from '../error-slate';
import {PluginsMenuOverlay} from '../plugins';
import {usePluginsManager} from '../plugins/audio-plugins-manager/use-plugins-manager';

// @ts-ignore
const {withPlayer} = ui.Components;

const {
  redux: {connect},
  reducers: {shell},
  Event
} = ui;
const {withText, Text} = ui.preacti18n;
const {PLAYER_SIZE} = ui.Components;

const AUDIO_PLAYER_CLASSNAME = 'audio-player';

const mapStateToProps = (state: any) => {
  const {shell, engine, overlay} = state;
  const {hasError, isPlaying} = engine;

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
    hasError,
    isPlaying,
    overlayOpen: overlay.isOpen
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
  player: KalturaPlayer;
  overlayOpen: boolean;
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
      )(({size, overlayOpen, isPlaying, hasError, mediaThumb, addPlayerClass, removePlayerClass, player, eventManager}: AudioPlayerViewProps) => {
        const [mediaMetadata, setMediaMetadata] = useState<MediaMetadata | null>(null);
        const [imageHasError, setImageHasError] = useState(false);
        const isLoading = !mediaMetadata;
        const {poster, title, description} = mediaMetadata || {};
        const [showPluginsMenuOverlay, setShowPluginsMenuOverlay] = useState(false);
        const [wasPlaying, setWasPlaying] = useState(false);

        const availablePlugins = usePluginsManager(player.getService('AudioPluginsManager'));
        // @ts-expect-error - TS2445: Property config is protected and only accessible within class BasePlugin and its subclasses.
        const pluginConfig: AudioPlayerConfig = player.plugins['audioPlayer'].config;
        const showMorePluginsIcon: boolean = availablePlugins.length > 0;

        useLayoutEffect(() => {
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

        useEffect(() => {
          if (overlayOpen) {
            if (isPlaying) {
              player.pause();
              setWasPlaying(true);
            }
          } else {
            if (wasPlaying) player.play();
            setWasPlaying(false);
          }
        }, [isPlaying, overlayOpen]);

        const openOverlay = () => {
          setShowPluginsMenuOverlay(true);
        };
        const closeOverlay = () => {
          setShowPluginsMenuOverlay(false);
        };

        const _renderAudioDetails = () => {
          if (isLoading) {
            return [AudioPlayerSizes.Small, AudioPlayerSizes.Medium].includes(size!) ? <SmallDetailsPlaceholder /> : <LargeDetailsPlaceholder />;
          }
          return <AudioDetails title={title} description={description} size={size!} withVolumeMapBar={pluginConfig.useVolumeMapBar}/>;
        };

        const _renderSeekBar = () => {
          return isLoading ? <SeekbarPlaceholder /> : <VolumeMapSeekbar size={size} withVolumeMapBar={pluginConfig.useVolumeMapBar}/>;
        };

        const _renderPlayerControls = () => {
          return isLoading ? (
            <ControlsPlaceholder />
          ) : (
            <AudioPlayerControls
              pluginConfig={pluginConfig}
              player={player}
              onPluginsControlClick={openOverlay}
              showMorePluginsIcon={showMorePluginsIcon}
              size={size}
            />
          );
        };

        const _renderView = () => {
          // event to notify about visualization state
          player.dispatchEvent(
            new FakeEvent(AUDIO_PLAYER_VISUALIZATION_STATE, {
              state: pluginConfig.useVolumeMapBar ? 'enabled' : 'disabled',
              size
            })
          );
          if (size === AudioPlayerSizes.Small) {
            return (
              !overlayOpen && (
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
              )
            );
          }
          return (
            <Fragment>
              {size === AudioPlayerSizes.Large && poster ? (
                <div data-testid="audio-player-background-image" style={{backgroundImage: `url(${poster})`}} className={styles.backgroundImage} />
              ) : null}
              {!overlayOpen && (
                <>
                  <div className={styles.leftControls}>{_renderPoster()}</div>
                  <div className={styles.rightControls}>
                    <div className={styles.topControls}>{_renderAudioDetails()}</div>
                    <div className={styles.bottomControls}>
                      {_renderSeekBar()}
                      {_renderPlayerControls()}
                    </div>
                  </div>
                </>
              )}
            </Fragment>
          );
        };

        const pluginClassNames = [styles.miniAudioPlayerView, styles[size!], pluginConfig.useVolumeMapBar ? styles.withVolumeMapBar : ''];

        return (
          <div data-testid="audio-player-view" className={pluginClassNames.join(' ')}>
            {hasError ? <ErrorSlate /> : _renderView()}
            {showPluginsMenuOverlay && <PluginsMenuOverlay plugins={availablePlugins} onClose={closeOverlay} />}
          </div>
        );
      })
    )
  )
);

export {AudioPlayerView};

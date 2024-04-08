import {Fragment, h, Component, VNode} from 'preact';
import {ui} from '@playkit-js/kaltura-player-js';
import { PluginsMenuOverlay } from "../components/plugins-menu-overlay";
// @ts-ignore
const {
  PlayerArea,
  withPlayerPreset,
  Loading,
  Fullscreen,
  VrStereo,
  BottomBar,
  OverlayPortal,
  UnmuteIndication,
  Watermark,
  Cast,
  CastBeforePlay,
  PlaybackControls,
  TopBar,
  Logo,
  InteractiveArea,
  withKeyboardEvent,
  VideoArea,
  GuiArea
} = ui.Components;

const {style} = ui

// @ts-ignore
const PRESET_NAME = 'BulbulUI';

/**
 * Playback ui interface component
 *
 * @export
 * @param {*} props component props
 * @returns {React$Element} player ui tree
 */
@withPlayerPreset({
  allowSidePanels: true,
  allowPlayerArea: true
})
@withKeyboardEvent(PRESET_NAME)
class BulbulUI extends Component<any, any> {
  /**
   * @returns {void}
   */
  componentDidMount(): void {
    const props = this.props;
    props.updateIsKeyboardEnabled(true);
  }

  /**
   * render component
   *
   * @returns {React$Element} - component element
   * @memberof PlaybackUI
   */
  render() {
    return (
      <div className={style.playbackGuiWrapper}>
        <PlayerArea name={'PresetArea'}>
          <div className={style.playerGui} id="player-gui">
            <VideoArea />
            <GuiArea>
              <Fragment>
                <UnmuteIndication />
                <Loading />
                <OverlayPortal />
                <PlaybackControls name={'OverlayPlaybackControls'} className={style.centerPlaybackControls} />
                <CastBeforePlay />
              </Fragment>
              {() => (
                <Fragment>
                  <TopBar />
                  <InteractiveArea>
                    <Watermark />
                  </InteractiveArea>
                  {/*<>{true && <PluginsMenuOverlay poster={'this.props.player.sources.poster'}/>}</>*/}
                  <BottomBar rightControls={[VrStereo, Cast, Fullscreen, Logo]} leftControls={[]} />
                </Fragment>
              )}
            </GuiArea>
          </div>
        </PlayerArea>
      </div>
    );
  }
}

BulbulUI.displayName = PRESET_NAME;

/**
 * Playback ui interface
 *
 * @export
 * @param {*} props component props
 * @returns {React$Element} player ui tree
 */
export function bulbulUI(props: any): VNode<any> {
  return <BulbulUI {...props} />;
}

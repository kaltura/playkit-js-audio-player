
interface AudioPlayerProps {
  config: any;
  player: any;
}


import {ui} from '@playkit-js/kaltura-player-js';

//@ts-ignore
const {PlayerArea, withPlayerPreset, withKeyboardEvent, OverlayPortal,VideoArea, GuiArea} = ui.Components;
const {style} = ui;

import {Fragment, h, Component, VNode} from 'preact';
import { AudioPlayerView } from "../audio-player-view";

const PRESET_NAME = 'MiniAudioUI';

/**
 * Playback ui interface component
 *
 * @export
 * @param {*} props component props
 * @returns {React$Element} player ui tree
 */
@withPlayerPreset({
  allowSidePanels: false,
  allowPlayerArea: true
})
@withKeyboardEvent(PRESET_NAME)
class MiniAudioUI extends Component<AudioPlayerProps, any> {
  /**
   * @returns {void}
   */
  componentDidMount(): void {
    const props = this.props;
    // @ts-ignore
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
            <OverlayPortal />
            <AudioPlayerView pluginConfig={this.props.config} player={this.props.player} />
            <GuiArea>
            </GuiArea>
          </div>
        </PlayerArea>
      </div>
    );
  }
}

MiniAudioUI.displayName = PRESET_NAME;

/**
 * Playback ui interface
 *
 * @export
 * @param {*} props component props
 * @returns {React$Element} player ui tree
 */
export function miniAudioUI(props: any): VNode<any> {
  return <MiniAudioUI {...props} />;
}

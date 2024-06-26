interface AudioPlayerProps {
  config: any;
  player: any;
}

import {ui} from '@playkit-js/kaltura-player-js';
import * as uiStyles from './audio-player-ui.scss';

// @ts-expect-error - Property 'SidePanel' does not exist on type 'typeof Components'
const {PlayerArea, withPlayerPreset, withKeyboardEvent, OverlayPortal, SidePanel, GuiArea} = ui.Components;
const {
  style,
  reducers: {
    shell: {SidePanelPositions}
  }
} = ui;

import {h, Component, VNode} from 'preact';
import {AudioPlayerView} from '../audio-player-view';

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
            <AudioPlayerView />
            <GuiArea />
            <div className={uiStyles.audioPlayerSidePanelsWrapper}>
              <SidePanel position={SidePanelPositions.RIGHT} />
              <SidePanel position={SidePanelPositions.LEFT} />
              <SidePanel position={SidePanelPositions.TOP} />
              <SidePanel position={SidePanelPositions.BOTTOM} />
            </div>
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

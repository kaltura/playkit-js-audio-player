import {registerPlugin} from '@playkit-js/kaltura-player-js';
import {AudioPlayer} from './audio-player';
import {miniAudioUI} from './components/audio-player-ui';

declare let __VERSION__: string;
declare let __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {AudioPlayer as Plugin};
export {VERSION, NAME};

const pluginName = 'audioPlayer';
registerPlugin(pluginName, AudioPlayer);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

const AudioPreset = {
  template: (): any => miniAudioUI({player: {}, config: {}}),
  condition: (): boolean => true
};

// the preset needs to be injected into the player config before the player ui is loaded
window.__kalturaplayerdata = window.__kalturaplayerdata || {};
window.__kalturaplayerdata.ui = window.__kalturaplayerdata.ui || {};
window.__kalturaplayerdata.ui.customPreset = window.__kalturaplayerdata.ui.customPreset || [];
window.__kalturaplayerdata.ui.customPreset.push(AudioPreset);

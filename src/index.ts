import {registerPlugin} from '@playkit-js/kaltura-player-js';
import {AudioPlayer, pluginName} from './audio-player';
import {miniAudioUI} from './components/audio-player-ui';

declare let __VERSION__: string;
declare let __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {AudioPlayer as Plugin};
export {VERSION, NAME};

registerPlugin(pluginName, AudioPlayer);

const AudioPreset = {
  template: (): any => miniAudioUI({player: {}, config: {}}),
  condition: (): boolean => true
};

// the preset needs to be injected into the player config before the player ui is loaded
window.kalturaCustomPreset = [AudioPreset];

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

// Custom Preset has to be added in the bundle phase (before kalturaPlayer instance and as a result the UI is created and the )
if (!window.__kalturaplayerdata) {
  window.__kalturaplayerdata = {
    ui: {
      customPreset: [AudioPreset]
    }
  };
} else {
  if (!window.__kalturaplayerdata.ui) {
    window.__kalturaplayerdata.ui = {};
  }
  if (!window.__kalturaplayerdata.ui.customPreset) {
    window.__kalturaplayerdata.ui.customPreset = [AudioPreset];
  } else {
    window.__kalturaplayerdata.ui.customPreset.push(AudioPreset);
  }
}

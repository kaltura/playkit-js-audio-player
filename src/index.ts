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
window.__kalturaplayerdata = {
  ui: {
    customPreset: [
      // @ts-ignore
      ...window.__kalturaplayerdata.ui.customPreset,
      {
        template: () => miniAudioUI({player: {}, config: {}}),
        condition: () => true
      }
    ]
  }
};

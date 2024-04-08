// import {registerPlugin} from '@playkit-js/kaltura-player-js';
import {AudioPlayer} from './audio-player';
import {miniAudioUI} from './components/audio-player-ui';
import { bulbulUI } from "./experiment/bulbul-preset";

declare let __VERSION__: string;
declare let __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {AudioPlayer as Plugin};
export {VERSION, NAME};

const pluginName = 'audioPlayer';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// registerPlugin(pluginName, AudioPlayer);


// @ts-ignore
window.__kalturaplayerdata = {
  ui: {
    customPreset: [
      {
        template: () => miniAudioUI({player:{}, config:{}}),
        // template: (pr: any) => bulbulUI(pr),
        condition: () => true
      }
    ]
  }
}


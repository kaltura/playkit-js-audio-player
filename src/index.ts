import {registerPlugin} from '@playkit-js/kaltura-player-js';
import {AudioPlayer} from './audio-player';

declare let __VERSION__: string;
declare let __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {AudioPlayer as Plugin};
export {VERSION, NAME};

const pluginName = 'audioPlayer';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
registerPlugin(pluginName, AudioPlayer);

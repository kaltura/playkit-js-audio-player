import {KalturaPlayer} from '@playkit-js/kaltura-player-js';

export interface PluginMetaData {
  pluginName: string;
  action: (player: KalturaPlayer) => void;
  icon: {
    svgUrl: string;
    viewBox: string;
  };
}

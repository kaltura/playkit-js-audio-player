import {KalturaPlayer} from '@playkit-js/kaltura-player-js';

export interface PluginMetaData {
  pluginName: string;
  action: (player: KalturaPlayer) => void;
  isEntrySupported: (player: KalturaPlayer) => boolean;
  icon: {
    svgUrl: string;
    viewBox: string;
  };
}

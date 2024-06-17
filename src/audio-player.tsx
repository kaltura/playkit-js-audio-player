import {BasePlugin, KalturaPlayer, core} from '@playkit-js/kaltura-player-js';
import {AudioPlayerConfig} from './types';
import {hexToCSSFilter} from 'hex-to-css-filter';
import {PluginsMetaData} from './components/plugins';
import {PluginMetaData} from './types/plugin-metadata';

export const pluginName = 'audioPlayer';

const TONE_1_COLOR_VARIABLE = '--playkit-tone-1-color';
const TONE_1_COLOR_RGB_VARIABLE = '--playkit-tone-1-color-rgb';
const CONTROLS_FILTER_COLOR_VARIABLE = '--playkit-audio-player-controls-filter';
// @ts-ignore
class AudioPlayer extends BasePlugin {
  private colorVariablesSet = false;
  public availablePlugins: PluginMetaData[] = [];
  public static defaultConfig = {
    showReplayButton: false
  };

  constructor(name: string, player: KalturaPlayer, config: AudioPlayerConfig) {
    super(name, player, config);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const playerContainerElement = document.getElementById(this.player.config.targetId)!.querySelector('.kaltura-player-container');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    playerContainerElement!.style.height = 'fit-content';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    playerContainerElement!.style.backgroundColor = 'transparent';
    this.prepareUI();
  }

  loadMedia(): void {
    Object.keys(PluginsMetaData).forEach((pluginId: string) => {
      if (pluginId in this.player.plugins) {
        this.availablePlugins.push(PluginsMetaData[pluginId]);
      }
    });
  }

  private prepareUI() {
    if (!this.colorVariablesSet) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const color = this.player.ui._uiManager.getCSSVariable(TONE_1_COLOR_VARIABLE);
      if (!color.startsWith('#') || !(color.length === 4 || color.length === 7)) {
        this.colorVariablesSet = true;
        return;
      }

      // @ts-ignore
      this.eventManager.listenOnce(this.player, core.EventType.CHANGE_SOURCE_ENDED, () => {
        const colorHexAsFilter = hexToCSSFilter(color, {acceptanceLossPercentage: 1}).filter;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.player.ui._uiManager.setCSSVariable(CONTROLS_FILTER_COLOR_VARIABLE, colorHexAsFilter.replace(';', ''));
        if (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.player.ui._uiManager.getCSSVariable(CONTROLS_FILTER_COLOR_VARIABLE)
        ) {
          this.colorVariablesSet = true;
        }
      });
    }
  }

  static isValid(): boolean {
    return true;
  }

  reset() {
    this.availablePlugins = [];
  }
}

export {AudioPlayer};

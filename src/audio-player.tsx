import {BasePlugin, KalturaPlayer, core} from '@playkit-js/kaltura-player-js';
import {AudioPlayerConfig} from './types';
import {hexToCSSFilter} from 'hex-to-css-filter';
import {AudioPluginsManager} from './components/plugins/audio-plugins-manager/audio-plugins-manager';

export const pluginName = 'audioPlayer';

const TONE_1_COLOR_VARIABLE = '--playkit-tone-1-color';
const TONE_1_COLOR_RGB_VARIABLE = '--playkit-tone-1-color-rgb';
const CONTROLS_FILTER_COLOR_VARIABLE = '--playkit-audio-player-controls-filter';
// @ts-ignore
class AudioPlayer extends BasePlugin {
  private colorVariablesSet = false;
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
    player.registerService('AudioPluginsManager', new AudioPluginsManager(this.logger));
    this.prepareUI();
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

      const colorHexAsFilter = hexToCSSFilter(color, {acceptanceLossPercentage: 1}).filter;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error Property '_uiManager' is private and only accessible within class 'UIWrapper'
      this.player.ui._uiManager.setCSSVariable(CONTROLS_FILTER_COLOR_VARIABLE, colorHexAsFilter.replace(';', ''));
      if (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error Property '_uiManager' is private and only accessible within class 'UIWrapper'
        this.player.ui._uiManager.getCSSVariable(CONTROLS_FILTER_COLOR_VARIABLE)
      ) {
        this.colorVariablesSet = true;
      }
    }
  }

  static isValid(): boolean {
    return true;
  }
}

export {AudioPlayer};

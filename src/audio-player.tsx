import {BasePlugin, KalturaPlayer, core} from '@playkit-js/kaltura-player-js';
import {AudioPlayerConfig} from './types';
import {hexToCSSFilter} from 'hex-to-css-filter';

const TONE_1_COLOR_VARIABLE = '--playkit-tone-1-color';
const TONE_1_COLOR_RGB_VARIABLE = '--playkit-tone-1-color-rgb';
const CONTROLS_FILTER_COLOR_VARIABLE = '--playkit-audio-player-controls-filter';
// @ts-ignore
class AudioPlayer extends BasePlugin {
  private colorVariablesSet = false;
  public static defaultConfig = {};

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

  /**
   * Return a hex color as an array of Red, Green and Blue values
   * @param {string} color  - 3 or 6 digit hex color value
   * @returns {number[]} array of RGB numeric values
   */
  private getColorAsRGB(color: string) {
    let fullHexColor = color;
    if (color.length === 4) {
      fullHexColor = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }

    const colorArr = fullHexColor.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    return colorArr ? [parseInt(colorArr[1], 16), parseInt(colorArr[2], 16), parseInt(colorArr[3], 16)] : null;
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
        const colorHexAsRGB = this.getColorAsRGB(color);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.player.ui._uiManager.setCSSVariable(CONTROLS_FILTER_COLOR_VARIABLE, colorHexAsFilter.replace(';', ''));
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.player.ui._uiManager.setCSSVariable(TONE_1_COLOR_RGB_VARIABLE, colorHexAsRGB);

        if (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.player.ui._uiManager.getCSSVariable(CONTROLS_FILTER_COLOR_VARIABLE) &&
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.player.ui._uiManager.getCSSVariable(TONE_1_COLOR_RGB_VARIABLE)
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
    /**/
  }
}

export {AudioPlayer};

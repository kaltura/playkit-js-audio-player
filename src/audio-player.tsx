import {BasePlugin, KalturaPlayer} from '@playkit-js/kaltura-player-js';
import {AudioPlayerConfig} from './types';
import {AudioPlayerView, AudioPlayerUI} from './components';

class AudioPlayer extends BasePlugin<AudioPlayerConfig> {
  constructor(name: string, player: KalturaPlayer, config: AudioPlayerConfig) {
    super(name, player, config);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const playerContainerElement = document.getElementById(this.player.config.targetId)!.querySelector('.kaltura-player-container');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    playerContainerElement!.style.height = 'fit-content';
    this._prepareUI();
  }

  _prepareUI() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.player.ui._uiManager.destroy();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.player.ui._uiManager.buildCustomUI([
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        template: () => (
          <AudioPlayerUI>
            {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              <AudioPlayerView pluginConfig={this.config} player={this.player} />
            }
          </AudioPlayerUI>
        ),
        condition: () => true
      }
    ]);
  }

  static isValid(): boolean {
    return true;
  }

  reset() {}
}

export {AudioPlayer};

import {BasePlugin, KalturaPlayer} from '@playkit-js/kaltura-player-js';
import {AudioPlayerConfig} from './types';
import {AudioPlayerView} from './components';
import {AudioSeekbar} from './components/audio-seekbar';

class AudioPlayer extends BasePlugin<AudioPlayerConfig> {
  constructor(name: string, player: KalturaPlayer, config: AudioPlayerConfig) {
    super(name, player, config);
  }

  static isValid(): boolean {
    return true;
  }

  async loadMedia() {
    await this.player.ready;

    // TODO fix TS ignores
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const a = document.getElementById(this.player.config.targetId)!.querySelector('.kaltura-player-container');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    a!.style.height = 'fit-content';

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.player.ui._uiManager.destroy();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.player.ui._uiManager.buildCustomUI([
      {
        template: () => <AudioPlayerView pluginConfig={this.config}/>,
        condition: () => true
      }
    ]);

    this.player.ui.addComponent({
      label: 'video-player-wrapper',
      presets: ['AudioPlayer'],
      area: 'VideoPlayerArea',
      get: () => {
        /* TODO */
      },
      //get: () => customVideoPlayer,
      replaceComponent: 'VideoPlayer'
    });
  }

  reset() {
    // TODO
  }
}

export {AudioPlayer};

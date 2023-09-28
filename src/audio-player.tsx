import {BasePlugin, KalturaPlayer} from '@playkit-js/kaltura-player-js';
import {AudioPlayerConfig} from './types';
import {AudioPlayerView, AudioPlayerUI} from './components';

class AudioPlayer extends BasePlugin<AudioPlayerConfig> {
  constructor(name: string, player: KalturaPlayer, config: AudioPlayerConfig) {
    super(name, player, config);
  }

  static isValid(): boolean {
    return true;
  }

  async loadMedia() {
    await this.player.ready;
    const poster = this.player.sources.poster;
    const title = this.player.sources.metadata?.name || '';
    const description = this.player.sources.metadata?.description || '';

    // TODO fix TS ignores
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const playerContainerElement = document.getElementById(this.player.config.targetId)!.querySelector('.kaltura-player-container');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    playerContainerElement!.style.height = 'fit-content';

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.player.ui._uiManager.destroy();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
              <AudioPlayerView description={description} title={title} poster={poster} pluginConfig={this.config} ready={this.ready} />
            }
          </AudioPlayerUI>
        ),
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

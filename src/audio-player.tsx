import {BasePlugin, KalturaPlayer, ui} from '@playkit-js/kaltura-player-js';
import {AudioPlayerConfig} from './types';

class AudioPlayer extends BasePlugin<AudioPlayerConfig> {
  constructor(name: string, player: KalturaPlayer, config: AudioPlayerConfig) {
    super(name, player, config);
  }

  static isValid(): boolean {
    return true;
  }

  async loadMedia() {
    await this.player.ready;

    const {h} = ui;

    // TODO replace with JSX component
    const myPreset = () => {
      return h(presetComponent, {});
    };

    const presetComponent = () => {
      return h(
        'h1',
        {className: 'my-preset', style: 'position: relative; background-color: red; height: 160px; margin: 0'},
        'This is a custom preset !'
      );
    };
    presetComponent.displayName = 'MyPreset';

    const myUI = {
      template: () => myPreset(),
      condition: () => true
    };

    // TODO fix TS ignores
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const a = document.getElementById(this.player.config.targetId)!.querySelector('.kaltura-player-container');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    a!.style.height = 'fit-content';

    const customPreset = [myUI];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.player.ui._uiManager.destroy();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.player.ui._uiManager.buildCustomUI(customPreset);

    this.player.ui.addComponent({
      label: 'video-player-wrapper',
      presets: ['MyPreset'],
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

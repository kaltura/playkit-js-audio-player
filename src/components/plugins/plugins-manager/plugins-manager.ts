import {AudioPlugin} from '../../../types/audio-plugin';
import {FakeEventTarget} from '@playkit-js/playkit-js';
import {FakeEvent} from '@playkit-js/playkit-js';

export const AUDIO_PLAYER_ACTIVE_PLUGINS_UPDATED = 'audio_player_active_plugins_updated';

export class AudioPluginsManager extends FakeEventTarget {
  private readonly activePluginsRegistry: Map<number, AudioPlugin>;
  private static nextId = 0;

  constructor(private logger: any) {
    super();
    this.activePluginsRegistry = new Map<number, AudioPlugin>();
  }

  public add(audioPlugin: AudioPlugin): number | undefined {
    if (AudioPluginsManager.validateItem(audioPlugin)) {
      const id = ++AudioPluginsManager.nextId;
      this.activePluginsRegistry.set(id, audioPlugin);
      this.logger.debug(`Plugin '${audioPlugin.displayName}' added to AudioPlayer Overlay, id: '${id}' `);
      this.dispatchEvent(new FakeEvent(AUDIO_PLAYER_ACTIVE_PLUGINS_UPDATED, {activePlugins: this.getPlugins()}));
      return id;
    }
    this.logger.error('Plugin cannot be added due to invalid parameters', JSON.stringify(audioPlugin));
    return undefined;
  }

  public remove(pluginId: number): void {
    const audioPlugin: AudioPlugin | undefined = this.activePluginsRegistry.get(pluginId);
    if (audioPlugin) {
      this.activePluginsRegistry.delete(pluginId);
      this.logger.debug(`Plugin '${audioPlugin.displayName}' removed from AudioPlayer Overlay, id: '${pluginId}' `);
      this.dispatchEvent(new FakeEvent(AUDIO_PLAYER_ACTIVE_PLUGINS_UPDATED, {activePlugins: this.getPlugins()}));
    } else {
      this.logger.warn(`Plugin Id ${pluginId} is not registered`);
    }
  }
  public getPlugins(): AudioPlugin[] {
    return Array.from(this.activePluginsRegistry.values());
  }

  private static validateItem(audioPlugin: AudioPlugin): boolean {
    const {displayName, open, symbol} = audioPlugin;
    return typeof open === 'function' && typeof displayName === 'string' && typeof symbol?.svgUrl === 'string' && typeof symbol?.svgUrl === 'string';
  }
}

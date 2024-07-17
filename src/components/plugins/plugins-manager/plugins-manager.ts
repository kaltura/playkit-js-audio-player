import {AudioPluginDto} from '../../../types/audio-plugin';
import {FakeEventTarget} from '@playkit-js/playkit-js';
import {FakeEvent} from '@playkit-js/playkit-js';

export const AUDIO_PLAYER_ACTIVE_PLUGINS_UPDATED = 'audio_player_active_plugins_updated';

export class AudioPluginsManager extends FakeEventTarget {
  private readonly activePluginsRegistry: Map<number, AudioPluginDto>;
  private static nextId = 0;

  constructor(private logger: any) {
    super();
    this.activePluginsRegistry = new Map<number, AudioPluginDto>();
  }

  public add(audioPlugin: AudioPluginDto): number | undefined {
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
    const audioPlugin: AudioPluginDto | undefined = this.activePluginsRegistry.get(pluginId);
    if (audioPlugin) {
      this.activePluginsRegistry.delete(pluginId);
      this.logger.debug(`Plugin '${audioPlugin.displayName}' removed from AudioPlayer Overlay, id: '${pluginId}' `);
      this.dispatchEvent(new FakeEvent(AUDIO_PLAYER_ACTIVE_PLUGINS_UPDATED, {activePlugins: this.getPlugins()}));
    } else {
      this.logger.warn(`Plugin Id ${pluginId} is not registered`);
    }
  }
  public getPlugins(): AudioPluginDto[] {
    return Array.from(this.activePluginsRegistry.values());
  }

  private static validateItem(audioPlugin: AudioPluginDto): boolean {
    const {displayName, onClick, svgIcon} = audioPlugin;
    return typeof onClick === 'function' && typeof displayName === 'string' && typeof svgIcon?.path === 'string';
  }
}

// remove - transcript and download on reset
// uinify interfaces with upper-bar-manager

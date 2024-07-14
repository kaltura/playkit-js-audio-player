import {useState, useEffect} from 'preact/hooks';
import {AUDIO_PLAYER_ACTIVE_PLUGINS_UPDATED, AudioPluginsManager} from './plugins-manager';
import {AudioPlugin} from '../../../types/audio-plugin';
import {FakeEvent} from '@playkit-js/playkit-js';

function usePluginsManager(audioPluginsManager: AudioPluginsManager): AudioPlugin[] {
  const [activePlugins, setActivePlugins] = useState<AudioPlugin[]>(audioPluginsManager.getPlugins());

  useEffect(() => {
    const handlePluginAdded = (event: FakeEvent) => {
      const activePluginsPayload = event.payload.activePlugins;
      setActivePlugins(prevPlugins => [...activePluginsPayload]);
    };
    audioPluginsManager.addEventListener(AUDIO_PLAYER_ACTIVE_PLUGINS_UPDATED, handlePluginAdded);
    return () => {
      audioPluginsManager.removeEventListener(AUDIO_PLAYER_ACTIVE_PLUGINS_UPDATED, handlePluginAdded);
    };
  }, [audioPluginsManager]);

  return activePlugins;
}

export {usePluginsManager};

import {h} from 'preact';
import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './plugins-menu-overlay.scss';
import {MenuItem} from '../menu-item';
import {PluginsMetaData} from '../plugins-meta-data';
import {AudioPlayerSizes} from '../../../types';
import {PluginMetaData} from '../../../types/plugin-metadata';

const {Overlay} = ui.Components;
const {createPortal} = ui;

interface PluginsMenuOverlayProps {
  plugins: PluginMetaData[];
  playerContainerId: string;
  onClose: () => void;
  player: any;
  size: AudioPlayerSizes;
}

const PluginsMenuOverlay = ({plugins, playerContainerId, onClose, player}: PluginsMenuOverlayProps) => {
  const targetId: HTMLDivElement | Document = (document.getElementById(playerContainerId) as HTMLDivElement) || document;
  const portalSelector = `.overlay-portal`;

  return createPortal(
    <Overlay open onClose={onClose} type="playkit-mini-audio-player">
      <div className={`${styles.pluginsMenuOverlay}`}>
        <div className={styles.menu}>
          {plugins.map(({pluginName, action, icon}) => (
            <MenuItem
              pluginName={pluginName}
              icon={icon}
              onClick={() => {
                onClose();
                action(player);
              }}
            />
          ))}
        </div>
      </div>
    </Overlay>,
    targetId.querySelector(portalSelector)!
  );
};

export {PluginsMenuOverlay};

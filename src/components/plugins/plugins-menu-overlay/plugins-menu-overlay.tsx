import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './plugins-menu-overlay.scss';
import {MenuItem} from '../menu-item';
import {PluginsMetaData} from '../plugins-meta-data';
//@ts-ignore
const {Icon, IconType, Tooltip, Overlay} = ui.Components;
//@ts-ignore
const {createPortal} = ui;

interface PluginsMenuOverlayProps {
  poster: string;
  playerContainerId: string;
  onClose: () => void;
  player: any;
}

const PluginsMenuOverlay = ({poster, playerContainerId, onClose, player}: PluginsMenuOverlayProps) => {
  const targetId: HTMLDivElement | Document = (document.getElementById(playerContainerId) as HTMLDivElement) || document;
  const portalSelector = `.overlay-portal`;

  return createPortal(
    <Overlay
      open
      onClose={onClose}
      type="playkit-mini-audio-player">
      <div style={{backgroundImage: `url(${poster})`}} className={styles.pluginsMenuOverlay}>
        <div className={styles.content}>
          <div className={styles.menu}>
            {PluginsMetaData.map(({pluginName, action, svgUrl}) => (
              <MenuItem
                pluginName={pluginName}
                svgUrl={svgUrl}
                onClick={() => {
                  onClose();
                  action(player);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Overlay>,
    targetId.querySelector(portalSelector)
  );
};

export {PluginsMenuOverlay};

import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './plugins-menu-overlay.scss';
import {MenuItem} from '../menu-item';
import {PluginsMetaData} from '../plugins-meta-data';
import {AudioPlayerSizes} from '../../../types';
//@ts-ignore
const {Icon, IconType, Tooltip, Overlay} = ui.Components;
//@ts-ignore
const {createPortal} = ui;

interface PluginsMenuOverlayProps {
  poster: string;
  playerContainerId: string;
  onClose: () => void;
  player: any;
  size: AudioPlayerSizes;
}

const PluginsMenuOverlay = ({poster, playerContainerId, onClose, player, size}: PluginsMenuOverlayProps) => {
  const targetId: HTMLDivElement | Document = (document.getElementById(playerContainerId) as HTMLDivElement) || document;
  const portalSelector = `.overlay-portal`;


  return createPortal(
    // @ts-ignore
    <Overlay open onClose={onClose} type="playkit-mini-audio-player">
      <div style={size === AudioPlayerSizes.Large ? {backgroundImage: `url(${poster})`} : ''} className={styles.pluginsMenuOverlay}>
        <div className={`${styles.pluginsMenuOverlayUpperLayer} ${size === AudioPlayerSizes.Large ? styles.large : styles.mediumSmall}`}>
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

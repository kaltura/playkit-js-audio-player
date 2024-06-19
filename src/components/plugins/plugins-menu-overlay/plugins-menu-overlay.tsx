import {h} from 'preact';
import {ui} from '@playkit-js/kaltura-player-js';
import {OverlayPortal} from '@playkit-js/common/dist/hoc/overlay-portal';
import * as styles from './plugins-menu-overlay.scss';
import {MenuItem} from '../menu-item';
import {AudioPlayerSizes} from '../../../types';
import {PluginMetaData} from '../../../types/plugin-metadata';

const {Overlay} = ui.Components;

interface PluginsMenuOverlayProps {
  plugins: PluginMetaData[];
  onClose: () => void;
  player: any;
  size: AudioPlayerSizes;
}

const PluginsMenuOverlay = ({plugins, onClose, player}: PluginsMenuOverlayProps) => {
  return (
    <OverlayPortal>
      <Overlay open onClose={onClose} type="playkit-mini-audio-player">
        <div className={`${styles.pluginsMenuOverlay}`}>
          <div className={styles.menu}>
            {plugins.map(({pluginName, action, icon, isDisabled}) => {
              const disabled = isDisabled?.(player);
              if (disabled) {
                return null;
              }
              return (
                <MenuItem
                  pluginName={pluginName}
                  icon={icon}
                  onClick={() => {
                    onClose();
                    action(player);
                  }}
                />
              )
            })}
          </div>
        </div>
      </Overlay>
    </OverlayPortal>
  )
};

export {PluginsMenuOverlay};

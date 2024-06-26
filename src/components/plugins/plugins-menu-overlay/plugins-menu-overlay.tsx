import {h} from 'preact';
import {BasePlugin, ui} from '@playkit-js/kaltura-player-js';
import {OverlayPortal} from '@playkit-js/common/dist/hoc/overlay-portal';
import * as styles from './plugins-menu-overlay.scss';
import {MenuItem} from '../menu-item';

const {Overlay} = ui.Components;

interface PluginsMenuOverlayProps {
  plugins: BasePlugin[];
  onClose: () => void;
}

const PluginsMenuOverlay = ({plugins, onClose}: PluginsMenuOverlayProps) => {
  return (
    <OverlayPortal>
    <Overlay open onClose={onClose} type="playkit-mini-audio-player">
      <div className={`${styles.pluginsMenuOverlay}`}>
        <div className={styles.menu}>
          {plugins.map((plugin: BasePlugin) => {
            if (plugin.isEntrySupported()) {
              return (
                <MenuItem
                  pluginName={plugin.displayName}
                  icon={plugin.symbol}
                  onClick={() => {
                    onClose();
                    plugin.open();
                  }}
                />
              );
            }
          })}
        </div>
      </div>
    </Overlay>
    </OverlayPortal>
  )
};

export {PluginsMenuOverlay};

import {h} from 'preact';
import {BasePlugin, ui} from '@playkit-js/kaltura-player-js';
import {OverlayPortal} from '@playkit-js/common/dist/hoc/overlay-portal';
import * as styles from './plugins-menu-overlay.scss';
import {MenuItem} from '../menu-item';
import {AudioPlugin} from '../../../types/audio-plugin';

const {Overlay} = ui.Components;

interface PluginsMenuOverlayProps {
  plugins: AudioPlugin[];
  onClose: () => void;
}

const PluginsMenuOverlay = ({plugins, onClose}: PluginsMenuOverlayProps) => {
  return (
    <OverlayPortal>
      <Overlay open onClose={onClose} type="playkit-mini-audio-player">
        <div className={`${styles.pluginsMenuOverlay}`}>
          <div className={styles.menu}>
            {plugins.map(({displayName, symbol, open}) => {
              return (
                <MenuItem
                  pluginName={displayName}
                  icon={symbol}
                  onClick={() => {
                    onClose();
                    open();
                  }}
                />
              );
            })}
          </div>
        </div>
      </Overlay>
    </OverlayPortal>
  );
};

export {PluginsMenuOverlay};

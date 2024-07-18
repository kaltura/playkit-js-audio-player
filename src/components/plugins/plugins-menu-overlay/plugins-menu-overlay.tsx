import {h} from 'preact';
import {ui} from '@playkit-js/kaltura-player-js';
import {OverlayPortal} from '@playkit-js/common/dist/hoc/overlay-portal';
import * as styles from './plugins-menu-overlay.scss';
import {MenuItem} from '../menu-item';
import {AudioPluginDto} from '../../../types/audio-plugin-dto';

const {Overlay} = ui.Components;

interface PluginsMenuOverlayProps {
  plugins: AudioPluginDto[];
  onClose: (e: MouseEvent) => void;
}

const PluginsMenuOverlay = ({plugins, onClose}: PluginsMenuOverlayProps) => {
  return (
    <OverlayPortal>
      <Overlay open onClose={onClose} type="playkit-mini-audio-player">
        <div className={`${styles.pluginsMenuOverlay}`}>
          <div className={styles.menu}>
            {plugins.map(({displayName, svgIcon, onClick}) => {
              return (
                <MenuItem
                  title={displayName}
                  icon={svgIcon}
                  onClick={(e) => {
                    onClose(e);
                    onClick(e);
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

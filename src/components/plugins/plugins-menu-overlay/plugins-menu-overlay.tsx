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
      // addAccessibleChild={this.props.addAccessibleChild}
      // handleKeyDown={this.props.handleKeyDown}
      onClose={onClose}
      type="playkit-mini-audio-player">
      <div style={{backgroundImage: `url(${poster})`}} className={styles.pluginsMenuOverlay}>
        <div
          style={{
            backgroundImage: `url(https://s3-alpha-sig.figma.com/img/7b63/5129/06c73c390dcd62308b03cbc106554a7d?Expires=1713139200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Fsw96kKpReQ3m5OwMHypmBTQyl6E4cin2CPazf5ti3UR0KNqZAsZc3Ad0VlfmPHhNDvZywPQ0ZSCF3MOzOYVFR5vTEiGyZyfvSf93wRjfdFjJ-laGHCPtP0Inh4trNmx9TIS3ixvZIyLr8X-LvWqeqz6WtFPv1zIKcYQFHbkit~5DzAsf~Cpe2kkzzguP37DktmLEihO33Qo8UUk4U1Rdp~Gd8U-J3CUhD5Jl-jwpFV8FO4oDrGj9xWpU6pdE6niWzlbXH7bQp8-LQrp4s2xRjzdyb6GzXRZhbu~88rW4g-AQvsoCU1ZsqJ4LRH-CaaohoagSnoXbDEPF8vpDXH36Q)`
          }}
          className={styles.pluginsMenuOverlay}>
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
      </div>
    </Overlay>,
    targetId.querySelector(portalSelector)
  );
};

export {PluginsMenuOverlay};

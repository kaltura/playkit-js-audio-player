import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './plugins-menu-overlay.scss';
const DOWNLOAD =
  'M26,25 C26.5522847,25 27,25.4477153 27,26 C27,26.5522847 26.5522847,27 26,27 L26,27 L7,27 C6.44771525,27 6,26.5522847 6,26 C6,25.4477153 6.44771525,25 7,25 L7,25 Z M15.897,20.797 L15.817,20.73 L15.8163834,20.7298413 L8.34305882,13.7298413 C7.93997861,13.3522902 7.91928313,12.7194636 8.29683417,12.3163834 C8.67438521,11.9133032 9.30721188,11.8926077 9.71029209,12.2701587 L15.4996721,17.693 L15.5,6 C15.5,5.48716416 15.8860402,5.06449284 16.3833789,5.00672773 L16.5,5 C17.0522847,5 17.5,5.44771525 17.5,6 L17.4996721,17.694 L23.2951711,12.2699211 C23.6673663,11.9215418 24.2352038,11.9125649 24.6172049,12.230382 L24.7086128,12.3166371 C25.0860237,12.7198486 25.0651082,13.352668 24.6618968,13.7300789 L17.1833629,20.7300789 L17.1610165,20.7503813 L17.1610165,20.7503813 C17.1421868,20.7669999 17.1224361,20.7831339 17.102079,20.7985075 C17.0891381,20.8082894 17.0764369,20.8174134 17.0635772,20.826204 C17.0434306,20.8399634 17.0223437,20.8532674 17.0007451,20.8657864 C16.9872099,20.8736423 16.9734873,20.8811624 16.959633,20.8883367 L16.8877511,20.9220455 L16.8877511,20.9220455 C16.8756318,20.927087 16.8632234,20.9320132 16.8507409,20.9366814 C16.83028,20.9444208 16.8097352,20.9513578 16.7889039,20.9576336 C16.7705976,20.9630349 16.752126,20.968019 16.7335525,20.9724647 C16.6585039,20.9905214 16.5803589,21 16.5,21 C16.4170842,21 16.3365254,20.9899086 16.2594848,20.9708871 C16.2500284,20.9684434 16.2399293,20.9657886 16.2298654,20.9629733 C16.2028024,20.9554899 16.1769173,20.947049 16.1515197,20.9376057 C16.1370523,20.9321598 16.1223107,20.9262914 16.1076867,20.9200585 C16.0832011,20.9096448 16.0596143,20.8984375 16.036557,20.886357 C16.025923,20.8807972 16.0148138,20.8747205 16.0037984,20.8684173 C15.9792921,20.8543502 15.955966,20.8396537 15.9333153,20.8240474 L15.898,20.798 L15.897,20.797 Z M15.867,20.774 L15.888,20.79 L15.8735171,20.7794831 L15.8735171,20.7794831 L15.867,20.774 Z M15.817,20.73 L15.9035191,20.8027045 C15.8784859,20.7840722 15.8543541,20.7642966 15.831201,20.7434548 L15.817,20.73 Z';

import {VNode} from 'preact';
import {Localizer, Text} from 'preact-i18n';
import { Component } from "react";
import { MenuItem } from "../menu-item/menu-item";
import { PluginsMetaData } from "../../plugins/plugins-meta-data";
//@ts-ignore
const {Icon, IconType, Tooltip, Overlay} = ui.Components;
//@ts-ignore
const {createPortal} = ui;

interface PluginsMenuOverlayProps {
  poster: string;
  config: any;
  onClose: () => void;
  player: any
  // onClick: () => void;
  // moreIconTxt?: string;
}



const PluginsMenuOverlay = ({poster, config, onClose, player}: PluginsMenuOverlayProps) => {
  const targetId: HTMLDivElement | Document = (document.getElementById(config.targetId) as HTMLDivElement) || document;
  const portalSelector = `.overlay-portal`;

  // const onItemClick = () => {
  //   onClose();
  //   action(player);
  // };

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
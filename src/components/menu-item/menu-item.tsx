// import {Component} from 'react';
import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './menu-item.scss';
// const DOWNLOAD =
//   ;

// import {VNode} from 'preact';
// import {Localizer, Text} from 'preact-i18n';

//@ts-ignore
const {Icon, IconType, Tooltip, Overlay} = ui.Components;
//@ts-ignore
const {createPortal} = ui;

interface MenuItemProps {
  onClick: (player: any) => void;
  pluginName: string;
  svgUrl: string;
  // moreIconTxt?: string;
}

const MenuItem = ({pluginName, svgUrl, onClick}: MenuItemProps) => {
  return (
    <div onClick={onClick} className={styles.menuItem}>
      <span className={styles.pluginIcon}>
        <Icon id={`min-audio-player-download`} path={svgUrl} viewBox={`0 0 32 32`} />
      </span>
      <div className={styles.content2}>{pluginName}</div>
      <span className={styles.arrowIcon}>
        {/*@ts-ignore*/}
        <Icon type={IconType.ArrowDown} />
      </span>
    </div>
  );
};

export {MenuItem};

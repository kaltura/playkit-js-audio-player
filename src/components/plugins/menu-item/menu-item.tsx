import { h } from 'preact';
import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './menu-item.scss';
import {A11yWrapper} from '@playkit-js/common/dist/hoc/a11y-wrapper';
const {Icon, IconType} = ui.Components;

interface MenuItemProps {
  onClick: (player: any) => void;
  pluginName: string;
  svgUrl: string;
}

const MenuItem = ({pluginName, icon, onClick}: MenuItemProps) => {
  return (
    // @ts-ignore - error TS2786: 'A11yWrapper' cannot be used as a JSX component.
    <A11yWrapper onClick={onClick}>
      <div className={styles.menuItem} tabIndex={0} aria-label={pluginName}>
        <span className={styles.pluginIcon}>
          <Icon id={`min-audio-player-${pluginName}`} path={icon.svgUrl} viewBox={icon.viewBox} />
        </span>
        <div>{pluginName}</div>
        <span className={styles.arrowIcon}>
          <Icon type={IconType.ArrowDown} />
        </span>
      </div>
    </A11yWrapper>
  );
};

export {MenuItem};

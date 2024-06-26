import {h} from 'preact';
import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './menu-item.scss';
import {A11yWrapper} from '@playkit-js/common/dist/hoc/a11y-wrapper';
const {Icon, IconType} = ui.Components;

interface MenuItemProps {
  onClick: (player: any) => void;
  pluginName: string;
  icon: {svgUrl: string; viewBox: string};
  disabled?: boolean;
}

const MenuItem = ({pluginName, icon, onClick, disabled}: MenuItemProps) => {
  return (
    <A11yWrapper onClick={onClick}>
      <div className={[styles.menuItem, disabled ? styles.disabled : ''].join(' ')} tabIndex={0} aria-label={pluginName} aria-disabled={disabled}>
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

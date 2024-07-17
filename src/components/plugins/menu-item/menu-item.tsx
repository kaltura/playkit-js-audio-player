import {h} from 'preact';
import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './menu-item.scss';
import {A11yWrapper} from '@playkit-js/common/dist/hoc/a11y-wrapper';
const {Icon, IconType} = ui.Components;

interface MenuItemProps {
  onClick: (e: any) => void;
  title: string;
  icon: {path: string; viewBox?: string};
}

const MenuItem = ({title, icon, onClick}: MenuItemProps) => {
  return (
    <A11yWrapper onClick={onClick}>
      <div className={styles.menuItem} tabIndex={0} aria-label={title}>
        <span className={styles.pluginIcon}>
          <Icon id={`min-audio-player-${title}`} path={icon.path} viewBox={icon.viewBox || '0 0 32 32'} />
        </span>
        <div>{title}</div>
        <span className={styles.arrowIcon}>
          <Icon type={IconType.ArrowDown} />
        </span>
      </div>
    </A11yWrapper>
  );
};

export {MenuItem};

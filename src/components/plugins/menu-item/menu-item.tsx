import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './menu-item.scss';
import {A11yWrapper} from '@playkit-js/common/dist/hoc/a11y-wrapper';

//@ts-ignore
const {Icon, IconType} = ui.Components;

interface MenuItemProps {
  onClick: (player: any) => void;
  pluginName: string;
  svgUrl: string;
}

const MenuItem = ({pluginName, svgUrl, onClick}: MenuItemProps) => {
  return (
    <A11yWrapper onClick={onClick}>
      <div className={styles.menuItem} tabIndex={0} aria-label={pluginName}>
        <span className={styles.pluginIcon}>
          <Icon id={`min-audio-player-download`} path={svgUrl} viewBox={`0 0 32 32`} />
        </span>
        <div className={styles.content2}>{pluginName}</div>
        <span className={styles.arrowIcon}>
          {/*@ts-ignore*/}
          <Icon type={IconType.ArrowDown} />
        </span>
      </div>
    </A11yWrapper>
  );
};

export {MenuItem};

import {useRef} from 'preact/hooks';
import {A11yWrapper} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './more-plugins-button.scss';

const {Icon, Tooltip} = ui.Components;
const {withText, Text} = ui.preacti18n;
const ICON_PATH =
  // eslint-disable-next-line max-len
  'M16 22a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0-11a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0-11a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z';

interface MorePluginsButtonProps {
  onClick: () => void;
  moreIconTxt?: string;
}

const MorePluginsButton = ({onClick, moreIconTxt}: MorePluginsButtonProps) => {
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  return (
    <Tooltip label={moreIconTxt!}>
      <A11yWrapper onClick={onClick}>
        <button ref={moreButtonRef} className={`${ui.style.upperBarIcon} ${styles.morePluginsIcon}`} tabIndex={0} aria-label={moreIconTxt}>
          <Icon id={`${'pluginName-123'}-upper-bar-manager`} path={ICON_PATH} viewBox={'0 0 32 32'} />
        </button>
      </A11yWrapper>
    </Tooltip>
  );
};

export const MorePluginsButtonWrapper = withText({moreIconTxt: <Text id="audioPlayer.pluginIcon">More</Text>})(MorePluginsButton);

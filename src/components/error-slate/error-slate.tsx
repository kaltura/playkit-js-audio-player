import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './error-slate.scss';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const {ErrorOverlay} = ui.Components;

export const ErrorSlate = () => {
  return (
    <div className={styles.errorSlateWrapper}>
      <ErrorOverlay />
    </div>
  );
};

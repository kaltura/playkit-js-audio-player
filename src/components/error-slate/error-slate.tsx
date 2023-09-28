import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './error-slate.scss';

//@ts-ignore
const {ErrorOverlay} = ui.Components;

export const ErrorSlate = () => {
  return (
    <div className={styles.errorSlateWrapper}>
      <ErrorOverlay />
    </div>
  );
};

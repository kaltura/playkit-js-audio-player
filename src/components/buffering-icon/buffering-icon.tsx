import {h} from 'preact';
import * as styles from './buffering-icon.scss';

export const BufferingIcon = ({isLarge}: {isLarge?: boolean}) => {
  return (
    <svg
      data-testid="audio-player-buffering-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={[styles.bufferingIcon, isLarge ? styles.large : ''].join(' ')}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        fill="white"
        fill-opacity="0.2"
      />
      <path d="M18 12H22C22 6.47715 17.5228 2 12 2V6C15.3137 6 18 8.68629 18 12Z" fill="white" />
    </svg>
  );
};

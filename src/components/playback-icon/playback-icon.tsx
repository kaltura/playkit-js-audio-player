import {h} from 'preact';
import * as styles from './playback-icon.scss';

interface PlaybackIconProps {
  isLarge?: boolean;
  isActive?: boolean;
}

const PlaybackIcon = ({isLarge = false, isActive = false}: PlaybackIconProps) => {
  return (
    <div
      aria-hidden="true"
      data-testid="audio-player-audio-icon"
      className={`${styles.playbackIcon} ${isLarge ? styles.large : ''} ${isActive ? styles.active : ''}`}
    >
      <div className={styles.box2} />
      <div className={styles.box1} />
      <div className={styles.box2} />
    </div>
  );
};

export {PlaybackIcon};

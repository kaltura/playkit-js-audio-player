import * as styles from './audio-icon.scss';

interface AudioIconProps {
  isLarge: boolean;
  isActive: boolean;
}

const AudioIcon = ({isLarge, isActive}: AudioIconProps) => {
  return (
    <div className={`${styles.audioIcon} ${isLarge ? styles.large : ''} ${isActive ? styles.active : ''}`}>
      <div className={styles.box2} />
      <div className={styles.box1} />
      <div className={styles.box2} />
    </div>
  );
};

export {AudioIcon};

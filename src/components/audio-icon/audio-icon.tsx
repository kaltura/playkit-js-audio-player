import {h} from 'preact';
import * as styles from './audio-icon.scss';
import { useState } from 'preact/hooks';

interface AudioIconProps {
  isLarge: boolean;
  isActive: boolean;
}

const AudioIcon = ({isLarge, isActive}: AudioIconProps) => {
  const [isAnimation, setIsAnimation] = useState(true);

  const handleClick = () => {
    if(isActive){
      setIsAnimation(prevState => !prevState);
    };
  };
  
  return (
    <button onClick={handleClick} aria-label={(isAnimation && isActive) ? "Pause Animation" : "Play Animation"} data-testid="audio-player-audio-icon" className={`${styles.audioIcon} ${isLarge ? styles.large : ''} ${(isAnimation && isActive) ? styles.active : ''}`}>
      <div className={styles.box2} />
      <div className={styles.box1} />
      <div className={styles.box2} />
    </button>
  );
};

export {AudioIcon};

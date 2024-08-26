import {h} from 'preact';
import * as styles from './audio-icon.scss';
import { useState } from 'preact/hooks';
import {ui} from '@playkit-js/kaltura-player-js';
import {Components} from '@playkit-js/playkit-js-ui';

interface AudioIconProps {
  isLarge: boolean;
  isActive: boolean;
  resumeAnimation: string;
  pauseAnimation: string;
}

const {Tooltip} = Components;

const {withText, Text} = ui.preacti18n;
const translates = {
  resumeAnimation: <Text id="audioPlayer.resumeAnimation">Resume Animation</Text>,
  pauseAnimation: <Text id="audioPlayer.pauseANimation">Pause Animation</Text>
};

const AudioIcon = withText(translates)(({isLarge, isActive, resumeAnimation, pauseAnimation}: AudioIconProps) => {
  const [isAnimation, setIsAnimation] = useState(true);

  const handleClick = () => {
    setIsAnimation(prevState => !prevState);
  };
  
  return (
    <Tooltip label={isAnimation ? pauseAnimation : resumeAnimation} type="right">
      <button 
          disabled={!isActive} 
          onClick={handleClick} 
          aria-label={isAnimation ? pauseAnimation : resumeAnimation} 
          data-testid="audio-player-audio-icon" 
          className={`${styles.audioIcon} ${isLarge ? styles.large : ''} ${(isAnimation && isActive) ? styles.active : ''}`}
        >
          <div className={styles.box2} />
          <div className={styles.box1} />
          <div className={styles.box2} />
      </button>
    </Tooltip>
  );
});

export {AudioIcon};

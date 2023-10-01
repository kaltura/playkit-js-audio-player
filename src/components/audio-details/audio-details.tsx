import {useState} from 'preact/hooks';
import {ui} from '@playkit-js/kaltura-player-js';
import {AudioIcon, ScrollingText, ScrollingTextModes} from '..';
import {AudioPlayerSizes} from '../../types';
import * as styles from './audio-details.scss';
const {
  redux: {connect}
} = ui;

const mapStateToProps = ({engine}: any) => {
  const {isPlaying, isPlaybackStarted} = engine;
  return {
    isPlaying,
    isPlaybackStarted
  };
};

interface AudioDetailsProps {
  title?: string;
  description?: string;
  isPlaying?: boolean;
  isPlaybackStarted?: boolean;
  size: AudioPlayerSizes;
}

export const AudioDetailsComponent = ({title = '', description = '', isPlaying = false, isPlaybackStarted = false, size}: AudioDetailsProps) => {
  const [descriptionHovered, setDescriptionHovered] = useState(false);
  const [titleHovered, setTitleHovered] = useState(false);

  const getDescription = () => {
    const parsed = new DOMParser().parseFromString(description, 'text/html');
    return parsed.body.textContent || '';
  };

  const mediumSize = size === AudioPlayerSizes.Medium;

  return (
    <div className={`${styles.audioPlayerDetails} ${styles[size!]}`} tabIndex={0}>
      <div className={styles.header}>
        <div className={styles.audioIconContainer}>{isPlaybackStarted ? <AudioIcon isLarge={mediumSize} isActive={isPlaying} /> : undefined}</div>
        <div className={styles.title} onMouseOver={() => setTitleHovered(true)} onMouseLeave={() => setTitleHovered(false)}>
          <ScrollingText
            id={'title'}
            updateOnPlayerSizeChange
            content={title}
            inActive={!(titleHovered || isPlaying) || descriptionHovered}
            mode={mediumSize ? ScrollingTextModes.Vertical : ScrollingTextModes.Horizontal}
            maxHeight={mediumSize ? 118 : undefined}
          />
        </div>
      </div>
      <div className={styles.description} onMouseOver={() => setDescriptionHovered(true)} onMouseLeave={() => setDescriptionHovered(false)}>
        <ScrollingText id={'description'} updateOnPlayerSizeChange content={getDescription()} inActive={!descriptionHovered} />
      </div>
    </div>
  );
};

// @ts-ignore
export const AudioDetails = connect<any, any>(mapStateToProps)(AudioDetailsComponent) as any;

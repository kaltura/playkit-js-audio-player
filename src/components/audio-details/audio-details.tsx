import {useState} from 'preact/hooks';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import {ui, core} from '@playkit-js/kaltura-player-js';
import {AudioIcon, ScrollingText, ScrollingTextModes, BufferingIcon} from '..';
import {AudioPlayerSizes} from '../../types';
import * as styles from './audio-details.scss';
const {
  redux: {connect}
} = ui;

const mapStateToProps = ({engine}: any) => {
  const {isPlaying, isPlaybackStarted, playerState} = engine;
  return {
    isPlaying,
    isPlaybackStarted,
    isBuffering: playerState?.currentState === core.StateType.BUFFERING
  };
};

interface AudioDetailsProps {
  title?: string;
  description?: string;
  isPlaying?: boolean;
  isPlaybackStarted?: boolean;
  isBuffering?: boolean;
  size: AudioPlayerSizes;
}

export const AudioDetailsComponent = ({
  title = '',
  description = '',
  isPlaying = false,
  isPlaybackStarted = false,
  isBuffering = false,
  size
}: AudioDetailsProps) => {
  const [descriptionHovered, setDescriptionHovered] = useState(false);
  const [titleHovered, setTitleHovered] = useState(false);

  const getDescription = () => {
    const parsed = new DOMParser().parseFromString(description, 'text/html');
    return parsed.body.textContent || '';
  };

  const largeSize = size === AudioPlayerSizes.Large;

  const renderIcon = () => {
    if (isBuffering) {
      return <BufferingIcon isLarge={largeSize} />;
    }
    return <AudioIcon isLarge={largeSize} isActive={isPlaying} />;
  };

  return (
    <div className={`${styles.audioPlayerDetails} ${styles[size!]}`} tabIndex={0}>
      <div className={styles.header}>
        {isPlaybackStarted && <div className={styles.audioIconContainer}>{renderIcon()}</div>}
        <div
          className={[styles.title, isPlaybackStarted ? styles.playbackStarted : ''].join(' ')}
          onMouseOver={() => setTitleHovered(true)}
          onMouseLeave={() => setTitleHovered(false)}>
          <ScrollingText
            id={'title'}
            updateOnPlayerSizeChange
            content={title}
            inActive={isBuffering || !(titleHovered || isPlaying) || descriptionHovered}
            mode={largeSize ? ScrollingTextModes.Vertical : ScrollingTextModes.Horizontal}
            maxHeight={largeSize ? 118 : undefined}
          />
        </div>
      </div>
      <div className={styles.description} onMouseOver={() => setDescriptionHovered(true)} onMouseLeave={() => setDescriptionHovered(false)}>
        <ScrollingText id={'description'} updateOnPlayerSizeChange content={getDescription()} inActive={!descriptionHovered} />
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const AudioDetails = connect<any, any>(mapStateToProps)(AudioDetailsComponent) as any;

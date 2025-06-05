import {h} from 'preact';
import {useState} from 'preact/hooks';
import {ui, core} from '@playkit-js/kaltura-player-js';
import {AudioIcon, ScrollingText, ScrollingTextModes} from '..';
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
  withVolumeMapBar?: boolean;
}

export const AudioDetailsComponent = ({
  title = '',
  description = '',
  isPlaying = false,
  isPlaybackStarted = false,
  isBuffering = false,
  withVolumeMapBar = false,
  size
}: AudioDetailsProps) => {
  const [descriptionHovered, setDescriptionHovered] = useState(false);
  const [titleHovered, setTitleHovered] = useState(false);

  const getDescription = () => {
    const parsed = new DOMParser().parseFromString(description, 'text/html');
    return parsed.body.textContent || '';
  };

  const largeSize = size === AudioPlayerSizes.Large;

  const getScrollingTextHeight = () => {
    if (withVolumeMapBar) {
      return largeSize ? 58 : 22;
    }
    return largeSize ? 118 : undefined;
  };

  const renderAudioIcon = () => {
    if (withVolumeMapBar) {
      return null;
    }
    return <AudioIcon isLarge={largeSize} isActive={isPlaying} isBuffering={isBuffering} />;
  };

  const audioPlayerDetailsClassNames = [styles.audioPlayerDetails, styles[size!], withVolumeMapBar ? styles.withVolumeMapBar : ''];

  return (
    <div className={audioPlayerDetailsClassNames.join(' ')}>
      <div className={styles.header}>
        {renderAudioIcon()}
        <div
          data-testid="audio-player-title-container"
          className={[styles.title, isPlaybackStarted ? styles.playbackStarted : ''].join(' ')}
          onMouseOver={() => setTitleHovered(true)}
          onMouseLeave={() => setTitleHovered(false)}>
          <ScrollingText
            id={'title'}
            updateOnPlayerSizeChange
            content={title}
            inActive={isBuffering || !(titleHovered || isPlaying) || descriptionHovered}
            mode={largeSize ? ScrollingTextModes.Vertical : ScrollingTextModes.Horizontal}
            maxHeight={getScrollingTextHeight()}
          />
        </div>
      </div>
      <div
        data-testid="audio-player-description-container"
        className={styles.description}
        onMouseOver={() => setDescriptionHovered(true)}
        onMouseLeave={() => setDescriptionHovered(false)}>
        <ScrollingText id={'description'} updateOnPlayerSizeChange content={getDescription()} inActive={!descriptionHovered} />
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const AudioDetails = connect<any, any>(mapStateToProps)(AudioDetailsComponent) as any;

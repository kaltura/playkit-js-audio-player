import {h} from 'preact';

import {core, ui} from '@playkit-js/kaltura-player-js';
import {PlaybackIcon} from '../playback-icon';
import {BufferingIcon} from '../buffering-icon';

import * as styles from './audio-icon.scss';

const {redux} = ui;

interface ConnectProps {
  isBuffering?: boolean;
  isPlaying?: boolean;
  isPlaybackStarted?: boolean;
}

const mapStateToProps = ({engine}: any) => {
    const {isPlaying, isPlaybackStarted, playerState} = engine;
    return {
      isPlaying,
      isPlaybackStarted,
      isBuffering: playerState?.currentState === core.StateType.BUFFERING
    };
  };

const AudioIconComponent = ({isBuffering, isPlaying, isPlaybackStarted}: ConnectProps) => {
    if (!isPlaybackStarted) {
      return null;
    }
  const renderIcon = () => {
    if (isBuffering) {
      return <BufferingIcon />;
    }
    return <PlaybackIcon isActive={isPlaying} />;
  };

  return <div className={styles.audioIconContainer}>{renderIcon()}</div>;
};

export const AudioIcon = redux.connect<any, any>(mapStateToProps)(AudioIconComponent) as any;
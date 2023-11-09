import {useEffect, useState} from 'preact/hooks';
//@ts-ignore
import {ui, core} from '@playkit-js/kaltura-player-js';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const {LiveTag, withPlayer} = ui.Components;
const {
  redux: {useSelector}
} = ui;

interface LiveTagProps {
  player?: any;
}

const LiveTagComponent = withPlayer(({player}: LiveTagProps) => {
  const playbackStarted = useSelector((state: any) => state.engine.isPlaybackStarted);
  const playbackEnded = useSelector((state: any) => state.engine.isPlaybackEnded);
  const playerState = useSelector((state: any) => state.engine.playerState);
  const [showLiveTag, setShowLiveTag] = useState(false);

  useEffect(() => {
    if (!showLiveTag && playerState.currentState === core.StateType.PLAYING) {
      setShowLiveTag(true);
    }
  }, [playerState]);

  if (player.isLive() && playbackStarted && !playbackEnded && showLiveTag) {
    return <LiveTag />;
  }

  return null;
});

export {LiveTagComponent};

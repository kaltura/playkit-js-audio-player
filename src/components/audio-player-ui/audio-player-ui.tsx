import {ComponentChildren} from 'preact';
interface AudioPlayerProps {
  children: ComponentChildren;
}

const AudioPlayerUI = ({children}: AudioPlayerProps) => {
  return <div>{children}</div>;
};

AudioPlayerUI.displayName = 'AudioPlayer';

export {AudioPlayerUI};

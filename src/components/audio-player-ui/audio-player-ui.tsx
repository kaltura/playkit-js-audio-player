interface AudioPlayerProps {
  children: any;
}

const AudioPlayerUI = ({children}: AudioPlayerProps) => {
  return <div>{children}</div>;
};

AudioPlayerUI.displayName = 'AudioPlayer';

export {AudioPlayerUI};

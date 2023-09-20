// import {useState, useEffect, useContext} from 'preact/hooks';
// import * as styles from './audio-player-preset.scss';
import {AudioSeekbar} from '../audio-seekbar';
import {AudioPlayerControls} from '../audio-player-controls';

//import {BasePlugin, KalturaPlayer, ui} from '@playkit-js/kaltura-player-js';

/**
 * Image with fixed dimensions and a fallback option for images which failed to load.
 *
 * @param {object} props Component props.
 * @param {string} props.poster Base image url.
 */

const AudioPlayerView = ({pluginConfig}: any) => {
  return (
    <div className="my-preset" style="position: relative; background-color: red; height: 160px; margin: 0">
      <AudioSeekbar />
      <AudioPlayerControls pluginConfig={pluginConfig} />
    </div>
  );
};

AudioPlayerView.displayName = 'AudioPlayer';

export {AudioPlayerView};

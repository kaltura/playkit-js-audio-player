// import {useState, useEffect, useContext} from 'preact/hooks';
// import * as styles from './audio-player-preset.scss';

//import {BasePlugin, KalturaPlayer, ui} from '@playkit-js/kaltura-player-js';

/**
 * Image with fixed dimensions and a fallback option for images which failed to load.
 *
 * @param {object} props Component props.
 * @param {string} props.poster Base image url.
 */

const AudioPlayerView = () => {
  return (
    <h1 className="my-preset" style="position: relative; background-color: red; height: 160px; margin: 0">
      This is a custom preset
    </h1>
  );
};

AudioPlayerView.displayName = 'AudioPlayer';

export {AudioPlayerView};

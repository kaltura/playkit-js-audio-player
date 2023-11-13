[![Build Status](https://github.com/kaltura/playkit-js-audio-player/actions/workflows/run_canary_full_flow.yaml/badge.svg)](https://github.com/kaltura/playkit-js-audio-player/actions/workflows/run_canary_full_flow.yaml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![](https://img.shields.io/npm/v/@playkit-js/audio-player/latest.svg)](https://www.npmjs.com/package/@playkit-js/audio-player)
[![](https://img.shields.io/npm/v/@playkit-js/audio-player/canary.svg)](https://www.npmjs.com/package/@playkit-js/audio-player/v/canary)

# playkit-js-audio-player

playkit-js-audio-player is a [kaltura player] plugin that allows entry playback with a minimal ui.

playkit-js-slate is written in [ECMAScript6] (`*.js`) and [TypeScript] (`*.ts`) (strongly typed superset of ES6),
and transpiled in ECMAScript5 using the [TypeScript compiler].

[Webpack] is used to build the distro bundle and serve the local development environment.

[kaltura player]: https://github.com/kaltura/kaltura-player-js.
[ecmascript6]: https://github.com/ericdouglas/ES6-Learning#articles--tutorials
[typescript]: https://www.typescriptlang.org/
[typescript compiler]: https://www.typescriptlang.org/docs/handbook/compiler-options.html
[webpack]: https://webpack.js.org/

## Features

The Audio Player plugin can play audio entries and video entries, and displays a minimal gui which contains the name, description and thumbnail of the entry, in addition to basic player controls.

## Getting Started

### Prerequisites

The plugin requires [Kaltura Player] to be loaded first.

[kaltura player]: https://github.com/kaltura/kaltura-player-js

### Installing

First, clone and run [yarn] to install dependencies:

[yarn]: https://yarnpkg.com/lang/en/

```
git clone https://github.com/kaltura/playkit-js-audio-player.git
cd playkit-js-audio-player
yarn install
```

### Building

Then, build the plugin

```javascript
yarn run build
```

### Testing

The plugin uses `cypress` tool for e2e tests

```javascript
yarn run test
```

### Embed the library in your test page

Finally, add the bundle as a script tag in your page, and initialize the player

```html
<script type="text/javascript" src="/PATH/TO/FILE/kaltura-player.js"></script>
<!--Kaltura player-->
<script type="text/javascript" src="/PATH/TO/FILE/playkit-audio-player.js"></script>
<!--PlayKit info plugin-->
<div id="player-placeholder" style="height:360px; width:640px">
  <script type="text/javascript">
    const config = {
     ...
     targetId: 'player-placeholder',
     plugins: {
       audioPlayer: {
        // showReplayButton is set to false by default.
        // If set to true, the loop button will be shown instead of the speed menu button
        showReplayButton: true
       }
     }
     ...
    };
    var player = KalturaPlayer.setup(config);
    player.loadMedia(...);
  </script>
</div>
```

## Demo

[https://kaltura.github.io/playkit-js-audio-player/demo/index.html](https://kaltura.github.io/playkit-js-audio-player/demo/index.html)

## Compatibility

playkit-js-audio-player is supported on:

- Chrome 39+ for Android
- Chrome 39+ for Desktop
- Firefox 41+ for Android
- Firefox 42+ for Desktop
- IE11 for Windows 8.1+
- Edge for Windows 10+
- Safari 8+ for MacOS 10.10+
- Safari for ipadOS 13+

## License

playkit-js-audio-player is released under [GNU Affero General Public License](LICENSE)


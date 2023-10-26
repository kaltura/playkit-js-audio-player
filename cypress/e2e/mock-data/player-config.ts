const PLAYER_CONFIG = {
  targetId: 'player-placeholder',
  provider: {
    partnerId: -1,
    env: {
      cdnUrl: 'http://mock-cdn',
      serviceUrl: 'http://mock-api'
    }
  },
  plugins: {
    kava: {
      disable: true
    },
    uiManagers: {},
    audioPlayer: {}
  },
  playback: {
    autoplay: false,
    muted: true
  }
};

export {PLAYER_CONFIG};

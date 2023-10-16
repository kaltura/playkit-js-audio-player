import {PLAYER_CONFIG} from '../e2e/mock-data';

interface KalturaPlayer {
  setup: (config: any) => Player;
}

interface Player {
  setMedia: (arg0: {session: {ks: string}; sources: {id: string; progressive: {mimetype: string; url: string}[]}}) => void;
  isLive: () => boolean;
  getVideoElement: () => {mediaKeys: any};
  ready: () => any;
}

interface Window {
  KalturaPlayer: KalturaPlayer;
}

let player: Player | null;

const loadPlayer = (playerConfig: any = {}): Promise<void> => {
  return new Promise(resolve => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cy.visit('index.html').then((win: Window) => {
      player = win.KalturaPlayer.setup({...PLAYER_CONFIG, ...playerConfig});
      resolve();
    });
  });
};

const setMedia = (
  sessionConfig = {ks: '5678'},
  sourcesConfig = {
    id: '1234',
    progressive: [
      {
        mimetype: 'video/mp4',
        url: './media/video.mp4'
      }
    ]
  }
) => {
  player?.setMedia({
    session: sessionConfig,
    sources: sourcesConfig
  });
};

const loadPlayerAndSetMedia = (playerConfig?: any, sessionConfig?: any, sourcesConfig?: any): Promise<void> => {
  return new Promise(resolve => {
    loadPlayer(playerConfig)
      .then(() => {
        setMedia(sessionConfig, sourcesConfig);
        return player?.ready();
      })
      .then(resolve);
  });
};

describe('audio player plugin', () => {
  describe('plugin load', () => {
    // TODO check preset unload
    // TODO check preset load
    // TODO check event handling
    // TODO verify that video player is not visible
    // TODO check with video entry
    // TODO check with audio entry
    // TODO check player dimensions
    describe('entry is not an audio or video entry', () => {
      it('should be visible while player is loading', () => {
        expect(0).to.equal(1);
      });
    });
    describe('entry is a video entry', () => {
      it('should be visible while player is loading', () => {
        expect(0).to.equal(1);
      });
    });
    describe('entry is an audio entry', () => {
      it('should be visible while player is loading', () => {
        expect(0).to.equal(1);
      });
    });
    it('should be visible while player is loading', () => {
      expect(0).to.equal(1);
    });
  });

  describe('loading display', () => {
    it('should be visible while player is loading', () => {
      expect(0).to.equal(1);
    });
  });
  describe('error display', () => {
    it('should be visible if there is an error', () => {
      expect(0).to.equal(1);
    });
  });
  describe('plugin display', () => {
    describe('color configuration', () => {
      it('should fail', () => {
        expect(0).to.equal(1);
      });
    });
    describe('audio icon', () => {
      it('should fail', () => {
        expect(0).to.equal(1);
      });
    });
    describe('entry title', () => {
      it('should fail', () => {
        expect(0).to.equal(1);
      });
    });
    describe('entry description', () => {
      it('should fail', () => {
        expect(0).to.equal(1);
      });
    });
    describe('entry thumbnail', () => {
      it('should fail', () => {
        expect(0).to.equal(1);
      });
    });
    describe('player controls', () => {
      describe('seekbar', () => {
        it('should fail', () => {
          expect(0).to.equal(1);
        });
      });
      describe('entry thumbnail', () => {
        it('should fail', () => {
          expect(0).to.equal(1);
        });
      });
      describe('loop button', () => {
        it('should fail', () => {
          expect(0).to.equal(1);
        });
      });
      describe('playback controls', () => {
        it('should fail', () => {
          expect(0).to.equal(1);
        });
      });
    });
  });
});

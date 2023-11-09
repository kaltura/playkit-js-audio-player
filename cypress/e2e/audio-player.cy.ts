import {PLAYER_CONFIG} from '../e2e/mock-data';

interface KalturaPlayer {
  setup: (config: any) => Player;
}

interface Player {
  setMedia: (arg0: {session: {ks: string}; sources: {id: string; progressive: {mimetype: string; url: string}[]}}) => void;
  isLive: () => boolean;
  getVideoElement: () => {mediaKeys: any};
  ready: () => any;
  play: () => void;
  pause: () => void;
  addEventListener: (eventName: string, eventHandler: () => void) => void;
  loadPlaylist: (playlistInfo: {playlistId: string}) => void;
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

const defaultSource = {
  id: '1234',
  progressive: [
    {
      mimetype: 'video/mp4',
      url: './media/video.mp4'
    }
  ],
  metadata: {
    name: 'name',
    description: 'description'
  }
};

const posterSource = {
  ...defaultSource,
  poster: './media/poster.png'
};

const setMedia = (sourcesConfig = defaultSource) => {
  player?.setMedia({
    session: {ks: '5678'},
    sources: sourcesConfig
  });
};

describe('audio player plugin', () => {
  describe('loading display', () => {
    it('should be visible while player is loading', () => {
      loadPlayer().then(() => {
        cy.get('[data-testid="audio-player-thumbnail-placeholder"]').should('be.visible');
      });
    });
  });

  describe('error display', () => {
    it('should be visible if there is an error', () => {
      return new Promise(resolve => {
        loadPlayer().then(() => {
          setMedia({id: '12345', metadata: {name: 'a', description: 'b'}, progressive: [{mimetype: 'video/mp4', url: 'aaaaaaaaa'}]});
          cy.get('[data-testid="audio-player-error-slate"]').should('be.visible');
          resolve(true);
        });
      });
    });
  });

  describe('plugin display', () => {
    describe('player video element', () => {
      it('should not be visible', () => {
        loadPlayer().then(() => {
          setMedia();
          cy.get('video').should('exist');
          cy.get('video').should('not.be.visible');
        });
      });
    });

    describe('entry title', () => {
      it('should be visible if title is set', () => {
        loadPlayer().then(() => {
          setMedia();
          cy.get('[data-testid="audio-player-title-container"]').within(() => {
            cy.get('[data-testid="scrolling-text"]').should('have.text', 'name');
          });
        });
      });
      it('should not be visible if title is not set', () => {
        loadPlayer().then(() => {
          setMedia({...defaultSource, metadata: {description: '', name: ''}});
          cy.get('[data-testid="audio-player-title-container"]').within(() => {
            cy.get('[data-testid="scrolling-text"]').should('not.be.visible');
          });
        });
      });
    });

    describe('entry description', () => {
      it('should not be visible if description is not set', () => {
        loadPlayer().then(() => {
          setMedia({...defaultSource, metadata: {description: '', name: ''}});
          cy.get('[data-testid="audio-player-description-container"]').within(() => {
            cy.get('[data-testid="scrolling-text"]').should('not.be.visible');
          });
        });
      });
      it('should be visible if description is set', () => {
        loadPlayer().then(() => {
          setMedia();
          cy.get('[data-testid="audio-player-description-container"]').within(() => {
            cy.get('[data-testid="scrolling-text"]').should('have.text', 'description');
          });
        });
      });
    });

    describe('entry thumbnail', () => {
      it('should be blank if thumbnail is not set', () => {
        loadPlayer().then(() => {
          setMedia();
          cy.get('[data-testid="audio-player-thumbnail"]').should('not.exist');
          cy.get('[data-testid="audio-player-background-image"]').should('not.exist');
          cy.get('[data-testid="audio-player-thumbnail-placeholder"]').should('be.visible');
        });
      });
      it('should be visible if thumbnail is set', () => {
        loadPlayer().then(() => {
          setMedia(posterSource);
          cy.get('[data-testid="audio-player-thumbnail"]').should('be.visible');
          cy.get('[data-testid="audio-player-background-image"]').should('be.visible');
          cy.get('[data-testid="audio-player-thumbnail-placeholder"]').should('not.exist');
        });
      });
    });

    describe('audio icon', () => {
      it('should be hidden before playback starts', () => {
        return new Promise(resolve => {
          loadPlayer().then(() => {
            setMedia();
          });
          setTimeout(() => {
            cy.get('[data-testid="audio-player-view"]').should('be.visible');
            cy.get('[data-testid="audio-player-audio-icon"]').should('not.exist');
            resolve(true);
          }, 1000);
        });
      });
      it('should show animation when playback is not paused', () => {
        loadPlayer().then(() => {
          setMedia();
          cy.get('[data-testid="audio-player-view"]').should('be.visible');
          player?.play();
          cy.get('[data-testid="audio-player-audio-icon"]').should('be.visible');
          cy.get('[data-testid="audio-player-audio-icon"]').invoke('attr', 'class').should('include', 'active');
        });
      });
      it('should show 3 dots icon when playback is paused', () => {
        loadPlayer().then(() => {
          setMedia();
          cy.get('[data-testid="audio-player-view"]').should('be.visible');
          player?.play();
          cy.get('[data-testid="audio-player-audio-icon"]').should('be.visible');
          cy.get('[data-testid="audio-player-audio-icon"]').invoke('attr', 'class').should('include', 'active');
          player?.pause();
          cy.get('[data-testid="audio-player-audio-icon"]').invoke('attr', 'class').should('not.include', 'active');
        });
      });

      describe('loading animation', () => {
        beforeEach(() => {
          cy.intercept(
            {
              url: '**/video.mp4',
              middleware: true
            },
            req => {
              req.on('response', res => {
                res.setThrottle(60);
              });
            }
          );
        });

        it('should be visible when player is buffering', () => {
          loadPlayer().then(() => {
            setMedia();
            player?.play();
            cy.get('[data-testid="audio-player-buffering-icon"]').should('be.visible');
          });
        });
      });
    });

    describe('player controls', () => {
      describe('loop button', () => {
        describe('loop button visibility', () => {
          it('should be hidden by default', () => {
            loadPlayer().then(() => {
              setMedia();
              cy.get('[data-testid="audio-player-speed-menu"]').should('be.visible');
              cy.get('[data-testid="audio-player-loop-button"]').should('not.exist');
            });
          });
          it('should be visible when showReplayButton is true', () => {
            loadPlayer({plugins: {audioPlayer: {showReplayButton: true}}}).then(() => {
              setMedia();
              cy.get('[data-testid="audio-player-loop-button"]').should('be.visible');
              cy.get('[data-testid="audio-player-speed-menu"]').should('not.exist');
            });
          });
        });

        describe('loop button functionality', () => {
          beforeEach(() => {
            return cy.wrap(
              loadPlayer({plugins: {audioPlayer: {showReplayButton: true}}}).then(() => {
                setMedia();
              })
            );
          });

          it('should not loop playback when not clicked', () => {
            cy.get('[data-testid="audio-player-loop-button"] button').should('be.visible');
            player?.play();

            return cy.wrap(
              new Promise(resolve => {
                let playCount = 0;
                player?.addEventListener('play', () => {
                  ++playCount;
                });

                setTimeout(() => {
                  if (playCount === 1) {
                    resolve(true);
                  }
                }, 6000);
              })
            );
          });

          it('should loop playback when clicked', () => {
            cy.get('[data-testid="audio-player-loop-button"] button').should('be.visible').click({force: true});
            player?.play();

            return cy.wrap(
              new Promise(resolve => {
                let playCount = 0;
                player?.addEventListener('play', () => {
                  ++playCount;

                  if (playCount >= 2) {
                    resolve(true);
                  }
                });
              })
            );
          });
        });
      });

      describe('playlist buttons', () => {
        it('should not be visible by default', () => {
          return loadPlayer().then(() => {
            setMedia();
            cy.get('[data-testid="audio-player-prev-button"]').should('not.exist');
            cy.get('[data-testid="audio-player-next-button"]').should('not.exist');
          });
        });

        it('should be visible if player is playing a playlist', () => {
          let callCount = 0;
          cy.intercept('**/multirequest', req => {
            if (!callCount) {
              req.reply({fixture: 'multirequest-playlist.json'});
            } else {
              req.reply({fixture: 'multirequest-entry.json'});
            }
            ++callCount;
          });

          return loadPlayer().then(() => {
            player?.loadPlaylist({playlistId: 'abcde'});
            cy.get('[data-testid="audio-player-prev-button"]').should('be.visible');
            cy.get('[data-testid="audio-player-next-button"]').should('be.visible');
          });
        });
      });

      describe('volume control', () => {
        it('should render volume control component', () => {
          return loadPlayer().then(() => {
            setMedia();
            cy.get('[data-testid="audio-player-volume-control"]').should('be.visible');
          });
        });
      });

      describe('rewind - forward buttons', () => {
        it('should render rewind / forward buttons', () => {
          return loadPlayer().then(() => {
            setMedia();
            cy.get('[data-testid="audio-player-forward-button"]').should('be.visible');
            cy.get('[data-testid="audio-player-rewind-button"]').should('be.visible');
          });
        });
      });
    });
  });
});

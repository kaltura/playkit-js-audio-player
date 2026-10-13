interface FocusMove {
  group: string;
  after: string;
}

// makes seekbar reachable right after the playback controls
const FOCUS_MOVES: FocusMove[] = [
  {
    group: '[data-testid="volume-map-seekbar"],[data-testid="audio-player-seekbar"]',
    after: [
      '[data-testid="audio-player-play-button"]',
      '[data-testid="audio-player-speed-menu"]',
      '[data-testid="audio-player-loop-button"]',
      '[data-testid="audio-player-prev-button"]',
      '[data-testid="audio-player-rewind-button"]',
      '[data-testid="audio-player-next-button"]',
      '[data-testid="audio-player-forward-button"]'
    ].join(',')
  }
];

const TABBABLE = 'a[href],area[href],button,input,select,textarea,iframe,[tabindex]';
// popups (menus, overlays) manage their own Tab handling
const POPUP = '[role="menu"],[role="dialog"],[role="alertdialog"]';
// the rotated volume slider overflows the controls row, focusing it would scroll the player gui
const FOCUS_OPTIONS: FocusOptions = {preventScroll: true};

const isTabbable = (el: HTMLElement): boolean =>
  el.tabIndex >= 0 &&
  !(el as HTMLButtonElement).disabled &&
  el.getClientRects().length > 0 &&
  getComputedStyle(el).visibility !== 'hidden' &&
  !el.closest(`[inert],[aria-hidden="true"],${POPUP}`);

const getTabbables = (root: HTMLElement): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(isTabbable);

const matches = (root: HTMLElement, selector: string, el: HTMLElement): boolean =>
  Array.from(root.querySelectorAll<HTMLElement>(selector)).some(group => group === el || group.contains(el));

const getOrdered = (root: HTMLElement, all: HTMLElement[]): HTMLElement[] =>
  FOCUS_MOVES.reduce((list, {group, after}) => {
    const moved = list.filter(el => matches(root, group, el));
    const rest = list.filter(el => !moved.includes(el));
    let anchor = -1;
    rest.forEach((el, i) => matches(root, after, el) && (anchor = i));
    // unknown/dynamic buttons are never moved, they keep their DOM position
    return moved.length && anchor !== -1 ? [...rest.slice(0, anchor + 1), ...moved, ...rest.slice(anchor + 1)] : list;
  }, all);

/**
 * Changes the Tab order inside the root to follow FOCUS_MOVES, without changing the DOM.
 * @param {HTMLElement} root - the audio player view element
 * @returns {Function} - detach function
 */
export const attachFocusOrder = (root: HTMLElement): (() => void) => {
  let tabbingIn = false;
  let backwards = false;

  const onDocKeyDown = (e: KeyboardEvent): void => {
    tabbingIn = e.key === 'Tab' && !root.contains(document.activeElement);
    backwards = e.shiftKey;
    // Tab moves focus synchronously; clear it so a later mouse focus isn't redirected
    setTimeout(() => (tabbingIn = false));
  };

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab' || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const active = document.activeElement as HTMLElement;
    if (!active || active.closest(POPUP)) return;
    const all = getTabbables(root);
    const ordered = getOrdered(root, all);
    const idx = ordered.indexOf(active);
    if (idx === -1) return;
    const next = ordered[idx + (e.shiftKey ? -1 : 1)];
    if (next) {
      e.preventDefault();
      next.focus(FOCUS_OPTIONS);
    } else if (all.length) {
      // no preventDefault: native Tab continues from the DOM edge and leaves the player
      (e.shiftKey ? all[0] : all[all.length - 1]).focus(FOCUS_OPTIONS);
    }
  };

  const onFocusIn = (e: FocusEvent): void => {
    if (!tabbingIn || root.contains(e.relatedTarget as Node) || (e.target as HTMLElement).closest(POPUP)) return;
    tabbingIn = false;
    const ordered = getOrdered(root, getTabbables(root));
    const target = backwards ? ordered[ordered.length - 1] : ordered[0];
    if (target && target !== e.target) {
      target.focus(FOCUS_OPTIONS);
    }
  };

  document.addEventListener('keydown', onDocKeyDown, true);
  root.addEventListener('keydown', onKeyDown);
  root.addEventListener('focusin', onFocusIn);

  return () => {
    document.removeEventListener('keydown', onDocKeyDown, true);
    root.removeEventListener('keydown', onKeyDown);
    root.removeEventListener('focusin', onFocusIn);
  };
};

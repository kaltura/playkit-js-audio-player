import {useState, useEffect, useRef} from 'preact/hooks';
import {ui} from '@playkit-js/kaltura-player-js';
import * as styles from './scrolling-text.scss';

const {
  redux: {connect}
} = ui;

const EDGE_SHIFT = 10;

export enum ScrollingTextModes {
  Vertical = 'vertical',
  Horizontal = 'horizontal'
}

interface ScrollingTextProps {
  id: string;
  content: string;
  scrollSpeed: number;
  updateOnPlayerSizeChange?: boolean;
  playerClientWidth: number;
  inActive?: boolean;
  onHoverChange?: (hovered: boolean) => void;
  mode: ScrollingTextModes;
  maxHeight?: number;
  fadeEffect?: boolean;
}

const mapStateToProps = ({shell}: any, {updateOnPlayerSizeChange}: ScrollingTextProps) => {
  const {playerClientRect} = shell;
  const playerClientWidth = updateOnPlayerSizeChange ? playerClientRect.width : -1;
  return {
    playerClientWidth
  };
};

const ScrollingTextComponent = ({
  id,
  inActive,
  mode,
  content,
  scrollSpeed,
  playerClientWidth,
  onHoverChange,
  maxHeight,
  fadeEffect
}: ScrollingTextProps) => {
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [fadeOnStart, setFadeOnStart] = useState(false);
  const [textContainerSize, setTextContainerSize] = useState(0);
  const [textSize, setTextSize] = useState(0);
  const [textContainerHeight, setTextContainerHeight] = useState(maxHeight ?? 'auto');

  const isHorisontal = mode === ScrollingTextModes.Horizontal;

  useEffect(() => {
    handleResize();
  }, []);

  useEffect(() => {
    if (playerClientWidth > -1) {
      handleResize();
    }
  }, [playerClientWidth]);

  useEffect(() => {
    const active = textSize > textContainerSize;
    setActive(active);
    if (!isHorisontal && textContainerSize > textSize) {
      setTextContainerHeight(textSize);
    }
  }, [textContainerSize, textSize]);

  const handleResize = () => {
    const textContainerRect = textContainerRef.current?.getBoundingClientRect();
    const textRect = textRef.current?.getBoundingClientRect();
    const newTextContainerSize = isHorisontal ? textContainerRect?.width : textContainerRect?.height;
    const newTextSize = isHorisontal ? textRect?.width : textRect?.height;
    if (newTextContainerSize && textContainerSize !== newTextContainerSize) {
      setTextContainerSize(newTextContainerSize);
    }
    if (newTextSize && textSize !== newTextSize) {
      setTextSize(newTextSize);
    }
  };

  const handleMouseOver = () => {
    if (onHoverChange) {
      onHoverChange(true);
    }
  };

  const handleMouseLeave = () => {
    if (onHoverChange) {
      onHoverChange(false);
    }
  };

  const handleAnimationStart = () => {
    if (active && fadeEffect) {
      setFadeOnStart(true);
    }
  };

  const generateAnimation = () => {
    const direction = isHorisontal ? 'translateX' : 'translateY';
    return (
      <style>
        {`@keyframes scrolling-text-${id} {
            0% {transform: ${direction}(0);}
            50% {transform: ${direction}(calc(-100% + ${textContainerSize - EDGE_SHIFT}px));}
            100% {transform: ${direction}(0);}
          }`}
      </style>
    );
  };

  const scrollingTextStyles: Record<string, string> = {};
  if (active) {
    scrollingTextStyles.animation = `scrolling-text-${id} linear ${(textSize / 100) * scrollSpeed}s .5s ${inActive ? 'paused' : 'running'} infinite`;
  }
  const textContainerClassNames = [styles.scrollingTextContainer, styles[mode]];
  if (active && fadeEffect) {
    if (fadeOnStart) {
      textContainerClassNames.push(styles.fadeBothSides);
    } else {
      textContainerClassNames.push(styles.fadeOnEnd);
    }
  }
  return (
    <div
      style={{
        height: textContainerHeight
      }}
      onAnimationStart={handleAnimationStart}
      className={textContainerClassNames.join(' ')}
      ref={textContainerRef}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}>
      {generateAnimation()}
      <div data-testid="scrolling-text" style={scrollingTextStyles} className={styles.scrollingText} ref={textRef}>
        {content}
      </div>
    </div>
  );
};

ScrollingTextComponent.defaultProps = {
  scrollSpeed: 10,
  inActive: false,
  activeOnHover: false,
  updateOnPlayerSizeChange: false,
  mode: ScrollingTextModes.Horizontal,
  fadeEffect: true
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const ScrollingText = connect<any, any>(mapStateToProps)(ScrollingTextComponent) as any;

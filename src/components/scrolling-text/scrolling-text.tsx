import * as styles from './scrolling-text.scss';

interface ScrollingTextProps {
  active: boolean;
  content: string;
}

export const ScrollingText = ({active, content}: ScrollingTextProps) => {
  return (
    <div className={styles.scrollingTextContainer}>
      <div className={[styles.scrollingText, active ? styles.active : ''].join(' ')}>{content}</div>
    </div>
  );
};

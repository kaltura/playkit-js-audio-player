import {h, Component} from 'preact';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import {core, ui} from '@playkit-js/kaltura-player-js';
import * as styles from './audio-seekbar.scss';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const {SeekBar, withPlayer, withEventDispatcher} = ui.Components;
const {redux, reducers, utils} = ui;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const {toHHMMSS, bindActions} = utils;

const COMPONENT_NAME = 'AudioSeekbar';

interface ConnectProps {
  currentTime: number;
  virtualTime: number;
  duration: number;
  isDraggingActive: boolean;
  eventManager: any;
  player: any;
  notifyChange: (payload: any) => void;
  updateCurrentTime: (time: number) => void;
  updateVirtualTime: (time: number) => void;
  updateSeekbarDraggingStatus: (data: boolean) => void;
  updateSeekbarHoverActive: (data: boolean) => void;
  updateSeekbarClientRect: (data: any) => void;
}

const mapStateToProps = (state: any) => ({
  currentTime: state.seekbar.currentTime,
  virtualTime: state.seekbar.virtualTime,
  duration: state.engine.duration,
  isDraggingActive: state.seekbar.draggingActive
});

@withPlayer
@withEventDispatcher(COMPONENT_NAME)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
@redux.connect(mapStateToProps, bindActions(reducers.seekbar.actions))
class AudioSeekbar extends Component<ConnectProps | any> {
  _store: any;

  constructor() {
    super();
    this._store = redux.useStore();
  }

  componentDidMount() {
    this.props.eventManager.listen(this.props.player, core.EventType.TIME_UPDATE, () => {
      if (!this.props.isDraggingActive) {
        this.props.updateCurrentTime(this.props.player.currentTime);
      }
    });
  }

  private _handleChangeCurrentTime = (time: number) => {
    this.props.player.currentTime = time;
  };
  render() {
    if (this.props.player.isLive() && !this.props.player.isDvr()) {
      return null;
    }
    const showTime = !this.props.player.isLive();
    return (
      <div className={styles.audioSeekbar}>
        {showTime && <div className={styles.currentTime}>{toHHMMSS(this.props.currentTime)}</div>}
        <div className={styles.seekbarWrapper}>
          <SeekBar
            changeCurrentTime={this._handleChangeCurrentTime}
            updateSeekbarDraggingStatus={this.props.updateSeekbarDraggingStatus}
            updateSeekbarHoverActive={this.props.updateSeekbarHoverActive}
            updateSeekbarClientRect={this.props.updateSeekbarClientRect}
            updateCurrentTime={this.props.updateCurrentTime}
            updateVirtualTime={this.props.updateVirtualTime}
            currentTime={this.props.currentTime}
            virtualTime={this.props.virtualTime}
            duration={this.props.duration}
            isDraggingActive={this.props.isDraggingActive}
            isMobile={true}
            notifyChange={this.props.notifyChange}
          />
        </div>
        {showTime && <div className={styles.duration}>{toHHMMSS(this.props.duration)}</div>}
      </div>
    );
  }
}

AudioSeekbar.displayName = COMPONENT_NAME;
export {AudioSeekbar};

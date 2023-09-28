import {h, Component} from 'preact';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import {core, ui} from '@playkit-js/kaltura-player-js';
import {Button, ButtonSize, ButtonType} from '@playkit-js/common/dist/components/button';
const {withText, Text} = ui.preacti18n;
import * as styles from './loop-button.scss';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const {withPlayer} = ui.Components;
const {Event} = ui;

const COMPONENT_NAME = 'LoopButton';

interface LoopButtonProps {
  player: any;
  eventManager: any;
  enableLoop?: string;
  disableLoop?: string;
}

interface LoopButtonState {
  loopEnabled: boolean;
}

const translates = {
  enableLoop: <Text id="audioPlayer.enableLoop">Enable loop</Text>,
  disableLoop: <Text id="audioPlayer.disableLoop">Disable loop</Text>
};

@withPlayer
@Event.withEventManager
@withText(translates)
class LoopButton extends Component<LoopButtonProps & any, LoopButtonState> {
  constructor() {
    super();
    this.state = {
      loopEnabled: false
    };
  }

  componentDidMount() {
    this.props.eventManager.listen(this.props.player, core.EventType.ENDED, () => {
      if (this.state.loopEnabled) {
        this.props.player.play();
      }
    });
  }

  private _handleClick = () => {
    this.setState(state => ({
      loopEnabled: !state.loopEnabled
    }));
  };

  render() {
    const {loopEnabled} = this.state;
    return (
      <div className={styles.loopButtonWrapper}>
        <Button
          onClick={this._handleClick}
          icon="replay"
          type={loopEnabled ? ButtonType.primary : ButtonType.borderless}
          size={ButtonSize.medium}
          tooltip={{
            label: loopEnabled ? this.props.disableLoop : this.props.enableLoop
          }}
          ariaLabel={loopEnabled ? this.props.disableLoop : this.props.enableLoop}
        />
      </div>
    );
  }
}

LoopButton.displayName = COMPONENT_NAME;
export {LoopButton};

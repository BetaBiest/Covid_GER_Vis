import { timeout } from "d3";
import { Component } from "react";

const playSVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="white"
    width="18px"
    height="18px"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M8 5v14l11-7z" />
  </svg>
);

const pauseSVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="white"
    width="18px"
    height="18px"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

interface IProps {
  min: number;
  max: number;
  /**starting value
   * @default min
   */
  value?: number;
  /**runtime on play from min to max in ms */
  runtime: number;
}
interface IState {
  value: number;
  buttonContent: React.ReactNode;
  buttonFunction: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}
export default class PPSlider extends Component<IProps, IState> {
  playID: number;

  constructor(props: IProps) {
    super(props);

    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.onSliderChange = this.onSliderChange.bind(this);

    const { min, max } = this.props;
    let { value = min } = this.props;
    if (value < min) value = min;
    else if (max < value) value = max;

    this.state = {
      value: value,
      buttonContent: playSVG,
      buttonFunction: this.play,
    };

    this.playID = 0;
  }

  play(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const { min, max, runtime } = this.props;
    if (+event.currentTarget.value < max) {
      const steps = max - min;
      const timePerStep = runtime / steps;

      this.setState({
        buttonContent: pauseSVG,
        buttonFunction: this.pause,
      });
      this.playID = window.setInterval(() => this.tick(), timePerStep);
    }
  }

  pause(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | void) {
    this.setState({
      buttonContent: playSVG,
      buttonFunction: this.play,
    });
    clearInterval(this.playID);
  }

  tick() {
    if (this.state.value < this.props.max) {
      this.setState((prev) => {
        return {
          value: prev.value + 1,
        };
      });
    } else {
      this.pause();
    }
  }

  onSliderChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ value: +event.currentTarget.value });
  }

  render() {
    const { min, max } = this.props;

    return (
      <div className="ppslider">
        <button onClick={this.state.buttonFunction}>
          {this.state.buttonContent}
        </button>
        <input
          className="slider"
          type="range"
          min={min}
          max={max}
          value={this.state.value}
          onChange={this.onSliderChange}
        />
      </div>
    );
  }
}

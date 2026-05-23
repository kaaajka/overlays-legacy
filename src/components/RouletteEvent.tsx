import React from "react";
import { observer } from "mobx-react";
import { action, makeObservable, observable, reaction, runInAction } from "mobx";
import type { IReactionDisposer } from "mobx";

import type { RouletteEventModel } from "../models/RouletteEvent";
import { EventState } from "../models/Event";
import { AppConfig } from "../config";
import { playOverlayAudio } from "../audio/playOverlayAudio";

type RollAnimation = {
  start: number;
  duration: number;
  dest: number;
};

@observer
export default class RouletteEvent extends React.Component<IRouletteEventProps> {
  private minBlocks = 18;
  private blockWidth = 105;
  private percentagePerBlock = 100 / this.minBlocks;
  private actualBlocks = this.minBlocks;
  private blocksMoved: number = 0;
  private readonly spinningSoundUrl = AppConfig.assetUrl("/assets/sounds/spinning.mp3");
  private readonly winSoundUrl = AppConfig.assetUrl("/assets/sounds/win.mp3");

  private moveAnimation?: ReturnType<typeof setTimeout>;
  private timeout?: ReturnType<typeof setTimeout>;
  private disposeWinnerReaction?: IReactionDisposer;
  private rollAnimation?: RollAnimation;
  private rolling: boolean = false;
  finished: boolean = false;

  private readonly rollerRef: React.RefObject<HTMLDivElement> = React.createRef();

  constructor(props: IRouletteEventProps) {
    super(props);

    this.disposeWinnerReaction = reaction(
      () => this.props.event.winner,
      (ticket) => {
        if (typeof ticket === "number") {
          if (this.timeout) clearTimeout(this.timeout);

          this.timeout = setTimeout(() => {
            this.startRoll(ticket);
          }, 5000);
        }
      },
    );

    makeObservable(this, {
      finished: observable,
      setFinished: action,
    });
  }

  componentDidMount() {
    this.blocksMoved = 0;
    this.rolling = false;
    runInAction(() => {
      this.finished = false;
    });

    this.updatePosition(0);

    this.moveAnimation = setInterval(this.makeAnim, 1000 / 60);
  }

  componentWillUnmount() {
    this.disposeWinnerReaction?.();
    this.disposeWinnerReaction = undefined;

    if (this.moveAnimation) clearInterval(this.moveAnimation);
    if (this.timeout) clearTimeout(this.timeout);
  }

  render() {
    const { event, images } = this.props;

    if (event.state === EventState.PREPARE)
      return (
        <div className={"event center"}>
          {Object.prototype.hasOwnProperty.call(images, event.key) && (
            <div className={"image"}>
              <img src={images[event.key]} alt={""} />
            </div>
          )}
          <div className={"desc"}>{event.description}</div>
        </div>
      );

    const blocks = this.calculateBlocks();
    const winningItem =
      event.winner && this.finished
        ? event.items.find((item) => item.start <= event.winner && item.end >= event.winner)
        : null;

    return (
      <div className={"event roller"}>
        <div className={"inner"}>
          <div className={"pointer"} />
          <div className={"blocks"} ref={this.rollerRef}>
            {blocks}
          </div>
        </div>

        {!!winningItem && <div className={"text"}>{winningItem.name}</div>}
      </div>
    );
  }

  setFinished(state: boolean) {
    if (this.finished !== state) this.finished = state;
  }

  private calculateBlocks() {
    if (!this.props.event.items) return null;

    const normal = [],
      copy = [];

    let numBlocks = 0,
      index = 1;
    for (const item of this.props.event.items) {
      const blocks = Math.ceil(item.chance / this.percentagePerBlock);

      for (let i = 0; i < blocks; i++) {
        normal.push(
          <div
            className={"o reward"}
            data-start={item.start}
            data-end={item.end}
            style={{
              backgroundImage: `url(${AppConfig.assetUrl(`/assets/images/roulette/${item.image}`)})`,
            }}
            key={`reward_${index++}`}
            title={item.name}
          />,
        );
        copy.push(
          <div
            className={"c reward"}
            data-start={item.start}
            data-end={item.end}
            style={{
              backgroundImage: `url(${AppConfig.assetUrl(`/assets/images/roulette/${item.image}`)})`,
            }}
            key={`reward_${index++}`}
            title={item.name}
          />,
        );

        numBlocks++;
      }
    }

    this.actualBlocks = numBlocks;

    return normal.concat(copy);
  }

  private updatePosition(offset: number) {
    const l = this.actualBlocks * this.blockWidth;

    offset = -((offset + l - 790 / 2) % l);

    if (this.rollerRef.current) this.rollerRef.current.style.transform = `translateX(${offset}px)`;
  }

  private startRoll(winningTicket: number) {
    if (this.rolling || !this.rollerRef.current) return;

    this.rolling = true;

    const elements = Array.from(
      this.rollerRef.current.querySelectorAll(".o[data-start][data-end]").values(),
    ).filter((element) => {
      const start = element.getAttribute("data-start");
      const end = element.getAttribute("data-end");

      if (!start || !end) return false;

      return Number(start) <= winningTicket && Number(end) >= winningTicket;
    });

    const randomElement = elements[Math.floor(Math.random() * elements.length)];

    if (!randomElement) return;

    const index = Array.prototype.slice
      .call(this.rollerRef.current.children)
      .indexOf(randomElement);

    let destAngle = this.blockWidth * index;

    destAngle += this.actualBlocks * this.blockWidth * 2;
    destAngle += Math.random() * (this.blockWidth - 3 - 3) + 3;

    playOverlayAudio({
      url: this.spinningSoundUrl,
      volume: 0.5,
      label: "Roulette spinning sound",
      mutedFixtureAudioKind: "template",
    });

    this.rollAnimation = {
      duration: 10000,
      start: Date.now(),
      dest: destAngle,
    };
  }

  private makeAnim = () => {
    if (this.rollAnimation) {
      const now = Date.now(),
        p = (now - this.rollAnimation.start) / this.rollAnimation.duration,
        c = RouletteEvent.moveAnim(p);

      if (now - this.rollAnimation.start <= this.rollAnimation.duration)
        this.updatePosition(this.rollAnimation.dest * c);
      else {
        if (!this.finished)
          playOverlayAudio({
            url: this.winSoundUrl,
            volume: 0.4,
            label: "Roulette win sound",
            mutedFixtureAudioKind: "template",
          });

        this.setFinished(true);
      }
    } else this.updatePosition(this.blocksMoved++);
  };

  private static moveAnim(n: number): number {
    return --n * n * n + 1;
  }
}

interface IRouletteEventProps {
  images: Record<string, string>;
  event: RouletteEventModel;
}

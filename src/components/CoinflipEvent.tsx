import React from "react";
import { observer } from "mobx-react";
import { action, makeObservable, observable, reaction } from "mobx";
import type { IReactionDisposer } from "mobx";

import { CoinflipEventModel } from "../models/CoinflipEvent";
import { EventState } from "../models/Event";
import { AppConfig } from "../config";

const timeoutTimes: { spin: number, hideSegmentImage: number } = {
    spin: 2 * 1000,
    hideSegmentImage: (2 + 7 + 0.5 + 4 + 1.5) * 1000 
}

@observer
export default class CoinflipEvent extends React.Component<ICoinflipEventProps, {}> {
    private spinningSound = new Audio(AppConfig.assetUrl("/assets/sounds/spinning.mp3"));
    private winSound = new Audio(AppConfig.assetUrl("/assets/sounds/win.mp3"));

    private segmentRefs: React.RefObject<HTMLDivElement>[] = [...new Array(100)].map(() => React.createRef());
    private timeouts: { spin?: ReturnType<typeof setTimeout>, hideSegmentImage?: ReturnType<typeof setTimeout> } = {};
    private disposeWinnerReaction?: IReactionDisposer;

    hideSegmentImage: boolean = false;

    constructor(props: ICoinflipEventProps) {
        super(props);

        this.disposeWinnerReaction = reaction(
            () => this.props.event.winner,
            (winner) => {
                if (typeof winner === "number") {
                    if (this.timeouts.spin) clearTimeout(this.timeouts.spin);
                    if (this.timeouts.hideSegmentImage) clearTimeout(this.timeouts.hideSegmentImage);
                    
                    this.timeouts.spin = setTimeout(() => {
                        this.spinningSound.play();
                    }, timeoutTimes.spin);

                    this.timeouts.hideSegmentImage = setTimeout(() => {
                        this.setHideSegmentImage(true);
                    }, timeoutTimes.hideSegmentImage);
                }
            }
        );

        makeObservable(this, {
            hideSegmentImage: observable,
            setHideSegmentImage: action
        });
    }

    componentDidMount() {
        this.winSound.volume = .4;
        this.spinningSound.volume = .5;
    }

    componentWillUnmount() {
        this.disposeWinnerReaction?.();
        this.disposeWinnerReaction = undefined;

        if (this.timeouts.spin) clearTimeout(this.timeouts.spin);
        if (this.timeouts.hideSegmentImage) clearTimeout(this.timeouts.hideSegmentImage);
    }

    render() {
        const { event, images } = this.props;

        if (event.state === EventState.PREPARE) {
            return (
                <div className={"event center"}>
                    {images.hasOwnProperty(event.key) && (
                        <div className={"image"}>
                            <img src={images[event.key]} alt={""} />
                        </div>
                    )}
                    <div className={"desc"}>{event.description}</div>
                </div>
            );
        }

        const coinLandingSide = this.props.event.coin_landing_side === 1 ? 'head' : 'tail';

        const rouletteClassNames = [
            "roulette", 
            `chosen-segment-${this.props.event.winner}`,
        ];
        const notChosenSegmentClassNames = [
            "segment",
            "not-chosen"
        ];
        const coinClassNames = [
            "coin",
            `land-${coinLandingSide}`
        ];
        const coinFrontClassNames = [
            "front"
        ];

        if (this.hideSegmentImage) coinFrontClassNames.push('show-head-image');
        if (!!this.props.event.coin_chosen_side) {
            const coinChosenSide = this.props.event.coin_chosen_side === 1 ? 'head': 'tail';
            rouletteClassNames.push('chosen-side');
            coinClassNames.push(`chosen-${coinChosenSide}`);
        }

        return (
            <div className={"event coinflip"}>
                <div className={rouletteClassNames.join(" ")}>
                    {[...new Array(100)].map((_, i) => {
                        if (this.props.event.winner === i) {
                            return (
                                <div key={`segment_${i}`} className={"segment chosen"} ref={this.segmentRefs[i]}>
                                    <div className={"inner"}>
                                        <div className={coinClassNames.join(" ")}>
                                            <div className={coinFrontClassNames.join(" ")}>
                                                {!this.hideSegmentImage && <p>{event.segments[i]?.name ?? ""}</p>}
                                            </div>
                                            <div className={"thick"}></div>
                                            <div className={"back"}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <div key={`segment_${i}`} className={notChosenSegmentClassNames.join(" ")} ref={this.segmentRefs[i]}></div>
                        )
                    })}
                </div>
            </div>
        );
    }

    setHideSegmentImage(state: boolean) {
        if (this.hideSegmentImage !== state) 
            this.hideSegmentImage = state;
    }
}

interface ICoinflipEventProps {
    images: { [key: string]: any };
    event: CoinflipEventModel;
}

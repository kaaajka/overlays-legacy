import React from "react";
// import ReactHTMLParser from "html-react-parser";
import { RouteComponentProps } from "react-router-dom";
import { observer } from "mobx-react";
import { action, makeObservable, observable, reaction } from "mobx";

import { EventModel, EventState } from "../models/Event";
import { RouletteEventModel } from "../models/RouletteEvent";
import { NormalEventModel } from "../models/NormalEvent";
import { DonateEventModel } from "../models/DonateEvent";
import { CoinflipEventModel } from "../models/CoinflipEvent";

import RouletteEvent from "./RouletteEvent";
import NormalEvent from "./NormalEvent";
import DonateEvent from "./DonateEvent";
import CoinflipEvent from "./CoinflipEvent";

import { AppConfig } from "../config";

import "../style/app.scss";

import muteImage from "../assets/images/pobrane_2.png";
import censureImage from "../assets/images/pobrane_3.png";
import withoutRImage from "../assets/images/pobrane_1.png";
import dogsImage from "../assets/images/pobrane_5.png";
import rouletteImage from "../assets/images/pobrane_6.webp";
import coinflipImage from "../assets/images/cat_surprised.gif";


const images: { [key: string]: any } = {
    mute: muteImage,
    censure: censureImage,
    withoutR: withoutRImage,
    dogs: dogsImage,
    roulette: rouletteImage,
    coinflip: coinflipImage
};

const randomSounds = [
    new Audio("/assets/sounds/1.mp3"),
    new Audio("/assets/sounds/2.mp3"),
    new Audio("/assets/sounds/3.mp3"),
    new Audio("/assets/sounds/4.mp3"),
    new Audio("/assets/sounds/5.mp3"),
    new Audio("/assets/sounds/6.mp3"),
    new Audio("/assets/sounds/7.mp3"),
    new Audio("/assets/sounds/8.mp3"),
    new Audio("/assets/sounds/9.mp3"),
    new Audio("/assets/sounds/10.mp3"),
    new Audio("/assets/sounds/11.mp3"),
];

const dogsSounds = [randomSounds[2], randomSounds[4], randomSounds[5], randomSounds[6], randomSounds[7], randomSounds[8], randomSounds[9], randomSounds[10]];

const coinflipSounds = [
    new Audio("/assets/sounds/12.mp3"),
    new Audio("/assets/sounds/13.mp3"),
    new Audio("/assets/sounds/14.mp3"),
    new Audio("/assets/sounds/15.mp3"),
];

let EVENTS = {};
switch (process.env.REACT_APP_ENV) {
    default:
    case 'prod':
        EVENTS = {
            'donate_prepare': ['prepare'],
            'prepare_started': ['prepare', 'started'],
            'update': ['update'],
            'finished': ['finished'],
        };
        break;
    case 'test':
        EVENTS = {
            'donate_prepare': ['prepare', 'test'],
            'prepare_started': ['prepare', 'started', 't_prepare', 't_started'],
            'update': ['update', 't_update'],
            'finished': ['finished', 't_finished'],
        };
        break;
}

@observer
export class PageChannel extends React.Component<IPageChannelProps & RouteComponentProps<{ id: string }>, {}> {
    connecting: boolean = true;
    currentEvent?: EventModel;
    currentPlaying?: HTMLAudioElement;

    donateList: DonateEventModel[] = [];
    currentDonate?: DonateEventModel;

    private ws?: WebSocket;
    private timeout: number = 250;
    private connectInterval?: NodeJS.Timeout;
    private changeDonateTimeout?: NodeJS.Timeout;

    private donateAlertQueue: string[] = [];
    private currentDonateAlert?: string;

    constructor(props: IPageChannelProps & RouteComponentProps<{ id: string }>) {
        super(props);

        makeObservable(this, {
            connecting: observable,
            currentEvent: observable,
            currentPlaying: observable,
            donateList: observable,
            currentDonate: observable,

            setConnecting: action,
            setCurrentEvent: action,
            setCurrentPlaying: action,
            pushDonate: action,
            donateFinished: action.bound
        });

        reaction(
            () => this.accountKey,
            (accountKey) => {
                this.closeConnection();
                this.createConnection(accountKey);
            }
        );
    }

    componentDidMount() {
        this.closeConnection();
        this.createConnection(this.accountKey);
    }

    componentWillUnmount() {
        this.closeConnection();
    }

    render() {
        return (
            <div>
                {this.connecting && <h1>Łączenie...</h1>}
                {!this.connecting && !!this.currentDonate && <DonateEvent donate={this.currentDonate} onFinished={this.donateFinished} />}

                {!this.connecting &&
                    !!this.currentEvent &&
                    (this.currentEvent instanceof RouletteEventModel ? (
                        <RouletteEvent images={images} event={this.currentEvent} />
                    ) : this.currentEvent instanceof CoinflipEventModel ? (
                        <CoinflipEvent images={images} event={this.currentEvent} />
                    ) : (
                        <NormalEvent images={images} event={this.currentEvent as NormalEventModel} />
                    ))}
            </div>
        );
    }

    setConnecting(state: boolean) {
        if (this.connecting !== state) this.connecting = state;
    }

    setCurrentEvent(event?: EventModel) {
        this.currentEvent = event;
    }

    setCurrentPlaying(url?: HTMLAudioElement) {
        if (typeof url !== "undefined") {
            if (this.currentPlaying) {
                this.currentPlaying.pause();
                this.currentPlaying = undefined;
            }

            this.currentPlaying = url;
            this.currentPlaying.volume = 0.3;
            this.currentPlaying.play();
        } else {
            if (this.currentPlaying) {
                this.currentPlaying.pause();

                this.currentPlaying = undefined;
            }
        }
    }

    donateFinished() {
        if (!this.currentDonate) return;

        this.donateList = this.donateList.splice(1);
        this.currentDonate = undefined;

        if (this.changeDonateTimeout) clearTimeout(this.changeDonateTimeout);

        this.changeDonateTimeout = setTimeout(
            action(() => {
                this.currentDonateAlert = undefined;

                this.submitFirstAlert();

                if (this.donateList.length) this.currentDonate = this.donateList[0];
            }),
            50
        );
    }

    pushDonate(donate: DonateEventModel) {
        this.donateList.push(donate);

        if (!this.currentDonate) {
            if (this.changeDonateTimeout) clearTimeout(this.changeDonateTimeout);

            this.changeDonateTimeout = setTimeout(
                action(() => {
                    if (this.donateList.length) this.currentDonate = this.donateList[0];
                }),
                50
            );
        }
    }

    private closeConnection() {
        if (this.connectInterval) clearTimeout(this.connectInterval);
        if (this.changeDonateTimeout) clearTimeout(this.changeDonateTimeout);

        this.setCurrentEvent(undefined);
        this.setCurrentPlaying(undefined);

        if (this.ws) {
            this.ws.close();
            this.ws.onopen = null;
            this.ws.onerror = null;
            this.ws.onclose = null;
            this.ws.onmessage = null;
            this.ws = undefined;
        }
    }

    private createConnection(accountKey: string) {
        const ws = new WebSocket(AppConfig.ws + `?account=${accountKey}`);

        ws.onopen = () => {
            console.log("connected websocket main component");

            this.timeout = 250;

            if (this.connecting) this.setConnecting(false);

            if (this.connectInterval) clearTimeout(this.connectInterval);
        };
        ws.onerror = () => {
            console.error("Socket encountered error: ", "Closing socket");

            ws.close();
        };
        ws.onclose = (e) => {
            console.log(`Socket is closed. Reconnect will be attempted in ${Math.min(10000 / 1000, (this.timeout + this.timeout) / 1000)} second.`, e.reason);

            this.setCurrentEvent(undefined);
            this.timeout = this.timeout + this.timeout;
            this.connectInterval = setTimeout(() => {
                if (!this.ws || this.ws.readyState === WebSocket.CLOSED) this.createConnection(accountKey);
            }, Math.min(10000, this.timeout));
        };
        ws.onmessage = ({ isTrusted, data }) => {
            if (!isTrusted) return;

            try {
                const json = JSON.parse(data);
                if (!json.hasOwnProperty("event") || !json.hasOwnProperty("key") || !json.hasOwnProperty("id")) return;

                if (json.event === "prepare" && json.key === "playSound") {
                    let { volume, url } = json.args;

                    if (!volume || !url) return;

                    const audio = new Audio(url);

                    audio.volume = Number(volume);

                    audio.play().catch(() => {});
                // } else if (json.event === "prepare" && json.key === "donate") {
                // } else if (["prepare", "test"].includes(json.event) && json.key === "donate") {
                } else if (EVENTS['donate_prepare'].includes(json.event) && json.key === "donate") {
                    const preparedArgs = json.args;
                    if (typeof preparedArgs.message !== 'undefined') {
                        preparedArgs.message = this.prepareDonateMessage(preparedArgs.message);
                    }
                    this.pushDonate(new DonateEventModel(json.args));
                } else if (json.event === "alertList") {
                    if (json.key === "set") {
                        this.donateAlertQueue = json.args.list;

                        this.submitFirstAlert();
                    } else if (json.key === "add") {
                        const index = this.donateAlertQueue.indexOf(json.args.id);

                        if (index === -1) {
                            this.donateAlertQueue.push(json.args.id);

                            this.submitFirstAlert();
                        }
                    } else if (json.key === "delete") {
                        const index = this.donateAlertQueue.indexOf(json.args.id);

                        if (index > -1) this.donateAlertQueue.splice(index, 1);
                    }
                } else {
                    // if (["prepare", "started"].includes(json.event)) {
                    // if (["t_prepare", "prepare", "t_started", "started"].includes(json.event)) {
                    if (EVENTS['prepare_started'].includes(json.event)) {
                        const params = {
                            id: json.id,
                            key: json.key,
                            name: json.args.name,
                            description: json.args.description,
                        };
                        let event: EventModel;
                        switch (json.key) {
                            case "roulette":
                                event = new RouletteEventModel({
                                    ...params,
                                    items: json.args.items
                                });
                            break;
                            case "coinflip":
                                event = new CoinflipEventModel({
                                    ...params,
                                    segments: json.args.segments
                                });
                            break;
                            default:
                                event = new NormalEventModel(params);
                            break;
                        }

                        const toUpdate: { state: EventState; time?: number; winner?: number; coin_landing_side?: number } = { state: json.event };
                        
                        // if (json.event === "prepare") {
                        if (json.event === "t_prepare") toUpdate.state = EventState.PREPARE;
                        if (["t_prepare", "prepare"].includes(json.event)) {
                            let list: HTMLAudioElement[];
                            switch (json.key) {
                                case "dogs":
                                    list = dogsSounds;
                                    break;
                                case "coinflip":
                                    list = coinflipSounds;
                                    break;
                                default:
                                    list = randomSounds;
                                    break;
                            }
                            const randomSound = list[Math.floor(Math.random() * list.length)];

                            this.setCurrentPlaying(randomSound);
                        } else {
                            if (["roulette", "coinflip"].includes(json.key)) toUpdate.winner = json.args.winner;
                            if (json.key === "coinflip") toUpdate.coin_landing_side = json.args.coin_landing_side;

                            toUpdate.time = json.args.time;
                        }

                        event.update(toUpdate);

                        this.setCurrentEvent(event);
                    // } else if (json.event === "update") {
                    // } else if (["t_update", "update"].includes(json.event)) {
                    } else if (EVENTS['update'].includes(json.event)) {
                        if (this.currentEvent && this.currentEvent.id === json.id) {
                            this.currentEvent.update({ [json.args.key]: json.args.value });
                        }
                    // } else if (json.event === "finished") {
                    // } else if (["t_finished", "finished"].includes(json.event)) {
                    } else if (EVENTS['finished'].includes(json.event)) {
                        if (this.currentEvent && this.currentEvent.id === json.id) this.setCurrentEvent(undefined);
                    }
                }
            } catch (err) {
                console.log(err);
            }
        };

        this.ws = ws;
    }

    private prepareDonateMessage(message: string) {
        let output = message;
        // output = output.replaceAll('/default/light/1.0', '/default/light/2.0');
        // return ReactHTMLParser(output);
        output = output.replaceAll(/<img(?:.*?)alt="(.*?)"(?:.*?)>/g, (match, p1) => p1 ? p1 : '');
        return output;
    }

    private submitFirstAlert() {
        if (!this.currentDonateAlert && !!this.donateAlertQueue.length) {
            this.currentDonateAlert = this.donateAlertQueue[0];

            this.ws &&
                this.ws.send(
                    JSON.stringify({
                        type: "acceptAlert",
                        args: {
                            id: this.currentDonateAlert,
                        },
                    })
                );
        }
    }

    get accountKey(): string {
        const {
            match: {
                params: { id },
            },
        } = this.props;

        return id;
    }
}

interface IPageChannelProps {}

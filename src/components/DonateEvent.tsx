import React from "react";
import { observer } from "mobx-react";

import { DonateEventModel } from "../models/DonateEvent";

import Donate1 from "./donations/Donate1";
import Donate2 from "./donations/Donate2";
import Donate3 from "./donations/Donate3";
import Donate4 from "./donations/Donate4";
import Donate5 from "./donations/Donate5";
import Donate6 from "./donations/Donate6";
import Donate7 from "./donations/Donate7";
import Donate8 from "./donations/Donate8";
import Donate9 from "./donations/Donate9";
import Donate10 from "./donations/Donate10";
import Donate11 from "./donations/Donate11";

const templates = [
    {
        amount: 50,
        amountWithoutCommission: true,
        images: ["https://tipply.pl/upload/media/user/0002/34/dcba4b98efb5425eb46114645dcf706bfbd7aad6.gif"],
        sound: {
            url: "https://tipply.pl/upload/media/user/0002/34/500b326786d86a9f10394cf0e7aa29d8706ed06e.mpga",
            volume: 0.4,
        },
        speech: {
            readAmount: true,
            readMessage: true,
            readNickname: true,
            voiceType: "GOOGLE_POLISH_MALE",
            volume: 0.4,
        },
        template: Donate1
    },
    {
        amount: 500,
        amountWithoutCommission: true,
        images: ["https://tipply.pl/upload/media/user/0001/72/acf010c217f825445a764938dc97eb54b5e641c2.gif"],
        sound: {
            url: "https://tipply.pl/upload/media/user/0001/72/c969d09a03b032b2eb03922327b286b351ec855b.mpga",
            volume: 0.14,
        },
        speech: {
            readAmount: true,
            readMessage: true,
            readNickname: true,
            voiceType: "GOOGLE_POLISH_MALE",
            volume: 0.4,
        },
        template: Donate2
    },

    {
        amount: 2500,
        amountWithoutCommission: true,
        images: ["https://tipply.pl/upload/media/user/0001/72/842253ed2b3c1eeac7d9c828320ab73fbdd359d8.gif"],
        sound: {
            url: "https://tipply.pl/upload/media/user/0001/81/872a760d7279cc06997609c2fc76d6c0037807a3.mpga",
            volume: 0.3,
        },
        speech: {
            readAmount: true,
            readMessage: true,
            readNickname: true,
            voiceType: "GOOGLE_POLISH_FEMALE",
            volume: 0.4,
        },
        template: Donate3
    },

    {
        amount: 5000,
        amountWithoutCommission: true,
        images: ["https://tipply.pl/upload/media/user/0002/34/9f45a5dd1b56d79ec4fb669f2d4037150d116e5c.gif"],
        sound: {
            url: "https://tipply.pl/upload/media/user/0002/34/69c38da4097646a0fad6cc1b13defca0b8e3fddb.mpga",
            volume: 0.4,
        },
        speech: {
            readAmount: true,
            readMessage: true,
            readNickname: true,
            voiceType: "GOOGLE_POLISH_FEMALE",
            volume: 0.4,
        },
        template: Donate4
    },

    {
        amount: 10000,
        //amount: 9000,
        amountWithoutCommission: true,
        images: ["https://tipply.pl/upload/media/user/0001/73/a54b863f6743d45bd5d4e9f72a2282c7f4d07a6b.gif"],
        sound: {
            url: "https://dxokx05hbd6dq.cloudfront.net/upload/media/user/0006/64/6239c69f64f1624abbe87da76c5089366e57a4f5.mp3",
            //url: "https://dxokx05hbd6dq.cloudfront.net/upload/media/user/0006/52/6ffed9e0c1df2427c03d149f5702b90b804e681e.mp3",
            //url: "https://tipply.pl/upload/media/user/0001/73/724eb08905985a014413f49f32ee6c83208befbe.mpga",
            volume: 0.3,
        },
        speech: {
            readAmount: true,
            readMessage: true,
            readNickname: true,
            voiceType: "GOOGLE_POLISH_FEMALE",
            volume: 0.4,
        },
        template: Donate5
    },

    {
        amount: 15000,
        amountWithoutCommission: true,
        images: ["https://tipply.pl/upload/media/user/0002/34/455ea418f572ed368e62f41fc0ed3be09ba4c494.gif"],
        sound: {
            url: "https://tipply.pl/upload/media/user/0002/34/67ea8e16cfea96f1bbb98a02e17b6c8abad6ef5d.mpga",
            volume: 1,
        },
        speech: {
            readAmount: true,
            readMessage: true,
            readNickname: true,
            voiceType: "GOOGLE_POLISH_FEMALE",
            volume: 0.4,
        },
        template: Donate6
    },

    /*{
        amount: 20000,
        amountWithoutCommission: true,
        images: ["https://tipply.pl/upload/media/user/0002/34/455ea418f572ed368e62f41fc0ed3be09ba4c494.gif"],
        sound: {
            url: "https://dxokx05hbd6dq.cloudfront.net/upload/media/user/0006/52/3cb123357a8bff6f6fc3462223759df838195895.mp3",
            volume: 1,
        },
        speech: {
            readAmount: true,
            readMessage: true,
            readNickname: true,
            voiceType: "GOOGLE_POLISH_FEMALE",
            volume: 0.4,
        },
        template: Donate9
    },*/

    {
        amount: 30000,
        amountWithoutCommission: true,
        images: ["https://tipply.pl/upload/media/user/0006/25/47168b05ea7a9cfd89f906886b7878ab26d74423.gif"],
        sound: {
            url: "https://dxokx05hbd6dq.cloudfront.net/upload/media/user/0006/24/fd39b0f90e08c23b55619c8c409709ac89c77afa.mp3",
            volume: 1,
        },
        speech: {
            readAmount: true,
            readMessage: true,
            readNickname: true,
            voiceType: "GOOGLE_POLISH_FEMALE",
            volume: 0.4,
        },
        template: Donate7
    },
    
    {
        amount: 40000,
        amountWithoutCommission: true,
        images: ["https://tipply.pl/upload/media/user/0006/25/47168b05ea7a9cfd89f906886b7878ab26d74423.gif"],
        sound: {
            url: "https://dxokx05hbd6dq.cloudfront.net/upload/media/user/0006/52/eebc99ee8c6af6578afd29d443bbf540efd1e796.mp3",
            volume: 1,
        },
        speech: {
            readAmount: true,
            readMessage: true,
            readNickname: true,
            voiceType: "GOOGLE_POLISH_FEMALE",
            volume: 0.4,
        },
        template: Donate8
    },

    {
        amount: 50000,
        amountWithoutCommission: true,
        images: ["https://tipply.pl/upload/media/user/0006/25/47168b05ea7a9cfd89f906886b7878ab26d74423.gif"],
        sound: {
            url: "https://dxokx05hbd6dq.cloudfront.net/upload/media/user/0006/24/fd39b0f90e08c23b55619c8c409709ac89c77afa.mp3",
            volume: 1,
        },
        speech: {
            readAmount: true,
            readMessage: true,
            readNickname: true,
            voiceType: "GOOGLE_POLISH_FEMALE",
            volume: 0.4,
        },
        template: Donate10
    },
    
    {
        amount: 100000,
        amountWithoutCommission: true,
        images: ["https://media.discordapp.net/stickers/1175218998296723506.webp?size=160&quality=lossless"],
        sound: {
            url: "https://dxokx05hbd6dq.cloudfront.net/upload/media/user/0006/52/eebc99ee8c6af6578afd29d443bbf540efd1e796.mp3",
            volume: 1,
        },
        speech: {
            readAmount: true,
            readMessage: true,
            readNickname: true,
            voiceType: "GOOGLE_POLISH_FEMALE",
            volume: 0.4,
        },
        template: Donate11
    },
];

@observer
export default class DonateEvent extends React.Component<IDonateEventProps, {shouldRender: boolean}> {
    constructor(props) {
        super(props);
        this.state = {shouldRender: false};
    }

    async componentDidMount() {
        const { sound, speech } = this.findTemplate();

        await this.runDonate(sound, speech);
    }

    async componentDidUpdate(prevProps: Readonly<IDonateEventProps>) {
        if(prevProps.donate.id !== this.props.donate.id) {
            const { sound, speech } = this.findTemplate();

            await this.runDonate(sound, speech);
        }
    }

    render() {
        const { donate } = this.props;
        const { template: TemplateComponent, images, amountWithoutCommission } = this.findTemplate();
        const { shouldRender } = this.state;

        if(!TemplateComponent || !shouldRender)
            return null;

        return <TemplateComponent donate={donate} images={images} withCommission={amountWithoutCommission} />;
    }

    private async runDonate(sound: any, speech: any) {
        const { donate, onFinished } = this.props;

        if (!!sound && !!sound.url && !!sound.url.length) await this.playSound(sound.url, sound.volume, true);

        if(!!speech) {
            if(speech.readNickname) {
                const speechNicknamePath = speech.voiceType === "GOOGLE_POLISH_MALE" ? donate.tts_nickname_google_male : donate.tts_nickname_google_female;
                if (!!speechNicknamePath) {
                    await this.playSound(`https://tipply.pl/${speechNicknamePath}`, speech.volume);
                }
            }
            if(speech.readAmount) {
                const speechAmountPath = speech.voiceType === "GOOGLE_POLISH_MALE" ? donate.tts_amount_google_male : donate.tts_amount_google_female;
                if (!!speechAmountPath) {
                    await this.playSound(`https://tipply.pl/${speechAmountPath}`, speech.volume);
                }
            }
            if(speech.readMessage) {
                const speechMessagePath = speech.voiceType === "GOOGLE_POLISH_MALE" ? donate.tts_message_google_male : donate.tts_message_google_female;
                if (!!speechMessagePath) {
                    await this.playSound(`https://tipply.pl/${speechMessagePath}`, speech.volume);
                }
            }
        }

        await new Promise( ( resolve => {
            setTimeout( resolve, 1500);
        }));

        this.setState({shouldRender: false});

        onFinished && onFinished( );
    }

    private playSound(url: string, volume: number, shouldSetState: boolean = false) {
        if (volume > 1 || volume <= 0) volume = 1;

        return new Promise( ( resolve, reject ) => {
            const audio = new Audio(url);

            audio.volume = volume;

            audio.addEventListener("canplaythrough", ( ) => {
                if (shouldSetState) {
                    this.setState({shouldRender: true});
                }
                audio.play().catch(() => { resolve(undefined); });
            })

            audio.addEventListener("ended", resolve);
            audio.addEventListener("error", reject);
        })
    }

    private findTemplate() {
        const { donate } = this.props;

        templates.sort( function( a, b ) {
            if(a.amount === b.amount)
                return 0;


            return (a.amount > b.amount) ? 1 : -1;
        })

        let selected;

        for( let i = 0; i < templates.length; i++ ) {
            const min = templates[ i ].amount;
            const max = templates[ i + 1 ] ? templates[ i + 1 ].amount : null;

            if(max === null) {
                if(donate.amount >= min)
                    selected = templates[ i ];
            } else {
                if(donate.amount >= min && donate.amount <= max)
                    selected = templates[ i ];
            }
        }

        if(!selected)
            return templates[ 0 ];

        return selected;
    }
}

interface IDonateEventProps {
    donate: DonateEventModel;
    onFinished: () => void;
}

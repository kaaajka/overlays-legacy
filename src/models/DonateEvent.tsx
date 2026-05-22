interface IDonateEventSchema {
    id: string;
    nickname: string;
    message: string;
    amount: number;
    commission: number;
    audio_url: string | null;
    tts_nickname_google_male: string;
    tts_nickname_google_female: string;
    tts_message_google_male: string;
    tts_message_google_female: string;
    tts_amount_google_male: string;
    tts_amount_google_female: string;
    test: boolean;
    resent: boolean;
}

export class DonateEventModel {
    readonly id: string;
    readonly nickname: string;
    readonly message: string;
    readonly amount: number;
    readonly commission: number;
    readonly audio_url: string | null;
    readonly tts_nickname_google_male: string;
    readonly tts_nickname_google_female: string;
    readonly tts_message_google_male: string;
    readonly tts_message_google_female: string;
    readonly tts_amount_google_male: string;
    readonly tts_amount_google_female: string;
    readonly test: boolean;
    readonly resent: boolean;

    constructor(data: IDonateEventSchema) {
        this.id = data.id;
        this.nickname = data.nickname;
        this.message = data.message;
        this.amount = data.amount;
        this.commission = data.commission;
        this.audio_url = data.audio_url;
        this.tts_nickname_google_male = data.tts_nickname_google_male;
        this.tts_nickname_google_female = data.tts_nickname_google_female;
        this.tts_message_google_male = data.tts_message_google_male;
        this.tts_message_google_female = data.tts_message_google_female;
        this.tts_amount_google_male = data.tts_amount_google_male;
        this.tts_amount_google_female = data.tts_amount_google_female;
        this.test = data.test;
        this.resent = data.resent;
    }
}

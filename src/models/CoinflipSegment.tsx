export interface ICoinflipSegmentSchema {
    name: string;
    image: string;
    chance: number;
}

export class CoinflipSegmentModel {
    readonly name: string;
    readonly image: string;
    readonly chance: number;

    constructor(data: ICoinflipSegmentSchema) {
        this.name = data.name;
        this.image = data.image;
        this.chance = data.chance;
    }
}

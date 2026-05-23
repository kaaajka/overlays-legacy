export interface IRouletteItemSchema {
    name: string;
    tickets: number;
    image: string;
    start: number;
    end: number;
    chance: number;
}

export class RouletteItemModel {
    readonly name: string;
    readonly tickets: number;
    readonly image: string;
    readonly start: number;
    readonly end: number;
    readonly chance: number;

    constructor(data: IRouletteItemSchema) {
        this.name = data.name;
        this.tickets = data.tickets;
        this.image = data.image;
        this.start = data.start;
        this.end = data.end;
        this.chance = data.chance;
    }
}

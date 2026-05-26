import { EventModel, EventState, type IEventModelSchema } from "./Event";
import { type IRouletteItemSchema, RouletteItemModel } from "./RouletteItem";

interface IRouletteEventSchema extends IEventModelSchema {
  items: IRouletteItemSchema[];
}

export class RouletteEventModel extends EventModel {
  state = EventState.STARTED;
  items: RouletteItemModel[] | undefined = undefined;
  winner: number | undefined = undefined;

  constructor(data: IRouletteEventSchema) {
    super(data);

    if (data.items) this.items = data.items.map((item) => new RouletteItemModel(item));
  }

  setWinner(ticket: number) {
    this.winner = ticket;
  }
}

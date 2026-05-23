import { action, makeObservable, observable } from "mobx";

import { EventModel, EventState, IEventModelSchema } from "./Event";
import { IRouletteItemSchema, RouletteItemModel } from "./RouletteItem";

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

    makeObservable(this, {
      winner: observable,
      setWinner: action,
    });
  }

  setWinner(ticket: number) {
    this.winner = ticket;
  }
}

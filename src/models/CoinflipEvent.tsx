import { action, makeObservable, observable } from "mobx";

import { EventModel, type IEventModelSchema } from "./Event";
import { type ICoinflipSegmentSchema, CoinflipSegmentModel } from "./CoinflipSegment";

interface ICoinflipEventSchema extends IEventModelSchema {
  segments: ICoinflipSegmentSchema[];
}

export class CoinflipEventModel extends EventModel {
  segments: CoinflipSegmentModel[] | undefined = undefined;
  winner: number | undefined = undefined;
  coin_landing_side: number | undefined = undefined;
  coin_chosen_side: number | undefined = undefined;

  constructor(data: ICoinflipEventSchema) {
    super(data);

    if (data.segments) this.segments = data.segments.map((item) => new CoinflipSegmentModel(item));

    makeObservable(this, {
      winner: observable,
      setWinner: action,
    });

    makeObservable(this, {
      coin_landing_side: observable,
      setCoinLandingSide: action,
    });

    makeObservable(this, {
      coin_chosen_side: observable,
      setCoinChosenSide: action,
    });
  }

  setWinner(ticket: number) {
    this.winner = ticket;
  }

  setCoinLandingSide(side: number) {
    this.coin_landing_side = side;
  }

  setCoinChosenSide(side: number) {
    this.coin_chosen_side = side;
  }
}

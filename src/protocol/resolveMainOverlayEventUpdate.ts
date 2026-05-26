import { EventModel, EventState } from "../models/Event";
import { NormalEventModel } from "../models/NormalEvent";
import { RouletteEventModel } from "../models/RouletteEvent";
import type { IRouletteItemSchema } from "../models/RouletteItem";
import { CoinflipEventModel } from "../models/CoinflipEvent";
import type { ICoinflipSegmentSchema } from "../models/CoinflipSegment";

export type MainOverlayEventUpdate = {
  key: string;
  value: unknown;
};

function cloneEventModel(event: EventModel): EventModel {
  const params = {
    id: event.id,
    key: event.key,
    name: event.name,
    description: event.description,
  };

  if (event instanceof RouletteEventModel) {
    const clone = new RouletteEventModel({
      ...params,
      items: (event.items ?? []) as IRouletteItemSchema[],
    });
    clone.update({
      state: event.state,
      winner: event.winner,
    });
    return clone;
  }

  if (event instanceof CoinflipEventModel) {
    const clone = new CoinflipEventModel({
      ...params,
      segments: (event.segments ?? []) as ICoinflipSegmentSchema[],
    });
    clone.update({
      state: event.state,
      winner: event.winner,
      coin_landing_side: event.coin_landing_side,
      coin_chosen_side: event.coin_chosen_side,
    });
    return clone;
  }

  if (event instanceof NormalEventModel) {
    const clone = new NormalEventModel(params);
    clone.update({
      state: event.state,
      time: event.time,
    });
    return clone;
  }

  const clone = new EventModel(params);
  clone.update({ state: event.state ?? EventState.PREPARE });
  return clone;
}

export function resolveMainOverlayEventUpdate<TEvent extends EventModel | null | undefined>(
  currentEvent: TEvent,
  { key, value }: MainOverlayEventUpdate,
): TEvent | EventModel {
  if (!currentEvent) return currentEvent;
  if (!Object.hasOwn(currentEvent, key)) return currentEvent;

  const nextEvent = cloneEventModel(currentEvent);
  nextEvent.update({ [key]: value });

  return nextEvent;
}

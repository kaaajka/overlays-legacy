import { type EventModel, EventState } from "../models/Event";
import { NormalEventModel } from "../models/NormalEvent";
import { RouletteEventModel } from "../models/RouletteEvent";
import type { IRouletteItemSchema } from "../models/RouletteItem";
import { CoinflipEventModel } from "../models/CoinflipEvent";
import type { ICoinflipSegmentSchema } from "../models/CoinflipSegment";

export type CreateMainOverlayEventModelFromActionInput = {
  id: unknown;
  key: unknown;
  state: "prepare" | "started";
  args: Record<string, unknown>;
};

export function createMainOverlayEventModelFromAction({
  id,
  key,
  state,
  args,
}: CreateMainOverlayEventModelFromActionInput): EventModel | null {
  if (typeof id !== "string" || typeof key !== "string") return null;

  const params = {
    id,
    key,
    name: typeof args.name === "string" ? args.name : "",
    description: typeof args.description === "string" ? args.description : "",
  };

  let event: EventModel;
  switch (key) {
    case "roulette":
      event = new RouletteEventModel({
        ...params,
        items: Array.isArray(args.items)
          ? (args.items as IRouletteItemSchema[])
          : [],
      });
      break;
    case "coinflip":
      event = new CoinflipEventModel({
        ...params,
        segments: Array.isArray(args.segments)
          ? (args.segments as ICoinflipSegmentSchema[])
          : [],
      });
      break;
    default:
      event = new NormalEventModel(params);
      break;
  }

  const toUpdate: {
    state: EventState;
    time?: number;
    winner?: number;
    coin_landing_side?: number;
  } = { state: state === "prepare" ? EventState.PREPARE : EventState.STARTED };

  if (state === "started") {
    if (["roulette", "coinflip"].includes(key) && typeof args.winner === "number")
      toUpdate.winner = args.winner;
    if (key === "coinflip" && typeof args.coin_landing_side === "number")
      toUpdate.coin_landing_side = args.coin_landing_side;

    if (typeof args.time === "number") toUpdate.time = args.time;
  }

  event.update(toUpdate);

  return event;
}

import { describe, expect, it } from "vitest";

import { CoinflipEventModel } from "../models/CoinflipEvent";
import { EventState } from "../models/Event";
import { NormalEventModel } from "../models/NormalEvent";
import { RouletteEventModel } from "../models/RouletteEvent";
import { resolveMainOverlayEventUpdate } from "./resolveMainOverlayEventUpdate";

describe("resolveMainOverlayEventUpdate", () => {
  it("updates NormalEventModel time with a new instance and formattedTime", () => {
    const event = new NormalEventModel({
      id: "normal-1",
      key: "dogs",
      name: "Dogs",
      description: "Dog reward",
    });

    const nextEvent = resolveMainOverlayEventUpdate(event, {
      key: "time",
      value: 65,
    });

    expect(nextEvent).toBeInstanceOf(NormalEventModel);
    expect(nextEvent).not.toBe(event);
    expect((nextEvent as NormalEventModel).time).toBe(65);
    expect((nextEvent as NormalEventModel).formattedTime).toBe("01:05");
    expect(event.time).toBeUndefined();
  });

  it("updates NormalEventModel state with a new instance", () => {
    const event = new NormalEventModel({
      id: "normal-1",
      key: "dogs",
      name: "Dogs",
      description: "Dog reward",
    });

    const nextEvent = resolveMainOverlayEventUpdate(event, {
      key: "state",
      value: EventState.STARTED,
    });

    expect(nextEvent).toBeInstanceOf(NormalEventModel);
    expect(nextEvent).not.toBe(event);
    expect(nextEvent.state).toBe(EventState.STARTED);
    expect(event.state).toBe(EventState.PREPARE);
  });

  it("updates EventModel with valid state values only", () => {
    const event = new NormalEventModel({
      id: "normal-1",
      key: "dogs",
      name: "Dogs",
      description: "Dog reward",
    });

    event.update({ state: EventState.STARTED });
    expect(event.state).toBe(EventState.STARTED);

    event.update({ state: EventState.FINISHED });
    expect(event.state).toBe(EventState.FINISHED);

    event.update({ state: EventState.PREPARE });
    expect(event.state).toBe(EventState.PREPARE);
  });

  it("ignores invalid EventModel state updates", () => {
    const event = new NormalEventModel({
      id: "normal-1",
      key: "dogs",
      name: "Dogs",
      description: "Dog reward",
    });

    event.update({ state: EventState.STARTED });
    event.update({ state: "bad" });

    expect(event.state).toBe(EventState.STARTED);
  });

  it("ignores invalid state through immutable updates", () => {
    const event = new NormalEventModel({
      id: "normal-1",
      key: "dogs",
      name: "Dogs",
      description: "Dog reward",
    });
    event.update({ state: EventState.STARTED });

    const nextEvent = resolveMainOverlayEventUpdate(event, {
      key: "state",
      value: "bad",
    });

    expect(nextEvent).toBeInstanceOf(NormalEventModel);
    expect(nextEvent).not.toBe(event);
    expect(nextEvent.state).toBe(EventState.STARTED);
    expect(event.state).toBe(EventState.STARTED);
  });

  it("updates RouletteEventModel winner with a new RouletteEventModel instance", () => {
    const event = new RouletteEventModel({
      id: "roulette-1",
      key: "roulette",
      name: "Roulette",
      description: "Roulette reward",
      items: [
        {
          name: "Prize",
          tickets: 1,
          image: "prize.png",
          start: 1,
          end: 10,
          chance: 50,
        },
      ],
    });

    const nextEvent = resolveMainOverlayEventUpdate(event, {
      key: "winner",
      value: 7,
    });

    expect(nextEvent).toBeInstanceOf(RouletteEventModel);
    expect(nextEvent).not.toBe(event);
    expect((nextEvent as RouletteEventModel).winner).toBe(7);
    expect((nextEvent as RouletteEventModel).items).toHaveLength(1);
    expect(event.winner).toBeUndefined();
  });

  it("updates CoinflipEventModel winner with a new CoinflipEventModel instance", () => {
    const event = new CoinflipEventModel({
      id: "coinflip-1",
      key: "coinflip",
      name: "Coinflip",
      description: "Coinflip reward",
      segments: [{ name: "Heads", image: "heads.png", chance: 50 }],
    });

    const nextEvent = resolveMainOverlayEventUpdate(event, {
      key: "winner",
      value: 12,
    });

    expect(nextEvent).toBeInstanceOf(CoinflipEventModel);
    expect(nextEvent).not.toBe(event);
    expect((nextEvent as CoinflipEventModel).winner).toBe(12);
    expect(event.winner).toBeUndefined();
  });

  it("updates CoinflipEventModel coin_landing_side with a new instance", () => {
    const event = new CoinflipEventModel({
      id: "coinflip-1",
      key: "coinflip",
      name: "Coinflip",
      description: "Coinflip reward",
      segments: [],
    });

    const nextEvent = resolveMainOverlayEventUpdate(event, {
      key: "coin_landing_side",
      value: 1,
    });

    expect(nextEvent).toBeInstanceOf(CoinflipEventModel);
    expect(nextEvent).not.toBe(event);
    expect((nextEvent as CoinflipEventModel).coin_landing_side).toBe(1);
    expect(event.coin_landing_side).toBeUndefined();
  });

  it("updates CoinflipEventModel coin_chosen_side with a new instance", () => {
    const event = new CoinflipEventModel({
      id: "coinflip-1",
      key: "coinflip",
      name: "Coinflip",
      description: "Coinflip reward",
      segments: [],
    });

    const nextEvent = resolveMainOverlayEventUpdate(event, {
      key: "coin_chosen_side",
      value: 2,
    });

    expect(nextEvent).toBeInstanceOf(CoinflipEventModel);
    expect(nextEvent).not.toBe(event);
    expect((nextEvent as CoinflipEventModel).coin_chosen_side).toBe(2);
    expect(event.coin_chosen_side).toBeUndefined();
  });

  it("returns the current event for unknown keys like EventModel.update did", () => {
    const event = new NormalEventModel({
      id: "normal-1",
      key: "dogs",
      name: "Dogs",
      description: "Dog reward",
    });

    expect(
      resolveMainOverlayEventUpdate(event, {
        key: "unknown",
        value: "ignored",
      }),
    ).toBe(event);
  });

  it("returns null or undefined when there is no current event", () => {
    expect(
      resolveMainOverlayEventUpdate(null, { key: "time", value: 1 }),
    ).toBeNull();
    expect(
      resolveMainOverlayEventUpdate(undefined, { key: "time", value: 1 }),
    ).toBeUndefined();
  });
});

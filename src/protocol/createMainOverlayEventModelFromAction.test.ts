import { describe, expect, it } from "vitest";

import { CoinflipEventModel } from "../models/CoinflipEvent";
import { EventState } from "../models/Event";
import { NormalEventModel } from "../models/NormalEvent";
import { RouletteEventModel } from "../models/RouletteEvent";
import { createMainOverlayEventModelFromAction } from "./createMainOverlayEventModelFromAction";

describe("createMainOverlayEventModelFromAction", () => {
  it("creates a normal prepare event", () => {
    const event = createMainOverlayEventModelFromAction({
      id: "event-1",
      key: "dogs",
      state: "prepare",
      args: { name: "Dogs", description: "Dog reward", time: 30 },
    });

    expect(event).toBeInstanceOf(NormalEventModel);
    expect(event).toMatchObject({
      id: "event-1",
      key: "dogs",
      name: "Dogs",
      description: "Dog reward",
      state: EventState.PREPARE,
    });
    expect((event as NormalEventModel).time).toBeUndefined();
  });

  it("creates a normal started event with time", () => {
    const event = createMainOverlayEventModelFromAction({
      id: "event-1",
      key: "dogs",
      state: "started",
      args: { name: "Dogs", description: "Dog reward", time: 30 },
    });

    expect(event).toBeInstanceOf(NormalEventModel);
    expect(event).toMatchObject({
      state: EventState.STARTED,
      time: 30,
    });
  });

  it("creates a roulette started event with items and winner", () => {
    const event = createMainOverlayEventModelFromAction({
      id: "roulette-1",
      key: "roulette",
      state: "started",
      args: {
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
        winner: 7,
      },
    });

    expect(event).toBeInstanceOf(RouletteEventModel);
    expect(event).toMatchObject({
      state: EventState.STARTED,
      winner: 7,
    });
    expect((event as RouletteEventModel).items).toHaveLength(1);
  });

  it("creates a coinflip started event with segments and winner fields", () => {
    const event = createMainOverlayEventModelFromAction({
      id: "coinflip-1",
      key: "coinflip",
      state: "started",
      args: {
        name: "Coinflip",
        description: "Coinflip reward",
        segments: [{ name: "Heads", image: "heads.png", chance: 50 }],
        winner: 12,
        coin_landing_side: 1,
      },
    });

    expect(event).toBeInstanceOf(CoinflipEventModel);
    expect(event).toMatchObject({
      state: EventState.STARTED,
      winner: 12,
      coin_landing_side: 1,
    });
    expect((event as CoinflipEventModel).segments).toHaveLength(1);
  });

  it("keeps current malformed roulette and coinflip array fallback behavior", () => {
    const roulette = createMainOverlayEventModelFromAction({
      id: "roulette-1",
      key: "roulette",
      state: "started",
      args: { items: "bad", winner: 5 },
    }) as RouletteEventModel;
    const coinflip = createMainOverlayEventModelFromAction({
      id: "coinflip-1",
      key: "coinflip",
      state: "started",
      args: { segments: "bad" },
    }) as CoinflipEventModel;

    expect(roulette).toBeInstanceOf(RouletteEventModel);
    expect(roulette.items).toEqual([]);
    expect(roulette.winner).toBe(5);
    expect(coinflip).toBeInstanceOf(CoinflipEventModel);
    expect(coinflip.segments).toEqual([]);
  });

  it("falls back to normal event for unknown keys and rejects missing ids", () => {
    expect(
      createMainOverlayEventModelFromAction({
        id: "unknown-1",
        key: "unknown",
        state: "prepare",
        args: {},
      }),
    ).toBeInstanceOf(NormalEventModel);

    expect(
      createMainOverlayEventModelFromAction({
        id: undefined,
        key: "dogs",
        state: "prepare",
        args: {},
      }),
    ).toBeNull();
  });
});

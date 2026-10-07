import { afterEach, describe, expect, it, vi } from "vitest";
import { MediaLayer, sourcePosition } from "./MediaLayer";
import assets from "./assets.json";
import { treatments } from "../../donations/choreography/treatments";

describe("music-clock source media", () => {
  it.each(
    assets,
  )("lands tier $tier on its authored pose and preserves original cadence", (asset) => {
    const cues = treatments[asset.tier - 1].cues;
    const hero = cues.find((cue) => cue.name === "heroDrop").at;
    expect(sourcePosition(asset, cues, hero).time).toBe(asset.heroSourceTime);
    expect(sourcePosition(asset, cues, hero + 0.05).frozen).toBe(true);
    expect(sourcePosition(asset, cues, hero + asset.holdAfterHero + 0.02).frozen).toBe(false);
    expect(sourcePosition(asset, cues, hero)).toEqual(sourcePosition(asset, cues, hero));
    expect(sourcePosition(asset, cues, -1).frame).toBe(0);
    expect(asset.frameStarts.length).toBe(asset.frameCount);
    expect(asset.sourceLoop).toBe(0);
  });
  it("recovers from arbitrary stalls without accumulated playback or duplicate triggers", () => {
    const asset = assets[1];
    const cues = treatments[1].cues;
    const first = sourcePosition(asset, cues, 10);
    sourcePosition(asset, cues, 0);
    sourcePosition(asset, cues, 2);
    expect(sourcePosition(asset, cues, 10)).toEqual(first);
    expect(sourcePosition(asset, cues, 10, 0.24).time).not.toBe(first.time);
  });
});

class FakeVideo extends EventTarget {
  currentTime = 0;
  seeking = false;
  src = "";
  style = { visibility: "" };
  dataset: Record<string, string> = {};
  pause = vi.fn();
  load = vi.fn();
  removeAttribute(name: string) {
    if (name === "src") this.src = "";
  }
}
describe("media lifecycle and coalescing", () => {
  afterEach(() => vi.useRealTimers());
  function setup() {
    const video = new FakeVideo();
    const image = {
      src: "",
      style: { visibility: "" },
      removeAttribute() {
        this.src = "";
      },
    };
    const layer = new MediaLayer(
      video as unknown as HTMLVideoElement,
      image as unknown as HTMLImageElement,
      assets[1],
      treatments[1].cues,
      { webm: "dance.webm", gif: "dance.gif", poster: "pose.png" },
    );
    return { video, image, layer };
  }
  it("coalesces in-flight seeks to latest clock, and seeking backwards restores authored pose", () => {
    const { video, layer } = setup();
    video.dispatchEvent(new Event("loadeddata"));
    layer.sync(1);
    video.seeking = true;
    layer.sync(8);
    layer.sync(10);
    video.seeking = false;
    video.dispatchEvent(new Event("seeked"));
    expect(video.currentTime).toBeCloseTo(layer.stats.time + 0.001);
    layer.sync(treatments[1].cues.find((cue) => cue.name === "heroDrop").at);
    expect(video.currentTime).toBeCloseTo(assets[1].heroSourceTime + 0.001);
    layer.dispose();
    expect(video.src).toBe("");
  });
  it("bounded preload falls back to exact original GIF and release clears both sources", () => {
    vi.useFakeTimers();
    const { video, image, layer } = setup();
    vi.advanceTimersByTime(5000);
    expect(layer.stats.state).toBe("gif-fallback");
    expect(image.src).toBe("dance.gif");
    expect(video.src).toBe("");
    layer.release();
    expect(image.src).toBe("");
    expect(layer.stats.state).toBe("idle");
    layer.dispose();
  });
  it("disposing removes listeners and cannot reactivate on stale decoder events", () => {
    const { video, image, layer } = setup();
    layer.dispose();
    video.dispatchEvent(new Event("loadeddata"));
    video.dispatchEvent(new Event("error"));
    layer.sync(4);
    expect(video.src).toBe("");
    expect(image.src).toBe("");
  });
});

import type { Cue } from "../types";

export type MediaAsset = {
  tier: number;
  duration: number;
  frameStarts: number[];
  heroSourceTime: number;
  holdBeforeHero?: number;
  holdAfterHero?: number;
};
export type MediaPosition = { time: number; frame: number; frozen: boolean; loop: number };
export type MediaStats = MediaPosition & {
  state: "loading" | "ready" | "gif-fallback" | "idle";
  decodedTime: number;
  tier: number;
};

/** Source frame cadence, including GIF variable delays, is subordinate to absolute music time. */
export function sourcePosition(
  asset: MediaAsset,
  cues: Cue[],
  musicTime: number,
  delay = 0,
): MediaPosition {
  const pre = cues.find((cue) => cue.name === "preDrop")?.at ?? Infinity;
  const hero = cues.find((cue) => cue.name === "heroDrop")?.at ?? Infinity;
  const resume = hero + (asset.holdAfterHero ?? 0.18);
  const freezeStart = Math.max(pre, hero - (asset.holdBeforeHero ?? hero - pre));
  const frozen = musicTime >= freezeStart && musicTime <= resume;
  const phase = frozen
    ? asset.heroSourceTime
    : musicTime > resume
      ? asset.heroSourceTime + musicTime - resume - delay
      : musicTime - delay;
  const positive = Math.max(0, phase);
  const loop = Math.floor(positive / asset.duration);
  const wrapped = positive % asset.duration;
  let frame = 0;
  for (let index = 1; index < asset.frameStarts.length; index++) {
    if (asset.frameStarts[index] > wrapped + 0.00001) break;
    frame = index;
  }
  return { time: asset.frameStarts[frame], frame, frozen, loop };
}

/** Paused video seeks coalesce. No video.play(), internal simulation or independent frame loop. */
export class MediaLayer {
  private position: MediaPosition = { time: 0, frame: 0, frozen: false, loop: 0 };
  private state: MediaStats["state"] = "idle";
  private timeout: ReturnType<typeof setTimeout>;
  private disposed = false;
  constructor(
    private video: HTMLVideoElement,
    private fallback: HTMLImageElement,
    private asset: MediaAsset,
    private cues: Cue[],
    private urls: { webm: string; gif: string; poster: string },
    private delay = 0,
  ) {
    video.addEventListener("loadeddata", this.ready);
    video.addEventListener("seeked", this.seeked);
    video.addEventListener("error", this.fail);
    this.activate();
  }
  private activate() {
    if (this.disposed) return;
    this.state = "loading";
    this.video.dataset.mediaState = this.state;
    this.video.style.visibility = "hidden";
    this.fallback.style.visibility = "visible";
    this.fallback.src = this.urls.poster;
    this.video.src = this.urls.webm;
    this.video.load();
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.fail, 5000);
  }
  private ready = () => {
    if (this.state !== "loading") return;
    clearTimeout(this.timeout);
    this.state = "ready";
    this.video.dataset.mediaState = this.state;
    this.flush();
    this.reveal();
  };
  private reveal() {
    if (!this.video.seeking && Math.abs(this.video.currentTime - this.position.time) < 0.035) {
      this.video.style.visibility = "visible";
      this.fallback.style.visibility = "hidden";
    }
  }
  private seeked = () => {
    if (this.state !== "ready") return;
    this.flush();
    this.reveal();
  };
  private flush() {
    if (this.state !== "ready" || this.video.seeking) return;
    const desired = this.position.time + 0.001;
    if (Math.abs(this.video.currentTime - desired) > 0.002) {
      try {
        this.video.currentTime = desired;
      } catch {
        this.fail();
      }
    }
  }
  private fail = () => {
    if (this.disposed || this.state === "idle" || this.state === "gif-fallback") return;
    clearTimeout(this.timeout);
    this.state = "gif-fallback";
    this.video.dataset.mediaState = this.state;
    this.video.pause();
    this.video.removeAttribute("src");
    this.video.load();
    this.video.style.visibility = "hidden";
    this.fallback.src = this.urls.gif;
    this.fallback.style.visibility = "visible";
  };
  sync(musicTime: number) {
    this.position = sourcePosition(this.asset, this.cues, musicTime, this.delay);
    if (this.state === "idle") this.activate();
    this.video.dataset.sourceFrame = String(this.position.frame);
    this.flush();
  }
  get stats(): MediaStats {
    return {
      ...this.position,
      state: this.state,
      decodedTime: this.video.currentTime,
      tier: this.asset.tier,
    };
  }
  release() {
    clearTimeout(this.timeout);
    this.state = "idle";
    this.video.dataset.mediaState = this.state;
    this.video.pause();
    this.video.removeAttribute("src");
    this.video.load();
    this.fallback.removeAttribute("src");
  }
  dispose() {
    this.disposed = true;
    this.video.removeEventListener("loadeddata", this.ready);
    this.video.removeEventListener("seeked", this.seeked);
    this.video.removeEventListener("error", this.fail);
    this.release();
  }
}

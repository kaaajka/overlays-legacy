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
  requestedFrames: number;
  seeks: number;
  coalesced: number;
  seekLatencyMs: number;
  presentedTime: number;
  presentedFrames: number;
  driftCorrections: number;
  presentedFrame: number;
  skippedPresentedFrames: number;
  duplicatePresentedFrames: number;

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

/** Forward decoding follows audio phase. Scrub, authored holds and export select exact frames. */
export class MediaLayer {
  private position: MediaPosition = { time: 0, frame: 0, frozen: false, loop: 0 };
  private state: MediaStats["state"] = "idle";
  private timeout: ReturnType<typeof setTimeout>;
  private disposed = false;
  private forward = false;
  private seekStarted = 0;
  private requestedFrames = 0;
  private seeks = 0;
  private coalesced = 0;
  private seekLatencyMs = 0;
  private presentedTime = 0;
  private presentedFrames = 0;
  private driftCorrections = 0;
  private callback = 0;
  private presentedFrame = -1;
  private presentationDiscontinuity = true;
  private skippedPresentedFrames = 0;
  private duplicatePresentedFrames = 0;
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
    video.muted = true;
    video.loop = true;
    const presented: VideoFrameRequestCallback = (_now, metadata) => {
      let index = 0;
      for (let frame = 1; frame < this.asset.frameStarts.length; frame++) {
        if (this.asset.frameStarts[frame] > metadata.mediaTime + 0.00001) break;
        index = frame;
      }
      if (this.forward && this.presentedFrame >= 0 && !this.presentationDiscontinuity) {
        const distance =
          (index - this.presentedFrame + this.asset.frameStarts.length) %
          this.asset.frameStarts.length;
        if (distance === 0) this.duplicatePresentedFrames++;
        else if (distance < this.asset.frameStarts.length / 2)
          this.skippedPresentedFrames += Math.max(0, distance - 1);
      }
      this.presentationDiscontinuity = false;
      this.presentedFrame = index;
      this.presentedTime = metadata.mediaTime;
      this.presentedFrames++;
      if (!this.disposed) this.callback = video.requestVideoFrameCallback(presented);
    };
    if (video.requestVideoFrameCallback) this.callback = video.requestVideoFrameCallback(presented);
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
    if (
      !this.video.seeking &&
      (this.forward || Math.abs(this.video.currentTime - this.position.time) < 0.035)
    ) {
      this.video.style.visibility = "visible";
      this.fallback.style.visibility = "hidden";
    }
  }
  private seeked = () => {
    if (this.state !== "ready") return;
    this.seekLatencyMs = performance.now() - this.seekStarted;
    this.flush();
    this.reveal();
  };
  private flush() {
    if (this.state !== "ready" || this.video.seeking) return;
    if (this.forward) {
      this.reveal();
      return;
    }
    const desired = this.position.time + 0.001;
    if (Math.abs(this.video.currentTime - desired) > 0.002) {
      try {
        this.presentationDiscontinuity = true;
        this.video.currentTime = desired;
        this.seeks++;
        this.seekStarted = performance.now();
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
  sync(musicTime: number, forward = false) {
    const next = sourcePosition(this.asset, this.cues, musicTime, this.delay);
    if (next.frame !== this.position.frame) {
      this.requestedFrames++;
      if (this.video.seeking) this.coalesced++;
    }
    this.position = next;
    this.forward = forward && !next.frozen;
    if (this.state === "idle") this.activate();
    this.video.dataset.sourceFrame = String(this.position.frame);
    if (this.forward && this.state === "ready") {
      const step = this.asset.duration / this.asset.frameStarts.length;
      const error = Math.abs(this.video.currentTime - next.time);
      if (!this.video.seeking && (error > Math.max(0.14, step * 2) || this.video.paused)) {
        this.presentationDiscontinuity = true;
        this.video.currentTime = next.time + 0.001;
        this.seeks++;
        this.driftCorrections++;
        this.seekStarted = performance.now();
      }
      if (this.video.paused)
        void this.video.play().catch(() => {
          this.forward = false;
          this.flush();
        });
      this.reveal();
      return;
    }
    this.video.pause();
    this.flush();
  }
  get stats(): MediaStats {
    return {
      ...this.position,
      state: this.state,
      decodedTime: this.video.currentTime,
      tier: this.asset.tier,
      requestedFrames: this.requestedFrames,
      seeks: this.seeks,
      coalesced: this.coalesced,
      seekLatencyMs: this.seekLatencyMs,
      presentedTime: this.presentedTime,
      presentedFrames: this.presentedFrames,
      driftCorrections: this.driftCorrections,
      presentedFrame: this.presentedFrame,
      skippedPresentedFrames: this.skippedPresentedFrames,
      duplicatePresentedFrames: this.duplicatePresentedFrames,
    };
  }
  release() {
    if (this.state === "idle") return;
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
    if (this.callback) this.video.cancelVideoFrameCallback(this.callback);
    this.video.removeEventListener("loadeddata", this.ready);
    this.video.removeEventListener("seeked", this.seeked);
    this.video.removeEventListener("error", this.fail);
    this.release();
  }
}

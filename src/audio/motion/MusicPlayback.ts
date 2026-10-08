import { audibleContextTime, synchronizedTime } from "./AudioClock";

// A deliberately small cache: decoded music is much larger than compressed files.
const buffers = new Map<string, AudioBuffer>();
export type MusicLoadDiagnostic = {
  url: string;
  fetchUrl: string;
  http?: number;
  mime?: string;
  contentLength?: string;
  receivedBytes?: number;
  signature?: number[];
  sha256?: string;
  contextState: string;
  sampleRate: number;
  cached: boolean;
  error?: string;
};
type LoadOptions = {
  fetchUrl?: string;
  fresh?: boolean;
  onDiagnostic?: (record: MusicLoadDiagnostic, failedBytes?: ArrayBuffer) => void;
};
export class MusicPlayback {
  get decodedBuffer(): AudioBuffer | undefined {
    return this.buffer;
  }
  readonly context: AudioContext;
  private source?: AudioBufferSourceNode;
  private gain: GainNode;
  private buffer?: AudioBuffer;
  private startTime = 0;
  private offset = 0;
  private generation = 0;
  private disposed = false;
  private endTimer?: ReturnType<typeof setTimeout>;
  private endResolve?: () => void;
  private playing = false;
  private durationValue = 0;
  visualSyncOffsetMs = 0;
  constructor(
    private volume = 1,
    context?: AudioContext,
  ) {
    this.context = context ?? new AudioContext({ latencyHint: "interactive" });
    this.gain = this.context.createGain();
    this.gain.gain.value = Math.min(1, Math.max(0, volume));
    this.gain.connect(this.context.destination);
  }
  get duration(): number {
    return this.durationValue;
  }
  get isPlaying(): boolean {
    return this.playing;
  }
  get time(): number {
    if (!this.playing) return this.offset;
    return synchronizedTime(
      audibleContextTime(this.context, performance.now()),
      this.startTime,
      this.offset,
      this.duration,
      this.visualSyncOffsetMs,
    );
  }
  async load(url: string, signal: AbortSignal, options: LoadOptions = {}): Promise<void> {
    const cached = options.fresh ? undefined : buffers.get(url);
    const record: MusicLoadDiagnostic = {
      url,
      fetchUrl: options.fetchUrl ?? url,
      cached: Boolean(cached),
      contextState: this.context.state,
      sampleRate: this.context.sampleRate,
    };
    let retained: ArrayBuffer;
    const cancellation = new AbortController();
    const abort = () => cancellation.abort();
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
    const timer = setTimeout(abort, 8000);
    try {
      // Bound BOTH network and decode; decodeAudioData itself cannot be cancelled.
      const cancelled = new Promise<never>((_, reject) => {
        const rejectLoad = () =>
          reject(new DOMException("Music load cancelled or timed out", "AbortError"));
        if (cancellation.signal.aborted) rejectLoad();
        else cancellation.signal.addEventListener("abort", rejectLoad, { once: true });
      });
      const decode = async () => {
        const response = await fetch(record.fetchUrl, { signal: cancellation.signal });
        record.http = response.status;
        record.mime = response.headers?.get("Content-Type");
        record.contentLength = response.headers?.get("Content-Length");
        if (!response.ok) throw new Error(`Music HTTP ${response.status}`);
        const bytes = await response.arrayBuffer();
        record.receivedBytes = bytes.byteLength;
        if (options.onDiagnostic) {
          retained = bytes.slice(0);
          record.signature = Array.from(new Uint8Array(bytes).slice(0, 16));
          record.sha256 = Array.from(
            new Uint8Array(await crypto.subtle.digest("SHA-256", retained)),
          )
            .map((value) => value.toString(16).padStart(2, "0"))
            .join("");
        }
        if (!bytes.byteLength)
          throw new Error(`Music HTTP ${response.status}: empty response body`);
        return this.context.decodeAudioData(bytes);
      };
      const buffer = await Promise.race([cached ? Promise.resolve(cached) : decode(), cancelled]);
      if (this.disposed || signal.aborted) throw new DOMException("Disposed", "AbortError");
      buffers.delete(url);
      buffers.set(url, buffer);
      if (buffers.size > 3) buffers.delete(buffers.keys().next().value);
      this.buffer = buffer;
      this.durationValue = buffer.duration;
      options.onDiagnostic?.(record);
    } catch (error) {
      record.error = String(error);
      options.onDiagnostic?.(record, retained);
      throw error;
    } finally {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
    }
  }
  /** Silent decoded buffer keeps the Web Audio clock authoritative on file failure. */
  setSilentFallback(duration: number): void {
    this.buffer = this.context.createBuffer(1, Math.ceil(Math.max(0.1, duration) * 8000), 8000);
    this.durationValue = this.buffer.duration;
  }
  setMuted(muted: boolean): void {
    this.gain.gain.value = muted ? 0 : this.volume;
  }
  async play(signal?: AbortSignal): Promise<void> {
    if (this.disposed || signal?.aborted || !this.buffer) return;
    // Call resume immediately in the Studio button's user-activation scope.
    const resume = this.context.resume();
    let resumeTimer: ReturnType<typeof setTimeout>;
    await Promise.race([
      resume,
      new Promise<never>((_, reject) => {
        resumeTimer = setTimeout(
          () => reject(new Error("AudioContext did not resume; check OBS audio/autoplay settings")),
          3000,
        );
      }),
    ]).finally(() => clearTimeout(resumeTimer));
    if (this.disposed || signal?.aborted) return;
    this.stopSource();
    if (this.offset >= this.duration) this.offset = 0;
    const token = ++this.generation;
    const source = this.context.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.gain);
    this.source = source;
    this.startTime = this.context.currentTime + 0.06;
    this.playing = true;
    await new Promise<void>((resolve) => {
      const finish = () => {
        if (token !== this.generation) return;
        this.offset = this.duration;
        this.playing = false;
        this.stopSource();
      };
      this.endResolve = () => {
        signal?.removeEventListener("abort", abort);
        resolve();
      };
      const abort = () => this.pause();
      source.onended = finish;
      signal?.addEventListener("abort", abort, { once: true });
      // Safety only: this timer never drives motion. Covers suspended/hung CEF contexts.
      this.endTimer = setTimeout(finish, (this.duration - this.offset + 5) * 1000);
      try {
        source.start(this.startTime, this.offset);
      } catch (error) {
        this.stopSource();
        throw error;
      }
    });
  }
  pause(): void {
    // Persist source position without visual calibration; repeated pauses must not add offset.
    if (this.playing)
      this.offset = synchronizedTime(
        audibleContextTime(this.context, performance.now()),
        this.startTime,
        this.offset,
        this.duration,
      );
    this.playing = false;
    this.stopSource();
    void this.context.suspend().catch(() => {});
  }
  seek(time: number): void {
    this.pause();
    this.offset = Math.min(this.duration, Math.max(0, time));
  }
  private stopSource(): void {
    this.generation++;
    clearTimeout(this.endTimer);
    if (this.source) {
      this.source.onended = null;
      try {
        this.source.stop();
      } catch {
        /* Already ended. */
      }
      this.source.disconnect();
      this.source = undefined;
    }
    this.endResolve?.();
    this.endResolve = undefined;
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.playing = false;
    this.stopSource();
    this.buffer = undefined;
    this.gain.disconnect();
    void this.context.close().catch(() => {});
  }
}

import { audibleContextTime } from "../../audio/motion/AudioClock";
import type { SpeechClip } from "./authoringServices";
import type { lifecyclePlan } from "./studioModel";
type Plan = ReturnType<typeof lifecyclePlan>;
/** Studio-only NLE transport: one sample clock, reconstructed sources after every seek/loop. */
export class AuthoringTransport {
  private sources: AudioBufferSourceNode[] = [];
  private speech = new Map<string, AudioBuffer>();
  private offset = 0;
  private origin = 0;
  private active = false;
  private limit = 0;
  private generation = 0;
  constructor(
    private context: AudioContext,
    private music: AudioBuffer,
    private musicVolume: number,
    private speechVolume: number,
  ) {}
  async prepare(clips: SpeechClip[]) {
    const required = new Set(clips.map((c) => c.hash));
    for (const hash of this.speech.keys()) if (!required.has(hash)) this.speech.delete(hash);
    await Promise.all(
      clips.map(async (clip) => {
        if (this.speech.has(clip.hash)) return;
        const response = await fetch(clip.url, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw Error("Nie można wczytać aktualnego czytania");
        this.speech.set(
          clip.hash,
          await this.context.decodeAudioData(await response.arrayBuffer()),
        );
      }),
    );
  }
  get time() {
    return this.active
      ? Math.min(
          this.limit,
          this.offset +
            Math.max(0, audibleContextTime(this.context, performance.now()) - this.origin),
        )
      : this.offset;
  }
  get isPlaying() {
    return this.active;
  }
  async play(at: number, plan: Plan, clips: SpeechClip[], full: boolean, out?: number) {
    this.pause();
    const token = ++this.generation;
    let resumeTimer: ReturnType<typeof setTimeout>;
    try {
      await Promise.race([
        this.context.resume(),
        new Promise<never>((_, reject) => {
          resumeTimer = setTimeout(() => reject(Error("Nie można uruchomić zegara audio")), 3000);
        }),
      ]);
    } finally {
      clearTimeout(resumeTimer);
    }
    if (token !== this.generation) return;
    this.offset = at;
    this.origin = this.context.currentTime + 0.06;
    this.limit = Math.min(full ? plan.duration : this.music.duration, out ?? Infinity);
    this.active = true;
    const schedule = (buffer: AudioBuffer, start: number, volume: number) => {
      const from = Math.max(at, start),
        to = Math.min(this.limit, start + buffer.duration);
      if (to <= from) return;
      const node = this.context.createBufferSource(),
        gain = this.context.createGain();
      node.buffer = buffer;
      gain.gain.value = volume;
      node.connect(gain).connect(this.context.destination);
      node.onended = () => {
        node.disconnect();
        gain.disconnect();
      };
      node.start(this.origin + from - at, from - start, to - from);
      this.sources.push(node);
    };
    schedule(this.music, 0, this.musicVolume);
    if (full)
      for (const clip of clips) {
        const stage = plan.stages.find((s) => s.name === `tts-${clip.name}`);
        const buffer = this.speech.get(clip.hash);
        if (stage && buffer) schedule(buffer, stage.start, this.speechVolume);
      }
  }
  pause() {
    this.offset = this.time;
    this.active = false;
    this.generation++;
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {
        /* already ended */
      }
    }
    this.sources = [];
  }
  seek(at: number) {
    this.pause();
    this.offset = at;
  }
  dispose() {
    this.pause();
    this.speech.clear();
  }
}

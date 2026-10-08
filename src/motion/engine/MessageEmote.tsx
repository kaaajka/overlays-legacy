import { useEffect, useRef, useState } from "react";
type Frame = { image: VideoFrame; end: number };
type Decoder = {
  tracks: { ready: Promise<void>; selectedTrack: { frameCount: number } };
  decode: (options: { frameIndex: number }) => Promise<{ image: VideoFrame }>;
  close: () => void;
};
type DecoderConstructor = new (options: { data: ArrayBuffer; type: string }) => Decoder;
const frames = new WeakMap<HTMLCanvasElement, Frame[]>();
/** Information's clock selects frames; no private animation timer. */
export function syncMessageEmotes(root: HTMLElement, seconds: number) {
  for (const canvas of root.querySelectorAll<HTMLCanvasElement>("canvas.information-emote")) {
    canvas.dataset.emoteTime = String(seconds);
    const list = frames.get(canvas);
    if (!list?.length) continue;
    const at = Math.max(0, seconds) % list.at(-1).end;
    const frame = list.find((entry) => entry.end > at) ?? list[0];
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    const ratio = Math.min(
      canvas.width / frame.image.displayWidth,
      canvas.height / frame.image.displayHeight,
    );
    const width = frame.image.displayWidth * ratio,
      height = frame.image.displayHeight * ratio;
    context.drawImage(
      frame.image,
      (canvas.width - width) / 2,
      (canvas.height - height) / 2,
      width,
      height,
    );
  }
}
export function MessageEmote({ src, alt }: { src: string; alt: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = canvas.current;
    const abort = new AbortController();
    const timeout = setTimeout(() => {
      element.dataset.emoteState = "fallback";
      setFailed(true);
      abort.abort();
    }, 5000);
    let decoder: Decoder;
    const decoded: Frame[] = [];
    element.dataset.emoteState = "loading";
    const load = async () => {
      try {
        const response = await fetch(src, {
          signal: abort.signal,
          referrerPolicy: "no-referrer",
          credentials: "omit",
        });
        if (!response.ok) throw Error("Emote HTTP failure");
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength > 2_000_000) throw Error("Emote exceeds decode budget");
        const ImageDecoder = (window as unknown as { ImageDecoder?: DecoderConstructor })
          .ImageDecoder;
        if (!ImageDecoder) throw Error("ImageDecoder unavailable");
        const extension = /\.(png|gif|webp)$/.exec(src)?.[1];
        decoder = new ImageDecoder({ data: bytes, type: `image/${extension ?? "webp"}` });
        await decoder.tracks.ready;
        const count = decoder.tracks.selectedTrack.frameCount;
        if (count > 240) throw Error("Emote exceeds frame budget");
        let end = 0;
        for (let index = 0; index < count; index++) {
          const { image } = await decoder.decode({ frameIndex: index });
          if (abort.signal.aborted) {
            image.close();
            return;
          }
          if (image.displayWidth * image.displayHeight * (index + 1) > 2_000_000) {
            image.close();
            throw Error("Emote exceeds pixel budget");
          }
          end += Math.max(0.02, (image.duration ?? 100000) / 1_000_000);
          decoded.push({ image, end });
        }
        frames.set(element, decoded);
        element.dataset.emoteState = "ready";
        syncMessageEmotes(element.parentElement, Number(element.dataset.emoteTime) || 0);
      } catch {
        if (!abort.signal.aborted) {
          element.dataset.emoteState = "fallback";
          setFailed(true);
        }
      } finally {
        clearTimeout(timeout);
        decoder?.close();
      }
    };
    void load();
    return () => {
      clearTimeout(timeout);
      abort.abort();
      for (const frame of decoded) frame.image.close();
      frames.delete(element);
    };
  }, [src]);
  return failed ? (
    <span className="information-emote" role="img" aria-label={alt} title={alt}>
      <span className="information-emote-fallback">{alt}</span>
    </span>
  ) : (
    <canvas
      ref={canvas}
      className="information-emote"
      width={90}
      height={90}
      role="img"
      aria-label={alt}
    />
  );
}

import { useEffect, useRef, useState } from "react";
import { AudioLines, Crosshair, Repeat2, Magnet, Focus, ZoomIn, RotateCcw } from "lucide-react";
import { IconButton, ContextMenu } from "./editorControls";
import type { MenuAction } from "./editorControls";
import type { lifecyclePlan } from "./studioModel";
import type { MotionTreatment, TimedRegion } from "../../motion/types";
import { rhythmMarks, vocalRegions } from "../../audio/motion/musicIntelligence";
import { cashWaves } from "../../motion/cash/CashRenderer";
import { mediaRegions, timecode } from "./studioModel";
import { mediaAssets } from "../../motion/media/SourceMedia";

type Props = {
  treatment: MotionTreatment;
  mode: string;
  plan: ReturnType<typeof lifecyclePlan>;
  speech: { name: string; file: string; duration: number; voice: string }[];
  speechVolume: number;
  audibleTts?: string;
  selectTts: (name: string) => void;
  previewTts: (name: string) => void;
  time: number;
  seek: (time: number) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  selection: [number, number];
  setSelection: (value: [number, number]) => void;
  loop: boolean;
  setLoop: (value: boolean) => void;
  selectedCue: string;
  selectCue: (cue: string) => void;
  selectWord: (word: TimedRegion, kind: string) => void;
};
export default function Timeline({
  treatment,
  mode,
  plan,
  speech,
  speechVolume,
  audibleTts,
  selectTts,
  previewTts,
  time,
  seek,
  zoom,
  setZoom,
  selection,
  setSelection,
  loop,
  setLoop,
  selectedCue,
  selectCue,
  selectWord,
}: Props) {
  const scroll = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const rangeDrag = useRef<{ anchor: number; kind: "range" | "in" | "out" }>();
  const [menu, setMenu] = useState<{ x: number; y: number; actions: MenuAction[] }>();
  const [hiddenTracks, setHiddenTracks] = useState<string[]>([]);
  const [largeTrack, setLargeTrack] = useState<string>();
  const snap = useRef<HTMLSelectElement>(null);
  const analysis = treatment.analysis,
    duration = mode === "full" ? plan.duration : analysis.duration;
  const beats = rhythmMarks(analysis),
    bars = rhythmMarks(analysis, true),
    phrases = vocalRegions(analysis),
    words = vocalRegions(analysis, true);
  const media = mediaRegions(treatment),
    cash = cashWaves(treatment);
  const snapTime = (raw: number) => {
    let points: number[] = [];
    if (snap.current?.value === "beat") points = beats.map((mark) => mark.at);
    if (snap.current?.value === "bar") points = bars.map((mark) => mark.at);
    if (snap.current?.value === "cue") points = treatment.cues.map((cue) => cue.at);
    if (snap.current?.value === "frame" && treatment.tier <= 7) {
      const asset = mediaAssets[treatment.tier - 1];
      for (let loop = 0; loop <= Math.ceil(duration / asset.duration); loop++)
        for (const frame of asset.frameStarts) {
          const before = loop * asset.duration + frame;
          if (before <= media[1].start) points.push(before);
          const after = before + media[1].end - asset.heroSourceTime;
          if (after >= media[1].end && after <= duration) points.push(after);
        }
      points.push(media[1].start, media[1].end);
    }
    return points.length
      ? points.reduce(
          (best, value) => (Math.abs(value - raw) < Math.abs(best - raw) ? value : best),
          points[0],
        )
      : raw;
  };
  const point = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return snapTime(
      Math.min(duration, Math.max(0, ((event.clientX - rect.left) / rect.width) * duration)),
    );
  };
  const setIn = (at: number) =>
    setSelection([Math.max(0, Math.min(at, selection[1] - 0.01)), selection[1]]);
  const setOut = (at: number) =>
    setSelection([selection[0], Math.min(duration, Math.max(at, selection[0] + 0.01))]);
  const context = (event: React.MouseEvent, actions: MenuAction[]) => {
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY, actions });
  };
  useEffect(() => {
    const element = scroll.current;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const x = event.clientX - element.getBoundingClientRect().left - 150;
        const ratio = (element.scrollLeft + x) / (element.scrollWidth - 150);
        const next = Math.max(1, Math.min(128, zoom * Math.exp(-event.deltaY * 0.002)));
        setZoom(next);
        requestAnimationFrame(() => {
          element.scrollLeft = ratio * (element.scrollWidth - 150) - x;
        });
      } else if (event.shiftKey) {
        event.preventDefault();
        element.scrollLeft += event.deltaY || event.deltaX;
      }
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [zoom, setZoom]);
  const scrub = (event: React.PointerEvent<HTMLDivElement>) => {
    const at = point(event),
      range = rangeDrag.current;
    if (range) {
      if (range.kind === "in") setIn(at);
      else if (range.kind === "out") setOut(at);
      else setSelection([Math.min(range.anchor, at), Math.max(range.anchor + 0.01, at)]);
    } else seek(at);
  };
  const firstAt = (name: string) =>
    name.startsWith("TTS")
      ? (plan.stages.find((stage) => stage.name === `tts-${name.split(" · ")[1]?.toLowerCase()}`)
          ?.start ?? analysis.duration)
      : name === "Information" || name === "Outro"
        ? (plan.stages.find((stage) => stage.name === name.toLowerCase())?.start ?? 0)
        : name.startsWith("Beats")
          ? (beats[0]?.at ?? 0)
          : name.startsWith("Downbeats")
            ? (bars[0]?.at ?? 0)
            : name === "Vocal words"
              ? (words[0]?.start ?? 0)
              : name === "Vocal phrases"
                ? (phrases[0]?.start ?? 0)
                : name === "Authored cues"
                  ? (treatment.cues[0]?.at ?? 0)
                  : 0;
  const row = (name: string, content: React.ReactNode, kind = "") =>
    hiddenTracks.includes(name) ? null : (
      <div
        className={`timeline-row ${kind} ${largeTrack === name ? "large-track" : ""}`}
        key={name}
        data-track={name}
      >
        <button
          type="button"
          className="track-label"
          onContextMenu={(event) =>
            context(event, [
              { label: "Hide track", run: () => setHiddenTracks([...hiddenTracks, name]) },
              {
                label: "Fit track height",
                run: () => setLargeTrack(largeTrack === name ? undefined : name),
              },
              { label: "Go to first event", run: () => seek(firstAt(name)) },
            ])
          }
        >
          {name}
        </button>
        <div
          className="timeline-body"
          onPointerDown={(event) => {
            const handle = (event.target as HTMLElement).closest<HTMLElement>(
              "[data-range-handle]",
            );
            const head = (event.target as HTMLElement).closest(".playhead-handle");
            if (
              !handle &&
              !head &&
              ((event.target as HTMLElement).closest("button") || event.button !== 0)
            )
              return;
            event.preventDefault();
            drag.current = true;
            const at = point(event);
            rangeDrag.current = handle
              ? { anchor: at, kind: handle.dataset.rangeHandle as "in" | "out" }
              : event.shiftKey
                ? { anchor: at, kind: "range" }
                : undefined;
            event.currentTarget.setPointerCapture(event.pointerId);
            scrub(event);
          }}
          onPointerMove={(event) => {
            if (drag.current) scrub(event);
          }}
          onPointerUp={() => {
            drag.current = false;
            rangeDrag.current = undefined;
          }}
          onPointerCancel={() => {
            drag.current = false;
            rangeDrag.current = undefined;
          }}
        >
          {content}
          <div
            className="selection-band"
            style={{
              left: `${(selection[0] / duration) * 100}%`,
              width: `${((selection[1] - selection[0]) / duration) * 100}%`,
            }}
          />
          <i className="timeline-playhead" style={{ left: `${(time / duration) * 100}%` }} />
          {kind === "ruler" && (
            <>
              <button
                type="button"
                className="playhead-handle"
                aria-label="Drag playhead"
                title="Drag playhead · Shift-drag creates a range"
                style={{ left: `${(time / duration) * 100}%` }}
              />
              <button
                type="button"
                className="range-handle in-handle"
                data-range-handle="in"
                aria-label="Drag IN point"
                title="Drag IN"
                style={{ left: `${(selection[0] / duration) * 100}%` }}
              >
                I
              </button>
              <button
                type="button"
                className="range-handle out-handle"
                data-range-handle="out"
                aria-label="Drag OUT point"
                title="Drag OUT"
                style={{ left: `${(selection[1] / duration) * 100}%` }}
              >
                O
              </button>
            </>
          )}
        </div>
      </div>
    );
  const regions = (regions: TimedRegion[], kind: string) => (
    <>
      {regions.map((region) => (
        <button
          type="button"
          key={`${region.start}-${region.end}-${region.text}`}
          title={`${region.text ?? region.label} · ${timecode(region.start)}–${timecode(region.end)} · ${region.approved ? "approved" : "candidate"} · ${region.source}`}
          className={`timeline-region ${kind} ${region.approved ? "approved" : "candidate"}`}
          style={{
            left: `${(region.start / duration) * 100}%`,
            width: `${((region.end - region.start) / duration) * 100}%`,
          }}
          onClick={() => {
            selectWord(region, kind);
            seek(region.start);
          }}
        >
          {region.text ?? region.label}
        </button>
      ))}
    </>
  );
  const [overlay, setOverlay] = useState("none");
  const envelope =
    overlay === "bass"
      ? analysis.bands.bass
      : overlay === "loudness"
        ? analysis.loudness
        : (analysis.intelligence?.measured[overlay] ?? []);
  const waveform = analysis.intelligence?.measured.waveform ?? [];
  const pixelsPerSecond =
    (Math.max(900 * zoom, scroll.current?.clientWidth ?? 900) - 150) / duration;
  const tickStep =
    [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30].find(
      (step) => step * pixelsPerSecond >= 70,
    ) ?? 30;
  return (
    <section className="studio-timeline" aria-label="Multitrack timeline">
      <div className="timeline-toolbar">
        <strong className="timeline-mode">{mode === "full" ? "FULL ALERT" : "HERO ONLY"}</strong>
        <span className="timeline-duration">{timecode(duration)}</span>
        <label>
          <AudioLines size={14} aria-hidden="true" /> Overlay
          <select
            aria-label="Waveform overlay"
            value={overlay}
            onChange={(event) => setOverlay(event.target.value)}
          >
            {["none", "loudness", "bass", "vocals", "drums"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          <ZoomIn size={14} aria-hidden="true" /> Zoom{" "}
          <input
            aria-label="Timeline zoom"
            type="range"
            min="1"
            max="128"
            step=".5"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>
        <span>{zoom.toFixed(1)}×</span>
        <button
          type="button"
          onClick={() => {
            scroll.current.scrollLeft = Math.max(
              0,
              (time / duration) * (scroll.current.scrollWidth - 150) -
                (scroll.current.clientWidth - 150) / 2,
            );
          }}
        >
          <Crosshair size={14} aria-hidden="true" /> Center playhead
        </button>
        <label>
          <Magnet size={14} aria-hidden="true" /> Snap{" "}
          <select ref={snap} aria-label="Timeline snapping">
            <option value="off">Off</option>
            <option value="beat">Beat (estimate)</option>
            <option value="bar">Downbeat (estimate)</option>
            <option value="cue">Cue</option>
            <option value="frame">Source frame</option>
          </select>
        </label>
        <label>
          IN{" "}
          <input
            aria-label="Loop IN"
            type="number"
            step=".001"
            min="0"
            max={duration}
            value={Number(selection[0].toFixed(3))}
            onChange={(event) =>
              setSelection([
                Math.min(selection[1] - 0.01, Math.max(0, Number(event.target.value))),
                selection[1],
              ])
            }
          />
        </label>
        <label>
          OUT{" "}
          <input
            aria-label="Loop OUT"
            type="number"
            step=".001"
            min="0"
            max={duration}
            value={Number(selection[1].toFixed(3))}
            onChange={(event) =>
              setSelection([
                selection[0],
                Math.min(duration, Math.max(selection[0] + 0.01, Number(event.target.value))),
              ])
            }
          />
        </label>
        <button
          type="button"
          aria-pressed={loop}
          onClick={() => setLoop(!loop)}
          title="Loop music selection"
          disabled={mode === "full"}
        >
          <Repeat2 size={14} /> Loop selection
        </button>
        <button
          type="button"
          onClick={() => {
            const cue =
              treatment.cues.find((c) => c.name === selectedCue) ??
              treatment.cues.find((c) => c.name === "heroDrop");
            setSelection([Math.max(0, cue.at - 0.75), Math.min(duration, cue.at + 1.5)]);
          }}
        >
          <Focus size={14} aria-hidden="true" /> Cue neighborhood
        </button>
        <button
          type="button"
          onClick={() => {
            setLoop(false);
            setSelection([0, duration]);
          }}
        >
          Clear loop
        </button>
        {!!hiddenTracks.length && (
          <IconButton
            icon={RotateCcw}
            label="Restore hidden tracks"
            onClick={() => setHiddenTracks([])}
          />
        )}
      </div>
      <div ref={scroll} className="timeline-scroll">
        <div className="timeline-content" style={{ width: `${900 * zoom}px` }}>
          {row(
            "TIME",
            <div className="timeline-ruler">
              {Array.from({ length: Math.floor(duration / tickStep) + 1 }, (_, index) => {
                const second = index * tickStep;
                return (
                  <span key={timecode(second)} style={{ left: `${(second / duration) * 100}%` }}>
                    {tickStep < 1 ? timecode(second) : timecode(second).slice(0, 5)}
                  </span>
                );
              })}
            </div>,
            "ruler",
          )}
          {mode === "full" && (
            <>
              {row(
                "Lifecycle / Hero",
                <>
                  <button
                    type="button"
                    className="timeline-region hero-region"
                    style={{ left: 0, width: `${(analysis.duration / duration) * 100}%` }}
                    onClick={() => seek(0)}
                  >
                    Hero / original music
                  </button>
                  <span className="complete-marker" style={{ left: "calc(100% - 66px)" }}>
                    COMPLETE
                  </span>
                </>,
              )}
              {row(
                "Information",
                <button
                  type="button"
                  className="timeline-region information-region"
                  style={{
                    left: `${(plan.informationStart / duration) * 100}%`,
                    width: `${(plan.informationDuration / duration) * 100}%`,
                  }}
                  title="Information remains visible across all speech and the reading gate"
                  onClick={() => seek(plan.informationStart)}
                >
                  Information · overlaps speech
                </button>,
              )}
              {speech.map((clip) => {
                const stage = plan.stages.find((stage) => stage.name === `tts-${clip.name}`);
                return row(
                  `TTS · ${clip.name[0].toUpperCase() + clip.name.slice(1)}`,
                  <button
                    type="button"
                    className={`timeline-region tts-region ${audibleTts === clip.name ? "audible" : ""}`}
                    data-tts={clip.name}
                    aria-label={`TTS · ${clip.name}`}
                    title={`${clip.file} · ${clip.duration.toFixed(6)} s · volume ${speechVolume} · ${clip.voice} · local fixture${audibleTts === clip.name ? " · PLAYING" : ""}`}
                    style={{
                      left: `${(stage.start / duration) * 100}%`,
                      width: `${((stage.end - stage.start) / duration) * 100}%`,
                    }}
                    onClick={() => {
                      selectTts(clip.name);
                      seek(stage.start);
                    }}
                    onDoubleClick={() => previewTts(clip.name)}
                    onContextMenu={(event) =>
                      context(event, [
                        { label: "Preview this TTS", run: () => previewTts(clip.name) },
                        { label: "Go to start", run: () => seek(stage.start) },
                        { label: "Set IN", run: () => setIn(stage.start) },
                        { label: "Set OUT", run: () => setOut(stage.end) },
                      ])
                    }
                  >
                    {clip.name} · {clip.duration.toFixed(2)}s
                  </button>,
                );
              })}
              {row(
                "Outro",
                <button
                  type="button"
                  className="timeline-region outro-region"
                  style={{
                    left: `${(plan.stages.find((stage) => stage.name === "outro").start / duration) * 100}%`,
                    width: `${(0.65 / duration) * 100}%`,
                  }}
                  onClick={() => seek(plan.stages.find((stage) => stage.name === "outro").start)}
                >
                  Out
                </button>,
              )}
            </>
          )}
          {row(
            "Music · waveform",
            <svg
              style={{ width: `${(analysis.duration / duration) * 100}%` }}
              viewBox="0 0 800 50"
              preserveAspectRatio="none"
              aria-label="Original PCM waveform"
            >
              <title>Original music min/max waveform</title>
              {overlay !== "none" && (
                <path
                  d={envelope
                    .map((value, index) => `M${(index / envelope.length) * 800} ${50 - value * 45}`)
                    .join(" ")
                    .replace(/M/g, "L")
                    .replace(/^L/, "M")}
                  fill="none"
                  stroke="#ffc0aa"
                  strokeWidth="1.5"
                />
              )}
              <path
                d={
                  waveform.length
                    ? waveform
                        .map(
                          ([low, high], i) =>
                            `M${(i / waveform.length) * 800} ${25 + low * 22}V${25 + high * 22}`,
                        )
                        .join(" ")
                    : analysis.loudness
                        .map(
                          (n, i) =>
                            `M${(i / analysis.loudness.length) * 800} ${25 - n * 22}V${25 + n * 22}`,
                        )
                        .join(" ")
                }
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>,
            "music-track",
          )}
          {row(
            "Beats · estimated",
            beats.map((mark) => (
              <button
                type="button"
                className="beat-marker"
                key={mark.at}
                style={{ left: `${(mark.at / duration) * 100}%` }}
                title={`${mark.source} · confidence ${mark.confidence}`}
                onClick={() => seek(mark.at)}
              />
            )),
          )}
          {!!bars.length &&
            row(
              "Downbeats / bars",
              bars.map((mark, index) => (
                <button
                  type="button"
                  className="bar-marker"
                  key={mark.at}
                  style={{ left: `${(mark.at / duration) * 100}%` }}
                  title={`${mark.approved ? "approved" : "estimated"} bar ${index + 1} · ${mark.source}`}
                  onClick={() => seek(mark.at)}
                >
                  {index + 1}
                </button>
              )),
            )}
          {!!analysis.intelligence?.authored.cues.length &&
            row(
              "Vocal reactions",
              analysis.intelligence.authored.cues
                .filter((cue) => cue.group === "media")
                .map((cue) => (
                  <button
                    type="button"
                    className="timeline-region vocal-region"
                    key={`${cue.at}-${cue.name}`}
                    style={{
                      left: `${(cue.at / duration) * 100}%`,
                      width: `${(0.28 / duration) * 100}%`,
                    }}
                    title={`${cue.name} · ${cue.intensity}`}
                    onClick={() => seek(cue.at)}
                  >
                    {cue.name}
                  </button>
                )),
            )}
          {!!analysis.intelligence?.authored.sections.length &&
            row(
              "Structure · authored",
              regions(analysis.intelligence.authored.sections, "section-region"),
            )}
          {!!phrases.length && row("Vocal phrases", regions(phrases, "vocal-region"))}
          {!!words.length && row("Vocal words", regions(words, "word-region"))}
          {row(
            "Authored cues",
            treatment.cues.map((cue) => (
              <button
                type="button"
                className={`cue-marker ${cue.name === "heroDrop" ? "hero" : ""} ${selectedCue === cue.name ? "selected" : ""}`}
                key={cue.name}
                style={{ left: `${(cue.at / duration) * 100}%` }}
                onClick={() => {
                  selectCue(cue.name);
                  seek(cue.at);
                }}
                onContextMenu={(event) =>
                  context(event, [
                    { label: "Go to cue", run: () => seek(cue.at) },
                    {
                      label: "Loop around cue",
                      run: () => {
                        selectCue(cue.name);
                        setSelection([
                          Math.max(0, cue.at - 0.75),
                          Math.min(analysis.duration, cue.at + 1.5),
                        ]);
                        setLoop(true);
                      },
                    },
                    { label: "Set IN here", run: () => setIn(cue.at) },
                    { label: "Set OUT here", run: () => setOut(cue.at) },
                    {
                      label: "Copy timestamp",
                      run: () => void navigator.clipboard.writeText(timecode(cue.at)),
                    },
                  ])
                }
                title={`${cue.name} · ${timecode(cue.at)}`}
              >
                {cue.name}
              </button>
            )),
          )}
          {!!media.length &&
            row(
              "Source media",
              media.map((region) => (
                <button
                  type="button"
                  className="timeline-region media-region"
                  key={region.start}
                  style={{
                    left: `${(region.start / duration) * 100}%`,
                    width: `${((region.end - region.start) / duration) * 100}%`,
                  }}
                  onClick={() => seek(region.start)}
                  title={region.label}
                >
                  {region.label}
                </button>
              )),
            )}
          {!!cash.length &&
            row(
              treatment.tier === 5
                ? "Cash fountain"
                : treatment.tier === 6
                  ? "Cash handoff"
                  : "Cash storm",
              cash.map((wave) => (
                <button
                  type="button"
                  className="timeline-region cash-region"
                  key={`${wave.at}-${wave.intensity}`}
                  style={{
                    left: `${(wave.at / duration) * 100}%`,
                    width: `${(Math.min(2.8, duration - wave.at) / duration) * 100}%`,
                  }}
                  onClick={() => seek(wave.at + 0.3)}
                  title={`Authored cash wave ${wave.intensity}`}
                >
                  cash {wave.intensity.toFixed(1)}
                </button>
              )),
            )}
          {row(
            "Typography",
            treatment.cues
              .filter((cue) => cue.name === "donorReveal" || cue.name === "heroDrop")
              .map((cue) => (
                <button
                  type="button"
                  className="timeline-region type-region"
                  key={cue.name}
                  style={{
                    left: `${(cue.at / duration) * 100}%`,
                    width: `${(Math.min(0.6, duration - cue.at) / duration) * 100}%`,
                  }}
                  onClick={() => seek(cue.at)}
                >
                  {cue.name === "heroDrop" ? "amount" : "name"}
                </button>
              )),
          )}
          {(treatment.tier === 3 || treatment.tier === 5 || treatment.tier === 7) &&
            row(
              "Scene / camera",
              <div
                className="timeline-region camera-region"
                style={{
                  left: `${(treatment.cues.find((cue) => cue.name === "buildStart").at / duration) * 100}%`,
                  width: `${((analysis.duration * 0.97 - treatment.cues.find((cue) => cue.name === "buildStart").at) / duration) * 100}%`,
                }}
              >
                {treatment.tier === 3
                  ? "shutter cuts"
                  : treatment.tier === 5
                    ? "panorama expansion"
                    : "monitor cascade / interruptions"}
              </div>,
            )}
        </div>
      </div>
      <ContextMenu menu={menu} close={() => setMenu(undefined)} />
    </section>
  );
}

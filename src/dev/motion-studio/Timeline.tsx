import { Help } from "./Help";
import { pl } from "./polish";
import { useCallback, useEffect, useRef, useState } from "react";
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
  selection: [number, number] | null;
  setSelection: (value: [number, number] | null) => void;
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
  const analysis = treatment.analysis,
    duration = mode === "full" ? plan.duration : analysis.duration;
  const scroll = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const navigatorRef = useRef<HTMLFieldSetElement>(null);
  const [view, setView] = useState({ width: 900, header: 150, left: 0, total: 900, gutter: 0 });
  const navDrag = useRef<{ kind: string; x: number; left: number; span: number }>();
  const axis = useCallback(() => {
    const el = scroll.current;
    const header =
      el.querySelector<HTMLElement>(".track-label")?.getBoundingClientRect().width ?? 0;
    return {
      width: el.clientWidth,
      header,
      left: el.scrollLeft,
      total: el.scrollWidth,
      gutter:
        Number.parseFloat(
          getComputedStyle(content.current).getPropertyValue("--timeline-gutter"),
        ) || 0,
    };
  }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Zoom and duration change DOM geometry even though axis reads refs.
  useEffect(() => {
    const update = () => setView(axis());
    const el = scroll.current;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update);
    update();
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [axis, zoom, duration]);
  const center = (at = time) => {
    const v = axis();
    scroll.current.scrollLeft = Math.max(
      0,
      (at / duration) * (v.total - v.header - 2 * v.gutter) + v.gutter - (v.width - v.header) / 2,
    );
  };
  const neighborhood = (at: number) => {
    const a = Math.max(0, at - 0.3),
      b = Math.min(duration, at + 0.3);
    setSelection([a, b]);
    setLoop(true);
    seek(a);
    requestAnimationFrame(() => center(a));
  };
  const drag = useRef(false);
  const rangeDrag = useRef<{ anchor: number; kind: "range" | "in" | "out" }>();
  const [menu, setMenu] = useState<{ x: number; y: number; actions: MenuAction[] }>();
  const [hiddenTracks, setHiddenTracks] = useState<string[]>([]);
  const [largeTrack, setLargeTrack] = useState<string>();
  const snap = useRef<HTMLSelectElement>(null);

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
    setSelection([
      Math.max(0, Math.min(at, (selection?.[1] ?? duration) - 0.01)),
      selection?.[1] ?? duration,
    ]);
  const setOut = (at: number) =>
    setSelection([
      selection?.[0] ?? 0,
      Math.min(duration, Math.max(at, (selection?.[0] ?? 0) + 0.01)),
    ]);
  const context = (event: React.MouseEvent, actions: MenuAction[]) => {
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY, actions });
  };
  useEffect(() => {
    const element = scroll.current;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const v = axis();
        const x = event.clientX - element.getBoundingClientRect().left - v.header;
        const ratio = (element.scrollLeft + x - v.gutter) / (v.total - v.header - 2 * v.gutter);
        const next = Math.max(1, Math.min(128, zoom * Math.exp(-event.deltaY * 0.002)));
        setZoom(next);
        requestAnimationFrame(() => {
          const after = axis();
          element.scrollLeft =
            ratio * (after.total - after.header - 2 * after.gutter) + after.gutter - x;
        });
      } else if (event.shiftKey) {
        event.preventDefault();
        element.scrollLeft += event.deltaY || event.deltaX;
      }
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [zoom, setZoom, axis]);
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
        key={pl(name)}
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
          title={pl(name)}
        >
          {pl(name)}
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
          {kind === "ruler" && (
            <>
              <button
                type="button"
                className="playhead-handle"
                aria-label={pl("Drag playhead")}
                title={pl("Drag playhead · Shift-drag creates a range")}
                style={{ left: `${(time / duration) * 100}%` }}
              />
              {selection && (
                <>
                  <button
                    type="button"
                    className="range-handle in-handle"
                    data-range-handle="in"
                    aria-label={pl("Drag IN point")}
                    title={pl("Drag IN")}
                    style={{ left: `${((selection?.[0] ?? 0) / duration) * 100}%` }}
                  >
                    {pl("I")}
                  </button>
                  <button
                    type="button"
                    className="range-handle out-handle"
                    data-range-handle="out"
                    aria-label={pl("Drag OUT point")}
                    title={pl("Drag OUT")}
                    style={{ left: `${((selection?.[1] ?? duration) / duration) * 100}%` }}
                  >
                    {pl("O")}
                  </button>
                </>
              )}
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
          title={`${region.text ?? pl(region.label)} · ${timecode(region.start)}–${timecode(region.end)} · ${region.approved ? "zatwierdzono" : "kandydat"} · ${region.source}`}
          className={`timeline-region ${kind} ${region.approved ? "zatwierdzono" : "kandydat"}`}
          style={{
            left: `${(region.start / duration) * 100}%`,
            width: `${((region.end - region.start) / duration) * 100}%`,
          }}
          onClick={() => {
            selectWord(region, kind);
            seek(region.start);
          }}
        >
          {region.text ?? pl(region.label)}
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
  const pixelsPerSecond = (view.total - view.header - 2 * view.gutter) / duration;
  const tickStep =
    [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30].find(
      (step) => step * pixelsPerSecond >= 70,
    ) ?? 30;
  return (
    <section className="studio-timeline" aria-label={pl("Multitrack timeline")}>
      <div className="timeline-toolbar">
        <strong className="timeline-mode">
          {mode === "full" ? "PEŁNY ALERT" : "TYLKO ANIMACJA"}
        </strong>
        <span className="timeline-duration">{timecode(duration)}</span>
        <label>
          <AudioLines size={14} aria-hidden="true" />
          {pl("Overlay")}
          <select
            aria-label={pl("Waveform overlay")}
            value={overlay}
            onChange={(event) => setOverlay(event.target.value)}
          >
            {["none", "loudness", "bass", "vocals", "drums"].map((value) => (
              <option key={value} value={value}>
                {pl(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <ZoomIn size={14} aria-hidden="true" />
          {pl("Zoom")}{" "}
          <input
            aria-label={pl("Timeline zoom")}
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
          onClick={() => center()}
          disabled={view.total <= view.width + 1}
          title={
            view.total <= view.width + 1
              ? "Cała oś czasu jest widoczna"
              : "Wyśrodkuj głowicę w widocznej części osi"
          }
        >
          <Crosshair size={14} aria-hidden="true" />
          {pl("Center playhead")}
        </button>
        <label>
          <Magnet size={14} aria-hidden="true" />
          {pl("Snap")}
          <Help topic="snap" />{" "}
          <select ref={snap} aria-label={pl("Timeline snapping")}>
            <option value="off">{pl("Off")}</option>
            <option value="beat">{pl("Beat (estimate)")}</option>
            <option value="bar">{pl("Downbeat (estimate)")}</option>
            <option value="cue">{pl("Cue")}</option>
            <option value="frame">{pl("Source frame")}</option>
          </select>
        </label>
        <label>
          {pl("IN")}
          <Help topic="selection" />{" "}
          <input
            aria-label={pl("Loop IN")}
            type="number"
            step=".001"
            min="0"
            max={duration}
            value={selection ? Number(selection[0].toFixed(3)) : ""}
            placeholder="—"
            onChange={(event) => {
              const start = Math.min(duration - 0.01, Math.max(0, Number(event.target.value)));
              setSelection([start, Math.max(start + 0.01, selection?.[1] ?? duration)]);
            }}
          />
        </label>
        <label>
          {pl("OUT")}{" "}
          <input
            aria-label={pl("Loop OUT")}
            type="number"
            step=".001"
            min="0"
            max={duration}
            value={selection ? Number(selection[1].toFixed(3)) : ""}
            placeholder="—"
            onChange={(event) => {
              const end = Math.min(duration, Math.max(0.01, Number(event.target.value)));
              setSelection([Math.min(selection?.[0] ?? 0, end - 0.01), end]);
            }}
          />
        </label>
        <button
          type="button"
          aria-pressed={loop}
          onClick={() => setLoop(!loop)}
          title={pl("Loop music selection")}
          disabled={!selection}
        >
          <Repeat2 size={14} />
          Zapętl zakres
        </button>
        <button
          type="button"
          onClick={() => {
            const cue =
              treatment.cues.find((c) => c.name === selectedCue) ??
              treatment.cues.find((c) => c.name === "heroDrop");
            neighborhood(cue.at);
          }}
        >
          <Focus size={14} aria-hidden="true" />
          Zapętl wokół punktu
        </button>
        <button
          type="button"
          onClick={() => {
            setLoop(false);
            setSelection(null);
          }}
        >
          Wyczyść zakres
        </button>
        {!!hiddenTracks.length && (
          <IconButton
            icon={RotateCcw}
            label={pl("Restore hidden tracks")}
            onClick={() => setHiddenTracks([])}
          />
        )}
      </div>
      <div ref={scroll} className="timeline-scroll">
        <div
          ref={content}
          className="timeline-content"
          style={
            {
              width: `${view.header + (view.width - view.header) * zoom + (zoom > 1 ? view.width - view.header : 0)}px`,
              "--timeline-gutter": `${zoom > 1 ? (view.width - view.header) / 2 : 0}px`,
            } as React.CSSProperties
          }
        >
          <div
            className="timeline-global-overlay"
            style={{
              left: view.header + (zoom > 1 ? (view.width - view.header) / 2 : 0),
              right: zoom > 1 ? (view.width - view.header) / 2 : 0,
            }}
          >
            {selection && (
              <div
                className="selection-band"
                style={{
                  left: `${(selection[0] / duration) * 100}%`,
                  width: `${((selection[1] - selection[0]) / duration) * 100}%`,
                }}
              />
            )}
            <i className="timeline-playhead" style={{ left: `${(time / duration) * 100}%` }} />
          </div>
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
                    {pl("Hero / original music")}
                  </button>
                  <span className="complete-marker" style={{ left: "calc(100% - 66px)" }}>
                    {pl("COMPLETE")}
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
                  title={pl("Information remains visible across all speech and the reading gate")}
                  onClick={() => seek(plan.informationStart)}
                >
                  {pl("Information · overlaps speech")}
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
                    aria-label={`TTS · ${pl(clip.name)}`}
                    title={`${clip.file} · ${clip.duration.toFixed(6)} s · głośność ${speechVolume} · ${clip.voice} · próbka lokalna${audibleTts === clip.name ? " · ODTWARZANIE" : ""}`}
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
                    {pl(clip.name)} · {clip.duration.toFixed(2)}
                    {pl("s")}
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
                  {pl("Out")}
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
              aria-label={pl("Original PCM waveform")}
            >
              <title>{pl("Original music min/max waveform")}</title>
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
                title={`${mark.source} · pewność ${mark.confidence}`}
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
                  title={`${mark.approved ? "zatwierdzono" : "szacunek"} takt ${index + 1} · ${mark.source}`}
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
                    key={`${cue.at}-${pl(cue.name)}`}
                    style={{
                      left: `${(cue.at / duration) * 100}%`,
                      width: `${(0.28 / duration) * 100}%`,
                    }}
                    title={`${pl(cue.name)} · ${cue.intensity}`}
                    onClick={() => seek(cue.at)}
                  >
                    {pl(cue.name)}
                  </button>
                )),
            )}
          {!!analysis.intelligence?.authored.sections.length &&
            row(
              "Structure · authored",
              regions(analysis.intelligence.authored.sections, "section-region"),
            )}
          {row(
            "Zweryfikowane frazy",
            <span>
              {analysis.intelligence?.authored.vocalPhrases.some((p) => p.approved)
                ? "Zatwierdzone lokalnie"
                : "Brak zatwierdzonego odsłuchu"}
            </span>,
          )}
          {row("Reakcje na słowa", <span>Brak zatwierdzonych reakcji semantycznych</span>)}
          {!!phrases.length && row("Vocal phrases", regions(phrases, "vocal-region"))}
          {!!words.length && row("Vocal words", regions(words, "word-region"))}
          {row(
            "Authored cues",
            treatment.cues.map((cue) => (
              <button
                type="button"
                className={`cue-marker ${cue.name === "heroDrop" ? "hero" : ""} ${selectedCue === cue.name ? "selected" : ""}`}
                key={pl(cue.name)}
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
                        neighborhood(cue.at);
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
                title={`${pl(cue.name)} · ${timecode(cue.at)}`}
              >
                {pl(cue.name)}
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
                  title={pl(region.label)}
                >
                  {pl(region.label)}
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
                  title={`Zatwierdzona fala gotówki ${wave.intensity}`}
                >
                  {pl("cash")}
                  {wave.intensity.toFixed(1)}
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
                  key={pl(cue.name)}
                  style={{
                    left: `${(cue.at / duration) * 100}%`,
                    width: `${(Math.min(0.6, duration - cue.at) / duration) * 100}%`,
                  }}
                  onClick={() => seek(cue.at)}
                >
                  {pl(cue.name === "heroDrop" ? "amount" : "name")}
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
                {pl(
                  treatment.tier === 3
                    ? "shutter cuts"
                    : treatment.tier === 5
                      ? "panorama expansion"
                      : "monitor cascade / interruptions",
                )}
              </div>,
            )}
        </div>
      </div>
      <div className="timeline-navigator-tools">
        <button type="button" onClick={() => setZoom(Math.max(1, zoom / 1.5))}>
          −
        </button>
        <button type="button" onClick={() => setZoom(Math.min(128, zoom * 1.5))}>
          +
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            scroll.current.scrollLeft = 0;
          }}
        >
          Dopasuj całość
        </button>
      </div>
      <fieldset
        className="timeline-navigator"
        aria-label="Nawigator osi czasu"
        ref={navigatorRef}
        onPointerDown={(e) => {
          const v = axis();
          navDrag.current = {
            kind: (e.target as HTMLElement).dataset.edge ?? "pan",
            x: e.clientX,
            left: (v.left - v.gutter) / (v.total - v.header - 2 * v.gutter),
            span: (v.width - v.header) / (v.total - v.header - 2 * v.gutter),
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = navDrag.current;
          if (!d) return;
          const dx = (e.clientX - d.x) / navigatorRef.current.clientWidth;
          let left = d.left,
            span = d.span;
          if (d.kind === "pan") left = Math.max(0, Math.min(1 - span, left + dx));
          else if (d.kind === "left") {
            left = Math.max(0, Math.min(d.left + d.span - 1 / 128, d.left + dx));
            span = d.left + d.span - left;
          } else span = Math.max(1 / 128, Math.min(1 - left, d.span + dx));
          setZoom(1 / span);
          requestAnimationFrame(() => {
            const v = axis();
            scroll.current.scrollLeft = left * (v.total - v.header - 2 * v.gutter) + v.gutter;
          });
        }}
        onPointerUp={() => {
          navDrag.current = undefined;
        }}
        onPointerCancel={() => {
          navDrag.current = undefined;
        }}
      >
        <div
          className="navigator-window"
          style={{
            left:
              String(
                ((view.left - view.gutter) / (view.total - view.header - 2 * view.gutter)) * 100,
              ) + "%",
            width:
              String(
                ((view.width - view.header) / (view.total - view.header - 2 * view.gutter)) * 100,
              ) + "%",
          }}
        >
          <button type="button" aria-label="Lewa krawędź widoku" data-edge="left" />
          <span>Widoczny fragment</span>
          <button type="button" aria-label="Prawa krawędź widoku" data-edge="right" />
        </div>
      </fieldset>
      <ContextMenu menu={menu} close={() => setMenu(undefined)} />
    </section>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { treatments, liveMinimums } from "../../donations/choreography/treatments";
import { DonationScene } from "../../motion/engine/DonationScene";
import type { DonationSceneHandle, SceneStats } from "../../motion/engine/DonationScene";
import type { TimedRegion, MusicIntelligence } from "../../motion/types";
import { MusicPlayback } from "../../audio/motion/MusicPlayback";
import { readVisualSyncOffset } from "../../audio/motion/AudioClock";
import { runSyncCalibration } from "../../audio/motion/syncCalibration";
import { featuresAt } from "../../audio/motion/AudioFeatureBus";
import {
  rhythmMarks,
  vocalRegions,
  regionAt,
  normalizeIntelligence,
} from "../../audio/motion/musicIntelligence";
import { resolveDonationTemplate } from "../../donations/resolveDonationTemplate";
import { createDonateEventModelFromArgs } from "../../donations/createDonateEventModelFromArgs";
import { runMotionDonation } from "../../donations/runMotionDonation";
import { playOverlayAudioSequence } from "../../audio/playOverlayAudioSequence";
import { mediaAssets } from "../../motion/media/SourceMedia";
import { cashWaves } from "../../motion/cash/CashRenderer";
import { lifecyclePlan, parsePln, stressPresets, timecode } from "./studioModel";
import Timeline from "./Timeline";
import ProgramMonitor from "./ProgramMonitor";
import { Workspace } from "./Workspace";
import type { WorkspaceHandle, PanelName } from "./Workspace";
import { IconButton } from "./editorControls";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  PanelLeftClose,
  PanelRightClose,
  Maximize2,
  Minimize2,
  LayoutTemplate,
  Eye,
  EyeOff,
  Film,
  Type,
  Sparkles,
  Info,
  Banknote,
  AlertTriangle,
  Volume2,
} from "lucide-react";
import speech from "./speech.json";
import "./motion-studio.css";

const params = new URLSearchParams(window.location.search);
const initialTier = Math.floor(Math.min(8, Math.max(1, Number(params.get("tier")) || 6)));
const layers = [
  { name: "Source media", selector: ".source-media" },
  {
    name: "Scene forms",
    selector:
      ".heart-bridge, .turkey-floor, .turkey-step, .mask-floor, .paper-strip, .paper-perforation, .ovation-lip, .webcam-still",
  },
  {
    name: "Callouts",
    selector:
      ".scene-phrase, .heart-call, .webcam-shout, .webcam-wtf, .ovation-wing, .paper-caption, .rodent-omg",
  },
  { name: "Name", selector: ".motion-name" },
  { name: "Amount", selector: ".motion-amount" },
  { name: "Information", selector: ".motion-information" },
];
type Job = { id?: string; state: string; progress?: number; error?: string };
export default function MotionStudioGate() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  if (params.get("clean") !== "1" && (viewport.width < 1280 || viewport.height < 720))
    return (
      <main className="studio-desktop-required">
        <AlertTriangle size={28} />
        <h1>Motion Studio requires a desktop-sized viewport.</h1>
        <p>
          Current viewport:{" "}
          <strong>
            {viewport.width} × {viewport.height}
          </strong>
        </p>
        <p>
          Recommended minimum: <strong>1280 × 720</strong>
        </p>
        <small>Use a desktop or laptop and enlarge the browser window.</small>
      </main>
    );
  return <MotionStudio />;
}
function MotionStudio() {
  const [tier, setTier] = useState(initialTier);
  const [seed, setSeed] = useState(params.get("seed") ?? "kaaajka-motion-01");
  const [quality, setQuality] = useState(params.get("quality") ?? "auto");
  const [background, setBackground] = useState(params.get("background") ?? "stream");
  const [nickname, setNickname] = useState(params.get("nickname") ?? "Kaaajka");
  const [amount, setAmount] = useState(
    ((params.has("amount") ? Number(params.get("amount")) || 0 : 5732) / 100).toFixed(2),
  );
  const [message, setMessage] = useState(params.get("message") ?? "Dziękuję za stream!");
  const [commission, setCommission] = useState(params.get("commission") ?? "0");
  const [automatic, setAutomatic] = useState(false);
  const [mode, setMode] = useState("hero");
  const modeRef = useRef("hero");
  const [activePanel, setActivePanel] = useState<PanelName>("stage");
  const [maximized, setMaximized] = useState<PanelName>();
  const workspace = useRef<WorkspaceHandle>(null);
  const [streamFrame, setStreamFrame] = useState(
    params.get("streamFrame") ?? "/__studio-assets/stream/kaaajka-rocket-league.jpg",
  );
  const customFile = useRef<File>();
  const customUrl = useRef<string>();
  const [selectedTts, setSelectedTts] = useState<string>();
  const [audibleTts, setAudibleTts] = useState<string>();
  const [speechState, setSpeechState] = useState<Record<string, string>>({});
  const fullPlaying = useRef(false);
  const lifecycleClock = useRef({
    at: 0,
    now: 0,
    audio: undefined as HTMLAudioElement | undefined,
  });
  const phaseRef = useRef("hero");
  const phaseChange = (value: string) => {
    phaseRef.current = value;
    setPhase(value);
  };
  const customStream = (file: File) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2_000_000) {
      setStatus("Choose a local PNG, JPEG or WebP smaller than 2 MB");
      return;
    }
    if (customUrl.current) URL.revokeObjectURL(customUrl.current);
    customFile.current = file;
    customUrl.current = URL.createObjectURL(file);
    setStreamFrame(customUrl.current);
    setBackground("stream");
  };
  useEffect(
    () => () => {
      if (customUrl.current) URL.revokeObjectURL(customUrl.current);
    },
    [],
  );
  const [time, setTime] = useState(0);
  const position = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState("hero");
  const [offset, setOffset] = useState(readVisualSyncOffset(window.location.search));
  const flash = useRef<HTMLDivElement>(null),
    calibration = useRef<AbortController>();
  const [status, setStatus] = useState("Loading music…");
  const [zoom, setZoom] = useState(1);
  const [selection, setSelection] = useState<[number, number]>([0, 2]);
  const [loop, setLoop] = useState(false);
  const [tab, setTab] = useState("data");
  const [selectedCue, setSelectedCue] = useState("heroDrop");
  const [selectedLayer, setSelectedLayer] = useState("Source media");
  const [hidden, setHidden] = useState<string[]>([]);
  const wordOriginal = useRef<TimedRegion>();
  const [regionKind, setRegionKind] = useState("words");
  const [word, setWord] = useState<TimedRegion>();
  const [authored, setAuthored] = useState<MusicIntelligence["authored"]>();
  const [range, setRange] = useState("hero"),
    [fps, setFps] = useState(60),
    [format, setFormat] = useState("mp4");
  const [exportBackground, setExportBackground] = useState("solid"),
    [exportAudio, setExportAudio] = useState(true);
  const [job, setJob] = useState<Job>({ state: "idle" });
  const source = treatments[tier - 1];
  const treatment = useMemo(
    () =>
      authored
        ? {
            ...source,
            analysis: {
              ...source.analysis,
              intelligence: normalizeIntelligence(
                { ...source.analysis.intelligence, authored },
                source.analysis.duration,
                source.analysis.sourceSha256,
              ),
            },
          }
        : source,
    [source, authored],
  );
  const config = resolveDonationTemplate(liveMinimums[Math.min(6, tier - 1)]);
  const cents = parsePln(amount),
    commissionCents = parsePln(commission);
  const donate = useMemo(
    () =>
      createDonateEventModelFromArgs(
        {
          id: seed,
          nickname,
          message,
          amount: cents ?? 5732,
          commission: commissionCents ?? 0,
          test: true,
        },
        { fallbackId: seed },
      ),
    [seed, nickname, message, cents, commissionCents],
  );
  const enabledSpeech = speech.filter(
    (clip) =>
      ({
        nickname: config.speech.readNickname,
        amount: config.speech.readAmount,
        message: config.speech.readMessage,
      })[clip.name],
  );
  const plan = lifecyclePlan(treatment.analysis.duration, message, enabledSpeech);
  const planRef = useRef(plan);
  planRef.current = plan;
  const [stats, setStats] = useState<SceneStats>({
    quality: "safe",
    frameMs: 16.67,
    features: featuresAt(treatment.analysis, 0),
  });
  const scene = useRef<DonationSceneHandle>();
  const music = useRef<MusicPlayback>();
  const raf = useRef(0),
    generation = useRef(0),
    abort = useRef<AbortController>();
  const loopRef = useRef({ loop, selection });
  loopRef.current = { loop, selection };
  const pause = useCallback(() => {
    generation.current++;
    fullPlaying.current = false;
    setAudibleTts(undefined);
    calibration.current?.abort();
    abort.current?.abort();
    if (music.current?.isPlaying) {
      position.current = music.current.time;
      setTime(position.current);
    }
    music.current?.pause();
    cancelAnimationFrame(raf.current);
    setPlaying(false);
  }, []);
  const seek = useCallback(
    (next: number) => {
      pause();
      const full = modeRef.current === "full",
        plan = planRef.current;
      const at = Math.min(full ? plan.duration : treatment.analysis.duration, Math.max(0, next));
      position.current = at;
      setTime(at);
      music.current?.seek(Math.min(at, treatment.analysis.duration));
      const root = document.querySelector<HTMLElement>(".donation-motion");
      if (root) {
        root.style.transition = "none";
        root.style.opacity = "1";
      }
      if (full && at >= plan.informationStart) {
        scene.current?.informationAt(
          (at - plan.informationStart) * 1000,
          plan.informationDuration * 1000,
        );
        setStats((current) => ({ ...current, media: scene.current?.media() ?? [] }));
        const stage = plan.stages.find(
          (stage) => stage.name !== "information" && at >= stage.start && at < stage.end,
        );
        phaseRef.current = at >= plan.duration ? "complete" : (stage?.name ?? "information");
        setPhase(phaseRef.current);
        const outro = plan.stages.find((stage) => stage.name === "outro");
        if (root && at >= outro.start)
          root.style.opacity = String(Math.max(0, 1 - (at - outro.start) / 0.65));
      } else {
        phaseRef.current = "hero";
        setPhase("hero");
        const result = scene.current?.renderAt(at);
        if (result) setStats(result);
      }
    },
    [pause, treatment.analysis.duration],
  );
  useEffect(() => {
    const cancellation = new AbortController();
    pause();
    setStatus("Loading music…");
    let playback: MusicPlayback;
    try {
      playback = new MusicPlayback(config.sound.volume);
      playback.visualSyncOffsetMs = readVisualSyncOffset(window.location.search);
      music.current = playback;
    } catch (error) {
      setStatus(`AUDIO CLOCK UNAVAILABLE · ${error}`);
      return;
    }
    const initial =
      params.get("time") === "hero"
        ? source.cues.find((cue) => cue.name === "heroDrop").at
        : Number(params.get("time")) || 0;
    seek(initial);
    setSelection([0, Math.min(2, source.analysis.duration)]);
    void playback
      .load(config.sound.url, cancellation.signal)
      .then(() => {
        if (!cancellation.signal.aborted) {
          setStatus("Ready");
          seek(initial);
        }
      })
      .catch((error) => {
        if (!cancellation.signal.aborted) {
          playback.setSilentFallback(source.analysis.duration);
          setStatus(
            `AUDIO DECODE FAILED · ${config.sound.url.split("/").at(-1)} · SILENT CLOCK ACTIVE · ${error}`,
          );
          seek(initial);
        }
      });
    return () => {
      pause();
      cancellation.abort();
      playback.dispose();
    };
  }, [config, source, seek, pause]);
  useEffect(() => {
    if (music.current) music.current.visualSyncOffsetMs = offset;
    return () => calibration.current?.abort();
  }, [offset]);
  // Editing always cancels the old show before restoring the authored position.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Editing data or remounting quality must cancel playback and restore inspection.
  useEffect(() => {
    pause();
    seek(position.current);
  }, [donate, quality, treatment, pause, seek]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A tier switch resets its local editor selection.
  useEffect(() => {
    setAuthored(undefined);
    setWord(undefined);
    setHidden([]);
  }, [tier]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reapply debug visibility after scene content or quality remounts.
  useEffect(() => {
    for (const layer of [...layers, { name: "Cash", selector: ".motion-cash" }])
      scene.current?.setLayerVisibility(layer.selector, !hidden.includes(layer.name));
  }, [hidden, donate, quality]);
  useEffect(() => {
    if (automatic && cents !== undefined) {
      const index = liveMinimums.reduce((chosen, min, index) => (cents >= min ? index : chosen), 0);
      setTier(index + 1);
    }
  }, [automatic, cents]);
  const play = async (full = mode === "full") => {
    if (
      (!music.current?.duration && !full) ||
      playing ||
      cents === undefined ||
      commissionCents === undefined
    )
      return;
    pause();
    const token = ++generation.current;
    fullPlaying.current = full;
    phaseRef.current = "hero";
    const root = document.querySelector<HTMLElement>(".donation-motion");
    if (root) {
      root.style.transition = "";
      root.style.opacity = "1";
    }
    const controller = new AbortController();
    abort.current = controller;
    const playback = music.current;
    if (full) {
      playback?.seek(0);
      position.current = 0;
    } else if (playback.time >= playback.duration) playback.seek(0);
    setPlaying(true);
    setPhase("hero");
    let previous = performance.now(),
      lastUI = 0;
    const frame = (now: number) => {
      if (token !== generation.current) return;
      const clock = lifecycleClock.current;
      const at =
        full && phaseRef.current !== "hero"
          ? Math.min(
              plan.duration,
              clock.at +
                (clock.audio && !clock.audio.paused
                  ? clock.audio.currentTime
                  : (now - clock.now) / 1000),
            )
          : (playback?.time ?? 0);
      position.current = at;
      const result =
        phaseRef.current === "hero" ? scene.current?.renderAt(at, now - previous) : undefined;
      previous = now;
      if (now - lastUI > 60) {
        setTime(at);
        if (result) setStats(result);
        lastUI = now;
      }
      if (!full && loopRef.current.loop && at >= loopRef.current.selection[1])
        playback.seek(loopRef.current.selection[0]);
      raf.current = requestAnimationFrame(frame);
    };
    const playMusic = async () => {
      if (!playback?.duration)
        throw new Error("Audio clock unavailable; continuing full alert to information");
      raf.current = requestAnimationFrame(frame);
      do {
        await playback.play(controller.signal);
      } while (
        !full &&
        loopRef.current.loop &&
        !controller.signal.aborted &&
        token === generation.current
      );
      if (!full) cancelAnimationFrame(raf.current);
      if (token === generation.current) {
        position.current = playback.time;
        setTime(playback.time);
      }
    };
    try {
      if (full)
        await runMotionDonation(
          {
            music: playMusic,
            information: (ms) => {
              if (token !== generation.current) return;
              lifecycleClock.current = {
                at: plan.informationStart,
                now: performance.now(),
                audio: undefined,
              };
              phaseChange("information");
              scene.current?.information(ms);
              setStats((current) => ({ ...current, media: scene.current?.media() ?? [] }));
            },
            speech: async (steps) => {
              await playOverlayAudioSequence(steps, {
                signal: controller.signal,
                loadTimeoutMs: 1500,
              });
              if (token === generation.current && !controller.signal.aborted) {
                lifecycleClock.current = {
                  at: Math.max(
                    position.current,
                    plan.stages.filter((stage) => stage.name.startsWith("tts-")).at(-1)?.end ??
                      plan.informationStart,
                  ),
                  now: performance.now(),
                  audio: undefined,
                };
                setAudibleTts(undefined);
                phaseChange("information");
              }
            },
            outro: () => {
              if (token !== generation.current) return;
              lifecycleClock.current = {
                at: plan.stages.find((stage) => stage.name === "outro").start,
                now: performance.now(),
                audio: undefined,
              };
              phaseChange("outro");
              scene.current?.outro();
            },
            finished: () => {
              if (token === generation.current) {
                position.current = plan.duration;
                setTime(plan.duration);
                phaseChange("complete");
                setAudibleTts(undefined);
              }
            },
          },
          enabledSpeech.map((clip) => ({
            url: `/__studio-assets/speech/${clip.file}`,
            volume: config.speech.volume,
            kind: "tts",
            label: clip.name,
            onFailure: (error) => {
              if (token === generation.current) {
                setSpeechState((state) => ({
                  ...state,
                  [clip.name]: "Failed · no fallback substituted",
                }));
                setStatus(`TTS FIXTURE FAILED · ${clip.file} · ${error}`);
                setAudibleTts(undefined);
              }
            },
            onPlaying: (audio) => {
              if (token !== generation.current) return;
              lifecycleClock.current = {
                at: plan.stages.find((stage) => stage.name === `tts-${clip.name}`).start,
                now: performance.now(),
                audio,
              };
              setSpeechState((state) => ({ ...state, [clip.name]: "Normal · local fixture" }));
              setAudibleTts(clip.name);
              phaseChange(`tts-${clip.name}`);
            },
            onBeforePlay: () => {
              if (token === generation.current) {
                setAudibleTts(undefined);
                phaseChange(`tts-${clip.name}`);
              }
            },
          })),
          message,
          controller.signal,
        );
      else await playMusic();
    } catch (error) {
      if (token === generation.current) setStatus(String(error));
    } finally {
      if (token === generation.current) {
        cancelAnimationFrame(raf.current);
        setPlaying(false);
        fullPlaying.current = false;
        setAudibleTts(undefined);
      }
    }
  };
  const previewTts = async (name: string) => {
    pause();
    setSelectedTts(name);
    setTab("analysis");
    const clip = speech.find((clip) => clip.name === name);
    const controller = new AbortController();
    abort.current = controller;
    const token = ++generation.current;
    await playOverlayAudioSequence(
      [
        {
          url: `/__studio-assets/speech/${clip.file}`,
          volume: config.speech.volume,
          kind: "tts",
          onFailure: (error) => {
            if (token === generation.current) {
              setSpeechState((state) => ({ ...state, [name]: "Failed · no fallback substituted" }));
              setStatus(`TTS FIXTURE FAILED · ${clip.file} · ${error}`);
              setAudibleTts(undefined);
            }
          },
          onPlaying: () => {
            if (token === generation.current) {
              setSpeechState((state) => ({ ...state, [name]: "Normal · local fixture" }));
              setAudibleTts(name);
            }
          },
        },
      ],
      { signal: controller.signal, loadTimeoutMs: 1500 },
    );
    if (token === generation.current) setAudibleTts(undefined);
  };
  const cue = treatment.cues.filter((cue) => cue.at <= time).at(-1);
  const nextCue = (direction: number) => {
    const target =
      direction > 0
        ? treatment.cues.find((cue) => cue.at > position.current + 0.001)
        : [...treatment.cues].reverse().find((cue) => cue.at < position.current - 0.001);
    if (target) {
      setSelectedCue(target.name);
      seek(target.at);
    }
  };
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (
        (event.target as HTMLElement).closest(
          'input,textarea,select,[contenteditable="true"],[role="menu"],[role="separator"]',
        )
      )
        return;
      if (event.ctrlKey && event.shiftKey) {
        if (event.code === "KeyM") {
          event.preventDefault();
          workspace.current?.maximize();
          return;
        }
        if (event.code === "KeyL") {
          event.preventDefault();
          workspace.current?.toggleLeft();
          return;
        }
        if (event.code === "KeyR") {
          event.preventDefault();
          workspace.current?.toggleRight();
          return;
        }
      }
      if (event.code === "Escape" && maximized) {
        event.preventDefault();
        workspace.current?.restore();
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        if (playing) pause();
        else void play();
      }
      if (event.code === "Home") {
        event.preventDefault();
        seek(0);
      }
      if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
        event.preventDefault();
        seek(
          position.current + (event.code === "ArrowLeft" ? -1 : 1) * (event.shiftKey ? 0.05 : 0.01),
        );
      }
      if (event.code === "ArrowUp" || event.code === "ArrowDown") {
        event.preventDefault();
        nextCue(event.code === "ArrowUp" ? -1 : 1);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  useEffect(() => {
    if (!job.id || !["rendering", "encoding"].includes(job.state)) return;
    const timer = setInterval(() => {
      void fetch(`/__studio/export/${job.id}`)
        .then((response) => response.json())
        .then(setJob)
        .catch((error) => setJob({ state: "failed", error: String(error) }));
    }, 1000);
    return () => clearInterval(timer);
  }, [job.id, job.state]);
  const chooseWord = (region: TimedRegion, kind: string) => {
    setSelectedTts(undefined);
    wordOriginal.current = region;
    setRegionKind(
      kind === "section-region" ? "sections" : kind === "vocal-region" ? "vocalPhrases" : "words",
    );
    setWord({ ...region });
    setTab("analysis");
  };
  const correctWord = (createCue = false) => {
    if (!word) return;
    const current = authored ?? treatment.analysis.intelligence.authored;
    if (word.start < 0 || word.end <= word.start || word.end > treatment.analysis.duration) {
      setStatus("Invalid timing: keep start < end within the track");
      return;
    }
    const original = wordOriginal.current;
    const list = (
      current[regionKind]?.length
        ? current[regionKind]
        : (treatment.analysis.intelligence.inferred[regionKind] ?? [])
    ).filter((region) => region.start !== original?.start || region.end !== original?.end);
    const corrected = { ...word, approved: true, confidence: 1, source: "Studio correction" };
    const next = {
      ...current,
      sourceSha256: treatment.analysis.sourceSha256,
      [regionKind]: [...list, corrected].sort((a, b) => a.start - b.start),
      cues: createCue
        ? [
            ...(current.cues ?? []),
            { at: word.start, name: `vocal-${word.text}`, intensity: 0.6, group: "media" },
          ]
        : current.cues,
    };
    wordOriginal.current = corrected;
    setAuthored(next);
    setWord(corrected);
    setStatus("Correction applied · save to keep it");
  };
  const saveCorrections = async () => {
    try {
      const response = await fetch("/__studio/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          authored: authored ?? treatment.analysis.intelligence.authored,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      setStatus("Authored corrections saved");
    } catch (error) {
      setStatus(String(error));
    }
  };
  const requestExport = async () => {
    setJob({ state: "starting" });
    try {
      const custom =
        exportBackground === "stream" && customFile.current
          ? await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = reject;
              reader.readAsDataURL(customFile.current);
            })
          : undefined;
      const response = await fetch("/__studio/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          seed,
          quality,
          nickname,
          amount: cents,
          commission: commissionCents,
          message,
          range,
          selection,
          cue: selectedCue,
          fps,
          format,
          background: exportBackground,
          audio: exportAudio,
          streamFrame: custom,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      setJob(result);
    } catch (error) {
      setJob({ state: "failed", error: String(error) });
    }
  };
  useEffect(() => {
    const debug = {
      seek,
      selectTier: setTier,
      play: () => play(false),
      playFull: () => play(true),
      pause,
      information: (ms = 6000) => {
        pause();
        setPhase("information");
        scene.current?.information(ms);
      },
      status: () => ({
        time: fullPlaying.current
          ? position.current
          : music.current?.isPlaying
            ? music.current.time
            : position.current,
        playing: music.current?.isPlaying ?? false,
        active: playing,
        phase,
        quality: stats.quality,
        duration: music.current?.duration,
        cue: cue?.name,
        media: scene.current?.media() ?? [],
        data: { nickname, amount: cents, message },
        selection,
        loop,
        mode,
        timelineDuration: mode === "full" ? plan.duration : treatment.analysis.duration,
        plan,
        audibleTts,
        selectedTts,
        workspace: workspace.current?.layout(),
      }),
      exportMetadata: () => ({
        analysis: treatment.analysis,
        duration: treatment.analysis.duration,
        cues: treatment.cues,
        musicUrl: config.sound.url,
        musicVolume: config.sound.volume,
        speech: {
          nickname: config.speech.readNickname,
          amount: config.speech.readAmount,
          message: config.speech.readMessage,
        },
        speechVolume: config.speech.volume,
      }),
      renderExportAt: (at: number, full: boolean) => {
        pause();
        for (const layer of [...layers, { name: "Cash", selector: ".motion-cash" }])
          scene.current?.setLayerVisibility(layer.selector, true);
        const root = document.querySelector<HTMLElement>(".donation-motion");
        root.style.transition = "none";
        root.style.opacity = "1";
        if (!full || at < plan.informationStart) {
          seek(at);
        } else {
          scene.current?.informationAt(
            (at - plan.informationStart) * 1000,
            plan.informationDuration * 1000,
          );
          const outro = plan.stages.find((stage) => stage.name === "outro");
          if (at >= outro.start)
            root.style.opacity = String(Math.max(0, 1 - (at - outro.start) / 0.65));
        }
      },
    };
    (window as typeof window & { motionStudio?: typeof debug }).motionStudio = debug;
    return () => {
      delete (window as typeof window & { motionStudio?: typeof debug }).motionStudio;
    };
  });
  const beats = rhythmMarks(treatment.analysis),
    bars = rhythmMarks(treatment.analysis, true);
  const beatIndex = beats.filter((beat) => beat.at <= time).length,
    barIndex = bars.filter((bar) => bar.at <= time).length;
  const vocal = regionAt(vocalRegions(treatment.analysis, true), time);
  const asset = mediaAssets[tier - 1];
  const selected = treatment.cues.find((cue) => cue.name === selectedCue);
  const cashCue = cashWaves(treatment)
    .filter((wave) => time >= wave.at && time < wave.at + 2.8)
    .at(-1);
  const preview = (
    <div className={`studio-preview background-${background}`}>
      {background === "stream" && (
        <img
          className="studio-stream"
          src={streamFrame}
          alt="Kaaajka Rocket League stream reference"
          draggable={false}
        />
      )}
      <DonationScene
        key={`${tier}:${seed}:${quality}:${nickname}:${cents}:${commissionCents}`}
        ref={scene}
        donate={donate}
        treatment={treatment}
        netAmount={Math.max(
          0,
          donate.amount - (config.amountWithoutCommission ? (commissionCents ?? 0) : 0),
        )}
        seed={seed}
        quality={quality}
      />
      <div ref={flash} className="calibration-flash" aria-hidden="true" />
    </div>
  );
  if (params.get("clean") === "1") return <div className="studio-clean">{preview}</div>;
  return (
    <div className="motion-studio">
      <header className="studio-topbar">
        <div className="studio-brand">
          <img src="/assets/donations/brand/bunny-cyan.png" alt="" draggable={false} />
          <strong>Motion Studio</strong>
          <small>2.1</small>
        </div>
        <label className="scene-picker">
          Scene
          <select
            id="studio-tier"
            value={tier}
            onChange={(event) => {
              pause();
              setTier(Number(event.target.value));
            }}
          >
            {treatments.map((t) => (
              <option key={t.tier} value={t.tier}>
                Donate{t.tier} · {t.title}
              </option>
            ))}
          </select>
        </label>
        <div className="studio-modes">
          {[
            ["hero", "Hero Only"],
            ["full", "Full Alert"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={mode === value}
              onClick={() => {
                pause();
                modeRef.current = value;
                setMode(value);
                seek(position.current);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="studio-transport">
          <IconButton
            icon={SkipBack}
            label="Previous cue"
            shortcut="↑"
            onClick={() => nextCue(-1)}
          />
          <IconButton
            icon={playing ? Pause : Play}
            label={playing ? "Pause" : "Play"}
            shortcut="Space"
            onClick={() => (playing ? pause() : void play())}
          />
          <IconButton icon={RotateCcw} label="Restart" shortcut="Home" onClick={() => seek(0)} />
          <IconButton icon={SkipForward} label="Next cue" shortcut="↓" onClick={() => nextCue(1)} />
          <button
            type="button"
            title="Seek −50 ms (Shift+←)"
            onClick={() => seek(position.current - 0.05)}
          >
            −50 ms
          </button>
          <button
            type="button"
            title="Seek +50 ms (Shift+→)"
            onClick={() => seek(position.current + 0.05)}
          >
            +50 ms
          </button>
        </div>
        <output
          className={`studio-status ${status.includes("FAILED") ? "audio-warning" : ""}`}
          title={status}
        >
          {status.includes("FAILED") && <AlertTriangle size={14} />}
          <i className={playing ? "active" : ""} />
          {status}
        </output>
        <div className="workspace-actions">
          <IconButton
            icon={PanelLeftClose}
            label="Toggle Scene Tree"
            shortcut="Ctrl+Shift+L"
            onClick={() => workspace.current?.toggleLeft()}
          />
          <IconButton
            icon={PanelRightClose}
            label="Toggle Inspector"
            shortcut="Ctrl+Shift+R"
            onClick={() => workspace.current?.toggleRight()}
          />
          <IconButton
            icon={maximized ? Minimize2 : Maximize2}
            label={maximized ? "Restore workspace" : "Maximize active panel"}
            shortcut="Ctrl+Shift+M"
            onClick={() => workspace.current?.maximize()}
          />
          <IconButton
            icon={LayoutTemplate}
            label="Reset Workspace"
            onClick={() => workspace.current?.reset()}
          />
        </div>
      </header>
      <Workspace
        ref={workspace}
        active={activePanel}
        setActive={setActivePanel}
        onMaximized={setMaximized}
        tree={
          <aside className="studio-tree">
            <h2>Donate{tier}</h2>
            <p>{treatment.title}</p>
            {[
              ...layers,
              ...(tier >= 5 && tier <= 7 ? [{ name: "Cash", selector: ".motion-cash" }] : []),
            ].map((layer) => (
              <div
                className={`layer-row ${selectedLayer === layer.name ? "selected" : ""}`}
                key={layer.name}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTts(undefined);
                    setWord(undefined);
                    setSelectedLayer(layer.name);
                    setTab("analysis");
                  }}
                >
                  {layer.name === "Source media" ? (
                    <Film size={14} />
                  ) : ["Name", "Amount", "Callouts"].includes(layer.name) ? (
                    <Type size={14} />
                  ) : layer.name === "Cash" ? (
                    <Banknote size={14} />
                  ) : layer.name === "Information" ? (
                    <Info size={14} />
                  ) : (
                    <Sparkles size={14} />
                  )}{" "}
                  {layer.name}
                </button>
                <IconButton
                  icon={hidden.includes(layer.name) ? EyeOff : Eye}
                  label={`Show ${layer.name}`}
                  pressed={!hidden.includes(layer.name)}
                  onClick={() =>
                    setHidden(
                      hidden.includes(layer.name)
                        ? hidden.filter((name) => name !== layer.name)
                        : [...hidden, layer.name],
                    )
                  }
                />
              </div>
            ))}
            <div className="tree-bottom">
              <label>
                Detail budget
                <select
                  id="studio-quality"
                  value={quality}
                  onChange={(event) => setQuality(event.target.value)}
                >
                  {["auto", "high", "medium", "safe"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label>
                Replay seed
                <input
                  id="studio-seed"
                  value={seed}
                  onChange={(event) => setSeed(event.target.value)}
                />
              </label>
              <small>Visibility overrides are local to Studio.</small>
            </div>
          </aside>
        }
        stage={
          <section className="studio-center">
            {(status.includes("FAILED") || status.includes("UNAVAILABLE")) && (
              <div className="stage-audio-error" role="alert">
                <AlertTriangle size={14} />
                {status}
              </div>
            )}
            <ProgramMonitor
              background={background}
              setBackground={setBackground}
              onCustom={customStream}
            >
              {preview}
            </ProgramMonitor>
            <div className="playhead-readout">
              <strong>
                {mode === "full" ? "ALERT " : ""}
                {timecode(time)}
              </strong>
              {time < treatment.analysis.duration ? (
                <>
                  <span>
                    BEAT {beatIndex} · BAR ≈{barIndex}
                  </span>
                  <span>{cue?.name ?? "intro"}</span>
                  <span>
                    MEDIA {timecode(stats.media?.[0]?.time ?? 0)}{" "}
                    {stats.media?.[0]?.frozen ? "HOLD" : "LOOP"}
                  </span>
                  {vocal && <span title={vocal.source}>VOCAL ≈ {vocal.text}</span>}
                </>
              ) : (
                <>
                  <span>HERO ENDED {timecode(treatment.analysis.duration)}</span>
                  <span>LIFECYCLE +{timecode(time - treatment.analysis.duration)}</span>
                  <span>{phase.replace("tts-", "TTS ").toUpperCase()}</span>
                </>
              )}
              <input
                aria-label="Music time"
                id="studio-time"
                type="number"
                step=".001"
                value={Number(time.toFixed(3))}
                onChange={(event) => seek(Number(event.target.value))}
              />
            </div>
          </section>
        }
        inspector={
          <aside className="studio-inspector">
            <div className="inspector-tabs">
              {[
                ["data", "Donation data"],
                ["analysis", "Inspector"],
                ["export", "Export"],
              ].map(([id, label]) => (
                <button type="button" key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="inspector-content">
              {tab === "data" && (
                <>
                  <h2>Donation data</h2>
                  <p>Test viewer content in this scene.</p>
                  <label>
                    Nickname
                    <input
                      aria-label="Nickname"
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                    />
                  </label>
                  <div className="preset-row">
                    {Object.entries(stressPresets.nickname).map(([key, value]) => (
                      <button type="button" key={key} onClick={() => setNickname(value)}>
                        {key}
                      </button>
                    ))}
                  </div>
                  <label>
                    Amount · PLN
                    <input
                      aria-label="Amount PLN"
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      aria-invalid={cents === undefined}
                    />
                  </label>
                  {cents === undefined && (
                    <small className="error">Enter PLN with up to two decimal places.</small>
                  )}
                  <div className="preset-row">
                    <button
                      type="button"
                      onClick={() =>
                        setAmount((liveMinimums[Math.min(6, tier - 1)] / 100).toFixed(2))
                      }
                    >
                      threshold
                    </button>
                    {Object.entries(stressPresets.amount).map(([key, value]) => (
                      <button type="button" key={key} onClick={() => setAmount(value)}>
                        {key}
                      </button>
                    ))}
                  </div>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={automatic}
                      onChange={(event) => setAutomatic(event.target.checked)}
                    />
                    Resolve tier from amount
                  </label>
                  <label>
                    Message
                    <textarea
                      aria-label="Message"
                      rows={5}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                    />
                  </label>
                  <div className="preset-row">
                    {Object.entries(stressPresets.message).map(([key, value]) => (
                      <button type="button" key={key} onClick={() => setMessage(value)}>
                        {key}
                      </button>
                    ))}
                  </div>
                  <small>{message.length} characters · full text retained</small>
                  <label>
                    Commission · PLN
                    <input
                      aria-label="Commission PLN"
                      value={commission}
                      onChange={(event) => setCommission(event.target.value)}
                      aria-invalid={commissionCents === undefined}
                    />
                  </label>
                  <div className="speech-note">
                    <strong>Local test voice · Paulina</strong>
                    <p>
                      Fixed spoken samples exercise enabled TTS stages. Custom data appears on the
                      information card.
                    </p>
                    {enabledSpeech.map((clip) => (
                      <small key={clip.name}>
                        {clip.name}: {clip.text}
                      </small>
                    ))}
                  </div>
                </>
              )}
              {tab === "analysis" && selectedTts && (
                <section className="tts-inspector">
                  <h2>TTS · {selectedTts}</h2>
                  <dl>
                    <dt>Fixture</dt>
                    <dd>{speech.find((clip) => clip.name === selectedTts).file}</dd>
                    <dt>Duration</dt>
                    <dd>
                      {speech.find((clip) => clip.name === selectedTts).duration.toFixed(6)} s
                    </dd>
                    <dt>Volume</dt>
                    <dd>{config.speech.volume}</dd>
                    <dt>Voice</dt>
                    <dd>{speech.find((clip) => clip.name === selectedTts).voice}</dd>
                    <dt>Sample</dt>
                    <dd>{speech.find((clip) => clip.name === selectedTts).text}</dd>
                    <dt>State</dt>
                    <dd>
                      {audibleTts === selectedTts
                        ? "Playing local fixture"
                        : (speechState[selectedTts] ?? "Normal · local fixture")}
                    </dd>
                  </dl>
                  <button type="button" onClick={() => void previewTts(selectedTts)}>
                    <Volume2 size={14} /> Preview this TTS
                  </button>
                </section>
              )}
              {tab === "analysis" && (
                <>
                  <h2>{word ? "Vocal timing" : selectedLayer}</h2>
                  <dl>
                    <dt>Selected cue</dt>
                    <dd>
                      {selectedCue} · {timecode(selected?.at ?? 0)}
                    </dd>
                    <dt>Source</dt>
                    <dd>
                      {asset
                        ? `${asset.width} × ${asset.height} · ${asset.frameCount} frames`
                        : "Studio-only procedural scene"}
                    </dd>
                    <dt>Media position</dt>
                    <dd>
                      {stats.media?.[0]
                        ? `${timecode(stats.media[0].time)} / frame ${stats.media[0].frame} · ${stats.media[0].state}`
                        : "None"}
                    </dd>
                    <dt>Pose hold</dt>
                    <dd>
                      {asset
                        ? `${asset.heroSourceTime.toFixed(3)} s · music hero ${timecode(treatment.cues.find((c) => c.name === "heroDrop").at)}`
                        : "None"}
                    </dd>
                    <dt>Echo delay</dt>
                    <dd>
                      {stats.media
                        ?.slice(1)
                        .map((media) => `${timecode(media.time)} / frame ${media.frame}`)
                        .join(" · ") || "No live echoes"}
                    </dd>
                    <dt>Tempo estimate</dt>
                    <dd>{treatment.analysis.bpm} BPM</dd>
                    <dt>Detail tier</dt>
                    <dd>
                      {stats.quality} ·{" "}
                      {tier === 6
                        ? 12
                        : stats.quality === "safe"
                          ? 14
                          : stats.quality === "medium"
                            ? 40
                            : 72}{" "}
                      maximum bills
                    </dd>
                    {tier >= 5 && tier <= 7 && (
                      <>
                        <dt>Cash cue</dt>
                        <dd>
                          {cashCue
                            ? `${timecode(cashCue.at)} · intensity ${cashCue.intensity.toFixed(2)}`
                            : "No active cash wave"}
                        </dd>
                      </>
                    )}
                  </dl>
                  <h3>Measured activity</h3>
                  <label>
                    Visual sync offset · ms
                    <input
                      id="studio-offset"
                      type="number"
                      min="-500"
                      max="500"
                      value={offset}
                      onChange={(event) =>
                        setOffset(Math.min(500, Math.max(-500, Number(event.target.value))))
                      }
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      pause();
                      calibration.current?.abort();
                      calibration.current = new AbortController();
                      void runSyncCalibration(
                        flash.current,
                        offset,
                        calibration.current.signal,
                      ).catch((error) => setStatus(String(error)));
                    }}
                  >
                    Schedule click + flash
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = authored ?? treatment.analysis.intelligence?.authored;
                      if (!current) return;
                      setAuthored({
                        ...current,
                        sourceSha256: treatment.analysis.sourceSha256,
                        downbeats: [
                          ...current.downbeats,
                          {
                            at: time,
                            approved: true,
                            confidence: 1,
                            source: "Studio downbeat correction",
                          },
                        ].sort((a, b) => a.at - b.at),
                      });
                    }}
                  >
                    Approve downbeat at playhead
                  </button>
                  <div className="studio-features">
                    {Object.entries(stats.features).map(([name, value]) => (
                      <label key={name}>
                        {name}
                        <meter min="0" max="1" value={value} />
                      </label>
                    ))}
                  </div>
                  {word ? (
                    <div className="word-editor">
                      <h3>{word.approved ? "Approved" : "Inference · needs review"}</h3>
                      <p>
                        {word.source} · confidence {word.confidence.toFixed(2)}
                      </p>
                      <label>
                        Word / phrase
                        <input
                          value={word.text ?? word.label ?? ""}
                          onChange={(event) => setWord({ ...word, text: event.target.value })}
                        />
                      </label>
                      <div className="field-pair">
                        <label>
                          Start
                          <input
                            type="number"
                            step=".001"
                            value={word.start}
                            onChange={(event) =>
                              setWord({ ...word, start: Number(event.target.value) })
                            }
                          />
                        </label>
                        <label>
                          End
                          <input
                            type="number"
                            step=".001"
                            value={word.end}
                            onChange={(event) =>
                              setWord({ ...word, end: Number(event.target.value) })
                            }
                          />
                        </label>
                      </div>
                      <button type="button" onClick={() => correctWord()}>
                        Approve correction
                      </button>
                      <button type="button" onClick={() => correctWord(true)}>
                        Use as vocal reaction cue
                      </button>
                    </div>
                  ) : (
                    <p>
                      Select a word or phrase in the timeline to review its timing. Automatic words
                      and downbeats are candidates.
                    </p>
                  )}
                  {tier <= 7 && (
                    <button
                      type="button"
                      className="primary"
                      onClick={() => void saveCorrections()}
                    >
                      Save authored corrections
                    </button>
                  )}
                </>
              )}
              {tab === "export" && (
                <>
                  <h2>Render export</h2>
                  <p>Deterministic frames · local worker</p>
                  <label>
                    Range
                    <select
                      aria-label="Export range"
                      value={range}
                      onChange={(event) => setRange(event.target.value)}
                    >
                      {[
                        ["hero", "Hero only"],
                        ["full", "Full donation"],
                        ["selection", "Current selection"],
                        ["cue", "Cue neighborhood"],
                      ].map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="field-pair">
                    <label>
                      Resolution
                      <input value="1920 × 1080" readOnly />
                    </label>
                    <label>
                      FPS
                      <select value={fps} onChange={(event) => setFps(Number(event.target.value))}>
                        <option>60</option>
                        <option>30</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Format
                    <select value={format} onChange={(event) => setFormat(event.target.value)}>
                      <option value="mp4">MP4 · H.264</option>
                      <option value="webm">WebM · VP9 / alpha</option>
                    </select>
                  </label>
                  <label>
                    Background
                    <select
                      value={exportBackground}
                      onChange={(event) => setExportBackground(event.target.value)}
                    >
                      <option value="solid">Solid graphite</option>
                      <option value="stream">Stream preview</option>
                      <option value="transparent" disabled={format === "mp4"}>
                        Transparent · WebM
                      </option>
                    </select>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={exportAudio}
                      onChange={(event) => setExportAudio(event.target.checked)}
                    />
                    Original music + full alert test TTS
                  </label>
                  <dl>
                    <dt>Seed</dt>
                    <dd>{seed}</dd>
                    <dt>Quality</dt>
                    <dd>{quality}</dd>
                    <dt>Selection</dt>
                    <dd>
                      {timecode(selection[0])} → {timecode(selection[1])}
                    </dd>
                  </dl>
                  <button
                    type="button"
                    className="primary"
                    disabled={
                      ["starting", "rendering", "encoding"].includes(job.state) ||
                      cents === undefined
                    }
                    onClick={() => void requestExport()}
                  >
                    Render Export
                  </button>
                  <div className="export-progress">
                    <strong>{job.state}</strong>
                    {job.progress !== undefined && <progress max="1" value={job.progress} />}
                    <p className="error">{job.error}</p>
                    {job.state === "complete" && (
                      <a href={`/__studio/export/${job.id}/file`}>
                        Download {format.toUpperCase()}
                      </a>
                    )}
                  </div>
                  <small>CLI fallback: pnpm motion:export --tier {tier} --range hero</small>
                </>
              )}
            </div>
          </aside>
        }
        timeline={
          <Timeline
            treatment={treatment}
            mode={mode}
            plan={plan}
            speech={enabledSpeech}
            speechVolume={config.speech.volume}
            audibleTts={audibleTts}
            selectTts={(name) => {
              setSelectedTts(name);
              setWord(undefined);
              setTab("analysis");
            }}
            previewTts={(name) => void previewTts(name)}
            time={time}
            seek={seek}
            zoom={zoom}
            setZoom={setZoom}
            selection={selection}
            setSelection={setSelection}
            loop={loop}
            setLoop={setLoop}
            selectedCue={selectedCue}
            selectCue={(name) => {
              setSelectedTts(undefined);
              setSelectedCue(name);
              setWord(undefined);
              setTab("analysis");
            }}
            selectWord={chooseWord}
          />
        }
      />
      <footer className="studio-shortcuts">
        <span>Space play/pause · Home start · ← → 10 ms · Shift ← → 50 ms · ↑ ↓ cues</span>
        <span>Original audio clock · local authoring only</span>
      </footer>
    </div>
  );
}

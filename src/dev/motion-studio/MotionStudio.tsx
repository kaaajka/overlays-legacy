import musicIdentity from "./musicIdentity.json";
import { LocalCapabilities } from "./LocalCapabilities";
import { PreviewBoundary } from "./PreviewBoundary";
import { Timecode } from "./Timecode";
import { Shortcuts } from "./Shortcuts";
import { Help } from "./Help";
import { pl } from "./polish";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { treatments, liveMinimums } from "../../donations/choreography/treatments";
import { DonationScene } from "../../motion/engine/DonationScene";
import type { DonationSceneHandle, SceneStats } from "../../motion/engine/DonationScene";
import type { TimedRegion, MusicIntelligence } from "../../motion/types";
import { MusicPlayback } from "../../audio/motion/MusicPlayback";
import type { MusicLoadDiagnostic } from "../../audio/motion/MusicPlayback";
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
import { tipplyEmotes } from "../../donations/messageContent";
import { playOverlayAudioSequence } from "../../audio/playOverlayAudioSequence";
import { mediaAssets } from "../../motion/media/SourceMedia";
import { cashWaves } from "../../motion/cash/CashRenderer";
import { lifecyclePlan, parsePln, stressPresets, presetLabels, timecode } from "./studioModel";
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
import { authoringServices, type SpeechClip, type PreviewVoice } from "./authoringServices";
import { spokenAmount, speechSafeText } from "./spokenAmount";
import { AuthoringTransport } from "./AuthoringTransport";
import "./motion-studio.css";

const params = new URLSearchParams(window.location.search);
const initialTier = Math.floor(Math.min(8, Math.max(1, Number(params.get("tier")) || 1)));
const layers = [
  { name: "Source media", selector: ".source-media" },
  {
    name: "Scene forms",
    selector:
      ".heart-bridge, .turkey-floor, .turkey-step, .mask-floor, .paper-strip, .paper-perforation, .ovation-lip, .webcam-still, .d7-still",
  },
  {
    name: "Callouts",
    selector:
      ".scene-phrase, .heart-call, .webcam-shout, .webcam-wtf, .ovation-wing, .paper-caption, .rodent-omg, .d7-headline, .d7-wtf, .d7-impact, .d7-sticker, .d7-signal-word",
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
        <h1>{pl("Motion Studio requires a desktop-sized viewport.")}</h1>
        <p>
          {pl("Current viewport:")}{" "}
          <strong>
            {viewport.width} × {viewport.height}
          </strong>
        </p>
        <p>
          {pl("Recommended minimum:")}
          <strong>1280 × 720</strong>
        </p>
        <small>{pl("Use a desktop or laptop and enlarge the browser window.")}</small>
      </main>
    );
  return <MotionStudio />;
}
function MotionStudio() {
  const [shortcuts, setShortcuts] = useState(false);
  const closeShortcuts = useCallback(() => setShortcuts(false), []);
  const [tier, setTier] = useState(initialTier);
  const [seed, setSeed] = useState(params.get("seed") ?? "kaaajka-motion-01");
  const [quality, setQuality] = useState(params.get("quality") ?? "auto");
  const [background, setBackground] = useState(params.get("background") ?? "stream");
  const nicknameInput = useRef<HTMLInputElement>(null);
  const messageInput = useRef<HTMLTextAreaElement>(null);
  const [nickname, setNickname] = useState(params.get("nickname") ?? "Kaaajka");
  const [amount, setAmount] = useState(
    ((params.has("amount") ? Number(params.get("amount")) || 0 : 5732) / 100).toFixed(2),
  );
  const [message, setMessage] = useState(params.get("message") ?? "Dziękuję za stream!");
  const [commission, setCommission] = useState(params.get("commission") ?? "0");
  const [automatic, setAutomatic] = useState(false);
  const [mode, setMode] = useState(params.get("mode") ?? "full");
  const modeRef = useRef(params.get("mode") ?? "full");
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
  const phaseRef = useRef("hero");
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
  const [status, setStatus] = useState("Wczytywanie muzyki…");
  const [audioDiagnostic, setAudioDiagnostic] = useState<MusicLoadDiagnostic>();
  const [audioRevision, setAudioRevision] = useState(0);
  const retryPosition = useRef<number>();
  const audioFailed = Boolean(audioDiagnostic?.error);
  const [zoom, setZoom] = useState(1);
  const [output, setOutput] = useState({
    width: Number(params.get("width")) || 1920,
    height: Number(params.get("height")) || 1080,
  });
  const initialRangeApplied = useRef(false);
  const [selection, setSelection] = useState<[number, number] | null>(
    params.has("in") && params.has("out")
      ? [Number(params.get("in")), Number(params.get("out"))]
      : null,
  );
  const [loop, setLoop] = useState(false);
  const [tab, setTab] = useState("data");
  const [selectedCue, setSelectedCue] = useState("heroDrop");
  const [selectedLayer, setSelectedLayer] = useState("Source media");
  const [hidden, setHidden] = useState<string[]>([]);
  const wordOriginal = useRef<TimedRegion>();
  const [regionKind, setRegionKind] = useState("words");
  const [word, setWord] = useState<TimedRegion>();
  const [authored, setAuthored] = useState<MusicIntelligence["authored"]>();
  const [range, setRange] = useState(params.get("range") ?? "full"),
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
        { fallbackId: seed, emotes: tipplyEmotes },
      ),
    [seed, nickname, message, cents, commissionCents],
  );
  const [voices, setVoices] = useState<PreviewVoice[]>([]);
  const [voice, setVoice] = useState(params.get("voice") ?? "scene");
  const [speech, setSpeech] = useState<SpeechClip[]>([]);
  const [speechReadyKey, setSpeechReadyKey] = useState("");
  const [speechPreparing, setSpeechPreparing] = useState(false);
  const [serviceError, setServiceError] = useState("");
  const speechRequest = useMemo(
    () =>
      [
        { name: "nickname", text: speechSafeText(nickname) },
        {
          name: "amount",
          text: spokenAmount(
            Math.max(
              0,
              (cents ?? 5732) - (config.amountWithoutCommission ? (commissionCents ?? 0) : 0),
            ),
          ),
        },
        { name: "message", text: speechSafeText(donate.message) },
      ].filter(
        (clip) =>
          ({
            nickname: config.speech.readNickname,
            amount: config.speech.readAmount,
            message: config.speech.readMessage,
          })[clip.name],
      ),
    [nickname, cents, commissionCents, donate.message, config],
  );
  const speechKey = JSON.stringify([voice, speechRequest]);
  const speechLatest = useRef(speechKey);
  speechLatest.current = speechKey;
  const speechPrepared = useRef<{ key: string; clips: SpeechClip[] }>();
  const prepareCurrentSpeech = useCallback(async () => {
    if (speechPrepared.current?.key === speechKey) return speechPrepared.current.clips;
    setSpeechPreparing(true);
    try {
      const clips = await authoringServices.prepareSpeech(voice, speechRequest);
      if (speechLatest.current !== speechKey)
        throw Error("Dane czytania zmieniły się podczas przygotowania");
      speechPrepared.current = { key: speechKey, clips };
      setSpeech(clips);
      setSpeechReadyKey(speechKey);
      setServiceError("");
      return clips;
    } catch (error) {
      if (speechLatest.current === speechKey) setServiceError(String(error));
      throw error;
    } finally {
      if (speechLatest.current === speechKey) setSpeechPreparing(false);
    }
  }, [speechKey, voice, speechRequest]);
  useEffect(() => {
    void authoringServices
      .voices()
      .then(setVoices)
      .catch((error) => setServiceError(String(error)));
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void prepareCurrentSpeech().catch(() => {}), 650);
    return () => clearTimeout(timer);
  }, [prepareCurrentSpeech]);
  const enabledSpeech = speechReadyKey === speechKey ? speech : [];
  const plan = lifecyclePlan(treatment.analysis.duration, donate.message, enabledSpeech);
  const planRef = useRef(plan);
  planRef.current = plan;
  const [stats, setStats] = useState<SceneStats>({
    quality: "safe",
    frameMs: 16.67,
    features: featuresAt(treatment.analysis, 0),
  });
  const scene = useRef<DonationSceneHandle>();
  const music = useRef<MusicPlayback>();
  const transport = useRef<AuthoringTransport>();
  const raf = useRef(0),
    generation = useRef(0),
    abort = useRef<AbortController>();
  const loopRef = useRef({ loop, selection });
  loopRef.current = { loop, selection };
  const pause = useCallback(() => {
    generation.current++;
    if (transport.current?.isPlaying) {
      position.current = transport.current.time;
      setTime(position.current);
    }
    transport.current?.pause();
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
    scene.current?.pauseMedia();
    setPlaying(false);
  }, []);
  const seek = useCallback(
    (next: number) => {
      pause();
      const full = modeRef.current === "full",
        plan = planRef.current;
      const end = full ? plan.duration : treatment.analysis.duration;
      const at = Math.abs(next - end) < 0.0005 ? end : Math.min(end, Math.max(0, next));
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
    transport.current?.dispose();
    transport.current = undefined;
    setStatus("Wczytywanie muzyki…");
    setAudioDiagnostic(undefined);
    let playback: MusicPlayback;
    try {
      playback = new MusicPlayback(config.sound.volume);
      playback.visualSyncOffsetMs = readVisualSyncOffset(window.location.search);
      music.current = playback;
    } catch (error) {
      setStatus(`BŁĄD ZEGARA AUDIO · ${error}`);
      return;
    }
    const retrying = retryPosition.current !== undefined;
    const initial =
      retryPosition.current ??
      (params.get("time") === "hero"
        ? source.cues.find((cue) => cue.name === "heroDrop").at
        : Number(params.get("time")) || 0);
    retryPosition.current = undefined;
    seek(initial);
    if (!retrying) {
      if (initialRangeApplied.current || !params.has("in") || !params.has("out"))
        setSelection(null);
      initialRangeApplied.current = true;
      setLoop(false);
    }
    void playback
      .load(config.sound.url, cancellation.signal, {
        fetchUrl: [5, 7].includes(tier) ? `/__studio-assets/music/${tier}` : undefined,
        fresh: audioRevision > 0,
        onDiagnostic: (record, bytes) => {
          if (cancellation.signal.aborted) return;
          setAudioDiagnostic(record);
          if (record.error && bytes) {
            const values = new Uint8Array(bytes);
            let binary = "";
            for (const value of values) binary += String.fromCharCode(value);
            void fetch("/__studio/audio-failure", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ record, bytes: btoa(binary) }),
            }).catch(() => {});
          }
        },
      })
      .then(() => {
        if (!cancellation.signal.aborted) {
          transport.current = new AuthoringTransport(
            playback.context,
            playback.decodedBuffer,
            config.sound.volume,
            config.speech.volume,
          );
          setStatus("Gotowe");
          seek(initial);
        }
      })
      .catch((error) => {
        if (!cancellation.signal.aborted) {
          playback.setSilentFallback(source.analysis.duration);
          transport.current = new AuthoringTransport(
            playback.context,
            playback.decodedBuffer,
            config.sound.volume,
            config.speech.volume,
          );
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
  }, [config, source, seek, pause, audioRevision, tier]);
  useEffect(() => {
    if (music.current) music.current.visualSyncOffsetMs = offset;
    return () => calibration.current?.abort();
  }, [offset]);
  // Editing always cancels the old show before restoring the authored position.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Editing data or remounting quality must cancel playback and restore inspection.
  useEffect(() => {
    pause();
    seek(position.current);
  }, [donate, voice, quality, treatment, pause, seek]);
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
  const play = async (full = modeRef.current === "full") => {
    if (playing || cents === undefined || commissionCents === undefined) return;
    pause();
    const token = ++generation.current;
    try {
      const clips = full ? await prepareCurrentSpeech() : [];
      if (token !== generation.current) return;
      if (!transport.current) throw Error("Muzyka nie jest gotowa");
      await transport.current.prepare(clips);
      if (token !== generation.current) return;
      const livePlan = lifecyclePlan(treatment.analysis.duration, donate.message, clips);
      planRef.current = livePlan;
      const duration = full ? livePlan.duration : treatment.analysis.duration;
      const selected = loopRef.current.selection;
      let at = position.current >= duration ? 0 : position.current;
      if (loopRef.current.loop && selected && (at < selected[0] || at >= selected[1]))
        at = selected[0];
      await transport.current.play(
        at,
        livePlan,
        clips,
        full,
        loopRef.current.loop && selected ? selected[1] : undefined,
      );
      if (token !== generation.current) {
        transport.current.pause();
        return;
      }
      setPlaying(true);
      fullPlaying.current = full;
      setStatus("Gotowe");
      let previous = performance.now(),
        lastUI = 0;
      let scheduledLoop = JSON.stringify(loopRef.current);

      const render = (time: number, frameMs: number) => {
        position.current = time;
        const root = document.querySelector<HTMLElement>(".donation-motion");
        if (root) {
          root.style.transition = "none";
          root.style.opacity = "1";
        }
        if (!full || time < livePlan.informationStart) {
          phaseRef.current = "hero";
          const next = scene.current?.renderAt(Math.max(0, time + offset / 1000), frameMs, true);
          if (next && performance.now() - lastUI > 50) setStats(next);
        } else {
          scene.current?.informationAt(
            (time - livePlan.informationStart) * 1000,
            livePlan.informationDuration * 1000,
          );
          const stage = livePlan.stages.find(
            (s) => s.name !== "information" && time >= s.start && time < s.end,
          );
          phaseRef.current = time >= duration ? "complete" : (stage?.name ?? "information");
          const outro = livePlan.stages.find((s) => s.name === "outro");
          if (root && time >= outro.start)
            root.style.opacity = String(Math.max(0, 1 - (time - outro.start) / 0.65));
        }
        setAudibleTts(phaseRef.current.startsWith("tts-") ? phaseRef.current.slice(4) : undefined);
      };
      const frame = async (now: number) => {
        if (token !== generation.current) return;
        const at = transport.current.time,
          range = loopRef.current.selection;
        if (scheduledLoop !== JSON.stringify(loopRef.current)) {
          scheduledLoop = JSON.stringify(loopRef.current);
          await transport.current.play(
            at,
            livePlan,
            clips,
            full,
            loopRef.current.loop && range ? range[1] : undefined,
          );
          if (token !== generation.current) return;
        }
        render(at, now - previous);
        previous = now;
        if (now - lastUI > 50) {
          setTime(at);
          setPhase(phaseRef.current);
          lastUI = now;
        }
        if (loopRef.current.loop && range && at >= range[1] - 0.0005) {
          await transport.current.play(range[0], livePlan, clips, full, range[1]);
          if (token !== generation.current) return;
        } else if (at >= duration - 0.0005) {
          transport.current.pause();
          setPlaying(false);
          fullPlaying.current = false;
          setTime(duration);
          setPhase("complete");
          return;
        }
        raf.current = requestAnimationFrame(frame);
      };
      raf.current = requestAnimationFrame(frame);
    } catch (error) {
      if (token === generation.current) {
        setStatus("BŁĄD ODTWARZANIA · " + String(error));
        setPlaying(false);
      }
    }
  };
  const previewTts = async (name: string) => {
    pause();
    const controller = new AbortController();
    abort.current = controller;
    setSelectedTts(name);
    setTab("analysis");
    try {
      const clips = await prepareCurrentSpeech();
      const clip = clips.find((c) => c.name === name);
      if (!clip) return;
      await playOverlayAudioSequence(
        [
          {
            url: clip.url,
            volume: config.speech.volume,
            kind: "tts",
            onPlaying: () => {
              setAudibleTts(name);
              setSpeechState((current) => ({ ...current, [name]: "Normal · local fixture" }));
            },
            onFailure: () => {
              setStatus("BŁĄD CZYTANIA · " + clip.file);
              setSpeechState((current) => ({ ...current, [name]: "Błąd odtwarzania próbki" }));
            },
          },
        ],
        { loadTimeoutMs: 8000, signal: controller.signal },
      );
      setAudibleTts(undefined);
    } catch (error) {
      setStatus("BŁĄD CZYTANIA · " + String(error));
    }
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
      if ((event.code === "Slash" && event.shiftKey) || event.key === "?") {
        event.preventDefault();
        setShortcuts(true);
        return;
      }
      if (shortcuts) return;
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
      void authoringServices
        .exportStatus(job.id)
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
      await authoringServices.persist({
        tier,
        authored: authored ?? treatment.analysis.intelligence.authored,
      });
      setStatus("Zapisano zatwierdzone korekty");
    } catch (error) {
      setStatus(String(error));
    }
  };
  const requestExport = async () => {
    setJob({ state: "starting" });
    try {
      const currentSpeech = await prepareCurrentSpeech();
      const custom =
        exportBackground === "stream" && customFile.current
          ? await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = reject;
              reader.readAsDataURL(customFile.current);
            })
          : undefined;
      const result = await authoringServices.export({
        tier,
        seed,
        quality,
        nickname,
        amount: cents,
        commission: commissionCents,
        message,
        range,
        mode,
        selection,
        cue: selectedCue,
        fps,
        format,
        background: exportBackground,
        audio: exportAudio,
        streamFrame: custom,
        speech: currentSpeech,
        voice,
        ...output,
      });
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
        time: fullPlaying.current ? position.current : position.current,
        playing: transport.current?.isPlaying ?? false,
        speech: enabledSpeech,
        speechDirty: speechReadyKey !== speechKey,
        active: playing,
        phase,
        quality: stats.quality,
        spectacle: stats.spectacle,
        money: stats.money,
        moneyError: stats.moneyError,
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
        audioDiagnostic,
      }),
      prepareSpeech: prepareCurrentSpeech,
      moneyFrame: () => scene.current?.moneyFrame() ?? [],
      exportMetadata: () => ({
        semanticMessage: donate.message,
        currentSpeech: enabledSpeech,
        spokenText: speechRequest,
        voice,
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
  const statusText = audioFailed
    ? `BŁĄD MUZYKI · TRYB BEZGŁOŚNY · ${config.sound.url.split("/").at(-1)}`
    : status.startsWith("BŁĄD")
      ? status
      : ["starting", "rendering", "encoding"].includes(job.state)
        ? "Eksportowanie"
        : playing
          ? phase === "hero"
            ? "Odtwarzanie"
            : pl(phase)
          : phase === "complete"
            ? "Zakończono"
            : pl(status);
  const preview = (
    <div className={`studio-preview background-${background}`}>
      {background === "stream" && (
        <img
          className="studio-stream"
          src={streamFrame}
          alt={pl("Kaaajka Rocket League stream reference")}
          draggable={false}
        />
      )}
      <DonationScene
        key={`${tier}:${seed}:${pl(quality)}:${nickname}:${cents}:${commissionCents}`}
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
      {shortcuts && <Shortcuts close={closeShortcuts} />}
      <LocalCapabilities />
      <header className="studio-topbar">
        <div className="studio-brand">
          <img src="/assets/donations/brand/bunny-cyan.png" alt={pl("")} draggable={false} />
          <strong>{pl("Motion Studio")}</strong>
          <small>2.2</small>
        </div>
        <label className="scene-picker">
          {pl("Scene")}
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
                {pl("Donate")}
                {t.tier} · {pl(t.title)}
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
              {pl(label)}
            </button>
          ))}
        </div>
        <div className="studio-transport">
          <IconButton
            icon={SkipBack}
            label={pl("Previous cue")}
            shortcut="↑"
            onClick={() => nextCue(-1)}
          />
          <IconButton
            icon={playing ? Pause : Play}
            label={playing ? "Pause" : "Play"}
            shortcut="Space"
            onClick={() => (playing ? pause() : void play())}
          />
          <IconButton
            icon={RotateCcw}
            label={pl("Restart")}
            shortcut="Home"
            onClick={() => seek(0)}
          />
          <IconButton
            icon={SkipForward}
            label={pl("Next cue")}
            shortcut="↓"
            onClick={() => nextCue(1)}
          />
          <button
            type="button"
            title={pl("Seek −50 ms (Shift+←)")}
            onClick={() => seek(position.current - 0.05)}
          >
            {pl("−50 ms")}
          </button>
          <button
            type="button"
            title={pl("Seek +50 ms (Shift+→)")}
            onClick={() => seek(position.current + 0.05)}
          >
            {pl("+50 ms")}
          </button>
        </div>
        <output
          className={`studio-status ${audioFailed || status.includes("BŁĄD") ? "audio-warning" : ""}`}
          title={
            audioFailed
              ? "Muzyka nie została wczytana. Ponów wczytanie lub sprawdź szczegóły."
              : pl(status)
          }
        >
          {(audioFailed || status.includes("BŁĄD")) && <AlertTriangle size={14} />}
          <i className={playing ? "active" : ""} />
          {statusText}
        </output>
        <button type="button" onClick={() => setShortcuts(true)} aria-label="Skróty klawiszowe">
          ?
        </button>
        <div className="workspace-actions">
          <IconButton
            icon={PanelLeftClose}
            label={pl("Toggle Scene Tree")}
            shortcut="Ctrl+Shift+L"
            onClick={() => workspace.current?.toggleLeft()}
          />
          <IconButton
            icon={PanelRightClose}
            label={pl("Toggle Inspector")}
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
            label={pl("Reset Workspace")}
            onClick={() => {
              workspace.current?.reset();
              setSelection(null);
              setLoop(false);
            }}
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
            <h2>
              {pl("Donate")}
              {tier}
            </h2>
            <p>{pl(treatment.title)}</p>
            {[
              ...layers,
              ...(tier >= 5 && tier <= 7 ? [{ name: "Cash", selector: ".motion-cash" }] : []),
            ].map((layer) => (
              <div
                className={`layer-row ${selectedLayer === layer.name ? "selected" : ""}`}
                key={pl(layer.name)}
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
                  {pl(layer.name)}
                </button>
                <IconButton
                  icon={hidden.includes(layer.name) ? EyeOff : Eye}
                  label={`Pokaż ${pl(layer.name)}`}
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
                <span className="help-label">
                  {pl("Detail budget")}
                  <Help topic="quality" />
                </span>
                <select
                  id="studio-quality"
                  value={quality}
                  onChange={(event) => setQuality(event.target.value)}
                >
                  {["auto", "high", "medium", "safe"].map((value) => (
                    <option key={value} value={value}>
                      {pl(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="help-label">
                  {pl("Replay seed")}
                  <Help topic="seed" />
                </span>
                <input
                  id="studio-seed"
                  value={seed}
                  onChange={(event) => setSeed(event.target.value)}
                />
              </label>
              <small>{pl("Visibility overrides are local to Studio.")}</small>
            </div>
          </aside>
        }
        stage={
          <section className="studio-center">
            {(audioFailed || status.includes("BŁĄD") || status.includes("ZEGARA AUDIO")) && (
              <div className="stage-audio-error" role="alert">
                <AlertTriangle size={14} />
                {statusText}
              </div>
            )}
            {audioFailed && (
              <div className="audio-recovery">
                <Help topic="audio" />
                <button
                  type="button"
                  onClick={() => {
                    retryPosition.current = position.current;
                    setAudioRevision((value) => value + 1);
                  }}
                >
                  Ponów wczytanie muzyki
                </button>
                <details>
                  <summary>Pokaż szczegóły</summary>
                  <pre>{JSON.stringify(audioDiagnostic, null, 2)}</pre>
                </details>
              </div>
            )}
            <ProgramMonitor
              output={output}
              setOutput={(value) => {
                pause();
                setOutput(value);
              }}
              background={background}
              setBackground={setBackground}
              onCustom={customStream}
            >
              <PreviewBoundary key={tier}>{preview}</PreviewBoundary>
            </ProgramMonitor>
            <div className="playhead-readout">
              <Timecode time={time} seek={seek} pause={pause} />
              {time < treatment.analysis.duration ? (
                <>
                  <span>
                    UDERZENIE {beatIndex} · TAKT ≈ {barIndex}
                  </span>
                  <span>{pl(cue?.name ?? "intro")}</span>
                  <span>
                    MEDIA {timecode(stats.media?.[0]?.time ?? 0)}{" "}
                    {stats.media?.[0]?.frozen ? "ZATRZYMANIE" : "PĘTLA"}
                  </span>
                  {vocal && <span title={vocal.source}>WOKAL ≈ {vocal.text}</span>}
                </>
              ) : (
                <>
                  <span>
                    {pl("HERO ENDED")}
                    {timecode(treatment.analysis.duration)}
                  </span>
                  <span>
                    {pl("LIFECYCLE +")}
                    {timecode(time - treatment.analysis.duration)}
                  </span>
                  <span>{pl(phase).toUpperCase()}</span>
                </>
              )}
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
                  {pl(label)}
                </button>
              ))}
            </div>
            <div className="inspector-content">
              {tab === "data" && (
                <>
                  <h2>{pl("Donation data")}</h2>
                  <p>{pl("Test viewer content in this scene.")}</p>
                  <label>
                    {pl("Nickname")}
                    <input
                      aria-label={pl("Nickname")}
                      ref={nicknameInput}
                      maxLength={32}
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                    />
                  </label>
                  <div className="preset-row">
                    {Object.entries(stressPresets.nickname).map(([key, value]) => (
                      <button type="button" key={key} onClick={() => setNickname(value)}>
                        {presetLabels[key]}
                        {key === "extreme" ? " · 32 znaki" : ""}
                      </button>
                    ))}
                    <button type="button" onClick={() => nicknameInput.current?.focus()}>
                      Własna
                    </button>
                  </div>
                  <label>
                    {pl("Amount · PLN")}
                    <input
                      aria-label={pl("Amount PLN")}
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      aria-invalid={cents === undefined}
                    />
                  </label>
                  {cents === undefined && (
                    <small className="error">
                      {pl("Enter PLN with up to two decimal places.")}
                    </small>
                  )}
                  <div className="preset-row">
                    <button
                      type="button"
                      onClick={() =>
                        setAmount((liveMinimums[Math.min(6, tier - 1)] / 100).toFixed(2))
                      }
                    >
                      {pl("threshold")}
                    </button>
                    {Object.entries(stressPresets.amount).map(([key, value]) => (
                      <button type="button" key={key} onClick={() => setAmount(value)}>
                        {presetLabels[key]}
                      </button>
                    ))}
                  </div>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={automatic}
                      onChange={(event) => setAutomatic(event.target.checked)}
                    />
                    <span className="help-label">
                      {pl("Resolve tier from amount")}
                      <Help topic="tier" />
                    </span>
                  </label>
                  <label>
                    <span className="help-label">
                      {pl("Message")}
                      <Help topic="emotes" />
                    </span>
                    <textarea
                      aria-label={pl("Message")}
                      ref={messageInput}
                      maxLength={225}
                      rows={5}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                    />
                  </label>
                  <div className="preset-row">
                    {Object.entries(stressPresets.message).map(([key, value]) => (
                      <button type="button" key={key} onClick={() => setMessage(value)}>
                        {presetLabels[key]}
                        {key === "extreme" ? " · 225 znaków" : ""}
                      </button>
                    ))}
                    <button type="button" onClick={() => messageInput.current?.focus()}>
                      Własna
                    </button>
                  </div>
                  <small>
                    {message.length}
                    {pl(" / 225 znaków · pełna treść")}
                  </small>
                  <label>
                    <span className="help-label">
                      {pl("Commission · PLN")}
                      <Help topic="commission" />
                    </span>
                    <input
                      aria-label={pl("Commission PLN")}
                      value={commission}
                      onChange={(event) => setCommission(event.target.value)}
                      aria-invalid={commissionCents === undefined}
                    />
                  </label>
                  <div className="speech-note">
                    <label>
                      Głos czytania
                      <select
                        aria-label="Głos czytania"
                        value={voice}
                        onChange={(event) => setVoice(event.target.value)}
                      >
                        <option value="scene">Głos sceny</option>
                        {voices.map((v) => (
                          <option key={v.identity} value={v.identity}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p>
                      Głos produkcyjny: {config.speech.voiceType}. Lokalny głos podglądu:{" "}
                      {speech[0]?.voice ?? "nieprzygotowany"}.
                    </p>
                    <strong>
                      {speechPreparing
                        ? "Przygotowywanie czytania…"
                        : speechReadyKey === speechKey
                          ? "Aktualne czytanie gotowe"
                          : "Wymaga odświeżenia"}
                    </strong>
                    <button
                      type="button"
                      onClick={() => void prepareCurrentSpeech().catch(() => {})}
                    >
                      Przygotuj czytanie
                    </button>
                    {serviceError && (
                      <p role="alert">Usługi lokalne są niedostępne · {serviceError}</p>
                    )}
                    {enabledSpeech.map((clip) => (
                      <small key={clip.name}>
                        {pl(clip.name)}: {clip.text}
                      </small>
                    ))}
                  </div>
                </>
              )}
              {tab === "analysis" && selectedTts && (
                <section className="tts-inspector">
                  <h2>Czytanie · {pl(selectedTts)}</h2>
                  <dl>
                    <dt>{pl("Fixture")}</dt>
                    <dd>{speech.find((clip) => clip.name === selectedTts)?.file}</dd>
                    <dt>{pl("Duration")}</dt>
                    <dd>
                      {speech.find((clip) => clip.name === selectedTts)?.duration.toFixed(6)}
                      {pl("s")}
                    </dd>
                    <dt>{pl("Volume")}</dt>
                    <dd>{config.speech.volume}</dd>
                    <dt>{pl("Voice")}</dt>
                    <dd>{speech.find((clip) => clip.name === selectedTts)?.voice}</dd>
                    <dt>{pl("Sample")}</dt>
                    <dd>{speech.find((clip) => clip.name === selectedTts)?.text}</dd>
                    <dt>{pl("State")}</dt>
                    <dd>
                      {audibleTts === selectedTts
                        ? pl("Playing local fixture")
                        : pl(speechState[selectedTts] ?? "Normal · local fixture")}
                    </dd>
                  </dl>
                  <button type="button" onClick={() => void previewTts(selectedTts)}>
                    <Volume2 size={14} />
                    {pl("Preview this TTS")}
                  </button>
                </section>
              )}
              {tab === "analysis" && (
                <>
                  <h3>Tożsamość muzyki</h3>
                  {(() => {
                    const identity = musicIdentity.find((entry) => entry.tier === tier);
                    return (
                      identity && (
                        <dl>
                          <dt>Utwór</dt>
                          <dd>
                            {identity.artist ?? "Nieustalony wykonawca"} ·{" "}
                            {identity.title ?? "Nieustalony tytuł"}
                          </dd>
                          <dt>Wersja</dt>
                          <dd>{identity.version}</dd>
                          <dt>Pewność</dt>
                          <dd>
                            {Math.round(identity.confidence * 100)}% · {identity.evidence}
                          </dd>
                          <dt>Źródła</dt>
                          <dd>
                            {identity.sources.map((url, index) => (
                              <a key={url} href={url} target="_blank" rel="noreferrer">
                                Źródło {index + 1}{" "}
                              </a>
                            ))}
                          </dd>
                          <dt>Zweryfikowane frazy</dt>
                          <dd>
                            {identity.verified.length
                              ? identity.verified.length
                              : "Brak zatwierdzonego odsłuchu i timingów"}
                          </dd>
                        </dl>
                      )
                    );
                  })()}
                  <h2>{pl(word ? "Vocal timing" : selectedLayer)}</h2>
                  <dl>
                    <dt>
                      <span className="help-label">
                        {pl("Selected cue")}
                        <Help topic="cue" />
                      </span>
                    </dt>
                    <dd>
                      {pl(selectedCue)} · {timecode(selected?.at ?? 0)}
                    </dd>
                    <dt>{pl("Source")}</dt>
                    <dd>
                      {asset
                        ? `${asset.width} × ${asset.height} · ${asset.frameCount} klatek`
                        : "Scena proceduralna tylko w Studio"}
                    </dd>
                    <dt>
                      <span className="help-label">
                        {pl("Media position")}
                        <Help topic="media" />
                      </span>
                    </dt>
                    <dd>
                      {stats.media?.[0]
                        ? `${timecode(stats.media[0].time)} / klatka ${stats.media[0].frame} · ${pl(stats.media[0].state)}`
                        : "Brak"}
                    </dd>
                    <dt>{pl("Pose hold")}</dt>
                    <dd>
                      {asset
                        ? `${asset.heroSourceTime.toFixed(3)} s · kulminacja ${timecode(treatment.cues.find((c) => c.name === "heroDrop").at)}`
                        : "Brak"}
                    </dd>
                    <dt>{pl("Echo delay")}</dt>
                    <dd>
                      {stats.media
                        ?.slice(1)
                        .map((media) => `${timecode(media.time)} / klatka ${media.frame}`)
                        .join(" · ") || "Brak animowanych kopii"}
                    </dd>
                    <dt>
                      <span className="help-label">
                        {pl("Tempo estimate")}
                        <Help topic="bpm" />
                      </span>
                    </dt>
                    <dd>{treatment.analysis.bpm} BPM</dd>
                    <dt>{pl("Detail tier")}</dt>
                    <dd>
                      {pl(stats.quality)} ·{" "}
                      {tier === 7
                        ? (stats.money?.budget ?? "—")
                        : tier === 6
                          ? 12
                          : stats.quality === "safe"
                            ? 14
                            : stats.quality === "medium"
                              ? 40
                              : 72}{" "}
                      {pl("banknotów maksymalnie")}
                    </dd>
                    {tier === 7 && (
                      <>
                        <dt>Renderer pieniędzy</dt>
                        <dd data-testid="money-renderer" role="status">
                          PIXI · {stats.money?.state ?? (stats.moneyError ? "degraded" : "loading")}{" "}
                          · {stats.money?.backend ?? "oczekiwanie"}
                          {(stats.money?.reason || stats.moneyError) && (
                            <strong>
                              {" "}
                              · {stats.money?.reason || stats.moneyError} — obraz, dane i TTS
                              zachowane
                            </strong>
                          )}
                        </dd>
                        <dt>Choreografia / zegar</dt>
                        <dd>
                          GSAP / Web Audio · ticker Pixi:{" "}
                          {stats.money
                            ? stats.money.ticker
                              ? "aktywny"
                              : "wyłączony"
                            : "oczekiwanie"}
                        </dd>
                        <dt>Kamera / przejścia</dt>
                        <dd>Wspólny rig DOM + SVG + PIXI + Canvas · papierowa nić / składanie</dd>
                        <dt>Warstwy</dt>
                        <dd>
                          PIXI: pieniądze · Canvas: konfetti, wstążki, iskry · DOM/SVG: reakcje,
                          tekst, akcenty
                        </dd>
                        <dt>Używane narzędzia</dt>
                        <dd>
                          PixiPlugin, SplitText, MotionPath, DrawSVG, MorphSVG, CustomEase ·
                          Physics2D: nie
                        </dd>
                        <dt>Filtry pieniędzy</dt>
                        <dd>{stats.money?.filters.join(", ") || "Brak"}</dd>
                        <dt>Banknoty / warstwy</dt>
                        <dd>
                          {stats.money?.sprites ?? 0} · BACK {stats.money?.back ?? 0} / MID{" "}
                          {stats.money?.mid ?? 0} / FRONT {stats.money?.front ?? 0}
                        </dd>
                        <dt>Stan pieniędzy</dt>
                        <dd>{stats.money?.chapter ?? "clear"}</dd>
                        <dt>Render / zasoby</dt>
                        <dd>
                          {(stats.money?.renderMs ?? 0).toFixed(2)} ms CPU ·{" "}
                          {stats.money?.activeRenderers ?? 0} renderer · draw calls: niedostępne
                        </dd>
                      </>
                    )}
                    {tier >= 5 && tier <= 6 && (
                      <>
                        <dt>{pl("Cash cue")}</dt>
                        <dd>
                          {cashCue
                            ? `${timecode(cashCue.at)} · intensity ${cashCue.intensity.toFixed(2)}`
                            : "No active cash wave"}
                        </dd>
                      </>
                    )}
                  </dl>
                  <h3>
                    <span className="help-label">
                      {pl("Measured activity")}
                      <Help topic="vocal" />
                    </span>
                  </h3>
                  <label>
                    <span className="help-label">
                      {pl("Visual sync offset · ms")}
                      <Help topic="sync" />
                    </span>
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
                    {pl("Schedule click + flash")}
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
                    {pl("Approve downbeat at playhead")}
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
                      <h3>{pl(word.approved ? "Approved" : "Inference · needs review")}</h3>
                      <p>
                        {word.source}
                        {pl("· pewność")}
                        {word.confidence.toFixed(2)}
                      </p>
                      <label>
                        {pl("Word / phrase")}
                        <input
                          value={word.text ?? word.label ?? ""}
                          onChange={(event) => setWord({ ...word, text: event.target.value })}
                        />
                      </label>
                      <div className="field-pair">
                        <label>
                          {pl("Start")}
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
                          {pl("End")}
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
                        {pl("Approve correction")}
                      </button>
                      <button type="button" onClick={() => correctWord(true)}>
                        {pl("Use as vocal reaction cue")}
                      </button>
                    </div>
                  ) : (
                    <p>
                      {pl(
                        "Select a word or phrase in the timeline to review its timing. Automatic words and downbeats are candidates.",
                      )}
                    </p>
                  )}
                  {tier <= 7 && (
                    <button
                      type="button"
                      className="primary"
                      onClick={() => void saveCorrections()}
                    >
                      {pl("Save authored corrections")}
                    </button>
                  )}
                </>
              )}
              {tab === "export" && (
                <>
                  {audioFailed && (
                    <p role="alert" className="audio-export-warning">
                      Muzyka nie działa w podglądzie. FFmpeg dekoduje oryginał osobno — poprawny
                      eksport nie potwierdza muzycznej synchronizacji w przeglądarce.
                    </p>
                  )}
                  <h2>{pl("Render export")}</h2>
                  <p>
                    <span className="help-label">
                      {pl("Deterministic frames · local worker")}
                      <Help topic="export" />
                    </span>
                  </p>
                  <label>
                    {pl("Range")}
                    <select
                      aria-label={pl("Export range")}
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
                          {pl(label)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="field-pair">
                    <label>
                      {pl("Resolution")}
                      <input value={`${output.width} × ${output.height}`} readOnly />
                    </label>
                    <label>
                      {pl("FPS")}
                      <select value={fps} onChange={(event) => setFps(Number(event.target.value))}>
                        <option>60</option>
                        <option>30</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    <span className="help-label">
                      {pl("Format")}
                      <Help topic="alpha" />
                    </span>
                    <select value={format} onChange={(event) => setFormat(event.target.value)}>
                      <option value="mp4">{pl("MP4 · H.264")}</option>
                      <option value="webm">{pl("WebM · VP9 / alpha")}</option>
                    </select>
                  </label>
                  <label>
                    {pl("Background")}
                    <select
                      value={exportBackground}
                      onChange={(event) => setExportBackground(event.target.value)}
                    >
                      <option value="solid">{pl("Solid graphite")}</option>
                      <option value="stream">{pl("Stream preview")}</option>
                      <option value="transparent" disabled={format === "mp4"}>
                        {pl("Transparent · WebM")}
                      </option>
                    </select>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={exportAudio}
                      onChange={(event) => setExportAudio(event.target.checked)}
                    />
                    {pl("Original music + full alert test TTS")}
                  </label>
                  <dl>
                    <dt>{pl("Seed")}</dt>
                    <dd>{seed}</dd>
                    <dt>{pl("Quality")}</dt>
                    <dd>{pl(quality)}</dd>
                    <dt>{pl("Selection")}</dt>
                    <dd>
                      {selection
                        ? `${timecode(selection[0])} → ${timecode(selection[1])}`
                        : "Brak zakresu"}
                    </dd>
                  </dl>
                  <button
                    type="button"
                    className="primary"
                    disabled={
                      ["starting", "rendering", "encoding"].includes(job.state) ||
                      (range === "selection" && !selection) ||
                      cents === undefined
                    }
                    onClick={() => void requestExport()}
                  >
                    {pl("Render Export")}
                  </button>
                  <div className="export-progress">
                    <strong>{pl(job.state)}</strong>
                    {job.progress !== undefined && <progress max="1" value={job.progress} />}
                    {job.error && (
                      <details className="error">
                        <summary>Eksport nie powiódł się · szczegóły techniczne</summary>
                        {job.error}
                      </details>
                    )}
                    {job.state === "complete" && (
                      <a href={`/__studio/export/${job.id}/file`}>Pobierz {format.toUpperCase()}</a>
                    )}
                  </div>
                  <small>
                    Polecenie awaryjne: pnpm motion:export --tier {tier}
                    {pl("--range hero")}
                  </small>
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
      <footer className="studio-shortcut-footer">
        <span>{pl("Space play/pause · Home start · ← → 10 ms · Shift ← → 50 ms · ↑ ↓ cues")}</span>
        <span>{pl("Original audio clock · local authoring only")}</span>
      </footer>
    </div>
  );
}

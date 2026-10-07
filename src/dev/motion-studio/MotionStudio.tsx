import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { treatments, liveMinimums } from "../../donations/choreography/treatments";
import { DonationScene } from "../../motion/engine/DonationScene";
import type { DonationSceneHandle, SceneStats } from "../../motion/engine/DonationScene";
import { MusicPlayback } from "../../audio/motion/MusicPlayback";
import { featuresAt } from "../../audio/motion/AudioFeatureBus";
import { readVisualSyncOffset } from "../../audio/motion/AudioClock";
import { runSyncCalibration } from "../../audio/motion/syncCalibration";
import { resolveDonationTemplate } from "../../donations/resolveDonationTemplate";
import { createDonateEventModelFromArgs } from "../../donations/createDonateEventModelFromArgs";
import { getLegacyFixture } from "../replay/fixtureIndex";
import "./motion-studio.css";

const params = new URLSearchParams(window.location.search);
const initialTier = Math.floor(Math.min(8, Math.max(1, Number(params.get("tier")) || 6)));
export default function MotionStudio() {
  const [tier, setTier] = useState(initialTier);
  const treatment = treatments[tier - 1];
  const [fixture, setFixture] = useState("main-donate-prepare");
  const [seed, setSeed] = useState(params.get("seed") ?? "kaaajka-motion-01");
  const [quality, setQuality] = useState(params.get("quality") ?? "auto");
  const [offset, setOffset] = useState(readVisualSyncOffset(window.location.search));
  const offsetRef = useRef(offset);
  offsetRef.current = offset;
  const [time, setTime] = useState(0);
  const inspectionTime = useRef(time);
  inspectionTime.current = time;
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("Loading music…");
  const [background, setBackground] = useState(params.get("background") ?? "stream");
  const [stats, setStats] = useState<SceneStats>({
    quality: "safe",
    frameMs: 16.67,
    features: featuresAt(treatment.analysis, 0),
  });
  const scene = useRef<DonationSceneHandle>();
  const music = useRef<MusicPlayback>();
  const raf = useRef(0);
  const playSession = useRef(0);
  const playAbort = useRef<AbortController>();
  const calibration = useRef<AbortController>();
  const flash = useRef<HTMLDivElement>(null);
  const config = resolveDonationTemplate(liveMinimums[Math.min(6, tier - 1)]);
  const donate = useMemo(() => {
    const payload = getLegacyFixture(fixture) as { args: Record<string, unknown> };
    return createDonateEventModelFromArgs(
      {
        ...payload.args,
        id: seed,
        nickname: params.get("nickname") ?? payload.args.nickname,
        message: params.get("message") ?? payload.args.message,
        amount: params.has("amount")
          ? Number(params.get("amount"))
          : liveMinimums[Math.min(6, tier - 1)],
        commission: 0,
        test: true,
      },
      { fallbackId: seed },
    );
  }, [fixture, seed, tier]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Quality changes remount the keyed scene and must restore its inspection time.
  useEffect(() => {
    if (!donate) return;
    const current = scene.current?.renderAt(inspectionTime.current);
    if (current) setStats(current);
  }, [donate, quality]);

  const seek = useCallback(
    (next: number) => {
      playSession.current++;
      playAbort.current?.abort();
      cancelAnimationFrame(raf.current);
      music.current?.seek(next);
      setPlaying(false);
      const clamped = Math.min(treatment.analysis.duration, Math.max(0, next));
      setTime(clamped);
      setStats(scene.current.renderAt(clamped));
    },
    [treatment],
  );

  useEffect(() => {
    const abort = new AbortController();
    setPlaying(false);
    setStatus("Loading music…");
    let playback: MusicPlayback;
    try {
      playback = new MusicPlayback(config.sound.volume);
      music.current = playback;
      playback.visualSyncOffsetMs = offsetRef.current;
    } catch (error) {
      setStatus(`Audio unavailable: ${String(error)}`);
      return () => abort.abort();
    }
    const requested = params.get("time");
    const initialTime =
      requested === "hero"
        ? treatment.cues.find((c) => c.name === "heroDrop").at
        : Number(requested) || 0;
    seek(initialTime);
    void playback
      .load(config.sound.url, abort.signal)
      .then(() => {
        if (!abort.signal.aborted) {
          setStatus("Ready");
          seek(initialTime);
        }
      })
      .catch((error) => {
        if (!abort.signal.aborted) {
          playback.setSilentFallback(treatment.analysis.duration);
          setStatus(`Silent fallback: ${String(error)}`);
          seek(initialTime);
        }
      });
    return () => {
      playSession.current++;
      playAbort.current?.abort();
      abort.abort();
      cancelAnimationFrame(raf.current);
      playback.dispose();
      calibration.current?.abort();
    };
  }, [config, treatment, seek]);

  useEffect(() => {
    if (music.current) music.current.visualSyncOffsetMs = offset;
  }, [offset]);

  const play = async () => {
    if (!music.current?.duration || playing) return;
    calibration.current?.abort();
    const playback = music.current;
    const token = ++playSession.current;
    playAbort.current = new AbortController();
    setPlaying(true);
    let previous = performance.now();
    let lastUI = 0;
    const frame = (now: number) => {
      if (token !== playSession.current) return;
      const currentTime = playback.time;
      const currentStats = scene.current.renderAt(currentTime, now - previous);
      previous = now;
      if (now - lastUI > 80) {
        setTime(currentTime);
        setStats(currentStats);
        lastUI = now;
      }
      raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
    try {
      await playback.play(playAbort.current.signal);
    } catch (error) {
      setStatus(String(error));
    } finally {
      if (token === playSession.current) {
        cancelAnimationFrame(raf.current);
        setPlaying(false);
        const next = playback.time;
        setTime(next);
        setStats(scene.current.renderAt(next));
      }
    }
  };
  const pause = () => {
    playSession.current++;
    playAbort.current?.abort();
    music.current?.pause();
    cancelAnimationFrame(raf.current);
    setPlaying(false);
    setTime(music.current?.time ?? time);
  };
  const cue = treatment.cues.filter((c) => c.at <= time).at(-1);
  const nextCue = (direction: number) => {
    const target =
      direction > 0
        ? treatment.cues.find((c) => c.at > time + 0.001)
        : [...treatment.cues].reverse().find((c) => c.at < time - 0.001);
    if (target) seek(target.at);
  };
  const calibrate = async () => {
    pause();
    calibration.current?.abort();
    calibration.current = new AbortController();
    try {
      await runSyncCalibration(flash.current, offset, calibration.current.signal);
    } catch (error) {
      setStatus(String(error));
    }
  };
  useEffect(() => {
    // Development-only QA seam: production never imports this module.
    const debug = {
      seek,
      selectTier: setTier,
      play,
      pause,
      information: (ms = 6000) => scene.current.information(ms),
      status: () => ({
        time: music.current?.time ?? time,
        playing: music.current?.isPlaying ?? false,
        quality: stats.quality,
        duration: music.current?.duration,
        cue: cue?.name,
      }),
    };
    (window as typeof window & { motionStudio?: typeof debug }).motionStudio = debug;
    return () => {
      delete (window as typeof window & { motionStudio?: typeof debug }).motionStudio;
    };
  });

  const preview = (
    <div className={`studio-preview background-${background}`}>
      {background === "stream" && (
        <div className="studio-stream" aria-hidden="true">
          <div className="stream-horizon" />
          <span>ILLUSTRATIVE BROADCAST BACKGROUND</span>
        </div>
      )}
      <DonationScene
        key={`${tier}:${fixture}:${seed}:${quality}`}
        ref={scene}
        donate={donate}
        treatment={treatment}
        netAmount={donate.amount}
        seed={seed}
        quality={quality}
      />
      <div ref={flash} className="calibration-flash" aria-hidden="true" />
    </div>
  );
  if (params.get("clean") === "1") return <div className="studio-clean">{preview}</div>;
  return (
    <div className="motion-studio">
      <header>
        <h1>Kaaajka Motion Studio</h1>
        <span>Music is the clock.</span>
        <output>{status}</output>
      </header>
      <main>
        {preview}
        <aside>
          <label htmlFor="studio-tier">Donation scene</label>
          <select id="studio-tier" value={tier} onChange={(e) => setTier(Number(e.target.value))}>
            {treatments.map((t) => (
              <option key={t.tier} value={t.tier}>
                Donate{t.tier} · {t.title}
              </option>
            ))}
          </select>
          <label htmlFor="studio-fixture">Fixture content</label>
          <select id="studio-fixture" value={fixture} onChange={(e) => setFixture(e.target.value)}>
            {[
              "main-donate-prepare",
              "main-donate-html-message",
              "main-donate-without-audio-url",
            ].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <label htmlFor="studio-seed">Replay seed</label>
          <input
            id="studio-seed"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            onBlur={() => seek(time)}
          />
          <label htmlFor="studio-quality">Detail budget</label>
          <select id="studio-quality" value={quality} onChange={(e) => setQuality(e.target.value)}>
            {["auto", "high", "medium", "safe"].map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
          <label htmlFor="studio-background">Preview background</label>
          <select
            id="studio-background"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          >
            {["stream", "checker", "transparent"].map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <label htmlFor="studio-offset">Visual sync offset (ms)</label>
          <input
            id="studio-offset"
            type="number"
            min="-500"
            max="500"
            value={offset}
            onChange={(e) => setOffset(Math.min(500, Math.max(-500, Number(e.target.value))))}
          />
          <button type="button" onClick={calibrate}>
            Schedule click + flash
          </button>
          <dl>
            <dt>Renderer</dt>
            <dd>{stats.quality.toUpperCase()}</dd>
            <dt>Frame</dt>
            <dd>
              {playing
                ? `${stats.frameMs.toFixed(1)} ms / ${(1000 / Math.max(1, stats.frameMs)).toFixed(0)} FPS`
                : "Paused"}
            </dd>
            <dt>Tempo estimate</dt>
            <dd>{treatment.analysis.bpm} BPM</dd>
            <dt>Current cue</dt>
            <dd>{cue?.name ?? "intro"}</dd>
          </dl>
          <div className="studio-features">
            {Object.entries(stats.features).map(([name, value]) => (
              <div key={name}>
                <span>{name}</span>
                <meter min="0" max="1" value={value} />
              </div>
            ))}
          </div>
        </aside>
      </main>
      <footer>
        <div className="studio-transport">
          <button type="button" onClick={playing ? pause : play}>
            {playing ? "Pause" : "Play"}
          </button>
          <button type="button" onClick={() => seek(0)}>
            Restart
          </button>
          <button type="button" onClick={() => nextCue(-1)}>
            Previous cue
          </button>
          <button type="button" onClick={() => nextCue(1)}>
            Next cue
          </button>
          <button type="button" onClick={() => seek(time - 0.05)}>
            −50 ms
          </button>
          <button type="button" onClick={() => seek(time + 0.05)}>
            +50 ms
          </button>
          <label htmlFor="studio-time">Music time</label>
          <input
            id="studio-time"
            type="number"
            min="0"
            max={treatment.analysis.duration}
            step="0.001"
            value={Number(time.toFixed(3))}
            onChange={(e) => seek(Number(e.target.value))}
          />
          <span>/ {treatment.analysis.duration.toFixed(3)}s</span>
        </div>
        <label htmlFor="studio-scrub" className="studio-scrub-label">
          Seek through the music
        </label>
        <input
          id="studio-scrub"
          type="range"
          min="0"
          max={treatment.analysis.duration}
          step="0.001"
          value={time}
          onChange={(e) => seek(Number(e.target.value))}
        />
        <svg
          className="studio-waveform"
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
          role="img"
          aria-label="Energy envelope, beats and authored cues"
        >
          <title>Music energy envelope and cue timeline</title>
          <path
            d={`M0 65 ${treatment.analysis.loudness.map((energy, index) => `L${(index / treatment.analysis.loudness.length) * 1200} ${65 - energy * 40}`).join(" ")} L1200 65Z`}
            fill="currentColor"
            opacity=".25"
          />
          {treatment.analysis.beats.map((beat) => (
            <line
              key={beat}
              x1={(beat / treatment.analysis.duration) * 1200}
              x2={(beat / treatment.analysis.duration) * 1200}
              y1="48"
              y2="68"
              stroke="#8294a8"
              opacity=".55"
            />
          ))}
          {treatment.analysis.downbeats.map((beat) => (
            <line
              key={beat}
              x1={(beat / treatment.analysis.duration) * 1200}
              x2={(beat / treatment.analysis.duration) * 1200}
              y1="22"
              y2="68"
              stroke="#fff"
            />
          ))}
          {treatment.cues.map((c) => (
            <g key={c.name}>
              <line
                x1={(c.at / treatment.analysis.duration) * 1200}
                x2={(c.at / treatment.analysis.duration) * 1200}
                y1="18"
                y2="70"
                stroke={c.name === "heroDrop" ? "#ffd77b" : "#73e4dc"}
              />
              {(c.name === "heroDrop" || c.name === cue?.name) && (
                <text
                  x={Math.min(1196, (c.at / treatment.analysis.duration) * 1200 + 3)}
                  textAnchor={c.name === "information" ? "end" : "start"}
                  y={c.name === "heroDrop" ? 12 : 32}
                  fontSize="10"
                  fill="#e5edf6"
                >
                  {c.name}
                </text>
              )}
            </g>
          ))}
          <line
            x1={(time / treatment.analysis.duration) * 1200}
            x2={(time / treatment.analysis.duration) * 1200}
            y1="0"
            y2="80"
            stroke="#fff"
          />
        </svg>
        <div className="studio-cues">
          {treatment.cues.map((c) => (
            <button
              type="button"
              key={c.name}
              className={c.name === "heroDrop" ? "hero-cue" : ""}
              onClick={() => seek(c.at)}
            >
              {c.name} <span>{c.at.toFixed(3)}s</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}

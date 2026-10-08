import { MessageEmote, syncMessageEmotes } from "./MessageEmote";
/* THESIS: seven source-led meme shows share a music clock, not a composition.
OWN-WORLD: unchanged Kaaajka GIFs, source poses, independent layouts and restrained supporting effects.
STORY: each selected subject conducts its own donor payoff, then a complete readable message and existing TTS.
FIRST VIEWPORT: room dance, alpha echoes, rodent film strip, paper roll, ovation, hand-heart or pixel monitor wall.
FORM: explicit GIF-led brief overrides the direction roll, seed d2f60c0f.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md */
import { forwardRef, useImperativeHandle, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { DonateEventModel } from "../../models/DonateEvent";
import type { EffectParameters, MotionTreatment, QualityTier } from "../types";
import { directors, liveMinimums } from "../../donations/choreography/treatments";
import { featuresAt } from "../../audio/motion/AudioFeatureBus";
import { OverlayRenderer } from "../gpu/OverlayRenderer";
import { QualityGovernor, selectQuality } from "../quality";
import { motionIntensity } from "../random";
import type { DirectedScene } from "../gsap/createChoreography";
import "./donation-motion.css";
import "../../donations/scenes/gif-scenes.css";
import {
  Donate1Scene,
  Donate2Scene,
  Donate3Scene,
  Donate4Scene,
  Donate5Scene,
  Donate6Scene,
  Donate7Scene,
} from "../../donations/scenes";
import { MediaLayer } from "../media/MediaLayer";
import type { MediaStats } from "../media/MediaLayer";
import { mediaAssets, mediaUrls } from "../media/SourceMedia";
import { CashRenderer } from "../cash/CashRenderer";

gsap.registerPlugin(useGSAP);
export type SceneStats = {
  quality: QualityTier;
  frameMs: number;
  features: ReturnType<typeof featuresAt>;
  media?: MediaStats[];
};
export type DonationSceneHandle = {
  renderAt: (time: number, frameMs?: number, forward?: boolean) => SceneStats;
  information: (readingMs: number) => void;
  outro: () => void;
  media: () => MediaStats[];
  pauseMedia: () => void;
  informationAt: (elapsedMs: number, readingMs: number) => void;
  setLayerVisibility: (selector: string, visible: boolean) => void;
};
type Props = {
  donate: DonateEventModel;
  treatment: MotionTreatment;
  netAmount: number;
  seed?: string;
  quality?: string;
};

export const DonationScene = forwardRef<DonationSceneHandle, Props>(function DonationScene(
  { donate, treatment, netAmount, seed, quality },
  ref,
) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cashCanvas = useRef<HTMLCanvasElement>(null);
  const cash = useRef<CashRenderer>();
  const cashFrontCanvas = useRef<HTMLCanvasElement>(null);
  const cashFront = useRef<CashRenderer>();
  const message = useRef<HTMLDivElement>(null);
  const director = useRef<DirectedScene>();
  const gpu = useRef<OverlayRenderer>();
  const media = useRef<MediaLayer[]>([]);
  const governor = useRef(new QualityGovernor("safe"));
  const effects = useRef<EffectParameters>({
    atmosphere: 0,
    burst: 0,
    tension: 0,
    ring: 0,
    travel: 0,
  });
  const scrollRaf = useRef(0);
  const lastTime = useRef(0);
  const amount = new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(netAmount / 100);
  const LiveScene = [
    Donate1Scene,
    Donate2Scene,
    Donate3Scene,
    Donate4Scene,
    Donate5Scene,
    Donate6Scene,
    Donate7Scene,
  ][treatment.tier - 1];
  const intensity = motionIntensity(
    donate.amount,
    liveMinimums[treatment.tier - 1] ?? 30000,
    liveMinimums[treatment.tier],
  );

  useGSAP(
    () => {
      const fallback = () => {
        governor.current.tier = "safe";
        if (root.current) root.current.dataset.quality = "safe";
      };
      try {
        director.current = directors[treatment.tier - 1]({
          root: root.current,
          treatment,
          effects: effects.current,
        });
      } catch (error) {
        console.warn("Donation choreography degraded to readable scene", error);
        root.current.dataset.degraded = "true";
        const information = root.current.querySelector<HTMLElement>(".motion-information");
        information.style.opacity = "1";
        information.style.visibility = "visible";
      }
      media.current = [...root.current.querySelectorAll<HTMLElement>(".source-media")].map(
        (element) => {
          const tier = Number(element.dataset.mediaTier);
          return new MediaLayer(
            element.querySelector("video"),
            element.querySelector("img"),
            mediaAssets[tier - 1],
            treatment.cues,
            mediaUrls(tier),
            Number(element.dataset.mediaDelay) || 0,
          );
        },
      );
      if (treatment.tier >= 5 && treatment.tier <= 7) {
        try {
          const initial = selectQuality(true, navigator.hardwareConcurrency ?? 4, quality);
          cash.current = new CashRenderer(
            cashCanvas.current,
            treatment,
            seed ?? donate.id,
            initial,
          );
          cashFront.current = new CashRenderer(
            cashFrontCanvas.current,
            treatment,
            seed ?? donate.id,
            initial,
            "front",
          );
          governor.current = new QualityGovernor(initial);
          root.current.dataset.quality = initial;
        } catch (error) {
          console.warn("Cash detail unavailable; source identity retained", error);
          fallback();
        }
      } else if (quality !== "safe" && treatment.tier === 8) {
        try {
          const initial = selectQuality(true, navigator.hardwareConcurrency ?? 4, quality);
          gpu.current = new OverlayRenderer(
            canvas.current,
            treatment.motif,
            [treatment.color, treatment.secondary],
            seed ?? donate.id,
            initial,
            fallback,
            treatment.tier === 8 ? 400 : treatment.tier === 6 ? 70 : 110,
          );
          governor.current = new QualityGovernor(initial);
          root.current.dataset.quality = initial;
        } catch (error) {
          console.warn("Donation GPU fallback", error);
          fallback();
        }
      } else fallback();
      const resize = () => {
        const rect = root.current.getBoundingClientRect();
        const scale = rect.height / 1080;
        const width = rect.width / scale;
        stage.current.style.width = `${width}px`;
        stage.current.style.setProperty("--stage-extra", `${width - 1920}px`);
        stage.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
        cash.current?.resize(width);
        cashFront.current?.resize(width);
        gpu.current?.resize();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(root.current);
      resize();
      director.current?.timeline.seek(Math.max(0.000001, lastTime.current), true);
      for (const layer of media.current) layer.sync(lastTime.current);
      gpu.current?.render(
        lastTime.current,
        effects.current,
        featuresAt(treatment.analysis, lastTime.current),
        intensity,
      );
      cash.current?.render(lastTime.current, intensity);
      cashFront.current?.render(lastTime.current, intensity);
      return () => {
        observer.disconnect();
        cancelAnimationFrame(scrollRaf.current);
        director.current?.dispose();
        director.current = undefined;
        gpu.current?.dispose();
        gpu.current = undefined;
        cash.current?.dispose();
        cash.current = undefined;
        cashFront.current?.dispose();
        cashFront.current = undefined;
        for (const layer of media.current) layer.dispose();
        media.current = [];
      };
    },
    {
      scope: root,
      dependencies: [donate.id, donate.nickname, netAmount, treatment, seed, quality],
      revertOnUpdate: true,
    },
  );

  useImperativeHandle(
    ref,
    () => ({
      renderAt(time, frameMs = 16.67, forward = false) {
        lastTime.current = time;
        cancelAnimationFrame(scrollRaf.current);
        if (root.current) {
          root.current.dataset.phase = "hero";
          root.current.dataset.timeZero = String(time === 0);
          root.current.style.opacity = "1";
        }
        const features = featuresAt(treatment.analysis, time);
        try {
          director.current?.timeline.seek(
            Math.min(treatment.analysis.duration, Math.max(0.000001, time)),
            true,
          );
          for (const layer of media.current) layer.sync(time, forward);
          if (governor.current.record(frameMs)) {
            gpu.current?.setQuality(governor.current.tier);
            cash.current?.setQuality(governor.current.tier);
            cashFront.current?.setQuality(governor.current.tier);
            root.current.dataset.quality = governor.current.tier;
          }
          gpu.current?.render(time, effects.current, features, intensity);
          const donor = root.current.querySelector<HTMLElement>(".scene-copy");
          if (donor && cash.current) {
            const bounds = donor.getBoundingClientRect(),
              viewport = root.current.getBoundingClientRect();
            const scale = viewport.height / 1080;
            const area = {
              x: (bounds.x + bounds.width / 2 - viewport.x) / scale,
              y: (bounds.y + bounds.height / 2 - viewport.y) / scale,
              width: bounds.width / scale,
              height: bounds.height / scale,
            };
            cash.current.setDonor(area);
            cashFront.current?.setDonor(area);
          }
          cash.current?.render(time, intensity);
          cashFront.current?.render(time, intensity);
        } catch (error) {
          console.warn("Donation renderer failed; preserving audio and completion", error);
          gpu.current?.dispose();
          gpu.current = undefined;
          cash.current?.dispose();
          cash.current = undefined;
          cashFront.current?.dispose();
          cashFront.current = undefined;
          governor.current.tier = "safe";
          root.current.dataset.quality = "safe";
        }
        return {
          quality: governor.current.tier,
          frameMs,
          features,
          media: media.current.map((layer) => layer.stats),
        };
      },
      information(readingMs) {
        for (const layer of media.current) layer.release();
        root.current.dataset.phase = "information";
        root.current.dataset.timeZero = "false";
        root.current.style.opacity = "1";
        try {
          director.current?.timeline.seek(treatment.analysis.duration, true);
          gpu.current?.clear();
          cash.current?.clear();
          cashFront.current?.clear();
        } catch (error) {
          console.warn("Information state recovered after scene error", error);
        }
        const information = root.current.querySelector<HTMLElement>(".motion-information");
        information.style.opacity = "1";
        information.style.visibility = "visible";
        cancelAnimationFrame(scrollRaf.current);
        const viewport = message.current;
        viewport.scrollTop = 0;
        const overflow = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        syncMessageEmotes(root.current, 0);
        if (overflow === 0 && !donate.messageRuns?.some((run) => "src" in run)) return;
        const start = performance.now();
        const scroll = () => {
          const elapsed = performance.now() - start;
          syncMessageEmotes(root.current, elapsed / 1000);
          viewport.scrollTop =
            overflow * Math.min(1, Math.max(0, (elapsed - 2500) / Math.max(1, readingMs - 5000)));
          if (elapsed < readingMs) scrollRaf.current = requestAnimationFrame(scroll);
        };
        scrollRaf.current = requestAnimationFrame(scroll);
      },
      outro() {
        root.current.style.opacity = "0";
      },
      pauseMedia: () => {
        for (const layer of media.current) layer.sync(lastTime.current);
      },
      media: () => media.current.map((layer) => layer.stats),
      informationAt(elapsedMs, readingMs) {
        this.information(readingMs);
        syncMessageEmotes(root.current, elapsedMs / 1000);
        cancelAnimationFrame(scrollRaf.current);
        const viewport = message.current;
        const overflow = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        viewport.scrollTop =
          overflow * Math.min(1, Math.max(0, (elapsedMs - 2500) / Math.max(1, readingMs - 5000)));
      },
      setLayerVisibility(selector, visible) {
        for (const element of root.current.querySelectorAll<HTMLElement>(selector))
          element.dataset.studioHidden = String(!visible);
      },
    }),
    [treatment, intensity, donate.messageRuns],
  );

  return (
    <div
      ref={root}
      className={`donation-motion motif-${treatment.motif}`}
      data-phase="loading"
      data-time-zero="true"
      data-donation-id={donate.id}
      data-quality="safe"
      style={
        {
          "--motion-color": treatment.color,
          "--motion-secondary": treatment.secondary,
        } as CSSProperties
      }
    >
      <div ref={stage} className="motion-stage">
        <div className="motion-atmosphere" aria-hidden="true" />
        {treatment.tier === 8 && (
          <canvas ref={canvas} className="motion-gpu" aria-hidden="true" tabIndex={-1} />
        )}
        {treatment.tier >= 5 && treatment.tier <= 7 && (
          <canvas ref={cashCanvas} className="motion-cash" aria-hidden="true" tabIndex={-1} />
        )}
        {LiveScene ? (
          <LiveScene donate={donate} amount={amount} />
        ) : (
          <>
            <div className="motion-frame" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            {treatment.words.map((word, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: The two authored stage words are fixed decorative slots.
                key={`${word}-${index}`}
                className={`motion-word word-${index}`}
                aria-hidden="true"
              >
                {word}
              </div>
            ))}
            <div className="motion-emblem" aria-hidden="true">
              <svg className="motion-aperture" viewBox="0 0 800 800" fill="none">
                <title>Donation aperture</title>
                <circle
                  className="aperture-circle"
                  cx="400"
                  cy="400"
                  r="306"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle
                  className="aperture-segments"
                  cx="400"
                  cy="400"
                  r="326"
                  stroke="currentColor"
                  strokeWidth="18"
                  strokeDasharray="92 78"
                />
                <path
                  className="aperture-diamond"
                  d="M400 50 750 400 400 750 50 400Z"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="aperture-brackets"
                  d="M190 110H110V190M610 110H690V190M690 610V690H610M110 610V690H190"
                  stroke="currentColor"
                  strokeWidth="9"
                />
                <path
                  className="aperture-rift"
                  d="M-350 285H80L130 245H670L720 285H1150M-350 515H80L130 555H670L720 515H1150"
                  stroke="currentColor"
                  strokeWidth="6"
                />
              </svg>
            </div>
            <div className="motion-wave" aria-hidden="true" />
            <div className="motion-hero">
              <div
                className="motion-name"
                style={{
                  fontSize:
                    donate.nickname.length > 30 ? 48 : donate.nickname.length > 18 ? 64 : 84,
                }}
              >
                {donate.nickname || "Anonim"}
              </div>
              <div
                className="motion-amount"
                style={{ fontSize: amount.length > 12 ? 140 : amount.length > 9 ? 190 : 256 }}
              >
                <span className="motion-amount-number">{amount}</span>
                <span className="motion-currency">zł</span>
              </div>
            </div>
          </>
        )}
        {treatment.tier >= 5 && treatment.tier <= 7 && (
          <canvas
            ref={cashFrontCanvas}
            className="motion-cash motion-cash-front"
            aria-hidden="true"
            tabIndex={-1}
          />
        )}
        <div className="motion-information">
          <div className="information-header">
            <strong>{donate.nickname || "Anonim"}</strong>
            <span>{amount} zł</span>
          </div>
          {donate.nickname.toLowerCase() === "zawistnymoddamian" && (
            <p className="information-thanks">Dzięki za wyrównanie licznika, potężny techniku.</p>
          )}
          <div ref={message} className="information-message">
            {donate.messageRuns?.length
              ? donate.messageRuns.map((run, index) =>
                  "text" in run ? (
                    run.text
                  ) : (
                    // biome-ignore lint/suspicious/noArrayIndexKey: Runs are immutable per message; position distinguishes repeated emotes.
                    <MessageEmote key={`${index}:${run.alt}`} src={run.src} alt={run.alt} />
                  ),
                )
              : donate.message || "Dzięki za wsparcie!"}
          </div>
        </div>
      </div>
    </div>
  );
});

/* THESIS: typography occupies a 1920×1080 broadcast stage; the amount releases an authored musical impact.
OWN-WORLD: aqua, copper, prism, lime, coral, gold; Poppins; fractured vector apertures and analytic light.
STORY: donor tease, compression, impact, settle, full readable message and existing TTS.
FIRST VIEWPORT: transparent stage, name above the central amount, giant words on opposing edges, foreground bills.
FORM: live broadcast motion graphics, grounded candidate 4, seed 1760fcca; the explicit brief delegates art direction.
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

gsap.registerPlugin(useGSAP);
export type SceneStats = {
  quality: QualityTier;
  frameMs: number;
  features: ReturnType<typeof featuresAt>;
};
export type DonationSceneHandle = {
  renderAt: (time: number, frameMs?: number) => SceneStats;
  information: (readingMs: number) => void;
  outro: () => void;
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
  const message = useRef<HTMLDivElement>(null);
  const director = useRef<DirectedScene>();
  const gpu = useRef<OverlayRenderer>();
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
      if (quality !== "safe") {
        try {
          const initial = selectQuality(true, navigator.hardwareConcurrency ?? 4, quality);
          gpu.current = new OverlayRenderer(
            canvas.current,
            treatment.motif,
            [treatment.color, treatment.secondary],
            seed ?? donate.id,
            initial,
            fallback,
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
        const scale = Math.min(rect.width / 1920, rect.height / 1080);
        stage.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
        gpu.current?.resize();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(root.current);
      resize();
      director.current?.timeline.seek(lastTime.current, true);
      gpu.current?.render(
        lastTime.current,
        effects.current,
        featuresAt(treatment.analysis, lastTime.current),
        intensity,
      );
      return () => {
        observer.disconnect();
        cancelAnimationFrame(scrollRaf.current);
        director.current?.dispose();
        director.current = undefined;
        gpu.current?.dispose();
        gpu.current = undefined;
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
      renderAt(time, frameMs = 16.67) {
        lastTime.current = time;
        cancelAnimationFrame(scrollRaf.current);
        if (root.current) {
          root.current.dataset.phase = "hero";
          root.current.style.opacity = "1";
        }
        const features = featuresAt(treatment.analysis, time);
        try {
          director.current?.timeline.seek(
            Math.min(treatment.analysis.duration, Math.max(0, time)),
            true,
          );
          if (governor.current.record(frameMs)) {
            gpu.current?.setQuality(governor.current.tier);
            root.current.dataset.quality = governor.current.tier;
          }
          gpu.current?.render(time, effects.current, features, intensity);
        } catch (error) {
          console.warn("Donation renderer failed; preserving audio and completion", error);
          gpu.current?.dispose();
          gpu.current = undefined;
          governor.current.tier = "safe";
          root.current.dataset.quality = "safe";
        }
        return { quality: governor.current.tier, frameMs, features };
      },
      information(readingMs) {
        root.current.dataset.phase = "information";
        root.current.style.opacity = "1";
        try {
          director.current?.timeline.seek(treatment.analysis.duration, true);
          gpu.current?.clear();
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
        if (overflow === 0) return;
        const start = performance.now();
        const scroll = () => {
          const elapsed = performance.now() - start;
          viewport.scrollTop =
            overflow * Math.min(1, Math.max(0, (elapsed - 2500) / Math.max(1, readingMs - 5000)));
          if (elapsed < readingMs) scrollRaf.current = requestAnimationFrame(scroll);
        };
        scrollRaf.current = requestAnimationFrame(scroll);
      },
      outro() {
        root.current.style.opacity = "0";
      },
    }),
    [treatment, intensity],
  );

  return (
    <div
      ref={root}
      className={`donation-motion motif-${treatment.motif}`}
      data-phase="loading"
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
        <canvas ref={canvas} className="motion-gpu" aria-hidden="true" tabIndex={-1} />
        <div className="motion-frame" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        {treatment.words.map((word, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: The two authored stage words are fixed decorative slots.
          <div key={`${word}-${index}`} className={`motion-word word-${index}`} aria-hidden="true">
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
              fontSize: donate.nickname.length > 30 ? 48 : donate.nickname.length > 18 ? 64 : 84,
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
        <div className="motion-information">
          <div className="information-header">
            <strong>{donate.nickname || "Anonim"}</strong>
            <span>{amount} zł</span>
          </div>
          {donate.nickname.toLowerCase() === "zawistnymoddamian" && (
            <p className="information-thanks">Dzięki za wyrównanie licznika, potężny techniku.</p>
          )}
          <div ref={message} className="information-message">
            {donate.message || "Dzięki za wsparcie!"}
          </div>
        </div>
      </div>
    </div>
  );
});

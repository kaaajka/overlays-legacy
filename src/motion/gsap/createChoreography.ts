import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import type { EffectParameters, Motif, MotionTreatment } from "../types";

gsap.registerPlugin(SplitText);
export type DirectorContext = {
  root: HTMLElement;
  treatment: MotionTreatment;
  effects: EffectParameters;
};
export type DirectedScene = { timeline: gsap.core.Timeline; dispose: () => void };

/** Every tween is on one paused timeline. No callbacks, live tweens or accumulated events. */
export function createChoreography(
  { root, treatment, effects }: DirectorContext,
  motif: Motif,
): DirectedScene {
  const q = gsap.utils.selector(root);
  const cue = (name: string) => treatment.cues.find((c) => c.name === name)?.at ?? 0;
  const hero = cue("heroDrop");
  const pre = cue("preDrop");
  const settle = cue("settle");
  const duration = treatment.analysis.duration;
  const splitName = SplitText.create(q(".motion-name"), { type: "chars", aria: "auto" });
  const splitAmount = SplitText.create(q(".motion-amount-number"), { type: "chars", aria: "auto" });
  const t = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  for (const c of treatment.cues) t.addLabel(c.name, c.at);
  t.set(q(".motion-hero"), { autoAlpha: 1, x: 0, y: 0, rotation: 0, scale: 1 }, 0);
  t.set(q(".motion-name"), { autoAlpha: 1 }, 0);
  t.set(splitName.chars, { opacity: 0, yPercent: 120, rotationX: -70 }, 0);
  t.set(q(".motion-amount"), { autoAlpha: 0, scale: 0.7, y: 40, rotation: 0 }, 0);
  t.set(splitAmount.chars, { yPercent: 0, opacity: 1 }, 0);
  t.set(q(".motion-word"), { autoAlpha: 0, x: 0, y: 0, rotation: 0, scale: 1 }, 0);
  t.set(q(".motion-emblem"), { autoAlpha: 0, scale: 0.3, rotation: -35, rotationX: 0 }, 0);
  t.set(q(".motion-aperture"), { scale: 1, rotation: 0 }, 0);
  t.set(q(".motion-wave"), { autoAlpha: 0, scale: 0.2 }, 0);
  t.set(q(".motion-frame"), { autoAlpha: 0, scaleX: 0.2 }, 0);
  t.set(q(".motion-information"), { autoAlpha: 0 }, 0);
  t.set(q(".motion-atmosphere"), { autoAlpha: 0 }, 0);
  t.set(effects, { atmosphere: 0, burst: 0, tension: 0, ring: 0, travel: 0 }, 0);
  t.to(q(".motion-frame"), { autoAlpha: 0.65, scaleX: 1, duration: 0.65 }, cue("firstImpact"));
  t.to(q(".motion-atmosphere"), { autoAlpha: 0.65, duration: 0.8 }, cue("firstImpact"));
  t.to(
    effects,
    { atmosphere: treatment.tier < 3 ? 0.12 : 0.24, duration: 0.65 },
    cue("firstImpact"),
  );
  t.to(
    splitName.chars,
    { opacity: 1, yPercent: 0, rotationX: 0, stagger: { amount: 0.3 }, duration: 0.55 },
    cue("donorReveal"),
  );
  t.to(
    q(".motion-emblem"),
    { autoAlpha: 0.8, scale: 1, rotation: 0, duration: 1.1 },
    cue("buildStart"),
  );
  t.to(
    effects,
    {
      tension: 1,
      travel: 0.5,
      duration: Math.max(0.1, pre - cue("buildStart")),
      ease: "power2.in",
    },
    cue("buildStart"),
  );
  t.to(
    q(".motion-emblem"),
    { scale: 0.68, autoAlpha: 0.18, duration: hero - pre, ease: "power3.in" },
    pre,
  );
  t.to(
    q(".motion-frame"),
    { scaleX: 0.82, autoAlpha: 0.18, duration: hero - pre, ease: "power3.in" },
    pre,
  );
  t.to(effects, { atmosphere: 0.035, duration: hero - pre }, pre);
  // At the exact cue the impact is already visible, including after a direct seek.
  t.set(q(".motion-amount"), { autoAlpha: 1, scale: treatment.tier < 3 ? 1.12 : 1.25, y: 0 }, hero);
  t.to(q(".motion-amount"), { scale: 1, duration: 0.65, ease: "expo.out" }, hero);
  t.fromTo(
    splitAmount.chars,
    { yPercent: 24 },
    { yPercent: 0, stagger: { amount: 0.09 }, duration: 0.4, immediateRender: false },
    hero,
  );
  t.set(q(".motion-wave"), { autoAlpha: treatment.tier < 3 ? 0.18 : 0.6, scale: 0.45 }, hero);
  t.to(q(".motion-wave"), { scale: 4.5, autoAlpha: 0, duration: 1.35, ease: "power2.out" }, hero);
  t.set(
    effects,
    {
      burst: [0.18, 0.3, 0.45, 0.5, 0.75, 1, 1, 0.8][treatment.tier - 1],
      ring: 0.12,
      atmosphere: treatment.tier < 3 ? 0.12 : 0.3,
      tension: 0,
    },
    hero,
  );
  t.to(effects, { burst: 0, ring: 1.6, travel: 1, duration: 1.6, ease: "power2.out" }, hero);
  t.to(
    q(".motion-emblem"),
    {
      autoAlpha: 0.65,
      scale: 1.15,
      rotation: motif === "halo" ? 65 : 12,
      duration: 0.85,
      ease: "expo.out",
    },
    hero,
  );
  t.to(q(".motion-frame"), { autoAlpha: 0.8, scaleX: 1, duration: 0.7 }, hero);

  if (motif === "signal") {
    t.to(q(".motion-word"), { autoAlpha: 0.65, duration: 0.45 }, hero);
    t.to(q(".motion-aperture"), { scaleX: 1.2, scaleY: 0.64, duration: 0.65 }, hero);
  } else if (motif === "ember") {
    t.fromTo(
      q(".motion-word"),
      { x: -340, rotation: -12 },
      {
        autoAlpha: 0.45,
        x: 0,
        rotation: -6,
        duration: 0.75,
        stagger: 0.12,
        immediateRender: false,
      },
      hero,
    );
    t.fromTo(
      q(".motion-hero"),
      { rotation: -5 },
      { rotation: 0, duration: 0.7, immediateRender: false },
      hero,
    );
  } else if (motif === "prism") {
    t.to(q(".motion-aperture"), { rotation: 0, scale: 1.35, duration: 0.8 }, hero);
    t.to(q(".motion-word"), { autoAlpha: 0.42, scale: 1.12, duration: 0.5 }, hero);
  } else if (motif === "vault") {
    t.fromTo(
      q(".motion-word"),
      { x: -550 },
      { autoAlpha: 0.55, x: 0, duration: 0.9, stagger: 0.16, immediateRender: false },
      hero,
    );
    t.to(q(".motion-aperture"), { scaleX: 1.7, scaleY: 0.85, duration: 0.8 }, hero);
  } else {
    // Giant opposing words are stage architecture, leaving the donor's centre clear.
    const words = q(".motion-word");
    t.fromTo(
      words[0],
      { x: -700, rotation: -8 },
      { x: 0, rotation: -4, autoAlpha: 0.6, duration: 1.1, immediateRender: false },
      cue("buildStart"),
    );
    if (words[1])
      t.fromTo(
        words[1],
        { x: 700, rotation: 8 },
        { x: 0, rotation: 4, autoAlpha: 0.6, duration: 1.1, immediateRender: false },
        cue("buildStart") + 0.15,
      );
    t.to(words, { scale: 0.9, autoAlpha: 0.15, duration: hero - pre }, pre);
    t.to(words, { scale: 1.08, autoAlpha: 0.75, duration: 0.65, ease: "expo.out" }, hero);
    t.fromTo(
      q(".motion-hero"),
      { y: 24, rotation: 1.4 },
      { y: 0, rotation: 0, duration: 0.6, immediateRender: false },
      hero,
    );
    if (motif === "halo") {
      t.to(
        q(".motion-emblem"),
        { rotationX: 45, duration: pre - cue("buildStart") },
        cue("buildStart"),
      );
      t.to(q(".motion-aperture"), { scale: 1.32, rotation: 90, duration: 1.2 }, hero);
    }
    if (motif === "takeover" || motif === "name") {
      if (motif === "takeover")
        t.to(
          q(".motion-aperture"),
          { scaleX: 2.25, scaleY: 0.6, duration: 0.65, ease: "expo.out" },
          hero,
        );
      for (const at of [22.64, 37.5]) {
        t.to(q(".motion-word"), { x: 120, autoAlpha: 0.4, duration: 0.45 }, at - 0.45);
        t.to(q(".motion-word"), { x: 0, autoAlpha: 0.8, duration: 0.65 }, at);
        t.set(effects, { burst: 0.65, ring: 0.1 }, at);
        t.to(effects, { burst: 0, ring: 1.5, duration: 1.3 }, at);
        t.to(q(".motion-aperture"), { rotation: at > 30 ? 170 : 95, duration: 1.5 }, at);
      }
    }
    if (motif === "name") t.to(q(".motion-name"), { scale: 1.25, duration: 0.8 }, hero);
  }
  t.to(q(".motion-word"), { autoAlpha: treatment.tier < 3 ? 0.32 : 0.45, duration: 1.2 }, settle);
  t.to(effects, { atmosphere: 0.13, duration: 1.2 }, settle);
  t.to(
    q(".motion-emblem"),
    { rotation: "+=18", duration: Math.max(1, duration - settle - 0.8), ease: "none" },
    settle,
  );
  t.to(
    q(".motion-hero, .motion-word, .motion-emblem, .motion-frame, .motion-atmosphere"),
    { autoAlpha: 0, duration: 0.55 },
    duration - 0.55,
  );
  t.to(effects, { atmosphere: 0, burst: 0, duration: 0.55 }, duration - 0.55);
  t.set(q(".motion-information"), { autoAlpha: 1 }, duration);
  t.seek(0, true);
  return {
    timeline: t,
    dispose: () => {
      t.kill();
      splitName.revert();
      splitAmount.revert();
    },
  };
}

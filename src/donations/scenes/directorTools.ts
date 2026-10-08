import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import type { DirectorContext, DirectedScene } from "../../motion/gsap/createChoreography";
import { rhythmMarks, vocalRegions } from "../../audio/motion/musicIntelligence";
gsap.registerPlugin(SplitText);

/** Lifecycle/type primitives only. Each director owns its shots, geometry and timing. */
export function sceneTools(
  { root, treatment, effects }: DirectorContext,
  options: { ownRhythm?: boolean } = {},
) {
  const q = gsap.utils.selector(root);
  const at = (name: string) => treatment.cues.find((cue) => cue.name === name).at;
  const name = SplitText.create(q(".motion-name"), {
    type: "chars",
    aria: "auto",
  });
  const amount = SplitText.create(q(".motion-amount-number"), {
    type: "chars",
    aria: "auto",
  });
  const t = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
  for (const cue of treatment.cues) t.addLabel(cue.name, cue.at);
  t.set(q(".scene-content"), { autoAlpha: 1 }, 0);
  t.set(q(".source-media, .scene-phrase, .motion-name, .motion-amount"), { autoAlpha: 0 }, 0);
  t.set(q(".motion-information"), { autoAlpha: 0 }, 0);
  t.set(effects, { atmosphere: 0, burst: 0, tension: 0, ring: 0, travel: 0 }, 0);
  const finish = (): DirectedScene => {
    const duration = treatment.analysis.duration;
    // Recurring phrases are small and source-specific; each wrapper preserves its director's larger move.
    const profiles = [
      { y: -5, rotation: 1.2, scaleX: 1.01 },
      { y: -9, rotation: -0.8, scaleX: 1 },
      { y: 0, rotation: 0, scaleX: 1.045 },
      { y: -2, rotation: 0.3, scaleX: 1 },
      { y: -4, rotation: 0, scaleX: 1.015 },
      { y: -3, rotation: -0.4, scaleX: 1.005 },
      { y: 0, rotation: 0.8, scaleX: 1.012 },
    ];
    const profile = profiles[treatment.tier - 1];
    const hero = at("heroDrop");
    (options.ownRhythm ? [] : rhythmMarks(treatment.analysis)).forEach((beat, index) => {
      if (beat.at < at("firstImpact") || beat.at > duration - 0.8 || Math.abs(beat.at - hero) < 0.4)
        return;
      // Deadpan and intimate scenes use alternating beats, not every transient.
      if ((treatment.tier === 4 || treatment.tier === 6) && index % 2) return;
      t.to(
        q(".source-rhythm"),
        {
          ...profile,
          duration: 0.09,
          ease: treatment.tier === 3 ? "steps(1)" : "power2.out",
        },
        beat.at,
      );
      t.to(q(".source-rhythm"), { y: 0, rotation: 0, scaleX: 1, duration: 0.19 }, beat.at + 0.09);
    });
    const phrases = vocalRegions(treatment.analysis).filter(
      (phrase) => phrase.approved && phrase.confidence >= 0.6,
    );
    for (const phrase of phrases) {
      if (phrase.start < at("donorReveal") || phrase.start > duration - 0.6) continue;
      t.to(
        q(".scene-phrase, .heart-call, .webcam-wtf"),
        { scale: 1.055, duration: 0.12 },
        phrase.start,
      );
      t.to(
        q(".scene-phrase, .heart-call, .webcam-wtf"),
        { scale: 1, duration: 0.24 },
        phrase.start + 0.12,
      );
    }
    for (const cue of options.ownRhythm
      ? []
      : (treatment.analysis.intelligence?.authored.cues ?? [])) {
      if (cue.group !== "media") continue;
      t.to(q(".source-rhythm"), { scaleY: 1 + cue.intensity * 0.08, duration: 0.08 }, cue.at);
      t.to(q(".source-rhythm"), { scaleY: 1, duration: 0.2 }, cue.at + 0.08);
    }
    t.to(q(".scene-content"), { autoAlpha: 0, duration: 0.5 }, duration - 0.5);
    t.to(effects, { atmosphere: 0, burst: 0, ring: 0, duration: 0.5 }, duration - 0.5);
    t.to(q(".motion-information"), { autoAlpha: 1, duration: 0.4 }, duration - 0.4);
    // GSAP's zero-duration sets need a positive render position on both first and reverse seeks.
    // One microsecond changes no authored frame; media and the music clock remain at exact zero.
    t.seek(0.000001, true);
    return {
      timeline: t,
      dispose() {
        t.kill();
        name.revert();
        amount.revert();
      },
    };
  };
  return { q, at, t, name: name.chars, amount: amount.chars, effects, finish };
}

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import type { DirectorContext, DirectedScene } from "../../motion/gsap/createChoreography";
gsap.registerPlugin(SplitText);

/** Lifecycle/type primitives only. Each director owns its shots, geometry and timing. */
export function sceneTools({ root, treatment, effects }: DirectorContext) {
  const q = gsap.utils.selector(root);
  const at = (name: string) => treatment.cues.find((cue) => cue.name === name).at;
  const name = SplitText.create(q(".motion-name"), { type: "chars", aria: "auto" });
  const amount = SplitText.create(q(".motion-amount-number"), { type: "chars", aria: "auto" });
  const t = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
  for (const cue of treatment.cues) t.addLabel(cue.name, cue.at);
  t.set(q(".scene-content"), { autoAlpha: 1 }, 0);
  t.set(q(".source-media, .scene-phrase, .motion-name, .motion-amount"), { autoAlpha: 0 }, 0);
  t.set(q(".motion-information"), { autoAlpha: 0 }, 0);
  t.set(effects, { atmosphere: 0, burst: 0, tension: 0, ring: 0, travel: 0 }, 0);
  const finish = (): DirectedScene => {
    const duration = treatment.analysis.duration;
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

import type { DirectorContext } from "../../../motion/gsap/createChoreography";
import { sceneTools } from "../../scenes/directorTools";

export function choreography(context: DirectorContext) {
  const { q, at, t, name, effects, finish } = sceneTools(context);
  t.set(q(".webcam-main"), { autoAlpha: 0.25 }, 0);
  t.set(q(".webcam-still, .webcam-shout, .webcam-wtf"), { autoAlpha: 0 }, 0);
  t.fromTo(
    q(".webcam-main"),
    { scale: 0.333 },
    { autoAlpha: 1, scale: 0.55, duration: 0.25, ease: "steps(2)" },
    at("firstImpact"),
  );
  t.set(q(".motion-name"), { autoAlpha: 1 }, at("donorReveal"));
  t.fromTo(
    name,
    { x: -120, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.12, stagger: 0.03, ease: "steps(2)" },
    at("donorReveal"),
  );
  const beats = context.treatment.analysis.beats.filter(
    (beat) => beat >= at("buildStart") && beat < at("heroDrop"),
  );
  q(".webcam-still").forEach((node, index) => {
    t.set(node, { autoAlpha: 1 }, beats[index] ?? at("buildStart") + index * 0.4);
  });
  t.set(q(".satellite-a"), { autoAlpha: 1 }, at("buildStart") + 0.4);
  t.set(q(".satellite-b"), { autoAlpha: 1 }, at("buildStart") + 0.8);
  t.set(q(".webcam-shout"), { autoAlpha: 1 }, at("preDrop"));
  t.set(q(".webcam-main"), { scale: 1 }, at("heroDrop"));
  t.set(q(".motion-amount"), { autoAlpha: 1, rotation: 0 }, at("heroDrop"));
  t.set(q(".webcam-wtf"), { autoAlpha: 1 }, at("heroDrop"));
  for (const hit of [at("heroDrop"), 22.64, 37.5]) {
    t.set(effects, { atmosphere: 0.045, burst: 0.4 }, hit);
    t.to(effects, { burst: 0, duration: 1 }, hit);
    t.fromTo(q(".webcam-wall"), { x: 45 }, { x: 0, duration: 0.2, ease: "steps(3)" }, hit);
  }
  return finish();
}

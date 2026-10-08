import type { DirectorContext } from "../../../motion/gsap/createChoreography";
import { sceneTools } from "../../scenes/directorTools";

export function choreography(context: DirectorContext) {
  const { q, at, t, name, finish } = sceneTools(context);
  t.set(q(".mask-lead"), { autoAlpha: 0 }, 0);
  t.to(q(".mask-lead"), { autoAlpha: 1, duration: 0.1 }, 0.05);
  t.fromTo(
    q(".mask-lead"),
    { x: -350, rotation: -12 },
    { autoAlpha: 1, x: 0, rotation: 0, duration: 0.65 },
    at("firstImpact"),
  );
  t.set(q(".motion-name"), { autoAlpha: 1 }, at("donorReveal"));
  t.fromTo(
    name,
    { y: -60, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      stagger: Math.min(0.025, 0.6 / Math.max(1, name.length - 1)),
      duration: 0.4,
    },
    at("donorReveal"),
  );
  t.fromTo(q(".echo-left"), { x: 180 }, { autoAlpha: 0.45, x: 0, duration: 0.4 }, at("buildStart"));
  t.fromTo(
    q(".echo-right"),
    { x: -180 },
    { autoAlpha: 0.6, x: 0, duration: 0.4 },
    at("buildStart") + 0.2,
  );
  t.to(q(".mask-floor"), { scaleX: 0.25, duration: at("heroDrop") - at("preDrop") }, at("preDrop"));
  t.set(q(".motion-amount"), { autoAlpha: 1, y: 0, scaleY: 0.78 }, at("heroDrop"));
  t.to(q(".motion-amount"), { scaleY: 1, duration: 0.48, ease: "back.out(1.8)" }, at("heroDrop"));
  t.to(q(".mask-floor"), { scaleX: 1, duration: 0.25 }, at("heroDrop"));
  t.fromTo(q(".mask-call"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, at("settle"));
  return finish();
}

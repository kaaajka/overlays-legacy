import type { DirectorContext } from "../../../motion/gsap/createChoreography";
import { sceneTools } from "../../scenes/directorTools";

export function choreography(context: DirectorContext) {
  const { q, at, t, name, finish } = sceneTools(context);
  t.set(q(".rodent-lead"), { autoAlpha: 0.25 }, 0);
  t.set(q(".rodent-lead"), { autoAlpha: 1 }, at("firstImpact"));
  t.set(q(".motion-name"), { autoAlpha: 1 }, at("donorReveal"));
  t.fromTo(
    name,
    { opacity: 0 },
    {
      opacity: 1,
      stagger: Math.min(0.04, 0.6 / Math.max(1, name.length - 1)),
      duration: 0.04,
      ease: "steps(1)",
    },
    at("donorReveal"),
  );
  t.set(q(".rodent-left"), { autoAlpha: 1, rotation: -9 }, at("buildStart"));
  t.set(q(".rodent-right"), { autoAlpha: 1, rotation: 8 }, at("buildStart") + 0.22);
  t.to(q(".shutter"), { scaleY: 1, duration: 0.16, ease: "steps(3)" }, at("preDrop"));
  t.set(q(".shutter"), { scaleY: 0 }, at("heroDrop"));
  t.set(q(".rodent-omg"), { autoAlpha: 1, rotation: -8 }, at("heroDrop"));
  t.set(q(".motion-amount"), { autoAlpha: 1, x: 0 }, at("heroDrop"));
  t.to(
    q(".rodent-projector"),
    { x: 16, duration: 0.08, repeat: 3, yoyo: true, ease: "steps(1)" },
    at("heroDrop"),
  );
  t.to(q(".rodent-omg"), { scale: 0.85, duration: 0.12, ease: "steps(2)" }, at("settle"));
  return finish();
}

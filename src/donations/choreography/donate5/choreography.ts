import type { DirectorContext } from "../../../motion/gsap/createChoreography";
import { sceneTools } from "../../scenes/directorTools";

export function choreography(context: DirectorContext) {
  const { q, at, t, finish } = sceneTools(context);
  t.set(q(".source-media"), { autoAlpha: 0 }, 0);
  t.to(q(".source-media"), { autoAlpha: 1, duration: 0.1 }, 0.05);
  t.set(q(".source-media"), { autoAlpha: 1 }, at("firstImpact"));
  t.fromTo(
    q(".ovation-panorama"),
    { scaleX: 0.48, clipPath: "inset(0 20% 0 20%)" },
    { scaleX: 0.84, clipPath: "inset(0 0% 0 0%)", duration: 1.1 },
    at("firstImpact"),
  );
  t.fromTo(
    q(".motion-name"),
    { x: -100 },
    { autoAlpha: 1, x: 0, duration: 0.35 },
    at("donorReveal"),
  );
  t.fromTo(
    q(".wing-holy"),
    { y: 350, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.65 },
    at("buildStart"),
  );
  t.fromTo(
    q(".wing-moly"),
    { y: -350, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.65 },
    at("buildStart") + 0.2,
  );
  t.to(
    q(".ovation-panorama"),
    { scaleX: 0.72, duration: at("heroDrop") - at("preDrop") },
    at("preDrop"),
  );
  t.set(q(".motion-amount"), { autoAlpha: 1, y: 0 }, at("heroDrop"));
  t.to(q(".ovation-panorama"), { scaleX: 1, duration: 0.45, ease: "expo.out" }, at("heroDrop"));
  t.set(q(".ovation-call"), { autoAlpha: 1 }, at("settle"));
  t.set(q(".ovation-community-reply"), { autoAlpha: 0 }, 0);
  t.fromTo(
    q(".ovation-community-reply"),
    { y: 18, rotation: -12 },
    { autoAlpha: 1, y: 0, rotation: 4, duration: 0.3 },
    at("heroDrop") + 0.1,
  );
  return finish();
}

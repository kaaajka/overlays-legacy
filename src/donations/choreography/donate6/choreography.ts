import type { DirectorContext } from "../../../motion/gsap/createChoreography";
import { sceneTools } from "../../scenes/directorTools";

export function choreography(context: DirectorContext) {
  const { q, at, t, name, finish } = sceneTools(context);
  t.set(q(".heart-community-sticker"), { autoAlpha: 0 }, 0);
  t.fromTo(
    q(".heart-community-sticker"),
    { scale: 0.5, rotation: -18 },
    { autoAlpha: 1, scale: 1, rotation: -8, duration: 0.35 },
    at("heroDrop") + 0.3,
  );
  t.set(q(".source-media"), { autoAlpha: 0 }, 0);
  t.to(q(".source-media"), { autoAlpha: 1, duration: 0.1 }, 0.05);
  t.fromTo(
    q(".source-media"),
    { x: 160 },
    { autoAlpha: 1, x: 0, duration: 0.8 },
    at("firstImpact"),
  );
  t.set(q(".motion-name"), { autoAlpha: 1 }, at("donorReveal"));
  t.fromTo(
    name,
    { opacity: 0 },
    { opacity: 1, stagger: Math.min(0.04, 0.6 / Math.max(1, name.length - 1)), duration: 0.4 },
    at("donorReveal"),
  );
  t.fromTo(
    q(".heart-call"),
    { opacity: 0, y: -30 },
    { opacity: 1, y: 0, duration: 0.4 },
    at("buildStart"),
  );
  t.set(q(".heart-line"), { strokeDasharray: 1, strokeDashoffset: 1 }, 0);
  t.to(
    q(".heart-line"),
    { strokeDashoffset: 0.65, duration: at("heroDrop") - at("buildStart") },
    at("buildStart"),
  );
  t.set(q(".motion-amount"), { autoAlpha: 1 }, at("heroDrop"));
  t.to(
    q(".heart-line"),
    { strokeDashoffset: 0, duration: 0.7, ease: "power1.out" },
    at("heroDrop"),
  );
  t.set(q(".heart-thanks"), { autoAlpha: 1 }, at("settle"));
  return finish();
}

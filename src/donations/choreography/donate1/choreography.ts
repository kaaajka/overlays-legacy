import type { DirectorContext } from "../../../motion/gsap/createChoreography";
import { sceneTools } from "../../scenes/directorTools";

export function choreography(context: DirectorContext) {
  const { q, at, t, name, finish } = sceneTools(context);
  t.set(q(".turkey-room .source-media"), { autoAlpha: 0.25 }, 0);
  t.fromTo(
    q(".turkey-room .source-media"),
    { y: -70 },
    { autoAlpha: 1, y: 0, duration: 0.55 },
    at("firstImpact"),
  );
  t.set(q(".motion-name"), { autoAlpha: 1 }, at("donorReveal"));
  t.fromTo(
    name,
    { x: 90, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      stagger: Math.min(0.018, 0.6 / Math.max(1, name.length - 1)),
      duration: 0.35,
    },
    at("donorReveal"),
  );
  t.to(q(".scene-phrase"), { autoAlpha: 1, duration: 0.2 }, at("buildStart"));
  t.fromTo(q(".turkey-step"), { scaleX: 0 }, { scaleX: 1, duration: 0.7 }, at("buildStart"));
  t.to(
    q(".turkey-floor"),
    { scaleX: 0.65, duration: at("heroDrop") - at("preDrop") },
    at("preDrop"),
  );
  t.set(q(".motion-amount"), { autoAlpha: 1, rotation: -7, y: 0 }, at("heroDrop"));
  t.to(q(".motion-amount"), { rotation: 4, duration: 0.22 }, at("heroDrop"));
  t.to(q(".motion-amount"), { rotation: 0, duration: 0.35 }, at("heroDrop") + 0.22);
  t.to(q(".turkey-floor"), { scaleX: 1, duration: 0.25 }, at("heroDrop"));
  t.to(q(".turkey-room"), { x: 25, duration: 0.2, yoyo: true, repeat: 1 }, at("heroDrop"));
  return finish();
}

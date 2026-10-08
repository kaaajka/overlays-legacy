import type { DirectorContext } from "../../../motion/gsap/createChoreography";
import { sceneTools } from "../../scenes/directorTools";

export function choreography(context: DirectorContext) {
  const { q, at, t, finish } = sceneTools(context);
  t.set(q(".paper-portrait"), { autoAlpha: 0 }, 0);
  t.to(q(".paper-portrait"), { autoAlpha: 1, duration: 0.1 }, 0.05);
  t.fromTo(
    q(".paper-portrait"),
    { clipPath: "inset(100% 0 0 0)" },
    { autoAlpha: 1, clipPath: "inset(0% 0 0 0)", duration: 0.5 },
    at("firstImpact"),
  );
  t.set(q(".motion-name"), { autoAlpha: 1 }, at("donorReveal"));
  t.fromTo(
    q(".paper-strip"),
    { scaleX: 0 },
    { scaleX: 0.7, duration: 0.75, ease: "power1.inOut" },
    at("buildStart"),
  );
  t.set(q(".paper-caption"), { autoAlpha: 1 }, at("buildStart"));
  t.set(q(".motion-amount"), { autoAlpha: 1, scaleX: 0.88 }, at("heroDrop"));
  t.to(q(".paper-strip"), { scaleX: 1, duration: 0.35 }, at("heroDrop"));
  t.to(q(".motion-amount"), { scaleX: 1, duration: 0.35, ease: "power1.out" }, at("heroDrop"));
  t.fromTo(q(".paper-perforation"), { opacity: 0 }, { opacity: 1, duration: 0.15 }, at("heroDrop"));
  return finish();
}

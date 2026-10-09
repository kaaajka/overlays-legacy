import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { donate7Show as cue } from "./show";

gsap.registerPlugin(CustomEase, MorphSVGPlugin);
CustomEase.create("d7-camera", "M0,0 C0.24,0 0.21,0.83 0.5,0.96 0.68,1 0.82,1 1,1");

/** The same lens encloses DOM, SVG, Pixi and confetti. No renderer owns a camera clock. */
export function authorCameraRig(t: gsap.core.Timeline, q: gsap.utils.SelectorFunc) {
  const world = q(".d7-world"),
    spine = q(".d7-spine path");
  t.set(world, { scale: 1.045, y: 18, rotation: 0, force3D: false }, 0);
  t.to(world, { scale: 1, y: 0, duration: 4.15, ease: "sine.inOut" }, 0.05);
  t.to(world, { scale: 1.018, y: 8, duration: 4.15, ease: "sine.inOut" }, 8.1);
  t.to(world, { scale: 1, y: 0, duration: 1, ease: "sine.inOut" }, 12.25);
  // Anticipation → shared lens recoil → a long clean landing, not random camera shake.
  t.to(world, { scale: 0.992, y: 9, duration: 0.55, ease: "sine.inOut" }, cue.hero - 0.55);
  t.to(world, { scale: 1.035, y: -8, duration: 0.48, ease: "d7-camera" }, cue.hero);
  t.to(world, { scale: 1, y: 0, duration: 1.2, ease: "sine.inOut" }, cue.hero + 0.48);
  t.to(world, { scale: 0.962, y: 12, duration: 1.6, ease: "sine.inOut" }, 18.4);
  t.to(world, { scale: 1.018, y: -5, duration: 1.4, ease: "sine.inOut" }, cue.reprise);
  t.to(world, { scale: 1, y: 0, duration: 2.1, ease: "sine.inOut" }, 25.4);
  t.to(world, { scale: 0.975, y: 8, duration: 1.15, ease: "sine.inOut" }, cue.recovery);
  t.to(world, { scale: 1, y: 0, duration: 1.75, ease: "d7-camera" }, cue.recruit);
  t.to(world, { scale: 0.974, y: 10, duration: 0.82, ease: "sine.inOut" }, cue.final - 0.82);
  t.to(world, { scale: 1.026, y: -8, duration: 0.3, ease: "d7-camera" }, cue.final);
  t.to(world, { scale: 1, y: 0, duration: 1.1, ease: "sine.inOut" }, cue.final + 0.3);
  t.to(world, { scale: 1, y: 0, duration: 1.65, ease: "sine.inOut" }, cue.exit);

  const paper = q(".d7-donor")[0] as HTMLElement;
  const underlineY = 622 - 140 + paper.offsetHeight * 1.045 - 24;
  const shapes = {
    chorus:
      "M553 260 C440 235 405 365 530 425 C650 485 710 380 860 410 C1030 445 1000 620 1210 720",
    tension:
      "M520 225 C435 125 1310 95 1390 310 C1460 495 1280 665 1120 625 C960 585 1000 575 860 595",
    hero: "M465 225 C385 300 420 585 650 612 C825 640 1130 635 1320 585 C1430 555 1450 375 1380 280",
    exchange:
      "M520 265 C520 105 1500 85 1395 450 C1330 655 800 770 570 615 C365 475 400 520 500 545",
    fold: "M635 612 C710 624 860 617 955 620 C1030 621 1190 617 1290 616 C1310 617 1300 631 1280 627",
    amount: `M620 ${underlineY - 56} C602 ${underlineY - 8} 650 ${underlineY + 16} 790 ${underlineY + 4} C925 ${underlineY - 12} 1100 ${underlineY - 7} 1255 ${underlineY} C1280 ${underlineY + 2} 1280 ${underlineY + 10} 1255 ${underlineY + 8}`,
    exit: "M905 960 C925 960 947 960 965 960 C985 960 1005 960 1025 960 C1005 960 985 960 965 960",
  };
  t.set(spine, { attr: { d: shapes.chorus }, drawSVG: "0% 0%" }, 0);
  t.to(spine, { drawSVG: "0% 100%", duration: 3.1, ease: "sine.inOut" }, 5.2);
  // The thread is a travelling handoff, never a permanent border around the collage.
  t.to(spine, { drawSVG: "65% 100%", duration: 1.35, ease: "sine.inOut" }, 8.5);
  t.to(spine, { drawSVG: "0% 42%", duration: 1.4, ease: "sine.inOut" }, 11.7);
  t.to(spine, { drawSVG: "20% 78%", duration: 0.8, ease: "sine.inOut" }, cue.hero);
  t.to(spine, { drawSVG: "100% 100%", duration: 1.3, ease: "sine.inOut" }, 17.4);
  t.fromTo(
    spine,
    { drawSVG: "0% 0%" },
    { drawSVG: "0% 65%", duration: 1.25, ease: "sine.inOut", immediateRender: false },
    cue.reprise,
  );
  t.to(spine, { drawSVG: "65% 100%", duration: 1.4, ease: "sine.inOut" }, 24.5);
  const morph = (shape: string, at: number, duration: number) =>
    t.to(
      spine,
      { morphSVG: { shape, shapeIndex: 0, map: "position" }, duration, ease: "d7-camera" },
      at,
    );
  morph(shapes.tension, 11.7, 1.65);
  morph(shapes.hero, cue.hero, 1.4);
  morph(shapes.exchange, cue.reprise, 1.8);
  morph(shapes.fold, cue.recovery, 1.15);
  morph(shapes.hero, cue.recruit, 1.75);
  morph(shapes.amount, cue.final, 1.65);
  morph(shapes.exit, cue.exit, 1.8);
  t.to(spine, { drawSVG: "0% 100%", duration: 1.05, ease: "sine.inOut" }, cue.recovery);
  t.to(spine, { drawSVG: "30% 75%", duration: 1.7, ease: "d7-camera" }, cue.recruit);
  t.to(spine, { drawSVG: "100% 100%", duration: 1.4, ease: "sine.inOut" }, 32.9);
  t.fromTo(
    spine,
    { drawSVG: "0% 0%" },
    { drawSVG: "0% 100%", duration: 1.65, ease: "sine.inOut", immediateRender: false },
    cue.final,
  );
  t.to(spine, { drawSVG: "50% 50%", duration: 1.2, ease: "sine.inOut" }, cue.exit + 0.5);
  t.to(
    q(".d7-spine-ink"),
    { stroke: "#ae1557", strokeWidth: 4, duration: 1.65, ease: "sine.inOut" },
    cue.final,
  );
  t.to(q(".d7-spine-shadow"), { strokeWidth: 9, opacity: 0.25, duration: 1.65 }, cue.final);
  t.to(q(".d7-underline"), { opacity: 0, duration: 1.65, ease: "sine.inOut" }, cue.final);
}

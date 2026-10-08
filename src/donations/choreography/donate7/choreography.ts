import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import type { DirectorContext } from "../../../motion/gsap/createChoreography";
import { rhythmMarks } from "../../../audio/motion/musicIntelligence";
import { sceneTools } from "../../scenes/directorTools";
import { donate7Show as cue, monitorEvents } from "./show";

gsap.registerPlugin(CustomEase, SplitText, DrawSVGPlugin);
CustomEase.create("d7-mechanical", "M0,0 C0.12,0 0.13,0.97 0.3,1 0.55,1 0.65,1 1,1");
CustomEase.create("d7-heavy", "M0,0 C0.3,0 0.33,0.13 0.46,0.86 0.53,1 0.68,1 1,1");
CustomEase.create("d7-camera", "M0,0 C0.03,0.67 0.1,0.95 0.25,1 0.5,1 0.72,1 1,1");

/** Named shots on one paused timeline; no callbacks, random tweens or private clocks. */
export function choreography(context: DirectorContext) {
  const { q, at, t, name, amount, effects, finish } = sceneTools(context, {
    ownRhythm: true,
  });
  const letters = SplitText.create(q(".d7-slam"), {
    type: "chars",
    aria: "auto",
  });
  const monitors = q(".d7-monitor");
  const screens = q(".d7-screen, .d7-source .source-rhythm");
  const stills = q(".d7-still");
  const camera = q(".d7-camera");
  const headline = q(".d7-headline");
  const wall = q(".d7-monitor-wall");
  for (const [label, time] of Object.entries(cue)) t.addLabel(`d7:${label}`, time);
  t.set(
    q(
      ".d7-monitor, .d7-headline, .d7-wtf, .d7-sticker, .d7-signal-word, .d7-impact, .d7-monitor-ghost",
    ),
    { autoAlpha: 0 },
    0,
  );
  t.set(q(".d7-co, .d7-za, .d7-slam"), { autoAlpha: 0 }, 0);
  t.set(q(".d7-type-echo"), { autoAlpha: 0 }, 0);
  t.set(letters.chars, { yPercent: 0, scaleY: 1, rotation: 0, force3D: false }, 0);
  t.set(amount, { y: 0, force3D: false }, 0);
  t.set(q(".d7-impact path"), { drawSVG: "0% 0%" }, 0);
  t.set(camera, { x: 0, y: 0, rotation: 0, scale: 1 }, 0);
  t.set(wall, { x: 0, y: 0, rotation: 0, scale: 1 }, 0);
  t.set(effects, { travel: 1 }, 0);

  function introSignal() {
    t.set(q(".d7-source"), { autoAlpha: 1 }, 0.05);
    t.fromTo(
      q(".d7-main-monitor"),
      { autoAlpha: 0, scaleY: 0.04, scaleX: 0.42, rotation: -5 },
      {
        autoAlpha: 1,
        scaleY: 0.42,
        scaleX: 0.42,
        duration: 0.22,
        ease: "d7-mechanical",
        immediateRender: false,
      },
      0.05,
    );
    t.fromTo(
      q(".d7-signal-word"),
      { autoAlpha: 0, y: 12, scale: 0.7 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.25,
        ease: "back.out(1.5)",
        immediateRender: false,
      },
      1.25,
    );
    t.to(q(".d7-signal-word"), { autoAlpha: 0, y: -18, duration: 0.25 }, 2.9);
    t.to(
      q(".d7-main-monitor"),
      { scale: 0.56, rotation: 4, duration: 0.18, ease: "d7-heavy" },
      cue.signal - 0.18,
    );
    t.to(camera, { x: -4, y: -3, duration: 3.8, ease: "sine.inOut" }, 0.4);
    t.to(
      q(".d7-main-monitor"),
      { scale: 1, rotation: -3, duration: 0.2, ease: "d7-mechanical" },
      cue.signal,
    );
    t.set(q(".motion-name"), { autoAlpha: 1 }, at("donorReveal"));
    t.fromTo(
      name,
      { x: -30, y: 26, opacity: 0, rotation: -8 },
      {
        x: 0,
        y: 0,
        opacity: 1,
        rotation: 0,
        duration: 0.34,
        stagger: { amount: 0.35 },
        ease: "d7-camera",
        immediateRender: false,
      },
      at("donorReveal"),
    );
  }

  function monitorCascade() {
    const beats = rhythmMarks(context.treatment.analysis)
      .map((mark) => mark.at)
      .filter((beat) => beat >= at("buildStart") && beat < at("preDrop"));
    stills.forEach((node, index) => {
      t.fromTo(
        node,
        {
          autoAlpha: 0,
          x: index % 2 ? 70 : -70,
          y: 45,
          scale: 0.15,
          rotation: index % 2 ? 25 : -25,
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotation: index % 2 ? 7 : -8,
          duration: 0.3,
          ease: "d7-mechanical",
          immediateRender: false,
        },
        beats[index] ?? 9 + index * 0.45,
      );
    });
    for (const [index, node] of q(".d7-satellite").entries()) {
      t.fromTo(
        node,
        { autoAlpha: 0, scaleY: 0.03, rotation: 0 },
        {
          autoAlpha: 1,
          scaleY: 1,
          rotation: index ? 9 : -7,
          duration: 0.25,
          ease: "d7-mechanical",
          immediateRender: false,
        },
        7.6858 + index * 0.4644,
      );
    }
    t.to(camera, { x: 5, y: -5, rotation: 0.25, duration: 3, ease: "sine.inOut" }, 9);
  }

  function headlineBuild() {
    t.set(headline, { autoAlpha: 1 }, cue.co);
    t.fromTo(
      q(".d7-co"),
      { autoAlpha: 0, x: -50, y: 22, rotation: -14, scaleX: 0.6 },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        duration: 0.18,
        ease: "d7-mechanical",
        immediateRender: false,
      },
      cue.co,
    );
    t.fromTo(
      q(".d7-za"),
      { autoAlpha: 0, x: 50, y: -22, rotation: 12, scaleX: 0.6 },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        duration: 0.18,
        ease: "d7-mechanical",
        immediateRender: false,
      },
      cue.za,
    );
  }

  function cameraPunch(time: number, force: number, direction = 1) {
    t.to(
      camera,
      {
        x: -8 * force * direction,
        y: 5 * force,
        scale: 0.98,
        rotation: -0.3 * direction,
        duration: 0.18,
        ease: "power3.in",
      },
      time - 0.18,
    );
    t.set(
      camera,
      {
        x: 18 * force * direction,
        y: -10 * force,
        scale: 1.025,
        rotation: 0.7 * direction,
      },
      time,
    );
    t.to(
      camera,
      {
        x: -4 * direction,
        y: 3,
        scale: 1,
        rotation: -0.12 * direction,
        duration: 0.19,
        ease: "d7-camera",
      },
      time,
    );
    t.to(camera, { x: 0, y: 0, rotation: 0, duration: 0.38, ease: "sine.out" }, time + 0.19);
  }

  function stickerBurst(selector: string, time: number, direction: number) {
    t.fromTo(
      q(selector),
      { autoAlpha: 0, scale: 0.25, rotation: -direction * 20, y: 36 },
      {
        autoAlpha: 1,
        scale: 1.12,
        rotation: direction * 8,
        y: 0,
        duration: 0.24,
        ease: "back.out(1.4)",
        immediateRender: false,
      },
      time,
    );
    t.to(q(selector), { scale: 1, rotation: -direction * 5, duration: 0.25 }, time + 0.24);
    t.to(q(selector), { autoAlpha: 0, y: -28, scale: 0.8, duration: 0.25 }, time + 1.6);
  }

  function impactLines(time: number) {
    t.set(q(".d7-impact"), { autoAlpha: 1 }, time);
    t.fromTo(
      q(".d7-impact path"),
      { drawSVG: "0% 0%" },
      {
        drawSVG: "0% 100%",
        duration: 0.19,
        ease: "power2.out",
        immediateRender: false,
      },
      time,
    );
    t.to(q(".d7-impact path"), { drawSVG: "100% 100%", duration: 0.26 }, time + 0.4);
    t.to(q(".d7-impact"), { autoAlpha: 0, duration: 0.1 }, time + 0.66);
  }

  function heroSlam(time: number, force: number) {
    t.to(wall, { scale: 0.9, rotation: -2, duration: 0.18, ease: "power3.in" }, time - 0.18);
    t.to(q(".d7-blackout"), { opacity: 0.64, duration: 0.18 }, time - 0.18);
    t.to(headline, { scale: 0.93, rotation: -3, duration: 0.18 }, time - 0.18);
    // Initialize every staggered glyph before the boundary; a +250ms→hit seek must
    // reconstruct the same first pose as a fresh hit, including not-yet-started glyphs.
    t.set(letters.chars, { yPercent: 60, scaleY: 0.35, rotation: -6 }, time - 0.18);
    t.set(q(".d7-slam"), { autoAlpha: 1 }, time);
    t.to(
      letters.chars,
      {
        yPercent: -5,
        scaleY: 1.14,
        rotation: 1,
        duration: 0.09,
        stagger: { amount: 0.045 },
        ease: "d7-mechanical",
        immediateRender: false,
      },
      time,
    );
    t.to(
      letters.chars,
      {
        yPercent: 0,
        scaleY: 1,
        rotation: 0,
        duration: 0.28,
        stagger: { amount: 0.025 },
        ease: "power3.out",
      },
      time + 0.12,
    );
    t.set(headline, { scale: 1.55 + force * 0.2, rotation: -3 }, time);
    t.to(headline, { scale: 1.7 + force * 0.2, rotation: 1, duration: 0.065 }, time);
    t.to(headline, { scale: 1, rotation: 0, duration: 0.48, ease: "d7-camera" }, time + 0.065);
    t.set(wall, { scale: 1.05, rotation: 1 }, time);
    t.to(wall, { scale: 1, rotation: 0, duration: 0.38, ease: "d7-camera" }, time);
    t.set(q(".d7-light"), { opacity: 1 }, time);
    t.to(q(".d7-light"), { opacity: 0.28, duration: 0.5 }, time);
    t.to(q(".d7-blackout"), { opacity: 0, duration: 0.42 }, time + 0.08);
    t.set(q(".d7-type-echo"), { autoAlpha: 0.55, x: -35, scaleX: 1.12 }, time);
    t.to(q(".d7-type-echo"), { autoAlpha: 0, x: -100, scaleX: 1.25, duration: 0.2 }, time);
    cameraPunch(time, force);
    impactLines(time + 0.07);
  }

  function rhythmicExchange() {
    const events = monitorEvents(context.treatment.analysis);
    for (const [index, event] of events.entries()) {
      const calm = event.at >= cue.calm && event.at < cue.recruit;
      const screen = calm ? q(".d7-main-monitor")[0] : monitors[index % monitors.length];
      t.fromTo(
        screen,
        { "--d7-exposure": 0 },
        {
          "--d7-exposure": event.strength,
          duration: 0.03,
          immediateRender: false,
        },
        event.at,
      );
      t.to(screen, { "--d7-exposure": 0, duration: 0.075 }, event.at + 0.03);
    }
    rhythmMarks(context.treatment.analysis).forEach((beat, index) => {
      if (
        beat.at < cue.signal ||
        beat.at > cue.exit ||
        (beat.at >= cue.calm && beat.at < cue.recruit) ||
        [cue.hero, cue.reprise, cue.final].some((hit) => Math.abs(hit - beat.at) < 0.8)
      )
        return;
      const screen = screens[index % screens.length];
      t.to(screen, { y: 2, scaleX: 0.985, duration: 0.075, ease: "power2.in" }, beat.at - 0.075);
      t.to(screen, { y: -2, scaleX: 1.008, duration: 0.07, ease: "d7-mechanical" }, beat.at);
      t.to(screen, { y: 0, scaleX: 1, duration: 0.15 }, beat.at + 0.07);
    });
    for (const [time, direction] of [
      [cue.reprise, -1],
      [cue.exchange, 1],
    ] as const) {
      stills.forEach((node, index) => {
        t.to(
          node,
          {
            x: direction * (index % 2 ? 55 : -55),
            y: index % 2 ? -35 : 35,
            rotation: direction * (index % 2 ? -13 : 13),
            duration: 0.3,
            ease: "d7-mechanical",
          },
          time + index * 0.055,
        );
        t.to(
          node,
          { x: 0, y: 0, rotation: index % 2 ? 7 : -8, duration: 0.4 },
          time + 1.8 + index * 0.04,
        );
      });
    }
    t.to(wall, { rotation: -1.4, y: -8, duration: 2.2, ease: "sine.inOut" }, 26.02957);
    t.to(wall, { rotation: 0, y: 0, duration: 1.6 }, 28.44444);
  }

  function glitchEcho(time: number) {
    t.fromTo(
      q(".d7-monitor-ghost"),
      { autoAlpha: 0.22, x: 10, y: -5, scaleY: 0.33 },
      {
        autoAlpha: 0,
        x: -12,
        y: 8,
        scaleY: 0.28,
        duration: 0.08,
        ease: "steps(2)",
        immediateRender: false,
      },
      time,
    );
  }

  function falseCalm() {
    t.to(
      q(".d7-still, .d7-satellite"),
      {
        scaleY: 0.04,
        autoAlpha: 0,
        duration: 0.24,
        stagger: 0.065,
        ease: "d7-mechanical",
      },
      cue.recovery,
    );
    t.to(headline, { autoAlpha: 0, y: -35, scaleY: 0.85, duration: 0.45 }, cue.recovery + 0.3);
    t.to(q(".d7-wtf"), { autoAlpha: 0, duration: 0.2 }, cue.recovery);
    t.to(
      q(".d7-main-monitor"),
      { scale: 0.43, rotation: -4, duration: 0.7, ease: "d7-heavy" },
      cue.recovery + 0.4,
    );
    t.to(q(".d7-light"), { opacity: 0, duration: 0.5 }, cue.calm);
    t.to(camera, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.3 }, cue.calm);
    t.fromTo(
      q(".d7-signal-word"),
      { autoAlpha: 0, y: 0, scale: 0.8 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.25,
        ease: "back.out(1.4)",
        immediateRender: false,
      },
      cue.calm,
    );
    t.to(q(".d7-signal-word"), { autoAlpha: 0, duration: 0.2 }, cue.recruit);
    t.to(
      q(".d7-still, .d7-satellite"),
      {
        scaleY: 1,
        autoAlpha: 1,
        duration: 0.18,
        stagger: 0.095,
        ease: "d7-mechanical",
      },
      cue.recruit,
    );
    t.to(q(".d7-main-monitor"), { scale: 1, rotation: -3, duration: 0.25 }, cue.recruit + 0.8);
    t.set(headline, { autoAlpha: 1, y: 0, scaleY: 1 }, cue.final - 0.3);
  }

  function finalPayoff() {
    heroSlam(cue.final, 2.2);
    t.set(q(".d7-wtf"), { autoAlpha: 1 }, cue.final + 0.18);
    stickerBurst(".d7-cyan", cue.final + 0.5, -1);
    glitchEcho(cue.final + 0.09);
  }

  function outroRelease() {
    t.to(
      headline,
      { y: -60, scaleY: 0.65, autoAlpha: 0, duration: 0.5, ease: "d7-heavy" },
      cue.exit,
    );
    t.to(q(".d7-wtf"), { autoAlpha: 0, x: 45, duration: 0.3 }, cue.exit);
    t.to(
      q(".d7-still, .d7-satellite"),
      {
        scaleY: 0.025,
        autoAlpha: 0,
        duration: 0.2,
        stagger: 0.085,
        ease: "d7-mechanical",
      },
      cue.exit + 0.12,
    );
    t.to(
      q(".d7-main-monitor"),
      { scale: 0.42, rotation: 0, duration: 0.4, ease: "d7-heavy" },
      cue.exit + 0.9,
    );
    t.to(q(".d7-main-monitor"), { scaleY: 0.015, autoAlpha: 0, duration: 0.16 }, 45.45);
    t.to(q(".d7-light"), { opacity: 0, duration: 0.8 }, cue.exit);
    t.to(effects, { travel: 0, duration: 0.4 }, 45.7);
    t.to(q(".scene-copy"), { y: 20, autoAlpha: 0, duration: 0.35 }, 45.65);
  }

  introSignal();
  monitorCascade();
  headlineBuild();
  heroSlam(cue.hero, 1);
  t.set(q(".motion-amount"), { autoAlpha: 1 }, cue.hero);
  t.set(amount, { opacity: 1 }, cue.hero);
  t.set(amount, { y: 8 }, cue.hero - 0.18);
  t.to(
    amount,
    {
      y: 0,
      duration: 0.15,
      stagger: { amount: 0.06 },
      immediateRender: false,
    },
    cue.hero,
  );
  t.set(q(".d7-wtf"), { autoAlpha: 1 }, cue.hero + 0.18);
  stickerBurst(".d7-cheer", cue.hero + 0.42, 1);
  rhythmicExchange();
  heroSlam(cue.reprise, 1.15);
  stickerBurst(".d7-cyan", cue.reprise + 0.35, -1);
  glitchEcho(cue.reprise + 0.06);
  falseCalm();
  finalPayoff();
  outroRelease();
  const directed = finish();
  return {
    timeline: directed.timeline,
    dispose() {
      directed.dispose();
      letters.revert();
    },
  };
}

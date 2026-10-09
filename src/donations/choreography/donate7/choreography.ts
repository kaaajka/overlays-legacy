import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import type { DirectorContext } from "../../../motion/gsap/createChoreography";
import { sceneTools } from "../../scenes/directorTools";
import { donate7Show as cue } from "./show";
import { authorCameraRig } from "./cameraRig";

gsap.registerPlugin(CustomEase, SplitText, DrawSVGPlugin, MotionPathPlugin);
CustomEase.create("d7-paper", "M0,0 C0.22,0 0.21,0.88 0.48,1.04 0.65,1.1 0.77,1 1,1");
CustomEase.create("d7-weight", "M0,0 C0.33,0 0.29,0.4 0.46,0.89 0.62,1.04 0.78,1 1,1");

/** One paused score. All glyphs and absolute secondary actions reconstruct after seeking. */
export function choreography(context: DirectorContext) {
  const { q, t, name, amount, effects, finish } = sceneTools(context, {
    ownRhythm: true,
  });
  const splits = [".d7-co", ".d7-za", ".d7-slam", ".d7-wtf", ".motion-currency", ".d7-caller"].map(
    (selector) => SplitText.create(q(selector), { type: "chars", aria: "auto" }),
  );
  const [co, za, title, wtf, currency, callers] = splits;
  const camera = q(".d7-camera"),
    headline = q(".d7-headline"),
    feeds = q(".d7-aperture"),
    donor = q(".d7-donor");
  // The source paper's alpha edge grows proportionally with its content. Measure the
  // loaded text blocks so wrapped names retain opaque backing without shrinking digits.
  const paper = donor[0] as HTMLElement;
  const information = q(".motion-information")[0] as HTMLElement;
  const nameBlock = q(".motion-name")[0] as HTMLElement;
  const amountBlock = q(".motion-amount")[0] as HTMLElement;
  paper.style.paddingTop = `${Math.max(68, Math.ceil(((nameBlock.offsetHeight + amountBlock.offsetHeight + 54) * 0.16) / 0.84 + 18))}px`;
  authorCameraRig(t, q);
  t.set(headline, { transformOrigin: "50% 100%" }, 0);
  t.set(q(".d7-fold-edge"), { autoAlpha: 0, scaleX: 0.2 }, 0);
  t.set(q(".d7-spine"), { autoAlpha: 1 }, 0);
  t.set(
    q(
      ".d7-camera,.d7-headline,.d7-aperture,.d7-donor,.d7-sticker,.d7-caller,.d7-wtf,.d7-co,.d7-za,.d7-slam",
    ),
    { force3D: false },
    0,
  );
  for (const [label, time] of Object.entries(cue)) t.addLabel(`d7:${label}`, time);
  t.set(
    q(
      ".d7-aperture,.d7-headline,.d7-co,.d7-za,.d7-slam,.d7-caller,.d7-wtf,.d7-sticker,.d7-impact,.d7-donor",
    ),
    { autoAlpha: 0 },
    0,
  );
  t.set([camera, headline, donor], { x: 0, y: 0, rotation: 0, scale: 1 }, 0);
  t.set(
    [
      ...co.chars,
      ...za.chars,
      ...title.chars,
      ...wtf.chars,
      ...currency.chars,
      ...callers.chars,
      ...name,
      ...amount,
    ],
    { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, force3D: false },
    0,
  );
  t.set(q(".d7-impact path,.d7-underline path"), { drawSVG: "0% 0%" }, 0);
  t.set(effects, { travel: 1 }, 0);
  t.set(q(".d7-source"), { autoAlpha: 1 }, 0.05);
  t.fromTo(
    feeds[0],
    { autoAlpha: 0, x: 320, y: 170, scale: 0.65, rotation: -16 },
    {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: -6,
      duration: 1.6,
      ease: "d7-paper",
      immediateRender: false,
    },
    0.05,
  );

  function call(index: number, at: number, side: number, life = 2.1) {
    const node = q(`.d7-call-${index}`);
    t.fromTo(
      node,
      { autoAlpha: 0, scale: 0.65, rotation: side * 18, x: side * 160, y: 55 },
      {
        autoAlpha: 1,
        scale: 1,
        rotation: side * -7,
        motionPath: {
          path: [
            { x: side * 160, y: 55 },
            { x: side * 38, y: -20 },
            { x: 0, y: 0 },
          ],
          curviness: 1.4,
        },
        duration: 1.1,
        ease: "d7-paper",
        immediateRender: false,
      },
      at,
    );
    t.to(
      node,
      {
        autoAlpha: 0,
        x: side * -35,
        y: -45,
        rotation: side * 12,
        duration: 0.65,
        ease: "power2.inOut",
      },
      at + life,
    );
  }
  call(0, 1.25, -1, 2.3);
  call(1, 4.15, 1);
  call(2, 6, -1);
  [0, 1, 2, 3, 4, 5].forEach((i) => {
    call(i, 8.115 + i * 0.38, i % 2 ? 1 : -1, 2.8);
  });
  [1, 2].forEach((i) => {
    t.fromTo(
      feeds[i],
      {
        autoAlpha: 0,
        x: i === 1 ? 140 : -140,
        y: 80,
        rotation: i === 1 ? 22 : -20,
        scale: 0.7,
      },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        rotation: i === 1 ? 7 : -9,
        scale: 1,
        duration: 1.2,
        ease: "d7-paper",
        immediateRender: false,
      },
      8.115 + i * 0.4644,
    );
  });
  t.to(camera, { x: 10, y: -5, rotation: 0.35, duration: 3.2, ease: "sine.inOut" }, 9.2);
  t.to(camera, { x: 0, y: 0, rotation: 0, duration: 1.5, ease: "sine.inOut" }, 12.4);

  function cutout(selector: string, chars: Element[], at: number, side: number) {
    t.set(headline, { autoAlpha: 1 }, at);
    t.set(q(selector), { autoAlpha: 1 }, at);
    t.set(
      chars,
      {
        y: 80,
        x: side * 25,
        rotation: side * 17,
        rotationX: -72,
        transformPerspective: 900,
        scaleY: 0.55,
      },
      at - 0.001,
    );
    t.to(
      chars,
      {
        y: 0,
        x: 0,
        rotation: 0,
        rotationX: 0,
        scaleY: 1,
        duration: 1.05,
        stagger: { amount: 0.22 },
        ease: "d7-paper",
        immediateRender: false,
      },
      at,
    );
  }
  cutout(".d7-co", co.chars, cue.co, -1);
  cutout(".d7-za", za.chars, cue.za, 1);
  t.fromTo(
    donor,
    { autoAlpha: 0, y: 80, rotation: 4, scaleX: 0.85 },
    {
      autoAlpha: 1,
      y: 0,
      rotation: 0,
      scaleX: 1,
      duration: 1.25,
      ease: "d7-paper",
      immediateRender: false,
    },
    13.9,
  );
  t.set(q(".motion-name"), { autoAlpha: 1 }, 13.9);
  t.fromTo(
    name,
    { y: 25, opacity: 0, rotation: -8 },
    {
      y: 0,
      opacity: 1,
      rotation: 0,
      duration: 0.9,
      stagger: { amount: 0.24 },
      ease: "d7-paper",
      immediateRender: false,
    },
    13.9,
  );
  t.to(headline, { y: 10, scaleY: 0.94, duration: 0.25, ease: "power2.in" }, cue.hero - 0.25);
  cutout(".d7-slam", title.chars, cue.hero, -1);
  t.to(headline, { y: 0, scaleY: 1, duration: 1.15, ease: "d7-weight" }, cue.hero);
  t.set(q(".motion-amount"), { autoAlpha: 1 }, cue.hero);
  // All amount characters are readable at the exact explanation cue; motion changes position only.
  t.set([...amount, ...currency.chars], { opacity: 1, y: 8 }, cue.hero - 0.001);
  t.to(amount, { y: 0, duration: 0.95, stagger: { amount: 0.2 }, ease: "d7-weight" }, cue.hero);
  t.to(currency.chars, { y: 0, rotation: 0, duration: 1.05, ease: "d7-paper" }, cue.hero + 0.12);
  t.fromTo(
    q(".d7-cheer"),
    { autoAlpha: 0, x: -80, y: 65, rotation: -25, scale: 0.7 },
    {
      autoAlpha: 1,
      x: 0,
      y: 0,
      rotation: -7,
      scale: 1,
      duration: 1.25,
      ease: "d7-paper",
      immediateRender: false,
    },
    cue.hero + 0.35,
  );
  function strokes(at: number) {
    t.set(q(".d7-impact"), { autoAlpha: 1 }, at);
    t.fromTo(
      q(".d7-impact path"),
      { drawSVG: "0% 0%" },
      {
        drawSVG: "0% 100%",
        duration: 0.55,
        ease: "power2.out",
        immediateRender: false,
      },
      at,
    );
    t.to(q(".d7-impact path"), { drawSVG: "100% 100%", duration: 0.55 }, at + 0.8);
  }
  strokes(cue.hero + 0.15);
  t.to(
    q(".d7-underline path"),
    { drawSVG: "0% 100%", duration: 1.1, ease: "power2.out" },
    cue.hero + 0.3,
  );
  t.to(feeds[1], { x: 30, y: 20, rotation: 11, duration: 1.4, ease: "sine.inOut" }, 18.2);
  t.to(feeds[2], { x: -15, y: -18, rotation: -4, duration: 1.3, ease: "sine.inOut" }, 19.7);
  // The first storm resolves into a quieter reading shot instead of holding the hero poster.
  t.to(headline, { scale: 0.72, y: -110, rotation: 0, duration: 1.6, ease: "sine.inOut" }, 18.4);
  t.to(donor, { y: -42, duration: 1.6, ease: "sine.inOut" }, 18.4);
  call(3, 20.3, 1);

  // Second joke is a travelling WTF exchange, not another title slam.
  t.set(q(".d7-wtf"), { autoAlpha: 1 }, cue.reprise);
  t.set(wtf.chars, { y: -48, rotation: 18, scaleY: 0.7 }, cue.reprise - 0.001);
  t.to(
    wtf.chars,
    {
      y: 0,
      rotation: 0,
      scaleY: 1,
      duration: 1.05,
      stagger: { amount: 0.2 },
      ease: "d7-paper",
    },
    cue.reprise,
  );
  t.to(
    headline,
    { scale: 0.86, y: -74, rotation: -1, duration: 1.3, ease: "sine.inOut" },
    cue.reprise,
  );
  t.to(donor, { y: -20, scale: 0.97, duration: 1.3, ease: "sine.inOut" }, cue.reprise);
  t.fromTo(
    q(".d7-cry"),
    { autoAlpha: 0, x: 60, y: 60, rotation: 25 },
    {
      autoAlpha: 1,
      x: 0,
      y: 0,
      rotation: 8,
      duration: 1.2,
      ease: "d7-paper",
      immediateRender: false,
    },
    cue.reprise + 0.22,
  );
  t.to(
    feeds[1],
    { x: 0, y: 0, rotation: -5, duration: 1.4, ease: "sine.inOut" },
    cue.reprise + 0.2,
  );
  t.to(feeds[2], { x: 0, y: 0, rotation: 8, duration: 1.4, ease: "sine.inOut" }, cue.reprise + 0.6);
  t.to(q(".d7-cheer"), { y: 12, rotation: 6, duration: 1.3, ease: "sine.inOut" }, 25.1);
  t.to(q(".d7-cheer"), { y: 0, rotation: -7, duration: 1.3, ease: "sine.inOut" }, 26.4);
  call(0, 26.2, -1);
  call(5, 26.6, 1);
  // The statement becomes a different silhouette during the second joke.
  // Top words make breathing room while the exclamation glyphs keep a continuous eye arc.
  t.to(
    q(".d7-setup"),
    { scale: 0.76, x: 42, y: -34, duration: 1.3, ease: "sine.inOut" },
    cue.reprise + 0.25,
  );
  title.chars.forEach((letter, index) => {
    t.to(
      letter,
      {
        y: Math.sin(index * 0.7) * -14,
        rotation: (index - 3.5) * 1.5,
        duration: 1.15,
        ease: "sine.inOut",
      },
      cue.reprise + 0.3 + index * 0.04,
    );
    t.to(letter, { y: 0, rotation: 0, duration: 1.2, ease: "sine.inOut" }, 25.5 + index * 0.045);
  });
  t.to(q(".d7-setup"), { scale: 1, x: 0, y: 0, duration: 1.3, ease: "sine.inOut" }, 26.6);
  t.to(
    feeds[1],
    {
      motionPath: {
        path: [
          { x: 0, y: 0 },
          { x: -330, y: -45 },
          { x: -760, y: 235 },
          { x: -855, y: 390 },
        ],
        curviness: 1.2,
      },
      rotation: -8,
      duration: 1.4,
      ease: "power2.inOut",
    },
    24.5,
  );
  t.to(
    feeds[1],
    {
      motionPath: {
        path: [
          { x: -855, y: 390 },
          { x: -740, y: 85 },
          { x: -260, y: -30 },
          { x: 0, y: 0 },
        ],
        curviness: 1.2,
      },
      rotation: 7,
      duration: 1.4,
      ease: "power2.inOut",
    },
    27,
  );

  // The same cutouts fold into a thin held silhouette, then unfold. No replacement scene.
  t.to(
    headline,
    {
      autoAlpha: 1,
      y: () => 620 - 280 - (headline[0] as HTMLElement).offsetHeight,
      x: 0,
      scale: 0.78,
      rotation: 0,
      rotationX: -78,
      transformPerspective: 1400,
      duration: 1.15,
      ease: "d7-camera",
    },
    cue.recovery,
  );
  t.to(
    q(".d7-wtf,.d7-sticker"),
    { autoAlpha: 0, y: 65, scale: 0.55, duration: 1.05, ease: "sine.inOut" },
    cue.recovery,
  );
  t.to(
    [feeds[1], feeds[2]],
    {
      autoAlpha: 1,
      scale: 0.28,
      rotation: 0,
      rotationX: -78,
      x: (i: number) => (i ? 685 : -520),
      y: (i: number) => (i ? 97 : 324),
      transformPerspective: 1000,
      duration: 1.15,
      ease: "d7-camera",
    },
    cue.recovery,
  );
  t.to(
    feeds[0],
    {
      scale: 0.72,
      rotation: 0,
      x: 200,
      y: 50,
      duration: 0.9,
      ease: "sine.inOut",
    },
    cue.recovery,
  );
  t.to(donor, { scale: 0.92, duration: 0.8, ease: "sine.inOut" }, cue.recovery);
  t.to(
    q(".d7-fold-edge"),
    { autoAlpha: 1, scaleX: 1, duration: 0.45, ease: "sine.inOut" },
    cue.recovery + 0.7,
  );
  t.to(
    q(".d7-fold-edge"),
    { autoAlpha: 0, scaleX: 0.2, duration: 0.8, ease: "sine.inOut" },
    cue.recruit,
  );
  call(0, cue.recruit, -1, 1.7);
  t.to(
    headline,
    {
      autoAlpha: 1,
      y: -36,
      rotation: 0,
      scale: 0.84,
      rotationX: 0,
      duration: 1.3,
      ease: "d7-paper",
    },
    cue.recruit,
  );
  t.to(
    feeds[0],
    { scale: 1, rotation: -3, x: 180, y: -55, duration: 1.75, ease: "d7-camera" },
    cue.recruit,
  );
  t.to(
    [feeds[1], feeds[2]],
    {
      autoAlpha: 1,
      scale: 1,
      x: (i: number) => (i ? 505 : -95),
      y: (i: number) => (i ? -340 : -115),
      rotationY: 0,
      rotationX: 0,
      rotation: (i: number) => (i ? -9 : 7),
      duration: 1.75,
      ease: "d7-camera",
    },
    cue.recruit + 0.18,
  );
  t.to(donor, { scale: 1, y: -46, duration: 1.75, ease: "d7-camera" }, cue.recruit);
  // Measured drum accents become punctuation inside continuing phrase moves.
  // Four-stem analysis identifies these attacks; they are not semantic lyric assertions.
  for (const [index, at] of [
    17.35692, 18.26249, 19.19129, 20.10848, 25.43746, 26.35465, 31.1844, 32.12481, 34.87637,
    35.81678,
  ].entries()) {
    const letters = index % 2 ? currency.chars : co.chars;
    t.to(
      letters,
      {
        y: -3,
        rotation: index % 2 ? 2 : -1,
        duration: 0.18,
        stagger: 0.025,
        ease: "power2.out",
      },
      at,
    );
    t.to(
      letters,
      { y: 0, rotation: 0, duration: 0.32, stagger: 0.025, ease: "sine.inOut" },
      at + 0.18,
    );
    const source = q(".source-rhythm")[index % 3];
    t.to(source, { scaleX: 1.025, y: -2, duration: 0.18, ease: "power2.out" }, at + 0.04);
    t.to(source, { scaleX: 1, y: 0, duration: 0.35, ease: "sine.inOut" }, at + 0.22);
  }
  // Variable-axis pressure changes silhouette, never the supplied value.
  t.to(
    q(".motion-amount"),
    {
      fontVariationSettings: '"wdth" 82,"opsz" 100',
      duration: 1.1,
      ease: "sine.inOut",
    },
    33.1,
  );
  t.to(
    q(".motion-amount"),
    {
      fontVariationSettings: '"wdth" 88,"opsz" 100',
      duration: 1.1,
      ease: "sine.inOut",
    },
    34.2,
  );
  amount.forEach((letter, index) => {
    t.to(
      letter,
      {
        rotation: (index % 2 ? 1 : -1) * 2,
        y: -3,
        duration: 0.55,
        ease: "sine.inOut",
      },
      33.1 + index * 0.09,
    );
    t.to(letter, { rotation: 0, y: 0, duration: 0.65, ease: "sine.inOut" }, 33.65 + index * 0.09);
  });
  t.to(camera, { x: 18, y: -8, rotation: -0.5, duration: 1.4, ease: "sine.inOut" }, 36.03);
  // One readable mass compresses before the established downbeat, impacts, then settles.
  t.to(
    donor,
    { scaleX: 0.94, scaleY: 1.02, y: -74, rotation: 0, duration: 0.82, ease: "power2.inOut" },
    cue.final - 0.82,
  );
  t.to(
    donor,
    { scaleX: 1.1, scaleY: 1.08, y: -140, rotation: 0, duration: 0.3, ease: "d7-weight" },
    cue.final,
  );
  t.to(donor, { scaleX: 1.045, scaleY: 1.045, duration: 1.1, ease: "sine.inOut" }, cue.final + 0.3);
  t.to(
    headline,
    {
      scale: 0.56,
      x: 0,
      y: -175,
      rotation: 0,
      duration: 0.82,
      ease: "sine.inOut",
    },
    cue.final - 0.82,
  );
  t.to(feeds, { scale: 0.82, duration: 0.82, ease: "sine.inOut" }, cue.final - 0.82);
  t.to(
    q(".d7-setup"),
    { scale: 0.88, x: 20, y: -16, duration: 1.3, ease: "sine.inOut" },
    cue.final,
  );
  t.to(
    amount,
    {
      y: -12,
      rotation: -1,
      duration: 0.65,
      stagger: { amount: 0.18 },
      ease: "d7-paper",
    },
    cue.final,
  );
  t.to(
    amount,
    {
      y: 0,
      rotation: 0,
      duration: 0.65,
      stagger: { amount: 0.18 },
      ease: "sine.inOut",
    },
    cue.final + 0.65,
  );
  t.to(currency.chars, { y: -20, rotation: 9, duration: 0.6, ease: "d7-paper" }, cue.final + 0.18);
  t.to(currency.chars, { y: 0, rotation: 0, duration: 0.7, ease: "sine.inOut" }, cue.final + 0.78);
  t.fromTo(
    q(".d7-cyan"),
    { autoAlpha: 0, x: 70, y: 65, rotation: 20, scale: 0.65 },
    {
      autoAlpha: 1,
      x: 0,
      y: 0,
      rotation: -6,
      scale: 1,
      duration: 1.3,
      ease: "d7-paper",
      immediateRender: false,
    },
    cue.final + 0.45,
  );
  t.to(
    q(".d7-cheer"),
    { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: "d7-paper" },
    cue.final + 0.2,
  );
  strokes(cue.final + 0.35);
  t.to(camera, { x: 0, y: 0, rotation: 0, duration: 1.4, ease: "sine.inOut" }, cue.final);
  t.to(q(".d7-cry"), { autoAlpha: 0, duration: 0.7 }, 40);

  // A held, beautiful explanation ends in a coordinated fold rather than a mass opacity cut.
  t.to(
    title.chars,
    {
      y: -65,
      rotation: 8,
      scaleY: 0.2,
      rotationX: 78,
      opacity: 0,
      duration: 1.15,
      stagger: { amount: 0.2 },
      ease: "power3.inOut",
    },
    cue.exit,
  );
  t.to(
    [...co.chars, ...za.chars],
    {
      y: -45,
      rotation: -12,
      opacity: 0,
      duration: 1,
      stagger: { amount: 0.15 },
      ease: "power3.inOut",
    },
    cue.exit + 0.15,
  );
  t.to(
    feeds,
    {
      autoAlpha: 0,
      y: 50,
      rotation: 0,
      scaleY: 0.2,
      duration: 0.95,
      stagger: { amount: 0.4 },
      ease: "power3.inOut",
    },
    cue.exit + 0.3,
  );
  t.to(q(".d7-sticker,.d7-caller,.d7-wtf"), { autoAlpha: 0, y: 40, duration: 0.8 }, cue.exit);
  // The actual donor paper survives as the Information backing. Only its old lettering
  // hands off; message content and production speech timing are unchanged.
  t.to(
    donor,
    {
      x: 0,
      y: () => 540 - 622 - paper.offsetHeight / 2,
      scaleX: () => (information.offsetWidth + 72) / paper.offsetWidth,
      scaleY: () => (information.offsetHeight + 64) / 0.72 / paper.offsetHeight,
      rotation: 0,
      duration: 1.65,
      ease: "d7-camera",
    },
    cue.exit + 0.1,
  );
  t.to(
    q(".d7-donor > .motion-name,.d7-donor > .motion-amount,.d7-underline"),
    { autoAlpha: 0, duration: 0.65, ease: "sine.inOut" },
    44.5,
  );
  t.to(effects, { travel: 0, duration: 0.5 }, 45.7);
  t.to(q(".d7-spine"), { autoAlpha: 0, duration: 0.45 }, 45.2);
  const directed = finish();
  // Tier7 retains this single material plane; the shared finish remains unchanged for1–6.
  t.to(
    q(".d7-show"),
    { autoAlpha: 1, duration: 0.5, ease: "none" },
    context.treatment.analysis.duration - 0.5,
  );
  t.set(
    information,
    { xPercent: -50, yPercent: -50, x: 0, y: 20, clipPath: "inset(0% 0% 100% 0%)" },
    0,
  );
  t.to(information, { autoAlpha: 1, duration: 0.5, ease: "sine.inOut" }, 44.95);
  t.to(
    information,
    { y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "d7-camera" },
    44.95,
  );
  context.root.dataset.d7PaperHandoff = "ready";
  t.seek(0.000001, true);
  return {
    timeline: directed.timeline,
    dispose() {
      directed.dispose();
      delete context.root.dataset.d7PaperHandoff;
      splits.forEach((split) => {
        split.revert();
      });
    },
  };
}

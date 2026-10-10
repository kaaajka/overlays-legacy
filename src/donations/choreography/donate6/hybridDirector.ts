import gsap from "gsap";
import type { DirectorContext, DirectedScene } from "../../../motion/gsap/createChoreography";
import type { QualityTier } from "../../../motion/types";
import { buildScene } from "./hybrid/scene.mjs";

// Secondary payoff selects a measured onset; no unverified lyric/downbeat claim.
export const heartShots = {
  receive: 7.24463,
  center: 9.24154,
  anticipate: 11.00626,
  payoff: 12.7942,
  calm: 14.4,
  farewell: 17.2,
  align: 20.23095,
};

export function choreography({ root, treatment }: DirectorContext): DirectedScene {
  const host = root.querySelector<HTMLElement>(".d6-hybrid");
  const container = host.querySelector<HTMLElement>(".d6-renderer");
  const video = host.querySelector<HTMLVideoElement>("video");
  const image = host.querySelector<HTMLImageElement>(".source-fallback");
  const info = root.querySelector<HTMLElement>(".motion-information");
  const q = gsap.utils.selector(host);
  const duration = treatment.analysis.duration;
  const fallback = gsap.timeline({ paused: true });
  fallback.set(host, { autoAlpha: 1 }, 0);
  fallback.set(
    q(".d6-upper,.d6-lower,.source-media,.d6-reply,.scene-copy,.motion-name,.motion-amount"),
    { autoAlpha: 0 },
    0,
  );
  fallback.to(q(".d6-upper,.source-media"), { autoAlpha: 1, duration: 0.12 }, 0.06966);
  fallback.to(q(".d6-lower"), { autoAlpha: 1, duration: 0.4 }, 0.55728);
  fallback.to(q(".d6-upper,.d6-lower"), { autoAlpha: 0, duration: 0.65 }, 3.90095);
  fallback.to(q(".d6-reply"), { autoAlpha: 1, duration: 0.5 }, 5.01551);
  fallback.to(q(".d6-reply"), { autoAlpha: 0, duration: 0.5 }, 6.57125);
  fallback.to(q(".scene-copy"), { autoAlpha: 1, duration: 0.5 }, 6.57125);
  fallback.to(q(".motion-name,.motion-amount"), { autoAlpha: 1, duration: 0.5 }, 6.57125);
  fallback.set(info, { autoAlpha: 0, y: 18, scale: 0.98 }, 0);

  let scene: ReturnType<typeof buildScene> | undefined;
  let at = 0;
  let disposed = false;
  let tier: QualityTier = "high";
  let error: string | undefined;
  let information:
    | { elapsed: number; reading: number; speech?: { start: number; duration: number } }
    | undefined;
  let closing: gsap.core.Timeline;
  const degrade = (reason: unknown) => {
    error = String(reason);
    scene?.dispose();
    scene = undefined;
    host.dataset.renderer = "dom-fallback";
    root.dataset.d6Renderer = "dom-fallback";
    host.dataset.rendererError = error;
  };
  try {
    scene = buildScene(container, video, image, host.dataset.nickname, host.dataset.amount, {
      message: host.dataset.message,
    });
    host.dataset.renderer = "three";
    root.dataset.d6Renderer = "three";
    const { timeline: t, state: s, objects: o } = scene;
    // 0–8.6 seconds are the approved proof verbatim. Extend only AFTER that boundary.
    t.set(o.second, { visible: false }, 8.600001);
    t.to(
      s,
      { cameraX: 110, cameraY: 65, targetY: 25, duration: 1.15, ease: "power2.inOut" },
      9.24154,
    );
    t.to(o.hal.position, { x: -435, y: 176, z: -65, duration: 1.15 }, 9.24154);
    t.to(o.hal.rotation, { y: -0.08, duration: 1.15 }, 9.24154);
    t.to(o.aperture.position, { x: 110, y: 220, z: 40, duration: 1.15 }, 9.24154);
    t.to(o.bang.position, { x: 345, y: 176, z: -45, duration: 1.15 }, 9.24154);
    // Compress the same donor ink and perspective, then release on the measured onset.
    t.to(o.reply.scale, { x: 0.9, y: 0.9, z: 0.9, duration: 1.62, ease: "power2.in" }, 11.00626);
    t.to(s, { cameraZ: 1605, replyBend: 0.12, duration: 1.62, ease: "power2.in" }, 11.00626);
    t.to(o.reply.position, { y: -135, z: 65, duration: 1.62, ease: "power2.in" }, 11.00626);
    t.to(o.reply.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 0.42, ease: "power4.out" }, 12.7942);
    t.to(o.reply.position, { x: 0, y: -125, z: 180, duration: 0.42, ease: "power4.out" }, 12.7942);
    t.to(
      s,
      { cameraX: 0, cameraY: 0, targetY: 0, cameraZ: 1500, replyBend: 0, duration: 0.65 },
      12.7942,
    );
    t.to(o.reply.scale, { x: 1.04, y: 1.04, z: 1.04, duration: 0.85, ease: "power2.inOut" }, 13.22);
    // Restraint changes the hierarchy: upper call withdraws, footage and amount remain.
    t.to(o.hal.scale, { x: 0.58, y: 0.58, z: 0.58, duration: 1.0 }, 14.4);
    t.to(o.bang.scale, { x: 0.5, y: 0.5, z: 0.5, duration: 1.0 }, 14.4);
    t.to(s, { rx: 145, ry: (145 * 109) / 98, opening: 0.5, depth: 46, duration: 1.0 }, 14.4);
    t.to(o.aperture.position, { x: 90, y: 205, duration: 1.0 }, 14.4);
    t.to(
      s,
      { cameraX: -95, cameraY: 25, targetY: 15, duration: 1.25, ease: "power2.inOut" },
      15.90567,
    );
    t.to(o.aperture.rotation, { y: 0.14, z: -0.035, duration: 1.25 }, 15.90567);
    // Re-form the familiar bonded call, smaller, while donor ink keeps foreground priority.
    t.to(o.hal.position, { x: -340, y: 165, z: 0, duration: 1.1 }, 17.2);
    t.to(o.hal.scale, { x: 0.58, y: 0.58, z: 0.58, duration: 1.1 }, 17.2);
    t.to(o.hal.rotation, { y: 0, z: 0, duration: 1.1 }, 17.2);
    t.to(o.aperture.position, { x: 35, y: 228, z: 28.5, duration: 1.1 }, 17.2);
    t.to(o.aperture.rotation, { y: 0, z: 0, duration: 1.1 }, 17.2);
    t.to(
      s,
      {
        rx: 56.84,
        ry: 63.22,
        opening: 0,
        depth: 26.68,
        cameraX: 0,
        cameraY: 0,
        targetY: 0,
        duration: 1.1,
      },
      17.2,
    );
    t.to(o.bang.position, { x: 125, y: 165, z: 0, duration: 1.1 }, 17.2);
    t.to(o.bang.rotation, { y: 0, z: 0, duration: 1.1 }, 17.2);
    // Reading becomes the focus: the SAME donor ink settles into a compact caption,
    // its blue depth unfolds into a lower-left ribbon connected to the reaction O.
    t.to(
      o.reply.position,
      { x: -500, y: -235, z: 65, duration: 1.35, ease: "power3.inOut" },
      20.23095,
    );
    t.to(
      o.reply.scale,
      { x: 0.34, y: 0.34, z: 0.34, duration: 1.35, ease: "power3.inOut" },
      20.23095,
    );
    t.to(
      o.hal.position,
      { x: -965, y: -308, z: -170, duration: 1.35, ease: "power3.inOut" },
      20.23095,
    );
    t.to(o.hal.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 1.35 }, 20.23095);
    t.to(
      o.aperture.position,
      { x: -945, y: -308, z: 40, duration: 1.35, ease: "power3.inOut" },
      20.23095,
    );
    t.to(
      s,
      {
        rx: 47,
        ry: (47 * 109) / 98,
        depth: 20,
        opening: 0.4,
        cameraX: 0,
        cameraY: 0,
        cameraZ: 1650,
        targetY: 0,
        duration: 1.35,
        ease: "power3.inOut",
      },
      20.23095,
    );
    t.to(o.bang.position, { x: -864, y: -339, z: 15, duration: 1.35 }, 20.23095);
    t.to(o.bang.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 1.35 }, 20.23095);
    t.to(scene.chapter.state, { open: 1, duration: 1.35, ease: "power3.inOut" }, 20.23095);
    t.to(scene.chapter.state, { donorMix: 1, duration: 0.8, ease: "power2.inOut" }, 20.63095);
    t.to(
      scene.chapter.group.position,
      { x: -500, y: -388, z: 10, duration: 1.35, ease: "power3.inOut" },
      20.23095,
    );
    t.to({}, { duration: 0.01 }, duration - 0.01);
    closing = gsap.timeline({ paused: true });
    closing.fromTo(
      scene.chapter.state,
      { open: 1 },
      { open: 0, duration: 0.34, ease: "power3.in", immediateRender: false },
      0,
    );
    closing.fromTo(
      o.rig.position,
      { x: 0, y: 0, z: 0 },
      { x: -150, y: 690, z: -1300, duration: 0.65, ease: "power3.in", immediateRender: false },
      0,
    );
    closing.fromTo(
      o.rig.scale,
      { x: 1, y: 1, z: 1 },
      { x: 0.015, y: 0.015, z: 0.015, duration: 0.65, ease: "power3.in", immediateRender: false },
      0,
    );
    closing.fromTo(
      o.rig.rotation,
      { y: 0, z: 0 },
      { y: 0.32, z: -0.18, duration: 0.65, ease: "power2.in", immediateRender: false },
      0,
    );
  } catch (cause) {
    degrade(cause);
  }

  const render = () => {
    if (!scene || disposed) return;
    try {
      if (scene.renderer.getContext().isContextLost()) throw Error("WebGL context lost");
      scene.objects.rig.position.set(0, 0, 0);
      scene.objects.rig.scale.set(1, 1, 1);
      scene.timeline.time(0, true).time(Math.max(0.000001, Math.min(duration, at)), true);
      if (information && information.elapsed > information.reading)
        closing.time(0, true).time(Math.min(0.65, information.elapsed - information.reading), true);
      scene.chapter.update(
        information?.elapsed ?? 0,
        information?.reading ?? 6,
        information?.speech,
      );
      // Arithmetic through millisecond inputs can place an exact endpoint a few
      // floating-point bits before reading + outro. Clear that endpoint reliably.
      if (at === 0 || (information && information.elapsed + 1e-9 >= information.reading + 0.65))
        scene.state.alpha = 0;
      scene.render(video.dataset.mediaState);
    } catch (cause) {
      degrade(cause);
    }
  };
  // Decode completion repaints the SAME sampled time; it cannot advance the choreography.
  video.addEventListener("seeked", render);
  video.addEventListener("loadeddata", render);
  image.addEventListener("load", render);
  const lost = (event: Event) => {
    event.preventDefault();
    degrade("WebGL context lost");
  };
  const canvas = scene?.renderer.domElement;
  canvas?.addEventListener("webglcontextlost", lost);
  const api = {
    snapshot: () => ({
      renderer: scene ? "three" : "dom-fallback",
      quality: tier,
      error,
      at,
      information,
      ...(scene?.snapshot() ?? {}),
      disposed,
    }),
  };
  // Read-only diagnostic used by production QA, independent of Studio's transport API.
  Object.assign(host, { donation6: api });
  root.dataset.d6Handoff = "ready";
  // Initialize zero-duration sets before a first direct jump can lazily capture tween starts.
  fallback.seek(0.000001, true);
  return {
    timeline: fallback,
    renderAt(time) {
      information = undefined;
      at = time;
      fallback.time(0, true).time(Math.max(0.000001, Math.min(duration, at)), true);
      render();
    },
    informationAt(elapsed, reading, speech) {
      at = duration;
      information = { elapsed, reading, speech };
      if (scene) {
        host.style.opacity = "1";
        host.style.visibility = "visible";
        render();
      } else {
        host.style.visibility = "hidden";
        info.style.opacity = String(Math.max(0, Math.min(1, 1 - (elapsed - reading) / 0.65)));
        info.style.visibility = "visible";
        info.style.transform = "translate(-50%,-50%)";
      }
    },
    resize() {
      render();
    },
    setQuality(quality) {
      tier = quality;
      if (scene) {
        const scale = quality === "high" ? 1 : quality === "medium" ? 0.75 : 0.5;
        scene.renderer.setSize(1920 * scale, 1080 * scale, false);
        render();
      }
    },
    clear() {
      at = duration;
      scene?.renderer.clear();
    },
    dispose() {
      disposed = true;
      video.removeEventListener("seeked", render);
      video.removeEventListener("loadeddata", render);
      image.removeEventListener("load", render);
      canvas?.removeEventListener("webglcontextlost", lost);
      scene?.dispose();
      closing?.kill();
      scene = undefined;
      fallback.kill();
      delete root.dataset.d6Handoff;
      delete root.dataset.d6Renderer;
      delete (host as HTMLElement & { donation6?: typeof api }).donation6;
    },
  };
}

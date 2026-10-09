// Authoring entry only; production scenes never import this module.
export async function loadEditorTools() {
  if (!import.meta.env.DEV) throw new Error("Motion editor tools are development-only");
  const [flip, draggable, observer, inertia, devtools, pathHelper] = await Promise.all([
    import("gsap/Flip"),
    import("gsap/Draggable"),
    import("gsap/Observer"),
    import("gsap/InertiaPlugin"),
    import("gsap/GSDevTools"),
    import("gsap/MotionPathHelper"),
  ]);
  return { ...flip, ...draggable, ...observer, ...inertia, ...devtools, ...pathHelper };
}

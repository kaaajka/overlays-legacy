// Curated lazy factories: requesting one treatment does not load/register all filters.
export const motionFilters = {
  rgbSplit: () => import("pixi-filters/rgb-split"),
  glitch: () => import("pixi-filters/glitch"),
  shockwave: () => import("pixi-filters/shockwave"),
  zoomBlur: () => import("pixi-filters/zoom-blur"),
  radialBlur: () => import("pixi-filters/radial-blur"),
  motionBlur: () => import("pixi-filters/motion-blur"),
  pixelate: () => import("pixi-filters/pixelate"),
  // These primitives ship in Pixi core, not pixi-filters.
  core: () =>
    import("pixi.js").then(({ DisplacementFilter, BlurFilter, NoiseFilter }) => ({
      DisplacementFilter,
      BlurFilter,
      NoiseFilter,
    })),
};

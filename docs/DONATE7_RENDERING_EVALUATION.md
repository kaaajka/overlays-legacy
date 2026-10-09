# Donate7 — package / rendering evaluation

**Superseded money treatment — 2026-10-08:** the latest explicit user brief rejects the Canvas money motion described in this historical record. Current Donate7 uses full-screen Pixi BACK/MID/FRONT rain, with no banknote repulsion or side lanes. Centered typography, original green PNG and Gold timing remain. See [current architecture, QA and delivery](MOTION_TOOLBOX_PIXI.md) and `assets/donate7-pixi/` for current evidence. Earlier Canvas-only dependency conclusions and facecam-clearance acceptance do not authorize the current money design.

Renderer candidates were installed only in ignored `.motion-qa/pixi-evaluation/`. After delegated composition selection and the fresh silhouette review, production adds **only DynaPuff5.3.0 and RobotoFlex5.3.0**; the initial Anybody candidate was removed. Pixi version8.22.0 and filters6.1.5 were checked against the registry and current official documentation on2026-10-08.

## Controlled renderer comparison

[Raw results](assets/donate7-definitive/renderer-benchmark.json). Headless Chromium, DPR1, **ANGLE Vulkan SwiftShader**, same cached48×24 banknote texture, same positions/rotation/scale/alpha evaluated from explicit absolute `time`. 20warmup/50measuredframes per case. Pixi WebGLRenderer is called explicitly; no Application/Ticker loop. One renderer at a time; no ASR, analysis or recording workload during the final run. CPU submission includes scene property updates and draw submission; cadence also includes compositor/raster overhead. JS heap omits GPU/native memory. This is a synthetic single-layer billboard test, not the final show, three-depth composite or actual RTX3070/OBS benchmark.

| Output / sprites | Canvas CPU p95 | Pixi CPU p95 | Canvas frame p95 | Pixi frame p95 |
|---|---:|---:|---:|---:|
|1920×1080 /480|1.10ms|0.30ms|17.70ms|23.20ms|
|1920×1080 /1200|3.10ms|1.00ms|57.60ms|49.70ms|
|3440×1440 /480|1.60ms|0.50ms|20.90ms|33.40ms|
|3440×1440 /1200|3.20ms|1.40ms|54.10ms|61.60ms|
|5120×1440 /480|1.40ms|0.50ms|28.10ms|42.30ms|
|5120×1440 /1200|4.00ms|1.40ms|64.60ms|66.20ms|

Pixi reduces CPU submission substantially, but does not improve end-to-end cadence in five of six cases on this software-GPU host. The exception is dense1080p. This does not justify replacing the production renderer everywhere or promising60FPS. Existing Version A Canvas also has expensive per-object vector drawing rather than this cached-texture strategy; the first production optimization is caching authored textures and reducing needless full-surface raster work. The candidate remains relevant if a substantially denser final comp requires it and target GPU measurements support it.

## Dependency decisions

| Candidate | Visual quality | Performance | Determinism | Maintenance / decision |
|---|---|---|---|---|
|[pixi.js](https://pixijs.com/8.x/guides/components/application)|Batched textured cash/paper/spark sprites and long trails can support the designed effect; it does not invent art direction.|CPU gains measured; software-GPU cadence often worse. Hardware result unknown.|Use explicit `renderer.render`, absolute-time analytic coordinates, finite seed inventory; no elapsed delta accumulation. Disable ticker if using Application.|**Evaluate, don't add yet.** Async init, context-loss, texture disposal and fallback must earn their added complexity. Only scope to tier7 if adopted.|
|[GSAP PixiPlugin](https://gsap.com/docs/v3/Plugins/PixiPlugin/)|Useful for authored camera/container scale/skew/tint; not required for thousands of analytic particle positions.|Existing GSAP package, no second engine; registration can be scoped.|Paused timeline seeks Pixi objects; render only after sampling. No ticker.|Compatibility/reconstruction prototype is recorded separately. Use only alongside an adopted Pixi renderer; no empty registration in production.|
|[pixi-filters](https://github.com/pixijs/filters)|CRT/RGBSplit/bloom could be useful briefly, but filtering the original source can distort its intended colors. Existing precise SVG/graphic echoes can carry the punctuation.|Extra render-to-texture passes and filter areas cost fill rate; no justification for permanent full-stage filters.|Any filter time/seed must be authored from music time; animation/noise defaults cannot run their own clock.|**Do not add for now.** If a chosen effect needs a shader, import one filter path, constrain its area/time and omit it inSAFE. Pixi8 pairs with filters6.|
|[Fontsource variable fonts](https://fontsource.org/fonts/dynapuff)|Final DynaPuff replaces the initial Anybody candidate because rounded glyph silhouette serves the actual comp; weight400–700/width75–100. RobotoFlex offers clear donor digits and optical sizing.|Local WOFF2. Axis changes limited to short designed gestures, since font raster/layout is not free.|Load before preparing/recording/export. Width allocation uses maximum authored extent and stable readable holds.|**Added DynaPuff5.3.0 and RobotoFlex5.3.0 only.** Packaged OFL, Latin-ext ranges and loaded Polish glyph check verified. Information Poppins remains.|
|[opentype.js](https://opentype.js.org/)|Raw glyph paths can support contour morphs, but the current proposed performance needs glyph masks, baseline and axes, not morphing every contour.|Adds parsing/path generation, shaping and storage cost.|Precomputed paths could be stable, but arbitrary user names require Unicode/layout care.|**Do not add.** Live glyphs plus a few authored SVG shapes are sufficient. If later needed, use a build-time conversion, not runtime font parsing.|

No generic confetti/preset package, second animation/audio clock or physics engine is needed. Browser fill-rate, DOM/SVG effects, video decode and OBS gameplay load are separate from JavaScript submission. The next complete show must be benchmarked at all qualities; this table cannot substitute for that evidence.

Evaluation helpers are ignored and not part of runtime or the shipped dependency graph. Raw result JSON and these reasoned decisions are retained as evidence.

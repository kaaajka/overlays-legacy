# Motion toolbox and Donate7 Pixi money rain

The latest user brief explicitly rejects the handcrafted money trajectories and overrides the earlier Canvas evaluation/side-lane acceptance. This pass preserves the centered DynaPuff/Roboto Flex title/donor composition, original source, emotes,15.49932s POJEB payoff,37.65116s amount priority and complete existing lifecycle. Money is replaced architecturally with full-screen Pixi rain. Earlier `donate7-definitive` evidence is historical, not acceptance of the new money system. The subsequent user request raises the creative target further: [connected paper stage](DONATE7_SHOWPIECE.md). Final evidence is `assets/donate7-showpiece/`; `donate7-pixi/` preserves the preceding competent rain implementation.

## Installed toolbox and import boundaries

Verified installed GSAP3.15.0. Added PixiJS8.22.0, pixi-filters6.1.5 and Three0.186.1. React17 and the existing Web Audio transport are unchanged. Three is deliberately provisioned for future genuinely3D scenes; no Donate7 Three scene or second clock is introduced. No @pixi/react, generic confetti preset, second audio/animation engine or general physics engine.

`src/motion/toolbox/choreography.ts` offers explicit named exports for GSAP, MotionPathPlugin, SplitText, DrawSVGPlugin, MorphSVGPlugin, CustomEase, CustomBounce, CustomWiggle, RoughEase (from `gsap/EasePack`), and ScrambleTextPlugin. `pixi.ts` offers Pixi's renderer/containers/particles/textures and GSAP PixiPlugin. `physics.ts` exposes Physics2DPlugin. There is no blanket plugin registration or universal runtime import. Scene modules register what they use.

`editor.ts` lazy-loads Flip, Draggable, Observer, InertiaPlugin, GSDevTools and MotionPathHelper only behind `import.meta.env.DEV`. No production scene imports this entry. Exact GSAP3.15.0 subpath imports were executed successfully, including every requested plugin. The production bundle is scanned for development helpers. Installed availability does not mean scene usage.

`filters.ts` provides separate lazy imports for RGB split, glitch, shockwave, zoom blur, radial blur, motion blur and pixelation. Displacement, BlurFilter and NoiseFilter come from Pixi core. Donate7 uses one transient **custom GLSL paper-fold matte** around28.6–32.02s on HIGH/MEDIUM. It closes around the same620px seam as the visible folded lettering and reaction tabs, then opens them together. SAFE keeps the visible material hinge and uses an opacity envelope. Sprite poses and texture colors remain unchanged. No permanent RGB/glitch, blur or noise is added. The core filter pipeline is explicitly registered with `pixi.js/filters` because renderer auto-imports are disabled. Toolbox availability is retained for later tier work.

## Architecture and professional primitive decisions

Web Audio position → absolute show time → paused GSAP score → Pixi/DOM/SVG/Canvas renderers. No Pixi Application, auto render loop or Ticker is created by the scene. Pixi8.22 internally attaches interaction and scheduler listeners even when no Application is used; this implementation detaches the decorative event target and shuts down its unused scheduler after disabling automatic GC. Empty shared/system tickers are stopped, without stopping listeners owned by another consumer. Diagnostics and tests read actual ticker state/counts.

The money renderer is imported lazily only for tier7. The final bundle audit records the emitted chunk names; bundler naming can use a shared worker-capable Pixi entry name. One WebGLRenderer, one original PNG texture, and three ParticleContainers form BACK/MID/FRONT. Lightweight Particle objects provide batched GPU sprite rendering with dynamic position/rotation/vertex/color data. Pools reuse particle objects; no React/DOM node per banknote and no GSAP tween per tiny bill. All three depth planes sit behind the semantic show layer: the large, fast sparse foreground notes still give near-camera depth, while the title and opaque donor paper naturally occlude them. This replaces trajectory avoidance with normal layer ordering.

| Behavior | Primitive and decision |
|---|---|
|Hundreds of textured banknotes|Pixi ParticleContainer/Particle/Texture, three depth pools; original green PNG only|
|Musical envelope / final foreground restraint|One paused GSAP score; PixiPlugin animates foreground-container alpha at amount priority and recovery|
|Terminal paper fall and flutter|Finite seeded emission inventory, closed-form fall speed/drift/rotation/squash sampled at absolute time. Physics2D is ballistic acceleration/friction, not a complete terminal flutter model; one tween per bill would add hundreds of timeline targets without removing seeded paper modeling. Explicit analytic sampling is appropriate to batched particles and never accumulates frame delta.|
|Authored reaction/sticker paths|Existing GSAP MotionPath phrase arcs retained|
|Glyph performance / drawing|SplitText, CustomEase, DrawSVG and MorphSVG animate the continuing paper/thread/letter forms|
|Ballistic spark primitive|Physics2D prototype test proves direct/backward paused seek reconstruction. It is available for future authored bursts. This scoped pass retains the accepted radial firework/streamer stroke choreography; money does not inherit those equations. No Physics2D runtime usage is claimed.|
|Continuous paper-thread transformation|MorphSVG retains one shape inventory across recruitment, title, fold and amount underline|
|Future3D / editor manipulation|Three / DEV editor modules available; not claimed as active Donate7 tools|

Official references: [Pixi renderers](https://pixijs.com/8.x/guides/components/renderers), [ParticleContainer](https://pixijs.com/8.x/guides/components/scene-objects/particle-container), [Physics2D](https://gsap.com/docs/v3/Plugins/Physics2DPlugin/), [Pixi filter API](https://pixijs.io/filters/docs/). Exact local8.22 declarations/source additionally establish scheduler/event cleanup behavior; the particle API version is lockfile-pinned because Pixi describes it as evolving.

## Money movement and score

Every bill is born above the frame at a seeded y between−220 and−80 and x spanning−100 through logicalWidth+100. It falls past the bottom under positive depth-specific velocity, with restrained horizontal drift, independent rotation, flutter phase/amplitude/frequency, perspective squash, size and opacity. BACK falls115–190logicalpx/s at28–48px size; MID200–350px/s at55–93px; FRONT510–730px/s at145–225px. MID has the largest population. The same model covers the complete widened logical viewport at21:9/32:9.

No banknote reads donor/title bounds, changes path near letters, uses a collision field, or uses corner/fountain/sweep equations. Existing Canvas spectacle excludes every `bill` cue; original money drawing/side-lane/repulsion code is removed from that renderer. Its separate confetti/ribbons/sparks preserve their existing motion language.

| Time | Money state |
|---:|---|
|3.6|First sparse bills|
|8.1|Build|
|12.3|Recognizable rain|
|15.49932|Hero storm|
|18.4|Reduced emission for donor reading|
|22.89488|Renewed storm|
|28.6|Low-emission calm; existing bills continue falling|
|30.26721|Rebuild|
|36.2|Final approach|
|37.65116|Amount priority; strong foreground alpha reduction|
|38.85|Final money storm|
|41.6|Afterglow; stock continues its downward exit|
|43.75|Stop new emission; global fade44.25–46.15|
|46.23397|Empty money/hero, existing Information/TTS lifecycle|

GSAP is sampled at candidate birth times when building the finite inventory, then at absolute audio time during playback. A note's existence never depends on previous frames, seek direction or frame rate. Existing particles complete their fall as density decreases; there is no instantaneous population teleport. Scale/opacity respond to score envelopes; foreground restraint and depth ordering protect the amount without bending paths.

## Failure, ownership and diagnostics

Initialization/import/context/render failure is explicit (`loading`, `ready`, `degraded`, reason). Money can disappear in degraded mode; source media, semantic donor/name, TTS and queue completion remain. No silent Canvas money fallback. Studio reports actual PIXI/WebGL version, GSAP/Web Audio, active plugin roles, filters, sprites by depth, quality/budget, CPU submission time, renderer count and ticker status. Draw calls are reported unavailable rather than invented from container count.

Initialization is cancellable across unmount/font rebuild/tier or quality changes. Late WebGL initialization releases its owned renderer if cancelled. Cleanup kills the money score, disposes owned texture/particle containers, removes context listeners, destroys the renderer and resets the canvas. The CLI exporter waits until tier7 renderer initialization settles before sampling frames. Filter resources and the frame texture pool remain bounded through renderer recreation. Hidden/Information and exact-zero paths clear money; seed replay and renderer recreation retain one instance.

## Verification status and acceptance

The pre-camera Pixi baseline passed333 units and87 browser tests. Current showpiece validation adds the reversible shader/fold test and measured shared-rig geometry; final totals below supersede that baseline. No development GSAP helpers or Three renderer code is included in the production scene; the explicit emitted-bundle scan and executed17-plugin import audit are archived with current evidence.

The environment can inspect rendered frames and real playback/capture data, but does not provide a reliable perceptual listening feed. Human1× musical/creative acceptance and real OBS-under-gameplay hardware performance cannot be claimed from automated tests or headless captures. This limitation remains explicit in the final report; new money visual evidence supersedes the rejected old side-lane verdict.

## Final refinement delivery

The frozen runtime passed fresh typecheck, **334 unit tests in36files**, **88 browser tests**, lint (0errors,44warnings,38infos) and production build (existing main-chunk size warning). [Validation record](assets/donate7-showpiece/validation.json) includes command results and runtime file hashes; adjacent logs preserve their output. The [17-plugin import and production bundle audit](assets/donate7-showpiece/toolbox-bundle-audit.json) confirms explicit imports and no development helpers or Three renderer signatures in production.

The scoped reviewer resolved all five material findings and returned **ship for owner review**. The [final report](DONATE7_FINAL_REVIEW.md) links full actual1× playback with audio, the before/after transition comparison, matched frames, current export/performance proof and remaining uncertainties. The owner explicitly requires this visual review before branch finalization: no new commit/push or owner creative acceptance is claimed.

# Donate7 definitive — direction and implementation record

**Superseded money treatment — 2026-10-08:** the latest explicit user brief rejects the Canvas money motion described in this historical record. Current Donate7 uses full-screen Pixi BACK/MID/FRONT rain, with no banknote repulsion or side lanes. Centered typography, original green PNG and Gold timing remain. See [current architecture, QA and delivery](MOTION_TOOLBOX_PIXI.md) and `assets/donate7-pixi/` for current evidence. Earlier Canvas-only dependency conclusions and facecam-clearance acceptance do not authorize the current money design.

**Final continuation correction (2026-10-08):** the user's centered-composition and original-money requirements supersede the initial left-biased probe described below. Production is centered at the logical frame midpoint at every aspect ratio: headline555+extra×0.5,width810; donor605+extra×0.5,width710. Name and amount are centered on that same paper. Padding48/36/30 keeps the full name inside the actual raster backing, including its transparent torn edge. Cash draws the unchanged green `src/assets/images/effects/banknote-particle.png`, preserving its square transparent margins, with no generated/geometric substitute. Runtime bytes match the source SHA256. DynaPuff/Roboto Flex remain the final fonts. Donate7 waits for font loading before SplitText measurements. Current evidence is `assets/donate7-definitive/round-centered-final/`; earlier iterations below are historical decisions, not current acceptance frames.

Version A is preserved at branch `michal-szwindowski/donation-motion-engine`, HEAD `2f372da3b5f8a1cadab5cacc14f2d3d42550728b`, verified equal to remote after push. Starting working tree was clean after securing implementation `842f6ac` and documentation/evidence `2f372da`. No reset, revert or main merge. This file records a proposal, not visual acceptance.

## Legacy actually used

The original `Donate7.tsx` has **one** webcam image, 150 money elements and 30 HALO elements. It does not have a monitor wall, fireworks or confetti. The latter are later creative interpretations, not inherited original effects. Original SCSS stages eight HALO flights from 8–11.5s, then 22 peripheral arrivals from 11.8s in 50ms steps. CO enters 13.3s, ZA 13.9s, POJEB 14.5s; webcam 15s, donor 15.7s, message 16.4s. The phrase flashes repeatedly, donor pulses, money keeps falling. Source display is 300px (native source 120px). The joke is an embarrassing public interruption: strangers calling HALO from every side, then the disproportionate donor reaction.

[Original component reconstructed with its SCSS, GIF and actual local audio](assets/donate7-definitive/legacy-original-reconstructed.mp4). It captures the 46.23s music stage; original provider TTS/network orchestration is excluded. [Legacy timing frames](assets/donate7-definitive/legacy-contact.jpg). Compile-time Sass randomness remains original; this video is a historical observation, not deterministic export certification.

Keep: small expressive source, HALO approaching from the edges, three-part statement, amount as the explanation, absurdity. Reinterpret: a designed peripheral chorus, a physical glyph performance, one coherent amount reveal. Replace: permanent flashing, uniform indefinite rain, unreadable red/yellow text. Information stays in the existing modern lifecycle.

## Version A critique

Keep the music clock, seek/export reconstruction, finite seeded inventory, continuous donor-relative routes, bounded source playback, responsive geometry and cleanup. Replace the stationary left headline/right monitor wall, identical headline reprises and repetitive shower. Version A shifts the attention to a group of bezels rather than the original joke, suppresses the HALO chorus, and spends its first major hit at 13.21215s while bass/percussion have not yet entered. Its poster-like settled frames are readable but do not develop the central dramatic statement. Its own full playback remains archived [here](assets/donate7-creative/donate7-full-realtime-audio.mp4).

## Research that changes decisions

- [BUCK / Playgrounds In Motion](https://buck.co/work/playgrounds-in-motion): a simple graphic motif becomes motion and a media aperture across different materials. Apply a reaction cutout that turns into a webcam frame, type backing and amount stage; don't copy their logo, palette or waves.
- [BUCK / LinkedIn Celebrations](https://buck.co/work/linkedin-celebrations): celebrations carry distinct metaphors rather than one effect recolored. Apply different jokes to HALO, title, donor and finale; don't copy illustrations or their brand blue.
- [Nexus / In Motion titles 2025](https://nexusstudios.com/work/playgrounds-in-motion-titles-2025/): the published description uses a kinetic infinite zoom through contrasting styles. Apply eye-trace continuity between chapters and measured scale changes; don't copy the sequence or require a constant zoom over gameplay. Site fetch was incomplete; not claimed as a complete video viewing.
- [GSAP timelines](https://gsap.com/docs/v3/GSAP/Timeline/): nested editorial sequences at absolute labels, paused and sampled at music time. One main action can continue while secondary beats happen around it.
- [SplitText masks](https://gsap.com/docs/v3/Plugins/SplitText/masks/): per-glyph masking enables a deliberate reveal and clean holds. Scope glyph choreography to the music stage; Information is excluded.
- [CustomEase](https://gsap.com/docs/v3/Plugins/CustomEase/), [DrawSVG](https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/), [MotionPath](https://gsap.com/docs/v3/Plugins/MotionPathPlugin/): weighted type, drawn impact accents and long sticker arcs. Different material means different timing, not one shared bounce.
- [MorphSVG](https://gsap.com/docs/v3/Plugins/MorphSVGPlugin/): useful for an owned reaction backing morphing into an amount enclosure. A small fixed path can be precompiled; hundreds of glyph paths are unnecessary.
- [Physics2D](https://gsap.com/docs/v3/Plugins/Physics2DPlugin/): evaluate for a few special objects. Dense particles already have analytic gravity/drag and don't need thousands of new GSAP tweens.
- [quickSetter](https://gsap.com/docs/v3/GSAP/gsap.quickSetter()/): useful in the renderer bridge; `quickTo` starts timed tweens and is unsuitable as a second response clock here.

These are source-backed principles and design interpretations; a text case study does not prove subjective normal-speed motion quality. This tool environment does not provide a reliable perceptual audio feed. Full audio captures are supplied for actual human listening; no completed ten-pass human listening review is claimed.

## Chosen visual world / compositional probes

Mechanism: a tiny familiar webcam makes an absurd public scene out of a donation, then the digits explain the commotion. Audience: Kaaajka viewers watching Rocket League through a transparent OBS alert. Cultural home: bunny reaction stickers, handwritten asides, Polish meme typography and warm peach/pink streamer identity.

Seven grounded carriers: (1) concert announcement lettering, (2) film-strip reaction montage, (3) comic reaction panels, (4) a playful thank-you receipt, (5) a reaction scrapbook of cutout letters and webcam inserts, (6) a crowd of handwritten HALO calls, (7) a small broadcast camera prank. Direction seed `701ff517` assigns candidate 5. Catalog alternatives do not override the original-colored webcam and the brief's rejection of generic audio visualizers/neon HUDs. The working direction is **reaction scrapbook**: berry ink, peach/pink cutout planes, ivory type and restrained cyan from the actual bunny assets, transparent gameplay between them. Form is expressive typography and moving apertures, not decorative scrapbook props.

Three same-world probes will vary topology: fan-stage amount, editorial comic stack, and a diagonal reaction procession. The brief explicitly asks the agent to decide whether to reinvent the wall (section30) and to change weak Version A creative decisions (section58); selection will be recorded as a delegated design choice, not owner visual approval. No generated replacement webcam or bunny will ship. Generated mock lettering is a comp; production glyphs are live addressable font text/SVG.

Typography candidates: [Anybody](https://fontsource.org/fonts/anybody), OFL1.1, Latin/Latin-ext, weight100–900 and width50–150. Its rounded heavy forms suit exaggerated bunny reactions and controlled width pressure. [Roboto Flex](https://fontsource.org/fonts/roboto-flex/install), OFL1.1, is the donor/amount candidate for optical size/width/weight without sacrificing Polish glyphs. Existing Poppins remains Information. Verify the actual packaged glyph set and local loading before production use; no CDN dependency.

## Delegated selection and ingredient inventory

Three generated comps are preserved in `.impeccable/mocks/donate7-definitive-comp-{1,2,3}.png`. **Comp1 selected** under the explicit sections30/58 delegation; owner visual approval remains false. Comp2's narrow stack forces a small POJEB, while comp3 disperses the explanation across the viewport. Comp1 gives one broad statement and one explanatory donor strip while keeping the actual right facecam unobstructed. Generated faces, invented currency detail and oversized bunny are defects in the comp, replaced with supplied originals. The type silhouette uses obtainable Anybody (900/width85) rather than painted letters.

| Ingredient / commitment | Runtime medium |
|---|---|
| Wide CO ZA over POJEB; ivory berry outline, pink extrusion; statement~740px wide | Live per-glyph Anybody variable font, CSS contour and soft offset shadow |
| Three small footage inserts upper-left, upper-right, lower-left around letters | Original source120px, three synchronized SourceMedia apertures, at most176px main |
| Peach torn donor strip, name above berry/pink amount, generous padding; ~690×215px | Generated raster backing with transparent edges; semantic Roboto Flex live text |
| Tiny bunny reactions near donor and corner; never replacement illustrations | Unmodified supplied PNGs,56–90px |
| Peripheral HALO chorus, hand-like italic angle | Addressable Anybody italic glyphs, distinct curved moves |
| Banknotes, curved streamers, finite firework accents | Cached geometric Canvas sprites / continuous analytic routes, no hidden kill rectangle |
| Quiet transparent gaps / right facecam clear | No opaque fullscreen panel, no CRT wall |

Self-hosted Anybody5.3.0 and Roboto Flex5.3.0 added only after this selection: shape and variable-axis range directly serve the chosen typography. GSAP PixiPlugin8.22/3.15 paused-seek compatibility is [verified](assets/donate7-definitive/pixi-plugin-probe.json), but does not justify adding Pixi to production after the software-GPU cadence results.

### Finish-review typography correction

The first live comp used Anybody, but the fresh review identified its squared silhouette as a material mismatch with the rounded original reaction world. **Final production replaces Anybody with [DynaPuff Variable5.3.0](https://fontsource.org/fonts/dynapuff)**, OFL1.1, Latin-ext, weight400–700 and width75–100. Roboto Flex5.3.0 remains only for clear donor/amount semantics. Production has two font packages; the discarded candidate is removed from package/lock. DynaPuff uses rounded inflated forms, not a system-font substitute; all glyphs remain live/addressable. Final setup158px/title132px fits the actual stage. Earlier pre-animation and round1/2 evidence is explicitly historical Anybody iteration evidence, not the final font.

## Current gates

Prototype package/rendering results and the music score are separate evidence. Two choreography iterations and chapter/attack/responsive stress frames are implemented. The follow-up brief explicitly confirms the first composition and **synthesis** with hierarchy/breathing from2 and continuous eye-flow from3, overriding literal comp reproduction. Source lyric text and local timing/meaning approval remain separate; failed ASR corroboration cannot become a semantic effect. Owner normal-speed visual/music approval and real target OBS performance remain final acceptance gates.

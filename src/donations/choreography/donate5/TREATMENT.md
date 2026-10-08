# Donate5 - Arms-wide ovation

## Source GIF

`public/assets/donations/gif/donation-template-05.gif`: 480x270, 42 frames, 3.36s, infinite loop. Sunglasses-wearing man raises both arms in a crowd; red/amber venue and light shirt.

Characteristic motion/gesture: Wide celebratory arms, subtle head turn; open pose at 2.00s. Keep hands and crowd context. Hero source time: **2.0s**. Opaque source: retain the environment in a bounded media window and keep the rest of the broadcast transparent.

## Source music

Authoritative template5, 16.34508s, estimated 129.199 BPM. Strong measured spectral-flux transients: 0.06966s, 0.99846s, 1.23066s, 3.01859s, 3.48299s. These are observations, not audible drop labels. Existing authored hero **4.82975s** remains fixed. firstImpact/donorReveal/buildStart/preDrop/settle retain current cue map and exact track/gain. Tension is visual restraint at preDrop; payoff occurs at hero, not every beat. No reliable downbeats asserted. Audible GIF/music interpretation needs manual listening approval; analysis supplies timing evidence, not certainty about musical genre.

## Legacy DNA

Timed HOLY/MOLY call-and-response and OMG. Preserve the selected subject and emotional joke rather than mechanically reproducing CSS.

## New concept

An arms-wide panorama with opposing word wings and a stage-lip amount.

## Localized storyboard (production v2.2)

- 0.000s: fully transparent public stage, including loading and restart/reverse seek.
- 0.050s–0.150s: source entry; INITIAL capture is 150ms and is distinct from ZERO.
- 0.99846s · firstImpact: media enters in its characteristic direction; no independent visual timer.
- 1.23066s · donorReveal: Name sits above crowd; amount lands below faces, confetti supports the ovation.
- 3.01859s · buildStart: panorama opens and word wings lift.
- 4.53s · preDrop: source holds the characteristic pose, reduce secondary motion.
- 4.82975s hero: selected source pose, amount and signature technique land together.
- hero+50ms: release begins while subject, name and amount remain readable.
- 7.12853s · settle: source loop resumes; dramatic detail falls away.
- 16.34508s end: media unloads, spectacle hides and full readable information takes over.

## GIF usage

Bounded 600x338 source window at (475,365), about 1.25x the 480x270 original. The 420px donor/amount stack is beside it at (1120,440). Handwritten HOLY/MOLY uses two 280x187 CSS windows at x475/x780, y207, preserving the existing opposing wing gestures. Native 56px cyan reply at (1030,723) enters at hero+0.1s over 0.3s. No full-screen panorama. All geometry is direct logical 1920x1080, uniformly fitted to the viewport; no previous per-scene assembly scale applies. No generated/replacement footage. Source loops against music time, holds the chosen pose from hero-0.12s (bounded by preDrop) until hero+0.1s, then resumes from that pose and loops. Echoes use authored source offsets. Original GIF fallback preserves recognizable content but cannot guarantee exact source-frame synchronization. Poster is an unmodified source frame.

## Nickname and amount

Name sits above crowd; amount lands below faces, confetti supports the ovation. Dynamic Polish amount/currency preserved; shared name/amount anchor has a 24px gap. Name is fitted to 28–44px and wraps in full; amount is fitted to at most 112px and the stack width. See DESIGN.md and PRODUCTION_22_DIRECTION.md for exact formulas. Amount's exact cue is **4.82975s**. The source cannot be swapped with another tier without breaking the joke, spatial balance and chosen gesture.

## Message / information state

Use the shared intrinsic Information card: content width 560–960px, natural height capped at 600px, fixed header and body-only slow overflow scrolling with opening/final holds. Complete plain text and explicit allowlisted image runs retain line breaks and stable 45px emote slots; frame selection follows information time, without a private animation loop. Keep existing nickname -> amount -> message TTS and queue completion. Hide and unload media/effects at information; no ongoing decode when idle.

## Unique signature technique

An arms-wide panorama with opposing word wings and a stage-lip amount. This is the main idea only for this tier.

## Performance budget

Maximum 1 paused video decoders at original source dimensions. Coalesced frame-cadence seeks, bounded preload and latest-clock recovery. Canvas2D cash uses absolute-time authored waves; HIGH/MEDIUM/SAFE total caps 72/40/14, with Donate6 capped at 12. SAFE preserves the cash signature. No blur stack or DOM particle forest. Video sources/listeners release at information/unmount. WebM is selected for control, not a promise of smaller files: opaque files use audited visually lossless VP9 CRF 4; the transparent dancer retains lossless alpha. Do not sacrifice selected content fidelity.

## Production-v2 extension

The logical geometry above is the current directly authored production-v2.2 footprint; only uniform viewport fitting applies. See PRODUCTION_22_DIRECTION.md and KAAAJKA_BRAND_DIRECTION.md. Original hero/music/source-pose times are unchanged. Music Intelligence v2 adds estimated beat/downbeat motifs, explicitly authored section regions and bounded source reactions from measured vocal-energy peaks. Important guessed lyrics remain unapproved; no automatic lyric captioning occurs. Cash/brand/footprint decisions and current media bytes are documented in the production-v2 brand/media audits.

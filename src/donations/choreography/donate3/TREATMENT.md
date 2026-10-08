# Donate3 - Rodent rave

## Source GIF

`public/assets/donations/gif/donation-template-03.gif`: 320x240, 10 frames, 0.44s, infinite loop. Brown dancing rodent/puppet before a shop; ochre fur, dark ground and violet sign.

Characteristic motion/gesture: Frantic torso turn/hip wiggle in10 frames/0.44s; pose at 0.20s. Little internal text space. Hero source time: **0.2s**. Opaque source: retain the environment in a bounded media window and keep the rest of the broadcast transparent.

## Source music

Authoritative template3, 11.6s, estimated 129.199 BPM. Strong measured spectral-flux transients: 0.1161s, 2.02014s, 2.94893s, 4.82975s, 5.06195s. These are observations, not audible drop labels. Existing authored hero **4.82975s** remains fixed. firstImpact/donorReveal/buildStart/preDrop/settle retain current cue map and exact track/gain. Tension is visual restraint at preDrop; payoff occurs at hero, not every beat. No reliable downbeats asserted. Audible GIF/music interpretation needs manual listening approval; analysis supplies timing evidence, not certainty about musical genre.

## Legacy DNA

The old OMG animal reaction. Preserve the selected subject and emotional joke rather than mechanically reproducing CSS.

## New concept

Ten-frame film-strip stutter with hard shutter cuts and phase-offset screens.

## Localized storyboard (production v2.2)

- 0.000s: fully transparent public stage, including loading and restart/reverse seek.
- 0.050s–0.150s: source entry; INITIAL capture is 150ms and is distinct from ZERO.
- 0.1161s · firstImpact: media enters in its characteristic direction; no independent visual timer.
- 2.02014s · donorReveal: Top name cuts in as subtitle; amount punches below the wiggle strip.
- 2.94893s · buildStart: side screens hard-cut in.
- 4.5s · preDrop: source holds the characteristic pose, reduce secondary motion.
- 4.82975s hero: selected source pose, amount and signature technique land together.
- hero+50ms: release begins while subject, name and amount remain readable.
- 6.22295s · settle: source loop resumes; dramatic detail falls away.
- 11.6s end: media unloads, spectacle hides and full readable information takes over.

## GIF usage

Main 520x390 projection at (610,320), two 170x128 screens at (440,495)/(1160,390), delays 0.08/0.16s. Shutters close before the hit. One 620px donor/amount stack at (630,750); transparent handwritten OMG asset is 200x80 at (1145,565), following the existing reveal/stutter. All geometry is direct logical 1920x1080, uniformly fitted to the viewport; no previous per-scene assembly scale applies. No generated/replacement footage. Source loops against music time, holds the chosen pose from hero-0.06s (bounded by preDrop) until hero+0.06s, then resumes from that pose and loops. Echoes use authored source offsets. Original GIF fallback preserves recognizable content but cannot guarantee exact source-frame synchronization. Poster is an unmodified source frame.

## Nickname and amount

Top name cuts in as subtitle; amount punches below the wiggle strip. Dynamic Polish amount/currency preserved; shared name/amount anchor has a 24px gap. Name is fitted to 28–44px and wraps in full; amount is fitted to at most 112px and the stack width. See DESIGN.md and PRODUCTION_22_DIRECTION.md for exact formulas. Amount's exact cue is **4.82975s**. The source cannot be swapped with another tier without breaking the joke, spatial balance and chosen gesture.

## Message / information state

Use the shared intrinsic Information card: content width 560–960px, natural height capped at 600px, fixed header and body-only slow overflow scrolling with opening/final holds. Complete plain text and explicit allowlisted image runs retain line breaks and stable 45px emote slots; frame selection follows information time, without a private animation loop. Keep existing nickname -> amount -> message TTS and queue completion. Hide and unload media/effects at information; no ongoing decode when idle.

## Unique signature technique

Ten-frame film-strip stutter with hard shutter cuts and phase-offset screens. This is the main idea only for this tier.

## Performance budget

Maximum 3 paused video decoders at original source dimensions. Coalesced frame-cadence seeks, bounded preload and latest-clock recovery. No GPU effects for this scene. No blur stack or DOM particle forest. Video sources/listeners release at information/unmount. WebM is selected for control, not a promise of smaller files: opaque files use audited visually lossless VP9 CRF 4; the transparent dancer retains lossless alpha. Do not sacrifice selected content fidelity.

## Production-v2 extension

The logical geometry above is the current directly authored production-v2.2 footprint; only uniform viewport fitting applies. See PRODUCTION_22_DIRECTION.md and KAAAJKA_BRAND_DIRECTION.md. Original hero/music/source-pose times are unchanged. Music Intelligence v2 adds estimated beat/downbeat motifs, explicitly authored section regions and bounded source reactions from measured vocal-energy peaks. Important guessed lyrics remain unapproved; no automatic lyric captioning occurs. Cash/brand/footprint decisions and current media bytes are documented in the production-v2 brand/media audits.

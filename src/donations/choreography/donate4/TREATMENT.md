# Donate4 - Deadpan paper roll

## Source GIF

`public/assets/donations/gif/donation-template-04.gif`: 322x480, 97 frames, 6.47s, infinite loop. Bearded seated man in tie-dye hoodie on a toilet, gesturing with a paper roll. Beige tiles/white roll, bright clothing.

Characteristic motion/gesture: Vertical, speech-like motion; raised finger then roll at 1.93s. Deadpan seated body, not an action scene. Hero source time: **1.93s**. Opaque source: retain the environment in a bounded media window and keep the rest of the broadcast transparent.

## Source music

Authoritative template4, 12.84544s, estimated 172.266 BPM. Strong measured spectral-flux transients: 0.06966s, 0.18576s, 0.30186s, 0.41796s, 0.53406s. These are observations, not audible drop labels. Existing authored hero **4.52789s** remains fixed. firstImpact/donorReveal/buildStart/preDrop/settle retain current cue map and exact track/gain. Tension is visual restraint at preDrop; payoff occurs at hero, not every beat. No reliable downbeats asserted. Audible GIF/music interpretation needs manual listening approval; analysis supplies timing evidence, not certainty about musical genre.

## Legacy DNA

WOWOW / TAK O casual blunt incredulity. Preserve the selected subject and emotional joke rather than mechanically reproducing CSS.

## New concept

A horizontal paper-roll amount reveal paired with a planted bathroom portrait.

## Localized storyboard (production v2.2)

- 0.000s: fully transparent public stage, including loading and restart/reverse seek.
- 0.050s–0.150s: source entry; INITIAL capture is 150ms and is distinct from ZERO.
- 0.18576s · firstImpact: media enters in its characteristic direction; no independent visual timer.
- 1.06812s · donorReveal: Quiet left-aligned donor sets up punchline; amount unrolls left to right.
- 2.80961s · buildStart: paper width extends, portrait holds its seat.
- 4.18s · preDrop: source holds the characteristic pose, reduce secondary motion.
- 4.52789s hero: selected source pose, amount and signature technique land together.
- hero+50ms: release begins while subject, name and amount remain readable.
- 7.29107s · settle: source loop resumes; dramatic detail falls away.
- 12.84544s end: media unloads, spectacle hides and full readable information takes over.

## GIF usage

Single 350x522 portrait at (1060,260). Left answer at (525,315), 480px donor/amount stack 125px below; 520x142 torn strip at (-24,208) within the answer carries the amount. Portrait holds at the hit; no GPU/particles. All geometry is direct logical 1920x1080, uniformly fitted to the viewport; no previous per-scene assembly scale applies. No generated/replacement footage. Source loops against music time, holds the chosen pose from hero-0.35s (bounded by preDrop) until hero+0.35s, then resumes from that pose and loops. Echoes use authored source offsets. Original GIF fallback preserves recognizable content but cannot guarantee exact source-frame synchronization. Poster is an unmodified source frame.

## Nickname and amount

Quiet left-aligned donor sets up punchline; amount unrolls left to right. Dynamic Polish amount/currency preserved; shared name/amount anchor has a 24px gap. Name is fitted to 28–44px and wraps in full; amount is fitted to at most 112px and the stack width. See DESIGN.md and PRODUCTION_22_DIRECTION.md for exact formulas. Amount's exact cue is **4.52789s**. The source cannot be swapped with another tier without breaking the joke, spatial balance and chosen gesture.

## Message / information state

Use the shared intrinsic Information card: content width 560–960px, natural height capped at 600px, fixed header and body-only slow overflow scrolling with opening/final holds. Complete plain text and explicit allowlisted image runs retain line breaks and stable 45px emote slots; frame selection follows information time, without a private animation loop. Keep existing nickname -> amount -> message TTS and queue completion. Hide and unload media/effects at information; no ongoing decode when idle.

## Unique signature technique

A horizontal paper-roll amount reveal paired with a planted bathroom portrait. This is the main idea only for this tier.

## Performance budget

Maximum 1 paused video decoders at original source dimensions. Coalesced frame-cadence seeks, bounded preload and latest-clock recovery. No GPU effects for this scene. No blur stack or DOM particle forest. Video sources/listeners release at information/unmount. WebM is selected for control, not a promise of smaller files: opaque files use audited visually lossless VP9 CRF 4; the transparent dancer retains lossless alpha. Do not sacrifice selected content fidelity.

## Production-v2 extension

The logical geometry above is the current directly authored production-v2.2 footprint; only uniform viewport fitting applies. See PRODUCTION_22_DIRECTION.md and KAAAJKA_BRAND_DIRECTION.md. Original hero/music/source-pose times are unchanged. Music Intelligence v2 adds estimated beat/downbeat motifs, explicitly authored section regions and bounded source reactions from measured vocal-energy peaks. Important guessed lyrics remain unapproved; no automatic lyric captioning occurs. Cash/brand/footprint decisions and current media bytes are documented in the production-v2 brand/media audits.

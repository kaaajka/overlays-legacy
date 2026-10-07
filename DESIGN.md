---
name: Kaaajka GIF-led Donation Shows
description: Seven source-led meme music videos with a shared clock and readable landing.
colors:
  turkey-tan: "#eec692"
  turkey-cream: "#fff2cf"
  mask-red: "#e84531"
  mask-peach: "#ffcab8"
  rodent-ochre: "#ce9759"
  rodent-yellow: "#ffe297"
  paper-tile: "#eee4d4"
  paper-cream: "#f4eee1"
  paper-ink: "#30271f"
  ovation-amber: "#e09055"
  ovation-cream: "#ffe0a1"
  heart-rose: "#ee7998"
  heart-pale: "#ffd5df"
  heart-line: "#ffc1ce"
  webcam-grey: "#bdb6b0"
  webcam-paper: "#ece9dd"
  monitor-border: "#9b9b9b"
  name-lavender: "#bcb8ff"
  name-pale: "#f1eaff"
  white: "#fff"
  information-ink: "rgba(9, 12, 18, 0.87)"
  studio-aqua: "#73e4dc"
  studio-gold: "#ffd77b"
  studio-ink: "#111820"
  studio-text: "#eef4fa"
  studio-muted: "#aec1d3"
  studio-label: "#c4d3e1"
  studio-control: "#25323e"
  studio-control-hover: "#3b4e5d"
  studio-border: "#4a5b69"
  studio-divider: "#34424f"
typography:
  donor-name:
    fontFamily: "Poppins, sans-serif"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  donor-amount:
    fontFamily: "Poppins, sans-serif"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  information-title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "40px"
    lineHeight: 1.25
  body:
    fontFamily: "Poppins, sans-serif"
    fontSize: "32px"
    lineHeight: 1.6
  label:
    fontFamily: "Poppins, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
  studio-title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "22px"
    fontWeight: 600
  studio-small:
    fontFamily: "Poppins, sans-serif"
    fontSize: "11px"
rounded:
  control: "6px"
  information: "14px"
spacing:
  control-gap: "8px"
  cue-gap: "7px"
  studio-inset: "20px"
  studio-gap: "22px"
  header-gap: "24px"
  currency-gap: "25px"
components:
  studio-button:
    backgroundColor: "{colors.studio-control}"
    textColor: "{colors.studio-text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 10px"
  studio-button-hover:
    backgroundColor: "{colors.studio-control-hover}"
  studio-field:
    backgroundColor: "{colors.studio-control}"
    textColor: "{colors.studio-text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 10px"
  studio-cue:
    backgroundColor: "{colors.studio-control}"
    textColor: "{colors.studio-text}"
    typography: "{typography.studio-small}"
    rounded: "{rounded.control}"
    padding: "5px 9px"
  studio-hero-cue:
    backgroundColor: "{colors.studio-control}"
    textColor: "{colors.studio-gold}"
    typography: "{typography.studio-small}"
    rounded: "{rounded.control}"
    padding: "5px 9px"
  information-card:
    backgroundColor: "{colors.information-ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.information}"
    padding: "42px 48px"
    width: "1240px"
  paper-strip:
    backgroundColor: "{colors.paper-cream}"
    textColor: "{colors.paper-ink}"
    width: "950px"
    height: "270px"
---

# Design System: Kaaajka GIF-led Donation Shows

## Overview

**Creative North Star: "Seven GIFs Conduct the Show"**

Each live donation is a miniature music video conducted by Kaaajka's selected GIF, its existing track and its legacy joke. The room dancer calls for a two-step, the masked dancer leaves transparent echoes, the rodent cuts through a film strip, the seated portrait unrolls paper, the crowd opens its arms, the streamer passes a heart, and the tiny webcam interrupts through a monitor wall. Exuberance and ascending importance come from these subjects, their distinct layouts and their timed donor payoffs.

Shared infrastructure supports those seven compositions: a transparent broadcast stage, solid donor typography, absolute music time, source-frame seeking and a calm complete-message landing. Motion Studio is a dark, compact instrument panel around the show. Its subdued controls make timing and source state inspectable without defining the broadcast's visual identity.

This document records the built donation world, direction seed `d2f60c0f`, and DEV Motion Studio. It replaces the former common-aperture live art direction. The old SAY MY NAME composition remains a Studio-only Donate8 exploration sharing Donate7's track. Unrelated legacy overlay styles remain outside this document's scope. Source code is authoritative for exact values; hero and storyboard composites, per-tier PNGs and desktop/mobile Studio captures provide visual evidence. OBS alpha compositing, audible cue/pose approval and performance under gameplay remain manual release checks.

**Key Characteristics:**

- Seven recognizable, unchanged source GIF identities and seven distinct compositions.
- Scene-specific gestures, text placement and donor impact.
- Honest source alpha, room context, frame cadence and pixel texture.
- Supporting effects restrained around the source and readable donor.
- Shared music clock, deterministic seeking and a quiet complete-message landing.
- Flat, practical Studio controls with visible keyboard focus.

## Colors

Source footage supplies the dominant image color. Treatment accents echo that footage; they are not a recoloring instruction. Frontmatter records the source values, while the names below describe their use.

### Primary

- **Turkey Tan / Turkey Cream:** warm room-dance identity and pale amount/header.
- **Mask Red / Mask Peach:** red foot line and warm amount/header around the unchanged masked silhouette.
- **Rodent Ochre / Rodent Yellow:** fur-derived identity with a bright amount, OMG call and reading header.
- **Paper Tile / Paper Cream / Paper Ink:** bathroom-derived neutrals, the unrolling strip and its dark amount. The information header returns to Paper Cream.
- **Ovation Amber / Ovation Cream:** crowd-derived warmth, vertical HOLY/MOLY wings and pale amount/header.
- **Heart Rose / Heart Pale / Heart Line:** restrained pink supporting effects, amount/header and the drawn hand-heart bridge.
- **Webcam Grey / Webcam Paper / Monitor Border:** muted monitor-wall identity, pale shout/amount/header and thin monitor boundaries.

### Secondary

- **Studio Aqua:** focus outlines, waveform, ordinary authored cue markers and range accent.
- **Studio Gold:** the hero-drop cue's text, border and waveform marker, independently of the selected scene.
- **Name Lavender / Name Pale:** retained only for the old Studio-only SAY MY NAME treatment.

### Neutral

- **White:** live donor names, complete messages and timeline playhead.
- **Information Ink:** translucent reading surface over arbitrary broadcast content.
- **Studio Ink / Studio Text:** authoring canvas and foreground.
- **Studio Muted / Studio Label:** secondary status, timestamps and field labels.
- **Studio Control / Studio Control Hover:** control fill and hover response.
- **Studio Border / Studio Divider:** control boundaries and header/footer separators.

**The Source Palette Rule.** Preserve the selected source's colors and alpha. Apply each treatment's paired accents to authored graphics, amount and reading header; use dark Paper Ink for the paper-strip amount.

**The Transparent Stage Rule.** Leave the broadcast around source windows transparent. Studio stream and checker backgrounds are inspection context.

## Typography

**Display Font:** Poppins with sans-serif fallback.
**Body Font:** Poppins with sans-serif fallback.

Local regular, medium, semibold and bold files supply weights 400, 500, 600 and 700. Rounded geometric type carries a solid donor hierarchy and blunt legacy calls. Size and alignment belong to each scene; there is no universal centred hero or universal display size.

### Hierarchy

- **Donor name:** shared donor-name role with scene-specific caps. Donate1–7 caps are respectively 70, 76, 70, 68, 64, 70 and 70px. Actual size is `max(24, min(cap, 790 / max(1, nickname.length × 0.65)))`; names wrap anywhere inside their scene's text region. Empty identity displays Anonim.
- **Donor amount:** shared donor-amount role. Donate1–7 caps are respectively 176, 176, 174, 195, 174, 184 and 202px. Actual size is `min(cap, 790 / (formattedAmount.length × 0.62 + 0.55))`. Preserve Polish two-decimal formatting and baseline currency: 0.26em, weight 500, normal tracking and the currency gap.
- **Information title:** the frontmatter role separates donor (600) and amount (500).
- **Body:** complete plain-text message uses the body role with preserved line breaks and long-word wrapping. The optional special thank-you line is 25px with an 18px bottom margin.
- **Legacy calls:** scene-specific solid text: Turkey's gratitude is 25px/500; paper caption 75px/600 at 1.15 line height; rodent OMG 120px/700; ovation wings 184px/700 at line height 1; HALO call 60px/600; webcam shout 134px with a 164px strong second line, both 700 at 1.02 line height. These are authored graphic roles, not a shared heading scale.
- **Studio:** control text uses label; title uses studio-title and becomes 18px at the narrow breakpoint. Status is 12px; feature labels and cue buttons use studio-small.

**The Donor Space Rule.** Reserve independent readable space for nickname and amount within each composition. Keep the source gesture visible and fit long donor strings rather than forcing every show into one text layout.

## Layout

The broadcast is a 1920 × 1080 logical stage, centred and uniformly scaled using the smaller viewport-to-stage ratio. It does not reflow into a mobile donation layout. The following coordinates are authored stage pixels from the JSX/CSS; timeline transforms change poses during the sequence.

| Live scene | Source placement | Donor and signature composition |
| --- | --- | --- |
| Donate1 · Turkey two-step | One 780 × 650 room window at (100, 170). | Right reply at (1010, 270), width 790; name inside at y75, amount at y160 relative to that copy. Foot ellipse and stepped baseline answer the dancer. |
| Donate2 · Masked dance floor | Lead 593 × 830 at (670, 100); echoes 429 × 600 at (280, 300) and 464 × 650 at (1330, 250). | Name above at (280, 35), width 1360; centred foot-level amount at (460, 865), width 1000. Red floor and transparent margins preserve the mask and raised arms. |
| Donate3 · Rodent rave | Main 800 × 600 projector at (560, 230); 350 × 263 side screens at (40, 470) and (1530, 220). | Name above at (360, 90), width 1200; amount below at (400, 865), width 1120. Half-height shutter bars cut the central screen; OMG sits right. |
| Donate4 · Deadpan paper roll | One 560 × 835 portrait at (1230, 90). | Left answer at (120, 95), width 950; copy starts at y215 and the amount at (30, 175) within it. The strip begins at y355 within the answer. Deadpan caption, torn edge and perforation frame the payoff. |
| Donate5 · Arms-wide ovation | One 1400 × 788 panorama at (260, 80). | Name at (300, 0), width 1320; amount at (350, 870), width 1220. Vertical HOLY/MOLY wings occupy opposing edges; stage lip sits below the crowd. |
| Donate6 · Heart from the booth | One 720 × 720 booth at (1080, 110). | Left copy at (120, 325), width 840; amount at (50, 170) within it. A 1100 × 760 drawn bridge at (30, 225) links the hand-heart to the donor; HALO sits below the booth. |
| Donate7 · Webcam overload | Main 360 × 360 at (1360, 310), two 240px moving satellites and six tilted 240px source-pose stills on the right. | Left shout at (100, 55); copy at (120, 465), width 840, rotated −7°, amount 240px below it. WTF lands below; some edge monitors intentionally continue beyond the stage. |

The common information card begins at (340, 270), has a 620px maximum height and uses frontmatter width/padding. Its header has a 35px gap and 22px bottom padding; message viewport maximum height is 405px. Overflow scrolls after a 2500ms reading pause with a closing hold. The readable error fallback centres at width `min(80vw, 1240px)`, maximum height `80vh`.

Studio is a full-height flex column. A wrapping header sits above the flexible preview and 295px inspector; transport and timeline occupy the footer. Main content uses the Studio inset/gap, header padding is 18px 24px, footer padding 16px 24px 20px. At 900px and below, preview and inspector stack, preview returns to 16:9, fields and inspector buttons span the row, and the page scrolls vertically. Transport/cues wrap. Waveform height is 75px; native scrubber height is 20px.

## Elevation & Depth

Depth follows the source: opaque footage remains a bounded room, portrait or crowd window; the alpha dancer stands directly over broadcast content; tilted rodent screens and webcam monitors create layering. Live scene content sits above supporting GPU detail, with donor copy above the source windows. Donate1–4 use no GPU effects. Donate5–7 retain limited light and particles behind the source: ovation glints, heart money detail and webcam money rain. The information scene clears the spectacle and media. Studio uses tonal layering, thin boundaries and separators without card shadows.

### Shadow Vocabulary

- **Donor legibility** (`text-shadow: 0 5px 20px rgba(0, 0, 0, 0.75)`): solid white names over source or broadcast.
- **Amount legibility** (`text-shadow: 0 12px 28px rgba(0, 0, 0, 0.6)`): pale amount over transparent broadcast; disabled on the dark paper-strip amount.
- **Reading surface** (`box-shadow: 0 18px 60px rgba(0, 0, 0, 0.25)`): ambient separation for the information card.

**The Quiet Landing Rule.** Hide the source scene and all supporting spectacle in the information phase, release source media, and retain the name, amount and complete message.

## Shapes

There is no common live aperture silhouette. Each show uses its own source-derived form: Turkey's foot ellipse and stepped line, the dancer's fine red floor, rodent shutters and tilted rectangles, paper's torn polygon/perforation, ovation's panorama and vertical wings, the booth's clipped opposing corners and drawn heart, or the webcam's bordered square monitors. Preserve these forms in their scenes.

Control and information radii are shared frontmatter primitives. Live media is square-edged except for authored reveal clipping and the booth's polygon corners. The old diamond/circular aperture, outline words and corner frame belong to Studio-only Donate8. Studio's clipped illustrative horizon is preview context.

## Components

### Studio buttons and cue actions

Compact neutral actions use studio-button and a 1px Studio Border. Hover uses Studio Control Hover. Focus is a 2px Studio Aqua outline with 2px offset. Transport, restart, previous/next cue, ±50ms and click-plus-flash calibration share this treatment. Cue buttons use the dense studio-cue variant and seek to the authored timestamp; muted timestamps remain secondary. The hero cue uses Studio Gold for both text and border. Cue controls are buttons, not passive chips.

### Fields

Inputs and native selects share studio-field and a 1px Studio Border. Inspector fields span their container. Explicit labels sit above with 12px top and 5px bottom margins. Keep the common focus outline; the range control uses Studio Aqua. No custom error/disabled hierarchy or separate navigation system is implemented.

### Source media and seven donor payoffs

Use the selected originals through GIF-derived, seekable VP9 WebM, with an unmodified source poster while loading and original GIF fallback on failure. Preserve full source content and cadence in conversion: opaque sources are lossless 4:4:4; masked dancer is lossless VP9 alpha with 4:2:0 chroma. Scene transforms and reveal clips are authored separately. Rodent and webcam retain pixelated rendering. Original GIF fallback preserves identity but cannot guarantee authored frame synchronisation.

| Scene | Signature motion and exact amount cue |
| --- | --- |
| Turkey two-step | Name arrives from right; the floor compresses, amount tilts from −7° through +4° and settles, source room answers with a short sideways sway. Hero 3.06503s; chosen source pose 1.13s. |
| Masked dance floor | Lead kicks in from left; delayed transparent echoes join; name descends overhead. Foot-line compression precedes amount's vertical release from 0.78 to 1 over 0.48s with `back.out(1.8)`. Hero 3.66875s; arms-up source pose 2.52s. |
| Rodent rave | Hard source cuts, staggered character steps and opposing tilted screens lead to three-step shutter closure. Hero cuts shutters open, reveals OMG/amount and stutters the projector. Hero 4.82975s; source pose 0.20s. |
| Deadpan paper roll | Portrait reveals vertically while remaining planted; paper unrolls to 70% before the payoff. Amount appears at 0.88 horizontal scale, then strip/amount finish their 0.35s unroll. Hero 4.52789s; source roll pose 1.93s. |
| Arms-wide ovation | Panorama opens horizontally; HOLY/MOLY rise from opposing directions. Pre-drop closes width to 0.72; hero releases to full width over 0.45s `expo.out`, with restrained glints. Hero 4.82975s; open-arms source pose 2.00s. |
| Heart from the booth | Soft donor reveal and HALO anticipate a partial drawn heart. Hero reveals amount; the line completes over 0.7s `power1.out`, then the thank-you lands. Hero 3.90095s; hand-heart source pose 2.32s. |
| Webcam overload | Tiny monitor enlarges in steps; beat-timed stills switch on, tilted name cuts in and the legacy shout anticipates impact. Hero expands main monitor, reveals amount/WTF and jolts the wall. Reprises at 22.64s and 37.5s. Hero 13.21215s; reaction source pose 1.52s. |

Shared cue names are `intro → firstImpact → donorReveal → buildStart → preDrop → heroDrop → settle → information`; the timeline default is `power2.out`. Each scene owns its shots and tween choices. Chosen source poses hold near hero according to per-asset before/after windows, then resume looping from that pose. Dancer echoes delay 0.12/0.24s, rodent screens 0.08/0.16s, webcam satellites 0.12/0.24s. The source and music clock remain at exact zero on restart/reverse seek; the GSAP timeline uses a one-microsecond positive render position to establish its zero-duration initial state.

The last 0.5s clears source scene/effects; the last 0.4s reveals information. Root outro is an opacity transition of 0.65s ease-out. Reduced-motion CSS removes that root transition; it does not provide a complete static alternative to the GSAP scene.

**The Music Clock Rule.** Derive authored scene and controlled source frames from absolute music time. Quality reduction changes supporting detail, not cue timing, donor layout or the reading phase.

### Information card

Use the shared information-card surface, treatment pale header and white complete message. Preserve line breaks, unbroken-word wrapping and slow overflow reading. The optional special thanks remains a small pale-accent paragraph. Information stays readable during renderer degradation and releases source videos and fallbacks when the show ends.

### Studio timeline and preview

Waveform layers include the translucent aqua energy envelope, beat ticks, white downbeats, authored aqua cues, gold hero-drop and white playhead. The SVG is labelled accessibly. Transport, precise time input, native scrubber and cue buttons inspect the same music time. The inspector exposes source media, position/frame, frozen/loop and ready/fallback state. Preview modes are illustrative stream geometry, 40px checker tiles or transparency. Safe mode hides GPU detail while keeping authored source/DOM/SVG choreography.

Donate8 retains the older name-centred, lavender aperture composition in Studio using the existing Donate7 track. It has no live threshold or independent audio asset.

## Do's and Don'ts

### Do:

- **Do** build each live show's composition and signature gesture around its selected GIF, existing track and legacy joke.
- **Do** preserve original source colors, alpha, environment, frame cadence and honest pixel texture.
- **Do** keep independent donor space and fit complete names and Polish amounts within each authored scene.
- **Do** leave broadcast space transparent and uniformly scale the logical stage.
- **Do** clear spectacle, release source media and preserve complete readable messages.
- **Do** use absolute music time for reproducible seeking and keep cue timing consistent across quality modes.
- **Do** retain explicit Studio labels, visible focus and the stacked narrow-screen inspector.

### Don't:

- **Don't** replace selected GIF footage, recolor the sources or turn seven scenes into one recolored template.
- **Don't** reinstate the common aperture as the live composition or swap source subjects between scenes.
- **Don't** enlarge supporting effects until they compete with the source gesture or readable donor.
- **Don't** force a universal centred hero, crop donor text or permanently truncate messages.
- **Don't** turn Studio inspection backgrounds into opaque broadcast artwork.
- **Don't** invent a live Donate8 threshold, new track or fully static reduced-motion behavior.
- **Don't** apply this scoped donation identity to unrelated legacy overlays.

---
name: Kaaajka Donation Motion
description: Music-directed broadcast spectacle with a quiet, readable landing.
colors:
  signal-aqua: "#73e4dc"
  signal-mint: "#dafff2"
  ember-copper: "#ffa667"
  ember-cream: "#ffe0a1"
  prism-lilac: "#d2bdff"
  prism-ice: "#97f4ff"
  vault-lime: "#b0f984"
  vault-pale: "#f5ffe2"
  holy-coral: "#ff7b61"
  holy-cream: "#ffedb3"
  halo-gold: "#ffd77b"
  halo-ivory: "#fff4d0"
  takeover-lime: "#d3f57a"
  takeover-cream: "#fff4be"
  name-lavender: "#bcb8ff"
  name-pale: "#f1eaff"
  white: "#fff"
  information-ink: "rgba(9, 12, 18, 0.87)"
  studio-ink: "#111820"
  studio-text: "#eef4fa"
  studio-muted: "#aec1d3"
  studio-label: "#c4d3e1"
  studio-control: "#25323e"
  studio-control-hover: "#3b4e5d"
  studio-border: "#4a5b69"
  studio-divider: "#34424f"
typography:
  display:
    fontFamily: "Poppins, sans-serif"
    fontSize: "256px"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Poppins, sans-serif"
    fontSize: "84px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
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
  outline-word:
    fontFamily: "Poppins, sans-serif"
    fontSize: "240px"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.035em"
rounded:
  control: "6px"
  information: "14px"
  circle: "50%"
spacing:
  control-gap: "8px"
  cue-gap: "7px"
  studio-inset: "20px"
  studio-gap: "22px"
  header-gap: "24px"
  hero-gap: "64px"
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
    textColor: "{colors.halo-gold}"
    typography: "{typography.studio-small}"
    rounded: "{rounded.control}"
    padding: "5px 9px"
  information-card:
    backgroundColor: "{colors.information-ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.information}"
    padding: "42px 48px"
    width: "1240px"
  donor-hero:
    textColor: "{colors.white}"
    typography: "{typography.headline}"
---

# Design System: Kaaajka Donation Motion

## Overview

**Creative North Star: "The Donor Takes the Stage"**

The donor is the centre of a musical event: a name appears, the stage compresses, and the amount releases the impact. Luminous vector apertures, oversized outlined words and money rain make ascending donation importance visible. The atmosphere is exuberant, cinematic and deliberately absurd at HOLY MOLY, HALO and Takeover, while solid donor typography stays legible above the effects.

Spectacle resolves into a calm message scene. The stage clears around a dark translucent information card, retaining the tier's pale accent for the name and amount. Motion Studio uses a compact, subdued instrument-panel treatment so its controls support inspection of the broadcast rather than competing with it.

This document records the implemented donation motion engine and DEV Motion Studio, direction seed `1760fcca`. It does not redefine unrelated legacy overlays. Source styles, treatments and choreography are authoritative; the local `.motion-qa/donate1` through `donate8` before/exact/after/information captures and `studio-desktop.png` / `studio-mobile.png` are visual evidence. Browser captures do not establish manual OBS compositing, audible synchronisation or target-hardware performance.

**Key Characteristics:**

- Transparent broadcast stage with a dominant donor name and amount.
- Distinct tier geometry, palette and theatrical weight.
- Compression before impact; expansion and settling after it.
- Music as the absolute clock, with deterministic seeking.
- A quiet, complete message after the spectacle.
- Dark, functional studio controls with clear keyboard focus.

## Colors

The palette pairs luminous stage colors with pale reading accents, surrounded by restrained blue-black studio surfaces. Frontmatter contains the canonical source values; names below describe their roles.

### Primary

- **Signal Aqua / Signal Mint:** aqua drives the first tier's horizontal signal and brackets; mint colors its amount and information header. Aqua also identifies studio focus, waveform and ordinary cue markers.
- **Halo Gold / Halo Ivory:** warm gold drives the halo, rays and falling bills; ivory carries the donor amount and information header. Gold identifies the studio's authored hero-drop cue independently of the selected tier.

### Secondary

- **Ember Copper / Ember Cream:** warm diagonal energy, segmented circular aperture and slanted thank-you words.
- **Prism Lilac / Prism Ice:** lilac diamond geometry with an icy amount and information header.
- **Vault Lime / Vault Pale:** green brackets and vertical vault geometry with a pale reading accent.
- **Holy Coral / Holy Cream:** coral radial spectacle and giant HOLY / MOLY outlines with a warm amount.
- **Takeover Lime / Takeover Cream:** electric lime rifts, horizontal travel and dense money rain with a pale amount.
- **Name Lavender / Name Pale:** lavender identity for the studio-only SAY MY / NAME treatment sharing Donate7's track.

### Neutral

- **White:** solid donor name, complete message and timeline playhead.
- **Information Ink:** translucent reading surface that separates the message from arbitrary broadcast content.
- **Studio Ink / Studio Text:** the persistent authoring background and foreground.
- **Studio Muted / Studio Label:** secondary status and form labels.
- **Studio Control / Studio Control Hover:** resting and hovered controls.
- **Studio Border / Studio Divider:** control boundaries and the header/footer separators.

**The Tier Pair Rule.** Use each treatment's saturated color for its geometry and its paired pale color for the amount and information header; keep donor names and messages white.

**The Transparent Stage Rule.** The live stage has no opaque page background. Studio stream, checker and transparent backgrounds are inspection modes, not broadcast artwork.

## Typography

**Display Font:** Poppins with sans-serif fallback.
**Body Font:** Poppins with sans-serif fallback.

The same rounded geometric family connects the theatrical broadcast to the practical studio. Local regular, medium, semibold and bold files supply weights 400, 500, 600 and 700; no separate mono or icon font is part of this system.

### Hierarchy

- **Display:** the amount uses the frontmatter display role. It steps down to 190px for formatted strings longer than nine characters and 140px beyond twelve. Currency is 0.26em at weight 500 with normal tracking; preserve baseline alignment and the 25px gap. Polish formatting keeps two decimal places and `zł`.
- **Headline:** the donor name uses the headline role, stepping down to 64px beyond eighteen characters and 48px beyond thirty. It wraps anywhere within a 1500px maximum width.
- **Title:** the information header uses the title role, with weight 600 for the donor and 500 for the amount.
- **Body:** message text uses the body role, preserving line breaks and wrapping unbroken text.
- **Label:** studio controls use the label role. The studio title uses its distinct title role and becomes 18px on narrow screens; status is 12px, while feature labels, scrub label and cue buttons use the small role.
- **Outline words:** the base outline-word role is decorative stage architecture. Motif sizes are Signal 124px, Ember 150px, Prism 200px, Vault 174px, Holy 284px, Halo 268px, Takeover 242px and Name 230px. Halo uses wider tracking (0.035em); ordinary outlines are 2px and Holy is 3px.

**The Clear Centre Rule.** Keep solid donor text central and above decorative words, apertures and particles. Outlined words frame the event rather than replacing its readable content.

## Layout

The broadcast uses a fixed logical stage (1920 × 1080), centred and uniformly scaled by the smaller viewport-to-stage ratio. Its typography and geometry retain their authored relationships at every preview size; they do not reflow into a mobile donation layout. The hero centres the name above the amount with the frontmatter hero gap. Corner frame strokes sit inside a 68px inset. The ordinary emblem is 800 × 800 at stage position (560px, 140px); the expanding wave begins as a centred 500px circle.

The information card starts at stage position (340px, 270px), has a maximum height of 620px and uses the frontmatter width and padding. Its header has a 35px gap and 22px bottom padding. The message viewport reaches 405px maximum height. Overflow scrolls after a 2500ms reading pause, with time reserved at the end; preserve complete reading rather than truncating content. The standalone readable error fallback centres a card at width `min(80vw, 1240px)` and maximum height `80vh`.

Studio is a full-height flex column with a wrapping header, flexible preview beside a 295px inspector, and a transport/timeline footer. Main content uses the frontmatter inset and gap; header padding is 18px 24px and footer padding is 16px 24px 20px. Desktop preview stretches into the available region while the logical stage scales inside it. At the observed 900px breakpoint, preview and inspector stack, preview restores 16:9, fields span the inspector width, inspector buttons fill the row, and the page scrolls vertically. Transport and cue controls wrap with their respective frontmatter gaps. The waveform is 75px high; the native scrubber is 20px high.

## Elevation & Depth

Broadcast depth comes from transparent light, vector apertures, perspective, foreground particles and soft text shadows. Donor text stays above the GPU canvas and geometry. The information card uses a diffuse ambient shadow, then removes all hero graphics from the information phase. Studio is flat: surface tones, thin strokes and separators define controls without card shadows.

### Shadow Vocabulary

- **Donor legibility** (`text-shadow: 0 5px 20px rgba(0, 0, 0, 0.75)`): white names remain distinct over bright light or gameplay.
- **Amount legibility** (`text-shadow: 0 12px 28px rgba(0, 0, 0, 0.6)`): the pale amount retains weight over impact effects.
- **Reading surface** (`box-shadow: 0 18px 60px rgba(0, 0, 0, 0.25)`): ambient separation for the information card.

**The Quiet Landing Rule.** In the information phase, hide the hero, decorative words, emblem, frame, atmosphere, GPU canvas and wave; retain the name, amount and complete message.

## Shapes

The stage vocabulary is circular and angular: thin shock rings, segmented apertures, diamonds, open brackets and stretched horizontal rifts. Four open corner strokes frame the stage without enclosing it in a panel. Money particles are rotating rectangular bills with border and seal detail, rather than photo assets. Use the treatment's geometry to preserve its silhouette.

Studio controls have gently curved corners using the control radius. The reading card uses the larger information radius. Circular waves use the circle radius. The studio's illustrative horizon is a clipped quadrilateral; it belongs to preview context, not the live stage.

## Components

### Studio buttons

Compact and practical. The studio-button frontmatter entry supplies the shared fill, foreground, type, radius and padding. A 1px Studio Border outlines each control. Hover uses Studio Control Hover. Keyboard focus is a 2px Signal Aqua outline with 2px offset. Play/Pause, Restart, Previous/Next cue, ±50ms and click-plus-flash calibration are ordinary action buttons; no unrelated primary/ghost hierarchy is implemented.

### Cue buttons

Small action tags, never passive chips. Studio-cue provides the dense variant; each button seeks to its authored timestamp. Ordinary cue times are muted. The hero-drop variant keeps the same shape and fill but colors both text and border Halo Gold. Cue rows wrap rather than truncating their labels.

### Fields

Inputs and native selects share studio-field styling and a 1px Studio Border. Inspector fields span their container. Labels sit above them with 12px top and 5px bottom margins. Preserve the common keyboard focus outline and use explicit labels. The native range scrubber uses Signal Aqua as its accent. No bespoke disabled or error variant is defined.

### Donor hero and apertures

A dominant solid name above an even larger pale amount. Both use independent character choreography; the currency remains small. Apertures supply each tier's visual identity:

| Treatment | Distinct visual grammar |
| --- | --- |
| Signal | Aqua horizontal energy, open brackets and a compressed wide aperture; a single DZIĘKI outline below. |
| Ember | Copper diagonal energy and thick segmented circle; slanted words slide in, and the hero straightens from a small tilt. |
| Prism | Lilac diamond aperture and diamond shock geometry; icy amount with an OMG outline above. |
| Vault | Lime vertical geometry and broad open brackets; two thank-you words slide horizontally. |
| Holy Moly | Coral radial spectacle, oversized opposing HOLY / MOLY outlines and a strong centre impact. |
| Halo | Gold radial halo with perspective tilt, rotational release and falling outlined bills. |
| Takeover | Lime horizontal rifts stretched across the stage, opposing left/right words, dense bills and later authored reprise impacts. |
| Say my name | Lavender diamond plus circular aperture, SAY MY / NAME words, a name scale emphasis and the shared Donate7 reprises. Studio exploration only. |

Motion follows `intro → firstImpact → donorReveal → buildStart → preDrop → heroDrop → settle → information`. Names rise and rotate into place character by character (0.55s with a 0.3s total stagger). Pre-drop compresses geometry, lowers atmosphere and creates tension; hero-drop makes the amount visible at the exact cue, with scale 1.12 in the first two tiers or 1.25 in higher tiers, then releases to normal size over 0.65s using `expo.out`. The shock wave expands and disappears over 1.35s. Settling reduces decorative intensity; the final 0.55s clears the hero before the reading scene. Default tween easing is `power3.out`, with `power2.in` / `power3.in` for tension and linear slow drift after settling.

**The Music Clock Rule.** Derive the whole scene from absolute music time and authored cues. Seeking must reproduce the same composition; quality reduction may change effect detail but must not change cue timing, donor layout or the reading phase.

### Information card

Quiet and readable. Use information-card for the shared surface; the treatment's pale accent colors the split name/amount header, and white colors the complete message. Preserve literal line breaks and long-word wrapping. A special thank-you line, when applicable, is a smaller (25px) pale-accent paragraph with an 18px bottom margin. Keep this scene readable during renderer degradation as well as normal completion.

### Studio timeline and preview

The waveform combines a translucent aqua energy envelope, beat ticks, white downbeats, aqua authored cues, a gold hero drop and a white playhead. Its SVG has an accessible title and label. Transport, precise time input, range scrubber and clickable cues all inspect the same music time. Preview backgrounds are explicitly illustrative stream geometry, a checker pattern (40px tiles) or transparency. Safe mode removes GPU detail while preserving authored DOM/SVG motion and readable content. Reduced-motion CSS removes the final root-opacity transition; it does not currently replace the GSAP scene with a static presentation.

## Do's and Don'ts

### Do:

- **Do** keep the live stage transparent and uniformly scale the authored broadcast composition.
- **Do** preserve each tier's paired palette, geometry and musical compression/release.
- **Do** keep solid donor information central, above decorative motion.
- **Do** clear spectacle for the complete message and preserve readable fallback behavior.
- **Do** use absolute music time for reproducible seeking and quality-independent cue timing.
- **Do** retain explicit studio labels, visible keyboard focus and the stacked narrow-screen inspector.

### Don't:

- **Don't** turn the studio's illustrative background into opaque live broadcast artwork.
- **Don't** flatten all tiers into the same recolored ring or particle treatment.
- **Don't** obscure, clip or permanently truncate the donor's name, amount or message.
- **Don't** invent a live Donate8 threshold or a new track; its current identity shares Donate7's music in the studio.
- **Don't** present safe rendering as a different musical sequence or treat the limited reduced-motion CSS as a complete static alternative.
- **Don't** apply this document's scoped identity to unrelated legacy overlays without a separate design decision.

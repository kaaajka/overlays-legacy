---
name: Kaaajka GIF-led Donation Shows
description: Seven localized source-led meme shows and a graphite authoring desk with peach/cyan accents.
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
  studio-peach: "#ffc0aa"
  studio-peach-ink: "#281d1a"
  studio-cyan: "#83aaa9"
  studio-bar-cyan: "#82bab5"
  studio-cue: "#c18b78"
  studio-playhead: "#ffe3d8"
  studio-ink: "#17191d"
  studio-panel: "#202328"
  studio-stage: "#121418"
  studio-timeline: "#1b1e23"
  studio-text: "#eef0f3"
  studio-muted: "#a5abb5"
  studio-label: "#c4c9d1"
  studio-control: "#292d34"
  studio-control-hover: "#3b414a"
  studio-border: "#363b43"
  studio-selection: "#343039"
  studio-error: "#ff9eaa"
  cash-paper: "#f8e2b3"
  cash-ink: "#524133"
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
    fontSize: "12px"
    lineHeight: 1.45
  studio-title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "15px"
    fontWeight: 700
  studio-heading:
    fontFamily: "Poppins, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  studio-small:
    fontFamily: "Poppins, sans-serif"
    fontSize: "11px"
  studio-track:
    fontFamily: "Poppins, sans-serif"
    fontSize: "9px"
  timecode:
    fontFamily: "monospace"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.5
rounded:
  control: "3px"
  timeline: "2px"
  lifecycle: "3px"
  information: "14px"
spacing:
  compact-gap: "4px"
  field-gap: "5px"
  pair-gap: "8px"
  studio-inset: "12px"
  tree-inset: "8px"
  currency-gap: "25px"
components:
  studio-button:
    backgroundColor: "{colors.studio-control}"
    textColor: "{colors.studio-text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "4px 7px"
    height: "26px"
  studio-button-hover:
    backgroundColor: "{colors.studio-control-hover}"
  studio-button-primary:
    backgroundColor: "{colors.studio-peach}"
    textColor: "{colors.studio-peach-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "4px 7px"
    height: "26px"
  studio-field:
    backgroundColor: "{colors.studio-control}"
    textColor: "{colors.studio-text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "4px 7px"
    height: "26px"
  studio-hero-cue:
    backgroundColor: "{colors.studio-cue}"
    textColor: "{colors.studio-ink}"
    typography: "{typography.studio-track}"
    rounded: "{rounded.timeline}"
    padding: "3px 7px"
    height: "23px"
  studio-layer-selected:
    backgroundColor: "{colors.studio-selection}"
    textColor: "{colors.studio-text}"
    rounded: "{rounded.control}"
    padding: "4px 6px 4px 0"
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

Shared infrastructure supports those seven compositions: a transparent broadcast stage, solid donor typography, absolute music time, source-frame seeking and a calm complete-message landing. Production-v2 extends this world with deliberate negative space, source-specific cash payoffs and selective community stickers. The supplied peach channel banner, controller avatar and white bunny emotes establish warmth and expressive reaction; they do not recolor the selected GIFs.

Motion Studio is a professional graphite authoring desk: tree, central fitted stage, inspector and multitrack timeline. Peach marks selection and deliberate actions; cyan carries measurement and the small bunny identity mark. This document records the built production-v2 expansion of direction seed `d2f60c0f`, with `.motion-qa/v2/` captures as visual evidence. The old SAY MY NAME composition remains a Studio-only Donate8 exploration sharing Donate7's track. Unrelated legacy overlay styles remain outside this document's scope.

**Key Characteristics:**

- Seven recognizable, unchanged source GIF identities and seven distinct compositions.
- Scene-specific gestures, text placement and donor impact.
- Honest source alpha, room context, frame cadence and pixel texture.
- Supporting effects restrained around the source and readable donor.
- Shared music clock, deterministic seeking and a quiet complete-message landing.
- Localized compositions with transparent margins that preserve gameplay.
- Cash fountain, handoff and storm reserved for selected higher-tier payoffs.
- Selective bunny reaction in the heart scene and a small Studio identity mark.
- Flat graphite Studio panels, compact controls and peach keyboard focus.

## Colors

Source footage supplies the dominant image color. Treatment accents echo that footage, while peach and cyan connect the authoring desk to Kaaajka's supplied identity. Frontmatter records the source values, while the names below describe their use.

### Primary

- **Turkey Tan / Turkey Cream:** warm room-dance identity and pale amount/header.
- **Mask Red / Mask Peach:** red foot line and warm amount/header around the unchanged masked silhouette.
- **Rodent Ochre / Rodent Yellow:** fur-derived identity with a bright amount, OMG call and reading header.
- **Paper Tile / Paper Cream / Paper Ink:** bathroom-derived neutrals, the unrolling strip and its dark amount. The information header returns to Paper Cream.
- **Ovation Amber / Ovation Cream:** crowd-derived warmth, vertical HOLY/MOLY wings and pale amount/header.
- **Heart Rose / Heart Pale / Heart Line:** restrained pink supporting effects, amount/header and the drawn hand-heart bridge.
- **Webcam Grey / Webcam Paper / Monitor Border:** muted monitor-wall identity, pale shout/amount/header and thin monitor boundaries.

### Secondary

- **Studio Peach / Peach Ink:** selected modes and inspector tabs, primary actions, focus outlines, range accents and overlay measurement trace; dark ink keeps selected-control text legible.
- **Studio Cyan / Bar Cyan:** subdued waveform and downbeat measurement. The original cyan bunny remains unchanged in the Studio brand mark.
- **Studio Cue / Playhead:** muted peach hero/selected cue labels and a pale one-pixel time indicator.
- **Cash Paper / Cash Ink:** warm drawn bills for ovation and webcam; the heart handoff uses Heart Pale.
- **Name Lavender / Name Pale:** retained only for the old Studio-only SAY MY NAME treatment.

### Neutral

- **White:** live donor names, complete messages and timeline playhead.
- **Information Ink:** translucent reading surface over arbitrary broadcast content.
- **Studio Ink / Panel / Stage / Timeline:** graphite shell, side panels, darker preview well and timeline bed.
- **Studio Text:** primary authoring foreground.
- **Studio Muted / Studio Label:** secondary status, timestamps and field labels.
- **Studio Control / Studio Control Hover:** control fill and hover response.
- **Studio Border / Selection:** thin boundaries and a subtly plum selected tree row with a peach leading edge.
- **Studio Error:** inline validation and export-error text.

**The Source Palette Rule.** Preserve the selected source's colors and alpha. Apply each treatment's paired accents to authored graphics, amount and reading header; use dark Paper Ink for the paper-strip amount.

**The Transparent Stage Rule.** Leave the broadcast around source windows transparent. Studio stream and checker backgrounds are inspection context.

**The Selective Sticker Rule.** Use the original bunny as a meaningful community response in the heart scene and a small Studio identity mark. Preserve its source colors and resolution; do not scatter mascots across every show.

## Typography

**Display Font:** Poppins with sans-serif fallback.
**Body Font:** Poppins with sans-serif fallback.
**Timecode Font:** monospace, reserved for genuine time and numerical inspection readouts.

Local regular, medium, semibold and bold files supply weights 400, 500, 600 and 700. Rounded geometric type carries a solid donor hierarchy and blunt legacy calls. Size and alignment belong to each scene; there is no universal centred hero or universal display size.

### Hierarchy

- **Donor name:** shared donor-name role with scene-specific caps. Donate1–7 caps are respectively 70, 76, 70, 68, 64, 70 and 70px. Actual size is `max(32, min(cap, 790 / max(1, nickname.length × 0.65)))`; names wrap anywhere inside their scene's text region. Empty identity displays Anonim. These values precede each scene's localization scale.
- **Donor amount:** shared donor-amount role. Donate1–7 caps are respectively 176, 176, 174, 195, 174, 184 and 202px. Actual size is `min(cap, 790 / (formattedAmount.length × 0.62 + 0.55))`. Preserve Polish two-decimal formatting and baseline currency: 0.26em, weight 500, normal tracking and the currency gap.
- **Information title:** the frontmatter role separates donor (600) and amount (500).
- **Body:** complete plain-text message uses the body role with preserved line breaks and long-word wrapping. The optional special thank-you line is 25px with an 18px bottom margin.
- **Legacy calls:** scene-specific solid text: Turkey's gratitude is 25px/500; paper caption 75px/600 at 1.15 line height; rodent OMG 120px/700; ovation wings 184px/700 at line height 1; HALO call 60px/600; webcam shout 134px with a 164px strong second line, both 700 at 1.02 line height. These are authored graphic roles, not a shared heading scale.
- **Studio:** common controls use label; the brand uses studio-title and inspector titles use studio-heading. Field labels, status and tree actions are 11px; inspector tabs and detail are 10px; tracks, regions and lifecycle labels are 9px. Sparse uppercase panel labels use 10px with 1.3px tracking. The production eyebrow is 8px with 1.6px tracking. The main timecode uses its own role; supporting time, ruler and IN/OUT values use 9–10px monospace. Studio 2.1 supports desktop authoring at 1280 × 720 and above; smaller viewports show only the desktop-required screen.

**The Donor Space Rule.** Reserve independent readable space for nickname and amount within each composition. Keep the source gesture visible and fit long donor strings rather than forcing every show into one text layout.

## Layout

The broadcast is a 1920 × 1080 logical stage, centred and uniformly scaled using the smaller viewport-to-stage ratio. It does not reflow into a mobile donation layout. Each live composition additionally scales around stage centre: Donate1–7 use 0.65, 0.67, 0.64, 0.70, 0.78, 0.73 and 0.78 respectively. The following coordinates are internal authored pixels before those localization scales; timeline transforms change poses during the sequence. Do not read the table as final screen coverage.

Lower scenes leave broad transparent margins; middle scenes grow in importance without filling the frame. The brand direction's approximate 25–40% lower-tier and 40–55% middle-tier area guidance expresses intent, not a coverage quota. Higher cash/interruption moments may briefly expand at named cues, then return to readable negative space.

| Live scene | Source placement | Donor and signature composition |
| --- | --- | --- |
| Donate1 · Turkey two-step | One 780 × 650 room window at (100, 170). | Right reply at (1010, 270), width 790; name inside at y75, amount at y160 relative to that copy. Foot ellipse and stepped baseline answer the dancer. |
| Donate2 · Masked dance floor | Lead 593 × 830 at (670, 100); echoes 429 × 600 at (280, 300) and 464 × 650 at (1330, 250). | Name above at (280, 35), width 1360; centred foot-level amount at (460, 865), width 1000. Red floor and transparent margins preserve the mask and raised arms. |
| Donate3 · Rodent rave | Main 800 × 600 projector at (560, 230); 350 × 263 side screens at (40, 470) and (1530, 220). | Name above at (360, 90), width 1200; amount below at (400, 865), width 1120. Half-height shutter bars cut the central screen; OMG sits right. |
| Donate4 · Deadpan paper roll | One 560 × 835 portrait at (1230, 90). | Left answer at (120, 95), width 950; copy starts at y215 and the amount at (30, 175) within it. The strip begins at y355 within the answer. Deadpan caption, torn edge and perforation frame the payoff. |
| Donate5 · Arms-wide ovation | One 1400 × 788 panorama at (260, 80). | Name at (300, 0), width 1320; amount at (350, 870), width 1220. Vertical HOLY/MOLY wings occupy opposing edges; stage lip sits below the crowd. |
| Donate6 · Heart from the booth | One 720 × 720 booth at (1080, 110). | Left copy at (120, 325), width 840; amount at (50, 170) within it. A 1100 × 760 drawn bridge at (30, 225) links the hand-heart to the donor; HALO sits below the booth. |
| Donate7 · Webcam overload | Main 360 × 360 at (1360, 310), two 240px moving satellites and six tilted 240px source-pose stills on the right. | Left shout at (100, 55); copy at (120, 465), width 840, rotated −7°, amount 240px below it. WTF lands below; some edge monitors intentionally continue beyond the stage. |

The common information card begins at (340, 270), has a fixed 620px height and maximum height, and uses frontmatter width/padding. Its header has a 35px gap and 22px bottom padding. The message fills the remaining flex space with `min-height: 0`, so long wrapped names reduce the message viewport without enlarging or escaping the panel. Overflow scrolls after a 2500ms reading pause with a closing hold. The readable error fallback centres at width `min(80vw, 1240px)`, maximum height `80vh`.

Studio 2.1 owns the desktop viewport at 1280 × 720 and above. Below either threshold, only a desktop-required screen reports the current and recommended dimensions. No mobile editor is rendered. A 46px toolbar and 20px footer enclose docked React-17-compatible split panes. Default horizontal allocation is 14% tree / 64% Program / 22% properties; vertical allocation is 62% workspace / 38% Timeline. Side panes collapse, all three dividers resize, and local preferences persist. Reset Workspace and divider double-click restore defaults. Maximize active panel saves and restores the exact preceding layout. Compact 26px dock headers mark the active panel subtly; properties tabs remain integrated.

The Program viewer uses ResizeObserver dimensions to fit the logical 1920 × 1080 stage. Fit refits immediately with every pane operation. Manual 25/50/75/100% views pan and scroll locally. The stage clips and contains paint; it never contributes document overflow. The supplied photographic Rocket League stream is the default authoring background, served from development-only assets. A custom PNG/JPEG/WebP can replace it locally. Production remains transparent.

Timeline has a 36px control strip, sticky 150px track headers, 28px ruler, 31px standard tracks and 52px music waveform. Content width is max(available width, 900px × zoom), at 1–128×, with adaptive subsecond ruler ticks. Wheel scrolls locally; Shift-wheel pans horizontally and Ctrl/Cmd-wheel zooms around the pointer. Playhead and IN/OUT use pointer capture; Shift-drag creates a range without browser text selection. Hero Only spans original music. Full Alert spans the shared lifecycle plan: Hero, overlapping Information and sequential nickname/amount/message speech, then Outro and COMPLETE. Native audio playback determines the audible speech highlight; post-music seeking previews deterministic visual state. Detached lifecycle summary boxes are removed. Graphite/peach/cyan chrome, Poppins and Lucide preserve Studio identity. Scrollbars are subdued and visible; native text selection is restored in editable and explicitly copyable fields.

## Elevation & Depth

Depth follows the source: opaque footage remains a bounded room, portrait or crowd window; the alpha dancer stands directly over broadcast content; tilted rodent screens and webcam monitors create layering. Live scene content sits above supporting GPU detail, with donor copy above source windows. Donate1–4 use no GPU effects or cash. Donate5–7 combine restrained light detail behind the source with drawn cash above it: ovation fountain, heart handoff and webcam storm. Cash thins before impact, appears in short authored waves, and clears completely in information. The top-tier storm excludes the donor/callout area while preserving overhead and right-hand movement. Safe quality retains a smaller cash signature. Studio uses tonal layering, thin boundaries and inset selection edges without card shadows.

### Shadow Vocabulary

- **Donor legibility** (`text-shadow: 0 5px 20px rgba(0, 0, 0, 0.75)`): solid white names over source or broadcast.
- **Amount legibility** (`text-shadow: 0 12px 28px rgba(0, 0, 0, 0.6)`): pale amount over transparent broadcast; disabled on the dark paper-strip amount.
- **Reading surface** (`box-shadow: 0 18px 60px rgba(0, 0, 0, 0.25)`): ambient separation for the information card.

**The Quiet Landing Rule.** Hide the source scene and all supporting spectacle in the information phase, release source media, and retain the name, amount and complete message.

## Shapes

There is no common live aperture silhouette. Each show uses its own source-derived form: Turkey's foot ellipse and stepped line, the dancer's fine red floor, rodent shutters and tilted rectangles, paper's torn polygon/perforation, ovation's panorama and vertical wings, the booth's clipped opposing corners and drawn heart, or the webcam's bordered square monitors. Preserve these forms in their scenes.

Studio controls use restrained corners: common fields/buttons and tree rows use the control radius, timeline regions use timeline radius, and lifecycle segments use lifecycle radius. The information card keeps its larger reading radius. Live media is square-edged except for authored reveal clipping and the booth's polygon corners. The heart's original bunny emote is a 70px sticker at (840, 775), rotated −8° before the scene scale; the Studio mark is 36px. The old diamond/circular aperture, outline words and corner frame belong to Studio-only Donate8. Studio’s real stream photograph is authoring context only.

## Components

### Studio buttons and cue actions

Compact neutral actions use studio-button and a 1px Studio Border. Hover uses Studio Control Hover. Focus is a 2px Studio Peach inset outline. Selected modes, inspector tabs and primary actions use studio-button-primary with weight 600; disabled actions fade to 0.45 opacity. Transport, restart, seeking, pane and visibility actions use coherent Lucide icons with accessible names and action/shortcut tooltips. Click-plus-flash calibration retains its textual label. Timeline cue marks are 2px strokes at rest; hero, selected, hovered and focused cues expand into the 23px-high muted-peach label, capped at 118px width. Candidate timing regions use dashed borders. Cue and timing regions are actionable buttons.

### Fields

Inputs, native selects and resizable textareas share studio-field and a 1px Studio Border. Inspector fields span their container. Explicit 11px labels sit above with a 4px gap and 12px between inspector fields; paired numeric fields use an 8px grid gap. Keep the common peach focus outline and range/checkbox accent. Invalid PLN and export failures use inline Studio Error text. Stress-preset buttons are subdued 9px controls, 23px minimum height and 3px 7px padding.

### Tree and inspector navigation

The selected scene-tree row uses a muted plum fill and peach label. Each 30px row has a Lucide layer icon, a selection action and an independent Eye/EyeOff button; cash appears for the three eligible scenes. Donation data, Inspector and Export are integrated 30px tabs with 10px labels, a quiet selected fill and peach underline. Docked desktop panels scroll internally; smaller unsupported viewports render only the blocker. Avoid floating navigation cards or pill tabs.

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

### Cash and community reaction

Cash is a scene-specific accent: Donate5 throws a warm fountain from the panorama's base, Donate6 passes a small pink arc beside the hand-heart, and Donate7 sends a warm storm overhead and to the right. Drawn bills are 62 × 30px with a 3px corner and dark outline. The handoff caps at 12 bills; other eligible scenes cap at 72/40/14 in high/medium/safe quality. Top-tier bill centres skip (200–1100, 440–1040) on the logical stage to protect the tilted donor/callout column. Each wave lasts at most 2.8s; cash disappears during information. The original heart bunny supplies one small community response rather than a universal ornament.

### Studio timeline and preview

The multitrack timeline separates measured music waveform, estimated beats and bars, authored structure/cues, vocal phrases/words, source media, eligible cash, typography and scene/camera. Cyan waveform and downbeat ticks distinguish measurement; peach overlay traces and pale playhead indicate inspection. Vocal regions are subdued blue, media teal, cash ochre, type rose, camera lavender and structure taupe. Candidate regions are dashed; estimates stay visibly labelled. The SVG is labelled accessibly. Genuine timecode, transport, precise time input and clickable tracks inspect the same music time.

The inspector exposes source position/frame and pose hold, measurement, vocal timing and correction; export uses the same compact fields, peach primary action and a thin progress indicator. Preview modes are the supplied real stream photograph, 24px checker tiles, solid graphite or transparency. Clean preview fills the viewport without Studio chrome. Safe mode hides supporting GPU detail while preserving source/DOM/SVG choreography and reduced cash.

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
- **Do** preserve transparent negative space and the built per-scene localization scales.
- **Do** use peach for Studio selection, cyan for measurement, and monospace for genuine timecode.
- **Do** keep cash distinct by source and protect the top-tier donor column.

### Don't:

- **Don't** replace selected GIF footage, recolor the sources or turn seven scenes into one recolored template.
- **Don't** reinstate the common aperture as the live composition or swap source subjects between scenes.
- **Don't** enlarge supporting effects until they compete with the source gesture or readable donor.
- **Don't** force a universal centred hero, crop donor text or permanently truncate messages.
- **Don't** turn Studio inspection backgrounds into opaque broadcast artwork.
- **Don't** invent a live Donate8 threshold, new track or fully static reduced-motion behavior.
- **Don't** apply this scoped donation identity to unrelated legacy overlays.
- **Don't** use the banner gradient as a full-frame donation background or add bunny confetti.
- **Don't** restore spacious rounded cards, pill tabs or gold hero cues in the graphite Studio.

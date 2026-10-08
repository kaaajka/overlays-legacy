---
name: Kaaajka GIF-led Donation Shows
description: Seven localized native-sized Kaaajka mini-shows and a Polish graphite authoring desk with peach/cyan accents.
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
  reaction-plum: "#2b222a"
  reaction-bezel: "#a78385"
  reaction-cream: "#fff4e5"
  reaction-peach: "#f3a08f"
  reaction-pink: "#ed7eaa"
  reaction-cyan: "#66d4dd"
  reaction-paper: "#ffe7c7"
  reaction-cash: "#f7dfad"
  reaction-cash-ink: "#654c42"
  name-lavender: "#bcb8ff"
  name-pale: "#f1eaff"
  white: "#fff"
  information-ink: "rgba(30, 23, 29, 0.95)"
  information-peach: "#ffccb8"
  information-white: "#fff6f1"
  information-edge: "#d89885"
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
  studio-selection: "#3c3438"
  studio-error: "#ff9eaa"
  cash-paper: "#f8e2b3"
  cash-ink: "#524133"
typography:
  donor-name:
    fontFamily: "Poppins, sans-serif"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  donor-amount:
    fontFamily: "Poppins, sans-serif"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  information-title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "28px"
    lineHeight: 1.3
  body:
    fontFamily: "Poppins, sans-serif"
    fontSize: "30px"
    lineHeight: 1.55
  label:
    fontFamily: "Poppins, sans-serif"
    fontSize: "12px"
    lineHeight: 1.45
  studio-title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "12px"
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
  reaction-monitor: "9px 9px 17px 9px"
  control: "3px"
  timeline: "2px"
  lifecycle: "3px"
  information: "20px 20px 30px 12px"
spacing:
  reaction-donor-gap: "20px"
  compact-gap: "4px"
  field-gap: "5px"
  pair-gap: "8px"
  studio-inset: "12px"
  tree-inset: "8px"
  currency-gap: "14px"
  donor-stack-gap: "24px"
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
    rounded: "{rounded.timeline}"
    padding: "4px 5px"
  information-card:
    backgroundColor: "{colors.information-ink}"
    textColor: "{colors.information-white}"
    rounded: "{rounded.information}"
    padding: "28px 36px 32px"
    width: "max-content"
  paper-strip:
    backgroundColor: "{colors.paper-cream}"
    textColor: "{colors.paper-ink}"
    width: "520px"
    height: "142px"
  reaction-monitor:
    backgroundColor: "{colors.reaction-plum}"
    rounded: "{rounded.reaction-monitor}"
    padding: "9px 9px 23px"
---

# Design System: Kaaajka GIF-led Donation Shows

## Overview

**Creative North Star: "Seven GIFs Conduct the Show"**

Each live donation is a miniature music video conducted by Kaaajka's selected GIF, its existing track and its legacy joke. The room dancer calls for a two-step, the masked dancer leaves transparent echoes, the rodent cuts through a film strip, the seated portrait unrolls paper, the crowd opens its arms, the streamer passes a heart, and the tiny webcam interrupts through a monitor wall. Exuberance and ascending importance come from these subjects, their distinct layouts and their timed donor payoffs.

Shared infrastructure supports those seven compositions: a transparent broadcast stage, solid donor typography, absolute music time, source-frame seeking and a calm complete-message landing. Production v2.2 composes smaller source-aware windows, a single donor/amount stack per show, deliberate negative space, source-specific cash payoffs and selective community replies. Handwritten OMG and HOLY/MOLY assets adapt the supplied banner's written character; original source GIFs remain unchanged. The supplied peach channel banner, controller avatar and white bunny emotes establish warmth and expressive reaction; they do not recolor the selected GIFs.

Donate7 now builds a warm handmade CRT reaction wall around the original tiny webcam: solitary signal, monitor recruitment, three interruptions, recovery, authored false calm and sequential shutdown. Its donor stays outside the camera group. Finite seeded bills, paper, ribbons and four fireworks articulate the three peaks; original bunny stickers and source-pose stills answer the footage. This extension follows `docs/DONATE7_CREATIVE_DIRECTION.md`; the original GIF, WebM and audio remain unchanged.

Motion Studio is a graphite authoring desk: tree, central fitted stage, inspector and multitrack timeline. Peach marks selection and deliberate actions; cyan carries measurement and the small bunny identity mark. This document records the built post-v2.2 extension of pinned direction `d2f60c0f`, inspected from current source. `docs/assets/post-2.2/round-2/` records the responsive scene and Studio captures; `review-1/` records corrected shortcuts, Donate5 cash contrast and the smaller-screen blocker, while `visible/information-full.png` records the complete-message landing. The fresh static review's four findings (shortcut layout, Donate5 cash contrast, missing blocker evidence and stale cash documentation) are resolved. No approved comp or QUALITY BAR card exists. Static captures do not independently prove normal-speed motion quality, an After Effects-level finish or owner approval; test results belong to the final QA report. The old SAY MY NAME composition remains a Studio-only Donate8 exploration sharing Donate7's track. Unrelated legacy overlay styles remain outside this document's scope.

Donate7's current primary visual evidence is `docs/assets/donate7-creative/round-2/` over the supplied real Rocket League stream; checker, solid and transparent captures provide additional inspection contexts. Its review-required exact-hero amount visibility fix is implemented: every amount digit is visible at 13.21215s. Owner approval of normal-speed music and visual quality remains pending, and browser evidence does not certify OBS hardware performance. Functional and performance conclusions belong to the final QA report.

**Key Characteristics:**

- Seven recognizable, unchanged source GIF identities and seven distinct compositions.
- Scene-specific gestures, text placement and donor impact.
- Honest source alpha, room context, frame cadence and pixel texture.
- Supporting effects restrained around the source and readable donor.
- Shared music clock, deterministic seeking and a quiet complete-message landing.
- Localized compositions with transparent margins that preserve gameplay.
- Cash fountain, handoff and finite reaction-wall spectacle reserved for selected higher-tier payoffs.
- Donate7's handmade CRT wall, stable donor and finite three-depth spectacle at three authored interruptions.
- Cue-based cyan bunny replies for Turkey/ovation, drawn bunny-ear floor for the dancer, native cheering bunny for the heart and a small Studio identity mark.
- Exact transparent frame zero and a compact content-sized Information landing.
- Polish labels and contextual help in the incumbent docked Studio.
- Flat graphite Studio panels, compact controls and peach keyboard focus.
- Aspect-aware bounded source groups, full-viewport cash and a separate output-format/viewer-zoom pair.
- Resumable Full Alert transport with current local speech, optional IN/OUT and one timeline playhead.
- Installable desktop shell with explicit local-service availability.

## Colors

Source footage supplies the dominant image color. Treatment accents echo that footage, while peach and cyan connect the authoring desk to Kaaajka's supplied identity. Frontmatter records the source values, while the names below describe their use.

### Primary

- **Turkey Tan / Turkey Cream:** warm room-dance identity and pale amount.
- **Mask Red / Mask Peach:** warm amount around the unchanged masked silhouette; a pale drawn bunny-ear floor answers the step.
- **Rodent Ochre / Rodent Yellow:** fur-derived identity with a bright amount and handwritten OMG reaction.
- **Paper Tile / Paper Cream / Paper Ink:** bathroom-derived neutrals, the unrolling strip and its dark amount.
- **Ovation Amber / Ovation Cream:** crowd-derived warmth and pale amount; handwritten HOLY/MOLY windows retain the opposing wing gestures above the bounded source.
- **Heart Rose / Heart Pale / Heart Line:** restrained pink supporting effects, amount and the drawn hand-heart bridge below the donor stack.
- **Webcam Grey / Webcam Paper / Monitor Border:** retained legacy webcam treatment values; the current reaction wall uses the reaction palette below.
- **Reaction Plum / Bezel / Cream / Peach:** Donate7's dark handmade CRT casing, warm inset border, readable donor/slam and setup/impact strokes.
- **Reaction Pink / Cyan / Paper / Cash / Cash Ink:** Donate7's paper and ribbon inventory, cyan signals, warm spark accents and outlined physical bills. Original footage and bunny colors stay intact.

### Secondary

- **Studio Peach / Peach Ink:** selected modes and inspector tabs, primary actions, focus outlines, range accents and overlay measurement trace; dark ink keeps selected-control text legible.
- **Studio Cyan / Bar Cyan:** subdued waveform and downbeat measurement. The original cyan bunny remains unchanged in the Studio brand mark.
- **Studio Cue / Playhead:** muted peach hero/selected cue labels and a pale one-pixel time indicator.
- **Cash Paper / Cash Ink:** warm drawn bills for ovation and webcam; the heart handoff uses Heart Pale.
- **Name Lavender / Name Pale:** retained only for the old Studio-only SAY MY NAME treatment.

### Neutral

- **White:** live donor names and timeline playhead; Information uses its own softer white.
- **Information Ink / Peach / White / Edge:** warm translucent reading surface, fixed peach header, soft white message and muted peach boundary over arbitrary broadcast content.
- **Studio Ink / Panel / Stage / Timeline:** graphite shell, side panels, darker preview well and timeline bed.
- **Studio Text:** primary authoring foreground.
- **Studio Muted / Studio Label:** secondary status, timestamps and field labels.
- **Studio Control / Studio Control Hover:** control fill and hover response.
- **Studio Border / Selection:** thin boundaries and a subtly plum selected tree row with a peach selected label.
- **Studio Error:** inline validation and export-error text.

**The Source Palette Rule.** Preserve the selected source's colors and alpha. Apply each treatment's paired accents to authored graphics and amount; use dark Paper Ink for the paper-strip amount. The shared Information state uses its own warm peach header.

**The Transparent Stage Rule.** Leave the broadcast around source windows transparent outside authored transient effects. Donate7's brief dark veil and peach light wash belong to its interruptions; Studio stream and checker backgrounds are inspection context.

**The Selective Sticker Rule.** Give each community device a job in its scene: the cyan bunny answers Turkey's step and ovation, the drawn ears compress with the dancer's floor, and the cheering bunny answers the hand-heart. Donate7's original cheer/cyan stickers answer its named interruptions, with occasional small original emote stamps in finite paper emission. Preserve original emote colors and honest resolution; the Studio mark stays small.

## Typography

**Display Font:** Poppins with sans-serif fallback.
**Body Font:** Poppins with sans-serif fallback.
**Timecode Font:** monospace, reserved for genuine time and numerical inspection readouts.

Local regular, medium, semibold and bold files supply weights 400, 500, 600 and 700. Rounded geometric type carries a solid donor hierarchy and blunt legacy calls. Size and alignment belong to each scene; there is no universal centred hero or universal display size.

### Hierarchy

- **Donor name:** shared Poppins 600 role, bounded to 28–44px. Actual size is `max(28, min(44, nameSize, width / max(1, nickname.length × 0.7)))`. The seven donor-stack widths are 440, 580, 620, 480, 420, 480 and 540px. Names wrap anywhere; empty identity displays Anonim.
- **Donor amount:** shared Poppins 700 role, bounded to 112px and the same stack width: `min(112, amountSize, (width − 28) / (formattedAmount.length × 0.72 + 0.4))`. Preserve Polish two-decimal formatting and baseline currency: 0.26em, weight 500, normal tracking and the currency gap. The name and amount share one anchor with the donor-stack gap; Donate7 uses its reaction-donor-gap and sets all amount characters visible at the exact hero before their short positional settle.
- **Information title:** the frontmatter role applies to the donor (600); the nonwrapping amount is 26px/500. The shared header stays peach across all tiers.
- **Body:** complete message uses the body role with preserved line breaks, long-word wrapping and optional inline emote runs. The special thank-you line is 24px with a 16px bottom margin.
- **Reaction voice:** semantic donor data stays in Poppins. OMG is a transparent 200 × 80px handwritten raster; HOLY and MOLY are separate 280 × 187px CSS windows into one transparent lettering asset. Other inherited calls stay source-specific: gratitude 24px/500, dancer thanks 20px, paper caption 44px/600 at 1.12 and HALO 34px/600. Donate7 separates peach CO/ZA (60px, CSS weight 800) from a cream POJEB!!! slam (112px, CSS weight 900), a pink outlined echo, peach WTF (34px/700), HALO? (42px/700) and small bezel labels (13px/600). These 800/900 declarations use the existing local font family; they do not assert new font files. Do not promote these one-scene values into a shared heading scale.
- **Studio:** controls use label; brand uses studio-title and inspector titles use studio-heading. Field labels, status and tree actions are 11px; inspector tabs/detail are 10px; timeline tracks/regions are 9px. Timecode and numerical inspection use monospace. Contextual help uses 13px/1.6. The tiny production eyebrow remains an incumbent craft defect and is not canonized as reusable visual language. Desktop authoring requires 1280 × 720 or above; smaller viewports show only the desktop-required screen.

**The Donor Space Rule.** Keep nickname and amount in one readable stack with a shared anchor within each composition. Keep the source gesture visible and fit long donor strings within that stack.

## Layout

The broadcast uses a fixed canonical height of 1080 units and a virtual width of `viewport.width / viewport.height × 1080`. The stage scales uniformly by `viewport.height / 1080` to fill the actual output viewport. It does not reflow into a mobile donation layout. Production v2.2's source sizes and 1920 × 1080 anchors below remain the reference composition; the extension applies `--stage-extra = virtualWidth − 1920` to authored horizontal groups, generally at 0.35 or 0.65 of that difference. Wider outputs separate bounded sources, donor groups and supporting accents rather than enlarging the original GIFs. Timeline transforms animate those moving anchors. The previous per-scene assembly scales remain removed; dimensions describe fully released windows, not a full-frame movie.

| Live scene | Source placement | Donor and signature composition |
| --- | --- | --- |
| Donate1 · Turkey two-step | One native 480 × 400 room at (470, 320). | Right reply at (1000, 425), donor stack 46px below, width 440. Cyan reply at (960, 704), 72px from a native 56px original; stepped baseline at y718. |
| Donate2 · Masked dance floor | Lead 286 × 400 at (765, 250); 150 × 210 echo at (550, 405), 172 × 240 echo at (1110, 380). | One centred 580px donor stack at (650, 700); 630 × 76px drawn bunny-ear floor at (600, 606) compresses/releases at the existing cue. |
| Donate3 · Rodent rave | Bounded 520 × 390 projection at (610, 320); two 170 × 128 screens at (440, 495)/(1160, 390). | 620px stack at (630, 750); shutter cut and handwritten 200 × 80px OMG at (1145, 565). Pixel texture stays deliberate. |
| Donate4 · Deadpan paper roll | One 350 × 522 portrait at (1060, 260). | Left answer at (525, 315), 480px donor stack 125px below; torn 520 × 142px strip at (−24, 208) within the answer carries the amount. |
| Donate5 · Arms-wide ovation | Bounded 600 × 338 crowd at (475, 365), about 1.25× its 480 × 270 source. | 420px donor stack at (1120, 440); handwritten 280 × 187px HOLY/MOLY windows at x475/x780, y207 retain opposing gestures. Native 56px cyan aside at (1030, 723). |
| Donate6 · Heart from the booth | Native 400 × 400 booth at (1070, 320). | 480px donor stack at (540, 400); 600 × 414px bridge starts at (460, 620), below reserved name/amount space. Thanks at y650 and native 56px cheering bunny at (875, 712). |
| Donate7 · Broadcast reaction wall | Main 240 × 240 base source window at (1090, 380), 2× the original 120px footage before brief wall/camera punches; two 134px satellites at (885, 390)/(1385, 475) and six 100px source-pose stills, all within handmade CRT bezels. | Stable 540px donor stack at (405, 535), outside camera/wall transforms; 650px headline at (385, 265), WTF at (425, 820). Source groups apply authored horizontal extra-width factors from 0.20 to 0.87; donor/type use 0.28. Source-pose frames 0/15/38/62 give the wall distinct reactions. |

The Information panel centres on the stage and uses `width: max-content`, min-width 560px, max-width 960px, automatic height and a 600px height cap. Its padding and asymmetric reading corners are in frontmatter. Captured short/default content is about 560 × 165px, the safe long-content example about 960 × 304px, and the emote example about 306px high; these are content observations, not fixed-height tokens. The fixed header has a 36px gap and 18px bottom padding. Only the message body shrinks and scrolls (`min-height: 0`, flex `0 1 auto`); names wrap in full and amount/currency stay together. Overflow scrolls after a 2500ms reading pause with a closing hold. Inline emotes reserve 45px square slots (1.5em) at this body size while retaining source aspect ratio. The separate readable error fallback remains width `min(80vw, 1240px)`, max-height `80vh`; it is not the normal Information panel.

Studio 2.2 retains the docked Studio 2.1 workspace and owns the desktop viewport at 1280 × 720 and above. Below either threshold, only a desktop-required screen reports the current and recommended dimensions. No mobile editor is rendered. A 46px toolbar and 20px footer enclose docked React-17-compatible split panes. Default horizontal allocation is 14% tree / 64% Program / 22% properties; vertical allocation is 62% workspace / 38% Timeline. Side panes collapse, all three dividers resize, and local preferences persist. Reset Workspace and divider double-click restore defaults. Maximize active panel saves and restores the exact preceding layout. Compact 26px dock headers mark the active panel subtly; properties tabs remain integrated.

The Program viewer uses ResizeObserver dimensions to fit the selected output viewport. Fit refits immediately with every pane operation. Output format and viewer zoom are separate: presets include 1280 × 720, 1366 × 768, 1920 × 1080, 2560 × 1440, 3840 × 2160, 1920 × 1200, 2560 × 1080, 3440 × 1440, 3840 × 1080 and 5120 × 1440, plus custom even dimensions (width 320–8192, height 240–4320). The acceptance capture matrix spans eight principal HD Ready-through-4K formats, including 16:9, 16:10, 21:9 and 32:9. Manual viewer zoom is clamped to 10–400%; Ctrl/Cmd-wheel keeps the source point under the pointer, wheel and touchpad scroll locally, Shift-wheel pans horizontally, and pointer dragging pans outside Fit. Centering is explicit. The stage clips and contains paint; it never contributes document overflow. The supplied photographic Rocket League stream is the default authoring background. A custom PNG/JPEG/WebP can replace it locally. Production remains transparent.

Timeline has a 36px control strip, sticky 150px track headers, 28px ruler, 31px standard tracks and 52px music waveform. Content width is max(available width, 900px × zoom), at 1–128×, with adaptive subsecond ruler ticks. Wheel scrolls locally; Shift-wheel pans horizontally and Ctrl/Cmd-wheel zooms around the pointer. A single global axis and playhead span all tracks. The bottom navigator pans its viewport and resizes its handles to zoom; center-playhead acts on the same viewport. Playhead and IN/OUT use pointer capture; Shift-drag creates a range without browser text selection. IN/OUT are nullable: no range means empty fields and disabled range looping, while clearing truly removes selection. Tylko animacja spans original music. Pełny alert spans the shared lifecycle plan: Hero, overlapping Information and sequential nickname/amount/message speech, then Outro and COMPLETE. A dedicated sample-clock authoring transport reconstructs music and current speech sources on play, resume, seek and loop, including post-music phases. The main timecode edits inline and seeks that same clock. Detached lifecycle summary boxes remain removed. Fresh startup selects Donate1, Pełny alert, manual scene selection and stream background, with no range and looping off. Graphite/peach/cyan chrome, Poppins and Lucide preserve Studio identity. Scrollbars are subdued and visible; native text selection is restored in editable and explicitly copyable fields.

## Elevation & Depth

Depth follows the source: opaque footage remains a bounded room, portrait or crowd window; the alpha dancer stands directly over broadcast content; tilted rodent screens and webcam monitors create layering. Donate1–4 use no GPU effects or cash. Donate5/6 combine restrained light behind the source with two-depth cash: ovation fountain and heart handoff, using smooth nonzero alpha falloff around measured donor bounds. Donate7 replaces that shared effect path with three Canvas2D layers (back/mid/front), finite bills/paper/ribbons and four back-layer fireworks; stable seeded depth, foreground routes and continuous trajectory deflection around actual donor geometry protect the separate donor. Its CRT casing, inset border, scanlines and short outlined echo add physical depth around honest pixel footage. Spectacle clears in information; safe quality retains each signature type at reduced density and without trails. Studio uses tonal layering and thin boundaries for docked panels; help popovers carry soft shadows. The rodent projector still carries an incumbent hard offset shadow; this is not canonized as a reusable depth token.

### Shadow Vocabulary

- **Donor legibility** (`text-shadow: 0 2px 2px #1e1819, 0 4px 10px #1e1819`): shared solid name/amount outline over gameplay; disabled on the paper amount.
- **Reading ambient** (`box-shadow: 0 20px 45px rgba(0, 0, 0, 0.22)`): soft separation for Information. The built card also carries an 8px hard lower edge; like the projector offset shadow, that incumbent treatment is recorded but not canonized as a reusable depth token.
- **Reaction CRT** (`box-shadow: 5px 14px 26px rgb(15 9 18 / 55%), inset 0 0 0 2px #a78385`): Donate7's handmade monitor casing; this belongs to that reaction wall.

**The Quiet Landing Rule.** Hide the source scene and all supporting spectacle in the information phase, release source media, and retain the name, amount and complete message.

## Shapes

There is no common live aperture silhouette. Each show uses its source-derived form: Turkey's foot ellipse and stepped reply, the dancer's drawn bunny-ear floor, rodent shutters and tilted small rectangles, paper's torn edge/perforation, ovation's bounded rounded window and handwritten wings, the booth's asymmetric soft corners and drawn heart, or the webcam's bordered pixel monitors. Preserve these forms in their scenes.

Studio fields/buttons use the control radius; selected tree rows and timeline regions use timeline radius, and lifecycle segments use lifecycle radius. Information uses asymmetric soft reading corners. Rodent, ovation, booth and main webcam frames carry their own source-specific rounded silhouettes; no universal card radius replaces them. The heart's original cheering bunny is 56px, rotated −8° at (875, 712); the Studio mark is 24px. The old diamond/circular aperture, outline words and corner frame belong to Studio-only Donate8. Studio’s real stream photograph is authoring context only.

## Components

### Studio buttons and cue actions

Compact neutral actions use studio-button and a 1px Studio Border. Hover uses Studio Control Hover. Focus is a 2px Studio Peach inset outline. Selected modes and primary actions use studio-button-primary with weight 600; inspector tabs use the quiet fill and peach underline described below; disabled actions fade to 0.45 opacity. Transport, restart, seeking, pane and visibility actions use coherent Lucide icons with accessible names and action/shortcut tooltips. Click-plus-flash calibration retains its textual label. Timeline cue marks are 2px strokes at rest; hero, selected, hovered and focused cues expand into the 23px-high muted-peach label, capped at 118px width. Candidate timing regions use dashed borders. Cue and timing regions are actionable buttons.

### Fields

Inputs, native selects and resizable textareas share studio-field and a 1px Studio Border. Inspector fields span their container. Explicit 11px labels sit above with a 4px gap and 12px between inspector fields; paired numeric fields use an 8px grid gap. Keep the common peach focus outline and range/checkbox accent. Invalid PLN and export failures use inline Studio Error text. Stress-preset buttons are subdued 9px controls, 23px minimum height and 3px 7px padding.

### Tree and inspector navigation

The selected scene-tree row uses a muted plum fill and peach label. Each 30px row has a Lucide layer icon, a selection action and an independent Eye/EyeOff button; cash appears for the three eligible scenes. Donation data, Inspector and Export are integrated 30px tabs with 10px labels, a quiet selected fill and peach underline. Docked desktop panels scroll internally; smaller unsupported viewports render only the blocker. Avoid floating navigation cards or pill tabs.

### Contextual help

Polish controls pair with compact Lucide help buttons. A fixed warm graphite popover uses readable 13px/1.6 prose, a peach heading and a soft shadow. Help explains what a concept means and what the control changes. Displayed authored cue/structure names are Polish; internal keys and verbatim music lyrics retain their original values.

The `?` action and Shift+/ open the Polish Skróty klawiszowe dialog with eleven command rows. Its two-column key/description layout accommodates long combinations; modal naming, initial focus, a trapped Tab and Escape/close with focus restoration make it keyboard accessible.

### Source media and seven donor payoffs

Use the selected originals through GIF-derived, seekable VP9 WebM, with an unmodified source poster while loading and original GIF fallback on failure. Preserve full source content and cadence in conversion: opaque sources use audited visually lossless VP9 CRF 4 / 4:4:4; masked dancer is lossless VP9 alpha with 4:2:0 chroma. Scene transforms and reveal clips are authored separately. Rodent and webcam retain pixelated rendering. Original GIF fallback preserves identity but cannot guarantee authored frame synchronisation.

Normal forward playback lets the native decoder run sequentially against the audio-derived expected source phase, correcting drift at discontinuities or when it exceeds the source-aware threshold. Scrubbing, pausing, authored pose holds and export select exact deterministic source frames. Derived Donate4 and Donate6 WebM files use lossless all-intra VP9; other derived encodings retain their existing representation. The original seven GIFs and MP3s are unchanged. Presented-frame and seek diagnostics distinguish the source cadence from engine-induced discontinuities; these mechanisms alone are not evidence of smooth playback on the target OBS machine.

| Scene | Signature motion and exact amount cue |
| --- | --- |
| Turkey two-step | Name arrives from right; floor compresses, amount rocks from −2° through +2° and settles, source answers with a short sway. Cyan community reply enters at hero +0.1s over 0.3s. Hero 3.06503s; chosen source pose 1.13s. |
| Masked dance floor | Lead kicks in from left; delayed transparent echoes join; name descends within the anchored donor stack. Drawn bunny-ear floor compression precedes amount's vertical release from 0.78 to 1 over 0.48s with `back.out(1.8)`. Hero 3.66875s; arms-up source pose 2.52s. |
| Rodent rave | Hard source cuts, staggered character steps and opposing tilted screens lead to three-step shutter closure. Hero cuts shutters open, reveals handwritten OMG/amount and stutters the projector. Hero 4.82975s; source pose 0.20s. |
| Deadpan paper roll | Portrait reveals vertically while remaining planted; paper unrolls to 70% before the payoff. Amount appears at 0.88 horizontal scale, then strip/amount finish their 0.35s unroll. Hero 4.52789s; source roll pose 1.93s. |
| Arms-wide ovation | Bounded crowd window opens horizontally; handwritten HOLY/MOLY rise from opposing directions, with a native cyan community aside at hero +0.1s. Pre-drop closes width to 0.72; hero releases to full width over 0.45s `expo.out`, with restrained glints. Hero 4.82975s; open-arms source pose 2.00s. |
| Heart from the booth | Soft donor reveal and HALO anticipate a partial drawn heart. Hero reveals amount; the line completes over 0.7s `power1.out`, then the thank-you lands. The bridge starts below the donor rectangle. Hero 3.90095s; hand-heart source pose 2.32s. |
| Broadcast reaction wall | Tiny CRT signal recruits a wall; CO at 11.80735s and ZA at 12.27175s anticipate the 13.21215s hero. All amount digits are visible at that exact hero; letter slam, camera punch and finite spectacle then recover. Reverse-wall reprise at 22.89488s and largest interruption at 37.66277s; authored false calm starts 33.52961s inside loud music, exit starts 43.67673s. Hero source pose remains 1.52s; four still poses use original frames 0/15/38/62. |

Shared cue names are `intro → firstImpact → donorReveal → buildStart → preDrop → heroDrop → settle → information`; the timeline default is `power2.out`. Each scene owns its shots and tween choices. Chosen source poses hold near hero according to per-asset before/after windows, then resume looping from that pose. Dancer echoes delay 0.12/0.24s, rodent screens 0.08/0.16s, webcam satellites 0.12/0.24s. The source and music clock remain at exact zero on restart/reverse seek; the public visual contract at `time = 0` is complete transparency. The root starts with `data-time-zero="true"`; CSS hides the stage and every descendant with `visibility: hidden !important`, including before media readiness and after reverse seek/restart. GSAP's private one-microsecond initialization only establishes internal set state and never authorizes visible zero-frame content. Source entry is authored at 0.05s over 0.1s; INITIAL capture is 0.15s, distinct from ZERO.

The last 0.5s clears source scene/effects; the last 0.4s reveals information. Donate7 additionally retracts its headline and shuts down CRTs sequentially from 43.67673s, closes the last monitor at 45.45s and releases the spectacle envelope at 45.7s. Its paused absolute-time GSAP director uses CustomEase for mechanical/heavy/camera response, SplitText for the slam and DrawSVG for impact strokes; canvas trajectories depend on absolute time and seed rather than seek history. Root outro is an opacity transition of 0.65s ease-out. Reduced-motion CSS removes that root transition; it does not provide a complete static alternative to the GSAP scene.

**The Music Clock Rule.** Derive authored scene and controlled source frames from absolute music time. Forward playback uses sequential native decoding with drift correction; scrub, freeze and export select exact frames. Quality reduction changes supporting detail, not cue timing, donor layout or the reading phase.

### Information card

Use the content-sized information-card surface, shared peach fixed header and soft white complete message. Preserve line breaks, unbroken-word wrapping and body-only overflow reading. Approved image runs keep stable aspect-preserving emote slots; information time selects decoded frames without a private animation loop. Plain shortcodes remain plain text unless explicit supported image metadata resolves them. Studio's two explicit local fixtures are preview data, not evidence of an unknown Tipply backend contract. The optional special thanks remains a small pale-accent paragraph. Information stays readable during renderer degradation and releases source videos and fallbacks when the show ends.

### Cash and community reaction

Cash is a scene-specific accent: Donate5 throws a warm fountain from a measured donor-relative origin (`donor.x`, `donor.y + 240`), and Donate6 passes a small pink arc from a donor-relative origin beside the hand-heart. Their drawn bills are 62 × 30px with a 3px corner and dark outline. The handoff caps at 12 bills; the ovation caps at 72/40/14 per renderer in high/medium/safe quality. Six out of seven seeded bill indices route behind source/text, one in seven in front; depth never changes when a bill enters the donor area. A continuous 160-unit distance falloff around the measured moving donor rectangle multiplies existing bill alpha by at least 0.14 behind and 0.35 in front. These are alpha multipliers, not absolute opacity guarantees. Each wave lasts at most 2.8s. Cyan replies in Turkey/ovation and the cheering heart bunny have distinct scene roles; their entrance follows named music cues, not a private animation timer.

Donate7 has its own finite seeded spectacle inventory: 64 × 30px outlined bills, corner paper cannons, top cascades, curling ribbons and four fireworks at 13.39215/23.07488/37.84277/38.20277s. Three persistent depth canvases use high/medium/safe active-particle caps of 480/260/110 and nominal backing targets of 2,000,000/1,200,000/650,000 pixels **per canvas** (rounded raster dimensions can differ slightly; the three-canvas total is three times that target). Emission lifetimes are finite, at most 4.4s. Quality reduces per-emitter quotas while retaining all signature types; safe removes trails. Foreground sweeps route above/below measured donor bounds, and continuous trajectory deflection protects the donor without deleting particles inside a rectangle. Some paper indices carry small original bunny stamps; the two large original stickers are cue-led replies. Canvas geometry spans the actual virtual viewport, independently of backing resolution. All cash/spectacle clears in information and disposes at unmount.

### Studio timeline and preview

The multitrack timeline separates measured music waveform, estimated beats and bars, authored structure/cues, vocal phrases/words, source media, eligible cash, typography and scene/camera. Cyan waveform and downbeat ticks distinguish measurement; peach overlay traces and pale playhead indicate inspection. Vocal regions are subdued blue, media teal, cash ochre, type rose, camera lavender and structure taupe. Candidate regions are dashed; estimates stay visibly labelled. The SVG is labelled accessibly. Genuine timecode, transport, precise time input and clickable tracks inspect the same music time.

The inspector exposes source position/frame and pose hold, measurement, vocal timing and correction; export uses the same compact fields, peach primary action and a thin progress indicator. Preview modes are the supplied real stream photograph, 24px checker tiles, solid graphite or transparency. Clean preview fills the viewport without Studio chrome. Safe mode hides supporting GPU detail while preserving source/DOM/SVG choreography and reduced cash.

Current nickname, amount, message and chosen voice produce real local speech clips through the authoring-service adapter. The voice menu enumerates the host's installed Windows SAPI voices (two available on the reviewed host); it does not invent Google identities or describe local speech as production-equivalent. Data changes invalidate current speech until preparation completes, and Full playback/export use those prepared clips and durations. Production Google speech configuration remains unchanged. Recognized vocal candidates, verified phrases and authored reactions retain their distinct evidence/approval roles.

### Installable authoring shell

The public `/motion-studio` entry carries a standalone Web App Manifest, owned icons and a scoped shell service worker. Supporting browsers expose Zainstaluj Motion Studio when installation is available; an installed shell suppresses that action. A waiting service-worker update offers an explicit restart. Cached shell modules, styles and fonts can keep the desktop UI available after a successful initial load, while large scene/music media and local service responses remain outside the shell cache. Export, speech preparation and correction persistence depend on the local backend through `authoringServices`; missing capabilities show Usługi lokalne są niedostępne and explain unavailable work. The service worker is not an offline media library or a replacement for Node/FFmpeg/SAPI. Desktop gating remains at 1280 × 720; this is preparation for a future desktop host, not an Electron/Tauri migration.

Donate8 retains the older name-centred, lavender aperture composition in Studio using the existing Donate7 track. It has no live threshold or independent audio asset.

## Do's and Don'ts

### Do:

- **Do** build each live show's composition and signature gesture around its selected GIF, existing track and legacy joke.
- **Do** preserve original source colors, alpha, environment, frame cadence and honest pixel texture.
- **Do** keep the shared name/amount anchor and fit complete names and Polish amounts within each authored scene.
- **Do** leave broadcast space transparent, scale the 1080-unit height uniformly and adapt the virtual width to the output aspect.
- **Do** clear spectacle, release source media and preserve complete readable messages.
- **Do** use absolute music time for reproducible seeking and keep cue timing consistent across quality modes.
- **Do** retain explicit Studio labels, visible focus and the supported desktop docked inspector and smaller-screen desktop gate.
- **Do** preserve transparent negative space, bounded source windows and source-specific anchors that accommodate extra width.
- **Do** use peach for Studio selection, cyan for measurement, and monospace for genuine timecode.
- **Do** keep cash distinct by source, route stable depth and derive readability protection from actual donor bounds: alpha falloff for Donate5/6, three-depth routes and trajectory deflection for Donate7.
- **Do** keep output format separate from Program zoom, Full transport resumable and speech provider labels honest.

### Don't:

- **Don't** replace selected GIF footage, recolor the sources or turn seven scenes into one recolored template.
- **Don't** reinstate the common aperture as the live composition or swap source subjects between scenes.
- **Don't** enlarge supporting effects until they compete with the source gesture or readable donor.
- **Don't** force a universal centred hero, crop donor text or permanently truncate messages.
- **Don't** turn Studio inspection backgrounds into opaque broadcast artwork.
- **Don't** invent a live Donate8 threshold, new track or fully static reduced-motion behavior.
- **Don't** apply this scoped donation identity to unrelated legacy overlays.
- **Don't** use the banner gradient as a full-frame donation background or spread Donate7's finite bunny-stamped paper treatment to other scenes.
- **Don't** restore spacious rounded cards, pill tabs or gold hero cues in the graphite Studio.
- **Don't** delete bills on entry to an invisible text rectangle or enlarge low-resolution source media merely to fill ultrawide output.
- **Don't** treat static captures as motion-quality approval, local SAPI as production Google speech or shell caching as offline authoring-service support.

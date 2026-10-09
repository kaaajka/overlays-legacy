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
  donate7-berry: "#380b26"
  donate7-pink: "#f14b89"
  donate7-peach: "#ffc2a7"
  donate7-ivory: "#fff1d7"
  donate7-amount: "#ae1557"
  donate7-spectacle-peach: "#f3a08f"
  donate7-spectacle-pink: "#ed7eaa"
  donate7-spectacle-paper: "#ffe7c7"
  donate7-spectacle-cyan: "#66d4dd"
  donate7-spectacle-cream: "#fff4e5"
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
  donate7-setup:
    fontFamily: "DynaPuff Variable, sans-serif"
    fontSize: "158px"
    fontWeight: 700
    lineHeight: 0.93
    letterSpacing: "-0.025em"
    fontVariation: "'wght' 700, 'wdth' 100"
  donate7-title:
    fontFamily: "DynaPuff Variable, sans-serif"
    fontSize: "132px"
    fontWeight: 700
    lineHeight: 1.16
    letterSpacing: "-0.025em"
    fontVariation: "'wght' 700, 'wdth' 100"
  donate7-caller:
    fontFamily: "DynaPuff Variable, sans-serif"
    fontSize: "38px"
    fontWeight: 700
    fontVariation: "'wght' 700, 'wdth' 85"
  donate7-wtf:
    fontFamily: "DynaPuff Variable, sans-serif"
    fontSize: "52px"
    fontWeight: 700
    fontVariation: "'wght' 700, 'wdth' 85"
  donate7-name:
    fontFamily: "Roboto Flex Variable, sans-serif"
    fontWeight: 800
    lineHeight: 1.16
    fontVariation: "'wdth' 85, 'opsz' 48"
  donate7-amount:
    fontFamily: "Roboto Flex Variable, sans-serif"
    fontWeight: 950
    lineHeight: 1
    fontVariation: "'wdth' 88, 'opsz' 100"
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
  control: "3px"
  timeline: "2px"
  lifecycle: "3px"
  information: "20px 20px 30px 12px"
spacing:
  donate7-donor-gap: "24px"
  donate7-amount-gap: "12px"
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
  donate7-aperture:
    backgroundColor: "{colors.donate7-peach}"
    padding: "7px"
  donate7-donor-strip:
    textColor: "{colors.donate7-berry}"
    padding: "68px 36px 30px"
    width: "710px"
---

# Design System: Kaaajka GIF-led Donation Shows

**2026-10-09 owner acceptance:** the completed Donate7 motion is approved as the creative-quality reference. `docs/DONATE7_ACCEPTANCE.md` supersedes the historical pending-approval statements in this document. Donate1–6 now enter evidence-based concept planning on the existing engine and local Studio; the future AI editor is outside scope.

## Overview

**Creative North Star: "Seven GIFs Conduct the Show"**

Each live donation is a miniature music video conducted by Kaaajka's selected GIF, its existing track and its legacy joke. The room dancer calls for a two-step, the masked dancer leaves transparent echoes, the rodent cuts through a film strip, the seated portrait unrolls paper, the crowd opens its arms, the streamer passes a heart, and the tiny webcam leads a reaction scrapbook. Exuberance and ascending importance come from these subjects, their distinct layouts and their timed donor payoffs.

Shared infrastructure supports those seven compositions: a transparent broadcast stage, solid donor typography, absolute music time, source-frame seeking and a calm complete-message landing. Production v2.2 composes smaller source-aware windows, a single donor/amount stack per show, deliberate negative space, source-specific cash payoffs and selective community replies. Handwritten OMG and HOLY/MOLY assets adapt the supplied banner's written character; original source GIFs remain unchanged. The supplied peach channel banner, controller avatar and white bunny emotes establish warmth and expressive reaction; they do not recolor the selected GIFs.

Donate7 replaces only its Version A creative world with a reaction scrapbook: wide rounded CO ZA / POJEB!!! cutouts, three tiny taped original footage apertures, an integrated textured peach donor strip, HALO callers, original bunny replies and finite layered celebration. Composition 1 supplies the fan-stage direction; the explicit follow-up authorizes composition 2 hierarchy/breathing and composition 3 continuous eye-flow. The subsequent user instructions center the headline/donor, restore original green project money, replace old routes with full-screen Pixi rain and require the connected paper-camera refinement. Short translucent note crossings over the gameplay facecam are allowed. This extends the confirmed synthesis direction; it is not owner approval of completed motion. Original GIF, controlled WebM and audio remain unchanged.

Motion Studio is a graphite authoring desk: tree, central fitted stage, inspector and multitrack timeline. Peach marks selection and deliberate actions; cyan carries measurement and the small bunny identity mark. This document records the built post-v2.2 extension of pinned direction `d2f60c0f`, inspected from current source. `docs/assets/post-2.2/round-2/` records the responsive scene and Studio captures; `review-1/` records corrected shortcuts, Donate5 cash contrast and the smaller-screen blocker, while `visible/information-full.png` records the complete-message landing. The fresh static review's four findings (shortcut layout, Donate5 cash contrast, missing blocker evidence and stale cash documentation) are resolved. No approved comp or QUALITY BAR card exists for that earlier post-v2.2 review; Donate7's later delegated comp and prose quality bar are recorded in its surface brief. Static captures do not independently prove normal-speed motion quality, an After Effects-level finish or owner approval; test results belong to the final QA report. The old SAY MY NAME composition remains a Studio-only Donate8 exploration sharing Donate7's track. Unrelated legacy overlay styles remain outside this document's scope.

The previous showpiece refinement remains closed: `docs/assets/donate7-showpiece/finish-review.md` recorded five material findings, and `finish-verdict-refined.md` resolved the retained fold, thread junctions, shared shader seam, donor shadow/streamer ordering and stressed-name inset. Its full recording, transition comparisons and `round-final/` remain historical evidence; its QA recorded 334 unit tests (36 files), 88 browser tests, typecheck, lint and build in `docs/DONATE7_FINAL_REVIEW.md` and `docs/assets/donate7-showpiece/validation.json`. Earlier `donate7-pixi/` and `donate7-definitive/` iterations also remain historical.

Current three-point continuation review entry: [art-direction review](docs/assets/donate7-showpiece/art-direction/review/README.md). `art-direction/finish-review.md` records **disposition: ship**, all three requested concerns resolved, and no material fixes: evolving 17–44s composition, centered amount anticipation/compression/37.65116s impact/recovery, and the same actual donor paper continuing into complete readable Information/TTS. This is **CANDIDATE for OWNER review only**; `ownerVisualApproval` remains false, and work stops before commit/push until owner approval. The accepted Pixi rain, typography, original monitor/reaction apertures, donor paper, architecture, centered composition and prior five closures remain the foundation.

Both `art-direction/final-{5732,3000000}/donate7-full-realtime-audio.mp4` recordings cover actual 1× WebAudio music and local nickname → amount → message speech through outro/complete for 57.32 PLN and 30,000.00 PLN (displayed `57,32 zł` / `30 000,00 zł`), with `errors: []` in their metadata. Six `art-direction/review/{middle,payoff,handoff}-{5732,3000000}-before-after.mp4` clips compare identical encoded timestamps with AFTER audio only and no speed changes. `review/comparison.json`, `review/delivery-check.json` and `runtime-fingerprint.json` document provenance; all twelve comparison/full-resolution chapter files decode with non-silent AAC, no whole-black intervals and no errors. Capture uses adaptive actual live frames on software SwiftShader, encoded at 30 FPS; it does not prove native OBS/GPU 60 FPS, continuous HIGH quality or target-hardware performance. Reviewer evidence is supplied comp/stills/live-frame strips, metadata and source, without independent complete-video playback/listening. Human musical/creative acceptance, ten listening passes, exact master/remix, reliable lyric alignment and fine audible microtiming remain unclaimed.

At this documentation handoff, fresh 334 unit tests, typecheck, lint and production build passed. Lint reports 0 errors, 44 warnings and 39 infos; the main bundle is 832,758 bytes / 261,309 gzip with the existing chunk warning. The complete fresh browser rerun passed 90/90 after the stale Information scene-hiding assertion was updated to require retained paper and cleared outgoing content; definitive totals belong to `docs/assets/donate7-showpiece/art-direction/review/README.md` and its `validation.json`. Runtime changes in this continuation are exactly `choreography.ts`, `cameraRig.ts` and `donate7-show.css`; money engine, audio/TTS implementation, dependencies and money/confetti counts are unchanged. Local authoring remains the priority, with Donate1–6 and Studio history preserved.

**Key Characteristics:**

- Seven recognizable, unchanged source GIF identities and seven distinct compositions.
- Scene-specific gestures, text placement and donor impact.
- Honest source alpha, room context, frame cadence and pixel texture.
- Supporting effects restrained around the source and readable donor.
- Shared music clock, deterministic seeking and a quiet complete-message landing.
- Localized compositions with transparent margins that preserve gameplay.
- Cash fountain, handoff and finite reaction-scrapbook spectacle reserved for selected higher-tier payoffs.
- Donate7's rounded live glyphs, peach fiber strip, three taped original apertures and four distinct motion signatures.
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
- **Webcam Grey / Webcam Paper / Monitor Border:** retained legacy values; the current Donate7 replacement uses only its scoped scrapbook palette below.
- **Donate7 Berry / Pink / Peach / Ivory:** deep contour and semantic ink, energetic offset extrusion/tape, aperture paper and inflated comic letter faces. These authored graphic colors are local to Donate7; originals retain their own colors.
- **Donate7 Amount / Spectacle accents:** legible raspberry amount and underline and the five-color paper/ribbon/spark inventory. Banknotes preserve the original green project PNG and its transparent margins rather than deriving from authored palette tokens. The spectacle inventory preserves its current peach/pink/paper/cyan/cream source values; it does not recolor footage or bunnies.

### Secondary

- **Studio Peach / Peach Ink:** selected modes and inspector tabs, primary actions, focus outlines, range accents and overlay measurement trace; dark ink keeps selected-control text legible.
- **Studio Cyan / Bar Cyan:** subdued waveform and downbeat measurement. The original cyan bunny remains unchanged in the Studio brand mark.
- **Studio Cue / Playhead:** muted peach hero/selected cue labels and a pale one-pixel time indicator.
- **Cash Paper / Cash Ink:** warm drawn bills for ovation; the heart handoff uses Heart Pale.
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

**The Source Palette Rule.** Preserve the selected source's colors and alpha. Apply each treatment's paired accents to authored graphics and amount; use dark Paper Ink for the paper-strip amount. Donate1–6 Information uses its warm peach header; Donate7 carries berry reading text on its retained peach paper.

**The Transparent Stage Rule.** Leave the broadcast around source windows transparent outside authored transient effects. Donate7 uses no enclosing opaque application panel or full-stage tint; Studio stream and checker backgrounds are inspection context.

**The Selective Sticker Rule.** Give each community device a job in its scene: the cyan bunny answers Turkey's step and ovation, the drawn ears compress with the dancer's floor, and the cheering bunny answers the hand-heart. Donate7's original cheer, cyan and crying bunnies answer named hero/WTF/finale gestures; occasional small original emote stamps appear in finite paper emission. Preserve original emote colors and honest resolution; the Studio mark stays small.

## Typography

**Default Display Font (Donate1–6 / Studio):** Poppins with sans-serif fallback.
**Body Font:** Poppins with sans-serif fallback.
**Timecode Font:** monospace, reserved for genuine time and numerical inspection readouts.

Local regular, medium, semibold and bold files supply weights 400, 500, 600 and 700. Rounded geometric type carries a solid donor hierarchy and blunt legacy calls. Size and alignment belong to each scene; there is no universal centred hero or universal display size.

### Hierarchy

- **Donor name:** Donate1–6 Poppins 600 role, bounded to 28–44px. Actual size is `max(28, min(44, nameSize, width / max(1, nickname.length × 0.7)))`. The Donate1–6 donor-stack widths are 440, 580, 620, 480, 420 and 480px. Names wrap anywhere; empty identity displays Anonim.
- **Donor amount:** Donate1–6 Poppins 700 role, bounded to 112px and the same stack width: `min(112, amountSize, (width − 28) / (formattedAmount.length × 0.72 + 0.4))`. Preserve Polish two-decimal formatting and baseline currency: 0.26em, weight 500, normal tracking and the currency gap. The name and amount share one anchor with the donor-stack gap.
- **Information title:** the frontmatter role applies to the donor (600); the nonwrapping amount is 26px/500. Donate1–6 retain the shared peach header; Donate7 alone uses a berry Roboto Flex header on its continuing peach paper.
- **Body:** complete message uses the body role with preserved line breaks, long-word wrapping and optional inline emote runs. The special thank-you line is 24px with a 16px bottom margin.
- **Reaction voice (Donate1–6):** semantic donor data stays in Poppins. OMG is a transparent 200 × 80px handwritten raster; HOLY and MOLY are separate 280 × 187px CSS windows into one transparent lettering asset. Other inherited calls stay source-specific: gratitude 24px/500, dancer thanks 20px, paper caption 44px/600 at 1.12 and HALO 34px/600. Do not promote these one-scene values into a shared heading scale.
- **Studio:** controls use label; brand uses studio-title and inspector titles use studio-heading. Field labels, status and tree actions are 11px; inspector tabs/detail are 10px; timeline tracks/regions are 9px. Timecode and numerical inspection use monospace. Contextual help uses 13px/1.6. The tiny production eyebrow remains an incumbent craft defect and is not canonized as reusable visual language. Desktop authoring requires 1280 × 720 or above; smaller viewports show only the desktop-required screen.

### Donate7 typography replacement (local exception)

Donate7 uses self-hosted Fontsource Variable **DynaPuff 5.3.0** (`standard.css`) for live rounded inflated comic CO/ZA/POJEB, HALO and WTF glyphs, and **Roboto Flex 5.3.0** (`full.css`) for donor semantics. Both packages carry OFL-1.1 licenses and Latin-ext; Anybody was the discarded candidate and is removed from the current dependencies. DynaPuff provides `wght` 400–700 and `wdth` 75–100: title/setup use 700/100; HALO/WTF use 700/85. Roboto Flex provides `wght` 100–1000, `wdth` 25–151, `opsz` 8–144 and `slnt` −10–0; only the current weight/width/optical-size settings are authored here. Name uses weight 800, width 85, optical size 48; amount uses 950/88/100, with a timed width 88→82→88 pressure phrase. Remaining axes stay at package defaults.

The ramp is the frontmatter's 158px CO/ZA, 132px POJEB, 52px WTF and 38px HALO. Donate7 waits for the DynaPuff/Roboto Flex font-load promises before initializing SplitText, including Polish nickname and currency probes; `fontsReady` is a Donate7-only GSAP dependency. The existing clock/revert lifecycle is preserved, and load failure handling is not a font-success guarantee. Glyphs remain addressable in SplitText; deliberate irregularity evolves in the travelling WTF baseline exchange rather than being baked into a static poster. Name font size is exactly `max(28, min(52, 640 / max(1, nickname.length * 0.85)))`; amount is exactly `min(144, 650 / (amount.length * 0.65 + 1))`. Currency is 0.55em with a 12px amount gap, preserving the complete Polish formatted value. All amount characters are opaque at 15.49932s; their following 0.95s positional phrase does not hide digits. The strip uses the original generated RGBA fiber material `public/assets/donations/brand/donate7-peach-paper.png`, visible at full strip extent, with torn alpha edges and no amount shadow. The donor has centered text, centered amount/currency flex alignment and a centered amount transform origin. The centered 710px donor strip has a 232px minimum height, 24px stack gap and 36px horizontal / 30px bottom padding. Top padding starts at 68px and is measured after font readiness: `max(68, ceil(((nameBlock.offsetHeight + amountBlock.offsetHeight + 54) * 0.16) / 0.84 + 18))`. The paper grows with complete wrapped names without shrinking the amount to make room. A torn-alpha-following `drop-shadow(4px 10px 10px rgb(29 8 20 / 38%))` provides depth; the text itself remains shadow-free. Secondary cream/cyan streamers sit behind semantic paper, protecting the final name/number interior. Information body remains Poppins; Donate7 alone uses a berry Roboto Flex header on the continuing peach paper.

**The Scoped Replacement Rule.** These two display/semantic families, the raspberry amount and the new type ramp intentionally replace Donate7's Poppins/CRT world only. The single detector run reported two Roboto overused-font warnings, three old-world font warnings (Anybody once, Roboto twice), four type-size advisories (180/156/38/52) and two amount-color advisories; no ban errors. Anybody and 180/156 are historical pre-review findings: current source is DynaPuff and 158/132, with no rerun claimed. Current 38/52, Roboto Flex and raspberry amount are intentional local exceptions justified by the confirmed synthesis and readable semantic axis roles. Do not add global blanket ignores or apply this replacement to Donate1–6, Information or Studio.

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
| Donate7 · Reaction scrapbook | Three bounded original 120px feeds: 176 × 176 at (465, 150), 138 × 138 at (1260, 196), 130 × 130 at (405, 432), each with 7px peach paper and a pink tape tab. | 810px wide headline at (555, 280); textured 710px donor strip at (605, 622), min-height 232px, 24px stack gap; WTF at (1295, 486). Headline and donor both rest on canonical x960; CO/ZA flex alignment and POJEB text alignment are centered. All authored groups shift by 0.5 × stage-extra to stay centered on the actual viewport. Curved frame paths preserve bounded source scale and transparent gameplay. |

The Information panel centres on the stage and uses `width: max-content`, min-width 560px, max-width 960px, automatic height and a 600px height cap. Its padding and asymmetric reading corners are in frontmatter. Captured short/default content is about 560 × 165px, the safe long-content example about 960 × 304px, and the emote example about 306px high; these are content observations, not fixed-height tokens. The fixed header has a 36px gap and 18px bottom padding. Only the message body shrinks and scrolls (`min-height: 0`, flex `0 1 auto`); names wrap in full and amount/currency stay together. Overflow scrolls after a 2500ms reading pause with a closing hold. Inline emotes reserve 45px square slots (1.5em) at this body size while retaining source aspect ratio. The separate readable error fallback remains width `min(80vw, 1240px)`, max-height `80vh`; it is not the normal Information panel.

Studio 2.2 retains the docked Studio 2.1 workspace and owns the desktop viewport at 1280 × 720 and above. Below either threshold, only a desktop-required screen reports the current and recommended dimensions. No mobile editor is rendered. A 46px toolbar and 20px footer enclose docked React-17-compatible split panes. Default horizontal allocation is 14% tree / 64% Program / 22% properties; vertical allocation is 62% workspace / 38% Timeline. Side panes collapse, all three dividers resize, and local preferences persist. Reset Workspace and divider double-click restore defaults. Maximize active panel saves and restores the exact preceding layout. Compact 26px dock headers mark the active panel subtly; properties tabs remain integrated.

The Program viewer uses ResizeObserver dimensions to fit the selected output viewport. Fit refits immediately with every pane operation. Output format and viewer zoom are separate: presets include 1280 × 720, 1366 × 768, 1920 × 1080, 2560 × 1440, 3840 × 2160, 1920 × 1200, 2560 × 1080, 3440 × 1440, 3840 × 1080 and 5120 × 1440, plus custom even dimensions (width 320–8192, height 240–4320). The acceptance capture matrix spans eight principal HD Ready-through-4K formats, including 16:9, 16:10, 21:9 and 32:9. Manual viewer zoom is clamped to 10–400%; Ctrl/Cmd-wheel keeps the source point under the pointer, wheel and touchpad scroll locally, Shift-wheel pans horizontally, and pointer dragging pans outside Fit. Centering is explicit. The stage clips and contains paint; it never contributes document overflow. The supplied photographic Rocket League stream is the default authoring background. A custom PNG/JPEG/WebP can replace it locally. Production remains transparent.

Timeline has a 36px control strip, sticky 150px track headers, 28px ruler, 31px standard tracks and 52px music waveform. Content width is max(available width, 900px × zoom), at 1–128×, with adaptive subsecond ruler ticks. Wheel scrolls locally; Shift-wheel pans horizontally and Ctrl/Cmd-wheel zooms around the pointer. A single global axis and playhead span all tracks. The bottom navigator pans its viewport and resizes its handles to zoom; center-playhead acts on the same viewport. Playhead and IN/OUT use pointer capture; Shift-drag creates a range without browser text selection. IN/OUT are nullable: no range means empty fields and disabled range looping, while clearing truly removes selection. Tylko animacja spans original music. Pełny alert spans the shared lifecycle plan: Hero, overlapping Information and sequential nickname/amount/message speech, then Outro and COMPLETE. A dedicated sample-clock authoring transport reconstructs music and current speech sources on play, resume, seek and loop, including post-music phases. The main timecode edits inline and seeks that same clock. Detached lifecycle summary boxes remain removed. Fresh startup selects Donate1, Pełny alert, manual scene selection and stream background, with no range and looping off. Graphite/peach/cyan chrome, Poppins and Lucide preserve Studio identity. Scrollbars are subdued and visible; native text selection is restored in editable and explicitly copyable fields.

## Elevation & Depth

Depth follows the source: opaque footage remains a bounded room, portrait or crowd window; the alpha dancer stands directly over broadcast content; tilted rodent screens and taped webcam apertures create layering. Donate1–4 use no GPU effects or cash. Donate5/6 retain restrained light and two-depth cash with smooth donor-relative alpha falloff. Donate7 uses full-screen Pixi money behind semantic paper, with separate Canvas confetti, cutout extrusion, taped aperture shadows and a torn-alpha-following donor shadow. Its retained paper hinge, temporary thread and chapter-specific GPU matte physically connect the recovery and amount handoff. SAFE preserves the visible DOM/SVG hinge and uses a money-opacity envelope. Spectacle clears in Information. Studio retains tonal docked panels, thin boundaries and soft help-popover shadows; the rodent projector's hard offset remains local.

### Shadow Vocabulary

- **Donor legibility** (`text-shadow: 0 2px 2px #1e1819, 0 4px 10px #1e1819`): shared solid name/amount outline over gameplay; disabled on the paper amount.
- **Reading ambient** (`box-shadow: 0 20px 45px rgba(0, 0, 0, 0.22)`): soft separation for Information. The built card also carries an 8px hard lower edge; like the projector offset shadow, that incumbent treatment is recorded but not canonized as a reusable depth token.
- **Donate7 paper aperture** (`box-shadow: 4px 10px 16px rgb(29 8 20 / 48%)`): soft cast separation for three taped frames. **Donate7 cutout lettering** (`text-shadow: 5px 8px 0 var(--d7-pink), 7px 12px 0 var(--d7-berry), 9px 20px 16px rgb(27 8 19 / 45%)`): intentional physical contour/extrusion local to this committed comic world; donor text has no shadow.

**The Quiet Landing Rule.** Hide source footage, departing glyphs and all supporting spectacle in Information, release source media, and retain the name, amount and complete message. Donate7 alone keeps its actual transformed donor paper as the reading backing.

## Shapes

There is no common live aperture silhouette. Each show uses its source-derived form: Turkey's foot ellipse and stepped reply, the dancer's drawn bunny-ear floor, rodent shutters and tilted small rectangles, paper's torn edge/perforation, ovation's bounded rounded window and handwritten wings, the booth's asymmetric soft corners and drawn heart, or the webcam's straight taped peach cutouts. Preserve these forms in their scenes.

Studio fields/buttons use the control radius; selected tree rows and timeline regions use timeline radius, and lifecycle segments use lifecycle radius. Donate1–6 Information uses asymmetric soft reading corners; Donate7 retains torn peach paper with no rounded panel. Rodent, ovation and booth frames carry their own source-specific rounded silhouettes; no universal card radius replaces them. The heart's original cheering bunny is 56px, rotated −8° at (875, 712); the Studio mark is 24px. The old diamond/circular aperture, outline words and corner frame belong to Studio-only Donate8. Studio’s real stream photograph is authoring context only.

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
| Reaction scrapbook | Peripheral caller chorus → CO at 13.20054s / ZA at 13.87392s → POJEB!!! and all amount digits at 15.49932s → travelling WTF/type-baseline exchange at 22.89488s → amount-led finale at 37.65116s. Brief restraint at 29.45s follows recovery at 28.6s; recruitment at 30.26721s. Quiet reading at 18.4s, distinct reprise and upper-rail recruitment evolve the arrangement. Centered donor compression starts 36.83116s; 37.65116s impact settles from 37.95116s while title retreats to scale 0.56 / y−175. Glyph/aperture fold starts 43.75s; the same donor paper continues into Information. Source pose remains 1.52s; no six-still CRT wall. |

Shared cue names are `intro → firstImpact → donorReveal → buildStart → preDrop → heroDrop → settle → information`; the timeline default is `power2.out`. Each scene owns its shots and tween choices. Chosen source poses hold near hero according to per-asset before/after windows, then resume looping from that pose. Dancer echoes delay 0.12/0.24s, rodent screens 0.08/0.16s, webcam satellites 0.12/0.24s. The source and music clock remain at exact zero on restart/reverse seek; the public visual contract at `time = 0` is complete transparency. The root starts with `data-time-zero="true"`; CSS hides the stage and every descendant with `visibility: hidden !important`, including before media readiness and after reverse seek/restart. GSAP's private one-microsecond initialization only establishes internal set state and never authorizes visible zero-frame content. Donate1–6 source entry is authored at 0.05s over 0.1s; Donate7 opens its first aperture from 0.05s over 1.6s. INITIAL capture is 0.15s, distinct from ZERO.

Donate1–6 clear source scene/effects in the last 0.5s and reveal Information in the last 0.4s. Donate7 folds departing glyphs and taped apertures from 43.75s, transforms the retained donor paper from 43.85s, reveals Information from 44.95s and releases the spectacle envelope at 45.7s. Its paused absolute-time GSAP director uses CustomEase paper/weight curves, SplitText for title/callers/WTF/currency, DrawSVG/MorphSVG for the transient connective thread and amount underline, and MotionPath for curved callers/frame roundtrips; Pixi money and separate Canvas confetti sample the same absolute music time and seed. Root outro is an opacity transition of 0.65s ease-out. Reduced-motion CSS removes that root transition; it does not provide a complete static alternative to the GSAP scene.

**The Music Clock Rule.** Derive authored scene and controlled source frames from absolute music time. Forward playback uses sequential native decoding with drift correction; scrub, freeze and export select exact frames. Quality reduction changes supporting detail, not cue timing, donor layout or the reading phase.

### Information card

From 43.85s the existing `.d7-donor` paper transforms over 1.65s into centered measured Information bounds: width includes 72px extra and height includes 64px extra with a 0.72 opaque-material allowance. Its old name/amount/underline clear from 44.5s over 0.65s; Information appears from 44.95s over 0.5s and reveals upward over 1s. The thread clears from 45.2s over 0.45s. The same torn peach fiber paper remains visible in production Information, with a transparent successful Information background; a solid peach backing remains when choreography is unavailable. Donate7 alone uses a berry Roboto Flex header (name 800, amount 950) and berry Poppins message/thanks. Header/message are fully revealed before the established 46.23397s speech start. Shared content sizing, complete text, body-only scrolling, fixed header, emote slots, nickname → amount → message TTS and queue completion remain unchanged; no paper replacement or donor fold-out occurs.

Donate1–6 use the content-sized information-card surface, shared peach fixed header and soft white complete message; Donate7 uses the continuing paper/header treatment above. Preserve line breaks, unbroken-word wrapping and body-only overflow reading. Approved image runs keep stable aspect-preserving emote slots; information time selects decoded frames without a private animation loop. Plain shortcodes remain plain text unless explicit supported image metadata resolves them. Studio's two explicit local fixtures are preview data, not evidence of an unknown Tipply backend contract. The optional special thanks remains a small pale-accent paragraph. Information stays readable during renderer degradation and releases source videos and fallbacks when the show ends.

### Cash and community reaction

From 18.4s, the quiet reading shot reduces the headline to 0.72 scale / y−110, lifts the centered donor 42px and pulls the shared lens to 0.962. At 22.89488s the reprise uses a different 0.86-scale headline / y−74 and 0.97 donor scale / y−20, with the existing WTF baseline exchange and frame roundtrip. The retained 28.6s hinge unfolds at 30.26721s into a 0.84-scale headline / y−36 and donor y−46; three original apertures form an upper rail through relative offsets (180,−55), (−95,−115), (505,−340), preserving their bounded source sizes. Reading, exchange, fold and recruitment evolve the composition instead of repeatedly restoring the hero poster.

The centered donor compresses from 36.83116s (cue.final − 0.82): scaleX 0.94 / scaleY 1.02, y−74, rotation 0 over 0.82s. At unchanged 37.65116s it impacts at scaleX 1.1 / scaleY 1.08, y−140 over 0.3s, then recovers to 1.045 on both axes over 1.1s from 37.95116s. Its transform origin is 50% 50%. During anticipation the title becomes a centered upper response at scale 0.56 / x0 / y−175 and apertures reduce to 0.82. The shared lens pulls to 0.974 / y10, recoils to 1.026 / y−8 at impact, then settles to 1 / y0. Complete digits and currency retain their overlapping positional reply; established delayed celebration follows without added populations.

Cash is a scene-specific accent: Donate5 throws a warm fountain from a measured donor-relative origin (`donor.x`, `donor.y + 240`), and Donate6 passes a small pink arc from a donor-relative origin beside the hand-heart. Their drawn bills are 62 × 30px with a 3px corner and dark outline. The handoff caps at 12 bills; the ovation caps at 72/40/14 per renderer in high/medium/safe quality. Six out of seven seeded bill indices route behind source/text, one in seven in front; depth never changes when a bill enters the donor area. A continuous 160-unit distance falloff around the measured moving donor rectangle multiplies existing bill alpha by at least 0.14 behind and 0.35 in front. These are alpha multipliers, not absolute opacity guarantees. Each wave lasts at most 2.8s. Cyan replies in Turkey/ovation and the cheering heart bunny have distinct scene roles; their entrance follows named music cues, not a private animation timer.

Donate7 money uses one lazily loaded Pixi WebGLRenderer, the unchanged green 56 × 56px `src/assets/images/effects/banknote-particle.png` texture and three pooled ParticleContainers (BACK/MID/FRONT). Finite seeded birth inventory and closed-form terminal fall, drift, rotation and flutter reconstruct from absolute music time; there is no accumulated simulation, per-note tween or independent Pixi ticker. Bills begin above the full logical viewport, including ultrawide, and continue downward. BACK sizes are 28–48px at 115–190 logical px/s, MID 55–93px at 200–350px/s, FRONT 145–225px at 510–730px/s. Existing HIGH/MEDIUM/SAFE money caps stay 540/310/135, with backing targets 2.1M/1.5M/0.9M pixels for the single Pixi canvas (resolution capped at 1). This refinement does not increase populations. Money never reads donor/title bounds or follows repulsion, fountains or side lanes. All money depths sit behind the semantic show, whose title and opaque donor paper provide normal occlusion. Brief translucent notes over the gameplay facecam are explicitly allowed; preserve full-screen rain. Keep the main semantic donor paper, title and reaction apertures outside the gameplay facecam rectangle; the explicit crossing exception applies only to brief translucent money notes. Emission starts at 3.6s, builds at 8.1/12.3s, storms at 15.49932s, reduces at 18.4s, renews at 22.89488s, restrains at 28.6s and rebuilds at 30.26721s. Amount priority at 37.65116s reduces foreground alpha, followed by the final storm at 38.85s. Emission stops at 43.75s; fade spans 44.25–46.15s, and exact zero/Information clears money. Renderer failures explicitly degrade money while preserving source, semantic donor, TTS and queue completion; there is no Canvas money fallback.

A global `.d7-world` camera contains all show DOM/SVG, original reaction media, Pixi money and separate confetti canvases; Information/TTS stays outside it. It authors quiet drift, shared anticipation/recoil, recovery pullback and final amount push on the existing GSAP clock. The donor remains outside the local `.d7-camera`; the local camera contains headline/reactions. MorphSVG and DrawSVG retain the same two-path paper thread, exposing short travelling segments rather than a permanent outline. The thread fades at 45.2s before the Information read, meets the retained fold edge and emerges beneath the donor as the berry amount underline at 37.65116s. During recovery from 28.6s, the actual opaque headline folds to −78° around its measured bottom hinge at canonical y620; satellite apertures join the seam and the same forms unfold at 30.26721s. A textured 540 × 18px physical edge at y616 provides a contact shadow and occludes the thread. HIGH/MEDIUM apply one temporary custom GLSL PaperGateFilter to the money composite: partial closure from 28.6s, final closure 29.3–29.75s, reopening 30.36721–32.01721s around the same approximately 620px seam. Original note color and downward poses persist. SAFE retains the DOM/SVG hinge and edge with a cheap money-opacity envelope. No permanent filter or new clock is introduced.

Separate Canvas2D BACK/MID/FRONT layers retain finite paper, ribbon and spark/firework choreography, excluding every bill cue. Their existing caps remain 480/260/110 and nominal per-canvas backing targets 2M/1.2M/650K; SAFE removes trails. These are confetti budgets, not money budgets. The 1450px inboard emission field and measured donor/title geometry apply only to this supporting inventory. All three canvases sit behind semantic paper, so large streamers cannot draw over its interior. Original bunny stamps and cue-led replies remain. All spectacle clears for Information and disposes at unmount.

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
- **Do** keep cash distinct by source, route stable depth and derive readability protection from actual donor bounds: alpha falloff for Donate5/6; semantic layer ordering and foreground alpha restraint for Donate7 full-screen Pixi rain.
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

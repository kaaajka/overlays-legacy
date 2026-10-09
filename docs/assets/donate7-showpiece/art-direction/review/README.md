# Donate7 — three-point art-direction review

**Update, 2026-10-09: owner approved this result and authorized finalization/push.** See [acceptance record](../../../../DONATE7_ACCEPTANCE.md). The review package and pending-approval statements below preserve the state in which it was presented; approval does not change the recorded software-capture limitations.

**Candidate for owner visual approval. No commit or push.** This continues the existing uncommitted Pixi/showpiece work. The three changes below are the entire creative scope of this continuation.

## Watch the short BEFORE / AFTER clips first

Left is the preserved previous version; right is the current version. Playback is **1×**, with the current version's actual captured music/TTS audio. Both sides use matching encoded video timestamps from independent live browser recordings; this is not a claim of sub-frame audio alignment.

| Target | 57.32 PLN fixture | 30,000.00 PLN fixture | Source windows |
| --- | --- | --- | --- |
| Middle-section development | [BEFORE / AFTER](middle-5732-before-after.mp4) | [BEFORE / AFTER](middle-3000000-before-after.mp4) | 17.4–26.7s, then 28.0–33.6s; 14.9s total |
| Final amount culmination | [BEFORE / AFTER](payoff-5732-before-after.mp4) | [BEFORE / AFTER](payoff-3000000-before-after.mp4) | 35.8–41.4s; 5.6s |
| Paper → Information/TTS | [BEFORE / AFTER](handoff-5732-before-after.mp4) | [BEFORE / AFTER](handoff-3000000-before-after.mp4) | 43.2–49.2s; 6s |

Each comparison is 1920×588 H.264/AAC: two 960×540 views plus labels. [Comparison manifest](comparison.json) records the original sources and cuts. There is no time compression or inserted soundtrack.

## Current full-resolution playback

- Full alert, actual 1× music and Polish Windows SAPI TTS: [57.32 PLN](../final-5732/donate7-full-realtime-audio.mp4) / [30,000.00 PLN](../final-3000000/donate7-full-realtime-audio.mp4).
- Reopened middle composition, 28.0–33.6s: [57.32 PLN](middle-5732-after-full-resolution.mp4) / [30,000.00 PLN](middle-3000000-after-full-resolution.mp4).
- Amount culmination: [57.32 PLN](payoff-5732-after-full-resolution.mp4) / [30,000.00 PLN](payoff-3000000-after-full-resolution.mp4).
- Paper handoff: [57.32 PLN](handoff-5732-after-full-resolution.mp4) / [30,000.00 PLN](handoff-3000000-after-full-resolution.mp4).

Both full captures complete the nickname → amount → message → outro → completion lifecycle with `errors: []`. Their [57.32 metadata](../final-5732/realtime-recording.json) and [30,000 metadata](../final-3000000/realtime-recording.json) record the actual WebAudio output tap and CDP live-frame timestamps. Gameplay is the established Rocket League reference still; the original reaction footage moves. Moving gameplay footage was not substituted.

[Full-alert decode check](full-alert-decode.json) also fully decoded both 1080p recordings (53.513s / 53.033s), with non-silent AAC, no unexpected decode errors and no whole-frame black intervals.

## Matched live frames

These strips sample the actual live recordings, rather than reconstructing motion by direct seeking.

| Target | 57.32 PLN | 30,000.00 PLN |
| --- | --- | --- |
| Middle | [Live frame strip](middle-5732-live-sequence.jpg) | [Live frame strip](middle-3000000-live-sequence.jpg) |
| Payoff | [Live frame strip](payoff-5732-live-sequence.jpg) | [Live frame strip](payoff-3000000-live-sequence.jpg) |
| Handoff | [Live frame strip](handoff-5732-live-sequence.jpg) | [Live frame strip](handoff-3000000-live-sequence.jpg) |

## What changed

1. **The middle evolves instead of repeatedly restoring the hero poster.** At 18.4s, the shared camera and title retreat into a quieter reading shot. The existing WTF exchange keeps a different scale and donor position. The accepted fold/hold survives, then recruitment at 30.26721s unfolds the same three source apertures into an upper rail. These recognizable objects continue into the amount-led finale.
2. **The amount becomes the culmination.** A 0.82s centered compression anticipates the unchanged 37.65116s final cue. The donor paper and shared camera impact together over 0.3s, then recover over 1.1s. The title and monitors recede during anticipation, leaving the full amount visually dominant. Center-origin scaling preserves alignment for both values.
3. **The actual donor paper becomes the message backing.** At 43.85s it transforms to measured Information bounds. The old lettering clears while the existing header and full message reveal on that same peach material by 45.95s, ahead of the established 46.23397s TTS boundary. Body scrolling, fixed header, all message text and the production speech/outro lifecycle remain intact. A solid peach fallback preserves readability if choreography is unavailable.

No money-engine, music cue, audio clock, particle budget, asset or dependency change was made in this continuation. Implementation changes are limited to `choreography.ts`, `cameraRig.ts` and `donate7-show.css`; the [241-file SHA256 inventory](../runtime-fingerprint.json) separates those from the added regression test and updated stale test. All earlier accepted work is retained.

The independent [five-section finish review](../finish-review.md) scores all three findings resolved, with no material fixes, and recommends delivery **for owner review**. The reviewer inspected live-frame comparisons/source/metadata and did not independently watch/listen to complete videos. This verdict does not grant owner acceptance.

## Fresh technical checks

Typecheck passed. The complete unit suite passed **334 tests / 36 files**. Lint passed with **0 errors, 44 warnings and 39 infos**. Production build passed; its existing main-chunk warning remains (832,758 bytes minified / 261,309 bytes gzip).

The first complete browser run passed 89/90. Its sole failure was the stale assumption that Donate7 hides all `.scene-content` during Information; that would remove the intentionally retained paper. The updated test requires the paper to remain visible while outgoing title glyphs, donor lettering, money and spectacle clear. The focused corrected test passes. **The complete rerun passed: 90 passed (8.1m)**. The adjacent [validation record](../validation.json) and command logs record the fresh result.

The two added tests cover both amounts, exact forward/backward pose reconstruction across middle/impact/handoff, paper coverage and centered bounds, and a long fully retained message with body-only scrolling. The broader suite covers frame zero/restart, absolute money seek, shader/context-loss fallback, renderer disposal and production lifecycle/export behavior.

[Delivery check](delivery-check.json): all 12 comparison/full-resolution chapter MP4s fully decoded; H.264/AAC, counted frames, non-silent audio, no whole-frame black segments or unexpected decode errors. Both current captures complete without reported browser errors. The executable/test fingerprint still matches the checked source. [Current bundle audit](../toolbox-bundle-audit.json) records existing tools and confirms no editor or Three.js leak into the production main bundle.

## Evidence limits and approval

These are adaptive **SwiftShader software-rendered** live captures, encoded at 30 FPS. The full alerts contain 994 and 1,051 actual captured frames, approximately 18–20 per second; encoding does not prove native 30/60 FPS or native OBS/GPU performance. No new native-hardware performance claim is made. Full-resolution clips retain the capture cadence.

In both current full recordings, adaptive quality changes from HIGH to MEDIUM around 5.05s and to SAFE around 10.3–10.6s. The targeted middle/payoff/handoff clips therefore show the SAFE rendering path. Their authored DOM camera/paper/typography motions persist; these recordings do not establish uninterrupted HIGH-quality filter playback. Browser tests separately exercise HIGH/MEDIUM shader and lifecycle paths.

Final visual impact, musical force and TTS listening quality require owner review. Source cue timing and non-silent recorded audio support synchronization evidence, but automated validation and sparse stills cannot provide perceptual acceptance. Prior screenshots/performance results in the parent directories remain historical; `round-1`, `round-2` and `after-*` are superseded intermediate evidence. The `final-*` captures and this review directory are the current review package.

Please review the six short comparisons and approve or identify a specific remaining issue in these three areas before branch finalization. **Owner visual approval is pending; no commit, push or merge has been performed.**

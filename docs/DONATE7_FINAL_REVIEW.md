# Donate7 final creative refinement — owner review

**Owner acceptance, 2026-10-09:** Donate7 is now the approved creative-quality reference. [Acceptance record](DONATE7_ACCEPTANCE.md) supersedes earlier pending-approval gates while preserving the original evidence and its limits.

**Current continuation:** the later, strictly scoped middle/payoff/Information refinement is delivered in [the three-point art-direction review](assets/donate7-showpiece/art-direction/review/README.md), with new recordings for 57.32 and 30,000.00 PLN and a fresh validation record. The material below documents the preceding refinement and its evidence; it is retained as history, not proof of the subsequently modified implementation. Owner visual approval and commit/push remain pending.

Status: **ready for owner visual review; creative acceptance and branch finalization remain pending**. This continues the existing working tree. No reset, revert, stash, discard or recreation was used. The original Pixi money system, centered hierarchy, music cues, reaction media, identity and full TTS/outro lifecycle are preserved.

The latest delivery-only instruction is fulfilled by the [review directory README](assets/donate7-showpiece/review/README.md): three clearly named MP4s, decode/version checks, performance evidence and full-resolution fold clips. No implementation change followed the full validation run.

## Review these artifacts

- [Full actual 1× playback with music and Windows SAPI TTS](assets/donate7-showpiece/donate7-full-realtime-audio.mp4) — 53.455 seconds, 1920×1080 H.264, AAC stereo 48 kHz. Actual WebAudio output was recorded, not replaced with an offline soundtrack.
- [Short before/after transition comparison](assets/donate7-showpiece/transitions-before-after.mp4) — recruitment, tension/hero, fold/unfold and final amount. Before is left, refined is right; refined audio only. Independent live captures share encoded video timestamps, not a claimed sub-frame audio alignment.
- [Fold at matching timestamps](assets/donate7-showpiece/fold-before-after.jpg) and [all matched stills](assets/donate7-showpiece/matched-before-after.jpg).
- [Live fold sequence](assets/donate7-showpiece/live-fold-motion.jpg), [live finale sequence](assets/donate7-showpiece/live-final-motion.jpg), [gameplay backgrounds](assets/donate7-showpiece/gameplay-contact.jpg), [formats](assets/donate7-showpiece/formats-contact.jpg), [amounts](assets/donate7-showpiece/amounts-contact.jpg), [quality tiers](assets/donate7-showpiece/quality-contact.jpg).

## Reviewer findings

The independent [refined verdict](assets/donate7-showpiece/finish-verdict-refined.md) is **ship for owner review**. Its five earlier findings are resolved in the supplied evidence; this is not owner acceptance.

| Finding | Resolution |
| --- | --- |
| Fold becomes an empty interval | Same full-opacity title hinges onto the shared seam, remains as a readable held paper plane, then unfolds. |
| Thread reads as an arbitrary outline | Thread meets and is partly occluded by the paper hinge; it wipes away after handoff and returns beneath the donor as the final underline. |
| Shader feels separate from material | Money matte closes around the same 620px seam and shares the fold/hold/open timing. SAFE retains the DOM hinge with an opacity envelope. |
| Final donor lacks depth / ribbons cover copy | Shadow follows the torn alpha; secondary ribbons render behind semantic paper. Amount remains dominant. |
| Extreme name touches the torn top edge | Loaded name/amount heights determine the top inset, with a 68px minimum, preserving the full 32-character name without shrinking the amount to compensate. |

Full-screen rain remains intact with unchanged population budgets and the original green project banknote. The owner explicitly allows short translucent banknote crossings over the gameplay facecam. Title, paper and reactions preserve the accepted layout around that facecam region.

## Fresh validation

All five commands ran fresh after the final runtime modifications. [Portable validation summary and runtime SHA256 inventory](assets/donate7-showpiece/validation.json) and the adjacent command logs record the result.

| Check | Result |
| --- | --- |
| `pnpm typecheck` | Passed |
| `pnpm test` | 334 passed, 36 files |
| `pnpm exec playwright test` | 88 passed, 7.5 minutes |
| `pnpm lint` | Passed; 0 errors, 44 warnings, 38 infos |
| `pnpm build` | Passed; existing main-chunk size warning |

The browser suite includes direct/backward/restart money poses, exact frame-zero clearing, the reversible shader/thread/camera transition with zero unexpected console errors, renderer recreation and stopped tickers, initialization/context-loss fallback through the full TTS lifecycle, delayed font loading, original texture verification, all four aspect ratios and extreme donor/amount geometry. No test result from an earlier implementation is substituted for this run.

The current CLI also completed a **HIGH, 1920×1080, 30 FPS, 120-frame export of28.4–32.4s**, including the shader fold/hold/open. [MP4](assets/donate7-showpiece/fold-export-high30.mp4) and [manifest](assets/donate7-showpiece/fold-export-manifest.json) preserve the exact frames, audio, dimensions and encoded-stream checks. The attempted full60FPS PNG export was stopped because of impractical capture throughput; partial frames remain in ignored local export storage. No60FPS realtime success is claimed. The definitive delivery uses the completed actual1× audio-bearing live capture at encoded30FPS.

## Performance and bundle evidence

Fresh isolated SwiftShader measurements completed without reported browser/console errors:15 audio-clock profiles across final/fold, sizes1920×1080,3440×1440,5120×1440 and HIGH/MEDIUM/SAFE;9 fixed-quality seek profiles. Live median frame intervals were about33.3/66.7/100ms by output size, with p95 up to166.6ms. Pixi CPU submission p95 was0.4–0.8ms; it excludes GPU and compositor costs. The fixed-quality/source-seek workload had32–110.3ms medians and39.5–190.5ms p95. Actual adaptive quality is recorded. These are software-rendering measurements, not proof of native60FPS or OBS performance.

The production warning affects `dist/assets/index-BNOJCPik.js`:831,713bytes minified,261,027bytes gzip. The money renderer remains lazy for tier7 in `webworkerAll-MiQU6ltA.js`:354,632bytes,101,347bytes gzip; the chunk's name does not imply a separate money clock. [Bundle/import audit](assets/donate7-showpiece/toolbox-bundle-audit.json) confirms all17 explicit GSAP imports and no production development-helper or Three-renderer signatures. Build succeeds; no bundle refactor was performed for review delivery.

## Evidence limits

- Live recording uses headless ANGLE/SwiftShader, with adaptive quality. Its 30fps encoding does not establish continuous rendered 30/60fps, native GPU performance or OBS performance during real gameplay.
- Visual review used rendered frames and sequences extracted from actual normal-speed playback. Neither the build agent nor the reviewer had a reliable perceptual listening feed; human musical judgment and final creative acceptance belong to the owner.
- The gameplay background is the real supplied Rocket League reference still; bright/dark cases are declared exposure variants, not separate live games. Reaction footage plays normally.
- Original low-resolution reaction footage is deliberately preserved. Exact local music-master identity and semantic lyric alignment remain unconfirmed; the established measured hero and amount cues are unchanged.
- Raster output across GPU/browser platforms is not promised bit-identical. Absolute-time object poses, forward/backward/restart reconstruction and frame zero are checked separately.
- Existing lint warnings and the main production bundle size warning remain; no unrelated cleanup or infrastructure expansion was added.

## Git and approval boundary

Branch: `michal-szwindowski/donation-motion-engine`. Baseline commits already on the remote are `842f6ac` (Version A implementation) and `2f372da` (Version A documentation/evidence). Local HEAD and remote branch were both verified as `2f372da3b5f8a1cadab5cacc14f2d3d42550728b`.

There are **no new commits or push in this refinement delivery**. The working tree intentionally retains the uncommitted definitive/Pixi/showpiece implementation and evidence. The latest owner instruction requires presenting this visual package before branch finalization. No merge to main occurred.

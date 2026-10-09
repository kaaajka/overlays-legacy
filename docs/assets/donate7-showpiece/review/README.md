# Donate7 — final visual review delivery

**Implementation frozen. Owner visual approval pending. No commit, push or merge.**

Start with the full alert, then inspect the transition comparison and money storm. These are actual browser-rendered images from normal-speed playback, with original music and Studio test TTS. They do not reconstruct the animation in another renderer.

| Video | Resolution | Encoded FPS | Duration | Audio |
| --- | --- | --- | --- | --- |
| [donate7-final-full-alert.mp4](donate7-final-full-alert.mp4) | 1920×1080 | 30 | 53.455s | Original music + nickname → amount → message TTS; AAC stereo 48kHz |
| [donate7-before-after.mp4](donate7-before-after.mp4) | 1920×588, two 960×540 views + label strip | 30 | 18.171s | AFTER audio only; AAC stereo 48kHz |
| [donate7-money-storm.mp4](donate7-money-storm.mp4) | 1920×1080 | 30 | 8.200s | Current original music; AAC stereo 48kHz |

All three are H.264 MP4s suitable for ordinary desktop playback. Each was fully decoded and checked for audio presence, non-silent peaks and whole-frame black intervals. See [delivery-check.json](delivery-check.json) for counted frames, SHA256 hashes, capture binding and verification limits. Decode logs are adjacent to each video.

## Exact versions and sources

**AFTER/current** is the uncommitted worktree after the five scoped review fixes and thread trimming: full-opacity retained folded title, physical paper hinge at the shared seam, temporary connective thread, donor alpha-shadow with secondary streamers behind copy, and measured name top inset. Pixi rain, global camera, centered hierarchy, typography, shader, music cues and TTS remain the current implementation. All 240 executable/asset/test files in the validation inventory retain their checked SHA256 values. Runtime files were last modified before the final capture; no implementation change followed the full regression run.

- Full alert is an exact byte copy of [../donate7-full-realtime-audio.mp4](../donate7-full-realtime-audio.mp4), captured from the actual clean Studio view with no editor toolbars/debug overlays. [realtime-recording.json](realtime-recording.json) records 1,171 actual captured frames, the audio/frame offset and completion. WebAudio output was tapped during real playback; an offline replacement soundtrack was not substituted.
- **BEFORE** is the preserved [../before-refinement.mp4](../before-refinement.mp4), before these five fixes and thread trimming. Its source recording remains unmodified. It already contains the preceding Pixi/global-camera/paper-thread implementation; it is not legacy footage.
- Comparison uses that BEFORE recording and the current AFTER live recording at identical encoded timestamps. Left is BEFORE, right is AFTER. Four segments are assembled at 1×: 7.1–10.4, 12.2–17.8, 27.6–33.1 and 36.65–40.4 seconds. Labels were added only to the comparison. Neither source recording was retimed or visually altered. [Comparison timing metadata](../comparison.json) retains the source cuts. Video timestamps from independent captures are not claimed as sub-frame audio cue equivalence.
- Money storm is an ordinary 1× cut of the current full recording, **35.2–43.4s**. It includes the buildup, amount-led payoff, full-stage storm and start of afterglow. It has no slow motion or speed ramp.

The gameplay background is the supplied Rocket League reference still; the original reaction videos animate. Bright/dark stress screenshots elsewhere are declared exposure variants. This is not a live gameplay/OBS performance recording.

## Watch these moments

| Full-recording time | What to inspect |
| --- | --- |
| 7.1–10.4s | Recruitment passes attention into tension through shared geometry/camera motion. |
| 12.2–17.8s | Hero anticipation and POJEB; the authored strongest measured musical cue remains 15.49932s. |
| 18.8s | Settled hero no longer has a persistent enclosing thread. |
| 27.6–33.1s, especially **29.8–30.4s** | Same typography folds, stays visible on a held plane and unfolds; paper edge and money matte share the seam. |
| 35.2–43.4s | Money buildup, BACK/MID/FRONT depth and final amount priority at the established 37.65116s cue. |
| ≈46.28 / 47.71 / 50.97s | Information with nickname / amount / message TTS. |
| ≈52.83–53.33s | Outro and COMPLETE; final playback metadata confirms completion. |

For details that are small in the side-by-side montage, open the two full-resolution 1920×1080 clips: [fold-before-full-resolution.mp4](fold-before-full-resolution.mp4) and [fold-after-full-resolution.mp4](fold-after-full-resolution.mp4), both 27.6–33.1s at 1×. [fold-before-after.jpg](fold-before-after.jpg) and [matched-before-after.jpg](matched-before-after.jpg) support the video review.

## FPS, synchronization and export evidence

The definitive full video is a **realtime capture**, encoded at 30 FPS. Capture rate varies; the 1,171 recorded images over approximately 53.47s do not establish continuous rendered 30 FPS. Headless SwiftShader did not establish realtime 60 FPS. A full 60 FPS PNG export attempt was stopped because its throughput was impractical; partial files remain in ignored local export storage. No 60 FPS delivery or native-GPU performance success is asserted.

Audio/frame alignment in the completed capture was measured at −0.004409s. Full audio/video decoding succeeded, expected AAC streams are present, audio peaks are non-silent and the complete phase sequence was recorded. These checks support synchronization and completeness; they are not a human perceptual listening verdict.

The already-started deterministic CLI check also completed: HIGH, 1920×1080, 30 FPS, 120 actual browser screenshots for 28.4–32.4s. [Fold export MP4](../fold-export-high30.mp4) and [manifest](../fold-export-manifest.json) contain the shader transition, exact frame count, original audio, source-frame control and encoded dimensions/FPS checks. This is **frame-exact export**, distinct from the three primary realtime-derived review videos.

## Current technical results

The complete suite ran fresh after the final executable changes. File hashes verified that no executable code changed afterward, so these results apply to the current worktree without an unnecessary repeat. [Validation record](../validation.json) and adjacent command logs preserve evidence.

| Check | Result |
| --- | --- |
| TypeScript typecheck | Passed |
| Unit suite | **334 passed / 36 files** |
| Complete browser suite | **88 passed**, 7.5 minutes |
| Lint | Passed; 0 errors, 44 warnings, 38 infos |
| Production build | Passed; existing main-bundle size warning |

Browser checks cover direct/reverse/restart seeking, exact frame zero, shared camera/thread/shader reconstruction with zero unexpected console errors, stopped Pixi tickers, renderer recreation, context/init fallback, delayed fonts, original green banknote bytes, four aspect ratios, extreme names/amounts and complete TTS/outro. The delivery verifier additionally checked all primary videos for complete decoding and full-frame black intervals. Captured browser errors were empty; this is complementary evidence, not proof that every artistic movement is perfect.

The independent [refined review](../finish-verdict-refined.md) resolves all five prior findings and says **ship for owner review**. It inspected stills, live-frame sequences and source; it did not independently listen to the full videos or grant owner approval.

## Performance and remaining manual checks

Fresh isolated [live SwiftShader measurements](performance-swiftshader-live.json) cover 15 profiles; [fixed-quality source-seek measurements](performance-swiftshader-fixed.json) cover 9. The renderer is ANGLE/Vulkan SwiftShader software GPU, DPR1. Live median intervals were about 33.3 ms at 1080p,66.7ms at 3440×1440 and100ms at 5120×1440, with p95 up to 166.6 ms. Actual adaptive quality is recorded. Pixi CPU submission p95 was 0.4–0.8 ms and excludes GPU/compositor work. Fixed-quality seek sampling is a different workload (audio stopped, source frame seeking) and has p95 up to 190.5 ms. Both reported error arrays are empty.

Native RTX/GPU performance, OBS Browser Source performance while gaming, real gameplay-camera interaction and perceptual music/TTS/microtiming acceptance remain **manual, unverified checks**. Full-screen money is intentionally retained; the owner permits brief translucent bills over the gameplay facecam. No particle budget was increased.

The build warning affects `dist/assets/index-BNOJCPik.js`:831,713bytes minified /261,027gzip. Tier7 money remains lazy in `webworkerAll-MiQU6ltA.js`:354,632bytes /101,347gzip; its bundler name is not a second money clock. [Bundle audit](../toolbox-bundle-audit.json) retains the 17 verified GSAP import paths and confirms production development-helper/Three-renderer signatures are absent. No bundle refactor or new dependencies were added during delivery.

Exact music master/remix identity and reliable lyric alignment remain unconfirmed. Original low-resolution reaction footage is preserved. No current blocking code/test/decode defect was found; the intended creative quality awaits the owner's visual decision.

## Git and approval gate

Branch `michal-szwindowski/donation-motion-engine`; verified local and remote HEAD both `2f372da3b5f8a1cadab5cacc14f2d3d42550728b`. Existing baseline commits are `842f6ac` and `2f372da`. Current changes remain uncommitted; [git status](../git-status.txt) records the modified/untracked state. No new commit, push or merge was performed.

**Stop here for owner visual approval. Technical success is not creative approval.**

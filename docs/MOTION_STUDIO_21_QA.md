# Motion Studio 2.1 validation — 2026-10-07

This pass finishes the desktop authoring workspace and exposes the complete donation lifecycle. Production v2 was frozen at `6640c6dc51dfb79bb039fac43492c8bfd3521372`: clean working tree, branch `michal-szwindowski/donation-motion-engine`, tracking the same remote HEAD at `kaaajka/overlays-legacy`. Baseline: 293 unit tests and 26 browser tests passed. No completed history was rewritten or merged into main.

Donate1–7 source assets, scenes, choreography, cash, Music Intelligence, shared lifecycle formulas, FIFO and Tipply integration remain unchanged. The shared audio sequence gains only optional native-playing/failure observers; they cannot interrupt playback or safe queue advance. Observer exceptions and cleanup have regression tests. The known `public/assets/sounds/shared/tipply-test-tts.mp3` is retained byte-for-byte.

## Desktop workspace

React remains 17.0.2. Studio-only packages are pinned to `react-resizable-panels` 2.1.9 and `lucide-react` 0.468.0. The supplied Premiere image informed dock density, boundaries, viewer allocation and local scrolling; Kaaajka's graphite/peach/cyan, Poppins and source content are retained.

All six sizes were inspected in a visible Codex Chromium browser and captured independently with Playwright. Document dimensions equal viewport dimensions at each size; no page overflow. The minimum workspace still exposes transport, viewer, properties and a locally scrolling Timeline.

| Viewport | Fit stage at default layout | Evidence |
|---|---:|---|
| 1280×720 | 552×310 | [capture](assets/motion-studio-2.1/workspace-1280x720.png) |
| 1366×768 | 605×340 | [capture](assets/motion-studio-2.1/workspace-1366x768.png) |
| 1440×900 | 750×422 | [capture](assets/motion-studio-2.1/workspace-1440x900.png) |
| 1680×900 | 750×422 | [capture](assets/motion-studio-2.1/workspace-1680x900.png) |
| 1920×1080 | 949×534 | [capture](assets/motion-studio-2.1/workspace-1920x1080.png) |
| 2560×1440 | 1345×757 | [capture](assets/motion-studio-2.1/workspace-2560x1440.png) |

At 1680×900, Stage is approximately twice the width of the supplied old Studio's tiny viewer. It refits from actual pane dimensions, with no fixed width cap. [Maximized Stage](assets/motion-studio-2.1/stage-maximized.png), [maximized Timeline](assets/motion-studio-2.1/timeline-maximized.png) and [exact measurements](assets/motion-studio-2.1/workspace-metrics.json) are retained. [1024×600](assets/motion-studio-2.1/workspace-1024x600.png), phone width and insufficient height render only the desktop-required screen.

Visible acceptance covered resizing both side panes and Timeline; side collapse/refit; Stage and Timeline maximize/restore; 128× zoom, repeated precise scrubs, a 3.750–4.050 selection and loop; Full Alert switching; each speech region's Inspector and immediate preview; full Donate6 playback with post-music progress, audible-region state and COMPLETE; Inspector/Export access; and further pane resizing with the Stage contained. Automated tests additionally verify exact persisted layout restore, real PCM during each Full Alert speech stage, pointer dragging, wheel zoom, local scrolling and editable text selection. Chrome text selection does not interfere with editor drags. Stage clipping uses overflow plus paint containment, including manual 100% viewer pan.

## Shared lifecycle and actual speech

Donate6's shared plan with the default message and all speech enabled:

| Region | Start seconds | End seconds |
|---|---:|---:|
| Hero / original music | 0 | 21.764940 |
| Information | 21.764940 | 28.214237 |
| Nickname | 21.764940 | 23.151244 |
| Amount | 23.151244 | 26.455779 |
| Message | 26.455779 | 28.214237 |
| Outro | 28.214237 | 28.864237 |
| COMPLETE | 28.864237 | endpoint |

The Information block overlaps speech and continues until both the shared reading gate and speech have finished. The Timeline consumes `lifecyclePlan`; it does not duplicate timing formulas. Music tracks retain their exact authored axis in Hero mode; Full mode extends the same ruler/playhead through the complete plan. Post-music seeking evaluates Information scrolling and Outro deterministically. Speech previews start clips from their beginning; Full Alert's next playback starts at zero after cancellation. Hero selection loops remain music-only.

The three measured local WAV fixtures remain Paulina's semantic nickname, amount and message samples, at the existing 0.4 speech volume. The test measures native HTMLMediaElement clock progress and nonzero Web Audio analyser PCM during direct preview, then verifies each audible highlight and shared-region position during real Full Alert. It does not infer sound from phase callbacks alone. Failed fixtures show `TTS FIXTURE FAILED` and Inspector's failed/no-substitution state. Production backend speech URLs are unchanged.

[Full lifecycle Inspector](assets/motion-studio-2.1/full-alert-inspector.png) shows filename, measured duration, volume, voice identity, sample and state. [Export panel](assets/motion-studio-2.1/export-panel.png) retains compact integrated tabs.

## Original audio audit

[Complete machine evidence](assets/motion-studio-2.1/audio-audit.json) records FFprobe codec/format, MPEG header version/layer, sample rate, channels, bitrate, duration/start time, first/last audio-packet skip/padding metadata, FFmpeg full-decode status/warnings, and actual `fetch → arrayBuffer → AudioContext.decodeAudioData` results.

| Original | Source rate | Browser duration seconds | Browser PCM RMS |
|---|---:|---:|---:|
| 01.mpga | 44100 | 8.033396 | 0.148906 |
| 02.mpga | 44100 | 15.465542 | 0.378487 |
| 03.mpga | 44100 | 11.600000 | 0.383340 |
| 04.mpga | 44100 | 12.845438 | 0.254530 |
| 05.mp3 | 48000 | 16.345063 | 0.337175 |
| 06.mpga | 44100 | 21.764917 | 0.348498 |
| 07.mp3 | 44100 | 46.233958 | 0.221496 |
| Tipply test MP3 | 24000 | 8.160000 | 0.100046 |

All seven music originals are MPEG-1 Layer III stereo, 192 kb/s, served as `audio/mpeg` regardless of extension. Donate5's 48 kHz source is the material sample-rate difference; Donate7's MP3 has the same 44.1 kHz family as the MPGA tracks. The browser context resamples to 48 kHz. Music first-packet encoder skip is 1105 samples, with varied final padding; Donate2 reports no final padding and its FFprobe container duration exceeds effective browser duration by about 12 ms. Browser durations match existing authored durations within 0.04 ms. The known Tipply probe is MPEG-2 Layer III mono at 64 kb/s.

Every full FFmpeg decode exits 0 with no decode warnings. All eight browser decodes succeed with nonzero PCM. The reported MP3-only failure is not reproducible in this host/Chromium path; extension alone does not explain a codec failure. No source was renamed, reencoded or normalized. Forced decode failure is covered and Studio exposes the original filename plus `SILENT CLOCK ACTIVE`. Hardware OBS codec/playback validation remains outside this Chromium evidence.

## Stream context and export regression

The supplied 2560×1440 Rocket League JPG is copied unchanged into `dev-assets/studio-stream` and served only by the local authoring service. It is absent from the production build. Custom local PNG/JPEG/WebP selection/drop accepts up to 2 MB; the blob is temporary and not persisted. Only explicit stream export writes a local job copy. Reload restores the supplied default. Transparent preview/export excludes both default and custom images.

`scripts/verify-studio-2.1-export.mjs` exercises the unchanged renderer, FFmpeg and the actual local custom-frame export endpoint. A Donate6 3.9–4.1 selection at 60 FPS produces 12 frames and 0.2 s. Both repeated runs match the frozen Production v2 first/middle/last PNG hashes exactly:

| Frame | SHA-256 |
|---|---|
| 0 | `05b669fff058560db47c3b162a297e53e29e33bf742beaff1ff4a41e4e402f6c` |
| 6 | `40011ceb482586a4b51c7028caed672c543b03077b62d31b0326a2661f9cc5fb` |
| 11 | `ea604b1169ca043ad57d57cfe2a5c517e56859b510ac62f7f5354055c3e074e0` |

Explicit stream export contains photographic pixels and an explicit custom solid-red PNG produces red exported pixels. Transparent VP9 is decoded with `libvpx-vp9`; both source PNG and decoded alpha exclude the photograph while preserving donation content. The first inspected active-scene frame has 85.77% fully transparent pixels; decoded alpha differs by at most 1/255 (mean 0.00252/255). The custom probe was completed through the local endpoint before another full authoring render occupied the worker; final alpha verification resumed against those completed probe files. [Export verification](assets/motion-studio-2.1/export-verification.json) records pixel samples and full-plane alpha comparison.

## Final checks and independent review

- `pnpm lint`: exit 0; advisory warnings remain.
- `pnpm typecheck` and `pnpm build`: pass; the existing large production bundle advisory remains. Studio packages and photograph are excluded from production.
- `pnpm test`: 295 tests / 31 files pass.
- `pnpm motion:qa`: 46 cases pass in the full run; three subsequently added focused cases pass for actual centering, failed speech and ephemeral custom reference (49 covered browser cases total).
- Audio audit: seven production originals and retained Tipply probe pass FFmpeg and browser decode.
- Deterministic/export pixel regression: repeat hashes and frozen hashes identical; stream inclusion and decoded alpha checked.
- `git diff --check`: pass. Protected production scene/assets/intelligence/cash/Tipply/FIFO paths have zero changes from the frozen HEAD.

The independent finish reviewer initially found nominal-width playhead centering and stale mobile layout documentation. The centering formula now uses actual track width and the 150px sticky-header viewport; targeted tests at 3.9 and 18 seconds at 8× pass. Desktop gate capture was refreshed after waiting for the actual blocker. DESIGN.md and its sidecar now record desktop-only docked behavior, eye controls and integrated tabs. Final reviewer disposition: **ship**, with all identified findings resolved and no further material visual changes requested. Review used source, supplied references and captured UI under the acknowledged degraded finish-reviewer contract; separate direction/quality-bar approval artifacts were not available.

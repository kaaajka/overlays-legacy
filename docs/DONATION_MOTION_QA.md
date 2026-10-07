# GIF-led motion verification — 2026-10-07

## Automated evidence

- Vitest: **278 passing tests in 27 suites**, including source-frame mapping, deterministic holds, media seek coalescing, preload timeout/fallback and release/disposal, alongside existing music-clock, quality, FIFO and TTS sequencing checks.
- Playwright: **19 passing scenarios in the final run (37.6 s)**. The new seven-tier exact-zero regression verifies fresh initialization, backward seek and Restart yield identical authored states, including normalized transforms and primary/echo media positions.
- All seven live tiers and Studio-only Donate8 have initial, hero −50 ms, exact hero, +50 ms, settle and information captures. Captures wait for decoded media and two animation frames; information additionally asserts the scene is hidden and video sources are released.
- Original-pose comparisons at native resolution: RGB mean absolute error on visible pixels is 0.40 / 2.44 / 0.43 / 0.48 / 0.34 / 0.44 / 0.21 levels out of 255 for Donate1–7. Alpha error is zero for every captured pose, including the transparent dancer. This verifies the selected hero poses, not every possible OBS decoding configuration.
- Conversion verifies identical frame counts, every original variable-delay frame timestamp within 1 ms, matching loop durations and original source SHA-256. Original GIF and audio files remain unchanged.
- Source video corrects after a 500 ms main-thread stall, seeks backward to the authored pose, uses the original animated GIF if WebM fails, and releases both media sources in information. GIF fallback preserves identity but cannot guarantee seek synchronization.
- Audio-clock stall capture advanced from 0.406 s to 0.942 s during a 500 ms stall. This demonstrates clock catch-up, not OBS output latency.
- Lint, typecheck and production build pass. Production excludes Motion Studio. Built CSS is 366.87 kB / 25.43 kB gzip; JS is 477.71 kB / 166.17 kB gzip. Global formatting has 34 preexisting legacy-file differences; no unrelated formatting sweep was applied.

## Reproducing captures

```powershell
pnpm motion:qa
python scripts/create-motion-contact-sheet.py
```

Ignored `.motion-qa/` contains source sheets, per-tier six-frame storyboards, `gif-led-heroes.jpg`, desktop/mobile Studio captures, fidelity JSON and clock-stall measurements. Source sheets were inspected before treatments and implementation. Contact sheets composite transparent captures over a labeled inspection background; they do not alter source footage.

Chromium uses SwiftShader. These checks establish compatibility and deterministic behavior; they do not measure RTX 3070 or OBS decoder throughput.

## Independent visual review

The fresh review accepted seven distinct silhouettes, actual GIF recognizability, source-specific signatures and donor/amount readability. It requested a fix for inconsistent exact-zero GSAP rendering and stable repaint before final information screenshots. GSAP now renders its zero-duration sets at a one-microsecond positive timeline position; music and source media stay at exact zero. New opening regressions cover all seven tiers.

Final disposition: **Accepted for implementation and visual review**. The reviewer inspected the corrections and authoritative browser PNGs. Some displayed composite cells appeared cached; a pixel comparison independently confirmed that every regenerated information cell matches its PNG input, with less than one RGB level of mean JPEG compression error.

| Criterion | Final verdict |
|---|---|
| Original GIF identity and recognizability | Pass |
| Seven distinct compositions and signatures | Pass |
| Captured hero donor legibility | Pass |
| Exact-zero initialization and Restart | Resolved |
| Information visibility and source release | Resolved |
| Stable individual QA PNGs | Pass |
| Composite evidence consistency | Confirmed from regenerated outputs |
| Music/media clock architecture | Pass |
| Studio desktop/mobile | Pass |
| Audible and OBS/reference hardware checks | Manual release gate |

## Manual release gates

| Check | Status |
|---|---|
| Continuous audible GIF/music fit, source-pose impact and legacy personality | Not executed here |
| OBS transparency over bright/dark gameplay, especially the dancer's alpha | Not executed here |
| Recorded click/flash calibration and verified source URL sync offset | Not executed here |
| Real Tipply nickname → amount → complete message speech | Not executed here |
| Sustained 60 FPS and decoder/GPU load alongside an AAA game on Ryzen 7 7800X3D / RTX 3070 / 16 GB | Not executed here |
| OBS source hide/refresh and coordinated backend replay | Not executed here |

Conversion prioritizes controllable faithful playback, not download reduction: seven WebMs total about 64 MB, with the largest about 24 MB. Only the current asset loads, with at most three paused video layers; information/idle releases them. Verify actual OBS codec/alpha support and seek/decode costs before production approval. See `DONATION_MOTION_ENGINE.md` for the operator procedure.

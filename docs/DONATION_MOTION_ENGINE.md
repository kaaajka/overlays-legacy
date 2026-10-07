# Kaaajka Donation Motion Engine v1

The existing websocket → PageChannel → FIFO → DonateEvent path now presents live music-directed scenes. No backend messages, queue reducer, acceptAlert rule, amount thresholds or Tipply URL rules have changed. The scene does not own a queue.

## Commands (Node 24 / pnpm 10.17.1)

```powershell
pnpm install --frozen-lockfile
pnpm dev
pnpm motion:studio
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm exec playwright install chromium
pnpm motion:qa
```

App: `http://localhost:5173/`. Studio: `http://localhost:5173/motion-studio`.
Studio is a DEV-only lazy module: it is omitted from a production build. Production account routes stay unchanged. No websocket is opened by Studio or fixture replay.

## Baseline and authoritative music inventory

Baseline on 2026-10-07: 219 tests passed; one suite could not import a missing Donate10. Typecheck had the same missing import. Lint and production build passed. That suite also expected Donate8 and Donate10 at thresholds that the real configuration does not contain. The test now reflects the actual configuration; no live threshold was added.

Amounts below are **gross selection amounts in grosze**, as in the existing configuration. Display still subtracts commission when `amountWithoutCommission` is true. Voice and all music/TTS volumes are unchanged.

| Live scene | Minimum | Authoritative asset | Decoded duration | Music volume | Voice |
|---|---:|---|---:|---:|---|
| Donate1 / Signal | 50 | donation-template-01.mpga | 8.03342s | .4 | male |
| Donate2 / Ember | 500 | donation-template-02.mpga | 15.46558s | .14 | male |
| Donate3 / Prism | 2500 | donation-template-03.mpga | 11.60000s | .3 | female |
| Donate4 / Vault | 5000 | donation-template-04.mpga | 12.84544s | .4 | female |
| Donate5 / Holy Moly | 10000 | donation-template-05.mp3 | 16.34508s | .3 | female |
| Donate6 / Halo | 15000 | donation-template-06.mpga | 21.76494s | 1 | female |
| Donate7 / Takeover | 30000 | donation-template-07.mp3 | 46.23397s | 1 | female |

All assets are under `public/assets/donations/audio`. Seven GIFs remain as legacy reference assets. Donate8's SAY MY NAME component has no configured threshold, eighth track or eighth GIF. The new Donate8 treatment is a **Studio-only alternate using Donate7 music**. It cannot be selected by a live amount. Activation needs a real product decision and asset; it must not be inferred from the stale baseline tests.

## Runtime architecture

`DonateEvent` snapshots the selected donation and invokes `runMotionDonation`. That coordinator owns one abortable lifecycle: music → information → nickname/amount/message speech → readable hold → 650ms outro → existing `onFinished` callback. Higher amounts never interrupt a running donation.

`MusicPlayback` fetches and decodes the static file, creates a new one-shot AudioBufferSourceNode and schedules `start(context.currentTime + .06, offset)`. A gain preserves the existing volume. Only three decoded buffers are retained. Fetch and decode are bounded together to eight seconds. An abort removes listeners, cancels frames, stops/disconnects the source and closes the context. A duration + five-second watchdog handles a suspended or hung audio context; it does not choreograph anything.

At every rendered frame, `audibleContextTime` projects a recent, valid `getOutputTimestamp()` pair into the current performance time. Unsupported, stale, zero or throwing timestamps fall back to `currentTime`. The resulting absolute track time plus `visualSyncOffsetMs` seeks a paused GSAP timeline. The animation never independently plays alongside audio. A visual stall skips frames and catches up to the music clock.

`DonationScene` uses the official `@gsap/react` lifecycle and GSAP SplitText for name/amount graphemes. It scales a 1920×1080 composition to fit the browser source. Every hero state is authored by timeline sets/tweens, not callbacks. SVG apertures, opposing giant typography and shockwaves remain available in SAFE. The GPU renderer receives authored effect parameters and normalized offline audio features. Random trajectories use the donation ID; replay the same ID to reproduce them.

The message is rendered as plain React text, with the existing fixture/backend emote normalization. Nickname and amount remain dynamic. The information surface retains the complete message, including newlines, and slowly scrolls overflowing text with 2.5-second opening/final holds. Minimum reading time is `max(5500, 5000 + message.length / 18 * 1000)`. It waits for both speech and this hold. Very long messages deliberately take longer; there is no ellipsis or truncation. Particles stop rendering during information; idle has no donation RAF or GPU draw loop.

## Offline analysis and reproducibility

Analysis runs only during authoring, never during a donation. Install ffmpeg and create an isolated Python environment:

```powershell
python -m venv .venv-motion
.venv-motion/Scripts/python.exe -m pip install -r scripts/requirements-motion.lock.txt
.venv-motion/Scripts/python.exe scripts/analyze-donation-audio.py
pnpm exec biome format --write src/donations/choreography
```

Alternatively activate the environment, then `pnpm motion:analyze`. On Unix use `.venv-motion/bin/python`. `requirements-motion.txt` records the primary MIR dependency; the lock records the versions used for the committed analysis.

ffmpeg decodes mono 22050 Hz samples; librosa 0.11.0 computes STFT band energy, RMS, spectral-flux onsets and an estimated beat grid. Schema version 1 includes source filename/SHA-256, analyzer provenance, duration, tempo uncertainty, beat timestamps, onset times/strengths and seven normalized frequency bands sampled at 20 Hz. Five-frame offline smoothing keeps seeking deterministic. The Studio plot is an **energy envelope**, not a claim of a raw PCM waveform.

The analyzer does not invent downbeats, sections, tension or drops: those arrays remain empty unless reliably authored. Tempo and onset detection are imperfect for short clips and speech. Hero timings in `donateN/cues.ts` are explicit authoring choices aligned with measured transients and incumbent track structure; they are not automatic drop labels. Listening approval remains part of OBS art-direction QA.

## Editing choreography

Read a tier's `TREATMENT.md`, `analysis.json`, `cues.ts` and `choreography.ts` together. The treatment records concept, tension, hero, type, atmosphere, camera, particle role, information layout and budget. Keep a cue inside the actual decoded duration, with unique names and increasing times. `validateCues` checks required cues and ordering. Add all musical moves to the paused timeline, never `setTimeout`, CSS animation delays or GSAP callbacks that spawn live animations. `createChoreography` contains the shared scene grammar and motif-specific shots; a tier director is the entry point for extending a particular scene.

The audio-feature bus supplies continuous bands, loudness, onset/kick envelopes and beat/bar phase. `barPhase` is an approximate four-beat grouping, **not a detected downbeat**. The CueLatch primitive reports every crossed cue with increasing event IDs; it is available for future nonvisual event consumers. Current visuals use absolute-time envelopes and timeline seeks, which need no frame-sensitive event trigger. Secondary audio bindings live in `audioBindings.ts`: remap, clamp, gate, deadzone, exponent curve, inversion, scale, offset and time-domain smoothing. Do not route every beat to every element. Major impacts stay cue-authored.

## GPU, alpha and quality

WebGL2 is the highest supported path for v1; WebGPU is not required. There is no speculative ULTRA mode. HIGH draws at .8 scale with at most 520 particle instances. MEDIUM uses .55 scale / 220. SAFE draws no GPU pixels but preserves all authored type/SVG timing. Core count is a conservative starting heuristic; `?motionQuality=medium` or `safe` overrides it. Sustained frames slower than 23ms in a 120-frame window lower HIGH to MEDIUM once. Rendering rate measurements include other work on the main thread and cannot establish GPU cost alone.

The GPU scene has two bounded draw calls: analytic atmosphere/shockwave and instanced, absolute-time particles/banknotes. No simulation accumulation, huge DOM particle forest, blur stack or render-target postprocessing. It requests alpha, premultiplied alpha, no depth/stencil/MSAA and low-power preference; clears RGBA to zero; outputs premultiplied color and blends ONE / ONE_MINUS_SRC_ALPHA. Shader/link/init errors and context loss preserve the SAFE scene. Resources are deleted and the context released on unmount. A React error boundary keeps a readable fallback and protects PageChannel from scene exceptions.

Legacy donation effect Sass is retained for reference but removed from the live stylesheet entrypoint. Its large generated fireworks/money-rain rules are no longer shipped for the migrated scenes. Unrelated roulette/coinflip/event/goal/queue styles remain loaded.

A normal browser source cannot sample gameplay underneath it. The separate `OverlayRenderer` is the integration boundary for a future explicitly supplied OBS scene texture/filter adapter. V1 deliberately has no capture or source-sharing implementation; all light/distortion-like effects draw overlay pixels only.

## Studio and fixture QA

Choose all eight identities; use real fixture content; play/pause/restart, numeric/range seek, previous/next cue, ±50ms controls, cue buttons, estimated beat grid, energy trace, features, renderer and frame timing. Changing detail/seed preserves the inspection time. Preview backgrounds include an explicitly illustrative broadcast, checkerboard and transparent output. Browser playback may require pressing Play; production OBS must permit browser-source audio.

Useful URL: `/motion-studio?tier=6&time=hero&seed=review-1`. Clean capture: `/motion-studio?clean=1&tier=6&time=hero&background=transparent&quality=high`. Optional `nickname`, `message`, and gross `amount` query values test content extremes. `window.motionStudio` is a DEV-only automation seam.

Existing account fixture example:

```text
/TIP_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-donate-motion-queue&muteAudio=1&fast=1&motionQuality=safe
```

Remove `fast=1` to exercise actual silent music-clock durations and readable holds. Remove `muteAudio=1` for audible template/TTS replay and the existing audio-unlock prompt. The queue fixture sends three donations with increasing amounts through the original PageChannel handler, not a Studio-only queue.

`pnpm motion:qa` captures before/exact/after hero frames and information for all eight treatments into ignored `.motion-qa/`. It verifies backward seeks, canvas alpha coverage, SAFE without WebGL, failed audio loads, a 500ms main-thread stall, pause/restart, full-message scrolling, FIFO completion and idle cleanup. SwiftShader runs are compatibility tests, not RTX 3070 performance measurements. Unit tests exercise clock projection, cues, feature fallback/latching, bindings, seed/intensity, governor, audio source lifecycle/timeouts/abort and existing queue integration.

Final automated verification on 2026-10-07: 267 unit tests and 16 browser scenarios pass; lint, typecheck and production build pass. Changed motion files pass formatting. Repository-wide `format:check` still reports formatting differences in 34 unchanged legacy files; no unrelated formatting sweep was applied. The visual review found and corrected donor/amount overlap, overly uniform radial payoffs, narrow mobile Studio controls and colliding plot labels. The final review disposition is recorded in `DONATION_MOTION_QA.md`.

## OBS setup and calibration

1. Add a Browser Source above gameplay, 1920×1080, custom frame rate **60 FPS**, hardware acceleration enabled. Enable Control audio via OBS and route/monitor it intentionally to avoid duplicate monitoring. Keep Browser Source custom CSS empty; html/body/root are transparent.
2. During a donation, avoid refreshing or shutting down the source: that cancels the current local playback. A newly loaded page relies on the backend's existing alert coordination/replay behavior. Leave the event source alive while actively streaming. Source refresh remains an operational reset, not pause/resume persistence.
3. Add Studio as a temporary local Browser Source. Open Interact, choose a sync offset and press Schedule click + flash. The click is scheduled one second ahead; a 50ms flash reads the same projected audio clock. Record at 60 FPS with the source audio. Repeat several times.
4. Compare flash onset to click onset in an editor. One frame is about 16.67ms. **Positive `visualSyncOffsetMs` draws the motion earlier**; negative draws later. If video is 33ms late, try +33ms. Account for OBS audio sync offsets and monitoring latency independently.
5. Put the verified offset on the real alert URL: `?visualSyncOffsetMs=33` (or `&visualSyncOffsetMs=33` if a query already exists). Offset is bounded ±500ms; invalid values become zero. Record again.
6. Exercise low/middle/high donations and top-tier music through completion. Verify donor name, net amount, complete message, nickname/amount/message speech order, outro, next donation, hidden/visible transitions, and no active donation rendering when idle.
7. Put a bright game scene under the source; inspect halo, shockwave, bills, word masks and information edges for black rectangles/alpha fringes. Repeat HIGH/MEDIUM/SAFE. Force context loss in a browser first, then test the fallback in OBS with hardware acceleration disabled if necessary.
8. Run a representative AAA game simultaneously on the reference machine; record OBS frame/render lag and GPU load for each tier, especially Donate7's 46-second track. Tune to MEDIUM if needed. Compare capture at hero ±50ms; confirm there is anticipation, one clear impact and readable settle.

Actual OBS alpha, device A/V latency, voice quality and reference-hardware load are manual release gates. Chrome screenshots cannot certify them.

## Troubleshooting

Black rectangle: remove custom CSS/OBS background, confirm the source build contains the transparent root rule, then try SAFE to isolate GPU alpha. Audio blocked: check source audio enablement/monitoring, browser permission and the Studio Play button. Failed file: inspect the inventory path; the engine uses a silent AudioBuffer and retains authored timing, then TTS. No Web Audio at all: music failure proceeds directly to information/TTS and completion. Queued alerts stuck: inspect original websocket/acceptAlert coordination separately from the motion renderer, and replay the FIFO fixture. Changed cue timestamp: inspect the source hash and regenerate analysis; do not assume BPM implies a drop.

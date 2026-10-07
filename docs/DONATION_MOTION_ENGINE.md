# Kaaajka Donation Motion Engine — Production v2

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
| Donate1 / Turkey two-step | 50 | donation-template-01.mpga | 8.03342s | .4 | male |
| Donate2 / Masked dance floor | 500 | donation-template-02.mpga | 15.46558s | .14 | male |
| Donate3 / Rodent rave | 2500 | donation-template-03.mpga | 11.60000s | .3 | female |
| Donate4 / Deadpan paper roll | 5000 | donation-template-04.mpga | 12.84544s | .4 | female |
| Donate5 / Arms-wide ovation | 10000 | donation-template-05.mp3 | 16.34508s | .3 | female |
| Donate6 / Heart from the booth | 15000 | donation-template-06.mpga | 21.76494s | 1 | female |
| Donate7 / Webcam overload | 30000 | donation-template-07.mp3 | 46.23397s | 1 | female |

All assets are under `public/assets/donations/audio`. Seven original GIFs are binding live-scene identity assets; each now has a faithful derived WebM and source-pose PNG under `public/assets/donations/media`. Donate8's SAY MY NAME component has no configured threshold, eighth track or eighth GIF. The new Donate8 treatment is a **Studio-only alternate using Donate7 music**. It cannot be selected by a live amount. Activation needs a real product decision and asset; it must not be inferred from the stale baseline tests.

## Runtime architecture

`DonateEvent` snapshots the selected donation and invokes `runMotionDonation`. That coordinator owns one abortable lifecycle: music → information → nickname/amount/message speech → readable hold → 650ms outro → existing `onFinished` callback. Higher amounts never interrupt a running donation.

`MusicPlayback` fetches and decodes the static file, creates a new one-shot AudioBufferSourceNode and schedules `start(context.currentTime + .06, offset)`. A gain preserves the existing volume. Only three decoded buffers are retained. Fetch and decode are bounded together to eight seconds. An abort removes listeners, cancels frames, stops/disconnects the source and closes the context. A duration + five-second watchdog handles a suspended or hung audio context; it does not choreograph anything.

At every rendered frame, `audibleContextTime` projects a recent, valid `getOutputTimestamp()` pair into the current performance time. Unsupported, stale, zero or throwing timestamps fall back to `currentTime`. The resulting absolute track time plus `visualSyncOffsetMs` seeks a paused GSAP timeline. The animation never independently plays alongside audio. A visual stall skips frames and catches up to the music clock.

`DonationScene` retains the official `@gsap/react` lifecycle, clock, quality and readable landing, but selects seven separate JSX scenes in `src/donations/scenes`. Their independent directors live in each `donateN/choreography.ts`. Shared helpers only set up SplitText, labels and cleanup. Room dance, alpha dancer echoes, rodent shutter strip, paper unroll, open-arm panorama, hand-heart bridge and pixel monitor wall have independent layouts and reveal language. Source GIF, music observations, exact media placement and storyboard are recorded in each `TREATMENT.md` and `DONATION_GIF_ART_DIRECTION.md`. Donate8's previous abstract director stays Studio-only.

`MediaLayer` never calls video.play(). Videos are silent and paused; absolute music time selects the original GIF frame using the manifest's variable frame starts. Each source has its own pose-hold window before/after the hero; held poses land on the unchanged authored music cue. Source loops and delayed echoes use the same mapping. In-flight seeks coalesce to the latest requested clock; `seeked` flushes the newest request after a stall. Native decoder completion is asynchronous, so exact QA captures wait for seek completion and a browser paint. This is frame-level coordination, not sample-perfect video output.

Preload is bounded at five seconds, independent of queue/music progress. A failed WebM uses the original animated GIF, with explicitly degraded source-frame synchronization. A source-derived PNG is visible while loading. All video/fallback sources unload at information/unmount; returning to a hero in Studio explicitly reloads them. The normal scene uses at most one source asset and one or three video elements; static top-tier monitors share the source pose.

The message is rendered as plain React text, with the existing fixture/backend emote normalization. Nickname and amount remain dynamic. The information surface retains the complete message, including newlines, and slowly scrolls overflowing text with 2.5-second opening/final holds. Minimum reading time is `max(5500, 5000 + message.length / 18 * 1000)`. It waits for both speech and this hold. Very long messages deliberately take longer; there is no ellipsis or truncation. Particles stop rendering during information; idle has no donation RAF or GPU draw loop.

## Offline analysis and reproducibility

The original librosa pass remains the v1 foundation. Version 2 adds real PCM waveform, stem activity, rhythmic/vocal candidates, source-matched corrections and authored structure/reaction data. See [Music Intelligence v2](MUSIC_INTELLIGENCE_V2.md) for the schema, installed model versions, commands, forced alignment and approval workflow. No ML runs in OBS and original audible tracks are unchanged.

`analyze-donation-audio.py` regenerates the v1 foundation when source audio changes; follow it with the v2 pipeline to restore extended authoring data. Do not overwrite a completed v2 fixture merely to regenerate an unchanged source. Raw inference and creative timing remain separately labelled.

## Editing choreography

Read a tier's `TREATMENT.md`, source GIF/contact sheet, `analysis.json`, `cues.ts` and `choreography.ts` together. Keep cues unique, ordered and inside decoded duration. Add musical moves only to the paused timeline. Each live scene owns its JSX and timeline; source media uses `SourceMedia` with a tier and optional delay. `sceneTools` provides lifecycle and typography primitives, not a common visual skeleton. The old `createChoreography` serves only Studio-only Donate8. Do not swap media between scenes as if they were skins.

The audio-feature bus supplies continuous bands, loudness, onset/kick envelopes and beat/bar phase. `barPhase` uses corrected/inferred adjacent downbeats where available; otherwise it falls back to approximate four-beat grouping. Downbeat estimates are not verified meter. The CueLatch primitive reports every crossed cue with increasing event IDs; it is available for future nonvisual event consumers. Current visuals use absolute-time envelopes and timeline seeks, which need no frame-sensitive event trigger. Secondary audio bindings live in `audioBindings.ts`: remap, clamp, gate, deadzone, exponent curve, inversion, scale, offset and time-domain smoothing. Do not route every beat to every element. Major impacts stay cue-authored.

## Rendering, alpha and quality

Donate1–4 preserve localized source/type/SVG scenes with no cash or GPU layer. Donate5–7 use deterministic Canvas2D cash: fountain, intimate handoff and top-tier storm. HIGH/MEDIUM/SAFE draw at most 72/40/14 bills total across overlapping waves; Donate6 stays capped at 12. SAFE keeps a smaller visible cash identity. Donate7 protects the donor/callout column from foreground bills. No simulation accumulation, passive particle forest or private renderer RAF exists. Cash clears at information and resources release on unmount/cancel.

The same quality governor can reduce detail after sustained slow frames. Main-thread measurements include other work and do not prove GPU cost. Generic aperture/ring/shockwave/tension/travel effects are removed from the seven live directors. Studio-only Donate8 retains the older WebGL2 renderer and context-loss fallback; it has no live amount threshold. Alpha, original media and the core composition survive SAFE.

Legacy donation effect Sass remains reference-only and is excluded from the live stylesheet entrypoint. Unrelated event/game/goal/queue styles remain loaded. Overlay renderers draw their own pixels; they cannot sample underlying gameplay.

## Studio and fixture QA

[Motion Studio v2](MOTION_STUDIO_V2.md) documents direct PLN/name/message inputs, manual tier selection, Hero Only/Full Alert, local spoken test clips, layer/vocal inspection, multitrack zoom/pan/loop/snap, shortcuts and deterministic export. The DEV-only automation seam remains `window.motionStudio`; production bundles exclude the editor and export services.

Clean capture: `/motion-studio?clean=1&tier=6&time=hero&background=transparent&quality=high`. Optional query `amount` is gross grosze for compatibility; visible Studio amount is PLN.

The account fixture still invokes the original PageChannel handler:

```text
/TIP_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-donate-motion-queue&muteAudio=1&fast=1&motionQuality=safe
```

Remove `fast=1` for real clock durations/readable holds and `muteAudio=1` for existing fixture audio. Automated evidence and manual release gates are recorded in [Donation motion QA](DONATION_MOTION_QA.md).

## OBS setup and calibration

1. Add a Browser Source above gameplay, 1920×1080, custom frame rate **60 FPS**, hardware acceleration enabled. Enable Control audio via OBS and route/monitor it intentionally to avoid duplicate monitoring. Keep Browser Source custom CSS empty; html/body/root are transparent.
2. During a donation, avoid refreshing or shutting down the source: that cancels the current local playback. A newly loaded page relies on the backend's existing alert coordination/replay behavior. Leave the event source alive while actively streaming. Source refresh remains an operational reset, not pause/resume persistence.
3. Add Studio as a temporary local Browser Source. Open Interact, choose a sync offset and press Schedule click + flash. The click is scheduled one second ahead; a 50ms flash reads the same projected audio clock. Record at 60 FPS with the source audio. Repeat several times.
4. Compare flash onset to click onset in an editor. One frame is about 16.67ms. **Positive `visualSyncOffsetMs` draws the motion earlier**; negative draws later. If video is 33ms late, try +33ms. Account for OBS audio sync offsets and monitoring latency independently.
5. Put the verified offset on the real alert URL: `?visualSyncOffsetMs=33` (or `&visualSyncOffsetMs=33` if a query already exists). Offset is bounded ±500ms; invalid values become zero. Record again.
6. Exercise low/middle/high donations and top-tier music through completion. Verify donor name, net amount, complete message, nickname/amount/message speech order, outro, next donation, hidden/visible transitions, and no active donation rendering when idle.
7. Put a bright game scene under the source; inspect source edges, cash, typography and information edges for black rectangles/alpha fringes. Repeat HIGH/MEDIUM/SAFE. Test media failure and SAFE cash; WebGL context loss applies only to Studio-only Donate8.
8. Run a representative AAA game simultaneously on the reference machine; record OBS frame/render lag and GPU load for each tier, especially Donate7's 46-second track. Tune to MEDIUM if needed. Compare capture at hero ±50ms; confirm there is anticipation, one clear impact and readable settle.

Actual OBS alpha, device A/V latency, voice quality and reference-hardware load are manual release gates. Chrome screenshots cannot certify them.

## Troubleshooting

Black rectangle: remove custom CSS/OBS background, confirm the source build contains the transparent root rule, then try SAFE to isolate GPU alpha. Audio blocked: check source audio enablement/monitoring, browser permission and the Studio Play button. Failed file: inspect the inventory path; the engine uses a silent AudioBuffer and retains authored timing, then TTS. No Web Audio at all: music failure proceeds directly to information/TTS and completion. Queued alerts stuck: inspect original websocket/acceptAlert coordination separately from the motion renderer, and replay the FIFO fixture. Changed cue timestamp: inspect the source hash and regenerate analysis; do not assume BPM implies a drop.


## Preparing source media

```powershell
python -m pip install -r scripts/requirements-media.txt
pnpm motion:media
.venv-intelligence/Scripts/python.exe scripts/audit-donation-media.py
pnpm motion:qa
```

The preparation script creates faithful lossless candidates and posters; the audit is the final representation decision. Six opaque sources use accepted VP9 CRF 4 / 4:4:4. Transparent Donate2 retains its verified lossless alpha encode. Every original variable frame timestamp stays within 1 ms and frame count/duration match. Original GIFs/posters are unchanged. Seven WebMs total 41,604,844 bytes; largest 16,229,794 bytes. At most the selected source loads, with one or three paused decoders; information releases them. See [per-asset decisions](DONATION_MEDIA_V2_AUDIT.md).

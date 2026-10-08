# Production 2.2 — validation, 2026-10-08

This is the current pass on `michal-szwindowski/donation-motion-engine`. Earlier Production v2/Studio 2.1 reports remain historical evidence. The owner's new screenshot is evidence of a real Donate5 failure; the earlier inability to reproduce it is superseded by the trace below.

## Donate5: delivery fails before decode

Installed Chrome 154.0.8037.98 reproducibly received HTTP 204 and a zero-byte body at the original Donate5 MP3 URL. The decode then rejected with EncodingError. Original Donate7 MP3 also exhibited this response; Donate4/6 MPGA comparison paths delivered their files. HTTP command-line requests returned the complete Donate5 MP3, and bundled Chromium 153.0.8010.12 decoded it. Original-URL query/cache-reload probes still received the empty response in Chrome.

The pre-fix instrumented app run captured 48 completed decode attempts, 44 failures. It attempted 100 page loads but its original readiness wait did not establish completion on every load; it is not claimed as 100 completed pre-fix trials. Exact failed bodies and JSON diagnostics remain in `.motion-qa/production-2.2/audio/`. Their empty SHA-256 is `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

The empty response had connection-close/no-cache headers and lacked the expected audio MIME/length. IDMan was running on the workstation. An external download interceptor is a hypothesis; the trace does not identify the responsible process. There is no evidence that 48 kHz or the original MP3 bitstream is invalid.

The DEV-only authoring server now streams the unchanged originals through extension-free `/__studio-assets/music/5` and `/7`, with audio/mpeg and Content-Length. Original Donate5 is 408,979 bytes, SHA-256 `ff3599db51b6550e8ba867e81fdcb23440451f639578c1db44c964d0312534a0`, identical to Git's original file. Production asset resolution, music files and source media were not re-encoded or replaced. Production routes retain original asset URLs; this finding/fix concerns the local Studio delivery path.

| Verification | Completed | Failures |
|---|---:|---:|
| Installed Chrome: actual fresh Donate5 Studio loads | 100 | 0 |
| Installed Chrome: comparison loads/switches, same audit | 6 | 0 |
| Bundled Chromium: actual app loads/switches | 108 | 0 |
| Installed Chrome: same-context fresh decode | 100 | 0 |
| Installed Chrome: fresh contexts | 100 | 0 |
| Installed Chrome: HTTP cache-request mode | 100 | 0 |
| Installed Chrome: diagnostic cache-bust requests | 100 | 0 |
| Installed Chrome: decoded-buffer cache | 100 | 0 |
| Installed Chrome: Donate4/6/7 comparison | 3 | 0 |

HTTP cache-request mode records `force-cache` requests, not a claimed cache hit; DEV responses may revalidate. Decoded-buffer cache is a separate explicit mode. Native Chrome Play measured peak window RMS 0.130974, an advancing 2.503651-second position and active playback. Visible IAB checks exercised Donate5 Play/Restart, Full Alert, 4→5→6→5/switching and all seven hero times on the owner stream.

On failure, Studio reports a Polish music error/silent-clock state, preserves technical byte/context diagnostics and offers manual fresh-context/refetch retry that restores inspection position. Empty 204 is detected before decode. Offline export uses FFmpeg independently; its success does not establish browser playback. The export panel explicitly warns when preview music is unavailable.

Reproduce: `node scripts/diagnose-studio-audio.mjs --chrome`, `node scripts/diagnose-studio-audio-contexts.mjs`.

## Composition, Information and Tipply

All seven zero PNGs on the same owner stream are identical. Fresh, backwards-to-zero and Restart checks pass. Composition sheets contain INITIAL at 150 ms, HERO at authored hero +500 ms and SETTLE at hero +2.2 s, plus separate ZERO and dark/checker heroes. Source clips and authored cue times remain original. Native media sizes, paired donor widths and the review fixes are recorded in the direction/design documents.

The hero matrix exercises seven tiers × three names (including 32 characters) × five amounts (5 / 57.32 / 2137.69 / 99999.99 / 1000000 PLN): 105 cases. Full defensive 132-character names remain intact and separate; they are URL/fuzz inputs, outside the normal composer limit.

| Information case | Width × height, scene px |
|---|---|
| Short / default | 560 × 165 |
| 100 characters | 960 × 211 |
| 225 characters | 960 × 304 |
| One / several / consecutive emotes | 560 × 166 |
| 225 characters with emotes | 960 × 306 |
| 32-character name, short message | 847 × 165 |
| 32-character name, 225-character message | 960 × 304 |

Header geometry is stable during reading; only overflowing message content scrolls. Above-limit defensive text reaches its final line. Emote boxes reserve 45px before decoding, preserve aspect/transparency, select animation frames from the shared absolute Information clock and reproduce the same pixels after seeking away/back. Decode is bounded by 5 seconds, 2 MB, 240 frames and 2 million frame pixels per emote; unsupported/failed decoding preserves its alt text in the reserved slot.

Tipply audit: the existing `main-donate-html-message.json` fixture uses string `args.message` with an img tag carrying src/alt; fixture README calls these legacy-compatible mirrors, but the attached composer DOM does not prove current backend serialization. The newly supplied textarea/picker proves maxlength 225 and the exact names/CDN URLs for emojiBubbly/xdd, not socket token metadata. No current production backend capture was available, so its complete emote contract remains unverified.

Production accepts safe img metadata via a structured TextRun/EmoteRun model, extracts only src/alt and allowlists HTTPS `cdn.7tv.app/emote/…/[1–4]x.(png|gif|webp)`. React renders text and vetted canvas images; no raw innerHTML. Other markup is literal text. Plain shortcodes stay plain text in production. Only Studio's explicit known fixture registry resolves emojiBubbly/xdd for layout QA. This does not claim a universal 7TV lookup or backend contract. Email is never copied into the donation model/display. Semantic alt/text remains complete; existing backend TTS URLs and queue/FIFO behavior remain unchanged.

## Checks and exports

- Unit tests: 298 passing in 32 files.
- Browser QA: 53 passing after the reviewer asset/layout/copy fixes, including native TTS, Full Alert, failure/cancellation, FIFO, GPU fallback, source seek/hold, six desktop sizes and the unsupported/mobile gate.
- Typecheck/build passed; final build is repeated after the review changes. Existing Vite >500KB bundle-size advisory remains.
- Lint exits successfully; existing important-style and diagnostic-script suggestions remain warnings/info.
- One Impeccable detector invocation, no findings; no second detector run.
- React checklist: effects clean up listeners, aborts, timers and decoded frames; new help/emote components are module-scoped; emote frames use the existing clock rather than a private animation RAF. No production dependency was added.

`scripts/verify-production-2.2-export.mjs` checks repeated MP4 hero and Information PNG hashes, owner-stream background, VP9 alpha (maximum decoded/source delta 1), transparent exported frame zero for all seven and full Donate5 stream/audio at 30 FPS. `scripts/capture-production-2.2-export-result.mjs` captures a real completed UI MP4 export. Machine reports and media remain under `.motion-qa/production-2.2/export`; completed verification is recorded below.

The independent visual reviewer first returned **fix**. Its original findings and final verdict are preserved in `PRODUCTION_22_FINISH_REVIEW.md`; a technical PASS is not human aesthetic acceptance.


Completed export results: repeated MP4 hero and Information hashes match; all seven transparent public-zero exports contain zero alpha; VP9 maximum alpha difference is 1. Full Donate5 on the real stream at 30 FPS contains 704 frames, 23.466667 seconds and an audio stream. Visible IAB Studio produced a completed Donate5 Full Alert selection 1.99–18.2 seconds at 60 FPS: 973 frames, 16.216667 seconds. The selection was set to those actual clamped bounds; it is not represented as an 18–18.2-second render. A second real UI export of Donate6 Full Alert Information at 23–23.2 seconds completed and its download returned 186,867 bytes. The successful panel capture is `docs/assets/production-2.2/studio-export-complete.png`. Compact contact sheets, measurements, audio traces and export verification are committed under that directory; raw lossless captures, frame sequences, MP4/WebM outputs and failed empty bodies remain in the local QA directory.

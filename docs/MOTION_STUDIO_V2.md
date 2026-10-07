# Motion Studio 2 — operation and export

Run `pnpm dev`, then open `http://localhost:5173/motion-studio`. Studio, speech fixtures, local authoring endpoints, Playwright and FFmpeg work stay development-only. Production account URLs, queue/FIFO and Tipply speech URL behavior are unchanged.

## Authoring desk

The desktop editor has top transport, a left scene/layer tree, contained 1920×1080 preview, right Donation Data/Inspector/Export panels, and a horizontally scrollable multitrack timeline. On phones the complete interface stacks and scrolls; desktop remains the authoring priority.

Enter nickname, amount in **PLN**, full message and commission directly. `57,32` or `57.32` converts to 5732 integer cents. Ambiguous, negative, exponential and three-decimal entries are rejected. Scene selection is manual by default: Donate6 can show 57,32 zł. Optional automatic selection uses the real live thresholds. Stress presets retain every character; long hero names use a readable multiline minimum and bounded reveal duration. Changing viewer data, scene, quality or seed cancels old playback before restoring inspection. Query-string grosze remain only a compatibility/capture seam, not the main UX.

Hero Only plays original music against the authoritative audio clock and supports pause, arbitrary seek and IN/OUT looping. Full Alert starts at zero and invokes **the same `runMotionDonation()` coordinator as production**: hero/music → information → enabled nickname/amount/message speech → readable hold → 650ms outro → complete. Information remains visible while speech runs. The full text scrolls inside its bounded surface with opening and final reading holds. Restart or seek cancels music and local speech; Full Alert pause is a cancellation, and the next Full Alert starts from zero.

Studio uses three fixed locally spoken Polish samples (Paulina), labelled in Donation Data. They exercise each enabled stage audibly without Tipply/S3 requests. They do **not** synthesize arbitrary entered text: custom data appears on the information card; the samples say “Kaaajka”, a fixed 57,32 zł amount and a short fixed thank-you. Regenerate fixtures with `scripts/prepare-studio-speech.ps1` on Windows. Production continues using backend-provided voice URLs and existing volumes.

## Inspecting time and layers

- Waveform is actual original PCM min/max; optional single overlay is loudness, bass, vocal activity or drum activity.
- Beats/downbeats remain labelled estimates unless individually approved. Authored structure, vocal reaction cues, phrases/words, cue labels, source loop/hold/resume, typography and relevant cash/camera tracks share a music axis. Empty vocal/cash/camera tracks are omitted.
- Zoom is 1–12×; horizontal scroll pans. Drag a track body to scrub; optional snapping chooses beat, downbeat, authored cue or original source frame. Set IN then OUT (or OUT first when moving IN beyond the old OUT), toggle Loop Selection, or select a cue neighborhood (−0.75/+1.5 seconds). Clear Loop restores the range.
- Readout shows absolute time, current beat/bar estimate, authored cue, source time/hold and available vocal word. Lifecycle durations appear separately; speech is not represented as part of music time.
- Tree visibility overrides are local debug controls. Inspector exposes source dimensions/frame count, requested source frame, pose hold, decoder state, delayed media positions and measured features. Cue time and selected layer remain identifiable.
- Vocal/structure timing can be corrected/approved; saving authoring JSON is explicit. See [Music Intelligence](MUSIC_INTELLIGENCE_V2.md).

| Shortcut | Action |
|---|---|
| Space | Play/pause |
| Home | Beginning |
| Left/right | −/+10 ms |
| Shift + left/right | −/+50 ms |
| Up/down | Previous/next authored cue |

Shortcuts ignore editable fields. Sync calibration is in Inspector: adjust offset, schedule click+flash, record in OBS, then place the measured `visualSyncOffsetMs` on the real source URL. Positive offset draws motion earlier. It is bounded to ±500 ms.

## Deterministic export

Export chooses Hero, Full Donation, Current Selection or Cue Neighborhood; 1920×1080; default 60 FPS (optional 30); seed/quality; solid graphite, illustrative stream or transparent background; and original audio on/off. MP4/H.264 is shareable and uses solid/stream background. Transparency requires VP9 WebM. The alpha path was decoded and checked, rather than inferred from a codec name.

`Render Export` posts a snapshot of donation data/options to the local Vite authoring service. One worker runs at a time; a concurrent request returns a clear busy error. The worker opens a clean Chromium stage, closes its development websocket so HMR cannot interrupt rendering, waits for fonts/media, and samples:

`frame n → start + n/FPS → renderAt(time) → decoder completion → browser paint → PNG`

Full Donation uses the shared pure reading/TTS timing plan; information scrolling and outro opacity are evaluated at absolute lifecycle time. This export path does not play speech in real time. FFmpeg mixes the original template music and fixed local speech clips at their planned offsets. `runMotionDonation()` remains the live playback coordinator; export is its deterministic frame representation, without real-time timer waits or a second queue.

Frames and result/manifest live under ignored `.motion-exports/<job>/`. The manifest records inputs, normalized analysis/hash, exact IN/OUT, frame count, rounded output duration, lifecycle plan, selected PNG hashes and ffprobe output. UI progress reports rendering/encoding/completion and exposes a download. PNGs remain available for diagnostic comparison. Export fails explicitly if controlled WebM falls back to animated GIF, since that fallback cannot guarantee deterministic source-frame captures. Production playback still has its original-GIF fallback.

Frame count is `ceil((OUT−IN)×FPS)`. Duration is that count divided by FPS: the final source sample is `IN+(count−1)/FPS`, up to one frame before OUT. The final outro frame approaches zero opacity. Output is reproducible for the same inputs and rendering environment; use an explicit detail tier for comparisons across different hosts.

CLI fallback while the development server is running:

```powershell
pnpm motion:export --tier 6 --range selection --in 3.9 --out 4.1 --fps 60 --format mp4 --audio false
pnpm motion:export --tier 1 --range full --format mp4 --nickname StudioReview --amount 5732 --message 'Pełna wiadomość testowa'
pnpm motion:export --tier 2 --range selection --in 3.6 --out 3.8 --format webm --background transparent --audio false
```

CLI `--amount` is integer grosze for compatibility with automated captures; Studio's visible field is PLN. FFmpeg/ffprobe must be on PATH and Chromium installed (`pnpm exec playwright install chromium`). Keep these tools and `.venv-intelligence` out of production deployment.

Verified examples: 12-frame 60 FPS selection at 3.9–4.1 s without audio; 908-frame full Donate1 at 60 FPS with original music/local speech, 15.133333 s; transparent 12-frame VP9 selection. Repeated first/middle/last PNG hashes matched exactly. Decoded alpha differed from source PNG alpha by at most 1/255 (mean 0.0158/255), with no opaque full-frame fill. OBS support for the resulting alpha codec remains a separate manual gate.

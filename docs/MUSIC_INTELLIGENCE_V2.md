# Music Intelligence v2 — offline authoring

The original seven audio files remain the production master clock. Committed JSON supplies timing; OBS executes no Python, inference model, stem separator or transcription service. The baseline freeze and publication are recorded in [the audit](DONATION_PRODUCTION_V2_AUDIT.md).

## Tools and reproducibility

The tested Python environment is 3.12.10. Install FFmpeg/ffprobe separately, then:

```powershell
python -m venv .venv-intelligence
.venv-intelligence/Scripts/python.exe -m pip install torch==2.6.0+cpu torchaudio==2.6.0+cpu --index-url https://download.pytorch.org/whl/cpu
.venv-intelligence/Scripts/python.exe -m pip install -r scripts/requirements-intelligence.lock.txt --extra-index-url https://download.pytorch.org/whl/cpu
.venv-intelligence/Scripts/python.exe scripts/music-intelligence.py --stems --beats --transcribe
```

The primary requirements file records the intended tools; the lock records this run's complete installed versions. First use downloads model weights into the libraries' local caches. Subsequent inference can use cached weights offline. Missing optional models or failed inference record failure provenance and retain fallback analysis. FFmpeg and librosa are required for the base PCM pass.

- [demucs-onnx](https://github.com/StemSplit/demucs-onnx), version 0.3.4, supplies four `htdemucs` stems with CPU ONNX inference and fp16 weights. Stem WAVs live under ignored `.music-work/donateN/`; their cache is keyed to the original source hash. Vocals, drums, bass and other are analysis material, never replacement production audio.
- [Beat This](https://github.com/CPJKU/beat_this), version 1.1.0, `small0`, CPU/no DBN, suggests beat and downbeat positions. The 0.65/0.55 confidence values are conservative authoring heuristics, not calibrated probabilities or verified meter.
- [faster-whisper](https://github.com/SYSTRAN/faster-whisper), version 1.2.1, `small`, CPU/int8, transcribes the vocal stem. [stable-ts](https://github.com/jianfch/stable-ts), version 2.19.1, supplies DTW timing and local-text alignment. ASR probability is retained; difficult singing and short clips still require listening review. PCM NumPy input avoids relying on PyAV file-decoder keyword compatibility.

All seven tracks have committed PCM waveforms, stem activity, rhythmic candidates, structure suggestions and failure provenance. Word candidates exist for six tracks (0/39/2/25/11/61/15 words for tiers 1–7). They are **unapproved**; this pass does not certify guessed lyrics. Raw transcription output stays in ignored work files.

For verified text already available locally:

```powershell
.venv-intelligence/Scripts/python.exe scripts/music-intelligence.py --tiers 6 --stems --transcribe --lyrics-dir C:/local/verified-text --language en
```

Place UTF-8 `donate6.txt` in that directory. `--language` is required for alignment. No lyric database is fetched. This alignment command is supported; no verified local lyric file was supplied for this pass, so alignment accuracy remains a listening check.

## Versioned data

`analysis.json` retains v1 duration/source hash, tempo estimate, measured RMS, seven bands and spectral-flux onsets. Version 2 adds `intelligence`:

| Category | Fields | Meaning |
|---|---|---|
| measured | waveform, drums, vocals | Original PCM min/max waveform (800 bins) and normalized stem RMS at 20 Hz |
| measured.drumEvents | at, strength, kind, confidence, source | Measured onset plus explicitly labelled **spectral-ratio classification hypothesis**; `kick-like` is not a verified drum label |
| inferred | beats, downbeats, sections, vocalPhrases, words | Automatic candidates with confidence, source and `approved:false` |
| authored | sourceSha256, beats, downbeats, sections, vocalPhrases, words, cues | Source-matched approved corrections and deliberate creative timing |
| provenance | base, stems, rhythm, vocals | Tool/method/status/fallback; avoids silently treating a missing stem as isolated audio |

Regions carry `start/end`, `text` or `label`, `confidence`, `approved` and `source`. Timing marks carry `at` and the same review fields. Authored reaction cues carry `at/name/intensity/group`. Schema v1 remains supported; it does not acquire invented words or downbeats during migration. Invalid/out-of-range/unsorted data is normalized or discarded safely.

Correction files live in `src/donations/music-authoring/donateN.json`. The offline script merges only a matching `sourceSha256`. Runtime normalization likewise ignores mismatched correction hashes. Approved corrections replace overlapping word/phrase candidates and nearby rhythmic candidates; other candidates remain available. Only approved vocal phrases or authored reaction cues drive production phrase reactions. Raw ASR text is never automatically painted over a scene.

Authored structure regions describe each show's intro/reveal, build, restraint, payoff, rhythmic response and release. These are creative scene phrases aligned to the existing authored cues, **not automatic verse/chorus identification**. Up to three small source reactions per track use measured vocal-energy peaks; their provenance is creative energy timing, without claiming a verified word meaning. Important semantic word cues still require explicit correction/approval.

## Correcting and approving

In Studio, select a word/phrase or authored structure region in the timeline. The inspector exposes text, boundaries, source and confidence. Edit the boundaries/text, approve, and optionally create a vocal reaction cue. The original music does not change. `Approve downbeat at playhead` adds an explicit timing correction. `Save authored corrections` writes the source-matched correction file and current analysis JSON through the local development endpoint; inspect and commit that authoring diff deliberately.

Approval is not transcription truth inferred from a high model score. Listen at the word and phrase boundaries. Prefer a few meaningful reactions over one visual event for every word.

The feature bus prefers corrected/inferred beats; bar phase uses adjacent downbeats where available and otherwise retains approximate four-beat grouping. Drum-stem spectral events can supply kick-like envelopes; `onset × bass` remains an explicitly degraded fallback. Every runtime value derives from absolute track time, so backward seek and skipped visual frames do not accumulate state.

Tests validate v1/v2 normalization, sorted bounded timing, word boundaries, hash precedence, optional failure, deterministic source-matched seven-track fixtures and exclusion of heavy authoring imports from the built browser bundle. Model prose is not a golden assertion.

# Production-v2 source representation audit

Original GIFs and source-pose PNGs are unchanged. Exact variable cadence, seekable holds, recognizable fidelity and alpha outrank smallest file size. The previous opaque lossless WebMs were compared with CRF 14 and then CRF 4 candidates; CRF 14 failed the conservative acceptance bound. Six CRF 4 / 4:4:4 candidates passed every-frame checks. The alpha dancer retains its prior verified lossless encode.

|Tier|GIF bytes|Previous WebM bytes|Current WebM bytes|Mean RGB error|PSNR dB|Decision|
|---|---:|---:|---:|---:|---:|---|
|1|2,816,138|7,322,710|3,559,733|1.1266|44.207|visually lossless VP9 CRF 4, 4:4:4|
|2|4,139,198|3,585,022|3,585,022|alpha retained|—|lossless VP9 alpha; preserve verified dancer alpha/chroma|
|3|396,616|904,303|579,618|1.1434|44.085|visually lossless VP9 CRF 4, 4:4:4|
|4|8,333,703|20,912,843|13,563,131|1.1953|43.933|visually lossless VP9 CRF 4, 4:4:4|
|5|2,214,433|6,077,768|3,643,338|0.9848|44.656|visually lossless VP9 CRF 4, 4:4:4|
|6|8,232,213|24,148,796|16,229,794|1.2494|43.56|visually lossless VP9 CRF 4, 4:4:4|
|7|518,308|791,905|444,208|0.6845|45.997|visually lossless VP9 CRF 4, 4:4:4|

Total current WebM bytes: **41,604,844** (previous approximately 63.7 MB). Largest is Donate6 at 16,229,794 bytes. Some WebMs remain larger than their GIF; bounded frame control and source-pose seek justify the representation. The tiny webcam encode is smaller than its original GIF.

Acceptance: same dimensions/frame count; every frame timestamp within 1 ms; source loop duration unchanged; PSNR ≥43 dB and maximum per-frame RGB MAE <2.5/255. Browser hero checks independently bound visible RGB error to <3/255 and alpha error to <0.015. These thresholds are test evidence, not a universal perceptual guarantee.

The manifest `src/motion/media/assets.json` records each candidate, previous trial and FFmpeg CPU decode wall time. Decode timings include process startup and are **not OBS performance measurements**. The normal runtime uses one selected asset and at most three paused decoders, coalesces seeks and unloads at information. Original animated GIF is the playback failure fallback; deterministic exports require working controlled WebM.

Regeneration: `prepare-donation-media.py` generates the lossless source candidates; `audit-donation-media.py` makes the final conservative acceptance decision. The audit preserves the original comparison size so rerunning it does not mislabel the accepted same-size candidate. Use Pillow/NumPy in the isolated intelligence environment and FFmpeg/ffprobe on PATH.

Actual OBS VP9 profile/alpha support, seek/decode cost and AAA-game contention remain manual release gates.

"""Offline MIR authoring data. Requires ffmpeg on PATH and requirements-motion.txt.
Never called by the browser. No automatic drop/downbeat claims.
"""
import hashlib
import io
import json
import subprocess
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
BANDS = {
    "subBass": (20, 60), "bass": (60, 250), "lowMid": (250, 500),
    "mid": (500, 2000), "upperMid": (2000, 4000),
    "presence": (4000, 6000), "brilliance": (6000, 11025),
}

def normalized(values):
    ceiling = float(np.percentile(values, 95)) if len(values) else 0
    return np.clip(values / max(ceiling, 1e-8), 0, 1)

for source in sorted((ROOT / "public/assets/donations/audio").glob("*")):
    index = int(source.stem.split("-")[-1])
    raw = subprocess.run([
        "ffmpeg", "-v", "error", "-i", str(source), "-f", "wav",
        "-ac", "1", "-ar", "22050", "pipe:1",
    ], check=True, capture_output=True).stdout
    y, sr = sf.read(io.BytesIO(raw), dtype="float32")
    hop = 512
    spectrum = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop)) ** 2
    frequencies = librosa.fft_frequencies(sr=sr, n_fft=2048)
    rms = normalized(librosa.feature.rms(y=y, hop_length=hop)[0])
    onset = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    onset_norm = normalized(onset)
    bpm, beats = librosa.beat.beat_track(onset_envelope=onset, sr=sr, hop_length=hop)
    onset_frames = librosa.onset.onset_detect(onset_envelope=onset, sr=sr, hop_length=hop)
    bands = {name: normalized(np.sqrt(spectrum[(frequencies >= lo) & (frequencies < hi)].sum(axis=0)))
             for name, (lo, hi) in BANDS.items()}
    # 20 Hz feature data; smoothing is baked offline and deterministic when seeking.
    times = np.arange(0, len(y) / sr, 0.05)
    frames = np.clip(np.rint(times * sr / hop).astype(int), 0, len(rms) - 1)
    def samples(values):
        smooth = np.convolve(values, np.ones(5) / 5, mode="same")
        return [round(float(v), 4) for v in smooth[np.minimum(frames, len(smooth) - 1)]]
    duration = round(len(y) / sr, 5)
    data = {
        "schemaVersion": 1, "source": source.name,
        "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "analyzer": "librosa 0.11.0 / ffmpeg mono 22050 / STFT 2048 hop 512",
        "duration": duration, "bpm": round(float(np.asarray(bpm).item()), 3),
        "tempoConfidence": "estimate; short clips, speech and tempo changes can mislead",
        "beats": [round(float(t), 5) for t in librosa.frames_to_time(beats, sr=sr, hop_length=hop)],
        "downbeats": [],
        "onsets": [{"at": round(float(f * hop / sr), 5), "strength": round(float(onset_norm[f]), 4)}
                   for f in onset_frames],
        "sampleInterval": 0.05,
        "loudness": samples(rms), "bands": {name: samples(v) for name, v in bands.items()},
        "sections": [],
        "notes": "No inferred downbeats, drops or sections. Author these after listening in Studio.",
    }
    target = ROOT / f"src/donations/choreography/donate{index}/analysis.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(data, separators=(",", ":")) + "\n", encoding="utf-8")
    strongest = sorted(data["onsets"], key=lambda o: o["strength"], reverse=True)[:12]
    print(f"Donate{index}: {duration:.3f}s, estimated {data['bpm']} BPM; strong onsets: {strongest}")

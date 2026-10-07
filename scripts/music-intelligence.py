"""Offline authoring only. Original audio is never changed; ML suggestions are never auto-approved."""
import argparse
import hashlib
import io
import json
import re
import subprocess
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.music-work'


def read_audio(path, sr=22050):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1',
                                   '-ar', str(sr), '-f', 'wav', 'pipe:1'])
    return sf.read(io.BytesIO(raw), dtype='float32')[0]


def envelope(y, sr, duration, interval=.05):
    rms = librosa.feature.rms(y=y, hop_length=512)[0]
    rms = np.clip(rms / max(float(np.percentile(rms, 95)), 1e-8), 0, 1)
    return [round(float(v), 4) for v in np.interp(np.arange(0, duration, interval),
            librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=512), rms)]


def safe_events(events, duration):
    result = []
    for event in events:
        start, end = float(event.get('start', -1)), float(event.get('end', -1))
        if np.isfinite(start + end) and 0 <= start < end <= duration + .01:
            result.append({**event, 'start': round(start, 5), 'end': round(min(end, duration), 5)})
    return sorted(result, key=lambda event: (event['start'], event['end']))


def analyze(tier, args, beat_model, whisper_model):
    directory = ROOT / f'src/donations/choreography/donate{tier}'
    base = json.loads((directory / 'analysis.json').read_text())
    # v1 measured envelopes remain immutable; repeated v2 runs do not analyze their own inference.
    source = ROOT / 'public/assets/donations/audio' / base['source']
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    duration = base['duration']
    y = read_audio(source)
    work = WORK / f'donate{tier}'
    work.mkdir(parents=True, exist_ok=True)
    wav = work / 'original.wav'
    sf.write(wav, y, 22050)
    measured = {'waveform': [], 'drums': [], 'vocals': [], 'drumEvents': []}
    # Actual min/max waveform bins, not a loudness envelope mislabeled as PCM.
    for chunk in np.array_split(y, 800):
        measured['waveform'].append([round(float(chunk.min()), 4), round(float(chunk.max()), 4)])
    inferred = {'beats': [], 'downbeats': [], 'sections': [], 'vocalPhrases': [], 'words': []}
    provenance = {'base': base.get('analyzer', 'librosa v1'), 'stems': {'status': 'not-requested'},
                  'rhythm': {'status': 'fallback', 'method': 'librosa tempo/onsets'},
                  'vocals': {'status': 'not-requested'}}
    provenance.update(getattr(args,'model_errors',{}))
    vocals = wav
    drums = wav
    if args.stems:
        try:
            from demucs_onnx import separate
            stem_paths = {name: work / f'{name}.wav' for name in ['vocals', 'drums', 'bass', 'other']}
            cache=work/'stem-source.json'
            cached_hash=json.loads(cache.read_text()).get('sourceSha256') if cache.exists() else None
            if cached_hash != digest or not all(path.exists() for path in stem_paths.values()):
                print(f'Donate{tier}: separating four stems', flush=True)
                stems = separate(wav, model='htdemucs', precision='fp16weights', providers='cpu', progress=False)
                for name, data in stems.items():
                    # separate() returns source-rate samples (our authoring WAV is 22050 Hz).
                    sf.write(stem_paths[name], data.T, 22050)
                cache.write_text(json.dumps({'sourceSha256':digest}))
            vocals, drums = stem_paths['vocals'], stem_paths['drums']
            measured['vocals'] = envelope(read_audio(vocals), 22050, duration)
            measured['drums'] = envelope(read_audio(drums), 22050, duration)
            provenance['stems'] = {'status': 'ready', 'method': 'demucs-onnx 0.3.4 / htdemucs fp16weights / CPU',
                'sourceSha256': digest, 'files': [path.name for path in stem_paths.values()]}
        except Exception as error:
            provenance['stems'] = {'status': 'failed', 'error': str(error), 'fallback': 'original audio'}
            print(f'Donate{tier}: optional stem failure: {error}', flush=True)
    if beat_model:
        try:
            beats, downbeats = beat_model(str(wav))
            inferred['beats'] = [dict(at=round(float(t), 5), confidence=.65, approved=False,
                source='beat-this small0; heuristic confidence, not calibrated probability')
                for t in beats if 0 <= t < duration]
            inferred['downbeats'] = [dict(at=round(float(t), 5), confidence=.55, approved=False,
                source='beat-this small0; review meter/phase on short clips')
                for t in downbeats if 0 <= t < duration]
            provenance['rhythm'] = {'status': 'ready', 'method': 'beat-this 1.1.0 small0 / CPU / no DBN'}
        except Exception as error:
            provenance['rhythm'] = {'status': 'failed', 'error': str(error), 'fallback': 'librosa beats'}
    # Spectral event hypotheses from the isolated drum stem, not onset*bass classification.
    d = read_audio(drums)
    spectrum = abs(librosa.stft(d, n_fft=2048, hop_length=256)) ** 2
    freq = librosa.fft_frequencies(sr=22050, n_fft=2048)
    flux = librosa.onset.onset_strength(y=d, sr=22050, hop_length=256)
    peaks = librosa.onset.onset_detect(onset_envelope=flux, sr=22050, hop_length=256)
    for index in peaks:
        at = index * 256 / 22050
        low = float(spectrum[(freq >= 30) & (freq < 180), index].sum())
        high = float(spectrum[(freq >= 1800) & (freq < 8000), index].sum())
        kind = 'kick-like' if low > high * 1.4 else 'snare-like' if high > low * 1.4 else 'accent'
        measured['drumEvents'].append(dict(at=round(at, 5), kind=kind, strength=round(float(min(1, flux[index]/max(np.percentile(flux,95),1e-8))),4),
            confidence=.55 if vocals != wav else .25, source='stem spectral-ratio hypothesis' if vocals != wav else 'mixed spectral-ratio fallback'))
    # Novelty candidates are not automatically named verse/chorus/downbeat ground truth.
    coarse = np.array(base['loudness'])
    novelty = abs(np.diff(coarse))
    selected = []
    for index in np.argsort(novelty)[::-1]:
        at = (int(index)+1)*.05
        if 1 < at < duration - 1 and all(abs(at-other)>2 for other in selected): selected.append(at)
        if len(selected) >= 4: break
    boundaries = [0] + sorted(selected) + [duration]
    inferred['sections'] = [dict(start=round(a,5),end=round(b,5),label='energy region',confidence=.3,approved=False,source='RMS novelty candidate') for a,b in zip(boundaries,boundaries[1:])]
    if whisper_model:
        try:
            local_text = args.lyrics_dir / f'donate{tier}.txt' if args.lyrics_dir else None
            print(f'Donate{tier}: vocal transcription/alignment', flush=True)
            if local_text and local_text.exists():
                if not args.language: raise ValueError('--language is required for verified-text alignment')
                result = whisper_model.align(read_audio(vocals,16000), local_text.read_text(encoding='utf-8'), language=args.language, verbose=None)
                method = 'stable-ts forced alignment to local verified text'
            else:
                result = whisper_model.transcribe(read_audio(vocals,16000), language=args.language, beam_size=5,
                    condition_on_previous_text=False, word_timestamps=True, verbose=None)
                method = f'faster-whisper {args.model} + stable-ts DTW word timing; unapproved ASR'
            (work/'vocal-candidates.json').write_text(json.dumps(result.to_dict(),ensure_ascii=False,indent=2),encoding='utf-8')
            for segment in result.to_dict()['segments']:
                words = segment.get('words', [])
                for word in words:
                    inferred['words'].append(dict(start=word['start'],end=word['end'],text=word['word'].strip(),
                        confidence=round(float(word.get('probability') or 0),4),approved=False,source=method))
                inferred['vocalPhrases'].append(dict(start=segment['start'],end=segment['end'],text=segment['text'].strip(),
                    confidence=round(float(np.mean([w.get('probability') or 0 for w in words])) if words else 0,4),approved=False,source=method))
            provenance['vocals'] = {'status': 'ready', 'method': method, 'model': args.model,
                'language': result.to_dict().get('language'), 'approval': 'required for production word cues'}
        except Exception as error:
            provenance['vocals'] = {'status': 'failed', 'error': str(error)}
    inferred['words'] = safe_events(inferred['words'],duration)
    inferred['vocalPhrases'] = safe_events(inferred['vocalPhrases'],duration)
    authored = {'sourceSha256': digest, 'beats': [], 'downbeats': [], 'sections': [], 'words': [], 'vocalPhrases': [], 'cues': []}
    correction = ROOT / f'src/donations/music-authoring/donate{tier}.json'
    if correction.exists():
        candidate = json.loads(correction.read_text())
        if candidate.get('sourceSha256') == digest: authored.update(candidate)
        else: provenance['corrections'] = 'ignored: source hash mismatch'
    base['schemaVersion'] = 2
    base['intelligence'] = dict(measured=measured,inferred=inferred,authored=authored,provenance=provenance)
    (directory / 'analysis.json').write_text(json.dumps(base,separators=(',',':'))+'\n',encoding='utf-8')
    print(f'Donate{tier}: v2 written; stems={provenance["stems"]["status"]}, rhythm={provenance["rhythm"]["status"]}, words={len(inferred["words"])}',flush=True)


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--tiers',nargs='+',type=int,default=list(range(1,8)),choices=range(1,8))
    parser.add_argument('--stems',action='store_true')
    parser.add_argument('--beats',action='store_true')
    parser.add_argument('--transcribe',action='store_true')
    parser.add_argument('--model',default='small')
    parser.add_argument('--lyrics-dir',type=Path)
    parser.add_argument('--language')
    args=parser.parse_args()
    beat_model=whisper_model=None
    args.model_errors={}
    if args.beats:
        try:
            from beat_this.inference import File2Beats
            beat_model=File2Beats(checkpoint_path='small0',device='cpu',dbn=False)
        except Exception as error: args.model_errors['rhythm']={'status':'failed','error':str(error),'fallback':'librosa beats'}
    if args.transcribe:
        try:
            import stable_whisper
            whisper_model=stable_whisper.load_faster_whisper(args.model,device='cpu',compute_type='int8',cpu_threads=4)
        except Exception as error: args.model_errors['vocals']={'status':'failed','error':str(error)}
    for tier in args.tiers: analyze(tier,args,beat_model,whisper_model)

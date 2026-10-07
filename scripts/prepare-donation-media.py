"""Faithful GIF-derived VP9 media. Requires ffmpeg/ffprobe and Pillow.
No replacement footage, recoloring, interpolation, crop or timing normalization.
"""
import hashlib
import json
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/assets/donations/media'
DEST.mkdir(parents=True, exist_ok=True)
POSES = [17, 63, 4, 29, 25, 29, 38]
metadata = []
for tier in range(1, 8):
    source = ROOT / f'public/assets/donations/gif/donation-template-{tier:02}.gif'
    image = Image.open(source)
    frames, durations = [], []
    for frame in range(image.n_frames):
        image.seek(frame)
        frames.append(image.convert('RGBA').copy())
        durations.append(image.info.get('duration', 100))
    transparent = any(frame.getextrema()[3][0] < 255 for frame in frames)
    duration = sum(durations) / 1000
    output = DEST / f'donation-template-{tier:02}.webm'
    poster = DEST / f'donation-template-{tier:02}.png'
    frames[POSES[tier-1]].save(poster)
    subprocess.run([
        'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ignore_loop', '1',
        '-i', str(source), '-an', '-fps_mode', 'passthrough', '-t', str(duration),
        '-c:v', 'libvpx-vp9', '-lossless', '1', '-g', '16', '-enc_time_base', '1:1000', '-auto-alt-ref', '0',
        '-pix_fmt', 'yuva420p' if transparent else 'yuv444p', str(output),
    ], check=True)
    probe = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(output)
    ]))
    starts = [round(sum(durations[:frame]) / 1000, 5) for frame in range(len(frames))]
    encoded_starts = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
        'frame=best_effort_timestamp_time', '-of', 'json', str(output)
    ]))['frames']
    assert len(encoded_starts) == len(starts), 'Conversion changed frame count'
    assert all(abs(float(frame['best_effort_timestamp_time'])-start) <= .00101
               for frame, start in zip(encoded_starts, starts)), 'Conversion changed source frame timing'
    metadata.append(dict(
        tier=tier, source=source.name, sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),
        width=image.width, height=image.height, frameCount=len(frames), duration=duration,
        frameStarts=starts, sourceLoop=image.info.get('loop'), transparent=transparent,
        heroSourceTime=starts[POSES[tier-1]], representation='GIF-derived VP9 WebM',
        holdBeforeHero=[0.08, 0.12, 0.06, 0.35, 0.12, 0.31, 0.12][tier-1],
        holdAfterHero=[0.10, 0.08, 0.06, 0.35, 0.10, 0.65, 0.18][tier-1],
        sourceBytes=source.stat().st_size, webmBytes=output.stat().st_size,
        encodedDuration=float(probe['format']['duration']),
        pixelFormat='yuva420p' if transparent else 'yuv444p',
    ))
(ROOT / 'src/motion/media/assets.json').parent.mkdir(parents=True, exist_ok=True)
(ROOT / 'src/motion/media/assets.json').write_text(json.dumps(metadata, indent=2) + '\n')
print(json.dumps([{k:v for k,v in row.items() if k!='frameStarts'} for row in metadata], indent=2))

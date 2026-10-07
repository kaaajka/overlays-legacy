"""Evaluate smaller VP9 against every original frame; exact cadence and alpha remain binding."""
import json
import subprocess
import time
from pathlib import Path
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
work=ROOT/'.music-work/media-audit';work.mkdir(parents=True,exist_ok=True)
manifest=ROOT/'src/motion/media/assets.json'
assets=json.loads(manifest.read_text())
for asset in assets:
    tier=asset['tier']
    source=ROOT/'public/assets/donations/gif'/asset['source']
    current=ROOT/f'public/assets/donations/media/donation-template-{tier:02}.webm'
    candidate=work/f'donation-{tier}.webm'
    old_size=asset.get("audit",{}).get("previousWebmBytes",current.stat().st_size)
    if asset['transparent']:
        asset['encoding']='lossless VP9 alpha; preserve verified dancer alpha/chroma'
        continue
    subprocess.run(['ffmpeg','-v','error','-y','-ignore_loop','1','-i',str(source),'-an',
        '-t',str(asset['duration']),'-fps_mode','passthrough','-enc_time_base','1:1000',
        '-c:v','libvpx-vp9','-crf','4','-b:v','0','-g','16','-row-mt','1','-cpu-used','2',
        '-pix_fmt','yuv444p',str(candidate)],check=True)
    frames=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0',
        '-show_entries','frame=best_effort_timestamp_time','-of','json',str(candidate)]))['frames']
    assert len(frames)==asset['frameCount']
    assert all(abs(float(frame['best_effort_timestamp_time'])-at)<.0011 for frame,at in zip(frames,asset['frameStarts']))
    started=time.perf_counter()
    decoded=subprocess.check_output(['ffmpeg','-v','error','-i',str(candidate),'-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgb24','pipe:1'])
    decode_ms=(time.perf_counter()-started)*1000
    images=np.frombuffer(decoded,dtype=np.uint8).reshape(-1,asset['height'],asset['width'],3)
    gif=Image.open(source);errors=[];square=[]
    for index in range(gif.n_frames):
        gif.seek(index)
        reference=np.array(gif.convert('RGB'),dtype=np.float32)
        diff=images[index].astype(np.float32)-reference
        errors.append(float(abs(diff).mean()));square.append(float((diff*diff).mean()))
    psnr=float(10*np.log10(255**2/max(np.mean(square),1e-9)))
    # Conservative bound across every frame; retain the current faithful encode if a candidate fails.
    accepted=psnr>=43 and max(errors)<2.5 and candidate.stat().st_size<=old_size
    if accepted: current.write_bytes(candidate.read_bytes())
    asset['webmBytes']=current.stat().st_size
    asset['encoding']='visually lossless VP9 CRF 4, 4:4:4' if accepted else 'lossless VP9 retained'
    if 'audit' in asset and asset['audit'].get('decision') != 'candidate accepted': asset.setdefault('previousTrials',[]).append(asset['audit'])
    asset['audit']={'previousWebmBytes':old_size,'candidateBytes':candidate.stat().st_size,
        'psnrDb':round(psnr,3),'maximumFrameMeanRGBError':round(max(errors),4),
        'meanRGBError':round(float(np.mean(errors)),4),'candidateDecodeMs':round(decode_ms,2),
        'decodeScope':'ffmpeg CPU wall time incl process startup; not OBS performance',
        'decision':'candidate accepted' if accepted else 'faithful current retained'}
    print(tier,asset['audit'],flush=True)
manifest.write_text(json.dumps(assets,indent=2)+'\n',encoding='utf-8')

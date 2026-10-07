"""Compose browser QA frames over a labeled inspection background; source GIFs remain untouched."""
from pathlib import Path
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / '.motion-qa'
names = ['Turkey two-step', 'Masked dance floor', 'Rodent rave', 'Deadpan paper roll',
         'Arms-wide ovation', 'Heart from the booth', 'Webcam overload']
labels = ['initial', 'before', 'exact', 'after', 'settle', 'information']
hero_sheet = Image.new('RGB', (1920, 1170), '#24313b')
draw = ImageDraw.Draw(hero_sheet)
for index, name in enumerate(names):
    frame = Image.open(DEST / f'donate{index+1}-exact.png').convert('RGBA')
    frame.thumbnail((640, 360)); x, y = index % 3 * 640, index // 3 * 390
    hero_sheet.paste(frame, (x, y+30), frame)
    draw.text((x+12, y+8), f'Donate{index+1} / {name}', fill='white')
hero_sheet.save(DEST / 'gif-led-heroes.jpg', quality=95)
for tier in range(1, 8):
    sheet = Image.new('RGB', (1920, 780), '#24313b'); draw = ImageDraw.Draw(sheet)
    for index, label in enumerate(labels):
        frame = Image.open(DEST / f'donate{tier}-{label}.png').convert('RGBA')
        frame.thumbnail((640, 360)); x, y = index % 3 * 640, index // 3 * 390
        sheet.paste(frame, (x, y+30), frame); draw.text((x+12, y+8), label, fill='white')
    sheet.save(DEST / f'donate{tier}-storyboard.jpg', quality=95)
print(DEST / 'gif-led-heroes.jpg')

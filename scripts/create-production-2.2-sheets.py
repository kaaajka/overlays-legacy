from pathlib import Path
from PIL import Image,ImageDraw
folder=Path('.motion-qa/production-2.2')
def sheet(name, files, columns=3, cell=(640,390)):
 image=Image.new('RGB',(columns*cell[0],((len(files)+columns-1)//columns)*cell[1]),'#15171b');draw=ImageDraw.Draw(image)
 for i,(label,path) in enumerate(files):
  source=Image.open(folder/path).convert('RGB');source.thumbnail((cell[0],360));x=(i%columns)*cell[0];y=(i//columns)*cell[1]
  image.paste(source,(x,y+25));draw.text((x+12,y+7),label,fill='#ffe1cf')
 image.save(folder/name,quality=92)
for bg in ('stream','solid','checker'):
 sheet('heroes-'+bg+'.jpg',[(f'Donate{n} HERO',f'donate{n}-{bg}-hero.png')for n in range(1,8)])
sheet('compositions-stream.jpg',[(f'Donate{n} {state.upper()}',f'donate{n}-stream-{state}.png')for n in range(1,8)for state in ('initial','hero','settle')])
cases=['short','default','100','225','one','several','consecutive','max-emotes','max-name-short','max-name-225']
sheet('information-matrix.jpg',[(name,'info-'+name+'.png')for name in cases])
print('Five contact sheets saved in '+str(folder))

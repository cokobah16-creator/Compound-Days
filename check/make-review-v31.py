"""Contact sheet of actual runtime geometry exports, not a browser screenshot."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps
import json
root=Path(__file__).resolve().parents[1];dest=root/'check/review31'
build=json.loads((root/'check/geometry31/build.json').read_text())['build']
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
heading=ImageFont.truetype(font,27);label=ImageFont.truetype(font,19);small=ImageFont.truetype(font,16)
canvas=Image.new('RGB',(1440,1150),'#EEE9DF');d=ImageDraw.Draw(canvas)
d.rectangle((0,0,1440,83),fill='#294A3E');d.text((28,18),'COMPOUND DAYS  /  VISUAL REBUILD',font=heading,fill='#F5EBDD');d.text((28,54),'Offline runtime mesh review — not WebGL screenshots',font=small,fill='#D1D9CB')
for k,(file,title)in enumerate([(root/'check/review/base_a-head.png','v30 head  ·  previous build'),(dest/'base_a-head.png','v31 head  ·  authored facial surface'),(dest/'hair_curls.png','v31 natural coils  ·  fitted hair')]):
    im=Image.open(file).convert('RGB');im=im.crop((0,36,im.width,im.height-29));im=ImageOps.fit(im,(452,515),method=Image.Resampling.LANCZOS)
    x=24+k*476;canvas.paste(im,(x,110));d.text((x+7,638),title,font=label,fill='#345346')
im=Image.open(dest/'courtyard.png').convert('RGB');im=im.crop((0,35,im.width,im.height-29));im=ImageOps.fit(im,(1392,403),method=Image.Resampling.LANCZOS,centering=(.5,.48));canvas.paste(im,(24,682))
d.text((28,1106),build+'  ·  Authored material maps, curved foliage and courtyard details',font=small,fill='#4E6658')
canvas.save(dest/'Visual_Review_v31.png',optimize=True)
print(dest/'Visual_Review_v31.png')

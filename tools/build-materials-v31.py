"""Deterministic tileable game textures. Authored patterns, no external images."""
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
ROOT=Path(__file__).resolve().parents[1]/'dist/assets/materials'
ROOT.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(31018);N=512
y,x=np.mgrid[:N,:N]
def noise(scale=8):
    a=rng.random((scale,scale))*255
    return np.asarray(Image.fromarray(a.astype('uint8')).resize((N,N),Image.Resampling.BICUBIC),dtype=float)/255-.5
def save(name,a):
    a=np.asarray(a)
    if a.ndim==2:a=np.repeat(a[...,None],3,axis=2)
    Image.fromarray(np.clip(a,0,255).astype('uint8')).save(ROOT/(name+'.png'),optimize=True)
fine=rng.normal(0,1,(N,N))
plaster=242+noise(12)*10+noise(64)*5+fine*1.4
save('plaster',plaster);save('plaster-height',128+noise(64)*26+fine*4)
save('plaster-roughness',234+noise(16)*14)
for name,step in [('paving',256),('terracotta',128)]:
    X=x%step;Y=y%step;edge=np.minimum.reduce([X,step-1-X,Y,step-1-Y])
    tile=239+noise(8)*13+noise(64)*5+fine*1.5
    for yy in range(0,N,step):
        for xx in range(0,N,step):tile[yy:yy+step,xx:xx+step]+=rng.uniform(-8,5)
    grout=177+noise(32)*12
    diffuse=np.where(edge<3,grout,tile-np.maximum(0,7-edge)*2.5)
    height=np.where(edge<3,90,np.minimum(156,118+edge*6))+noise(64)*6
    save(name,diffuse);save(name+'-height',height);save(name+'-roughness',226+noise(16)*14)
grain=7*np.sin(y*.42+3*np.sin(x*.008))+4*np.sin(y*1.48+np.sin(x*.02))
wood=229+grain+noise(8)*14+noise(64)*3+fine
board=np.minimum(y%128,127-y%128);wood-=np.maximum(0,3-board)*7
save('wood',wood);save('wood-height',128+grain*1.2-noise(32)*8);save('wood-roughness',212+noise(32)*20)
weave=242+3*np.cos(x*np.pi/2)+3*np.cos(y*np.pi/2)+2*np.cos((x+y)*np.pi/2)+fine*.7
save('cloth',weave);save('cloth-height',128+(weave-242)*3);save('cloth-roughness',243+noise(32)*8)
hair=235+10*np.sin(x*.45+4*np.sin(y*.07))*np.sin(y*.41+3*np.sin(x*.06))+noise(64)*12
save('hair',hair);save('hair-height',128+(hair-235)*1.8)
sand=237+noise(8)*18+noise(64)*7+fine*3
save('sand',sand);save('sand-height',128+noise(64)*16+fine*5)
metal=235+10*np.cos(x*np.pi/16)+noise(32)*4
save('metal',metal);save('metal-height',128+45*np.cos(x*np.pi/16))
# A restrained wax-print repeat for cushions and table runners.
im=Image.new('RGB',(N,N),'#E3C894');d=ImageDraw.Draw(im)
for row in range(-1,5):
    for col in range(-1,5):
        cx=col*128+(row%2)*64;cy=row*128
        d.ellipse((cx-47,cy-47,cx+47,cy+47),fill='#294E4B')
        d.ellipse((cx-34,cy-34,cx+34,cy+34),fill='#D6AC5E')
        for k in range(8):
            a=k*np.pi/4;px=cx+np.cos(a)*25;py=cy+np.sin(a)*25
            d.ellipse((px-7,py-7,px+7,py+7),fill='#F2E6CB')
        d.ellipse((cx-9,cy-9,cx+9,cy+9),fill='#9A5034')
im.save(ROOT/'ankara.png',optimize=True)
print('Authored',len(list(ROOT.glob('*.png'))),'material maps')

"""Offline mesh inspection. Not a screenshot of the WebGL game."""
import json,sys,ctypes,subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def render(file,yaw=0,head=False,seating=False,world=False,size=(650,850)):
    meshes=json.loads(Path(file).read_text());W,H=size
    angle=np.deg2rad(yaw)
    right=np.array([np.cos(angle),0,-np.sin(angle)])
    pitch=np.deg2rad(34 if world else 5)
    up=np.array([-np.sin(angle)*np.sin(pitch),np.cos(pitch),-np.cos(angle)*np.sin(pitch)])
    forward=np.cross(right,up)
    center=np.array([0,1.685,0]) if head else np.array([0,.91,0])
    extent=.45 if head else 1.98
    if seating:center=np.array([-5.30,.69,3.50]);extent=2.3
    if world:center=np.array([0,1.6,-.7]);extent=13.8
    scale=(H-100)/extent
    tris=[];textures=[];texture_ids={}
    light=np.array([-.45,.65,.72]);light/=np.linalg.norm(light)
    for m in meshes:
        v=np.array(m['verts']).reshape(-1,3);n=np.array(m['norms']).reshape(-1,3);c=np.array(m['colors']).reshape(-1,3);f=np.array(m['faces']).reshape(-1,3)
        view=(v-center)@np.array([right,up,forward]).T
        xy=np.column_stack([W/2+view[:,0]*scale,H/2-view[:,1]*scale])
        # A neutral diffuse key and broad fill make geometry and intersections readable.
        illum=.36+.70*np.maximum(0,n@light)+.12*np.maximum(0,n@np.array([.8,.1,-.4]))
        lin=np.clip(c*illum[:,None],0,1)
        tex=m.get('texture');texture_id=-1
        if tex:
            if tex not in texture_ids:
                source=Path(__file__).resolve().parents[1]/'public'/'play'/tex
                # Fixed offline mip level prevents high-frequency weave aliasing.
                texture_ids[tex]=len(textures);textures.append(np.array(Image.open(source).convert('RGB').resize((128,128),Image.Resampling.LANCZOS).resize((512,512),Image.Resampling.BILINEAR)))
            texture_id=texture_ids[tex]
        uv=np.array(m.get('uvs') or [0]*(len(v)*2)).reshape(-1,2)
        vertex=np.column_stack([xy,view[:,2],lin,uv,np.full(len(v),texture_id)]);tris.append(vertex[f])
    triangles=np.ascontiguousarray(np.concatenate(tris),dtype=np.float32)
    rgb=np.zeros((H,W,3),dtype=np.uint8)
    lib=ctypes.CDLL(str(Path(__file__).resolve().parent/'raster.so'))
    atlas=np.ascontiguousarray(np.stack(textures) if textures else np.zeros((1,512,512,3)),dtype=np.uint8)
    lib.raster_textured(triangles.ctypes.data_as(ctypes.POINTER(ctypes.c_float)),len(triangles),W,H,atlas.ctypes.data_as(ctypes.POINTER(ctypes.c_ubyte)),512,rgb.ctypes.data_as(ctypes.POINTER(ctypes.c_ubyte)))
    im=Image.fromarray(rgb);draw=ImageDraw.Draw(im)
    label='COURTYARD' if world else 'SEATING' if seating else Path(file).stem.replace('_',' ').upper()
    draw.rectangle((0,0,W,35),fill='#293c38');draw.text((15,10),f'{label}  |  '+('HEAD' if head else str(yaw)+' DEG'),fill='white')
    stamp=json.loads((Path(file).parent/'build.json').read_text()).get('build','') if (Path(file).parent/'build.json').exists() else ''
    draw.rectangle((0,H-28,W,H),fill='#293c38');draw.text((15,H-20),stamp+' | OFFLINE GEOMETRY REVIEW - not a WebGL screenshot',fill='white')
    return im

if __name__=='__main__':
    folder=Path(sys.argv[1]);dest=Path(sys.argv[2]);dest.mkdir(exist_ok=True,parents=True)
    for base in ['base_a','base_b']:
        for yaw in [0,90,180,35]:render(folder/(base+'.json'),yaw).save(dest/f'{base}-{yaw}.png')
        render(folder/(base+'.json'),15,head=True).save(dest/f'{base}-head.png')
    if (folder/'seating.json').exists():render(folder/'seating.json',25,seating=True,size=(1000,850)).save(dest/'seating.png')
    for file in folder.glob('hair_*.json'):
        render(file,25,head=True).save(dest/(file.stem+'.png'))
    for file in folder.glob('outfit_*.json'):
        render(file,25).save(dest/(file.stem+'.png'))
    if (folder/'world.json').exists():render(folder/'world.json',26,world=True,size=(1500,1000)).save(dest/'courtyard.png')
    print(dest)

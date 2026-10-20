"""Supply signed coverage fields for bottom garments and shoes.

The runtime intersects exposed skin with every worn garment's opening in one
operation. A patch restored by a shirt can no longer pierce the shorts.
"""
import importlib.util,json
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('io',ROOT/'tools/build-starter-v30.py');io=importlib.util.module_from_spec(s);s.loader.exec_module(io)
body=json.loads((ROOT/'dist/assets/characters/efe.gltf.json').read_text());prims=body['meshes'][0]['primitives'];P=io.read_accessor(body,prims[0]['attributes']['POSITION'])
allowed=np.zeros(len(P),bool)
for i in [1,6,7,8,9]:allowed[np.unique(io.read_accessor(body,prims[i]['indices']))]=True
for name in ['tank','tee','office_shirt','track_top','lounge_top','shorts','office_trousers','cargo_trousers','sneakers']:
 path=ROOT/'dist/assets/wardrobe'/f'{name}.gltf.json';d=json.loads(path.read_text());ex=d['nodes'][0]['extras']
 if name in ['tank','tee','office_shirt','track_top','lounge_top']:
  values=np.array(ex['coverage32']);cage=1
 elif name=='sneakers':values=.127-P[:,1];ex['covers']={};cage=3
 else:
  cage=2
  values=np.minimum(P[:,1]-(.665 if name=='shorts' else .10),1.10-P[:,1])
 if cage!=1:values=np.where(allowed,values,-1)
 for mesh in d['meshes']:
  for prim in mesh['primitives']:
   n=d['accessors'][prim['attributes']['POSITION']]['count']
   if '_CAGE32' not in prim['attributes']:prim['attributes']['_CAGE32']=io.append_accessor(d,np.full((n,1),cage),'SCALAR',5126)
 ex['coverage32']=np.round(values,6).tolist();ex['visualRevision']=32
 path.write_text(json.dumps(d,separators=(',',':')))
 print(name,'composable coverage')

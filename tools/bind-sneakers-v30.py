"""Bind the existing starter sneaker shells to the foot surface, avoiding v29's push-out pass."""
import json
from pathlib import Path
from importlib.machinery import SourceFileLoader
import numpy as np
from scipy.spatial import cKDTree

b=SourceFileLoader('starter',str(Path(__file__).with_name('build-starter-v30.py'))).load_module()
body=json.loads((b.ASSETS/'characters/efe.gltf.json').read_text())
P=b.read_accessor(body,body['meshes'][0]['primitives'][0]['attributes']['POSITION'])
path=b.ASSETS/'wardrobe/sneakers.gltf.json'
doc=json.loads(path.read_text())
for mesh in doc['meshes']:
    for prim in mesh['primitives']:
        if '_BODY_IDS' in prim['attributes']:continue
        points=b.read_accessor(doc,prim['attributes']['POSITION'])
        region=8 if np.mean(points[:,0])>0 else 9
        ids=np.unique(b.read_accessor(body,body['meshes'][0]['primitives'][region]['indices']))
        dist,nearest=cKDTree(P[ids]).query(points,k=3)
        weights=1/np.maximum(dist,.0001)**2;weights/=weights.sum(axis=1,keepdims=True)
        prim['attributes']['_BODY_IDS']=b.append_accessor(doc,ids[nearest],'VEC3',5126)
        prim['attributes']['_BODY_WEIGHTS']=b.append_accessor(doc,weights,'VEC3',5126)
for n in doc['nodes']:
    if n.get('extras',{}).get('asset')=='sneakers':n['extras']['refit']='body-barycentric-v30';n['extras']['visualRevision']=30
path.write_text(json.dumps(doc,separators=(',',':')))
print('Sneaker surface bindings written.')

#!/usr/bin/env python3
"""Non-destructive glTF hair-candidate audit; never writes geometry.
Requires numpy, Pillow, scipy. Run:
  python tools/guard_hair_uv_v58.py candidate.glb --report hair-audit.json
"""
import argparse,io,json,struct
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components

DT={5121:np.uint8,5123:np.uint16,5125:np.uint32,5126:np.float32}
SZ={'VEC2':2,'VEC3':3,'VEC4':4,'SCALAR':1}

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('glb',type=Path)
    ap.add_argument('--report',type=Path)
    args=ap.parse_args()
    raw=args.glb.read_bytes()
    assert raw[:4]==b'glTF'
    n,typ=struct.unpack_from('<II',raw,12);assert typ==0x4e4f534a
    obj=json.loads(raw[20:20+n])
    ln,typ=struct.unpack_from('<II',raw,20+n);assert typ==0x004e4942
    binary=raw[28+n:28+n+ln]
    def accessor(index):
        a=obj['accessors'][index];view=obj['bufferViews'][a['bufferView']]
        dtype=np.dtype(DT[a['componentType']]);cols=SZ[a['type']]
        return np.ndarray((a['count'],cols),dtype=dtype,buffer=binary,
            offset=view.get('byteOffset',0)+a.get('byteOffset',0),
            strides=(view.get('byteStride',cols*dtype.itemsize),dtype.itemsize)).copy()
    mesh=obj['meshes'][0]
    prim=mesh['primitives'][0]
    xyz=accessor(prim['attributes']['POSITION'])
    uv=accessor(prim['attributes']['TEXCOORD_0'])
    faces=np.concatenate([accessor(p['indices']).ravel().reshape(-1,3) for p in mesh['primitives']])
    material=obj['materials'][prim['material']]
    texture_index=material['pbrMetallicRoughness']['baseColorTexture']['index']
    image_index=obj['textures'][texture_index]['source']
    image_entry=obj['images'][image_index]
    view=obj['bufferViews'][image_entry['bufferView']]
    pixels=np.asarray(Image.open(io.BytesIO(binary[view.get('byteOffset',0):view.get('byteOffset',0)+view['byteLength']])).convert('RGB'))
    height,width=pixels.shape[:2]
    # glTF 2.0 and Pillow image coordinates BOTH have upper-left origin. No V flip.
    tx=np.clip(np.rint(uv[:,0]*(width-1)).astype(int),0,width-1)
    ty=np.clip(np.rint(uv[:,1]*(height-1)).astype(int),0,height-1)
    rgb=pixels[ty,tx]
    edges=np.concatenate((faces[:,[0,1]],faces[:,[1,2]],faces[:,[2,0]]))
    graph=coo_matrix((np.ones(len(edges),np.uint8),(edges[:,0],edges[:,1])),shape=(len(xyz),len(xyz))).tocsr()
    _,labels=connected_components(graph,directed=False)
    counts=np.bincount(labels)
    candidates=[];blocked=[]
    for component in np.where((counts>=85)&(counts<=1700))[0]:
        ids=np.where(labels==component)[0]
        points=xyz[ids]
        low=points.min(axis=0);high=points.max(axis=0)
        if low[1]<1.27 or high[1]<1.5 or high[1]-low[1]<.10:continue
        dark_fraction=float(np.mean(np.max(rgb[ids],axis=1)<65))
        overlaps_face=bool(np.any((np.abs(points[:,0])<.10)&(points[:,1]>1.47)&(points[:,1]<1.69)&(points[:,2]>.04)))
        row={'component':int(component),'vertices':len(ids),'dark_fraction':round(dark_fraction,3),'overlaps_face':overlaps_face}
        if overlaps_face:blocked.append(row)
        elif dark_fraction>.66:candidates.append(row)
    report={'source':args.glb.name,'geometry_edited':False,'uv_origin':'top-left / no V flip','possible_hair_only':candidates,'blocked_face_overlap':blocked,
        'warning':'Do not auto-edit candidates. Require front, 3/4 and profile visual approval.'}
    output=json.dumps(report,indent=2)+'\n'
    if args.report:args.report.write_text(output)
    print(output,end='')
if __name__=='__main__':main()

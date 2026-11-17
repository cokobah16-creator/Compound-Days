#!/usr/bin/env python3
"""Review-only V69 repair: compact the right underarm patch and remap its UV
onto an adjacent bright shirt chart. Preserves every source position, normal,
joint, weight, animation and skeleton. NEVER overwrites input GLB.
Usage: python3 tools/player1_v69_seam.py input.glb output.glb metrics.json
"""
import hashlib, io, json, struct, sys
from pathlib import Path
import numpy as np
from PIL import Image

DT={5121:'u1',5123:'<u2',5125:'<u4',5126:'<f4'}
COL={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def unpack(p):
 raw=Path(p).read_bytes()
 assert raw[:4]==b'glTF' and struct.unpack_from('<I',raw,4)[0]==2
 ln,t=struct.unpack_from('<II',raw,12);assert t==0x4E4F534A
 j=json.loads(raw[20:20+ln]);o=20+ln;n,t=struct.unpack_from('<II',raw,o);assert t==0x004E4942
 return j,raw[o+8:o+8+n],hashlib.sha256(raw).hexdigest()
def acc(j,b,i):
 a=j['accessors'][i];v=j['bufferViews'][a['bufferView']]
 d=np.dtype(DT[a['componentType']]);n=COL[a['type']]
 off=v.get('byteOffset',0)+a.get('byteOffset',0);step=v.get('byteStride',d.itemsize*n)
 if step==d.itemsize*n:return np.frombuffer(b,dtype=d,count=a['count']*n,offset=off).reshape(-1,n)
 return np.ndarray((a['count'],n),dtype=d,buffer=b,offset=off,strides=(step,d.itemsize))
def rgb(image,uv):
 im=np.asarray(image.convert('RGB'));h,w=im.shape[:2]
 x=np.clip((uv[:,0]*w).astype(int),0,w-1)
 y=np.clip(((1-uv[:,1])*h).astype(int),0,h-1)
 return im[y,x]
def repair(src,dst,report):
 j,original,sha=unpack(src)
 assert len(j['meshes'])==1 and len(j['skins'])==1
 ps=j['meshes'][0]['primitives'];mats=j['materials']
 top=[(k,p) for k,p in enumerate(ps) if mats[p['material']]['name']=='top']
 assert len(top)==2,'V61 top + patch expected'
 main_i,main_p=max(top,key=lambda kp:acc(j,original,kp[1]['indices']).size)
 patch_i,patch_p=min(top,key=lambda kp:acc(j,original,kp[1]['indices']).size)
 indices=acc(j,original,patch_p['indices']).ravel().astype(np.int64)
 assert len(indices)==435,'V61 145-triangle patch was changed; stop'
 main_idx=acc(j,original,main_p['indices']).ravel().astype(np.int64)
 all_pos=acc(j,original,main_p['attributes']['POSITION']).astype(np.float32)
 all_uv=acc(j,original,main_p['attributes']['TEXCOORD_0']).astype(np.float32)
 unique=np.unique(indices);top_vertices=np.unique(main_idx)
 pbr=mats[main_p['material']]['pbrMetallicRoughness']
 image_index=j['textures'][pbr['baseColorTexture']['index']]['source']
 view=j['bufferViews'][j['images'][image_index]['bufferView']]
 atlas=Image.open(io.BytesIO(original[view.get('byteOffset',0):view.get('byteOffset',0)+view['byteLength']]))
 near_chart=(all_uv[top_vertices,0]>=.55)&(all_uv[top_vertices,0]<=.68)&(all_uv[top_vertices,1]>=.63)&(all_uv[top_vertices,1]<=.72)
 near_chart &= (rgb(atlas,all_uv[top_vertices]).min(axis=1)>=185)
 chart=top_vertices[near_chart]
 assert len(chart)>=100,'Missing expected local light-shirt UV island'
 patch_uv=[];distances=[]
 xyz=all_pos[chart]
 for vertex in unique:
  d=np.einsum('ij,ij->i',xyz-all_pos[vertex],xyz-all_pos[vertex])
  k=int(np.argmin(d));patch_uv.append(all_uv[chart[k]]);distances.append(float(d[k]**.5))
 assert max(distances)<.04,'Patch too far from shirt; requires artist intervention'
 patch_uv=np.asarray(patch_uv,dtype='<f4')
 repaired_rgb=rgb(atlas,patch_uv)
 assert (repaired_rgb.min(axis=1)>=180).all(),'Patch landed on dark/different atlas material'
 blob=bytearray(original)
 def add(data,component,kind,target):
  payload=np.ascontiguousarray(data).tobytes()
  while len(blob)%4:blob.append(0)
  j['bufferViews'].append({'buffer':0,'byteOffset':len(blob),'byteLength':len(payload),'target':target})
  blob.extend(payload)
  j['accessors'].append({'bufferView':len(j['bufferViews'])-1,'componentType':component,
                         'type':kind,'count':len(data)})
  return len(j['accessors'])-1
 new_attrs={}
 for key,aid in patch_p['attributes'].items():
  info=j['accessors'][aid];arr=acc(j,original,aid)
  vals=patch_uv if key=='TEXCOORD_0' else arr[unique].copy()
  new_attrs[key]=add(vals,info['componentType'],info['type'],34962)
  if key=='POSITION':
   j['accessors'][new_attrs[key]]['min']=vals.min(axis=0).tolist()
   j['accessors'][new_attrs[key]]['max']=vals.max(axis=0).tolist()
  if info.get('normalized'):j['accessors'][new_attrs[key]]['normalized']=True
 patch_p['attributes']=new_attrs
 patch_p['indices']=add(np.searchsorted(unique,indices).astype('<u2'),5123,'SCALAR',34963)
 patch_p['material']=main_p['material']
 patch_p['extras']={'v69PatchReview':'right-underarm-light-shirt-atlas'}
 while len(blob)%4:blob.append(0)
 j['buffers'][0]['byteLength']=len(blob)
 js=json.dumps(j,separators=(',',':')).encode()
 while len(js)%4:js+=b' '
 glb=b'glTF'+struct.pack('<II',2,12+8+len(js)+8+len(blob))+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(blob),0x004E4942)+blob
 Path(dst).parent.mkdir(parents=True,exist_ok=True);Path(dst).write_bytes(glb)
 test,b,_=unpack(dst)
 assert [a['name'] for a in test['animations']]==[a['name'] for a in j['animations']]
 assert test['skins']==j['skins']
 evidence={'status':'REVIEW-ONLY','original_bytes':Path(src).stat().st_size,'repaired_bytes':len(glb),
   'source_sha256':sha,'candidate_sha256':hashlib.sha256(glb).hexdigest(),
   'patch_index':patch_i,'patch_triangles':145,'patch_vertices':len(unique),
   'median_distance_m':float(np.median(distances)),'max_distance_m':max(distances),
   'original_rgb_median':np.median(rgb(atlas,all_uv[unique]),axis=0).tolist(),
   'repaired_rgb_median':np.median(repaired_rgb,axis=0).tolist(),
   'clips':[a['name'] for a in test['animations']],'joints':len(test['skins'][0]['joints']),
   'unchanged':['all original positions','all normals','all bone weights','all joint positions','all animation curves','triangle counts'],
   'not_fixed':['hand anatomy','shirt-topology seam continuity','braids','facial expressions'],
   'production_deployed':False}
 Path(report).parent.mkdir(parents=True,exist_ok=True)
 Path(report).write_text(json.dumps(evidence,indent=2)+'\n')
 print(json.dumps(evidence,indent=2))
if __name__=='__main__':
 if len(sys.argv)!=4:raise SystemExit('Input, output and JSON report required')
 repair(*sys.argv[1:])

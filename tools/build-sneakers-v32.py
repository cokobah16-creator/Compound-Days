"""A continuous sneaker last, rolled sole, ankle collar and raised lace bars."""
import copy,importlib.util,json
from pathlib import Path
import numpy as np
from scipy.spatial import cKDTree
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('io32',ROOT/'tools/build-starter-v30.py');io=importlib.util.module_from_spec(spec);spec.loader.exec_module(io)
body=json.loads((ROOT/'dist/assets/characters/efe.gltf.json').read_text());prim=body['meshes'][0]['primitives'][0];neutral=io.read_accessor(body,prim['attributes']['POSITION'])
d=copy.deepcopy(body);d.pop('animations',None);keep=set(d['skins'][0]['joints'])|{0}
for node in d['nodes']:
 node['children']=[n for n in node.get('children',[]) if n in keep];node.pop('mesh',None);node.pop('skin',None)
d['nodes']=d['nodes'][:max(keep)+1];d['nodes'][0]['name']='sneakers32';d['nodes'][0]['extras']={'asset':'sneakers','kind':'feet','slots':['feet'],'visualRevision':32,'refit':'body-barycentric-v30','covers':{'footL':1,'footR':1}}
inv=io.read_accessor(body,body['skins'][0]['inverseBindMatrices']);d['buffers']=[];d['bufferViews']=[];d['accessors']=[];d['skins'][0]['inverseBindMatrices']=io.append_accessor(d,inv,'MAT4',5126)
d['materials']=[{'name':name,'pbrMetallicRoughness':{'baseColorFactor':[c,c,c,1],'metallicFactor':0,'roughnessFactor':rough}} for name,c,rough in [('shoe',.9,.8),('sole',.7,.94),('shoe_stitch',.78,.9)]]
prims=[]
def emit(P,F,material,side):
 P=np.array(P,float);F=np.array(F,int);N=np.zeros_like(P);n=np.cross(P[F[:,1]]-P[F[:,0]],P[F[:,2]]-P[F[:,0]])
 for k in range(3):np.add.at(N,F[:,k],n)
 if np.sum(N[:,0]*(P[:,0]-side*.097)+N[:,2]*(P[:,2]-.025))<0:F=F[:,[0,2,1]];N=-N
 N/=np.maximum(np.linalg.norm(N,axis=1,keepdims=True),1e-9)
 foot=19 if side>0 else 24;toe=foot+1;t=np.clip((P[:,2]-.065)/.115,0,1)*.6;J=np.column_stack([np.full(len(P),foot),np.full(len(P),toe),np.zeros(len(P)),np.zeros(len(P))]);W=np.column_stack([1-t,t,np.zeros(len(P)),np.zeros(len(P))])
 region=8 if side>0 else 9;body_ids=np.unique(io.read_accessor(body,body['meshes'][0]['primitives'][region]['indices']));dist,ids=cKDTree(neutral[body_ids]).query(P,k=3);bw=1/np.maximum(dist,.0001)**2;bw/=bw.sum(axis=1,keepdims=True)
 attrs={}
 for name,a,kind,component in [('POSITION',P,'VEC3',5126),('NORMAL',N,'VEC3',5126),('JOINTS_0',J,'VEC4',5123),('WEIGHTS_0',W,'VEC4',5126),('_BODY_IDS',body_ids[ids],'VEC3',5126),('_BODY_WEIGHTS',bw,'VEC3',5126)]:attrs[name]=io.append_accessor(d,a,kind,component)
 prims.append({'attributes':attrs,'indices':io.append_accessor(d,F.reshape(-1,1),'SCALAR',5125),'material':material})
def loft(profile,side,material):
 P=[];F=[];cols=64
 for y,rx,rz,zc in profile:
  for i in range(cols):
   a=i/cols*2*np.pi;P.append([side*.097+rx*np.sin(a),y,zc+rz*np.cos(a)])
 for row in range(len(profile)-1):
  for i in range(cols):
   a=row*cols+i;b=row*cols+(i+1)%cols;c=a+cols;e=b+cols;F.extend([[a,b,c],[b,e,c]])
 if material==1:
  centre=len(P);P.append([side*.097,profile[0][0],profile[0][3]])
  for i in range(cols):F.append([centre,(i+1)%cols,i])
 emit(P,F,material,side)
for side in [1,-1]:
 loft([(.002,.050,.126,.045),(.008,.060,.139,.045),(.028,.062,.142,.045),(.038,.059,.139,.045)],side,1)
 loft([(.034,.058,.138,.045),(.045,.060,.139,.045),(.063,.057,.126,.034),(.083,.050,.098,.004),(.103,.044,.067,-.021),(.124,.039,.044,-.030),(.128,.038,.043,-.030),(.124,.033,.037,-.030),(.113,.032,.036,-.030)],side,0)
 # Shallow tongue and lace bars are surfaces above the sloping vamp.
 P=[];F=[]
 for k in range(4):
  z=.011+k*.017;y=.117-k*.007;start=len(P)
  P.extend([[side*.097-.027,y,z-.0018],[side*.097+.027,y,z-.0018],[side*.097+.027,y+.002,z+.0018],[side*.097-.027,y+.002,z+.0018]])
  F.extend([[start,start+1,start+2],[start,start+2,start+3]])
 emit(P,F,2,side)
d['meshes']=[{'name':'sneakers32','primitives':prims}];node=len(d['nodes']);d['nodes'].append({'name':'sneakers32','mesh':0,'skin':0});d['nodes'][0]['children'].append(node)
(ROOT/'dist/assets/wardrobe/sneakers.gltf.json').write_text(json.dumps(d,separators=(',',':')))
print('Sneakers: continuous upper/collar, two soles, eight lace bars; 2960 triangles')

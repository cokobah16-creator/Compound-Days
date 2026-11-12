"""Convert the V61 fitting GLB into a game hero asset: metre-scale nodes and inverse binds,
albedo-only materials, no underlay, no morph targets, no tangents, eight clips."""
import json,struct,sys,hashlib
import numpy as np
src,dst=sys.argv[1],sys.argv[2]
raw=open(src,'rb').read();ln=struct.unpack_from('<I',raw,12)[0];g=json.loads(raw[20:20+ln]);bl=struct.unpack_from('<I',raw,20+ln)[0];bin_=raw[28+ln:28+ln+bl]
acc=g['accessors'];bvs=g['bufferViews']
CS={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def tight(i):
    a=acc[i];v=bvs[a['bufferView']];sz=CS[a['componentType']]*NC[a['type']];off=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',sz)
    if stride==sz:return bytes(bin_[off:off+a['count']*sz])
    out=bytearray()
    for k in range(a['count']):out+=bin_[off+k*stride:off+k*stride+sz]
    return bytes(out)
chunks=[];views=[];newacc=[];accmap={}
def add_view(data,target=None):
    while len(b''.join(chunks))%4:chunks.append(b'\0')
    off=sum(len(c) for c in chunks);chunks.append(data);v={'buffer':0,'byteOffset':off,'byteLength':len(data)}
    if target:v['target']=target
    views.append(v);return len(views)-1
def add_acc(i,data=None,target=None,scale_rows=None,minmax=None):
    key=(i,scale_rows is not None)
    if key in accmap:return accmap[key]
    a=acc[i];d=data if data is not None else tight(i)
    na={'bufferView':add_view(d,target),'byteOffset':0,'componentType':a['componentType'],'count':a['count'],'type':a['type']}
    if a.get('normalized'):na['normalized']=True
    if minmax is not None:na['min'],na['max']=minmax
    elif 'min' in a:na['min']=a['min'];na['max']=a['max']
    newacc.append(na);accmap[key]=len(newacc)-1;return accmap[key]
mesh=g['meshes'][0];mats=g['materials']
keep=[i for i,p in enumerate(mesh['primitives']) if mats[p['material']]['name']!='skin_underlay']
# materials: albedo only
tex_img=None;newmats=[];matmap={}
for p in mesh['primitives']:
    mi=p['material']
    if mi in matmap or mats[mi]['name']=='skin_underlay':continue
    m=mats[mi];pbr=m.get('pbrMetallicRoughness',{});nm={'name':m['name'],'doubleSided':bool(m.get('doubleSided',False))}
    npbr={}
    if 'baseColorFactor' in pbr:npbr['baseColorFactor']=pbr['baseColorFactor']
    if 'baseColorTexture' in pbr:
        src_img=g['textures'][pbr['baseColorTexture']['index']]['source']
        if tex_img is None:tex_img=src_img
        assert src_img==tex_img,'more than one albedo image'
        npbr['baseColorTexture']={'index':0}
    npbr['metallicFactor']=pbr.get('metallicFactor',0.0);npbr['roughnessFactor']=pbr.get('roughnessFactor',0.9)
    nm['pbrMetallicRoughness']=npbr
    if 'alphaMode' in m:nm['alphaMode']=m['alphaMode']
    newmats.append(nm);matmap[mi]=len(newmats)-1
# primitives
prims=[]
for i in keep:
    p=mesh['primitives'][i];attrs={}
    for k,v in p['attributes'].items():
        if k=='TANGENT':continue
        attrs[k]=add_acc(v,target=34962)
    prims.append({'attributes':attrs,'indices':add_acc(p['indices'],target=34963),'material':matmap[p['material']],'mode':p.get('mode',4)})
# nodes: metre scale
nodes=json.loads(json.dumps(g['nodes']))
root=[i for i,n in enumerate(nodes) if 'scale' in n and abs(n['scale'][0]-0.01)<1e-6]
assert len(root)==1,'expected one 0.01 root';ri=root[0];sc=nodes[ri]['scale'][0]
nodes[ri].pop('scale');nodes[ri]['name']='Player1'
meshnode=[i for i,n in enumerate(nodes) if 'mesh' in n][0]
for i,n in enumerate(nodes):
    if i in(ri,meshnode):continue
    if 'translation' in n:n['translation']=[float(x)*sc for x in n['translation']]
    if 'scale' in n and max(abs(x-1) for x in n['scale'])<1e-3:n.pop('scale')
    n.pop('extras',None)
nodes[meshnode]['name']='Body'
# inverse binds: S(0.01) * IBM  (rows 0..2 of every column scaled)
skin=g['skins'][0];ibm=np.frombuffer(tight(skin['inverseBindMatrices']),dtype='<f4').reshape(-1,16).copy()
for c in range(4):
    for r in range(3):ibm[:,c*4+r]*=sc
ibm_acc=add_acc(skin['inverseBindMatrices'],data=ibm.astype('<f4').tobytes(),scale_rows=True)
newskin={'joints':skin['joints'],'inverseBindMatrices':ibm_acc}
if 'skeleton' in skin:newskin['skeleton']=skin['skeleton']
# animations: drop Run, scale translation outputs
anims=[]
for a in g['animations']:
    if a['name'].lower()=='run':continue
    samplers=[];chans=[]
    paths={}
    for ch in a['channels']:paths[ch['sampler']]=ch['target']['path']
    for si,s in enumerate(a['samplers']):
        inp=add_acc(s['input'])
        if paths.get(si)=='translation':
            arr=np.frombuffer(tight(s['output']),dtype='<f4').reshape(-1,3)*sc
            out=add_acc(s['output'],data=arr.astype('<f4').tobytes(),scale_rows=True,minmax=(arr.min(0).tolist(),arr.max(0).tolist()) if 'min' in acc[s['output']] else None)
        else:out=add_acc(s['output'])
        samplers.append({'input':inp,'output':out,'interpolation':s.get('interpolation','LINEAR')})
    for ch in a['channels']:chans.append({'sampler':ch['sampler'],'target':{'node':ch['target']['node'],'path':ch['target']['path']}})
    anims.append({'name':a['name'],'samplers':samplers,'channels':chans})
# image
img=g['images'][tex_img];imgdata=bytes(bin_[bvs[img['bufferView']]['byteOffset']:bvs[img['bufferView']]['byteOffset']+bvs[img['bufferView']]['byteLength']])
images=[{'mimeType':img['mimeType'],'bufferView':add_view(imgdata),'name':'albedo'}]
textures=[{'source':0,'sampler':0}];samplers=[{'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}]
# head centre from the skin primitive
pos=np.frombuffer(tight(mesh['primitives'][0]['attributes']['POSITION']),dtype='<f4').reshape(-1,3)
skin_idx=np.unique(np.frombuffer(tight(mesh['primitives'][0]['indices']),dtype='<u4' if acc[mesh['primitives'][0]['indices']]['componentType']==5125 else '<u2'))
head=pos[skin_idx];head=head[head[:,1]>=1.45]
hc=[float(head[:,0].mean()),float((head[:,1].min()+head[:,1].max())/2),float(head[:,2].mean())]
nodes[ri]['extras']={'headCentre':[round(x,4) for x in hc],'hairMount':{'x':0,'y':round(hc[1]-float([n for n in nodes if n.get('name')=='Head'][0]['translation'][1])*0,4),'z':0,'scale':0.43,'headR':0.3},'version':61,'visualRevision':'v61','source':'Player1_V61_BLUE_FITTING_MOBILE.glb','sourceSha256':hashlib.sha256(raw).hexdigest()}
out={'asset':{'version':'2.0','generator':'Compound Days v61 hero converter (metre nodes, albedo only, no underlay, no morphs)'},
 'scene':0,'scenes':[{'nodes':[ri]}],'nodes':nodes,'meshes':[{'name':'Body','primitives':prims}],'materials':newmats,'skins':[newskin],'animations':anims,
 'images':images,'textures':textures,'samplers':samplers,'accessors':newacc,'bufferViews':views,'buffers':[{'byteLength':0}]}
binout=b''.join(chunks)
while len(binout)%4:binout+=b'\0'
out['buffers'][0]['byteLength']=len(binout)
js=json.dumps(out,separators=(',',':')).encode()
while len(js)%4:js+=b' '
glb=b'glTF'+struct.pack('<II',2,12+8+len(js)+8+len(binout))+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(binout),0x004E4942)+binout
open(dst,'wb').write(glb)
print(json.dumps({'bytes':len(glb),'prims':[(newmats[p['material']]['name'],newacc[p['indices']]['count']//3) for p in prims],'clips':[a['name'] for a in anims],'headCentre':nodes[ri]['extras']['headCentre'],'image_bytes':len(imgdata),'root':nodes[ri]['name'],'hips_translation':[n for n in nodes if n.get('name')=='Hips'][0]['translation'],'ibm0':np.round(ibm[0],4).tolist()}))

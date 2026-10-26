"""Sewn torso panels, shoulder bridges and lofted sleeves on a declared fit rest.

The old surface-shell method reproduced every body bulge in the fabric. These
tops have their own topology and use a fitted-body rest offset for shape transfer.
"""
import base64,copy,importlib.util,json,subprocess
from collections import deque
from pathlib import Path
import numpy as np
from scipy.spatial import cKDTree
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('garment_io',ROOT/'tools/build-starter-v30.py')
io=importlib.util.module_from_spec(spec);spec.loader.exec_module(io)

def smooth(a,b,x):
    t=np.clip((x-a)/(b-a),0,1);return t*t*(3-2*t)

def export_fit():
    filename=ROOT/'check/geometry31/fit-rest.json';filename.parent.mkdir(exist_ok=True,parents=True)
    code="const fs=require('fs'),h=require('./check/runtime-harness.cjs');h.load().then(({run})=>{const g=run(\"makeHeroAvatar(Object.assign({},lookFor(0),{bodyBase:'base_b',bodyBuild:'balanced',face:'oval',hair:'none',outfit:'starter',acc:[],beard:'none'}))\");fs.writeFileSync(process.argv[1],JSON.stringify(Array.from(g.hero.body.geometry.attributes.position.array)));}).catch(e=>{console.error(e);process.exitCode=1});"
    subprocess.run(['node','-e',code,str(filename)],cwd=ROOT,check=True)
    return np.array(json.loads(filename.read_text())).reshape(-1,3)

body=json.loads((ROOT/'public/play/assets/characters/efe.gltf.json').read_text())
primitive=body['meshes'][0]['primitives'][0]
neutral=io.read_accessor(body,primitive['attributes']['POSITION']).astype(float)
fit=export_fit();offset=fit-neutral
faces_body=np.concatenate([io.read_accessor(body,p['indices']).reshape(-1,3) for p in body['meshes'][0]['primitives']])
candidate=np.where((fit[:,1]>.88)&(fit[:,1]<1.53))[0]
tree=cKDTree(fit[candidate])
torso_candidate=candidate[np.abs(fit[candidate,0])<.174]
torso_tree=cKDTree(fit[torso_candidate])
skin_joints=io.read_accessor(body,primitive['attributes']['JOINTS_0'])
skin_weights=io.read_accessor(body,primitive['attributes']['WEIGHTS_0'])
fit_normals=np.zeros_like(fit)
fn=np.cross(fit[faces_body[:,1]]-fit[faces_body[:,0]],fit[faces_body[:,2]]-fit[faces_body[:,0]])
for k in range(3):np.add.at(fit_normals,faces_body[:,k],fn)
fit_normals/=np.maximum(np.linalg.norm(fit_normals,axis=1,keepdims=True),1e-9)

def make(name):
    tank=name=='tank';long=name in ('office_shirt','track_top','lounge_top')
    P=[];F=[];cols=72;rows=26
    profile=np.array([[1.035,.151,.105,.103],[1.12,.157,.104,.102],[1.26,.178,.114,.106],[1.36,.187,.115,.101],[1.43,.179,.100,.087],[1.50,.154,.075,.070]])
    if tank:profile[2:5,1]-=.008;profile[2:5,2:]-=.005
    def section(y):
        return np.array([np.interp(y,profile[:,0],profile[:,i]) for i in range(1,4)])
    def top(theta):
        s=abs(np.sin(theta));front=np.cos(theta)>=0
        nodes=[0,.50,.94,1]
        heights=([1.385,1.465,1.455,1.325] if front else [1.435,1.478,1.465,1.325]) if tank else [1.451 if front else 1.474,1.515,1.503,1.335]
        k=min(2,max(0,np.searchsorted(nodes,s)-1));t=smooth(nodes[k],nodes[k+1],s)
        return heights[k]+(heights[k+1]-heights[k])*t
    rings=[]
    for row in range(rows+1):
        ring=[]
        for i in range(cols):
            a=i/cols*2*np.pi;y=1.035+(top(a)-1.035)*row/rows;w,front,back=section(y)
            ring.append(len(P));P.append([w*np.sin(a),y,(front if np.cos(a)>=0 else back)*np.cos(a)])
        rings.append(ring)
    def connect(a,b):
        for i in range(len(a)-1):F.extend([[a[i],a[i+1],b[i]],[a[i+1],b[i+1],b[i]]])
    for a,b in zip(rings,rings[1:]):connect(a+[a[0]],b+[b[0]])
    # Connect front/back shoulder panels, leaving a neckline and two arm openings.
    arm_loops=[];bridge_steps=10
    for sign in [1,-1]:
        js=list(range(6,13)) if sign==1 else list(range(60,67))
        grid=[]
        for j in js:
            front_id=rings[-1][j];back_j=(cols//2-j)%cols;back_id=rings[-1][back_j]
            start=np.array(P[front_id]);end=np.array(P[back_id]);line=[]
            for k in range(bridge_steps+1):
                if k==0:idx=front_id
                elif k==bridge_steps:idx=back_id
                else:
                    v=start+(end-start)*k/bridge_steps;v[1]+=(.024 if tank else .006)*np.sin(k/bridge_steps*np.pi);idx=len(P);P.append(v.tolist())
                line.append(idx)
            grid.append(line)
        for a,b in zip(grid,grid[1:]):connect(a,b)
        # The outer bridge edge and the side arc form the sleeve's inlet loop.
        if sign==1:
            side_arc=[rings[-1][j] for j in range(12,25)]
            loop=side_arc+list(reversed(grid[-1]))[1:-1]
        else:
            side_arc=[rings[-1][j] for j in range(48,61)]
            loop=side_arc+grid[0][1:-1]
        arm_loops.append((sign,loop))
    torso_count=len(P);cap_bindings={}
    if not tank:
        for sign,loop in arm_loops:
            axis=np.array([sign*.048,-.280,-.008]);axis/=np.linalg.norm(axis)
            root=np.array([sign*.185,1.452,-.006]);end=np.array([sign*(.269 if long else .219),.965 if long else 1.255,-.005])
            u=np.array([sign*.986,.169,0]);u/=np.linalg.norm(u);v=np.array([0.,0.,1.])
            centre=np.mean(np.array(P)[loop],axis=0)
            angles=[np.arctan2(P[i][2]-centre[2],(P[i][1]-centre[1])*.8-sign*(P[i][0]-centre[0])*.2) for i in loop]
            previous=loop
            for row in range(1,13 if long else 7):
                t=row/(12 if long else 6);radius=(.058*(1-t)+(.035 if long else .051)*t)
                ring=[]
                for original,a in zip(loop,angles):
                    start=np.array(P[original]);target=end+radius*(np.cos(a)*u+np.sin(a)*v)
                    # The inlet is sewn exactly; the outer sleeve becomes circular.
                    point=start*(1-t)+target*t
                    cap=smooth(centre[1]-.012,centre[1]+.038,start[1])*np.sin(t*np.pi)*(1-t)
                    point[0]+=sign*.035*cap;point[1]+=.090*cap
                    ring.append(len(P));P.append(point.tolist())
                connect(previous+[previous[0]],ring+[ring[0]]);previous=ring
        # Deltoid cap panels share the skin's own skeletal blend, so raised or
        # relaxed shoulders cannot emerge through a sleeve's cap.
        caps={}
        for tri in faces_body:
            q=fit[tri].mean(axis=0)
            if not(1.395<q[1]<1.525 and .135<abs(q[0])<.277):continue
            vv=[]
            for old in tri:
                old=int(old)
                if old not in caps:
                    caps[old]=len(P);cap_bindings[len(P)]=old
                    P.append((fit[old]+fit_normals[old]*.008).tolist())
                vv.append(caps[old])
            F.append(vv)
    P=np.array(P,dtype=float)
    # Normals are oriented radially, then stitched across the shared shoulder seams.
    F=np.array(F,dtype=int)
    edges={}
    for i,tri in enumerate(F):
        for k in range(3):
            a,b=int(tri[k]),int(tri[(k+1)%3]);edges.setdefault(tuple(sorted([a,b])),[]).append((i,a,b))
    adjacency=[[] for _ in F]
    for es in edges.values():
        if len(es)==2:
            a,b=es;adjacency[a[0]].append((b[0],a[1:]==b[1:]));adjacency[b[0]].append((a[0],a[1:]==b[1:]))
    flip={}
    for first in range(len(F)):
        if first in flip:continue
        flip[first]=False;queue=deque([first]);component=[]
        while queue:
            i=queue.popleft();component.append(i)
            for j,same in adjacency[i]:
                if j not in flip:flip[j]=flip[i]^same;queue.append(j)
        for i in component:
            if flip[i]:F[i]=F[i,[0,2,1]]
        cc=P[F[component]].mean(axis=1);nn=np.cross(P[F[component,1]]-P[F[component,0]],P[F[component,2]]-P[F[component,0]])
        if np.sum(nn[:,0]*cc[:,0]+nn[:,2]*cc[:,2])<0:F[component]=F[component][:,[0,2,1]]
    N=np.zeros_like(P)
    normals=np.cross(P[F[:,1]]-P[F[:,0]],P[F[:,2]]-P[F[:,0]])
    for k in range(3):np.add.at(N,F[:,k],normals)
    N/=np.maximum(np.linalg.norm(N,axis=1,keepdims=True),1e-9)
    for v,old in cap_bindings.items():N[v]=fit_normals[old]
    # Bind shape transfer in the new Base B fit rest, rather than adding its sculpt twice.
    dist,ids=tree.query(P,k=3);ids=candidate[ids];W=1/np.maximum(dist,.0001)**2;W/=W.sum(axis=1,keepdims=True)
    td,ti=torso_tree.query(P[:torso_count],k=3);ids[:torso_count]=torso_candidate[ti];tw=1/np.maximum(td,.0001)**2;W[:torso_count]=tw/tw.sum(axis=1,keepdims=True)
    for v,old in cap_bindings.items():ids[v]=[old,old,old];W[v]=[1,0,0]
    fit_rest=(offset[ids]*W[:,:,None]).sum(axis=1)
    J=[];SW=[]
    for x,y,z in P:
        arm=smooth(.140,.195,abs(x))
        if y<1.23 and abs(x)<.20:arm=0
        fore=1-smooth(1.08,1.21,y);sign=x>=0
        spine=3 if y>1.26 else 2 if y>1.14 else 1 if y>1.07 else 0
        J.append([spine,8 if sign else 13,9 if sign else 14,0]);SW.append([1-arm,arm*(1-fore),arm*fore,0])
    for v,old in cap_bindings.items():J[v]=skin_joints[old].tolist();SW[v]=skin_weights[old].tolist()
    # Matching coverage is evaluated in that same fit rest, then split back onto source triangles.
    def inside(p):
        x,y,z=p;a=np.arctan2(x,z);w,f,b=section(y);radial=1-np.hypot(x/w,z/(f if z>=0 else b))
        torso=min(y-1.035,top(a)-y,radial*.10)
        sleeve=-1
        if not tank and abs(x)>.12:
            sign=1 if x>=0 else -1;start=np.array([sign*.170,1.435,0]);end=np.array([sign*(.269 if long else .219),.965 if long else 1.255,-.005]);d=end-start;tt=np.dot(p-start,d)/np.dot(d,d);q=start+np.clip(tt,0,1)*d
            radius=.061*(1-np.clip(tt,0,1))+(.036 if long else .052)*np.clip(tt,0,1)
            sleeve=min(tt*np.linalg.norm(d),(1-tt)*np.linalg.norm(d),radius-np.linalg.norm(p-q))
        lower=min(y-(.665 if tank else .10),1.075-y,.205-abs(x))
        return max(torso,sleeve,lower)
    vals=np.array([inside(p) for p in fit]);hidden=[];reveal=[];reveal_indices=[]
    for tri in faces_body:
        values=vals[tri]
        if values.max()<=0:continue
        hidden.append(tri.tolist())
        if values.min()>=0 or max(fit[tri,1].max(),neutral[tri,1].max())>1.485:continue
        poly=[]
        for k in range(3):
            j=(k+1)%3;b0,b1=np.eye(3)[k],np.eye(3)[j]
            if values[k]<0:poly.append(b0)
            if (values[k]>=0)!=(values[j]>=0):
                lo,hi=0.,1.
                for _ in range(16):
                    t=(lo+hi)/2;f=inside(fit[tri[k]]*(1-t)+fit[tri[j]]*t)
                    if (f>=0)==(values[k]>=0):lo=t
                    else:hi=t
                t=(lo+hi)/2;poly.append(b0*(1-t)+b1*t)
        start=len(reveal);reveal.extend([[tri.tolist(),b.tolist()] for b in poly])
        for j in range(1,len(poly)-1):reveal_indices.extend([start,start+j,start+j+1])
    # Bindings for edges are already complete; add a small dark fabric hem wall.
    edge={}
    for tri in F:
        for k in range(3):
            a,b=map(int,[tri[k],tri[(k+1)%3]]);edge.setdefault(tuple(sorted([a,b])),[]).append((a,b))
    boundary=[v[0] for v in edge.values() if len(v)==1]
    colors=np.ones_like(P);rim={};extra=[]
    for a,b in boundary:
        if a in cap_bindings and b in cap_bindings:continue
        for i in [a,b]:
            if i not in rim:
                rim[i]=len(P);P=np.vstack([P,P[i]-N[i]*.002]);N=np.vstack([N,N[i]]);colors=np.vstack([colors,[.83,.83,.83]]);ids=np.vstack([ids,ids[i]]);W=np.vstack([W,W[i]]);fit_rest=np.vstack([fit_rest,fit_rest[i]]);J.append(J[i][:]);SW.append(SW[i][:])
        extra.extend([[a,rim[b],b],[a,rim[a],rim[b]]])
    F=np.vstack([F,extra])
    # A compact glTF retains just the shared joint hierarchy and this garment.
    d=copy.deepcopy(body);d.pop('animations',None);keep=set(d['skins'][0]['joints'])|{0}
    for node in d['nodes']:
        node['children']=[j for j in node.get('children',[]) if j in keep];node.pop('mesh',None);node.pop('skin',None)
    d['nodes']=d['nodes'][:max(keep)+1];d['nodes'][0]['name']=name+'_sewn31';d['nodes'][0]['extras']={'asset':name,'kind':'garment','slots':['top'],'tint':'top','visualRevision':31,'refit':'fitted-rest-v31','covers':{},'hiddenBodyTriangles':hidden,'revealSkin':{'vertices':reveal,'indices':reveal_indices}}
    inv=io.read_accessor(body,body['skins'][0]['inverseBindMatrices'])
    d['buffers']=[];d['bufferViews']=[];d['accessors']=[]
    d['skins'][0]['inverseBindMatrices']=io.append_accessor(d,inv,'MAT4',5126)
    attrs={'POSITION':io.append_accessor(d,P,'VEC3',5126),'NORMAL':io.append_accessor(d,N,'VEC3',5126),'COLOR_0':io.append_accessor(d,colors,'VEC3',5126),'JOINTS_0':io.append_accessor(d,J,'VEC4',5123),'WEIGHTS_0':io.append_accessor(d,SW,'VEC4',5126),'_BODY_IDS':io.append_accessor(d,ids,'VEC3',5126),'_BODY_WEIGHTS':io.append_accessor(d,W,'VEC3',5126),'_FIT_REST':io.append_accessor(d,fit_rest,'VEC3',5126)}
    index=io.append_accessor(d,F.reshape(-1,1),'SCALAR',5125)
    d['materials']=[{'name':'top','doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':[.8,.75,.65,1],'metallicFactor':0,'roughnessFactor':.94}}]
    d['meshes']=[{'name':name+'_sewn31','primitives':[{'attributes':attrs,'indices':index,'material':0}]}]
    node=len(d['nodes']);d['nodes'].append({'name':name+'_sewn31','mesh':0,'skin':0});d['nodes'][0]['children'].append(node)
    (ROOT/'public/play/assets/wardrobe'/f'{name}.gltf.json').write_text(json.dumps(d,separators=(',',':')))
    return {'asset':name,'vertices':len(P),'triangles':len(F),'hidden':len(hidden)}

if __name__=='__main__':
    import sys
    print(json.dumps([make(n) for n in (sys.argv[1:] or ['tank','tee','office_shirt','track_top','lounge_top'])],indent=2))

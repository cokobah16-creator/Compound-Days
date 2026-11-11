"""Rebuild the hero's head from MakeHuman's CC0 anatomy (v55, "Character rebuild").

Replaces the visible head of dist/assets/characters/efe.gltf.json with one adult anatomical head and neck built from
MakeHuman's official core assets (source/makehuman/, CC0 1.0, pinned to makehuman commit a8bc2d5; the licence files
are kept beside them). The rig, bind pose, clips and the five Body primitives stay as they are.

  1. MakeHuman head: the hm08 base mesh with the African female young macro target and the face recipe below (cheeks,
     jaw, chin, nose, lips, eyes), cut at the base of the neck. Shape keys for the cast and the expression are the
     differences of further targets: masc (African male young), old (African female old), smile, blinkLeft, blinkRight and concerned.
  2. Proportions: the head is scaled to 0.30 m chin to crown (about six heads to the figure instead of 4.3) and the
     neck is lengthened so the chin sits at 1.475 m and the open end of the neck sits inside every collar (radius held
     under 0.058 m below 1.41 m). Nothing is done with the Head joint's scale.
  3. Skinning: one skinned mesh "HeadSkin" (material skin) on the hero skin, weighted Spine2 -> Neck -> Head up the
     neck. Its COLOR_0 paints the lips, the lash line, brow shadow and the nostrils, so the colour passes that tint
     `skin` tint the whole face. The old head and neck pieces of the skin primitive are deleted (and checked gone).
  4. Face parts on the Head joint: MakeHuman's fitted eyes split into eye_white / iris / pupil plus a highlight,
     strand brows (face_brow, material hair), and the lashes (face_lash) and the two beard shells (face_beard_stubble,
     face_beard_boxed) as skinned meshes that carry the same shape keys, so they follow a blink or the masc shape.
  5. Hair and headwear: every wardrobe hair file, the built-in locs/scalp/band and the Head-weighted parts of the
     jewellery files are moved from the old skull to the new one by a per-direction radial map (see refit()), and the
     root extras hairMount/headCentre are measured on the new skull.
  6. The editable Blender scene is written to source/hero_head_v55.blend (head with shape keys, eyes, brows, lashes,
     beards on the rig's armature space) when run with --blend.

Always starts from the pre-v53 hero (git show 61dcd87:dist/assets/characters/efe.gltf.json) for the body, rig and
clips, and deletes its head; tools/faces_from_blender.py (v53) refuses to run over a v55 hero.
Run with Blender's Python module (pip install bpy):  python tools/hero_head.py [--blend]
"""
import sys, os, json, io, math, subprocess, base64, collections, hashlib
from pathlib import Path
import numpy as np
from PIL import Image
import bpy  # noqa: F401  (Blender as a Python module; brings mathutils)
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT=Path(__file__).resolve().parents[1]
MHD=ROOT/'source/makehuman'
DST=ROOT/'dist/assets/characters/efe.gltf.json'
WARD=ROOT/'dist/assets/wardrobe'
WARD_PIN='cb762f9'   # the wardrobe as shipped in v54, before any v55 refit: reruns always start from these files
# except where a later master commit changed a wardrobe file itself: PR #23 lowered the wrap's two knot lobes
WARD_PIN_FILE={'headwrap_everyday.gltf.json':'1786b4c'}

# ============================================================== glTF helpers
def load(path):
    g=json.load(open(path)); buf=base64.b64decode(g['buffers'][0]['uri'].split(',')[1]); return g,buf
def acc(g,buf,i):
    a=g['accessors'][i]; bv=g['bufferViews'][a['bufferView']]
    n={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
    dt={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32,5122:np.int16,5120:np.int8}[a['componentType']]
    o=bv.get('byteOffset',0)+a.get('byteOffset',0); st=bv.get('byteStride'); isz=np.dtype(dt).itemsize
    if st and st!=n*isz:
        return np.frombuffer(buf,dtype=np.uint8,count=st*a['count'],offset=o).reshape(a['count'],st)[:,:n*isz].copy().view(dt).reshape(a['count'],n)
    return np.frombuffer(buf,dtype=dt,count=a['count']*n,offset=o).reshape(a['count'],n).copy()
def qmat(q):
    x,y,z,w=q
    return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def local(n):
    M=np.eye(4)
    if 'matrix' in n: return np.array(n['matrix']).reshape(4,4).T
    S=np.diag(n.get('scale',[1,1,1])); R=qmat(n.get('rotation',[0,0,0,1]))
    M[:3,:3]=R@S; M[:3,3]=n.get('translation',[0,0,0]); return M
def world_mats(g):
    par={}
    for i,n in enumerate(g['nodes']):
        for c in n.get('children',[]): par[c]=i
    W={}
    def wm(i):
        if i in W: return W[i]
        M=local(g['nodes'][i])
        if i in par: M=wm(par[i])@M
        W[i]=M; return M
    for i in range(len(g['nodes'])): wm(i)
    return W,par
def xf(M,P): P=np.asarray(P,float); return (M[:3,:3]@P.T).T+M[:3,3]

CT={np.dtype('float32'):5126,np.dtype('uint16'):5123,np.dtype('uint32'):5125,np.dtype('uint8'):5121}
TYPES={1:'SCALAR',2:'VEC2',3:'VEC3',4:'VEC4',16:'MAT4'}
class Doc:
    """Edits a glTF with one embedded buffer: arrays are decoded lazily, replaced or added, and pack() writes one buffer."""
    def __init__(s,g,buf): s.g=g; s.buf=buf; s.data={}; s.blobs=[]; s.views0=list(g['bufferViews'])
    def get(s,i):
        if s.data.get(i) is None: s.data[i]=acc(s.g,s.buf,i)
        return s.data[i]
    def add(s,arr):
        arr=np.ascontiguousarray(arr)
        if arr.ndim==1: arr=arr.reshape(-1,1)
        s.g['accessors'].append({'componentType':CT[arr.dtype],'count':int(arr.shape[0]),'type':TYPES[arr.shape[1]]})
        i=len(s.g['accessors'])-1; s.data[i]=arr; return i
    def image(s,png):
        s.blobs.append(png); s.g.setdefault('images',[]).append({'mimeType':'image/png','bufferView':('blob',len(s.blobs)-1)}); return len(s.g['images'])-1
    def pack(s):
        g=s.g
        live=sorted({n['mesh'] for n in g['nodes'] if 'mesh' in n}); mm={o:i for i,o in enumerate(live)}
        g['meshes']=[g['meshes'][o] for o in live]
        for n in g['nodes']:
            if 'mesh' in n: n['mesh']=mm[n['mesh']]
        used=set(); idx=set(); vert=set()
        for m in g['meshes']:
            for p in m['primitives']:
                vert|=set(p['attributes'].values()); used|=set(p['attributes'].values())
                if 'indices' in p: used.add(p['indices']); idx.add(p['indices'])
                for t in p.get('targets',[]): used|=set(t.values()); vert|=set(t.values())
        for sk in g.get('skins',[]): used.add(sk['inverseBindMatrices'])
        for an in g.get('animations',[]):
            for sm in an['samplers']: used|={sm['input'],sm['output']}
        order=sorted(used); am={o:i for i,o in enumerate(order)}
        out=io.BytesIO(); views=[]; accs=[]
        for o in order:
            a=dict(g['accessors'][o]); arr=s.get(o)
            if arr.ndim==1: arr=arr.reshape(-1,1)
            dt={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}[a['componentType']]
            arr=np.ascontiguousarray(arr.astype(dt))
            out.write(b'\0'*((-out.tell())%4))
            v={'buffer':0,'byteOffset':out.tell(),'byteLength':arr.nbytes}
            if o in idx: v['target']=34963
            elif o in vert: v['target']=34962
            out.write(arr.tobytes()); views.append(v)
            a.pop('byteOffset',None); a.pop('min',None); a.pop('max',None); a['bufferView']=len(views)-1; a['count']=int(arr.shape[0])
            if o in vert and a['componentType']==5126 and a['type']=='VEC3':
                a['min']=arr.min(0).astype(float).round(6).tolist(); a['max']=arr.max(0).astype(float).round(6).tolist()
            accs.append(a)
        g['accessors']=accs
        for m in g['meshes']:
            for p in m['primitives']:
                for k in p['attributes']: p['attributes'][k]=am[p['attributes'][k]]
                if 'indices' in p: p['indices']=am[p['indices']]
                for t in p.get('targets',[]):
                    for k in t: t[k]=am[t[k]]
        for sk in g.get('skins',[]): sk['inverseBindMatrices']=am[sk['inverseBindMatrices']]
        for an in g.get('animations',[]):
            for sm in an['samplers']: sm['input']=am[sm['input']]; sm['output']=am[sm['output']]
        for im in g.get('images',[]):
            bv=im['bufferView']
            if isinstance(bv,tuple): blob=s.blobs[bv[1]]
            else: ov=s.views0[bv]; blob=s.buf[ov.get('byteOffset',0):ov.get('byteOffset',0)+ov['byteLength']]
            out.write(b'\0'*((-out.tell())%4)); views.append({'buffer':0,'byteOffset':out.tell(),'byteLength':len(blob)}); out.write(blob); im['bufferView']=len(views)-1
        g['bufferViews']=views; data=out.getvalue()
        g['buffers']=[{'byteLength':len(data),'uri':'data:application/octet-stream;base64,'+base64.b64encode(data).decode()}]
        return g

def remove_nodes(g,dead):
    """Delete nodes and renumber every reference (children, scenes, skins, animation targets)."""
    dead=set(dead); keep=[i for i in range(len(g['nodes'])) if i not in dead]; nm={o:i for i,o in enumerate(keep)}
    for i in keep:
        n=g['nodes'][i]
        if 'children' in n: n['children']=[nm[c] for c in n['children'] if c in nm]
    g['nodes']=[g['nodes'][i] for i in keep]
    for sc in g['scenes']: sc['nodes']=[nm[c] for c in sc['nodes'] if c in nm]
    for sk in g.get('skins',[]):
        sk['joints']=[nm[j] for j in sk['joints']]
        if 'skeleton' in sk: sk['skeleton']=nm[sk['skeleton']]
    for an in g.get('animations',[]):
        an['channels']=[c for c in an['channels'] if c['target'].get('node') in nm]
        for c in an['channels']: c['target']['node']=nm[c['target']['node']]
    return nm

# ============================================================== geometry helpers
def sm(a,b,x):
    t=np.clip((np.asarray(x,float)-a)/(b-a),0,1); return t*t*(3-2*t)
def flipF(F): F=np.asarray(F).reshape(-1,3); return F[:,::-1].ravel()
def vnormals(P,F):
    F=np.asarray(F).reshape(-1,3); N=np.zeros_like(P,dtype=float)
    fn=np.cross(P[F[:,1]]-P[F[:,0]],P[F[:,2]]-P[F[:,0]])
    for k in range(3): np.add.at(N,F[:,k],fn)
    return N/np.maximum(np.linalg.norm(N,axis=1,keepdims=True),1e-12)
def weld(P,eps=1e-5):
    key=np.round(np.asarray(P)/eps).astype(np.int64); _,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True); return first,inv.ravel()
def weld_normals(P,F):
    first,inv=weld(P); Pu=np.asarray(P,float)[first]; return vnormals(Pu,inv[np.asarray(F).reshape(-1,3)])[inv]
def tris(Q):
    Q=np.asarray(Q); return np.concatenate([Q[:,[0,1,2]],Q[:,[0,2,3]]]) if Q.shape[1]==4 else Q
class Surf:
    def __init__(s,P,F): s.bvh=BVHTree.FromPolygons([tuple(map(float,p)) for p in P],np.asarray(F).reshape(-1,3).tolist())
    def ray(s,o,d):
        h=s.bvh.ray_cast(Vector(tuple(map(float,o))),Vector(tuple(map(float,d))))
        return (None,None,None) if h[0] is None else (np.array(h[0]),np.array(h[1]),h[3])
    def near(s,p):
        h=s.bvh.find_nearest(Vector(tuple(map(float,p)))); return np.array(h[0]),np.array(h[1]),h[3]
    def z(s,x,y):
        p,n,_=s.ray((x,y,0.6),(0,0,-1)); return (None,None) if p is None else (p[2],n)

# ============================================================== MakeHuman
def load_obj(p):
    V=[];VT=[];F=[];FT=[];G=[];g=None
    for l in open(p):
        if l.startswith('v '): V.append([float(x) for x in l.split()[1:4]])
        elif l.startswith('vt '): VT.append([float(x) for x in l.split()[1:3]])
        elif l.startswith('g '): g=l.split()[1]
        elif l.startswith('f '):
            it=[x.split('/') for x in l.split()[1:]]; F.append([int(a[0])-1 for a in it]); FT.append([int(a[1])-1 if len(a)>1 and a[1] else -1 for a in it]); G.append(g)
    return np.array(V),(np.array(VT) if VT else None),np.array(F),np.array(FT),np.array(G)
_TCACHE={}
def target(name):
    if name not in _TCACHE:
        I=[];D=[]
        for l in open(MHD/'targets'/(name+'.target')):
            if l[0]=='#' or not l.strip(): continue
            a=l.split(); I.append(int(a[0])); D.append([float(a[1]),float(a[2]),float(a[3])])
        _TCACHE[name]=(np.array(I,int),np.array(D))
    return _TCACHE[name]
def morph(V,recipe):
    V=V.copy()
    for name,w in recipe.items():
        if isinstance(w,tuple):          # (weight, asymmetry): the +x side gets weight*(1+a), the -x side weight*(1-a)
            w,a=w; I,D=target(name); k=w*(1+a*np.sign(V[I,0]))[:,None]; np.add.at(V,I,k*D)
        else:
            I,D=target(name); np.add.at(V,I,w*D)
    return V
def mhclo(path,V):
    """MakeHuman proxy fitting: each proxy vertex is a weighted triangle of base vertices plus a scaled offset."""
    sc=[1,1,1]; refs=[]; on=False; ob=None
    for l in open(path):
        a=l.split()
        if not a or a[0].startswith('#'): continue
        if a[0]=='obj_file': ob=a[1]
        elif a[0] in ('x_scale','y_scale','z_scale'):
            k='xyz'.index(a[0][0]); sc[k]=abs(V[int(a[1]),k]-V[int(a[2]),k])/float(a[3])
        elif a[0]=='verts': on=True
        elif on and len(a)>=9: refs.append(([int(x) for x in a[:3]],[float(x) for x in a[3:6]],[float(x) for x in a[6:9]]))
        elif on and len(a)==1: refs.append(([int(a[0])]*3,[1,0,0],[0,0,0]))
    R=np.array([r[0] for r in refs]); Wt=np.array([r[1] for r in refs]); Off=np.array([r[2] for r in refs])
    return (V[R]*Wt[:,:,None]).sum(1)+Off*np.array(sc), ob

# the face recipe (MakeHuman modifier weights): an African woman in her late twenties with a soft, open face
RECIPE={'macrodetails/african-female-young':1.0,
        'head/head-round':0.45,'head/head-fat-incr':0.25,'head/head-scale-vert-decr':0.15,
        'forehead/forehead-scale-vert-decr':0.35,'forehead/forehead-nubian-incr':0.2,
        'cheek/l-cheek-bones-incr':0.25,'cheek/r-cheek-bones-incr':0.25,
        'cheek/l-cheek-volume-incr':0.55,'cheek/r-cheek-volume-incr':0.55,
        'chin/chin-prominent-incr':0.25,'chin/chin-prognathism-incr':0.15,'chin/chin-width-decr':0.10,'chin/chin-height-decr':0.15,
        'eyes/l-eye-scale-incr':0.8,'eyes/r-eye-scale-incr':0.8,
        'eyes/l-eye-trans-out':0.12,'eyes/r-eye-trans-out':0.12,
        'nose/nose-scale-vert-decr':0.25,'nose/nose-scale-horiz-decr':0.12,'nose/nose-point-width-incr':0.2,'nose/nose-volume-decr':0.15,
        'mouth/mouth-upperlip-volume-incr':0.35,'mouth/mouth-lowerlip-volume-incr':0.40,
        'mouth/mouth-cupidsbow-incr':0.4,'mouth/mouth-scale-horiz-incr':0.1,'mouth/mouth-trans-backward':0.30,
        'neck/neck-scale-horiz-decr':0.3,
        # relaxed closed-mouth expression with a mild smile, a little more on the viewer's left (+x), soft relaxed lids
        'expression/mouth-corner-puller':(0.40,0.35),'expression/mouth-compression':0.08,
        'expression/eye-left-slit':0.36,'expression/eye-right-slit':0.36}
SHAPES={'masc':{'macrodetails/african-male-young':1.0,'macrodetails/african-female-young':-1.0},
        'old':{'macrodetails/african-female-old':1.0,'macrodetails/african-female-young':-1.0},
        'smile':{'expression/mouth-corner-puller':0.55,'expression/mouth-elevation':0.15,'expression/eye-left-slit':0.2,'expression/eye-right-slit':0.2},
        # the expression set named in docs/PLAYER1_CHARACTER_ART_V55.md: each eye on its own, and a concerned look
        # (inner brows raised, a little frown at the mouth)
        'blinkLeft':{'expression/eye-left-closure':1.0},'blinkRight':{'expression/eye-right-closure':1.0},
        'concerned':{'expression/eyebrows-left-inner-up':0.8,'expression/eyebrows-right-inner-up':0.8,'expression/mouth-depression':0.3,
                     'expression/mouth-corner-puller':-0.25}}
YCUT=6.05     # MakeHuman height where the neck is cut (below it the shoulders flare)

# ============================================================== placement on the hero
Y_CHIN=1.475; HEAD_H=0.30; Y_NECK_END=1.335; NECK_R=0.056; Z_NECK=0.0
def placer(V):
    """Returns T(P) mapping MakeHuman decimetres to hero bind space for this head shape."""
    front=V[V[:,2]>0.9]; chin=front[:,1].min(); crown=V[:,1].max(); s=HEAD_H/(crown-chin)
    neck=V[(np.abs(V[:,1]-6.2)<0.04)]; zc=(neck[:,2].min()+neck[:,2].max())/2
    yb=YCUT+0.08; extra=Y_CHIN+(yb-chin)*s-Y_NECK_END
    jaw_hi=chin+0.03; jaw_lo=YCUT+0.10
    def T(P):
        P=np.asarray(P,float); x,y,z=P[:,0],P[:,1],P[:,2]
        Y=Y_CHIN+(y-chin)*s-extra*sm(jaw_hi,jaw_lo,y)
        X=x*s; Z=(z-zc)*s+Z_NECK
        # the neck below the jaw is slimmed towards a round collar-sized section
        w=sm(jaw_hi+0.05,jaw_lo,y)
        X=X*(1-0.16*w); Z=Z*(1-0.04*w)
        out=np.stack([X,Y,Z],1)
        # inside every collar: radius at most NECK_R below 1.41 m, blended in over 3 cm
        r=np.hypot(out[:,0],out[:,2]-Z_NECK); lim=NECK_R+0.25*np.clip(out[:,1]-1.41,0,None)
        k=np.where(r>lim,lim/np.maximum(r,1e-9),1.0); k=1-(1-k)*sm(1.44,1.41,out[:,1])
        out[:,0]*=k; out[:,2]=Z_NECK+(out[:,2]-Z_NECK)*k
        return out
    T.s=s; T.chin=chin
    return T

def mh_head():
    V0,VT,F,FT,G=load_obj(MHD/'base.obj')
    V=morph(V0,RECIPE)
    Fb=F[G=='body']; FTb=FT[G=='body']
    sel=(V[Fb][:,:,1]>YCUT).all(1); Q=Fb[sel]; QT=FTb[sel]
    used=np.unique(Q); remap=-np.ones(len(V0),int); remap[used]=np.arange(len(used))
    # one UV per vertex (the skin is untextured; the first corner's UV is kept)
    uv=np.zeros((len(used),2));
    for q,qt in zip(Q,QT):
        for a,b in zip(q,qt): uv[remap[a]]=VT[b]
    # shape keys: the macro differences (masc, old) also change body height and head size, so each is first brought
    # back onto the base head by the similarity that keeps the two eye-ring centres where they are; the eyes, brows and
    # wrap stay put and only the face and skull around them change
    bodyv=np.unique(Fb)
    ringsel=bodyv[(np.abs(V[bodyv,0])>0.15)&(V[bodyv,1]>7.30)&(V[bodyv,1]<7.60)&(V[bodyv,2]>1.0)&(V[bodyv,2]<1.3)]
    def rings(Vx): return np.array([Vx[ringsel[np.sign(V[ringsel,0])==sd]].mean(0) for sd in (-1,1)])
    shapes={}
    for k,r in SHAPES.items():
        Vk=morph(V,r)
        if k in ('masc','old'):
            a=rings(V); b=rings(Vk); sc_=np.linalg.norm(a[1]-a[0])/np.linalg.norm(b[1]-b[0]); Vk=a.mean(0)+(Vk-b.mean(0))*sc_
        shapes[k]=Vk[used]-V[used]
    eyes,eobj=mhclo(MHD/'eyes/high-poly.mhclo',V)
    # MakeHuman's eye targets move the lids but not the eye helpers the eyeballs are fitted to, so each eyeball follows
    # its lid ring here: the ring is measured without and with the eye targets and the ball gets the same move and scale
    Vr=morph(V0,{k:w for k,w in RECIPE.items() if not k.startswith('eyes/')}); eref,_=mhclo(MHD/'eyes/high-poly.mhclo',Vr)
    bodyv=np.unique(Fb)
    for side in (-1,1):
        m=np.sign(eref[:,0])==side; c=(eref[m].min(0)+eref[m].max(0))/2; R=np.linalg.norm(eref[m]-c,axis=1).max()
        ring=bodyv[(np.linalg.norm(Vr[bodyv]-c,axis=1)<1.6*R)&(Vr[bodyv][:,2]>c[2])]
        c0=Vr[ring].mean(0); c1=V[ring].mean(0); k=np.linalg.norm(V[ring]-c1,axis=1).mean()/np.linalg.norm(Vr[ring]-c0,axis=1).mean()
        eyes[m]=c1+(c-c0)*k+(eref[m]-c)*k
    eV,eVT,eF,eFT,_=load_obj(MHD/'eyes'/eobj)
    blink_eyes=None
    return dict(V=V[used],Q=remap[Q],uv=uv,shapes=shapes,ids=used,eyeV=eyes,eyeF=eF,eyeFT=eFT,eyeVT=eVT,Vfull=V)

# ============================================================== build
def build(write_blend=False):
    SRC=ROOT/'tools/.efe-pre-v53.gltf.json'
    SRC.write_bytes(subprocess.check_output(['git','-C',str(ROOT),'show','61dcd87:dist/assets/characters/efe.gltf.json']))
    g,buf=load(SRC); SRC.unlink(); doc=Doc(g,buf); N_=g['nodes']
    sk=g['skins'][0]; JN=[N_[j]['name'] for j in sk['joints']]; jS2,jN,jH=JN.index('Spine2'),JN.index('Neck'),JN.index('Head')
    ibm=acc(g,buf,sk['inverseBindMatrices']); Hinv=ibm[jH].reshape(4,4).T
    HEADY=-Hinv[1,3]                                  # 1.43: bind-space height of the Head joint
    W,par=world_mats(g); hi=[i for i,n in enumerate(N_) if n.get('name')=='Head'][0]
    rest2bind=lambda i,P: xf(np.linalg.inv(W[hi])@W[i],P)+np.array([0,HEADY,0])   # a Head child's rest geometry -> bind space

    # ---- 1. delete the old head and neck pieces from the skin primitive
    body=[n for n in N_ if n.get('name')=='Body'][0]; prim=g['meshes'][body['mesh']]['primitives'][0]; A=prim['attributes']
    P0=doc.get(A['POSITION']).astype(float); F0=doc.get(prim['indices']).reshape(-1,3)
    first,inv=weld(P0); Fw=inv[F0]
    # connected components on the welded mesh
    parent=np.arange(inv.max()+1)
    def find(a):
        while parent[a]!=a: parent[a]=parent[parent[a]]; a=parent[a]
        return a
    for t in Fw:
        for a,b in ((t[0],t[1]),(t[1],t[2])):
            ra,rb=find(a),find(b)
            if ra!=rb: parent[ra]=rb
    comp=np.array([find(i) for i in range(len(parent))]); cy=collections.defaultdict(list)
    for v,c in enumerate(comp): cy[c].append(P0[first[v],1])
    old_head={c for c,ys in cy.items() if min(ys)>1.30}
    deadF=np.isin(comp[Fw[:,0]],list(old_head))
    oldP=P0[np.unique(F0[deadF])]                       # kept for the hair refit (the skull every hair file was made on)
    oldF_=F0[deadF]; keepF=F0[~deadF]; usedv=np.unique(keepF); rm=-np.ones(len(P0),int); rm[usedv]=np.arange(len(usedv))
    for k,a in A.items(): doc.data[a]=doc.get(a)[usedv]
    doc.data[prim['indices']]=rm[keepF].ravel().astype(np.uint16 if len(usedv)<65536 else np.uint32)
    assert (doc.get(A['POSITION'])[:,1]<=1.40).all(), 'old head geometry left in the skin primitive'
    oldSkull=Surf(P0,F0[deadF])

    # ---- 2. the MakeHuman head on the hero
    mh=mh_head(); T=placer(mh['V'])
    P=T(mh['V']); Q=mh['Q']; Ft=tris(Q)
    shp={k:(T(mh['V']+d)-P)*sm(1.36,1.43,P[:,1])[:,None] for k,d in mh['shapes'].items()}
    # weights: Spine2 -> Neck -> Head up the neck
    y=P[:,1]; wH=sm(1.405,1.455,y); wS=1-sm(1.335,1.37,y); wN=np.clip(1-wH-wS,0,1)
    J4=np.zeros((len(P),4),np.uint16); W4=np.zeros((len(P),4),np.float32)
    J4[:,0]=jH; J4[:,1]=jN; J4[:,2]=jS2; W4[:,0]=wH; W4[:,1]=wN; W4[:,2]=wS; W4/=W4.sum(1,keepdims=True)
    Nn=weld_normals(P,Ft)
    S=Surf(P,Ft)
    # landmarks (hero space)
    eyeP=T(mh['eyeV']); L=landmarks(P,mh,T,eyeP)
    eyes=eye_parts(mh,T,eyeP,L)
    lash=lashes(P,Ft,L,shp,J4,W4,eyes); L['lid_margin']=lash['base']
    col=paint(P,Nn,L)
    head_prims=[{'P':P,'N':Nn,'F':Ft,'UV':mh['uv'],'C':col,'J':J4,'W':W4,'T':shp,'mat':'skin'}]

    # ---- 3. face parts
    MAT={}
    for i,m in enumerate(g['materials']): MAT.setdefault(m['name'],i)
    def newmat(name,c,rough=0.64,extra=None):
        m={'name':name,'pbrMetallicRoughness':{'baseColorFactor':list(c)+[1],'metallicFactor':0,'roughnessFactor':rough},'emissiveFactor':[0,0,0]}
        if extra: m.update(extra)
        g['materials'].append(m); MAT[name]=len(g['materials'])-1; return MAT[name]
    newmat('lash',(0.012,0.008,0.006),0.8)
    brow=[brows(S,L,side) for side in (-1,1)]
    beards=beard_shells(P,Ft,Nn,L,shp,J4,W4,doc,g,MAT)

    def toH(Pw): return np.asarray(Pw,float)-np.array([0,HEADY,0])      # bind space -> Head joint space (pure translation)
    def rigid(Pw,F,mat,two=False):
        Pl=toH(Pw); F3=np.asarray(F).reshape(-1,3)
        if two:
            Nl=weld_normals(Pl,F3); out=np.sign(((Pl-np.array([0,0.2,0]))*Nl).sum(1,keepdims=True)); Nl=Nl*np.where(out==0,1,out)
            F3=np.concatenate([F3,F3[:,::-1]])
        else: Nl=weld_normals(Pl,F3)
        return {'P':Pl,'N':Nl,'F':F3.ravel(),'mat':MAT[mat] if isinstance(mat,str) else mat}
    def mkmesh(prims,name):
        out=[]
        for p in prims:
            pr={'attributes':{'POSITION':doc.add(p['P'].astype(np.float32)),'NORMAL':doc.add(p['N'].astype(np.float32))},'material':p['mat'] if isinstance(p['mat'],int) else MAT[p['mat']],
                'indices':doc.add(np.asarray(p['F']).astype(np.uint16 if len(p['P'])<65536 else np.uint32).ravel())}
            if 'UV' in p: pr['attributes']['TEXCOORD_0']=doc.add(np.asarray(p['UV']).astype(np.float32))
            if 'C' in p: pr['attributes']['COLOR_0']=doc.add(np.asarray(p['C']).astype(np.float32))
            if 'J' in p: pr['attributes']['JOINTS_0']=doc.add(p['J'].astype(np.uint16)); pr['attributes']['WEIGHTS_0']=doc.add(p['W'].astype(np.float32))
            if 'T' in p: pr['targets']=[{'POSITION':doc.add(p['T'][k].astype(np.float32))} for k in SHAPES]
            out.append(pr)
        m={'primitives':out,'name':name}
        if 'T' in prims[0]: m['weights']=[0.0]*len(SHAPES); m['extras']={'targetNames':list(SHAPES)}
        g['meshes'].append(m); return len(g['meshes'])-1

    # Head children: keep the joint end, the earring, the beard attachment and the built-in hair; drop the old face
    keepnames={'earring','face_beard','hair_scalp','hair_locs','hair_band'}
    oldkids=[c for c in N_[hi]['children'] if N_[c].get('name')!='HeadTop_End' and N_[c].get('name') not in keepnames]
    newkids=[]
    def addnode(name,mesh,**kw):
        N_.append(dict(name=name,mesh=mesh,**kw)); return len(N_)-1
    for side,ep in eyes.items():
        prims=[rigid(ep[k][0],ep[k][1],k) for k in ('eye_white','iris','pupil','eye_hi')]
        newkids.append(addnode('eye_'+side,mkmesh(prims,'eye_'+side)))
    # earrings onto the new lobes
    ear=[c for c in N_[hi]['children'] if N_[c].get('name')=='earring'][0]
    em=g['meshes'][N_[ear]['mesh']]['primitives'][0]
    EPb=rest2bind(ear,doc.get(em['attributes']['POSITION'])); ENb=(np.linalg.inv(W[hi])@W[ear])[:3,:3]@doc.get(em['attributes']['NORMAL']).astype(float).T
    hoop_top=np.array([EPb[:,0].mean(),EPb[:,1].max(),EPb[:,2].mean()])
    d=L['lobe_r']-hoop_top+np.array([0.002,-0.001,0])
    for k in ('translation','rotation','scale','matrix'): N_[ear].pop(k,None)
    g['meshes'].append({'primitives':[{'attributes':{'POSITION':doc.add(toH(EPb+d).astype(np.float32)),'NORMAL':doc.add(ENb.T.astype(np.float32))},'indices':doc.add(doc.get(em['indices']).ravel().astype(np.uint16)),'material':em['material']}]})
    N_[ear]['mesh']=len(g['meshes'])-1
    ml=np.array([-1,1,1]); EPm=(EPb+d)*ml; ENm=ENb.T*ml
    newkids.append(addnode('face_hoop',mkmesh([{'P':toH(EPm),'N':ENm,'F':flipF(doc.get(em['indices']).ravel()),'mat':em['material']}],'face_hoop')))

    # built-in hair pieces onto the new skull
    earv=np.zeros(len(P),bool)
    for t in ('ears/l-ear-scale-incr','ears/r-ear-scale-incr'):
        I,_=target(t); earv[np.isin(mh['ids'],I)]=True
    newSkull=Surf(P,Ft[(P[Ft][:,:,1].min(1)>1.50)&~earv[Ft].any(1)])
    R=Refit(oldSkull,newSkull,L,full=S)
    for c in N_[hi]['children']:
        n=N_[c]
        if n.get('name') in ('hair_scalp','hair_locs','hair_band') and 'mesh' in n:
            Mc=np.linalg.inv(W[hi])@W[c]
            for k in ('translation','rotation','scale','matrix'): n.pop(k,None)
            mesh=g['meshes'][n['mesh']]; newp=[]
            for pr in mesh['primitives']:
                Pb=xf(Mc,doc.get(pr['attributes']['POSITION']))+np.array([0,HEADY,0]); Pn=R.map(Pb)
                F_=doc.get(pr['indices']).ravel()
                newp.append({'attributes':{'POSITION':doc.add(toH(Pn).astype(np.float32)),'NORMAL':doc.add(weld_normals(Pn,F_).astype(np.float32))},'indices':doc.add(F_.astype(np.uint16 if len(Pn)<65536 else np.uint32)),'material':pr['material']})
            g['meshes'].append({'primitives':newp}); n['mesh']=len(g['meshes'])-1
    N_[hi]['children']=[c for c in N_[hi]['children'] if c not in oldkids]+newkids

    # skinned meshes beside Body: the head skin, the lashes and the two beard shells
    root=[i for i,n in enumerate(N_) if n.get('name')=='Efe'][0]; skin_i=body['skin']
    sk_nodes=[addnode('HeadSkin',mkmesh(head_prims,'HeadSkin'),skin=skin_i),
              addnode('face_lash',mkmesh([lash],'face_lash'),skin=skin_i)]
    for name,bp in beards.items(): sk_nodes.append(addnode(name,mkmesh([bp],name),skin=skin_i))
    sk_nodes.append(addnode('face_brow',mkmesh([skinned_card(brow,P,shp,J4,W4,MAT['hair'])],'face_brow'),skin=skin_i))
    N_[root]['children']+=sk_nodes

    # ---- 4. root extras measured on the new skull
    ex=N_[root].setdefault('extras',{})
    top=P[:,1].max(); cen=L['centre']
    ex['hairMount']={'x':0,'y':round(float(cen[1]-HEADY),4),'z':round(float(cen[2]),4),'scale':round(0.6767*L['skullR']/0.175,4),'headR':0.3}
    ex['headCentre']=[0,round(float(cen[1]),4),round(float(cen[2]),4)]
    ex['visualRevision']='v55 anatomical head: MakeHuman CC0 head and neck at adult proportions, fitted eyes, painted lips and lash line, shape keys masc/old/smile/blinkLeft/blinkRight/concerned.'
    ex['head55']={'tool':'tools/hero_head.py','source':'MakeHuman core assets CC0 (makehumancommunity/makehuman a8bc2d5)','recipe':RECIPE_JSON(),
                  'shapes':list(SHAPES),'chin':Y_CHIN,'crown':round(float(top),4),'skullR':round(float(L['skullR']),4),'tris':int(len(Ft)),
                  'browY':round(float(L['brow_y']),4),'mouthY':round(float(L['mouth'][1]),4),'eyes':[np.round(L['eye_r'],4).tolist(),np.round(L['eye_l'],4).tolist()],'eyeR':round(float(L['eyeR_l']),4)}
    remove_nodes(g,oldkids)
    doc.pack()
    s=json.dumps(g,separators=(',',':')); open(DST,'w').write(s); print('wrote',DST,len(s)//1024,'KB')
    refit_wardrobe(R)
    if write_blend: blend(P,Ft,shp,eyes,brow,lash,beards)
    return P,Ft,L

def RECIPE_JSON(): return {k:(list(v) if isinstance(v,tuple) else v) for k,v in RECIPE.items()}

# ============================================================== landmarks and paint
def landmarks(P,mh,T,eyeP):
    L={}
    # eyes: the fitted eyeballs (two islands split by x)
    for side,sel in (('r',eyeP[:,0]<0),('l',eyeP[:,0]>0)):
        E=eyeP[sel]; c=(E.min(0)+E.max(0))/2; L['eye_'+side]=c; L['eyeR_'+side]=float(np.median(np.linalg.norm(E-c,axis=1)))
    V=mh['V']; mid=np.abs(V[:,0])<0.02
    mz=lambda ylo,yhi: T(V[mid&(V[:,1]>ylo)&(V[:,1]<yhi)&(V[:,2]>1.3)])
    L['mouth']=np.array([0,float(T(np.array([[0,6.845,1.5]]))[0,1]),0]); L['mouth'][2]=mz(6.80,6.90)[:,2].max()
    L['nose_base']=float(T(np.array([[0,7.0,1.5]]))[0,1]); L['nose_tip']=T(np.array([[0,7.13,1.54]]))[0]
    L['brow_y']=float(T(np.array([[0,7.62,1.4]]))[0,1])
    L['chin']=float(P[:,1][(P[:,2]>0.12)&(np.abs(P[:,0])<0.02)].min())
    # ear lobes: the lowest point of each ear (outside the skull width, behind the cheek)
    for side,s in (('r',-1),('l',1)):
        m=(P[:,0]*s>0.085)&(P[:,1]>1.53)&(P[:,1]<1.66)&(P[:,2]<0.07)&(P[:,2]>-0.03)
        E=P[m]; lob=E[E[:,1].argmin()]; L['lobe_'+side]=lob+np.array([0,-0.002,0])
    sk=P[P[:,1]>1.60]; L['centre']=np.array([0,(P[:,1].max()+L['brow_y'])/2-0.01,(sk[:,2].min()+sk[:,2].max())/2])
    L['skullR']=float((sk[:,0].max()-sk[:,0].min())/2) if len(sk) else 0.11
    L['skullR']=float(np.percentile(np.abs(P[(P[:,1]>L['brow_y'])][:,0]),99))
    return L

LIP_TOP=(0.46,0.26,0.22); LIP=(0.62,0.36,0.30)
def paint(P,N,L):
    """COLOR_0 multipliers on the skin colour: lips, lash line, brow shadow, nostrils, inner ear, mouth corners."""
    C=np.ones((len(P),3)); x,y,z=P[:,0],P[:,1],P[:,2]
    my=L['mouth'][1]; mzc=L['mouth'][2]
    front=sm(0.05,0.35,N[:,2])*sm(mzc-0.04,mzc-0.025,z)
    # lips: upper from the slit to the cupid's bow line, lower from the slit to the lower border, soft 1.5 mm edges
    hw=0.0262; u=np.clip(np.abs(x)/hw,0,1.5)
    bow=0.0086+0.0022*np.exp(-((np.abs(x)-0.0045)/0.004)**2)-0.0012*np.exp(-(x/0.0025)**2)
    top_b=my+bow*np.sqrt(np.clip(1-u**2.2,0,1)); low_b=my-0.0118*np.sqrt(np.clip(1-u**2.0,0,1))
    up=sm(top_b+0.0012,top_b-0.0006,y)*sm(my-0.002,my+0.0002,y)
    lo=sm(low_b-0.0014,low_b+0.0006,y)*sm(my+0.002,my-0.0002,y)
    up*=front*sm(1.25,0.95,u); lo*=front*sm(1.25,0.95,u)
    for k in range(3):
        C[:,k]=C[:,k]*(1-up*(1-LIP_TOP[k]))*(1-lo*(1-LIP[k]))
    slit=np.exp(-((y-my)/0.0009)**2)*sm(1.1,0.7,u)*front; C*=(1-0.55*slit)[:,None]
    corner=np.exp(-((np.abs(x)-hw)**2+(y-my-0.001)**2)/0.004**2)*front; C*=(1-0.25*corner)[:,None]
    # eyes: the lid rims touching the eyeball are darkened (a lash line), and a soft upper-lid crease shadow
    for s in ('r','l'):
        c=L['eye_'+s]; r=L['eyeR_'+s]; d=np.linalg.norm(P-c,axis=1)
        rim=sm(r+0.0025,r+0.0006,d)*(y>c[1]-0.004)
        rimlo=sm(r+0.0016,r+0.0004,d)*(y<=c[1]-0.004)
        C*=(1-0.62*rim-0.30*rimlo)[:,None]
        crease=np.exp(-(((x-c[0])/0.017)**2+((y-c[1]-0.012)/0.006)**2))*(z>c[2]-0.02); C*=(1-0.10*crease)[:,None]
        # brow shadow under the strands
        bx=(x-c[0])*np.sign(c[0]); by=L['brow_y']+0.002-0.010*((bx-0.004)/0.024)**2
        brow=np.exp(-((bx-0.004)/0.022)**4)*np.exp(-((y-by)/0.0035)**2)*(z>c[2]-0.01); C*=(1-0.42*brow)[:,None]
    # liner: the skin along the traced upper lid margin (the lashes' roots)
    if 'lid_margin' in L:
        from mathutils.kdtree import KDTree
        kd=KDTree(len(L['lid_margin']))
        for i,q in enumerate(L['lid_margin']): kd.insert(Vector(tuple(map(float,q))),i)
        kd.balance(); dm=np.array([kd.find(Vector(tuple(map(float,p))))[2] for p in P]); C*=(1-0.65*sm(0.0022,0.0006,dm))[:,None]
    # nostrils: undersides of the nose wings facing down and in
    nb=L['nose_base']; nos=sm(0.2,0.75,-N[:,1])*np.exp(-((y-nb)/0.006)**2)*(np.abs(x)<0.022)*(z>L['nose_tip'][2]-0.03)
    C*=(1-0.55*nos)[:,None]
    # inner ear
    ear=(np.abs(x)>0.088)*sm(0.3,-0.2,N[:,0]*np.sign(x))*(y>1.55)*(y<1.66); C*=(1-0.22*ear)[:,None]
    return C.clip(0.15,1)

# ============================================================== eyes, brows, lashes, beards
def eye_parts(mh,T,eyeP,L):
    """MakeHuman's fitted eyeball split by its texture into sclera / iris / pupil; a small highlight on the cornea."""
    tex=np.asarray(Image.open(MHD/'eyes/brown_eye.png').convert('RGB')).astype(float)/255
    VT=mh['eyeVT']; F=mh['eyeF']; FT=mh['eyeFT']
    out={}
    for side,sel in (('r',eyeP[:,0]<0),('l',eyeP[:,0]>0)):
        vid=np.where(sel)[0]; keep=np.isin(F,vid).all(1); Fs=F[keep]; FTs=FT[keep]
        cuv=VT[FTs].mean(1); px=np.clip((cuv[:,0]*1023).astype(int),0,1023); py=np.clip(((1-cuv[:,1])*1023).astype(int),0,1023)
        c=tex[py,px]; lum=c.mean(1); sat=c.max(1)-c.min(1)
        blue=(c[:,2]>c[:,0]+0.1)                                   # the cornea swatch: dropped
        tiris=(sat>0.12)&(lum<0.55)&~blue
        e=L['eye_'+side]; r=L['eyeR_'+side]
        # the texture finds the iris; the parts are then cut as clean discs by the angle from the eye's own axis
        fc=eyeP[Fs].mean(1); ax=fc[tiris].mean(0)-e; ax/=np.linalg.norm(ax)
        ang=np.arccos(np.clip(((fc-e)/np.linalg.norm(fc-e,axis=1,keepdims=True))@ax,-1,1))
        front=((fc-e)@ax)>0
        pupil=(ang<0.20)&front&~blue; iris=(ang<0.44)&front&~pupil&~blue; white=~pupil&~iris&~blue
        L['eyeAxis_'+side]=ax
        parts={}
        for name,m in (('eye_white',white),('iris',iris),('pupil',pupil)):
            Ft=tris(Fs[m]); u=np.unique(Ft); rm=-np.ones(len(eyeP),int); rm[u]=np.arange(len(u))
            Pp=eyeP[u]
            if name!='eye_white': Pp=e+(Pp-e)*(1.0008 if name=='iris' else 1.0016)   # a hair proud of the sclera
            parts[name]=(Pp,rm[Ft].ravel())
        # highlight: a small disc up and toward the key light (viewer's left) on the cornea
        hd=ax+np.array([-0.22,0.25,0]); hd/=np.linalg.norm(hd); hc=e+r*1.03*hd
        n=hc-e; n/=np.linalg.norm(n); a=np.cross(n,[0,1,0]); a/=np.linalg.norm(a); b=np.cross(n,a)
        ring=[hc+0.0012*(a*math.cos(t)+b*math.sin(t)) for t in np.linspace(0,2*math.pi,12,endpoint=False)]
        Ph=np.array([hc]+ring); Fh=np.array([[0,1+i,1+(i+1)%12] for i in range(12)]).ravel()
        parts['eye_hi']=(Ph,Fh); out[side]=parts
    return out

BROW_N=190
def brows(S,L,side):
    """Strand brows grown on the brow ridge: a dense, tapered band (fewer stray hairs than v53)."""
    rng=np.random.default_rng(55+(side>0)); c=L['eye_'+('l' if side>0 else 'r')]; by=L['brow_y']
    x0=abs(c[0])
    path=np.array([(x0-0.016,by-0.0035),(x0-0.008,by+0.0010),(x0+0.004,by+0.0030),(x0+0.015,by+0.0018),(x0+0.024,by-0.0030)])
    seg=np.r_[0,np.cumsum(np.linalg.norm(np.diff(path,axis=0),axis=1))]; Lp=seg[-1]
    def at(t):
        d=t*Lp; i=min(np.searchsorted(seg,d,side='right')-1,len(path)-2); f=(d-seg[i])/(seg[i+1]-seg[i]); tg=path[i+1]-path[i]
        return path[i]*(1-f)+path[i+1]*f, tg/np.linalg.norm(tg)
    P=[];F=[]
    for k in range(BROW_N):
        t=rng.random()**0.9; cpt,tan=at(t); th=np.interp(t,[0,0.4,1],[0.0058,0.0046,0.0018])
        off=(rng.random()-0.5)*th; nrm=np.array([-tan[1],tan[0]]); root=cpt+nrm*off
        ang=np.interp(t,[0,0.15,0.3,1],[1.2,0.8,0.3,0.1])+rng.normal(0,0.05)
        a=math.atan2(tan[1],tan[0])+ang; dv=np.array([math.cos(a),math.sin(a)])
        ln=rng.uniform(0.0034,0.0055)*(1-0.3*t); i0=len(P)
        for j in range(4):
            f=j/3; p2=root+dv*ln*f; X=side*p2[0]; zz,nr=S.z(X,p2[1])
            if zz is None: zz=0.09
            w=0.00068*(1-f*0.8); pp=np.array([-dv[1],dv[0]])*w
            for sg in (1,-1): P.append([side*(p2[0]+sg*pp[0]),p2[1]+sg*pp[1],zz+0.0004+0.0003*f])
        for j in range(3): a0=i0+2*j; F+=[a0,a0+2,a0+1,a0+1,a0+2,a0+3]
    F=np.array(F)
    if side<0: F=flipF(F)
    return np.array(P),F

def skinned_card(parts,P,shp,J4,W4,mat):
    """Two-sided strand cards (the brows) skinned like the nearest skin vertex, so they ride the shape keys."""
    Ps=[];Fs=[];o=0
    for Pb,Fb in parts: Ps.append(Pb); Fs.append(np.asarray(Fb).reshape(-1,3)+o); o+=len(Pb)
    Pc=np.concatenate(Ps); F3=np.concatenate(Fs)
    N=weld_normals(Pc,F3); out=np.sign(((Pc-np.array([0,1.63,0]))*N).sum(1,keepdims=True)); N=N*np.where(out==0,1,out)
    from mathutils.kdtree import KDTree
    kd=KDTree(len(P))
    for i,q in enumerate(P): kd.insert(Vector(tuple(map(float,q))),i)
    kd.balance(); idx=np.array([kd.find(Vector(tuple(map(float,q))))[1] for q in Pc])
    return {'P':Pc,'N':N,'F':np.concatenate([F3,F3[:,::-1]]).ravel(),'J':J4[idx],'W':W4[idx],'T':{k:shp[k][idx] for k in SHAPES},'mat':mat}

def lashes(P,Ft,L,shp,J4,W4,eyes):
    """Upper lashes: a curled fringe grown from the visible upper lid margin. The margin is found by looking at the
    face from the front: for each column across the eye, the highest point where the eyeball is still seen in front
    of the skin. The fringe is skinned like the nearest lid vertex, so it follows the blink and smile shapes."""
    S=Surf(P,Ft); Ps=[];Fs=[];Ts={k:[] for k in SHAPES}; Js=[];Ws=[]; bases=[]
    for s in ('r','l'):
        c=L['eye_'+s]; r=L['eyeR_'+s]; ep=eyes[s]
        EP=np.concatenate([ep[k][0] for k in ('eye_white','iris','pupil')]); off=0; EF=[]
        for k in ('eye_white','iris','pupil'): EF.append(np.asarray(ep[k][1]).reshape(-1,3)+off); off+=len(ep[k][0])
        E=Surf(EP,np.concatenate(EF))
        pts=[]
        for x in np.linspace(c[0]-1.2*r,c[0]+1.2*r,41):
            top=None
            for y in np.linspace(c[1]-0.2*r,c[1]+1.0*r,90):
                he=E.ray((x,y,0.6),(0,0,-1))[0]; hs=S.ray((x,y,0.6),(0,0,-1))[0]
                if he is not None and (hs is None or he[2]>hs[2]-1e-5): top=(x,y+0.0002,he[2]+0.0010)
            if top is not None: pts.append(top)
        if len(pts)<5: continue
        base=np.array(pts); n=len(base); t=np.linspace(0,1,n); bases.append(base)
        nearest=[int(np.argmin(np.linalg.norm(P-b_,axis=1))) for b_ in base]
        out=base-c; out[:,2]=np.maximum(out[:,2],0); out/=np.linalg.norm(out,axis=1,keepdims=True)
        outer=(t if s=='l' else 1-t)                      # longer toward the outer corner
        up=np.array([0,1.0,0]); length=0.0046*np.sin(np.pi*(0.04+0.92*t))**0.45*(0.7+0.6*outer)
        rows=[base+np.array([0,0,0.0003])]
        for f in (0.3,0.65,1.0):
            dirv=np.array([0,0,1.0])*(1.0-0.45*f)+up*(0.10+0.80*f*f)+out*0.20; dirv/=np.linalg.norm(dirv,axis=1,keepdims=True)
            rows.append(base+np.array([0,0,0.0003])+dirv*length[:,None]*f)
        i0=sum(len(p) for p in Ps); R=np.concatenate(rows); Ps.append(R)
        for k in range(len(rows)-1):
            for j in range(n-1):
                a_=i0+k*n+j; b_=a_+1; c2=a_+n; d2=b_+n; Fs+=[a_,b_,c2,b_,d2,c2]
        idx=np.array(nearest*len(rows))
        for k in SHAPES: Ts[k].append(shp[k][idx])
        Js.append(J4[idx]); Ws.append(W4[idx])
    Pl=np.concatenate(Ps); F=np.array(Fs); F2=np.concatenate([F,flipF(F)])
    N=weld_normals(Pl,F); N=N*np.sign((N*np.array([0,0.3,1])).sum(1,keepdims=True)+1e-9)
    return {'P':Pl,'N':N,'F':F2,'J':np.concatenate(Js),'W':np.concatenate(Ws),'T':{k:np.concatenate(v) for k,v in Ts.items()},'mat':'lash','base':np.concatenate(bases)}

def beard_mask(u,v,style):
    """u: angle around the head (0 front, +-1.6 at the ears), v: height in mouth units (0 at the slit, -1 at the chin)."""
    a=np.abs(u)
    line=np.interp(a,[0,0.35,0.8,1.25,1.6],[0.10,0.20,0.85,1.55,2.0])     # cheek line: from the mouth corner up to the sideburn
    beard=sm(line+0.12,line-0.12,v)
    stache=sm(0.42,0.32,a)*sm(0.30,0.40,v)*sm(0.95,0.80,v)
    m=np.maximum(beard,stache)
    if style=='goatee': m=np.maximum(beard*sm(1.30,0.85,a),stache)
    lipgap=1-sm(0.55,0.45,a)*sm(-0.45,-0.30,v)*sm(0.38,0.25,v)
    soul=1-0.6*sm(0.08,0.02,a)*sm(-0.75,-0.62,v)*sm(-0.40,-0.52,v)
    return np.clip(m*lipgap*soul,0,1)
def beard_shells(P,Ft,N,L,shp,J4,W4,doc,g,MAT):
    my=L['mouth'][1]; unit=my-L['chin']; ctr=np.array([0,my,L['centre'][2]])
    u=np.arctan2(P[:,0],P[:,2]-ctr[2]); v=(P[:,1]-my)/unit
    ok=(v<2.3)&(v>-1.6)&(np.abs(u)<1.75)&(P[:,1]>1.43)
    nose=(np.abs(P[:,0])<0.02)&(P[:,1]>L['nose_base']-0.004); ok&=~nose
    fm=ok[Ft].all(1); Fs=Ft[fm]; used=np.unique(Fs); rm=-np.ones(len(P),int); rm[used]=np.arange(len(used))
    UV=np.stack([0.5+u[used]/3.6,(v[used]+1.6)/4.0],1)
    out={}
    for name,(style,dens,length,seed,off) in {'face_beard_stubble':('stubble',0.13,2,3,0.0006),'face_beard_boxed':('goatee',0.30,3,5,0.0012)}.items():
        res=512; rng=np.random.default_rng(seed); vv,uu=np.mgrid[0:res,0:res]/(res-1)
        m=beard_mask((uu-0.5)*3.6,vv*4.0-1.6,style)
        A=np.zeros((res,res)); n=int(res*res*dens); ys=rng.integers(0,res,n); xs=rng.integers(0,res,n)
        k=rng.random(n)<m[ys,xs]; ys=ys[k]; xs=xs[k]; ang=rng.normal(-np.pi/2,0.5,len(xs))
        for Ls in range(length):
            A[np.clip((ys+np.sin(ang)*Ls*0.7).astype(int),0,res-1),np.clip((xs+np.cos(ang)*Ls*0.7).astype(int),0,res-1)]=1
        img=np.zeros((res,res,4),np.uint8); img[...,:3]=255; img[...,3]=(A*255).astype(np.uint8); img=img[::-1]
        b=io.BytesIO(); Image.fromarray(img).save(b,'PNG',optimize=True); ii=doc.image(b.getvalue())
        g.setdefault('samplers',[]).append({'magFilter':9729,'minFilter':9987,'wrapS':33071,'wrapT':33071})
        g.setdefault('textures',[]).append({'source':ii,'sampler':len(g['samplers'])-1})
        g['materials'].append({'name':'beard','alphaMode':'MASK','alphaCutoff':0.5,'pbrMetallicRoughness':{'baseColorFactor':[0.03,0.024,0.02,1],'baseColorTexture':{'index':len(g['textures'])-1},'metallicFactor':0,'roughnessFactor':0.85}})
        Pb=P[used]+N[used]*off; UVf=UV.copy(); UVf[:,1]=1-UVf[:,1]
        out[name]={'P':Pb,'N':N[used],'F':rm[Fs].ravel(),'UV':UVf,'J':J4[used],'W':W4[used],'T':{k:shp[k][used] for k in SHAPES},'mat':len(g['materials'])-1}
    return out

# ============================================================== hair refit
class Refit:
    """Moves geometry made on the old skull onto the new one, keeping its height above the skin. Seen from each skull's
    centre, a point p in direction d lies |p-c_old| - r_old(d) above the old skull; it goes to c_new + d*(r_new(d) +
    k*that height), where r(d) are ray hits on the two skulls (the new ears are left out; missed rays are filled from
    their neighbours) and k shrinks the hair's own volume with the head. A point on the old skin lands on the new skin."""
    def __init__(s,old,new,L,k=0.62,nu=96,nv=48,full=None):
        s.old=old; s.full=full; s.c0=np.array([0,1.645,0.0]); s.c1=np.array([0,L['brow_y']-0.022,L['centre'][2]],float); s.k=k
        th=np.linspace(-np.pi,np.pi,nu,endpoint=False); ph=np.linspace(-np.pi/2+0.04,np.pi/2-0.04,nv)
        R0=np.full((nv,nu),np.nan); R1=np.full((nv,nu),np.nan)
        for i,p in enumerate(ph):
            for j,t in enumerate(th):
                d=np.array([math.cos(p)*math.sin(t),math.sin(p),math.cos(p)*math.cos(t)])
                h0=old.ray(s.c0,d)[0]; h1=new.ray(s.c1,d)[0]
                if h0 is not None: R0[i,j]=np.linalg.norm(h0-s.c0)
                if h1 is not None: R1[i,j]=np.linalg.norm(h1-s.c1)
        s.R0=Refit.fill(R0); s.R1=Refit.fill(R1); s.th=th; s.ph=ph
    @staticmethod
    def fill(R):
        R=R.copy()
        for _ in range(200):
            m=np.isnan(R)
            if not m.any(): break
            S=np.zeros_like(R); C=np.zeros_like(R)
            for sh in ((0,1),(0,-1),(1,0),(-1,0)):
                Q=np.roll(R,sh,(0,1)); ok=~np.isnan(Q); S+=np.where(ok,Q,0); C+=ok
            R=np.where(m&(C>0),S/np.maximum(C,1),R)
        return np.where(np.isnan(R),np.nanmedian(R),R)
    def lookup(s,G,d):
        t=np.arctan2(d[:,0],d[:,2]); p=np.arcsin(np.clip(d[:,1],-1,1))
        fj=(t+np.pi)/(2*np.pi)*len(s.th); fi=np.clip((p-s.ph[0])/(s.ph[-1]-s.ph[0])*(len(s.ph)-1),0,len(s.ph)-1.001)
        j0=np.floor(fj).astype(int)%len(s.th); j1=(j0+1)%len(s.th); a=fj-np.floor(fj); i0=np.floor(fi).astype(int); i1=i0+1; b=fi-i0
        return (G[i0,j0]*(1-a)+G[i0,j1]*a)*(1-b)+(G[i1,j0]*(1-a)+G[i1,j1]*a)*b
    def map(s,P):
        P=np.asarray(P,float); v=P-s.c0; r=np.linalg.norm(v,axis=1); d=v/np.maximum(r,1e-9)[:,None]
        r0=s.lookup(s.R0,d); r1=s.lookup(s.R1,d); h=r-r0
        rn=np.where(h>=0,r1+np.maximum(h*s.k,0.0012*sm(0,0.002,h)),r1*(r/np.maximum(r0,1e-9)))
        out=s.c1+d*rn[:,None]
        if s.full is not None:
            # anything that was outside the old head but lands in the new face, ears or neck (strands framing the face,
            # hanging braids) is pushed back out to 1.5 mm above the skin; roots buried in the old scalp stay buried
            for i in range(len(P)):
                q0,n0,_=s.old.near(P[i])
                if np.dot(P[i]-q0,n0)<-0.0005: continue
                q1,n1,_=s.full.near(out[i]); dd=np.dot(out[i]-q1,n1)
                if dd<0.0015: out[i]=q1+n1*0.0015
        return out

def refit_wardrobe(R):
    """Rigid hair files (Head-joint space) and the Head-weighted vertices of skinned pieces (bind space)."""
    HEADY=1.43; report={}
    for f in sorted(WARD.glob('*.gltf.json')):
        name=f.name[:-10]
        tmp=ROOT/('tools/.ward-'+f.name); tmp.write_bytes(subprocess.check_output(['git','-C',str(ROOT),'show',WARD_PIN_FILE.get(f.name,WARD_PIN)+':dist/assets/wardrobe/'+f.name]))
        g,buf=load(tmp); tmp.unlink(); doc=Doc(g,buf); changed=False; stats=[0,0,0,0]
        kind=next((n['extras']['kind'] for n in g['nodes'] if 'extras' in n and 'kind' in n['extras']),None)
        W,par=world_mats(g)
        for i,n in enumerate(g['nodes']):
            if 'mesh' not in n: continue
            for pr in g['meshes'][n['mesh']]['primitives']:
                A=pr['attributes']; Pp=doc.get(A['POSITION']).astype(float)
                if 'JOINTS_0' in A:
                    J=doc.get(A['JOINTS_0']); Wt=doc.get(A['WEIGHTS_0'])
                    jn=[g['nodes'][j]['name'] for j in g['skins'][n.get('skin',0)]['joints']]; jh=jn.index('Head')
                    wh=((J==jh)*Wt).sum(1)*sm(1.44,1.50,Pp[:,1])     # head-borne pieces (earrings), never the collars
                    if (wh>0.01).sum()==0: continue
                    Pn=R.map(Pp); Pq=Pp+(Pn-Pp)*wh[:,None]
                else:
                    if kind!='hair': continue
                    M=W[i]; Pb=xf(M,Pp)+np.array([0,HEADY,0]); Pn=R.map(Pb); Pq=xf(np.linalg.inv(M),Pn-np.array([0,HEADY,0]))
                F_=doc.get(pr['indices']).ravel() if 'indices' in pr else np.arange(len(Pp))
                doc.data[A['POSITION']]=Pq.astype(np.float32)
                # penetration bookkeeping (bind space): buried in the old scalp before, inside the new skin after
                Pa=Pp if 'JOINTS_0' in A else xf(W[i],Pp)+np.array([0,HEADY,0]); Pb_=Pq if 'JOINTS_0' in A else xf(W[i],Pq)+np.array([0,HEADY,0])
                for a_,b_ in zip(Pa,Pb_):
                    q,nn,_=R.old.near(a_); oin=np.dot(a_-q,nn)<-0.002
                    q,nn,_=R.full.near(b_); dd=np.dot(b_-q,nn); nin=-0.012<dd<-0.002
                    stats[0]+=1; stats[1]+=oin; stats[2]+=nin; stats[3]+=(nin and not oin)
                if 'NORMAL' in A:
                    N0=doc.get(A['NORMAL']).astype(float); Nn=weld_normals(Pq,F_)
                    mv=np.linalg.norm(Pq-Pp,axis=1)>1e-7; Nn=np.where((np.einsum('ij,ij->i',Nn,N0)<0)[:,None],-Nn,Nn)
                    doc.data[A['NORMAL']]=np.where(mv[:,None],Nn,N0).astype(np.float32)
                changed=True
        if changed:
            for n in g['nodes']:
                if 'extras' in n and 'kind' in n['extras']: n['extras']['fit55']={'tool':'tools/hero_head.py','vertices':int(stats[0]),'buriedBefore':int(stats[1]),'insideAfter':int(stats[2]),'newlyInside':int(stats[3])}
            doc.pack(); open(f,'w').write(json.dumps(g,separators=(',',':'))); report[name]='refit'
    print('wardrobe refit:',', '.join(sorted(report)))

# ============================================================== Blender source
def blend(P,Ft,shp,eyes,brow,lash,beards):
    import bpy
    bpy.ops.wm.read_factory_settings(use_empty=True)
    g2b=lambda Q: [(float(p[0]),float(-p[2]),float(p[1])) for p in np.asarray(Q)]
    def ob(name,Pp,F,mat,shapes=None):
        me=bpy.data.meshes.new(name); me.from_pydata(g2b(Pp),[],np.asarray(F).reshape(-1,3).tolist()); me.update()
        for p in me.polygons: p.use_smooth=True
        m=bpy.data.materials.get(mat) or bpy.data.materials.new(mat); me.materials.append(m)
        o=bpy.data.objects.new(name,me); bpy.context.scene.collection.objects.link(o)
        if shapes:
            o.shape_key_add(name='Basis')
            for k,dv in shapes.items():
                kb=o.shape_key_add(name=k); kb.data.foreach_set('co',np.array(g2b(np.asarray(Pp)+dv),float).ravel())
        return o
    ob('HeadSkin',P,Ft,'skin',shp)
    for side,ep in eyes.items():
        for k,(Pp,F) in ep.items(): ob(k+'_'+side,Pp,F,k)
    for side,(Pb,Fb) in zip(('r','l'),brow): ob('face_brow_'+side,Pb,Fb,'hair')
    ob('face_lash',lash['P'],lash['F'],'lash',lash['T'])
    for name,bp in beards.items(): ob(name,bp['P'],bp['F'],'beard',bp['T'])
    out=ROOT/'source/hero_head_v55.blend'; bpy.ops.wm.save_as_mainfile(filepath=str(out),compress=True); print('wrote',out)

if __name__=='__main__':
    build('--blend' in sys.argv)

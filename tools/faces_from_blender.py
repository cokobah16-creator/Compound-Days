"""Rebuild the hero's face with Blender (v53, "Neighbourhood Faces").

Brings dist/assets/characters/efe.gltf.json towards the owner's Blender face sheet (six NPC concepts: Market auntie,
Suya vendor, Neighbour Locs, Local artisan, Compound elder, Neighbour Linen):

  1. resculpts the shared head inside the skin primitive (same vertices, weights and UVs): a flatter face plane so the
     eyes sit in it, brow ridge, cheekbones, a jaw and chin, a broader nose with nostril wings, a thicker neck; the
     edited region is Laplacian-smoothed on the welded mesh;
  2. carves almond eye sockets and builds new eyes (eyeball, iris, pupil, highlight) with lid shells that grow out of
     the skin, upper lashes, strand brows, full lips with a cupid's bow and a mouth line, and nostrils, using Blender
     BVH ray casts onto the sculpted skin;
  3. adds two beard shells over the jaw with generated stubble textures (face_beard_stubble, face_beard_boxed) and a
     mirrored second hoop (face_hoop), all rigid on the Head joint;
  4. repacks the glTF (one embedded buffer), keeping the 27-joint skin, inverse binds, clips and extras.

It always starts from the pre-v53 hero (git show 61dcd87:dist/assets/characters/efe.gltf.json) so reruns are stable.
Run with Blender's Python module (pip install bpy):  python tools/faces_from_blender.py
"""
import sys, os, json, io, math, subprocess, base64
from pathlib import Path
import numpy as np
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from PIL import Image

# ---- gl ------------------------------------------------------------
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
        M=local(g['nodes'][i]); 
        if i in par: M=wm(par[i])@M
        W[i]=M; return M
    for i in range(len(g['nodes'])): wm(i)
    return W,par

# ---- sculpt ------------------------------------------------------------
def sm(a,b,x):  # smoothstep from a to b
    t=np.clip((x-a)/(b-a),0,1); return t*t*(3-2*t)
def gauss(P,c,r,aniso=(1,1,1)):
    d=(P-np.array(c))/np.array(aniso); return np.exp(-(d*d).sum(1)/(r*r))
def sym(P,c,r,aniso=(1,1,1)):
    c=np.array(c,float); c2=c.copy(); c2[0]=-c2[0]; return np.maximum(gauss(P,c,r,aniso),gauss(P,c2,r,aniso))
def sculpt(P,hw,K=None):
    K=K or {}
    P=P.astype(float).copy(); O=P.copy(); x,y,z=O[:,0],O[:,1],O[:,2]
    D=np.zeros_like(P)
    # A lower face to an oval with a jaw: narrow the front of the lower face
    s=K.get('slim',0.15)*sm(1.64,1.47,y); f=sm(-0.08,0.10,z)
    D[:,0]+= -x*s*f
    # pull the lower back of the head (jaw angle) slightly in too so the head is less of a balloon
    D[:,0]+= -x*K.get('jawback',0.05)*sm(1.58,1.46,y)*(1-f)
    # B chin forward and down
    w=gauss(P,(0,1.455,0.11),0.055,(1.8,1,1)); D[:,1]+=-K.get('chin_down',0.022)*w; D[:,2]+=K.get('chin_fwd',0.03)*w
    # C lower the jaw underside at the front
    w=sm(1.52,1.45,y)*sm(0.0,0.10,z)*sm(0.16,0.0,np.abs(x)); D[:,1]+=-K.get('jaw_low',0.012)*w
    # D muzzle
    w=gauss(P,(0,1.535,0.17),0.05,(1.4,1,1)); D[:,2]+=K.get('muzzle',0.012)*w
    # E forehead more upright
    w=gauss(P,(0,1.74,0.12),0.075,(1.6,1,1)); D[:,2]+=K.get('forehead',0.014)*w
    # K bring the front of the face forward off the sphere (flatter face plane, eyes set into it)
    ax=np.abs(x)
    A=K.get('plane',0.018)*sm(1.47,1.53,y)*sm(1.74,1.66,y)
    D[:,2]+=A*sm(0.0,0.05,ax)*sm(0.175,0.085,ax)*sm(-0.03,0.08,z)
    # F brow ridge
    w=sym(P,(0.068,1.674,0.15),0.03,(1.6,0.7,1)); D[:,2]+=K.get('brow',0.010)*w
    # G eye sockets
    w=sym(P,(0.072,1.636,0.15),0.024,(1.25,0.85,1)); D[:,2]+=-K.get('socket',0.010)*w
    # H cheekbones
    w=sym(P,(0.112,1.607,0.13),0.034,(1,0.8,1)); D[:,0]+=np.sign(x)*K.get('cheek',0.010)*w; D[:,2]+=K.get('cheek',0.010)*0.5*w
    # J soft hollow below the cheekbone
    w=sym(P,(0.10,1.545,0.14),0.032); D[:,0]+=-np.sign(x)*K.get('hollow',0.006)*w
    # I nose bridge
    w=gauss(P,(0,1.628,0.186),0.016,(1,1.6,1)); D[:,2]+=K.get('bridge',0.005)*w
    P=O+D*hw[:,None]
    return P
def neck(P,nw,k=1.32):
    # the neck is a 29-sided tube from 1.36 m up into the head: thicken it towards the jaw
    P=P.copy(); y=P[:,1]; r=np.hypot(P[:,0],P[:,2])
    m=(r<0.06)&(y<1.425)&(y>1.34)
    s=1+0.10*sm(1.35,1.375,y)+(k-1.10)*sm(1.375,1.405,y)
    P[m,0]*=s[m]; P[m,2]*=s[m]; return P
def nose(P,hw,K=None):
    K=K or {}
    P=P.astype(float).copy(); O=P.copy(); x,y,z=O[:,0],O[:,1],O[:,2]; D=np.zeros_like(P)
    w=gauss(O,(0,1.588,0.205),0.02,(1.2,1,1)); D[:,2]+=-K.get('tip',0.007)*w; D[:,1]+=-0.002*w
    w=sym(O,(0.019,1.618,0.185),0.012,(1,1.6,1)); D[:,2]+=-K.get('pinch',0.004)*w; D[:,0]+=-np.sign(x)*0.003*w
    w=sym(O,(0.025,1.574,0.186),0.011,(1,0.9,1)); D[:,0]+=np.sign(x)*K.get('alae',0.005)*w; D[:,2]+=0.002*w
    w=sym(O,(0.036,1.58,0.178),0.006); D[:,2]+=-0.0025*w
    # philtrum groove and the upper-lip skin a touch forward
    w=gauss(O,(0,1.548,0.19),0.007,(0.6,1.4,1)); D[:,2]+=-0.0012*w
    return O+D*hw[:,None]
def smooth(P,F,mask,iters=3,lam=0.45):
    """Laplacian smoothing of the masked vertices on the welded mesh (UV-seam duplicates move together)."""
    key=np.round(P/1e-6).astype(np.int64); _,inv=np.unique(key,axis=0,return_inverse=True); inv=inv.ravel(); n=inv.max()+1
    U=np.zeros((n,3)); U[inv]=P; Fu=inv[np.asarray(F).reshape(-1,3)]
    E=np.concatenate([Fu[:,[0,1]],Fu[:,[1,2]],Fu[:,[2,0]]]); E=np.concatenate([E,E[:,::-1]])
    E=np.unique(E,axis=0)
    deg=np.bincount(E[:,0],minlength=n).astype(float)
    mu=np.zeros(n); np.maximum.at(mu,inv,mask.astype(float))
    for _ in range(iters):
        acc_=np.zeros((n,3)); np.add.at(acc_,E[:,0],U[E[:,1]])
        L=acc_/np.maximum(deg,1)[:,None]-U
        U=U+lam*mu[:,None]*L
    return U[inv]

# ---- feat ------------------------------------------------------------
# face features built in gltf model space (metres, +Y up, +Z forward)
class Surf:
    def __init__(s,P,F):
        s.bvh=BVHTree.FromPolygons([tuple(map(float,p)) for p in P],np.asarray(F).reshape(-1,3).tolist())
    def z(s,x,y,z0=0.5):
        h=s.bvh.ray_cast(Vector((x,y,z0)),Vector((0,0,-1)))
        return (h[0].z, np.array(h[1])) if h[0] is not None else (None,None)
    def zarr(s,X,Y):
        out=np.zeros(len(X)); nrm=np.zeros((len(X),3))
        for i,(x,y) in enumerate(zip(X,Y)):
            zz,n=s.z(float(x),float(y)); out[i]=zz if zz is not None else 0; nrm[i]=n if n is not None else (0,0,1)
        return out,nrm
def grid_faces(nu,nv,wrap_u=False):
    F=[]
    for j in range(nv-1):
        for i in range(nu if wrap_u else nu-1):
            a=j*nu+i; b=j*nu+(i+1)%nu; c=(j+1)*nu+(i+1)%nu; d=(j+1)*nu+i
            F+=[a,b,c,a,c,d]
    return np.array(F)
def flipF(F): F=np.asarray(F).reshape(-1,3); return F[:,::-1].ravel()
def sphere(c,r,nu=24,nv=16,squash=(1,1,1)):
    P=[]
    for j in range(nv+1):
        th=math.pi*j/nv
        for i in range(nu):
            ph=2*math.pi*i/nu
            P.append([c[0]+r*squash[0]*math.sin(th)*math.cos(ph), c[1]+r*squash[1]*math.cos(th), c[2]+r*squash[2]*math.sin(th)*math.sin(ph)])
    F=[]
    for j in range(nv):
        for i in range(nu):
            a=j*nu+i;b=j*nu+(i+1)%nu;cc=(j+1)*nu+(i+1)%nu;d=(j+1)*nu+i
            F+=[a,cc,b,a,d,cc]
    return np.array(P),np.array(F)
def disc_on_sphere(c,R,rad,n=24,rings=3,lift=0.0002,dx=0,dy=0):
    # disc of radius rad on sphere (centre c, radius R) facing +z, centre offset dx,dy
    P=[[c[0]+dx,c[1]+dy,c[2]+math.sqrt(max(R*R-dx*dx-dy*dy,0))+lift]]
    for k in range(1,rings+1):
        rr=rad*k/rings
        for i in range(n):
            a=2*math.pi*i/n; x=dx+rr*math.cos(a); y=dy+rr*math.sin(a)
            P.append([c[0]+x,c[1]+y,c[2]+math.sqrt(max(R*R-x*x-y*y,0))+lift])
    F=[]
    for i in range(n): F+=[0,1+i,1+(i+1)%n]
    for k in range(1,rings):
        o0=1+(k-1)*n;o1=1+k*n
        for i in range(n):
            a=o0+i;b=o0+(i+1)%n;cc=o1+(i+1)%n;d=o1+i; F+=[a,d,cc,a,cc,b]
    return np.array(P),np.array(F)

# ---- eyes ------------------------------------------------------------
E=dict(cx=0.071,cy=1.637,cz=0.143,r=0.0205,rl=0.0217,Rx=0.036,Ry=0.030,a=0.0232,hu=0.0128,hl=0.0082,inner=-0.0016,outer=0.0026,iris=0.0110,pupil=0.0040,Rout=0.036)
def beta(u,p,q):
    t=np.clip((1+u)/2,1e-6,1-1e-6); f=t**p*(1-t)**q; tm=p/(p+q); return f/(tm**p*(1-tm)**q)
def aperture(e,n=40):
    u=np.linspace(-1,1,n)
    base=e['inner']+(e['outer']-e['inner'])*(u+1)/2
    up=base+e['hu']*beta(u,0.85,1.15)**0.8
    lo=base-e['hl']*beta(u,1.2,0.85)**0.9
    U=np.concatenate([u,u[::-1][1:-1]]); V=np.concatenate([up,lo[::-1][1:-1]])
    return U*e['a'],V,len(u)
def lidz(e,dx,dy):
    q=1-(dx/e['Rx'])**2-(dy/e['Ry'])**2
    return e['cz']+e['rl']*np.sqrt(np.clip(q,0,None))
def ap_t(e,dx,dy):
    """0 on the aperture edge, 1 on the outer ring, negative inside the opening (dx in eye-local mirrored space)"""
    U,V,nu=aperture(e,80); cv=(e['inner']+e['outer'])/2
    ang=np.arctan2((V-cv)/0.75,U); rad=np.hypot(U,(V-cv)/0.75)
    o=np.argsort(ang); ang=ang[o]; rad=rad[o]
    ang=np.r_[ang-2*np.pi,ang,ang+2*np.pi]; rad=np.r_[rad,rad,rad]
    th=np.arctan2((dy-cv)/0.75,dx); r=np.hypot(dx,(dy-cv)/0.75)
    rap=np.interp(th,ang,rad)
    Ro=np.hypot(e['Rout']*np.cos(th),e['Rout']*0.8*np.sin(th)/0.75)
    return (r-rap)/(Ro-rap)
def carve(P,hw,e):
    P=P.copy()
    for s in (1,-1):
        dx=(P[:,0]-s*e['cx'])*s; dy=P[:,1]-e['cy']
        rho=np.sqrt((dx/e['Rx'])**2+(dy/e['Ry'])**2)
        m=(rho<1.05)&(P[:,2]>0.05)
        if not m.any(): continue
        t=ap_t(e,dx[m],dy[m])
        z=lidz(e,dx[m],dy[m])+0.0001-0.0028*sm(0.42,0.15,t)
        # upper-lid crease
        up=dy[m]>((e['inner']+e['outer'])/2)
        z-=0.0005*np.exp(-((t-0.62)/0.1)**2)*up
        w=sm(1.0,0.6,rho[m])
        P[m,2]=z*w+P[m,2]*(1-w)
    return P
def eye_parts(e,side,S):
    s=side; c=np.array([s*e['cx'],e['cy'],e['cz']])
    out={}
    P,F=sphere(c,e['r'],28,18); out['eye_white']=(P,F)
    P,F=disc_on_sphere(c,e['r'],e['iris'],32,4,0.0003); out['iris']=(P,F)
    P,F=disc_on_sphere(c,e['r'],e['pupil'],24,2,0.0006); out['pupil']=(P,F)
    P,F=disc_on_sphere(c,e['r'],0.0015,12,1,0.0009,dx=-0.0035*s,dy=0.0035); out['eye_hi']=(P,F)
    U,V,nu=aperture(e); n=len(U)
    cv=(e['inner']+e['outer'])/2
    ang=np.arctan2((V-cv)/0.75,U)
    T=[0,0.06,0.14,0.24,0.36,0.5]
    LP=[]
    for i in range(n):  # tuck row (margin thickness rolled back towards the eyeball)
        dx=U[i]*0.985; dy=V[i]*0.985+cv*0.015
        LP.append([c[0]+s*dx,c[1]+dy,c[2]+math.sqrt(max(e['r']**2-dx*dx-dy*dy,0))-0.0012])
    for k,t in enumerate(T):
        for i in range(n):
            rx=e['Rout']*np.cos(ang[i]); ry=e['Rout']*0.8*np.sin(ang[i])+cv
            dx=U[i]*(1-t)+rx*t; dy=V[i]*(1-t)+ry*t
            z=lidz(e,dx,dy)+0.0003-0.0016*sm(0.36,0.5,t)
            if k==0: z-=0.0005
            LP.append([c[0]+s*dx,c[1]+dy,z])
    LP=np.array(LP)
    F=grid_faces(n,len(T)+1,True)
    if s<0: F=flipF(F)
    out['lid']=(LP,F)
    up=LP[n:n+nu]
    tip=up.copy(); tip[:,1]+=0.0024*np.sin(np.linspace(0.15,np.pi-0.15,nu)); tip[:,2]+=0.0028; tip[:,0]+=0.0014*s*np.linspace(-0.3,1,nu)
    base=up.copy(); base[:,2]+=0.0003
    LsP=np.concatenate([base,tip]); LsF=grid_faces(nu,2)
    out['lash']=(LsP,np.concatenate([LsF,flipF(LsF)]))
    return out

# ---- mouth ------------------------------------------------------------
M=dict(y=1.531,half=0.046,up=0.0115,lo=0.0145,Tu=0.0048,Tl=0.0062,bow=0.0022)
def lips(S,m=M,nu=41,nv=9):
    u=np.linspace(-1,1,nu); x=u*m['half']
    hu=m['up']*(1-u*u)**0.55
    bow=m['bow']*(np.exp(-((np.abs(u)-0.22)/0.12)**2)-0.9*np.exp(-(u/0.09)**2))
    hu=hu+bow*(1-u*u)
    hl=m['lo']*(1-u*u)**0.5*(1+0.08*np.cos(u*np.pi))
    out={}
    for name,h,T,sg in (('lip_top',hu,m['Tu'],1),('lip',hl,m['Tl'],-1)):
        P=[]
        for j in range(nv):
            v=j/(nv-1)
            for i in range(nu):
                yy=m['y']+sg*h[i]*v
                zz,_=S.z(float(x[i]),float(yy))
                t=T*max(math.sin(math.pi*(0.32+0.68*v)),0)*(1-u[i]**2)**0.45
                if j==0: t-=0.0012
                P.append([x[i],yy,zz+t+0.0003])
        P=np.array(P); F=grid_faces(nu,nv)
        if sg<0: F=flipF(F)
        out[name]=(P,F)
    # dark mouth line just behind the lips
    P=[]
    for j,dy in enumerate((0.0016,-0.0016)):
        for i in range(nu):
            zz,_=S.z(float(x[i]*0.98),m['y']); P.append([x[i]*0.98,m['y']+dy,zz+0.0005])
    F=grid_faces(nu,2); out['tongue']=(np.array(P),np.concatenate([F,flipF(F)]))
    return out
def decal(S,origin,direction,su,sv,n=16):
    from mathutils import Vector
    h=S.bvh.ray_cast(Vector(origin),Vector(direction))
    if h[0] is None: return None
    p=np.array(h[0]); nr=np.array(h[1]); nr/=np.linalg.norm(nr)
    a=np.cross(nr,[0,0,1.0]); 
    if np.linalg.norm(a)<1e-4: a=np.array([1.0,0,0])
    a/=np.linalg.norm(a); b=np.cross(nr,a)
    P=[p+nr*0.0004]+[p+nr*0.0004+a*su*math.cos(2*math.pi*i/n)+b*sv*math.sin(2*math.pi*i/n) for i in range(n)]
    F=[]
    for i in range(n): F+=[0,1+i,1+(i+1)%n]
    F=np.array(F)
    return np.array(P),np.concatenate([F,flipF(F)])
def nostrils(S):
    Ps=[];Fs=[];o=0
    for s in (1,-1):
        d=decal(S,(s*0.0115,1.545,0.199),(0,1,-0.3),0.0058,0.0032)
        if d is None: continue
        Ps.append(d[0]); Fs.append(d[1]+o); o+=len(d[0])
    return np.concatenate(Ps),np.concatenate(Fs)

# ---- brows ------------------------------------------------------------
BROW=dict(path=[(0.028,1.669),(0.050,1.680),(0.078,1.686),(0.102,1.681),(0.120,1.670)],thick=(0.0105,0.0075,0.003),n=240,len=(0.005,0.0085),w=0.0011,seed=7)
def brows(S,b=BROW,side=1):
    rng=np.random.default_rng(b['seed']+(side>0))
    C=np.array(b['path']); 
    seg=np.r_[0,np.cumsum(np.linalg.norm(np.diff(C,axis=0),axis=1))]; L=seg[-1]
    def at(t):
        d=t*L; i=min(np.searchsorted(seg,d,side='right')-1,len(C)-2); f=(d-seg[i])/(seg[i+1]-seg[i]); return C[i]*(1-f)+C[i+1]*f, (C[i+1]-C[i])/np.linalg.norm(C[i+1]-C[i])
    P=[];F=[]
    for k in range(b['n']):
        t=rng.random()**0.85
        c,tan=at(t)
        th=np.interp(t,[0,0.45,1],b['thick'])
        off=(rng.random()-0.5)*th
        nrm=np.array([-tan[1],tan[0]])
        root=c+nrm*off
        # inner hairs grow upwards, the rest sweep outward along the brow
        ang=np.interp(t,[0,0.18,0.35,1],[1.25,0.9,0.35,0.12])+rng.normal(0,0.12)
        base_dir=np.arctan2(tan[1],tan[0])
        a=base_dir+ang*(1 if off<0.3*th else 0.6)
        dvec=np.array([math.cos(a),math.sin(a)])
        ln=rng.uniform(*b['len'])*(1-0.35*t)
        segs=4; i0=len(P)
        for j in range(segs+1):
            f=j/segs; p2=root+dvec*ln*f
            x=side*p2[0]; y=p2[1]
            zz,nr=S.z(x,y)
            if zz is None: zz=0.15
            lift=0.0006+0.0006*f
            w=b['w']*(1-f*0.85)
            perp=np.array([-dvec[1],dvec[0]])*w/2
            for sgn in (1,-1):
                P.append([side*(p2[0]+sgn*perp[0]),p2[1]+sgn*perp[1],zz+lift])
        for j in range(segs):
            a0=i0+2*j; F+=[a0,a0+2,a0+1,a0+1,a0+2,a0+3]
    P=np.array(P); F=np.array(F)
    if side<0: F=flipF(F)
    F=np.concatenate([F,flipF(F)])
    return P,F

# ---- beard ------------------------------------------------------------
def flipF(F): F=np.asarray(F).reshape(-1,3); return F[:,::-1].ravel()
def vnormals(P,F):
    F=np.asarray(F).reshape(-1,3); N=np.zeros_like(P)
    fn=np.cross(P[F[:,1]]-P[F[:,0]],P[F[:,2]]-P[F[:,0]])
    for k in range(3): np.add.at(N,F[:,k],fn)
    return N/np.maximum(np.linalg.norm(N,axis=1,keepdims=True),1e-12)
def weld_normals(P,F):
    key=np.round(P/1e-5).astype(np.int64); _,inv=np.unique(key,axis=0,return_inverse=True); inv=inv.ravel()
    Pu=np.zeros((inv.max()+1,3)); Pu[inv]=P
    Fu=inv[np.asarray(F).reshape(-1,3)]
    Nu=vnormals(Pu,Fu); return Nu[inv]
def uv_of(P):
    th=np.arctan2(P[:,0],P[:,2]); return np.stack([0.5+th/3.6,(P[:,1]-1.38)/0.24],1)
def shell(P,F,hw,off=0.0008):
    F=np.asarray(F).reshape(-1,3); N=weld_normals(P,F)
    x,y,z=P[:,0],P[:,1],P[:,2]
    ok=(hw>0.85)&(y<1.60)&(z>-0.035)
    mouth=(x/0.052)**2+((y-1.531)/0.0175)**2<1
    nose=(np.abs(x)<0.034)&(y>1.557)
    ok&=~mouth&~nose
    fm=ok[F].all(1); Fs=F[fm]
    used=np.unique(Fs); remap=-np.ones(len(P),int); remap[used]=np.arange(len(used))
    Ps=P[used]+N[used]*off
    return Ps,remap[Fs].ravel(),uv_of(P[used])
def mask(style,res=512):
    v,u=np.mgrid[0:res,0:res]/(res-1)
    th=(u-0.5)*3.6; y=1.38+v*0.24   # texel -> angle around the head, height
    a=np.abs(th)
    # the beard line: from below the ear (wide angle, 1.585) down to the mouth corner (0.33 rad, 1.53)
    line=np.interp(a,[0,0.33,0.75,1.2,1.6],[1.523,1.530,1.552,1.578,1.592])
    beard=sm(line+0.004,line-0.004,y)
    stache=sm(0.40,0.30,a)*sm(1.543,1.548,y)*sm(1.562,1.556,y)
    chin=sm(1.52,1.515,y)
    m=np.maximum(beard,stache)
    if style=='goatee':   # suya vendor: boxed chin and jaw beard, full moustache
        m=np.maximum(beard*sm(1.35,0.9,a),stache)
    soul=1-sm(0.08,0.02,a)*sm(1.513,1.518,y)*sm(1.523,1.519,y)*0.6
    return np.clip(m*soul,0,1)
def texture(style,density,length,seed,res=512):
    rng=np.random.default_rng(seed); m=mask(style,res)
    A=np.zeros((res,res)); n=int(res*res*density)
    ys=rng.integers(0,res,n); xs=rng.integers(0,res,n)
    keep=rng.random(n)<m[ys,xs]; ys=ys[keep]; xs=xs[keep]
    ang=rng.normal(-np.pi/2,0.5,len(xs))
    for L in range(length):
        xx=np.clip((xs+np.cos(ang)*L*0.7).astype(int),0,res-1); yy=np.clip((ys+np.sin(ang)*L*0.7).astype(int),0,res-1)
        A[yy,xx]=1
    img=np.zeros((res,res,4),np.uint8); img[...,:3]=255; img[...,3]=(A*255).astype(np.uint8)
    return img[::-1]   # PNG row 0 is the top (v=1)

# ---- writer ------------------------------------------------------------
CT={np.dtype('float32'):5126,np.dtype('uint16'):5123,np.dtype('uint32'):5125,np.dtype('uint8'):5121,np.dtype('int16'):5122,np.dtype('int8'):5120}
TYPES={1:'SCALAR',2:'VEC2',3:'VEC3',4:'VEC4',16:'MAT4'}
class Doc:
    def __init__(s,g,buf):
        s.g=g; s.buf=buf
        s.data={i:None for i in range(len(g['accessors']))}   # decoded lazily
        s.blobs=[]; s.g_orig_views=list(g['bufferViews'])
    def get(s,i):
        if s.data.get(i) is None: s.data[i]=acc(s.g,s.buf,i)
        return s.data[i]
    def add(s,arr,normalized=False):
        arr=np.ascontiguousarray(arr); 
        if arr.ndim==1: arr=arr.reshape(-1,1)
        a={'componentType':CT[arr.dtype],'count':int(arr.shape[0]),'type':TYPES[arr.shape[1]]}
        if normalized: a['normalized']=True
        s.g['accessors'].append(a); i=len(s.g['accessors'])-1; s.data[i]=arr; return i
    def mesh(s,prims,name=None):
        out=[]
        for p in prims:
            pr={'attributes':{'POSITION':s.add(p['P'].astype(np.float32)),'NORMAL':s.add(p['N'].astype(np.float32))},'material':p['mat'],
                'indices':s.add(np.asarray(p['F']).astype(np.uint16 if len(p['P'])<65536 else np.uint32).ravel())}
            if 'UV' in p: pr['attributes']['TEXCOORD_0']=s.add(p['UV'].astype(np.float32))
            out.append(pr)
        m={'primitives':out}
        if name: m['name']=name
        s.g['meshes'].append(m); return len(s.g['meshes'])-1
    def image(s,png_bytes):
        s.blobs.append(png_bytes); s.g.setdefault('images',[]).append({'mimeType':'image/png','bufferView':('blob',len(s.blobs)-1)})
        return len(s.g['images'])-1
    def pack(s):
        g=s.g
        # accessors still referenced
        used=set()
        for m in g['meshes']:
            for p in m['primitives']:
                used|=set(p['attributes'].values()); 
                if 'indices' in p: used.add(p['indices'])
                for t in p.get('targets',[]): used|=set(t.values())
        for sk in g.get('skins',[]):
            if 'inverseBindMatrices' in sk: used.add(sk['inverseBindMatrices'])
        for an in g.get('animations',[]):
            for sm in an['samplers']: used|={sm['input'],sm['output']}
        # drop meshes nobody points at
        live=sorted({n['mesh'] for n in g['nodes'] if 'mesh' in n})
        mm={o:i for i,o in enumerate(live)}; g['meshes']=[g['meshes'][o] for o in live]
        for n in g['nodes']:
            if 'mesh' in n: n['mesh']=mm[n['mesh']]
        used=set()
        for m in g['meshes']:
            for p in m['primitives']:
                used|=set(p['attributes'].values())
                if 'indices' in p: used.add(p['indices'])
                for t in p.get('targets',[]): used|=set(t.values())
        for sk in g.get('skins',[]): used.add(sk['inverseBindMatrices'])
        for an in g.get('animations',[]):
            for sm in an['samplers']: used|={sm['input'],sm['output']}
        order=sorted(used); am={o:i for i,o in enumerate(order)}
        out=io.BytesIO(); views=[]; accs=[]
        idx_set=set(); vert_set=set()
        for m in g['meshes']:
            for p in m['primitives']:
                vert_set|=set(p['attributes'].values()); idx_set.add(p.get('indices'))
                for t in p.get('targets',[]): vert_set|=set(t.values())
        for o in order:
            a=dict(g['accessors'][o]); arr=s.get(o)
            if arr.ndim==1: arr=arr.reshape(-1,1)
            dt={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32,5122:np.int16,5120:np.int8}[a['componentType']]
            arr=np.ascontiguousarray(arr.astype(dt))
            pad=(-out.tell())%4; out.write(b'\0'*pad)
            v={'buffer':0,'byteOffset':out.tell(),'byteLength':arr.nbytes}
            if o in idx_set: v['target']=34963
            elif o in vert_set: v['target']=34962
            out.write(arr.tobytes()); views.append(v)
            a.pop('byteOffset',None); a['bufferView']=len(views)-1; a['count']=int(arr.shape[0])
            if a['type'] in ('VEC3','VEC2','SCALAR','VEC4') and o in vert_set and a['componentType']==5126:
                a['min']=arr.min(0).astype(float).round(6).tolist(); a['max']=arr.max(0).astype(float).round(6).tolist()
            accs.append(a)
        g['accessors']=accs
        def remap(d):
            for k in d: d[k]=am[d[k]]
        for m in g['meshes']:
            for p in m['primitives']:
                remap(p['attributes'])
                if 'indices' in p: p['indices']=am[p['indices']]
                for t in p.get('targets',[]): remap(t)
        for sk in g.get('skins',[]): sk['inverseBindMatrices']=am[sk['inverseBindMatrices']]
        for an in g.get('animations',[]):
            for sm in an['samplers']: sm['input']=am[sm['input']]; sm['output']=am[sm['output']]
        for im in g.get('images',[]):
            bv=im.get('bufferView')
            if isinstance(bv,tuple):
                blob=s.blobs[bv[1]]
            else:
                ov=s.g_orig_views[bv]; blob=s.buf[ov.get('byteOffset',0):ov.get('byteOffset',0)+ov['byteLength']]
            pad=(-out.tell())%4; out.write(b'\0'*pad)
            views.append({'buffer':0,'byteOffset':out.tell(),'byteLength':len(blob)}); out.write(blob); im['bufferView']=len(views)-1
        g['bufferViews']=views
        data=out.getvalue()
        g['buffers']=[{'byteLength':len(data),'uri':'data:application/octet-stream;base64,'+base64.b64encode(data).decode()}]
        return g

# ---- build ------------------------------------------------------------
ROOT=Path(__file__).resolve().parents[1]
DST=ROOT/'dist/assets/characters/efe.gltf.json'
SRC=ROOT/'tools/.efe-pre-v53.gltf.json'
SRC.write_bytes(subprocess.check_output(['git','-C',str(ROOT),'show','61dcd87:dist/assets/characters/efe.gltf.json']))
g,buf=load(SRC); doc=Doc(g,buf)
N_=g['nodes']; body=[n for n in N_ if n.get('name')=='Body'][0]; prim=g['meshes'][body['mesh']]['primitives'][0]
P0=acc(g,buf,prim['attributes']['POSITION']).astype(float); N0=acc(g,buf,prim['attributes']['NORMAL'])
J=acc(g,buf,prim['attributes']['JOINTS_0']); Wt=acc(g,buf,prim['attributes']['WEIGHTS_0']); F0=acc(g,buf,prim['indices']).ravel()
hw=((np.isin(J,[5,6]))*Wt).sum(1); nw=((J==4)*Wt).sum(1)
K=dict(slim=0.05,jawback=0.02,chin_down=0.010,chin_fwd=0.018)
P=nose(neck(sculpt(P0,hw,K),nw),hw)
x_,y_,z_=P[:,0],P[:,1],P[:,2]
reg=(hw>0.9)*(z_>0.03)*sm(1.47,1.50,y_)*sm(1.73,1.70,y_)
P=smooth(P,F0,reg,4,0.35)
P=carve(P,hw,E)
def eyering(P):
    m=np.zeros(len(P))
    for s_ in (1,-1):
        dx=P[:,0]-s_*E['cx']; dy=P[:,1]-E['cy']; rho=np.sqrt((dx/E['Rx'])**2+(dy/E['Ry'])**2)
        m=np.maximum(m,sm(0.55,0.8,rho)*sm(1.5,1.1,rho))
    return m*(P[:,2]>0.05)
P=smooth(P,F0,eyering(P),3,0.4)
S=Surf(P,F0)
# skin normals: recomputed where the surface moved (and one ring around it)
moved=np.linalg.norm(P-P0,axis=1)>1e-7
Fm=F0.reshape(-1,3); ring=np.zeros(len(P),bool); ring[np.unique(Fm[moved[Fm].any(1)])]=True
Nn=weld_normals(P,F0); N1=N0.copy(); N1[ring]=Nn[ring]
doc.data[prim['attributes']['POSITION']]=P.astype(np.float32); doc.data[prim['attributes']['NORMAL']]=N1.astype(np.float32)
# Head space
W,par=world_mats(g); hi=[i for i,n in enumerate(N_) if n.get('name')=='Head'][0]
ibm=acc(g,buf,g['skins'][0]['inverseBindMatrices']); jh=g['skins'][0]['joints'].index(hi); Hinv=ibm[jh].reshape(4,4).T  # bind-pose skin space -> Head joint space
def tolocal(Pw,Nw=None):
    Pl=(Hinv[:3,:3]@np.asarray(Pw).T).T+Hinv[:3,3]
    return Pl
MAT={}
for i,m in enumerate(g['materials']): MAT.setdefault(m['name'],i)
def part(Pw,F,mat,UV=None):
    Pl=tolocal(Pw); Nl=weld_normals(Pl,F) if mat!='hair' else vnormals(Pl,F)
    d={'P':Pl,'N':Nl,'F':F,'mat':mat if isinstance(mat,int) else MAT[mat]}
    if UV is not None: d['UV']=UV
    return d
def setnode(i,prims,name=None):
    n=N_[i]
    for k in ('translation','rotation','scale','matrix'): n.pop(k,None)
    if prims: n['mesh']=doc.mesh(prims)
    else: n.pop('mesh',None)
    if name: n['name']=name
# left = -x side (node group 1..9), right = +x (12..20)
for side,base in ((-1,1),(1,12)):
    ep=eye_parts(E,side,S)
    setnode(base+0,[part(*ep['eye_white'],'eye_white')]); setnode(base+1,[part(*ep['iris'],'iris')]); setnode(base+2,[part(*ep['pupil'],'pupil')])
    setnode(base+3,[part(*ep['eye_hi'],'eye_hi')]); setnode(base+5,[part(*ep['lid'],'skin')],'face_lid'); setnode(base+6,None)
    setnode(base+7,[part(*ep['lash'],'hair')],'face_lash'); Pb,Fb=brows(S,side=side); setnode(base+8,[part(Pb,Fb,'hair')],'face_brow')
    N_[base+4].pop('translation',None)
for i in (25,26,27): 
    for k in ('translation','rotation','scale'): N_[i].pop(k,None)
lp=lips(S); Pn,Fn=nostrils(S)
setnode(28,[part(Pn,Fn,'tongue')],'face_nostrils'); setnode(29,None)
setnode(30,[part(*lp['lip_top'],'lip_top')],'face_lip_top'); setnode(31,[part(*lp['lip'],'lip')],'face_lip'); setnode(32,[part(*lp['tongue'],'tongue')],'face_mouth')
# beard shells with stubble textures
Ps,Fs,UV=shell(P,F0,hw)
def beardmat(style,density,length,seed):
    img=texture(style,density,length,seed); b=io.BytesIO(); Image.fromarray(img).save(b,'PNG',optimize=True)
    ii=doc.image(b.getvalue()); g.setdefault('samplers',[]).append({'magFilter':9729,'minFilter':9987,'wrapS':33071,'wrapT':33071})
    g.setdefault('textures',[]).append({'source':ii,'sampler':len(g['samplers'])-1})
    g['materials'].append({'name':'beard','alphaMode':'MASK','alphaCutoff':0.5,'pbrMetallicRoughness':{'baseColorFactor':[0.03,0.024,0.02,1],'baseColorTexture':{'index':len(g['textures'])-1},'metallicFactor':0,'roughnessFactor':0.85}})
    return len(g['materials'])-1
UVf=UV.copy(); UVf[:,1]=1-UVf[:,1]   # glTF UV origin is top-left
newnodes=[]
for name,(st,d,l,seed) in {'face_beard_stubble':('stubble',0.13,2,3),'face_beard_boxed':('goatee',0.30,3,5)}.items():
    mi=beardmat(st,d,l,seed); N_.append({'name':name,'mesh':doc.mesh([part(Ps,Fs,mi,UVf)])}); newnodes.append(len(N_)-1)
# a second hoop on the other ear
ear=N_[23]; em=g['meshes'][ear['mesh']]['primitives'][0]
EP=acc(g,buf,em['attributes']['POSITION']).astype(float); EN=acc(g,buf,em['attributes']['NORMAL']).astype(float); EF=acc(g,buf,em['indices']).ravel()
ml=np.diag([-1,1,1])
Ml=local(ear); Pw=(Ml[:3,:3]@EP.T).T+Ml[:3,3]; Pw=Pw@ml.T; Nw=(EN@Ml[:3,:3].T)@ml.T
N_.append({'name':'face_hoop','mesh':doc.mesh([{'P':Pw,'N':Nw,'F':flipF(EF),'mat':em['material']}])}); newnodes.append(len(N_)-1)
N_[hi]['children']+=newnodes
root=[n for n in N_ if n.get('name')=='Efe'][0]
root.setdefault('extras',{})['faces53']={'tool':'tools/faces_from_blender.py','eyes':E,'sculpt':K,'parts':['face_lid','face_lash','face_brow','face_lip_top','face_lip','face_mouth','face_nostrils','face_beard_stubble','face_beard_boxed','face_hoop']}
doc.pack()
s=json.dumps(g,separators=(',',':'))
open(DST,'w').write(s); SRC.unlink(); print('wrote',DST,len(s)//1024,'KB')

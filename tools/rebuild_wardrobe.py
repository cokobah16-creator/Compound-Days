"""Rebuild v19 wardrobe on the supplied 27-joint bind pose.

Run from any directory: python tools/rebuild_wardrobe.py
Requires Python, numpy and Pillow. Existing source textures, skeleton and slot
metadata are retained. Outputs are embedded-buffer glTF 2.0 JSON files.
These are authored meshes, not image-to-3D output or simulation cloth.
"""
import base64, copy, io, json
from pathlib import Path
import numpy as np
from PIL import Image
from mesh_surface import surface_net

ROOT=Path(__file__).resolve().parents[1]
WARD=ROOT/'assets/wardrobe'
TYPES={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
DTYPES={5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1'}

def smooth(a,b,x):
    t=np.clip((x-a)/(b-a),0,1); return t*t*(3-2*t)

def smin(a,b,k):
    h=np.maximum(k-np.abs(a-b),0)/k
    return np.minimum(a,b)-h*h*k*.25

def normals(v,t):
    n=np.zeros_like(v)
    f=np.cross(v[t[:,1]]-v[t[:,0]],v[t[:,2]]-v[t[:,0]])
    for j in range(3): np.add.at(n,t[:,j],f)
    return n/np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-12)

def relax(v,t):
    edges=np.unique(np.sort(np.concatenate([t[:,[0,1]],t[:,[1,2]],t[:,[2,0]]]),axis=1),axis=0)
    a,b=edges.T;deg=np.bincount(np.r_[a,b],minlength=len(v))[:,None]
    for strength in [.42,-.43,.42,-.43]:
        total=np.zeros_like(v);np.add.at(total,a,v[b]);np.add.at(total,b,v[a]);v=v+strength*(total/np.maximum(deg,1)-v)
    return v

class Asset:
    def __init__(self,name):
        self.name=name; self.path=WARD/(name+'.gltf.json')
        self.d=json.loads(self.path.read_text())
        self.buf=bytearray(base64.b64decode(self.d['buffers'][0]['uri'].split(',')[1]))
    def array(self,i):
        a=self.d['accessors'][i]; b=self.d['bufferViews'][a['bufferView']]
        dt=np.dtype(DTYPES[a['componentType']]); n=TYPES[a['type']]
        off=b.get('byteOffset',0)+a.get('byteOffset',0)
        return np.ndarray((a['count'],n),dt,buffer=self.buf,offset=off,
            strides=(b.get('byteStride',dt.itemsize*n),dt.itemsize)).copy()
    def blob(self,raw,target=None):
        self.buf.extend(b'\0'*((-len(self.buf))%4)); start=len(self.buf); self.buf.extend(raw)
        b={'buffer':0,'byteOffset':start,'byteLength':len(raw)}
        if target: b['target']=target
        self.d.setdefault('bufferViews',[]).append(b); return len(self.d['bufferViews'])-1
    def append(self,a,component,kind,target=None):
        a=np.asarray(a,dtype=DTYPES[component]).reshape(-1,TYPES[kind])
        d={'bufferView':self.blob(a.tobytes(),target),'componentType':component,'count':len(a),'type':kind}
        if kind=='VEC3': d.update(min=a.min(0).tolist(),max=a.max(0).tolist())
        self.d.setdefault('accessors',[]).append(d);return len(self.d['accessors'])-1
    def mesh(self,v,t,material,weight_fn=None,uv=None):
        a={'POSITION':self.append(v,5126,'VEC3',34962),'NORMAL':self.append(normals(v,t),5126,'VEC3',34962)}
        if uv is not None: a['TEXCOORD_0']=self.append(uv,5126,'VEC2',34962)
        if weight_fn:
            j,w=weight_fn(v);a.update(JOINTS_0=self.append(j,5123,'VEC4',34962),WEIGHTS_0=self.append(w,5126,'VEC4',34962))
        return {'attributes':a,'indices':self.append(t,5125,'SCALAR',34963),'material':material,'mode':4}
    def replace_garment(self,primitives):
        ex=copy.deepcopy(next(n['extras'] for n in self.d['nodes'] if 'extras' in n))
        ex['visualRevision']=19
        nodes=copy.deepcopy(self.d['nodes'][:27]); self.d['skins']=[self.d['skins'][0]]
        self.d['meshes']=[]
        for i,p in enumerate(primitives):
            self.d['meshes'].append({'name':self.name+('_detail' if i else '_shell'),'primitives':[p]})
            nodes.append({'name':self.name+('_detail' if i else '_shell'),'mesh':i,'skin':0})
        nodes.append({'name':self.name+'_v19','children':[26]+list(range(27,len(nodes))),'extras':ex})
        self.d['nodes']=nodes;self.d['scenes']=[{'nodes':[len(nodes)-1]}];self.d['scene']=0
    def save(self):
        live=[i for i,m in enumerate(self.d['meshes']) if m['primitives']]
        meshmap={i:j for j,i in enumerate(live)}
        for node in self.d['nodes']:
            if 'mesh' in node:node['mesh']=meshmap[node['mesh']]
        self.d['meshes']=[self.d['meshes'][i] for i in live]
        usedmat=sorted({p['material'] for m in self.d['meshes'] for p in m['primitives']})
        matmap={i:j for j,i in enumerate(usedmat)}
        self.d['materials']=[self.d['materials'][i] for i in usedmat]
        for m in self.d['meshes']:
            for p in m['primitives']:p['material']=matmap[p['material']]
        refs=[]
        def textures_in(d):
            for k,v in d.items():
                if isinstance(v,dict):
                    if k.endswith('Texture') and 'index' in v:refs.append(v)
                    else:textures_in(v)
        for m in self.d['materials']:textures_in(m)
        live_tex=sorted({r['index'] for r in refs});texmap={i:j for j,i in enumerate(live_tex)}
        self.d['textures']=[self.d['textures'][i] for i in live_tex]
        for r in refs:r['index']=texmap[r['index']]
        live_img=sorted({t['source'] for t in self.d['textures']});imgmap={i:j for j,i in enumerate(live_img)}
        self.d['images']=[self.d['images'][i] for i in live_img]
        for t in self.d['textures']:t['source']=imgmap[t['source']]
        # Repack only live geometry, skin matrices and embedded image data.
        oldbuf=self.buf; oldviews=self.d['bufferViews']; oldacc=self.d['accessors']
        used=set()
        for m in self.d['meshes']:
            for p in m['primitives']:used.update(p['attributes'].values());used.add(p['indices'])
        for s in self.d.get('skins',[]): used.add(s['inverseBindMatrices'])
        mapping={}; views=[]; acc=[]; buf=bytearray()
        def rawview(raw,target=None):
            buf.extend(b'\0'*((-len(buf))%4)); v={'buffer':0,'byteOffset':len(buf),'byteLength':len(raw)}
            if target:v['target']=target
            buf.extend(raw);views.append(v);return len(views)-1
        for idx in sorted(used):
            a=copy.deepcopy(oldacc[idx]); raw=self.array(idx).tobytes()
            a['bufferView']=rawview(raw,oldviews[a['bufferView']].get('target'));a.pop('byteOffset',None)
            mapping[idx]=len(acc);acc.append(a)
        for m in self.d['meshes']:
            for p in m['primitives']:
                p['attributes']={k:mapping[i] for k,i in p['attributes'].items()};p['indices']=mapping[p['indices']]
        for s in self.d.get('skins',[]):s['inverseBindMatrices']=mapping[s['inverseBindMatrices']]
        for image in self.d.get('images',[]):
            if 'bufferView' in image:
                v=oldviews[image['bufferView']]; image['bufferView']=rawview(oldbuf[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']])
        self.d['bufferViews']=views; self.d['accessors']=acc
        self.d['buffers']=[{'byteLength':len(buf),'uri':'data:application/octet-stream;base64,'+base64.b64encode(buf).decode()}]
        self.d['asset']['generator']='Compound Days wardrobe v19 — connected cloth shells'
        self.path.write_text(json.dumps(self.d,separators=(',',':')))
        print(self.name, 'vertices',sum(a['count'] for a in acc if a['type']=='VEC3')//2,
              'triangles',sum(acc[p['indices']]['count']//3 for m in self.d['meshes'] for p in m['primitives']))

def pack_weights(w):
    j=np.argsort(w,axis=1)[:,-4:]; v=np.take_along_axis(w,j,axis=1)
    v[v<1e-7]=0
    j[v==0]=0
    return j,v/np.maximum(v.sum(1,keepdims=True),1e-12)

def shirt_weights(v):
    x,y,z=v.T; w=np.zeros((len(v),27))
    spine=smooth(.91,1.22,y); w[:,0]=1-spine;w[:,3]=spine
    arm=smooth(.135,.29,np.abs(x))*smooth(.98,1.08,y)
    elbow=1-smooth(1.015,1.105,y)
    w*=1-arm[:,None]
    for sign,upper,fore in [(1,8,9),(-1,13,14)]:
        mask=(x*sign>0); w[:,upper]+=mask*arm*(1-elbow);w[:,fore]+=mask*arm*elbow
    return pack_weights(w)

def pants_weights(v):
    x,y,z=v.T; w=np.zeros((len(v),27));hip=smooth(.73,.91,y)
    w[:,0]=hip;knee=1-smooth(.40,.57,y)
    for sign,upper,lower in [(1,17,18),(-1,22,23)]:
        a=smooth(-.018,.018,x*sign)*(1-hip)
        w[:,upper]+=a*(1-knee);w[:,lower]+=a*knee
    return pack_weights(w)

def shirt_field(kind):
    hem={'tee':.765,'ankara_shirt':.845,'kaftan_tunic':.535}[kind]
    short=kind!='kaftan_tunic'
    def field(p):
        x,y,z=p.T
        widths=np.interp(y,[hem,.85,1.07,1.24,1.37],[.222,.224,.197,.208,.16])
        depths=np.interp(y,[hem,.90,1.20,1.37],[.143,.148,.136,.103])
        # Squircle body has a readable broad front and restrained cloth creases.
        radial=((abs(x)/widths)**3.2+(abs(z)/depths)**3.2)**(1/3.2)
        crease=.0018*np.sin(x*70+y*22)*smooth(1.08,.80,y)
        body=(radial-1)*.14+crease
        top=1.37-.31*abs(x)
        body=np.maximum.reduce([body,hem-y,y-top])
        for sign in [-1,1]:
            a=np.array([sign*.175,1.288,0.]); b=np.array([sign*(.285 if short else .267),1.075 if kind=='tee' else 1.15 if short else .922,0.])
            d=b-a; length=np.linalg.norm(d); u=d/length; q=p-a; t=q@u
            radius=np.interp(t,[0,length],[.085 if kind=='tee' else .078,.079 if kind=='tee' else .072])
            side=np.linalg.norm(q-t[:,None]*u,axis=1)-radius
            sleeve=np.maximum.reduce([side,-t-.022,t-length])
            body=smin(body,sleeve,.035)
        # A single sloping shoulder line clips the entire sleeve/torso union.
        # Without it the circular sleeve section rises above the shoulder seam.
        body=np.maximum(body,y-(1.36-.32*abs(x)))
        # Open neck in the joined shell, no detached shoulder balls.
        hole=.067-np.sqrt(x*x+(z/.93)**2)
        body=np.maximum(body,np.minimum(hole,y-1.265))
        return body
    return field,hem

def tube(points,r=.0025,n=8):
    points=np.asarray(points);vs=[];ts=[]
    for i,p in enumerate(points):
        tangent=points[min(i+1,len(points)-1)]-points[max(0,i-1)];tangent/=max(np.linalg.norm(tangent),1e-9)
        a=np.cross(tangent,[0,0,1])
        if np.linalg.norm(a)<.01:a=np.cross(tangent,[0,1,0])
        a/=np.linalg.norm(a);b=np.cross(tangent,a)
        for j in range(n):vs.append(p+r*(np.cos(j*2*np.pi/n)*a+np.sin(j*2*np.pi/n)*b))
        if i:
            for j in range(n):
                u=(i-1)*n+j;v=(i-1)*n+(j+1)%n;w=i*n+j;q=i*n+(j+1)%n
                ts.extend([[u,v,w],[v,q,w]])
    return np.asarray(vs),np.asarray(ts)

def join(parts):
    vs=[];ts=[];n=0
    for v,t in parts:vs.append(v);ts.append(t+n);n+=len(v)
    return np.concatenate(vs),np.concatenate(ts)

def neutral_cloth(a,denim=False):
    """Neutral micro-weave: the material tint supplies colour exactly once."""
    rng=np.random.default_rng(19);n=256;y,x=np.mgrid[:n,:n]
    weave=((x+y)%5==0)*(-7 if denim else -3)
    v=np.clip(245+weave+rng.normal(0,1.3,(n,n)),0,255).astype(np.uint8)
    out=io.BytesIO();Image.fromarray(np.repeat(v[:,:,None],3,2)).save(out,format='PNG')
    a.d['images']=[{'bufferView':a.blob(out.getvalue()),'mimeType':'image/png'}]
    a.d['textures']=[{'source':0,'sampler':0}]
    for m in a.d['materials']:
        p=m.get('pbrMetallicRoughness',{})
        if 'baseColorTexture' in p:p['baseColorTexture']={'index':0,'extensions':{'KHR_texture_transform':{'scale':[5,5]}}}

def build_shirt(name):
    a=Asset(name);field,hem=shirt_field(name)
    if name!='ankara_shirt':neutral_cloth(a)
    v,t=surface_net(field,[-.41,hem-.025,-.21],[.41,1.405,.21],.016)
    v=relax(v,t)
    # Arc-length-like wrap, vertical repeat proportional to real garment height.
    uv=np.column_stack([v[:,0]*2+.5,v[:,1]*2])
    ps=[a.mesh(v,t,0,shirt_weights,uv)]
    collar=[]
    theta=np.linspace(0,2*np.pi,49)
    if name=='tee':
        collar.append(tube(np.column_stack([.072*np.sin(theta),1.367-.31*np.abs(.072*np.sin(theta)),.068*np.cos(theta)]),.007,8))
        detail={'name':'tee_rib','pbrMetallicRoughness':{'baseColorFactor':[.24,.36,.56,1],'metallicFactor':0,'roughnessFactor':.94}}
        a.d['materials'].append(detail);mi=len(a.d['materials'])-1
    elif name=='ankara_shirt':
        mi=1
        if len(a.d['materials'])<3:a.d['materials'].append({'name':'button','pbrMetallicRoughness':{'baseColorFactor':[.8,.75,.62,1],'metallicFactor':0,'roughnessFactor':.6}})
        collar.append(tube([[.012,1.285,.123],[.012,1.20,.142],[.012,1.08,.15],[.012,.88,.15]],.004))
        flaps=[]
        for sign in [-1,1]:
            fv=np.array([[sign*.068,1.355,.025],[sign*.122,1.30,.10],[sign*.073,1.252,.145],[sign*.008,1.305,.128]])
            ft=np.array([[0,1,2],[0,2,3]])
            if sign>0:ft=ft[:,[0,2,1]]
            flaps.append((fv,ft))
        fv,ft=join(flaps);ps.append(a.mesh(fv,ft,0,shirt_weights,np.column_stack([fv[:,0]*2+.5,fv[:,1]*2])))
        buttons=join([tube([[0,y,z],[0,y,z+.004]],.0055,8) for y,z in [(1.20,.142),(1.08,.15),(.96,.151)]])
        ps.append(a.mesh(*buttons,2,shirt_weights))
    else:
        mi=1
        # A short upright cloth collar, in the same fabric as the tunic.
        rings=[]
        for y in [1.347,1.360,1.373,1.386]:
            rings.append(tube(np.column_stack([.072*np.sin(theta),np.full_like(theta,y),.068*np.cos(theta)]),.007,8))
        cv,ct=join(rings);ps.append(a.mesh(cv,ct,0,shirt_weights,np.column_stack([cv[:,0]*2+.5,cv[:,1]*2])))
        # Restrained stitched placket; it lies on the front surface, not floating.
        for x in [-.018,.018]:collar.append(tube([[x,1.31,.115],[x,1.23,.14],[x,1.10,.148]],.002))
        collar.append(tube([[-.018,1.10,.148],[.018,1.10,.148]],.002))
    dv,dt=join(collar);ps.append(a.mesh(dv,dt,mi,shirt_weights))
    a.replace_garment(ps);a.save()

def build_pants(name):
    a=Asset(name);wide=name=='ankara_trousers';hem=.13 if name=='jeans' else .16
    if not wide:neutral_cloth(a,denim=name=='jeans')
    def field(p):
        x,y,z=p.T
        width=np.interp(y,[.7,.93],[.194,.19]); depth=.124
        hip=(((abs(x)/width)**3+(abs(z)/depth)**3)**(1/3)-1)*.12
        hip=np.maximum.reduce([hip,.70-y,y-.96])
        legs=[]
        for sign in [-1,1]:
            centre=sign*np.interp(y,[hem,.45,.76],[.104,.101,.099])
            rx=np.interp(y,[hem,.47,.78],[.091 if wide else .067,.094 if wide else .08,.101])
            rz=np.interp(y,[hem,.47,.78],[.108 if wide else .079,.109 if wide else .090,.121])
            f=(np.sqrt(((x-centre)/rx)**2+(z/rz)**2)-1)*.09
            legs.append(np.maximum.reduce([f,hem-y,y-.85]))
        return smin(hip,np.minimum(*legs),.025)
    v,t=surface_net(field,[-.26,hem-.02,-.16],[.26,.99,.16],.014)
    v=relax(v,t)
    uv=np.column_stack([v[:,0]*2+.5,v[:,1]*2.0])
    ps=[a.mesh(v,t,0,pants_weights,uv)]
    if name=='jeans':
        a.d['materials'][0]['pbrMetallicRoughness']['baseColorFactor']=[.12,.23,.37,1]
        a.d['materials'].append({'name':'denim_stitch','pbrMetallicRoughness':{'baseColorFactor':[.40,.40,.34,1],'roughnessFactor':1,'metallicFactor':0}})
        parts=[]
        for sign in [-1,1]:
            points=[]
            for y in np.linspace(.16,.74,20):
                centre=np.interp(y,[hem,.45,.76],[.104,.101,.099]);rx=np.interp(y,[hem,.47,.78],[.067,.08,.101]);rz=np.interp(y,[hem,.47,.78],[.079,.090,.121])
                points.append([sign*(centre+.75*rx),y,rz*np.sqrt(1-.75**2)+.001])
            parts.append(tube(points,.0012,6))
        dv,dt=join(parts);ps.append(a.mesh(dv,dt,1,pants_weights))
    a.replace_garment(ps);a.save()

def build_taper():
    a=Asset('hair_lowtaper');rng=np.random.default_rng(1901)
    for mesh in a.d['meshes']:
        for pr in mesh['primitives']:
            v=a.array(pr['attributes']['POSITION']); mi=pr['material']; name=a.d['materials'][mi]['name']
            if name not in ['hair','beard']:continue
            angle=np.arctan2(v[:,0],v[:,2]);lo=.155 if name=='hair' else .016;span=.31 if name=='hair' else .078
            uv=np.column_stack([angle/(2*np.pi)+.5,(v[:,1]-lo)/span])
            pr['attributes']['TEXCOORD_0']=a.append(uv,5126,'VEC2',34962)
            n=512; yy,xx=np.mgrid[0:n,0:n];u=xx/(n-1);h=yy/(n-1)
            front=np.cos((u-.5)*2*np.pi)
            if name=='hair':
                threshold=.31+.16*np.clip(front,0,1)
                density=.055+.945*smooth(threshold-.27,threshold+.12,h)
            else:density=.56*smooth(.02,.32,h)*smooth(1.05,.71,h)
            # Alpha-test grain fades to the actual selected skin beneath.
            noise=rng.random((n,n));rgba=np.zeros((n,n,4),np.uint8)
            grain=(188+rng.random((n,n))*67).astype(np.uint8);rgba[:,:,:3]=grain[:,:,None];rgba[:,:,3]=(noise<density)*255
            out=io.BytesIO();Image.fromarray(rgba).save(out,format='PNG')
            a.d.setdefault('images',[]).append({'bufferView':a.blob(out.getvalue()),'mimeType':'image/png'})
            a.d.setdefault('textures',[]).append({'source':len(a.d['images'])-1,'sampler':0})
            m=a.d['materials'][mi];m['alphaMode']='MASK';m['alphaCutoff']=.5
            pbr=m['pbrMetallicRoughness'];pbr['baseColorTexture']={'index':len(a.d['textures'])-1};pbr['baseColorFactor']=[.11,.075,.052,1]
    # This look has no facial-hair selector. Remove the inherited hard beard
    # band instead of silently imposing a chin strap on every low-taper wearer.
    for mesh in a.d['meshes']:
        mesh['primitives']=[p for p in mesh['primitives'] if a.d['materials'][p['material']]['name']!='beard']
    # glTF meshes must have at least one primitive; remove unused beard nodes.
    valid={i for i,m in enumerate(a.d['meshes']) if m['primitives']}
    for node in a.d['nodes']:
        if node.get('mesh') not in valid:node.pop('mesh',None)
    a.save()

if __name__=='__main__':
    for n in ['tee','ankara_shirt','kaftan_tunic']:build_shirt(n)
    for n in ['jeans','ankara_trousers','kaftan_trousers']:build_pants(n)
    build_taper()

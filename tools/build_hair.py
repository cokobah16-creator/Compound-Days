"""Author three static hair assets in the existing character's Head-joint space.

Run with Python + NumPy. The scalp boundary comes from the fitted low-taper
asset; strands are merged into a few primitives. No image-to-3D service needed.
Hair moves with the head; this does not implement hair physics.
"""
import base64
import json
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
WARD = ROOT / 'assets/wardrobe'
RNG = np.random.default_rng(2107)


def unit(v):
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-9)


def normals(v, t):
    n = np.zeros_like(v)
    f = np.cross(v[t[:, 1]] - v[t[:, 0]], v[t[:, 2]] - v[t[:, 0]])
    for i in range(3):
        np.add.at(n, t[:, i], f)
    return unit(n)


def join(parts):
    vs, ts, offset = [], [], 0
    for v, t in parts:
        vs.append(v); ts.append(t + offset); offset += len(v)
    return np.concatenate(vs), np.concatenate(ts)


def tube(points, radii=.006, sides=5):
    p = np.asarray(points, dtype=float)
    tangents = unit(np.gradient(p, axis=0))
    radius = np.broadcast_to(radii, (len(p),))
    vertices, faces = [], []
    previous = None
    for i, (c, tangent) in enumerate(zip(p, tangents)):
        ref = np.array([0., 0., 1.]) if abs(tangent[2]) < .9 else np.array([0., 1., 0.])
        a = unit(np.cross(tangent, ref))
        if previous is not None and np.dot(a, previous) < 0: a = -a
        b = np.cross(tangent, a); previous = a
        for j in range(sides):
            th = j * np.pi * 2 / sides
            vertices.append(c + radius[i] * (np.cos(th) * a + np.sin(th) * b))
        if i:
            for j in range(sides):
                x = (i - 1) * sides + j; y = (i - 1) * sides + (j + 1) % sides
                z = i * sides + j; w = i * sides + (j + 1) % sides
                faces += [[x, y, z], [y, w, z]]
    # Small closed tips avoid black open ends in the turnaround.
    faces += [[0, j + 1, j] for j in range(1, sides - 1)]
    a = (len(p) - 1) * sides
    faces += [[a, a + j, a + j + 1] for j in range(1, sides - 1)]
    return np.asarray(vertices), np.asarray(faces)


def bezier(points, samples=30):
    t = np.linspace(0, 1, samples)[:, None]
    a, b, c, d = np.asarray(points)
    return (1-t)**3*a + 3*(1-t)**2*t*b + 3*(1-t)*t*t*c + t**3*d


def scalp():
    d = json.loads((WARD / 'hair_lowtaper.gltf.json').read_text())
    raw = base64.b64decode(d['buffers'][0]['uri'].split(',')[1])
    def array(i):
        a = d['accessors'][i]; b = d['bufferViews'][a['bufferView']]
        dtype = {5126:'<f4', 5125:'<u4', 5123:'<u2'}[a['componentType']]
        n = {'VEC3':3, 'SCALAR':1}[a['type']]
        return np.frombuffer(raw, dtype=dtype, count=a['count']*n,
            offset=b.get('byteOffset', 0)+a.get('byteOffset', 0)).reshape(-1, n).copy()
    p = d['meshes'][0]['primitives'][0]
    return array(p['attributes']['POSITION']), array(p['indices']).reshape(-1, 3)


CAP_V, CAP_T = scalp()
CENTER = np.array([0., .225, -.009])


def fitted_point(phi, polar):
    direction = np.array([np.sin(phi)*np.sin(polar), np.cos(polar), np.cos(phi)*np.sin(polar)])
    # Closest angular vertex on the actual fitted cap, with no guessed head size.
    i = np.argmax(unit(CAP_V-CENTER) @ direction)
    return CAP_V[i].astype(float)


def parted_cap():
    # Clip triangles on the exact part line rather than dropping whole triangles.
    def clip(poly, axis, value, sign):
        out=[]
        for a,b in zip(poly,poly[1:]+poly[:1]):
            da=sign*(a[axis]-value);db=sign*(b[axis]-value)
            if da>=0:out.append(a)
            if (da>=0)!=(db>=0):out.append(a+(b-a)*da/(da-db))
        return out
    vertices=[];faces=[]
    regions=[[(1,.32,-1)],[(1,.32,1),(2,-.10,-1)],
             [(1,.32,1),(2,-.10,1),(0,-.003,-1)],
             [(1,.32,1),(2,-.10,1),(0,.003,1)]]
    for tri in CAP_T:
        for region in regions:
            poly=list(CAP_V[tri].astype(float))
            for axis,value,sign in region:
                if not poly:break
                poly=clip(poly,axis,value,sign)
            if len(poly)>=3:
                at=len(vertices);vertices.extend(poly)
                for j in range(1,len(poly)-1):faces.append([at,at+j,at+j+1])
    return np.asarray(vertices),np.asarray(faces)


def write_asset(name, parts):
    raw = bytearray(); views = []; acc = []; meshes = []; nodes = []
    def accessor(a, component, kind, target):
        dtype = '<f4' if component == 5126 else '<u4'
        a = np.asarray(a, dtype=dtype)
        raw.extend(b'\0' * ((-len(raw)) % 4))
        views.append({'buffer':0, 'byteOffset':len(raw), 'byteLength':a.nbytes, 'target':target})
        raw.extend(a.tobytes())
        out = {'bufferView':len(views)-1, 'componentType':component, 'count':len(a), 'type':kind}
        if kind == 'VEC3': out.update(min=a.min(0).tolist(), max=a.max(0).tolist())
        acc.append(out); return len(acc)-1
    materials = [
        {'name':'hair', 'doubleSided':True, 'pbrMetallicRoughness':{'baseColorFactor':[.07,.044,.03,1], 'roughnessFactor':.95, 'metallicFactor':0}},
        {'name':'hair_detail', 'doubleSided':True, 'pbrMetallicRoughness':{'baseColorFactor':[.09,.054,.039,1], 'roughnessFactor':.86, 'metallicFactor':0}}
    ]
    for label, v, t, mi in parts:
        v = np.asarray(v, float); t = np.asarray(t, int)
        area=np.linalg.norm(np.cross(v[t[:,1]]-v[t[:,0]],v[t[:,2]]-v[t[:,0]]),axis=1)
        t=t[area>1e-11]
        used=np.unique(t);remap=np.full(len(v),-1);remap[used]=np.arange(len(used));v=v[used];t=remap[t]
        attrs = {'POSITION':accessor(v,5126,'VEC3',34962), 'NORMAL':accessor(normals(v,t),5126,'VEC3',34962)}
        p = {'attributes':attrs,'indices':accessor(t.flatten(),5125,'SCALAR',34963),'material':mi}
        nodes.append({'name':label,'mesh':len(meshes)})
        meshes.append({'name':label,'primitives':[p]})
    nodes.append({'name':name,'children':list(range(len(nodes))), 'extras':{'asset':name,'kind':'hair','slots':[],'tint':None,'visualRevision':21}})
    d = {'asset':{'version':'2.0','generator':'Compound Days v21 hair authoring'},'scene':0,'scenes':[{'nodes':[len(nodes)-1]}],
         'nodes':nodes,'meshes':meshes,'materials':materials,'accessors':acc,'bufferViews':views,
         'buffers':[{'byteLength':len(raw),'uri':'data:application/octet-stream;base64,'+base64.b64encode(raw).decode()}]}
    (WARD/(name+'.gltf.json')).write_text(json.dumps(d,separators=(',',':')))
    print(name, sum(len(p[1]) for p in parts), 'vertices', sum(len(p[2]) for p in parts), 'triangles')


def afro():
    def surface(phi,t):
        limit=1.75-.55*max(np.cos(phi),0)+.17*max(-np.cos(phi),0)
        polar=t*limit
        n=np.array([np.sin(phi)*np.sin(polar),np.cos(polar),np.cos(phi)*np.sin(polar)])
        noise=.006*np.sin(phi*31+polar*23)*np.sin(polar*27-phi*7)
        return np.array([0,.245,-.012])+n*np.array([.248+noise,.265+noise,.246+noise])
    v=[];tri=[];segments=64;rings=28
    for i in range(rings+1):
        for j in range(segments):
            v.append(surface(j*2*np.pi/segments,max(.001,i/rings)))
            if i:
                a=(i-1)*segments+j;b=(i-1)*segments+(j+1)%segments;c=i*segments+j;d=i*segments+(j+1)%segments
                tri.extend([[a,b,c],[b,d,c]])
    v=np.asarray(v);tri=np.asarray(tri)[:,::-1]
    # Close the volume back onto the real fitted skull at the lower hairline.
    inner=[]
    for j in range(segments):
        phi=j*2*np.pi/segments
        inner.append(fitted_point(phi,1.6 if np.cos(phi)<.3 else 1.1))
    at=len(v);v=np.concatenate([v,np.asarray(inner)])
    skirt=[]
    for j in range(segments):
        a=rings*segments+j;b=rings*segments+(j+1)%segments;c=at+j;d=at+(j+1)%segments
        skirt.extend([[a,b,c],[b,d,c]])
    tri=np.concatenate([tri,np.asarray(skirt)])
    # Dense, short, curved coils; no stacked sphere lobes.
    parts = []
    for k in range(420):
        phi = k * 2.399963; troot = np.sqrt((k+.5)/420)
        c=surface(phi,troot);n=unit(c-np.array([0,.245,-.012]))
        a = unit(np.cross(n, [0,0,1] if abs(n[2])<.9 else [0,1,0])); b = np.cross(n,a)
        t = np.linspace(0,1,8); phase = RNG.random()*6.28
        r = .006 + RNG.random()*.002
        path = c[None,:] + n[None,:]*(np.sin(t*np.pi)*.004)[:,None] + r*(np.cos(t*8+phase)[:,None]*a+np.sin(t*8+phase)[:,None]*b)
        parts.append(tube(path,.004,3))
    cv, ct = join(parts)
    write_asset('hair_afro',[('hair_afro_volume',v,tri,0),('hair_afro_coils',cv,ct,0)])


def twists():
    parts = []
    # Sections start on the crown and sides, travel out around the skull, then
    # hang; the exposed centre forehead remains clear.
    for row, count in [(0,8),(1,10),(2,12)]:
        for k in range(count):
            phi = 1.02 + k/(count-1)*(2*np.pi-2.04)
            polar = [.34,.75,1.15][row]
            root = fitted_point(phi,polar)
            outward = np.array([np.sin(phi),0,np.cos(phi)])
            end = outward*(.211+.006*(k%3)); end[1] = -.10-.017*((k+row)%4)
            shoulder = outward*.219; shoulder[1] = .28-.025*row
            controls = [root, root+outward*.075+np.array([0,.012,0]), shoulder, end]
            center = bezier(controls,28)
            tangent = unit(np.gradient(center,axis=0))
            across = unit(np.cross(tangent,np.broadcast_to([0,0,1.],tangent.shape)))
            normal = unit(np.cross(tangent,across))
            t = np.linspace(0,1,len(center)); taper = 1-.62*t**4
            for phase in [0,np.pi]:
                angle = t*(6+row)*2*np.pi+phase
                path = center + (.0055*taper)[:,None]*(np.cos(angle)[:,None]*across+np.sin(angle)[:,None]*normal)
                parts.append(tube(path,.0052*taper,5))
    tv,tt=join(parts)
    # The fitted cap only fills behind the twisted sections; a narrow centre
    # part is genuinely open, revealing the selected skin below.
    pv,pt=parted_cap()
    write_asset('hair_twists',[('hair_twists_scalp',pv,pt,0),('hair_two_strand_twists',tv,tt,1)])


def wig():
    # A centre-parted, long body-wave wig. Broad thin locks give a continuous
    # drape with combed grooves, instead of cylinders and stacked spheres.
    ribbons=[]; grooves=[]
    for sign in [-1,1]:
        for k in range(9):
            phi=sign*(1.04+k/8*2.05)
            outward=np.array([np.sin(phi),0,np.cos(phi)])
            root=fitted_point(phi,.22+.085*k)
            end=outward*.219;end[1]=-.29+.045*np.sin(k*1.7)**2
            p=bezier([root,root+outward*.14+np.array([0,.022,0]),outward*.232+np.array([0,.16,0]),end],28)
            t=np.linspace(0,1,len(p));p[:,0]+=sign*.014*np.sin(t*9.4)*t
            p[:,2]+=.016*np.sin(t*8.8+k*.23)*t
            tang=unit(np.gradient(p,axis=0));side=unit(np.cross(tang,np.broadcast_to(outward,tang.shape)))
            normal=unit(np.cross(side,tang));width=.042*(1-.62*t**5)*np.minimum(1,.12+t*7)
            vs=[];faces=[]
            for i,c in enumerate(p):
                for j in range(9):
                    u=-1+j/4
                    vs.append(c+side[i]*u*width[i]+normal[i]*(.008*np.sqrt(max(0,1-u*u))+.0013*np.cos(u*5*np.pi)))
                if i:
                    for j in range(8):
                        a=(i-1)*9+j;b=a+1;d=i*9+j;e=d+1
                        faces.extend([[a,b,d],[b,e,d]])
            # Two-sided shells with actual shallow thickness and closed edges.
            a=np.asarray(vs);f=np.asarray(faces);back=a-np.repeat(normal,9,axis=0)*.004
            n=len(a);whole=np.concatenate([a,back]);tris=[f,f[:,::-1]+n]
            border=list(range(9))+[i*9+8 for i in range(1,len(p))]+list(range(n-2,n-10,-1))+[i*9 for i in range(len(p)-2,0,-1)]
            edge=[]
            for j,x in enumerate(border):
                y=border[(j+1)%len(border)];edge.extend([[x,y,x+n],[y,y+n,x+n]])
            ribbons.append((whole,np.concatenate([*tris,np.array(edge)])))
            for offset in [-.35,.35]: grooves.append(tube(p+side*width[:,None]*offset+normal*.0085,.00085,3))
    rv,rt=join(ribbons);gv,gt=join(grooves)
    pv,pt=parted_cap()
    write_asset('hair_wig',[('hair_wig_scalp',pv,pt,0),('hair_wig_waves',rv,rt,0),('hair_wig_strands',gv,gt,1)])


if __name__=='__main__':
    afro();twists();wig()

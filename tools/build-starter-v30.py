"""Rebuild starter garments from clipped body surfaces with explicit barycentric binding.

Run from the project root. Python 3 + NumPy. No original authoring tools needed.
The body asset is the supplied v29 source; skeleton, morphs and saves stay compatible.
"""
import base64
import copy
import json
from pathlib import Path

import numpy as np
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'dist/assets'
DTYPES = {5126: '<f4', 5125: '<u4', 5123: '<u2', 5121: 'u1'}
WIDTHS = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def read_accessor(doc, index):
    a = doc['accessors'][index]
    v = doc['bufferViews'][a['bufferView']]
    raw = base64.b64decode(doc['buffers'][v['buffer']]['uri'].split(',')[1])
    dtype = np.dtype(DTYPES[a['componentType']])
    return np.ndarray((a['count'], WIDTHS[a['type']]), dtype=dtype, buffer=raw,
                      offset=v.get('byteOffset', 0) + a.get('byteOffset', 0),
                      strides=(v.get('byteStride', WIDTHS[a['type']] * dtype.itemsize), dtype.itemsize)).copy()


def smooth(a, b, x):
    t = np.clip((x-a)/(b-a), 0, 1)
    return t*t*(3-2*t)


def field(p, kind):
    x, y, z = p
    if kind in ('office_trousers','cargo_trousers'):
        return min(y-.10,1.075-y,.205-abs(x))
    if kind in ('tee','office_shirt','track_top','lounge_top'):
        front=smooth(-.025,.035,z)
        neckline=(1.470-.020*front)+.040*smooth(.020,.085,abs(x))
        sleeve_end=.965 if kind in ('office_shirt','track_top','lounge_top') else 1.255
        lower=1.045+(sleeve_end-1.045)*smooth(.145,.190,abs(x))
        return min(y-lower,neckline-y)
    if kind == 'shorts':
        return min(y-.665, 1.075-y, .205-abs(x))
    front = smooth(-.025, .035, z)
    neck = (1.420 + .085*smooth(.035, .105, abs(x))) * (1-front)
    neck += (1.385 + .120*smooth(.020, .110, abs(x))) * front
    armhole = 1.505 - .200*smooth(.125, .185, abs(x))
    return min(y-1.035, min(neck, armhole)-y, .172-abs(x))


def append_accessor(doc, arr, typ, component):
    arr = np.asarray(arr, dtype=DTYPES[component])
    raw = arr.tobytes()
    b = len(doc['buffers'])
    doc['buffers'].append({'byteLength': len(raw), 'uri': 'data:application/octet-stream;base64,' + base64.b64encode(raw).decode()})
    view = len(doc['bufferViews'])
    doc['bufferViews'].append({'buffer': b, 'byteLength': len(raw)})
    out = {'bufferView': view, 'componentType': component, 'count': len(arr), 'type': typ}
    if typ != 'MAT4':
        flat = arr.reshape((len(arr), WIDTHS[typ]))
        out['min'] = flat.min(axis=0).tolist()
        out['max'] = flat.max(axis=0).tolist()
    i = len(doc['accessors'])
    doc['accessors'].append(out)
    return i


def tailored_shorts(P,kind='shorts',body=None):
    """A continuous waistband, two leg openings and a shared crotch seam."""
    positions,faces=[],[]
    columns=48
    def ring(cx,y,rx,rz):
        ids=[]
        for i in range(columns):
            a=i/columns*2*np.pi;ids.append(len(positions));positions.append([cx+rx*np.sin(a),y,rz*np.cos(a)])
        return ids
    def connect(a,b):
        for i in range(len(a)-1):faces.extend([[a[i],b[i],a[i+1]],[a[i+1],b[i],b[i+1]]])
    waist=[]
    for y,rx,rz in [(1.075,.153,.102),(1.025,.172,.123),(.960,.179,.135),(.910,.174,.125)]:
        waist.append(ring(0,y,rx,rz))
    for a,b in zip(waist,waist[1:]):connect(a+[a[0]],b+[b[0]])
    legs={}
    for side in [1,-1]:
        leg_profile=[(.875,.087,.104),(.815,.082,.098),(.740,.077,.089),(.665,.074,.081)] if kind=='shorts' else [(.875,.087,.104),(.79,.084,.099),(.64,.078,.087),(.51,.073,.077),(.43,.071,.075),(.28,.067,.070),(.10,.065,.068)]
        rings=[ring(side*.091,y,rx,rz) for y,rx,rz in leg_profile]
        for a,b in zip(rings,rings[1:]):connect(a+[a[0]],b+[b[0]])
        legs[side]=rings[0]
    connect(waist[-1][:25],legs[1][:25])
    connect(waist[-1][24:]+[waist[-1][0]],legs[-1][24:]+[legs[-1][0]])
    # One shared curved seam connects the inner halves of the leg rings.
    bridge=[]
    for i in range(25):
        t=i/24;z=.125*np.cos(t*np.pi);y=.845+.065*abs(np.cos(t*np.pi))
        if i==0:bridge.append(waist[-1][0])
        elif i==24:bridge.append(waist[-1][24])
        else:bridge.append(len(positions));positions.append([0,y,z])
    connect(list(reversed(bridge)),legs[1][24:]+[legs[1][0]])
    connect(bridge,legs[-1][:25])
    if kind=='cargo_trousers':
        # Sewn side pockets and raised flaps follow the same leg chain.
        for side in [-1,1]:
            for flap in [False,True]:
                start=len(positions);rows=3;cols=4
                for r in range(rows+1):
                    t=r/rows;y=(.814+.038*t) if flap else (.634+.184*t)
                    for c in range(cols+1):
                        z=(c/cols-.5)*.108
                        bulge=.004*np.sin(c/cols*np.pi)*np.sin(t*np.pi)
                        positions.append([side*(.177+bulge+(.004 if flap else 0)),y,z])
                        if r and c:
                            a=start+r*(cols+1)+c;faces.extend([[a,a-cols-1,a-1],[a-1,a-cols-1,a-cols-2]])
    p=np.array(positions);f=np.array(faces)
    normals=np.zeros_like(p)
    cross=np.cross(p[f[:,1]]-p[f[:,0]],p[f[:,2]]-p[f[:,0]])
    for k in range(3):np.add.at(normals,f[:,k],cross)
    normals/=np.maximum(np.linalg.norm(normals,axis=1,keepdims=True),1e-8)
    # Fix orientation consistently using the outer side vertices as the reference.
    if np.mean(normals[np.abs(p[:,0])>.15,0]*p[np.abs(p[:,0])>.15,0])<0:
        faces=[[a,c,b] for a,b,c in faces];normals*=-1
    allowed=np.zeros(len(P),bool)
    for part in [1,6,7]:allowed[np.unique(read_accessor(body,body['meshes'][0]['primitives'][part]['indices']))]=True
    candidate=np.where(allowed&(P[:,1]>(.63 if kind=='shorts' else .06))&(P[:,1]<1.12)&(np.abs(P[:,0])<.205))[0]
    distances,ids=cKDTree(P[candidate]).query(p,k=3);ids=candidate[ids]
    bary=1/np.maximum(distances,.0001)**2;bary/=bary.sum(axis=1,keepdims=True)
    joints,weights=[],[]
    for x,y,z in p:
        leg=1-smooth(.83,.96,y);side=smooth(-.025,.025,x)
        if kind=='shorts':joints.append([0,17,22,0]);weights.append([1-leg,leg*side,leg*(1-side),0])
        else:
            lower=1-smooth(.43,.58,y);joints.append([0,17 if x>=0 else 22,18 if x>=0 else 23,0]);weights.append([1-leg,leg*(1-lower),leg*lower,0])
    bindings=[(a.tolist(),w.tolist()) for a,w in zip(ids,bary)]
    return list(p),list(normals),joints,weights,faces,bindings


def build(kind):
    top_kind=kind in ('tank','tee','office_shirt','track_top','lounge_top')
    body = json.loads((ASSETS/'characters/efe.gltf.json').read_text())
    mesh = body['meshes'][0]
    a = mesh['primitives'][0]['attributes']
    P = read_accessor(body, a['POSITION']).astype(float)
    N = read_accessor(body, a['NORMAL']).astype(float)
    J = read_accessor(body, a['JOINTS_0'])
    W = read_accessor(body, a['WEIGHTS_0'])
    F = np.concatenate([read_accessor(body, p['indices']).reshape(-1, 3) for p in mesh['primitives']])
    # The supplied region labels split some flank triangles into arm regions.
    # Clip the complete connected surface spatially; never use coarse region names as tailoring.
    region_ids = list(range(len(mesh['primitives'])))
    triangles = np.concatenate([read_accessor(body, mesh['primitives'][i]['indices']).reshape(-1, 3) for i in region_ids])
    values = np.array([field(p, kind) for p in P])
    cache, bindings, positions, normals, joints, weights, faces = {}, [], [], [], [], [], []
    gap = .014 if kind == 'tank' else .012 if top_kind else .012

    def vertex(ids, bary):
        pairs = sorted((int(ids[i]), float(bary[i])) for i in range(3) if bary[i] > 1e-7)
        key = tuple((j, round(w, 7)) for j, w in pairs)
        if key in cache:
            return cache[key]
        n = np.sum(N[ids]*bary[:, None], axis=0)
        n /= max(np.linalg.norm(n), 1e-8)
        pos = np.sum(P[ids]*bary[:, None], axis=0) + gap*n
        if kind == 'shorts' and abs(pos[0]) > .14:
            # Smooth the inherited hip flare into the waistband; the covered body is masked.
            taper = max(0., 1-((pos[1]-1.015)/.085)**2)
            pos[0] = np.sign(pos[0])*(.14+(abs(pos[0])-.14)*(1-.35*taper))
        influences = {}
        for ix, b in zip(ids, bary):
            for j, w in zip(J[ix], W[ix]):
                influences[int(j)] = influences.get(int(j), 0) + float(w*b)
        # The nearest-segment body weights assign some flank vertices to forearms.
        # Garments use their anatomical chain, so raising an arm cannot drag a waistband.
        if top_kind:
            allowed={7,8,9,10} if kind!='tank' and pos[0]>.185 else {12,13,14,15} if kind!='tank' and pos[0]<-.185 else {0,1,2,3,7,12}
        else:allowed={0,1,17,18,22,23}
        influences = {j:w for j,w in influences.items() if j in allowed}
        if not influences or sum(influences.values()) < 1e-8:
            influences = {3 if top_kind and pos[1] > 1.25 else 0:1.}
        iw = sorted(influences.items(), key=lambda t: -t[1])[:4]
        iw += [(0, 0.)] * (4-len(iw))
        total = sum(w for j, w in iw)
        cache[key] = len(positions)
        positions.append(pos); normals.append(n)
        joints.append([j for j, w in iw]); weights.append([w/total for j, w in iw])
        bindings.append((ids.tolist(), bary.tolist()))
        return cache[key]

    for ids in triangles:
        val = values[ids]
        if np.max(val) < 0:
            continue
        poly = []
        for k in range(3):
            j = (k+1) % 3
            b0, b1 = np.eye(3)[k], np.eye(3)[j]
            if val[k] >= 0:
                poly.append(b0)
            if (val[k] >= 0) != (val[j] >= 0):
                # Bisect the nonlinear cut field on the edge for a smooth neckline/armhole.
                low, high = 0., 1.
                for _ in range(18):
                    t = (low+high)/2
                    fm = field(P[ids[k]]*(1-t)+P[ids[j]]*t, kind)
                    if (fm >= 0) == (val[k] >= 0): low = t
                    else: high = t
                t = (low+high)/2
                poly.append(b0*(1-t)+b1*t)
        vv = [vertex(ids, b) for b in poly]
        for k in range(1, len(vv)-1):
            if len({vv[0], vv[k], vv[k+1]}) == 3:
                faces.append([vv[0], vv[k], vv[k+1]])

    if kind in ('shorts','office_trousers','cargo_trousers'):
        positions,normals,joints,weights,faces,bindings=tailored_shorts(P,kind,body)

    # Bound hems: edge walls give fabric a finished 2 mm edge, without an extra inner shell.
    edge_counts = {}
    for f in faces:
        for i in range(3):
            e = (f[i], f[(i+1) % 3]); key = tuple(sorted(e))
            edge_counts.setdefault(key, []).append(e)
    boundary = [es[0] for es in edge_counts.values() if len(es) == 1]
    rim_map, rim_faces = {}, []
    for edge in boundary:
        for i in edge:
            if i not in rim_map:
                rim_map[i] = len(positions)
                positions.append(positions[i] - .002*normals[i]); normals.append(normals[i].copy())
                joints.append(joints[i][:]); weights.append(weights[i][:]); bindings.append(copy.deepcopy(bindings[i]))
        i, j = edge
        rim_faces.extend([[i, rim_map[j], j], [i, rim_map[i], rim_map[j]]])

    # Split original skin triangles at the exact garment boundary. Hiding only
    # complete triangles left jagged strips poking through the finished hems.
    hidden,reveal,ri=[],[],[]
    coverage=lambda p:max(field(p,kind),field(p,'shorts' if kind=='tank' else 'office_trousers'))
    union_values=np.array([coverage(p) for p in P])
    for ids in triangles:
        val=union_values[ids] if top_kind else values[ids]
        if max(val)<=0:continue
        hidden.append(ids.tolist())
        if min(val)>=0:continue
        # The v31 head owns the neck above this seam; do not restore fragments
        # of the retired head through the tank's neckline.
        if top_kind and np.max(P[ids,1])>1.485:continue
        poly=[]
        for k in range(3):
            j=(k+1)%3;b0,b1=np.eye(3)[k],np.eye(3)[j]
            if val[k]<0:poly.append(b0)
            if (val[k]>=0)!=(val[j]>=0):
                lo,hi=0.,1.
                for _ in range(18):
                    t=(lo+hi)/2;point=P[ids[k]]*(1-t)+P[ids[j]]*t;fm=coverage(point) if top_kind else field(point,kind)
                    if (fm>=0)==(val[k]>=0):lo=t
                    else:hi=t
                t=(lo+hi)/2;poly.append(b0*(1-t)+b1*t)
        start=len(reveal)
        reveal.extend([[ids.tolist(),b.tolist()] for b in poly])
        for k in range(1,len(poly)-1):ri.extend([start,start+k,start+k+1])
    doc = copy.deepcopy(body)
    doc.pop('animations', None)
    keep = set(doc['skins'][0]['joints']) | {0}
    for i, n in enumerate(doc['nodes']):
        n['children'] = [j for j in n.get('children', []) if j in keep]
        n.pop('mesh', None); n.pop('skin', None)
    # Preserve original node indices used by the skin, drop unattached face nodes.
    doc['nodes'] = doc['nodes'][:max(keep)+1]
    root = doc['nodes'][0]
    root['name'] = kind+'_v30'
    root['extras'] = {'asset': kind, 'kind': 'garment', 'slots': ['top' if top_kind else 'bottom'],
                      'tint': 'top' if top_kind else 'bottom', 'visualRevision': 31,
                      'refit': 'body-barycentric-v30', 'covers': {}, 'hiddenBodyTriangles': hidden,
                      'revealSkin':{'vertices':reveal if top_kind else [],'indices':ri if top_kind else []}}
    doc['materials'] = [{'name': root['extras']['tint'], 'doubleSided': True,
                         'pbrMetallicRoughness': {'baseColorFactor': [.15, .25, .50, 1] if kind == 'tank' else [.09,.09,.1,1], 'metallicFactor': 0, 'roughnessFactor': .92}}]
    attrs = {'POSITION': append_accessor(doc, positions, 'VEC3', 5126),
             'NORMAL': append_accessor(doc, normals, 'VEC3', 5126),
             'JOINTS_0': append_accessor(doc, joints, 'VEC4', 5123),
             'WEIGHTS_0': append_accessor(doc, weights, 'VEC4', 5126),
             '_BODY_IDS': append_accessor(doc, [b[0] for b in bindings], 'VEC3', 5126),
             '_BODY_WEIGHTS': append_accessor(doc, [b[1] for b in bindings], 'VEC3', 5126)}
    idx = append_accessor(doc, np.array(faces+rim_faces).reshape(-1, 1), 'SCALAR', 5125)
    doc['meshes'] = [{'name': kind+'_bound_shell', 'primitives': [{'attributes': attrs, 'indices': idx, 'material': 0}]}]
    ni = len(doc['nodes']); doc['nodes'].append({'name': kind+'_bound_shell', 'mesh': 0, 'skin': 0})
    root['children'].append(ni)
    # Compact referenced buffers and accessors; avoid carrying the full hero inside each garment.
    used = sorted(set(attrs.values()) | {idx, doc['skins'][0]['inverseBindMatrices']})
    amap = {a:i for i,a in enumerate(used)}
    accesses, views, raw = [], [], bytearray()
    for old in used:
        ac = doc['accessors'][old]; data = read_accessor(doc, old)
        while len(raw)%4: raw.append(0)
        views.append({'buffer':0,'byteOffset':len(raw),'byteLength':data.nbytes})
        raw.extend(data.tobytes()); out = copy.deepcopy(ac); out['bufferView']=len(views)-1;out.pop('byteOffset',None);accesses.append(out)
    doc['accessors']=accesses;doc['bufferViews']=views
    doc['buffers']=[{'byteLength':len(raw),'uri':'data:application/octet-stream;base64,'+base64.b64encode(raw).decode()}]
    doc['skins'][0]['inverseBindMatrices']=amap[doc['skins'][0]['inverseBindMatrices']]
    prim=doc['meshes'][0]['primitives'][0];prim['attributes']={k:amap[v] for k,v in attrs.items()};prim['indices']=amap[idx]
    path=ASSETS/'wardrobe'/f'{kind}.gltf.json';path.write_text(json.dumps(doc,separators=(',',':')))
    return {'asset':kind,'vertices':len(positions),'triangles':len(faces)+len(rim_faces),'hemEdges':len(boundary),'hiddenBodyTriangles':len(hidden),'bytes':path.stat().st_size}


if __name__ == '__main__':
    import sys
    kinds=sys.argv[1:] or ['tank','shorts']
    print(json.dumps([build(kind) for kind in kinds], indent=2))

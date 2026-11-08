"""Fit the owner's Blender wardrobe (Compound_Days_Wardrobe.blend) onto the game's character skeleton.

The .blend holds twelve outfit scenes, each a posed, unrigged character wearing an outfit with its footwear and
jewellery, modelled for a different body (about 3.4 units tall, A-pose, a big head). This script:

  1. reads every outfit's meshes from the .blend, modifiers applied, in world space;
  2. retargets the garments from that body onto the game's hero body (dist/assets/characters/efe.gltf.json):
     the trunk by a piecewise height map and per-height width and depth ratios, arms and legs along their own axes
     (the arm is swung from the A-pose down to the hero's arm), each vertex blended between body parts by the parts
     of the source body nearest to it; skirts and dresses follow the trunk only so they keep their flare;
  3. pushes cloth a few millimetres outside the hero body and copies the skin weights from the nearest hero body
     vertices, so every piece bends with the existing 27-joint skeleton;
  4. maps footwear by the shoe's own box onto the hero's sneaker box, weighted to the foot bones;
  5. writes embedded-buffer glTF 2.0 JSON under dist/assets/wardrobe/: one clothes asset per outfit (with a
     skin-coloured copy of the hero's arms and legs underneath, so the base top and bottom can be hidden), one
     asset per footwear style and one jewellery asset per outfit that has any.

Run with Blender's Python module (pip install bpy):  python tools/wardrobe_from_blend.py path/to/Compound_Days_Wardrobe.blend
"""
import sys, json, base64, re, struct, math
from pathlib import Path
import numpy as np
import bpy, mathutils
from mathutils.kdtree import KDTree

ROOT = Path(__file__).resolve().parents[1]
WARD = ROOT / 'dist/assets/wardrobe'
HERO = ROOT / 'dist/assets/characters/efe.gltf.json'
TEMPLATE = WARD / 'tee.gltf.json'
OUTFITS = {  # collection -> (game outfit id, display name)
    'oversized_tee': ('tee', 'Oversized tee'), 'office_shirt': ('office', 'Office shirt'), 'ankara_two_piece': ('ankara', 'Ankara two-piece'),
    'tracksuit': ('track', 'Tracksuit'), 'kaftan': ('kaftan', 'Kaftan'), 'lounge_set': ('lounge', 'Lounge set'),
    'ankara_skirt_set': ('skirtset', 'Ankara skirt set'), 'denim_overalls': ('overalls', 'Denim overalls'), 'evening_jumpsuit': ('jumpsuit', 'Evening jumpsuit'),
    'linen_coord': ('linen', 'Linen co-ord'), 'utility_layers': ('utility', 'Utility layers'), 'wrap_dress': ('wrapdress', 'Wrap dress')}
JEWEL = re.compile(r'gold_hoop|pendant|watch_|crossbody|bag_flap|bag_clasp')
TRUNK_ONLY = re.compile(r'skirt|hem_border|geometric_border|wrap_overlap|belt_tail|bow_|belt_knot|a_line')
SKIP = re.compile(r'character_|_edge$|_stitch|_seam|neck_stitch|top_hem$|plain_blouse_hem|plain_skirt_hem|hem_binding|neckline_binding|square_neck_binding|top_hem_binding|neck_binding|notch_')
FOOT = re.compile(r'(?:foot)?wear_(\w+?)_[LR]_')


def blender_to_gltf(v):
    return np.c_[v[:, 0], v[:, 2], -v[:, 1]]


def kdtree(points):
    t = KDTree(len(points))
    for i, p in enumerate(points): t.insert(p, i)
    t.balance(); return t


def knn(tree, pts, k):
    idx = np.zeros((len(pts), k), int); dist = np.zeros((len(pts), k))
    for i, p in enumerate(pts):
        r = tree.find_n(p, k)
        for j, (co, ii, d) in enumerate(r): idx[i, j] = ii; dist[i, j] = d
        for j in range(len(r), k): idx[i, j] = idx[i, 0]; dist[i, j] = dist[i, 0]
    return idx, dist


# ------------------------------------------------------------------ hero body ------------------------------------------------------------------
def load_hero():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    tmp = Path(bpy.app.tempdir or '/tmp') / 'efe_hero.gltf'; tmp.write_text(HERO.read_text())
    bpy.ops.import_scene.gltf(filepath=str(tmp))
    body = bpy.data.objects['Body']; me = body.data
    names = [g.name for g in body.vertex_groups]
    V = np.array([(body.matrix_world @ v.co)[:] for v in me.vertices])
    N = np.array([(body.matrix_world.to_3x3() @ v.normal).normalized()[:] for v in me.vertices])
    W = np.zeros((len(V), len(names)))
    for v in me.vertices:
        for g in v.groups: W[v.index, g.group] = g.weight
    mats = [m.name for m in me.materials]
    tris = []; tmat = []
    me.calc_loop_triangles()
    for t in me.loop_triangles: tris.append(t.vertices[:]); tmat.append(mats[t.material_index])
    return dict(V=V, N=N, W=W, names=names, tris=np.array(tris), tmat=np.array(tmat))


# ------------------------------------------------------------------ source outfit ------------------------------------------------------------------
def material_info():
    out = {}
    for m in bpy.data.materials:
        col = [0.8, 0.8, 0.8, 1]; img = None
        if m.use_nodes:
            for n in m.node_tree.nodes:
                if n.type == 'BSDF_PRINCIPLED':
                    col = list(n.inputs['Base Color'].default_value)
                    def find(nd, depth=0):
                        if nd.type == 'TEX_IMAGE' and nd.image: return nd.image
                        if depth > 5: return None
                        for i in nd.inputs:
                            for k in i.links:
                                r = find(k.from_node, depth + 1)
                                if r: return r
                        return None
                    for l in n.inputs['Base Color'].links: img = find(l.from_node) or img
        else:
            col = list(m.diffuse_color)
        out[m.name] = (col, img)
    return out


def read_collection(name):
    c = bpy.data.collections[name]
    # evaluate the collection in the current scene (geometry nodes, curves and modifiers only evaluate in a scene's depsgraph)
    host = bpy.context.scene
    if c.name not in [x.name for x in host.collection.children]: host.collection.children.link(c)
    dg = bpy.context.evaluated_depsgraph_get(); dg.update()
    # decimate dense meshes for phones: a budget that grows with the square root of the mesh's size
    added = []
    for o in c.objects:
        if o.type != 'MESH': continue
        e = o.evaluated_get(dg); n = sum(len(p.vertices) - 2 for p in e.data.polygons)
        target = max(60, 700 * math.sqrt(n / 4000)) if FOOT.search(o.name) else max(300, 4000 * math.sqrt(n / 50000))  # shoes are small on screen
        if n > target * 1.2:
            md = o.modifiers.new('cd_decimate', 'DECIMATE'); md.ratio = target / n; md.use_collapse_triangulate = True; added.append((o, md))
    if added: dg.update()
    objs = []
    for o in c.objects:
        if o.type not in ('MESH', 'CURVE'): continue
        e = o.evaluated_get(dg); m = e.to_mesh()
        if m is None or not len(m.polygons): e.to_mesh_clear(); continue
        m.calc_loop_triangles(); M = np.array(o.matrix_world)
        v = np.array([vv.co[:] for vv in m.vertices]); v = (np.c_[v, np.ones(len(v))] @ M.T)[:, :3]
        tris = np.array([t.vertices[:] for t in m.loop_triangles]); loops = np.array([t.loops[:] for t in m.loop_triangles])
        tm = np.array([t.material_index for t in m.loop_triangles])
        uv = np.array([d.uv[:] for d in m.uv_layers.active.data])[loops] if m.uv_layers.active else None
        slots = [(sl.material.name if sl.material else None) for sl in o.material_slots] or [None]
        objs.append(dict(name=re.sub(r'\.\d+$', '', o.name), v=v, t=tris, tm=tm, uv=uv, slots=slots))
        e.to_mesh_clear()
    for o, md in added: o.modifiers.remove(md)
    host.collection.children.unlink(c)
    return objs


# ------------------------------------------------------------------ retarget ------------------------------------------------------------------
HERO_LOBE = (0.163, 0.012, 1.565)  # Blender coordinates, left ear
HERO_TRUNK_Z = [0.105, 0.75, 1.36, 1.40, 1.45, 1.86]  # ankle, crotch, shoulder, neck base, chin, head top


def build_map(src, hero):
    """Source body landmarks and the per-part mapping functions."""
    P = {o['name'].split('/')[-1].replace('ankara_skirt_set_', ''): o for o in src if 'character_' in o['name']}
    def part(key):
        vs = [o['v'] for n, o in P.items() if re.search(key, n)]
        return np.concatenate(vs) if vs else np.zeros((0, 3))
    torso = part(r'character_torso'); head = part(r'head_sculpt'); neck = part(r'character_neck')
    legs = {s: part(r'character_leg_%s1$' % ('-' if s < 0 else '')) for s in (-1, 1)}
    arms = {s: np.concatenate([part(r'character_arm_%s1$' % ('-' if s < 0 else '')), part(r'character_(finger|thumb)_%s' % ('-1' if s < 0 else '1'))]) for s in (-1, 1)}
    crotch = torso[:, 2].min(); shoulder = torso[:, 2].max() - 0.08; neckb = torso[:, 2].max(); chin = head[:, 2].min() + 0.02; top = head[:, 2].max()
    ankle = min(l[:, 2].min() for l in legs.values()) + 0.02
    src_z = [ankle, crotch, shoulder, neckb, chin, top]
    def zmap(z): return np.interp(z, src_z, HERO_TRUNK_Z)
    # width and depth ratios along the trunk, measured on both bodies
    hV, hW, hn = hero['V'], hero['W'], hero['names']
    dom = np.array(hn)[hW.argmax(1)]
    htrunk = hV[np.isin(dom, ['Hips', 'Spine', 'Spine1', 'Spine2'])]
    def ratio(z_src):
        zh = zmap(z_src)
        s = torso[np.abs(torso[:, 2] - z_src) < 0.04]; h = htrunk[np.abs(htrunk[:, 2] - zh) < 0.03]
        if len(s) < 5 or len(h) < 5: return None
        return np.abs(h[:, 0]).max() / np.abs(s[:, 0]).max(), np.abs(h[:, 1]).max() / np.abs(s[:, 1]).max()
    zs = np.linspace(crotch + 0.05, shoulder, 8); rs = [(z, ratio(z)) for z in zs]; rs = [(z, r) for z, r in rs if r]
    rz = np.array([z for z, _ in rs]); rx = np.array([r[0] for _, r in rs]); ry = np.array([r[1] for _, r in rs])
    hh = hV[dom == 'Head']; head_k = ((np.ptp(hh[:, 0]) / np.ptp(head[:, 0])), (np.ptp(hh[:, 1]) / np.ptp(head[:, 1])))
    hn_ = hV[dom == 'Neck']; neck_k = np.ptp(hn_[:, 0]) / max(np.ptp(neck[:, 0]), 1e-3)
    head_cy = head[:, 1].mean(); hero_head_cy = hh[:, 1].mean()

    # half-width, half-depth and depth centre of both bodies (no arms) slice by slice: the body inside the cloth is
    # scaled onto the hero's, the cloth's looseness beyond it is kept at a bit under half (the hero is slimmer)
    sbody = np.concatenate([torso, neck, legs[-1], legs[1]]); hbody = hV[~np.isin(dom, [n for n in hn if 'Arm' in n or 'Hand' in n])]
    def profile(pts, z, half):
        out = []
        for zz in z:
            s = pts[np.abs(pts[:, 2] - zz) < half]
            out.append((np.abs(s[:, 0]).max(), np.ptp(s[:, 1]) / 2, (s[:, 1].max() + s[:, 1].min()) / 2) if len(s) > 4 else (np.nan,) * 3)
        a = np.array(out); ok = ~np.isnan(a[:, 0]); return np.array([np.interp(z, z[ok], a[ok, i]) for i in range(3)])
    pz = np.linspace(ankle, neckb, 48); sprof = profile(sbody, pz, 0.04); hprof = profile(hbody, zmap(pz), 0.02)
    def loose(d, sw, hw):
        a = np.abs(d); return np.sign(d) * np.where(a < sw, a * hw / sw, hw + (a - sw) * 0.32)

    def trunk(p):
        z = p[:, 2]; out = np.zeros_like(p); out[:, 2] = zmap(z)
        sw, sd, sc = (np.interp(z, pz, sprof[i]) for i in range(3)); hw, hd, hc = (np.interp(z, pz, hprof[i]) for i in range(3))
        bx = loose(p[:, 0], sw, hw); by = hc + loose(p[:, 1] - sc, sd, hd)
        # neck and head use their own ratios, blended in over the neck
        tn = np.clip((z - shoulder) / max(neckb - shoulder, 1e-3), 0, 1); th = np.clip((z - neckb) / max(chin - neckb, 1e-3), 0, 1)
        kx = neck_k * (1 - th) + head_k[0] * th; ky = neck_k * (1 - th) + head_k[1] * th
        cy = head_cy * th
        nx = p[:, 0] * kx; ny = (p[:, 1] - cy) * ky + hero_head_cy * th
        out[:, 0] = bx * (1 - tn) + nx * tn; out[:, 1] = by * (1 - tn) + ny * tn
        return out

    def limb(src_pts, a, b, A, B, kr, rs=None, rh=None):
        ab = b - a; L = np.linalg.norm(ab); u = ab / L; AB = B - A; U = AB / np.linalg.norm(AB)
        R = rotation_between(u, U); scale_len = np.linalg.norm(AB) / L
        def f(p):
            t = (p - a) @ u; q = a + np.outer(t, u); d = p - q
            r = np.linalg.norm(d, axis=1); dirn = d / np.maximum(r, 1e-9)[:, None]
            if rs is None: r2 = r * kr
            else: r2 = np.where(r < rs, r * kr, rh + (r - rs) * 0.45)  # the body scales; the cloth's looseness is kept at a bit under half
            return A + np.outer(t * scale_len, U) + (dirn @ R.T) * r2[:, None]
        return f

    maps = {'trunk': trunk}; xs_ = {}
    bones = {}
    for name in ['LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot', 'LeftArm', 'LeftForeArm', 'LeftHand', 'LeftHandEnd', 'RightArm', 'RightForeArm', 'RightHand', 'RightHandEnd']:
        bones[name] = hero['bones'][name]
    for s in (-1, 1):
        side = 'Left' if s > 0 else 'Right'
        lg = legs[s]; cx = lg[:, 0].mean(); cy = lg[:, 1].mean()
        a = np.array([cx, cy, crotch + 0.02]); b = np.array([cx, cy, ankle])
        A = np.array(bones[side + 'UpLeg']); A[2] = 0.77; B = np.array(bones[side + 'Foot'])
        rsrc = np.median(np.hypot(lg[:, 0] - cx, lg[:, 1] - cy)); rh = 0.074
        maps['leg%d' % s] = limb(lg, a, b, A, B, rh / rsrc, rsrc, rh)
        am = arms[s]; c = am.mean(0); w, vv = np.linalg.eigh(np.cov((am - c).T)); ax = vv[:, -1]
        if ax[2] < 0: ax = -ax
        tproj = (am - c) @ ax; bot = c + ax * tproj.min()
        a = c + ax * ((shoulder - c[2]) / ax[2]); b = bot; xs_[s] = abs(a[0])
        A = np.array(bones[side + 'Arm']); B = np.array(bones[side + 'HandEnd']) + np.array([0, 0, -0.03])
        rsrc = np.median(np.linalg.norm((am - c) - np.outer((am - c) @ ax, ax), axis=1)); rh = 0.058
        maps['arm%d' % s] = limb(am, a, b, A, B, rh / rsrc, rsrc, rh)
    labelled = []
    for key, pts in [('trunk', np.concatenate([torso, neck, head])), ('leg-1', legs[-1]), ('leg1', legs[1]), ('arm-1', arms[-1]), ('arm1', arms[1])]:
        labelled.append((key, pts))
    xs = min(xs_.values()); arm_bottom = max(arms[s][:, 2].min() for s in (-1, 1))
    lp = np.concatenate([pts for _, pts in labelled]); isarm = np.concatenate([np.full(len(pts), k.startswith('arm')) for k, pts in labelled])
    step = max(1, len(lp) // 20000)
    return maps, labelled, dict(crotch=crotch, ankle=ankle, xs=xs, waist=crotch + 0.35 * (shoulder - crotch), arm_bottom=arm_bottom, shoulder=shoulder,
                                body_tree=kdtree(lp[::step]), body_isarm=isarm[::step])


def rotation_between(u, v):
    u = u / np.linalg.norm(u); v = v / np.linalg.norm(v); c = u @ v; ax = np.cross(u, v); s = np.linalg.norm(ax)
    if s < 1e-8: return np.eye(3)
    ax /= s; K = np.array([[0, -ax[2], ax[1]], [ax[2], 0, -ax[0]], [-ax[1], ax[0], 0]])
    return np.eye(3) + s * K + (1 - c) * K @ K


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


def retarget(p, maps, lm, trunk_only=False, wrist=False):
    """Blend the part maps by where the vertex sits on the source body: beyond the shoulder is arm, below the crotch is leg."""
    lm['last_arm'] = np.zeros(len(p))
    if trunk_only: return maps['trunk'](p)
    x, z = p[:, 0], p[:, 2]
    arm = smoothstep(lm['xs'] - 0.08, lm['xs'] + 0.04, np.abs(x)) * smoothstep(lm['arm_bottom'] - 0.1, lm['arm_bottom'] + 0.05, z) * smoothstep(lm['shoulder'] + 0.1, lm['shoulder'] - 0.02, z)
    if not wrist:  # hands hang by the hips: below the waist only cloth nearest the source arm (a sleeve or cuff) follows the arm
        low = 1 - smoothstep(lm['waist'] - 0.05, lm['waist'] + 0.1, z); cand = (arm > 0) & (low > 0)
        if z.min() < lm['crotch']: return retarget_parts(p, maps, lm, arm * (1 - low))  # trousers, jumpsuits: the hands beside them are not sleeves
        near = np.ones(len(p))
        if cand.any(): idx, _ = knn(lm['body_tree'], p[cand], 8); near[cand] = lm['body_isarm'][idx].mean(1)
        arm = arm * (1 - low * (1 - near))
    return retarget_parts(p, maps, lm, arm)


def retarget_parts(p, maps, lm, arm):
    lm['last_arm'] = arm; x, z = p[:, 0], p[:, 2]
    leg = smoothstep(lm['crotch'] + 0.08, lm['crotch'] - 0.12, z) * (1 - arm)
    trunk = 1 - arm - leg
    side = np.where(x < 0, -1, 1)
    out = maps['trunk'](p) * trunk[:, None]
    for s in (-1, 1):
        m = side == s
        if not m.any(): continue
        out[m] += maps['arm%d' % s](p[m]) * arm[m, None] + maps['leg%d' % s](p[m]) * leg[m, None]
    return out


def smooth_onto(v, tris, iters=2):
    if not len(tris): return v
    edges = np.unique(np.sort(np.concatenate([tris[:, [0, 1]], tris[:, [1, 2]], tris[:, [2, 0]]]), axis=1), axis=0)
    a, b = edges.T; deg = np.bincount(np.r_[a, b], minlength=len(v))[:, None]
    for _ in range(iters):
        tot = np.zeros_like(v); np.add.at(tot, a, v[b]); np.add.at(tot, b, v[a]); v = v + 0.3 * (tot / np.maximum(deg, 1) - v)
    return v


def push_out(v, hero, htree, off=0.006, mask=None):
    idx, dist = knn(htree, v, 1); s = hero['V'][idx[:, 0]]; n = hero['N'][idx[:, 0]]
    d = ((v - s) * n).sum(1); need = d < off
    if mask is not None: need &= mask
    v = v.copy(); v[need] += n[need] * (off - d[need])[:, None]; return v


def skin_weights(v, hero, htree, joint_index, k=6, ids=None):
    idx, dist = knn(htree, v, k)
    if ids is not None: idx = ids[idx]
    w = 1.0 / (dist + 0.01) ** 2
    W = (hero['W'][idx] * w[:, :, None]).sum(1); W /= W.sum(1, keepdims=True)
    order = np.argsort(-W, axis=1)[:, :4]; ww = np.take_along_axis(W, order, 1); ww /= ww.sum(1, keepdims=True)
    J = np.vectorize(lambda g: joint_index[hero['names'][g]])(order)
    return J.astype(np.uint16), ww.astype(np.float32)


# ------------------------------------------------------------------ glTF writer ------------------------------------------------------------------
class Writer:
    def __init__(self, name, extras):
        t = json.loads(TEMPLATE.read_text())
        buf = base64.b64decode(t['buffers'][0]['uri'].split(',')[1])
        sk = t['skins'][0]; acc = t['accessors'][sk['inverseBindMatrices']]; bv = t['bufferViews'][acc['bufferView']]
        ibm = buf[bv.get('byteOffset', 0) + acc.get('byteOffset', 0):][:acc['count'] * 64]
        self.d = {'asset': {'version': '2.0', 'generator': 'Compound Days wardrobe v52, from the owner\'s Blender wardrobe'}, 'nodes': json.loads(json.dumps(t['nodes'][:27])),
                  'skins': [{'joints': sk['joints'], 'skeleton': sk['skeleton']}], 'meshes': [], 'materials': [], 'accessors': [], 'bufferViews': [], 'buffers': []}
        self.buf = bytearray(); self.name = name; self.extras = extras
        self.d['skins'][0]['inverseBindMatrices'] = self.acc(np.frombuffer(ibm, np.float32).reshape(-1, 16), 5126, 'MAT4')
        self.joint_index = {self.d['nodes'][j]['name']: i for i, j in enumerate(sk['joints'])}
        self.mats = {}; self.images = {}
    def view(self, raw, target=None):
        self.buf.extend(b'\0' * ((-len(self.buf)) % 4)); v = {'buffer': 0, 'byteOffset': len(self.buf), 'byteLength': len(raw)}
        if target: v['target'] = target
        self.buf.extend(raw); self.d['bufferViews'].append(v); return len(self.d['bufferViews']) - 1
    def acc(self, a, comp, kind, target=None):
        dt = {5126: '<f4', 5125: '<u4', 5123: '<u2'}[comp]; a = np.ascontiguousarray(a, dtype=dt)
        d = {'bufferView': self.view(a.tobytes(), target), 'componentType': comp, 'count': len(a), 'type': kind}
        if kind == 'VEC3': d.update(min=a.min(0).tolist(), max=a.max(0).tolist())
        self.d['accessors'].append(d); return len(self.d['accessors']) - 1
    def material(self, name, color, image=None, rough=0.9, metal=0.0):
        if name in self.mats: return self.mats[name]
        m = {'name': name, 'pbrMetallicRoughness': {'baseColorFactor': [float(c) for c in color], 'metallicFactor': metal, 'roughnessFactor': rough}}
        if image is not None:
            if image not in self.images:
                png = Path(bpy.app.tempdir or '/tmp') / ('wardrobe_' + re.sub(r'\W', '_', image.name) + '.png')
                image.filepath_raw = str(png); image.file_format = 'PNG'; image.save()
                self.d.setdefault('images', []).append({'bufferView': self.view(png.read_bytes()), 'mimeType': 'image/png'})
                self.d.setdefault('samplers', [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}])
                self.d.setdefault('textures', []).append({'source': len(self.d['images']) - 1, 'sampler': 0}); self.images[image] = len(self.d['textures']) - 1
            m['pbrMetallicRoughness']['baseColorTexture'] = {'index': self.images[image]}; m['pbrMetallicRoughness']['baseColorFactor'] = [1, 1, 1, 1]
        self.d['materials'].append(m); self.mats[name] = len(self.d['materials']) - 1; return self.mats[name]
    def prim(self, v_bl, t, mat, J, W, uv=None, normals_bl=None):
        """A piece of one material; save() merges pieces of the same material into one primitive (fewer draw calls)."""
        v = blender_to_gltf(v_bl).astype(np.float32)
        n = vertex_normals(v, t) if normals_bl is None else blender_to_gltf(normals_bl)
        return {'material': mat, 'raw': (v, n, np.asarray(J), np.asarray(W), None if uv is None else np.c_[uv[:, 0], 1 - uv[:, 1]], np.asarray(t).reshape(-1, 3))}
    def save(self, prims):
        nodes = self.d['nodes']; kids = []; groups = {}
        for label, p in prims: groups.setdefault((p['material'], p['raw'][4] is not None), []).append(p['raw'])
        for i, ((mat, has_uv), parts) in enumerate(groups.items()):
            off = np.cumsum([0] + [len(r[0]) for r in parts])[:-1]
            cat = lambda k: np.concatenate([r[k] for r in parts])
            a = {'POSITION': self.acc(cat(0), 5126, 'VEC3', 34962), 'NORMAL': self.acc(cat(1), 5126, 'VEC3', 34962), 'JOINTS_0': self.acc(cat(2), 5123, 'VEC4', 34962), 'WEIGHTS_0': self.acc(cat(3), 5126, 'VEC4', 34962)}
            if has_uv: a['TEXCOORD_0'] = self.acc(cat(4), 5126, 'VEC2', 34962)
            idx = np.concatenate([r[5] + o for r, o in zip(parts, off)]).reshape(-1)
            label = self.d['materials'][mat]['name']
            self.d['meshes'].append({'name': label, 'primitives': [{'attributes': a, 'indices': self.acc(idx, 5125, 'SCALAR', 34963), 'material': mat, 'mode': 4}]})
            nodes.append({'name': label, 'mesh': i, 'skin': 0}); kids.append(len(nodes) - 1)
        nodes.append({'name': self.name, 'children': [26] + kids, 'extras': self.extras})
        self.d['scenes'] = [{'nodes': [len(nodes) - 1]}]; self.d['scene'] = 0
        self.d['buffers'] = [{'byteLength': len(self.buf), 'uri': 'data:application/octet-stream;base64,' + base64.b64encode(bytes(self.buf)).decode()}]
        (WARD / (self.name + '.gltf.json')).write_text(json.dumps(self.d, separators=(',', ':')))
        return WARD / (self.name + '.gltf.json')


def vertex_normals(v, t):
    n = np.zeros_like(v); f = np.cross(v[t[:, 1]] - v[t[:, 0]], v[t[:, 2]] - v[t[:, 0]])
    for j in range(3): np.add.at(n, t[:, j], f)
    return (n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)).astype(np.float32)


def unweld_uv(v, t, uv):
    """Per-corner UVs: split vertices so each corner has its own UV (keeps seams right)."""
    key = np.c_[t.reshape(-1), np.round(uv.reshape(-1, 2) * 4096)]
    uniq, first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
    return v[t.reshape(-1)[first]], inv.reshape(-1, 3), uv.reshape(-1, 2)[first], t.reshape(-1)[first]


# ------------------------------------------------------------------ main ------------------------------------------------------------------
def main(blend):
    hero = load_hero()
    arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    hero['bones'] = {b.name: list(arm.matrix_world @ b.head_local) for b in arm.data.bones}
    htree = kdtree(hero['V'])
    dom = np.array(hero['names'])[hero['W'].argmax(1)]
    hero_body_ids = np.where(~np.array([('Arm' in d or 'Hand' in d) for d in dom]))[0]; htree_body = kdtree(hero['V'][hero_body_ids])
    bpy.ops.wm.open_mainfile(filepath=str(blend))
    minfo = material_info()
    report = {}
    feet_done = set()
    only = [x for x in (__import__('os').environ.get('ONLY','').split(',')) if x]
    for coll, (oid, label) in OUTFITS.items():
        if only and coll not in only: continue
        src = read_collection(coll)
        maps, labelled, lm = build_map(src, hero)
        clothes = Writer('cd_' + oid, {'asset': 'cd_' + oid, 'kind': 'garment', 'slots': [], 'skinUnder': ['top', 'bottom'], 'tint': None, 'hideBottomBelow': 0, 'visualRevision': 52})
        jewel = Writer('cd_' + oid + '_jewellery', {'asset': 'cd_' + oid + '_jewellery', 'kind': 'garment', 'slots': [], 'tint': None, 'hideBottomBelow': 0, 'visualRevision': 52})
        prims = []; jprims = []; feet = {}
        for o in src:
            n = o['name'].split('/')[-1]
            if (SKIP.search(n) and not FOOT.search(n)) or n.endswith('_edge'): continue  # a shoe's welt edge is a dense curve too thin to see
            fm = FOOT.search(n)
            if fm:
                feet.setdefault(fm.group(1), []).append(o); continue
            v = retarget(o['v'], maps, lm, bool(TRUNK_ONLY.search(n)), bool(re.search(r'watch', n)))
            if 'gold_hoop' in n:  # hang the hoop from the hero's ear lobe, a little smaller (the source head is much bigger)
                top = v[v[:, 2].argmax()]; sgn = 1 if v[:, 0].mean() > 0 else -1
                v = np.array(HERO_LOBE) * [sgn, 1, 1] + (v - top) * 0.75
            isj = bool(JEWEL.search(n))
            if not isj: v = push_out(v, hero, htree, 0.007)
            J, W = skin_weights(v, hero, htree, clothes.joint_index)
            body = lm['last_arm'] < 0.5  # cloth on the trunk and legs never takes weights from the hands hanging beside it
            if body.any() and 'watch' not in n:
                J[body], W[body] = skin_weights(v[body], hero, htree_body, clothes.joint_index, ids=hero_body_ids)
            for mi, mname in enumerate(o['slots']):
                sel = o['tm'] == mi
                if not sel.any(): continue
                t = o['t'][sel]
                col, img = minfo.get(mname, ([0.8, 0.8, 0.8, 1], None))
                w = jewel if isj else clothes
                mat = w.material(mname or 'cloth', col, img, rough=0.35 if mname == 'CD_gold' else 0.9, metal=0.6 if mname == 'CD_gold' else 0.0)
                if img is not None and o['uv'] is not None:
                    vv, tt, uu, src_i = unweld_uv(v, t, o['uv'][sel]); JJ = J[src_i]; WW = W[src_i]
                    p = w.prim(vv, tt, mat, JJ, WW, uu)
                else:
                    used = np.unique(t); remap = -np.ones(len(v), int); remap[used] = np.arange(len(used))
                    p = w.prim(v[used], remap[t], mat, J[used], W[used])
                (jprims if isj else prims).append((n + '_' + str(mi), p))
        # the base top and bottom stay on underneath in skin colour (extras.skinUnder; dist/src/wardrobe-v52.js), standing in for arms and legs
        clothes.save(prims); report[oid] = {'clothes': len(prims)}
        if jprims: jewel.save(jprims); report[oid]['jewellery'] = len(jprims)
        for style, objs in feet.items():
            report[oid]['feet'] = 'cd_shoes_' + style
            if style in feet_done: continue
            feet_done.add(style); write_feet(style, objs, minfo, hero)
    print(json.dumps(report, indent=1))


HERO_SHOE = {1: (np.array([0.035, -0.195, 0.0]), np.array([0.168, 0.09, 0.138])), -1: (np.array([-0.168, -0.195, 0.0]), np.array([-0.035, 0.09, 0.138]))}


def write_feet(style, objs, minfo, hero):
    w = Writer('cd_shoes_' + style, {'asset': 'cd_shoes_' + style, 'kind': 'feet', 'slots': ['shoe', 'sole'], 'tint': None, 'hideBottomBelow': 0.12 if style in ('sandals', 'slides', 'heels') else 0, 'visualRevision': 52})
    prims = []
    for s in (-1, 1):
        side = [o for o in objs if (o['v'][:, 0].mean() > 0) == (s > 0)]
        if not side: continue
        allv = np.concatenate([o['v'] for o in side])
        sole = [o for o in side if '_sole' in o['name']]; ref = np.concatenate([o['v'] for o in sole]) if sole else allv
        lo, hi = ref.min(0), ref.max(0); hlo, hhi = HERO_SHOE[s]
        # x and y from the sole's footprint onto the hero shoe's; height scaled with the footprint's length so the shoe keeps its shape
        kx = (hhi[0] - hlo[0]) / (hi[0] - lo[0]); ky = (hhi[1] - hlo[1]) / (hi[1] - lo[1]); kz = (kx + ky) / 2
        ground = allv[:, 2].min()
        bone = 'LeftFoot' if s > 0 else 'RightFoot'; toe = 'LeftToeBase' if s > 0 else 'RightToeBase'
        for o in side:
            v = o['v']; v2 = np.c_[hlo[0] + (v[:, 0] - lo[0]) * kx, hlo[1] + (v[:, 1] - lo[1]) * ky, (v[:, 2] - ground) * kz]
            tw = np.clip((-v2[:, 1] - 0.06) / 0.08, 0, 1)  # the toe half bends with the toe joint
            J = np.zeros((len(v2), 4), np.uint16); W = np.zeros((len(v2), 4), np.float32)
            J[:, 0] = w.joint_index[bone]; J[:, 1] = w.joint_index[toe]; W[:, 0] = 1 - tw; W[:, 1] = tw
            for mi, mname in enumerate(o['slots']):
                sel = o['tm'] == mi
                if not sel.any(): continue
                t = o['t'][sel]; used = np.unique(t); remap = -np.ones(len(v2), int); remap[used] = np.arange(len(used))
                col, img = minfo.get(mname, ([0.5, 0.5, 0.5, 1], None))
                mat = w.material(mname or 'shoe', col, None, rough=0.35 if mname == 'CD_gold' else 0.8, metal=0.6 if mname == 'CD_gold' else 0.0)
                prims.append((o['name'].split('/')[-1] + '_' + str(mi), w.prim(v2[used], remap[t], mat, J[used], W[used])))
    # sandals, slides and heels show the foot: the hero's own feet in skin colour
    if style in ('sandals', 'slides', 'heels'):
        v, n, J, W, t = read_gltf_prim(WARD / 'sandals.gltf.json', 'skin')
        to_bl = lambda a: np.c_[a[:, 0], -a[:, 2], a[:, 1]]
        prims.append(('foot_skin', w.prim(to_bl(v), t.reshape(-1, 3), w.material('skin', [0.55, 0.36, 0.24, 1]), J, W, normals_bl=to_bl(n))))
    w.save(prims)


def read_gltf_prim(path, material):
    """One primitive's arrays from an embedded-buffer glTF (glTF coordinates), found by material name."""
    g = json.loads(Path(path).read_text()); buf = base64.b64decode(g['buffers'][0]['uri'].split(',', 1)[1])
    def arr(i):
        a = g['accessors'][i]; bv = g['bufferViews'][a['bufferView']]
        dt = {5126: '<f4', 5125: '<u4', 5123: '<u2', 5121: 'u1'}[a['componentType']]; k = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
        return np.frombuffer(buf, dt, a['count'] * k, bv.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(a['count'], k).squeeze()
    for m in g['meshes']:
        for p in m['primitives']:
            if g['materials'][p['material']]['name'] == material:
                at = p['attributes']
                return arr(at['POSITION']), arr(at['NORMAL']), arr(at['JOINTS_0']).astype(np.uint16), arr(at['WEIGHTS_0']).astype(np.float32), arr(p['indices'])
    raise KeyError(material)


if __name__ == '__main__':
    main(Path(sys.argv[-1]).resolve())

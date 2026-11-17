"""Turn the delivered V71 carry-walk candidate into the game's Player 1 asset (dist/assets/characters/player1-v71.glb).

    python3 tools/player1_v71_shared_albedo.py player1-v71-carrywalk-candidate.glb dist/assets/characters/player1-v71.glb

The candidate (SHA-256 79c78e31..., from Compound_Days_V71_CarryWalk_Review.zip) carries two repairs on the V61 figure:
the V70 rebuilt underarm shirt panel and the V71 WalkCarry shoulder clearance. Its panel has a material of its own
('top_v70_rebuilt_panel') with a second texture and UVs laid out for that texture. The game draws the figure with one
albedo: hero61Dress (dist/src/hero-v61.js) puts HERO61.albedo on every textured primitive, and shirt66Dress
(dist/src/shirt-v66.js) recolours only materials named 'top'. Loaded as delivered, the panel samples the whole atlas
through the wrong UVs (a blue and black blotch under the left arm) and keeps its colour when the shirt colour changes.

This tool changes nothing about the shape or the motion. It
  1. gives the panel the tee's own material ('top', the shared albedo) and points every panel UV at one flat cloth
     texel block of that albedo (PANEL_UV), whose colour is the mean colour of the delivered panel texture (that
     texture is one flat colour to within one 8-bit step, so no drawn detail is lost);
  2. drops the panel's material, texture and image, and the untextured material of the V61 flat patch, which
     nothing references any more;
  3. repacks the buffer so only data that a primitive, the skin, a clip or the albedo references is stored: vertices
     no primitive indexes are dropped and the indices renumbered. Triangle order, every vertex value and every
     animation key are kept bit for bit (checked below before the file is written).
"""
import json,struct,sys,hashlib
import numpy as np

SOURCE_SHA256='79c78e311ab324ad804e3ead5263930030b54753027b49e839f9e1fd32c77fe7'
PANEL_MATERIAL='top_v70_rebuilt_panel'
# Centre of the 16 px block at x 740..755, y 292..307 of the 1024 px albedo: mean colour (246.5, 236.7, 227.7), the
# delivered panel texture's own mean, with a per-channel deviation under 1 of 255 across the block.
PANEL_UV=(748/1024,300/1024)
CT={5120:np.int8,5121:np.uint8,5122:np.int16,5123:np.uint16,5125:np.uint32,5126:np.float32}
NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}

def read_glb(path):
    raw=open(path,'rb').read()
    assert raw[:4]==b'glTF','not a GLB'
    jl=struct.unpack_from('<I',raw,12)[0]; g=json.loads(raw[20:20+jl])
    bl=struct.unpack_from('<I',raw,20+jl)[0]; return raw,g,raw[28+jl:28+jl+bl]

def accessor(g,binc,i):
    a=g['accessors'][i]; v=g['bufferViews'][a['bufferView']]; n=NC[a['type']]; dt=np.dtype(CT[a['componentType']])
    assert 'sparse' not in a and v.get('byteStride',dt.itemsize*n)==dt.itemsize*n,'only tightly packed accessors are handled'
    off=v.get('byteOffset',0)+a.get('byteOffset',0)
    return np.frombuffer(binc,dt,count=a['count']*n,offset=off).reshape(a['count'],n)

def soup(g,binc,prim):
    """The triangles of one primitive as raw bytes per attribute, corner by corner: what the renderer draws."""
    idx=accessor(g,binc,prim['indices']).ravel()
    return {k:accessor(g,binc,v)[idx].tobytes() for k,v in sorted(prim['attributes'].items())}

def main(src,dst):
    raw,g,binc=read_glb(src)
    got=hashlib.sha256(raw).hexdigest()
    if got!=SOURCE_SHA256: raise SystemExit('source is not the delivered V71 candidate: SHA-256 '+got)
    assert len(g['meshes'])==1 and len(g['buffers'])==1
    prims=g['meshes'][0]['primitives']; mats=g['materials']
    top=next(i for i,m in enumerate(mats) if m['name']=='top' and 'baseColorTexture' in m['pbrMetallicRoughness'])
    panel=[p for p in prims if mats[p['material']]['name']==PANEL_MATERIAL]
    assert len(panel)==1 and mats[top]['pbrMetallicRoughness']['baseColorTexture']['index']==0
    panel=panel[0]; panel_uv=panel['attributes']['TEXCOORD_0']
    assert not any(p is not panel and panel_uv in p['attributes'].values() for p in prims),'panel UVs are shared'

    # 1. the panel wears the tee's material and one flat cloth texel of the shared albedo
    data={i:accessor(g,binc,i).copy() for i in range(len(g['accessors']))}
    data[panel_uv][:]=np.array(PANEL_UV,np.float32)
    panel['material']=top
    # 2. the panel's own material, texture and image are unreferenced now (they are the last of each list)
    assert mats[-1]['name']==PANEL_MATERIAL and len(g['textures'])==2 and len(g['images'])==2
    assert mats[-1]['pbrMetallicRoughness']['baseColorTexture']['index']==1 and g['textures'][1]['source']==1
    mats.pop(); g['textures'].pop(); g['images'].pop()
    # ... and so is the untextured 'top' of the V61 flat patch, whose triangles the panel replaced
    live=sorted({p['material'] for p in prims}); assert [mats[i]['name'] for i in live]==['skin','hair','top','bottom','shoe']
    for p in prims: p['material']=live.index(p['material'])
    g['materials']=mats=[mats[i] for i in live]
    assert all('baseColorTexture' in m['pbrMetallicRoughness'] for m in mats)
    before=[{k:data[v][data[p['indices']].ravel()].tobytes() for k,v in sorted(p['attributes'].items())} for p in prims]

    # 3. repack: primitives that share vertex accessors keep sharing them, minus the vertices none of them indexes
    groups={}
    for p in prims: groups.setdefault(tuple(sorted(p['attributes'].items())),[]).append(p)
    chunks=[]; views=[]; accs=[]; size=0
    def add_view(b,target=None):
        nonlocal size
        pad=(-size)%4
        if pad: chunks.append(b'\0'*pad); size+=pad
        v={'buffer':0,'byteOffset':size,'byteLength':len(b)}
        if target: v['target']=target
        chunks.append(b); size+=len(b); views.append(v); return len(views)-1
    def add_acc(old,arr,target=None,minmax=False):
        a=g['accessors'][old]
        na={'bufferView':add_view(np.ascontiguousarray(arr).tobytes(),target),'byteOffset':0,'componentType':a['componentType'],'count':len(arr),'type':a['type']}
        if a.get('normalized'): na['normalized']=True
        if minmax or 'min' in a: na['min']=[float(x) for x in arr.min(0)]; na['max']=[float(x) for x in arr.max(0)]
        accs.append(na); return len(accs)-1
    kept=dropped=0
    for key,members in groups.items():
        count=g['accessors'][key[0][1]]['count']
        used=np.zeros(count,bool)
        for p in members: used[data[p['indices']].ravel()]=True
        remap=np.cumsum(used)-1; kept+=int(used.sum()); dropped+=int(count-used.sum())
        attrs={name:add_acc(old,data[old][used],34962,minmax=(name=='POSITION')) for name,old in key}
        for p in members:
            old=p['indices']; ia=g['accessors'][old]
            new=remap[data[old].ravel()].astype(CT[ia['componentType']]).reshape(-1,1)
            p['indices']=add_acc(old,new,34963); p['attributes']=dict(attrs)
    moved={}
    def keep(old):
        if old not in moved: moved[old]=add_acc(old,data[old])
        return moved[old]
    for s in g['skins']: s['inverseBindMatrices']=keep(s['inverseBindMatrices'])
    for an in g['animations']:
        for s in an['samplers']: s['input']=keep(s['input']); s['output']=keep(s['output'])
    for im in g['images']:
        v=g['bufferViews'][im['bufferView']]; o=v.get('byteOffset',0)
        im['bufferView']=add_view(bytes(binc[o:o+v['byteLength']]))
    g['accessors']=accs; g['bufferViews']=views
    blob=b''.join(chunks); blob+=b'\0'*((-len(blob))%4)
    g['buffers']=[{'byteLength':len(blob)}]
    for n in g['nodes']:
        ex=n.get('extras')
        if ex and 'visualRevision' in ex: ex['visualRevision']='v71-shared-albedo'; ex['candidateSha256']=SOURCE_SHA256
    g['asset']['generator']+='; V71 game asset (panel on the shared albedo, unreferenced data dropped)'

    # what is drawn and what is animated must be bit for bit what the candidate held (with the panel's new UVs)
    after=[soup(g,blob,p) for p in prims]
    assert after==before,'repacking changed a primitive'
    js=json.dumps(g,separators=(',',':')).encode(); js+=b' '*((-len(js))%4)
    out=b'glTF'+struct.pack('<II',2,12+8+len(js)+8+len(blob))+struct.pack('<I',len(js))+b'JSON'+js+struct.pack('<I',len(blob))+b'BIN\0'+blob
    open(dst,'wb').write(out)
    tris=sum(g['accessors'][p['indices']]['count']//3 for p in prims)
    print(f'{dst}: {len(out)} bytes, SHA-256 {hashlib.sha256(out).hexdigest()}')
    print(f'{len(prims)} primitives, {tris} triangles, {kept} vertices kept, {dropped} unreferenced vertices dropped, source {len(raw)} bytes')

if __name__=='__main__':
    if len(sys.argv)!=3: raise SystemExit(__doc__)
    main(sys.argv[1],sys.argv[2])

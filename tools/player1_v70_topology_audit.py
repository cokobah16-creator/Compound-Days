#!/usr/bin/env python3
"""Non-destructive V70 shirt seam topology audit.

Uses the existing V69 GLB reader and reports geometric evidence; it does NOT
claim to weld vertices, retopologize, repair normals or deploy an asset.
Usage: python3 tools/player1_v70_topology_audit.py input.glb report.json
"""
import json, sys
from collections import Counter, defaultdict
from pathlib import Path
import numpy as np
from player1_v69_seam import unpack, acc

def audit(src, dest):
    j, blob, sha = unpack(src)
    ps = j['meshes'][0]['primitives']
    mats = j['materials']
    tops = [(i, p) for i,p in enumerate(ps) if mats[p['material']]['name']=='top']
    if len(tops)!=2:
        raise ValueError('Expected exactly two top primitives (shirt + patch)')
    main_id,main = max(tops,key=lambda x:acc(j,blob,x[1]['indices']).size)
    patch_id,patch = min(tops,key=lambda x:acc(j,blob,x[1]['indices']).size)
    main_idx = acc(j,blob,main['indices']).reshape(-1).astype(np.int64)
    patch_idx = acc(j,blob,patch['indices']).reshape(-1).astype(np.int64)
    if len(patch_idx)!=435: raise ValueError('Unexpected patch topology')
    def positions(p):
        return acc(j,blob,p['attributes']['POSITION']).astype(np.float64)
    main_pos, patch_pos = positions(main),positions(patch)
    def tri_edges(idx,pos):
        if len(idx)%3:raise ValueError('Non-triangle indices')
        edge_counts=Counter()
        degenerate=0; minarea=1e9; areas=[]
        for a,b,c in idx.reshape(-1,3):
            if max(a,b,c)>=len(pos):raise ValueError('Index outside POSITION accessor')
            p,q,r=pos[[a,b,c]]
            area=float(np.linalg.norm(np.cross(q-p,r-p))*.5)
            areas.append(area);minarea=min(minarea,area)
            if area<1e-10:degenerate+=1
            for u,v in [(a,b),(b,c),(c,a)]:
                edge_counts[tuple(sorted((int(u),int(v))))]+=1
        return edge_counts,degenerate,areas
    me,md,ma=tri_edges(main_idx,main_pos)
    pe,pd,pa=tri_edges(patch_idx,patch_pos)
    # Quantized POSITION key is used for geometric edge matching across
    # primitives even when V69 compacted its vertex accessors.
    def edge_geom(e,pos,decimals=5):
        d=defaultdict(int)
        for (u,v),n in e.items():
            a=tuple(np.round(pos[u],decimals)),tuple(np.round(pos[v],decimals))
            d[tuple(sorted((a,b)))]+=n
        return d
    mg,pg=edge_geom(me,main_pos),edge_geom(pe,patch_pos)
    main_boundary={e for e,n in mg.items() if n==1}
    patch_boundary={e for e,n in pg.items() if n==1}
    touching=main_boundary & patch_boundary
    unmatched=patch_boundary-main_boundary
    # Distance to nearest shirt vertex is an indicator only, not proof
    # of a hole: shirt may have intentionally separate surfaces.
    main_used=main_pos[np.unique(main_idx)]
    patch_used=patch_pos[np.unique(patch_idx)]
    distances=[]
    for p in patch_used:
        d=np.sum((main_used-p)**2,axis=1)
        distances.append(float(np.sqrt(d.min())))
    result={
      'status':'DIAGNOSTIC_ONLY','input':Path(src).name,'sha256':sha,
      'main_primitive':main_id,'patch_primitive':patch_id,
      'main_triangles':len(main_idx)//3,'patch_triangles':len(patch_idx)//3,
      'patch_degenerate_triangles':pd,'main_degenerate_triangles':md,
      'patch_boundary_edges':len(patch_boundary),
      'main_boundary_edges':len(main_boundary),
      'patch_boundary_edges_matching_main':len(touching),
      'patch_boundary_edges_not_matching_main':len(unmatched),
      'patch_nonmanifold_edges':sum(n>2 for n in pg.values()),
      'patch_min_triangle_area_m2':float(min(pa)),
      'patch_nearest_main_vertex_distance_m':{
        'min':float(min(distances)),'median':float(np.median(distances)),
        'max':float(max(distances))},
      'warnings':[],
      'limitations':['Geometric matching uses 1e-5 m coordinate quantization',
        'No weld or topology edits performed',
        'Separate fabric surfaces and sleeves can have legitimate open boundaries',
        'Cannot establish clipping during animation without rendered review']
    }
    if unmatched:result['warnings'].append('Patch has boundary edges without matching main-shirt edges')
    if pd:result['warnings'].append('Patch contains zero-area triangles')
    if result['patch_nonmanifold_edges']:result['warnings'].append('Patch has non-manifold edges')
    Path(dest).parent.mkdir(parents=True,exist_ok=True)
    Path(dest).write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))
    return result

if __name__=='__main__':
    if len(sys.argv)!=3:raise SystemExit('Usage: python3 tools/player1_v70_topology_audit.py input.glb report.json')
    audit(sys.argv[1],sys.argv[2])

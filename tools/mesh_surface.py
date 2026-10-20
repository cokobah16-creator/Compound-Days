"""Shared-vertex surface nets for the v19 clothing shells. Requires numpy."""
import numpy as np

def surface_net(field,lo,hi,step):
    """One shared surface vertex per crossed voxel; economical smooth quad topology."""
    axes=[np.arange(a,b+step*.51,step) for a,b in zip(lo,hi)]
    grid=np.stack(np.meshgrid(*axes,indexing='ij'),-1)
    values=field(grid.reshape(-1,3)).reshape(grid.shape[:-1]);shape=values.shape
    offsets=np.array([(0,0,0),(1,0,0),(0,1,0),(1,1,0),
                      (0,0,1),(1,0,1),(0,1,1),(1,1,1)])
    cv=np.stack([values[a:shape[0]-1+a,b:shape[1]-1+b,c:shape[2]-1+c]
                 for a,b,c in offsets],axis=-1)
    active=(cv.min(-1)<0)&(cv.max(-1)>0)
    ci=np.argwhere(active);vals=cv[active]
    corners=grid[tuple((ci[:,None,:]+offsets).transpose(2,0,1))]
    verts=np.zeros((len(ci),3));counts=np.zeros(len(ci))
    edges=[(0,1),(2,3),(4,5),(6,7),(0,2),(1,3),(4,6),(5,7),(0,4),(1,5),(2,6),(3,7)]
    for a,b in edges:
        mask=(vals[:,a]<0)!=(vals[:,b]<0)
        t=vals[mask,a]/(vals[mask,a]-vals[mask,b])
        verts[mask]+=corners[mask,a]+t[:,None]*(corners[mask,b]-corners[mask,a])
        counts[mask]+=1
    verts/=counts[:,None]
    lookup=np.full(active.shape,-1,int);lookup[active]=np.arange(len(ci))
    quads=[]
    neighbours=[[(0,-1,-1),(0,0,-1),(0,0,0),(0,-1,0)],
                [(-1,0,-1),(-1,0,0),(0,0,0),(0,0,-1)],
                [(-1,-1,0),(0,-1,0),(0,0,0),(-1,0,0)]]
    for axis in range(3):
        a=[slice(None)]*3;b=a.copy();a[axis]=slice(None,-1);b[axis]=slice(1,None)
        pos=np.argwhere((values[tuple(a)]<0)!=(values[tuple(b)]<0))
        other=[i for i in range(3) if i!=axis]
        valid=np.ones(len(pos),bool)
        for i in other:valid&=(pos[:,i]>0)&(pos[:,i]<shape[i]-1)
        pos=pos[valid]
        q=np.stack([lookup[tuple((pos+off).T)] for off in neighbours[axis]],1)
        quads.append(q[(q>=0).all(1)])
    q=np.concatenate(quads)
    tri=np.concatenate([q[:,[0,1,2]],q[:,[0,2,3]]])
    centres=verts[tri].mean(1);eps=step*.1
    grad=np.column_stack([(field(centres+np.eye(3)[k]*eps)-field(centres-np.eye(3)[k]*eps))/(2*eps) for k in range(3)])
    fn=np.cross(verts[tri[:,1]]-verts[tri[:,0]],verts[tri[:,2]]-verts[tri[:,0]])
    flip=(fn*grad).sum(1)<0;tri[flip]=tri[flip][:,[0,2,1]]
    return verts,tri


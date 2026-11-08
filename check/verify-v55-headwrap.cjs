// V55 structural regression for the temporary headwrap knot correction.
// This does not replace an actual visual review in Blender/the mobile game.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const gltf=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/assets/wardrobe/headwrap_everyday.gltf.json'),'utf8'));
assert.equal(gltf.nodes[0].name,'headwrap');
assert.equal(gltf.materials[0].name,'wrap_print');
assert.equal(gltf.extras?.v55Headwrap?.status,'prototype-review');
const b=Buffer.from(gltf.buffers[0].uri.split(',')[1],'base64');
assert.equal(b.length,gltf.buffers[0].byteLength);
const V=new DataView(b.buffer,b.byteOffset,b.byteLength);
function accessor(i){
 const a=gltf.accessors[i],bv=gltf.bufferViews[a.bufferView];
 return {a,offset:(bv.byteOffset||0)+(a.byteOffset||0),stride:bv.byteStride||(a.type==='VEC3'?12:2)};
}
const p=gltf.meshes[0].primitives[0],P=accessor(p.attributes.POSITION),N=accessor(p.attributes.NORMAL),I=accessor(p.indices);
assert.equal(P.a.count,3101);
assert.equal(I.a.count,14148);
assert.equal(P.a.componentType,5126);
assert.equal(I.a.componentType,5123);
function xyz(a,i){return [0,1,2].map(k=>V.getFloat32(a.offset+i*a.stride+4*k,true));}
const verts=Array.from({length:P.a.count},(_,i)=>xyz(P,i));
const idx=Array.from({length:I.a.count},(_,i)=>V.getUint16(I.offset+2*i,true));
const parent=Array.from({length:P.a.count},(_,i)=>i);
function find(x){while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x]}return x}
function union(a,b){a=find(a);b=find(b);if(a!==b)parent[a]=b}
for(let t=0;t<idx.length;t+=3){union(idx[t],idx[t+1]);union(idx[t],idx[t+2]);}
const groups=new Map();
for(let i=0;i<verts.length;i++){const root=find(i);if(!groups.has(root))groups.set(root,[]);groups.get(root).push(i);}
// v55 head: the wrap is refit onto the smaller anatomical skull (tools/hero_head.py), which brings the lobes in and down
// (about x 0.08-0.16, y 0.28-0.32), so they are found on the wearer's left above 0.25 m rather than x 0.10 / y 0.32
const lobes=[...groups.values()].filter(ids=>ids.length===135&&ids.every(i=>verts[i][0]>.05&&verts[i][1]>.25));
assert.equal(lobes.length,2,'expect two isolated knot lobes');
for(const ids of lobes){
 const high=Math.max(...ids.map(i=>verts[i][1]));
 assert(high<=.402,'knot lobe still protrudes too high: '+high);
 for(const i of ids){const a=xyz(N,i),m=Math.hypot(...a);assert(m>.5&&m<1.5,'invalid surface normal '+i);}
}
for(let k=0;k<3;k++){
 const lo=Math.min(...verts.map(v=>v[k])),hi=Math.max(...verts.map(v=>v[k]));
 assert(Math.abs(lo-P.a.min[k])<1e-5,'position min mismatch '+k);
 assert(Math.abs(hi-P.a.max[k])<1e-5,'position max mismatch '+k);
}
console.log('PASS: V55 headwrap geometry intact; both knot lobes below 0.402m; normals, indices and bounds valid.');

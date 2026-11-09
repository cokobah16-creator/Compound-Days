#!/usr/bin/env node
// Run: node check/verify-rig-scale-v63.cjs ORIGINAL.glb SCALE_BAKED.glb
// Structural check: does NOT replace Three.js, gameplay, or mobile device QA.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const files=process.argv.slice(2);
if(files.length!==2){console.error('Need ORIGINAL.glb and SCALE_BAKED.glb');process.exit(2)}
function load(name){
 const b=fs.readFileSync(name);assert.equal(b.toString('ascii',0,4),'glTF');
 const n=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+n).toString());
 const o=20+n;return {j,b:b.subarray(o+8,o+8+b.readUInt32LE(o))};
}
function bytes(g,id){
 const a=g.j.accessors[id],v=g.j.bufferViews[a.bufferView];
 const unit={5121:1,5123:2,5125:4,5126:4}[a.componentType];
 const comp={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type];
 const step=v.byteStride||unit*comp,off=(v.byteOffset||0)+(a.byteOffset||0);
 return Buffer.concat(Array.from({length:a.count},(_,i)=>g.b.subarray(off+i*step,off+i*step+comp*unit)));
}
const A=load(files[0]),B=load(files[1]);
function arm(g){const a=g.j.nodes.filter(n=>n.name==='Armature');assert.equal(a.length,1);return a[0];}
assert.equal(arm(A).scale[0],.01);
assert.deepEqual(arm(B).scale,[1,1,1]);
for(let i=0;i<A.j.meshes.length;i++){
 const m=A.j.meshes[i],n=B.j.meshes[i];
 for(let p=0;p<m.primitives.length;p++){
  const x=m.primitives[p],y=n.primitives[p];
  for(const key of ['POSITION','NORMAL','TANGENT','TEXCOORD_0','JOINTS_0','WEIGHTS_0'])
   if(x.attributes[key]!==undefined)assert(bytes(A,x.attributes[key]).equals(bytes(B,y.attributes[key])),key+' changed');
  assert(bytes(A,x.indices).equals(bytes(B,y.indices)),'faces changed');
  for(let q=0;q<(x.targets||[]).length;q++)for(const k in x.targets[q])
   assert(bytes(A,x.targets[q][k]).equals(bytes(B,y.targets[q][k])),'morph changed');
 }
}
function IBM(g){const data=bytes(g,g.j.skins[0].inverseBindMatrices);
 return Array.from({length:data.length/64},(_,i)=>Array.from({length:16},(_,j)=>data.readFloatLE(i*64+j*4)));
}
const x=IBM(A),y=IBM(B);assert.equal(x.length,y.length);
for(let i=0;i<x.length;i++)for(let n=0;n<16;n++){
 const want=n%4===3?x[i][n]:x[i][n]*.01;
 assert(Math.abs(y[i][n]-want)<=Math.max(5e-6,Math.abs(want)*2e-6),'IBM discrepancy');
}
const clipsA=A.j.animations.map(a=>a.name),clipsB=B.j.animations.map(a=>a.name);
assert.deepEqual(clipsA,clipsB);
let trans=0;
for(let i=0;i<clipsA.length;i++){
 const ca=A.j.animations[i],cb=B.j.animations[i];assert.equal(ca.channels.length,cb.channels.length);
 for(let k=0;k<ca.channels.length;k++){
  const ch=ca.channels[k],ta=ca.samplers[ch.sampler],tb=cb.samplers[cb.channels[k].sampler];
  assert(bytes(A,ta.input).equals(bytes(B,tb.input)),'animation time changed');
  if(ch.target.path==='translation'){
   const av=bytes(A,ta.output),bv=bytes(B,tb.output);assert.equal(av.length,bv.length);
   for(let q=0;q<av.length;q+=4)assert(Math.abs(bv.readFloatLE(q)-av.readFloatLE(q)*.01)<.00003,'anim translation changed incorrectly');
   trans++;
  }else assert(bytes(A,ta.output).equals(bytes(B,tb.output)),'rotation/other anim data changed');
 }
}
const acc=A.j.accessors[A.j.meshes[0].primitives[0].attributes.POSITION];
const h=acc.max[1]-acc.min[1];assert(h>1.69&&h<1.71);
assert.equal(arm(B).extras.compoundDaysScaleBake.version,'V63');
console.log(JSON.stringify({structure:'PASS',jointCount:x.length,clips:clipsA,
 oldStaticHeightMeters:h*.01,newStaticHeightMeters:h,scaleRatio:100,
 animationTranslationChannels:trans,gameReady:false},null,2));
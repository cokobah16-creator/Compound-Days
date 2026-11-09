#!/usr/bin/env node
// GLB 2.0 Meshy rig scale normalization for Compound Days.
// Usage: node tools/bake-armature-scale-v63.cjs INPUT.glb OUTPUT.glb
// Converts 0.01-root armatures into metre-scale roots without changing mesh data.
// Does not imply wardrobe, face, or game readiness.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const [input,output]=process.argv.slice(2);
if(!input||!output){console.error('Usage: node tools/bake-armature-scale-v63.cjs INPUT.glb OUTPUT.glb');process.exit(2)}
const source=fs.readFileSync(input);
assert.equal(source.toString('ascii',0,4),'glTF');assert.equal(source.readUInt32LE(4),2);
const jlen=source.readUInt32LE(12);assert.equal(source.readUInt32LE(16),0x4e4f534a);
const gltf=JSON.parse(source.subarray(20,20+jlen).toString('utf8'));
const offset=20+jlen;assert.equal(source.readUInt32LE(offset+4),0x004e4942);
const binary=Buffer.from(source.subarray(offset+8,offset+8+source.readUInt32LE(offset)));
assert.equal(gltf.buffers.length,1);assert(binary.length>=gltf.buffers[0].byteLength);
const roots=gltf.nodes.map((n,i)=>n.name==='Armature'?i:-1).filter(i=>i>=0);
assert.equal(roots.length,1,'Expected exactly one Armature root');
const root=roots[0],arm=gltf.nodes[root],s=arm.scale;
assert(s&&s.length===3&&s.every(x=>Math.abs(x-.01)<1e-6),'Expected 0.01 armature scale');
assert(!arm.matrix&&!arm.translation&&!arm.rotation&&!arm.skin&&!arm.mesh,'Unsupported root transform');
const parent=new Map();gltf.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parent.set(c,i)));
assert(!parent.has(root),'Armature must be a scene root');
const descendants=new Set(),stack=[...(arm.children||[])];
while(stack.length){const i=stack.pop();if(descendants.has(i))continue;descendants.add(i);stack.push(...(gltf.nodes[i].children||[]));}
const meshNodes=[...descendants].filter(i=>gltf.nodes[i].skin!==undefined);
assert.equal(meshNodes.length,1,'Only one skinned mesh supported');
for(const i of descendants)assert(!gltf.nodes[i].matrix,'No matrix-form descendants supported');
const scale=.01;arm.scale=[1,1,1];let editedNodes=0;
for(const i of descendants){const n=gltf.nodes[i];if(n.translation){n.translation=n.translation.map(x=>Math.fround(x*scale));editedNodes++;}}
const outputs=new Set(),other=new Set();
for(const animation of gltf.animations||[]){
 for(const sample of animation.samplers||[])other.add(sample.input);
 for(const channel of animation.channels){
  const accessor=animation.samplers[channel.sampler].output;
  if(channel.target.path==='translation'&&descendants.has(channel.target.node))outputs.add(accessor);
  else other.add(accessor);
 }
}
for(const ai of outputs)assert(!other.has(ai),'Shared accessor cannot be safely scaled: '+ai);
function view(index,stride){
 const a=gltf.accessors[index],v=gltf.bufferViews[a.bufferView];
 assert(!a.sparse,'Sparse accessor unsupported');
 return {a,pos:(v.byteOffset||0)+(a.byteOffset||0),stride:v.byteStride||stride};
}
for(const ai of outputs){
 const {a,pos,stride}=view(ai,12);
 assert.equal(a.type,'VEC3');assert.equal(a.componentType,5126);
 const low=[Infinity,Infinity,Infinity],high=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<a.count;i++)for(let k=0;k<3;k++){
  const at=pos+i*stride+k*4,x=Math.fround(binary.readFloatLE(at)*scale);
  binary.writeFloatLE(x,at);low[k]=Math.min(low[k],x);high[k]=Math.max(high[k],x);
 }
 if(a.min)a.min=low;if(a.max)a.max=high;
}
for(const skin of gltf.skins||[]){
 const {a,pos,stride}=view(skin.inverseBindMatrices,64);
 assert.equal(a.type,'MAT4');assert.equal(a.componentType,5126);
 // The new joint world basis has 100x its old basis. Multiply the first
 // three rows of each inverse-bind matrix by .01 to compensate exactly.
 for(let i=0;i<a.count;i++)for(let col=0;col<4;col++)for(let row=0;row<3;row++){
  const at=pos+i*stride+(col*4+row)*4;
  binary.writeFloatLE(Math.fround(binary.readFloatLE(at)*scale),at);
 }
}
arm.extras={...(arm.extras||{}),compoundDaysScaleBake:{
 version:'V63',sourceRootScale:0.01,
 method:'Bake armature scale into joint translations, animated translations, and inverse bind matrices; geometry unchanged',
 status:'review-only'}};
gltf.buffers[0].byteLength=binary.length;
let js=Buffer.from(JSON.stringify(gltf),'utf8');
js=Buffer.concat([js,Buffer.alloc((4-js.length%4)%4,0x20)]);
const bin=Buffer.concat([binary,Buffer.alloc((4-binary.length%4)%4)]);
const header=Buffer.alloc(12),jhead=Buffer.alloc(8),bhead=Buffer.alloc(8);
header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+js.length+8+bin.length,8);
jhead.writeUInt32LE(js.length);jhead.write('JSON',4);
bhead.writeUInt32LE(bin.length);bhead.write('BIN\0',4);
const target=Buffer.concat([header,jhead,js,bhead,bin]);fs.writeFileSync(output,target);
console.log(JSON.stringify({
 source:input,output,sha256:crypto.createHash('sha256').update(target).digest('hex'),
 nodesScaled:editedNodes,translationAccessorsScaled:outputs.size,skinnedMeshes:meshNodes.length,
 geometryUnchanged:true,actualThreeJsProofRequired:true,liveGameChanged:false
},null,2));
#!/usr/bin/env node
// Offline V61 body + garment compatibility. It is NOT a live wardrobe deployment test.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const files=process.argv.slice(2);
if(files.length!==2){console.error('Usage: node check/verify-v61-pair.cjs BODY.glb OUTFIT.glb');process.exit(2);}
function read(filename){const B=fs.readFileSync(filename);assert.equal(B.subarray(0,4).toString(),'glTF');assert.equal(B.readUInt32LE(4),2);const size=B.readUInt32LE(12),j=JSON.parse(B.subarray(20,20+size).toString());const o=20+size;assert.equal(B.readUInt32LE(o+4),0x004e4942);return {j,b:B.subarray(o+8,o+8+B.readUInt32LE(o))};}
function accessor(asset,id){const a=asset.j.accessors[id],v=asset.j.bufferViews[a.bufferView],parts={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16},bytes={5121:1,5123:2,5125:4,5126:4};const stride=v.byteStride||parts[a.type]*bytes[a.componentType],begin=(v.byteOffset||0)+(a.byteOffset||0);return Buffer.concat(Array.from({length:a.count},(_,i)=>asset.b.subarray(begin+i*stride,begin+i*stride+parts[a.type]*bytes[a.componentType])));}
const A=read(files[0]),B=read(files[1]);
const a=A.j.skins[0],b=B.j.skins[0];const names=x=>x.j.skins[0].joints.map(i=>x.j.nodes[i].name);
assert.deepEqual(names(A),names(B),'Skin joint order differs');assert.equal(names(A).length,27,'Expected bridge 27 joints');
assert(accessor(A,a.inverseBindMatrices).equals(accessor(B,b.inverseBindMatrices)),'Inverse bind bytes mismatch');
assert.deepEqual(A.j.animations.map(x=>x.name),B.j.animations.map(x=>x.name));
for(let i=0;i<A.j.animations.length;i++){const ac=A.j.animations[i],bc=B.j.animations[i];assert.equal(ac.samplers.length,bc.samplers.length);for(let k=0;k<ac.samplers.length;k++){for(const typ of ['input','output'])assert(accessor(A,ac.samplers[k][typ]).equals(accessor(B,bc.samplers[k][typ])),'Animation data mismatch: '+i+'/'+k+'/'+typ);}}
const slots=B.j.meshes[0].primitives.map(p=>B.j.materials[p.material].name);
for(const n of ['top','bottom','shoe'])assert(slots.includes(n),'Missing Everyday outfit slot: '+n);
const tris=B.j.meshes[0].primitives.reduce((sum,p)=>sum+B.j.accessors[p.indices].count/3,0);
const out={status:'PASS: pair uses same bind pose and animations',joints:names(A).length,clips:A.j.animations.map(a=>a.name),fittedOutfitSlots:slots,garmentTriangles:tris,legacyHeroCompatible:'NOT TESTED: requires retarget',gameReady:false};
console.log(JSON.stringify(out,null,2));

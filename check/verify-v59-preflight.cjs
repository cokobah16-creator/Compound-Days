#!/usr/bin/env node
// Candidate GLB vs shipped hero: fail-closed preflight, deliberately non-deploying.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const filename=process.argv[2];
if(!filename){console.error('Usage: node check/verify-v59-preflight.cjs <candidate.glb>');process.exitCode=2;return;}
const root=path.join(__dirname,'..');
function load(p){
 const bytes=fs.readFileSync(p);
 if(bytes.subarray(0,4).toString()==='glTF'){
  assert.equal(bytes.readUInt32LE(4),2);
  const jsonSize=bytes.readUInt32LE(12);const j=JSON.parse(bytes.subarray(20,20+jsonSize).toString());
  const binaryStart=20+jsonSize+8;const size=bytes.readUInt32LE(20+jsonSize);
  return {j,b:bytes.subarray(binaryStart,binaryStart+size)};
 }
 const j=JSON.parse(bytes.toString('utf8'));
 return {j,b:Buffer.from(j.buffers[0].uri.split(',')[1],'base64')};
}
function ibm({j,b}){
 if(!j.skins?.length)return null;
 const a=j.accessors[j.skins[0].inverseBindMatrices],v=j.bufferViews[a.bufferView];
 const offset=(v.byteOffset||0)+(a.byteOffset||0);
 const names=j.skins[0].joints.map(n=>j.nodes[n].name);
 const stride=v.byteStride||64;
 const mat=Buffer.concat(Array.from({length:a.count},(_,i)=>b.subarray(offset+i*stride,offset+i*stride+64)));
 return {names,mat};
}
const candidate=load(path.resolve(filename)),hero=load(path.join(root,'dist/assets/characters/efe.gltf.json'));
const ci=ibm(candidate),hi=ibm(hero);
const required=['idle','walk','carry','carryLow','walkCarry','walkCarryLow','pick','wave'];
const clips=(candidate.j.animations||[]).map(a=>a.name);
const mats=(candidate.j.materials||[]).map(m=>m.name);
const garments=['tee','cd_overalls'].map(name=>{
 const p=path.join(root,'dist/assets/wardrobe',name+'.gltf.json'),w=ibm(load(p));
 return {name,heroBindCompatible:w.names.join('|')===hi.names.join('|')&&w.mat.equals(hi.mat),
 candidateBindCompatible:w.names.join('|')===ci.names.join('|')&&w.mat.equals(ci.mat)};
});
const issues=[];
if(ci.names.join('|')!==hi.names.join('|'))issues.push('joint names/order mismatch');
if(!ci.mat.equals(hi.mat))issues.push('inverse bind matrices differ');
for(const k of ['skin','top','bottom','shoe','sole'])if(!mats.includes(k))issues.push('missing hero material slot: '+k);
for(const name of required)if(!clips.some(clip=>clip.toLowerCase().includes(name.toLowerCase())))issues.push('missing game clip: '+name);
if(garments.some(g=>!g.candidateBindCompatible))issues.push('existing wardrobe not rebind-safe');
const report={candidate:path.resolve(filename),jointCount:ci.names.length,clips,materials:mats,garments,gameReady:issues.length===0,issues};
console.log(JSON.stringify(report,null,2));
if(issues.length){console.error('V59 blocked from gameplay pending art/rig/wardrobe integration');process.exitCode=1;}

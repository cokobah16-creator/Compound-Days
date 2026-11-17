#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {inspect}=require('../tools/inspect-player1-v69.cjs');
function glb(json){
 const raw=Buffer.from(JSON.stringify(json));const n=(raw.length+3)&~3;
 const out=Buffer.alloc(12+8+n+8+4);
 out.write('glTF',0,'ascii');out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
 out.writeUInt32LE(n,12);out.writeUInt32LE(0x4e4f534a,16);
 raw.copy(out,20);out.fill(32,20+raw.length,20+n);
 out.writeUInt32LE(4,20+n);out.writeUInt32LE(0x004e4942,24+n);
 return out;
}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cd-v69-'));
try{
 const nodes=['Hips','Head','LeftHand','RightHand','LeftFoot','RightFoot','LeftIndex1','RightIndex1',
  'LeftThumb1','RightThumb1',...Array.from({length:17},(_,i)=>'Rig'+i)].map(name=>({name}));
 const good={
  asset:{version:'2.0'},nodes,skins:[{joints:nodes.map((_,i)=>i)}],
  accessors:[{count:90000},{count:90000}],
  meshes:[{name:'Face',extras:{targetNames:['Blink','Smile']},primitives:[{
   attributes:{POSITION:0,JOINTS_0:0,WEIGHTS_0:1},indices:1,targets:[{POSITION:0},{POSITION:0}]
  }]}],
  animations:['Idle','Walk','Carry','Pick','Wave'].map(name=>({name})),
  materials:[{name:'test'}]
 };
 const f=path.join(dir,'valid.glb');fs.writeFileSync(f,glb(good));
 const ok=inspect(f);assert(ok.passed,ok.issues.join('; '));assert.equal(ok.counts.triangles,30000);
 const missing=structuredClone(good);missing.meshes[0].primitives[0].targets=[];
 missing.meshes[0].extras.targetNames=[];
 const bad=path.join(dir,'no-morph.glb');fs.writeFileSync(bad,glb(missing));
 const fail=inspect(bad);assert(!fail.passed);assert(fail.issues.some(s=>s.includes('facial morph')));
 const invalid=path.join(dir,'bad-header.glb');fs.writeFileSync(invalid,Buffer.alloc(32));
 assert.throws(()=>inspect(invalid),/Invalid glTF/);
 console.log('V69 GLB inspector: PASS (valid asset, missing morph, corrupt GLB)');
}finally{fs.rmSync(dir,{recursive:true,force:true})}

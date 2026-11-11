#!/usr/bin/env node
// Convert the shipped authored V55 glTF JSON to GLB for a harness self-test.
// The output is a copy of the CURRENT hero, not a new candidate or character upgrade.
// Usage: node check/fixture-v64-hero-glb.cjs [out.glb]
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const src=path.resolve(__dirname,'../dist/assets/characters/efe.gltf.json');
const dest=path.resolve(process.argv[2]||'artifacts/v64-fixture-v55.glb');
const j=JSON.parse(fs.readFileSync(src,'utf8'));
assert.equal(j.asset.version,'2.0');
assert.equal(j.buffers.length,1,'Expected single embedded buffer');
assert(j.buffers[0].uri.startsWith('data:'),'Expected a data: URI for the embedded buffer');
const B=Buffer.from(j.buffers[0].uri.split(',')[1],'base64');
assert.equal(B.length,j.buffers[0].byteLength,'Embedded glTF buffer length mismatch');
delete j.buffers[0].uri;
let J=Buffer.from(JSON.stringify(j),'utf8');
J=Buffer.concat([J,Buffer.alloc((4-J.length%4)%4,0x20)]);
const bin=Buffer.concat([B,Buffer.alloc((4-B.length%4)%4)]);
const header=Buffer.alloc(12),a=Buffer.alloc(8),b=Buffer.alloc(8);
header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+J.length+8+bin.length,8);
a.writeUInt32LE(J.length,0);a.write('JSON',4);
b.writeUInt32LE(bin.length,0);b.write('BIN\0',4);
const out=Buffer.concat([header,a,J,b,bin]);
fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,out);
console.log(JSON.stringify({fixture:'V55 shipped hero, not a new model',file:dest,bytes:out.length,
 sha256:crypto.createHash('sha256').update(out).digest('hex'),
 clips:(j.animations||[]).map(x=>x.name),joints:j.skins?.[0]?.joints.length,materials:(j.materials||[]).map(x=>x.name)},null,2));

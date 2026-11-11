#!/usr/bin/env node
// Standalone, fail-closed glTF static gate for replacement Compound Days heroes.
// Usage: node check/verify-character-mobile-v62.cjs path/to/candidate.glb
// Does NOT replace in-engine headless or real-phone tests.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const fn=process.argv[2];
if(!fn){console.error('Usage: node check/verify-character-mobile-v62.cjs <candidate.glb>');process.exit(2);}
const B=fs.readFileSync(path.resolve(fn));
if(B.toString('ascii',0,4)!=='glTF'||B.readUInt32LE(4)!==2)throw Error('Expected GLB 2.0');
const len=B.readUInt32LE(12);
const j=JSON.parse(B.subarray(20,20+len).toString());
const binaryAt=20+len;
if(B.readUInt32LE(binaryAt+4)!==0x004e4942)throw Error('Missing BIN chunk');
const raw=B.subarray(binaryAt+8,binaryAt+8+B.readUInt32LE(binaryAt));
let tris=0,verts=0;
const seen=new Set();
for(const mesh of j.meshes||[])for(const p of mesh.primitives||[]){
 const a=j.accessors[p.attributes.POSITION];
 if(!seen.has(p.attributes.POSITION)){verts+=a.count;seen.add(p.attributes.POSITION);}
 tris+=((p.indices===undefined?a.count:j.accessors[p.indices].count)/3);
}
function imageDimensions(image){
 const v=j.bufferViews[image.bufferView];if(!v)return null;
 const p=raw.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);
 let width=0,height=0;
 if(p.length>24&&p[0]===137&&p.subarray(1,4).toString('ascii')==='PNG'){width=p.readUInt32BE(16);height=p.readUInt32BE(20);}
 else if(p[0]===255&&p[1]===216){
  for(let k=2;k+9<p.length;){
   if(p[k]!==255){k++;continue;}
   const mark=p[k+1];if(mark===217||mark===218)break;
   if(mark===216){k+=2;continue;}
   const n=p.readUInt16BE(k+2);if(n<2)break;
   if([192,193,194,195,197,198,199,201,202,203].includes(mark)){height=p.readUInt16BE(k+5);width=p.readUInt16BE(k+7);break;}
   k+=2+n;
  }
 }
 return width&&height?{width,height,decodedMipMiB:+(width*height*4*4/3/1048576).toFixed(2)}:{unsupported:true};
}
const textures=(j.images||[]).map(imageDimensions);
const gpuMiB=textures.reduce((n,t)=>n+(t.decodedMipMiB||0),0);
const parent=new Map();
(j.nodes||[]).forEach((n,i)=>{for(const child of n.children||[])parent.set(child,i);});
const scaleRisk=[];
(j.nodes||[]).forEach((n,i)=>{
 if(n.skin===undefined)return;
 let factor=1,k=i;
 while(k!==undefined){
  const s=j.nodes[k].scale;
  if(s)factor*=Math.cbrt(s[0]*s[1]*s[2]);
  k=parent.get(k);
 }
 if(factor<0.1)scaleRisk.push({meshNode:n.name||i,ancestorScale:factor});
});
const clips=(j.animations||[]).map(x=>x.name);
const expected=['idle','walk','carry','carryLow','walkCarry','walkCarryLow','pick','wave'];
const missingClips=expected.filter(name=>!clips.some(x=>x.toLowerCase()===name.toLowerCase()));
const materials=(j.materials||[]).map(x=>x.name);
const missingSlots=['skin','top','bottom','shoe','sole'].filter(x=>!materials.includes(x));
const problems=[];
if(scaleRisk.length)problems.push('Suspicious small skinned ancestor scale; run real in-engine close-up/culling test');
if(missingClips.length)problems.push('Missing game clips: '+missingClips.join(', '));
if(missingSlots.length)problems.push('Missing wardrobe material slots: '+missingSlots.join(', '));
if(gpuMiB>8)problems.push('Decoded texture memory above provisional 8MiB review threshold');
if(tris>50000)problems.push('Triangles above provisional 50K review threshold');
const output={candidate:path.basename(fn),triangles:Math.round(tris),vertices:verts,downloadMB:+(B.length/1e6).toFixed(2),textures,approxDecodedTextureMiB:+gpuMiB.toFixed(2),clips,scaleRisk,missingClips,missingSlots,problems,staticReviewPassed:problems.length===0,requiresHeadlessChromium:true,requiresArtApproval:true,requiresRealPhoneQA:true,note:'Texture estimate assumes RGBA8 + mipmaps. Limits are review alarms, not universal hardware limits.'};
console.log(JSON.stringify(output,null,2));
if(problems.length)process.exitCode=1;

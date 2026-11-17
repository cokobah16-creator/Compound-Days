#!/usr/bin/env node
/* V69 asset acceptance gate. Reads real GLB binary and validates geometry,
 * skinning, face morphs and animation contract before ANY live hero swap.
 * Usage: node tools/inspect-player1-v69.cjs candidate.glb [--strict]
 * No glTF dependency and no mutation of the candidate. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspect(file,{strict=false}={}){
 const b=fs.readFileSync(file);
 if(b.length<20||b.toString('ascii',0,4)!=='glTF'||b.readUInt32LE(4)!==2||
  b.readUInt32LE(8)!==b.length)throw Error('Invalid glTF 2.0 GLB header/length');
 let pos=12,json=null,bin=null;
 while(pos+8<=b.length){
  const size=b.readUInt32LE(pos),type=b.readUInt32LE(pos+4);pos+=8;
  if(size%4||pos+size>b.length)throw Error('Invalid GLB chunk bounds');
  if(type===0x4e4f534a)json=JSON.parse(b.toString('utf8',pos,pos+size).trim());
  if(type===0x004e4942)bin=b.subarray(pos,pos+size);
  pos+=size;
 }
 if(pos!==b.length||!json||!bin)throw Error('Missing JSON/BIN chunk or trailing data');
 const j=json;
 const nodes=j.nodes||[],meshes=j.meshes||[],skins=j.skins||[],animations=j.animations||[];
 const accessors=j.accessors||[],views=j.bufferViews||[];
 const issues=[],warnings=[];
 const nodeNames=nodes.map(n=>n.name||'');
 const match=(s)=>nodeNames.some(n=>s.test(n));
 const reqBones={
  hips:/^(hips|pelvis)$/i,head:/^head$/i,
  leftHand:/^(left.?hand|hand.?l|hand_l)$/i,
  rightHand:/^(right.?hand|hand.?r|hand_r)$/i,
  leftFoot:/^(left.?foot|foot.?l|foot_l)$/i,
  rightFoot:/^(right.?foot|foot.?r|foot_r)$/i
 };
 for(const [name,regex] of Object.entries(reqBones))if(!match(regex))issues.push('Missing bone: '+name);
 if(!skins.length)issues.push('No skin');
 const joints=new Set(skins.flatMap(s=>s.joints||[]));
 if(joints.size<27)issues.push('Expected at least 27 skinned joints; found '+joints.size);
 const invalidJoints=[...joints].filter(i=>!nodes[i]);
 if(invalidJoints.length)issues.push('Skin references missing nodes: '+invalidJoints.join(','));
 let triangles=0,skinnedPrimitives=0,morphCount=0,faceMorphs=[],handGeometry=0,shirtGeometry=0;
 const morphNames=new Set();
 const geom=[];
 for(let mi=0;mi<meshes.length;mi++){
  const m=meshes[mi],names=m.extras?.targetNames||[];
  for(const n of names)morphNames.add(String(n));
  for(const p of m.primitives||[]){
   const mode=p.mode??4,idx=accessors[p.indices],vert=accessors[p.attributes?.POSITION];
   const count=idx?.count||vert?.count||0;
   const tri=mode===4?Math.floor(count/3):0;
   triangles+=tri;
   if(p.attributes?.JOINTS_0!==undefined&&p.attributes?.WEIGHTS_0!==undefined)skinnedPrimitives++;
   if(p.attributes?.JOINTS_0!==undefined&&p.attributes?.WEIGHTS_0===undefined)issues.push('Missing weights on mesh '+mi);
   const targets=p.targets||[];morphCount=Math.max(morphCount,targets.length);
   geom.push({mesh:m.name||'mesh-'+mi,triangles:tri,morphTargets:targets.length,material:p.material??null});
   if(/face|head/i.test(m.name||''))faceMorphs.push(targets.length);
   if(/hand|finger/i.test(m.name||''))handGeometry+=tri;
   if(/shirt|tee|top/i.test(m.name||''))shirtGeometry+=tri;
  }
 }
 if(!skinnedPrimitives)issues.push('No skinned primitives with JOINTS_0 and WEIGHTS_0');
 if(triangles>180000)issues.push('Over mobile budget: '+triangles+' triangles (180000 cap)');
 if(triangles<30000)warnings.push('Suspiciously low mesh detail');
 if(morphCount===0)issues.push('No facial morph targets (blink/smile required for V69)');
 const names=[...morphNames].map(n=>n.toLowerCase());
 for(const [key,re] of Object.entries({blink:/blink/,smile:/smile|happy/})){
  if(!names.some(n=>re.test(n)))issues.push('Missing named facial morph: '+key);
 }
 if(!match(/finger|thumb|index|middle|ring|pinky/i))issues.push('No independent finger joints found');
 if(!animations.length)issues.push('No animation clips');
 const animNames=animations.map(a=>a.name||'');
 for(const [key,re] of Object.entries({idle:/idle/i,walk:/walk/i,carry:/carry/i,pick:/pick/i,wave:/wave/i})){
  if(!animNames.some(n=>re.test(n)))issues.push('Missing clip: '+key);
 }
 if(!j.materials?.length)warnings.push('No authored materials');
 if(!handGeometry)warnings.push('Hand meshes are not named separately; manual silhouette review required');
 if(!shirtGeometry)warnings.push('Shirt mesh is not named separately; manual seam review required');
 if(!faceMorphs.length)warnings.push('Head mesh not explicitly named; confirm face morph binding');
 for(const [i,v] of views.entries()){
  if((v.byteOffset||0)+(v.byteLength||0)>bin.length)issues.push('Buffer view '+i+' exceeds BIN');
 }
 const report={
  file:path.basename(file),bytes:b.length,version:j.asset?.version,
  counts:{nodes:nodes.length,joints:joints.size,meshes:meshes.length,triangles,animations:animations.length,morphCount,skinnedPrimitives,handTriangles:handGeometry,shirtTriangles:shirtGeometry},
  morphNames:[...morphNames],animationNames:animNames,
  geometry:geom,issues,warnings,passed:issues.length===0,
  note:'Static structure gate only: visual hand anatomy, UV seams, expression quality, skin deformation and runtime compatibility still require rendered QA.'
 };
 if(strict&&!report.passed)process.exitCode=1;
 return report;
}
if(require.main===module){
 const file=process.argv[2];
 if(!file||file.startsWith('--')){console.error('Usage: node tools/inspect-player1-v69.cjs file.glb [--strict]');process.exit(2)}
 try{console.log(JSON.stringify(inspect(file,{strict:process.argv.includes('--strict')}),null,2))}
 catch(e){console.error('GLB inspection failed:',e.message);process.exitCode=2}
}
module.exports={inspect};

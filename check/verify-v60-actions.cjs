#!/usr/bin/env node
// V60 Player 1 game-action GLB: verify clips, joints, and blocking wardrobe mismatch.
// Usage: node check/verify-v60-actions.cjs path/to/candidate.glb
// Returns nonzero if not safe to deploy; passing clip structure is not art approval.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const filename=process.argv[2];
if(!filename){console.error('Usage: node check/verify-v60-actions.cjs <candidate.glb>');process.exit(2);}
const input=fs.readFileSync(path.resolve(filename));
if(input.subarray(0,4).toString()!=='glTF')throw Error('Expected GLB');
if(input.readUInt32LE(4)!==2)throw Error('Expected GLB v2');
const len=input.readUInt32LE(12),js=JSON.parse(input.subarray(20,20+len).toString());
const offset=20+len,buffer=input.subarray(offset+8,offset+8+input.readUInt32LE(offset));
const expected=['Hips','Spine','Spine1','Spine2','Neck','Head','HeadTop_End','LeftShoulder','LeftArm','LeftForeArm','LeftHand','LeftHandEnd','RightShoulder','RightArm','RightForeArm','RightHand','RightHandEnd','LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase','LeftToe_End','RightUpLeg','RightLeg','RightFoot','RightToeBase','RightToe_End'];
const want=['Idle','Walk','Run','Carry','CarryLow','WalkCarry','WalkCarryLow','Pick','Wave'];
const names=js.skins[0].joints.map(i=>js.nodes[i].name);
const namesOK=JSON.stringify(names)===JSON.stringify(expected);
const clips=(js.animations||[]).map(a=>a.name);
const clipsOK=want.every(n=>clips.includes(n));
const morphs=js.meshes[0].extras?.targetNames||[];
const slots=js.materials.map(m=>m.name);
function extractIBMs(object, bytes){
 const skin=object.skins[0],a=object.accessors[skin.inverseBindMatrices],v=object.bufferViews[a.bufferView];
 const o=(v.byteOffset||0)+(a.byteOffset||0),step=v.byteStride||64;
 return Buffer.concat(Array.from({length:a.count},(_,i)=>bytes.subarray(o+i*step,o+i*step+64)));
}
const ib=extractIBMs(js,buffer);
const hero=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/assets/characters/efe.gltf.json'),'utf8'));
const hb=Buffer.from(hero.buffers[0].uri.split(',')[1],'base64');
const hbi=extractIBMs(hero,hb);
const ibMatch=ib.equals(hbi);
const slotMatch=['skin','top','bottom','shoe','sole'].every(m=>slots.includes(m));
const missing=want.filter(n=>!clips.includes(n));
const report={asset:filename,version:'V60',jointOrderMatches:namesOK,clips,missing,actionNamesPresent:clipsOK, morphs, inverseBindMatchesHero:ibMatch, requiredMaterialSlotsPresent:slotMatch, safeToDeploy:namesOK&&clipsOK&&ibMatch&&slotMatch};
console.log(JSON.stringify(report,null,2));
if(!report.safeToDeploy){console.error('BLOCKED: review-only asset, wardrobe or rig contract mismatch; live game unchanged.');process.exitCode=1;}

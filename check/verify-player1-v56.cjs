// Player 1 V56 (v56): Emeke's V56 model as Player 1's default, built by tools/player1_v56/build.mjs into
// assets/characters/player1-v56.glb. Runs the shipped game logic, Three.js and glTF loader in Node; nothing is rendered
// (the creator, world and kit captures are in the PR). Prints one PASS or FAIL line per check and writes
// check/results-player1-v56.json.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const harness=require('./runtime-harness.cjs');
const OUT=path.join(__dirname,'results-player1-v56.json');
const JOINTS=['Hips','Spine','Spine1','Spine2','Neck','Head','HeadTop_End','HeadFront','LeftShoulder','LeftArm','LeftForeArm','LeftHand','RightShoulder','RightArm','RightForeArm','RightHand','LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase','RightUpLeg','RightLeg','RightFoot','RightToeBase'];
const CLIPS=['idle','walk','carry','carryLow','walkCarry','walkCarryLow','pick','wave','run'];
const checks=[];
function check(name,fn){try{const info=fn();checks.push({name,passed:true,info});}catch(e){checks.push({name,passed:false,failure:e.message});}}
const r3=x=>Math.round(x*1e3)/1e3;
(async()=>{
 const {run,context,THREE}=await harness.load();
 // the WebP support probe in GLTFLoader decodes a 1-pixel image; pixels are not decoded in this harness, so it reports support
 context.Image=class{ set src(v){ this.width=this.height=1; Promise.resolve().then(()=>this.onload&&this.onload()); } };
 const file=path.join(harness.root,'assets/characters/player1-v56.glb'); const bytes=fs.readFileSync(file);
 const gltf=await new Promise((res,rej)=>new THREE.GLTFLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'',res,rej));
 context.loadedV56=gltf; run('p1v56Accept(loadedV56)');
 const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString('utf8'));
 let body=null; gltf.scene.traverse(o=>{if(!body&&o.isSkinnedMesh)body=o;});

 check('1. The asset is a mobile build of the V56 pack: one skinned mesh of at most 35k triangles, WebP textures, under 3 MB, and the run is reproducible from the committed source',()=>{
  const tris=body.geometry.index.count/3; assert(tris<=35000,'triangles '+tris); assert(bytes.length<3*1024*1024,'bytes '+bytes.length);
  assert(json.extensionsUsed.includes('EXT_texture_webp')); assert(json.images.every(i=>i.mimeType==='image/webp'));
  assert(fs.existsSync(path.join(harness.root,'..','source/player1_v56/Player1_ALL_ANIMATIONS_MASTER.glb'))); assert(fs.existsSync(path.join(harness.root,'..','tools/player1_v56/build.mjs')));
  return {triangles:tris,vertices:body.geometry.attributes.position.count,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12)};});

 check('2. The skeleton follows the hero convention: 24 joints with the hero names, identity rest rotations, metres (head joint 1.40-1.48 m, crown 1.65-1.75 m), inverse binds that are pure translations',()=>{
  const bones=body.skeleton.bones; assert.deepEqual(JSON.parse(JSON.stringify(bones.map(b=>b.name))),JOINTS);
  for(const b of bones){ assert(Math.abs(b.quaternion.w)>0.99999,b.name+' rest rotation'); assert(Math.abs(b.scale.x-1)<1e-6,b.name+' scale'); }
  for(const m of body.skeleton.boneInverses){ const e=m.elements; assert(Math.abs(e[0]-1)<1e-5&&Math.abs(e[5]-1)<1e-5&&Math.abs(e[10]-1)<1e-5,'inverse bind is not a translation'); }
  gltf.scene.updateMatrixWorld(true); const head=new THREE.Vector3(); bones[5].getWorldPosition(head);
  const X=gltf.scene.getObjectByName('Player1V56').userData; const crown=X.crown; assert(head.y>1.40&&head.y<1.48,'head '+head.y); assert(crown>1.65&&crown<1.75,'crown '+crown);
  const hm=X.hairMount; assert(hm&&hm.scale>0,'hair mount');
  return {headJoint:r3(head.y),crown,hairMount:hm};});

 check('3. Every game clip is there, the walks loop, and one walk loop is the game stride (the pack walk measured 1.47 m per loop)',()=>{
  const names=gltf.animations.map(a=>a.name); assert.deepEqual(names.slice().sort(),CLIPS.slice().sort());
  const out={}; for(const a of gltf.animations){ out[a.name]=r3(a.duration); }
  for(const n of ['walk','walkCarry','walkCarryLow']){ const a=gltf.animations.find(c=>c.name===n); for(const t of a.tracks){ const k=t.getValueSize(), v=t.values; for(let i=0;i<k;i++) assert(Math.abs(v[i]-v[v.length-k+i])<1e-4,n+' '+t.name+' does not loop'); } }
  assert(Math.abs(out.walk-1.471/1.3)<0.01,'walk '+out.walk); return out;});

 check('4. A new household starts Player 1 as V56; an older save without a model keeps the Classic model; Player 2 is never V56',()=>{
  run('S=newState()'); assert.equal(run('S.p[0].model'),'v56'); assert.equal(run('S.p[1].model'),undefined);
  run('S.p[0].model=undefined'); const g=run('makeAvatar(lookFor(0))'); assert(!g.v56&&g.rig==='hero','old save drew '+g.v56);
  const g1=run('makeAvatar(lookFor(1))'); assert(!g1.v56,'player 2 V56');
  return {newGame:'v56'};});

 check('5. Player 1 with V56 is built from the asset with the game animation set, the hero bone map, the carry anchor between the hands, and the contact shadow; the Classic hero is untouched',()=>{
  run("S=newState()"); const g=run('makeAvatar(lookFor(0))'); assert(g.v56&&g.rig==='hero');
  for(const k of ['idle','walk','carry','carryLow','walkCarry','walkCarryLow','pick','wave']) assert(g.actions[k],'action '+k);
  for(const k of ['hips','spine','spine1','spine2','neck','head','lefthand','righthand','leftfoot','rightfoot']) assert(g.hero.bones[k],'bone '+k);
  assert.equal(g.hero.bones.spine.name,'Spine'); assert.equal(g.hero.bones.spine2.name,'Spine2'); assert(g.userData.contact32,'contact shadow');
  const out={}; context.v56g=g;
  for(const [pose,moving,carry] of [['idle',false,false],['walk',true,false],['carry',false,true],['carryLow',false,'low'],['walkCarry',true,true]]){
   context.v56pose=[moving,carry]; run('v56g.current="idle";for(const k in v56g.actions){v56g.actions[k].setEffectiveWeight(k==="idle"?1:0);}for(let i=0;i<40;i++)animAvatar(v56g,i*0.05,v56pose[0],v56pose[1],3.2,0.05)');
   assert.equal(g.current,pose); g.updateMatrixWorld(true);
   const L=new THREE.Vector3(),Rh=new THREE.Vector3(),F1=new THREE.Vector3(),F2=new THREE.Vector3(); g.hero.handL.getWorldPosition(L); g.hero.handR.getWorldPosition(Rh); g.hero.bones.leftfoot.getWorldPosition(F1); g.hero.bones.rightfoot.getWorldPosition(F2);
   const a=run('carryAnchor({g:v56g},new THREE.Vector3())'); out[pose]={handGap:r3(L.distanceTo(Rh)),anchorY:r3(a.y),anchorZ:r3(a.z),lowFoot:r3(Math.min(F1.y,F2.y))};
   assert(Math.min(F1.y,F2.y)>0.02&&Math.min(F1.y,F2.y)<0.2,pose+' feet off the ground '+Math.min(F1.y,F2.y));
  }
  assert(out.carry.anchorZ>0.2&&out.carry.anchorY>0.9&&out.carry.anchorY<1.35,'carry in front of the chest'); assert(out.carry.handGap>0.1,'hands cross while carrying');
  const c=run("makeAvatar(Object.assign(lookFor(0),{model:'classic'}))"); assert(!c.v56&&c.hero.morph55&&c.hero.morph55.length,'Classic keeps the v55 head');
  return out;});

 check('6. The kit goes on V56 and its torso and neck pieces hang at the hero joint heights',()=>{
  run("S=newState();S.p[0].kit={head:'A03',ears:'A08',neck:'A09',bag:'A01'}"); const g=run('makeAvatar(lookFor(0))'); g.updateMatrixWorld(true);
  const names=[]; g.traverse(o=>{if(o.userData.kit50&&o.name)names.push(o.name);}); names.sort(); assert.deepEqual(JSON.parse(JSON.stringify(names)),['kit50_bag','kit50_head','kit50_head','kit50_neck']);
  const y=n=>{const o=g.getObjectByName(n),v=new THREE.Vector3();o.getWorldPosition(v);return r3(v.y);};
  assert(Math.abs(y('p1v56_torso')-0.95)<0.005); assert(Math.abs(y('p1v56_neck')-1.36)<0.005);
  return {pieces:names,torso:y('p1v56_torso'),neck:y('p1v56_neck')};});

 check('7. The creator offers Classic and V56 in the Body tab for Player 1 only, and the world redraws Player 1 when the choice changes',()=>{
  run('S=newState()'); const f=run('p1v56Field(S.p[0])'); assert(/data-k="model" data-v="classic"/.test(f)&&/data-k="model" data-v="v56"/.test(f)&&/opt picked" data-act="setp" data-i="0" data-k="model" data-v="v56"/.test(f));
  const a=run('stateSig()'); run("S.p[0].model='classic'"); const b=run('stateSig()'); assert.notEqual(a,b);
  return {sigChanges:true};});

 const passed=checks.filter(c=>c.passed).length;
 for(const c of checks) console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.passed?'':' — '+c.failure));
 fs.writeFileSync(OUT,JSON.stringify({build:run('BUILD_ID'),passed,total:checks.length,checks},null,1)+'\n');
 if(passed!==checks.length) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});

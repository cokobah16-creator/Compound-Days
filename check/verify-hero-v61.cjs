// Player 1 live (v61): the owner's V61 character (assets/characters/player1-v61.glb, converted by
// tools/player1_v61_convert.py) draws Player 1 through dist/src/hero-v61.js, with the classic hero (efe.gltf.json) kept
// for Player 2, the neighbours and the fallback. The static part reads the GLB bytes; the runtime part runs the shipped
// game logic, Three.js and glTF loader in Node (check/runtime-harness.cjs): the figure, the clips, the two requests, the
// real load-success and load-failure paths through a stubbed GLTFLoader.load, the switch, the face camera, the kit rule,
// the build-failure fallback and the panel notes; nothing is rendered (the creator, world and phone captures are the
// browser pass). Prints one PASS or FAIL line per check and per mutant and writes check/results-hero-v61.json.
//   node check/verify-hero-v61.cjs             the checks in this process, then each mutant (a one-place change to a temp
//                                              copy of hero-v61.js, the rest of dist linked) in a child process
//   node check/verify-hero-v61.cjs --inner [n] one check (or all) with JSON on the last line (what the mutant runs use)
'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),crypto=require('crypto'),os=require('os'),cp=require('child_process');
const GAME=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');
const OUT=path.join(__dirname,'results-hero-v61.json');
const GLB='assets/characters/player1-v61.glb', CLASSIC='assets/characters/efe.gltf.json', MODULE='hero-v61.js';
const HERO_ORDER=['Hips','Spine','Spine1','Spine2','Neck','Head','HeadTop_End','LeftShoulder','LeftArm','LeftForeArm','LeftHand','LeftHandEnd','RightShoulder','RightArm','RightForeArm','RightHand','RightHandEnd','LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase','LeftToe_End','RightUpLeg','RightLeg','RightFoot','RightToeBase','RightToe_End'];
const CLIPS=['idle','walk','carry','carryLow','walkCarry','walkCarryLow','pick','wave'];
const PRIMS=['skin','hair','top','bottom','shoe','top'];           // the six Body primitives by material name, in file order
const ATTRS=['JOINTS_0','NORMAL','POSITION','TEXCOORD_0','WEIGHTS_0'];
const HIPS_IBM_T=[-0.006,-0.937,-0.016], SIZE_LIMIT=5.5e6, IDLE_HEIGHT=[1.68,1.72];
// Each mutant must turn its check red when applied to hero-v61.js (find must occur exactly once in the module).
const MUTANTS=[
 {name:'M1 the asset\'s colours are not restored after the game\'s paint',check:2,find:"if(c) m.color.copy(c); else m.color.set('#ffffff'); m.map=HERO61.albedo;",replace:"m.map=HERO61.albedo;"},
 {name:'M2 the hair primitive stays hidden',check:2,find:"if(!o.isMesh||!o.userData||!o.userData.hero61Slot) return; o.visible=true;",replace:"if(!o.isMesh||!o.userData||!o.userData.hero61Slot) return;"},
 {name:'M3 the wardrobe is equipped on the V61 figure',check:2,find:"if(HERO61.building) return {garments:[],hair:null}; return wardrobeEquip61.apply(this,arguments);",replace:"return wardrobeEquip61.apply(this,arguments);"},
 {name:'M4 the built-in and wardrobe hair mounts are left in place',check:2,find:"mounts.forEach(o=>{ if(o.parent) o.parent.remove(o); });",replace:""},
 {name:'M5 the V61 request drops the build revision query',check:4,find:"new THREE.GLTFLoader().load(HERO61.url+'?v='+build,",replace:"new THREE.GLTFLoader().load(HERO61.url,"},
 {name:'M6 the skin materials are not marked for authored-v34\'s calibration',check:2,find:"if(m.name==='skin'){ m.userData.authored34Skin=true; }",replace:""},
 {name:'M7 the load-success callback no longer rebuilds Player 1 and the preview',check:9,find:"HERO61.loadedMs=Math.round(performance.now()-HERO61.startedAt); hero61Refresh();",replace:"HERO61.loadedMs=Math.round(performance.now()-HERO61.startedAt);"},
 {name:'M8 the load-failure path no longer rebuilds Player 1 from the classic asset',check:9,find:"the classic asset stands in:',HERO61.error);\n hero61Refresh();",replace:"the classic asset stands in:',HERO61.error);"},
 {name:'M9 the ?hero=v55 switch is broken (v56)',check:10,find:"if(/[?&]hero=v55\\b/.test(q)) return false;",replace:"if(/[?&]hero=v56\\b/.test(q)) return false;"},
 {name:'M10 the face view camera is not set for the V61 head',check:11,find:"const s=prevChar.scale.y||1, C=HERO61.faceCam; prevCam.position.set(0,C.y*s,C.z); prevCam.lookAt(0,C.lookY*s,0); }",replace:"}"},
 {name:'M11 the face camera numbers no longer frame the head (y 1.0)',check:11,find:"faceCam:{y:1.585,z:0.84,lookY:1.56},",replace:"faceCam:{y:1.0,z:0.84,lookY:1.56},"},
 {name:'M12 the duplicate-note guard is removed from openPanel',check:8,find:"&&html.indexOf('class=\"tiny v61note\"')<0",replace:""},
 {name:'M13 kit pieces are dressed onto the V61 figure',check:12,find:"if(hero61Applies(look)&&look.kit) return makeAvatar61.call(this,Object.assign({},look,{kit:undefined}),lite); ",replace:""},
 {name:'M14 a failure in the V61 build is rethrown instead of falling back to the classic figure',check:13,find:"catch(e){ failed=e||new Error('build failed'); }",replace:"catch(e){ throw e; }"},
 {name:'M15 a failed download is reported as the stringified ProgressEvent',check:5,find:"HERO61.error=(e&&(e.message||e.statusText))||(typeof e==='string'&&e)||'network error';",replace:"HERO61.error=(e&&(e.message||e.statusText))||String(e||'network error');"}
];
const r4=x=>Math.round(x*1e4)/1e4;
function same(a,b,msg){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),msg);}
function close(a,b,eps,msg){assert(Math.abs(a-b)<=eps,(msg?msg+': ':'')+a+' differs from '+b+' by more than '+eps);}
function sha(b){return crypto.createHash('sha256').update(b).digest('hex');}
// GLB 2.0 container: 12-byte header, JSON chunk, BIN chunk
function readGLB(file){
 const b=fs.readFileSync(file); assert.equal(b.subarray(0,4).toString(),'glTF','GLB magic');
 const version=b.readUInt32LE(4), total=b.readUInt32LE(8); assert.equal(total,b.length,'declared length');
 const jl=b.readUInt32LE(12); assert.equal(b.readUInt32LE(16),0x4E4F534A,'JSON chunk type');
 const json=JSON.parse(b.subarray(20,20+jl).toString('utf8'));
 const bl=b.readUInt32LE(20+jl); assert.equal(b.readUInt32LE(24+jl),0x004E4942,'BIN chunk type');
 return {bytes:b,version,json,bin:b.subarray(28+jl,28+jl+bl),jsonBytes:jl,binBytes:bl};
}
function accessorBytes(glb,i){
 const a=glb.json.accessors[i], v=glb.json.bufferViews[a.bufferView];
 const size={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4}[a.componentType]*{SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type], stride=v.byteStride||size, off=(v.byteOffset||0)+(a.byteOffset||0);
 if(stride===size) return glb.bin.subarray(off,off+a.count*size);
 const out=Buffer.alloc(a.count*size); for(let k=0;k<a.count;k++) glb.bin.copy(out,k*size,off+k*stride,off+k*stride+size); return out;
}
function det3(m){return m[0]*(m[5]*m[10]-m[6]*m[9])-m[4]*(m[1]*m[10]-m[2]*m[9])+m[8]*(m[1]*m[6]-m[2]*m[5]);}

async function inner(only){
 const harness=require('./runtime-harness.cjs');
 const {run,context,THREE}=await harness.load();
 const checks=[];
 const check=(n,name,fn)=>{if(only&&!only.includes(n))return;try{const info=fn();checks.push({n,name,passed:true,info});}catch(e){checks.push({n,name,passed:false,failure:e.message});}};
 const V61URL=GLB+'?v='+run('BUILD_ID'), CLASSICURL=CLASSIC+'?v='+run('BUILD_ID');
 // the module's own load-success path on the file parsed by the game's loader (what the browser does after the fetch)
 const buf=fs.readFileSync(path.join(harness.root,GLB));
 context.v61gltf=await new Promise((ok,fail)=>new THREE.GLTFLoader().parse(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'',ok,fail));
 run("v61install=hero61Install(v61gltf);");
 run("buildTextures();buildTextures2();S=newState();S.phase='play';S.p[0].name='Chika';S.p[1].name='Obi';");
 const wearCount=g=>{let n=0;g.traverse(o=>{if(o.isMesh&&/^wear_/.test(o.name))n++;});return n;};
 const mountCount=g=>{let n=0;g.traverse(o=>{if(o.name==='hairMount'||o.name==='wardrobeHair')n++;});return n;};

 check(1,'The asset is a GLB 2.0 with one 27-joint skin in hero order, scale 1 on every joint and on the mesh\'s ancestors, orthonormal inverse binds with Hips at about (-0.006, -0.937, -0.016) m, the Body mesh of six primitives [skin, hair, top, bottom, shoe, top] with exactly POSITION/NORMAL/TEXCOORD_0/JOINTS_0/WEIGHTS_0 and no morph targets, one JPEG, eight clips the game recognises, root extras headCentre/hairMount/version 61, and under 5.5 MB',()=>{
  const glb=readGLB(path.join(harness.root,GLB)); const J=glb.json; assert.equal(glb.version,2);
  assert.equal(J.skins.length,1); const skin=J.skins[0]; assert.equal(skin.joints.length,27); same(skin.joints.map(i=>J.nodes[i].name),HERO_ORDER);
  const parent={}; J.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parent[c]=i));
  const meshNode=J.nodes.findIndex(n=>n.mesh!==undefined); assert(meshNode>=0,'no mesh node'); assert.equal(J.nodes[meshNode].name,'Body');
  const chain=[]; for(let p=meshNode;p!==undefined;p=parent[p]) chain.push(p);
  for(const i of chain.concat(skin.joints)){ const s=J.nodes[i].scale||[1,1,1]; assert(s.every(x=>Math.abs(x-1)<=1e-3),'scale on node '+J.nodes[i].name+': '+JSON.stringify(s)); }
  const acc=J.accessors[skin.inverseBindMatrices]; assert.equal(acc.count,27); assert.equal(acc.type,'MAT4'); assert.equal(acc.componentType,5126);
  const ibm=accessorBytes(glb,skin.inverseBindMatrices); const f=new Float32Array(ibm.buffer.slice(ibm.byteOffset,ibm.byteOffset+ibm.byteLength));
  let detMin=9,detMax=-9; for(let j=0;j<27;j++){ const d=det3(f.subarray(j*16,j*16+16)); detMin=Math.min(detMin,d); detMax=Math.max(detMax,d); assert(Math.abs(d-1)<=1e-3,'inverse bind of '+HERO_ORDER[j]+' has determinant '+d); }
  const hipsT=[f[12],f[13],f[14]]; hipsT.forEach((v,k)=>close(v,HIPS_IBM_T[k],0.01,'Hips inverse bind translation '+k));
  assert.equal(J.meshes.length,1); const mesh=J.meshes[0]; assert.equal(mesh.name,'Body'); assert.equal(mesh.primitives.length,6);
  same(mesh.primitives.map(p=>J.materials[p.material].name),PRIMS);
  const tris={}; for(const p of mesh.primitives){ assert(!p.targets,'morph targets on a primitive'); same(Object.keys(p.attributes).sort(),ATTRS); const n=J.materials[p.material].name; tris[n]=(tris[n]||0)+J.accessors[p.indices].count/3; }
  const matNames=J.materials.map(m=>m.name); assert.equal(matNames.filter(n=>/^(skin_underlay|sole|skin_dark)$/.test(n)).length,0,'retired slots '+matNames);
  const textured=mesh.primitives.map(p=>J.materials[p.material]).map(m=>!!(m.pbrMetallicRoughness&&m.pbrMetallicRoughness.baseColorTexture)); same(textured,[true,true,true,true,true,false]);
  assert.equal((J.images||[]).length,1); assert.equal(J.images[0].mimeType,'image/jpeg'); const iv=J.bufferViews[J.images[0].bufferView]; const img=glb.bin.subarray(iv.byteOffset||0,(iv.byteOffset||0)+iv.byteLength); assert(img[0]===0xFF&&img[1]===0xD8,'JPEG magic');
  assert.equal((J.textures||[]).length,1);
  assert.equal(J.animations.length,8); const clipName=run('heroClipName'); same(J.animations.map(a=>clipName(a.name)).sort(),CLIPS.slice().sort());
  const root=J.nodes[J.scenes[0].nodes[0]]; assert.equal(root.name,'Player1'); const ex=root.extras||{}; assert(Array.isArray(ex.headCentre)&&ex.headCentre.length===3&&ex.headCentre.every(Number.isFinite),'headCentre');
  for(const k of ['x','y','z','scale','headR']) assert.equal(typeof (ex.hairMount||{})[k],'number','hairMount.'+k); assert.equal(ex.version,61);
  assert(glb.bytes.length<SIZE_LIMIT,'file size '+glb.bytes.length);
  // the parsed file through the game's loader agrees
  const inst=run('v61install'); same(inst.clips.slice().sort(),CLIPS.slice().sort()); assert.equal(inst.skinned,6); same(inst.textured,['skin','hair','top','bottom','shoe']);
  return {bytes:glb.bytes.length,sha256:sha(glb.bytes),jsonChunkBytes:glb.jsonBytes,binChunkBytes:glb.binBytes,generator:J.asset.generator,joints:27,inverseBindSha256:sha(ibm),inverseBindDeterminants:[r4(detMin),r4(detMax)],hipsInverseBindTranslation:hipsT.map(r4),primitives:PRIMS,trianglesByMaterial:tris,triangles:Object.values(tris).reduce((a,b)=>a+b,0),image:{mime:J.images[0].mimeType,bytes:iv.byteLength},clips:J.animations.map(a=>a.name),extras:{headCentre:ex.headCentre,hairMount:ex.hairMount,version:ex.version,visualRevision:ex.visualRevision,source:ex.source,sourceSha256:ex.sourceSha256}};});

 check(2,'makeAvatar(lookFor(0)) is the V61 figure: hero61 on the group, rig hero, the six skinned primitives visible (the hair among them), no wear_ mesh and no hairMount/wardrobeHair (also when the look\'s hair file is not cached), every textured material carrying the albedo in the asset\'s own colour (white for skin, hair, bottom and shoe; the asset\'s blue for the tee) with vertex colours off on materials whose geometry has no COLOR attribute, the underarm patch in that blue without a map, skin marked for authored-v34, 8 actions, current idle, an empty wardrobe report',()=>{
  const g=run('makeAvatar(lookFor(0))'); assert.equal(g.userData.hero61,true); assert.equal(g.rig,'hero'); assert(g.hero&&g.hero.v61===true,'g.hero.v61');
  const skinned=[]; g.traverse(o=>{if(o.isSkinnedMesh)skinned.push(o);}); assert.equal(skinned.length,6); same(skinned.map(o=>o.material.name),PRIMS);
  for(const o of skinned) assert.equal(o.visible,true,o.material.name+' hidden');
  assert.equal(wearCount(g),0,'wear_ meshes on the V61 figure'); assert.equal(mountCount(g),0,'hair mount on the V61 figure');
  const albedo=run('HERO61.albedo'), src=run('HERO61.sourceColors'), patch=run('HERO61.patchColor'); assert(albedo&&albedo.isTexture,'albedo');
  let tex=0,flat=0; const colours={};
  for(const o of skinned){ const m=o.material; assert.equal(o.frustumCulled,false,m.name+' frustumCulled');
   if(o.userData.hero61Textured){ tex++; assert.equal(m.map,albedo,m.name+' map'); const want=src[m.name].toArray(), have=m.color.toArray(); want.forEach((v,k)=>close(have[k],v,1e-6,m.name+' colour')); colours[m.name]=have.map(v=>+v.toFixed(4)); }
   else { flat++; assert.equal(m.name,'top'); assert.equal(m.map,null,'patch map'); const want=patch.toArray(), have=m.color.toArray(); want.forEach((v,k)=>close(have[k],v,1e-6,'patch colour')); colours.patch=have.map(v=>+v.toFixed(4)); }
   assert.equal(m.vertexColors,false,m.name+' vertexColors'); assert(!o.geometry.attributes.color,m.name+' geometry carries a COLOR attribute'); if(m.name==='skin') assert.equal(m.userData.authored34Skin,true,'skin not marked for authored-v34'); }
  assert.equal(tex,5); assert.equal(flat,1);
  for(const n of ['skin','hair','bottom','shoe']) same(src[n].toArray().map(v=>+v.toFixed(3)),[1,1,1],n+' source colour');
  assert(patch.b>patch.r&&patch.b>patch.g,'the patch colour is blue'); same(src.top.toArray().map(v=>+v.toFixed(3)),patch.toArray().map(v=>+v.toFixed(3)),'the tee factor and the patch agree');
  same(Object.keys(g.actions).sort(),CLIPS.slice().sort()); assert.equal(g.current,'idle'); same(g.hero.wardrobe,{garments:[],hair:null});
  assert.equal(g.hero.body.skeleton.bones.length,27); same(g.hero.body.skeleton.bones.map(b=>b.name),HERO_ORDER); assert(g.hero.handL&&g.hero.handR&&g.hero.head,'hand and head bones');
  assert(g.getObjectByName('contact32'),'polish-v32 contact shadow'); assert.equal(run('AUTHORED34.installed'),true);
  // a look whose wardrobe hair is not cached would get the game's built-in hairstyle on a classic figure
  const g2=run("(()=>{const k='hair_boxbraids';const keep=WARDROBE.cache[k];delete WARDROBE.cache[k];try{return makeAvatar(Object.assign({},lookFor(0),{hair:'braids'}));}finally{WARDROBE.cache[k]=keep;}})()");
  assert.equal(g2.userData.hero61,true); assert.equal(mountCount(g2),0,'hairMount left on the V61 figure'); assert.equal(wearCount(g2),0);
  let tris=0; for(const o of skinned) tris+=o.geometry.index.count/3;
  return {skinnedMeshes:6,visible:6,triangles:tris,colours,wearMeshes:0,hairMounts:0,actions:Object.keys(g.actions).length,current:g.current,wardrobe:g.hero.wardrobe};});

 check(3,'The clips drive it: walking bobs the Hips and selects walk, carrying selects carry and walkCarryLow, and the idle pose spans 1.68 to 1.72 m from the soles by skinned vertex bounds',()=>{
  const g=run('makeAvatar(lookFor(0))'); const anim=run('animAvatar'); const v=new THREE.Vector3(); const ys=[];
  for(let k=0;k<12;k++){ anim(g,0.5+k/60,true,false,3,1/60); g.updateMatrixWorld(true); g.hero.bones.hips.getWorldPosition(v); ys.push(v.y); }
  assert.equal(g.current,'walk'); const bob=Math.max(...ys)-Math.min(...ys); assert(bob>1e-4,'the Hips do not move while walking: '+bob);
  for(let k=0;k<6;k++) anim(g,1.0+k/60,false,true,0,1/60); assert.equal(g.current,'carry');
  for(let k=0;k<6;k++) anim(g,1.2+k/60,true,'low',3,1/60); assert.equal(g.current,'walkCarryLow');
  for(let k=0;k<6;k++) anim(g,1.4+k/60,false,false,0,1/60); assert.equal(g.current,'idle');
  const gi=run('makeAvatar(lookFor(0))'); for(const k in gi.actions) gi.actions[k].setEffectiveWeight(k==='idle'?1:0); gi.mixer.setTime(0); gi.updateMatrixWorld(true);
  let minY=9,maxY=-9,n=0; gi.traverse(o=>{ if(!o.isSkinnedMesh) return; o.skeleton.update(); const P=o.geometry.attributes.position; for(let i=0;i<P.count;i++){ v.fromBufferAttribute(P,i); o.boneTransform(i,v); v.applyMatrix4(o.matrixWorld); if(v.y<minY)minY=v.y; if(v.y>maxY)maxY=v.y; n++; } });
  const h=maxY-minY; assert(h>IDLE_HEIGHT[0]&&h<IDLE_HEIGHT[1],'idle height '+h); assert(Math.abs(minY)<0.02,'the soles are at '+minY);
  return {walkBob:r4(bob),hipsWorldY:ys.map(r4),idle:{minY:r4(minY),maxY:r4(maxY),height:r4(h),vertices:n},clipDurations:Object.fromEntries(Object.keys(gi.clips).map(k=>[k,+gi.clips[k].duration.toFixed(3)]))};});

 check(4,'heroLoad requests player1-v61.glb with the build revision query first and the classic efe.gltf.json second (authored-v34\'s wrapper, which installs its passes from a fresh state), both plain urls restored; with HERO61 disabled only the classic request is made',()=>{
  const first=run("(()=>{const L=THREE.GLTFLoader.prototype.load;const seen=[];THREE.GLTFLoader.prototype.load=function(u){seen.push(u);};const st=HERO.state,st61=HERO61.state,mk=makeHeroAvatar,we=wardrobeEquip,inst=AUTHORED34.installed;HERO.state='idle';HERO61.state='idle';AUTHORED34.installed=false;let installed=null;try{heroLoad();installed=AUTHORED34.installed;}finally{THREE.GLTFLoader.prototype.load=L;HERO.state=st;HERO61.state=st61;makeHeroAvatar=mk;wardrobeEquip=we;AUTHORED34.installed=inst;}return {seen,installed};})()");
  const seen=first.seen; same(seen,[V61URL,CLASSICURL]); assert.equal(first.installed,true,'authored34Install not run by the heroLoad path'); assert.equal(run('HERO61.url'),GLB); assert.equal(run('HERO.url'),CLASSIC); assert.equal(run('AUTHORED34.installed'),true); assert.equal(run('HERO61.state'),'ready');
  const off=run("(()=>{const L=THREE.GLTFLoader.prototype.load;const seen=[];THREE.GLTFLoader.prototype.load=function(u){seen.push(u);};const st=HERO.state,en=HERO61.enabled;HERO.state='idle';HERO61.enabled=false;try{heroLoad();}finally{THREE.GLTFLoader.prototype.load=L;HERO.state=st;HERO61.enabled=en;}return seen;})()");
  same(off,[CLASSICURL]);
  // a second heroLoad while the V61 file is already in hand does not fetch it again
  const again=run("(()=>{const L=THREE.GLTFLoader.prototype.load;const seen=[];THREE.GLTFLoader.prototype.load=function(u){seen.push(u);};const st=HERO.state;HERO.state='idle';try{heroLoad();}finally{THREE.GLTFLoader.prototype.load=L;HERO.state=st;}return seen;})()");
  same(again,[CLASSICURL]);
  return {enabled:seen,authored34InstalledByHeroLoad:first.installed,disabled:off,alreadyReady:again};});

 check(5,'Fallback: when the V61 request fails the state is error, the Menu says why in words (a failed download, which GLTFLoader reports as a ProgressEvent, reads \'network error\') and names the figure Player 1 uses, the classic asset was requested as before and makeAvatar(lookFor(0)) builds the classic hero with its wardrobe; a file without the joints is rejected before it is marked ready',()=>{
  const r=run("(()=>{const L=THREE.GLTFLoader.prototype.load;const seen=[];THREE.GLTFLoader.prototype.load=function(u,ok,prog,err){seen.push(u);if(/player1-v61/.test(u))err(new Error('simulated: request blocked'));};"+
   "const st=HERO.state,keep={state:HERO61.state,error:HERO61.error};HERO.state='idle';HERO61.state='idle';const warns=[],w=console.warn;console.warn=function(){warns.push(Array.from(arguments).join(' '));};let out={};"+
   "try{heroLoad();out={seen,state:HERO61.state,error:HERO61.error,warns,status:heroStatusText()};HERO.state='ready';out.statusReady=heroStatusText();const g=makeAvatar(lookFor(0));let wear=0,wh=0;g.traverse(o=>{if(o.isMesh&&/^wear_/.test(o.name))wear++;if(o.isMesh&&/^wearhair_/.test(o.name))wh++;});out.avatar={hero61:!!g.userData.hero61,rig:g.rig,wear,wearHair:wh};}"+
   "finally{THREE.GLTFLoader.prototype.load=L;console.warn=w;HERO.state=st;Object.assign(HERO61,keep);}return out;})()");
  assert.equal(r.state,'error'); assert(/simulated/.test(r.error),'error text '+r.error); same(r.seen,[V61URL,CLASSICURL]);
  assert(r.warns.some(w=>/V61 file for Player 1 not used; the classic asset stands in:/.test(w)&&/simulated/.test(w)),'warning '+JSON.stringify(r.warns));
  assert(/^V61 file not used \(simulated: request blocked\)\. Character asset: loading assets\/characters\/efe\.gltf\.json/.test(r.status),'status while the classic file loads: '+r.status); assert(!/Player 1 uses the classic hero/.test(r.status),'claims the classic hero before it is ready: '+r.status);
  assert(/^V61 file not used \(simulated: request blocked\)\. Player 1 uses the classic hero\. Character asset: assets\/characters\/efe\.gltf\.json loaded in /.test(r.statusReady),'status with the classic file ready: '+r.statusReady);
  const pe=run("(()=>{const keep={state:HERO61.state,error:HERO61.error};const w=console.warn,warns=[];console.warn=function(){warns.push(Array.from(arguments).join(' '));};try{hero61Fail({type:'error',lengthComputable:false,loaded:0,total:0});return {error:HERO61.error,state:HERO61.state,warns};}finally{console.warn=w;Object.assign(HERO61,keep);}})()");
  assert.equal(pe.error,'network error','a ProgressEvent is reported as '+pe.error); assert.equal(pe.state,'error'); assert(pe.warns.some(w=>/not used; the classic asset stands in: network error$/.test(w)),JSON.stringify(pe.warns));
  const str=run("(()=>{const keep={state:HERO61.state,error:HERO61.error};const w=console.warn;console.warn=function(){};try{hero61Fail('thrown as a string');return HERO61.error;}finally{console.warn=w;Object.assign(HERO61,keep);}})()"); assert.equal(str,'thrown as a string');
  assert.equal(r.avatar.hero61,false); assert.equal(r.avatar.rig,'hero'); assert(r.avatar.wear>0&&r.avatar.wearHair>0,'classic wardrobe '+JSON.stringify(r.avatar));
  const bad=run("(()=>{try{hero61Install({scene:new THREE.Group(),animations:[]});return 'accepted';}catch(e){return e.message;}})()"); assert(/not a usable humanoid rig/.test(bad),bad);
  assert.equal(run('HERO61.state'),'ready'); assert.equal(run('HERO61.error'),null);
  return {requests:r.seen,state:r.state,error:r.error,warning:r.warns.find(w=>/V61/.test(w)),status:r.status,statusClassicReady:r.statusReady,progressEventError:pe.error,classicAvatar:r.avatar,rejected:bad};});

 check(6,'Everyone else is unchanged: makeAvatar(lookFor(1)) and the neighbours (CAST) are the classic hero with their wardrobe, not V61; Player 1 is the classic hero when V61 is disabled or a look opts out',()=>{
  const p2=run('makeAvatar(lookFor(1))'); assert(!p2.userData.hero61,'Player 2 drawn with V61'); assert.equal(p2.rig,'hero'); assert(wearCount(p2)>0,'Player 2 wardrobe');
  const cast={}; for(const k of Object.keys(run('CAST'))){ const g=run("makeHeroAvatar(Object.assign({},CAST["+JSON.stringify(k)+"].look,{rig:'hero'}))"); assert(g&&!g.userData.hero61,k+' drawn with V61'); cast[k]=wearCount(g); assert(cast[k]>0,k+' wardrobe'); }
  const off=run("(()=>{const en=HERO61.enabled;HERO61.enabled=false;try{return makeAvatar(lookFor(0));}finally{HERO61.enabled=en;}})()"); assert(!off.userData.hero61); assert.equal(off.rig,'hero'); assert(wearCount(off)>0);
  const opt=run("makeAvatar(Object.assign({},lookFor(0),{hero61:false}))"); assert(!opt.userData.hero61); assert.equal(opt.rig,'hero'); assert(wearCount(opt)>0);
  assert.equal(run('lookFor(1).pi'),1); assert.equal(run('lookFor(0).pi'),0);
  return {player2:{rig:p2.rig,wearMeshes:wearCount(p2)},castWearMeshes:cast,disabledPlayer1:{rig:off.rig,wearMeshes:wearCount(off)},optedOutPlayer1:{rig:opt.rig,wearMeshes:wearCount(opt)}};});

 check(7,'The Menu line names player1-v61.glb and says what Player 1 wears and that kit is not drawn on the V61 figure (the classic line\'s Player 1 fragment dropped, Player 2\'s kept); when the classic asset failed it says who uses the built-in figure, never that Player 1 does; disabled it is the classic line; loading it says so. Player 1\'s option thumbnails render the choice on the classic figure (the look opts out of V61), Player 2\'s unchanged',()=>{
  run("players=[{i:0,g:makeAvatar(lookFor(0)),y:0,t:0},{i:1,g:makeAvatar(lookFor(1)),y:0,t:0}];");
  const ready=run('heroStatusText()'); assert(ready.startsWith('Character asset: '+GLB+' loaded in '),ready); assert(ready.includes('(8 clips). Player 1 wears the V61 look; Player 1’s skin tone, hair, headwear and outfit choices colour the portraits, not the V61 figure, and kit pieces are not drawn on it.'),ready);
  assert(ready.includes('Classic asset: '+CLASSIC+' loaded in '),ready); assert(!ready.includes('hair fallback'),ready); assert(/ Player 2: modelled body; hair hair_/.test(ready),ready); assert(!/Player 1: modelled body/.test(ready),ready); assert(!/not this figure/.test(ready),ready);
  const efeFailed=run("(()=>{const st=HERO.state,er=HERO.error;HERO.state='error';HERO.error='simulated efe failure';try{return heroStatusText();}finally{HERO.state=st;HERO.error=er;}})()");
  assert(efeFailed.startsWith('Character asset: '+GLB+' loaded in '),efeFailed); assert(efeFailed.endsWith(' The classic asset failed as well (simulated efe failure); Player 2 and the neighbours use the game’s built-in figure.'),efeFailed); assert(!/Player 1 is drawn with the built-in avatar/.test(efeFailed),efeFailed);
  const off=run("(()=>{const en=HERO61.enabled;HERO61.enabled=false;try{return heroStatusText();}finally{HERO61.enabled=en;}})()"); assert(off.startsWith('Character asset: '+CLASSIC+' loaded in '),off); assert(!/V61|v61/.test(off),off);
  const loading=run("(()=>{const st=HERO61.state;HERO61.state='loading';try{return heroStatusText();}finally{HERO61.state=st;}})()"); assert(loading.startsWith('Character asset: loading '+GLB+'…'),loading);
  const th=run("(()=>{const keep={thumbInit,makeAvatar,r:THUMB.r,scene:THUMB.scene,cam:THUMB.cam};const seen=[];thumbInit=()=>true;THUMB.scene=new THREE.Scene();THUMB.cam=new THREE.PerspectiveCamera();THUMB.r={render(){},domElement:{toDataURL:()=>'data:thumb'}};const mk=keep.makeAvatar;makeAvatar=function(look,lite){seen.push(Object.assign({},look));const g=mk.apply(this,arguments);seen[seen.length-1].built61=!!g.userData.hero61;return g;};"+
   "try{const a=thumbRender(Object.assign({},lookFor(0),{hair:'braids'}),'hair');const b=thumbRender(lookFor(1),'outfit');return {a,b,seen};}finally{thumbInit=keep.thumbInit;makeAvatar=keep.makeAvatar;THUMB.r=keep.r;THUMB.scene=keep.scene;THUMB.cam=keep.cam;}})()");
  assert.equal(th.a,'data:thumb'); assert.equal(th.b,'data:thumb'); assert.equal(th.seen.length,2);
  assert.equal(th.seen[0].hero61,false,'Player 1 thumbnail look opts out'); assert.equal(th.seen[0].rig,'hero'); assert.equal(th.seen[0].pi,0); assert.equal(th.seen[0].hair,'braids'); assert.equal(th.seen[0].built61,false,'Player 1 thumbnail built with V61');
  assert(!('hero61' in th.seen[1]),'Player 2 thumbnail look changed'); assert.equal(th.seen[1].built61,false);
  const tg=run("makeAvatar(Object.assign({},lookFor(0),{hair:'braids',hero61:false}))"); let wh=0; tg.traverse(o=>{if(o.isMesh&&/^wearhair_/.test(o.name))wh++;}); assert(!tg.userData.hero61); assert(wh>0,'the thumbnail figure shows the chosen hair');
  run('players=[];');
  return {ready,classicFailed:efeFailed,disabled:off,loading,thumbnailLooks:th.seen.map(l=>({pi:l.pi,rig:l.rig,hair:l.hair,hero61:l.hero61,built61:l.built61}))};});

 check(8,'Player 1\'s creator panel carries the V61 note once, after the Skin tone field and before the Hair field (under polish-v30\'s tab row); a panel re-opened with the note already in its html keeps one; Player 2\'s panel and a panel opened before the file is ready carry none; the kit panel carries its own line only while Player 1, drawn with V61, is the selected wearer',()=>{
  run("S.setup={step:'p0'};renderSetup();"); const html=run('panel.innerHTML'); assert(html.includes('id="pv3d0"'),'Player 1 panel');
  const n=html.split('class="tiny v61note"').length-1; assert.equal(n,1,'notes: '+n);
  const at=html.indexOf('class="tiny v61note"'), skin=html.indexOf('<div class="field"><label>Skin tone</label>'), hair=html.indexOf('<div class="field"><label>Hair</label>'); assert(skin>=0&&hair>skin,'creator fields'); assert(at>skin&&at<hair,'the note sits after the Skin tone field and before the Hair field: skin '+skin+' note '+at+' hair '+hair);
  const text=(html.match(/<p class="tiny v61note">([^<]*)<\/p>/)||[])[1]; assert(text&&/V61 character/.test(text)&&/portraits, not this figure/.test(text),'note text '+text); assert(!/Player 1 is drawn with the/.test(text),'four-word overlap with the shipped built-in line: '+text);
  run("renderSetup();"); assert.equal(run('panel.innerHTML').split('v61note').length-1,1,'a second render adds a second note');
  const reopened=run("(()=>{const h=panel.innerHTML;openPanel(h);return panel.innerHTML;})()"); assert.equal(reopened.split('class="tiny v61note"').length-1,1,'re-opening a panel that already carries the note doubles it');
  run("S.setup={step:'p1'};renderSetup();"); const p2=run('panel.innerHTML'); assert(p2.includes('id="pv3d1"')); assert.equal(p2.split('v61note').length-1,0,'note on Player 2\'s panel');
  const idle=run("(()=>{const st=HERO61.state;HERO61.state='idle';try{S.setup={step:'p0'};renderSetup();return panel.innerHTML;}finally{HERO61.state=st;}})()"); assert.equal(idle.split('v61note').length-1,0,'note before the file is ready');
  run("delete S.setup;closePanel();");
  // the kit panel (kit-v50): one line while Player 1 is the selected wearer and is the V61 figure; none for Player 2 or a classic Player 1
  const kit=run("(()=>{players=[{i:0,g:makeAvatar(lookFor(0)),y:0,t:0},{i:1,g:makeAvatar(lookFor(1)),y:0,t:0}];const who=KIT50.who;const out={};try{KIT50.who=0;kitPanel50();out.p1=panel.innerHTML;KIT50.who=1;kitPanel50();out.p2=panel.innerHTML;KIT50.who=0;players[0].g=makeAvatar(Object.assign({},lookFor(0),{hero61:false}));kitPanel50();out.classic=panel.innerHTML;}finally{KIT50.who=who;players=[];closePanel();}return out;})()");
  assert(kit.p1.includes('id="kit50"'),'kit panel'); assert.equal(kit.p1.split('class="tiny v61note"').length-1,1,'kit note for Player 1'); const kt=(kit.p1.match(/<p class="tiny v61note">([^<]*)<\/p>/)||[])[1]; assert(kt&&/shows no kit pieces/.test(kt)&&/\?hero=v55/.test(kt),'kit note text '+kt);
  assert(kit.p1.indexOf('class="tiny v61note"')>kit.p1.indexOf('<h2>Shoes and accessories</h2>')&&kit.p1.indexOf('class="tiny v61note"')<kit.p1.indexOf('kit50-slots'),'kit note sits under the heading paragraph');
  assert.equal(kit.p2.split('v61note').length-1,0,'kit note while Player 2 is selected'); assert.equal(kit.classic.split('v61note').length-1,0,'kit note while Player 1 is the classic figure');
  return {note:text,player1Notes:1,reopenedNotes:1,player2Notes:0,beforeReadyNotes:0,kitNote:kt,kitNotesPlayer2:0,kitNotesClassic:0};});

 check(9,'The real load path: with both players standing, a GLTFLoader.load that answers the V61 request rebuilds Player 1 as V61 (Player 2 untouched), records bytes and a load time, and remounts Player 1\'s preview; a later failure rebuilds Player 1 from the classic asset and remounts the preview again',()=>{
  const r=run("(()=>{const L=THREE.GLTFLoader.prototype.load,MP=mountPreview;const seen=[],previews=[];const keep={state:HERO61.state,gltf:HERO61.gltf,loadedMs:HERO61.loadedMs,bytes:HERO61.bytes,error:HERO61.error,hs:HERO.state};"+
   "HERO61.state='idle';HERO61.gltf=null;HERO61.loadedMs=-1;HERO61.bytes=0;players=[{i:0,g:makeAvatar(lookFor(0)),y:0,t:0},{i:1,g:makeAvatar(lookFor(1)),y:0,t:0}];players.forEach(p=>scene.add(p.g));const before=!!players[0].g.userData.hero61;const p2g=players[1].g;"+
   "const pv=document.getElementById('pv3d0');pv.id='pv3d0';mountPreview=function(c,look){previews.push([(c&&c.id)||null,look&&look.pi]);};"+
   "THREE.GLTFLoader.prototype.load=function(u,ok,prog,err){seen.push(u);if(/player1-v61/.test(u)){prog({total:5101400});ok(v61gltf);}};HERO.state='idle';let out={};"+
   "try{heroLoad();out={seen:seen.slice(),before,after:!!players[0].g.userData.hero61,rig:players[0].g.rig,p2:!!players[1].g.userData.hero61,p2same:players[1].g===p2g,state:HERO61.state,loadedMsNumber:typeof HERO61.loadedMs==='number'&&HERO61.loadedMs>=0,bytes:HERO61.bytes,previews:previews.slice(),inScene:scene.children.includes(players[0].g)};"+
   "seen.length=0;previews.length=0;HERO61.state='idle';HERO.state='ready';THREE.GLTFLoader.prototype.load=function(u,ok,prog,err){seen.push(u);if(/player1-v61/.test(u))err(new Error('simulated: late failure'));};const w=console.warn,warns=[];console.warn=function(){warns.push(Array.from(arguments).join(' '));};"+
   "try{heroLoad();}finally{console.warn=w;}let wear=0;players[0].g.traverse(o=>{if(o.isMesh&&/^wear_/.test(o.name))wear++;});out.fail={seen:seen.slice(),after:!!players[0].g.userData.hero61,rig:players[0].g.rig,wear,state:HERO61.state,error:HERO61.error,previews:previews.slice(),warns,inScene:scene.children.includes(players[0].g)};}"+
   "finally{THREE.GLTFLoader.prototype.load=L;mountPreview=MP;HERO.state=keep.hs;players.forEach(p=>scene.remove(p.g));players=[];Object.assign(HERO61,{state:keep.state,gltf:keep.gltf,loadedMs:keep.loadedMs,bytes:keep.bytes,error:keep.error});}return out;})()");
  same(r.seen,[V61URL,CLASSICURL]); assert.equal(r.before,false,'Player 1 was V61 before the file arrived'); assert.equal(r.after,true,'Player 1 not rebuilt as V61 when the file arrived'); assert.equal(r.rig,'hero'); assert.equal(r.p2,false); assert.equal(r.p2same,true,'Player 2 rebuilt'); assert.equal(r.state,'ready'); assert.equal(r.loadedMsNumber,true); assert.equal(r.bytes,5101400); assert.equal(r.inScene,true);
  same(r.previews,[['pv3d0',0]]);
  assert.equal(r.fail.state,'error'); assert(/late failure/.test(r.fail.error),r.fail.error); assert.equal(r.fail.after,false,'Player 1 still V61 after the failure'); assert.equal(r.fail.rig,'hero'); assert(r.fail.wear>0,'classic wardrobe after the failure'); same(r.fail.previews,[['pv3d0',0]]); assert.equal(r.fail.inScene,true); assert(r.fail.warns.some(w=>/V61 file for Player 1 not used/.test(w)),JSON.stringify(r.fail.warns));
  assert.equal(run('HERO61.state'),'ready'); assert.equal(run('players.length'),0);
  return {requests:r.seen,player1:{before:r.before,after:r.after},player2Untouched:r.p2same,bytes:r.bytes,previewMounts:r.previews,failure:{state:r.fail.state,error:r.fail.error,player1Hero61:r.fail.after,wearMeshes:r.fail.wear,previewMounts:r.fail.previews}};});

 check(10,'The switch: ?hero=v55 and a stored cd3-hero=v55 turn the file off, ?hero=v61 forces it on over the stored choice, anything else leaves it on',()=>{
  const sw=run('hero61Switch'); const cases={plain:[['',null],true],v55:[['?hero=v55',null],false],v55second:[['?a=1&hero=v55',null],false],v55prefixOnly:[['?hero=v556',null],true],stored:[['', 'v55'],false],storedOther:[['', 'v61'],true],forceOverStored:[['?hero=v61','v55'],true],hashOnly:[['#hero=v55',null],true],undefinedArgs:[[undefined,undefined],true]};
  const got={}; for(const k in cases){ got[k]=sw.apply(null,cases[k][0]); assert.equal(got[k],cases[k][1],k+' -> '+got[k]); }
  assert.equal(run('HERO61.enabled'),true,'the harness context has no query and no stored choice'); return got;});

 check(11,'The creator face view: for a V61 preview the camera comes from HERO61.faceCam and frames the head (Head bone in the lower middle of the view, HeadTop_End in the upper half); for a classic preview head-v55\'s camera is untouched',()=>{
  const r=run("(()=>{const keep={char:prevChar,cam:prevCam,zoom:CREATOR30.zoom,yaw:CREATOR30.yaw,pose:CREATOR30.pose};const out={};try{CREATOR30.zoom='face';CREATOR30.yaw=0;CREATOR30.pose='idle';"+
   "const proj=(g)=>{g.updateMatrixWorld(true);prevCam.updateMatrixWorld(true);const v=new THREE.Vector3();const b=g.hero.bones;const top=b.head.children.find(c=>c.name==='HeadTop_End');const o={cam:prevCam.position.toArray().map(x=>+x.toFixed(4)),hero61:!!g.userData.hero61};for(const [k,bone] of [['head',b.head],['headTop',top]]){bone.getWorldPosition(v);const w=v.clone();v.project(prevCam);o[k]={world:w.toArray().map(x=>+x.toFixed(3)),ndc:[+v.x.toFixed(3),+v.y.toFixed(3)]};}return o;};"+
   "prevCam=new THREE.PerspectiveCamera(28,698/873,0.1,20);prevChar=makeAvatar(lookFor(0));creator30Preview(0,0.016);out.v61=proj(prevChar);"+
   "prevChar=makeAvatar(Object.assign({},lookFor(0),{hero61:false}));creator30Preview(16,0.016);out.classic=proj(prevChar);out.head55=Object.assign({},HEAD55.faceCam);out.faceCam=Object.assign({},HERO61.faceCam);}"+
   "finally{prevChar=keep.char;prevCam=keep.cam;CREATOR30.zoom=keep.zoom;CREATOR30.yaw=keep.yaw;CREATOR30.pose=keep.pose;}return out;})()");
  assert.equal(r.v61.hero61,true); same(r.v61.cam,[0,+r.faceCam.y.toFixed(4),+r.faceCam.z.toFixed(4)]);
  close(r.v61.head.ndc[0],0,0.1,'V61 head x'); close(r.v61.head.ndc[1],-0.53,0.1,'V61 head y (the tester measured -0.532 on the desk canvas)'); close(r.v61.headTop.ndc[1],0.575,0.1,'V61 head top y (the tester measured 0.575)'); assert(r.v61.headTop.world[1]>1.6&&r.v61.headTop.world[1]<1.75,'HeadTop_End height '+r.v61.headTop.world[1]);
  assert.equal(r.classic.hero61,false); same(r.classic.cam,[0,+r.head55.y.toFixed(4),+r.head55.z.toFixed(4)]); assert(Math.abs(r.classic.cam[1]-r.v61.cam[1])>0.03&&Math.abs(r.classic.cam[2]-r.v61.cam[2])>0.1,'the two cameras differ');
  return {v61:r.v61,classic:r.classic};});

 check(12,'Kit (kit-v50) is not mounted on the V61 figure: a Player 1 look wearing a hat and kit shoes builds V61 with no kit50 group and its own shoe primitive visible, while the same look as the classic figure, and Player 2, carry the kit as before',()=>{
  const kitCount=g=>{let n=0;g.traverse(o=>{if((o.userData&&o.userData.kit50)||/^kit50_/.test(o.name||''))n++;});return n;};
  const shoeVisible=g=>{const v=[];g.traverse(o=>{if(o.isSkinnedMesh&&!/^wear_/.test(o.name)){const m=Array.isArray(o.material)?o.material[0]:o.material;if(m&&m.name==='shoe')v.push(o.visible);}});return v;};
  const v=run("makeAvatar(Object.assign({},lookFor(0),{kit:{head:'A02',feet:'F03'}}))"); assert.equal(v.userData.hero61,true); assert.equal(kitCount(v),0,'kit50 objects on the V61 figure'); same(shoeVisible(v),[true]); let vis=0; v.traverse(o=>{if(o.isSkinnedMesh&&o.visible)vis++;}); assert.equal(vis,6);
  const c=run("makeAvatar(Object.assign({},lookFor(0),{kit:{head:'A02',feet:'F03'},hero61:false}))"); assert(!c.userData.hero61); assert(kitCount(c)>=3,'kit50 objects on the classic figure: '+kitCount(c)); assert(shoeVisible(c).every(x=>x===false),'classic shoe slot hidden under kit shoes');
  const p2=run("makeAvatar(Object.assign({},lookFor(1),{kit:{head:'A02'}}))"); assert(!p2.userData.hero61); assert(kitCount(p2)>=1,'Player 2 kit');
  assert.equal(run("lookFor(0).kit"),undefined,'the state look is untouched by the harness'); 
  return {v61:{kitObjects:kitCount(v),shoeVisible:shoeVisible(v)},classic:{kitObjects:kitCount(c),shoeVisible:shoeVisible(c)},player2KitObjects:kitCount(p2)};});

 check(13,'A failure inside the V61 build (hero61Dress throwing) marks V61 \'error\' with the reason, warns, and returns the classic figure for Player 1 with its wardrobe, leaving the classic asset \'ready\' with its own gltf and clips; the Menu then says why and what Player 1 uses',()=>{
  const r=run("(()=>{const D=hero61Dress;hero61Dress=function(){throw new Error('simulated dress failure');};const keep={state:HERO61.state,error:HERO61.error};const hs=HERO.state,hg=HERO.gltf,hc=HERO.clips;const w=console.warn,warns=[];console.warn=function(){warns.push(Array.from(arguments).join(' '));};let out={};"+
   "try{const g=makeAvatar(lookFor(0));let wear=0;g.traverse(o=>{if(o.isMesh&&/^wear_/.test(o.name))wear++;});out={hero61:!!g.userData.hero61,rig:g.rig,wear,state61:HERO61.state,error:HERO61.error,building:HERO61.building,heroState:HERO.state,heroGltfRestored:HERO.gltf===hg,heroClipsRestored:HERO.clips===hc,warns,status:heroStatusText()};}"+
   "finally{hero61Dress=D;console.warn=w;Object.assign(HERO61,keep);HERO.state=hs;}return out;})()");
  assert.equal(r.hero61,false); assert.equal(r.rig,'hero'); assert(r.wear>0,'classic wardrobe'); assert.equal(r.state61,'error'); assert(/figure could not be built: simulated dress failure/.test(r.error),r.error); assert.equal(r.building,false);
  assert.equal(r.heroState,'ready'); assert.equal(r.heroGltfRestored,true); assert.equal(r.heroClipsRestored,true);
  assert(r.warns.some(w=>/V61 figure for Player 1 could not be built; the classic asset stands in: figure could not be built: simulated dress failure/.test(w)),JSON.stringify(r.warns));
  assert(/^V61 file not used \(figure could not be built: simulated dress failure\)\. Player 1 uses the classic hero\. Character asset: assets\/characters\/efe\.gltf\.json loaded in /.test(r.status),r.status);
  assert.equal(run('HERO61.state'),'ready'); const again=run('makeAvatar(lookFor(0))'); assert.equal(again.userData.hero61,true,'V61 builds again once the stub is gone');
  return {classicAvatar:{rig:r.rig,wearMeshes:r.wear},state:r.state61,error:r.error,classicAsset:{state:r.heroState,gltfRestored:r.heroGltfRestored,clipsRestored:r.heroClipsRestored},status:r.status};});

 return {build:run('BUILD_ID'),checks};
}

// a copy of dist with one file replaced (everything else linked), for the mutant runs
function variantDir(moduleSource){
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd61-hero-'));
 for(const f of fs.readdirSync(GAME)){ if(f==='src') continue; fs.symlinkSync(path.join(GAME,f),path.join(d,f)); }
 fs.mkdirSync(path.join(d,'src'));
 for(const f of fs.readdirSync(path.join(GAME,'src'))){ if(f===MODULE) fs.writeFileSync(path.join(d,'src',f),moduleSource); else fs.symlinkSync(path.join(GAME,'src',f),path.join(d,'src',f)); }
 return d;
}
const child=(args,env)=>new Promise(res=>{const p=cp.spawn(process.execPath,[__filename].concat(args),{env:Object.assign({},process.env,env||{}),stdio:['ignore','pipe','pipe']});let o='',e='';p.stdout.on('data',d=>o+=d);p.stderr.on('data',d=>e+=d);
 p.on('close',code=>{try{res(JSON.parse(o.trim().split('\n').pop()));}catch(x){res({error:(e||o).slice(-600)||('exit '+code)});}});});

if(process.argv[2]==='--inner'){ const only=process.argv[3]?process.argv[3].split(',').map(Number):null; inner(only).then(r=>{process.stdout.write(JSON.stringify(r)+'\n',()=>process.exit(0));}).catch(e=>{console.error(e);process.exit(1);}); }
else (async()=>{
 let main=null; try{ main=await inner(null); }catch(e){ main={build:null,checks:[],error:String(e&&e.stack||e)}; }
 const src=fs.readFileSync(path.join(GAME,'src',MODULE),'utf8'); const mut=[]; const dirs=[];
 try{
  for(const m of MUTANTS){ const n=src.split(m.find).length-1;
   if(n!==1){ mut.push({name:m.name,check:m.check,result:'stale ('+n+' matches)'}); continue; }
   const d=variantDir(src.replace(m.find,m.replace)); dirs.push(d);
   const r=await child(['--inner',String(m.check)],{COMPOUND_GAME_DIR:d}); const c=r.checks&&r.checks[0];
   mut.push({name:m.name,check:m.check,result:c?(c.passed?'green':'red'):'error',first:c&&!c.passed?c.failure:(r.error?String(r.error).slice(0,300):undefined)}); }
 }finally{ for(const d of dirs) fs.rmSync(d,{recursive:true,force:true}); }
 const checks=main.checks.map(c=>{const o=Object.assign({},c);delete o.n;return o;});
 const passed=!main.error&&checks.length===13&&checks.every(c=>c.passed)&&mut.length===MUTANTS.length&&mut.every(m=>m.result==='red');
 const report={build:main.build,passed,checks,mutants:mut,method:'GLB bytes parsed directly; runtime state and geometry in Node with the shipped Three.js r128 and glTF loader (check/runtime-harness.cjs), the V61 file parsed by the same loader and installed through hero61Install, the module\'s load-success path, and the full heroLoad path through a stubbed GLTFLoader.load that answers or fails the V61 request. Each mutant is a one-place change to a temp copy of hero-v61.js run in a child process. No browser, GPU or phone test: framing, colour and cost are the browser pass.'};
 if(main.error) report.error=main.error;
 for(const c of checks) console.log((c.passed?'PASS ':'FAIL ')+c.name.slice(0,160)+(c.passed?'':'\n     '+c.failure));
 for(const m of mut) console.log((m.result==='red'?'PASS ':'FAIL ')+'mutant '+m.name+' turns check '+m.check+' '+m.result+(m.result==='red'?'':(m.first?' ('+m.first.slice(0,160)+')':'')));
 if(main.error) console.log('ERROR',main.error);
 fs.writeFileSync(OUT,JSON.stringify(report,null,1)+'\n');
 console.log(`${checks.filter(c=>c.passed).length}/13 checks, ${mut.filter(m=>m.result==='red').length}/${MUTANTS.length} mutants red`);
 if(!passed) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});

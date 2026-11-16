// Player 1's V71 file (v71): assets/characters/player1-v71.glb, made by tools/player1_v71_shared_albedo.py from the
// delivered V71 carry-walk candidate, and dist/src/garment-v71.js, which names it for hero-v61's loader.
//
//   node check/verify-garment-v71.cjs        writes check/results-garment-v71.json
//
// What is checked: the file itself (bytes parsed directly); what it keeps of player1-v61.glb and exactly where it
// differs; that the rebuilt underarm panel is stitched to the tee and drawn with the tee's own material and the one
// albedo (the delivered candidate's separate panel material and texture is what the game could not draw); the switch
// and the request; the figure the game builds from it; the shirt colour reaching every tee primitive; and the
// WalkCarry hands, measured where the game hangs a carried object. Each mutant is a one-place change to a temp copy of
// garment-v71.js, or to a temp copy of the asset, run in a child process; it must turn its check red.
// No browser or GPU here: what the panel looks like on screen is check/bench-garment-v71.cjs.
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),crypto=require('crypto'),assert=require('assert');
const GAME=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');
const OUT=path.join(__dirname,'results-garment-v71.json');
const GLB='assets/characters/player1-v71.glb', V61='assets/characters/player1-v61.glb', CLASSIC='assets/characters/efe.gltf.json', MODULE='garment-v71.js';
const CANDIDATE_SHA256='79c78e311ab324ad804e3ead5263930030b54753027b49e839f9e1fd32c77fe7';
const CLIPS=['idle','walk','carry','carryLow','walkCarry','walkCarryLow','pick','wave'];
const PRIMS=['skin','hair','top','bottom','shoe','top'];           // the six Body primitives by material name, in file order
const ATTRS=['JOINTS_0','NORMAL','POSITION','TEXCOORD_0','WEIGHTS_0'];
const TRIANGLES={skin:16111,hair:29939,top:15436,bottom:24744,shoe:5418}, PANEL={triangles:770,vertices:435,boundary:98};
const PANEL_UV=[748/1024,300/1024], SIZE_LIMIT=5.5e6, SHOULDER_MAX_DEG=18.6, CHECKS=8;
const MUTANTS=[
 {name:'M1 ?hero=v61 no longer keeps the V61 file',check:4,find:"if(/[?&]hero=v61\\b/.test(q)) return false;",replace:"if(/[?&]hero=v61\\b/.test(q)) return true;"},
 {name:'M2 a stored cd3-hero=v61 is ignored',check:4,find:"return stored!=='v61'; }",replace:"return true; }"},
 {name:'M3 the file is renamed while a request is out or answered',check:5,find:"if(HERO61.state==='idle') HERO61.url=garment71Url();",replace:"HERO61.url=garment71Url();"},
 {name:'M4 the module names the V61 file',check:5,find:"const GARMENT71={url:'assets/characters/player1-v71.glb',",replace:"const GARMENT71={url:'assets/characters/player1-v61.glb',"},
 {name:'A1 the panel wears a material of its own name (as the delivered candidate did)',check:7,asset:J=>{ const m=JSON.parse(JSON.stringify(J.materials[J.meshes[0].primitives[5].material])); m.name='top_v70_rebuilt_panel'; J.materials.push(m); J.meshes[0].primitives[5].material=J.materials.length-1; }},
 {name:'A2 the WalkCarry shoulders are the V61 ones',check:8,asset:(J,bin,ref)=>{ for(const node of ['LeftShoulder','RightShoulder']){ const a=track(J,'WalkCarry',node), b=track(ref.json,'WalkCarry',node); accessorBytes(ref,b.output).copy(accessorBytes({json:J,bin},a.output)); } }}
];
const r4=x=>Math.round(x*1e4)/1e4;
function same(a,b,msg){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),msg);}
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
function writeGLB(file,json,bin){
 let js=Buffer.from(JSON.stringify(json)); if(js.length%4) js=Buffer.concat([js,Buffer.alloc(4-js.length%4,0x20)]);
 const head=Buffer.alloc(20); head.write('glTF',0); head.writeUInt32LE(2,4); head.writeUInt32LE(28+js.length+bin.length,8); head.writeUInt32LE(js.length,12); head.writeUInt32LE(0x4E4F534A,16);
 const bh=Buffer.alloc(8); bh.writeUInt32LE(bin.length,0); bh.writeUInt32LE(0x004E4942,4);
 fs.writeFileSync(file,Buffer.concat([head,js,bh,bin]));
}
const SIZE={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4}, COMP={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
function accessorBytes(glb,i){
 const a=glb.json.accessors[i], v=glb.json.bufferViews[a.bufferView], size=SIZE[a.componentType]*COMP[a.type], off=(v.byteOffset||0)+(a.byteOffset||0);
 assert.equal(v.byteStride||size,size,'interleaved accessor '+i); return glb.bin.subarray(off,off+a.count*size);
}
// one accessor as rows of numbers' bytes: element(k) is the k-th element's bytes, values(k) its numbers
function rows(glb,i){
 const a=glb.json.accessors[i], n=COMP[a.type], w=SIZE[a.componentType], b=accessorBytes(glb,i);
 const read={5121:o=>b.readUInt8(o),5123:o=>b.readUInt16LE(o),5125:o=>b.readUInt32LE(o),5126:o=>b.readFloatLE(o)}[a.componentType];
 return {count:a.count,type:a.componentType,element:k=>b.subarray(k*n*w,(k+1)*n*w).toString('latin1'),values:k=>{const o=[];for(let c=0;c<n;c++)o.push(read((k*n+c)*w));return o;}};
}
// a primitive's triangles as strings, corner by corner, over the named attributes ('JOINTS_0' by value: the two files
// store joint numbers in different widths)
function soup(glb,prim,attrs){
 const idx=rows(glb,prim.indices), A=attrs.map(k=>[k,rows(glb,prim.attributes[k])]), out=[];
 const corner=v=>A.map(([k,r])=>k==='JOINTS_0'?r.values(v).join(','):r.element(v)).join('|');
 for(let t=0;t<idx.count;t+=3) out.push(corner(idx.values(t)[0])+'/'+corner(idx.values(t+1)[0])+'/'+corner(idx.values(t+2)[0]));
 return out;
}
function tally(list){const m=new Map();for(const s of list)m.set(s,(m.get(s)||0)+1);return m;}
function missing(a,b){let n=0;const m=tally(b);for(const s of a){const c=m.get(s)||0;if(c>0)m.set(s,c-1);else n++;}return n;}   // members of a that b does not hold
function track(J,clip,node){ const an=J.animations.find(a=>a.name===clip); const ch=an.channels.find(c=>J.nodes[c.target.node].name===node&&c.target.path==='rotation'); return an.samplers[ch.sampler]; }
function tracks(glb){ const J=glb.json, out={}; for(const an of J.animations) for(const ch of an.channels){ const s=an.samplers[ch.sampler];
  out[an.name+'/'+J.nodes[ch.target.node].name+'/'+ch.target.path]={interpolation:s.interpolation||'LINEAR',input:accessorBytes(glb,s.input).toString('latin1'),output:accessorBytes(glb,s.output).toString('latin1'),in:s.input,out:s.output}; } return out; }

async function inner(only){
 const harness=require('./runtime-harness.cjs');
 const {run,context,THREE}=await harness.load();
 const checks=[];
 const check=(n,name,fn)=>{if(only&&!only.includes(n))return;try{const info=fn();checks.push({n,name,passed:true,info});}catch(e){checks.push({n,name,passed:false,failure:e.message});}};
 const parse=async file=>{const buf=fs.readFileSync(path.join(harness.root,file)); return new Promise((ok,fail)=>new THREE.GLTFLoader().parse(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'',ok,fail));};
 context.v71gltf=await parse(GLB); context.v61gltf=await parse(V61);
 run("buildTextures();buildTextures2();S=newState();S.phase='play';S.p[0].name='Chika';S.p[1].name='Obi';");
 const glb=readGLB(path.join(harness.root,GLB)), ref=readGLB(path.join(harness.root,V61)), J=glb.json, R=ref.json;
 const prims=J.meshes[0].primitives, rprims=R.meshes[0].primitives;

 check(1,'The file is a GLB 2.0 under 5.5 MB with one 27-joint skin, the Body mesh of six primitives [skin, hair, top, bottom, shoe, top] with exactly POSITION/NORMAL/TEXCOORD_0/JOINTS_0/WEIGHTS_0 and no morph targets, five materials that all carry the one JPEG (no second texture, no untextured material), 91,648 triangles, eight clips the game recognises, root extras version 71 naming the delivered candidate, and no accessor or buffer view that nothing references',()=>{
  assert.equal(glb.version,2); assert(glb.bytes.length<SIZE_LIMIT,'file size '+glb.bytes.length);
  assert.equal(J.skins.length,1); assert.equal(J.skins[0].joints.length,27); assert.equal(J.meshes.length,1); assert.equal(J.meshes[0].name,'Body'); assert.equal(prims.length,6);
  same(prims.map(p=>J.materials[p.material].name),PRIMS); same(J.materials.map(m=>m.name),PRIMS.slice(0,5));
  for(const m of J.materials){ const t=m.pbrMetallicRoughness&&m.pbrMetallicRoughness.baseColorTexture; assert(t&&t.index===0,m.name+' does not carry texture 0'); }
  assert.equal(J.textures.length,1); assert.equal(J.images.length,1); assert.equal(J.images[0].mimeType,'image/jpeg');
  const tris={}; for(const p of prims){ assert(!p.targets,'morph targets'); same(Object.keys(p.attributes).sort(),ATTRS); const n=J.materials[p.material].name; tris[n]=(tris[n]||0)+J.accessors[p.indices].count/3; }
  same(tris,TRIANGLES); const total=Object.values(tris).reduce((a,b)=>a+b,0); assert.equal(total,91648);
  const clipName=run('heroClipName'); assert.equal(J.animations.length,8); same(J.animations.map(a=>clipName(a.name)).sort(),CLIPS.slice().sort());
  const root=J.nodes[J.scenes[0].nodes[0]], ex=root.extras||{}; assert.equal(root.name,'Player1'); assert.equal(ex.version,71); assert.equal(ex.candidateSha256,CANDIDATE_SHA256);
  const used=new Set(); for(const p of prims){ used.add(p.indices); Object.values(p.attributes).forEach(i=>used.add(i)); } used.add(J.skins[0].inverseBindMatrices);
  for(const an of J.animations) for(const s of an.samplers){ used.add(s.input); used.add(s.output); }
  assert.equal(used.size,J.accessors.length,'unreferenced accessors'); const views=new Set([...used].map(i=>J.accessors[i].bufferView)); J.images.forEach(im=>views.add(im.bufferView)); assert.equal(views.size,J.bufferViews.length,'unreferenced buffer views');
  for(let i=0;i<J.accessors.length;i++){ const a=J.accessors[i]; if(a.componentType!==5126) continue; const b=accessorBytes(glb,i); for(let o=0;o<b.length;o+=4) if(!Number.isFinite(b.readFloatLE(o))) throw new Error('non-finite value in accessor '+i); }
  return {bytes:glb.bytes.length,sha256:sha(glb.bytes),v61Bytes:ref.bytes.length,generator:J.asset.generator,primitives:PRIMS,trianglesByMaterial:tris,triangles:total,accessors:J.accessors.length,bufferViews:J.bufferViews.length,clips:J.animations.map(a=>a.name),extras:{version:ex.version,visualRevision:ex.visualRevision,candidateSha256:ex.candidateSha256,changedClip:ex.changedClip,shoulderCarryBlend:ex.shoulderCarryBlend}};});

 check(2,'Against player1-v61.glb: the same albedo bytes, joints, joint transforms and inverse binds; hair, trousers and shoes triangle for triangle; the skin minus four triangles; every tee triangle outside the panel at its V61 position, UV and weights (normals renewed only beside the join); and every animation track byte for byte except the two WalkCarry shoulder rotations, which keep their key times and move by at most 18.6 degrees',()=>{
  const img=g=>{const v=g.json.bufferViews[g.json.images[0].bufferView];return g.bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);}; assert(img(glb).equals(img(ref)),'albedo bytes');
  assert(accessorBytes(glb,J.skins[0].inverseBindMatrices).equals(accessorBytes(ref,R.skins[0].inverseBindMatrices)),'inverse binds');
  const bare=n=>{const o=Object.assign({},n);delete o.extras;return o;}; same(J.nodes.map(bare),R.nodes.map(bare),'nodes'); same(J.skins[0].joints,R.skins[0].joints);
  for(const i of [1,3,4]) same(soup(glb,prims[i],ATTRS),soup(ref,rprims[i],ATTRS),PRIMS[i]+' triangles');
  const skinA=soup(glb,prims[0],ATTRS), skinR=soup(ref,rprims[0],ATTRS); assert.equal(missing(skinA,skinR),0,'skin triangles that V61 does not hold'); const skinGone=missing(skinR,skinA); assert.equal(skinGone,4);
  const NN=['POSITION','TEXCOORD_0','JOINTS_0','WEIGHTS_0'], teeR=soup(ref,rprims[2],NN); assert.equal(missing(soup(glb,prims[2],NN),teeR),0,'tee triangles moved, re-mapped or re-weighted');
  const normalsRenewed=missing(soup(glb,prims[2],ATTRS),soup(ref,rprims[2],ATTRS)); assert(normalsRenewed>0&&normalsRenewed<=400,'tee triangles with renewed normals: '+normalsRenewed);
  const A=tracks(glb), B=tracks(ref); same(Object.keys(A).sort(),Object.keys(B).sort(),'animation channels');
  const differing=Object.keys(A).filter(k=>A[k].input!==B[k].input||A[k].output!==B[k].output||A[k].interpolation!==B[k].interpolation).sort();
  same(differing,['WalkCarry/LeftShoulder/rotation','WalkCarry/RightShoulder/rotation']); const moved={};
  for(const k of differing){ assert.equal(A[k].input,B[k].input,k+' key times'); const a=rows(glb,A[k].out), b=rows(ref,B[k].out); assert.equal(a.count,b.count); let max=0,min=360;
   for(let i=0;i<a.count;i++){ const p=a.values(i), q=b.values(i); const len=Math.hypot(...p); assert(Math.abs(len-1)<1e-5,k+' key '+i+' is not a unit quaternion'); const d=Math.min(1,Math.abs(p[0]*q[0]+p[1]*q[1]+p[2]*q[2]+p[3]*q[3])); const deg=2*Math.acos(d)*180/Math.PI; max=Math.max(max,deg); min=Math.min(min,deg); }
   assert(max<=SHOULDER_MAX_DEG&&min>10,k+' moved '+min+' to '+max+' degrees'); moved[k]={keys:a.count,degrees:[+min.toFixed(2),+max.toFixed(2)]}; }
  return {channels:Object.keys(A).length,changedTracks:moved,skinTrianglesRemoved:skinGone,teeTrianglesOutsidePanel:prims[2]&&J.accessors[prims[2].indices].count/3,teeTrianglesWithRenewedNormals:normalsRenewed,v61TeeAndPatchTriangles:R.accessors[rprims[2].indices].count/3+R.accessors[rprims[5].indices].count/3};});

 check(3,'The rebuilt underarm panel: 770 triangles on 435 vertices with no edge shared by more than two of them, drawn with the tee\'s own material, every UV on one flat cloth texel of the albedo, and stitched: each of its 98 open edges is an open edge of the tee at the same two positions, and each of those vertices has a tee vertex at its position with the same joints and weights, so the join cannot open when the figure moves',()=>{
  const panel=prims[5], tee=prims[2]; assert.equal(panel.material,tee.material,'panel material'); assert.equal(J.materials[panel.material].name,'top');
  const idx=rows(glb,panel.indices), P=rows(glb,panel.attributes.POSITION), UV=rows(glb,panel.attributes.TEXCOORD_0); assert.equal(idx.count/3,PANEL.triangles); assert.equal(P.count,PANEL.vertices);
  const want=new Float32Array(PANEL_UV); for(let v=0;v<UV.count;v++){ const u=UV.values(v); assert(u[0]===want[0]&&u[1]===want[1],'panel UV '+v+' is '+u); }
  const skinKey=(prim,v)=>rows(glb,prim.attributes.JOINTS_0).values(v).join(',')+'|'+rows(glb,prim.attributes.WEIGHTS_0).element(v);
  const edges=(prim)=>{const I=rows(glb,prim.indices), Q=rows(glb,prim.attributes.POSITION), m=new Map(); for(let t=0;t<I.count;t+=3){ const v=[I.values(t)[0],I.values(t+1)[0],I.values(t+2)[0]]; for(let e=0;e<3;e++){ const a=Q.element(v[e]), b=Q.element(v[(e+1)%3]); const k=a<b?a+b:b+a; m.set(k,(m.get(k)||0)+1); } } return m;};
  const pe=edges(panel), te=edges(tee); let open=0, stitched=0, crowded=0; for(const [k,n] of pe){ if(n>2) crowded++; if(n===1){ open++; if(te.get(k)===1) stitched++; } }
  assert.equal(crowded,0,'panel edges shared by more than two triangles'); assert.equal(open,PANEL.boundary); assert.equal(stitched,open,'open panel edges without a tee edge');
  const TP=rows(glb,tee.attributes.POSITION), teeAt=new Map(); for(let v=0;v<TP.count;v++){ const k=TP.element(v); if(!teeAt.has(k)) teeAt.set(k,new Set()); teeAt.get(k).add(skinKey(tee,v)); }
  const rim=new Map(); { const cnt=new Map(), ends=new Map(); for(let t=0;t<idx.count;t+=3){ const v=[idx.values(t)[0],idx.values(t+1)[0],idx.values(t+2)[0]]; for(let e=0;e<3;e++){ const a=P.element(v[e]), b=P.element(v[(e+1)%3]); const k=a<b?a+b:b+a; cnt.set(k,(cnt.get(k)||0)+1); ends.set(k,[v[e],v[(e+1)%3]]); } } for(const [k,n] of cnt) if(n===1) for(const v of ends.get(k)) rim.set(P.element(v),v); }
  let bound=0; for(const [pos,v] of rim){ const s=teeAt.get(pos); if(s&&s.has(skinKey(panel,v))) bound++; } assert.equal(rim.size,PANEL.boundary); assert.equal(bound,rim.size,'rim vertices skinned differently from the tee');
  return {triangles:idx.count/3,vertices:P.count,uv:Array.from(want),openEdges:open,stitchedEdges:stitched,rimVertices:rim.size,rimVerticesSkinnedLikeTheTee:bound};});

 check(4,'The switch: ?hero=v61 and a stored cd3-hero=v61 keep the V61 file, ?hero=v71 forces the V71 file over the stored choice, anything else (?hero=v55 and a stored v55 among them, which hero-v61 answers) names the V71 file',()=>{
  const sw=run('garment71Switch'); const cases={plain:[['',null],true],v61:[['?hero=v61',null],false],v61second:[['?a=1&hero=v61',null],false],v61prefixOnly:[['?hero=v612',null],true],stored:[['','v61'],false],v71OverStored:[['?hero=v71','v61'],true],v55:[['?hero=v55',null],true],storedV55:[['','v55'],true],storedOther:[['','classic'],true]};
  const got={}; for(const k in cases){ got[k]=sw(cases[k][0][0],cases[k][0][1]); assert.equal(got[k],cases[k][1],k); }
  assert.equal(run('GARMENT71.enabled'),true); assert.equal(run('garment71Url()'),GLB); assert.equal(run("(()=>{GARMENT71.enabled=false;try{return garment71Url();}finally{GARMENT71.enabled=true;}})()"),V61);
  return got;});

 check(5,'heroLoad requests player1-v71.glb with the build revision query first and the classic efe.gltf.json second; with the switch at V61 the first request is player1-v61.glb; a file that is loading or loaded is not renamed; with HERO61 disabled only the classic request is made',()=>{
  const b=run('BUILD_ID'); const urls=pre=>run("(()=>{const L=THREE.GLTFLoader.prototype.load;const seen=[];THREE.GLTFLoader.prototype.load=function(u){seen.push(u);};const st=HERO.state,st61=HERO61.state,u61=HERO61.url,en=HERO61.enabled,g71=GARMENT71.enabled;HERO.state='idle';HERO61.state='idle';"+pre+"try{heroLoad();seen.push('url:'+HERO61.url);}finally{THREE.GLTFLoader.prototype.load=L;HERO.state=st;HERO61.state=st61;HERO61.url=u61;HERO61.enabled=en;GARMENT71.enabled=g71;}return seen;})()");
  const on=urls(''), off=urls('GARMENT71.enabled=false;'), busy=urls("HERO61.state='ready';HERO61.url='assets/characters/held.glb';GARMENT71.enabled=false;"), classic=urls('HERO61.enabled=false;');
  same(on,[GLB+'?v='+b,CLASSIC+'?v='+b,'url:'+GLB]); same(off,[V61+'?v='+b,CLASSIC+'?v='+b,'url:'+V61]); same(busy,[CLASSIC+'?v='+b,'url:assets/characters/held.glb']); assert.equal(classic.length,2); assert.equal(classic[0],CLASSIC+'?v='+b);
  for(const f of [GLB,V61]) assert(fs.statSync(path.join(harness.root,f)).isFile(),f+' is not in the build');
  return {v71:on,v61:off,alreadyReady:busy,classicOnly:classic};});

 check(6,'Installed through hero61Install and built by makeAvatar(lookFor(0)), the V71 file is the V61 figure: six visible skinned primitives in file order, every one of them carrying the albedo (no flat patch left), the tee and its panel in the asset\'s blue, skin, hair, trousers and shoes white, no wardrobe or hair mount, 8 actions and the hand and head bones',()=>{
  const inst=run('hero61Install(v71gltf)'); same(inst.clips.slice().sort(),CLIPS.slice().sort()); assert.equal(inst.skinned,6); same(inst.textured,['skin','hair','top','bottom','shoe']);
  const g=run('makeAvatar(lookFor(0))'); assert.equal(g.userData.hero61,true); assert(g.hero&&g.hero.v61===true,'g.hero.v61');
  const skinned=[]; g.traverse(o=>{if(o.isSkinnedMesh)skinned.push(o);}); same(skinned.map(o=>o.material.name),PRIMS); same(skinned.map(o=>o.userData.hero61Slot),PRIMS);
  const albedo=run('HERO61.albedo'), src=run('HERO61.sourceColors'), colours={};
  for(const o of skinned){ const m=o.material; assert.equal(o.visible,true,m.name+' hidden'); assert.equal(o.userData.hero61Textured,true,m.name+' is not textured'); assert.equal(m.map,albedo,m.name+' map'); colours[m.name]=m.color.toArray().map(v=>+v.toFixed(4)); same(colours[m.name],src[m.name].toArray().map(v=>+v.toFixed(4)),m.name+' colour'); }
  for(const n of ['skin','hair','bottom','shoe']) same(colours[n],[1,1,1],n); assert(colours.top[2]>colours.top[0]&&colours.top[2]>colours.top[1],'the tee is blue');
  let mounts=0,wear=0; g.traverse(o=>{if(o.name==='hairMount'||o.name==='wardrobeHair')mounts++; if(o.isMesh&&/^wear_/.test(o.name))wear++;}); assert.equal(mounts,0); assert.equal(wear,0);
  same(Object.keys(g.actions).sort(),CLIPS.slice().sort()); assert(g.hero.handL&&g.hero.handR&&g.hero.head,'hand and head bones'); assert.equal(g.hero.body.skeleton.bones.length,27);
  return {skinnedMeshes:skinned.length,slots:skinned.map(o=>o.userData.hero61Slot),allCarryTheAlbedo:true,colours,actions:Object.keys(g.actions).length};});

 check(7,'The shirt colour reaches the whole tee: with Player 1\'s shirt set to coral both tee primitives (the tee and its panel) carry the coral material over the albedo and nothing else is recoloured; back on sky they are the asset\'s own again',()=>{
  run('hero61Install(v71gltf)'); const build=()=>{const g=run('makeAvatar(lookFor(0))'); const o=[]; g.traverse(m=>{if(m.isSkinnedMesh)o.push({slot:m.userData.hero61Slot,shirt:(m.material.userData&&m.material.userData.cdShirt66)||null,albedo:m.material.map===run('HERO61.albedo')});}); return o;};
  run("S.p[0].colors=Object.assign({},S.p[0].colors,{shirt66:'coral'});"); const coral=build(); run("S.p[0].colors.shirt66='sky';"); const sky=build();
  same(coral.map(o=>o.slot),PRIMS); for(const o of coral){ assert.equal(o.albedo,true,o.slot+' lost the albedo'); assert.equal(o.shirt,o.slot==='top'?'coral':null,o.slot+' shirt colour'); }
  assert.equal(coral.filter(o=>o.shirt==='coral').length,2); for(const o of sky) assert.equal(o.shirt,null,o.slot+' on sky');
  return {coral,sky};});

 check(8,'WalkCarry holds the hands out where Carry holds them: at 32 points of the stride the game\'s carry anchor (the midpoint of the two hand bones, where placeCarried hangs an object) stays at least 0.14 m in front of the hips on the V71 file, where the V61 file lets it fall under 0.10 m, and it starts within 0.07 m of the standing Carry anchor (V61: about 0.14 m), so a carried object no longer jumps toward the body when Player 1 sets off; Carry itself is the same in both files',()=>{
  const measure=file=>{ context.g71file=file; return run("(()=>{hero61Install(g71file);const g=makeAvatar(lookFor(0));const hips=g.hero.body.skeleton.bones.find(b=>b.name==='Hips');const out={};const a=new THREE.Vector3(),h=new THREE.Vector3();"+
   "for(const key of ['carry','walkCarry']){const act=g.actions[key];for(const k in g.actions)g.actions[k].stop();act.reset();act.setEffectiveWeight(1);act.play();const d=act.getClip().duration,rows=[];"+
   "for(let i=0;i<32;i++){g.mixer.setTime(d*i/32);g.updateMatrixWorld(true);carryAnchor({g},a);hips.getWorldPosition(h);g.worldToLocal(a);g.worldToLocal(h);rows.push([a.x-h.x,a.y-h.y,a.z-h.z]);}out[key]=rows;}return out;})()"); };
  const v71=measure(run('v71gltf')), v61=measure(run('v61gltf')); run('hero61Install(v71gltf)');
  const fwd=r=>r.map(p=>p[2]), minOf=a=>Math.min(...a), maxOf=a=>Math.max(...a), mean=a=>a.reduce((x,y)=>x+y,0)/a.length, dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);
  for(let i=0;i<32;i++) assert(dist(v71.carry[i],v61.carry[i])<1e-6,'Carry differs between the files at sample '+i);
  const out={v71:{carryForward:r4(mean(fwd(v71.carry))),walkCarryForward:[r4(minOf(fwd(v71.walkCarry))),r4(maxOf(fwd(v71.walkCarry)))],startJump:r4(dist(v71.walkCarry[0],v71.carry[0]))},
             v61:{carryForward:r4(mean(fwd(v61.carry))),walkCarryForward:[r4(minOf(fwd(v61.walkCarry))),r4(maxOf(fwd(v61.walkCarry)))],startJump:r4(dist(v61.walkCarry[0],v61.carry[0]))}};
  assert(out.v71.walkCarryForward[0]>=0.14,'V71 anchor falls to '+out.v71.walkCarryForward[0]+' m in front of the hips'); assert(out.v61.walkCarryForward[1]<0.10,'V61 anchor '+out.v61.walkCarryForward[1]);
  assert(out.v71.startJump<=0.07,'V71 start jump '+out.v71.startJump); assert(out.v61.startJump>0.12,'V61 start jump '+out.v61.startJump);
  return out;});

 return {build:run('BUILD_ID'),checks};
}

// A temp copy of the game with one file replaced: the module's source, or the V71 asset.
function variantDir(change){
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd71-garment-'));
 const link=(from,to,skip)=>{ for(const f of fs.readdirSync(from)){ if(skip.includes(f)) continue; fs.symlinkSync(path.join(from,f),path.join(to,f)); } };
 link(GAME,d,['src','assets']); fs.mkdirSync(path.join(d,'src')); fs.mkdirSync(path.join(d,'assets')); fs.mkdirSync(path.join(d,'assets/characters'));
 link(path.join(GAME,'assets'),path.join(d,'assets'),['characters']);
 link(path.join(GAME,'src'),path.join(d,'src'),change.module!==undefined?[MODULE]:[]); link(path.join(GAME,'assets/characters'),path.join(d,'assets/characters'),change.asset?[path.basename(GLB)]:[]);
 if(change.module!==undefined) fs.writeFileSync(path.join(d,'src',MODULE),change.module);
 if(change.asset){ const g=readGLB(path.join(GAME,GLB)), bin=Buffer.from(g.bin); change.asset(g.json,bin,readGLB(path.join(GAME,V61))); writeGLB(path.join(d,GLB),g.json,bin); }
 return d;
}
const child=(args,env)=>new Promise(res=>{const p=cp.spawn(process.execPath,[__filename].concat(args),{env:Object.assign({},process.env,env||{}),stdio:['ignore','pipe','pipe']});let o='',e='';p.stdout.on('data',d=>o+=d);p.stderr.on('data',d=>e+=d);
 p.on('close',code=>{try{res(JSON.parse(o.trim().split('\n').pop()));}catch(x){res({error:(e||o).slice(-600)||('exit '+code)});}});});

if(process.argv[2]==='--inner'){ const only=process.argv[3]?process.argv[3].split(',').map(Number):null; inner(only).then(r=>{process.stdout.write(JSON.stringify(r)+'\n',()=>process.exit(0));}).catch(e=>{console.error(e);process.exit(1);}); }
else (async()=>{
 let main=null; try{ main=await inner(null); }catch(e){ main={build:null,checks:[],error:String(e&&e.stack||e)}; }
 const src=fs.readFileSync(path.join(GAME,'src',MODULE),'utf8'); const mut=[]; const dirs=[];
 try{
  for(const m of MUTANTS){ let d;
   if(m.asset) d=variantDir({asset:m.asset});
   else { const n=src.split(m.find).length-1; if(n!==1){ mut.push({name:m.name,check:m.check,result:'stale ('+n+' matches)'}); continue; } d=variantDir({module:src.replace(m.find,m.replace)}); }
   dirs.push(d);
   const r=await child(['--inner',String(m.check)],{COMPOUND_GAME_DIR:d}); const c=r.checks&&r.checks[0];
   mut.push({name:m.name,check:m.check,result:c?(c.passed?'green':'red'):'error',first:c&&!c.passed?c.failure:(r.error?String(r.error).slice(0,300):undefined)}); }
 }finally{ for(const d of dirs) fs.rmSync(d,{recursive:true,force:true}); }
 const checks=main.checks.map(c=>{const o=Object.assign({},c);delete o.n;return o;});
 const passed=!main.error&&checks.length===CHECKS&&checks.every(c=>c.passed)&&mut.length===MUTANTS.length&&mut.every(m=>m.result==='red');
 const report={build:main.build,passed,checks,mutants:mut,method:'GLB bytes of player1-v71.glb and player1-v61.glb parsed directly and compared; runtime state in Node with the shipped Three.js r128 and glTF loader (check/runtime-harness.cjs), both files parsed by the same loader and installed through hero61Install, the figure built by makeAvatar, the clips sampled through the figure\'s own mixer and the game\'s carryAnchor. Each mutant is a one-place change to a temp copy of garment-v71.js, or to a temp copy of the V71 file, run in a child process. No browser, GPU or phone test: the picture of the panel under the arm in both shirt colours is check/bench-garment-v71.cjs, and triangle crossings between hands and tee were counted by the delivered package, not here.'};
 if(main.error) report.error=main.error;
 for(const c of checks) console.log((c.passed?'PASS ':'FAIL ')+c.name.slice(0,160)+(c.passed?'':'\n     '+c.failure));
 for(const m of mut) console.log((m.result==='red'?'PASS ':'FAIL ')+'mutant '+m.name+' turns check '+m.check+' '+m.result+(m.result==='red'?'':(m.first?' ('+m.first.slice(0,160)+')':'')));
 if(main.error) console.log('ERROR',main.error);
 fs.writeFileSync(OUT,JSON.stringify(report,null,1)+'\n');
 console.log(`${checks.filter(c=>c.passed).length}/${CHECKS} checks, ${mut.filter(m=>m.result==='red').length}/${MUTANTS.length} mutants red`);
 if(!passed) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});

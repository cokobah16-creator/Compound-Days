// Verifies the authored-character build (v33a): the v21 hero model and its 16 wardrobe pieces,
// their binding, the look migration, the neighbours, the kept environment work and the seating.
// Runs the shipped game JavaScript and glTF loader in Node; nothing is rendered.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const harness=require('./runtime-harness.cjs');
const HERO_ORDER=['Hips','Spine','Spine1','Spine2','Neck','Head','HeadTop_End','LeftShoulder','LeftArm','LeftForeArm','LeftHand','LeftHandEnd','RightShoulder','RightArm','RightForeArm','RightHand','RightHandEnd','LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase','LeftToe_End','RightUpLeg','RightLeg','RightFoot','RightToeBase','RightToe_End'];
const CLIPS=['idle','walk','carry','carryLow','walkCarry','walkCarryLow','pick','wave'];
const BODY_SLOTS=['skin','top','bottom','shoe','sole'];
const V21_WARDROBE=['ankara_shirt','ankara_trousers','hair_afro','hair_boxbraids','hair_locs','hair_lowtaper','hair_twists','hair_wig','headwrap_everyday','jeans','kaftan_trousers','kaftan_tunic','leather_sandals','sandals','sneakers','tee'];
const CAST_SCALE={ada:.98,tunde:1.035,bassey:1.01,nkechi:.97,oyelaran:.95},AMBIENT_SCALES=[1,.97,1.025,.99];
const SEAT_HIP=.10,SEAT_FOOT=.10; // polish-v30 seatPose constants for the v21 rig
const SOLE_TOL=.01; // a sole mesh rests within 1 cm of the floor
const SEAT_SINK_LIMIT=.20; // deepest thigh-band trouser vertex below the cushion top: known v21 weighting limit (CHARACTER.md), measured about .17

function finite(a){for(const n of a)assert(Number.isFinite(n),'non-finite value');}
// Values from the vm context have their own Array prototype, so compare by structure.
function same(a,b,msg){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),msg);}
function close(a,b,eps=1e-3){assert(Math.abs(a-b)<=eps,`${a} differs from ${b} by more than ${eps}`);}
// Raw bytes of a glTF-JSON skin's inverse bind matrices (27 joints x 16 floats).
function ibmBytes(file,skin){
  const json=JSON.parse(fs.readFileSync(path.join(harness.root,file),'utf8'));
  return (skin===undefined?json.skins||[]:[json.skins[skin]]).map(s=>{const acc=json.accessors[s.inverseBindMatrices],bv=json.bufferViews[acc.bufferView],buf=json.buffers[bv.buffer];
    assert.equal(acc.count,27);assert.equal(acc.type,'MAT4');assert.equal(acc.componentType,5126);
    const bytes=Buffer.from(buf.uri.split(',')[1],'base64'),start=(bv.byteOffset||0)+(acc.byteOffset||0);return bytes.subarray(start,start+27*64);});
}
let build=null;const checks=[];
(async()=>{
 const {run,context,THREE,parse}=await harness.load();
 const pass=(name,details)=>{checks.push(details?{name,passed:true,details}:{name,passed:true});console.log('PASS',name);};
 const finiteAvatar=g=>{let n=0;g.traverse(o=>{if(!o.isMesh)return;const P=o.geometry.attributes.position;assert(P,'mesh without positions '+o.name);finite(P.array);n++;});return n;};
 run("buildTextures();buildTextures2();S=newState();S.phase='play';S.p[0].name='Chika';S.p[1].name='Obi';");

 // 1. The hero asset.
 assert.equal(run('HERO.url'),'assets/characters/efe.gltf.json');assert.equal(run('HERO.state'),'ready');
 const heroBody=run("(()=>{let b=null;HERO.gltf.scene.traverse(o=>{if(!b&&o.isSkinnedMesh)b=o;});return b;})()");
 assert(heroBody&&heroBody.parent.name==='Body');
 same(heroBody.skeleton.bones.map(b=>b.name),HERO_ORDER);
 const bodyPrims=heroBody.parent.children.filter(o=>o.isSkinnedMesh);
 assert.equal(bodyPrims.length,5);same(bodyPrims.map(o=>o.material.name),BODY_SLOTS);
 for(const o of bodyPrims){assert(o.skeleton.bones.every((b,i)=>b===heroBody.skeleton.bones[i]),'body primitives share the hero bones');finite(o.geometry.attributes.position.array);assert(o.geometry.attributes.skinIndex&&o.geometry.attributes.skinWeight);}
 assert.equal(run('HERO.gltf.animations.length'),8);same(Object.keys(run('HERO.clips')).sort(),CLIPS.slice().sort());
 for(const c of run('HERO.gltf.animations'))assert(c.duration>0&&c.tracks.length>=20,'clip '+c.name);
 const extras=run("(()=>{let e=null;HERO.gltf.scene.traverse(o=>{if(!e&&o.userData&&o.userData.hairMount)e=o.userData;});return e;})()");
 assert(extras,'root extras missing');for(const k of ['x','y','z','scale','headR'])assert.equal(typeof extras.hairMount[k],'number',k);
 assert(Array.isArray(extras.headCentre)&&extras.headCentre.length===3);finite(extras.headCentre);
 const heroIBM=ibmBytes('assets/characters/efe.gltf.json',0)[0],heroSha=crypto.createHash('sha256').update(heroIBM).digest('hex').slice(0,12);
 // boot() fetches the hero through authored-v34's heroLoad wrapper: a revision query like the wardrobe's, the plain path restored.
 const heroUrl=run("(()=>{const L=THREE.GLTFLoader.prototype.load;let seen=null;THREE.GLTFLoader.prototype.load=function(u){seen=u;};const st=HERO.state;HERO.state='idle';try{heroLoad();}finally{THREE.GLTFLoader.prototype.load=L;HERO.state=st;}return seen;})()");
 assert.equal(heroUrl,'assets/characters/efe.gltf.json?v='+run('BUILD_ID'));assert.equal(run('HERO.url'),'assets/characters/efe.gltf.json');assert.equal(run('AUTHORED34.installed'),true);
 pass('Hero loads from efe.gltf.json (fetched with the build revision query) with 27 joints in hero order, 8 clips, five material-named body primitives and hairMount/headCentre extras',{joints:27,clips:CLIPS,inverseBindSha:heroSha,hairMount:extras.hairMount,headCentre:extras.headCentre,requestUrl:heroUrl});

 // 2. The 16 authored wardrobe pieces, bound exactly like the hero.
 same(Object.keys(run('WARDROBE.cache')).sort(),V21_WARDROBE); // the harness parses the files itself; the in-page loader (WARDROBE.failed) is a browser matter
 same([...new Set(run("[...Object.values(WARDROBE.hair),...Object.values(WARDROBE.outfits).flat()]"))].sort(),V21_WARDROBE);
 const heroInv=heroBody.skeleton.boneInverses.map(m=>m.elements);let skins=0,rigid=0;
 for(const id of V21_WARDROBE){
   const file='assets/wardrobe/'+id+'.gltf.json';
   for(const bytes of ibmBytes(file)){assert(bytes.equals(heroIBM),id+' inverse bind matrices differ from the hero');skins++;}
   const src=run('WARDROBE.cache[wardrobeId]',context.wardrobeId=id);
   src.scene.traverse(o=>{if(!o.isMesh)return;finite(o.geometry.attributes.position.array);
     if(o.isSkinnedMesh){same(o.skeleton.bones.map(b=>b.name),HERO_ORDER,id);o.skeleton.boneInverses.forEach((m,i)=>{for(let k=0;k<16;k++)assert(m.elements[k]===heroInv[i][k],id+' bone '+i+' element '+k);});
       const w=o.geometry.attributes.skinWeight;for(let i=0;i<w.count;i++)close(w.getX(i)+w.getY(i)+w.getZ(i)+w.getW(i),1,1e-4);}
     else rigid++;});
   const ex=run('wardrobeExtras(WARDROBE.cache[wardrobeId])');assert(['garment','feet','hair'].includes(ex.kind),id+' kind');assert(Array.isArray(ex.slots),id+' slots');
   for(const s of ex.slots)assert(BODY_SLOTS.includes(s),id+' slot '+s);
 }
 pass('Exactly the 16 v21 wardrobe pieces are referenced and parse, and every skinned piece carries the hero inverse bind matrices byte for byte',{pieces:V21_WARDROBE.length,skins,rigidMeshes:rigid});

 // 3. Both players on the hero rig.
 const players=[0,1].map(i=>{const look=run('lookFor('+i+')');assert.equal(look.rig,'hero');const g=run('makeHeroAvatar(lookFor('+i+'))');assert(g&&g.hero&&g.hero.body);
   assert.equal(g.hero.body.skeleton.bones.length,27);assert.equal(Object.keys(g.actions).length,8);return {look,meshes:finiteAvatar(g),g};});
 assert(players[0].g.hero.body.skeleton!==players[1].g.hero.body.skeleton,'players share a skeleton');
 // authored-v34 calibration: skin and skin_dark are the swatch (and its .86 shade) through the managed sRGB path times skinShade; hair is hairColour at roughness .88.
 const shade=run('AUTHORED34.skinShade'),hairHex=run('AUTHORED34.hairColour');assert(shade>0&&shade<1,'skinShade '+shade);assert(/^#[0-9A-Fa-f]{6}$/.test(hairHex),'hairColour '+hairHex);
 const colours={};
 for(const p of players){context.skinHex=p.look.skin;const want={skin:run('new THREE.Color(skinHex).multiplyScalar(AUTHORED34.skinShade).toArray()'),skin_dark:run('new THREE.Color(shade(skinHex,0.86)).multiplyScalar(AUTHORED34.skinShade).toArray()'),hair:run('new THREE.Color(AUTHORED34.hairColour).toArray()')};
   let skins=0,hairs=0;p.g.traverse(o=>{if(!o.isMesh)return;for(const m of (Array.isArray(o.material)?o.material:[o.material])){if(!m)continue;
     if(m.name==='skin'||m.name==='skin_dark'){skins++;m.color.toArray().forEach((v,k)=>close(v,want[m.name][k],1e-6));}
     if(/^wearhair_/.test(o.name)&&/^hair/.test(m.name)){hairs++;m.color.toArray().forEach((v,k)=>close(v,want.hair[k],1e-6));close(m.roughness,.88,1e-6);}}});
   assert(skins>=2&&hairs>=1,'calibrated materials');colours[p.look.skin]={skinMaterials:skins,hairMaterials:hairs,skinLinear:want.skin.map(v=>+v.toFixed(4))};}
 pass('lookFor(0) and lookFor(1) both use rig hero and makeHeroAvatar builds both with finite geometry and the calibrated skin and hair colours',{meshes:players.map(p=>p.meshes),looks:players.map(p=>[p.look.hair,p.look.outfit]),skinShade:shade,hairColour:hairHex,colours});

 // 4. Every hair id and outfit id.
 const equipped={hair:{},outfits:{},painted:[]};
 for(const hair of Object.keys(run('WARDROBE.hair'))){
   context.hairId=hair;run("S.p[0].hair=hairId==='wrap'?'low':hairId;S.p[0].headwear=hairId==='wrap'?'wrap':'none';");
   const g=run('makeHeroAvatar(lookFor(0))');finiteAvatar(g);const names=[];g.traverse(o=>{if(o.isMesh&&/^wearhair_/.test(o.name)){names.push(o.name);let p=o;while(p&&p!==g.hero.bones.head)p=p.parent;assert(p===g.hero.bones.head,o.name+' not under the Head bone');}});
   assert(names.length>0,'no hair meshes for '+hair);assert(!g.getObjectByName('hairMount'),'built-in hair fell back for '+hair);equipped.hair[hair]=names.length;
 }
 run("S.p[0].hair='locs';S.p[0].headwear='none';");
 for(const outfit of Object.keys(run('WARDROBE.outfits'))){
   context.outfitId=outfit;run('S.p[1].outfit=outfitId');const g=run('makeHeroAvatar(lookFor(1))');finiteAvatar(g);
   const pieces=run('WARDROBE.outfits[outfitId]'),wear=[],body=g.hero.body;
   g.traverse(o=>{if(o.isMesh&&/^wear_/.test(o.name)){wear.push(o.name);if(o.isSkinnedMesh)assert(o.skeleton===body.skeleton,o.name+' not bound to the hero skeleton');}});
   for(const piece of pieces){assert(wear.some(n=>n.startsWith('wear_'+piece+'_')),piece+' not equipped');
     for(const slot of run('wardrobeExtras(WARDROBE.cache[pieceId]).slots',context.pieceId=piece))
       for(const o of body.parent.children)if(o.isSkinnedMesh&&!/^wear_/.test(o.name)&&o.material.name===slot)assert.equal(o.visible,false,slot+' still visible under '+piece);}
   equipped.outfits[outfit]=wear.length;
 }
 for(const outfit of run('OUTFITS.map(o=>o.id)').filter(id=>!run('WARDROBE.outfits')[id])){
   context.outfitId=outfit;run('S.p[1].outfit=outfitId');const g=run('makeHeroAvatar(lookFor(1))');finiteAvatar(g);
   let wear=0;g.traverse(o=>{if(o.isMesh&&/^wear_/.test(o.name))wear++;});assert.equal(wear,0,outfit+' should be painted');
   for(const o of g.hero.body.parent.children)if(o.isSkinnedMesh&&['top','bottom','shoe','sole'].includes(o.material.name))assert.equal(o.visible,true,outfit+' hides '+o.material.name);
   equipped.painted.push(outfit);
 }
 same(equipped.painted.sort(),['lounge','office','track']);run("S.p[1].outfit='ankara';");
 pass('Every hair id equips rigid Head-space meshes, every outfit equips bound wear_ meshes and hides its slots; office, track and lounge build as painted slots',equipped);

 // 5. Legacy look migration.
 assert.equal(run('typeof migrateLook34'),'function');assert.equal(run('typeof migrateLooks34'),'function');
 const expect={outfits:{starter:'tee',tankset:'tee',basics:'tee',everydayefe:'tee',everydaytunde:'ankara',office:'office',track:'track',lounge:'lounge',tee:'tee',ankara:'ankara',kaftan:'kaftan'},hair:{none:'low',curls:'twists',braidbun:'braids',braidsup:'braids',low:'low',afro:'afro',braids:'braids',locs:'locs',twists:'twists',wig:'wig',wrap:'wrap'}};
 for(const [from,to] of Object.entries(expect.outfits)){context.rec={outfit:from,hair:'locs'};assert.equal(run('migrateLook34(rec)'),from!==to);assert.equal(context.rec.outfit,to,from);}
 for(const [from,to] of Object.entries(expect.hair)){context.rec={outfit:'tee',hair:from};assert.equal(run('migrateLook34(rec)'),from!==to);assert.equal(context.rec.hair,to,from);}
 const validHair=Object.keys(run('WARDROBE.hair')),validOutfit=run('OUTFITS.map(o=>o.id)');
 const legacy=[['none','starter'],['curls','tankset'],['braidbun','basics'],['braidsup','everydayefe'],['none','everydaytunde']];
 let migrated=0;
 for(const [hair,outfit] of legacy){
   context.legacy={hair,outfit};
   run("S.p[0].hair=legacy.hair;S.p[0].outfit=legacy.outfit;S.p[1].hair=legacy.hair;S.p[1].outfit=legacy.outfit;save();S.p[0].hair='locs';S.p[0].outfit='tee';S.p[1].hair='braids';S.p[1].outfit='ankara';ACTIONS.continue();");
   for(const i of [0,1]){const p=run('S.p['+i+']');assert(validHair.includes(p.hair),p.hair);assert(validOutfit.includes(p.outfit),p.outfit);
     assert.equal(p.hair,expect.hair[hair]);assert.equal(p.outfit,expect.outfits[outfit]);
     const look=run('lookFor('+i+')');assert.equal(look.hair,expect.hair[hair]);assert.equal(look.outfit,expect.outfits[outfit]);
     const g=run('makeHeroAvatar(lookFor('+i+'))');let wear=0,hairMeshes=0;g.traverse(o=>{if(o.isMesh&&/^wear_/.test(o.name))wear++;if(o.isMesh&&/^wearhair_/.test(o.name))hairMeshes++;});assert(wear>0&&hairMeshes>0);migrated++;}
 }
 run("S.p[1].strength=S.p[1].strength||'foodie';ACTIONS.setchar({i:1,p:Object.assign({},S.p[1],{hair:'curls',outfit:'tankset'})});");
 assert.equal(run('S.p[1].hair'),'twists');assert.equal(run('S.p[1].outfit'),'tee');
 // Co-op: a household document from a v30-v33 host arrives through applyState (join, resume, snapshot).
 run("NET.myIndex=0;applyState(Object.assign(JSON.parse(JSON.stringify(S)),{p:[Object.assign({},S.p[0],{hair:'braidsup',outfit:'everydaytunde'}),Object.assign({},S.p[1],{hair:'none',outfit:'basics'})],rev:(S.rev||0)+1}));");
 same([run('S.p[0].hair'),run('S.p[0].outfit'),run('S.p[1].hair'),run('S.p[1].outfit')],['braids','ankara','low','tee']);
 for(const i of [0,1]){const p=run('S.p['+i+']');assert(validHair.includes(p.hair)&&validOutfit.includes(p.outfit));assert(run('WARDROBE.outfits')[p.outfit]);}
 assert(/<svg/.test(run('photoSVG()')),'photoSVG after applyState');
 run("S=newState();S.phase='play';S.p[0].name='Chika';S.p[1].name='Obi';");
 for(const i of [0,1]){const p=run('S.p['+i+']');assert(validHair.includes(p.hair)&&validOutfit.includes(p.outfit));assert(run('WARDROBE.outfits')[p.outfit],'default outfit without garments');}
 pass('Legacy outfit and hair ids migrate to v21 ids on load, over the network (setchar and applyState) and in defaults; migrated saves build full wardrobes',{saves:legacy.length,avatars:migrated,applyState:['braidsup/everydaytunde','none/basics']});

 // 6. Neighbours, walkers and sellers.
 run("players=S.p.map((p,i)=>({i,g:makeHeroAvatar(lookFor(i)),y:0,t:0}));players.forEach(p=>{scene.add(p.g);p.g.position.set(-6,0,4);});buildAmbient();buildVendors();ensureMarket();spawnNPCs();envRefreshPeople();");
 const cast=run('npcs');same(Object.keys(cast).sort(),Object.keys(CAST_SCALE).sort());
 for(const [k,n] of Object.entries(cast)){assert.equal(n.g.rig,'hero',k);assert.equal(n.g.userData.environmentPerson,k);assert.equal(n.g.hero.body.skeleton.bones.length,27);close(n.g.scale.y,CAST_SCALE[k],1e-6);finiteAvatar(n.g);
   let wear=0;n.g.traverse(o=>{if(o.isMesh&&/^wear/.test(o.name))wear++;});assert(wear>0,k+' has no wardrobe meshes');}
 const walkers=run('walkers'),vendors=run('vendors');assert(walkers.length>0&&vendors.length>0);
 for(const w of walkers){assert.equal(w.g.rig,'hero');assert(AMBIENT_SCALES.some(s=>Math.abs(s-w.g.scale.y)<1e-6));finiteAvatar(w.g);}
 for(const v of vendors){assert.equal(v.g.rig,'hero');assert(AMBIENT_SCALES.some(s=>Math.abs(s-v.g.scale.y)<1e-6));finiteAvatar(v.g);}
 pass('spawnNPCs builds the five named neighbours plus walkers and sellers on the hero rig with environment-v23 statures',{neighbours:Object.keys(cast).length,walkers:walkers.length,sellers:vendors.length});

 // 7. The kept environment work.
 for(const id of run('PROPS.order')){
   context.prop=await parse('assets/props/'+id+'.gltf.json');context.propId=id;
   run("{let ex;prop.scene.traverse(o=>{if(!ex&&o.userData.prop)ex=o.userData;});prop.extras=ex||{prop:propId,size:[1,1,1]};prop.scene=propMerge(prop.scene,propId);PROPS.cache[propId]=prop;}");
 }
 run("buildWorld();envInit();");
 assert(run('ENV23.surfaces.length')>0);assert(run("scene.getObjectByName('entry31')&&scene.getObjectByName('palm31')"));
 const stair=run("scene.getObjectByName('stair32')");assert(stair);let stairMeshes=0;stair.traverse(o=>{if(o.isMesh){stairMeshes++;finite(o.geometry.attributes.position.array);}});assert.equal(stairMeshes,4);assert(run("OBS.filter(o=>o.tag==='stair').length===2"));
 const heights=run('[9.45,8.8,8.1,7.4,6.7,6.12].map(z=>levelAt(6.7,z))');assert(heights.every((y,i)=>i===0||y>=heights[i-1]));assert(heights.at(-1)>3.3);
 const styles=run('ENV_PRESETS.map(p=>p.id)');assert.equal(styles.length,8);
 for(const id of styles){context.presetId=id;assert(run('envSetPreset(presetId,{persist:false,force:true})'));run('scene').traverse(o=>{if(o.isMesh&&o.visible){finite(o.geometry.attributes.position.array);if(o.geometry.attributes.normal)finite(o.geometry.attributes.normal.array);}});}
 const tex=run('[...ENV31.textures.values()]');assert(tex.length>0);
 for(const t of tex){const file=t.userData.art31File;assert(fs.existsSync(path.join(harness.root,file)),file);assert([THREE.sRGBEncoding,THREE.LinearEncoding].includes(t.encoding));}
 const studio=new THREE.Scene();context.studio=studio;run('studio31(studio)');const count=studio.children.length;run('studio31(studio)');assert.equal(studio.children.length,count);assert(studio.getObjectByName('studio32_plinth'));assert(studio.fog);assert.equal(studio.children.filter(o=>o.isLight).length,4);
 assert(run('cams.length>0&&cams.every(c=>c.fov===34)'));
 pass('World keeps the surface registry, four-batch staircase, eight courtyard presets, on-disk material textures, idempotent studio stage and the 34-degree lens',{surfaces:run('ENV23.surfaces.length'),stairMeshes,routeHeights:heights,presets:styles.length,textures:tex.length,studioChildren:count});

 // 8. Sofa seating on the v21 rig.
 run("S.home.items=[{id:'review-sofa',type:'sofa',x:2,y:1}];rebuildFurniture();");
 const seated=[];
 for(const rotation of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
   context.testRotation=rotation;
   run("sitStop();players.forEach(p=>scene.remove(p.g));players=S.p.map((p,i)=>({i,g:makeHeroAvatar(lookFor(i)),y:0,t:0}));players.forEach((p,i)=>{p.g.position.set(2+i,0,7);p.g.baseY=0;scene.add(p.g);});seatingFurniture().rotation.y=testRotation;sitStart();for(let k=0;k<45;k++)players.forEach(p=>animAvatar(p.g,k/60,false,false,0,1/60));");
   assert(run('SEATING30.active&&players.every(p=>p.g.sitting)'));
   for(const i of [0,1]){
     const m=run(`(()=>{const g=players[${i}].g;g.updateMatrixWorld(true);const seat=g.userData.seat,b=g.hero.bones,W=o=>o.getWorldPosition(new THREE.Vector3());const cushion=seatPoint(seat,seat.x,seat.height,seat.depth);
       return {scale:g.scale.y,hips:W(b.hips).y-cushion.y,feet:[W(b.leftfoot).y-seat.floorY,W(b.rightfoot).y-seat.floorY],hands:[W(b.lefthand).y-cushion.y,W(b.righthand).y-cushion.y],knees:[W(b.leftleg).y-seat.floorY,W(b.rightleg).y-seat.floorY]};})()`);
     close(m.hips,SEAT_HIP*m.scale);for(const f of m.feet)close(f,SEAT_FOOT*m.scale);for(const h of m.hands)assert(h>.12);for(const k of m.knees)assert(k>SEAT_FOOT*m.scale&&k<.7);
     // Independent of the constants: the skinned sole meshes rest on the floor, and the trousers' thigh band (rest y >= .60, the part that
     // should follow the thighs) sinks no deeper below the cushion top than the documented v21 weighting limit.
     const mesh=run(`(()=>{const g=players[${i}].g;g.updateMatrixWorld(true);const seat=g.userData.seat;const cushion=seatPoint(seat,seat.x,seat.height,seat.depth);const soles=[],sink=[];const v=new THREE.Vector3();
       g.traverse(o=>{if(!o.isMesh||!o.visible)return;const mn=(o.material&&o.material.name)||'';const sole=/^sole/.test(mn),bottom=/^wear_.*(trousers|jeans)/.test(o.name)||(!/^wear_/.test(o.name)&&mn==='bottom');if(!sole&&!bottom)return;
         const P=o.geometry.attributes.position;let min=1e9,deep=-1e9;for(let k=0;k<P.count;k++){const rest=P.getY(k);v.fromBufferAttribute(P,k);if(o.isSkinnedMesh)o.boneTransform(k,v);v.applyMatrix4(o.matrixWorld);if(v.y<min)min=v.y;if(bottom&&rest>=.60&&cushion.y-v.y>deep)deep=cushion.y-v.y;}
         if(sole)soles.push({name:o.name,aboveFloor:min-seat.floorY});else sink.push({name:o.name,belowCushion:deep});});return {soles,sink};})()`);
     assert(mesh.soles.length>0,'no sole mesh');for(const s of mesh.soles)assert(Math.abs(s.aboveFloor)<=SOLE_TOL*m.scale,s.name+' sole '+s.aboveFloor.toFixed(3)+' from the floor');
     assert(mesh.sink.length>0,'no trouser or bottom mesh');for(const s of mesh.sink)assert(s.belowCushion<=SEAT_SINK_LIMIT*m.scale,s.name+' thigh band '+s.belowCushion.toFixed(3)+' below the cushion');
     seated.push({rotation:+rotation.toFixed(2),player:i,hips:+m.hips.toFixed(3),feet:m.feet.map(v=>+v.toFixed(3)),soleAboveFloor:mesh.soles.map(s=>+s.aboveFloor.toFixed(3)),thighBandBelowCushion:mesh.sink.map(s=>+s.belowCushion.toFixed(3))});
   }
 }
 const standing=run('JSON.stringify(players.map((p,i)=>SEATING30["p"+i].position.toArray()))');run('save()');assert.equal(run('JSON.stringify(load().p.map(p=>[p.pos[0],0,p.pos[1]]))'),standing);
 run('sitStop()');assert(run('players.every(p=>!p.g.sitting)'));assert.equal(run('JSON.stringify(players.map(p=>p.g.position.toArray()))'),standing);
 pass('Seated avatars rest hips and feet at the retuned v21 heights in all four sofa orientations with soles on the floor and the trouser sink within the documented limit, and saves keep standing positions',{hipAboveCushion:SEAT_HIP,footAboveFloor:SEAT_FOOT,soleTolerance:SOLE_TOL,thighBandSinkLimit:SEAT_SINK_LIMIT,cases:seated.length,maxThighBandSink:+Math.max(...seated.flatMap(c=>c.thighBandBelowCushion)).toFixed(3),seated});

 // 9. Build stamp in the Menu.
 build=run('BUILD_ID');const stampPrefix=fs.readFileSync(path.join(__dirname,'..','tools','stamp-build.py'),'utf8').match(/build='([^']+)'/)[1];assert(new RegExp('^'+stampPrefix+'[0-9a-f]{8}$').test(build),build+' does not carry the stamp prefix '+stampPrefix); // the prefix comes from tools/stamp-build.py, so this check follows the authored line's stamp instead of hard-coding it
 run('openMenu()');assert(run('panel.innerHTML').includes('Build '+build));
 pass('Menu shows the build id and the id carries the authored-character prefix',{build});

 const report={build,passed:true,checks,method:'Actual runtime geometry and state in Node with the shipped Three.js and glTF loader. No browser, GPU or phone test; colour and framing need a browser pass.'};
 fs.writeFileSync(path.join(__dirname,'results-authored.json'),JSON.stringify(report,null,2)+'\n');
})().catch(e=>{console.error(e);
 // A failing run must not leave a stale passed:true file behind (the manifest hashes it).
 if(build===null){try{build=harness.run('BUILD_ID');}catch(_){build=null;}}
 fs.writeFileSync(path.join(__dirname,'results-authored.json'),JSON.stringify({build,passed:false,checks,failure:String(e&&e.stack||e)},null,2)+'\n');
 process.exitCode=1;});

const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const harness=require('./runtime-harness.cjs');
const result={build:null,method:'Actual game JavaScript and glTF loader in Node; no WebGL, browser or phone measurement.',checks:[],limits:['No GPU/browser visual pass','No real-device FPS measurement','Older transferred wardrobe remains provisional','Cross-device networking requires the original host room API; unavailable on the static Site']};
function pass(name,details){result.checks.push({name,passed:true,details});console.log('PASS',name);}
function close(a,b,eps=1e-5){assert(Math.abs(a-b)<=eps,`${a} differs from ${b}`);}
function finite(a){for(const n of a)assert(Number.isFinite(n));}
(async()=>{
 const {run,context,THREE,parse}=await harness.load();
 result.build=run('BUILD_ID');
 assert.equal(run('HERO.gltf.scene.getObjectByName("Hips")?.isBone'),true);
 assert.equal(run('HERO.gltf.animations.length'),9);
 assert.equal(run('HERO.gltf.scene.getObjectByName("Body_1").skeleton.bones.length'),27);
 pass('Hero rig and nine animation clips load');
 const wardrobe=run('Object.keys(WARDROBE.cache)');assert.equal(wardrobe.length,35);assert.equal(run('Object.keys(WARDROBE.failed).length'),0);
 let meshes=0;
 for(const id of wardrobe){const asset=run(`WARDROBE.cache[${JSON.stringify(id)}]`);asset.scene.traverse(o=>{if(!o.isMesh)return;meshes++;const a=o.geometry.attributes;finite(a.position.array);if(a.normal)finite(a.normal.array);for(const index of o.geometry.index?.array||[])assert(index<a.position.count);if(a.skinWeight)for(let i=0;i<a.skinWeight.count;i++){let sum=0;for(let k=0;k<4;k++)sum+=a.skinWeight.array[i*4+k];close(sum,1,1e-5);}});}
 pass('All 35 required wardrobe assets load with valid geometry and normalized weights',{meshes});
 const propFiles=fs.readdirSync(path.join(harness.root,'assets/props')).filter(f=>f.endsWith('.gltf.json'));
 for(const f of propFiles){const prop=await parse('assets/props/'+f);let n=0;prop.scene.traverse(o=>{if(o.isMesh){n++;finite(o.geometry.attributes.position.array);}});assert(n>0);}
 pass('All 33 prop assets parse',{count:propFiles.length});assert.equal(propFiles.length,33);
 for(const [input,expected] of [[0x808080,128],['#808080',128],['#888',136],['rgb(128,128,128)',128],['gray',128],['white',255],['black',0]]){
  const c=new THREE.Color(input).convertLinearToSRGB();close(Math.round(c.r*255),expected,0);
 }
 pass('Numeric hex, CSS hex, RGB and named colours convert exactly once');
 const state=run('newState()');for(const p of state.p){assert.equal(p.name,'');assert.equal(p.hair,'none');assert.equal(p.outfit,'starter');}assert.deepEqual(Array.from(run('BODY_BASES.map(b=>b.name)')),['Base A','Base B']);
 pass('New game starts with unnamed, independently customizable bases');
 let combinations=0,poseSamples=0,maxBindingError=0,maxCageOffset=0,cageVertices=0;
 for(const base of ['base_a','base_b'])for(const build of ['slim','balanced','fuller'])for(const face of ['oval','soft','angular']){
  context.testLook={...run('lookFor(0)'),bodyBase:base,bodyBuild:build,face,hair:'none',outfit:'starter',acc:[],beard:'none'};
  const g=run('makeHeroAvatar(testLook)');combinations++;
  assert(g.userData.maskedBodyTriangles>7000);const body=g.hero.body,P=body.geometry.attributes.position;
  const parts=body.parent.children.filter(o=>o.isSkinnedMesh&&o.userData.targetNames);assert.equal(parts.length,10);
  for(const part of parts){assert.equal(part.geometry.attributes.position,P);finite(part.geometry.attributes.normal.array);}
  // Every bound garment vertex follows its stored barycentric combination of the body.
  for(const cloth of body.parent.children.filter(o=>o.geometry?.attributes._body_ids)){
   const a=cloth.geometry.attributes;finite(a.position.array);
   const assetId=cloth.userData.wardrobe,asset=run(`WARDROBE.cache[${JSON.stringify(assetId)}]`);let source;
   asset.scene.traverse(o=>{if(o.isMesh&&cloth.name==='wear_'+assetId+'_'+o.name)source=o;});assert(source);
   const neutral=run('HERO.gltf.scene.getObjectByName("Body_1").geometry.attributes.position');
   if(a._cage32){
     for(let i=0;i<a.position.array.length;i++){const delta=Math.abs(a.position.array[i]-source.geometry.attributes.position.array[i]);assert(delta<.055);maxCageOffset=Math.max(maxCageOffset,delta);}cageVertices+=a.position.count;continue;
   }
   for(let i=0;i<a.position.count;i++)for(let axis=0;axis<3;axis++){
    let expected=source.geometry.attributes.position.array[i*3+axis];
    if(source.geometry.attributes._fit_rest)expected-=source.geometry.attributes._fit_rest.array[i*3+axis];
    for(let k=0;k<3;k++){const j=a._body_ids.array[i*3+k],w=a._body_weights.array[i*3+k];expected+=(P.array[j*3+axis]-neutral.array[j*3+axis])*w;}
    const error=Math.abs(a.position.array[i*3+axis]-expected);maxBindingError=Math.max(maxBindingError,error);assert(error<4e-7);
   }
  }
  for(const [clip,action] of Object.entries(g.actions)){
   Object.values(g.actions).forEach(a=>a.stop());action.reset().setEffectiveWeight(1).play();
   for(const f of [.01,.27,.51,.76,.99]){g.mixer.setTime(action.getClip().duration*f);g.updateMatrixWorld(true);body.skeleton.update();for(const bone of body.skeleton.bones)finite(bone.matrixWorld.elements);poseSamples++;}
  }
 }
 pass('All 18 base/build/face combinations keep finite fitted starter shapes and valid legacy bindings',{combinations,maxBindingErrorMetres:maxBindingError,cageVertices,maxCageOffsetMetres:maxCageOffset});
 pass('All nine clips remain finite across the complete shape matrix',{poseSamples});
 context.sofaAsset=await parse('assets/props/sofa_teal.gltf.json');
 run("PROPS.cache.sofa_teal={scene:sofaAsset.scene,extras:{size:[1.62,.84,.8]}};S=newState();S.phase='play';S.home.items=[{id:'review-sofa',type:'sofa',x:2,y:1}];rebuildFurniture();");
 let seatingCases=0,maxFootError=0,minHandClearance=Infinity;
 for(const build of ['slim','balanced','fuller'])for(const rotation of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
  context.testBuild=build;context.testRotation=rotation;
  run("sitStop();S.p.forEach(p=>{p.bodyBuild=testBuild;});players.forEach(p=>scene.remove(p.g));players=S.p.map((p,i)=>({i,g:makeHeroAvatar(lookFor(i)),y:0,t:0}));players.forEach((p,i)=>{p.g.position.set(2+i,0,7);p.g.baseY=0;scene.add(p.g);});seatingFurniture().rotation.y=testRotation;sitStart();for(let k=0;k<45;k++)players.forEach(p=>animAvatar(p.g,k/60,false,false,0,1/60));");
  const players=run('players');for(const p of players){const g=p.g;g.updateMatrixWorld(true);const seat=g.userData.seat,centre=run(`seatPoint(players[${p.i}].g.userData.seat,players[${p.i}].g.userData.seat.x,players[${p.i}].g.userData.seat.height,players[${p.i}].g.userData.seat.depth)`);
   for(const side of ['left','right']){const foot=g.hero.bones[side+'foot'].getWorldPosition(new THREE.Vector3());const error=Math.abs(foot.y-seat.floorY-.085*g.scale.y);maxFootError=Math.max(maxFootError,error);assert(error<.001);const hand=g.hero.bones[side+'hand'].getWorldPosition(new THREE.Vector3());minHandClearance=Math.min(minHandClearance,hand.y-centre.y);assert(hand.y>centre.y+.12);}
   close(g.hero.bones.hips.getWorldPosition(new THREE.Vector3()).y,centre.y+.105*g.scale.y,.001);seatingCases++;
  }
 }
 pass('Both bases sit at cushion height with grounded ankle targets in all four orientations',{seatingCases,maxFootErrorMetres:maxFootError,minWristAboveCushionMetres:minHandClearance});
 const before=run('players.map((p,i)=>SEATING30["p"+i].position.toArray())');
 run("S.p[0].name='Chika';S.p[1].name='Obi';S.p[0].face='soft';S.p[1].hair='curls';save();");
 const saved=run('load()');assert.equal(saved.p[0].name,'Chika');assert.equal(saved.p[1].hair,'curls');assert.equal(saved.p[0].face,'soft');
 saved.p.forEach((p,i)=>{close(p.pos[0],before[i][0]);close(p.pos[1],before[i][2]);});
 run('sitStop();');run('players').forEach((p,i)=>{assert(!p.g.sitting);close(p.g.position.x,before[i][0]);close(p.g.position.z,before[i][2]);});
 pass('Saving during a seated interaction preserves standing positions and customization');
 run('NET.on=true;NET.myIndex=0;sitStart();');assert(run('players[0].g.sitting'));assert(!run('players[1].g.sitting'));run('sitStop();NET.on=false;');
 pass('Seating leaves a remote co-op player under their own control');
 const hairCounts={};for(const id of ['hair_lowtaper','hair_curls','hair_braidbun']){let count=0;run(`WARDROBE.cache.${id}`).scene.traverse(o=>{if(o.isMesh)count+=o.geometry.index.count/3;});hairCounts[id]=count;assert(count<10000);}
 pass('Three rebuilt starter hairstyles stay below 10,000 triangles each',hairCounts);
 for(const [side,expected] of [[0,'R'],[1,'L']]){const g=run('makeHeroAvatar(lookFor(0))');for(const p of g.presence.eyes29[side].parts)assert(p.o.name.endsWith('_'+expected));assert(g.hero.bones.head.getObjectByName('mouth_surface'));}
 pass('Iris parts resolve to the correct eye and the mouth follows the morphed face');
 assert(run("LOCAL_ONLY.has('creator30tab')&&LOCAL_ONLY.has('creator30view')"));
 run("ACTIONS.creator30view({v:'back'})");close(run('CREATOR30.yaw'),Math.PI);run("ACTIONS.creator30view({v:'walk'})");assert.equal(run('CREATOR30.pose'),'walk');
 pass('Creator view actions and categories are registered');
 result.passed=true;
 fs.writeFileSync(path.join(__dirname,'results-v30.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({passed:result.checks.length,poseSamples,combinations,seatingCases}));
})().catch(e=>{result.passed=false;result.error=e.stack;fs.writeFileSync(path.join(__dirname,'results-v30.json'),JSON.stringify(result,null,2));console.error(e.stack);process.exitCode=1});

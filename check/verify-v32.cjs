// New visual construction checks using actual runtime meshes; no browser/GPU claim.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process');
const baseline=cp.spawnSync(process.execPath,[path.join(__dirname,'verify-v30.cjs')],{stdio:'inherit'});if(baseline.status!==0)process.exit(baseline.status||1);
const harness=require('./runtime-harness.cjs'),report={build:null,method:'Node + shipped Three.js/glTF; geometry and state only',checks:[],limits:['Browser/WebGL visual QA unavailable','No phone FPS measurement','Facial speech/finger rig not added','Older unrebuilt wardrobe remains provisional']};
function pass(name,details){report.checks.push({name,passed:true,details});console.log('PASS',name);}
function finite(a){for(const n of a)assert(Number.isFinite(n));}
(async()=>{
 const {run,context,THREE,parse}=await harness.load();report.build=run('BUILD_ID');
 const base=JSON.parse(fs.readFileSync(path.join(__dirname,'results-v30.json')));assert(base.passed);assert.equal(base.build,report.build);
 pass('Prior rig, customization, animation, seating and save checks pass',{checks:base.checks.length});
 let heads=0,eyeVertices=0;
 for(const bodyBase of ['base_a','base_b'])for(const face of ['oval','soft','angular'])for(const skin of run('SKINS')){
   context.look={...run('lookFor(0)'),bodyBase,face,skin,hair:'none',outfit:'starter',acc:[],beard:'none'};
   const g=run('makeHeroAvatar(look)'),head=g.hero.bones.head.getObjectByName('head31_surface');assert(head?.visible);finite(head.geometry.attributes.position.array);finite(head.geometry.attributes.normal.array);
   for(const o of g.hero.body.parent.children.filter(o=>o.userData.targetNames))for(const i of o.geometry.index.array)assert(o.geometry.attributes.position.getY(i)<=1.50201);
   for(const o of g.hero.body.parent.children.filter(o=>o.userData.targetNames))if((g.userData.coverage[o.userData.region]||0)>=.94)assert(!o.visible);
   const expected=new THREE.Color(skin);for(const k of ['r','g','b'])assert(Math.abs(head.material.color[k]-expected[k])<1e-9);for(const name of ['skin_torso32','skin_armL32','skin_armR32'])for(const k of ['r','g','b'])assert(Math.abs(g.getObjectByName(name).material.color[k]-expected[k])<1e-9);
   heads++;
   const spec=g.userData.art31.spec;context.spec=spec;
   for(const side of [-1,1]){
     const e=head.parent.getObjectByName('eye31_'+side),white=e.getObjectByName('eye31_white'),P=white.geometry.attributes.position;
     for(let i=0;i<P.count;i++){
       const y=P.getY(i)+e.position.y+1.57,x=P.getX(i)+e.position.x;
       context.eyeY=y;const width=run('head31Width(eyeY,spec)'),u=x/width,t=(u-side*.415)/.245;
       assert(Math.abs(t)<1.001);const arc=Math.max(0,1-t*t)**.68,mid=1.679+side*t*.006*.315;
       assert(y>=mid-.023*.315*arc-.00005&&y<=mid+.034*.315*arc+.00005);eyeVertices++;
     }
   }
   context.actor=g;run('for(const lid of actor.userData.art31.lids)head31LidUpdate(lid,1)');
   for(let side=0;side<2;side++){
     const upper=g.userData.art31.lids[side*2],lower=g.userData.art31.lids[side*2+1],cols=upper.cols;
     for(let i=1;i<cols;i++){const up=upper.mesh.geometry.attributes.position.getY(cols*2+2+i),down=lower.mesh.geometry.attributes.position.getY(cols*2+2+i);assert(up<=down+.00001);}
   }
 }
 pass('Both bases and every face preserve skin colour and bounded eye openings',{heads,eyeVertices});
 pass('Closed eyelids overlap across both eye openings');
 // Garment split patches must not reintroduce pieces of the retired neck.
 const hero=JSON.parse(fs.readFileSync(path.join(harness.root,'assets/characters/efe.gltf.json')));
 const neutral=run('HERO.gltf.scene.getObjectByName("Body_1").geometry.attributes.position');let patches=0;
 for(const name of ['tank','tee','office_shirt','track_top','lounge_top']){
   const asset=run(`WARDROBE.cache[${JSON.stringify(name)}]`);context.asset=asset;const ex=run('wardrobeExtras(asset)');
   assert.equal(ex.visualRevision,32);for(const [ids,weights] of ex.revealSkin.vertices){let y=0,sum=0;for(let k=0;k<3;k++){y+=neutral.getY(ids[k])*weights[k];sum+=weights[k];}assert(Math.abs(sum-1)<1e-6);assert(y<=1.485001);patches++;}
 }
 pass('Garment openings use normalized skin bindings below the new neck',{patchVertices:patches});
 let unionSamples=0;
 for(const outfit of ['starter','tankset','basics','office'])for(const bodyBase of ['base_a','base_b']){
   context.look={...run('lookFor(0)'),outfit,bodyBase,hair:'none',acc:[],beard:'none'};const g=run('makeHeroAvatar(look)'),patch=g.getObjectByName('skin_openings32');assert(patch);
   const fields=g.hero.wardrobe.garments.map(id=>{context.id=id;return run('wardrobeExtras(WARDROBE.cache[id]).coverage32')}).filter(Boolean);
   for(const {ids,bary}of patch.userData.coverage32){for(const field of fields){let value=0;for(let k=0;k<3;k++)value+=field[ids[k]]*bary[k];assert(value<1e-7,'Another garment covers restored skin');}unionSamples++;}
 }
 pass('Restored skin stays outside every piece in all four matched outfits on both bases',{vertices:unionSamples});

 // Every rendered top is one connected surface; there are no overlapping cap
 // components. The four physical openings remain simple manifold boundary loops.
 const topology=[];
 for(const id of ['tank','tee','office_shirt','track_top','lounge_top']){
   const asset=run(`WARDROBE.cache[${JSON.stringify(id)}]`);asset.scene.traverse(o=>{if(!o.isMesh)return;const I=o.geometry.index.array,edges=new Map(),adj=new Map();
     const link=(a,b)=>{if(!adj.has(a))adj.set(a,new Set());adj.get(a).add(b);};
     for(let k=0;k<I.length;k+=3)for(let j=0;j<3;j++){const a=I[k+j],b=I[k+(j+1)%3],key=Math.min(a,b)+','+Math.max(a,b);edges.set(key,(edges.get(key)||0)+1);link(a,b);link(b,a);}
     assert([...edges.values()].every(n=>n<=2));let seen=new Set(),components=0;
     for(const v of adj.keys())if(!seen.has(v)){components++;const todo=[v];while(todo.length){const u=todo.pop();if(seen.has(u))continue;seen.add(u);todo.push(...adj.get(u));}}
     assert.equal(components,1,id+' disconnected cloth');const boundary=new Map();
     for(const [key,n]of edges)if(n===1){const [a,b]=key.split(',').map(Number);if(!boundary.has(a))boundary.set(a,new Set());if(!boundary.has(b))boundary.set(b,new Set());boundary.get(a).add(b);boundary.get(b).add(a);}
     assert([...boundary.values()].every(a=>a.size===2));seen=new Set();let openings=0;
     for(const v of boundary.keys())if(!seen.has(v)){openings++;const todo=[v];while(todo.length){const u=todo.pop();if(seen.has(u))continue;seen.add(u);todo.push(...boundary.get(u));}}
     assert.equal(openings,4,id+' expected neck, waist and two arm/cuff openings');topology.push({id,triangles:I.length/3,components,openings});
   });
 }
 pass('Five sewn tops have connected manifold seams and four clean physical openings',topology);
 // The head, eyes, hair and accessories inherit the same silhouette transform.
 for(const bodyBase of ['base_a','base_b'])for(const hair of ['none','low','curls','braidbun']){
   context.look={...run('lookFor(0)'),bodyBase,hair,outfit:'starter',acc:['hoops'],beard:'full'};const g=run('makeHeroAvatar(look)'),assembly=g.hero.bones.head.getObjectByName('silhouette32');assert(assembly);assert.equal(assembly.scale.x,1.24);assert.equal(assembly.getObjectByName('head31_surface').parent.name,'authored_head31');
   const eye=assembly.getObjectByName('eye31_white');assert(eye);const scale=eye.getWorldScale(new THREE.Vector3());assert(Math.abs(scale.x-g.scale.x*1.24)<1e-5);
   context.actor=g;run('presenceUpdate(actor,.016,false)');assert(g.userData.art31.retired.every(o=>!o.visible));
 }
 pass('Both bases keep the larger head, fitted hair, eyes, facial hair and hoops in one coordinate frame');
 let contourSamples=0;
 for(const bodyBase of ['base_a','base_b'])for(const bodyBuild of ['slim','balanced','fuller']){
   context.look={...run('lookFor(0)'),bodyBase,bodyBuild,outfit:'starter',acc:[],hair:'none',beard:'none'};const g=run('makeHeroAvatar(look)');
   for(const name of ['skin_torso32','skin_armL32','skin_armR32']){const mesh=g.getObjectByName(name);assert(mesh);const a=mesh.geometry.attributes;finite(a.position.array);finite(a.normal.array);for(let i=0;i<a.skinWeight.count;i++){let sum=0;for(let k=0;k<4;k++)sum+=a.skinWeight.array[i*4+k];assert(Math.abs(sum-1)<1e-6);}}
   for(const name of ['skin_armL32','skin_armR32']){const P=g.getObjectByName(name).geometry.attributes.position;for(let i=0;i<P.count;i++){assert(Math.abs(P.getX(i))>.16);if(P.getY(i)<1.10)assert(Math.abs(P.getX(i))>.21);assert(P.getY(i)>=.905&&P.getY(i)<=1.30);contourSamples++;}}
   for(const mesh of g.hero.body.parent.children.filter(o=>o.userData.targetNames))if(['torso','armL','armR'].includes(mesh.userData.region))assert(!mesh.visible);
 }
 pass('Six body/build combinations use separate smooth torso and arm contours without waist-to-forearm bridges',{armVertices:contourSamples});

 for(const baseY of [0,3.4]){
   context.baseY=baseY;run('actor=makeHeroAvatar(lookFor(0));actor.baseY=baseY;actor.position.y=baseY;animAvatar(actor,.6,true,false,1,.016);actor.updateMatrixWorld(true);');
   const actor=run('actor'),shadow=actor.userData.contact32,p=shadow.getWorldPosition(new THREE.Vector3());assert(Math.abs(p.y-baseY-.035)<1e-5);assert(!shadow.material.depthWrite);assert.equal(shadow.material.transparent,true);
 }
 pass('Contact shadow stays on the ground and roof while the actor animates');
 const studio=new THREE.Scene();context.studio=studio;run('studio31(studio)');const count=studio.children.length;run('studio31(studio)');assert.equal(studio.children.length,count);assert(studio.getObjectByName('studio32_plinth'));assert(studio.fog);assert.equal(studio.children.filter(o=>o.isLight).length,4);
 assert(run('cams.every(c=>c.fov===34)'));
 pass('Creator and thumbnails share an idempotent lit stage; gameplay uses the narrower lens');
 for(const id of ['office_shirt','track_top','lounge_top']){const asset=run(`WARDROBE.cache.${id}`);asset.scene.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes;for(let i=0;i<a.position.count;i++)if(a.position.getY(i)<1.03&&Math.abs(a.position.getX(i))>.22){let fore=0;for(let k=0;k<4;k++)if([9,14].includes(a.skinIndex.array[i*4+k]))fore+=a.skinWeight.array[i*4+k];assert(fore>.95);}});}
 pass('Long-sleeve cuffs follow the forearms rather than the torso');
 for(const id of run('PROPS.order')){
   context.prop=await parse('assets/props/'+id+'.gltf.json');context.propId=id;
   run("{let ex;prop.scene.traverse(o=>{if(!ex&&o.userData.prop)ex=o.userData;});prop.extras=ex||{prop:propId,size:[1,1,1]};prop.scene=propMerge(prop.scene,propId);PROPS.cache[propId]=prop;}");
 }
 run("S=newState();S.phase='play';buildWorld();envInit();");
 assert(run("scene.getObjectByName('entry31')&&scene.getObjectByName('palm31')"));
 const stair=run("scene.getObjectByName('stair32')");assert(stair);let stairMeshes=0;stair.traverse(o=>{if(o.isMesh){stairMeshes++;finite(o.geometry.attributes.position.array);}});assert.equal(stairMeshes,4);assert(run("OBS.filter(o=>o.tag==='stair').length===2"));
 const heights=run('[9.45,8.8,8.1,7.4,6.7,6.12].map(z=>levelAt(6.7,z))');assert(heights.every((y,i)=>i===0||y>=heights[i-1]));assert(heights.at(-1)>3.3);
 pass('Joined staircase has four material batches and preserves the ascending route',{meshes:stairMeshes,routeHeights:heights});
 assert(run("skyDome.material.fragmentShader.includes('#include <encodings_fragment>')&&waterMesh.material.fragmentShader.includes('#include <tonemapping_fragment>')"));
 const styles=run('ENV_PRESETS.map(p=>p.id)');for(const id of styles){context.presetId=id;assert(run('envSetPreset(presetId,{persist:false,force:true})'));run('scene').traverse(o=>{if(o.isMesh&&o.visible){finite(o.geometry.attributes.position.array);if(o.geometry.attributes.normal)finite(o.geometry.attributes.normal.array);}});}
 pass('All eight courtyard presets build with finite geometry, curved palms and entry details',{styles:styles.length});
 const tex=run('[...ENV31.textures.values()]');for(const t of tex){const file=t.userData.art31File;assert(fs.existsSync(path.join(harness.root,file)));assert([THREE.sRGBEncoding,THREE.LinearEncoding].includes(t.encoding));}
 pass('Every referenced material texture exists and declares its colour/data encoding',{maps:tex.length});
 run('spawnNPCs()');const cast=run('Object.values(npcs)');assert.equal(cast.length,5);const specs=new Set();for(const npc of cast){assert(npc.g.hero.bones.head.getObjectByName('head31_surface'));specs.add(JSON.stringify(npc.g.userData.art31.spec));}assert(specs.size>=4);
 pass('All five named neighbours use the new head with distinct proportions',{distinctHeadSpecifications:specs.size});
 run('LOOK.pbr=false;QUALITY.full=false;');
 assert(run("material31('plaster','#E8D7B7').isMeshLambertMaterial"));
 assert(run("makeHeroAvatar(lookFor(0)).hero.bones.head.getObjectByName('head31_surface').material.isMeshLambertMaterial"));
 pass('Lite quality retains a cheaper diffuse path for the new head and environment');
 report.passed=true;fs.writeFileSync(path.join(__dirname,'results-v32.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({build:report.build,priorChecks:base.checks.length,visualChecks:report.checks.length}));
})().catch(e=>{report.passed=false;report.error=e.stack;fs.writeFileSync(path.join(__dirname,'results-v32.json'),JSON.stringify(report,null,2));console.error(e.stack);process.exitCode=1;});

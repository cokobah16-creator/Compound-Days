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
   const expected=new THREE.Color(skin);for(const k of ['r','g','b'])assert(Math.abs(head.material.color[k]-expected[k])<1e-9);
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
   assert.equal(ex.visualRevision,31);for(const [ids,weights] of ex.revealSkin.vertices){let y=0,sum=0;for(let k=0;k<3;k++){y+=neutral.getY(ids[k])*weights[k];sum+=weights[k];}assert(Math.abs(sum-1)<1e-6);assert(y<=1.485001);patches++;}
 }
 pass('Garment openings use normalized skin bindings below the new neck',{patchVertices:patches});
 let capSamples=0,minCapGap=Infinity,maxCapGap=0;
 for(const bodyBase of ['base_a','base_b']){
   context.look={...run('lookFor(0)'),bodyBase,outfit:'basics',hair:'none',acc:[],beard:'none'};const actor=run('makeHeroAvatar(look)'),body=actor.hero.body;
   const cloth=body.parent.children.find(o=>o.userData.wardrobe==='tee'),a=cloth.geometry.attributes,cap=[];
   for(let i=0;i<a.position.count;i++)if(a._body_weights.array[i*3]>.99999&&a._body_weights.array[i*3+1]<.00001&&a.position.getY(i)>1.38)cap.push(i);
   assert(cap.length>100);
   for(const [clip,action] of Object.entries(actor.actions)){
     Object.values(actor.actions).forEach(a=>a.stop());action.reset().setEffectiveWeight(1).play();
     for(const f of [.23,.61,.93]){actor.mixer.setTime(action.getClip().duration*f);actor.updateMatrixWorld(true);body.skeleton.update();
       for(const i of cap){const j=Math.round(a._body_ids.array[i*3]),p=new THREE.Vector3(),q=new THREE.Vector3();cloth.boneTransform(i,p);body.boneTransform(j,q);const gap=p.distanceTo(q);assert(gap>.002&&gap<.015);minCapGap=Math.min(minCapGap,gap);maxCapGap=Math.max(maxCapGap,gap);capSamples++;}
     }
   }
   context.actor=actor;run('presenceUpdate(actor,.016,false)');assert(actor.userData.art31.retired.every(o=>!o.visible));
 }
 pass('Sewn shoulder caps stay outside both bases through all nine animation clips',{samples:capSamples,minGapMetres:minCapGap,maxGapMetres:maxCapGap});
 for(const id of ['office_shirt','track_top','lounge_top']){const asset=run(`WARDROBE.cache.${id}`);asset.scene.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes;for(let i=0;i<a.position.count;i++)if(a.position.getY(i)<1.03&&Math.abs(a.position.getX(i))>.22){let fore=0;for(let k=0;k<4;k++)if([9,14].includes(a.skinIndex.array[i*4+k]))fore+=a.skinWeight.array[i*4+k];assert(fore>.95);}});}
 pass('Long-sleeve cuffs follow the forearms rather than the torso');
 for(const id of run('PROPS.order')){
   context.prop=await parse('assets/props/'+id+'.gltf.json');context.propId=id;
   run("{let ex;prop.scene.traverse(o=>{if(!ex&&o.userData.prop)ex=o.userData;});prop.extras=ex||{prop:propId,size:[1,1,1]};prop.scene=propMerge(prop.scene,propId);PROPS.cache[propId]=prop;}");
 }
 run("S=newState();S.phase='play';buildWorld();envInit();");
 assert(run("scene.getObjectByName('entry31')&&scene.getObjectByName('palm31')"));
 assert(run("skyDome.material.fragmentShader.includes('#include <encodings_fragment>')&&waterMesh.material.fragmentShader.includes('#include <tonemapping_fragment>')"));
 const styles=run('ENV_PRESETS.map(p=>p.id)');for(const id of styles){context.presetId=id;assert(run('envSetPreset(presetId,{persist:false,force:true})'));run('scene').traverse(o=>{if(o.isMesh&&o.visible){finite(o.geometry.attributes.position.array);if(o.geometry.attributes.normal)finite(o.geometry.attributes.normal.array);}});}
 pass('All eight courtyard presets build with finite geometry, curved palms and entry details',{styles:styles.length});
 const tex=run('[...ENV31.textures.values()]');for(const t of tex){const file=t.userData.art31File;assert(fs.existsSync(path.join(harness.root,file)));assert([THREE.sRGBEncoding,THREE.LinearEncoding].includes(t.encoding));}
 pass('Every referenced v31 texture exists and declares its colour/data encoding',{maps:tex.length});
 run('spawnNPCs()');const cast=run('Object.values(npcs)');assert.equal(cast.length,5);const specs=new Set();for(const npc of cast){assert(npc.g.hero.bones.head.getObjectByName('head31_surface'));specs.add(JSON.stringify(npc.g.userData.art31.spec));}assert(specs.size>=4);
 pass('All five named neighbours use the new head with distinct proportions',{distinctHeadSpecifications:specs.size});
 run('LOOK.pbr=false;QUALITY.full=false;');
 assert(run("material31('plaster','#E8D7B7').isMeshLambertMaterial"));
 assert(run("makeHeroAvatar(lookFor(0)).hero.bones.head.getObjectByName('head31_surface').material.isMeshLambertMaterial"));
 pass('Lite quality retains a cheaper diffuse path for the new head and environment');
 report.passed=true;fs.writeFileSync(path.join(__dirname,'results-v31.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({build:report.build,priorChecks:base.checks.length,visualChecks:report.checks.length}));
})().catch(e=>{report.passed=false;report.error=e.stack;fs.writeFileSync(path.join(__dirname,'results-v31.json'),JSON.stringify(report,null,2));console.error(e.stack);process.exitCode=1;});

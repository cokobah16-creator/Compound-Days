// Export the actual built scene for offline geometry/material inspection.
const fs=require('fs'),path=require('path'),h=require('./runtime-harness.cjs'),{dump}=require('./export-geometry.cjs');
const folder=path.resolve(process.argv[2]||'check/geometry31');fs.mkdirSync(folder,{recursive:true});
h.load().then(async({run,context,THREE,parse})=>{
 for(const id of run('PROPS.order')){
   const asset=await parse('assets/props/'+id+'.gltf.json');let extras;
   asset.scene.traverse(o=>{if(!extras&&o.userData?.prop)extras=o.userData;});
   context.asset=asset;context.assetId=id;context.extras=extras||{prop:id,size:[1,1,1]};
   run('asset.extras=extras;asset.scene=propMerge(asset.scene,assetId);PROPS.cache[assetId]=asset;');
 }
 run("S=newState();S.phase='play';S.time=15;buildWorld();propDressWorld();envInit();buildContactShadows();");
 const diorama=await parse('assets/env/courtyard.gltf.json');context.diorama=diorama;
 run("diorama.scene.position.copy(DIORAMA.off);diorama.scene.name='courtyardDiorama';for(const child of diorama.scene.children){if(DIORAMA.hide.includes(child.name.replace(/_/g,' ')))child.visible=false;}scene.add(diorama.scene);DIORAMA.root=diorama.scene;DIORAMA.state='ready';envRegisterDiorama();envApplyMaterials(ENV_PRESETS[0]);");
 run("S.p[0].hair='braidbun';S.p[1].hair='curls';players=S.p.map((p,i)=>({i,g:makeHeroAvatar(lookFor(i)),y:0,t:0}));players.forEach((p,i)=>{p.g.position.set(-.5+i*1.1,0,2.5);scene.add(p.g);animAvatar(p.g,.4,false,false,0,.016);});applyLighting();");
 const scene=run('scene');scene.updateMatrixWorld(true);
 fs.writeFileSync(path.join(folder,'world.json'),JSON.stringify(dump(THREE,scene)));
 fs.writeFileSync(path.join(folder,'build.json'),JSON.stringify({build:run('BUILD_ID'),method:'Offline runtime mesh export, not a WebGL screenshot'}));
 const stats={build:run('BUILD_ID'),surfaces:run('ENV23.surfaces.length'),materials:run('ENV31.mats.size'),meshes:0,triangles:0};
 scene.traverse(o=>{if(o.isMesh&&o.visible){stats.meshes++;stats.triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;}});
 console.log(JSON.stringify(stats));
}).catch(e=>{console.error(e);process.exitCode=1;});

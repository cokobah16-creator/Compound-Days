const fs=require('fs'),path=require('path');
const harness=require('./runtime-harness.cjs');
const outDir=path.resolve(process.argv[2]||'check/geometry');fs.mkdirSync(outDir,{recursive:true});
function dump(THREE,root){
  root.updateMatrixWorld(true);const meshes=[];
  root.traverse(o=>{if(!o.isMesh||!o.visible||!o.geometry?.index)return;let p=o.parent;while(p){if(!p.visible)return;p=p.parent;}
    if(o.isSkinnedMesh)o.skeleton.update();
    const geo=o.geometry,I=geo.index.array,P=geo.attributes.position,N=geo.attributes.normal,C=geo.attributes.color;
    const mat=Array.isArray(o.material)?o.material[0]:o.material;if(!mat||mat.opacity<.5||!mat.color||mat.blending===THREE.MultiplyBlending)return;
    const ids=[...new Set(I)],map=new Map(ids.map((x,i)=>[x,i])),verts=[],norms=[],colors=[],uvs=[];
    const v=new THREE.Vector3(),n=new THREE.Vector3(),tmp=new THREE.Vector3();
    const normalMatrices=o.isSkinnedMesh?o.skeleton.bones.map((b,j)=>new THREE.Matrix3().setFromMatrix4(o.matrixWorld.clone().multiply(o.bindMatrixInverse).multiply(b.matrixWorld).multiply(o.skeleton.boneInverses[j]).multiply(o.bindMatrix))):null;
    for(const i of ids){v.fromBufferAttribute(P,i);n.set(0,0,0);
      if(o.isSkinnedMesh){o.boneTransform(i,v);for(let k=0;k<4;k++){const j=geo.attributes.skinIndex.array[i*4+k],w=geo.attributes.skinWeight.array[i*4+k];if(w){tmp.fromBufferAttribute(N,i).applyMatrix3(normalMatrices[j]);n.addScaledVector(tmp,w);}}n.normalize();}
      else{if(N)n.fromBufferAttribute(N,i);else n.set(0,0,1);n.transformDirection(o.matrixWorld);}v.applyMatrix4(o.matrixWorld);
      verts.push(v.x,v.y,v.z);norms.push(n.x,n.y,n.z);
      colors.push(mat.color.r*(mat.vertexColors&&C?C.getX(i):1),mat.color.g*(mat.vertexColors&&C?C.getY(i):1),mat.color.b*(mat.vertexColors&&C?C.getZ(i):1));}
    if(geo.attributes.uv)for(const i of ids)uvs.push(geo.attributes.uv.getX(i),geo.attributes.uv.getY(i));
    meshes.push({name:o.name,verts,norms,colors,uvs,texture:mat.map?.userData?.art31File||null,faces:Array.from(I,x=>map.get(x))});
  });return meshes;
}
async function main(){return harness.load().then(async({run,context,THREE,parse})=>{
  fs.writeFileSync(path.join(outDir,'build.json'),JSON.stringify({build:run('BUILD_ID'),method:'Offline runtime mesh export, not a WebGL screenshot'}));
  context.sofaAsset=await parse('assets/props/sofa_teal.gltf.json');
  run("PROPS.cache.sofa_teal={scene:sofaAsset.scene,extras:{size:[1.62,.84,.8]}};");
  for(const [base,skin] of [['base_a','#AE7A52'],['base_b','#6E4630']]){
    context.look={...run('lookFor(0)'),bodyBase:base,bodyBuild:'balanced',face:'oval',outfit:'starter',skin,hair:'none',acc:[],beard:'none'};
    const g=run('makeHeroAvatar(look)');context.actor=g;
    run("for(const a of Object.values(actor.actions))a.stop();actor.actions.idle.reset().setEffectiveWeight(1).play();actor.current='idle';actor.mixer.setTime(.4);actor.updateMatrixWorld(true);");
    fs.writeFileSync(path.join(outDir,base+'.json'),JSON.stringify(dump(THREE,g)));
  }
  for(const hair of ['low','curls','braidbun']){
    context.look={...run('lookFor(0)'),bodyBase:hair==='braidbun'?'base_a':'base_b',bodyBuild:'balanced',face:'oval',outfit:'starter',skin:'#905F3F',hair,acc:[],beard:'none'};
    const g=run('makeHeroAvatar(look)');context.actor=g;
    run("for(const a of Object.values(actor.actions))a.stop();actor.actions.idle.reset().setEffectiveWeight(1).play();actor.mixer.setTime(.4);");
    fs.writeFileSync(path.join(outDir,'hair_'+hair+'.json'),JSON.stringify(dump(THREE,g)));
  }
  for(const outfit of ['basics','office','everydaytunde']){
    context.look={...run('lookFor(0)'),bodyBase:'base_b',bodyBuild:'balanced',face:'angular',outfit,skin:'#7F5238',hair:'low',acc:[],beard:'full'};
    const g=run('makeHeroAvatar(look)');context.actor=g;
    run("for(const a of Object.values(actor.actions))a.stop();actor.actions.idle.reset().setEffectiveWeight(1).play();actor.mixer.setTime(.4);");
    fs.writeFileSync(path.join(outDir,'outfit_'+outfit+'.json'),JSON.stringify(dump(THREE,g)));
  }
  if(run('typeof sofaSeatFrame')==='function'){
    run("S.phase='play';S.home.items=[{id:'sofa-test',type:'sofa',x:2,y:1}];rebuildFurniture();players=S.p.map((p,i)=>({i,g:makeHeroAvatar(lookFor(i)),y:0}));players.forEach(p=>{p.g.baseY=0;scene.add(p.g);});sitStart();for(let k=0;k<60;k++)players.forEach(p=>animAvatar(p.g,k/60,false,false,0,1/60));");
    const scene=run('scene');fs.writeFileSync(path.join(outDir,'seating.json'),JSON.stringify(dump(THREE,scene)));
  }
  console.log('Exported actual runtime meshes:',outDir);
});}
module.exports={dump};
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});

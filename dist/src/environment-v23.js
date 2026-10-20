/* V23 environment system. Presets dress shared public spaces; household
   furniture, actors, routes and the story state retain their own ownership. */
'use strict';
const ENV23_LOOKS=[
 {skin:SKINS[5],hair:'afro',outfit:'tee',oc:'#B87846'},
 {skin:SKINS[4],hair:'braids',outfit:'office',oc:'#D5C5A4'},
 {skin:SKINS[6],hair:'low',outfit:'kaftan',oc:'#567A72'},
 {skin:SKINS[3],hair:'twists',outfit:'lounge',oc:'#8F6061'},
 {skin:SKINS[5],hair:'locs',outfit:'track',oc:'#526B8D'},
 {skin:SKINS[4],hair:'wrap',outfit:'ankara',oc:'#D19D4D'},
 {skin:SKINS[6],hair:'wig',outfit:'office',oc:'#66765B'}
];
Object.assign(CAST.ada.look,{skin:SKINS[5],hair:'twists',outfit:'tee',oc:'#B57A50'});
Object.assign(CAST.tunde.look,{skin:SKINS[6],hair:'afro',outfit:'track',oc:'#527366'});
Object.assign(CAST.bassey.look,{skin:SKINS[4],hair:'low',outfit:'kaftan',oc:'#495C75'});
Object.assign(CAST.nkechi.look,{skin:SKINS[5],hair:'wrap',outfit:'ankara'});
Object.assign(CAST.oyelaran.look,{skin:SKINS[3],hair:'locs',outfit:'lounge',oc:'#99787A'});

function envAssetsReady(){return HERO.state==='ready'&&Object.values(WARDROBE.hair).every(n=>WARDROBE.cache[n])&&Object.values(WARDROBE.outfits).flat().every(n=>WARDROBE.cache[n]);}
function envPerson(look,key){
 const g=makeHeroAvatar(Object.assign({},look,{rig:'hero'}));if(!g)return null;
 g.userData.environmentPerson=key;g.userData.look=Object.assign({},look);
 // Shared sculpt, but a consistent stature, hairstyle and wardrobe per resident.
 const scale={ada:.98,tunde:1.035,bassey:1.01,nkechi:.97,oyelaran:.95}[key]||[1,.97,1.025,.99][key.length%4];g.scale.setScalar(scale);
 return g;
}
function envDisposePerson(g){
 if(g.mixer){g.mixer.stopAllAction();g.mixer.uncacheRoot(g);}
 const mats=new Set();g.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))mats.add(m);});mats.forEach(m=>m.dispose());scene.remove(g);
}
const envOldSpawn=spawnNPCs;
spawnNPCs=function(){
 if(!envAssetsReady()){envOldSpawn();return;}
 const old=npcs;npcs={};for(const k in CAST){const g=envPerson(CAST[k].look,k);npcs[k]={g,k,t:old[k]?old[k].t:0};scene.add(g);}
 Object.values(old).forEach(n=>envDisposePerson(n.g));placeNPCs();
};
function envRefreshPeople(){
 if(!envAssetsReady())return false;
 for(const [i,w]of walkers.entries())if(w.g.rig!=='hero'){
  const g=envPerson(ENV23_LOOKS[i%ENV23_LOOKS.length],'walker-'+i);g.position.copy(w.g.position);g.quaternion.copy(w.g.quaternion);envDisposePerson(w.g);w.g=g;scene.add(g);
 }
 for(const [i,v]of vendors.entries())if(v.g.rig!=='hero'){
  const g=envPerson(ENV23_LOOKS[(i+2)%ENV23_LOOKS.length],'seller-'+v.st.id);g.position.copy(v.g.position);g.quaternion.copy(v.g.quaternion);envDisposePerson(v.g);v.g=g;scene.add(g);
 }
 if(S&&Object.values(npcs).some(n=>!n.g.userData.environmentPerson))spawnNPCs();
 ENV23.peopleReady=true;return true;
}

// Register only world architecture during construction: never recolour skin,
// the player's saved furniture or a wardrobe material by matching its colour.
const envOriginalBox=box,envOriginalSlab=slab;
function envSurfaceKind(c,w,h,d){
 c=String(c).toUpperCase();
 if(['#F3E9D8','#EFE1C6','#E4D1AE','#F4F1EA'].includes(c)&&Math.max(w,h,d)>1)return 'wall';
 if(['#3C5A8A','#1F3468'].includes(c))return 'trim';
 if(['#8E3E21','#C97B4A'].includes(c))return 'roof';
 if(['#D7B48A','#B8A58C'].includes(c))return 'paving';
 if(['#A8713F','#6E4630','#8E5A3B'].includes(c))return 'wood';
 return null;
}
function envRegister(m,kind){if(m&&kind&&!m.userData.environmentSurface){m.userData.environmentSurface=kind;ENV23.surfaces.push({m,kind});}return m;}
box=function(w,h,d,c,x,y,z,o){const m=envOriginalBox(w,h,d,c,x,y,z,o);if(ENV23.constructing)envRegister(m,envSurfaceKind(c,w,h,d));return m;};
slab=function(w,d,c,x,z,y){const m=envOriginalSlab(w,d,c,x,z,y);if(ENV23.constructing)envRegister(m,envSurfaceKind(c,w,.01,d));return m;};
const envOldWorld=buildWorld;
buildWorld=function(){ENV23.constructing=true;envOldWorld();ENV23.constructing=false;envStaticArchitecture();};

function envStaticArchitecture(){
 const g=new THREE.Group();g.name='env23_architecture';scene.add(g);ENV23.staticGroup=g;
 const stone=envMat('plaster','#BEAF94'),timber=envMat('wood','#765C43'),cream=envMat('plaster','#DFD3B8'),shutter=envMat('plaster','#45746A');
 // Low coping and plinths give the walls thickness and a readable meeting with the ground.
 [[0.9,3,5.98],[5,8.5,5.98]].forEach(([a,b,z])=>{envBox(b-a,.10,.34,stone,g,(a+b)/2,1.6,z);envBox(b-a,.17,.31,stone,g,(a+b)/2,0,z);});
 for(const z of [-6.4,6])envBox(3.72,.085,.30,cream,g,10.25,4.3,z);
 for(const x of [8.6,12])envBox(.30,.085,11.45,cream,g,x,4.3,-.8);
 // Window sills and small slatted shutters on the existing courtyard facade.
 for(const x of [-7.1,-4.9,3.9,6.1]){
  envBox(1.18,.09,.24,stone,g,x,1.03,-6.28);
  for(const side of [-1,1])for(let k=0;k<7;k++)envBox(.26,.085,.075,shutter,g,x+side*.65,1.1+k*.16,-6.30);
 }
 // A paved waterfront edge and short planted ends, leaving the bench approach clear.
 envBox(13,.07,2.45,envMat('paving','#BDB7A4'),g,1.5,.015,13.32);
 envBox(13,.10,.20,stone,g,1.5,0,14.58);
 for(const x of [-5.25,7.9]){envBox(.75,.33,1.3,cream,g,x,0,13.7);envLeafCloud(g,x,.35,13.7,.37,.57,55,'#4E7750',Math.floor(x*57));}
 // A narrower serving shelf replaces the bare block's blank front at the suya spot.
 for(let k=0;k<9;k++)envBox(.12,.8,.07,timber,g,-3.64+k*.16,0,12.79);
 envBox(1.6,.065,.9,timber,g,-3,.82,12.3);
 envPlanter(-.5,14,'#A66B4C',1.0,g);envPlanter(6.7,12.3,'#B3A487',1.35,g);
 // Market apron: woven baskets sit at the visible counter edge, below the canopy.
 for(const st of STALLS){if(st.shop)continue;envBox(2.28,.08,.10,timber,g,st.x,.76,st.z+(st.z<0?.51:-.51));}
 ENV23.staticGroup=envBake(g,'env23_architecture');ENV23.staticGroup.traverse(m=>{if(m.material===shutter)envRegister(m,'trim');});
}
function envBake(g,name){
 // Preserve vertex colours (the generic catalogue merger only copies normals
 // and UVs). Losing this attribute turns merged foliage black.
 g.updateMatrixWorld(true);const groups=new Map(),baked=new THREE.Group();baked.name=name;
 g.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const key=o.material.uuid;if(!groups.has(key))groups.set(key,{material:o.material,meshes:[]});groups.get(key).meshes.push(o);});
 const v=new THREE.Vector3(),nm=new THREE.Matrix3();
 for(const {material,meshes}of groups.values()){
  const P=[],N=[],U=[],C=[],I=[];let base=0;
  for(const o of meshes){const geo=o.geometry,a=geo.attributes;nm.getNormalMatrix(o.matrixWorld);
   for(let j=0;j<a.position.count;j++){
    v.fromBufferAttribute(a.position,j).applyMatrix4(o.matrixWorld);P.push(v.x,v.y,v.z);
    v.fromBufferAttribute(a.normal,j).applyMatrix3(nm).normalize();N.push(v.x,v.y,v.z);
    U.push(a.uv?a.uv.getX(j):0,a.uv?a.uv.getY(j):0);C.push(a.color?a.color.getX(j):1,a.color?a.color.getY(j):1,a.color?a.color.getZ(j):1);
   }
   const ix=geo.index?geo.index.array:Array.from({length:a.position.count},(_,i)=>i);for(const i of ix)I.push(i+base);base+=a.position.count;
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));if(material.vertexColors)geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));geo.setIndex(I);geo.computeBoundingSphere();const m=new THREE.Mesh(geo,material);m.castShadow=m.receiveShadow=true;baked.add(m);
 }
 g.parent.add(baked);g.parent.remove(g);
 const shared=new Set(),sharedMaterials=new Set(Object.values(ENV23.materials));Object.values(PROPS.cache).forEach(s=>s.scene.traverse(o=>{if(o.isMesh){shared.add(o.geometry);sharedMaterials.add(o.material);}}));
 const ownMaterials=new Set();baked.traverse(o=>{if(o.isMesh&&!sharedMaterials.has(o.material))ownMaterials.add(o.material);});baked.userData.ownedMaterials=[...ownMaterials];
 const owned=new Set();g.traverse(o=>{if(o.isMesh&&!shared.has(o.geometry))owned.add(o.geometry);});owned.forEach(x=>x.dispose());
 return baked;
}
function envRegisterDiorama(){
 if(!DIORAMA.root||ENV23.dioramaRegistered)return;
 DIORAMA.root.traverse(m=>{if(!m.isMesh||Array.isArray(m.material))return;
  const n=m.material.name;const kind=/^plaster$|^interior$/.test(n)?'wall':/^roof/.test(n)?'roof':/^door$|^door_lighter$/.test(n)?'trim':/^stone\d$/.test(n)?'paving':/^wood$|^door_frame$/.test(n)?'wood':null;
  envRegister(m,kind);
 });ENV23.dioramaRegistered=true;
}
function envApplyMaterials(p){
 envRegisterDiorama();
 for(const {m,kind}of ENV23.surfaces){
  const material=envMat(kind==='paving'?'paving':kind==='wood'?'wood':'plaster',p[kind]);
  // Some roof panels participate in camera fading and need independent opacity.
  if(FADEABLE.includes(m)){if(m.userData.environmentOwnedMaterial)m.material.dispose();m.material=material.clone();m.material.transparent=true;m.userData.environmentOwnedMaterial=true;}
  else m.material=material;
 }
}
function envProp(name,x,z,ry=0,y=0,scale=1){
 const src=PROPS.cache[name];if(!src)return null;const g=src.scene.clone();g.name='prop_'+name;g.userData.instanceOf=name;g.scale.setScalar(scale);g.position.set(x,y,z);g.rotation.y=ry;
 const p=ENV_PRESETS.find(p=>p.id===ENV23.id);g.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const n=o.material.name;if(/wood_warm|post_wood|wood_dark/.test(n))o.material=envMat('wood',p.wood);else if(/teal_fabric|terracotta_fabric|cushion_print/.test(n))o.material=envMat('cloth',p.cloth);});
 ENV23.group.add(g);return g;
}
function envCollider(x,z,w,d){addObs(x-w/2,x+w/2,z-d/2,z+d/2,'env-preset');}
function envChair(name,x,z,ry=0){envProp(name,x,z,ry);envCollider(x,z,.62,.62);}
function envTable(x,z,w=1.35,d=.72,h=.72){
 const p=ENV_PRESETS.find(p=>p.id===ENV23.id),m=envMat('wood',p.wood),g=ENV23.group;
 envBox(w,.06,d,m,g,x,h-.06,z);for(const a of[-1,1])for(const b of[-1,1])envBox(.065,h-.06,.065,m,g,x+a*(w/2-.1),0,z+b*(d/2-.09));envCollider(x,z,w,d);
 return h;
}
function envRug(x,z,w,d,p){
 const g=ENV23.group,m=envMat('cloth',p.cloth),border=envMat('cloth','#D3C49F');envBox(w,.014,d,m,g,x,.021,z);
 for(const zz of[-1,1])for(let i=0;i<3;i++)envBox(w-.12,.004,.035,border,g,x,.037,z+zz*(d/2-.12-i*.08));
 for(const xx of[-1,1])envBox(.055,.004,d-.12,border,g,x+xx*(w/2-.08),.037,z);
}
function envBooks(x,y,z){for(let k=0;k<3;k++)envBox(.25,.042,.18,envMat('cloth',['#866552','#68766D','#C5A05A'][k]),ENV23.group,x+k*.012,y+k*.046,z+k*.01);}
function envCushion(x,y,z,p){const m=envMesh(new THREE.SphereGeometry(1,16,10),envMat('cloth',p.cloth),ENV23.group,x,y,z);m.scale.set(.23,.09,.21);}
function envShelter(p){
 const g=ENV23.group,timber=envMat('wood',p.wood);
 for(const x of[4.05,7.75])for(const z of[-5.15,-.9]){envBox(.095,2.65,.095,timber,g,x,0,z);envCollider(x,z,.14,.14);}
 const roofGroup=new THREE.Group();roofGroup.name='env23_preset_shade';scene.add(roofGroup);ENV23.shade=roofGroup;
 if(p.layout==='rain'){
  const m=envBox(3.92,.07,4.50,envMat('plaster',p.roof),roofGroup,5.9,2.65,-3.03);m.rotation.z=.018;fadeable(m);
 }else{
  for(let k=0;k<12;k++){const m=envBox(3.95,.055,.10,timber,roofGroup,5.9,2.65,-5.16+k*.389);fadeable(m);}
 }
 for(const x of[4.05,7.75])envBox(.10,.12,4.5,timber,g,x,2.52,-3.03);
}
function envBuildPreset(p){
 ENV23.id=p.id;const g=new THREE.Group();g.name='env23_preset_'+p.id;scene.add(g);ENV23.group=g;
 // The public furnishing bay is east of the shared carrying route.
 envRug(5.85,-2.75,3.45,3.9,p);
 if(p.shade)envShelter(p);
 if(p.layout==='salon'||p.layout==='music'){
  envProp('sofa_teal',5.85,-4.03,0);envCollider(5.85,-4.03,1.66,.85);
  envChair('armchair_woven',4.65,-2.35,.9);envChair('armchair_woven',7.03,-2.35,-.9);
  envProp('coffee_table',5.85,-2.9);envCollider(5.85,-2.9,1,.52);envProp('lantern',5.75,-2.9,0,.42);
  if(p.layout==='music'){envTable(7.1,-4.7,.85,.48,.68);envProp('radio',7.1,-4.7,0,.68);envBooks(6.02,.42,-2.8);}
 }else if(p.layout==='reading'||p.layout==='rain'){
  envChair('armchair_woven',4.7,-3.55,.5);envChair('armchair_woven',6.85,-3.55,-.5);
  envProp('coffee_table',5.8,-3.1);envCollider(5.8,-3.1,1,.52);envBooks(5.8,.42,-3.1);
  envProp('bench_wooden',5.8,-1.28,Math.PI);envCollider(5.8,-1.28,1.5,.5);
  envTable(7.05,-4.58,.65,.45,.76);envProp('lantern',7.05,-4.58,0,.76);envCushion(5.75,.51,-1.28,p);
 }else if(p.layout==='garden'){
  envTable(5.75,-4.55,1.8,.65,.78);envProp('bucket_covered',6.24,-4.6,0,0);envProp('market_basket',5.75,-4.55,0,.78,.75);
  for(const x of[4.55,7.1]){envBox(.68,.35,1.4,envMat('wood',p.wood),g,x,0,-2.8);envBox(.6,.025,1.28,envMat('plaster','#493C2B'),g,x,.34,-2.8);envLeafCloud(g,x,.38,-2.8,.32,.32,70,p.leaf,Math.floor(x*18));envCollider(x,-2.8,.68,1.4);}
  envProp('bench_wooden',5.8,-1.3,Math.PI);envCollider(5.8,-1.3,1.5,.5);envProp('water_container',6.9,-4.7,.2);
 }else if(p.layout==='coastal'){
  envProp('bench_wooden',5.8,-3.9);envCollider(5.8,-3.9,1.5,.5);
  envProp('bench_wooden',5.8,-1.48,Math.PI);envCollider(5.8,-1.48,1.5,.5);
  envProp('coffee_table',5.8,-2.75);envCollider(5.8,-2.75,1,.52);envProp('kettle',5.7,-2.75,0,.42);envCushion(5.5,.51,-3.9,p);envCushion(6.05,.51,-1.48,p);
 }else if(p.layout==='maker'){
  envTable(5.8,-3.9,2.1,.8,.80);envChair('dining_chair',5.1,-2.9,Math.PI);envChair('dining_chair',6.5,-2.9,Math.PI);
  for(let k=0;k<3;k++){const r=envMesh(new THREE.CylinderGeometry(.09,.09,.58,16),envMat('cloth',[p.cloth,'#57736B','#BAAAA0'][k]),g,5.4+k*.29,.89,-3.9);r.rotation.z=Math.PI/2;}
  envBooks(6.45,.80,-3.9);envTable(7.05,-1.6,.75,.48,.92);envPlanter(7.05,-1.6,'#A66846',.46,g,.92);
 }else if(p.layout==='dining'){
  envTable(5.85,-2.9,1.45,1.12,.75);
  envBox(1.48,.012,1.15,envMat('cloth',p.cloth),g,5.85,.75,-2.9);
  for(const x of[5.4,6.3]){envChair('dining_chair',x,-4.03,0);envChair('dining_chair',x,-1.78,Math.PI);envProp('plates_cutlery',x,-3.2,0,.77,.7);}
  envProp('jollof_bowl',5.85,-2.75,0,.78);envProp('cooler_food',7.15,-4.6);
 }
 const spots=[[4.25,-4.73],[7.45,-4.82],[7.42,-1.42],[4.34,-1.03],[3.72,-5.53],[6.55,-5.57],[7.67,-3.6],[3.83,-3.9],[6.8,-.57],[4.3,-.57],[7.66,-2.7],[4.15,-2.5],[5.4,-5.5],[7.7,-.58]];
 for(let i=0;i<p.plants;i++){const[x,z]=spots[i];envPlanter(x,z,i%3?'#AC714E':'#BEB098',.72+(i%3)*.28,g);/* Decorative leaves do not close the path. */}
 // One warm lamp per public bay; intensity follows the actual game clock.
 envProp('lantern',4.35,-4.72,0,.25);const l=new THREE.PointLight('#FFD095',0,5,2);l.position.set(5.8,2.35,-2.8);scene.add(l);ENV23.lights.push(l);
 // Retint local fabric only, leaving the indigo story sofa recognisable.
 g.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;if(/teal_fabric|cushion/.test(o.material.name)){o.material=envMat('cloth',p.cloth);}});
 ENV23.group=envBake(g,'env23_preset_'+p.id);ENV23.buildCount++;
}
function envClearPreset(){
 for(let i=OBS.length-1;i>=0;i--)if(OBS[i].tag==='env-preset')OBS.splice(i,1);
 if(ENV23.group){const old=ENV23.group;scene.remove(old);old.traverse(o=>{if(o.isMesh)o.geometry.dispose();});(old.userData.ownedMaterials||[]).forEach(m=>m.dispose());ENV23.group=null;}
 if(ENV23.shade){const old=ENV23.shade;old.traverse(o=>{const i=FADEABLE.indexOf(o);if(i>=0)FADEABLE.splice(i,1);if(o.isMesh){o.geometry.dispose();o.material.dispose();}});scene.remove(old);ENV23.shade=null;}
 ENV23.lights.forEach(l=>scene.remove(l));ENV23.lights=[];
}
function envSetPreset(id,{persist=true,force=false}={}){
 const p=ENV_PRESETS.find(p=>p.id===id);if(!p||!ENV23.ready)return false;
 if(!force&&S){
  if(NET.on){toast('Environment styling is available in local play.');return false;}
  if(sofa&&sofa.carrying){toast('Set the sofa down before changing the courtyard.');return false;}
  if(players.some(a=>a.lvl===0&&a.g.position.x>3.55&&a.g.position.x<8.1&&a.g.position.z>-5.85&&a.g.position.z<-.15)){toast('Step out of the east seating area, then choose a style.');return false;}
 }
 envClearPreset();envBuildPreset(p);envApplyMaterials(p);envUpdateLights();
 if(S&&persist){S.environmentPreset=id;save();}return true;
}
function envUpdateLights(){const h=S?S.time%24:12,night=h>=18.5||h<6.5;ENV23.lights.forEach(l=>l.intensity=night?.85:0);}
function envInit(){
 if(!PROPS.order.every(n=>PROPS.cache[n]))return false;
 if(!ENV23.ready){ENV23.ready=true;envSetPreset(S&&S.environmentPreset||'palm',{persist:false,force:true});}
 envRegisterDiorama();envApplyMaterials(ENV_PRESETS.find(p=>p.id===ENV23.id));return true;
}

// Stable dressing outside the selectable bay. No old dining set or duplicate
// clothesline is left underneath a preset.
propDressWorld=function(){
 propPlace('sofa_teal',1.77,0,-3.95,0,{col:true});propPlace('banana_plant',-5.4,0,-1.5,.4);
 propPlace('chair_plastic',-3.55,0,-3.3,.7,{col:true});propPlace('chair_plastic',-3,0,-3.85,-.25,{col:true});propPlace('cooler_food',-3.6,0,-2.65,.3,{col:true});
 propPlace('generator',1.5,0,.2,0,{then:()=>{if(window.GEN_MESHES)GEN_MESHES.forEach(m=>m.visible=false);}});
 if(window.LINE_MESHES)LINE_MESHES.forEach(m=>m.visible=false);
 const g=new THREE.Group();g.name='env23_west_laundry';scene.add(g);
 envTube([[-6.5,2.3,-4.5],[-6.5,2.17,-1.7],[-6.5,2.3,1]],.01,envMat('wood','#675443'),g);
 [-3.65,-2.42,-1.2,.04].forEach((z,i)=>{const cloth=new THREE.Group();cloth.position.set(-6.5,0,z);cloth.rotation.y=Math.PI/2;g.add(cloth);envHangingCloth(cloth,0,2.22,0,.83,.86,['#9E7851','#4F7585','#DED2B7','#8C6455'][i],i);});
 propPlace('bucket_covered',-6.4,0,1.35,.2,{col:true});propPlace('basins_wash',-5.75,0,1.5,.5,{col:true});propPlace('water_container',-6.95,0,1.5,.4);
 propPlace('market_basket',14.75,.86,-2.91,.35,{scale:.85});propPlace('bucket_covered',22.75,0,2.55,.1,{col:true});propPlace('basins_wash',23.4,0,2.45,.6,{col:true});propPlace('water_container',22.25,0,2.62,.3);propPlace('cooking_pot',24.6,0,2.5,.2);
 if(!window.cornerLight){window.cornerLight=new THREE.PointLight('#FFC27A',0,8,2);cornerLight.position.set(.6,2.3,-3.2);scene.add(cornerLight);}
};

function envMenuCard(){const p=ENV_PRESETS.find(p=>p.id===ENV23.id)||ENV_PRESETS[0];return `<div class="card"><b>Courtyard style · ${esc(p.name)}</b><p class="small">Eight furnished settings. Your home and progress stay yours.</p>${btn('Choose an environment','environment',{},'quiet block')}</div>`;}
const envOldMenu=openMenu;
openMenu=function(){envOldMenu();const actions=document.querySelector('#panel .actions');if(actions)actions.insertAdjacentHTML('beforebegin',envMenuCard());};
function envPresetPanel(){openPanel(`<h2>Make the compound yours</h2><p class="small">Choose the palette, planting and furniture arrangement for the shared courtyard. Set down carried objects and step out of the east seating area before switching.</p><div class="env-grid">${ENV_PRESETS.map(p=>`<button class="env-card ${ENV23.id===p.id?'selected':''}" data-act="envchoose" data-id="${p.id}" ${!ENV23.ready?'disabled':''}><span class="env-swatches">${[p.wall,p.trim,p.cloth,p.leaf].map(c=>`<i style="background:${c}"></i>`).join('')}</span><strong>${esc(p.name)}</strong><span class="tiny">${esc(p.tag)}</span><span class="small">${esc(p.description)}</span><span class="tiny">${ENV23.id===p.id?'Selected':'Apply this setting'}</span></button>`).join('')}</div><p class="tiny">Palette previews. Each setting changes the actual 3D courtyard. Lighting follows the time of day. Local play only.</p><div class="actions">${btn('Back to menu','envback',{},'quiet')}${btn('Back to the compound','close',{},'primary')}</div>`);}
ACTIONS.environment=envPresetPanel;
ACTIONS.envback=()=>openMenu();
ACTIONS.envchoose=ds=>{if(envSetPreset(ds.id)){toast(ENV_PRESETS.find(p=>p.id===ds.id).name+' is ready.');envPresetPanel();}};
const envOldEnter=enterWorld;
enterWorld=function(){envOldEnter();if(ENV23.ready)envSetPreset(S.environmentPreset||'palm',{persist:false,force:true});else envInit();envRefreshPeople();};
// Skinned meshes in this engine disable Three's per-mesh frustum test to avoid
// incorrect bind-pose bounds. Cull whole background people per camera instead;
// never render the entire distant street population in every split view.
const envOldRenderer=initRenderer;
initRenderer=function(){
 envOldRenderer();const render=renderer.render.bind(renderer),frustum=new THREE.Frustum(),matrix=new THREE.Matrix4(),sphere=new THREE.Sphere();
 renderer.render=function(world,cam){
  if(world!==scene)return render(world,cam);
  cam.updateMatrixWorld();matrix.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);frustum.setFromProjectionMatrix(matrix);
  const people=[...Object.values(npcs).map(n=>n.g),...walkers.map(w=>w.g),...vendors.map(v=>v.g)],state=people.map(g=>g.visible);
  people.forEach(g=>{if(!g.visible)return;sphere.center.copy(g.position);sphere.center.y+=1;sphere.radius=1.7;g.visible=frustum.intersectsSphere(sphere);});
  try{return render(world,cam);}finally{people.forEach((g,i)=>g.visible=state[i]);}
 };
};
let envPolling=0;
TICK_HOOKS.push(dt=>{
 envUpdateLights();envPolling+=dt;
 if(envPolling>.5){envPolling=0;if(!ENV23.ready||!ENV23.dioramaRegistered)envInit();if(!ENV23.peopleReady)envRefreshPeople();}
});
// Loading is independent of animation frames (including the title/creator).
const envReadyTimer=setInterval(()=>{
 if(typeof scene==='undefined'||!scene)return;
 envInit();envRefreshPeople();
 while(ENV23.fade.length){const m=ENV23.fade.pop();if(!FADEABLE.includes(m))fadeable(m);}
 if(ENV23.ready&&ENV23.peopleReady&&ENV23.dioramaRegistered)clearInterval(envReadyTimer);
},180);

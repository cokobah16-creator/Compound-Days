/* Compound Days v21: shared character pipeline, interaction framing and foliage.
   Loaded after the existing game definitions and before boot. Save/input/network
   schemas remain the same. Models and thumbnails use the same equipped assets. */
'use strict';
const VISUAL_BUILD=BUILD_ID;
document.documentElement.dataset.visualBuild=VISUAL_BUILD;

Object.assign(WARDROBE.hair,{afro:'hair_afro',twists:'hair_twists',wig:'hair_wig'});

const v21LookFor=lookFor;
lookFor=function(i){return Object.assign(v21LookFor(i),{rig:'hero'});};
// The v20 veranda sofa overlaps Mrs. Oyelaran's original standing spots.
NPC_SPOTS.oyelaran.morning=[-.35,-3.45,0];
NPC_SPOTS.oyelaran.evening=[-.35,-3.45,0];

// Retain glTF cutout masks and material maps during the game's material conversion.
const v21HeroMaterial=heroLambert;
heroLambert=function(m,skinned){
  const out=v21HeroMaterial(m,skinned);
  out.alphaTest=m.alphaTest||0;out.vertexColors=!!m.vertexColors;
  out.depthWrite=m.depthWrite;out.alphaMap=m.alphaMap||null;
  if(out.isMeshStandardMaterial){
    for(const k of ['normalMap','roughnessMap','metalnessMap','aoMap','bumpMap'])out[k]=m[k]||null;
    if(m.normalScale)out.normalScale.copy(m.normalScale);
    if(m.bumpScale!==undefined)out.bumpScale=m.bumpScale;
  }
  return out;
};

// One callback per load (including failure), so a missing optional asset cannot
// stall the rest of the wardrobe. A revision query invalidates cached old pieces.
wardrobeLoad=function(name,cb){
  if(WARDROBE.cache[name]){if(cb)cb(WARDROBE.cache[name]);return;}
  if(WARDROBE.failed[name]){if(cb)cb(null);return;}
  if(WARDROBE.pending[name]){if(cb)WARDROBE.pending[name].push(cb);return;}
  WARDROBE.pending[name]=cb?[cb]:[];
  const finish=(g,error)=>{
    if(g)WARDROBE.cache[name]=g;else WARDROBE.failed[name]=error||'unavailable';
    const cbs=WARDROBE.pending[name]||[];delete WARDROBE.pending[name];
    cbs.forEach(f=>{try{f(g);}catch(e){console.warn('[Compound Days] wardrobe refresh:',e);}});
  };
  if(typeof THREE.GLTFLoader!=='function'){finish(null,'no loader');return;}
  new THREE.GLTFLoader().load(WARDROBE.dir+name+'.gltf.json?v='+VISUAL_BUILD,
    g=>finish(g),undefined,e=>finish(null,e.message||'network error'));
};
wardrobePrefetch=function(){
  const want=[];
  const add=n=>{if(!want.includes(n))want.push(n);};
  if(S&&S.p)both().forEach(i=>wardrobeNames(lookFor(i)).forEach(add));
  Object.values(WARDROBE.hair).forEach(add);Object.values(WARDROBE.outfits).flat().forEach(add);
  const next=()=>{const n=want.shift();if(!n){if(S&&players.length)spawnNPCs();return;}
    wardrobeLoad(n,g=>{
      if(g&&S&&S.p){both().forEach(i=>{
        if(!wardrobeNames(lookFor(i)).includes(n))return;
        if(players[i])refreshAvatar(i);
        const pv=document.getElementById('pv3d'+i);if(pv)mountPreview(pv,lookFor(i));
      });}
      
      if(S&&S.setup&&/^p[01]$/.test(S.setup.step))thumbsLater(Number(S.setup.step[1]));
      next();
    });
  };next();
};

const v21Outfit=heroOutfit;
heroOutfit=function(look){
  const fit=v21Outfit(look);
  if(look.outfit==='kaftan')fit.bottom=fit.top;
  return fit;
};

// Frame a complete carrying interaction within the usable area of each viewport.
// Bounds include shoes, hair and the sofa, independent of portrait/landscape.
const v21Right=new THREE.Vector3(CAM_DIR.z,0,-CAM_DIR.x).normalize();
const v21Up=new THREE.Vector3().crossVectors(CAM_DIR,v21Right).normalize();
const v21Dist=[8.2,8.2];
function v21JointView(){return false;} // v20 uses independently framed split views
function v21Viewport(i){
  const single=singleIdx()>=0||v21JointView(),portrait=innerHeight>innerWidth;
  const shortTouch=navigator.maxTouchPoints>0&&!portrait&&innerHeight<=520;
  return {w:single||portrait?innerWidth:Math.floor(innerWidth/2),
    h:single||!portrait?innerHeight:Math.floor(innerHeight/2),
    top:shortTouch?88:(single||!portrait||i===0?100:62),
    bottom:shortTouch?150:navigator.maxTouchPoints>0&&(single||!portrait||i===1)?224:96};
}
function v21InteractionPoints(i,joint){
  const pts=[];
  const addBox=(mn,mx)=>{for(const x of [mn.x,mx.x])for(const y of [mn.y,mx.y])for(const z of [mn.z,mx.z])pts.push(new THREE.Vector3(x,y,z));};
  (joint?players:[players[i]]).forEach(p=>{
    const pos=p.g.position,y=p.y||0;
    addBox(new THREE.Vector3(pos.x-.44,y-.06,pos.z-.36),new THREE.Vector3(pos.x+.44,y+1.98,pos.z+.36));
  });
  if(joint){sofa.g.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(sofa.g);addBox(bb.min,bb.max);}
  return pts;
}
updateCameras=function(dt){
  if(players.length<2)return;
  const joint=!!(sofa&&sofa.carrying),alpha=1-Math.pow(.002,dt);
  for(let i=0;i<2;i++){
    const vp=v21Viewport(i),pts=v21InteractionPoints(i,joint);
    const bounds=new THREE.Box3().setFromPoints(pts),centre=bounds.getCenter(new THREE.Vector3());
    const tanV=Math.tan(THREE.MathUtils.degToRad(cams[i].fov/2)),tanH=tanV*vp.w/vp.h;
    const usableY=Math.max(.30,1-(vp.top+vp.bottom)/vp.h),usableX=.82;
    const screenY=(vp.bottom-vp.top)/vp.h;
    let fit=joint?5.5:(innerHeight>innerWidth?7.1:7.3);
    pts.forEach(p=>{const q=p.clone().sub(centre),depth=q.dot(CAM_DIR);
      fit=Math.max(fit,depth+Math.abs(q.dot(v21Right))/(tanH*usableX),depth+Math.abs(q.dot(v21Up))/(tanV*usableY));
    });
    fit+=joint?.45:.10;
    // Widen immediately; ease back in after a carry ends.
    v21Dist[i]=fit>v21Dist[i]?fit:lerp(v21Dist[i],fit,alpha);
    const aim=centre.clone().addScaledVector(v21Up,-screenY*v21Dist[i]*tanV);
    focus[i].lerp(aim,joint?Math.max(alpha,.35):alpha);
    const target=focus[i].clone().addScaledVector(CAM_DIR,v21Dist[i]);
    camPosS[i].copy(target);cams[i].position.copy(target);cams[i].lookAt(focus[i]);
  }
  camFocus.copy(focus[0]).add(focus[1]).multiplyScalar(.5);camFocus.y=0;
  const sep=players[0].g.position.distanceTo(players[1].g.position),half=Math.max(15,sep/2+12);
  const sc=sun.shadow.camera;
  if(Math.abs(sc.right-half)>.5){sc.left=-half;sc.right=half;sc.top=half;sc.bottom=-half;sc.updateProjectionMatrix();}
  sun.target.position.copy(camFocus);sun.position.copy(camFocus).addScaledVector(sunDir,40);
};

// Merge small, curved leaf silhouettes into two meshes per tree. No faceted
// sphere crowns or hundreds of leaf draw calls. Tree positions/colliders stay put.
tree=function(x,z,h,c){
  h=h||3;const positions=[],colors=[],indices=[];
  const bark=mat('#76513A');
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.085,.16,h*.64,9),bark);
  trunk.position.set(x,h*.32,z);trunk.castShadow=true;scene.add(trunk);
  let seed=((x*971+z*577+h*97)*1000)|0;
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
  const palette=['#315F43','#48764D','#5D8656','#789565'].map(s=>new THREE.Color(s));
  const clusters=[[-.32,.70,.04],[.32,.79,-.12],[-.05,.94,.09],[.08,.69,.37]];
  for(const [cx,cy,cz] of clusters){
    const target=new THREE.Vector3(x+cx*h,h*cy,z+cz*h);
    const start=new THREE.Vector3(x,h*.48,z),delta=target.clone().sub(start);
    const branch=new THREE.Mesh(new THREE.CylinderGeometry(.025,.065,delta.length(),6),bark);
    branch.position.copy(start).addScaledVector(delta,.5);branch.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());branch.castShadow=true;scene.add(branch);
    const count=qLite()?42:74;
    for(let k=0;k<count;k++){
      const theta=rand()*Math.PI*2,r=Math.sqrt(rand())*h*.28,yy=(rand()-.5)*h*.26;
      const centre=new THREE.Vector3(target.x+Math.cos(theta)*r,target.y+yy,target.z+Math.sin(theta)*r);
      const len=h*(.070+rand()*.055),wide=len*.40;
      const axis=new THREE.Vector3(Math.cos(theta),.25+rand()*.7,Math.sin(theta)).normalize();
      const across=new THREE.Vector3(-Math.sin(theta),0,Math.cos(theta));
      const col=palette[Math.floor(rand()*palette.length)],startIdx=positions.length/3;
      const coords=[[0,0,0],[.25,-1,.11],[.52,-.78,.15],[1,0,0],[.52,.78,.15],[.25,1,.11],[.46,0,.22]];
      coords.forEach(([along,side,bend])=>{const p=centre.clone().addScaledVector(axis,(along-.5)*len).addScaledVector(across,side*wide);p.y+=bend*len;positions.push(p.x,p.y,p.z);colors.push(col.r,col.g,col.b);});
      for(let j=0;j<6;j++)indices.push(startIdx+6,startIdx+j,startIdx+(j+1)%6);
    }
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
  const leaf=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));leaf.castShadow=true;scene.add(leaf);fadeable(leaf);
};

bougainvillea=function(x,z,r,h,noObs){
  r=r||.8;h=h||1.1;const g=new THREE.Group();g.name='bougainvillea_v21';g.position.set(x,0,z);
  const pos=[],col=[],idx=[];let seed=((x*739+z*311)*1000)|0;
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
  const greens=['#335B38','#477846','#608949'].map(c=>new THREE.Color(c));
  const pinks=['#B93D72','#D15689','#E27CA2'].map(c=>new THREE.Color(c));
  const blade=(centre,angle,len,width,color)=>{
    const a=new THREE.Vector3(Math.cos(angle),.35,Math.sin(angle)).normalize(),b=new THREE.Vector3(-Math.sin(angle),0,Math.cos(angle)),base=pos.length/3;
    [[-.5,0,0],[0,-1,0],[.5,0,0],[0,1,0],[0,0,.18]].forEach(([t,s,bend])=>{const p=centre.clone().addScaledVector(a,t*len).addScaledVector(b,s*width);p.y+=bend*len;pos.push(p.x,p.y,p.z);col.push(color.r,color.g,color.b);});
    idx.push(base,base+1,base+4,base+1,base+2,base+4,base+2,base+3,base+4,base+3,base,base+4);
  };
  for(let b=0;b<5;b++){
    const angle=b*2.4,reach=r*(.4+rand()*.35);
    const end=new THREE.Vector3(Math.cos(angle)*reach,h*(.7+rand()*.35),Math.sin(angle)*reach);
    const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,.05,0),new THREE.Vector3(end.x*.4,h*.65,end.z*.4),end);
    const branch=new THREE.Mesh(new THREE.TubeGeometry(curve,5,.012,5,false),mat('#765035'));branch.castShadow=true;g.add(branch);
    for(let k=0;k<(qLite()?32:48);k++){
      const a=rand()*Math.PI*2,rr=Math.sqrt(rand())*r*.43;
      const centre=end.clone().add(new THREE.Vector3(Math.cos(a)*rr,(rand()-.5)*h*.44,Math.sin(a)*rr));
      blade(centre,a,.20+rand()*.12,.065,greens[Math.floor(rand()*3)]);
      if(k%5===0){for(let j=0;j<3;j++)blade(centre.clone().add(new THREE.Vector3(0,.065,0)),a+j*2.1,.12,.052,pinks[Math.floor(rand()*3)]);}
    }
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(idx);geo.computeVertexNormals();
  const leaves=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));leaves.castShadow=true;g.add(leaves);fadeable(leaves);scene.add(g);
  if(!noObs)addObs(x-r*.7,x+r*.7,z-r*.7,z+r*.7);
  return g;
};

const v21UpdateHUD=updateHUD;
updateHUD=function(){
  v21UpdateHUD();if(!S||!S.p||!players.length)return;
  const items=document.querySelectorAll('#tasklist li');let shown=false;
  items.forEach(li=>{const show=!shown&&!li.classList.contains('done');li.hidden=!show;if(show)shown=true;});
  if(!shown&&items.length)items[items.length-1].hidden=false;
};

const v21BuildWorld=buildWorld;
buildWorld=function(){
  v21BuildWorld();
  // Fill lifts faces out of the morning shadows without washing out materials.
  amb.intensity=.34;sun.shadow.normalBias=.014;sun.shadow.radius=2;
};

const v21PropInstance=propInstance;
propInstance=function(name,opts){
  const inst=v21PropInstance(name,opts);if(!inst)return inst;
  inst.traverse(o=>{if(!o.isMesh||o.material.name!=='teal_fabric')return;
    const m=o.material.clone();m.color.set('#69B4AE');m.roughness=.92;o.material=m;
  });return inst;
};
const v21PropSofa=propSofa;
propSofa=function(){
  v21PropSofa();if(!sofa||!sofa.g.userData.propped)return;
  // The visible catalogue sofa is slightly deeper than the old block sofa.
  sofa.L=1.657;sofa.W=.837;
};

// Named neighbours share the main model; distant background walkers keep the
// existing lighter body. Each neighbour owns its skeleton and animation mixer.
spawnNPCs=function(){
  Object.keys(npcs).forEach(k=>scene.remove(npcs[k].g));npcs={};
  for(const k in CAST){
    const look=Object.assign({},CAST[k].look,{rig:'hero'});
    const g=makeAvatar(look);npcs[k]={g,k,t:Math.random()*5};scene.add(g);
  }
  placeNPCs();
};
// Report both actors rather than retaining the old "Player 1" assumption.
heroHairLine=function(){
  return players.map((p,i)=>{if(p.g.rig!=='hero')return ` Player ${i+1}: fallback body.`;
    const r=heroHairReport(p.g),w=p.g.hero.wardrobe||{};
    return ` Player ${i+1}: modelled body; hair ${esc(w.hair||'fallback')}; clothes ${esc((w.garments||[]).join(', ')||'base slots')}.`;
  }).join('');
};

// Keep dark hair dark under the warm PBR environment, with restrained specular
// highlights. Face, scalp-part and fabric colours retain their own materials.
const v21Equip=wardrobeEquip;
wardrobeEquip=function(g,look,fit,skin,hairC){
  const result=v21Equip(g,look,fit,skin,hairC);
  g.traverse(o=>{if(o.isMesh&&/^wearhair_/.test(o.name)&&/^hair/.test(o.material.name)){
    o.material.color.setRGB(.024,.020,.016);o.material.roughness=.88;
  }});return result;
};

// Keep the selected skin range readable under the inherited bright lighting.
// The partial linearisation is an art calibration for this renderer/exposure;
// it is deliberately local to skin, rather than changing the entire palette.
const v21MakeHero=makeHeroAvatar;
makeHeroAvatar=function(look){
  const g=v21MakeHero(look);if(!g)return g;
  g.traverse(o=>{if(!o.isMesh)return;
    for(const m of (Array.isArray(o.material)?o.material:[o.material])){
      if(m.name==='skin'||m.name==='skin_dark'){
        const selected=m.color.clone();m.color.convertSRGBToLinear().lerp(selected,.30);
      }
    }
  });return g;
};

// Three normally resets this counter for each render call. A split-screen
// frame renders twice, so the menu needs the sum of both views.
const v21Frame=renderFrame;
renderFrame=function(){
  if(renderer){renderer.info.autoReset=false;renderer.info.reset();}
  v21Frame();
};

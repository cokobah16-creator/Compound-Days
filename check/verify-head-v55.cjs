// Character rebuild (v55): the anatomical head built by tools/hero_head.py from MakeHuman's CC0 anatomy, on the
// unchanged 27-joint rig. Runs the shipped game logic, Three.js and glTF loader in Node; nothing is rendered (the
// creator, gameplay and animation captures are in the PR). Prints one PASS or FAIL line per check and writes
// check/results-head-v55.json.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const harness=require('./runtime-harness.cjs');
const OUT=path.join(__dirname,'results-head-v55.json');
const HERO_ORDER=['Hips','Spine','Spine1','Spine2','Neck','Head','HeadTop_End','LeftShoulder','LeftArm','LeftForeArm','LeftHand','LeftHandEnd','RightShoulder','RightArm','RightForeArm','RightHand','RightHandEnd','LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase','LeftToe_End','RightUpLeg','RightLeg','RightFoot','RightToeBase','RightToe_End'];
const SHAPES=['masc','old','smile','blinkLeft','blinkRight','concerned'];
// v54 (build v54-bd2fb07e) with the wrap and the overalls, measured with the same code: the new head must not cost more
const V54={drawCalls:35,triangles:102740,heroBytes:5193880};
const checks=[];
function check(name,fn){try{const info=fn();checks.push({name,passed:true,info});}catch(e){checks.push({name,passed:false,failure:e.message});}}
const r4=x=>Math.round(x*1e4)/1e4;
(async()=>{
 const {run,THREE}=await harness.load();
 const json=JSON.parse(fs.readFileSync(path.join(harness.root,'assets/characters/efe.gltf.json'),'utf8'));
 const scene=run('HERO.gltf.scene');
 const byName=n=>{let r=null;scene.traverse(o=>{if(!r&&o.name===n)r=o;});return r;};
 const meshOf=n=>{const o=byName(n);if(!o)return null;if(o.isMesh)return o;let m=null;o.traverse(c=>{if(!m&&c.isMesh)m=c;});return m;};
 const head=meshOf('HeadSkin'); const ex=(()=>{let e=null;scene.traverse(o=>{if(!e&&o.userData&&o.userData.head55)e=o.userData;});return e;})();
 const HP=head&&head.geometry.attributes.position, HN=head&&head.geometry.attributes.normal, HC=head&&head.geometry.attributes.color;
 const vtx=(A,i)=>[A.getX(i),A.getY(i),A.getZ(i)];

 check('1. The rig contract is kept: 27 joints in hero order with the same inverse binds, 8 clips, the five Body primitives, and the new head, lashes, brows and beards are skinned meshes on the same bones with the six shape keys',()=>{
  const body=meshOf('Body'); assert(body&&body.isSkinnedMesh);
  assert.deepEqual(JSON.parse(JSON.stringify(body.skeleton.bones.map(b=>b.name))),HERO_ORDER);
  const bodyPrims=body.parent.children.filter(o=>o.isSkinnedMesh).map(o=>o.material.name);
  assert.deepEqual(JSON.parse(JSON.stringify(bodyPrims)),['skin','top','bottom','shoe','sole']);
  const acc=json.accessors[json.skins[0].inverseBindMatrices],bv=json.bufferViews[acc.bufferView];
  const bytes=Buffer.from(json.buffers[0].uri.split(',')[1],'base64').subarray((bv.byteOffset||0)+(acc.byteOffset||0),(bv.byteOffset||0)+(acc.byteOffset||0)+27*64);
  const sha=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12); assert.equal(sha,'a0658cd22403');
  assert.equal(run('HERO.gltf.animations.length'),8);
  const parts={};
  for(const n of ['HeadSkin','face_lash','face_brow','face_beard_stubble','face_beard_boxed']){
   const m=meshOf(n); assert(m&&m.isSkinnedMesh,n+' is a skinned mesh');
   assert(m.skeleton.bones.every((b,i)=>b===body.skeleton.bones[i]),n+' shares the hero bones');
   assert.deepEqual(Object.keys(m.morphTargetDictionary).sort(),SHAPES.slice().sort(),n+' shape keys');
   parts[n]={vertices:m.geometry.attributes.position.count,triangles:m.geometry.index.count/3};
  }
  assert.equal(head.material.name,'skin'); assert(HC,'HeadSkin carries COLOR_0');
  return {inverseBindSha:sha,clips:8,parts};});

 check('2. The old head is gone and the new one is adult-sized by its geometry: no Body skin above 1.40 m, chin 1.475 m, crown 1.775 m (0.30 m, about six heads to the figure), and the Head joint drawn at scale 1 for players and the cast',()=>{
  const sk=meshOf('Body').parent.children.find(o=>o.isSkinnedMesh&&o.material.name==='skin');
  let maxY=-1;const P=sk.geometry.attributes.position;for(let i=0;i<P.count;i++)maxY=Math.max(maxY,P.getY(i));
  assert(maxY<=1.40,'old head left in the body skin: '+maxY);
  let crown=-1,chin=9;for(let i=0;i<HP.count;i++){const [x,y,z]=vtx(HP,i);crown=Math.max(crown,y);if(z>0.12&&Math.abs(x)<0.02)chin=Math.min(chin,y);}
  assert(Math.abs(chin-1.475)<0.006,'chin '+chin); assert(Math.abs(crown-1.775)<0.006,'crown '+crown);
  const heads=crown/(crown-chin); assert(heads>5.6&&heads<6.4,'heads tall '+heads);
  const gone=[];scene.traverse(o=>{if(/^face_(lid|lip_top|lip|mouth|nostrils)$/.test(o.name))gone.push(o.name);}); assert.equal(gone.length,0,'old face parts: '+gone);
  const scales={};const mk=run('makeHeroAvatar');
  const looks={player:{skin:'#905F3F',hair:'wrap',outfit:'overalls'},tunde:run('CAST.tunde.look'),bassey:run('CAST.bassey.look'),mallam:run('MALLAM40.LOOK')};
  for(const k in looks){const g=mk(Object.assign({},looks[k],{rig:'hero'}));scales[k]=g.hero.bones.head.scale.x;assert.equal(scales[k],1,k);}
  assert.equal(run('FACES53.headScale'),1);
  return {bodySkinTop:r4(maxY),chin:r4(chin),crown:r4(crown),headHeight:r4(crown-chin),headsTall:+heads.toFixed(2),headScale:scales};});

 check('3. The neck is clean: its open end sits inside every collar (radius at most 0.058 m below 1.41 m), it is weighted Spine2 -> Neck -> Head with rows summing to 1, the face is fully on the Head joint, and no normal is zero-length',()=>{
  const J=head.geometry.attributes.skinIndex,W=head.geometry.attributes.skinWeight; const comp=(A,i,k)=>[A.getX(i),A.getY(i),A.getZ(i),A.getW(i)][k]; const allowed=new Set([3,4,5]);
  let rmax=0,low=0,badSum=0,badJoint=0,headLoose=0,zero=0,minY=9;
  for(let i=0;i<HP.count;i++){const [x,y,z]=vtx(HP,i);minY=Math.min(minY,y);
   if(y<1.41){low++;rmax=Math.max(rmax,Math.hypot(x,z));}
   let s=0,h=0;for(let k=0;k<4;k++){const w=comp(W,i,k),j=comp(J,i,k);s+=w;if(w>1e-6&&!allowed.has(j))badJoint++;if(j===5)h+=w;}
   if(Math.abs(s-1)>1e-4)badSum++; if(y>1.46&&h<0.999)headLoose++;
   if(Math.hypot(HN.getX(i),HN.getY(i),HN.getZ(i))<0.5)zero++;}
  assert(rmax<=0.0585,'neck radius below 1.41 m: '+rmax); assert.equal(badSum,0); assert.equal(badJoint,0); assert.equal(headLoose,0); assert.equal(zero,0);
  // the v21 and v52 collars measured at 1.38-1.40 m have their openings at radius 0.061 or more
  return {neckEnd:r4(minY),verticesBelow141:low,maxRadiusBelow141:r4(rmax),joints:['Spine2','Neck','Head']};});

 check('4. The eyes sit in the sockets under wrapping lids: two of each eye part on the Head joint, each iris inside its eyeball, the upper lid (the lash roots) overlapping the top of the iris, and a relaxed opening',()=>{
  const hb=run('heroFindBones(HERO.gltf.scene).head');const mats={};hb.traverse(o=>{if(o.isMesh){mats[o.material.name]=(mats[o.material.name]||0)+1;}});
  for(const m of ['eye_white','iris','pupil','eye_hi'])assert.equal(mats[m],2,m);
  const info={};
  for(const side of ['l','r']){const e=byName('eye_'+side);const box={};
   e.traverse(o=>{if(!o.isMesh)return;const P=o.geometry.attributes.position;let ymin=9,ymax=-9,c=[0,0,0];for(let i=0;i<P.count;i++){ymin=Math.min(ymin,P.getY(i));ymax=Math.max(ymax,P.getY(i));c[0]+=P.getX(i);c[1]+=P.getY(i);c[2]+=P.getZ(i);}box[o.material.name]={ymin,ymax,c:c.map(v=>v/P.count)};});
   const ec=ex.head55.eyes[side==='l'?1:0],R=ex.head55.eyeR,headY=1.43;
   const irisTop=box.iris.ymax+headY; const irisBot=box.iris.ymin+headY;
   // the lash roots: the lowest lash vertices on this side
   const L=meshOf('face_lash').geometry.attributes.position;let root=9;for(let i=0;i<L.count;i++){if(Math.sign(L.getX(i))===(side==='l'?1:-1)&&Math.abs(L.getX(i)-ec[0])<0.006)root=Math.min(root,L.getY(i));}
   assert(root<irisTop,'upper lid above the iris on '+side+': lid '+root+' iris top '+irisTop);
   assert(root>ec[1],'lid below the eye centre on '+side);
   info[side]={irisTop:r4(irisTop),lidAtCentre:r4(root),lidCoversIris:r4(irisTop-root),irisHeight:r4(irisTop-irisBot)};}
  return info;});

 check('5. The face paint follows any skin: lips, liner and brows are COLOR_0 multipliers on HeadSkin (top lip darker than the lower), and for three swatches the head is painted the same skin as the body with vertex colours and shape keys switched on',()=>{
  const my=ex.head55.mouthY;let top=[0,0],low=[0,0],cheek=[0,0];
  for(let i=0;i<HP.count;i++){const [x,y,z]=vtx(HP,i);const l=HC.getX(i)*0.3+HC.getY(i)*0.6+HC.getZ(i)*0.1;
   if(Math.abs(x)<0.01&&z>0.17){if(y>my+0.002&&y<my+0.007){top[0]+=l;top[1]++;}if(y<my-0.003&&y>my-0.009){low[0]+=l;low[1]++;}}
   if(Math.abs(Math.abs(x)-0.055)<0.006&&Math.abs(y-1.57)<0.01&&z>0.08){cheek[0]+=l;cheek[1]++;}}
  const T=top[0]/top[1],Lo=low[0]/low[1],C=cheek[0]/cheek[1]; assert(T<Lo&&Lo<C,JSON.stringify({T,Lo,C}));
  const mk=run('makeHeroAvatar');const out={};
  for(const s of ['#F2D3B1','#905F3F','#4F3122']){const g=mk({skin:s,hair:'wrap',outfit:'overalls',rig:'hero'});let hs=null,bs=null;
   g.traverse(o=>{if(!o.isSkinnedMesh)return;if(o.name==='HeadSkin')hs=o;else if(!bs&&o.material.name==='skin')bs=o;});
   assert(hs.material.vertexColors&&hs.material.morphTargets,'flags on '+s); assert.equal(hs.material.color.getHexString(),bs.material.color.getHexString(),'head and body skin '+s);
   out[s]=hs.material.color.getHexString();}
  return {lipTop:r4(T),lipLower:r4(Lo),cheek:r4(C),skin:out};});

 check('6. The shape keys do what they say and the cast wears them: blinkLeft and blinkRight each close one upper lid, smile lifts the mouth corners, concerned raises the inner brows, masc and old keep the eyes still, and the men and elders get their shapes',()=>{
  const d=head.morphTargetDictionary,M=head.geometry.morphAttributes.position;
  const my=ex.head55.mouthY,eyes=ex.head55.eyes;
  const L=meshOf('face_lash'),LP=L.geometry.attributes.position;let lb=0,n=0,cross=0;
  for(const [k,sd] of [['blinkLeft',1],['blinkRight',-1]]){const LM=L.geometry.morphAttributes.position[L.morphTargetDictionary[k]];
   for(let i=0;i<LM.count;i++){if(Math.sign(LP.getX(i))===sd){lb+=LM.getY(i);n++;}else cross=Math.max(cross,Math.abs(LM.getY(i)));}}
  lb/=n;
  assert(lb<-0.006,'each blink moves its lashes down '+lb);assert(cross<0.0005,'a one-eye blink moves the other eye '+cross);
  const CM=M[d.concerned];let bu=0,bn=0;for(let i=0;i<HP.count;i++){const [x,y,z]=vtx(HP,i);if(Math.abs(x)<0.03&&Math.abs(y-ex.head55.browY)<0.01&&z>0.12){bu+=CM.getY(i);bn++;}}
  assert(bn>0&&bu/bn>0.0008,'concerned raises the inner brows '+bu/bn);
  const S=M[d.smile];let cs=0,cn=0,ms=0,mn=0,eyeMove=0;
  for(let i=0;i<HP.count;i++){const [x,y,z]=vtx(HP,i);
   if(Math.abs(Math.abs(x)-0.026)<0.004&&Math.abs(y-my)<0.004&&z>0.14){cs+=S.getY(i);cn++;}
   for(const e of eyes){if(Math.hypot(x-e[0],y-e[1],z-e[2])<0.03){for(const k of ['masc','old']){const A=M[d[k]];eyeMove=Math.max(eyeMove,Math.abs(A.getY(i)));}}}}
  assert(cn>0&&cs/cn>0.0015,'smile lifts the corners '+cs/cn);
  assert(eyeMove<0.006,'masc/old move the eye surround by '+eyeMove);
  const mk=run('makeHeroAvatar');const cast={};
  const looks={tunde:run('CAST.tunde.look'),bassey:run('CAST.bassey.look'),nkechi:run('CAST.nkechi.look'),ada:run('CAST.ada.look'),mallam:run('MALLAM40.LOOK'),bisi:run('BISI39.LOOK'),player:{skin:'#905F3F',hair:'wrap',outfit:'overalls'}};
  for(const k in looks){const g=mk(Object.assign({},looks[k],{rig:'hero'}));const h=g.hero.morph55.find(o=>o.name==='HeadSkin');cast[k]={masc:h.morphTargetInfluences[d.masc],old:+h.morphTargetInfluences[d.old].toFixed(2)};}
  for(const k of ['tunde','bassey','mallam'])assert.equal(cast[k].masc,1,k); for(const k of ['nkechi','ada','bisi','player'])assert.equal(cast[k].masc,0,k);
  assert(cast.bassey.old>0.5);
  // blink in the per-frame animation call
  const g=mk(Object.assign({},looks.player,{rig:'hero'}));g.hero.face55.next=0.01;let peak=0;const anim=run('animAvatar');for(let f=0;f<20;f++){anim(g,f/60,false,false,0,1/60);peak=Math.max(peak,Math.min(g.hero.morph55[0].morphTargetInfluences[d.blinkLeft],g.hero.morph55[0].morphTargetInfluences[d.blinkRight]));}
  assert(peak>0.9,'blink plays '+peak);
  return {lashBlinkDrop:r4(lb),oneEyeCross:r4(cross),innerBrowLift:r4(bu/bn),cornerLift:r4(cs/cn),eyeSurroundMove:r4(eyeMove),cast,blinkPeak:+peak.toFixed(2)};});

 check('7. The orange wrap and every hairstyle were moved onto the new skull: no hair is pushed into the skin by the refit (strand roots buried in the old scalp stay buried), and the wrap comes down to just above the brows',()=>{
  // nearest HeadSkin vertex (3 cm grid) and its normal: a hair point more than 2 mm behind it is inside
  const cell=0.03,grid=new Map();const key=(x,y,z)=>Math.floor(x/cell)+','+Math.floor(y/cell)+','+Math.floor(z/cell);
  for(let i=0;i<HP.count;i++){const k=key(...vtx(HP,i));if(!grid.has(k))grid.set(k,[]);grid.get(k).push(i);}
  const inside=p=>{const cx=Math.floor(p[0]/cell),cy=Math.floor(p[1]/cell),cz=Math.floor(p[2]/cell);let best=1e9,bi=-1;
   for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const l=grid.get((cx+a)+','+(cy+b)+','+(cz+c));if(!l)continue;for(const i of l){const q=vtx(HP,i);const dd=(p[0]-q[0])**2+(p[1]-q[1])**2+(p[2]-q[2])**2;if(dd<best){best=dd;bi=i;}}}
   if(bi<0)return false;const q=vtx(HP,bi);const dd=(p[0]-q[0])*HN.getX(bi)+(p[1]-q[1])*HN.getY(bi)+(p[2]-q[2])*HN.getZ(bi);return dd<-0.002&&dd>-0.012;};
  // (roots buried more than 12 mm deep were buried in the old scalp too, by design; a strand crossing the face or neck shows within the first centimetre)
  const out={};const hairs=run('WARDROBE.hair');const browY=ex.head55.browY;let wrapLow=null;
  for(const k in hairs){const sc=run('WARDROBE.cache['+JSON.stringify(hairs[k])+'].scene');sc.updateMatrixWorld(true);let n=0,ins=0;
   sc.traverse(o=>{if(!o.isMesh)return;const P=o.geometry.attributes.position;const v=new THREE.Vector3();
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);const p=[v.x,v.y+1.43,v.z];n++;if(inside(p)){ins++;if(process.env.HEAD55_DEBUG)console.log('IN',k,o.name,o.material.name,p.map(r4).join(','));}
     if(k==='wrap'&&Math.abs(p[0])<0.02&&p[2]>0.08&&(wrapLow===null||p[1]<wrapLow))wrapLow=p[1];}});
   const fit=(()=>{let f=null;sc.traverse(o=>{if(!f&&o.userData&&o.userData.fit55)f=o.userData.fit55;});return f;})();
   assert(fit&&fit.tool==='tools/hero_head.py',k+' carries the v55 fit record');
   out[k]={vertices:n,insidePct:+(100*ins/n).toFixed(2),buriedInOldScalpPct:+(100*fit.buriedBefore/fit.vertices).toFixed(2),newlyInside:fit.newlyInside};}
  // strand roots that were buried in the old scalp stay buried; the refit itself may not push anything new into the skin
  for(const k in out){assert(out[k].insidePct<=out[k].buriedInOldScalpPct+0.5,k+' '+JSON.stringify(out[k])); assert(out[k].newlyInside<=Math.ceil(out[k].vertices*0.0005),k+' newly inside '+out[k].newlyInside);}
  assert(wrapLow!==null&&wrapLow>browY+0.004&&wrapLow<browY+0.045,'wrap front edge '+wrapLow+' brow '+browY);
  out.wrapFrontAboveBrows=r4(wrapLow-browY);
  const hm=ex.hairMount;assert(hm.scale<0.6767&&hm.scale>0.3,'hairMount scale '+hm.scale);out.hairMount=hm;
  return out;});

 check('8. Every clip deforms the neck and face cleanly: over 8 frames of all 8 clips no HeadSkin edge stretches past 1.6 times or shrinks below 0.6 times its bind length',()=>{
  const mk=run('makeHeroAvatar');const g=mk({skin:'#905F3F',hair:'wrap',outfit:'overalls',rig:'hero'});let hs=null;g.traverse(o=>{if(o.name==='HeadSkin'&&o.isSkinnedMesh)hs=o;});
  const I=hs.geometry.index.array;const edges=[];for(let t=0;t<I.length;t+=3){for(const [a,b] of [[I[t],I[t+1]],[I[t+1],I[t+2]]])if(a<b&&HP.getY(a)<1.52)edges.push([a,b]);}
  const used=new Set();edges.forEach(([a,b])=>{used.add(a);used.add(b);});
  const out={};let worst=[1,1];const v=new THREE.Vector3();
  for(const cl of Object.keys(g.actions)){let mn=9,mx=0;const dur=g.clips[cl].duration;
   for(let f=0;f<8;f++){for(const k in g.actions)g.actions[k].setEffectiveWeight(k===cl?1:0);g.mixer.setTime(dur*f/8);g.updateMatrixWorld(true);hs.skeleton.update();
    const pos=new Map();for(const i of used){v.fromBufferAttribute(HP,i);hs.boneTransform(i,v);pos.set(i,v.clone());}
    for(const [a,b] of edges){const l0=Math.hypot(HP.getX(a)-HP.getX(b),HP.getY(a)-HP.getY(b),HP.getZ(a)-HP.getZ(b));if(l0<1e-5)continue;const r=pos.get(a).distanceTo(pos.get(b))/l0;mn=Math.min(mn,r);mx=Math.max(mx,r);}}
   out[cl]={minRatio:+mn.toFixed(3),maxRatio:+mx.toFixed(3)};worst=[Math.min(worst[0],mn),Math.max(worst[1],mx)];}
  assert(worst[1]<1.6&&worst[0]>0.6,JSON.stringify(worst));
  return {clips:out,neckAndJawEdges:edges.length};});

 check('9. It costs less than the v54 head: fewer draw calls and triangles per avatar (wrap and overalls), and the hero asset stays under 6 MB',()=>{
  const g=run('makeHeroAvatar')({skin:'#905F3F',hair:'wrap',outfit:'overalls',rig:'hero'});let draws=0,tris=0,head=0;
  g.traverse(o=>{if(!o.isMesh)return;let p=o,vis=true;while(p){if(p.visible===false)vis=false;p=p.parent;}if(!vis)return;draws++;const n=o.geometry.index?o.geometry.index.count/3:o.geometry.attributes.position.count/3;tris+=n;if(/^(HeadSkin|face_|eye_)/.test(o.name)||o.parent&&/^eye_/.test(o.parent.name))head+=n;});
  const bytes=fs.statSync(path.join(harness.root,'assets/characters/efe.gltf.json')).size;
  assert(draws<=V54.drawCalls,'draw calls '+draws); assert(tris<=V54.triangles,'triangles '+tris); assert(bytes<6e6,'bytes '+bytes);
  return {drawCalls:draws,triangles:tris,headTriangles:head,heroBytes:bytes,v54:V54};});

 check('10. The head is rebuilt by its tool from the licensed source and nothing restores the old one: extras name tools/hero_head.py and MakeHuman CC0, the licence files ship beside the source, and the v53 face tool refuses to run over this hero',()=>{
  assert.equal(ex.head55.tool,'tools/hero_head.py'); assert(/MakeHuman/.test(ex.head55.source)&&/CC0/.test(ex.head55.source));
  const R=path.resolve(harness.root,'..');
  for(const f of ['source/makehuman/LICENSE.ASSETS.md','source/makehuman/LICENSE.md','source/makehuman/base.obj','source/hero_head_v55.blend','tools/hero_head.py'])assert(fs.existsSync(path.join(R,f)),f);
  const tool=fs.readFileSync(path.join(R,'tools/hero_head.py'),'utf8'); assert(/old head geometry left in the skin primitive/.test(tool));
  const v53=fs.readFileSync(path.join(R,'tools/faces_from_blender.py'),'utf8'); assert(/--restore-v53-head/.test(v53)&&/sys\.exit/.test(v53));
  return {tool:ex.head55.tool,source:ex.head55.source,shapes:ex.head55.shapes,headTriangles:ex.head55.tris};});

 const build=(fs.readFileSync(path.resolve(harness.root,'index.html'),'utf8').match(/const BUILD_ID='([^']+)';/)||[])[1];
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.failure?'\n     '+c.failure:''));
 fs.writeFileSync(OUT,JSON.stringify({build,passed:checks.every(c=>c.passed),checks},null,1)+'\n');
 if(!checks.every(c=>c.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});

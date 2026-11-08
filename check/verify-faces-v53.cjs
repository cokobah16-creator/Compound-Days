// Neighbourhood Faces (v53, dist/src/faces-v53.js), checked against the v55 anatomical head (tools/hero_head.py).
// Checked on the real game logic in Node with the shipped Three.js and hero asset; nothing is rendered (the faces were
// looked at in Blender and in a browser, see the PR). Prints one PASS or FAIL line per check and writes
// check/results-faces-v53.json.
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const OUT=path.join(__dirname,'results-faces-v53.json');
const checks=[];
function check(name,fn){try{const info=fn();checks.push({name,passed:true,info});}catch(e){checks.push({name,passed:false,failure:e.message});}}
(async()=>{
 const {load}=require('./runtime-harness.cjs');const {run,context}=await load();
 const hero=run('HERO.gltf.scene');
 const named=n=>{let r=[];hero.traverse(o=>{if(o.name===n||o.name.startsWith(n+'_')&&/^\d+$/.test(o.name.slice(n.length+1)))r.push(o);});return r;};
 check('1. (v55) The face parts keep the names the colour passes read: two of each eye part on the Head joint, strand brows (face_brow, material hair), lashes, two beard shells and a second hoop, every face normal lit (none zero-length); the v53 lid, lip, mouth and nostril cards are gone (painted into the v55 head)',()=>{
  const head=run('heroFindBones(HERO.gltf.scene).head');const mats={};
  head.traverse(o=>{if(o.isMesh){const m=o.material.name;mats[m]=(mats[m]||0)+1;}});
  for(const m of ['eye_white','iris','pupil','eye_hi'])assert.equal(mats[m],2,m);
  const names=[];hero.traverse(o=>{if(o.isMesh)names.push(o.name.replace(/_\d+$/,''));});
  for(const n of ['face_lash','face_brow','face_beard_stubble','face_beard_boxed','face_hoop','earring','HeadSkin'])assert(names.includes(n),n);
  for(const n of ['face_lid','face_lip_top','face_lip','face_mouth','face_nostrils'])assert(!names.includes(n),n+' should be gone');
  let brow=null;hero.traverse(o=>{if(o.isMesh&&o.name==='face_brow')brow=o.material.name;});assert.equal(brow,'hair');
  const ex=run('(()=>{let e=null;HERO.gltf.scene.traverse(o=>{if(!e&&o.userData&&o.userData.head55)e=o.userData.head55;});return e;})()');assert(ex&&ex.tool==='tools/hero_head.py');
  let zero=0;hero.traverse(o=>{if(!o.isMesh||!/^(face_|HeadSkin)/.test(o.name))return;const n=o.geometry.attributes.normal.array;for(let i=0;i<n.length;i+=3)if(Math.hypot(n[i],n[i+1],n[i+2])<0.5)zero++;});
  assert.equal(zero,0,'face parts with zero-length normals');
  return {materials:mats,zeroNormals:zero};});
 check('2. Each neighbour on the sheet wears their face: beards on the suya vendor, Tunde and the elder only, hoops on the women, grey brows and hair on Mr. Bassey',()=>{
  const out={};
  const faceOf=look=>{const g=run('makeHeroAvatar')(Object.assign({},look,{rig:'hero'}));const v=n=>{let s=false;g.traverse(o=>{if(o.isMesh&&o.name.replace(/_\d+$/,'')===n&&o.visible)s=true;});return s;};
   return {stubble:v('face_beard_stubble'),boxed:v('face_beard_boxed'),hoop:v('face_hoop'),earring:v('earring'),scale:+g.hero.bones.head.scale.x.toFixed(3)};};
  for(const k of ['nkechi','tunde','ada','bassey','oyelaran'])out[k]=faceOf(run('CAST.'+k+'.look'));
  out.mallam=faceOf(run('MALLAM40.LOOK'));out.bisi=faceOf(run('BISI39.LOOK'));out.player=faceOf(run('Object.assign({},CAST.ada.look,{face53:undefined})'));
  assert(out.mallam.boxed&&!out.mallam.stubble);assert(out.tunde.stubble&&out.bassey.stubble);
  for(const k of ['nkechi','ada','oyelaran','bisi'])assert(out[k].hoop&&out[k].earring&&!out[k].stubble&&!out[k].boxed,k);
  assert(!out.player.stubble&&!out.player.boxed&&!out.player.hoop&&out.player.earring);
  for(const k in out)assert.equal(out[k].scale,1,k);   // v55: the head is sized by its geometry, the joint is not scaled
  assert.equal(run('CAST.tunde.look.hair'),'locs');assert.equal(run('CAST.ada.look.hair'),'afro');assert.equal(run('CAST.oyelaran.look.hair'),'braids');
  return out;});
 check('3. (v55) Lips are painted into the head as multipliers of the wearer\'s skin, darker on the top lip',()=>{
  const ex=run('(()=>{let e=null;HERO.gltf.scene.traverse(o=>{if(!e&&o.userData&&o.userData.head55)e=o.userData.head55;});return e;})()');
  let hs=null;hero.traverse(o=>{if(o.name==='HeadSkin'&&o.isMesh)hs=o;});const P=hs.geometry.attributes.position,C=hs.geometry.attributes.color;let t=[0,0],l=[0,0];
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i);if(Math.abs(x)>0.01||z<0.17)continue;const v=C.getX(i)*0.3+C.getY(i)*0.6+C.getZ(i)*0.1;if(y>ex.mouthY+0.002&&y<ex.mouthY+0.007){t[0]+=v;t[1]++;}if(y<ex.mouthY-0.003&&y>ex.mouthY-0.009){l[0]+=v;l[1]++;}}
  const top=t[0]/t[1],low=l[0]/l[1];assert(top<low&&low<0.9,JSON.stringify({top,low}));
  const g=run('makeHeroAvatar')(Object.assign({},run('CAST.bassey.look'),{rig:'hero'}));let skin=null,head=null;g.traverse(o=>{if(!o.isSkinnedMesh)return;if(o.name==='HeadSkin')head=o.material;else if(!skin&&o.material.name==='skin')skin=o.material;});
  assert.equal(head.color.getHexString(),skin.color.getHexString());assert(head.vertexColors);
  return {topLip:+top.toFixed(3),lowerLip:+low.toFixed(3),skin:skin.color.getHexString()};});
 check('4. (v54) Each neighbour\'s name maps to a shipped face-revision portrait, and other titles get none',()=>{
  const map={};for(const n of ['Mama Nkechi','Aunty Bisi','Mallam','Tunde','Ada','Mr. Bassey','Mrs. Oyelaran']){const id=run('PORTRAITS54.of('+JSON.stringify(n+' \u00b7 Friendly')+')');assert(id,n);assert(fs.existsSync(path.join(__dirname,'..','dist','assets','faces',id+'.webp')),id);map[n]=id;}
  for(const t of ['The sofa','Adaeze','Make yourself','Market Road'])assert.equal(run('PORTRAITS54.of('+JSON.stringify(t)+')'),null,t);
  return map;});
 const build=(fs.readFileSync(path.resolve(__dirname,'..','dist','index.html'),'utf8').match(/const BUILD_ID='([^']+)';/)||[])[1];
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.failure?'\n     '+c.failure:''));
 fs.writeFileSync(OUT,JSON.stringify({build,passed:checks.every(c=>c.passed),checks},null,1)+'\n');
 if(!checks.every(c=>c.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});

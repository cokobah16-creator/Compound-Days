// Neighbourhood Faces (v53, dist/src/faces-v53.js and the Blender-rebuilt face in assets/characters/efe.gltf.json).
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
 check('1. The rebuilt face keeps the names the colour passes read: two of each eye part, lids, lashes, strand brows, both lips, mouth line, nostrils, two beard shells and a second hoop, all on the Head joint, every face normal lit (none zero-length)',()=>{
  const head=run('heroFindBones(HERO.gltf.scene).head');const mats={};
  head.traverse(o=>{if(o.isMesh){const m=o.material.name;mats[m]=(mats[m]||0)+1;}});
  for(const m of ['eye_white','iris','pupil','eye_hi'])assert.equal(mats[m],2,m);
  for(const m of ['lip_top','lip'])assert.equal(mats[m],1,m);
  const names=[];head.traverse(o=>{if(o.isMesh)names.push(o.name.replace(/_\d+$/,''));});
  for(const n of ['face_lid','face_lash','face_brow','face_lip_top','face_lip','face_mouth','face_nostrils','face_beard_stubble','face_beard_boxed','face_hoop','earring'])assert(names.includes(n),n);
  const ex=run('(()=>{let e=null;HERO.gltf.scene.traverse(o=>{if(!e&&o.userData&&o.userData.faces53)e=o.userData.faces53;});return e;})()');assert(ex&&ex.tool==='tools/faces_from_blender.py');
  let zero=0;head.traverse(o=>{if(!o.isMesh||!/^face_/.test(o.name))return;const n=o.geometry.attributes.normal.array;for(let i=0;i<n.length;i+=3)if(Math.hypot(n[i],n[i+1],n[i+2])<0.5)zero++;});
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
  for(const k in out)assert.equal(out[k].scale,0.9,k);
  assert.equal(run('CAST.tunde.look.hair'),'locs');assert.equal(run('CAST.ada.look.hair'),'afro');assert.equal(run('CAST.oyelaran.look.hair'),'braids');
  return out;});
 check('3. Lips take the wearer\'s skin, darker on the top lip',()=>{
  const g=run('makeHeroAvatar')(Object.assign({},run('CAST.bassey.look'),{rig:'hero'}));let top=null,low=null,skin=null;
  g.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(m.name==='lip_top')top=m.color;if(m.name==='lip')low=m.color;if(o.isSkinnedMesh&&m.name==='skin'&&!skin)skin=m.color;});
  assert(top&&low&&skin);const info={skin:skin.getHexString(),top:top.getHexString(),low:low.getHexString()};assert(top.r<low.r&&top.g<low.g,JSON.stringify(info));return {skin:skin.getHexString(),top:top.getHexString(),low:low.getHexString()};});
 check('4. (v54) Each neighbour\'s name maps to a shipped face-revision portrait, and other titles get none',()=>{
  const map={};for(const n of ['Mama Nkechi','Aunty Bisi','Mallam','Tunde','Ada','Mr. Bassey','Mrs. Oyelaran']){const id=run('PORTRAITS54.of('+JSON.stringify(n+' \u00b7 Friendly')+')');assert(id,n);assert(fs.existsSync(path.join(__dirname,'..','dist','assets','faces',id+'.webp')),id);map[n]=id;}
  for(const t of ['The sofa','Adaeze','Make yourself','Market Road'])assert.equal(run('PORTRAITS54.of('+JSON.stringify(t)+')'),null,t);
  return map;});
 const build=(fs.readFileSync(path.resolve(__dirname,'..','dist','index.html'),'utf8').match(/const BUILD_ID='([^']+)';/)||[])[1];
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.failure?'\n     '+c.failure:''));
 fs.writeFileSync(OUT,JSON.stringify({build,passed:checks.every(c=>c.passed),checks},null,1)+'\n');
 if(!checks.every(c=>c.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});

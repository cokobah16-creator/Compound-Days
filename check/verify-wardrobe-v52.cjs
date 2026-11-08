// The owner's modelled wardrobe (v52, dist/src/wardrobe-v52.js and tools/wardrobe_from_blend.py). Checked on the real game
// logic in Node with the shipped Three.js, the real hero asset and the real wardrobe assets; nothing is rendered (the
// outfits were looked at in a browser, see the PR). The checks run twice in child processes and the two reports must
// match. Math.random and Date.now are stubbed; no wall-clock value reaches the results.
// Prints one PASS or FAIL line per check and writes check/results-wardrobe-v52.json.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process');
const OUT=path.join(__dirname,'results-wardrobe-v52.json');
const WARD=path.join(__dirname,'..','dist','assets','wardrobe');
const NAMES=[
 '1. Twelve outfits in the creator, the six existing ones first; every outfit lists its modelled clothes, any jewellery and one of seven footwear styles, and every file is there',
 '2. Every modelled asset is skinned to the hero\'s 27 joints and says what it is: clothes keep the base top and bottom on as skin, footwear replaces the base shoe and sole, open shoes carry a skin foot',
 '3. Every outfit dresses the hero: all its pieces are equipped, the base top and bottom turn to the wearer\'s skin, the base shoes are hidden, and no base clothing colour is left showing',
 '4. A look still built before the wardrobe arrives (or without it) falls back to the painted body as before',
 '5. Random looks keep the original six outfits, and the creator offers all twelve',
 '6. A worn kit shoe still replaces the outfit\'s modelled footwear',
 '7. Determinism: two runs give identical reports'];

function inner(){
 const {load}=require('./runtime-harness.cjs');const checks=[];
 (async()=>{
  const {run}=await load();
  const J=c=>JSON.parse(run('JSON.stringify('+c+')'));
  run("Math.random=(()=>{let s=17;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;");
  run("var PH52='';{const op=openPanel;openPanel=function(h){PH52=String(h);return op.apply(this,arguments);};}");
  run("buildTextures();buildTextures2();buildWorld();");
  run("NET.on=false;_silent=false;dispatch('newgame');S.p[0].name='Efe';S.p[1].name='Kola';");
  const step=(i,fn)=>{const name=NAMES[i];try{const info=fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});}catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e)});}};
  const ids=J('OUTFITS.map(o=>o.id)');

  step(0,()=>{assert.deepEqual(ids,['tee','office','ankara','track','kaftan','lounge','skirtset','overalls','jumpsuit','linen','utility','wrapdress']);
   const sets=J('WARDROBE.outfits');const styles=new Set();
   for(const id of ids){const s=sets[id];assert.ok(Array.isArray(s),id);assert.equal(s[0],'cd_'+id,id+' clothes first');
    const feet=s.filter(n=>/^cd_shoes_/.test(n));assert.equal(feet.length,1,id+' one footwear');styles.add(feet[0]);
    for(const n of s)assert.ok(fs.existsSync(path.join(WARD,n+'.gltf.json')),n);}
   assert.equal(styles.size,7);return {sets:ids.map(id=>id+': '+sets[id].join(' '))};});

  step(1,()=>{const out={};const names=[...new Set(ids.flatMap(id=>J(`WARDROBE.outfits[${JSON.stringify(id)}]`)))].sort();
   for(const n of names){const r=J(`(()=>{const g=WARDROBE.cache[${JSON.stringify(n)}];const ex=wardrobeExtras(g);let joints=0,meshes=0,mats=[];g.scene.traverse(o=>{if(o.isSkinnedMesh){meshes++;joints=Math.max(joints,o.skeleton.bones.length);const m=Array.isArray(o.material)?o.material:[o.material];m.forEach(x=>mats.push(x.name));}});return {kind:ex.kind,slots:ex.slots,skinUnder:ex.skinUnder||null,joints,meshes,mats:[...new Set(mats)].sort()};})()`);
    assert.equal(r.joints,27,n+' joints');assert.ok(r.meshes>0&&r.meshes<=6,n+' merged by material ('+r.meshes+')');
    if(/^cd_shoes_/.test(n)){assert.equal(r.kind,'feet',n);assert.deepEqual(r.slots,['shoe','sole'],n);assert.equal(r.mats.includes('skin'),/sandals|slides|heels/.test(n),n+' skin foot');}
    else if(/_jewellery$/.test(n)){assert.equal(r.kind,'garment');assert.deepEqual(r.slots,[]);}
    else{assert.equal(r.kind,'garment');assert.deepEqual(r.slots,[]);assert.deepEqual(r.skinUnder,['top','bottom'],n);}
    out[n]=r.meshes+' meshes: '+r.mats.join(', ');}
   return out;});

  step(2,()=>{const out={};
   for(const id of ids){const r=J(`(()=>{const look=Object.assign({},lookFor(0),{outfit:${JSON.stringify(id)}});const g=makeAvatar(look);const rep=g.hero&&g.hero.wardrobe||{};
     let wear=0,skinBase=0,shoe=0,cloth=0;g.traverse(o=>{if(!o.isMesh)return;const m=Array.isArray(o.material)?o.material:[o.material];
      if(/^wear_cd_/.test(o.name)){if(o.visible)wear++;return;}if(!o.isSkinnedMesh||!o.visible)return;
      if(m.some(x=>x.name==='shoe'||x.name==='sole'))shoe++;if(m.some(x=>x.name==='top'||x.name==='bottom'))cloth++;if(m.some(x=>x.name==='skin'))skinBase++;});
     return {garments:rep.garments||[],wear,skinBase,shoe,cloth};})()`);
    assert.deepEqual(r.garments,J(`WARDROBE.outfits[${JSON.stringify(id)}]`),id+' equipped');assert.ok(r.wear>0,id+' pieces');
    assert.equal(r.shoe,0,id+' base shoes hidden');assert.equal(r.cloth,0,id+' no base clothing colour');assert.ok(r.skinBase>=1,id+' skin under');
    out[id]=r.wear+' pieces';}
   return out;});

  step(3,()=>{const saved=J('Object.keys(WARDROBE.cache)');run("var KEEP52=WARDROBE.cache['cd_wrapdress'];delete WARDROBE.cache['cd_wrapdress'];");
   const r=J(`(()=>{const g=makeAvatar(Object.assign({},lookFor(0),{outfit:'wrapdress'}));let wear=0,cloth=0;g.traverse(o=>{if(!o.isMesh||!o.visible)return;if(/^wear_cd_/.test(o.name))wear++;const m=Array.isArray(o.material)?o.material:[o.material];if(o.isSkinnedMesh&&!/^wear_/.test(o.name)&&m.some(x=>x.name==='top'))cloth++;});return {wear,cloth,rep:g.hero.wardrobe.garments};})()`);
   run("WARDROBE.cache['cd_wrapdress']=KEEP52;");assert.equal(r.wear,0);assert.equal(r.cloth,1,'painted top');assert.deepEqual(r.rep,[]);
   assert.equal(J('Object.keys(WARDROBE.cache)').length,saved.length);});

  step(4,()=>{const seen=new Set();for(let k=0;k<300;k++)seen.add(J('randLook().outfit'));assert.deepEqual([...seen].sort(),['ankara','kaftan','lounge','office','tee','track']);
   run("S.setup={step:'p0'};renderSetup();");const h=run('PH52');for(const id of ids)assert.match(h,new RegExp('data-k="outfit" data-v="'+id+'"'),id);
   run("dispatch('setp',{i:0,k:'outfit',v:'wrapdress'});");assert.equal(run('S.p[0].outfit'),'wrapdress');return {random:[...seen].sort()};});

  step(5,()=>{run("S.p[0].outfit='wrapdress';S.kit50={owned:KIT50.ITEMS.map(x=>x.id),got:[]};S.p[0].kit={feet:'F03'};");
   const r=J(`(()=>{const g=makeAvatar(lookFor(0));let real=0,kit=0;g.traverse(o=>{if(o.isMesh&&o.visible&&/^wear_cd_shoes/.test(o.name))real++;if(o.isMesh&&o.userData.kit50)kit++;});return {real,kit};})()`);
   assert.equal(r.real,0,'modelled shoes hidden');assert.ok(r.kit>0,'kit shoes on');run("S.p[0].kit=undefined;");});
  process.stdout.write(JSON.stringify(checks));
 })().catch(e=>{process.stdout.write(JSON.stringify([{name:'harness',passed:false,failure:String(e&&e.stack||e)}]));});
}

if(process.argv[2]==='--inner'){inner();}
else{
 const runOnce=()=>JSON.parse(cp.execFileSync(process.execPath,[__filename,'--inner'],{maxBuffer:1<<26,encoding:'utf8'}));
 const a=runOnce(),b=runOnce();const same=JSON.stringify(a)===JSON.stringify(b);
 const checks=a.concat([{name:NAMES[6],passed:same}]);
 const build=(fs.readFileSync(path.resolve(__dirname,'..','dist','index.html'),'utf8').match(/const BUILD_ID='([^']+)';/)||[])[1];
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.failure?'\n     '+c.failure:''));
 fs.writeFileSync(OUT,JSON.stringify({build,passed:checks.every(c=>c.passed),checks},null,1)+'\n');
 if(!checks.every(c=>c.passed))process.exitCode=1;
}

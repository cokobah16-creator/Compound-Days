// Shoes and accessories (v50, dist/src/kit-v50.js). Checked on the real game logic in Node with the shipped Three.js and the
// real hero asset; nothing is rendered (the pieces were looked at in a browser, see the PR). The checks run twice in child
// processes and the two reports must match. Math.random and Date.now are stubbed; no wall-clock value reaches the results.
// Prints one PASS or FAIL line per check and writes check/results-kit-v50.json.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process');
const OUT=path.join(__dirname,'results-kit-v50.json');
const NAMES=[
 '1. Twenty pieces from the two render sheets, seven slots, an icon for every piece; a new household owns the Compound slides only, wears nothing, and its save has no kit key until the wardrobe is used',
 '2. An avatar without kit is built exactly as before: same mesh count and no kit meshes, on the hero rig and the built-in avatar',
 '3. Dayo\'s table: the same pieces all day, four on a weekday and six on market day (Saturday), nothing collected before today; a piece bought today stays on the table as sold, the purse pays, and a piece not on the table or too dear is refused',
 '4. Wearing: one piece per slot per player, tapping again takes it off, a piece not collected cannot be worn, and taking everything off clears the slot list; wearing is per player online and the panel actions stay local',
 '5. Every piece dresses both rigs: footwear replaces the outfit\'s own shoes, the rest mounts on the head, neck, wrist, hand or torso',
 '6. The panels: the Menu card counts the collection and opens the wardrobe, which shows twenty tiles in seven groups and marks what is worn',
 '7. Determinism: two runs give identical reports'];

function inner(){
 const {load}=require('./runtime-harness.cjs');const checks=[];
 (async()=>{
  const {run}=await load();
  const J=c=>JSON.parse(run('JSON.stringify('+c+')'));
  run("Math.random=(()=>{let s=11;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;");
  run("var PH50='';{const op=openPanel;openPanel=function(h){PH50=String(h);return op.apply(this,arguments);};}");
  run("buildTextures();buildTextures2();buildWorld();");
  run("NET.on=false;_silent=false;dispatch('newgame');S.p[0].name='Efe';S.p[1].name='Kola';S.household='Efe House';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});if(S.phase!=='play'){dispatch('movein');}closePanel();");
  const step=(i,fn)=>{const name=NAMES[i];try{const info=fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});}catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e)});}};
  const count=(look)=>J(`(()=>{const g=makeAvatar(${look});let n=0,k=0;g.traverse(o=>{if(o.isMesh){n++;if(o.userData.kit50)k++;}});return [n,k];})()`);

  step(0,()=>{const items=J('KIT50.ITEMS.map(x=>x.id+":"+x.slot)');assert.equal(items.length,20);
   assert.deepEqual(J('KIT50.SLOTS.map(s=>s[0])'),['feet','head','face','ears','neck','wrists','bag']);
   for(const it of J('KIT50.ITEMS')){assert.ok(fs.existsSync(path.join(__dirname,'..','dist','assets','wear',it.id+'.webp')),'icon '+it.id);assert.ok(J('KIT50.SLOTS.map(s=>s[0])').includes(it.slot));}
   assert.equal(J('KIT50.ITEMS.filter(x=>x.id[0]==="F").length'),8);assert.equal(J('KIT50.ITEMS.filter(x=>x.id[0]==="A").length'),12);
   assert.equal(run('kitOwnedCount50()'),1);assert.equal(run('kitOwned50("F01")'),true);assert.equal(run('S.kit50===undefined'),true);
   assert.equal(run('S.p[0].kit===undefined&&S.p[1].kit===undefined'),true);return {items};});
  step(1,()=>{const hero=count('lookFor(0)'),built=count('Object.assign({},lookFor(1),{rig:undefined})');
   assert.equal(hero[1],0);assert.equal(built[1],0);
   const hero2=count('Object.assign({},lookFor(0),{kit:{}})');assert.deepEqual(hero2,hero);return {hero,built};});
  step(2,()=>{run('S.day=2;S.money=40000;');const wd=J('kitTable50().map(x=>x.id)');assert.equal(J('happenWeekday43(2)')!=='Saturday',true);assert.equal(wd.length,4);
   assert.deepEqual(J('kitTable50().map(x=>x.id)'),wd,'same all day');assert.equal(wd.includes('F01'),false);
   let sat=1;while(J(`happenWeekday43(${sat})`)!=='Saturday'||J(`happenFestDay43(${sat})`))sat++;run(`S.day=${sat};`);assert.equal(J('kitTable50().length'),6);run('S.day=2;');
   const first=J('kitItem50('+JSON.stringify(wd[0])+')');run(`dispatch('kitbuy',{i:0,id:${JSON.stringify(wd[0])}})`);
   assert.equal(run('S.money'),40000-first.price);assert.equal(run(`kitOwned50(${JSON.stringify(wd[0])})`),true);
   assert.deepEqual(J('kitTable50().map(x=>x.id)'),wd,'table does not reshuffle');assert.equal(J('kitToday50().length'),3);
   const off=J('KIT50.ITEMS.find(x=>!kitOwned50(x.id)&&!kitTable50().some(y=>y.id===x.id)).id');const m=run('S.money');run(`dispatch('kitbuy',{i:0,id:${JSON.stringify(off)}})`);
   assert.equal(run(`kitOwned50(${JSON.stringify(off)})`),false);assert.equal(run('S.money'),m);
   run('S.money=100;');run(`dispatch('kitbuy',{i:0,id:${JSON.stringify(wd[1])}})`);assert.equal(run(`kitOwned50(${JSON.stringify(wd[1])})`),false);
   run('S.day=3;S.money=40000;');assert.equal(J('kitTable50().map(x=>x.id)').includes(wd[0]),false,'next day: collected pieces leave the table');
   return {weekday:wd,saturday:sat};});
  step(3,()=>{run("S.kit50.owned=KIT50.ITEMS.map(x=>x.id);");
   run("dispatch('kitwear',{i:0,id:'F03'});dispatch('kitwear',{i:0,id:'A05'});");assert.deepEqual(J('S.p[0].kit'),{feet:'F03',face:'A05'});
   run("dispatch('kitwear',{i:0,id:'F07'});");assert.deepEqual(J('S.p[0].kit'),{feet:'F07',face:'A05'},'replaces in the slot');
   run("dispatch('kitwear',{i:0,id:'A05'});");assert.deepEqual(J('S.p[0].kit'),{feet:'F07'},'tap again: off');
   run("dispatch('kitwear',{i:1,id:'A12'});");assert.deepEqual(J('S.p[1].kit'),{bag:'A12'});assert.deepEqual(J('S.p[0].kit'),{feet:'F07'});
   run("S.kit50.owned=S.kit50.owned.filter(x=>x!=='A09');dispatch('kitwear',{i:1,id:'A09'});");assert.equal(J('S.p[1].kit.neck||null'),null,'not collected');
   run("dispatch('kitoff',{i:0});");assert.equal(run('S.p[0].kit===undefined'),true);
   for(const n of ['kitwear','kitoff'])assert.equal(run(`PER_PLAYER.has('${n}')`),true,n);
   for(const n of ['kitopen','kitwho','kitmenu'])assert.equal(run(`LOCAL_ONLY.has('${n}')`),true,n);
   assert.equal(run("LOCAL_ONLY.has('kitbuy')"),false);});
  step(4,()=>{const out={};
   for(const it of J('KIT50.ITEMS')){for(const rig of ['hero','built']){const look=`Object.assign({},lookFor(0),{rig:${rig==='hero'?"'hero'":'undefined'},kit:{${it.slot}:'${it.id}'}})`;
     const r=J(`(()=>{const g=makeAvatar(${look});const mounts=[];let k=0,shoes=0;g.traverse(o=>{if(o.isMesh&&o.userData.kit50)k++;if(o.isGroup&&/^kit50_/.test(o.name)&&o.userData.kit50)mounts.push(o.name+'@'+(o.parent&&o.parent.name||''));
       if(o.isMesh&&!o.userData.kit50&&o.visible){const mats=Array.isArray(o.material)?o.material:[o.material];if(o.isSkinnedMesh&&mats.some(m=>m&&(m.name==='shoe'||m.name==='sole')))shoes++;if(/^wear_/.test(o.name)&&/sneaker|sandal/.test(String(o.userData.wardrobe||'')))shoes++;}});
       const fl=g.parts&&g.parts.footL;const own=fl?fl.children.filter(c=>!c.userData.kit50).length:0;return {k,mounts:[...new Set(mounts)].sort(),shoes,own};})()`);
     assert.ok(r.k>0,it.id+' '+rig+' has meshes');
     if(it.slot==='feet'){assert.equal(r.mounts.filter(m=>/^kit50_feet/.test(m)).length,2,it.id+' '+rig+' two feet');assert.equal(r.shoes,0,it.id+' '+rig+' old shoes hidden');assert.equal(r.own,0,it.id+' '+rig+' built-in feet cleared');}
     out[it.id+'/'+rig]=r.k+' '+r.mounts.join(',');}}
   return out;});
  step(5,()=>{run("S.p[0].kit={feet:'F07',head:'A02'};");run('openMenu();');const menu=run('PH50');assert.match(menu,/Shoes and accessories\.<\/b> \d+ of 20 collected/);assert.match(menu,/data-act="kitopen"/);
   run("dispatch('kitopen',{i:0});");const h=run('PH50');assert.match(h,/<h2>Shoes and accessories<\/h2>/);assert.equal((h.match(/class="kit50-tile/g)||[]).length,20);
   assert.equal((h.match(/class="kit50-h"/g)||[]).length,7);assert.equal((h.match(/kit50-tile[^"]* picked"/g)||[]).length,2);assert.match(h,/assets\/wear\/F07\.webp/);
   run('closePanel();');});
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

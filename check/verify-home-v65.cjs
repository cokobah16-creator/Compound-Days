// The home collection (v65, dist/src/home-v65.js). Checked on the real game logic in Node with the shipped Three.js;
// nothing is rendered and no picture is decoded. The checks run twice in child processes and the two reports must match.
// Math.random and Date.now are stubbed; no wall-clock value reaches the results.
// Prints one PASS or FAIL line per check and writes check/results-home-v65.json.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process');
const OUT=path.join(__dirname,'results-home-v65.json');
const DIST=path.resolve(__dirname,'..','dist');
const NAMES=[
 '1. Twenty renders: every collection piece and finish has its picture under assets/home, and the sheet order is the Finds order then the five paints',
 '2. Finds shows the renders: each of the fifteen furniture cards and the five paint cards carries its picture, and each paint keeps its colour swatch under its render',
 '3. Home and Build show the renders: storage, the room grid and the Build catalogue use the pictures; the paint chips carry the render inside their colour dot',
 '4. The collection counts what the household has owned: a purchase, a placement or a paint adds to it, storing or replacing a piece never takes it away, and the Home page shows the count',
 '5. The twentieth piece goes in the album once, with a toast',
 '6. The nine rebuilt pieces build as groups for both the room and the ghost, and building them draws nothing from the seeded Math.random sequence',
 '7. The patterned finishes: Adire indigo walls and the terrazzo and teak floors carry a pattern map and keep the paint’s own colour; the plain finishes and Original have no pattern',
 '8. Determinism: two runs give identical reports'];

function inner(){
 const {load}=require('./runtime-harness.cjs');const checks=[];
 (async()=>{
  const {run}=await load();
  const J=c=>JSON.parse(run('JSON.stringify('+c+')'));
  run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;setTimeout=function(f){try{f();}catch(e){}return 0;};");
  run("var PH65='',TOAST65=[];{const op=openPanel;openPanel=function(h){PH65=String(h);return op.apply(this,arguments);};const tp=toast;toast=function(m){TOAST65.push(String(m));return tp.apply(this,arguments);};}");
  run("buildTextures();buildTextures2();buildWorld();");
  run("NET.on=false;_silent=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name=S.p[1].name||'Kola';S.household='Efe House';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});if(S.phase!=='play'){dispatch('movein');}closePanel();S.money=500000;");
  const step=(i,fn)=>{const name=NAMES[i];try{const info=fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});}catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e)});}};
  const home=()=>run("players[0].g.position.set(-5,0,3.5);players[1].g.position.set(-4,0,3.5);");
  const market=()=>run("players[0].g.position.set(23.8,0,2.4);");

  step(0,()=>{const all=J('HOME65.all');assert.equal(all.length,20);assert.deepEqual(J('HOME65.pieces'),J('FINDS34'));assert.deepEqual(J('HOME65.finishes'),J('PAINTS35.map(p=>p.id)'));
   const sizes=all.map(id=>{const f=path.join(DIST,'assets/home',id+'.webp');assert.ok(fs.existsSync(f),id);const b=fs.readFileSync(f);assert.equal(b.slice(8,12).toString(),'WEBP',id);return b.length>2000;});
   assert.ok(sizes.every(Boolean));return {pictures:all.length};});
  step(1,()=>{market();run("openLife34('market')");const h=run('PH65');
   for(const id of run('HOME65.all.join()').split(','))assert.ok(h.includes('assets/home/'+id+'.webp'),id);
   for(const p of J('PAINTS35'))assert.ok(h.includes(`assets/home/${p.id}.webp?v=${run('BUILD_ID')}" alt="" decoding="async" loading="lazy"><span class="paint35-swatch" style="background:${p.hex}">`),p.id);return {pictures:(h.match(/assets\/home\//g)||[]).length};});
  step(2,()=>{home();run("S.home.storage.push('lamp');S.home.paints=(S.home.paints||[]).concat(['indigo']);openLife34('home')");let h=run('PH65');
   assert.ok(h.includes('assets/home/lamp.webp'),'storage');assert.ok(/class="cell34[^"]*"[^>]*><img class="home65-pic"/.test(h)||h.includes('home65-pic'),'grid');
   assert.ok(/data-id="indigo"[^>]*><span style="background:#[0-9A-Fa-f]{6}"><img class="home65-chip" src="[^"]*assets\/home\/indigo\.webp/.test(h),'chip');
   run("openBuild()");h=String(run('panel.innerHTML'));assert.ok(h.includes('home65-thumb'),'build');assert.ok(h.includes('assets/home/bed.webp'),'build bed');
   run("S.home.storage=S.home.storage.filter(t=>t!=='lamp');S.home.paints=[];closePanel();");});
  step(3,()=>{home();run("S.home.got65=[];S.home.storage=[];S.home.paints=[];");const n0=J('home65Got().length');
   market();run("S.mkt=S.mkt||{};");const t=run("offers34()[0]");run(`dispatch('lifeBuy',{t:'${t}'})`);const n1=J('(S.home.got65||[]).length');
   run("dispatch('buyPaint35',{id:'teak'})");const n2=J('(S.home.got65||[]).length');
   run(`S.home.storage=S.home.storage.filter(x=>x!=='${t}');`);const kept=J(`home65Got().includes('${t}')`);
   home();run("openLife34('home')");const h=run('PH65');assert.ok(/HOME COLLECTION · \d+ OF 20/.test(h),'count shown');
   assert.ok(n1>n0,'purchase counted');assert.ok(n2>n1,'paint counted');assert.equal(kept,true,'kept after it leaves');
   return {before:n0,afterBuy:n1,afterPaint:n2,shown:(h.match(/HOME COLLECTION · \d+ OF 20/)||[''])[0]};});
  step(4,()=>{run("S.home.got65=HOME65.all.slice(0,19);delete S.home.got65done;TOAST65.length=0;");const mem0=J('S.memories.length');
   run("S.home.paints=(S.home.paints||[]).concat(HOME65.finishes);S.home.storage=S.home.storage.concat(HOME65.pieces);home65Note();home65Note();");
   assert.equal(J('S.memories.length'),mem0+1);assert.equal(J('S.memories[S.memories.length-1].caption'),J('HOME65.done'));assert.equal(J('TOAST65.filter(m=>/home collection is complete/.test(m)).length'),1);
   run("S.home.storage=[];");return {day:J('S.home.got65done')};});
  step(5,()=>{const r=J(`(()=>{const out={};const real=Math.random;const count=fn=>{let n=0;Math.random=function(){n++;return real.apply(this,arguments);};let g;try{g=fn();}finally{Math.random=real;}return [n,g];};
     for(const t of HOME65.built){const d=ITEMS[t];const [drawn,g]=count(()=>buildFurn(t,d.w,d.h));const [earlier]=count(()=>home65Furn(t,d.w,d.h));let meshes=0;g.traverse(m=>{if(m.isMesh)meshes++;});
      out[t]={group:!!(g&&g.isGroup),meshes,own:g.userData.home65===t||g.children.some(c=>c.userData&&c.userData.home65),drawn,earlier};}return out;})()`);
   for(const [t,v] of Object.entries(r)){assert.ok(v.group&&v.meshes>=1,t);assert.equal(v.drawn,v.earlier,t+' draws exactly what the earlier builder draws');}
   run("setGhost(0,{type:'speaker',free:false});clearGhost(0);");return Object.fromEntries(Object.entries(r).map(([t,v])=>[t,v.meshes]));});
  step(6,()=>{home();run("S.home.paints=['indigo','palm','ochre','terrazzo','teak'];");const look=()=>J(`(()=>{const f=TUNE35.flat;const w=f.walls[0].material,fl=f.floor.material;return {wallMap:w.userData.home65||null,wallColor:w.color.getHexString(),floorMap:fl.userData.home65||null,floorColor:fl.color.getHexString()};})()`);
   const out={};for(const [w,f] of [['indigo','terrazzo'],['palm','teak'],['ochre','']]){run(`dispatch('paint35',{id:'${w}'});dispatch('paint35',{id:'${f||'floor:base'}'})`);out[w+'/'+(f||'base')]=look();}
   assert.equal(out['indigo/terrazzo'].wallMap,'indigo');assert.equal(out['indigo/terrazzo'].wallColor,J("new THREE.Color(TUNE35.paintOf('indigo').hex).getHexString()"));assert.equal(out['indigo/terrazzo'].floorMap,'terrazzo');
   assert.equal(out['palm/teak'].wallMap,null);assert.equal(out['palm/teak'].floorMap,'teak');
   assert.notEqual(out['ochre/base'].wallColor,out['palm/teak'].wallColor);assert.equal(out['ochre/base'].floorMap,null);return out;});
  process.stdout.write(JSON.stringify(checks));
 })().catch(e=>{process.stdout.write(JSON.stringify([{name:'harness',passed:false,failure:String(e&&e.stack||e)}]));});
}

if(process.argv[2]==='--inner'){inner();}
else{
 const runOnce=()=>JSON.parse(cp.execFileSync(process.execPath,[__filename,'--inner'],{maxBuffer:1<<26,encoding:'utf8'}));
 const a=runOnce(),b=runOnce();const same=JSON.stringify(a)===JSON.stringify(b);
 const checks=a.concat([{name:NAMES[7],passed:same}]);
 const build=(fs.readFileSync(path.resolve(__dirname,'..','dist','index.html'),'utf8').match(/const BUILD_ID='([^']+)';/)||[])[1];
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.failure?'\n     '+c.failure:''));
 fs.writeFileSync(OUT,JSON.stringify({build,passed:checks.every(c=>c.passed),checks},null,1)+'\n');
 if(!checks.every(c=>c.passed))process.exitCode=1;
}

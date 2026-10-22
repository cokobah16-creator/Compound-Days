// v35 tuning (dist/src/tune-v35.js), checked on the real game logic in Node: the purse, the day-2 seedling and ripen-on-water crop rule,
// the wall-clock bite with its nibble, Act on the fishing panel only, outdoor seats with the walkway and the path to the pot, paint, the copy
// that matches the new rules, the companion's approving line, its shop floor and the weekday prose. Nothing is rendered here.
// Prints one PASS or FAIL line per check and writes check/results-tune-v35.json (no wall-clock values; byte-identical across runs).
// Part of checks 3 and 12 runs in a subset pass: a temporary dist that loads the v35 modules only up to tune-v35.js, so the later modules
// (lines, days, evening, audio) are truly undeclared there.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const SUBSET=process.argv[2]==='--subset';
const {load}=require('./runtime-harness.cjs');
const WEEKDAY35=/\b(mon|tues|wednes|thurs|fri|satur|sun)days?\b/i;
const OUT=path.join(__dirname,'results-tune-v35.json');
const checks=[];let runFn=null;

// a dist that loads only the v35 modules up to and including `last` (spec 11.2)
function subsetDir35(last){const root=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd35-'));
 for(const f of ['assets','src','data'])if(fs.existsSync(path.join(root,f)))fs.symlinkSync(path.join(root,f),path.join(d,f));
 let html=fs.readFileSync(path.join(root,'index.html'),'utf8'),cut=false;
 for(const [tag,src] of [...html.matchAll(/<script src="([^"]+-v35\.js)"><\/script>\n?/g)]){if(cut)html=html.replace(tag,'');if(src.endsWith('/'+last))cut=true;}
 if(!cut){fs.rmSync(d,{recursive:true,force:true});throw new Error('subset: '+last+' not found');}fs.writeFileSync(path.join(d,'index.html'),html);return d;}

(async()=>{
 const {run}=await load();runFn=run;
 const J=code=>JSON.parse(run('JSON.stringify('+code+')'));
 // determinism helpers (spec 11.2)
 run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;");
 run("var T35=1790000000000;if(typeof CLOCK35!=='undefined')CLOCK35.fn=()=>T35;");
 run("var PH='',TOASTS=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}");
 run("globalThis.CU=[];if(typeof CUE35_HOOKS!=='undefined')CUE35_HOOKS.push((n,d)=>CU.push(n+(d&&d.stage!=null?':'+d.stage:'')+(d&&d.id?':'+d.id:'')));");
 const need=()=>assert.equal(run('typeof TUNE35'),'object','tune-v35.js is loaded');
 const at=(x,z,i=0)=>run(`players[${i}].y=0;players[${i}].g.position.set(${x},0,${z});players[${i}].prev=[${x},${z}];`);
 const HOME=[-5.2,4.0],ROCKS=[12.3,13.9],STALL=[20.8,7.1],AWAY=[10,10];
 // a new companion household through the real entry points (the title screen's companion button)
 const newHH=()=>{run("AI.on=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();dispatch('movein');closePanel();TOASTS=[];PH='';");at(...AWAY,1);};
 // an old (pre-v35) two-player household loaded from a save
 const oldHH=(money=55000)=>{run(`AI.on=false;S=newState();S.phase='play';S.money=${money};save();ACTIONS.continue();closePanel();TOASTS=[];PH='';`);at(...AWAY,1);};
 const ovTrack=()=>run("{const s=new Set();globalThis.OVC=[ov.classList.add,ov.classList.remove,ov.classList.contains];ov.classList.add=c=>{s.add(c);};ov.classList.remove=c=>{s.delete(c);};ov.classList.contains=c=>s.has(c);}");
 const ovUntrack=()=>run("if(globalThis.OVC){[ov.classList.add,ov.classList.remove,ov.classList.contains]=OVC;OVC=null;}");
 const check=(n,label,fn)=>{const name=n+'. '+label;try{need();const info=fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});console.log('PASS',name);}
  catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});console.log('FAIL',name);if(process.env.VERBOSE)console.error(e);}finally{try{ovUntrack();run('_silent=false;');}catch(_){}}};

 // the world every check uses
 let setupError=null;try{run("buildTextures();buildTextures2();buildWorld();");}catch(e){setupError=e;}
 if(setupError&&SUBSET){process.stdout.write(JSON.stringify([{key:'3',passed:false,failure:String(setupError.message)},{key:'12',passed:false,failure:String(setupError.message)}])+'\n');return;}

 if(SUBSET){
  /* ---------------- subset pass: modules up to tune-v35.js only ---------------- */
  const out=[];const sub=(key,fn)=>{try{need();const info=fn();out.push({key,passed:true,info});}catch(e){out.push({key,passed:false,failure:String(e&&e.message||e).split('\n')[0]});}finally{run('_silent=false;');}};
  sub('3',()=>{
   assert.equal(run("typeof LOG35==='undefined'&&typeof DAYS35==='undefined'&&typeof LINES35==='undefined'&&typeof EVENING35==='undefined'"),true,'later v35 modules are undeclared');
   newHH();at(...HOME);run("dispatch('lifePlant');");assert.equal(run('S.life.crop.stage'),0);const before=run('LIFE34.garden.children.length');
   run("dispatch('sleep');dispatch('nextday');");
   assert.equal(run('S.day'),2);assert.equal(run('S.life.seed35&&S.life.seed35.day'),2,'seedling granted on day 2 by TUNE alone');assert.equal(run('TUNE35.seedlingPending()'),false);
   const after=run('LIFE34.garden.children.length');assert(after>before,'nursery bag and note by the pot: '+before+' -> '+after);
   assert(run("PH.startsWith('<section class=\"life34\">')&&PH.includes('PALM COURT · DAY 2')"),'the last panel is Today');assert(run("PH.includes('A seedling from Tunde')"),'Today shows the seedling');
   at(...HOME);run("dispatch('lifePlant');");assert.equal(run('S.life.crop.stage'),1,'plants on day 2');assert.equal(run('TUNE35.grantSeedling()'),false);
   return {gardenChildren:[before,after]};});
  sub('12',()=>{
   oldHH();run("S.nb.nkechi.aff=1;if(!S.recipes.includes('puffpuff'))S.recipes.push('puffpuff');openTalk(0,'nkechi');");
   const h=run('panel.innerHTML');assert(h.includes('jollof every evening'),'the base café line is fixed by the copy filter');assert(!WEEKDAY35.test(h),'no weekday in the talk panel');
   return {cafe:'jollof every evening'};});
  process.stdout.write(JSON.stringify(out)+'\n');return;
 }

 // the subset pass runs first, in its own process
 let subset={};
 try{const d=subsetDir35('tune-v35.js');try{const o=cp.execFileSync(process.execPath,[__filename,'--subset'],{env:{...process.env,COMPOUND_GAME_DIR:d},encoding:'utf8'});
   for(const c of JSON.parse(o.trim().split('\n').pop()))subset[c.key]=c;}finally{fs.rmSync(d,{recursive:true,force:true});}}
 catch(e){subset={3:{passed:false,failure:'subset pass: '+String(e.message).split('\n')[0]},12:{passed:false,failure:'subset pass: '+String(e.message).split('\n')[0]}};}
 const subOK=k=>{const c=subset[k];assert(c&&c.passed,'subset pass: '+(c?c.failure:'missing'));return c.info;};
 if(setupError)throw setupError;

 // 1. Core: one stubbable wall clock and one cue bus that is silent on remote replays
 check(1,'Core: clock35 follows CLOCK35.fn, cue35 reaches its hooks and is silent on replays',()=>{
  assert.equal(run('clock35()'),1790000000000);run('T35+=1234');assert.equal(run('clock35()'),1790000001234);
  run('CLOCK35.fn=null');assert.equal(run('clock35()'),1790000000000,'without a stub, Date.now');run('CLOCK35.fn=()=>T35');
  run("CU.length=0;cue35('probe');_silent=true;cue35('quiet');_silent=false;");assert.deepEqual(J('CU'),['probe']);
  run("{const h=()=>{throw new Error('x')};CUE35_HOOKS.unshift(h);const w=console.warn;console.warn=()=>{};try{cue35('after');}finally{console.warn=w;CUE35_HOOKS.shift();}}");assert.deepEqual(J('CU'),['probe','after'],'a failing hook does not stop the others');
  run('CU.length=0');});

 // 2. Purse
 check(2,'Purse: new households start with ₦6,000 (companion, two players), old saves keep their money',()=>{
  run("AI.on=false;dispatch('aiStart');");assert.equal(run('S.money'),6000);assert.equal(run('S.born35'),true);
  run("S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();dispatch('movein');closePanel();");assert.equal(run('S.money'),6000,'the flow keeps the purse');assert.equal(run('S.phase'),'play');
  run("dispatch('newgame');");assert.equal(run('S.money'),6000);assert.equal(run('S.born35'),true);
  assert(run("ACTIONS.nethost.toString().includes('born35')"),'the online host is wrapped too');
  oldHH();assert.equal(run('S.money'),55000);assert.equal(run('S.born35'),undefined);
  assert.equal(run('newState().money'),55000,'newState itself is untouched');
  return {purse:6000};});

 // 3. Seedling gate
 check(3,'Seedling: none on day 1 for a new household; it arrives on day 2 (without the later modules), lazily on plant or load; old households plant on day 1',()=>{
  newHH();at(...HOME);run("dispatch('lifePlant');");assert.equal(run('S.life.crop.stage'),0,'planting refused on day 1');
  assert.deepEqual(J('TOASTS'),['Tunde’s seedling arrives tomorrow morning.']);
  run("openLife34('garden')");const g=run('panel.innerHTML');assert(!g.includes('data-act="lifePlant"'),'no plant button');assert(g.includes('An empty pot'));
  assert.equal(run('TUNE35.seedlingPending()'),true);assert.equal(run('TUNE35.seedlingReady()'),false);assert.equal(run('TUNE35.grantSeedling()'),false);
  const s=subOK('3');
  // lazy grant before planting: a new household that is on day 2 without the seedling
  newHH();at(...HOME);run("S.day=2;");assert.equal(run('!!S.life.seed35'),false);run("dispatch('lifePlant');");assert.equal(run('S.life.crop.stage'),1,'the plant wrapper grants first');
  assert.equal(run("S.memories.filter(m=>m.caption.includes('note from Tunde')).length"),1,'one note memory');
  // lazy grant on load
  newHH();run("S.day=2;save();ACTIONS.continue();closePanel();");assert.equal(run('S.life.seed35&&S.life.seed35.day'),2,'Continue grants');
  assert.equal(run("S.memories.filter(m=>m.caption.includes('note from Tunde')).length"),1);run("ACTIONS.continue();closePanel();");assert.equal(run("S.memories.filter(m=>m.caption.includes('note from Tunde')).length"),1,'idempotent');
  oldHH();at(...HOME);assert.equal(run('TUNE35.seedlingReady()'),true);run("dispatch('lifePlant');");assert.equal(run('S.life.crop.stage'),1,'an old household plants on day 1');assert.equal(run('!!S.life.seed35'),false);
  return s;});

 // 4. Crop rule
 check(4,'Crop: a watered day adds a stage overnight; watering at stage 2 ripens at once; harvest gives three peppers and resets the pot; the pot marker clears when nothing more is due; stage 2 has flowers; the harvest has its own card',()=>{
  oldHH();at(...HOME);run("navigate34('garden');");assert.deepEqual(J('[LIFE34.waypoint.x,LIFE34.waypoint.z]'),[-5.6,6.35]);run("closePanel();CU.length=0;dispatch('lifePlant');");assert(J('LIFE34.waypoint'),'planting alone leaves the marker');
  run("dispatch('lifeWater');");assert.deepEqual(J('[S.life.crop.stage,S.life.crop.wateredDay===S.day]'),[1,true],'stage 1, watered');assert.equal(J('LIFE34.waypoint'),null,'watered and not ripe: the pot marker has done its job');
  const kids1=run('LIFE34.garden.children.length');
  run("dispatch('nextday');closePanel();");at(...HOME);assert.equal(run('S.life.crop.stage'),2);const kids2=run('LIFE34.garden.children.length');
  assert(kids2>=kids1+1+8,'stage 2 adds a leaf and four flowers: '+kids1+' -> '+kids2);assert.equal(run("LIFE34.garden.children.filter(m=>m.scale&&Math.abs(m.scale.y-.018)<1e-6&&m.scale.x>.2).length")>0,true,'fuller leaves');
  run("navigate34('garden');closePanel();");
  run("dispatch('lifeWater');");assert.deepEqual(J('[S.life.crop.stage,S.life.crop.wateredDay===S.day]'),[3,true],'ripe on the spot');
  const w=run('S.life.crop.waterings');run("dispatch('lifeWater');");assert.deepEqual(J('[S.life.crop.stage,S.life.crop.waterings]'),[3,w],'a second water does nothing');
  const p=run('haveCount("pepper")');run("TOASTS=[];request34('nkechi').stage=1;request34('nkechi').lastDay=0;dispatch('lifeHarvest');");assert.equal(run('haveCount("pepper")'),p+3);assert.equal(run('S.life.crop.stage'),1);
  const hv=run('PH');assert(hv.includes('class="life-note34 harvest35"')&&hv.includes('Three red peppers')&&hv.includes('Two are for Mama Nkechi’s pot.')&&hv.includes('data-act="lifeGo" data-v="nkechi"'),'the harvest card');
  assert.deepEqual(J('TOASTS'),[],'no toast over the card');assert.equal(J('LIFE34.waypoint'),null,'the harvest clears the pot marker');run("openLife34('garden')");assert(!run('PH').includes('harvest35'),'the card is shown once');
  run("dispatch('nextday');closePanel();");assert.equal(run('S.life.crop.stage'),1,'no water, no growth');
  const cues=J('CU').filter(c=>c.startsWith('water'));assert.deepEqual(cues,['water:1','water:3'],'water cue only on a successful watering, after any ripening');
  return {waterCues:cues};});

 // 5. Wall-clock bite
 check(5,'Wall-clock bite: 2.2–4.4 s of real time at 5 fps; nibble before bite; dt-only loops still bite; none behind the Menu; one catch cue',()=>{
  oldHH();at(...ROCKS);run("CU.length=0;S.life.catch=null;doFish(0);dispatch('lifeCast');globalThis.TC=T35;");assert.equal(run('LIFE34.fish.phase'),'waiting');
  let calls=0;while(run('LIFE34.fish.phase')==='waiting'&&calls<200){run('T35+=200;tickFishing34(.05)');calls++;}
  const bite=(run('T35')-run('TC'))/1000;assert.equal(run('LIFE34.fish.phase'),'bite');assert(bite>=2.2-1e-9&&bite<=4.4+0.2+1e-9,'bite after '+bite+' s');assert(calls<=23,'at most 23 calls: '+calls);
  assert(run('LIFE34.fish.biteAt')>=2.2&&run('LIFE34.fish.biteAt')<=4.4);assert.deepEqual(J('CU'),['cast','nibble','bite']);
  // the nibble window
  run("closePanel();CU.length=0;doFish(0);dispatch('lifeCast');");const samples=[];
  for(let k=0;k<200&&run('LIFE34.fish.phase')==='waiting';k++){samples.push(J('[LIFE34.fish.biteAt-LIFE34.fish.elapsed,TUNE35.nibble()]'));run('T35+=100;tickFishing34(.05)');}
  const early=samples.filter(([r])=>r>=0.7),late=samples.filter(([r])=>r>0&&r<=0.5);assert(early.length&&late.length,'samples on both sides');
  assert(early.every(([,n])=>n===false),'no nibble 0.7 s before the bite');assert(late.every(([,n])=>n===true),'nibble within 0.5 s of the bite');
  // a frozen wall clock: the dt-only loop still bites
  run("closePanel();doFish(0);dispatch('lifeCast');");let dt=0;while(run('LIFE34.fish.phase')==='waiting'&&dt<100){run('tickFishing34(.1)');dt++;}assert.equal(run('LIFE34.fish.phase'),'bite');assert(dt<=45,'dt-only bite within 45 calls: '+dt);
  // behind the Menu: no bite and no cue, whatever the wall clock does
  run("closePanel();doFish(0);dispatch('lifeCast');CU.length=0;openMenu();T35+=10000;for(let k=0;k<5;k++)tickFishing34(.05);");assert.equal(run('LIFE34.fish.phase'),'waiting');assert.deepEqual(J('CU'),[]);
  // one catch cue per reel
  run("closePanel();doFish(0);dispatch('lifeCast');for(let k=0;k<60&&LIFE34.fish.phase==='waiting';k++){T35+=200;tickFishing34(.05);}CU.length=0;dispatch('lifeReel');dispatch('lifeReel');");
  const cc=J('CU').filter(c=>c.startsWith('catch'));assert.equal(cc.length,1);assert.equal(cc[0],'catch:'+run('S.life.catch.id'));run("dispatch('lifeCatch',{v:'release'});closePanel();");
  return {biteSeconds:+bite.toFixed(2),callsAt5fps:calls,dtOnlyCalls:dt};});

 // 6. Act on the fishing panel only
 check(6,'Act: presses Cast, Reel in, Keep or Cast again on the fishing panels only, 300 ms after a panel change, never in a text field or on any other panel',()=>{
  oldHH();at(...ROCKS);ovTrack();
  run("S.life.catch=null;doFish(0);");const st={};st.ready=J('panelPrimary35()');run("ACTIONS.lifeCast();");st.waiting=J('panelPrimary35()');
  run("for(let k=0;k<60&&LIFE34.fish.phase==='waiting';k++){T35+=200;tickFishing34(.05);}");st.bite=J('panelPrimary35()');run("ACTIONS.lifeReel();");st.catch=J('panelPrimary35()');
  assert.equal(st.ready&&st.ready.act,'lifeCast');assert.equal(st.waiting,null);assert.equal(st.bite&&st.bite.act,'lifeReel');assert.deepEqual(st.catch,{act:'lifeCatch',data:{act:'lifeCatch',v:'keep'}});
  run("ACTIONS.lifeCatch({v:'release'});");at(...STALL);run("openLife34('market')");assert.equal(J('panelPrimary35()'),null,'Finds has many primaries');
  assert.equal(J(`panelPrimary35('<button class="btn primary" data-act="a">A</button><button class="btn primary block" data-act="b">B</button>')`),null,'two primaries');
  assert.equal(J(`panelPrimary35('<button class="btn primary" data-act="a" disabled>A</button><button class="btn" data-act="b">B</button>')`),null,'a disabled primary');
  assert.deepEqual(J(`panelPrimary35('<button class="btn primary" data-act="lifeCatch" data-v="a&amp;b" data-some-key="x">K</button>')`),{act:'lifeCatch',data:{act:'lifeCatch',v:'a&b',someKey:'x'}},'data-* as the click handler passes them');
  // the real press
  run("globalThis.DSP=[];{const d=dispatch;globalThis.DSP0=d;dispatch=function(n,x){DSP.push(n);return d.apply(this,arguments);};}");
  at(...ROCKS);run("closePanel();T35+=1000;doFish(0);");assert.equal(run('actPrimary35()'),false,'within 300 ms of the panel opening');assert.deepEqual(J('DSP'),[]);
  run('T35+=300');assert.equal(run('actPrimary35()'),true);assert.deepEqual(J('DSP'),['lifeCast']);assert.equal(run('LIFE34.fish.phase'),'waiting');
  // refusals: a fresh close, a text field, another tab
  const fishHTML=run('panel.innerHTML');run("T35+=1000;closePanel();");run(`ov.classList.add('on');panel.innerHTML=${JSON.stringify(fishHTML)};LIFE34.tab='fish';LIFE34.fish={i:0,phase:'ready',elapsed:0,biteAt:0};DSP.length=0;`);
  run(`panel.innerHTML=panel.innerHTML.replace(/<button class="btn block" disabled>[^<]*<\\/button>/,'<button class="btn primary block" data-act="lifeCast">Cast your line</button>');`);
  assert.equal(run('actPrimary35()'),false,'within 300 ms of a close');run('T35+=300;document.activeElement={tagName:"INPUT"};');assert.equal(run('actPrimary35()'),false,'not in a text field');
  run('delete document.activeElement;LIFE34.tab="today";');assert.equal(run('actPrimary35()'),false,'not on another journal tab');assert.deepEqual(J('DSP'),[]);run("LIFE34.tab='fish';");assert.equal(run('actPrimary35()'),true,'the same panel on the fish tab');
  // the whole loop on one button: Cast, Reel in, Keep, Cast again
  run("closePanel();S.life.catch=null;doFish(0);DSP.length=0;");const loop=[];const press=()=>{run('T35+=300');const ok=run('actPrimary35()');loop.push(ok?J('DSP[DSP.length-1]'):'-');};
  press();run("for(let k=0;k<60&&LIFE34.fish.phase==='waiting';k++){T35+=200;tickFishing34(.05);}");press();press();const kept=run("haveCount('fish')");press();
  assert.deepEqual(loop,['lifeCast','lifeReel','lifeCatch','lifeFish'],'one button: '+loop.join(','));assert(kept>=1,'kept for the kitchen');assert.equal(run('LIFE34.fish.phase'),'waiting','Cast again casts at once (one press per cast)');
  assert.equal(J('DSP.slice(-1)')[0],'lifeFish');press();assert.equal(loop[loop.length-1],'-','nothing to press while the line is out');
  // never anywhere else
  const others={newconfirm:"ACTIONS.newconfirm()",sleep:"openSleep()",night:"endDay()",midnight:"openPanel(`<h2>Past midnight</h2><p>x</p><div class=\"actions\">${btn('Start day 2','nextday',{},'primary block')}</div>`)",
   today:"openLife34('today')",menu:"openMenu()",talk:"openTalk(0,'bassey')"};const refused={};
  run("closePanel();globalThis.S0=S;");for(const [k,code] of Object.entries(others)){run('T35+=1000;closePanel();T35+=1000;DSP.length=0;'+code+';T35+=1000;');refused[k]=run('actPrimary35()')===false&&J('DSP').length===0;assert(refused[k],'Act must not press on '+k);}
  assert.equal(run('S===S0&&S.phase==="play"'),true,'Start over? was not confirmed');run('dispatch=DSP0;closePanel();');
  assert.equal(run("typeof setupTouch"),'function');assert(run("setupTouch.toString().includes('actPrimary35')"),'touch Act is wired after the base listeners');
  // from the world (no catch page open) the fishing button still opens the line first
  run("closePanel();LIFE34.fish=null;dispatch('lifeFish');");assert.equal(run('LIFE34.fish.phase'),'ready','from the world: the line opens, ready to cast');run('closePanel()');
  return {fishing:{ready:st.ready.act,waiting:null,bite:st.bite.act,catch:st.catch.act+':'+st.catch.data.v},oneButtonLoop:loop,refused:Object.keys(refused)};});

 // 7. Outdoor seats, the walkway and the path to the pot
 check(7,'Outdoor seats: armchair and chairs at veranda columns 1, 2 and 6; the walkway, the room cell inside the door and the path to the pot stay clear; the veranda and the pot are reached on foot from inside the flat',()=>{
  oldHH();at(...HOME);const row=t=>J(`[0,1,2,3,4,5].map(x=>fitsHome34('${t}',x,4,0))`);
  assert.deepEqual(row('armchair'),[true,true,false,false,false,true]);assert.deepEqual(row('chairs'),[true,true,false,false,false,true]);assert.deepEqual(row('lamp'),[false,false,false,false,false,false]);
  for(const t of ['plant','planter'])assert.deepEqual(J(`[fitsHome34('${t}',3,4,0),fitsHome34('${t}',4,4,0),fitsHome34('${t}',1,4,0)]`),[false,false,true],t);
  assert.equal(run("fitsHome34('planter',1,4,0)||fitsHome34('planter',3,4,0)"),true);
  assert.deepEqual(J('TUNE35.reserved'),[[3,4,'the path to the pot'],[4,4,'the walkway'],[4,3,'the way to the veranda']]);
  // nothing may stand on the room cell just inside the only opening in the south wall
  assert.deepEqual(J(`['shelf','kitchen','coffee','armchair','plant','speaker'].map(t=>[0,1].some(r=>fitsHome34(t,4,3,r)))`),[false,false,false,false,false,false],'the room cell inside the door stays clear');
  // a breadth-first walk from inside the flat (not from the veranda): the nearest it gets to the pot, and the veranda cells it reaches
  const walkFromInside=()=>J(`(()=>{const st=0.1,key=(x,z)=>x.toFixed(1)+','+z.toFixed(2),q=[[-5.2,3.4]],seen=new Set([key(-5.2,3.4)]);let best=99;const cells=[0,0,0,0,0,0];
   while(q.length){const [x,z]=q.shift();if(z>5.9){best=Math.min(best,Math.hypot(x+5.6,z-6.35));const cx=Math.floor((x-FLAT.x0)/FLAT.cell);if(cx>=0&&cx<6&&Math.abs(x-cellToWorld(cx,4)[0])<0.25)cells[cx]=1;}
    for(const [dx,dz] of [[st,0],[-st,0],[0,st],[0,-st]]){const nx=+(x+dx).toFixed(2),nz=+(z+dz).toFixed(2);
    if(nx<-8.2||nx>-2.3||nz<1.8||nz>6.98)continue;const k=key(nx,nz);if(seen.has(k))continue;seen.add(k);if(blocked(nx,nz,PR))continue;q.push([nx,nz]);}}return {pot:+best.toFixed(2),cells:cells.join('')};})()`);
  run("S.home.items.push({id:'ra',type:'armchair',x:1,y:4,rot:0},{id:'rc',type:'chairs',x:5,y:4,rot:0});rebuildFurniture();");
  const walk=walkFromInside(),reach=walk.pot;
  assert(reach<1.45,'the pot is reached on foot from inside the flat with seats at columns 2 and 6: '+reach);assert.equal(walk.cells[4],'1','the walkway is reached from inside');
  // the Home page refuses a piece on the room cell inside the door (a real select and tap)
  run("S.home.items=S.home.items.filter(i=>i.id!=='ra'&&i.id!=='rc');S.home.storage=['shelf'];LIFE34.undo=null;rebuildFurniture();dispatch('lifeSelect',{ix:0});dispatch('lifeCell',{x:4,y:3});dispatch('lifeCancel');LIFE34.selType34b=null;");
  assert.equal(run("S.home.items.some(i=>i.type==='shelf')"),false,'no shelf on the room cell inside the door');
  const inner=run('homeHTML34()');assert(/walkway35[^>]*data-x="4" data-y="3"[^>]*aria-label="Row 4, column 5, the way to the veranda"[^>]*disabled/.test(inner),'the room cell inside the door is shown kept');
  assert(inner.includes('walkway35-note'),'a legend says why the dashed cells stay clear');
  run("S.home.items=S.home.items.filter(i=>i.id!=='ra'&&i.id!=='rc');rebuildFurniture();S.home.storage=['armchair','armchair'];LIFE34.undo=null;");
  run("dispatch('lifeSelect',{ix:0});dispatch('lifeCell',{x:1,y:4});");const placedAt=J("(S.home.items.find(i=>i.type==='armchair')||{}).y");assert.equal(placedAt,4,'placed on the veranda row');
  // "See it in the room" right after placing: the camera fit includes the new piece for 2.5 s
  const n0=J('v21InteractionPoints(0,false).length');run("closePanel();");const n1=J('v21InteractionPoints(0,false).length');run('T35+=2600');const n2=J('v21InteractionPoints(0,false).length');
  assert.deepEqual([n1-n0,n2-n0],[8,0],'the placed piece is framed for 2.5 s: '+[n0,n1,n2]);run("openLife34('home')");
  run("dispatch('lifeCell',{x:1,y:4});dispatch('lifeRotate');");assert.equal(run("S.home.items.find(i=>i.type==='armchair').rot"),1,'turned');
  run("dispatch('lifeUndo');");assert.equal(run("S.home.items.find(i=>i.type==='armchair').rot||0"),0,'undo restores');
  run("dispatch('lifeSelect',{ix:S.home.storage.indexOf('armchair')});dispatch('lifeCell',{x:3,y:4});");assert.equal(run("S.home.items.filter(i=>i.type==='armchair').length"),1,'nothing placed on the path to the pot');
  run("dispatch('lifeCancel');");const h=run('homeHTML34()');assert(h.includes('the walkway')&&h.includes('the path to the pot'));assert(/walkway35[^>]*data-x="4" data-y="4"[^>]*disabled/.test(h),'the walkway cell is disabled');
  return {potReach:reach,verandaCellsReachedFromInside:walk.cells,decoratableVerandaColumns:[1,2,6]};});

 // 8. Paint
 check(8,'Paint: the six flat walls and the floor are tagged; buy at Finds, paint at home, undo, reload and a courtyard style keep it; env keeps its own materials',()=>{
  assert.equal(run('TUNE35.flat.walls.length'),6,'six flat walls tagged during buildWorld');assert.equal(run('!!(TUNE35.flat.floor&&TUNE35.flat.floor.isMesh)'),true,'the floor slab tagged');
  oldHH(20000);at(...STALL);run("openLife34('market')");const mk=run('panel.innerHTML');assert.equal((mk.match(/paint35-card/g)||[]).length,5);
  assert.deepEqual([...mk.matchAll(/<span class="life-label34">([A-Z’ ]+)/g)].map(m=>m[1].trim()).slice(0,5),Array(5).fill('TODAY’S FIND'));assert(!WEEKDAY35.test(mk));
  at(...AWAY);run("dispatch('buyPaint35',{id:'indigo'});");assert.equal(run('S.money'),20000,'away from the stall: nothing charged');
  at(...STALL);run("dispatch('buyPaint35',{id:'indigo'});dispatch('buyPaint35',{id:'indigo'});dispatch('buyPaint35',{id:'nope'});");assert.equal(run('S.money'),17500,'charged once');assert.deepEqual(J('S.home.paints'),['indigo']);
  assert(run("panel.innerHTML.includes('Yours')"));
  const orig=run("globalThis.ORIG=TUNE35.flat.walls.map(m=>m.material);globalThis.ORIGHEX=ORIG.map(m=>m.color.getHex());globalThis.FORIG=TUNE35.flat.floor.material;ORIG.length");assert.equal(orig,6);
  at(...AWAY);run("dispatch('paint35',{id:'indigo'});");assert.equal(run('S.home.wall'),undefined,'away from home: nothing');
  at(...HOME);run("dispatch('paint35',{id:'nope'});dispatch('paint35',{id:'teak'});");assert.equal(run('S.home.wall===undefined&&S.home.floor===undefined'),true,'unknown or unowned paints refused');
  run("dispatch('paint35',{id:'indigo'});");assert.equal(run('S.home.wall'),'indigo');const want=run("new THREE.Color('#8C9BC0').getHex()");
  assert.deepEqual(J('TUNE35.flat.walls.map(m=>m.material.color.getHex())'),Array(6).fill(want),'all six walls painted');
  assert.equal(run('TUNE35.flat.walls.every((m,k)=>m.material!==ORIG[k]&&ORIG[k].color.getHex()===ORIGHEX[k])'),true,'the shared materials keep their colour');
  assert.equal(run('TUNE35.flat.floor.material===FORIG'),true,'the floor is untouched');
  run("openLife34('home')");const hp=run('panel.innerHTML');assert(hp.includes('Walls and floor')&&hp.includes('data-act="paintUndo35"')&&hp.includes('aria-label="Paint the walls Adire indigo"'),'home strip with the undo');
  run("dispatch('paintUndo35',TUNE35.paintUndo);");assert.equal(run('S.home.wall'),undefined);assert.equal(run('TUNE35.flat.walls.every((m,k)=>m.material===ORIG[k])'),true,'undo restores the original material objects');
  // a paint replayed from the other device ends this device's paint undo (its undo would revert the other device's change)
  run("S.home.paints.push('teak');dispatch('paint35',{id:'indigo'});");assert.equal(run('!!TUNE35.paintUndo'),true);
  run("_silent=true;ACTIONS.paint35({id:'teak'});_silent=false;");assert.equal(run('TUNE35.paintUndo'),null,'a remote paint ends the local paint undo');
  run("delete S.home.floor;S.home.paints=S.home.paints.filter(p=>p!=='teak');applyPaint35();");
  run("dispatch('paint35',{id:'wall:base'});dispatch('paint35',{id:'indigo'});dispatch('lifeTab',{v:'home'});");assert.equal(run('!!TUNE35.paintUndo'),true,'a tab change keeps the paint undo');run("dispatch('lifeGo',{v:'garden'});");assert.equal(run('TUNE35.paintUndo'),null,'another action ends it');
  run("save();S=load();enterWorld();closePanel();");assert.equal(run('S.home.wall'),'indigo');assert.deepEqual(J('TUNE35.flat.walls.map(m=>m.material.color.getHex())'),Array(6).fill(want),'kept over reload');
  // a courtyard style: env takes its material back, then paint goes over the new one; on a FADEABLE wall env disposes only its own clone
  run("envApplyMaterials(ENV_PRESETS[1]);");assert.deepEqual(J('TUNE35.flat.walls.map(m=>m.material.color.getHex())'),Array(6).fill(want),'kept over a courtyard style');
  run("globalThis.FW=TUNE35.flat.walls[0];FADEABLE.push(FW);envApplyMaterials(ENV_PRESETS[2]);globalThis.ENVC=FW.userData.paint35Base;globalThis.TUNEC=FW.material;globalThis.DISP=[];globalThis.INENV=false;"+
   "ENVC.dispose=function(){DISP.push('env-clone'+(INENV?'@env':'@tune'));};TUNEC.dispose=function(){DISP.push('tune-clone'+(INENV?'@env':'@tune'));};"+
   "{const r=envRegisterDiorama;globalThis.ERD=r;envRegisterDiorama=function(){INENV=true;return r.apply(this,arguments);};}envApplyMaterials(ENV_PRESETS[3]);INENV=false;envRegisterDiorama=ERD;");
  assert.equal(run('ENVC!==TUNEC&&FW.userData.environmentOwnedMaterial===true'),true);assert.deepEqual(J('DISP'),['tune-clone@tune','env-clone@env'],'TUNE disposes its clone first; env disposes only its own');
  assert.equal(run('FW.material.color.getHex()'),want);assert.equal(run('FW.material.transparent'),true,'a FADEABLE wall keeps a fadeable material');
  run("FADEABLE.splice(FADEABLE.indexOf(FW),1);envApplyMaterials(ENV_PRESETS.find(p=>p.id===ENV23.id)||ENV_PRESETS[0]);");
  // an unknown paint id (a later build's) renders unpainted and is kept
  run("S.home.wall='mystery';applyPaint35();openLife34('home');");assert.equal(run('TUNE35.flat.walls.every(m=>!m.userData.paint35Own)'),true);assert.equal(run('S.home.wall'),'mystery');
  run("delete S.home.wall;applyPaint35();");return {wallHex:'#8C9BC0',prices:J('PAINTS35.map(p=>p.price)')};});

 // 9. Copy
 check(9,'Copy: no “two watered nights”; plan details start “Tomorrow morning,” without a lesson price; Tunde’s card, the note and the almanac follow the rules',()=>{
  oldHH();at(...HOME);run("life34();S.day=S.life.startDay+2;S.life.crop.stage=3;");const today=run('todayHTML34()');assert(!today.includes('two watered nights'));assert(today.includes('<h2>Look what you grew.</h2>'));assert(today.includes('The first peppers are ready to pick.'));
  for(const s of [0,1,2,3]){run(`S.life.crop.stage=${s};S.life.crop.wateredDay=0;`);assert(!run('gardenHTML34()').includes('two watered nights'),'garden stage '+s);}
  run("S.life.crop.stage=2;");assert(run('gardenHTML34()').includes('Water it today and the peppers will ripen.'));assert(run('todayHTML34()').includes('The pepper plant is taller this morning.'));
  run("S.life.crop.stage=1;");assert(run('gardenHTML34()').includes('taller by morning'));
  run("S.life.crop.stage=0;");assert(!run('gardenHTML34()').includes('note'),'old households have no note');
  const plans=J('Object.values(PLANS33)');assert.equal(plans.length,3);for(const p of plans){assert(p.detail.startsWith('Tomorrow morning,'),p.detail);assert(!p.detail.includes('₦')&&!p.detail.includes('balcony planter'),p.detail);}
  assert(J('Object.values(PLANS33).map(p=>p.title)').some(t=>t.includes('Mr. Bassey')),'titles kept');
  newHH();at(...HOME);const t1=run('REQUESTS34.tunde[0].text');assert(t1.includes('empty for now'));assert(run('todayHTML34()').includes('<b>An empty pot, for now</b>'));
  run("S.day=2;TUNE35.grantSeedling();");const t2=run('REQUESTS34.tunde[0].text');assert(t2.startsWith('I left a seedling'));assert(run('gardenHTML34()').includes('a note by the pot'),'the note once the seedling is here');
  run("S.recipes=S.recipes.filter(r=>r!=='puffpuff');");const al=run('almanacHTML34()');assert(al.includes('Mama Nkechi’s recipes')&&al.includes('not yet')&&!al.includes('undefined'));
  newHH();at(...HOME);run("TOASTS=[];document.getElementById('toast').textContent='';_silent=true;ACTIONS.lifePlant();_silent=false;");assert.deepEqual(J('TOASTS'),[]);assert.equal(run("document.getElementById('toast').textContent"),'','no toast on a replay');
  return {tunde:[t1,t2]};});

 // 10. Companion line
 check(10,'Finds never asks for agreement; in a companion household the companion approves in the toast',()=>{
  newHH();run('S.money=50000;');at(...STALL);at(21.6,7.6,1);const offers=J('offers34()');const t=offers.find(x=>!run(`!!ITEMS['${x}'].replaces`))||offers[0];
  const m0=run('S.money');run(`TOASTS=[];dispatch('lifeBuy',{t:'${t}'});`);assert.equal(run('S.money'),m0-run(`paid34('${t}')`),'bought at once');assert.equal(J('TOASTS').length,1,'one toast: '+J('TOASTS').join(' | '));const last=J('TOASTS').pop();
  assert(new RegExp('^'+run(`ITEMS['${t}'].name`).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+' is in Build storage\\. Ola: “[^”]+”$').test(last),last);
  run("TOASTS=[];dispatch('buyPaint35',{id:'ochre'});");const pl=J('TOASTS').pop();assert(/^Ochre limewash is yours\. Change the walls and floor from Home\. Ola: “[^”]+”$/.test(pl),pl);
  // the companion across town says nothing
  at(...AWAY,1);run("TOASTS=[];dispatch('buyPaint35',{id:'teak'});");assert.deepEqual(J('TOASTS'),['Teak brown is yours. Change the walls and floor from Home.'],'no line from a companion out of earshot');at(21.6,7.6,1);
  const t2=offers.find(x=>x!==t&&!run(`!!ITEMS['${x}'].replaces`));run(`AI.on=false;TOASTS=[];dispatch('lifeBuy',{t:'${t2}'});`);const two=J('TOASTS');assert(two.length>=1&&two.every(s=>!s.includes(':')),'no companion line for two humans: '+two.join(' | '));run('AI.on=true;');
  return {toast:last,paint:pl};});

 // 11. Shop floor
 check(11,'Companion shop floor: during the guided shop stage a new household’s companion buys any jollof item it can afford',()=>{
  newHH();run("S.sofa.state='placed';S.time=10;S.money=5000;AI.bought=[];for(const k of RECIPES.jollof.needs){delete S.pantry[k];}reconcile33();");assert.equal(run('evening33().stage'),'shop');
  const want=J('(()=>{const w=aiShoppingItem();return w&&{k:w.k,st:w.st.id};})()');assert(want&&run(`RECIPES.jollof.needs.includes('${want.k}')`),'an item: '+JSON.stringify(want));
  const price=run(`(()=>{const it=S.mkt.items['${want.k}'];const st=STALLS.find(s=>s.id==='${want.st}');return it?Math.round(it.price*(1-(S.mkt.disc[st.id]||0))/50)*50:ING['${want.k}'].price;})()`);assert(price<=5000,'affordable: '+price);
  run("S.money=0;");assert.equal(J('aiShoppingItem()'),null,'nothing when nothing is affordable');run("S.money=5000;S.time=20;");assert.equal(J('aiShoppingItem()'),null,'not after 19:00');
  run("S.time=10;delete S.born35;");assert.equal(J('aiShoppingItem()'),null,'an old household keeps the old floor');
  return {item:want.k,price};});

 // 12. Weekdays
 check(12,'Weekdays: none in item blurbs, the square, occasions, courtyard styles, the copy table, the journal, the noticeboard, Nkechi’s café line or the film-night toast',()=>{
  const bad=[];const scan=(where,s)=>{if(WEEKDAY35.test(String(s)))bad.push(where+': '+String(s).match(WEEKDAY35)[0]);};
  for(const [k,b] of Object.entries(J('Object.fromEntries(Object.entries(ITEMS).map(([k,v])=>[k,v.blurb]))')))scan('blurb '+k,b);
  J('SQUARE_STAGES').forEach((s,k)=>scan('square '+k,s));newHH();J('occasions().map(o=>o.name)').forEach(s=>scan('occasion',s));
  assert(J('occasions().map(o=>o.id)').includes('sunday'),'occasion ids are save data and stay');
  for(const p of J('ENV_PRESETS.map(p=>[p.name,p.tag,p.description])'))p.forEach(s=>scan('preset',s));
  for(const s of J('TUNE35.copyFix.map(([a])=>TUNE35.fixCopy(a))'))scan('copyFix',s);
  for(const [a,b] of J('TUNE35.copyFix')){scan('replacement',b);assert(!/\b(neighbor|color|favorite|center|gray|apartment|mom)\b/i.test(b),b);}
  at(...HOME);for(const tab of ['today','garden','market','home','almanac']){run(`openLife34('${tab}')`);scan('journal '+tab,run('panel.innerHTML'));}
  run('openBoard()');const board=run('panel.innerHTML');scan('noticeboard',board);assert(board.includes('Compound meeting this week.'));
  run("toast('Film night is Saturday. Bring a chair.')");const tt=run("document.getElementById('toast').textContent");scan('toast',tt);assert.equal(tt,'Film night is coming. Bring a chair.');
  run("remember('The square’s stage, finished. Film night next Saturday.','moment');");scan('memory',run('S.memories[S.memories.length-1].caption'));
  assert.deepEqual(bad,[]);const s=subOK('12');return Object.assign({scanned:'blurbs, square, occasions, presets, copy table, five journal tabs, noticeboard, toast, memory, talk'},s);});

 const report={build:run('BUILD_ID'),passed:checks.every(c=>c.passed)&&checks.length===12,checks,method:'Actual runtime state and actions in Node with the shipped Three.js and the authored hero; companion households made through dispatch(aiStart); the wall clock stubbed through CLOCK35; checks 3 and 12 include a subset pass that loads the v35 modules only up to tune-v35.js. Nothing rendered here; layout was looked at separately in headless Chromium.'};
 fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);if(SUBSET){process.exitCode=1;return;}let build=null;try{build=runFn&&runFn('BUILD_ID');}catch(_){}
 fs.writeFileSync(OUT,JSON.stringify({build,passed:false,checks,failure:String(e&&e.message||e).split('\n')[0]},null,2)+'\n');process.exitCode=1;});

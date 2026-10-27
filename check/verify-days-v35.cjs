// v35 whole script (docs/PLAN_v35_three_days.md section 6, spec 10.2): companion households driven through days 1 to 3
// by real actions only, on the shipped runtime in Node with the vendored Three.js and every v35 module loaded.
// State changes come from dispatch(...) of real actions, the real tick functions (tickFishing34, TICK_HOOKS, aiDrive)
// and sofaSuccess() to finish the move-in. The only direct edits are player positions, S.time for the evening, and the
// deterministic stubs (rng, Date.now, CLOCK35). Writes check/results-days-v35.json; no wall-clock value reaches it.
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {load}=require('./runtime-harness.cjs');
const OUT=path.join(__dirname,'results-days-v35.json');
const WEEKDAY35=/\b(mon|tues|wednes|thurs|fri|satur|sun)days?\b/i;
const checks=[];let runFn=null,failed=false;

(async()=>{
 const {run}=await load();runFn=run;
 // determinism helpers (spec 11.2)
 run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;");
 run("var T35=1790000000000;CLOCK35.fn=()=>T35;");
 run("var PH='',TOASTS=[],CUES=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}CUE35_HOOKS.push(n=>CUES.push(n));");
 // The overlay keeps its real open/closed state (the Node DOM stub's classList.contains is always false), so
 // overlayOpen(), the 300 ms Act guard, the panel clock and the evening's start conditions behave as in the browser.
 run("{const s=new Set();ov.classList.add=c=>{s.add(c);};ov.classList.remove=c=>{s.delete(c);};ov.classList.contains=c=>s.has(c);}");
 // Insertions into the open panel (party lines, request cards) are kept in its html, as a browser would.
 run("panel.insertAdjacentHTML=function(p,h){if(p==='beforeend')this.innerHTML+=h;else if(p==='afterbegin')this.innerHTML=h+this.innerHTML;};");
 const J=c=>JSON.parse(run('JSON.stringify('+c+')'));
 const act=(n,d={})=>run(`dispatch(${JSON.stringify(n)},${JSON.stringify(d)})`);
 const at=(x,z,i=0)=>run(`players[${i}].y=0;players[${i}].g.position.set(${x},0,${z});players[${i}].prev=[${x},${z}];`);
 const hooks=(n,ms=33)=>run(`for(let k=0;k<${n};k++){T35+=${ms};for(const h of TICK_HOOKS)h(1/30,!overlayOpen());}`);
 const walk=s=>hooks(Math.round(s*30));
 const home=()=>{at(-5.2,4.4);at(-5.6,3.6,1);},veranda=()=>at(-4.1,6.4),market=()=>at(20.8,7.2),rocks=()=>at(12.3,13.9);
 const toNPC=k=>{assert(run(`npcs[${JSON.stringify(k)}].g.visible`),k+' is out in the compound');run(`{const n=npcs[${JSON.stringify(k)}];players[0].y=0;players[0].g.position.set(n.g.position.x+0.8,0,n.g.position.z);}`);};
 const money=()=>run('S.money'),stage=()=>run('S.life.crop.stage');
 const bind=(p,v)=>{run(`{const path=${JSON.stringify(p)}.split('.');let o=S;for(let i=0;i<path.length-1;i++)o=o[path[i]];o[path[path.length-1]]=${JSON.stringify(v)};}DAYS35.onInput({target:{dataset:{bind:${JSON.stringify(p)}}}});`);};
 const lastLine=k=>J(`(()=>{const u=S.life.lines35.used[${JSON.stringify(k)}],id=u[u.length-1],l=LINES35[${JSON.stringify(k)}].find(x=>x.id===id);return {id,when:l.when};})()`);
 const leadOrder=()=>J(`(()=>{const h=PH,i=h.indexOf('morning35-lead');if(i<0)return null;const m=h.slice(i).match(/<span class="life-label34">([^<]+)</);return m?m[1].split(' · ')[0]:null;})()`);
 const check=(name,fn)=>{try{assert.equal(run('typeof DAYS35+typeof TUNE35+typeof EVENING35+typeof LINES35+typeof AUDIO35'),'objectobjectobjectobjectobject','every v35 module is loaded');
   const info=fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});console.log('PASS',name);}
  catch(e){failed=true;checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});console.log('FAIL',name);if(process.env.DEBUG35)console.error(e&&e.stack||e);}};

 run("buildTextures();buildTextures2();buildWorld();");
 const fresh=()=>{run("NET.on=false;_silent=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});");act('movein');run("closePanel();PH='';TOASTS=[];CUES=[];");};

 // One cast at the rocks with the clock stubbed at 5 fps (T35 +200 ms per tickFishing34(.05)).
 // With press=true, Act (actPrimary35, 300 ms after each panel change) presses Cast, Reel in and Keep.
 const fish=(press,how)=>{rocks();run('closePanel()');const c0=run('CUES.length');act('lifeFish');assert(run("LIFE34.fish&&LIFE34.fish.phase==='ready'"),'the fishing panel is open');
  if(press){run('T35+=300');assert.equal(run('actPrimary35()'),true,'Act presses Cast');}else act('lifeCast');
  assert.equal(run('LIFE34.fish.phase'),'waiting','cast');const t0=run('T35');
  const n=run("(()=>{let k=0;for(;k<60&&LIFE34.fish.phase==='waiting';k++){T35+=200;tickFishing34(.05);}return k;})()");
  assert.equal(run('LIFE34.fish.phase'),'bite','bite within 60 steps');const bite=Math.round((run('T35')-t0)/10)/100;
  assert(bite>=2.2&&bite<=4.4+0.2,'bite at '+bite+' s of stubbed wall time');
  assert.deepEqual(J(`CUES.slice(${c0})`),['cast','nibble','bite'],'nibble before bite');
  if(press){run('T35+=300');assert.equal(run('actPrimary35()'),true,'Act presses Reel in');assert(run('!!S.life.catch'));run('T35+=300');const id=run('S.life.catch.id');assert.equal(run('actPrimary35()'),true,'Act presses Keep');
   assert.equal(run('S.life.catch'),null);return {bite,steps:n,fish:id,how:'keep'};}
  act('lifeReel');const id=run('S.life.catch.id'),v=J(`FISH34.find(f=>f.id===${JSON.stringify(id)}).value`),m0=money();act('lifeCatch',{v:how});assert.equal(money()-m0,how==='sell'?v:0);return {bite,steps:n,fish:id,how,value:v};};

 // Day 1 for both paths: move-in, shop or basket, jollof at both stations, the housewarming, gift and plan.
 const day1=shopping=>{const out={};
  run("sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();");assert.equal(run('S.sofa.state'),'placed');assert.equal(run('S.firstEvening.stage'),'shop');run('closePanel()');walk(20);
  if(shopping){const bought=[];
   for(;;){const next=J(`(()=>{const c=RECIPES.jollof.needs.filter(k=>!haveCount(k)&&!Object.values(S.p).some(p=>p.basket&&p.basket[k])).map(k=>{const st=STALLS.find(s=>s.items.includes(k));const it=S.mkt.items[k];return {k,st:st.id,price:it?Math.round(it.price*(1-(S.mkt.disc[st.id]||0))/50)*50:ING[k].price};}).filter(o=>o.price<=S.money).sort((a,b)=>a.price-b.price||(a.k<b.k?-1:1));return c[0]||null;})()`);
    if(!next)break;at(14,0);act('buy',{i:0,k:next.k,st:next.st,price:next.price});bought.push(next.k+':'+next.price);}
   out.bought=bought;out.afterShop=money();home();act('eveningCook');}
  home();act('eveningHelp');assert.equal(run('S.firstEvening.help'),true,'the welcome basket fills what is missing');
  // the pot is empty and planting is refused on day 1
  veranda();const t0=run('TOASTS.length');act('lifePlant');assert.equal(stage(),0,'no planting on day 1');assert.deepEqual(J(`TOASTS.slice(${t0})`),['Tunde’s seedling arrives tomorrow morning.']);
  assert.equal(run('TUNE35.seedlingPending()'),true);home();
  act('eveningCook');act('cook',{r:'jollof'});for(const [i,ix] of [[0,0],[1,0],[0,0],[1,1]])act('cookans',{i,ix});act('serve');assert.equal(run('S.dishes.length'),1,'jollof served');run('closePanel()');walk(10);
  // meet Ada first so she can come to the party (guestOK), then host
  if(!shopping){toNPC('ada');act('hs',{i:0,id:'talk:ada'});out.adaFirst=lastLine('ada');}
  home();act('eveningHost');act('ptdish',{ix:0});act('ptmusic',{v:'none'});act('ptinv',{k:'tunde'});
  const adaOK=run("guestOK('ada').ok");if(adaOK)act('ptinv',{k:'ada'});act('partystart');assert.equal(run('S.party.round'),1);out.guests=J('S.party.guests');
  for(let r=0;r<4;r++)run("dispatch('ptpick',{i:0,v:S.party.opts[0].id});dispatch('ptpick',{i:1,v:(S.party.opts[1]||S.party.opts[0]).id});dispatch('ptgo');");
  assert.equal(run('S.party.done'),true,'four rounds');out.partyPanel=run('panel.innerHTML');
  act('eveningGift',{v:'art'});act('eveningPlan',{v:'garden'});assert.equal(run('S.firstEvening.completed'),true);assert.equal(run('guided33()'),false);
  out.money=money();return out;};

 // The night: sleep shows the recap and the faces; rate; nextday opens the morning.
 const night=(day,v)=>{home();run("PH=''");act('sleep');const night=run('PH');const recap=(night.match(/<div class="recap35"><p class="recap35-kicker">TOMORROW<\/p><p>([^<]*)<\/p>/)||[])[1];
  assert(night.includes('How was today?'),'the faces');act('rate35',{v:String(v),day:String(day)});assert.equal(run(`S.life.days['${day}'].rating`),v);
  return {recap,html:night};};
 const morning=()=>{run("T35+=60000;TOASTS=[];PH=''");act('nextday');const t=J('TOASTS'),today=run('PH');
  // ticks alone never start the day: before the first dispatch nothing is counted
  walk(2);const r=J('LOG35.today()');assert(r&&r.startedAt===null&&r.playedMs+r.panelMs===0&&r.events.length===0,'the new day waits for the player');return {toasts:t,today};};

 const A={};
 // ---------------- Path A: the basket ----------------
 check('A1. Path A: a new companion household (aiStart, setupnext x2, movein) starts with ₦6,000 and born35',()=>{fresh();
  assert.equal(money(),6000);assert.equal(run('S.born35'),true);assert.equal(run('S.ai&&AI.on'),true);assert.equal(run('S.day'),1);return {money:6000};});

 check('A2. Path A day 1: sofa in, welcome basket first, jollof at both stations, housewarming, gift and plan; the pot stays empty and planting is refused',()=>{
  A.d1=day1(false);assert.equal(A.d1.money,6000,'the basket path spends nothing');assert(A.d1.guests.includes('tunde'));
  return {guests:A.d1.guests,adaFirstLine:A.d1.adaFirst.id,money:A.d1.money};});

 check('A3. Path A day 1: the party panel carries Tunde’s seedling promise and, with Ada there, the armchair she sold to Finds',()=>{
  const p=A.d1.partyPanel,tun=run("esc(text35('party.tunde.seedling'))");assert(p.includes(tun),'Tunde’s promise');
  const ada=A.d1.guests.includes('ada');if(ada)assert(p.includes(run("esc(text35('party.ada.armchair'))")),'Ada’s armchair');
  assert(A.d1.adaFirst.when.includes('chair-unsold')||A.d1.adaFirst.when.includes('first'),'Ada’s first line: '+A.d1.adaFirst.when);
  return {tunde:true,ada};});

 check('A4. Path A night 1: sleep gives the recap “Tunde said he would leave something in your pot.” and the day-1 rating is stored',()=>{
  const n=night(1,2);assert.equal(n.recap,'Tunde said he would leave something in your pot.');A.recap1=n.recap;return {recap:n.recap,rating:2};});

 check('A5. Path A day 2 morning: the seedling row, the seed granted, Today’s morning card with Tunde’s card first, the marker at the pot and no toast',()=>{
  const m=morning();assert.equal(run('S.day'),2);assert.deepEqual(m.toasts,[],'the morning adds no toast');
  assert.equal(J('S.life.morning35').id,'seedling');assert.equal(run('S.life.seed35.day'),2);
  assert(m.today.startsWith('<section class="life34">')&&m.today.includes('data-morning="seedling"'),'Today with the seedling card');
  assert.equal(leadOrder(),run("esc(CAST.tunde.name)"),'Tunde’s card leads');
  assert.deepEqual(J('[LIFE34.waypoint.x,LIFE34.waypoint.z]'),[-5.6,6.35],'marker at the pot');return {row:'seedling',lead:leadOrder()};});

 check('A6. Path A day 2: plant the seedling and water it at home; Today’s morning card then says it is done, with no button back to the pot, and the pot marker is cleared',()=>{run('closePanel()');veranda();walk(10);act('lifePlant');assert.equal(stage(),1);act('lifeWater');assert.equal(run('S.life.crop.wateredDay'),2);
  assert.equal(CUESlast(),'water');assert.equal(J('LIFE34.waypoint'),null,'the pot marker has done its job');
  const t=run('todayHTML34()'),card=(t.match(/<div class="life-note34 morning35" data-morning="seedling">[\s\S]*?<\/div>/)||[''])[0];
  assert(card.includes('<h3>Planted and watered</h3>')&&card.includes('It will be taller by morning.'),'done card: '+card.slice(0,200));assert(!/lifeGo|lifeTab/.test(card),'no button back to the pot');
  return {stage:1,card:'Planted and watered'};});
 function CUESlast(){return run('CUES[CUES.length-1]');}

 check('A7. Path A day 2: at the rocks the bite follows the stubbed wall clock (2.2-4.4 s at 5 fps), the nibble comes first, and Act alone casts, reels in and keeps the first fish',()=>{
  run('closePanel()');home();hooks(2);rocks();walk(20);A.fish=[fish(true)];assert.equal(run("haveCount('fish')"),1,'one fish kept for Mama Nkechi');return {first:A.fish[0]};});

 check('A8. Path A day 2: the fish goes to Mama Nkechi (+₦1,000, the recipe); the purse is below ₦9,000 straight after the errand',()=>{
  toNPC('nkechi');const m0=money();act('lifeRequest',{k:'nkechi'});assert.equal(money()-m0,1000);assert(run("S.recipes.includes('beansdodo')"));
  A.afterErrand=money();assert(A.afterErrand<9000,'purse '+A.afterErrand);return {purseAfterErrand:A.afterErrand};});

 check('A9. Path A day 2: catches sold from the catch card until the purse reaches ₦9,000 (one or two)',()=>{let sold=0;
  while(money()<9000&&sold<12){A.fish.push(fish(false,'sell'));sold++;}A.sold=sold;assert(money()>=9000);assert(sold>=1&&sold<=2,'sold '+sold);
  return {sold,purse:money(),bites:A.fish.map(f=>f.bite)};});

 check('A10. Path A day 2: Ada’s armchair at Finds costs ₦9,000, with no agreement step and one approving line from the companion',()=>{
  run('closePanel()');market();at(21.5,7.6,1);walk(15);const m0=money(),t0=run('TOASTS.length');act('lifeBuy',{t:'armchair'});assert.equal(m0-money(),9000);assert(run("S.home.storage.includes('armchair')"));
  const all=J(`TOASTS.slice(${t0})`),t=all.slice(-1);const nm=run('ITEMS.armchair.name');assert.equal(all.length,1,'one toast: '+all.join(' | '));assert(t[0].startsWith(nm+' is in Build storage. Ola: “')&&t[0].endsWith('”'),t[0]);assert(run("PH.startsWith('<section class=\"life34\">')"),'back on Finds, nothing to confirm');
  return {toast:t[0],purse:money()};});

 check('A11. Path A day 2: the armchair placed on the veranda, undone, turned and placed again (y=4)',()=>{veranda();
  const ix=()=>run("S.home.storage.indexOf('armchair')");act('lifeSelect',{ix:ix()});act('lifeCell',{x:1,y:4});assert(run("S.home.items.some(i=>i.type==='armchair'&&i.x===1&&i.y===4)"),'placed');
  act('lifeUndo');assert(run("!placed('armchair')&&S.home.storage.includes('armchair')"),'undone');
  act('lifeSelect',{ix:ix()});act('lifeRotate');act('lifeCell',{x:1,y:4});const it=J("S.home.items.find(i=>i.type==='armchair')");assert.equal(it.y,4);assert.equal(it.rot,1);
  return {x:it.x,y:it.y,rot:it.rot};});

 check('A12. Path A day 2: Tunde credits the watering, Ada the chair; their requests are done (plant, wall art)',()=>{
  toNPC('tunde');act('hs',{i:0,id:'talk:tunde'});const tl=lastLine('tunde');assert(tl.when.includes('watered'),'Tunde '+tl.id+' '+tl.when);
  toNPC('ada');act('hs',{i:0,id:'talk:ada'});const al=lastLine('ada');assert(al.when.includes('chair-placed')||al.when.includes('chair-veranda'),'Ada '+al.id+' '+al.when);run('closePanel()');
  toNPC('tunde');act('lifeRequest',{k:'tunde'});toNPC('ada');act('lifeRequest',{k:'ada'});assert.deepEqual(J("[request34('tunde').stage,request34('ada').stage,request34('nkechi').stage]"),[1,1,1]);
  return {tunde:tl.id,ada:al.id};});

 check('A13. Path A night 2: the recap “The seedling will be taller by morning.” and, since Ada has already talked about the chair today, “Ada approves of where the armchair went.”; Ada’s smelled-good line only on a night something was cooked',()=>{
  assert(J('S.life.lines35.used.ada').some(id=>id==='ad03'||id==='ad04'),'Ada said her armchair line today');
  const n=night(2,3);assert.equal(n.recap,'The seedling will be taller by morning. Ada approves of where the armchair went.');A.recap2=n.recap;
  assert(!n.html.includes('Something smelled good'),'nothing was cooked on day 2');assert(n.html.includes('>Sleep until tomorrow<'),'the night button says Sleep until tomorrow');return {recap:n.recap};});

 check('A14. Path A day 3 morning: “It grew overnight”, Mama Nkechi’s card leads, the plant is at stage 2',()=>{
  const m=morning();assert.equal(run('S.day'),3);assert.equal(stage(),2);assert.equal(J('S.life.morning35').id,'grew');assert(m.today.includes('data-morning="grew"')&&m.today.includes('<h3>It grew overnight</h3>'));
  assert.equal(leadOrder(),run("esc(CAST.nkechi.name)"),'Mama Nkechi’s card leads');return {row:'grew',lead:leadOrder()};});

 check('A15. Path A day 3: watering ripens it at once; the harvest gives three peppers and resets the pot to stage 1',()=>{run('closePanel()');veranda();walk(10);act('lifeWater');assert.equal(stage(),3);
  const p0=run("haveCount('pepper')");act('lifeHarvest');assert.equal(run("haveCount('pepper')")-p0,3);assert.equal(stage(),1);return {peppers:3};});

 check('A16. Path A day 3: Tunde +₦1,500, two peppers to Mama Nkechi (+₦2,000 and spices), two shells to Ada (+₦1,500)',()=>{const m=[];
  toNPC('tunde');let m0=money();act('lifeRequest',{k:'tunde'});m.push(money()-m0);
  toNPC('nkechi');m0=money();const s0=run("haveCount('spices')");act('lifeRequest',{k:'nkechi'});m.push(money()-m0);assert.equal(run("haveCount('spices')")-s0,1);
  for(const k of [0,1]){run(`players[0].y=0;players[0].g.position.set(SHELLS34[${k}][0],0,SHELLS34[${k}][1])`);act('lifeShell',{k});}assert.equal(run('S.life.shells'),2);
  toNPC('ada');m0=money();act('lifeRequest',{k:'ada'});m.push(money()-m0);run('closePanel()');walk(10);assert.deepEqual(m,[1500,2000,1500]);return {cash:m,purse:money()};});

 check('A17. Path A day 3: a paint bought at Finds, painted, undone, painted again, and still on the walls after save and Continue',()=>{
  market();const m0=money();act('buyPaint35',{id:'palm'});assert.equal(m0-money(),2000);home();act('paint35',{id:'palm'});assert.equal(run('S.home.wall'),'palm');
  const hex=run("new THREE.Color('#A9BF9C').getHex()"),walls=()=>J('TUNE35.flat.walls.map(m=>m.material.color.getHex())');assert(walls().every(h=>h===hex),'walls painted');
  act('paintUndo35',J('TUNE35.paintUndo'));assert.equal(run('S.home.wall'),undefined);assert(walls().every(h=>h!==hex),'undone');act('paint35',{id:'palm'});
  run('save();ACTIONS.continue();');assert.equal(run('S.home.wall'),'palm');assert.equal(walls().length,6);assert(walls().every(h=>h===hex),'kept after Continue');return {paint:'palm',walls:6};});

 // the day-3 household is kept for the missed-evening run
 let snapDay3=null;
 check('A18. Path A day 3 veranda evening: from 18:00 with the human on the veranda the three neighbours each say a line, Ada’s about the armchair, each turned within 70 degrees of the camera through the real base frame (the speaker in three-quarter); the companion stands beside the player; on every frame of the three lines the real camera cuts nobody, eases in only as far as everyone still fits, and changes under 1% a frame after its first eased frame',()=>{
  snapDay3=run('JSON.stringify(S)');run("closePanel();S.time=18.3;");veranda();at(-5.2,4.0,1);
  const k0=run("(()=>{let k=0;for(;k<60&&EVENING35.state==='idle';k++){T35+=33;for(const h of TICK_HOOKS)h(1/30,!overlayOpen());}return k;})()");assert.equal(run('EVENING35.state'),'arriving','started');
  const spots=J('EVENING35.spots');
  // the real base frame (index.html tick: the companion's drive, TICK_HOOKS, the NPC loop, updateCameras); nothing is drawn, so renderFrame
  // only sets the view's aspect, as the real one does. Each frame records the real camera: its distance to the focus, its share of the fitted
  // distance, whether the player or a guest is cut by the screen edge (0.6 x 1.9 m bodies projected with the game's camera), and whether it
  // could have come 1% nearer with everyone still fitting
  run(`var frame35=()=>{const rf=renderFrame;renderFrame=function(){const si=singleIdx(),c=cams[si>=0?si:0];c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();};try{T35+=33;last=0;tick(33);}finally{renderFrame=rf;}
   const si=singleIdx(),i=si>=0?si:0,c=cams[i];c.updateMatrixWorld();const d=c.position.distanceTo(focus[i]),r=d/v21Dist[i],v=new THREE.Vector3();let cut=null;
   for(const [k,o] of [['player',players[0].g],['tunde',npcs.tunde.g],['nkechi',npcs.nkechi.g],['ada',npcs.ada.g]]){if(!o.visible)continue;for(const dx of [-.3,.3])for(const y of [0,1.9])for(const dz of [-.3,.3]){v.set(o.position.x+dx,y,o.position.z+dz).project(c);if(Math.abs(v.x)>1||Math.abs(v.y)>1)cut=k;}}
   return {line:EVENING35.line,state:EVENING35.state,d,r,cut,nearer:r<0.9999?EVENING35.fits(i,r-0.01):null};};`);
  run("(()=>{for(let k=0;k<700&&EVENING35.state==='arriving';k++)frame35();})()");assert.equal(run('EVENING35.state'),'talking');
  let minCam=1;const seen=[],facing=[],cam=[];
  for(let line=0;line<3;line++){seen.push(run('EVENING35.el.dataset.who'));
   for(let k=0;k<45;k++){const s=J('frame35()');cam.push(s);assert.equal(s.cut,null,'line '+(line+1)+', frame '+k+': nobody cut by the camera: '+JSON.stringify(s));if(line===0)minCam=Math.min(minCam,s.r);}
   if(line===0){const e=cam[cam.length-1];assert(e.r<=0.76||e.nearer===false||(e.r>=0.9999&&!run('EVENING35.fits(0,0.99)')),'the camera eased in as far as everyone still fits: '+JSON.stringify(e));}
   // two real base frames (index.html tick, whose NPC loop turns every idle NPC within 4 m to the nearest player): the guests keep the evening's facing
   const f=J(`(()=>{const rf=renderFrame;renderFrame=()=>{};try{for(let k=0;k<2;k++){T35+=33;last=0;tick(33);}}finally{renderFrame=rf;}const cp=cams[0].position,L=EVENING35.lines[EVENING35.line];
    return ['tunde','nkechi','ada'].map(k=>{const o=npcs[k].g,fx=Math.sin(o.rotation.y),fz=Math.cos(o.rotation.y),cx=cp.x-o.position.x,cz=cp.z-o.position.z;
     return {k,speaker:L.k===k,toCamera:Math.round(Math.acos((fx*cx+fz*cz)/Math.hypot(cx,cz))*180/Math.PI)};});})()`);
   for(const g of f){assert(g.toCamera<=70,'line '+(line+1)+': no back to the camera: '+JSON.stringify(g));if(g.speaker)assert(g.toCamera>=30&&g.toCamera<=55,'line '+(line+1)+': the speaker in three-quarter: '+JSON.stringify(g));}
   facing.push(f.map(g=>g.toCamera));
   run("T35+=300;dispatch('hs',{i:0,id:'evening35'});");}
  const lines=J('EVENING35.lines.map(l=>({k:l.k,id:l.id,text:l.text}))');assert.deepEqual(lines.map(l=>l.k),['tunde','nkechi','ada']);assert.deepEqual(seen,['tunde','nkechi','ada']);
  const adaWhen=J(`LINES35.evening.ada.find(e=>e.id===${JSON.stringify(lines[2].id)}).when`);assert(adaWhen.includes('chair-veranda')||adaWhen.includes('chair-placed'),'Ada’s line reads the chair: '+adaWhen);
  assert(/chair/i.test(lines[2].text),'Ada names the chair');assert.equal(run('S.life.evening35.doneDay'),3);
  // no twitch: from the first eased frame on, the camera distance changes under 1% a frame
  let first=-1,maxStep=0;for(let k=0;k<cam.length;k++){if(first<0&&cam[k].r<0.9999)first=k;if(first>=0&&k>first){const st=Math.abs(cam[k].d-cam[k-1].d)/cam[k-1].d;maxStep=Math.max(maxStep,st);
   assert(st<0.01,'the camera moved '+(st*100).toFixed(2)+'% on frame '+k+' of the lines ('+cam[k-1].d.toFixed(3)+' to '+cam[k].d.toFixed(3)+')');}}
  const comp=run("+Math.hypot(players[AI.i].g.position.x-players[0].g.position.x,players[AI.i].g.position.z-players[0].g.position.z).toFixed(2)");assert(comp<=1.2,'companion beside the player: '+comp);
  run("(()=>{for(let k=0;k<900&&EVENING35.state!=='idle';k++){T35+=33;for(const h of TICK_HOOKS)h(1/30,!overlayOpen());}})()");
  return {spots,lines:lines.map(l=>l.k+':'+l.id),cameraRatioFirstLine:Math.round(minCam*1000)/1000,cameraMaxStepPercent:Math.round(maxStep*10000)/100,companionDistance:comp,degreesToCameraPerLine:facing};});

 check('A19. Path A night 3: the recap “The lamp and the rug are back at Finds tomorrow. Tunde says the pot will fruit again.”, the rating, then both day-3 prompts saved through their bind paths',()=>{
  const n=night(3,3);assert(n.recap.startsWith('The ')&&n.recap.endsWith(' are back at Finds tomorrow. Tunde says the pot will fruit again.'),n.recap);
  assert(run("!owned34('lamp')&&!owned34('rug')"),'lamp and rug unowned');assert.equal(n.recap,'The lamp and the rug are back at Finds tomorrow. Tunde says the pot will fruit again.');A.recap3=n.recap;
  assert(run("PH.includes('data-bind=\"life.days.3.want\"')&&PH.includes('data-bind=\"life.days.3.neighbour\"')"),'the two prompts after the rating');
  run('T35+=2000');bind('life.days.3.want','A reading lamp by the window');run('T35+=2000');bind('life.days.3.neighbour','Tunde talks to his peppers');
  const saved=J("(()=>{const d=JSON.parse(localStorage.getItem(KEY)).life.days['3'];return [d.want,d.neighbour];})()");assert.deepEqual(saved,['A reading lamp by the window','Tunde talks to his peppers']);
  const m=morning();assert.equal(run('S.day'),4);return {recap:n.recap,prompts:saved};});

 check('A20. Path A day log: days 1-3 complete with times, ratings, prompts and the script’s events; the Menu copy carries the evening timeline and the days',()=>{
  const d=J('S.life.days');const info={};
  for(const n of [1,2,3]){const r=d[n];assert(r&&r.startedAt!==null&&r.sleptAt!==null&&r.playedMs>0&&r.rating,'day '+n+' complete: '+JSON.stringify(r&&{s:r.startedAt,sl:r.sleptAt,p:r.playedMs,r:r.rating}));
   if(n>1)assert(r.startedAt>=d[n-1].sleptAt,'day '+n+' starts after day '+(n-1)+' slept');assert.equal(r.events[0].k,'wake');}
  assert.equal(d[3].want,'A reading lamp by the window');assert.equal(d[3].neighbour,'Tunde talks to his peppers');
  const kinds=n=>[...new Set(d[n].events.map(e=>e.k))];
  for(const k of ['wake','morning','at-rocks','cast','bite','catch','plant','water','buy','sell','place','request'])assert(kinds(2).includes(k),'day 2 has '+k);
  for(const k of ['morning','water','harvest','request','shell','buy','paint','evening','sleep'])assert(kinds(3).includes(k),'day 3 has '+k);
  const t=run('daysText35()');for(const n of [1,2,3])assert(t.includes('\nDay '+n+' · started '),'daysText35 names day '+n);
  const menu=run('timelineSummary34()');assert(menu.includes('complete:')&&menu.includes('Compound Days days'),'timeline and days');
  for(const n of [1,2,3])info['day'+n]={rating:d[n].rating,events:d[n].events.map(e=>e.k+(e.a?' '+e.a:''))};return info;});

 // ---------------- Missed evening ----------------
 check('M1. Missed evening: the day-3 household away from home from 18:00 to 22:00 is not visited; day 4 opens with evening-again and the evening runs on day 4',()=>{
  assert(snapDay3,'the day-3 household');run(`localStorage.setItem(KEY,${JSON.stringify(snapDay3)});ACTIONS.continue();`);assert.equal(run('S.day'),3);assert.equal(run('EVENING35.done()'),false);
  market();at(21.5,7.6,1);const states=new Set();for(let t=18;t<22.001;t+=0.25){run(`S.time=${t}`);hooks(4);states.add(run('EVENING35.state'));}
  assert.deepEqual([...states],['idle']);assert.equal(run('EVENING35.done()'),false);run('S.time=22.5');home();
  const m=morning();assert.equal(run('S.day'),4);assert.equal(J('S.life.morning35').id,'evening-again');assert(m.today.includes('data-morning="evening-again"'));
  run("closePanel();S.time=18.3;");veranda();at(-5.2,4.0,1);run("(()=>{for(let k=0;k<800&&EVENING35.state!=='talking';k++){T35+=33;for(const h of TICK_HOOKS)h(1/30,!overlayOpen());}})()");assert.equal(run('EVENING35.state'),'talking');
  for(let i=0;i<3;i++)run("T35+=300;dispatch('hs',{i:0,id:'evening35'});");assert.equal(run('S.life.evening35.doneDay'),4);
  // missed twice: day 4 leads with the evening, day 5 has its own row with the evening card under it, and night 4 names the evening
  run(`localStorage.setItem(KEY,${JSON.stringify(snapDay3)});ACTIONS.continue();closePanel();S.time=22.5;`);home();morning();assert.equal(J('S.life.morning35').id,'evening-again');
  run("closePanel();S.time=22.5;");market();at(21.5,7.6,1);const r4=J('recap35()');assert.notEqual(r4.rowId,'evening-again','tomorrow has its own row');assert.equal(r4.clauseId,'evening-missed','night 4 names the evening');
  assert(r4.text.endsWith(run("text35('recap.clause.evening-missed')")),r4.text);home();const m5=morning();assert.equal(run('S.day'),5);assert.equal(J('S.life.morning35').id,r4.rowId);
  assert(m5.today.includes('evening35-card')&&m5.today.includes('The neighbours are coming by'),'Today on day 5 carries the evening card');
  const m6=(run("closePanel();S.time=22.5;"),morning());assert.equal(J('S.life.morning35').id,'evening-again','day 6 leads with the evening again');
  return {day4:'evening-again',doneDay:4,day5:r4.rowId,recap4:r4.text};});

 // ---------------- Path B: shopping ----------------
 const B={};
 check('B1. Path B day 1: a new household buys what jollof needs at the market while it can, takes the basket for the rest, invites Ada without having met her (her armchair line plays) and starts day 2 at or below ₦2,000',()=>{
  // path B starts from its own random state, so its market and catches do not depend on how path A went (the companion's walk there draws Math.random)
  run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();srand(1790000000);");
  fresh();assert.equal(money(),6000);B.d1=day1(true);assert(B.d1.bought.length>=1,'bought at the market');assert.equal(run('S.firstEvening.completed'),true);
  assert(B.d1.guests.includes('ada'),'Ada can be invited on day 1 without a talk first: '+B.d1.guests);assert(B.d1.partyPanel.includes(run("esc(text35('party.ada.armchair'))")),'so the housewarming carries her armchair story');
  night(1,2);morning();assert.equal(run('S.day'),2);B.start=money();assert(B.start<=2000,'day 2 starts at '+B.start);return {bought:B.d1.bought,day2Purse:B.start,guests:B.d1.guests};});

 check('B2. Path B day 2: plant and water, keep one fish for Mama Nkechi, purse below ₦9,000 after her errand, sell catches until the armchair is affordable and place it on the veranda by the end of day 2',()=>{
  assert.equal(J('S.life.morning35').id,'seedling');veranda();act('lifePlant');act('lifeWater');assert.equal(stage(),1);
  home();hooks(2);rocks();hooks(2);const f=[fish(true)];toNPC('nkechi');act('lifeRequest',{k:'nkechi'});B.afterErrand=money();assert(B.afterErrand<9000,'purse '+B.afterErrand);
  let sold=0;while(money()<9000&&sold<12){f.push(fish(false,'sell'));sold++;}assert(sold>=3&&sold<=7,'sold '+sold);
  market();act('lifeBuy',{t:'armchair'});veranda();act('lifeSelect',{ix:run("S.home.storage.indexOf('armchair')")});act('lifeCell',{x:5,y:4});
  assert.equal(run('S.day'),2);assert(run("S.home.items.some(i=>i.type==='armchair'&&i.y===FLAT.rows)"),'the armchair is on the veranda on day 2');
  return {purseAfterErrand:B.afterErrand,sold,bites:f.map(x=>x.bite),cell:J("(({x,y})=>[x,y])(S.home.items.find(i=>i.type==='armchair'))")};});

 // ---------------- Old save ----------------
 check('O1. An old save (no born35, ₦55,000) loads with its money, may plant on day 1 and gets no seedling gate',()=>{
  run("S=newState();S.phase='play';S.money=55000;life34();save();S=null;ACTIONS.continue();");assert.equal(money(),55000);assert.equal(run('S.born35'),undefined);
  veranda();act('lifePlant');assert.equal(stage(),1,'planting allowed on day 1');assert.equal(money(),55000);return {money:55000};});

 // copy hygiene across everything the script showed
 check('Copy: no rendered page or toast in the script names a weekday, and no page shows undefined or NaN',()=>{
  const t=J('TOASTS');for(const s of t)assert(!WEEKDAY35.test(s),s);for(const s of [A.recap1,A.recap2,A.recap3])assert(s&&!WEEKDAY35.test(s));
  for(const p of ['today','garden','market','home','almanac']){run(`openLife34(${JSON.stringify(p)})`);const h=run('panel.innerHTML');assert(!WEEKDAY35.test(h),p);assert(!/undefined|NaN/.test(h),p);}
  return {toasts:t.length};});

 const report={build:run('BUILD_ID'),passed:!failed,checks,method:'Actual shipped runtime with every v35 module in Node, Three.js and glTF; companion households driven by dispatch of real actions and the real tick functions, the wall clock stubbed through CLOCK35. No browser, phone or audio claim.'};
 fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);let build=null;try{build=runFn&&runFn('BUILD_ID');}catch(_){}
 fs.writeFileSync(OUT,JSON.stringify({build,passed:false,checks,failure:String(e&&e.stack||e).split('\n')[0]},null,2)+'\n');process.exitCode=1;});

// v35 DAYS: the day log, the morning table, the recap, the rating and the day-3 prompts (dist/src/days-v35.js),
// checked on the real game logic in Node with a stubbed wall clock. Writes check/results-log-v35.json.
// Every check opens with `typeof LOG35==='object'`, so each one fails without the module.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const SUBSET=process.argv[2]==='--subset';
const {load}=require('./runtime-harness.cjs');
const checks=[];let runFn=null,failed=false;

// a dist that loads only the v35 modules up to and including `last`
function subsetDir35(last){const root=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd35-'));
 for(const f of ['assets','src','data'])if(fs.existsSync(path.join(root,f)))fs.symlinkSync(path.join(root,f),path.join(d,f));
 let html=fs.readFileSync(path.join(root,'index.html'),'utf8'),cut=false;
 for(const [tag,src] of [...html.matchAll(/<script src="([^"]+-v35\.js)"><\/script>\n?/g)]){if(cut)html=html.replace(tag,'');if(src.endsWith('/'+last))cut=true;}
 if(!cut)throw new Error('subset: '+last+' not found');fs.writeFileSync(path.join(d,'index.html'),html);return d;}

(async()=>{
 const {run}=await load();runFn=run;
 // determinism helpers (spec 11.2)
 run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;");
 run("var T35=1790000000000;CLOCK35.fn=()=>T35;");
 run("var PH='',TOASTS=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}");
 const J=c=>JSON.parse(run('JSON.stringify('+c+')'));
 const act=(n,d={})=>run(`dispatch(${JSON.stringify(n)},${JSON.stringify(d)})`);
 const hooks=(n,ms=33)=>run(`for(let k=0;k<${n};k++){T35+=${ms};for(const h of TICK_HOOKS)h(1/30,true);}`);
 const tick=(n,ms)=>run(`for(let k=0;k<${n};k++){T35+=${ms};days_tick35(1/30,true);}`);
 const at=(x,z)=>run(`players[0].y=0;players[0].g.position.set(${x},0,${z});players[0].prev=[${x},${z}];`);
 const home=()=>at(-4.2,6.6),market=()=>at(20.8,7.2),rocks=()=>at(12.3,13.9);
 const approach=k=>run(`npcs[${JSON.stringify(k)}].g.visible=true;players[0].g.position.copy(npcs[${JSON.stringify(k)}].g.position);players[0].y=0`);
 const fresh=()=>{run("NET.on=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();PH='';TOASTS=[];");};
 const wakeNext=()=>{run('T35+=1000');act('nextday');run('T35+=1000;DAYS35.activity()');};
 const has=(n,k,a)=>run(`LOG35.has(${n},${JSON.stringify(k)}${a!==undefined?','+JSON.stringify(a):''})`);
 const count=(n,k,a)=>run(`LOG35.count(${n},${JSON.stringify(k)}${a!==undefined?','+JSON.stringify(a):''})`);
 const isMod=()=>assert.equal(run('typeof LOG35'),'object','days-v35.js is loaded');
 const check=(name,fn)=>{try{run('NET.on=false;_silent=false;');const info=fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});console.log('PASS',name);}
  catch(e){failed=true;checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});console.log('FAIL',name);console.error(e&&e.stack||e);}
  finally{try{run("NET.on=false;_silent=false;if(globalThis.OO35){overlayOpen=OO35;delete globalThis.OO35;}document.hidden=false;if(globalThis.QS35){document.querySelector=QS35;delete globalThis.QS35;}");}catch(_){}}};

 if(SUBSET){
  // 13. Subset pass: only the v35 modules up to days-v35.js are loaded, so EVENING and AUDIO are undeclared.
  run("buildTextures();buildTextures2();buildWorld();");
  check('Subset pass: without the later modules the morning, the recap and the context still work; evening-again needs EVENING35',()=>{isMod();
   assert.equal(run('typeof EVENING35'),'undefined','EVENING35 is undeclared in the subset');assert.equal(run('typeof AUDIO35'),'undefined');
   fresh();run('S.firstEvening.enabled=false;');run('DAYS35.activity()');wakeNext();wakeNext();assert.equal(run('S.day'),3);
   home();run("PH='';T35+=1000;");act('nextday');assert.equal(run('S.day'),4);
   assert(run("PH.startsWith('<section class=\"life34\">')&&PH.includes('morning35')"),'Today with a morning card');
   assert.equal(J("JSON.parse(localStorage.getItem(KEY)).life.morning35").day,4,'the morning was saved');
   const r=J('recap35()'),c=J('morningCtx35(4)');assert.equal(c.eveningPending,false);assert.notEqual(r.rowId,'evening-again');
   const rows=[4,5,6,7,8,9,10].map(d=>run(`pickMorning35(${d},morningCtx35(${d})).id`));assert(!rows.includes('evening-again'),rows.join());
   run("globalThis.EVENING35={pending:()=>true,done:()=>false,doneToday:()=>false,active:()=>false};");
   const row=run('pickMorning35(4,morningCtx35(4)).id');assert.equal(row,'evening-again');run('delete globalThis.EVENING35');
   return {rows,withEvening:row};});
  console.log(JSON.stringify(checks));return;
 }

 run("buildTextures();buildTextures2();buildWorld();");

 // 1. The day's record exists from the start but is woken (startedAt) only by the first player activity.
 check('Wake: the record waits for the first activity; one activity or one dispatched action wakes it once',()=>{isMod();
  fresh();assert.equal(run('S.born35'),true);hooks(30);const r0=J('LOG35.day(1)');assert(r0,'day-1 record exists');assert.equal(r0.startedAt,null);assert.equal(r0.events.length,0);
  run('T35+=500;DAYS35.activity()');const t1=run('T35');let r=J('LOG35.day(1)');assert.equal(r.startedAt,t1);assert.equal(r.events[0].k,'wake');
  run('T35+=500;DAYS35.activity()');assert.deepEqual(J('LOG35.day(1)'),r,'a second activity changes nothing');
  fresh();hooks(3);run('T35+=700');const t2=run('T35');act('lifeTab',{v:'garden'});r=J('LOG35.day(1)');assert.equal(r.startedAt,t2,'a dispatched action wakes the day');assert.deepEqual(r.events.map(e=>e.k),['wake']);
  return {firstEvent:'wake',startedAtOffsetMs:t1-1790000000000};});

 // 2. Logging by wrapping real actions; failed or repeated attempts log nothing.
 check('Logging: plant, water, harvest, cast, bite, catch, sell, buy, place, paint, request, shell, at-rocks and evening log once each on success',()=>{isMod();
  fresh();run('S.firstEvening.enabled=false;S.money=60000;DAYS35.activity()');home();act('lifePlant');assert.equal(count(1,'plant'),0,'no seedling on day 1');
  wakeNext();assert.equal(run('S.day'),2);home();act('lifePlant');act('lifePlant');act('lifeWater');act('lifeWater');
  assert.equal(count(2,'plant'),1);assert.equal(count(2,'water'),1);assert(has(2,'water','1'));
  // fishing: cast, bite (ticks), catch, sell from the catch card, keep a second and sell it from the pantry
  hooks(2);rocks();hooks(2);assert.equal(count(2,'at-rocks'),1,'walking to the rocks logs at-rocks');hooks(2);assert.equal(count(2,'at-rocks'),1,'once per arrival');
  act('lifeFish');act('lifeCast');act('lifeCast');assert.equal(count(2,'cast'),1);
  run("for(let k=0;k<80&&LIFE34.fish&&LIFE34.fish.phase==='waiting';k++){T35+=100;tickFishing34(.1);}");assert.equal(run('LIFE34.fish.phase'),'bite');assert.equal(count(2,'bite'),1);
  act('lifeReel');act('lifeReel');const id1=run('S.life.catch.id');assert.equal(count(2,'catch'),1);assert(has(2,'catch',id1));
  act('lifeCatch',{v:'sell'});act('lifeCatch',{v:'sell'});assert.equal(count(2,'sell'),1);assert(has(2,'sell','catch'));assert(has(2,'sell','catch:'+id1));
  act('lifeFish');act('lifeCast');run("for(let k=0;k<80&&LIFE34.fish&&LIFE34.fish.phase==='waiting';k++){T35+=100;tickFishing34(.1);}");act('lifeReel');act('lifeCatch',{v:'keep'});assert.equal(count(2,'sell'),1,'keeping is not a sale');
  // Finds and paint at the stall
  market();act('lifeSell',{k:'fish'});act('lifeSell',{k:'fish'});assert(has(2,'sell','fish'));assert.equal(count(2,'sell','fish'),1,'one pantry fish, one sale');
  act('lifeBuy',{t:'planter'});act('lifeBuy',{t:'planter'});act('lifeBuy',{t:'lamp'});assert.equal(count(2,'buy'),1,'a repeat and an off-day item log nothing');assert(has(2,'buy','planter'));
  act('buyPaint35',{id:'ochre'});act('buyPaint35',{id:'ochre'});assert.equal(count(2,'buy','paint'),1);assert(has(2,'buy','paint:ochre'));
  // place on the veranda and paint at home
  home();const ix=run("S.home.storage.indexOf('planter')");act('lifeSelect',{ix});act('lifeCell',{x:1,y:4});act('lifeCell',{x:1,y:4});assert.equal(count(2,'place'),1);assert(has(2,'place','planter:veranda'));
  act('paint35',{id:'ochre'});act('paint35',{id:'ochre'});act('paint35',{id:'nope'});assert.equal(count(2,'paint'),1);assert(has(2,'paint','wall:ochre'));
  act('paintUndo35',J('TUNE35.paintUndo'));assert.equal(count(2,'paint'),2,'an undone paint is logged');assert(has(2,'paint','undo:wall:base'));act('paint35',{id:'ochre'});
  // a request and a shell
  approach('tunde');act('lifeRequest',{k:'tunde'});act('lifeRequest',{k:'tunde'});assert.equal(count(2,'request'),1);assert(has(2,'request','tunde:1'));
  run('players[0].y=0;players[0].g.position.set(SHELLS34[0][0],0,SHELLS34[0][1])');act('lifeShell',{k:0});act('lifeShell',{k:0});assert.equal(count(2,'shell'),1);assert(has(2,'shell','0'));
  // the next day: water ripens (stage 2), harvest; the evening cue
  wakeNext();home();act('lifeWater');act('lifeHarvest');act('lifeHarvest');assert.equal(count(3,'harvest'),1);assert(has(3,'water'));
  run("cue35('evening',{day:S.day})");assert(has(3,'evening','done'));
  const kinds=[...new Set(J('LOG35.events(2)').map(e=>e.k))];
  for(const k of ['wake','morning','plant','water','at-rocks','cast','bite','catch','sell','buy','place','paint','request','shell'])assert(kinds.includes(k),'day 2 has '+k);
  return {day2kinds:kinds,day3:[...new Set(J('LOG35.events(3)').map(e=>e.k))]};});

 // 3. Time counts only while the day is woken, the tab is visible and there was input in the last minute; panels count apart.
 check('Accumulators: play and panel time, a 1 s cap per step, hidden tab, 60 s idle limit, unwoken days count nothing',()=>{isMod();
  fresh();run('DAYS35.activity()');tick(1,0);const r0=J('LOG35.day(1)');
  tick(10,100);let r=J('LOG35.day(1)');assert.equal(r.playedMs-r0.playedMs,1000);assert.equal(r.panelMs,r0.panelMs);
  run('globalThis.OO35=overlayOpen;overlayOpen=()=>true;DAYS35.activity()');tick(10,100);let r2=J('LOG35.day(1)');assert.equal(r2.panelMs-r.panelMs,1000);assert.equal(r2.playedMs,r.playedMs);
  run('DAYS35.activity()');tick(1,0);const r3=J('LOG35.day(1)');tick(1,10000);const r4=J('LOG35.day(1)');assert.equal(r4.panelMs-r3.panelMs,1000,'a 10 s gap counts at most 1000 ms');
  run('DAYS35.activity();document.hidden=true');tick(10,100);let r5=J('LOG35.day(1)');assert.equal(r5.panelMs,r4.panelMs,'hidden tab counts nothing');run('document.hidden=false');
  run('DAYS35.activity()');tick(1,0);const i0=J('LOG35.day(1)').panelMs;tick(70,1000);const idle=J('LOG35.day(1)').panelMs-i0;assert(idle<=60000&&idle>=59000,'idle stops counting after 60 s: '+idle);
  run('DAYS35.activity()');tick(5,1000);const resumed=J('LOG35.day(1)').panelMs-i0-idle;assert.equal(resumed,5000,'activity resumes counting');
  // a finger held on the touch stick sends only pointermove: that counts as activity (a hovering mouse does not)
  tick(70,1000);const h0=J('LOG35.day(1)').panelMs;run("DAYS35.onMove({pointerType:'mouse',buttons:0})");tick(3,1000);assert.equal(J('LOG35.day(1)').panelMs,h0,'a hovering mouse is not activity');
  run("DAYS35.onMove({pointerType:'touch',buttons:1})");tick(3,1000);assert.equal(J('LOG35.day(1)').panelMs-h0,3000,'a held touch drag is activity');
  run('overlayOpen=OO35;delete globalThis.OO35');
  run('T35+=1000');act('nextday');tick(10,100);const n=J('LOG35.day(2)');assert.equal(n.startedAt,null);assert.equal(n.playedMs+n.panelMs,0,'an unwoken day counts nothing');
  return {played:1000,panel:1000,idleCountedMs:idle,resumedMs:resumed};});

 // 4. nextday: the night is stamped, the new record waits for the player, the morning row is chosen, marked without a toast and shown on Today.
 check('nextday: sleptAt and sleep, an unwoken new record with its morning row, gate 2 readable, the day-2 seedling morning with the marker and no toast',()=>{isMod();
  fresh();run("DAYS35.activity();S.firstEvening.plan='garden';S.firstEvening.enabled=false;");run("T35+=2000;TOASTS=[];PH=''");act('nextday');const slept=run('T35');
  const d1=J('LOG35.day(1)');assert.equal(d1.sleptAt,slept);assert(d1.events.some(e=>e.k==='sleep'));
  let d2=J('LOG35.day(2)');assert.equal(d2.startedAt,null);assert.equal(d2.events.length,0);assert.equal(d2.morning,'seedling');
  assert.equal(run('S.life.seed35.day'),2);assert.deepEqual(J('[LIFE34.waypoint.x,LIFE34.waypoint.z]'),[-5.6,6.35],'marker at the pot');assert.deepEqual(J('TOASTS'),[],'the morning adds no toast');
  assert(run("PH.startsWith('<section class=\"life34\">')&&PH.includes('morning35')&&PH.includes('data-morning=\"seedling\"')"),'last panel is Today with the morning card');
  assert.equal(J('S.life.morning35').id,'seedling');
  const lead=k=>run(`todayHTML34().includes('<div class="morning35-lead"><article class="life-card34 request34"><span class="life-label34">'+esc(CAST[${JSON.stringify(k)}].name))`);
  assert(lead('tunde'),'plan garden leads with Tunde');run("S.firstEvening.plan='recipe'");assert(lead('nkechi'),'plan recipe leads with Mama Nkechi');run("S.firstEvening.plan='photo'");assert(lead('ada'),'plan photo leads with Ada');
  run('T35+=3600000;DAYS35.activity()');d2=J('LOG35.day(2)');assert.equal(d2.startedAt-slept,3600000,'gate 2: day 2 starts an hour after day 1 slept');
  assert.deepEqual(d2.events.map(e=>[e.k,e.a||'']),[['wake',''],['morning','seedling']]);assert.equal(d2.morning,undefined);
  return {gapMs:d2.startedAt-slept,morning:'seedling',marker:[-5.6,6.35]};});

 // 5. The morning table, as a pure function, and its context from state.
 check('Morning table: day-3 crop rows, the day 4-6 cycle (day 7 repeats day 4), evening-again from day 4, and the context read from state',()=>{isMod();
  const base={crop:0,seedReady:true,seedGrantedToday:false,eveningPending:false,returning:[],adaStage:0,visitsUnlocked:false,visitToday:false,caughtCatfish:false};
  const pick=(day,o)=>{const r=J(`pickMorning35(${day},${JSON.stringify(Object.assign({},base,o))})`);return r&&r.id;};
  const t={d1:pick(1,{}),d2seed:pick(2,{seedGrantedToday:true}),d2:pick(2,{}),d3c2:pick(3,{crop:2}),d3c1:pick(3,{crop:1}),d3c0:pick(3,{crop:0}),d3c3:pick(3,{crop:3}),d3eve:pick(3,{crop:2,eveningPending:true}),
   d4finds:pick(4,{returning:['lamp','rug']}),d4:pick(4,{returning:['lamp']}),d5invite:pick(5,{adaStage:2}),d5visit:pick(5,{visitsUnlocked:true}),d5visited:pick(5,{visitsUnlocked:true,visitToday:true}),d5:pick(5,{}),
   d6:pick(6,{}),d6cat:pick(6,{caughtCatfish:true}),d7finds:pick(7,{returning:['lamp','rug']}),d7:pick(7,{}),d8invite:pick(8,{adaStage:2}),d9:pick(9,{}),d4eve:pick(4,{eveningPending:true,returning:['lamp','rug']}),d9eve:pick(9,{eveningPending:true}),
   d5eveAfter:pick(5,{eveningPending:true,prevRow:'evening-again'}),d6eveAgain:pick(6,{eveningPending:true,prevRow:'shells'})};
  assert.deepEqual(t,{d1:null,d2seed:'seedling',d2:'quiet',d3c2:'grew',d3c1:'waiting',d3c0:'unplanted',d3c3:'ripe',d3eve:'grew',d4finds:'finds-return',d4:'shells',d5invite:'ada-invite',d5visit:'ada-visit',d5visited:'shells',d5:'shells',
   d6:'evening-fish',d6cat:'shells',d7finds:'finds-return',d7:'shells',d8invite:'ada-invite',d9:'evening-fish',d4eve:'evening-again',d9eve:'evening-again',d5eveAfter:'shells',d6eveAgain:'evening-again'});
  assert.equal(J('pickMorning35(3,{crop:0,seedReady:false,returning:[]})').id,'quiet','an unready seedling falls through to quiet');
  fresh();run('S.day=4;');const evening=run("typeof EVENING35!=='undefined'");const c0=J('morningCtx35(4)');assert.equal(c0.eveningPending,evening,'eveningPending follows EVENING35.pending() for a day-4 household without evening35');
  assert.deepEqual([c0.adaStage,c0.visitsUnlocked,c0.visitToday,c0.caughtCatfish],[0,false,false,false]);
  run("const l=life34();l.collection.catfish={count:1,best:30,firstDay:2};l.visitsUnlocked=true;l.visit={k:'ada',day:4};request34('ada').stage=2;");
  const c1=J('morningCtx35(4)');assert.deepEqual([c1.adaStage,c1.visitsUnlocked,c1.visitToday,c1.caughtCatfish],[2,true,true,true]);assert.deepEqual(c1.returning,J("['lamp','rug','chairs','art','plant'].filter(t=>!owned34(t))"));
  return {table:t,eveningLoaded:evening};});

 // 6. The recap names tomorrow's row and one clause, from the scripted states.
 check('Recap: day 1 seedling; day 2 grew with the chair clause; day 3 finds-return with the pot clause; shown in the night panel',()=>{isMod();
  fresh();run("DAYS35.activity();S.firstEvening.enabled=false;S.money=60000;");const r1=J('recap35()');assert.deepEqual([r1.rowId,r1.clauseId],['seedling',null]);assert.equal(r1.text,run("text35('recap.seedling')"));
  run("PH=''");act('sleep');assert(run("PH.includes('class=\"recap35\"')&&PH.includes('TOMORROW')"));assert(run(`PH.includes(esc(${JSON.stringify(r1.text)}))`),'the night panel carries the recap text');
  run('T35+=1000');act('nextday');run('DAYS35.activity()');home();act('lifePlant');act('lifeWater');
  // the armchair, placed through the editor (on the veranda when the outdoor rule allows it, else the first free room cell)
  run("S.home.storage.push('armchair');");const ix=run("S.home.storage.indexOf('armchair')");act('lifeSelect',{ix});
  const cell=J("(()=>{const c=[[1,4],[0,4],[5,4]];for(let y=0;y<4;y++)for(let x=0;x<6;x++)c.push([x,y]);return c.find(([x,y])=>fitsEditor34('armchair',x,y,0));})()");act('lifeCell',{x:cell[0],y:cell[1]});
  assert(run("placed('armchair')"));const r2=J('recap35()');assert.deepEqual([r2.rowId,r2.clauseId],['grew','chair']);assert.equal(r2.text,run("[text35('recap.grew'),text35('recap.clause.chair')].filter(Boolean).join(' ')"));
  run('T35+=1000');act('nextday');run('DAYS35.activity()');home();act('lifeWater');act('lifeHarvest');assert.equal(run('S.life.crop.harvests'),1);run('S.life.evening35={doneDay:3}');
  const r3=J('recap35()'),ret=J('morningCtx35(4,true).returning');assert.deepEqual([r3.rowId,r3.clauseId],['finds-return','pot-again']);
  assert.equal(r3.text,run(`[text35('recap.finds-return',{a:itemShort35(${JSON.stringify(ret[0])}),b:itemShort35(${JSON.stringify(ret[1])})}),text35('recap.clause.pot-again')].filter(Boolean).join(' ')`));
  run("PH=''");act('sleep');assert(run(`PH.includes('recap35')&&PH.includes(esc(${JSON.stringify(r3.text)}))`));
  return {day1:[r1.rowId,r1.clauseId],day2:[r2.rowId,r2.clauseId],day3:[r3.rowId,r3.clauseId],returning:ret.slice(0,2),chairCell:cell};});

 // 7. Rating on the night panel; the day-3 prompts appear once rated, save as typed and are escaped when shown again.
 check('Rating and prompts: rate35 stores and keeps the night text, refuses bad input; day-3 prompts save as typed (throttled, flushed) and re-render escaped',()=>{isMod();
  fresh();run('DAYS35.activity();S.firstEvening.enabled=false;');act('sleep');const night=run("DAYS35.nightHTML.slice(0,DAYS35.nightHTML.indexOf('<div class=\"actions\">'))");
  assert(run("PH.includes('class=\"rate35\"')&&PH.includes('How was today?')"));act('rate35',{v:'3',day:'1'});assert.equal(run('LOG35.day(1).rating'),3);
  assert(run(`PH.includes(${JSON.stringify(night)})`),'the re-render keeps the same night paragraph');assert(run(`PH.includes('rate35-face chosen" data-act="rate35" data-v="3"')`));
  for(const d of [{v:'4',day:'1'},{v:'0',day:'1'},{v:'x',day:'1'},{v:'2',day:'9'},{v:'2',day:'0'},{v:'2'}])act('rate35',d);assert.equal(run('LOG35.day(1).rating'),3,'invalid ratings are refused');
  assert.equal(run("LOCAL_ONLY.has('rate35')"),true);
  wakeNext();wakeNext();assert.equal(run('S.day'),3);run("PH=''");act('sleep',{anyway:1});assert(run("PH.includes('How was today?')"),'the night panel (Sleep anyway: the neighbours were still due)');assert(!run("PH.includes('prompts35')"),'no prompts before the rating');
  act('rate35',{v:'2',day:'3'});assert(run("PH.includes('prompts35')&&PH.includes('data-bind=\"life.days.3.want\"')&&PH.includes('data-bind=\"life.days.3.neighbour\"')"));
  assert.equal(run("'want' in S.life.days['3']&&'neighbour' in S.life.days['3']"),true,'the bind paths exist');
  const stored=k=>run(`JSON.parse(localStorage.getItem(KEY)).life.days['3'].${k}`);
  run(`S.life.days['3'].want=${JSON.stringify('A <b>blue</b> "door"')};T35+=5000;DAYS35.onInput({target:{dataset:{bind:'life.days.3.want'}}})`);assert.equal(stored('want'),'A <b>blue</b> "door"','saved without any further action');
  run(`S.life.days['3'].neighbour='Ada frames shells';T35+=200;DAYS35.onInput({target:{dataset:{bind:'life.days.3.neighbour'}}})`);assert.equal(stored('neighbour'),null,'a second input within 1 s waits');
  run('DAYS35.onInput({target:{dataset:{bind:"x.y"}}})');tick(1,1000);assert.equal(stored('neighbour'),'Ada frames shells','one tick a second later flushes it');
  act('rate35',{v:'3',day:'3'});assert(run(`PH.includes('value="A &lt;b&gt;blue&lt;/b&gt; &quot;door&quot;"')`),'the player text is escaped');
  return {rating:3,prompts:'saved'};});

 // 8. A night that skipped endDay ("Past midnight") asks about yesterday on Today; day 3's prompts follow there.
 check('Past midnight: Today asks how yesterday was, rate35 stores it there, and day 3 then shows the prompts on day 4',()=>{isMod();
  fresh();run('DAYS35.activity();S.firstEvening.enabled=false;');run("T35+=1000;PH=''");act('nextday');
  assert(run("PH.includes('How was yesterday?')&&PH.includes('data-day=\"1\"')"));act('rate35',{v:'1',day:'1'});assert.equal(run('LOG35.day(1).rating'),1);assert(run("PH.includes('life34')"),'Today is shown again');
  run('DAYS35.activity()');wakeNext();assert.equal(run('S.day'),3);run('DAYS35.activity()');run("T35+=1000;PH=''");act('nextday');assert.equal(run('S.day'),4);
  assert(run("PH.includes('How was yesterday?')&&PH.includes('data-day=\"3\"')"));assert(!run("PH.includes('prompts35')"));
  act('rate35',{v:'3',day:'3'});assert.equal(run('LOG35.day(3).rating'),3);assert(run("PH.includes('prompts35')&&PH.includes('data-bind=\"life.days.3.want\"')"),'the day-3 prompts on day 4');
  return {day1:1,day3:3};});

 // 9. Online play: no log, no faces, no copy; the recap, the seedling morning and the shared morning row remain; only life.days is stripped.
 check('Online: no record, events, faces, resume or Menu line; recap shown; seedling still granted; no marker; stripState drops only life.days',()=>{isMod();
  fresh();run("delete S.life.days;NET.room={emit:()=>Promise.resolve()};NET.on=true;");tick(5,33);run('DAYS35.activity();LOG35.add("cast")');assert.equal(run('S.life.days'),undefined,'no record online');
  run("PH=''");act('sleep');assert(run("PH.includes('recap35')"),'recap shown online');assert(!run("PH.includes('rate35')"),'no faces online');
  run("LIFE34.waypoint=null;PH=''");act('nextday');assert.equal(run('S.day'),2);assert.equal(run('S.life.seed35.day'),2,'TUNE still grants the seedling');assert.equal(run('S.life.days'),undefined);
  assert.equal(run('LIFE34.waypoint'),null,'no morning marker online');assert(run("PH.includes('data-morning=\"seedling\"')"));assert(!run("PH.includes('How was yesterday')"));assert.equal(J('S.life.morning35').id,'seedling');
  run("globalThis.MENU35=[];globalThis.QS35=document.querySelector;document.querySelector=s=>s==='#panel .actions'?{insertAdjacentHTML:(w,h)=>MENU35.push(h),querySelector:()=>null}:null;S.life.days={'1':{startedAt:1,sleptAt:2,playedMs:0,panelMs:0,rating:null,want:null,neighbour:null,dropped:0,events:[]}};openMenu();");
  assert.equal(J('MENU35').filter(h=>/days35|Copy timeline and days/.test(h)).length,0,'the Menu adds nothing online');assert.equal(run('daysText35()'),'');
  run("S.life.lines35={day:2,used:{tunde:['tu01'],nkechi:[],ada:[]},hint:{}};");const o=J('stripState()');assert.equal(o.life.days,undefined);assert(o.life.lines35&&o.life.morning35,'lines35 and morning35 stay shared');assert(run('!!S.life.days'),'the local copy is untouched');
  run("delete S.life.days;NET.on=false;save();NET.on=true;T35+=1000;ACTIONS.continue();");assert.equal(run('S.life.days'),undefined,'no resume online');
  return {morning:'seedling'};});

 // 10. The copy button carries the evening timeline and every day; the Menu offers the button only when feel did not.
 check('Copy: timelineSummary34 carries the evening timeline and the days; the Menu adds one copy button only when the evening line is absent',()=>{isMod();
  fresh();run('DAYS35.activity()');run("S.firstEvening.log=[{stage:'move',at:1790000000000,played:0,day:1,time:15},{stage:'complete',at:1790000060000,played:60,day:1,time:21}];S.firstEvening.played=60;");
  let t=run('timelineSummary34()');assert(t.includes('complete:')&&t.includes('Compound Days days'),'timeline and days');assert(t.includes('Day 1 · started '));
  run('delete S.firstEvening.log');t=run('timelineSummary34()');assert.equal(t,'No first-evening timeline yet.\n\n'+run('daysText35()'));
  run("globalThis.MENU35=[];globalThis.QS35=document.querySelector;document.querySelector=s=>s==='#panel .actions'?{insertAdjacentHTML:(w,h)=>MENU35.push(h),querySelector:()=>null}:null;");
  run("S.firstEvening.log=[{stage:'move',at:1790000000000,played:0,day:1,time:15}];S.firstEvening.played=30;MENU35=[];openMenu();");const withLog=J('MENU35');
  assert.equal(withLog.filter(h=>/copyTimeline/.test(h)).length,1,'only feel’s copy button');assert.equal(withLog.filter(h=>h.includes('days35-menu')).length,1);
  run("delete S.firstEvening.log;MENU35=[];openMenu();");const noLog=J('MENU35');assert.equal(noLog.filter(h=>/copyTimeline/.test(h)).length,1,'exactly one copy button from DAYS');
  assert(noLog.some(h=>h.includes('Copy timeline and days')));assert(!noLog.concat(withLog).some(h=>h.includes('days35-menu')&&/First evening|copyTimeline/.test(h)));
  run("MENU35=[];_silent=true;openMenu();_silent=false;");assert.equal(J('MENU35').filter(h=>/days35|copyTimeline/.test(h)).length,0,'silent replay adds nothing');
  return {withLog:withLog.filter(h=>/copyTimeline|days35/.test(h)).length,withoutLog:noLog.filter(h=>/copyTimeline|days35/.test(h)).length};});

 // 11. Hygiene: no undefined or NaN in the new cards; the event cap; the Sleep label and its guard during the guided evening.
 check('Hygiene: no undefined or NaN on Today and night panels, the 300-event cap with dropped, one "Sleep until tomorrow" in free play and none while guided',()=>{isMod();
  fresh();run('DAYS35.activity()');assert.equal(run('guided33()'),true);run("openLife34('today')");
  assert(!run("PH.includes('Rest until tomorrow')||PH.includes('Sleep until tomorrow')"),'neither label during the guided evening');
  run('S.firstEvening.enabled=false');assert.equal(run('guided33()'),false);run("openLife34('today')");assert.equal(run("(PH.match(/data-act=\"sleep\"/g)||[]).length"),1);assert(run("PH.includes('>Sleep until tomorrow</button>')"));
  const pages=[];const scan=label=>{const bad=run("PH.includes('undefined')||PH.includes('NaN')");assert(!bad,label);pages.push(label);};
  scan('today day 1');act('sleep');scan('night day 1');act('rate35',{v:'2',day:'1'});scan('night rated');run('T35+=1000');act('nextday');scan('today day 2');
  run('DAYS35.activity()');wakeNext();scan('today day 3');act('sleep',{anyway:1});act('rate35',{v:'3',day:'3'});assert(run("PH.includes('prompts35')"),'the day-3 night with its prompts');scan('night day 3 with prompts');run('T35+=1000');act('nextday');scan('today day 4');
  run("delete S.life.morning35;openLife34('today')");scan('today day 4 lazy morning');
  run('DAYS35.activity()');const n0=run('LOG35.today().events.length'),d0=run('LOG35.today().dropped');run(`for(let k=0;k<${300-n0+7};k++)LOG35.add('shell','x')`);
  assert.equal(run('LOG35.today().events.length'),300);assert.equal(run('LOG35.today().dropped')-d0,7);
  // a new household's night: Ada's 'something smelled good' line only after cooking that day (the base reads 'ever cooked')
  fresh();run("S.firstEvening.enabled=false;S.day=2;S.cooked.jollof=1;S.nb.ada.aff=3;S.flags={};S.today={};S.party=null;");act('sleep');const nightA=run('PH');assert(!nightA.includes('Something smelled good'),'not on a night nothing was cooked');
  assert.equal(run('S.cooked.jollof'),1,'the cooked record is untouched');run("closePanel();S.today={cooked:true};");act('sleep');assert(run('PH').includes('Something smelled good'),'on a night something was cooked');
  return {pages,cap:300,dropped:7};});

 // 12. Continue logs the sitting's wall time; records older than seven days are compacted to counts, keeping the prompts.
 check('Resume and compaction: Continue on an unwoken day adds nothing (the wake carries the time); on a woken day one resume with its wall time; without a reload, the first real input after 10 minutes of wall time with none, or the page shown again after 10 minutes hidden, logs one resume with its wall time (not after 9 minutes, nor 5 minutes hidden, never twice for one return, not for the game\u2019s own dispatches, not online, not on an unwoken day, where the wake carries the time); after nine nights days 1-3 keep counts and prompts, 4-10 keep events',()=>{isMod();
  fresh();hooks(2);run('save();T35+=7200000;ACTIONS.continue();');const r=J('LOG35.day(1)');assert.equal(r.startedAt,null,'resume does not wake');
  assert.deepEqual(r.events,[],'no resume before the wake');
  run('S.firstEvening.enabled=false;DAYS35.activity();save();T35+=3600000;ACTIONS.continue();');const w=run('T35'),r1=J('LOG35.day(1)');
  assert.deepEqual(r1.events.map(e=>[e.k,e.w||null]),[['wake',null],['resume',w]],'the wake first, then one resume with its wall time');
  // a return without a reload (a tab left open on the morning page, say): the first real input (DAYS35.input, from a key, a tap, a held drag or a
  // gamepad) after 10 minutes of wall time with none logs one resume; nine minutes do not; the next input adds none
  const resumes=n=>J(`LOG35.events(${n}).filter(e=>e.k==='resume').map(e=>e.w)`);
  run('DAYS35.input();T35+=540000;DAYS35.input();');assert.deepEqual(resumes(1),[w],'nine minutes away is not a return');
  run('T35+=600000;DAYS35.input();');const w2=run('T35');run('T35+=1000;DAYS35.input();');assert.deepEqual(resumes(1),[w,w2],'ten minutes with no input, then a tap: one resume with its wall time');
  // the game's own dispatches (the companion's acts, a pack-away) are not input: they neither log a return nor shorten the time away
  run('T35+=300000;DAYS35.activity();T35+=300000;DAYS35.input();');const w3=run('T35');assert.deepEqual(resumes(1),[w,w2,w3],'a dispatch in between does not hide the return');
  // the page hidden for ten minutes and shown again: one resume at once (before any input), and the input that follows adds none
  run('T35+=1000;document.hidden=true;DAYS35.onVisibility();T35+=600000;document.hidden=false;DAYS35.onVisibility();');const w4=run('T35');
  assert.deepEqual(resumes(1),[w,w2,w3,w4],'shown again after ten minutes hidden: one resume');run('T35+=1000;DAYS35.input();');assert.deepEqual(resumes(1),[w,w2,w3,w4],'not twice');
  run('T35+=1000;document.hidden=true;DAYS35.onVisibility();T35+=300000;document.hidden=false;DAYS35.onVisibility();T35+=1000;DAYS35.input();');assert.deepEqual(resumes(1),[w,w2,w3,w4],'five minutes hidden is not a return');
  // Continue, then the first tap: Continue's resume only
  run('T35+=3600000;save();ACTIONS.continue();');const w5=run('T35');run('T35+=1000;DAYS35.input();');assert.deepEqual(resumes(1),[w,w2,w3,w4,w5],'Continue and its first tap are one return');
  // the copy carries each return's wall time, in the readable lines and in the block
  const txt=run('daysText35()');for(const t of [w2,w3,w4])assert(txt.includes(' resume '+new Date(t).toISOString()),'readable resume '+t);
  // online play keeps no log: no return is logged
  run('NET.on=true;T35+=700000;DAYS35.input();T35+=1000;document.hidden=true;DAYS35.onVisibility();T35+=700000;document.hidden=false;DAYS35.onVisibility();NET.on=false;');
  assert.deepEqual(resumes(1),[w,w2,w3,w4,w5],'none online');
  // a new day not yet woken: the tap after ten minutes wakes it, and its wake carries the time (no resume)
  run('T35+=1000');act('nextday');run('T35+=700000;DAYS35.input();');const r2=J('LOG35.day(2)');assert.equal(r2.startedAt,run('T35'),'the tap wakes day 2');
  assert.deepEqual(resumes(2),[],'no resume on the day the tap woke');
  for(let k=0;k<8;k++){if(run('S.day')===3){run("S.life.days['3'].want='A reading lamp';S.life.days['3'].neighbour='Tunde hums to his plants';");}wakeNext();}
  assert.equal(run('S.day'),10);const d=J('S.life.days');
  for(const n of [1,2,3]){assert(d[n].counts&&!d[n].events,'day '+n+' compacted');}for(let n=4;n<=10;n++)assert(Array.isArray(d[n].events),'day '+n+' keeps events');
  assert.equal(d[3].want,'A reading lamp');assert.equal(d[3].neighbour,'Tunde hums to his plants');assert.equal(run("LOG35.count(1,'wake')"),1);assert.equal(run("LOG35.has(2,'sleep')"),true);
  assert(/\n {2}counts: wake 1 · /.test(run('daysText35()')),'daysText35 prints counts');assert.deepEqual(J('LOG35.events(1)'),[]);
  return {compacted:[1,2,3],kept:[4,10],day1counts:d[1].counts,returnsLoggedOnDay1:5};});

 // 13. The subset pass runs in a child process on a dist without the later v35 modules.
 {let d=null;try{d=subsetDir35('days-v35.js');const out=cp.execFileSync(process.execPath,[__filename,'--subset'],{env:{...process.env,COMPOUND_GAME_DIR:d},encoding:'utf8',stdio:['ignore','pipe','inherit']});
   const lines=out.trim().split('\n');for(const c of JSON.parse(lines.pop())){checks.push(c);if(!c.passed)failed=true;console.log((c.passed?'PASS ':'FAIL ')+c.name);}}
  catch(e){failed=true;const name='Subset pass: without the later modules the morning, the recap and the context still work; evening-again needs EVENING35';checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});console.log('FAIL',name);}
  finally{if(d)fs.rmSync(d,{recursive:true,force:true});}}

 const report={build:run('BUILD_ID'),passed:!failed,checks,method:'Actual shipped runtime with the v35 modules in Node, Three.js and glTF, the wall clock stubbed through CLOCK35. No browser, phone or audio claim.'};
 fs.writeFileSync(path.join(__dirname,'results-log-v35.json'),JSON.stringify(report,null,2)+'\n');if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);if(SUBSET){console.log(JSON.stringify(checks));process.exitCode=1;return;}let build=null;try{build=runFn&&runFn('BUILD_ID');}catch(_){}
 fs.writeFileSync(path.join(__dirname,'results-log-v35.json'),JSON.stringify({build,passed:false,checks,failure:String(e&&e.stack||e).split('\n')[0]},null,2)+'\n');process.exitCode=1;});

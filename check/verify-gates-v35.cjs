// v35 tester kit (docs/PLAN_v35_three_days.md section 7, docs/TESTING_v35.md): the copy button's text and tools/gates-v35.cjs.
// 1. A companion household plays days 1 to 3 in the shipped runtime by real actions only (the helpers follow check/verify-days-v35.cjs), the
//    real Menu copy button (dispatch copyTimeline, whose panel shows the text in Node, where there is no clipboard) gives the paste, and the gates
//    tool reads it back: the parsed values must equal S.life.days.
// 2. Synthetic five-tester sets, written by the real daysText35 from built records, pass and fail each gate at its boundary.
// 3. Malformed and partial pastes (an online household, only the timeline, cut short, altered, quoted, empty) are reported, not crashed on.
// Writes check/results-gates-v35.json; no wall-clock value reaches it (CLOCK35, Date.now and Math.random are stubbed; T35 is fixed).
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const {load}=require('./runtime-harness.cjs');
const OUT=path.join(__dirname,'results-gates-v35.json');
const TOOL=path.join(__dirname,'..','tools','gates-v35.cjs');
const G=require(TOOL);
const WEEKDAY35=/\b(mon|tues|wednes|thurs|fri|satur|sun)days?\b/i;
const checks=[];let runFn=null,failed=false;
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'cd35-gates-'));

(async()=>{
 const {run}=await load();runFn=run;
 run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;");
 run("var T35=1790000000000;CLOCK35.fn=()=>T35;");
 run("var PH='',TOASTS=[],CUES=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}CUE35_HOOKS.push(n=>CUES.push(n));");
 run("{const s=new Set();ov.classList.add=c=>{s.add(c);};ov.classList.remove=c=>{s.delete(c);};ov.classList.contains=c=>s.has(c);}");
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
 const unesc=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
 // the Menu's copy button: with no clipboard in Node, feel's copyTimeline shows the text in a <pre>; that is the text a tester pastes
 const copyButton=()=>{run("PH=''");act('copyTimeline');const m=run('PH').match(/<pre[^>]*>([\s\S]*?)<\/pre>/);assert(m,'the copy panel shows the text');return unesc(m[1]);};
 const check=(name,fn)=>{try{assert.equal(run('typeof DAYS35+typeof TUNE35+typeof EVENING35'),'objectobjectobject','the v35 modules are loaded');
   const info=fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});console.log('PASS',name);}
  catch(e){failed=true;checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});console.log('FAIL',name);if(process.env.DEBUG35)console.error(e&&e.stack||e);}};
 const A=(inputs,o)=>G.analyse(inputs,o);
 const gate=(a,n)=>a.gates.find(g=>g.gate===n);
 const statuses=a=>a.gates.map(g=>g.status);

 run("buildTextures();buildTextures2();buildWorld();");
 const fresh=()=>{run("NET.on=false;_silent=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});");act('movein');run("closePanel();PH='';TOASTS=[];CUES=[];");};
 // one cast at the rocks, the wall clock stubbed at 5 fps; Act presses Cast, Reel in and Keep, or the catch is sold from the card
 const fish=how=>{rocks();run('closePanel()');act('lifeFish');assert(run("LIFE34.fish&&LIFE34.fish.phase==='ready'"),'the fishing panel is open');
  if(how==='keep'){run('T35+=300');assert.equal(run('actPrimary35()'),true,'Act presses Cast');}else act('lifeCast');
  run("(()=>{for(let k=0;k<60&&LIFE34.fish.phase==='waiting';k++){T35+=200;tickFishing34(.05);}})()");assert.equal(run('LIFE34.fish.phase'),'bite');
  if(how==='keep'){run('T35+=300');assert.equal(run('actPrimary35()'),true,'Act presses Reel in');run('T35+=300');assert.equal(run('actPrimary35()'),true,'Act presses Keep');return;}
  act('lifeReel');act('lifeCatch',{v:'sell'});};
 // the tester wanders for a while (min minutes of play, a tap every 30 s so the idle rule does not stop the count)
 const linger=min=>run(`for(let k=0;k<${min*60};k++){T35+=1000;if(k%30===0)DAYS35.activity();for(const h of TICK_HOOKS)h(1/30,!overlayOpen());}`);
 const night=(day,v)=>{home();run("PH=''");act('sleep');assert(run('PH').includes('How was today?'),'the faces');act('rate35',{v:String(v),day:String(day)});};
 const morning=()=>{run("T35+=60000;TOASTS=[];PH=''");act('nextday');walk(2);};

 const R={};
 check('Real 1. A companion household plays days 1 to 3 by real actions: basket and jollof, housewarming, seedling, a fish for Mama Nkechi, catches sold, the armchair on the veranda, the harvest, deliveries, paint, the veranda evening, three ratings and both day-3 answers',()=>{
  fresh();assert.equal(money(),6000);
  // day 1: the welcome basket path of verify-days-v35 A2
  run("sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();");run('closePanel()');walk(20);home();act('eveningHelp');act('eveningCook');act('cook',{r:'jollof'});
  for(const [i,ix] of [[0,0],[1,0],[0,0],[1,1]])act('cookans',{i,ix});act('serve');run('closePanel()');walk(10);toNPC('ada');act('hs',{i:0,id:'talk:ada'});
  home();act('eveningHost');act('ptdish',{ix:0});act('ptmusic',{v:'none'});act('ptinv',{k:'tunde'});if(run("guestOK('ada').ok"))act('ptinv',{k:'ada'});act('partystart');
  for(let r=0;r<4;r++)run("dispatch('ptpick',{i:0,v:S.party.opts[0].id});dispatch('ptpick',{i:1,v:(S.party.opts[1]||S.party.opts[0]).id});dispatch('ptgo');");
  // the housewarming card counts one meal (the jollof) in the singular, as drawn on the page
  const card=run('panel.innerHTML');R.mealLine=(card.match(/<li>\d+ recipes? known, \d+ meals? cooked together<\/li>/)||[''])[0];
  assert.equal(R.mealLine.replace(/^<li>\d+ recipes? known, /,''),'1 meal cooked together</li>','the card says "1 meal cooked together": '+R.mealLine);
  act('eveningGift',{v:'art'});act('eveningPlan',{v:'garden'});assert.equal(run('S.firstEvening.completed'),true);run('closePanel()');linger(22);night(1,2);morning();
  // day 2: plant, water, the rocks, keep one fish, Nkechi, sell until ₦9,000, the armchair
  run('closePanel()');veranda();walk(10);act('lifePlant');act('lifeWater');assert.equal(stage(),1);home();hooks(2);rocks();walk(20);fish('keep');
  toNPC('nkechi');act('lifeRequest',{k:'nkechi'});let sold=0;while(money()<9000&&sold<12){fish('sell');sold++;walk(5);}
  market();at(21.5,7.6,1);walk(10);act('lifeBuy',{t:'armchair'});veranda();act('lifeSelect',{ix:run("S.home.storage.indexOf('armchair')")});act('lifeCell',{x:1,y:4});
  assert(run("S.home.items.some(i=>i.type==='armchair'&&i.y===4)"),'the armchair is on the veranda');run('closePanel()');linger(22);night(2,3);morning();
  // end of sitting 1: the tester copies from the Menu on the morning page (which wakes day 3), the game is saved and closed
  R.paste1=copyButton();run('save()');R.copy1At=run('T35');
  // sitting 2, twenty hours later: Continue, then day 3
  run('T35+=20*3600*1000');R.resumeAt=run('T35');run('ACTIONS.continue();closePanel();');walk(5);
  veranda();walk(10);act('lifeWater');assert.equal(stage(),3);act('lifeHarvest');assert.equal(stage(),1);
  toNPC('tunde');act('lifeRequest',{k:'tunde'});toNPC('nkechi');act('lifeRequest',{k:'nkechi'});
  for(const k of [0,1]){run(`players[0].y=0;players[0].g.position.set(SHELLS34[${k}][0],0,SHELLS34[${k}][1])`);act('lifeShell',{k});}toNPC('ada');act('lifeRequest',{k:'ada'});run('closePanel()');walk(10);
  market();act('buyPaint35',{id:'palm'});home();act('paint35',{id:'palm'});walk(10);
  run("closePanel();S.time=18.3;");veranda();at(-5.2,4.0,1);
  run("(()=>{for(let k=0;k<900&&EVENING35.state!=='talking';k++){T35+=33;for(const h of TICK_HOOKS)h(1/30,!overlayOpen());}})()");assert.equal(run('EVENING35.state'),'talking');
  for(let i=0;i<3;i++)run("T35+=300;dispatch('hs',{i:0,id:'evening35'});");run("(()=>{for(let k=0;k<900&&EVENING35.state!=='idle';k++){T35+=33;for(const h of TICK_HOOKS)h(1/30,!overlayOpen());}})()");
  assert.equal(run('S.life.evening35.doneDay'),3);run('closePanel()');home();linger(22);
  night(3,3);run('T35+=2000');bind('life.days.3.want','A reading lamp by the window');run('T35+=2000');bind('life.days.3.neighbour','Tunde talks to his peppers, “quietly”');
  morning();R.paste2=copyButton();R.days=J('S.life.days');
  const d=R.days;for(const n of [1,2,3])assert(d[n].startedAt!==null&&d[n].sleptAt!==null&&d[n].rating,'day '+n+' complete');
  return {sold,ratings:[1,2,3].map(n=>d[n].rating),day3Events:[...new Set(d[3].events.map(e=>e.k))],housewarmingCounts:R.mealLine.replace(/<\/?li>/g,'')};});

 check('Real 2. The copy button’s text keeps the first-evening timeline and the readable days, and ends with a CD35/1 data block whose length and check value hold and whose records equal S.life.days exactly; with no clipboard the page that shows it is titled “Timeline and days”',()=>{
  const t=R.paste2;assert(run('panel.innerHTML').startsWith('<h2>Timeline and days</h2><pre'),'the fallback page is titled Timeline and days: '+run('panel.innerHTML').slice(0,40));assert(t.startsWith('Compound Days first evening ('),'the timeline first');assert(t.includes('complete:'));assert(t.includes('\n\nCompound Days days ('));
  for(const n of [1,2,3])assert(t.includes('\nDay '+n+' · started '),'day '+n+' readable');
  assert(t.includes('\nData for the reviewer’s gates tool (the same days as above):\nCD35/1 '),'the block follows the days');
  const lines=t.split('\n'),blk=lines.filter(l=>l.startsWith('CD35/1 '));assert(blk.every(l=>l.length<=71&&!/\s/.test(l.slice(7))||/^CD35\/1 end \d+ [0-9a-f]{8}$/.test(l)),'short lines with no spaces');
  assert.equal(lines[lines.length-1],blk[blk.length-1],'the block is the last thing in the paste');assert(/^[\x21-\x7e]+$/.test(blk.slice(0,-1).map(l=>l.slice(7)).join('')),'ASCII only');
  const b=G.readBlock(lines);assert.equal(b.state,'ok',b.detail);
  const want=Object.fromEntries(Object.entries(R.days).map(([k,r])=>[k,{startedAt:r.startedAt,sleptAt:r.sleptAt,playedMs:Math.round(r.playedMs),panelMs:Math.round(r.panelMs),rating:r.rating,want:r.want||null,neighbour:r.neighbour||null,dropped:r.dropped||0,
   events:r.events.map(e=>{const a=[e.t,e.k];if(e.k==='resume')a.push(e.w);else if(e.a!==undefined)a.push(e.a);return a;})}]));
  assert.deepEqual(b.data.days,want,'block records equal S.life.days');assert.equal(b.data.build,run('BUILD_ID'));assert.equal(b.data.copiedAt,run('T35'));
  return {blockLines:blk.length,blockChars:blk.slice(0,-1).reduce((s,l)=>s+l.length-7,0),days:Object.keys(want).length};});

 check('Real 3. Privacy: the days part and its block hold only the log (times, minutes, ratings, events) and the two typed answers; no player name, household name or save field beyond the day records',()=>{
  const t=R.paste2,days=t.slice(t.indexOf('Compound Days days ('));for(const nm of ['Efe','Ola',run('S.household')])assert(!days.includes(nm),'no '+nm);
  const b=G.readBlock(t.split('\n')).data;assert.deepEqual(Object.keys(b).sort(),['build','copiedAt','day','days','v']);
  for(const r of Object.values(b.days))assert.deepEqual(Object.keys(r).sort(),['dropped','events','neighbour','panelMs','playedMs','rating','sleptAt','startedAt','want'].sort());
  const free=Object.values(b.days).flatMap(r=>[r.want,r.neighbour]).filter(Boolean);assert.deepEqual(free,['A reading lamp by the window','Tunde talks to his peppers, “quietly”']);
  return {fields:Object.keys(b.days['3']).length};});

 check('Real 4. The gates tool reads both sittings of one tester (merged by day) and its values equal the log: times to the millisecond, minutes, ratings, answers, the first catch after the first at-rocks, the day-3 evening, and the day-3 return taken from the Continue because the copy on the morning page woke day 3',()=>{
  const a=A([{name:'amaka-1.txt',text:R.paste1},{name:'amaka-2.txt',text:R.paste2}],{testers:1,final:true});
  assert.equal(a.testers.length,1);const t=a.testers[0];assert.equal(t.name,'amaka');assert.equal(t.sittings,2);assert.deepEqual(t.sources,['amaka-1.txt','amaka-2.txt']);assert.deepEqual(t.warnings,[]);
  const d=R.days;for(const n of [1,2,3]){for(const f of ['startedAt','sleptAt','rating'])assert.equal(t.days[n][f],d[n][f],'day '+n+' '+f);assert.equal(t.minutesMs[n-1],Math.round(d[n].playedMs)+Math.round(d[n].panelMs));}
  assert.deepEqual(t.ratings,[2,3,3]);assert.deepEqual(t.answers,{want:'A reading lamp by the window',neighbour:'Tunde talks to his peppers, “quietly”'});assert.equal(t.promptsSpecific,2);
  const ev=d[2].events,rk=ev.find(e=>e.k==='at-rocks'),ct=ev.find(e=>e.k==='catch');assert(rk&&ct,'day 2 has at-rocks and catch');
  assert.deepEqual(t.firstCatch,{seconds:ct.t-rk.t,rocksDay:2,catchDay:2});assert.equal(t.eveningDay,3);assert.equal(t.reachedDay,4);
  // day 3 was woken by the copy at the end of sitting 1; the return is the Continue's wall time
  assert.equal(d[3].startedAt,R.copy1At,'the copy woke day 3');const res=d[3].events.find(e=>e.k==='resume');assert.equal(res.w,R.resumeAt);
  const g2=gate(a,2);assert.equal(g2.status,'PASS');assert(g2.lines[0].includes(((R.resumeAt-d[2].sleptAt)/3600000).toFixed(1)+' h (by its return)'),g2.lines[0]);
  assert.deepEqual(statuses(a),['NOT YET','PASS','PASS','PASS','PASS','PASS','PASS'],JSON.stringify(statuses(a)));assert(gate(a,1).lines[1].includes('still to note: amaka'),'gate 1 waits for the reviewer');
  // sitting 1 alone: day 2 slept, day 3 woken by the copy and not yet played, so gate 2 is not yet decided
  const a1=A([{name:'amaka-1.txt',text:R.paste1}],{testers:1});assert.equal(gate(a1,2).status,'NOT YET');assert(gate(a1,2).lines[0].includes('amaka not back yet'));
  return {firstCatchSeconds:t.firstCatch.seconds,gapHours:Math.round((R.resumeAt-d[2].sleptAt)/360000)/10,minutes:t.minutesMs.map(v=>Math.round(v/600)/100),statuses:statuses(a)};});

 check('Real 5. Without the block (an older build’s paste) the readable lines give the same times, ratings, answers and events, with minutes to 0.1 and a note saying so',()=>{
  const cut=R.paste2.slice(0,R.paste2.indexOf('\nData for the reviewer'));const a=A([{name:'amaka.txt',text:cut}],{testers:1,final:true}),t=a.testers[0];
  assert(t.approx);assert(t.warnings.some(w=>w.includes('no data block at the end')),t.warnings.join('|'));
  const full=A([{name:'amaka.txt',text:R.paste2}],{testers:1,final:true}).testers[0];
  for(const n of [1,2,3]){assert.equal(t.days[n].startedAt,full.days[n].startedAt);assert.equal(t.days[n].sleptAt,full.days[n].sleptAt);assert.deepEqual(t.days[n].events,full.days[n].events,'day '+n+' events');
   assert(Math.abs(t.minutesMs[n-1]-full.minutesMs[n-1])<=6000,'day '+n+' minutes to 0.1');}
  assert.deepEqual(t.answers,full.answers);assert.deepEqual(t.ratings,full.ratings);assert.deepEqual(t.firstCatch,full.firstCatch);assert.deepEqual(statuses(a),statuses(A([{name:'amaka.txt',text:R.paste2}],{testers:1,final:true})));
  return {events:t.days[2].events.length};});

 check('Real 6. The command line: two files of one tester, the plain report and --json agree with the module; exit code 0; an unreadable file gives a message and exit code 2',()=>{
  const f1=path.join(tmp,'amaka-1.txt'),f2=path.join(tmp,'amaka-2.txt');fs.writeFileSync(f1,R.paste1);fs.writeFileSync(f2,'Tester: Amaka\nCoached: no\n'+R.paste2);
  const txt=cp.execFileSync(process.execPath,[TOOL,'--testers','1','--final',f1,f2],{encoding:'utf8'});
  const js=JSON.parse(cp.execFileSync(process.execPath,[TOOL,'--json','--testers=1','--final',f1,f2],{encoding:'utf8'}));
  assert.equal(js.testers.length,1,'amaka-1 and the Tester: Amaka header are one tester');assert.equal(js.testers[0].coached,false);assert.deepEqual(js.gates.map(g=>g.status),Array(7).fill('PASS'));
  const row=txt.split('\n').find(l=>/^amaka|^Amaka/.test(l));assert(row,'a table row');assert(/^amaka\s+4\s+[\d.]+ \/ [\d.]+ \/ [\d.]+\s+2 3 3\s+2\/2\s+\d:\d\d\s+day 3$/.test(row),row);
  for(let n=1;n<=7;n++)assert(new RegExp('^Gate '+n+'  .*: PASS$','m').test(txt),'gate '+n+' line');
  const bad=cp.spawnSync(process.execPath,[TOOL,path.join(tmp,'nobody.txt')],{encoding:'utf8'});assert.equal(bad.status,2);assert(/cannot read .*nobody\.txt: ENOENT/.test(bad.stderr),bad.stderr);
  const opt=cp.spawnSync(process.execPath,[TOOL,'--frobnicate'],{encoding:'utf8'});assert.equal(opt.status,2);assert(opt.stderr.includes('unknown option --frobnicate'));
  const stdin=cp.execFileSync(process.execPath,[TOOL,'--json','--testers','1'],{input:'Tester: Bola\n'+R.paste2,encoding:'utf8'});assert.equal(JSON.parse(stdin).testers[0].name,'Bola');
  return {row:row.replace(/\s+/g,' ')};});

 /* ---------- Synthetic testers, written by the real daysText35 ---------- */
 // built records -> the real copy text (timeline + days + block), with the clock at the copy time
 const T0=Date.UTC(2026,10,2,9,0,0),MIN=60000,HR=3600000;
 const pasteOf=(days,copiedAt)=>run(`(()=>{S.life.days=${JSON.stringify(days)};T35=${copiedAt};return timelineSummary34();})()`);
 const ev=(...a)=>a.map(([t,k,x])=>x===undefined?{t,k}:{t,k,a:x});
 // one tester: day minutes [d1,d2,d3] in ms, ratings, answers, the gap before days 2 and 3, the first catch, the day-3 evening
 function rec(o={}){const m=o.min||[25*MIN,27*MIN,30*MIN],rt=o.rating||[2,2,3],gap=o.gap||[20*HR,20*HR],days={};let s=T0+(o.offset||0);
  const day=(n,events)=>{const tot=m[n-1],r={startedAt:s,sleptAt:o.unslept===n?null:s+tot+5*MIN,playedMs:tot-3*MIN,panelMs:3*MIN,rating:o.unslept===n?null:rt[n-1],want:null,neighbour:null,dropped:0,events};
   if(o.unslept!==n)r.events=events.concat(ev([Math.round(tot/1000),'sleep']));days[n]=r;return r;};
  day(1,ev([0,'wake']).concat(o.rocks1?ev([o.rocks1[0],'at-rocks']):[]));if(o.stop===1)return days;
  s=days[1].sleptAt+gap[0];const rk=o.rocks||[300,60];
  day(2,ev([0,'wake'],[0,'morning','seedling'],[30,'plant'],[40,'water','1']).concat(o.rocks1?ev([o.rocks1[1],'catch','tilapia']):ev([rk[0],'at-rocks'],[rk[0]+10,'cast'],[rk[0]+14,'bite'],[rk[0]+rk[1],'catch','tilapia'])).concat(ev([700,'request','nkechi:1'],[900,'buy','armchair'],[960,'place','armchair:veranda'])));
  if(o.stop===2||o.unslept===2)return days;
  s=days[2].sleptAt+gap[1];const d3=day(3,ev([0,'wake'],[0,'morning','grew'],[20,'water','3'],[25,'harvest']).concat(o.evening===false||o.evening===4?[]:ev([1500,'evening','done'])));
  if(o.unslept!==3){d3.want=o.want!==undefined?o.want:'A reading lamp by the window';d3.neighbour=o.neighbour!==undefined?o.neighbour:'Tunde talks to his peppers';}
  if(o.evening===4){s=days[3].sleptAt+gap[1];day(4,ev([0,'wake'],[0,'morning','evening-again'],[1300,'evening','done']));}
  return days;}
 const NAMES=['amaka','bola','chidi','dayo','efua'];
 // five testers; over[i] are per-tester options; header lines per tester (Coached: no by default)
 function set(over={},opt={}){const inputs=[];NAMES.forEach((nm,i)=>{if(opt.only&&!opt.only.includes(i))return;const o=Object.assign({offset:i*HR},over[i]||{}),days=rec(o);
   const last=Object.values(days).reduce((x,r)=>Math.max(x,r.sleptAt||r.startedAt+30*MIN),0);const head=`Tester: ${nm}\n`+(o.coached===undefined?'Coached: no\n':o.coached===null?'':`Coached: ${o.coached?'yes':'no'}\n`)+(o.done?'Done: yes\n':'');
   inputs.push({name:nm+'.txt',text:head+pasteOf(days,o.copiedAt!==undefined?o.copiedAt:last+MIN)});});
  return A(inputs,Object.assign({testers:5,final:true},opt.a||{}));}
 const only=(a,n,want,msg)=>{const s=statuses(a);for(let k=1;k<=7;k++)assert.equal(s[k-1],k===n?want:'PASS',(msg||'')+' gate '+k+': '+JSON.stringify(s));};

 check('Synthetic 1. Five testers who meet every gate (texts written by the real daysText35) give PASS on all seven, and the table carries each tester',()=>{
  const a=set({0:{rating:[2,2,3]},1:{rating:[2,2,3]},2:{rating:[2,2,3]},3:{rating:[2,2,2]},4:{rating:[2,2,2]}});assert.deepEqual(statuses(a),Array(7).fill('PASS'));
  assert.deepEqual(a.testers.map(t=>t.name),NAMES);for(const t of a.testers)assert.deepEqual(t.warnings,[],t.name);
  const txt=G.textReport(a);for(const nm of NAMES)assert(new RegExp('^'+nm+'\\s+3\\s+25\\.0 / 27\\.0 / 30\\.0\\s','m').test(txt),nm+' row');
  return {gates:a.gates.map(g=>({gate:g.gate,status:g.status,numbers:g.numbers}))};});

 const top3={0:{rating:[2,2,3]},1:{rating:[2,2,3]},2:{rating:[2,2,3]},3:{rating:[2,2,2]},4:{rating:[2,2,2]}};
 const mix=(o)=>{const r={};for(const k of Object.keys(top3))r[k]=Object.assign({},top3[k],o[k]||{});return r;};

 check('Synthetic gate 1. Four of five slept on day 2 with “Coached: no” passes; three fails; a coached finisher fails; finishers without the reviewer’s note stay NOT YET, with the log’s count said',()=>{
  const four=set(mix({4:{stop:2,unslept:2,done:true}}));assert.equal(gate(four,1).status,'PASS');assert.equal(gate(four,1).numbers.sleptDay2,4);
  const three=set(mix({3:{stop:2,unslept:2},4:{stop:2,unslept:2}}));assert.equal(gate(three,1).status,'FAIL');assert.equal(gate(three,1).numbers.sleptDay2,3);
  const coached=set(mix({0:{coached:true},4:{stop:2,unslept:2}}));assert.equal(gate(coached,1).status,'FAIL');assert(gate(coached,1).lines[1].includes('amaka (coached)'));
  const noNote=set(mix({0:{coached:null},4:{stop:2,unslept:2}}));assert.equal(gate(noNote,1).status,'NOT YET');assert(gate(noNote,1).lines[0].startsWith('The log shows 4 of 5 slept on day 2'));assert(gate(noNote,1).lines[1].includes('still to note: amaka'));
  const prog=set(mix({4:{stop:2,unslept:2}}),{a:{final:false}});assert.equal(gate(prog,1).status,'PASS','four confirmed is a pass even in progress');
  const early=set(mix({3:{stop:2,unslept:2},4:{stop:2,unslept:2}}),{a:{final:false}});assert.equal(gate(early,1).status,'NOT YET','two still playing day 2');
  return {four:gate(four,1).numbers,three:gate(three,1).numbers};});

 check('Synthetic gate 2. Day 3 started exactly 48 h after day-2 Sleep passes and 48 h plus one second fails; a morning-page copy that woke day 3 is read by the Continue that followed (47 h passes, 49 h fails), also when the morning page saw a tap that was logged (watering) before the tester left; a pause logged after two minutes of day-3 play is not the return; in the shipped runtime, a copy on the day-3 morning page and a tap in the same tab 47 h or 49 h after Sleep (no reload, no Continue) logs a resume and is read as the return (passes, fails); not back after 49 h by the copy time fails; not back yet is NOT YET',()=>{
  const ok=set(mix({2:{gap:[20*HR,48*HR]}}));only(ok,2,'PASS','48 h');
  const over=set(mix({2:{gap:[20*HR,48*HR+1000]}}));only(over,2,'FAIL','48 h + 1 s');
  // the copy woke day 3 a minute after Sleep; the Continue came 47 h (or 49 h) after Sleep, within two minutes of that day's play
  const mk=h=>{const o=mix({});o[2]=Object.assign({},o[2],{gap:[20*HR,MIN]});const days=rec(Object.assign({offset:2*HR},o[2]));days[3].events.splice(2,0,{t:30,k:'resume',w:days[2].sleptAt+h});
   const inputs=[];NAMES.forEach((nm,i)=>{const d=i===2?days:rec(Object.assign({offset:i*HR},o[i]));inputs.push({name:nm+'.txt',text:'Coached: no\n'+pasteOf(d,T0+30*24*HR)});});return A(inputs,{testers:5,final:true});};
  const r47=mk(47*HR),r49=mk(49*HR);only(r47,2,'PASS','resume 47 h');only(r49,2,'FAIL','resume 49 h');assert(gate(r47,2).lines[0].includes('chidi 47.0 h (by its return)'));
  // the morning page saw a logged tap (the pot watered) before the tester left the tab; the return 49 h after Sleep is still the one that counts
  const mkW=(h,t)=>{const o=mix({});o[2]=Object.assign({},o[2],{gap:[20*HR,MIN]});const days=rec(Object.assign({offset:2*HR},o[2]));days[3].events.splice(2,0,{t:5,k:'water',a:'2'},{t,k:'resume',w:days[2].sleptAt+h});
   const inputs=[];NAMES.forEach((nm,i)=>{const d=i===2?days:rec(Object.assign({offset:i*HR},o[i]));inputs.push({name:nm+'.txt',text:'Coached: no\n'+pasteOf(d,T0+30*24*HR)});});return A(inputs,{testers:5,final:true});};
  const w49=mkW(49*HR,8);only(w49,2,'FAIL','a logged tap, then the return 49 h after Sleep');assert(gate(w49,2).lines[0].includes('chidi 49.0 h (by its return)'),gate(w49,2).lines[0]);
  const w47=mkW(47*HR,8);only(w47,2,'PASS','a logged tap, then the return 47 h after Sleep');
  // a pause after more than two minutes of day-3 play is not the return: the day was already being played (from its start, a minute after Sleep)
  const late=mkW(60*HR,200);only(late,2,'PASS','a pause after 3:20 of play');assert(gate(late,2).lines[0].includes('chidi 0.0 h'),gate(late,2).lines[0]);
  // the shipped runtime: a household sleeps on day 2, the tester copies on the day-3 morning page (which wakes day 3) and leaves the tab open;
  // 47 h (or 49 h) after Sleep a tap in the same tab (no reload, no Continue) logs the return, and the gates tool reads it
  const live=h=>{run('var KEEP35=S;');try{fresh();run("S.firstEvening.enabled=false;DAYS35.input();");run('T35+=60000');act('nextday');run('T35+=60000;DAYS35.input();T35+=60000');act('nextday');
    const slept=J('LOG35.day(2).sleptAt');run('T35+=60000');const p1=copyButton();assert.equal(J('LOG35.day(3).startedAt'),run('T35'),'the copy woke day 3');
    run(`T35=${slept}+${h};DAYS35.input();`);const res=J("LOG35.events(3).filter(e=>e.k==='resume')");assert.equal(res.length,1,'one resume');assert.equal(res[0].w,slept+h,'with the wall time of the tap');
    const p2=copyButton();return {slept,a:A([{name:'femi-1.txt',text:'Coached: no\n'+p1},{name:'femi-2.txt',text:p2}],{testers:1,final:true})};}finally{run('S=KEEP35;delete globalThis.KEEP35;');}};
  const l47=live(47*HR),l49=live(49*HR);assert.equal(gate(l47.a,2).status,'PASS',gate(l47.a,2).lines[0]);assert(gate(l47.a,2).lines[0].includes('femi 47.0 h (by its return)'),gate(l47.a,2).lines[0]);
  assert.equal(gate(l49.a,2).status,'FAIL',gate(l49.a,2).lines[0]);assert(gate(l49.a,2).lines[0].includes('femi 49.0 h (by its return)'),gate(l49.a,2).lines[0]);
  const gone=set(mix({2:{stop:2,copiedAt:T0+2*HR+(25+5)*MIN+20*HR+(27+5)*MIN+49*HR}}));assert.equal(gate(gone,2).status,'FAIL');assert(gate(gone,2).lines[0].includes('chidi not back after 49.0 h'));
  const wait=set(mix({2:{stop:2}}),{a:{final:false}});assert.equal(gate(wait,2).status,'NOT YET');assert(gate(wait,2).lines[0].includes('chidi not back yet'));
  return {ok:gate(ok,2).numbers,over:gate(over,2).numbers,resume47:gate(r47,2).status,resume49:gate(r49,2).status,afterATap49:gate(w49,2).status,pauseAfterPlay:gate(late,2).status,sameTab47:gate(l47.a,2).status,sameTab49:gate(l49.a,2).status};});

 check('Synthetic gate 3. Day-3 mean equal to day 1’s with exactly three top faces passes; two top faces fails; a day-3 mean one step below day 1’s fails',()=>{
  const eq=set({0:{rating:[3,2,3]},1:{rating:[3,2,3]},2:{rating:[2,2,3]},3:{rating:[2,2,2]},4:{rating:[3,2,2]}});only(eq,3,'PASS','equal means');assert.equal(gate(eq,3).numbers.day1Mean,gate(eq,3).numbers.day3Mean);assert.equal(gate(eq,3).numbers.day3Top,3);
  const two=set({0:{rating:[2,2,3]},1:{rating:[2,2,3]},2:{rating:[2,2,2]},3:{rating:[2,2,2]},4:{rating:[2,2,2]}});only(two,3,'FAIL','two top faces');assert.equal(gate(two,3).numbers.day3Top,2);
  const low=set({0:{rating:[3,2,3]},1:{rating:[3,2,3]},2:{rating:[3,2,3]},3:{rating:[3,2,2]},4:{rating:[2,2,2]}});only(low,3,'FAIL','day-3 mean below day 1');
  assert.deepEqual([gate(low,3).numbers.day1Mean,gate(low,3).numbers.day3Mean],[2.8,2.6]);
  return {equal:gate(eq,3).numbers,twoTop:gate(two,3).numbers,lower:gate(low,3).numbers};});

 check('Synthetic gate 4. Both answers from every tester pass (a four-letter word counts); “nothing”, a blank answer or a three-letter word fails, and the report quotes the answers',()=>{
  const ok=set(mix({1:{want:'Rugs',neighbour:'Ada weaves'}}));only(ok,4,'PASS','four letters');
  for(const [w,n] of [['nothing','Tunde grows peppers'],['A fan',''],['Fan','Ada weaves'],['I don’t know','idk']]){const a=set(mix({1:{want:w,neighbour:n}}));only(a,4,'FAIL',JSON.stringify([w,n]));}
  const a=set(mix({1:{want:'nothing',neighbour:'Tunde grows peppers'}}));assert(gate(a,4).lines.some(l=>l==='bola: want “nothing” (vague); neighbour “Tunde grows peppers”'),gate(a,4).lines.join('|'));
  const quote=set(mix({1:{want:'A "big" mirror · gold',neighbour:'Nkechi’s " · neighbour: " joke'}}));only(quote,4,'PASS','quotes in answers');
  assert.deepEqual(quote.testers[1].answers,{want:'A "big" mirror · gold',neighbour:'Nkechi’s " · neighbour: " joke'});
  return {specific:gate(ok,4).numbers};});

 check('Synthetic gate 5. A median real day of exactly 20:00 or exactly 35:00 passes; 19:59 and 35:01 fail; the median, not the mean, is used',()=>{
  // fifteen finished days: seven short, the median day, seven long
  const spread=mid=>{const v=[10,10,10,10,10,10,10].map(x=>x*MIN).concat([mid]).concat([60,60,60,60,60,60,60].map(x=>x*MIN));const o={};
   NAMES.forEach((_,i)=>{o[i]=Object.assign({},top3[i],{min:[v[i*3],v[i*3+1],v[i*3+2]]});});return set(o);};
  const r=[[20*MIN,'PASS'],[35*MIN,'PASS'],[20*MIN-1000,'FAIL'],[35*MIN+1000,'FAIL']].map(([mid,want])=>{const a=spread(mid);only(a,5,want,'median '+mid);assert.equal(gate(a,5).numbers.medianMs,mid);return gate(a,5).numbers.medianMs;});
  const prog=set(mix({4:{stop:2}}),{a:{final:false}});assert.equal(gate(prog,5).status,'NOT YET','a tester still playing');
  return {medians:r};});

 check('Synthetic gate 6. Four of five seeing the veranda evening on day 3 passes; three fails, and an evening first seen on day 4 does not count',()=>{
  const four=set(mix({4:{evening:false}}));only(four,6,'PASS','four of five');
  const three=set(mix({3:{evening:false},4:{evening:4}}));only(three,6,'FAIL','three of five');assert(gate(three,6).lines[0].includes('Missed: dayo, efua (day 4).'),gate(three,6).lines[0]);
  return {four:gate(four,6).numbers,three:gate(three,6).numbers};});

 check('Synthetic gate 7. A first catch 2:00 of play after first reaching the rocks passes and 2:01 fails, also across a night (rocks near the end of day 1, the catch on day 2); a catch logged before any at-rocks is set aside with a note',()=>{
  const ok=set(mix({0:{rocks:[300,120]}}));only(ok,7,'PASS','2:00');
  const over=set(mix({0:{rocks:[300,121]}}));only(over,7,'FAIL','2:01');assert(gate(over,7).lines[0].includes('amaka 2:01'));
  // day 1 is 25 min (1500 s); rocks at 1400 s, the catch at 20 s of day 2: 100 + 20 = 120 s
  const night=set(mix({1:{rocks1:[1400,20]}}));only(night,7,'PASS','across a night');assert.deepEqual(night.testers[1].firstCatch,{seconds:120,rocksDay:1,catchDay:2});
  const night2=set(mix({1:{rocks1:[1400,21]}}));only(night2,7,'FAIL','across a night, 2:01');
  const days=rec({offset:0});days[2].events=days[2].events.filter(e=>e.k!=='at-rocks');const a=A([{name:'amaka.txt',text:'Coached: no\n'+pasteOf(days,T0+9*24*HR)}],{testers:1,final:true});
  assert.equal(a.testers[0].firstCatch.state,'unknown');assert(gate(a,7).lines[0].includes('a catch before any at-rocks event'));
  return {ok:gate(ok,7).numbers,over:gate(over,7).numbers,acrossNight:night.testers[1].firstCatch};});

 check('Synthetic 9. In progress (no --final): three testers part-way through day 2 and two not pasted yet give NOT YET on every gate, with the missing testers named in the notes',()=>{
  const a=set({0:{stop:2,unslept:2},1:{stop:2,unslept:2},2:{stop:2,unslept:2}},{only:[0,1,2],a:{final:false}});assert.deepEqual(statuses(a),Array(7).fill('NOT YET'));
  assert(G.textReport(a).includes('2 of 5 testers have no paste yet'));return {statuses:statuses(a)};});

 /* ---------- Malformed and partial pastes ---------- */
 const realText=R.paste2;
 check('Paste 1. An online household: the copy button gives only “No first-evening timeline yet.” (no day log online); the tool says so and still reports',()=>{
  const snap=run('JSON.stringify(S)');run('NET.room={emit:()=>Promise.resolve()};NET.on=true;delete S.firstEvening.log;');const t=copyButton();run(`NET.on=false;S=JSON.parse(${JSON.stringify(snap)});`);assert.equal(t,'No first-evening timeline yet.','online copy');
  const a=A([{name:'kemi.txt',text:t}],{testers:5,final:false}),k=a.testers[0];assert.equal(k.name,'kemi');assert(k.warnings.some(w=>w.includes('only the first-evening timeline, no days')),k.warnings.join('|'));
  assert(k.warnings.some(w=>w.includes('online play keeps no log')));assert.deepEqual(statuses(a),Array(7).fill('NOT YET'));const txt=G.textReport(a);assert(/^kemi\s+—\s+— \/ — \/ —/m.test(txt),txt);
  return {warnings:k.warnings};});

 check('Paste 2. Only the first-evening timeline (no days part): reported as a timeline without days, nothing invented',()=>{
  const t=realText.slice(0,realText.indexOf('\n\nCompound Days days'));const a=A([{name:'lola.txt',text:t}],{testers:1,final:true}),l=a.testers[0];
  assert.deepEqual(l.days,{});assert(l.warnings.some(w=>w.includes('only the first-evening timeline')));assert.equal(l.reachedDay,0);return {warnings:l.warnings.length};});

 check('Paste 3. Cut short inside the data block: the block is reported cut (characters held of the total) and the readable lines are used; cut inside the days: the days read so far are kept, the broken line is named',()=>{
  const i=realText.indexOf('CD35/1 ');const mid=realText.slice(0,i+400);const a=A([{name:'amaka.txt',text:mid}],{testers:1}),t=a.testers[0];
  assert(t.warnings.some(w=>/the data block has no end line; read from the readable lines/.test(w)),t.warnings.join('|'));assert.deepEqual(t.ratings,[2,3,3]);
  const blk=realText.split('\n').filter(l=>l.startsWith('CD35/1 '));const drop=realText.replace(blk[3]+'\n','');const b=A([{name:'amaka.txt',text:drop}],{testers:1}).testers[0];
  assert(b.warnings.some(w=>/the data block holds \d+ of \d+ characters/.test(w)),b.warnings.join('|'));
  const d3=realText.indexOf('\nDay 3 · ');const c=A([{name:'amaka.txt',text:realText.slice(0,d3+30)}],{testers:1}).testers[0];
  assert.deepEqual(Object.keys(c.days),['1','2']);assert(c.warnings.some(w=>w.includes('could not be read (cut short?)')),c.warnings.join('|'));assert(c.warnings.some(w=>w.includes('no data block at the end')));
  const e2=realText.indexOf('\nDay 2 · '),ln=realText.indexOf('\n',realText.indexOf('\n',e2+1)+1);const e=A([{name:'amaka.txt',text:realText.slice(0,ln-3)}],{testers:1}).testers[0];
  assert(e.days[2]&&e.days[2].events.length>0,'day 2 kept');assert(e.warnings.some(w=>/an event ".*" could not be read/.test(w)||w.includes('no data block')),e.warnings.join('|'));
  return {cutInBlock:t.warnings.length,cutInDay3:c.warnings.length};});

 check('Paste 4. An altered block (one character changed) fails its check value and falls back to the readable lines; an e-mail-quoted, CRLF paste reads the same as the original; empty or unrelated text says it is not a Compound Days copy',()=>{
  const blk=realText.split('\n').filter(l=>l.startsWith('CD35/1 '));const alt=blk[1].slice(0,20)+(blk[1][20]==='1'?'2':'1')+blk[1].slice(21);
  const a=A([{name:'amaka.txt',text:realText.replace(blk[1],alt)}],{testers:1}).testers[0];assert(a.warnings.some(w=>w.includes('does not match its check value')),a.warnings.join('|'));assert(a.approx);
  const quoted=realText.split('\n').map(l=>'> '+l).join('\r\n');const q=A([{name:'amaka.txt',text:quoted}],{testers:1,final:true}),o=A([{name:'amaka.txt',text:realText}],{testers:1,final:true});
  assert.deepEqual(q.testers[0].days,o.testers[0].days);assert.deepEqual(q.testers[0].warnings,[]);
  for(const s of ['','hello, here is my game thing','Day three was lovely!'])assert(A([{name:'x.txt',text:s}],{testers:1}).testers[0].warnings.some(w=>/nothing in this paste looks like a Compound Days copy|no paste found/.test(w)),JSON.stringify(s));
  return {altered:a.warnings[0]};});

 check('Paste 5. Two sittings that disagree on a day’s start (two households or devices) are flagged; several testers in one file split at their Tester lines; a sitting number in the file name merges sittings',()=>{
  const d1=rec({}),d2=rec({offset:7*HR});const a=A([{name:'amaka-1.txt',text:pasteOf(d1,T0+9*24*HR)},{name:'amaka-2.txt',text:pasteOf(d2,T0+10*24*HR)}],{testers:1}).testers;
  assert.equal(a.length,1);assert(a[0].warnings.some(w=>w.includes('sittings disagree on when day 1 started')),a[0].warnings.join('|'));
  const one='Tester: Amaka\n'+pasteOf(rec({}),T0+9*24*HR)+'\n\nTester: Bola\nCoached: no\nNote: asked where the rocks were\n'+pasteOf(rec({offset:HR}),T0+9*24*HR);
  const b=A([{name:'all.txt',text:one}],{testers:2});assert.deepEqual(b.testers.map(t=>t.name),['Amaka','Bola']);assert.deepEqual(b.testers[1].notes,['asked where the rocks were']);
  assert(G.textReport(b).includes('Bola (reviewer): asked where the rocks were'));
  assert.deepEqual(['amaka-2.txt','amaka_sitting3.txt','amaka 2.txt','amaka (2).txt','tester3.txt'].map(f=>A([{name:f,text:pasteOf(rec({}),T0)}],{testers:1}).testers[0].name),['amaka','amaka','amaka','amaka','tester3']);
  return {testers:b.testers.length};});

 check('Report hygiene: no report names a weekday or shows undefined or NaN, and the same pastes give the same report twice (no wall clock)',()=>{
  const inputs=[{name:'amaka-1.txt',text:R.paste1},{name:'amaka-2.txt',text:R.paste2},{name:'kemi.txt',text:'No first-evening timeline yet.'}];
  const t1=G.textReport(A(inputs,{testers:5})),t2=G.textReport(A(inputs,{testers:5}));assert.equal(t1,t2);
  const j1=JSON.stringify(A(inputs,{testers:5,final:true})),j2=JSON.stringify(A(inputs,{testers:5,final:true}));assert.equal(j1,j2);
  for(const s of [t1,G.textReport(A(inputs,{testers:5,final:true})),j1])assert(!WEEKDAY35.test(s)&&!/undefined|NaN/.test(s),'clean report');
  return {reportLines:t1.split('\n').length};});

 fs.rmSync(tmp,{recursive:true,force:true});
 const report={build:run('BUILD_ID'),passed:!failed,checks,method:'Actual shipped runtime with every v35 module in Node; a companion household driven by dispatch of real actions and the real tick functions, the copy taken from the real Menu copy button, then read by tools/gates-v35.cjs (as a module and on the command line). Synthetic testers are written by the real daysText35 from built records. The wall clock is stubbed through CLOCK35.'};
 fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);let build=null;try{build=runFn&&runFn('BUILD_ID');}catch(_){}try{fs.rmSync(tmp,{recursive:true,force:true});}catch(_){}
 fs.writeFileSync(OUT,JSON.stringify({build,passed:false,checks,failure:String(e&&e.stack||e).split('\n')[0]},null,2)+'\n');process.exitCode=1;});

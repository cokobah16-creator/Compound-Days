// The veranda evening (v35, dist/src/evening-v35.js), checked on the real game logic in Node with the shipped Three.js.
// The checks run twice in child processes and the two reports must match (check 8), so the results file is the same on every run.
// Clock, rng and Date are stubbed (spec 11.2); no wall-clock value reaches the results. Nothing is rendered here.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process');
const OUT=path.join(__dirname,'results-evening-v35.json');
const NAMES=[
 '1. No start on day 2, before 18:00, from 22:00, with nobody home, during the guided evening, during a party or online; nobody home in the window gets one nudge, a marker and a Today card, never a panel',
 '2. Day 3 at 18:30 with the human on the veranda: the guests walk in from the gate to validated street spots, clear of the sightline, kept through reroute and placeNPCs; a blocked street retries at most once a second',
 '3. The guests reach their spots facing the veranda well inside 20 s of stubbed time',
 '4. Talking: Tunde, Mama Nkechi, then Ada with the armchair line; Act through the forced hotspot, the Next guard, the 8 s timer, a pause behind panels, the camera ease and the companion beside the player',
 '5. After the third line: saved once with one cue and one memory, the guests walk back to the gate and return to their schedule',
 '6. A missed evening stays pending and runs the next day; the 20 s timeout settles guests who cannot walk',
 '7. A new day, going online or a party mid-arrival aborts without marking it done; with Ada visiting she stays on her veranda cell and still speaks third',
 '8. Determinism: two runs give identical reports'];

function inner(){
 const {load}=require('./runtime-harness.cjs');const checks=[];let run=null;
 const step=async(idx,fn)=>{const name=NAMES[idx];try{assert.equal(run('typeof EVENING35'),'object','evening-v35.js is loaded');const info=await fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});}
  catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});if(process.env.DEBUG35)console.error(name.slice(0,3),e&&e.stack);}};
 (async()=>{
  ({run}=await load());
  const J=code=>JSON.parse(run('JSON.stringify('+code+')'));
  const r2=v=>Math.round(v*100)/100;
  // 11.2 determinism helpers
  run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;");
  run("var T35=1790000000000;if(typeof CLOCK35!=='undefined')CLOCK35.fn=()=>T35;");
  run("var PH='',TOASTS=[],CUES=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}if(typeof CUE35_HOOKS!=='undefined')CUE35_HOOKS.push(n=>CUES.push(n));");
  // a companion household (verify-bridge's set-up): the real world, the authored hero, NPCs and the life world
  run("buildTextures();buildTextures2();S=newState();S.phase='play';S.ai=true;AI.on=true;S.p[0].name='Efe';S.p[1].name='Ola';players=S.p.map((p,i)=>({i,g:makeHeroAvatar(lookFor(i)),y:0,t:0,prev:[0,0],face:[0,-1],moving:false}));players.forEach((p,i)=>{scene.add(p.g);p.g.position.set(S.p[i].pos[0],0,S.p[i].pos[1]);});buildWorld();buildProps();rebuildFurniture();spawnNPCs();ensureMarket();courtLight=new THREE.PointLight();sofa.L=1.657;sofa.W=.837;enterWorld();closePanel();");
  run("var OVC=ov.classList.contains;var fakePanel=on=>{ov.classList.contains=on?(c=>c==='on'):OVC;};");
  const at=(x,z,i=0)=>run(`players[${i}].y=0;players[${i}].g.position.set(${x},0,${z});players[${i}].prev=[${x},${z}];`);
  const ticks=(n,dt='1/30',ms=33)=>run(`for(let k=0;k<${n};k++){T35+=${ms};for(const h of TICK_HOOKS)h(${dt},!overlayOpen());}`);
  const until=(cond,max,dt='1/30',ms=33)=>run(`(()=>{let k=0;for(;k<${max}&&!(${cond});k++){T35+=${ms};for(const h of TICK_HOOKS)h(${dt},!overlayOpen());}return k;})()`);
  // day 3, guided evening finished, the armchair on the veranda at column 1, the human on the veranda and the companion inside
  const fresh=(day=3,time=18.5)=>{run(`S=newState();S.phase='play';S.ai=true;AI.on=true;S.p[0].name='Efe';S.p[1].name='Ola';S.firstEvening.completed=true;S.firstEvening.plan='garden';S.firstEvening.invitationSeen=true;S.sofa.state='placed';S.day=${day};S.time=${time};life34();
   S.home.items.push({id:'ac35',type:'armchair',x:1,y:FLAT.rows,rot:0});S.life.lastDecor='armchair';S.life.metrics.decorated=1;enterWorld();closePanel();NET.on=false;PH='';EVENING35.checkAt=0;`);
   at(-4.1,6.4);at(-5.2,4.0,1);};
  const state=()=>run('EVENING35.state');
  const spotsOK=(hx,hz)=>J(`(()=>{const s=EVENING35.spots,ks=Object.keys(s),out={n:ks.length,bad:[]};for(const k of ks){const [x,z]=s[k];
   if(blocked(x,z,PR))out.bad.push(k+' blocked');if(levelAt(x,z)!==0)out.bad.push(k+' not level');if(!(z>7.4))out.bad.push(k+' z');if(inFlat(x,z))out.bad.push(k+' in flat');
   for(const p of players)if(Math.hypot(p.g.position.x-x,p.g.position.z-z)<0.9)out.bad.push(k+' near a player');
   for(const q of ks)if(q!==k&&Math.hypot(s[q][0]-x,s[q][1]-z)<1.0)out.bad.push(k+' near '+q);
   if(EVENING35.inSight(x,z,${hx},${hz}))out.bad.push(k+' in the sightline');}return out;})()`);

  await step(0,()=>{fresh();const idle={};
   const tryIt=(label,setup,undo)=>{run(setup);ticks(5);idle[label]=state();assert.equal(state(),'idle',label);run(undo);};
   tryIt('day 2','S.day=2','S.day=3');tryIt('17:30','S.time=17.5','S.time=18.5');tryIt('22:00','S.time=22','S.time=18.5');
   tryIt('guided evening','S.firstEvening.completed=false','S.firstEvening.completed=true');
   tryIt('party','S.party={on:true,done:false,guests:[],indoor:false}','S.party=null');
   // online: only the evening hook runs here (the base net tick needs a room)
   run('NET.on=true;for(let k=0;k<5;k++){T35+=33;eveningTick35(1/30);}');idle.online=state();assert.equal(state(),'idle','online');run('NET.on=false');assert.equal(J('(()=>{NET.on=true;const p=EVENING35.pending();NET.on=false;return p;})()'),false,'not pending online');
   run("S.time=17;");assert.match(run('todayHTML34()'),/evening35-card[\s\S]*The neighbours are coming by/,'Today before six');
   run("S.time=18.5;LIFE34.waypoint=null;");at(10,10);const ph0=run('PH'),t0=run('TOASTS.length');ticks(5);idle['nobody home']=state();
   assert.equal(state(),'idle','nobody home: no start (the companion inside does not count)');
   assert.deepEqual(J('LIFE34.waypoint'),{x:-4.1,z:6.3,name:'Flat 3'},'nudge marker at Flat 3');
   const nudges=J(`TOASTS.slice(${t0})`);assert.deepEqual(nudges,[run('EVENING35.copy.nudge')],'one nudge toast');ticks(30);assert.equal(run('TOASTS.length'),t0+1,'once a day');
   assert.equal(run('PH'),ph0,'the tick opened no panel');
   const card=run('todayHTML34()');assert.match(card,/class="life-note34 evening35-card"><p class="life-kicker">THIS EVENING<\/p><h3>They are on their way<\/h3>/);
   assert.match(card,/data-act="lifeGo" data-v="home"[^>]*>Head home</,'Head home button');assert(card.indexOf('evening35-card')<card.indexOf('<div class="life-chips34">'),'card before the chips');
   assert.doesNotMatch(card,/undefined|NaN/);return {idle,nudge:nudges[0]};});

  await step(1,()=>{fresh();assert.equal(J("S.home.items.find(i=>i.id==='ac35').y"),4,'armchair on the veranda row');
   // retry: with every street candidate blocked, about a second of ticks makes at most two attempts
   run("var B0=blocked;blocked=function(x,z,r,o){return z>7.4?{tag:'test35'}:B0.apply(this,arguments);};var PS0=EVENING35.pickSpots,PSN=0;EVENING35.pickSpots=function(){PSN++;return PS0.apply(this,arguments);};");
   ticks(30);const attempts=run('PSN');assert.equal(state(),'idle','no spots, no start');assert(attempts>=1&&attempts<=2,'attempts '+attempts);
   run("blocked=B0;EVENING35.pickSpots=PS0;");
   run("LIFE34.waypoint={x:-4.1,z:6.3,name:'Flat 3'};");                 // as the nudge left it
   const k=until("EVENING35.state!=='idle'",40);assert.equal(state(),'arriving','starts once the street is free');assert.equal(J('LIFE34.waypoint'),null,'home now: the nudge marker is cleared');
   const gate=J("['tunde','nkechi','ada'].map(k=>{const n=npcs[k];return [n.g.visible,+n.g.position.x.toFixed(2),+n.g.position.z.toFixed(2)];})");
   assert.deepEqual(gate,[[true,3.6,9.6],[true,4,9.6],[true,4.4,9.6]],'three guests at the gate');
   assert.deepEqual(J("TOASTS.slice(-1)"),[run('EVENING35.copy.gate')]);
   const s1=spotsOK(-4.1,6.4);assert.equal(s1.n,3);assert.deepEqual(s1.bad,[],'spots valid for the human at (-4.1, 6.4)');
   const spots=J('EVENING35.spots');
   for(const g of ['tunde','nkechi','ada'])assert.deepEqual(J(`npcs.${g}.route[npcs.${g}.route.length-1]`),spots[g],'route ends at the spot');
   // the same rules for a human further west
   at(-6.5,6.4);const keep=J('EVENING35.spots');run('EVENING35.spots=EVENING35.pickSpots();');const s2=spotsOK(-6.5,6.4);const west=J('EVENING35.spots');run(`EVENING35.spots=${JSON.stringify(keep)};`);at(-4.1,6.4);
   assert.equal(s2.n,3);assert.deepEqual(s2.bad,[],'spots valid for the human at (-6.5, 6.4)');
   // a schedule change during the walk keeps the evening routes
   ticks(20);const snap="['tunde','nkechi','ada'].map(k=>{const n=npcs[k];return {r:n.route,ri:n.ri,x:+n.g.position.x.toFixed(3),z:+n.g.position.z.toFixed(3),d:n.dest};})";
   const before=J(snap);assert(before.every(b=>b.r&&b.ri>=1),'walking');run('reroute()');assert.deepEqual(J(snap),before,'reroute keeps routes');run('placeNPCs()');assert.deepEqual(J(snap),before,'placeNPCs keeps routes');
   return {retryAttemptsIn30Ticks:attempts,spots,westSpots:west};});

  await step(2,()=>{const k=until("EVENING35.state!=='arriving'",700);assert.equal(state(),'talking');const secs=r2((k+21)*0.033);assert(secs<20,'arrived in '+secs+' s');
   const at3=J("['tunde','nkechi','ada'].map(k=>{const n=npcs[k],s=EVENING35.spots[k];return {d:Math.hypot(n.g.position.x-s[0],n.g.position.z-s[1]),yaw:n.home[2],route:n.route};})");
   for(const a of at3){assert(a.d<1e-6,'on the spot');assert.equal(a.yaw,Math.PI,'facing the veranda');assert.equal(a.route,null);}
   return {arrivedAfterSeconds:secs};});

  await step(3,()=>{assert.equal(state(),'talking');const who=()=>run('EVENING35.el.dataset.who');const cap=()=>run('EVENING35.el.innerHTML');
   ticks(1);assert.equal(run('EVENING35.shown'),true,'caption shown');assert.equal(who(),'tunde');assert.match(cap(),/>Tunde<\/span>[\s\S]*>Next<\/button>/);
   ticks(30);const cf0=r2(run('EVENING35.camFactor'));assert(cf0<=0.76,'camera nearer on the first line: '+cf0);
   assert.equal(J('nearest(0).id'),'evening35','forced Listen hotspot for the human');assert.notEqual(run('(nearest(1)||{}).id'),'evening35','not for the companion');
   run("T35+=300;dispatch('hs',{i:0,id:'evening35'});");assert.equal(who(),'nkechi','Act advances through ACT_HOOKS');assert.match(cap(),/>Mama Nkechi<\/span>/);
   assert.equal(run('EVENING35.next()'),false,'a second call within 300 ms is ignored');assert.equal(run('EVENING35.line'),1);
   ticks(30);assert.equal(run('EVENING35.camFactor'),1,'camera back after the first line');
   // behind a panel the caption hides and the timers stop
   run('fakePanel(true)');ticks(400);assert.equal(run('EVENING35.shown'),false,'hidden behind a panel');assert.equal(run('EVENING35.line'),1,'paused behind a panel');const L0=run('EVENING35.lineT');run('fakePanel(false)');
   const auto=until("EVENING35.line!==1",400);const autoS=r2((L0+auto*33)/1000);assert(L0+(auto-1)*33<8000,'not before 8 s');assert.equal(who(),'ada','the 8 s timer advances');assert(autoS>=8&&autoS<8.04,'auto after '+autoS+' s');
   const ada=run("line35('ada',Object.assign(lineCtx35('ada'),{evening:true})).text"),adaId=run("line35('ada',Object.assign(lineCtx35('ada'),{evening:true})).id");
   assert.equal(run('EVENING35.lines[2].text'),ada,'Ada says the LINES evening line');assert(cap().includes(run('esc(EVENING35.lines[2].text)')),'Ada in the caption');assert.match(cap(),/>Goodnight<\/button>/);
   const when=J(`(LINES35.evening&&LINES35.evening.ada||[]).find(e=>e.id===${JSON.stringify(adaId)})?.when||null`);
   if(when)assert(when.includes('chair-veranda')||when.includes('chair-placed'),'the chair line: '+JSON.stringify(when));
   // the companion's evening goal is beside the human, free and inside the flat, and its own drive takes it there
   const sp=J("(()=>{const s=EVENING35.companionSpot(),h=players[0].g.position;return {x:s.x,z:s.z,d:Math.hypot(s.x-h.x,s.z-h.z),free:!blocked(s.x,s.z,PR),inFlat:inFlat(s.x,s.z)};})()");
   assert(sp.free&&sp.inFlat&&sp.d<=1.2&&sp.d>=0.6,'spot beside the human: '+JSON.stringify(sp));
   at(-5.0,6.4,1);const g=J("(()=>{const g=aiGoal(players[AI.i],1/30),h=players[0].g.position;return {x:g.x,z:g.z,d:Math.hypot(g.x-h.x,g.z-h.z),free:!blocked(g.x,g.z,PR),inFlat:inFlat(g.x,g.z)};})()");
   assert.deepEqual([g.x,g.z],[sp.x,sp.z],'with a clear way aiGoal is that spot');at(-5.2,4.0,1);
   const driven=J("(()=>{for(let k=0;k<600;k++)aiDrive(players[AI.i],1/30);const a=players[AI.i].g.position,h=players[0].g.position;return {d:+Math.hypot(a.x-h.x,a.z-h.z).toFixed(2),inFlat:inFlat(a.x,a.z)};})()");
   assert(driven.d<=1.2&&driven.d>=0.5&&driven.inFlat,'companion beside the player: '+JSON.stringify(driven));
   const names=J("EVENING35.lines.map(l=>l.k)");assert.deepEqual(names,['tunde','nkechi','ada']);
   return {camFactorFirstLine:cf0,autoAdvanceSeconds:autoS,adaLine:adaId,adaWhen:when,companionAfterDrive:driven.d};});

  await step(4,()=>{const c0=J("CUES.filter(n=>n==='evening').length"),m0=J("S.memories.filter(m=>/came by the veranda/.test(m.caption)).length"),ph0=run('PH');
   run('T35+=300;EVENING35.next();');assert.equal(state(),'leaving');assert.equal(J('S.life.evening35.doneDay'),3);
   assert.equal(J("CUES.filter(n=>n==='evening').length")-c0,1,'one evening cue');assert.equal(J("S.memories.filter(m=>/came by the veranda/.test(m.caption)).length")-m0,1,'one memory');
   assert.equal(run('EVENING35.shown'),false,'caption hidden');assert.equal(J("JSON.parse(localStorage.getItem(KEY)||'{}').life?.evening35?.doneDay??null"),3,'saved');
   assert.deepEqual(J("['tunde','nkechi','ada'].map(k=>npcs[k].route[npcs[k].route.length-1])"),[[4,9.6],[4,9.6],[4,9.6]],'walking back to the gate');
   const k=until("EVENING35.state==='idle'",900);assert.equal(state(),'idle');
   const after=J("['tunde','nkechi','ada'].map(k=>{const n=npcs[k],sp=NPC_SPOTS[k][slot()];return {cool:n.cool<1e9,toSpot:sp?!!(n.dest&&n.dest[0]===sp[0]&&n.dest[1]===sp[1]):n.hideAtEnd===true};})");
   for(const a of after){assert(a.cool,'cool restored');assert(a.toSpot,'handed to the schedule');}
   assert.equal(run('PH'),ph0,'no panel opened by the evening');assert.equal(run('EVENING35.pending()'),false);assert.equal(run('EVENING35.doneToday()'),true);
   assert.match(run('todayHTML34()'),/<h3>A good evening<\/h3>/);ticks(30);assert.equal(state(),'idle','it does not start again');
   return {handedOffAfterSeconds:r2((k+1)*0.033)};});

  await step(5,()=>{fresh();at(10,10);const steps=[];for(let t=18;t<22.01;t+=0.25){run(`S.time=${t};`);ticks(3);steps.push(state());}
   assert(steps.every(s=>s==='idle'),'never starts away from home');assert.equal(run('EVENING35.done()'),false);
   run("S.time=23;dispatch('nextday');");assert.equal(run('S.day'),4);assert.equal(run('EVENING35.pending()'),true,'pending on day 4');
   if(run("typeof morningCtx35==='function'"))assert.equal(run('morningCtx35(4).eveningPending'),true);
   run('closePanel();S.time=18.5;');at(-4.1,6.4);at(-5.2,4.0,1);until("EVENING35.state!=='idle'",10);assert.equal(state(),'arriving','runs on day 4');
   // the guests cannot walk (dt 0): after 20 s of stubbed time they step onto their spots
   const k=until("EVENING35.state!=='arriving'",700,'0');assert.equal(state(),'talking');const secs=r2(k*0.033);assert(secs>=20&&secs<20.1,'timeout '+secs);
   assert(J("['tunde','nkechi','ada'].every(k=>{const n=npcs[k],s=EVENING35.spots[k];return !n.route&&n.g.position.x===s[0]&&n.g.position.z===s[1]&&n.home[2]===Math.PI;})"),'settled on the spots');
   run('T35+=300;EVENING35.next();T35+=300;EVENING35.next();T35+=300;EVENING35.next();');assert.equal(J('S.life.evening35.doneDay'),4);
   return {timeoutSeconds:secs};});

  await step(6,()=>{fresh();ticks(1);assert.equal(state(),'arriving');ticks(30);
   run("dispatch('nextday');closePanel();");assert.equal(state(),'idle','aborted');assert.equal(run('EVENING35.done()'),false,'not done');assert.equal(run('EVENING35.pending()'),true,'repeats');
   const back=J("['tunde','nkechi','ada'].map(k=>{const n=npcs[k],r=n.route,e=r&&r[r.length-1],x=n.g.position.x,z=n.g.position.z;return {k,cool:n.cool<1e9,street:(z>7.4&&z<9.3&&x<-2)||!!(e&&e[1]>7.4&&e[1]<9.3&&e[0]<-2)};})");
   for(const b of back)assert(b.cool&&!b.street,'guests back on the schedule: '+JSON.stringify(b));
   assert.equal(run('EVENING35.camFactor'),1);
   // Ada visiting: she stays on her veranda cell and speaks third
   run("S.time=18.5;S.life.visit={k:'ada',day:S.day};placeNPCs();");at(-4.1,6.4);at(-5.2,4.0,1);const ada0=J("[npcs.ada.g.position.x,npcs.ada.g.position.z]");assert(ada0[1]<7,'Ada on the veranda');
   until("EVENING35.state!=='idle'",10);assert.equal(state(),'arriving');assert.deepEqual(J('EVENING35.walkers'),['tunde','nkechi']);assert.deepEqual(J('TOASTS.slice(-1)'),[run('EVENING35.copy.gate2')]);
   until("EVENING35.state!=='arriving'",700);assert.equal(state(),'talking');assert.deepEqual(J('EVENING35.lines.map(l=>l.k)'),['tunde','nkechi','ada']);
   run('T35+=300;EVENING35.next();T35+=300;EVENING35.next();T35+=300;EVENING35.next();');until("EVENING35.state==='idle'",900);
   const ada1=J("[npcs.ada.g.position.x,npcs.ada.g.position.z,npcs.ada.route,npcs.ada.g.visible,npcs.ada.cool<1e9]");
   assert.deepEqual(ada1,[...ada0,null,true,true],'Ada stays put');
   // going online or a party starting also ends it, undone
   fresh();until("EVENING35.state!=='idle'",10);assert.equal(state(),'arriving');run('NET.on=true;T35+=33;eveningTick35(1/30);NET.on=false;');assert.equal(state(),'idle','online aborts');
   run('EVENING35.checkAt=0;');until("EVENING35.state!=='idle'",10);assert.equal(state(),'arriving');run('S.party={on:true,done:false,guests:[],indoor:false};');ticks(1);assert.equal(state(),'idle','a party aborts');run('S.party=null;');
   assert.equal(run('EVENING35.done()'),false);return {adaCell:ada0.map(r2)};});

  process.stdout.write('\n'+JSON.stringify({build:run('BUILD_ID'),checks})+'\n');
 })().catch(e=>{process.stdout.write('\n'+JSON.stringify({build:null,checks,crash:String(e&&e.message||e).split('\n')[0]})+'\n');});
}

function outer(){
 const runs=[];
 for(let k=0;k<2;k++){let out='';try{out=cp.execFileSync(process.execPath,[__filename,'--run'],{env:process.env,encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']});}catch(e){out=String(e.stdout||'');}
  let r=null;try{r=JSON.parse(out.trim().split('\n').pop());}catch(e){r={build:null,checks:[],crash:'no report'};}runs.push(r);}
 const a=runs[0],checks=NAMES.slice(0,7).map(n=>a.checks.find(c=>c.name===n)||{name:n,passed:false,failure:a.crash||'did not run'});
 const allOk=checks.every(c=>c.passed),same=JSON.stringify(runs[0])===JSON.stringify(runs[1]);
 checks.push(allOk&&same?{name:NAMES[7],passed:true}:{name:NAMES[7],passed:false,failure:!allOk?'checks 1-7 must pass in both runs':'the two runs differ'});
 for(const c of checks)console.log(c.passed?'PASS':'FAIL',c.name,c.passed?(c.info?JSON.stringify(c.info):''):'— '+c.failure);
 const passed=checks.every(c=>c.passed);
 const report={build:a.build,passed,checks,method:'Actual runtime state, ticks and actions in Node with the shipped Three.js, the authored hero, the life modules and the v35 modules; clock35, Math.random and Date.now stubbed; run twice in child processes and compared.'};
 fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');console.log(`${checks.filter(c=>c.passed).length}/${checks.length} passed`);if(!passed)process.exitCode=1;
}
if(process.argv[2]==='--run')inner();else outer();

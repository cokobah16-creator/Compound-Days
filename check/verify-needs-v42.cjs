// Needs and aspirations (v42, dist/src/needs-v42.js): needs that run down and refill, a mood that follows them and matters,
// and each player's aspiration as daily wants, a fear and milestones. Checked on the real game logic in Node with the shipped
// Three.js; nothing is rendered. The checks run twice in child processes and the two reports must match. Math.random and
// Date.now are stubbed; no wall-clock value reaches the results.
// Prints one PASS or FAIL line per check and writes check/results-needs-v42.json.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process');
const OUT=path.join(__dirname,'results-needs-v42.json');
const NAMES=[
 '1. Off until a new morning: frames on day 1 write no S.needs42, nothing online; the first Sleep starts it with three wants (two from the aspiration) and one fear for each player',
 '2. Decay: two game hours away from home take hunger 8, fun 6, social 5 and comfort 4; at home comfort rises with the furniture; one step never counts more than four hours',
 '3. The felt mood is half the base mood (cheer, wants, fears) and half the needs with energy; the base mood field is never overwritten',
 '4. Filling: eating together (hunger +45 both), a talk (social +12 for the one talking), a catch (fun for the one fishing), cooking and a party seen on the household counters',
 '5. Wants: met by the day\'s events (three different neighbours for a talk want, each player counting their own talks), +10 mood and aspiration points; milestones add an album memory, the third a perk (the stall cook\'s dishes are better)',
 '6. Fears: going to bed hungry costs 12 mood the next morning, with a toast; the day\'s lowest purse is saved, so the broke fear survives a reload',
 '7. Mood matters: a cheerful kitchen adds to a dish and a low one takes away; a neighbour notices a low need in the talk; a need falling low gets one toast',
 '8. Today shows each player\'s bars, mood, aspiration, wants and fear; the pinned hooks hold (TICK_HOOKS 17, the bridge\'s openTalk outermost, talk still wrapped by the v35 lines) and v41\'s ladder still counts the talk',
 '9. Determinism: two runs give identical reports'];

function inner(){
 const {load}=require('./runtime-harness.cjs');const checks=[];
 (async()=>{
  const {run}=await load();
  const J=c=>JSON.parse(run('JSON.stringify('+c+')'));
  run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;setTimeout=function(f){try{f();}catch(e){}return 0;};");
  run("var PH42='';{const op=openPanel;openPanel=function(h){PH42+=String(h);return op.apply(this,arguments);};}panel.insertAdjacentHTML=function(w,h){PH42+=h;};var TOASTS42=[];toast=function(t){TOASTS42.push(t);};");
  run("buildTextures();buildTextures2();buildWorld();");
  const fresh=asp=>run(`NET.on=false;_silent=false;dispatch('aiStart');S.p[0].name='Efe';S.p[0].aspiration='${asp||'stall'}';S.household='Check';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();PH42='';TOASTS42=[];`);
  const next=()=>run("dispatch('nextday');closePanel();PH42='';");
  const away=()=>run("players.forEach(p=>p.g.position.set(14,0,0));");
  const home=()=>run("players.forEach(p=>p.g.position.set(-4.1,0,6.3));");
  const hours=h=>run(`for(let k=0;k<${Math.round(h*4)};k++){S.time+=0.25;EVENING35.tick(1.05);}`);
  const settle=()=>run("EVENING35.tick(1.05);");
  const P=i=>J(`S.needs42.p[${i}]`);
  const feel=m=>`[0,1].forEach(i=>{S.p[i].mood=${m};S.p[i].energy=${Math.max(m,50)};Object.assign(S.needs42.p[i],{hunger:${m},fun:${m},social:${m},comfort:${m}});});`;
  const set=(i,o)=>run(`Object.assign(S.needs42.p[${i}],${JSON.stringify(o)});`);
  const step=(i,fn)=>{const name=NAMES[i];try{const info=fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});}catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});}};

  step(0,()=>{fresh();for(let k=0;k<60;k++)run("for(const h of TICK_HOOKS)h(1/30,true);");hours(2);assert.equal(run('S.needs42'),undefined,'nothing before Sleep');
   run('NET.on=true');assert.equal(run('needsOn42()'),false);run('NET.on=false');next();
   const d=J('S.needs42.day');assert.equal(d.w.length,2);for(const w of d.w){assert.equal(w.length,3);assert.equal(w.filter(x=>x.asp).length,2);}assert.equal(d.f.length,2);
   assert(J("S.needs42.day.w[0].filter(w=>w.asp).every(w=>NEEDS42.WANTS.stall.some(x=>x.id===w.id))"),'Efe\'s wants come from the stall');return {wants:d.w.map(w=>w.map(x=>x.id)),fears:d.f.map(f=>f.id)};});

  step(1,()=>{fresh();next();settle();away();set(0,{hunger:80,fun:80,social:80,comfort:80});settle();hours(2);const p=P(0);
   assert.deepEqual([p.hunger,p.fun,p.social,p.comfort].map(v=>Math.round(v*1000)/1000),[72,74,75,76]);
   home();set(0,{comfort:40});hours(2);const c=P(0).comfort;assert(c>40,'comfort rises at home');const rate=J('needsComfortRate42()');assert.equal(Math.round(c*1000)/1000,Math.round((40+rate*2)*1000)/1000);
   set(0,{hunger:80});run('S.time+=9;');settle();assert.equal(P(0).hunger,64,'capped at four hours');return {homeRate:rate};});

  step(2,()=>{fresh();next();settle();away();set(0,{hunger:20,fun:20,social:20,comfort:20});run('S.p[0].energy=20;S.p[0].mood=80;');hours(1);
   assert.equal(run('S.p[0].mood'),80,'the base mood is never overwritten');const want=Math.round((80+J('(()=>{const P=S.needs42.p[0];return (P.hunger+P.fun+P.social+P.comfort+S.p[0].energy)/5})()'))/2);
   assert.equal(run('needsMood42(0)'),want,'felt mood: half base, half needs');run('cheer(0,10)');assert.equal(run('S.p[0].mood'),90,'cheer works as before');});

  step(3,()=>{fresh();next();settle();set(0,{hunger:20,social:20,fun:20});set(1,{hunger:30});run("S.dishes.push({name:'Jollof',quality:70});dispatch('eat',{ix:0});");
   assert.equal(P(0).hunger,65);assert.equal(P(1).hunger,75);
   run("{const n=npcs.tunde;n.g.visible=true;players[0].g.position.set(n.g.position.x+1,0,n.g.position.z);}openTalk(0,'tunde');closePanel();");assert.equal(P(0).social,20+8+12,'eat social then talk');
   const f0=P(0).fun;run("players[0].g.position.set(12.4,0,14.2);LIFE34.fish={i:0,phase:'bite',elapsed:0,biteAt:0};S.life.catch=null;ACTIONS.lifeReel();ACTIONS.lifeCatch({v:'keep'});closePanel();");assert.equal(P(0).fun,f0+8,'a catch');
   settle();const f1=P(1).fun;run("S.cooked.jollof=(S.cooked.jollof|0)+1;");settle();assert.equal(P(1).fun,Math.min(100,f1+10),'cooking seen on the counters: '+f1+' to '+P(1).fun);
   const s1=P(1).social;run("S.flags.parties=(S.flags.parties|0)+1;");settle();assert.equal(P(1).social,Math.min(100,s1+40),'a party');});

  step(4,()=>{fresh('host');next();settle();const w=J("S.needs42.day.w[0]");const t3=w.find(x=>x.ev==='talkK');const m0=run('S.p[0].mood');
   run("S.needs42.day.w[0]=[{id:'h-talk3',ev:'talkK',n:3,text:'Talk to three different neighbours',asp:true,c:0,done:false},{id:'h-cook',ev:'cook',n:1,text:'Cook something to share',asp:true,c:0,done:false},{id:'g-eat',ev:'eat',n:1,text:'Eat together',asp:false,c:0,done:false}];");
   for(const k of ['tunde','tunde','ada']){run(`{const n=npcs.${k};n.g.visible=true;players[0].g.position.set(n.g.position.x+1,0,n.g.position.z);}S.time+=0.01;openTalk(0,'${k}');closePanel();`);}
   assert.equal(J("S.needs42.day.w[0][0].c"),2,'two different so far');
   run("{const n=npcs.oyelaran;n.g.visible=true;players[1].g.position.set(n.g.position.x+1,0,n.g.position.z);}openTalk(1,'oyelaran');closePanel();");assert.equal(J("S.needs42.day.w[0][0].c"),2,'the other player\u2019s talk does not count for this one');run("{const n=npcs.bassey;n.g.visible=true;players[0].g.position.set(n.g.position.x+1,0,n.g.position.z);}openTalk(0,'bassey');closePanel();");
   assert.equal(J("S.needs42.day.w[0][0].done"),true);assert.equal(J('S.needs42.asp[0].pts'),2);
   run("S.needs42.asp[0].pts=3;");run("S.cooked.jollof=(S.cooked.jollof|0)+1;");settle();assert.equal(J('S.needs42.asp[0].lvl'),1,'first milestone at 5');assert(run("S.memories.some(m=>m.caption==='Efe: A welcoming door.')"),'album memory');
   run("S.p[0].aspiration='stall';S.needs42.asp[0].pts=21;S.needs42.asp[0].lvl=2;S.needs42.day.w[0][2].done=false;S.dishes.push({name:'J',quality:70});dispatch('eat',{ix:0});");assert.equal(J('S.needs42.asp[0].lvl'),3,'third milestone');
   run(feel(50)+"S.ck={r:'jollof',st:[0,1],ans:[[],[]],quick:true};['rice','tomato','pepper','onion','oil','palmoil'].forEach(k=>addPantry(k,2));");const r0=J("(()=>{const R=rng;rng=()=>0.5;finishCook();rng=R;return S.dishes[S.dishes.length-1].quality})()");
   run(feel(50)+"S.needs42.asp[0].lvl=0;S.ck={r:'jollof',st:[0,1],ans:[[],[]],quick:true};");const r1=J("(()=>{const R=rng;rng=()=>0.5;finishCook();rng=R;return S.dishes[S.dishes.length-1].quality})()");
   assert.equal(r0-r1,3,'the stall perk adds 3');return {perk:r0-r1};});

  step(5,()=>{fresh();next();settle();run("S.needs42.day.f=[{id:'f-hungry',hit:false},{id:'f-lonely',hit:false}];S.needs42.day.talkK=[[],['tunde']];");set(0,{hunger:10});set(1,{hunger:90});run('S.p[0].mood=60;S.p[1].mood=60;TOASTS42=[];');
   run("S.needs42.day.f[1]={id:'f-broke',hit:false};S.money=500;");settle();run("S.money=5000;save();S=load();enterWorld();closePanel();");assert.equal(J('S.needs42.day.minMoney'),500,'the day\u2019s lowest purse survives a reload');
   next();const m=J('[S.p[0].mood,S.p[1].mood]');assert(m[0]<=48,'hungry bed: '+m[0]);assert(m[1]<=48,'the broke fear, kept through the reload: '+m[1]);assert(run("TOASTS42.some(t=>/Efe: went to bed hungry/.test(t))"),'a toast');});

  step(6,()=>{fresh();next();settle();run(feel(90)+"S.ck={r:'jollof',st:[0,1],ans:[[],[]],quick:true};PH42='';");const up=J("(()=>{const R=rng;rng=()=>0.5;finishCook();rng=R;return S.dishes[S.dishes.length-1].quality})()");assert(run('PH42').includes('good mood'));
   run(feel(20)+"S.ck={r:'jollof',st:[0,1],ans:[[],[]],quick:true};");const down=J("(()=>{const R=rng;rng=()=>0.5;finishCook();rng=R;return S.dishes[S.dishes.length-1].quality})()");
   run(feel(50)+"S.ck={r:'jollof',st:[0,1],ans:[[],[]],quick:true};");const mid=J("(()=>{const R=rng;rng=()=>0.5;finishCook();rng=R;return S.dishes[S.dishes.length-1].quality})()");
   assert.equal(up-mid,3);assert.equal(mid-down,4);
   set(0,{hunger:10,social:60,fun:60});run("PH42='';{const n=npcs.nkechi;n.g.visible=true;players[0].g.position.set(n.g.position.x+1,0,n.g.position.z);}openTalk(0,'nkechi');");assert(run('PH42').includes('Have you eaten? Do not lie to me.'),'Nkechi notices');
   run("closePanel();TOASTS42=[];");away();set(0,{fun:30});hours(3);hours(3);assert.equal(run("TOASTS42.filter(t=>/Efe is bored/.test(t)).length"),1,'one toast');return {up,mid,down};});

  step(7,()=>{fresh();next();settle();const h=run('needsTodayHTML42()');for(const s of ['Hunger','Fun','Social','Comfort','Energy','Fear:','The neighborhood’s most-loved food stall'])assert(h.includes(s.replace('’','’')),s);
   assert.equal(run('TICK_HOOKS.length'),17);assert(run('openTalk.toString()').includes('act.before(card)'));assert(run('talk.toString()').includes('lines_talk35'));
   const p0=J('S.bonds41?S.bonds41.nb.ada.pts:0');run("{const n=npcs.ada;n.g.visible=true;players[0].g.position.set(n.g.position.x+1,0,n.g.position.z);}openTalk(0,'ada');closePanel();");assert.equal(J('S.bonds41.nb.ada.pts'),p0+1,'v41 still counts the chat');});

  process.stdout.write(JSON.stringify(checks));
 })().catch(e=>{process.stdout.write(JSON.stringify([{name:'harness',passed:false,failure:String(e&&e.stack||e)}]));});
}

if(process.argv[2]==='--inner'){inner();}
else{
 const runOnce=()=>JSON.parse(cp.execFileSync(process.execPath,[__filename,'--inner'],{maxBuffer:1<<26,encoding:'utf8'}));
 const a=runOnce(),b=runOnce();const same=JSON.stringify(a)===JSON.stringify(b);
 const checks=a.concat([{name:NAMES[8],passed:same}]);
 const build=(fs.readFileSync(path.resolve(__dirname,'..','dist','index.html'),'utf8').match(/const BUILD_ID='([^']+)';/)||[])[1];
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.failure?'\n     '+c.failure:''));
 fs.writeFileSync(OUT,JSON.stringify({build,passed:checks.every(c=>c.passed),checks},null,1)+'\n');
 if(!checks.every(c=>c.passed))process.exitCode=1;
}

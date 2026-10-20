// Feel the actions (v34): stairs rule, companion carry, solo first evening, stage timing log,
// performance step-down decisions and parallel wardrobe prefetch, all on the real game logic in Node.
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {load}=require('./runtime-harness.cjs');
const checks=[];let runFn=null;
(async()=>{
 const {run}=await load();runFn=run;
 const pass=(n,info)=>{checks.push({name:n,passed:true,info});console.log('PASS',n,info?JSON.stringify(info):'');};
 const J=code=>JSON.parse(run('JSON.stringify('+code+')'));
 assert.equal(run('typeof FEEL34'),'object');
 // A companion household with the real world, props and propped-sofa dimensions.
 run("buildTextures();buildTextures2();S=newState();S.phase='play';S.ai=true;AI.on=true;S.p[0].name='Efe';S.p[1].name='Ola';players=S.p.map((p,i)=>({i,g:makeHeroAvatar(lookFor(i)),y:0,t:0,prev:[0,0],face:[0,-1],moving:false}));players.forEach((p,i)=>{scene.add(p.g);p.g.position.set(S.p[i].pos[0],0,S.p[i].pos[1]);});buildWorld();buildProps();rebuildFurniture();spawnNPCs();ensureMarket();courtLight=new THREE.PointLight();sofa.L=1.657;sofa.W=.837;");
 // One game frame: the human walks a unit direction at the tick's speed, the companion runs aiDrive, then the carry and the companion's decisions.
 // The companion's cooldowns read performance.now(), so the clock advances with the stepped frames.
 run("var feelNow=performance.now();performance={now:()=>feelNow};");
 run("function feelFrame(vx,vz,dt){dt=dt||1/30;feelNow+=dt*1000;const p=players[0];p.prev=[p.g.position.x,p.g.position.z];const m=Math.hypot(vx,vz);const sp=SPEED*(sofa&&sofa.carrying&&sofa.holder.includes(0)?0.7:1);if(m>0.05){movePlayer(p,vx/m*sp*dt,vz/m*sp*dt);p.face=[vx/m,vz/m];}aiDrive(players[1],dt);updateSofaCarry();aiThink(dt);feelPlayHook34(dt);}");
 run("function feelState(){return {c:sofa.carrying,h:sofa.holder,sofa:[sofa.g.position.x,sofa.g.position.z],yaw:sofa.g.rotation.y,p0:[players[0].g.position.x,players[0].g.position.z,levelAt(players[0].g.position.x,players[0].g.position.z)],p1:[players[1].g.position.x,players[1].g.position.z,levelAt(players[1].g.position.x,players[1].g.position.z)],bumps:sofa.bump||0,d:Math.hypot(players[0].g.position.x-players[1].g.position.x,players[0].g.position.z-players[1].g.position.z)};}");
 const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 run('save()');assert.equal(J('S.firstEvening.log.map(l=>l.stage)')[0],'move');

 // 1. Companion carry on the open street: no slower than 90% of solo walking.
 run("players[0].g.position.set(2,0,10.5);players[0].prev=[2,10.5];");let a=J('feelState()');run("for(let k=0;k<60;k++){const p=players[0];p.prev=[p.g.position.x,p.g.position.z];movePlayer(p,SPEED/30,0);}");let b=J('feelState()');const solo=dist(a.p0,b.p0);
 run("sofa.g.position.set(4,0,10.5);sofa.g.rotation.y=0;players[0].g.position.set(sofaEnd(1)[0],0,sofaEnd(1)[1]);players[1].g.position.set(sofaEnd(0)[0],0,sofaEnd(0)[1]);dispatch('hs',{i:0,id:'sofa'});");
 for(let k=0;k<400&&!run('sofa.carrying');k++)run('feelFrame(0,0)');
 assert.equal(run('sofa.carrying'),true);assert.deepEqual(J('sofa.holder.slice().sort()'),[0,1]);assert.equal(J('FEEL34.trail.length'),2);run('for(let k=0;k<5;k++)feelFrame(0,0)');
 a=J('feelState()');run("for(let k=0;k<60;k++)feelFrame(1,0)");b=J('feelState()');const carried=dist(a.sofa,b.sofa);
 assert(carried>=0.9*solo,`carried ${carried} vs solo ${solo}`);assert.equal(b.bumps-a.bumps,0);assert(Math.abs(b.d-(1.657+0.3))<0.05);
 pass('Companion carries its end: the pair keeps 90% of solo walking speed',{solo2s:+solo.toFixed(2),carried2s:+carried.toFixed(2),gap:+b.d.toFixed(3)});
 // 2. Steering sideways turns the sofa through the path; walking back makes the companion retreat inside the tether band.
 run("sofa.g.position.set(4,0.35,12);sofa.g.rotation.y=0;players[0].g.position.set(sofaEnd(1)[0],0,sofaEnd(1)[1]);players[1].g.position.set(sofaEnd(0)[0],0,sofaEnd(0)[1]);trailSeed34();");
 a=J('feelState()');run("for(let k=0;k<50;k++)feelFrame(0,-1)");b=J('feelState()');const turn=b.yaw-a.yaw;assert(Math.abs(turn)>1.2,'sofa turned');assert.equal(b.bumps-a.bumps,0);
 run("sofa.g.position.set(4,0.35,10.5);sofa.g.rotation.y=0;players[0].g.position.set(sofaEnd(1)[0],0,sofaEnd(1)[1]);players[1].g.position.set(sofaEnd(0)[0],0,sofaEnd(0)[1]);trailSeed34();");
 a=J('feelState()');let dmin=9,dmax=0;for(let k=0;k<45;k++){run('feelFrame(-1,0)');const s=J('feelState()');dmin=Math.min(dmin,s.d);dmax=Math.max(dmax,s.d);}b=J('feelState()');
 assert(dmin>=1.957-0.4-1e-6&&dmax<=1.957+0.05,`tether ${dmin}..${dmax}`);assert(dist(a.p1,b.p1)>3.5,'companion backed up');
 pass('Sideways steering turns the sofa; walking into the companion makes it back up',{turn:+turn.toFixed(2),tether:[+dmin.toFixed(2),+dmax.toFixed(2)],retreat:+dist(a.p1,b.p1).toFixed(2)});
 // 3. Stairs rule: from the stair foot, 150 frames uphill leave both holders and the sofa on the ground.
 const stairs=mode=>{run(`AI.on=${mode==='companion'};players[0].g.position.set(6.7,0,10.2);players[1].g.position.set(6.7,0,12.16);players[0].prev=[6.7,10.2];players[1].prev=[6.7,12.16];sofa.g.position.set(6.7,0.35,11.18);sofa.g.rotation.y=Math.PI/2;sofa.holder=[0,1];sofa.carrying=true;sofa.bump=0;trailSeed34();FEEL34.stairsToastAt=-99;`);
  let maxLvl=0,inStairs=0,toasts=0;for(let k=0;k<150;k++){if(mode==='companion')run('feelFrame(0,-1)');else run("for(const p of players){p.prev=[p.g.position.x,p.g.position.z];movePlayer(p,0,-SPEED*0.7/30);}updateSofaCarry();");const s=J('feelState()');maxLvl=Math.max(maxLvl,s.p0[2],s.p1[2],run('levelAt(sofa.g.position.x,sofa.g.position.z)'));if(s.sofa[0]>=6.1&&s.sofa[0]<=7.3&&s.sofa[1]>=6.1&&s.sofa[1]<9.5)inStairs++;}
  const s=J('feelState()');assert.equal(maxLvl,0);assert.equal(inStairs,0);assert.equal(s.p0[2],0);assert.equal(run("document.getElementById('toast').textContent"),'The sofa goes through the narrow passage on the left of the courtyard, not up the stairs.');return {p0z:+s.p0[1].toFixed(2),bumps:s.bumps};};
 const st1=stairs('companion'),st2=stairs('two humans');run('AI.on=true');
 pass('Neither holder nor the sofa climbs the back stairs; one rate-limited toast explains',{companion:st1,twoHumans:st2});
 // 4. Two-human carry keeps the base symmetric maths: both walking at 0.7x move the sofa at 0.7x.
 run("AI.on=false;sofa.g.position.set(4,0.35,10.5);sofa.g.rotation.y=0;players[0].g.position.set(sofaEnd(1)[0]+0.15,0,sofaEnd(1)[1]);players[1].g.position.set(sofaEnd(0)[0]-0.15,0,sofaEnd(0)[1]);sofa.holder=[0,1];sofa.carrying=true;");
 a=J('feelState()');run("for(let k=0;k<60;k++){for(const p of players){p.prev=[p.g.position.x,p.g.position.z];movePlayer(p,SPEED*0.7/30,0);}updateSofaCarry();}");b=J('feelState()');
 assert(Math.abs(dist(a.sofa,b.sofa)-SPEEDx(0.7*2))<0.05,'two-human speed unchanged');assert(Math.abs(b.d-1.957)<0.03);run('AI.on=true');
 pass('Two-human carry is unchanged apart from the stairs rule',{sofa2s:+dist(a.sofa,b.sofa).toFixed(2)});
 // 5. Release clears both holders and the trail; the companion gets a grab cooldown.
 run("sofa.g.position.set(4,0.35,10.5);players[0].g.position.set(sofaEnd(1)[0],0,sofaEnd(1)[1]);players[1].g.position.set(sofaEnd(0)[0],0,sofaEnd(0)[1]);sofa.holder=[0,1];sofa.carrying=true;trailSeed34();dispatch('hs',{i:0,id:'drop'});");
 assert.equal(run('sofa.carrying'),false);assert.deepEqual(J('sofa.holder'),[null,null]);assert.equal(run('FEEL34.trail'),null);assert(run('AI.cool.grab>performance.now()/1000'));
 pass('Setting the sofa down releases both ends, clears the trail and cools the companion grab');

 // 6. The full move from the gate through the passage into Flat 3, the companion carrying the other end.
 run("sofa.g.visible=true;sofa.carrying=false;sofa.holder=[null,null];sofa.g.position.set(4,0,8.6);sofa.g.rotation.y=0;sofa.bump=0;crate.position.set(-1.75,0,1.0);players[0].g.position.set(sofaEnd(0)[0],0,sofaEnd(0)[1]);players[1].g.position.set(5.4,0,8.6);trailReset34();AI.cool={};dispatch('hs',{i:0,id:'sofa'});");
 for(let k=0;k<400&&!run('sofa.carrying');k++)run('feelFrame(0,0)');assert.equal(run('sofa.carrying'),true);
 const route=[[4.0,7.5],[4.1,5.4],[3.3,4.4],[2.2,2.4],[-0.4,0.6],[-3.0,0.6],[-1.75,-1.5],[-1.75,5.2],[-2.6,4.9],[-5.2,4.9]];
 let wi=0,frames=0,still=0;while(wi<route.length&&frames<1500&&run("S.sofa.state")!=='placed'){const p=J('[players[0].g.position.x,players[0].g.position.z]');const dx=route[wi][0]-p[0],dz=route[wi][1]-p[1];if(Math.hypot(dx,dz)<0.2){wi++;continue;}run(`feelFrame(${dx},${dz})`);frames++;const q=J('[players[0].g.position.x,players[0].g.position.z]');still=dist(p,q)<0.004?still+1:0;if(still>150)break;}
 assert.equal(run("S.sofa.state"),'placed',`route stopped at waypoint ${wi} after ${frames} frames`);assert.equal(run('sofa.carrying'),false);assert.equal(run('FEEL34.trail'),null);
 run('tasks()');assert.equal(run('S.firstEvening.stage'),'shop');
 pass('Gate to Flat 3 with the companion on the other end',{frames,seconds:+(frames/30).toFixed(1),bumps:run('sofa.bump||0')});

 // 7. Shop: in the guided stage the companion shops for jollof only; the human buys the rest.
 run("players[0].g.position.set(14,0,0);players[0].prev=[14,0];players[1].g.position.set(14.5,0,0.5);AI.bought=[];AI.path=null;AI.rescue=-1;");
 assert.equal(J('aiShoppingItem()').k,'rice');
 for(let k=0;k<2400&&J('AI.bought.length')<3;k++)run('feelFrame(0,0,0.1)');
 const bought=J('AI.bought');assert(bought.length>=3,'companion bought '+bought);assert(bought.every(k=>RECIPES_jollof().includes(k)));
 function RECIPES_jollof(){return J('RECIPES.jollof.needs');}
 for(const k of RECIPES_jollof()){if(run(`haveCount('${k}')`))continue;run(`{const st=STALLS.find(s=>s.items.includes('${k}'));const it=S.mkt.items['${k}'];dispatch('buy',{i:0,k:'${k}',st:st.id,price:it?Math.round(it.price*(1-(S.mkt.disc[st.id]||0))/50)*50:ING['${k}'].price});}`);}
 run("dispatch('closeMarket')");assert.equal(run('S.firstEvening.stage'),'cook');assert.equal(run("Object.keys(basket(1)).length>0"),true);
 pass('Companion shops for jollof during the guided shop stage',{companionBought:bought});
 // 8. Cook: the human goes home; the companion's bag is unpacked and it is called to the kitchen before the stations open.
 run("players[0].g.position.set(-5,0,4.4);players[0].prev=[-5,4.4];dispatch('eveningCook');");
 assert.equal(run("Object.keys(basket(1)).length"),0);assert.equal(run('FEEL34.summon'),true);assert.equal(run('canCook("jollof")'),true);
 for(let k=0;k<3000&&!run('inFlat(players[1].g.position.x,players[1].g.position.z)');k++)run('feelFrame(0,0,0.1)');
 assert(run('inFlat(players[1].g.position.x,players[1].g.position.z)'),'companion reached the flat at '+run('JSON.stringify([players[1].g.position.x,players[1].g.position.z])'));
 run('feelFrame(0,0,0.1)');assert.equal(run('FEEL34.summon'),false);assert.equal(run("document.getElementById('toast').textContent"),'Ola is here. Use the stove.');
 run("dispatch('eveningCook')");assert(run("panel.innerHTML.includes('Cook it')"));
 run("dispatch('cook',{r:'jollof'});dispatch('cookans',{i:0,ix:0});dispatch('cookans',{i:0,ix:0});");
 for(let k=0;k<200&&J('S.ck?S.ck.ans[1].length:9')<2;k++)run('feelFrame(0,0,0.1)');
 assert.equal(J('S.ck.ans[1].length'),2);run("dispatch('serve')");assert.equal(run('S.dishes.length'),1);run('tasks()');assert.equal(run('S.firstEvening.stage'),'host');
 pass('Companion comes to the kitchen, says it has arrived, and runs its own station');
 // 9. Host: the companion picks its party moves; gift and tomorrow are the human's alone.
 run("dispatch('eveningHost');dispatch('ptdish',{ix:0});dispatch('ptmusic',{v:'none'});dispatch('ptinv',{k:'tunde'});dispatch('partystart');");assert.equal(run('S.party.round'),1);
 for(let r=0;r<4;r++){run("dispatch('ptpick',{i:0,v:S.party.opts[0].id})");for(let k=0;k<60&&!run('S.party.pick[1]');k++)run('feelFrame(0,0,0.1)');assert(run('!!S.party.pick[1]'),'companion picked');run("dispatch('ptgo')");}
 assert.equal(run('S.party.done'),true);run('tasks()');assert.equal(run('S.firstEvening.stage'),'gift');
 run("dispatch('eveningGift',{v:'rug'});");assert.equal(run('S.firstEvening.stage'),'tomorrow');run("dispatch('eveningPlan',{v:'photo'});");assert.equal(run('S.firstEvening.stage'),'complete');assert.equal(run('S.firstEvening.completed'),true);
 pass('Housewarming, gift and tomorrow complete with the companion picking its moves');

 // 10. Stage timing log: one entry per transition, persisted, kept out of the shared household document, shown and copyable.
 const log=J('S.firstEvening.log');assert.deepEqual(log.map(l=>l.stage),['move','shop','cook','host','gift','tomorrow','complete']);
 for(let i=1;i<log.length;i++){assert(log[i].played>=log[i-1].played);assert(log[i].at>=log[i-1].at);assert.equal(typeof log[i].day,'number');assert.equal(typeof log[i].time,'number');}
 assert(log[log.length-1].played>0);assert.deepEqual(J('load().firstEvening.log').map(l=>l.stage),log.map(l=>l.stage));assert.equal(run('stripState().firstEvening.log'),undefined);assert.equal(run('stripState().firstEvening.stage'),'complete');
 assert(run('eveningStatusText34()').startsWith('First evening: move 0 min · shop '));assert(/ · total \d+(\.\d)? min$/.test(run('eveningStatusText34()')));run('openMenu()');run("delete navigator.clipboard;dispatch('copyTimeline')");assert(run("panel.innerHTML.includes('Evening timeline')&&panel.innerHTML.includes('complete:')"));
 pass('Stage timing log records every transition and survives reload',{stages:log.map(l=>l.stage+'@'+l.played+'s')});

 // 11. Performance floor decisions: ten contiguous seconds under 24 fps step the render scale, then lite; never up.
 run("FEEL34.perf={level:0,ratio:null,under:0,acc:0,n:0,mean:0,windows:0,steps:[],lite:false};");
 const feed=(fps,n)=>{let r=[];for(let i=0;i<n;i++)r.push(run(`perfDecide34(${fps},1)`));return r;};
 assert.deepEqual([...new Set(feed(20,9))],['hold']);assert.deepEqual(feed(30,1),['hold']);assert.deepEqual([...new Set(feed(20,9))],['hold']);assert.equal(feed(20,1)[0],'ratio');assert.equal(run('FEEL34.perf.level'),1);
 assert.deepEqual([...new Set(feed(60,30))],['hold']);assert.equal(run('FEEL34.perf.level'),1);
 assert.equal(feed(23,10).pop(),'ratio');assert.equal(run('FEEL34.perf.level'),2);assert.equal(feed(23,10).pop(),'lite');assert.equal(run('FEEL34.perf.level'),3);assert.equal(feed(10,10).pop(),'done');
 assert.equal(run('perfRatioFor34(1,1.6)'),1.25);assert.equal(run('perfRatioFor34(2,1.6)'),1.0);assert.equal(run('perfRatioFor34(1,1.0)'),1.0);assert.equal(run('perfRatioFor34(2,2)'),1.0);
 run("perfApply34('lite')");assert.equal(run('QUALITY.full'),false);assert.equal(run("localStorage.getItem('cd3-quality')"),'lite');assert(run('perf34StatusText()').includes('stepped down'));
 run("FEEL34.perf={level:0,ratio:null,under:0,acc:0,n:0,mean:0,windows:0,steps:[],lite:false,last:0};feelPerfHook34(0.016,true);feelPerfHook34(0.016,false);");assert.equal(run('FEEL34.perf.level'),0);
 pass('Performance step-down decisions: 10 s under 24 fps per notch, lite last, never up');

 // 12. Parallel wardrobe prefetch: every piece requested at once, the players' pieces first, callbacks and the one spawnNPCs preserved.
 run("const realLoad=wardrobeLoad,realSpawn=spawnNPCs,realRefresh=refreshAvatar;globalThis.PF={calls:[],cbs:[],spawn:0,refresh:[]};wardrobeLoad=function(n,cb){PF.calls.push(n);PF.cbs.push([n,cb]);};spawnNPCs=function(){PF.spawn++;};refreshAvatar=function(i){PF.refresh.push(i);};wardrobePrefetch();");
 const calls=J('PF.calls');assert.equal(calls.length,16);assert.equal(new Set(calls).size,16);assert.deepEqual(calls.slice(0,4),J('wardrobeNames(lookFor(0))'));assert.equal(J('FEEL34.prefetch.total'),16);assert.equal(run('PF.spawn'),0);
 run("PF.cbs.forEach(([n,cb])=>cb(WARDROBE.cache[n]));");assert.equal(run('PF.spawn'),1);assert.equal(J('FEEL34.prefetch.done'),16);assert(J('PF.refresh').includes(0)&&J('PF.refresh').includes(1));
 run("wardrobeLoad=realLoad;spawnNPCs=realSpawn;refreshAvatar=realRefresh;");
 pass('Wardrobe prefetch is parallel, player-first, and keeps the per-piece callbacks',{first:calls.slice(0,4)});

 // 13. The level rule is relative: a holder who starts on the lower stair ramp walks down to level 0 while carrying; climbing from there is still refused.
 const ramp=mode=>{run(`AI.on=${mode==='companion'};sofa.g.visible=true;S.sofa.state='gate';sofa.g.position.set(6.7,0.35,10.28);sofa.g.rotation.y=Math.PI/2;sofa.bump=0;players[0].g.position.set(6.7,0,9.3);players[1].g.position.set(6.7,0,9.3+1.957);players.forEach(p=>{p.prev=[p.g.position.x,p.g.position.z];movePlayer(p,0,0);});sofa.holder=[0,1];sofa.carrying=true;trailReset34();trailSeed34();FEEL34.stairsToastAt=-99;document.getElementById('toast').textContent='';`);
  const a=J('feelState()');assert(a.p0[2]>0.15&&a.p0[2]<0.25,'holder starts on the ramp at level '+a.p0[2]);
  const down=()=>mode==='companion'?run('feelFrame(0,1)'):run("for(const p of players){p.prev=[p.g.position.x,p.g.position.z];movePlayer(p,0,SPEED*0.7/30);}updateSofaCarry();");
  for(let k=0;k<60;k++)down();const b=J('feelState()');
  assert.equal(b.p0[2],0,'holder down at level 0');assert.equal(run('levelAt(sofa.g.position.x,sofa.g.position.z)'),0);assert(dist(a.sofa,b.sofa)>1.5,'sofa came down '+dist(a.sofa,b.sofa));assert.equal(b.bumps-a.bumps,0);assert.equal(run("document.getElementById('toast').textContent"),'');
  // and back toward the stairs: the holder may return to its old level but never above it
  run("players[0].g.position.set(6.7,0,9.3);players[1].g.position.set(6.7,0,9.3+1.957);players.forEach(p=>{p.prev=[p.g.position.x,p.g.position.z];movePlayer(p,0,0);});sofa.g.position.set(6.7,0.35,10.28);sofa.g.rotation.y=Math.PI/2;trailReset34();trailSeed34();");
  const up=()=>mode==='companion'?run('feelFrame(0,-1)'):run("for(const p of players){p.prev=[p.g.position.x,p.g.position.z];movePlayer(p,0,-SPEED*0.7/30);}updateSofaCarry();");
  let maxLvl=0;for(let k=0;k<60;k++){up();maxLvl=Math.max(maxLvl,J('feelState()').p0[2]);}
  assert(maxLvl<=a.p0[2]+0.002,`climbed to ${maxLvl} from ${a.p0[2]}`);assert.equal(run("document.getElementById('toast').textContent"),'The sofa goes through the narrow passage on the left of the courtyard, not up the stairs.');
  run("sofa.carrying=false;sofa.holder=[null,null];trailReset34();");return {startLevel:+a.p0[2].toFixed(3),down:+dist(a.sofa,b.sofa).toFixed(2),maxLevelClimbing:+maxLvl.toFixed(3)};};
 const r1=ramp('two humans'),r2=ramp('companion');run('AI.on=true');
 pass('A holder on the lower ramp walks down to level 0 while carrying; climbing is still refused',{twoHumans:r1,companion:r2});
 // 14. A sofa an older save left on the landing slides back to the stair foot on enterWorld and on a grab; a sofa on the ground is left alone.
 run("S.sofa.state='gate';S.sofa.pos=[6.7,5.5];S.sofa.rot=Math.PI/2;document.getElementById('toast').textContent='';enterWorld();");
 assert.deepEqual(J('S.sofa.pos'),[6.7,10.6]);assert.equal(run('S.sofa.rot'),Math.PI/2);assert.deepEqual(J('[sofa.g.position.x,sofa.g.position.z,sofa.g.rotation.y]'),[6.7,10.6,Math.PI/2]);assert(!run('sofa.carrying'));
 assert.equal(run("document.getElementById('toast').textContent"),'The sofa slid back down to the courtyard.');assert.deepEqual(J('load().sofa.pos'),[6.7,10.6]);assert.equal(run('sofaCollides(sofa.g.position.x,sofa.g.position.z,sofa.g.rotation.y)'),false);
 run("sofa.g.position.set(6.7,0,8.0);sofa.g.rotation.y=Math.PI/2;players[0].g.position.set(6.7,0,9.0);document.getElementById('toast').textContent='';grabSofa(0);");
 assert(!run('sofa.carrying'));assert(!run('sofa.holder&&sofa.holder.some(h=>h!==null)'),'nobody holds the rescued sofa');assert.deepEqual(J('[sofa.g.position.x,sofa.g.position.z]'),[6.7,10.6]);assert.equal(run("document.getElementById('toast').textContent"),'The sofa slid back down to the courtyard.');
 run("S.sofa.pos=[4,8.6];S.sofa.rot=0;document.getElementById('toast').textContent='';enterWorld();");assert.deepEqual(J('S.sofa.pos'),[4,8.6]);assert.equal(run("document.getElementById('toast').textContent"),'');
 pass('A sofa saved on the landing slides back to the stair foot on enterWorld and on a grab');
 // 15. The kitchen summon is skipped while the companion is on the roof or the roof sequence is on; the base refusal stands.
 run("S.roof=null;FEEL34.summon=false;AI.useNav=0;players[0].g.position.set(-5,0,4.4);players[0].prev=[-5,4.4];players[1].g.position.set(10,0,0);players[1].prev=[10,0];movePlayer(players[1],0,0);document.getElementById('toast').textContent='';");
 assert(J('players[1].lvl')>0,'companion on the roof');run('openCookPick()');assert.equal(run('FEEL34.summon'),false);assert.equal(run("document.getElementById('toast').textContent"),'Both of you need to be in the flat to cook.');
 run("players[1].g.position.set(14,0,0);movePlayer(players[1],0,0);S.roof={on:true,rain:false,start:0};document.getElementById('toast').textContent='';openCookPick();");assert.equal(run('FEEL34.summon'),false);assert.equal(run("document.getElementById('toast').textContent"),'Both of you need to be in the flat to cook.');
 run("S.roof=null;document.getElementById('toast').textContent='';openCookPick();");assert.equal(run('FEEL34.summon'),true);assert.equal(run("document.getElementById('toast').textContent"),'Ola is coming to the kitchen.');run("FEEL34.summon=false;FEEL34.nav=null;AI.useNav=0;");
 pass('Kitchen summon is skipped while the companion is on the roof; otherwise it is called in');
 // 16. A pre-v34 save with no log gets one seeded entry for its current stage on the first reconcile; a completed evening gets none.
 run("S.firstEvening={version:1,enabled:true,done:{},startedDay:S.day};reconcile33();");
 let seeded=J('S.firstEvening.log');assert.equal(seeded.length,1);assert.equal(seeded[0].stage,run('S.firstEvening.stage'));assert.equal(seeded[0].played,0);assert.equal(typeof seeded[0].at,'number');
 run('reconcile33()');assert.equal(J('S.firstEvening.log').length,1);assert(run('eveningStatusText34()').startsWith('First evening: '+seeded[0].stage+' 0 min · total '));
 run("S.firstEvening={version:1,enabled:true,done:{move:true,shop:true,cook:true,host:true,gift:true,tomorrow:true},reward:'rug',plan:'photo',stage:'complete',completed:true};reconcile33();");assert.equal(run('S.firstEvening.completed'),true);assert.equal(run('S.firstEvening.log'),undefined);
 pass('First reconcile seeds the timeline for a pre-v34 save',{seeded:seeded[0].stage});
 // 17. Perf floor on a device already at pixel ratio 1: the ratio notches change nothing, so they pass silently and lite follows the first window; a lite notch on an already-lite page does not toast.
 run("renderer={_r:1,shadowMap:{},getPixelRatio(){return this._r},setPixelRatio(r){this._r=r}};QUALITY.full=true;FEEL34.perf={level:0,ratio:null,under:0,acc:0,n:0,mean:0,windows:0,steps:[],lite:false};document.getElementById('toast').textContent='';");
 assert.equal(feed(20,10).pop(),'ratio');run("perfApply34('ratio')");
 assert.equal(run('FEEL34.perf.level'),3);assert.deepEqual(J('FEEL34.perf.steps'),['lite']);assert.equal(run('QUALITY.full'),false);assert.equal(run('renderer.getPixelRatio()'),1);assert.equal(run("document.getElementById('toast').textContent"),'Lighter graphics to keep the game smooth; saved for next time.');assert.equal(feed(20,10).pop(),'done');
 run("renderer._r=1.6;FEEL34.perf={level:0,ratio:null,under:0,acc:0,n:0,mean:0,windows:0,steps:[],lite:false};document.getElementById('toast').textContent='';");
 assert.equal(feed(20,10).pop(),'ratio');run("perfApply34('ratio')");assert.equal(run('renderer.getPixelRatio()'),1.25);assert.equal(run("document.getElementById('toast').textContent"),'Render resolution stepped down to keep the game smooth.');
 assert.equal(feed(20,10).pop(),'ratio');run("perfApply34('ratio')");assert.equal(run('renderer.getPixelRatio()'),1);
 run("document.getElementById('toast').textContent='';");assert.equal(feed(20,10).pop(),'lite');run("perfApply34('lite')");assert.equal(run("document.getElementById('toast').textContent"),'');assert.deepEqual(J('FEEL34.perf.steps'),['ratio','ratio']);assert.equal(run('FEEL34.perf.lite'),true);
 run("renderer=undefined;QUALITY.full=true;");
 pass('Perf notches that change nothing pass silently (lite after the first window at ratio 1); no lite toast when already lite');

 const report={build:run('BUILD_ID'),passed:true,checks,method:'Actual runtime state/actions in Node with shipped Three.js and the companion driven by aiDrive/aiThink. No browser or phone test.'};fs.writeFileSync(path.join(__dirname,'results-feel.json'),JSON.stringify(report,null,2)+'\n');
})().catch(e=>{console.error(e);let build=null;try{build=runFn&&runFn('BUILD_ID');}catch(_){}
 fs.writeFileSync(path.join(__dirname,'results-feel.json'),JSON.stringify({build,passed:false,checks,failure:String(e&&e.stack||e)},null,2)+'\n');process.exitCode=1;});
function SPEEDx(k){return 3.4*k;}

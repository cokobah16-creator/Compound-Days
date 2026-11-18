// v71c "Moving day": the sofa move taught as the first mission (dist/src/movein-v71c.js), on the real game logic in Node.
// One screen with two players and with a companion run on check/runtime-harness.cjs; two phones on check/two-phones.cjs.
// What is drawn on a phone screen (where the card sits, the rings, the arrow) is checked in check/bench-movein-v71c.cjs.
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const checks=[];let build=null,failed=0;
const pass=(n,info)=>{checks.push({name:n,passed:true,info});console.log('PASS',n,info?JSON.stringify(info):'');};
const step=async(n,what,fn)=>{try{await fn();}catch(e){failed++;const why=String(e&&e.message||e).replace(/\s+/g," ").slice(0,400);checks.push({name:'Check '+n+' failed: '+what,passed:false,failure:why});console.log('FAIL',n,what,'|',why);}};
const ROUTE=[[4.0,7.5],[4.1,5.4],[3.3,4.4],[2.2,2.4],[-0.4,0.6],[-3.0,0.6],[-1.75,-1.5],[-1.75,5.2],[-2.6,4.9],[-5.2,4.9]];   // check/verify-feel.cjs, the companion carry
(async()=>{
 const {load}=require('./runtime-harness.cjs');const {run}=await load();build=run('BUILD_ID');
 const J=code=>JSON.parse(run('JSON.stringify('+code+')'));
 // the card a view shows, as text; null when none is shown
 run(`function mvCard(i){const h=document.getElementById('half'+i);const c=h.children.find(x=>x.className&&/^mv71c( |$)/.test(x.className));if(!c||!/ on( |$)/.test(c.className))return null;return String(c.innerHTML).replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim();}
  function mvRings(){const M=MOVEIN71C;if(!M.g||!M.g.visible)return {ends:[null,null],goal:null};return {ends:M.ends.map((r,i)=>r.visible?[+r.position.x.toFixed(2),+r.position.z.toFixed(2),r.material.color.equals(new THREE.Color(M.hex[i]))?M.colour[i]:'other']:null),goal:M.goal.visible?[+M.goal.position.x.toFixed(2),+M.goal.position.z.toFixed(2)]:null};}
  var mvT=1000;performance={now:()=>mvT};
  function mvFrame(v0,v1,dt){dt=dt||1/30;mvT+=dt*1000;for(const p of players){if(AI.on&&p.i===AI.i){aiDrive(p,dt);continue;}p.prev=[p.g.position.x,p.g.position.z];const v=p.i?v1:v0;const m=v?Math.hypot(v[0],v[1]):0;p.moving=m>0.05;
    if(p.moving){const sp=SPEED*(sofa&&sofa.carrying&&sofa.holder.includes(p.i)?0.7:1);movePlayer(p,v[0]/m*sp*dt,v[1]/m*sp*dt);p.face=[v[0]/m,v[1]/m];}}
   updateSofaCarry();updateBall(dt);if(AI.on)aiThink(dt);both().forEach(i=>{hotspotCache[i]=nearest(i);});}
  function mvHUD(){updateHUD();return [mvCard(0),mvCard(1)];}`);
 run("buildTextures();buildTextures2();buildWorld();");
 const local=()=>run("NET.on=false;AI.on=false;dispatch('newgame');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupstep',{v:'p0'});dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});");
 const companion=()=>run("NET.on=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});");
 const settle=()=>run("closePanel();sofa.L=1.657;sofa.W=.837;lastInput[0]='key';lastInput[1]='key';mvFrame();mvHUD();");

 /* 1. One screen, two players: the start of the mission. */
 await step(1,'One screen, two players: taking the ends',async()=>{local();
  const intro=run("String(panel.innerHTML)");assert(/Your first job together: get the sofa in\./.test(intro),'the move-in panel introduces the mission');assert(!/Through the gate, turn left/.test(intro),'and no longer explains the whole route at once');
  settle();let c=J('mvHUD()');
  assert.deepEqual(c,['MOVING DAY · STEP 1 OF 5 Take an end Press E to take this end.','MOVING DAY · STEP 1 OF 5 Take an end Press Enter to take this end.']);
  let r=J('mvRings()');assert.deepEqual(r.ends,[[2.77,8.6,'blue'],[5.23,8.6,'gold']],'each player’s ring at the end beside them, in their colour');assert.equal(r.goal,null);
  run("players[0].g.position.set(1,0,10.4);mvFrame();");c=J('mvHUD()');assert.equal(c[0],'MOVING DAY · STEP 1 OF 5 Take an end Walk with W A S D to the blue ring by the sofa, then press E .');
  run("players[0].g.position.set(2.6,0,8.6);mvFrame();dispatch('hs',{i:0,id:'sofa'});mvFrame();");c=J('mvHUD()');r=J('mvRings()');
  assert.equal(c[0],'MOVING DAY · STEP 2 OF 5 Lift it together You have your end. Now Ola takes the other one, by the gold ring, and it lifts.');assert.equal(c[1],'MOVING DAY · STEP 1 OF 5 Take an end Press Enter to take this end.');
  assert.deepEqual(r.ends,[null,[5.23,8.6,'gold']],'only the free end keeps its ring');
  run("dispatch('hs',{i:1,id:'sofa'});mvFrame();");c=J('mvHUD()');r=J('mvRings()');assert.equal(J('!!sofa.carrying'),true);
  assert.deepEqual(c,['MOVING DAY · STEP 3 OF 5 In through the gate You go first, Ola behind you: walk to the gold ring. It only fits through the gate end first. Press E again to set it down.','MOVING DAY · STEP 3 OF 5 In through the gate Walk behind Efe, who goes first to the gold ring. It only fits through the gate end first. Press Enter again to set it down.'],'the one nearer the ring goes first, the other behind');
  assert.deepEqual(r,{ends:[null,null],goal:[4,7.3]},'the end rings go and a gold ring shows where to walk: first in front of the gate');
  pass('One screen, two players: the move-in panel introduces the mission; each half shows its player’s card in their own keys with a ring at their end; taking an end and lifting move each card on; one is told to go first and the other to walk behind, and a gold ring in front of the gate shows where to walk',{cards:c,goal:r.goal});});

 /* 2. One screen, two players: each part of the way, by where the carried sofa is. */
 await step(2,'One screen, two players: each part of the way',async()=>{const seen=[];
  run("players[0].g.position.set(9,0,12);players[1].g.position.set(11,0,12);");   // the players out of the way: only where the sofa is counts here
  for(const [x,z,want,goal,crateX] of [[4,8.0,'In through the gate',[4,7.3]],[4,6.2,'In through the gate',[4,3]],[4,5.0,'In through the gate',[4,3]],[2,2,'The crate in front of the passage is in the way',[-0.3,0.6]],
    [2,2,'Across the courtyard to the gold ring in front of the passage',[-1.75,-0.8],-3.2],[-1.75,2.3,'Along the passage',[-1.75,5.3]],[-1.75,3.5,'Along the passage',[-1.75,5.3]],[-1.75,4.2,'Through the door, end first',[-4.9,4.85]],[-3.0,4.85,'Through the door, end first',[-4.9,4.85]]]){
   if(crateX!==undefined) run(`crate.position.x=${crateX};`);
   run(`sofa.carrying=true;sofa.holder=[0,1];sofa.g.position.set(${x},0.35,${z});updateBall(1/30);`);const c=J('mvHUD()');
   assert(c[0].includes(want)&&c[1].includes(want),`at ${x},${z}: ${c[0]}`);assert.deepEqual(J('mvRings()').goal,goal,`ring at ${x},${z}`);seen.push([x,z,c[0].match(/STEP (\d) OF 5/)[1],want]);}
  run("crate.position.set(-1.75,0,1.0);sofa.carrying=false;sofa.holder=[null,null];sofa.g.position.set(2,0,2);sofa.g.position.y=0;mvFrame();");const c=J('mvHUD()');
  assert(c[0].startsWith('MOVING DAY · STEP 1 OF 5 Pick it up again'),'set down halfway: '+c[0]);
  pass('One screen, two players: the card and the gold ring follow the carried sofa from the street to the door, one ring at a time (in front of the gate, through it, past the crate while it blocks the passage, in front of the passage, the end of the hall, the door); a leg lasts until the back end is through; set down halfway, both cards ask to pick it up again',{stages:seen,afterSettingDown:c[0]});});

 /* 3. With a companion: the whole move, gate to Flat 3. */
 await step(3,'With a companion: the whole move',async()=>{companion();settle();
  let c=J('mvHUD()');assert.equal(c[1],null,'no card for the companion');assert.equal(c[0],'MOVING DAY · STEP 1 OF 5 Take an end Press E to take this end.');
  run("crate.position.set(-1.75,0,1.0);players[0].g.position.set(sofaEnd(0)[0],0,sofaEnd(0)[1]);dispatch('hs',{i:0,id:'sofa'});");
  const lift=J('[mvCard(0)]');for(let k=0;k<400&&!J('!!sofa.carrying');k++)run('mvFrame()');assert.equal(J('!!sofa.carrying'),true);
  let wi=0,frames=0;const order=[];const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  while(wi<ROUTE.length&&frames<1600&&J("S.sofa.state")!=='placed'){const p=J('[players[0].g.position.x,players[0].g.position.z]');const dx=ROUTE[wi][0]-p[0],dz=ROUTE[wi][1]-p[1];if(Math.hypot(dx,dz)<0.2){wi++;continue;}
   run(`mvFrame([${dx},${dz}])`);frames++;if(frames%6===0){const s=J('moveinStep71c(0).id');if(order[order.length-1]!==s)order.push(s);}}
  assert.equal(J("S.sofa.state"),'placed',`stopped at waypoint ${wi}`);assert.deepEqual(order,['gate','courtyard','passage','door']);
  const done=run("String(panel.innerHTML)").replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');assert(/Moving day: done\. You took an end each and steered it home together\. Everything else in Palm Court works the same way: walk up to it and press E \./.test(done),done.slice(0,200));
  run("closePanel();mvFrame();");c=J('mvHUD()');assert.deepEqual(c,[null,null],'no card once the sofa is in');assert.deepEqual(J('mvRings()'),{ends:[null,null],goal:null});
  assert.deepEqual(J('MOVEIN71C.tipLast'),{},'a clean carry gets no tip');
  pass('With a companion: only the player’s view has a card; the companion takes the other end; the card goes through the gate, the courtyard, the passage and the door; "It is in" says what was learned; then the card and the rings are gone',{companionLine:lift[0],stagesInOrder:order,frames,seconds:+(frames/30).toFixed(1)});});

 /* 4. Tips during the carry. */
 await step(4,'Tips during the carry',async()=>{companion();settle();run("players[0].g.position.set(sofaEnd(0)[0],0,sofaEnd(0)[1]);dispatch('hs',{i:0,id:'sofa'});");for(let k=0;k<400&&!J('!!sofa.carrying');k++)run('mvFrame()');
  run("keys['d']=true;");let frames=0;for(;frames<150&&!J("MOVEIN71C.tip[0]");frames++)run('mvFrame([1,0])');run("keys['d']=false;");   // hold the key and walk the sofa east until it stops
  const wall=J('mvHUD()')[0];assert(/Caught\? Back up a little, then walk straight at the opening: your companion follows and the sofa goes through end first\./.test(wall),wall);
  for(let k=0;k<200;k++)run('mvFrame()');assert(!/Caught\?/.test(J('mvHUD()')[0]),'the tip goes after six seconds');
  run("MOVEIN71C.tipLast={};sofa.g.position.set(6.2,0.35,1.5);");run('updateBall(1/30)');const east=J('mvHUD()')[0];assert(/Your door is the other way: left, through the narrow passage\./.test(east),east);
  run("MOVEIN71C.tipLast={};MOVEIN71C.tip=['',''];sofa.g.position.set(2,0.35,2);MOVEIN71C.best=Infinity;");for(let k=0;k<16*30;k++)run('updateBall(1/30)');const slow=J('mvHUD()')[0];assert(/Head for the gold ring/.test(slow),slow);
  pass('Tips during the carry: pushing into a wall without the sofa moving, heading for the stairs side of the courtyard and fifteen seconds without getting closer each bring a short tip, which goes again after six seconds',{framesUntilTheWallTip:frames,wall:wall.split('MOVING')[1].slice(-90),east:'Your door is the other way: left, through the narrow passage.',slow:'Head for the gold ring.'});});

 /* 5. Each player's controls, in their own words. */
 await step(5,'Controls in each player’s own words',async()=>{local();settle();run("players[0].g.position.set(1,0,10.4);players[1].g.position.set(7,0,10.4);mvFrame();");const out={};
  for(const [m,a,b] of [['touch','Drag on the left of the screen to walk to the blue ring by the sofa, then tap Act .','Drag on the right of the screen to walk to the gold ring by the sofa, then tap Act .'],['pad','Walk with the left stick to the blue ring by the sofa, then press A .','Walk with the left stick to the gold ring by the sofa, then press A .'],['key','Walk with W A S D to the blue ring by the sofa, then press E .','Walk with the arrow keys to the gold ring by the sofa, then press Enter .']]){
   run(`lastInput[0]='${m}';lastInput[1]='${m}';`);const c=J('mvHUD()');assert.equal(c[0],'MOVING DAY · STEP 1 OF 5 Take an end '+a);assert.equal(c[1],'MOVING DAY · STEP 1 OF 5 Take an end '+b);out[m]=[a,b];}
  companion();settle();run("lastInput[0]='touch';players[0].g.position.set(1,0,10.4);mvFrame();");const c=J('mvHUD()')[0];assert.equal(c,'MOVING DAY · STEP 1 OF 5 Take an end Drag your thumb on the screen to walk to the blue ring by the sofa, then tap Act .');
  pass('Each player is told their own controls: keys, a gamepad or touch, on the left or right of a shared screen, or anywhere on the screen when they play alone with a companion',Object.assign(out,{companionTouch:c.slice(37)}));});

 /* 6. When there is no mission. */
 await step(6,'When there is no mission',async()=>{local();settle();assert(J('mvHUD()')[0]);
  run("dispatch('eveningToggle');closePanel();mvFrame();");assert.deepEqual(J('mvHUD()'),[null,null],'guidance paused');assert.deepEqual(J('mvRings()'),{ends:[null,null],goal:null});
  run("dispatch('eveningToggle');closePanel();mvFrame();");assert(J('mvHUD()')[0],'guidance back on');
  run("S.firstEvening=null;mvFrame();");assert.deepEqual(J('mvHUD()'),[null,null],'a household that is not following the first evening');
  local();settle();run("sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();mvFrame();");assert.deepEqual(J('mvHUD()'),[null,null],'the sofa is in');
  local();settle();const keys=J('Object.keys(S).sort()');for(let k=0;k<60;k++)run('mvFrame([1,0],[1,0])');assert.deepEqual(J('Object.keys(S).sort()'),keys,'nothing is added to the saved household');
  assert.equal(J('TICK_HOOKS.length'),17,'no new per-frame hook');
  run("var mvRand=0;{const R=Math.random;Math.random=function(){mvRand++;return R();};for(let k=0;k<30;k++){moveinFrame71c(1/30);moveinCards71c(true);}Math.random=R;}");assert.equal(J('mvRand'),0,'the mission draws nothing from the random sequence');
  pass('No mission when the first-evening guidance is paused, for a household not following it, or once the sofa is in; it adds nothing to the saved household, no per-frame hook, and draws nothing from the random sequence',{tickHooks:17});});

 /* 7. Two phones: each phone teaches its own player, and the move ends on both. */
 await step(7,'Two phones',async()=>{const T=require('./two-phones.cjs');T.reset();const A=await T.makePhone('A'),B=await T.makePhone('B');
  try{await T.pair(A,B);for(const P of [A,B])P.run(`lastInput[0]='key';lastInput[1]='key';${'function mvCard(i){const h=document.getElementById(\'half\'+i);const c=h.children.find(x=>x.className&&/^mv71c( |$)/.test(x.className));if(!c||!/ on( |$)/.test(c.className))return null;return String(c.innerHTML).replace(/<[^>]+>/g,\' \').replace(/\\s+/g,\' \').trim();}'}`);
   const cards=P=>{P.run('updateHUD()');return P.J('[mvCard(0),mvCard(1)]');};
   const e=A.J('[sofaEnd(0),sofaEnd(1)]');A.run(`tp(0,${e[0][0]},${e[0][1]})`);B.run(`tp(1,${e[1][0]},${e[1][1]})`);await T.play([A,B],1);
   assert.deepEqual([cards(A),cards(B)],[['MOVING DAY · STEP 1 OF 5 Take an end Press E to take this end.',null],[null,'MOVING DAY · STEP 1 OF 5 Take an end Press E to take this end.']],'each phone shows only its own player’s card');
   assert.equal(B.run('pressAct()'),'sofa');await T.play([A,B],0.7);const waiting=cards(B)[1];assert.equal(waiting,'MOVING DAY · STEP 2 OF 5 Lift it together You have your end. It lifts when Ada takes the other one.');
   T.kill(A);await T.play([B],34);const alone=cards(B)[1];assert.equal(alone,'MOVING DAY · STEP 2 OF 5 Lift it together Ada is not connected. The sofa needs both of you.');
   const A2=await T.reopen(A);A2.run(`lastInput[0]='key';${'function mvCard(i){const h=document.getElementById(\'half\'+i);const c=h.children.find(x=>x.className&&/^mv71c( |$)/.test(x.className));if(!c||!/ on( |$)/.test(c.className))return null;return String(c.innerHTML).replace(/<[^>]+>/g,\' \').replace(/\\s+/g,\' \').trim();}'}`);await T.play([A2,B],2);
   for(const P of [A2,B])P.run("sofa.g.position.set(-4.1,0,5.62);sofa.g.rotation.y=Math.PI/2;sofa.carrying=false;sofa.holder=[null,null];");    // set-up: the sofa stands in the veranda door, as in check/verify-pair-v71b.cjs
   const d=A2.J('[sofaEnd(0),sofaEnd(1)]');A2.run(`tp(0,${d[1][0]},${d[1][1]})`);B.run(`tp(1,${d[0][0]},${d[0][1]})`);await T.play([A2,B],1);
   assert.equal(A2.run('pressAct()'),'sofa');await T.play([A2,B],0.7);assert.equal(B.run('pressAct()'),'sofa');await T.play([A2,B],0.7);
   assert.deepEqual([cards(A2)[0],cards(B)[1]].map(c=>c&&c.slice(0,48)),['MOVING DAY · STEP 5 OF 5 Through the door, end f','MOVING DAY · STEP 5 OF 5 Through the door, end f'],'both phones on the same step');
   for(let k=0;k<90&&A2.run('S.sofa.state')!=='placed';k++)await T.play([A2,B],1/30,[[0,-1],[0,-1]]);await T.settle(400);
   const panels=[A2,B].map(P=>/Moving day: done\./.test(String(P.run('String(panel.innerHTML)'))));assert.deepEqual(panels,[true,true],'"It is in" says what was learned on both phones');
   A2.run("clickBtn('close')");B.run("clickBtn('close')");await T.play([A2,B],1);assert.deepEqual([cards(A2),cards(B)],[[null,null],[null,null]]);
   pass('Two phones: each phone shows only its own player’s card; waiting for the partner, and the partner not being connected, are said plainly; both phones reach the last step together and both say what was learned',{waiting,alone});}
  finally{T.reset();}});

 /* 8. Following only the card. */
 await step(8,'Following only the card',async()=>{const out={};
  // a newcomer: the one told to go first walks straight at the gold ring and stops on it; with two players the other walks behind, along the same path
  const follow=(two,secs)=>{const trail=[];let f=0;
   for(;f<secs*30&&J("S.sofa.state")!=='placed';f++){const [G,lead,P]=J("[moveinGoal71c(),MOVEIN71C.lead,players.map(p=>[p.g.position.x,p.g.position.z])]");const L=two?(lead===null?0:lead):0,F=1-L,v=[null,null];
    const toG=[G[0]-P[L][0],G[1]-P[L][1]];v[L]=Math.hypot(...toG)>0.15?toG:[0,0];
    if(two){trail.push(P[L]);let k=trail.length-1,acc=0;while(k>0&&acc<1.9){acc+=Math.hypot(trail[k][0]-trail[k-1][0],trail[k][1]-trail[k-1][1]);k--;}
     const aim=trail[k],toA=[aim[0]-P[F][0],aim[1]-P[F][1]];v[F]=Math.hypot(P[L][0]-P[F][0],P[L][1]-P[F][1])>1.7&&Math.hypot(...toA)>0.1?toA:[0,0];}
    run(`mvFrame(${JSON.stringify(v[0])},${JSON.stringify(v[1])})`);if(f%15===0)run('updateHUD()');}
   return f;};
  // standing on the ring moves the card on, though the sofa's centre, a metre behind, is not there yet
  local();settle();run("dispatch('hs',{i:0,id:'sofa'});dispatch('hs',{i:1,id:'sofa'});crate.position.x=-3.2;mvFrame();MOVEIN71C.tip=['Head for the gold ring.','Head for the gold ring.'];MOVEIN71C.tipAt=[MOVEIN71C.t,MOVEIN71C.t];");
  run("players[0].g.position.set(-1.75,0,-0.45);players[1].g.position.set(-0.2,0,0.6);mvFrame();");
  assert.equal(J('moveinRoute71c()'),'courtyard','the sofa is still in the courtyard');let c=J('mvHUD()');assert(/STEP 4 OF 5 Along the passage/.test(c[0]),'on the ring in front of the passage: '+c[0]);
  assert(!/Head for the gold ring/.test(c[0]+c[1]),'a tip about the last ring goes with it');
  assert.deepEqual(J('mvRings()').goal,[-1.75,5.3]);out.onTheRing=c[0].slice(0,60);
  run("players[0].g.position.set(4,0,4.0);players[1].g.position.set(4,0,5.9);mvFrame();");c=J('mvHUD()');assert(/STEP 3 OF 5 In through the gate/.test(c[0]),'carried back to the gate: '+c[0]);out.carriedBack=c[0].slice(0,60);
  // two players walking different ways: their own tip, not the wall's
  local();settle();run("dispatch('hs',{i:0,id:'sofa'});dispatch('hs',{i:1,id:'sofa'});MOVEIN71C.tipLast={};keys['a']=true;keys['arrowright']=true;");
  for(let k=0;k<120&&!J('MOVEIN71C.tip[0]');k++)run('mvFrame(inputVec(0),inputVec(1))');run("keys['a']=false;keys['arrowright']=false;");c=J('mvHUD()');
  assert(/You are walking different ways\. Walk the same way, one in front of the other\./.test(c[0])&&/You are walking different ways/.test(c[1]),c[0]);assert.equal(J('sofa.bump||0'),0,'no wall was touched');out.apart='You are walking different ways.';
  // a companion: walking at each ring in turn takes the sofa in
  companion();settle();run("players[0].g.position.set(sofaEnd(0)[0],0,sofaEnd(0)[1]);dispatch('hs',{i:0,id:'sofa'});");for(let k=0;k<400&&!J('!!sofa.carrying');k++)run('mvFrame()');
  const seen=[];run("var mvSeen=[];{const f=moveinFrame71c;moveinFrame71c=function(dt){f(dt);if(sofa.carrying){const s=moveinStep71c(0).id;if(mvSeen[mvSeen.length-1]!==s)mvSeen.push(s);}};}");
  let frames=follow(false,40);assert.equal(J("S.sofa.state"),'placed','with a companion, following only the rings: '+JSON.stringify(J('[sofa.g.position.x,sofa.g.position.z]')));
  assert.deepEqual(J('mvSeen'),['gate','courtyard','passage','door']);out.companion={seconds:+(frames/30).toFixed(1),bumps:J('sofa.bump||0')};
  // two players: the leader walks at the rings and the other behind: through the gate, end first
  local();settle();run("dispatch('hs',{i:0,id:'sofa'});dispatch('hs',{i:1,id:'sofa'});");
  frames=0;const trail=[];for(;frames<30*20&&J('moveinLeg71c()')==='gate';frames++){const [G,P]=J("[moveinGoal71c(),players.map(p=>[p.g.position.x,p.g.position.z])]");const toG=[G[0]-P[0][0],G[1]-P[0][1]];
   trail.push(P[0]);let k=trail.length-1,acc=0;while(k>0&&acc<1.9){acc+=Math.hypot(trail[k][0]-trail[k-1][0],trail[k][1]-trail[k-1][1]);k--;}const toA=[trail[k][0]-P[1][0],trail[k][1]-P[1][1]];
   run(`mvFrame(${JSON.stringify(Math.hypot(...toG)>0.15?toG:[0,0])},${JSON.stringify(Math.hypot(P[0][0]-P[1][0],P[0][1]-P[1][1])>1.7&&Math.hypot(...toA)>0.1?toA:[0,0])})`);}
  assert.equal(J('moveinLeg71c()'),'courtyard','two players through the gate: '+JSON.stringify(J('[sofa.g.position.x,sofa.g.position.z]')));assert(J('Math.max(sofaEnd(0)[1],sofaEnd(1)[1])')<5.78,'with the back end clear of the gate posts');
  out.twoPlayersThroughTheGate={seconds:+(frames/30).toFixed(1),bumps:J('sofa.bump||0')};
  pass('Following only the card: standing on a gold ring moves the card on (and a tip about the last ring goes) and carrying the sofa back undoes it; two players walking different ways are told so; with a companion, walking at each ring in turn takes the sofa in; two players, one walking at the rings and the other behind, take it through the gate end first',out);});

 const report={build,passed:failed===0,checks,method:'Actual game state in Node with shipped Three.js and the authored hero: the mission card as text, the rings as scene objects. Two phones on check/two-phones.cjs. Layout on phone screens is checked in check/bench-movein-v71c.cjs.'};
 fs.writeFileSync(path.join(__dirname,'results-movein-v71c.json'),JSON.stringify(report,null,2)+'\n');if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);fs.writeFileSync(path.join(__dirname,'results-movein-v71c.json'),JSON.stringify({build,passed:false,checks,failure:String(e&&e.stack||e)},null,2)+'\n');process.exitCode=1;});

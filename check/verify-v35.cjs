const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {load}=require('./runtime-harness.cjs');
(async()=>{
 const {run}=await load(),checks=[];
 const pass=name=>{checks.push({name,passed:true});console.log('PASS',name)};
 run("buildWorld();S=newState();S.phase='play';S.p[0].name='Chika';S.p[1].name='Obi';spawnPlayers();spawnNPCs();rebuildFurniture();buildProps();ensureMarket();save();");
 run('propDressWorld()');for(let i=0;i<12;i++)await new Promise(setImmediate);
 const before=run('JSON.stringify({p:S.p.map(p=>({name:p.name,skin:p.skin,basket:p.basket})),home:S.home,money:S.money,life:S.life})');
 run('benchState35();save();S=load()');assert.equal(run('JSON.stringify({p:S.p.map(p=>({name:p.name,skin:p.skin,basket:p.basket})),home:S.home,money:S.money,life:S.life})'),before);
 pass('Additive bench save preserves household, money, belongings and daily life');
 run('OBS.push({x1:3.8,x2:4.2,z1:6.4,z2:6.9});ACTIONS.benchStart35()');assert.equal(run('S.bench35.status'),'ready');run('OBS.pop()');
 run('ACTIONS.benchStart35();benchGrab35(0)');assert.equal(run('BENCH35.mode'),'ground');assert.equal(run('BENCH35.holders.filter(x=>x!==null).length'),1);
 run('benchGrab35(0)');assert.equal(run('BENCH35.holders.filter(x=>x!==null).length'),0);
 run('benchGrab35(0);benchGrab35(1)');assert.equal(run('BENCH35.mode'),'carry');
 run("keys.w=true;benchPlayer35(players[0],.05);keys.w=false;keys.arrowleft=true;benchPlayer35(players[1],.05);keys.arrowleft=false;");
 assert(run('Math.hypot(...BENCH35.move)>.9'));assert.equal(run('BENCH35.turn'),1);
 run('ACTIONS.benchPause35()');assert.equal(run('benchActive35()'),false);const clock=run('S.time');run('advanceClock33(.1)');assert(run('S.time')>clock);run('ACTIONS.benchResume35();benchGrab35(0);benchGrab35(1)');assert.equal(run('BENCH35.mode'),'carry');
 pass('Each player holds a distinct end; move and turn controls contribute independently');
 run('benchDrop35();ACTIONS.benchSwap35()');assert.equal(run('BENCH35.driver'),1);assert.equal(run('load().bench35.driver'),1);
 run('benchGrab35(0);benchGrab35(1);save();S=load();benchBuild35()');assert.equal(run('BENCH35.mode'),'ground');assert.equal(run('BENCH35.holders.filter(x=>x!==null).length'),0);assert.equal(run('BENCH35.driver'),1);
 pass('Safe drop, role swap and interrupted-carry reload release both players without losing the bench');
 run('benchGrab35(0);benchGrab35(1)');
 const pose=run('JSON.stringify(S.bench35.pose)');
 run('benchMove35(10,0,0)');assert(run('S.bench35.pose.x<4.6'));assert(run('benchClear35(S.bench35.pose,true)'));
 run('ACTIONS.benchReset35();benchGrab35(0);benchGrab35(1)');
 assert.equal(run('JSON.stringify(S.bench35.pose)'),pose);
 pass('Swept collision prevents wall tunnelling and reset restores a safe checkpoint');
 // Use the actual shipped controller against the actual compound collision world.
 function travel(x,z){let last='',stuck=0;for(let k=0;k<1600;k++){
   if(run("BENCH35.mode==='choose'"))return;
   const p=run('({...S.bench35.pose})'),dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<.025)return;
   run(`BENCH35.move=[${dx/d*Math.min(1,d/.056)},${dz/d*Math.min(1,d/.056)}];BENCH35.turn=0;benchTick35(.05,true)`);
   const now=run('JSON.stringify(S.bench35.pose)');stuck=now===last?stuck+1:0;last=now;
   if(stuck>2)throw Error('Route blocked to '+JSON.stringify([x,z])+' at '+now);
 }throw Error('Route timed out');}
 function rotate(yaw){for(let k=0;k<100;k++){const a=run('S.bench35.pose.yaw'),d=yaw-a;if(Math.abs(d)<.001)return;run(`BENCH35.move=[0,0];BENCH35.turn=${Math.sign(d)*Math.min(1,Math.abs(d)/.0475)};benchTick35(.05,true)`);}throw Error('Rotation blocked');}
 function delivery(){travel(4,4.4);travel(3.6,-1.35);rotate(0);travel(-.55,-1.35);travel(-.55,.05);travel(-3.65,.1);}
 delivery();assert.equal(run('BENCH35.mode'),'choose');assert.equal(run('S.bench35.step'),3);assert(run('BENCH_SPOTS35.every(p=>benchClear35(p,false))'));
 pass('Complete gate / generator / courtyard / veranda route is traversable with bench and both holders');
 run('OBS.push({x1:BENCH_SPOTS35[0].x-.5,x2:BENCH_SPOTS35[0].x+.5,z1:1,z2:1.5,tag:"test-blocker"})');run('benchVote35(0);benchVote35(1)');assert.equal(run('S.bench35.status'),'delivery');assert.equal(run('BENCH35.votes.some(Boolean)'),false);run('OBS.pop()');
 run('benchVote35(0);benchVote35(0)');assert.equal(run('S.bench35.status'),'delivery');assert.equal(run('BENCH35.votes[0]'),true);
 run('benchChoose35(1)');assert.equal(run('BENCH35.votes.some(Boolean)'),false);
 run('save();S=load();benchBuild35()');assert.equal(run('BENCH35.mode'),'choose');assert.equal(run('BENCH35.votes.some(Boolean)'),false);
 run('benchVote35(0);benchVote35(1)');assert.equal(run('S.bench35.status'),'placed');const memories=run('S.memories.length');
 run('benchVote35(0);benchVote35(1);save();S=load();benchBuild35()');assert.equal(run('S.memories.length'),memories);assert.equal(run('S.bench35.pose.x'),run('BENCH_SPOTS35[1].x'));
 pass('Placement needs two approvals, changing the proposal clears consent, and reload preserves the committed choice');
 run('benchSit35(0)');assert.equal(run('BENCH35.mode'),'seated');assert.equal(run('players.every(p=>p.g.sitting)'),true);
 run('players.forEach(p=>animAvatar(p.g,1,false,false,0,.016));save()');
 assert(run('players.every(p=>[p.g.position.x,p.g.position.y,p.g.position.z].every(Number.isFinite))'));
 assert(run('load().p.every((p,i)=>Math.hypot(p.pos[0]-SEATING30["p"+i].position.x,p.pos[1]-SEATING30["p"+i].position.z)<.001)'));
 run("doAct(0,{id:'benchStand35'})");assert.equal(run('SEATING30.active'),false);
 pass('Both existing rigs sit on the bench; saving seated characters retains safe standing resume positions');
 const money=run('S.money');
 for(let n=0;n<2;n++){
   run('ACTIONS.benchReplay35();benchGrab35(0);benchGrab35(1)');delivery();run('benchChoose35('+((n===0)?-1:2)+');benchVote35(0);benchVote35(1)');assert.equal(run('S.bench35.status'),'placed');
 }
 assert.equal(run('S.money'),money);assert.equal(run('S.memories.length'),memories);
 pass('Three complete deliveries succeed; replay cannot duplicate money, items or the first bench memory');
 run('benchBuild35();benchBuild35()');assert.equal(run("scene.children.filter(o=>o.name==='evening_gist35').length"),1);
 assert(run("(()=>{let ok=true;BENCH35.root.traverse(o=>{if(o.geometry)for(const n of o.geometry.attributes.position.array)if(!Number.isFinite(n))ok=false;});return ok;})()"));
 run('benchPanel35()');assert.equal(run('panel.innerHTML.includes("undefined")'),false);
 run('ACTIONS.benchReplay35();benchGrab35(0);benchGrab35(1);renderFrame=()=>{};keys.w=true;tick(performance.now()+50);keys.w=false;act[0]=true;tick(performance.now()+100)');assert.equal(run('BENCH35.mode'),'ground');
 pass('Rebuilding is idempotent; finite bench meshes and activity UI are available');
 const report={build:run('BUILD_ID'),passed:true,checks,method:'Shipped Three.js runtime, full compound collisions, keyboard input roles, saves, seating and three controlled deliveries in Node. Cloud preview cannot create WebGL; no rendered or human playtest claim.'};
 fs.writeFileSync(path.join(__dirname,'results-v35.json'),JSON.stringify(report,null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1;});

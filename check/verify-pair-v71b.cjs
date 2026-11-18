// v71b "Pair": two phones stay one household. Every wrap in dist/src/pair-v71b.js, checked on two (sometimes three)
// copies of the real game joined through the real room code (check/two-phones.cjs: what is real and what is a
// stand-in is written at the top of that file). Each check plays what a person does, then compares what the two
// phones hold. They are written so the build before v71b fails them: that build's results are in
// docs/TWO_PHONES_V71B.md.
// Nothing here is a phone test: no browser, no real network, no public PeerJS service.
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const T=require('./two-phones.cjs');const {W}=T;
const checks=[];let build=null;const live=[];
const pass=(n,info)=>{checks.push({name:n,passed:true,info});console.log('PASS',n,info?JSON.stringify(info):'');};
const phone=async(label,o)=>{const P=await T.makePhone(label,o);live.push(P);if(!build)build=P.run('BUILD_ID');return P;};
const fresh=()=>{live.splice(0).forEach(P=>{if(!P.dead)T.kill(P);});T.reset();};
const two=async o=>{fresh();const A=await phone('A'),B=await phone('B');const code=await T.pair(A,B,o);return {A,B,code};};
const ra=P=>P.J('[S.rev||0,S.aseq||0]');
const buy=(P,k)=>P.run(`dispatch('buy',{i:NET.myIndex,k:'${k}',st:'s1',price:S.mkt.items.${k}.price})`);
const inv=P=>P.J("({items:S.home.items.map(i=>i.type+'@'+i.x+','+i.y).sort(),storage:S.home.storage.slice().sort(),hands:ghosts.map(x=>x?x.type:null)})");
const pieces=P=>P.J("S.home.items.map(i=>i.type).concat(S.home.storage).sort()");
const net=P=>P.J("({on:NET.on,me:NET.myIndex,host:NET.isHost,other:NET.otherOnline,role:TOGETHER47.room&&TOGETHER47.room.role})");
const told=P=>P.J('TOASTS').filter(t=>/did not reach/.test(t)).length;
// put down what player i carries on the first cell it fits, walking the player there
const placeHeld=async(P,i,all)=>{let ok=false;for(const [x,z,fx,fz] of [[-5.2,4.0,0,-1],[-4.6,3.4,0,-1],[-5.8,3.0,1,0],[-4.0,4.2,0,-1],[-6.0,2.4,1,0],[-3.4,3.0,0,-1],[-5.0,2.2,0,1],[-4.4,2.0,1,0]]){P.run(`tp(${i},${x},${z});players[${i}].face=[${fx},${fz}];updateGhost(${i});`);if(P.run(`!!(ghosts[${i}]&&ghosts[${i}].ok)`)){ok=true;break;}}
 assert(ok,'a cell that fits');P.run(`placeGhost(${i})`);await T.play(all,1.5);};
const owned=(P,type)=>P.J(`S.home.items.filter(i=>i.type==='${type}').length+S.home.storage.filter(t=>t==='${type}').length+ghosts.filter(g=>g&&g.type==='${type}').length`);
const noErrors=()=>assert.deepEqual(W.errors,[],'errors: '+JSON.stringify(W.errors.slice(0,3)));
// every check runs even when an earlier one fails, so a build that fails shows which ones
let failed=0;const step=async(n,what,fn)=>{try{await fn();}catch(e){failed++;const why=String(e&&e.message||e).split('\n')[0].slice(0,200);checks.push({name:'Check '+n+' failed: '+what,passed:false,failure:why});console.log('FAIL',n,what,'|',why);}};
(async()=>{
 /* 1. Joining in the usual order: the host is ready and showing the code before the guest joins. */
 await step(1,'Joining in the usual order: the host is ready and showing the code before the guest joins',async()=>{fresh();const A=await phone('A'),B=await phone('B');const code=await T.pair(A,B,{lobbyOnly:true});
  const g0=B.J("({step:S.setup&&S.setup.step,hair:S.p[1].hair})");assert.equal(g0.step,'p1','the guest still has its character screen after joining');
  B.run("dispatch('setp',{i:1,k:'hair',v:'afro'})");                                   // a choice on the character screen
  A.run("writeState()");await T.settle(400);                                           // the host's household arrives while the guest is choosing
  const g1=B.J("({step:S.setup&&S.setup.step,hair:S.p[1].hair})");assert.deepEqual(g1,{step:'p1',hair:'afro'},'the choice and the screen survive the host’s household');
  B.run("dispatch('setp',{i:1,k:'outfit',v:'kaftan'})");B.run("S.p[1].name='Bola'");assert.equal(B.run("clickBtn('netready')"),'ok');await T.settle(400);
  assert.deepEqual(A.J("[S.p[1].name,S.p[1].hair,S.p[1].outfit]"),['Bola','afro','kaftan'],'the host sees what the guest chose');
  assert.equal(B.run("clickBtn('netmovein')"),'ok');await T.settle(500);A.run("clickBtn('close')");B.run("clickBtn('close')");await T.play([A,B],1);
  const at0=[ra(A),ra(B)];assert.equal(at0[0][1],at0[1][1],'both phones count the same actions at move-in');
  A.run("S.flags.pairProbe=1;NET.dirty=true;");await T.play([A,B],3);                    // something only the host's household can bring
  assert.equal(B.J('S.flags.pairProbe'),1,'the guest takes the host’s household from the start');assert(T.same(A,B));noErrors();
  pass('A normal join: the guest’s character screen survives the host’s household, its choices reach the host, and after moving in the guest takes the host’s household',{guestStepAfterJoin:g0.step,guestChoiceKept:g1.hair,hostSees:A.J("[S.p[1].hair,S.p[1].outfit]"),revAndCountAtMoveIn:at0,code:code.replace(/[a-z0-9]{4}$/,'****')});});

 /* 2. Presses that are never sent (closing panels, opening Tasks) do not make the guest refuse the host. */
 await step(2,'Presses that are never sent (closing panels, opening Tasks) do not make the guest refuse the host',async()=>{const {A,B}=await two();
  for(let k=0;k<4;k++){B.run("dispatch('tasksbtn')");B.run("dispatch('close')");}
  const before=[ra(A),ra(B)];A.run("S.flags.pairProbe=2;NET.dirty=true;");await T.play([A,B],3);
  assert.equal(B.J('S.flags.pairProbe'),2);assert.equal(ra(A)[1],ra(B)[1]);
  B.run("dispatch('quality')");await T.settle(300);                                      // a setting of this phone only
  const sent=W.wire.map(w=>w.name);for(const n of ['quality','tasksbtn','close','netlobby'])assert(!sent.includes(n),n+' was sent to the other phone');
  assert.equal(A.storage.has('cd3-quality'),false,'the partner’s graphics setting is untouched');noErrors();
  pass('Eight presses that are never sent leave the guest in step: the host’s next household is taken; the graphics-quality press stays on its own phone',{countBefore:before.map(x=>x[1]),countAfter:[ra(A)[1],ra(B)[1]]});});

 /* 3. An action sent while the link was down never arrives: the guest catches up and is told. */
 await step(3,'A dropped link: what was sent waits and arrives; lost only when the connection dies, and then the guest is told',async()=>{const out={};
  {const {A,B}=await two();T.cut(B,true);buy(B,'tomato');buy(A,'pepper');await T.play([A,B],8);T.cut(B,false);await T.play([A,B],6);       // a short drop
   const s=T.shared(A);assert(T.same(A,B));assert.deepEqual([s.baskets[0].pepper,s.baskets[1].tomato],[1,1],'both purchases arrive');
   assert.equal(told(B),0,'nobody is told anything was lost');out.shortDrop=s.baskets;}
  {const {A,B}=await two();T.cut(B,true);await T.play([A,B],3);buy(B,'tomato');await T.play([A,B],42);T.cut(B,false);await T.play([A,B],25);   // 45 s, only the guest acts
   const s=T.shared(A);assert(T.same(A,B),'one household');assert.equal(s.baskets[1].tomato,1,'what the guest did alone is kept: the host did nothing meanwhile');assert.equal(told(B),0);out.longDropGuestOnly=s.baskets;}
  {const {A,B}=await two();T.cut(B,true);await T.play([A,B],3);buy(B,'tomato');buy(A,'pepper');await T.play([A,B],42);T.cut(B,false);await T.play([A,B],25);   // 45 s, both act
   const s=T.shared(A);assert(T.same(A,B),'one household');assert.deepEqual([s.baskets[0].pepper||0,s.baskets[1].tomato||0],[1,0],'the host\u2019s purchase stands; the guest\u2019s did not reach it');
   assert.equal(told(B),1,'and the guest is told');out.longDropBoth=s.baskets;}
  noErrors();
  pass('A dropped link: after eight seconds what both did arrives and nobody is told anything was lost; after 45 seconds (the connection dies) the guest\u2019s purchase is kept when the host did nothing meanwhile, and when both acted the host\u2019s stands and the guest is told',out);});

 /* 4. Both spend at the same instant with money for one. */
 await step(4,'Both spend at the same instant with money for one',async()=>{const {A,B}=await two();A.run("S.money=S.mkt.items.tomato.price;NET.dirty=true;");await T.play([A,B],2);assert.equal(T.shared(B).money,T.shared(A).money);
  buy(A,'tomato');buy(B,'tomato');const shown=[T.shared(A).baskets,T.shared(B).baskets];await T.play([A,B],3);
  const s=T.shared(A);assert(T.same(A,B));assert.equal(s.money,0);assert.equal((s.baskets[0].tomato||0)+(s.baskets[1].tomato||0),1,'one tomato for one payment');noErrors();
  pass('Two purchases in the same instant with money for one: the purse is charged once and three seconds later both phones show the same single purchase',{eachPhoneFirstShowed:shown,bothNow:s.baskets});});

 /* 5. Carrying furniture with Build: no copy left in the partner's hands, no duplicate, in either direction. */
 await step(5,"Carrying furniture with Build: no copy left in the partner's hands, no duplicate, in either direction",async()=>{const {A,B}=await two();A.run("tp(0,-6.4,4.2)");B.run("tp(1,-5.2,4.0);players[1].face=[0,-1]");await T.play([A,B],1);const start=pieces(A);
  const place=async(P,i)=>{let ok=false;for(const [x,z,fx,fz] of [[-5.2,4.0,0,-1],[-4.6,3.4,0,-1],[-5.8,3.0,1,0],[-4.0,4.2,0,-1],[-6.0,2.4,1,0],[-3.4,3.0,0,-1],[-5.0,2.2,0,1],[-4.4,2.0,1,0]]){P.run(`tp(${i},${x},${z});players[${i}].face=[${fx},${fz}];updateGhost(${i});`);if(P.run(`!!(ghosts[${i}]&&ghosts[${i}].ok)`)){ok=true;break;}}
   assert(ok,'a cell that fits');P.run(`placeGhost(${i})`);await T.play([A,B],1.5);};
  const lift=async(P,i,type)=>{P.run(`dispatch('pickup',{id:S.home.items.find(q=>q.type==='${type}').id,i:${i}})`);await T.play([A,B],1);};
  await lift(B,1,'table');assert.deepEqual(inv(A).hands,[null,'table'],'the host sees the guest carrying it');await place(B,1);
  assert.deepEqual(inv(A).hands,[null,null],'placed: nothing left in the guest’s hands on the host’s phone');
  await lift(B,1,'fan');assert.deepEqual(inv(A).storage,[],'no free table appears in storage');await place(B,1);
  await lift(A,0,'table');await place(A,0);assert.deepEqual(inv(B).hands,[null,null],'and the same when the host carries');
  await lift(A,0,'fan');await place(A,0);await T.play([A,B],2);
  assert.deepEqual(pieces(A),start);assert.deepEqual(pieces(B),start);assert.deepEqual(inv(A),inv(B));noErrors();
  pass('Four carries with Build, two by each player: no piece is left in the partner’s hands, none is duplicated, and both phones hold the same flat',{pieces:start.length,storageAfter:inv(A).storage,handsAfter:[inv(A).hands,inv(B).hands]});});

 /* 6. Two pieces put on the same cell at the same instant: one stands, the other is in storage; nothing vanishes. */
 await step(6,'Two pieces put on the same cell at the same instant: one stands, the other is in storage; nothing vanishes',async()=>{const {A,B}=await two();A.run("S.home.storage=['lamp','plant'];NET.dirty=true;");await T.play([A,B],2);assert.deepEqual(inv(B).storage,['lamp','plant']);
  A.run("dispatch('ghoststore',{i:0,ix:0})");await T.settle(300);B.run("dispatch('ghoststore',{i:1,ix:0})");await T.settle(300);
  const c=A.J("cellToWorld(3,1)");A.run(`tp(0,${c[0]-0.95},${c[1]});players[0].face=[1,0];updateGhost(0);`);B.run(`tp(1,${c[0]+0.95},${c[1]});players[1].face=[-1,0];updateGhost(1);`);
  assert.deepEqual([A.J('ghosts[0].ok&&ghosts[0].cell'),B.J('ghosts[1].ok&&ghosts[1].cell')],[[3,1],[3,1]],'both aim at the same free cell');
  A.run('placeGhost(0)');B.run('placeGhost(1)');await T.play([A,B],3);
  const a=inv(A);assert.deepEqual(a,inv(B));assert(a.items.includes('lamp@3,1'),'the host’s piece stands');assert.deepEqual(a.storage,['plant'],'the other piece is in storage, not lost');assert.deepEqual(a.hands,[null,null]);noErrors();
  pass('Two different pieces put on one cell in the same instant: the host’s stands, the other is back in storage on both phones, and nothing is lost',{storage:a.storage,hands:a.hands});});

 /* 7. Both press the one night button. */
 await step(7,'Both press the one night button',async()=>{const {A,B}=await two();B.run("dispatch('sleep')");await T.settle(300);
  assert.deepEqual([A.J("panelButtons().map(b=>b.act)"),B.J("panelButtons().map(b=>b.act)")],[['nextday'],['nextday']],'the same single button on both phones');
  assert.equal(A.run("clickBtn('nextday')"),'ok');assert.equal(B.run("clickBtn('nextday')"),'ok');await T.play([A,B],3);
  assert.deepEqual([T.shared(A).day,T.shared(B).day],[2,2],'one night, one day');assert(T.same(A,B),'the same market on both phones');
  assert.deepEqual([A.run('overlayOpen()'),B.run('overlayOpen()')],[true,true],'the partner\u2019s press for the same night does not close the morning page');noErrors();
  pass('Both players press the night panel’s only button in the same instant: one day passes, both phones wake to the same market and both keep their morning page',{day:[T.shared(A).day,T.shared(B).day],market:[T.shared(A).mkt,T.shared(B).mkt]});});

 /* 8. The sofa goes in once, on both phones, and is written while the host's panel is still open. */
 const lift=async(A,B,hostEnd)=>{const e=A.J('[sofaEnd(0),sofaEnd(1)]'),h=hostEnd||0;A.run(`tp(0,${e[h][0]},${e[h][1]})`);B.run(`tp(1,${e[1-h][0]},${e[1-h][1]})`);await T.play([A,B],1);
  assert.equal(A.run('pressAct()'),'sofa');await T.play([A,B],0.7);assert.equal(B.run('pressAct()'),'sofa');await T.play([A,B],0.7);
  assert.deepEqual([A.J('!!sofa.carrying'),B.J('!!sofa.carrying')],[true,true],'lifted on both phones');};
 await step(8,"The sofa goes in once, on both phones, and is written while the host's panel is still open",async()=>{const {A,B}=await two();
  for(const P of [A,B])P.run("sofa.g.position.set(-4.1,0,5.62);sofa.g.rotation.y=Math.PI/2;");     // set-up: the sofa stands lengthways in the veranda door
  await lift(A,B,1);                                                                               // the host takes the end inside the flat
  let when=null;for(let k=0;k<90&&when===null;k++){await T.play([A,B],1/30,[[0,-1],[0,-1]]);if(A.run('S.sofa.state')==='placed')when=k;}
  assert(when!==null,'the host’s phone sees the sofa in');await T.settle(300);
  const s=P=>P.J("({state:S.sofa.state,sofas:S.home.items.filter(i=>i.type==='sofa').length,words:S.flags.sofaCaption,panel:overlayOpen()&&/It is in/.test(String(panel.innerHTML)),carrying:!!sofa.carrying})");
  assert.deepEqual(s(A),s(B));assert.deepEqual([s(A).state,s(A).sofas,s(A).panel],['placed',1,true]);
  await T.settle(1500);const stored=P=>JSON.parse(P.storage.get('cd3-online-'+P.run('NET.code'))).docs['households/'+P.run('NET.code')].sofa.state;
  const kept=[A.J("TOGETHER47.room.store.docs['households/'+NET.code].sofa.state"),B.J("TOGETHER47.room.store.docs['households/'+NET.code].sofa.state")];
  assert.deepEqual(kept,['placed','placed'],'written with both panels still open');await T.settle(2000);assert.deepEqual([stored(A),stored(B)],['placed','placed'],'and in each phone’s stored copy');noErrors();
  pass('The sofa is carried through the door: it is placed once, at the same moment and with the same words on both phones, and the household is written while the “It is in” panel is still open',{framesToTheDoor:when,both:s(A),documentWhilePanelOpen:kept});});

 /* 9. A partner whose page reloads mid-carry: the sofa is set down, and the reloaded phone finds it where it is. */
 await step(9,'A partner whose page reloads mid-carry: the sofa is set down, and the reloaded phone finds it where it is',async()=>{let {A,B}=await two();await lift(A,B);await T.play([A,B],1.2,[[0,-1],[0,-1]]);const moved=A.J('[sofa.g.position.x,sofa.g.position.z]');
  T.kill(B);await T.play([A],11);                                                         // the partner's page goes; the host carries on and writes
  assert.equal(A.J('!!sofa.carrying'),false,'set down');assert(A.J('TOASTS').some(t=>/not connected, so the sofa is set down/.test(t)),'and the player is told why');
  const stick=A.J('[players[0].g.position.x,players[0].g.position.z]');await T.play([A],1,[[-1,0]]);const free=Math.hypot(A.J('players[0].g.position.x')-stick[0],A.J('players[0].g.position.z')-stick[1]);
  assert(free>1.5,'the remaining player walks freely: '+free);
  B=await T.reopen(B);live.push(B);await T.play([A,B],2);
  const pa=A.J('[sofa.g.position.x,sofa.g.position.z]'),pb=B.J('[sofa.g.position.x,sofa.g.position.z]'),gap=Math.hypot(pa[0]-pb[0],pa[1]-pb[1]);
  assert(gap<0.05,'the sofa is in one place: '+gap);assert(Math.hypot(pa[0]-4,pa[1]-8.6)>0.5,'and not back at the gate');
  await lift(A,B);await T.play([A,B],1,[[0,-1],[0,-1]]);const pa2=A.J('[sofa.g.position.x,sofa.g.position.z]'),pb2=B.J('[sofa.g.position.x,sofa.g.position.z]');
  assert(Math.hypot(pa2[0]-pb2[0],pa2[1]-pb2[1])<0.3,'and it is carried on from there by both');noErrors();
  pass('The partner’s page reloads in the middle of the carry: the sofa is set down with a message, the remaining player walks freely, and the reloaded phone finds the sofa where it was left and lifts it again',{movedFromTheGate:+Math.hypot(moved[0]-4,moved[1]-8.6).toFixed(2),apartAfterReload:+gap.toFixed(3),walkedFreely:+free.toFixed(2)});});

 /* 10. Closing both pages and reopening: everyone is where they were. */
 await step(10,'Closing both pages and reopening: everyone is where they were',async()=>{let {A,B}=await two();A.run('tp(0,-6.4,4.2)');B.run('tp(1,15.5,-2.1)');await T.play([A,B],11);const was=A.J('players.map(p=>[+p.g.position.x.toFixed(1),+p.g.position.z.toFixed(1)])');
  T.kill(A);T.kill(B);await T.settle(500);B=await T.reopen(B);live.push(B);A=await T.reopen(A);live.push(A);await T.play([A,B],2);
  const now=[A,B].map(P=>P.J('players.map(p=>[+p.g.position.x.toFixed(1),+p.g.position.z.toFixed(1)])'));
  assert.deepEqual(now[0],was);assert.deepEqual(now[1],was);assert.deepEqual([net(A).me,net(B).me],[0,1]);assert(T.same(A,B));noErrors();
  pass('Both pages close and reopen (the guest first): both players stand where they were, one in the flat and one on Market Road, not at the gate',{stood:was,standNow:now[0]});});

 /* 11. The phone holding the meeting point sleeps past the takeover and wakes. */
 await step(11,'The phone holding the meeting point sleeps past the takeover and wakes',async()=>{const {A,B}=await two();T.sleep(A);await T.play([B],60);T.serverDrops(A);await T.play([B],25);
  assert.deepEqual([net(B).role,net(B).host,net(B).other],['hub',true,false],'the other phone took the meeting point and plays alone');buy(B,'tomato');await T.play([B],10);
  T.wake(A);await T.play([A,B],25);
  assert.deepEqual([net(A).role,net(B).role],['guest','hub'],'the phone that slept joined the one that stayed');assert.deepEqual([net(A).other,net(B).other],[true,true]);
  assert(T.same(A,B),'one household');assert.equal(T.shared(A).baskets[1].tomato,1,'with what was done while it slept');
  B.run('tp(1,9.5,8.6)');await T.play([A,B],2);const seen=A.J('[players[1].g.position.x,players[1].g.position.z]');
  assert(Math.hypot(seen[0]-9.5,seen[1]-8.6)<0.3,'the woken phone sees its partner move: '+seen);assert.equal(A.J('TOGETHER47.room.pres.size'),1,'and knows of one other phone');
  const tries=W.log.filter(l=>l==='A ID-TAKEN compound-days-v47-'+A.run('NET.code')).length;assert(tries<=2,'it does not keep asking for its old place: '+tries);noErrors();
  pass('The phone that held the meeting point sleeps for a minute and a half and wakes: it joins the phone that took over, both see each other, and they hold one household',{roles:[net(A).role,net(B).role],askedForItsOldPlace:tries});});

 /* 12. Seats: a third device is turned away; a starter who comes back by code alone gets their own seat. */
 await step(12,'Seats: a third device is turned away; a starter who comes back by code alone gets their own seat',async()=>{const {A,B,code}=await two();const C=await phone('C');await T.join(C,code);
  const c=C.J("({on:NET.on,panel:String(panel.innerHTML).replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim().slice(0,150)})");
  assert.equal(c.on,false);assert(/already has two phones playing/.test(c.panel),c.panel);assert.equal(C.storage.has('cd3-online-'+code),false,'it keeps no copy of the household');assert.equal(C.storage.has('cd3-net'),false);
  await T.play([A,B],2);assert.deepEqual([net(A).other,net(B).other,A.J('TOGETHER47.room.conns.size')],[true,true,1]);assert(T.same(A,B));
  T.kill(A);await T.play([B],6);const A2=await phone('A');await T.join(A2,code);await T.play([A2,B],2);                 // the starter's phone, storage cleared, typing the code
  assert.deepEqual([net(A2).me,net(B).me],[0,1],'the starter is Player 1 again');assert.equal(A2.run('S.phase'),'play');assert(T.same(A2,B));noErrors();
  pass('A third device typing the code while two phones play is turned away and keeps nothing; the starter’s phone, with its storage cleared, joins by code and gets Player 1’s seat back',{thirdDeviceSees:c.panel.slice(0,74),seatsAfterTheStarterReturns:[net(A2).me,net(B).me]});});

 /* 13. Leaving from the Menu; a new household is never started inside the room. */
 await step(13,'Leaving from the Menu; a new household is never started inside the room',async()=>{let {A,B,code}=await two();buy(A,'tomato');await T.play([A,B],2);const before=T.shared(B);
  A.run("dispatch('newconfirm')");const asked=A.J("({leave:/Leave this household/.test(String(panel.innerHTML)),buttons:panelButtons().map(b=>b.act)})");assert.deepEqual(asked,{leave:true,buttons:['pairleave71b','close']});
  A.run("dispatch('newgame')");assert.deepEqual(A.J('S.p.map(p=>p.name)'),before.names,'no new household replaced it');
  assert.equal(A.run("clickBtn('pairleave71b')"),'ok');assert.deepEqual([A.run('NET.on'),A.run('S'),A.context.__reloads],[false,null,1]);
  const copy=JSON.parse(A.storage.get('cd3-online-'+code)).docs['households/'+code];assert.deepEqual([copy.p.map(p=>p.name),copy.money],[before.names,before.money],'its copy is the household as it was');
  T.kill(A);await T.play([B],120);assert.deepEqual(T.shared(B),before,'two minutes on, the partner’s household is untouched');
  A=await T.reopen(A);live.push(A);await T.play([A,B],2);assert(T.same(A,B));assert.deepEqual([net(A).me,net(B).me],[0,1]);noErrors();
  pass('“Start a new household” in the two-phone Menu offers to leave: the household stays as it was on both phones, the partner plays on, and Continue together brings the leaver back',{asked:asked.buttons,partnerUntouchedAfter:'120 s'});});

 /* 14. Album pictures come back; a picture that is not an image is not drawn. */
 await step(14,'Album pictures come back; a picture that is not an image is not drawn',async()=>{let {A,B,code}=await two();
  for(const P of [A,B])P.run("snapshot=function(){return 'data:image/jpeg;base64,'+'A'.repeat(400);};");    // stand-in camera: there is no renderer here
  A.run("dispatch('hudphoto',{caption:'Host photo'})");await T.play([A,B],1.5);B.run("dispatch('hudphoto',{caption:'Guest photo'})");await T.play([A,B],11);
  T.kill(A);T.kill(B);await T.settle(500);A=await T.reopen(A);live.push(A);B=await T.reopen(B);live.push(B);await T.play([A,B],2);
  const pics=P=>P.J("S.memories.filter(m=>m.pid).map(m=>m.caption+':'+(m.img?'picture':'none'))");const beforeOpen=[pics(A),pics(B)];
  A.run("dispatch('albumbtn')");B.run("dispatch('albumbtn')");await T.settle(600);
  const want=['Host photo:picture','Guest photo:picture'];assert.deepEqual(pics(A),want);assert.deepEqual(pics(B),want);
  assert.equal(B.J("(String(panel.innerHTML).match(/<img /g)||[]).length"),2,'both pictures are drawn in the album');
  B.run("S.memories[S.memories.length-1].img='x\" onerror=\"alert(1)';openAlbum();");assert.equal(B.J("/onerror/.test(String(panel.innerHTML))"),false,'a picture that is not an image is dropped');noErrors();
  pass('After both phones reopen, opening the album brings both players’ pictures back on both phones; a picture that is not an image data address is not drawn',{hooksPerFrame:A.J('TICK_HOOKS.length'),picturesBeforeOpeningTheAlbum:beforeOpen,picturesAfter:want});});


 /* 15. One player sits on the sofa: the other is not seated and walks on. */
 await step(15,'One player sits on the sofa: the other is not seated and walks on',async()=>{const {A,B}=await two();
  A.run("S.sofa.state='placed';placeAuto('sofa');rebuildFurniture();if(sofa)sofa.g.visible=false;NET.dirty=true;");await T.play([A,B],2);      // set-up: the sofa is in the flat
  const sp=A.J('sofaPos()');assert(sp&&B.J('!!sofaPos()'),'both phones have the sofa in the flat');A.run(`tp(0,${sp[0]-0.5},${sp[1]+0.6})`);B.run(`tp(1,${sp[0]+0.5},${sp[1]+0.6})`);await T.play([A,B],1);
  A.run("dispatch('hs',{i:0,id:'sit'})");await T.settle(300);
  const a=A.J("({panel:overlayOpen()&&/The sofa/.test(String(panel.innerHTML)),sitting:!!players[0].g.sitting})"),b=B.J("({panel:overlayOpen(),seated:!!players[1].g.sitting,seating:!!SEATING30.active})");
  assert.deepEqual(a,{panel:true,sitting:true},'the player who sat is seated with the sofa panel');assert.deepEqual(b,{panel:false,seated:false,seating:false},'the partner is not seated');
  const from=B.J('[players[1].g.position.x,players[1].g.position.z]');await T.play([A,B],1,[[0,0],[0,1]]);const to=B.J('[players[1].g.position.x,players[1].g.position.z]'),walked=Math.hypot(to[0]-from[0],to[1]-from[1]);
  assert(walked>0.5,'the partner walks: '+walked);assert.equal(A.run("clickBtn('close')"),'ok');await T.play([A,B],1);assert.equal(A.J('!!players[0].g.sitting'),false);noErrors();
  pass('One player sits on the sofa: only that player is seated, and the partner, with no panel, walks on',{sitter:a,partner:b,partnerWalked:+walked.toFixed(2)});});

 /* 16. What is in the hands is part of the household. */
 await step(16,'What is in the hands is part of the household',async()=>{const out={};
  {let {A,B}=await two();A.run("tp(0,-6.4,4.2)");B.run("tp(1,-5.2,4.0)");await T.play([A,B],1);                       // the guest reloads while carrying
   B.run("dispatch('pickup',{id:S.home.items.find(q=>q.type==='table').id,i:1})");await T.play([A,B],2);B=await T.reopen(B);live.push(B);await T.play([A,B],3);
   assert.deepEqual([inv(A).hands,inv(B).hands],[[null,'table'],[null,'table']],'after the reload the table is still in the guest\u2019s hands, on both phones');
   B.run("tp(1,-5.2,4.0)");await placeHeld(B,1,[A,B]);await T.play([A,B],2);assert.deepEqual([owned(A,'table'),owned(B,'table')],[1,1]);out.reloadWhileCarrying='still in the hands';}
  {const {A,B}=await two();A.run("tp(0,-6.4,4.2)");B.run("tp(1,-5.2,4.0)");await T.play([A,B],1);                     // both take the same piece in the same instant
   const id=A.run("S.home.items.find(q=>q.type==='stove').id");A.run(`dispatch('pickup',{id:'${id}',i:0})`);B.run(`dispatch('pickup',{id:'${id}',i:1})`);await T.play([A,B],3);
   assert.deepEqual([inv(A).hands,inv(B).hands],[['stove',null],['stove',null]],'the host\u2019s player has it on both phones');assert(B.J('TOASTS').some(t=>/^Ada took the .+ first\.$/.test(t)),'and the guest is told');
   await placeHeld(A,0,[A,B]);await T.play([A,B],2);assert.deepEqual([owned(A,'stove'),owned(B,'stove')],[1,1],'no second stove');out.sameInstant='the host\u2019s player holds it; the guest is told';}
  {let {A,B}=await two();A.run("tp(0,-6.4,4.2)");await T.play([A,B],1);                                               // the host leaves from the Menu while carrying
   A.run("dispatch('pickup',{id:S.home.items.find(q=>q.type==='fan').id,i:0})");await T.play([A,B],1);A.run("dispatch('newconfirm')");A.run("clickBtn('pairleave71b')");await T.play([B],3);
   A=await T.reopen(A);live.push(A);await T.play([A,B],3);assert.deepEqual([inv(A).hands,inv(B).hands],[['fan',null],['fan',null]],'back with Continue together, the fan is still in the hands');
   A.run("tp(0,-6.4,4.2)");await placeHeld(A,0,[A,B]);assert.deepEqual([owned(A,'fan'),owned(B,'fan')],[1,1]);out.leaveWhileCarrying='still in the hands';}
  {const {A,B}=await two();B.run("tp(1,-5.2,4.0)");await T.play([A,B],1);B.run("dispatch('pickup',{id:S.home.items.find(q=>q.type==='table').id,i:1})");await T.play([A,B],2);   // a placement lost with the connection
   T.cut(B,true);await T.play([A,B],2);await placeHeld(B,1,[A,B]);buy(A,'pepper');await T.play([A,B],40);T.cut(B,false);await T.play([A,B],25);
   assert(T.same(A,B));assert.deepEqual([inv(A).hands,inv(B).hands],[[null,'table'],[null,'table']],'the table is back in the guest\u2019s hands');assert.equal(told(B),1);
   await placeHeld(B,1,[A,B]);await T.play([A,B],2);assert.deepEqual([owned(A,'table'),owned(B,'table')],[1,1]);out.lostPlacement='back in the hands, the guest told';}
  noErrors();pass('What is in each player\u2019s hands is part of the household: a reload, leaving from the Menu, two players taking one piece and a placement lost with the connection neither lose nor duplicate a piece',out);});

 /* 17. A device that is turned away keeps the household it had. */
 await step(17,'A device that is turned away keeps the household it had',async()=>{const {A,B,code}=await two();const C=await phone('C');
  C.run("NET.on=false;dispatch('newgame');S.p[0].name='Cee';S.p[1].name='Dee';dispatch('setupstep',{v:'p0'});dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();S.money=4321;save();");await T.settle(200);C.run("S=null;openTitle();");
  const mine=()=>JSON.stringify([...C.storage.entries()].filter(([k])=>!/^cd3-(net|online|quality|shadows)/.test(k)).sort());const before=mine();
  C.run("var worldN=0;{const e=enterWorld;enterWorld=function(){worldN++;return e.apply(this,arguments);};}");const aBefore=A.J('[S.money,S.aseq||0]');
  await T.join(C,code);assert.equal(C.run('NET.on'),false);assert.equal(C.run('S'),null,'nothing of the refused household is held');assert.equal(mine(),before);
  C.run("dispatch('netjoin')");await T.settle(300);assert.equal(mine(),before,'untouched after Try again');
  C.run("dispatch('title')");await T.settle(300);assert.equal(mine(),before,'its own saved household is untouched after Back');
  assert.equal(C.run('worldN'),0,'the refused household\u2019s world was never shown');assert.equal(told(C),0);
  assert.deepEqual([A.J('[S.money,S.aseq||0]'),B.J('[S.money,S.aseq||0]')],[aBefore,aBefore],'nothing from the refused device reached the household');noErrors();
  pass('A third device turned away from a household keeps nothing of it and never shows its world; its own saved household is untouched after Try again and Back',{});});

 /* 18. Each phone's Bigger text and its player's walking speed. */
 await step(18,'Each phone\u2019s Bigger text and its player\u2019s walking speed',async()=>{const {A,B}=await two();
  A.run("var menuN=0;{const m=openMenu;openMenu=function(){menuN++;return m.apply(this,arguments);};}");
  B.run("dispatch('aspeed',{i:1,v:0.8})");B.run("dispatch('bigtext')");B.run("closePanel()");await T.play([A,B],2);A.run("NET.dirty=true;S.flags.pairProbe=18;");await T.play([A,B],3);
  assert.equal(B.J('S.flags.pairProbe'),18,'the host\u2019s household has arrived');
  assert.deepEqual(B.J('[assist(1).speed,!!S.bigtext,document.body.classList.contains("bigtext")]'),[0.8,true,true],'the guest keeps its walking speed and Bigger text');
  assert.deepEqual(A.J('[assist(1).speed,!!S.bigtext]'),[0.8,false],'the host sees the guest\u2019s player walk slower and keeps its own text size');
  assert.equal(A.run('menuN'),0,'the replay on the host only sets the speed: it draws no Menu there');noErrors();
  pass('The guest\u2019s walking speed and Bigger text survive the host\u2019s household; the speed reaches the host, the text size stays on the guest\u2019s phone',{guest:B.J('[assist(1).speed,!!S.bigtext]')});});

 /* 19. A night panel left open past its night. */
 await step(19,'A night panel left open past its night',async()=>{const {A,B}=await two();B.run("dispatch('sleep')");await T.settle(300);
  T.sleep(B);A.run("clickBtn('nextday')");A.run("closePanel()");await T.play([A],20);T.wake(B);await T.play([A,B],25);
  assert.deepEqual([T.shared(A).day,T.shared(B).day],[2,2]);const p=B.J("overlayOpen()&&/data-act=\"nextday\"/.test(String(panel.innerHTML))");assert.equal(p,false,'the guest\u2019s night panel for day 1 is closed');
  B.run("PAIR71B.nightDay=1;dispatch('nextday')");await T.play([A,B],3);assert.deepEqual([T.shared(A).day,T.shared(B).day],[2,2],'a press for a night that has passed does nothing');noErrors();
  pass('A night panel left open on a phone that slept while the other pressed it: it closes when the new day arrives, and a press for the past night does nothing; one day passes',{day:2});});

 /* 20. The sofa: set down on one phone, placed by an older build, and found where it is after a quick reload. */
 await step(20,'The sofa on both phones after a short absence',async()=>{const out={};
  {const {A,B}=await two();await lift(A,B);await T.play([A,B],1,[[0,-1],[0,-1]]);T.sleep(B);await T.play([A],10);T.wake(B);await T.play([A,B],12);   // the guest's phone locks for 10 s mid-carry
   assert.deepEqual([A.J('!!sofa.carrying'),B.J('!!sofa.carrying')],[false,false],'set down on both phones');const pa=A.J('[sofa.g.position.x,sofa.g.position.z]'),pb=B.J('[sofa.g.position.x,sofa.g.position.z]');
   assert(Math.hypot(pa[0]-pb[0],pa[1]-pb[1])<0.05,'in one place: '+pa+' / '+pb);out.lockedPhone='down on both, in one place';}
  {const {A,B}=await two();await lift(A,B);A.run("S.sofa.state='placed';S.home.items.push({id:'old',type:'sofa',x:2,y:0});sofa.carrying=false;sofa.holder=[null,null];sofa.g.visible=false;NET.dirty=true;");   // a host on an older build places it without saying so
   await T.play([A,B],3);assert.equal(B.J('!!sofa.carrying'),false,'the guest lets go');const f=B.J('[players[1].g.position.x,players[1].g.position.z]');await T.play([A,B],1,[null,[0,1]]);const t2=B.J('[players[1].g.position.x,players[1].g.position.z]');
   assert(Math.hypot(t2[0]-f[0],t2[1]-f[1])>1,'and walks: '+f+' -> '+t2);out.olderHost='the guest lets go and walks';}
  {let {A,B}=await two();await lift(A,B);await T.play([A,B],1.2,[[0,-1],[0,-1]]);T.kill(B);await T.play([A],2);B=await T.reopen(B);live.push(B);await T.play([A,B],3);   // back after 2 s, before an idle write
   const pa=A.J('[sofa.g.position.x,sofa.g.position.z]'),pb=B.J('[sofa.g.position.x,sofa.g.position.z]');assert(Math.hypot(pa[0]-pb[0],pa[1]-pb[1])<0.05,'one place: '+pa+' / '+pb);out.quickReload='one place';}
  {const {A,B}=await two();A.run("{const s=stripState;stripState=function(){const o=s.apply(this,arguments);delete o.hands71b;if(o.sofa)o.sofa.pos=[4,8.6];return o;};}");   // a host on an older build: its household never moves the sofa
   await lift(A,B);await T.play([A,B],1.2,[[0,-1],[0,-1]]);assert.equal(B.run('pressAct()'),'drop');await T.play([A,B],12);
   const pa=A.J('[sofa.g.position.x,sofa.g.position.z]'),pb=B.J('[sofa.g.position.x,sofa.g.position.z]');assert.deepEqual([A.J('!!sofa.carrying'),B.J('!!sofa.carrying')],[false,false]);
   assert(Math.hypot(pa[0]-pb[0],pa[1]-pb[1])<0.05&&Math.hypot(pb[0]-4,pb[1]-8.6)>1,'set down where it was carried, on both: '+pa+' / '+pb);out.olderHostSetDown='where it was carried, on both';}
  noErrors();pass('The sofa: a phone locked for ten seconds mid-carry and a reload of two seconds leave it set down in one place on both phones; a phone still carrying a sofa the household says is in lets go and can walk; a household from an older build does not move it back to the gate',out);});

 /* 21. Swap stations and an answer in the same instant. */
 await step(21,'Swap stations and an answer in the same instant',async()=>{const {A,B}=await two();
  A.run("RECIPES.jollof.needs.forEach(k=>addPantry(k,1));NET.dirty=true;tp(0,-4.4,3.4)");B.run("tp(1,-4.0,3.0)");await T.play([A,B],3);A.run("dispatch('cook',{r:'jollof'})");await T.play([A,B],1);
  B.run("dispatch('swapst')");A.run("clickBtn('cookans',d=>d.i==='0'&&d.ix==='2')");await T.play([A,B],2);
  for(let k=0;k<6;k++){for(const [P,i] of [[A,0],[B,1]])P.run(`{const b=panelButtons().find(b=>b.act==='cookans'&&b.d.i==='${i}'&&!b.disabled);if(b)dispatch('cookans',b.d);}`);await T.play([A,B],0.5);}   // each answers its own station with an answer it can use
  const ok=A.run("clickBtn('serve')");await T.play([A,B],2);assert.equal(ok,'ok');assert.deepEqual([T.shared(A).dishes.length,T.shared(B).dishes.length],[1,1],'served: one dish on both phones');noErrors();
  pass('One player swaps the stations as the other answers: the swap does not apply, both stations can be finished and the dish is served on both phones',{dish:T.shared(A).dishes});});

 /* 22. A late delivery is not taken for a lost one. */
 await step(22,'A late delivery is not taken for a lost one',async()=>{const {A,B}=await two();T.cut(A,true);buy(B,'tomato');const seen=[];
  for(let k=0;k<12;k++){await T.play([A,B],0.25);seen.push(B.J('(S.p[1].basket||{}).tomato||0'));}A.run("NET.dirty=true");await T.play([A,B],0.5);T.cut(A,false);
  for(let k=0;k<12;k++){await T.play([A,B],0.25);seen.push(B.J('(S.p[1].basket||{}).tomato||0'));}await T.play([A,B],4);
  assert(seen.every(v=>v===1),'the tomato never leaves the guest\u2019s bag: '+seen.join(''));assert(T.same(A,B));assert.equal(told(B),0);noErrors();
  pass('Deliveries held for three seconds while the host writes: the guest\u2019s purchase never disappears from its bag, arrives at the host, and nobody is told anything was lost',{});});

 /* 23. A phone that wakes alone and writes its old household. */
 await step(23,'A phone that wakes alone and writes its old household',async()=>{const {A,B}=await two();A.run("tp(0,-6.4,4.2)");await T.play([A,B],1);
  T.sleep(B);await T.play([A],2);A.run("dispatch('storeitem',{id:S.home.items.find(q=>q.type==='fridge').id})");A.run("openBuild()");await T.play([A],18);T.wake(B);await T.play([A,B],14);
  assert(T.same(A,B),'one household');assert.equal(owned(A,'fridge'),1);noErrors();
  pass('A phone wakes alone after twenty seconds while the host has Build open: both phones hold the same household and the fridge is not duplicated',{});});

 /* 24. Album pictures across a reopen in either order, and two at once. */
 await step(24,'Album pictures',async()=>{let {A,B}=await two();for(const P of [A,B])P.run("var shotN=0;snapshot=function(){return 'data:image/jpeg;base64,'+String.fromCharCode(65+NET.myIndex)+'A'.repeat(400)+(++shotN);};");
  T.kill(B);await T.play([A],35);A.run("dispatch('hudphoto',{caption:'Taken alone'})");await T.play([A],12);T.kill(A);await T.settle(500);
  B=await T.reopen(B);live.push(B);await T.play([B],5);A=await T.reopen(A);live.push(A);await T.play([A,B],4);
  B.run("dispatch('albumbtn')");await T.settle(800);const holder=B.J("S.memories.filter(m=>m.pid).map(m=>m.caption+':'+(m.img?m.img.slice(23,24):'none'))");
  assert.deepEqual(holder,['Taken alone:A'],'the phone holding the meeting point shows the picture it never had');
  for(const P of [A,B])P.run("var shotN=0;snapshot=function(){return 'data:image/jpeg;base64,'+String.fromCharCode(65+NET.myIndex)+'A'.repeat(400)+(++shotN);};");
  A.run("dispatch('hudphoto',{caption:'From Ada'})");B.run("dispatch('hudphoto',{caption:'From Bola'})");await T.play([A,B],12);A.run("closePanel();dispatch('albumbtn')");B.run("closePanel();dispatch('albumbtn')");await T.settle(800);
  const pics=P=>P.J("S.memories.filter(m=>m.pid&&m.caption!=='Taken alone').map(m=>m.caption+':'+(m.img?m.img.slice(23,24):'none'))");
  for(const P of [A,B])for(const c of pics(P))assert(!/^From Ada:B|^From Bola:A/.test(c),'a picture under the other player\u2019s caption: '+c);noErrors();
  pass('A picture taken while the partner was away is shown by the phone that holds the meeting point next time; two pictures taken in the same instant are never shown under each other\u2019s caption',{holder,sameInstant:[pics(A),pics(B)]});});

 /* 25. What reached the host inside a household the guest wrote itself is not reported lost. */
 await step(25,'What reached the host inside a household the guest wrote itself',async()=>{const out={};
  for(const ms of [100,600,1000]){const {A,B}=await two();T.wake(B);await T.play([A,B],ms/1000);buy(B,'tomato');await T.play([A,B],10);   // the guest's channel is replaced; it buys while it is alone
   assert(T.same(A,B),'one household ('+ms+' ms)');assert.deepEqual([A.J('(S.p[1].basket||{}).tomato||0'),B.J('(S.p[1].basket||{}).tomato||0')],[1,1],'kept on both ('+ms+' ms)');assert.equal(told(B),0,'nobody told ('+ms+' ms)');}
  out.channelReplaced='kept on both, nobody told, at 100, 600 and 1000 ms';
  {const {A,B}=await two();T.sleep(A);await T.play([B],45);buy(B,'tomato');buy(B,'pepper');await T.play([B],5);T.wake(A);await T.play([A,B],25);   // the host's phone locked for 50 s
   assert(T.same(A,B));assert.deepEqual(A.J('S.p[1].basket'),{tomato:1,pepper:1});assert.equal(told(B),0);out.hostLocked='both purchases kept, nobody told';}
  {const {A,B}=await two();B.run("tp(1,-5.2,4.0);players[1].face=[0,-1]");await T.play([A,B],1);B.run("dispatch('pickup',{id:S.home.items.find(q=>q.type==='table').id,i:1})");await T.play([A,B],2);
   T.wake(B);await T.play([A,B],1.4);await placeHeld(B,1,[A,B]);await T.play([A,B],12);
   assert(T.same(A,B));assert.deepEqual([owned(A,'table'),owned(B,'table')],[1,1]);assert.deepEqual([inv(A).hands,inv(B).hands],[[null,null],[null,null]]);assert.equal(told(B),0);out.placement='placed on both, nobody told';}
  noErrors();pass('What the guest did while it was alone, and that reached the host inside the household the guest wrote, is kept and nobody is told it was lost: a purchase just after the channel is replaced, two purchases while the host\u2019s phone is locked, a table put down between channels',out);});

 /* 26. The link to the meeting service drops while deliveries are late. */
 await step(26,'The link to the meeting service drops while deliveries are late',async()=>{const {A,B}=await two();T.cut(B,true);const seen=[];
  for(let k=0;k<60;k++){if(k===3)buy(B,'tomato');if(k===5)buy(A,'pepper');if(k===10){const p=(W.peers['B']||[]).filter(x=>!x.destroyed).pop();p._disconnect();}if(k===20)T.cut(B,false);
   await T.play([A,B],0.1);if(k>=3)seen.push(B.J('(S.p[1].basket||{}).tomato||0'));}
  await T.play([A,B],4);assert(B.J("TOGETHER47.log.some(l=>/signal lost/.test(l))"),'the guest lost the meeting service');
  assert(seen.every(v=>v===1),'the tomato never leaves the guest\u2019s bag: '+seen.join(''));assert(T.same(A,B));assert.deepEqual(A.J('[S.p[0].basket,S.p[1].basket]'),[{pepper:1},{tomato:1}]);
  assert.deepEqual([told(B),B.J('PAIR71B.resyncs')],[0,0]);noErrors();
  pass('Deliveries held for two seconds and the guest\u2019s link to the meeting service dropping meanwhile: its channel to the host stays, so nothing is taken for lost; both purchases are kept and nobody is told anything',{});});

 /* 27. A picture taken while the link is down reaches the other phone without a reload. */
 await step(27,'A picture taken while the link is down',async()=>{const {A,B}=await two();for(const P of [A,B])P.run("var shotN=0;snapshot=function(){return 'data:image/jpeg;base64,'+String.fromCharCode(65+NET.myIndex)+'A'.repeat(400)+(++shotN);};");
  T.cut(B,true);await T.play([A,B],40);B.run("dispatch('hudphoto',{caption:'Alone on the guest phone'})");await T.play([A,B],2);T.cut(B,false);await T.play([A,B],25);   // the connection dies; the room joins again by itself
  A.run("closePanel();dispatch('albumbtn')");await T.settle(800);const got=A.J("S.memories.filter(m=>m.pid&&m.caption==='Alone on the guest phone').map(m=>m.img?m.img.slice(23,24):'none')");
  assert.deepEqual(got,['B'],'the other phone draws the picture');noErrors();
  pass('A picture taken on the guest phone while the connection was down is drawn in the other phone\u2019s album once the room has joined again by itself, with no reload',{got});});

 /* 28. Back to an earlier household by its code, after playing another. */
 await step(28,'Back to an earlier household by its code',async()=>{let {A,B,code}=await two();
  const leave=async P=>{P.run("dispatch('newconfirm')");assert.equal(P.run("clickBtn('pairleave71b')"),'ok');await T.settle(300);const N=await T.reopen(P,{titleOnly:true});live.push(N);return N;};   // leaving reloads the page
  A=await leave(A);B=await leave(B);const code2=await T.pair(A,B,{a:'Ada',b:'Bola'});assert.notEqual(code2,code);A=await leave(A);B=await leave(B);
  await T.join(A,code);await T.play([A],1);await T.join(B,code);await T.play([A,B],3);   // Player 1 types the first household's code first
  const seat=P=>P.J('[NET.on,NET.myIndex,S.p[NET.myIndex].name]');assert.deepEqual([seat(A),seat(B)],[[true,0,'Ada'],[true,1,'Bola']],'each phone back in its own seat');assert(T.same(A,B));noErrors();
  pass('Two players leave a household, play another together, and come back to the first by its code, Player 1 typing it first: each phone is back in its own seat',{seats:[seat(A),seat(B)]});});

 fresh();
 const report={build,passed:failed===0,checks,method:'Two or three copies of the shipped game logic in Node, joined through the real room code in dist/src/together-v47.js over a stand-in for PeerJS with one world clock (check/two-phones.cjs). State and replay order only: no browser, no real network, no public PeerJS service, no phone.'};
 fs.writeFileSync(path.join(__dirname,'results-pair-v71b.json'),JSON.stringify(report,null,2)+'\n');if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);fs.writeFileSync(path.join(__dirname,'results-pair-v71b.json'),JSON.stringify({build,passed:false,checks,failure:String(e&&e.stack||e)},null,2)+'\n');process.exitCode=1;});

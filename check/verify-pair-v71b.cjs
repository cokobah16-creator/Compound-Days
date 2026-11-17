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
 await step(3,'An action sent while the link was down never arrives: the guest catches up and is told',async()=>{const {A,B}=await two();T.cut(B,true);buy(B,'tomato');buy(B,'pepper');const apart=[T.shared(A).money,T.shared(B).money];
  await T.play([A,B],10);T.cut(B,false);await T.play([A,B],14);
  assert(T.same(A,B),'both phones hold the same household again');assert.equal(T.shared(B).money,apart[0],'the purchases that never arrived are gone on the guest too');
  const told=B.J('TOASTS').filter(t=>/Back in step/.test(t)).length;assert(told>=1,'the guest is told');noErrors();
  pass('Two purchases made while the link was down for ten seconds: fourteen seconds after it returns both phones hold the host’s household, and the guest is told its change did not arrive',{purseWhileApart:apart,purseAfter:[T.shared(A).money,T.shared(B).money],guestTold:told,catchUps:B.J('PAIR71B.resyncs')});});

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
  assert.deepEqual([T.shared(A).day,T.shared(B).day],[2,2],'one night, one day');assert(T.same(A,B),'the same market on both phones');noErrors();
  pass('Both players press the night panel’s only button in the same instant: one day passes and both phones wake to the same market',{day:[T.shared(A).day,T.shared(B).day],market:[T.shared(A).mkt,T.shared(B).mkt]});});

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
 fresh();
 const report={build,passed:failed===0,checks,method:'Two or three copies of the shipped game logic in Node, joined through the real room code in dist/src/together-v47.js over a stand-in for PeerJS with one world clock (check/two-phones.cjs). State and replay order only: no browser, no real network, no public PeerJS service, no phone.'};
 fs.writeFileSync(path.join(__dirname,'results-pair-v71b.json'),JSON.stringify(report,null,2)+'\n');if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);fs.writeFileSync(path.join(__dirname,'results-pair-v71b.json'),JSON.stringify({build,passed:false,checks,failure:String(e&&e.stack||e)},null,2)+'\n');process.exitCode=1;});

/* v71b "Pair": two phones stay one household.

   The two-phone layer (index.html, "TWO PHONES: ROOM + SHARED STATE", and together-v47.js) replays each action on the
   other phone and lets the phone that writes the household (the host) send its copy to the other (the guest) as the
   repair. Running two copies of the game together (check/two-phones.cjs) showed where that came apart in ordinary
   play. Each wrap below closes one of those; none changes one-phone or companion play.

   1. The guest compared its count of ALL presses (panel closes included) with the host's and refused the host's
      household whenever its own was higher, which it already was after a normal join. Presses that are never sent
      no longer count. Each sent action is numbered, and the host's household says which it has heard, so a guest
      knows when something it did never arrived: only when the connection it was sent on has gone (or nobody was
      there to hear it). Then it takes the host's household and is told; or, if the host has done nothing since, it
      offers its own household instead, so play done alone while the other phone had no signal is kept. A late
      action is never mistaken for a lost one, and an action that reached the host inside a household this phone
      wrote itself (while it was alone) counts as heard.
   2. A household arriving while the joining player was still making a character wiped that screen's state: every
      choice threw an error and could revert. The character screen now survives it.
   3. What each player has in their hands (a piece carried with Build) was outside the household: a placed piece
      stayed in the carrier's hands on the other phone and came back as a free duplicate, and a reload, a lost
      message, leaving or two players taking the same piece lost or duplicated it. The household now says what is
      in each player's hands, and a phone taking the host's household takes that too. The replay of a placement
      also puts the piece down on the other phone.
   4. Both players pressing the one night button passed two days, and a night panel left open past its night could
      pass a second one. A day change names the day its panel was opened for, and a panel for a day that has ended
      is closed.
   5. The sofa: each phone decided for itself that it was in, nothing was written while the host's panel stood open,
      and positions were never written in two-phone play. It now goes in once, as a shared action from the host; the
      household carries where the players, the sofa and the crate are, and a phone that is not carrying it puts its
      sofa where the household says. A partner who drops mid-carry sets it down, on both phones once they meet again,
      and a phone still carrying a sofa the household says is in lets go of it.
   6. A phone that held the meeting point, slept, and woke to find the other phone holding it retried its old place
      for ever. It now joins whoever holds it. A phone that wakes alone and briefly writes its old household at the
      host's revision is outvoted by the host's next write instead of splitting the pair.
   7. A device joining by code with no stored place took Player 2's seat even when a phone was already playing it.
      It now takes the seat nobody is using, or with both free the seat it had in that household before (each phone
      remembers its seat per household), and is turned away when both are in use, keeping whatever household it had
      before. Until its seat is known it takes no household and writes none, so it cannot act in one.
   8. Smaller: the graphics-quality button and the lobby's back arrow were replayed on the partner's phone; each
      phone's Bigger text and its player's walking speed are its own and survive the host's household (the speed
      also travels, and its replay only sets the speed); the online
      Menu's "Start a new household" replaced the shared household instead of leaving it, and leaving now writes
      first; one player sitting on the sofa seated the other phone's own player, who then could not move; the host's
      idle write also runs while one of its panels is open; "Swap stations" no longer applies once a station has an
      answer (a crossed swap and answer left both players in a cook panel that could not be served); album pictures
      never came back after reopening, a phone that holds the meeting point gets the other phone's pictures, two
      pictures taken in the same instant are no longer swapped, and a picture that is not an image is not drawn.

   Not changed here: which copy wins when both phones changed things apart (still the higher revision), who may send
   which action, the household code as the only key, a returning phone or a second device taking a seat that is in
   use through Continue together, and a piece on the cell inside the flat door shutting the flat (keeping that cell
   clear would change the home editor for every household). Those need decisions, not wraps. */
const PAIR71B={version:2,
 nudgeMs:3000,           // a guest with a lost action that hears nothing newer this long asks the host to write
 seatSettleMs:300,       // a device joining by code reads who is playing this long after the holder has answered
 idleMs:9000,            // the host's idle write, also while one of its panels is open
 n:0,out:[],gen:0,doc:null,docAt:-1e9,nudgedAt:-1e9,takenAseq:null,joining:false,seating:false,seat:null,resyncs:0,offers:0,refused:0,
 wasHost:null,droppedAlone:false,nightDay:null
};
function pairOnline71b(){ return typeof NET!=='undefined'&&!!NET&&!!NET.on; }

/* ---------- 1. the press count, numbered actions, and what was heard ---------- */
if(typeof dispatch==='function'){ const dispatch71b=dispatch;
 // wrap: a press that is never sent does not raise this phone's action count; a sent action carries this phone's
 // session and number; a day change carries the day its panel was opened for
 dispatch=function(name,data){
  if(!pairOnline71b()) return dispatch71b.call(this,name,data);
  const fn=ACTIONS[name], known=typeof fn==='function', local=known&&LOCAL_ONLY.has(name); let ran=false;
  if(name==='nextday'&&S){ data=Object.assign({},data||{}); if(data.from===undefined) data.from=PAIR71B.nightDay!==null?PAIR71B.nightDay:S.day;
   if(+data.from!==S.day){ PAIR71B.nightDay=null; if(typeof closePanel==='function') closePanel(); return; } }   // a night panel for a day that has ended: closed here, nothing sent
  if(known&&!local){ data=Object.assign({},data||{}); const n=++PAIR71B.n; data._p71=[NET.since||0,n]; PAIR71B.out.push({n,gen:NET.otherOnline?PAIR71B.gen:-1}); }   // -1: nobody was there to hear it
  if(local) ACTIONS[name]=function(){ ran=true; return fn.apply(this,arguments); };   // did the base reach the action (and so count it)?
  let r; try{ r=dispatch71b.call(this,name,data); } finally{ if(local) ACTIONS[name]=fn; }
  if(local&&ran&&S&&S.aseq>0) S.aseq--;
  return r;
 };
}
if(typeof applyRemote==='function'){ const applyRemote71b=applyRemote;
 // wrap: the household records the last action it has heard from each player's phone
 applyRemote=function(m){ if(PAIR71B.seating) return;   // a device joining by code is not in the household yet
  const r=applyRemote71b.apply(this,arguments);
  try{ const a=m&&!m.sameTab&&m.data, p=a&&a.data&&a.data._p71; if(p&&S&&Array.isArray(p)&&(a.src===0||a.src===1)){ S.ack71b=S.ack71b||{}; const c=S.ack71b[a.src];
   if(!c||c[0]!==p[0]||c[1]<p[1]) S.ack71b[a.src]=[p[0],p[1]]; } }catch(e){}
  return r; };
}
// a connection this phone sends on has gone, or a new one has come: actions sent before it cannot arrive any more.
// ("signal lost" is not one: that is the meeting service, and the phones' own connection stays open through it)
if(typeof together47Log==='function'){ const log71b=together47Log;
 together47Log=function(s){ if(/^(hub lost|hub silent|guest out|guest silent|joined |holding )/.test(String(s))) PAIR71B.gen++;
  if(/^joined /.test(String(s))&&typeof setTimeout==='function') setTimeout(pairPushPhotos71b,0);   // also a rejoin by the room itself; its role is set just after this line
  return log71b.apply(this,arguments); };
}
// a guest gives the phone holding the meeting point the pictures it has (taken while that phone was away)
function pairPushPhotos71b(){ try{ const R=typeof TOGETHER47!=='undefined'&&TOGETHER47.room; if(pairOnline71b()&&NET.db&&R&&R.role==='guest'&&R.store&&R.store.docs) for(const p of Object.keys(R.store.docs)) if(p.indexOf('/photos/')>0) NET.db.doc(p).set(R.store.docs[p]).catch(()=>{}); }catch(e){} }
function pairLost71b(){ return PAIR71B.out.filter(o=>o.gen!==PAIR71B.gen); }
// this phone's household goes to the host as the newer copy (it played on while the host, doing nothing, had no signal)
function pairOffer71b(d){ S.rev=Math.max(S.rev||0,(d&&d.rev)||0)+1; PAIR71B.offers++;
 try{ NET.docRef.set(stripState()).catch(()=>{}); }catch(e){} }
// every household that reaches this phone, after the base has decided whether to take it
function pairOnDoc71b(d){ if(PAIR71B.seating||!d||!d.p||!S||!S.p) return; PAIR71B.doc=d; PAIR71B.docAt=performance.now();
 if(NET.isHost){
  // a phone that was briefly alone wrote its old household at this phone's revision: write again and win
  if(S.phase==='play'&&(d.rev||0)>=(S.rev||0)&&(d.aseq||0)<(S.aseq||0)){ S.rev=d.rev||0; NET.dirty=true; }
  return; }
 const took=(S.rev||0)===(d.rev||0)&&(S.aseq||0)===(d.aseq||0); if(took) PAIR71B.takenAseq=d.aseq||0;
 const heard=d.ack71b&&d.ack71b[NET.myIndex], acked=heard&&heard[0]===(NET.since||0)?heard[1]:0;
 PAIR71B.out=PAIR71B.out.filter(o=>o.n>acked);
 const lost=pairLost71b(); if(!lost.length) return;
 if(PAIR71B.out.length>lost.length) return;      // others are still on their way: the next household will have them
 if(!took&&PAIR71B.takenAseq!==null&&(d.aseq||0)===PAIR71B.takenAseq&&S.phase==='play'){ PAIR71B.out=[]; pairOffer71b(d); return; }   // the host did nothing since
 const wasReady=!!(S.ready&&S.ready[NET.myIndex]);
 if(!took){ applyState(JSON.parse(JSON.stringify(d))); PAIR71B.takenAseq=d.aseq||0; }
 PAIR71B.out=[]; PAIR71B.resyncs++;
 if(S.phase==='play'){ if(typeof overlayOpen==='function'&&overlayOpen()) closePanel();
  toast(`Back in step with ${pname(1-NET.myIndex)}’s phone. What you did while the connection was down did not reach it.`); }
 else if(wasReady&&!(S.ready&&S.ready[NET.myIndex])) toast(`Back in step with ${pname(1-NET.myIndex)}’s phone. Your character did not reach it: make yourself again.`);
}
// a guest with a lost action that hears nothing asks the host to write (the lobby has no frames, so this has its own timer)
function pairNudge71b(){ if(!pairOnline71b()||NET.isHost||!NET.room||!pairLost71b().length) return; const now=performance.now();
 if(now-PAIR71B.docAt<PAIR71B.nudgeMs||now-PAIR71B.nudgedAt<PAIR71B.nudgeMs) return; PAIR71B.nudgedAt=now;
 try{ NET.room.emit('hello',{slot:NET.myIndex}).catch(()=>{}); }catch(e){} }
if(typeof setInterval==='function') setInterval(()=>{ try{ pairNudge71b(); }catch(e){} },1000);

/* ---------- 2 and 3: what survives a household from the other phone ---------- */
function pairHands71b(){ return (typeof ghosts!=='undefined'?ghosts:[null,null]).map(g=>g?{type:g.type,buy:!!g.buy,free:!!g.free}:null); }
// put in each player's hands what the household says, without returning anything to storage (the household says where it is)
function pairSetHands71b(h){ if(!Array.isArray(h)||typeof ghosts==='undefined') return; let mineGone=null;
 for(const i of [0,1]){ const want=h[i]||null, g=ghosts[i];
  if((!want&&!g)||(want&&g&&g.type===want.type&&!!g.free===!!want.free&&!!g.buy===!!want.buy)) continue;
  if(g){ scene.remove(g.g); ghosts[i]=null; if(i===NET.myIndex&&!want) mineGone=g.type; }
  if(want&&typeof ITEMS!=='undefined'&&ITEMS[want.type]) setGhost(i,{type:want.type,buy:want.buy,free:want.free}); }
 if(mineGone&&typeof ITEMS!=='undefined'&&ITEMS[mineGone]){ const o=h[1-NET.myIndex];
  toast(o&&o.type===mineGone?`${pname(1-NET.myIndex)} took the ${ITEMS[mineGone].name.toLowerCase()} first.`:`The ${ITEMS[mineGone].name.toLowerCase()} is not in your hands any more.`); } }
function pairBigText71b(){ try{ const v=localStorage.getItem('cd3-bigtext71b'); return v===null?null:v==='1'; }catch(e){ return null; } }
if(typeof applyState==='function'){ const applyState71b=applyState;
 // wrap: keep this phone's unfinished character (and its screen), its Bigger text and its player's walking speed;
 // take what the household says is in each player's hands and, for a sofa nobody here is carrying, where it is
 applyState=function(d){
  if(PAIR71B.seating) return;                     // a device joining by code takes no household until its seat is known
  const on=pairOnline71b(), mine=on&&S&&S.p&&S.setup&&S.phase!=='play'&&!(S.ready&&S.ready[NET.myIndex])?{setup:S.setup,me:S.p[NET.myIndex],lobby:NET.lobby}:null;
  const keep=on&&S&&S.p?{big:S.bigtext,speed:S.assist&&S.assist[NET.myIndex]&&S.assist[NET.myIndex].speed,day:S.day}:null;
  if(mine) NET.lobby=false;                       // or the base draws the lobby over the character screen
  const r=applyState71b.apply(this,arguments);
  if(!on||!S||!S.p) return r;
  if(mine&&S.phase!=='play'){ NET.lobby=mine.lobby; if(!(S.ready&&S.ready[NET.myIndex])){ S.setup=mine.setup; S.p[NET.myIndex]=mine.me; } }
  try{ const big=pairBigText71b(); S.bigtext=big!==null?big:(keep?!!keep.big:false); if(typeof applyBigText==='function') applyBigText();
   if(keep&&typeof keep.speed==='number') assist(NET.myIndex).speed=keep.speed;
   if(S.phase==='play'&&players.length){ pairSetHands71b(d&&d.hands71b);
    if(sofa&&!sofa.carrying&&S.sofa&&S.sofa.state!=='placed'&&Array.isArray(S.sofa.pos)&&d&&Array.isArray(d.hands71b)){ sofa.g.position.x=S.sofa.pos[0]; sofa.g.position.z=S.sofa.pos[1]; if(typeof S.sofa.rot==='number') sofa.g.rotation.y=S.sofa.rot; }   // only a household this module wrote (an older build never updates the sofa's place)
    if(keep&&keep.day!==S.day&&typeof overlayOpen==='function'&&overlayOpen()&&/data-act="nextday"/.test(String(panel.innerHTML))) closePanel(); } }catch(e){}   // a night panel for a day that has ended
  return r;
 };
}
if(typeof renderSetup==='function'){ const renderSetup71b=renderSetup;
 // wrap: in two-phone play the character screen always has a step to draw
 renderSetup=function(){ if(pairOnline71b()&&S&&!S.setup&&S.phase!=='play') S.setup={step:'p'+NET.myIndex}; return renderSetup71b.apply(this,arguments); };
}
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.setupstep==='function'){ const setupstep71b=ACTIONS.setupstep;
 // wrap: "Make yourself" from the lobby works on a phone whose character screen state did not travel
 ACTIONS.setupstep=function(d){ if(pairOnline71b()&&S&&!S.setup&&S.phase!=='play') S.setup={step:(d&&d.v)||('p'+NET.myIndex)}; return setupstep71b.apply(this,arguments); };
}
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.bigtext==='function'){ const bigtext71b=ACTIONS.bigtext;
 // wrap: in two-phone play Bigger text is this phone's own (it stays the same whatever the other phone's household says)
 ACTIONS.bigtext=function(){ const r=bigtext71b.apply(this,arguments); if(pairOnline71b()){ try{ localStorage.setItem('cd3-bigtext71b',S&&S.bigtext?'1':'0'); }catch(e){} } return r; };
}

/* ---------- 3. a placed piece leaves the hands on both phones ---------- */
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.placeItem==='function'){ const placeItem71b=ACTIONS.placeItem;
 // wrap: on the phone replaying a placement, the carrier's see-through piece goes too; refused there, an owned piece goes to storage
 ACTIONS.placeItem=function(d){
  const i=+(d&&d.i), gh=(typeof silentMode==='function'&&silentMode()&&S&&S.home&&ghosts[i]&&ghosts[i].type===d.type)?ghosts[i]:null, n0=gh?S.home.items.length:0;
  const r=placeItem71b.apply(this,arguments);
  if(gh&&ghosts[i]===gh){ scene.remove(gh.g); ghosts[i]=null; if(gh.free&&S.home.items.length<=n0) S.home.storage.push(gh.type); }
  return r;
 };
}

/* ---------- 4. one day per night ---------- */
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.nextday==='function'){ const nextday71b=ACTIONS.nextday;
 // wrap (outermost, so no inner wrapper runs twice): a day change for a day that has already ended does nothing (the
 // partner pressed the same night's button: this phone already has the morning, and keeps whatever panel it shows)
 ACTIONS.nextday=function(d){ if(d&&d.from!==undefined&&d.from!==null&&S&&+d.from!==S.day) return;
  PAIR71B.nightDay=null; return nextday71b.apply(this,arguments); };
}

/* ---------- 5. the sofa ---------- */
// a phone still carrying a sofa that is already in lets go of it (a host on an older build placed it without saying so)
function pairLetGo71b(){ if(sofa&&sofa.carrying){ sofa.carrying=false; sofa.holder=[null,null]; sofa.g.position.y=0; } }
if(typeof sofaSuccess==='function'&&typeof ACTIONS!=='undefined'){ const sofaSuccess71b=sofaSuccess;
 // the sofa is in: one action, so both phones place it at the same moment with the same words, and the host writes it
 ACTIONS.sofaIn=function(d){ if(!sofa||!S||!S.sofa) return; if(S.sofa.state==='placed'){ pairLetGo71b(); return; } if(d&&typeof d.bump==='number') sofa.bump=d.bump; return sofaSuccess71b.call(this); };
 SHARED_PANEL.add('sofaIn');
 // wrap: in two-phone play only the host's phone decides the sofa is in, and says so as a shared action
 sofaSuccess=function(){ if(!pairOnline71b()) return sofaSuccess71b.apply(this,arguments);
  if(NET.isHost&&S&&S.sofa&&S.sofa.state!=='placed') dispatch('sofaIn',{bump:(sofa&&sofa.bump)||0}); };
}
if(typeof ACTIONS!=='undefined'){
 // the sofa was set down on one phone while the partner was away: set it down on the other phone too
 ACTIONS.sofaDown71b=function(){ const was=!!(sofa&&sofa.carrying); pairLetGo71b();
  if(was&&typeof silentMode==='function'&&silentMode()) toast('The sofa was set down while the two phones were apart.'); };
}
if(typeof stripState==='function'){ const strip71b=stripState;
 // wrap: the household the host writes says where the players, the sofa and the crate are (one-phone saves always
 // did) and what each player has in their hands
 stripState=function(){ const o=strip71b.apply(this,arguments);
  // this phone's own actions are in the household it writes: a host that takes it has heard them
  try{ if(pairOnline71b()&&o&&o.p&&PAIR71B.n>0&&(NET.myIndex===0||NET.myIndex===1)){ const a=[NET.since||0,PAIR71B.n];
   o.ack71b=Object.assign({},o.ack71b||{}); o.ack71b[NET.myIndex]=a; if(S){ S.ack71b=S.ack71b||{}; S.ack71b[NET.myIndex]=a.slice(); } } }catch(e){}
  try{ if(pairOnline71b()&&o&&o.p&&o.phase==='play'&&players.length){ const r2=v=>Math.round(v*100)/100;
   o.p.forEach((p,i)=>{ const q=players[i]; if(q&&q.g) p.pos=[r2(q.g.position.x),r2(q.g.position.z)]; });
   if(sofa&&o.sofa&&o.sofa.state!=='placed'){ o.sofa.pos=[r2(sofa.g.position.x),r2(sofa.g.position.z)]; o.sofa.rot=r2(sofa.g.rotation.y); }
   if(crate&&o.crate) o.crate=[r2(crate.position.x),r2(crate.position.z)];
   o.hands71b=pairHands71b(); } }catch(e){}
  return o; };
}
if(typeof writeState==='function'){ const writeState71b=writeState;
 // wrap: a device joining by code writes nothing until its seat is known
 writeState=async function(){ if(PAIR71B.seating) return; return writeState71b.apply(this,arguments); };
}
// every frame in two-phone play: the sofa rules, the host's idle write under a panel, and a phone that has just become host alone
function pairTick71b(dt,active){
 if(!pairOnline71b()||!S||!S.p) return;
 if(S.phase==='play'&&sofa){
  if(sofa.carrying&&S.sofa&&S.sofa.state==='placed') pairLetGo71b();
  if(sofa.carrying&&!NET.otherOnline&&typeof releaseSofa==='function'){ releaseSofa(); PAIR71B.droppedAlone=true; NET.dirty=true; toast(`${pname(1-NET.myIndex)} is not connected, so the sofa is set down.`); }
  if(PAIR71B.droppedAlone&&NET.otherOnline){ PAIR71B.droppedAlone=false; dispatch('sofaDown71b',{}); } }
 // a phone that has just become the writer with nobody else here has nothing of its own to write yet
 if(PAIR71B.wasHost===false&&NET.isHost&&!NET.otherOnline&&!PAIR71B.out.length) NET.dirty=false;
 PAIR71B.wasHost=NET.isHost;
 if(!active&&NET.isHost&&!NET.writing&&S.phase==='play'&&performance.now()-NET.lastWrite>PAIR71B.idleMs) writeState();
}
if(typeof netTick==='function'){ const netTick71b=netTick;
 // wrap: the two-phone tick also runs the rules above (no new per-frame hook: the hook list stays as it was)
 netTick=function(dt,active){ const r=netTick71b.apply(this,arguments); pairTick71b(dt,active); return r; };
}

/* ---------- 6. a phone that slept while holding the meeting point ---------- */
if(typeof together47Room==='function'){ const room71b=together47Room;
 // wrap: told its old place is taken, a phone joins whoever holds it now instead of asking for it again
 together47Room=function(code){ const R=room71b.apply(this,arguments), err=R.peerError;
  R.peerError=function(peer,e){ err.apply(this,arguments);
   if(e&&e.type==='unavailable-id'&&R.role==='hub'&&peer===R.peer&&!R.closed){ together47Log('place taken: joining it'); R.role=null; R.pres.clear(); R.rejoin(); } };   // what it knew of who was here is out of date
  return R; };
}

/* ---------- 7. seats ---------- */
// each phone remembers its seat in every household it has played (its one stored place names only the last one), so a
// pair coming back to an earlier household by its code sits where they sat, whoever types the code first
function pairSeatMem71b(code){ try{ const v=localStorage.getItem('cd3-seat71b-'+code); return v==='0'?0:v==='1'?1:null; }catch(e){ return null; } }
function pairSeatKeep71b(code,i){ if(!code||(i!==0&&i!==1)) return; try{ localStorage.setItem('cd3-seat71b-'+code,String(i)); }catch(e){} }
if(typeof netRemember==='function'){ const remember71b=netRemember;
 // wrap: storing this phone's place also stores its seat for that household
 netRemember=function(){ const r=remember71b.apply(this,arguments); if(typeof NET!=='undefined'&&NET) pairSeatKeep71b(NET.code,NET.myIndex); return r; };
}
try{ const sv=typeof netSaved==='function'?netSaved():null; if(sv&&sv.code&&pairSeatMem71b(sv.code)===null) pairSeatKeep71b(sv.code,sv.myIndex); }catch(e){}   // the place stored before this module
// which seats other phones are using right now (their presence says which player they are). The phone holding the
// meeting point says who is there before it answers anything, and messages arrive in order, so asking it for the
// household first means the list has arrived however slow that phone is. Unanswered (8 s), nothing is assumed.
async function pairSeats71b(){ const seats=[false,false];
 try{ await NET.docRef.get(); }catch(e){}
 await new Promise(res=>{ let off=null;
  try{ off=NET.room.onPeers(ch=>{ seats[0]=seats[1]=false; ((ch&&ch.peers)||[]).forEach(p=>{ if(p.isMe&&p.sameTab) return; const s=p.presence&&p.presence.slot; if(s===0||s===1) seats[s]=true; }); }); }catch(e){}
  setTimeout(()=>{ try{ if(off) off(); }catch(e){} res(); },PAIR71B.seatSettleMs); });
 return seats; }
// leave the room without forgetting which household and which player this phone is
function pairQuit71b(){ NET.unsubs.forEach(u=>{ try{ u(); }catch(e){} }); NET.unsubs=[]; if(NET.room){ try{ NET.room.leave(); }catch(e){} } NET.room=null; NET.on=false; NET.lobby=false; NET.waitingHost=false; document.body.classList.remove('net'); }
if(typeof joinRoom==='function'){ const joinRoom71b=joinRoom;
 // wrap: follow every household this phone is sent, seat a device that joins by code, and give the meeting point this
 // phone's pictures
 joinRoom=async function(code){
  PAIR71B.doc=null; PAIR71B.docAt=PAIR71B.nudgedAt=-1e9; PAIR71B.out=[]; PAIR71B.takenAseq=null; PAIR71B.wasHost=null; PAIR71B.droppedAlone=false; PAIR71B.seat=null;
  const before=S, cacheKey='cd3-online-'+code; let hadCopy=true; try{ hadCopy=!!localStorage.getItem(cacheKey); }catch(e){}
  const saved=netSaved(), byCode=PAIR71B.joining&&!(saved&&saved.code===code); PAIR71B.seating=byCode;
  let r; try{ r=await joinRoom71b.apply(this,arguments); }catch(e){ PAIR71B.seating=false; throw e; }
  try{ NET.unsubs.push(NET.docRef.onSnapshot(snap=>{ if(snap&&snap.exists){ try{ pairOnDoc71b(snap.data()); }catch(e){} } })); }catch(e){}
  if(byCode){
   const seats=await pairSeats71b(); PAIR71B.seating=false;   // the base's own join goes on to take the household
   if(seats[0]&&seats[1]){ PAIR71B.refused++; pairQuit71b(); S=before; if(!hadCopy){ try{ localStorage.removeItem(cacheKey); }catch(e){} }   // keep what this device had: its own household is not overwritten
    throw new Error('That household already has two phones playing. If one of them is yours, close it there, wait a minute and try again.'); }
   const mem=pairSeatMem71b(code), seat=seats[0]||seats[1]?(seats[0]?1:0):mem;   // the free seat; with both free, the one this phone had here
   if(seat!==null){ PAIR71B.seat=seat; try{ localStorage.setItem('cd3-net',JSON.stringify({code,myIndex:seat})); }catch(e){} } }
  PAIR71B.seating=false;
  pairPushPhotos71b();
  return r;
 };
}
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.netjoingo==='function'){ const netjoingo71b=ACTIONS.netjoingo;
 // wrap: mark a join by code; once the seat is settled use it and say which player this phone is (the lobby never did)
 ACTIONS.netjoingo=async function(){ PAIR71B.joining=true;
  try{ return await netjoingo71b.apply(this,arguments); }
  finally{ PAIR71B.joining=false; if(pairOnline71b()&&NET.room){ if(PAIR71B.seat!==null&&NET.myIndex!==PAIR71B.seat){ NET.myIndex=PAIR71B.seat; try{ netRemember(); }catch(e){} }
   try{ NET.room.presence({slot:NET.myIndex,since:NET.since}).catch(()=>{}); }catch(e){} } } };
}

/* ---------- 8. smaller ---------- */
if(typeof LOCAL_ONLY!=='undefined'){ LOCAL_ONLY.add('quality'); LOCAL_ONLY.add('netlobby'); LOCAL_ONLY.add('pairleave71b'); LOCAL_ONLY.delete('aspeed'); }   // a walking speed is the household's: it travels
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.aspeed==='function'){ const aspeed71b=ACTIONS.aspeed;
 // wrap: replayed from the other phone, a walking speed only sets that speed (the action also redraws the Menu)
 ACTIONS.aspeed=function(d){ if(typeof silentMode==='function'&&silentMode()){ if(d&&(+d.i===0||+d.i===1)&&isFinite(+d.v)) assist(+d.i).speed=+d.v; return; } return aspeed71b.apply(this,arguments); };
}
if(typeof ACTIONS!=='undefined'){
 // leaving a two-phone household from the Menu: the household stays as it is on both phones; this phone goes to the title
 ACTIONS.pairleave71b=function(){ if(pairOnline71b()){ if(NET.isHost){ try{ NET.dirty=true; NET.writing=false; writeState(); }catch(e){} } pairQuit71b(); } S=null; try{ location.reload(); }catch(e){} if(typeof openTitle==='function') openTitle(); };
 const pairLeaveAsk71b=function(){ const who=(S&&S.p&&S.p[1-NET.myIndex]&&S.p[1-NET.myIndex].name)||'your person';
  openPanel(`<h2>Leave this household?</h2><p>This is the household you share on two phones. It stays as it is, here and on ${esc(who)}’s phone, and <b>Continue together</b> on the title brings you back.</p><p class="muted">To start another household, leave first and choose it from the title.</p><div class="actions">${btn('Leave and go to the title','pairleave71b',{},'primary')}${btn('No, keep playing','close',{},'quiet')}</div>`); };
 if(typeof ACTIONS.newconfirm==='function'){ const newconfirm71b=ACTIONS.newconfirm;
  // wrap: in two-phone play "Start a new household" offers to leave; it no longer replaces the household both phones share
  ACTIONS.newconfirm=function(){ if(pairOnline71b()&&S&&S.phase==='play') return pairLeaveAsk71b(); return newconfirm71b.apply(this,arguments); }; }
 if(typeof ACTIONS.newgame==='function'){ const newgame71b=ACTIONS.newgame;
  // wrap: a new household is never started inside a two-phone room
  ACTIONS.newgame=function(){ if(pairOnline71b()&&S&&S.phase==='play') return pairLeaveAsk71b(); return newgame71b.apply(this,arguments); }; }
 if(typeof ACTIONS.swapst==='function'){ const swapst71b=ACTIONS.swapst;
  // wrap: the stations swap only while neither has an answer (the panel offers it only then; a crossed replay must follow the same rule)
  ACTIONS.swapst=function(){ if(S&&S.ck&&((S.ck.ans[0]||[]).length||(S.ck.ans[1]||[]).length)) return; return swapst71b.apply(this,arguments); }; }
 if(typeof ACTIONS.cookans==='function'){ const cookans71b=ACTIONS.cookans;
  // wrap: an answer that the station's current step does not have (it was swapped meanwhile) is ignored
  ACTIONS.cookans=function(d){ try{ const c=S&&S.ck, R=c&&RECIPES[c.r], i=+d.i, st=R&&R.st[c.st[i]], step=st&&st.steps[c.ans[i].length];
   if(!c||!step||!(+d.ix>=0&&+d.ix<step.o.length)) return; }catch(e){ return; } return cookans71b.apply(this,arguments); }; }
}
if(typeof openPanel==='function'){ const panel71b=openPanel;
 // wrap: remember which day a night panel was opened for
 openPanel=function(html){ if(typeof html==='string'&&/data-act="nextday"/.test(html)&&S) PAIR71B.nightDay=S.day; return panel71b.apply(this,arguments); };
}
if(typeof openMenu==='function'){ const openMenu71b=openMenu;
 // wrap: in two-phone play the Menu button says what it does now
 openMenu=function(){ const r=openMenu71b.apply(this,arguments); try{ if(pairOnline71b()&&panel&&panel.querySelectorAll) panel.querySelectorAll('[data-act="newconfirm"]').forEach(b=>{ b.textContent='Leave this household'; }); }catch(e){} return r; };
}
if(typeof sitStart==='function'){ const sitStart71b=sitStart;
 // wrap: a partner sitting down on their phone no longer seats this phone's own player (who then could not move)
 sitStart=function(){ if(pairOnline71b()&&typeof silentMode==='function'&&silentMode()) return; return sitStart71b.apply(this,arguments); };
}
function pairPhotoOk71b(src){ return typeof src==='string'&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(src); }
// the album's pictures from the phones' shared store: by id, and only a picture whose caption is the memory's (two pictures
// taken in the same instant can share an id)
async function pairLoadPhotos71b(){ if(!pairOnline71b()||!NET.db) return 0; const q=await NET.db.collection('households/'+NET.code+'/photos').get(); const by={};
 ((q&&q.docs)||[]).forEach(ds=>{ const d=ds.data?ds.data():ds; if(d&&pairPhotoOk71b(d.img)) by[ds.id]=d; });
 let n=0; for(const m of S.memories){ const d=m.pid&&!m.img&&by[m.pid]; if(d&&(d.caption===undefined||d.caption===m.caption)){ m.img=d.img; n++; } }
 if(n&&typeof trimPhotos==='function') trimPhotos(); return n; }
if(typeof openAlbum==='function'){ const openAlbum71b=openAlbum;
 // wrap: only real pictures are drawn, and in two-phone play the album fetches the pictures this phone has not got
 openAlbum=function(){
  if(S&&S.memories) S.memories.forEach(m=>{ if(m.img&&!pairPhotoOk71b(m.img)) delete m.img; });
  const r=openAlbum71b.apply(this,arguments);
  if(pairOnline71b()&&S&&S.memories&&S.memories.some(m=>m.pid&&!m.img)){
   pairLoadPhotos71b().then(n=>{ if(n&&overlayOpen()&&/Na We Two/.test(String(panel.innerHTML))) openAlbum71b(); }).catch(()=>{}); }
  return r; };
}

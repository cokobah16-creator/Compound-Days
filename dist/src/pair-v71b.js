/* v71b "Pair": two phones stay one household.

   The two-phone layer (index.html, "TWO PHONES: ROOM + SHARED STATE", and together-v47.js) replays each action on the
   other phone and lets the phone that writes the household (the host) send its copy to the other (the guest) as the
   repair. Running two copies of the game together (check/two-phones.cjs) showed where that came apart in ordinary
   play. Each wrap below closes one of those; none changes one-phone or companion play.

   1. The guest compared its count of ALL presses (panel closes included) with the host's and refused the host's
      household whenever its own was higher, which it already was after a normal join. Presses that are never sent
      no longer count, and a guest whose sent action did not arrive takes the host's household after a short wait.
   2. A household arriving while the joining player was still making a character wiped that screen's state: every
      choice threw an error and could revert. The character screen now survives it.
   3. A placed piece stayed "in the hands" on the other phone and came back as a free duplicate. The replay now puts
      the piece down there too; a placement the replaying phone cannot make sends an owned piece to storage.
   4. Both players pressing the one night button passed two days. A day change now names the day it ends.
   5. The sofa: each phone decided for itself that it was in, nothing was written while the host's panel stood open,
      and positions were never written in two-phone play. It now goes in once, as a shared action from the host; the
      household carries where the players, the sofa and the crate are; a partner who drops mid-carry sets it down.
   6. A phone that held the meeting point, slept, and woke to find the other phone holding it retried its old place
      for ever. It now joins whoever holds it.
   7. A device joining by code with no stored place took Player 2's seat even when a phone was already playing it.
      It now takes the seat nobody is using, and is turned away when both are in use.
   8. Smaller: the graphics-quality button and the lobby's back arrow were replayed on the partner's phone; the
      online Menu's "Start a new household" replaced the shared household instead of leaving it; one player sitting
      on the sofa seated the other phone's own player, who then could not move; album pictures never came back
      after reopening, and an album picture that is not an image is no longer drawn.

   Not changed here: which copy wins when two phones played apart (still the higher revision), who may send which
   action, the household code as the only key, and a piece on the cell inside the flat door shutting the flat (keeping
   that cell clear would change the home editor for every household). Those need decisions, not wraps. */
const PAIR71B={version:1,
 graceMs:1500,           // a host document that arrives this long after this phone's last sent action, still without it, means the action was lost
 nudgeMs:3000,           // ahead this long with no such document: ask the host to write
 seatSettleMs:300,       // a device joining by code reads who is playing this long after the holder has answered
 doc:null,docAt:-1e9,sentAt:-1e9,rxAt:-1e9,nudgedAt:-1e9,joining:false,resyncs:0,refused:0
};
function pairOnline71b(){ return typeof NET!=='undefined'&&!!NET&&!!NET.on; }

/* ---------- 1. the press count, and catching up ---------- */
if(typeof dispatch==='function'){ const dispatch71b=dispatch;
 // wrap: a press that is never sent does not raise this phone's action count; a day change carries the day it ends
 dispatch=function(name,data){
  if(!pairOnline71b()) return dispatch71b.call(this,name,data);
  const fn=ACTIONS[name], known=typeof fn==='function', local=known&&LOCAL_ONLY.has(name); let ran=false;
  if(name==='nextday'&&S){ data=Object.assign({},data||{}); if(data.from===undefined) data.from=S.day; }
  if(local) ACTIONS[name]=function(){ ran=true; return fn.apply(this,arguments); };   // did the base reach the action (and so count it)?
  let r; try{ r=dispatch71b.call(this,name,data); } finally{ if(local) ACTIONS[name]=fn; }
  if(local&&ran&&S&&S.aseq>0) S.aseq--;
  if(known&&!local) PAIR71B.sentAt=performance.now();
  return r;
 };
}
if(typeof applyRemote==='function'){ const applyRemote71b=applyRemote;
 // wrap: note when the other phone's last action arrived
 applyRemote=function(m){ if(m&&!m.sameTab) PAIR71B.rxAt=performance.now(); return applyRemote71b.apply(this,arguments); };
}
function pairSig71b(){ return S&&S.p?JSON.stringify([S.day,S.money,S.pantry,S.p.map(p=>p.basket||{}),S.home&&S.home.items,S.home&&S.home.storage,(S.dishes||[]).length,S.sofa&&S.sofa.state]):''; }
// The guest is ahead of the host's household: either its action is still on its way (wait) or it never arrived (take the host's).
function pairResync71b(){
 if(!pairOnline71b()||NET.isHost||!S||!S.p||S.setup||!(S.phase==='play'||NET.lobby)) return false;
 const d=PAIR71B.doc, now=performance.now(); if(!d||(d.aseq||0)>=(S.aseq||0)) return false;
 if((d.rev||0)>(S.rev||0)&&PAIR71B.docAt>=PAIR71B.rxAt&&PAIR71B.docAt-PAIR71B.sentAt>=PAIR71B.graceMs){
  const before=pairSig71b(); applyState(JSON.parse(JSON.stringify(d))); PAIR71B.resyncs++;
  if(S.phase==='play'&&pairSig71b()!==before) toast(`Back in step with ${pname(1-NET.myIndex)}’s phone. Your last change did not reach it.`);
  return true; }
 if(now-PAIR71B.sentAt>=PAIR71B.nudgeMs&&now-PAIR71B.nudgedAt>=PAIR71B.nudgeMs&&NET.otherOnline&&NET.room){ PAIR71B.nudgedAt=now; try{ NET.room.emit('hello',{slot:NET.myIndex}).catch(()=>{}); }catch(e){} }
 return false;
}

/* ---------- 2. the character screen survives a household from the other phone ---------- */
if(typeof applyState==='function'){ const applyState71b=applyState;
 // wrap: keep this phone's unfinished character (and its screen) when the other phone's household arrives
 applyState=function(d){
  const mine=pairOnline71b()&&S&&S.p&&S.setup&&S.phase!=='play'&&!(S.ready&&S.ready[NET.myIndex])?{setup:S.setup,me:S.p[NET.myIndex],lobby:NET.lobby}:null;
  if(mine) NET.lobby=false;                       // or the base draws the lobby over the character screen
  const r=applyState71b.apply(this,arguments);
  if(mine&&S&&S.p&&S.phase!=='play'){ NET.lobby=mine.lobby; if(!(S.ready&&S.ready[NET.myIndex])){ S.setup=mine.setup; S.p[NET.myIndex]=mine.me; } }
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
 // wrap (outermost, so no inner wrapper runs twice): a day change pressed on a day that has already ended does nothing
 ACTIONS.nextday=function(d){ if(d&&d.from!==undefined&&d.from!==null&&S&&+d.from!==S.day) return; return nextday71b.apply(this,arguments); };
}

/* ---------- 5. the sofa ---------- */
if(typeof sofaSuccess==='function'&&typeof ACTIONS!=='undefined'){ const sofaSuccess71b=sofaSuccess;
 // the sofa is in: one action, so both phones place it at the same moment with the same words, and the host writes it
 ACTIONS.sofaIn=function(d){ if(!sofa||!S||!S.sofa||S.sofa.state==='placed') return; if(d&&typeof d.bump==='number') sofa.bump=d.bump; return sofaSuccess71b.call(this); };
 SHARED_PANEL.add('sofaIn');
 // wrap: in two-phone play only the host's phone decides the sofa is in, and says so as a shared action
 sofaSuccess=function(){ if(!pairOnline71b()) return sofaSuccess71b.apply(this,arguments);
  if(NET.isHost&&S&&S.sofa&&S.sofa.state!=='placed') dispatch('sofaIn',{bump:(sofa&&sofa.bump)||0}); };
}
if(typeof stripState==='function'){ const strip71b=stripState;
 // wrap: the household the host writes says where the players, the sofa and the crate are (one-phone saves always did)
 stripState=function(){ const o=strip71b.apply(this,arguments);
  try{ if(pairOnline71b()&&o&&o.p&&o.phase==='play'&&players.length){ const r2=v=>Math.round(v*100)/100;
   o.p.forEach((p,i)=>{ const q=players[i]; if(q&&q.g) p.pos=[r2(q.g.position.x),r2(q.g.position.z)]; });
   if(sofa&&o.sofa&&o.sofa.state!=='placed'){ o.sofa.pos=[r2(sofa.g.position.x),r2(sofa.g.position.z)]; o.sofa.rot=r2(sofa.g.rotation.y); }
   if(crate&&o.crate) o.crate=[r2(crate.position.x),r2(crate.position.z)]; } }catch(e){}
  return o; };
}
// every frame in two-phone play: set the sofa down when the partner has gone, and let the guest catch up
function pairTick71b(dt,active){
 if(!pairOnline71b()||!S||!S.p) return;
 if(S.phase==='play'&&sofa&&sofa.carrying&&!NET.otherOnline&&typeof releaseSofa==='function'){ releaseSofa(); toast(`${pname(1-NET.myIndex)} is not connected, so the sofa is set down.`); }
 pairResync71b();
}
if(typeof netTick==='function'){ const netTick71b=netTick;
 // wrap: the two-phone tick also runs the catch-up and the sofa rule (no new per-frame hook: the hook list stays as it was)
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
 // wrap: keep the newest household this phone was sent (the base guard may have declined it), and seat a device that joins by code
 joinRoom=async function(code){
  PAIR71B.doc=null; PAIR71B.docAt=PAIR71B.sentAt=PAIR71B.rxAt=PAIR71B.nudgedAt=-1e9;
  const cacheKey='cd3-online-'+code; let hadCopy=true; try{ hadCopy=!!localStorage.getItem(cacheKey); }catch(e){}
  const r=await joinRoom71b.apply(this,arguments);
  try{ NET.unsubs.push(NET.docRef.onSnapshot(snap=>{ if(snap&&snap.exists){ const d=snap.data(); if(d&&d.p){ PAIR71B.doc=d; PAIR71B.docAt=performance.now(); } } })); }catch(e){}
  if(PAIR71B.joining){ const saved=netSaved(); if(!(saved&&saved.code===code)){
   const seats=await pairSeats71b();
   if(seats[0]&&seats[1]){ PAIR71B.refused++; pairQuit71b(); if(!hadCopy){ try{ localStorage.removeItem(cacheKey); }catch(e){} }
    throw new Error('That household already has two phones playing. If one of them is yours, close it there, wait a minute and try again.'); }
   if(seats[0]||seats[1]){ try{ localStorage.setItem('cd3-net',JSON.stringify({code,myIndex:seats[0]?1:0})); }catch(e){} } } }
  return r;
 };
}
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.netjoingo==='function'){ const netjoingo71b=ACTIONS.netjoingo;
 // wrap: mark a join by code, and once the seat is settled say which player this phone is (the lobby never did)
 ACTIONS.netjoingo=async function(){ PAIR71B.joining=true;
  try{ return await netjoingo71b.apply(this,arguments); }
  finally{ PAIR71B.joining=false; if(pairOnline71b()&&NET.room){ try{ NET.room.presence({slot:NET.myIndex,since:NET.since}).catch(()=>{}); }catch(e){} } } };
}

/* ---------- 8. smaller ---------- */
if(typeof LOCAL_ONLY!=='undefined'){ LOCAL_ONLY.add('quality'); LOCAL_ONLY.add('netlobby'); LOCAL_ONLY.add('pairleave71b'); }
if(typeof ACTIONS!=='undefined'){
 // leaving a two-phone household from the Menu: the household stays as it is on both phones; this phone goes to the title
 ACTIONS.pairleave71b=function(){ if(pairOnline71b()){ if(NET.isHost){ try{ writeState(); }catch(e){} } pairQuit71b(); } S=null; try{ location.reload(); }catch(e){} if(typeof openTitle==='function') openTitle(); };
 const pairLeaveAsk71b=function(){ const who=(S&&S.p&&S.p[1-NET.myIndex]&&S.p[1-NET.myIndex].name)||'your person';
  openPanel(`<h2>Leave this household?</h2><p>This is the household you share on two phones. It stays as it is, here and on ${esc(who)}’s phone, and <b>Continue together</b> on the title brings you back.</p><p class="muted">To start another household, leave first and choose it from the title.</p><div class="actions">${btn('Leave and go to the title','pairleave71b',{},'primary')}${btn('No, keep playing','close',{},'quiet')}</div>`); };
 if(typeof ACTIONS.newconfirm==='function'){ const newconfirm71b=ACTIONS.newconfirm;
  // wrap: in two-phone play "Start a new household" offers to leave; it no longer replaces the household both phones share
  ACTIONS.newconfirm=function(){ if(pairOnline71b()&&S&&S.phase==='play') return pairLeaveAsk71b(); return newconfirm71b.apply(this,arguments); }; }
 if(typeof ACTIONS.newgame==='function'){ const newgame71b=ACTIONS.newgame;
  // wrap: a new household is never started inside a two-phone room
  ACTIONS.newgame=function(){ if(pairOnline71b()&&S&&S.phase==='play') return pairLeaveAsk71b(); return newgame71b.apply(this,arguments); }; }
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
if(typeof openAlbum==='function'){ const openAlbum71b=openAlbum;
 // wrap: only real pictures are drawn, and in two-phone play the album fetches the pictures this phone has not got
 openAlbum=function(){
  if(S&&S.memories) S.memories.forEach(m=>{ if(m.img&&!pairPhotoOk71b(m.img)) delete m.img; });
  const r=openAlbum71b.apply(this,arguments);
  if(pairOnline71b()&&S&&S.memories&&S.memories.some(m=>m.pid&&!m.img)&&typeof netLoadPhotos==='function'){
   netLoadPhotos().then(n=>{ if(!n||!S||!S.memories) return; S.memories.forEach(m=>{ if(m.img&&!pairPhotoOk71b(m.img)) delete m.img; });
    if(overlayOpen()&&/Na We Two/.test(String(panel.innerHTML))) openAlbum71b(); }).catch(()=>{}); }
  return r; };
}

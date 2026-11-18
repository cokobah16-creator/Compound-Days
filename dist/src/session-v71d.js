/* v71d "Session log" and "Build check": what a phone saw of a two-phone session, and two phones on different builds.

   The session log. Each phone keeps a record of the two-phone connection as it saw it, so that a session on real
   phones that goes wrong can be reconstructed afterwards from the two phones' logs. It starts the first time this page
   starts or joins a household, and records only while this phone is in a two-phone room or joining one: one-phone and
   companion play are never recorded, and a phone that never plays on two phones writes nothing. It records:
     - the page: build, site, device, screen, time zone; opened (a reload), hidden and shown (a phone locking), closing,
       offline and online, no frame for a few seconds (paused or busy), every page error, and the errors the two-phone
       code catches (a replay or a household that throws while it is applied);
     - the room: each line the room code logs, with this phone's room id; each attempt to join or hold the meeting point
       and how it ended, and each retry; nothing heard from the other phone for five seconds, and when it is heard again;
     - who is who: which player this phone is, whether it writes the household or follows the host's, whether it
       holds the meeting point; the partner coming and going, and its build and site; another device in the room;
     - play: actions sent and received by name and number; households not taken (and why), taken from the other phone
       by a host, and a guest catching up with the host's (naming its actions that never arrived) or offering its own;
       the toasts and panels this phone showed;
     - every 30 seconds a status line (roles, partner, when it was last heard, its clock against this phone's, the
       household's revision and count, actions not yet heard by the host, what happened since, frames per second).
   A burst of one busy action (pushing the crate, every 0.12 s) is one line when it ends; the host's frequent writes,
   and households a guest refuses only because its own last action is still on the way, are counted in the status
   line; a line repeated within ten seconds gets a count. It keeps the newest 1500 lines (at most about 180 KB) for up
   to seven days in this phone's storage ("cd3-session71d"), so it survives a reload and a closed page; storage is
   written by its own timer, never inside a game call.
   Masked before a line is kept: every household code this phone knows (the one being joined, the stored ones, the
   one typed), in any letter case and its secret part alone, anything shaped like a household code, and the meeting
   point's name. The players' names do appear (in toasts). Text from the other phone (action names, builds, sites)
   is kept to known names and shapes, and control characters are removed, so it cannot forge lines or fill the log.
   Nothing leaves the phone unless the player saves, shares or copies it: "Session log" in the two-phone Menu, on the
   title screen while there is a log, and on the "Could not join" and "Could not reconnect" panels.

   The build check. Every phone's presence now carries its build (BUILD_ID), its site (location.host) and its clock.
   The preview and live sites share the same rooms, so two phones can meet on different builds. When the partner names
   another build, another site, or no build (a build from before this check), a banner says which and what to do:
   reload both, open the same address on both, or have the older phone reload. It is one short line at the top right
   (clear of the player card and the mission card) whose Details open the whole message, with Reload where reloading
   this phone helps. It never blocks play, toasts move below it, and once hidden it stays away until the page reloads.

   It changes no game logic and adds no per-frame hook: it wraps existing functions (the room's join, presence and
   emit, together47Room's connect, claim and rejoin, the game's joinRoom, applyState, applyRemote, writeState,
   together47Log, pairOnDoc71b, pairOffer71b, toast, toastSpot34b, openPanel, openMenu, openTitle and the two-phone
   tick, and console.warn for the errors it reports) and runs its own one-second timer. Nothing it records is part of the
   household. */
const SESSION71D={version:2,
 key:'cd3-session71d',
 maxLines:1500,          // lines kept
 maxBytes:180000,        // and at most this much in storage (the oldest go first)
 keepDays:7,             // lines older than this are dropped when the page opens
 flushMs:30000,          // storage is written by the one-second timer (never inside a game call): within a second after a
                         // room event, an error, a toast, a panel or a household decision, otherwise at most this often,
                         // and at once when the page is hidden or closed
 beatMs:30000,           // a status line this often during a two-phone session
 gapMs:2500,             // no frame for this long: the page was paused or busy
 quietMs:5000,           // nothing heard from the other phone for this long: said once, and when it is heard again
 lagMs:5000,             // a guest refusing the host's households only because its own action is on the way: said if it lasts
 runGapMs:1500,          // a burst of one busy action ends after this long without one
 gotPerSec:12,           // received actions listed per second at most (the rest are counted)
 showLines:30,           // lines shown on the panel
 build:typeof BUILD_ID!=='undefined'?BUILD_ID:'unknown',
 site:typeof location!=='undefined'&&location.host?String(location.host):'',
 lines:[],dropped:0,lastText:null,lastRep:0,lastAt:-1e9,armed:false,dirty:false,urgent:false,lastFlush:-1e9,lastBeat:-1e9,lastTick:null,
 frames:0,framesAt:null,pausedInBeat:false,codes:[],codesAt:-1e9,joining:false,joinCode:'',
 counts:{sent:0,got:0,taken:0,ignored:0,lag:0,wrote:0},runs:{},gotSec:{at:-1e9,n:0,over:0},unknown:0,unknownAt:-1e9,
 sent:new Map(),since:{},role:'',other:null,quiet:false,lagSince:null,lagSaid:false,partner:null,partnerLines:0,others:'',
 bannerKey:null,bannerText:'',bannerMsg:null,dismissed:false,banner:null
};
const sess71dNow=()=>typeof performance!=='undefined'&&performance.now?performance.now():0;
const SESS71D_BUILD=/^v\d{1,3}[a-z]?-[0-9a-f]{8}$/, SESS71D_SITE=/^[a-z0-9.-]{1,80}(:\d{1,5})?$/i;

/* ---------- masking ---------- */
function sess71dRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
// every household code this phone knows: the one in use, the one being joined, the stored place, the stored copies
function sess71dCodes(){ const L=SESSION71D, now=sess71dNow(); if(now-L.codesAt<10000) return L.codes; L.codesAt=now; const set=new Set();
 const add=c=>{ if(typeof c==='string'&&c.trim().length>=2&&!/^palm[-_. ]*$/i.test(c.trim())) set.add(c.trim()); };   // a bare "palm-" (the field's start) is not a code
 try{ add(typeof NET!=='undefined'&&NET?NET.code:''); }catch(e){} add(L.joinCode);
 try{ const s=typeof netSaved==='function'?netSaved():null; add(s&&s.code); }catch(e){}
 try{ if(typeof localStorage!=='undefined'&&typeof localStorage.length==='number'&&typeof localStorage.key==='function') for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.indexOf('cd3-online-')===0) add(k.slice(11)); } }catch(e){}
 L.codes=[...set]; return L.codes; }
// a code as a whole word, and its secret part (after the last separator) wherever it appears, in any letter case
// (the secret part as a word when it is short, so that a typed three-letter code does not garble ordinary words)
function sess71dMask(s){ let t=String(s).replace(/[\u0000-\u001f\u007f\u2028\u2029]/g,' ');
 t=t.replace(/compound-days-v47-[A-Za-z0-9_.-]+/g,'the meeting point').replace(/cd3-online-[A-Za-z0-9_.-]+/g,'cd3-online-****');
 t=t.replace(/palm[-_. ]?[a-hjkmnp-z2-9]{4}(?![a-z0-9])/gi,'palm-****');   // anything shaped like a code ("palm-" and four of its letters), first
 const word=w=>new RegExp('(^|[^A-Za-z0-9])'+sess71dRe(w)+'(?![A-Za-z0-9])','gi');
 for(const c of sess71dCodes()){ t=t.replace(word(c),'$1palm-****');
  const tail=c.split(/[-_. ]+/).filter(Boolean).pop(); if(tail&&tail.length>=3&&tail!==c&&!/^palm$/i.test(tail)) t=tail.length>=4?t.replace(new RegExp(sess71dRe(tail),'gi'),'****'):t.replace(word(tail),'$1****'); }
 return t; }

/* ---------- the log ---------- */
function sess71dLoad(){ const L=SESSION71D; try{ const raw=localStorage.getItem(L.key); if(!raw) return false; const o=JSON.parse(raw), cut=Date.now()-L.keepDays*864e5;
 if(!o||!Array.isArray(o.lines)) return false;
 L.lines=o.lines.filter(l=>Array.isArray(l)&&typeof l[0]==='number'&&typeof l[1]==='string'&&l[0]>=cut).map(l=>[l[0],sess71dMask(l[1]).slice(0,400)]);
 L.dropped=(+o.dropped||0)+(o.lines.length-L.lines.length);
 if(!L.lines.length){ try{ localStorage.removeItem(L.key); }catch(e){} return false; }   // nothing recent: the log is off again
 return true; }catch(e){ return false; } }
function sess71dFlush(){ const L=SESSION71D; if(!L.armed||!L.dirty) return; L.dirty=false; L.urgent=false; L.lastFlush=sess71dNow();
 try{ let o={v:2,dropped:L.dropped,lines:L.lines}, s=JSON.stringify(o);
  while(s.length>L.maxBytes&&L.lines.length>10){ const n=Math.ceil(L.lines.length/10); L.lines.splice(0,n); L.dropped+=n; o={v:2,dropped:L.dropped,lines:L.lines}; s=JSON.stringify(o); }
  localStorage.setItem(L.key,s); }catch(e){} }
// add a line once the log has started (masked here, so nothing unmasked is kept); now: written within a second
function sess71dAdd(text,now){ const L=SESSION71D; if(!L.armed) return; const s=sess71dMask(text).slice(0,400), t=Date.now(), last=L.lines[L.lines.length-1];
 if(last&&L.lastText===s&&t-L.lastAt<10000){ L.lastRep++; L.lastAt=t; last[1]=`${s} (x${L.lastRep})`; }
 else { L.lastText=s; L.lastRep=1; L.lastAt=t; L.lines.push([t,s]); if(L.lines.length>L.maxLines){ const n=L.lines.length-L.maxLines; L.lines.splice(0,n); L.dropped+=n; } }
 L.dirty=true; if(now) L.urgent=true; }
// this phone is in a two-phone room, or joining one: page, panel and toast lines are recorded only then
function sess71dLive(){ return SESSION71D.armed&&(SESSION71D.joining||(typeof NET!=='undefined'&&!!NET&&!!NET.on)); }
function sess71dArm(why){ const L=SESSION71D; if(L.armed) return; L.armed=true; L.dirty=true;
 const scr=typeof innerWidth!=='undefined'?`${innerWidth}x${innerHeight}`:'?', touch=typeof navigator!=='undefined'&&navigator.maxTouchPoints>0?'touch':'no touch';
 const ua=typeof navigator!=='undefined'?String(navigator.userAgent||'').slice(0,160):'', conn=typeof navigator!=='undefined'&&navigator.connection&&navigator.connection.effectiveType?', network '+navigator.connection.effectiveType:'';
 let tz=''; try{ const m=-new Date().getTimezoneOffset(); tz=`, time zone UTC${m<0?'-':'+'}${String(Math.floor(Math.abs(m)/60)).padStart(2,'0')}:${String(Math.abs(m)%60).padStart(2,'0')}`; }catch(e){}
 sess71dAdd(`session log on (${why}): build ${L.build}, site ${L.site||'?'}, screen ${scr}, ${touch}${conn}${tz}; ${ua}`,true); }
function sess71dWho(i){ return i===0||i===1?'P'+(i+1):'P?'; }
function sess71dRoom(){ return typeof TOGETHER47!=='undefined'&&TOGETHER47&&TOGETHER47.room?TOGETHER47.room:null; }
// the room has said who this phone is (a phone joining by code has no seat until it has looked at who is there)
function sess71dSettled(){ return typeof NET!=='undefined'&&!!NET&&NET.on&&!!NET.myPeer&&!(typeof PAIR71B!=='undefined'&&(PAIR71B.joining||PAIR71B.seating)); }
function sess71dRole(){ const R=sess71dRoom();
 return `${sess71dWho(NET.myIndex)}: ${NET.isHost?'writes the household':'follows the host’s household'}, ${R&&R.role==='hub'?'holds the meeting point':R&&R.role==='guest'?'joined the meeting point':'no meeting point yet'}`; }
// how long since this phone last heard the other (the room's own pings, every two seconds)
function sess71dHeard(){ const R=sess71dRoom(); if(!R) return null; const now=Date.now();
 if(R.role==='guest'&&R.hubConn&&R.hubSeen) return now-R.hubSeen;
 if(R.role==='hub'&&R.conns&&R.conns.size){ let best=null; R.conns.forEach(c=>{ if(c.seen47&&(best===null||now-c.seen47<best)) best=now-c.seen47; }); return best; }
 return null; }

/* ---------- the partner, and the build check ---------- */
// what the partner's presence says: its build ('' when it carries none: a build from before this check), site, clock
function sess71dPartner(){ if(typeof NET==='undefined'||!NET||!NET.on||!NET.otherOnline) return null; const p=NET.otherPres;
 if(!p||typeof p!=='object'||(p.slot!==0&&p.slot!==1)) return null;
 const b=typeof p.b==='string'?(SESS71D_BUILD.test(p.b)?p.b:'?'):'', h=typeof p.h==='string'&&p.h!==''?(SESS71D_SITE.test(p.h)?p.h:'?'):'';
 return {b,h,w:typeof p.w==='number'&&isFinite(p.w)?p.w:null,slot:p.slot,id:NET.otherPeer?String(NET.otherPeer).slice(0,40):''}; }
function sess71dDescribe(q){ return q.b===''?'a build from before the build check':q.b==='?'?'an unrecognised build':q.b+(q.h&&q.h!=='?'?' on '+q.h:''); }
function sess71dName(){ let n=''; try{ if(typeof pname==='function'&&typeof S!=='undefined'&&S&&S.p&&(NET.myIndex===0||NET.myIndex===1)) n=String(pname(1-NET.myIndex)||'').trim(); }catch(e){}
 const R=sess71dRoom(); let others=0; try{ if(R&&R.pres) R.pres.forEach((p,id)=>{ if(id!==R.myId) others++; }); }catch(e){}
 return others>1?'A device in this household':n?`${n}’s phone`:'The other phone'; }
// what is different, and what to do: null when the two match
function sess71dMismatch(q){ const L=SESSION71D, who=sess71dName(), them=who.replace(/’s phone$/,'');
 if(q.b===L.build&&(!q.h||!L.site||q.h===L.site)) return null;
 if(q.b==='') return {key:'old',reload:false,short:'Other phone is older',text:`${who} is running an older version of the game. ${them==='The other phone'||them==='A device in this household'?'Reload the page on that phone':them+' should reload the page there'}, then tap Continue together.`};
 if(q.b!=='?'&&q.h&&q.h!=='?'&&L.site&&q.h!==L.site) return {key:'site:'+q.h,reload:false,short:'Different sites',text:`${who} is on ${q.h}, this one on ${L.site}: two different versions of the game. Open the same address on both phones, then tap Continue together.`};
 if(q.b==='?'||q.h==='?') return {key:'odd',reload:true,short:'Unknown version',text:`${who} is running a version of the game this one does not recognise. Open the same address on both phones and reload, then tap Continue together.`};
 return {key:'build:'+q.b,reload:true,short:'Different versions',text:`${who} is running a different version of the game (this phone: ${L.build}, that one: ${q.b}). Reload the page on both phones, then tap Continue together.`}; }
// the notice is one short line at the top right, clear of the player card and the mission card; Details opens the whole
// message, with Reload where reloading this phone helps
function sess71dShowBanner(m){ const L=SESSION71D; if(typeof document==='undefined'||!document.body) return; L.bannerKey=m.key; L.bannerMsg=m;
 if(L.bannerText===m.short&&L.banner&&/ on$/.test(L.banner.className)) return; L.bannerText=m.short;
 let el=L.banner; if(!el){ el=document.createElement('div'); el.className='sess71d-ver'; el.setAttribute&&el.setAttribute('role','status'); L.banner=el; document.body.appendChild(el);
  if(el.addEventListener) el.addEventListener('click',e=>{ const t=e.target&&e.target.closest?e.target.closest('[data-sess71d]'):null; if(!t) return; const a=t.getAttribute('data-sess71d');
   if(a==='details') ACTIONS.sessver71d(); else if(a==='dismiss') ACTIONS.sessdismiss71d(); }); }
 el.innerHTML=`<span>${esc(m.short)}</span><button type="button" class="sess71d-b" data-sess71d="details">Details</button><button type="button" class="sess71d-x" data-sess71d="dismiss" aria-label="Hide this notice">×</button>`;
 el.className='sess71d-ver on'; }
function sess71dHideBanner(){ const L=SESSION71D; L.bannerKey=null; L.bannerText=''; L.bannerMsg=null; if(L.banner) L.banner.className='sess71d-ver'; }
function sess71dCheckPartner(){ const L=SESSION71D, q=sess71dPartner(); if(!q) return;
 const sig=q.b+'|'+q.h; if(!L.partner||L.partner.sig!==sig){ if(L.partnerLines<6){ L.partnerLines++;
   sess71dAdd(!sess71dMismatch(q)?`partner ${sess71dWho(q.slot)} on the same build (${q.b})${q.id?', room id '+q.id:''}`:`partner ${sess71dWho(q.slot)} on ${sess71dDescribe(q)} (this phone ${L.build} on ${L.site||'?'})${q.id?', room id '+q.id:''}`,true); }
  L.partner={sig}; }
 const m=sess71dMismatch(q); if(!m){ if(L.bannerKey!==null) sess71dHideBanner(); return; }
 if(L.dismissed) return; if(L.bannerKey!==m.key) sess71dAdd('told the player: '+m.text,true); sess71dShowBanner(m); }

/* ---------- the one-second look: who is who, the partner, silence, status, bursts, storage ---------- */
function sess71dEndRuns(force){ const L=SESSION71D, now=sess71dNow();
 for(const k of Object.keys(L.runs)){ const r=L.runs[k]; if(force||now-r.last>=L.runGapMs){ sess71dAdd(r.n>1?`${k} x${r.n} over ${((r.last-r.first)/1000).toFixed(1)} s`:k); delete L.runs[k]; } } }
function sess71dSecond(){ const L=SESSION71D; if(!L.armed) return; const now=sess71dNow();
 sess71dEndRuns(false);
 if(L.gotSec.over&&now-L.gotSec.at>=1000){ sess71dAdd(`... and ${L.gotSec.over} more actions received that second`); L.gotSec.over=0; }
 if(L.unknown&&now-L.unknownAt>=10000){ sess71dAdd(`got ${L.unknown} actions this build does not know`,true); L.unknown=0; L.unknownAt=now; }
 if(typeof NET!=='undefined'&&NET&&NET.on&&sess71dSettled()){
  const role=sess71dRole(); if(role!==L.role){ L.role=role; sess71dAdd('this phone is '+role,true); }
  const other=!!NET.otherOnline; if(other!==L.other){ L.other=other; sess71dAdd(other?'partner here':'partner away',true); if(!other){ L.partner=null; L.quiet=false; } }
  sess71dCheckPartner();
  const R=sess71dRoom(); try{ if(R&&R.pres){ const list=[]; R.pres.forEach((p,id)=>{ if(id!==R.myId) list.push(`${String(id).slice(0,40)} as ${sess71dWho(p&&p.slot)}`); }); const s=list.length>1?list.join('; '):'';
    if(s!==L.others){ L.others=s; if(s) sess71dAdd('more than one other device in the room: '+s,true); } } }catch(e){}
  const heard=sess71dHeard();
  if(heard!==null){ if(!L.quiet&&heard>L.quietMs){ L.quiet=true; sess71dAdd(`nothing heard from the other phone for ${(heard/1000).toFixed(0)} s`,true); }
   else if(L.quiet&&heard<2500){ sess71dAdd('heard from the other phone again',true); L.quiet=false; } }
  if(L.lagSince!==null&&now-L.lagSince>L.lagMs&&!L.lagSaid){ L.lagSaid=true; sess71dAdd(`the host's households have been behind this phone's own last action for ${((now-L.lagSince)/1000).toFixed(0)} s`,true); }
  if(now-L.lastBeat>=L.beatMs){ L.lastBeat=now; const c=L.counts, q=sess71dPartner(), S0=typeof S!=='undefined'&&S?S:null, P=typeof PAIR71B!=='undefined'?PAIR71B:null;
   let fps=''; if(L.framesAt!==null&&now>L.framesAt&&!L.pausedInBeat&&L.frames>0) fps=`; ${Math.round(L.frames*1000/(now-L.framesAt))} fps`; L.frames=0; L.framesAt=now; L.pausedInBeat=false;
   const off=q&&q.w!==null&&heard!==null&&heard<3000?(q.w-Date.now())/1000:null, clock=off!==null?`, its clock ${off>=0?'+':''}${off.toFixed(1)} s`:'';   // only from a fresh presence
   sess71dAdd(`status: ${sess71dRole()}; partner ${NET.otherOnline?'here':'away'}${heard!==null?`, last heard ${(heard/1000).toFixed(1)} s ago`:''}${clock}`+
    (S0?`; ${S0.phase||'?'} day ${S0.day||'?'}; household rev ${S0.rev||0} count ${S0.aseq||0}`:'')+(P&&!NET.isHost?`; not yet heard by the host: ${P.out.length}`:'')+
    `; since last: sent ${c.sent}, got ${c.got}, written ${c.wrote}, taken ${c.taken}, refused while this phone's action was on the way ${c.lag}, refused ${c.ignored}${fps}`);
   L.counts={sent:0,got:0,taken:0,ignored:0,lag:0,wrote:0}; } }
 else if(!(typeof NET!=='undefined'&&NET&&NET.on)&&L.role!==''){ L.role=''; L.other=null; L.partner=null; L.others=''; L.quiet=false; sess71dAdd('left the room',true); if(L.bannerKey!==null) sess71dHideBanner(); }
 if(L.dirty&&(L.urgent||now-L.lastFlush>L.flushMs)){ if(typeof requestIdleCallback==='function') requestIdleCallback(()=>sess71dFlush(),{timeout:800}); else sess71dFlush(); } }
if(typeof setInterval==='function') setInterval(()=>{ try{ sess71dSecond(); }catch(e){} },1000);

/* ---------- wraps ---------- */
if(sess71dLoad()){ SESSION71D.armed=true; sess71dAdd(`page opened: build ${SESSION71D.build}, site ${SESSION71D.site||'?'}`,true); }   // a recent log on this phone goes on
if(typeof together47Log==='function'){ const log71d=together47Log;
 // wrap: every line the room code logs; joining or holding the meeting point also names this phone's room id
 together47Log=function(s){ try{ const R=sess71dRoom(); sess71dAdd('room: '+s+(/^(joined|holding) /.test(String(s))&&R&&R.myId?` (this phone's room id ${String(R.myId).slice(0,40)})`:''),true); }catch(e){} return log71d.apply(this,arguments); };
}
if(typeof together47Room==='function'){ const room71d=together47Room;
 // wrap: each attempt to join or hold the meeting point and how it ended, and each retry after a drop
 together47Room=function(){ const R=room71d.apply(this,arguments);
  try{ const conn=R.connect, claim=R.claim, rejoin=R.rejoin;
   R.connect=async function(){ sess71dAdd('room: looking for the meeting point'); try{ return await conn.apply(this,arguments); }catch(e){ sess71dAdd(`room: could not join the meeting point (${e&&(e.type||e.message)||'?'})`,true); throw e; } };
   R.claim=async function(){ sess71dAdd('room: trying to hold the meeting point'); try{ return await claim.apply(this,arguments); }catch(e){ sess71dAdd(`room: could not hold the meeting point (${e&&(e.type||e.message)||'?'})`,true); throw e; } };
   R.rejoin=function(){ const had=!!R.retryT, r=rejoin.apply(this,arguments); if(!had&&R.retryT&&!R.closed) sess71dAdd(`room: trying again in ${(Math.min(8000,1200*Math.pow(1.6,Math.max(0,R.retryN-1)))/1000).toFixed(1)} s (attempt ${R.retryN})`); return r; };
  }catch(e){}
  return R; };
}
// the room this phone joins carries its build, site and clock in every presence; its sent actions are logged
function sess71dWrapRoomNs(){ if(typeof NET==='undefined'||!NET||!NET.roomNs||typeof NET.roomNs.join!=='function'||NET.roomNs.join.sess71d) return; const join71d=NET.roomNs.join;
 NET.roomNs.join=async function(){ const api=await join71d.apply(this,arguments);
  try{ if(api&&typeof api.presence==='function'&&!api.presence.sess71d){ const pres=api.presence;
    api.presence=function(p){ return pres.call(this,Object.assign({},p||{},{b:SESSION71D.build,h:SESSION71D.site,w:Date.now()})); }; api.presence.sess71d=true; }
   if(api&&typeof api.emit==='function'&&!api.emit.sess71d){ const emit=api.emit;
    api.emit=function(type,m){ try{ sess71dSent(type,m); }catch(e){} return emit.apply(this,arguments); }; api.emit.sess71d=true; } }catch(e){}
  return api; };
 NET.roomNs.join.sess71d=true; }
sess71dWrapRoomNs();
const SESS71D_BUSY=new Set(['pushpos']);   // pushing the crate or the cooler: an action every 0.12 s
function sess71dAct(a){ return a.name==='hs'&&a.data&&typeof a.data.id==='string'?'hs '+a.data.id.slice(0,24):String(a.name); }
function sess71dRun(k){ const L=SESSION71D, now=sess71dNow(), r=L.runs[k]||(L.runs[k]={n:0,first:now,last:now}); r.n++; r.last=now; }
function sess71dSent(type,m){ const L=SESSION71D; if(!L.armed) return;
 if(type==='act'&&m){ L.counts.sent++; const n=m.data&&Array.isArray(m.data._p71)?m.data._p71[1]:null;
  if(n!==null){ L.sent.set(n,sess71dAct(m)); if(L.sent.size>400) L.sent.delete(L.sent.keys().next().value); }
  if(SESS71D_BUSY.has(m.name)) sess71dRun('sent '+m.name); else sess71dAdd(`sent ${sess71dAct(m)}${n!==null?' #'+n:''}`); }
 else if(type==='hello'&&!NET.isHost&&typeof PAIR71B!=='undefined'&&PAIR71B.out.length) sess71dAdd('asked the host to write (this phone has actions it has not heard back about)'); }
if(typeof joinRoom==='function'){ const joinRoom71d=joinRoom;
 // wrap: starting or joining a household starts the log; how the join went
 joinRoom=async function(code){ const L=SESSION71D; L.joinCode=String(code||''); L.codesAt=-1e9; sess71dArm('a two-phone household'); sess71dWrapRoomNs();
  const t0=sess71dNow(); L.joining=true; L.role=''; L.other=null; L.partner=null; L.partnerLines=0; L.others=''; L.quiet=false; L.lagSince=null; L.lagSaid=false; L.since={};
  sess71dAdd(`joining household palm-**** (${String(code||'').length} characters typed)`,true); let r;
  try{ r=await joinRoom71d.apply(this,arguments); }catch(e){ L.joining=false; sess71dAdd(`join failed after ${Math.round(sess71dNow()-t0)} ms: ${e&&e.message||e}`,true); throw e; }
  L.joining=false; sess71dAdd(`in the room after ${Math.round(sess71dNow()-t0)} ms`,true); return r; };
}
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.netjoingo==='function'){ const netjoingo71d=ACTIONS.netjoingo;
 // wrap: the code as typed is masked even before the join begins
 ACTIONS.netjoingo=async function(){ try{ const el=typeof document!=='undefined'&&document.getElementById('jc'); if(el&&el.value){ SESSION71D.joinCode=String(el.value).trim(); SESSION71D.codesAt=-1e9; } }catch(e){}
  return netjoingo71d.apply(this,arguments); };
}
if(typeof pairOnDoc71b==='function'){ const doc71d=pairOnDoc71b;
 // wrap: every household that reaches this phone, after the base has decided whether to take it: refused and why (a guest
 // whose own last action is still on the way refuses the host's households for a moment: counted), and a guest catching
 // up with the host's household, naming its actions that never arrived
 pairOnDoc71b=function(d){ const L=SESSION71D; let pre=null;
  try{ if(L.armed&&d&&d.p&&typeof S!=='undefined'&&S&&S.p){ pre={out:typeof PAIR71B!=='undefined'?PAIR71B.out.map(o=>o.n):[],res:typeof PAIR71B!=='undefined'?PAIR71B.resyncs:0};
    if((S.rev||0)===(d.rev||0)&&(S.aseq||0)===(d.aseq||0)){ L.counts.taken++; L.lagSince=null; L.lagSaid=false; }
    else { const older=(d.rev||0)<=(S.rev||0), fewer=(d.aseq||0)<(S.aseq||0);
     if(!older&&fewer&&!NET.isHost&&typeof PAIR71B!=='undefined'&&PAIR71B.out.length){ L.counts.lag++; if(L.lagSince===null) L.lagSince=sess71dNow(); }
     else { L.counts.ignored++; sess71dAdd(`household rev ${d.rev||0} count ${d.aseq||0} not taken: this phone has rev ${S.rev||0} count ${S.aseq||0}${older?' (not newer)':''}${fewer?' (fewer actions)':''}`,true); } } } }catch(e){}
  const r=doc71d.apply(this,arguments);
  try{ if(pre&&typeof PAIR71B!=='undefined'&&PAIR71B.resyncs>pre.res){ const names=pre.out.map(n=>`${L.sent.get(n)||'?'} #${n}`);
    sess71dAdd(`caught up with the host's household (rev ${d.rev||0} count ${d.aseq||0}); never reached the host: ${names.join(', ')||'nothing listed'}`,true); } }catch(e){}
  return r; };
}
if(typeof pairOffer71b==='function'){ const offer71d=pairOffer71b;
 // wrap: a guest offering its own household (it played on alone while the host, who did nothing meanwhile, had no signal)
 pairOffer71b=function(d){ const r=offer71d.apply(this,arguments);
  try{ sess71dAdd(`offered this phone's household as the newer copy: the host did nothing since (its rev ${d&&d.rev||0}); this phone's is now rev ${typeof S!=='undefined'&&S?S.rev||0:'?'}`,true); }catch(e){} return r; };
}
if(typeof applyState==='function'){ const applyState71d=applyState;
 // wrap: a host taking the other phone's household (it replaces this phone's own)
 applyState=function(d){ const L=SESSION71D, pre=L.armed&&typeof S!=='undefined'&&S&&S.p&&sess71dSettled()&&NET.isHost&&!L.joining?{rev:S.rev||0,aseq:S.aseq||0}:null;
  const r=applyState71d.apply(this,arguments);
  try{ if(pre&&d&&d.p&&typeof S!=='undefined'&&S===d) sess71dAdd(`took the other phone's household (rev ${d.rev||0} count ${d.aseq||0}) over this phone's (rev ${pre.rev} count ${pre.aseq})`,true); }catch(e){}
  return r; };
}
if(typeof applyRemote==='function'){ const applyRemote71d=applyRemote;
 // wrap: actions the other phone sent (only names this build knows; at most a dozen lines a second)
 applyRemote=function(m){ try{ const L=SESSION71D; if(m&&!m.sameTab&&m.data&&L.armed){ const a=m.data; L.counts.got++;
   const known=typeof a.name==='string'&&typeof ACTIONS!=='undefined'&&Object.prototype.hasOwnProperty.call(ACTIONS,a.name)&&typeof ACTIONS[a.name]==='function'&&!(typeof LOCAL_ONLY!=='undefined'&&LOCAL_ONLY.has(a.name));
   const p=a.data&&Array.isArray(a.data._p71)?a.data._p71:null, n=p&&typeof p[1]==='number'?p[1]:null, who=sess71dWho(a.src);
   if(!known){ L.unknown++; }
   else { if(p&&typeof p[0]==='number'&&L.since[who]!==p[0]){ if(L.since[who]!==undefined) sess71dAdd(`${who} started a new session: its action numbers start again`); L.since[who]=p[0]; }
    if(SESS71D_BUSY.has(a.name)) sess71dRun('got '+a.name+' from '+who);
    else { const now=sess71dNow(); if(now-L.gotSec.at>=1000){ L.gotSec.at=now; L.gotSec.n=0; }
     if(++L.gotSec.n<=L.gotPerSec) sess71dAdd(`got ${sess71dAct(a)}${n!==null?' #'+n:''} from ${who}`); else L.gotSec.over++; } } } }catch(e){}
  return applyRemote71d.apply(this,arguments); };
}
if(typeof writeState==='function'){ const writeState71d=writeState;
 // wrap: households this phone writes (the host writes about once a second while things change: counted in the status line)
 writeState=async function(){ const before=typeof S!=='undefined'&&S?S.rev||0:0; const r=await writeState71d.apply(this,arguments);
  try{ if(SESSION71D.armed&&typeof S!=='undefined'&&S&&(S.rev||0)>before) SESSION71D.counts.wrote++; }catch(e){} return r; };
}
if(typeof toast==='function'){ const toast71d=toast;
 // wrap: what this phone told its player during a two-phone session (replays are silent and show nothing)
 toast=function(t){ try{ if(sess71dLive()&&!(typeof silentMode==='function'&&silentMode())) sess71dAdd('toast: '+t,true); }catch(e){} return toast71d.apply(this,arguments); };
}
// a panel title as text (the joining titles carry the typed code, so they are named, not quoted)
function sess71dTitle(h){ const t=h.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
 return /^Joining\b/.test(t)?'Joining a household':/^Finding\b/.test(t)?'Finding the household':t.slice(0,80); }
const SESS71D_FAIL=/^(Could not join|Could not reconnect|Could not open a room)$/;
if(typeof openPanel==='function'){ const panel71d=openPanel;
 // wrap: panels this phone showed during a two-phone session, by title; a failed join or reconnect offers the log
 openPanel=function(html){ let h=html;
  try{ if(SESSION71D.armed&&typeof html==='string'&&!(typeof silentMode==='function'&&silentMode())){ const m=html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/), title=m?sess71dTitle(m[1]):'';
    if(m&&title!=='Session log'&&sess71dLive()) sess71dAdd('panel: '+title,true);
    if(m&&SESS71D_FAIL.test(title)){ sess71dFlush(); h=html.replace(/(<div class="actions">)/,`$1${btn('Session log','sesslog71d',{},'quiet')}`); } } }catch(e){}
  return panel71d.call(this,h); };
}
function sess71dMenuLine(){ return `<p class="tiny sess71d-m">${btn('Session log','sesslog71d',{},'quiet')} What this phone saw of the two-phone connection, to send if something went wrong.</p>`; }
if(typeof openMenu==='function'){ const menu71d=openMenu;
 // wrap: the two-phone Menu offers the log
 openMenu=function(){ const r=menu71d.apply(this,arguments);
  try{ if(SESSION71D.armed&&SESSION71D.lines.length&&typeof NET!=='undefined'&&NET.on&&!(typeof silentMode==='function'&&silentMode())&&panel&&panel.insertAdjacentHTML) panel.insertAdjacentHTML('beforeend',sess71dMenuLine()); }catch(e){}
  return r; };
}
if(typeof openTitle==='function'){ const title71d=openTitle;
 // wrap: the title screen offers the log while there is one (after a session that went wrong, the page opened again)
 openTitle=function(){ const r=title71d.apply(this,arguments);
  try{ if(SESSION71D.armed&&SESSION71D.lines.length&&panel&&panel.querySelector){ const card=panel.querySelector('#titlemark'); if(card&&card.insertAdjacentHTML) card.insertAdjacentHTML('beforeend',sess71dMenuLine()); } }catch(e){}
  return r; };
}
if(typeof netTick==='function'){ const netTick71d=netTick;
 // wrap: frames, and a long gap between two of them (the two-phone tick runs every frame of two-phone play)
 netTick=function(){ const r=netTick71d.apply(this,arguments);
  try{ const L=SESSION71D; if(L.armed&&typeof NET!=='undefined'&&NET.on){ const now=sess71dNow(); if(L.lastTick!==null&&now-L.lastTick>L.gapMs){ L.pausedInBeat=true; sess71dAdd(`no frame for ${((now-L.lastTick)/1000).toFixed(1)} s (the page was paused or busy)`,true); } L.lastTick=now; L.frames++; } else SESSION71D.lastTick=null; }catch(e){}
  return r; };
}
if(typeof toastSpot34b==='function'){ const spot71d=toastSpot34b;
 // wrap: a toast is drawn below the version banner, not under it
 toastSpot34b=function(){ const r=spot71d.apply(this,arguments);
  try{ const L=SESSION71D, t=typeof document!=='undefined'&&document.getElementById('toast'); if(L.bannerKey!==null&&L.banner&&t&&t.style&&typeof t.getBoundingClientRect==='function'&&typeof L.banner.getBoundingClientRect==='function'){
    const b=L.banner.getBoundingClientRect(), q=t.getBoundingClientRect(); if(b.height>0&&q.top<b.bottom+6) t.style.top=Math.round(b.bottom+8)+'px'; } }catch(e){}
  return r; };
}
if(typeof console!=='undefined'&&console&&typeof console.warn==='function'){ const warn71d=console.warn;
 // wrap: the errors the two-phone code catches and only warns about (a replay that throws on this phone, a household or
 // an event that throws while it is applied)
 console.warn=function(){ try{ const a=arguments, w=typeof a[0]==='string'?a[0]:''; if(sess71dLive()&&/^(remote action failed|together47 )/.test(w)){ const e=[...a].slice(1).map(x=>x&&x.message?x.message:String(x)).join(' ');
   sess71dAdd(`error caught: ${w} ${e}`.slice(0,300),true); } }catch(x){} return warn71d.apply(this,arguments); };
}
if(typeof window!=='undefined'&&window.addEventListener){
 window.addEventListener('error',e=>{ try{ if(sess71dLive()) sess71dAdd(`page error: ${e&&e.message||'?'}${e&&e.filename?' at '+String(e.filename).split('/').pop()+':'+e.lineno:''}`,true); }catch(x){} });
 window.addEventListener('unhandledrejection',e=>{ try{ if(sess71dLive()){ const r=e&&e.reason; sess71dAdd('unhandled: '+(r&&r.message||r),true); } }catch(x){} });
 window.addEventListener('online',()=>{ if(sess71dLive()) sess71dAdd('browser: online',true); });
 window.addEventListener('offline',()=>{ if(sess71dLive()) sess71dAdd('browser: offline',true); });
 window.addEventListener('pagehide',()=>{ if(sess71dLive()) sess71dAdd('page closing'); sess71dEndRuns(true); SESSION71D.dirty=SESSION71D.armed; sess71dFlush(); });
}
if(typeof document!=='undefined'&&document.addEventListener) document.addEventListener('visibilitychange',()=>{ if(sess71dLive()) sess71dAdd(document.hidden?'page hidden':'page shown'); if(document.hidden){ sess71dEndRuns(true); SESSION71D.dirty=SESSION71D.armed; sess71dFlush(); } });

/* ---------- the panel: show, save, share, copy, clear ---------- */
function sess71dTime(t){ try{ return new Date(t).toISOString().replace('T',' ').slice(0,23); }catch(e){ return String(t); } }
function sess71dText(){ const L=SESSION71D, ua=typeof navigator!=='undefined'?String(navigator.userAgent||''):'';
 return [`Compound Days session log`,`Build: ${L.build}`,`Site: ${L.site||'?'}`,`Saved: ${sess71dTime(Date.now())} UTC`,`Device: ${ua}`,`Times are UTC. Lines: ${L.lines.length}${L.dropped?`, ${L.dropped} earlier lines dropped`:''}`,'']
  .concat(L.lines.map(l=>`${sess71dTime(l[0])}  ${l[1]}`)).join('\n')+'\n'; }
function sess71dFileName(){ return `compound-days-session-${SESSION71D.build}-${sess71dTime(Date.now()).slice(0,16).replace(/[ :]/g,'-')}.txt`; }
function sess71dBack(){ return typeof S!=='undefined'&&S&&S.phase==='play'&&typeof players!=='undefined'&&players.length?'menubtn':'title'; }
if(typeof ACTIONS!=='undefined'){
 ACTIONS.sesslog71d=function(d){ const L=SESSION71D; sess71dEndRuns(true); sess71dFlush(); const n=L.lines.length, first=n?sess71dTime(L.lines[0][0]).slice(0,16):'';
  const last=L.lines.slice(-L.showLines).map(l=>`${sess71dTime(l[0]).slice(11,19)}  ${l[1]}`).join('\n');
  const share=typeof navigator!=='undefined'&&typeof navigator.share==='function';
  openPanel(`<h2>Session log</h2><p class="small">What this phone saw of the two-phone connection: ${n} line${n===1?'':'s'}${n?` since ${esc(first)} (UTC)`:''}${L.dropped?`, ${L.dropped} older lines dropped`:''}. It does not include the household code; the players’ names appear. It is kept on this phone for up to seven days, and nothing is sent anywhere unless you save, share or copy it.</p>${d&&d.note?`<p class="small"><b>${esc(d.note)}</b></p>`:''}<pre class="sess71d-pre">${esc(last||'Nothing yet.')}</pre><div class="actions">${btn('Save as a file','sesssave71d',{},'primary block')}${share?btn('Share','sessshare71d',{},'block'):''}${btn('Copy','sesscopy71d',{},'quiet')}${btn('Clear the log','sessclear71d',{},'quiet')}${btn('Back',sess71dBack(),{},'quiet')}</div>`); };
 ACTIONS.sesssave71d=function(){ try{ const text=sess71dText(), blob=new Blob([text],{type:'text/plain'}), url=URL.createObjectURL(blob), a=document.createElement('a');
   a.href=url; a.download=sess71dFileName(); if(document.body&&document.body.appendChild) document.body.appendChild(a); if(a.click) a.click(); if(a.remove) a.remove();
   setTimeout(()=>{ try{ URL.revokeObjectURL(url); }catch(e){} },30000); SESSION71D.saved=(SESSION71D.saved||0)+1; toast('Session log saved.'); }
  catch(e){ ACTIONS.sesslog71d({note:'This browser could not save a file. Use Copy instead.'}); } };
 ACTIONS.sessshare71d=async function(){ const text=sess71dText(), name=sess71dFileName();
  try{ let file=null; try{ file=new File([text],name,{type:'text/plain'}); }catch(e){}
   if(file&&navigator.canShare&&navigator.canShare({files:[file]})) await navigator.share({files:[file],title:'Compound Days session log'});
   else await navigator.share({title:'Compound Days session log',text}); }
  catch(e){ if(!(e&&e.name==='AbortError')) ACTIONS.sesslog71d({note:'Sharing did not work here. Save it as a file or copy it instead.'}); } };
 ACTIONS.sesscopy71d=function(){ const text=sess71dText(), shown=()=>openPanel(`<h2>Session log</h2><p class="small">Copying is not available here; select the text below and copy it.</p><pre class="sess71d-pre">${esc(text)}</pre><div class="actions">${btn('Back','sesslog71d',{},'primary block')}</div>`);
  try{ if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(()=>toast('Session log copied.'),shown); else shown(); }catch(e){ shown(); } };
 ACTIONS.sessclear71d=function(){ const L=SESSION71D; L.lines=[]; L.dropped=0; L.lastText=null; L.runs={}; L.dirty=true; sess71dFlush(); sess71dAdd('log cleared',true); ACTIONS.sesslog71d({note:'Cleared.'}); };
 ACTIONS.sessreload71d=function(){ sess71dAdd('reload pressed on the version notice'); SESSION71D.dirty=SESSION71D.armed; sess71dFlush(); try{ location.reload(); }catch(e){} };
 ACTIONS.sessver71d=function(){ const m=SESSION71D.bannerMsg; if(!m) return;
  openPanel(`<h2>Two versions of the game</h2><p>${esc(m.text)}</p><p class="small muted">Until then the two phones can disagree about the household.</p><div class="actions">${m.reload?btn('Reload this phone','sessreload71d',{},'primary block'):''}${btn('Hide this notice','sessdismiss71d',{},m.reload?'quiet':'primary block')}${btn('Close','close',{},'quiet')}</div>`); };
 ACTIONS.sessdismiss71d=function(){ const L=SESSION71D; if(L.bannerKey!==null) sess71dAdd('version notice hidden (until the page reloads)',true); L.dismissed=true; sess71dHideBanner();
  try{ if(typeof overlayOpen==='function'&&overlayOpen()&&/Two versions of the game/.test(String(panel.innerHTML))) closePanel(); }catch(e){} };
 if(typeof ACTIONS.menubtn!=='function') ACTIONS.menubtn=()=>openMenu();
}
// these buttons are this phone's only: a replay would open the panel, save or clear on the partner's phone
if(typeof LOCAL_ONLY!=='undefined') ['sesslog71d','sesssave71d','sessshare71d','sesscopy71d','sessclear71d','sessreload71d','sessdismiss71d','sessver71d'].forEach(a=>LOCAL_ONLY.add(a));

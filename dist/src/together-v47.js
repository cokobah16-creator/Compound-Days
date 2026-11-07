/* v47 "Together": play on two phones from the public site again.

   The two-phone mode (index.html, "TWO PHONES: ROOM + SHARED STATE") was written against a host that hands the
   page a room (emit / on / presence / onPeers) and a document store (doc().get / set / onSnapshot, collection().get)
   through window.claude.use(). The static site on Vercel has no such host, so netDetect() never set NET.capable and
   the title never showed "Play on two phones". This module gives NET the same two objects, carried phone to phone
   over WebRTC with PeerJS (assets/vendor/peerjs-1.5.4.min.js, MIT, loaded only when someone starts or joins).

   How the room works:
   - The household code names a meeting point, "compound-days-v47-<code>". The first phone there holds it (the hub);
     the other connects to it. The hub relays events and presence and keeps the household document.
   - Each phone keeps its own copy of the household (localStorage "cd3-online-<code>"), so either phone can open the
     household again later, even if the other is not there; when both are back, the newer copy (higher rev) wins.
   - If the hub phone drops, the other phone takes the meeting point over and carries on; the first phone rejoins.
   - Signalling uses the free PeerJS cloud server and its STUN/TURN defaults. "?peer=host:port" points it at another
     PeerJS server (the browser check runs a local one).

   It changes no game logic: NET's own code still decides who writes the household, how actions replay and what is
   shared. It does nothing where the page already has a host room (window.claude), or outside a browser. */
const TOGETHER47={
 lib:'assets/vendor/peerjs-1.5.4.min.js',
 prefix:'compound-days-v47-',
 creating:null,          // the code this phone just generated with "Start a household"
 room:null,              // the live room, for the browser check
 photoKeep:12,           // photos kept per household on each phone
 silentMs:30000,         // a side silent this long is gone (v49: was 15 s, too short while a phone builds the world)
 log:[]
};
function together47Log(s){ const L=TOGETHER47.log; L.push(s); if(L.length>60) L.shift(); }
function together47Supported(){
 return typeof window!=='undefined'&&typeof document!=='undefined'&&typeof document.createElement==='function'&&
  typeof RTCPeerConnection==='function'&&typeof WebSocket==='function'&&!(window.claude&&typeof window.claude.use==='function');
}
function together47PeerLib(){
 if(window.Peer) return Promise.resolve(window.Peer);
 if(TOGETHER47.libP) return TOGETHER47.libP;
 TOGETHER47.libP=new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=TOGETHER47.lib;
  s.onload=()=>window.Peer?res(window.Peer):rej(new Error('The connection library did not start.'));
  s.onerror=()=>{ TOGETHER47.libP=null; rej(new Error('Could not load the connection library. Check the connection and try again.')); };
  document.head.appendChild(s); });
 return TOGETHER47.libP;
}
function together47PeerOpts(){
 const o={debug:0};
 try{ const q=new URLSearchParams(location.search).get('peer'); if(q){ const m=q.match(/^([^:\/]+)(?::(\d+))?$/); if(m){ o.host=m[1]; o.port=+(m[2]||9000); o.path='/'; o.secure=location.protocol==='https:'&&m[1]!=='localhost'&&m[1]!=='127.0.0.1'; } } }catch(e){}
 return o;
}
function together47Id(code){ return TOGETHER47.prefix+String(code).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
/* --- this phone's copy of a household --- */
function together47CacheKey(code){ return 'cd3-online-'+code; }
function together47ReadCache(code){ try{ const r=JSON.parse(localStorage.getItem(together47CacheKey(code))||'null'); if(r&&r.docs) return r; }catch(e){} return {docs:{}}; }
function together47WriteCache(code,store){
 try{ const docs=store.docs, photos=Object.keys(docs).filter(p=>p.indexOf('/photos/')>0).sort((a,b)=>((docs[a]&&docs[a].t)||0)-((docs[b]&&docs[b].t)||0));
  while(photos.length>TOGETHER47.photoKeep) delete docs[photos.shift()];
  localStorage.setItem(together47CacheKey(code),JSON.stringify({docs,at:Date.now()})); }catch(e){ together47Log('cache write failed'); }
}
function together47Newer(a,b){ // is document a at least as new as b (b may be missing)
 if(!b) return true; if(!a) return false; return (a.rev||0)>=(b.rev||0);
}
/* --- the room --- */
function together47Room(code){
 const R={code,hubId:together47Id(code),peer:null,role:null,myId:null,myPres:{},conns:new Map(),pres:new Map(),hubConn:null,
  on:{},peersCbs:new Set(),snaps:new Map(),pending:new Map(),rid:0,closed:false,store:together47ReadCache(code),saveT:null,retryT:null,retryN:0};
 TOGETHER47.room=R;
 const docPath='households/'+code;
 const persist=()=>{ if(R.saveT) return; R.saveT=setTimeout(()=>{ R.saveT=null; together47WriteCache(code,R.store); },1500); };
 const peersNow=()=>{ const list=[{kind:'viewer',peer:R.myId,isMe:true,sameTab:true,presence:R.myPres}];
  R.pres.forEach((p,id)=>{ if(id!==R.myId) list.push({kind:'viewer',peer:id,isMe:false,sameTab:false,presence:p}); }); return {peers:list}; };
 const peersChanged=()=>{ const ch=peersNow(); R.peersCbs.forEach(fn=>{ try{ fn(ch); }catch(e){ console.warn('together47 peers',e); } }); };
 const deliver=(type,data,from)=>{ const set=R.on[type]; if(!set) return; set.forEach(fn=>{ try{ fn({data,sameTab:false,peer:from}); }catch(e){ console.warn('together47 event',type,e); } }); };
 const fireSnap=(path)=>{ const set=R.snaps.get(path); if(!set) return; const d=R.store.docs[path]; set.forEach(s=>{ try{ s.cb({exists:!!d,data:()=>d?JSON.parse(JSON.stringify(d)):undefined,id:path.split('/').pop()}); }catch(e){ console.warn('together47 snapshot',e); } }); };
 const send=(conn,m)=>{ try{ if(conn&&conn.open) conn.send(m); }catch(e){ together47Log('send failed '+(e&&e.message)); } };
 const toGuests=(m,except)=>{ R.conns.forEach((c,id)=>{ if(id!==except) send(c,m); }); };
 // a document arrives (from a set here or there); returns true when it was taken
 const take=(path,doc,remote)=>{ if(path===docPath&&!together47Newer(doc,R.store.docs[path])) return false;
  R.store.docs[path]=doc; persist(); if(remote) fireSnap(path); return true; };
 /* hub side */
 const hubMessage=(id,m)=>{ if(!m||typeof m!=='object') return;
  if(m.t==='ev'){ deliver(m.type,m.data,id); toGuests(m,id); }
  else if(m.t==='pres'){ R.pres.set(id,m.p||{}); toGuests({t:'pres',from:id,p:m.p||{}},id); peersChanged(); }
  else if(m.t==='set'){ if(take(m.path,m.doc,true)) toGuests({t:'doc',path:m.path,doc:m.doc},id); }
  else if(m.t==='sync'){ if(m.doc&&take(docPath,m.doc,true)) toGuests({t:'doc',path:docPath,doc:m.doc},id); const d=R.store.docs[docPath]; if(d) send(R.conns.get(id),{t:'doc',path:docPath,doc:d}); }
  else if(m.t==='get'){ send(R.conns.get(id),{t:'got',rid:m.rid,doc:R.store.docs[m.path]||null}); }
  else if(m.t==='list'){ const pre=m.path+'/', out=[]; for(const p in R.store.docs) if(p.indexOf(pre)===0&&p.slice(pre.length).indexOf('/')<0) out.push({id:p.slice(pre.length),doc:R.store.docs[p]}); send(R.conns.get(id),{t:'listed',rid:m.rid,docs:out}); }
 };
 const hubAccept=(conn)=>{ conn.on('open',()=>{ conn.seen47=Date.now(); R.conns.set(conn.peer,conn); together47Log('guest in '+conn.peer);
   const pres=[[R.myId,R.myPres]]; R.pres.forEach((p,id)=>{ if(id!==conn.peer) pres.push([id,p]); });
   send(conn,{t:'hello',hub:R.myId,pres}); });
  conn.on('data',m=>{ conn.seen47=Date.now(); hubMessage(conn.peer,m); });
  const gone=()=>{ if(R.conns.get(conn.peer)!==conn) return; try{ conn.close(); }catch(e){} R.conns.delete(conn.peer); R.pres.delete(conn.peer); toGuests({t:'left',from:conn.peer}); peersChanged(); together47Log('guest out '+conn.peer); };
  conn.on('close',gone); conn.on('error',gone); conn.gone47=gone; };
 /* guest side */
 const guestMessage=(m)=>{ if(!m||typeof m!=='object') return;
  if(m.t==='ev') deliver(m.type,m.data,m.from);
  else if(m.t==='hello'){ (m.pres||[]).forEach(([id,p])=>{ if(id!==R.myId) R.pres.set(id,p||{}); }); peersChanged(); }
  else if(m.t==='pres'){ if(m.from!==R.myId){ R.pres.set(m.from,m.p||{}); peersChanged(); } }
  else if(m.t==='left'){ R.pres.delete(m.from); peersChanged(); }
  else if(m.t==='doc') take(m.path,m.doc,true);
  else if(m.t==='got'||m.t==='listed'){ const p=R.pending.get(m.rid); if(p){ R.pending.delete(m.rid); p(m); } }
 };
 /* peers */
 const newPeer=(id)=>new Promise((res,rej)=>{ const P=window.Peer, peer=id?new P(id,together47PeerOpts()):new P(together47PeerOpts()); let done=false;
  peer.on('open',pid=>{ if(done) return; done=true; res(peer); });
  peer.on('error',e=>{ if(!done){ done=true; try{ peer.destroy(); }catch(x){} rej(e); } else R.peerError(peer,e); });
  peer.on('disconnected',()=>{ if(!R.closed&&!peer.destroyed){ together47Log('signal lost'); setTimeout(()=>{ try{ if(!R.closed&&!peer.destroyed&&peer.disconnected) peer.reconnect(); }catch(e){} },1500); } });
  setTimeout(()=>{ if(!done){ done=true; try{ peer.destroy(); }catch(x){} rej(new Error('The connection server did not answer. Check the connection and try again.')); } },12000); });
 R.peerError=(peer,e)=>{ together47Log('peer error '+(e&&e.type)); if(R.connecting&&e&&e.type==='peer-unavailable'){ const c=R.connecting; R.connecting=null; c.fail(e); } };
 const dropPeer=()=>{ if(R.peer){ try{ R.peer.destroy(); }catch(e){} } R.peer=null; R.conns.clear(); R.hubConn=null; R.role=null; };
 R.claim=async()=>{ dropPeer(); const peer=await newPeer(R.hubId); R.peer=peer; R.role='hub'; R.myId=peer.id; peer.on('connection',hubAccept); R.retryN=0; together47Log('holding '+code); peersChanged(); };
 R.connect=async()=>{ dropPeer(); const peer=await newPeer(null); R.peer=peer; R.myId=peer.id;
  await new Promise((res,rej)=>{ const conn=peer.connect(R.hubId,{reliable:true}); let done=false;
   const fail=e=>{ if(done) return; done=true; R.connecting=null; together47Log('connect failed '+(e&&(e.type||e.message))); try{ conn.close(); }catch(x){} rej(e); };
   R.connecting={fail};
   conn.on('open',()=>{ if(done) return; done=true; R.connecting=null; R.hubConn=conn; together47Log('joined '+code); R.role='guest'; R.retryN=0;
    R.hubSeen=Date.now(); conn.on('data',m=>{ R.hubSeen=Date.now(); guestMessage(m); });
    const lost=()=>{ if(R.hubConn!==conn) return; R.hubConn=null; try{ conn.close(); }catch(e){} R.pres.clear(); peersChanged(); together47Log('hub lost'); R.rejoin(); };
    conn.on('close',lost); conn.on('error',lost); conn.lost47=lost;
    send(conn,{t:'pres',p:R.myPres}); send(conn,{t:'sync',doc:R.store.docs[docPath]||null}); res(); });
   conn.on('error',fail);
   setTimeout(()=>fail(Object.assign(new Error('timeout'),{type:'peer-unavailable'})),20000); });
 };
 // after a drop: take the meeting point if it is free, otherwise join whoever holds it
 R.rejoin=()=>{ if(R.closed||R.retryT) return; const wait=Math.min(8000,1200*Math.pow(1.6,R.retryN++));
  R.retryT=setTimeout(async()=>{ R.retryT=null; if(R.closed) return;
   try{ await R.connect(); }catch(e){ if(R.closed) return; try{ await R.claim(); }catch(e2){ R.rejoin(); } } },wait); };
 // a phone that closes or sleeps does not always close its channel: ping every two seconds, and count a side
 // silent for TOGETHER47.silentMs as gone (a phone building the 3D world can stall for many seconds)
 R.beat=setInterval(()=>{ if(R.closed) return; const now=Date.now();
  if(R.role==='hub') R.conns.forEach(c=>{ if(now-(c.seen47||now)>TOGETHER47.silentMs){ together47Log('guest silent'); c.gone47&&c.gone47(); } else send(c,{t:'ping'}); });
  else if(R.role==='guest'&&R.hubConn){ if(now-(R.hubSeen||now)>TOGETHER47.silentMs){ together47Log('hub silent'); R.hubConn.lost47&&R.hubConn.lost47(); } else send(R.hubConn,{t:'ping'}); } },2000);
 /* the two objects NET expects */
 R.api={
  emit(type,data){ const m={t:'ev',type,data,from:R.myId}; if(R.role==='hub') toGuests(m); else send(R.hubConn,m); return Promise.resolve(); },
  on(type,fn){ (R.on[type]=R.on[type]||new Set()).add(fn); return ()=>R.on[type].delete(fn); },
  onPeers(fn){ R.peersCbs.add(fn); setTimeout(()=>{ if(R.peersCbs.has(fn)) fn(peersNow()); },0); return ()=>R.peersCbs.delete(fn); },
  presence(p){ R.myPres=p||{}; const m={t:'pres',from:R.myId,p:R.myPres}; if(R.role==='hub') toGuests(m); else send(R.hubConn,m); return Promise.resolve(); },
  leave(){ R.closed=true; clearTimeout(R.retryT); clearInterval(R.beat); if(R.saveT){ clearTimeout(R.saveT); R.saveT=null; } together47WriteCache(code,R.store); dropPeer(); if(TOGETHER47.room===R) TOGETHER47.room=null; }
 };
 R.db={
  doc(path){ return {
   get(){ if(R.role==='guest'&&R.hubConn&&R.hubConn.open) return new Promise(res=>{ const rid=++R.rid; const t=setTimeout(()=>{ R.pending.delete(rid); res(local()); },8000);
     R.pending.set(rid,m=>{ clearTimeout(t); if(m.doc) take(path,m.doc,false); res(local()); }); send(R.hubConn,{t:'get',rid,path}); });
    return Promise.resolve(local()); },
   set(doc){ const d=JSON.parse(JSON.stringify(doc)); R.store.docs[path]=d; persist();
    if(R.role==='hub') toGuests({t:'doc',path,doc:d}); else send(R.hubConn,{t:'set',path,doc:d}); return Promise.resolve(); },
   onSnapshot(cb,err){ const s={cb,err}; if(!R.snaps.has(path)) R.snaps.set(path,new Set()); R.snaps.get(path).add(s); return ()=>R.snaps.get(path).delete(s); }
  };
  function local(){ const d=R.store.docs[path]; return {exists:!!d,data:()=>d?JSON.parse(JSON.stringify(d)):undefined,id:path.split('/').pop()}; } },
  collection(path){ return { get(){ const fromStore=()=>{ const pre=path+'/', docs=[]; for(const p in R.store.docs) if(p.indexOf(pre)===0&&p.slice(pre.length).indexOf('/')<0){ const d=R.store.docs[p]; docs.push({id:p.slice(pre.length),data:()=>d}); } return {docs}; };
   if(R.role==='guest'&&R.hubConn&&R.hubConn.open) return new Promise(res=>{ const rid=++R.rid; const t=setTimeout(()=>{ R.pending.delete(rid); res(fromStore()); },8000);
    R.pending.set(rid,m=>{ clearTimeout(t); (m.docs||[]).forEach(x=>{ if(x&&x.doc) R.store.docs[path+'/'+x.id]=x.doc; }); persist(); res(fromStore()); }); send(R.hubConn,{t:'list',rid,path}); });
   return Promise.resolve(fromStore()); } }; }
 };
 return R;
}
// "Start a household" holds a fresh code; "Join" and "Continue together" meet whoever holds it, or hold it themselves
// when this phone already has the household.
async function together47Join(code){
 await together47PeerLib();
 if(TOGETHER47.room){ try{ TOGETHER47.room.api.leave(); }catch(e){} }
 const R=together47Room(code), creating=TOGETHER47.creating===code; TOGETHER47.creating=null;
 const haveCopy=!!R.store.docs['households/'+code];
 const nobody=()=>new Error(`Nobody has ${code} open right now. Ask your person to open Compound Days and tap Start a household or Continue together, then try again.`);
 if(creating){ try{ await R.claim(); }catch(e){ R.api.leave(); throw new Error(e&&e.type==='unavailable-id'?'That code is busy. Go back and start again for a new one.':(e&&e.message)||'Could not open the room.'); } }
 else { try{ await R.connect(); }
  catch(e){ if(!(e&&e.type==='peer-unavailable')){ R.api.leave(); throw e; }
   if(!haveCopy){ R.api.leave(); throw nobody(); }
   try{ await R.claim(); }catch(e2){ if(e2&&e2.type==='unavailable-id'){ try{ await R.connect(); }catch(e3){ R.api.leave(); throw nobody(); } } else { R.api.leave(); throw e2; } } } }
 return R.api;
}
if(together47Supported()&&typeof NET!=='undefined'&&!NET.capable){
 // NET gets a room and a store that travel phone to phone (netDetect, run at boot, keeps a host room if the page has one)
 NET.roomNs={join:together47Join};
 NET.db={doc:p=>TOGETHER47.room.db.doc(p),collection:p=>TOGETHER47.room.db.collection(p)}; // used only while a room is open
 NET.user={id:'phone'};
 NET.capable=true;
 // wrap: remember a code this phone generates, so "Start a household" holds it instead of looking for someone there
 if(typeof genCode==='function'){ const genCode47base=genCode; genCode=function(){ const c=genCode47base.apply(this,arguments); TOGETHER47.creating=c; return c; }; }
 // wrap: the join and lobby panels describe joining over the internet, not a host's sharing settings
 if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.netjoin==='function'){ const netjoin47base=ACTIONS.netjoin; ACTIONS.netjoin=function(){ const r=netjoin47base.apply(this,arguments); together47Words(); return r; }; }
 if(typeof renderLobby==='function'){ const renderLobby47base=renderLobby; renderLobby=function(){ const r=renderLobby47base.apply(this,arguments); together47Words(); return r; }; }
}
function together47Words(){
 if(typeof panel==='undefined'||!panel||!panel.querySelectorAll) return;
 panel.querySelectorAll('p.tiny').forEach(p=>{ const t=p.textContent||'';
  if(/signed in/.test(t)) p.textContent='Both phones need Compound Days open and a connection (Wi-Fi or mobile data). Each phone keeps a copy of the household, so either of you can open it again later.';
  else if(/shared with them/.test(t)) p.textContent='They open Compound Days on their phone, tap Join a household, and type this code. Keep this page open until they are in.'; });
}
// "Back" on the room panels (lockup arrow and error panels) had no action behind it
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.title!=='function'){
 ACTIONS.title=function(){ if(typeof NET!=='undefined'&&NET.on&&typeof netLeave==='function') netLeave(); if(typeof players!=='undefined'&&players.length&&S&&S.phase==='play'){ save(); location.reload(); return; } S=null; openTitle(); };
}

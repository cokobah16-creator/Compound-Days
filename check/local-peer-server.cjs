'use strict';
/* Two local servers for the two-browser check (check/bench-pair-v71b.cjs). They write nothing.

   1. staticServer(root): a read-only static file server for dist/. "/api/turn" (the relay function turn-v49.js asks
      for) is answered 404, as a plain static host would, so the game runs on its defaults.

   2. signalServer(): a small stand-in for the PeerJS signalling server, so the check needs no outside service and no
      extra package. It follows the protocol dist/assets/vendor/peerjs-1.5.4.min.js speaks:
        GET  /peerjs/id                      -> a fresh id (text), CORS open
        WS   /peerjs?key=peerjs&id=..&token=..&version=..
               id free                    -> {type:"OPEN"}
               id held by another token   -> {type:"ID-TAKEN",payload:{msg:"ID is taken"}} then close
        client -> server: HEARTBEAT; OFFER / ANSWER / CANDIDATE / LEAVE {dst,payload} are relayed to dst with src set
        destination not registered: OFFER/ANSWER/CANDIDATE wait; after expireMs (5000) they are dropped and
               {type:"EXPIRE"} goes back to the sender (the library turns that into the "peer-unavailable" error
               together-v47.js relies on); a destination that registers first gets what waited.
        socket close -> the id is free again at once. A client with no heartbeat for aliveMs (60000) is dropped.
      The WebSocket layer is hand-written (RFC 6455 text frames only).
   It is NOT the public PeerJS service: its timings and limits are its own. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');

const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.bin':'application/octet-stream','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.txt':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json'};
function staticServer(root){
  root=path.resolve(root);   // a folder given with '..' in it still serves its files
  const hits={turn:0,notFound:[]};
  const server=http.createServer((req,res)=>{
    let u; try{ u=decodeURIComponent(new URL(req.url,'http://localhost').pathname); }catch(e){ res.writeHead(400).end(); return; }
    if(req.method!=='GET'&&req.method!=='HEAD'){ res.writeHead(405).end(); return; }
    if(u==='/api/turn'){ hits.turn++; res.writeHead(404,{'content-type':'text/plain'}).end('Not Found'); return; }
    const file=path.resolve(root,'.'+(u==='/'?'/index.html':u));
    if(file!==root&&!file.startsWith(root+path.sep)){ res.writeHead(403).end(); return; }
    fs.stat(file,(err,s)=>{ if(err||!s.isFile()){ if(hits.notFound.length<50) hits.notFound.push(u); res.writeHead(404,{'content-type':'text/plain'}).end('Not Found'); return; }
      res.writeHead(200,{'content-type':MIME[path.extname(file).toLowerCase()]||'application/octet-stream','content-length':s.size,'cache-control':'no-store'});
      if(req.method==='HEAD'){ res.end(); return; } fs.createReadStream(file).pipe(res); });
  });
  return new Promise(r=>server.listen(0,'127.0.0.1',()=>r({server,port:server.address().port,hits,stop:()=>new Promise(k=>{ server.closeAllConnections&&server.closeAllConnections(); server.close(()=>k()); })})));
}

/* ---- minimal WebSocket (server side, text frames) ---- */
function wsAccept(key){ return crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64'); }
function wsFrame(op,payload){ const p=Buffer.isBuffer(payload)?payload:Buffer.from(String(payload||''),'utf8'); let h;
  if(p.length<126){ h=Buffer.from([0x80|op,p.length]); } else if(p.length<65536){ h=Buffer.alloc(4); h[0]=0x80|op; h[1]=126; h.writeUInt16BE(p.length,2); }
  else { h=Buffer.alloc(10); h[0]=0x80|op; h[1]=127; h.writeUInt32BE(0,2); h.writeUInt32BE(p.length,6); } return Buffer.concat([h,p]); }
function wsAttach(socket,onText,onClose){
  let buf=Buffer.alloc(0),closed=false,frag=null;
  const api={ send(s){ if(!closed){ try{ socket.write(wsFrame(1,s)); }catch(e){} } }, close(){ if(closed) return; try{ socket.write(wsFrame(8,Buffer.alloc(0))); }catch(e){} try{ socket.end(); }catch(e){} fin(); }, get closed(){ return closed; } };
  const fin=()=>{ if(closed) return; closed=true; try{ socket.destroy(); }catch(e){} onClose(); };
  socket.on('data',d=>{ buf=Buffer.concat([buf,d]);
    for(;;){ if(buf.length<2) return; const b0=buf[0],b1=buf[1],op=b0&15,finBit=!!(b0&0x80),masked=!!(b1&0x80); let len=b1&127,off=2;
      if(len===126){ if(buf.length<4) return; len=buf.readUInt16BE(2); off=4; } else if(len===127){ if(buf.length<10) return; len=buf.readUInt32BE(2)*4294967296+buf.readUInt32BE(6); off=10; }
      const need=off+(masked?4:0)+len; if(buf.length<need) return; let p=buf.subarray(off+(masked?4:0),need);
      if(masked){ const m=buf.subarray(off,off+4); const q=Buffer.alloc(len); for(let i=0;i<len;i++) q[i]=p[i]^m[i&3]; p=q; }
      buf=buf.subarray(need);
      if(op===8){ fin(); return; } if(op===9){ try{ socket.write(wsFrame(10,p)); }catch(e){} continue; } if(op===10) continue;
      if(op===1||op===2||op===0){ frag=frag?Buffer.concat([frag,p]):p; if(finBit){ const t=frag.toString('utf8'); frag=null; try{ onText(t); }catch(e){} } } } });
  socket.on('close',fin); socket.on('error',fin); socket.on('end',fin);
  return api;
}

function signalServer(opts){
  const O=Object.assign({key:'peerjs',expireMs:5000,aliveMs:60000},opts||{});
  const clients=new Map();   // id -> {id,token,ws,lastPing}
  const queues=new Map();    // dst id -> {at,msgs:[]}
  const log=[]; const t0=Date.now(); const note=(s)=>{ log.push(((Date.now()-t0)/1000).toFixed(2)+' '+s); if(log.length>4000) log.shift(); };
  const counts={OFFER:0,ANSWER:0,CANDIDATE:0,LEAVE:0,HEARTBEAT:0,EXPIRE:0,idTaken:0,open:0,close:0};
  const handle=(src,m)=>{ const type=m.type; if(type==='HEARTBEAT'){ counts.HEARTBEAT++; const c=clients.get(src); if(c) c.lastPing=Date.now(); return; }
    if(!['OFFER','ANSWER','CANDIDATE','LEAVE','EXPIRE'].includes(type)) return; counts[type]=(counts[type]||0)+1;
    const dst=m.dst, d=clients.get(dst);
    if(d){ d.ws.send(JSON.stringify(m)); if(type!=='CANDIDATE') note(type+' '+short(m.src)+' -> '+short(dst)); }
    else if(type!=='LEAVE'&&type!=='EXPIRE'&&dst){ let q=queues.get(dst); if(!q){ q={at:Date.now(),msgs:[]}; queues.set(dst,q); } q.msgs.push(m); if(type!=='CANDIDATE') note(type+' '+short(m.src)+' -> '+short(dst)+' (not registered: queued)'); } };
  const short=id=>String(id||'').replace(/^compound-days-v47-/,'HUB:').slice(0,18);
  const expire=setInterval(()=>{ const now=Date.now();
    for(const [dst,q] of queues){ if(now-q.at<O.expireMs) continue; const seen=new Set();
      for(const m of q.msgs){ const k=m.src+'_'+m.dst; if(seen.has(k)) continue; seen.add(k); counts.EXPIRE++; const s=clients.get(m.src); if(s){ s.ws.send(JSON.stringify({type:'EXPIRE',src:m.dst,dst:m.src})); note('EXPIRE -> '+short(m.src)+' (nobody registered as '+short(dst)+')'); } }
      queues.delete(dst); }
    for(const [id,c] of clients){ if(now-c.lastPing<O.aliveMs) continue; note('no heartbeat: drop '+short(id)); try{ c.ws.close(); }catch(e){} if(clients.get(id)===c) clients.delete(id); queues.delete(id); } },300);
  const server=http.createServer((req,res)=>{ const u=new URL(req.url,'http://localhost');
    const cors={'access-control-allow-origin':'*'};
    if(u.pathname==='/'+O.key+'/id'){ const id=crypto.randomUUID(); res.writeHead(200,Object.assign({'content-type':'text/html; charset=utf-8'},cors)).end(id); return; }
    if(u.pathname==='/'){ res.writeHead(200,Object.assign({'content-type':'application/json'},cors)).end(JSON.stringify({name:'local PeerJS-protocol signalling (probe)',description:'scratch re-implementation'})); return; }
    res.writeHead(404,cors).end('Not Found'); });
  server.on('upgrade',(req,socket)=>{ const u=new URL(req.url,'http://localhost'); const key=req.headers['sec-websocket-key'];
    if(u.pathname!=='/peerjs'||!key){ socket.destroy(); return; }
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+wsAccept(key)+'\r\n\r\n'); socket.setNoDelay(true);
    const id=u.searchParams.get('id'),token=u.searchParams.get('token'),k=u.searchParams.get('key'); let me=null;
    const ws=wsAttach(socket,t=>{ if(!me) return; let m; try{ m=JSON.parse(t); }catch(e){ return; } m.src=me.id; handle(me.id,m); },()=>{ if(me&&clients.get(me.id)===me){ clients.delete(me.id); counts.close++; note('socket closed: '+short(me.id)+' is free'); } });
    if(!id||!token||!k){ ws.send(JSON.stringify({type:'ERROR',payload:{msg:'No id, token, or key supplied to websocket server'}})); ws.close(); return; }
    if(k!==O.key){ ws.send(JSON.stringify({type:'ERROR',payload:{msg:'Invalid key provided'}})); ws.close(); return; }
    const cur=clients.get(id);
    if(cur){ if(cur.token!==token){ counts.idTaken++; note('ID-TAKEN '+short(id)); ws.send(JSON.stringify({type:'ID-TAKEN',payload:{msg:'ID is taken'}})); ws.close(); return; }
      cur.ws=ws; cur.lastPing=Date.now(); me=cur; note('same token reconnects as '+short(id)); return; }
    me={id,token,ws,lastPing:Date.now()}; clients.set(id,me); counts.open++; note('OPEN '+short(id)); ws.send(JSON.stringify({type:'OPEN'}));
    const q=queues.get(id); if(q){ queues.delete(id); for(const m of q.msgs) handle(m.src,m); } });
  return new Promise(r=>server.listen(0,'127.0.0.1',()=>r({server,port:server.address().port,log,counts,ids:()=>[...clients.keys()],
    stop:()=>new Promise(k=>{ clearInterval(expire); for(const c of clients.values()){ try{ c.ws.close(); }catch(e){} } server.closeAllConnections&&server.closeAllConnections(); server.close(()=>k()); })})));
}
module.exports={staticServer,signalServer};

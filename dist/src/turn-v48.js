/* v48 "Turn": two phones on mobile data reach each other through a TURN relay.

   v47's phone-to-phone room (together-v47.js) used PeerJS's default ICE servers. On the owner's first real test the
   joining phone, on LTE, failed with "Negotiation of connection to compound-days-v47-... failed": the carrier's
   network would not let a direct link through, and PeerJS's free relay did not carry it either.

   Before the first Peer is made, this module asks the site's own endpoint, /api/turn (api/turn.js, a Vercel
   function), for short-lived Cloudflare TURN credentials, and gives them to every Peer as its ICE servers. The long-
   lived key stays in the Vercel project's environment. If the endpoint is not configured or cannot be reached within
   five seconds, the Peer keeps PeerJS's defaults, exactly as in v47. A failed link now says what to try. */
const TURN48={url:'api/turn',servers:null,at:0,maxAge:12*3600*1000,waitMs:5000};
async function turn48Fetch(){
 if(TURN48.servers&&Date.now()-TURN48.at<TURN48.maxAge) return TURN48.servers;
 try{ const r=await fetch(TURN48.url,{cache:'no-store'}); if(r.status===200){ const j=await r.json();
   if(j&&Array.isArray(j.iceServers)&&j.iceServers.length){ TURN48.servers=j.iceServers; TURN48.at=Date.now(); } } }catch(e){}
 return TURN48.servers;
}
function turn48Message(e){
 const m=String(e&&e.message||e||'');
 if(/negotiation|ice|connection failed|could not connect/i.test(m)) return new Error('Your two phones could not reach each other on this network. Try again in a moment, or put one phone on Wi-Fi.');
 return e;
}
if(typeof together47PeerLib==='function'&&typeof together47PeerOpts==='function'&&typeof window!=='undefined'&&typeof fetch==='function'){
 // wrap: fetch the relay credentials (at most five seconds) before the first Peer is made
 const together47PeerLib48base=together47PeerLib;
 together47PeerLib=function(){ return together47PeerLib48base.apply(this,arguments).then(P=>Promise.race([turn48Fetch(),new Promise(r=>setTimeout(r,TURN48.waitMs))]).then(()=>P)); };
 // wrap: every Peer gets the relay servers when there are any
 const together47PeerOpts48base=together47PeerOpts;
 together47PeerOpts=function(){ const o=together47PeerOpts48base.apply(this,arguments);
  if(TURN48.servers) o.config={iceServers:[{urls:'stun:stun.l.google.com:19302'}].concat(TURN48.servers)}; return o; };
 // wrap: a link that cannot get through says what to try (NET.roomNs.join holds the function, so wrap it there)
 if(typeof NET!=='undefined'&&NET.roomNs&&NET.roomNs.join===together47Join){
  NET.roomNs.join=function(code){ return together47Join(code).catch(e=>{ throw turn48Message(e); }); };
 }
}
// a phone closing or going to the background right after a change keeps its copy of the household (v47 wrote the
// copy at most every 1.5 s, so the last change could be lost when the page closed straight after it)
function turn48Flush(){ try{ const R=typeof TOGETHER47!=='undefined'&&TOGETHER47.room; if(R&&R.store&&!R.closed) together47WriteCache(R.code,R.store); }catch(e){} }
if(typeof window!=='undefined'&&typeof window.addEventListener==='function'&&typeof document!=='undefined'&&typeof document.addEventListener==='function'){
 window.addEventListener('pagehide',turn48Flush); document.addEventListener('visibilitychange',()=>{ if(document.hidden) turn48Flush(); });
}

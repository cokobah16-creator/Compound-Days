// Two-phone play (dist/src/turn-v48.js) asks here for short-lived TURN relay credentials, so phones on mobile data
// can reach each other through Cloudflare's TURN service when a direct link cannot get through.
// The long-lived key stays in the Vercel project's environment (CF_TURN_KEY_ID, CF_TURN_API_TOKEN) and never
// reaches the page; each answer is valid for a day. Without the two variables it answers 204 and the game keeps
// PeerJS's default STUN/TURN servers.
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 const id=process.env.CF_TURN_KEY_ID, token=process.env.CF_TURN_API_TOKEN;
 if(!id||!token){ res.statusCode=204; return res.end(); }
 try{
  const ask=path=>fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(id)}/credentials/${path}`,
   {method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({ttl:86400})});
  let r=await ask('generate-ice-servers'); if(r.status===404) r=await ask('generate'); // the older path, same credentials
  if(!r.ok){ res.statusCode=502; res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify({error:'turn service answered '+r.status})); }
  const j=await r.json();
  // the service has answered both {iceServers:[...]} and {iceServers:{...}}
  const list=Array.isArray(j.iceServers)?j.iceServers:(j.iceServers?[j.iceServers]:[]);
  res.statusCode=200; res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify({iceServers:list,ttl:86400}));
 }catch(e){ res.statusCode=502; res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({error:'turn service unreachable'})); }
};

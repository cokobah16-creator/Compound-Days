// Sites supplies identity. Two trusted household clients calculate gameplay;
// D1 checks membership and commits versioned changes with exact-once receipts.
const TTL=12000, RESERVED=new Set(['__proto__','prototype','constructor']);
const PRIVATE=new Set('name skin hair headwear outfit strength aspiration bodyBase bodyBuild face shape beard acc graphic colors wear'.split(' '));
const ROOTS=new Set('version phase mode household p money day time pantry dishes recipes cooked home nb flags memories recent today spentToday haggled workshops sofa crate ball party wardrobe garden weather mkt square seq firstEvening life bench35 ck pt at roof ready net dayVotes36'.split(' '));
const clone=x=>JSON.parse(JSON.stringify(x)), equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
class Problem extends Error{constructor(status,message,code='error'){super(message);this.status=status;this.code=code;}}
function demand(ok,status,message,code){if(!ok)throw new Problem(status,message,code);}
function json(body,status=200){return Response.json(body,{status,headers:{'Cache-Control':'no-store','Vary':'Cookie'}});}
function validState(s){
 demand(s&&typeof s==='object'&&!Array.isArray(s)&&Array.isArray(s.p)&&s.p.length===2,400,'Invalid household.');
 demand(Number.isFinite(s.money)&&s.money>=0&&s.money<=1000000000,400,'Invalid household purse.');
 demand(Number.isInteger(s.day)&&s.day>0&&s.day<1000000&&Number.isFinite(s.time)&&s.time>=0&&s.time<50,400,'Invalid household day.');
 demand(['play','lobby'].includes(s.phase)&&s.home&&Array.isArray(s.home.items)&&s.home.items.length<=512,400,'Invalid home.');
 demand(JSON.stringify(s).length<=500000,413,'The household save is too large.');return s;
}
async function createCode(user,id){const a='abcdefghjkmnpqrstuvwxyz23456789';const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(user+':'+id));return 'palm-'+Array.from(new Uint8Array(hash).slice(0,12),n=>a[n%a.length]).join('');}
function sessionId(s){demand(typeof s==='string'&&/^[a-zA-Z0-9-]{16,80}$/.test(s),400,'Reload this page to reconnect.');return s;}
function presence(raw){if(!raw||typeof raw!=='object')return null;const p={};for(const k of ['x','z','y','ry']){demand(Number.isFinite(raw[k])&&Math.abs(raw[k])<200,400,'Invalid player position.');p[k]=raw[k];}p.mv=raw.mv?1:0;p.busy=!!raw.busy;return p;}
function patchState(state,patches,slot){
 demand(Array.isArray(patches)&&patches.length>0&&patches.length<=180,400,'Invalid household change.');
 const next=clone(state),touched=new Set();
 for(const p of patches){
  demand(p&&Array.isArray(p.path)&&p.path.length>0&&p.path.length<=12&&p.path.every(k=>typeof k==='string'&&k.length<100&&!RESERVED.has(k)),400,'Invalid change path.');
  demand(ROOTS.has(p.path[0]),400,'This field is not shared.');
  const key=p.path.join('/');demand(!touched.has(key),400,'Duplicate change.');touched.add(key);
  if(p.path[0]==='p'){
   demand(p.path.length>=3&&['0','1'].includes(p.path[1]),400,'Change one player field at a time.');
   if(PRIVATE.has(p.path[2]))demand(Number(p.path[1])===slot,403,'Only your partner can edit their character.');
   demand(p.path[2]!=='pos',400,'Player positions use presence.');
  }
  if(p.path[0]==='ready'||p.path[0]==='dayVotes36')demand(p.path.length===2&&Number(p.path[1])===slot,403,'Each player confirms for themselves.');
  let parent=next;
  for(const part of p.path.slice(0,-1)){demand(parent&&typeof parent==='object'&&Object.hasOwn(parent,part),409,'The household changed. Please try again.','conflict');parent=parent[part];}
  demand(parent&&typeof parent==='object',400,'Invalid change.');const last=p.path.at(-1),exists=Object.hasOwn(parent,last);
  demand(exists===!!p.beforeExists&&(!exists||equal(parent[last],p.before)),409,'Your partner changed this too. The latest household has been kept; please try again.','conflict');
  if(p.afterExists)parent[last]=p.after;else delete parent[last];
 }
 return validState(next);
}
async function member(db,room,user){const m=await db.prepare('SELECT * FROM household_members WHERE code=? AND user_id=?').bind(room,user).first();demand(m,403,'Join this household before opening it.','not_member');return m;}
async function snapshot(db,room,user,since=-1){
 const m=await member(db,room,user),h=await db.prepare('SELECT state,revision FROM households WHERE code=?').bind(room).first();demand(h,404,'Household not found.');
 const rows=await db.prepare('SELECT slot,seen_at,presence FROM household_members WHERE code=? ORDER BY slot').bind(room).all();
 return {code:room,slot:m.slot,revision:h.revision,...(h.revision!==since?{state:JSON.parse(h.state)}:{}),people:rows.results.map(x=>({slot:x.slot,online:Date.now()-x.seen_at<TTL,presence:JSON.parse(x.presence)}))};
}
export async function householdRequest(request,db){
 try{
  const user=request.headers.get('oai-authenticated-user-id');demand(user,401,'Sign in to open your shared household.','sign_in');
  demand(db,503,'Shared households are being prepared. Try again shortly.','unavailable');
  const url=new URL(request.url),origin=request.headers.get('origin');demand(!origin||origin===url.origin,403,'Use the game page to make changes.');
  if(request.method==='GET'){
   const rows=await db.prepare('SELECT h.code,h.state,h.revision,m.slot FROM households h JOIN household_members m ON m.code=h.code WHERE m.user_id=? ORDER BY h.updated_at DESC LIMIT 10').bind(user).all();
   return json({available:true,households:rows.results.map(r=>{const s=JSON.parse(r.state);return {code:r.code,slot:r.slot,name:s.household,day:s.day,phase:s.phase};})});
  }
  demand(request.method==='POST',405,'Unsupported method.');demand((request.headers.get('content-type')||'').includes('application/json'),415,'Send JSON.');
  const raw=await request.text();demand(raw.length<=1000000,413,'The change is too large.');let body;try{body=JSON.parse(raw);}catch{throw new Problem(400,'Invalid JSON.');}
  demand(body&&typeof body==='object',400,'Invalid request.');const now=Date.now(),session=sessionId(body.session);
  if(body.op==='create'){
   demand(typeof body.id==='string'&&/^[a-zA-Z0-9-]{16,80}$/.test(body.id),400,'Invalid household creation ID.');
   const room=await createCode(user,body.id);
   if(await db.prepare('SELECT code FROM households WHERE code=?').bind(room).first()){await member(db,room,user);return json(await snapshot(db,room,user),201);}
   const count=await db.prepare('SELECT count(*) AS n FROM household_members WHERE user_id=? AND slot=0').bind(user).first();demand(count.n<8,409,'You already have eight households. Return to one of them.');
   const s=validState(body.state);demand(s.phase==='lobby'&&s.ready?.[0]===false&&s.ready?.[1]===false,400,'Create a household before moving in.');
   s.net={code:room};await db.batch([
    db.prepare('INSERT OR IGNORE INTO households (code,state,revision,created_at,updated_at) VALUES (?,?,0,?,?)').bind(room,JSON.stringify(s),now,now),
    db.prepare('INSERT OR IGNORE INTO household_members (code,slot,user_id,session,seen_at,presence) VALUES (?,0,?,?,?,?)').bind(room,user,session,now,'{}'),
   ]);return json(await snapshot(db,room,user),201);
  }
  const room=String(body.code||'').trim().toLowerCase();demand(/^palm-[a-z2-9]{12}$/.test(room),400,'Check the full household code.');
  if(body.op==='join'){
   demand(await db.prepare('SELECT code FROM households WHERE code=?').bind(room).first(),404,'No household has that code. Check it with your partner.');
   let m=await db.prepare('SELECT * FROM household_members WHERE code=? AND user_id=?').bind(room,user).first();
   if(!m){await db.prepare('INSERT OR IGNORE INTO household_members (code,slot,user_id,session,seen_at,presence) VALUES (?,1,?,?,?,?)').bind(room,user,session,now,'{}').run();m=await db.prepare('SELECT * FROM household_members WHERE code=? AND user_id=?').bind(room,user).first();demand(m,409,'This household already has two people.','full');}
   if(m.session!==session&&now-m.seen_at<TTL&&!body.takeover)throw new Problem(409,'Your character is already open on another tab or phone. Continue here to move it to this device.','in_use');
   const result=await db.prepare('UPDATE household_members SET session=?,seen_at=? WHERE code=? AND user_id=? AND session=?').bind(session,now,room,user,m.session).run();demand(result.meta.changes,409,'Your character reconnected elsewhere. Try again.','in_use');
   return json(await snapshot(db,room,user));
  }
  const m=await member(db,room,user);demand(m.session===session,409,'Your character moved to another tab or phone.','in_use');
  if(body.op==='leave'){await db.prepare('UPDATE household_members SET seen_at=0 WHERE code=? AND user_id=? AND session=?').bind(room,user,session).run();return json({left:true});}
  if(body.op==='sync'){const p=presence(body.presence);await db.prepare('UPDATE household_members SET seen_at=?,presence=? WHERE code=? AND user_id=? AND session=?').bind(now,p?JSON.stringify(p):m.presence,room,user,session).run();return json(await snapshot(db,room,user,body.revision));}
  demand(body.op==='commit',400,'Unknown household action.');demand(typeof body.id==='string'&&/^[a-zA-Z0-9-]{16,80}$/.test(body.id),400,'Invalid action ID.');
  for(let attempt=0;attempt<4;attempt++){
   const done=await db.prepare('SELECT id FROM household_mutations WHERE code=? AND user_id=? AND id=?').bind(room,user,body.id).first();if(done)return json({...await snapshot(db,room,user),replayed:true});
   const h=await db.prepare('SELECT * FROM households WHERE code=?').bind(room).first();let next;
   try{next=patchState(JSON.parse(h.state),body.patches,m.slot);}catch(e){if(e.code==='conflict'){const receipt=await db.prepare('SELECT id FROM household_mutations WHERE code=? AND user_id=? AND id=?').bind(room,user,body.id).first();if(receipt)return json({...await snapshot(db,room,user),replayed:true});return json({...await snapshot(db,room,user),error:e.message,code:e.code},409);}throw e;}
   // The receipt and update share one D1 transaction, including the revision guard.
   const result=await db.batch([
    db.prepare('INSERT OR IGNORE INTO household_mutations (code,user_id,id,revision,created_at) SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM households WHERE code=? AND revision=?) AND EXISTS (SELECT 1 FROM household_members WHERE code=? AND user_id=? AND session=?)').bind(room,user,body.id,h.revision+1,now,room,h.revision,room,user,session),
    db.prepare('UPDATE households SET state=?,revision=revision+1,updated_at=? WHERE code=? AND revision=? AND EXISTS (SELECT 1 FROM household_mutations WHERE code=? AND user_id=? AND id=? AND revision=?)').bind(JSON.stringify(next),now,room,h.revision,room,user,body.id,h.revision+1),
   ]);
   if(result[1].meta.changes)return json(await snapshot(db,room,user));
   const current=await member(db,room,user);demand(current.session===session,409,'Your character moved to another device.','in_use');
  }
  return json({error:'The household is busy. Your change can be retried.',code:'retry'},503);
 }catch(e){if(e instanceof Problem)return json({error:e.message,code:e.code},e.status);console.error('Household request failed',e?.message);return json({error:'The household could not be reached. Your saved progress is safe.',code:'unavailable'},503);}
}

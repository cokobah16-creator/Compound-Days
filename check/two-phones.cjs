// Two (or more) copies of the shipped game in one Node process, joined through the REAL room code in
// dist/src/together-v47.js over a stand-in for PeerJS. This is what the two-phone checks run on.
//
// Real: every script the page loads (dist/index.html and dist/src/*.js), so actions, replays, the household document,
//       presence, hub takeover and each phone's stored copy behave as shipped.
// Stand-in: the DOM (stub elements; a panel is its innerHTML), WebGL (none), PeerJS (an in-process signalling registry
//       and data connections with latency, following peerjs 1.5.4: a taken id gives 'unavailable-id', an unknown
//       one 'peer-unavailable', a reconnect asks for the same id again), and time (one world clock that drives every
//       timer, Date.now and each phone's performance.now, which starts at a different value per phone).
// Not covered: real browsers, real networks, the public PeerJS service, the relay. Nothing here is a phone test.
//
// Deterministic by construction: Math.random is seeded and no wall-clock value is read, so a check built on this
// writes the same results file on every run.
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');
// every phone gets its own copy of three.js: the game patches the library, and a shared copy would chain one phone's
// patches onto the next and keep every closed phone alive
const THREE_SRC=fs.readFileSync(path.join(root,'assets/vendor/three-r128.min.js'),'utf8');
function freshThree(){ const m={exports:{}}; new Function('module','exports','self','window',THREE_SRC)(m,m.exports,{},undefined); const T=m.exports;
 T.FileLoader.prototype.load=function(url,onLoad,onProgress,onError){try{let b;if(url.startsWith('data:'))b=Buffer.from(url.split(',')[1],'base64');else b=fs.readFileSync(path.resolve(root,url.split('?')[0]));const data=this.responseType==='arraybuffer'?b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength):b.toString();Promise.resolve().then(()=>onLoad(data));return data;}catch(e){if(onError)onError(e);else throw e;}};
 T.ImageLoader.prototype.load=function(url,onLoad){const image={width:1,height:1};Promise.resolve().then(()=>onLoad(image));return image;};
 return T; }
const noop=()=>{};

/* ---------- one world clock and scheduler for every phone ---------- */
const T0=1790000000000;
const W={t:T0,q:[],seq:0,errors:[],lat:60,frozen:new Set(),cut:new Set(),log:[],wire:[],server:new Map(),peers:{},anon:0};
const owner=tag=>String(tag||'').split(':')[0];
function schedule(ms,fn,tag){const id=++W.seq;W.q.push({at:W.t+Math.max(0,+ms||0),id,fn,tag});return id;}
function cancel(id){const k=W.q.findIndex(x=>x.id===id);if(k>=0)W.q.splice(k,1);}
// run everything due in the next ms milliseconds, in time order; a sleeping phone's timers wait until it wakes
function advance(ms){const end=W.t+ms;for(let guard=0;guard<500000;guard++){let best=-1;
  for(let k=0;k<W.q.length;k++){const x=W.q[k];if(x.at>end||W.frozen.has(owner(x.tag)))continue;if(best<0||x.at<W.q[best].at||(x.at===W.q[best].at&&x.id<W.q[best].id))best=k;}
  if(best<0)break;const n=W.q.splice(best,1)[0];W.t=Math.max(W.t,n.at);try{n.fn();}catch(e){W.errors.push({tag:n.tag,msg:String(e&&e.stack||e).slice(0,300)});}}
  W.t=end;}
Date.now=()=>W.t;
{let s=20261117;Math.random=()=>{s=(s*16807)%2147483647;return s/2147483647;};}

/* ---------- the PeerJS stand-in ---------- */
class Emitter{constructor(){this.h={};}on(ev,fn){(this.h[ev]=this.h[ev]||[]).push(fn);return this;}
  emit(ev,a){(this.h[ev]||[]).slice().forEach(fn=>{try{fn(a);}catch(e){W.errors.push({tag:'peer:'+ev,msg:String(e&&e.stack||e).slice(0,300)});}});}}
// A reliable data channel, as WebRTC's is: while either side's network is down a message waits on its connection and
// arrives, in order, when the network is back; it is lost only if the connection closes first (the beat in
// together-v47.js closes a side that has been silent for 30 s).
class FakeConn extends Emitter{constructor(peer,remoteId){super();this.owner=peer;this.peer=remoteId;this.open=false;this.closed=false;this.remote=null;this.held=[];}
  send(m){if(!this.open||!this.remote)return;const copy=JSON.stringify(m),r=this.remote,a=this.owner.label,b=r.owner.label;
    if(m&&m.t==='ev'&&m.type==='act'&&m.data)W.wire.push({from:a,name:m.data.name});
    if(W.cut.has(a)||W.cut.has(b)){this.held.push(copy);return;}            // waits while either side is cut off
    this.deliver(copy);}
  deliver(copy){const r=this.remote,b=r.owner.label;schedule(W.lat,()=>{if(r.open&&!this.closed)r.emit('data',JSON.parse(copy));},'net');}
  release(){if(this.closed||!this.open||!this.remote)return;const q=this.held;this.held=[];q.forEach(c=>this.deliver(c));}
  close(){if(this.closed)return;this.closed=true;this.held=[];const was=this.open;this.open=false;const r=this.remote;if(was)this.emit('close');
    if(r&&!r.closed&&!W.cut.has(this.owner.label)&&!W.cut.has(r.owner.label))schedule(W.lat,()=>r.close(),'net');}}
function peerClassFor(label){return class FakePeer extends Emitter{
  constructor(id,opts){super();if(id&&typeof id==='object'){opts=id;id=null;}this.label=label;this.destroyed=false;this.disconnected=false;this.id=null;this._last=null;this.conns=[];
    (W.peers[label]=W.peers[label]||[]).push(this);this._register(id||('anon-'+label+'-'+(++W.anon)));}
  _register(want){schedule(W.lat,()=>{if(this.destroyed||W.cut.has(label))return;const cur=W.server.get(want);
    if(cur&&cur!==this){W.log.push(label+' ID-TAKEN '+want);this.emit('error',Object.assign(new Error('ID "'+want+'" is taken'),{type:'unavailable-id'}));if(this._last)this._disconnect();else this.destroy();return;}
    W.server.set(want,this);this.id=want;this._last=want;this.disconnected=false;W.log.push(label+' OPEN '+want);this.emit('open',want);},'net');}
  connect(dst){const c=new FakeConn(this,dst);this.conns.push(c);schedule(W.lat,()=>{if(this.destroyed||c.closed)return;const target=W.server.get(dst);
    if(!target||target.destroyed){this.emit('error',Object.assign(new Error('Could not connect to peer '+dst),{type:'peer-unavailable'}));return;}
    if(W.cut.has(target.label)||W.cut.has(label))return;                    // registered but not answering
    const rc=new FakeConn(target,this.id);target.conns.push(rc);c.remote=rc;rc.remote=c;target.emit('connection',rc);
    schedule(W.lat,()=>{if(c.closed||rc.closed)return;c.open=true;rc.open=true;rc.emit('open');c.emit('open');},'net');},'net');return c;}
  _disconnect(){if(this.disconnected)return;this.disconnected=true;const id=this.id;if(W.server.get(id)===this)W.server.delete(id);this._last=id||this._last;this.id=null;W.log.push(label+' DISCONNECTED');this.emit('disconnected',id);}
  reconnect(){if(this.disconnected&&!this.destroyed){this.disconnected=false;this._register(this._last);}}
  destroy(){if(this.destroyed)return;this.destroyed=true;this.disconnected=true;if(W.server.get(this.id)===this)W.server.delete(this.id);this.conns.forEach(c=>c.close());this.emit('close');}};}
// a phone locks: its timers stop and nothing reaches it or leaves it
function sleep(phone){W.cut.add(phone.label);W.frozen.add(phone.label);W.log.push(phone.label+' SLEEPS');}
// the signalling server gives up on a silent phone and frees its ids
function serverDrops(phone){(W.peers[phone.label]||[]).forEach(p=>{if(W.server.get(p.id)===p){W.server.delete(p.id);p._dropped=true;}});W.log.push('server frees '+phone.label);}
// it unlocks: its channels are dead, and if the server dropped it, it hears so and tries to come back
function wake(phone){W.log.push(phone.label+' WAKES');
  (W.peers[phone.label]||[]).forEach(p=>{if(p.destroyed)return;p.conns.forEach(c=>{if(c.open){c.held=[];c.closed=true;c.open=false;c.emit('close');}});});
  W.cut.delete(phone.label);W.frozen.delete(phone.label);
  (W.peers[phone.label]||[]).forEach(p=>{if(p.destroyed)return;if(p._dropped){p._dropped=false;p.emit('error',Object.assign(new Error('Lost connection to server.'),{type:'network'}));p._disconnect();}});}
// the network drops for one phone while its page keeps running; when it comes back, what waited on a connection that
// is still open arrives
function cut(phone,on){if(on){W.cut.add(phone.label);return;}W.cut.delete(phone.label);
  for(const k of Object.keys(W.peers))(W.peers[k]||[]).forEach(p=>p.conns.forEach(c=>{if(c.remote&&!W.cut.has(c.owner.label)&&!W.cut.has(c.remote.owner.label))c.release();}));}
// the page closes or reloads: channels close cleanly and its timers are gone
function kill(phone){(W.peers[phone.label]||[]).forEach(p=>{try{p.destroy();}catch(e){}});W.peers[phone.label]=[];W.q=W.q.filter(x=>owner(x.tag)!==phone.label);W.frozen.delete(phone.label);W.cut.delete(phone.label);phone.dead=true;}

/* ---------- one phone ---------- */
function element(id){
  const ctx=new Proxy({measureText:s=>({width:String(s).length*9}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>k in o?o[k]:noop});
  const cls=new Set();
  return {id,style:{},classList:{add:c=>cls.add(c),remove:c=>cls.delete(c),toggle:(c,f)=>{const on=f===undefined?!cls.has(c):!!f;if(on)cls.add(c);else cls.delete(c);return on;},contains:c=>cls.has(c)},dataset:{},children:[],innerHTML:'',textContent:'',value:'',clientWidth:390,clientHeight:800,width:390,height:800,scrollTop:0,
    addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,appendChild(c){this.children.push(c);c.parentNode=this;if(c&&typeof c.onload==='function')Promise.resolve().then(()=>c.onload());return c;},removeChild:noop,remove:noop,contains:()=>true,querySelector:()=>null,querySelectorAll:()=>[],
    insertAdjacentHTML(where,h){if(where==='afterbegin')this.innerHTML=String(h)+this.innerHTML;else this.innerHTML=this.innerHTML+String(h);},getContext:()=>ctx,toDataURL:()=>'data:image/jpeg;base64,PHOTO',getBoundingClientRect:()=>({left:0,top:0,width:390,height:800,bottom:800,right:390}),focus:noop,blur:noop};
}
// the page's scripts, from a build's dist folder (a phone can be given another build with opts.root: an older one)
const scriptCache=new Map();
function scriptsFor(dir){ if(scriptCache.has(dir)) return scriptCache.get(dir); const HTML=fs.readFileSync(path.join(dir,'index.html'),'utf8');
 const list=[...HTML.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].map(([full,attr,body])=>{const src=attr.match(/src="([^"]+)"/);
  if(src)return src[1].includes('three-r128')?null:{name:src[1],code:fs.readFileSync(path.join(dir,src[1]),'utf8')};
  return /else \{ boot\(\); \}/.test(body)?null:{name:'index-inline.js',code:body};}).filter(Boolean);   // the last inline block boots WebGL: definitions only
 scriptCache.set(dir,list); return list; }
let perfSkew=0;
// label names the phone; opts.storage carries a previous page's localStorage (a reload or a reopen); opts.root loads
// the page from another build's dist folder
async function makePhone(label,opts){
  opts=opts||{};const els=new Map(),storage=new Map(opts.storage||[]),perf0=1000+(perfSkew++)*307000;   // each page was opened at a different moment
  const THREE=freshThree(); const parse=file=>new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(fs.readFileSync(path.join(root,file),'utf8'),'',resolve,reject));
  const document={getElementById:id=>{if(!els.has(id))els.set(id,element(id));return els.get(id);},createElement:()=>element(),createElementNS:()=>element(),addEventListener:noop,querySelector:()=>null,querySelectorAll:()=>[],body:element('body'),documentElement:element('html'),fonts:{ready:Promise.resolve()},hidden:false,head:element('head'),baseURI:'http://local.test/',activeElement:null,readyState:'complete'};
  const context={THREE,document,console:{log:noop,info:noop,debug:noop,warn:(...a)=>{W.log.push(label+' warn '+String(a[0]).slice(0,60)+' '+String(a[1]||'').slice(0,40));},error:(...a)=>{W.errors.push({tag:label+':console.error',msg:a.map(String).join(' ').slice(0,300)});}},
    URL,URLSearchParams,Blob,TextDecoder,TextEncoder,ArrayBuffer,Uint8Array,Float32Array,Uint16Array,Uint32Array,DataView,Buffer,Math,Date,Promise,Map,Set,WeakMap,
    location:{search:'',hash:'',href:'http://local.test/',pathname:'/',protocol:'http:',reload:()=>{context.__reloads=(context.__reloads||0)+1;}},navigator:{maxTouchPoints:5,userAgent:'two-phone check',getGamepads:()=>[]},performance:{now:()=>W.t-T0+perf0},innerWidth:390,innerHeight:800,devicePixelRatio:2,
    addEventListener:noop,removeEventListener:noop,matchMedia:()=>({matches:false,addEventListener:noop}),getComputedStyle:()=>({getPropertyValue:()=>''}),
    localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>{storage.set(k,String(v));},removeItem:k=>{storage.delete(k);}},
    sessionStorage:{getItem:()=>null,setItem:noop,removeItem:noop},
    atob:s=>Buffer.from(s,'base64').toString('binary'),btoa:s=>Buffer.from(s,'binary').toString('base64'),
    setTimeout:(fn,ms)=>schedule(ms,()=>fn(),label+':timeout'),clearTimeout:id=>cancel(id),
    setInterval:(fn,ms)=>{const h={id:0,dead:false};const again=()=>{if(h.dead)return;h.id=schedule(ms||1,()=>{if(h.dead)return;try{fn();}finally{again();}},label+':interval');};again();return h;},
    clearInterval:h=>{if(h&&typeof h==='object'){h.dead=true;cancel(h.id);}},
    requestAnimationFrame:()=>0,cancelAnimationFrame:noop,RTCPeerConnection:function(){},WebSocket:function(){},Peer:peerClassFor(label)};
  context.window=context;context.self=context;vm.createContext(context);
  for(const s of scriptsFor(opts.root||root))vm.runInContext(s.code,context,{filename:s.name});
  const run=code=>vm.runInContext(code,context),J=code=>JSON.parse(run('JSON.stringify('+code+')'));
  context.loadedHero=await parse('assets/characters/efe.gltf.json');
  run("HERO.gltf=loadedHero;HERO.state='ready';HERO.clips={};for(const c of loadedHero.animations){const n=heroClipName(c.name);if(n)HERO.clips[n]=c;}if(typeof presenceBakeBase==='function')presenceBakeBase();if(typeof authored34Install==='function')authored34Install();");
  for(const id of run("[...new Set([...Object.values(WARDROBE.hair),...Object.values(WARDROBE.outfits).flat()])]")){context.loadedWardrobe=await parse('assets/wardrobe/'+id+'.gltf.json');context.wardrobeId=id;run('WARDROBE.cache[wardrobeId]=loadedWardrobe');}
  run('S=null;scene=new THREE.Scene();buildTextures();buildTextures2();buildWorld();');
  // what this phone showed its player: panels opened and toasts, replays excluded (they are silent by design)
  run("var PANELS=[],TOASTS=[];{const op=openPanel;openPanel=function(h){if(!silentMode())PANELS.push(String(h).replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim().slice(0,90));return op.apply(this,arguments);};const tp=toast;toast=function(t){if(!silentMode())TOASTS.push(String(t));return tp.apply(this,arguments);};}");
  // one frame of the game's own tick() without drawing; (vx,vz) is this phone's stick
  run(`var HOOKERR={};function simFrame(dt,vx,vz){ if(!(S&&S.p&&players.length)) return 'no-world';
    if(!overlayOpen()){ if(typeof advanceClock33==='function')advanceClock33(dt/60);else S.time+=dt/60;
      for(const p of players){ if(NET.on&&p.i!==NET.myIndex) continue; p.prev=[p.g.position.x,p.g.position.z]; const m=Math.hypot(vx,vz); p.moving=m>0.05; const sp=SPEED*assist(p.i).speed*(sofa&&sofa.carrying&&sofa.holder.includes(p.i)?0.7:1)*(S.p[p.i].energy<20?0.75:1); if(p.moving){ movePlayer(p,vx/m*sp*dt,vz/m*sp*dt); p.face=[vx/m,vz/m]; if(!(sofa&&sofa.carrying)) p.g.rotation.y=Math.atan2(vx,vz); } p.t+=dt; }
      updateSofaCarry(); both().forEach(i=>updateGhost(i)); TICK_HOOKS.forEach((h,k)=>{try{h(dt,true);}catch(e){HOOKERR[k]=String(e&&e.message||e);}});
      both().forEach(i=>{ hotspotCache[i]=nearest(i); }); return 'play';
    } else { TICK_HOOKS.forEach((h,k)=>{try{h(dt,false);}catch(e){HOOKERR[k]=String(e&&e.message||e);}}); return 'panel'; } }
    function pressAct(){ const i=NET.on?NET.myIndex:0; if(overlayOpen()) return 'panel-open'; const hs=hotspotCache[i]=nearest(i); if(hs&&hs.id==='place'){ placeGhost(i); return 'place'; } if(hs){ dispatch('hs',{i,id:hs.id}); return hs.id; } if(ghosts[i]){ placeGhost(i); return 'place'; } return null; }
    function panelButtons(){ const out=[]; const re=/<button([^>]*)>/g; let m; const h=String(panel.innerHTML); while((m=re.exec(h))){ const a=m[1]; const act=(a.match(/data-act="([^"]*)"/)||[])[1]; if(!act) continue; const d={}; a.replace(/data-([a-z0-9-]+)="([^"]*)"/g,(x,k,v)=>{ if(k!=='act') d[k]=v; return x; }); out.push({act,d,disabled:/\\sdisabled/.test(a)}); } return out; }
    function clickBtn(act,pred){ if(!overlayOpen()) return 'no-panel'; const bs=panelButtons().filter(b=>b.act===act&&(!pred||pred(b.d))); if(!bs.length) return 'no-button'; if(bs[0].disabled) return 'disabled'; dispatch(act,Object.assign({},bs[0].d)); return 'ok'; }
    function tp(i,x,z){ const p=players[i]; p.g.position.set(x,0,z); p.prev=[x,z]; p.y=levelAt(x,z); p.lvl=lvlOf(p.y); p.g.baseY=p.y; }`);
  const phone={label,run,J,context,storage,document,dead:false,el:id=>document.getElementById(id),root:opts.root};
  return phone;
}
const flush=()=>new Promise(r=>setImmediate(r));
// let time pass on every phone: frames of dt seconds, each with its own stick (a pair, or a function of the frame number)
async function play(phones,seconds,sticks,dt){dt=dt||1/30;const n=Math.round(seconds/dt);
  for(let k=0;k<n;k++){phones.forEach((p,ix)=>{if(p.dead||W.frozen.has(p.label))return;const v=(sticks&&sticks[ix])||[0,0],vv=typeof v==='function'?v(k):v;
    try{p.run(`simFrame(${dt},${vv[0]},${vv[1]})`);}catch(e){W.errors.push({tag:p.label+':frame',msg:String(e&&e.stack||e).slice(0,300)});}});
   await flush();advance(dt*1000);await flush();}   // promise continuations run where a browser runs them: before the next message
  await flush();}
// let timers and messages run with no frames drawn (a lobby, a panel)
async function settle(ms){for(let k=0;k<Math.ceil((ms||400)/50);k++){advance(50);await flush();}}

/* ---------- the flows a person goes through ---------- */
// A starts a household and makes a character; B joins by code and makes one; someone moves both in. Returns the code.
async function pair(A,B,o){o=o||{};
  A.run("dispatch('nethost')");await settle(600);A.run(`S.p[0].name=${JSON.stringify(o.a||'Ada')}`);A.run("clickBtn('netready')");await settle(400);
  const code=A.run('NET.code');await join(B,code);if(o.lobbyOnly)return code;
  B.run(`S.p[NET.myIndex].name=${JSON.stringify(o.b||'Bola')}`);B.run("clickBtn('netready')");await settle(400);
  B.run("clickBtn('netmovein')");await settle(500);A.run("clickBtn('close')");B.run("clickBtn('close')");await play([A,B],1);return code;}
// type a code into the Join panel and press Join
async function join(P,code){P.run("dispatch('netjoin')");P.el('jc').value=code;P.run("dispatch('netjoingo')");await settle(3200);}
// the page reloads (or is opened again later) with what it had stored, and taps Continue together
async function reopen(P,o){if(!P.dead)kill(P);const N=await makePhone(P.label,{storage:[...P.storage],root:P.root});if(!(o&&o.titleOnly)){N.run("dispatch('netresume')");await settle((o&&o.wait)||3000);}return N;}
// the household as both phones should agree on it
const SHARED="({day:S.day,money:S.money,pantry:S.pantry,baskets:S.p.map(p=>p.basket||{}),items:S.home.items.map(i=>i.type+'@'+i.x+','+i.y).sort(),storage:S.home.storage.slice().sort(),dishes:S.dishes.map(d=>d.r+':'+d.quality),sofa:S.sofa.state,names:S.p.map(p=>p.name),mkt:S.mkt&&S.mkt.day+':'+S.mkt.items.rice.price})";
const shared=P=>P.J(SHARED);
const same=(A,B)=>JSON.stringify(shared(A))===JSON.stringify(shared(B));
function reset(){W.q=[];W.errors=[];W.log=[];W.wire=[];W.server=new Map();W.peers={};W.frozen=new Set();W.cut=new Set();}
module.exports={W,root,makePhone,advance,play,settle,flush,sleep,wake,serverDrops,cut,kill,pair,join,reopen,shared,same,SHARED,reset};

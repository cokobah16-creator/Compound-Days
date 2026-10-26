/* Two phones, one household. Independent viewports; transactional shared saves. */
'use strict';
const HOME36={available:false,checked:false,rooms:[],revision:-1,base:null,session:null,pending:null,sending:false,polling:false,lastPoll:0,lastOk:0,online:false,inAction:false,mode:'title',people:[],serial:0};
const HOME_FIELDS36=new Set('version phase mode household p money day time pantry dishes recipes cooked home nb flags memories recent today spentToday haggled workshops sofa crate ball party wardrobe garden weather mkt square seq firstEvening life bench35 ck pt at roof ready net dayVotes36'.split(' '));
const HOME_LOCAL36=new Set([...LOCAL_ONLY,'netlobby','onlineRefresh36','onlineTakeover36','onlineRetry36','onlineLeave36','onlineRoom36','onlineKitchen36','onlineDay36','onlineResume36','onlineOffline36','quality','lifeGo','lifeClear']);
const clone36=x=>JSON.parse(JSON.stringify(x));
function data36(s=S){
 if(!s)return null;const out={};for(const k of Object.keys(s))if(HOME_FIELDS36.has(k))out[k]=s[k];
 const d=clone36(out);d.p.forEach(p=>delete p.pos);(d.memories||[]).forEach(m=>delete m.img);return d;
}
function diff36(a,b,path=[],out=[]){
 if(JSON.stringify(a)===JSON.stringify(b))return out;
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
 const splitArray=((path.length===1&&['p','ready','dayVotes36'].includes(path[0]))||path.join('.')==='ck.ans'||path.join('.')==='party.pick')&&Array.isArray(a)&&Array.isArray(b);
 if((object(a)&&object(b))||splitArray){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff36(a[k],b[k],[...path,k],out);}
 else out.push({path,beforeExists:a!==undefined,before:a===undefined?null:a,afterExists:b!==undefined,after:b===undefined?null:b});return out;
}
function id36(){return crypto.randomUUID();}
function session36(){if(!HOME36.session){try{HOME36.session=sessionStorage.getItem('compound-session36');}catch(e){}if(!HOME36.session){HOME36.session=id36();try{sessionStorage.setItem('compound-session36',HOME36.session);}catch(e){}}}return HOME36.session;}
async function api36(body){
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),9000);
 try{
  const res=await fetch('/api/household',{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},...(body?{body:JSON.stringify({...body,session:session36()})}:{}),signal:abort.signal});
  let payload;try{payload=await res.json();}catch(e){throw Object.assign(new Error('Open the hosted game and sign in to connect your household.'),{code:'sign_in'});}
  if(!res.ok)throw Object.assign(new Error(payload.error||'The household could not be reached.'),{status:res.status,code:payload.code,payload});
  HOME36.lastOk=Date.now();HOME36.online=true;return payload;
 }finally{clearTimeout(timer);}
}
function pendingKey36(){return 'compound-pending36:'+NET.code+':'+NET.myIndex;}
function keepPending36(){try{if(HOME36.pending)localStorage.setItem(pendingKey36(),JSON.stringify(HOME36.pending));else localStorage.removeItem(pendingKey36());}catch(e){}}
function status36(){
 const el=document.getElementById('shared36');if(!el)return;el.hidden=!NET.on;
 if(!NET.on)return;const other=S?.p?.[1-NET.myIndex]?.name||'Your partner';
 el.textContent=(HOME36.pending?'Saving your change…':HOME36.online?'Household saved':'Reconnecting — changes paused')+' · '+other+(NET.otherOnline?' is here':' is away');
 el.dataset.state=HOME36.pending||!HOME36.online?'waiting':'saved';
}
function people36(d){
 HOME36.people=d.people||HOME36.people;const other=HOME36.people.find(p=>p.slot!==NET.myIndex);
 NET.otherOnline=!!other?.online;NET.otherPres=other?.presence||null;
 if(players.length===2){const p=players[1-NET.myIndex];p.g.visible=NET.otherOnline;}
}
function refreshWorld36(before){
 if(!players.length||S.phase!=='play')return;
 const changed=k=>JSON.stringify(before?.[k])!==JSON.stringify(S[k]);
 if(changed('home')){rebuildFurniture();refreshHomeExtras();LIFE34.undo=null;LIFE34.selection=null;LIFE34.selectedItem=null;}
 if(changed('p')){for(let i=0;i<2;i++){const look=x=>x&&[x.name,x.skin,x.hair,x.headwear,x.outfit,x.bodyBase,x.bodyBuild,x.face,x.beard,x.acc,x.graphic,x.colors,x.wear];if(JSON.stringify(look(before?.p?.[i]))!==JSON.stringify(look(S.p[i])))refreshAvatar(i);}}
 if(changed('life')){refreshGarden34();refreshShore34();refreshVisitor34();}
 if(changed('day')||changed('party')||changed('square')||changed('garden')){placeNPCs();rebuildSquare();rebuildGarden();}
 updateHUD();
}
function apply36(d,{enter=false,force=false}={}){
 if(!NET.on)return;people36(d);
 if(!d.state||(!force&&d.revision<HOME36.revision))return;
 const before=S,was=before?.phase,local={tmp:before?.tmp,bd:before?.bd,setup:before?.setup};
 const draft=HOME36.mode==='creator'&&before?.p?clone36(before.p[NET.myIndex]):null;
 HOME36.base=data36(d.state);HOME36.revision=d.revision;S=clone36(d.state);
 S.p.forEach((p,i)=>{const live=players[i]?.g?.position;p.pos=before?.p?.[i]?.pos||[live?.x??(-6.2+i),live?.z??4.4];});
 S.tmp=local.tmp||{};if(local.bd)S.bd=local.bd;if(local.setup)S.setup=local.setup;
 if(draft&&!force)S.p[NET.myIndex]=draft;
 if(enter||(S.phase==='play'&&(was!=='play'||players.length!==2))){
  for(const member of HOME36.people){const pos=member.presence;if(Number.isFinite(pos?.x)&&Number.isFinite(pos?.z))S.p[member.slot].pos=[pos.x,pos.z];}
  if(S.phase==='play'){HOME36.mode='world';NET.lobby=false;enterWorld();closePanel();people36(d);}
 }else refreshWorld36(before);
 if(HOME36.mode==='lobby'&&document.activeElement?.tagName!=='INPUT')renderLobby();
 else if(HOME36.mode==='cook'&&overlayOpen()){if(S.ck)renderCook();else{closePanel();HOME36.mode='world';}}
 else if(HOME36.mode==='party'&&overlayOpen()){if(S.party&&!S.party.done)renderParty();else{closePanel();HOME36.mode='world';}}
 else if(HOME36.mode==='day'&&overlayOpen())dayPanel36();
 else if(HOME36.mode==='panel'&&overlayOpen()&&panel.querySelector('.life34')&&LIFE_TABS34.some(([k])=>k===LIFE34.tab))openLife34(LIFE34.tab);
 status36();
}
async function flush36(){
 if(!NET.on||HOME36.sending)return;
 if(!HOME36.pending){
  if(!HOME36.base||HOME36.mode==='creator')return;
  const patches=diff36(HOME36.base,data36());if(!patches.length){status36();return;}
  HOME36.pending={op:'commit',code:NET.code,id:id36(),patches};keepPending36();
 }
 const serial=HOME36.serial;HOME36.sending=true;status36();
 try{
  const d=await api36(HOME36.pending);if(serial!==HOME36.serial)return;
  HOME36.pending=null;keepPending36();apply36(d,{force:true});
 }catch(e){
  if(serial!==HOME36.serial)return;
  if(e.code==='conflict'){
   HOME36.pending=null;keepPending36();LIFE34.undo=null;apply36(e.payload,{force:true});closePanel();HOME36.mode=S.phase==='play'?'world':'lobby';toast(e.message);
  }else if(e.status&&e.status<500&&!['in_use','sign_in'].includes(e.code)){
   HOME36.pending=null;keepPending36();if(HOME36.base)apply36({state:HOME36.base,revision:HOME36.revision,people:HOME36.people},{force:true});closePanel();toast(e.message);
  }else{HOME36.online=false;if(e.code==='in_use')sessionProblem36(e);else if(e.code==='sign_in')signInProblem36();}
 }finally{HOME36.sending=false;status36();}
}
async function poll36(force=false){
 if(!NET.on||HOME36.polling)return;
 const moving=players[NET.myIndex]?.moving||NET.otherPres?.mv;
 if(!force&&Date.now()-HOME36.lastPoll<(moving?190:700))return;
 HOME36.lastPoll=Date.now();HOME36.polling=true;const serial=HOME36.serial;
 try{
  const me=players[NET.myIndex],p=me&&S?.phase==='play'?{x:me.g.position.x,z:me.g.position.z,y:me.y||0,ry:me.g.rotation.y,mv:me.moving&&!overlayOpen(),busy:overlayOpen()}:null;
  const d=await api36({op:'sync',code:NET.code,revision:HOME36.revision,presence:p});if(serial!==HOME36.serial)return;
  if(HOME36.pending){people36(d);await flush36();}else if(HOME36.inAction||HOME36.sending)people36(d);else apply36(d);
 }catch(e){if(serial!==HOME36.serial)return;HOME36.online=false;NET.otherOnline=false;if(e.code==='in_use')sessionProblem36(e);else if(e.code==='sign_in')signInProblem36();}
 finally{HOME36.polling=false;status36();}
}
function signInProblem36(){openPanel('<h2>Sign in to reconnect</h2><p>Your pending household change is kept on this phone. Sign in with the same account, then return to your household.</p><a class="btn primary block" href="/signin-with-chatgpt?return_to=%2Fplay%2Findex.html" target="_top">Sign in with ChatGPT</a>');}
function sessionProblem36(e){HOME36.online=false;HOME36.mode='session';openPanel(`<h2>Your character is on another device</h2><p>${esc(e.message)}</p><div class="actions">${btn('Continue on this phone','onlineTakeover36',{code:NET.code},'primary block')}${btn('Back to title','onlineLeave36',{},'quiet')}</div>`);}
async function connect36(d){
 HOME36.serial++;NET.on=true;NET.myIndex=d.slot;NET.code=d.code;NET.isHost=false;NET.dirty=false;NET.room=null;NET.lobby=d.state.phase!=='play';AI.on=false;document.body.classList.add('net','shared-home36');
 HOME36.mode=NET.lobby?'lobby':'world';HOME36.base=null;HOME36.revision=-1;HOME36.pending=null;
 netRemember();apply36(d,{enter:true,force:true});
 try{HOME36.pending=JSON.parse(localStorage.getItem(pendingKey36())||'null');}catch(e){}
 if(HOME36.pending)await flush36();
 if(S.phase==='lobby'){if(!S.ready[NET.myIndex]){S.setup={step:'p'+NET.myIndex};HOME36.mode='creator';renderSetup();}else renderLobby();}
 HOME36.lastPoll=0;status36();
}
async function join36(code,takeover=false){
 HOME36.mode='joining';openPanel('<h2>Opening your shared home…</h2><p>Your household stays saved when either phone leaves.</p>');
 try{await connect36(await api36({op:'join',code,takeover}));}catch(e){if(e.code==='in_use'){NET.code=code;sessionProblem36(e);}else openPanel(`<h2>Could not open this household</h2><p>${esc(e.message)}</p>${btn('Try again','onlineResume36',{code},'primary')}${btn('Back','title',{},'quiet')}`);}
}
const title35=openTitle;
openTitle=function(){
 HOME36.mode='title';const saved=load(),hasLocal=saved?.p&&saved.phase==='play';
 const rooms=HOME36.rooms.map(r=>btn('Return to '+esc(r.name||'your household'),'onlineResume36',{code:r.code},'block',`Day ${r.day} · your character is saved`)).join('');
 const connection=HOME36.available?`<div class="actions">${rooms}${btn('Start our shared household','nethost',{},'primary block')}${btn('Join with a household code','netjoin',{},'block')}${hasLocal?btn('Copy this phone’s household online','nethost',{from:'local'},'quiet block'):''}</div>`:`<p class="hint">${HOME36.checked?'Shared households need the hosted game and a signed-in connection.':'Checking your shared households…'}</p>${btn('Check connection','onlineRefresh36',{},'quiet')}<a class="btn quiet" href="/signin-with-chatgpt?return_to=%2Fplay%2Findex.html" target="_top">Sign in</a>`;
 openPanel(`${lockupHTML()}<div id="titlemark"><p class="smallcaps">TWO PHONES · ONE HOUSEHOLD</p><h2 class="brush">A home for both of you.</h2><p>Each of you has your own character and a full-screen view. Share a home in Palm Court, meet in the courtyard, and make a life at your own pace.</p>${connection}<p class="small muted">Each person signs in on their own phone. Invite your partner to this private Site, then give them your household code.</p><details class="offline36"><summary>Play on this device</summary><p class="small">Companion and local two-player saves stay on this phone.</p>${hasLocal?btn('Continue this phone’s save','continue',{},'block'):''}${btn('Start with a companion','aiStart',{},'block')}${btn('Two players on one screen','newgame',{},'quiet block')}</details><p class="tiny">Build ${BUILD_ID} · Shared household preview</p></div>`);
};
netDetect=async function(){try{const d=await api36();HOME36.rooms=d.households;HOME36.available=NET.capable=true;}catch(e){HOME36.available=NET.capable=false;}HOME36.checked=true;if(HOME36.mode==='title')openTitle();};
ACTIONS.onlineRefresh36=()=>netDetect();
ACTIONS.nethost=async d=>{
 if(!HOME36.available)return;
 const old=S;S=d.from==='local'?clone36(load()):newState();if(!S?.p){S=old;return;}
 S.phase='lobby';S.ready=[false,false];S.dayVotes36=[0,0];S.household=S.household||'Our Palm Court home';S.net={};delete S.ai;delete S.ck;delete S.roof;
 S.p[0].name=S.p[0].name||'You';S.p[1].name=S.p[1].name||'Your partner';S.p.forEach(p=>p.pos=[-5.7,3.5]);
 if(S.sofa.state!=='placed'){if(!placeAuto('sofa'))S.home.storage.push('sofa');S.sofa.state='placed';}
 if(d.from!=='local'){S.time=15;S.home.storage.push('lamp');}
 if(S.bench35?.status==='delivery'){S.bench35.paused=true;S.bench35.arrived=false;}
 ensureMarket();life34();day34();benchState35();reconcile33();const state=data36();
 openPanel('<h2>Making room for both of you…</h2>');
 try{await connect36(await api36({op:'create',state,id:HOME36.createId||(HOME36.createId=id36())}));HOME36.createId=null;}catch(e){S=old;openPanel(`<h2>Could not open a household</h2><p>${esc(e.message)}</p>${btn('Back','title',{},'primary')}`);}
};
ACTIONS.netjoin=()=>{HOME36.mode='join';openPanel(`${lockupHTML('title')}<h2>Join your shared household</h2><p>Enter the code your partner sees in their household menu.</p><label for="jc">Household code</label><input id="jc" class="join36" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="24" placeholder="palm-…"><div class="actions">${btn('Join our home','netjoingo',{},'primary block')}${btn('Back','title',{},'quiet')}</div><p class="small muted">Use your own ChatGPT sign-in. Your partner also needs to share access to this private Site with you.</p>`);};
ACTIONS.netjoingo=()=>join36((document.getElementById('jc')?.value||'').trim().toLowerCase());
ACTIONS.onlineResume36=d=>join36(d.code);
ACTIONS.netresume=()=>{const s=netSaved();if(s)join36(s.code);};
ACTIONS.onlineTakeover36=d=>join36(d.code||NET.code,true);
ACTIONS.onlineRetry36=()=>flush36();
ACTIONS.netready=()=>{
 const i=NET.myIndex;S.p[i].name=(S.p[i].name||'').trim().slice(0,24)||(i?'Player 2':'Player 1');S.ready[i]=true;HOME36.mode='lobby';NET.lobby=true;delete S.setup;renderLobby();
};
HOME_LOCAL36.delete('netready');
ACTIONS.netmovein=()=>{if(!S.ready.every(Boolean)){toast('Both of you need to finish your characters.');return;}S.phase='play';delete S.setup;NET.lobby=false;HOME36.mode='world';enterWorld();closePanel();toast('Welcome home. Your furnishings have been delivered.');};
renderLobby=function(){
 HOME36.mode='lobby';NET.lobby=true;const i=NET.myIndex,other=1-i;
 openPanel(`${lockupHTML()}<p class="smallcaps">TWO PHONES · ONE HOME</p><h2>${esc(S.household)}</h2><p>You control ${esc(S.p[i].name||'your character')}. Your partner makes their own character on their phone.</p><div class="room-code36">${esc(NET.code)}</div><div class="row">${btn('Copy code','netcopy',{},'quiet')}${btn('Share invitation','netshare',{},'quiet')}</div><div class="card"><p>${esc(S.p[i].name)} · ${S.ready[i]?'Ready':'Making your character'}</p><p>${esc(S.p[other].name)} · ${S.ready[other]?'Ready':NET.otherOnline?'Making their character':'Waiting for them to join'}</p></div>${!S.ready[i]?btn('Make my character','setupstep',{v:'p'+i},'block'):''}<div class="actions">${S.ready.every(Boolean)?btn('Move in together','netmovein',{},'primary block'):'<p class="hint">You can move in once both characters are ready.</p>'}${btn('Leave for now','onlineLeave36',{},'quiet')}</div><p class="small muted">Your partner needs access to this private Site and their own sign-in. This code joins your household; it does not change Site access.</p>`);
};
ACTIONS.netlobby=()=>renderLobby();
ACTIONS.netcopy=async()=>{try{await navigator.clipboard.writeText(NET.code);toast('Household code copied.');}catch(e){toast(NET.code);}};
ACTIONS.netshare=async()=>{const url=new URL('/play/index.html',location.href).href,text='Come home to Palm Court. Join my household with code '+NET.code+'.';try{if(navigator.share)await navigator.share({title:'Compound Days',text,url});else{await navigator.clipboard.writeText(text+' '+url);toast('Invitation copied.');}}catch(e){toast('Your code is '+NET.code);}};
ACTIONS.onlineLeave36=async()=>{
 if(HOME36.pending){await flush36();if(HOME36.pending){toast('Your change is waiting to save. Reconnect before leaving.');return;}}
 try{if(NET.on)await api36({op:'leave',code:NET.code});}catch(e){}
 HOME36.serial++;NET.on=false;NET.otherOnline=false;NET.lobby=false;HOME36.base=null;HOME36.mode='title';S=null;document.body.classList.remove('net','shared-home36');status36();openTitle();netDetect();
};
ACTIONS.netleave=ACTIONS.onlineLeave36;
ACTIONS.onlineRoom36=()=>{HOME36.mode='room';openPanel(`<h2>${esc(S.household)}</h2><p>One phone each. Your home, purse, pantry, garden and neighbour stories are shared. Either person can return while the other is away.</p><div class="room-code36">${esc(NET.code)}</div><div class="actions">${btn('Copy household code','netcopy',{},'block')}${btn('Share invitation','netshare',{},'block')}${btn('Plan the next day','onlineDay36',{},'block')}${btn('Back to the compound','close',{},'primary block')}${btn('Leave for now','onlineLeave36',{},'quiet')}</div><p class="small muted">The shared day advances through activities. Live furniture carrying is still available in the local mode; this preview uses the home editor for shared decorating.</p>`);};
function dayPanel36(){HOME36.mode='day';const voted=S.dayVotes36?.[NET.myIndex]===S.day;openPanel(`<h2>Ready for tomorrow?</h2><p>${NET.otherOnline?'Both of you confirm before the household starts a new day.':'Your partner is away. You can continue the household’s next day.'}</p>${S.ck?'<p class="hint">Finish the meal in progress before changing the day.</p>':voted?'<p class="hint">You are ready. Waiting for your partner’s confirmation.</p>':btn('Ready for the next day','onlineDayVote36',{},'primary block')}${btn('Keep enjoying today','close',{},'quiet block')}`);}
ACTIONS.onlineDay36=dayPanel36;
const nextDay35=ACTIONS.nextday;
ACTIONS.onlineDayVote36=()=>{if(S.ck){toast('Finish the meal first.');return;}S.dayVotes36[NET.myIndex]=S.day;if(!NET.otherOnline||S.dayVotes36[1-NET.myIndex]===S.day){nextDay35();HOME36.mode='world';}else dayPanel36();};
ACTIONS.nextday=d=>{if(NET.on)dayPanel36();else nextDay35(d);};
const menu35=openMenu;
openMenu=function(){if(!NET.on)return menu35();HOME36.mode='menu';openPanel(`<h2>${esc(S.household)}</h2><p>${esc(pname(NET.myIndex))} · Day ${S.day} · ${naira(S.money)} in your shared purse</p><div class="actions">${btn('Our shared household','onlineRoom36',{},'primary block')}${btn('Your day in Palm Court','lifeTab',{v:'today'},'block')}${btn(S.ck?'Return to our meal':'Our kitchen','onlineKitchen36',{},'block')}${btn('Decorate our home','lifeTab',{v:'home'},'block')}${btn('Album','albumbtn',{},'block')}${btn('Plan tomorrow','onlineDay36',{},'block')}${btn(qualityOn()?'Use lighter graphics':'Use full graphics','quality',{},'quiet block')}${btn('Back to the compound','close',{},'quiet block')}</div><p class="small muted">Use one thumbstick and Act. On a keyboard use WASD or arrows, and E or Enter. Your menus only pause your character.</p><p class="tiny">Build ${BUILD_ID}</p>`);};
ACTIONS.onlineKitchen36=()=>openCookPick();
const cookPick35=openCookPick,renderCook35=renderCook,renderParty35=renderParty;
openCookPick=function(){if(NET.on&&S.ck){renderCook();return;}return cookPick35();};
renderCook=function(){if(NET.on)HOME36.mode='cook';renderCook35();if(NET.on&&NET.otherOnline)panel.querySelectorAll('[data-act="cookans"]').forEach(b=>{if(+b.dataset.i!==NET.myIndex)b.disabled=true;});};
renderParty=function(){if(NET.on)HOME36.mode='party';renderParty35();if(NET.on&&NET.otherOnline)panel.querySelectorAll('[data-act="ptpick"]').forEach(b=>{if(+b.dataset.i!==NET.myIndex)b.disabled=true;});};
const setup35=renderSetup;
renderSetup=function(){if(NET.on){HOME36.mode='creator';S.setup={step:'p'+NET.myIndex};}return setup35();};
const panel35=openPanel;
openPanel=function(html){
 if(NET.on)HOME36.mode=html.includes('id="titlemark"')?'title':html.includes('id="pv3d')?'creator':html.includes('TWO PHONES · ONE HOME')?'lobby':html.includes('Two stations. Trade')?'cook':html.includes('data-act="ptpick"')?'party':html.includes('Ready for tomorrow?')?'day':html.includes('Your character is on another device')?'session':'panel';
 return panel35(html);
};
const close35=closePanel;
closePanel=function(){if(NET.on)HOME36.mode='world';return close35();};
const dispatch35=dispatch;
dispatch=function(name,data={}){
 if(!NET.on)return dispatch35(name,data);
 if(HOME_LOCAL36.has(name)){
  if(['title','continue','newgame','aiStart','newconfirm'].includes(name)){toast('Leave your shared household from its menu first.');return;}
  const fn=ACTIONS[name];if(fn)return fn(data);return;
 }
 if(HOME36.pending||HOME36.sending||!HOME36.online){toast('Waiting for the household connection before making another change.');return;}
 if(data.i!==undefined&&+data.i!==NET.myIndex&&(PER_PLAYER.has(name)||['setp','hs','unpack'].includes(name))){if(NET.otherOnline||!['cookans','ptpick'].includes(name)){toast('That is your partner’s control.');return;}}
  const fn=ACTIONS[name];if(!fn)return;
 if(!['lifeCell','lifeSelect','lifeCancel','lifeRotate','lifeStore','lifeUndo','lifeTab','close'].includes(name))LIFE34.undo=null;
 const actionBefore=clone36(S);HOME36.inAction=true;
 try{fn(data);reconcile33();}catch(e){S=actionBefore;console.error('Shared action failed',name,e);toast('That action could not finish.');return;}
 finally{HOME36.inAction=false;}
 if(HOME36.mode!=='creator')return flush36();
};
// Shared state never uses the legacy host-only writer or room service.
writeState=async()=>{};netPush=()=>{};flushPushes=()=>{};netSavePhoto=()=>{};netLoadPhotos=async()=>0;
const clock35=advanceClock33;
advanceClock33=function(h){if(!NET.on)return clock35(h);};
const oldSave35=save;
save=function(){if(!NET.on)return oldSave35();reconcile33();if(!HOME36.inAction&&HOME36.base&&HOME36.mode!=='creator'&&!HOME36.sending)Promise.resolve().then(()=>flush36());};
netTick=function(dt,active){
 if(!NET.on)return;
 const p=NET.otherPres,o=players[1-NET.myIndex];
 if(o){o.g.visible=NET.otherOnline;if(NET.otherOnline&&p&&Number.isFinite(p.x)){
  const k=Math.min(1,dt*10);o.g.position.x+=(p.x-o.g.position.x)*k;o.g.position.z+=(p.z-o.g.position.z)*k;o.g.rotation.y=lerpAngle(o.g.rotation.y,p.ry||0,k);o.y=p.y||0;o.lvl=lvlOf(o.y);o.g.baseY=o.y;o.moving=!!p.mv&&!p.busy;o.t+=dt;animAvatar(o.g,o.t,o.moving,false,SPEED,dt);o.prev=[o.g.position.x,o.g.position.z];
 }}
 poll36();
};
// Proximity in a shared world must refer to this phone's character.
const near35=near34,home35=home34,market35=market34;
near34=function(x,z,r=2.7,i){return near35(x,z,r,NET.on?NET.myIndex:i);};
home34=function(){return NET.on?!!players[NET.myIndex]&&inFlat(players[NET.myIndex].g.position.x,players[NET.myIndex].g.position.z):home35();};
market34=function(){if(!NET.on)return market35();const p=players[NET.myIndex];return !!p&&(Math.hypot(p.g.position.x-20.8,p.g.position.z-7.1)<3.1||(p.g.position.x>13.5&&p.g.position.x<30&&Math.abs(p.g.position.z)<5));};
const build35=openBuild;
openBuild=function(){if(NET.on){openLife34('home');return;}return build35();};
// The first online slice uses transactional home placement, not unsynchronised physics.
ACT_HOOKS.unshift((i,kind)=>{if(NET.on&&['sofa','drop','roofprop','roofdrop','rprop','rdrop','rpick','rlower','benchSit35','benchStand35','benchEnd35'].includes(kind)){toast('Use Home to arrange furnishings in this shared-household preview.');return true;}return false;});
const roof35=startRoofSequence;
startRoofSequence=function(){if(!NET.on)return roof35();S.party.indoor=true;S.party.dry=[];S.party.wet=[];arriveGuests();setLightsOn(true);nextRound();};
const oldUpdateBall35=updateBall;
updateBall=function(dt){if(!NET.on)return oldUpdateBall35(dt);};
const sharedStatus36=document.createElement('div');sharedStatus36.id='shared36';sharedStatus36.hidden=true;sharedStatus36.setAttribute('role','status');sharedStatus36.setAttribute('aria-live','polite');document.body.appendChild(sharedStatus36);
setInterval(()=>{if(NET.on)poll36();},220);
window.addEventListener('online',()=>{if(NET.on)poll36(true);else netDetect();});
window.addEventListener('offline',()=>{HOME36.online=false;status36();});
document.addEventListener('visibilitychange',()=>{if(NET.on&&!document.hidden)poll36(true);});

const pushCrate35=tryPushCrate,pushProp35=tryPush,fish35=doFish;
tryPushCrate=function(...args){return NET.on?false:pushCrate35(...args);};
tryPush=function(...args){return NET.on?false:pushProp35(...args);};
doFish=function(i){return fish35(NET.on?NET.myIndex:i);};

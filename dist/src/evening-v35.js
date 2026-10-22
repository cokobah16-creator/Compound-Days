/* v35 veranda evening (plan 4.4, spec section 7). On day 3 or later, between 18:00 and 22:00, while a human player is in the flat or
   on the veranda row, Tunde, Mama Nkechi and Ada walk in from the gate to three standing spots in the open street just south of the
   veranda rail, face the veranda and say one line each (read from the LINES table, Ada's about the armchair when it is placed). The
   companion stands beside the player and the camera eases a quarter nearer for the first line. Nobody sits and there are no props.
   A missed evening repeats every day until it is seen; it is saved once seen (S.life.evening35={doneDay}). Off in online play.
   Loaded after days-v35.js. Every behaviour change wraps an earlier global and calls it. Top-level names are only EVENING35 and
   eveningTick35 (spec section 7); everything else lives in the block below. Wall-clock time goes through clock35() (tune-v35.js). */

const EVENING35={state:'idle',guests:['tunde','nkechi','ada'],spots:{},line:0,camFactor:1,nudgedDay:0,t:0,lineT:0,retryAt:0,lastNext:-1e9,
 lines:[],walkers:[],shown:false,el:null,checkAt:0,
 // a one-time event: pending from day 3 until seen; a missed evening repeats the next day
 pending(){return !!(S&&S.p&&!(typeof online34==='function'&&online34())&&S.day>=3&&!(S.life&&S.life.evening35&&S.life.evening35.doneDay));},
 done(){return !!(S&&S.life&&S.life.evening35&&S.life.evening35.doneDay);},
 doneToday(){return !!(S&&S.life&&S.life.evening35&&S.life.evening35.doneDay===S.day);},
 active(){return EVENING35.state!=='idle';},
 window(){return !!(S&&S.time>=18&&S.time<22);}};

// the per-frame step: start, arrival, the lines, the walk out (harness-callable; also a TICK hook below)
function eveningTick35(dt){return EVENING35.tick(dt);}

{
 const E=EVENING35;
 const online=()=>typeof online34==='function'&&online34();
 const silent=()=>typeof silentMode==='function'&&silentMode();
 const isAI=i=>typeof AI!=='undefined'&&AI.on&&i===AI.i;
 const partyOn=()=>!!(S.party&&S.party.on&&!S.party.done);
 const guided=()=>typeof guided33==='function'&&guided33();
 const carrying=()=>typeof sofa!=='undefined'&&!!(sofa&&sofa.carrying);
 const adaVisiting=()=>!!(S.life&&S.life.visit&&S.life.visit.day===S.day&&S.life.visit.k==='ada');
 // the human player to stage the evening around: one in the flat first, else the first human
 const human=()=>{let first=null;for(const p of players){if(isAI(p.i))continue;if(inFlat(p.g.position.x,p.g.position.z))return p;if(!first)first=p;}return first;};
 const COPY={
  gate:'Tunde, Mama Nkechi and Ada are at the gate.',gate2:'Tunde and Mama Nkechi are at the gate.',
  nudge:'The neighbours are coming by your veranda this evening. Head home.',
  memory:'Tunde, Mama Nkechi and Ada came by the veranda this evening.',
  // used only if the LINES table is missing or has nothing for this neighbour
  fallback:{tunde:'We were passing, so we came to see how you are settling in.',nkechi:'Good evening, my dear. The compound feels warmer with you in it.',ada:'Your veranda looks lived in already. Sit well.'}};
 E.copy=COPY;

 /* ---------- 7.2 Spots ---------- */
 // candidates built once: three rows in the street south of the veranda rail, nearest row first
 const ROWS=[7.8,8.5,9.2],CANDS=[];
 for(let r=0;r<ROWS.length;r++)for(let k=0;k<16;k++)CANDS.push({x:Math.round((-7.4+0.3*k)*100)/100,z:ROWS[r],row:r,ok:false,sight:false,used:false});
 E.candidates=CANDS;
 // the camera looks from CAM_DIR (south-south-east); a guest near the camera-to-player line would hide the player's legs
 const HX=CAM_DIR.x/Math.hypot(CAM_DIR.x,CAM_DIR.z),HZ=CAM_DIR.z/Math.hypot(CAM_DIR.x,CAM_DIR.z);
 E.inSight=(cx,cz,px,pz)=>{const dx=cx-px,dz=cz-pz;return dx*HX+dz*HZ>0&&Math.abs(dx*HZ-dz*HX)<0.45;};
 const valid=c=>{if(c.z<=7.4||inFlat(c.x,c.z)||levelAt(c.x,c.z)!==0||blocked(c.x,c.z,PR))return false;
  for(const p of players)if(Math.hypot(p.g.position.x-c.x,p.g.position.z-c.z)<0.9)return false;return true;};
 // pick a validated standing spot per walking guest; null when fewer than needed are free
 E.pickSpots=function(){const h=human();if(!h)return null;
  for(const c of CANDS){c.used=false;c.ok=valid(c);c.sight=false;if(c.ok)for(const p of players)if(!isAI(p.i)&&E.inSight(c.x,c.z,p.g.position.x,p.g.position.z)){c.sight=true;break;}}
  const px=Math.min(-3.2,Math.max(-7.0,h.g.position.x)),res={},placed=[],skipAda=adaVisiting();
  for(let gi=0;gi<E.guests.length;gi++){const k=E.guests[gi];if(k==='ada'&&skipAda)continue;const tx=px+(gi-1)*1.1;let best=null,bs=1e9,alt=null,as=1e9;
   for(const c of CANDS){if(!c.ok||c.used)continue;let far=true;for(const q of placed)if(Math.hypot(q.x-c.x,q.z-c.z)<1.0){far=false;break;}if(!far)continue;
    const s=c.row*100+Math.abs(c.x-tx);if(!c.sight){if(s<bs){bs=s;best=c;}}else if(s<as){as=s;alt=c;}}
   const pick=best||alt;if(!pick)return null;pick.used=true;placed.push(pick);res[k]=[pick.x,pick.z];}
  return res;};

 /* ---------- caption ---------- */
 const BG=[0xf8,0xf2,0xdf];
 const lum=rgb=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};return 0.2126*f(rgb[0])+0.7152*f(rgb[1])+0.0722*f(rgb[2]);};
 const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
 // the name takes the neighbour's colour, darkened only as far as needed to read at 4.5:1 on the cream caption (Mama Nkechi's gold would not)
 const nameCol={};
 const nameColour=k=>{if(nameCol[k])return nameCol[k];const hex=(CAST[k]&&CAST[k].c)||'#2f4a3e';let rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  for(let n=0;n<40&&ratio(rgb,BG)<4.5;n++)rgb=rgb.map(v=>Math.floor(v*0.92));return nameCol[k]='#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('');};
 E.nameColour=nameColour;
 const el=document.createElement('div');el.id='evening35';el.setAttribute('role','status');el.setAttribute('aria-live','polite');E.el=el;
 el.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('.evening35-next'):null;if(!b)return;b.blur();E.next();});
 const render=()=>{const L=E.lines[E.line];if(!L)return;const c=(CAST[L.k]&&CAST[L.k].c)||'#888';el.style.borderLeftColor=c;el.dataset.who=L.k;
  el.innerHTML=`<span class="evening35-name" style="color:${nameColour(L.k)}">${esc(CAST[L.k].name)}</span><p class="evening35-line">${esc(L.text)}</p><button type="button" class="evening35-next">${E.line>=E.lines.length-1?'Goodnight':'Next'}</button>`;};
 const show=on=>{if(on===E.shown)return;E.shown=on;el.classList.toggle('on',on);if(document.body)document.body.classList.toggle('evening35-on',on);};
 const css=`#evening35{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(32px + env(safe-area-inset-bottom,0px));
 width:min(560px,calc(100vw - 32px));box-sizing:border-box;z-index:15;background:#f8f2df;color:#2f4a3e;
 border-left:6px solid #888;border-radius:14px;padding:12px 14px 12px 16px;box-shadow:0 6px 24px #1d382333;display:none}
#evening35.on{display:block}#evening35 .evening35-name{font-weight:800;font-size:13px;letter-spacing:.06em;text-transform:uppercase}
#evening35 .evening35-line{margin:4px 0 8px;font-size:16px;line-height:1.45}
#evening35 .evening35-next{min-height:44px;min-width:96px;border-radius:12px;border:0;background:#3f6853;color:#fffae9;font:inherit;font-weight:700;cursor:pointer}
#evening35 .evening35-next:focus-visible{outline:3px solid #E3A72F;outline-offset:2px}
@media (hover:none) and (pointer:coarse){#evening35{bottom:calc(108px + env(safe-area-inset-bottom,0px))}
 body.evening35-on #inv0,body.evening35-on #inv1,body.evening35-on #pr0,body.evening35-on #pr1{visibility:hidden}}`;
 E.css=css;
 {const st=document.createElement('style');st.id='evening-v35-css';st.textContent=css;
  const put=()=>{document.body.appendChild(st);document.body.appendChild(el);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',put);else put();}

 /* ---------- 7.3 Arrival ---------- */
 const cool={};
 const lineFor=k=>{let l=null;try{if(typeof line35==='function'&&typeof lineCtx35==='function')l=line35(k,Object.assign(lineCtx35(k),{evening:true}));}catch(e){if(typeof console!=='undefined')console.warn('evening35 line',k,e);}
  return {k,id:l&&l.id||null,text:(l&&l.text)||COPY.fallback[k]};};
 E.start=function(){const sp=E.pickSpots();if(!sp){E.retryAt=clock35()+1000;return false;}
  E.spots=sp;E.walkers.length=0;const visiting=adaVisiting();
  for(let gi=0;gi<E.guests.length;gi++){const k=E.guests[gi],n=npcs[k];if(!n)continue;
   if(!(k in cool))cool[k]=Math.min(n.cool||0,25);n.cool=1e9;               // no NPC_CALLS bubbles while they visit
   if(k==='ada'&&visiting){E.spots.ada=[n.g.position.x,n.g.position.z];continue;}   // already on the veranda: she speaks from there
   const [x,z]=sp[k],gx=3.6+0.4*gi;n.g.visible=true;n.g.position.set(gx,0,9.6);n.g.rotation.y=Math.atan2(x-gx,9.0-9.6);
   n.route=[[gx,9.6],[x,9.0],[x,z]];n.ri=0;n.dest=[x,z,Math.PI];n.hideAtEnd=false;E.walkers.push(k);}
  E.state='arriving';E.t=0;E.line=0;E.lines=[];
  const w=LIFE34.waypoint;if(w&&w.name==='Flat 3'&&w.x===-4.1&&w.z===6.3){LIFE34.waypoint=null;if(typeof refreshMarker34==='function')refreshMarker34();}   // home now: the nudge marker has done its job
  if(!silent())toast(visiting?COPY.gate2:COPY.gate);return true;};
 // arrival done (or the 20 s timeout): stragglers step onto their spots, and the lines begin
 const settle=k=>{const n=npcs[k],s=E.spots[k];if(!n||!s)return;n.route=null;n.g.visible=true;n.g.position.set(s[0],0,s[1]);n.g.rotation.y=Math.PI;n.dest=[s[0],s[1],Math.PI];n.home=n.dest;};
 const beginTalk=()=>{for(const k of E.walkers)if(npcs[k]&&npcs[k].route)settle(k);
  E.lines=E.guests.filter(k=>npcs[k]).map(lineFor);E.line=0;E.lineT=0;E.state='talking';render();};
 E.beginTalk=beginTalk;

 /* ---------- 7.4 Talking ---------- */
 // advance one line (the Next button, Act through the forced hotspot, or the 8 s timer); calls within 300 ms of the last advance are ignored
 E.next=function(){if(E.state!=='talking')return false;const now=clock35();if(now-E.lastNext<300)return false;E.lastNext=now;
  if(E.line>=E.lines.length-1){finish();return true;}E.line++;E.lineT=0;render();return true;};
 const finish=()=>{life34().evening35={doneDay:S.day};E.state='leaving';E.line=0;E.lineT=0;show(false);
  if(typeof cue35==='function')cue35('evening',{day:S.day});remember(COPY.memory,'moment');
  for(const k of E.walkers){const n=npcs[k],s=E.spots[k];if(!n||!s)continue;n.route=[[s[0],9.0],[4.0,9.6]];n.ri=0;n.dest=[4.0,9.6,0];n.hideAtEnd=false;}
  if(E.guests.includes('ada')&&adaVisiting()&&npcs.ada){npcs.ada.cool=cool.ada||0;delete cool.ada;}
  save();};
 // at the gate a guest goes back to the usual schedule
 const handOff=k=>{const n=npcs[k];n.cool=cool[k]||0;delete cool[k];const spot=NPC_SPOTS[k]&&NPC_SPOTS[k][slot()];if(spot)walkNPC(n,spot,false);else walkNPC(n,null,true);};
 // stop without marking the evening done, so it repeats; everyone goes back to the schedule
 E.abort=function(place){if(E.state==='idle')return false;E.state='idle';
  for(const k of E.walkers){const n=npcs[k];if(n){n.route=null;n.dest=null;n.hideAtEnd=false;}}E.walkers.length=0;E.lines=[];E.line=0;E.lineT=0;E.t=0;E.camFactor=1;E.spots={};show(false);
  for(const k in cool){if(npcs[k])npcs[k].cool=cool[k];delete cool[k];}
  if(place!==false&&typeof placeNPCs==='function'&&Object.keys(npcs).length){try{placeNPCs();}catch(e){if(typeof console!=='undefined')console.warn('evening35 abort',e);}}
  return true;};

 let last=null;
 E.tick=function(dt){if(!S||!S.p||S.phase!=='play'||!players.length){last=null;return;}
  const now=clock35(),wd=last===null?0:Math.min(Math.max(0,now-last),1000);last=now;const open=overlayOpen();
  // the camera eases a quarter nearer for the first line, then back (0.8 s each way)
  const want=E.state==='talking'&&E.line===0?0.75:1,step=(dt||0)*0.25/0.8;
  if(E.camFactor<want)E.camFactor=Math.min(want,E.camFactor+step);else if(E.camFactor>want)E.camFactor=Math.max(want,E.camFactor-step);
  if(E.state!=='idle'&&(online()||partyOn())){E.abort();return;}
  if(E.state==='idle'){
   if(!E.pending()||!E.window()||now<E.checkAt)return;E.checkAt=now+250;     // the start and nudge checks run four times a second
   if(!home34()){
    if(E.nudgedDay!==S.day&&!open&&!guided()&&!partyOn()){E.nudgedDay=S.day;LIFE34.waypoint={x:-4.1,z:6.3,name:'Flat 3'};if(typeof refreshMarker34==='function')refreshMarker34();if(!silent())toast(COPY.nudge);}
    return;}
   if(open||guided()||partyOn()||(S.roof&&S.roof.on)||carrying()||now<E.retryAt)return;
   E.start();return;}
  if(E.state==='arriving'){if(!open)E.t+=wd;let all=true;for(const k of E.walkers)if(npcs[k]&&npcs[k].route){all=false;break;}
   if(all||E.t>=20000)beginTalk();}
  else if(E.state==='talking'){if(!open){E.lineT+=wd;if(E.lineT>=8000)E.next();}}
  else if(E.state==='leaving'){for(let j=E.walkers.length-1;j>=0;j--){const k=E.walkers[j],n=npcs[k];if(!n){E.walkers.splice(j,1);continue;}if(!n.route){handOff(k);E.walkers.splice(j,1);}}
   if(!E.walkers.length){E.state='idle';E.spots={};for(const k in cool){if(npcs[k])npcs[k].cool=cool[k];delete cool[k];}}}
  show(E.state==='talking'&&!open);};
 TICK_HOOKS.push((dt)=>{try{eveningTick35(dt);}catch(e){if(typeof console!=='undefined')console.warn('evening35',e);}});

 // Act while the neighbours talk: a forced hotspot for human players; pressing it (the shared base 'hs' action) advances the line
 const HS={id:'evening35',label:'Listen',dist:0};
 HOTSPOT_HOOKS.push(i=>E.state==='talking'&&!isAI(i)?HS:null);
 ACT_HOOKS.unshift((i,kind)=>{if(kind==='evening35'){E.next();return true;}return false;});

 /* ---------- wrappers ---------- */
 // snapshot the walking guests before a schedule change and put them back after it, so reroute/placeNPCs cannot pull them away mid-visit
 const keep=fn=>function(){if(E.state==='idle'||!E.walkers.length)return fn.apply(this,arguments);
  const snap=E.walkers.map(k=>{const n=npcs[k];return n&&{n,route:n.route,ri:n.ri,dest:n.dest,home:n.home,hide:n.hideAtEnd,vis:n.g.visible,x:n.g.position.x,z:n.g.position.z,ry:n.g.rotation.y};});
  const r=fn.apply(this,arguments);
  for(const s of snap){if(!s)continue;const n=s.n;n.route=s.route;n.ri=s.ri;n.dest=s.dest;n.home=s.home;n.hideAtEnd=s.hide;n.g.visible=s.vis;n.g.position.set(s.x,0,s.z);n.g.rotation.y=s.ry;}
  return r;};
 // wrap: the slot-change reroute leaves the visiting guests on their evening route or spot
 reroute=keep(reroute);
 // wrap: placeNPCs leaves the visiting guests where they are
 placeNPCs=keep(placeNPCs);

 // wrap: a new day ends an unfinished evening first (it is not marked done, so it repeats)
 const nextPrev=ACTIONS.nextday;ACTIONS.nextday=function(){E.abort();return nextPrev.apply(this,arguments);};
 // wrap: entering the world (continue, move-in) starts with no evening in progress; enterWorld then places everyone afresh
 const enterPrev=enterWorld;enterWorld=function(){E.abort(false);last=null;return enterPrev.apply(this,arguments);};

 // wrap: the camera eases nearer (camFactor) along its own direction, after every other camera wrapper
 const camPrev=updateCameras;updateCameras=function(dt){const r=camPrev.apply(this,arguments);
  if(E.camFactor<1&&players.length&&typeof v21Dist!=='undefined'){const si=singleIdx();for(let i=0;i<2;i++){if(si>=0&&i!==si)continue;if(!cams[i]||!focus[i])continue;
   cams[i].position.copy(focus[i]).addScaledVector(CAM_DIR,v21Dist[i]*E.camFactor);cams[i].lookAt(focus[i]);}}
  return r;};
 // wrap: while a neighbour speaks, the human views' camera fit includes them (eight reused corner points)
 const BOX=[];for(let k=0;k<8;k++)BOX.push(new THREE.Vector3());
 const ptsPrev=v21InteractionPoints;v21InteractionPoints=function(i,joint){const pts=ptsPrev.apply(this,arguments);
  if(E.state!=='talking'||isAI(i))return pts;const L=E.lines[E.line],n=L&&npcs[L.k];if(!n||!n.g.visible)return pts;const x=n.g.position.x,z=n.g.position.z;let k=0;
  for(const dx of [-.44,.44])for(const y of [0,1.98])for(const dz of [-.36,.36])pts.push(BOX[k++].set(x+dx,y,z+dz));return pts;};
 // wrap: during the evening the companion stands beside the player (east, west or north of them, inside the flat) instead of following behind
 const goalPrev=aiGoal;aiGoal=function(p,dt){if(E.state==='idle'||!(typeof AI!=='undefined'&&AI.on&&p&&p.i===AI.i))return goalPrev.apply(this,arguments);
  const s=E.companionSpot();if(!s)return goalPrev.apply(this,arguments);if(s.stop>1)return s;
  const px=p.g.position.x,pz=p.g.position.z;
  return Math.hypot(s.x-px,s.z-pz)<1.5||lineClear(px,pz,s.x,s.z,p.lvl||0)?s:aiNavTo(p,s.x,s.z,s.stop);};   // straight there when the way is clear, else round by the NAV graph
 // the companion's evening place: east, west or north of the human, free and inside the flat; else close to the human
 E.companionSpot=function(){const h=human();if(!h)return null;const hx=h.g.position.x,hz=h.g.position.z;
  for(const [ox,oz] of [[.9,0],[-.9,0],[0,-.9]]){const x=hx+ox,z=hz+oz;if(!blocked(x,z,PR)&&inFlat(x,z))return {x,z,stop:.25};}
  return {x:hx,z:hz,stop:1.2};};

 /* ---------- 7.6 Today card ---------- */
 // wrap: Today says when the neighbours are coming, sends you home in the window, and remembers the evening once it happened
 const todayPrev=todayHTML34;todayHTML34=function(){const h=todayPrev.apply(this,arguments);
  if(online()||!(E.pending()||E.doneToday())||typeof h!=='string')return h;const at=h.indexOf('<div class="life-chips34">');if(at<0)return h;
  let head,text,b='';
  if(E.state!=='idle'&&!E.doneToday()){head='At your veranda';text='The neighbours are outside the flat now.';}
  else if(E.doneToday()){head='A good evening';text='The neighbours came by the veranda this evening.';}
  else if(S.time<18){if(h.includes('data-morning="evening-again"'))return h; // the morning card above already says it (integration: no twin card)
   head='The neighbours are coming by';text='Tunde, Mama Nkechi and Ada will stop at your veranda between six and ten this evening. Be at home to see them.';}
  else if(S.time<22&&!home34()){head='They are on their way';text='Head home to the veranda before ten.';b=btn('Head home','lifeGo',{v:'home'},'primary');}
  else if(S.time<22){head='They are on their way';text='Stay by the veranda. They will be at the gate soon.';}
  else{head='Another evening, then';text='The neighbours will try again tomorrow, between six and ten in the evening.';}
  return h.slice(0,at)+`<div class="life-note34 evening35-card"><p class="life-kicker">THIS EVENING</p><h3>${head}</h3><p>${text}</p>${b}</div>`+h.slice(at);};
}

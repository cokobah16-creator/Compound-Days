/* v35 veranda evening (plan 4.4, spec section 7). On day 3 or later, between 18:00 and 22:00, while a human player is in the flat or
   on the veranda row, Tunde, Mama Nkechi and Ada walk in from the gate to three standing spots in the open street just south of the
   veranda rail, face the veranda and say one line each (read from the LINES table, Ada's about the armchair when it is placed). The
   companion stands beside the player. For the first line the camera eases nearer, up to a quarter, but only as far as the player and
   all three guests stay in view; in a phone's portrait view, and at 1280x800, that is almost nothing. One smoothed camera runs from the
   trigger to the hand-back: the guests' standing spots come into the framing over the first 1.5 s of the walk-in (while the guests are still
   off-screen) and leave it over 1.5 s from Goodnight, and the camera distance moves towards the fitted one by at most 2.4% a frame (inwards
   only 0.95% while they talk), so the evening has no camera jumps. Nobody sits and there are no props. While they arrive and talk, other
   people keep out of the visit's patch and the camera's foreground (walkers turn back, the keke and residents on their schedules wait at its
   edge), and world labels over the group are hidden for the talk; they leave along the rail, clear of the camera's line to the player. The nudge toast gives way to
   an open journal page (Today's evening card says the same).
   A missed evening repeats every day until it is seen; it is saved once seen (S.life.evening35={doneDay}). Off in online play.
   Loaded after days-v35.js. Every behaviour change wraps an earlier global and calls it. Top-level names are only EVENING35 and
   eveningTick35 (spec section 7); everything else lives in the block below. Wall-clock time goes through clock35() (tune-v35.js). */

const EVENING35={state:'idle',guests:['tunde','nkechi','ada'],spots:{},line:0,camFactor:1,nudgedDay:0,t:0,lineT:0,retryAt:0,lastNext:-1e9,
 lines:[],walkers:[],shown:false,el:null,checkAt:0,awayT:0,hold:0,yaw:{},
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
 // (an unfinished guided first evening does not hold this back: the base lets that evening run past day 1, and this one starts on day 3)
 const carrying=()=>typeof sofa!=='undefined'&&!!(sofa&&sofa.carrying);
 const adaVisiting=()=>!!(S.life&&S.life.visit&&S.life.visit.day===S.day&&S.life.visit.k==='ada');
 // the human player to stage the evening around: one in the flat first, else the first human
 const human=()=>{let first=null;for(const p of players){if(isAI(p.i))continue;if(inFlat(p.g.position.x,p.g.position.z))return p;if(!first)first=p;}return first;};
 const COPY={
  gate:'Tunde, Mama Nkechi and Ada are at the gate.',gate2:'Tunde and Mama Nkechi are at the gate.',
  nudge:'The neighbours are coming by your veranda this evening. Head home.',
  memory:'The evening Tunde, Mama Nkechi and Ada came by the veranda.',
  sleepTitle:'The neighbours are coming by',sleepText:'Tunde, Mama Nkechi and Ada want to come by your veranda this evening, between six and ten. Sleep anyway?',
  // used only if the LINES table is missing or has nothing for this neighbour
  fallback:{tunde:'We were passing, so we came to see how you are settling in.',nkechi:'Good evening, my dear. The compound feels warmer with you in it.',ada:'Your veranda looks lived in already.'}};
 E.copy=COPY;

 /* ---------- 7.2 Spots ---------- */
 // candidates built once: three rows in the street south of the veranda rail, nearest row first, every 0.15 m
 const ROWS=[7.8,8.5,9.2],CANDS=[];
 for(let r=0;r<ROWS.length;r++)for(let k=0;k<57;k++)CANDS.push({x:Math.round((-9.8+0.15*k)*100)/100,z:ROWS[r],row:r,ok:false,sight:false,used:false});
 E.candidates=CANDS;
 // the camera looks from CAM_DIR (south-south-east); a guest near the camera-to-player line would hide the player's legs
 const HX=CAM_DIR.x/Math.hypot(CAM_DIR.x,CAM_DIR.z),HZ=CAM_DIR.z/Math.hypot(CAM_DIR.x,CAM_DIR.z);
 E.inSight=(cx,cz,px,pz)=>{const dx=cx-px,dz=cz-pz;return dx*HX+dz*HZ>0&&Math.abs(dx*HZ-dz*HX)<0.7;};
 // facing: a listener turns towards the player but never more than 65 degrees from the camera (no backs to the camera); the speaker
 // faces the bisector between the player and the camera, at most 50 degrees from it (a three-quarter face). (cx,cz) is the camera,
 // or a point along CAM_DIR when there is none.
 const wrapA=a=>a>Math.PI?a-2*Math.PI:a<-Math.PI?a+2*Math.PI:a,LIS=Math.PI*13/36,SPK=Math.PI*5/18;
 E.faceYaw=(x,z,px,pz,cx,cz,speaker)=>{if(cx===undefined){cx=x+HX;cz=z+HZ;}const ac=Math.atan2(cx-x,cz-z),d=wrapA(Math.atan2(px-x,pz-z)-ac);
  return wrapA(ac+(speaker?Math.max(-SPK,Math.min(SPK,d/2)):Math.max(-LIS,Math.min(LIS,d))));};
 const valid=c=>{if(c.z<=7.4||inFlat(c.x,c.z)||levelAt(c.x,c.z)!==0||blocked(c.x,c.z,PR))return false;
  for(const p of players)if(Math.hypot(p.g.position.x-c.x,p.g.position.z-c.z)<0.9)return false;return true;};
 // pick a validated standing spot per walking guest; null when fewer than needed are free
 E.pickSpots=function(){const h=human();if(!h)return null;
  // the companion's evening place beside the player counts too: a guest in front of it would hide it (used only when nothing else is free)
  const cs=typeof AI!=='undefined'&&AI.on?E.companionSpot():null,csOK=!!(cs&&cs.stop<=1);
  for(const c of CANDS){c.used=false;c.ok=valid(c);c.sight=false;if(c.ok)for(const p of players)if(!isAI(p.i)&&E.inSight(c.x,c.z,p.g.position.x,p.g.position.z)){c.sight=true;break;}
   if(c.ok&&csOK&&!c.sight&&E.inSight(c.x,c.z,cs.x,cs.z))c.sight=true;}
  const px=Math.min(-3.0,Math.max(-7.4,h.g.position.x)),res={},placed=[],skipAda=adaVisiting();
  // a row along the rail from just west of the player to 1.8 m west: a narrow portrait view holds them all with the player, and the
  // camera (south-south-east) sees each one turned towards the player in three-quarter. East of the player the line to the camera leans
  // across them, so a guest there would stand in the sightline or have to turn away from the player to keep the camera off its back.
  const TX=[-0.3,-1.05,-1.8];      // 0.75 m apart: from the camera's angle they still do not cover each other
  for(let gi=0;gi<E.guests.length;gi++){const k=E.guests[gi];if(k==='ada'&&skipAda)continue;const tx=px+TX[gi];let best=null,bs=1e9,alt=null,as=1e9;
   for(const c of CANDS){if(!c.ok||c.used)continue;let far=true;for(const q of placed)if(Math.hypot(q.x-c.x,q.z-c.z)<0.74){far=false;break;}if(!far)continue;
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
body.evening35-active #life-guide34{display:none!important}
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
   const [x,z]=sp[k],gx=3.6+0.4*gi,h=human(),yaw=h?E.faceYaw(x,z,h.g.position.x,h.g.position.z):Math.PI;E.yaw[k]=yaw;n.g.visible=true;n.g.position.set(gx,0,9.6);n.g.rotation.y=Math.atan2(x-gx,9.0-9.6);
   n.route=[[gx,9.6],[x,9.0],[x,z]];n.ri=0;n.dest=[x,z,yaw];n.hideAtEnd=false;E.walkers.push(k);}
  E.state='arriving';E.t=0;E.hold=0;E.line=0;E.lines=[];E.awayT=0;E.camWait=false;
  const w=LIFE34.waypoint;if(w&&w.name==='Flat 3'&&w.x===-4.1&&w.z===6.3){LIFE34.waypoint=null;if(typeof refreshMarker34==='function')refreshMarker34();}   // home now: the nudge marker has done its job
  if(!silent())toast(visiting?COPY.gate2:COPY.gate);return true;};
 // arrival done (or the 20 s timeout): stragglers step onto their spots (and face at once, without a turn), and the lines begin
 const settle=k=>{const n=npcs[k],s=E.spots[k];if(!n||!s)return;const yaw=k in E.yaw?E.yaw[k]:Math.PI;delete turns[k];n.route=null;n.g.visible=true;n.g.position.set(s[0],0,s[1]);n.g.rotation.y=yaw;n.dest=[s[0],s[1],yaw];n.home=n.dest;};
 // the companion that could not walk round in time steps onto its place beside the player (only the human's view is drawn)
 const placeCompanion=()=>{if(!(typeof AI!=='undefined'&&AI.on))return;const p=players[AI.i],s=E.companionSpot();if(!p||!s||s.stop>1)return;
  if(Math.hypot(p.g.position.x-s.x,p.g.position.z-s.z)>1.6){p.y=0;p.lvl=0;p.g.position.set(s.x,0,s.z);p.prev=[s.x,s.z];AI.path=null;AI.rescue=-1;}};
 const beginTalk=()=>{for(const k of E.walkers)if(npcs[k]&&npcs[k].route)settle(k);placeCompanion();
  E.lines=E.guests.filter(k=>npcs[k]).map(lineFor);E.line=0;E.lineT=0;E.state='talking';render();};
 E.beginTalk=beginTalk;

 /* ---------- 7.4 Talking ---------- */
 // advance one line (the Next button, Act through the forced hotspot, or the 8 s timer); calls within 300 ms of the last advance are ignored
 E.next=function(){if(E.state!=='talking')return false;const now=clock35();if(now-E.lastNext<300)return false;E.lastNext=now;
  if(E.line>=E.lines.length-1){finish();return true;}E.line++;E.lineT=0;render();return true;};
 const finish=()=>{life34().evening35={doneDay:S.day};E.state='leaving';E.line=0;E.lineT=0;show(false);if(typeof AI!=='undefined')AI.rescue=-1;
  if(typeof cue35==='function')cue35('evening',{day:S.day});remember(COPY.memory,'moment');
  // they leave along the street side of the rail, crossing the camera's line to the player only beside the rail, and turn for the gate
  // once 1 m clear of that line, so nobody walks between the camera and the player
  const h=human(),hx=h?h.g.position.x:DOOR_X,hz=h?h.g.position.z:DOOR_OUT,rz=ROWS[0],ex=hx+(rz-hz)*HX/HZ+1.0;
  for(const k of E.walkers){const n=npcs[k],s=E.spots[k];if(!n||!s)continue;n.route=[[s[0],rz],[Math.max(ex,s[0]),rz],[4.0,9.6]];n.ri=0;n.dest=[4.0,9.6,0];n.hideAtEnd=false;}
  if(E.guests.includes('ada')&&adaVisiting()&&npcs.ada){npcs.ada.cool=cool.ada||0;delete cool.ada;}
  save();};
 // at the gate a guest goes back to the usual schedule
 const handOff=k=>{const n=npcs[k];n.cool=cool[k]||0;delete cool[k];const spot=NPC_SPOTS[k]&&NPC_SPOTS[k][slot()];if(spot)walkNPC(n,spot,false);else walkNPC(n,null,true);};
 // stop without marking the evening done, so it repeats; everyone goes back to the schedule
 E.abort=function(place){if(E.state==='idle')return false;E.state='idle';E.awayT=0;if(typeof AI!=='undefined')AI.rescue=-1;E.showLabels();
  for(const k of E.walkers){const n=npcs[k];if(n){n.route=null;n.dest=null;n.hideAtEnd=false;}}E.walkers.length=0;E.lines=[];E.line=0;E.lineT=0;E.t=0;E.camFactor=1;E.spots={};show(false);
  for(const k in cool){if(npcs[k])npcs[k].cool=cool[k];delete cool[k];}
  if(place!==false&&typeof placeNPCs==='function'&&Object.keys(npcs).length){try{placeNPCs();}catch(e){if(typeof console!=='undefined')console.warn('evening35 abort',e);}}
  return true;};

 let last=null,bodyActive=false;
 E.tick=function(dt){if(!S||!S.p||S.phase!=='play'||!players.length){last=null;return;}
  const now=clock35(),wd=last===null?0:Math.min(Math.max(0,now-last),1000);last=now;const open=overlayOpen();
  // the camera eases a quarter nearer for the first line, then back (0.8 s each way)
  const want=E.state==='talking'&&E.line===0?0.75:1,step=(dt||0)*0.25/0.8;
  if(E.camFactor<want)E.camFactor=Math.min(want,E.camFactor+step);else if(E.camFactor>want)E.camFactor=Math.max(want,E.camFactor-step);
  if(E.state!=='idle'&&(online()||partyOn())){E.abort();return;}
  if(E.state==='idle'){
   if(!E.pending()||!E.window()||now<E.checkAt)return;E.checkAt=now+250;     // the start and nudge checks run four times a second
   if(!home34()){
    if(E.nudgedDay!==S.day&&!open&&!partyOn()){E.nudgedDay=S.day;LIFE34.waypoint={x:-4.1,z:6.3,name:'Flat 3'};if(typeof refreshMarker34==='function')refreshMarker34();if(!silent())toast(COPY.nudge);}
    return;}
   if(open||partyOn()||(S.roof&&S.roof.on)||carrying()||now<E.retryAt)return;
   E.start();return;}
  // nobody home for three seconds while they arrive or talk: they leave without it counting, so it repeats
  if(E.state==='arriving'||E.state==='talking'){if(home34())E.awayT=0;else if((E.awayT+=wd)>=3000){E.abort();return;}}
  // once everyone is on a spot they have half a second to finish turning to the veranda (the turns settle in about 0.3 s) before the first line,
  // longer (up to 1.5 s) while the camera is still arriving at the talking framing (E.camWait, set by the camera wrapper below)
  if(E.state==='arriving'){if(!open)E.t+=wd;let all=true;for(const k of E.walkers)if(npcs[k]&&npcs[k].route){all=false;break;}
   E.hold=all?E.hold+(open?0:wd):0;if((E.hold>=500&&!E.camWait)||E.hold>=1500||E.t>=20000)beginTalk();}
  else if(E.state==='talking'){if(!open){E.lineT+=wd;if(E.lineT>=8000)E.next();}}
  else if(E.state==='leaving'){for(let j=E.walkers.length-1;j>=0;j--){const k=E.walkers[j],n=npcs[k];if(!n){E.walkers.splice(j,1);continue;}if(!n.route){handOff(k);E.walkers.splice(j,1);}}
   if(!E.walkers.length){E.state='idle';E.spots={};for(const k in cool){if(npcs[k])npcs[k].cool=cool[k];delete cool[k];}}}
  show(E.state==='talking'&&!open);
  const act=E.state!=='idle';if(act!==bodyActive){bodyActive=act;if(document.body&&document.body.classList)document.body.classList.toggle('evening35-active',act);}};
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
 const enterPrev=enterWorld;enterWorld=function(){E.abort(false);last=null;E.camUsed[0]=E.camUsed[1]=1;E.camHeld[0]=E.camHeld[1]=false;E.camW=0;return enterPrev.apply(this,arguments);};

 const near=(i,n,r)=>{const p=players[i];return !!(p&&Math.hypot(p.g.position.x-n.g.position.x,p.g.position.z-n.g.position.z)<=r);};
 // do the guests within 6 m and the player of view i all stand inside the camera fit's usable area (v21Viewport's margins) with the
 // camera at factor f of the fitted distance? (the camera looks along -CAM_DIR, so its axes are v21Right and v21Up)
 E.fits=function(i,f){const p=players[i];if(!p||!focus[i])return true;const vp=v21Viewport(i),tanV=Math.tan(THREE.MathUtils.degToRad(cams[i].fov/2)),tanH=tanV*vp.w/vp.h;
  const d=v21Dist[i]*f,cx=focus[i].x+CAM_DIR.x*d,cy=focus[i].y+CAM_DIR.y*d,cz=focus[i].z+CAM_DIR.z*d,yLo=-1+2*vp.bottom/vp.h,yHi=1-2*vp.top/vp.h;
  const inside=(x,y,z)=>{const qx=x-cx,qy=y-cy,qz=z-cz,dep=-(qx*CAM_DIR.x+qy*CAM_DIR.y+qz*CAM_DIR.z);if(dep<=0.5)return false;
   const sx=(qx*v21Right.x+qz*v21Right.z)/(dep*tanH),sy=(qx*v21Up.x+qy*v21Up.y+qz*v21Up.z)/(dep*tanV);return Math.abs(sx)<=0.82&&sy>=yLo&&sy<=yHi;};
  const box=(x,y,z)=>{for(const dx of [-.44,.44])for(const h of [-.06,1.98])for(const dz of [-.36,.36])if(!inside(x+dx,y+h,z+dz))return false;return true;};
  if(!box(p.g.position.x,p.y||0,p.g.position.z))return false;
  for(const k of E.guests){const n=npcs[k];if(n&&n.g.visible&&near(i,n,6)&&!box(n.g.position.x,0,n.g.position.z))return false;}return true;};
 // each frame while the guests arrive, talk or leave: the base loop turns every idle NPC within 4 m to face the nearest player (index.html,
 // the npcs loop in tick, which runs just before updateCameras); turn the guests back. Walking guests face their way; standing guests
 // face as E.faceYaw says, the speaker in three-quarter, using the human view's camera when there is a single view. The guest who speaks
 // next already turns in to the speaker's 50 degrees as a listener, so the change of speaker never has to snap to meet that limit.
 // Turns are eased (a critically damped follow that settles in about 0.3 s, so a change of speaker or setting off is never a snap),
 // and while they talk every frame keeps a guest inside its limit around the camera: 50 degrees for the speaker, 65 for a listener
 // (the turn from the walk in is eased too, and finishes in the half second before the first line).
 const TURN_W=16,turns={};E.turns=turns;
 const turnTo=(k,target,dt)=>{let w=turns[k];if(!w)return (turns[k]={cur:target,v:0}).cur;
  const e=wrapA(w.cur-target),x=Math.exp(-TURN_W*dt),a=w.v+TURN_W*e;w.v=(w.v-TURN_W*a*dt)*x;w.cur=wrapA(target+(e+a*dt)*x);return w.cur;};
 const faceGuests=dt=>{if(E.state==='idle'){for(const k in turns)delete turns[k];return;}const h=human();if(!h)return;dt=Math.max(0,Math.min(+dt||0,0.1));
  const si=singleIdx(),cam=si>=0&&cams[si]?cams[si].position:null;
  const L=E.state==='talking'?E.lines[E.line]:null,nx=E.state==='talking'?E.lines[E.line+1]:{k:E.guests.find(g=>npcs[g])};
  for(const k of E.guests){const n=npcs[k];if(!n||!n.g.visible||!E.spots[k])continue;
   if(n.route){if(E.walkers.includes(k)){const t=n.route[n.ri];if(t)n.g.rotation.y=turnTo(k,Math.atan2(t[0]-n.g.position.x,t[1]-n.g.position.z),dt);}continue;}
   if(E.state==='leaving')continue;const x=n.g.position.x,z=n.g.position.z,spk=!!(L&&L.k===k),cx=cam?cam.x:x+HX,cz=cam?cam.z:z+HZ;
   let y=E.faceYaw(x,z,h.g.position.x,h.g.position.z,cx,cz,spk);
   if(!spk&&nx&&nx.k===k){const ac=Math.atan2(cx-x,cz-z),c=wrapA(y-ac);if(Math.abs(c)>SPK)y=wrapA(ac+Math.sign(c)*SPK);}
   y=turnTo(k,y,dt);const ac=Math.atan2(cx-x,cz-z),c=wrapA(y-ac),lim=spk?SPK:LIS;
   if(E.state==='talking'&&Math.abs(c)>lim){y=turns[k].cur=wrapA(ac+Math.sign(c)*lim);turns[k].v=0;}
   n.g.rotation.y=y;}};
 E.faceGuests=faceGuests;
 // wrap: one smoothed camera from the trigger to the hand-back, after every other camera wrapper. The base fit (visual-v21) widens at once and
 // eases in by about a fifth of the gap a frame; here the fitted distance it reached is recovered and the distance used (E.camD, written back
 // to v21Dist so the base starts from it next frame) moves towards it by at most 2.4% a 30 fps frame, and inwards only 0.95% while they talk (outwards it may still use 2.4%, so a
 // player walking along the veranda mid-line is not cut: a still scene never needs it); the base's
 // focus is corrected to that distance. On top of it the camera eases nearer for the first line (camFactor): the factor aimed for is the
 // larger of camFactor and the smallest factor that fits (found by halving over a fixed range, so a still scene gives the same answer every
 // frame) plus a 0.002 margin, so it never flickers; the factor used (camUsed) moves towards it by at most 0.8% a frame, and the distance
 // itself (fitted distance times factor) never changes by more than the same limits in a frame. After the evening the camera stays
 // steered until it has reached the normal fit (E.camHeld), so the hand-back has no jump. The guests' share of the framing (E.camW) ramps in
 // over 1.5 s from the trigger and out over 1.5 s from Goodnight. While they arrive, E.camWait says the camera has not yet arrived at the
 // talking framing (the hold before the first line waits for it). Then the guests' facing.
 E.camUsed=[1,1];E.camHeld=[false,false];E.camW=0;E.camWait=false;
 const CAM_STEP=0.008,CAM_MAX=0.024,CAM_TALK=0.0095,RAMP=1.5;
 const fitFrom=(i,lo)=>{if(E.fits(i,Math.max(0,lo-0.002)))return lo;if(!E.fits(i,1))return 1;let a=0.5,b=1;
  for(let n=0;n<16;n++){const m=(a+b)/2;if(E.fits(i,m))b=m;else a=m;}return Math.max(lo,Math.min(1,b+0.002));};
 const camPrev=updateCameras;updateCameras=function(dt){const t=Math.max(0,Math.min(+dt||0,0.1)),v21=typeof v21Dist!=='undefined';
  E.camW=E.state==='arriving'||E.state==='talking'?Math.min(1,E.camW+t/RAMP):E.state==='leaving'?Math.max(0,E.camW-t/RAMP):0;
  const pre=v21?[v21Dist[0],v21Dist[1]]:null,r=camPrev.apply(this,arguments);
  if(players.length&&v21){const si=singleIdx(),f30=t*30,limIn=Math.pow(1+(E.state==='talking'?CAM_TALK:CAM_MAX),f30),limOut=Math.pow(1+CAM_MAX,f30),kU=Math.pow(1+CAM_STEP,f30),alpha=1-Math.pow(.002,t);let wait=false;
   for(let i=0;i<2;i++){if((si>=0&&i!==si)||!cams[i]||!focus[i]||isAI(i)){E.camUsed[i]=1;E.camHeld[i]=false;continue;}if(E.state==='idle'&&!E.camHeld[i])continue;
    const p=pre[i],b=v21Dist[i],fit=b>p?b:alpha>1e-9?p+(b-p)/alpha:p,D=Math.min(p*limOut,Math.max(p/limIn,fit));   // the base widened to fit, or eased a share of the way
    const vp=v21Viewport(i),tanV=Math.tan(THREE.MathUtils.degToRad(cams[i].fov/2)),a=sofa&&sofa.carrying?Math.max(alpha,.35):alpha;
    v21Dist[i]=D;focus[i].addScaledVector(v21Up,a*(vp.bottom-vp.top)/vp.h*tanV*(b-D));                   // the base aimed its focus for distance b
    const u0=E.camUsed[i];let u=u0;
    if(E.camFactor<1||u<1){const want=E.camFactor<1?fitFrom(i,E.camFactor):1;u=want<u?Math.max(want,u/kU):Math.min(want,u*kU);if(u<1&&!E.fits(i,u))u=Math.min(fitFrom(i,u),u0*kU);}
    const d0=p*u0,d=Math.min(d0*limOut,Math.max(d0/limIn,D*u));u=d/D;E.camUsed[i]=u;
    E.camHeld[i]=E.state!=='idle'||D!==fit||u<1;if(E.state==='arriving'&&(E.camW<1||Math.abs(fit-D)>0.002*D))wait=true;
    camPosS[i].copy(focus[i]).addScaledVector(CAM_DIR,d);cams[i].position.copy(camPosS[i]);cams[i].lookAt(focus[i]);}
   E.camWait=wait;}
  faceGuests(dt);labels();return r;};
 // wrap: from the trigger until the guests have gone, the human views' camera fit includes each guest's standing spot within 6 m of the
 // player, as the box a guest stands in (0.88 x 2 x 0.72 m), drawn from the player towards the spot by the share E.camW (24 reused points)
 const BOX=[];for(let k=0;k<24;k++)BOX.push(new THREE.Vector3());
 const ptsPrev=v21InteractionPoints;v21InteractionPoints=function(i,joint){const pts=ptsPrev.apply(this,arguments);
  if(E.state==='idle'||isAI(i)||!Array.isArray(pts)||!players[i])return pts;const h=players[i].g.position,w=E.camW;let k=0;
  for(const g of E.guests){const n=npcs[g],s=E.spots[g];if(!n||!n.g.visible||!s||Math.hypot(s[0]-h.x,s[1]-h.z)>6)continue;const x=h.x+(s[0]-h.x)*w,z=h.z+(s[1]-h.z)*w;
   for(const dx of [-.44,.44])for(const y of [0,1.98])for(const dz of [-.36,.36])pts.push(BOX[k++].set(x+dx,y,z+dz));}
  return pts;};
 // wrap: during the evening the companion stands beside the player (east, west or north of them, inside the flat) instead of following behind
 // the only way between the room and the veranda is the door in the south wall (x -4.25 to -3.95): its inner and outer steps
 const DOOR_X=-4.1,DOOR_IN=5.05,DOOR_OUT=6.35,onV=z=>z>6.05;     // on the veranda row, clear of the doorway (the wall runs to 5.85)
 E.door={x:DOOR_X,inZ:DOOR_IN,outZ:DOOR_OUT};
 const goalPrev=aiGoal;aiGoal=function(p,dt){if(E.state==='idle'||!(typeof AI!=='undefined'&&AI.on&&p&&p.i===AI.i))return goalPrev.apply(this,arguments);
  const s=E.companionSpot();if(!s)return goalPrev.apply(this,arguments);if(s.stop>1)return s;
  const px=p.g.position.x,pz=p.g.position.z,inDoor=Math.abs(px-DOOR_X)<0.22;
  if(onV(s.z)!==onV(pz)){                                                       // the other side of the south wall: by the door
   if(inDoor&&pz>DOOR_IN-0.3&&pz<DOOR_OUT+0.3)return {x:DOOR_X,z:onV(s.z)?DOOR_OUT:DOOR_IN,stop:.15};
   const dz=onV(pz)?DOOR_OUT:DOOR_IN;return aiNavTo(p,DOOR_X,dz,.15);}                    // straight when clear, else by the NAV graph (and its rescue when stuck)
  return Math.hypot(s.x-px,s.z-pz)<0.6?s:aiNavTo(p,s.x,s.z,s.stop);};
 // the companion's evening place: beside the human on the veranda row when they are out there, else east, west or north of them inside; else close to the human
 E.companionSpot=function(){const h=human();if(!h)return null;const hx=h.g.position.x,hz=h.g.position.z;
  const opts=onV(hz)?[[.9,0],[-.9,0],[1.35,0],[-1.35,0]]:[[.9,0],[-.9,0],[0,-.9]];
  for(const [ox,oz] of opts){const x=hx+ox,z=hz+oz;if(!blocked(x,z,PR)&&inFlat(x,z)&&onV(z)===onV(hz))return {x,z,stop:.25};}
  return {x:hx,z:hz,stop:1.2};};

 /* ---------- Everyone else keeps clear while they arrive and talk ---------- */
 // the visit's patch: the player, the companion and the guests' standing spots, 1.1 m wider all round, and from there the strip along the
 // camera's direction for 16 m (the foreground, past where any phone or desktop camera sits). An ambient walker who would step into it turns
 // back the way it came (so nobody waits by the guests' way out to the gate); the keke and residents walking their schedules wait at its
 // edge, standing, until the talk is over; anyone already inside walks on out. Nothing is held while the guests leave.
 const KEEP=1.1,KEEP_A=16;
 E.keepOut=function(){if(E.state!=='arriving'&&E.state!=='talking')return null;const h=human();if(!h)return null;const px=h.g.position.x,pz=h.g.position.z;
  let a0=0,a1=0,l0=0,l1=0;const add=(x,z)=>{const dx=x-px,dz=z-pz,a=dx*HX+dz*HZ,l=dx*HZ-dz*HX;a0=Math.min(a0,a);a1=Math.max(a1,a);l0=Math.min(l0,l);l1=Math.max(l1,l);};
  for(const k in E.spots){const s=E.spots[k];if(s)add(s[0],s[1]);}
  if(typeof AI!=='undefined'&&AI.on&&players[AI.i])add(players[AI.i].g.position.x,players[AI.i].g.position.z);
  return {px,pz,a0:a0-KEEP,a1:Math.max(a1+KEEP,KEEP_A),l0:l0-KEEP,l1:l1+KEEP};};
 E.inKeep=(Z,x,z,pad)=>{if(!Z)return false;pad=pad||0;const dx=x-Z.px,dz=z-Z.pz,a=dx*HX+dz*HZ,l=dx*HZ-dz*HX;return a>=Z.a0-pad&&a<=Z.a1+pad&&l>=Z.l0-pad&&l<=Z.l1+pad;};
 // would this frame's step from (x,z) towards (tx,tz), s metres long, take someone from outside into it? (pad: half their size)
 const enters=(Z,x,z,tx,tz,s,pad)=>{if(E.inKeep(Z,x,z,pad))return false;const dx=tx-x,dz=tz-z,d=Math.hypot(dx,dz);if(d<1e-6)return false;const f=Math.min(1,s/d);return E.inKeep(Z,x+dx*f,z+dz*f,pad);};
 // wrap: the ambient walkers and the keke (index.html updateAmbient). A walker heads back to the route point it came from before the
 // original's step; the keke keeps its place.
 if(typeof updateAmbient==='function'){const ambPrev=updateAmbient;updateAmbient=function(dt){const Z=E.keepOut();if(!Z)return ambPrev.apply(this,arguments);
  const t=Math.max(0,+dt||0);
  for(const w of (typeof walkers!=='undefined'?walkers:[])){const g=w.g,q=w.r&&w.r[w.i];if(!g||!q||!g.visible)continue;
   if(enters(Z,g.position.x,g.position.z,q[0],q[1],w.sp*t+0.05,0.3))w.i=(w.i+w.r.length-1)%w.r.length;}
  const kk=typeof keke!=='undefined'&&keke?keke:null,kx=kk&&enters(Z,kk.position.x,kk.position.z,kk.position.x+kk.dir,kk.position.z,4.2*t+0.05,0.9)?kk.position.x:null;
  const r=ambPrev.apply(this,arguments);
  if(kx!==null)kk.position.x=kx;return r;};}
 // wrap: residents walking their schedules (index.html updateNPCWalk); the guests walk their own routes
 const walkPrev=updateNPCWalk;updateNPCWalk=function(dt){const Z=E.keepOut();if(!Z)return walkPrev.apply(this,arguments);const t=Math.max(0,+dt||0),held=[];
  for(const k in npcs){if(E.guests.includes(k))continue;const n=npcs[k],q=n.route&&n.route[n.ri];if(!q||!n.g.visible)continue;
   if(enters(Z,n.g.position.x,n.g.position.z,q[0],q[1],1.7*t+0.05,0.3)){held.push([n,n.route]);n.route=null;}}
  const r=walkPrev.apply(this,arguments);
  for(const [n,rt] of held){n.route=rt;n.t=(n.t||0)+t;animAvatar(n.g,n.t,false,false,0,t);}return r;};

 /* ---------- World labels clear of the group while they talk ---------- */
 // a floating world label (the base's sign sprites, such as Suya over the grill) that a human view shows over any guest or the player is
 // hidden for the rest of the talk and shown again when it ends (or the evening stops)
 const hidLabels=[],_lv=new THREE.Vector3(),_lr=new THREE.Vector3(),_lu=new THREE.Vector3();
 E.hidLabels=hidLabels;
 E.showLabels=()=>{for(const m of hidLabels)m.visible=true;hidLabels.length=0;};
 // a screen box (normalised device coordinates) round the points given; null when any is behind the camera
 const ndcBox=(c,pts)=>{let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of pts){_lv.copy(p).project(c);if(_lv.z>1||_lv.z<-1)return null;x0=Math.min(x0,_lv.x);x1=Math.max(x1,_lv.x);y0=Math.min(y0,_lv.y);y1=Math.max(y1,_lv.y);}return [x0,x1,y0,y1];};
 const bodyPts=[];for(let k=0;k<8;k++)bodyPts.push(new THREE.Vector3());const lblPts=[];for(let k=0;k<4;k++)lblPts.push(new THREE.Vector3());
 const body=(c,x,y,z)=>{let k=0;for(const dx of [-.3,.3])for(const h of [0,1.9])for(const dz of [-.3,.3])bodyPts[k++].set(x+dx,y+h,z+dz);return ndcBox(c,bodyPts);};
 const labels=()=>{if(E.state!=='talking'){if(hidLabels.length)E.showLabels();return;}if(typeof FADEABLE==='undefined')return;
  const si=singleIdx();
  for(let i=0;i<2;i++){if((si>=0&&i!==si)||isAI(i)||!cams[i]||!players[i])continue;const c=cams[i];c.updateMatrixWorld();
   const boxes=[],pp=players[i].g.position,b0=body(c,pp.x,players[i].y||0,pp.z);if(b0)boxes.push(b0);
   for(const k of E.guests){const n=npcs[k];if(n&&n.g.visible){const b=body(c,n.g.position.x,0,n.g.position.z);if(b)boxes.push(b);}}
   _lr.setFromMatrixColumn(c.matrixWorld,0);_lu.setFromMatrixColumn(c.matrixWorld,1);
   for(const m of FADEABLE){if(!m.isSprite||!m.visible)continue;let k=0;
    for(const a of [-.5,.5])for(const b of [-.5,.5])lblPts[k++].copy(m.position).addScaledVector(_lr,a*m.scale.x).addScaledVector(_lu,b*m.scale.y);
    const r=ndcBox(c,lblPts);if(!r)continue;
    for(const q of boxes)if(r[0]<q[1]+0.02&&r[1]>q[0]-0.02&&r[2]<q[3]+0.02&&r[3]>q[2]-0.02){m.visible=false;hidLabels.push(m);break;}}}};

 /* ---------- The nudge toast and the journal ---------- */
 // wrap: while a journal page is open the bridge puts the toast just below the tab strip, over Today's first card. The nudge says what
 // Today's evening card says, so with a journal page open it goes at once (without its fade over the card); other toasts are untouched.
 if(typeof toastSpot34b==='function'){const spotPrev=toastSpot34b;toastSpot34b=function(){const r=spotPrev.apply(this,arguments);
  const t=document.getElementById('toast');
  if(t&&t.classList&&t.classList.contains('on')&&t.textContent===COPY.nudge&&overlayOpen()&&panel.classList.contains('life-panel34')){
   t.style.transition='none';t.classList.remove('on');void t.offsetWidth;t.style.transition='';clearTimeout(t._t);}
  return r;};
  // wrap: and as the journal opens, not a frame later
  const lifePrev=openLife34;openLife34=function(){const r=lifePrev.apply(this,arguments);toastSpot34b();return r;};}

 /* ---------- Waiting for six, and Sleep before the evening ---------- */
 const canWait=()=>E.pending()&&E.state==='idle'&&S.time<18&&home34();
 // wait on the veranda until six (as the sofa's sit-and-wait does): the visit then starts on the next check
 ACTIONS.evening35Wait=function(){if(!canWait())return;ACTIONS.sitwait({t:18});E.checkAt=0;E.retryAt=0;};
 const sleepPrev=ACTIONS.sleep;
 // wrap: Sleep on a day the neighbours are still coming asks once (Wait until six / Sleep anyway); a second Sleep, or Sleep anyway, sleeps
 ACTIONS.sleep=function(d){if(silent()||(d&&d.anyway)||!E.pending()||S.time>=22||E.state!=='idle'||E.askedDay===S.day)return sleepPrev.apply(this,arguments);
  E.askedDay=S.day;const wait=canWait()?btn('Wait on the veranda until six','evening35Wait',{},'primary block'):S.time>=18?btn('Stay up for them','close',{},'primary block'):btn('Head home','lifeGo',{v:'home'},'primary block');
  openPanel(`<h2>${esc(COPY.sleepTitle)}</h2><p>${esc(COPY.sleepText)}</p><div class="actions">${wait}${btn('Sleep anyway','sleep',{anyway:1},'quiet')}</div>`);};
 E.askedDay=0;

 /* ---------- 7.6 Today card ---------- */
 // wrap: Today says when the neighbours are coming, sends you home in the window, and remembers the evening once it happened
 const todayPrev=todayHTML34;todayHTML34=function(){const h=todayPrev.apply(this,arguments);
  if(online()||!(E.pending()||E.doneToday())||typeof h!=='string')return h;const at=h.indexOf('<div class="life-chips34">');if(at<0)return h;
  let head,text,b='';
  if(E.state!=='idle'&&!E.doneToday()){head='At your veranda';text='The neighbours are outside the flat now.';}
  else if(E.doneToday()){head='A good evening';text='The neighbours came by the veranda this evening.';}
  else if(S.time<18){const w=canWait()?btn('Wait on the veranda until six','evening35Wait',{},'quiet'):'';
   if(h.includes('data-morning="evening-again"')){                    // the morning card above already says it (no twin card): it gets the wait button
    if(!w)return h;const m=h.indexOf('data-morning="evening-again"'),e=h.indexOf('</div>',m);return e<0?h:h.slice(0,e)+w+h.slice(e);}
   head='The neighbours are coming by';text='Tunde, Mama Nkechi and Ada will stop at your veranda between six and ten this evening. Be at home to see them.';b=w;}
  else if(S.time<22&&!home34()){head='They are on their way';text='Head home to the veranda before ten.';b=btn('Head home','lifeGo',{v:'home'},'primary');}
  else if(S.time<22){head='They are on their way';text='Stay by the veranda. They will be at the gate soon.';}
  else{head='Another evening, then';text='The neighbours will try again tomorrow, between six and ten in the evening.';}
  return h.slice(0,at)+`<div class="life-note34 evening35-card"><p class="life-kicker">THIS EVENING</p><h3>${head}</h3><p>${text}</p>${b}</div>`+h.slice(at);};
}

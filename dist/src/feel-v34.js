/* Feel the actions (v34): the sofa keeps off the stairs, the companion carries its end, the first
   evening completes with a companion, stage timings are logged, phones step graphics down, and the
   wardrobe loads in parallel. Everything wraps the earlier functions; the base page is untouched. */
'use strict';
const FEEL34={maxLevel:0.5,levelEps:1e-3,carrySpeed:0.92,spacing:0.1,trail:null,lastL:null,stairsToastAt:-99,releaseAt:-99,follow:{d:0,target:null},
 perf:{level:0,ratio:null,under:0,acc:0,n:0,mean:0,windows:0,steps:[],lite:false},prefetch:{requested:[],done:0,total:0}};

/* ---------- 1. Carry: stairs rule, companion follower, release ---------- */
// Flat ground and the low veranda slabs are fine; the stair ramp, landing and roof (raised ground that is not a diorama slab) are not.
// With `from` (the level the mover already stands on) the rule is relative: a step that keeps or lowers the level is always allowed and only a rise is refused, so a holder or sofa on the stairs can always come back down.
function carryLevelOK34(x,z,from){ const lv=levelAt(x,z); if(from!==undefined&&lv<=from+FEEL34.levelEps) return true; return lv<FEEL34.maxLevel&&(lv<=0||dioramaLevel(x,z)>0); }
function carryHolder34(p){ return !!(p&&sofa&&sofa.carrying&&sofa.holder&&sofa.holder.includes(p.i)); }
function carryCompanion34(){ return typeof AI!=='undefined'&&AI.on&&sofa&&sofa.carrying&&sofa.holder&&sofa.holder.includes(AI.i)?players[AI.i]:null; }
function stairsToast34(){ const now=performance.now()/1000; if(now-FEEL34.stairsToastAt<6) return; FEEL34.stairsToastAt=now; toast('The sofa goes through the narrow passage on the left of the courtyard, not up the stairs.'); }
// A holder cannot step up onto raised ground (back stairs, roof): each rising axis is cancelled like a wall, a level or falling step passes. The human holder walks at 0.92x in companion mode so the pair keeps pace.
const move34=movePlayer;
movePlayer=function(p,dx,dz){
 if(carryHolder34(p)){
  if(AI.on&&p.i!==AI.i){ const k=FEEL34.carrySpeed/0.7; dx*=k; dz*=k; }
  const x=p.g.position.x,z=p.g.position.z; let hit=false, nx=x;
  if(dx){ if(carryLevelOK34(x+dx,z,levelAt(x,z))) nx=x+dx; else { dx=0; hit=true; } } if(dz&&!carryLevelOK34(nx,z+dz,levelAt(nx,z))){ dz=0; hit=true; }
  if(hit) stairsToast34(); if(!dx&&!dz) return;
 }
 return move34(p,dx,dz);
};
// The sofa itself (centre, quarter points and both ends) may not rest over the stairs either; with `from` (the highest level it rests on now) it may come down but not go up.
function sofaLevelHit34(cx,cz,yaw,from){ const dx=Math.cos(yaw),dz=-Math.sin(yaw),h=(sofa?sofa.L:1.6)/2; for(const t of [-h,-h/2,0,h/2,h]) if(!carryLevelOK34(cx+dx*t,cz+dz*t,from)) return true; return false; }
function sofaLevelNow34(){ if(!sofa||!sofa.g) return 0; const yaw=sofa.g.rotation.y,dx=Math.cos(yaw),dz=-Math.sin(yaw),h=sofa.L/2; let m=0; for(const t of [-h,-h/2,0,h/2,h]) m=Math.max(m,levelAt(sofa.g.position.x+dx*t,sofa.g.position.z+dz*t)); return m; }
// The reference level for a carried sofa is the highest of its own resting samples and the two holders' current levels: the holders cannot rise, so the sofa can never climb above them, and a pair that grabbed from the upper grab window on the ramp (holder at z about 8.6) moves on the first frame instead of freezing.
function sofaRefLevel34(){ let m=sofaLevelNow34(); if(sofa&&sofa.holder) for(const i of sofa.holder){ const p=i===null||i===undefined?null:players[i]; if(p&&p.g) m=Math.max(m,levelAt(p.g.position.x,p.g.position.z)); } return m; }
const collides34=sofaCollides;
sofaCollides=function(cx,cz,yaw){ return collides34(cx,cz,yaw)||sofaLevelHit34(cx,cz,yaw,sofaRefLevel34()); };
// Same maths as the base carry; the distance correction also respects the level rule, and in companion mode the companion takes the whole correction when it can, so the human is not halved.
const carryUpdate34=updateSofaCarry;
updateSofaCarry=function(){
 if(!sofa||!sofa.carrying) return;
 const a=players[sofa.holder[0]], b=players[sofa.holder[1]]; if(!a||!b){ sofa.carrying=false; sofa.holder=[null,null]; trailReset34(); return; } /* a half-held sofa is dropped rather than handed to the base, which would throw */
 let dx=b.g.position.x-a.g.position.x, dz=b.g.position.z-a.g.position.z; let d=Math.hypot(dx,dz)||0.001; const D=sofa.L+0.3;
 if(d>D+0.02||d<D-0.4){
  const target=d>D?D:D-0.4; const full=d-target; const ux=dx/d, uz=dz/d; const ok=(x,z,m)=>!blocked(x,z,PR,{noSofa:true})&&carryLevelOK34(x,z,levelAt(m.g.position.x,m.g.position.z));
  const mineA=!NET.on||a.i===NET.myIndex, mineB=!NET.on||b.i===NET.myIndex; const comp=carryCompanion34(); let done=false;
  if(comp){ const s=comp===a?1:-1; const cx=comp.g.position.x+ux*full*s, cz=comp.g.position.z+uz*full*s; if(ok(cx,cz,comp)){ comp.g.position.x=cx; comp.g.position.z=cz; done=true; } }
  if(!done){ const adj=full/2; const ax=a.g.position.x+ux*adj, az=a.g.position.z+uz*adj, bx=b.g.position.x-ux*adj, bz=b.g.position.z-uz*adj; if(mineA&&ok(ax,az,a)){ a.g.position.x=ax; a.g.position.z=az; } if(mineB&&ok(bx,bz,b)){ b.g.position.x=bx; b.g.position.z=bz; } }
  dx=b.g.position.x-a.g.position.x; dz=b.g.position.z-a.g.position.z; d=Math.hypot(dx,dz)||0.001;
 }
 const cx=(a.g.position.x+b.g.position.x)/2, cz=(a.g.position.z+b.g.position.z)/2; const yaw=Math.atan2(-dz,dx);
 if(sofaCollides(cx,cz,yaw)){ if(sofaLevelHit34(cx,cz,yaw,sofaRefLevel34())) stairsToast34(); const comp=carryCompanion34(); if(comp){ const h=comp===a?b:a; h.g.position.set(h.prev[0],0,h.prev[1]); } /* the companion keeps walking toward its clear spot; only the human is held */ else { if(!NET.on||a.i===NET.myIndex) a.g.position.set(a.prev[0],0,a.prev[1]); if(!NET.on||b.i===NET.myIndex) b.g.position.set(b.prev[0],0,b.prev[1]); } sofa.bump=(sofa.bump||0)+1; return; }
 sofa.g.position.x=cx; sofa.g.position.z=cz; sofa.g.rotation.y=yaw; sofa.g.position.y=0.35;
 a.g.rotation.y=Math.atan2(dx,dz); b.g.rotation.y=Math.atan2(-dx,-dz);
 if(sofaInFlat()) sofaSuccess();
};
function trailReset34(){ FEEL34.trail=null; FEEL34.lastL=null; FEEL34.follow.target=null; }
function trailSeed34(){ const comp=carryCompanion34(); const lead=comp&&players[sofa.holder.find(i=>i!==comp.i)]; if(!comp||!lead) return; FEEL34.trail=[[comp.g.position.x,comp.g.position.z],[lead.g.position.x,lead.g.position.z]]; FEEL34.lastL=[lead.g.position.x,lead.g.position.z]; AI.stuck=0; AI.path=null; AI.detour=null; AI.rescue=-1; }
// Walk back from the leader along the trail to the point whose straight-line distance is exactly c.
function trailPointAt34(L,c){ const pts=FEEL34.trail; let prev=L; for(let k=pts.length-1;k>=0;k--){ const q=pts[k]; if(Math.hypot(q[0]-L[0],q[1]-L[1])>=c){ let lo=0,hi=1; for(let it=0;it<24;it++){ const m=(lo+hi)/2; if(Math.hypot(prev[0]+(q[0]-prev[0])*m-L[0],prev[1]+(q[1]-prev[1])*m-L[1])<c) lo=m; else hi=m; } return [prev[0]+(q[0]-prev[0])*hi,prev[1]+(q[1]-prev[1])*hi]; } prev=q; } return null; }
// The carrying companion follows a breadcrumb trail of the leader's positions one sofa length behind, backs up when the leader walks toward it, and shortens the chord at corners so the sofa clears the walls.
function carryFollow34(p,dt){
 const T=FEEL34; const lead=players[sofa.holder.find(i=>i!==p.i)]; if(!lead) return;
 const L=[lead.g.position.x,lead.g.position.z], C=[p.g.position.x,p.g.position.z], D=sofa.L+0.3; const sp=SPEED*T.carrySpeed*1.25;
 if(!T.trail||!T.trail.length) T.trail=[C.slice(),L.slice()];
 const Lp=T.lastL||L; const mx=L[0]-Lp[0], mz=L[1]-Lp[1], mm=Math.hypot(mx,mz); let rx=C[0]-L[0], rz=C[1]-L[1]; const rm=Math.hypot(rx,rz);
 // Leader walking into the companion (within about 30 degrees of the sofa axis): the companion backs straight up, lining up with the push, and the trail starts afresh.
 const reversing=mm>1e-4&&rm>0.05&&(mx*rx+mz*rz)/(mm*rm)>0.85;
 if(reversing) T.trail=[L.slice()];
 // Otherwise breadcrumbs the leader has backtracked past are dropped and a sharp turn keeps its corner, so the sofa pivots round it instead of cutting it.
 else while(T.trail.length>=2){ const a=T.trail[T.trail.length-2], b=T.trail[T.trail.length-1]; const sx=b[0]-a[0], sz=b[1]-a[1]; const ss=sx*sx+sz*sz; if(ss<1e-8){ T.trail.pop(); continue; } const t=((L[0]-a[0])*sx+(L[1]-a[1])*sz)/ss; if(t<0.999) T.trail.pop(); else break; }
 const last=T.trail[T.trail.length-1]; if(!last||Math.hypot(L[0]-last[0],L[1]-last[1])>=T.spacing) T.trail.push(L.slice());
 let arc=0; for(let k=T.trail.length-1;k>0;k--){ arc+=Math.hypot(T.trail[k][0]-T.trail[k-1][0],T.trail[k][1]-T.trail[k-1][1]); if(arc>D+3){ T.trail.splice(0,k); break; } }
 T.lastL=L.slice();
 let target=null, chord=D, first=null;
 const fits=(q,c)=>{ const yaw=Math.atan2(-(L[1]-q[1]),L[0]-q[0]); return !sofaCollides((L[0]+q[0])/2,(L[1]+q[1])/2,yaw)&&carryLevelOK34(q[0],q[1],levelAt(C[0],C[1]))&&(c===undefined||!blocked(q[0],q[1],PR,{noSofa:true})); };
 if(reversing){ let ax=rx/rm+mx/mm*0.35, az=rz/rm+mz/mm*0.35; const am=Math.hypot(ax,az)||1; target=[L[0]+ax/am*D,L[1]+az/am*D]; }
 else for(const c of [D,D-0.1,D-0.2,D-0.3,D-0.38]){ const q=trailPointAt34(L,c); if(!q) break; first=first||q; if(fits(q)){ target=q; chord=c; break; } }
 // Tight corners (the vestibule door): no trail point works, so the companion swings round the leader to the nearest angle where the sofa and its own feet are clear.
 if(!target&&rm>0.05){ const th0=Math.atan2(rz,rx); outer: for(let k=0;k<=30;k++) for(const sgn of (k?[1,-1]:[1])) for(const c of [D,D-0.1,D-0.2,D-0.3,D-0.38]){ const th=th0+sgn*k*Math.PI/30; const q=[L[0]+Math.cos(th)*c,L[1]+Math.sin(th)*c]; if(fits(q,c)){ target=q; chord=c; break outer; } } }
 if(!target) target=first;
 if(!target){ let qx=rx, qz=rz, m=rm; if(m<0.05){ qx=-Math.cos(sofa.g.rotation.y); qz=Math.sin(sofa.g.rotation.y); m=Math.hypot(qx,qz)||1; } target=[L[0]+qx/m*D,L[1]+qz/m*D]; }
 T.follow.target=target; T.follow.d=chord;
 const dx=target[0]-C[0], dz=target[1]-C[1], dist=Math.hypot(dx,dz); const step=Math.min(sp*dt,dist);
 p.prev=[C[0],C[1]];
 if(step>1e-4){ movePlayer(p,dx/dist*step,dz/dist*step); p.face=[dx/dist,dz/dist]; }
 p.moving=step>0.02; p.t+=dt; animAvatar(p.g,p.t,p.moving,'low',sp,dt);
}
// While the companion holds its end it runs the follower; aiGoal, the stuck rescue and detours are never consulted.
const drive34=aiDrive;
aiDrive=function(p,dt){ if(AI.on&&p.i===AI.i&&carryHolder34(p)&&!p.g.sitting){ carryFollow34(p,dt); return; } return drive34(p,dt); };
// A save from before v34 could leave the sofa resting on the stairs or the landing, where the rule now forbids every grab from going up. Such a sofa slides back to a validated courtyard spot on entering the world or on the first grab, once.
// The spot is never the stair foot itself: a sofa there seals the corridor between the stair rails (x 5.9-7.5, z to 9.6) for a player coming down the ramp. Candidates in order: the delivery spot by the gate, two courtyard spots, then a short search of nearby ground points. A candidate is taken only when the sofa box there collides with nothing (walls, furniture, the crate and the pushables, through the base sofaCollides), rests on level ground, keeps a player's width clear of the stair corridor, and no player stands inside it.
const RESCUE_SPOTS34=[[4,8.6,0],[5.0,11.2,0],[3.0,11.0,0]];
function sofaBoxAt34(x,z,rot){ const c=Math.abs(Math.cos(rot)), s=Math.abs(Math.sin(rot)); const L=sofa?sofa.L:1.6, W=sofa?sofa.W:0.7; const hx=(L*c+W*s)/2, hz=(L*s+W*c)/2; return {x1:x-hx,x2:x+hx,z1:z-hz,z2:z+hz}; }
function sofaSpotFree34(x,z,rot){
 if(collides34(x,z,rot)||sofaLevelHit34(x,z,rot)) return false;
 const b=sofaBoxAt34(x,z,rot); const m=PR*2+0.05; /* a player's width between the box and the stair corridor */
 if(!(b.x2+m<5.9||b.x1-m>7.5||b.z1-m>9.6)) return false;
 for(const p of players){ if(p&&p.g&&hitAABB(p.g.position.x,p.g.position.z,PR,b)) return false; }
 return true;
}
function sofaRescueSpot34(){
 for(const [x,z,rot] of RESCUE_SPOTS34) if(sofaSpotFree34(x,z,rot)) return [x,z,rot];
 const pts=[]; for(let x=2.5;x<=5.5;x+=0.5) for(let z=9.5;z<=12.5;z+=0.5) pts.push([x,z,Math.hypot(x-4,z-10.5)]); pts.sort((a,b)=>a[2]-b[2]);
 for(const [x,z] of pts) for(const rot of [0,Math.PI/2]) if(sofaSpotFree34(x,z,rot)) return [x,z,rot];
 return RESCUE_SPOTS34[0]; /* nothing validated (every spot occupied): the delivery spot, which is still clear of the corridor */
}
function sofaRescue34(){
 if(!S||!S.sofa||!S.sofa.pos||S.sofa.state==='placed'||(sofa&&sofa.carrying)) return false;
 const x=sofa?sofa.g.position.x:S.sofa.pos[0], z=sofa?sofa.g.position.z:S.sofa.pos[1], rot=sofa?sofa.g.rotation.y:(S.sofa.rot||0);
 if(!sofaLevelHit34(x,z,rot)) return false;
 const [sx,sz,srot]=sofaRescueSpot34(); S.sofa.pos=[sx,sz]; S.sofa.rot=srot; if(sofa){ sofa.g.position.set(sx,0,sz); sofa.g.rotation.y=srot; }
 save(); toast('The sofa slid back down to the courtyard.'); return true;
}
const enter34=enterWorld;
enterWorld=function(){ enter34(); sofaRescue34(); };
// Grab seeds the trail from the current sofa axis; release and success clear it and give the companion a line. A grab of a sofa resting on raised ground rescues it instead.
const grab34=grabSofa;
grabSofa=function(i){ if(!(sofa&&sofa.carrying)&&sofaRescue34()) return; const was=!!(sofa&&sofa.carrying); grab34(i); if(sofa&&sofa.carrying&&!was) trailSeed34(); else if(!(sofa&&sofa.carrying)) trailReset34(); };
const release34=releaseSofa;
releaseSofa=function(){ const comp=carryCompanion34(); release34(); trailReset34(); if(comp){ comp.moving=false; FEEL34.releaseAt=performance.now()/1000; AI.cool.grab=FEEL34.releaseAt+1.5; aiSay('Down.'); } };
const success34=sofaSuccess;
sofaSuccess=function(){ success34(); trailReset34(); };
// The move-in hints point players left to the passage and away from the back stairs.
if(typeof EVENING33!=='undefined'&&EVENING33[0]&&EVENING33[0].id==='move') EVENING33[0].hint='At the gate, take one end each with Act (E / Enter). Go in through the gate and turn left, away from the back stairs, to the narrow passage at the far left of the courtyard. Turn the sofa lengthways for the doorway. Your companion takes the other end automatically.';

/* ---------- 2. The first evening with a companion ---------- */
// During the guided shop stage the companion shops for jollof only, ignoring the base rule that skips recipes with more than four missing items.
const shopItem34=aiShoppingItem;
aiShoppingItem=function(){
 if(typeof guided33==='function'&&guided33()&&evening33().stage==='shop'){ if(S.time<8||S.time>=19||S.money<6000) return null; for(const k of RECIPES.jollof.needs){ if(haveCount(k)||AI.bought.includes(k)) continue; const st=STALLS.find(s=>s.items.includes(k)); if(st) return {k,st}; } return null; }
 return shopItem34();
};
// The companion's bag belongs to the household: it is unpacked when the human is in the flat, and a companion that is far from the kitchen is called in before cooking, unless it is up on the roof (or the roof sequence is on), when the base refusal stands.
function companionFar34(){ if(!AI.on||!players[AI.i]||!players[0]) return false; const c=players[AI.i]; const [kx,kz]=flatKitchenPos(); return !inFlat(c.g.position.x,c.g.position.z)&&Math.hypot(c.g.position.x-kx,c.g.position.z-kz)>=7; }
const cookPick34=openCookPick;
openCookPick=function(){
 if(AI.on&&players[0]&&inFlat(players[0].g.position.x,players[0].g.position.z)){ if(Object.keys(basket(AI.i)).length) unpack(AI.i); if(companionFar34()&&!((players[AI.i].lvl||0)>0)&&!(S.roof&&S.roof.on)){ FEEL34.summon=true; FEEL34.summonT=0; AI.useNav=4; AI.path=null; toast(`${pname(AI.i)} is coming to the kitchen.`); return; } }
 return cookPick34();
};
// Ground-level route over the NAV graph: the base nearestNode can pick a roof-terrace node from the market and walk the companion into the terrace wall.
function feelNavGoal34(p,tx,tz,stop){
 const px=p.g.position.x,pz=p.g.position.z,lv=p.lvl||0; const ground=i=>levelAt(NAV[i][0],NAV[i][1])<0.5;
 if(Math.hypot(tx-px,tz-pz)<9&&lineClear(px,pz,tx,tz,lv)){ FEEL34.nav=null; return {x:tx,z:tz,stop}; }
 const key=Math.round(tx)+','+Math.round(tz); let nav=FEEL34.nav;
 if(!nav||nav.key!==key){
  const near=(x,z)=>{ let best=-1,bd=1e9; NAV.forEach((n,i)=>{ if(!ground(i)) return; const score=Math.hypot(n[0]-x,n[1]-z)+(lineClear(x,z,n[0],n[1],0)?0:50); if(score<bd){ bd=score; best=i; } }); return best; };
  const a=near(px,pz), b=near(tx,tz); const adj={}; NAVE.forEach(([u,v])=>{ if(ground(u)&&ground(v)){ (adj[u]=adj[u]||[]).push(v); (adj[v]=adj[v]||[]).push(u); } });
  const prev={}; prev[a]=null; const q=[a]; while(q.length){ const u=q.shift(); if(u===b) break; for(const v of adj[u]||[]) if(prev[v]===undefined){ prev[v]=u; q.push(v); } }
  const path=[]; if(prev[b]!==undefined){ let c=b; while(c!==null){ path.unshift(NAV[c]); c=prev[c]; } } path.push([tx,tz]); nav=FEEL34.nav={key,path,i:0};
 }
 // Advance only when the next leg is already clear from here, so door jambs are rounded instead of cut.
 while(nav.i<nav.path.length-1){ const dn=Math.hypot(nav.path[nav.i][0]-px,nav.path[nav.i][1]-pz); if(dn<0.3||(dn<0.9&&lineClear(px,pz,nav.path[nav.i+1][0],nav.path[nav.i+1][1],lv))) nav.i++; else break; }
 const w=nav.path[nav.i]; return {x:w[0],z:w[1],stop:nav.i===nav.path.length-1?stop:0.2};
}
const goal34=aiGoal;
aiGoal=function(p,dt){
 if(FEEL34.summon){ const [kx,kz]=flatKitchenPos(); const me=players[0]; FEEL34.summonT=(FEEL34.summonT||0)+dt; const here=inFlat(p.g.position.x,p.g.position.z); if(here||!me||!inFlat(me.g.position.x,me.g.position.z)||FEEL34.summonT>90){ FEEL34.summon=false; FEEL34.summonT=0; FEEL34.nav=null; AI.useNav=0; if(here) toast(`${pname(AI.i)} is here. Use the stove.`); /* arrival cue: the stove must be used again */ } else { AI.detour=null; AI.rescue=-1; return feelNavGoal34(p,kx,kz,1.0); } }
 return goal34(p,dt);
};

/* ---------- 3. Stage timing log ---------- */
// The timeline is kept for local and companion households only; in online play (NET.on) nothing is seeded, counted or shown, so it is absent there, not merely stripped from the shared document.
function online34(){ return typeof NET!=='undefined'&&!!NET.on; }
// One entry per stage transition in S.firstEvening.log: {stage, at (wall-clock ms), played (seconds with the tab visible, panels included), day, time}.
const reconcileBase34=reconcile33;
reconcile33=function(){
 const e=evening33(); const prev=e?e.stage:undefined; reconcileBase34(); if(!e||online34()) return; /* online households get no timeline at all: nothing is seeded or logged */
 // A save from before v34 has no log: the first reconcile seeds the stage it is on (played 0) so the timeline is anchored where v34 first ran. A completed evening gets no timeline.
 if(!e.log&&!e.completed) e.log=[{stage:e.stage,at:Date.now(),played:0,day:S.day,time:+S.time.toFixed(2)}];
 if(e.stage!==prev){ e.log=e.log||[]; if(!e.log.length||e.log[e.log.length-1].stage!==e.stage) e.log.push({stage:e.stage,at:Date.now(),played:+(e.played||0).toFixed(1),day:S.day,time:+S.time.toFixed(2)}); }
};
// Play seconds for the log: the tick's dt is already clamped; seconds count while the tab is visible, panels included (the shop, kitchen and party are part of the evening), and nothing while the tab is hidden.
function feelPlayHook34(dt){ const e=evening33(); if(e&&!e.completed&&!online34()&&S.phase==='play'&&!(typeof document!=='undefined'&&document.hidden)) e.played=(e.played||0)+dt; }
if(typeof TICK_HOOKS!=='undefined') TICK_HOOKS.push(feelPlayHook34);
// The timing log is a local measurement kept for local and companion households; the shared household document does not carry it, so online play has no timeline.
const strip34=stripState;
stripState=function(){ const o=strip34(); if(o&&o.firstEvening){ delete o.firstEvening.log; delete o.firstEvening.played; } return o; };
function timelineText34(){ const e=evening33(); if(!e||!e.log||!e.log.length) return ''; const t0=e.log[0].played||0; return e.log.map(l=>`${l.stage} ${Math.round(((l.played||0)-t0)/6)/10} min`).join(' · '); }
function timelineSummary34(){ const e=evening33(); if(!e||!e.log||!e.log.length) return 'No first-evening timeline yet.'; const t0=e.log[0].played||0; const h=x=>{ const hh=Math.floor(x)%24, mm=Math.floor((x%1)*60); return `${hh%12||12}:${mm<10?'0':''}${mm} ${hh<12?'am':'pm'}`; }; return `Compound Days first evening (${BUILD_ID})\n`+e.log.map(l=>`${l.stage}: +${(((l.played||0)-t0)/60).toFixed(1)} min play, day ${l.day} ${h(l.time)}, ${new Date(l.at).toISOString()}`).join('\n')+`\ntotal play ${((e.played||0)/60).toFixed(1)} min`; }
// The Menu line: 'First evening: move 0 min · shop 0.4 min · total 3.2 min'.
function eveningStatusText34(){ const e=evening33(); const t=timelineText34(); return t?`First evening: ${t} · total ${Math.round((e.played||0)/6)/10} min`:''; }
ACTIONS.copyTimeline=()=>{ const text=timelineSummary34(); const show=()=>openPanel(`<h2>Evening timeline</h2><pre class="small" style="white-space:pre-wrap">${esc(text)}</pre><div class="actions">${btn('Back','menubtn',{},'primary block')}</div>`); if(typeof navigator!=='undefined'&&navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(()=>toast('Timeline copied.'),show); } else show(); };
ACTIONS.menubtn=()=>openMenu();
// Both are Menu buttons for this screen only: a replay on the other peer would write its clipboard or edit whatever panel it has open.
LOCAL_ONLY.add('copyTimeline'); LOCAL_ONLY.add('menubtn');

/* ---------- 4. Phone floor: step graphics down when play stays under 24 fps ---------- */
// Pure decision: feed one-second windows of mean fps; after ten contiguous seconds under 24 the next notch is taken. Never steps up.
function perfDecide34(fps,secs){ const P=FEEL34.perf; if(P.level>=3) return 'done'; if(fps<24) P.under+=secs; else P.under=0; if(P.under<10) return 'hold'; P.under=0; P.level++; return P.level<3?'ratio':'lite'; }
function perfRatioFor34(level,start){ const notches=[1.25,1.0]; let r=start; for(let k=0;k<level&&k<notches.length;k++) r=Math.min(r,notches[k]); return r; }
function perfLiteLive34(){
 const P=FEEL34.perf; if(P.lite) return; P.lite=true; QUALITY.full=false; try{ localStorage.setItem('cd3-quality','lite'); }catch(e){}
 if(typeof renderer==='undefined'||!renderer) return;
 renderer.shadowMap.enabled=false; if(typeof sun!=='undefined'&&sun){ sun.castShadow=false; if(sun.shadow.map){ sun.shadow.map.dispose(); sun.shadow.map=null; } sun.shadow.mapSize.set(1024,1024); } scene.traverse(m=>{ if(m.material) m.material.needsUpdate=true; });
 if(typeof clouds!=='undefined') clouds.forEach((c,k)=>{ if(k%2) c.visible=false; }); if(typeof walkers!=='undefined') walkers.forEach((w,k)=>{ if(k%2&&w.g) w.g.visible=false; });
 if(typeof waterMesh!=='undefined'&&waterMesh&&waterMesh.material.uniforms&&waterMesh.material.uniforms.lite) waterMesh.material.uniforms.lite.value=1; if(typeof LOOK!=='undefined'&&LOOK.rim) scene.remove(LOOK.rim);
}
// A ratio notch that would not change the pixel ratio (DPR-1 devices, or no renderer) is taken silently and the next notch follows at once, so lite follows the first window there; a lite notch on a page already in lite makes no toast. Only real changes are recorded as steps.
function perfApply34(action){
 const P=FEEL34.perf; if(action!=='ratio'&&action!=='lite') return;
 const R=typeof renderer!=='undefined'&&renderer?renderer:null; if(R&&P.ratio===null) P.ratio=R.getPixelRatio();
 while(action==='ratio'){ const r=perfRatioFor34(Math.min(P.level,2),P.ratio===null?1:P.ratio); if(R&&Math.abs(R.getPixelRatio()-r)>1e-3){ R.setPixelRatio(r); break; } P.level++; if(P.level>=3) action='lite'; }
 if(action==='lite'){ const was=QUALITY.full; perfLiteLive34(); if(was){ P.steps.push('lite'); toast('Lighter graphics to keep the game smooth; saved for next time.'); } return; }
 P.steps.push('ratio'); toast('Render resolution stepped down to keep the game smooth.');
}
function feelPerfHook34(dt,playing){
 const P=FEEL34.perf; const now=performance.now(); const last=P.last; P.last=now; if(!playing||!last||typeof renderer==='undefined'||!renderer||now<15000||P.level>=3) { if(!playing){ P.acc=0; P.n=0; } return; }
 const ms=now-last; if(ms>500) return; P.acc+=ms; P.n++; if(P.acc<1000) return; P.mean=1000/(P.acc/P.n); P.windows++; const secs=P.acc/1000; P.acc=0; P.n=0; perfApply34(perfDecide34(P.mean,secs));
}
if(typeof TICK_HOOKS!=='undefined') TICK_HOOKS.push(feelPerfHook34);
function perf34StatusText(){ const P=FEEL34.perf; const live=typeof renderer!=='undefined'&&renderer?` Render scale ${renderer.getPixelRatio().toFixed(2)}.`:''; if(!P.steps.length) return (P.mean?` Play frame rate about ${Math.round(P.mean)} fps.`:'')+live; return ` Graphics stepped down this session (${P.steps.map(s=>s==='lite'?'lighter quality, live':'render scale').join(', ')}) after play stayed under 24 fps.${live}${P.lite?' Lighter graphics will also apply next time this page opens.':''}`; }
const menu34=openMenu;
// The timeline is its own short paragraph directly above the actions, with 'Copy evening timeline' beside the tasks button; the perf state stays in the small print. A silent (remote) replay changes nothing here, and an online household gets no timeline paragraph or Copy button.
openMenu=function(){ menu34(); if(typeof silentMode==='function'&&silentMode()) return; const tiny=[...document.querySelectorAll('#panel p.tiny')].find(p=>/Build /.test(p.textContent))||document.querySelector('#panel p.tiny'); if(tiny) tiny.insertAdjacentHTML('beforeend',esc(perf34StatusText())); const actions=document.querySelector('#panel .actions'); const line=online34()?'':eveningStatusText34(); if(actions&&line){ actions.insertAdjacentHTML('beforebegin',`<p class="small">${esc(line)}</p>`); const copy=btn('Copy evening timeline','copyTimeline',{},'quiet'); const tasksBtn=actions.querySelector('[data-act="tasksbtn"]'); if(tasksBtn) tasksBtn.insertAdjacentHTML('afterend',copy); else actions.insertAdjacentHTML('beforeend',copy); } };

/* ---------- 5. Loading: all wardrobe pieces in parallel, the players' own pieces first ---------- */
// Same per-piece callbacks as the serial v21 chain; spawnNPCs runs once after the last piece, in any order.
wardrobePrefetch=function(){
 const want=[]; const add=n=>{ if(n&&!want.includes(n)) want.push(n); };
 const looks=[]; if(S&&S.p) both().forEach(i=>looks.push(lookFor(i))); else { let saved=null; try{ saved=load(); }catch(e){} if(saved&&saved.p) saved.p.forEach(p=>{ if(p) looks.push({hair:p.hair,outfit:p.outfit}); }); else { const d=newState(); d.p.forEach(p=>looks.push({hair:p.hair,outfit:p.outfit})); } }
 looks.forEach(l=>wardrobeNames(l).forEach(add)); Object.values(WARDROBE.hair).forEach(add); Object.values(WARDROBE.outfits).flat().forEach(add);
 FEEL34.prefetch={requested:want.slice(),done:0,total:want.length}; let left=want.length;
 want.forEach(n=>wardrobeLoad(n,g=>{
  if(g&&S&&S.p){ both().forEach(i=>{ if(!wardrobeNames(lookFor(i)).includes(n)) return; if(players[i]) refreshAvatar(i); const pv=document.getElementById('pv3d'+i); if(pv) mountPreview(pv,lookFor(i)); }); }
  if(S&&S.setup&&/^p[01]$/.test(S.setup.step)) thumbsLater(Number(S.setup.step[1]));
  FEEL34.prefetch.done++; if(--left===0&&S&&players.length) spawnNPCs();
 }));
};

/* v71c "Moving day": the sofa move is the game's first mission, taught one step at a time.

   A new household starts with the sofa on the street by the gate. Before, the only teaching was one long paragraph on
   the move-in panel; after closing it, players were on their own. Now, while the first evening is being followed
   (guided33) and the sofa is not in, each player has a mission card at the top of their view that says what to do
   next, in their own controls, and the world shows where:

     1 Take an end              a ring at each free end, in that player's colour
     2 Lift it together         (the sofa lifts when both hold an end)
     3 In through the gate      a gold ring where the sofa should go next, an arrow at the edge of the view when the
     4 Left, to the passage     ring is off screen, and a line on the desktop map
     5 Through the door, end first

   During the carry, short tips answer the usual troubles: the sofa catching on a wall or a player pushing without it
   moving, heading for the stairs side of the courtyard, or no progress for a while. When the sofa is in, the "It is in" panel says what was learned.

   Every step is worked out from what the world shows (who holds which end, whether it is lifted, where the sofa is),
   never stored, so it is the same after a reload and on both phones of a two-phone household, and nothing new travels
   between phones. Only the player's own view gets a card: on one screen both halves, with a companion or on two
   phones only this phone's player.

   It adds nothing to the saved household and no per-frame hook (it rides on updateSofaCarry and updateBall, which the
   frame loop calls every frame, and on updateHUD and drawMinimap). It reads no wall clock: its time is the sum of the
   frame steps.
   Pausing the first-evening guidance in the journal hides it. */
const MOVEIN71C={version:1,
 // where the sofa's centre goes next, by stage (the shipped bench route, check/bench-route-v36.json, for the same doorways)
 target:{gate:[3.9,5.0],courtyard:[-1.75,1.2],passage:[-1.75,3.75],door:[-4.15,4.85]},
 near:1.3,                  // an end within this of a player can be taken (the base's grab distance)
 out:0.4,                   // a ring sits this far beyond its end of the sofa, clear of the sofa itself
 bumpTip:{frames:14,win:2.5},        // this many blocked carry frames in this many seconds: the wall tip
 slowTip:{s:15,gain:0.3},           // carrying this long without getting this much closer: the "head for the ring" tip
 pushS:1.8,                         // pushing this long while the sofa stays within 0.25 m: the wall tip too
 tipS:6,tipGap:12,
 colour:['blue','gold'],hex:['#6F8DE0','#E3A72F'],gold:'#F2C14E',
 t:0,carryT:0,best:Infinity,bestAt:0,bumps:[],bumped:false,pushFrom:null,pushT:0,tip:['',''],tipAt:[-99,-99],tipLast:{},g:null,ends:[],goal:null,
 cards:[null,null],arrows:[null,null],arrowOn:[false,false],shown:[null,null],stage:['',''],tight:[false,false],lastBump:0
};

/* ---------- what the world shows ---------- */
function moveinOn71c(){ return !!(typeof S!=='undefined'&&S&&S.p&&S.phase==='play'&&S.sofa&&S.sofa.state!=='placed'&&typeof sofa!=='undefined'&&sofa&&sofa.g&&
 typeof players!=='undefined'&&players.length===2&&typeof guided33==='function'&&guided33()); }
// the views that get a card: the players who play on this screen
function moveinViews71c(){ const si=typeof singleIdx==='function'?singleIdx():-1; return si>=0?[si]:[0,1]; }
function moveinCompanion71c(){ return typeof AI!=='undefined'&&!!AI.on; }
// where the carried sofa is on its way: on the street, in the courtyard, in the narrow passage, or in the hall by the door
function moveinRoute71c(){ const x=sofa.g.position.x,z=sofa.g.position.z;
 if(x<-1.15&&z>=3.2) return 'door';
 if(x<-1.15&&z>=1.4) return 'passage';
 if(z<5.7) return 'courtyard';
 return 'gate'; }
function moveinEndDist71c(i){ const p=players[i]&&players[i].g; if(!p) return Infinity; let d=Infinity;
 for(const e of [0,1]){ const q=sofaEnd(e); d=Math.min(d,Math.hypot(p.position.x-q[0],p.position.z-q[1])); } return d; }
// one player's step (1 to 5), worked out from the world
function moveinStep71c(i){
 const held=sofa.holder||[null,null];
 if(sofa.carrying){ const r=moveinRoute71c(); return {n:r==='gate'?3:r==='door'?5:4,id:r}; }
 if(held[0]===i||held[1]===i) return {n:2,id:'lift'};
 return {n:1,id:moveinEndDist71c(i)<MOVEIN71C.near?'take':'walk'};
}

/* ---------- words ---------- */
function moveinMoveText71c(i){ const m=typeof lastInput!=='undefined'?lastInput[i]:'key',single=moveinViews71c().length===1;
 if(m==='pad') return 'Walk with the left stick';
 if(m==='touch') return single?'Drag your thumb on the screen to walk':(i===0?'Drag on the left of the screen to walk':'Drag on the right of the screen to walk');
 return single?'Walk with W A S D or the arrow keys':(i===0?'Walk with W A S D':'Walk with the arrow keys'); }
function moveinActKey71c(i){ const g=typeof glyph==='function'?glyph(i):'E'; return g==='⏎'?'Enter':g; }
function moveinAct71c(i){ const k=moveinActKey71c(i); return (k==='Act'?'tap ':'press ')+`<span class="key">${esc(k)}</span>`; }
const moveinCap71c=s=>s.charAt(0).toUpperCase()+s.slice(1);
// the card for player i: kicker, title, what to do, a footnote
function moveinCard71c(i){
 const st=moveinStep71c(i),o=1-i,other=esc(pname(o)),col=MOVEIN71C.colour,comp=moveinCompanion71c(),online=typeof NET!=='undefined'&&NET.on,act=moveinAct71c(i);
 let title='',d='',f='';
 const again=Math.hypot(sofa.g.position.x-4,sofa.g.position.z-8.6)>1.5;
 if(st.id==='walk'){ title=again?'Pick it up again':'Take an end'; d=`${esc(moveinMoveText71c(i))} to the ${col[i]} ring by the sofa, then ${act}.`; }
 else if(st.id==='take'){ title=again?'Pick it up again':'Take an end'; d=`${moveinCap71c(act)} to take this end.`; }
 else if(st.id==='lift'){ title='Lift it together';
  if(comp&&o===AI.i) d='You have your end. Your companion is coming for the other one; the sofa lifts when you both hold it.';
  else if(online&&!NET.otherOnline) d=`${other} is not connected. The sofa needs both of you.`;
  else if(online) d=`You have your end. It lifts when ${other} takes the other one.`;
  else d=`You have your end. Now ${other} takes the other one, by the ${col[o]} ring, and it lifts.`; }
 else if(st.id==='gate'){ title='In through the gate'; d=comp?'Walk to the gold ring. Your companion carries the other end behind you.':'Walk together to the gold ring. The sofa stays between you.'; f=`${moveinCap71c(act)} again to set it down.`; }
 else if(st.id==='courtyard'){ title='Left, to the narrow passage'; d='Across the courtyard to the passage on the left side. The stairs on the right are not the way.'; }
 else if(st.id==='passage'){ title='Up the passage'; d=comp?'Up the narrow passage, your companion behind you.':'Up the narrow passage, one of you in front of the other.'; }
 else if(st.id==='door'){ title='Through the door, end first'; d=comp?'Walk through the door first; the sofa follows end first.':'One of you walks through the door first; the sofa follows end first.'; }
 return {n:st.n,id:st.id,title,d,f,tip:sofa.carrying?MOVEIN71C.tip[i]:''};
}

/* ---------- tips during the carry ---------- */
function moveinTip71c(key,text){ const M=MOVEIN71C; if(M.t-(M.tipLast[key]===undefined?-99:M.tipLast[key])<M.tipGap) return; M.tipLast[key]=M.t;
 for(const i of moveinViews71c()){ M.tip[i]=text; M.tipAt[i]=M.t; } }
function moveinTips71c(dt,bumped){ const M=MOVEIN71C;
 for(const i of [0,1]) if(M.tip[i]&&M.t-M.tipAt[i]>M.tipS) M.tip[i]='';
 if(!sofa.carrying){ M.carryT=0; M.best=Infinity; M.bumps.length=0; M.pushFrom=null; M.tip=['','']; return; }   // tips are about the carry
 M.carryT+=dt;
 if(bumped){ M.bumps.push(M.t); while(M.bumps.length&&M.t-M.bumps[0]>M.bumpTip.win) M.bumps.shift();
  if(M.bumps.length>=M.bumpTip.frames){ M.bumps.length=0; moveinTip71c('wall','Caught on a wall? Step back together, then turn: the sofa swings between you.'); } }
 // pushing on the stick or keys without the sofa getting anywhere: a holder is walking into a wall, or the sofa does not fit that way
 const pushing=moveinViews71c().some(i=>(sofa.holder||[]).includes(i)&&!(moveinCompanion71c()&&i===AI.i)&&(()=>{ const v=typeof inputVec==='function'?inputVec(i):[0,0]; return Math.hypot(v[0],v[1])>0.3; })()),
  pos=[sofa.g.position.x,sofa.g.position.z];
 if(!pushing) M.pushFrom=null;
 else if(!M.pushFrom||Math.hypot(pos[0]-M.pushFrom[0],pos[1]-M.pushFrom[1])>0.25){ M.pushFrom=pos; M.pushT=0; }
 else if((M.pushT+=dt)>M.pushS){ M.pushT=0; moveinTip71c('wall','Caught on a wall? Step back together, then turn: the sofa swings between you.'); }
 const r=moveinRoute71c(),T=M.target[r];
 if(r==='courtyard'&&sofa.g.position.x>5.2) moveinTip71c('east','Your door is the other way: left, through the narrow passage.');
 const d=Math.hypot(sofa.g.position.x-T[0],sofa.g.position.z-T[1]);
 if(d<M.best-M.slowTip.gain||M.best===Infinity){ M.best=d; M.bestAt=M.carryT; }
 else if(M.carryT-M.bestAt>M.slowTip.s){ M.bestAt=M.carryT; M.best=d; moveinTip71c('slow','Head for the gold ring'+(M.arrowOn.some(Boolean)?': the arrow at the edge of the screen points to it.':'.')); }
}

/* ---------- the world: rings at the free ends and at the next place ---------- */
function moveinRing71c(r0,r1,hex){ const m=new THREE.Mesh(new THREE.RingGeometry(r0,r1,40),new THREE.MeshBasicMaterial({color:hex,transparent:true,opacity:0.6,depthWrite:false}));
 m.rotation.x=-Math.PI/2; m.renderOrder=3; m.visible=false; return m; }
function moveinMeshes71c(){ const M=MOVEIN71C; if(M.g&&M.g.parent===scene) return M.g;
 if(!M.g){ M.g=new THREE.Group(); M.g.name='movein71c'; M.ends=[0,1].map(i=>moveinRing71c(0.2,0.3,M.hex[i])); M.goal=new THREE.Group();
  const outer=moveinRing71c(0.55,0.7,M.gold),inner=moveinRing71c(0.12,0.2,M.gold); outer.visible=inner.visible=true; M.goal.add(outer,inner); M.goal.visible=false;
  M.ends.forEach(r=>M.g.add(r)); M.g.add(M.goal); }
 scene.add(M.g); return M.g; }
function moveinWorld71c(on){ const M=MOVEIN71C;
 if(!on){ if(M.g) M.g.visible=false; return; }
 moveinMeshes71c(); M.g.visible=true; const pulse=0.45+0.25*Math.sin(M.t*4), held=sofa.holder||[null,null];
 // each player's ring at the end nearer to them that nobody holds, until it is lifted
 const free=[0,1].filter(e=>held[e]===null||held[e]===undefined), used=new Set();
 for(const i of [0,1]){ const ring=M.ends[i]; ring.visible=false; if(sofa.carrying||held[0]===i||held[1]===i||!free.length||!players[i]) continue;
  const p=players[i].g.position; let be=-1,bd=Infinity; for(const e of free){ if(used.has(e)) continue; const q=sofaEnd(e),d=Math.hypot(p.x-q[0],p.z-q[1]); if(d<bd){ bd=d; be=e; } }
  if(be<0) continue; used.add(be); const q=sofaEnd(be), cx=sofa.g.position.x, cz=sofa.g.position.z, l=Math.hypot(q[0]-cx,q[1]-cz)||1;
  ring.position.set(q[0]+(q[0]-cx)/l*M.out,0.03,q[1]+(q[1]-cz)/l*M.out); ring.material.opacity=pulse; ring.visible=true; }   // just beyond the end, where the player stands to take it
 // the gold ring where the sofa goes next, while it is carried
 M.goal.visible=!!sofa.carrying; if(sofa.carrying){ const T=M.target[moveinRoute71c()]; M.goal.position.set(T[0],0.04,T[1]); const s=1+0.08*Math.sin(M.t*3); M.goal.scale.set(s,s,s); M.goal.children.forEach(c=>{ c.material.opacity=0.35+pulse*0.5; }); }
}

/* ---------- the screen: one card per player view, and an arrow at the edge when the ring is off screen ---------- */
function moveinEl71c(i,cls,html){ if(typeof document==='undefined') return null; const half=document.getElementById('half'+i); if(!half||!half.appendChild) return null;
 const M=MOVEIN71C,key=cls==='mv71c'?'cards':'arrows'; let el=M[key][i]; if(el&&el.parentNode===half) return el;
 el=document.createElement('div'); el.className=cls; if(html) el.innerHTML=html; half.appendChild(el); M[key][i]=el; return el; }
function moveinCards71c(on){ const M=MOVEIN71C, views=on?moveinViews71c():[];
 for(const i of [0,1]){ const mine=views.includes(i); const el=mine?moveinEl71c(i,'mv71c'):M.cards[i];
  if(!el) continue; if(!mine){ if(el.className.indexOf(' on')>=0) el.className='mv71c p'+i; M.shown[i]=null; continue; }
  const c=moveinCard71c(i), html=`<div class="mv71c-k">MOVING DAY · STEP ${c.n} OF 5</div><div class="mv71c-t">${c.title}</div><div class="mv71c-d">${c.d}</div>${c.f?`<div class="mv71c-f">${c.f}</div>`:''}${c.tip?`<div class="mv71c-tip">${esc(c.tip)}</div>`:''}`;
  const fresh=M.stage[i]!==c.id; M.stage[i]=c.id;
  if(M.shown[i]!==html){ el.innerHTML=html; M.shown[i]=html; }
  el.className='mv71c on p'+i+(M.tight[i]?' tight':'')+(c.tip?' hastip':'')+(fresh?' fresh':''); moveinPlace71c(i,el); }
}
// on a real screen: the card sits just under the player's own card, and turns compact when the space above the bag and the
// prompt is too short for it (a phone held sideways); it is measured in its full form each time, so it grows back
function moveinPlace71c(i,el){ try{ const M=MOVEIN71C, half=document.getElementById('half'+i), pc=half&&half.querySelector&&half.querySelector('.pcard');
 if(!pc||typeof pc.getBoundingClientRect!=='function'||typeof el.getBoundingClientRect!=='function') return;
 const h=half.getBoundingClientRect(), p=pc.getBoundingClientRect(); if(!(p.height>0)||!(h.height>0)) return;
 const top=Math.round(p.bottom-h.top+8); el.style.top=top+'px';
 el.classList.remove('tight'); const c=el.getBoundingClientRect(); let floor=h.height;
 for(const s of ['.inv','.pr.on']){ const o=half.querySelector(s); if(!o) continue; const r=o.getBoundingClientRect(); if(r.height>0&&r.left<c.right&&c.left<r.right) floor=Math.min(floor,r.top-h.top); }
 M.tight[i]=c.height>floor-top-8; el.classList.toggle('tight',M.tight[i]); }catch(e){} }
function moveinArrows71c(on){ const M=MOVEIN71C, views=on&&sofa.carrying?moveinViews71c():[];
 for(const i of [0,1]){ M.arrowOn[i]=false; let el=M.arrows[i];
  if(!views.includes(i)){ if(el) el.style.display='none'; continue; }
  const T=M.target[moveinRoute71c()], c=typeof cams!=='undefined'&&cams[i], vp=typeof v21Viewport==='function'?v21Viewport(i):null;
  if(!c||!vp||typeof c.updateMatrixWorld!=='function'){ if(el) el.style.display='none'; continue; }
  c.updateMatrixWorld(); const v=new THREE.Vector3(T[0],0.3,T[1]).project(c), behind=v.z>1;
  let sx=(v.x+1)/2*vp.w, sy=(1-v.y)/2*vp.h; const x0=vp.w*0.1,x1=vp.w*0.9; let y0=vp.top+20;
  try{ const card=M.cards[i], half=document.getElementById('half'+i); if(card&&half&&typeof card.getBoundingClientRect==='function'){ const r=card.getBoundingClientRect(), h=half.getBoundingClientRect();
   if(r&&h&&r.height>0) y0=Math.max(y0,r.bottom-h.top+28); } }catch(e){}   // the arrow keeps below the mission card
  const y1=Math.max(y0+20,vp.h-vp.bottom-20);
  if(!behind&&sx>=x0&&sx<=x1&&sy>=y0&&sy<=y1){ if(el) el.style.display='none'; continue; }   // the ring is in view
  const cx=vp.w/2, cy=(y0+y1)/2; let dx=sx-cx, dy=sy-cy; if(behind){ dx=-dx; dy=-dy; } const ang=Math.atan2(dy,dx);
  let t=1e9; const ux=Math.cos(ang),uy=Math.sin(ang); if(ux>1e-6) t=Math.min(t,(x1-cx)/ux); if(ux<-1e-6) t=Math.min(t,(x0-cx)/ux); if(uy>1e-6) t=Math.min(t,(y1-cy)/uy); if(uy<-1e-6) t=Math.min(t,(y0-cy)/uy);
  el=el||moveinEl71c(i,'mv71c-arrow','<span class="g">➜</span>'); if(!el) continue;
  el.style.display='block'; el.style.left=(cx+ux*t).toFixed(0)+'px'; el.style.top=(cy+uy*t).toFixed(0)+'px';
  const g=el.querySelector&&el.querySelector('.g'); if(g) g.style.transform=`rotate(${(ang*180/Math.PI).toFixed(1)}deg)`; M.arrowOn[i]=true; }
}
function moveinOff71c(){ const M=MOVEIN71C; moveinWorld71c(false); moveinCards71c(false); for(const el of M.arrows) if(el) el.style.display='none'; M.arrowOn=[false,false]; M.tip=['','']; }

/* ---------- wraps ---------- */
// the mission's frame step: rings, tips and arrows follow the world
function moveinFrame71c(dt){ const M=MOVEIN71C; M.t+=dt; const bumped=M.bumped; M.bumped=false;
 if(!moveinOn71c()){ if(M.g&&M.g.visible) moveinOff71c(); return; }
 moveinTips71c(dt,bumped); moveinWorld71c(true); moveinArrows71c(true); }
if(typeof updateSofaCarry==='function'){ const carry71c=updateSofaCarry;
 // wrap: note when the carried sofa caught on something this frame (the base counts it in sofa.bump)
 updateSofaCarry=function(){ const b0=(typeof sofa!=='undefined'&&sofa&&sofa.bump)||0; const r=carry71c.apply(this,arguments);
  if(typeof sofa!=='undefined'&&sofa&&(sofa.bump||0)>b0) MOVEIN71C.bumped=true; return r; };
}
if(typeof updateBall==='function'){ const ball71c=updateBall;
 // wrap: the frame loop calls this every frame with the frame step, right after the carry; the mission's frame step runs here (no new hook)
 updateBall=function(dt){ const r=ball71c.apply(this,arguments); try{ moveinFrame71c(+dt||0); }catch(e){} return r; };
}
// a new world (a new household, Continue, a reload): nothing of the last carry's tips carries over
function moveinReset71c(){ const M=MOVEIN71C; M.tip=['','']; M.tipAt=[-99,-99]; M.tipLast={}; M.carryT=0; M.best=Infinity; M.bumps=[]; M.pushFrom=null; M.stage=['','']; M.shown=[null,null]; }
if(typeof enterWorld==='function'){ const enter71c=enterWorld;
 // wrap: entering the world starts the mission's tips afresh
 enterWorld=function(){ moveinReset71c(); return enter71c.apply(this,arguments); };
}
if(typeof updateHUD==='function'){ const hud71c=updateHUD;
 // wrap: the HUD (redrawn four times a second) draws each player's mission card
 updateHUD=function(){ const r=hud71c.apply(this,arguments); try{ if(moveinOn71c()) moveinCards71c(true); else if(MOVEIN71C.cards.some(Boolean)) moveinCards71c(false); }catch(e){} return r; };
}
if(typeof drawMinimap==='function'){ const map71c=drawMinimap;
 // wrap: on the desktop map, a gold line from the carried sofa to where it goes next and on to the flat door
 drawMinimap=function(){ const r=map71c.apply(this,arguments);
  try{ if(moveinOn71c()&&sofa.carrying&&typeof mg!=='undefined'&&mg&&typeof mm!=='undefined'&&mm){ const W=mm.width,H=mm.height,sx=x=>(x+32)/64*W,sz=z=>(z+26)/44*H,M=MOVEIN71C;
   const order=['gate','courtyard','passage','door'],k=order.indexOf(moveinRoute71c()),pts=[[sofa.g.position.x,sofa.g.position.z]].concat(order.slice(k).map(s=>M.target[s]));
   mg.save(); mg.strokeStyle=M.gold; mg.lineWidth=2; mg.setLineDash([4,3]); mg.beginPath(); pts.forEach((p,j)=>{ if(j) mg.lineTo(sx(p[0]),sz(p[1])); else mg.moveTo(sx(p[0]),sz(p[1])); }); mg.stroke();
   mg.setLineDash([]); mg.fillStyle=M.gold; mg.beginPath(); mg.arc(sx(pts[1][0]),sz(pts[1][1]),3.5,0,Math.PI*2); mg.fill(); mg.restore(); } }catch(e){}
  return r; };
}
if(typeof openPanel==='function'){ const panel71c=openPanel;
 // wrap: the move-in panel introduces the mission instead of explaining the whole route; "It is in" says what was learned
 openPanel=function(html){
  if(typeof html==='string'&&S&&typeof evening33==='function'&&evening33()){
   if(html.indexOf('<h2>Palm Court, Flat 3</h2>')>=0&&guided33()&&S.sofa&&S.sofa.state!=='placed')
    html=html.replace(/<div class="hint">[\s\S]*?<\/div>/,`<div class="hint"><b>Your first job together: get the sofa in.</b> A card at the top of the screen takes you through it one step at a time, and a ring on the ground shows where to go.</div>`);
   else if(html.indexOf('<h2>It is in</h2>')>=0){ const v=moveinViews71c(), how=v.length===1?moveinAct71c(v[0]):'press your action button';
    html=html.replace('<h2>It is in</h2>',`<h2>It is in</h2><p class="mv71c-done"><b>Moving day: done.</b> You took an end each and steered it home together. Everything else in Palm Court works the same way: walk up to it and ${how}.</p>`); } }
  return panel71c.call(this,html); };
}

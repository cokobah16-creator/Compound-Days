/* v71c "Moving day": the sofa move is the game's first mission, taught one step at a time.

   A new household starts with the sofa on the street by the gate. Before, the only teaching was one long paragraph on
   the move-in panel; after closing it, players were on their own. Now, while the first evening is being followed
   (guided33) and the sofa is not in, each player has a mission card at the top of their view that says what to do
   next, in their own controls, and the world shows where:

     1 Take an end              a ring at each free end, in that player's colour
     2 Lift it together         (the sofa lifts when both hold an end)
     3 In through the gate      a gold ring to walk to and an arrow at the edge of the view when the ring is off
     4 Left, to the passage     screen; a player reaching the ring (or the sofa passing it) moves the card on
     5 Through the door, end first

   The sofa only fits through the gate, the passage and the door end first, so two players are told which of them goes
   first (whoever is nearer the first ring when it is lifted) and that the other follows behind; with a companion, the
   companion follows. The rings line it up: in front of each opening, then far enough through it for the back end to
   be through too. The crate that starts at the passage mouth would be pushed down the passage and block the turn for
   the door, so while it is in line the courtyard step first takes the sofa through it, sliding it aside.
   During the carry, short tips answer the usual troubles: the sofa catching on a wall or a player pushing without it
   moving, two players walking different ways, a partner on the other phone who is not walking, heading for the stairs
   side of the courtyard, or no progress for a while. When the sofa is in, the "It is in" panel says what was learned.

   Every step is worked out from what the world shows (who holds which end, whether it is lifted, where the sofa is,
   and which gold ring a holder has reached during this carry), never saved, so it is the same after a reload and on
   both phones of a two-phone household, and nothing new travels between phones. Only the player's own view gets a
   card: on one screen both halves, with a companion or on two phones only this phone's player. On a narrow screen a
   toast that would cover the card is shown just below it.

   It adds nothing to the saved household and no per-frame hook (it rides on updateSofaCarry and updateBall, which the
   frame loop calls every frame, and on updateHUD). It reads no wall clock: its time is the sum of the
   frame steps.
   Pausing the first-evening guidance in the journal hides it. */
const MOVEIN71C={version:1,
 // the gold rings to walk to, leg by leg and one at a time, as [x, z, how near a holder must come to reach it] (the sofa's
 // centre within 0.6 reaches it too). The sofa only fits through the gate, the passage and the door end first, so each
 // opening has a ring in front of it and one far enough through it for the back end to be through before the first player
 // turns: in front of the gate on the street and well inside it; in front of the passage, north of its mouth; the far end
 // of the hall, then into the flat. The crate starts at the passage mouth: carried straight on, it would be pushed down
 // the passage and block the turn for the door, so while it is in line the courtyard leg first goes through it from the
 // east, sliding it west out of the way (the shipped companion route, check/verify-feel.cjs, takes the same line)
 target:{gate:[[4.0,7.3,0.75],[4.0,3.0,0.75]],courtyard:[[-0.3,0.6,0.45],[-3.0,0.6,0.6],[-1.75,-0.8,0.75]],passage:[[-1.75,5.3,0.45]],door:[[-4.9,4.85,0.75]]},
 order:['gate','courtyard','passage','door'],
 near:1.3,                  // an end within this of a player can be taken (the base's grab distance)
 out:0.4,                   // a ring sits this far beyond its end of the sofa, clear of the sofa itself
 bumpTip:{frames:14,win:2.5},        // this many blocked carry frames in this many seconds: the wall tip
 slowTip:{s:15,gain:0.3},           // carrying this long without getting this much closer: the "head for the ring" tip
 pushS:1.8,                         // pushing this long while the sofa stays within 0.25 m: the wall tip too
 tipS:6,tipGap:12,
 colour:['blue','gold'],hex:['#6F8DE0','#E3A72F'],gold:'#F2C14E',
 t:0,carryT:0,best:Infinity,bestAt:0,bumps:[],bumped:false,pushFrom:null,pushT:0,pushB:0,route:'',tip:['',''],tipAt:[-99,-99],tipLast:{},g:null,ends:[],goal:null,
 cards:[null,null],arrows:[null,null],arrowOn:[false,false],shown:[null,null],stage:['',''],tight:[false,false],lastBump:0,leg:-1,wp:0,legId:'',lead:null
};

/* ---------- what the world shows ---------- */
function moveinOn71c(){ return !!(typeof S!=='undefined'&&S&&S.p&&S.phase==='play'&&S.sofa&&S.sofa.state!=='placed'&&typeof sofa!=='undefined'&&sofa&&sofa.g&&
 typeof players!=='undefined'&&players.length===2&&typeof guided33==='function'&&guided33()); }
// the views that get a card: the players who play on this screen
function moveinViews71c(){ const si=typeof singleIdx==='function'?singleIdx():-1; return si>=0?[si]:[0,1]; }
function moveinCompanion71c(){ return typeof AI!=='undefined'&&!!AI.on; }
// where the carried sofa is on its way, by the spaces it is in (the walls of buildWorld): outside the compound on the
// street, in the courtyard, in the narrow passage, or in the hall by the flat door (or already in the door)
function moveinRoute71c(){ const x=sofa.g.position.x,z=sofa.g.position.z;
 if(x<-2.35) return z>7.0?'gate':'door';                         // the flat, its veranda and the street in front of them
 if(z>5.9) return 'gate';                                         // the street outside the compound's front wall
 if(z>4.6&&x>2.4&&x<5.6) return 'gate';                           // just inside the gate: its back end is not through yet
 if(z>=2.9&&x<=0.65) return x>=-2.35&&x<=-1.15&&z<3.9?'passage':'door';   // the hall (at its top, straight out of the passage, the back end is still in it)
 if(x<=-1.15&&z>=1.4) return 'passage';                           // the narrow passage
 return 'courtyard'; }
// the leg of the way the carry is on: the space the sofa is in, or the next leg once a holder has reached the last gold
// ring of this one during this carry (a player walking to a ring is a metre ahead of the sofa's centre)
function moveinLeg71c(){ const M=MOVEIN71C; return M.order[Math.max(M.order.indexOf(moveinRoute71c()),Math.min(M.order.length-1,M.leg+1))]; }
// the gold ring to walk to now
function moveinGoal71c(){ const M=MOVEIN71C, id=moveinLeg71c(), R=M.target[id]; return R[id===M.legId?Math.min(M.wp,R.length-1):0]; }
// the crate is in the sofa's line along the passage (from in front of it to the end of the hall), and still where it can be pushed aside
function moveinCrate71c(){ if(typeof crate==='undefined'||!crate) return false; const x=crate.position.x,z=crate.position.z; return x>-2.47&&x<-1.03&&z>-1.2&&z<1.6; }
// a ring there is no need for: in front of the gate once the sofa is at the gate; the crate rings once the crate is out of the line
function moveinPast71c(id,k){ return (id==='gate'&&k===0&&sofa.g.position.z<6.7)||(id==='courtyard'&&k<2&&!moveinCrate71c()); }
function moveinReach71c(){ const M=MOVEIN71C; if(!sofa.carrying){ M.leg=-1; M.wp=0; M.legId=''; M.lead=null; return; }
 const holders=(sofa.holder||[]).filter(h=>h!==null&&h!==undefined&&players[h]).map(h=>players[h].g), near=(T,q,r)=>!!q&&Math.hypot(q.position.x-T[0],q.position.z-T[1])<r;
 // a finished leg counts while the sofa is not yet in a later space and a holder is still near its last ring: carried back, it is to do again
 const sp=M.order.indexOf(moveinRoute71c()); if(M.leg>=0&&sp<=M.leg){ const R=M.target[M.order[M.leg]]; if(!holders.some(g=>near(R[R.length-1],g,2.5))) M.leg=sp-1; }
 const id=moveinLeg71c(), R=M.target[id]; if(id!==M.legId){ M.legId=id; M.wp=0; }
 while(M.wp<R.length-1&&moveinPast71c(id,M.wp)) M.wp++;
 const T=R[M.wp];
 // two players carrying: who goes first, worked out when it is lifted and kept for the whole carry (the other walks the
 // same way behind; swapping on the way would turn the sofa round). Player 2 only when clearly nearer the ring, so the two
 // phones of a two-phone household, each seeing the partner a moment late, agree
 if(M.lead===null){ const hd=[0,1].map(i=>players[i]&&players[i].g?Math.hypot(players[i].g.position.x-T[0],players[i].g.position.z-T[1]):Infinity); M.lead=hd[1]<hd[0]-0.5?1:0; }
 if(near(T,sofa.g,0.6)||holders.some(g=>near(T,g,T[2]||0.75))){ if(M.wp<R.length-1) M.wp++; else M.leg=Math.max(M.leg,M.order.indexOf(id)); } }
function moveinEndDist71c(i){ const p=players[i]&&players[i].g; if(!p) return Infinity; let d=Infinity;
 for(const e of [0,1]){ const q=sofaEnd(e); d=Math.min(d,Math.hypot(p.position.x-q[0],p.position.z-q[1])); } return d; }
// one player's step (1 to 5), worked out from the world
function moveinStep71c(i){
 const held=sofa.holder||[null,null];
 if(sofa.carrying){ const r=moveinLeg71c(); return {n:r==='gate'?3:r==='door'?5:4,id:r}; }
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
 const first=MOVEIN71C.lead===null||MOVEIN71C.lead===i, lead=esc(pname(MOVEIN71C.lead===null?i:MOVEIN71C.lead));
 if(st.id==='gate'){ title='In through the gate'; f=`${moveinCap71c(act)} again to set it down.`;
  d=comp?'Walk to the gold ring. Your companion carries the other end behind you.'
   :first?`You go first, ${other} behind you: walk to the gold ring. It only fits through the gate end first.`
   :`Walk behind ${lead}, who goes first to the gold ring. It only fits through the gate end first.`; }
 else if(st.id==='courtyard'){ title='Left, to the narrow passage';
  d=MOVEIN71C.legId==='courtyard'&&MOVEIN71C.wp<2?'The crate in front of the passage is in the way. Walk to the gold ring and on through the crate: it slides aside.'
   :'Across the courtyard to the gold ring in front of the passage, on the left. The stairs on the right are not the way.'; }
 else if(st.id==='passage'){ title='Along the passage';
  d=comp?'Straight along the narrow passage to the gold ring at the end of the hall, your companion following.'
   :first?`Straight along the narrow passage to the gold ring at the end of the hall, with ${other} behind you.`:`Follow ${lead} along the narrow passage, behind.`; }
 else if(st.id==='door'){ title='Through the door, end first';
  d=comp?'Walk through the door first; the sofa follows end first.'
   :first?`Walk through the door first, with ${other} behind you; the sofa follows end first.`:`Follow ${lead} through the door; the sofa follows end first.`; }
 return {n:st.n,id:st.id,title,d,f,tip:sofa.carrying?MOVEIN71C.tip[i]:''};
}

/* ---------- tips during the carry ---------- */
function moveinTip71c(key,text){ const M=MOVEIN71C; if(M.t-(M.tipLast[key]===undefined?-99:M.tipLast[key])<M.tipGap) return; M.tipLast[key]=M.t;
 for(const i of moveinViews71c()){ M.tip[i]=text; M.tipAt[i]=M.t; } }
function moveinWallTip71c(){ moveinTip71c('wall',moveinCompanion71c()?'Caught? Back up a little, then walk straight at the opening: your companion follows and the sofa goes through end first.'
 :'Caught? Back up a little, then one of you goes first and the other follows: the sofa fits through end first.'); }
// one screen, both holders pressing: are they walking different ways?
function moveinApart71c(){ if(moveinCompanion71c()||(typeof NET!=='undefined'&&NET.on)||typeof inputVec!=='function') return false; const h=sofa.holder||[];
 if(h[0]===null||h[0]===undefined||h[1]===null||h[1]===undefined) return false; const a=inputVec(h[0]),b=inputVec(h[1]),la=Math.hypot(a[0],a[1]),lb=Math.hypot(b[0],b[1]);
 return la>0.3&&lb>0.3&&(a[0]*b[0]+a[1]*b[1])/(la*lb)<-0.3; }
function moveinTips71c(dt,bumped){ const M=MOVEIN71C;
 for(const i of [0,1]) if(M.tip[i]&&M.t-M.tipAt[i]>M.tipS) M.tip[i]='';
 if(!sofa.carrying){ M.carryT=0; M.best=Infinity; M.bumps.length=0; M.pushFrom=null; M.route=''; M.tip=['','']; return; }   // tips are about the carry
 M.carryT+=dt;
 if(bumped){ M.bumps.push(M.t); while(M.bumps.length&&M.t-M.bumps[0]>M.bumpTip.win) M.bumps.shift();
  if(M.bumps.length>=M.bumpTip.frames){ M.bumps.length=0; moveinWallTip71c(); } }
 // pushing on the stick or keys without the sofa getting anywhere: a holder is walking into a wall, or the sofa does not fit that way
 const pushing=moveinViews71c().some(i=>(sofa.holder||[]).includes(i)&&!(moveinCompanion71c()&&i===AI.i)&&(()=>{ const v=typeof inputVec==='function'?inputVec(i):[0,0]; return Math.hypot(v[0],v[1])>0.3; })()),
  pos=[sofa.g.position.x,sofa.g.position.z];
 if(!pushing) M.pushFrom=null;
 else if(!M.pushFrom||Math.hypot(pos[0]-M.pushFrom[0],pos[1]-M.pushFrom[1])>0.25){ M.pushFrom=pos; M.pushT=0; M.pushB=sofa.bump||0; }
 else if((M.pushT+=dt)>M.pushS){ M.pushT=0;
  // on two phones a partner whose phone is not walking (a panel open there, or standing still) holds the sofa back without any wall
  const online=typeof NET!=='undefined'&&NET.on, still=online&&NET.otherPres&&!NET.otherPres.mv&&(sofa.bump||0)===M.pushB;
  if(still) moveinTip71c('partner',`${pname(1-NET.myIndex)} is not walking with you. The sofa moves when you both walk.`);
  else if((sofa.bump||0)===M.pushB&&moveinApart71c()) moveinTip71c('apart','You are walking different ways. Walk the same way, one in front of the other.');
  else moveinWallTip71c(); }
 const r=moveinLeg71c()+M.wp,T=moveinGoal71c();
 if(r!==M.route){ M.route=r; M.best=Infinity; M.bestAt=M.carryT; }   // a new ring to head for: progress is measured from here
 if(moveinLeg71c()==='courtyard'&&sofa.g.position.x>5.2) moveinTip71c('east','Your door is the other way: left, through the narrow passage.');
 const d=Math.hypot(sofa.g.position.x-T[0],sofa.g.position.z-T[1]);
 if(d<M.best-M.slowTip.gain||M.best===Infinity){ M.best=d; M.bestAt=M.carryT; }
 else if(M.carryT-M.bestAt>M.slowTip.s){ M.bestAt=M.carryT; M.best=d;
  const onIt=(sofa.holder||[]).some(h=>h!==null&&h!==undefined&&players[h]&&Math.hypot(players[h].g.position.x-T[0],players[h].g.position.z-T[1])<(T[2]||0.75));
  moveinTip71c('slow',onIt?'A little further: it is in once all of the sofa is through the door.':'Head for the gold ring'+(M.arrowOn.some(Boolean)?': the arrow at the edge of the screen points to it.':'.')); }
}

/* ---------- the world: rings at the free ends and at the next place ---------- */
// where a player can stand to take end e: just beyond it if that is free ground, otherwise beside it (a wall or a piece of
// furniture can be right behind a sofa set down in the passage or the hall)
function moveinStand71c(e){ const M=MOVEIN71C, q=sofaEnd(e), cx=sofa.g.position.x, cz=sofa.g.position.z, l=Math.hypot(q[0]-cx,q[1]-cz)||1, ux=(q[0]-cx)/l, uz=(q[1]-cz)/l;
 const tries=[[M.out,0],[0.15,0.45],[0.15,-0.45],[0.7,0],[-0.2,0.5],[-0.2,-0.5]];
 for(const [a,b] of tries){ const x=q[0]+ux*a-uz*b, z=q[1]+uz*a+ux*b; if(typeof blocked!=='function'||!blocked(x,z,0.26,{noSofa:true,noCrate:true})) return [x,z]; }
 return [q[0]+ux*M.out,q[1]+uz*M.out]; }
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
  if(be<0) continue; used.add(be); const s=moveinStand71c(be); ring.position.set(s[0],0.03,s[1]); ring.material.opacity=pulse; ring.visible=true; }
 // the gold ring where the sofa goes next, while it is carried
 M.goal.visible=!!sofa.carrying; if(sofa.carrying){ const T=moveinGoal71c(); M.goal.position.set(T[0],0.04,T[1]); const s=1+0.08*Math.sin(M.t*3); M.goal.scale.set(s,s,s); M.goal.children.forEach(c=>{ c.material.opacity=0.35+pulse*0.5; }); }
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
  const T=moveinGoal71c(), c=typeof cams!=='undefined'&&cams[i], vp=typeof v21Viewport==='function'?v21Viewport(i):null;
  if(!c||!vp||typeof c.updateMatrixWorld!=='function'){ if(el) el.style.display='none'; continue; }
  c.updateMatrixWorld(); const v=new THREE.Vector3(T[0],0.3,T[1]).project(c), behind=v.z>1;
  let sx=(v.x+1)/2*vp.w, sy=(1-v.y)/2*vp.h; const x0=vp.w*0.1,x1=vp.w*0.9,y0=vp.top+20,y1=Math.max(y0+20,vp.h-vp.bottom-20); let card=null;
  try{ const c=M.cards[i], half=document.getElementById('half'+i); if(c&&half&&typeof c.getBoundingClientRect==='function'){ const r=c.getBoundingClientRect(), h=half.getBoundingClientRect();
   if(r&&h&&r.height>0) card={x1:r.left-h.left-24,x2:r.right-h.left+24,y1:r.top-h.top-24,y2:r.bottom-h.top+28}; } }catch(e){}
  const underCard=card&&sx>=card.x1&&sx<=card.x2&&sy>=card.y1&&sy<=card.y2;
  if(!behind&&sx>=x0&&sx<=x1&&sy>=y0&&sy<=y1&&!underCard){ if(el) el.style.display='none'; continue; }   // the ring is in view
  const cx=vp.w/2, cy=(y0+y1)/2; let dx=sx-cx, dy=sy-cy; if(behind){ dx=-dx; dy=-dy; } const ang=Math.atan2(dy,dx);
  let t=1e9; const ux=Math.cos(ang),uy=Math.sin(ang); if(ux>1e-6) t=Math.min(t,(x1-cx)/ux); if(ux<-1e-6) t=Math.min(t,(x0-cx)/ux); if(uy>1e-6) t=Math.min(t,(y1-cy)/uy); if(uy<-1e-6) t=Math.min(t,(y0-cy)/uy);
  let ax=cx+ux*t, ay=cy+uy*t;
  if(card&&ax>=card.x1&&ax<=card.x2&&ay>=card.y1&&ay<=card.y2){   // never on the card: just below it, or beside it when the view has no room below
   if(card.y2<=y1) ay=card.y2; else if(card.x2<=x1) ax=card.x2; else { if(el) el.style.display='none'; continue; } }
  el=el||moveinEl71c(i,'mv71c-arrow','<span class="g">➜</span>'); if(!el) continue;
  el.style.display='block'; el.style.left=ax.toFixed(0)+'px'; el.style.top=ay.toFixed(0)+'px';
  const g=el.querySelector&&el.querySelector('.g'); if(g) g.style.transform=`rotate(${(ang*180/Math.PI).toFixed(1)}deg)`; M.arrowOn[i]=true; }
}
function moveinOff71c(){ const M=MOVEIN71C; moveinWorld71c(false); moveinCards71c(false); for(const el of M.arrows) if(el) el.style.display='none'; M.arrowOn=[false,false]; M.tip=['','']; }

// a toast that would cover a mission card (a narrow screen: both are near the top) is shown just below the lowest card it meets
function moveinToast71c(){ try{ const M=MOVEIN71C, t=document.getElementById('toast'); if(!t||!t.style||t.style.top||typeof t.getBoundingClientRect!=='function'||!moveinOn71c()) return;   // a set top: a journal page placed it
 const r=t.getBoundingClientRect(); if(!(r.height>0)) return; let top=null;
 for(const c of M.cards){ if(!c||c.className.indexOf(' on')<0||typeof c.getBoundingClientRect!=='function') continue; const b=c.getBoundingClientRect();
  if(b.height>0&&r.left<b.right&&b.left<r.right&&r.top<b.bottom&&b.top<r.bottom) top=Math.max(top===null?0:top,Math.round(b.bottom+8)); }
 if(top!==null) t.style.top=top+'px'; }catch(e){} }
if(typeof toastSpot34b==='function'){ const spot71c=toastSpot34b;
 // wrap: the base place for toasts (and the journal's), then clear of the mission card; this runs every frame and on each toast
 toastSpot34b=function(){ const r=spot71c.apply(this,arguments); moveinToast71c(); return r; };
}

/* ---------- wraps ---------- */
// the mission's frame step: rings, tips and arrows follow the world
function moveinFrame71c(dt){ const M=MOVEIN71C; M.t+=dt; const bumped=M.bumped; M.bumped=false;
 if(!moveinOn71c()){ if(M.g&&M.g.visible) moveinOff71c(); M.was=false; return; }
 if(!M.was){ M.was=true; M.route=''; M.best=Infinity; M.leg=-1; M.wp=0; M.legId=''; M.lead=null; }   // the mission back on (guidance resumed): nothing measured before counts
 moveinReach71c(); moveinTips71c(dt,bumped); moveinWorld71c(true); moveinArrows71c(true); }
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
function moveinReset71c(){ const M=MOVEIN71C; M.tip=['','']; M.tipAt=[-99,-99]; M.tipLast={}; M.carryT=0; M.best=Infinity; M.bumps=[]; M.pushFrom=null; M.route=''; M.leg=-1; M.wp=0; M.legId=''; M.lead=null; M.stage=['','']; M.shown=[null,null]; }
if(typeof enterWorld==='function'){ const enter71c=enterWorld;
 // wrap: entering the world starts the mission's tips afresh
 enterWorld=function(){ moveinReset71c(); return enter71c.apply(this,arguments); };
}
if(typeof updateHUD==='function'){ const hud71c=updateHUD;
 // wrap: the HUD (redrawn four times a second) draws each player's mission card
 updateHUD=function(){ const r=hud71c.apply(this,arguments); try{ if(moveinOn71c()) moveinCards71c(true); else if(MOVEIN71C.cards.some(Boolean)) moveinCards71c(false); }catch(e){} return r; };
}
if(typeof openPanel==='function'){ const panel71c=openPanel;
 // wrap: the move-in panel introduces the mission instead of explaining the whole route; "It is in" says what was learned
 openPanel=function(html){
  if(typeof html==='string'&&S&&typeof evening33==='function'&&evening33()){
   if(html.indexOf('<h2>Palm Court, Flat 3</h2>')>=0&&guided33()&&S.sofa&&S.sofa.state!=='placed')
    html=html.replace(/<div class="hint">[\s\S]*?<\/div>/,`<div class="hint"><b>Your first job together: get the sofa in.</b> A card at the top of the screen takes you through it one step at a time, and a ring on the ground shows where to go.</div>`);
   else if(html.indexOf('<h2>It is in</h2>')>=0&&guided33()){ const v=moveinViews71c(), how=v.length===1?moveinAct71c(v[0]):'press your action button';
    html=html.replace('<h2>It is in</h2>',`<h2>It is in</h2><p class="mv71c-done"><b>Moving day: done.</b> You took an end each and steered it home together. Everything else in Palm Court works the same way: walk up to it and ${how}.</p>`); } }
  return panel71c.call(this,html); };
}

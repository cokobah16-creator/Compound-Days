/* A Bench for Evening Gist: local two-player delivery, additive household save. */
'use strict';
const BENCH35 = {
  root:null, model:null, marker:null, preview:null, grips:[],
  mode:'ground', holders:[null,null], votes:[false,false], driver:0,
  move:[0,0], turn:0, moving:false, notice:0, elapsed:0, selectionLatch:[0,0]
};
const BENCH_START35 = {x:4,z:6.65,yaw:Math.PI/2};
const BENCH_ROUTE35 = [
  {x:4,z:4.4,name:'Through the gate',hint:'Turn the narrow end through the gate.'},
  {x:3.6,z:-1.35,name:'Around the generator',hint:'Keep north of the generator; there is room to turn.'},
  {x:-.55,z:.05,name:'Past the planter',hint:'Round the generator, then pass below the little planter.'},
  {x:-3.65,z:.75,name:'Your veranda',hint:'Bring the bench to the gold ring.'}
];
const BENCH_SPOTS35 = [
  {x:-3.65,z:1.25,yaw:Math.PI,name:'Near the passage',detail:'A little closer to the comings and goings.'},
  {x:-4.15,z:1.25,yaw:Math.PI,name:'In the middle',detail:'A view across the courtyard.'},
  {x:-4.7,z:1.10,yaw:Math.PI,name:'By the plants',detail:'The quieter end of the veranda.'}
];
function benchState35(){
  if(!S||!S.p)return null;
  if(!S.bench35)S.bench35={version:1,status:'ready',driver:0,pose:{...BENCH_START35},checkpoint:{...BENCH_START35},step:0,choice:0,arrived:false,completed:false,metrics:{lifts:0,bumps:0,swaps:0,resets:0,seconds:0}};
  return S.bench35;
}
function benchActive35(){return !!(S&&S.bench35&&S.bench35.status==='delivery'&&!S.bench35.paused&&BENCH35.root);}
function benchLocked35(i){return !!(BENCH35.root&&S&&S.bench35&&
  (BENCH35.mode==='seated'||(benchActive35()&&(BENCH35.mode==='choose'||BENCH35.mode==='carry'||BENCH35.holders.includes(i)))));}
function benchEnd35(pose,k){const s=k===0?1:-1;return [pose.x+s*1.08*Math.cos(pose.yaw),pose.z-s*1.08*Math.sin(pose.yaw)];}
// Separating-axis test: a rotated bench against an axis-aligned obstacle.
function benchOverlap35(p,o,hl=.78,hd=.27){
  const c=Math.cos(p.yaw),s=Math.sin(p.yaw),dx=(o.x1+o.x2)/2-p.x,dz=(o.z1+o.z2)/2-p.z;
  const w=(o.x2-o.x1)/2,d=(o.z2-o.z1)/2;
  return Math.abs(dx)<w+Math.abs(c)*hl+Math.abs(s)*hd && Math.abs(dz)<d+Math.abs(s)*hl+Math.abs(c)*hd &&
    Math.abs(dx*c-dz*s)<hl+Math.abs(c)*w+Math.abs(s)*d && Math.abs(dx*s+dz*c)<hd+Math.abs(s)*w+Math.abs(c)*d;
}
function benchObstacles35(){
  const out=OBS.filter(o=>(o.lvl||0)!==1).concat(FURN_OBS);
  if(crate)out.push(crateBox());
  if(sofa&&sofa.g.visible)out.push(sofaBox());
  PUSH.forEach(p=>{if(!p.gone&&p.lvl===0)out.push(pushBox(p));});
  return out;
}
function benchClear35(p,withPlayers=true){
  if(![p.x,p.z,p.yaw].every(Number.isFinite))return false;
  const ends=withPlayers?[benchEnd35(p,0),benchEnd35(p,1)]:[];
  for(const o of benchObstacles35()){
    if(benchOverlap35(p,o))return false;
    if(ends.some(e=>hitAABB(e[0],e[1],PR+.015,o)))return false;
  }
  return true;
}
function benchRaw35(i){
  const v=sticks[i].v,pad=padVec(i);
  let x=(i?Number(!!keys.arrowright)-Number(!!keys.arrowleft):Number(!!keys.d)-Number(!!keys.a))+v[0]+pad[0];
  let z=(i?Number(!!keys.arrowdown)-Number(!!keys.arrowup):Number(!!keys.s)-Number(!!keys.w))+v[1]+pad[1];
  const n=Math.max(1,Math.hypot(x,z));return [x/n,z/n];
}
function benchPlayer35(p,dt){
  const b=BENCH35,s=benchState35();p.prev=[p.g.position.x,p.g.position.z];
  const raw=benchRaw35(p.i);
  if(b.mode==='carry'){
    if(p.i===b.driver){const fl=Math.hypot(CAM_DIR.x,CAM_DIR.z),fx=-CAM_DIR.x/fl,fz=-CAM_DIR.z/fl;b.move=[raw[0]*(-fz)-raw[1]*fx,raw[0]*fx-raw[1]*fz];}
    else b.turn=-raw[0];
  } else if(b.mode==='choose'){
    const dir=Math.abs(raw[0])>.55?Math.sign(raw[0]):0;
    if(dir&&dir!==b.selectionLatch[p.i])benchChoose35(dir);
    b.selectionLatch[p.i]=dir;
  }
  p.moving=b.mode==='carry'&&b.moving;p.t+=dt;
  animAvatar(p.g,p.t,p.moving,b.mode==='carry'?'low':false,p.moving?1.1:0,dt);
}
function benchSync35(){
  const b=BENCH35,s=benchState35();if(!b.model||!s)return;
  b.model.position.set(s.pose.x,b.mode==='carry'?.30:0,s.pose.z);b.model.rotation.y=s.pose.yaw;
  b.model.updateWorldMatrix(true,true);
  b.grips.forEach((g,k)=>{const p=benchEnd35(s.pose,k);g.position.set(p[0],.045,p[1]);g.visible=s.status==='delivery'&&b.mode==='ground';g.material.color.set(b.holders[k]===null?(k?'#E3A72F':'#6F8DE0'):'#87B68C');});
  if(b.mode==='carry'||b.mode==='ground')b.holders.forEach((i,k)=>{
    if(i===null||!players[i])return;const p=players[i],e=benchEnd35(s.pose,k);
    p.g.position.set(e[0],0,e[1]);p.g.baseY=0;p.y=0;p.lvl=0;
    p.g.rotation.y=Math.atan2(s.pose.x-e[0],s.pose.z-e[1]);
  });
}
function benchModel35(ghost=false){
  const g=new THREE.Group();g.name=ghost?'bench35_placement_preview':'bench35_wooden';
  const wood=ghost?new THREE.MeshBasicMaterial({color:'#96CBA8',transparent:true,opacity:.45,depthWrite:false}):material31('wood','#A57650');
  const piece=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(bevel31(w,h,d,.018),wood);m.position.set(x,y,z);m.castShadow=!ghost;m.receiveShadow=true;g.add(m);};
  // Seat at .48 m; the existing seating IK uses this same frame.
  for(let k=0;k<3;k++)piece(1.52,.065,.14,0,.48,-.16+k*.16);
  for(const x of [-.62,.62]){piece(.09,.46,.09,x,.23,-.17);piece(.09,.46,.09,x,.23,.17);piece(.09,.79,.09,x,.395,-.22);}
  piece(1.5,.15,.065,0,.79,-.22);piece(1.25,.06,.06,0,.20,0);
  return g;
}
function benchRemove35(){
  if(BENCH35.mode==='seated')sitStop();
  if(BENCH35.root){BENCH35.root.parent?.remove(BENCH35.root);BENCH35.root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material?.isMeshBasicMaterial)o.material.dispose();});}
  BENCH35.root=null;BENCH35.model=null;BENCH35.mode='ground';BENCH35.holders=[null,null];BENCH35.votes=[false,false];
}
function benchBuild35(){
  benchRemove35();const s=benchState35();if(!scene||!s||s.status==='ready')return;
  const b=BENCH35;b.driver=s.driver===1?1:0; b.root=new THREE.Group();b.root.name='evening_gist35';scene.add(b.root);
  b.model=benchModel35();b.root.add(b.model);b.preview=benchModel35(true);b.root.add(b.preview);b.preview.visible=false;
  b.grips=[0,1].map(k=>{const g=new THREE.Mesh(new THREE.TorusGeometry(.24,.025,6,24),new THREE.MeshBasicMaterial({color:k?'#E3A72F':'#6F8DE0'}));g.rotation.x=-Math.PI/2;b.root.add(g);return g;});
  b.marker=new THREE.Mesh(new THREE.TorusGeometry(.6,.035,6,36),new THREE.MeshBasicMaterial({color:'#E4B754',depthTest:false}));b.marker.rotation.x=-Math.PI/2;b.root.add(b.marker);
  if(s.status==='delivery'&&!benchClear35(s.pose,false)){s.pose={...s.checkpoint};s.arrived=false;}
  b.mode=s.arrived&&!s.paused&&s.status==='delivery'?'choose':'ground';benchSync35();benchMarker35();
}
function benchMarker35(){
  const b=BENCH35,s=benchState35();if(!b.root)return;
  b.preview.visible=b.mode==='choose';b.marker.visible=s.status==='delivery'&&!s.paused&&!s.arrived;
  if(b.marker.visible){const w=BENCH_ROUTE35[s.step];b.marker.position.set(w.x,.06,w.z);}
  if(b.preview.visible){const p=BENCH_SPOTS35[s.choice];b.preview.position.set(p.x,0,p.z);b.preview.rotation.y=p.yaw;
    b.preview.children.forEach(m=>m.material.color.set(benchClear35(p,false)?'#96CBA8':'#D97F69'));}
}
function benchGrab35(i){
  if(!benchActive35()||BENCH35.mode!=='ground')return;
  const b=BENCH35,s=benchState35(),held=b.holders.indexOf(i);
  if(held>=0){b.holders[held]=null;benchSync35();return;}
  const pos=players[i].g.position;
  const choices=[0,1].filter(k=>b.holders[k]===null).map(k=>({k,d:Math.hypot(pos.x-benchEnd35(s.pose,k)[0],pos.z-benchEnd35(s.pose,k)[1])})).sort((a,c)=>a.d-c.d);
  if(!choices.length||choices[0].d>1.25||(players[i].y||0)>.2)return;
  if(!benchClear35(s.pose,true)){toast('Make a little room at both ends before lifting.');return;}
  b.holders[choices[0].k]=i;benchSync35();
  if(b.holders.every(x=>x!==null)){b.mode='carry';s.metrics.lifts++;b.move=[0,0];b.turn=0;toast(pname(b.driver)+' moves. '+pname(1-b.driver)+' turns. Small-small.');}
  else toast(pname(i)+' is ready. Take the other end.');
  save();
}
function benchDrop35(){
  if(!benchActive35()||!['carry','ground'].includes(BENCH35.mode))return;
  BENCH35.mode='ground';BENCH35.holders=[null,null];BENCH35.move=[0,0];BENCH35.turn=0;BENCH35.moving=false;
  benchSync35();save();toast('Set down safely. Menu → Bench to swap roles or reset.');
}
function benchMove35(dx,dz,dyaw){
  const s=benchState35();if(!s)return false;
  // Sweep in small steps; rotation cannot tunnel through a corner on a slow frame.
  const n=Math.max(1,Math.ceil(Math.max(Math.hypot(dx,dz)/.045,Math.abs(dyaw)/.035)));
  let moved=false;
  for(let k=0;k<n;k++){
    const p={x:s.pose.x+dx/n,z:s.pose.z+dz/n,yaw:s.pose.yaw+dyaw/n};
    if(!benchClear35(p,true))break;
    s.pose=p;moved=true;
  }
  return moved;
}
function benchTick35(dt,active){
  if(!S||S.phase!=='play'||!BENCH35.root){benchHud35.style.display='none';return;}
  const b=BENCH35,s=benchState35();b.notice=Math.max(0,b.notice-dt);
  if(b.mode==='seated'&&!SEATING30.active)b.mode='ground';
  if(active&&benchActive35()){
    s.metrics.seconds+=dt;
    if(b.mode==='carry'){
      const dx=b.move[0]*1.12*dt,dz=b.move[1]*1.12*dt,rot=b.turn*.95*dt;
      b.moving=benchMove35(dx,dz,rot);
      if(!b.moving&&Math.abs(dx)+Math.abs(dz)+Math.abs(rot)>.001&&b.notice===0){s.metrics.bumps++;b.notice=1.4;toast('Easy — a wall or object is close. Turn or step back.');}
      b.move=[0,0];b.turn=0;
      const w=BENCH_ROUTE35[s.step];
      if(Math.hypot(s.pose.x-w.x,s.pose.z-w.z)<.72){
        if(s.step===BENCH_ROUTE35.length-1){
          s.arrived=true;b.mode='choose';b.holders=[null,null];b.votes=[false,false];b.moving=false;benchStepAside35();
          toast('Home. Choose a spot, then each of you press Act to agree.');
        }else{s.step++;s.checkpoint={...s.pose};toast('Good turn. Next: '+BENCH_ROUTE35[s.step].name.toLowerCase()+'.');}
        benchMarker35();save();
      }
    }
    benchSync35();
  }
  benchRenderHud35();
}
function benchStepAside35(){
  const s=benchState35(),taken=[];
  for(const p of players){
    let chosen=null;
    // Step out of the placement area into nearby clear courtyard floor.
    for(let radius=.9;radius<3&&!chosen;radius+=.3)for(let k=0;k<24;k++){
      const angle=k*Math.PI/12,x=s.pose.x+Math.cos(angle)*radius,z=s.pose.z+Math.sin(angle)*radius;
      const box={x1:x-PR,x2:x+PR,z1:z-PR,z2:z+PR};
      if(z>.5||benchObstacles35().some(o=>hitAABB(x,z,PR+.02,o))||benchOverlap35(s.pose,box)||BENCH_SPOTS35.some(b=>benchOverlap35(b,box))||taken.some(q=>Math.hypot(q[0]-x,q[1]-z)<.8))continue;
      chosen=[x,z];break;
    }
    if(chosen){p.g.position.set(chosen[0],0,chosen[1]);p.g.baseY=0;p.y=0;p.lvl=0;taken.push(chosen);}
  }
}
function benchChoose35(dir){
  if(BENCH35.mode!=='choose')return;
  const s=benchState35();s.choice=(s.choice+dir+BENCH_SPOTS35.length)%BENCH_SPOTS35.length;BENCH35.votes=[false,false];benchMarker35();benchRenderHud35();
}
function benchVote35(i){
  if(!benchActive35()||BENCH35.mode!=='choose'||![0,1].includes(i))return;
  const s=benchState35(),p=BENCH_SPOTS35[s.choice];
  if(!benchClear35(p,false)){toast('That spot is occupied. Try another.');return;}
  // Never commit furniture over a standing person.
  if(players.some(q=>benchOverlap35(p,{x1:q.g.position.x-PR,x2:q.g.position.x+PR,z1:q.g.position.z-PR,z2:q.g.position.z+PR}))){toast('Step clear of that spot first. Menu → Bench → Set down to reposition.');return;}
  BENCH35.votes[i]=true;
  if(BENCH35.votes.every(Boolean)){
    s.pose={x:p.x,z:p.z,yaw:p.yaw};s.status='placed';s.arrived=false;
    if(!s.completed){s.completed=true;remember('Our bench on the veranda. We carried it together, small-small.','moment');}
    BENCH35.mode='ground';benchSync35();benchMarker35();save();
    toast('Our bench. Come close together and press Act to sit.');
  }
  benchRenderHud35();
}
function benchStart35(){
  if(!S||S.phase!=='play'||NET.on)return;
  if(AI.on){toast('Switch to two-player controls in this activity first.');return;}
  if((sofa&&sofa.carrying)||S.ck||(S.party&&S.party.on&&!S.party.done)||(S.roof&&S.roof.on)){toast('Finish or set down your current activity first.');return;}
  const s=benchState35();if(s.status==='placed'){benchPanel35();return;}
  const startPose=s.status==='ready'?BENCH_START35:s.pose;
  if(!benchClear35(startPose,true)){toast('Move the objects beside the bench, then try again.');return;}
  if(s.status==='ready'){s.status='delivery';s.pose={...BENCH_START35};s.checkpoint={...BENCH_START35};s.step=0;}
  s.paused=false;closePanel();both().forEach(clearGhost);
  if(LIFE34.waypoint)ACTIONS.lifeClear();
  benchBuild35();players.forEach((p,i)=>{const e=benchEnd35(s.pose,i);p.g.position.set(e[0],0,e[1]);p.g.baseY=0;p.y=0;p.lvl=0;});
  Object.keys(keys).forEach(k=>keys[k]=false);act[0]=act[1]=false;sticks.forEach(s=>s.v=[0,0]);
  save();updateHUD();toast('Each of you: press Act to take one end.');
}
function benchReset35(){
  if(!benchActive35())return;const s=benchState35();
  let p={...s.checkpoint};if(!benchClear35(p,true))p={...BENCH_START35};
  if(!benchClear35(p,true)){toast('The reset spot is blocked. Clear the objects first.');return;}
  if(p.x===BENCH_START35.x&&p.z===BENCH_START35.z)s.step=0;
  s.pose=p;s.arrived=false;s.metrics.resets++;closePanel();benchBuild35();
  players.forEach((q,i)=>{const e=benchEnd35(p,i);q.g.position.set(e[0],0,e[1]);q.g.baseY=0;q.y=0;q.lvl=0;});save();
}
function benchSit35(i){
  const s=benchState35();if(s?.status!=='placed'||BENCH35.mode==='seated')return;
  if(players.some(p=>Math.hypot(p.g.position.x-s.pose.x,p.g.position.z-s.pose.z)>3)){toast('Both of you, for this. Come a little closer.');return;}
  closePanel();const original=sofaSeatFrame;
  try{sofaSeatFrame=()=>({frame:BENCH35.model,height:.515,depth:.01,spacing:.32});sitStart();}finally{sofaSeatFrame=original;}
  if(SEATING30.active){BENCH35.mode='seated';toast('The compound can wait. Press Act when you are ready to get up.');}
}
function benchPanel35(){
  const s=benchState35();if(!s)return;
  let actions='';
  if(NET.on)actions='<p class="hint">This activity uses two people on one device. Leave the network room to play it locally.</p>';
  else if(AI.on)actions=btn('Switch this household to two-player controls','benchLocal35',{},'primary block');
  else if(s.status==='ready')actions=btn('Meet at the bench','benchStart35',{},'primary block');
  else if(s.status==='delivery'&&s.paused)actions=btn('Resume delivery','benchResume35',{},'primary block')+btn('Find the bench','benchFind35',{},'block');
  else if(s.status==='delivery')actions=btn('Back to the bench','benchResume35',{},'primary block')+btn('Set down and swap roles','benchSwap35',{},'block')+btn('Reset to the last clear turn','benchReset35',{},'quiet block')+btn('Pause delivery and explore','benchPause35',{},'quiet block');
  else actions=btn('Find our bench','benchFind35',{},'primary block')+btn('Try the delivery again','benchReplayAsk35',{},'quiet block');
  openPanel('<section class="bench-panel35"><p class="life-kicker">PALM COURT · A LITTLE TEAMWORK</p><h2>A Bench for Evening Gist</h2><p>Tunde found a good wooden bench. Bring it through the gate, around the generator and onto your veranda.</p><div class="bench-roles35"><div><b>'+esc(pname(BENCH35.driver)||'Player 1')+' · Move</b><p>Use your movement stick or keys to guide the bench.</p></div><div><b>'+esc(pname(1-BENCH35.driver)||'Player 2')+' · Turn</b><p>Left and right turn both ends. Talk through the corners.</p></div></div><p class="hint">Take one end each with Act. Either player can set it down. Follow the gold ring; swap roles here whenever you like. At home, choose a spot and each press Act to approve.</p>'+actions+btn('Back to the compound','close',{},'quiet block')+'<p class="small muted">Two people, one device · Keyboard, touch or gamepads · No time limit</p></section>');
}
ACTIONS.bench35=benchPanel35;ACTIONS.benchStart35=benchStart35;ACTIONS.benchReset35=benchReset35;
ACTIONS.benchPause35=()=>{if(!benchActive35())return;if(BENCH35.mode==='carry'||BENCH35.holders.some(i=>i!==null))benchDrop35();benchState35().paused=true;BENCH35.mode='ground';BENCH35.votes=[false,false];benchMarker35();save();closePanel();toast('Bench delivery paused. Resume from Tasks or Menu.');};
ACTIONS.benchResume35=()=>{benchState35().paused=false;closePanel();if(benchState35().arrived){BENCH35.mode='choose';}benchMarker35();save();if(!benchState35().arrived)toast('Follow the gold ring, and take one end each.');};
ACTIONS.benchLocal35=()=>{if(NET.on)return;S.ai=false;aiRestore();save();benchPanel35();};
ACTIONS.benchSwap35=()=>{if(!benchActive35())return;if(BENCH35.mode==='choose'){BENCH35.mode='ground';benchState35().arrived=false;}benchDrop35();BENCH35.driver=1-BENCH35.driver;benchState35().driver=BENCH35.driver;benchState35().metrics.swaps++;save();closePanel();toast(pname(BENCH35.driver)+' moves now. Take one end each.');};
ACTIONS.benchChoose35=d=>benchChoose35(+d.dir);
ACTIONS.benchVote35=d=>benchVote35(+d.i);
ACTIONS.benchFind35=()=>{const s=benchState35();closePanel();LIFE34.waypoint={x:s.pose.x,z:s.pose.z,name:'Our bench'};refreshMarker34();};
ACTIONS.benchReplayAsk35=()=>{if(benchState35().status!=='placed')return;openPanel('<h2>Carry it again?</h2><p>Your bench returns to the delivery point. Your household, belongings and first bench memory stay saved.</p>'+btn('Yes, replay the delivery','benchReplay35',{},'primary block')+btn('Keep it where it is','close',{},'quiet block'));};
ACTIONS.benchReplay35=()=>{const s=benchState35();if(s.status!=='placed'||AI.on||NET.on)return;if(!benchClear35(BENCH_START35,true)){toast('The delivery point is occupied. Clear it before replaying.');return;}s.status='ready';s.arrived=false;s.step=0;s.pose={...BENCH_START35};s.checkpoint={...BENCH_START35};benchStart35();};
// Grounded benches block walking; carried benches are governed by the swept test above.
const blockedBefore35=blocked;
blocked=function(x,z,r,opts){const hit=blockedBefore35(x,z,r,opts);if(hit)return hit;const s=S&&S.bench35;
  if(!BENCH35.root||!s||s.status==='ready'||BENCH35.mode==='carry'||(opts?.lvl||0)!==0)return null;
  if(benchOverlap35(s.pose,{x1:x-r,x2:x+r,z1:z-r,z2:z+r}))return {x1:s.pose.x-.78,x2:s.pose.x+.78,z1:s.pose.z-.27,z2:s.pose.z+.27,tag:'bench35'};
  return null;
};
const nearestBefore35=nearest;
nearest=function(i){
  const s=S&&S.bench35,b=BENCH35;
  if(b.root&&s){
    if(b.mode==='seated')return {id:'benchStand35',label:'Get up from our bench',dist:0};
    if(benchActive35()){
      if(b.mode==='carry')return {id:'benchDrop35',label:'Set the bench down',dist:0};
      if(b.mode==='choose')return {id:'benchVote35',label:b.votes[i]?'Agreed — waiting for your partner':'Agree to this spot',dist:0};
      if(b.holders.includes(i))return {id:'benchGrab35',label:'Let go of this end',dist:0};
      const p=players[i].g.position,d=Math.min(...[0,1].map(k=>{const e=benchEnd35(s.pose,k);return Math.hypot(p.x-e[0],p.z-e[1]);}));
      if(d<1.25)return {id:'benchGrab35',label:'Take an end of the bench',dist:d};
    }else if(s.status==='placed'&&Math.hypot(players[i].g.position.x-s.pose.x,players[i].g.position.z-s.pose.z)<1.8)return {id:'benchSit35',label:'Sit on our bench together',dist:0};
  }return nearestBefore35(i);
};
ACT_HOOKS.unshift((i,kind)=>{
  if(kind==='benchGrab35')benchGrab35(i);
  else if(kind==='benchDrop35')benchDrop35();
  else if(kind==='benchVote35')benchVote35(i);
  else if(kind==='benchSit35')benchSit35(i);
  else if(kind==='benchStand35'){sitStop();BENCH35.mode='ground';save();}
  else return false;
  updateHUD();return true;
});
const enterBefore35=enterWorld;
enterWorld=function(){benchRemove35();enterBefore35();benchBuild35();};
const saveBefore35=save;
save=function(){
  // Seating roots live on the cushion; resume at the pre-sit standing points.
  if(BENCH35.mode!=='seated'||!SEATING30.active)return saveBefore35();
  const points=players.map(p=>p.g.position.clone());players.forEach((p,i)=>{if(SEATING30['p'+i])p.g.position.copy(SEATING30['p'+i].position);});
  try{return saveBefore35();}finally{players.forEach((p,i)=>p.g.position.copy(points[i]));}
};
const todayBefore35=todayHTML34;
todayHTML34=function(){const s=benchState35();return '<div class="bench-invite35"><div><p class="life-kicker">SOMETHING TO DO TOGETHER</p><b>A Bench for Evening Gist</b><p>'+ (s.status==='placed'?'A little place that you made together.':'One of you moves. One of you turns. A home improvement for two.')+'</p></div>'+btn(s.status==='placed'?'Our bench':'Try the bench delivery','bench35',{},'primary')+'</div>'+todayBefore35();};
const menuBefore35=openMenu;
openMenu=function(){menuBefore35();if(S&&S.phase==='play')panel.insertAdjacentHTML('afterbegin',btn('A Bench for Evening Gist','bench35',{},'primary block'));};
const hudBefore35=updateHUD;
updateHUD=function(){hudBefore35();if(benchActive35())both().forEach(i=>{document.getElementById('prole'+i).textContent=i===BENCH35.driver?'Bench · MOVE · your movement controls':'Bench · TURN · left / right';});};
const camerasBefore35=updateCameras;
updateCameras=function(dt){camerasBefore35(dt);if(!benchActive35()||!['carry','choose'].includes(BENCH35.mode))return;
  const s=benchState35(),target=BENCH35.mode==='choose'?BENCH_SPOTS35[s.choice]:s.pose;
  players.forEach((p,i)=>{const f=new THREE.Vector3((p.g.position.x+target.x)/2,.8,(p.g.position.z+target.z)/2);focus[i].lerp(f,Math.min(1,dt*7));const v=focus[i].clone().addScaledVector(CAM_DIR,innerHeight>innerWidth?12:11);camPosS[i].lerp(v,Math.min(1,dt*7));cams[i].position.copy(camPosS[i]);cams[i].lookAt(focus[i]);});
};
const clockBefore35=advanceClock33;
advanceClock33=function(h){if(benchActive35()||BENCH35.mode==='seated')return;clockBefore35(h);};
const benchHud35=document.createElement('div');benchHud35.id='bench-hud35';benchHud35.style.display='none';document.body.appendChild(benchHud35);
benchHud35.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(el)dispatch(el.dataset.act,{...el.dataset});});
let benchHudKey35='';
function benchRenderHud35(){
  const b=BENCH35,s=S&&S.bench35,show=s&&b.root&&!overlayOpen()&&((s.status==='delivery'&&!s.paused)||b.mode==='seated');
  benchHud35.style.display=show?'':'none';if(!show)return;
  if(LIFE34.waypoint)lifeGuideEl34.style.display='none';
  const key=[b.mode,s.step,s.choice,b.votes.join(),b.driver].join('|');if(key===benchHudKey35)return;benchHudKey35=key;
  if(b.mode==='choose')benchHud35.innerHTML='<b>Where shall it live?</b><div class="bench-pick35">'+btn('←','benchChoose35',{dir:-1},'quiet','Previous spot')+'<span>'+BENCH_SPOTS35[s.choice].name+'</span>'+btn('→','benchChoose35',{dir:1},'quiet','Next spot')+'</div><div class="bench-votes35">'+[0,1].map(i=>btn((b.votes[i]?'✓ ':'' )+esc(pname(i)||'Player '+(i+1))+' agrees','benchVote35',{i},b.votes[i]?'quiet':'primary')).join('')+'</div><small>Either player: left / right to choose. Each: Act to agree.</small>';
  else if(b.mode==='seated')benchHud35.innerHTML='<b>Our bench. Our evening.</b><small>Press Act to get up.</small>';
  else benchHud35.innerHTML='<b>Bench · '+BENCH_ROUTE35[s.step].name+'</b><small>'+BENCH_ROUTE35[s.step].hint+'</small>'+btn('Roles / reset','bench35',{},'quiet');
}
TICK_HOOKS.push(benchTick35);
// Losing focus must never keep either role moving.
window.addEventListener('blur',()=>{Object.keys(keys).forEach(k=>keys[k]=false);sticks.forEach(s=>s.v=[0,0]);BENCH35.move=[0,0];BENCH35.turn=0;act[0]=act[1]=false;});

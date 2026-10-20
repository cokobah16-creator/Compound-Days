/* Compound Days v30: body-bound starters, furniture-relative seating and creator controls. */
'use strict';

// v33a: presence iris fix, PRESENCE tuning and the mouthSurface30 makeHeroAvatar wrapper removed (presence-v25/sculpt-v29 retired with the authored v21 character).

// Tag the furniture actually rendered; seating uses its transform, including prop scale.
const v30BuildFurn=buildFurn;
buildFurn=function(type,w,h){const g=v30BuildFurn(type,w,h);g.userData.furnitureType=type;return g;};
function seatingFurniture(){
  if(!furnGroup) return null;
  return furnGroup.children.find(g=>g.userData.furnitureType==='sofa')||null;
}
function sofaSeatFrame(){
  const furniture=seatingFurniture();if(!furniture)return null;
  let asset=null;furniture.traverse(o=>{if(o.userData.instanceOf==='sofa_teal')asset=o;});
  const frame=asset||furniture;frame.updateWorldMatrix(true,false);
  return {frame,height:asset?.53:.66,depth:asset?.17:.12,spacing:asset?.33:.36};
}
function seatPoint(seat,x,y,z){return seat.frame.localToWorld(new THREE.Vector3(x,y,z));}

// Position a two-bone chain toward a target, retaining its actual segment lengths.
function seatAim(bone,next,target){
  const p=bone.getWorldPosition(new THREE.Vector3()), q=next.getWorldPosition(new THREE.Vector3());
  const from=q.sub(p).normalize(),to=target.clone().sub(p).normalize();
  if(!from.lengthSq()||!to.lengthSq())return;
  const delta=new THREE.Quaternion().setFromUnitVectors(from,to);
  const world=bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(delta);
  bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));
  bone.updateWorldMatrix(false,true);
}
function seatIK(root,mid,end,target,bend){
  if(!root||!mid||!end)return;
  const a=root.getWorldPosition(new THREE.Vector3()),b=mid.getWorldPosition(new THREE.Vector3()),c=end.getWorldPosition(new THREE.Vector3());
  const l1=a.distanceTo(b),l2=b.distanceTo(c),v=target.clone().sub(a),distance=v.length();
  if(!l1||!l2||distance<1e-6)return;
  v.normalize();const d=Math.min(l1+l2-.0001,Math.max(Math.abs(l1-l2)+.0001,distance));
  const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));
  const side=bend.clone().addScaledVector(v,-bend.dot(v));
  if(side.lengthSq()<1e-8)side.set(1,0,0).addScaledVector(v,-v.x);
  side.normalize();const knee=a.clone().addScaledVector(v,along).addScaledVector(side,height);
  seatAim(root,mid,knee);seatAim(mid,end,target);
}
function seatPose(g){
  const seat=g.userData.seat;if(!seat||!g.hero)return;
  const bones=g.hero.bones,scale=g.scale.y||1;
  g.updateWorldMatrix(true,true);
  const cushion=seatPoint(seat,seat.x,seat.height,seat.depth);
  const pelvis=bones.hips.getWorldPosition(new THREE.Vector3());
  // v33a: seat constants retuned for the authored v21 rig (Hips .86, Foot .10; was Hips .96, Foot .085): hips .105->.10 above the cushion.
  g.position.y+=cushion.y+.10*scale-pelvis.y;
  g.updateWorldMatrix(true,true);
  const rotation=seat.frame.getWorldQuaternion(new THREE.Quaternion());
  const forward=new THREE.Vector3(0,0,1).applyQuaternion(rotation);
  const sideways=new THREE.Vector3(1,0,0).applyQuaternion(rotation);
  const centre=seatPoint(seat,seat.x,0,seat.depth);
  for(const [side,sign] of [['left',1],['right',-1]]){
    const ankle=centre.clone().addScaledVector(sideways,sign*.10*scale).addScaledVector(forward,.35*scale); // v33a: was .097/.42
    ankle.y=seat.floorY+.10*scale; // v33a: was .085 (v21 Foot joint sits .10 above the sole)
    seatIK(bones[side+'upleg'],bones[side+'leg'],bones[side+'foot'],ankle,forward);
    const foot=bones[side+'foot'];
    foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(rotation));
    if(bones[side+'toebase'])bones[side+'toebase'].quaternion.identity();
    g.updateWorldMatrix(true,true);
    // Rest the palms over the thighs, with clearance above the cushion and front rail.
    const hand=cushion.clone().addScaledVector(sideways,sign*.17*scale).addScaledVector(forward,.22*scale); // v33a: was .26 (shorter v21 arms)
    hand.y+=.18*scale; // v33a: was .16
    const bend=sideways.clone().multiplyScalar(sign).addScaledVector(forward,-.5);
    seatIK(bones[side+'arm'],bones[side+'forearm'],bones[side+'hand'],hand,bend);
  }
  g.updateWorldMatrix(true,true);
}
const SEATING30={active:false};
// Replace the v29 fixed world-Z positioning; the full seat frame follows the furniture.
function sitStart(){
  if(SEATING30.active||!players.length)return;const seat=sofaSeatFrame();if(!seat)return;
  SEATING30.active=true;
  delete SEATING30.p0;delete SEATING30.p1;
  const rotation=seat.frame.getWorldQuaternion(new THREE.Quaternion());
  players.forEach((p,i)=>{if(!p?.g||(NET.on&&p.i!==NET.myIndex))return;const g=p.g;
    SEATING30['p'+i]={position:g.position.clone(),quaternion:g.quaternion.clone(),baseY:g.baseY,y:p.y};
    const x=(i===0?-1:1)*seat.spacing,root=seatPoint(seat,x,0,seat.depth);
    g.position.copy(root);g.quaternion.copy(rotation);g.baseY=root.y;
    g.userData.seat=Object.assign({},seat,{x,floorY:seatPoint(seat,0,0,0).y});
    g.sitting=true;p.moving=false;
  });
};
function sitStop(){
  if(!SEATING30.active)return;SEATING30.active=false;
  players.forEach((p,i)=>{if(!p?.g)return;const g=p.g,s=SEATING30['p'+i];g.sitting=false;delete g.userData.seat;
    if(s){g.position.copy(s.position);g.quaternion.copy(s.quaternion);g.baseY=s.baseY;p.y=s.y;}
    // Remove seated IK immediately so the first walking frame cannot inherit it.
    if(g.actions?.idle){Object.values(g.actions).forEach(a=>a.setEffectiveWeight(0));g.actions.idle.reset().setEffectiveWeight(1).play();g.current='idle';g.mixer.update(0);}
  });
};
const v30AnimAvatar=animAvatar;
animAvatar=function(g,t,moving,carrying,speed,dt){
  v30AnimAvatar(g,t,moving,carrying,speed,dt);
  if(g?.sitting)seatPose(g); // v33a: presenceUpdate call dropped (presence-v25 retired)
};
const v30IdleFace=idleFace;
idleFace=function(p,dt){if(!p.g.sitting)v30IdleFace(p,dt);};
const v30InputVec=inputVec;
inputVec=function(i){return players[i]?.g?.sitting?[0,0]:v30InputVec(i);};
const v30AiDrive=aiDrive;
aiDrive=function(p,dt){if(p.g.sitting){p.moving=false;p.t=(p.t||0)+dt;animAvatar(p.g,p.t,false,false,0,dt);return;}return v30AiDrive(p,dt);};
const v30Save=save;
save=function(){
  const restore=[];
  if(SEATING30.active)players.forEach((p,i)=>{const original=SEATING30['p'+i];if(p?.g?.sitting&&original){restore.push([p.g,p.g.position.clone()]);p.g.position.copy(original.position);}});
  try{return v30Save();}finally{for(const [g,position] of restore)g.position.copy(position);}
};

// Creator: a persistent, player-controlled view and one understandable category at a time.
const CREATOR30={tab:'body',yaw:-.30,zoom:'body',pose:'idle'};
// v33a: HAIR30_ORDER sort and the Face tab removed; the authored character has no base/build/face/beard/accessory options.
const CREATOR_SECTIONS=[['body','Body'],['hair','Hair'],['clothes','Clothes'],['story','About you']];
function creator30Section(field){
  const input=field.querySelector('[data-k]'),key=input?.dataset.k;
  if(key==='skin')return 'body';
  if(['hair','headwear'].includes(key))return 'hair';
  if(key==='outfit')return 'clothes';
  return 'story';
}
function creator30Apply(){
  const panel=document.getElementById('panel');if(!panel)return;
  panel.querySelectorAll('.creator30-tab').forEach(b=>{const active=b.dataset.v===CREATOR30.tab;b.classList.toggle('picked',active);b.setAttribute('aria-selected',String(active));});
  panel.querySelectorAll('.field').forEach(f=>{f.hidden=creator30Section(f)!==CREATOR30.tab;});
}
const v30MountPreview=mountPreview;
mountPreview=function(container,look){
  if(!container)return;
  const required=wardrobeNames(look),ready=HERO.state==='ready'&&required.every(n=>WARDROBE.cache[n]);
  const next=document.querySelector('#panel .sticky-act button');if(next)next.disabled=!ready;
  if(ready)return v30MountPreview(container,look);
  const failed=HERO.state==='failed'||required.some(n=>WARDROBE.failed[n]);
  container.innerHTML='<div class="creator30-loading" role="status">'+(failed?'This look could not load. Choose another style or reload to try again.':'Preparing your player…')+'</div>';
  if(!failed)setTimeout(()=>{if(document.body.contains(container))mountPreview(container,look);},200);
};
const v30RenderSetup=renderSetup;
renderSetup=function(){
  v30RenderSetup();const step=S?.setup?.step;if(step!=='p0'&&step!=='p1')return;
  const panel=document.getElementById('panel');if(!panel||panel.querySelector('.creator30-tabs'))return;
  const first=panel.querySelector('.field');if(!first)return;
  first.insertAdjacentHTML('beforebegin',`<div class="creator30-tabs" role="tablist" aria-label="Customize your player">${CREATOR_SECTIONS.map(([id,label])=>`<button class="creator30-tab" role="tab" data-act="creator30tab" data-v="${id}">${label}</button>`).join('')}</div>`);
  const preview=panel.querySelector('.preview3d')||document.getElementById(step==='p0'?'pv3d0':'pv3d1');
  if(preview)preview.insertAdjacentHTML('afterend',`<div class="creator30-view" aria-label="Character preview controls"><button data-act="creator30view" data-v="front">Front</button><button data-act="creator30view" data-v="side">Side</button><button data-act="creator30view" data-v="back">Back</button><button data-act="creator30view" data-v="face">Face</button><button data-act="creator30view" data-v="walk">Walk</button></div>`);
  creator30Apply();
};
ACTIONS.creator30tab=d=>{CREATOR30.tab=d.v;creator30Apply();};
ACTIONS.creator30view=d=>{
  CREATOR30.zoom=d.v==='face'?'face':'body';CREATOR30.pose=d.v==='walk'?'walk':'idle';
  CREATOR30.yaw=d.v==='back'?Math.PI:d.v==='side'?Math.PI/2:d.v==='walk'?-.35:0;
};
LOCAL_ONLY.add('creator30tab');LOCAL_ONLY.add('creator30view');
// Called inside the existing preview animation loop; no extra renderer or render loop.
function creator30Preview(now,dt){
  if(!prevChar)return;
  prevChar.rotation.y=CREATOR30.yaw;
  const scale=prevChar.scale.y||1;
  // v33a: face framing retuned to the authored v21 head (centre 1.645 m, skull about .35 m wide, hair up to about 1.95 m).
  if(CREATOR30.zoom==='face'){prevCam.position.set(0,1.68*scale,1.40);prevCam.lookAt(0,1.655*scale,0);}
  else{prevCam.position.set(0,1.34,4.3);prevCam.lookAt(0,.96,0);} // v33a: body view framed for the authored figure (hair top ~1.95 m, walk bob)
  animAvatar(prevChar,now/1000,CREATOR30.pose==='walk',false,CREATOR30.pose==='walk'?1:0,dt);
}

const v30OpenPanel=openPanel;
openPanel=function(html){const out=v30OpenPanel.apply(this,arguments);if(typeof html==='string'&&/<h2>The sofa<\/h2>/.test(html))sitStart();return out;};
const v30ClosePanel=closePanel;
closePanel=function(){sitStop();return v30ClosePanel.apply(this,arguments);};

/* Compound Days v30: body-bound starters, furniture-relative seating and creator controls. */
'use strict';

// Eye parts use two coordinate spaces in the supplied asset. Resolve both in Head space.
presSide=function(o){o.geometry.computeBoundingBox();return o.geometry.boundingBox.getCenter(new THREE.Vector3()).multiply(o.scale).add(o.position).x<0?0:1;};
const v30PresPaint=presPaint;
presPaint=function(mesh,entry,kind){
  if(kind!=='iris') return v30PresPaint(mesh,entry,kind);
  const original=presIrisColor, p=mesh.position;
  presIrisColor=function(x,y,z,out){original(x+p.x,y+p.y,z+p.z,out);};
  try{return v30PresPaint(mesh,entry,kind);}finally{presIrisColor=original;}
};
PRESENCE.skinRoughness=.70;PRESENCE.rim=.20;PRESENCE.rimU.value=.20;

// A closed, continuous mouth follows the actual morphed face surface.
// The inherited detached lip meshes intersected the base variants.
const MOUTH30=new Map();
function mouthSurface30(g){
  const head=g.hero?.bones.head,body=g.hero?.body;if(!head||!body)return;
  const key=g.userData.residentShape||'neutral';let geometry=MOUTH30.get(key);
  if(!geometry){
    const P=body.geometry.attributes.position,I=body.geometry.index.array,triangles=[];
    for(let k=0;k<I.length;k+=3){const ids=[I[k],I[k+1],I[k+2]];
      if(ids.some(i=>Math.abs(P.getX(i))<.045&&P.getY(i)>1.57&&P.getY(i)<1.62&&P.getZ(i)>.045))triangles.push(ids);
    }
    const surface=(x,y)=>{let z=.07;for(const ids of triangles){
      const [a,b,c]=ids,ax=P.getX(a),ay=P.getY(a),bx=P.getX(b),by=P.getY(b),cx=P.getX(c),cy=P.getY(c);
      const det=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(det)<1e-12)continue;
      const u=((by-cy)*(x-cx)+(cx-bx)*(y-cy))/det,v=((cy-ay)*(x-cx)+(ax-cx)*(y-cy))/det,w=1-u-v;
      if(u>=-1e-5&&v>=-1e-5&&w>=-1e-5)z=Math.max(z,u*P.getZ(a)+v*P.getZ(b)+w*P.getZ(c));
    }return z;};
    const pos=[],colors=[],idx=[],columns=48,width=key.includes('base_b')?.026:.024;
    const shades=[[1,1,1],[.77,.53,.49],[.43,.27,.25],[.43,.27,.25],[.90,.67,.60],[1,1,1]];
    for(let row=0;row<6;row++)for(let i=0;i<=columns;i++){
      const t=i/columns*2-1,x=t*width,fade=Math.max(0,1-t*t),line=1.594+.0014*t*t;
      const top=.0039*fade,bottom=.0051*fade;
      const offset=[top,top*.5,.00035*fade,-.00035*fade,-bottom*.55,-bottom][row];
      const y=line+offset,z=surface(x,y)+.00065;
      pos.push(x,y-SCULPT29.joints.Head[1],z-SCULPT29.joints.Head[2]);colors.push(...shades[row]);
    }
    for(let r=0;r<5;r++)for(let i=0;i<columns;i++){const a=r*(columns+1)+i,b=a+columns+1;idx.push(a,b,a+1,a+1,b,b+1);}
    geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(idx);geometry.computeVertexNormals();MOUTH30.set(key,geometry);
  }
  for(const o of head.children)if(o.name==='lip'||o.name==='lip_top')o.visible=false;
  const material=new THREE.MeshStandardMaterial({color:body.material.color.clone(),roughness:.66,metalness:0,vertexColors:true,side:THREE.DoubleSide,name:'lip_surface'});
  const mouth=new THREE.Mesh(geometry,material);mouth.name='mouth_surface';head.add(mouth);
}
const v30MakeHero=makeHeroAvatar;
makeHeroAvatar=function(look){const g=v30MakeHero(look);if(g)mouthSurface30(g);return g;};

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
  g.position.y+=cushion.y+.105*scale-pelvis.y;
  g.updateWorldMatrix(true,true);
  const rotation=seat.frame.getWorldQuaternion(new THREE.Quaternion());
  const forward=new THREE.Vector3(0,0,1).applyQuaternion(rotation);
  const sideways=new THREE.Vector3(1,0,0).applyQuaternion(rotation);
  const centre=seatPoint(seat,seat.x,0,seat.depth);
  for(const [side,sign] of [['left',1],['right',-1]]){
    const ankle=centre.clone().addScaledVector(sideways,sign*.097*scale).addScaledVector(forward,.42*scale);
    ankle.y=seat.floorY+.085*scale;
    seatIK(bones[side+'upleg'],bones[side+'leg'],bones[side+'foot'],ankle,forward);
    const foot=bones[side+'foot'];
    foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(rotation));
    if(bones[side+'toebase'])bones[side+'toebase'].quaternion.identity();
    g.updateWorldMatrix(true,true);
    // Rest the palms over the thighs, with clearance above the cushion and front rail.
    const hand=cushion.clone().addScaledVector(sideways,sign*.17*scale).addScaledVector(forward,.26*scale);
    hand.y+=.16*scale;
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
  if(g?.sitting){presenceUpdate(g,dt||.016,false);seatPose(g);}
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
const HAIR30_ORDER=['none','low','curls','braidbun'];
HAIRS.sort((a,b)=>{const ai=HAIR30_ORDER.indexOf(a.id),bi=HAIR30_ORDER.indexOf(b.id);return (ai<0?99:ai)-(bi<0?99:bi);});
const CREATOR_SECTIONS=[['body','Body'],['face','Face'],['hair','Hair'],['clothes','Clothes'],['story','About you']];
function creator30Section(field){
  const input=field.querySelector('[data-k]'),key=input?.dataset.k;
  if(['bodyBase','bodyBuild','skin'].includes(key))return 'body';
  if(['face','beard'].includes(key))return 'face';
  if(['hair','headwear'].includes(key))return 'hair';
  if(['outfit','acc','topColor'].includes(key))return 'clothes';
  const label=(field.querySelector('label')?.textContent||'').toLowerCase();
  if(/accessor/.test(label))return 'clothes';
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
  if(CREATOR30.zoom==='face'){prevCam.position.set(0,1.66*scale,.72);prevCam.lookAt(0,1.655*scale,0);}
  else{prevCam.position.set(0,1.26,3.9);prevCam.lookAt(0,.92,0);}
  animAvatar(prevChar,now/1000,CREATOR30.pose==='walk',false,CREATOR30.pose==='walk'?1:0,dt);
}

const v30OpenPanel=openPanel;
openPanel=function(html){const out=v30OpenPanel.apply(this,arguments);if(typeof html==='string'&&/<h2>The sofa<\/h2>/.test(html))sitStart();return out;};
const v30ClosePanel=closePanel;
closePanel=function(){sitStop();return v30ClosePanel.apply(this,arguments);};

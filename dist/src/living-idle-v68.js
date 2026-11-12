/* Compound Days V68 — Player 1 living idle, layered after V67.
   Production constraint: the V61 GLB has 27 joints and NO individual finger
   joints or face morph targets. V68 animates only existing spine/head/wrist
   joints. It does NOT claim to fix fingers, lips, eyelids, hair or garments.

   No new assets, material changes, animation edits, draw calls or save fields.
   ?life=off disables the effect for an A/B visual check.
*/
'use strict';

const LIFE68={
 enabled:!/(?:^|[?&])life=off(?:&|$)/.test((typeof location==='object'&&location.search)||''),
 breathingPeriod:4.6,
 fadeSeconds:0.46,
 spineBreath:0.014,   // radians, <1 degree
 headYaw:0.015,
 headNod:0.010,
 wristRelax:0.044,   // 2.5 degrees; no separate finger animation
 wristDrift:0.010
};

function life68ActionActive(g){
 if(!g||!g.actions)return false;
 return ['pick','wave'].some(key=>{
  const a=g.actions[key];
  return !!(a&&typeof a.isRunning==='function'&&a.isRunning()&&
   typeof a.getEffectiveWeight==='function'&&a.getEffectiveWeight()>0.1);
 });
}
function life68Eligible(g){
 return !!(LIFE68.enabled&&g&&g.hero&&g.hero.v61&&g.userData&&g.userData.hero61&&
  g.current==='idle'&&!life68ActionActive(g)&&g.hero.bones&&
  g.hero.bones.spine2&&g.hero.bones.head&&g.hero.bones.lefthand&&g.hero.bones.righthand);
}

// Rotate by a BODY-SPACE axis, translated into the target bone's parent space.
// That avoids assuming Meshy's local bone axes match Efe/V55 and remains
// orientation-invariant when the player turns in the compound.
function life68Rotate(g,bone,figureAxis,radians){
 if(!bone||!bone.parent||!Number.isFinite(radians)||Math.abs(radians)<1e-7)return;
 const worldAxis=figureAxis.clone().applyQuaternion(g.getWorldQuaternion(new THREE.Quaternion()));
 const parentWorld=bone.parent.getWorldQuaternion(new THREE.Quaternion());
 const parentAxis=worldAxis.applyQuaternion(parentWorld.invert()).normalize();
 bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(parentAxis,radians));
 bone.updateMatrixWorld(true);
}
// Some imported Idle clips omit rotation tracks on individual bones. If we
// simply add offsets every frame, they accumulate into extreme poses. Always
// restore the previous frame's original local quaternions BEFORE AnimationMixer
// and V67 process the next frame; then capture fresh originals for this frame.
function life68Restore(g){
 const st=g&&g.userData&&g.userData.life68;
 if(!st||!st.base||!g.hero||!g.hero.bones)return false;
 for(const key of Object.keys(st.base)){
  const bone=g.hero.bones[key],q=st.base[key];
  if(bone&&q)bone.quaternion.fromArray(q);
 }
 st.base=null;st.applied=false;
 g.updateMatrixWorld(true);
 return true;
}
function life68Apply(g,dt){
 // Also safe if the function is invoked directly by a review tool.
 life68Restore(g);
 if(!life68Eligible(g)){
  if(g&&g.userData&&g.userData.life68)g.userData.life68.fade=0;
  return false;
 }
 const b=g.hero.bones;
 let st=g.userData.life68;
 if(!st){st={phase:0,fade:0,applied:false};g.userData.life68=st;}
 const d=Math.max(0,Math.min(.06,Number.isFinite(dt)?dt:1/60));
 st.phase=(st.phase+d*2*Math.PI/LIFE68.breathingPeriod)%(2*Math.PI);
 st.fade=Math.min(1,st.fade+d/LIFE68.fadeSeconds);
 const soft=st.fade*st.fade*(3-2*st.fade);
 const breathing=Math.sin(st.phase), glance=Math.sin(st.phase*.51), glance2=Math.sin(st.phase*.78+.45);
 g.updateMatrixWorld(true);
 st.base={
  spine2:b.spine2.quaternion.toArray(),
  head:b.head.quaternion.toArray(),
  lefthand:b.lefthand.quaternion.toArray(),
  righthand:b.righthand.quaternion.toArray()
 };
 life68Rotate(g,b.spine2,new THREE.Vector3(1,0,0),LIFE68.spineBreath*breathing*soft);
 life68Rotate(g,b.head,new THREE.Vector3(0,1,0),LIFE68.headYaw*glance*soft);
 life68Rotate(g,b.head,new THREE.Vector3(1,0,0),LIFE68.headNod*glance2*soft);
 // A subtle opposing wrist turn prevents hands looking perfectly mirrored.
 // The V61 hand mesh is weighted to the Hand joint, with no poseable fingers.
 life68Rotate(g,b.lefthand,new THREE.Vector3(0,0,1),
  (LIFE68.wristRelax+LIFE68.wristDrift*Math.sin(st.phase*.83+.35))*soft);
 life68Rotate(g,b.righthand,new THREE.Vector3(0,0,1),
  (-LIFE68.wristRelax+LIFE68.wristDrift*Math.sin(st.phase*.83+1.5))*soft);
 st.applied=true;
 return true;
}

// V67 should not relax a character partway through Pick, since PlayPick
// does not change g.current away from 'idle'. This wraps V67's existing
// special-action check without editing the V67 release asset itself.
if(typeof pose67WavePlaying==='function'){
 const life68OldSpecial=pose67WavePlaying;
 pose67WavePlaying=function(g){return life68OldSpecial(g)||life68ActionActive(g);};
}
if(typeof animAvatar==='function'){
 const life68OriginalAnim=animAvatar;
 animAvatar=function(g,t,moving,carrying,speed,dt){
  try{life68Restore(g);}catch(e){}
  const result=life68OriginalAnim.apply(this,arguments);
  try{
   if(moving||carrying) {
    if(g&&g.userData&&g.userData.life68)g.userData.life68.fade=0;
   }else life68Apply(g,dt);
  }catch(e){
   if(!LIFE68.warned){LIFE68.warned=true;console.warn('[Compound Days] living idle skipped:',e&&e.message);}
  }
  return result;
 };
}

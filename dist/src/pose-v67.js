/* Compound Days V67 — relaxed Player 1 idle (review candidate).

   The imported V61 animation's neutral pose holds its arms out too far.
   This small procedural correction runs AFTER the existing animation mixer,
   lowering only the V61 upper arms and softening the elbows when the figure
   stands idle. No imported clip, skin, vertex, bind pose or wardrobe is edited.
   Walking, carrying, picking, waving, V55, Player 2 and NPCs are unchanged.

   Debug: ?pose=classic disables the correction on this page; ?pose=v67
   forces it. The switch is for human screenshot comparisons, not saved data. */
'use strict';

const POSE67={
 enabled:!/(?:^|[?&])pose=classic(?:&|$)/.test((typeof location==='object'&&location.search)||''),
 timeToRelax:0.30, // seconds of idle before near-full relaxed angle
 upperX:0.19,      // outward spread, body-local (0 is straight down)
 upperZ:0.075,     // very slight forward bias
 lowerX:0.10,
 lowerZ:0.16
};

function pose67IsLive(g){
 return !!(POSE67.enabled&&g&&g.hero&&g.hero.v61&&g.userData&&g.userData.hero61&&
   g.current==='idle'&&g.hero.bones&&g.hero.bones.leftarm&&g.hero.bones.rightarm&&
   g.hero.bones.leftforearm&&g.hero.bones.rightforearm);
}

function pose67WavePlaying(g){
 const a=g&&g.actions&&g.actions.wave;
 return !!(a&&a.isRunning&&a.isRunning()&&a.getEffectiveWeight&&a.getEffectiveWeight()>0.1);
}

// Turn the current limb direction toward a relaxed, largely downward direction
// without assuming any local bone axis orientation. The target direction is
// expressed in figure space so a yawed/rotated Player 1 remains symmetric.
function pose67Aim(g,bone,child,localDirection,weight){
 if(!bone||!child||!bone.parent||weight<=0)return;
 const a=bone.getWorldPosition(new THREE.Vector3());
 const b=child.getWorldPosition(new THREE.Vector3());
 const current=b.sub(a);
 if(current.lengthSq()<1e-8)return;
 const rootQ=g.getWorldQuaternion(new THREE.Quaternion());
 const desired=localDirection.clone().normalize().applyQuaternion(rootQ);
 const worldBase=bone.getWorldQuaternion(new THREE.Quaternion());
 const shift=new THREE.Quaternion().setFromUnitVectors(current.normalize(),desired);
 const worldGoal=shift.multiply(worldBase);
 const parentQ=bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
 const localGoal=parentQ.multiply(worldGoal);
 bone.quaternion.slerp(localGoal,Math.max(0,Math.min(1,weight)));
 bone.updateMatrixWorld(true);
}

function pose67Apply(g,dt){
 if(!pose67IsLive(g)||pose67WavePlaying(g)){
  if(g&&g.userData&&g.userData.pose67)g.userData.pose67.weight=0;
  return false;
 }
 let st=g.userData.pose67;
 if(!st){st={weight:0};g.userData.pose67=st;}
 // AnimationMixer puts original clip on the joints before each call. This
 // smoothing acts on the newly evaluated pose, not on last frame's adjusted pose.
 const delta=Math.max(0,Math.min(0.08,Number(dt)||0.016));
 st.weight=Math.min(1,st.weight+delta/POSE67.timeToRelax);
 const bones=g.hero.bones,torso=bones.spine2||bones.spine1||bones.spine;
 if(!torso)return false;
 g.updateMatrixWorld(true);
 const centre=g.worldToLocal(torso.getWorldPosition(new THREE.Vector3()));
 const sides=[];
 for(const key of ['left','right']){
  const upper=bones[key+'arm'],lower=bones[key+'forearm'],hand=bones[key+'hand'];
  if(!upper||!lower||!hand)continue;
  const local=g.worldToLocal(upper.getWorldPosition(new THREE.Vector3()));
  const sign=Math.sign(local.x-centre.x)|| (key==='left'?1:-1);
  pose67Aim(g,upper,lower,new THREE.Vector3(sign*POSE67.upperX,-1,POSE67.upperZ),st.weight);
  pose67Aim(g,lower,hand,new THREE.Vector3(sign*POSE67.lowerX,-1,POSE67.lowerZ),st.weight*0.75);
  sides.push(key);
 }
 st.applied=sides.length===2;
 return st.applied;
}

// Compatibility: wrapping the existing animAvatar leaves the V61 mixer
// responsible for timing, crossfades, root motion and carry/pick clips.
if(typeof animAvatar==='function'){
 const pose67OldAnimate=animAvatar;
 animAvatar=function(g,t,moving,carrying,speed,dt){
  const result=pose67OldAnimate.apply(this,arguments);
  try{
   if(moving||carrying){if(g&&g.userData&&g.userData.pose67)g.userData.pose67.weight=0;}
   else pose67Apply(g,dt);
  }catch(e){
   if(!POSE67.warned){POSE67.warned=true;console.warn('[Compound Days] V67 relaxed pose skipped:',e&&e.message);}
  }
  return result;
 };
}

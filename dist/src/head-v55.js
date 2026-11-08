/* v55 "Character rebuild": the anatomical head (tools/hero_head.py, MakeHuman CC0 anatomy) in the game.

   The hero asset now carries the head as its own skinned mesh, HeadSkin, beside the five Body primitives, with the
   lashes and the two beard shells as skinned meshes too. All of them share four shape keys: masc, old, smile, blink.
   heroLambert (index.html) rebuilds every material without vertex colours or morph targets, so this pass turns them
   back on where the geometry has them: HeadSkin's COLOR_0 holds the painted lips, lash line, brows and nostrils as
   multipliers of the skin colour, so any skin swatch keeps them.

   It also sets each character's head shape from the look (look.face55 = {masc, old}, or the cast table below), blinks
   every few seconds, smiles a little more while waving, and frames the creator's face view for the new, smaller head.
   The head is sized by its geometry: the Head joint keeps scale 1 (faces-v53's 0.9 is retired). */
'use strict';
const HEAD55={
 // the neighbours' head shapes (MakeHuman macro differences): masc 1 = African male young, old 1 = African female old
 CAST:{tunde:{masc:1},bassey:{masc:1,old:0.8},nkechi:{old:0.35},oyelaran:{old:0.15},ada:{}},
 MALLAM:{masc:1,old:0.25}, BISI:{old:0.2},
 blinkEvery:[2.6,5.2], blinkLen:0.16,
 faceCam:{y:1.64,z:1.06,lookY:1.615}
};
for(const k in HEAD55.CAST){ if(typeof CAST!=='undefined'&&CAST[k]&&CAST[k].look) CAST[k].look.face55=HEAD55.CAST[k]; }
if(typeof MALLAM40!=='undefined'&&MALLAM40&&MALLAM40.LOOK) MALLAM40.LOOK.face55=HEAD55.MALLAM;
if(typeof BISI39!=='undefined'&&BISI39&&BISI39.LOOK) BISI39.LOOK.face55=HEAD55.BISI;
if(typeof FACES53!=='undefined') FACES53.headScale=1;

function head55Meshes(g){ const out=[]; g.traverse(o=>{ if(o.isMesh&&o.morphTargetDictionary&&o.geometry.morphAttributes&&o.geometry.morphAttributes.position) out.push(o); }); return out; }
function head55Set(g,name,w){ for(const o of (g.hero&&g.hero.morph55)||[]){ const i=o.morphTargetDictionary[name]; if(i!==undefined) o.morphTargetInfluences[i]=w; } }
function head55Apply(g,look){
 if(!g||!g.hero) return g; const ms=head55Meshes(g); g.hero.morph55=ms;
 for(const o of ms){ const mats=Array.isArray(o.material)?o.material:[o.material];
  for(const m of mats){ if(!m) continue; m.morphTargets=true; if(o.geometry.attributes.color) m.vertexColors=true; m.needsUpdate=true; } }
 if(g.hero.bones&&g.hero.bones.head) g.hero.bones.head.scale.setScalar(1);
 const f=(look&&look.face55)||{}; head55Set(g,'masc',+f.masc||0); head55Set(g,'old',+f.old||0); head55Set(g,'smile',0); head55Set(g,'blink',0);
 g.hero.face55={masc:+f.masc||0,old:+f.old||0,next:HEAD55.blinkEvery[0]+Math.random()*(HEAD55.blinkEvery[1]-HEAD55.blinkEvery[0]),t:0};
 return g;
}
if(typeof makeHeroAvatar==='function'){ const head55Make=makeHeroAvatar;
 makeHeroAvatar=function(look){ const g=head55Make.apply(this,arguments); try{ head55Apply(g,look); }catch(e){ console.warn('[Compound Days] head pass skipped:',e&&e.message); } return g; }; }

// blink and the wave smile, inside the existing per-avatar animation call
function head55Tick(g,dt){ const F=g&&g.hero&&g.hero.face55; if(!F||!g.hero.morph55||!g.hero.morph55.length) return;
 F.t+=Math.min(dt||0.016,0.1); let b=0;
 if(F.t>F.next){ const k=(F.t-F.next)/HEAD55.blinkLen; b=k<1?Math.sin(Math.PI*k):0; if(k>=1){ F.t=0; F.next=HEAD55.blinkEvery[0]+Math.random()*(HEAD55.blinkEvery[1]-HEAD55.blinkEvery[0]); } }
 head55Set(g,'blink',b);
 const waving=g.current==='wave';
 F.smile=(F.smile||0)+((waving?0.8:0)-(F.smile||0))*Math.min(1,(dt||0.016)*6); head55Set(g,'smile',F.smile);
}
if(typeof animAvatar==='function'){ const head55Anim=animAvatar;
 animAvatar=function(g,t,moving,carrying,speed,dt){ const r=head55Anim.apply(this,arguments); try{ head55Tick(g,dt); }catch(e){} return r; }; }

// the creator's face view: the new head is about two thirds of the old one, so the camera comes closer
if(typeof creator30Preview==='function'){ const head55Preview=creator30Preview;
 creator30Preview=function(now,dt){ const r=head55Preview.apply(this,arguments);
  if(typeof CREATOR30!=='undefined'&&CREATOR30.zoom==='face'&&typeof prevCam!=='undefined'&&prevCam&&prevChar){ const s=prevChar.scale.y||1; const C=HEAD55.faceCam;
   prevCam.position.set(0,C.y*s,C.z); prevCam.lookAt(0,C.lookY*s,0); }
  return r; }; }

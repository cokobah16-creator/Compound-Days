/* v53 "Neighbourhood Faces": the owner's Blender face sheet (six NPC concepts) brought onto the hero rig.

   tools/faces_from_blender.py rebuilds the face of assets/characters/efe.gltf.json with Blender's Python module:
   the shared head is resculpted to adult proportions (a flatter face plane, cheekbones, brow ridge, a jaw and chin,
   a thicker neck), the eyes are set into the face with almond lids and lashes, the brows are strands, the lips are
   full and shaped to the face, and two textured shells (stubble, a short boxed beard) plus a second hoop ride on the
   Head joint. The node and material names the game already reads (eye_white, iris, lip_top, lip, face_brow, skin)
   are unchanged, so the colour passes keep working.

   This file picks a face for each character: the six concepts on the sheet go to the neighbours they describe, and
   anyone else (the players, walkers, sellers) gets the plain face. A face is: which beard shell shows and its colour,
   whether both hoops or the single stud-hoop show, the brow colour and, for the elder, grey hair.

   The head bone is drawn at FACES53.headScale so the adult face sits on adult proportions; the hair, headwear and
   everything else on the Head joint scale with it. Nothing is saved: the face follows the look. */
'use strict';
const FACES53={
 headScale:0.9,
 // the sheet's six concepts
 FACES:{
  plain:{hoops:'one'},
  auntie:{hoops:'both'},                                   // Market auntie
  suya:{beard:'boxed',beardC:'#17110D',hoops:'none'},      // Suya vendor
  locs:{beard:'stubble',beardC:'#1A130F',hoops:'none'},    // Neighbour . Locs
  artisan:{hoops:'both'},                                  // Local artisan
  elder:{beard:'stubble',beardC:'#9C968D',brow:'#5E574F',hair:'#8E8981',hoops:'none'}, // Compound elder
  linen:{hoops:'both'}                                     // Neighbour . Linen
 },
 // who wears which face, and the hairstyle the sheet gives them
 CAST:{nkechi:{face:'auntie'},tunde:{face:'locs',hair:'locs'},ada:{face:'artisan',hair:'afro'},bassey:{face:'elder'},oyelaran:{face:'linen',hair:'braids'}},
 LIP_TOP:[0.70,0.50,0.47],LIP:[0.84,0.60,0.56]
};
// the neighbours' looks carry their face id; Bisi (market) and Mallam (suya) are the two sellers on the sheet
for(const k in FACES53.CAST){ if(typeof CAST!=='undefined'&&CAST[k]){ const c=FACES53.CAST[k]; CAST[k].look.face53=c.face; if(c.hair) CAST[k].look.hair=c.hair; } }
if(typeof BISI39!=='undefined'&&BISI39&&BISI39.LOOK) BISI39.LOOK.face53='auntie';
if(typeof MALLAM40!=='undefined'&&MALLAM40&&MALLAM40.LOOK) MALLAM40.LOOK.face53='suya';

function faces53Of(look){ return FACES53.FACES[look&&look.face53]||FACES53.FACES.plain; }
function faces53Apply(g,look){
 if(!g||!g.hero) return g; const f=faces53Of(look), head=g.hero.bones&&g.hero.bones.head;
 if(head) head.scale.setScalar(FACES53.headScale);
 let skinC=null; g.traverse(o=>{ if(!skinC&&o.isSkinnedMesh&&o.material&&o.material.name==='skin') skinC=o.material.color.clone(); });
 g.traverse(o=>{ if(!o.isMesh) return; const n=o.name||'', mats=Array.isArray(o.material)?o.material:[o.material];
  if(/^face_beard_/.test(n)){ o.visible=!!f.beard&&n==='face_beard_'+f.beard; if(o.visible&&f.beardC) mats.forEach(m=>m.color.set(f.beardC)); o.castShadow=false; }
  else if(n==='earring') o.visible=f.hoops!=='none';
  else if(n==='face_hoop') o.visible=f.hoops==='both';
  for(const m of mats){ if(!m) continue;
   if(skinC&&(m.name==='lip_top'||m.name==='lip')){ const k=m.name==='lip'?FACES53.LIP:FACES53.LIP_TOP; m.color.copy(skinC).multiply(new THREE.Color(k[0],k[1],k[2])); }
   if(f.brow&&/^face_brow/.test(n)&&/^hair/.test(m.name)) m.color.set(f.brow);
   if(f.hair&&/^wearhair_/.test(n)&&/^hair/.test(m.name)) m.color.set(f.hair); } });
 return g;
}
if(typeof makeHeroAvatar==='function'){ const faces53Make=makeHeroAvatar;
 makeHeroAvatar=function(look){ const g=faces53Make.apply(this,arguments); try{ faces53Apply(g,look); }catch(e){ console.warn('[Compound Days] face pass skipped:',e&&e.message); } return g; }; }

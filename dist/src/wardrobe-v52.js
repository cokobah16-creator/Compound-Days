/* v52 "Wardrobe": the owner's twelve modelled outfits (Compound_Days_Wardrobe.blend) on the players.

   The .blend holds twelve outfit scenes, each a posed character in an outfit with its own footwear and jewellery.
   tools/wardrobe_from_blend.py fits them onto the hero skeleton and writes them to assets/wardrobe/cd_<id>.gltf.json
   (the clothes), cd_<id>_jewellery (earrings, chains, watches, bags) and cd_shoes_<style> (seven footwear styles).

   The six everyday outfits the creator already offered (tee, office, ankara, track, kaftan, lounge) now wear the
   modelled versions, and six new ones join the creator: Ankara skirt set, Denim overalls, Evening jumpsuit, Linen
   co-ord, Utility layers and Wrap dress. The neighbours who wear those outfits get them too.

   The modelled outfits keep the colours they were made in. Under the clothes the base body's own top and bottom stay
   on, turned to the wearer's skin (the asset's extras.skinUnder), so short sleeves, shorts and skirts show arms and
   legs. Open shoes (sandals, slides, heels) carry a skin-coloured foot.

   Saves: an outfit id is the only thing stored, as before. Random looks (randLook) keep choosing from the original
   six, so nothing that draws a random look changes. */
'use strict';
const WARD52={
 // the creator's six new outfits; c and c2 colour the built-in avatar and the base body until the model arrives
 NEW:[{id:'skirtset',name:'Ankara skirt set',c:'#1F2F5C',c2:'#1F2F5C'},{id:'overalls',name:'Denim overalls',c:'#F1E4CC',c2:'#3F6E9A'},
  {id:'jumpsuit',name:'Evening jumpsuit',c:'#6E1E2C',c2:'#6E1E2C'},{id:'linen',name:'Linen co-ord',c:'#6F8A4A',c2:'#6F8A4A'},
  {id:'utility',name:'Utility layers',c:'#4A5A2E',c2:'#C9A878'},{id:'wrapdress',name:'Wrap dress',c:'#B4481F',c2:'#B4481F'}],
 SETS:{tee:['cd_tee','cd_shoes_sneakers'],office:['cd_office','cd_office_jewellery','cd_shoes_loafers'],ankara:['cd_ankara','cd_shoes_sandals'],
  track:['cd_track','cd_shoes_runners'],kaftan:['cd_kaftan','cd_kaftan_jewellery','cd_shoes_sandals'],lounge:['cd_lounge','cd_shoes_slides'],
  skirtset:['cd_skirtset','cd_skirtset_jewellery','cd_shoes_maryjanes'],overalls:['cd_overalls','cd_shoes_sneakers'],
  jumpsuit:['cd_jumpsuit','cd_jumpsuit_jewellery','cd_shoes_heels'],linen:['cd_linen','cd_linen_jewellery','cd_shoes_sandals'],
  utility:['cd_utility','cd_shoes_sneakers'],wrapdress:['cd_wrapdress','cd_wrapdress_jewellery','cd_shoes_heels']},
 ORIGINAL:OUTFITS.map(o=>o.id)
};
WARD52.NEW.forEach(o=>{ if(!OUTFITS.some(x=>x.id===o.id)) OUTFITS.push(o); });
Object.assign(WARDROBE.outfits,WARD52.SETS);
Object.assign(OUTFIT_VAR,Object.fromEntries(WARD52.NEW.map(o=>[o.id,[o.c,o.c]])));

// random looks keep the original six (same draws, same results as v51)
{ const six=OUTFITS.filter(o=>WARD52.ORIGINAL.includes(o.id)); randLook=function(){ return {skin:rnd(SKINS),hair:rnd(HAIRS).id,outfit:rnd(six).id,oc:rnd(['#2E4A8F','#B5512C','#2F6B4F','#E3A72F','#8A7F9E','#F4F1EA','#3B5BA9'])}; }; }

// the skin under the clothes is drawn a little inside the body (in the vertex shader, before skinning), so cloth that was
// decimated to big triangles never shows it through at the shoulders and hips
function ward52Inset(m){ m.onBeforeCompile=sh=>{ sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n\ttransformed -= normalize( objectNormal ) * 0.014;'); }; m.customProgramCacheKey=()=>'ward52inset'; m.polygonOffset=true; m.polygonOffsetFactor=1; m.polygonOffsetUnits=1; }
// base slots named in an equipped piece's extras.skinUnder turn to the wearer's skin (named 'skin', so the v21 skin
// calibration in makeHeroAvatar applies to them as it does to the body)
function ward52SkinUnder(g,report,skin){
 const slots=new Set(); (report&&report.garments||[]).forEach(n=>{ const src=WARDROBE.cache[n]; if(src) (wardrobeExtras(src).skinUnder||[]).forEach(s=>slots.add(s)); });
 if(!slots.size) return 0; let n=0;
 g.traverse(o=>{ if(!o.isSkinnedMesh||/^wear_/.test(o.name)) return; const one=!Array.isArray(o.material); const mats=one?[o.material]:o.material;
  if(!mats.some(m=>m&&slots.has(m.name))) return;
  const out=mats.map(m=>{ if(!m||!slots.has(m.name)) return m; const k=m.clone(); k.name='skin'; k.map=null; k.color.set(skin); ward52Inset(k); k.needsUpdate=true; n++; return k; });
  o.material=one?out[0]:out; });
 return n; }
const ward52Equip=wardrobeEquip;
// modelled cloth is drawn from both sides, so a gap the fitting opened (at a shoulder) shows the cloth's inside, not the skin
function ward52TwoSided(g){ g.traverse(o=>{ if(o.isMesh&&/^wear_cd_/.test(o.name)&&!/^wear_cd_shoes/.test(o.name)) (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{ if(m) m.side=THREE.DoubleSide; }); }); }
wardrobeEquip=function(g,look,fit,skin,hairC){ const r=ward52Equip.apply(this,arguments); ward52SkinUnder(g,r,skin); ward52TwoSided(g); return r; };

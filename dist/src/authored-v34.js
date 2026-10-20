/* Compound Days v33a: save and network migration for the authored character.
   Loaded right after visual-v21.js. The retired generated-body line (v26-v32) stored outfit ids
   starter/tankset/basics/everydayefe/everydaytunde and hair ids none/curls/braidbun/braidsup that
   have no garment lists or assets on the authored v21 wardrobe, so they are mapped onto v21 ids.
   office/track/lounge stay as they are: they are painted body slots in the base game. */
'use strict';

const AUTHORED34={
  outfits:{starter:'tee',tankset:'tee',basics:'tee',everydayefe:'tee',everydaytunde:'ankara'},
  hair:{none:'low',curls:'twists',braidbun:'braids',braidsup:'braids'}
};

// Map one player record or look object in place. Returns true when an id was changed.
// Fields of the retired creator (bodyBase, bodyBuild, face, beard, acc, shape, graphic, colors)
// are left alone: nothing reads them any more and old saves may still carry them.
function migrateLook34(p){
  if(!p||typeof p!=='object')return false;
  let changed=false;
  const outfit=AUTHORED34.outfits[p.outfit];if(outfit){p.outfit=outfit;changed=true;}
  const hair=AUTHORED34.hair[p.hair];if(hair){p.hair=hair;changed=true;}
  return changed;
}
// Map every record of a player list (S.p or a loaded save's p). Returns how many records changed.
function migrateLooks34(records){
  let n=0;if(Array.isArray(records))for(const p of records)if(migrateLook34(p))n++;return n;
}

// New games: the defaults are v21-valid already; this keeps them valid if a later module edits them.
const newState34=newState;
newState=function(){const s=newState34();if(s&&s.p)migrateLooks34(s.p);return s;};

// Loaded saves: ACTIONS.continue swaps in the stored state and enters the world (avatars are built
// through lookFor, which is wrapped below), so the stored records are migrated once it has run and
// the next save() persists the v21 ids.
const continue34=ACTIONS.continue;
ACTIONS.continue=function(d){const out=continue34.apply(this,arguments);if(S&&S.p)migrateLooks34(S.p);return out;};

// Network looks: a peer on the retired line may still send legacy ids; map them before they are
// written into S.p[i].
const setchar34=ACTIONS.setchar;
ACTIONS.setchar=function(d){
  const q=Object.assign({},(d&&d.p)||{});migrateLook34(q);
  return setchar34.call(this,Object.assign({},d,{p:q}));
};

// Defensive: every avatar, thumbnail and preview is built from lookFor(i), which returns a fresh
// copy of the record, so mapping that copy covers any path that reads a record before migration.
const lookFor34=lookFor;
lookFor=function(i){const look=lookFor34(i);migrateLook34(look);return look;};

// Co-op: the household document that applyState swaps in (join, resume, snapshot) can still carry
// the retired ids when the host last ran v30-v33; map them before S is replaced so that direct readers
// of S.p (renderSetup, renderLobby, photoSVG, writeState) see v21 ids as well as the avatars.
const applyState34=applyState;
applyState=function(d){if(d&&d.p)migrateLooks34(d.p);return applyState34.apply(this,arguments);};

// The hero file changed under the same path as the v33 line; the wardrobe is already fetched with a
// revision query (visual-v21 wardrobeLoad), so the hero gets the same one. HERO.url is read
// synchronously by heroLoad and restored afterwards, so the Menu still names the plain path.
const heroLoad34=heroLoad;
heroLoad=function(){
  authored34Install();
  const url=HERO.url;HERO.url=url+'?v='+BUILD_ID;
  try{return heroLoad34.apply(this,arguments);}finally{HERO.url=url;}
};

/* Calibration for the authored body under color-v28 + environment-v31.
   This wrapper is the single skin calibration step for the authored character: visual-v21's partial
   linearisation is overwritten by color-v28's m.color.set(skin), and the v29 body's baked vertex
   ambient occlusion (which darkened skin implicitly) is gone, so the plain skin material under the
   .88 exposure and the studio lights read far lighter than the chosen swatch. skinShade multiplies
   the linear 'skin' and 'skin_dark' colours (body and sandal feet) once per material; it was chosen by
   measuring the creator Face view (SKINS[4]) and the world close-up against the v21 captures
   (see check/results-authored.json and the v33a report). hairColour is set through the managed sRGB path
   (visual-v21's raw setRGB(.024,.020,.016) was tuned for the unmanaged path and reads charcoal). */
AUTHORED34.skinShade=0.78;
AUTHORED34.hairColour='#17110C';
function authored34Skin(g){
  const k=AUTHORED34.skinShade;if(!g||!(k>0)||k===1)return;
  g.traverse(o=>{if(!o.isMesh)return;
    for(const m of (Array.isArray(o.material)?o.material:[o.material])){
      if(!m||(m.name!=='skin'&&m.name!=='skin_dark')||m.userData.authored34Skin)continue;
      m.userData.authored34Skin=true;m.color.multiplyScalar(k);
    }
  });
}
function authored34Hair(g){
  const c=AUTHORED34.hairColour;if(!g||!c)return;
  g.traverse(o=>{if(o.isMesh&&/^wearhair_/.test(o.name)&&o.material&&/^hair/.test(o.material.name)){
    o.material.color.set(c);o.material.roughness=.88;
  }});
}
// Installed when boot() calls heroLoad, and by check/runtime-harness.cjs once it marks the hero ready, after every later module has wrapped
// makeHeroAvatar/wardrobeEquip, so these run last: after color-v28's skin recolour and after
// visual-v21's hair pass. Idempotent.
function authored34Install(){
  if(AUTHORED34.installed)return;AUTHORED34.installed=true;
  const makeHero=makeHeroAvatar;
  makeHeroAvatar=function(look){const g=makeHero.apply(this,arguments);if(g)authored34Skin(g);return g;};
  const equip=wardrobeEquip;
  wardrobeEquip=function(g,look,fit,skin,hairC){const out=equip.apply(this,arguments);authored34Hair(g);return out;};
}

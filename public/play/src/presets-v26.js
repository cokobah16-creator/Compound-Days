/* Compound Days v27: independent player customization on the shared rig.
   A preset is a saved combination of fields on the player record (skin, hair, outfit, face shape, beard, accessories,
   garment colours). The creator shows the presets as thumbnails rendered from the real game models; every field stays
   individually editable afterwards and everything lives in the existing save (S.p[i]), so a reload restores it.
   New wardrobe pieces (built by tools/build-preset-assets.js): cargo_trousers, crop_top, ankara_overshirt,
   hair_braidbun, hair_braidsup, hair_curls, beard_full, chain_gold, watch_black, tee_graphic_lagos. */
'use strict';

/* ---- registry: new hair, outfits, beard, accessories ---- */
const PRESET_BASE_HAIR=Object.values(WARDROBE.hair).slice(), PRESET_BASE_OUTFITS=Object.values(WARDROBE.outfits).flat(); // what the neighbours needed before v26
Object.assign(WARDROBE.hair,{braidbun:'hair_braidbun',braidsup:'hair_braidsup',curls:'hair_curls'});
Object.assign(WARDROBE.outfits,{basics:['tee','office_trousers','sneakers'],everydayefe:['crop_top','ankara_overshirt','cargo_trousers','sneakers'],everydaytunde:['tee','cargo_trousers','sneakers'],
  _extras:['beard_full','chain_gold','watch_black','tee_graphic_lagos']}); // not an outfit: listed so the prefetch and the thumbnails have the extras
HAIRS.push({id:'none',name:'No hair'},{id:'braidbun',name:'Braided bun'},{id:'braidsup',name:'Braids, half-up'},{id:'curls',name:'Short curls'});
OUTFITS.push({id:'basics',name:'Tee, trousers & sneakers',c:'#2F49A8',c2:'#3A3A3C'},{id:'everydayefe',name:'Crop top & Ankara overshirt',c:'#F4F2EC',c2:'#2E6B47'},{id:'everydaytunde',name:'Lagos tee & cargos',c:'#E9DFC9',c2:'#1E1E21'});
/* the neighbours upgrade to the modelled cast as soon as the pieces THEY wear are here; the preset pieces load after, in the same queue */
if(typeof envAssetsReady==='function') envAssetsReady=function(){ return HERO.state==='ready'&&PRESET_BASE_HAIR.every(n=>WARDROBE.cache[n])&&PRESET_BASE_OUTFITS.every(n=>WARDROBE.cache[n]); };
const BEARDS=[{id:'none',name:'None'},{id:'full',name:'Full beard'}];
const ACCESSORIES=[{id:'hoops',name:'Gold hoops'},{id:'chain',name:'Gold chain'},{id:'watch',name:'Black watch'}];
const ACC_ASSET={chain:'chain_gold',watch:'watch_black'};
const OUTFIT_COLORS={ // defaults per outfit; a preset or the player can override any of them
  basics:{top:'#2F49A8',bottom:'#3A3A3C',shoe:'#EEE8DC',sole:'#D9D2C2'},
  everydayefe:{top:'#F6F4EE',bottom:'#2E6B47',shoe:'#EEE8DC',sole:'#D9D2C2',accent:'#1E6B45'},
  everydaytunde:{top:'#E9DFC9',bottom:'#1E1E21',shoe:'#EEE8DC',sole:'#D9D2C2',accent:'#1E6B45'}};

/* ---- face and body shapes for the two characters (the residents system reshapes the shared sculpt) ---- */
Object.assign(RESIDENT_SHAPES,{
  efe_player:  {jaw:-0.09,chin:-0.006,faceLen:-0.02,cheeks:0.012,nose:-0.06,brow:-0.2,eyes:0.09,belly:-0.03,hips:0.08,chest:0.04},
  tunde_player:{earring:false,jaw:0.11,chin:0.008,faceLen:0.02,cheeks:-0.004,nose:0.08,brow:0.3,eyes:-0.02,belly:0.0,hips:-0.03,chest:0.06}});

/* Neutral player bases share the existing rig; face and build are independent. */
const BODY_BASES=[{id:'base_a',name:'Base A',shape:{hips:0.08,chest:0.04}},{id:'base_b',name:'Base B',shape:{hips:-0.03,chest:0.015}}];
const BODY_BUILDS=[{id:'slim',name:'Slim',shape:{belly:-0.025,hips:-0.03}},{id:'balanced',name:'Balanced',shape:{}},{id:'fuller',name:'Fuller',shape:{belly:0.055,hips:0.07,chest:0.025}}];
const FACE_OPTIONS=[{id:'oval',name:'Oval',shape:{}},{id:'soft',name:'Soft',shape:{jaw:-0.09,cheeks:0.012,eyes:0.06}},{id:'angular',name:'Angular',shape:{jaw:0.11,chin:0.008,cheeks:-0.004,brow:0.2}}];
function creatorShape(p){
  const base=BODY_BASES.find(x=>x.id===p.bodyBase)||BODY_BASES[0];
  const build=BODY_BUILDS.find(x=>x.id===p.bodyBuild)||BODY_BUILDS[1];
  const face=FACE_OPTIONS.find(x=>x.id===p.face)||FACE_OPTIONS[0];
  const id='creator_'+base.id+'_'+build.id+'_'+face.id;
  if(!RESIDENT_SHAPES[id]){const shape=Object.assign({},base.shape,face.shape);for(const k in build.shape)shape[k]=(shape[k]||0)+build.shape[k];RESIDENT_SHAPES[id]=shape;}
  return id;
}
const creatorLookFor=lookFor;
lookFor=function(i){const look=creatorLookFor(i);if(look.bodyBase)look.shape=creatorShape(look);return look;};
function creatorRow(i,key,label,options){const p=S.p[i];return `<div class="field creator-field"><label>${label}</label><div class="opts">${options.map(x=>`<button class="opt ${p[key]===x.id?'picked':''}" data-act="setp" data-i="${i}" data-k="${key}" data-v="${x.id}">${x.name}</button>`).join('')}</div></div>`;}
/* ---- which assets a look needs (prefetch, refresh and thumbnail keys all go through here) ---- */
function presetExtras(look){ const out=[]; if(look.beard&&look.beard!=='none') out.push('beard_full'); for(const a of (look.acc||[])) if(ACC_ASSET[a]) out.push(ACC_ASSET[a]);
  const garments=WARDROBE.outfits[look.outfit]||[]; if(look.graphic==='lagos'&&garments.includes('tee')) out.push('tee_graphic_lagos'); return out; }
const v26Names=wardrobeNames;
wardrobeNames=function(look){ const out=v26Names(look); for(const n of presetExtras(look)) if(!out.includes(n)) out.push(n); return out; };

/* ---- garment colours per outfit, overridable per look. The game sets garment colours as raw hex on linear materials,
   which the sRGB output lightens; preset colours are written as the colour meant to be seen, so they are linearised first ---- */
function lookColors(look){ return Object.assign({},OUTFIT_COLORS[look.outfit]||{},look.colors||{}); }
function lin(hex){ return '#'+new THREE.Color(hex).convertSRGBToLinear().getHexString(); }
const v26Outfit=heroOutfit;
heroOutfit=function(look){ const fit=v26Outfit(look); if(!OUTFIT_COLORS[look.outfit]) return fit; const c=lookColors(look);
  fit.top=lin(c.top); fit.bottom=lin(c.bottom); fit.shoe=lin(c.shoe); fit.sole=lin(c.sole); fit.topMap=null; fit.botMap=null; return fit; };

/* ---- equip: extras after the base wardrobe, then colour the pieces the base pass leaves alone ---- */
const PRESET_GEO=new Map(); // two-tone sneaker geometries by colour scheme
function presetSneakerGeometry(geo,base,accent){ const key=geo.uuid+'|'+base+'|'+accent; let g=PRESET_GEO.get(key); if(g) return g; g=geo.clone(); const P=g.attributes.position; const n=P.count; const col=new Float32Array(n*3); const b=new THREE.Color(base), a=new THREE.Color(accent);
  for(let i=0;i<n;i++){ const y=P.getY(i), z=P.getZ(i); const green=z<-0.03||z>0.125||(y>0.035&&y<0.07&&z>0.0&&z<0.105); const c=green?a:b; col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b; }
  g.setAttribute('color',new THREE.BufferAttribute(col,3)); PRESET_GEO.set(key,g); return g; }
function presetRecolour(g,look,fit,hairC){ const raw=lookColors(look); const hasScheme=!!OUTFIT_COLORS[look.outfit]; const c={}; for(const k in raw) c[k]=lin(raw[k]);
  g.traverse(o=>{ if(!o.isMesh||!/^wear_/.test(o.name)) return; const asset=o.userData.wardrobe||''; const mats=Array.isArray(o.material)?o.material:[o.material];
    for(const m of mats){ if(!m) continue; const nm=m.name||'';
      if(asset==='sneakers'){ if(nm==='shoe'&&hasScheme){ if(c.accent){ o.geometry=presetSneakerGeometry(o.geometry,c.shoe,c.accent); m.color.set('#ffffff'); m.vertexColors=true; m.needsUpdate=true; } else m.color.set(c.shoe); } else if(nm==='sole'&&hasScheme) m.color.set(c.sole); }
      else if(asset==='tee'&&hasScheme&&nm==='tee_rib') m.color.set(shade(c.top,0.9));
      else if(asset==='office_trousers'&&hasScheme){ if(nm==='bottom_dark') m.color.set(shade(c.bottom,0.75)); if(nm==='piping') m.color.set(shade(c.bottom,1.25)); }
      else if(asset==='cargo_trousers'&&nm==='bottom_dark') m.color.set(shade(c.bottom,0.7));
      else if(asset==='crop_top'&&nm==='top_dark') m.color.set(shade(c.top,0.88));
      else if(asset==='beard_full'&&nm==='beard'){ m.color.setRGB(0.022,0.016,0.013); if(m.roughness!==undefined) m.roughness=0.88; }
      if(asset==='tee_graphic_lagos'){ m.transparent=true; m.depthWrite=false; m.polygonOffset=true; m.polygonOffsetFactor=-2; m.polygonOffsetUnits=-2; o.renderOrder=2; o.castShadow=false; } } }); }
function presetEquipExtras(g,look,report){ const bones=g.hero&&g.hero.bones; if(!bones) return; const head=bones.head;
  for(const name of presetExtras(look)){ const src=WARDROBE.cache[name]; if(!src) continue; const ex=wardrobeExtras(src); const kind=ex.kind;
    if(kind==='garment'){ // skinned accessory on the shared skeleton (chain, watch, chest graphic)
      const body=g.hero.body; if(!body) continue; src.scene.traverse(n=>{ if(!n.isMesh) return; const mat=heroLambert(n.material,n.isSkinnedMesh); let m; if(n.isSkinnedMesh){ m=new THREE.SkinnedMesh(n.geometry,mat); m.frustumCulled=false; body.parent.add(m); m.bind(body.skeleton,body.bindMatrix); } else { m=new THREE.Mesh(n.geometry,mat); body.parent.add(m); } m.name='wear_'+name+'_'+(n.name||''); m.userData.wardrobe=name; m.castShadow=name!=='tee_graphic_lagos'; m.receiveShadow=false; });
      report.extras=(report.extras||[]).concat([name]); continue; }
    const parent=kind==='facial'?head:(kind==='accessory'||kind==='decal')?(bones[String(ex.bone||'').toLowerCase()]||null):null; if(!parent) continue;
    const mount=new THREE.Group(); mount.name='wearextra_'+name; src.scene.traverse(n=>{ if(!n.isMesh) return; const mat=heroLambert(n.material,false); const m=new THREE.Mesh(n.geometry,mat); m.name='wear_'+name+'_'+(n.name||''); m.userData.wardrobe=name; m.castShadow=kind!=='decal'; m.receiveShadow=false; n.getWorldPosition(m.position); m.quaternion.copy(n.getWorldQuaternion(new THREE.Quaternion())); mount.add(m); });
    parent.add(mount); report.extras=(report.extras||[]).concat([name]); }
  // gold hoops: mirror the sculpt's own earring for the other ear and enlarge both
  if((look.acc||[]).includes('hoops')&&head){ const ear=head.children.find(o=>/^earring/.test(o.name)&&o.isMesh); if(ear){ ear.visible=true; if(!head.children.some(o=>o.name==='earring_mirror')){ const other=ear.clone(); other.name='earring_mirror'; other.scale.x=-1; head.add(other); } } } }
const v26Equip=wardrobeEquip;
wardrobeEquip=function(g,look,fit,skin,hairC){ const report=v26Equip(g,look,fit,skin,hairC); try{ presetEquipExtras(g,look,report); presetRecolour(g,look,fit,hairC); }catch(e){ console.warn('[Compound Days] preset equip:',e); } return report; };

/* ---- creator: a preset row with model thumbnails, plus beard and accessory choices ---- */
function beardRowHTML(i){ const p=S.p[i]; const b=p.beard||'none'; return `<div class="field"><label>Facial hair</label><div class="opts">${BEARDS.map(x=>`<button class="opt ${b===x.id?'picked':''}" data-act="setp" data-i="${i}" data-k="beard" data-v="${x.id}">${x.name}</button>`).join('')}</div></div>`; }
function accRowHTML(i){ const p=S.p[i]; const acc=p.acc||[]; return `<div class="field"><label>Accessories</label><div class="opts">${ACCESSORIES.map(x=>`<button class="opt ${acc.includes(x.id)?'picked':''}" data-act="acctoggle" data-i="${i}" data-k="acc" data-v="${x.id}">${x.name}</button>`).join('')}</div></div>`; }

ACTIONS.acctoggle=d=>{ const p=S.p[+d.i]; const acc=(p.acc||[]).slice(); const k=acc.indexOf(d.v); if(k>=0) acc.splice(k,1); else acc.push(d.v); p.acc=acc; delete p.preset; renderSetup(); };
const v26Setp=ACTIONS.setp;
ACTIONS.setp=d=>{const p=S.p[+d.i];delete p.preset;
 if(['bodyBase','bodyBuild','face'].includes(d.k)){p.bodyBase=p.bodyBase||(p.shape==='tunde_player'?'base_b':'base_a');p.bodyBuild=p.bodyBuild||'balanced';p.face=p.face||(p.shape==='tunde_player'?'angular':p.shape==='efe_player'?'soft':'oval');p[d.k]=d.v;p.shape=creatorShape(p);}
 if(d.k==='outfit'){delete p.colors;delete p.wear;delete p.oc;p.graphic=d.v==='everydaytunde'?'lagos':undefined;}
 v26Setp(d); };
LOCAL_ONLY.add('acctoggle');
const v26RenderSetup=renderSetup;
renderSetup=function(){ v26RenderSetup(); const st=S&&S.setup&&S.setup.step; if(st!=='p0'&&st!=='p1') return; const i=st==='p0'?0:1; const panel=document.getElementById('panel'); if(!panel) return;
  const first=panel.querySelector('.field'); if(first&&!panel.querySelector('.creator-field')) first.insertAdjacentHTML('beforebegin',creatorRow(i,'bodyBase','Body base',BODY_BASES)+creatorRow(i,'bodyBuild','Build',BODY_BUILDS)+creatorRow(i,'face','Face',FACE_OPTIONS));
  const outfitField=[...panel.querySelectorAll('.field')].find(f=>f.querySelector('.opt[data-k="outfit"]')); if(outfitField&&!panel.querySelector('.opt[data-k="beard"]')) outfitField.insertAdjacentHTML('afterend',beardRowHTML(i)+accRowHTML(i)); };
const v26ThumbsFor=thumbsFor;
thumbsFor=function(i){ v26ThumbsFor(i); if(!S||!S.p||!S.p[i]||!document.querySelector(`.opt[data-k="bodyBase"][data-i="${i}"]`)) return;
  const jobs=[];const base=lookFor(i);for(const [kind,options] of [['bodyBase',BODY_BASES],['bodyBuild',BODY_BUILDS],['face',FACE_OPTIONS]])for(const x of options){const look=Object.assign({},base,{[kind]:x.id});look.shape=creatorShape(look);jobs.push({kind,id:x.id,look,i});}
  BEARDS.forEach(b=>jobs.push({kind:'beard',id:b.id,look:Object.assign({},base,{beard:b.id}),i}));
  THUMB.queue.push(...jobs); if(!THUMB.busy) thumbStep(); };
const v26ThumbKey=thumbKey;
thumbKey=function(look,kind,id){ return v26ThumbKey(look,kind,id)+'|'+(look.beard||'')+'|'+(look.acc||[]).join('+')+'|'+(look.graphic||'')+'|'+JSON.stringify(look.colors||{})+'|'+(look.shape||''); };
const v26ThumbRender=thumbRender;
thumbRender=function(look,kind){ if(kind==='beard'||kind==='face') return v26ThumbRender(look,'hair'); return v26ThumbRender(look,kind); };
function presetStatusText(){return ''; }
// Apply the same combined shape for network players and respect explicit accessories.
const creatorMakeHero=makeHeroAvatar;
makeHeroAvatar=function(look){if(look.bodyBase)look=Object.assign({},look,{shape:creatorShape(look)});const g=creatorMakeHero(look);if(g&&Array.isArray(look.acc))g.traverse(o=>{if(/^earring/.test(o.name))o.visible=look.acc.includes('hoops');if(/^face_beard/.test(o.name)&&look.beard!==undefined)o.visible=false;});return g;};

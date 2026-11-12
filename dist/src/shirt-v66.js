/* v66 Player 1 shirt colours: one honest, persistent customization on the V61
   mesh without pretending the old V55 outfits are already rebound to this body.

   Built-in shirt/jeans/shoes, hair silhouette, UVs, weights and animations stay
   unchanged. The top primitive alone gets a colour-preserving texture shader.
   The default Sky choice does not modify the V61 material at all. Portraits,
   Player 2 and all NPCs keep their existing appearance. */
'use strict';

const SHIRT66={
 choices:[
  {id:'sky',name:'Sky',hex:'#BFDCEF'},
  {id:'cream',name:'Cream',hex:'#F0E5D2'},
  {id:'coral',name:'Coral',hex:'#CB765D'},
  {id:'forest',name:'Forest',hex:'#3A7359'},
  {id:'indigo',name:'Indigo',hex:'#466C9A'},
  {id:'lilac',name:'Lilac',hex:'#A995C8'}
 ],
 key:'shirt66'
};

function shirt66Choice(look){
 const colors=look&&look.colors, id=colors&&typeof colors==='object'&&colors[SHIRT66.key];
 return SHIRT66.choices.find(c=>c.id===id)||SHIRT66.choices[0];
}

// The only tinting occurs on the top primitives, after hero61Dress has restored
// its own texture and authored colours. Shader reuses shirt's woven/drawn
// luminance instead of multiplying a pale blue texture by a dark colour.
function shirt66Material(src,chosen){
 const m=src.clone();m.userData=Object.assign({},m.userData,{cdShirt66:chosen.id});
 if(!m.map){ m.color.set(chosen.hex);m.needsUpdate=true;return m; }
 const C=new THREE.Color(chosen.hex); // Three r128 converts sRGB hex to linear light.
 const vec=[C.r,C.g,C.b].map(n=>Number(n).toFixed(7)).join(', ');
 m.color.set('#ffffff');
 const prev=m.onBeforeCompile;
 m.onBeforeCompile=function(shader,renderer){
  if(typeof prev==='function')prev.call(this,shader,renderer);
  if(!shader.fragmentShader.includes('#include <map_fragment>'))return;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',
   '#include <map_fragment>\n' +
   'float shirt66Luma = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));\n' +
   'float shirt66Fold = clamp(shirt66Luma / 0.84, 0.48, 1.22);\n' +
   'diffuseColor.rgb = vec3('+vec+') * shirt66Fold;');
 };
 const oldKey=m.customProgramCacheKey;
 m.customProgramCacheKey=function(){return (typeof oldKey==='function'?oldKey.call(this):'')+'|shirt66-'+chosen.id;};
 m.needsUpdate=true;
 return m;
}

function shirt66Dress(g,look){
 if(!g||!g.userData||!g.userData.hero61||!look||look.pi!==0)return g;
 const choice=shirt66Choice(look);
 g.userData.shirt66=choice.id;
 if(choice.id==='sky')return g; // default: pixel-identical to the shipped V61.
 g.traverse(o=>{
  if(!o.isMesh||!o.userData||o.userData.hero61Slot!=='top')return;
  const wasArray=Array.isArray(o.material),before=wasArray?o.material:[o.material];
  const after=before.map(m=>m&&m.name==='top'?shirt66Material(m,choice):m);
  o.material=wasArray?after:after[0];
 });
 return g;
}

// v61 already calls hero61Dress for Player 1 only. Hook there rather than
// altering the fallback hero, the 2D portrait system or avatar generation.
if(typeof hero61Dress==='function'){
 const shirt66OriginalDress=hero61Dress;
 hero61Dress=function(g){
  const out=shirt66OriginalDress.apply(this,arguments);
  try{ const p=typeof S!=='undefined'&&S&&S.p&&S.p[0];return shirt66Dress(out,p?Object.assign({pi:0},p):null); }
  catch(e){ console.warn('[Compound Days] shirt colour fallback:',e&&e.message);return out; }
 };
}

function shirt66PickerHTML(p){
 const selected=shirt66Choice(p);
 return '<div class="shirt66-picker" role="group" aria-label="V61 T-shirt colour">'+
   '<div class="shirt66-label">V61 T-shirt colour <span class="shirt66-selected">'+selected.name+'</span></div>'+
   '<div class="shirt66-swatches">'+SHIRT66.choices.map(c=>
    '<button type="button" class="shirt66-swatch'+(c.id===selected.id?' picked':'')+
    '" data-act="shirt66set" data-v="'+c.id+'" aria-label="'+c.name+' T-shirt" aria-pressed="'+String(c.id===selected.id)+
    '" title="'+c.name+'"><span class="shirt66-dot" style="background:'+c.hex+'"></span><span>'+c.name+'</span></button>'
   ).join('')+'</div>'+
   '<p class="tiny shirt66-hint">These colours change Player 1’s actual 3D shirt. The other outfit choices still change portraits; new outfit shapes need a compatible rig.</p></div>';
}

// Mount inside the existing Outfit FIELD so creator30's Clothes tab shows and
// hides these controls normally. Avoid duplicating them during async GLB load.
function shirt66MountPicker(){
 if(typeof document==='undefined'||typeof S==='undefined'||!S||!S.p||!S.p[0])return false;
 if(!S.setup||S.setup.step!=='p0')return false;
 if(typeof HERO61==='undefined'||!HERO61.enabled||HERO61.state!=='ready')return false;
 const panel=document.getElementById('panel');if(!panel||!panel.querySelector)return false;
 const outfit=panel.querySelector('[data-act="setp"][data-i="0"][data-k="outfit"]');
 const field=outfit&&outfit.closest?outfit.closest('.field'):null;
 if(!field||field.querySelector('.shirt66-picker'))return false;
 field.insertAdjacentHTML('beforeend',shirt66PickerHTML(S.p[0]));
 return true;
}
if(typeof HERO61!=='undefined'){
 HERO61.note='<p class="tiny v61note">Player 1 wears the V61 model. Its real T-shirt colour is customizable under Clothes; outfit shapes, hairstyles, headwear and skin choices still affect portraits and the classic hero, not this 3D figure.</p>';
}

// The V61 model may finish loading after the panel has opened.
if(typeof hero61NoteLive==='function'){
 const shirt66OldNote=hero61NoteLive;
 hero61NoteLive=function(){const r=shirt66OldNote.apply(this,arguments);try{shirt66MountPicker();}catch(e){}return r;};
}
// The regular setup re-renders on every creator choice. Add palette last.
if(typeof renderSetup==='function'){
 const shirt66OldSetup=renderSetup;
 renderSetup=function(){const r=shirt66OldSetup.apply(this,arguments);try{shirt66MountPicker();}catch(e){}return r;};
}
if(typeof ACTIONS!=='undefined'){
 ACTIONS.shirt66set=function(d){
  if(!d||!SHIRT66.choices.some(c=>c.id===d.v)||!S||!S.p||!S.p[0])return;
  const old=S.p[0].colors;
  S.p[0].colors=Object.assign({},old&&typeof old==='object'?old:{}, {[SHIRT66.key]:d.v});
  if(typeof renderSetup==='function'&&S.setup)renderSetup();
  else if(typeof refreshAvatar==='function')refreshAvatar(0);
 };
}
if(typeof LOCAL_ONLY!=='undefined'&&LOCAL_ONLY.add)LOCAL_ONLY.add('shirt66set');

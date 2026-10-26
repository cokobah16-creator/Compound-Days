/* Compound Days v28: one colour path.
   Until now the game wrote hex colours straight into linear materials, lit them hard, tone-mapped and sent the result
   to the screen without sRGB encoding; skin got a 70% compensation, preset garments a 100% one, eyes an explicit one,
   and the environment none. Here the convention becomes the normal one for three.js: a hex or CSS colour is sRGB and
   is converted to linear when set (patched into THREE.Color), canvas textures are tagged sRGB, every renderer (gameplay,
   creator preview, thumbnails) encodes its output as sRGB, and exposure is recalibrated against matched captures.
   The former behaviour stays reachable with ?color=legacy for comparison. */
'use strict';
const COLOR={mode:/[?&]color=legacy\b/.test(location.search)?'legacy':'managed',exposure:0.72,previewExposure:0.70,thumbExposure:0.70,hemiScale:1.0,ambientScale:1.0,
  /* Light colours (LKEY sun/sky/ground keys, the ambient) are authored as hex but are LINEAR working-space values by
     convention: the palette was tuned under the legacy path, which wrote them into the lights unconverted, so they were
     authored in the working space from the start. The managed path therefore restores the authored numbers after
     Color.set has converted them (applyLighting below). Surface colours (materials, canvases, glTF) are sRGB.
     v29: the convention is declared here and verified by tools/colorchart.js (unlit chart + lit three-renderer check). */
  lightColorSpace:'linear-authored'};
function colorManaged(){ return COLOR.mode==='managed'; }
if(colorManaged()){
  // 1. hex and CSS colours are sRGB
  const CP=THREE.Color.prototype; const setHex0=CP.setHex, setStyle0=CP.setStyle;
  // r128 resolves named CSS colours through setHex. Convert once at the outer boundary.
  let parsingStyle=0;
  CP.setHex=function(hex){ setHex0.call(this,hex); return parsingStyle?this:this.convertSRGBToLinear(); };
  CP.setStyle=function(style){ parsingStyle++; try{ setStyle0.call(this,style); } finally{ parsingStyle--; } return this.convertSRGBToLinear(); };
  // 2. canvases are painted in sRGB
  const CT0=THREE.CanvasTexture; THREE.CanvasTexture=function(){ const t=new CT0(...arguments); t.encoding=THREE.sRGBEncoding; return t; }; THREE.CanvasTexture.prototype=CT0.prototype;
  // 3. renderers encode their output
  const colorRenderer=(r,exposure)=>{ if(!r||r.userData&&r.userData.colorManaged) return; r.outputEncoding=THREE.sRGBEncoding; r.toneMappingExposure=exposure; r.userData=r.userData||{}; r.userData.colorManaged=true; };
  const v28InitRenderer=initRenderer; initRenderer=function(){ v28InitRenderer(); colorRenderer(renderer,COLOR.exposure); };
  const v28ThumbInit=thumbInit; thumbInit=function(){ const ok=v28ThumbInit(); if(ok&&THUMB.r) colorRenderer(THUMB.r,COLOR.thumbExposure); return ok; };
  const v28MountPreview=mountPreview; mountPreview=function(container,look){ v28MountPreview(container,look); if(typeof prevR!=='undefined'&&prevR) colorRenderer(prevR,COLOR.previewExposure); };
  // 4. the compensations written for the old path are now double conversions: undo them where they live
  if(typeof lin==='function') lin=function(hex){ return hex; };
  const v28MakeHero=makeHeroAvatar;
  makeHeroAvatar=function(look){ const g=v28MakeHero(look); if(!g) return g; const skin=look.skin||SKINS[3]; let skinC=null;
    g.traverse(o=>{ if(!o.isMesh) return; for(const m of (Array.isArray(o.material)?o.material:[o.material])){ if(!m) continue;
      if(m.name==='skin'){ m.color.set(skin); if(!skinC) skinC=m.color.clone(); } else if(m.name==='skin_dark') m.color.set(shade(skin,0.86)); } });
    if(typeof PRESENCE!=='undefined'){ g.traverse(o=>{ if(!o.isMesh) return; for(const m of (Array.isArray(o.material)?o.material:[o.material])){ if(!m) continue;
      if(m.name==='eye_white') m.color.set(PRESENCE.sclera); else if(m.name==='iris') m.color.set(PRESENCE.iris); else if(m.name==='hair'&&/^face_brow/.test(o.name)) m.color.set(PRESENCE.brow);
      else if(m.name==='lip_top'&&skinC) m.color.copy(skinC).multiply(new THREE.Color(0.78,0.55,0.53)); else if(m.name==='lip'&&skinC) m.color.copy(skinC).multiply(new THREE.Color(0.96,0.70,0.66)); } }); }
    return g; };
  // 5. lights keep their authored (unconverted) colours: converting them made the evening sun far more saturated than
  //    the palette intends; a light colour is a tint, not a surface. Intensity knobs are calibrated with tools/colorcompare.js
  const v28ApplyLighting=applyLighting; applyLighting=function(){ v28ApplyLighting(); if(typeof sun!=='undefined'&&sun){ sun.color.convertLinearToSRGB(); } if(typeof hemi!=='undefined'&&hemi){ hemi.color.convertLinearToSRGB(); hemi.groundColor.convertLinearToSRGB(); hemi.intensity*=COLOR.hemiScale; }
    if(typeof amb!=='undefined'&&amb){ if(amb.userData.base===undefined){ amb.userData.base=amb.intensity; amb.color.convertLinearToSRGB(); } amb.intensity=amb.userData.base*COLOR.ambientScale; } };
}
function colorStatusText(){ return colorManaged()?` Colour: sRGB-managed (exposure ${COLOR.exposure}).`:' Colour: legacy path.'; }

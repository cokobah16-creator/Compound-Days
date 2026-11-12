/* v61 "Player 1 live": the owner's V61 character (braids, blue Everyday tee, jeans, cream sneakers) draws Player 1.

   assets/characters/player1-v61.glb is the owner's Player1_V61_BLUE_FITTING_MOBILE.glb converted by
   tools/player1_v61_convert.py: metre-scale nodes and inverse binds, the 1024 px albedo only, no underlay, no morph
   targets, no tangents, eight clips on the same 27 joints as the classic hero (efe.gltf.json). It is requested at boot
   beside the classic asset, which keeps drawing Player 2, the neighbours and the sellers, and which stays Player 1's
   fallback when this file cannot be used or the figure cannot be built from it.

   Rules (CHARACTER.md "From v61"): the V61 figure wears its baked look. The creator's skin tone, hair, headwear and
   outfit for Player 1 colour the 2D portraits and everything else that reads S.p[0]; they do not repaint this figure,
   no wardrobe piece (authored on the classic bind pose) is bound to it, no kit piece (kit-v50, built to the classic
   head and feet) is mounted on it, and the face is static. The option thumbnails in Player 1's creator keep showing
   each choice on the classic figure, as they did before v61, so a thumbnail never shows the same V61 picture for every
   option.

   Switch back with ?hero=v55 or localStorage cd3-hero=v55; ?hero=v61 forces it on. */
'use strict';

const HERO61={url:'assets/characters/player1-v61.glb',state:'idle',gltf:null,clips:{},error:null,startedAt:0,loadedMs:0,bytes:0,
 enabled:true,building:false,albedo:null,patchColor:null,sourceColors:{},
 // the creator's face view for the V61 head (eyes about 1.57 m, chin 1.44 m, crown 1.70 m): the head is a quarter smaller than the
 // classic one, so the camera comes closer than head-v55's (z 1.06); measured on the creator capture so the hair top and eyes land
 // where the classic face view puts them (SP/v61/wf-build/builder-a/run4)
 faceCam:{y:1.585,z:0.84,lookY:1.56},
 // one line in Player 1's creator panel (under the Skin tone field, where the choices it speaks of begin) and one in the kit
 // panel when Player 1 is selected there
 note:'<p class="tiny v61note">Player 1 now uses the new V61 character, which wears its own look. The skin tone, hair, headwear and outfit chosen here colour Player 1’s portraits, not this figure.</p>',
 kitNote:'<p class="tiny v61note">Player 1 is drawn as the V61 figure, which shows no kit pieces; a piece Player 1 puts on is recorded here and drawn only on the classic hero (?hero=v55).</p>'};
// The switch: ?hero=v61 forces the file on, ?hero=v55 or a stored 'v55' (localStorage cd3-hero) turns it off.
function hero61Switch(search,stored){ const q=String(search||''); if(/[?&]hero=v61\b/.test(q)) return true; if(/[?&]hero=v55\b/.test(q)) return false; return stored!=='v55'; }
(function(){ let on=true; try{ on=hero61Switch((typeof location!=='undefined'&&location.search)||'',typeof localStorage!=='undefined'?localStorage.getItem('cd3-hero'):null); }catch(e){} HERO61.enabled=on; })();

// Player 1 alone: lookFor(0) carries pi 0 (visual-v21 gives both players rig 'hero', and the neighbours, sellers and
// football kids are built on the hero rig too). A look with hero61:false opts out (the creator thumbnails, the fallback build).
function hero61Applies(look){ return HERO61.enabled&&HERO61.state==='ready'&&!!look&&look.rig==='hero'&&look.pi===0&&look.hero61!==false; }
// whether the Player 1 standing in the world is the V61 figure
function hero61Drawn(){ return !!(typeof players!=='undefined'&&players[0]&&players[0].g&&players[0].g.userData&&players[0].g.userData.hero61); }

// The load-success path, shared with check/verify-hero-v61.cjs: validate like heroLoad, collect the clips, record what
// the asset says each primitive is (its material, whether it is textured, its authored colour) and mark it ready.
function hero61Install(g){
 const root=g&&g.scene; if(!root) throw new Error('no scene');
 const bones=heroFindBones(root); const missing=['hips','head','lefthand','righthand','leftarm','rightarm','leftupleg','rightupleg'].filter(k=>!bones[k]);
 let skinned=0; root.traverse(o=>{ if(o.isSkinnedMesh) skinned++; });
 if(!skinned||missing.length) throw new Error(`not a usable humanoid rig (skinned meshes: ${skinned}, missing joints: ${missing.join(', ')||'none'})`);
 const clips={}; for(const c of g.animations||[]){ const key=heroClipName(c.name); if(key&&!clips[key]) clips[key]=c; }
 if(!clips.idle||!clips.walk) throw new Error('asset has no idle/walk clips ('+(g.animations||[]).map(a=>a.name).join(', ')+')');
 let albedo=null, patch=null; const src={};
 root.traverse(o=>{ if(!o.isMesh) return; const m=Array.isArray(o.material)?o.material[0]:o.material; if(!m) return;
  o.userData.hero61Slot=m.name||''; o.userData.hero61Textured=!!m.map;
  if(m.map){ if(!albedo) albedo=m.map; if(!src[m.name]) src[m.name]=m.color?m.color.clone():new THREE.Color('#ffffff'); }
  else if(m.name==='top'&&m.color) patch=m.color.clone(); });
 if(!albedo) throw new Error('asset has no albedo texture');
 HERO61.clips=clips; HERO61.albedo=albedo; HERO61.sourceColors=src; HERO61.patchColor=patch||src.top||new THREE.Color('#ffffff');
 root.userData.hero61=true; HERO61.gltf=g; HERO61.error=null; HERO61.state='ready';
 return {clips:Object.keys(clips),skinned,textured:Object.keys(src)};
}
// Player 1 and Player 1's creator preview are rebuilt; nothing else is drawn with this asset. If Player 1's panel is
// already open when the file arrives (a slow download), its line is put into the open panel at the same place openPanel
// would have put it (after the Skin tone field), so the V61 preview never stands above the choices without the line.
function hero61Refresh(){
 try{ if(typeof players!=='undefined'&&players.length&&typeof refreshAvatar==='function'&&typeof both==='function') both().forEach(i=>{ if(i===0) refreshAvatar(0); }); }catch(e){}
 try{ if(typeof document!=='undefined'&&typeof mountPreview==='function'&&typeof lookFor==='function'){ const pv=document.getElementById('pv3d0'); if(pv&&typeof S!=='undefined'&&S&&S.p){ mountPreview(pv,lookFor(0)); hero61NoteLive(); } } }catch(e){}
}
function hero61NoteLive(){
 if(!(HERO61.enabled&&HERO61.state==='ready')||typeof document==='undefined') return false;
 const panel=document.getElementById('panel'); if(!panel||!panel.querySelector||panel.querySelector('.v61note')||!panel.querySelector('#pv3d0')) return false;
 const skin=panel.querySelector('.field [data-k="skin"]'); const field=skin&&skin.closest?skin.closest('.field'):null; if(!field||!field.insertAdjacentHTML) return false;
 field.insertAdjacentHTML('afterend',HERO61.note); return true;
}
// The file could not be fetched, parsed or validated: the Menu shows the reason in words (GLTFLoader hands a ProgressEvent
// for a failed download, which has no message), and Player 1 is drawn from the classic asset.
function hero61Fail(e){
 HERO61.state='error'; HERO61.error=(e&&(e.message||e.statusText))||(typeof e==='string'&&e)||'network error';
 console.warn('[Compound Days] V61 file for Player 1 not used; the classic asset stands in:',HERO61.error);
 hero61Refresh();
}

// 1. heroLoad: request the V61 file with the build revision query, then the classic asset as before (authored-v34's
//    wrapper installs its passes and fetches efe.gltf.json with the same query). The classic file still draws everyone
//    else on the hero rig and is the fallback, so it loads whether or not this one succeeds.
if(typeof heroLoad==='function'){ const heroLoad61=heroLoad;
 heroLoad=function(){
  if(HERO61.enabled&&HERO61.state==='idle'&&typeof THREE!=='undefined'&&typeof THREE.GLTFLoader==='function'){
   HERO61.state='loading'; HERO61.startedAt=performance.now();
   const build=typeof BUILD_ID!=='undefined'?BUILD_ID:'';
   try{ new THREE.GLTFLoader().load(HERO61.url+'?v='+build,(g)=>{ try{ hero61Install(g); HERO61.loadedMs=Math.round(performance.now()-HERO61.startedAt); hero61Refresh(); }catch(e){ hero61Fail(e); } },(ev)=>{ if(ev&&ev.total) HERO61.bytes=ev.total; },(e)=>hero61Fail(e)); }
   catch(e){ hero61Fail(e); }
  }
  return heroLoad61.apply(this,arguments);
 }; }

// 2. makeHeroAvatar: for Player 1, the base builder runs on the V61 asset (HERO's three fields swapped for the call),
//    then the game's paint is undone: the asset's own colours and albedo come back, the hair primitive is shown again
//    (heroIsHairMesh hid it), any built-in or wardrobe hair mount is removed. Skin materials are marked so authored-v34's
//    skin calibration (installed outside this wrapper at boot) leaves them alone. If anything in the V61 build throws,
//    the V61 state becomes 'error' and Player 1 is built from the classic asset instead, so a V61 fault never marks the
//    classic asset broken (heroLoad's own refresh wraps its rebuilds in the try that validates efe.gltf.json).
function hero61Dress(g){
 g.traverse(o=>{ if(!o.isMesh||!o.userData||!o.userData.hero61Slot) return; o.visible=true;
  for(const m of (Array.isArray(o.material)?o.material:[o.material])){ if(!m) continue;
   if(o.userData.hero61Textured){ const c=HERO61.sourceColors[m.name]; if(c) m.color.copy(c); else m.color.set('#ffffff'); m.map=HERO61.albedo; }
   else { if(HERO61.patchColor) m.color.copy(HERO61.patchColor); m.map=null; }
   m.vertexColors=false; m.needsUpdate=true;
   if(m.name==='skin'){ m.userData.authored34Skin=true; } } });
 const mounts=[]; g.traverse(o=>{ if(o.name==='hairMount'||o.name==='wardrobeHair') mounts.push(o); }); mounts.forEach(o=>{ if(o.parent) o.parent.remove(o); });
 g.userData.hero61=true; if(g.hero){ g.hero.v61=true; g.hero.wardrobe={garments:[],hair:null}; }
 return g;
}
if(typeof makeHeroAvatar==='function'){ const makeHero61=makeHeroAvatar;
 makeHeroAvatar=function(look){
  if(!hero61Applies(look)) return makeHero61.apply(this,arguments);
  const saved={gltf:HERO.gltf,state:HERO.state,clips:HERO.clips}; let g=null, failed=null;
  try{ HERO61.building=true; Object.assign(HERO,{gltf:HERO61.gltf,state:'ready',clips:HERO61.clips}); g=makeHero61.apply(this,arguments); if(g) hero61Dress(g); }
  catch(e){ failed=e||new Error('build failed'); }
  finally{ Object.assign(HERO,saved); HERO61.building=false; }
  if(!failed) return g;
  HERO61.state='error'; HERO61.error='figure could not be built: '+((failed&&failed.message)||String(failed));
  console.warn('[Compound Days] V61 figure for Player 1 could not be built; the classic asset stands in:',HERO61.error);
  return makeHero61.call(this,Object.assign({},look,{hero61:false}));
 }; }

// 3. No wardrobe piece is bound to the V61 figure (the authored garments and hair sit on the classic bind pose), and no
//    kit piece is mounted on it: kit-v50 places hats, shades and hoops from the asset's hairMount extras (written in
//    world space for this file) and its shoes to the classic foot, so Player 1's kit is taken out of the look before
//    kit-v50's makeAvatar wrapper (loaded earlier, so inner to this one) sees it. S.p[0].kit itself is untouched: the
//    pieces stay recorded and are worn again on the classic hero (?hero=v55).
if(typeof wardrobeEquip==='function'){ const wardrobeEquip61=wardrobeEquip;
 wardrobeEquip=function(g,look,fit,skin,hairC){ if(HERO61.building) return {garments:[],hair:null}; return wardrobeEquip61.apply(this,arguments); }; }
if(typeof makeAvatar==='function'){ const makeAvatar61=makeAvatar;
 makeAvatar=function(look,lite){ if(hero61Applies(look)&&look.kit) return makeAvatar61.call(this,Object.assign({},look,{kit:undefined}),lite); return makeAvatar61.apply(this,arguments); }; }

// 4. The Menu status line. visual-v21's hair line describes Player 1 as a classic body with fallback hair and base
//    slots when the wardrobe report is empty; for the V61 figure that fragment is dropped and the V61 sentence says
//    what is true instead. Every branch names which asset draws whom at that moment.
if(typeof heroHairLine==='function'){ const heroHairLine61=heroHairLine;
 heroHairLine=function(){ const s=heroHairLine61.apply(this,arguments); if(!hero61Drawn()) return s;
  return String(s).replace(' Player 1: modelled body; hair fallback; clothes base slots.',''); }; }
if(typeof heroStatusText==='function'){ const heroStatusText61=heroStatusText;
 heroStatusText=function(){ const classic=heroStatusText61.apply(this,arguments); if(!HERO61.enabled) return classic;
  const E=typeof esc==='function'?esc:String; const classicState=typeof HERO!=='undefined'?HERO.state:'';
  if(HERO61.state==='ready'||HERO61.state==='loading'){
   const rest=classicState==='error'?` The classic asset failed as well (${E(HERO.error)}); Player 2 and the neighbours use the game’s built-in figure.`:(classic?' Classic asset: '+String(classic).replace(/^Character asset: /,''):'');
   if(HERO61.state==='ready') return `Character asset: ${HERO61.url} loaded in ${HERO61.loadedMs} ms (${Object.keys(HERO61.clips).length} clips). Player 1 wears the V61 look; Player 1’s skin tone, hair, headwear and outfit choices colour the portraits, not the V61 figure, and kit pieces are not drawn on it.`+rest;
   return `Character asset: loading ${HERO61.url}…`+rest; }
  if(HERO61.state==='error') return `V61 file not used (${E(HERO61.error)}). `+(classicState==='ready'?'Player 1 uses the classic hero. ':'')+classic;
  return classic; }; }

// 5. The creator's face view frames the V61 head (after head-v55's framing of the classic head).
if(typeof creator30Preview==='function'){ const creator30Preview61=creator30Preview;
 creator30Preview=function(now,dt){ const r=creator30Preview61.apply(this,arguments);
  if(typeof CREATOR30!=='undefined'&&CREATOR30.zoom==='face'&&typeof prevCam!=='undefined'&&prevCam&&typeof prevChar!=='undefined'&&prevChar&&prevChar.userData&&prevChar.userData.hero61){
   const s=prevChar.scale.y||1, C=HERO61.faceCam; prevCam.position.set(0,C.y*s,C.z); prevCam.lookAt(0,C.lookY*s,0); }
  return r; }; }

// 6. Option thumbnails: Player 1's hair, headwear and outfit pictures keep showing each choice on the classic figure
//    (hero61:false opts the look out), exactly as they did before v61; the V61 figure would show the same picture for
//    every option.
if(typeof thumbRender==='function'){ const thumbRender61=thumbRender;
 thumbRender=function(look,kind){ if(hero61Applies(look)) return thumbRender61.call(this,Object.assign({},look,{hero61:false}),kind); return thumbRender61.apply(this,arguments); }; }

// 7. One truthful line in Player 1's creator panel, after the Skin tone field (polish-v30 puts its tab row before the
//    first field, so the line sits under the tabs with the choices it speaks of and never under the sticky button at the
//    top of a phone panel), and one in the kit panel while Player 1 is the selected wearer. Never twice in one panel.
if(typeof openPanel==='function'){ const openPanel61=openPanel;
 openPanel=function(html){
  try{ if(HERO61.enabled&&typeof html==='string'&&html.indexOf('class="tiny v61note"')<0){
   if(HERO61.state==='ready'&&html.indexOf('id="pv3d0"')>=0){ const skin=html.indexOf('<div class="field"><label>Skin tone</label>');
    if(skin>=0){ let at=html.indexOf('<div class="field">',skin+10); if(at<0) at=skin; html=html.slice(0,at)+HERO61.note+html.slice(at); arguments[0]=html; } }
   else if(html.indexOf('id="kit50"')>=0&&hero61Drawn()&&typeof KIT50!=='undefined'&&(KIT50.who|0)===0){ const h2=html.indexOf('<h2>Shoes and accessories</h2>'); const p=h2>=0?html.indexOf('</p>',h2):-1;
    if(p>=0){ html=html.slice(0,p+4)+HERO61.kitNote+html.slice(p+4); arguments[0]=html; } } } }catch(e){}
  return openPanel61.apply(this,arguments); }; }

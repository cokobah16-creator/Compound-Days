/* v56 "Player 1 V56": Emeke's V56 model (the Meshy 7.1 pack, Player1_ALL_ANIMATIONS_MASTER.glb) as Player 1's default model,
   with the Classic model one tap away in the creator's Body tab.

   tools/player1_v56/build.mjs turns the pack into assets/characters/player1-v56.glb: 31k triangles (from 91.6k), WebP
   textures, the shirt's brown side patches repaired, its 24 joints re-rested to the hero's convention (metres, joint
   axes aligned with the figure, the hero's joint names), and the game's eight hero clips retargeted onto it, with the
   pack's own walk (time-stretched to the game's 1.3 m stride) under the walk and the carry walks.

   The model is one mesh: its braids, T-shirt, jeans, sneakers and skin are painted into it, so the creator's skin, hair
   and clothes choices, the wardrobe outfits and the everyday wrap stay with the Classic model. The kit from Dayo's still
   goes on (hats, glasses, earrings, chain, watch and bags sit on its joints). The asset is fetched only when Player 1
   is V56, so a Classic household loads exactly as before. If it cannot load, Player 1 is drawn with the Classic model. */
'use strict';
const P1V56={
 url:'assets/characters/player1-v56.glb', state:'idle', gltf:null, clips:{}, error:null, bytes:0, loadedMs:0,
 CLIPS:['idle','walk','carry','carryLow','walkCarry','walkCarryLow','pick','wave'],
 // the creator's face view for this head (eyes about 1.58 m)
 faceCam:{y:1.6,z:1.3,lookY:1.555}
};
function p1v56Wanted(look){ return !!(look&&look.model==='v56'&&look.rig==='hero'); }
function p1v56Load(){
 if(P1V56.state!=='idle') return; if(typeof THREE.GLTFLoader!=='function'){ P1V56.state='error'; P1V56.error='GLTFLoader missing'; return; }
 P1V56.state='loading'; const t0=performance.now(); const q=typeof BUILD_ID!=='undefined'?'?v='+BUILD_ID:'';
 new THREE.GLTFLoader().load(P1V56.url+q,g=>{ try{ p1v56Accept(g); P1V56.loadedMs=Math.round(performance.now()-t0);
   // swap in for Player 1 if already on screen, and the creator preview if it is open
   if(typeof players!=='undefined'&&players.length&&players[0]) refreshAvatar(0);
   const pv=document.getElementById('pv3d0'); if(pv&&S&&S.p) mountPreview(pv,lookFor(0));
  }catch(e){ P1V56.state='error'; P1V56.error=e.message||String(e); console.warn('[Compound Days] V56 model rejected, using the Classic model:',P1V56.error); } },
  ev=>{ if(ev&&ev.total) P1V56.bytes=ev.total; },
  e=>{ P1V56.state='error'; P1V56.error=(e&&(e.message||e.statusText))||'network error'; console.warn('[Compound Days] V56 model failed to load, using the Classic model:',P1V56.error); });
}
// named so the harness can hand it a parsed asset
function p1v56Accept(g){
 const bones=heroFindBones(g.scene); const missing=['hips','spine','neck','head','lefthand','righthand','leftarm','rightarm','leftupleg','rightupleg','leftfoot','rightfoot'].filter(k=>!bones[k]);
 let skinned=0; g.scene.traverse(o=>{ if(o.isSkinnedMesh) skinned++; }); if(!skinned||missing.length) throw new Error('not a usable rig (skinned: '+skinned+', missing: '+(missing.join(', ')||'none')+')');
 P1V56.clips={}; for(const c of g.animations) P1V56.clips[c.name]=c;
 const lack=P1V56.CLIPS.filter(k=>!P1V56.clips[k]); if(lack.length) throw new Error('missing clips: '+lack.join(', '));
 P1V56.gltf=g; P1V56.state='ready'; return g;
}
function p1v56Material(m){ // the asset's own PBR material (colour, normal and metal/rough maps); flat Lambert in lite quality
 if(typeof LOOK!=='undefined'&&LOOK.pbr){ const o=m.clone(); o.skinning=true; o.envMapIntensity=0.55; o.name=m.name; return o; }
 const o=new THREE.MeshLambertMaterial({color:'#ffffff',map:m.map||null}); o.skinning=true; o.name=m.name; return o; }
function makeP1V56Avatar(look){
 if(P1V56.state!=='ready') return null;
 const g=cloneSkinned(P1V56.gltf.scene); g.parts={}; g.isChar=true; g.rig='hero'; g.v56=true;
 const bones=heroFindBones(g); let body=null;
 g.traverse(o=>{ if(!o.isMesh) return; o.castShadow=true; o.receiveShadow=false; if(o.isSkinnedMesh){ o.frustumCulled=false; if(!body) body=o; } o.material=p1v56Material(o.material); });
 g.hero={bones,handL:bones.lefthand,handR:bones.righthand,head:bones.head,body,wardrobe:{garments:[]}};
 g.add(blob(0.38));
 g.mixer=new THREE.AnimationMixer(g); g.clips=P1V56.clips; g.actions={};
 for(const k in P1V56.clips){ const a=g.mixer.clipAction(P1V56.clips[k]); a.enabled=true; a.setEffectiveWeight(k==='idle'?1:0); a.play(); g.actions[k]=a; } g.current='idle';
 if(typeof ground32==='function') ground32(g);
 return g;
}
// wrap: Player 1 with the V56 model is built from its asset (and wears their kit); everyone else, and V56 before it has loaded, as before
if(typeof makeAvatar==='function'){ const p1v56Make=makeAvatar;
 makeAvatar=function(look,lite){
  if(p1v56Wanted(look)&&!lite){ if(P1V56.state==='idle') p1v56Load();
   if(P1V56.state==='ready'){ try{ const g=makeP1V56Avatar(look); if(g){ const kit=typeof kitWorn50==='function'&&kitWorn50(look); if(kit&&typeof kitDress50==='function'){ try{ kitDress50(g,look); }catch(e){ console.warn('[Compound Days] kit on V56 failed',e); } } return g; } }
    catch(e){ console.warn('[Compound Days] V56 avatar build failed, using the Classic model:',e&&e.message); } } }
  return p1v56Make.apply(this,arguments); }; }
// wrap: the world redraws Player 1 when the model choice changes
if(typeof stateSig==='function'){ const p1v56Sig=stateSig; stateSig=function(){ const s=p1v56Sig.apply(this,arguments); try{ return s+'|m:'+((S.p[0]&&S.p[0].model)||''); }catch(e){ return s; } }; }
// wrap: the creator waits for the V56 asset the same way it waits for the hero and the wardrobe
if(typeof mountPreview==='function'){ const p1v56Mount=mountPreview;
 mountPreview=function(container,look){
  if(container&&p1v56Wanted(look)&&P1V56.state!=='ready'&&P1V56.state!=='error'){ p1v56Load(); const next=document.querySelector('#panel .sticky-act button'); if(next) next.disabled=true;
   container.innerHTML='<div class="creator30-loading" role="status">Preparing your player…</div>'; return; }
  return p1v56Mount.apply(this,arguments); }; }
// wrap: the creator's Body tab gets the model choice; with V56 the hair and clothes tabs say why their choices don't show
if(typeof creator30Section==='function'){ const p1v56Sec=creator30Section; creator30Section=function(field){ if(field&&field.dataset&&field.dataset.sec) return field.dataset.sec; const k=field&&field.querySelector&&field.querySelector('[data-k]'); if(k&&k.dataset.k==='model') return 'body'; return p1v56Sec.apply(this,arguments); }; }
function p1v56Field(p){
 const pick=(p.model==='v56')?'v56':'classic';
 return `<div class="field p1v56-field"><label>Model</label><div class="opts">${[['classic','Classic'],['v56','V56']].map(([v,n])=>`<button class="opt ${pick===v?'picked':''}" data-act="setp" data-i="0" data-k="model" data-v="${v}">${n}</button>`).join('')}</div>`
  +`<p class="muted p1v56-help">${pick==='v56'?'V56 comes with her own braids, white tee, jeans and sneakers. Kit from Dayo’s still goes on.':'Classic takes your skin tone, hair and outfit choices.'}</p></div>`; }
if(typeof renderSetup==='function'){ const p1v56Setup=renderSetup;
 renderSetup=function(){ const r=p1v56Setup.apply(this,arguments);
  try{ if(S&&S.setup&&S.setup.step==='p0'){ const panel=document.getElementById('panel'); const first=panel&&panel.querySelector('.field');
    if(first&&!panel.querySelector('.p1v56-field')){ first.insertAdjacentHTML('beforebegin',p1v56Field(S.p[0]));
     if(S.p[0].model==='v56'){ const note=s=>`<div class="field p1v56-note" data-sec="${s}"><p class="muted">The V56 model wears her own ${s==='hair'?'braids':'clothes'}. Choose Classic in Body to use these.</p></div>`;
      const fs=[...panel.querySelectorAll('.field')]; const at=sec=>fs.find(f=>creator30Section(f)===sec);
      const h=at('hair'); if(h) h.insertAdjacentHTML('beforebegin',note('hair')); const c=at('clothes'); if(c) c.insertAdjacentHTML('beforebegin',note('clothes')); }
     if(typeof creator30Apply==='function') creator30Apply(); } } }catch(e){ console.warn('[Compound Days] V56 creator field skipped',e); }
  return r; }; }
// wrap: the creator's face view frames this head
if(typeof creator30Preview==='function'){ const p1v56Preview=creator30Preview;
 creator30Preview=function(now,dt){ const r=p1v56Preview.apply(this,arguments);
  if(typeof CREATOR30!=='undefined'&&CREATOR30.zoom==='face'&&typeof prevCam!=='undefined'&&prevCam&&prevChar&&prevChar.v56){ const s=prevChar.scale.y||1, C=P1V56.faceCam; prevCam.position.set(0,C.y*s,C.z); prevCam.lookAt(0,C.lookY*s,0); }
  return r; }; }
// wrap: the Menu's character line names the model in use (the load error stays in the console: it can carry a file path)
if(typeof heroStatusText==='function'){ const p1v56Status=heroStatusText;
 heroStatusText=function(){ const p=typeof players!=='undefined'&&players[0]; if(p&&p.g&&p.g.v56) return `Character asset: Player 1 is the V56 model (${P1V56.url}, loaded in ${P1V56.loadedMs} ms, ${Object.keys(P1V56.clips).length} clips).`;
  const base=p1v56Status.apply(this,arguments); if(S&&S.p&&S.p[0]&&S.p[0].model==='v56'&&P1V56.state==='error') return base+' The V56 model could not be loaded, so Player 1 is drawn with the Classic model.'; return base; }; }
// wrap: a new household's Player 1 starts as V56 (Emeke's call, 9 Nov 2026); saves from before v56 have no model field and keep the Classic model
if(typeof newState==='function'){ const p1v56New=newState; newState=function(){ const s=p1v56New.apply(this,arguments); try{ if(s&&s.p&&s.p[0]&&!s.p[0].model) s.p[0].model='v56'; }catch(e){} return s; }; }
// wrap: the kit's anchors on V56. Its Spine joint sits 0.10 m higher and its Neck joint 0.07 m lower than the hero's, and its chest is
// fuller, so the bag strap and the chain hang from stand-ins placed where the hero's joints are, and the strap sits further out
if(typeof kitRig50==='function'){ const p1v56Rig=kitRig50;
 kitRig50=function(g){ const R=p1v56Rig.apply(this,arguments); if(!R||!g||!g.v56) return R;
  const at=(joint,name,heroY)=>{ let m=joint.getObjectByName(name); if(!m){ m=new THREE.Group(); m.name=name; joint.add(m); } g.updateMatrixWorld(true); const w=new THREE.Vector3(); joint.getWorldPosition(w); m.position.set(0,heroY-(w.y-g.position.y)/(g.scale.y||1),0); return m; };
  if(R.torso) R.torso=at(R.torso,'p1v56_torso',0.95); if(R.neck) R.neck=at(R.neck,'p1v56_neck',1.36);
  const tf=R.torsoF; R.torsoF=(x,y)=>tf(x,y)+0.035; R.chain=Object.assign({},R.chain,{z:R.chain.z+0.03,pz:R.chain.pz+0.035});
  return R; }; }

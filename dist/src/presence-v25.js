/* Compound Days v25: presence pass for the modelled residents.
   The same sculpt, read better: baked occlusion and warm skin variation as vertex colours (tools/bake-presence.js
   supplies the occlusion bytes in presence-data-v25.js; this file turns them into colour), softer sclera with a
   lid shadow, an iris with a dark limbal rim, finer brows, and life: blinking, glances toward whoever is nearest,
   darting eyes, breathing and small idle head motion. Everything is applied after the animation mixer, so the
   clips are untouched; nothing here changes the skeleton, garments or saves. */
'use strict';

const PRESENCE={on:!/[?&]presence=off\b/.test(location.search),ao:1.0,warm:1.0,stubble:1.0,lidRest:0.0,blink:true,glance:true,breathe:true,baked:false,colored:0,actors:0,cands:[],candT:0,
  skinRoughness:0.58,sclera:'#DAD3C6',iris:'#7A4A2C',brow:'#2A1C15',rim:0.45,rimU:{value:0.45}};
const PRES_DATA=(typeof PRESENCE_DATA!=='undefined')?PRESENCE_DATA:null;
const PRES_EYE={x:0.072,y:0.207,z:0.156,rx:0.030,ry:0.022,rz:0.019,irisR:0.017}; // head-space eye measurements of the sculpt
const PRES_HEAD_Y=1.43, PRES_HEAD_Z=0.021; // the Head joint in the bind pose
const PRES_CAP_OPEN=-2.85; // hinge angle of an open blink cap (radians about the eye's x axis; 0 = closed over the front)
const PRES_CAP_GEO=(function(){ const g=new THREE.SphereGeometry(1,14,7,0,Math.PI*2,0,Math.PI*0.47); g.rotateX(Math.PI/2); return g; })(); // an 85-degree cap around +z (the eye's front)

function presSmooth(a,b,x){ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }
function presBump(x,c,w){ const t=Math.abs(x-c)/w; return t>=1?0:0.5+0.5*Math.cos(t*Math.PI); }
function presBytes(b64){ const s=atob(b64); const out=new Uint8Array(s.length); for(let i=0;i<s.length;i++) out[i]=s.charCodeAt(i); return out; }

/* match a mesh of the loaded asset to a baked entry: same material, vertex count and local bounds */
function presEntryFor(mesh){ if(!PRES_DATA) return null; const geo=mesh.geometry; if(!geo||!geo.attributes.position) return null; const n=geo.attributes.position.count;
  const m=Array.isArray(mesh.material)?mesh.material[0]:mesh.material; const name=m&&m.name||''; geo.computeBoundingBox(); const bb=geo.boundingBox;
  for(const e of PRES_DATA.meshes){ if(e.n!==n||e.mat!==name) continue; if(Math.abs(e.min[0]-bb.min.x)>0.002||Math.abs(e.min[1]-bb.min.y)>0.002||Math.abs(e.max[1]-bb.max.y)>0.002) continue; return e; } return null; }

/* ---- colour composition: occlusion byte + position → multiplier on the material colour ---- */
function presShadow(ao,out){ // occluded skin goes darker and redder, not grey
  const k=Math.pow(ao,1.6), s=PRESENCE.ao; out[0]*=1-s*(1-(0.46+0.54*k)); out[1]*=1-s*(1-(0.33+0.67*k)); out[2]*=1-s*(1-(0.30+0.70*k)); }
function presTint(out,r,g,b,w){ out[0]*=1-w*(1-r); out[1]*=1-w*(1-g); out[2]*=1-w*(1-b); }
function presBodyColor(x,y,z,ao,out){ out[0]=out[1]=out[2]=1; presShadow(ao,out); const W=PRESENCE.warm;
  if(y>1.40){ // the face: sockets, cheeks, nose, mouth surround, and stubble on the scalp
    for(const sx of [-1,1]){ const ex=sx*PRES_EYE.x, ey=PRES_HEAD_Y+PRES_EYE.y, ez=PRES_HEAD_Z+PRES_EYE.z+0.02;
      const d=((x-ex)/0.052)**2+((y-ey)/0.036)**2+((z-ez)/0.045)**2; const inS=presSmooth(1.4,0.55,d); if(inS>0){ const up=presSmooth(ey-0.004,ey+0.018,y);
        presTint(out,0.66,0.54,0.52,0.7*inS*up*W); presTint(out,0.88,0.76,0.74,0.45*inS*(1-up)*W); } }
    const cheek=presBump(Math.abs(x),0.105,0.07)*presBump(y,1.565,0.065)*presSmooth(0.05,0.13,z); presTint(out,1.0,0.88,0.84,0.55*cheek*W);
    const nose=presSmooth(0.045,0.012,Math.hypot(x,y-1.585,z-0.205)); presTint(out,1.0,0.90,0.87,0.45*nose*W);
    const noseSide=presBump(Math.abs(x),0.03,0.024)*presBump(y,1.60,0.05)*presSmooth(0.15,0.19,z); presTint(out,0.78,0.68,0.66,0.45*noseSide*W);
    const mouth=presBump(y,1.535,0.045)*presSmooth(0.09,0.02,Math.abs(x))*presSmooth(0.12,0.17,z); presTint(out,1.0,0.90,0.88,0.3*mouth*W);
    const underLip=presBump(y,1.503,0.022)*presSmooth(0.06,0.015,Math.abs(x))*presSmooth(0.13,0.17,z); presTint(out,0.76,0.66,0.64,0.45*underLip*W);
    const chin=presBump(y,1.43,0.05)*presSmooth(0.06,0.12,z)*presSmooth(0.10,0.03,Math.abs(x)); presTint(out,0.86,0.78,0.76,0.3*chin*W);
    const underJaw=presSmooth(1.42,1.36,y)*presSmooth(1.30,1.36,y)*presSmooth(0.02,0.08,z); presTint(out,0.70,0.60,0.58,0.5*underJaw*W);
    const temple=presSmooth(0.11,0.165,Math.abs(x))*presSmooth(1.58,1.66,y)*presSmooth(0.12,0.04,z)*presSmooth(1.80,1.74,y); presTint(out,0.84,0.78,0.76,0.4*temple*W);
    // stubble where a low cut fades out: the scalp above the hairline, lower at the temples and nape
    const front=presSmooth(0.05,0.10,z), back=presSmooth(-0.02,-0.08,z); const hairline=1.745*front+1.675*(1-front-back)+1.655*back;
    out.stubble=presSmooth(hairline-0.015,hairline+0.035,y)*presSmooth(0.17,0.12,Math.abs(x)*presSmooth(1.70,1.64,y)); // applied in the shader per avatar (fades and crops only; a bald head is clean-shaven)
  } else { // arms and hands: knuckles and elbows a touch warmer
    const el=presBump(y,1.15,0.07)*presSmooth(0.17,0.22,Math.abs(x)); presTint(out,1.0,0.91,0.88,0.25*el*W);
    const hand=presSmooth(0.95,0.80,y); presTint(out,1.0,0.92,0.90,0.2*hand*W); } }
function presLidColor(x,y,z,ao,upper,out){ out[0]=out[1]=out[2]=1; presShadow(ao,out); if(upper){ const crease=presSmooth(0.214,0.231,y); presTint(out,0.70,0.60,0.58,0.5*crease); } else { presTint(out,0.95,0.86,0.84,0.4); } }
function presEarColor(ao,out){ out[0]=out[1]=out[2]=1; presShadow(ao,out); presTint(out,1.0,0.88,0.85,0.4); }
function presScleraColor(x,y,z,ao,out){ const u=(Math.abs(x)-PRES_EYE.x)/PRES_EYE.rx, v=(y-PRES_EYE.y)/PRES_EYE.ry; out[0]=out[1]=out[2]=1;
  presTint(out,0.55,0.50,0.50,0.8*presSmooth(-0.15,0.95,v)); // lid shadow over the top of the eye
  presTint(out,0.80,0.52,0.50,0.6*presSmooth(0.55,1.0,Math.abs(u))); // pink corners
  presTint(out,0.80,0.78,0.78,0.35*presSmooth(-0.2,-1.0,v)); // slight shade under the lower lid
  const k=Math.pow(ao,0.8); presTint(out,k,k*0.96,k*0.95,0.5); }
function presIrisColor(x,y,z,out){ const u=(Math.abs(x)-(PRES_EYE.x+0.001))/PRES_EYE.irisR, v=(y-(PRES_EYE.y-0.001))/PRES_EYE.irisR; const r=Math.hypot(u,v), th=Math.atan2(v,u); out[0]=out[1]=out[2]=1;
  presTint(out,0.22,0.18,0.16,presSmooth(0.70,0.96,r)); // limbal ring
  presTint(out,0.62,0.56,0.54,presSmooth(0.45,0.18,r)); // darker collarette next to the pupil
  const streak=0.5+0.5*Math.sin(th*11+2.0*Math.sin(th*3)); presTint(out,0.80,0.74,0.72,0.35*streak*presBump(r,0.55,0.32));
  presTint(out,0.60,0.55,0.55,0.5*presSmooth(-0.1,0.75,v)); } // lid shadow
function presLipColor(y,top,ao,out){ out[0]=out[1]=out[2]=1; presShadow(ao,out); if(top){ const v=presSmooth(0.101,0.112,y); presTint(out,0.62,0.50,0.50,0.55*(1-v)); } else { const v=presSmooth(0.097,0.107,y); presTint(out,0.66,0.52,0.52,0.6*v); presTint(out,1.0,0.94,0.94,0.0); } }

/* paint one base geometry once; every avatar and every resident reshape shares or clones the attribute */
function presPaint(mesh,entry,kind){ const geo=mesh.geometry; if(geo.attributes.color&&geo.attributes.color.name==='presence') return true; const P=geo.attributes.position; const n=P.count; const ao=entry?presBytes(entry.ao):null; if(ao&&ao.length!==n) return false;
  const col=new Float32Array(n*3); const out=[1,1,1]; const stub=kind==='body'?new Float32Array(n):null;
  for(let i=0;i<n;i++){ const x=P.getX(i), y=P.getY(i), z=P.getZ(i); const a=ao?ao[i]/255:1; out.stubble=0;
    if(kind==='body') presBodyColor(x,y,z,a,out); else if(kind==='lidU') presLidColor(x,y,z,a,true,out); else if(kind==='lidL') presLidColor(x,y,z,a,false,out); else if(kind==='ear') presEarColor(a,out);
    else if(kind==='sclera') presScleraColor(x,y,z,a,out); else if(kind==='iris') presIrisColor(x,y,z,out); else if(kind==='lipTop') presLipColor(y,true,a,out); else if(kind==='lip') presLipColor(y,false,a,out); else if(kind==='mouth'){ out[0]=out[1]=out[2]=0.4; } else { out[0]=out[1]=out[2]=1; }
    col[i*3]=out[0]; col[i*3+1]=out[1]; col[i*3+2]=out[2]; if(stub) stub[i]=out.stubble||0; }
  const attr=new THREE.BufferAttribute(col,3); attr.name='presence'; geo.setAttribute('color',attr); if(stub){ const sa=new THREE.BufferAttribute(stub,1); sa.name='presence'; geo.setAttribute('stubble',sa); } PRESENCE.colored++; return true; }
function presKind(mesh){ const m=Array.isArray(mesh.material)?mesh.material[0]:mesh.material; const name=m&&m.name||''; const n=mesh.geometry.attributes.position.count;
  if(mesh.isSkinnedMesh) return name==='skin'&&n>10000?'body':null; mesh.geometry.computeBoundingBox(); const bb=mesh.geometry.boundingBox;
  if(name==='skin'&&n===142) return bb.min.y>0.2?'lidU':'lidL'; if(name==='skin_dark') return 'ear'; if(name==='eye_white') return 'sclera'; if(name==='iris') return 'iris';
  if(name==='lip_top') return 'lipTop'; if(name==='lip') return 'lip'; if(name==='tongue') return 'mouth'; return null; }
function presenceBakeBase(){ if(PRESENCE.baked||typeof HERO==='undefined'||HERO.state!=='ready') return; PRESENCE.baked=true;
  HERO.gltf.scene.traverse(o=>{ if(!o.isMesh) return; const kind=presKind(o); if(!kind) return; const entry=kind==='iris'?null:presEntryFor(o); if(!entry&&kind!=='iris') return; presPaint(o,entry,kind); }); }

/* ---- per avatar: materials, lid pivots, eye references ---- */
function presSide(o){ o.geometry.computeBoundingBox(); return o.geometry.boundingBox.getCenter(new THREE.Vector3()).x<0?0:1; }
function presStubbleFor(hair){ return (hair==='low'||hair==='curls')?1:0; }
function presenceSetup(g,look){ if(!g||!g.hero||g.presence) return; const bones=g.hero.bones||{}; const head=bones.head; if(!head) return; const stubbleU={value:PRESENCE.stubble*presStubbleFor(look&&look.hair)};
  const s={head,neck:bones.neck||null,spine1:bones.spine1||null,spine2:bones.spine2||null,caps:[null,null],eyes:[null,null],
    base:new Map(),applied:new Map(),blink:-1,blinkT:1+Math.random()*3,blinkDur:0.24,yaw:0,pitch:0,tYaw:0,tPitch:0,gazeX:0,gazeY:0,sacX:0,sacY:0,sacT:0.5+Math.random(),retarget:Math.random()*0.3,target:null,phase:Math.random()*Math.PI*2,phase2:Math.random()*Math.PI*2,t:0};
  // vertex colours on every painted part (reshaped resident geometries clone the attribute; stale ones get it copied)
  g.traverse(o=>{ if(!o.isMesh) return; const kind=presKind(o); if(!kind) return; const geo=o.geometry;
    if(!(geo.attributes.color&&geo.attributes.color.name==='presence')){ const base=presBaseFor(o,kind); if(base){ geo.setAttribute('color',base.attributes.color); if(base.attributes.stubble) geo.setAttribute('stubble',base.attributes.stubble); } else return; }
    for(const m of (Array.isArray(o.material)?o.material:[o.material])){ m.vertexColors=true; m.needsUpdate=true; } });
  // material reading; lips follow the chosen skin tone (darker and redder than the skin) instead of one fixed colour
  let skinC=null; g.traverse(o=>{ if(skinC||!o.isSkinnedMesh) return; for(const m of (Array.isArray(o.material)?o.material:[o.material])) if(m&&m.name==='skin'){ skinC=m.color.clone(); } });
  g.traverse(o=>{ if(!o.isMesh) return; for(const m of (Array.isArray(o.material)?o.material:[o.material])){ if(!m) continue;
    if(m.name==='skin'&&o.isSkinnedMesh&&m.roughness!==undefined){ m.roughness=PRESENCE.skinRoughness; }
    else if(m.name==='eye_white'){ m.color.set(PRESENCE.sclera).convertSRGBToLinear(); if(m.roughness!==undefined){ m.roughness=0.18; m.envMapIntensity=1.1; } }
    else if(m.name==='iris'){ m.color.set(PRESENCE.iris).convertSRGBToLinear(); if(m.roughness!==undefined) m.roughness=0.3; }
    else if(m.name==='lip_top'){ if(skinC) m.color.copy(skinC).multiply(new THREE.Color(0.78,0.55,0.53)); if(m.roughness!==undefined) m.roughness=0.5; }
    else if(m.name==='lip'){ if(skinC) m.color.copy(skinC).multiply(new THREE.Color(0.96,0.70,0.66)); if(m.roughness!==undefined) m.roughness=0.42; }
    else if(m.name==='hair'&&/^face_brow/.test(o.name)){ m.color.set(PRESENCE.brow).convertSRGBToLinear(); if(m.roughness!==undefined) m.roughness=0.95; } } });
  // a soft top-weighted rim on skin, hair and clothes lifts the figure off the background (eyes, metal and glasses excluded)
  if(PRESENCE.rim>0) g.traverse(o=>{ if(!o.isMesh) return; for(const m of (Array.isArray(o.material)?o.material:[o.material])){ if(!m||!m.isMeshStandardMaterial||m.userData.presRim) continue; if(/eye|iris|pupil|gold|glasses|lens/.test(m.name||'')) continue; m.userData.presRim=true;
    if(m.name==='skin'&&o.isSkinnedMesh&&o.geometry.attributes.stubble){ m.userData.stubbleU=stubbleU; m.onBeforeCompile=presSkinCompile; } else m.onBeforeCompile=presRimCompile; m.needsUpdate=true; } });
  // finer brows: thinner, keeping the resident scaling about the same centre
  for(const o of head.children){ if(!/^face_brow/.test(o.name)||!o.isMesh) continue; o.geometry.computeBoundingBox(); const c=o.geometry.boundingBox.getCenter(new THREE.Vector3()); const sy=o.scale.y*0.8; o.scale.y=sy; o.position.y=c.y*(1-sy); }
  // blink caps: a skin-coloured spherical cap just outside each eyeball, hinged at the eye centre. Open, it sits up
  // inside the socket behind the lid rim; a blink swings it down over the front of the eye and back.
  for(const o of head.children.slice()){ if(!o.isMesh||!o.geometry) continue; const m=Array.isArray(o.material)?o.material[0]:o.material; const name=m&&m.name||''; const side=presSide(o);
    if(name==='eye_white'){ o.geometry.computeBoundingBox(); const c=o.geometry.boundingBox.getCenter(new THREE.Vector3()).multiply(o.scale).add(o.position); const k=o.scale.x*1.06;
      let lidMat=null; for(const q of head.children){ const qm=q.isMesh&&(Array.isArray(q.material)?q.material[0]:q.material); if(qm&&qm.name==='skin'&&q.geometry.attributes.position.count===142){ lidMat=qm; break; } }
      const cm=lidMat?lidMat.clone():new THREE.MeshStandardMaterial({color:'#4a2e22'}); cm.vertexColors=false; cm.color.multiplyScalar(0.82); cm.name='blink_cap'; cm.needsUpdate=true; if(cm.userData) cm.userData.presRim=true;
      const cap=new THREE.Mesh(PRES_CAP_GEO,cm); cap.name='blink'+side; cap.position.copy(c); cap.scale.set(PRES_EYE.rx*k,PRES_EYE.ry*k,PRES_EYE.ry*k); /* equal y and z radii: the cap turns about x and must stay outside the eyeball at every angle */ cap.rotation.x=PRES_CAP_OPEN; cap.castShadow=false; cap.receiveShadow=false; cap.frustumCulled=false; head.add(cap); s.caps[side]=cap; }
    else if(name==='iris'||name==='pupil'||name==='eye_hi'){ const e=s.eyes[side]||(s.eyes[side]={parts:[]}); e.parts.push({o,x:o.position.x,y:o.position.y,z:o.position.z,hi:name==='eye_hi'}); } }
  for(const b of [s.head,s.neck,s.spine1,s.spine2]) if(b){ s.base.set(b,b.quaternion.clone()); s.applied.set(b,b.quaternion.clone()); }
  g.presence=s; PRESENCE.actors++; }
function presBaseFor(mesh,kind){ let found=null; if(typeof HERO==='undefined'||!HERO.gltf) return null; HERO.gltf.scene.traverse(o=>{ if(found||!o.isMesh) return; if(presKind(o)!==kind) return; if(o.geometry.attributes.position.count!==mesh.geometry.attributes.position.count) return; if(kind!=='body'&&presSide(o)!==presSide(mesh)) return; if(o.geometry.attributes.color&&o.geometry.attributes.color.name==='presence') found=o.geometry; }); return found; }

/* rim light: a Fresnel term, strongest along the upper edges, tinted by the surface so dark skin keeps a warm edge */
/* the body skin: the rim plus a per-avatar stubble tint on the scalp (attribute from the bake, uniform from the hairstyle) */
function presSkinCompile(shader,renderer){ presRimCompile(shader); const u=(this&&this.userData&&this.userData.stubbleU)||{value:0}; shader.uniforms.presStubble=u;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float stubble; varying float vStubble;').replace('#include <color_vertex>','#include <color_vertex>\n\tvStubble=stubble;');
  shader.fragmentShader=shader.fragmentShader.replace('uniform vec3 diffuse;','uniform vec3 diffuse; uniform float presStubble; varying float vStubble;').replace('#include <color_fragment>','#include <color_fragment>\n\tdiffuseColor.rgb*=mix(vec3(1.0),vec3(0.74,0.72,0.72),clamp(presStubble*vStubble*0.55,0.0,1.0));'); }
function presRimCompile(shader){ shader.uniforms.presRim=PRESENCE.rimU; shader.fragmentShader=shader.fragmentShader.replace('uniform vec3 diffuse;','uniform vec3 diffuse; uniform float presRim;')
  .replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );','{ vec3 nv=normalize(vViewPosition); float f=1.0-clamp(dot(nv,normal),0.0,1.0); float rim=pow(f,3.5)*(0.3+0.7*clamp(normal.y*0.5+0.5,0.0,1.0)); outgoingLight+=vec3(1.0,0.88,0.74)*rim*presRim*min(diffuseColor.rgb*2.2+0.22,vec3(1.2)); }\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );'); }

/* ---- per frame, after the mixer ---- */
const PRES_Q=new THREE.Quaternion(), PRES_E=new THREE.Euler(), PRES_V=new THREE.Vector3(), PRES_V2=new THREE.Vector3();
function presCandidates(){ const now=performance.now(); if(now-PRESENCE.candT<250) return PRESENCE.cands; PRESENCE.candT=now; const c=[];
  if(typeof players!=='undefined') for(const p of players) if(p&&p.g) c.push(p.g);
  if(typeof npcs!=='undefined') for(const k in npcs) if(npcs[k].g&&npcs[k].g.visible) c.push(npcs[k].g);
  if(typeof walkers!=='undefined') for(const w of walkers) if(w.g&&w.g.visible) c.push(w.g);
  if(typeof vendors!=='undefined') for(const v of vendors) if(v.g&&v.g.visible) c.push(v.g);
  PRESENCE.cands=c; return c; }
function presHeadPos(g,out){ if(g.hero&&g.hero.head){ out.setFromMatrixPosition(g.hero.head.matrixWorld); if(out.lengthSq()>0) return out; } return out.set(g.position.x,g.position.y+1.55*(g.scale.y||1),g.position.z); }
function presBone(s,b,qx,qy){ if(!b) return; const cur=b.quaternion, app=s.applied.get(b), base=s.base.get(b);
  // if the mixer rewrote the bone this frame, that value is the new base; if it left our last value in place, start again from the stored base
  if(Math.abs(cur.x-app.x)>1e-7||Math.abs(cur.y-app.y)>1e-7||Math.abs(cur.z-app.z)>1e-7||Math.abs(cur.w-app.w)>1e-7) base.copy(cur);
  PRES_E.set(qx,qy,0,'YXZ'); PRES_Q.setFromEuler(PRES_E); cur.copy(base).multiply(PRES_Q); app.copy(cur); }
function presenceUpdate(g,dt,moving){ const s=g.presence; if(!s) return; dt=Math.max(0,Math.min(0.1,dt||0)); s.t+=dt; const inScene=(typeof scene!=='undefined')&&g.parent===scene;
  // glance target: the nearest other character in front, refreshed a few times a second
  if(PRESENCE.glance){ s.retarget-=dt; if(s.retarget<=0){ s.retarget=0.2+Math.random()*0.15; let best=null, bd=3.6*(g.scale.y||1);
      if(inScene){ for(const o of presCandidates()){ if(o===g||!o.isChar) continue; const d=Math.hypot(o.position.x-g.position.x,o.position.z-g.position.z); if(d>0.35&&d<bd){ bd=d; best=o; } } }
      if(best!==s.target){ if(best&&s.blink<0&&s.blinkT>0.4) s.blinkT=Math.min(s.blinkT,0.12); s.target=best; } }
    let tY=0, tP=0, has=false;
    if(s.target&&s.target.parent===scene){ presHeadPos(s.target,PRES_V); presHeadPos(g,PRES_V2); const dx=PRES_V.x-PRES_V2.x, dy=PRES_V.y-PRES_V2.y, dz=PRES_V.z-PRES_V2.z; const th=g.rotation.y; const lx=Math.cos(th)*dx-Math.sin(th)*dz, lz=Math.sin(th)*dx+Math.cos(th)*dz;
      const yaw=Math.atan2(lx,lz); if(Math.abs(yaw)<1.25){ tY=Math.max(-0.5,Math.min(0.5,yaw)); tP=Math.max(-0.3,Math.min(0.3,-Math.atan2(dy,Math.hypot(lx,lz)))); has=true; } }
    if(!has){ const k=moving?0.35:1; tY=k*(0.07*Math.sin(s.t*0.37+s.phase)+0.035*Math.sin(s.t*0.93+s.phase2)); tP=k*(0.03*Math.sin(s.t*0.53+s.phase2)+0.015*Math.sin(s.t*1.31+s.phase)); }
    s.tYaw=tY; s.tPitch=tP; const k=Math.min(1,dt*(has?5.5:2.5)); s.yaw+=(tY-s.yaw)*k; s.pitch+=(tP-s.pitch)*k; }
  // breathing: a slow rise through the upper spine, countered at the neck so the head stays level
  let bx1=0,bx2=0,bn=0; if(PRESENCE.breathe){ const amp=moving?0.004:0.011; const b=Math.sin(s.t*(Math.PI*2/3.8)+s.phase)*amp; bx1=b; bx2=b*0.7; bn=-b*0.9; }
  presBone(s,s.spine1,bx1,0); presBone(s,s.spine2,bx2,0); presBone(s,s.neck,bn+s.pitch*0.35,s.yaw*0.35); presBone(s,s.head,s.pitch*0.65,s.yaw*0.65);
  // blink
  let a=0; if(PRESENCE.blink){ s.blinkT-=dt; if(s.blink<0&&s.blinkT<=0){ s.blink=0; s.blinkT=2.2+Math.random()*4.5; if(Math.random()<0.12) s.blinkT=0.32; }
    if(s.blink>=0){ s.blink+=dt/s.blinkDur; if(s.blink>=1){ s.blink=-1; } else { a=s.blink<0.4?presSmooth(0,0.4,s.blink):1-presSmooth(0.4,1,s.blink); } }
    const rest=PRESENCE.lidRest||0; const aEff=rest+(1-rest)*a; for(const c of s.caps){ if(c) c.rotation.x=PRES_CAP_OPEN*(1-aEff); } }
  // eyes lead the head a little and dart now and then; the highlight dot hides while the lid covers the eye
  s.sacT-=dt; if(s.sacT<=0){ s.sacT=0.5+Math.random()*2.2; s.sacX=(Math.random()-0.5)*0.0026; s.sacY=(Math.random()-0.5)*0.0014; }
  const gx=Math.max(-0.0045,Math.min(0.0045,(s.tYaw-s.yaw)*0.012))+s.sacX, gy=Math.max(-0.002,Math.min(0.002,(s.tPitch-s.pitch)*-0.008))+s.sacY; const ke=Math.min(1,dt*18); s.gazeX+=(gx-s.gazeX)*ke; s.gazeY+=(gy-s.gazeY)*ke;
  for(const e of s.eyes){ if(!e) continue; for(const p of e.parts){ p.o.position.x=p.x+s.gazeX; p.o.position.y=p.y+s.gazeY; if(p.hi) p.o.visible=a<0.5; } } }

/* ---- hooks ---- */
const v25MakeHero=makeHeroAvatar;
makeHeroAvatar=function(look){ if(PRESENCE.on&&typeof HERO!=='undefined'&&HERO.state==='ready') presenceBakeBase(); const g=v25MakeHero(look); if(g&&PRESENCE.on) presenceSetup(g,look); return g; };
const v25Anim=animAvatar;
animAvatar=function(g,t,moving,carrying,speed,dt){ v25Anim(g,t,moving,carrying,speed,dt); if(g&&g.presence&&PRESENCE.on) presenceUpdate(g,typeof dt==='number'?dt:0.016,!!moving); };
function presenceStatusText(){ return PRESENCE.actors?` Presence: ${PRESENCE.actors} actors with baked skin shading, blinking and glances.`:''; }

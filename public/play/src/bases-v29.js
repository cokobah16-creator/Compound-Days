/* Compound Days v29: the two neutral bases on the new sculpt.
   The hero asset is now a signed-distance sculpt with a full body (head, neck, torso, arms, hands, legs, feet), skinned to
   the same 27-joint skeleton, carrying morph targets for Base A / Base B, the slim and fuller builds and the soft and
   angular faces. This module makes those morphs the creator's shape vocabulary, re-tunes the resident shape fields to
   the new proportions (the sculpt is half the old head's size), transfers every body displacement onto worn garments,
   hides body regions under the clothes that cover them, moves the creator cameras to the new head, adds the sofa
   sitting pose, and keeps the v28 starter outfit as the default. Saves and preset names are unchanged. */
'use strict';
const BASES29={on:!/[?&]bases=off\b/.test(location.search),coverThreshold:0.94,body:null,hash:null}; // only tight pieces (the shoes) hide the skin beneath; loose garments keep it
const SC=(typeof SCULPT29!=='undefined')?SCULPT29:null;
if(BASES29.on&&SC){
const LM=SC.landmarks; const HC=LM.headCentre; const HEADJ=SC.joints.Head;

/* ---------- the creator vocabulary: morph weights as shape fields (composed by creatorShape in presets-v26.js) ---------- */
if(typeof BODY_BASES!=='undefined'){
  BODY_BASES.find(b=>b.id==='base_a').shape={m_base_a:1}; BODY_BASES.find(b=>b.id==='base_b').shape={m_base_b:1};
  for(const b of BODY_BUILDS){ b.shape=b.id==='slim'?{m_slim:1}:b.id==='fuller'?{m_fuller:1}:{}; }
  for(const f of FACE_OPTIONS){ f.shape=f.id==='soft'?{m_soft:1}:f.id==='angular'?{m_angular:1}:{}; }
  for(const k of Object.keys(RESIDENT_SHAPES)) if(/^creator_/.test(k)) delete RESIDENT_SHAPES[k];
}
/* the named residents keep their fields; magnitudes were authored for a head twice this size */
if(typeof RESIDENT_SHAPES!=='undefined'){ for(const k in RESIDENT_SHAPES){ const s=RESIDENT_SHAPES[k]; if(s.chin) s.chin*=0.5; if(s.nose) s.nose*=0.8; } }

/* ---------- the hero body: neutral positions, morph deltas, a spatial hash for garment transfer ---------- */
function basesBody(){ if(BASES29.body) return BASES29.body; if(typeof HERO==='undefined'||!HERO.gltf) return null; let first=null; HERO.gltf.scene.traverse(o=>{ if(!first&&o.isSkinnedMesh&&o.geometry.morphAttributes&&o.geometry.morphAttributes.position&&o.userData&&o.userData.targetNames) first=o; }); if(!first) return null;
  const pos=first.geometry.attributes.position.array; const nrm=first.geometry.attributes.normal?first.geometry.attributes.normal.array:null; const names=first.userData.targetNames; const morphs={}; names.forEach((n,i)=>{ const a=first.geometry.morphAttributes.position[i]; if(a) morphs[n]=a.array; });
  const n=pos.length/3; const cell=0.02; const hash=new Map(); const key=(x,y,z)=>((Math.floor(x/cell)+512)*1024+(Math.floor(y/cell)+512))*1024+(Math.floor(z/cell)+512);
  for(let i=0;i<n;i++){ const k=key(pos[i*3],pos[i*3+1],pos[i*3+2]); let l=hash.get(k); if(!l){ l=[]; hash.set(k,l); } l.push(i); }
  const nearest=(x,y,z)=>{ let best=-1, bd=Infinity; const cx=Math.floor(x/cell), cy=Math.floor(y/cell), cz=Math.floor(z/cell); for(let r=0;r<=2&&best<0;r++){ for(let dx=-r;dx<=r;dx++) for(let dy=-r;dy<=r;dy++) for(let dz=-r;dz<=r;dz++){ if(Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz))!==r) continue; const l=hash.get(((cx+dx+512)*1024+(cy+dy+512))*1024+(cz+dz+512)); if(!l) continue; for(const i of l){ const d=(pos[i*3]-x)**2+(pos[i*3+1]-y)**2+(pos[i*3+2]-z)**2; if(d<bd){ bd=d; best=i; } } } } return best; };
  const around=(x,y,z,out)=>{ out.length=0; const cx=Math.floor(x/cell), cy=Math.floor(y/cell), cz=Math.floor(z/cell); for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++) for(let dz=-1;dz<=1;dz++){ const l=hash.get(((cx+dx+512)*1024+(cy+dy+512))*1024+(cz+dz+512)); if(l) for(const i of l) out.push(i); } return out; };
  BASES29.body={pos,nrm,n,morphs,nearest,around,disp:new Map()}; return BASES29.body; }

/* ---------- displacement of the body for a shape: morphs plus the resident fields, cached per shape id ---------- */
function basesSmooth(a,b,x){ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }
function basesBump(x,c,w){ const t=Math.abs(x-c)/w; return t>=1?0:0.5+0.5*Math.cos(t*Math.PI); }
function basesDisplacement(shape,shapeId){ const B=basesBody(); if(!B) return null; const id=shapeId||JSON.stringify(shape); if(B.disp.has(id)) return B.disp.get(id);
  const n=B.n, P=B.pos; const d=new Float32Array(n*3);
  for(const k in shape){ if(k.slice(0,2)!=='m_') continue; const m=B.morphs[k.slice(2)]; const w=shape[k]; if(!m||!w) continue; for(let i=0;i<d.length;i++) d[i]+=m[i]*w; }
  const jaw=shape.jaw||0, chin=shape.chin||0, faceLen=shape.faceLen||0, cheeks=shape.cheeks||0, nose=shape.nose||0, brow=shape.brow||0, belly=shape.belly||0, hips=shape.hips||0, chest=shape.chest||0, arms=shape.arms||0, shoulders=shape.shoulders||0;
  if(jaw||chin||faceLen||cheeks||nose||brow||belly||hips||chest||arms||shoulders){ const NT=LM.noseTip, MT=LM.mouth, BR=LM.brow;
    for(let i=0;i<n;i++){ const x0=P[i*3], y0=P[i*3+1], z0=P[i*3+2]; let x=x0, y=y0, z=z0; const ax=Math.abs(x);
      if(Math.hypot(x,y-HC[1],z-HC[2])<0.17){ // head
        if(faceLen){ const w=basesSmooth(-0.03,0.04,z); y=HC[1]+(y-HC[1])*(1+faceLen*w); }
        if(jaw){ const w=basesSmooth(1.645,1.585,y)*basesSmooth(-0.07,0.0,z); x*=1+jaw*w; }
        if(chin){ const w=basesSmooth(1.605,1.555,y)*basesSmooth(0.0,0.045,z); y-=chin*w*2; }
        if(cheeks){ const w=basesBump(ax,0.052,0.035)*basesBump(y,1.648,0.03)*basesSmooth(0.01,0.05,z); x+=Math.sign(x)*cheeks*w*0.5; z+=0.25*cheeks*w; }
        if(nose){ const dd=Math.hypot(x-NT[0],y-NT[1],z-NT[2]); const f=basesSmooth(0.03,0.01,dd); if(f>0){ const rootZ=NT[2]-0.025; x+=x*nose*f; z=rootZ+(z-rootZ)*(1+nose*f); } }
        if(brow){ const w=basesBump(y,BR[1],0.016)*basesSmooth(0.04,0.075,z)*basesSmooth(0.085,0.05,ax); z+=0.006*brow*w; }
      }
      if(ax<0.21&&y>0.86&&y<1.47){ // torso
        if(belly){ const w=basesBump(y,LM.abdY,0.14)*(0.55+0.45*basesSmooth(-0.04,0.03,z)); const r=Math.hypot(x,z)||1e-6; const dd=belly*w*0.6; x+=x/r*dd; z+=z/r*dd; }
        if(hips){ const w=basesBump(y,LM.pelvisY-0.02,0.13); x*=1+hips*w; z*=1+0.6*hips*w; }
        if(chest){ const w=basesBump(y,LM.chestY,0.08)*basesSmooth(-0.01,0.05,z); z+=chest*w*0.5; }
        if(shoulders&&y>1.38&&ax>0.05){ const w=basesBump(y,1.445,0.08)*basesSmooth(0.05,0.12,ax); x*=1+shoulders*w; }
      }
      if(arms&&ax>0.14&&y<1.47&&y>0.74){ const s=Math.sign(x); const cx=s*(0.185+(1.45-y)/0.54*0.09); const w=basesSmooth(1.47,1.40,y)*(0.5+0.5*basesSmooth(0.86,0.98,y)); const k=1+arms*w; x=cx+(x-cx)*k; z=z*k; }
      d[i*3]+=x-x0; d[i*3+1]+=y-y0; d[i*3+2]+=z-z0; } }
  // v31: replace the spherical torso bulges with continuous ribcage/waist planes.
  const aBase=!!shape.m_base_a||(!shape.m_base_b&&shape.earring!==false),full=shape.m_fuller?1:shape.m_slim?-1:0;
  const profile=[
    [.93,aBase?.173:.155,.100,.108],[1.00,aBase?.175:.160,.098,.110],
    [1.08,aBase?.124:.140,.086,.088],[1.17,aBase?.126:.146,.087,.085],
    [1.30,aBase?.149:.177,.094,.090],[1.40,aBase?.160:.180,.091,.082],
    [1.46,aBase?.145:.167,.069,.069],[1.49,aBase?.049:.057,.045,.045]
  ];
  const section=y=>{let k=0;for(let j=0;j<profile.length-1;j++)if(y>=profile[j][0])k=j;const p=profile[k],q=profile[k+1],t=basesSmooth(p[0],q[0],y),r=p.slice(1).map((x,j)=>(x+(q[j+1]-x)*t)*(1+full*.055));r[0]*=1+(shape.hips||0)*.45*basesBump(y,.99,.14);r[1]+=(shape.belly||0)*.30*basesBump(y,1.12,.18)+(shape.chest||0)*.15*basesBump(y,1.31,.14);return r;};
  for(let i=0;i<n;i++){
    const j=i*3,x=P[j]+d[j],y=P[j+1]+d[j+1],z=P[j+2]+d[j+2],ax=Math.abs(x);
    if(y>.935&&y<1.49&&ax<.205){
      const radii=section(y),theta=Math.atan2(x,z),s=Math.sin(theta),c=Math.cos(theta),depth=z>=0?radii[1]:radii[2];
      let r=1/Math.sqrt((s/radii[0])**2+(c/depth)**2),tx=s*r,tz=c*r;
      if(aBase&&z>0)tz+=.023*basesBump(Math.abs(tx),.060,.065)*basesBump(y,1.335,.090);
      const w=basesSmooth(.935,.975,y)*basesSmooth(1.49,1.465,y)*basesSmooth(.205,.165,ax);
      d[j]+=(tx-x)*w;d[j+2]+=(tz-z)*w;
    }
  }
  // Continuous upper-arm and forearm radii soften the unioned muscle spheres.
  const smoothArm=(x,y,z,sign)=>{
    const q=[x,y,z],root=[sign*.185,1.452,-.006],mid=[sign*.233,1.172,-.014],end=[sign*.275,.915,0],upper=y>1.172,a=upper?root:mid,b=upper?mid:end;
    const v=b.map((n,j)=>n-a[j]),len=v.reduce((s,n)=>s+n*n,0),t=Math.max(0,Math.min(1,q.reduce((s,n,j)=>s+(n-a[j])*v[j],0)/len));
    const centre=a.map((n,j)=>n+v[j]*t),rad=q.map((n,j)=>n-centre[j]),distance=Math.hypot(...rad)||1;
    const radius=upper?((aBase?.042:.050)*(1-t)+(aBase?.029:.033)*t):((aBase?.031:.036)*(1-t)+(aBase?.021:.024)*t);
    return centre.map((n,j)=>n+rad[j]/distance*radius*(1+full*.06));
  };
  for(let i=0;i<n;i++){
    const j=i*3,x=P[j]+d[j],y=P[j+1]+d[j+1],z=P[j+2]+d[j+2],ax=Math.abs(x);
    if(ax>.155&&y>.935&&y<1.49){
      const target=smoothArm(x,y,z,Math.sign(x)),w=basesSmooth(.155,.205,ax)*basesSmooth(.935,.99,y)*basesSmooth(1.49,1.43,y);
      d[j]+=(target[0]-x)*w;d[j+1]+=(target[1]-y)*w;d[j+2]+=(target[2]-z)*w;
    }
    if(ax<.20&&y>.18&&y<.89){
      const w=basesBump(y,.50,.17),cx=Math.sign(x)*.097,k=1-.09*w;
      d[j]+=(x-cx)*(k-1);d[j+2]+=z*(k-1);
    }
  }
  B.disp.set(id,d); return d; }

/* ---------- residentReshape: the body takes its displacement, everything skinned to it takes the nearest body vertex's ---------- */
function basesGeometryShell(geo){const out=new THREE.BufferGeometry();out.name=geo.name;out.attributes=Object.assign({},geo.attributes);out.index=geo.index;out.groups=geo.groups.map(g=>Object.assign({},g));out.drawRange=Object.assign({},geo.drawRange);out.userData=Object.assign({},geo.userData);out.morphAttributes={};return out;}
residentReshape=function(geo,shape,kind){ if(geo.attributes._cage32&&typeof cage32==='function')return cage32(geo,shape); const out=basesGeometryShell(geo); const B=basesBody(); const shapeKey=shape.__id||JSON.stringify(shape);
  const isBody=kind==='skin'&&geo.attributes.position.array.length===B?.pos.length;
  if(B&&isBody&&B.positionCache?.has(shapeKey)){
    out.setAttribute('position',B.positionCache.get(shapeKey));out.setAttribute('normal',B.normalCache.get(shapeKey));out.computeBoundingSphere();out.computeBoundingBox();return out;
  }
  out.setAttribute('position',geo.attributes.position.clone());out.deleteAttribute('normal');const P=out.attributes.position; const n=P.count; if(!B){out.computeVertexNormals();return out;}
  const d=basesDisplacement(shape,shape.__id); if(!d) return out; const arr=P.array;
  const bindIds=out.attributes._body_ids, bindWeights=out.attributes._body_weights,fitRest=out.attributes._fit_rest;
  if(bindIds&&bindWeights){
    // v30 garments retain their exact surface binding through every shape combination.
    // Avoid the nearest-vertex/push-out pass, which caused torn-looking edges.
    for(let i=0;i<n;i++) for(let k=0;k<3;k++){
      const j=Math.round(bindIds.array[i*3+k]), w=bindWeights.array[i*3+k];
      for(let axis=0;axis<3;axis++) arr[i*3+axis]+=d[j*3+axis]*w;
    }
    if(fitRest)for(let i=0;i<arr.length;i++)arr[i]-=fitRest.array[i];
  }
  else if(kind==='skin'&&arr.length===B.pos.length){ for(let i=0;i<arr.length;i++) arr[i]+=d[i]; }
  else { const GAP=0.006; for(let i=0;i<n;i++){ const x0=arr[i*3], y0=arr[i*3+1], z0=arr[i*3+2]; const j=B.nearest(x0,y0,z0); if(j<0) continue; let x=x0+d[j*3], y=y0+d[j*3+1], z=z0+d[j*3+2];
      // keep the garment outside the displaced skin: every body vertex within 2 cm is measured along its normal, and the worst one pushes
      if(B.nrm){ const cand=B.around(x0,y0,z0,BASES29._cand||(BASES29._cand=[])); let worst=GAP, wx=0,wy=0,wz=0; for(const q of cand){ const bx=B.pos[q*3]+d[q*3], by=B.pos[q*3+1]+d[q*3+1], bz=B.pos[q*3+2]+d[q*3+2]; const ddx=x-bx, ddy=y-by, ddz=z-bz; if(ddx*ddx+ddy*ddy+ddz*ddz>0.0006) continue; const nx=B.nrm[q*3], ny=B.nrm[q*3+1], nz=B.nrm[q*3+2]; const sd=ddx*nx+ddy*ny+ddz*nz; if(sd<worst){ worst=sd; wx=nx; wy=ny; wz=nz; } } if(worst<GAP){ const k=GAP-worst; x+=wx*k; y+=wy*k; z+=wz*k; } }
      arr[i*3]=x; arr[i*3+1]=y; arr[i*3+2]=z; } }
  P.needsUpdate=true;
  if(kind==='skin'&&arr.length===B.pos.length){
    // Recompute over the complete surface, so primitive boundaries share smooth normals.
    B.normalCache=B.normalCache||new Map(); const key=shape.__id||JSON.stringify(shape);
    let normal=B.normalCache.get(key);
    if(!normal){
      const indices=[]; HERO.gltf.scene.traverse(o=>{if(o.isSkinnedMesh&&o.userData.targetNames&&o.geometry.index) indices.push(...o.geometry.index.array);});
      const whole=new THREE.BufferGeometry();whole.setAttribute('position',P);whole.setIndex(indices);whole.computeVertexNormals();normal=whole.attributes.normal;B.normalCache.set(key,normal);
    }
    out.setAttribute('normal',normal);
    B.positionCache=B.positionCache||new Map();B.positionCache.set(shapeKey,P);
  } else out.computeVertexNormals();
  out.computeBoundingSphere(); out.computeBoundingBox(); return out; };
const v29ResidentGeometry=residentGeometry;
residentGeometry=function(geo,shape,shapeId,kind){ shape.__id=shapeId; return v29ResidentGeometry(geo,shape,shapeId,kind); };

/* ---------- residentApply on the new head: eye scaling about the measured eye centres, glasses, earring ---------- */
const EYE=SC.head.eyeHead; // head-space eye centre (x for the left eye)
residentApply=function(g,shapeId){ const shape=RESIDENT_SHAPES[shapeId]; if(!shape||!g||!g.hero) return g; const head=g.hero.bones&&g.hero.bones.head;
  g.traverse(o=>{ if(!o.isSkinnedMesh) return; const mats=Array.isArray(o.material)?o.material:[o.material]; const nm=mats.map(m=>m&&m.name||''); const kind=nm.includes('skin')?'skin':'garment'; o.geometry=residentGeometry(o.geometry,shape,shapeId,kind); });
  // Brow overlays follow the face morph; v30 projects the mouth directly onto the face.
  if(head){const B=basesBody(),d=basesDisplacement(shape,shapeId);
    for(const o of head.children){if(!o.isMesh||!/^face_brow/.test(o.name))continue;
      const key=shapeId+'|headOverlay|'+o.geometry.uuid;let geo=RES_CACHE.get(key);
      if(!geo){geo=o.geometry.clone();const p=geo.attributes.position;
        for(let i=0;i<p.count;i++){const j=B.nearest(p.getX(i)+o.position.x,p.getY(i)+o.position.y+HEADJ[1],p.getZ(i)+o.position.z+HEADJ[2]);if(j<0)continue;
          p.setXYZ(i,p.getX(i)+d[j*3],p.getY(i)+d[j*3+1],p.getZ(i)+d[j*3+2]+.0007);}
        geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();RES_CACHE.set(key,geo);
      }o.geometry=geo;
    }
  }
  if(head){ if(shape.eyes){ const s=1+shape.eyes*0.6; for(const o of head.children){ if(!o.isMesh||!o.geometry) continue; const m=Array.isArray(o.material)?o.material[0]:o.material; const name=m&&m.name||''; if(!/eye_white|iris|pupil|eye_hi/.test(name)&&!/^face_lash/.test(o.name)) continue; o.geometry.computeBoundingBox(); const c=o.geometry.boundingBox.getCenter(new THREE.Vector3()).add(o.position); for(const sx of [-1,1]){ const eye=new THREE.Vector3(sx*EYE[0],EYE[1],EYE[2]); if(c.distanceTo(eye)<0.02){ o.scale.multiplyScalar(s); o.position.copy(eye).multiplyScalar(1-s).add(o.position.clone().multiplyScalar(s)); } } } }
    if(shape.brow){ const s=1+Math.max(-0.5,Math.min(0.8,shape.brow))*0.6; for(const o of head.children){ if(!/^face_brow/.test(o.name)) continue; o.scale.y=s; } }
    if(shape.glasses){ head.add(basesGlasses(shape.glasses)); }
    if(shape.earring===false){ for(const o of head.children){ if(/^earring/.test(o.name)) o.visible=false; } } }
  if(shape.grey){ const grey=new THREE.Color('#9A9A96'); g.traverse(o=>{ if(o.isMesh&&/^wearhair_/.test(o.name)&&o.material&&/^hair/.test(o.material.name)){ o.material.color.lerp(grey,shape.grey*0.85); o.material.roughness=0.9; } }); }
  g.userData.residentShape=shapeId; return g; };
function basesGlasses(style){ const g=new THREE.Group(); g.name='glasses_'+style; const thin=style==='thin';
  const frame=new THREE.MeshStandardMaterial({color:thin?'#2A2422':'#C9A24A',metalness:thin?0.2:0.8,roughness:0.35,name:'glasses_frame'});
  const lens=new THREE.MeshStandardMaterial({color:'#DCE8F0',transparent:true,opacity:0.14,roughness:0.1,metalness:0,name:'glasses_lens',depthWrite:false});
  const eyeX=EYE[0], eyeY=EYE[1], eyeZ=EYE[2]+SC.head.lidR+0.004, R=thin?0.0195:0.022, tube=thin?0.0012:0.0018; const ear=SC.head.earHead;
  for(const sx of [-1,1]){ const ring=new THREE.Mesh(new THREE.TorusGeometry(R,tube,8,28),frame); ring.position.set(sx*eyeX,eyeY,eyeZ); g.add(ring); const l=new THREE.Mesh(new THREE.CircleGeometry(R-tube*0.5,24),lens); l.position.set(sx*eyeX,eyeY,eyeZ-0.001); g.add(l);
    const a=new THREE.Vector3(sx*(eyeX+R),eyeY+0.003,eyeZ-0.003), b=new THREE.Vector3(sx*(ear[0]+0.004),ear[1]+0.012,ear[2]+0.004); const len=a.distanceTo(b); const arm=new THREE.Mesh(new THREE.CylinderGeometry(tube*0.8,tube*0.8,len,6),frame); arm.position.copy(a).add(b).multiplyScalar(0.5); arm.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()); g.add(arm); }
  const bridge=new THREE.Mesh(new THREE.CylinderGeometry(tube*0.9,tube*0.9,eyeX*2-R*2+0.004,6),frame); bridge.position.set(0,eyeY+0.002,eyeZ); bridge.rotation.z=Math.PI/2; g.add(bridge);
  g.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=false; } }); return g; }

/* ---------- starter outfit (from v28): tank, shorts, cream sneakers; blue per base ---------- */
Object.assign(WARDROBE.outfits,{starter:['tank','shorts','sneakers']});
if(!OUTFITS.find(o=>o.id==='starter')) OUTFITS.unshift({id:'starter',name:'Starter: tank & shorts',c:'#3B57A8',c2:'#3B57A8'});
if(typeof OUTFIT_COLORS!=='undefined') OUTFIT_COLORS.starter={top:'#3B57A8',bottom:'#4A4A4F',shoe:'#EEE8DC',sole:'#D9D2C2'};
const v29LookColors=lookColors;
lookColors=function(look){ const c=v29LookColors(look); if(look.outfit==='starter'&&!(look.colors&&look.colors.top)){ c.top=look.bodyBase==='base_b'?'#2F49A8':'#3D5A9E'; c.bottom='#45454A'; } return c; };
const v29NewState=newState;
newState=function(){ const s=v29NewState(); if(s&&s.p) for(const p of s.p){ p.outfit='starter'; } return s; };

/* ---------- coverage: body regions under garments are hidden ---------- */
function basesCoverage(g){ if(typeof coverage32==='function'&&coverage32(g))return; const body=g.hero&&g.hero.body; if(!body||!body.parent) return; const group=body.parent; const regions=(body.userData&&body.userData.regions)||[]; if(!regions.length) return;
  const cover={}, hidden=new Set(); const names=(g.hero.wardrobe&&g.hero.wardrobe.garments)||[];
  for(const name of names){ const src=WARDROBE.cache[name]; if(!src) continue; const ex=wardrobeExtras(src); const c=ex.covers||{}; for(const r in c) cover[r]=Math.max(cover[r]||0,c[r]); for(const t of ex.hiddenBodyTriangles||[]) hidden.add(t.join(',')); }
  let regionIndex=0;
  for(const o of group.children){
    if(!o.isSkinnedMesh||!o.userData.targetNames) continue;
    const r=regions[regionIndex++];o.userData.region=r;o.visible=!((cover[r]||0)>=BASES29.coverThreshold);
    if(hidden.size&&o.geometry.index){
      const geo=basesGeometryShell(o.geometry), a=geo.index.array, indices=[];
      for(let i=0;i<a.length;i+=3) if(!hidden.has(a[i]+','+a[i+1]+','+a[i+2])) indices.push(a[i],a[i+1],a[i+2]);
      geo.setIndex(indices);o.geometry=geo;
    }
  }
  g.userData.coverage=cover;g.userData.maskedBodyTriangles=hidden.size;
  // Exact split triangles retain smooth exposed skin at garment hems and openings.
  const B=basesBody(),shape=RESIDENT_SHAPES[g.userData.residentShape],d=shape?basesDisplacement(shape,g.userData.residentShape):null;
  for(const name of names){const patch=wardrobeExtras(WARDROBE.cache[name])?.revealSkin;if(!patch?.vertices?.length)continue;
    const pos=[],normal=[],color=[],joint=[],weight=[],source=body.geometry.attributes;
    for(const v of patch.vertices){const ids=v[0],bary=v[1],p=[0,0,0],nr=[0,0,0],c=[0,0,0],influences=new Map();
      for(let k=0;k<3;k++){const id=ids[k],w=bary[k];for(let a=0;a<3;a++){
        p[a]+=(B.pos[id*3+a]+(d?d[id*3+a]:0))*w;
        nr[a]+=(source.normal?.array[id*3+a]||0)*w;
        c[a]+=(source.color?source.color.array[id*3+a]:1)*w;}
        for(let a=0;a<4;a++){const j=source.skinIndex.array[id*4+a],v=source.skinWeight.array[id*4+a]*w;influences.set(j,(influences.get(j)||0)+v);}}
      const pairs=[...influences].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=pairs.reduce((t,x)=>t+x[1],0)||1;
      while(pairs.length<4)pairs.push([0,0]);pos.push(...p);normal.push(...nr);color.push(...c);joint.push(...pairs.map(x=>x[0]));weight.push(...pairs.map(x=>x[1]/sum));
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normal,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(color,3));geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(joint,4));geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weight,4));geo.setIndex(patch.indices);geo.computeVertexNormals();
    const mesh=new THREE.SkinnedMesh(geo,body.material);mesh.name='skin_reveal_'+name;mesh.bind(body.skeleton,body.bindMatrix);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  }
}

/* ---------- blink cap material: the skin, slightly darker (the old lid meshes are gone) ---------- */
function basesCapMaterials(g){ let skin=null; g.traverse(o=>{ if(skin||!o.isSkinnedMesh) return; for(const m of (Array.isArray(o.material)?o.material:[o.material])) if(m&&m.name==='skin') skin=m; }); if(!skin) return;
  g.traverse(o=>{ if(!o.isMesh||!/^blink/.test(o.name)) return; const cm=skin.clone(); cm.vertexColors=false; cm.color.copy(skin.color).multiplyScalar(0.8); cm.name='blink_cap'; cm.onBeforeCompile=function(){}; cm.needsUpdate=true; o.material=cm; }); }

const v29MakeHero=makeHeroAvatar;
const BASE_SCALE={base_a:0.965,base_b:1.0};
makeHeroAvatar=function(look){ const g=v29MakeHero(look); if(!g) return g; try{ basesCoverage(g); basesCapMaterials(g); const sc=look&&look.bodyBase&&BASE_SCALE[look.bodyBase]; if(sc&&sc!==1) g.scale.setScalar(sc); }catch(e){ console.warn('[Compound Days] v29 base finish:',e); } return g; };

/* ---------- creator cameras: the head is where it is now ---------- */
if(typeof thumbRender==='function'){ const v29ThumbRender=thumbRender; const HEADY=HEADJ[1]+SC.head.centreHead[1];
  thumbRender=function(look,kind){ if(!thumbInit()) return null; if(kind==='hair'||kind==='headwear'||kind==='face'||kind==='beard'){ const g=makeAvatar(look); g.rotation.y=-0.35; THUMB.scene.add(g); THUMB.cam.position.set(0.16,HEADY+0.10,0.72); THUMB.cam.lookAt(0,HEADY-0.01,0); try{ animAvatar(g,0.4,false,false,0,0.016); }catch(e){} THUMB.r.render(THUMB.scene,THUMB.cam); const url=THUMB.r.domElement.toDataURL('image/png'); THUMB.scene.remove(g); return url; } return v29ThumbRender(look,kind); }; }

/* ---------- sitting: both players take the sofa while its panel is open ---------- */
const v29HeroClipName=heroClipName; heroClipName=function(n){ if(/^sit$/i.test(String(n||''))) return 'sit'; return v29HeroClipName(n); };
const v29AnimAvatar=animAvatar;
animAvatar=function(g,t,moving,carrying,speed,dt){ if(g&&g.sitting&&g.mixer&&g.actions&&g.actions.sit){ if(g.current!=='sit'){ const from=g.actions[g.current], to=g.actions.sit; to.enabled=true; to.setEffectiveTimeScale(1); to.setEffectiveWeight(1); to.time=0; to.play(); if(from) from.crossFadeTo(to,0.3,false); g.current='sit'; } const d=typeof dt==='number'?dt:0.016; g.mixer.update(Math.max(0,Math.min(0.1,d))); if(g.baseY!==undefined) g.position.y=g.baseY; return; } return v29AnimAvatar(g,t,moving,carrying,speed,dt); };

}
function basesStatusText(){ return (BASES29.on&&SC)?' Sculpt: v29 bases (morph targets, coverage, sitting).':' Sculpt: v29 asset without the base module (?bases=off).'; }

/* Compound Days v24: distinct residents on the shared skeleton.
   Every modelled person is built from the same sculpt; a resident "shape" now reshapes that sculpt per person,
   in bind pose, before skinning: jaw width, chin, face length, cheeks, nose, brow, eye size, belly, hips, chest,
   plus age cues (grey in the hair, glasses). Garments get the same body fields so clothes follow the body.
   Reshaped geometry is cached per asset and shape, so the six street walkers and seven sellers share copies. */
'use strict';

/* ---- the shapes: named neighbours, plus a pool for street walkers and market sellers ---- */
const RESIDENT_SHAPES={
  base:{},
  ada:     {jaw:-0.11,chin:-0.012,faceLen:-0.03,cheeks:0.010,nose:-0.07,brow:-0.15,eyes:0.06,belly:-0.02,hips:0.07,chest:0.03},
  tunde:   {earring:false,jaw:0.13,chin:0.010,faceLen:0.03,cheeks:-0.004,nose:0.10,brow:0.35,eyes:-0.03,belly:0.00,hips:-0.03,chest:0.05},
  bassey:  {earring:false,jaw:0.07,chin:0.006,faceLen:0.02,cheeks:-0.011,nose:0.12,brow:0.25,eyes:-0.04,belly:0.085,hips:0.03,chest:0.05,grey:0.75,glasses:'round'},
  nkechi:  {jaw:0.05,chin:-0.008,faceLen:-0.05,cheeks:0.016,nose:0.05,brow:0.0,eyes:0.02,belly:0.07,hips:0.13,chest:0.09,grey:0.3},
  oyelaran:{jaw:-0.05,chin:0.014,faceLen:0.05,cheeks:-0.008,nose:0.03,brow:0.1,eyes:0.0,belly:0.03,hips:0.06,chest:0.04,grey:0.5,glasses:'thin'},
  // street pool
  w1:{earring:false,jaw:0.09,chin:0.004,faceLen:0.0,cheeks:-0.006,nose:0.06,brow:0.3,eyes:-0.02,belly:0.04,hips:-0.02,chest:0.04},
  w2:{jaw:-0.08,chin:-0.006,faceLen:-0.02,cheeks:0.012,nose:-0.04,brow:-0.1,eyes:0.05,belly:-0.01,hips:0.09,chest:0.04},
  w3:{earring:false,jaw:0.03,chin:0.012,faceLen:0.04,cheeks:-0.010,nose:0.08,brow:0.2,eyes:-0.03,belly:0.11,hips:0.05,chest:0.06,grey:0.6,glasses:'thin'},
  w4:{jaw:-0.04,chin:-0.010,faceLen:-0.04,cheeks:0.014,nose:0.02,brow:0.0,eyes:0.04,belly:0.02,hips:0.11,chest:0.07},
  w5:{earring:false,jaw:0.12,chin:0.0,faceLen:0.02,cheeks:-0.002,nose:0.04,brow:0.4,eyes:-0.05,belly:-0.02,hips:-0.04,chest:0.02},
  w6:{jaw:0.0,chin:0.008,faceLen:0.0,cheeks:0.006,nose:0.09,brow:0.15,eyes:0.0,belly:0.06,hips:0.02,chest:0.03,grey:0.4,glasses:'round'}
};
const RESIDENT_POOL=['w1','w2','w3','w4','w5','w6'];
const RES_HC_Y=1.63;           // head centre height in the sculpt's bind pose
const RES_NOSE=[0,1.585,0.205]; // nose tip, measured on the sculpt
const RES_CACHE=new Map();

function resSmooth(a,b,x){ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }
function resBump(x,c,w){ const t=Math.abs(x-c)/w; return t>=1?0:0.5+0.5*Math.cos(t*Math.PI); }

/* reshape one geometry in bind pose; kind 'skin' gets face and body fields, 'garment' body fields only */
function residentReshape(geo,shape,kind){
  const out=geo.clone(); const P=out.attributes.position; const n=P.count;
  const jaw=shape.jaw||0, chin=shape.chin||0, faceLen=shape.faceLen||0, cheeks=shape.cheeks||0, nose=shape.nose||0, brow=shape.brow||0;
  const belly=shape.belly||0, hips=shape.hips||0, chest=shape.chest||0;
  const noseRootZ=RES_NOSE[2]-0.04;
  for(let i=0;i<n;i++){ let x=P.getX(i), y=P.getY(i), z=P.getZ(i);
    if(kind==='skin'){ const head=Math.hypot(x,y-RES_HC_Y,z)<0.32;
      if(head){
        // face length: the front of the head stretches or shortens about the head centre; the back stays
        if(faceLen){ const w=resSmooth(-0.06,0.08,z); y=RES_HC_Y+(y-RES_HC_Y)*(1+faceLen*w); }
        // jaw width: below the cheekbones, the lower face widens or narrows
        if(jaw){ const w=resSmooth(1.60,1.47,y)*resSmooth(-0.12,0.0,z); x*=1+jaw*w; }
        // chin: the front-bottom of the face drops or lifts
        if(chin){ const w=resSmooth(1.52,1.40,y)*resSmooth(0.0,0.09,z); y-=chin*w*4; }
        // cheeks: fullness in the region beside the nose, below the eyes
        if(cheeks){ const w=resBump(Math.abs(x),0.12,0.07)*resBump(y,1.565,0.055)*resSmooth(0.02,0.1,z); x+=Math.sign(x)*cheeks*w; z+=0.5*cheeks*w; }
        // nose: the tip region scales about the nose root
        if(nose){ const d=Math.hypot(x-RES_NOSE[0],y-RES_NOSE[1],z-RES_NOSE[2]); const f=resSmooth(0.05,0.018,d); if(f>0){ x+=x*nose*f; z=noseRootZ+(z-noseRootZ)*(1+nose*f); } }
        // brow ridge: the band above the eyes comes forward
        if(brow){ const w=resBump(y,1.685,0.03)*resSmooth(0.08,0.15,z)*resSmooth(0.17,0.1,Math.abs(x)); z+=0.012*brow*w; }
      }
    }
    const torso=Math.abs(x)<0.22&&y>0.66&&y<1.42;
    if(torso){
      if(belly){ const w=resBump(y,1.06,0.24)*(0.55+0.45*resSmooth(-0.08,0.06,z)); const r=Math.hypot(x,z)||1e-6; const d=belly*w; x+=x/r*d; z+=z/r*d; }
      if(hips){ const w=resBump(y,0.84,0.18); x*=1+hips*w; z*=1+0.6*hips*w; }
      if(chest){ const w=resBump(y,1.25,0.12)*resSmooth(-0.02,0.08,z); z+=chest*w*0.5; }
    }
    P.setXYZ(i,x,y,z); }
  P.needsUpdate=true; out.computeVertexNormals(); out.computeBoundingSphere(); out.computeBoundingBox(); return out;
}
function residentGeometry(geo,shape,shapeId,kind){ const key=shapeId+'|'+kind+'|'+geo.uuid; let g=RES_CACHE.get(key); if(!g){ g=residentReshape(geo,shape,kind); RES_CACHE.set(key,g); } return g; }

/* glasses, built in Head-joint space from the measured eye centres */
function residentGlasses(style){
  const g=new THREE.Group(); g.name='glasses_'+style; const thin=style==='thin';
  const frame=new THREE.MeshStandardMaterial({color:thin?'#2A2422':'#C9A24A',metalness:thin?0.2:0.8,roughness:0.35,name:'glasses_frame'});
  const lens=new THREE.MeshStandardMaterial({color:'#DCE8F0',transparent:true,opacity:0.14,roughness:0.1,metalness:0,name:'glasses_lens',depthWrite:false});
  const eyeY=0.207, eyeZ=0.176, eyeX=0.072, R=thin?0.021:0.024, tube=thin?0.0018:0.0026;
  for(const sx of [-1,1]){ const ring=new THREE.Mesh(new THREE.TorusGeometry(R,tube,8,28),frame); ring.position.set(sx*eyeX,eyeY,eyeZ); g.add(ring);
    const l=new THREE.Mesh(new THREE.CircleGeometry(R-tube*0.5,24),lens); l.position.set(sx*eyeX,eyeY,eyeZ-0.001); g.add(l);
    // arm from the outer rim back to the ear
    const a=new THREE.Vector3(sx*(eyeX+R),eyeY+0.004,eyeZ-0.004), b=new THREE.Vector3(sx*0.176,0.196,0.0); const len=a.distanceTo(b);
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(tube*0.8,tube*0.8,len,6),frame); arm.position.copy(a).add(b).multiplyScalar(0.5); arm.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()); g.add(arm); }
  const bridge=new THREE.Mesh(new THREE.CylinderGeometry(tube*0.9,tube*0.9,eyeX*2-R*2+0.004,6),frame); bridge.position.set(0,eyeY+0.003,eyeZ); bridge.rotation.z=Math.PI/2; g.add(bridge);
  g.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=false; } }); return g;
}

/* scale a mesh about a point in its parent's space (the head-space meshes sit at the head origin) */
function resScaleAbout(o,c,s){ o.scale.setScalar(s); o.position.set(c.x*(1-s),c.y*(1-s),c.z*(1-s)); }

/* apply a shape to a freshly built hero avatar */
function residentApply(g,shapeId){
  const shape=RESIDENT_SHAPES[shapeId]; if(!shape||!g||!g.hero) return g; const head=g.hero.bones&&g.hero.bones.head;
  g.traverse(o=>{ if(!o.isSkinnedMesh) return; const mats=Array.isArray(o.material)?o.material:[o.material]; const nm=mats.map(m=>m&&m.name||'');
    const kind=nm.includes('skin')||nm.includes('skin_dark')?'skin':'garment'; o.geometry=residentGeometry(o.geometry,shape,shapeId,kind); });
  if(head){
    // eyes: whites, irises, pupils, highlights, lids and lashes scale together about each eye centre
    if(shape.eyes){ const s=1+shape.eyes; for(const o of head.children){ if(!o.isMesh||!o.geometry) continue; const m=Array.isArray(o.material)?o.material[0]:o.material; const name=m&&m.name||''; if(!/eye|iris|pupil|skin|hair/.test(name)) continue; o.geometry.computeBoundingBox(); const c=o.geometry.boundingBox.getCenter(new THREE.Vector3()); for(const sx of [-1,1]){ const eye=new THREE.Vector3(sx*0.072,0.207,0.16); if(c.distanceTo(eye)<0.045&&!/brow/.test(o.name)) resScaleAbout(o,eye,s); } } }
    // brows: thicker or finer
    if(shape.brow){ const s=1+Math.max(-0.5,Math.min(0.8,shape.brow)); for(const o of head.children){ if(!/^face_brow/.test(o.name)) continue; o.geometry.computeBoundingBox(); const c=o.geometry.boundingBox.getCenter(new THREE.Vector3()); o.scale.set(1,s,1); o.position.y=c.y*(1-s); } }
    if(shape.glasses){ head.add(residentGlasses(shape.glasses)); }
    if(shape.earring===false){ for(const o of head.children){ if(/^earring/.test(o.name)) o.visible=false; } }
  }
  // grey in the hair for the older residents (the hair materials are per avatar)
  if(shape.grey){ const grey=new THREE.Color('#9A9A96'); g.traverse(o=>{ if(o.isMesh&&/^wearhair_/.test(o.name)&&o.material&&/^hair/.test(o.material.name)){ o.material.color.lerp(grey,shape.grey*0.85); o.material.roughness=0.9; } }); }
  g.userData.residentShape=shapeId; return g;
}

/* every hero build goes through here: look.shape picks the resident shape */
const v24MakeHero=makeHeroAvatar;
makeHeroAvatar=function(look){ const g=v24MakeHero(look); if(!g) return g; const id=look&&look.shape; if(id&&RESIDENT_SHAPES[id]) residentApply(g,id); return g; };

/* the named neighbours carry their shapes; walkers and sellers draw from the pool by key */
Object.assign(CAST.ada.look,{shape:'ada'}); Object.assign(CAST.tunde.look,{shape:'tunde'}); Object.assign(CAST.bassey.look,{shape:'bassey'}); Object.assign(CAST.nkechi.look,{shape:'nkechi'}); Object.assign(CAST.oyelaran.look,{shape:'oyelaran'});
const v24EnvPerson=envPerson;
envPerson=function(look,key){ let shape=look.shape; if(!shape&&!RESIDENT_SHAPES[key]){ let h=0; for(const ch of String(key)) h=(h*31+ch.charCodeAt(0))>>>0; shape=RESIDENT_POOL[h%RESIDENT_POOL.length]; } return v24EnvPerson(Object.assign({},look,{shape:shape||key}),key); };
function residentStatusText(){ const ids=new Set(); scene&&scene.traverse(o=>{ if(o.userData&&o.userData.residentShape) ids.add(o.userData.residentShape); }); return ids.size?` Residents: ${ids.size} distinct shapes in the scene.`:''; }

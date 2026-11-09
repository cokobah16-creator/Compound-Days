// Player 1 V56: turns Emeke's Meshy V56 pack (source/player1_v56/Player1_ALL_ANIMATIONS_MASTER.glb) into the game asset
// dist/assets/characters/player1-v56.glb.
//
//   cd tools/player1_v56 && npm install && node build.mjs            (writes the asset and prints a JSON report)
//
// What it does, in order:
//  1. Shirt patches: the generated texture maps a few small islands of torso-side triangles onto skin texels, which
//     shows as brown triangles through the T-shirt. Small skin-coloured islands that are surrounded by shirt are
//     given their own vertices with UVs on a clean shirt texel.
//  2. Clips: Meshy's own "Idle" is the bind A-pose, one frame, so the game's eight authored hero clips (idle, walk,
//     carry, carryLow, walkCarry, walkCarryLow, pick, wave from assets/characters/efe.gltf.json) are retargeted onto
//     the 24-joint Meshy skeleton: the Meshy rest pose is first swung bone by bone onto the hero's rest directions,
//     then each frame's world-space rotation change from the hero's rest is applied. Meshy's own walk replaces the
//     hero walk (legs and spine), time-stretched so one loop covers the game's STRIDE (1.3 m); walkCarry and
//     walkCarryLow take that walk's legs and the carry arms. Meshy's run is kept as "run".
//  3. Mobile: the mesh is simplified to about a third of its triangles (meshoptimizer), tangents are dropped, and
//     the three textures become WebP (EXT_texture_webp): colour 2048 px (the face is in it), normal 1024 px, metal/rough 512 px.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS, EXTTextureWebP} from '@gltf-transform/extensions';
import {weld, simplify, prune, dedup} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import {createRequire} from 'module';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';

const HERE=path.dirname(fileURLToPath(import.meta.url)), ROOT=path.resolve(HERE,'..','..');
const require=createRequire(import.meta.url);
const THREE=require(path.join(ROOT,'dist/assets/vendor/three-r128.min.js'));
const SRC=process.argv[2]||path.join(ROOT,'source/player1_v56/Player1_ALL_ANIMATIONS_MASTER.glb');
const HERO=path.join(ROOT,'dist/assets/characters/efe.gltf.json');
const OUT=process.argv[3]||path.join(ROOT,'dist/assets/characters/player1-v56.glb');
const STRIDE=1.3, FPS=30, SIMPLIFY_RATIO=+(process.env.RATIO||0.34), SIMPLIFY_ERROR=0.0015;
const report={};

const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc=await io.read(SRC);
const heroJson=JSON.parse(fs.readFileSync(HERO,'utf8'));
const heroDoc=await io.readJSON({json:heroJson,resources:{}}).catch(()=>null) || await (async()=>{
  // embedded data: URI buffer
  const buf=Buffer.from(heroJson.buffers[0].uri.split(',')[1],'base64'); const j=JSON.parse(JSON.stringify(heroJson)); j.buffers[0].uri='hero.bin';
  for(const im of j.images||[]) if(im.uri&&im.uri.startsWith('data:')){ const name='img'+Math.random().toString(36).slice(2)+'.png'; im._data=Buffer.from(im.uri.split(',')[1],'base64'); }
  const resources={'hero.bin':new Uint8Array(buf)}; for(const im of j.images||[]) if(im._data){ const n='i'+Object.keys(resources).length; resources[n]=new Uint8Array(im._data); im.uri=n; delete im._data; }
  return io.readJSON({json:j,resources});
})();
const R=doc.getRoot(), HR=heroDoc.getRoot();

/* ---------------- 1. shirt patches ---------------- */
const mat=R.listMaterials()[0], baseTex=mat.getBaseColorTexture();
const baseImg=await sharp(Buffer.from(baseTex.getImage())).raw().ensureAlpha().toBuffer({resolveWithObject:true});
function texel(u,v){ const W=baseImg.info.width,H=baseImg.info.height; const x=Math.min(W-1,Math.max(0,Math.floor((u-Math.floor(u))*W))), y=Math.min(H-1,Math.max(0,Math.floor((v-Math.floor(v))*H))); const i=(y*W+x)*4, d=baseImg.data; return [d[i],d[i+1],d[i+2]]; }
const isShirt=c=>c[0]>175&&c[1]>165&&c[2]>150&&Math.max(...c)-Math.min(...c)<45;
const isSkin=c=>c[0]>45&&c[0]<190&&c[0]>c[1]*1.15&&c[1]>c[2]*1.02&&c[0]-c[2]>25;
{
  const prim=R.listMeshes()[0].listPrimitives()[0];
  const P=prim.getAttribute('POSITION'), UV=prim.getAttribute('TEXCOORD_0'), I=prim.getIndices();
  const nT=I.getCount()/3, idx=I.getArray(), pos=P.getArray(), uv=UV.getArray();
  // welded position keys so triangles on either side of a UV seam are neighbours
  const key=i=>Math.round(pos[i*3]*2000)+','+Math.round(pos[i*3+1]*2000)+','+Math.round(pos[i*3+2]*2000);
  const vkey=new Array(P.getCount()); const keyId=new Map(); for(let i=0;i<P.getCount();i++){ const k=key(i); if(!keyId.has(k)) keyId.set(k,keyId.size); vkey[i]=keyId.get(k); }
  const cls=new Uint8Array(nT); // 1 skin, 2 shirt, 0 other
  for(let t=0;t<nT;t++){ let u=0,v=0; for(let k=0;k<3;k++){ u+=uv[idx[t*3+k]*2]/3; v+=uv[idx[t*3+k]*2+1]/3; } const c=texel(u,v); cls[t]=isSkin(c)?1:isShirt(c)?2:0; }
  const byV=new Map(); for(let t=0;t<nT;t++) for(let k=0;k<3;k++){ const kv=vkey[idx[t*3+k]]; if(!byV.has(kv)) byV.set(kv,[]); byV.get(kv).push(t); }
  const nb=t=>{ const s=new Set(); for(let k=0;k<3;k++) for(const o of byV.get(vkey[idx[t*3+k]])) if(o!==t) s.add(o); return s; };
  const seen=new Uint8Array(nT), fix=[], fixed=new Set(); let islands=0;
  // skin-coloured islands mostly ringed by shirt
  for(const [inIsland,minShirt] of [[c=>c===1,0.75]]){ seen.fill(0); for(const t of fix) seen[t]=1;
   for(let t=0;t<nT;t++){ if(!inIsland(cls[t])||seen[t]) continue; const comp=[t], ring=new Set(); seen[t]=1;
    for(let q=0;q<comp.length;q++) for(const o of nb(comp[q])){ if(inIsland(cls[o])&&!fixed.has(o)){ if(!seen[o]){ seen[o]=1; comp.push(o); } } else ring.add(o); }
    if(comp.length>600) continue; let shirt=0; for(const o of ring) if(cls[o]===2||fixed.has(o)) shirt++;
    if(ring.size&&shirt/ring.size>=minShirt){ islands++; fix.push(...comp); comp.forEach(x=>fixed.add(x)); } } }
  // and up to four rings of triangles around every patch that touch a non-shirt texel (their texels straddle the patch edge)
  const dirty=t=>{ if(cls[t]!==2) return true; for(const [a,b,g] of [[1,0,0],[0,1,0],[0,0,1],[.5,.5,0],[0,.5,.5],[.5,0,.5]]){ const u=a*uv[idx[t*3]*2]+b*uv[idx[t*3+1]*2]+g*uv[idx[t*3+2]*2], v=a*uv[idx[t*3]*2+1]+b*uv[idx[t*3+1]*2+1]+g*uv[idx[t*3+2]*2+1]; if(!isShirt(texel(u,v))) return true; } return false; };
  for(let ring=0;ring<4;ring++) for(const t of fix.slice()) for(const o of nb(t)) if(!fixed.has(o)&&dirty(o)){ fixed.add(o); fix.push(o); }
  // each patch triangle takes its texture from the nearest clean shirt triangle: its corners are projected into that
  // triangle's plane and given the UVs their barycentric coordinates there give (so the cotton weave and folds continue)
  const shirtT=[]; for(let t=0;t<nT;t++) if(cls[t]===2&&!fixed.has(t)) shirtT.push(t);
  const P3=i=>new THREE.Vector3(pos[i*3],pos[i*3+1],pos[i*3+2]);
  const cen=t=>P3(idx[t*3]).add(P3(idx[t*3+1])).add(P3(idx[t*3+2])).multiplyScalar(1/3);
  const shirtC=shirtT.map(cen); const newUV=new Map(); let maxReach=0, shrunk=0;
  for(const t of fix){ const c=cen(t); let best=-1,bd=1e9; for(let k=0;k<shirtT.length;k++){ const d=shirtC[k].distanceToSquared(c); if(d<bd){ bd=d; best=k; } }
    const s=shirtT[best]; maxReach=Math.max(maxReach,Math.sqrt(bd)); const tri=new THREE.Triangle(P3(idx[s*3]),P3(idx[s*3+1]),P3(idx[s*3+2])); const pl=tri.getPlane(new THREE.Plane());
    const uvs=[0,1,2].map(k=>{ const p=pl.projectPoint(P3(idx[t*3+k]),new THREE.Vector3()); const b=tri.getBarycoord(p,new THREE.Vector3());
      // stay close to the source triangle so a long extrapolation cannot run off its UV island
      const m=Math.min(b.x,b.y,b.z); if(m<-0.6){ const f=(1/3+0.6)/(1/3-m); b.set(1/3+(b.x-1/3)*f,1/3+(b.y-1/3)*f,1/3+(b.z-1/3)*f); }
      let u=0,v=0; [b.x,b.y,b.z].forEach((w,j)=>{ u+=w*uv[idx[s*3+j]*2]; v+=w*uv[idx[s*3+j]*2+1]; }); return [u,v]; });
    // if the projected UVs reach past the shirt island into skin texels, pull them towards the source triangle's centre
    const cu=[0,1].map(a=>(uv[idx[s*3]*2+a]+uv[idx[s*3+1]*2+a]+uv[idx[s*3+2]*2+a])/3);
    const clean=f=>{ const c=uvs.map(p=>[cu[0]+(p[0]-cu[0])*f,cu[1]+(p[1]-cu[1])*f]); for(const [a,b,g] of [[1,0,0],[0,1,0],[0,0,1],[.5,.5,0],[0,.5,.5],[.5,0,.5],[1/3,1/3,1/3],[.7,.15,.15],[.15,.7,.15],[.15,.15,.7]]){ const u=a*c[0][0]+b*c[1][0]+g*c[2][0], v=a*c[0][1]+b*c[1][1]+g*c[2][1]; for(let dx=-8;dx<=8;dx+=4) for(let dy=-8;dy<=8;dy+=4) if(!isShirt(texel(u+dx/2048,v+dy/2048))) return null; } return c; };
    let got=null, f=1; for(;f>0.001&&!(got=clean(f));f*=0.7); shrunk+=f<1?1:0;
    newUV.set(t,got||uvs.map(()=>cu.slice())); }
  if(fix.length){ // patch triangles get their own vertices (copies of the old ones) carrying the new UVs
    const sems=prim.listSemantics(); const n0=P.getCount(); const add=fix.length*3;
    for(const sem of sems){ const A=prim.getAttribute(sem), es=A.getElementSize(), arr=A.getArray(); const out=new arr.constructor((n0+add)*es); out.set(arr);
      let w=n0; for(const t of fix) for(let k=0;k<3;k++){ const src=idx[t*3+k]; for(let e=0;e<es;e++) out[w*es+e]=arr[src*es+e]; if(sem==='TEXCOORD_0'){ const nu=newUV.get(t)[k]; out[w*2]=nu[0]; out[w*2+1]=nu[1]; } w++; }
      A.setArray(out); }
    const nidx=new Uint32Array(idx.length); nidx.set(idx); let w=n0; for(const t of fix){ for(let k=0;k<3;k++) nidx[t*3+k]=w++; } I.setArray(nidx);
  }
  report.shirtPatches={islands,triangles:fix.length,shirtTriangles:shirtT.length,nearestShirtMaxM:+maxReach.toFixed(4),uvPulledIn:shrunk};
}

/* ---------------- 2. clips ---------------- */
const V3=THREE.Vector3, Q=THREE.Quaternion;
const MAP={Hips:'Hips',Spine:'Spine02',Spine1:'Spine01',Spine2:'Spine',Neck:'neck',Head:'Head',
  LeftShoulder:'LeftShoulder',LeftArm:'LeftArm',LeftForeArm:'LeftForeArm',LeftHand:'LeftHand',RightShoulder:'RightShoulder',RightArm:'RightArm',RightForeArm:'RightForeArm',RightHand:'RightHand',
  LeftUpLeg:'LeftUpLeg',LeftLeg:'LeftLeg',LeftFoot:'LeftFoot',LeftToeBase:'LeftToeBase',RightUpLeg:'RightUpLeg',RightLeg:'RightLeg',RightFoot:'RightFoot',RightToeBase:'RightToeBase'};
// which child gives a bone's direction (target child, source child); bones not listed keep their rest offset from the parent
const AIM={Spine02:['Spine01','Spine1'],Spine01:['Spine','Spine2'],Spine:['neck','Neck'],neck:['Head','Head'],Head:['head_end','HeadTop_End'],
  LeftShoulder:['LeftArm','LeftArm'],LeftArm:['LeftForeArm','LeftForeArm'],LeftForeArm:['LeftHand','LeftHand'],
  RightShoulder:['RightArm','RightArm'],RightArm:['RightForeArm','RightForeArm'],RightForeArm:['RightHand','RightHand'],
  LeftUpLeg:['LeftLeg','LeftLeg'],LeftLeg:['LeftFoot','LeftFoot'],LeftFoot:['LeftToeBase','LeftToeBase'],
  RightUpLeg:['RightLeg','RightLeg'],RightLeg:['RightFoot','RightFoot'],RightFoot:['RightToeBase','RightToeBase']};
const tNodes={}; R.listNodes().forEach(n=>tNodes[n.getName()]=n); const sNodes={}; HR.listNodes().forEach(n=>sNodes[n.getName()]=n);
const tParent=n=>R.listNodes().find(p=>p.listChildren().includes(n))||null; const sParent=n=>HR.listNodes().find(p=>p.listChildren().includes(n))||null;
const tBones=R.listSkins()[0].listJoints(); const tOrder=[]; (function walk(n){ if(tBones.includes(n)) tOrder.push(n); n.listChildren().forEach(walk); })(tNodes.Armature);
const q=a=>new Q(a[0],a[1],a[2],a[3]), v=a=>new V3(a[0],a[1],a[2]);
// world rotation of a node chain given local rotations
function worldRot(node,parentOf,localRot,stopAt){ let w=new Q(); const chain=[]; for(let n=node;n&&n!==stopAt;n=parentOf(n)) chain.unshift(n); for(const n of chain) w.multiply(localRot(n)); return w; }
const sRestW={}; for(const k in sNodes) sRestW[k]=worldRot(sNodes[k],sParent,n=>q(n.getRotation()));
const tRestW={}; for(const n of tOrder) tRestW[n.getName()]=worldRot(n,tParent,m=>q(m.getRotation()));
// aligned rest: swing each target bone so it points where the hero's bone points at rest
const tAlignW={};
for(const n of tOrder){ const name=n.getName(), par=tParent(n); const pW=tBones.includes(par)?tAlignW[par.getName()]:worldRot(par,tParent,m=>q(m.getRotation()));
  let w=pW.clone().multiply(q(n.getRotation()));
  const aim=AIM[name]; if(aim){ const tc=tNodes[aim[0]], sc=sNodes[aim[1]]; const sb=Object.keys(MAP).find(k=>MAP[k]===name);
    const dT=v(tc.getTranslation()).normalize().applyQuaternion(w), dS=v(sc.getTranslation()).normalize().applyQuaternion(sRestW[sb]);
    w=new Q().setFromUnitVectors(dT,dS).multiply(w); }
  tAlignW[name]=w; }
// sample a hero clip at time t: local rotation of every hero node (rest where the clip has no channel) and the Hips translation
function sampler(anim){ const ch={}; for(const c of anim.listChannels()){ const s=c.getSampler(); ch[c.getTargetNode().getName()+'.'+c.getTargetPath()]={t:s.getInput().getArray(),v:s.getOutput().getArray(),n:s.getOutput().getElementSize()}; }
  const at=(k,t,rest)=>{ const c=ch[k]; if(!c) return rest; const T=c.t; if(t<=T[0]) return Array.from(c.v.slice(0,c.n)); if(t>=T[T.length-1]) return Array.from(c.v.slice((T.length-1)*c.n,T.length*c.n));
    let i=0; while(T[i+1]<t) i++; const f=(t-T[i])/(T[i+1]-T[i]); const a=c.v.slice(i*c.n,i*c.n+c.n), b=c.v.slice((i+1)*c.n,(i+1)*c.n+c.n);
    if(c.n===4){ const o=new Q(); Q.slerpFlat(o_arr,0,a,0,b,0,f); return Array.from(o_arr); } return Array.from(a).map((x,j)=>x+(b[j]-x)*f); };
  const o_arr=[0,0,0,1]; let dur=0; for(const k in ch) dur=Math.max(dur,ch[k].t[ch[k].t.length-1]); return {at,dur,has:k=>!!ch[k]}; }
const tHipsRest=v(tNodes.Hips.getTranslation()), sHipsRest=v(sNodes.Hips.getTranslation());
const armScale=tNodes.Armature.getScale()[0]; // 0.01: Meshy's skeleton is in centimetres under a scaled root
const hipRatio=(tHipsRest.y*armScale)/sHipsRest.y;
function retargetPose(smp,t){ // -> {name: local quaternion} for mapped target bones, plus hips translation (target local units)
  const sW={}; const sLocal=n=>q(smp.at(n.getName()+'.rotation',t,n.getRotation()));
  for(const k in MAP) sW[k]=worldRot(sNodes[k],sParent,sLocal);
  const tW={}, out={};
  for(const n of tOrder){ const name=n.getName(), par=tParent(n); const pW=tBones.includes(par)?tW[par.getName()]:worldRot(par,tParent,m=>q(m.getRotation()));
    const sb=Object.keys(MAP).find(k=>MAP[k]===name);
    let w; if(sb){ const D=sW[sb].clone().multiply(sRestW[sb].clone().invert()); w=D.multiply(tAlignW[name].clone()); } else w=pW.clone().multiply(q(n.getRotation()));
    tW[name]=w; out[name]=pW.clone().invert().multiply(w).normalize(); }
  const sh=v(smp.at('Hips.translation',t,sNodes.Hips.getTranslation())); const d=sh.sub(sHipsRest).multiplyScalar(hipRatio/armScale);
  return {rot:out,hips:tHipsRest.clone().add(d)};
}
function addClip(name,frames,dur){ // frames: [{t, rot:{name:Q}, hips:V3}]
  const A=doc.createAnimation(name); const buf=R.listBuffers()[0]; const times=new Float32Array(frames.map(f=>f.t));
  const input=doc.createAccessor().setType('SCALAR').setArray(times).setBuffer(buf);
  for(const n of tOrder){ const name_=n.getName(); if(!(name_ in frames[0].rot)) continue; const arr=new Float32Array(frames.length*4); frames.forEach((f,i)=>{ const r=f.rot[name_]; if(i>0){ const p=frames[i-1].rot[name_]; if(p.dot(r)<0) r.set(-r.x,-r.y,-r.z,-r.w); } arr.set([r.x,r.y,r.z,r.w],i*4); });
    const s=doc.createAnimationSampler().setInput(input).setOutput(doc.createAccessor().setType('VEC4').setArray(arr).setBuffer(buf)).setInterpolation('LINEAR');
    A.addSampler(s).addChannel(doc.createAnimationChannel().setTargetNode(n).setTargetPath('rotation').setSampler(s)); }
  const harr=new Float32Array(frames.length*3); frames.forEach((f,i)=>harr.set([f.hips.x,f.hips.y,f.hips.z],i*3));
  const s=doc.createAnimationSampler().setInput(input).setOutput(doc.createAccessor().setType('VEC3').setArray(harr).setBuffer(buf)).setInterpolation('LINEAR');
  A.addSampler(s).addChannel(doc.createAnimationChannel().setTargetNode(tNodes.Hips).setTargetPath('translation').setSampler(s));
  return A; }
const heroClips={}; for(const a of HR.listAnimations()) heroClips[a.getName()]=sampler(a);
function retargetClip(name){ const smp=heroClips[name]; const n=Math.max(2,Math.round(smp.dur*FPS)+1); const frames=[]; for(let i=0;i<n;i++){ const t=smp.dur*i/(n-1); frames.push(Object.assign({t},retargetPose(smp,t))); } return frames; }
// Meshy's own walk: read it, find how far one loop travels, and stretch it so one loop is STRIDE of the game's clock
const meshyAnims={}; for(const a of R.listAnimations()) meshyAnims[a.getName()]=a;
function meshyFrames(anim){ const smp=sampler(anim); const T=anim.listChannels()[0].getSampler().getInput().getArray(); const t0=T[0];
  return Array.from(T).map(t=>{ const rot={}; for(const n of tOrder) rot[n.getName()]=q(smp.at(n.getName()+'.rotation',t,n.getRotation())); return {t:t-t0,rot,hips:v(smp.at('Hips.translation',t,n_hips))}; }); }
const n_hips=tNodes.Hips.getTranslation();
function footWorld(frame,foot){ // FK in metres
  const M=new THREE.Matrix4(), chain=[]; for(let n=tNodes[foot];n;n=tParent(n)) chain.unshift(n);
  for(const n of chain){ const r=frame.rot[n.getName()]||q(n.getRotation()); const tr=n.getName()==='Hips'?frame.hips:v(n.getTranslation()); M.multiply(new THREE.Matrix4().compose(tr,r,v(n.getScale()))); }
  return new V3().setFromMatrixPosition(M); }
const walkSrc=meshyFrames(meshyAnims.Walk), runSrc=meshyFrames(meshyAnims.Run);
function loopTravel(frames){ // in-place clip: the planted (lowest) foot slides backwards at walking speed
  let dist=0; for(let i=1;i<frames.length;i++){ const a=['LeftToeBase','RightToeBase'].map(f=>footWorld(frames[i-1],f)), b=['LeftToeBase','RightToeBase'].map(f=>footWorld(frames[i],f));
    const k=(a[0].y+b[0].y)<(a[1].y+b[1].y)?0:1; dist+=Math.max(0,a[k].z-b[k].z); }
  const dur=frames[frames.length-1].t; return {dist,dur}; }
const wt=loopTravel(walkSrc), rt=loopTravel(runSrc);
report.meshyWalk={loopSeconds:+wt.dur.toFixed(3),loopMetres:+wt.dist.toFixed(3)}; report.meshyRun={loopSeconds:+rt.dur.toFixed(3),loopMetres:+rt.dist.toFixed(3)};
const stretch=(frames,dur)=>{ const k=dur/frames[frames.length-1].t; return frames.map(f=>Object.assign({},f,{t:f.t*k})); };
const walk=stretch(walkSrc,wt.dist/STRIDE);
// the walk loop must close: copy the first pose to the end
walk[walk.length-1]=Object.assign({},walk[0],{t:walk[walk.length-1].t});
const run=stretch(runSrc,rt.dist/STRIDE); run[run.length-1]=Object.assign({},run[0],{t:run[run.length-1].t});
// the upper body of a carry pose over the walk's legs
const ARMS=new Set(['LeftShoulder','LeftArm','LeftForeArm','LeftHand','RightShoulder','RightArm','RightForeArm','RightHand']);
function carryWalk(carryName){ const smp=heroClips[carryName]; const cd=smp.dur; return walk.map(f=>{ const p=retargetPose(smp,(f.t/walk[walk.length-1].t*cd)%cd||0); const rot=Object.assign({},f.rot); for(const k of ARMS) rot[k]=p.rot[k]; return {t:f.t,rot,hips:f.hips}; }); }
for(const a of R.listAnimations()) a.dispose();
// carrying: Player 1's arms are longer than the hero's, so the retargeted hands cross in front of the chest; swing both
// upper arms outwards about the vertical until the hands are as far apart as the hero's (carried things fit between them)
function boneWorld(frame,name){ const M=new THREE.Matrix4(), chain=[]; for(let n=tNodes[name];n;n=tParent(n)) chain.unshift(n);
  for(const n of chain){ const r=frame.rot[n.getName()]||q(n.getRotation()); const tr=n.getName()==='Hips'?frame.hips:v(n.getTranslation()); M.multiply(new THREE.Matrix4().compose(tr,r,v(n.getScale()))); }
  return new V3().setFromMatrixPosition(M); }
function heroHandGap(name,t){ const smp=heroClips[name]; const w=k=>{ const M=new THREE.Matrix4(), chain=[]; for(let n=sNodes[k];n;n=sParent(n)) chain.unshift(n);
  for(const n of chain){ const r=q(smp.at(n.getName()+'.rotation',t,n.getRotation())); const tr=v(smp.at(n.getName()+'.translation',t,n.getTranslation())); M.multiply(new THREE.Matrix4().compose(tr,r,v(n.getScale()))); }
  return new V3().setFromMatrixPosition(M); }; return w('LeftHand').distanceTo(w('RightHand')); }
const armW=(frame,name)=>{ let w=new Q(); const chain=[]; for(let n=tNodes[name];n;n=tParent(n)) chain.unshift(n); for(const n of chain) w.multiply(frame.rot[n.getName()]||q(n.getRotation())); return w; };
function spreadHands(frames,gap){ let maxTh=0; for(const f of frames){ const base={L:f.rot.LeftArm.clone(),R:f.rot.RightArm.clone()};
  const pW={L:armW(f,'LeftShoulder'),R:armW(f,'RightShoulder')};
  const set=th=>{ for(const [side,sg] of [['L',1],['R',-1]]){ const W=pW[side].clone().multiply(base[side]); const Wn=new Q().setFromAxisAngle(new V3(0,1,0),sg*th).multiply(W); f.rot[side==='L'?'LeftArm':'RightArm']=pW[side].clone().invert().multiply(Wn).normalize(); } };
  const sep=()=>boneWorld(f,'LeftHand').distanceTo(boneWorld(f,'RightHand'));
  if(sep()>=gap) continue; let lo=0,hi=0.9; for(let i=0;i<24;i++){ const m=(lo+hi)/2; set(m); if(sep()<gap) lo=m; else hi=m; } set(hi); maxTh=Math.max(maxTh,hi); }
  return +maxTh.toFixed(3); }
const gaps={carry:heroHandGap('carry',0),carryLow:heroHandGap('carryLow',0)};
const clips={idle:retargetClip('idle'),walk,carry:retargetClip('carry'),carryLow:retargetClip('carryLow'),walkCarry:carryWalk('carry'),walkCarryLow:carryWalk('carryLow'),pick:retargetClip('pick'),wave:retargetClip('wave'),run};
report.carrySpread={}; for(const [k,g] of [['carry','carry'],['carryLow','carryLow'],['walkCarry','carry'],['walkCarryLow','carryLow']]) report.carrySpread[k]={heroHandGapM:+gaps[g].toFixed(3),armSwingRad:spreadHands(clips[k],gaps[g])};

/* ---------------- 2b. the hero's skeleton convention ----------------
   Meshy's skeleton sits under a 0.01-scaled root, in centimetres, with every joint's axes along its bone. The game's
   modules (kit, carried things, seat and reach IK, caps and trays on the head) work in the hero's convention: metres,
   and every joint's axes aligned with the figure's at rest. So the joints are re-rested: same positions, identity
   rotations, translations in metres, inverse binds rebuilt to match, and every clip re-expressed (the deformation is
   unchanged: a joint's skinning matrix is the same before and after). Joints take the hero's names. */
const RENAME={Spine02:'Spine',Spine01:'Spine1',Spine:'Spine2',neck:'Neck',head_end:'HeadTop_End',headfront:'HeadFront'};
const oldRestM={}; for(const n of tOrder){ const M=new THREE.Matrix4(), chain=[]; for(let m=n;m;m=tParent(m)) chain.unshift(m);
  for(const m of chain) M.multiply(new THREE.Matrix4().compose(v(m.getTranslation()),q(m.getRotation()),v(m.getScale()))); oldRestM[n.getName()]=M; }
const jointPos={}; for(const k in oldRestM) jointPos[k]=new V3().setFromMatrixPosition(oldRestM[k]);
function rerest(frame){ const W={}, rot={}; for(const n of tOrder){ const name=n.getName(), par=tParent(n);
    const lw=(tBones.includes(par)?W[par.getName()]:new Q()).clone().multiply(frame.rot[name]||q(n.getRotation())); W[name]=lw; }
  const W2={}; for(const n of tOrder){ const name=n.getName(); W2[name]=W[name].clone().multiply(tRestW[name].clone().invert()); }
  for(const n of tOrder){ const name=n.getName(), par=tParent(n); const pw=tBones.includes(par)?W2[par.getName()]:new Q(); rot[name]=pw.clone().invert().multiply(W2[name]).normalize(); }
  return {t:frame.t,rot,hips:frame.hips.clone().multiplyScalar(armScale)}; }
for(const k in clips) clips[k]=clips[k].map(rerest);
// rebuild the nodes: a plain root, joints at their rest positions in metres
const arm=tNodes.Armature, scn=R.listScenes()[0]; const root=doc.createNode('Player1V56'); scn.addChild(root);
for(const c of arm.listChildren()){ arm.removeChild(c); root.addChild(c); } scn.removeChild(arm); arm.dispose();
for(const n of tOrder){ const name=n.getName(), par=tParent(n); const pp=tBones.includes(par)?jointPos[par.getName()]:new V3();
  const d=jointPos[name].clone().sub(pp); n.setTranslation([d.x,d.y,d.z]).setRotation([0,0,0,1]).setScale([1,1,1]); }
// unbound leaf joints (head_end, headfront) keep their place; every node else under the root stays at identity
const skin=R.listSkins()[0]; const ibm=new Float32Array(tBones.length*16);
tBones.forEach((b,i)=>{ const p=jointPos[b.getName()]; ibm.set(new THREE.Matrix4().makeTranslation(-p.x,-p.y,-p.z).elements,i*16); });
skin.getInverseBindMatrices().setArray(ibm); skin.setSkeleton(tNodes.Hips);
// where the game's head pieces (kit hats, the hair mount's space) sit: the hero's mapping, moved to this head's crown
let crown=-1; { const P=R.listMeshes()[0].listPrimitives()[0].getAttribute('POSITION'); for(let i=0;i<P.getCount();i++) crown=Math.max(crown,P.getElement(i,[])[1]); }
const headJ=jointPos.Head; const heroHM=heroJson.nodes.find(n=>n.extras&&n.extras.hairMount).extras; const heroCrownGap=1.775-heroHM.headCentre[1];
root.setExtras({hairMount:Object.assign({},heroHM.hairMount,{y:+(crown-heroCrownGap-headJ.y).toFixed(4)}),headCentre:[0,+(crown-heroCrownGap).toFixed(4),heroHM.headCentre[2]],crown:+crown.toFixed(4),
  player1v56:{tool:'tools/player1_v56/build.mjs',source:'source/player1_v56/Player1_ALL_ANIMATIONS_MASTER.glb (Meshy 7.1, Emeke\'s V56 pack)',clips:Object.keys(clips)}});
for(const k in clips) addClip(k,clips[k]);
for(const n of tOrder) if(RENAME[n.getName()]) n.setName(RENAME[n.getName()]);
report.skeleton={joints:tBones.map(b=>b.getName()),headJointY:+headJ.y.toFixed(4),crown:+crown.toFixed(4)};
report.clips=Object.fromEntries(Object.entries(clips).map(([k,f])=>[k,{frames:f.length,seconds:+f[f.length-1].t.toFixed(3)}]));

/* ---------------- 3. mobile ---------------- */
const prim=R.listMeshes()[0].listPrimitives()[0];
report.before={triangles:prim.getIndices().getCount()/3,vertices:prim.getAttribute('POSITION').getCount()};
prim.setAttribute('TANGENT',null);
await MeshoptSimplifier.ready;
await doc.transform(weld(), simplify({simplifier:MeshoptSimplifier,ratio:SIMPLIFY_RATIO,error:SIMPLIFY_ERROR,lockBorder:false}), dedup(), prune());
report.after={triangles:prim.getIndices().getCount()/3,vertices:prim.getAttribute('POSITION').getCount()};
mat.setName('player1_v56');
const texSize={[baseTex.getName()]:1024};
for(const t of R.listTextures()){
  const role=t===mat.getBaseColorTexture()?'color':t===mat.getNormalTexture()?'normal':'metalRough'; const px=role==='metalRough'?512:role==='color'?2048:1024;
  const out=await sharp(Buffer.from(t.getImage())).resize(px,px).webp({quality:role==='normal'?90:82}).toBuffer();
  t.setImage(new Uint8Array(out)).setMimeType('image/webp').setURI(''); t.setName('player1_v56_'+role);
}
doc.createExtension(EXTTextureWebP).setRequired(true);
await io.write(OUT,doc);
report.bytes=fs.statSync(OUT).size; report.out=path.relative(ROOT,OUT);
console.log(JSON.stringify(report,null,1));

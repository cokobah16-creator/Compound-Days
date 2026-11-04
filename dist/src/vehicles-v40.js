/* v40 vehicles: the keke and the danfo as the owner drew them ("this is what the keke and bus should look like in game").
   Low-poly, flat-shaded, softly bevelled, warm and toy-like: warm yellow bodies, chocolate-brown roof trim and chassis, a cream-yellow roof
   top, muted teal windows and curtains, cream round headlights, black tyres with grey hubs, small teal mirrors and the names in cream raised
   letters ("KEKE" on the panels beside the passenger bench, both sides; "DANFO" on the bus's street side).
   How it sits on the base (index.html, never edited):
   - the keke is the global 'keke' Group made by buildAmbient(); after the original runs, its six meshes are reshaped in place (same group,
     position, dir and rotation, so updateAmbient, evening-v35, football-v37 and the harnesses' own stand-in kekes are untouched). Front
     faces +x as before; the body stays inside 1.6 long x 1.1 wide x 1.4 tall.
   - the danfo is the anonymous Group at (16,0,9.3) made by buildWorld(); after the (wrapped) buildWorld runs, its seven meshes are reshaped
     in place. Its collision box addObs(13.8,18.2,8.2,10.4,'danfo') is not touched (nothing here calls box(), cyl(), addObs() or
     noteContact()); every part stays inside that box; the body keeps its north face at z 8.3 so the 'A KINDER LAGOS' sign (wallSign at
     z 8.22) still sits on it, and the wheels' tops (0.74) clear the sign's lower edge (0.75).
   Same objects, same counts, same random stream: each base child mesh is kept and refilled (its own BufferGeometry gets new attributes and
   it takes the one shared vertex-coloured material), so the scene's object, mesh and draw-call counts are what they were (keke 6, danfo
   7). No new Object3D, BufferGeometry or Material is made while the game builds: three.js gives each of those a uuid from Math.random,
   which would shift the game's (and the harnesses' seeded) random stream, so the parts are generated as plain triangle arrays and the one
   material is made when this file loads. Each mesh bakes many parts (positions, rotations, flat normals, a colour per vertex): body,
   roof, glass and trim, and one mesh per wheel (the wheel meshes sit at the wheel centres). No textures, so no canvas and no web font: the
   letters are raised strokes in the same geometry, and read the same in the Node harness and the browser.
   No Math.random, no clock. Every load-time read of a base name is typeof-guarded (subset loads of the harness copies still work). */
'use strict';
const VEH40={
 // colours chosen on screen in the game's light against the owner's two pictures (default 15.4 h, 10 h and 12.5 h): the keke's yellow
 // (yellow, with its lighter and darker shades) and the danfo's (busYellow) each read as close to their pictures as the first restyle's
 // or closer at every time; roofBrown on the tops, roofEdge on the steep faces of the roof slab and the keke's roof trim
 C:{yellow:'#F4AE54',yellowLt:'#F7B863',yellowDk:'#DD963F',busYellow:'#E6A856',brown:'#68381F',roofBrown:'#8F5A43',roofEdge:'#9C623B',brownDk:'#5A3420',roofTop:'#F2BD74',
  teal:'#2E6E6C',tealDk:'#245857',cream:'#F3E7C9',letter:'#F6EEDB',tyre:'#3A3533',hub:'#8A8680',post:'#3B2A1F',seat:'#8A4626',
  red:'#C4432E',orange:'#E8892A',grille:'#4A2E1E'},
 // the one shared material, made at load (see above); vertex colours carry every part's colour
 mat:typeof THREE!=='undefined'?new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true}):null,
 built:{keke:0,danfo:0},stats:{},err:null};
if(VEH40.mat)VEH40.mat.name='vehicles40';

/* ---------- raw primitives: flat arrays of triangle corners [x,y,z, x,y,z, x,y,z, ...], wound outward ---------- */
// orient a triangle outward from the shape's centre (every primitive here is convex around its origin)
function veh40Tri(out,p,q,s){const ux=q[0]-p[0],uy=q[1]-p[1],uz=q[2]-p[2],wx=s[0]-p[0],wy=s[1]-p[1],wz=s[2]-p[2];const nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx;
 if(nx*(p[0]+q[0]+s[0])+ny*(p[1]+q[1]+s[1])+nz*(p[2]+q[2]+s[2])<0)out.push(...p,...s,...q);else out.push(...p,...q,...s);}
function veh40Quad(out,p,q,s,t){veh40Tri(out,p,q,s);veh40Tri(out,p,s,t);}
// a box with chamfered edges (w x h x d, bevel r), centred on the origin: 6 faces, 12 bevels, 8 corner triangles
function veh40BevTris(w,h,d,r){const a=w/2,b=h/2,c=d/2,o=[];r=Math.max(0,Math.min(r,a*0.95,b*0.95,c*0.95));
 for(const sx of [-1,1])veh40Quad(o,[sx*a,-(b-r),-(c-r)],[sx*a,b-r,-(c-r)],[sx*a,b-r,c-r],[sx*a,-(b-r),c-r]);
 for(const sy of [-1,1])veh40Quad(o,[-(a-r),sy*b,-(c-r)],[a-r,sy*b,-(c-r)],[a-r,sy*b,c-r],[-(a-r),sy*b,c-r]);
 for(const sz of [-1,1])veh40Quad(o,[-(a-r),-(b-r),sz*c],[a-r,-(b-r),sz*c],[a-r,b-r,sz*c],[-(a-r),b-r,sz*c]);
 if(r>0){for(const sx of [-1,1])for(const sy of [-1,1])veh40Quad(o,[sx*a,sy*(b-r),-(c-r)],[sx*(a-r),sy*b,-(c-r)],[sx*(a-r),sy*b,c-r],[sx*a,sy*(b-r),c-r]);
  for(const sx of [-1,1])for(const sz of [-1,1])veh40Quad(o,[sx*a,-(b-r),sz*(c-r)],[sx*(a-r),-(b-r),sz*c],[sx*(a-r),b-r,sz*c],[sx*a,b-r,sz*(c-r)]);
  for(const sy of [-1,1])for(const sz of [-1,1])veh40Quad(o,[-(a-r),sy*b,sz*(c-r)],[-(a-r),sy*(b-r),sz*c],[a-r,sy*(b-r),sz*c],[a-r,sy*b,sz*(c-r)]);
  for(const sx of [-1,1])for(const sy of [-1,1])for(const sz of [-1,1])veh40Tri(o,[sx*a,sy*(b-r),sz*(c-r)],[sx*(a-r),sy*b,sz*(c-r)],[sx*(a-r),sy*(b-r),sz*c]);}
 return o;}
// a cylinder along y (radius top rt, bottom rb, height h, seg sides), optionally a sector from t0 over tl radians, capped
function veh40CylTris(rt,rb,h,seg,t0,tl){const o=[],H=h/2;t0=t0||0;tl=tl===undefined?Math.PI*2:tl;
 for(let i=0;i<seg;i++){const a=t0+tl*i/seg,b=t0+tl*(i+1)/seg,ta=[rt*Math.sin(a),H,rt*Math.cos(a)],tb=[rt*Math.sin(b),H,rt*Math.cos(b)],ba=[rb*Math.sin(a),-H,rb*Math.cos(a)],bb=[rb*Math.sin(b),-H,rb*Math.cos(b)];
  veh40Quad(o,ta,ba,bb,tb);veh40Tri(o,[0,H,0],ta,tb);veh40Tri(o,[0,-H,0],ba,bb);}
 return o;}
// a low-poly ball
function veh40BallTris(r,seg,rings){const o=[],P=(i,j)=>{const th=Math.PI*j/rings,ph=2*Math.PI*i/seg;return [r*Math.sin(th)*Math.sin(ph),r*Math.cos(th),r*Math.sin(th)*Math.cos(ph)];};
 for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){const a=P(i,j),b=P(i+1,j),c=P(i+1,j+1),d=P(i,j+1);if(j>0)veh40Tri(o,a,d,b);if(j<rings-1)veh40Tri(o,b,d,c);}
 return o;}
// a convex outline [[u,v],...] with softened corners: each corner gets radius r[k] in seg[k] straight steps (1 = a chamfer, 2 = a rounder
// two-step bevel); corners in order bottom-left, bottom-right, top-right, top-left of the box u1..u2, v1..v2
function veh40Outline(u1,u2,v1,v2,r,seg){const o=[],C=[[u1,v1,Math.PI],[u2,v1,Math.PI*1.5],[u2,v2,0],[u1,v2,Math.PI/2]];
 C.forEach(([u,v,a0],k)=>{const rr=r[k]||0,n=rr>0?(seg[k]||1):0,cu=u+(k===0||k===3?rr:-rr),cv=v+(k<2?rr:-rr);
  if(!n){o.push([u,v]);return;}for(let i=0;i<=n;i++){const a=a0+Math.PI/2*i/n;o.push([cu+rr*Math.cos(a),cv+rr*Math.sin(a)]);}});
 return o;}
// a convex outline in the x-y plane extruded along z (depth d), every edge round the two caps chamfered by r; centred on the outline's
// vertex average, which is returned (cu, cv) so the caller can place it
function veh40PrismTris(pts,d,r){let n=pts.length,cu=0,cv=0;for(const p of pts){cu+=p[0]/n;cv+=p[1]/n;}let P=pts.map(p=>[p[0]-cu,p[1]-cv]);
 let A=0;for(let i=0;i<n;i++){const p=P[i],q=P[(i+1)%n];A+=p[0]*q[1]-q[0]*p[1];}if(A<0)P=P.reverse();
 const c=d/2,o=[];r=Math.max(0,Math.min(r,c*0.95));
 const I=P.map((p,i)=>{const a=P[(i-1+n)%n],b=P[(i+1)%n];let e1=[p[0]-a[0],p[1]-a[1]],e2=[b[0]-p[0],b[1]-p[1]];const l1=Math.hypot(...e1),l2=Math.hypot(...e2);
  const n1=[-e1[1]/l1,e1[0]/l1],n2=[-e2[1]/l2,e2[0]/l2],k=r/(1+n1[0]*n2[0]+n1[1]*n2[1]);return [p[0]+k*(n1[0]+n2[0]),p[1]+k*(n1[1]+n2[1])];});
 for(const s of [-1,1]){for(let i=1;i+1<n;i++)veh40Tri(o,[I[0][0],I[0][1],s*c],[I[i][0],I[i][1],s*c],[I[i+1][0],I[i+1][1],s*c]);
  if(r>0)for(let i=0;i<n;i++){const j=(i+1)%n;veh40Quad(o,[P[i][0],P[i][1],s*(c-r)],[P[j][0],P[j][1],s*(c-r)],[I[j][0],I[j][1],s*c],[I[i][0],I[i][1],s*c]);}}
 for(let i=0;i<n;i++){const j=(i+1)%n;veh40Quad(o,[P[i][0],P[i][1],-(c-r)],[P[j][0],P[j][1],-(c-r)],[P[j][0],P[j][1],c-r],[P[i][0],P[i][1],c-r]);}
 return {tris:o,cu,cv};}

/* ---------- bags: one per base child mesh; parts are baked into the bag in the group's frame (or a wheel's centre) ---------- */
const veh40M=typeof THREE!=='undefined'?{m:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(),s:new THREE.Vector3(),v:new THREE.Vector3(),
 a:new THREE.Vector3(),b:new THREE.Vector3(),d:new THREE.Vector3(),col:new THREE.Color(),col2:new THREE.Color(),y:new THREE.Vector3(0,1,0),u:new THREE.Vector3(),w:new THREE.Vector3(),x:new THREE.Vector3()}:null;
function veh40Bag(name,at){return {name,at:at||[0,0,0],p:[],n:[],c:[]};}
// add triangles at pos [x,y,z] (group frame), rotation [rx,ry,rz] (XYZ), scale [sx,sy,sz]; normals made flat, one colour, or with hex
// given as [main, edge] the main colour on the faces that look up or down (|ny| >= 0.6) and the edge colour on the steep ones
function veh40Add(bag,tris,hex,pos,rot,scl){const M=veh40M;M.e.set(rot?rot[0]:0,rot?rot[1]:0,rot?rot[2]:0);M.q.setFromEuler(M.e);M.s.set(scl?scl[0]:1,scl?scl[1]:1,scl?scl[2]:1);
 M.m.compose(M.v.set(pos[0]-bag.at[0],pos[1]-bag.at[1],pos[2]-bag.at[2]),M.q,M.s);const two=Array.isArray(hex);M.col.set(two?hex[0]:hex);M.col2.set(two?hex[1]:hex);
 for(let i=0;i+8<tris.length;i+=9){M.a.set(tris[i],tris[i+1],tris[i+2]).applyMatrix4(M.m);M.b.set(tris[i+3],tris[i+4],tris[i+5]).applyMatrix4(M.m);M.d.set(tris[i+6],tris[i+7],tris[i+8]).applyMatrix4(M.m);
  const ux=M.b.x-M.a.x,uy=M.b.y-M.a.y,uz=M.b.z-M.a.z,wx=M.d.x-M.a.x,wy=M.d.y-M.a.y,wz=M.d.z-M.a.z;let nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx;const l=Math.hypot(nx,ny,nz);if(l<1e-12)continue;nx/=l;ny/=l;nz/=l;
  const k=Math.abs(ny)>=0.6?M.col:M.col2;for(const v of [M.a,M.b,M.d]){bag.p.push(v.x,v.y,v.z);bag.n.push(nx,ny,nz);bag.c.push(k.r,k.g,k.b);}}}
// a bevelled box from its extents: x1..x2, y1..y2, z1..z2
function veh40Box(bag,hex,x1,x2,y1,y2,z1,z2,r,rot){veh40Add(bag,veh40BevTris(x2-x1,y2-y1,z2-z1,r===undefined?0.02:r),hex,[(x1+x2)/2,(y1+y2)/2,(z1+z2)/2],rot);}
// a softened prism: the outline pts is given in the side (x-y) plane and runs w1..w2 across z (axis 'z'), or in the end (z-y) plane and
// runs w1..w2 along x (axis 'x')
function veh40Prism(bag,hex,pts,axis,w1,w2,r){if(axis==='x'){const k=veh40PrismTris(pts.map(([z,y])=>[-z,y]),w2-w1,r);veh40Add(bag,k.tris,hex,[(w1+w2)/2,k.cv,-k.cu],[0,Math.PI/2,0]);}
 else{const k=veh40PrismTris(pts,w2-w1,r);veh40Add(bag,k.tris,hex,[k.cu,k.cv,(w1+w2)/2]);}}
// a wheel in its own bag (the bag's centre is the wheel's): tyre (axis z) with a grey hub on its outer face(s); side -1, 1 or 0 (both)
function veh40Wheel(bag,rad,wid,side,seg){const C=VEH40.C,c=bag.at;seg=seg||12;
 veh40Add(bag,veh40CylTris(rad,rad,wid,seg),C.tyre,c,[Math.PI/2,0,0]);
 veh40Add(bag,veh40CylTris(rad*0.78,rad*0.78,wid+0.02,seg),C.tyre,c,[Math.PI/2,0,0]);
 for(const s of side?[side]:[-1,1])veh40Add(bag,veh40CylTris(rad*0.36,rad*0.46,0.035,seg),C.hub,[c[0],c[1],c[2]+s*(wid/2+0.012)],[s*Math.PI/2,0,0]);}
// a rod (thin box) from point A to point B, thickness t
function veh40Rod(bag,hex,A,B,t){const M=veh40M,dx=B[0]-A[0],dy=B[1]-A[1],dz=B[2]-A[2],L=Math.hypot(dx,dy,dz);if(L<1e-9)return;
 M.q.setFromUnitVectors(M.y,M.u.set(dx/L,dy/L,dz/L));const e=new THREE.Euler().setFromQuaternion(M.q);
 veh40Add(bag,veh40BevTris(t,L,t,t*0.25),hex,[(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2],[e.x,e.y,e.z]);}
/* raised block letters: strokes in a 0.6 x 1 cell, centre-line segments */
const VEH40_GLYPH={
 K:[[0.06,0,0.06,1],[0.12,0.42,0.56,1],[0.24,0.56,0.58,0]],
 E:[[0.06,0,0.06,1],[0.06,0.94,0.54,0.94],[0.06,0.5,0.46,0.5],[0.06,0.06,0.54,0.06]],
 D:[[0.06,0,0.06,1],[0.06,0.94,0.36,0.94],[0.36,0.94,0.54,0.74],[0.54,0.74,0.54,0.26],[0.54,0.26,0.36,0.06],[0.36,0.06,0.06,0.06]],
 A:[[0.03,0,0.3,1],[0.3,1,0.57,0],[0.14,0.36,0.46,0.36]],
 N:[[0.06,0,0.06,1],[0.06,1,0.54,0],[0.54,0,0.54,1]],
 F:[[0.06,0,0.06,1],[0.06,0.94,0.56,0.94],[0.06,0.52,0.46,0.52]],
 O:[[0.06,0.26,0.06,0.74],[0.06,0.74,0.24,0.94],[0.24,0.94,0.36,0.94],[0.36,0.94,0.54,0.74],[0.54,0.74,0.54,0.26],[0.54,0.26,0.36,0.06],[0.36,0.06,0.24,0.06],[0.24,0.06,0.06,0.26]]};
// text centred at c, reading along unit 'right', up 'up', standing out along 'out' by depth; letter height h
function veh40Text(bag,text,c,right,up,out,h,depth,hex){const M=veh40M,adv=0.82,t=0.2,W=(text.length*adv-0.2)*h;
 for(let k=0;k<text.length;k++){const G=VEH40_GLYPH[text[k]];if(!G)continue;const ox=-W/2+k*adv*h;
  for(const [x1,y1,x2,y2] of G){const P=(x,y,o)=>[c[0]+right[0]*(ox+x*h)+up[0]*((y-0.5)*h)+out[0]*o,c[1]+right[1]*(ox+x*h)+up[1]*((y-0.5)*h)+out[1]*o,c[2]+right[2]*(ox+x*h)+up[2]*((y-0.5)*h)+out[2]*o];
   const A=P(x1,y1,depth/2),B=P(x2,y2,depth/2),L=Math.hypot(B[0]-A[0],B[1]-A[1],B[2]-A[2]),ex=t*h/2/Math.max(L,1e-9);
   const A2=[A[0]-(B[0]-A[0])*ex,A[1]-(B[1]-A[1])*ex,A[2]-(B[2]-A[2])*ex],B2=[B[0]+(B[0]-A[0])*ex,B[1]+(B[1]-A[1])*ex,B[2]+(B[2]-A[2])*ex];
   // the stroke: a box t*h wide (across the page), its length along the stroke, depth deep (out of the panel)
   const dx=B2[0]-A2[0],dy=B2[1]-A2[1],dz=B2[2]-A2[2],LL=Math.hypot(dx,dy,dz);M.u.set(dx/LL,dy/LL,dz/LL);M.w.set(out[0],out[1],out[2]);M.x.crossVectors(M.u,M.w).normalize();
   M.m.makeBasis(M.x,M.u,M.w);const e=new THREE.Euler().setFromRotationMatrix(M.m);
   veh40Add(bag,veh40BevTris(t*h,LL,depth,t*h*0.2),hex,[(A2[0]+B2[0])/2,(A2[1]+B2[1])/2,(A2[2]+B2[2])/2],[e.x,e.y,e.z]);}}}

/* ---------- filling the base's meshes in place ---------- */
// each child mesh i of grp takes bag i: its own geometry is emptied and refilled, it takes the shared material, and it moves to the bag's
// centre. If the group is not the shape the base builds (another module changed it), the children are replaced instead (that path makes
// new objects, and is recorded in VEH40.stats).
function veh40Fill(grp,bags){const ok=grp.children.length===bags.length&&grp.children.every(o=>o&&o.isMesh&&o.geometry&&o.geometry.isBufferGeometry);let tris=0;
 if(!ok){for(const ch of grp.children.slice())grp.remove(ch);for(const b of bags)grp.add(new THREE.Mesh(new THREE.BufferGeometry(),VEH40.mat));}
 bags.forEach((b,i)=>{const m=grp.children[i],g=m.geometry;g.setIndex(null);for(const k of Object.keys(g.attributes))g.deleteAttribute(k);g.morphAttributes={};g.clearGroups();
  g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));
  g.type='BufferGeometry';delete g.parameters;g.computeBoundingBox();g.computeBoundingSphere();
  m.material=VEH40.mat;m.name=b.name;m.position.set(b.at[0],b.at[1],b.at[2]);m.rotation.set(0,0,0);m.scale.set(1,1,1);m.castShadow=true;m.receiveShadow=true;tris+=b.p.length/9;});
 return {meshes:bags.length,inPlace:ok,tris};}

/* ---------- the keke (front +x, ground y 0; inside x -0.8..0.8, z -0.555..0.555, y 0..1.4) ---------- */
// the base's children: [0] body box, [1] roof box, [2..4] wheels (-0.5,-0.55), (-0.5,0.55), (0.7,0), [5] seat box
function buildKeke40(){const C=VEH40.C,body=veh40Bag('keke40_body'),roof=veh40Bag('keke40_roof'),chas=veh40Bag('keke40_chassis'),
 w0=veh40Bag('keke40_wheel_rl',[-0.5,0.23,-0.465]),w1=veh40Bag('keke40_wheel_rr',[-0.5,0.23,0.465]),w2=veh40Bag('keke40_wheel_f',[0.55,0.22,0]);
 // wheels, large for the body: two at the back outside the tub, under the ledge; one at the front under the nose, open to view below it
 veh40Wheel(w0,0.23,0.12,-1);veh40Wheel(w1,0.23,0.12,1);veh40Wheel(w2,0.22,0.11,0);
 // chassis: the dark floor plank (stopping short of the front wheel) and the two long low chassis bars that run from behind the back
 // wheels past the front wheel, each ending in a short bumper block either side of it that rises from the bar (it never drops below
 // the bar, so it does not read as a foot); nothing crosses in front of the wheel
 veh40Box(chas,C.brownDk,-0.66,0.3,0.2,0.3,-0.36,0.36,0.02);
 for(const s of [-1,1]){veh40Box(chas,C.brownDk,-0.72,0.72,0.15,0.23,s*0.26-0.035,s*0.26+0.035,0.015);
  veh40Box(chas,C.brownDk,0.68,0.79,0.15,0.29,s*0.26-0.045,s*0.26+0.045,0.02);}
 // the rear tub under the bench (narrower than the wheel track), its ledge over the back wheels with black mudguards, tail lights
 veh40Box(body,C.yellow,-0.79,-0.14,0.3,0.74,-0.4,0.4,0.05);
 veh40Box(body,C.yellow,-0.8,-0.22,0.47,0.56,-0.55,0.55,0.035);
 for(const s of [-1,1]){veh40Add(body,veh40CylTris(0.13,0.13,0.15,10,Math.PI/2,Math.PI),C.tyre,[-0.5,0.56,s*0.47],[Math.PI/2,0,0],[1,1,0.5]);
  veh40Box(body,C.red,-0.8,-0.775,0.6,0.7,s*0.3-0.05,s*0.3+0.05,0.008);}
 // the lettered side panels beside the passenger bench, standing on the ledge ("KEKE" in cream raised letters, reading left to right)
 for(const s of [-1,1]){veh40Box(body,C.yellowLt,-0.79,-0.27,0.56,0.94,s*0.5-0.025,s*0.5+0.025,0.02);
  veh40Text(body,'KEKE',[-0.53,0.75,s*0.525],[s,0,0],[0,1,0],[0,0,s],0.105,0.014,C.letter);}
 // the passenger bench: brown back, yellow cushion; the driver's yellow seat back in front of it
 veh40Box(chas,C.seat,-0.78,-0.68,0.6,1.04,-0.42,0.42,0.025);veh40Box(chas,C.yellowDk,-0.7,-0.3,0.66,0.75,-0.42,0.42,0.025);
 veh40Box(body,C.yellow,-0.17,-0.07,0.6,0.96,-0.3,0.3,0.03);
 // the driver's cowl, and the rounded nose that reaches forward over the front wheel, sloping down to the one round headlight at its tip
 veh40Box(body,C.yellow,-0.18,0.32,0.3,0.66,-0.36,0.36,0.06);
 veh40Prism(body,C.yellow,[[0.16,0.46],[0.62,0.46],[0.71,0.51],[0.74,0.58],[0.69,0.645],[0.5,0.69],[0.16,0.7]],'z',-0.24,0.24,0.09);
 veh40Add(body,veh40BallTris(0.075,8,5),C.cream,[0.725,0.585,0]);
 // the brown step board along each side, behind the front wheel, and a handrail
 veh40Box(chas,C.brown,-0.14,0.3,0.33,0.4,-0.5,0.5,0.02);
 for(const s of [-1,1])veh40Rod(chas,C.brownDk,[-0.27,0.8,s*0.45],[0.22,0.72,s*0.42],0.03);
 // the roof posts: thin and dark; the front pair leans back from the nose
 for(const s of [-1,1]){veh40Rod(roof,C.post,[-0.74,0.74,s*0.47],[-0.74,1.3,s*0.5],0.035);veh40Rod(roof,C.post,[-0.12,0.66,s*0.36],[-0.1,1.3,s*0.5],0.03);
  veh40Rod(roof,C.post,[0.32,0.66,s*0.26],[0.46,1.3,s*0.47],0.035);}
 // the roof: chocolate trim (its steep sides in the lighter roofEdge brown, as the lit edge band reads in the pictures) with the cream-yellow
 // top set in
 veh40Box(roof,[C.roofBrown,C.roofEdge],-0.8,0.8,1.29,1.36,-0.55,0.55,0.03);veh40Box(roof,C.roofTop,-0.74,0.74,1.355,1.4,-0.49,0.49,0.02);
 // the teal side curtains hanging from the roof edge between the middle and front posts, with a darker fold
 for(const s of [-1,1]){veh40Box(roof,C.teal,0.04,0.43,0.76,1.29,s*0.5-0.008,s*0.5+0.008,0.006,[0,s*0.06,0]);
  veh40Box(roof,C.tealDk,0.12,0.19,0.92,1.29,s*0.505-0.008,s*0.505+0.008,0.004,[0,0,0.12]);}
 // mirrors on stalks, teal
 for(const s of [-1,1]){veh40Rod(roof,C.post,[0.42,1.0,s*0.42],[0.46,1.04,s*0.51],0.018);veh40Box(roof,C.teal,0.43,0.49,0.98,1.1,s*0.528-0.02,s*0.528+0.02,0.01);}
 return [body,roof,w0,w1,w2,chas];}

/* ---------- the danfo (front +x, ground y 0; body 4.2 x 2.0, every part inside the base's 4.4 x 2.2 collision box) ---------- */
// the base's children: [0] body box, [1] dark band box, [2] window box, [3..6] wheels (-1.4,1.1), (1.4,1.1), (-1.4,-1.1), (1.4,-1.1).
// Ours: [0] the body with its windows, trim, letters, lower nose and back; [1] the roof and rails; [2] the front end only, x 1.8 to 2.2
// (windscreen, visor, mirrors, grille, lights); [3..6] the wheels. (Kept so because bench-v36 check 32 casts rays at these meshes before
// any render, while their world matrices still leave them at the origin: like the base's body and band, only [0] and [1] lie on those
// rays, so its hit counts are unchanged.)
function buildDanfo40(){const C=VEH40.C,b=veh40Bag('danfo40_body'),roof=veh40Bag('danfo40_roof'),gl=veh40Bag('danfo40_front'),
 W=[[-1.38,1],[1.48,1],[-1.38,-1],[1.48,-1]].map(([x,s],i)=>veh40Bag('danfo40_wheel'+i,[x,0.37,s*0.93]));
 // wheels: four, sitting proud of the body so their faces show; their tops clear the sign's lower edge (y 0.75); the front pair sits
 // under the cab, behind the stepped nose
 W.forEach((w,i)=>veh40Wheel(w,0.37,0.26,i<2?1:-1,14));
 // chassis and skirt
 veh40Box(b,C.brownDk,-2.1,2.08,0.36,0.6,-0.96,0.96,0.04);
 // the long yellow box, its front (the cab, with the windscreen) set back to x 1.8; softened edges all round
 veh40Prism(b,C.busYellow,veh40Outline(-1.0,1.0,0.52,2.06,[0.05,0.05,0.07,0.07],[1,1,1,1]),'x',-2.1,1.8,0.13);
 // the stepped lower nose standing out in front of the cab, its top edge rounded in two steps
 veh40Prism(b,C.busYellow,veh40Outline(1.6,2.12,0.52,1.34,[0.03,0.06,0.2,0],[1,1,2,0]),'z',-1.0,1.0,0.1);
 // the brown belt line under the windows (back to the cab), and the lower band along the cab section above the front wheel
 veh40Box(b,C.brown,-2.12,1.72,1.37,1.45,-1.02,1.02,0.02);
 for(const s of [-1,1])veh40Box(b,C.brown,1.24,1.86,0.94,1.02,s*1.0-0.02,s*1.0+0.02,0.01);
 // four teal side windows each side, the door window and the cab window; the north side the same (the base's sign sits below them)
 for(const s of [-1,1]){
  for(const x of [-1.62,-0.97,-0.32,0.33])veh40Box(b,C.teal,x-0.27,x+0.27,1.52,1.96,s*1.0-0.015,s*1.0+0.015,0.015);
  veh40Box(b,C.teal,0.71,1.15,1.52,1.96,s*1.0-0.015,s*1.0+0.015,0.015);
  veh40Box(b,C.teal,1.28,1.64,1.52,1.94,s*1.0-0.015,s*1.0+0.015,0.015);}
 // the door outline (street side): thin dark strips, a handle, and the brown side step under it, ending before the front tyre
 const zs=1.012;
 veh40Box(b,C.brownDk,0.64,0.67,0.6,2.0,zs-0.008,zs+0.008,0.003);veh40Box(b,C.brownDk,1.19,1.22,0.6,2.0,zs-0.008,zs+0.008,0.003);
 veh40Box(b,C.brownDk,0.64,1.22,1.985,2.01,zs-0.008,zs+0.008,0.003);
 veh40Box(b,C.hub,0.7,0.8,1.1,1.14,1.0,1.03,0.006);
 veh40Box(b,C.brown,0.54,1.07,0.42,0.5,0.98,1.09,0.015);
 // "DANFO" in cream raised letters on the street side, between the rear wheel and the door
 veh40Text(b,'DANFO',[-0.38,1.0,1.0],[1,0,0],[0,1,0],[0,0,1],0.24,0.022,C.letter);
 // front, on the set-back cab: a two-pane teal windscreen under a brown visor, teal mirrors on stalks at the cab's corners
 for(const s of [-1,1]){veh40Box(gl,C.teal,1.8,1.83,1.5,1.93,s*0.45-0.38,s*0.45+0.38,0.015);
  veh40Rod(gl,C.post,[1.79,1.74,s*0.97],[1.92,1.7,s*1.05],0.022);veh40Box(gl,C.teal,1.9,1.96,1.52,1.74,s*1.06-0.03,s*1.06+0.03,0.012);}
 veh40Box(gl,C.brown,1.8,1.95,1.94,2.03,-0.86,0.86,0.025);
 // on the nose's face: the dark grille between round cream headlights on the corners, an orange indicator beside each (inboard)
 for(const s of [-1,1]){veh40Add(gl,veh40CylTris(0.105,0.105,0.06,12),C.cream,[2.13,0.97,s*0.77],[0,0,Math.PI/2]);
  veh40Box(gl,C.orange,2.11,2.15,0.91,1.03,s*0.555-0.055,s*0.555+0.055,0.012);}
 veh40Box(gl,C.grille,2.11,2.14,0.74,1.12,-0.42,0.42,0.012);
 for(const y of [0.83,0.93,1.03])veh40Box(gl,C.brownDk,2.13,2.15,y-0.015,y+0.015,-0.38,0.38,0.004);
 veh40Box(b,C.brownDk,2.06,2.2,0.4,0.63,-1.0,1.0,0.05);
 // back: brown bumper, red tail lights, a rear window
 veh40Box(b,C.brownDk,-2.2,-2.06,0.42,0.64,-1.0,1.0,0.04);
 for(const s of [-1,1])veh40Box(b,C.red,-2.13,-2.09,0.78,0.98,s*0.82-0.07,s*0.82+0.07,0.01);
 veh40Box(b,C.teal,-2.115,-2.085,1.52,1.94,-0.7,0.7,0.015);
 // the roof: brown, overhanging a little, its top edges rounded in two steps (the steep faces of the slab in the lighter roofEdge brown,
 // the top and the gentle facets in roofBrown), with two rails and three cross bars on short legs
 veh40Prism(roof,[C.roofBrown,C.roofEdge],veh40Outline(-1.08,1.08,2.05,2.21,[0.03,0.03,0.07,0.07],[1,1,2,2]),'x',-2.19,2.19,0.08);
 for(const s of [-1,1]){veh40Box(roof,C.brownDk,-1.8,1.8,2.255,2.29,s*0.72-0.018,s*0.72+0.018,0.008);
  for(const x of [-1.7,0,1.7])veh40Box(roof,C.brownDk,x-0.02,x+0.02,2.18,2.26,s*0.72-0.015,s*0.72+0.015,0.004);}
 for(const x of [-1.2,0,1.2])veh40Box(roof,C.brownDk,x-0.018,x+0.018,2.255,2.29,-0.72,0.72,0.008);
 return [b,roof,gl].concat(W);}

/* ---------- restyling the base's two groups in place, once each ---------- */
function vehKeke40(){if(typeof THREE==='undefined'||!VEH40.mat||typeof keke==='undefined'||!keke||!keke.isObject3D)return false;if(keke.userData.veh40)return true;
 const before=keke.children.length;VEH40.stats.keke=Object.assign({before},veh40Fill(keke,buildKeke40()));keke.userData.veh40=true;VEH40.built.keke++;return true;}
function vehFindDanfo40(){if(typeof scene==='undefined'||!scene||!scene.children)return null;
 for(const o of scene.children){if(o&&o.isGroup&&Math.abs(o.position.x-16)<1e-6&&Math.abs(o.position.y)<1e-6&&Math.abs(o.position.z-9.3)<1e-6)return o;}return null;}
function vehDanfo40(){if(typeof THREE==='undefined'||!VEH40.mat)return false;const d=vehFindDanfo40();if(!d)return false;if(d.userData.veh40)return true;
 const before=d.children.length;VEH40.stats.danfo=Object.assign({before},veh40Fill(d,buildDanfo40()));d.userData.veh40=true;VEH40.built.danfo++;return true;}
if(typeof buildWorld==='function'){const prevWorld40=buildWorld;buildWorld=function(){const r=prevWorld40.apply(this,arguments);try{vehDanfo40();}catch(e){VEH40.err=String(e&&e.stack||e);}return r;};}
if(typeof buildAmbient==='function'){const prevAmbient40=buildAmbient;buildAmbient=function(){const r=prevAmbient40.apply(this,arguments);try{vehKeke40();}catch(e){VEH40.err=String(e&&e.stack||e);}return r;};}

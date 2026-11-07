/* v46 Waterfront: the waterfront and the suya grill rebuilt to the owner's renderings. A brick-paved promenade with a
   sandstone quay edge; Mallam's grill as a slatted wooden cabinet carrying an open charcoal grill box with suya skewers,
   a pepper jar, a cup and a striped cloth; the two fishing tables as blue-framed plank tables with a basket, a rope coil,
   a cooler and a net on the lower shelf. Visual only: every collider, hotspot and sign stays where the base game put it,
   the old blocks are hidden rather than removed, and the new meshes ignore raycasts, so no harness result moves. */
'use strict';
const WF46={group:null,mats:{},tex:{}};
function wfRand46(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
// running-bond pavers, 4 across and 8 down per tile (one tile is 1.2 m square), warm terracotta with paler grout
function wfBrickTex46(){
 if(WF46.tex.brick)return WF46.tex.brick;
 const n=512,cv=document.createElement('canvas');cv.width=cv.height=n;const c=cv.getContext('2d'),r=wfRand46(4611);
 c.fillStyle='#C9A08A';c.fillRect(0,0,n,n);
 const bw=128,bh=64;
 for(let row=0;row<8;row++)for(let k=-1;k<5;k++){
  const x=k*bw+(row%2?bw/2:0),y=row*bh,v=r();
  const R=Math.round(214+v*22),G=Math.round(160+v*20),B=Math.round(134+v*16);
  c.fillStyle=`rgb(${R},${G},${B})`;c.fillRect(x+4,y+4,bw-8,bh-8);
  c.fillStyle='rgba(255,240,225,.28)';c.fillRect(x+5,y+5,bw-10,3);
  c.fillStyle='rgba(90,50,35,.16)';c.fillRect(x+5,y+bh-8,bw-10,3);
  for(let s=0;s<40;s++){c.fillStyle=`rgba(${r()>.5?'255,235,220':'110,60,40'},${.04+r()*.06})`;c.fillRect(x+6+r()*(bw-12),y+6+r()*(bh-12),2,2);}
 }
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;WF46.tex.brick=t;return t;
}
// planed timber; vertical grain for slats and legs, horizontal for planks
function wfWoodTex46(vertical){
 const key=vertical?'woodV':'woodH';if(WF46.tex[key])return WF46.tex[key];
 const n=256,cv=document.createElement('canvas');cv.width=cv.height=n;const c=cv.getContext('2d'),r=wfRand46(vertical?977:619);
 c.fillStyle='#E4D2C2';c.fillRect(0,0,n,n);
 for(let k=0;k<70;k++){const p=r()*n;c.strokeStyle=`rgba(96,52,26,${.05+r()*.13})`;c.lineWidth=.5+r()*1.6;c.beginPath();
  for(let q=0;q<=n;q+=8){const o=p+Math.sin(q*.03+k)*2.2;if(vertical)c.lineTo(o,q);else c.lineTo(q,o);}c.stroke();}
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;WF46.tex[key]=t;return t;
}
function wfMat46(key,make){if(!WF46.mats[key])WF46.mats[key]=make();return WF46.mats[key];}
function wfStd46(color,o){return new THREE.MeshStandardMaterial(Object.assign({color,roughness:.8,metalness:0},o||{}));}
function wfMats46(){
 return {
  brick:wfMat46('brick',()=>{const t=wfBrickTex46();return wfStd46('#EED8D2',{map:t,bumpMap:t,bumpScale:.02,roughness:.92});}),
  quay:wfMat46('quay',()=>wfStd46('#D9C3A0',{roughness:.95})),
  slat:wfMat46('slat',()=>{const t=wfWoodTex46(true);return wfStd46('#C27A4E',{map:t,bumpMap:t,bumpScale:.004});}),
  plank:wfMat46('plank',()=>{const t=wfWoodTex46(false);return wfStd46('#C98559',{map:t,bumpMap:t,bumpScale:.004});}),
  frame:wfMat46('frame',()=>{const t=wfWoodTex46(true);return wfStd46('#6C86B6',{map:t,roughness:.75});}),
  bolt:wfMat46('bolt',()=>wfStd46('#3B342E',{metalness:.5,roughness:.5})),
  metal:wfMat46('metal',()=>wfStd46('#4A433C',{metalness:.55,roughness:.55})),
  lid:wfMat46('lid',()=>wfStd46('#6E655B',{metalness:.45,roughness:.7})),
  grate:wfMat46('grate',()=>wfStd46('#24201C',{metalness:.6,roughness:.5})),
  hole:wfMat46('hole',()=>new THREE.MeshBasicMaterial({color:'#17120F'})),
  ember:wfMat46('ember',()=>new THREE.MeshBasicMaterial({color:'#FF8A3A'})),
  meat:wfMat46('meat',()=>wfStd46('#8A4127',{roughness:.95})),
  char:wfMat46('char',()=>wfStd46('#5E2C1A',{roughness:.95})),
  stick:wfMat46('stick',()=>wfStd46('#E3C28E',{roughness:.9})),
  jar:wfMat46('jar',()=>wfStd46('#B14E33',{roughness:.6})),
  jarLid:wfMat46('jarLid',()=>wfStd46('#E68A6E',{roughness:.6})),
  cup:wfMat46('cup',()=>wfStd46('#55524D',{roughness:.7})),
  towel:wfMat46('towel',()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');c.fillStyle='#EEE8DC';c.fillRect(0,0,64,64);c.fillStyle='#7B6CA2';for(const x of [10,22,34,46])c.fillRect(x,0,3,64);const t=new THREE.CanvasTexture(cv);return wfStd46('#FFFFFF',{map:t,side:THREE.DoubleSide,roughness:.95});}),
  basket:wfMat46('basket',()=>wfStd46('#CFA266',{roughness:.95,side:THREE.DoubleSide})),
  band:wfMat46('band',()=>wfStd46('#6F6EA6',{roughness:.95})),
  rope:wfMat46('rope',()=>wfStd46('#D6B07C',{roughness:.95})),
  cooler:wfMat46('cooler',()=>wfStd46('#EEE9DD',{roughness:.85})),
  rim:wfMat46('rim',()=>wfStd46('#3F5E96',{roughness:.7})),
  net:wfMat46('net',()=>wfStd46('#7E8E5E',{roughness:.95,wireframe:true})),
  cork:wfMat46('cork',()=>wfStd46('#D8A86E',{roughness:.9})),
  red:wfMat46('red',()=>wfStd46('#D6493A',{roughness:.6})),
  white:wfMat46('white',()=>wfStd46('#F3EEE4',{roughness:.6}))
 };
}
function wfMesh46(geo,m,parent,x,y,z,shadow){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=shadow!==false;o.receiveShadow=true;o.raycast=()=>{};parent.add(o);return o;}
// a box whose bottom sits at y
function wfBox46(w,h,d,m,parent,x,y,z,shadow){return wfMesh46(new THREE.BoxGeometry(w,h,d),m,parent,x,y+h/2,z,shadow);}
function wfCyl46(r,h,m,parent,x,y,z,seg,rTop){return wfMesh46(new THREE.CylinderGeometry(rTop===undefined?r:rTop,r,h,seg||14),m,parent,x,y+h/2,z);}

/* ---- the promenade: brick paving from the palms to the quay, a raised paved terrace over the old grey tiles ---- */
function wfPaving46(g,M){
 const plane=(w,d,x,z,y)=>{const geo=new THREE.PlaneGeometry(w,d),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/1.2,uv.getY(i)*d/1.2);
  const m=wfMesh46(geo,M.brick,g,x,y,z,false);m.rotation.x=-Math.PI/2;return m;};
 plane(30,4.9,2,13.45,.03);            // x -13..17, z 11.0..15.9
 // the env23 grey paving (13 x 2.45 at x 1.5, z 13.32, top 0.085) gets a brick top of its own, one step up
 const t=new THREE.BoxGeometry(13.04,.012,2.49),uv=t.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*13.04/1.2,uv.getY(i)*2.49/1.2);
 wfMesh46(t,M.brick,g,1.5,.092,13.32,false);
 // a low sandstone quay along the water's edge (visual: the water collider already stops at z 16)
 wfBox46(30,.16,.32,M.quay,g,2,0,15.98);
 for(let x=-12.5;x<17;x+=2.5)wfBox46(.04,.161,.33,wfMat46('quayJoint',()=>wfStd46('#BCA27E',{roughness:1})),g,x,0,15.98,false);
}

/* ---- Mallam's suya grill: slatted cabinet, charcoal grill box with the lid up, skewers, jar, cup and cloth ---- */
function wfGrill46(g,M){
 const s=new THREE.Group();s.name='wf46_grill';s.position.set(-3,0,12.3);g.add(s);
 const W=1.72,D=1.06,H=.86;
 // plinth frame, corner posts and a top rail; vertical slats on every face
 wfBox46(W+.04,.08,D+.04,M.plank,s,0,0,0);
 for(const a of[-1,1])for(const b of[-1,1])wfBox46(.08,H-.08,.08,M.slat,s,a*(W/2-.04),.08,b*(D/2-.04));
 wfBox46(W+.02,.1,D+.02,M.plank,s,0,H-.1,0);
 const n=11,sw=(W-.16)/n;
 for(let k=0;k<n;k++){const x=-W/2+.08+sw*(k+.5);for(const b of[-1,1])wfBox46(sw-.018,H-.19,.035,M.slat,s,x,.09,b*(D/2-.02));}
 const m=7,sd=(D-.16)/m;for(let k=0;k<m;k++){const z=-D/2+.08+sd*(k+.5);for(const a of[-1,1])wfBox46(.035,H-.19,sd-.018,M.slat,s,a*(W/2-.02),.09,z);}
 // overhanging plank top
 for(let k=0;k<4;k++)wfBox46(W+.12,.06,(D+.12)/4-.012,M.plank,s,0,H,-(D+.12)/2+(D+.12)/8+k*(D+.12)/4);
 const top=H+.06;
 // grill box on short feet
 const gw=1.28,gd=.5,gh=.24,gz=-.08;
 for(const a of[-1,1])for(const b of[-1,1])wfBox46(.06,.04,.06,M.grate,s,a*(gw/2-.07),top,gz+b*(gd/2-.07));
 const by=top+.04;
 wfBox46(gw,.03,gd,M.metal,s,0,by,gz);                                   // floor
 for(const b of[-1,1])wfBox46(gw,gh,.03,M.metal,s,0,by,gz+b*(gd/2-.015)); // front and back walls
 for(const a of[-1,1])wfBox46(.03,gh,gd,M.metal,s,a*(gw/2-.015),by,gz);   // end walls
 for(const a of[-1,1])wfBox46(.05,.025,.18,M.grate,s,a*(gw/2+.03),by+gh*.6,gz);   // end handles
 // embers inside and the row of air holes along the front, every other one glowing
 wfBox46(gw-.08,.02,gd-.08,M.ember,s,0,by+.03,gz,false);
 for(let k=0;k<8;k++){const disc=wfMesh46(new THREE.CircleGeometry(.03,12),k%2?M.ember:M.hole,s,-gw/2+.12+k*(gw-.24)/7,by+gh*.45,gz+gd/2+.001,false);disc.castShadow=false;}
 // grate bars
 for(let k=0;k<12;k++)wfBox46(gw-.08,.012,.012,M.grate,s,0,by+gh-.02,gz-gd/2+.05+k*(gd-.1)/11,false);
 // the lid, up and leaning back a little, with its handle
 const lid=new THREE.Group();lid.position.set(0,by+gh,gz-gd/2);lid.rotation.x=-.22;s.add(lid);
 wfBox46(gw+.02,.5,.035,M.lid,lid,0,0,-.0175);
 wfBox46(gw+.02,.05,.1,M.lid,lid,0,.46,.03);
 for(const a of[-1,1])wfBox46(.03,.07,.03,M.grate,lid,a*.22,.5,-.02);wfBox46(.47,.03,.03,M.grate,lid,0,.57,-.02);
 // skewers of suya across the grate, sticks poking out toward the front
 const ry=by+gh+.035;
 for(let k=0;k<5;k++){const x=-gw/2+.2+k*(gw-.4)/4;
  const st=wfMesh46(new THREE.CylinderGeometry(.009,.009,.66,6),M.stick,s,x,ry,gz+.06);st.rotation.x=Math.PI/2;
  for(let j=0;j<4;j++){const c=wfMesh46(new THREE.DodecahedronGeometry(.048,0),(j+k)%3?M.meat:M.char,s,x,ry+.005,gz-.16+j*.1);c.scale.set(.95,.72,1.3);c.rotation.set(j*.7,k*.9,j*.4);}
 }
 // pepper jar and cup at the right end, striped cloth hanging over the front edge
 const ex=W/2-.18;
 wfCyl46(.07,.22,M.jar,s,ex,top,-.22);wfCyl46(.074,.03,M.jarLid,s,ex,top+.22,-.22);
 wfCyl46(.06,.09,M.cup,s,ex-.02,top,.12,14,.065);
 wfBox46(.26,.01,.24,M.towel,s,ex-.04,top,D/2-.06,false);
 wfBox46(.26,.3,.01,M.towel,s,ex-.04,top-.3,D/2+.065,false);
}

/* ---- a fishing table: blue frame, plank top and lower shelf, with the day's tackle ---- */
function wfFishTable46(g,M,x,z,ry,seed){
 const t=new THREE.Group();t.name='wf46_fishing_table';t.position.set(x,0,z);t.rotation.y=ry;g.add(t);
 const W=2.7,D=.95,H=.8,r=wfRand46(seed);
 for(const a of[-1,1])for(const b of[-1,1]){wfBox46(.11,H-.07,.11,M.frame,t,a*(W/2-.18),0,b*(D/2-.1));
  wfMesh46(new THREE.SphereGeometry(.022,8,6),M.bolt,t,a*(W/2-.18),.24,b*(D/2-.1)+b*.057,false);
  wfMesh46(new THREE.SphereGeometry(.022,8,6),M.bolt,t,a*(W/2-.18),H-.16,b*(D/2-.1)+b*.057,false);}
 for(const b of[-1,1]){wfBox46(W-.25,.1,.06,M.frame,t,0,H-.2,b*(D/2-.1));wfBox46(W-.25,.08,.06,M.frame,t,0,.18,b*(D/2-.1));}
 for(const a of[-1,1])wfBox46(.06,.1,D-.2,M.frame,t,a*(W/2-.18),H-.2,0);
 for(let k=0;k<5;k++)wfBox46(W,.06,D/5-.014,M.plank,t,0,H-.07,-D/2+D/10+k*D/5);                 // top planks
 for(let k=0;k<4;k++)wfBox46(W-.3,.035,(D-.2)/4-.014,M.plank,t,0,.26,-(D-.2)/2+(D-.2)/8+k*(D-.2)/4); // shelf planks
 const top=H-.01;
 // woven basket with a band
 const bx=-W/2+.55,bp=[];for(let i=0;i<=6;i++){const a=i/6;bp.push(new THREE.Vector2(.08+.26*Math.sin(a*Math.PI/2),a*.2));}
 wfMesh46(new THREE.LatheGeometry(bp,18),M.basket,t,bx,top,0);
 const band=wfMesh46(new THREE.TorusGeometry(.3,.012,6,24),M.band,t,bx,top+.12,0,false);band.rotation.x=Math.PI/2;
 const lip=wfMesh46(new THREE.TorusGeometry(.34,.018,6,24),M.basket,t,bx,top+.2,0,false);lip.rotation.x=Math.PI/2;
 // coiled rope
 for(let k=0;k<4;k++){const ring=wfMesh46(new THREE.TorusGeometry(.16-k*.012,.022,6,20),M.rope,t,-.18,top+.022+k*.04,.05);ring.rotation.x=Math.PI/2;}
 // a red-and-white float beside it
 wfMesh46(new THREE.SphereGeometry(.05,10,8),M.red,t,.1,top+.05,.25);wfMesh46(new THREE.SphereGeometry(.051,10,8,0,Math.PI*2,0,Math.PI/2),M.white,t,.1,top+.05,.25);
 // cooler with the lid open
 const cx=.62;wfBox46(.52,.26,.36,M.cooler,t,cx,top,0);wfBox46(.54,.03,.38,M.rim,t,cx,top+.26,0);
 const cl=new THREE.Group();cl.position.set(cx,top+.29,-.19);cl.rotation.x=-1.75;t.add(cl);
 wfBox46(.54,.03,.38,M.rim,cl,0,0,.19);wfBox46(.5,.03,.34,M.cooler,cl,0,-.03,.19);
 // net and corks on the lower shelf, a few spare planks at the end
 const net=wfMesh46(new THREE.PlaneGeometry(1.2,.6,10,5),M.net,t,-.35,.31,0,false);net.rotation.x=-Math.PI/2;
 const p=net.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,(r()*.05));p.needsUpdate=true;
 for(let k=0;k<4;k++)wfCyl46(.035,.07,M.cork,t,-.85+k*.32,.3,.18+(k%2)*.06,10).rotation.z=Math.PI/2;
 for(let k=0;k<3;k++)wfBox46(.5,.03,.16,M.plank,t,W/2-.62,.3+k*.032,-.05);
}

function wfHideOld46(){
 // the base blocks this replaces: the suya box and its black top, and the two blue fishing blocks (colliders stay)
 const near=(v,x,y,z)=>Math.abs(v.x-x)<.01&&Math.abs(v.y-y)<.01&&Math.abs(v.z-z)<.01;
 for(const o of scene.children){
  if(o.isMesh&&o.geometry&&o.geometry.type==='BoxGeometry'){const P=o.geometry.parameters;
   if(near(o.position,-3,.45,12.3)&&P.width===1.6&&P.height===.9)o.visible=false;
   if(near(o.position,-3,1.05,12.3)&&P.width===1.2&&P.height===.3)o.visible=false;}
  else if(o.isGroup&&!o.name&&o.children.length===3&&(near(o.position,-8,0,14.6)||near(o.position,9,0,15.1)))o.visible=false;
 }
}
function buildWaterfront46(){
 if(WF46.group){scene.remove(WF46.group);WF46.group=null;}
 // three.js draws every new object's uuid from Math.random; lend it a private stream while building so the game's own
 // random sequence (fish bites, moods, finds) is exactly what it was before v46
 const rnd=Math.random;if(!WF46.uuidRand)WF46.uuidRand=wfRand46(46046);Math.random=WF46.uuidRand;
 try{
  const g=new THREE.Group();g.name='wf46_waterfront';scene.add(g);WF46.group=g;const M=wfMats46();
  wfHideOld46();wfPaving46(g,M);wfGrill46(g,M);
  wfFishTable46(g,M,-8,14.6,.3,31);wfFishTable46(g,M,9,15.1,-.4,47);
  return g;
 }finally{Math.random=rnd;}
}
// wrap: once the world is built, swap the waterfront blocks for the rendered pieces
const wfBuildWorld46=buildWorld;buildWorld=function(){const r=wfBuildWorld46.apply(this,arguments);buildWaterfront46();return r;};

/* ---- the owner's Blender scene renders behind the panels (assets/scenes/*.webp, replacing nine v45 paintings) ----
   One new scene, 'workstations' (the fishing table and the grill side by side), for a waterfront panel in the day that
   is not the fishing sheet or a catch; fishing keeps 'waterfront', and from 17:00 'waterfront-dusk' as before. */
if(typeof SLEEK44!=='undefined'){SLEEK44.ready.push('workstations');SLEEK44.scenes.push('workstations');}
// wrap: a daytime waterfront panel that is not fishing shows the workstations render
if(typeof sleekScene44==='function'){const wfScene46=sleekScene44;sleekScene44=function(){const sc=wfScene46();
 if(sc!=='waterfront')return sc;const el=typeof panel!=='undefined'?panel:null,fishing=(el&&el.querySelector&&el.querySelector('.fishing34,.catch34'))||(typeof LIFE34!=='undefined'&&LIFE34.tab==='fish'&&el&&el.classList&&el.classList.contains('life-panel34'));
 return fishing?sc:'workstations';};}

/* v36 Ada's bench ("A Bench for Evening Gist"). Ada leaves a wooden bench at the street gate; the two players of a local household carry
   it together through the gate, the courtyard, the narrow passage, the flat door and the room to the veranda doorway, choose one of three
   arrangements of the one veranda spot that fits it, both agree, and the bench glides to that spot. Then they can sit on it together,
   facing out over the rail.
   The carry is complementary: one player (Move) walks the bench along its own axis, the other (Turn) swings it about its centre. One
   player can never move it. The bench is one exact box in every state (half-extents 0.76 x 0.26); the holders are player discs.
   Two humans on one device only: companion and online households see nothing of an unplaced bench (a ?bench= flag shows the companion
   household a line saying why). Nothing changes until a delivery is started from the Menu.
   Loaded after lens-v35.js. Every change wraps an earlier global and calls it. Top-level names end in 36. Wall-clock time is never read:
   the module's own clock (BENCH36.t) is the sum of the frame steps. */
'use strict';

const BENCH36={v:1,
 L:1.5,W:0.5,H:0.86,SEAT:0.46,
 HX:0.76,HZ:0.26,
 GRIP:0.72,STAND:0.90,TAKE:0.80,LIFT:0.45,
 V:1.2,WMAX:60*Math.PI/180,
 RAMP:0.40,STOP:0.06,CONE:0.34,
 CAP:[[0.20,1],[0.10,0.7],[0,0.4]],
 state:'off',pose:{x:0,z:0,yaw:0},holder:[null,null],front:1,mover:0,vel:{s:0,w:0},
 latch:[null,null],wall:{s:0,w:0},outT:[0,0],bump:0,lastBumpT:-9,stuckT:0,stuck:false,
 corner:0,choice:'out',agree:[false,false],g:null,override:null,movedPrev:false,stats:null,
 START:{x:4.0,z:8.6,yaw:0},START_ALT:[{x:5.0,z:11.2,yaw:0},{x:3.0,z:11.0,yaw:0}],
 GATE_SPOTS:[[3.4,9.6],[4.6,9.6]],
 // waypoints for the camera's next-corner point and for progress, along the shipped plan (check/bench-route-v36.json)
 ROUTE:[{n:'gate',x:3.6,z:5.4},{n:'corner 1',x:-1.4,z:0.8},{n:'passage',x:-1.57,z:2.6},{n:'corner 2',x:-2.3,z:4.65},{n:'doorway',x:-4.05,z:5.0}],
 // grounded poses that never cut the walkable world in two (degrees)
 CHECK:[{n:'street',x:4.0,z:8.6,yaw:0},{n:'inside the gate',x:3.6,z:5.2,yaw:95},{n:'courtyard',x:1.41,z:1.20,yaw:170},{n:'before the passage',x:-0.36,z:0.89,yaw:170},{n:'room',x:-3.60,z:4.30,yaw:90}],
 ROOM:{x:-3.60,z:4.30,yaw:90},
 POSES:{out:{name:'Looking out',x:-7.04,z:6.12,yaw:0,desc:'Back to the wall, facing out over the rail.'},
  gate:{name:'Turned to the gate',x:-7.05,z:6.40,yaw:18,desc:'Angled towards the gate road.'},
  water:{name:'Turned to the water',x:-7.05,z:6.40,yaw:-18,desc:'Angled towards the lagoon.'}},
 ORDER:['out','gate','water'],
 // the swept centre poses of three reference plans (x, z, degrees), one every 0.25 m of travel: the crate keeps out of them
 REF:[[4,8.6,0],[3.88,8.4,95],[3.86,8.1,95],[3.83,7.8,95],[3.8,7.5,95],[3.78,7.21,95],[3.75,6.91,95],[3.73,6.61,95],[3.7,6.31,95],[3.67,6.01,95],[3.65,5.71,95],[3.62,5.41,95],[3.6,5.11,95],[3.57,4.81,95],[3.54,4.52,95],[3.52,4.22,95],[3.49,3.92,95],[3.46,3.62,95],[3.44,3.32,95],[3.41,3.02,95],[3.39,2.72,95],[3.36,2.42,95],[3.33,2.13,95],[3.31,1.83,95],[3.28,1.53,95],[3.25,1.23,95],[3.05,1.16,175],[2.75,1.14,175],[2.45,1.11,175],[2.15,1.08,175],[1.86,1.06,175],[1.56,1.03,175],[1.26,1,175],[0.96,0.98,175],[0.66,0.95,175],[0.36,0.93,175],[0.06,0.9,175],[-0.24,0.87,175],[-0.54,0.85,175],[-0.83,0.82,175],[-1.13,0.8,175],[-1.39,0.82,260],[-1.43,1.07,260],[-1.49,1.36,260],[-1.54,1.66,260],[-1.58,1.91,260],[-1.61,2.2,270],[-1.61,2.45,270],[-1.61,2.7,270],[-1.61,2.95,270],[-1.61,3.2,270],[-1.61,3.45,270],[-1.61,3.7,270],[-1.61,3.95,270],[-1.61,4.2,270],[-1.7,4.39,200],[-1.98,4.49,200],[-2.22,4.58,200],[-2.5,4.68,200],[-2.8,4.65,175],[-3.1,4.63,175],[-3.4,4.6,175],[-3.7,4.57,175],[-3.98,4.48,155],[-4.15,4.45,95],[-4.13,4.75,95],[-4.1,5.04,95],
  [3.28,1.53,95],[2.99,1.48,170],[2.69,1.42,170],[2.4,1.37,170],[2.1,1.32,170],[1.8,1.27,170],[1.51,1.21,170],[1.26,1.17,170],[0.97,1.12,170],[0.67,1.07,170],[0.38,1.01,170],[0.08,0.96,170],[-0.17,0.92,170],[-0.46,0.87,170],[-0.76,0.81,170],[-1.05,0.76,170],[-1.35,0.71,170],[-1.43,1,255],[-1.5,1.29,255],[-1.57,1.53,255],[-1.57,1.78,270],[-1.57,2.03,270],[-1.57,2.28,270],[-1.57,2.53,270],[-1.57,2.78,270],[-1.57,3.03,270],[-1.57,3.28,270],[-1.57,3.53,270],[-1.57,3.78,270],[-1.57,4.03,270],[-1.57,4.28,270],[-1.81,4.45,215],[-2.03,4.57,195],[-2.32,4.64,195],[-2.56,4.71,195],[-2.85,4.68,165],[-3.14,4.61,165],[-3.38,4.54,165],[-3.67,4.46,165],[-3.91,4.41,260],[-3.96,4.7,260],[-4,4.95,260],[-4.02,5.05,260],
  [3.4,4.32,315],[3.19,4.11,315],[3.01,3.94,315],[2.8,3.72,315],[2.58,3.51,315],[2.41,3.33,315],[2.19,3.12,315],[2.02,2.94,315],[1.81,2.73,315],[1.59,2.52,315],[1.42,2.34,315],[1.21,2.13,315],[0.99,1.92,315],[0.82,1.74,315],[0.6,1.53,315],[0.39,1.32,315],[0.21,1.14,315],[0,0.93,315],[-0.17,0.75,315],[-0.39,0.54,315],[-0.6,0.33,315],[-0.78,0.15,315],[-0.99,-0.06,315],[-1.2,-0.27,315],[-1.3,-0.07,255],[-1.36,0.18,255],[-1.44,0.47,255],[-1.52,0.76,255],[-1.57,1,270],[-1.57,1.25,270],[-1.57,1.5,270],[-1.57,1.75,270],[-1.57,2,270],[-1.57,2.25,270],[-1.57,2.5,270],[-1.57,2.75,270],[-1.57,3,270],[-1.57,3.25,270],[-1.57,3.5,270],[-1.57,3.75,270],[-1.57,4,270],[-1.61,4.28,220],[-1.84,4.47,220],[-2.06,4.57,200],[-2.3,4.66,200],[-2.54,4.72,170],[-2.83,4.67,170],[-3.13,4.62,170],[-3.38,4.57,170],[-3.65,4.47,155],[-3.88,4.36,155],[-4.03,4.45,265],[-4.06,4.75,265],[-4.08,5.05,265]],
 KEEP:[[-2.35,-1.15,1.5,3.2],[-2.35,0.65,3.2,5.6],[-4.6,-2.35,3.9,5.6]],   // passage, vestibule, room lane (x1,x2,z1,z2)
 CRATE_SPOTS:[[-3.4,0.9],[1.0,-1.25],[-3.5,0.0]],
 LANE_CELLS:[[4,1],[4,2],[5,2],[5,3]],SLOT_CELLS:[[0,4],[1,4]],
 HUBS:[[0.0,3.0,0.6,4.5],[-7.5,-3.1,2.4,5.3],[2.0,6.0,9.0,10.5]],
 POT:[-5.845,-5.355,6.385,6.875],                // the pepper pot's stand legs (its plate is above the seat), for the glide only
 COL:{move:'#F2B33D',turn:'#3FB6A8',wrap:'#3B4A8C'},
 flags:null,raw:[[0,0],[0,0]],t:0,frame:0,y:0,liftT:0,liftDir:0,
 cost:{blocked:0,box:0,valid:0,substeps:0},bp:null,grid:null,progress:0,seatTarget:null,seatDay:null,standing:false,
 takeFrame:-1,takeEnd:-1,letGoT:0,held:[0,0],relT:[9,9],wallAcc:{s:0,w:0},stuckAcc:0,glide:null,settle:null,okCache:null,
 pick:[{x:0,t:0},{x:0,t:0}],recoil:null,motes:[],cam:[null,null],notePending:false,delivered:false,paused:false,liftCheckT:0,
 mesh:{rings:[],ghost:null,chev:null},seq:0,arrowShown:['',''],states:[]};

/* ---------- small helpers ---------- */
const D2R36=Math.PI/180;
function benchLocal36(){return typeof singleIdx==='function'&&singleIdx()===-1&&!(typeof NET!=='undefined'&&NET.on)&&!(typeof AI!=='undefined'&&AI.on);}
function benchOpen36(){const s=BENCH36.state;return s==='grounded'||s==='ready'||s==='carrying'||s==='choosing'||s==='settling';}
function benchSave36(){return S&&S.life&&S.life.bench36?S.life.bench36:null;}
function benchItem36(){return S&&S.home&&S.home.items?S.home.items.find(it=>it.type==='bench'):null;}
function benchPoseOf36(key){const P=BENCH36.POSES[key]||BENCH36.POSES.out;return {x:P.x,z:P.z,yaw:P.yaw*D2R36};}
function benchAxis36(yaw){return [Math.cos(yaw),-Math.sin(yaw)];}
function benchEnd36(pose,e,d){const a=benchAxis36(pose.yaw),s=(e?1:-1)*(d===undefined?BENCH36.STAND:d);return [pose.x+a[0]*s,pose.z+a[1]*s];}
function benchBox36(pose,inflate){const i=inflate||0,hx=BENCH36.HX+i,hz=BENCH36.HZ+i,c=Math.cos(pose.yaw),s=Math.sin(pose.yaw),ex=Math.abs(c)*hx+Math.abs(s)*hz,ez=Math.abs(s)*hx+Math.abs(c)*hz;
 return {x:pose.x,z:pose.z,yaw:pose.yaw,hx,hz,x1:pose.x-ex,x2:pose.x+ex,z1:pose.z-ez,z2:pose.z+ez,tag:'bench36'};}
function benchWrapA36(a){while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;}
function benchPlayerName36(i){try{return pname(i);}catch(e){return i?'Player 2':'Player 1';}}
function benchToast36(m){if(typeof toast==='function')toast(m);}
function benchHUD36(){try{if(typeof updateHUD==='function')updateHUD();}catch(e){}}
function benchHolderOf36(i){return BENCH36.holder[0]===i?0:BENCH36.holder[1]===i?1:-1;}
function benchPos36(i){const p=players[i];return p?[p.g.position.x,p.g.position.z]:[0,0];}

/* ---------- 1.2 One shape: the exact box, the circle test, the box list ---------- */
// circle (or point, r=0) against an oriented box, strict like hitAABB
function bench36CircleOBB(x,z,r,b){const c=Math.cos(b.yaw),s=Math.sin(b.yaw),dx=x-b.x,dz=z-b.z;
 const lx=dx*c-dz*s,lz=dx*s+dz*c;const ox=Math.abs(lx)-b.hx,oz=Math.abs(lz)-b.hz;
 if(!(r>0))return ox<0&&oz<0;const qx=ox>0?ox:0,qz=oz>0?oz:0;return qx*qx+qz*qz<r*r;}
// the boxes blocked() tests at level 0, within R of (x,z): walls and stairs, furniture, the crate, the loose sofa, the pushables
function benchBoxes36(x,z,R,opts){opts=opts||{};const out=[],near=o=>o.x2>x-R&&o.x1<x+R&&o.z2>z-R&&o.z1<z+R;
 for(const o of OBS){const l=o.lvl||0;if((l===0||l===2)&&near(o))out.push(o);}
 for(const o of FURN_OBS)if(near(o))out.push(o);
 if(!opts.noCrate&&typeof crate!=='undefined'&&crate){const b=crateBox();if(near(b))out.push(b);}
 if(!opts.noSofa&&typeof sofa!=='undefined'&&sofa&&sofa.g.visible&&!sofa.carrying){const b=sofaBox();if(near(b))out.push(b);}
 for(const pb of PUSH){if(pb.lvl!==0||pb.gone)continue;const b=pushBox(pb);if(near(b))out.push(b);}
 return out;}
// once per frame while carrying: the boxes within 2.5 m of the bench centre
function benchBroad36(){const p=BENCH36.pose;BENCH36.bp={x:p.x,z:p.z,frame:BENCH36.frame,list:benchBoxes36(p.x,p.z,2.5,{})};return BENCH36.bp;}
// exact separating-axis test of the bench box (half-extents HX+inflate, HZ+inflate) against the level-0 boxes; returns the box hit or null
function bench36ObbHit(pose,inflate,opts){inflate=inflate||0;opts=opts||{};BENCH36.cost.box++;
 const hx=BENCH36.HX+inflate,hz=BENCH36.HZ+inflate,ux=Math.cos(pose.yaw),uz=-Math.sin(pose.yaw),nx=Math.sin(pose.yaw),nz=Math.cos(pose.yaw);
 const ex=Math.abs(ux)*hx+Math.abs(nx)*hz,ez=Math.abs(uz)*hx+Math.abs(nz)*hz,x=pose.x,z=pose.z;
 const bp=BENCH36.bp,plain=!opts.noCrate&&!opts.noSofa&&!opts.list;
 const list=opts.list||(plain&&bp&&bp.frame===BENCH36.frame&&Math.hypot(x-bp.x,z-bp.z)<=1.4-inflate?bp.list:benchBoxes36(x,z,0.85+inflate,opts));
 for(const b of list){if(x+ex<=b.x1||x-ex>=b.x2||z+ez<=b.z1||z-ez>=b.z2)continue;
  const bhx=(b.x2-b.x1)/2,bhz=(b.z2-b.z1)/2,dx=(b.x1+b.x2)/2-x,dz=(b.z1+b.z2)/2-z;
  if(Math.abs(dx*ux+dz*uz)>=hx+bhx*Math.abs(ux)+bhz*Math.abs(uz))continue;
  if(Math.abs(dx*nx+dz*nz)>=hz+bhx*Math.abs(nx)+bhz*Math.abs(nz))continue;return b;}
 return null;}
// the bench on the ground (or the candidate during a placement check), as an oriented box; null when there is none
function bench36GroundBox(){if(BENCH36.override)return BENCH36.override;const s=BENCH36.state;
 if(s==='off')return null;
 if(s==='grounded'||s==='ready'||s==='choosing'||s==='settling'){if(BENCH36.paused)return null;return benchGroundCache36(BENCH36.pose);}
 if(s==='placed'||s==='seated'){const it=benchItem36();if(!it)return null;return benchGroundCache36(benchPoseOf36(it.pose36));}
 return null;}
function benchGroundCache36(p){const c=BENCH36._gb;if(c&&c.x===p.x&&c.z===p.z&&c.yaw===p.yaw)return c;return (BENCH36._gb=benchBox36(p,0));}

// wrap: the bench on the ground is an oriented box for everyone else (opts.noBench skips it)
const prevBlocked36=blocked;blocked=function(x,z,r,opts){BENCH36.cost.blocked++;
 const hit=prevBlocked36.apply(this,arguments);if(hit)return hit;
 if(opts&&opts.noBench)return null;const b=bench36GroundBox();
 return b&&(!opts||!opts.lvl)&&bench36CircleOBB(x,z,r||0,b)?b:null;};

/* ---------- 3.4 The obstacle check ---------- */
function bench36Valid(pose,inflate){inflate=inflate||0;BENCH36.cost.valid++;
 if(bench36ObbHit(pose,inflate,{}))return false;
 const a=benchAxis36(pose.yaw),S0=BENCH36.STAND;
 for(const s of [S0,-S0]){const x=pose.x+a[0]*s,z=pose.z+a[1]*s;if(blocked(x,z,PR+inflate,{noBench:true})||!carryLevelOK34(x,z))return false;}
 for(const t of [-0.75,-0.375,0,0.375,0.75])if(!carryLevelOK34(pose.x+a[0]*t,pose.z+a[1]*t))return false;
 return true;}

/* ---------- 2.3 The walk grid, the liftable rule and the hubs ---------- */
const BENCH_GRID36={x0:-8.5,z0:-3.0,s:0.05,nx:291,nz:281};
function benchGridSig36(){let k=OBS.length+'|'+FURN_OBS.length+'|';for(const o of FURN_OBS)k+=o.x1+','+o.z1+';';
 if(typeof crate!=='undefined'&&crate)k+='|c'+crate.position.x+','+crate.position.z;
 if(typeof sofa!=='undefined'&&sofa)k+='|s'+(sofa.g.visible&&!sofa.carrying?sofa.g.position.x+','+sofa.g.position.z+','+sofa.g.rotation.y:'-');
 for(const pb of PUSH)k+='|p'+(pb.gone||pb.lvl?'-':pb.g.position.x+','+pb.g.position.z);return k;}
// rasterise the boxes blocked() tests (without the bench) at the player radius, with hitAABB's own arithmetic
function benchGridBuild36(){const G=BENCH_GRID36,base=new Uint8Array(G.nx*G.nz),r=PR;
 const boxes=benchBoxes36((G.x0+(G.nx-1)*G.s/2),(G.z0+(G.nz-1)*G.s/2),1e4,{});
 for(const o of boxes){const i0=Math.max(0,Math.floor((o.x1-r-G.x0)/G.s)-1),i1=Math.min(G.nx-1,Math.ceil((o.x2+r-G.x0)/G.s)+1),j0=Math.max(0,Math.floor((o.z1-r-G.z0)/G.s)-1),j1=Math.min(G.nz-1,Math.ceil((o.z2+r-G.z0)/G.s)+1);
  for(let i=i0;i<=i1;i++){const x=G.x0+i*G.s;if(!(x+r>o.x1&&x-r<o.x2))continue;for(let j=j0;j<=j1;j++){const z=G.z0+j*G.s;if(z+r>o.z1&&z-r<o.z2)base[i*G.nz+j]=1;}}}
 BENCH36.grid={base,sig:benchGridSig36()};return BENCH36.grid;}
function benchGrid36(){const g=BENCH36.grid;if(!g||g.sig!==benchGridSig36())return benchGridBuild36();return g;}
// the grid with an oriented box (the bench, grounded or a candidate) added at the player radius
function benchGridWith36(box){const G=BENCH_GRID36,g=benchGrid36(),w=g.base.slice();if(!box)return w;const r=PR;
 const i0=Math.max(0,Math.floor((box.x1-r-G.x0)/G.s)-1),i1=Math.min(G.nx-1,Math.ceil((box.x2+r-G.x0)/G.s)+1),j0=Math.max(0,Math.floor((box.z1-r-G.z0)/G.s)-1),j1=Math.min(G.nz-1,Math.ceil((box.z2+r-G.z0)/G.s)+1);
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)if(bench36CircleOBB(G.x0+i*G.s,G.z0+j*G.s,r,box))w[i*G.nz+j]=1;return w;}
function benchCell36(x,z){const G=BENCH_GRID36;const i=Math.round((x-G.x0)/G.s),j=Math.round((z-G.z0)/G.s);return i<0||j<0||i>=G.nx||j>=G.nz?-1:i*G.nz+j;}
// breadth-first walk from a player's position (or the nearest free cell within 0.35 m)
function benchBFS36(w,x,z){const G=BENCH_GRID36,N=G.nx*G.nz,seen=new Uint8Array(N);let s=benchCell36(x,z);
 if(s<0)return seen;if(w[s]){let best=-1,bd=1e9;const si=(s/G.nz)|0,sj=s-si*G.nz;for(let a=-7;a<=7;a++)for(let b=-7;b<=7;b++){const i=si+a,j=sj+b;if(i<0||j<0||i>=G.nx||j>=G.nz)continue;const n=i*G.nz+j;if(w[n])continue;const d=a*a+b*b;if(d<bd&&d<=49){bd=d;best=n;}}if(best<0)return seen;s=best;}
 const q=new Int32Array(N);let h=0,t=0;q[t++]=s;seen[s]=1;
 while(h<t){const n=q[h++],i=(n/G.nz)|0,j=n-i*G.nz;
  if(i>0){const m=n-G.nz;if(!seen[m]&&!w[m]){seen[m]=1;q[t++]=m;}}if(i<G.nx-1){const m=n+G.nz;if(!seen[m]&&!w[m]){seen[m]=1;q[t++]=m;}}
  if(j>0){const m=n-1;if(!seen[m]&&!w[m]){seen[m]=1;q[t++]=m;}}if(j<G.nz-1){const m=n+1;if(!seen[m]&&!w[m]){seen[m]=1;q[t++]=m;}}}
 return seen;}
function benchReachNear36(seen,w,px,pz,rad){const G=BENCH_GRID36,i0=Math.max(0,Math.floor((px-rad-G.x0)/G.s)),i1=Math.min(G.nx-1,Math.ceil((px+rad-G.x0)/G.s)),j0=Math.max(0,Math.floor((pz-rad-G.z0)/G.s)),j1=Math.min(G.nz-1,Math.ceil((pz+rad-G.z0)/G.s));
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const n=i*G.nz+j;if(seen[n]&&!w[n]&&Math.hypot(G.x0+i*G.s-px,G.z0+j*G.s-pz)<=rad)return true;}return false;}
// both stand-point discs free, and the two players matched to the two ends, each reaching a free cell within TAKE of their own end
function bench36Liftable(pose,positions){
 for(const e of [0,1]){const [x,z]=benchEnd36(pose,e);if(blocked(x,z,PR,{noBench:true})||!carryLevelOK34(x,z))return false;}
 positions=positions||[benchPos36(0),benchPos36(1)];const w=benchGridWith36(benchBox36(pose,0)),ends=[benchEnd36(pose,0),benchEnd36(pose,1)];
 const r=positions.map(p=>{const seen=benchBFS36(w,p[0],p[1]);return ends.map(e=>benchReachNear36(seen,w,e[0],e[1],BENCH36.TAKE));});
 return (r[0][0]&&r[1][1])||(r[0][1]&&r[1][0]);}
// each player reaches a hub region (any free cell of the courtyard, the room or the street) with the box given (default: the bench on the ground)
function bench36Free(positions,box){positions=positions||[benchPos36(0),benchPos36(1)];const w=benchGridWith36(box===undefined?bench36GroundBox():box),G=BENCH_GRID36;
 return positions.every(p=>{const seen=benchBFS36(w,p[0],p[1]);for(const [x1,x2,z1,z2] of BENCH36.HUBS){const i0=Math.ceil((x1-G.x0)/G.s),i1=Math.floor((x2-G.x0)/G.s),j0=Math.ceil((z1-G.z0)/G.s),j1=Math.floor((z2-G.z0)/G.s);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const n=i*G.nz+j;if(seen[n]&&!w[n])return true;}}return false;});}

/* ---------- 1.4 The crate and the room lane ---------- */
function benchCrateIntrudes36(cx,cz){const B=BENCH36,ax=B.HX+0.85,az=B.HZ+0.85;
 for(const [x,z,d] of B.REF){const t=d*D2R36,c=Math.cos(t),s=Math.sin(t),dx=cx-x,dz=cz-z;if(Math.abs(dx*c-dz*s)<ax&&Math.abs(dx*s+dz*c)<az)return true;}
 for(const [x1,x2,z1,z2] of B.KEEP)if(cx+0.35>x1&&cx-0.35<x2&&cz+0.35>z1&&cz-0.35<z2)return true;return false;}
function benchCrateCheck36(){if(typeof crate==='undefined'||!crate)return false;if(!benchCrateIntrudes36(crate.position.x,crate.position.z))return false;
 for(const [x,z] of BENCH36.CRATE_SPOTS){if(blocked(x,z,0.36,{noCrate:true}))continue;if(players.some(p=>Math.hypot(p.g.position.x-x,p.g.position.z-z)<0.8))continue;
  crate.position.x=x;crate.position.z=z;if(S)S.crate=[x,z];benchToast36('Somebody pushed the crate out of the way for you.');return true;}
 return false;}
// the first piece whose footprint covers the bench's veranda slot or the room lane: {item, place} or null
function benchPreflight36(){const cells=[...BENCH36.SLOT_CELLS.map(c=>c.concat('slot')),...BENCH36.LANE_CELLS.map(c=>c.concat('lane'))];
 for(const it of (S.home&&S.home.items)||[]){const d=ITEMS[it.type];if(!d||d.flat||d.wall||it.type==='bench')continue;const [w,h]=footprint34(it.type,it.rot||0);
  for(const [cx,cy,k] of cells)if(cx>=it.x&&cx<it.x+w&&cy>=it.y&&cy<it.y+h)return {item:it,place:k};}return null;}
function benchPreflightText36(r){const nm=String(ITEMS[r.item.type].name||r.item.type).toLowerCase();
 return `Ada’s bench needs the way clear. Move the ${nm} off ${r.place==='slot'?'the west end of the veranda':'the front of the room by the door'} in Home first.`;}
// wrap: while a delivery is open, no other piece may cover the bench's veranda slot or the room lane
const prevFits36=fitsHome34;fitsHome34=function(type,x,y,rot,ignore){const ok=prevFits36.apply(this,arguments);if(!ok||!benchOpen36()||type==='bench')return ok;
 const [w,h]=footprint34(type,rot||0);for(const [cx,cy] of BENCH36.SLOT_CELLS.concat(BENCH36.LANE_CELLS))if(cx>=x&&cx<x+w&&cy>=y&&cy<y+h)return false;return true;};

/* ---------- meshes: the bench, grip wraps, stand rings, chevron, ghost, dust ---------- */
function benchMat36(color,opacity){const m=new THREE.MeshLambertMaterial({color});if(opacity!==undefined){m.transparent=true;m.opacity=opacity;m.depthWrite=false;}return m;}
function benchModel36(ghost){let inst=typeof PROPS!=='undefined'&&PROPS.cache.bench_wooden?propInstance('bench_wooden',{scale:1}):null;
 if(inst){inst.traverse(o=>{if(o.isMesh){o.material=o.material.clone();if(ghost){o.material.transparent=true;o.material.opacity=0.72;o.material.depthWrite=false;o.castShadow=false;if(o.material.emissive){o.material.emissive.set('#F2B33D');o.material.emissiveIntensity=0.45;}}}});return inst;}
 const g=new THREE.Group();g.userData.fallback36=true;const m=ghost?benchMat36('#B98A5E',0.45):benchMat36('#B98A5E');
 const add=(w,h,d,x,y,z)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y+h/2,z);g.add(b);};
 add(1.5,0.04,0.45,0,0.42,0);add(1.5,0.3,0.04,0,0.5,-0.23);for(const x of [-0.62,0.62])for(const z of [-0.18,0.18])add(0.05,0.42,0.05,x,0,z);
 if(typeof propLoad==='function')propLoad('bench_wooden',()=>{benchRemodel36();});return g;}
function benchRemodel36(){const B=BENCH36;if(B.g){const old=B.g.children.find(c=>c.userData&&c.userData.fallback36);if(old&&PROPS.cache.bench_wooden){B.g.remove(old);B.g.add(benchModel36(false));}}
 if(B.mesh.ghost&&B.mesh.ghost.children.some(c=>c.userData&&c.userData.fallback36)){scene.remove(B.mesh.ghost);B.mesh.ghost=null;}
 if(B.state==='placed'||B.state==='seated')try{rebuildFurniture();}catch(e){}}
function benchBuildMesh36(){const B=BENCH36;benchDropMesh36();const g=new THREE.Group();g.name='bench36';g.add(benchModel36(false));
 B.wraps=[0,1].map(e=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,0.10,10),benchMat36(B.COL.wrap));m.rotation.z=Math.PI/2;m.position.set(e?B.GRIP:-B.GRIP,0.44,0);m.name='bench36-wrap';g.add(m);return m;});
 scene.add(g);B.g=g;
 B.mesh.rings=[0,1].map(()=>{const r=new THREE.Mesh(new THREE.RingGeometry(0.2,0.28,28),new THREE.MeshBasicMaterial({color:'#F1E4CC',transparent:true,opacity:0.5,depthWrite:false}));r.rotation.x=-Math.PI/2;r.position.y=0.025;r.visible=false;r.name='bench36-ring';scene.add(r);return r;});
 const sh=new THREE.Shape();sh.moveTo(-0.25,-0.1);sh.lineTo(0,0.15);sh.lineTo(0.25,-0.1);sh.lineTo(0.25,-0.22);sh.lineTo(0,0.03);sh.lineTo(-0.25,-0.22);sh.closePath();
 const ch=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:'#F2E3B5',transparent:true,opacity:0.35,depthWrite:false}));ch.rotation.x=-Math.PI/2;ch.position.y=0.03;ch.visible=false;ch.name='bench36-chevron';scene.add(ch);B.mesh.chev=ch;
 benchDrawMesh36();}
function benchDropMesh36(){const B=BENCH36;if(B.g){scene.remove(B.g);B.g=null;}for(const r of B.mesh.rings)scene.remove(r);B.mesh.rings=[];if(B.mesh.chev){scene.remove(B.mesh.chev);B.mesh.chev=null;}
 if(B.mesh.ghost){scene.remove(B.mesh.ghost);B.mesh.ghost=null;}for(const m of B.motes)scene.remove(m.m);B.motes=[];}
function benchFade36(g,o){if(!g)return;g.traverse(m=>{if(m.isMesh&&m.material){m.material.transparent=o<1;m.material.opacity=o;}});g.visible=o>0.001;}
function benchRoleColour36(e){const B=BENCH36,h=B.holder[e];if(h===null||h===undefined)return null;return h===B.mover?B.COL.move:B.COL.turn;}
// the mesh at the pose: lifted while carried, recoil after a bump, wraps and rings in the role colours
function benchDrawMesh36(){const B=BENCH36,g=B.g;if(!g)return;const p=B.pose;let ox=0,oz=0;
 if(B.recoil){const k=Math.max(0,1-(B.t-B.recoil.t0)/0.12);ox=B.recoil.dx*0.015*k;oz=B.recoil.dz*0.015*k;if(k<=0)B.recoil=null;}
 const veranda=p.z>5.9&&p.x<-2.6?0.05:0;g.position.set(p.x+ox,B.y+veranda,p.z+oz);g.rotation.y=p.yaw;g.visible=!B.paused&&(B.state!=='settling'||!B.settle||B.settle.kind!=='done');
 for(const e of [0,1]){const col=benchRoleColour36(e)||B.COL.wrap;if(B.wraps&&B.wraps[e])B.wraps[e].material.color.set(col);
  const r=B.mesh.rings[e];if(!r)continue;const [x,z]=benchEnd36(p,e);r.position.x=x;r.position.z=z;
  const show=!B.paused&&(B.state==='grounded'||B.state==='ready')&&players.some(q=>Math.hypot(q.g.position.x-p.x,q.g.position.z-p.z)<3);r.visible=show;r.material.color.set(benchRoleColour36(e)||'#F1E4CC');}
 const ch=B.mesh.chev;if(ch){const W=bench36NextCorner(0);ch.visible=!B.paused&&B.state==='carrying'&&!!W;if(W){ch.position.x=W.x;ch.position.z=W.z;ch.rotation.z=Math.atan2(W.x-p.x,-(W.z-p.z));}}}
function benchMotes36(x,z){const B=BENCH36;for(let k=0;k<3;k++){const m=new THREE.Mesh(new THREE.SphereGeometry(0.035,6,4),new THREE.MeshBasicMaterial({color:'#D9C7A3',transparent:true,opacity:0.7,depthWrite:false}));
 m.position.set(x+(k-1)*0.08,0.12+0.05*k,z+((k*7)%3-1)*0.06);scene.add(m);B.motes.push({m,t0:B.t,vy:0.25+0.1*k});}}
function benchMotesStep36(dt){const B=BENCH36;for(let k=B.motes.length-1;k>=0;k--){const o=B.motes[k],a=(B.t-o.t0)/0.5;if(a>=1){scene.remove(o.m);B.motes.splice(k,1);continue;}o.m.position.y+=o.vy*dt;o.m.material.opacity=0.7*(1-a);}}
// a soft wooden "tok" through the v35 audio bus, only when it already exists and sound is on; never creates a context or a recipe
function benchTok36(){try{if(typeof AUDIO35==='undefined'||!AUDIO35.ctx||!AUDIO35.master||!AUDIO35.on())return;const c=AUDIO35.ctx;if(c.state!=='running')return;const t=c.currentTime+0.005;
 const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(240,t);o.frequency.exponentialRampToValueAtTime(110,t+0.09);
 g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.35,t+0.006);g.gain.exponentialRampToValueAtTime(0.0001,t+0.12);o.connect(g);g.connect(AUDIO35.master);o.start(t);o.stop(t+0.14);}catch(e){}}

/* ---------- 2. The state machine ---------- */
function bench36State(){return BENCH36.state;}
function bench36Role(i){const B=BENCH36;if(B.paused)return null;const h=benchHolderOf36(i);
 if(h>=0&&(B.state==='ready'||B.state==='carrying'))return i===B.mover?'move':'turn';
 if(B.state==='grounded'||B.state==='ready'){const p=players[i];if(p&&Math.hypot(p.g.position.x-B.pose.x,p.g.position.z-B.pose.z)<3)return i===B.mover?'move':'turn';}
 return null;}
function bench36Pose(){return {x:BENCH36.pose.x,z:BENCH36.pose.z,yaw:BENCH36.pose.yaw};}
function bench36Holders(){return BENCH36.holder.slice();}
function bench36NextCorner(i){const B=BENCH36;if(B.state!=='carrying'&&B.state!=='ready'&&B.state!=='grounded')return null;return B.ROUTE[B.corner]||null;}
function benchSetState36(s){const B=BENCH36;if(B.state!==s){B.states.push(s);if(B.states.length>400)B.states.shift();B.transT=B.t;B.hudLive=3;}B.state=s;B.seq++;benchHUD36();}
function benchStats36(){return BENCH36.stats||(BENCH36.stats={dur:0,bumps:0,setdowns:0,swaps:0,resets:0,lifted:false});}
function benchResetMotion36(){const B=BENCH36;B.vel.s=0;B.vel.w=0;B.latch=[null,null];B.wall.s=0;B.wall.w=0;B.outT=[0,0];B.wallAcc.s=0;B.wallAcc.w=0;}
function benchFreeSpot36(x,z,box){return !blocked(x,z,PR,{noBench:true})&&!(box&&bench36CircleOBB(x,z,PR,box))&&carryLevelOK34(x,z);}
// the nearest free point on rings of 0.1-0.6 m around (x,z), outside the box (the frontSpot34b pattern)
function benchRing36(x,z,box,avoid){if(benchFreeSpot36(x,z,box)&&!(avoid&&avoid(x,z)))return [x,z];
 for(let rad=0.1;rad<=0.601;rad+=0.1)for(let k=0;k<16;k++){const an=k/16*Math.PI*2,a=x+Math.sin(an)*rad,b=z+Math.cos(an)*rad;if(benchFreeSpot36(a,b,box)&&!(avoid&&avoid(a,b)))return [a,b];}return null;}
// 2.2 step 1: each holder (or each player standing at an end) moves outward along the axis to 1.10, or to the nearest free ring point
function benchNudged36(pose,who){const box=benchBox36(pose,0),out=[benchPos36(0),benchPos36(1)];
 for(const e of [0,1]){const i=who?who[e]:BENCH36.holder[e];if(i===null||i===undefined)continue;const [x,z]=benchEnd36(pose,e,BENCH36.HX+PR+0.01),[sx,sz]=benchEnd36(pose,e);
  const spot=benchFreeSpot36(x,z,box)?[x,z]:benchRing36(sx,sz,box);if(!spot)return null;out[i]=spot;}
 for(const i of [0,1]){if(bench36CircleOBB(out[i][0],out[i][1],PR,box)){const s=benchRing36(out[i][0],out[i][1],box);if(!s)return null;out[i]=s;}}
 return out;}
function benchPlace36(i,x,z,face){const p=players[i];if(!p)return;p.g.position.x=x;p.g.position.z=z;p.prev=[x,z];p.y=levelAt(x,z);p.lvl=lvlOf(p.y);p.g.baseY=p.y;if(face)p.g.rotation.y=Math.atan2(face[0]-x,face[1]-z);}
function benchTrapName36(pose,pos){const w=benchGridWith36(benchBox36(pose,0)),ends=[benchEnd36(pose,0),benchEnd36(pose,1)];
 for(const i of [0,1]){const seen=benchBFS36(w,pos[i][0],pos[i][1]);if(!ends.some(e=>benchReachNear36(seen,w,e[0],e[1],BENCH36.TAKE)))return benchPlayerName36(i);}return benchPlayerName36(1);}
// set-down, let-go and the automatic set-down: nudge the holders, check the pose is liftable, else nudge the bench (a short glide) or refuse
function benchSafeDown36(by,why){const B=BENCH36,pose=bench36Pose();
 let pos=benchNudged36(pose);if(pos&&bench36Liftable(pose,pos)){benchFinishDown36(pose,pos,why);return true;}
 const a=benchAxis36(pose.yaw),cands=[];for(let k=1;k<=6;k++)for(const sg of [1,-1])cands.push({x:pose.x+a[0]*0.05*k*sg,z:pose.z+a[1]*0.05*k*sg,yaw:pose.yaw});
 for(let k=1;k<=3;k++)for(const sg of [1,-1])cands.push({x:pose.x,z:pose.z,yaw:pose.yaw+sg*5*k*D2R36});
 for(const c of cands){if(!bench36Valid(c)||!benchLineValid36(pose,c))continue;const q=benchNudged36(c);if(!q||!bench36Liftable(c,q))continue;
  B.glide={from:pose,to:c,t:0,dur:0.2,pos:q,why};benchToast36('Bit further… there.');return true;}
 if(why!=='system')benchToast36(`Not here, it would box ${benchTrapName36(pose,pos||[benchPos36(0),benchPos36(1)])} in. Move a little first.`);return false;}
function benchLineValid36(a,b){const n=Math.max(1,Math.ceil(Math.max(Math.hypot(b.x-a.x,b.z-a.z)/0.01,Math.abs(benchWrapA36(b.yaw-a.yaw))/D2R36)));
 for(let k=1;k<=n;k++){const t=k/n;if(!bench36Valid({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:a.yaw+benchWrapA36(b.yaw-a.yaw)*t}))return false;}return true;}
function benchFinishDown36(pose,pos,why){const B=BENCH36;B.pose={x:pose.x,z:pose.z,yaw:pose.yaw};
 for(const i of [0,1])if(benchHolderOf36(i)>=0)benchPlace36(i,pos[i][0],pos[i][1],[pose.x,pose.z]);
 B.holder=[null,null];benchResetMotion36();B.liftDir=-1;B.glide=null;if(why!=='letgo'&&why!=='system')benchStats36().setdowns++;
 benchSetState36('grounded');benchProgress36();if(benchInZone36(pose,pos))benchDeliver36(pos);benchCheckStuck36();}

// 2.1 the delivery zone: one holder on the row, the other in the room, either way round; the centre in the doorway
function benchInZone36(pose,pos){if(!(pose.x>-4.6&&pose.x<-3.6))return false;return (pos[0][1]>5.9&&pos[1][1]<5.55)||(pos[1][1]>5.9&&pos[0][1]<5.55);}
function benchCheckStuck36(){const B=BENCH36;if(B.state!=='grounded')return;B.liftCheckT=B.t;const ok=bench36Liftable(B.pose,[benchPos36(0),benchPos36(1)]);if(!ok){B.stuck=true;B.stuckAcc=0;}}

function benchTake36(i){const B=BENCH36,p=players[i];if(!p||p.g.sitting)return false;
 let best=-1,bd=1e9;for(const e of [0,1]){const [x,z]=benchEnd36(B.pose,e),d=Math.hypot(p.g.position.x-x,p.g.position.z-z);if(d<=B.TAKE&&d<bd){bd=d;best=e;}}
 if(best<0)return false;
 if(B.holder[best]!==null&&B.holder[best]!==i){if(B.state==='ready'&&B.holder[1-best]===null){const [x,z]=benchEnd36(B.pose,1-best);if(Math.hypot(p.g.position.x-x,p.g.position.z-z)<=B.TAKE)return benchLift36(i);}
  benchToast36(`${benchPlayerName36(B.holder[best])} has that end. Take the other one.`);return true;}
 if(B.state==='ready'&&B.holder[1-best]!==null&&B.holder[1-best]!==i)return benchLift36(i);
 const [x,z]=benchEnd36(B.pose,best);if(blocked(x,z,PR,{noBench:true})||!carryLevelOK34(x,z)){benchToast36('That end is wedged. Try the other one.');return true;}
 B.holder[best]=i;B.takeFrame=B.frame;B.takeEnd=best;B.snap={i,from:benchPos36(i),to:[x,z],t:0};B.letGoT=0;if(typeof playPick==='function')playPick(p.g);
 benchSetState36('ready');return true;}
function benchLift36(j){const B=BENCH36,e=B.holder[0]===null?0:1;if(B.holder[1-e]===null||B.holder[1-e]===j)return false;const [x,z]=benchEnd36(B.pose,e);
 if(blocked(x,z,PR,{noBench:true})||!carryLevelOK34(x,z)){benchToast36('That end is wedged. Set it straight first.');return true;}
 B.holder[e]=j;B.front=B.holder[0]===B.mover?0:1;B.snap={i:j,from:benchPos36(j),to:[x,z],t:0};B.liftDir=1;benchResetMotion36();
 for(const k of [0,1])if(players[k]&&typeof playPick==='function')playPick(players[k].g);
 const st=benchStats36();st.lifted=true;const L=benchSave36();if(L&&(L.hints||0)<2){L.hints=(L.hints||0)+1;B.hintUntil=B.t+12;}
 benchSetState36('carrying');B.corner=benchCornerFor36();benchToast36(`Lifted. ${benchPlayerName36(B.mover)} walks it, ${benchPlayerName36(1-B.mover)} steers.`);return true;}
function benchSwap36(){const B=BENCH36;B.mover=1-B.mover;benchStats36().swaps++;const L=benchSave36();if(L)L.mover=B.mover;benchHUD36();benchDrawMesh36();return true;}

/* ---------- 3. Complementary controls ---------- */
// wrap: holders, players choosing, the bench while it settles and bench-seated players give no walking input; the raw vector is kept
const prevInput36=inputVec;inputVec=function(i){const B=BENCH36;if(B.state==='off'||B.state==='placed')return prevInput36.apply(this,arguments);
 const p=players[i],seated=B.state==='seated'&&p&&p.g.sitting;let raw;
 if(seated){p.g.sitting=false;try{raw=prevInput36.apply(this,arguments);}finally{p.g.sitting=true;}}else raw=prevInput36.apply(this,arguments);
 B.raw[i]=[raw[0],raw[1]];if(B.paused)return raw;
 if(seated||B.state==='choosing'||B.state==='settling')return [0,0];
 if((B.state==='ready'||B.state==='carrying')&&benchHolderOf36(i)>=0)return [0,0];return raw;};
function benchLatch36(role,u,dir,dt){const B=BENCH36,m=Math.hypot(u[0],u[1]),pressed=m>0.2;let L=B.latch[role];
 if(!pressed){B.latch[role]=null;B.outT[role]=0;B.relT[role]+=dt;return null;}B.relT[role]=0;const ux=u[0]/m,uz=u[1]/m;
 if(L&&ux*L.ref[0]+uz*L.ref[1]>=0)return L;                                     // held within 90 degrees of the press: latched whatever the cone says
 const p=ux*dir[0]+uz*dir[1];if(Math.abs(p)>=B.CONE){L=B.latch[role]={sign:p>0?1:-1,ref:[ux,uz]};B.outT[role]=0;return L;}
 B.latch[role]=null;B.outT[role]+=dt;return null;}
function benchApproach36(v,target,up,down,dt){
 if(target!==0&&(v===0||(Math.sign(v)===Math.sign(target)&&Math.abs(target)>Math.abs(v)))){const n=Math.abs(v)+up*dt;return Math.sign(target)*Math.min(Math.abs(target),n);}
 const goal=target!==0&&Math.sign(target)===Math.sign(v)?target:0;if(v>goal)return Math.max(goal,v-down*dt);if(v<goal)return Math.min(goal,v+down*dt);return v;}
function benchPropose36(p,ds,dw){const a=benchAxis36(p.yaw),f=BENCH36.front?1:-1;return {x:p.x+a[0]*f*ds,z:p.z+a[1]*f*ds,yaw:p.yaw+dw};}
function benchOK36(p,ds,dw){const q=benchPropose36(p,ds,dw);if(!bench36Valid(q))return null;if(dw&&!bench36Valid(benchPropose36(p,ds,dw/2)))return null;return q;}
function benchBumpCue36(dirx,dirz,cx,cz){const B=BENCH36;if(B.t-B.lastBumpT<0.4)return;B.lastBumpT=B.t;B.bump++;benchStats36().bumps++;
 const m=Math.hypot(dirx,dirz)||1;B.recoil={dx:-dirx/m,dz:-dirz/m,t0:B.t};benchMotes36(cx,cz);benchTok36();}
function benchCarryStep36(dt){const B=BENCH36,m=B.mover,t=1-m,a0=benchAxis36(B.pose.yaw),f=B.front?1:-1,a=[a0[0]*f,a0[1]*f],e=[Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f];
 // e: the direction the turner's (rear) end moves as yaw grows
 const um=B.raw[m]||[0,0],ut=B.raw[t]||[0,0],Lm=benchLatch36(0,um,a,dt),Lt=benchLatch36(1,ut,e,dt);
 if(B.wall.s&&(!Lm||Lm.sign!==B.wall.s)&&(B.relT[0]>=0.15||(Lm&&Lm.sign!==B.wall.s)))B.wall.s=0;
 if(B.wall.w&&(!Lt||Lt.sign!==B.wall.w)&&(B.relT[1]>=0.15||(Lt&&Lt.sign!==B.wall.w)))B.wall.w=0;
 const moving=!!(Lm||Lt||B.vel.s||B.vel.w);let cap=1;
 if(moving){benchBroad36();cap=bench36Valid(B.pose,0.20)?1:bench36Valid(B.pose,0.10)?0.7:0.4;}
 let sT=Lm?Lm.sign*Math.min(1,Math.hypot(um[0],um[1]))*B.V*cap:0,wT=Lt?Lt.sign*Math.min(1,Math.hypot(ut[0],ut[1]))*B.WMAX*cap:0;
 if(B.wall.s&&Math.sign(sT)===B.wall.s)sT=0;if(B.wall.w&&Math.sign(wT)===B.wall.w)wT=0;
 B.vel.s=benchApproach36(B.vel.s,sT,B.V/B.RAMP,B.V/B.STOP,dt);B.vel.w=benchApproach36(B.vel.w,wT,B.WMAX/B.RAMP,B.WMAX/B.STOP,dt);
 const before=bench36Pose();
 if(B.vel.s||B.vel.w){const n=Math.max(1,Math.ceil(Math.max(Math.abs(B.vel.s)*dt/0.04,Math.abs(B.vel.w)*dt/(3*D2R36))));const h=dt/n;
  for(let k=0;k<n;k++){B.cost.substeps++;const ds=B.vel.s*h,dw=B.vel.w*h;if(!ds&&!dw)break;let q=null,usedS=false,usedW=false;
   if(ds&&dw){q=benchOK36(B.pose,ds,dw);if(q){usedS=usedW=true;}}
   if(!q&&ds){q=benchOK36(B.pose,ds,0);if(q)usedS=true;}
   if(!q&&dw){q=benchOK36(B.pose,0,dw);if(q)usedW=true;}
   if(q){const dx=q.x-B.pose.x,dz=q.z-B.pose.z;B.wallAcc.w+=Math.hypot(dx,dz);B.wallAcc.s+=Math.abs(q.yaw-B.pose.yaw);B.pose=q;}
   // gentle stop: a refused component is bisected to contact, stopped and latched against that wall
   // (one bisection a sub-step, five endpoint tests: the per-sub-step budget of 24 blocked() calls and 12 box tests)
   let bis=false;
   if(ds&&!usedS){bis=true;let lo=0,hi=1;for(let it=0;it<5;it++){const mid=(lo+hi)/2;if(bench36Valid(benchPropose36(B.pose,ds*mid,0)))lo=mid;else hi=mid;}if(lo>0)B.pose=benchPropose36(B.pose,ds*lo,0);
    B.vel.s=0;B.wall.s=Math.sign(ds);B.wallAcc.s=0;const end=benchEnd36(B.pose,ds*f>0?1:0,B.HX);benchBumpCue36(a[0]*Math.sign(ds),a[1]*Math.sign(ds),end[0],end[1]);}
   if(dw&&!usedW){if(!bis){let lo=0,hi=1;for(let it=0;it<5;it++){const mid=(lo+hi)/2;if(bench36Valid(benchPropose36(B.pose,0,dw*mid)))lo=mid;else hi=mid;}if(lo>0)B.pose=benchPropose36(B.pose,0,dw*lo);}
    B.vel.w=0;B.wall.w=Math.sign(dw);B.wallAcc.w=0;const re=benchEnd36(B.pose,B.front?0:1,B.HX);benchBumpCue36(e[0]*Math.sign(dw),e[1]*Math.sign(dw),re[0],re[1]);}
   if(!B.vel.s&&!B.vel.w)break;}}
 if(B.wall.s&&B.wallAcc.s>=2*D2R36)B.wall.s=0;if(B.wall.w&&B.wallAcc.w>=0.02)B.wall.w=0;
 const moved=Math.hypot(B.pose.x-before.x,B.pose.z-before.z),turned=Math.abs(B.pose.yaw-before.yaw);B.movedPrev=moved>0.0005||turned>0.05*D2R36;
 // stuck: accepted input that a wall then refused, held
 const pushW=(B.wall.s&&Lm&&Lm.sign===B.wall.s)||(B.wall.w&&Lt&&Lt.sign===B.wall.w);
 if(pushW)B.stuckT+=dt;else B.stuckT=Math.max(0,B.stuckT-dt/2);
 if(B.stuckT>=2.5&&!B.stuck){B.stuck=true;B.stuckAcc=0;benchHUD36();}
 if(B.stuck){B.stuckAcc+=moved+turned*(1/(30*D2R36));if(B.stuckAcc>=1){B.stuck=false;B.stuckT=0;benchHUD36();}}
 benchHolders36();}
function benchHolders36(){const B=BENCH36;for(const e of [0,1]){const i=B.holder[e];if(i===null)continue;const p=players[i];if(!p)continue;const [x,z]=benchEnd36(B.pose,e);
 if(B.snap&&B.snap.i===i&&B.snap.t<0.15)continue;p.g.position.x=x;p.g.position.z=z;p.prev=[x,z];p.g.rotation.y=Math.atan2(B.pose.x-x,B.pose.z-z);}}

/* ---------- the per-frame step (from the updateBall wrapper; skipped while a panel is open) ---------- */
function bench36Step(dt){const B=BENCH36,s=B.state;if(s!=='ready'&&s!=='carrying'&&s!=='choosing'&&s!=='settling'&&s!=='seated'&&s!=='grounded')return;
 if(!S||!S.p||!players.length)return;B.frame++;dt=Math.max(0,Math.min(+dt||0,0.05));B.t+=dt;
 if(S.phase!=='play'){if(s==='seated')bench36StandUp();else if(s==='carrying')benchSafeDown36(null,'system');return;}
 if(s==='seated'){benchSeatedStep36(dt);return;}
 if(!benchLocal36()){if(!B.paused)benchPause36();return;}else if(B.paused)benchResume36();
 benchMotesStep36(dt);
 if(B.snap){B.snap.t+=dt;const k=Math.min(1,B.snap.t/0.15),i=B.snap.i;benchPlace36(i,B.snap.from[0]+(B.snap.to[0]-B.snap.from[0])*k,B.snap.from[1]+(B.snap.to[1]-B.snap.from[1])*k,[B.pose.x,B.pose.z]);if(k>=1)B.snap=null;}
 if(B.liftDir){B.liftT=Math.max(0,Math.min(1,B.liftT+dt/(B.liftDir>0?0.3:0.25)*B.liftDir));B.y=B.LIFT*B.liftT;if(B.liftT<=0||B.liftT>=1)B.liftDir=0;}
 const sig=benchGridSig36();if(B.grid&&B.grid.sig!==sig){benchGridBuild36();if(B.state==='grounded')benchCheckStuck36();}
 if(s==='carrying'){const st=benchStats36();st.dur+=dt;
  if(B.glide){B.glide.t+=dt;const g=B.glide,k=Math.min(1,g.t/g.dur);B.pose={x:g.from.x+(g.to.x-g.from.x)*k,z:g.from.z+(g.to.z-g.from.z)*k,yaw:g.from.yaw+benchWrapA36(g.to.yaw-g.from.yaw)*k};benchHolders36();
   if(k>=1)benchFinishDown36(g.to,g.pos,g.why);}
  else{benchCarryStep36(dt);benchProgress36();benchCorner36();
   if(B.state==='carrying'&&benchZoneNow36()){benchAutoDown36();}}}
 else if(s==='ready'){const e=B.holder[0]!==null?0:1,i=B.holder[e];if(i!==null&&!B.snap){const [x,z]=benchEnd36(B.pose,e);benchPlace36(i,x,z,[B.pose.x,B.pose.z]);
   const u=B.raw[i]||[0,0],m=Math.hypot(u[0],u[1]),tx=B.pose.x-x,tz=B.pose.z-z,tl=Math.hypot(tx,tz)||1;
   if(m>0.2&&(u[0]*tx+u[1]*tz)/(m*tl)<-0.3){B.letGoT+=dt;if(B.letGoT>=0.4){B.letGoT=0;benchLetGo36(i);}}else B.letGoT=0;}}
 else if(s==='grounded'){if(B.t-B.liftCheckT>=1.0)benchCheckStuck36();}
 else if(s==='choosing')benchChooseStep36(dt);
 else if(s==='settling')benchSettleStep36(dt);
 benchDrawMesh36();}
function benchZoneNow36(){const B=BENCH36,p0=benchPos36(B.holder[0]),p1=benchPos36(B.holder[1]);if(!(B.pose.x>-4.6&&B.pose.x<-3.6))return false;return (p0[1]>5.9&&p1[1]<5.55)||(p1[1]>5.9&&p0[1]<5.55);}
function benchLetGo36(i){const B=BENCH36;const pos=benchNudged36(B.pose);if(!pos||!bench36Liftable(B.pose,pos)){benchToast36(`Not here, it would box ${benchTrapName36(B.pose,pos||[benchPos36(0),benchPos36(1)])} in. Move a little first.`);return false;}
 benchPlace36(i,pos[i][0],pos[i][1]);B.holder=[null,null];benchSetState36('grounded');return true;}
// 2.1: reaching the delivery zone sets the bench down in the doorway and opens the chooser
function benchAutoDown36(){const B=BENCH36,q=benchNudged36(B.pose);if(q)for(const i of [0,1])if(benchHolderOf36(i)>=0)benchPlace36(i,q[i][0],q[i][1],[B.pose.x,B.pose.z]);const pos=[benchPos36(0),benchPos36(1)];B.holder=[null,null];benchResetMotion36();B.liftDir=-1;benchDeliver36(pos);}
function bench36Deliver(){if(BENCH36.state!=='carrying'&&BENCH36.state!=='grounded')return false;benchAutoDown36();return true;}
function benchDeliver36(pos){const B=BENCH36;B.delivered=true;B.holder=[null,null];const L=benchSave36();B.choice=L&&L.again&&L.choice?L.choice:'out';B.agree=[false,false];
 benchSetState36('choosing');B.okCache=null;benchChooserOpen36();}
function benchProgress36(){const B=BENCH36;for(let k=B.CHECK.length-1;k>B.progress-1&&k>=0;k--){const c=B.CHECK[k];if(Math.hypot(B.pose.x-c.x,B.pose.z-c.z)<=1.0){B.progress=Math.max(B.progress,k);break;}}}
function benchCornerFor36(){const B=BENCH36;let best=0,bd=1e9;for(let k=0;k<B.ROUTE.length;k++){const w=B.ROUTE[k],d=Math.hypot(B.pose.x-w.x,B.pose.z-w.z);if(d<bd){bd=d;best=k;}}
 return Math.min(B.ROUTE.length-1,bd<0.8?best+1:best);}
function benchCorner36(){const B=BENCH36,W=B.ROUTE[B.corner];if(W&&Math.hypot(B.pose.x-W.x,B.pose.z-W.z)<0.8&&B.corner<B.ROUTE.length-1){B.corner++;return;}
 if(B.corner>0){const P=B.ROUTE[B.corner-1],back=B.corner>1?B.ROUTE[B.corner-2]:B.START;if(Math.hypot(B.pose.x-P.x,B.pose.z-P.z)>3&&Math.hypot(B.pose.x-back.x,B.pose.z-back.z)<Math.hypot(B.pose.x-W.x,B.pose.z-W.z))B.corner--;}}

/* ---------- 4.3 Reset ---------- */
function benchSpawnSpot36(){const B=BENCH36;for(const c of [B.START].concat(B.START_ALT)){const p={x:c.x,z:c.z,yaw:c.yaw*D2R36},box=benchBox36(p,PR);
 if(!bench36ObbHit(p,0,{})&&!players.some(q=>bench36CircleOBB(q.g.position.x,q.g.position.z,0,box)))return p;}return {x:B.START.x,z:B.START.z,yaw:0};}
function bench36Reset(){const B=BENCH36;if(!benchOpen36()||B.state==='choosing'||B.state==='settling')return false;benchStats36().resets++;
 const from=bench36Pose(),pos=[benchPos36(0),benchPos36(1)];B.holder=[null,null];benchResetMotion36();B.glide=null;benchCrateCheck36();
 let dest=null;for(let k=B.progress;k>=0;k--){const c=B.CHECK[k],p={x:c.x,z:c.z,yaw:c.yaw*D2R36};if(Math.abs(p.x-from.x)<1e-6&&Math.abs(p.z-from.z)<1e-6)continue;
  if(!bench36Valid(p))continue;const box=benchBox36(p,0),np=pos.map(q=>bench36CircleOBB(q[0],q[1],PR,box)?benchRing36(q[0],q[1],box):q);if(np.some(q=>!q))continue;if(bench36Liftable(p,np)){dest=p;np.forEach((q,i)=>{if(q!==pos[i])benchPlace36(i,q[0],q[1]);});break;}}
 if(!dest){dest=benchSpawnSpot36();B.GATE_SPOTS.forEach(([x,z],i)=>{const s=benchRing36(x,z,benchBox36(dest,0))||[x,z];benchPlace36(i,s[0],s[1]);});}
 B.pose=dest;B.y=0;B.liftT=0;B.liftDir=0;B.stuck=false;B.stuckT=0;B.corner=benchCornerFor36();benchSetState36('grounded');benchMotes36(dest.x,dest.z);benchDrawMesh36();benchToast36('The bench is back where you can both reach it.');return true;}
// Menu "Put it down in the room for now": the room checkpoint if it is liftable with the players where they are, otherwise the gate
function bench36RoomDown(){const B=BENCH36;if(B.state!=='choosing')return false;benchHideGhost36();benchChooserClose36();
 const p={x:B.ROOM.x,z:B.ROOM.z,yaw:B.ROOM.yaw*D2R36},box=benchBox36(p,0);for(const i of [0,1]){const q=benchPos36(i);if(bench36CircleOBB(q[0],q[1],PR,box)){const s=benchRing36(q[0],q[1],box,(x,z)=>z>5.6);if(s)benchPlace36(i,s[0],s[1]);}}
 const pos=[benchPos36(0),benchPos36(1)];let dest=p;if(!bench36Valid(p)||!bench36Liftable(p,pos)){dest=benchSpawnSpot36();B.GATE_SPOTS.forEach(([x,z],i)=>{const s=benchRing36(x,z,benchBox36(dest,0))||[x,z];benchPlace36(i,s[0],s[1]);});}
 B.pose=dest;B.delivered=false;B.agree=[false,false];benchSetState36('grounded');benchMotes36(dest.x,dest.z);benchDrawMesh36();return true;}

/* ---------- 2.4-2.6 Modes: pause and resume ---------- */
function benchPause36(){const B=BENCH36;if(B.state==='carrying'){B.pose=bench36Pose();B.holder=[null,null];benchResetMotion36();B.y=0;B.liftT=0;benchSetState36('grounded');}
 if(B.state==='choosing'||B.state==='settling'){benchChooserClose36();benchHideGhost36();}
 const L=benchSave36();if(typeof NET!=='undefined'&&NET.on&&L&&L.again){bench36Cancel();return;}
 B.paused=true;benchDrawMesh36();benchArrows36(null);benchHUD36();}
function benchResume36(){const B=BENCH36;B.paused=false;if(B.state==='grounded'){const pos=[benchPos36(0),benchPos36(1)];if(!bench36Valid(B.pose)||!bench36Liftable(B.pose,pos)){const d=benchSpawnSpot36();B.pose=d;B.GATE_SPOTS.forEach(([x,z],i)=>{const s=benchRing36(x,z,benchBox36(d,0))||[x,z];benchPlace36(i,s[0],s[1]);});}}
 if(B.state==='choosing')benchChooserOpen36();benchDrawMesh36();benchHUD36();}
BENCH36.onPadGone=function(e){const B=BENCH36,k=e&&e.gamepad?e.gamepad.index:-1;if(B.state==='carrying'&&(B.holder[0]===k||B.holder[1]===k))benchSafeDown36(null,'system');};
if(typeof window!=='undefined'&&window.addEventListener)window.addEventListener('gamepaddisconnected',e=>BENCH36.onPadGone(e));

/* ---------- start, again, cancel ---------- */
function benchAvailable36(){return benchLocal36()&&S&&S.sofa&&S.sofa.state==='placed'&&(S.day>=2||!!BENCH36.flags);}
function bench36Start(){if(!S||!S.p)return false;if(!benchLocal36()){benchToast36('Carry Ada’s bench when you are both on one device.');return false;}
 if(S.sofa.state!=='placed'){benchToast36('Bring the sofa in first.');return false;}
 const L=benchSave36();if(L&&L.state==='placed')return bench36Again();if(benchOpen36())return false;
 const pf=benchPreflight36();if(pf){benchToast36(benchPreflightText36(pf));return false;}
 BENCH36.notePending=true;
 openPanel(`<h2>A note from Ada</h2><p class="bench36-note">Neighbours, the bench is at your gate. One of you in front to walk it, one behind to steer it. Mind my corners.</p><p class="bench36-note small">— Ada</p><div class="actions">${btn('Off we go','close',{},'primary block')}</div>`);
 return true;}
function benchSpawn36(again){const B=BENCH36;B.notePending=false;let L=benchSave36();life34();
 if(!L)L=S.life.bench36={v:1,state:'grounded',pos:[B.START.x,B.START.z],yaw:0,mover:0,choice:'out',deliveries:0,again:false,hints:0,placedDay:null,playtest:false,runs:[]};
 if(B.flags&&B.flags.value==='playtest'&&!B.flags.usedPlaytest){B.flags.usedPlaytest=true;L.playtest=true;}
 if(again){L.again=true;if(L.playtest)L.mover=1-(L.lastMover===undefined?(L.mover||0):L.lastMover);}
 B.mover=L.mover||0;B.choice=L.choice||'out';B.stats={dur:0,bumps:0,setdowns:0,swaps:0,resets:0,lifted:false};B.progress=0;B.delivered=false;B.paused=false;
 B.holder=[null,null];benchResetMotion36();B.stuck=false;B.stuckT=0;B.y=0;B.liftT=0;B.liftDir=0;B.glide=null;B.settle=null;
 benchCrateCheck36();B.pose=benchSpawnSpot36();benchGridBuild36();benchBuildMesh36();B.corner=benchCornerFor36();benchSetState36('grounded');
 if(again)rebuildFurniture();benchCheckStuck36();save();benchToast36('Grab an end each.');return true;}
function bench36Again(){const B=BENCH36,L=benchSave36();if(!L||L.state!=='placed'||!benchItem36()||!benchLocal36()||B.state==='seated'&&!bench36StandUp())return false;
 if(S.sofa.state!=='placed')return false;const pf=benchPreflight36();if(pf){benchToast36(benchPreflightText36(pf));return false;}
 if(benchOpen36())return false;return benchSpawn36(true);}
function bench36Cancel(){const B=BENCH36,L=benchSave36();if(!L||!L.again)return false;L.again=false;L.state='placed';benchDropMesh36();benchChooserClose36();benchArrows36(null);
 B.holder=[null,null];benchResetMotion36();B.paused=false;benchSetState36('placed');rebuildFurniture();save();return true;}

/* ---------- 6.1 The three arrangements ---------- */
function benchArrBox36(key){return benchBox36(benchPoseOf36(key),0);}
function bench36ArrangementOK(key,opts){opts=opts||{};const P=BENCH36.POSES[key];if(!P)return false;const pose=benchPoseOf36(key),box=benchBox36(pose,0),it=benchItem36();
 BENCH36.override=box;
 try{
  if(bench36ObbHit(pose,0,{}))return false;
  if(typeof fitsEditor34==='function'&&!opts.noPlayers&&!fitsEditor34('bench',0,FLAT.rows,0,it?it.id:undefined))return false;
  if(typeof fitsEditor34==='function'&&opts.noPlayers&&!fitsHome34('bench',0,FLAT.rows,0,it?it.id:undefined))return false;
  if(typeof TUNE35!=='undefined'&&TUNE35.reach){const s=cellToWorld(4,3);if(blocked(s[0],s[1]+0.05,PR,{noCrate:true,noSofa:true}))return false;
   const n0=TUNE35.reachRuns,miss=TUNE35.reach(S.home.items.filter(x=>x.type!=='bench'));if(miss.length||TUNE35.reachRuns!==n0+1)return false;}
  if(!opts.noPlayers&&players.some(p=>bench36CircleOBB(p.g.position.x,p.g.position.z,PR,box)))return false;
  for(const sx of [-0.36,0.36])for(const [lx,lz] of [[sx,0.03],[sx-0.1,0.38],[sx+0.1,0.38]]){const c=Math.cos(pose.yaw),s=Math.sin(pose.yaw),wz=pose.z-lx*s+lz*c;if(!(wz<6.95))return false;}
  const w=benchGridWith36(box),st=cellToWorld(4,3),seen=benchBFS36(w,st[0],st[1]+0.05);if(!benchSitReach36(seen,w,pose))return false;
  return true;}finally{BENCH36.override=null;}}
// a free, reachable cell within 1.0 m of the bench's front edge
function benchSitReach36(seen,w,pose){const G=BENCH_GRID36,c=Math.cos(pose.yaw),s=Math.sin(pose.yaw);
 for(let k=0;k<=10;k++){const lx=-0.75+0.15*k,lz=0.25,x=pose.x+lx*c+lz*s,z=pose.z-lx*s+lz*c;if(benchReachNear36(seen,w,x,z,1.0))return true;}return false;}
// the distance to the nearest point of the bench (players only reach it from its east end: the strip in front is narrower than a player)
function benchBoxDist36(pose,x,z){const c=Math.cos(pose.yaw),s=Math.sin(pose.yaw),dx=x-pose.x,dz=z-pose.z,lx=dx*c-dz*s,lz=dx*s+dz*c,qx=Math.max(-BENCH36.HX,Math.min(BENCH36.HX,lx)),qz=Math.max(-BENCH36.HZ,Math.min(BENCH36.HZ,lz));return Math.hypot(lx-qx,lz-qz);}
function benchFrontDist36(pose,x,z){const c=Math.cos(pose.yaw),s=Math.sin(pose.yaw),dx=x-pose.x,dz=z-pose.z,lx=dx*c-dz*s,lz=dx*s+dz*c;const qx=Math.max(-0.75,Math.min(0.75,lx));return Math.hypot(lx-qx,lz-0.25);}

/* ---------- 6.3 The chooser, the ghost, both agree, the glide ---------- */
function benchChooserOpen36(){const B=BENCH36;B.okCache={};for(const k of B.ORDER)B.okCache[k]=bench36ArrangementOK(k,{noPlayers:true});
 if(!B.okCache[B.choice]){const f=B.ORDER.find(k=>B.okCache[k]);if(f)B.choice=f;}benchShowGhost36();benchChooserRender36();benchHUD36();}
function benchShowGhost36(){const B=BENCH36;if(!B.mesh.ghost){const g=new THREE.Group();g.add(benchModel36(true));g.name='bench36-ghost';scene.add(g);B.mesh.ghost=g;}
 const p=benchPoseOf36(B.choice);B.mesh.ghost.position.set(p.x,0.05,p.z);B.mesh.ghost.rotation.y=p.yaw;B.mesh.ghost.visible=true;B.mesh.ghost.updateMatrixWorld(true);}
function benchHideGhost36(){const g=BENCH36.mesh.ghost;if(g)g.visible=false;}
function benchKeyHint36(i){const m=typeof lastInput!=='undefined'?lastInput[i]:'key';if(m==='pad')return 'stick · A';if(m==='touch')return 'stick · Act';return i?'← / → choose · ⏎ agree':'A / D choose · E agree';}
function benchStrip36(i){if(typeof document==='undefined')return null;const half=document.getElementById('half'+i);if(!half||!half.querySelector)return null;let el=half.querySelector('.bench36-pick');
 if(!el&&document.createElement){el=document.createElement('div');el.className='bench36-pick';const pr=document.getElementById('pr'+i);if(pr&&pr.parentNode===half&&half.insertBefore)half.insertBefore(el,pr);else half.appendChild(el);}return el;}
function benchChooserRender36(){const B=BENCH36;const all=B.ORDER.every(k=>B.okCache&&!B.okCache[k]);
 for(const i of [0,1]){const el=benchStrip36(i);if(!el)continue;const P=B.POSES[B.choice],ok=B.okCache&&B.okCache[B.choice];
  el.innerHTML=all?`<div class="t">Where should Ada’s bench go?</div><div class="d">The west end of the veranda isn’t free. Clear it, then bring the bench out again.</div>`:
   `<div class="t">Where should Ada’s bench go?</div><div class="sel${ok?'':' off'}"><span class="ar">◀</span><b>${esc(P.name)}</b>${ok?'':' <span class="nf">(not free)</span>'}<span class="ar">▶</span></div><div class="d">${esc(P.desc)}</div>`+
   `<div class="ticks"><span class="${B.agree[0]?'on':''}">${esc(benchPlayerName36(0))} ${B.agree[0]?'✓':'…'}</span> <span class="${B.agree[1]?'on':''}">${esc(benchPlayerName36(1))} ${B.agree[1]?'✓':'…'}</span></div><div class="k">${esc(benchKeyHint36(i))}</div>`;
  el.style.display='';}}
function benchChooserClose36(){if(typeof document==='undefined')return;for(const i of [0,1]){const half=document.getElementById('half'+i);const el=half&&half.querySelector?half.querySelector('.bench36-pick'):null;if(el&&el.parentNode)el.parentNode.removeChild(el);}}
function benchChooseStep36(dt){const B=BENCH36;let changed=false;
 for(const i of [0,1]){const r=B.raw[i]||[0,0],x=r[0]*v21Right.x+r[1]*v21Right.z,P=B.pick[i];
  if(Math.abs(x)>0.6){const sg=x>0?1:-1;if(P.x!==sg||P.t>=0.35){if(P.x===sg)P.t=0;else P.t=0;P.x=sg;const k=B.ORDER.indexOf(B.choice);B.choice=B.ORDER[(k+sg+B.ORDER.length)%B.ORDER.length];changed=true;}else P.t+=dt;}
  else{P.x=0;P.t=0;}}
 if(changed){B.agree=[false,false];benchShowGhost36();benchChooserRender36();benchHUD36();}}
function benchAgree36(i){const B=BENCH36;if(B.state!=='choosing')return false;if(!B.okCache||!B.okCache[B.choice]){benchToast36('That spot is not free.');return true;}
 B.agree[i]=!B.agree[i];benchChooserRender36();benchHUD36();if(B.agree[0]&&B.agree[1])benchCommit36();return true;}
// both agreed: nudge players out of the target, re-check, commit the item, then the bench glides there (or, if no clear way exists, dissolves)
function benchCommit36(){const B=BENCH36,key=B.choice,target=benchPoseOf36(key),tbox=benchBox36(target,0);
 for(const i of [0,1]){const q=benchPos36(i);if(bench36CircleOBB(q[0],q[1],PR,tbox)){const s=benchRing36(q[0],q[1],tbox);if(s)benchPlace36(i,s[0],s[1]);}}
 if(!bench36ArrangementOK(key)){B.agree=[false,false];B.okCache[key]=false;benchChooserRender36();benchToast36('That spot is not free now.');return false;}
 const from=bench36Pose();
 // the holder on the row steps aside east of the doorway first; the glide keeps clear of every wall, the pot's stand and both players
 const row=[0,1].find(i=>benchPos36(i)[1]>5.85);
 const spots=(row===undefined?[]:[[-3.15,6.45],[-3.3,6.62],[-3.62,6.66]].filter(sp=>benchFreeSpot36(sp[0],sp[1],benchBox36(from,0)))).map(sp=>({row,sp})).concat([{row:undefined,sp:null}]);
 B.agree=[false,false];benchChooserClose36();benchHideGhost36();
 const L=benchSave36(),it0=benchItem36();
 if(it0){it0.pose36=key;it0.x=0;it0.y=FLAT.rows;it0.rot=0;}else S.home.items.push({id:'i'+(++S.home.seq),type:'bench',x:0,y:FLAT.rows,rot:0,pose36:key});
 L.choice=key;L.state='placed';L.placedDay=S.day;L.again=false;L.lastMover=B.mover;L.mover=B.mover;if(B.delivered){L.deliveries=(L.deliveries||0)+1;}const wasDelivered=B.delivered;B.delivered=false;
 B.settle={kind:'plan',t:0,from,to:target,path:null,dur:0.6,key,done:false,spots,k:-1,planner:null,walk:null};benchSetState36('settling');
 rebuildFurniture();save();
 if(typeof LOG35!=='undefined'&&LOG35&&typeof LOG35.add==='function')LOG35.add('place','bench:veranda');
 let msg='Ada’s bench is home.';const st=benchStats36();
 if(L.playtest&&wasDelivered){const run={dur:Math.round(st.dur),bumps:st.bumps,setdowns:st.setdowns,swaps:st.swaps,resets:st.resets};L.runs=(L.runs||[]).concat([run]).slice(-10);
  const mm=Math.floor(run.dur/60),ss=String(run.dur%60).padStart(2,'0');msg+=` Delivery ${L.deliveries} · ${mm}:${ss} · ${run.bumps} bump${run.bumps===1?'':'s'} · ${run.resets} reset${run.resets===1?'':'s'}`;}
 benchToast36(msg);B.freeAfter=bench36Free([benchPos36(0),benchPos36(1)],benchArrBox36(key));return true;}
function benchPathDur36(path){let L=0;for(let k=1;k<path.length;k++)L+=Math.hypot(path[k].x-path[k-1].x,path[k].z-path[k-1].z)+0.5*Math.abs(benchWrapA36(path[k].yaw-path[k-1].yaw));return Math.max(1.4,Math.min(4,L/1.4));}
function benchPathAt36(path,u){let L=[0];for(let k=1;k<path.length;k++)L.push(L[k-1]+Math.hypot(path[k].x-path[k-1].x,path[k].z-path[k-1].z)+0.5*Math.abs(benchWrapA36(path[k].yaw-path[k-1].yaw)));
 const T=L[L.length-1]*u;let k=1;while(k<path.length-1&&L[k]<T)k++;const a=path[k-1],b=path[k],seg=(L[k]-L[k-1])||1,t=Math.max(0,Math.min(1,(T-L[k-1])/seg));
 return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:a.yaw+benchWrapA36(b.yaw-a.yaw)*t};}
function benchSettleStep36(dt){const B=BENCH36,s=B.settle;if(!s){benchSetState36('placed');return;}
 if(s.kind==='plan'){if(!s.planner||s.planner.status==='fail'){s.k++;const c=s.spots[s.k];if(!c){s.kind='dissolve';s.t=0;s.dur=0.6;B.lastSettle='dissolve';}
   else{const pos=[benchPos36(0),benchPos36(1)];if(c.sp)pos[c.row]=c.sp;s.planner=benchGlidePlan36(s.from,s.to,pos);s.cand=c;}}
  if(s.kind==='plan'&&s.planner.step(6000)==='found'){s.path=s.planner.path;s.planner=null;s.dur=benchPathDur36(s.path);s.t=0;s.kind='glide';B.lastSettle='glide';
   const c=s.cand;if(c&&c.sp){const f=benchPos36(c.row);s.walk={i:c.row,from:f,to:c.sp,t:0,dur:Math.max(0.25,Math.hypot(c.sp[0]-f[0],c.sp[1]-f[1])/2.2)};}}
  B.y=0;return;}
 if(s.walk){const w=s.walk;w.t+=dt;const k=Math.min(1,w.t/w.dur);benchPlace36(w.i,w.from[0]+(w.to[0]-w.from[0])*k,w.from[1]+(w.to[1]-w.from[1])*k);const p=players[w.i];if(p&&k<1)p.g.rotation.y=Math.atan2(w.to[0]-w.from[0],w.to[1]-w.from[1]);
  if(k>=1){s.walk=null;if(p)p.g.rotation.y=Math.atan2(s.from.x-w.to[0],s.from.z-w.to[1]);}else return;}
 s.t+=dt;const u=Math.min(1,s.t/s.dur);
 if(s.kind==='glide'){const e=u<0.5?2*u*u:1-Math.pow(-2*u+2,2)/2;B.pose=benchPathAt36(s.path,e);benchFade36(B.g,1);}
 else{const fade=u<0.5?1-u/0.5:(u-0.5)/0.5;B.pose=u<0.5?s.from:s.to;if(u>=0.5&&!s.puff){s.puff=true;benchMotes36(s.from.x,s.from.z);}benchFade36(B.g,Math.max(0.001,fade));}
 B.y=0;if(u>=1){s.done=true;benchDropMesh36();B.settle=null;B.pose=benchPoseOf36(s.key);benchSetState36('placed');rebuildFurniture();benchArrows36(null);
  // the camera keeps the bench in view for a moment after it lands (the just-placed framing tune-v35 gives a piece)
  const it=benchItem36();if(it&&typeof TUNE35!=='undefined'&&typeof clock35==='function')TUNE35.frame={id:it.id,until:clock35()+3000};}}
// the bench alone, from the doorway to the arrangement: weighted A* over (x, z, 5-degree yaw) at 5 cm (a grid line on the 'out' slot),
// run a few thousand nodes a frame, then shortened. The glide is a picture, not a carry, but it keeps the bench box (1 cm round the model)
// clear of every box, the pot's stand and both players. step(n) gives 'run', 'found' (path in .path) or 'fail'.
function benchGlidePlan36(from,to,pos){const X0=-8.1,Z0=3.22,S0=0.05,NX=115,NZ=77,NT=72,N=NX*NZ*NT,HX=BENCH36.HX,HZ=BENCH36.HZ;
 const boxes=benchBoxes36(-5.25,5.1,3.5,{}).concat([{x1:BENCH36.POT[0],x2:BENCH36.POT[1],z1:BENCH36.POT[2],z2:BENCH36.POT[3]}]),discs=pos.map(p=>[p[0],p[1],PR]);
 const ok=(x,z,yaw)=>{if(!(x>-8&&z<7))return false;if(bench36ObbHit({x,z,yaw},HX-BENCH36.HX,{list:boxes}))return false;const b={x,z,yaw,hx:HX,hz:HZ};for(const [cx,cz,r] of discs)if(bench36CircleOBB(cx,cz,r,b))return false;return true;};
 const lineOK=(a,b)=>{const n=Math.max(1,Math.ceil(Math.max(Math.hypot(b.x-a.x,b.z-a.z)/0.02,Math.abs(benchWrapA36(b.yaw-a.yaw))/(2*D2R36))));for(let k=1;k<=n;k++){const t=k/n;if(!ok(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,a.yaw+benchWrapA36(b.yaw-a.yaw)*t))return false;}return true;};
 const node=(x,z,yaw)=>{const i=Math.round((x-X0)/S0),j=Math.round((z-Z0)/S0),k=((Math.round(yaw/(5*D2R36))%NT)+NT)%NT;return i<0||j<0||i>=NX||j>=NZ?-1:(i*NZ+j)*NT+k;};
 const P=n=>{const k=n%NT,ij=(n-k)/NT,j=ij%NZ,i=(ij-j)/NZ;return {x:X0+i*S0,z:Z0+j*S0,yaw:k*5*D2R36};};
 const attach=p=>{const c=node(p.x,p.z,p.yaw);if(c<0)return -1;const base=P(c),out=[];for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++)for(let dk=-1;dk<=1;dk++){const q={x:base.x+di*S0,z:base.z+dj*S0,yaw:base.yaw+dk*5*D2R36};out.push([Math.hypot(q.x-p.x,q.z-p.z)+Math.abs(benchWrapA36(q.yaw-p.yaw))*0.3,q]);}
  out.sort((a,b)=>a[0]-b[0]);for(const [,q] of out)if(ok(q.x,q.z,q.yaw)&&lineOK(p,q))return node(q.x,q.z,q.yaw);return -1;};
 const me={status:'run',path:null,exp:0};
 if(!ok(to.x,to.z,to.yaw)){me.status='fail';me.step=()=>'fail';return me;}
 const s=attach(from),g=attach(to);if(s<0||g<0){me.status='fail';me.step=()=>'fail';return me;}
 const gp=P(g),h=n=>{const q=P(n);return 1.6*(Math.hypot(q.x-gp.x,q.z-gp.z)+0.3*Math.abs(benchWrapA36(q.yaw-gp.yaw)));};
 const cost=new Float32Array(N).fill(Infinity),prev=new Int32Array(N).fill(-1),closed=new Uint8Array(N),heap=[];
 const push=(f,n)=>{heap.push([f,n]);let c=heap.length-1;while(c>0){const q=(c-1)>>1;if(heap[q][0]<=heap[c][0])break;const t=heap[q];heap[q]=heap[c];heap[c]=t;c=q;}};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let c=0;for(;;){const l=2*c+1,r=l+1;let m=c;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===c)break;const t=heap[m];heap[m]=heap[c];heap[c]=t;c=m;}}return top;};
 cost[s]=0;push(h(s),s);
 const finish=()=>{const raw=[];for(let n=g;n>=0;n=prev[n])raw.push(P(n));raw.reverse();raw.unshift({x:from.x,z:from.z,yaw:from.yaw});raw.push({x:to.x,z:to.z,yaw:to.yaw});
  for(let k=1;k<raw.length;k++){const d=benchWrapA36(raw[k].yaw-raw[k-1].yaw);raw[k].yaw=raw[k-1].yaw+d;}
  const out=[raw[0]];let i=0;while(i<raw.length-1){let j=i+1,step=1;while(j+step<raw.length&&lineOK(raw[i],raw[j+step])){j+=step;step*=2;}while(step>1){step>>=1;if(j+step<raw.length&&lineOK(raw[i],raw[j+step]))j+=step;}out.push(raw[j]);i=j;}
  return out;};
 me.step=function(budget){if(me.status!=='run')return me.status;let n0=0;
  while(heap.length&&n0<budget){const [,n]=pop();if(closed[n])continue;closed[n]=1;n0++;me.exp++;if(n===g){me.path=finish();me.status='found';return me.status;}
   const k=n%NT,ij=(n-k)/NT,j=ij%NZ,i=(ij-j)/NZ,q=P(n);
   for(const [di,dj,dk,c] of [[1,0,0,S0],[-1,0,0,S0],[0,1,0,S0],[0,-1,0,S0],[0,0,1,0.04],[0,0,-1,0.04]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=NX||b>=NZ)continue;const kk=((k+dk)%NT+NT)%NT,m=(a*NZ+b)*NT+kk;if(closed[m])continue;
    const nc=cost[n]+c;if(nc>=cost[m])continue;const x=X0+a*S0,z=Z0+b*S0,yaw=kk*5*D2R36;if(dk&&!ok(x,z,q.yaw+dk*2.5*D2R36))continue;if(!ok(x,z,yaw))continue;cost[m]=nc;prev[m]=n;push(nc+h(m),m);}}
  if(!heap.length||me.exp>=150000)me.status='fail';return me.status;};
 return me;}
// one glide, start to finish (the harness and the dissolve fallback use it; the game runs it a few thousand nodes a frame)
function benchGlideNow36(from,to,pos){const P=benchGlidePlan36(from,to,pos);while(P.step(1e6)==='run');return P.path;}

/* ---------- 7. Sitting together ---------- */
const prevSeatFrame36=sofaSeatFrame;sofaSeatFrame=function(){const B=BENCH36;if(B.seatTarget){B.seatTarget.updateWorldMatrix(true,false);return {frame:B.seatTarget,height:0.46,depth:0.03,spacing:0.36};}return prevSeatFrame36.apply(this,arguments);};
const sitStopReal36=sitStop;
function benchBenchGroup36(){if(!furnGroup)return null;return furnGroup.children.find(g=>g.userData&&g.userData.furnitureType==='bench')||null;}
function benchSit36(i){const B=BENCH36;if(B.state!=='placed'||SEATING30.active)return false;const it=benchItem36(),g=benchBenchGroup36();if(!it||!g)return false;
 const pose=benchPoseOf36(it.pose36),o=players[1-i];if(!o||Math.hypot(o.g.position.x-pose.x,o.g.position.z-pose.z)>2.4){benchToast36(`Wait for ${benchPlayerName36(1-i)}.`);return true;}
 if(typeof sofa!=='undefined'&&sofa&&sofa.carrying)return false;
 B.seatTarget=g;try{sitStart();}finally{}if(!SEATING30.active){B.seatTarget=null;return false;}B.seatDay=S.day;B.standT=0;benchSetState36('seated');return true;}
function bench36StandUp(){const B=BENCH36;if(B.state!=='seated')return false;B.standing=true;try{sitStopReal36();}finally{B.standing=false;}B.seatTarget=null;B.seatDay=null;benchSetState36('placed');return true;}
function benchSeatedStep36(dt){const B=BENCH36;if(!SEATING30.active){B.seatTarget=null;benchSetState36('placed');return;}let up=false;for(const i of [0,1]){const r=B.raw[i]||[0,0];if(Math.hypot(r[0],r[1])>0.5)up=true;}
 B.standT=up?(B.standT||0)+dt:0;if(B.standT>=0.3)bench36StandUp();}
// wrap (outermost): while the pair sits on the bench on the same day, closing a panel (Menu, Tasks, journal) does not stand them up; the velocities are zeroed
const prevClose36=closePanel;closePanel=function(){const B=BENCH36;B.vel.s=0;B.vel.w=0;B.latch=[null,null];B.wall.s=0;B.wall.w=0;
 let r;if(B.state==='seated'&&S&&S.day===B.seatDay&&!B.standing){const keep=sitStop;sitStop=function(){};try{r=prevClose36.apply(this,arguments);}finally{sitStop=keep;}}else r=prevClose36.apply(this,arguments);
 if(B.state==='seated'&&!SEATING30.active){B.seatTarget=null;benchSetState36('placed');}
 if(B.notePending&&!overlayOpen()){B.notePending=false;benchSpawn36(false);}return r;};
// wrap: a day change, a new household, going online or entering the world stands the pair up first
for(const n of ['nextday','sleep','newgame','newconfirm']){const prev=ACTIONS[n];if(typeof prev!=='function')continue;ACTIONS[n]=function(){bench36StandUp();return prev.apply(this,arguments);};}
// wrap: a new day that starts mid-delivery (the "Past midnight" card) leaves the pair where they stood, not in the room, so the carry carries on
{const prevNext36=ACTIONS.nextday;if(typeof prevNext36==='function')ACTIONS.nextday=function(){const B=BENCH36,s=B.state;
 const keep=!B.paused&&(s==='grounded'||s==='ready'||s==='carrying')&&players.length===2?players.map(p=>[p.g.position.x,p.g.position.z]):null;
 const r=prevNext36.apply(this,arguments);if(keep)keep.forEach((q,i)=>benchPlace36(i,q[0],q[1]));return r;};}

/* ---------- 2.1 Hotspots and Act ---------- */
function bench36Hot(i,list,d){const B=BENCH36,s=B.state;if(s==='off')return null;const p=players[i];if(!p)return null;
 if(s==='placed'){const it=benchItem36();const L=benchSave36();if(!it||(L&&L.again))return null;if(typeof sofa!=='undefined'&&sofa&&sofa.carrying)return null;const pose=benchPoseOf36(it.pose36),dd=benchBoxDist36(pose,p.g.position.x,p.g.position.z);
  if(dd<=1.0&&list){const o=players[1-i],near=o&&Math.hypot(o.g.position.x-pose.x,o.g.position.z-pose.z)<=2.4;list.push({id:'bench36Sit',label:near?'Sit on the bench together':`Wait for ${benchPlayerName36(1-i)}`,dist:dd-0.45});}return null;}   // a player standing at the bench's end gets the seat (not only one pressed against it), one at the pepper pot's own point the pot (whose entry takes a 0.2 m lead)
 if(s==='seated')return p.g.sitting?{id:'bench36Stand',label:'Stand up',dist:0}:null;
 if(B.paused)return null;
 if(s==='choosing')return {id:'bench36Agree',label:B.agree[i]?'Not yet':(B.okCache&&B.okCache[B.choice]?'Agree':'Not free'),dist:0};
 if(s==='settling')return null;
 const h=benchHolderOf36(i);
 if(s==='carrying'&&h>=0)return {id:'bench36SetDown',label:'Set the bench down',dist:0};
 if(s==='ready'&&h>=0)return {id:'bench36Swap',label:'Swap roles · walk off to let go',dist:0};
 if(!list)return null;
 if((s==='grounded'||s==='ready')&&!p.g.sitting){for(const e of [0,1]){const [x,z]=benchEnd36(B.pose,e),dd=Math.hypot(p.g.position.x-x,p.g.position.z-z);if(dd>B.TAKE)continue;
   if(s==='ready'&&B.holder[e]===null)list.push({id:'bench36Lift',label:'Lift together',dist:dd});else if(s==='grounded')list.push({id:'bench36Take',label:'Take this end',dist:dd});}}
 if(B.stuck&&(s==='grounded'||s==='ready')){const box=benchBox36(B.pose,0),c=Math.cos(box.yaw),sn=Math.sin(box.yaw),dx=p.g.position.x-box.x,dz=p.g.position.z-box.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c,qx=Math.max(-box.hx,Math.min(box.hx,lx)),qz=Math.max(-box.hz,Math.min(box.hz,lz)),dd=Math.hypot(lx-qx,lz-qz);
  if(dd<=1.3)list.push({id:'bench36Reset',label:'Reset the bench',dist:dd});}
 return null;}
HOTSPOT_HOOKS.push(bench36Hot);
ACT_HOOKS.push(function(i,kind){if(kind.slice(0,7)!=='bench36')return false;const B=BENCH36,s=B.state;
 if(kind==='bench36Sit'){benchSit36(i);return true;}
 if(kind==='bench36Stand'){bench36StandUp();return true;}
 if(B.paused)return true;
 if(kind==='bench36Agree'){benchAgree36(i);return true;}
 if(kind==='bench36Reset'){if(B.stuck)bench36Reset();return true;}
 const h=benchHolderOf36(i);
 if(s==='carrying'&&h>=0){benchSafeDown36(i,'act');return true;}
 if(s==='ready'&&h>=0){benchSwap36();return true;}
 if(s==='grounded'||s==='ready'){
  benchTake36(i);return true;}
 return true;});

/* ---------- 3.3 Animation and facing ---------- */
// wrap: a holder carries low and walks only while the bench moved in the previous step (one-frame lag, deliberate)
const prevAnim36=animAvatar;animAvatar=function(g,t,moving,carrying,speed,dt){const B=BENCH36;
 if(B.state==='settling'&&B.settle&&B.settle.walk){const w=B.settle.walk,p=players[w.i];if(p&&p.g===g)return prevAnim36.call(this,g,t,true,false,2.2,dt);}
 if(B.state==='carrying'&&!B.paused){const k=players.findIndex(p=>p.g===g);if(k>=0&&benchHolderOf36(k)>=0){const v=Math.max(Math.abs(B.vel.s),Math.abs(B.vel.w)*B.STAND);return prevAnim36.call(this,g,t,B.movedPrev,'low',Math.max(0.6,v*1.1),dt);}}
 return prevAnim36.apply(this,arguments);};
// wrap: holders and bench-seated players keep their facing
const prevIdle36=idleFace;idleFace=function(p,dt){const B=BENCH36;if(B.state!=='off'&&B.state!=='placed'&&p&&(benchHolderOf36(p.i)>=0&&(B.state==='ready'||B.state==='carrying')||(B.state==='seated'&&p.g.sitting)))return;return prevIdle36.apply(this,arguments);};
// wrap: the per-frame bench step runs right after the ball (once a frame, not while a panel is open)
const prevBall36=updateBall;updateBall=function(dt){const r=prevBall36.apply(this,arguments);bench36Step(dt);return r;}; // v36: the bench carry step

/* ---------- 5.1 Prompts, roles and the glyph ---------- */
// (the prompt is read live, not from the frame's hotspot cache, so it changes on the frame of a transition, not up to 0.25 s later)
const prevHUD36=updateHUD;updateHUD=function(){const r=prevHUD36.apply(this,arguments);const B=BENCH36;if(B.state==='off'||!S||!S.p||!players.length||typeof document==='undefined')return r;
 if(B.state==='placed'){if(!(B.hudLive>0))return r;B.hudLive--;}
 for(const i of [0,1]){const pr=document.getElementById('pr'+i),role=document.getElementById('prole'+i),hs=typeof nearest==='function'&&S.phase==='play'&&!overlayOpen()?nearest(i):hotspotCache[i],rl=bench36Role(i),h=benchHolderOf36(i);
  if(pr&&!hs){pr.className='pr p'+i;}else if(pr&&hs&&!rl){pr.className='pr on p'+i;pr.innerHTML=`<span class="k">${glyph(i)}</span><span>${esc(hs.label)}</span>`;}
  if(B.state==='seated'){if(players[i]&&players[i].g.sitting&&role)role.textContent='Sitting together';continue;}
  if(rl&&hs&&pr){const hint=B.state==='carrying'&&B.hintUntil&&B.t<B.hintUntil?`<span class="hint36">${rl==='move'?'push toward or away from your end':'push your end left or right'}</span>`:'';
   pr.className='pr on p'+i;pr.innerHTML=`<span class="k">${glyph(i)}</span><span class="role36 ${rl}">${rl==='move'?'Move':'Turn'}</span><span class="lb36">${esc(hs.label)}${hint}</span>`;}
  if(role){if(B.state==='carrying'&&h>=0)role.textContent=`Bench · ${rl==='move'?'Move':'Turn'}`;else if(B.state==='ready'&&h>=0)role.textContent=`Bench · ${rl==='move'?'Move':'Turn'} · waiting for ${benchPlayerName36(1-i)}`;
   if(B.stuck&&h>=0)role.textContent='Stuck? Back up a little, or set it down and swap roles.';}}
 return r;};
// wrap: an E or Enter press no longer turns the prompt's key into the pad's "A" (only a moved stick or a pressed pad button does)
const prevPad36=padVec;padVec=function(i){const before=lastInput[i];const v=prevPad36.apply(this,arguments);
 if(lastInput[i]==='pad'&&before!=='pad'&&Math.hypot(v[0],v[1])<=0.2){let btn0=false;try{const pads=navigator.getGamepads?navigator.getGamepads():null;if(pads)for(let k=0;k<pads.length;k++){const p=pads[k];if(p&&p.buttons&&p.buttons[0]&&p.buttons[0].pressed){btn0=true;break;}}}catch(e){}
  if(!btn0)lastInput[i]=before;}
 return v;};

/* ---------- 5.2 Camera: the bench and the next corner in each view ---------- */
function benchFitDist36(i,pts){const vp=v21Viewport(i),c=new THREE.Box3().setFromPoints(pts).getCenter(new THREE.Vector3()),tanV=Math.tan(THREE.MathUtils.degToRad(cams[i].fov/2)),tanH=tanV*vp.w/vp.h,usableY=Math.max(.30,1-(vp.top+vp.bottom)/vp.h),usableX=.82;
 let fit=innerHeight>innerWidth?7.1:7.3;if(typeof LENS35!=='undefined'&&LENS35.on)fit*=LENS35.minScale();
 for(const p of pts){const q=p.clone().sub(c),depth=q.dot(CAM_DIR);fit=Math.max(fit,depth+Math.abs(q.dot(v21Right))/(tanH*usableX),depth+Math.abs(q.dot(v21Up))/(tanV*usableY));}return fit+.10;}
function benchPersonPx36(i,dist){const vp=v21Viewport(i),tanV=Math.tan(THREE.MathUtils.degToRad(cams[i].fov/2));return 1.98*vp.h/(2*(dist+2)*tanV);}
function benchAddBox36(pts,x0,y0,z0,x1,y1,z1){for(const x of [x0,x1])for(const y of [y0,y1])for(const z of [z0,z1])pts.push(new THREE.Vector3(x,y,z));}
function benchAddObb36(pts,pose,y0,y1,inf){const c=Math.cos(pose.yaw),s=Math.sin(pose.yaw),hx=BENCH36.HX+(inf||0),hz=BENCH36.HZ+(inf||0);for(const [lx,lz] of [[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]])for(const y of [y0,y1])pts.push(new THREE.Vector3(pose.x+lx*c+lz*s,y,pose.z-lx*s+lz*c));}
const prevPts36=v21InteractionPoints;v21InteractionPoints=function(i,joint){const pts=prevPts36.apply(this,arguments);const B=BENCH36,s=B.state;
 if(s==='off'||s==='placed'||B.paused||!Array.isArray(pts)||!players[i])return pts;
 const addP=p=>{const q=p.g.position,y=p.y||0;benchAddBox36(pts,q.x-.44,y-.06,q.z-.36,q.x+.44,y+1.98,q.z+.36);};
 if(s==='seated'){const it=benchItem36();if(it)benchAddObb36(pts,benchPoseOf36(it.pose36),0,0.95);players.forEach(addP);return pts;}
 if(s==='choosing'||s==='settling'){players.forEach(addP);benchAddObb36(pts,B.pose,0,0.95);const tgt=s==='choosing'?benchPoseOf36(B.choice):B.settle?B.settle.to:B.pose;benchAddObb36(pts,tgt,0,0.95);B.camInfo=B.camInfo||[null,null];B.camInfo[i]={corner:false,kept:false};return pts;}
 if(s!=='ready'&&s!=='carrying'){const p=players[i];if(Math.hypot(p.g.position.x-B.pose.x,p.g.position.z-B.pose.z)<4)benchAddObb36(pts,B.pose,0,0.95);return pts;}
 for(const k of [0,1]){if(k!==i||!joint)addP(players[k]);}
 benchAddObb36(pts,B.pose,B.y,B.y+0.95);
 const info=benchCornerPoint36(i,pts);B.camInfo=B.camInfo||[null,null];B.camInfo[i]=info;
 if(info.P){benchAddBox36(pts,info.P[0]-.3,0,info.P[1]-.3,info.P[0]+.3,.6,info.P[1]+.3);if(info.behind)benchAddBox36(pts,info.behind[0]-.1,0,info.behind[1]-.1,info.behind[0]+.1,.4,info.behind[1]+.1);}
 return pts;};
// the next-corner point for view i: grows in over 0.8 s after a corner change, moves at most 1.5 m/s, dropped below the pixel thresholds or the 70 px person floor
function benchCornerPoint36(i,pts){const B=BENCH36,vp=v21Viewport(i),Hu=vp.h-vp.top-vp.bottom,W=B.ROUTE[B.corner];const turner=B.state==='carrying'&&benchHolderOf36(i)>=0&&i!==B.mover;
 const st=B.cam[i]||(B.cam[i]={corner:-1,t0:0,P:null,t:B.t});const dt=Math.max(0,B.t-st.t);st.t=B.t;
 const Rc=Hu>=420?3.0:Hu>=260?2.0:0;const out={Hu,Rc,P:null,behind:null,dropped:false,kept:false,arrow:false,personPx:null};
 if(!W){return out;}
 if(st.corner!==B.corner){st.corner=B.corner;st.t0=B.t;}
 const smax=turner?0.6:1,s=Math.min(1,(B.t-st.t0)/0.8)*smax;
 if(!Rc){st.P=null;out.arrow=true;out.personPx=benchPersonPx36(i,benchFitDist36(i,pts));return out;}
 const dx=W.x-B.pose.x,dz=W.z-B.pose.z,d=Math.hypot(dx,dz)||1,k=Math.min(d,Rc)/d,T=[B.pose.x+dx*k*s,B.pose.z+dz*k*s];
 if(!st.P)st.P=[B.pose.x,B.pose.z];const mx=T[0]-st.P[0],mz=T[1]-st.P[1],md=Math.hypot(mx,mz),lim=1.5*Math.max(dt,1/60);if(md>lim){st.P=[st.P[0]+mx/md*lim,st.P[1]+mz/md*lim];}else st.P=T;
 const P=st.P;let behind=null;if(turner){const re=benchEnd36(B.pose,B.front?0:1,B.STAND+0.6);behind=re;}
 const withP=pts.slice();benchAddBox36(withP,P[0]-.3,0,P[1]-.3,P[0]+.3,.6,P[1]+.3);if(behind)benchAddBox36(withP,behind[0]-.1,0,behind[1]-.1,behind[0]+.1,.4,behind[1]+.1);
 const dist=benchFitDist36(i,withP),px=benchPersonPx36(i,dist);out.personPx=px;
 if(px<70){out.dropped=true;out.arrow=true;out.personPx=benchPersonPx36(i,benchFitDist36(i,pts));return out;}
 out.P=P;out.behind=behind;out.kept=true;return out;}
// the faint arrows: the out-of-cone hint ("push along the bench" / "push your end sideways") and the edge arrow towards the next corner
function benchArrowEl36(i,make){if(typeof document==='undefined')return null;const half=document.getElementById('half'+i);if(!half||!half.querySelector)return null;let el=half.querySelector('.bench36-arrow');
 if(!el&&make&&document.createElement){el=document.createElement('div');el.className='bench36-arrow';el.innerHTML='<span class="g">➜</span><span class="c"></span>';half.appendChild(el);}return el;}
function benchScreenDir36(wx,wz){const fl=Math.hypot(CAM_DIR.x,CAM_DIR.z),fx=-CAM_DIR.x/fl,fz=-CAM_DIR.z/fl;return Math.atan2(-(wx*fx+wz*fz),wx*v21Right.x+wz*v21Right.z);}
function benchArrows36(){const B=BENCH36;if(typeof document==='undefined')return;
 for(const i of [0,1]){let show=false,ang=0,cap='',cls='';
  if(!B.paused&&B.state==='carrying'&&benchHolderOf36(i)>=0){const role=i===B.mover?0:1;
   if(B.outT[role]>=0.6){const f=B.front?1:-1,a=benchAxis36(B.pose.yaw);const d=role===0?[a[0]*f,a[1]*f]:[Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f];ang=benchScreenDir36(d[0],d[1]);cap=role===0?'push along the bench':'push your end sideways';cls='hint';show=true;}
   else{const info=B.camInfo&&B.camInfo[i],W=B.ROUTE[B.corner];if(info&&info.arrow&&W){ang=benchScreenDir36(W.x-B.pose.x,W.z-B.pose.z);cap=W.n;cls='edge';show=true;}}}
  BENCH36.arrowShown[i]=show?cls:'';const el=benchArrowEl36(i,show);if(!el)continue;
  el.style.display=show?'':'none';if(show){el.className='bench36-arrow '+cls;const g=el.querySelector&&el.querySelector('.g'),c=el.querySelector&&el.querySelector('.c');if(g)g.style.transform=`rotate(${(ang*180/Math.PI).toFixed(1)}deg)`;if(c)c.textContent=cap;}}}
const prevCams36=updateCameras;updateCameras=function(dt){const r=prevCams36.apply(this,arguments);const B=BENCH36;if(B.state==='carrying'||B.state==='ready')benchArrows36();else if(B._arrowsOn)benchArrows36();B._arrowsOn=B.state==='carrying'||B.state==='ready';return r;};

/* ---------- 6.2 The item ---------- */
ITEMS.bench={name:'Wooden bench',w:2,h:1,price:0,tags:['lively','intimate'],balcony:true,outdoor:true,blurb:'From Ada’s workshop. Long enough for everybody, short enough to argue on.'};
PROP_FURN.bench=['bench_wooden'];
if(typeof BRIDGE34B!=='undefined'&&Array.isArray(BRIDGE34B.protectedStore))BRIDGE34B.protectedStore.push('bench');
// wrap: the bench item is the bench_wooden model at scale 1 (a simple wooden fallback until the model has loaded)
const prevPropFurn36=propFurn;propFurn=function(type,w,h){if(type!=='bench')return prevPropFurn36.apply(this,arguments);const g=new THREE.Group();g.add(benchModel36(false));return g;};
// wrap: the Home editor's icon for the bench
const prevIcon36=furnishingIcon34;furnishingIcon34=function(t){if(t!=='bench')return prevIcon36.apply(this,arguments);
 return lifeSVG34('<rect x="10" y="22" width="80" height="12" rx="3" fill="#98684B"/><rect x="8" y="40" width="84" height="10" rx="3" fill="#B98A5E"/><path d="M18 50V72M82 50V72M18 34V40M82 34V40" stroke="#374D46" stroke-width="5"/>');};
// wrap: the bench item stands at its arrangement (not the grid cell), has its exact box in blocked() instead of a furniture box, and hides during a fresh delivery
const prevFurn36=rebuildFurniture;rebuildFurniture=function(){const r=prevFurn36.apply(this,arguments);if(!S||!S.home)return r;const B=BENCH36;
 S.home.items.forEach((it,k)=>{if(it.type!=='bench')return;const g=furnGroup.children[k];const [cx,cz]=cellToWorld(it.x,it.y),wx=cx+FLAT.cell/2,wz=cz;
  FURN_OBS=FURN_OBS.filter(o=>!(Math.abs(o.x1-(wx-FLAT.cell+.1))<1e-9&&Math.abs(o.x2-(wx+FLAT.cell-.1))<1e-9&&Math.abs(o.z1-(wz-.4))<1e-9));
  if(!g)return;const p=benchPoseOf36(it.pose36);g.position.set(p.x,0.05,p.z);g.rotation.y=p.yaw;const L=benchSave36();g.visible=!(L&&L.again)&&B.state!=='settling';});
 B._gb=null;if(benchOpen36())benchGridBuild36();return r;};
// wrap: the bridge's reach cache also knows where the bench box is
const prevSig36=blockSig34b;blockSig34b=function(){const k=prevSig36.apply(this,arguments),b=bench36GroundBox();return b?k+';b36:'+Math.round(b.x*1e3)+','+Math.round(b.z*1e3)+','+Math.round(b.yaw*1e3):k;};
// wrap: old Build cannot store the bench or pick it up and carry it alone
for(const n of ['storeitem','pickup']){const prev=ACTIONS[n];ACTIONS[n]=function(d){const it=S&&S.home&&S.home.items.find(x=>x.id===(d&&d.id));if(it&&it.type==='bench'){benchToast36('Ada’s bench stays where you put it. Carry it again from the Menu.');return;}return prev.apply(this,arguments);};}
const prevBuild36=openBuild;openBuild=function(){const r=prevBuild36.apply(this,arguments);const it=benchItem36();if(!it||typeof panel==='undefined'||typeof panel.innerHTML!=='string')return r;
 const id=String(it.id).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const h=panel.innerHTML.replace(new RegExp(`<button[^>]*data-act="(?:pickup|storeitem)" data-id="${id}"[^>]*>[\\s\\S]*?</button>`,'g'),'');if(h!==panel.innerHTML)panel.innerHTML=h;return r;};

/* ---------- 1.6 Save, load and the shared document ---------- */
function benchSync36(){const B=BENCH36,L=benchSave36();if(!L||B.state==='off')return;
 if(B.state==='grounded'||B.state==='ready'||B.state==='carrying'){L.state='grounded';L.pos=[B.pose.x,B.pose.z];L.yaw=B.pose.yaw;}
 else if(B.state==='choosing'){L.state='choosing';L.pos=[B.pose.x,B.pose.z];L.yaw=B.pose.yaw;L.choice=B.choice;}
 else if(B.state==='settling'||B.state==='seated'||B.state==='placed')L.state='placed';
 L.mover=B.mover;}
// wrap: the bench's runtime pose and state go into S.life.bench36 on every save (ready and carrying are written as grounded at the pose)
const prevSave36=save;save=function(){try{benchSync36();}catch(e){}return prevSave36.apply(this,arguments);};
function benchTeardown36(){const B=BENCH36;benchDropMesh36();benchChooserClose36();benchArrows36(null);B.state='off';B.holder=[null,null];benchResetMotion36();B.paused=false;B.glide=null;B.settle=null;B.seatTarget=null;B.seatDay=null;
 B.stuck=false;B.stuckT=0;B.override=null;B.notePending=false;B.okCache=null;B.cam=[null,null];B.camInfo=null;B.grid=null;B._gb=null;B.delivered=false;B.snap=null;B.y=0;B.liftT=0;B.liftDir=0;}
function benchLoad36(){const B=BENCH36;if(!S||!S.p)return;const L=benchSave36(),it=benchItem36();
 if(!L&&!it)return;
 if(L&&L.state==='placed'&&!it){S.home.items.push({id:'i'+(++S.home.seq),type:'bench',x:0,y:FLAT.rows,rot:0,pose36:L.choice||'out'});}
 if(L&&it&&!L.state)L.state='placed';
 if(it&&!B.POSES[it.pose36])it.pose36='out';
 if(!L||L.state==='placed'){B.state='placed';if(typeof NET==='undefined'||!NET.on){benchFlagFresh36();}rebuildFurniture();return;}
 B.mover=L.mover||0;B.choice=L.choice||'out';B.stats={dur:0,bumps:0,setdowns:0,swaps:0,resets:0,lifted:false};B.progress=0;
 B.pose={x:(L.pos||[B.START.x,B.START.z])[0],z:(L.pos||[B.START.x,B.START.z])[1],yaw:+L.yaw||0};
 if(!benchLocal36()){B.state=L.state==='choosing'?'choosing':'grounded';B.paused=true;if(typeof NET!=='undefined'&&NET.on&&L.again){L.again=false;L.state='placed';B.state='placed';B.paused=false;}rebuildFurniture();return;}
 benchGridBuild36();
 if(L.state==='choosing'){B.state='choosing';benchBuildMesh36();B.corner=B.ROUTE.length-1;B.okCache=null;benchChooserOpen36();rebuildFurniture();benchHUD36();return;}
 B.state='grounded';
 const box=benchBox36(B.pose,0);for(const i of [0,1]){const q=benchPos36(i);if(bench36CircleOBB(q[0],q[1],PR,box)){const sp=benchRing36(q[0],q[1],box);if(sp)benchPlace36(i,sp[0],sp[1]);}}
 if(!bench36Valid(B.pose)||!bench36Liftable(B.pose,[benchPos36(0),benchPos36(1)])){B.pose=benchSpawnSpot36();B.GATE_SPOTS.forEach(([x,z],i)=>{const s=benchRing36(x,z,benchBox36(B.pose,0))||[x,z];benchPlace36(i,s[0],s[1]);});}
 benchBuildMesh36();B.corner=benchCornerFor36();rebuildFurniture();benchHUD36();}
// wrap: entering the world stands the pair up, clears the runtime bench, then rebuilds it from the save (a load never refuses)
const prevEnter36=enterWorld;enterWorld=function(){bench36StandUp();benchTeardown36();const r=prevEnter36.apply(this,arguments);try{benchLoad36();}catch(e){if(typeof console!=='undefined')console.warn('bench36 load',e);}return r;};
// wrap: the shared household document carries only a placed bench's arrangement
const prevStrip36=stripState;stripState=function(){const o=prevStrip36.apply(this,arguments);if(o&&o.life&&o.life.bench36){const b=o.life.bench36;if(b.state==='placed')o.life.bench36={v:b.v||1,state:'placed',choice:b.choice||'out'};else delete o.life.bench36;}return o;};

/* ---------- 9. The Menu offer, fresh deliveries and flags ---------- */
// each ?bench= flag applies once: read, removed from the address, and marked for this tab
BENCH36.readFlags=function(){let v=null;try{const q=typeof location!=='undefined'&&location&&typeof location.search==='string'?location.search:'';const m=q.match(/[?&]bench=([^&]*)/);if(m)v=decodeURIComponent(m[1]||'')||'on';}catch(e){}
 if(v===null)return BENCH36.flags;let seen=false;try{seen=typeof sessionStorage!=='undefined'&&sessionStorage.getItem('bench36.flag.'+v)==='1';}catch(e){}
 try{if(typeof history!=='undefined'&&history.replaceState&&typeof location!=='undefined'){const q=location.search.replace(/([?&])bench=[^&]*&?/,'$1').replace(/[?&]$/,'');history.replaceState(history.state,'',location.pathname+q+(location.hash||''));}}catch(e){}
 try{if(typeof sessionStorage!=='undefined')sessionStorage.setItem('bench36.flag.'+v,'1');}catch(e){}
 BENCH36.flags={value:v,usedFresh:seen,usedPlaytest:seen&&v==='playtest'};return BENCH36.flags;};
BENCH36.readFlags();
function benchFlagFresh36(){const f=BENCH36.flags;if(!f||f.value!=='fresh'||f.usedFresh)return;const L=benchSave36();if(!L||L.state!=='placed'||!benchLocal36())return;f.usedFresh=true;bench36Again();}
function benchMenuHTML36(){if(!S||!S.p)return '';const B=BENCH36,L=benchSave36(),it=benchItem36(),local=benchLocal36();let h='';
 if(!local){if(typeof AI!=='undefined'&&AI.on&&B.flags)h+=`<div class="card small bench36-menu">Ada’s bench needs two pairs of hands: one to walk it, one to steer it. Play it with a second player on this device.</div>`;
  else if(typeof NET!=='undefined'&&NET.on&&L&&L.state!=='placed')h+=`<div class="card small bench36-menu">Carry Ada’s bench when you are both on one device.</div>`;return h;}
 if(B.state==='off'&&!L&&!it){if(benchAvailable36())h+=`<div class="card small bench36-menu">Ada left her bench at your gate. Carry it in together: one walks it, one steers.<div class="actions">${btn('We’ll fetch it','bench36Start',{},'primary')}</div></div>`;return h;}
 let b='';
 if(B.state==='placed'||B.state==='seated')b+=btn('Carry Ada’s bench again','bench36Again',{},'quiet');
 if(benchOpen36()&&L&&L.again&&B.state!=='settling')b+=btn('Leave the bench where it was','bench36Cancel',{},'quiet');
 if(B.state==='grounded'||B.state==='ready'||B.state==='carrying')b+=btn('Bench stuck? Put it back','bench36Reset',{},'quiet');
 if(B.state==='choosing')b+=btn('Put it down in the room for now','bench36RoomDown',{},'quiet');
 if(L&&L.playtest)b+=btn('Bench runs','bench36Runs',{},'quiet');
 return b?`<div class="bench36-menu">${b}</div>`:'';}
// wrap (outermost): the bench lines go after the camera setting
const prevMenu36=openMenu;openMenu=function(){const r=prevMenu36.apply(this,arguments);if(typeof silentMode==='function'&&silentMode())return r;const h=benchMenuHTML36();if(!h)return r;
 const actions=typeof document!=='undefined'&&document.querySelector?document.querySelector('#panel .actions'):null;
 if(actions&&actions.insertAdjacentHTML){const after=actions.querySelector?actions.querySelector('[data-act="lens35"]'):null;if(after&&after.insertAdjacentHTML)after.insertAdjacentHTML('afterend',h);else actions.insertAdjacentHTML('beforeend',h);}
 else if(typeof panel!=='undefined'&&typeof panel.innerHTML==='string')panel.innerHTML+=h;return r;};
ACTIONS.bench36Start=function(){closePanel();bench36Start();};
ACTIONS.bench36Again=function(){closePanel();if(!bench36Again())benchToast36('Ada’s bench cannot be carried again just now.');};
ACTIONS.bench36Cancel=function(){closePanel();bench36Cancel();};
ACTIONS.bench36Reset=function(){closePanel();const B=BENCH36;if(B.state==='carrying'){B.glide=null;B.holder=[null,null];benchResetMotion36();B.y=0;B.liftT=0;B.liftDir=0;benchSetState36('grounded');}bench36Reset();};
ACTIONS.bench36RoomDown=function(){closePanel();bench36RoomDown();};
ACTIONS.bench36Runs=function(){const L=benchSave36(),runs=(L&&L.runs)||[];openPanel(`<h2>Bench runs</h2>${runs.length?'<ol class="small">'+runs.map((r,k)=>`<li>Delivery ${k+1}: ${Math.floor(r.dur/60)}:${String(r.dur%60).padStart(2,'0')}, ${r.bumps} bump${r.bumps===1?'':'s'}, ${r.setdowns} set-down${r.setdowns===1?'':'s'}, ${r.swaps} swap${r.swaps===1?'':'s'}, ${r.resets} reset${r.resets===1?'':'s'}</li>`).join('')+'</ol>':'<p class="muted small">No deliveries yet.</p>'}<div class="actions">${btn('Back','close',{},'primary')}</div>`);};
if(typeof LOCAL_ONLY!=='undefined')for(const n of ['bench36Start','bench36Again','bench36Cancel','bench36Reset','bench36RoomDown','bench36Runs'])LOCAL_ONLY.add(n);

/* ---------- 6.4 The evening and Ada's lines ---------- */
if(typeof EVENING35!=='undefined'&&typeof EVENING35.start==='function'){const prevStart36=EVENING35.start;
 // wrap: the neighbours do not start their evening visit while a delivery is open (their own retry picks it up later)
 EVENING35.start=function(){if(benchOpen36())return false;return prevStart36.apply(this,arguments);};}
if(typeof line35==='function'){const prevLine36=line35;
 // wrap: Ada thanks the pair once for carrying her bench in (placed today or yesterday), and her day-6 bench musing follows the delivery
 line35=function(who,ctx){const L=benchSave36();
  if(who==='ada'&&L&&!(ctx&&ctx.evening)){
   if(L.state==='placed'&&L.placedDay!==null&&(S.day===L.placedDay||S.day===L.placedDay+1)&&!L.adb){const used=S.life&&S.life.lines35&&S.life.lines35.day===S.day&&S.life.lines35.used&&S.life.lines35.used.ada||[];
    if(!used.includes('adb36')){L.adb=S.day;return {id:'adb36',text:'You carried it in yourselves? Through that passage? Then it is yours twice. Sit, sit. Gist is better sitting down.'};}}}
  const t=prevLine36.apply(this,arguments);
  if(t&&t.id==='ad36'&&L&&!(ctx&&ctx.evening))t.text=L.state==='placed'?'That bench is happier on your veranda than it ever was in my head. Long enough for everybody, short enough to argue on.':'Did you see it at your gate? Bring it in before somebody sits on it in the street.';
  return t;};}

/* v36 Ada's bench ("A Bench for Evening Gist"). Ada leaves a wooden bench at the street gate; the two players of a local household carry
   it together through the gate, the courtyard, the narrow passage, the flat door and the room to the veranda doorway, choose one of three
   arrangements of the one veranda spot that fits it, both agree, and the bench glides to that spot. Then they can sit on it together,
   facing out over the rail.
   The carry is complementary: one player (Move) walks the bench along its own axis, the other (Turn) swings it about its centre. One
   player can never move it. Walls and doorways guide it sideways by a few centimetres ("guided lateral", 3.5) but never turn it. The bench is one exact box in every state (half-extents 0.76 x 0.26); a holder is a disc of 0.22 m (squeezed
   in at their end; a walking player is 0.33 m).
   Two humans on one device only: companion and online households never see an unplaced bench, only one Menu line saying why (from day 2,
   with the sofa in); a companion household may switch to two players for the delivery and gets its companion back afterwards (10.8).
   Nothing else changes until a delivery is started from the Menu.
   Loaded after lens-v35.js. Every change wraps an earlier global and calls it. Top-level names end in 36. Wall-clock time is never read:
   the module's own clock (BENCH36.t) is the sum of the frame steps. */
'use strict';

const BENCH36={v:1,
 L:1.5,W:0.5,H:0.86,SEAT:0.46,
 HX:0.76,HZ:0.26,
 GRIP:0.72,STAND:0.90,TAKE:0.80,LIFT:0.45,
 HR:0.22,                                   // a holder squeezes in to this radius at their end (walking players keep PR 0.33)
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
 cost:{blocked:0,box:0,valid:0,substeps:0,nodes:0,bfs:0,cells:0,arr:0,assist:0,funnel:0},yawLeak:0,bp:null,lastWhy:null,bumpMsg:null,liftKey:'',grid:null,progress:0,seatTarget:null,seatDay:null,standing:false,
 takeFrame:-1,takeEnd:-1,letGoT:0,held:[0,0],relT:[9,9],wallAcc:{s:0,w:0},stuckAcc:0,glide:null,settle:null,okCache:null,
 pick:[{x:0,t:0},{x:0,t:0}],recoil:null,motes:[],cam:[null,null],notePending:false,delivered:false,paused:false,liftCheckT:0,
 mesh:{rings:[],ghost:null,chev:null},seq:0,arrowShown:['',''],states:[]};

/* ---------- small helpers ---------- */
const D2R36=Math.PI/180;
function benchLocal36(){return typeof singleIdx==='function'&&singleIdx()===-1&&!(typeof NET!=='undefined'&&NET.on)&&!(typeof AI!=='undefined'&&AI.on);}
function benchBusy36(){const s=BENCH36.state;return !BENCH36.paused&&(s==='ready'||s==='carrying'||s==='choosing'||s==='settling');}
function benchOpen36(){const s=BENCH36.state;return s==='grounded'||s==='ready'||s==='carrying'||s==='choosing'||s==='settling';}
function benchSave36(){return S&&S.life&&S.life.bench36?S.life.bench36:null;}
function benchItem36(){return S&&S.home&&S.home.items?S.home.items.find(it=>it.type==='bench'):null;}
// one of the three arrangements, or null (round 3, L1: an unknown saved key never reaches the chooser)
function benchKey36(k){return typeof k==='string'&&Object.prototype.hasOwnProperty.call(BENCH36.POSES,k)?k:null;}
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
// what stops a pose: null when it is free, else {k:'box',box} (the bench itself), {k:'holder',e,box} (a holder's body at end e) or {k:'level',e}
function bench36Why(pose,inflate){inflate=inflate||0;BENCH36.cost.valid++;
 const hit=bench36ObbHit(pose,inflate,{});if(hit)return {k:'box',box:hit};
 const a=benchAxis36(pose.yaw),S0=BENCH36.STAND;
 for(const e of [1,0]){const s=e?S0:-S0,x=pose.x+a[0]*s,z=pose.z+a[1]*s;const b=blocked(x,z,BENCH36.HR+inflate,{noBench:true});if(b)return {k:'holder',e,box:b};if(!carryLevelOK34(x,z))return {k:'level',e};}
 for(const t of [-0.75,-0.375,0,0.375,0.75])if(!carryLevelOK34(pose.x+a[0]*t,pose.z+a[1]*t))return {k:'level',e:t>0?1:0};
 return null;}
function bench36Valid(pose,inflate){const w=bench36Why(pose,inflate);if(w)BENCH36.lastWhy=w;return !w;}

/* ---------- 2.3 The walk grid, the liftable rule and the hubs ---------- */
// x -8.5..9.5, z -3.0..15.5: the flat, the courtyard, the back stairs and the whole width of the street. Anyone outside it is out in the wider
// world (Market Road, the Waterfront, the Yard, the Square), which the street joins, so their walk starts from the street.
const BENCH_GRID36={x0:-8.5,z0:-3.0,s:0.05,nx:361,nz:371,street:[4.0,10.2]};
function benchGridSig36(){let k=OBS.length+'|'+FURN_OBS.length+'|';for(const o of FURN_OBS)k+=o.x1+','+o.z1+';';
 if(typeof crate!=='undefined'&&crate)k+='|c'+crate.position.x+','+crate.position.z;
 if(typeof sofa!=='undefined'&&sofa)k+='|s'+(sofa.g.visible&&!sofa.carrying?sofa.g.position.x+','+sofa.g.position.z+','+sofa.g.rotation.y:'-');
 for(const pb of PUSH)k+='|p'+(pb.gone||pb.lvl?'-':pb.g.position.x+','+pb.g.position.z);return k;}
// rasterise the boxes blocked() tests (without the bench) at the player radius, with hitAABB's own arithmetic
function benchGridBuild36(){const G=BENCH_GRID36,base=new Uint8Array(G.nx*G.nz),r=PR;
 const boxes=benchBoxes36((G.x0+(G.nx-1)*G.s/2),(G.z0+(G.nz-1)*G.s/2),1e4,{});
 for(const o of boxes){const i0=Math.max(0,Math.floor((o.x1-r-G.x0)/G.s)-1),i1=Math.min(G.nx-1,Math.ceil((o.x2+r-G.x0)/G.s)+1),j0=Math.max(0,Math.floor((o.z1-r-G.z0)/G.s)-1),j1=Math.min(G.nz-1,Math.ceil((o.z2+r-G.z0)/G.s)+1);
  for(let i=i0;i<=i1;i++){const x=G.x0+i*G.s;if(!(x+r>o.x1&&x-r<o.x2))continue;for(let j=j0;j<=j1;j++){const z=G.z0+j*G.s;if(z+r>o.z1&&z-r<o.z2)base[i*G.nz+j]=1;}}}
 BENCH36.grid={base,sig:benchGridSig36()};benchOpenCheck36();benchObsIndex36();return BENCH36.grid;}
function benchGrid36(){const g=BENCH36.grid;if(!g||g.sig!==benchGridSig36())return benchGridBuild36();return g;}
// the grid with an oriented box (the bench, grounded or a candidate) added at the player radius
function benchGridWith36(box){const G=BENCH_GRID36,g=benchGrid36(),w=g.base.slice();if(!box)return w;const r=PR;
 const i0=Math.max(0,Math.floor((box.x1-r-G.x0)/G.s)-1),i1=Math.min(G.nx-1,Math.ceil((box.x2+r-G.x0)/G.s)+1),j0=Math.max(0,Math.floor((box.z1-r-G.z0)/G.s)-1),j1=Math.min(G.nz-1,Math.ceil((box.z2+r-G.z0)/G.s)+1);
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)if(bench36CircleOBB(G.x0+i*G.s,G.z0+j*G.s,r,box))w[i*G.nz+j]=1;return w;}
function benchCell36(x,z){const G=BENCH_GRID36;const i=Math.round((x-G.x0)/G.s),j=Math.round((z-G.z0)/G.s);return i<0||j<0||i>=G.nx||j>=G.nz?-1:i*G.nz+j;}
// breadth-first walk from a player's position (or the nearest free cell within 0.35 m; from the street for anyone outside the grid);
// stop(i,j), when given, is called on each cell reached and ends the walk early by returning true
function benchBFS36(w,x,z,stop,par){const G=BENCH_GRID36,N=G.nx*G.nz,seen=new Uint8Array(N);let s=benchCell36(x,z);BENCH36.cost.bfs++;
 if(s<0){s=benchCell36(G.street[0],G.street[1]);if(s<0)return seen;}
 if(w[s]){let best=-1,bd=1e9;const si=(s/G.nz)|0,sj=s-si*G.nz;for(let a=-7;a<=7;a++)for(let b=-7;b<=7;b++){const i=si+a,j=sj+b;if(i<0||j<0||i>=G.nx||j>=G.nz)continue;const n=i*G.nz+j;if(w[n])continue;const d=a*a+b*b;if(d<bd&&d<=49){bd=d;best=n;}}if(best<0)return seen;s=best;}
 const q=new Int32Array(N);let h=0,t=0;q[t++]=s;seen[s]=1;
 while(h<t){const n=q[h++],i=(n/G.nz)|0,j=n-i*G.nz;if(stop&&stop(i,j))break;
  if(i>0){const m=n-G.nz;if(!seen[m]&&!w[m]){seen[m]=1;q[t++]=m;if(par)par[m]=n;}}if(i<G.nx-1){const m=n+G.nz;if(!seen[m]&&!w[m]){seen[m]=1;q[t++]=m;if(par)par[m]=n;}}
  if(j>0){const m=n-1;if(!seen[m]&&!w[m]){seen[m]=1;q[t++]=m;if(par)par[m]=n;}}if(j<G.nz-1){const m=n+1;if(!seen[m]&&!w[m]){seen[m]=1;q[t++]=m;if(par)par[m]=n;}}}
 BENCH36.cost.cells+=h;return seen;}
// which of the given stand points a player’s walk reaches: a free cell within rad of it from which the straight step to it is clear (the step
// benchTake36 and benchLift36 make; round 3, H1: a cell behind a jamb no longer counts); stops once all are reached
function benchReachPts36(w,p,pts,rad){const G=BENCH_GRID36,f=pts.map(()=>false),r2=rad*rad,st=pts.map(q=>benchStepMemo36(q));let left=pts.length;
 benchBFS36(w,p[0],p[1],(i,j)=>{const x=G.x0+i*G.s,z=G.z0+j*G.s;for(let e=0;e<pts.length;e++){if(f[e])continue;const dx=x-pts[e][0],dz=z-pts[e][1];if(dx*dx+dz*dz<=r2&&benchStepAt36(st[e],i*G.nz+j,x,z)){f[e]=true;left--;}}return left===0;});return f;}
// the straight step from a cell to stand point E, kept per cell for each stand point (and world): exact against the boxes blocked() tests, each
// grown by HR as hitAABB grows it (with 1e-9 to spare), so it is clear only where every one of benchSlideClear36's samples is clear too
function benchStepMemo36(E){const B=BENCH36,sig=B.grid?B.grid.sig:'',k=E[0]+','+E[1]+'|'+sig,c=B.stepMemo||(B.stepMemo=new Map());let m=c.get(k);
 if(!m){m={E,list:benchBoxes36(E[0],E[1],B.TAKE+B.HR+0.1,{}),cell:new Map()};if(c.size>=12)c.delete(c.keys().next().value);c.set(k,m);}return m;}
function benchStepAt36(m,n,x,z){let v=m.cell.get(n);if(v!==undefined)return v;const r=BENCH36.HR+1e-9,ex=m.E[0],ez=m.E[1],dx=ex-x,dz=ez-z;v=true;
 for(const o of m.list){let t0=0,t1=1;
  if(Math.abs(dx)<1e-12){if(!(x>o.x1-r&&x<o.x2+r))continue;}else{let a=(o.x1-r-x)/dx,b=(o.x2+r-x)/dx;if(a>b){const t=a;a=b;b=t;}if(a>t0)t0=a;if(b<t1)t1=b;}
  if(Math.abs(dz)<1e-12){if(!(z>o.z1-r&&z<o.z2+r))continue;}else{let a=(o.z1-r-z)/dz,b=(o.z2+r-z)/dz;if(a>b){const t=a;a=b;b=t;}if(a>t0)t0=a;if(b<t1)t1=b;}
  if(t0<t1){v=false;break;}}
 m.cell.set(n,v);return v;}
// both stand-point discs free, and the two players matched to the two ends, each reaching a free cell within TAKE of their own end; and
// (11.3) an order in which they can take them: whoever takes an end first stands at it, and their body (a disc of HR+PR) must not shut the
// other out of the way round to the other end
function bench36Liftable(pose,positions){
 for(const e of [0,1]){const [x,z]=benchEnd36(pose,e);if(blocked(x,z,BENCH36.HR,{noBench:true})||!carryLevelOK34(x,z))return false;}
 positions=positions||[benchPos36(0),benchPos36(1)];const w=benchHeldGrid36(pose,-1),ends=[benchEnd36(pose,0),benchEnd36(pose,1)];
 const r0=benchReachPts36(w,positions[0],ends,BENCH36.TAKE);if(!r0[0]&&!r0[1])return false;
 const r1=benchReachPts36(w,positions[1],ends,BENCH36.TAKE);
 if(!((r0[0]&&r1[1])||(r0[1]&&r1[0])))return false;
 return benchOrderOK36(pose,positions,[r0,r1]);}
// each player reaches a hub region (any free cell of the courtyard, the room or the street) with the box given (default: the bench on the ground)
function bench36Free(positions,box){positions=positions||[benchPos36(0),benchPos36(1)];const w=benchGridWith36(box===undefined?bench36GroundBox():box),G=BENCH_GRID36;
 const inHub=(i,j)=>{const x=G.x0+i*G.s,z=G.z0+j*G.s;for(const [x1,x2,z1,z2] of BENCH36.HUBS)if(x>=x1-1e-9&&x<=x2+1e-9&&z>=z1-1e-9&&z<=z2+1e-9)return true;return false;};
 return positions.every(p=>{let hit=false;benchBFS36(w,p[0],p[1],(i,j)=>{if(inHub(i,j))hit=true;return hit;});return hit;});}

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
function benchRemodel36(){const B=BENCH36;if(B.g){const old=B.g.children.find(c=>c.userData&&c.userData.fallback36);if(old&&PROPS.cache.bench_wooden){B.g.remove(old);B.g.add(benchModel36(false));benchXray36();}}
 if(B.mesh.ghost&&B.mesh.ghost.children.some(c=>c.userData&&c.userData.fallback36)){scene.remove(B.mesh.ghost);B.mesh.ghost=null;}
 if(B.state==='placed'||B.state==='seated')try{rebuildFurniture();}catch(e){}}
function benchBuildMesh36(){const B=BENCH36;benchDropMesh36();const g=new THREE.Group();g.name='bench36';g.add(benchModel36(false));
 B.wraps=[0,1].map(e=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,0.10,10),benchMat36(B.COL.wrap));m.rotation.z=Math.PI/2;m.position.set(e?B.GRIP:-B.GRIP,0.44,0);m.name='bench36-wrap';g.add(m);return m;});
 scene.add(g);B.g=g;benchXray36();
 B.mesh.rings=[0,1].map(()=>{const r=new THREE.Mesh(new THREE.RingGeometry(0.2,0.28,28),new THREE.MeshBasicMaterial({color:'#F1E4CC',transparent:true,opacity:0.5,depthWrite:false}));r.rotation.x=-Math.PI/2;r.position.y=0.025;r.visible=false;r.name='bench36-ring';scene.add(r);return r;});
 const sh=new THREE.Shape();sh.moveTo(-0.25,-0.1);sh.lineTo(0,0.15);sh.lineTo(0.25,-0.1);sh.lineTo(0.25,-0.22);sh.lineTo(0,0.03);sh.lineTo(-0.25,-0.22);sh.closePath();
 const ch=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:'#F2E3B5',transparent:true,opacity:0.35,depthWrite:false}));ch.rotation.x=-Math.PI/2;ch.position.y=0.03;ch.visible=false;ch.name='bench36-chevron';scene.add(ch);B.mesh.chev=ch;
 benchDrawMesh36();}
// a faint see-through copy of the bench, drawn only where something stands in front of it (a holder, a wall), while it is held: the bench
// never vanishes behind a person or the passage wall
function benchXray36(){const B=BENCH36;if(!B.g)return;if(B.xray){B.g.remove(B.xray);B.xray=null;}const model=B.g.children.find(c=>c.name!=='bench36-wrap'&&c.name!=='bench36-xray');if(!model)return;
 const mat=new THREE.MeshBasicMaterial({color:'#FFF0D2',transparent:true,opacity:0.3,depthWrite:false});if(THREE.GreaterDepth!==undefined)mat.depthFunc=THREE.GreaterDepth;else mat.depthTest=false;
 const x=new THREE.Group();x.name='bench36-xray';B.g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(B.g.matrixWorld).invert();
 model.traverse(o=>{if(o.isMesh&&o.geometry){const m=new THREE.Mesh(o.geometry,mat);m.matrixAutoUpdate=false;m.matrix.copy(inv).multiply(o.matrixWorld);m.renderOrder=990;m.castShadow=false;m.receiveShadow=false;x.add(m);}});
 x.visible=false;B.g.add(x);B.xray=x;}
function benchDropMesh36(){const B=BENCH36;if(B.g){scene.remove(B.g);B.g=null;}for(const r of B.mesh.rings)scene.remove(r);B.mesh.rings=[];if(B.mesh.chev){scene.remove(B.mesh.chev);B.mesh.chev=null;}
 if(B.mesh.ghost){scene.remove(B.mesh.ghost);B.mesh.ghost=null;}if(B.mesh.aux){scene.remove(B.mesh.aux);B.mesh.aux=null;}for(const m of B.motes)scene.remove(m.m);B.motes=[];}
function benchFade36(g,o){if(!g)return;g.traverse(m=>{if(m.isMesh&&m.material){m.material.transparent=o<1;m.material.opacity=o;}});g.visible=o>0.001;}
function benchRoleColour36(e){const B=BENCH36,h=B.holder[e];if(h===null||h===undefined)return null;return h===B.mover?B.COL.move:B.COL.turn;}
// the mesh at the pose: lifted while carried, recoil after a bump, wraps and rings in the role colours
function benchDrawMesh36(){const B=BENCH36,g=B.g;if(!g)return;const p=B.pose;let ox=0,oz=0;
 if(B.recoil){const k=Math.max(0,1-(B.t-B.recoil.t0)/0.16);ox=B.recoil.dx*0.05*k;oz=B.recoil.dz*0.05*k;if(k<=0)B.recoil=null;}
 const veranda=p.z>5.9&&p.x<-2.6?0.05:0;g.position.set(p.x+ox,B.y+veranda,p.z+oz);g.rotation.y=p.yaw;g.visible=!B.paused&&(B.state!=='settling'||!B.settle||B.settle.kind!=='done');
 if(B.xray)B.xray.visible=!B.paused&&(B.state==='ready'||B.state==='carrying');
 for(const e of [0,1]){const col=benchRoleColour36(e)||B.COL.wrap;if(B.wraps&&B.wraps[e])B.wraps[e].material.color.set(col);
  const r=B.mesh.rings[e];if(!r)continue;const [x,z]=benchEnd36(p,e);r.position.x=x;r.position.z=z;
  const show=!B.paused&&(B.state==='grounded'||B.state==='ready')&&players.some(q=>Math.hypot(q.g.position.x-p.x,q.g.position.z-p.z)<3);r.visible=show;r.material.color.set(benchRoleColour36(e)||'#F1E4CC');}
 const ch=B.mesh.chev;if(ch){const W=bench36NextCorner(0);ch.visible=!B.paused&&B.state==='carrying'&&!!W;if(W){ch.position.x=W.x;ch.position.z=W.z;ch.rotation.z=Math.atan2(W.x-p.x,-(W.z-p.z));}}}
// a puff of dust: five motes spread across the contact (dir: the way the push met it), drawn over whatever stands in front so it always reads
function benchMotes36(x,z,y0,dir){const B=BENCH36,y=y0||0.15,px=dir?-dir[1]:1,pz=dir?dir[0]:0;for(let k=0;k<5;k++){const m=new THREE.Mesh(new THREE.SphereGeometry(0.1-0.012*k,8,6),new THREE.MeshBasicMaterial({color:'#C9AF86',transparent:true,opacity:0.85,depthWrite:false,depthTest:false}));
 m.renderOrder=995;m.position.set(x+px*(k-2)*0.08,y+0.06*k,z+pz*(k-2)*0.08);scene.add(m);B.motes.push({m,t0:B.t,vy:0.3+0.08*k});}}
function benchMotesStep36(dt){const B=BENCH36;for(let k=B.motes.length-1;k>=0;k--){const o=B.motes[k],a=(B.t-o.t0)/0.7;if(a>=1){scene.remove(o.m);B.motes.splice(k,1);continue;}o.m.position.y+=o.vy*dt;o.m.scale.setScalar(1+a);o.m.material.opacity=0.85*(1-a);}}
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
function benchSetState36(s){const B=BENCH36;if(B.state!==s){B.states.push(s);if(B.states.length>400)B.states.shift();B.transT=B.t;B.hudLive=3;}B.state=s;B.seq++;if(s!=='grounded')benchFindClear36();benchHUD36();benchBusyClass36();}
function benchStats36(){return BENCH36.stats||(BENCH36.stats={dur:0,bumps:0,setdowns:0,swaps:0,resets:0,lifted:false});}
function benchResetMotion36(){const B=BENCH36;B.assist=null;B.wRef=[];B.turnAid=null;B.vel.s=0;B.vel.w=0;B.latch=[null,null];B.wall.s=0;B.wall.w=0;B.outT=[0,0];B.wallAcc.s=0;B.wallAcc.w=0;}
function benchFreeSpot36(x,z,box){return !blocked(x,z,PR,{noBench:true})&&!(box&&bench36CircleOBB(x,z,PR,box))&&carryLevelOK34(x,z);}
// the nearest free point on rings of 0.1-0.6 m around (x,z), outside the box (the frontSpot34b pattern)
function benchRing36(x,z,box,avoid){if(benchFreeSpot36(x,z,box)&&!(avoid&&avoid(x,z)))return [x,z];
 for(let rad=0.1;rad<=0.601;rad+=0.1)for(let k=0;k<16;k++){const an=k/16*Math.PI*2,a=x+Math.sin(an)*rad,b=z+Math.cos(an)*rad;if(benchFreeSpot36(a,b,box)&&!(avoid&&avoid(a,b)))return [a,b];}return null;}
// 2.2 step 1: each holder (or each player standing at an end) moves outward along the axis to 1.10, or to the nearest free ring point
function benchNudged36(pose,who){const box=benchBox36(pose,0),out=[benchPos36(0),benchPos36(1)];
 for(const e of [0,1]){const i=who?who[e]:BENCH36.holder[e];if(i===null||i===undefined)continue;const [x,z]=benchEnd36(pose,e,BENCH36.HX+PR+0.01),[sx,sz]=benchEnd36(pose,e);
  const spot=benchFreeSpot36(x,z,box)&&benchSlideClear36([x,z],[sx,sz])?[x,z]:benchNudgeSpot36(sx,sz,box);if(!spot)return null;out[i]=spot;}
 for(const i of [0,1]){if(bench36CircleOBB(out[i][0],out[i][1],PR,box)){const s=benchRing36(out[i][0],out[i][1],box);if(!s)return null;out[i]=s;}}
 return out;}
// anyone whose body overlaps the box (a load, or back on one device after the bench was absent online) moves to a free point up to 1.5 m away,
// on their side of any wall, preferring the nearest one from which the pose is liftable (the bench then stays where it was)
function benchNudgeOut36(box,pose){for(const i of [0,1]){const q=benchPos36(i);if(!bench36CircleOBB(q[0],q[1],PR,box))continue;const cands=[];
 for(let rad=0.1;rad<=1.501;rad+=0.1)for(let k=0;k<16;k++){const an=k/16*Math.PI*2,a=q[0]+Math.sin(an)*rad,b=q[1]+Math.cos(an)*rad;if(!benchFreeSpot36(a,b,box))continue;
  let wall=false;const n=Math.ceil(rad/0.05);for(let s=1;s<n&&!wall;s++)if(blocked(q[0]+(a-q[0])*s/n,q[1]+(b-q[1])*s/n,0.05,{noBench:true}))wall=true;if(!wall)cands.push([a,b]);}
 if(!cands.length)continue;let pick=cands[0];if(pose)for(const c of cands.slice(0,24)){const pos=[benchPos36(0),benchPos36(1)];pos[i]=c;if(bench36Liftable(pose,pos)){pick=c;break;}}benchPlace36(i,pick[0],pick[1]);}}
function benchPlace36(i,x,z,face){const p=players[i];if(!p)return;p.g.position.x=x;p.g.position.z=z;p.prev=[x,z];p.y=levelAt(x,z);p.lvl=lvlOf(p.y);p.g.baseY=p.y;if(face)p.g.rotation.y=Math.atan2(face[0]-x,face[1]-z);}
function benchTrapName36(pose,pos){const w=benchGridWith36(benchBox36(pose,0)),ends=[benchEnd36(pose,0),benchEnd36(pose,1)];
 for(const i of [0,1]){const r=benchReachPts36(w,pos[i],ends,BENCH36.TAKE);if(!r[0]&&!r[1])return benchPlayerName36(i);}return benchPlayerName36(1);}
// set-down, let-go and the automatic set-down: nudge the holders, check the pose is liftable, else nudge the bench (a short glide) or refuse
function benchSafeDown36(by,why){const B=BENCH36,pose=bench36Pose(),P=benchDownPlan36(pose);
 if(P.kind==='down'){benchFinishDown36(pose,P.pos,why);return true;}
 if(P.kind==='glide'){B.glide={from:pose,to:P.to,t:0,dur:0.2,pos:P.pos,why};benchToast36('Bit further… there.');return true;}
 if(why!=='system')benchToast36(benchRefuseText36(pose,P));if(why==='act')B.refused36={key:benchPoseKey36(pose),t:B.t};return false;}
// what a set-down here would do (nothing is changed): {kind:'down', pos}, {kind:'glide', to, pos} (a short glide to a liftable pose nearby),
// or {kind:'no', pos} (pos null when a holder has no free spot to step back to)
function benchDownPlan36(pose){const pos=benchNudged36(pose);if(pos&&bench36Liftable(pose,pos))return {kind:'down',pos};
 const a=benchAxis36(pose.yaw),cands=[];for(let k=1;k<=6;k++)for(const sg of [1,-1])cands.push({x:pose.x+a[0]*0.05*k*sg,z:pose.z+a[1]*0.05*k*sg,yaw:pose.yaw});
 for(let k=1;k<=3;k++)for(const sg of [1,-1])cands.push({x:pose.x,z:pose.z,yaw:pose.yaw+sg*5*k*D2R36});
 for(const c of cands){if(!bench36Valid(c)||!benchLineValid36(pose,c))continue;const q=benchNudged36(c);if(!q||!bench36Liftable(c,q))continue;return {kind:'glide',to:c,pos:q};}
 return {kind:'no',pos};}
// round 3 (M1): a refusal says what is wrong: a holder with no room to step back, or a player who could not get round to an end
function benchRefuseText36(pose,P){if(!P.pos){const B=BENCH36,box=benchBox36(pose,0);let who=B.holder[1]!==null?B.holder[1]:0;
  for(const e of [0,1]){const i=B.holder[e];if(i===null||i===undefined)continue;const [sx,sz]=benchEnd36(pose,e),[x,z]=benchEnd36(pose,e,B.HX+PR+0.01);if(!(benchFreeSpot36(x,z,box)&&benchSlideClear36([x,z],[sx,sz]))&&!benchNudgeSpot36(sx,sz,box)){who=i;break;}}
  return `Not here: ${benchPlayerName36(who)} has no room to step back. Carry it on a little first.`;}
 return `Not here, it would box ${benchTrapName36(pose,P.pos)} in. Move a little first.`;}
function benchLineValid36(a,b){const n=Math.max(1,Math.ceil(Math.max(Math.hypot(b.x-a.x,b.z-a.z)/0.01,Math.abs(benchWrapA36(b.yaw-a.yaw))/D2R36)));
 for(let k=1;k<=n;k++){const t=k/n;if(!bench36Valid({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:a.yaw+benchWrapA36(b.yaw-a.yaw)*t}))return false;}return true;}
function benchFinishDown36(pose,pos,why){const B=BENCH36;B.pose={x:pose.x,z:pose.z,yaw:pose.yaw};B.snap=null;
 for(const i of [0,1])if(benchHolderOf36(i)>=0)benchPlace36(i,pos[i][0],pos[i][1],[pose.x,pose.z]);
 B.holder=[null,null];benchResetMotion36();B.liftDir=-1;B.glide=null;if(why!=='letgo'&&why!=='system'&&why!=='pause')benchStats36().setdowns++;
 benchUnstick36();benchSetState36('grounded');benchProgress36();if(why!=='pause'&&benchInZone36(pose,pos))benchDeliver36(pos);benchCheckStuck36();if(why==='pause')benchPaused36();}   // a pause leaves it down, even in the doorway: the chooser opens when they lift it there again
// a set-down, a let-go, a lift or a reset starts afresh: the stall that made it stuck is over (the liftable check may set it again)
function benchUnstick36(){const B=BENCH36;B.stuck=false;B.stuckT=0;B.stuckAcc=0;B.liftKey='';}

// 2.1 the delivery zone: one holder on the row, the other in the room, either way round; the centre in the doorway, and (round 3, H2) the
// bench within ZONEA of the doorway's axis either way round. The shipped plan comes in 25 degrees off (its last move is Move's alone, as a
// pair's is); a bench 45 degrees off, which the walls' sideways help could push into the zone, needs the Turn player's swing first.
BENCH36.ZONEA=30*Math.PI/180;
function benchZoneYaw36(yaw){let d=benchWrapA36(Math.PI/2-yaw);if(d>Math.PI/2)d-=Math.PI;if(d<-Math.PI/2)d+=Math.PI;return Math.abs(d)<=BENCH36.ZONEA+1e-9;}
function benchInZone36(pose,pos){if(!(pose.x>-4.6&&pose.x<-3.6)||!benchZoneYaw36(pose.yaw))return false;return (pos[0][1]>5.9&&pos[1][1]<5.55)||(pos[1][1]>5.9&&pos[0][1]<5.55);}
// a grounded bench that nobody can lift is stuck (rechecked each second, but only when the bench, a player's grid cell or the world changed)
function benchCheckStuck36(){const B=BENCH36;if(B.state!=='grounded')return;B.liftCheckT=B.t;const pos=[benchPos36(0),benchPos36(1)],G=BENCH_GRID36;
 const key=[B.pose.x,B.pose.z,B.pose.yaw].join(',')+'|'+pos.map(q=>Math.round(q[0]/G.s)+','+Math.round(q[1]/G.s)).join(';')+'|'+(B.grid?B.grid.sig:'');
 if(key===B.liftKey)return;B.liftKey=key;const ok=bench36Liftable(B.pose,pos);if(!ok){B.stuck=true;B.stuckAcc=0;}else if(B.stuck&&!(B.stuckT>=2.5))B.stuck=false;}

function benchTake36(i){const B=BENCH36,p=players[i];if(!p||p.g.sitting)return false;
 let best=-1,bd=1e9;for(const e of [0,1]){const [x,z]=benchEnd36(B.pose,e),d=Math.hypot(p.g.position.x-x,p.g.position.z-z);if(d<=B.TAKE&&d<bd){bd=d;best=e;}}
 if(best<0)return false;
 if(B.holder[best]!==null&&B.holder[best]!==i){if(B.state==='ready'&&B.holder[1-best]===null){const [x,z]=benchEnd36(B.pose,1-best);if(Math.hypot(p.g.position.x-x,p.g.position.z-z)<=B.TAKE)return benchLift36(i);}
  benchToast36(`${benchPlayerName36(B.holder[best])} has that end. Take the other one.`);return true;}
 if(B.state==='ready'&&B.holder[1-best]!==null&&B.holder[1-best]!==i)return benchLift36(i);
 const [x,z]=benchEnd36(B.pose,best);if(blocked(x,z,B.HR,{noBench:true})||!carryLevelOK34(x,z)){benchToast36('That end is wedged. Try the other one.');return true;}
 if(!benchSlideClear36(benchPos36(i),[x,z])){benchToast36('Come round to this end first.');return true;}
 if(B.state==='grounded'&&benchTakeBoxesC36(i,best)){benchToast36(`${benchPlayerName36(1-i)} needs this end to get round. Take the other one.`);return true;}   // 11.3
 B.holder[best]=i;B.takeFrame=B.frame;B.takeEnd=best;B.snap={i,from:benchPos36(i),to:[x,z],t:0};B.letGoT=0;if(typeof playPick==='function')playPick(p.g);
 benchSetState36('ready');return true;}
// the 0.15 s step a player takes to their stand point is a straight line: it must not pass through a wall, a post or a piece of furniture
function benchSlideClear36(from,to){const B=BENCH36,k=from[0].toFixed(3)+','+from[1].toFixed(3)+'>'+to[0].toFixed(3)+','+to[1].toFixed(3)+'|'+(B.grid?B.grid.sig:'');
 const c=B.slideCache||(B.slideCache=new Map());if(c.has(k))return c.get(k);const n=Math.max(1,Math.ceil(Math.hypot(to[0]-from[0],to[1]-from[1])/0.02));let ok=true;
 for(let s=1;s<=n&&ok;s++){const t=s/n,x=from[0]+(to[0]-from[0])*t,z=from[1]+(to[1]-from[1])*t;if(blocked(x,z,B.HR,{noBench:true}))ok=false;}
 if(c.size>=8)c.delete(c.keys().next().value);c.set(k,ok);return ok;}
function benchLift36(j){const B=BENCH36,e=B.holder[0]===null?0:1;if(B.holder[1-e]===null||B.holder[1-e]===j)return false;const [x,z]=benchEnd36(B.pose,e);
 if(blocked(x,z,B.HR,{noBench:true})||!carryLevelOK34(x,z)){benchToast36('That end is wedged. Set it straight first.');return true;}
 if(!benchSlideClear36(benchPos36(j),[x,z])){benchToast36('Come round to this end first.');return true;}
 B.holder[e]=j;B.front=B.holder[0]===B.mover?0:1;B.snap={i:j,from:benchPos36(j),to:[x,z],t:0};B.liftDir=1;benchResetMotion36();benchUnstick36();
 for(const k of [0,1])if(players[k]&&typeof playPick==='function')playPick(players[k].g);
 const st=benchStats36(),L=benchSave36();if(L&&L.firstMover===undefined)L.firstMover=B.mover;st.lifted=true;if(L&&(L.hints||0)<2){L.hints=(L.hints||0)+1;B.hintUntil=B.t+12;}else B.hintUntil=0;   // each of the first two lifts has its hint
 benchSetState36('carrying');B.corner=benchCornerFor36();benchToast36(`Lifted. ${benchPlayerName36(B.mover)} walks it, ${benchPlayerName36(1-B.mover)} turns it.`);return true;}
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
// what a box is, in the words of the bump line
function benchThing36(b){if(!b)return 'wall';if(b.pb)return b.tag==='cooler'?'cooler':'crate';if(b.tag==='crate')return 'crate';if(typeof sofa!=='undefined'&&sofa&&b.tag==='sofa')return 'sofa';if(FURN_OBS.includes(b))return 'furniture';
 return (b.x2-b.x1)<0.7&&(b.z2-b.z1)<0.7?'post':'wall';}
// a bump: the cue goes where the contact is (beside a holder when their body is what met the wall), the bench recoils, and both prompts say what happened
function benchBumpCue36(dirx,dirz,cx,cz,why){const B=BENCH36;if(B.t-B.lastBumpT<0.4)return;B.lastBumpT=B.t;B.bump++;benchStats36().bumps++;
 const m=Math.hypot(dirx,dirz)||1;B.recoil={dx:-dirx/m,dz:-dirz/m,t0:B.t};let who=-1,px=cx,pz=cz;
 if(why&&(why.k==='holder'||why.k==='level')&&B.holder[why.e]!==null){who=B.holder[why.e];const q=benchPos36(who);px=q[0];pz=q[1];
  if(why.box){const bx=Math.max(why.box.x1,Math.min(why.box.x2,px)),bz=Math.max(why.box.z1,Math.min(why.box.z2,pz)),d=Math.hypot(bx-px,bz-pz)||1,r=Math.min(d,B.HR)*0.7;px+=(bx-px)/d*r;pz+=(bz-pz)/d*r;}}
 B.bumpMsg={t:B.t,who,thing:why&&why.k==='level'?'step':benchThing36(why&&why.box)};benchMotes36(px,pz,who>=0?0.5:0.15,[dirx/m,dirz/m]);benchTok36();benchHUD36();}   // a body's knock puffs at hip height, where the view sees it
/* ---------- 3.5 Guided walls ("guided lateral") ---------- */
// Move still slides the bench along its own length and Turn still swings it about its centre. Walls and doorways only ever move it
// sideways, a few centimetres at a time; they never turn it, so only the Turn player changes the heading (BENCH36.yawLeak counts any frame
// that breaks this; it stays 0).
// - A push along the bench that a wall refuses at contact first tries a sideways step of LAT/2, then LAT, away from what the leading end met
//   (with the push, or alone when the push and the step together would cut a corner).
// - A swing that a wall refuses first tries a step of the centre (LAT/2, then LAT) away from what the swinging end met, at most CAPS a contact.
// - What the walls give is capped per contact (CAPL metres in all) and refills only after FREE metres of unassisted Move travel, or a
//   set-down and lift, or (round 2b) a push the other way along the bench: backing out of a corner is a new contact. So a holder wedged in
//   the corner by the street gate's west pillar, the walls' help spent on the way in, gets the sideways steps that let the pair back out,
//   and the walls still guide a bench that is nearly lined up but never take it round a corner.
// - The funnel: a bench pushed along its length through the street gate (round 2b), the passage, the flat door or the veranda doorway,
//   already within FUNA of the opening's axis, is drawn towards the opening's centre line at FUNL metres per metre pushed.
// Every correction is tested at its end and along its whole straight move (the box exactly, the holders at the midpoint; a correction with
// a swing in it at its midpoint), and the search stops while the sub-step can still afford today's bisection
// (BUDGET obstacle checks a sub-step). When nothing frees a push, it is bisected to contact and stopped, as before.
BENCH36.SCHEME='guided-lateral';
BENCH36.GUIDE={on:true,LAT:0.02,CAPL:0.15,SWING:true,CAPS:0.08,FREE:0.30,FUN:true,FUNA:15*Math.PI/180,FUNL:0.30,BUDGET:11,
 // the openings the funnel serves: the axis the bench passes along ('z': a north-south opening whose centre line is x = c; 'x': east-west,
 // z = c), the axis yaw and the region of bench centres (x1, x2, z1, z2). The centres are checked against the walls (benchOpenCheck36).
 OPEN:[{n:'passage',ax:'z',c:-1.75,yaw:Math.PI/2,r:[-2.5,-1.0,0.35,2.9]},{n:'flat door',ax:'x',c:4.9,yaw:0,r:[-3.4,-1.45,4.0,5.65]},{n:'veranda doorway',ax:'z',c:-4.1,yaw:Math.PI/2,r:[-4.9,-3.3,4.3,6.0]},
  // (round 2b) the street gate, between its pillars (the walls give 3.2 to 4.8 m): the centre from 1.4 m inside the gate to 1.6 m out on the street
  {n:'street gate',ax:'z',c:4.0,yaw:Math.PI/2,r:[3.0,5.0,4.6,7.6]}]};
// the openings measured from the walls: across each region, at stations every 0.1 m along its axis, the free span of blocked() (walls,
// stairs, furniture and the pushables; not the crate, the sofa or the bench) around the typed centre; the narrowest span is the opening.
// A measured centre more than 0.03 m from the typed one switches the funnel off for that opening, and says so in BENCH36.openLog.
function benchOpenSpan36(O,s){const lim=1.0,free=v=>{const x=O.ax==='z'?v:s,z=O.ax==='z'?s:v;return !blocked(x,z,0,{noBench:true,noCrate:true,noSofa:true});};
 if(!free(O.c))return null;const edge=dir=>{let a=0,b=null;for(let d=0.02;d<=lim+1e-9;d+=0.02){if(!free(O.c+dir*d)){b=d;break;}a=d;}if(b===null)return lim;
  for(let k=0;k<10;k++){const m=(a+b)/2;if(free(O.c+dir*m))a=m;else b=m;}return (a+b)/2;};
 const lo=edge(-1),hi=edge(1);return {lo:O.c-lo,hi:O.c+hi,w:lo+hi};}
function benchOpenSig36(){let k=OBS.length+'|'+FURN_OBS.length+'|';for(const o of FURN_OBS)k+=o.x1+','+o.z1+';';for(const pb of PUSH)k+='|p'+(pb.gone||pb.lvl?'-':pb.g.position.x+','+pb.g.position.z);return k;}
function benchOpenCheck36(){const B=BENCH36,G=B.GUIDE,list=[],sig=benchOpenSig36();if(B.openChk&&B.openChk.sig===sig)return B.openChk;B.openLog=B.openLog||[];
 for(const O of G.OPEN){const [x1,x2,z1,z2]=O.r,a0=O.ax==='z'?z1:x1,a1=O.ax==='z'?z2:x2;let best=null;
  for(let s=a0;s<=a1+1e-9;s+=0.1){const sp=benchOpenSpan36(O,s);if(sp&&(!best||sp.w<best.w-1e-6))best=sp;}
  const c=best?(best.lo+best.hi)/2:NaN,ok=!!best&&best.w<1.9&&Math.abs(c-O.c)<=0.03;
  list.push({n:O.n,c:ok?c:O.c,w:best?best.w:0,ok});
  if(!ok){const msg=`bench36: the ${O.n} measures ${best?(Math.round(c*1000)/1000)+' m':'nothing'}, not ${O.c} m; its funnel is off`;if(B.openLog[B.openLog.length-1]!==msg){B.openLog.push(msg);if(B.openLog.length>20)B.openLog.shift();if(typeof console!=='undefined'&&console.warn)console.warn(msg);}}}
 B.openChk={list,sig};return B.openChk;}
function benchAssistReset36(){BENCH36.assist={lat:0,sw:0,free:0,n:0,sd:0};}
// the closest point of the obstacle that stopped a pose to a given point (null for a step or no box)
function benchContact36(why,px,pz){if(!why||!why.box)return null;const b=why.box;return [Math.max(b.x1,Math.min(b.x2,px)),Math.max(b.z1,Math.min(b.z2,pz))];}
// the straight move of the bench box from a to b at one yaw, against the boxes bench36ObbHit tests: exact (the hull of the two boxes, by
// separating axes: the world's two, the bench's two and the normal of the move), so a sideways correction never cuts a corner between frames
function benchSweepHit36(a,b){const B=BENCH36;B.cost.box++;const hx=B.HX,hz=B.HZ,ux=Math.cos(a.yaw),uz=-Math.sin(a.yaw),nx=Math.sin(a.yaw),nz=Math.cos(a.yaw);
 const mx=b.x-a.x,mz=b.z-a.z,ml=Math.hypot(mx,mz),pts=[];for(const c of [a,b])for(const [sx,sz] of [[1,1],[1,-1],[-1,1],[-1,-1]])pts.push([c.x+(ux*hx*sx+nx*hz*sz),c.z+(uz*hx*sx+nz*hz*sz)]);
 const axes=[[ux,uz],[nx,nz]];if(ml>1e-12)axes.push([-mz/ml,mx/ml]);let x1=Infinity,x2=-Infinity,z1=Infinity,z2=-Infinity;for(const q of pts){x1=Math.min(x1,q[0]);x2=Math.max(x2,q[0]);z1=Math.min(z1,q[1]);z2=Math.max(z2,q[1]);}
 const cx=(a.x+b.x)/2,cz=(a.z+b.z)/2,bp=B.bp,list=bp&&bp.frame===B.frame&&Math.hypot(cx-bp.x,cz-bp.z)<=1.4-ml?bp.list:benchBoxes36(cx,cz,0.85+ml,{});
 for(const o of list){if(x2<=o.x1||x1>=o.x2||z2<=o.z1||z1>=o.z2)continue;let sep=false;
  for(const [ax,az] of axes){let lo=Infinity,hi=-Infinity,bl=Infinity,bh=-Infinity;for(const q of pts){const d=q[0]*ax+q[1]*az;if(d<lo)lo=d;if(d>hi)hi=d;}
   for(const d of [o.x1*ax+o.z1*az,o.x1*ax+o.z2*az,o.x2*ax+o.z1*az,o.x2*ax+o.z2*az]){if(d<bl)bl=d;if(d>bh)bh=d;}if(hi<=bl||lo>=bh){sep=true;break;}}
  if(!sep)return o;}
 return null;}
// the holders (at their squeezed-in radius) and the carry level at a pose, without the box test
function benchHoldersOK36(pose){const B=BENCH36,a=benchAxis36(pose.yaw);for(const e of [1,0]){const s=e?B.STAND:-B.STAND,x=pose.x+a[0]*s,z=pose.z+a[1]*s,b=blocked(x,z,B.HR,{noBench:true});
  if(b){B.lastWhy={k:'holder',e,box:b};return false;}if(!carryLevelOK34(x,z)){B.lastWhy={k:'level',e};return false;}}return true;}
// a corrected candidate q (from p; s0, when given, is where this sub-step's move began): valid at its end; then, at one yaw, the whole straight
// move from s0 clear (exact) and the holders clear at the midpoint; with a swing in it, valid at the midpoint (as Turn's own steps are).
// 1: take it; 0: refused at its end; 2: the end is clear but the straight move to it would cut a corner
function benchTryG36(p,q,s0){if(!bench36Valid(q))return 0;const B=BENCH36,a=s0||p,m={x:(p.x+q.x)/2,z:(p.z+q.z)/2,yaw:(p.yaw+q.yaw)/2};
 if(a.yaw===q.yaw){B.cost.valid++;const hit=benchSweepHit36(a,q);if(hit){B.lastWhy={k:'box',box:hit};return 2;}return benchHoldersOK36(m)?1:0;}
 return bench36Valid(m)?1:0;}
// a refused slide ds from p: a sideways step (LAT/2, then LAT) away from what the leading end met, at the same yaw, or null
function benchAssistSlide36(p,ds,v0,s0){const B=BENCH36,G=B.GUIDE,A=B.assist,why=B.lastWhy,f=B.front?1:-1,ax=benchAxis36(p.yaw),n=[Math.sin(p.yaw),Math.cos(p.yaw)];
 const t=Math.sign(ds)*f,lead=why&&why.k==='holder'?benchEnd36(p,why.e):[p.x+ax[0]*t*B.HX,p.z+ax[1]*t*B.HX],c=benchContact36(why,lead[0],lead[1]);if(!c)return null;
 const lz=(c[0]-p.x)*n[0]+(c[1]-p.z)*n[1];if(Math.abs(lz)<1e-6)return null;                // head on: nothing to slide along
 const s=-Math.sign(lz),base=benchPropose36(p,ds,0),sg=Math.sign(ds);
 if(A.sd&&A.sd!==sg&&(A.lat||A.sw)){A.lat=0;A.sw=0;}   // (round 2b) a push the other way is a new contact: the allowance is back
 for(const l of [G.LAT/2,G.LAT]){if(G.BUDGET-(B.cost.valid-v0)<7)break;if(A.lat+l>G.CAPL+1e-9)continue;
  const q={x:base.x+s*l*n[0],z:base.z+s*l*n[1],yaw:p.yaw},r=benchTryG36(p,q,s0);if(r===1){A.lat+=l;A.n++;A.free=0;A.sd=sg;return q;}
  // the end is clear but the straight move would cut a corner: the sideways step alone now, the slide on the next sub-step
  if(r===2&&G.BUDGET-(B.cost.valid-v0)>=7){const q2={x:p.x+s*l*n[0],z:p.z+s*l*n[1],yaw:p.yaw};if(benchTryG36(p,q2,p)===1){A.lat+=l;A.n++;A.free=0;A.sd=sg;return q2;}}}
 return null;}
// a refused swing dw from p: the swing with a small step of the centre away from what the swinging end met, or null
function benchAssistSwing36(p,dw,v0){const B=BENCH36,G=B.GUIDE,A=B.assist,why=B.lastWhy,ax=benchAxis36(p.yaw),n=[Math.sin(p.yaw),Math.cos(p.yaw)];
 const q0=benchPropose36(p,0,dw);let best=null;
 for(const e of [0,1]){const end=why&&why.k==='holder'?benchEnd36(q0,why.e):benchEnd36(q0,e,B.HX),c=benchContact36(why,end[0],end[1]);if(!c)continue;const d=Math.hypot(end[0]-c[0],end[1]-c[1]);if(!best||d<best.d)best={d,end,c};}
 if(!best)return null;let dx=best.end[0]-best.c[0],dz=best.end[1]-best.c[1],dl=Math.hypot(dx,dz);
 if(dl<1e-6){dx=q0.x-best.end[0];dz=q0.z-best.end[1];dl=Math.hypot(dx,dz)||1;}dx/=dl;dz/=dl;          // inside the box: back towards the centre
 const pn=dx*n[0]+dz*n[1],pa=dx*ax[0]+dz*ax[1],cands=[[dx,dz,G.LAT/2],[dx,dz,G.LAT],[n[0]*Math.sign(pn),n[1]*Math.sign(pn),G.LAT],[ax[0]*Math.sign(pa),ax[1]*Math.sign(pa),G.LAT]];
 for(const [ux,uz,l] of cands){if(G.BUDGET-(B.cost.valid-v0)<7)break;if(!(Math.abs(ux)+Math.abs(uz)>0))continue;if(A.lat+l>G.CAPL+1e-9||A.sw+l>G.CAPS+1e-9)continue;
  const q={x:q0.x+ux*l,z:q0.z+uz*l,yaw:q0.yaw};if(benchTryG36(p,q)===1){A.lat+=l;A.sw+=l;A.n++;A.free=0;return q;}}
 return null;}
// the funnel: a bench pushed through an opening's region, already within FUNA of its axis, is drawn towards the centre line (never turned)
function benchFunnel36(p,dsAbs,v0,s0){const B=BENCH36,G=B.GUIDE;if(!G.FUN||!(dsAbs>0))return null;const chk=B.openChk||benchOpenCheck36();
 for(let k=0;k<G.OPEN.length;k++){const O=G.OPEN[k],M=chk.list[k],[x1,x2,z1,z2]=O.r;if(p.x<x1||p.x>x2||p.z<z1||p.z>z2)continue;if(!M||!M.ok)return null;
  let d=benchWrapA36(O.yaw-p.yaw);if(d>Math.PI/2)d-=Math.PI;if(d<-Math.PI/2)d+=Math.PI;if(Math.abs(d)>G.FUNA)return null;
  const off=O.ax==='z'?M.c-p.x:M.c-p.z,dl=Math.sign(off)*Math.min(Math.abs(off),G.FUNL*dsAbs);
  if(Math.abs(dl)<1e-5)return null;if(G.BUDGET-(B.cost.valid-v0)<2)return null;
  const q=O.ax==='z'?{x:p.x+dl,z:p.z,yaw:p.yaw}:{x:p.x,z:p.z+dl,yaw:p.yaw};return benchTryG36(p,q,s0)===1?q:null;}
 return null;}
// Turn aid 2: three refused swings within 4 s put the "try the other way" lines in both prompts for 4 s (or until it turns 3 degrees)
function benchTurnRefused36(){const B=BENCH36;B.wRef=(B.wRef||[]).filter(t=>B.t-t<4);B.wRef.push(B.t);if(B.wRef.length>=3){B.wRef=[];B.turnAid={t:B.t,acc:0};benchHUD36();}}
function benchTurnAidOn36(){const B=BENCH36;return !!(B.turnAid&&B.t-B.turnAid.t<4);}
function benchCarryStep36(dt){const B=BENCH36,G=B.GUIDE,m=B.mover,t=1-m,a0=benchAxis36(B.pose.yaw),f=B.front?1:-1,a=[a0[0]*f,a0[1]*f],e=[Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f];
 // e: the direction the turner's (rear) end moves as yaw grows
 if(!B.assist)benchAssistReset36();
 const um=B.raw[m]||[0,0],ut=B.raw[t]||[0,0],Lm=benchLatch36(0,um,a,dt),Lt=benchLatch36(1,ut,e,dt);
 if(B.wall.s&&(!Lm||Lm.sign!==B.wall.s)&&(B.relT[0]>=0.15||(Lm&&Lm.sign!==B.wall.s)))B.wall.s=0;
 if(B.wall.w&&(!Lt||Lt.sign!==B.wall.w)&&(B.relT[1]>=0.15||(Lt&&Lt.sign!==B.wall.w)))B.wall.w=0;
 const moving=!!(Lm||Lt||B.vel.s||B.vel.w);let cap=1;
 if(moving){benchBroad36();cap=bench36Valid(B.pose,0.20)?1:bench36Valid(B.pose,0.10)?0.7:0.4;}
 let sT=Lm?Lm.sign*Math.min(1,Math.hypot(um[0],um[1]))*B.V*cap:0,wT=Lt?Lt.sign*Math.min(1,Math.hypot(ut[0],ut[1]))*B.WMAX*cap:0;
 if(B.wall.s&&Math.sign(sT)===B.wall.s)sT=0;if(B.wall.w&&Math.sign(wT)===B.wall.w)wT=0;
 B.vel.s=benchApproach36(B.vel.s,sT,B.V/B.RAMP,B.V/B.STOP,dt);B.vel.w=benchApproach36(B.vel.w,wT,B.WMAX/B.RAMP,B.WMAX/B.STOP,dt);
 const before=bench36Pose();let wUsed=false,wSum=0;   // wSum: the heading the Turn player's swing gave this frame, exactly
 if(B.vel.s||B.vel.w){const n=Math.max(1,Math.ceil(Math.max(Math.abs(B.vel.s)*dt/0.04,Math.abs(B.vel.w)*dt/(3*D2R36))));const h=dt/n;
  for(let k=0;k<n;k++){B.cost.substeps++;const v0=B.cost.valid,s0=B.pose,ds=B.vel.s*h,dw=B.vel.w*h;if(!ds&&!dw)break;let q=null,usedS=false,usedW=false,helped=false;
   if(ds&&dw){q=benchOK36(B.pose,ds,dw);if(q){usedS=usedW=true;wSum+=dw;}}
   let whyS=null,whyW=null;
   if(!q&&ds){B.lastWhy=null;q=benchOK36(B.pose,ds,0);if(q)usedS=true;else whyS=B.lastWhy;}
   if(!q&&dw){B.lastWhy=null;q=benchOK36(B.pose,0,dw);if(q){usedW=true;wSum+=dw;}else whyW=B.lastWhy;}
   if(q){const dx=q.x-B.pose.x,dz=q.z-B.pose.z;B.wallAcc.w+=Math.hypot(dx,dz);B.wallAcc.s+=Math.abs(q.yaw-B.pose.yaw);B.pose=q;}
   // the walls guide: a refused component gets the smallest sideways correction that frees it (within this contact's allowance)
   if(G.on&&ds&&!usedS){if(usedW||!whyS){B.lastWhy=null;bench36Valid(benchPropose36(B.pose,ds,0));}else B.lastWhy=whyS;const g=benchAssistSlide36(B.pose,ds,v0,s0);
    if(g){B.wallAcc.w+=Math.hypot(g.x-B.pose.x,g.z-B.pose.z);B.pose=g;usedS=true;helped=true;}}
   if(G.on&&G.SWING&&dw&&!usedW){if(helped||!whyW){B.lastWhy=null;bench36Valid(benchPropose36(B.pose,0,dw));}else B.lastWhy=whyW;const g=benchAssistSwing36(B.pose,dw,v0);
    if(g){B.wallAcc.w+=Math.hypot(g.x-B.pose.x,g.z-B.pose.z);B.wallAcc.s+=Math.abs(g.yaw-B.pose.yaw);B.pose=g;usedW=true;helped=true;wSum+=dw;}}
   if(helped)B.cost.assist++;
   // gentle stop: a component nothing frees is bisected to contact, stopped and latched against that wall
   // (one bisection a sub-step, five endpoint tests: the per-sub-step budget of 24 blocked() calls and 12 box tests)
   let bis=false;
   if(ds&&!usedS){bis=true;let lo=0,hi=1;for(let it=0;it<5;it++){const mid=(lo+hi)/2;if(bench36Valid(benchPropose36(B.pose,ds*mid,0)))lo=mid;else hi=mid;}if(lo>0)B.pose=benchPropose36(B.pose,ds*lo,0);
    B.vel.s=0;B.wall.s=Math.sign(ds);B.wallAcc.s=0;const end=benchEnd36(B.pose,ds*f>0?1:0,B.HX);benchBumpCue36(a[0]*Math.sign(ds),a[1]*Math.sign(ds),end[0],end[1],B.lastWhy);}
   if(dw&&!usedW){const fresh=B.wall.w!==Math.sign(dw);if(!bis){let lo=0,hi=1;for(let it=0;it<5;it++){const mid=(lo+hi)/2;if(bench36Valid(benchPropose36(B.pose,0,dw*mid)))lo=mid;else hi=mid;}if(lo>0){B.pose=benchPropose36(B.pose,0,dw*lo);wUsed=true;wSum+=dw*lo;}}
    B.vel.w=0;B.wall.w=Math.sign(dw);B.wallAcc.w=0;const re=benchEnd36(B.pose,B.front?0:1,B.HX);benchBumpCue36(e[0]*Math.sign(dw),e[1]*Math.sign(dw),re[0],re[1],B.lastWhy);if(fresh)benchTurnRefused36();}
   if(usedW)wUsed=true;
   // the funnel, while the bench is pushed along its length through an opening
   if(G.on&&usedS){const fq=benchFunnel36(B.pose,Math.abs(ds),v0,s0);if(fq){B.pose=fq;B.cost.funnel++;}}
   // the allowance refills after unassisted travel along the bench
   if(G.on&&!helped&&usedS){const A=B.assist;A.free+=Math.abs(ds);if(A.free>=G.FREE&&(A.lat||A.sw)){A.lat=0;A.sw=0;}}
   if(!B.vel.s&&!B.vel.w)break;}}
 // only Turn turns: the heading changed by exactly what the Turn player's swing gave this frame (round 3, M2: also in a frame with a swing)
 if(Math.abs((B.pose.yaw-before.yaw)-wSum)>1e-12||(!wUsed&&B.pose.yaw!==before.yaw))B.yawLeak++;
 if(B.wall.s&&B.wallAcc.s>=2*D2R36)B.wall.s=0;if(B.wall.w&&B.wallAcc.w>=0.02)B.wall.w=0;
 const moved=Math.hypot(B.pose.x-before.x,B.pose.z-before.z),turned=Math.abs(B.pose.yaw-before.yaw);B.movedPrev=moved>0.0005||turned>0.05*D2R36;
 if(B.turnAid){if(wUsed)B.turnAid.acc+=turned;if(B.turnAid.acc>=3*D2R36||!benchTurnAidOn36()){B.turnAid=null;benchHUD36();}}
 // stuck: accepted input that a wall then refused, held
 const pushW=(B.wall.s&&Lm&&Lm.sign===B.wall.s)||(B.wall.w&&Lt&&Lt.sign===B.wall.w);
 // (round 3, RP-3) Turn aid 2 also comes for a swing held against the wall for 1.5 s, not only for three fresh refusals
 if(B.wall.w&&Lt&&Lt.sign===B.wall.w){B.wHeld36=(B.wHeld36||0)+dt;if(B.wHeld36>=1.5){B.wHeld36=0;B.wRef=[];B.turnAid={t:B.t,acc:0};benchHUD36();}}else B.wHeld36=0;
 if(pushW)B.stuckT+=dt;else B.stuckT=Math.max(0,B.stuckT-dt/2);
 if(B.stuckT>=2.5&&!B.stuck){B.stuck=true;B.stuckAcc=0;benchHUD36();}
 if(B.stuck){B.stuckAcc+=moved+turned*(1/(30*D2R36));if(B.stuckAcc>=1){B.stuck=false;B.stuckT=0;benchHUD36();}}
 if(B.stuck)benchDownCheck36();else B.downChk=null;
 benchHolders36();}
// round 3 (RP-2): while it is stuck, would a set-down here be accepted? (the dry run of the set-down, when the stall starts and then at most once a
// second while the pose changes). When it would not, the stuck line no longer suggests setting it down; and once a set-down here has been refused,
// the holders' Act puts the bench back (to the furthest place both can lift it from) until the bench moves on.
function benchDownCheck36(){const B=BENCH36,p=B.pose,key=Math.round(p.x*100)+','+Math.round(p.z*100)+','+Math.round(p.yaw/D2R36*2)+'|'+(B.grid?B.grid.sig:'');const c=B.downChk;
 if(c&&(c.key===key||B.t-c.t<1))return c;const r=benchDownPlan36(bench36Pose());B.downChk={key,t:B.t,ok:r.kind!=='no'};benchHUD36();return B.downChk;}
function benchPoseKey36(p){return Math.round(p.x*50)+','+Math.round(p.z*50)+','+Math.round(p.yaw/D2R36);}
function benchPutBack36(){const B=BENCH36,r=B.refused36;return B.state==='carrying'&&B.stuck&&!B.glide&&!!B.downChk&&!B.downChk.ok&&!!r&&r.key===benchPoseKey36(B.pose)&&B.t-r.t<8;}
function benchHolders36(){const B=BENCH36;for(const e of [0,1]){const i=B.holder[e];if(i===null)continue;const p=players[i];if(!p)continue;const [x,z]=benchEnd36(B.pose,e);
 if(B.snap&&B.snap.i===i&&B.snap.t<0.15)continue;p.g.position.x=x;p.g.position.z=z;p.prev=[x,z];p.g.rotation.y=Math.atan2(B.pose.x-x,B.pose.z-z);}}

/* ---------- the per-frame step (from the updateBall wrapper; skipped while a panel is open) ---------- */
function bench36Step(dt){const B=BENCH36,s=B.state;if(s!=='ready'&&s!=='carrying'&&s!=='choosing'&&s!=='settling'&&s!=='seated'&&s!=='grounded')return;
 if(!S||!S.p||!players.length)return;B.frame++;B.frameNodes0=B.cost.nodes;dt=Math.max(0,Math.min(+dt||0,0.05));B.t+=dt;
 if(S.phase!=='play'){if(s==='seated')bench36StandUp();else if(s==='carrying')benchSafeDown36(null,'system');return;}
 if(s==='seated'){if(B.seatLocal&&!benchLocal36()){bench36StandUp();return;}benchSeatedStep36(dt);return;}   // a pair that sat down together on one device stands up when the household goes online
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
   if(m>0.2&&(u[0]*tx+u[1]*tz)/(m*tl)<-0.3){B.letGoT+=dt;if(B.letGoT>=0.4){B.letGoT=0;benchLetGo36(i);}}else B.letGoT=0;
   if(B.state==='ready')benchPinStep36(dt);}}
 else if(s==='grounded'){if(B.t-B.liftCheckT>=1.0)benchCheckStuck36();}
 else if(s==='choosing')benchChooseStep36(dt);
 else if(s==='settling')benchSettleStep36(dt);
 benchDrawMesh36();}
function benchZoneNow36(){const B=BENCH36,p0=benchPos36(B.holder[0]),p1=benchPos36(B.holder[1]);if(!(B.pose.x>-4.6&&B.pose.x<-3.6)||!benchZoneYaw36(B.pose.yaw))return false;return (p0[1]>5.9&&p1[1]<5.55)||(p1[1]>5.9&&p0[1]<5.55);}
function benchLetGo36(i){const B=BENCH36;const pos=benchNudged36(B.pose);if(!pos||!bench36Liftable(B.pose,pos)){benchToast36(`Not here, it would box ${benchTrapName36(B.pose,pos||[benchPos36(0),benchPos36(1)])} in. Move a little first.`);return false;}
 B.snap=null;benchPlace36(i,pos[i][0],pos[i][1]);B.holder=[null,null];benchUnstick36();benchSetState36('grounded');return true;}
// 2.1: reaching the delivery zone sets the bench down in the doorway and opens the chooser
function benchAutoDown36(){const B=BENCH36;B.snap=null;const q=benchNudged36(B.pose);if(q)for(const i of [0,1])if(benchHolderOf36(i)>=0)benchPlace36(i,q[i][0],q[i][1],[B.pose.x,B.pose.z]);const pos=[benchPos36(0),benchPos36(1)];B.holder=[null,null];benchResetMotion36();B.liftDir=-1;benchDeliver36(pos);}
function bench36Deliver(){if(BENCH36.state!=='carrying'&&BENCH36.state!=='grounded')return false;benchAutoDown36();return true;}
function benchDeliver36(pos){const B=BENCH36;B.delivered=true;B.holder=[null,null];B.jobs={};B.fields={};const L=benchSave36();B.choice=L&&L.again&&benchKey36(L.choice)||'out';B.agree=[false,false];
 benchSetState36('choosing');B.okCache=null;benchChooserOpen36();}
function benchProgress36(){const B=BENCH36;for(let k=B.CHECK.length-1;k>B.progress-1&&k>=0;k--){const c=B.CHECK[k];if(Math.hypot(B.pose.x-c.x,B.pose.z-c.z)<=1.0){B.progress=Math.max(B.progress,k);break;}}}
function benchCornerFor36(){const B=BENCH36;let best=0,bd=1e9;for(let k=0;k<B.ROUTE.length;k++){const w=B.ROUTE[k],d=Math.hypot(B.pose.x-w.x,B.pose.z-w.z);if(d<bd){bd=d;best=k;}}
 return Math.min(B.ROUTE.length-1,bd<0.8?best+1:best);}
function benchCorner36(){const B=BENCH36,W=B.ROUTE[B.corner];if(W&&Math.hypot(B.pose.x-W.x,B.pose.z-W.z)<0.8&&B.corner<B.ROUTE.length-1){B.corner++;return;}
 if(B.corner>0){const P=B.ROUTE[B.corner-1],back=B.corner>1?B.ROUTE[B.corner-2]:B.START;if(Math.hypot(B.pose.x-P.x,B.pose.z-P.z)>3&&Math.hypot(B.pose.x-back.x,B.pose.z-back.z)<Math.hypot(B.pose.x-W.x,B.pose.z-W.z))B.corner--;}}

/* ---------- 4.3 Reset ---------- */
function benchSpawnSpot36(){const B=BENCH36;for(const c of [B.START].concat(B.START_ALT)){const p={x:c.x,z:c.z,yaw:c.yaw*D2R36},box=benchBox36(p,0);
 if(bench36Valid(p)&&!players.some(q=>bench36CircleOBB(q.g.position.x,q.g.position.z,PR,box)))return p;}return {x:B.START.x,z:B.START.z,yaw:0};}
function bench36Reset(){const B=BENCH36;if(!benchOpen36()||B.state==='choosing'||B.state==='settling')return false;benchStats36().resets++;
 const from=bench36Pose(),pos=[benchPos36(0),benchPos36(1)];B.holder=[null,null];B.snap=null;benchResetMotion36();B.glide=null;benchCrateCheck36();
 let dest=null;for(let k=B.progress;k>=0;k--){const c=B.CHECK[k],p={x:c.x,z:c.z,yaw:c.yaw*D2R36};if(Math.abs(p.x-from.x)<1e-6&&Math.abs(p.z-from.z)<1e-6)continue;
  if(!bench36Valid(p))continue;const box=benchBox36(p,0),np=pos.map(q=>bench36CircleOBB(q[0],q[1],PR,box)?benchRing36(q[0],q[1],box):q);if(np.some(q=>!q))continue;if(bench36Liftable(p,np)){dest=p;np.forEach((q,i)=>{if(q!==pos[i])benchPlace36(i,q[0],q[1]);});break;}}
 if(!dest){dest=benchSpawnSpot36();B.GATE_SPOTS.forEach(([x,z],i)=>{const s=benchRing36(x,z,benchBox36(dest,0))||[x,z];benchPlace36(i,s[0],s[1]);});}
 B.pose=dest;B.y=0;B.liftT=0;B.liftDir=0;benchUnstick36();B.corner=benchCornerFor36();benchSetState36('grounded');benchMotes36(dest.x,dest.z);benchDrawMesh36();benchToast36('The bench is back where you can both reach it.');return true;}
// Menu "Put it down in the room for now": the room checkpoint if it is liftable with the players where they are, otherwise the gate
function bench36RoomDown(){const B=BENCH36;if(B.state!=='choosing')return false;benchHideGhost36();benchChooserClose36();
 const p={x:B.ROOM.x,z:B.ROOM.z,yaw:B.ROOM.yaw*D2R36},box=benchBox36(p,0);for(const i of [0,1]){const q=benchPos36(i);if(bench36CircleOBB(q[0],q[1],PR,box)){const s=benchRing36(q[0],q[1],box,(x,z)=>z>5.6);if(s)benchPlace36(i,s[0],s[1]);}}
 const pos=[benchPos36(0),benchPos36(1)];let dest=p;if(!bench36Valid(p)||!bench36Liftable(p,pos)){dest=benchSpawnSpot36();B.GATE_SPOTS.forEach(([x,z],i)=>{const s=benchRing36(x,z,benchBox36(dest,0))||[x,z];benchPlace36(i,s[0],s[1]);});}
 B.pose=dest;B.delivered=false;B.agree=[false,false];benchSetState36('grounded');benchMotes36(dest.x,dest.z);benchDrawMesh36();return true;}

/* ---------- 2.4-2.6 Modes: pause and resume ---------- */
function benchPause36(){const B=BENCH36;B.snap=null;if(B.state==='carrying'){B.pose=bench36Pose();B.holder=[null,null];benchResetMotion36();B.y=0;B.liftT=0;benchSetState36('grounded');}
 if(B.state==='choosing'||B.state==='settling'){benchChooserClose36();benchHideGhost36();}
 const L=benchSave36();if(typeof NET!=='undefined'&&NET.on&&L&&L.again){bench36Cancel();return;}
 B.paused=true;benchDrawMesh36();benchArrows36(null);benchHUD36();benchBusyClass36();}
// back to local play: as on a load, anyone standing where the absent bench lies is moved clear first, then the liftable rule decides
function benchResume36(){const B=BENCH36;B.paused=false;if(B.state==='grounded'){benchNudgeOut36(benchBox36(B.pose,0),B.pose);const pos=[benchPos36(0),benchPos36(1)];if(!bench36Valid(B.pose)||!bench36Liftable(B.pose,pos)){const d=benchSpawnSpot36();B.pose=d;B.GATE_SPOTS.forEach(([x,z],i)=>{const s=benchRing36(x,z,benchBox36(d,0))||[x,z];benchPlace36(i,s[0],s[1]);});}}
 if(B.state==='choosing')benchChooserOpen36();benchDrawMesh36();benchHUD36();benchBusyClass36();}
BENCH36.onPadGone=function(e){const B=BENCH36,k=e&&e.gamepad?e.gamepad.index:-1;if(B.state==='carrying'&&(B.holder[0]===k||B.holder[1]===k))benchSafeDown36(null,'system');};
if(typeof window!=='undefined'&&window.addEventListener)window.addEventListener('gamepaddisconnected',e=>BENCH36.onPadGone(e));

/* ---------- start, again, cancel ---------- */
function benchAvailable36(){return benchLocal36()&&S&&S.sofa&&S.sofa.state==='placed'&&(S.day>=2||!!BENCH36.flags);}
function bench36Start(){if(!S||!S.p)return false;if(!benchLocal36()){benchToast36('Carry Ada’s bench when you are both on one device.');return false;}
 if(S.sofa.state!=='placed'){benchToast36('Bring the sofa in first.');return false;}
 const L=benchSave36();if(L&&L.state==='placed')return bench36Again();if(benchOpen36())return false;
 const pf=benchPreflight36();if(pf){benchToast36(benchPreflightText36(pf));return false;}
 BENCH36.notePending=true;
 openPanel(`<h2>A note from Ada</h2><p class="bench36-note">Neighbours, the bench is at your gate. One of you in front to walk it, one behind to turn it. Mind my corners.</p><p class="bench36-note small">— Ada</p><div class="actions">${btn('Off we go','close',{},'primary block')}</div>`);
 return true;}
function benchSpawn36(again){const B=BENCH36;B.notePending=false;let L=benchSave36();life34();
 if(!L)L=S.life.bench36={v:1,state:'grounded',pos:[B.START.x,B.START.z],yaw:0,mover:0,choice:'out',deliveries:0,again:false,hints:0,placedDay:null,playtest:false,runs:[]};
 if(B.flags&&B.flags.value==='playtest'&&!B.flags.usedPlaytest){B.flags.usedPlaytest=true;L.playtest=true;}
 // playtest: the next run gives each player the job the other started the last one with (whoever ended up walking it)
 if(again){L.keep36={mover:L.mover||0};if(L.firstMover!==undefined)L.keep36.first=L.firstMover;   // 11.4: what a cancel puts back
  L.again=true;if(L.playtest)L.mover=1-(L.firstMover!==undefined?L.firstMover:L.lastMover!==undefined?L.lastMover:(L.mover||0));}
 delete L.firstMover;
 B.mover=L.mover||0;B.choice=benchKey36(L.choice)||'out';B.stats={dur:0,bumps:0,setdowns:0,swaps:0,resets:0,lifted:false};B.progress=0;B.delivered=false;B.paused=false;
 B.holder=[null,null];benchResetMotion36();B.stuck=false;B.stuckT=0;B.y=0;B.liftT=0;B.liftDir=0;B.glide=null;B.settle=null;
 benchCrateCheck36();B.pose=benchSpawnSpot36();benchGridBuild36();benchBuildMesh36();B.corner=benchCornerFor36();benchSetState36('grounded');
 if(again)rebuildFurniture();benchCheckStuck36();benchPlanArrays36();save();benchToast36('Grab an end each.');return true;}   // 11.6 the glide planner's arrays are made here, not in the chooser
function bench36Again(){const B=BENCH36,L=benchSave36();if(!L||L.state!=='placed'||!benchItem36()||!benchLocal36()||B.state==='seated'&&!bench36StandUp())return false;
 if(S.sofa.state!=='placed')return false;const pf=benchPreflight36();if(pf){benchToast36(benchPreflightText36(pf));return false;}
 if(benchOpen36())return false;return benchSpawn36(true);}
// Menu "Leave the bench for now" (a first delivery): the bench goes back to Ada, the saved progress stays and the Menu offers it again
function bench36Leave(){const B=BENCH36,L=benchSave36();if(!L||L.again||!benchOpen36()||B.state==='settling')return false;
 benchDropMesh36();benchChooserClose36();benchArrows36(null);B.holder=[null,null];B.snap=null;benchResetMotion36();B.glide=null;B.settle=null;B.paused=false;B.delivered=false;benchUnstick36();
 L.state='off';delete L.pick;benchSetState36('off');benchBusyClass36();save();benchToast36('Ada will keep the bench until you are ready. Fetch it from the Menu.');if(L.duo)benchSolo36();return true;}
function bench36Cancel(){const B=BENCH36,L=benchSave36();if(!L||!L.again)return false;L.again=false;L.state='placed';benchUnkeep36(L);const it=benchItem36();if(it)L.choice=it.pose36;delete L.pick;benchDropMesh36();benchChooserClose36();benchArrows36(null);
 B.holder=[null,null];benchResetMotion36();B.paused=false;benchSetState36('placed');rebuildFurniture();save();if(L.duo)benchSolo36();return true;}

/* ---------- 6.1 The three arrangements ---------- */
function benchArrBox36(key){return benchBox36(benchPoseOf36(key),0);}
function bench36ArrangementOK(key,opts){opts=opts||{};const P=BENCH36.POSES[key];if(!P)return false;BENCH36.cost.arr++;const pose=benchPoseOf36(key),box=benchBox36(pose,0),it=benchItem36();
 BENCH36.override=box;
 try{
  if(bench36ObbHit(pose,0,{}))return false;
  if(typeof fitsEditor34==='function'&&!opts.noPlayers&&!fitsEditor34('bench',0,FLAT.rows,0,it?it.id:undefined))return false;
  if(typeof fitsEditor34==='function'&&opts.noPlayers&&!fitsHome34('bench',0,FLAT.rows,0,it?it.id:undefined))return false;
  if(typeof TUNE35!=='undefined'&&TUNE35.reach){const s=cellToWorld(4,3);if(blocked(s[0],s[1]+0.05,PR,{noCrate:true,noSofa:true}))return false;
   const n0=TUNE35.reachRuns,miss=benchReachFast36(()=>TUNE35.reach(S.home.items.filter(x=>x.type!=='bench')));if(miss.length||TUNE35.reachRuns!==n0+1)return false;}
  if(!opts.noPlayers&&players.some(p=>bench36CircleOBB(p.g.position.x,p.g.position.z,PR,box)))return false;
  for(const sx of [-0.36,0.36])for(const [lx,lz] of [[sx,0.03],[sx-0.1,0.38],[sx+0.1,0.38]]){const c=Math.cos(pose.yaw),s=Math.sin(pose.yaw),wz=pose.z-lx*s+lz*c;if(!(wz<6.95))return false;}
  const w=benchGridWith36(box),st=cellToWorld(4,3);if(!benchSitReach36(w,[st[0],st[1]+0.05],pose))return false;
  return true;}finally{BENCH36.override=null;}}
// a free, reachable cell within 1.0 m of the bench's front edge
function benchSitReach36(w,from,pose){const c=Math.cos(pose.yaw),s=Math.sin(pose.yaw),pts=[];
 for(let k=0;k<=10;k++){const lx=-0.75+0.15*k,lz=0.25;pts.push([pose.x+lx*c+lz*s,pose.z-lx*s+lz*c]);}
 const G=BENCH_GRID36;let hit=false;benchBFS36(w,from[0],from[1],(i,j)=>{const x=G.x0+i*G.s,z=G.z0+j*G.s;for(const q of pts){const dx=x-q[0],dz=z-q[1];if(dx*dx+dz*dz<=1.0){hit=true;break;}}return hit;});return hit;}
// the distance to the nearest point of the bench (players only reach it from its east end: the strip in front is narrower than a player)
function benchBoxDist36(pose,x,z){const c=Math.cos(pose.yaw),s=Math.sin(pose.yaw),dx=x-pose.x,dz=z-pose.z,lx=dx*c-dz*s,lz=dx*s+dz*c,qx=Math.max(-BENCH36.HX,Math.min(BENCH36.HX,lx)),qz=Math.max(-BENCH36.HZ,Math.min(BENCH36.HZ,lz));return Math.hypot(lx-qx,lz-qz);}
function benchFrontDist36(pose,x,z){const c=Math.cos(pose.yaw),s=Math.sin(pose.yaw),dx=x-pose.x,dz=z-pose.z,lx=dx*c-dz*s,lz=dx*s+dz*c;const qx=Math.max(-0.75,Math.min(0.75,lx));return Math.hypot(lx-qx,lz-0.25);}

/* ---------- 6.3 The chooser, the ghost, both agree, the glide ---------- */
// the arrangement checks run one a frame: the selected one when the chooser opens or the selection changes, the others in the frames after
function benchChooserOpen36(){const B=BENCH36;B.okCache={};B.okSig=benchGridSig36();B.autoPick=true;B.arrFrame=B.frame;B.heavy=B.frame;benchShowGhost36();benchChooserRender36();benchHUD36();}   // 11.6 the selected arrangement is checked in the next frame, not with the delivery
function benchArrNow36(k){const B=BENCH36;if(!B.okCache)B.okCache={};if(B.okCache[k]===undefined){B.okCache[k]=bench36ArrangementOK(k,{noPlayers:true});B.arrFrame=B.frame;B.heavy=B.frame;}return B.okCache[k];}
function benchArrAhead36(){const B=BENCH36;if(!B.okCache||B.arrFrame===B.frame||B.heavy===B.frame)return;const k=B.okCache[B.choice]===undefined?B.choice:B.ORDER.find(x=>B.okCache[x]===undefined);if(!k)return;benchArrNow36(k);
 // a first chooser whose default spot is not free moves to the first free one (until a player picks)
 if(B.autoPick&&!B.okCache[B.choice]){const f=B.ORDER.find(x=>B.okCache[x]);if(f){B.choice=f;B.agree=[false,false];benchShowGhost36();}}benchChooserRender36();benchHUD36();}
function benchShowGhost36(){const B=BENCH36;if(!B.mesh.ghost){const g=new THREE.Group();g.add(benchModel36(true));g.name='bench36-ghost';scene.add(g);B.mesh.ghost=g;}
 const p=benchPoseOf36(B.choice);B.mesh.ghost.position.set(p.x,0.05,p.z);B.mesh.ghost.rotation.y=p.yaw;B.mesh.ghost.visible=true;B.mesh.ghost.updateMatrixWorld(true);benchGhostLook36();}
function benchHideGhost36(){const g=BENCH36.mesh.ghost;if(g)g.visible=false;if(BENCH36.mesh.aux)BENCH36.mesh.aux.visible=false;}
function benchKeyHint36(i){const m=typeof lastInput!=='undefined'?lastInput[i]:'key';if(m==='pad')return 'stick · A';if(m==='touch')return 'stick · Act';return i?'← / → choose · ⏎ agree':'A / D choose · E agree';}
function benchStrip36(i){if(typeof document==='undefined')return null;const half=document.getElementById('half'+i);if(!half||!half.querySelector)return null;let el=half.querySelector('.bench36-pick');
 if(!el&&document.createElement){el=document.createElement('div');el.className='bench36-pick';if(el.addEventListener)el.addEventListener('pointerdown',benchStripTap36);const pr=document.getElementById('pr'+i);if(pr&&pr.parentNode===half&&half.insertBefore)half.insertBefore(el,pr);else half.appendChild(el);}return el;}
function benchChooserRender36(){const B=BENCH36;if(!benchKey36(B.choice))B.choice='out';const all=B.ORDER.every(k=>B.okCache&&B.okCache[k]===false);benchGhostLook36();
 for(const i of [0,1]){const el=benchStrip36(i);if(!el)continue;const P=B.POSES[B.choice],ok=!(B.okCache&&B.okCache[B.choice]===false);   // not yet checked (one frame) reads as free
  // tappable as well as keyed: the previous and next arrangement in each view, and each player's own "agrees" in their own view (44 px or more)
  const tb=(act,d,label,cls,aria)=>`<button type="button" tabindex="-1" class="b36 ${cls}" data-act="${act}"${Object.keys(d).map(k=>` data-${k}="${d[k]}"`).join('')}${aria}>${label}</button>`;
  const h=all?`<div class="t">Where should Ada’s bench go?</div><div class="d">The west end of the veranda isn’t free. Clear it, then bring the bench out again.</div>`:
   `<div class="t">Where should Ada’s bench go?</div><div class="row"><div class="sel${ok?'':' off'}">${tb('bench36Pick',{v:-1},'◀','ar36',' aria-label="Previous arrangement"')}<b class="nm36">${esc(P.name)}</b>${ok?'':' <span class="nf">(not free)</span>'}${tb('bench36Pick',{v:1},'▶','ar36',' aria-label="Next arrangement"')}</div><div class="d">${esc(P.desc)}</div>`+
   `<div class="ticks"><span class="${B.agree[0]?'on':''}">${esc(benchPlayerName36(0))} ${B.agree[0]?'✓':'…'}</span> <span class="${B.agree[1]?'on':''}">${esc(benchPlayerName36(1))} ${B.agree[1]?'✓':'…'}</span></div>`+
   tb('bench36Vote',{i},`${B.agree[i]?'✓ ':''}${esc(benchPlayerName36(i))} agrees`,'ag36 p'+i+(B.agree[i]?' on':''),` aria-pressed="${B.agree[i]?'true':'false'}"`)+`<div class="k">${esc(benchKeyHint36(i))}</div></div>`;
  if(el.innerHTML!==h)el.innerHTML=h;el.style.display='';}}
function benchChooserClose36(){if(typeof document==='undefined')return;for(const i of [0,1]){const half=document.getElementById('half'+i);const el=half&&half.querySelector?half.querySelector('.bench36-pick'):null;if(el&&el.parentNode)el.parentNode.removeChild(el);}}
function benchChooseStep36(dt){const B=BENCH36;let changed=false;
 for(const i of [0,1]){const r=B.raw[i]||[0,0],x=r[0]*v21Right.x+r[1]*v21Right.z,P=B.pick[i];
  if(Math.abs(x)>0.6){const sg=x>0?1:-1;if(P.x!==sg||P.t>=0.35){if(P.x===sg)P.t=0;else P.t=0;P.x=sg;const k=B.ORDER.indexOf(B.choice);B.choice=B.ORDER[(k+sg+B.ORDER.length)%B.ORDER.length];changed=true;}else P.t+=dt;}
  else{P.x=0;P.t=0;}}
 if(changed){B.agree=[false,false];B.autoPick=false;benchArrNow36(B.choice);benchShowGhost36();benchChooserRender36();benchHUD36();}
 else benchArrAhead36();
 benchPlanAhead36();}
function benchAgree36(i){const B=BENCH36;if(B.state!=='choosing')return false;if(!benchArrNow36(B.choice)){benchToast36('That spot is not free.');return true;}
 B.agree[i]=!B.agree[i];benchChooserRender36();benchHUD36();if(B.agree[0]&&B.agree[1])benchCommit36();return true;}
// both agreed: nudge players out of the target, re-check, commit the item, then the bench glides there (planned while they chose; if no clear
// way exists at all, it dissolves)
function benchCommit36(){const B=BENCH36,key=B.choice,target=benchPoseOf36(key),tbox=benchBox36(target,0);
 let moved=false;for(const i of [0,1]){const q=benchPos36(i);if(bench36CircleOBB(q[0],q[1],PR,tbox)){const s=benchRing36(q[0],q[1],tbox);if(s){benchPlace36(i,s[0],s[1]);moved=true;}}}
 // the arrangement is checked again unless the chooser's own check still holds (nobody moved, nothing in the world changed since)
 if(moved||!B.okSig||B.okSig!==benchGridSig36()){B.okCache[key]=undefined;B.arrFrame=-1;}
 if(!benchArrNow36(key)){B.agree=[false,false];benchChooserRender36();benchToast36('That spot is not free now.');return false;}
 const from=bench36Pose(),job=benchJobFor36(key,from,[benchPos36(0),benchPos36(1)]);
 B.agree=[false,false];benchChooserClose36();benchHideGhost36();
 const L=benchSave36(),it0=benchItem36();
 if(it0){it0.pose36=key;it0.x=0;it0.y=FLAT.rows;it0.rot=0;}else S.home.items.push({id:'i'+(++S.home.seq),type:'bench',x:0,y:FLAT.rows,rot:0,pose36:key});
 L.choice=key;delete L.pick;L.state='placed';L.placedDay=S.day;L.again=false;delete L.keep36;L.lastMover=B.mover;L.mover=B.mover;if(B.delivered){L.deliveries=(L.deliveries||0)+1;}const wasDelivered=B.delivered;B.delivered=false;
 B.settle={kind:'plan',t:0,from,to:target,key,job,steps:null,si:0,step:null,done:false};B.settleFrames=0;benchSetState36('settling');
 rebuildFurniture();save();
 if(typeof LOG35!=='undefined'&&LOG35&&typeof LOG35.add==='function')LOG35.add('place','bench:veranda');
 let msg='Ada’s bench is home.';const st=benchStats36();
 if(L.playtest&&wasDelivered){const run={dur:Math.round(st.dur),bumps:st.bumps,setdowns:st.setdowns,swaps:st.swaps,resets:st.resets};L.runs=(L.runs||[]).concat([run]).slice(-10);
  const mm=Math.floor(run.dur/60),ss=String(run.dur%60).padStart(2,'0');msg+=` Delivery ${L.deliveries} · ${mm}:${ss} · ${run.bumps} bump${run.bumps===1?'':'s'} · ${run.resets} reset${run.resets===1?'':'s'}`;}
 benchToast36(msg);return true;}
function benchPathLen36(path){let L=0;for(let k=1;k<path.length;k++)L+=Math.hypot(path[k].x-path[k-1].x,path[k].z-path[k-1].z)+0.5*Math.abs(benchWrapA36(path[k].yaw-path[k-1].yaw));return L;}
function benchPathDur36(path){return Math.max(1.0,Math.min(4,benchPathLen36(path)/1.4));}
function benchPathAt36(path,u){let L=[0];for(let k=1;k<path.length;k++)L.push(L[k-1]+Math.hypot(path[k].x-path[k-1].x,path[k].z-path[k-1].z)+0.5*Math.abs(benchWrapA36(path[k].yaw-path[k-1].yaw)));
 const T=L[L.length-1]*u;let k=1;while(k<path.length-1&&L[k]<T)k++;const a=path[k-1],b=path[k],seg=(L[k]-L[k-1])||1,t=Math.max(0,Math.min(1,(T-L[k-1])/seg));
 return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:a.yaw+benchWrapA36(b.yaw-a.yaw)*t};}
function benchWalkAt36(w,u){let L=[0];for(let k=1;k<w.path.length;k++)L.push(L[k-1]+Math.hypot(w.path[k][0]-w.path[k-1][0],w.path[k][1]-w.path[k-1][1]));
 const T=L[L.length-1]*u;let k=1;while(k<w.path.length-1&&L[k]<T)k++;const a=w.path[k-1],b=w.path[k],seg=(L[k]-L[k-1])||1,t=Math.max(0,Math.min(1,(T-L[k-1])/seg));return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[0]-a[0],b[1]-a[1])];}
// the settle: wait for the plan (the bench lies still in the doorway), then each step in turn (a player walks aside, the bench glides), or the dissolve
function benchSettleStep36(dt){const B=BENCH36,s=B.settle;if(!s){benchSetState36('placed');return;}B.settleFrames=(B.settleFrames||0)+1;
 if(s.kind==='plan'){const r=benchJobStep36(s.job,benchBudget36());
  if(r==='done'){s.steps=s.job.result;s.si=0;s.step=null;s.kind='go';B.lastSettle='glide';B.lastLegs=s.steps.filter(x=>x.glide).length;}
  else if(r==='fail'){s.kind='dissolve';s.t=0;s.dur=0.6;B.lastSettle='dissolve';}
  if(s.kind==='plan'){B.y=0;return;}}
 if(s.kind==='go'){if(!s.step){const st=s.steps[s.si];if(!st){benchSettleDone36();return;}
   s.step=st.walk?{walk:st.walk,t:0,dur:Math.max(0.25,benchWalkLen36(st.walk.path)/2.2)}:{glide:st.glide,t:0,dur:benchPathDur36(st.glide)};}
  const c=s.step;c.t+=dt;const u=Math.min(1,c.t/c.dur);
  if(c.walk){s.walk=c.walk;const q=benchWalkAt36(c.walk,u),p=players[c.walk.i];benchPlace36(c.walk.i,q[0],q[1]);if(p)p.g.rotation.y=u<1?q[2]:Math.atan2(B.pose.x-q[0],B.pose.z-q[1]);}
  else{s.walk=null;let e=u<0.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
   // a frame never steps over a corner of the path: it stops on it, so the move from one frame to the next is always along one straight piece
   const V=c.knots||(c.knots=benchPathKnots36(c.glide)),e0=c.lastE||0;for(const v of V)if(v>e0+1e-9&&v<e-1e-9){e=v;break;}c.lastE=e;
   B.pose=benchPathAt36(c.glide,e);benchFade36(B.g,1);}
  B.y=0;if(c.walk?u>=1:c.lastE>=1-1e-12){s.walk=null;s.step=null;s.si++;if(s.si>=s.steps.length)benchSettleDone36();}return;}
 s.t+=dt;const u=Math.min(1,s.t/s.dur);
 const fade=u<0.5?1-u/0.5:(u-0.5)/0.5;B.pose=u<0.5?s.from:s.to;if(u>=0.5&&!s.puff){s.puff=true;benchMotes36(s.from.x,s.from.z);}benchFade36(B.g,Math.max(0.001,fade));
 B.y=0;if(u>=1)benchSettleDone36();}
function benchPathKnots36(path){const L=[0];for(let k=1;k<path.length;k++)L.push(L[k-1]+Math.hypot(path[k].x-path[k-1].x,path[k].z-path[k-1].z)+0.5*Math.abs(benchWrapA36(path[k].yaw-path[k-1].yaw)));
 const T=L[L.length-1]||1;return L.slice(1,-1).map(v=>v/T);}
function benchWalkLen36(p){let L=0;for(let k=1;k<p.length;k++)L+=Math.hypot(p[k][0]-p[k-1][0],p[k][1]-p[k-1][1]);return L;}
function benchSettleDone36(){const B=BENCH36,s=B.settle;s.done=true;benchDropMesh36();B.settle=null;B.pose=benchPoseOf36(s.key);benchSetState36('placed');rebuildFurniture();benchArrows36(null);
 B.freeAfter=bench36Free([benchPos36(0),benchPos36(1)],benchArrBox36(s.key));
 // the camera keeps the bench in view for a moment after it lands (the just-placed framing tune-v35 gives a piece)
 const it=benchItem36();if(it&&typeof TUNE35!=='undefined'&&typeof clock35==='function')TUNE35.frame={id:it.id,until:clock35()+3000};}

/* ---------- the settle plan: made while the pair chooses, a few thousand box tests a frame ---------- */
// The bench alone, from the doorway to the arrangement, is a picture (not a carry): weighted A* over (x, z, 5-degree yaw) on a fixed 5 cm
// lattice (a grid line on the 'out' slot), searched from the arrangement back to the doorway (the tight end first, about ten times fewer
// states) and guided by the bench centre's walking distance round the walls. The doorway turn leaves the box only
// millimetres, so nothing is sampled: each state knows its gap (the distance from the box to the nearest wall, the pot's stand or a player),
// and a straight piece of glide from a to b is clear when no point of the box moves further than the two end gaps together (split in half
// until it is). Every lattice step and every shortcut of the path passes that test, so every frame of the glide, and every moment between
// frames, keeps the box clear. The search arrays are made once and reused (only the states a search touched are cleared). The work is
// counted in box tests (one gap): the planner starts no new step once BUDGET of them are used in a frame, so a frame stays under FRAME; and
// in a frame with one of the heavier steps (an arrangement check, the guide, the list of attempts) it does nothing else.
const BENCH_PLAN36={X0:-8.1,Z0:3.22,S:0.05,NX:115,NZ:77,NT:72,EPS:1e-4,GCAP:0.25,RMAX:0.81,W:2.5,BUDGET:600,FRAME:900,CAP:12000,A:null,live:null,
 ASIDE:[[-3.15,6.45],[-3.3,6.62],[-3.62,6.66]],
 // the two legs: spots in the room for the room holder to step aside to, and for the row holder once in through the doorway
 ROOM:[[-2.95,4.55],[-5.35,4.45],[-2.95,5.15],[-5.4,5.15],[-5.9,4.4],[-2.9,3.9]]};
function benchBudget36(){return Math.max(0,BENCH_PLAN36.BUDGET-(BENCH36.cost.nodes-(BENCH36.frameNodes0||0)));}
function benchPlanArrays36(){const P=BENCH_PLAN36;if(!P.A){const N=P.NX*P.NZ*P.NT;P.A={cost:new Float32Array(N),prev:new Int32Array(N),gap:new Float32Array(N),flag:new Uint8Array(N),eflag:new Uint8Array(N),
 touched:new Int32Array(1<<16),nt:0,hf:new Float64Array(1<<14),hn:new Int32Array(1<<14),hl:0};}return P.A;}
function benchPlanBoxes36(){return benchPlanBuckets36(benchBoxes36(-5.25,5.1,3.5,{}).concat([{x1:BENCH36.POT[0],x2:BENCH36.POT[1],z1:BENCH36.POT[2],z2:BENCH36.POT[3]}]));}
// the boxes a planning search sees, bucketed by 0.5 m cells (each bucket holds the boxes within reach of a bench centred in it)
function benchPlanBuckets36(boxes){const P=BENCH_PLAN36,C=0.5,X0=-8.5,Z0=2.8,NX=14,NZ=10,R=BENCH36.HX+BENCH36.HZ+P.GCAP+C,cells=[];
 for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++){const cx=X0+(i+0.5)*C,cz=Z0+(j+0.5)*C;cells.push(boxes.filter(o=>cx+R>o.x1&&cx-R<o.x2&&cz+R>o.z1&&cz-R<o.z2));}
 return {C,X0,Z0,NX,NZ,cells,all:boxes};}
// the gap (m, at most GCAP) between the bench box at (x, z, yaw) and the boxes and player discs; 0 when they touch or overlap or the centre leaves
// the room and row
function benchPlanGap36(x,z,yaw,bk,discs){BENCH36.cost.nodes++;if(!(x>-8&&z<7))return 0;const P=BENCH_PLAN36,hx=BENCH36.HX,hz=BENCH36.HZ,ux=Math.cos(yaw),uz=-Math.sin(yaw),nx=Math.sin(yaw),nz=Math.cos(yaw),EPS=P.EPS;
 const ex=Math.abs(ux)*hx+Math.abs(nx)*hz,ez=Math.abs(uz)*hx+Math.abs(nz)*hz;let best=P.GCAP;
 const ax=ux*hx,az=uz*hx,bx=nx*hz,bz=nz*hz,c0x=x+ax+bx,c0z=z+az+bz,c1x=x+ax-bx,c1z=z+az-bz,c2x=x-ax+bx,c2z=z-az+bz,c3x=x-ax-bx,c3z=z-az-bz;
 let list=bk.all;if(bk.cells){const i=Math.floor((x-bk.X0)/bk.C),j=Math.floor((z-bk.Z0)/bk.C);if(i>=0&&j>=0&&i<bk.NX&&j<bk.NZ)list=bk.cells[i*bk.NZ+j];}
 for(let q=0;q<list.length;q++){const b=list[q],gx=Math.max(b.x1-(x+ex),(x-ex)-b.x2,0),gz=Math.max(b.z1-(z+ez),(z-ez)-b.z2,0);if(gx*gx+gz*gz>=best*best)continue;
  if(gx===0&&gz===0){const bhx=(b.x2-b.x1)/2,bhz=(b.z2-b.z1)/2,dx=(b.x1+b.x2)/2-x,dz=(b.z1+b.z2)/2-z;
   if(Math.abs(dx*ux+dz*uz)<hx+bhx*Math.abs(ux)+bhz*Math.abs(uz)&&Math.abs(dx*nx+dz*nz)<hz+bhx*Math.abs(nx)+bhz*Math.abs(nz))return 0;}
  let px,pz,d;
  px=Math.max(0,b.x1-c0x,c0x-b.x2);pz=Math.max(0,b.z1-c0z,c0z-b.z2);d=px*px+pz*pz;if(d<best*best)best=Math.sqrt(d);
  px=Math.max(0,b.x1-c1x,c1x-b.x2);pz=Math.max(0,b.z1-c1z,c1z-b.z2);d=px*px+pz*pz;if(d<best*best)best=Math.sqrt(d);
  px=Math.max(0,b.x1-c2x,c2x-b.x2);pz=Math.max(0,b.z1-c2z,c2z-b.z2);d=px*px+pz*pz;if(d<best*best)best=Math.sqrt(d);
  px=Math.max(0,b.x1-c3x,c3x-b.x2);pz=Math.max(0,b.z1-c3z,c3z-b.z2);d=px*px+pz*pz;if(d<best*best)best=Math.sqrt(d);
  for(let v=0;v<4;v++){const vx=(v&1?b.x2:b.x1)-x,vz=(v&2?b.z2:b.z1)-z,lx=Math.abs(vx*ux+vz*uz)-hx,lz=Math.abs(vx*nx+vz*nz)-hz,qx=lx>0?lx:0,qz=lz>0?lz:0;d=qx*qx+qz*qz;if(d<best*best)best=Math.sqrt(d);}
  if(best<=EPS)return 0;}
 for(let q=0;q<discs.length;q++){const dd=discs[q],vx=dd[0]-x,vz=dd[1]-z,lx=Math.abs(vx*ux+vz*uz)-hx,lz=Math.abs(vx*nx+vz*nz)-hz,qx=lx>0?lx:0,qz=lz>0?lz:0,g=Math.sqrt(qx*qx+qz*qz)-PR;if(g<best)best=g;if(best<=EPS)return 0;}
 return best;}
// a straight piece of glide (x, z and yaw linear) is clear: no point of the box moves further than the two end gaps together, or both halves are
function benchPlanSafe36(a,b,boxes,discs,ga,gb,depth){const P=BENCH_PLAN36;if(ga===undefined)ga=benchPlanGap36(a.x,a.z,a.yaw,boxes,discs);if(gb===undefined)gb=benchPlanGap36(b.x,b.z,b.yaw,boxes,discs);
 if(ga<=P.EPS||gb<=P.EPS)return false;const dy=benchWrapA36(b.yaw-a.yaw),D=Math.hypot(b.x-a.x,b.z-a.z)+P.RMAX*Math.abs(dy);if(D<ga+gb)return true;if((depth||0)>=16)return false;
 const m={x:(a.x+b.x)/2,z:(a.z+b.z)/2,yaw:a.yaw+dy/2},gm=benchPlanGap36(m.x,m.z,m.yaw,boxes,discs);
 return benchPlanSafe36(a,m,boxes,discs,ga,gm,(depth||0)+1)&&benchPlanSafe36(m,{x:b.x,z:b.z,yaw:a.yaw+dy},boxes,discs,gm,gb,(depth||0)+1);}
// the bench centre's distance round the walls to the target, on a 10 cm grid (cells whose 0.26 m disc is clear): the A* guide, made once per
// target in each chooser
function benchPlanField36(to,boxes){const P=BENCH_PLAN36,FS=2,C=P.S*FS,NX=Math.ceil(P.NX/FS),NZ=Math.ceil(P.NZ/FS),f=new Float32Array(NX*NZ).fill(Infinity),free=new Uint8Array(NX*NZ),r2=BENCH36.HZ*BENCH36.HZ;
 for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++){const x=P.X0+i*C,z=P.Z0+j*C;if(!(x>-8&&z<7))continue;let ok=true;const bi=Math.floor((x-boxes.X0)/boxes.C),bj=Math.floor((z-boxes.Z0)/boxes.C),near=bi>=0&&bj>=0&&bi<boxes.NX&&bj<boxes.NZ?boxes.cells[bi*boxes.NZ+bj]:boxes.all;
  for(let q=0;q<near.length;q++){const b=near[q],qx=b.x1>x?b.x1:b.x2<x?b.x2:x,qz=b.z1>z?b.z1:b.z2<z?b.z2:z;if((qx-x)*(qx-x)+(qz-z)*(qz-z)<r2){ok=false;break;}}free[i*NZ+j]=ok?1:0;}
 const gi=Math.max(0,Math.min(NX-1,Math.round((to.x-P.X0)/C))),gj=Math.max(0,Math.min(NZ-1,Math.round((to.z-P.Z0)/C)));free[gi*NZ+gj]=1;
 const cap=NX*NZ*8,hk=new Int32Array(cap),hv=new Float32Array(cap);let hl=0;
 const push=(v,n)=>{let c=hl++;hv[c]=v;hk[c]=n;while(c>0){const q=(c-1)>>1;if(hv[q]<=hv[c])break;const tv=hv[q],tk=hk[q];hv[q]=hv[c];hk[q]=hk[c];hv[c]=tv;hk[c]=tk;c=q;}};
 f[gi*NZ+gj]=0;push(0,gi*NZ+gj);const DI=[1,-1,0,0,1,1,-1,-1],DJ=[0,0,1,-1,1,-1,1,-1],DW=[C,C,C,C,C*Math.SQRT2,C*Math.SQRT2,C*Math.SQRT2,C*Math.SQRT2];
 while(hl>0&&hl<cap-8){const v=hv[0],n=hk[0];hl--;if(hl>0){hv[0]=hv[hl];hk[0]=hk[hl];let c=0;for(;;){const l=2*c+1,rr=l+1;let m=c;if(l<hl&&hv[l]<hv[m])m=l;if(rr<hl&&hv[rr]<hv[m])m=rr;if(m===c)break;const tv=hv[m],tk=hk[m];hv[m]=hv[c];hk[m]=hk[c];hv[c]=tv;hk[c]=tk;c=m;}}
  if(v>f[n])continue;const i=(n/NZ)|0,j=n-i*NZ;for(let d=0;d<8;d++){const a=i+DI[d],b=j+DJ[d];if(a<0||b<0||a>=NX||b>=NZ)continue;const m=a*NZ+b;if(!free[m])continue;const nv=v+DW[d];if(nv<f[m]){f[m]=nv;push(nv,m);}}}
 return {f,NZ,FS};}
// one A* leg: step(budget) gives 'run', 'found' (the shortened path in .path) or 'fail'; only one search uses the shared arrays at a time
function benchGlidePlan36(from,to,discs,field,boxes){const P=BENCH_PLAN36,A=benchPlanArrays36(),NX=P.NX,NZ=P.NZ,NT=P.NT,S0=P.S,D5=5*D2R36;
 if(P.live&&P.live.status==='run')P.live.status='abort';
 for(let k=0;k<A.nt;k++){const n=A.touched[k];A.flag[n]=0;A.eflag[n]=0;}A.nt=0;A.hl=0;
 const me={status:'run',path:null,exp:0};P.live=me;boxes=boxes||benchPlanBoxes36();
 const touch=n=>{if(A.flag[n]===0&&A.eflag[n]===0){if(A.nt>=A.touched.length){const t=new Int32Array(A.touched.length*2);t.set(A.touched);A.touched=t;}A.touched[A.nt++]=n;}};
 const Pn=n=>{const k=n%NT,ij=(n-k)/NT,j=ij%NZ,i=(ij-j)/NZ;return {x:P.X0+i*S0,z:P.Z0+j*S0,yaw:k*D5};};
 const gapN=n=>{if(A.flag[n]&4)return A.gap[n];touch(n);const q=Pn(n),g=benchPlanGap36(q.x,q.z,q.yaw,boxes,discs);A.gap[n]=g;A.flag[n]|=4;return g;};
 // a lattice step is clear (cached on the state it leaves in the + direction: bit 1/2 x, 4/8 z, 16/32 yaw)
 const stepOK=(n,m,axis)=>{const lo=axis===2?((m%NT)===((n%NT)+1)%NT?n:m):(m>n?n:m),hi=lo===n?m:n,kb=axis===0?1:axis===1?4:16;const f=A.eflag[lo];if(f&kb)return (f&(kb<<1))!==0;
  touch(lo);const ga=gapN(lo),gb=gapN(hi);let ok=false;if(ga>P.EPS&&gb>P.EPS){const a=Pn(lo),b=Pn(hi);if(axis===2)b.yaw=a.yaw+D5;ok=benchPlanSafe36(a,b,boxes,discs,ga,gb);}A.eflag[lo]|=ok?kb*3:kb;return ok;};
 const attach=p=>{const i0=Math.round((p.x-P.X0)/S0),j0=Math.round((p.z-P.Z0)/S0),k0=Math.round(p.yaw/D5),out=[];
  for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++)for(let dk=-1;dk<=1;dk++){const i=i0+di,j=j0+dj;if(i<0||j<0||i>=NX||j>=NZ)continue;const k=(((k0+dk)%NT)+NT)%NT,q={x:P.X0+i*S0,z:P.Z0+j*S0,yaw:p.yaw+benchWrapA36(k*D5-p.yaw)};
   out.push([Math.hypot(q.x-p.x,q.z-p.z)+Math.abs(benchWrapA36(q.yaw-p.yaw))*0.3,q,(i*NZ+j)*NT+k]);}
  out.sort((a,b)=>a[0]-b[0]);const gp=benchPlanGap36(p.x,p.z,p.yaw,boxes,discs);if(gp<=P.EPS)return -1;
  for(const [,q,n] of out){const g=gapN(n);if(g>P.EPS&&benchPlanSafe36(p,q,boxes,discs,gp,g))return n;}return -1;};
 const fail=()=>{me.status='fail';me.step=()=>'fail';return me;};
 const s=attach(from),g=attach(to);if(s<0||g<0)return fail();
 field=field||benchPlanField36(to,boxes);const gp=Pn(g);
 const FF=field.f,FNZ=field.NZ,FS=field.FS,h=n=>{const k=n%NT,ij=(n-k)/NT,j=ij%NZ,i=(ij-j)/NZ,fd=FF[Math.round(i/FS)*FNZ+Math.round(j/FS)];return fd===Infinity?Infinity:P.W*(fd+0.3*Math.abs(benchWrapA36(k*D5-gp.yaw)));};
 const push=(f,n)=>{if(A.hl>=A.hf.length){const a=new Float64Array(A.hf.length*2),b=new Int32Array(A.hn.length*2);a.set(A.hf);b.set(A.hn);A.hf=a;A.hn=b;}let c=A.hl++;A.hf[c]=f;A.hn[c]=n;
  while(c>0){const q=(c-1)>>1;if(A.hf[q]<=A.hf[c])break;const tf=A.hf[q],tn=A.hn[q];A.hf[q]=A.hf[c];A.hn[q]=A.hn[c];A.hf[c]=tf;A.hn[c]=tn;c=q;}};
 const pop=()=>{const n=A.hn[0];A.hl--;if(A.hl>0){A.hf[0]=A.hf[A.hl];A.hn[0]=A.hn[A.hl];let c=0;for(;;){const l=2*c+1,r=l+1;let m=c;if(l<A.hl&&A.hf[l]<A.hf[m])m=l;if(r<A.hl&&A.hf[r]<A.hf[m])m=r;if(m===c)break;
   const tf=A.hf[m],tn=A.hn[m];A.hf[m]=A.hf[c];A.hn[m]=A.hn[c];A.hf[c]=tf;A.hn[c]=tn;c=m;}}return n;};
 touch(s);A.cost[s]=0;A.prev[s]=-1;A.flag[s]|=2;push(h(s),s);
 // the path, shortened only by straight pieces that pass the same test (one test at a time, so the frame budget holds)
 const finish=function*(){const raw=[];for(let n=g;n>=0;n=A.prev[n])raw.push(Pn(n));raw.reverse();raw.unshift({x:from.x,z:from.z,yaw:from.yaw});raw.push({x:to.x,z:to.z,yaw:to.yaw});
  for(let k=1;k<raw.length;k++){const d=benchWrapA36(raw[k].yaw-raw[k-1].yaw);raw[k].yaw=raw[k-1].yaw+d;}
  const out=[raw[0]];let i=0;const L=(a,b)=>benchPlanSafe36(raw[a],raw[b],boxes,discs);
  while(i<raw.length-1){let j=i+1;if(i>0&&j<raw.length-1){let step=1;for(;;){if(!(j+step<raw.length-1))break;const ok=L(i,j+step);yield 0;if(!ok)break;j+=step;step*=2;}
    while(step>1){step>>=1;if(j+step<raw.length-1){const ok=L(i,j+step);yield 0;if(ok)j+=step;}}}out.push(raw[j]);i=j;}
  return out;};
 me.step=function(budget){if(me.status!=='run')return me.status;const t0=BENCH36.cost.nodes,used=()=>BENCH36.cost.nodes-t0;
  if(me.fin){while(used()<budget){const r=me.fin.next();if(r.done){me.path=r.value;me.status='found';return me.status;}}return me.status;}
  while(A.hl>0&&used()<budget&&me.exp<P.CAP){const n=pop();if(A.flag[n]&1)continue;A.flag[n]|=1;me.exp++;if(n===g){me.fin=finish();return me.step(budget-used());}
   const k=n%NT,ij=(n-k)/NT,j=ij%NZ,i=(ij-j)/NZ,cn=A.cost[n];
   for(let mv=0;mv<6;mv++){let a=i,b=j,kk=k,c=S0;if(mv===0)a++;else if(mv===1)a--;else if(mv===2)b++;else if(mv===3)b--;else{kk=mv===4?(k+1)%NT:(k+NT-1)%NT;c=0.04;}
    if(a<0||b<0||a>=NX||b>=NZ)continue;const m=(a*NZ+b)*NT+kk,fm=A.flag[m];if(fm&1)continue;const nc=cn+c;if((fm&2)&&nc>=A.cost[m])continue;
    const hm=h(m);if(hm===Infinity)continue;if(gapN(m)<=P.EPS)continue;if(!stepOK(n,m,mv<2?0:mv<4?1:2))continue;touch(m);A.cost[m]=nc;A.prev[m]=n;A.flag[m]|=2;push(nc+hm,m);}}
  if(me.status==='run'&&(!A.hl||me.exp>=P.CAP))me.status='fail';return me.status;};
 return me;}
// one glide start to finish, no budget (for probes)
function benchGlideNow36(from,to,pos){const P=benchGlidePlan36(to,from,pos);while(P.step(1e6)==='run');return P.path?P.path.slice().reverse():null;}
// a walk is clear: every 5 cm of it keeps the player's disc off the walls and off the given bench box
function benchWalkClear36(path,box){for(let k=1;k<path.length;k++){const a=path[k-1],b=path[k],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/0.05));
 for(let s=0;s<=n;s++){const x=a[0]+(b[0]-a[0])*s/n,z=a[1]+(b[1]-a[1])*s/n;if(blocked(x,z,PR-0.01,{noBench:true})||(box&&bench36CircleOBB(x,z,PR-0.01,box)))return false;}}return true;}
// a walking path from a to b on the walk grid with the given bench box, as a few straight pieces (each checked); null when there is none
function benchWalkPath36(a,b,box){const G=BENCH_GRID36,w=benchGridWith36(box),N=G.nx*G.nz,par=new Int32Array(N).fill(-1),t=benchCell36(b[0],b[1]);if(t<0||w[t])return null;
 let found=false;const seen=benchBFS36(w,a[0],a[1],(i,j)=>{if(i*G.nz+j===t){found=true;return true;}return false;},par);if(!found)return null;
 const cells=[];for(let n=t;n>=0;n=par[n])cells.push([G.x0+((n/G.nz)|0)*G.s,G.z0+(n%G.nz)*G.s]);cells.reverse();
 // keep a corner only where the straight piece from the last kept point would no longer be clear
 const out=[a],L=cells.length-1;let k=0;while(k<L){if(benchWalkClear36([out[out.length-1],cells[L]],box)){out.push(cells[L]);break;}let j=k+1;while(j+4<L&&benchWalkClear36([out[out.length-1],cells[j+4]],box))j+=4;out.push(cells[j]);k=j;}
 out[out.length-1]=b;return benchWalkClear36(out,box)?out:null;}
// the settle job for one arrangement: its attempts in order (the row holder steps aside east of the doorway; or the two legs), run in budget
function benchJobSig36(key,from,pos){return key+'|'+[from.x,from.z,from.yaw].map(v=>v.toFixed(5)).join(',')+'|'+pos.map(q=>q.map(v=>v.toFixed(4)).join(',')).join(';')+'|'+(BENCH36.grid?BENCH36.grid.sig:'');}
function benchJobFor36(key,from,pos){const B=BENCH36,sig=benchJobSig36(key,from,pos);B.jobs=B.jobs||{};const j=B.jobs[key];if(j&&j.sig===sig)return j;
 return (B.jobs[key]={key,sig,from,to:benchPoseOf36(key),pos,g:null,at:null,cur:null,result:null,status:'run'});}
// the job's next attempt, made when it is needed (one at a time: each costs a walk or two on the grid): first the row holder stepping aside east
// of the doorway to each spot in turn; then the two legs (the bench backs into the room along its own axis until its doorway end clears the
// mouth; the room holder steps aside first, the row holder comes in through the doorway after), for pairs of room spots; null when none is left
function benchJobNext36(J){const P=BENCH_PLAN36,from=J.from;let G=J.g;
 if(!G){G=J.g={phase:0,k:0,n:0,fbox:benchBox36(from,0),row:[0,1].find(i=>J.pos[i][1]>5.85)};
  const ux=Math.cos(from.yaw),uz=-Math.sin(from.yaw);if(Math.abs(uz)>0.6){const sg=uz<0?1:-1,ez=Math.abs(uz)*BENCH36.HX+Math.abs(Math.cos(from.yaw))*BENCH36.HZ,qz=4.85-ez,d=(from.z-qz)/Math.abs(uz);
   G.Q={x:from.x+ux*sg*d,z:qz,yaw:from.yaw};G.qbox=benchBox36(G.Q,0);}
  G.pairs=[];for(const rs of P.ROOM)for(const rr of P.ROOM)if(rs!==rr&&Math.hypot(rs[0]-rr[0],rs[1]-rr[1])>=0.8)G.pairs.push([rs,rr]);}
 if(G.row===undefined){if(G.phase===0){G.phase=9;return {legs:[{discs:J.pos}],pre:[]};}return null;}
 const row=G.row,room=1-row,pr=J.pos[row],pm=J.pos[room];
 while(G.phase===0&&G.k<P.ASIDE.length){const sp=P.ASIDE[G.k++];if(!benchFreeSpot36(sp[0],sp[1],G.fbox))continue;const wa=benchWalkPath36(pr,sp,G.fbox);if(!wa)continue;
  return {pre:[{walk:{i:row,path:wa}}],legs:[{discs:[sp,pm]}]};}
 if(G.phase===0){G.phase=1;G.k=0;}
 while(G.phase===1&&G.Q&&G.k<G.pairs.length&&G.n<6){const [rs,rr]=G.pairs[G.k++];
  if(!benchFreeSpot36(rs[0],rs[1],G.fbox)||!benchFreeSpot36(rs[0],rs[1],G.qbox)||!benchFreeSpot36(rr[0],rr[1],G.qbox))continue;
  const wa=benchWalkPath36(pm,rs,G.fbox);if(!wa)continue;const wb=benchWalkPath36(pr,rr,G.qbox);if(!wb)continue;
  const d1=[null,null];d1[row]=pr;d1[room]=rs;const d2=[null,null];d2[row]=rr;d2[room]=rs;G.n++;
  return {pre:[{walk:{i:room,path:wa}}],legs:[{to:G.Q,discs:d1,line:true},{discs:d2,walk:{i:row,path:wb,leg:2}}]};}
 return null;}
// runs the job within the budget: 'run', 'done' (J.result is the list of steps) or 'fail'. A planned leg from S to E is searched from E back to S.
// The heavier steps (the next attempt's walks, a guide) wait for a frame with no other bench work.
function benchJobStep36(J,budget){const P=BENCH_PLAN36,B=BENCH36;if(J.status!=='run')return J.status;
 const boxes=J.boxes||(J.boxes=benchPlanBoxes36());B.fields=B.fields||{};const busy=()=>B.heavy===B.frame||B.cost.nodes>(B.frameNodes0||0);
 while(budget>0&&J.status==='run'){let at=J.at;
  if(!at){if(busy())break;at=J.at=benchJobNext36(J);B.heavy=B.frame;if(!at)J.status='fail';break;}
  if(!at.done){at.done=[];at.li=0;}
  const leg=at.legs[at.li];if(!leg){J.result=at.pre.slice();at.legs.forEach((l,k)=>{if(l.walk)J.result.push({walk:l.walk});J.result.push({glide:at.done[k]});});J.status='done';break;}
  const S0=at.li===0?J.from:at.legs[at.li-1].to,E=leg.to||J.to;
  if(leg.line){const ok=benchPlanSafe36(S0,E,boxes,leg.discs);budget=benchBudget36();if(!ok){J.at=null;J.cur=null;continue;}at.done.push([S0,E]);at.li++;continue;}
  const fk=[S0.x,S0.z,S0.yaw].map(v=>v.toFixed(4)).join(',');
  if(!B.fields[fk]){if(busy())break;B.fields[fk]=benchPlanField36(S0,boxes);B.heavy=B.frame;break;}
  if(B.heavy===B.frame)break;
  if(!J.cur||J.cur.status==='abort'){J.cur=benchGlidePlan36(E,S0,leg.discs,B.fields[fk],boxes);budget=benchBudget36();if(budget<=0)break;}
  const r=J.cur.step(budget);budget=benchBudget36();
  if(r==='found'){at.done.push(J.cur.path.slice().reverse());J.cur=null;at.li++;}else if(r==='fail'){J.cur=null;J.at=null;}else if(r==='abort'){J.cur=null;}else break;}
 return J.status;}
// while the pair chooses: plan ahead, the selected arrangement first, within the frame's budget
function benchPlanAhead36(){const B=BENCH36;if(B.state!=='choosing'||!B.okCache)return;const pos=[benchPos36(0),benchPos36(1)],from=bench36Pose();
 for(const k of [B.choice].concat(B.ORDER.filter(x=>x!==B.choice))){if(B.okCache[k]!==true)continue;const J=benchJobFor36(k,from,pos);if(J.status!=='run')continue;
  if(benchBudget36()<=0)return;benchJobStep36(J,benchBudget36());if(J.status==='run')return;}}

/* ---------- 7. Sitting together ---------- */
const prevSeatFrame36=sofaSeatFrame;sofaSeatFrame=function(){const B=BENCH36;if(B.seatTarget){B.seatTarget.updateWorldMatrix(true,false);return {frame:B.seatTarget,height:0.46,depth:0.03,spacing:0.36};}return prevSeatFrame36.apply(this,arguments);};
const sitStopReal36=sitStop;
function benchBenchGroup36(){if(!furnGroup)return null;return furnGroup.children.find(g=>g.userData&&g.userData.furnitureType==='bench')||null;}
function benchSit36(i){const B=BENCH36;if(B.state!=='placed'||SEATING30.active)return false;const it=benchItem36(),g=benchBenchGroup36();if(!it||!g)return false;
 const pose=benchPoseOf36(it.pose36),o=players[1-i];if(!o||Math.hypot(o.g.position.x-pose.x,o.g.position.z-pose.z)>2.4){benchToast36(`Wait for ${benchPlayerName36(1-i)}.`);return true;}
 if(typeof sofa!=='undefined'&&sofa&&sofa.carrying)return false;
 B.seatTarget=g;try{sitStart();}finally{}if(!SEATING30.active){B.seatTarget=null;return false;}B.seatDay=S.day;B.seatLocal=benchLocal36();B.standT=0;benchSetState36('seated');return true;}
function bench36StandUp(){const B=BENCH36;if(B.state!=='seated')return false;B.standing=true;try{sitStopReal36();}finally{B.standing=false;}B.seatTarget=null;B.seatDay=null;benchSetState36('placed');return true;}
function benchSeatedStep36(dt){const B=BENCH36;if(!SEATING30.active){B.seatTarget=null;benchSetState36('placed');return;}let up=false;for(const i of [0,1]){const r=B.raw[i]||[0,0];if(Math.hypot(r[0],r[1])>0.5)up=true;}
 B.standT=up?(B.standT||0)+dt:0;if(B.standT>=0.3){bench36StandUp();benchStoodUp36();}}
// wrap (outermost): while the pair sits on the bench on the same day, closing a panel (Menu, Tasks, journal) does not stand them up; the velocities are zeroed
const prevClose36=closePanel;closePanel=function(){const B=BENCH36;B.vel.s=0;B.vel.w=0;B.latch=[null,null];B.wall.s=0;B.wall.w=0;
 let r;if(B.state==='seated'&&S&&S.day===B.seatDay&&!B.standing){const keep=sitStop;sitStop=function(){};try{r=prevClose36.apply(this,arguments);}finally{sitStop=keep;}}else r=prevClose36.apply(this,arguments);
 if(B.state==='seated'&&!SEATING30.active){B.seatTarget=null;benchSetState36('placed');}
 if(B.notePending&&!overlayOpen()){B.notePending=false;benchSpawn36(false);}return r;};
// wrap: a day change, a new household or entering the world stands the pair up first (going online does too: hosting or joining enters a new
// world, and a household that turns online stands up in the step; nethost itself is left alone, as tune-v35 reads its source)
for(const n of ['nextday','sleep','newgame','newconfirm']){const prev=ACTIONS[n];if(typeof prev!=='function')continue;ACTIONS[n]=function(){bench36StandUp();return prev.apply(this,arguments);};}
// wrap: a new day that starts mid-delivery (the "Past midnight" card) leaves the pair where they stood, not in the room, so the carry carries on
{const prevNext36=ACTIONS.nextday;if(typeof prevNext36==='function')ACTIONS.nextday=function(){const B=BENCH36,s=B.state;
 const keep=!B.paused&&(s==='grounded'||s==='ready'||s==='carrying')&&players.length===2?players.map(p=>[p.g.position.x,p.g.position.z]):null;
 const r=prevNext36.apply(this,arguments);if(keep)keep.forEach((q,i)=>benchPlace36(i,q[0],q[1]));return r;};}

/* ---------- 2.1 Hotspots and Act ---------- */
function bench36Hot(i,list,d){const B=BENCH36,s=B.state;if(s==='off')return null;const p=players[i];if(!p)return null;
 if(s==='placed'){const it=benchItem36();const L=benchSave36();if(!it||(L&&L.again))return null;if(typeof sofa!=='undefined'&&sofa&&sofa.carrying)return null;const pose=benchPoseOf36(it.pose36),dd=benchBoxDist36(pose,p.g.position.x,p.g.position.z);
  if(dd<=1.0&&list){const o=players[1-i],near=o&&Math.hypot(o.g.position.x-pose.x,o.g.position.z-pose.z)<=2.4;
   // (round 3, RP-9) a companion or online partner is not waited for: nobody is coming because a prompt says so
   if(near||!((typeof AI!=='undefined'&&AI.on)||(typeof NET!=='undefined'&&NET.on)))list.push({id:'bench36Sit',label:near?'Sit on the bench together':`Wait for ${benchPlayerName36(1-i)}`,dist:dd-0.45});}return null;}   // a player standing at the bench's end gets the seat (not only one pressed against it), one at the pepper pot's own point the pot (whose entry takes a 0.2 m lead)
 if(s==='seated')return p.g.sitting?{id:'bench36Stand',label:'Stand up',dist:0}:null;
 if(B.paused)return null;
 if(s==='choosing')return {id:'bench36Agree',label:B.agree[i]?'Not yet':(B.okCache&&B.okCache[B.choice]===false?'Not free':'Agree'),dist:0};
 if(s==='settling')return null;
 const h=benchHolderOf36(i);
 if(s==='carrying'&&h>=0)return benchPutBack36()?{id:'bench36PutBack',label:'Put it back',dist:0}:{id:'bench36SetDown',label:'Set the bench down',dist:0};
 if(s==='ready'&&h>=0)return benchPinned36()?{id:'bench36LetGo',label:`Let go · ${benchPlayerName36(1-i)} can’t get round`,dist:0}:{id:'bench36Swap',label:'Swap roles · walk off to let go',dist:0};
 if(!list)return null;
 if((s==='grounded'||s==='ready')&&!p.g.sitting){for(const e of [0,1]){const [x,z]=benchEnd36(B.pose,e),dd=Math.hypot(p.g.position.x-x,p.g.position.z-z);if(dd>B.TAKE)continue;
   if(!(s==='ready'&&B.holder[e]===null)&&s!=='grounded')continue;
   // the step to the stand point is a straight line: from round a corner it would pass through the wall, so the player walks round first
   if(!benchSlideClear36([p.g.position.x,p.g.position.z],[x,z])){list.push({id:'bench36Round',label:'Come round to this end',dist:dd});continue;}
   // (11.3) half a metre ahead of the room's own prompts: at the end by the stove "Cook" no longer hides "Take this end"
   if(s==='ready')list.push({id:'bench36Lift',label:'Lift together',dist:dd-0.5});
   else if(benchTakeBoxesC36(i,e))list.push({id:'bench36Keep',label:`${benchPlayerName36(1-i)} needs this end`,dist:dd-0.5});
   else list.push({id:'bench36Take',label:'Take this end',dist:dd-0.5});}
  if(s==='ready'&&h<0&&benchPinned36()){const k=B.holder[0]!==null?0:1,o=players[B.holder[k]],dd=o?Math.hypot(p.g.position.x-o.g.position.x,p.g.position.z-o.g.position.z):9;
   if(dd<=1.5)list.push({id:'bench36Pinned',label:`Ask ${benchPlayerName36(B.holder[k])} to let go`,dist:dd});}}
 if(B.stuck&&(s==='grounded'||s==='ready')){const box=benchBox36(B.pose,0),c=Math.cos(box.yaw),sn=Math.sin(box.yaw),dx=p.g.position.x-box.x,dz=p.g.position.z-box.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c,qx=Math.max(-box.hx,Math.min(box.hx,lx)),qz=Math.max(-box.hz,Math.min(box.hz,lz)),dd=Math.hypot(lx-qx,lz-qz);
  if(dd<=1.3)list.push({id:'bench36Reset',label:'Reset the bench',dist:dd+1.0});}   // 1 m behind: near an end, Take always wins
 return null;}
HOTSPOT_HOOKS.push(bench36Hot);
ACT_HOOKS.push(function(i,kind){if(kind.slice(0,7)!=='bench36')return false;const B=BENCH36,s=B.state;
 if(kind==='bench36Sit'){benchSit36(i);return true;}
 if(kind==='bench36Stand'){bench36StandUp();benchStoodUp36();return true;}
 if(B.paused)return true;
 if(kind==='bench36Agree'||(s==='choosing'&&kind!=='bench36Sit'&&kind!=='bench36Stand')){benchAgree36(i);return true;}   // the live state decides: in the chooser any bench Act is an agreement
 if(kind==='bench36Reset'){if(B.stuck)bench36Reset();return true;}
 if(kind==='bench36Round'){benchToast36('Come round to this end first.');return true;}
 if(kind==='bench36Keep'){benchToast36(`${benchPlayerName36(1-i)} needs this end to get round. Take the other one.`);return true;}
 if(kind==='bench36Pinned'){return true;}
 const h=benchHolderOf36(i);
 if(kind==='bench36PutBack'||(s==='carrying'&&h>=0&&benchPutBack36())){if(s==='carrying'&&h>=0&&benchPutBack36()){B.snap=null;B.glide=null;B.holder=[null,null];benchResetMotion36();B.y=0;B.liftT=0;B.liftDir=0;benchSetState36('grounded');bench36Reset();}else if(s==='carrying'&&h>=0)benchSafeDown36(i,'act');return true;}
 if(kind==='bench36LetGo'){if(s==='ready'&&h>=0)benchLetGo36(i);return true;}
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
// the line under a player's chip (12 px or more, also on phones): what the last bump met, a stall, who a holder waits for, or the first lifts' hint
function benchSubLine36(i,rl,h){const B=BENCH36,m=B.bumpMsg;if(h<0)return '';
 // Turn aid 2: the turner's swing refused three times within 4 s
 if(B.state==='carrying'&&benchTurnAidOn36()){const mv=benchPlayerName36(B.mover),tn=benchPlayerName36(1-B.mover);return i===B.mover?`${tn} needs room. Back up a little.`:`Your end is on the wall. Try the other way, or ask ${mv} to back up a little.`;}
 if(B.state==='carrying'&&m&&B.t-m.t<1.6){const th='the '+m.thing;if(m.who===i)return `You’re up against ${th}.`;if(m.who>=0)return `${benchPlayerName36(m.who)} is up against ${th}.`;return `The bench is against ${th}.`;}
 if(B.state==='carrying'&&B.stuck)return benchPutBack36()?'Too tight to set down here. Back up a little, or press Act to put it back.':B.downChk&&!B.downChk.ok?'Too tight to set down here. Back up a little.':'Stuck? Back up a little, or set it down and swap roles.';
 if(B.state==='ready')return `Waiting for ${benchPlayerName36(1-i)}`;
 if(B.state==='carrying'&&B.hintUntil&&B.t<B.hintUntil)return rl==='move'?'Push it along: towards your end or away from it.':'Push your end left or right to turn it.';
 return '';}
// the page knows when the bench is in hands, being placed or sat on (the wayfinding pill steps aside; on small screens the Pantry card too and,
// once the first lifts are done, the carry prompt shrinks to the key and the chip)
function benchBusyClass36(){if(typeof document==='undefined'||!document.body||!document.body.classList)return;const B=BENCH36,s=B.state,L=benchSave36(),cl=document.body.classList;
 const busy=!B.paused&&(s==='ready'||s==='carrying'||s==='choosing'||s==='settling'||s==='seated');
 const on=(c,v)=>{if(cl.contains(c)!==v)cl.toggle(c,v);};on('bench36-busy',busy);on('bench36-choose',busy&&s==='choosing');
 on('bench36-compact',busy&&s==='carrying'&&!!L&&(L.hints||0)>=2&&!(B.hintUntil&&B.t<B.hintUntil)&&!(B.bumpMsg&&B.t-B.bumpMsg.t<1.6)&&!B.stuck&&!benchTurnAidOn36());}
// (the prompt is read live, not from the frame's hotspot cache, so it changes on the frame of a transition, not up to 0.25 s later)
const prevHUD36=updateHUD;updateHUD=function(){const r=prevHUD36.apply(this,arguments);const B=BENCH36;if(B.state==='off'||!S||!S.p||!players.length||typeof document==='undefined')return r;
 if(B.state==='placed'){if(!(B.hudLive>0))return r;B.hudLive--;}
 benchBusyClass36();
 for(const i of [0,1]){const pr=document.getElementById('pr'+i),role=document.getElementById('prole'+i),hs=typeof nearest==='function'&&S.phase==='play'&&!overlayOpen()?nearest(i):hotspotCache[i],rl=bench36Role(i),h=benchHolderOf36(i);
  if(pr&&!hs){pr.className='pr p'+i;}else if(pr&&hs&&!rl){pr.className='pr on p'+i;pr.innerHTML=`<span class="k">${glyph(i)}</span><span>${esc(hs.label)}</span>`;}
  if(B.state==='seated'){if(players[i]&&players[i].g.sitting&&role)role.textContent='Sitting together';continue;}
  if(rl&&hs&&pr){const sub=benchSubLine36(i,rl,h),m=B.bumpMsg,bumped=h>=0&&B.state==='carrying'&&m&&B.t-m.t<0.8&&(m.who===i||m.who<0);
   pr.className='pr on p'+i;pr.innerHTML=`<span class="k">${glyph(i)}</span><span class="role36 ${rl}${bumped?' bump36':''}">${rl==='move'?'Move':'Turn'}</span><span class="lb36"><span class="t36">${esc(hs.label)}</span>${sub?`<span class="hint36">${esc(sub)}</span>`:''}</span>`;}
  if(role){if(B.state==='carrying'&&h>=0)role.textContent=`Bench · ${rl==='move'?'Move':'Turn'}`;else if(B.state==='ready'&&h>=0)role.textContent=`Bench · ${rl==='move'?'Move':'Turn'} · waiting for ${benchPlayerName36(1-i)}`;
   }}   // (round 3, RP-11: the card keeps "Bench · Move/Turn" while stuck; the stuck advice is the prompt's own line)
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
// the on-screen direction (radians, 0 = right, clockwise) of a world direction at (x, z), projected through view i's own camera (pitch included)
// (whole: the step is the target itself, up to 4 m away, so the arrow points where that point is drawn; otherwise a 1 m step)
function benchScreenAng36(i,x,z,dx,dz,whole){const c=cams&&cams[i];const n=Math.hypot(dx,dz)||1,k=whole?Math.min(1,4/n):1/n;if(!c||typeof c.updateMatrixWorld!=='function')return benchScreenDir36(dx,dz);
 c.updateMatrixWorld();const a=new THREE.Vector3(x,0.4,z).project(c),b=new THREE.Vector3(x+dx*k,0.4,z+dz*k).project(c),vp=v21Viewport(i);return Math.atan2(-(b.y-a.y)*vp.h,(b.x-a.x)*vp.w);}
// where the edge arrow sits in view i: on the edge of the area the camera frames (clear of the player card above and the prompt below), along ang
function benchEdgePos36(i,ang){const vp=v21Viewport(i),x0=vp.w*0.12,x1=vp.w*0.88,y0=vp.top+24,y1=Math.max(y0+20,vp.h-vp.bottom-24),cx=vp.w/2,cy=(y0+y1)/2,dx=Math.cos(ang),dy=Math.sin(ang);
 let t=1e9;if(dx>1e-6)t=Math.min(t,(x1-cx)/dx);if(dx<-1e-6)t=Math.min(t,(x0-cx)/dx);if(dy>1e-6)t=Math.min(t,(y1-cy)/dy);if(dy<-1e-6)t=Math.min(t,(y0-cy)/dy);return [cx+dx*t,cy+dy*t];}
function benchArrows36(){const B=BENCH36;if(typeof document==='undefined')return;B.arrowAng=B.arrowAng||[null,null];
 for(const i of [0,1]){let show=false,ang=0,cap='',cls='',pos=null;
  if(!B.paused&&B.state==='carrying'&&benchHolderOf36(i)>=0){const role=i===B.mover?0:1;
   // the out-of-cone hint, beside the player's own end: Move's along the bench (the way it leads), Turn's sideways the way that swings the
   // leading end towards the next corner (round 3, RP-1: no longer always the same way round)
   if(B.outT[role]>=(role?0.35:0.6)){const f=B.front?1:-1,a=benchAxis36(B.pose.yaw);let d;if(role===0)d=[a[0]*f,a[1]*f];else{const sg=benchTurnSign36();d=[Math.sin(B.pose.yaw)*f*sg,Math.cos(B.pose.yaw)*f*sg];}
    ang=benchScreenAng36(i,B.pose.x,B.pose.z,d[0],d[1]);cap=role===0?'push along the bench':'push your end sideways';cls='hint';show=true;const end=benchEnd36(B.pose,role===0?B.front:1-B.front,B.STAND);pos=benchScreenPt36(i,end[0],B.y+0.9,end[1]);}
   else{const info=B.camInfo&&B.camInfo[i],W=B.ROUTE[B.corner];if(info&&info.arrow&&W){ang=benchScreenAng36(i,B.pose.x,B.pose.z,W.x-B.pose.x,W.z-B.pose.z,true);cap=W.n;cls='edge';pos=benchEdgePos36(i,ang);show=true;}}}
  const el=benchArrowEl36(i,show);
  if(show&&el){el.style.display='';el.className='bench36-arrow '+(cls==='hint'?'hint36':cls);   // (round 2b) not the base's .hint (its gold border, padding and 8 px margin moved the arrow down onto the card)
  const c=el.querySelector&&el.querySelector('.c');if(c&&c.textContent!==cap)c.textContent=cap;}
  if(show&&pos)pos=benchClearPos36(i,pos,benchArrowSize36(el,cap));   // (round 3, M3 and RP-4) never over the prompt card
  // (round 2b) placed before it is first shown: on the frame an arrow appears (or changes kind) it is laid out and placed but kept invisible,
  // and it shows from the next frame, placed again against the prompt card as that frame lays it out (the card can grow in the frame of the
  // lift, after the arrow was placed: at 844x390 the Move hint overlapped it by 2 px on its first frame)
  B.arrowVis36=B.arrowVis36||['',''];const first=show&&B.arrowVis36[i]!==cls;B.arrowVis36[i]=show?cls:'';
  BENCH36.arrowShown[i]=show?cls:'';B.arrowAng[i]=show?Math.round(ang*180/Math.PI*10)/10:null;B.arrowPos=B.arrowPos||[null,null];B.arrowPos[i]=pos?[Math.round(pos[0]),Math.round(pos[1])]:null;B.arrowCap=B.arrowCap||['',''];B.arrowCap[i]=show?cap:'';if(!el)continue;
  el.style.display=show?'':'none';el.style.visibility=first?'hidden':'';if(show){el.style.left=pos?pos[0].toFixed(0)+'px':'';el.style.top=pos?pos[1].toFixed(0)+'px':'';
   const g=el.querySelector&&el.querySelector('.g');if(g)g.style.transform=`rotate(${(ang*180/Math.PI).toFixed(1)}deg)`;}}}
// the turn (+1: yaw grows) that swings the leading end (the one nearer the next corner's side) towards the next corner
function benchTurnSign36(){const B=BENCH36,W=B.ROUTE[B.corner]||B.ROUTE[B.ROUTE.length-1],f=B.front?1:-1,a=benchAxis36(B.pose.yaw),e=[Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f],v=[W.x-B.pose.x,W.z-B.pose.z];
 const lead=(a[0]*f*v[0]+a[1]*f*v[1])>=0?-1:1,s=lead*(e[0]*v[0]+e[1]*v[1]);return s<0?-1:1;}   // the front end moves along -e as yaw grows, the rear end along +e
// a world point in view i's pixels (through its own camera)
function benchScreenPt36(i,x,y,z){const vp=v21Viewport(i),c=cams&&cams[i];if(!c||typeof c.updateMatrixWorld!=='function')return [vp.w/2,vp.h*0.46];c.updateMatrixWorld();const v=new THREE.Vector3(x,y,z).project(c);return [(v.x+1)/2*vp.w,(1-v.y)/2*vp.h];}
// the prompt card of view i in the view's pixels: the page's own box when it has one (none while it is hidden); without a layout (Node) the box
// the stylesheets give it (right 12 px; bottom 14 px, 160 px over the thumbs, 100 px on a short landscape phone; at most 60%, 58% or 38% wide)
function benchPromptRect36(i,vp){try{const pr=document.getElementById('pr'+i),half=document.getElementById('half'+i);
  if(pr&&half&&typeof pr.getBoundingClientRect==='function'&&typeof half.getBoundingClientRect==='function'){const a=pr.getBoundingClientRect(),h=half.getBoundingClientRect();if(a&&h&&typeof a.right==='number'&&typeof a.bottom==='number'&&typeof h.left==='number'){if(!(a.width>0&&a.height>0))return null;return {x1:a.left-h.left,y1:a.top-h.top,x2:a.right-h.left,y2:a.bottom-h.top};}}}catch(e){}
 const touch=navigator.maxTouchPoints>0,portrait=innerHeight>innerWidth,short=touch&&!portrait&&innerHeight<=520,w=vp.w*(portrait?0.38:innerWidth<=820?0.58:0.60);
 const bottom=short?100:touch?(portrait&&i===0?14:160):14,hgt=portrait?130:short?80:90;return {x1:vp.w-12-w,y1:vp.h-bottom-hgt,x2:vp.w-12,y2:vp.h-bottom};}
function benchArrowSize36(el,cap){const B=BENCH36,c=B.arrowSz36||(B.arrowSz36={});if(c[cap])return c[cap];let sz=null;
 try{if(el&&typeof el.getBoundingClientRect==='function'){const r=el.getBoundingClientRect();if(r&&typeof r.right==='number'&&r.width>0&&r.height>0)sz={w:r.width,h:r.height};}}catch(e){}
 if(!sz)return {w:170,h:70};return (c[cap]=sz);}
// the nearest point to pt, inside the area the camera frames, at which the arrow's box keeps 4 px clear of the prompt card
function benchClearPos36(i,pt,sz){const vp=v21Viewport(i),x0=vp.w*0.12,x1=vp.w*0.88,y0=vp.top+24,y1=Math.max(y0+20,vp.h-vp.bottom-24),R=benchPromptRect36(i,vp),hw=sz.w/2+4,hh=sz.h/2+4;
 const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ok=(x,y)=>!R||x+hw<=R.x1||x-hw>=R.x2||y+hh<=R.y1||y-hh>=R.y2;const x=cl(pt[0],x0,x1),y=cl(pt[1],y0,y1);if(ok(x,y))return [x,y];
 for(let d=8;d<=vp.w+vp.h;d+=8)for(let k=0;k<16;k++){const a=k/16*Math.PI*2,cx=cl(x+Math.cos(a)*d,x0,x1),cy=cl(y+Math.sin(a)*d,y0,y1);if(ok(cx,cy))return [cx,cy];}
 return [x,y];}
// while the bench is lifted the area captions (the place-name signs, "The Waterfront" and the rest) step out of both views; the ones hidden
// come back as they were once it is down (only signs that were showing are hidden, and only those are shown again)
function benchCaptions36(){const B=BENCH36;if(typeof FADEABLE==='undefined')return;const on=!B.paused&&B.state==='carrying';
 if(on){B.capHid=B.capHid||[];for(const m of FADEABLE)if(m&&m.isSprite&&m.visible){m.visible=false;B.capHid.push(m);}}
 else if(B.capHid&&B.capHid.length){for(const m of B.capHid)m.visible=true;B.capHid=[];}}
const prevCams36=updateCameras;updateCameras=function(dt){const r=prevCams36.apply(this,arguments);const B=BENCH36;if(B.state==='carrying'||B.state==='ready')benchArrows36();else if(B._arrowsOn)benchArrows36();B._arrowsOn=B.state==='carrying'||B.state==='ready';benchCaptions36();benchPill36();benchOccluders36(dt);return r;};
// (round 3, RP-5; round 2b: any wall or prop, not only the gate pillars) while the bench is in hands, every wall or prop mesh that stands between
// either camera and either holder (rays to the knee, chest and head) fades, as the base fades trees and awnings, so the holder at the far
// end never vanishes behind scenery, from their partner's view or their own; it is itself again (its own material back) once it no longer
// hides anyone, and everything is back once the bench is down. Visual only: blocked() and the walk boxes are untouched.
// The candidates are found once a carry (and again if the scene is rebuilt): every visible mesh standing above 0.3 m that is not a
// character, not one of the bench's own meshes, not a sprite, not one the base already fades and not already see-through. Each frame a ray
// is tested first against the candidates' boxes (kept every 30 frames, so a pushed prop is followed), then exactly against the few it meets.
// The gate pillars still fade with their caps (found by their place: the two walk boxes of the gate).
BENCH36.OCC={boxes:[[2.8,3.2,5.78,6.18],[4.8,5.2,5.78,6.18]],to:0.22,minY:0.3,hs:[0.6,1.2,1.7]};
function benchOccSkip36(m,ch){if(!m.isMesh||m.isSkinnedMesh||m.isSprite||!m.geometry||!m.material)return true;if(typeof FADEABLE!=='undefined'&&FADEABLE.includes(m))return true;
 const mats=Array.isArray(m.material)?m.material:[m.material];if(!m.userData.occ36&&mats.some(t=>!t||(t.transparent&&t.opacity<0.99)))return true;
 for(let o=m;o;o=o.parent){if(!o.visible||ch.has(o)||(typeof o.name==='string'&&o.name.indexOf('bench36')===0))return true;}return false;}
function benchOccList36(){const B=BENCH36,n=typeof scene!=='undefined'&&scene&&scene.children?scene.children.length:-1;if(B.occ36&&B.occ36.n===n)return B.occ36;
 const out={n,list:[],box:[],t:0};if(n<0||!scene.traverse)return (B.occ36=out);const bb=new THREE.Box3(),ch=new Set();
 if(typeof players!=='undefined')for(const p of players)if(p&&p.g)ch.add(p.g);if(typeof npcs!=='undefined')for(const k in npcs)if(npcs[k]&&npcs[k].g)ch.add(npcs[k].g);
 scene.traverse(m=>{if(benchOccSkip36(m,ch))return;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();bb.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
  if(bb.max.y<B.OCC.minY||bb.max.x-bb.min.x>60||bb.max.z-bb.min.z>60)return;
  const k=B.OCC.boxes.findIndex(([x1,x2,z1,z2])=>bb.max.y>=1.5&&bb.min.x>=x1-0.06&&bb.max.x<=x2+0.06&&bb.min.z>=z1-0.06&&bb.max.z<=z2+0.06);m.userData.occBox36=k>=0?k:undefined;
  out.list.push(m);out.box.push(bb.clone());});
 return (B.occ36=out);}
// the meshes that hide a holder from a camera this frame (the pillars with their caps)
function benchOccWant36(){const B=BENCH36,want=new Set();if(typeof cams==='undefined')return want;const L=benchOccList36();if(!L.list.length)return want;
 if((L.t=(L.t||0)+1)%30===0)L.list.forEach((m,k)=>{m.updateMatrixWorld&&m.updateMatrixWorld();L.box[k].copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);});
 const ray=B.occRay36||(B.occRay36=new THREE.Raycaster()),dir=new THREE.Vector3(),head=new THREE.Vector3(),hitP=new THREE.Vector3();
 for(let i=0;i<2;i++){const c=cams[i];if(!c)continue;for(const h of B.holder){const p=h===null?null:players[h];if(!p)continue;
  for(const hy of B.OCC.hs){head.set(p.g.position.x,(p.y||0)+hy,p.g.position.z);dir.copy(head).sub(c.position);const len=dir.length();if(!(len>0.5))continue;dir.normalize();
   ray.set(c.position,dir);ray.far=len-0.3;const near=[];
   for(let k=0;k<L.list.length;k++){const m=L.list[k];if(want.has(m)||!m.visible)continue;if(ray.ray.intersectBox(L.box[k],hitP)&&hitP.distanceTo(c.position)<=ray.far)near.push(m);}
   if(near.length)for(const hit of ray.intersectObjects(near,false))want.add(hit.object);}}}
 for(const m of L.list)if(!want.has(m)&&m.userData.occBox36!==undefined&&L.list.some(o=>want.has(o)&&o.userData.occBox36===m.userData.occBox36))want.add(m);   // a pillar fades with its cap
 return want;}
function benchOccluders36(dt){const B=BENCH36,on=!B.paused&&(B.state==='ready'||B.state==='carrying');B.occFaded36=B.occFaded36||new Set();if(!on&&!B.occFaded36.size){B.occ36=null;return;}
 const want=on?benchOccWant36():new Set(),k=Math.min(1,(+dt||0)*6),mats=m=>Array.isArray(m.material)?m.material:[m.material];
 for(const m of want)if(!m.userData.occ36){const o=m.material;m.userData.occ36={orig:o};m.material=Array.isArray(o)?o.map(t=>{const c=t.clone();c.transparent=true;return c;}):Object.assign(o.clone(),{transparent:true});B.occFaded36.add(m);}
 for(const m of [...B.occFaded36]){const u=m.userData;if(!u.occ36){B.occFaded36.delete(m);continue;}const t=want.has(m)?B.OCC.to:1;let op=1;
  for(const x of mats(m)){if(x.opacity===undefined)continue;x.transparent=true;x.opacity+=(t-x.opacity)*k;if(Math.abs(x.opacity-t)<0.01)x.opacity=t;x.depthWrite=x.opacity>0.6;op=x.opacity;}
  if(!want.has(m)&&(!on||op>=1)){for(const x of mats(m))x.dispose&&x.dispose();m.material=u.occ36.orig;delete u.occ36;B.occFaded36.delete(m);}}
 if(!on&&!B.occFaded36.size)B.occ36=null;}

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
 else if(B.state==='choosing'){L.state='choosing';L.pos=[B.pose.x,B.pose.z];L.yaw=B.pose.yaw;L.pick=B.choice;}   // the browsed arrangement is only the chooser's (the placed one stays in choice)
 else if(B.state==='settling'||B.state==='seated'||B.state==='placed')L.state='placed';
 if(B.state!=='choosing')delete L.pick;L.mover=B.mover;}
// wrap: the bench's runtime pose and state go into S.life.bench36 on every save (ready and carrying are written as grounded at the pose)
const prevSave36=save;save=function(){try{benchSync36();}catch(e){}return prevSave36.apply(this,arguments);};
function benchTeardown36(){const B=BENCH36;benchDropMesh36();benchChooserClose36();benchArrows36(null);B.state='off';B.holder=[null,null];benchResetMotion36();B.paused=false;B.glide=null;B.settle=null;B.seatTarget=null;B.seatDay=null;
 B.stuck=false;B.stuckT=0;B.override=null;B.notePending=false;B.okCache=null;B.jobs=null;B.liftKey='';B.xray=null;B.bumpMsg=null;B.cam=[null,null];B.camInfo=null;B.grid=null;B._gb=null;B.delivered=false;B.snap=null;B.y=0;B.liftT=0;B.liftDir=0;B.repKeep=null;benchFindClear36(true);benchPill36();benchBusyClass36();}
function benchLoad36(){const B=BENCH36;if(!S||!S.p)return;const L=benchSave36(),it=benchItem36();
 if(!L&&!it)return;
 if(L&&L.state==='off'&&!it)return;                                            // left with Ada for now: nothing in the world until the Menu offer is used
 if(L&&L.state==='placed'&&!it){S.home.items.push({id:'i'+(++S.home.seq),type:'bench',x:0,y:FLAT.rows,rot:0,pose36:benchKey36(L.choice)||'out'});}
 if(L&&it&&!L.state)L.state='placed';
 if(it&&!B.POSES[it.pose36])it.pose36='out';
 if(!L||L.state==='placed'){B.state='placed';if(typeof NET==='undefined'||!NET.on){benchFlagFresh36();}rebuildFurniture();return;}
 B.mover=L.mover||0;B.choice=(L.state==='choosing'&&benchKey36(L.pick))||benchKey36(L.choice)||'out';B.stats={dur:0,bumps:0,setdowns:0,swaps:0,resets:0,lifted:false};B.progress=0;
 B.pose={x:(L.pos||[B.START.x,B.START.z])[0],z:(L.pos||[B.START.x,B.START.z])[1],yaw:+L.yaw||0};
 if(!benchLocal36()){B.state=L.state==='choosing'?'choosing':'grounded';B.paused=true;if(typeof NET!=='undefined'&&NET.on&&L.again){L.again=false;benchUnkeep36(L);L.state='placed';B.state='placed';B.paused=false;}rebuildFurniture();return;}
 benchGridBuild36();
 if(L.state==='choosing'){B.state='choosing';benchBuildMesh36();B.corner=B.ROUTE.length-1;B.okCache=null;benchChooserOpen36();rebuildFurniture();benchHUD36();return;}
 B.state='grounded';
 benchNudgeOut36(benchBox36(B.pose,0),B.pose);
 if(!bench36Valid(B.pose)||!bench36Liftable(B.pose,[benchPos36(0),benchPos36(1)])){B.pose=benchSpawnSpot36();B.GATE_SPOTS.forEach(([x,z],i)=>{const s=benchRing36(x,z,benchBox36(B.pose,0))||[x,z];benchPlace36(i,s[0],s[1]);});}
 benchBuildMesh36();B.corner=benchCornerFor36();rebuildFurniture();benchHUD36();}
// wrap: entering the world stands the pair up, clears the runtime bench, then rebuilds it from the save (a load never refuses)
const prevEnter36=enterWorld;enterWorld=function(){bench36StandUp();benchTeardown36();const r=prevEnter36.apply(this,arguments);try{benchLoad36();}catch(e){if(typeof console!=='undefined')console.warn('bench36 load',e);}return r;};
// wrap: the shared household document carries only a placed bench's arrangement
const prevStrip36=stripState;stripState=function(){const o=prevStrip36.apply(this,arguments);if(o&&o.life&&o.life.bench36){const b=o.life.bench36,it=o.home&&o.home.items?o.home.items.find(x=>x.type==='bench'):null;
 if(b.state==='placed')o.life.bench36={v:b.v||1,state:'placed',choice:(it&&BENCH36.POSES[it.pose36]?it.pose36:b.choice)||'out'};else delete o.life.bench36;}return o;};

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
 // two humans on one device only: a companion or online household is told why, once the bench is due (day 2 with the sofa in) and not yet home
 if(!local){const placed=!!(L&&L.state==='placed')||(!L&&!!it),due=!placed&&!!(S.sofa&&S.sofa.state==='placed')&&(S.day>=2||!!B.flags);
  if(typeof AI!=='undefined'&&AI.on){if(due)h+=`<div class="card small bench36-menu">Ada’s bench needs two pairs of hands: one to walk it, one to turn it.<div class="actions">${btn('Play this with two players on this device','bench36Duo',{},'primary')}</div></div>`;}
  else if(typeof NET!=='undefined'&&NET.on&&(due||(L&&!placed&&L.state!=='off')))h+=`<div class="card small bench36-menu">Carry Ada’s bench when you are both on one device.</div>`;return h;}
 if(B.state==='off'&&(!L||L.state==='off')&&!it){if(benchAvailable36())h+=`<div class="card small bench36-menu">Ada left her bench at your gate. Carry it in together: one walks it, one turns it.<div class="actions">${btn('We’ll fetch it','bench36Start',{},'primary')}${L&&L.duo?btn('Back to my companion','bench36Solo',{},'quiet'):''}</div></div>`;else if(L&&L.duo)h+=`<div class="actions bench36-menu">${btn('Back to my companion','bench36Solo',{},'quiet')}</div>`;return h;}
 let b='';
 if(B.state==='placed'||B.state==='seated')b+=btn('Carry Ada’s bench again','bench36Again',{},'quiet');
 if(benchOpen36()&&L&&L.again&&B.state!=='settling')b+=btn('Leave the bench where it was','bench36Cancel',{},'quiet');
 if(benchOpen36()&&L&&!L.again&&B.state!=='settling')b+=btn('Leave the bench for now','bench36Leave',{},'quiet');
 if(B.state==='ready'||B.state==='carrying'||B.state==='choosing')b+=btn('Pause delivery and explore','bench36Pause',{},'quiet');
 if(B.state==='grounded'&&!B.paused)b+=btn('Find the bench','bench36Find',{},'quiet');
 if(B.state==='grounded'||B.state==='ready'||B.state==='carrying')b+=btn('Bench stuck? Put it back','bench36Reset',{},'quiet');
 if(B.state==='choosing')b+=btn('Put it down in the room for now','bench36RoomDown',{},'quiet');
 if(L&&L.playtest)b+=btn('Bench runs','bench36Runs',{},'quiet');
 if(L&&L.duo&&B.state!=='settling')b+=btn('Back to my companion','bench36Solo',{},'quiet');
 return b?`<div class="actions bench36-menu">${b}</div>`:'';}
// wrap (outermost): the bench lines go at the top of the Menu, just under "Your day in Palm Court", where a stuck pair finds them at once
const prevMenu36=openMenu;openMenu=function(){const r=prevMenu36.apply(this,arguments);if(typeof silentMode==='function'&&silentMode())return r;const h=benchMenuHTML36();if(!h)return r;
 if(typeof panel==='undefined'||!panel)return r;const top=panel.querySelector?panel.querySelector('[data-act="lifeTab"]'):null;
 if(top&&top.insertAdjacentHTML)top.insertAdjacentHTML('afterend',h);else if(panel.insertAdjacentHTML&&panel.querySelector&&panel.querySelector('h2'))panel.insertAdjacentHTML('afterbegin',h);
 else if(typeof panel.innerHTML==='string')panel.innerHTML=h+panel.innerHTML;return r;};
ACTIONS.bench36Start=function(){closePanel();bench36Start();};
ACTIONS.bench36Again=function(){closePanel();if(!bench36Again())benchToast36('Ada’s bench cannot be carried again just now.');};
ACTIONS.bench36Cancel=function(){closePanel();bench36Cancel();};
ACTIONS.bench36Leave=function(){closePanel();bench36Leave();};
ACTIONS.bench36Reset=function(){closePanel();const B=BENCH36;B.snap=null;if(B.state==='carrying'){B.glide=null;B.holder=[null,null];benchResetMotion36();B.y=0;B.liftT=0;B.liftDir=0;benchSetState36('grounded');}bench36Reset();};
ACTIONS.bench36RoomDown=function(){closePanel();bench36RoomDown();};
ACTIONS.bench36Runs=function(){const L=benchSave36(),runs=(L&&L.runs)||[];openPanel(`<h2>Bench runs</h2>${runs.length?'<ol class="small">'+runs.map((r,k)=>`<li>Delivery ${k+1}: ${Math.floor(r.dur/60)}:${String(r.dur%60).padStart(2,'0')}, ${r.bumps} bump${r.bumps===1?'':'s'}, ${r.setdowns} set-down${r.setdowns===1?'':'s'}, ${r.swaps} swap${r.swaps===1?'':'s'}, ${r.resets} reset${r.resets===1?'':'s'}</li>`).join('')+'</ol>':'<p class="muted small">No deliveries yet.</p>'}<div class="actions">${btn('Back','close',{},'primary')}</div>`);};
if(typeof LOCAL_ONLY!=='undefined')for(const n of ['bench36Start','bench36Again','bench36Cancel','bench36Leave','bench36Reset','bench36RoomDown','bench36Runs'])LOCAL_ONLY.add(n);

/* ---------- 6.4 The evening and Ada's lines ---------- */
if(typeof EVENING35!=='undefined'&&typeof EVENING35.start==='function'){const prevStart36=EVENING35.start;
 // wrap: the neighbours do not start their evening visit while the bench is in someone's hands or being placed (their own retry picks it up
 // later); a bench left lying on the ground, or paused while online, does not hold the evening back
 EVENING35.start=function(){if(benchBusy36())return false;return prevStart36.apply(this,arguments);};}
if(typeof line35==='function'){const prevLine36=line35;
 // wrap: Ada thanks the pair once for carrying her bench in (placed today or yesterday), and her day-6 bench musing follows the delivery
 line35=function(who,ctx){const L=benchSave36();
  if(who==='ada'&&L&&!(ctx&&ctx.evening)){
   if(L.state==='placed'&&L.placedDay!==null&&(S.day===L.placedDay||S.day===L.placedDay+1)&&!L.adb){const used=S.life&&S.life.lines35&&S.life.lines35.day===S.day&&S.life.lines35.used&&S.life.lines35.used.ada||[];
    if(!used.includes('adb36')){L.adb=S.day;return {id:'adb36',text:'You carried it in yourselves? Through that passage? Then it is yours twice. Sit, sit. Gist is better sitting down.'};}}}
  const t=prevLine36.apply(this,arguments);
  if(t&&t.id==='ad36'&&L&&!(ctx&&ctx.evening)&&L.state!=='off')t.text=L.state==='placed'?'That bench is happier on your veranda than it ever was in my head. Long enough for everybody, short enough to argue on.':'Did you see it at your gate? Bring it in before somebody sits on it in the street.';
  return t;};}

/* ---------- 10. Round 2: ideas from build v36-70429384, in our own code (docs/PROVENANCE.md lists each one) ---------- */
// The listeners the module adds, kept in one list (the harness registers them again into its own recorder: Node's addEventListener does nothing)
// 10.1 An OS key repeat on an Act key (E, or Enter, / and Shift for Player 2) is never a fresh press while the bench is in play: the capture
// listener notes the latch before the base keydown sets it, and the listener after it puts the latch back. Nothing is stopped, so every other
// listener still sees the key.
function benchActKey36(k){return k==='e'||k==='E'?0:(k==='Enter'||k==='/'||k==='Shift')?1:-1;}
function benchRepeatScope36(i){const s=BENCH36.state;if(s==='off')return false;if(s!=='placed')return true;
 const h=typeof hotspotCache!=='undefined'?hotspotCache[i]:null;return !!(h&&String(h.id).slice(0,7)==='bench36');}   // a placed bench: only where Act would sit
function benchKeyCap36(e){BENCH36.repKeep=null;if(!e||!e.repeat||typeof act==='undefined')return;const i=benchActKey36(e.key);if(i<0||!benchRepeatScope36(i))return;BENCH36.repKeep=[i,act[i]];}
function benchKeyBub36(e){const r=BENCH36.repKeep;if(!r)return;BENCH36.repKeep=null;if(e&&e.repeat){act[r[0]]=r[1];BENCH36.repeats=(BENCH36.repeats||0)+1;}}
// 10.2 Losing focus (the window blurs, or the page is hidden) lets go of everything held: keys, both sticks, the Act latches, the bench's raw
// inputs, latches and velocities. A carried bench stops where it is, still held.
function benchBlur36(){const B=BENCH36;if(B.state==='off'||B.state==='placed')return;
 if(typeof keys!=='undefined')for(const k in keys)keys[k]=false;
 if(typeof sticks!=='undefined')for(const s of sticks)s.v=[0,0];
 if(typeof document!=='undefined'&&document.getElementById)for(const id of ['stl','str']){const st=document.getElementById(id);if(st&&st.style){st.style.display='none';const n=st.querySelector&&st.querySelector('.nub');if(n&&n.style)n.style.transform='translate(-50%,-50%)';}}
 if(typeof act!=='undefined'){act[0]=false;act[1]=false;}B.repKeep=null;
 B.raw=[[0,0],[0,0]];B.latch=[null,null];B.vel.s=0;B.vel.w=0;B.outT=[0,0];B.relT=[9,9];B.pick=[{x:0,t:0},{x:0,t:0}];B.letGoT=0;B.standT=0;B.blurs=(B.blurs||0)+1;}
function benchVis36(){if(typeof document!=='undefined'&&(document.hidden||document.visibilityState==='hidden'))benchBlur36();}
BENCH36.listeners=[['window','keydown',benchKeyCap36,true],['window','keydown',benchKeyBub36,false],['window','blur',benchBlur36,false],['document','visibilitychange',benchVis36,false]];
if(typeof window!=='undefined'&&window.addEventListener)for(const [tg,t,f,c] of BENCH36.listeners){const T=tg==='document'?(typeof document!=='undefined'?document:null):window;if(T&&T.addEventListener)T.addEventListener(t,f,c);}

// 10.3 The game clock stops while the bench is busy: carried by both, in the chooser and while it glides home. It runs while the bench lies
// untouched, while one player holds an end or walks off, and while they sit, so the evening still comes. (Only the loop's per-frame call
// comes through here: passTime keeps the original, so an activity still takes its time.)
function benchClockHeld36(){const B=BENCH36,s=B.state;return !B.paused&&(s==='carrying'||s==='choosing'||s==='settling');}
const prevClock36=advanceClock33;advanceClock33=function(h){if(benchClockHeld36()){BENCH36.heldClock=(BENCH36.heldClock||0)+(+h||0);return;}return prevClock36.apply(this,arguments);};

// 10.4 The wayfinding pill steps out of sight while the bench is in hands, in the chooser, gliding or sat on, and comes back exactly as it was
// (its own tick keeps writing its text and display underneath; only visibility is held)
function benchPill36(){const el=typeof lifeGuideEl34!=='undefined'?lifeGuideEl34:null;if(!el||!el.style)return;const B=BENCH36,s=B.state;benchPillText36(el);
 const hide=!B.paused&&(s==='ready'||s==='carrying'||s==='choosing'||s==='settling'||s==='seated');
 if(hide&&!B.pillHid){const a=el.getAttribute?el.getAttribute('aria-hidden'):null;B.pillHid={v:typeof el.style.visibility==='string'?el.style.visibility:'',a};el.style.visibility='hidden';if(el.setAttribute)el.setAttribute('aria-hidden','true');}
 else if(!hide&&B.pillHid){const k=B.pillHid;B.pillHid=null;el.style.visibility=k.v;if(k.a===null||k.a===undefined){if(el.removeAttribute)el.removeAttribute('aria-hidden');}else if(el.setAttribute)el.setAttribute('aria-hidden',k.a);}}

// (round 3, RP-10) marked with Find, the bench is reached at an end, not 2 m from its centre: until a player is within TAKE of an end the pill
// says to walk to one (the pill's own ticks write "You’re here. Use Act." within 2 m of the marker; this runs after them, in the camera step)
function benchPillText36(el){const B=BENCH36,w=typeof LIFE34!=='undefined'?LIFE34.waypoint:null;if(!w||!w.bench36||B.state!=='grounded'||!el.querySelector)return;const span=el.querySelector('span');if(!span)return;
 const h=span.innerHTML;if(typeof h!=='string'||h.indexOf('You’re here. Use Act.')<0)return;const ends=[benchEnd36(B.pose,0),benchEnd36(B.pose,1)];
 if(players.some(p=>p&&!(typeof AI!=='undefined'&&AI.on&&p.i===AI.i)&&ends.some(e=>Math.hypot(p.g.position.x-e[0],p.g.position.z-e[1])<=B.TAKE)))return;span.innerHTML=h.replace('You’re here. Use Act.','Walk to an end and take it.');}
// 10.5 For the two of you (round 2b: our own kicker, no longer the wording of build v36-70429384): a card at the top of the Today page (Tasks) while the bench waits for the pair (the Menu's top lines are in benchMenuHTML36)
function benchTodayCard36(){if(!S||!S.p)return '';const B=BENCH36,L=benchSave36(),it=benchItem36(),placed=!!(L&&L.state==='placed')||(!L&&!!it);
 const due=!placed&&!!(S.sofa&&S.sofa.state==='placed')&&(S.day>=2||!!B.flags);let text='',b='';
 if(typeof NET!=='undefined'&&NET.on){if(!due)return '';text='Carry Ada’s bench when you are both on one device.';}
 else if(typeof AI!=='undefined'&&AI.on){if(!due)return '';text='One of you walks it and one turns it. Your companion can’t take an end, so this one is for two players on this device.';b=btn('Play this with two players on this device','bench36Duo',{},'primary');}
 else if(B.state==='off'&&(!L||L.state==='off')&&!it){if(!benchAvailable36())return '';text='Ada left her bench at your gate. Carry it in together: one walks it, one turns it.';b=btn('We’ll fetch it','bench36Start',{},'primary');}
 else if(B.state==='grounded'&&!B.paused){text=B.progress>0||B.delivered?'It is down where you left it. Walk back and take an end each.':'It is waiting at your gate. Take an end each.';b=btn('Find the bench','bench36Find',{},'quiet');}
 else if(!(L&&L.duo))return '';
 if(L&&L.duo){if(!text)text='Sit on it together, then hand the controls back to your companion.';b+=btn('Back to my companion','bench36Solo',{},'quiet');}
 return `<div class="life-note34 bench36-card"><p class="life-kicker">FOR THE TWO OF YOU</p><h3>Ada’s bench needs two pairs of hands</h3><p>${text}</p>${b}</div>`;}
if(typeof todayHTML34==='function'){const prevToday36=todayHTML34;todayHTML34=function(){const h=prevToday36.apply(this,arguments);if(typeof h!=='string')return h;
 const c=benchTodayCard36();if(!c)return h;   // first after the page's hero, where it is seen without scrolling (else before the chips)
 const hp=h.indexOf('<div class="hero-plant34">'),he=hp<0?-1:h.indexOf('</div></div>',hp);if(he>=0)return h.slice(0,he+12)+c+h.slice(he+12);
 const at=h.indexOf('<div class="life-chips34">');return at<0?h:h.slice(0,at)+c+h.slice(at);};}

// (round 3, RP-7) while the first-evening guide is on, Tasks opens its journal, not the Today page: the bench card goes in the journal too, under
// its heading, whenever the Today page would show it
{const prevPanel36=openPanel;openPanel=function(html){if(typeof html==='string'&&html.indexOf('<div class="evening33">')===0){const c=benchTodayCard36();
  if(c){const at=html.indexOf('<div class="evening-progress"');html=at>0?html.slice(0,at)+c+html.slice(at):html.replace('<div class="evening33">','<div class="evening33">'+c);}}
 return prevPanel36.apply(this,[html].concat([].slice.call(arguments,1)));};}
// 10.6 The chooser by touch: ◀ and ▶ and each player's "agrees" are buttons (the strip's own pointerdown, so a re-render between press and
// release never loses a tap); the ghost is drawn in the role yellow when the arrangement is free (red when not), with an outline at seat
// height and an arrow the way the seat faces, both seen through the parapet, and the other two arrangements as faint outlines
BENCH36.COL.nofree='#E0704F';
function benchStripTap36(e){const t=e&&e.target&&e.target.closest?e.target.closest('[data-act]'):null;if(!t||!t.dataset)return;const a=t.dataset.act;if(a!=='bench36Pick'&&a!=='bench36Vote')return;
 if(e.preventDefault)e.preventDefault();if(e.stopPropagation)e.stopPropagation();if(typeof dispatch==='function')dispatch(a,Object.assign({},t.dataset));else ACTIONS[a](Object.assign({},t.dataset));}
function benchPick36(sg){const B=BENCH36;if(B.state!=='choosing')return false;const k=B.ORDER.indexOf(B.choice);B.choice=B.ORDER[(k+(sg<0?-1:1)+B.ORDER.length)%B.ORDER.length];
 B.agree=[false,false];B.autoPick=false;benchArrNow36(B.choice);benchShowGhost36();benchChooserRender36();benchHUD36();return true;}
function benchOutline36(color,opacity){const B=BENCH36,hx=B.HX,hz=B.HZ,pts=[[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]].map(([x,z])=>new THREE.Vector3(x,0,z));
 const l=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthTest:false,depthWrite:false}));l.renderOrder=996;return l;}
function benchGhostAux36(){const B=BENCH36;if(B.mesh.aux||typeof scene==='undefined'||!scene)return B.mesh.aux;const g=new THREE.Group();g.name='bench36-ghost-aux';g.userData.outlines={};
 for(const k of B.ORDER){const o=benchOutline36('#F1E4CC',0.35);o.name='bench36-outline';g.add(o);g.userData.outlines[k]=o;}
 g.userData.frame=benchFrame36();g.add(g.userData.frame);                                        // 11.5 the chosen one's broad outline
 const sh=new THREE.Shape();sh.moveTo(-0.07,0);sh.lineTo(0.07,0);sh.lineTo(0.07,0.12);sh.lineTo(0.2,0.12);sh.lineTo(0,0.44);sh.lineTo(-0.2,0.12);sh.lineTo(-0.07,0.12);sh.closePath();
 const ar=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:B.COL.move,transparent:true,opacity:0.9,depthTest:false,depthWrite:false,side:THREE.DoubleSide}));ar.rotation.x=Math.PI/2;ar.renderOrder=997;
 const arG=new THREE.Group();arG.name='bench36-seat-arrow';ar.position.z=0.34;arG.add(ar);g.add(arG);g.userData.arrow=arG;g.userData.arrowMesh=ar;scene.add(g);B.mesh.aux=g;return g;}
function benchGhostLook36(){const B=BENCH36,g=B.mesh.ghost;if(!g||!B.mesh)return;const ok=!(B.okCache&&B.okCache[B.choice]===false),col=ok?B.COL.move:B.COL.nofree;B.ghostCol=col;
 g.traverse(o=>{if(o.isMesh&&o.material){o.material.color.set(col);o.material.opacity=0.86;if(o.material.emissive){o.material.emissive.set(col);o.material.emissiveIntensity=0.55;}}});   // 11.5 the body itself in the role colour
 const A=benchGhostAux36();if(!A)return;A.visible=g.visible;const Y=0.05+BENCH36.SEAT+0.02;
 for(const k of B.ORDER){const o=A.userData.outlines[k],p=benchPoseOf36(k),sel=k===B.choice;o.position.set(p.x,Y+(sel?0.01:0),p.z);o.rotation.y=p.yaw;o.material.color.set(sel?col:'#F1E4CC');o.material.opacity=sel?1:0.35;o.renderOrder=sel?998:996;}
 const p=benchPoseOf36(B.choice),ag=A.userData.arrow;ag.position.set(p.x,Y,p.z);ag.rotation.y=p.yaw;A.userData.arrowMesh.material.color.set(col);
 const fr=A.userData.frame;if(fr){fr.position.set(p.x,Y+0.012,p.z);fr.rotation.y=p.yaw;fr.children.forEach(m=>m.material.color.set(col));}}

// 10.7 Pause delivery and explore, Find the bench. A pause sets the bench down with the safe set-down (which may refuse, saying why) and
// ends the delivery's hold on both players' keys; in the chooser it leaves the bench in the doorway (or puts it down in the room). Carrying on
// is walking back and taking an end. Find marks the bench with the life destination marker until either player takes an end.
function benchPauseDelivery36(){const B=BENCH36,s=B.state;if(B.paused)return false;
 if(s==='carrying'){if(B.glide)return true;return benchSafeDown36(null,'pause');}
 if(s==='ready'){const e=B.holder[0]!==null?0:1,i=B.holder[e];if(i===null||!benchLetGo36(i))return false;benchPaused36();return true;}
 if(s==='choosing'){benchHideGhost36();benchChooserClose36();const pos=[benchPos36(0),benchPos36(1)];
  if(bench36Valid(B.pose)&&bench36Liftable(B.pose,pos)){B.delivered=false;B.agree=[false,false];B.holder=[null,null];benchSetState36('grounded');benchDrawMesh36();benchPaused36();return true;}
  if(bench36RoomDown()){benchPaused36();return true;}return false;}
 return false;}
function benchPaused36(){const L=benchSave36();benchToast36('The bench is down. Walk back and take an end each when you’re ready.');save();if(L&&L.duo)benchSolo36();}
function benchFind36(){const B=BENCH36;if(B.state!=='grounded'||B.paused||typeof LIFE34==='undefined')return false;const w0=LIFE34.waypoint;if(!(w0&&w0.bench36))B.findPrev36=w0||null;   // round 3 (L2): the player's own destination comes back afterwards
 LIFE34.waypoint={x:B.pose.x,z:B.pose.z,name:'Ada’s bench',bench36:true};B.finding=true;
 if(typeof refreshMarker34==='function')refreshMarker34();benchToast36('Ada’s bench is marked. Follow the distance on screen.');return true;}
function benchFindClear36(drop){const B=BENCH36;if(!B.finding)return;B.finding=false;const prev=B.findPrev36||null;B.findPrev36=null;if(typeof LIFE34==='undefined')return;const w=LIFE34.waypoint;if(w&&w.bench36){LIFE34.waypoint=drop?null:prev;if(typeof refreshMarker34==='function')refreshMarker34();}}
// a reset moves the bench: the marker follows it
{const prevReset36=bench36Reset;bench36Reset=function(){const r=prevReset36.apply(this,arguments);const B=BENCH36;if(r&&B.finding&&typeof LIFE34!=='undefined'&&LIFE34.waypoint&&LIFE34.waypoint.bench36){LIFE34.waypoint={x:B.pose.x,z:B.pose.z,name:'Ada’s bench',bench36:true};if(typeof refreshMarker34==='function')refreshMarker34();}return r;};}

// 10.8 A companion household can carry it with two players on this device, and gets its companion back afterwards. The switch is written
// into the bench's own save ({v, ai, i, pos, day} under duo), so a reload mid-switch comes back as two players with the way back in the Menu
// and on the Today page. The companion is restored (S.ai, AI.on, AI.i, its position, the split views) when the pair stand up from the placed
// bench, when a day ends with it placed, when the delivery is paused, left for now or cancelled, or from "Back to my companion".
function benchDuo36(){if(!S||!S.p||typeof AI==='undefined'||!AI.on||(typeof NET!=='undefined'&&NET.on))return false;const B=BENCH36,i=AI.i,p=players[i];life34();let L=benchSave36();
 if(!L)L=S.life.bench36={v:1,state:'off',pos:[B.START.x,B.START.z],yaw:0,mover:0,choice:'out',deliveries:0,again:false,hints:0,placedDay:null,playtest:false,runs:[]};
 L.duo={v:1,ai:!!S.ai,i,pos:p?[p.g.position.x,p.g.position.z]:null,day:S.day};
 S.ai=false;aiRestore();save();benchHUD36();
 benchToast36(`Two players on this device: ${benchPlayerName36(1)} uses the arrow keys and Enter (or the right thumb).`);
 if(B.state==='off'||B.state==='placed')bench36Start();                     // a placed bench is carried again (bench36Start hands it to bench36Again)
 return true;}
function benchSolo36(){const B=BENCH36,L=benchSave36(),d=L&&L.duo;if(!d||!S||!S.p||(typeof NET!=='undefined'&&NET.on))return false;
 if(B.state==='settling')return false;
 if(B.state==='seated')bench36StandUp();
 if(B.state==='carrying'||B.state==='ready'||B.state==='choosing'){if(B.state==='carrying'&&B.glide)return false;const keep=L.duo;delete L.duo;const ok=benchPauseDelivery36();L.duo=keep;if(!ok)return false;if(B.state==='carrying')return true;}   // a short glide first: the hand-back follows its end (benchPaused36)
 benchFindClear36();delete L.duo;S.ai=d.ai!==false;if(typeof d.i==='number')AI.i=d.i;aiRestore();
 const i=AI.i,p=players[i];if(p&&d.pos){const box=bench36GroundBox();let q=d.pos;if(blocked(q[0],q[1],PR)||!carryLevelOK34(q[0],q[1]))q=benchRing36(q[0],q[1],box)||null;if(q)benchPlace36(i,q[0],q[1]);}
 save();benchHUD36();benchToast36(`${benchPlayerName36(i)} is keeping you company again.`);return true;}
function benchStoodUp36(){const L=benchSave36();if(L&&L.duo&&BENCH36.state==='placed')benchSolo36();}
for(const n of ['nextday','sleep']){const prev=ACTIONS[n];if(typeof prev!=='function')continue;ACTIONS[n]=function(){const r=prev.apply(this,arguments);benchStoodUp36();return r;};}

ACTIONS.bench36Pause=function(){closePanel();benchPauseDelivery36();};
ACTIONS.bench36Find=function(){closePanel();benchFind36();};
ACTIONS.bench36Pick=function(d){benchPick36(+(d&&d.v)||1);};
ACTIONS.bench36Vote=function(d){benchAgree36(+(d&&d.i)===1?1:0);};
ACTIONS.bench36Duo=function(){closePanel();benchDuo36();};
ACTIONS.bench36Solo=function(){closePanel();if(!benchSolo36())benchToast36('Set the bench down first.');};
if(typeof LOCAL_ONLY!=='undefined')for(const n of ['bench36Pause','bench36Find','bench36Pick','bench36Vote','bench36Duo','bench36Solo'])LOCAL_ONLY.add(n);

/* ---------- 11. Round 2 leftovers ---------- */
// 11.3 A holder never pins the other player in. A player holding one end on the ground stands still at its stand point, and a person does not
// walk through their partner, so a holder's body counts as a disc of HR+PR there for the other player's walk. The liftable rule (above) asks
// for an order in which the two can take the ends; whoever would take an end first such that the other could no longer get round to theirs
// (when another order works) is asked to leave that end; and while one holds it on the ground and their body is all that keeps the other
// from the free end, the holder is asked to let go, and lets go by themselves after PINWAIT seconds.
BENCH36.PINWAIT=2.5;
// the walk grid with the bench on the ground at pose (h -1), or also a holder's body at end h; kept for the last pose and world
function benchHeldGrid36(pose,h){const B=BENCH36,G=BENCH_GRID36,g=benchGrid36(),key=pose.x+','+pose.z+','+pose.yaw+'|'+g.sig;
 if(!B.held36||B.held36.key!==key)B.held36={key,w:{}};const c=B.held36;if(c.w[h])return c.w[h];
 let w;if(h<0)w=benchGridWith36(benchBox36(pose,0));
 else{w=benchHeldGrid36(pose,-1).slice();const [x,z]=benchEnd36(pose,h),R=B.HR+PR,R2=R*R;
  const i0=Math.max(0,Math.floor((x-R-G.x0)/G.s)),i1=Math.min(G.nx-1,Math.ceil((x+R-G.x0)/G.s)),j0=Math.max(0,Math.floor((z-R-G.z0)/G.s)),j1=Math.min(G.nz-1,Math.ceil((z+R-G.z0)/G.s));
  for(let i=i0;i<=i1;i++){const dx=G.x0+i*G.s-x;for(let j=j0;j<=j1;j++){const dz=G.z0+j*G.s-z;if(dx*dx+dz*dz<R2)w[i*G.nz+j]=1;}}}
 c.w[h]=w;return w;}
// a player standing in the holder's disc (people can overlap) starts their walk from its edge, on their own side
function benchFromHeld36(p,pose,h){const [x,z]=benchEnd36(pose,h),R=BENCH36.HR+PR+0.05,dx=p[0]-x,dz=p[1]-z,d=Math.hypot(dx,dz);if(d>=R)return p;
 let ux,uz;if(d>1e-6){ux=dx/d;uz=dz/d;}else{const a=benchAxis36(pose.yaw),sg=h?1:-1;ux=a[0]*sg;uz=a[1]*sg;}return [x+ux*R,z+uz*R];}
// does the player at p reach end e (a free cell within TAKE of its stand point) with a holder at end h?
function benchReachHeld36(pose,p,e,h){return benchReachPts36(benchHeldGrid36(pose,h),benchFromHeld36(p,pose,h),[benchEnd36(pose,e)],BENCH36.TAKE)[0];}
// plain[i][e]: player i reaches end e with nobody holding. An order works when one player can take their end first and the other then
// still reaches theirs past the first one's body.
function benchOrderOK36(pose,pos,plain){for(const m of [[0,1],[1,0]]){if(!(plain[0][m[0]]&&plain[1][m[1]]))continue;
  for(const f of [0,1]){const s=1-f;if(benchReachHeld36(pose,pos[s],m[s],m[f]))return true;}}return false;}
// would player i taking end e (nobody holding yet) shut the other player out, when another order of taking the ends would not?
function benchTakeBoxes36(i,e){const B=BENCH36,j=1-i,pose=B.pose,pos=[benchPos36(0),benchPos36(1)];if(!players[j])return false;
 if(benchReachHeld36(pose,pos[j],1-e,e))return false;
 const w=benchHeldGrid36(pose,-1),ends=[benchEnd36(pose,0),benchEnd36(pose,1)],r=[0,1].map(k=>benchReachPts36(w,pos[k],ends,B.TAKE));
 if(r[i][1-e]&&r[j][e]&&benchReachHeld36(pose,pos[j],e,1-e))return true;      // i at the other end first, then j at this one
 if(r[j][1-e]&&r[i][e]&&benchReachHeld36(pose,pos[i],e,1-e))return true;      // j first at the other end, then i here
 if(r[j][e]&&r[i][1-e]&&benchReachHeld36(pose,pos[i],1-e,e))return true;      // j first here, then i at the other end
 return false;}
// the same, kept while nobody moves more than a quarter metre (the prompt and the Act read the same answer)
function benchTakeBoxesC36(i,e){const B=BENCH36,q=v=>Math.round(v/0.25),key=[B.pose.x,B.pose.z,B.pose.yaw,i,e].join(',')+'|'+[0,1].map(k=>{const p=benchPos36(k);return q(p[0])+','+q(p[1]);}).join(';')+'|'+(B.grid?B.grid.sig:'');
 const c=B.keep36||(B.keep36=new Map());if(c.has(key))return c.get(key);const v=benchTakeBoxes36(i,e);if(c.size>=8)c.delete(c.keys().next().value);c.set(key,v);return v;}
// one holds it on the ground: is the holder's body all that keeps the other player from the free end?
function benchPinned36(){const B=BENCH36;if(B.state!=='ready'||B.paused)return false;const e=B.holder[0]!==null?0:1,h=B.holder[e];if(h===null||h===undefined||!players[1-h])return false;
 const j=1-h,q=v=>Math.round(v/0.25),pj=benchPos36(j),key=[B.pose.x,B.pose.z,B.pose.yaw,e,h,q(pj[0]),q(pj[1]),B.grid?B.grid.sig:''].join(',');if(B.pinKey36===key)return B.pinV36;
 const f=1-e,v=!benchReachHeld36(B.pose,pj,f,e)&&benchReachPts36(benchHeldGrid36(B.pose,-1),pj,[benchEnd36(B.pose,f)],B.TAKE)[0];B.pinKey36=key;B.pinV36=v;return v;}
function benchPinStep36(dt){const B=BENCH36;if(B.pinAt36!==B.transT){B.pinAt36=B.transT;B.pinT36=0;}if(!benchPinned36()){B.pinT36=0;return;}B.pinT36+=dt;if(B.pinT36<B.PINWAIT)return;B.pinT36=0;
 const e=B.holder[0]!==null?0:1,h=B.holder[e];if(benchLetGo36(h))benchToast36(`${benchPlayerName36(h)} lets go, so ${benchPlayerName36(1-h)} can get round.`);}
// 11.3 a holder stepping back from their end at a set-down or a let-go lands on their own side of any wall: the nearest free ring point from
// which the straight step back to the stand point is clear (at most twelve looked at), else the nearest free one as before
function benchNudgeSpot36(sx,sz,box){let first=null,n=0;const ok=(a,b)=>{if(!benchFreeSpot36(a,b,box))return false;if(!first)first=[a,b];n++;return benchSlideClear36([a,b],[sx,sz]);};
 if(ok(sx,sz))return [sx,sz];
 for(let rad=0.1;rad<=0.601&&n<12;rad+=0.1)for(let k=0;k<16&&n<12;k++){const an=k/16*Math.PI*2,a=sx+Math.sin(an)*rad,b=sz+Math.cos(an)*rad;if(ok(a,b))return [a,b];}
 if(first)return first;return benchRing36(sx,sz,box);}
// 11.4 a cancelled "again" run leaves no trace: the first mover and the mover it started from come back (the playtest pre-swap reads them)
function benchUnkeep36(L){const k=L.keep36;if(!k)return;if(k.first===undefined)delete L.firstMover;else L.firstMover=k.first;L.mover=k.mover;delete L.keep36;}
// 11.5 the chooser ghost reads at a glance: the chosen arrangement gets a broad outline (four 5 cm strips round the seat at seat height, seen
// through the parapet) in the ghost's colour, besides the thin outlines and the larger seat arrow
function benchFrame36(){const B=BENCH36,g=new THREE.Group(),w=0.05,hx=B.HX,hz=B.HZ;g.name='bench36-frame';
 const mat=()=>new THREE.MeshBasicMaterial({color:B.COL.move,transparent:true,opacity:0.95,depthTest:false,depthWrite:false,side:THREE.DoubleSide});
 for(const [sx,sz,x,z] of [[2*hx+w,w,0,-hz],[2*hx+w,w,0,hz],[w,2*hz+w,-hx,0],[w,2*hz+w,hx,0]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(sx,sz),mat());m.rotation.x=-Math.PI/2;m.position.set(x,0,z);m.renderOrder=999;g.add(m);}
 return g;}
// 11.6 The chooser's frames, counted. The work in a frame is weighed in box tests (one gap of the glide planner): a blocked() call through the
// whole obstacle list weighs 3, one through the index below a quarter, a walk-grid cell 1/64 (measured ratios: in headless Chromium and in
// Node a gap takes about 5 microseconds, a full blocked() call 13-15, a cell under 0.1). No frame from the delivery to the bench in its place
// may weigh more than WORK.FRAME (1200, about 6 ms of the bench's own work). The arrangement check's reach run is the heavy part: its walk asks
// blocked() for every cell, so while it runs, blocked() answers from a bucket index of the same boxes (same answer, same order: the boxes
// that can touch a point within 0.5 m, then the furniture, the pushables and the bench, exactly as the base function and the wrapper above).
BENCH36.WORK={blocked:3,fast:0.25,cell:1/64,FRAME:1200};BENCH36.cost.fast=0;BENCH36.cost.aabb=0;
function benchWork36(a,b){const W=BENCH36.WORK,f=(b.fast||0)-(a.fast||0),bl=b.blocked-a.blocked-f;return (b.nodes-a.nodes)+(b.box-a.box)+W.blocked*bl+W.fast*f+W.cell*(b.cells-a.cells);}
// the index covers the walk grid's window (x -8.5..9.5, z -3..15.5) in 1 m cells; it is made again only when the obstacle list changes
function benchObsIndex36(){const B=BENCH36,G=BENCH_GRID36,M=0.5,C=1.0,x1=G.x0,z1=G.z0,nx=Math.ceil((G.nx-1)*G.s/C)+1,nz=Math.ceil((G.nz-1)*G.s/C)+1;
 let sig=OBS.length;for(const o of OBS)sig+=o.x1+3*o.z1+7*o.x2+11*o.z2+13*(o.lvl||0);if(B.obsIx36&&B.obsIx36.sig===sig&&B.obsIx36.n===OBS.length)return B.obsIx36;
 const cells=new Array(nx*nz);
 for(let k=0;k<OBS.length;k++){const o=OBS[k],ol=o.lvl||0;if(ol!==2&&ol!==0)continue;
  const i0=Math.max(0,Math.floor((o.x1-M-x1)/C)),i1=Math.min(nx-1,Math.floor((o.x2+M-x1)/C)),j0=Math.max(0,Math.floor((o.z1-M-z1)/C)),j1=Math.min(nz-1,Math.floor((o.z2+M-z1)/C));
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const n=i*nz+j;(cells[n]||(cells[n]=[])).push(k);}}
 return (B.obsIx36={sig,n:OBS.length,x1,z1,C,nx,nz,cells});}
function benchReachFast36(fn){const B=BENCH36,ix=benchObsIndex36(),keep=blocked;
 blocked=function(x,z,r,opts){if(!opts||!opts.noCrate||!opts.noSofa||opts.lvl||opts.noBench||opts.ignore||!(r>=0&&r<=0.5))return keep.apply(this,arguments);
  const i=Math.floor((x-ix.x1)/ix.C),j=Math.floor((z-ix.z1)/ix.C);if(i<0||j<0||i>=ix.nx||j>=ix.nz)return keep.apply(this,arguments);   // outside the window: the full list
  B.cost.blocked++;B.cost.fast++;const c=ix.cells[i*ix.nz+j];if(c)for(const k of c){const o=OBS[k];B.cost.aabb++;if(x+r>o.x1&&x-r<o.x2&&z+r>o.z1&&z-r<o.z2)return o;}
  for(const o of FURN_OBS){B.cost.aabb++;if(x+r>o.x1&&x-r<o.x2&&z+r>o.z1&&z-r<o.z2)return o;}
  for(const pb of PUSH){if(pb.lvl!==0||pb.gone)continue;const bx=pushBox(pb);if(x+r>bx.x1&&x-r<bx.x2&&z+r>bx.z1&&z-r<bx.z2)return bx;}
  const b=bench36GroundBox();return b&&bench36CircleOBB(x,z,r||0,b)?b:null;};
 try{return fn();}finally{blocked=keep;}}

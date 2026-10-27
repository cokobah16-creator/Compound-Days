// v36 Ada's bench (dist/src/bench-v36.js), checked on the real game logic in Node with the shipped Three.js. A local two-player household
// is made with the real setup actions, the sofa is placed, and the players are driven only through the game's own key state (P1 WASD and
// E, P2 the arrows and Enter) and the real tick, one frame at a time; the harness never calls the bench step and never sets the bench pose
// (players are placed by hand, as the other harnesses do, and saved games are loaded through save/load/enterWorld). Nothing is rendered:
// views are measured by projecting with the game's own cameras. Clock, rng, Date and performance.now are stubbed.
// The checks run twice in child processes and the two reports must match; each mutant (a one-place change to bench-v36.js in a copy of
// dist) reruns only its named check, which must fail. Prints one PASS or FAIL line per check and writes check/results-bench-v36.json.
// The control plan the delivery checks follow is check/bench-route-v36.json (tools/bench-route-v36.cjs; rerun it when the world changes).
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const OUT=path.join(__dirname,'results-bench-v36.json');
const GAME=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');process.env.COMPOUND_GAME_DIR=GAME;
const PLAN=JSON.parse(fs.readFileSync(path.join(__dirname,'bench-route-v36.json'),'utf8'));
const NAMES=[
 '1. Foundation: a local pair (two cameras, singleIdx -1) in which each player’s keys move only that player, also both at once; each player’s prompt shows beside their own view near a hotspot',
 '2. Inert until started: 3,000 seeded points give the same blocked() result, a 600-frame two-player walk leaves the save, the camera distances and the hotspot labels identical, and the save’s top-level keys, the tick hooks and the LINES35 counts match the build without bench-v36.js; the companion household’s Menu matches too, apart from the one line at its top saying the bench needs two players on one device; no bench mesh exists',
 '3. Both must participate: one player alone cannot move it; the mover’s keys only translate it along its axis and the turner’s only turn it about its centre (the turner’s forward keys move nothing); with the turner’s keys zeroed for 120 s the plan never reaches the passage, and with the mover’s zeroed the centre never moves',
 '4. Three consecutive deliveries by real keys through the gate, both corners and the doorway: no reset and the state sequence exactly the machine’s; the second with roles swapped before the lift, the third with four set-downs by alternating holders and a mid-route swap that changes the leading end; each under 240 s of game time; Out, Gate and Water placed; the saved item untouched until each new agreement; the fresh start moves the crate; the preflight refuses an armchair over the slot and a piece in the room lane, and Build refuses the lane while a delivery is open',
 '5. Walls are never passed: on every frame of checks 4, 6 and 7 and of a seeded fuzz (6 x 1,000 frames of random keys and Acts for both players from the five checkpoints and the doorway, each loaded where asked) an independent exact box test finds the bench clear of every wall, piece of furniture and the crate, and between carried frames within 0.1 mm; the holders stand clear on level ground at their squeezed-in radius, nobody steps to a stand point through a wall, and every frame of the glide, and every moment between its frames, is clear of the walls, the pot and both players',
 '6. Never trapped: every set-down the fuzz makes is one the harness’s own walk finds both players can lift (one at each end), every refusal one it finds they cannot, and nobody but a holder ever stands inside the grounded bench (also after a set-down the frame after the lift); a reset after a stall at corner 2 with both players in the room lands on a liftable checkpoint, never on the old room pose; with no checkpoint liftable the bench goes to the gate with the players; a save made mid-carry with the leading holder on the row reloads liftable or at the gate; a player waiting out on the street (south of z 11) neither makes a grounded bench stuck nor sends it back on a reload, and a set-down by the street gate is not refused for them',
 '7. Set down and swap anywhere: at 12 points along the plan the pair sets the bench down (alternating holders), swaps roles, lifts and carries on, the role lines and chips follow the swap, and the delivery completes',
 '8. Gentle stop at dt 1/60 and 1/30: pushed into a rail for 2 s, the bench moves at most 1 mm after first contact and then not at all, the holders’ walking flag does not flicker, at most one bump per 0.4 s, and the mesh recoil stays within 6 cm and returns to the pose; what meets the rail is the leading holder’s body at its squeezed-in 0.22 m (not a walking 0.33 m), so the dust rises beside that holder and both prompts say who is up against what',
 '9. Stuck and reset: held accepted keys against the corner-2 wall make it stuck in about 2.5 s and the hint shows in the holders’ prompts; a key held outside the cone for 5 s does not (and its arrow hint shows after 0.6 s); a set-down ends the stall (no hint, and a player at an end gets “Take this end”, never the reset); a grounded bench nobody can lift (the crate pushed onto an end) offers “Reset the bench” beside it, and Act puts it on a liftable checkpoint with the crate moved clear; the Menu reset works with the bench in the passage and sits at the top of the Menu',
 '10. Controls feel: a 100 ms tap moves at most 3 cm or turns at most 1.5 degrees, a release from full speed coasts at most 5 cm or 3 degrees, forward and back speeds are equal, one held key completes a 95-degree turn, and a Menu opened and closed mid-carry leaves the bench at rest',
 '11. Placement: Out, Gate and Water pass the arrangement rule with the default, chairs-at-(5,4) and armchair-at-(5,4) layouts and inside the first chooser (reach start free, a reach run each time); a candidate over the pot keep fails; a player in the way is moved clear before the bench goes; the ghost stands at the pose; one agreement does not commit and a change clears both; both agree gives the item and the day log line; with an armchair, chairs or a plant beside the doorway (cell 5,4) the bench still glides to each arrangement (in two legs), every frame and every move between frames clear',
 '12. Save and reload: a placed bench, a bench in the chooser and a bench saved mid-carry come back as they were (grounded and liftable for the carry); an old save gets nothing; a placed state with no item heals; online the shared document keeps only {v, state, choice}; ?bench=fresh applies once; Build cannot store or pick up the bench and shows neither button; browsing in a fresh delivery’s chooser never changes the saved arrangement, so “Leave the bench where it was” leaves the save, the shared document and the next run on the placed one; in playtest mode the next run starts from the job each player did not start the last one with',
 '13. Sitting: both sit facing the seat’s way (hips 0.61 m, feet on the floor, seats 0.72 m apart); the Menu opened and closed keeps them seated; a held key stands them up on free spots; past midnight and Start day nobody is sitting and both are in the room, and the save says so; a day change by any other route stands them up at the next panel close',
 '14. Split views keep prompts and visibility: at 1280x800 and 1280x720 at the five checkpoints of a delivery, in both views the bench, both holders and the next-corner point are inside the usable area, the corner point is kept, the smaller holder is at least 70 px tall and the prompt carries the right Move or Turn chip; the camera distance changes by at most 2.5% a frame; the ghost is in both views in the chooser; at 390x844 and 844x390 the corner point is dropped for the arrow, which points where that view draws the next corner (within 3 degrees) from the edge of its framed area, and the heights are recorded',
 '15. Modes: a holder’s pad disconnecting sets it down; online it is set down, paused and absent from blocked() and the scene, an open fresh delivery is cancelled, and back on one device a player who stood where it lay is moved clear (it stays put); a pair sitting on it stand up when the household goes online; a companion household sees no offer but the two-hands line from day 2 without any flag (and nothing spawns), an online one the one-device line; a first delivery can be left for now (gone, the offer back); the evening waits while the bench is in hands, starts with it lying on the ground or placed, its pending() untouched; Ada thanks them once after placement; LINES35 is untouched',
 '16. Hotspots: with each arrangement placed a player at the pepper pot’s own point gets the pot; a player at (-5.95, 6.4) gets “Sit on the bench together” or “Wait for …”; both players pressing Act at the same end on the same frame give one holder and the toast; a player whose step to the stand point would cut through the doorway jamb is asked to come round, and takes the end once straight on',
 '17. Per-frame cost: a carry sub-step makes at most 24 blocked() calls and 12 box tests, a carry frame at most 2 sub-steps, and an idle frame (no delivery, or the bench placed) no bench blocked() call at all; from the lift to the bench in its place no frame runs more than one arrangement check or more than the settle planner’s budget of box tests (counted, not timed), and the glide is planned while the pair chooses',
 '18. Glyph and page: after E and Enter presses the prompts show E and ⏎, not the pad’s A; while the bench is held the page is marked busy (the wayfinding pill and, on small screens, the Pantry card step aside), after the first two lifts the carry prompt is marked compact, the chooser marks the page for its top strip, and a see-through outline of the bench shows only while it is held'];
// one-place changes to bench-v36.js, each of which must turn its check red
const MUTANTS=[
 {name:'M1 bench36Valid always true',check:5,find:'function bench36Valid(pose,inflate){',replace:'function bench36Valid(pose,inflate){return true;'},
 {name:'M2 the mover’s input also turns the bench',check:3,find:'wT=Lt?Lt.sign*Math.min(1,Math.hypot(ut[0],ut[1]))*B.WMAX*cap:0;',replace:'wT=Lt?Lt.sign*Math.min(1,Math.hypot(ut[0],ut[1]))*B.WMAX*cap:(Lm?Lm.sign*B.WMAX*cap:0);'},
 {name:'M3 bench36Liftable always true',check:6,find:'function bench36Liftable(pose,positions){',replace:'function bench36Liftable(pose,positions){return true;'},
 {name:'M4 the save wrapper passes straight through',check:12,find:'save=function(){try{benchSync36();}catch(e){}return prevSave36.apply(this,arguments);};',replace:'save=function(){return prevSave36.apply(this,arguments);};'},
 {name:'M5 the camera wrapper passes straight through',check:14,find:"if(s==='off'||s==='placed'||B.paused||!Array.isArray(pts)||!players[i])return pts;",replace:'return pts;'},
 {name:'M6a sitStop is never held back',check:13,find:"if(B.state==='seated'&&S&&S.day===B.seatDay&&!B.standing){",replace:'if(false){'},
 {name:'M6b sitStop is held back whenever seated',check:13,find:"if(B.state==='seated'&&S&&S.day===B.seatDay&&!B.standing){",replace:"if(B.state==='seated'){"},
 {name:'M7a no direction latch',check:10,find:'if(L&&ux*L.ref[0]+uz*L.ref[1]>=0)return L;',replace:''},
 {name:'M7b the old exponential easing (rate 8)',check:10,find:'B.vel.s=benchApproach36(B.vel.s,sT,B.V/B.RAMP,B.V/B.STOP,dt);B.vel.w=benchApproach36(B.vel.w,wT,B.WMAX/B.RAMP,B.WMAX/B.STOP,dt);',replace:'B.vel.s+=(sT-B.vel.s)*Math.min(1,8*dt);B.vel.w+=(wT-B.vel.w)*Math.min(1,8*dt);'},
 {name:'M8 arrangement checks not isolated',check:11,find:'BENCH36.override=box;\n try{',replace:' try{'},
 {name:'M9 the hotspot hook also answers for a placed bench',check:16,find:"if(s==='off')return null;const p=players[i];if(!p)return null;",replace:"if(s==='off')return null;const p=players[i];if(!p)return null;if(s==='placed'){const it=benchItem36();if(it&&benchBoxDist36(benchPoseOf36(it.pose36),p.g.position.x,p.g.position.z)<=1.6)return {id:'bench36Sit',label:'Sit on the bench together',dist:0};}"},
 {name:'M10 the walk grid stops at x 6.0 and z 11.0 again, and nobody outside it reaches anything',check:6,find:'const BENCH_GRID36={x0:-8.5,z0:-3.0,s:0.05,nx:361,nz:371,street:[4.0,10.2]};',replace:'const BENCH_GRID36={x0:-8.5,z0:-3.0,s:0.05,nx:291,nz:281,street:[99,99]};'},
 {name:'M11 the step to the stand point outlives a set-down',check:6,find:'B.pose={x:pose.x,z:pose.z,yaw:pose.yaw};B.snap=null;',replace:'B.pose={x:pose.x,z:pose.z,yaw:pose.yaw};'},
 {name:'M12 holders are tested at the walking radius',check:8,find:'HR:0.22,',replace:'HR:0.33,'},
 {name:'M13 a set-down keeps the stall',check:9,find:'function benchUnstick36(){const B=BENCH36;',replace:'function benchUnstick36(){const B=BENCH36;return;'},
 {name:'M14 the glide’s shortcuts are not tested',check:11,find:'const L=(a,b)=>benchPlanSafe36(raw[a],raw[b],boxes,discs);',replace:'const L=(a,b)=>true;'}];

// a copy of dist with index.html changed by htmlFn and bench-v36.js by benchFn (everything else linked)
function variantDir(htmlFn,benchFn){const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd36-bench-'));
 for(const f of ['assets','data'])if(fs.existsSync(path.join(GAME,f)))fs.symlinkSync(path.join(GAME,f),path.join(d,f));
 fs.mkdirSync(path.join(d,'src'));for(const f of fs.readdirSync(path.join(GAME,'src'))){if(f==='bench-v36.js'&&benchFn){fs.writeFileSync(path.join(d,'src',f),benchFn(fs.readFileSync(path.join(GAME,'src',f),'utf8')));continue;}fs.symlinkSync(path.join(GAME,'src',f),path.join(d,'src',f));}
 fs.writeFileSync(path.join(d,'index.html'),htmlFn?htmlFn(fs.readFileSync(path.join(GAME,'index.html'),'utf8')):fs.readFileSync(path.join(GAME,'index.html'),'utf8'));return d;}
const BENCH_TAG=/<script[^>]*src="(?:\.\/)?src\/bench-v36\.js"><\/script>\n?/;

// the world every in-process check uses (the same one tools/bench-route-v36.cjs plans in), plus the harness helpers inside the game
async function world(){const {benchWorld}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));const h=await benchWorld();const {run,context}=h;
 const store=new Map();context.sessionStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 run("var PH='',TOASTS=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}");
 run("var OVC36=ov.classList.contains;var overlayOn36=on=>{ov.classList.contains=on?(c=>c==='on'):OVC36;};");
 run(`var KEYS36=[{up:'w',down:'s',left:'a',right:'d'},{up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'}];
 var setKeys36=(i,dir)=>{const K=KEYS36[i];keys[K.up]=keys[K.down]=keys[K.left]=keys[K.right]=false;if(!dir)return;if(dir[0]<0)keys[K.left]=true;if(dir[0]>0)keys[K.right]=true;if(dir[1]<0)keys[K.up]=true;if(dir[1]>0)keys[K.down]=true;};
 var noKeys36=()=>{setKeys36(0,null);setKeys36(1,null);};
 var rawOf36=(x,z)=>{const fl=Math.hypot(CAM_DIR.x,CAM_DIR.z),fx=-CAM_DIR.x/fl,fz=-CAM_DIR.z/fl,n=Math.hypot(x,z)||1;return [(x*(-fz)-z*fx)/n,(x*fx-z*fz)/n];};
 var combo36=(wx,wz)=>{let best=null,bd=-2;for(const x of [-1,0,1])for(const z of [-1,0,1]){if(!x&&!z)continue;const v=rawOf36(x,z),d=(v[0]*wx+v[1]*wz)/Math.hypot(wx,wz);if(d>bd){bd=d;best=[x,z];}}return best;};
 var at36=(i,x,z)=>{const p=players[i];p.g.position.set(x,0,z);p.prev=[x,z];p.y=0;p.lvl=0;p.g.baseY=0;};
 var pos36=i=>[players[i].g.position.x,players[i].g.position.z];
 var press36=i=>{act[i]=true;lastInput[i]='key';};
 var FT36=0,DT36=1000/30,ONF36=null;
 var frames36=n=>{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<n;k++){T35+=DT36;PERF35+=DT36;last=FT36;FT36+=DT36;tick(FT36);if(ONF36)ONF36();}}finally{renderFrame=rf;}};
 var screen36=(w,h,touch)=>{innerWidth=w;innerHeight=h;navigator.maxTouchPoints=touch?1:0;for(let i=0;i<2;i++){const vp=v21Viewport(i);cams[i].aspect=vp.w/vp.h;cams[i].updateProjectionMatrix();}};
 var R36=(()=>{let s=1;return {seed(v){s=(v>>>0)||1;},next(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;}};})();
 var fresh36=()=>{NET.on=false;AI.on=false;_silent=false;ONF36=(typeof WALL36!=='undefined'&&WALL36.on)?wallsFrame36:null;noKeys36();overlayOn36(false);BENCH36.flags=null;location.search='';DT36=1000/30;
  dispatch('newgame');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupstep',{v:'p0'});dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();
  sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();screen36(1280,800,false);frames36(2);PH='';TOASTS=[];};
 var start36=()=>{ACTIONS.bench36Start();ACTIONS.close();return BENCH36.state;};
 // the mover stands at the end that leads (the plan's start says which), the turner at the other; both take with their own Act key
 // a free standing spot by end e of pose P: on the axis from 1.1 m out, else the nearest free point round it
 var endSpot36=(P,e)=>{for(let t=1.1;t<=1.6;t+=0.05){const q=benchEnd36(P,e,t);if(!blocked(q[0],q[1],PR,{noBench:true}))return q;}const c=benchEnd36(P,e,1.1);
  for(let r=0.1;r<=0.8;r+=0.1)for(let k=0;k<16;k++){const x=c[0]+Math.sin(k/16*Math.PI*2)*r,z=c[1]+Math.cos(k/16*Math.PI*2)*r;if(!blocked(x,z,PR,{noBench:true})&&!bench36CircleOBB(x,z,PR,benchBox36(P,0)))return [x,z];}return c;};
 var atEnds36=P=>{const a=endSpot36(P,0),b=endSpot36(P,1);at36(0,a[0],a[1]);at36(1,b[0],b[1]);};
 var takeEnds36=(fe,mover)=>{const p=BENCH36.pose,f=benchEnd36(p,fe,1.1),r=benchEnd36(p,1-fe,1.1),m=mover===undefined?0:mover;at36(m,f[0],f[1]);at36(1-m,r[0],r[1]);frames36(2);};
 var lift36=(first,second)=>{press36(first);frames36(3);press36(second);frames36(3);return BENCH36.state;};
 // reload through the save (a saved game edited as a test fixture): the module's own load rule runs
 var reload36=()=>{save();S=load();enterWorld();closePanel();frames36(1);};
 var loadFixture36=fn=>{const o=JSON.parse(JSON.stringify(S));fn(o);localStorage.setItem(KEY,JSON.stringify(o));S=load();enterWorld();closePanel();frames36(1);};
 // (the live delivery is torn down first: otherwise the save wrapper writes the live pose over the fixture before it is saved)
 var loadAt36=(x,z,deg,extra)=>{benchTeardown36();life34();S.life.bench36=Object.assign({v:1,state:'grounded',pos:[x,z],yaw:deg*Math.PI/180,mover:0,choice:'out',deliveries:0,again:false,hints:2,placedDay:null,playtest:false,runs:[]},extra||{});save();S=load();enterWorld();closePanel();frames36(1);};`);
 // the plan follower: one frame of keys for the role each segment needs, closed loop on the pose (0.012 m / 0.6 degrees), drift corrected by short taps
 run(`var FOL36={k:0,zeroT:false,zeroM:false,o:null};
 var follow36=plan=>{const B=BENCH36;if(B.state!=='carrying'){noKeys36();return 'idle';}
  const seg=plan.segments[FOL36.k];if(!seg){noKeys36();return 'done';}
  // the bench is the same box either way round: at each segment start the plan's yaw is matched to the bench's axis (offset 0 or 180 degrees,
  // whichever end leads now), and the turn then goes the plan's way
  const f=B.front?1:-1,T=seg.until,wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
  if(FOL36.o===null){const prev=(FOL36.k>0?plan.segments[FOL36.k-1].until.yaw:plan.start.yaw)*Math.PI/180;FOL36.o=Math.abs(wrap(B.pose.yaw-prev))>Math.PI/2?Math.PI:0;}
  const tT=T.yaw*Math.PI/180+FOL36.o;
  const m=B.mover,t=1-m;let mDir=null,tDir=null;const ux=Math.cos(tT),uz=-Math.sin(tT),e=[Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f];
  const dth=wrap(tT-B.pose.yaw),coastW=B.vel.w*B.vel.w/(2*B.WMAX/B.STOP)+Math.abs(B.vel.w)*DT36/1000;
  if(seg.op==='fwd'||seg.op==='back'){const r=(T.x-B.pose.x)*ux+(T.z-B.pose.z)*uz,coast=B.vel.s*B.vel.s/(2*B.V/B.STOP)+Math.abs(B.vel.s)*DT36/1000,ct=-(T.x-B.pose.x)*uz+(T.z-B.pose.z)*ux;
   if(Math.abs(r)<=0.012){FOL36.k++;FOL36.o=null;}else if(Math.abs(r)>coast+0.004)mDir=[ux*Math.sign(r),uz*Math.sign(r)];
   const want=wrap(dth-Math.max(-0.05,Math.min(0.05,ct*2*Math.sign(r||1))));if(Math.abs(want)>0.004&&Math.abs(want)>coastW+0.002)tDir=[e[0]*Math.sign(want),e[1]*Math.sign(want)];}
  else{if(Math.abs(dth)<=0.6*Math.PI/180){FOL36.k++;FOL36.o=null;}else if(Math.abs(dth)>coastW+0.002)tDir=[e[0]*Math.sign(dth),e[1]*Math.sign(dth)];}
  if(FOL36.zeroM)mDir=null;if(FOL36.zeroT)tDir=null;
  setKeys36(m,mDir?combo36(mDir[0],mDir[1]):null);setKeys36(t,tDir?combo36(tDir[0],tDir[1]):null);return 'go';};
 // drive the plan for at most n frames; stop(k) may pause at a segment index (returns true to stop)
 var drive36=(plan,n,stop)=>{let r='go',f=0;for(;f<n;f++){if(stop&&stop(FOL36.k,f)){noKeys36();return {r:'stop',f};}r=follow36(plan);frames36(1);if(r!=='go'&&BENCH36.state!=='carrying')break;}noKeys36();return {r,f};};`);
 // the independent wall test (its own box list and separating-axis test: the boxes blocked() tests at level 0, the walls and stairs, furniture,
 // the crate, the loose sofa and the pushables), and the harness's own walk (from blocked() only)
 run(`var WALL36={n:0,bad:[],hold:0,raised:0,snap:0,sweep:0,settle:0,settleBad:[],dissolve:0,dissolveBad:0,on:false,prev:null,gprev:null};
 var hbBoxes36=(x,z,R)=>{const out=[],near=o=>o.x2>x-R&&o.x1<x+R&&o.z2>z-R&&o.z1<z+R;for(const o of OBS){const l=o.lvl||0;if((l===0||l===2)&&near(o))out.push(o);}for(const o of FURN_OBS)if(near(o))out.push(o);
  if(crate){const c=crateBox();if(near(c))out.push(c);}if(sofa&&sofa.g.visible&&!sofa.carrying){const c=sofaBox();if(near(c))out.push(c);}for(const pb of PUSH){if(pb.lvl!==0||pb.gone)continue;const c=pushBox(pb);if(near(c))out.push(c);}return out;};
 var hbHit36=(p,hx,hz,list)=>{const ux=Math.cos(p.yaw),uz=-Math.sin(p.yaw),nx=Math.sin(p.yaw),nz=Math.cos(p.yaw);for(const b of list){const bx=(b.x2-b.x1)/2,bz=(b.z2-b.z1)/2,dx=(b.x1+b.x2)/2-p.x,dz=(b.z1+b.z2)/2-p.z;
   if(Math.abs(dx)>=bx+Math.abs(ux)*hx+Math.abs(nx)*hz||Math.abs(dz)>=bz+Math.abs(uz)*hx+Math.abs(nz)*hz)continue;
   if(Math.abs(dx*ux+dz*uz)>=hx+bx*Math.abs(ux)+bz*Math.abs(uz)||Math.abs(dx*nx+dz*nz)>=hz+bx*Math.abs(nx)+bz*Math.abs(nz))continue;return b;}return null;};
 // how far (m) the bench box at p is into something: 0 when clear
 var hbDepth36=p=>{const list=hbBoxes36(p.x,p.z,1.2);if(!hbHit36(p,0.76,0.26,list))return 0;let lo=0,hi=0.26;for(let k=0;k<16;k++){const m=(lo+hi)/2;if(hbHit36(p,0.76-m,0.26-m,list))lo=m;else hi=m;}return hi;};
 // the deepest point of a straight move between two poses, sampled so no point of the box moves more than 2 mm between samples
 var hbSweep36=(a,b)=>{let dy=b.yaw-a.yaw;while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;const n=Math.max(1,Math.ceil((Math.hypot(b.x-a.x,b.z-a.z)+0.81*Math.abs(dy))/0.002));let worst=0;
  for(let k=1;k<n;k++){const t=k/n,d=hbDepth36({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:a.yaw+dy*t});if(d>worst)worst=d;}return worst;};
 var POTL36=[-5.845,-5.355,6.385,6.875];
 var wallsFrame36=()=>{const B=BENCH36,s=B.state;if(B.paused){WALL36.prev=null;return;}const P={x:B.pose.x,z:B.pose.z,yaw:B.pose.yaw};
  if(s==='grounded'||s==='ready'||s==='carrying'||s==='choosing'){WALL36.n++;const d=hbDepth36(P);if(d>0&&WALL36.bad.length<5)WALL36.bad.push([s,+P.x.toFixed(3),+P.z.toFixed(3),+(P.yaw*180/Math.PI).toFixed(1),+(d*1000).toFixed(2)]);
   // between frames (a carried move is up to two sub-steps; it may graze to within a tenth of a millimetre after the bisection to contact)
   if(WALL36.prev&&s==='carrying'){const w=hbSweep36(WALL36.prev,P);WALL36.sweep=Math.max(WALL36.sweep,w);}
   if(s==='carrying')for(const i of B.holder){const q=pos36(i);if(blocked(q[0],q[1],B.HR-0.002,{noBench:true}))WALL36.hold++;if(levelAt(q[0],q[1])>=0.5)WALL36.raised++;}
   // a player stepping to a stand point never passes through a wall
   if(B.snap){const q=pos36(B.snap.i);if(blocked(q[0],q[1],B.HR-0.002,{noBench:true}))WALL36.snap++;}
   WALL36.prev=s==='carrying'?P:null;}else WALL36.prev=null;
  if(s==='settling'&&B.settle&&B.settle.kind!=='plan'){const st=B.settle;
   if(st.kind==='go'){if(st.step&&st.step.glide){WALL36.settle++;let r=null;const d=hbDepth36(P);if(d>0)r=['wall',+(d*1000).toFixed(3),+P.x.toFixed(3),+P.z.toFixed(3)];
     if(!r&&WALL36.gprev){const w=hbSweep36(WALL36.gprev,P);if(w>0)r=['between',+(w*1000).toFixed(3),+P.x.toFixed(3),+P.z.toFixed(3)];}
     const c=Math.cos(P.yaw),sn=Math.sin(P.yaw);
     if(!r){for(let a=-0.75;a<=0.751&&!r;a+=0.05)for(let b=-0.25;b<=0.251;b+=0.05){const x=P.x+a*c+b*sn,z=P.z-a*sn+b*c;if(x>POTL36[0]&&x<POTL36[1]&&z>POTL36[2]&&z<POTL36[3]){r=['pot',x,z];break;}}}
     if(!r)for(const i of [0,1]){const q=pos36(i),bx={x:P.x,z:P.z,yaw:P.yaw,hx:0.76,hz:0.26};if(bench36CircleOBB(q[0],q[1],PR-0.005,bx)){r=['player',i];break;}}
     if(r&&WALL36.settleBad.length<5)WALL36.settleBad.push(r);WALL36.gprev=P;}else WALL36.gprev=null;}
   else{WALL36.dissolve++;const same=(a,b)=>Math.abs(a.x-b.x)<1e-9&&Math.abs(a.z-b.z)<1e-9&&Math.abs(a.yaw-b.yaw)<1e-9;if(!same(B.pose,st.from)&&!same(B.pose,st.to))WALL36.dissolveBad++;}}
  else WALL36.gprev=null;};
 // the harness's own walk grid: x -8.5..9.5, z -3..15.5 at 0.05 m from blocked() at PR; anyone outside it starts from the street (4.0, 10.2)
 var HB36={g:null,sig:'',X0:-8.5,Z0:-3,S0:0.05,NX:361,NZ:371};
 var hbGrid36=()=>{const sig=crate.position.x+','+crate.position.z+'|'+FURN_OBS.map(o=>o.x1+','+o.z1).join(';')+'|'+PUSH.map(p=>p.gone?'-':p.g.position.x+','+p.g.position.z).join(';');if(HB36.sig===sig)return HB36.g;
  const {X0,Z0,S0,NX,NZ}=HB36,g=new Uint8Array(NX*NZ);for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++)if(blocked(X0+i*S0,Z0+j*S0,PR,{noBench:true}))g[i*NZ+j]=1;HB36.g=g;HB36.sig=sig;return g;};
 var hbInBox36=(x,z,r,p)=>{const c=Math.cos(p.yaw),s=Math.sin(p.yaw),dx=x-p.x,dz=z-p.z,lx=dx*c-dz*s,lz=dx*s+dz*c,ox=Math.max(0,Math.abs(lx)-0.76),oz=Math.max(0,Math.abs(lz)-0.26);return ox*ox+oz*oz<r*r;};
 var hbMatch36=(p,pos)=>{const {X0,Z0,S0,NX,NZ}=HB36,ax=Math.cos(p.yaw),az=-Math.sin(p.yaw),ends=[[p.x-ax*0.9,p.z-az*0.9],[p.x+ax*0.9,p.z+az*0.9]];
  for(const [x,z] of ends)if(blocked(x,z,BENCH36.HR,{noBench:true})||!carryLevelOK34(x,z))return false;
  const g=hbGrid36().slice();for(let i=0;i<NX;i++){const x=X0+i*S0;if(Math.abs(x-p.x)>1.2)continue;for(let j=0;j<NZ;j++){const z=Z0+j*S0;if(Math.abs(z-p.z)>1.2)continue;if(hbInBox36(x,z,PR,p))g[i*NZ+j]=1;}}
  const reach=q=>{const seen=new Uint8Array(NX*NZ);let si=Math.round((q[0]-X0)/S0),sj=Math.round((q[1]-Z0)/S0);if(si<0||sj<0||si>=NX||sj>=NZ){si=Math.round((4.0-X0)/S0);sj=Math.round((10.2-Z0)/S0);}let s=-1,bd=1e9;for(let a=-7;a<=7;a++)for(let b=-7;b<=7;b++){const i=si+a,j=sj+b;if(i<0||j<0||i>=NX||j>=NZ||g[i*NZ+j])continue;if(a*a+b*b<bd&&a*a+b*b<=49){bd=a*a+b*b;s=i*NZ+j;}}
   if(s<0)return [false,false];const Q=[s];seen[s]=1;for(let h=0;h<Q.length;h++){const n=Q[h],i=(n/NZ)|0,j=n-i*NZ;for(const m of [i>0?n-NZ:-1,i<NX-1?n+NZ:-1,j>0?n-1:-1,j<NZ-1?n+1:-1])if(m>=0&&!seen[m]&&!g[m]){seen[m]=1;Q.push(m);}}
   return ends.map(([ex,ez])=>{for(let i=Math.floor((ex-0.8-X0)/S0);i<=Math.ceil((ex+0.8-X0)/S0);i++)for(let j=Math.floor((ez-0.8-Z0)/S0);j<=Math.ceil((ez+0.8-Z0)/S0);j++){if(i<0||j<0||i>=NX||j>=NZ)continue;const n=i*NZ+j;if(seen[n]&&Math.hypot(X0+i*S0-ex,Z0+j*S0-ez)<=0.8)return true;}return false;});};
  const r0=reach(pos[0]),r1=reach(pos[1]);return (r0[0]&&r1[1])||(r0[1]&&r1[0]);};`);
 return h;}

const r3=v=>Math.round(v*1000)/1000,deg=v=>Math.round(v*180/Math.PI*100)/100;

// the checks: each returns a deterministic summary or throws
function checks(h,only){const {run}=h,J=c=>JSON.parse(run('JSON.stringify('+c+')'));run('var PLAN36='+JSON.stringify(PLAN));
 const FE=PLAN.start.yaw===0?1:0;                                              // the end the plan leads with
 // places along the plan, found by what the segments do (so a regenerated plan keeps them): the courtyard run west, corner 1, corner 2 and the
 // run through the flat door
 const SEG=(()=>{const S=PLAN.segments,court=S.findIndex(s=>s.op==='fwd'&&s.until.x<0),c2=S.findIndex(s=>s.op.startsWith('turn')&&s.until.z>4.0);
  return {courtyard:court,corner1:court+1,corner2:c2,flatDoor:S.findIndex((s,k)=>k>c2&&s.op==='fwd'&&s.until.x<-2.3),stops:S.length-3};})();
 const out=[];const check=(n,fn)=>{if(only&&!only.includes(n))return;const name=NAMES[n-1];
  try{const info=fn();out.push({name,passed:true,info});}catch(e){out.push({name,passed:false,failure:String(e&&e.message||e).slice(0,400)});}
  try{run('WALL36.on=false;ONF36=null;noKeys36();overlayOn36(false);DT36=1000/30;NET.on=false;AI.on=false;')}catch(e){}};
 const deliver=(opts)=>{opts=opts||{};run((opts.fresh?'FOL36.k=0;FOL36.o=null;':'')+'FOL36.o=null;FOL36.zeroT=false;FOL36.zeroM=false;');const r=J(`drive36(PLAN36,${opts.max||7200})`);return r;};
 const agreeOn=(key)=>{let guard=0;while(J('BENCH36.choice')!==key&&guard++<4){run("keys['arrowright']=true;frames36(2);keys['arrowright']=false;frames36(3);");}
  assert.equal(J('BENCH36.choice'),key,'chose '+key);run('press36(0);frames36(2);press36(1);frames36(2);');for(let k=0;k<400&&J('BENCH36.state')==='settling';k++)run('frames36(1)');return J('BENCH36.state');};
 const walls=()=>run('WALL36.on=true;ONF36=wallsFrame36;');
 const stateSeq=()=>J('BENCH36.states.slice()');

 check(1,()=>{run('fresh36();at36(0,-4.2,3.2);at36(1,-3.2,3.2);frames36(1);');assert.equal(J('[singleIdx(),AI.on,NET.on,cams.length]').join(),'-1,false,false,2');
  const p0=J('[pos36(0),pos36(1)]');run("setKeys36(0,[1,0]);frames36(12);noKeys36();frames36(1);");const p1=J('[pos36(0),pos36(1)]');
  assert(Math.hypot(p1[0][0]-p0[0][0],p1[0][1]-p0[0][1])>0.5,'P1 walks on WASD');assert.deepEqual(p1[1],p0[1],'P2 stays');
  run("setKeys36(1,[-1,0]);frames36(12);noKeys36();frames36(1);");const p2=J('[pos36(0),pos36(1)]');assert.deepEqual(p2[0],p1[0],'P1 stays');assert(Math.hypot(p2[1][0]-p1[1][0],p2[1][1]-p1[1][1])>0.5,'P2 walks on the arrows');
  run("setKeys36(0,[0,1]);setKeys36(1,[0,1]);frames36(10);noKeys36();frames36(1);");const p3=J('[pos36(0),pos36(1)]');assert(p3[0][1]!==p2[0][1]&&p3[1][1]!==p2[1][1],'both at once');
  const cams=J('cams.map(c=>c.position.toArray().map(v=>+v.toFixed(3)))');assert.notDeepEqual(cams[0],cams[1],'two cameras');
  run('start36();');const e1=J('benchEnd36(BENCH36.pose,1,1.05)'),e0=J('benchEnd36(BENCH36.pose,0,1.05)');run(`at36(0,${e1[0]},${e1[1]});at36(1,${e0[0]},${e0[1]});frames36(10);`);
  const pr=J("[0,1].map(i=>{const e=document.getElementById('pr'+i);return [e.className,e.innerHTML];})");
  for(const i of [0,1]){assert.equal(pr[i][0],'pr on p'+i,'prompt '+i+' shown');assert(pr[i][1].includes('Take this end'),'prompt '+i+': '+pr[i][1]);}
  assert(pr[0][1].includes('role36 move')&&pr[1][1].includes('role36 turn'),'role chips');
  return {walk:[r3(p1[0][0]-p0[0][0]),r3(p2[1][0]-p1[1][0])],prompts:pr.map(p=>p[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim())};});

 check(2,()=>{const probe=dir=>JSON.parse(cp.execFileSync(process.execPath,[__filename,'--inert-probe'],{env:Object.assign({},process.env,{COMPOUND_GAME_DIR:dir}),encoding:'utf8',maxBuffer:1<<28}).trim().split('\n').pop());
  const without=variantDir(html=>{assert(BENCH_TAG.test(html),'the bench tag is in index.html');return html.replace(BENCH_TAG,'').replace(/<link rel="stylesheet" href="src\/bench-v36\.css">\n?/,'');});
  let a,b;try{a=probe(GAME);b=probe(without);}finally{fs.rmSync(without,{recursive:true,force:true});}
  assert.equal(a.module,true);assert.equal(b.module,false);
  for(const k of ['blocked','save','dist','labels','keys','tickHooks','lines','mesh']){assert.deepEqual(a[k],b[k],k+' differs from the build without the module');}
  // the companion household (day 2, the sofa in) is told, once, that the bench needs two players on one device; nothing else in its Menu changes
  const TWO='<div class="card small bench36-menu">Ada’s bench needs two pairs of hands: one to walk it, one to steer it. Play it with a second player on this device.</div>';
  assert(a.menu.startsWith(TWO),'the companion Menu opens with the two-hands line');assert.equal(a.menu.split('bench36-menu').length-1,1,'one bench line');assert.equal(a.menu.slice(TWO.length),b.menu,'the rest of the companion Menu is unchanged');
  assert.equal(a.mesh,0);return {points:a.blocked.length,frames:a.labels.length,keys:a.keys.length,tickHooks:a.tickHooks,lines:a.lines,companion:'two-hands line only'};});

 check(3,()=>{run('fresh36();start36();');run(`at36(0,${'benchEnd36(BENCH36.pose,'+FE+',1.05)[0]'},${'benchEnd36(BENCH36.pose,'+FE+',1.05)[1]'});at36(1,6,10.5);frames36(2);press36(0);frames36(4);`);
  assert.equal(J('BENCH36.state'),'ready');const p0=J('bench36Pose()');
  // alone: pushing into the bench and sideways for 3 s
  run(`{const c=BENCH36.pose,q=pos36(0);setKeys36(0,combo36(c.x-q[0],c.z-q[1]));}frames36(45);{const a=benchAxis36(BENCH36.pose.yaw);setKeys36(0,combo36(-a[1],a[0]));}frames36(45);noKeys36();frames36(2);`);
  assert.deepEqual(J('bench36Pose()'),p0,'one player alone moves nothing');assert.equal(J('BENCH36.state'),'ready');
  run(`{const r=benchEnd36(BENCH36.pose,${1-FE},1.05);at36(1,r[0],r[1]);}frames36(2);press36(1);frames36(4);`);assert.equal(J('BENCH36.state'),'carrying');
  // only the mover: along the axis, yaw constant
  const q0=J('bench36Pose()');run(`{const B=BENCH36,a=benchAxis36(B.pose.yaw),f=B.front?1:-1;setKeys36(B.mover,combo36(-a[0]*f,-a[1]*f));}frames36(15);noKeys36();frames36(6);`);
  const q1=J('bench36Pose()');const ax=[Math.cos(q0.yaw),-Math.sin(q0.yaw)],dx=q1.x-q0.x,dz=q1.z-q0.z;
  assert(Math.abs(q1.yaw-q0.yaw)<=1e-9,'mover keys keep the yaw');assert(Math.abs(-dx*ax[1]+dz*ax[0])<=1e-9,'only along the axis');assert(Math.hypot(dx,dz)>0.05,'it moved: '+Math.hypot(dx,dz));
  // only the turner: centre constant
  run(`{const B=BENCH36,f=B.front?1:-1;setKeys36(1-B.mover,combo36(Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f));}frames36(10);noKeys36();frames36(6);`);
  const q2=J('bench36Pose()');assert.equal(q2.x,q1.x);assert.equal(q2.z,q1.z);assert(Math.abs(q2.yaw-q1.yaw)>0.05,'the turner turned it');
  // the turner pushing along the bench (outside the cone) moves nothing
  run(`{const B=BENCH36,a=benchAxis36(B.pose.yaw);setKeys36(1-B.mover,combo36(a[0],a[1]));}frames36(20);noKeys36();frames36(4);`);assert.deepEqual(J('bench36Pose()'),q2,'turner forward keys move nothing');
  // the plan with the turner's keys zeroed for 120 s never reaches the passage
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;FOL36.zeroT=true;FOL36.zeroM=false;');run('drive36(PLAN36,3600)');
  const zT=J('[bench36Pose(),FOL36.k,BENCH36.state]');assert(!(zT[0].x<-1.15&&zT[0].z>1.5),'reached the passage without the turner');
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;FOL36.zeroT=false;FOL36.zeroM=true;');const c0=J('bench36Pose()');run('drive36(PLAN36,900)');const zM=J('bench36Pose()');
  assert.equal(zM.x,c0.x);assert.equal(zM.z,c0.z);run('FOL36.zeroM=false;');
  return {mover:r3(Math.hypot(dx,dz)),turner:deg(q2.yaw-q1.yaw),noTurner:{x:r3(zT[0].x),z:r3(zT[0].z),segment:zT[1]},noMover:{x:r3(zM.x),z:r3(zM.z)}};});

 // shared by check 4 and check 5: three deliveries with the wall sampler on every frame
 let delivered=null;
 const threeDeliveries=()=>{if(delivered)return delivered;walls();const res=[];
  run('fresh36();');const crate0=J('[crate.position.x,crate.position.z]');assert.deepEqual(crate0,[-1.75,1],'a fresh save has the crate in the passage mouth');
  // preflight refusals first: an armchair over the slot, a piece in the lane
  run("S.home.items.push({id:'pf1',type:'armchair',x:1,y:FLAT.rows,rot:0});rebuildFurniture();TOASTS=[];");assert.equal(J('start36()'),'off');const t1=J('TOASTS.slice(-1)[0]');
  assert.equal(t1,'Ada’s bench needs the way clear. Move the woven armchair off the west end of the veranda in Home first.','slot refusal: '+t1);
  run("S.home.items=S.home.items.filter(i=>i.id!=='pf1');S.home.items.push({id:'pf2',type:'plant',x:4,y:2,rot:0});rebuildFurniture();TOASTS=[];");assert.equal(J('start36()'),'off');const t2=J('TOASTS.slice(-1)[0]');
  assert(/front of the room by the door/.test(t2),'lane refusal: '+t2);run("S.home.items=S.home.items.filter(i=>i.id!=='pf2');rebuildFurniture();TOASTS=[];");
  // delivery 1: P1 moves, Out
  run('BENCH36.states=[];');assert.equal(J('start36()'),'grounded');const crate1=J('[crate.position.x,crate.position.z]');assert.notDeepEqual(crate1,crate0,'the start moved the crate');
  assert.equal(J("fits('chairs',5,3)"),false,'Build refuses the lane while a delivery is open');
  run('takeEnds36('+FE+',0);');assert.equal(J('lift36(0,1)'),'carrying');assert.equal(J('BENCH36.mover'),0);let d=deliver({fresh:true});
  assert.equal(J('BENCH36.state'),'choosing','delivery 1 reached the doorway: '+JSON.stringify(d));const st1=J('benchStats36()');assert.equal(agreeOn('out'),'placed');
  assert.deepEqual(stateSeq(),['grounded','ready','carrying','choosing','settling','placed'],'delivery 1 states');res.push({dur:r3(st1.dur),bumps:st1.bumps,resets:st1.resets,settle:J('BENCH36.lastSettle'),placed:J("S.home.items.find(i=>i.type==='bench').pose36")});
  // delivery 2: again, roles swapped in ready before the lift (P2 leads), Gate
  const item1=J("JSON.stringify(S.home.items.find(i=>i.type==='bench'))");run('BENCH36.states=[];closePanel();ACTIONS.bench36Again();');assert.equal(J('BENCH36.state'),'grounded');
  run(`{const p=BENCH36.pose,f=benchEnd36(p,${FE},1.1),r=benchEnd36(p,${1-FE},1.1);at36(1,f[0],f[1]);at36(0,r[0],r[1]);}frames36(2);press36(0);frames36(3);`);assert.equal(J('BENCH36.state'),'ready');
  run('press36(0);frames36(3);');assert.equal(J('BENCH36.mover'),1,'swapped in ready');run('press36(1);frames36(3);');assert.equal(J('BENCH36.state'),'carrying');assert.equal(J('BENCH36.holder['+FE+']'),1,'P2 holds the leading end');
  d=deliver({fresh:true});assert.equal(J('BENCH36.state'),'choosing','delivery 2 reached the doorway: '+JSON.stringify(d));assert.equal(J("JSON.stringify(S.home.items.find(i=>i.type==='bench'))"),item1,'the saved item is untouched during the run');
  const st2=J('benchStats36()');assert.equal(agreeOn('gate'),'placed');assert.deepEqual(stateSeq(),['grounded','ready','carrying','choosing','settling','placed'],'delivery 2 states');
  res.push({dur:r3(st2.dur),bumps:st2.bumps,swaps:st2.swaps,resets:st2.resets,settle:J('BENCH36.lastSettle'),placed:J("S.home.items.find(i=>i.type==='bench').pose36")});
  // delivery 3: four set-downs at seeded segments by alternating holders, one swap mid-route that changes the leading end, Water
  const item2=J("JSON.stringify(S.home.items.find(i=>i.type==='bench'))");run('BENCH36.states=[];closePanel();ACTIONS.bench36Again();R36.seed(36);FOL36.k=0;FOL36.o=null;');
  run('takeEnds36('+FE+',0);');assert.equal(J('lift36(0,1)'),'carrying');
  const stops=J('(()=>{const s=new Set();while(s.size<4)s.add(1+Math.floor(R36.next()*'+SEG.stops+'));return [...s].sort((a,b)=>a-b);})()');const downs=[];let swapAt=stops[1],fronts=[];
  for(let k=0;k<stops.length;k++){const at=stops[k];const r=J(`drive36(PLAN36,7200,(seg)=>seg>=${at})`);assert.equal(r.r,'stop','reached segment '+at);
   const holder=k%2;let tries=0;while(J('BENCH36.state')==='carrying'&&tries<8){run(`press36(${holder});frames36(10);`);if(J('BENCH36.state')==='carrying'){tries++;run('FOL36.k=Math.min(FOL36.k,PLAN36.segments.length-1);');J('drive36(PLAN36,8)');}}
   assert.equal(J('BENCH36.state'),'grounded','set down at segment '+at);downs.push({seg:at,by:holder});
   // both stand where the set-down left them; take again (the one who set it down first), swap once, lift
   const first=holder;run(`press36(${first});frames36(3);`);assert.equal(J('BENCH36.state'),'ready');
   if(at===swapAt){const fr=J('BENCH36.front');run(`press36(${first});frames36(3);`);fronts.push(fr);}
   run(`press36(${1-first});frames36(4);`);assert.equal(J('BENCH36.state'),'carrying','lifted again at segment '+at);if(at===swapAt)fronts.push(J('BENCH36.front'));}
  assert.notEqual(fronts[0],fronts[1],'the swap changed the leading end');
  d=deliver();assert.equal(J('BENCH36.state'),'choosing','delivery 3 reached the doorway: '+JSON.stringify(d));assert.equal(J("JSON.stringify(S.home.items.find(i=>i.type==='bench'))"),item2,'the saved item is untouched during the run');
  const st3=J('benchStats36()');assert.equal(agreeOn('water'),'placed');
  const want3=['grounded','ready','carrying'];for(let k=0;k<4;k++)want3.push('grounded','ready','carrying');want3.push('choosing','settling','placed');assert.deepEqual(stateSeq(),want3,'delivery 3 states');
  res.push({dur:r3(st3.dur),bumps:st3.bumps,setdowns:st3.setdowns,swaps:st3.swaps,resets:st3.resets,settle:J('BENCH36.lastSettle'),placed:J("S.home.items.find(i=>i.type==='bench').pose36"),downs});
  for(const r of res){assert(r.dur<240,'under 240 s: '+r.dur);assert.equal(r.resets,0);assert.equal(r.settle,'glide','the bench glides to its place');}
  assert.equal(J('S.life.bench36.deliveries'),3);
  delivered={res,crate:[crate0,crate1.map(r3)],refusals:[t1,t2]};return delivered;};
 check(4,()=>threeDeliveries());

 // the fuzz (checks 5 and 6): random keys and Acts for both players from the five checkpoints and the doorway
 let fuzzed=null;
 const fuzz=()=>{if(fuzzed)return fuzzed;walls();const starts=J('BENCH36.CHECK.map(c=>[c.x,c.z,c.yaw])').concat([[-4.02,5.02,260]]);const runs=[];
  run(`var SD36={acc:0,ref:0,accBad:[],refBad:[],inBox:[],prev:null,toasts:0};var sdFrame36=()=>{const B=BENCH36,s=B.state,tn=TOASTS.length;
    // nobody but a holder ever stands inside the grounded bench (a player who lifted and set down at once included)
    if(s==='grounded'||s==='ready')for(const i of [0,1]){if(benchHolderOf36(i)>=0)continue;const q=pos36(i);if(hbInBox36(q[0],q[1],PR-0.02,B.pose)&&SD36.inBox.length<5)SD36.inBox.push([s,i,+q[0].toFixed(3),+q[1].toFixed(3)]);}
    if(SD36.prev==='carrying'&&s==='grounded'){SD36.acc++;if(!hbMatch36(B.pose,[pos36(0),pos36(1)])&&SD36.accBad.length<5)SD36.accBad.push([+B.pose.x.toFixed(3),+B.pose.z.toFixed(3)]);}
    for(let k=SD36.toasts;k<tn;k++)if(/^Not here, it would box/.test(TOASTS[k])&&s==='carrying'){SD36.ref++;const nud=[0,1].map(i=>{const e=benchHolderOf36(i),q=pos36(i);if(e<0)return q;return benchEnd36(B.pose,e,1.1);});if(hbMatch36(B.pose,nud)&&SD36.refBad.length<5)SD36.refBad.push([+B.pose.x.toFixed(3),+B.pose.z.toFixed(3)]);}
    SD36.toasts=tn;SD36.prev=s;wallsFrame36();};`);
  for(let k=0;k<starts.length;k++){const [x,z,dg]=starts[k];
   // the players stand at the two ends before the load (the load's own rule then keeps the pose), and the pose is the one asked for
   run(`fresh36();start36();atEnds36({x:${x},z:${z},yaw:${dg}*Math.PI/180});loadAt36(${x},${z},${dg});`);
   const got=J('bench36Pose()');assert(Math.abs(got.x-x)<1e-9&&Math.abs(got.z-z)<1e-9&&Math.abs(got.yaw-dg*Math.PI/180)<1e-9,'the fuzz starts where asked: '+JSON.stringify([x,z,dg,got]));
   run(`ONF36=sdFrame36;SD36.prev=BENCH36.state;SD36.toasts=TOASTS.length;R36.seed(${100+k});`);
   // first a directed push: lift, the mover drives one way then the other, the turner swings, then the bench is set down
   run(`press36(0);frames36(3);press36(1);frames36(3);if(BENCH36.state==='carrying'){const B=BENCH36,ax=benchAxis36(B.pose.yaw),f=B.front?1:-1,sg=R36.next()<0.5?1:-1;
    setKeys36(B.mover,combo36(ax[0]*f*sg,ax[1]*f*sg));frames36(45);setKeys36(B.mover,combo36(-ax[0]*f*sg,-ax[1]*f*sg));frames36(90);noKeys36();
    const e=[Math.sin(B.pose.yaw)*f*sg,Math.cos(B.pose.yaw)*f*sg];setKeys36(1-B.mover,combo36(e[0],e[1]));frames36(60);noKeys36();frames36(3);press36(B.holder[0]);frames36(12);}`);
   run(`{let d0=null,d1=null;for(let f=0;f<1000;f++){if(R36.next()<0.12){const r=R36.next();d0=r<0.25?null:[Math.floor(R36.next()*3)-1,Math.floor(R36.next()*3)-1];}if(R36.next()<0.12){const r=R36.next();d1=r<0.25?null:[Math.floor(R36.next()*3)-1,Math.floor(R36.next()*3)-1];}
     setKeys36(0,d0&&(d0[0]||d0[1])?d0:null);setKeys36(1,d1&&(d1[0]||d1[1])?d1:null);
     // keep both near the bench (a player who wanders off is brought back, as a playtester would walk back)
     for(const i of [0,1]){const q=pos36(i),B=BENCH36;if(B.state!=='carrying'&&Math.hypot(q[0]-B.pose.x,q[1]-B.pose.z)>3){const e=benchEnd36(B.pose,i,1.1);if(!blocked(e[0],e[1],PR))at36(i,e[0],e[1]);}}
     if(R36.next()<0.03)press36(0);if(R36.next()<0.03)press36(1);frames36(1);if(BENCH36.state==='choosing'){ACTIONS.bench36RoomDown();}if(BENCH36.state==='placed'||BENCH36.state==='settling')break;}}noKeys36();`);
   runs.push(J('[BENCH36.state,+BENCH36.pose.x.toFixed(2),+BENCH36.pose.z.toFixed(2)]'));}
  fuzzed={runs,sd:J('{acc:SD36.acc,ref:SD36.ref,accBad:SD36.accBad,refBad:SD36.refBad,inBox:SD36.inBox}')};run('ONF36=null;');return fuzzed;};

 check(5,()=>{const F=fuzz();const W=J('WALL36');assert.deepEqual(W.bad,[],'the exact test found the bench in a wall');assert(W.sweep<=0.0001,'between carried frames '+W.sweep);
  assert.equal(W.hold,0,'a holder in a wall');assert.equal(W.raised,0,'a holder on raised ground');assert.equal(W.snap,0,'a player stepped to a stand point through a wall');
  assert.deepEqual(W.settleBad,[],'a glide frame (or the move between two) hit something');assert.equal(W.dissolveBad,0,'a dissolve frame between the ends');assert(W.n>=5000,'frames tested: '+W.n);
  // the settle end points: the three arrangements are clear
  for(const k of ['out','gate','water'])assert.equal(J(`hbDepth36(benchPoseOf36('${k}'))`),0,k+' is clear');
  if(!only||only.includes(4)){assert(W.settle>0,'glide frames tested');assert.equal(W.dissolve,0,'every settle glides');}
  return {tested:W.n>=5000,glide:W.settle>0,sweepUnder01mm:W.sweep<=0.0001,fuzz:F.runs};});

 check(6,()=>{
  // lift, then set down on the very next frame: the lifter's step to the stand point ends with the set-down, so nobody is left inside the box
  run(`fresh36();start36();{const e=benchEnd36(BENCH36.pose,1,1.05),w=benchEnd36(BENCH36.pose,0,1.6);at36(0,e[0],e[1]);at36(1,w[0],w[1]+0.25);}frames36(2);press36(0);frames36(6);press36(1);frames36(1);press36(0);frames36(12);`);
  const quick=J('[BENCH36.state,[0,1].map(i=>{const q=pos36(i);return hbInBox36(q[0],q[1],PR-0.02,BENCH36.pose);})]');assert.equal(quick[0],'grounded','set down at once');assert.deepEqual(quick[1],[false,false],'nobody inside the box after a set-down at once');
  // the street: grounded at the courtyard checkpoint, one player beside it and the other out on the street at z 11.5 (walkable, south of the old grid)
  run('fresh36();start36();at36(0,1.4,2.2);at36(1,3.0,10.0);loadAt36(1.41,1.20,170);at36(1,4.0,11.5);frames36(40);');const st=J('[bench36Pose(),BENCH36.stuck,hbMatch36(BENCH36.pose,[pos36(0),pos36(1)])]');
  assert.equal(st[1],false,'a player on the street does not make it stuck');assert.equal(st[2],true,'the harness’s walk agrees');run('reload36();');const rl=J('[bench36Pose(),pos36(1)]');
  assert.deepEqual(rl[0],st[0],'a reload keeps the courtyard pose');assert.deepEqual(rl[1],[4,11.5],'and nobody is moved to the gate');
  // the first gate fallback (5.0, 11.2): lift and set down where it lies, both holders standing at z 11.2 (south of the old grid): accepted
  run(`fresh36();start36();atEnds36({x:5,z:11.2,yaw:0});loadAt36(5,11.2,0);press36(0);frames36(3);press36(1);frames36(3);TOASTS=[];press36(0);frames36(10);`);
  const sa=J('[BENCH36.state,TOASTS.filter(t=>/^Not here/.test(t)).length,bench36Pose()]');assert.equal(sa[0],'grounded','set down by the street gate');assert.equal(sa[1],0,'not refused');
  // a stall at corner 2, set down, both players in the room, then the Menu reset
  walls();run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');const r=J("drive36(PLAN36,7200,seg=>seg>="+SEG.flatDoor+")");assert.equal(r.r,'stop');
  run(`{const B=BENCH36,a=benchAxis36(B.pose.yaw),f=B.front?1:-1;setKeys36(B.mover,combo36(a[0]*f,a[1]*f));}frames36(60);noKeys36();frames36(2);`);
  let tries=0;while(J('BENCH36.state')==='carrying'&&tries++<5)run('press36(0);frames36(10);');assert.equal(J('BENCH36.state'),'grounded','set down at corner 2');
  run('at36(0,-5.6,3.4);at36(1,-6.4,3.4);frames36(2);dispatch("bench36Reset");frames36(2);');const pr=J('bench36Pose()');
  assert(!(Math.abs(pr.x+3.26)<0.01&&Math.abs(pr.z-4.66)<0.01),'never the old room pose');assert.equal(J('hbMatch36(BENCH36.pose,[pos36(0),pos36(1)])'),true,'the reset pose is liftable');
  const cp1=J('BENCH36.CHECK.findIndex(c=>Math.abs(c.x-BENCH36.pose.x)<1e-6&&Math.abs(c.z-BENCH36.pose.z)<1e-6)');assert(cp1>=0,'a checkpoint');
  // nobody can reach any checkpoint (both stand inside walls): the gate, with the players moved there
  run('at36(0,-8.12,4.0);at36(1,-8.12,3.2);dispatch("bench36Reset");frames36(1);');const g=J('[bench36Pose(),pos36(0),pos36(1)]');assert.equal(g[0].x,4);assert.equal(g[0].z,8.6);
  assert(Math.hypot(g[1][0]-3.4,g[1][1]-9.6)<0.7&&Math.hypot(g[2][0]-4.6,g[2][1]-9.6)<0.7,'players at the gate');
  // a save mid-carry with the leading holder on the row, just short of the zone
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J(`drive36(PLAN36,7200,()=>{const B=BENCH36;return B.state==='carrying'&&[0,1].some(i=>{const q=pos36(i);return q[1]>5.8&&q[0]<-2.6;});})`);
  assert.equal(J('BENCH36.state'),'carrying');run('reload36();');const L=J('[BENCH36.state,bench36Pose(),pos36(0),pos36(1)]');assert.equal(L[0],'grounded');
  const okL=J('hbMatch36(BENCH36.pose,[pos36(0),pos36(1)])')||(L[1].x===4&&L[1].z===8.6);assert(okL,'reloads liftable or at the gate');
  // the fuzz last (its set-downs, refusals and positions)
  const F=fuzz();assert.deepEqual(F.sd.accBad,[],'a set-down nobody can lift');assert.deepEqual(F.sd.refBad,[],'a refusal that could have been lifted');assert.deepEqual(F.sd.inBox,[],'a player inside the grounded bench');
  return {acc:F.sd.acc,ref:F.sd.ref,reset:J('BENCH36.CHECK['+cp1+'].n'),reload:L[1].x===4&&L[1].z===8.6?'gate':'liftable',street:{stuck:st[1],reload:'kept',setDown:sa[0]}};});

 check(7,()=>{walls();run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');const N=PLAN.segments.length,pts=[];for(let k=0;k<12;k++)pts.push(Math.floor(1+k*(N-2)/12));
  const roles=[];for(let k=0;k<12;k++){const at=pts[k];const r=J(`drive36(PLAN36,7200,seg=>seg>=${at})`);if(r.r!=='stop'&&J('BENCH36.state')!=='carrying')break;
   const holder=k%2;let tries=0;while(J('BENCH36.state')==='carrying'&&tries<10){run(`press36(${holder});frames36(10);`);if(J('BENCH36.state')==='carrying'){tries++;J('drive36(PLAN36,6)');}}
   assert.equal(J('BENCH36.state'),'grounded','set down '+k);run(`press36(${holder});frames36(3);`);assert.equal(J('BENCH36.state'),'ready');const m0=J('BENCH36.mover');run(`press36(${holder});frames36(3);`);
   assert.equal(J('BENCH36.mover'),1-m0,'swapped');run(`press36(${1-holder});frames36(9);`);assert.equal(J('BENCH36.state'),'carrying','lifted '+k);
   const m=J('BENCH36.mover'),pr=J("[0,1].map(i=>[document.getElementById('prole'+i).textContent,document.getElementById('pr'+i).innerHTML])");
   assert.equal(pr[m][0],'Bench · Move');assert.equal(pr[1-m][0],'Bench · Turn');assert(pr[m][1].includes('role36 move')&&pr[1-m][1].includes('role36 turn'),'chips follow the swap');roles.push(m);}
  const d=deliver();assert.equal(J('BENCH36.state'),'choosing','completed: '+JSON.stringify(d)+' '+JSON.stringify(J('[FOL36.k,bench36Pose(),BENCH36.front,BENCH36.mover,BENCH36.stuck,BENCH36.wall]')));return {points:pts,movers:roles,setdowns:J('benchStats36().setdowns'),swaps:J('benchStats36().swaps')};});

 check(8,()=>{const res={};for(const fps of [60,30]){run(`fresh36();start36();DT36=1000/${fps};`);
   // P1 takes the east end and moves: east into the stair rail
   run('{const e=benchEnd36(BENCH36.pose,1,1.05),w=benchEnd36(BENCH36.pose,0,1.05);at36(0,e[0],e[1]);at36(1,w[0],w[1]);}frames36(2);press36(0);frames36(3);press36(1);frames36(3);');assert.equal(J('BENCH36.state'),'carrying');
   run(`var GS36={poses:[],moving:[],off:[],b0:BENCH36.bump,cue:null};ONF36=()=>{const B=BENCH36;GS36.poses.push([B.pose.x,B.pose.z,B.pose.yaw,B.wall.s]);GS36.moving.push(B.movedPrev);GS36.off.push(Math.hypot(B.g.position.x-B.pose.x,B.g.position.z-B.pose.z));
    if(!GS36.cue&&B.bump>GS36.b0){const m=B.motes.map(o=>[o.m.position.x,o.m.position.z]),cx=m.reduce((a,q)=>a+q[0],0)/m.length,cz=m.reduce((a,q)=>a+q[1],0)/m.length;
     GS36.cue={who:B.bumpMsg&&B.bumpMsg.who,thing:B.bumpMsg&&B.bumpMsg.thing,feet:Math.hypot(cx-pos36(0)[0],cz-pos36(0)[1]),pr:[0,1].map(i=>document.getElementById('pr'+i).innerHTML.replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim())};}};`);
   run(`{const a=benchAxis36(BENCH36.pose.yaw);setKeys36(0,combo36(a[0],a[1]));}`);const n=Math.round(3.0*fps);run(`frames36(${n});noKeys36();frames36(${Math.round(0.3*fps)});`);
   const G=J('GS36');const c=G.poses.findIndex(p=>p[3]!==0);assert(c>0,'reached the rail');const after=G.poses.slice(c),p0=after[0];let maxD=0;for(const p of after)maxD=Math.max(maxD,Math.hypot(p[0]-p0[0],p[1]-p0[1]));
   assert(maxD<=0.001,'moved '+maxD+' after contact');const settled=after.slice(2);assert(settled.every(p=>p[0]===settled[0][0]&&p[1]===settled[0][1]&&p[2]===settled[0][2]),'identical frame to frame');
   const mv=G.moving.slice(c+2,c+2+2*fps);let flips=0;for(let k=1;k<mv.length;k++)if(mv[k]!==mv[k-1])flips++;assert.equal(flips,0,'the walking flag flickers');assert(mv.every(v=>v===false),'still after contact');
   const bumps=J('BENCH36.bump')-G.b0;assert(bumps<=1+Math.floor(2/0.4),'bumps '+bumps);assert(Math.max(...G.off)<=0.06,'recoil '+Math.max(...G.off));assert(G.off[G.off.length-1]<1e-9,'the mesh returns to the pose');
   // the rail is at x 5.9: the leading holder (at 0.9 m from the centre) stops 0.22 m short of it
   assert(Math.abs(p0[0]+0.9+0.22-5.9)<=0.002,'the holder’s body meets the rail at its squeezed-in radius: centre '+p0[0]);
   assert.equal(G.cue.who,0,'the cue is the leading holder’s');assert.equal(G.cue.thing,'wall');assert(G.cue.feet<=0.35,'the dust rises beside that holder: '+G.cue.feet);
   assert(G.cue.pr[0].includes('You’re up against the wall.')&&G.cue.pr[1].includes('Efe is up against the wall.'),'both prompts say so: '+JSON.stringify(G.cue.pr));
   res[fps]={contactFrame:c,contactX:r3(p0[0]),moved:r3(maxD*1000),bumps,recoil:r3(Math.max(...G.off)),cue:G.cue.pr};}
  return res;});

 check(9,()=>{// outside the cone for 5 s: not stuck, the arrow hint after 0.6 s
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);');run('{const B=BENCH36,a=benchAxis36(B.pose.yaw);setKeys36(B.mover,combo36(-a[1],a[0]));}frames36(15);');const early=J('BENCH36.arrowShown[BENCH36.mover]');
  run('frames36(6);');const shown=J('BENCH36.arrowShown[BENCH36.mover]');run('frames36(130);');const notStuck=J('BENCH36.stuck');run('noKeys36();frames36(2);');
  assert.equal(early,'','no arrow before 0.6 s');assert.equal(shown,'hint','the arrow hint shows');assert.equal(notStuck,false,'out-of-cone input is never stuck');
  // wedged at corner 2: the mover pushes on into the vestibule wall
  run('FOL36.k=0;FOL36.o=null;');const r=J('drive36(PLAN36,7200,seg=>seg>='+SEG.corner2+')');assert.equal(r.r,'stop');run(`{const B=BENCH36,a=benchAxis36(B.pose.yaw),f=B.front?1:-1;setKeys36(B.mover,combo36(a[0]*f,a[1]*f));}`);for(let k=0;k<60&&!J('BENCH36.wall.s');k++)run('frames36(1)');run('frames36(90);');
  const stuck=J('[BENCH36.stuck,BENCH36.stuckT,bench36Pose(),BENCH36.wall,BENCH36.front,FOL36.k,BENCH36.state]');const hint=J("document.getElementById('pr'+BENCH36.mover).innerHTML");run('noKeys36();frames36(2);');assert.equal(stuck[0],true,'stuck after 3 s: '+JSON.stringify(stuck));
  assert(hint.includes('<span class="hint36">Stuck? Back up a little, or set it down and swap roles.</span>'),'the stuck hint is in the prompt: '+hint);
  // set down: the stall is over, and a player at an end gets the end, never the reset
  let tries=0;while(J('BENCH36.state')==='carrying'&&tries++<5)run('press36(0);frames36(10);');assert.equal(J('BENCH36.state'),'grounded');run('frames36(9);');
  const after=J("[BENCH36.stuck,[0,1].map(i=>document.getElementById('pr'+i).innerHTML+document.getElementById('prole'+i).textContent).join('|'),hotspotCache.map(h=>h&&h.label)]");
  assert.equal(after[0],false,'a set-down ends the stall');assert(!after[1].includes('Stuck?'),'no stuck hint after the set-down');assert.deepEqual(after[2],['Take this end','Take this end'],'both at the ends get the end');
  // the crate pushed onto one end: nobody can lift it, so it is stuck and "Reset the bench" is offered beside it; Act puts it on a checkpoint
  run('{const B=BENCH36,q=pos36(0),e0=benchEnd36(B.pose,0),e1=benchEnd36(B.pose,1),e=Math.hypot(q[0]-e0[0],q[1]-e0[1])>Math.hypot(q[0]-e1[0],q[1]-e1[1])?e0:e1;crate.position.set(e[0],0,e[1]);}frames36(40);');assert.equal(J('BENCH36.stuck'),true,'an end nobody can reach makes it stuck');
  assert.equal(J('hotspotCache[0]&&hotspotCache[0].label'),'Take this end','next to an end, Take wins over the reset');
  run('{const B=BENCH36,c=Math.cos(B.pose.yaw),s=Math.sin(B.pose.yaw);for(const sg of [1,-1]){const x=B.pose.x+sg*0.62*s,z=B.pose.z+sg*0.62*c;if(!blocked(x,z,PR)){at36(1,x,z);break;}}}frames36(2);');
  const lab=J('hotspotCache[1]&&hotspotCache[1].label');assert.equal(lab,'Reset the bench','the reset hotspot');run('press36(1);frames36(2);');
  const cp=J('BENCH36.CHECK.findIndex(c=>Math.abs(c.x-BENCH36.pose.x)<1e-6&&Math.abs(c.z-BENCH36.pose.z)<1e-6)');assert(cp>=0,'on a checkpoint');assert.equal(J('hbMatch36(BENCH36.pose,[pos36(0),pos36(1)])'),true,'liftable');
  assert.equal(J('benchCrateIntrudes36(crate.position.x,crate.position.z)'),false,'the crate moved clear');
  // the Menu reset with the bench in the passage
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J('drive36(PLAN36,7200,()=>BENCH36.pose.x<-1.15&&BENCH36.pose.z>2.4)');const inP=J('bench36Pose()');assert(inP.x<-1.15&&inP.x>-2.35&&inP.z>1.6&&inP.z<3.2,'in the passage');
  run('openMenu();');const menu=J('panel.innerHTML');assert(menu.includes('data-act="bench36Reset"'),'the Menu offers the reset');assert(menu.indexOf('bench36Reset')<menu.indexOf('<h2>'),'at the top of the Menu');run('dispatch("bench36Reset");frames36(1);');
  const cp2=J('BENCH36.CHECK.findIndex(c=>Math.abs(c.x-BENCH36.pose.x)<1e-6&&Math.abs(c.z-BENCH36.pose.z)<1e-6)');assert.equal(J('BENCH36.state'),'grounded');assert(cp2>=0,'menu reset on a checkpoint');
  return {stuckAfter:r3(stuck[1]),reset:J('BENCH36.CHECK['+cp+'].n'),menuReset:J('BENCH36.CHECK['+cp2+'].n')};});

 check(10,()=>{const out={};const setup=()=>{run('fresh36();start36();');run(`{const e=benchEnd36(BENCH36.pose,1,1.05),w=benchEnd36(BENCH36.pose,0,1.05);at36(0,e[0],e[1]);at36(1,w[0],w[1]);}frames36(2);press36(0);frames36(3);press36(1);frames36(3);`);
   assert.equal(J('BENCH36.state'),'carrying');};
  const mKey=sg=>`{const B=BENCH36,a=benchAxis36(B.pose.yaw),f=B.front?1:-1;setKeys36(B.mover,combo36(a[0]*f*${sg},a[1]*f*${sg}));}`;
  const tKey=sg=>`{const B=BENCH36,f=B.front?1:-1;setKeys36(1-B.mover,combo36(Math.sin(B.pose.yaw)*f*${sg},Math.cos(B.pose.yaw)*f*${sg}));}`;
  setup();// taps (100 ms = 3 frames at 30 fps), west, away from the rail
  let p0=J('bench36Pose()');run(mKey(-1)+'frames36(3);noKeys36();frames36(10);');let p1=J('bench36Pose()');out.tap=r3(Math.hypot(p1.x-p0.x,p1.z-p0.z)*100);assert(out.tap<=3,'tap '+out.tap+' cm');
  p0=p1;run(tKey(1)+'frames36(3);noKeys36();frames36(10);');p1=J('bench36Pose()');out.tapTurn=deg(Math.abs(p1.yaw-p0.yaw));assert(out.tapTurn<=1.5,'turn tap '+out.tapTurn);
  run(tKey(-1)+'frames36(3);noKeys36();frames36(10);');
  // full speed back (west) then release: the coast; speeds both ways
  run(mKey(-1)+'frames36(30);');const a1=J('bench36Pose()');run('frames36(9);');const a2=J('bench36Pose()');const vBack=Math.hypot(a2.x-a1.x,a2.z-a1.z)/0.3;run('noKeys36();');const c0=J('bench36Pose()');run('frames36(15);');const c1=J('bench36Pose()');
  out.coast=r3(Math.hypot(c1.x-c0.x,c1.z-c0.z)*100);assert(out.coast<=5,'coast '+out.coast);
  run(mKey(1)+'frames36(30);');const b1=J('bench36Pose()');run('frames36(9);');const b2=J('bench36Pose()');const vFwd=Math.hypot(b2.x-b1.x,b2.z-b1.z)/0.3;run('noKeys36();frames36(15);');
  out.speeds=[r3(vFwd),r3(vBack)];assert(Math.abs(vFwd-vBack)<1e-6,'equal speeds '+out.speeds);
  // one held key: the plan's first 95-degree turn (back a little first, as the plan does)
  setup();run(mKey(-1)+'frames36(3);noKeys36();frames36(6);');const y0=J('BENCH36.pose.yaw');const combo=J(`(()=>{const B=BENCH36,f=B.front?1:-1;return combo36(Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f);})()`);
  let turned=0;for(let k=0;k<120;k++){run(`setKeys36(1-BENCH36.mover,${JSON.stringify(combo)});frames36(1);`);turned=Math.abs(J('BENCH36.pose.yaw')-y0);if(turned>=95*Math.PI/180)break;}
  run('noKeys36();frames36(10);');out.heldTurn=deg(turned);assert(turned>=95*Math.PI/180,'a held key turned '+out.heldTurn);
  const cc=J('BENCH36.pose.yaw');run(`setKeys36(1-BENCH36.mover,${JSON.stringify(combo)});frames36(1);noKeys36();frames36(5);`);
  // the Menu mid-carry: open (the step is paused), close: at rest, no lurch
  run(mKey(-1)+'frames36(20);');const vm=J('BENCH36.vel.s');run('openMenu();overlayOn36(true);frames36(8);closePanel();overlayOn36(false);');const vAfter=J('[BENCH36.vel.s,BENCH36.vel.w]');const pm=J('bench36Pose()');run('frames36(1);');const pn=J('bench36Pose()');
  assert(Math.abs(vm)>0.5,'moving before the Menu');assert.deepEqual(vAfter,[0,0],'at rest after the Menu');assert(Math.hypot(pn.x-pm.x,pn.z-pm.z)<0.002,'no lurch');
  out.menu='rest';return out;});

 check(11,()=>{const out={};run('fresh36();at36(0,-5.2,3.6);at36(1,-6.2,3.6);');
  for(const [nm,extra] of [['default',null],['chairs',{type:'chairs',x:5,y:4}],['armchair',{type:'armchair',x:5,y:4}]]){run(`S.home.items=S.home.items.filter(i=>!/^lay/.test(i.id));${extra?`S.home.items.push(Object.assign({id:'lay1',rot:0},${JSON.stringify(extra)}));`:''}rebuildFurniture();`);
   const r=J(`['out','gate','water'].map(k=>{const n=TUNE35.reachRuns;const s=cellToWorld(4,3);const free=!blocked(s[0],s[1]+0.05,PR,{noCrate:true,noSofa:true});const ok=bench36ArrangementOK(k);return [ok,TUNE35.reachRuns-n,free];})`);
   for(const x of r){assert.equal(x[0],true,nm+' arrangement');assert.equal(x[1],1,'a reach run');assert.equal(x[2],true,'reach start free');}out[nm]=r.map(x=>x[0]);}
  run("S.home.items=S.home.items.filter(i=>!/^lay/.test(i.id));rebuildFurniture();");
  // the first chooser: the doorway bench lies over the reach start, the candidates are still judged on their own
  run('start36();takeEnds36('+FE+',0);lift36(0,1);');deliver({fresh:true});assert.equal(J('BENCH36.state'),'choosing');run('save();var CH36=localStorage.getItem(KEY);');
  const s=J("(()=>{const s=cellToWorld(4,3);return !!blocked(s[0],s[1]+0.05,PR,{noCrate:true,noSofa:true});})()");
  // the chooser checks the selected arrangement when it opens and the others one a frame after
  run('frames36(3);');
  const inside=J("['out','gate','water'].map(k=>bench36ArrangementOK(k))");assert.deepEqual(inside,[true,true,true],'in the first chooser');assert.deepEqual(J("BENCH36.okCache"),{out:true,gate:true,water:true});
  run("BENCH36.POSES.test36={name:'Test',x:-6.44,z:6.12,yaw:0,desc:''};");const blockOK=J("bench36ArrangementOK('test36')");run('delete BENCH36.POSES.test36;');assert.equal(blockOK,false,'a candidate over the pot keep fails');
  // the ghost stands at the pose; one agreement does not commit; a change clears both
  const gh=J("(()=>{const g=BENCH36.mesh.ghost;g.updateMatrixWorld(true);const p=new THREE.Vector3().setFromMatrixPosition(g.matrixWorld),q=benchPoseOf36(BENCH36.choice);return [Math.abs(p.x-q.x)<1e-9&&Math.abs(p.z-q.z)<1e-9,Math.abs(g.rotation.y-q.yaw)<1e-9];})()");assert.deepEqual(gh,[true,true],'ghost at the pose');
  run('press36(0);frames36(2);');assert.deepEqual(J('[BENCH36.state,BENCH36.agree]'),['choosing',[true,false]],'one agreement does not commit');
  run("keys['d']=true;frames36(2);keys['d']=false;frames36(2);");assert.deepEqual(J('[BENCH36.choice,BENCH36.agree]'),['gate',[false,false]],'a change clears both');
  // a player standing where the gate arrangement goes is moved clear first
  run('at36(1,-5.95,6.4);frames36(1);press36(0);frames36(1);press36(1);frames36(1);');assert.equal(J('BENCH36.state'),'settling');const pl=J('pos36(1)');
  assert.equal(J(`(()=>{const b=benchBox36(benchPoseOf36('gate'),0);return bench36CircleOBB(${pl[0]},${pl[1]},PR,b);})()`),false,'the player is clear of the gate box');
  for(let k=0;k<400&&J('BENCH36.state')==='settling';k++)run('frames36(1)');
  const item=J("S.home.items.find(i=>i.type==='bench')");delete item.id;assert.deepEqual(item,{type:'bench',x:0,y:4,rot:0,pose36:'gate'});
  assert.equal(J("LOG35.has(S.day,'place','bench')"),true,'the day log has place bench:veranda');assert.equal(J("LOG35.events(S.day).filter(e=>e.k==='place').map(e=>e.a).pop()"),'bench:veranda');
  // a piece beside the doorway (cell 5,4) leaves the row holder nowhere to step aside: the bench still glides, in two legs (the room holder steps
  // aside, the bench backs into the room, the row holder comes in through the doorway, the bench goes out to its place)
  walls();const legs={},bad0=J('WALL36.settleBad.length'),g0=J('WALL36.settle');
  for(const [nm,extra,key] of [['armchair',{type:'armchair',x:5,y:4},'out'],['armchair',{type:'armchair',x:5,y:4},'gate'],['armchair',{type:'armchair',x:5,y:4},'water'],['chairs',{type:'chairs',x:5,y:4},'water'],['plant',{type:'plant',x:5,y:4},'gate']]){
   run(`{const o=JSON.parse(CH36);o.home.items.push(Object.assign({id:'lay2',rot:0},${JSON.stringify(extra)}));localStorage.setItem(KEY,JSON.stringify(o));S=load();enterWorld();closePanel();frames36(4);}`);
   assert.equal(J('BENCH36.state'),'choosing',nm+': the chooser is back');assert.equal(agreeOn(key),'placed',nm+' '+key+' placed');
   assert.equal(J('BENCH36.lastSettle'),'glide',nm+' '+key+' glides');legs[nm+' '+key]=J('BENCH36.lastLegs');assert.equal(J("S.home.items.find(i=>i.type==='bench').pose36"),key);}
  assert.equal(J('WALL36.settleBad.length'),bad0,'a glide frame hit something: '+JSON.stringify(J('WALL36.settleBad')));assert(J('WALL36.settle')>g0,'glide frames tested');
  out.chooser={doorwayCoversStart:s,inside};out.kind=J("BENCH36.states.includes('settling')");out.legs=legs;return out;});

 check(12,()=>{const out={};
  // placed: pose, mesh transform and pose36 survive
  run("fresh36();life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'water',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i90',type:'bench',x:0,y:4,rot:0,pose36:'water'});reload36();");
  const g=J("(()=>{const g=furnGroup.children.find(c=>c.userData.furnitureType==='bench');return [g.position.x,g.position.y,g.position.z,g.rotation.y];})()"),w=J("benchPoseOf36('water')");
  assert.deepEqual([g[0],g[2],g[3]],[w.x,w.z,w.yaw],'placed mesh at the pose');run('reload36();');assert.deepEqual(J("(()=>{const g=furnGroup.children.find(c=>c.userData.furnitureType==='bench');return [g.position.x,g.position.y,g.position.z,g.rotation.y];})()"),g);
  assert.equal(J("S.home.items.find(i=>i.type==='bench').pose36"),'water');assert.equal(J('BENCH36.state'),'placed');
  // mid-carry: the same pose, grounded and liftable
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J('drive36(PLAN36,7200,seg=>seg>='+SEG.courtyard+')');assert.equal(J('BENCH36.state'),'carrying');const pc=J('bench36Pose()');run('reload36();');
  const pr=J('[BENCH36.state,bench36Pose()]');assert.equal(pr[0],'grounded');assert.deepEqual(pr[1],pc,'reloaded at the pose it was saved at');assert.equal(J('hbMatch36(BENCH36.pose,[pos36(0),pos36(1)])'),true,'liftable');
  const mesh=J('[BENCH36.g.position.x,BENCH36.g.position.z,BENCH36.g.rotation.y]');assert.deepEqual(mesh,[pc.x,pc.z,pc.yaw],'mesh at the pose');
  // the chooser comes back
  run('takeEnds36(BENCH36.front,BENCH36.mover);');run('lift36(BENCH36.mover,1-BENCH36.mover);');J('drive36(PLAN36,7200)');assert.equal(J('BENCH36.state'),'choosing');run("keys['d']=true;frames36(2);keys['d']=false;frames36(2);reload36();");
  assert.deepEqual(J('[BENCH36.state,BENCH36.choice,!!BENCH36.mesh.ghost&&BENCH36.mesh.ghost.visible]'),['choosing','gate',true],'the chooser reopens');
  // an old save: nothing added
  run("fresh36();delete S.life.bench36;S.home.items=S.home.items.filter(i=>i.type!=='bench');reload36();");assert.deepEqual(J("[BENCH36.state,!!(S.life&&S.life.bench36),S.home.items.some(i=>i.type==='bench'),!!scene.getObjectByName('bench36')]"),['off',false,false,false]);
  // placed with no item heals
  run("life34();S.life.bench36={v:1,state:'placed',choice:'gate'};reload36();");assert.deepEqual(J("[BENCH36.state,S.home.items.filter(i=>i.type==='bench').map(i=>i.pose36)]"),['placed',['gate']]);
  // online: only {v,state,choice}; a delivery in progress is not shared
  const st=J("stripState().life.bench36");assert.deepEqual(st,{v:1,state:'placed',choice:'gate'});run("S.life.bench36.state='grounded';");assert.equal(J("'bench36' in stripState().life"),false);run("S.life.bench36.state='placed';");
  // ?bench=fresh applies once
  run("location.search='?bench=fresh';BENCH36.readFlags();reload36();");assert.equal(J('BENCH36.state'),'grounded','the fresh flag starts a delivery');assert.equal(J('S.life.bench36.again'),true);
  run("ACTIONS.bench36Cancel();BENCH36.flags=null;location.search='?bench=fresh';BENCH36.readFlags();reload36();");assert.equal(J('BENCH36.state'),'placed','a second load with the same address does not');run("location.search='';BENCH36.flags=null;");
  // Build: no store, no pick-up, neither button
  const id=J("S.home.items.find(i=>i.type==='bench').id");run(`TOASTS=[];dispatch('storeitem',{id:'${id}'});dispatch('pickup',{id:'${id}',i:0});`);assert.equal(J("S.home.items.some(i=>i.type==='bench')"),true,'still placed');assert.equal(J("TOASTS.filter(t=>/stays where you put it/.test(t)).length"),2);
  run('at36(0,-5.2,3.6);openBuild();');const b=J('panel.innerHTML');assert(b.includes('Wooden bench'),'listed');assert(!b.includes(`data-act="pickup" data-id="${id}"`)&&!b.includes(`data-act="storeitem" data-id="${id}"`),'no buttons for the bench');run('closePanel();');
  // a fresh delivery's chooser (placed: Gate): browse to Water, save, leave the bench where it was
  run(`fresh36();life34();S.life.bench36={v:1,state:'choosing',pos:[-4.0166,5.0218],yaw:4.5307,mover:0,choice:'gate',deliveries:1,again:true,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i96',type:'bench',x:0,y:4,rot:0,pose36:'gate'});
   at36(0,-4.2154,6.1037);at36(1,-3.8178,3.9399);reload36();frames36(3);`);assert.deepEqual(J('[BENCH36.state,BENCH36.choice]'),['choosing','gate'],'the fresh delivery’s chooser, on Gate');
  run("keys['d']=true;frames36(2);keys['d']=false;frames36(2);save();");const br=J('[BENCH36.choice,S.life.bench36.choice,stripState().life]');assert.equal(br[0],'water');assert.equal(br[1],'gate','the saved arrangement is still Gate');assert.equal('bench36' in br[2],false,'not shared mid-run');
  run('ACTIONS.bench36Cancel();frames36(2);');const lv=J("[S.life.bench36.choice,S.life.bench36.pick===undefined,stripState().life.bench36,S.home.items.find(i=>i.type==='bench').pose36]");
  assert.deepEqual(lv,['gate',true,{v:1,state:'placed',choice:'gate'},'gate'],'left where it was: Gate everywhere');run('ACTIONS.bench36Again();');assert.equal(J('BENCH36.choice'),'gate','the next run starts from Gate');run('ACTIONS.bench36Cancel();');
  // playtest: the next run starts each player in the job the other started the last one with, whoever ended up walking it after a swap
  run("fresh36();life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:true,runs:[],firstMover:1,lastMover:0};S.home.items.push({id:'i97',type:'bench',x:0,y:4,rot:0,pose36:'out'});reload36();ACTIONS.bench36Again();");
  assert.equal(J('BENCH36.mover'),0,'started by Player 2 walking it, so Player 1 walks it next');run('ACTIONS.bench36Cancel();');
  out.placed=w;out.carry=true;return {placed:[r3(w.x),r3(w.z),deg(w.yaw)],carry:'grounded',strip:st,browse:'kept',preSwap:'from the first mover'};});

 check(13,()=>{run("fresh36();life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i91',type:'bench',x:0,y:4,rot:0,pose36:'out'});reload36();");
  run('at36(0,-5.95,6.4);at36(1,-5.4,6.5);frames36(2);');assert.equal(J('hotspotCache[0].label'),'Sit on the bench together');run('press36(0);frames36(3);');
  const s=J("players.map(p=>{const h=p.g.hero.bones.hips.getWorldPosition(new THREE.Vector3()),f=p.g.hero.bones.leftfoot.getWorldPosition(new THREE.Vector3());return [h.y,f.y,p.g.sitting,new THREE.Euler().setFromQuaternion(p.g.quaternion,'YXZ').y,p.g.position.x,p.g.position.z];})");
  for(const p of s){assert.equal(p[2],true,'sitting');assert(Math.abs(p[0]-0.61)<=0.03,'hips '+p[0]);assert(p[1]<=0.2,'feet '+p[1]);assert(Math.abs(p[3])<=2*Math.PI/180,'facing '+p[3]);}
  assert(Math.abs(Math.hypot(s[0][4]-s[1][4],s[0][5]-s[1][5])-0.72)<0.01,'seats 0.72 apart');
  run('openMenu();closePanel();frames36(2);');assert.equal(J('[BENCH36.state,SEATING30.active].join()'),'seated,true','the Menu keeps them seated');
  run("setKeys36(0,[0,-1]);frames36(10);noKeys36();frames36(1);");const st=J('[BENCH36.state,SEATING30.active,pos36(0),pos36(1)]');assert.equal(st[0],'placed');assert.equal(st[1],false);
  for(const q of [st[2],st[3]])assert.equal(J(`!!blocked(${q[0]},${q[1]},PR)`),false,'stands on a free spot');
  // past midnight: Start day, nobody sitting, both in the room, the save agrees
  run('frames36(2);press36(0);frames36(3);');assert.equal(J('BENCH36.state'),'seated');run('S.time=24.1;');for(let k=0;k<200&&!J('S._late');k++)run('frames36(5)');assert(J('/Past midnight/.test(PH)'),'the past-midnight panel');
  run("dispatch('nextday');frames36(2);");const n=J("[players.map(p=>p.g.sitting),SEATING30.active,BENCH36.state,pos36(0),pos36(1),S.p.map(p=>p.pos)]");
  assert.deepEqual(n[0],[false,false]);assert.equal(n[1],false);assert.equal(n[2],'placed');assert.deepEqual([n[3],n[4]],[[-6.2,4.4],[-5.2,4.4]],'both in the room');assert.deepEqual(n[5],[[-6.2,4.4],[-5.2,4.4]],'the save says so');
  // a day change by any other route (as a shared document arriving online would) stands them up at the next panel close
  run('at36(0,-5.95,6.4);at36(1,-5.4,6.5);frames36(2);press36(0);frames36(3);');assert.equal(J('BENCH36.state'),'seated');run('S.day++;openMenu();closePanel();frames36(1);');assert.equal(J('[BENCH36.state,SEATING30.active].join()'),'placed,false','stood up after the day changed');
  return {hips:r3(s[0][0]),feet:r3(s[0][1]),apart:r3(Math.hypot(s[0][4]-s[1][4],s[0][5]-s[1][5]))};});

 check(14,()=>{const res={desk:[],phone:[]};run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');
  run('var CD36={max:0,prev:null,skip:0};ONF36=()=>{const d=[v21Dist[0],v21Dist[1]];if(CD36.prev&&!CD36.skip&&BENCH36.state==="carrying")for(const i of [0,1])CD36.max=Math.max(CD36.max,Math.abs(d[i]-CD36.prev[i])/CD36.prev[i]);if(CD36.skip)CD36.skip--;CD36.prev=d;};');
  run(`var view36=i=>{const vp=v21Viewport(i),c=cams[i];c.aspect=vp.w/vp.h;c.updateProjectionMatrix();c.updateMatrixWorld();const lo=-1+2*vp.bottom/vp.h,hi=1-2*vp.top/vp.h,v=new THREE.Vector3();
    const inside=pts=>pts.every(([x,y,z])=>{v.set(x,y,z).project(c);return Math.abs(v.x)<=0.82+0.02&&v.y>=lo-0.02&&v.y<=hi+0.02;});const B=BENCH36,info=B.camInfo&&B.camInfo[i]||{};
    const obb=[];{const cc=Math.cos(B.pose.yaw),s=Math.sin(B.pose.yaw);for(const [a,b] of [[-.76,-.26],[.76,-.26],[.76,.26],[-.76,.26]])for(const y of [B.y,B.y+0.95])obb.push([B.pose.x+a*cc+b*s,y,B.pose.z-a*s+b*cc]);}
    const hold=players.map(p=>{const q=p.g.position;const a=[];for(const dx of [-.3,.3])for(const y of [0,1.9])for(const dz of [-.3,.3])a.push([q.x+dx,y,q.z+dz]);return a;});
    const corner=info.P?[[info.P[0]-.3,0,info.P[1]-.3],[info.P[0]+.3,.6,info.P[1]+.3]]:[];
    const px=players.map(p=>{const q=p.g.position;const a=new THREE.Vector3(q.x,0,q.z).project(c),b=new THREE.Vector3(q.x,1.9,q.z).project(c);return (b.y-a.y)/2*vp.h;});
    // where this view draws the next corner, from the bench (the corner taken at most 4 m out, as the arrow does)
    const W=B.ROUTE[B.corner];let want=null;if(W){const dx=W.x-B.pose.x,dz=W.z-B.pose.z,n=Math.hypot(dx,dz)||1,k=Math.min(1,4/n),a=new THREE.Vector3(B.pose.x,0.4,B.pose.z).project(c),b=new THREE.Vector3(B.pose.x+dx*k,0.4,B.pose.z+dz*k).project(c);want=Math.atan2(-(b.y-a.y)*vp.h,(b.x-a.x)*vp.w)*180/Math.PI;}
    const ang=B.arrowAng&&B.arrowAng[i],ap=B.arrowPos&&B.arrowPos[i];let off=null;if(ang!=null&&want!=null){off=Math.abs(ang-want)%360;if(off>180)off=360-off;}
    const apIn=!!ap&&ap[0]>=vp.w*0.1&&ap[0]<=vp.w*0.9&&ap[1]>=vp.top&&ap[1]<=vp.h-vp.bottom;
    const pr=document.getElementById('pr'+i).innerHTML;return {Hu:vp.h-vp.top-vp.bottom,bench:inside(obb),holders:inside(hold[0])&&inside(hold[1]),corner:info.P?inside(corner):null,kept:!!info.kept,dropped:!!info.dropped,arrow:!!info.arrow,px:Math.min(...px),chip:pr.includes('role36 '+(i===B.mover?'move':'turn')),off,apIn,shown:B.arrowShown[i]};};`);
  const N=J('BENCH36.CHECK.length');let next=0;const seen=[];
  for(let f=0;f<7200&&J('BENCH36.state')==='carrying';){const r=J(`drive36(PLAN36,7200,()=>{const c=BENCH36.CHECK[${next}];return c&&Math.hypot(BENCH36.pose.x-c.x,BENCH36.pose.z-c.z)<=1.0;})`);f+=r.f;if(r.r!=='stop')break;
   const at={cp:J(`BENCH36.CHECK[${next}].n`)};
   for(const [w,h,touch,key] of [[1280,800,false,'d1'],[1280,720,false,'d2'],[390,844,true,'p1'],[844,390,true,'p2']]){run(`screen36(${w},${h},${touch});CD36.skip=45;frames36(40);`);at[key]=J('[view36(0),view36(1)]');}
   run('screen36(1280,800,false);CD36.skip=45;frames36(30);');seen.push(at);next++;if(next>=N)break;}
  assert.equal(seen.length,N,'reached the five checkpoints: '+seen.length);let edges=0;
  for(const at of seen){for(const k of ['d1','d2'])for(const v of at[k]){assert(v.bench&&v.holders,`${at.cp} ${k}: bench and holders in view`);assert.equal(v.kept,true,`${at.cp} ${k}: corner point kept`);assert.equal(v.corner,true,`${at.cp} ${k}: corner in view`);assert(v.px>=70,`${at.cp} ${k}: ${v.px} px`);assert.equal(v.chip,true,`${at.cp} ${k}: chip`);}
   for(const k of ['p1','p2'])for(const v of at[k]){assert(v.Hu<260&&!v.kept&&v.arrow,`${at.cp} ${k}: dropped for the arrow`);if(v.shown==='edge'){edges++;assert(v.off!==null&&v.off<=3,`${at.cp} ${k}: the arrow points ${v.off} degrees off the corner`);assert(v.apIn,`${at.cp} ${k}: the arrow sits on the edge of the framed area`);}}
   res.desk.push({cp:at.cp,px:at.d1.map(v=>Math.round(v.px)).concat(at.d2.map(v=>Math.round(v.px)))});res.phone.push({cp:at.cp,px:at.p1.map(v=>Math.round(v.px)).concat(at.p2.map(v=>Math.round(v.px)))});}
  assert(edges>=10,'edge arrows checked: '+edges);res.edgeArrows=edges;
  run('ONF36=null;');J('drive36(PLAN36,7200)');assert.equal(J('BENCH36.state'),'choosing');run('frames36(30);');
  const gh=J(`[0,1].map(i=>{const vp=v21Viewport(i),c=cams[i];c.aspect=vp.w/vp.h;c.updateProjectionMatrix();c.updateMatrixWorld();const lo=-1+2*vp.bottom/vp.h,hi=1-2*vp.top/vp.h,g=BENCH36.mesh.ghost,b=new THREE.Box3().setFromObject(g);let ok=true;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const v=new THREE.Vector3(x,y,z).project(c);if(!(Math.abs(v.x)<=0.84&&v.y>=lo-0.02&&v.y<=hi+0.02))ok=false;}return ok;})`);
  assert.deepEqual(gh,[true,true],'the ghost is in both views');const cd=J('CD36.max');assert(cd<=0.025,'camera distance per frame '+cd);res.camStep=cd<=0.025;return res;});

 check(15,()=>{const out={};run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);');run('BENCH36.onPadGone({gamepad:{index:BENCH36.holder[0]}});frames36(1);');assert.equal(J('BENCH36.state'),'grounded','a holder’s pad gone: set down');
  run('lift36(0,1);');assert.equal(J('BENCH36.state'),'carrying');run('NET.on=true;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};frames36(2);');const on=J("[BENCH36.state,BENCH36.paused,BENCH36.g.visible,(()=>{const p=BENCH36.pose;return !!blocked(p.x,p.z,0.05);})()]");
  assert.deepEqual(on,['grounded',true,false,false],'online: set down, paused, absent');run('NET.on=false;frames36(2);');assert.equal(J('BENCH36.paused'),false,'back to local play');
  // an open fresh delivery is cancelled online
  run("fresh36();life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i92',type:'bench',x:0,y:4,rot:0,pose36:'out'});reload36();ACTIONS.bench36Again();");
  assert.equal(J('[BENCH36.state,S.life.bench36.again].join()'),'grounded,true');run('NET.on=true;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};frames36(2);');assert.equal(J('[BENCH36.state,S.life.bench36.again].join()'),'placed,false','cancelled online');
  assert.equal(J("furnGroup.children.find(c=>c.userData.furnitureType==='bench').visible"),true,'the placed bench is back');run('NET.on=false;');
  // seated together, then the household goes online: they stand up
  run("frames36(2);at36(0,-5.95,6.4);at36(1,-5.4,6.5);frames36(2);press36(0);frames36(3);");assert.equal(J('BENCH36.state'),'seated');run('NET.on=true;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};frames36(3);');
  assert.deepEqual(J('[BENCH36.state,SEATING30.active,players.map(p=>!!p.g.sitting)]'),['placed',false,[false,false]],'online: stood up');run('NET.on=false;frames36(1);');
  // back on one device after a player stood where the absent bench lay (in the passage): the player is moved clear and the bench stays where it was
  run(`fresh36();start36();atEnds36({x:-1.568,z:2.6,yaw:-Math.PI/2});loadAt36(-1.568,2.6,-90);NET.on=true;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};frames36(3);at36(0,-1.47,2.6);frames36(2);NET.on=false;frames36(3);`);
  const back=J('[bench36Pose(),BENCH36.paused,(()=>{const q=pos36(0);return hbInBox36(q[0],q[1],PR-0.02,BENCH36.pose);})()]');assert.deepEqual([back[0].x,back[0].z],[-1.568,2.6],'the bench stays in the passage');assert.equal(back[1],false);assert.equal(back[2],false,'the player is moved clear');
  // an online household (day 2, the sofa in) is told why there is no bench
  run('fresh36();NET.on=true;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};openMenu();');assert(J('panel.innerHTML').includes('Carry Ada’s bench when you are both on one device.'),'the one-device line online');run('closePanel();NET.on=false;');
  // a first delivery left for now: the bench goes, the progress stays, the offer comes back (and survives a reload)
  run('fresh36();start36();openMenu();');assert(J('panel.innerHTML').includes('data-act="bench36Leave"'),'the Menu offers to leave it');run('dispatch("bench36Leave");frames36(2);');
  assert.deepEqual(J("[BENCH36.state,S.life.bench36.state,!!scene.getObjectByName('bench36')]"),['off','off',false],'left for now');run('reload36();openMenu();');
  assert(J('panel.innerHTML').includes('data-act="bench36Start"'),'the offer is back');assert.equal(J('start36()'),'grounded','and it can be fetched again');
  // a companion household: no offer; with ?bench= the line, and nothing spawns
  run("NET.on=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();dispatch('movein');closePanel();sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();openMenu();");
  const m0=J('panel.innerHTML');assert(m0.includes('needs two pairs of hands'),'the two-hands line for a companion household, with no flag');assert(!/bench36Start|Ada left her bench/.test(m0),'no offer for a companion household');
  run("location.search='?bench=on';BENCH36.readFlags();openMenu();");const m1=J('panel.innerHTML');assert(m1.includes('needs two pairs of hands'),'the two-hands line');assert(!m1.includes('bench36Start'),'no offer');
  run("TOASTS=[];bench36Start();");assert.equal(J('BENCH36.state'),'off','nothing spawns');run("location.search='';BENCH36.flags=null;closePanel();AI.on=false;");
  // the evening waits while the bench is in hands (carried in the room), starts once it lies on the ground, and starts once it is placed
  run(`fresh36();S.day=3;S.time=17;start36();atEnds36({x:-3.6,z:4.3,yaw:Math.PI/2});loadAt36(-3.6,4.3,90);press36(0);frames36(3);press36(1);frames36(3);S.time=18.5;`);
  assert.equal(J('BENCH36.state'),'carrying');const p0=J('EVENING35.pending()');run('frames36(90);');const ev=J('[EVENING35.state,EVENING35.pending()]');
  assert.deepEqual(ev,['idle',p0],'no evening while the bench is carried, pending() unchanged');assert.equal(p0,true);
  run('press36(0);frames36(10);');assert.equal(J('BENCH36.state'),'grounded');run('frames36(60);');assert.notEqual(J('EVENING35.state'),'idle','the evening starts with the bench lying on the ground');run('EVENING35.abort(false);');
  run("save();loadFixture36(o=>{o.life.bench36.state='placed';o.life.bench36.choice='out';o.life.bench36.placedDay=2;o.home.items.push({id:'i93',type:'bench',x:0,y:4,rot:0,pose36:'out'});});at36(0,-5.2,3.6);at36(1,-6.2,3.6);frames36(60);");
  assert.notEqual(J('EVENING35.state'),'idle','the evening starts once the bench is placed');run('EVENING35.abort(false);');
  // Ada, the day after placement: adb36 once
  run("S.time=10;");const t1=J("talk(0,'ada')"),t2=J("talk(0,'ada')");assert(t1.includes('Then it is yours twice'),'adb36: '+t1.slice(0,120));assert(!t2.includes('Then it is yours twice'),'once');
  out.evening='waits while carried';out.adb36=true;out.lines=J("Object.keys(LINES35).filter(k=>Array.isArray(LINES35[k])).map(k=>k+':'+LINES35[k].length).join(',')");
  assert(!/adb36|ae36/.test(J("JSON.stringify(LINES35)")),'LINES35 has no v36 entry');return out;});

 check(16,()=>{const out={};for(const k of ['out','gate','water']){run(`fresh36();life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'${k}',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i94',type:'bench',x:0,y:4,rot:0,pose36:'${k}'});reload36();`);
   run('at36(0,-5.6,6.35);at36(1,-5.2,4.4);frames36(2);');const pot=J('hotspotCache[0].label');assert(/pepper pot|Harvest your peppers/.test(pot),k+': pot point gives '+pot);
   run('at36(0,-5.95,6.4);frames36(2);');const sit=J('hotspotCache[0].label');assert(/^(Sit on the bench together|Wait for Ola)$/.test(sit),k+': '+sit);out[k]=[pot,sit];}
  run('fresh36();start36();');const e=J('benchEnd36(BENCH36.pose,1,1.05)');run(`at36(0,${e[0]},${e[1]-0.05});at36(1,${e[0]},${e[1]+0.05});frames36(2);TOASTS=[];press36(0);press36(1);frames36(2);`);
  const r=J('[BENCH36.state,BENCH36.holder,TOASTS.slice(-1)[0]]');assert.equal(r[0],'ready');assert.equal(r[1].filter(x=>x!==null).length,1,'one holder');assert.equal(r[2],'Efe has that end. Take the other one.');out.same=r[2];
  // the room checkpoint lies across the veranda doorway's mouth: from the row, the straight step to the south stand point cuts the jamb
  run(`fresh36();start36();atEnds36({x:-3.6,z:4.3,yaw:Math.PI/2});loadAt36(-3.6,4.3,90);at36(0,-3.95,5.9);frames36(3);TOASTS=[];`);
  const round=J('hotspotCache[0]&&hotspotCache[0].label');assert.equal(round,'Come round to this end','from round the jamb');run('press36(0);frames36(3);');
  assert.deepEqual(J('[BENCH36.state,TOASTS.slice(-1)[0]]'),['grounded','Come round to this end first.'],'no slide through the jamb');
  run('at36(0,-3.6,5.25);frames36(3);');assert.equal(J('hotspotCache[0]&&hotspotCache[0].label'),'Take this end','straight on');run('press36(0);frames36(3);');assert.equal(J('BENCH36.state'),'ready');out.round=round;return out;});

 check(17,()=>{run('fresh36();');
  run(`var CO36={on:false,bl:0,box:0,frames:[],idle:[]};{const b=blocked;blocked=function(){if(CO36.on)CO36.bl++;return b.apply(this,arguments);};const o=bench36ObbHit;bench36ObbHit=function(){if(CO36.on)CO36.box++;return o.apply(this,arguments);};
   const st=bench36Step;bench36Step=function(dt){const s0=BENCH36.state,n0=BENCH36.cost.substeps;CO36.on=true;CO36.bl=0;CO36.box=0;try{return st.apply(this,arguments);}finally{CO36.on=false;const n=BENCH36.cost.substeps-n0;if(s0==='carrying'&&BENCH36.state==='carrying')CO36.frames.push([n,CO36.bl,CO36.box]);else if(s0==='off'||s0==='placed')CO36.idle.push(CO36.bl);}};
   const hk=bench36Hot;HOTSPOT_HOOKS[HOTSPOT_HOOKS.indexOf(hk)]=function(){CO36.on=true;const c0=CO36.bl;try{return hk.apply(this,arguments);}finally{CO36.on=false;if(BENCH36.state==='off'||BENCH36.state==='placed')CO36.idle.push(CO36.bl-c0);CO36.bl=c0;}};}`);
  // the bench's own work each frame (all of tick: an Act's work too), counted: planner box tests, arrangement checks, walks and their cells
  run(`var W17={prev:null,max:{},plan:0,choose:0},W17on=()=>{ONF36=()=>{const c=BENCH36.cost,s=BENCH36.state;if(W17.prev&&s!=='off'&&s!=='placed'){for(const k of ['nodes','arr','bfs','cells'])W17.max[k]=Math.max(W17.max[k]||0,c[k]-W17.prev[k]);
    if(s==='choosing')W17.choose++;if(s==='settling'&&BENCH36.settle&&BENCH36.settle.kind==='plan'&&BENCH36.settleFrames>0)W17.plan++;}W17.prev={nodes:c.nodes,arr:c.arr,bfs:c.bfs,cells:c.cells};};};`);
  run('frames36(30);start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J('drive36(PLAN36,7200,seg=>seg>='+SEG.corner1+')');
  run(`{const B=BENCH36,a=benchAxis36(B.pose.yaw),f=B.front?1:-1;setKeys36(B.mover,combo36(-a[0]*f,-a[1]*f));setKeys36(1-B.mover,combo36(Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f));}frames36(60);noKeys36();frames36(5);`);
  run('FOL36.o=null;');J('drive36(PLAN36,1500)');
  run('fresh36();start36();W17on();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J('drive36(PLAN36,7200)');assert.equal(J('BENCH36.state'),'choosing','delivered');
  run('frames36(40);');assert.equal(agreeOn('water'),'placed');const W17=J('W17');run('ONF36=null;');
  assert(W17.max.arr<=1,'arrangement checks in one frame: '+W17.max.arr);assert(W17.max.nodes<=J('BENCH_PLAN36.FRAME'),'planner box tests in one frame: '+W17.max.nodes);
  assert.equal(W17.plan,0,'the glide was planned before both agreed');
  run("fresh36();life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i95',type:'bench',x:0,y:4,rot:0,pose36:'out'});reload36();at36(0,-5.95,6.4);at36(1,-5.4,6.5);");assert.equal(J('BENCH36.state'),'placed');
  run('frames36(30);');const C=J('CO36');let worst={sub:0,bl:0,box:0};for(const [n,bl,box] of C.frames){if(!n)continue;worst.sub=Math.max(worst.sub,n);worst.bl=Math.max(worst.bl,(bl-4)/n);worst.box=Math.max(worst.box,(box-2)/n);}
  assert(worst.sub<=2,'sub-steps '+worst.sub);assert(worst.bl<=24,'blocked() calls a sub-step '+worst.bl);assert(worst.box<=12,'box tests a sub-step '+worst.box);
  assert(C.idle.length>0&&C.idle.every(v=>v===0),'idle frames call blocked(): '+C.idle.length+' '+JSON.stringify(C.idle.filter(v=>v).slice(0,5)));
  return {frames:C.frames.length,subMax:worst.sub,blockedMax:worst.bl,boxMax:worst.box,idle:Math.max(...C.idle),frameMax:W17.max};});

 check(18,()=>{run('fresh36();');
  // the page's classes, seen through a recording class list
  run("var CL36=new Set();document.body.classList={add:c=>CL36.add(c),remove:c=>CL36.delete(c),contains:c=>CL36.has(c),toggle:(c,v)=>{const on=v===undefined?!CL36.has(c):!!v;if(on)CL36.add(c);else CL36.delete(c);return on;}};var cls36=()=>[...CL36].filter(c=>/^bench36/.test(c)).sort().join(' ');");
  run('start36();');const e=J('benchEnd36(BENCH36.pose,1,1.05)'),w=J('benchEnd36(BENCH36.pose,0,1.05)');const c0=J('cls36()');run(`at36(0,${e[0]},${e[1]});at36(1,${w[0]},${w[1]});frames36(2);press36(0);frames36(2);press36(1);frames36(10);`);
  const g=J('[glyph(0),glyph(1),lastInput.slice()]');assert.equal(g[0],'E');assert.equal(g[1],'⏎');const pr=J("document.getElementById('pr0').innerHTML");assert(pr.startsWith('<span class="k">E</span>'),'P1 prompt glyph');
  const c1=J('cls36()'),xr=J('!!(BENCH36.xray&&BENCH36.xray.visible)');assert.equal(c0,'','nothing marked before the lift');assert.equal(c1,'bench36-busy','held: busy (and not yet compact: the first lift’s hint is showing)');assert.equal(xr,true,'the see-through outline shows while held');
  // the third lift onwards, once its hint time is over: compact
  run('press36(0);frames36(10);S.life.bench36.hints=2;press36(0);frames36(3);press36(1);frames36(6);');const c2=J('cls36()');assert.equal(c2,'bench36-busy bench36-compact','after the first two lifts the carry prompt is compact');
  run('press36(0);frames36(10);');const c3=J('[cls36(),!!(BENCH36.xray&&BENCH36.xray.visible)]');assert.deepEqual(c3,['',false],'on the ground: nothing marked, no outline');
  run('reload36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J('drive36(PLAN36,7200)');assert.equal(J('BENCH36.state'),'choosing');const c4=J('cls36()');assert.equal(c4,'bench36-busy bench36-choose','the chooser marks the page');
  run('document.body.classList={add(){},remove(){},toggle(){},contains:()=>false};');return {glyphs:[g[0],g[1]],classes:[c0,c1,c2,c3[0],c4]};});
 return out;}

async function inner(only){const h=await world();const res=checks(h,only);return {build:h.run('BUILD_ID'),checks:res};}
async function inertProbe(){const H=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));const {run}=await H.benchWorld();const J=c=>JSON.parse(run('JSON.stringify('+c+')'));
 const pts=[];let s=11;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};for(let k=0;k<3000;k++)pts.push([-8.5+rnd()*15,-3+rnd()*14.5,[0.05,0.26,0.33][k%3]]);
 const blockedBits=J(`${JSON.stringify(pts)}.map(p=>blocked(p[0],p[1],p[2])?1:0).join('')`);
 run(`var FT=0;var keysR=[];var dir=[null,null];let sd=99;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};var LAB=[],DIST=[];
  {const K=[['w','s','a','d'],['arrowup','arrowdown','arrowleft','arrowright']];const rf=renderFrame;renderFrame=function(){};
   for(let f=0;f<600;f++){for(const i of [0,1]){if(r()<0.08)dir[i]=r()<0.2?null:Math.floor(r()*4);for(const k of K[i])keys[k]=false;if(dir[i]!==null)keys[K[i][dir[i]]]=true;}
    T35+=33;PERF35+=33;last=FT;FT+=33;tick(FT);LAB.push(hotspotCache.map(h=>h?h.label:null).join('|'));DIST.push(v21Dist.map(v=>+v.toFixed(9)).join(','));}renderFrame=rf;for(const k of K.flat())keys[k]=false;}`);
 const out={module:J("typeof BENCH36!=='undefined'"),blocked:blockedBits,save:J('JSON.stringify(S)'),dist:J('DIST'),labels:J('LAB'),keys:J('Object.keys(S)'),tickHooks:J('TICK_HOOKS.length'),
  mesh:J("scene.children.filter(c=>/bench36/.test(c.name||'')).length"),lines:J("Object.keys(LINES35).filter(k=>Array.isArray(LINES35[k])).map(k=>k+':'+LINES35[k].length).join(',')")};
 run("NET.on=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();dispatch('movein');closePanel();sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();openMenu();");
 out.menu=J('panel.innerHTML');return out;}

if(process.argv[2]==='--inner'){const only=process.argv[3]?process.argv[3].split(',').map(Number):null;inner(only).then(r=>{process.stdout.write(JSON.stringify(r)+'\n');process.exit(0);}).catch(e=>{console.error(e);process.exit(1);});}
else if(process.argv[2]==='--inert-probe'){inertProbe().then(r=>{process.stdout.write(JSON.stringify(r)+'\n');process.exit(0);}).catch(e=>{console.error(e);process.exit(1);});}
else{(async()=>{
 const child=(args,env)=>new Promise(res=>{const p=cp.spawn(process.execPath,[__filename].concat(args),{env:Object.assign({},process.env,env||{}),stdio:['ignore','pipe','pipe']});let o='',e='';p.stdout.on('data',d=>o+=d);p.stderr.on('data',d=>e+=d);
  p.on('close',code=>{try{res(JSON.parse(o.trim().split('\n').pop()));}catch(x){res({error:(e||o).slice(-600)||('exit '+code)});}});});
 // the two full runs and the mutants, four children at a time (each mutant reruns only its own check in a copy of dist)
 const src=fs.readFileSync(path.join(GAME,'src','bench-v36.js'),'utf8'),dirs=[],mut=[];let a,b;
 const jobs=[async()=>{a=await child(['--inner']);},async()=>{b=await child(['--inner']);}].concat(MUTANTS.map((m,k)=>async()=>{const n=src.split(m.find).length-1;if(n!==1){mut[k]={name:m.name,check:m.check,result:'stale ('+n+' matches)'};return;}
   const d=variantDir(null,t=>t.replace(m.find,m.replace));dirs.push(d);const r=await child(['--inner',String(m.check)],{COMPOUND_GAME_DIR:d});const c=r.checks&&r.checks[0];mut[k]={name:m.name,check:m.check,result:c?(c.passed?'green':'red'):'error'};}));
 try{const q=jobs.slice();await Promise.all([0,1,2,3].map(async()=>{while(q.length)await q.shift()();}));}finally{for(const d of dirs)fs.rmSync(d,{recursive:true,force:true});}
 const same=JSON.stringify(a)===JSON.stringify(b);
 const report={build:a.build||null,passed:!a.error&&same&&a.checks.length===NAMES.length&&a.checks.every(c=>c.passed)&&mut.every(m=>m.result==='red'),checks:a.checks||[],mutants:mut,determinism:same?'identical':'differs'};
 if(a.error)report.error=a.error;
 for(const c of report.checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.passed?'':' -- '+c.failure));
 for(const m of mut)console.log((m.result==='red'?'PASS ':'FAIL ')+'mutant '+m.name+' turns check '+m.check+' '+m.result);
 console.log((same?'PASS ':'FAIL ')+'determinism: two runs give identical reports');if(a.error)console.log('ERROR',a.error);
 fs.writeFileSync(OUT,JSON.stringify(report,null,1)+'\n');console.log(`${report.checks.filter(c=>c.passed).length}/${NAMES.length} checks, ${mut.filter(m=>m.result==='red').length}/${MUTANTS.length} mutants red`);
 process.exitCode=report.passed?0:1;})();}

// v36 Ada's bench: the control plan the harness drives by real keys (check/verify-bench-v36.cjs, check 4). Not used by the game.
// Builds the real world in Node (base, every module, the props, the courtyard diorama and the dressing), makes a local two-player
// household with the real setup actions, places the sofa, starts a delivery (which moves the crate out of the bench's way), then exports
// every box blocked() tests at level 0 and the carry level rule on a 2.5 cm grid. A fewest-control-changes search (0-1 BFS: continuing an
// action costs nothing, changing it costs one) over the bench centre (5 cm) and yaw (5 degrees), with the spec's centre-pivot controls
// (Move: along the bench; Turn: about its centre), finds a way from the gate to the veranda doorway with every shape (the bench box and
// both holder discs, at the radius a holder squeezes in to, BENCH36.HR) inflated by 0.06 m. Both start orientations are tried (which end leads
// is the mover's choice).
// The plan is written to check/bench-route-v36.json as segments {op:'fwd'|'back'|'turnL'|'turnR', until:{x,z,yaw}} (yaw in degrees, the
// direction from the centre to the leading end), with a signature of the world it was made in. Rerun whenever the world changes:
//   node tools/bench-route-v36.cjs            (about a minute)
// The slack (the largest inflation that still leaves a route) is measured with
//   node tools/bench-route-v36.cjs --slack    (tries 0.06 m upwards in 0.02 m steps and writes nothing)
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const GAME=process.env.COMPOUND_GAME_DIR||path.join(ROOT,'dist');process.env.COMPOUND_GAME_DIR=GAME;
const OUT=process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:path.join(ROOT,'check','bench-route-v36.json');
const M=0.06,STEP=0.05,DEG=5,NT=72,D2R=Math.PI/180;
let HR=0.33;                                                                   // set from the game's BENCH36.HR by exportWorld()

// the world the harness uses (keep in step with world() in check/verify-bench-v36.cjs)
async function benchWorld(){const H=require(path.join(ROOT,'check','runtime-harness.cjs'));const {run,context,parse}=await H.load();
 run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;");
 run("var T35=1790000000000;if(typeof CLOCK35!=='undefined')CLOCK35.fn=()=>T35;var PERF35=1000;performance={now:()=>PERF35};");
 for(const id of run('PROPS.order')){context.prop36=await parse('assets/props/'+id+'.gltf.json');context.propId36=id;
  run("{let ex;prop36.scene.traverse(o=>{if(!ex&&o.userData.prop)ex=o.userData;});prop36.extras=ex||{prop:propId36,size:[1,1,1]};prop36.scene=propMerge(prop36.scene,propId36);PROPS.cache[propId36]=prop36;}");}
 run("buildTextures();buildTextures2();courtLight=new THREE.PointLight();buildWorld();dioramaLoad();");
 for(let k=0;k<100&&run("DIORAMA.state")==='loading';k++)await new Promise(r=>setTimeout(r,20));
 run("propDressWorld();");
 run("dispatch('newgame');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupstep',{v:'p0'});dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();");
 run("sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();");
 return {run,context,J:c=>JSON.parse(run('JSON.stringify('+c+')'))};}

// the exported world: boxes as [x1,x2,z1,z2] and the level rule on a grid
function worldSig(boxes){let h=2166136261>>>0;const s=JSON.stringify(boxes.map(b=>b.map(v=>Math.round(v*1000))));for(let k=0;k<s.length;k++){h^=s.charCodeAt(k);h=Math.imul(h,16777619)>>>0;}return h.toString(16)+':'+boxes.length;}
async function exportWorld(){const {run,J}=await benchWorld();
 run("ACTIONS.bench36Start();ACTIONS.close();");
 if(J('BENCH36.state')!=='grounded')throw new Error('the delivery did not start: '+J('BENCH36.state'));
 const boxes=J("benchBoxes36(0,0,1e4,{}).map(o=>[o.x1,o.x2,o.z1,o.z2])");
 const lv=run(`(()=>{let s='';for(let i=0;i<=688;i++){for(let j=0;j<=520;j++){s+=carryLevelOK34(-8.6+i*0.025,-1.6+j*0.025)?'1':'0';}}return s;})()`);
 const start=J('[BENCH36.pose.x,BENCH36.pose.z,BENCH36.pose.yaw]');HR=J('BENCH36.HR');return {boxes,lv,start,sig:worldSig(boxes)};}

function planner(W,m){const B=W.boxes;
 const LX0=-8.6,LZ0=-1.6,LR=0.025,LNZ=521;const lvOK=(x,z)=>{const i=Math.round((x-LX0)/LR),j=Math.round((z-LZ0)/LR);if(i<0||j<0||i>688||j>=LNZ)return false;return W.lv[i*LNZ+j]==='1';};
 const C=0.5,BX0=-9,BZ0=-7,BNX=40,BNZ=40,cells=[];
 for(let i=0;i<BNX;i++)for(let j=0;j<BNZ;j++){const cx=BX0+(i+0.5)*C,cz=BZ0+(j+0.5)*C,R=1.3+C;cells.push(B.filter(o=>cx+R>o[0]&&cx-R<o[1]&&cz+R>o[2]&&cz-R<o[3]));}
 const near=(x,z)=>{const i=Math.floor((x-BX0)/C),j=Math.floor((z-BZ0)/C);if(i<0||j<0||i>=BNX||j>=BNZ)return B;return cells[i*BNZ+j];};
 const obb=(x,z,th,hx,hz)=>{const ux=Math.cos(th),uz=-Math.sin(th),nx=Math.sin(th),nz=Math.cos(th),ex=Math.abs(ux)*hx+Math.abs(nx)*hz,ez=Math.abs(uz)*hx+Math.abs(nz)*hz;
  for(const b of near(x,z)){if(x+ex<=b[0]||x-ex>=b[1]||z+ez<=b[2]||z-ez>=b[3])continue;const bhx=(b[1]-b[0])/2,bhz=(b[3]-b[2])/2,dx=(b[0]+b[1])/2-x,dz=(b[2]+b[3])/2-z;
   if(Math.abs(dx*ux+dz*uz)>=hx+bhx*Math.abs(ux)+bhz*Math.abs(uz))continue;if(Math.abs(dx*nx+dz*nz)>=hz+bhx*Math.abs(nx)+bhz*Math.abs(nz))continue;return true;}return false;};
 const PRr=HR+m,hp=(x,z)=>{for(const o of near(x,z)){if(x+PRr>o[0]&&x-PRr<o[1]&&z+PRr>o[2]&&z-PRr<o[3])return true;}return false;};
 const valid=(cx,cz,th)=>{const ux=Math.cos(th),uz=-Math.sin(th);if(obb(cx,cz,th,0.76+m,0.26+m))return false;
  for(const s of [0.9,-0.9]){const x=cx+ux*s,z=cz+uz*s;if(hp(x,z)||!lvOK(x,z))return false;}for(const t of [-0.75,-0.375,0,0.375,0.75])if(!lvOK(cx+ux*t,cz+uz*t))return false;return true;};
 return valid;}

function plan(W,m){const valid=planner(W,m),ACTS=['fwd','back','turnL','turnR'],NA=4;
 const X0=-8.6,Z0=-1.6,NX=Math.round(17.2/STEP)+1,NZ=Math.round(13/STEP)+1;
 const cellKey=(x,z,k)=>{const i=Math.round((x-X0)/STEP),j=Math.round((z-Z0)/STEP);if(i<0||j<0||i>=NX||j>=NZ)return -1;return (i*NZ+j)*NT+((k%NT)+NT)%NT;};
 const seen=new Uint8Array(NX*NZ*NT*NA);let cap=1<<22,PX=new Float64Array(cap),PZ=new Float64Array(cap),PK=new Int16Array(cap),PP=new Int32Array(cap),PA=new Int8Array(cap),n=0;
 const grow=()=>{cap*=2;const f=(T,o)=>{const t=new T(cap);t.set(o);return t;};PX=f(Float64Array,PX);PZ=f(Float64Array,PZ);PK=f(Int16Array,PK);PP=f(Int32Array,PP);PA=f(Int8Array,PA);};
 const add=(x,z,k,p,a)=>{if(n>=cap)grow();PX[n]=x;PZ[n]=z;PK[n]=((k%NT)+NT)%NT;PP[n]=p;PA[n]=a;return n++;};
 const goal=(x,z,th)=>{const uz=-Math.sin(th);const fz=z+uz*0.9,rz=z-uz*0.9;return x>-4.6&&x<-3.6&&((fz>5.9&&rz<5.55)||(rz>5.9&&fz<5.55));};
 const succ=(x,z,k,a)=>{const th=k*DEG*D2R,ux=Math.cos(th),uz=-Math.sin(th);let d=0,s=0;if(a===0)d=STEP;else if(a===1)d=-STEP;else if(a===2)s=1;else s=-1;
  const nx=x+ux*d,nz=z+uz*d;if(d&&!valid(nx,nz,th))return null;if(s&&!valid(nx,nz,(k+s*0.5)*DEG*D2R))return null;const nk=k+s;if(!valid(nx,nz,nk*DEG*D2R))return null;return [nx,nz,nk];};
 let layer=[],found=-1;const [sx,sz,sy]=W.start;
 for(const deg of [0,180]){const k=Math.round((sy/D2R+deg)/DEG);if(valid(sx,sz,k*DEG*D2R))layer.push(add(sx,sz,k,-1,-1));}
 let L=0;while(layer.length&&found<0&&L<200){const next=[];
  for(let h=0;h<layer.length&&found<0;h++){const stack=[layer[h]];
   while(stack.length&&found<0){const u=stack.pop();const x=PX[u],z=PZ[u],k=PK[u],au=PA[u];if(goal(x,z,k*DEG*D2R)){found=u;break;}
    for(let a=0;a<NA;a++){const r=succ(x,z,k,a);if(!r)continue;const key=cellKey(r[0],r[1],r[2]);if(key<0)continue;const sk=key*NA+a;if(seen[sk])continue;seen[sk]=1;
     const v=add(r[0],r[1],r[2],u,a);if(a===au)stack.push(v);else next.push(v);}}}
  layer=next;L++;}
 if(found<0)return null;const path=[];for(let u=found;u>=0;u=PP[u])path.push([PX[u],PZ[u],((PK[u]%NT)+NT)%NT*DEG,PA[u]>=0?ACTS[PA[u]]:'start']);path.reverse();
 const segs=[];for(const p of path.slice(1)){const l=segs[segs.length-1];if(l&&l.op===p[3])l.until={x:+p[0].toFixed(4),z:+p[1].toFixed(4),yaw:p[2]};else segs.push({op:p[3],until:{x:+p[0].toFixed(4),z:+p[1].toFixed(4),yaw:p[2]}});}
 return {startYaw:path[0][2],segments:segs,moves:path.length-1};}

if(require.main===module&&process.argv.includes('--slack')){(async()=>{const W=await exportWorld();let last=null;
 for(let m=0.06;m<0.3;m+=0.02){const p=plan(W,+m.toFixed(2));console.log(`inflation ${m.toFixed(2)} m (holders at ${(HR+m).toFixed(2)} m): ${p?p.segments.length+' segments':'no route'}`);if(!p)break;last=m;}
 console.log(`slack: ${last===null?'none':last.toFixed(2)+' m'}`);process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});}
else if(require.main===module){(async()=>{const W=await exportWorld();const p=plan(W,M);if(!p){console.error('no route at inflation '+M);process.exit(1);}
 const out={what:'v36 bench control plan (tools/bench-route-v36.cjs); yaw in degrees from the centre to the leading end',inflation:M,world:W.sig,start:{x:W.start[0],z:W.start[1],yaw:p.startYaw},segments:p.segments};
 fs.writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(`${p.segments.length} segments, ${p.moves} steps, world ${W.sig} -> ${path.relative(ROOT,OUT)}`);process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});}
module.exports={benchWorld,worldSig};

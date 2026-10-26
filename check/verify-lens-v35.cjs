// The opt-in lens (v35, dist/src/lens-v35.js; plan section 5: a 30-degree lens with a higher pitch behind a flag, keeping the carry framing),
// checked on the real game logic in Node with the shipped Three.js. Nothing is rendered here: views are measured by projecting with the
// game's own cameras. The checks run twice in child processes and the two reports must match (check 12), so the results file is the same
// on every run. Clock, rng, Date and performance.now are stubbed; no wall-clock value reaches the results.
// Prints one PASS or FAIL line per check and writes check/results-lens-v35.json.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const OUT=path.join(__dirname,'results-lens-v35.json');
const GAME=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');
const NAMES=[
 '1. Loads after audio-v35.js with LENS35 its only new top-level name, no tick hook, and off by default: no saved setting, no ?lens=30, the 34-degree lens and the classic CAM_DIR and v21Up exactly',
 '2. Off, the game camera is identical to the build without lens-v35.js: every frame of a scripted run (standing in the flat and on the veranda, a placed piece shown, fishing behind the bottom sheet, a sofa carry through the passage, at 390x844 and 1280x800) gives the same camera position, rotation, field of view, focus and fitted distance, to the last bit',
 '3. On: both game cameras at 30 degrees and 50 degrees of pitch, the same compass direction (v21Right, FACE_YAW, the stick mapping and the evening sightline unchanged), v21Up square to the new view; switching back restores the classic values exactly',
 '4. On: the fixed minimum distances (7.1 m portrait, 7.3 m landscape, 5.5 m carry) are scaled by tan(17)/tan(15), so the width seen at the player matches the classic lens, the player is framed in the same usable area, and the classic aim is kept',
 '5. On: the carry framing is kept: on every frame of the real gate-to-flat carry through the passage with the companion, at 390x844 and 1280x800, both players and the sofa stay in the usable area of the view, leaving it by no more than 0.06 of the half-screen while the camera catches up and never by 0.015 more than the classic lens does on the same walk',
 '6. On: the veranda armchair is not hidden by the veranda wall: placed at veranda column 1, with the player next to it on the veranda, in the room behind it and while the placed piece is shown (“See it in the room”), at 390x844, it is on screen (at least 90% of its width), at least 85% of the cushion and all of the cane back are in sight over the wall and at least 60% of its projected box is above the wall top, where the classic lens hides 44% of the cushion from the veranda',
 '7. On: the veranda evening at 390x844 from veranda columns 0, 2 and 5 and the room by the door: on every frame of the three lines the player and all three guests are fully on screen, and the evening smoothing holds (under 1% a frame through the lines after the first eased frame, no more than 2.5% a frame from the trigger to the hand-back, handed back to the normal fit)',
 '8. On: the fishing panel framing: with the phone bottom sheet open, the angler and the float stand inside the space above it, as with the classic lens',
 '9. The creator preview (prevCam), the wardrobe photos (THUMB.cam) and the title camera (camera) are unchanged with the lens on, and the module assigns none of them',
 '10. The Menu toggle: "Camera: classic" right after Sound, in the Sound button’s style with aria-pressed; tapping it saves “high” for this device, switches the camera at once and reopens the Menu with "Camera: high and close"; tapping again saves “classic” and restores the classic camera; LOCAL_ONLY, shown online, nothing on a silent replay, and a session choice that holds when storage throws',
 '11. Restore on load: a saved “high” turns the lens on at load, a saved “classic” or nothing leaves it off, ?lens=30 turns it on without saving, and storage that throws leaves it off',
 '12. Determinism: two runs give identical reports'];
const PHONE=[390,844],DESK=[1280,800];

// a copy of the game whose index.html is changed by fn (lens script removed, or an inline script put before it), assets linked
function variantDir(fn){const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd35-lens-'));
 for(const f of ['assets','src','data'])if(fs.existsSync(path.join(GAME,f)))fs.symlinkSync(path.join(GAME,f),path.join(d,f));
 fs.writeFileSync(path.join(d,'index.html'),fn(fs.readFileSync(path.join(GAME,'index.html'),'utf8')));return d;}
const LENS_TAG=/<script src="src\/lens-v35\.js"><\/script>\n?/;

// the world every in-process check uses: a companion household with the real world, NPCs, props for the armchair and the life world
async function world(){const {load,parse}=require('./runtime-harness.cjs');const h=await load();const {run,context}=h;
 run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;");
 run("var T35=1790000000000;if(typeof CLOCK35!=='undefined')CLOCK35.fn=()=>T35;var PERF35=1000;performance={now:()=>PERF35};");
 run("var PH='',TOASTS=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}");
 for(const id of ['armchair_woven']){context.prop35=await parse('assets/props/'+id+'.gltf.json');context.propId35=id;
  run("{let ex;prop35.scene.traverse(o=>{if(!ex&&o.userData.prop)ex=o.userData;});prop35.extras=ex||{prop:propId35,size:[1,1,1]};prop35.scene=propMerge(prop35.scene,propId35);PROPS.cache[propId35]=prop35;}");}
 run("buildTextures();buildTextures2();S=newState();S.phase='play';S.ai=true;AI.on=true;S.p[0].name='Efe';S.p[1].name='Ola';players=S.p.map((p,i)=>({i,g:makeHeroAvatar(lookFor(i)),y:0,t:0,prev:[0,0],face:[0,-1],moving:false}));players.forEach((p,i)=>{scene.add(p.g);p.g.position.set(S.p[i].pos[0],0,S.p[i].pos[1]);});buildWorld();buildProps();rebuildFurniture();spawnNPCs();ensureMarket();courtLight=new THREE.PointLight();sofa.L=1.657;sofa.W=.837;enterWorld();closePanel();");
 run("var OVC35=ov.classList.contains;");
 // a fresh companion household in the same world (each check starts from one, so no check sees another's sofa or pieces)
 run("var home35=()=>{S=newState();S.phase='play';S.ai=true;AI.on=true;S.p[0].name='Efe';S.p[1].name='Ola';life34();EVENING35.abort&&EVENING35.abort(false);rebuildFurniture();enterWorld();closePanel();EVENING35.checkAt=1e18;TUNE35.frame=null;};");
 // the screen size (and a phone's touch margins) for the views; the single view's aspect as renderFrame sets it
 run("var screen35=(w,h)=>{innerWidth=w;innerHeight=h;navigator.maxTouchPoints=h>w?1:0;for(const c of cams){c.aspect=w/h;c.updateProjectionMatrix();}};");
 // one camera frame (the camera wrappers in load order, visual-v21 first) with the stubbed clocks moving 1/30 s
 run("var cam35=n=>{for(let k=0;k<(n||1);k++){T35+=33;PERF35+=33;updateCameras(1/30);}};");
 // the usable area of view i (visual-v21's margins and its 0.82 width share) and a box's corners in the camera's normalised screen
 run(`var usable35=i=>{const vp=v21Viewport(i);return {x:.82,yLo:-1+2*vp.bottom/vp.h,yHi:1-2*vp.top/vp.h};};
  var ndc35=(c,x0,y0,z0,x1,y1,z1)=>{c.updateMatrixWorld();const v=new THREE.Vector3();let a=1e9,b=-1e9,lo=1e9,hi=-1e9;for(const x of [x0,x1])for(const y of [y0,y1])for(const z of [z0,z1]){v.set(x,y,z).project(c);a=Math.min(a,v.x);b=Math.max(b,v.x);lo=Math.min(lo,v.y);hi=Math.max(hi,v.y);}return {x0:a,x1:b,y0:lo,y1:hi};};
  var pbox35=p=>{const q=p.g.position,y=p.y||0;return [q.x-.44,y-.06,q.z-.36,q.x+.44,y+1.98,q.z+.36];};
  var inUse35=(i,b,tol)=>{const u=usable35(i);tol=tol||0;return b.x0>=-u.x-tol&&b.x1<=u.x+tol&&b.y0>=u.yLo-tol&&b.y1<=u.yHi+tol;};
  var camRec35=i=>{const c=cams[i];return [c.position.x,c.position.y,c.position.z,c.quaternion.x,c.quaternion.y,c.quaternion.z,c.quaternion.w,c.fov,focus[i].x,focus[i].y,focus[i].z,v21Dist[i]];};`);
 return h;}
const at=(run,x,z,i=0)=>run(`players[${i}].y=0;players[${i}].lvl=0;players[${i}].g.position.set(${x},0,${z});players[${i}].prev=[${x},${z}];`);
const r3=v=>Math.round(v*1000)/1000;

// the scripted camera run shared by check 2 (in both builds): returns every frame's camera record
function cameraScript(run){const J=c=>JSON.parse(run('JSON.stringify('+c+')'));const rec=[];const frames=n=>{for(let k=0;k<n;k++){run('cam35(1)');rec.push(J('camRec35(0)'));}};
 for(const [w,h] of [PHONE,DESK]){run(`screen35(${w},${h});`);
  at(run,-5.2,3.6);at(run,-6.4,3.2,1);frames(40);                                         // standing in the flat
  at(run,-4.15,6.4);frames(40);                                                          // on the veranda, at the walkway
  run("if(!S.home.items.some(x=>x.id==='lens35a'))S.home.items.push({id:'lens35a',type:'armchair',x:1,y:FLAT.rows,rot:0});rebuildFurniture();TUNE35.frame={id:'lens35a',until:T35+2500};");
  at(run,-5.2,3.6);frames(90);run("TUNE35.frame=null;S.home.items=S.home.items.filter(x=>x.id!=='lens35a');rebuildFurniture();");   // a placed piece shown
  at(run,12.3,13.9);at(run,11,13,1);run("players[0].g.rotation.y=Math.PI;S.life.catch=null;doFish(0);ACTIONS.lifeCast();ov.classList.contains=c=>c==='on';panel.getBoundingClientRect=()=>({top:470,bottom:innerHeight,height:innerHeight-470});");
  frames(40);run("ov.classList.contains=OVC35;panel.getBoundingClientRect=()=>({left:0,top:0,width:800,height:600});closePanel();LIFE34.fish=null;if(LIFE34.fishingWorld){scene.remove(LIFE34.fishingWorld);LIFE34.fishingWorld=null;}");
  for(const [x,z] of [[4.0,7.5],[2.2,2.4],[-1.75,-1.5],[-1.75,3.0],[-2.6,4.9]]){run(`sofa.g.visible=true;sofa.g.position.set(${x},0.35,${z});sofa.g.rotation.y=${z<1?0:Math.PI/2};players[0].g.position.set(sofaEnd(1)[0],0,sofaEnd(1)[1]);players[1].g.position.set(sofaEnd(0)[0],0,sofaEnd(0)[1]);sofa.holder=[0,1];sofa.carrying=true;`);frames(12);}
  run("sofa.carrying=false;sofa.holder=[null,null];");frames(30);}
 run('screen35(1280,800)');return rec;}

if(process.argv[2]==='--camera-script'){
 // check 2 in another build (with or without lens-v35.js): print the run's camera records
 (async()=>{const {run}=await world();process.stdout.write(JSON.stringify(cameraScript(run))+'\n');})().catch(e=>{console.error(e);process.exitCode=1;});
}else if(process.argv[2]==='--restore'){
 // check 11 in a build with an inline script before lens-v35.js: what LENS35 decided at load
 const {run}=require('./runtime-harness.cjs');
 const r=run("JSON.stringify({loaded:typeof LENS35,on:typeof LENS35==='object'&&LENS35.on,fov:cams[0].fov,pitch:+(Math.atan2(CAM_DIR.y,Math.hypot(CAM_DIR.x,CAM_DIR.z))*180/Math.PI).toFixed(6),saved:(()=>{try{return localStorage.getItem('cd3-lens');}catch(e){return 'throws';}})()})");
 process.stdout.write(r+'\n');
}else if(process.argv[2]==='--inner'){
 inner();
}else{
 // the checks run twice in child processes; the reports must match
 const one=()=>{const out=cp.execFileSync(process.execPath,[__filename,'--inner'],{env:process.env,encoding:'utf8',maxBuffer:1<<28});return JSON.parse(out.trim().split('\n').pop());};
 let a,b,failure=null;
 try{a=one();b=one();}catch(e){failure=String(e&&e.message||e).split('\n')[0];}
 const checks=a?a.checks.slice():[];
 const same=!!(a&&b)&&JSON.stringify(a)===JSON.stringify(b);
 checks.push(same?{name:NAMES[11],passed:true,info:{runs:2,identical:true}}:{name:NAMES[11],passed:false,failure:failure||'the two runs differ'});
 for(const c of checks)console.log(c.passed?'PASS':'FAIL',c.name.slice(0,110)+(c.passed?'':' - '+c.failure));
 const passed=checks.length===NAMES.length&&checks.every(c=>c.passed);
 fs.writeFileSync(OUT,JSON.stringify({build:a?a.build:null,passed,checks,method:'Actual runtime modules in Node with the shipped Three.js and the authored armchair model; views measured by projecting with the game cameras (cams) after the real camera wrappers, the evening through the real base frame; clocks, rng and performance.now stubbed. Nothing is drawn here; judge the look on the test phones.'},null,2)+'\n');
 if(!passed)process.exitCode=1;
}

function inner(){const checks=[];let run=null;
 const step=async(idx,fn)=>{const name=NAMES[idx];try{assert.equal(run('typeof LENS35'),'object','lens-v35.js is loaded (after audio-v35.js)');const info=await fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});}
  catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});if(process.env.DEBUG35)console.error(name.slice(0,3),e&&e.stack);}};
 (async()=>{
  const h=await world();run=h.run;const J=c=>JSON.parse(run('JSON.stringify('+c+')'));
  const off=()=>run('LENS35.apply(false)'),on=()=>run('LENS35.apply(true)');

  await step(0,()=>{const html=fs.readFileSync(path.join(GAME,'index.html'),'utf8'),order=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
   const li=order.indexOf('src/lens-v35.js'),ai=order.indexOf('src/audio-v35.js');assert(li>=0,'index.html loads src/lens-v35.js');assert(ai>=0&&li>ai,'lens-v35.js loads after audio-v35.js: '+order.slice(-3).join(', '));
   const src=fs.readFileSync(path.join(GAME,'src','lens-v35.js'),'utf8');
   // top-level declarations: only LENS35 (everything else lives in the module's block)
   const top=[...src.matchAll(/^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)].map(m=>m[1]);assert.deepEqual(top,['LENS35'],'top-level names: '+top.join());
   assert.equal(run("[typeof setPref,typeof fromUrl,typeof mem,typeof own,typeof ptsPrev,typeof prevMenu,typeof tanHalf].join()"),'undefined,undefined,undefined,undefined,undefined,undefined,undefined');
   assert.equal(run("TICK_HOOKS.filter(h=>/LENS35/.test(String(h))).length"),0,'no tick hook');assert(!/TICK_HOOKS/.test(src),'the module adds no tick hook');
   assert.equal(run("localStorage.getItem('cd3-lens')"),null,'nothing saved');assert.equal(run('location.search'),'','no ?lens=30');
   assert.equal(run('LENS35.wanted()'),false);assert.equal(run('LENS35.on'),false,'off by default');
   assert.equal(run('cams[0].fov===34&&cams[1].fov===34'),true,'the 34-degree lens');
   const dir=J('CAM_DIR.toArray()'),want=J('new THREE.Vector3(0.34,0.60,0.72).normalize().toArray()');assert.deepEqual(dir,want,'CAM_DIR is the classic one, bit for bit');
   const up=J('v21Up.toArray()'),upWant=J('new THREE.Vector3().crossVectors(new THREE.Vector3(0.34,0.60,0.72).normalize(),new THREE.Vector3(0.72,0,-0.34).normalize()).normalize().toArray()');assert.deepEqual(up,upWant,'v21Up is the classic one');
   assert.deepEqual(J('LENS35.classic'),{fov:34,pitch:37});
   return {order:order.slice(-3),classic:J('LENS35.classic'),lens:{fov:run('LENS35.fov'),pitch:run('LENS35.pitch')}};});

  await step(1,()=>{off();const mine=cameraScript(run);
   const d=variantDir(html=>{assert(LENS_TAG.test(html),'the lens tag is in index.html');return html.replace(LENS_TAG,'');});let other;
   try{other=JSON.parse(cp.execFileSync(process.execPath,[__filename,'--camera-script'],{env:{...process.env,COMPOUND_GAME_DIR:d},encoding:'utf8',maxBuffer:1<<28}).trim().split('\n').pop());}
   finally{fs.rmSync(d,{recursive:true,force:true});}
   assert.equal(mine.length,other.length,'same number of frames');
   for(let k=0;k<mine.length;k++)assert.deepEqual(mine[k],other[k],'frame '+k+' differs from the build without lens-v35.js');
   const carry=mine.slice(210,270).map(r=>r[11]);
   return {frames:mine.length,identical:true,fittedDistance:{phoneFlat:r3(mine[39][11]),phoneCarryMax:r3(Math.max(...carry))}};});

  await step(2,()=>{off();const classic=J('{dir:CAM_DIR.toArray(),up:v21Up.toArray(),right:v21Right.toArray(),fov:[cams[0].fov,cams[1].fov],face:FACE_YAW,move:(()=>{const out=[];for(const [x,z] of [[1,0],[0,-1]]){keys["d"]=x>0;keys["w"]=z<0;out.push(inputVec(0));keys["d"]=keys["w"]=false;}return out;})()}');
   on();const high=J('{dir:CAM_DIR.toArray(),up:v21Up.toArray(),right:v21Right.toArray(),fov:[cams[0].fov,cams[1].fov],face:FACE_YAW,move:(()=>{const out=[];for(const [x,z] of [[1,0],[0,-1]]){keys["d"]=x>0;keys["w"]=z<0;out.push(inputVec(0));keys["d"]=keys["w"]=false;}return out;})(),proj:[cams[0].projectionMatrix.elements[5],cams[1].projectionMatrix.elements[5]]}');
   assert.deepEqual(high.fov,[30,30],'both game cameras at 30 degrees');assert(Math.abs(high.proj[0]-1/Math.tan(15*Math.PI/180))<1e-9&&high.proj[0]===high.proj[1],'projection matrices updated');
   const pitch=Math.atan2(high.dir[1],Math.hypot(high.dir[0],high.dir[2]))*180/Math.PI;assert(Math.abs(pitch-50)<1e-9,'pitch 50: '+pitch);
   assert(Math.abs(Math.hypot(...high.dir)-1)<1e-12,'unit direction');
   const yaw=d=>Math.atan2(d[0],d[2]);assert(Math.abs(yaw(high.dir)-yaw(classic.dir))<1e-12,'same compass direction');
   assert.deepEqual(high.right,classic.right,'v21Right unchanged');assert.equal(high.face,classic.face,'FACE_YAW unchanged');for(let k=0;k<2;k++)for(let j=0;j<2;j++)assert(Math.abs(high.move[k][j]-classic.move[k][j])<1e-12,'the stick and keys map to the same ground directions: '+JSON.stringify([high.move,classic.move]));
   const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];assert(Math.abs(dot(high.up,high.dir))<1e-12&&Math.abs(dot(high.up,high.right))<1e-12&&Math.abs(Math.hypot(...high.up)-1)<1e-12&&high.up[1]>0,'v21Up square to the new view');
   // the evening's sightline helper reads the compass direction only
   const sight=J('[EVENING35.inSight(-4.6,8.4,-4.1,6.4),EVENING35.inSight(-6.8,8.2,-4.1,6.4)]');off();const sightC=J('[EVENING35.inSight(-4.6,8.4,-4.1,6.4),EVENING35.inSight(-6.8,8.2,-4.1,6.4)]');assert.deepEqual(sight,sightC,'the sightline rule is the same');
   const back=J('{dir:CAM_DIR.toArray(),up:v21Up.toArray(),fov:[cams[0].fov,cams[1].fov]}');assert.deepEqual(back,{dir:classic.dir,up:classic.up,fov:classic.fov},'switching back restores the classic values exactly');
   assert.equal(run('LENS35.apply(false)'),false,'switching to the state in force does nothing');
   return {fov:30,pitch:r3(pitch),classicPitch:r3(Math.atan2(classic.dir[1],Math.hypot(classic.dir[0],classic.dir[2]))*180/Math.PI),camDir:high.dir.map(v=>+v.toFixed(4))};});

  await step(3,()=>{run('home35()');const out={};const k=Math.tan(17*Math.PI/180)/Math.tan(15*Math.PI/180);
   for(const [label,w,h0,min] of [['390x844',390,844,7.1],['1280x800',1280,800,7.3]]){
    const meas=lens=>{lens?on():off();run(`screen35(${w},${h0});`);at(run,-5.2,3.6);at(run,-6.4,3.2,1);run('cam35(150)');
     return J(`(()=>{const c=cams[0],d=c.position.distanceTo(focus[0]),tanV=Math.tan(c.fov*Math.PI/360),b=ndc35(c,...pbox35(players[0]));return {d,fit:v21Dist[0],halfH:d*tanV,inUse:inUse35(0,b),box:b,aimUp:(()=>{const q=players[0].g.position.clone().setY(0.96).sub(focus[0]);return q.dot(v21Up)/(d*tanV);})()};})()`);};
    const c=meas(false),hi=meas(true);
    assert(Math.abs(c.fit-(min+.1))<1e-6,label+': classic fit at its minimum: '+c.fit);assert(Math.abs(hi.fit-(min*k+.1))<1e-6,label+': high fit at the minimum times tan(17)/tan(15): '+hi.fit);
    assert(Math.abs(hi.d-hi.fit)<1e-6,label+': settled');
    // the visible half-height at the focus: equal up to the 0.1 m margin the fit adds on both lenses
    assert(Math.abs(hi.halfH-c.halfH)<0.1*Math.tan(17*Math.PI/180)+1e-9,label+': the same width at the player: '+[c.halfH,hi.halfH]);
    assert(c.inUse&&hi.inUse,label+': the player inside the usable area on both');
    assert(Math.abs(hi.aimUp-c.aimUp)<0.02,label+': the player sits at the same height on screen: '+[c.aimUp,hi.aimUp]);
    out[label]={classic:r3(c.fit),high:r3(hi.fit),factor:r3(k),screenY:[r3(c.aimUp),r3(hi.aimUp)]};}
   off();run('screen35(1280,800)');return out;});

  await step(4,()=>{const out={};
   // the real carry (verify-feel 6): the human walks the route, the companion carries the other end by its own AI ticks
   run("var feelNow35=PERF35;function lensFeelFrame(vx,vz){const dt=1/30;T35+=33;PERF35+=33;const p=players[0];p.prev=[p.g.position.x,p.g.position.z];const m=Math.hypot(vx,vz);const sp=SPEED*(sofa&&sofa.carrying&&sofa.holder.includes(0)?0.7:1);if(m>0.05){movePlayer(p,vx/m*sp*dt,vz/m*sp*dt);p.face=[vx/m,vz/m];}aiDrive(players[1],dt);updateSofaCarry();aiThink(dt);feelPlayHook34(dt);updateCameras(dt);}");
   const route=[[4.0,7.5],[4.1,5.4],[3.3,4.4],[2.2,2.4],[-0.4,0.6],[-3.0,0.6],[-1.75,-1.5],[-1.75,5.2],[-2.6,4.9],[-5.2,4.9]];
   for(const lens of [false,true])for(const [label,w,h0] of [['390x844',...PHONE],['1280x800',...DESK]]){lens?on():off();run(`screen35(${w},${h0});`);
    run("home35();S.sofa.state='courtyard';sofa.g.visible=true;sofa.carrying=false;sofa.holder=[null,null];sofa.g.position.set(4,0,8.6);sofa.g.rotation.y=0;sofa.bump=0;crate.position.set(-1.75,0,1.0);players[0].g.position.set(sofaEnd(0)[0],0,sofaEnd(0)[1]);players[1].g.position.set(5.4,0,8.6);players.forEach(p=>{p.y=0;p.lvl=0;p.prev=[p.g.position.x,p.g.position.z];});trailReset34();AI.cool={};dispatch('hs',{i:0,id:'sofa'});closePanel();");
    for(let k=0;k<400&&!run('sofa.carrying');k++)run('lensFeelFrame(0,0)');assert.equal(run('sofa.carrying'),true,label+': carrying');run('cam35(30)');
    let wi=0,frames=0,carried=0,worst=0,minD=1e9;
    while(wi<route.length&&frames<1500&&run("S.sofa.state")!=='placed'){const p=J('[players[0].g.position.x,players[0].g.position.z]');const dx=route[wi][0]-p[0],dz=route[wi][1]-p[1];if(Math.hypot(dx,dz)<0.2){wi++;continue;}
     run(`lensFeelFrame(${dx},${dz})`);frames++;
     if(run('sofa.carrying')){carried++;const m=J(`(()=>{const c=cams[0];sofa.g.updateMatrixWorld(true);const sb=new THREE.Box3().setFromObject(sofa.g),u=usable35(0);const bs=[ndc35(c,...pbox35(players[0])),ndc35(c,...pbox35(players[1])),ndc35(c,sb.min.x,sb.min.y,sb.min.z,sb.max.x,sb.max.y,sb.max.z)];
      let over=0;for(const b of bs)over=Math.max(over,b.x1-u.x,-u.x-b.x0,b.y1-u.yHi,u.yLo-b.y0);return {over,d:v21Dist[0]};})()`);
      worst=Math.max(worst,m.over);minD=Math.min(minD,m.d);assert(m.over<=0.06,(lens?'high':'classic')+' '+label+', carry frame '+frames+': a player or the sofa leaves the usable area by '+m.over.toFixed(3));}}
    assert.equal(run("S.sofa.state"),'placed',label+': the sofa reached the flat (waypoint '+wi+')');
    out[(lens?'high ':'classic ')+label]={frames,carried,worstOverUsable:r3(worst),minFit:r3(minD)};}
   off();run('screen35(1280,800)');
   for(const l of ['390x844','1280x800'])assert(out['high '+l].worstOverUsable<=out['classic '+l].worstOverUsable+0.015,l+': the high lens frames the carry as well as the classic one: '+[out['classic '+l].worstOverUsable,out['high '+l].worstOverUsable]);
   assert(out['high 390x844'].minFit>out['classic 390x844'].minFit,'the high lens stands further back for the same framing');
   return out;});

  await step(5,()=>{const out={};
   run("home35();S.home.items.push({id:'lens35c',type:'armchair',x:1,y:FLAT.rows,rot:0});rebuildFurniture();");
   // the veranda wall: the rail along the street side of the veranda row (index.html: wall(-8.25,-2.35,7.0,7.15,1.0))
   run(`var rail35=new THREE.Box3(new THREE.Vector3(-8.25,0,7.0),new THREE.Vector3(-2.35,1.0,7.15));
    var seen35=()=>{const c=cams[0];c.updateMatrixWorld();furnGroup.updateMatrixWorld(true);const [ax,az]=cellToWorld(1,FLAT.rows);
     const g=furnGroup.children.find(k=>{let hit=false;k.traverse(m=>{if(m.isMesh&&/armchair_woven/.test(m.name))hit=true;});return hit&&Math.hypot(k.position.x-ax,k.position.z-az)<0.05;});if(!g)return null;
     const mb=re=>{let b=null;g.traverse(m=>{if(m.isMesh&&re.test(m.name))b=new THREE.Box3().setFromObject(m);});return b;};
     const ray=new THREE.Ray(),hit=new THREE.Vector3(),v=new THREE.Vector3();
     const vis=pts=>{let k=0;for(const [x,y,z] of pts){v.set(x,y,z);ray.origin.copy(c.position);ray.direction.copy(v).sub(c.position);const len=ray.direction.length();ray.direction.normalize();if(!(ray.intersectBox(rail35,hit)&&hit.distanceTo(c.position)<len-1e-6))k++;}return k/pts.length;};
     const cu=mb(/terracotta_fabric/),wk=mb(/wicker/);if(!cu||!wk)return null;const cuP=[],wkP=[];
     for(let a=0;a<=8;a++)for(let b=0;b<=8;b++){cuP.push([cu.min.x+(cu.max.x-cu.min.x)*a/8,cu.max.y,cu.min.z+(cu.max.z-cu.min.z)*b/8]);wkP.push([wk.min.x+(wk.max.x-wk.min.x)*a/8,wk.min.y+(wk.max.y-wk.min.y)*b/8,wk.max.z]);}
     // the projected box of the chair (its own meshes) against the wall top's screen line at the box's centre column
     const bb=new THREE.Box3();g.traverse(m=>{if(m.isMesh&&/armchair_woven/.test(m.name))bb.expandByObject(m);});
     const sc=(x,y,z)=>{v.set(x,y,z).project(c);return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight];};let t=1e9,bo=-1e9,l=1e9,r=-1e9;
     for(const x of [bb.min.x,bb.max.x])for(const y of [bb.min.y,bb.max.y])for(const z of [bb.min.z,bb.max.z]){const q=sc(x,y,z);t=Math.min(t,q[1]);bo=Math.max(bo,q[1]);l=Math.min(l,q[0]);r=Math.max(r,q[0]);}
     const edge=zz=>{const a=sc(-8.25,1.0,zz),e=sc(-2.35,1.0,zz),f=((l+r)/2-a[0])/(e[0]-a[0]);return a[1]+f*(e[1]-a[1]);},wallTop=Math.min(edge(7.0),edge(7.15));
     return {cushion:vis(cuP),back:vis(wkP),boxAbove:Math.max(0,Math.min(1,(wallTop-t)/(bo-t))),onScreen:t>=0&&bo<=innerHeight&&(Math.min(r,innerWidth)-Math.max(l,0))>=0.9*(r-l),box:[Math.round(t),Math.round(bo)],lr:[Math.round(l),Math.round(r)],wallTop:Math.round(wallTop)};};`);
   const views=[['on the veranda next to it',-6.0,6.4,null],['in the room behind it',-7.4,4.8,null],['the placed piece shown',-5.2,3.6,'frame']];   // a phone in portrait sees about 2 m across at the player
   for(const lens of [false,true]){lens?on():off();run(`screen35(${PHONE[0]},${PHONE[1]});`);
    for(const [label,x,z,frame] of views){at(run,x,z);at(run,-6.0,3.2,1);if(frame)run("TUNE35.frame={id:'lens35c',until:T35+60000};");run('cam35(150)');
     const s=J('seen35()');if(frame)run('TUNE35.frame=null;');assert(s,'the armchair model is built');
     if(lens){assert(s.cushion>=0.85,'high, '+label+': cushion in sight '+s.cushion.toFixed(3));assert.equal(s.back,1,'high, '+label+': the cane back in sight');
      assert(s.boxAbove>=0.6,'high, '+label+': projected box above the wall top '+s.boxAbove.toFixed(3));assert(s.onScreen,'high, '+label+': the armchair on screen '+JSON.stringify(s));}
     out[(lens?'high, ':'classic, ')+label]={cushion:r3(s.cushion),back:r3(s.back),boxAbove:r3(s.boxAbove),onScreen:s.onScreen,box:s.box,lr:s.lr,wallTop:s.wallTop};}}
   assert(out['classic, on the veranda next to it'].cushion<0.6,'the classic lens hides a large share of the cushion from the veranda: '+out['classic, on the veranda next to it'].cushion);
   off();run("S.home.items=S.home.items.filter(x=>x.id!=='lens35c');rebuildFurniture();screen35(1280,800);");return out;});

  await step(6,()=>{const out={};on();
   run("var FT35=0;var frames35=n=>{const rf=renderFrame;renderFrame=function(){const si=singleIdx(),c=cams[si>=0?si:0];c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();};try{for(let k=0;k<n;k++){T35+=33;PERF35+=33;last=FT35;FT35+=33;tick(FT35);}}finally{renderFrame=rf;}};");
   run(`var evSample35=()=>{const c=cams[0];c.updateMatrixWorld();const d=c.position.distanceTo(focus[0]),v=new THREE.Vector3(),W=innerWidth,H=innerHeight,box={};
    for(const [k,o] of [['player',players[0].g],['tunde',npcs.tunde.g],['nkechi',npcs.nkechi.g],['ada',npcs.ada.g]]){if(!o.visible)continue;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
     for(const dx of [-.3,.3])for(const y of [0,1.9])for(const dz of [-.3,.3]){v.set(o.position.x+dx,y,o.position.z+dz).project(c);const sx=(v.x+1)/2*W,sy=(1-v.y)/2*H;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy);}
     box[k]=[x0,x1,y0,y1];}
    return {state:EVENING35.state,line:EVENING35.line,d,r:d/v21Dist[0],box};};`);
   const fresh=(hx,hz,cx,cz)=>{run(`S=newState();S.phase='play';S.ai=true;AI.on=true;S.p[0].name='Efe';S.p[1].name='Ola';S.firstEvening.completed=true;S.firstEvening.plan='garden';S.firstEvening.invitationSeen=true;S.sofa.state='placed';S.day=3;S.time=18.5;life34();
    S.home.items.push({id:'ac35',type:'armchair',x:1,y:FLAT.rows,rot:0});S.life.lastDecor='armchair';S.life.metrics.decorated=1;enterWorld();closePanel();NET.on=false;PH='';EVENING35.checkAt=0;`);at(run,hx,hz);at(run,cx,cz,1);};
   run(`screen35(${PHONE[0]},${PHONE[1]});`);
   try{for(const [label,hx,hz,cx,cz] of [['veranda column 0',-7.55,6.4,-7.4,3.6],['veranda column 2',-5.75,6.4,-5.6,3.6],['veranda column 5',-3.05,6.4,-3.3,3.6],['room by the door',-4.1,4.6,-6.0,3.5]]){
     fresh(hx,hz,cx,cz);run('EVENING35.checkAt=1e18;');run('frames35(90)');run('EVENING35.checkAt=0;');const rec=[J('evSample35()')];
     const one=()=>{run('frames35(1)');rec.push(J('evSample35()'));};
     for(let k=0;k<900&&run('EVENING35.state')!=='talking';k++)one();assert.equal(run('EVENING35.state'),'talking',label+': talking');
     for(let line=0;line<3;line++){for(let k=0;k<30;k++)one();run('T35+=300;EVENING35.next();');}
     assert.equal(run('EVENING35.state'),'leaving',label+': leaving');for(let k=0;k<900&&run('EVENING35.state')!=='idle';k++)one();assert.equal(run('EVENING35.state'),'idle',label+': handed back');
     for(let k=0;k<150;k++)one();
     let first=-1,maxLine=0,maxAll=0,talk=0;
     for(let k=0;k<rec.length;k++){const s=rec[k];if(s.state==='talking'){talk++;assert.equal(Object.keys(s.box).length,4,label+': everyone visible, frame '+k);
       for(const q in s.box){const b=s.box[q];assert(b[0]>=0&&b[1]<=PHONE[0]&&b[2]>=0&&b[3]<=PHONE[1],label+', frame '+k+': '+q+' fully on screen '+JSON.stringify(b.map(Math.round)));}
       if(first<0&&s.r<0.9999)first=k;}
      if(k>0){const st=Math.abs(s.d-rec[k-1].d)/rec[k-1].d;maxAll=Math.max(maxAll,st);if(s.state==='talking'&&first>=0&&k>first)maxLine=Math.max(maxLine,st);}}
     assert(talk>=90,label+': every talking frame recorded');assert(maxLine<0.01,label+': under 1% a frame through the lines: '+maxLine);assert(maxAll<=0.025,label+': at most 2.5% a frame: '+maxAll);
     const z=rec[rec.length-1],y=rec[rec.length-2];assert(Math.abs(z.r-1)<1e-9&&Math.abs(z.d-y.d)/y.d<1e-6,label+': handed back to the normal fit');
     const tb=rec.filter(s=>s.state==='talking');
     out[label]={talkingFrames:talk,maxStepPercentLines:Math.round(maxLine*10000)/100,maxStepPercentAll:Math.round(maxAll*10000)/100,
      margins:{left:Math.round(Math.min(...tb.map(s=>Math.min(...Object.values(s.box).map(b=>b[0]))))),right:Math.round(PHONE[0]-Math.max(...tb.map(s=>Math.max(...Object.values(s.box).map(b=>b[1]))))),top:Math.round(Math.min(...tb.map(s=>Math.min(...Object.values(s.box).map(b=>b[2])))))}};}}
   finally{run('screen35(1280,800);EVENING35.checkAt=1e18;');off();}
   return out;});

  await step(7,()=>{const out={};
   for(const lens of [false,true]){lens?on():off();run(`screen35(${PHONE[0]},${PHONE[1]});`);
    run('home35()');
    at(run,12.3,13.9);at(run,11,13,1);run("players[0].g.rotation.y=Math.PI;S.life.catch=null;doFish(0);ACTIONS.lifeCast();ov.classList.contains=c=>c==='on';panel.getBoundingClientRect=()=>({top:470,bottom:844,height:374});");
    try{run('cam35(120)');
     const m=J(`(()=>{const c=cams[0],[fx,fz]=LIFE34.fishingWorld.userData.float,u=usable35(0),a=ndc35(c,...pbox35(players[0])),f=ndc35(c,fx-.35,0,fz-.35,fx+.35,.35,fz+.35);
      const px=y=>(1-y)/2*innerHeight;return {u,angler:a,float:f,anglerBottomPx:px(a.y0),floatBottomPx:px(f.y0),topPx:Math.min(px(a.y1),px(f.y1)),x:[Math.min(a.x0,f.x0),Math.max(a.x1,f.x1)],fit:v21Dist[0]};})()`);
     assert.equal(m.u.yLo,-1+2*(844-470+12)/844,'the fit uses the space above the sheet');
     const who=lens?'high':'classic';assert(m.anglerBottomPx<470&&m.floatBottomPx<470,who+': the angler and the float above the sheet top: '+JSON.stringify(m));
     assert(m.topPx>=0&&m.x[0]>=-1&&m.x[1]<=1,who+': both on screen: '+JSON.stringify(m));
     out[who]={anglerBottomPx:Math.round(m.anglerBottomPx),floatBottomPx:Math.round(m.floatBottomPx),topPx:Math.round(m.topPx),sheetTop:470,fit:r3(m.fit)};}
    finally{run("ov.classList.contains=OVC35;panel.getBoundingClientRect=()=>({left:0,top:0,width:800,height:600});closePanel();LIFE34.fish=null;if(LIFE34.fishingWorld){scene.remove(LIFE34.fishingWorld);LIFE34.fishingWorld=null;}");}}
   off();run('screen35(1280,800)');return out;});

  await step(8,()=>{const src=fs.readFileSync(path.join(GAME,'src','lens-v35.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
   assert(!/\bprevCam\b|\bTHUMB\b|\bcreator30Preview\b|\bthumbRender\b|\bmountPreview\b|\binitRenderer\b|\bsnapshot\b/.test(src),'the module never names the creator, photo or title cameras');
   assert(!/(^|[^\w.])camera\s*[.=]/.test(src),'the module never touches the title camera');
   // the cameras themselves, posed by their real code with the lens off and on
   const pose=()=>J(`(()=>{const out={};camera=new THREE.PerspectiveCamera(42,1,0.5,160);camera.fov=34;camera.position.set(14,13,20);camera.lookAt(0,0,0);out.title=[camera.fov,...camera.position.toArray(),...camera.quaternion.toArray()];
    prevCam=new THREE.PerspectiveCamera(28,0.78,0.1,20);prevChar=makeAvatar(lookFor(0));for(const z of ['face','body']){CREATOR30.zoom=z;creator30Preview(1000,0.016);out['creator '+z]=[prevCam.fov,...prevCam.position.toArray(),...prevCam.quaternion.toArray()];}
    const keep={r:THUMB.r,scene:THUMB.scene,cam:THUMB.cam};THUMB.r={render(){},domElement:{toDataURL:()=>'data:'}};THUMB.scene=new THREE.Scene();THUMB.cam=new THREE.PerspectiveCamera(26,1,0.1,20);
    try{for(const kind of ['hair','outfit']){thumbRender(lookFor(0),kind);out['photo '+kind]=[THUMB.cam.fov,...THUMB.cam.position.toArray(),...THUMB.cam.quaternion.toArray()];}}finally{THUMB.r=keep.r;THUMB.scene=keep.scene;THUMB.cam=keep.cam;}
    CREATOR30.zoom='body';prevChar=null;return out;})()`);
   off();const a=pose();on();const b=pose();off();
   assert.deepEqual(b,a,'the creator, photo and title cameras are the same with the lens on');
   return Object.fromEntries(Object.entries(a).map(([k,v])=>[k,{fov:v[0],position:v.slice(1,4).map(r3)}]));});

  await step(9,()=>{off();run("S=newState();S.phase='play';closePanel();localStorage.removeItem('cd3-lens');");
   assert.equal(run("LOCAL_ONLY.has('lens35')"),true,'LOCAL_ONLY');
   run("globalThis.MENU35L={ins:[],after:[]};globalThis.realQS35L=document.querySelector;");
   const fake=withSound=>run(`document.querySelector=sel=>sel==='#panel .actions'?{insertAdjacentHTML:(w,h)=>MENU35L.ins.push([w,h]),querySelector:q=>${withSound}&&q==='[data-act="sound35"]'?{insertAdjacentHTML:(w,h)=>MENU35L.after.push([w,h])}:null}:null;`);
   const lensIns=()=>J("MENU35L.ins.concat(MENU35L.after).filter(x=>x[1].includes('data-act=\"lens35\"'))");
   const info={};
   try{fake(true);run('MENU35L.ins=[];MENU35L.after=[];openMenu();');
    let after=J('MENU35L.after');assert.equal(after.length,1,'inserted right after the Sound button');assert.equal(after[0][0],'afterend');
    const b0=after[0][1];assert(b0.includes('>Camera: classic<'),b0);assert(b0.includes('aria-pressed="false"'),b0);assert(/class="btn quiet"/.test(b0),'the Sound button’s style: '+b0);
    const sound=run("btn('Sound: on','sound35',{},'quiet').replace('<button ','<button aria-pressed=\"true\" ')");assert.equal(b0.replace(/Camera: classic/,'X').replace(/lens35/,'Y').replace('false','B'),sound.replace(/Sound: on/,'X').replace(/sound35/,'Y').replace('true','B'),'the same markup as the Sound button');
    info.classic=b0;
    run("PH='';dispatch('lens35');");assert.equal(run("localStorage.getItem('cd3-lens')"),'high','saved for this device');assert.equal(run('LENS35.on'),true,'switched on at once');
    assert.equal(run('cams[0].fov'),30);assert(run("PH.includes('Build '+BUILD_ID)"),'the Menu reopens');
    after=J('MENU35L.after');assert.equal(after.length,2);assert(after[1][1].includes('>Camera: high and close<')&&after[1][1].includes('aria-pressed="true"'),after[1][1]);info.high=after[1][1];
    run("PH='';dispatch('lens35');");assert.equal(run("localStorage.getItem('cd3-lens')"),'classic');assert.equal(run('LENS35.on'),false);assert.equal(run('cams[0].fov'),34);
    assert.deepEqual(J('CAM_DIR.toArray()'),J('new THREE.Vector3(0.34,0.60,0.72).normalize().toArray()'),'the classic camera restored');
    // without a Sound button (a build cut before audio) it goes at the end of the actions
    fake(false);run('MENU35L.ins=[];MENU35L.after=[];openMenu();');const ins=lensIns();assert.equal(ins.length,1);assert.equal(ins[0][0],'beforeend');
    run('MENU35L.ins=[];MENU35L.after=[];_silent=true;openMenu();_silent=false;');assert.equal(lensIns().length,0,'a silent replay inserts nothing');
    run('MENU35L.ins=[];MENU35L.after=[];NET.on=true;openMenu();NET.on=false;');assert.equal(lensIns().length,1,'online: the setting is per device and still shows');}
   finally{run('document.querySelector=realQS35L;NET.on=false;_silent=false;');}
   // storage that throws (private mode): the choice still holds for the session
   run("globalThis.realLS35L=localStorage;localStorage={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');},removeItem(){}};");
   try{run("dispatch('lens35')");assert.equal(run('LENS35.on'),true);assert.equal(run('LENS35.wanted()'),true);run("dispatch('lens35')");assert.equal(run('LENS35.on'),false);assert.equal(run('LENS35.wanted()'),false);}
   finally{run('localStorage=realLS35L;');}
   run('closePanel()');return {labels:['Camera: classic','Camera: high and close'],key:'cd3-lens',afterSound:true,localOnly:true};});

  await step(10,()=>{const out={};
   const cases=[['saved high',"localStorage.setItem('cd3-lens','high');",true,'high'],['saved classic',"localStorage.setItem('cd3-lens','classic');",false,'classic'],['nothing saved','',false,null],
    ['?lens=30',"location.search='?lens=30';",true,null],['?lens=30 over a saved classic',"location.search='?x=1&lens=30';localStorage.setItem('cd3-lens','classic');",true,'classic'],['?lens=300',"location.search='?lens=300';",false,null],
    ['storage throws',"localStorage={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');},removeItem(){}};",false,'throws']];
   for(const [label,pre,want,saved] of cases){const d=variantDir(html=>html.replace(LENS_TAG,m=>(pre?'<script>'+pre+'</script>\n':'')+m));let r;
    try{r=JSON.parse(cp.execFileSync(process.execPath,[__filename,'--restore'],{env:{...process.env,COMPOUND_GAME_DIR:d},encoding:'utf8'}).trim().split('\n').pop());}finally{fs.rmSync(d,{recursive:true,force:true});}
    assert.equal(r.loaded,'object',label+': loaded');assert.equal(r.on,want,label+': on='+r.on);assert.equal(r.fov,want?30:34,label+': fov');assert.equal(r.saved,saved,label+': storage untouched');
    assert(Math.abs(r.pitch-(want?50:36.9995))<0.001,label+': pitch '+r.pitch);out[label]={on:r.on,fov:r.fov,saved:r.saved};}
   return out;});

  process.stdout.write(JSON.stringify({build:run('BUILD_ID'),checks})+'\n');
 })().catch(e=>{console.error(e);process.exitCode=1;});
}

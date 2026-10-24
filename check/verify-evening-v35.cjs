// The veranda evening (v35, dist/src/evening-v35.js), checked on the real game logic in Node with the shipped Three.js.
// The checks run twice in child processes and the two reports must match (check 8), so the results file is the same on every run.
// Clock, rng and Date are stubbed (spec 11.2); no wall-clock value reaches the results. Nothing is rendered here.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process');
const OUT=path.join(__dirname,'results-evening-v35.json');
const NAMES=[
 '1. No start on day 2, before 18:00, from 22:00, with nobody home, during a party or online, and an unfinished guided first evening does not hold it back on day 3; nobody home in the window gets one nudge, a marker and a Today card, never a panel; before six at home Today offers to wait until six, and Sleep asks once',
 '2. Day 3 at 18:30 with the human on the veranda: the guests walk in from the gate to validated street spots, clear of the sightline, kept through reroute and placeNPCs; a blocked street retries at most once a second',
 '3. The guests reach their spots well inside 20 s of stubbed time; through the real base frame (whose NPC loop turns idle NPCs to the nearest player) each stays turned from the camera towards the player, within 70 degrees of the camera, the speaker a three-quarter face',
 '4. Talking: Tunde, Mama Nkechi, then Ada with the armchair line; Act through the forced hotspot, the Next guard, the 8 s timer, a pause behind panels, the real camera (measured every frame of the first two lines) eased nearer, up to a quarter, only as far as the player and all three guests still fit, never cutting anyone, never moving back out while it eases in, and changing under 1% a frame after its first eased frame; a whole evening at 1280x800 recorded on every frame from the trigger to the hand-back to the normal camera (no change over 2.5% a frame anywhere, none over 1% from the first frame of line 1 to the end of line 3, nobody cut while they talk, no jump at the hand-back); and the companion beside the player from inside the flat or outside it, with the player at the door or along the veranda; a player who walks away ends it undone',
 '5. After the third line: saved once with one cue and one memory, the guests walk away west along the street and return to their schedule',
 '6. A missed evening stays pending and runs the next day; the 20 s timeout settles guests who cannot walk',
 '7. A new day, going online or a party mid-arrival aborts without marking it done; with Ada visiting she stays on her veranda cell and still speaks third',
 '8. Framing at 390x844 through the real base frame: with the player on the veranda at columns 0, 2 and 5 and in the room by the door, and walking along the veranda during line 2, during every line all three guests are inside the view, none stands in the player\u2019s sightline, each is within 70 degrees of the camera and the speaker shows a three-quarter face; on every frame of the three lines nobody is cut, the camera distance changes under 1% a frame after its first eased frame, the speaker stays within 50 degrees of the camera and listeners within 65, and no guest turns more than 8 degrees in a frame; the real camera distance recorded on every frame from the evening trigger to the hand-back to the normal camera changes by no more than 2.5% a frame anywhere (walk-in, hold, lines, departure, hand-back), by no more than 1% from the first frame of line 1 to the end of line 3 (the step from the hold into line 1 included), and hands back to the normal camera without a jump',
 '9. Everyone else keeps clear at 390x844 through the real base frame: with walkers on the base street routes heading into the group and the foreground, the keke and a resident walking the street, from the trigger to the end of the talk nobody else comes within 1 m of a guest\u2019s spot or the player, or covers the player or a guest within 2 m of its spot on screen from nearer the camera; once the guests have gone they all move on',
 '10. The evening nudge toast never covers the Today page: it goes as the journal opens (and stays gone), while other toasts over the journal and the nudge with no journal open are untouched',
 '11. Departure at 390x844 through the real base frame (veranda columns 0, 2 and 5 and the room by the door): the guests leave west along the street, away from the player, by a way clear of walls and props that never brings them nearer the camera-to-player line; on every frame from Goodnight to 2 s after the hand-back no guest stands between the camera and the player on screen (its screen box over the player\u2019s from nearer the camera; only a guest still within 0.3 m of its spot may keep the corner overlap it had standing there, and that never grows); each goes back to its schedule on the first frame it is off every human view, placed where no view sees it',
 '12. World labels at 390x844 with the base signs built (veranda columns 0, 2 and 5 and the room by the door): on every frame from the trigger to the hand-back no floating label is drawn over an arriving, talking or leaving guest, the player or the companion unless it is fading out (within 0.3 s of starting to); a label once hidden stays hidden until the guests are handed back; no label vanishes or appears in one frame (each fade takes about 0.3 s); every label is fully shown again within 0.4 s of the hand-back',
 '13. Determinism: two runs give identical reports'];

function inner(){
 const {load}=require('./runtime-harness.cjs');const checks=[];let run=null;
 const step=async(idx,fn)=>{const name=NAMES[idx];try{assert.equal(run('typeof EVENING35'),'object','evening-v35.js is loaded');const info=await fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});}
  catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});if(process.env.DEBUG35)console.error(name.slice(0,3),e&&e.stack);}};
 (async()=>{
  ({run}=await load());
  const J=code=>JSON.parse(run('JSON.stringify('+code+')'));
  const r2=v=>Math.round(v*100)/100;
  // 11.2 determinism helpers
  run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;");
  run("var T35=1790000000000;if(typeof CLOCK35!=='undefined')CLOCK35.fn=()=>T35;");
  run("var PH='',TOASTS=[],CUES=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}if(typeof CUE35_HOOKS!=='undefined')CUE35_HOOKS.push(n=>CUES.push(n));");
  // a companion household (verify-bridge's set-up): the real world, the authored hero, NPCs and the life world
  run("buildTextures();buildTextures2();S=newState();S.phase='play';S.ai=true;AI.on=true;S.p[0].name='Efe';S.p[1].name='Ola';players=S.p.map((p,i)=>({i,g:makeHeroAvatar(lookFor(i)),y:0,t:0,prev:[0,0],face:[0,-1],moving:false}));players.forEach((p,i)=>{scene.add(p.g);p.g.position.set(S.p[i].pos[0],0,S.p[i].pos[1]);});buildWorld();buildProps();rebuildFurniture();spawnNPCs();ensureMarket();courtLight=new THREE.PointLight();sofa.L=1.657;sofa.W=.837;enterWorld();closePanel();");
  run("var OVC=ov.classList.contains;var fakePanel=on=>{ov.classList.contains=on?(c=>c==='on'):OVC;};");
  const at=(x,z,i=0)=>run(`players[${i}].y=0;players[${i}].g.position.set(${x},0,${z});players[${i}].prev=[${x},${z}];`);
  const ticks=(n,dt='1/30',ms=33)=>run(`for(let k=0;k<${n};k++){T35+=${ms};for(const h of TICK_HOOKS)h(${dt},!overlayOpen());}`);
  const until=(cond,max,dt='1/30',ms=33)=>run(`(()=>{let k=0;for(;k<${max}&&!(${cond});k++){T35+=${ms};for(const h of TICK_HOOKS)h(${dt},!overlayOpen());}return k;})()`);
  // day 3, guided evening finished, the armchair on the veranda at column 1, the human on the veranda and the companion inside
  const fresh=(day=3,time=18.5)=>{run(`S=newState();S.phase='play';S.ai=true;AI.on=true;S.p[0].name='Efe';S.p[1].name='Ola';S.firstEvening.completed=true;S.firstEvening.plan='garden';S.firstEvening.invitationSeen=true;S.sofa.state='placed';S.day=${day};S.time=${time};life34();
   S.home.items.push({id:'ac35',type:'armchair',x:1,y:FLAT.rows,rot:0});S.life.lastDecor='armchair';S.life.metrics.decorated=1;enterWorld();closePanel();NET.on=false;PH='';EVENING35.checkAt=0;`);
   at(-4.1,6.4);at(-5.2,4.0,1);};
  const state=()=>run('EVENING35.state');
  // the real base frame (index.html tick: input, the companion's drive, TICK_HOOKS, the per-frame NPC loop that turns every idle NPC within
  // 4 m to the nearest player, then updateCameras). Nothing is drawn here, so renderFrame only sets the single view's aspect, as the real one does.
  run("var FT35=0;var frames35=n=>{const rf=renderFrame;renderFrame=function(){const si=singleIdx(),c=cams[si>=0?si:0];c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();};try{for(let k=0;k<n;k++){T35+=33;last=FT35;FT35+=33;tick(FT35);}}finally{renderFrame=rf;}};");
  // a per-frame record of the real camera and the guests (CAMREC35, when set): the camera's distance to its focus and its share of the fitted
  // distance, whether the player or a guest is cut by the screen edge (a body of 0.6 x 1.9 m projected with the game's camera), whether the
  // camera could have come 1% nearer with everyone still fitting, and each guest's yaw and angle (degrees) from its facing to the camera
  run(`var CAMREC35=null;var camSample35=()=>{const si=singleIdx(),i=si>=0?si:0,c=cams[i];c.updateMatrixWorld();const cp=c.position,d=cp.distanceTo(focus[i]),r=d/v21Dist[i],v=new THREE.Vector3(),L=EVENING35.lines[EVENING35.line];let cut=null;
   for(const [k,o] of [['player',players[0].g],['tunde',npcs.tunde.g],['nkechi',npcs.nkechi.g],['ada',npcs.ada.g]]){if(!o.visible)continue;for(const dx of [-.3,.3])for(const y of [0,1.9])for(const dz of [-.3,.3]){v.set(o.position.x+dx,y,o.position.z+dz).project(c);if(Math.abs(v.x)>1||Math.abs(v.y)>1)cut=k;}}
   const g={};for(const k of ['tunde','nkechi','ada']){const o=npcs[k].g,fx=Math.sin(o.rotation.y),fz=Math.cos(o.rotation.y),cx=cp.x-o.position.x,cz=cp.z-o.position.z;
    g[k]={yaw:o.rotation.y,toCamera:Math.acos(Math.max(-1,Math.min(1,(fx*cx+fz*cz)/Math.hypot(cx,cz))))*180/Math.PI,speaker:!!(L&&L.k===k)};}
   return {state:EVENING35.state,line:EVENING35.line,walk:EVENING35.walkers.some(k=>npcs[k]&&!!npcs[k].route),d,r,cut,nearer:r<0.9999?EVENING35.fits(i,r-0.01):null,g};};
   {const f=frames35;frames35=n=>{for(let k=0;k<n;k++){f(1);if(CAMREC35)CAMREC35.push(camSample35());}};}`);
  const frames=n=>run(`frames35(${n})`);
  // the camera never cuts anyone, and from its first eased frame on its distance changes under 1% a frame (no twitch)
  const camSmooth=(rec,label)=>{let first=-1,maxStep=0;for(let k=0;k<rec.length;k++){const s=rec[k];assert.equal(s.cut,null,label+': nobody cut on frame '+k+': '+JSON.stringify(s));
    if(first<0&&s.r<0.9999)first=k;if(first>=0&&k>first){const st=Math.abs(s.d-rec[k-1].d)/rec[k-1].d;maxStep=Math.max(maxStep,st);assert(st<0.01,label+': the camera moved '+(st*100).toFixed(2)+'% on frame '+k+' (from '+rec[k-1].d.toFixed(3)+' to '+s.d.toFixed(3)+')');}}
   return {firstEasedFrame:first,maxStepPercent:Math.round(maxStep*10000)/100,minRatio:Math.round(Math.min(...rec.map(s=>s.r))*1000)/1000};};
  // the real camera on every frame from the evening trigger to the hand-back to the normal camera. The normal camera first settles on the
  // player with no evening (90 frames); then one sample before the trigger and one per frame through the walk-in, the hold, the three lines
  // (lineFrames each, onLine(line) on each line's last frame, then Next), the departure and 150 frames after the guests are handed back.
  // Each step (frame k against frame k-1) belongs to the phase of frame k, so the step from the hold into line 1 counts as a line step.
  const phaseOf=s=>s.state==='arriving'?(s.walk?'walk-in':'hold'):s.state==='talking'?'lines':s.state==='leaving'?'departure':'hand-back';
  const PHASES=['walk-in','hold','lines','departure','hand-back'];
  const wholeEvening=(label,lineFrames,onLine)=>{run('EVENING35.checkAt=1e18;');frames(90);run('CAMREC35=[camSample35()];EVENING35.checkAt=0;');
   run("(()=>{for(let k=0;k<900&&EVENING35.state!=='talking';k++)frames35(1);})()");assert.equal(state(),'talking',label+': talking');
   for(let line=0;line<3;line++){frames(lineFrames);if(onLine)onLine(line);run('T35+=300;EVENING35.next();');}
   assert.equal(state(),'leaving',label+': leaving');run("(()=>{for(let k=0;k<900&&EVENING35.state!=='idle';k++)frames35(1);})()");assert.equal(state(),'idle',label+': handed back');
   frames(150);const rec=J('CAMREC35');run('CAMREC35=null;');
   assert(rec[0].state==='idle'&&rec[1].state==='arriving',label+': recorded from the frame before the trigger');
   const max={},n={},at={};for(let k=1;k<rec.length;k++){const p=phaseOf(rec[k]),st=Math.abs(rec[k].d-rec[k-1].d)/rec[k-1].d;n[p]=(n[p]||0)+1;
    if(p in max&&st<=max[p])continue;max[p]=st;at[p]={frame:k,from:rec[k-1].d,to:rec[k].d};}
   const pct=v=>Math.round(v*10000)/100,summary={maxStepPercent:Object.fromEntries(PHASES.map(p=>[p,p in max?pct(max[p]):null])),frames:Object.fromEntries(PHASES.map(p=>[p,n[p]||0]))};
   const say=JSON.stringify(summary.maxStepPercent);
   for(const p of PHASES){assert(n[p]>0,label+': frames in the '+p);if(max[p]>0.025)assert.fail(label+': the camera moved '+pct(max[p])+'% in one frame during the '+p+' (frame '+at[p].frame+', '+at[p].from.toFixed(3)+' to '+at[p].to.toFixed(3)+' m); largest per phase '+say);}
   if(max.lines>0.01)assert.fail(label+': the camera moved '+pct(max.lines)+'% in one frame from line 1 to line 3 (frame '+at.lines.frame+', '+at.lines.from.toFixed(3)+' to '+at.lines.to.toFixed(3)+' m); largest per phase '+say);
   for(let k=0;k<rec.length;k++)if(rec[k].state==='talking')assert.equal(rec[k].cut,null,label+': nobody cut from line 1 to line 3, frame '+k+': '+JSON.stringify(rec[k]));
   const z=rec[rec.length-1],y=rec[rec.length-2];assert(Math.abs(z.r-1)<1e-9&&Math.abs(z.d-y.d)/y.d<1e-6,label+': handed back to the normal camera (its fitted distance, settled): '+JSON.stringify([y.d,z.d,z.r]));
   return {rec,summary};};
  const wrapD=a=>{a=Math.abs(a)%(2*Math.PI);return (a>Math.PI?2*Math.PI-a:a)*180/Math.PI;};
  // each guest as the human's camera sees it: angles (degrees) from its facing to the camera and to the player, the camera-to-player angle,
  // and its screen box (a body of 0.6 x 1.9 m projected with the game's camera)
  const view=()=>J(`(()=>{const c=cams[0];c.updateMatrixWorld();const cp=c.position,h=players[0].g.position,L=EVENING35.lines[EVENING35.line],out={},v=new THREE.Vector3();
   const deg=(ax,az,bx,bz)=>Math.round(Math.acos(Math.max(-1,Math.min(1,(ax*bx+az*bz)/Math.hypot(ax,az)/Math.hypot(bx,bz))))*180/Math.PI);
   for(const k of ['tunde','nkechi','ada']){const o=npcs[k].g,fx=Math.sin(o.rotation.y),fz=Math.cos(o.rotation.y),cx=cp.x-o.position.x,cz=cp.z-o.position.z,px=h.x-o.position.x,pz=h.z-o.position.z;
    let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const dx of [-.3,.3])for(const y of [0,1.9])for(const dz of [-.3,.3]){v.set(o.position.x+dx,y,o.position.z+dz).project(c);const sx=(v.x+1)/2*innerWidth,sy=(1-v.y)/2*innerHeight;
     x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy);}
    out[k]={toCamera:deg(fx,fz,cx,cz),toPlayer:deg(fx,fz,px,pz),cameraToPlayer:deg(cx,cz,px,pz),speaker:!!(L&&L.k===k),x:[Math.round(x0),Math.round(x1)],y:[Math.round(y0),Math.round(y1)]};}
   return out;})()`);
  const facingOK=(v,label)=>{for(const k in v){const g=v[k];assert(g.toCamera<=70,label+': '+k+' within 70 degrees of the camera: '+JSON.stringify(g));
    assert(g.toPlayer<g.cameraToPlayer,label+': '+k+' turned from the camera towards the player: '+JSON.stringify(g));
    if(g.speaker)assert(g.toCamera>=30&&g.toCamera<=55,label+': '+k+' speaks in three-quarter: '+JSON.stringify(g));}};
  const spotsOK=(hx,hz)=>J(`(()=>{const s=EVENING35.spots,ks=Object.keys(s),out={n:ks.length,bad:[]};for(const k of ks){const [x,z]=s[k];
   if(blocked(x,z,PR))out.bad.push(k+' blocked');if(levelAt(x,z)!==0)out.bad.push(k+' not level');if(!(z>7.4))out.bad.push(k+' z');if(inFlat(x,z))out.bad.push(k+' in flat');
   for(const p of players)if(Math.hypot(p.g.position.x-x,p.g.position.z-z)<0.9)out.bad.push(k+' near a player');
   for(const q of ks)if(q!==k&&Math.hypot(s[q][0]-x,s[q][1]-z)<0.74)out.bad.push(k+' near '+q);
   if(EVENING35.inSight(x,z,${hx},${hz}))out.bad.push(k+' in the sightline');}return out;})()`);

  await step(0,()=>{fresh();const idle={};
   const tryIt=(label,setup,undo)=>{run(setup);ticks(5);idle[label]=state();assert.equal(state(),'idle',label);run(undo);};
   tryIt('day 2','S.day=2','S.day=3');tryIt('17:30','S.time=17.5','S.time=18.5');tryIt('22:00','S.time=22','S.time=18.5');
   tryIt('party','S.party={on:true,done:false,guests:[],indoor:false}','S.party=null');
   // online: only the evening hook runs here (the base net tick needs a room)
   run('NET.on=true;for(let k=0;k<5;k++){T35+=33;eveningTick35(1/30);}');idle.online=state();assert.equal(state(),'idle','online');run('NET.on=false');assert.equal(J('(()=>{NET.on=true;const p=EVENING35.pending();NET.on=false;return p;})()'),false,'not pending online');
   run("S.time=17;");assert.match(run('todayHTML34()'),/evening35-card[\s\S]*The neighbours are coming by/,'Today before six');
   run("S.time=18.5;LIFE34.waypoint=null;");at(10,10);const ph0=run('PH'),t0=run('TOASTS.length');ticks(5);idle['nobody home']=state();
   assert.equal(state(),'idle','nobody home: no start (the companion inside does not count)');
   assert.deepEqual(J('LIFE34.waypoint'),{x:-4.1,z:6.3,name:'Flat 3'},'nudge marker at Flat 3');
   const nudges=J(`TOASTS.slice(${t0})`);assert.deepEqual(nudges,[run('EVENING35.copy.nudge')],'one nudge toast');ticks(30);assert.equal(run('TOASTS.length'),t0+1,'once a day');
   assert.equal(run('PH'),ph0,'the tick opened no panel');
   const card=run('todayHTML34()');assert.match(card,/class="life-note34 evening35-card"><p class="life-kicker">THIS EVENING<\/p><h3>They are on their way<\/h3>/);
   assert.match(card,/data-act="lifeGo" data-v="home"[^>]*>Head home</,'Head home button');assert(card.indexOf('evening35-card')<card.indexOf('<div class="life-chips34">'),'card before the chips');
   assert.doesNotMatch(card,/undefined|NaN/);
   // an unfinished guided first evening (the base lets it run past day 1) does not hold the veranda evening back on day 3
   at(-4.1,6.4);run("S.firstEvening.completed=false;S.firstEvening.enabled=true;EVENING35.checkAt=0;");ticks(5);const guidedState=state();assert.equal(guidedState,'arriving','starts on day 3 with the guided evening unfinished');
   run("EVENING35.abort();S.firstEvening.completed=true;");
   // before six with the human at home: Today offers to wait until six, and the wait starts the visit
   run("S.time=16;EVENING35.checkAt=0;");const t16=run('todayHTML34()');assert.match(t16,/evening35-card[\s\S]*data-act="evening35Wait"/,'Today offers the wait');
   run("dispatch('evening35Wait');");assert.equal(run('S.time'),18,'waited until six');ticks(5);assert.equal(state(),'arriving','the visit starts at six');run("EVENING35.abort();S.time=16;");
   // Sleep before the evening asks once; Sleep anyway (or a second Sleep) sleeps
   run("PH='';dispatch('sleep');");assert.match(run('PH'),/<h2>The neighbours are coming by<\/h2>[\s\S]*data-act="evening35Wait"[\s\S]*data-act="sleep" data-anyway="1"/,'Sleep asks first');
   assert.doesNotMatch(run('PH'),/night/i,'not the night panel yet');run("PH='';dispatch('sleep',{anyway:1});");assert.match(run('PH'),/Day 3, night/,'Sleep anyway sleeps');run("closePanel();S.time=18.5;EVENING35.askedDay=0;");
   return {idle,nudge:nudges[0],guidedDay3:guidedState};});

  await step(1,()=>{fresh();assert.equal(J("S.home.items.find(i=>i.id==='ac35').y"),4,'armchair on the veranda row');
   // retry: with every street candidate blocked, about a second of ticks makes at most two attempts
   run("var B0=blocked;blocked=function(x,z,r,o){return z>7.4?{tag:'test35'}:B0.apply(this,arguments);};var PS0=EVENING35.pickSpots,PSN=0;EVENING35.pickSpots=function(){PSN++;return PS0.apply(this,arguments);};");
   ticks(30);const attempts=run('PSN');assert.equal(state(),'idle','no spots, no start');assert(attempts>=1&&attempts<=2,'attempts '+attempts);
   run("blocked=B0;EVENING35.pickSpots=PS0;");
   run("LIFE34.waypoint={x:-4.1,z:6.3,name:'Flat 3'};");                 // as the nudge left it
   const k=until("EVENING35.state!=='idle'",40);assert.equal(state(),'arriving','starts once the street is free');assert.equal(J('LIFE34.waypoint'),null,'home now: the nudge marker is cleared');
   const gate=J("['tunde','nkechi','ada'].map(k=>{const n=npcs[k];return [n.g.visible,+n.g.position.x.toFixed(2),+n.g.position.z.toFixed(2)];})");
   assert.deepEqual(gate,[[true,3.6,9.6],[true,4,9.6],[true,4.4,9.6]],'three guests at the gate');
   assert.deepEqual(J("TOASTS.slice(-1)"),[run('EVENING35.copy.gate')]);
   const s1=spotsOK(-4.1,6.4);assert.equal(s1.n,3);assert.deepEqual(s1.bad,[],'spots valid for the human at (-4.1, 6.4)');
   const spots=J('EVENING35.spots');
   for(const g of ['tunde','nkechi','ada'])assert.deepEqual(J(`npcs.${g}.route[npcs.${g}.route.length-1]`),spots[g],'route ends at the spot');
   // the same rules for a human further west
   at(-6.5,6.4);const keep=J('EVENING35.spots');run('EVENING35.spots=EVENING35.pickSpots();');const s2=spotsOK(-6.5,6.4);const west=J('EVENING35.spots');run(`EVENING35.spots=${JSON.stringify(keep)};`);at(-4.1,6.4);
   assert.equal(s2.n,3);assert.deepEqual(s2.bad,[],'spots valid for the human at (-6.5, 6.4)');
   // a schedule change during the walk keeps the evening routes
   ticks(20);const snap="['tunde','nkechi','ada'].map(k=>{const n=npcs[k];return {r:n.route,ri:n.ri,x:+n.g.position.x.toFixed(3),z:+n.g.position.z.toFixed(3),d:n.dest};})";
   const before=J(snap);assert(before.every(b=>b.r&&b.ri>=1),'walking');run('reroute()');assert.deepEqual(J(snap),before,'reroute keeps routes');run('placeNPCs()');assert.deepEqual(J(snap),before,'placeNPCs keeps routes');
   return {retryAttemptsIn30Ticks:attempts,spots,westSpots:west};});

  // the walk in runs through the real base frame, so the camera follows the arrival as in the game before the first line is measured
  await step(2,()=>{const k=run("(()=>{let k=0;for(;k<700&&EVENING35.state==='arriving';k++)frames35(1);return k;})()");assert.equal(state(),'talking');const secs=r2((k+21)*0.033);assert(secs<20,'arrived in '+secs+' s');
   const at3=J("['tunde','nkechi','ada'].map(k=>{const n=npcs[k],s=EVENING35.spots[k];return {d:Math.hypot(n.g.position.x-s[0],n.g.position.z-s[1]),yaw:n.home[2],route:n.route};})");
   for(const a of at3){assert(a.d<1e-6,'on the spot');assert.equal(a.route,null);}
   // the guests stand within 4 m of the player, so the base NPC loop would turn them to face the player (their backs to the camera)
   assert(J("['tunde','nkechi','ada'].every(k=>Math.hypot(npcs[k].g.position.x-players[0].g.position.x,npcs[k].g.position.z-players[0].g.position.z)<4)"),'within the base loop\u2019s 4 m');
   run('CAMREC35=[];');frames(30);const faces=view();facingOK(faces,'line 1');
   return {arrivedAfterSeconds:secs,faces};});

  await step(3,()=>{assert.equal(state(),'talking');const who=()=>run('EVENING35.el.dataset.who');const cap=()=>run('EVENING35.el.innerHTML');
   ticks(1);assert.equal(run('EVENING35.shown'),true,'caption shown');assert.equal(who(),'tunde');assert.match(cap(),/>Tunde<\/span>[\s\S]*>Next<\/button>/);
   // the real camera on every frame of the first line (recorded from its first frame, through the real base frame): it comes nearer, up to a
   // quarter, only as far as the player and all three guests still fit (spec 7.4), and settles there; it never moves back out while it eases in
   frames(20);const rec1=J('CAMREC35.filter(s=>s.state===\'talking\'&&s.line===0)');assert(rec1.length>=45,'line 1 recorded: '+rec1.length);
   const end1=rec1[rec1.length-1];assert(end1.r>=0.745&&end1.r<=1+1e-9,'the camera between a quarter nearer and the fitted distance: '+end1.r);
   assert(end1.r<=0.76||end1.nearer===false||(end1.r>=0.9999&&!run('EVENING35.fits(0,0.99)')),'eased as far as everyone still fits: '+JSON.stringify(end1));
   for(let k=1;k<rec1.length;k++)assert(rec1[k].d<=rec1[k-1].d+1e-9,'line 1: the camera never moves back out while it eases in (frame '+k+')');
   assert.deepEqual([rec1[rec1.length-1].d,rec1[rec1.length-2].d].map(d=>d.toFixed(4)),[rec1[rec1.length-1].d.toFixed(4),rec1[rec1.length-1].d.toFixed(4)],'settled at the end of line 1');
   const camNear=Math.round(end1.r*1000)/1000,cf0=r2(run('EVENING35.camFactor'));assert(cf0<=0.76,'the ease asked for on the first line: '+cf0);
   assert.equal(J('nearest(0).id'),'evening35','forced Listen hotspot for the human');assert.notEqual(run('(nearest(1)||{}).id'),'evening35','not for the companion');
   run("T35+=300;dispatch('hs',{i:0,id:'evening35'});");assert.equal(who(),'nkechi','Act advances through ACT_HOOKS');assert.match(cap(),/>Mama Nkechi<\/span>/);
   assert.equal(run('EVENING35.next()'),false,'a second call within 300 ms is ignored');assert.equal(run('EVENING35.line'),1);
   frames(45);assert.equal(run('EVENING35.camFactor'),1,'camera back after the first line');
   const rec2=J('CAMREC35');run('CAMREC35=null;');const back=rec2[rec2.length-1];assert(back.line===1&&back.r>0.9999,'the real camera back at the fitted distance: '+JSON.stringify(back));
   const camRun=camSmooth(rec2,'lines 1 and 2');
   // behind a panel the caption hides and the timers stop
   run('fakePanel(true)');ticks(400);assert.equal(run('EVENING35.shown'),false,'hidden behind a panel');assert.equal(run('EVENING35.line'),1,'paused behind a panel');const L0=run('EVENING35.lineT');run('fakePanel(false)');
   const auto=until("EVENING35.line!==1",400);const autoS=r2((L0+auto*33)/1000);assert(L0+(auto-1)*33<8000,'not before 8 s');assert.equal(who(),'ada','the 8 s timer advances');assert(autoS>=8&&autoS<8.04,'auto after '+autoS+' s');
   const ada=run("line35('ada',Object.assign(lineCtx35('ada'),{evening:true})).text"),adaId=run("line35('ada',Object.assign(lineCtx35('ada'),{evening:true})).id");
   assert.equal(run('EVENING35.lines[2].text'),ada,'Ada says the LINES evening line');assert(cap().includes(run('esc(EVENING35.lines[2].text)')),'Ada in the caption');assert.match(cap(),/>Goodnight<\/button>/);
   const when=J(`(LINES35.evening&&LINES35.evening.ada||[]).find(e=>e.id===${JSON.stringify(adaId)})?.when||null`);
   if(when)assert(when.includes('chair-veranda')||when.includes('chair-placed'),'the chair line: '+JSON.stringify(when));
   // the companion's evening goal is beside the human, free and inside the flat, and its own drive takes it there
   const sp=J("(()=>{const s=EVENING35.companionSpot(),h=players[0].g.position;return {x:s.x,z:s.z,d:Math.hypot(s.x-h.x,s.z-h.z),free:!blocked(s.x,s.z,PR),inFlat:inFlat(s.x,s.z)};})()");
   assert(sp.free&&sp.inFlat&&sp.d<=1.2&&sp.d>=0.6,'spot beside the human: '+JSON.stringify(sp));
   at(-5.0,6.4,1);const g=J("(()=>{const g=aiGoal(players[AI.i],1/30),h=players[0].g.position;return {x:g.x,z:g.z,d:Math.hypot(g.x-h.x,g.z-h.z),free:!blocked(g.x,g.z,PR),inFlat:inFlat(g.x,g.z)};})()");
   assert.deepEqual([g.x,g.z],[sp.x,sp.z],'with a clear way aiGoal is that spot');at(-5.2,4.0,1);
   const driven=J("(()=>{for(let k=0;k<600;k++)aiDrive(players[AI.i],1/30);const a=players[AI.i].g.position,h=players[0].g.position;return {d:+Math.hypot(a.x-h.x,a.z-h.z).toFixed(2),inFlat:inFlat(a.x,a.z)};})()");
   assert(driven.d<=1.2&&driven.d>=0.5&&driven.inFlat,'companion beside the player: '+JSON.stringify(driven));
   const names=J("EVENING35.lines.map(l=>l.k)");assert.deepEqual(names,['tunde','nkechi','ada']);
   // the player along the veranda (west and east of the door) and the companion inside the flat or outside it: it walks round through the door to stand beside them
   const cases={};const hum0=J('[players[0].g.position.x,players[0].g.position.z]');
   for(const [hx,cx,cz] of [[-6.5,-5.6,3.6],[-3.0,-7.5,2.5],[-4.1,-1.2,3.8],[-6.5,-1.2,3.8]]){at(hx,6.4);at(cx,cz,1);run('AI.path=null;AI.rescue=-1;AI.detour=null;AI.useNav=0;AI.stuck=0;');
    const d=J("(()=>{for(let k=0;k<900;k++)aiDrive(players[AI.i],1/30);const a=players[AI.i].g.position,h=players[0].g.position;return {d:+Math.hypot(a.x-h.x,a.z-h.z).toFixed(2),veranda:a.z>5.85&&inFlat(a.x,a.z)};})()");
    cases[hx+'/'+cx+','+cz]=d;assert(d.d<=1.45&&d.veranda,'companion beside the player on the veranda: human '+hx+', from '+cx+','+cz+': '+JSON.stringify(d));}
   at(...hum0);at(-5.2,4.0,1);
   // all three guests are in the camera fit, only near the player
   const nIn=J('v21InteractionPoints(0,false).length');at(15,5);const nFar=J('v21InteractionPoints(0,false).length');at(...hum0);assert.equal(nIn-nFar,24,'the three guests in the fit near the player, out of it far away');
   // a whole evening at 1280x800 through the real base frame, from the trigger to the hand-back to the normal camera (each line 60 frames);
   // then a fresh evening brought to its third line (Ada) for check 5
   fresh();const whole=wholeEvening('1280x800',60).summary;
   fresh();run("(()=>{for(let k=0;k<900&&EVENING35.state!=='talking';k++)frames35(1);})()");run('T35+=300;EVENING35.next();T35+=300;EVENING35.next();');assert.equal(who(),'ada','back on the third line');
   return {camFactorFirstLine:cf0,cameraDistanceRatio:camNear,camera:camRun,wholeEvening1280x800:whole,autoAdvanceSeconds:autoS,adaLine:adaId,adaWhen:when,companionAfterDrive:driven.d,companionCases:cases};});

  await step(4,()=>{const c0=J("CUES.filter(n=>n==='evening').length"),m0=J("S.memories.filter(m=>/came by the veranda/.test(m.caption)).length"),ph0=run('PH');
   run('T35+=300;EVENING35.next();');assert.equal(state(),'leaving');assert.equal(J('S.life.evening35.doneDay'),3);
   assert.equal(J("CUES.filter(n=>n==='evening').length")-c0,1,'one evening cue');assert.equal(J("S.memories.filter(m=>/came by the veranda/.test(m.caption)).length")-m0,1,'one memory');
   assert.equal(run('EVENING35.shown'),false,'caption hidden');assert.equal(J("JSON.parse(localStorage.getItem(KEY)||'{}').life?.evening35?.doneDay??null"),3,'saved');
   const ends=J("['tunde','nkechi','ada'].map(k=>npcs[k].route[npcs[k].route.length-1])");
   for(const e of ends)assert(e[0]===-30&&[9.2,9.6,10.2].includes(e[1]),'walking away west along the street: '+JSON.stringify(ends));
   const k=until("EVENING35.state==='idle'",900);assert.equal(state(),'idle');
   const after=J("['tunde','nkechi','ada'].map(k=>{const n=npcs[k],sp=NPC_SPOTS[k][slot()];return {cool:n.cool<1e9,toSpot:sp?!!(n.dest&&n.dest[0]===sp[0]&&n.dest[1]===sp[1]):n.hideAtEnd===true};})");
   for(const a of after){assert(a.cool,'cool restored');assert(a.toSpot,'handed to the schedule');}
   assert.equal(run('PH'),ph0,'no panel opened by the evening');assert.equal(run('EVENING35.pending()'),false);assert.equal(run('EVENING35.doneToday()'),true);
   assert.match(run('todayHTML34()'),/<h3>A good evening<\/h3>/);ticks(30);assert.equal(state(),'idle','it does not start again');
   return {handedOffAfterSeconds:r2((k+1)*0.033)};});

  await step(5,()=>{fresh();at(10,10);const steps=[];for(let t=18;t<22.01;t+=0.25){run(`S.time=${t};`);ticks(3);steps.push(state());}
   assert(steps.every(s=>s==='idle'),'never starts away from home');assert.equal(run('EVENING35.done()'),false);
   run("S.time=23;dispatch('nextday');");assert.equal(run('S.day'),4);assert.equal(run('EVENING35.pending()'),true,'pending on day 4');
   if(run("typeof morningCtx35==='function'"))assert.equal(run('morningCtx35(4).eveningPending'),true);
   run('closePanel();S.time=18.5;');at(-4.1,6.4);at(-5.2,4.0,1);until("EVENING35.state!=='idle'",10);assert.equal(state(),'arriving','runs on day 4');
   // the guests cannot walk (dt 0): after 20 s of stubbed time they step onto their spots
   const k=until("EVENING35.state!=='arriving'",700,'0');assert.equal(state(),'talking');const secs=r2(k*0.033);assert(secs>=20&&secs<20.1,'timeout '+secs);
   assert(J("['tunde','nkechi','ada'].every(k=>{const n=npcs[k],s=EVENING35.spots[k];return !n.route&&n.g.position.x===s[0]&&n.g.position.z===s[1]&&n.home[2]===EVENING35.yaw[k];})"),'settled on the spots');
   // the companion never walked (no drive here): when the talking starts it steps onto its place beside the player
   const snap=J("(()=>{const a=players[AI.i].g.position,h=players[0].g.position;return {d:+Math.hypot(a.x-h.x,a.z-h.z).toFixed(2),veranda:a.z>6.05&&inFlat(a.x,a.z)};})()");assert(snap.d<=1.0&&snap.veranda,'companion placed beside the player: '+JSON.stringify(snap));
   run('T35+=300;EVENING35.next();T35+=300;EVENING35.next();T35+=300;EVENING35.next();');assert.equal(J('S.life.evening35.doneDay'),4);
   return {timeoutSeconds:secs};});

  await step(6,()=>{fresh();ticks(1);assert.equal(state(),'arriving');ticks(30);
   run("dispatch('nextday');closePanel();");assert.equal(state(),'idle','aborted');assert.equal(run('EVENING35.done()'),false,'not done');assert.equal(run('EVENING35.pending()'),true,'repeats');
   const back=J("['tunde','nkechi','ada'].map(k=>{const n=npcs[k],r=n.route,e=r&&r[r.length-1],x=n.g.position.x,z=n.g.position.z;return {k,cool:n.cool<1e9,street:(z>7.4&&z<9.3&&x<-2)||!!(e&&e[1]>7.4&&e[1]<9.3&&e[0]<-2)};})");
   for(const b of back)assert(b.cool&&!b.street,'guests back on the schedule: '+JSON.stringify(b));
   assert.equal(run('EVENING35.camFactor'),1);
   // Ada visiting: she stays on her veranda cell and speaks third
   run("S.time=18.5;S.life.visit={k:'ada',day:S.day};placeNPCs();");at(-4.1,6.4);at(-5.2,4.0,1);const ada0=J("[npcs.ada.g.position.x,npcs.ada.g.position.z]");assert(ada0[1]<7,'Ada on the veranda');
   until("EVENING35.state!=='idle'",10);assert.equal(state(),'arriving');assert.deepEqual(J('EVENING35.walkers'),['tunde','nkechi']);assert.deepEqual(J('TOASTS.slice(-1)'),[run('EVENING35.copy.gate2')]);
   until("EVENING35.state!=='arriving'",700);assert.equal(state(),'talking');assert.deepEqual(J('EVENING35.lines.map(l=>l.k)'),['tunde','nkechi','ada']);
   run('T35+=300;EVENING35.next();T35+=300;EVENING35.next();T35+=300;EVENING35.next();');until("EVENING35.state==='idle'",900);
   const ada1=J("[npcs.ada.g.position.x,npcs.ada.g.position.z,npcs.ada.route,npcs.ada.g.visible,npcs.ada.cool<1e9]");
   assert.deepEqual(ada1,[...ada0,null,true,true],'Ada stays put');
   // going online or a party starting also ends it, undone
   fresh();until("EVENING35.state!=='idle'",10);assert.equal(state(),'arriving');run('NET.on=true;T35+=33;eveningTick35(1/30);NET.on=false;');assert.equal(state(),'idle','online aborts');
   run('EVENING35.checkAt=0;');until("EVENING35.state!=='idle'",10);assert.equal(state(),'arriving');run('S.party={on:true,done:false,guests:[],indoor:false};');ticks(1);assert.equal(state(),'idle','a party aborts');run('S.party=null;');
   // the player walks off to the market mid-talk: three seconds later it ends, undone
   run('EVENING35.checkAt=0;');until("EVENING35.state!=='idle'",10);until("EVENING35.state!=='arriving'",700);assert.equal(state(),'talking');at(20.8,7.2);at(21.5,7.6,1);
   const gone=until("EVENING35.state==='idle'",200);assert.equal(state(),'idle','nobody home: it ends');assert(gone*33>=2900&&gone*33<=3300,'after about three seconds: '+gone*33);assert.equal(run('EVENING35.done()'),false,'not done, so it repeats');
   assert.equal(run('EVENING35.done()'),false);return {adaCell:ada0.map(r2)};});

  await step(7,()=>{const out={};
   run('innerWidth=390;innerHeight=844;navigator.maxTouchPoints=1;');      // a phone in portrait (v21Viewport keeps the touch margins)
   try{for(const [label,hx,hz,cx,cz] of [['veranda column 0',-7.55,6.4,-7.4,3.6],['veranda column 2',-5.75,6.4,-5.6,3.6],['veranda column 5',-3.05,6.4,-3.3,3.6],['room by the door',-4.1,4.6,-6.0,3.5]]){
    fresh();at(hx,hz);at(cx,cz,1);let spots=null;const lines=[];
    const whole=wholeEvening(label,30,line=>{if(line===0){const s=spotsOK(hx,hz);assert.equal(s.n,3,label);assert.deepEqual(s.bad,[],label+': spots valid and clear of the sightline');spots=J('EVENING35.spots');}
     const v=view();facingOK(v,label+', line '+(line+1));
     for(const k in v){const g=v[k];assert(g.x[0]>=0&&g.x[1]<=390&&g.y[0]>=0&&g.y[1]<=844,label+', line '+(line+1)+': '+k+' on screen: '+JSON.stringify(g));}
     lines.push(Object.fromEntries(Object.entries(v).map(([k,g])=>[k,{toCamera:g.toCamera,x:g.x}])));});
    const rec=whole.rec.filter(s=>s.state==='talking');assert(rec.length>=90,label+': every frame recorded');const cam=camSmooth(rec,label);
    let turn=0;for(let k=0;k<rec.length;k++)for(const g in rec[k].g){const q=rec[k].g[g];
     assert(q.toCamera<=(q.speaker?50.5:65.5),label+', frame '+k+': '+g+(q.speaker?' speaks':' listens')+' at '+q.toCamera.toFixed(1)+' degrees from the camera');
     if(k>0){const t=wrapD(q.yaw-rec[k-1].g[g].yaw);turn=Math.max(turn,t);assert(t<=8,label+', frame '+k+': '+g+' turned '+t.toFixed(1)+' degrees in one frame');}}
    out[label]={spots,lines,camera:cam,wholeEvening:whole.summary,maxTurnPerFrame:Math.round(turn*10)/10};}
    // the player walks 4.5 m along the veranda at walking speed (3.4 m/s) during line 2: the camera widens in time, so nobody is cut
    fresh();at(-7.55,6.4);at(-7.4,3.6,1);run('EVENING35.checkAt=1e18;');frames(90);run('CAMREC35=[camSample35()];EVENING35.checkAt=0;');
    run("(()=>{for(let k=0;k<900&&EVENING35.state!=='talking';k++)frames35(1);})()");assert.equal(state(),'talking','walking: talking');
    frames(30);run('T35+=300;EVENING35.next();');for(let k=1;k<=40;k++){at(-7.55+k*3.4/30,6.4);frames(1);}frames(20);
    const wrec=J("CAMREC35.filter(s=>s.state==='talking')");run('CAMREC35=null;');let wmax=0;
    for(let k=0;k<wrec.length;k++){assert.equal(wrec[k].cut,null,'walking along the veranda in line 2: nobody cut on frame '+k+': '+JSON.stringify(wrec[k]));if(k>0)wmax=Math.max(wmax,Math.abs(wrec[k].d-wrec[k-1].d)/wrec[k-1].d);}
    assert(wmax<=0.025,'walking along the veranda in line 2: the camera moves at most 2.5% a frame: '+wmax);
    out['walking along the veranda in line 2']={talkingFrames:wrec.length,maxStepPercent:Math.round(wmax*10000)/100};}
   finally{run('innerWidth=1280;innerHeight=800;navigator.maxTouchPoints=0;');}
   return out;});

  // a screen box (normalised device coordinates, and the nearest distance to the camera) of a w x h x d box standing at (x, y, z)
  run(`var box35=(c,x,y,z,w,h,d)=>{const v=new THREE.Vector3();let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,dep=1e9;for(const dx of [-w/2,w/2])for(const yy of [0,h])for(const dz of [-d/2,d/2]){
    v.set(x+dx,y+yy,z+dz);dep=Math.min(dep,v.distanceTo(c.position));v.project(c);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);}return {x0,x1,y0,y1,dep};};
   var over35=(a,b)=>a.x0<b.x1&&a.x1>b.x0&&a.y0<b.y1&&a.y1>b.y0;`);
  const PHONE_CASES=[['veranda column 0',-7.55,6.4,-7.4,3.6],['veranda column 2',-5.75,6.4,-5.6,3.6],['veranda column 5',-3.05,6.4,-3.3,3.6],['room by the door',-4.1,4.6,-6.0,3.5]];
  const toTalk=label=>{run("(()=>{for(let k=0;k<900&&EVENING35.state!=='talking';k++)frames35(1);})()");assert.equal(state(),'talking',label+': talking');};

  await step(8,()=>{run('innerWidth=390;innerHeight=844;navigator.maxTouchPoints=1;');
   try{fresh();at(-5.75,6.4);at(-5.6,3.6,1);run('EVENING35.checkAt=1e18;');frames(2);
    // walkers on the base street routes (index.html buildAmbient), each heading into the group or its foreground at its own pace, the keke
    // heading along the street, and Mr. Bassey walking the street on a schedule route; then the evening may start
    run(`walkers.length=0;{const mk=(r,i,x,z,sp)=>{const g=makeAvatar(CAST.oyelaran.look,true);g.position.set(x,0,z);scene.add(g);walkers.push({g,r,i,t:0,sp});};
      mk([[-28,9.6],[28,9.6]],1,-14,9.6,1.5);mk([[26,8.0],[-26,8.0]],1,1.0,8.0,1.2);mk([[-14,13.2],[14,13.2]],1,-12,13.2,1.6);mk([[26,8.0],[-26,8.0]],1,9.0,8.0,1.4);}
     keke=new THREE.Group();keke.position.set(-24,0,10.6);keke.dir=1;scene.add(keke);
     {const n=npcs.bassey;n.g.visible=true;n.g.position.set(2,0,10.2);n.route=[[2,10.2],[-12.75,10.2]];n.ri=0;n.dest=null;n.hideAtEnd=true;}
     EVENING35.checkAt=0;`);
    const sample=`(()=>{const c=cams[0];c.updateMatrixWorld();const p0=players[0].g.position,grp=[['the player',p0.x,p0.z]];
      for(const k of EVENING35.guests){const n=npcs[k],s=EVENING35.spots[k];if(n&&n.g.visible&&s&&Math.hypot(n.g.position.x-s[0],n.g.position.z-s[1])<2)grp.push([k,n.g.position.x,n.g.position.z]);}
      const gb=grp.map(([k,x,z])=>[k,box35(c,x,0,z,.6,1.9,.6)]),pts=[['the player',p0.x,p0.z],...Object.entries(EVENING35.spots).map(([k,s])=>[k+'\\u2019s spot',s[0],s[1]])];
      const others=[...walkers.map((w,i)=>['walker '+(i+1),w.g,.6,1.9,.6,1.0]),['the keke',keke,1.6,1.4,1.1,1.6],...Object.keys(npcs).filter(k=>!EVENING35.guests.includes(k)).map(k=>[k,npcs[k].g,.6,1.9,.6,1.0])];
      const bad=[];let near=1e9;
      for(const [k,o,w,h,d,r] of others){if(!o||!o.visible)continue;const x=o.position.x,z=o.position.z;
       for(const [g,sx,sz] of pts){const dd=Math.hypot(x-sx,z-sz);near=Math.min(near,dd-r);if(dd<r)bad.push(k+' within '+dd.toFixed(2)+' m of '+g+' at ('+x.toFixed(2)+', '+z.toFixed(2)+')');}
       const b=box35(c,x,0,z,w,h,d);for(const [g,q] of gb)if(over35(b,q)&&b.dep<q.dep)bad.push(k+' covers '+g+' on screen from ('+x.toFixed(2)+', '+z.toFixed(2)+')');}
      return {st:EVENING35.state,bad,near};})()`;
    let n=0,near=1e9;const frame=()=>{frames(1);n++;const s=J(sample);if(s.st==='arriving'||s.st==='talking'){near=Math.min(near,s.near);assert.deepEqual(s.bad,[],s.st+', frame '+n+': '+s.bad[0]);}return s;};
    for(let k=0;k<900&&(k<2||state()==='arriving');k++)frame();assert.equal(state(),'talking','talking');const walkIn=n;
    for(let l=0;l<3;l++){for(let k=0;k<90;k++)frame();if(l<2)run('T35+=300;EVENING35.next();');}
    const pos="[...walkers.map(w=>[w.g.position.x,w.g.position.z]),[keke.position.x,keke.position.z],[npcs.bassey.g.position.x,npcs.bassey.g.position.z,npcs.bassey.g.visible]]";
    const atEnd=J(pos);run('T35+=300;EVENING35.next();');assert.equal(state(),'leaving');
    for(let k=0;k<900&&state()!=='idle';k++)frame();assert.equal(state(),'idle','the guests have gone');frames(150);const later=J(pos);
    const moved=later.map((q,k)=>Math.round(Math.hypot(q[0]-atEnd[k][0],q[1]-atEnd[k][1])*100)/100);
    moved.forEach((m,k)=>assert(m>=3||(k===moved.length-1&&later[k][2]===false),'everyone moves on afterwards: '+JSON.stringify({moved,atEnd,later})));
    return {walkInFrames:walkIn,closestMarginBeyondOneMetre:Math.round(near*100)/100,movedAfterwards:moved};}
   finally{run('for(const w of walkers)scene.remove(w.g);walkers.length=0;if(keke)scene.remove(keke);keke=null;npcs.bassey.route=null;placeNPCs();innerWidth=1280;innerHeight=800;navigator.maxTouchPoints=0;');}});

  await step(9,()=>{fresh();
   // working class lists on the overlay, the panel and the toast (the harness elements have none), put back afterwards
   run(`var CL35=[ov,panel,document.getElementById('toast')].map(e=>[e,e.classList]);for(const [e] of CL35){const s=new Set();
     e.classList={add:(...a)=>a.forEach(c=>s.add(c)),remove:(...a)=>a.forEach(c=>s.delete(c)),toggle:(c,on)=>{const v=on===undefined?!s.has(c):!!on;if(v)s.add(c);else s.delete(c);return v;},contains:c=>s.has(c)};}`);
   try{const T="document.getElementById('toast')",on=()=>run(T+".classList.contains('on')");
    run("EVENING35.nudgedDay=0;LIFE34.waypoint=null;");at(10,10);ticks(5);const nudge=run('EVENING35.copy.nudge');
    assert.equal(run(T+'.textContent'),nudge,'the nudge toast');assert.equal(on(),true,'shown with no journal open');ticks(10);assert.equal(on(),true,'it stays while no journal is open');
    run("openLife34('today');");assert.equal(run("LIFE34.tab+','+panel.classList.contains('life-panel34')+','+overlayOpen()"),'today,true,true','the Today page is open');
    assert.equal(on(),false,'the nudge toast goes as Today opens (the bridge would put it just below the tabs, over the first card)');
    ticks(10);assert.equal(on(),false,'and it stays gone');assert.equal(run(T+'.style.transition'),'','its fade is back for the next toast');
    run("toast('A different note.');");ticks(3);assert.equal(on(),true,'another toast over the journal is untouched');run('closePanel();');
    return {nudge};}
   finally{run('for(const [e,c] of CL35)e.classList=c;');}});

  await step(10,()=>{run('innerWidth=390;innerHeight=844;navigator.maxTouchPoints=1;');const out={};
   // each frame's evening step is watched from inside the frame: just before it, every leaving guest is judged off or on the human view with
   // this check's own projection (the view's camera as the last frame left it, the guest where this frame's walk put it); just after it, who
   // was handed back and where they now stand
   run(`var DEP35=null;var off35=(c,x,z)=>{c.updateMatrixWorld();const b=box35(c,x,0,z,.6,1.9,.6);return b.x1<=-1.02||b.x0>=1.02||b.y1<=-1.02||b.y0>=1.02;};
     {const t0=EVENING35.tick;EVENING35.tick=function(){if(!DEP35||EVENING35.state!=='leaving')return t0.apply(this,arguments);const c=cams[0],pre={};
      for(const k of EVENING35.walkers){const n=npcs[k];pre[k]={off:off35(c,n.g.position.x,n.g.position.z),ended:!n.route,hidden:!n.g.visible,x:n.g.position.x,z:n.g.position.z};}
      const r=t0.apply(this,arguments);
      for(const k in pre){if(EVENING35.walkers.includes(k))continue;const n=npcs[k],sp=NPC_SPOTS[k][slot()];
       DEP35.push({k,frame:FT35,pre:pre[k],placedOff:!n.g.visible||off35(c,n.g.position.x,n.g.position.z),schedule:sp?!!(n.dest&&n.dest[0]===sp[0]&&n.dest[1]===sp[1]):n.hideAtEnd===true,x:n.g.position.x,z:n.g.position.z});}
      for(const k of EVENING35.walkers)if(pre[k].off||pre[k].ended||pre[k].hidden)DEP35.push({k,frame:FT35,pre:pre[k],kept:true});
      return r;};}`);
   try{for(const [label,hx,hz,cx,cz] of PHONE_CASES){fresh();at(hx,hz);at(cx,cz,1);toTalk(label);
     for(let l=0;l<3;l++){frames(10);if(l<2)run('T35+=300;EVENING35.next();');}
     // the screen boxes at Goodnight: a guest's overlap with the player's box from nearer the camera, as it stands on its spot
     const ov=`(c,k)=>{c.updateMatrixWorld();const p=players[0].g.position,pb=box35(c,p.x,0,p.z,.6,1.9,.6),g=npcs[k].g.position,b=box35(c,g.x,0,g.z,.6,1.9,.6);
       return over35(b,pb)&&b.dep<pb.dep?Math.min(b.x1,pb.x1)-Math.max(b.x0,pb.x0):0;}`;
     const start=J(`(()=>{const f=${ov};const o={};for(const k of EVENING35.walkers)o[k]=f(cams[0],k);return o;})()`);
     run('T35+=300;EVENING35.next();');assert.equal(state(),'leaving',label+': leaving');run('DEP35=[];');const ft0=run('FT35');
     // the way out: west to the street's end, clear of walls and props, never nearer the line from the player towards the camera than the spot
     const ways=J(`EVENING35.walkers.map(k=>{const n=npcs[k],p=players[0].g.position,c=cams[0].position,ux=c.x-p.x,uz=c.z-p.z,L=Math.hypot(ux,uz),pts=[[n.g.position.x,n.g.position.z],...n.route];
       const lat=(x,z)=>((x-p.x)*uz-(z-p.z)*ux)/L,l0=lat(pts[0][0],pts[0][1]);let nearer=0,blockedAt=null;
       for(const [x,z] of EVENING35.along(pts,0.2)){const a=((x-p.x)*ux+(z-p.z)*uz)/L,l=lat(x,z);if(a>0&&(l*l0<0||Math.abs(l)<Math.abs(l0)-0.05))nearer=Math.max(nearer,Math.abs(l0)-Math.abs(l));if(!blockedAt&&blocked(x,z,0.25))blockedAt=[x,z];}
       return {k,route:n.route.map(q=>q.map(v=>Math.round(v*100)/100)),west:n.route[n.route.length-1][0]<pts[0][0]-10,nearer,blockedAt};})`);
     for(const w of ways){assert(w.west,label+': '+w.k+' leaves west along the street: '+JSON.stringify(w.route));assert.equal(w.blockedAt,null,label+': '+w.k+'’s way is clear: '+JSON.stringify(w));
      assert.equal(w.nearer,0,label+': '+w.k+'’s way never comes nearer the camera-to-player line than the spot: '+JSON.stringify(w));}
     let n=0,worst=0,spotFrames=0,after=-1;const sp=J('EVENING35.spots');
     for(let k=0;k<900&&(after<0||after<60);k++){frames(1);n++;if(after>=0)after++;else if(state()==='idle')after=0;
      const s=J(`(()=>{const f=${ov};const o=[];for(const k of EVENING35.guests){const g=npcs[k].g;if(!g.visible)continue;o.push({k,x:g.position.x,z:g.position.z,leaving:EVENING35.walkers.includes(k),ov:f(cams[0],k)});}return o;})()`);
      for(const g of s){if(!(g.ov>0))continue;const d=Math.hypot(g.x-sp[g.k][0],g.z-sp[g.k][1]);
       assert(g.leaving&&d<0.3&&g.ov<=start[g.k]+1e-9,label+': '+g.k+' stands between the camera and the player on screen at ('+g.x.toFixed(2)+', '+g.z.toFixed(2)+'), '+d.toFixed(2)+' m from its spot, overlap '+g.ov.toFixed(3)+' (at Goodnight '+start[g.k].toFixed(3)+'), departure frame '+n);
       spotFrames++;worst=Math.max(worst,g.ov);}}
     assert.equal(state(),'idle',label+': the guests are handed back');
     const dep=J('DEP35');run('DEP35=null;');const handed={};
     for(const e of dep){if(e.kept)assert.fail(label+': '+e.k+' was off every human view (or at its way’s end) but not handed back: '+JSON.stringify(e));
      assert(e.pre.off||e.pre.ended||e.pre.hidden,label+': '+e.k+' handed back while still on the human view: '+JSON.stringify(e));
      assert(e.placedOff,label+': '+e.k+' placed where the view sees it: '+JSON.stringify(e));assert(e.schedule,label+': '+e.k+' back on its schedule: '+JSON.stringify(e));
      handed[e.k]={departureFrame:Math.round((e.frame-ft0)/33),offView:e.pre.off,placed:[Math.round(e.x*100)/100,Math.round(e.z*100)/100]};}
     assert.deepEqual(Object.keys(handed).sort(),['ada','nkechi','tunde'],label+': all three handed back');
     out[label]={ways:ways.map(w=>w.route[w.route.length-1]),cornerOverlapAtSpotFrames:spotFrames,largestCornerOverlapNdc:Math.round(worst*1000)/1000,handedBack:handed};}}
   finally{run('DEP35=null;innerWidth=1280;innerHeight=800;navigator.maxTouchPoints=0;');}
   return out;});

  await step(11,()=>{run('innerWidth=390;innerHeight=844;navigator.maxTouchPoints=1;');const out={};
   // the base builds its sign sprites once the fonts are ready (boot); here they are built for this check and taken away after it
   const before=run('FADEABLE.filter(m=>m.isSprite).length');if(!before)run('buildSigns();');const signs=run('FADEABLE.filter(m=>m.isSprite).length');assert(signs>0,'the signs are built');
   // each sign as drawn this frame (visible, its opacity, the evening's fade record) and whether its screen box meets, on screen, the box of an
   // arriving, talking or leaving guest, the player or the companion (a body of 0.6 x 1.9 x 0.6 m projected with the game's camera)
   const sample=`(()=>{const c=cams[0];c.updateMatrixWorld();const r=new THREE.Vector3().setFromMatrixColumn(c.matrixWorld,0),u=new THREE.Vector3().setFromMatrixColumn(c.matrixWorld,1),v=new THREE.Vector3(),st=EVENING35.state;
     const grp=[['the player',players[0].g.position],['the companion',players[1].g.position]];
     for(const k of EVENING35.guests){const n=npcs[k];if(n.g.visible&&(st==='arriving'||st==='talking'||EVENING35.walkers.includes(k)))grp.push([k,n.g.position]);}
     const gb=grp.map(([k,p])=>[k,box35(c,p.x,0,p.z,.6,1.9,.6)]),F=EVENING35.labelFades,out=[];let i=0;
     for(const m of FADEABLE){if(!m.isSprite)continue;const id=i++;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,ok=true;
      for(const a of [-.5,.5])for(const b of [-.5,.5]){v.copy(m.position).addScaledVector(r,a*m.scale.x).addScaledVector(u,b*m.scale.y).project(c);if(Math.abs(v.z)>1)ok=false;x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);}
      const over=[];if(ok)for(const [k,q] of gb){const L={x0:Math.max(x0,q.x0,-1),x1:Math.min(x1,q.x1,1),y0:Math.max(y0,q.y0,-1),y1:Math.min(y1,q.y1,1)};if(L.x0<L.x1&&L.y0<L.y1)over.push(k);}
      const f=F&&F.get(m);out.push({id,at:m.position.x+', '+m.position.z,drawn:m.visible&&m.material.opacity>0.01,op:m.material.opacity,f:f?f.f:1,hide:!!(f&&f.hide),over});}
     return {st,signs:out,fades:F?F.size:-1};})()`;
   try{for(const [label,hx,hz,cx,cz] of PHONE_CASES){fresh();at(hx,hz);at(cx,cz,1);run('EVENING35.checkAt=1e18;');frames(60);run('EVENING35.checkAt=0;');
     let n=0,prev=null,hid=0,overFading=0,endAt=-1,shownAt=-1;const since={},phases={};
     const look=()=>{frames(1);n++;const s=J(sample);assert(s.fades>=0,label+': the evening keeps a fade record for the signs');
      if(endAt<0&&s.st==='idle'&&n>1)endAt=n;
      for(const g of s.signs){const p=prev&&prev.signs[g.id];
       if(g.hide&&!(g.id in since))since[g.id]=n;if(!g.hide&&s.st!=='idle')assert(!(g.id in since),label+': the sign at ('+g.at+') came back before the hand-back, frame '+n);
       if(p)assert(Math.abs(g.f-p.f)<=0.13,label+': the sign at ('+g.at+') changed its fade from '+p.f.toFixed(2)+' to '+g.f.toFixed(2)+' in one frame, frame '+n);
       if(p&&p.drawn&&p.f>=0.99&&!g.drawn)assert.fail(label+': the sign at ('+g.at+') vanished in one frame, frame '+n);
       if(s.st!=='idle'&&g.drawn&&g.over.length){assert(g.hide&&n-since[g.id]<=10,label+': the sign at ('+g.at+') shows over '+g.over.join(', ')+' ('+s.st+', frame '+n+', opacity '+g.op.toFixed(2)+')');overFading++;}}
      hid=Math.max(hid,s.signs.filter(g=>g.hide).length);if(s.st!=='idle'&&n>1)phases[s.st]=(phases[s.st]||0)+1;prev=s;return s;};
     for(let k=0;k<900&&state()!=='talking';k++)look();assert.equal(state(),'talking',label+': talking');
     for(let l=0;l<3;l++){for(let k=0;k<45;k++)look();run('T35+=300;EVENING35.next();');}
     assert.equal(state(),'leaving');for(let k=0;k<900&&state()!=='idle';k++)look();assert.equal(state(),'idle',label+': handed back');
     for(let k=0;k<13;k++){const s=look();if(shownAt<0&&s.fades===0&&s.signs.every(g=>g.f===1&&!g.hide))shownAt=n;}
     assert(shownAt>0,label+': every sign is fully shown again within 0.4 s of the hand-back');
     out[label]={signsHidden:hid,framesWithAFadingSignOverTheGroup:overFading,framesByPhase:phases,shownAgainFramesAfterHandBack:shownAt-endAt};}}
   finally{if(!before)run('for(let k=FADEABLE.length-1;k>=0;k--)if(FADEABLE[k].isSprite){scene.remove(FADEABLE[k]);FADEABLE.splice(k,1);}');run('innerWidth=1280;innerHeight=800;navigator.maxTouchPoints=0;');}
   return out;});

  process.stdout.write('\n'+JSON.stringify({build:run('BUILD_ID'),checks})+'\n');
 })().catch(e=>{process.stdout.write('\n'+JSON.stringify({build:null,checks,crash:String(e&&e.message||e).split('\n')[0]})+'\n');});
}

function outer(){
 const runs=[];
 for(let k=0;k<2;k++){let out='';try{out=cp.execFileSync(process.execPath,[__filename,'--run'],{env:process.env,encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']});}catch(e){out=String(e.stdout||'');}
  let r=null;try{r=JSON.parse(out.trim().split('\n').pop());}catch(e){r={build:null,checks:[],crash:'no report'};}runs.push(r);}
 const D=NAMES.length-1,a=runs[0],checks=NAMES.slice(0,D).map(n=>a.checks.find(c=>c.name===n)||{name:n,passed:false,failure:a.crash||'did not run'});
 const allOk=checks.every(c=>c.passed),same=JSON.stringify(runs[0])===JSON.stringify(runs[1]);
 checks.push(allOk&&same?{name:NAMES[D],passed:true}:{name:NAMES[D],passed:false,failure:!allOk?'checks 1-'+D+' must pass in both runs':'the two runs differ'});
 for(const c of checks)console.log(c.passed?'PASS':'FAIL',c.name,c.passed?(c.info?JSON.stringify(c.info):''):'— '+c.failure);
 const passed=checks.every(c=>c.passed);
 const report={build:a.build,passed,checks,method:'Actual runtime state, ticks and actions in Node with the shipped Three.js, the authored hero, the life modules and the v35 modules; clock35, Math.random and Date.now stubbed; run twice in child processes and compared.'};
 fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');console.log(`${checks.filter(c=>c.passed).length}/${checks.length} passed`);if(!passed)process.exitCode=1;
}
if(process.argv[2]==='--run')inner();else outer();

// v35 sound (dist/src/audio-v35.js): five synthesised cues on TUNE's cue bus, each with a visual twin, and a per-device
// Sound setting in the Menu. Node has no Web Audio, so a fake AudioContext records what each cue schedules; nothing is heard
// here. The twins are checked on the real fishing and watering actions with a stubbed wall clock.
// Prints one PASS or FAIL line per check and writes check/results-audio-v35.json (no wall-clock values).
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const RESULTS=path.join(__dirname,'results-audio-v35.json');
const CUES=['cast','nibble','bite','catch','water'];
const WEEKDAY35=/\b(mon|tues|wednes|thurs|fri|satur|sun)days?\b/i,AMERICAN35=/\b(neighbor|color|favorite|center|gray|apartment|mom)s?\b/i;

// a dist that loads everything except audio-v35.js (for the tick-hook comparison in check 5)
function withoutAudioDir35(){const root=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd35-audio-'));
 for(const f of ['assets','src','data'])if(fs.existsSync(path.join(root,f)))fs.symlinkSync(path.join(root,f),path.join(d,f));
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script src="src\/audio-v35\.js"><\/script>\n?/g,'');
 fs.writeFileSync(path.join(d,'index.html'),html);return d;}

if(process.argv[2]==='--without-audio'){
 const {load}=require('./runtime-harness.cjs');
 load().then(({run})=>{console.log(JSON.stringify({tick:run('TICK_HOOKS.length'),cue:run("typeof CUE35_HOOKS==='undefined'?-1:CUE35_HOOKS.length"),audio:run('typeof AUDIO35')}));})
  .catch(e=>{console.error(e);process.exitCode=1;});
}else{
 const {load}=require('./runtime-harness.cjs');
 const checks=[];let runFn=null;
 (async()=>{
  const {run}=await load();runFn=run;
  const J=code=>JSON.parse(run('JSON.stringify('+code+')'));
  // determinism helpers (spec 11.2)
  run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;");
  run("var T35=1790000000000;if(typeof CLOCK35!=='undefined')CLOCK35.fn=()=>T35;");
  run("var PH='',TOASTS=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}");
  const base={tick:run('TICK_HOOKS.length'),cue:run("typeof CUE35_HOOKS==='undefined'?-1:CUE35_HOOKS.length"),
   tickSrc:run("TICK_HOOKS.filter(h=>/AUDIO35|audio_|AudioContext|createOscillator/.test(String(h))).length")};
  const hasAudio=()=>assert.equal(run('typeof AUDIO35'),'object','AUDIO35 is loaded');
  const check=(name,fn)=>{try{const info=fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});console.log('PASS',name);}
   catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});console.log('FAIL',name,'-',String(e&&e.message||e).split('\n')[0]);}};

  // A fake Web Audio context: records every node, its type, its parameter events, its connections and its start/stop times.
  const installFake=()=>run(`if(typeof FakeAC35==='undefined'){
   globalThis.AC35={log:[],made:0,resumes:0,suspends:0,buffers:0};
   globalThis.FakeParam35=class{constructor(v){this.value=v;this.ev=[];}setValueAtTime(v,t){this.ev.push(['set',v,t]);return this;}
    exponentialRampToValueAtTime(v,t){this.ev.push(['exp',v,t]);return this;}linearRampToValueAtTime(v,t){this.ev.push(['lin',v,t]);return this;}};
   const node=(ctx,kind)=>{const n={ctx,kind,out:[],disconnected:false,connect(x){this.out.push(x);return x;},disconnect(){this.disconnected=true;}};AC35.log.push(n);return n;};
   const src=n=>{n.start=(t,o)=>{n.startAt=t;n.offset=o;};n.stop=t=>{n.stopAt=t;};n.onended=null;return n;};
   globalThis.FakeAC35=class{constructor(){AC35.made++;this.state='suspended';this.currentTime=5;this.sampleRate=8000;this.destination={kind:'destination',out:[]};}
    createGain(){const n=node(this,'gain');n.gain=new FakeParam35(1);return n;}
    createOscillator(){const n=src(node(this,'osc'));n.type='sine';n.frequency=new FakeParam35(440);return n;}
    createBiquadFilter(){const n=node(this,'filter');n.type='lowpass';n.frequency=new FakeParam35(350);n.Q=new FakeParam35(1);n.gain=new FakeParam35(0);return n;}
    createBufferSource(){const n=src(node(this,'buffer'));n.buffer=null;return n;}
    createBuffer(ch,len,rate){AC35.buffers++;const d=new Float32Array(len);return {numberOfChannels:ch,length:len,sampleRate:rate,getChannelData:()=>d};}
    resume(){AC35.resumes++;this.state='running';return Promise.resolve();}
    suspend(){AC35.suspends++;this.state='suspended';return Promise.resolve();}
    close(){this.state='closed';return Promise.resolve();}};
   window.AudioContext=FakeAC35;}`);
  // what one call scheduled: node signature, timing relative to the context clock, envelopes, routing and release
  const SCHED=`(()=>{const ns=AC35.log.splice(0),ctx=AUDIO35.ctx,t0=ctx?ctx.currentTime+0.01:0;
   const sig=ns.map(n=>n.kind==='osc'||n.kind==='filter'?n.kind+':'+n.type:n.kind).sort().join(',');
   const srcs=ns.filter(n=>n.kind==='osc'||n.kind==='buffer');
   const starts=srcs.map(n=>n.startAt),stops=srcs.map(n=>n.stopAt);
   const envs=ns.filter(n=>n.kind==='gain'&&n.gain.ev.some(e=>e[0]==='exp'));
   const envOK=envs.every(n=>n.gain.ev[0][0]==='set'&&n.gain.ev[0][1]===0.0001&&n.gain.ev.filter(e=>e[0]==='exp').pop()[1]===0.0001);
   const reaches=(n,seen=new Set())=>{if(n===AUDIO35.master)return 'master';if(!n||seen.has(n))return null;seen.add(n);if(n instanceof FakeParam35)return 'param';
    for(const o of n.out||[]){const r=reaches(o,seen);if(r)return r;}return null;};
   const routes=srcs.map(n=>reaches(n));
   for(const n of srcs)if(typeof n.onended==='function')n.onended();
   return {sig,n:ns.length,sources:srcs.length,firstStart:starts.length?+(Math.min(...starts)-t0).toFixed(3):null,
    span:stops.length?+(Math.max(...stops)-t0).toFixed(3):null,envs:envs.length,envOK,
    toMaster:routes.filter(r=>r==='master').length,unrouted:routes.filter(r=>!r).length,released:ns.every(n=>n.disconnected)};})()`;

  // 1. The module loads; with no AudioContext (Node) nothing is created, nothing plays and the cue bus does not throw.
  check('No Web Audio: unlock creates nothing, play refuses, the cue bus does not throw',()=>{
   hasAudio();assert.equal(run("typeof window.AudioContext+typeof window.webkitAudioContext"),'undefinedundefined');
   assert.equal(run("localStorage.getItem('cd3-sound')"),null);assert.equal(run('AUDIO35.on()'),true,'sound defaults to on');
   run('AUDIO35.unlock()');assert.equal(run('AUDIO35.ctx'),null);assert.equal(run("AUDIO35.play('bite')"),false);
   assert.equal(run("(()=>{try{cue35('bite');cue35('cast');return true;}catch(e){return String(e);}})()"),true);
   assert.deepEqual(J('AUDIO35.played'),[]);
   // only AUDIO35 is a new top-level name: the private helpers stay inside the module's block
   assert.equal(run("[typeof audio_cue35,typeof setPref,typeof makeNoise,typeof prevMenu,typeof STORE].join()"),'undefined,undefined,undefined,undefined,undefined');
   assert.deepEqual(J('Object.keys(AUDIO35.recipes)'),CUES);
   return {cues:CUES};});

  // 2. With a (fake) AudioContext: the first gesture creates and resumes it; each cue schedules its own pattern, short and released.
  check('Fake AudioContext: unlock creates and resumes it; five distinct short cues; unknown and silent cues schedule nothing',()=>{
   hasAudio();installFake();
   run('AUDIO35.unlock()');assert.equal(run('AC35.made'),1);assert.equal(run('AC35.resumes'),1);assert.equal(run('AUDIO35.ctx.state'),'running');
   assert.equal(run('AUDIO35.master.gain.value'),0.5);assert.equal(run('AUDIO35.master.out[0]===AUDIO35.ctx.destination'),true);
   assert.equal(run('AC35.buffers'),1,'one noise buffer');assert.equal(run('AUDIO35.noise.length'),8000,'one second of noise');
   run('AUDIO35.unlock()');assert.equal(run('AC35.made'),1,'a second gesture reuses the context');run('AC35.log.length=0');
   const sched={};
   for(const c of CUES){assert.equal(run(`AUDIO35.play('${c}')`),true,c+' scheduled');sched[c]=J(SCHED);
    const s=sched[c];assert(s.n>0&&s.sources>0,c+' made nodes');assert.equal(s.firstStart,0,c+' starts 10 ms ahead');
    assert(s.span>0&&s.span<0.8,c+' is under 0.8 s: '+s.span);assert(s.envs>0&&s.envOK,c+' gain envelopes ramp from and to 0.0001');
    assert(s.toMaster>0&&s.unrouted===0,c+' reaches the master gain');assert(s.released,c+' disconnects every node when it ends');}
   for(let a=0;a<CUES.length;a++)for(let b=a+1;b<CUES.length;b++)assert.notEqual(sched[CUES[a]].sig,sched[CUES[b]].sig,CUES[a]+' and '+CUES[b]+' differ');
   assert.equal(run('AC35.buffers'),1,'the noise buffer is made once');
   // through the cue bus (TUNE's cue35) as the game emits them
   assert.equal(run("cue35('nibble');AC35.log.length"),sched.nibble.n);run('AC35.log.length=0');
   assert.equal(run("AUDIO35.played[AUDIO35.played.length-1]"),'nibble');
   // an unknown cue (EVENING's 'evening', or nonsense) and inherited keys schedule nothing
   assert.equal(run("AUDIO35.play('splash')||AUDIO35.play('constructor')||AUDIO35.play('toString')"),false);
   run("cue35('evening',{day:3});cue35('splash');cue35('constructor')");assert.equal(run('AC35.log.length'),0);
   // a silent remote replay never sounds
   run("_silent=true;cue35('bite');cue35('catch');_silent=false;");assert.equal(run('AC35.log.length'),0);
   // played is capped at 20
   run("for(let k=0;k<30;k++)AUDIO35.play('nibble');AC35.log.length=0;");assert.equal(run('AUDIO35.played.length'),20);
   return {signatures:Object.fromEntries(CUES.map(c=>[c,sched[c].sig])),spans:Object.fromEntries(CUES.map(c=>[c,sched[c].span]))};});

  // 3. The per-device toggle in the Menu: LOCAL_ONLY, writes localStorage, suspends and resumes, shows online, not on silent replays.
  check('Sound toggle: per device, LOCAL_ONLY, in the Menu (also online), off schedules nothing, silent Menu inserts nothing',()=>{
   hasAudio();installFake();if(run('AUDIO35.ctx')===null)run('AUDIO35.unlock()');
   run("S=newState();S.phase='play';closePanel();");
   assert.equal(run("LOCAL_ONLY.has('sound35')"),true);
   run("PH='';dispatch('sound35')");assert.equal(run("localStorage.getItem('cd3-sound')"),'off');assert.equal(run('AUDIO35.on()'),false);
   assert.equal(run('AC35.suspends'),1);assert.equal(run('AUDIO35.ctx.state'),'suspended');assert(run("PH.includes('Build '+BUILD_ID)"),'the Menu reopens');
   run('AC35.log.length=0');assert.equal(run("AUDIO35.play('catch')"),false);run("cue35('cast');cue35('water')");assert.equal(run('AC35.log.length'),0,'off: cues schedule nothing');
   run('AUDIO35.unlock()');assert.equal(run('AUDIO35.ctx.state'),'suspended','off: a gesture does not resume');
   // the Menu insertion, captured as verify-feel 20 does
   run("globalThis.MENU35={ins:[]};globalThis.realQS35=document.querySelector;document.querySelector=sel=>sel==='#panel .actions'?{insertAdjacentHTML:(w,h)=>MENU35.ins.push([w,h]),querySelector:()=>null}:null;");
   const soundIns=()=>J("MENU35.ins.filter(x=>x[1].includes('sound35'))");
   try{
    run('MENU35.ins=[];openMenu();');let ins=soundIns();assert.equal(ins.length,1);assert.equal(ins[0][0],'beforeend');assert(ins[0][1].includes('>Sound: off<'),ins[0][1]);
    assert(!/First evening|copyTimeline/.test(ins[0][1]),'the sound button is not a timeline insertion');
    run("PH='';dispatch('sound35')");assert.equal(run("localStorage.getItem('cd3-sound')"),'on');assert.equal(run('AUDIO35.on()'),true);
    assert.equal(run('AUDIO35.ctx.state'),'running','on: resumed');ins=soundIns();assert.equal(ins.length,2);assert(ins[1][1].includes('>Sound: on<'));
    run('AC35.log.length=0');assert.equal(run("AUDIO35.play('catch')"),true);run('AC35.log.length=0');
    // with the Graphics button present the setting goes right after it
    run("MENU35.gfx=[];document.querySelector=sel=>sel==='#panel .actions'?{insertAdjacentHTML:(w,h)=>MENU35.ins.push([w,h]),querySelector:q=>q==='[data-act=\"quality\"]'?{insertAdjacentHTML:(w,h)=>MENU35.gfx.push([w,h])}:null}:null;MENU35.ins=[];openMenu();");
    const gfx=J('MENU35.gfx');assert.equal(gfx.length,1,'inserted after Graphics');assert.equal(gfx[0][0],'afterend');assert(gfx[0][1].includes('data-act="sound35"'));assert.equal(soundIns().length,0);
    run("document.querySelector=sel=>sel==='#panel .actions'?{insertAdjacentHTML:(w,h)=>MENU35.ins.push([w,h]),querySelector:()=>null}:null;");
    run('MENU35.ins=[];_silent=true;openMenu();_silent=false;');assert.equal(soundIns().length,0,'a silent replay inserts nothing');
    run('MENU35.ins=[];NET.on=true;openMenu();NET.on=false;');assert.equal(soundIns().length,1,'online: the setting is per device and still shows');
   }finally{run('document.querySelector=realQS35;NET.on=false;_silent=false;');}
   // storage that throws (private mode): the choice still holds for the session
   run("globalThis.realLS35=localStorage;localStorage={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');},removeItem(){}};");
   try{assert.equal(run('AUDIO35.on()'),true);run("dispatch('sound35')");assert.equal(run('AUDIO35.on()'),false);run("dispatch('sound35')");assert.equal(run('AUDIO35.on()'),true);}
   finally{run('localStorage=realLS35;');}
   assert.equal(run("localStorage.getItem('cd3-sound')"),'on');run('closePanel()');
   return {offLabel:'Sound: off',onLabel:'Sound: on',localOnly:true,afterGraphics:true};});

  // 4. Every cue has its visual twin at the moment it fires, on the real actions (TUNE's cue bus, life's fishing and pot).
  check('Twins: at each real cue the visual twin is present (float, nibble twitch, dipped float, catch card, watered pot)',()=>{
   hasAudio();installFake();if(run('AUDIO35.ctx')===null)run('AUDIO35.unlock()');
   assert.deepEqual(J('Object.keys(AUDIO35.twins)'),CUES);
   for(const c of CUES){const t=run(`AUDIO35.twins['${c}']`);assert(typeof t==='string'&&t.length>10,c+' twin described');assert(!WEEKDAY35.test(t)&&!AMERICAN35.test(t),c+' twin copy');}
   run("buildTextures();buildTextures2();S=newState();S.phase='play';S.ai=true;AI.on=true;S.p[0].name='Efe';S.p[1].name='Ola';players=S.p.map((p,i)=>({i,g:makeHeroAvatar(lookFor(i)),y:0,t:0,prev:[0,0],face:[0,-1],moving:false}));players.forEach((p,i)=>{scene.add(p.g);p.g.position.set(S.p[i].pos[0],0,S.p[i].pos[1]);});buildWorld();buildProps();rebuildFurniture();spawnNPCs();ensureMarket();courtLight=new THREE.PointLight();sofa.L=1.657;sofa.W=.837;enterWorld();closePanel();");
   run(`globalThis.TWIN35=[];CUE35_HOOKS.push(function(n,d){const f=LIFE34.fish,l=S.life;TWIN35.push({n,
    twin:n==='cast'?!!LIFE34.fishingWorld&&!!LIFE34.fishingWorld.userData.bob&&!!f&&f.phase==='waiting':
     n==='nibble'?(typeof TUNE35!=='undefined'&&TUNE35.nibble())===true:
     n==='bite'?!!f&&f.phase==='bite'&&String(panel.innerHTML).includes('There! The float dipped.'):
     n==='catch'?!!(l&&l.catch&&l.catch.id===d.id)&&String(panel.innerHTML).includes('catch34'):
     n==='water'?!!(l&&l.crop&&l.crop.wateredDay===S.day):null,
    played:AUDIO35.played[AUDIO35.played.length-1]===n});});`);
   const at=(x,z,i=0)=>run(`players[${i}].y=0;players[${i}].g.position.set(${x},0,${z});players[${i}].prev=[${x},${z}];`);
   at(12.3,13.9);at(11,13,1);run("players[0].g.rotation.y=Math.PI;S.life.catch=null;AC35.log.length=0;AUDIO35.played.length=0;doFish(0);dispatch('lifeCast');");
   let calls=0;while(calls<40&&run('LIFE34.fish&&LIFE34.fish.phase')==='waiting'){run('T35+=200;tickFishing34(.05)');calls++;}
   assert.equal(run('LIFE34.fish.phase'),'bite','the bite came within 40 ticks of stubbed wall time');
   run("dispatch('lifeReel')");assert(run('!!S.life.catch'),'a catch');run("dispatch('lifeCatch',{v:'release'});closePanel();");
   at(-5.2,4.0);assert.equal(run('home34()'),true);run("dispatch('lifePlant');dispatch('lifeWater');dispatch('lifeWater');closePanel();");
   const tw=J('TWIN35');assert.deepEqual(tw.map(x=>x.n),CUES,'one cue each, in order: '+tw.map(x=>x.n).join());
   for(const x of tw){assert.equal(x.twin,true,x.n+' twin present');assert.equal(x.played,true,x.n+' sounded');}
   assert.deepEqual(J('AUDIO35.played'),CUES);
   return {cues:tw.map(x=>x.n),biteAfterSeconds:+(calls*0.2).toFixed(2)};});

  // 5. No per-frame work: AUDIO adds no tick hook (compared with the same build without audio-v35.js) and one cue subscriber.
  check('No tick hook: TICK_HOOKS match the build without AUDIO; AUDIO adds exactly one cue subscriber',()=>{
   hasAudio();assert.equal(base.tickSrc,0,'no tick hook mentions audio');
   assert.equal(run("TICK_HOOKS.filter(h=>/AUDIO35|audio_|AudioContext|createOscillator/.test(String(h))).length"),0);
   const d=withoutAudioDir35();let other;
   try{other=JSON.parse(cp.execFileSync(process.execPath,[__filename,'--without-audio'],{env:{...process.env,COMPOUND_GAME_DIR:d},encoding:'utf8'}).trim().split('\n').pop());}
   finally{fs.rmSync(d,{recursive:true,force:true});}
   assert.equal(other.audio,'undefined');assert.equal(base.tick,other.tick,'same TICK_HOOKS length with and without AUDIO');
   assert.equal(base.cue,other.cue+1,'one cue subscriber');
   return {tickHooks:base.tick,cueHooks:base.cue};});

  const passed=checks.length===5&&checks.every(c=>c.passed);
  const report={build:run('BUILD_ID'),passed,checks,method:'Actual runtime modules in Node with shipped Three.js and a recording fake AudioContext; the real cast, bite, reel and water actions with a stubbed wall clock. Nothing is heard here; no browser or phone test.'};
  fs.writeFileSync(RESULTS,JSON.stringify(report,null,2)+'\n');if(!passed)process.exitCode=1;
 })().catch(e=>{console.error(e);let build=null;try{build=runFn&&runFn('BUILD_ID');}catch(_){}
  fs.writeFileSync(RESULTS,JSON.stringify({build,passed:false,checks,failure:String(e&&e.message||e).split('\n')[0]},null,2)+'\n');process.exitCode=1;});
}

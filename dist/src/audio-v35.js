/* v35 sound (plan 4.5): five short synthesised cues (cast, nibble, bite, catch, water), each with a visual twin that already
   exists, because phones are often muted. Web Audio only, no files to load. The cues arrive on TUNE's cue bus (cue35), which
   drops silent remote replays, so a peer's action never sounds here. The Sound setting is per device (localStorage 'cd3-sound',
   absent means on) and lives in the Menu; the action is LOCAL_ONLY. No tick hook and no per-frame work: nodes are made per cue
   and disconnected when they end. Loads last, after days-v35.js and evening-v35.js. Public name: AUDIO35 only. */
const AUDIO35={ctx:null,master:null,noise:null,played:[],recipes:{},
 // what a muted phone sees instead of each sound (all drawn by life, the bridge or TUNE; listed so the pairing stays explicit)
 twins:{cast:'The float lands in open water with its ring, and the panel float bobs.',
  nibble:'The world float and the panel float twitch.',
  bite:'The float dips, its ring pulses, and the panel reads “There! The float dipped.”',
  catch:'The catch card shows the fish and its size.',
  water:'The pot’s soil darkens, and the Garden page shows “✓ Watered today”.'},
 on(){return true;},unlock(){},play(){return false;}};
{
 const STORE='cd3-sound',own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 let mem=null;   // this session's choice, used when storage is unavailable (private mode) or refuses the write
 const setPref=v=>{mem=v;try{localStorage.setItem(STORE,v);}catch(e){}};
 AUDIO35.on=function(){if(mem!==null)return mem!=='off';try{return localStorage.getItem(STORE)!=='off';}catch(e){return true;}};

 // one second of mono noise, filled from a fixed LCG so the game's Math.random sequence is never consumed
 const makeNoise=c=>{const len=Math.max(1,Math.round(c.sampleRate||44100)),b=c.createBuffer(1,len,c.sampleRate||44100),d=b.getChannelData(0);
  let s=12345;for(let i=0;i<len;i++){s=(s*1103515245+12345)&0x7fffffff;d[i]=s/0x3fffffff-1;}return b;};

 // a first gesture (and every later one, so a phone that locked resumes) creates or resumes the context
 AUDIO35.unlock=function(){if(!AUDIO35.on())return;let c=AUDIO35.ctx;
  if(!c){const AC=typeof window!=='undefined'&&window&&(window.AudioContext||window.webkitAudioContext);if(!AC)return;
   try{c=new AC();}catch(e){return;}
   const m=c.createGain();m.gain.value=0.5;m.connect(c.destination);AUDIO35.ctx=c;AUDIO35.master=m;
   try{AUDIO35.noise=makeNoise(c);}catch(e){AUDIO35.noise=null;}}
  if(c.state==='suspended'||c.state==='interrupted'){try{const p=c.resume();if(p&&p.catch)p.catch(()=>{});}catch(e){}}};

 AUDIO35.play=function(name){const c=AUDIO35.ctx;
  if(typeof name!=='string'||!own(AUDIO35.recipes,name)||!AUDIO35.on()||!c||c.state==='closed'||!AUDIO35.master)return false;
  try{AUDIO35.recipes[name](c,c.currentTime+0.01,AUDIO35.master);}catch(e){if(typeof console!=='undefined')console.warn('audio35',name,e);return false;}
  AUDIO35.played.push(name);if(AUDIO35.played.length>20)AUDIO35.played.shift();return true;};

 /* ---------- building blocks: every envelope ramps from 0.0001, every source disconnects its own chain when it ends ---------- */
 const env=(c,t,peak,attack,dur)=>{const g=c.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+attack);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);return g;};
 const release=(src,nodes)=>{src.onended=()=>{for(const n of nodes){try{n.disconnect();}catch(e){}}src.onended=null;};};
 const tone=(c,out,type,t,f0,f1,dur,peak,attack)=>{const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);
  if(f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+dur);const g=env(c,t,peak,attack,dur);o.connect(g);g.connect(out);
  o.start(t);o.stop(t+dur+0.02);release(o,[o,g]);};
 const noiseSrc=(c,t,dur,offset)=>{if(!AUDIO35.noise)AUDIO35.noise=makeNoise(c);const s=c.createBufferSource();s.buffer=AUDIO35.noise;
  s.start(t,offset);s.stop(t+dur+0.02);return s;};
 const plop=(c,out,t)=>tone(c,out,'sine',t,520,180,0.12,0.3,0.004);

 /* ---------- the five cues (all under 0.8 s) ---------- */
 // cast: the line whips out (noise through a falling bandpass), then the float plops in
 AUDIO35.recipes.cast=(c,t,out)=>{const s=noiseSrc(c,t,0.18,0.1),f=c.createBiquadFilter();f.type='bandpass';f.Q.value=1.4;
  f.frequency.setValueAtTime(1800,t);f.frequency.exponentialRampToValueAtTime(600,t+0.18);const g=env(c,t,0.25,0.02,0.18);
  s.connect(f);f.connect(g);g.connect(out);release(s,[s,f,g]);plop(c,out,t+0.28);};
 // nibble: two small ticks, like the float knocking
 AUDIO35.recipes.nibble=(c,t,out)=>{tone(c,out,'sine',t,1100,1100,0.025,0.18,0.003);tone(c,out,'sine',t+0.12,1100,1100,0.025,0.18,0.003);};
 // bite: a rising pull, then the float goes under
 AUDIO35.recipes.bite=(c,t,out)=>{tone(c,out,'triangle',t,260,620,0.18,0.35,0.01);plop(c,out,t+0.22);};
 // catch: three bright notes going up (C, E, G)
 AUDIO35.recipes.catch=(c,t,out)=>{[523.25,659.25,783.99].forEach((hz,k)=>tone(c,out,'triangle',t+k*0.1,hz,hz,0.14,0.22,0.01));};
 // water: a soft pour (low noise with a 14 Hz flutter)
 AUDIO35.recipes.water=(c,t,out)=>{const s=noiseSrc(c,t,0.45,0.4),f=c.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(900,t);f.Q.value=0.7;
  const trem=c.createGain();trem.gain.setValueAtTime(0.75,t);const lfo=c.createOscillator(),depth=c.createGain();lfo.type='sine';
  lfo.frequency.setValueAtTime(14,t);depth.gain.setValueAtTime(0.25,t);lfo.connect(depth);depth.connect(trem.gain);
  const g=env(c,t,0.2,0.04,0.45);s.connect(f);f.connect(trem);trem.connect(g);g.connect(out);lfo.start(t);lfo.stop(t+0.47);
  release(s,[s,f,trem,g]);release(lfo,[lfo,depth]);};

 // cue bus: TUNE (and EVENING) emit; only the five sound cues play, and silent replays never get here
 if(typeof CUE35_HOOKS!=='undefined')CUE35_HOOKS.push(function audio_cue35(n){if(typeof n==='string'&&own(AUDIO35.recipes,n))AUDIO35.play(n);});

 // listeners: capture phase, so the context exists before the click or key that casts
 if(typeof window!=='undefined'&&window&&window.addEventListener)for(const ev of ['pointerdown','keydown','touchend'])window.addEventListener(ev,()=>AUDIO35.unlock(),true);

 // wrap: the Menu offers the per-device Sound setting after Graphics (also online); a silent replay inserts nothing
 const prevMenu=openMenu;openMenu=function(){const r=prevMenu.apply(this,arguments);if(typeof silentMode==='function'&&silentMode())return r;
  const actions=typeof document!=='undefined'&&document.querySelector?document.querySelector('#panel .actions'):null;
  if(!actions||!actions.insertAdjacentHTML)return r;
  const html=btn(AUDIO35.on()?'Sound: on':'Sound: off','sound35',{},'quiet').replace('<button ','<button aria-pressed="'+AUDIO35.on()+'" ');   // as the Menu's 'Bigger text: on'
  // beside the other device settings (Shadows, Graphics), not next to 'Start a new household'
  const gfx=typeof actions.querySelector==='function'?actions.querySelector('[data-act="quality"]'):null;
  if(gfx&&gfx.insertAdjacentHTML)gfx.insertAdjacentHTML('afterend',html);else actions.insertAdjacentHTML('beforeend',html);return r;};
 // Sound on or off for this device only; on resumes (or creates) the context, off suspends it
 ACTIONS.sound35=function(){const turnOn=!AUDIO35.on();setPref(turnOn?'on':'off');
  if(turnOn)AUDIO35.unlock();else{const c=AUDIO35.ctx;if(c&&c.state!=='closed'&&typeof c.suspend==='function'){try{const p=c.suspend();if(p&&p.catch)p.catch(()=>{});}catch(e){}}}
  openMenu();};
 if(typeof LOCAL_ONLY!=='undefined')LOCAL_ONLY.add('sound35');
}

/* v40 Notices, children's things and fresh evenings: the pickup chime and Today's morning board line (the integrator; v40/SPEC.md §12, §14.1).
   Owner decision 1, "One a day": "A reason to cross the courtyard every late morning, which is the gap this build is aimed at." Today says so each
   morning, in a small block of its own.
   - The chime: a short two-note pluck, like a highlife guitar, on every lost-thing pickup (v38's and v39's through found38On('pickup'), the card
     things through chime40('card') from board-v40.js, the children's things through chime40('kid') from gist-v40.js). Built on football's sound
     pattern (fbAudio37, fbSound37): oscillators on AUDIO35.ctx into AUDIO35.master, only when that context exists, is running and Sound is on.
     It never creates a context, never adds an AUDIO35.recipes or twins key, never calls AUDIO35.play() (AUDIO35.played is untouched) and never
     emits a cue. The base's morning shells never chime (they are not lost things and exist from day 1). It reads AudioContext.currentTime, the
     audio clock football already uses, not the wall clock. The chime on the wash shells (cut item 1) is not built.
   - Today's v40 block: a todayHTML34 wrapper (outermost) puts one small block in the morning part of Today, after football's card and before
     the gist card, so the gist card's cap of rows never drops it (spec §14.1, critic finding 10). It holds up to three short lines, only after
     v40 is discovered and offline: the board line (board40Today, board-v40.js), the children's line (kid40Today, gist-v40.js) and Mallam's
     order (mallam40Today, mallam-v40.js). No DAYS35.rows push, no gist card row.
   - Touch Acts: v38's guard against the click a touchend makes on a panel just opened by a touch Act is armed for Mallam's order and taste
     panels and applied to every '.gist40-panel' (found by the integrator's capture at 844 x 390). (repair, H3) Those two panels, opened by a
     touch Act, also ignore taps on themselves for DAILY40.HOLD, so a thumb still tapping lands on nothing. (repair 3, R3-2) The hold is 1.0 s of
     FOUND38.t and every press while it runs starts it again (dailyPointer40): a v40 panel opened by a touch Act (Mallam's, the board's and the
     children's) takes a tap only once Act has been quiet for a second since it opened. At 390 x 844 a thumb tapping four times a second after
     the fan beat outlasted the 0.6 s hold and pressed Taste unseen. A keyboard Act arms nothing, as before. (repair 4, R4-7) While the hold runs
     the panel's buttons are shown dimmed (the class gist40-held on #panel, gist-v40.css) and they brighten when it ends, so a player knows to
     wait; read each frame from the hold itself (dailyDim40, on the EVENING35.tick by property), which it never changes.
   Installs nothing unless FOUND38, GIST38, GIST39 and an installed BOARD40 are all there (the copies without v38 or v39, and the subset copies,
   load it with no hook, no wrapper and no global write but its own declarations). No Math.random, no wall clock, no performance.now.
   Public names (all end in 40): DAILY40, audio40, chime40, todayBlock40, dailyTouch40, dailyPanel40, dailyPointer40, dailyClick40, dailyDim40; the
   wrapper bindings prevToday40, prevMallamAct40, prevBoardAct40, prevKidAct40 and prevEveTick40d. */
'use strict';
const DAILY40={v:1,on:false,
 CHIME:{gain:0.12,second:0.85,notes:[659.3,987.8],attack:0.008,dur:0.3,gap:0.09},   // two plucked notes about a fifth apart; the second a little softer
 n40:{chime:0,byKind:{}},
 HOLD:1.0,hold:-1,dim:false};   // (repair, H3; repair 3, R3-2) how long Act must be quiet before a touch-opened v40 panel takes a tap, in seconds of FOUND38.t, and until when
// the v35 sound bus when it may sound: a context that already exists, its master, and Sound on for this device (football's fbAudio37)
function audio40(){return typeof AUDIO35!=='undefined'&&AUDIO35&&AUDIO35.ctx&&AUDIO35.master&&typeof AUDIO35.on==='function'&&AUDIO35.on()?AUDIO35:null;}
// the chime: two triangle notes, each a fast attack and a 0.3 s exponential decay into the master bus; every source stops and disconnects itself
function chime40(kind){if(!DAILY40.on)return false;const A=audio40();if(!A)return false;
 try{const c=A.ctx;if(c.state&&c.state!=='running')return false;const C=DAILY40.CHIME,M=A.master,t=c.currentTime+0.005;
  C.notes.forEach((hz,k)=>{const t0=t+k*C.gap,peak=C.gain*(k?C.second:1),o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(hz,t0);
   g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(peak,t0+C.attack);g.gain.exponentialRampToValueAtTime(0.0001,t0+C.attack+C.dur);
   o.connect(g);g.connect(M);o.start(t0);o.stop(t0+C.attack+C.dur+0.02);o.onended=()=>{try{o.disconnect();g.disconnect();}catch(e){}o.onended=null;};});
  DAILY40.n40.chime++;const kd=String(kind||'lost');DAILY40.n40.byKind[kd]=(DAILY40.n40.byKind[kd]||0)+1;return true;}catch(e){return false;}}
// (repair 3, R3-2) the Act came from a pointer: v38's own test (a pointer down now, or within GUARD38.RECENT), read without arming its guard (pure)
function dailyTouch40(i){try{if(typeof mallamIsAI40==='function'&&mallamIsAI40(i))return false;const g=GUARD38;return g.ptr>0||FOUND38.t-g.last<g.RECENT;}catch(e){return false;}}
// (repair 3, R3-2) a v40 panel is open (pure)
function dailyPanel40(){try{return typeof overlayOpen==='function'&&overlayOpen()&&typeof panel!=='undefined'&&!!panel&&String(panel.innerHTML).includes('gist40-panel');}catch(e){return false;}}
// (repair 3, R3-2) a press while the hold runs (a pointer down anywhere, a thumb on Act or on the panel) starts it again; one after it has run out is
// a deliberate tap and leaves it; with no v40 panel open the hold is dropped
function dailyPointer40(){const D=DAILY40;try{if(!(FOUND38.t<D.hold))return;if(!dailyPanel40()){D.hold=-1;return;}D.hold=FOUND38.t+D.HOLD;}catch(e){}}
// v38's guard and the hold applied to '.gist40-panel' (capture phase): true when it swallowed the click
function dailyClick40(e){const g=GUARD38;if(!g.down&&FOUND38.t>=g.until&&FOUND38.t>=DAILY40.hold)return false;const t=e&&e.target;if(!(t&&typeof t.closest==='function'&&t.closest('.gist40-panel')))return false;
 try{if(e.preventDefault)e.preventDefault();if(e.stopImmediatePropagation)e.stopImmediatePropagation();if(e.stopPropagation)e.stopPropagation();}catch(x){}return true;}
// (repair 4, R4-7) the hold shown: a v40 panel holding its taps has its buttons dimmed (gist40-held on #panel), undimmed when the hold ends or the
// panel closes; the class is touched only when that changes, and the hold is only read
function dailyDim40(){const D=DAILY40;try{const on=FOUND38.t<D.hold&&dailyPanel40();if(on===D.dim)return;D.dim=on;if(typeof panel!=='undefined'&&panel&&panel.classList)panel.classList.toggle('gist40-held',on);}catch(e){}}
// Today's v40 block: the board line, the children's line and Mallam's order, each only when its module has something to say (pure)
function todayBlock40(){if(!DAILY40.on||typeof S==='undefined'||!S||!S.life||!S.life.gist38||(typeof NET!=='undefined'&&NET&&NET.on))return '';const lines=[];
 for(const [cls,f] of [['board',typeof board40Today==='function'?board40Today:null],['kid',typeof kid40Today==='function'?kid40Today:null],['mallam',typeof mallam40Today==='function'?mallam40Today:null]]){
  if(!f)continue;let r=null;try{r=f();}catch(e){r=null;}if(r&&typeof r.html==='string'&&r.html)lines.push(`<p class="small gist40-today-${cls}">${r.html}</p>`);}
 return lines.length?`<div class="life-note34 gist40-today" data-today40="1">${lines.join('')}</div>`:'';}
if(typeof BOARD40!=='undefined'&&BOARD40&&BOARD40.on&&typeof FOUND38!=='undefined'&&FOUND38&&typeof GIST38!=='undefined'&&GIST38&&typeof GIST39!=='undefined'&&GIST39){
 DAILY40.on=true;
 // every v38 and v39 lost thing picked up (v38's own event; the first is v38's discovery, so nothing chimes before a household has found something)
 if(typeof found38On==='function')found38On('pickup',function(){chime40('lost');});
 // wrap (outermost): Today's v40 block straight before the gist card (after football's), or before the chips when there is no gist card
 if(typeof todayHTML34==='function'){const prevToday40=todayHTML34;todayHTML34=function(){const h=prevToday40.apply(this,arguments);
  try{if(typeof h!=='string')return h;const blk=todayBlock40();if(!blk)return h;let at=h.indexOf('<div class="life-note34 gist38-card">');if(at<0)at=h.indexOf('<div class="life-chips34">');
   return at<0?h:h.slice(0,at)+blk+h.slice(at);}catch(e){if(typeof console!=='undefined')console.warn('daily40 today',e);return h;}};}
 // touch Acts on a phone: a touch Act fires on pointerdown, and the click the browser makes at touchend lands on whatever button of the new panel
 // is under the thumb. v38's guard (GUARD38, foundGuard38) swallows that click only inside '.gist38-panel'; v40's panels are '.gist40-panel'. So:
 // the same guard is armed for Mallam's order and taste panels (at 844 x 390 his order's buttons sit under the Act buttons, and the integrator's
 // capture saw the touchend choose an order unseen), and its clicks are swallowed inside '.gist40-panel' too, with v38's own rule and timing.
 // A keyboard Act arms nothing (foundGuard38's own test); dispatch() and the keys are untouched.
 if(typeof mallamAct40==='function'&&typeof foundGuard38==='function'){const prevMallamAct40=mallamAct40;mallamAct40=function(i,kind){
  try{if((kind==='mallam40order'||kind==='mallam40taste')&&!(typeof mallamIsAI40==='function'&&mallamIsAI40(i))){foundGuard38();if(GUARD38.down||GUARD38.until>FOUND38.t)DAILY40.hold=FOUND38.t+DAILY40.HOLD;}}catch(e){}return prevMallamAct40.apply(this,arguments);};}
 // (repair 3, R3-2) the board's and the children's thanks panels opened by a touch Act hold their taps the same way
 if(typeof boardAct40==='function'&&typeof GUARD38!=='undefined'){const prevBoardAct40=boardAct40;boardAct40=function(i){const touch=dailyTouch40(i),was=typeof overlayOpen==='function'&&overlayOpen();const r=prevBoardAct40.apply(this,arguments);
  try{if(touch&&!was&&dailyPanel40())DAILY40.hold=FOUND38.t+DAILY40.HOLD;}catch(e){}return r;};}
 if(typeof kidAct40==='function'&&typeof GUARD38!=='undefined'){const prevKidAct40=kidAct40;kidAct40=function(i){const touch=dailyTouch40(i),was=typeof overlayOpen==='function'&&overlayOpen();const r=prevKidAct40.apply(this,arguments);
  try{if(touch&&!was&&dailyPanel40())DAILY40.hold=FOUND38.t+DAILY40.HOLD;}catch(e){}return r;};}
 if(typeof GUARD38!=='undefined'&&GUARD38&&typeof FOUND38!=='undefined'&&typeof document!=='undefined'&&document&&typeof document.addEventListener==='function'){
  document.addEventListener('click',dailyClick40,true);document.addEventListener('pointerdown',dailyPointer40,true);}
 // (repair 4, R4-7) the dimmed hold, every frame (the tick runs under a panel; FOUND38.t, the hold's clock, advances there)
 if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.tick==='function'){const prevEveTick40d=EVENING35.tick;EVENING35.tick=function(dt){const r=prevEveTick40d.apply(this,arguments);dailyDim40();return r;};}}

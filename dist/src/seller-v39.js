/* v39 Aunty Bisi, thanks at the rail and fuller afternoons: the street and the household's legs (engineer A; v39/SPEC.md §1, §5, §11 and
   column A of §18.1).
   Some evenings (owner decision 1, "About 4 evenings in 5": "Never two missed in a row, and Today tells you each morning whether she's coming.
   She stays a small treat rather than a routine.") Aunty Bisi walks in from the gate a little before five with a tray of puff-puff and groundnut
   on her head. Until the household is a regular she strolls along the street calling; call her from the rail and she comes to it, lowers her
   tray and serves across it, and you help her lift it back up. Puff-puff, groundnut and a bag for Kemi and Emeka cost ₦500 each; an empty purse
   gets a taste, never credit; from the third evening bought she stops at your rail by herself and gives one extra, "jara". She leaves east by
   the gate and is gone by ten past six, before the neighbours come; the gist is never held for her. She also brings news from Finds (the Finds
   tip). The household walks to the rail when the gist's guests arrive (the walk clip on v38's glide).
   Inert until a trigger (§1.3): before v38 is discovered nothing at all; after it, before v39 is discovered, she walks the street on her evenings
   (world only: her figure, her calls and her two prompts; calling her saves nothing). The first purchase or taste discovers v39 (G.b39 inside
   S.life.gist38). No TICK_HOOKS entry (the step rides EVENING35.tick by property, inside typeof guards), no cue subscriber, no audio recipe, no
   LINES35/WHEN35/DAYS35.rows/FINDS34 change, no collider, no blocked() call at run time, no Math.random call (every three.js construction runs
   inside quiet39, her bubbles included), no wall clock (BISI39.t is the sum of the frame steps), never the base showBubble. Online it is all off.
   Loaded after gist-v38.js and before gist-v39.js (engineer B). Every change wraps an earlier global and calls it. Top-level names end in 39;
   wrapper bindings live inside blocks. With FOUND38 absent (a copy without v38) it installs nothing and builds nothing. */
'use strict';

/* ======================================================================================================================================
   1. The object and the copy (spec §1.6, §13.1). Speech is a draft for the Nigerian reader; the interface is plain English.
   ====================================================================================================================================== */
const BISI39={v:1,t:0,checkAt:0,
 // game hours: in from the gate 16:54, the stroll or her stop from 17:00, out from 17:50 (or 18:00 once she has stopped), hidden at 18:10
 HOURS:{inFrom:16.9,at:17.0,strollTo:17.8333,until:18.0,outBy:18.15,hide:18.1667},
 // bisiDay39: off when (hash38(d,39)>>>16)%4===0 and the day before was on (never two missing in a row): about four evenings in five. The high
 // bits: the low bits of hash38 over small whole numbers repeat every four days (the spec's %4 alone gave a fixed every-fourth-day rest, a
 // routine). Rule 'rest' is the owner's alternative (every evening but one rest day in seven).
 OFF:{mod:4,salt:39,shift:16,rule:'hash'},
 // the route (probed at r 0.3 every 0.1 m: node check/verify-gist-v39.cjs --probe): in from the gate, the stroll's east end, her stop in front of
 // Flat 3's walkway (clear of both walker lanes), the rail spot she serves across, out by the gate
 ROUTE:{enter:[4.0,9.6],strollIn:[1.0,8.8],stop:[-4.0,8.8],rail:[-4.0,7.55],exitTo:[4.0,9.6]},WALK:1.3,
 STROLL:{x0:-6.0,x1:1.0,z:8.8,speed:0.35},           // a triangle wave in S.time while not a regular (20 game minutes a leg)
 CALLZONE:{x0:-4.9,x1:-3.1,zMin:6.3,range:9},        // "Call Aunty Bisi": a standing player on the rail in front of the walkway
 RAILZ:7.4,                                          // the rail's street face: south of it is the street side
 REACH:2.4,LEAD:0.3,CALLDIST:0.3,STREET_LEAD:0.5,     // the buy prompt; the lead applies only on the rail side; the call's fixed distance
 // (fixer, S1) the call (and a regular's buy from the rail in front of the walkway) at a fixed 0.3, so the pepper pot's prompt (d - 0.2, never
 // nearer than 0.7 m to the zone) cannot hide it; the street-side buy during her stroll leads by 0.5, so Mallam's suya cannot hide her
 WAIT_FROM:16.0,                                     // (fixer, S15) "Wait for Aunty Bisi" only from four o'clock: it never skips the day
 OFFWIN:{from:1,to:5,at:3},                          // (fixer, S17) one evening off guaranteed within five evenings after her first
 CHIP_RANGE:12,                                      // (fixer, S4) a player this near her whose view does not show her sees her call on the HUD
 PRICE:{puffpuff:500,groundnut:500,kids:500},        // owner decision 1 (prices): ₦500 each
 TREAT:{cheer:3,energy:5,taste:2},REGULAR:2,          // jara, and her own stop, from the third evening bought
 CALL_EVERY:12,LIFT_S:1.2,KIDS_REACH:1.8,KIDS_LEAD:0.6,JUMP_H:0.02,
 MATCH:['setout','live','goal','restart','motor','waiting'],
 // (fixer, C11) the base 'ankara' two-piece (and, once the wardrobe has loaded, its sandals), its cloth repainted in her own plum and gold with
 // the ankara print: plum and gold are outside every CAST colour. The hero rig has no wrapper, so this is the closest ankara look (reader q. 3)
 LOOK:{skin:'#6E4630',hair:'wrap',outfit:'ankara'},CLOTH:{kind:'ankara',c1:'#6B2D5C',c2:'#F2C230'},
 LINES:{
  call:[['gs39-bi-call1','Puff-puff! Hot puff-puff!'],['gs39-bi-call2','Puff-puff dey o!'],['gs39-bi-call3','Groundnut! Fresh groundnut!']],
  come:['gs39-bi-come','I dey come!'],
  hi:['gs39-bi-hi','Good evening o. Puff-puff, five in a nylon, still hot. Groundnut, roasted this morning. Which one?'],
  reg:['gs39-bi-reg','Ah, my customer! You don come? The usual?'],
  jara:['gs39-bi-jara','Five, and one jara. Na so we dey do am for our people.'],
  pp:['gs39-bi-pp','Still warm.'],gn:['gs39-bi-gn','A small bottle, roasted this morning, salted just right.'],
  more:['gs39-bi-more','Enjoy. Anything else?'],
  taste:['gs39-bi-taste','Taste am first. Next time you go buy.'],
  lift:['gs39-bi-lift','Help me small. Ehen. Thank you, my customer.'],
  fin:['gs39-bi-fin','I passed Finds on my way. They are bringing out the {piece} tomorrow. If you want it, go early.'],
  finok:['gs39-bi-finok','You bought the {piece}? I told you.'],
  nk:['gs39-bi-nk','You fry too? Then you know say this thing na work.'],
  kidK:['gs39-kid-k','Thank you o! Half half, Emeka. Fair is fair.'],
  kidE:['gs39-kid-e','Auntie’s own is sweeter. But this one is hot.']},
 UI:{name:'Aunty Bisi',kicker:'AUNTY BISI',call:'Call Aunty Bisi',buy:'Buy from Aunty Bisi',
  wares:'Puff-puff in a covered bowl, and groundnut in small bottles.',
  puffpuff:'Puff-puff, a nylon of five',groundnut:'Groundnut, a small bottle',kids:'A bag for Kemi and Emeka',bought:'Bought',
  lift:'Help her lift the tray',notTonight:'Not tonight',close:'Close',
  ppToast:'Puff-puff, five in a nylon.',jaraToast:'Six puff-puff in the nylon: five, and one extra.',gnToast:'A small bottle of groundnut.',
  kidsBought:'A bag of puff-puff for Kemi and Emeka. They are at the football pitch.',
  give:'Give Kemi and Emeka the puff-puff',kidsGone:'Kemi and Emeka had already gone in. You shared the puff-puff yourselves instead.',
  finsPaid:' Aunty Bisi was right about the {piece}.',
  rowOn:'Aunty Bisi passes this evening from five, with puff-puff.',rowOff:'Aunty Bisi is not passing this evening.',
  rowBeen:'Aunty Bisi has been this evening.',rowGone:'Aunty Bisi has gone on her way for this evening.',
  // (fixer, DOD-1) folded into v38's "This evening" row, which is never dropped while the evening is ahead
  eveOn:'This evening: Aunty Bisi from five, the neighbours from a quarter past six.',
  eveOff:'This evening: Aunty Bisi is not passing; the neighbours come by from a quarter past six.',
  eveBeen:'This evening: Aunty Bisi has been; the neighbours come by from a quarter past six.',
  eveGone:'This evening: Aunty Bisi has gone on her way; the neighbours come by from a quarter past six.',
  callChip:'Aunty Bisi:',
  rowFinds:'Aunty Bisi says the {piece} is at Finds today.',
  wait:'Wait for Aunty Bisi',benchWait:'Wait here for Aunty Bisi',benchSub:'She passes with puff-puff from five'},
 heldDay:0,                                          // called or bought from tonight (memory only)
 kidsDay:0,                                          // (fixer, S3) the day Kemi and Emeka were last seen out (memory only)
 world:{fig:null,tray:null,bag:null,bub:{},live:[],lite:false},
 state:'off',flags:{now:0,off:0,playtest:false,value:null,parsed:false},
 // the runtime of one evening (memory only; reset by a new day, enterWorld and a new household)
 run:{day:0,phase:'off',mode:'',pos:null,path:null,prog:0,atRail:false,serving:null,goneDay:0,lastTime:-1,calls:0,callAt:0,arrived:false,
  buyer:0,lift:null,kidsToast:false,yaw:Math.PI},
 cost:{steps:0,builds:0,checks:0}};

/* ======================================================================================================================================
   2. Shared helpers: the quiet builder, the save (spec §1.2, §1.7, §10). quiet39 is shared with engineer B.
   ====================================================================================================================================== */
// a copy of quiet38 (itself a copy of football's fbQuiet37) with its own seed and generator state: three.js draws Math.random for every new
// object's UUID, so every v39 construction runs with a local generator in its place for a moment and the game's own sequence never shifts
let quietSeed39=0x3900,quietOn39=false;
function quiet39(fn){if(quietOn39)return fn();const keep=Math.random;let s=quietSeed39;quietOn39=true;
 Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
 try{return fn();}finally{quietSeed39=s;Math.random=keep;quietOn39=false;}}
function bisiOnline39(){return typeof NET!=='undefined'&&!!NET&&!!NET.on;}
function bisiIsAI39(i){return typeof AI!=='undefined'&&!!AI&&!!AI.on&&i===AI.i;}
function bisiLog39(k,a){try{if(typeof LOG35!=='undefined'&&LOG35&&typeof LOG35.add==='function')LOG35.add(k,a);}catch(e){}}
function bisiToast39(m){try{if(typeof toast==='function')toast(m);}catch(e){}}
function bisiSave39(){try{if(typeof save==='function')save();}catch(e){}}
function bisiSilent39(){try{return typeof silentMode==='function'&&silentMode();}catch(e){return false;}}
function bisiOverlay39(){try{return typeof overlayOpen==='function'&&overlayOpen();}catch(e){return false;}}
function bisiFill39(t,v){return String(t).replace(/\{(\w+)\}/g,(m,k)=>v&&v[k]!=null?v[k]:m);}
function bisiGist39(){return typeof gistSave38==='function'?gistSave38():null;}
// the v39 record inside S.life.gist38 (spec §21), or null; create makes it (v39 discovery) and gives null with no S.life.gist38 or online.
// Fields are lazy and additive: a record from an earlier v39 build gains what this one reads.
function gistSave39(create){
 if(typeof S==='undefined'||!S||!S.p||!S.life||!S.life.gist38)return null;
 const G=bisiGist39();if(!G)return null;
 if(!G.b39||typeof G.b39!=='object'){if(!create||bisiOnline39()||S.phase!=='play')return null;
  G.b39={v:1,since:S.day,bisi:{n:0,days:{},taste:0,kids:null,lift:0},finds:null,treat:{},thanked:{},photo:null,stool:null,pot:null,potLast:{},once:{}};}
 const b=G.b39;if(!b.bisi||typeof b.bisi!=='object')b.bisi={n:0,days:{},taste:0,kids:null,lift:0};if(!b.bisi.days||typeof b.bisi.days!=='object')b.bisi.days={};
 for(const k of ['treat','thanked','potLast','once'])if(!b[k]||typeof b[k]!=='object')b[k]={};
 for(const k of ['finds','photo','stool','pot'])if(b[k]===undefined)b[k]=null;
 return b;}

/* ======================================================================================================================================
   3. When she comes, pure (spec §5.1): her day, her evening, regular or not, her phase from the clock. The API for engineer B (§1.7).
   ====================================================================================================================================== */
// some evenings: about four in five, never two missing in a row; the household's first gist evening always
// (polish) ?bisi=off (testers): one evening off on purpose, so a session sees Today say she is not passing: the evening after the household's
// first gist evening (-1 until then), or, when the world is entered after that, the next evening after one of hers; the evening after it is hers
function bisiFirst39(){const G=typeof gistSaveG38==='function'?gistSaveG38():bisiGist39();return (G&&G.eve&&G.eve.first)||0;}
function bisiOffDay39(){const o=BISI39.flags.off;if(o>0)return o;if(o!==-1)return 0;const first=bisiFirst39();return first?first+1:0;}
function bisiDay39(d){
 if(BISI39.flags.off){const at=bisiOffDay39();if(at&&d===at)return false;if(at&&d===at+1)return true;}
 if(BISI39.flags.playtest)return true;
 if(BISI39.OFF.rule==='rest')return (d-2)%7!==0;                                  // the owner's alternative: every evening but one rest day
 const G=typeof gistSaveG38==='function'?gistSaveG38():bisiGist39(),first=G&&G.eve&&G.eve.first;
 if(!first||d===first)return true;                                                // before the first gist: every gist evening (only the first can occur)
 const O=BISI39.OFF,off=x=>(hash38(x,O.salt)>>>O.shift)%O.mod===0,miss=x=>x!==first&&off(x)&&!off(x-1),W=BISI39.OFFWIN;
 // (fixer, S17) "She stays a small treat rather than a routine": when the hash gives no evening off in the five after her first, the third is one
 // (its neighbours are in the window, so never two missed in a row)
 if(d>=first+W.from&&d<=first+W.to){let any=false;for(let k=W.from;k<=W.to;k++)if(miss(first+k))any=true;if(!any)return d!==first+W.at;}
 return !miss(d);}
// her evening tonight, apart from the clock: offline, not silent, no party, v38 discovered, a gist due tonight (never the v35 evening's day), her day
function bisiEvening39(){
 if(typeof S==='undefined'||!S||!S.p||S.phase!=='play'||typeof players==='undefined'||!players.length)return false;
 if(bisiOnline39()||bisiSilent39())return false;
 if(S.party&&S.party.on&&!S.party.done)return false;
 if(BISI39.flags.now&&BISI39.flags.now===S.day)return true;                      // ?bisi=now (reviewers)
 if(!S.life||!S.life.gist38)return false;
 if(!(typeof gistDueTonight38==='function'&&gistDueTonight38()))return false;
 return bisiDay39(S.day);}
// a regular: bought from on REGULAR earlier evenings (before v39 discovery there is no record, so she always strolls)
function bisiRegular39(){const b=gistSave39(false);if(!b)return false;const n=b.bisi.n|0,today=b.bisi.days[S.day]&&b.bisi.days[S.day].length?1:0;return n-today>=BISI39.REGULAR;}
// called or bought from tonight (or a taste given): she stops strolling and calling
function bisiHeld39(){if(BISI39.heldDay===S.day)return true;const b=gistSave39(false);return !!(b&&((b.bisi.days[S.day]&&b.bisi.days[S.day].length)||b.bisi.taste===S.day));}
// when she sets off from the gate: 16:54 to the stroll's east end; a regular a little earlier, so she reaches her stop at 17:00 at her walk
function bisiInFrom39(regular){const B=BISI39,R=B.ROUTE;return regular?B.HOURS.at-Math.hypot(R.stop[0]-R.enter[0],R.stop[1]-R.enter[1])/(B.WALK*60):B.HOURS.inFrom;}
// her phase from the clock alone: 'off' | 'in' | 'stroll' | 'stop' | 'out'
function bisiPhase39(t,regular,held){const H=BISI39.HOURS;
 if(BISI39.flags.now&&BISI39.flags.now===S.day)return 'stop';
 if(t<bisiInFrom39(regular)||t>=H.hide)return 'off';if(t<H.at)return 'in';
 if(t>=((regular||held)?H.until:H.strollTo))return 'out';return (regular||held)?'stop':'stroll';}
// tonight, pure: {on, regular, held, phase, bought:{puffpuff,groundnut,kids}, taste}
function bisiTonight39(){const on=bisiEvening39(),regular=on&&bisiRegular39(),held=on&&bisiHeld39();const b=gistSave39(false),list=(b&&b.bisi.days[S.day])||[];
 return {on,regular,held,phase:on?bisiPhase39(S.time,regular,held):'off',bought:{puffpuff:list.includes('puffpuff'),groundnut:list.includes('groundnut'),kids:list.includes('kids')},taste:!!(b&&b.bisi.taste===S.day)};}
// what was eaten from her tray on a day (B's treat line): {items, taste} or null. Pure.
function bisiTreat39(day){const b=gistSave39(false);if(!b)return null;const list=(b.bisi.days[day]||[]).filter(v=>v!=='kids');const taste=b.bisi.taste===day;
 if(!list.length&&!taste)return null;return {items:list.slice(),taste:!list.length&&taste};}
// the stroll: a triangle wave in S.time between x1 (east) and x0 (west), 20 game minutes a leg, starting at the east end at 17:00
function bisiStrollX39(t){const T=BISI39.STROLL,len=T.x1-T.x0,leg=len/T.speed,u=Math.max(0,(t-BISI39.HOURS.at)*60),k=Math.floor(u/leg),f=(u-k*leg)/leg;
 return k%2===0?T.x1-len*f:T.x0+len*f;}

/* ======================================================================================================================================
   4. Building her (spec §5.2) and her bubbles (§5.1): every construction inside quiet39
   ====================================================================================================================================== */
function bisiMat39(c,o){return new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));}
// the tray: a rolled head-pad, a wide enamel tray with a covered bowl of puff-puff and small groundnut bottles (its base at y 0)
function bisiTray39(){const g=new THREE.Group();g.name='bisi39_tray';
 const pad=new THREE.Mesh(new THREE.TorusGeometry(0.075,0.026,6,14),bisiMat39('#C8553D'));pad.rotation.x=Math.PI/2;pad.position.y=0.02;g.add(pad);
 const tray=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.2,0.035,20),bisiMat39('#E9E2D0'));tray.position.y=0.055;g.add(tray);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(0.217,0.01,5,24),bisiMat39('#3E6FA8'));rim.rotation.x=Math.PI/2;rim.position.y=0.074;g.add(rim);
 const bowl=new THREE.Mesh(new THREE.SphereGeometry(0.11,14,8,0,Math.PI*2,0,Math.PI/2),bisiMat39('#D9D2C0'));bowl.position.set(-0.05,0.072,0);g.add(bowl);
 const cloth=new THREE.Mesh(new THREE.CylinderGeometry(0.118,0.118,0.012,16),bisiMat39('#F2C230'));cloth.position.set(-0.05,0.135,0);g.add(cloth);
 for(let k=0;k<4;k++){const b=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.02,0.075,8),bisiMat39('#C9A06A',{transparent:true,opacity:0.85}));
  b.position.set(0.12+(k%2)*0.045,0.11,-0.045+Math.floor(k/2)*0.075);g.add(b);}
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;o.userData.own39=true;}});return g;}
// her figure: the hero rig as visual-v21 builds the neighbours, the lite body while the hero is not ready (rebuilt once when it is)
function bisiMake39(){const B=BISI39,look=Object.assign({},B.LOOK);let g=null,lite=false;
 if(typeof HERO!=='undefined'&&HERO&&HERO.state==='ready'){try{g=makeAvatar(Object.assign({},look,{rig:'hero'}));}catch(e){g=null;}}
 if(!g||!g.hero){lite=true;try{g=makeAvatar(look,true);}catch(e){g=null;}}
 if(!g){g=new THREE.Group();const m=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.2,1.5,10),bisiMat39(B.CLOTH.c1));m.position.y=0.75;m.userData.own39=true;g.add(m);lite=true;}
 if(!lite)bisiCloth39(g);
 const tray=bisiTray39();tray.userData.gist39='tray';
 if(!lite&&g.hero&&g.hero.head){tray.position.set(0,0.2,0);tray.scale.setScalar(1/Math.max(0.01,g.scale.x||1));g.hero.head.add(tray);}
 else{tray.position.set(0,1.62,0);g.add(tray);}
 g.name='bisi39';g.userData.gist39='bisi';g.userData.lite39=lite;g.baseY=0;g.visible=false;return {g,tray,lite};}
// (fixer, C11) her cloth: the ankara outfit's top and bottom slots (the base asset's) and the wardrobe's ankara shirt and trousers (their print and
// edging) take the ankara print in plum and gold; one texture, built inside quiet39 with the figure
function bisiCloth39(g){const C=BISI39.CLOTH;let tex=null;try{tex=typeof clothTexture==='function'?clothTexture(C.kind,C.c1,C.c2):null;}catch(e){tex=null;}
 g.traverse(o=>{if(!o.isMesh)return;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(!m||!m.color)continue;
  if(m.name==='top'||m.name==='bottom'||m.name==='ankara_print'){m.color.set(tex?'#ffffff':C.c1);if(tex)m.map=tex;m.needsUpdate=true;}
  else if(m.name==='top_dark'||m.name==='bottom_dark'){m.color.set(C.c1);}else if(m.name==='ankara_edge'){m.color.set(C.c2);}}});}   // the wardrobe's shirt and trousers: their print and their edging
// the wardrobe's ankara pieces (shirt, trousers, sandals) are loaded: her figure is rebuilt once to wear them
function bisiWardOK39(){try{return typeof WARDROBE!=='undefined'&&!!WARDROBE&&typeof wardrobeReady==='function'&&wardrobeReady(WARDROBE.outfits.ankara||[]);}catch(e){return false;}}
function bisiBuild39(){const B=BISI39,W=B.world;
 if(W.fig&&!(W.lite&&typeof HERO!=='undefined'&&HERO&&HERO.state==='ready')&&!(!W.lite&&!W.ward&&bisiWardOK39()))return W.fig;
 const keep=W.fig?{pos:W.fig.position.clone(),rot:W.fig.rotation.y,parent:W.fig.parent}:null;if(W.fig)bisiDropFig39();
 const r=quiet39(()=>bisiMake39());W.fig=r.g;W.tray=r.tray;W.lite=r.lite;W.ward=!r.lite&&bisiWardOK39();B.cost.builds++;
 if(keep){r.g.position.copy(keep.pos);r.g.rotation.y=keep.rot;if(keep.parent)keep.parent.add(r.g);}
 return W.fig;}
// a copy of football's fbTextSprite37: one canvas sprite per text (the bubble's paper and ink)
function bisiSprite39(text){const cv=document.createElement('canvas'),sc=2,g=cv.getContext('2d'),fs=34,font=`700 ${fs}px Fraunces, Georgia, serif`;g.font=font;
 const mw=t=>{const m=g.measureText&&g.measureText(t);return m&&m.width?m.width:t.length*fs*0.55;},words=String(text).split(' '),lines=[];let cur='';
 for(const w of words){const t=cur?cur+' '+w:w;if(cur&&mw(t)>440){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);
 const n=Math.min(lines.length,3),W=Math.min(496,Math.max(...lines.slice(0,n).map(mw))+44),H=n*42+30;cv.width=512*sc;cv.height=Math.ceil(H+8)*sc;if(g.scale)g.scale(sc,sc);
 g.fillStyle='rgba(248,239,221,.96)';if(typeof roundRect==='function')roundRect(g,256-W/2,4,W,H,16);if(g.fill)g.fill();g.fillStyle='#2A1F17';g.font=font;g.textAlign='center';g.textBaseline='middle';
 for(let k=0;k<n;k++)if(g.fillText)g.fillText(lines[k],256,4+15+21+k*42);const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));sp.userData.h39=(H+8)/512;sp.name='bisi39_bubble';sp.renderOrder=5;return sp;}
// the quiet, module-timed bubble (football's fbBubble37 pattern): one sprite per text, cached by text, built inside quiet39, timed on BISI39.t,
// never in the base's bubbles (its expiry never touches it), taken out of the scene when it ends or its figure hides; null when silent.
// (polish) a speaker has one bubble at a time: a new line takes down that speaker's live one ('I dey come!' replaces her call). Never frustum
// culled by three.js, so every camera calls bisiClamp39, which decides for itself whether that camera can see the speaker
function bisiBubble39(text,ms,obj,y){const B=BISI39,W=B.world;if(bisiSilent39()||typeof scene==='undefined'||!scene)return null;obj=obj||W.fig;if(!obj||!text)return null;
 let b=W.bub[text];if(!b){b=quiet39(()=>bisiSprite39(text));b.userData.gist39='bubble';b.onBeforeRender=bisiClamp39;b.frustumCulled=false;W.bub[text]=b;B.cost.builds++;}
 for(let j=W.live.length-1;j>=0;j--){const o=W.live[j];if(o!==b&&o.userData.f39&&o.userData.f39.obj===obj){o.visible=false;if(o.parent)o.parent.remove(o);W.live.splice(j,1);}}
 const h=typeof innerHeight==='number'&&innerHeight>0?innerHeight:800,k=Math.min(1.8,Math.max(1,600/h)),Wd=1.7*k;b.scale.set(Wd,Wd*b.userData.h39,1);
 b.userData.f39={obj,y:(y||2.3)+Wd*b.userData.h39/2,hy:(y||2.3)-SEEN39.HEAD,end:BISI39.t+(ms||3600)/1000,sx:Wd,sy:Wd*b.userData.h39};
 b.position.set(obj.position.x,(obj.position.y||0)+b.userData.f39.y,obj.position.z);b.visible=true;if(b.parent!==scene)scene.add(b);
 if(!W.live.includes(b))W.live.push(b);return b;}
// (fixer, I4 and S14) drawn by each camera in turn: the bubble is put back over its speaker, then moved inside that camera's half (under the top
// bar, clear of the split edge) at the same depth; three.js calls this per camera just before it draws the sprite.
// (polish) the clamp is for a speaker that camera can see: when the speaker's head is behind the camera or outside its frame by more than
// SEEN39.M, the bubble is drawn at zero scale for that camera only (the next camera's call puts the scale back first). The HUD chip asks the
// same question (bisiSeen39), so a player sees her call either over her head or on the chip, never both and never neither
const CLAMP39={v:null,M:0.02};
const SEEN39={v:null,M:0.1,HEAD:0.7};                  // the margin in NDC (a twentieth of the half's width); the head this far under the bubble's foot
// is the point (x, y, z) inside camera i's frame (under its top bar), allowing SEEN39.M, and in front of it? i<0: a camera with no half (the whole frame)
function bisiSeen39(camera,i,x,y,z){const out={seen:false,behind:true,x:0,y:0};if(!camera)return out;
 const v=SEEN39.v||(SEEN39.v=new THREE.Vector3());camera.updateMatrixWorld();v.set(x,y,z).applyMatrix4(camera.matrixWorldInverse);out.behind=-v.z<=0.1;
 v.set(x,y,z).project(camera);out.x=v.x;out.y=v.y;let top=1;
 if(i>=0&&typeof v21Viewport==='function'){const vp=v21Viewport(i);if(vp&&vp.h>0)top=1-2*(vp.top||0)/vp.h;}
 const M=SEEN39.M;out.seen=!out.behind&&v.x>=-1-M&&v.x<=1+M&&v.y>=-1-M&&v.y<=top+M;return out;}
function bisiClamp39(rend,sc,camera){const b=this,f=b.userData&&b.userData.f39;if(!f||!f.obj||!camera||!camera.isPerspectiveCamera)return;
 const v=CLAMP39.v||(CLAMP39.v=new THREE.Vector3()),ax=f.obj.position.x,ay=(f.obj.position.y||0)+f.y,az=f.obj.position.z;b.position.set(ax,ay,az);if(f.sx)b.scale.set(f.sx,f.sy,1);
 try{camera.updateMatrixWorld();v.set(ax,ay,az).applyMatrix4(camera.matrixWorldInverse);const dz=-v.z;
  if(dz>0.1){let top=1,bot=-1;const i=typeof cams!=='undefined'&&cams?cams.indexOf(camera):-1;
   if(i>=0&&typeof v21Viewport==='function'){const vp=v21Viewport(i);if(vp&&vp.h>0){top=1-2*(vp.top||0)/vp.h;bot=-1+2*(vp.bottom||0)/vp.h;}}
   const m=CLAMP39.M,th=Math.tan((camera.fov||50)*Math.PI/360);let hh=(b.scale.y/2)/(dz*th),hw=(b.scale.x/2)/(dz*th*(camera.aspect||1));
   // wider or taller than the half (a narrow phone half, a near camera): drawn smaller for this camera
   const k=Math.min(1,(1-m)/hw,((top-bot)/2-m)/hh);if(k<1&&k>0){b.scale.set(b.scale.x*k,b.scale.y*k,1);hw*=k;hh*=k;}
   v.set(ax,ay,az).project(camera);const x=Math.max(-1+m+hw,Math.min(1-m-hw,v.x)),y=Math.max(bot+m+hh,Math.min(top-m-hh,v.y));
   if(x!==v.x||y!==v.y){v.x=x;v.y=y;v.unproject(camera);b.position.copy(v);}}
  const i=typeof cams!=='undefined'&&cams?cams.indexOf(camera):-1;if(!bisiSeen39(camera,i,ax,(f.obj.position.y||0)+(f.hy!=null?f.hy:1.6),az).seen)b.scale.set(0,0,1);}catch(e){}
 b.updateMatrixWorld();}
function bisiBubbleStep39(){const W=BISI39.world,L=W.live;if(!L.length)return;
 for(let k=L.length-1;k>=0;k--){const b=L[k],f=b.userData.f39;
  if(!f||BISI39.t>=f.end||!f.obj||!f.obj.visible||!f.obj.parent){b.visible=false;if(b.parent)b.parent.remove(b);L.splice(k,1);continue;}
  b.position.set(f.obj.position.x,(f.obj.position.y||0)+f.y,f.obj.position.z);}}
function bisiBubblesOff39(){const W=BISI39.world;for(const b of W.live){b.visible=false;if(b.parent)b.parent.remove(b);}W.live.length=0;bisiChip39(true);}
// (fixer, S4) her call on the HUD (football's fb37-call pattern): while she calls, a player within 12 m whose view does not show her sees
// "Aunty Bisi: {call}" with an arrow towards her, in that player's half. Built lazily (only once there is something to show)
const CHIP39={el:[null,null],k:['',''],v:null};
// (polish) "can this player see her" is bisiSeen39, the bubble's own test with the same margin; the arrow points from the half's middle towards her
function bisiProject39(i,x,y,z){const out={inside:false,ang:0};if(typeof cams==='undefined'||!cams||!cams[i]||typeof v21Viewport!=='function')return out;const cam=cams[i];
 const s=bisiSeen39(cam,i,x,y,z),vp=v21Viewport(i);let sx=s.x,sy=s.y;if(s.behind){sx=-sx;sy=-sy;}const px=(sx+1)/2*vp.w,py=(1-sy)/2*vp.h,cx=vp.w/2,cy=((vp.top||0)+vp.h-(vp.bottom||0))/2;
 out.inside=s.seen;out.ang=Math.atan2(py-cy,px-cx);return out;}
function bisiChipEl39(i){if(CHIP39.el[i])return CHIP39.el[i];if(typeof document==='undefined'||!document||!document.getElementById)return null;const host=document.getElementById('half'+i);
 if(!host||!host.appendChild||!document.createElement)return null;const el=document.createElement('div');el.className='gist39-call';if(el.style)el.style.display='none';host.appendChild(el);CHIP39.el[i]=el;return el;}
function bisiChip39(off){const B=BISI39,W=B.world,g=W.fig;let call=null;
 if(!off&&g&&g.visible&&g.parent&&!bisiSilent39()&&!bisiOverlay39())for(const b of W.live){const f=b.userData.f39;if(!f||f.obj!==g)continue;const t=Object.keys(W.bub).find(k=>W.bub[k]===b);if(t&&B.LINES.call.some(c=>c[1]===t)){call=t;break;}}
 for(const i of [0,1]){let html='';
  if(call&&typeof players!=='undefined'&&players[i]&&players[i].g&&!bisiIsAI39(i)){const p=players[i].g.position;
   if(Math.hypot(p.x-g.position.x,p.z-g.position.z)<=B.CHIP_RANGE){const r=bisiProject39(i,g.position.x,1.6,g.position.z);
    if(!r.inside)html=`<span class="ar" style="transform:rotate(${(r.ang*180/Math.PI).toFixed(0)}deg)">➜</span><span>${esc(B.UI.callChip+' '+call)}</span>`;}}
  if(CHIP39.k[i]===html)continue;const el=html?bisiChipEl39(i):CHIP39.el[i];CHIP39.k[i]=html;if(!el)continue;
  if(!html){if(el.style)el.style.display='none';continue;}el.innerHTML=html;if(el.style)el.style.display='';}}

/* ======================================================================================================================================
   5. Hiding and teardown (spec §1.3): hidden between her evenings (out of the scene, kept), disposed on a new household, enterWorld and online
   ====================================================================================================================================== */
function bisiOwnDispose39(o){if(!o)return;o.traverse(m=>{if(m.userData&&m.userData.own39){if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose();}
 if(m.isSprite&&m.material){if(m.material.map)m.material.map.dispose();m.material.dispose();}});}
function bisiDropFig39(){const W=BISI39.world;if(W.fig){if(W.fig.parent)W.fig.parent.remove(W.fig);bisiOwnDispose39(W.tray);}W.fig=null;W.tray=null;W.lite=false;}
function bisiDropBag39(){const W=BISI39.world;if(W.bag){if(W.bag.parent)W.bag.parent.remove(W.bag);bisiOwnDispose39(W.bag);}W.bag=null;}
// hidden: her figure and her bubbles out of the scene (the figure is kept for her next evening in this household)
function bisiHide39(){const W=BISI39.world;if(W.fig){W.fig.visible=false;if(W.fig.parent)W.fig.parent.remove(W.fig);}bisiBubblesOff39();BISI39.state='off';BISI39.run.phase='off';}
BISI39.hide=bisiHide39;
// a new evening's runtime (memory only)
function bisiRunReset39(){const r=BISI39.run;r.toasts=[];r.day=0;r.phase='off';r.mode='';r.pos=null;r.path=null;r.prog=0;r.atRail=false;r.serving=null;r.goneDay=0;r.lastTime=-1;
 r.calls=0;r.callAt=0;r.arrived=false;r.lift=null;r.yaw=Math.PI;BISI39.heldDay=0;}
// everything out and disposed (a new household, enterWorld, online)
function bisiTeardown39(){const W=BISI39.world;bisiHide39();bisiDropFig39();bisiDropBag39();if(typeof shelfShotDrop39==='function')shelfShotDrop39();
 for(const k in W.bub){const b=W.bub[k];if(b.parent)b.parent.remove(b);bisiOwnDispose39(b);}W.bub={};W.live.length=0;
 if(typeof scene!=='undefined'&&scene&&scene.children){for(const o of scene.children.slice())if(o.userData&&o.userData.gist39&&['bisi','tray','bubble','bag'].includes(o.userData.gist39)){scene.remove(o);bisiOwnDispose39(o);}}
 bisiRunReset39();BISI39.run.kidsToast=false;BISI39.kidsDay=0;}

/* ======================================================================================================================================
   6. Moving her (spec §5.1): phases from the clock, movement from dt and only while no panel is open; a clock jump snaps her to her phase's place
   ====================================================================================================================================== */
function bisiLen39(P){let L=0;for(let k=1;k<P.length;k++)L+=Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]);return L;}
function bisiAt39(P,s){let left=Math.max(0,s);for(let k=1;k<P.length;k++){const a=P[k-1],b=P[k],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(left<=d||k===P.length-1){const f=d>1e-9?Math.min(1,left/d):1;
  return {x:a[0]+(b[0]-a[0])*f,z:a[1]+(b[1]-a[1])*f,dx:d>1e-9?(b[0]-a[0])/d:0,dz:d>1e-9?(b[1]-a[1])/d:0};}left-=d;}const e=P[P.length-1];return {x:e[0],z:e[1],dx:0,dz:0};}
function bisiTarget39(){const R=BISI39.ROUTE;return BISI39.run.atRail?R.rail:R.stop;}
// the walk out: from where she stands, by her stop when she is at the rail, to the gate
function bisiOutPath39(from){const R=BISI39.ROUTE,P=[[from[0],from[1]]];if(from[1]<R.stop[1]-0.3)P.push(R.stop.slice());P.push(R.exitTo.slice());return P;}
// the place her phase gives her now, from the clock and tonight's memory (a clock jump, a reload or a first sight snaps her here)
function bisiCanon39(ph,regular,held){const B=BISI39,R=B.ROUTE,H=B.HOURS,t=S.time;
 if(ph==='in'){const P=[R.enter,regular?R.stop:R.strollIn];return {mode:'in',path:P,prog:Math.min(bisiLen39(P),(t-bisiInFrom39(regular))*60*B.WALK)};}
 if(ph==='stroll')return {mode:'stroll',pos:[bisiStrollX39(t),B.STROLL.z]};
 if(ph==='stop')return {mode:'stay',pos:bisiTarget39().slice()};
 if(ph==='out'){const from=(regular||held)?bisiTarget39():[bisiStrollX39(H.strollTo),B.STROLL.z],P=bisiOutPath39(from),from0=(regular||held)?H.until:H.strollTo;
  return {mode:'out',path:P,prog:(t-from0)*60*B.WALK};}
 return null;}
function bisiPlace39(x,z,fx,fz){const g=BISI39.world.fig,r=BISI39.run;if(!g)return;g.position.set(x,0,z);r.pos=[x,z];if(fx||fz){r.yaw=Math.atan2(fx,fz);g.rotation.y=r.yaw;}}
function bisiSnap39(c){const r=BISI39.run;r.mode=c.mode;
 if(c.path){r.path=c.path;r.prog=Math.max(0,c.prog);if(c.mode==='out'&&r.prog>=bisiLen39(c.path)){r.goneDay=S.day;return false;}const p=bisiAt39(r.path,r.prog);bisiPlace39(p.x,p.z,p.dx,p.dz);}
 else{r.path=null;r.prog=0;bisiPlace39(c.pos[0],c.pos[1],0,0);if(c.mode==='stay'){r.arrived=true;bisiFace39(null);}}
 return true;}
// start walking along a path from where she stands (to the rail spot, back to her stop, out by the gate)
function bisiWalk39(mode,to){const r=BISI39.run;if(!r.pos)return;const P=mode==='out'?bisiOutPath39(r.pos):[r.pos.slice(),to.slice()];
 if(bisiLen39(P)<0.02&&mode!=='out'){r.mode='stay';r.path=null;r.arrived=true;return;}r.mode=mode;r.path=P;r.prog=0;r.arrived=false;}
// facing: towards the nearest standing player within 4 m, else the rail (north) at her stop and the rail spot
function bisiFace39(dt){const B=BISI39,g=B.world.fig;if(!g)return;let best=null,bd=4;
 for(const p of players){if(!p||!p.g)continue;const d=Math.hypot(p.g.position.x-g.position.x,p.g.position.z-g.position.z);if(d<bd){bd=d;best=p;}}
 const want=best?Math.atan2(best.g.position.x-g.position.x,best.g.position.z-g.position.z):Math.PI;
 let dy=want-g.rotation.y;while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;const k=dt==null?1:Math.min(1,dt*6);g.rotation.y+=dy*k;B.run.yaw=g.rotation.y;}
// one visible frame: move (no panel open) and animate; idle under a panel (the clock is stopped)
function bisiFrame39(dt){const B=BISI39,r=B.run,g=B.world.fig;if(!g)return;let moving=false,speed=B.WALK;
 if(!bisiOverlay39()&&!r.lift){
  if(r.mode==='stroll'){const x=bisiStrollX39(S.time),ox=g.position.x;if(Math.abs(x-ox)>1e-6){moving=true;speed=B.STROLL.speed;bisiPlace39(x,B.STROLL.z,x<ox?-1:1,0);}}
  else if(r.path&&(r.mode==='in'||r.mode==='out'||r.mode==='walk')){const L=bisiLen39(r.path);r.prog=Math.min(L,r.prog+B.WALK*dt);const p=bisiAt39(r.path,r.prog);moving=true;
   if(r.prog>=L-1e-9){const e=r.path[r.path.length-1];bisiPlace39(e[0],e[1],p.dx,p.dz);}else bisiPlace39(p.x,p.z,p.dx,p.dz);
   if(r.prog>=L-1e-9){if(r.mode==='out'){r.goneDay=S.day;bisiHide39();return;}
    if(r.mode==='walk'){r.mode='stay';r.path=null;r.arrived=true;}else if(r.mode==='in'){r.path=null;r.mode='wait';r.arrived=true;}}}}
 if(!moving&&(r.mode==='stay'||r.mode==='wait'||r.lift))bisiFace39(dt);
 try{if(typeof animAvatar==='function')animAvatar(g,B.t,moving,false,speed,dt);}catch(e){}
 bisiTrayPose39();}
// (fixer, S8) the tray: lowered to her chest while she serves (the panel open), raised back onto her head over the lift's 1.2 s, then on her
// head-pad as before. World places are turned into the tray's parent's frame each frame (the head joint on the hero rig)
const TRAY39={a:null,b:null,q:null,p:null,home:null};
function bisiTrayPose39(){const B=BISI39,W=B.world,g=W.fig,tr=W.tray,r=B.run;if(!g||!tr||!tr.parent)return;
 if(!TRAY39.home||TRAY39.home.tray!==tr)TRAY39.home={tray:tr,pos:tr.position.clone(),quat:tr.quaternion.clone()};const H=TRAY39.home;
 const serving=!!(r.serving&&bisiOverlay39()&&!r.lift),lifting=!!r.lift;
 if(!serving&&!lifting){if(tr.userData.low39){tr.position.copy(H.pos);tr.quaternion.copy(H.quat);tr.userData.low39=false;}return;}
 const a=TRAY39.a||(TRAY39.a=new THREE.Vector3()),b=TRAY39.b||(TRAY39.b=new THREE.Vector3()),q=TRAY39.q||(TRAY39.q=new THREE.Quaternion()),p=TRAY39.p||(TRAY39.p=new THREE.Quaternion());
 g.updateMatrixWorld(true);const fx=Math.sin(g.rotation.y),fz=Math.cos(g.rotation.y);a.set(g.position.x+fx*0.34,(g.position.y||0)+1.08,g.position.z+fz*0.34);
 tr.position.copy(H.pos);tr.quaternion.copy(H.quat);tr.updateMatrixWorld(true);tr.getWorldPosition(b);
 const u=lifting?Math.min(1,Math.max(0,(B.t-r.lift.t0)/B.LIFT_S)):0,e=u*u*(3-2*u);a.lerp(b,e);
 tr.parent.worldToLocal(a);tr.position.copy(a);tr.parent.getWorldQuaternion(p);q.setFromAxisAngle(THREE.Object3D.DefaultUp,g.rotation.y);tr.quaternion.copy(p.invert().multiply(q));tr.userData.low39=true;}
// her calls: every CALL_EVERY seconds while she walks in or strolls and is not held, in turn from a start by the day's hash; a regular's one call
function bisiCall39(once){const B=BISI39,r=B.run,L=B.LINES.call;const e=L[(hash38(S.day,7)+r.calls)%L.length];r.calls++;r.callAt=B.t+B.CALL_EVERY;bisiBubble39(e[1],3000);return e;}
// four times a second: is it her evening, which phase, a jump to snap, the calls; the bag and its toast
function bisiCheck39(){const B=BISI39,r=B.run;B.cost.checks++;
 if(typeof S==='undefined'||!S||!S.p||S.phase!=='play'||typeof players==='undefined'||!players.length){if(B.world.fig&&B.world.fig.parent)bisiHide39();return;}
 if(bisiOnline39()){if(B.world.fig||B.world.bag||Object.keys(B.world.bub).length)bisiTeardown39();return;}
 try{const K=typeof FOOTBALL37!=='undefined'&&FOOTBALL37?FOOTBALL37.kids:null;if(K&&K.kemi&&!K.kemi.gone)B.kidsDay=S.day;}catch(e){}
 bisiBagCheck39();
 const t=S.time,H=B.HOURS;
 if((t<bisiInFrom39(true)||t>=H.hide)&&!(B.flags.now&&B.flags.now===S.day)){if(B.world.fig&&B.world.fig.parent)bisiHide39();r.lastTime=t;return;}
 if(typeof EVENING35!=='undefined'&&EVENING35&&EVENING35.state!=='idle'||typeof GIST38!=='undefined'&&GIST38&&GIST38.visit){if(B.world.fig&&B.world.fig.parent)bisiHide39();return;}
 if(!S.life||!S.life.gist38){if(!(B.flags.now&&B.flags.now===S.day)){if(B.world.fig&&B.world.fig.parent)bisiHide39();return;}}
 if(!bisiEvening39()){if(B.world.fig&&B.world.fig.parent)bisiHide39();return;}
 if(r.day!==S.day){bisiRunReset39();r.day=S.day;}
 if(r.goneDay===S.day){if(B.world.fig&&B.world.fig.parent)bisiHide39();return;}
 const regular=bisiRegular39(),held=bisiHeld39(),ph=bisiPhase39(t,regular,held);
 if(ph==='off'){if(B.world.fig&&B.world.fig.parent)bisiHide39();return;}
 if((bisiOverlay39()||r.lift)&&r.serving)return;                // serving across the rail with the clock stopped, or the lift: she stays where she is
 bisiBuild39();const g=B.world.fig;
 const first=!g.parent||!g.visible||r.pos===null,jump=r.lastTime>=0&&Math.abs(t-r.lastTime)>B.JUMP_H;r.lastTime=t;
 const was=r.phase;r.phase=ph;B.state=ph;
 if(first||jump){const c=bisiCanon39(ph,regular,held);if(!c||!bisiSnap39(c)){bisiHide39();return;}if(first){g.visible=true;if(g.parent!==scene)scene.add(g);}
  if(ph==='stop'&&regular&&!r.calls&&first)r.calls=1;                                // seen first at her stop: no arrival call
 }
 else if(ph!==was){
  // a phase boundary in normal play
  if(ph==='stroll'){r.mode='stroll';r.path=null;}
  else if(ph==='stop'&&r.mode!=='walk'&&r.mode!=='stay'){bisiWalk39('walk',bisiTarget39());}
  else if(ph==='out'){bisiWalk39('out');}}
 else if(ph==='stroll'&&r.mode!=='stroll'&&r.mode!=='walk'&&r.mode!=='stay')r.mode='stroll';
 // the calls: while walking in or strolling and not held (a seller who is called stops calling)
 if((ph==='stroll'||ph==='in'&&!regular)&&!held&&B.t>=r.callAt)bisiCall39(false);
 else if(ph==='stop'&&regular&&!r.calls&&r.arrived)bisiCall39(true);
 bisiChip39(false);}
// the per-frame step (the EVENING35.tick wrapper below): a visible frame moves her; four times a second the check
BISI39.step=function(dt){const B=BISI39;dt=Math.max(0,+dt||0);B.t+=dt;B.cost.steps++;
 const g=B.world.fig;if(g&&g.visible&&g.parent)bisiFrame39(dt);
 if(B.world.live.length)bisiBubbleStep39();if(B.world.bag)bisiBagFrame39();
 if(B.run.lift&&B.t>=B.run.lift.until){B.run.lift=null;bisiBubble39(B.LINES.lift[1],3000);}      // (fixer, S8) her thanks once the tray is up
 if(B.t<B.checkAt)return;B.checkAt=B.t+0.25;
 bisiCheck39();
 if(B.run.serving&&!bisiOverlay39()&&!B.run.lift)bisiServed39();};

/* ======================================================================================================================================
   7. Her prompts and acts (spec §5.2): the call from the rail, buying (street side while she strolls; within 2.4 m at her stop or the rail spot)
   ====================================================================================================================================== */
function bisiHot39(i,list,d){if(!list)return null;const B=BISI39,W=B.world;
 bisiKidsHot39(i,list,d);                                         // (fixer, DOD-6) from the record, so a reload never loses the give
 const g=W.fig;if(!g||!g.visible||!g.parent||B.run.goneDay===S.day)return null;
 const p=players[i];if(!p||bisiIsAI39(i)||(p.y||0)>1||p.g.sitting||bisiOnline39())return null;
 const ph=B.run.phase==='stroll'&&bisiHeld39()?'stop':B.run.phase,px=p.g.position.x,pz=p.g.position.z,dd=d(g.position.x,g.position.z),U=B.UI;   // held since the last check: her stop's prompts
 const C=B.CALLZONE,zone=px>=C.x0&&px<=C.x1&&pz>=C.zMin&&pz<B.RAILZ&&dd<=C.range;
 if(ph==='stroll'){
  if(zone)list.push({id:'bisi39call',label:U.call,dist:B.CALLDIST});
  if(pz>B.RAILZ&&dd<B.REACH)list.push({id:'bisi39buy',label:U.buy,dist:dd-B.STREET_LEAD});}
 // (fixer, S1) at her stop (a regular, or held tonight) she is buyable from anywhere on the rail in front of the walkway: she steps to the rail spot
 else if(ph==='stop'&&(dd<B.REACH||zone))list.push({id:'bisi39buy',label:U.buy,dist:zone?Math.min(B.CALLDIST,dd-B.LEAD):(pz<B.RAILZ?dd-B.LEAD:dd)});
 return null;}
function bisiAct39(i,kind,arg){if(kind!=='bisi39call'&&kind!=='bisi39buy'&&kind!=='bisi39kids')return false;
 if(bisiOnline39()||bisiIsAI39(i))return true;
 if(kind==='bisi39call')ACTIONS.bisi39Call({i});else if(kind==='bisi39buy')bisiOpen39(i);else ACTIONS.bisi39Kids({i});
 return true;}

/* ======================================================================================================================================
   8. Buying (spec §5.3–§5.6): the panel with one primary, the taste, jara, the lift, the bag for Kemi and Emeka, the Finds tip
   ====================================================================================================================================== */
// the children are out and not in a live match (the bag is offered)
// (fixer, S3) or they went in only because everybody walked away from the pitch: they were out today and their window is still open (never on a
// home day: football37Window is closed then), so walking back with the bag brings them out again through football's own spawn
function bisiKidsOut39(){try{if(typeof FOOTBALL37==='undefined'||!FOOTBALL37||typeof football37Window!=='function'||!football37Window())return false;
 if(BISI39.MATCH.includes(FOOTBALL37.state))return false;const K=FOOTBALL37.kids;if(K&&K.kemi&&K.emeka&&!K.kemi.gone&&!K.emeka.gone)return true;
 return BISI39.kidsDay===S.day||(typeof fbPlayedToday37==='function'&&!!fbPlayedToday37());}catch(e){return false;}}
function bisiPiece39(t){const s=typeof itemShort35==='function'?itemShort35(t):'';return s||(typeof ITEMS!=='undefined'&&ITEMS[t]?ITEMS[t].name.toLowerCase():String(t));}
// tomorrow's Finds piece worth naming: Ada's armchair first, then any piece of set B or C, unowned and not ordered; nothing when tomorrow's
// "back at Finds" row would name the same piece (spec §5.6). Pure.
function bisiFindsTip39(){try{if(typeof FINDS34==='undefined'||typeof life34!=='function'||typeof owned34!=='function')return null;const l=life34();if(!l)return null;
 const dk=((S.day+1-(l.startDay|0))%3+3)%3,offer=[0,1,2,3,4].map(i=>FINDS34[dk*5+i]);
 const free=offer.filter(t=>t&&t!=='kitchen'&&!owned34(t)&&!Object.keys(l.orders||{}).some(k=>k.split(':')[1]===t));   // (fixer, C14) never "the new kitchen"
 let named=[];try{if(typeof days_slot35==='function'&&days_slot35(S.day+1)===4&&typeof morningCtx35==='function'){const c=morningCtx35(S.day+1,true);if(c&&c.returning&&c.returning.length>=2)named=c.returning.slice(0,2);}}catch(e){named=[];}
 const ok=t=>free.includes(t)&&!named.includes(t);
 if(ok('armchair'))return 'armchair';if(dk===0)return null;
 for(const t of offer)if(ok(t))return t;return null;}catch(e){return null;}}
// her greeting: the payoff of a tip you took, the recipe you know (once), a regular's, or the first time
function bisiGreeting39(b){const L=BISI39.LINES;
 const ok=b&&b.once&&b.once.finok;if(ok&&!ok.told&&ok.day<S.day)return bisiFill39(L.finok[1],{piece:bisiPiece39(ok.piece)});
 if(b&&b.once&&!b.once.nk&&typeof S!=='undefined'&&Array.isArray(S.recipes)&&S.recipes.includes('puffpuff')&&b.bisi.n>0)return L.nk[1];
 return bisiRegular39()?L.reg[1]:L.hi[1];}
// the panel: exactly one primary at any moment (puff-puff before a sale, "Help her lift the tray" after one); a bought item is disabled
// (fixer, C3 and DOD-9) after a sale or the taste, an item the purse cannot pay for shows no price and cannot be pressed: the purse never says no
// at her tray. (fixer, DOD-7) after a sale the lift and the close come first, under her line, so they are on screen on a short phone
function bisiPanelHTML39(line){const B=BISI39,U=B.UI,b=gistSave39(false),list=(b&&b.bisi.days[S.day])||[],sold=list.length>0,tasted=!!(b&&b.bisi.taste===S.day);
 const item=(v,primary)=>list.includes(v)?`<button class="btn block" disabled>${esc(U[v])} · ${esc(U.bought)}</button>`:
  ((sold||tasted)&&S.money<B.PRICE[v])?`<button class="btn block" disabled>${esc(U[v])}</button>`:btn(esc(U[v]),'bisi39Buy',{v},(primary?'primary ':'')+'block',esc(naira(B.PRICE[v])));
 const kids=bisiKidsOut39()||list.includes('kids');
 const tip=b&&b.finds&&b.finds.day===S.day&&b.finds.piece?`<p class="gist39-tip">‘${esc(bisiFill39(B.LINES.fin[1],{piece:bisiPiece39(b.finds.piece)}))}’</p>`:'';
 const head=`<p class="life-kicker">${esc(U.kicker)}</p><h2>${esc(line||bisiGreeting39(b))}</h2>`,close=btn(esc(sold||tasted?U.close:U.notTonight),'bisi39Close',{},'quiet');
 const items=`<div class="actions gist39-items">${item('puffpuff',!sold)}${item('groundnut',false)}${kids?item('kids',false):''}</div>`;
 if(sold)return `<section class="gist39-bisi gist39-sold">${head}<div class="actions gist39-lift">${btn(esc(U.lift),'bisi39Lift',{},'primary block')}${close}</div>${items}${tip}</section>`;
 return `<section class="gist39-bisi">${head}<p>${esc(U.wares)}</p>${items}${tip}<div class="actions">${close}</div></section>`;}
// open her panel for player i: a regular bought from at the rail steps to the rail spot for the sale (the clock is stopped)
function bisiOpen39(i){const B=BISI39,r=B.run,g=B.world.fig,p=players[i];if(!g||!g.visible||!p)return;
 r.buyer=i;r.serving={i,day:S.day,line:null};
 if(r.phase==='stop'&&p.g.position.z<B.RAILZ&&!r.atRail){r.atRail=true;r.mode='stay';r.path=null;bisiPlace39(B.ROUTE.rail[0],B.ROUTE.rail[1],0,-1);}
 if(r.mode==='stay'||r.mode==='wait')bisiFace39(null);
 const b=gistSave39(false),ok=b&&b.once&&b.once.finok;if(ok&&!ok.told&&ok.day<S.day){r.serving.line=bisiGreeting39(b);ok.told=S.day;}
 else if(b&&b.once&&!b.once.nk&&Array.isArray(S.recipes)&&S.recipes.includes('puffpuff')&&b.bisi.n>0){r.serving.line=B.LINES.nk[1];b.once.nk=S.day;}
 openPanel(bisiPanelHTML39(r.serving.line));}
function bisiReopen39(line){const r=BISI39.run;if(r.serving&&line)r.serving.line=line;openPanel(bisiPanelHTML39(r.serving?r.serving.line:line));}
// the panel closed (any way): she lifts the tray (with your help or by herself) and walks back to her stop from the rail spot or the street
function bisiServed39(){const B=BISI39,r=B.run;r.serving=null;bisiToastsOut39();if(!bisiHeld39()){if(r.phase==='stroll'&&r.mode!=='walk')r.mode='stroll';return;}
 if(r.phase==='stop'||r.phase==='stroll'){r.atRail=false;bisiWalk39('walk',B.ROUTE.stop);}}
// the purchase toasts held while her panel was open (DOD-7), shown as it closes (the lift's panel close, or her quiet Close)
function bisiToastsOut39(){const r=BISI39.run;if(!r.toasts||!r.toasts.length)return;const L=r.toasts;r.toasts=[];for(const m of L)bisiToast39(m);}
// the Finds tip in her panel: after the first purchase or the taste of the evening, once an evening, after v39 discovery
function bisiTip39(b){if(!b||(b.finds&&b.finds.day===S.day))return;const t=bisiFindsTip39();if(!t)return;b.finds={day:S.day,piece:t};bisiLog39('bisi','finds:'+t);}
// the empty purse: food is never refused; a taste once an evening, no credit
function bisiTaste39(){const B=BISI39,b0=gistSave39(false);if(b0&&b0.bisi.taste===S.day){bisiReopen39(null);return;}
 const b=gistSave39(true);if(!b)return;b.bisi.taste=S.day;B.heldDay=S.day;
 for(const j of both())try{cheer(j,B.TREAT.taste);}catch(e){}
 bisiLog39('bisi','taste');bisiTip39(b);bisiSave39();bisiReopen39(B.LINES.taste[1]);}
if(typeof FOUND38!=='undefined'&&typeof ACTIONS!=='undefined'){
 // the call from the rail (not a discovery: nothing saved): she stops calling and walks to the rail spot
 ACTIONS.bisi39Call=function(d){const B=BISI39,r=B.run;if(r.phase!=='stroll'||bisiHeld39()||!B.world.fig||!B.world.fig.visible)return;
  B.heldDay=S.day;r.atRail=true;bisiWalk39('walk',B.ROUTE.rail);bisiBubble39(B.LINES.come[1],2400);};
 // a purchase: ₦500, the record (v39 discovery), cheer and energy for both, the toast, the log, one save; no passTime, nothing in S.dishes
 ACTIONS.bisi39Buy=function(d){const B=BISI39,v=d&&d.v,r=B.run;if(!B.PRICE[v]||!r.serving||bisiOnline39())return;
  const b0=gistSave39(false),had=(b0&&b0.bisi.days[S.day])||[];if(had.includes(v))return;
  if(v==='kids'&&!bisiKidsOut39())return;
  if(S.money<B.PRICE[v]){if(had.length){bisiReopen39(null);return;}bisiTaste39();return;}   // (fixer, DOD-9) the taste is for an empty purse's first press
  const regular=bisiRegular39();spend(B.PRICE[v]);const b=gistSave39(true);if(!b)return;B.heldDay=S.day;
  const list=b.bisi.days[S.day]||(b.bisi.days[S.day]=[]);if(!list.length)b.bisi.n=(b.bisi.n|0)+1;list.push(v);
  let msg,said=null;
  if(v==='kids'){b.bisi.kids={day:S.day,by:r.buyer|0,given:0};bisiBagMake39();msg=B.UI.kidsBought;}
  else{for(const j of both()){try{cheer(j,B.TREAT.cheer);S.p[j].energy=clamp((S.p[j].energy||0)+B.TREAT.energy,0,100);}catch(e){}}
   // (fixer, C2) her words are her heading (the jara line for a regular); the toast is plain English
   said=v==='puffpuff'?(regular?B.LINES.jara[1]:B.LINES.pp[1]):B.LINES.gn[1];msg=v==='puffpuff'?(regular?B.UI.jaraToast:B.UI.ppToast):B.UI.gnToast;}
  bisiLog39('buy',v+'39');if(v==='puffpuff'&&regular)bisiLog39('bisi','jara');
  // (fixer, C15) after a sale her heading is her own line, and "Enjoy. Anything else?" while there is something left on the tray
  const left=['puffpuff','groundnut'].some(x=>!list.includes(x));
  // (fixer, DOD-7) the plain toast waits until her panel closes, so on a short phone it never covers her line or "Help her lift the tray"
  bisiTip39(b);r.toasts=(r.toasts||[]).concat([msg]);bisiSave39();bisiReopen39(said?(left?said+' '+B.LINES.more[1]:said):B.LINES.more[1]);};
 // "Help her lift the tray": the panel's close after a sale; the arms-up pose for the buyer and a second player within 2.4 m, her thanks
 ACTIONS.bisi39Lift=function(){const B=BISI39,r=B.run;const i=r.buyer|0;try{closePanel();}catch(e){}
  const who=[i];const p=players[i],o=players[1-i];if(p&&o&&!bisiIsAI39(o.i)&&Math.hypot(o.g.position.x-p.g.position.x,o.g.position.z-p.g.position.z)<=B.REACH)who.push(o.i);
  // (fixer, S8) she stays facing you while the tray goes up (bisiTrayPose39); her thanks when it is up, then she walks back (the step)
  r.lift={who,until:B.t+B.LIFT_S,t0:B.t};if(!r.serving)r.serving={i,day:S.day,line:null};bisiToastsOut39();
  const b=gistSave39(false);if(b&&b.bisi.lift!==S.day){b.bisi.lift=S.day;bisiLog39('bisi','lift');bisiSave39();}};
 // the quiet close: she lifts it herself; nothing is said
 ACTIONS.bisi39Close=function(){try{closePanel();}catch(e){}bisiServed39();if(gistSave39(false))bisiSave39();};
 // giving the bag to Kemi and Emeka: their two lines over them, the log (no friendship: the children are not in CAST)
 ACTIONS.bisi39Kids=function(d){const B=BISI39,b=gistSave39(false),k=b&&b.bisi.kids;if(!k||k.day!==S.day||k.given||k.gone)return;
  const K=typeof FOOTBALL37!=='undefined'&&FOOTBALL37?FOOTBALL37.kids:null;if(!K||!K.kemi||!K.emeka)return;
  k.given=S.day;bisiDropBag39();bisiBubble39(B.LINES.kidK[1],3600,K.kemi.g,1.62);bisiBubble39(B.LINES.kidE[1],3600,K.emeka.g,1.62);bisiLog39('bisi','kids');bisiSave39();};
 // Today's and the bench's wait for her (to 17:00), under v38's own conditions for its wait
 ACTIONS.bisi39Wait=function(){if(bisiWaitOK39(true)&&typeof ACTIONS.sitwait==='function'){ACTIONS.sitwait({t:BISI39.HOURS.at});BISI39.checkAt=0;}else{try{closePanel();}catch(e){}}};
 if(typeof LOCAL_ONLY!=='undefined')for(const n of ['bisi39Call','bisi39Buy','bisi39Kids','bisi39Lift','bisi39Close','bisi39Wait'])LOCAL_ONLY.add(n);}

/* ---------- the bag for Kemi and Emeka (spec §5.5) ---------- */
function bisiBagMesh39(){const g=new THREE.Group();g.name='bisi39_bag';
 const bag=new THREE.Mesh(new THREE.SphereGeometry(0.13,12,8),bisiMat39('#F4F1EA',{transparent:true,opacity:0.7}));bag.scale.set(1,1.2,0.85);g.add(bag);
 for(const [x,y,z] of [[-0.045,-0.03,0.015],[0.045,-0.045,-0.015],[0,0.045,0],[0.03,0.0,0.045],[-0.03,0.015,-0.045]]){const m=new THREE.Mesh(new THREE.SphereGeometry(0.045,8,6),bisiMat39('#C98A3A'));m.position.set(x,y,z);g.add(m);}
 const knot=new THREE.Mesh(new THREE.ConeGeometry(0.035,0.08,6),bisiMat39('#F4F1EA',{transparent:true,opacity:0.8}));knot.position.y=0.17;g.add(knot);
 g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.userData.own39=true;}});g.userData.gist39='bag';return g;}
function bisiBagMake39(){const W=BISI39.world;if(W.bag)return W.bag;if(typeof scene==='undefined'||!scene)return null;W.bag=quiet39(()=>bisiBagMesh39());scene.add(W.bag);BISI39.cost.builds++;bisiBagFrame39();return W.bag;}
// carried at the buyer's hand height (the right hand on the hero rig)
const BAGV39={v:null};
function bisiBagFrame39(){const W=BISI39.world,b=gistSave39(false),k=b&&b.bisi.kids,p=k?players[k.by|0]:null;if(!W.bag||!p)return;const g=p.g;
 if(g.hero&&g.hero.handR){const v=BAGV39.v||(BAGV39.v=new THREE.Vector3());g.updateMatrixWorld(true);g.hero.handR.getWorldPosition(v);W.bag.position.set(v.x,v.y-0.14,v.z);}
 else W.bag.position.set(g.position.x+Math.sin(g.rotation.y+1.2)*0.25,(g.position.y||0)+0.85,g.position.z+Math.cos(g.rotation.y+1.2)*0.25);
 W.bag.rotation.y=g.rotation.y;W.bag.visible=true;}
// the bag goes when the children go in (or a new day); its toast after the gist's Goodnight, or at once with no visit running
// (fixer) the bag lasts while the children's window is open (S3: they may have gone in only because everybody walked away, and come out again);
// a reload mid-evening puts it back in the buyer's hand (DOD-6); never a save during a gist (DOD-8: gistDone38's own save at Goodnight keeps it)
function bisiInGist39(){return (typeof GIST38!=='undefined'&&!!GIST38&&!!GIST38.visit)||(typeof EVENING35!=='undefined'&&!!EVENING35&&EVENING35.state!=='idle');}
function bisiBagCheck39(){const B=BISI39,r=B.run,b=gistSave39(false),k=b&&b.bisi.kids;
 if(B.world.bag&&(!k||k.day!==S.day||k.given||k.gone)){bisiDropBag39();}
 else if(k&&k.day===S.day&&!k.given&&!k.gone){
  if(!(typeof football37Window==='function'&&football37Window())){bisiDropBag39();k.gone=S.day;r.kidsToast=true;if(!bisiInGist39())bisiSave39();}
  else if(!B.world.bag&&typeof scene!=='undefined'&&scene)bisiBagMake39();}
 if(r.kidsToast&&!bisiInGist39()&&!bisiOverlay39()){r.kidsToast=false;bisiToast39(B.UI.kidsGone);}}
function bisiKidsHot39(i,list,d){const B=BISI39,b=gistSave39(false),k=b&&b.bisi.kids;if(!k||k.given||k.day!==S.day||(k.by|0)!==i)return;
 const p=players[i];if(!p||bisiIsAI39(i)||(p.y||0)>1||p.g.sitting)return;
 if(typeof FOOTBALL37==='undefined'||!FOOTBALL37||!FOOTBALL37.kids||!(FOOTBALL37.state==='idle'||FOOTBALL37.state==='ended'))return;
 let kd=1e9;for(const n of ['kemi','emeka']){const c=FOOTBALL37.kids[n];if(!c||c.gone||c.mode==='leave'||c.mode==='fadeout')continue;kd=Math.min(kd,d(c.pos[0],c.pos[1]));}
 if(kd<=B.KIDS_REACH)list.push({id:'bisi39kids',label:B.UI.give,dist:kd-B.KIDS_LEAD});}

/* ======================================================================================================================================
   9. Today's row and the waits (spec §5.7, §12.1): after v39 discovery only
   ====================================================================================================================================== */
// the wait to 17:00: after discovery, on her evening, before 17:00, at home with the evening idle and no visit (home is not needed on the bench)
function bisiWaitOK39(home){if(!gistSave39(false)||!bisiEvening39()||!(S.time<BISI39.HOURS.at)||!(S.time>=BISI39.WAIT_FROM))return false;
 if(typeof EVENING35!=='undefined'&&EVENING35&&EVENING35.state!=='idle')return false;if(typeof GIST38!=='undefined'&&GIST38&&GIST38.visit)return false;
 if(home&&!(typeof gistHome38==='function'&&gistHome38()))return false;return true;}
// Bisi's Today row {k:'bisi', html, btn} or null (engineer B places it under the card's cap, §12.1)
function bisiRow39(){try{const B=BISI39,U=B.UI,b=gistSave39(false);if(!b||bisiOnline39()||typeof S==='undefined'||!S||S.phase!=='play')return null;
 if(!S.life||!S.life.gist38||!(typeof gistDueTonight38==='function'&&gistDueTonight38()))return null;
 if(S.party&&S.party.on&&!S.party.done)return null;
 const on=bisiDay39(S.day),t=S.time;if(on&&t>=B.HOURS.hide)return null;
 // (fixer, S16) the row follows her evening: coming, been (bought from or a taste), gone on her way (out without a sale), or not passing
 const T=on?bisiTonight39():null,list=(b.bisi.days[S.day]||[]),been=!!(on&&(list.length||b.bisi.taste===S.day)),gone=!!(on&&!been&&(T&&T.phase==='out'||B.run.goneDay===S.day&&B.run.day===S.day));
 const st=!on?'off':been?'been':gone?'gone':'on',html0={on:U.rowOn,off:U.rowOff,been:U.rowBeen,gone:U.rowGone}[st],eve0={on:U.eveOn,off:U.eveOff,been:U.eveBeen,gone:U.eveGone}[st];
 const fin=b.finds&&b.finds.day===S.day-1&&b.finds.piece&&typeof owned34==='function'&&!owned34(b.finds.piece)?' '+bisiFill39(U.rowFinds,{piece:bisiPiece39(b.finds.piece)}):'';
 const w=st==='on'&&bisiWaitOK39(true)?btn(esc(U.wait),'bisi39Wait',{},'quiet'):'';
 return {k:'bisi',html:esc(html0+fin),btn:w,eve:esc(eve0+fin),state:st};}catch(e){return null;}}
if(typeof FOUND38!=='undefined'&&typeof BENCH36!=='undefined'&&BENCH36&&Array.isArray(BENCH36.restOffers))BENCH36.restOffers.push(function(){
 if(!bisiWaitOK39(false)||!bisiDay39(S.day))return null;return {label:BISI39.UI.benchWait,t:BISI39.HOURS.at,sub:BISI39.UI.benchSub};});

/* ======================================================================================================================================
   10. The walk to the rail (spec §11.1) and the lift pose: an animAvatar wrapper (outermost; the bench's precedent, bench-v36.js:950)
   ====================================================================================================================================== */
const LIFT39={tgt:null,bend:null};
// the arms-up pose for 1.2 s on the hero rig, after the mixer: both hands to a point above the head and a little forward
// (fixer, S8) both hands go forward and up to her tray as it rises (at arm's length towards it, at its height), not to the player's own head
function bisiLiftPose39(g){const r=BISI39.run.lift;if(!r||!g||!g.hero||!g.hero.bones||typeof seatIK!=='function')return;let mine=false;for(const i of r.who)if(players[i]&&players[i].g===g)mine=true;if(!mine)return;
 const B=g.hero.bones,T=LIFT39.tgt||(LIFT39.tgt=new THREE.Vector3()),bend=LIFT39.bend||(LIFT39.bend=new THREE.Vector3()),A=LIFT39.at||(LIFT39.at=new THREE.Vector3()),tr=BISI39.world.tray;g.updateMatrixWorld(true);
 const y0=g.position.y||0;let dx=Math.sin(g.rotation.y),dz=Math.cos(g.rotation.y),ty=y0+1.5;
 if(tr&&tr.parent){tr.getWorldPosition(A);const ex=A.x-g.position.x,ez=A.z-g.position.z,el=Math.hypot(ex,ez);if(el>0.05){dx=ex/el;dz=ez/el;}ty=Math.max(y0+0.95,Math.min(y0+1.85,A.y+0.05));}
 const sx=dz,sz=-dx;
 for(const s of [-1,1]){const side=s<0?'left':'right';T.set(g.position.x+dx*0.5+sx*0.15*(s<0?1:-1),ty,g.position.z+dz*0.5+sz*0.15*(s<0?1:-1));bend.set(-dx,-0.3,-dz);
  try{seatIK(B[side+'arm'],B[side+'forearm'],B[side+'hand'],T,bend);}catch(e){}}}
if(typeof FOUND38!=='undefined'&&typeof animAvatar==='function'){const prevAnim39=animAvatar;animAvatar=function(g,t,moving,carrying,speed,dt){
 // a player gliding to the rail in a gist visit walks (the walk clip at the base's speed scaling, 3.4/1.3) instead of sliding in the standing pose
 const v=typeof GIST38!=='undefined'&&GIST38?GIST38.visit:null;let r;
 if(v&&v.glide&&g){let gl=false;for(const k in v.glide){const p=players[k];if(p&&p.g===g){gl=true;break;}}
  r=gl?prevAnim39.call(this,g,t,true,false,GIST38.RAIL.SPEED,dt):prevAnim39.apply(this,arguments);}
 else r=prevAnim39.apply(this,arguments);
 if(BISI39.run.lift)bisiLiftPose39(g);return r;};}

// the path round the furniture (spec §11.1, part 2; cut item 3, built): from a start inside the flat to the door's inner step, planned once at the
// glide's start on a 0.25 m grid over blocked() at PR inside the flat (8 neighbours, no corner cutting; a start within furniture's reach steps
// out of it first by the shortest way), then pulled tight (a straight run kept
// wherever its line is free at PR every 0.1 m). Null when there is no way (v38's straight line is kept). About 350 blocked() calls once a visit.
const RAILP39={STEP:0.25,X:[-7.9,-2.7],Z:[2.0,5.8]};
function railPath39(x,z,to){if(typeof blocked!=='function'||typeof PR==='undefined')return null;const C=RAILP39,st=C.STEP,nx=Math.round((C.X[1]-C.X[0])/st)+1,nz=Math.round((C.Z[1]-C.Z[0])/st)+1,N=nx*nz;
 const cx=i=>C.X[0]+(i%nx)*st,cz=i=>C.Z[0]+Math.floor(i/nx)*st,idx=(px,pz)=>{const a=Math.round((px-C.X[0])/st),b=Math.round((pz-C.Z[0])/st);return a<0||b<0||a>=nx||b>=nz?-1:b*nx+a;};
 const s0=idx(x,z),g0=idx(to[0],to[1]);if(s0<0||g0<0)return null;
 const stuck=!!blocked(x,z,PR),free=new Int8Array(N);for(let i=0;i<N;i++)free[i]=(i===g0||(i===s0&&!stuck)||!blocked(cx(i),cz(i),PR))?1:0;   // a start inside furniture's reach steps out by the shortest way
 const clear=(a,b)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/0.1));for(let k=1;k<n;k++){const px=a[0]+(b[0]-a[0])*k/n,pz=a[1]+(b[1]-a[1])*k/n;if(blocked(px,pz,PR))return false;}return true;};
 const D=new Float64Array(N).fill(1e9),prev=new Int32Array(N).fill(-1),done=new Int8Array(N);D[s0]=0;
 for(;;){let u=-1,best=1e9;for(let i=0;i<N;i++)if(!done[i]&&D[i]<best){best=D[i];u=i;}if(u<0||u===g0)break;done[u]=1;const ux=u%nx,uz=Math.floor(u/nx);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const ax=ux+dx,az=uz+dz;if(ax<0||az<0||ax>=nx||az>=nz)continue;const v=az*nx+ax;if(done[v])continue;const out=stuck&&!free[u];if(!free[v]&&!out)continue;
   if(!out&&dx&&dz&&(!free[uz*nx+ax]||!free[az*nx+ux]||!clear([cx(u),cz(u)],[cx(v),cz(v)])))continue;const nd=D[u]+Math.hypot(dx,dz)*st;if(nd<D[v]){D[v]=nd;prev[v]=u;}}}
 if(D[g0]>=1e9)return null;const cells=[];for(let i=g0;i>=0;i=prev[i])cells.push(i);cells.reverse();
 const pts=[[x,z]].concat(cells.slice(1,-1).map(i=>[cx(i),cz(i)])).concat([[to[0],to[1]]]);
 const out=[pts[0]];let i=0;while(i<pts.length-1){let j=pts.length-1;while(j>i+1&&!clear(pts[i],pts[j]))j--;out.push(pts[j]);i=j;}
 return out.slice(1);}
// wrap: a player who starts inside the flat walks round the furniture to the door, then the door's two steps, then the very spot v38 chose
if(typeof gistGlideStart38==='function'&&typeof FOUND38!=='undefined'){const prevGlideStart39=gistGlideStart38;gistGlideStart38=function(v){const r=prevGlideStart39.apply(this,arguments);
 try{const R=typeof GIST38!=='undefined'&&GIST38?GIST38.RAIL:null;if(R&&v&&v.glide)for(const k in v.glide){const G=v.glide[k],p=players[k];if(!p||!G||G.path.length!==3||G.n!==0)continue;
   const t=G.path[2],via=railPath39(p.g.position.x,p.g.position.z,[R.DOOR[0],R.DOOR[1]]);if(!via)continue;const P=via.slice();P.push([R.DOOR[0],R.DOOR[2]],t);G.path=P;G.plan39=true;}}
 catch(e){if(typeof console!=='undefined')console.warn('bisi39 path',e);}
 return r;};}

/* ======================================================================================================================================
   11. Wrappers: the tick, the gist's start, the Finds payoff, the day, the world, a new household (spec §1.4, §1.5)
   ====================================================================================================================================== */
// Bisi and the walk run after v38's gist step (B's step, gist-v39.js, runs outside this one)
if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.tick==='function'&&typeof FOUND38!=='undefined'){
 const prevEveTick39a=EVENING35.tick;EVENING35.tick=function(dt){const r=prevEveTick39a.apply(this,arguments);
  try{BISI39.step(dt);}catch(e){if(typeof console!=='undefined')console.warn('bisi39',e);}return r;};}
if(typeof FOUND38!=='undefined'&&typeof HOTSPOT_HOOKS!=='undefined')HOTSPOT_HOOKS.push(bisiHot39);
if(typeof FOUND38!=='undefined'&&typeof ACT_HOOKS!=='undefined')ACT_HOOKS.push(function(i,kind,arg){return bisiAct39(i,kind,arg);});
// a gist visit never starts with her in the street (only ?gist=now or an odd jump can reach this): she is hidden first
if(typeof gistStart38==='function'&&typeof FOUND38!=='undefined'){const prevGistStart39=gistStart38;gistStart38=function(){try{if(BISI39.world.fig&&BISI39.world.fig.parent)bisiHide39();}catch(e){}return prevGistStart39.apply(this,arguments);};}
// the Finds tip's payoff (outermost on lifeBuy: life-v34 → bridge-v34b → tune-v35 → here): bought on the day she named, the toast says so
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.lifeBuy==='function'&&typeof FOUND38!=='undefined'){const prevLifeBuy39=ACTIONS.lifeBuy;ACTIONS.lifeBuy=function(d){
 let b=null,t=d&&d.t,key='',want=false;try{b=S&&S.life&&S.life.gist38?gistSave39(false):null;key=S.day+':'+t;want=!!(b&&b.finds&&b.finds.piece===t&&S.day===b.finds.day+1&&!(S.life.orders&&S.life.orders[key]));}catch(e){want=false;}
 if(!want)return prevLifeBuy39.apply(this,arguments);
 // (fixer, DOD-4) right after "storage.", wherever it is in the toast: tune-v35 re-toasts it with the companion's line after it
 const keep=toast,add=bisiFill39(BISI39.UI.finsPaid,{piece:bisiPiece39(t)});toast=function(m){if(typeof m==='string'&&/ is in Build storage\./.test(m)&&m.indexOf(add)<0)m=m.replace(' is in Build storage.',' is in Build storage.'+add);return keep.call(this,m);};
 let r;try{r=prevLifeBuy39.apply(this,arguments);}finally{toast=keep;}
 try{if(S.life.orders&&S.life.orders[key]&&!b.finds.paid){b.finds.paid=S.day;b.once.finok={piece:t,day:S.day,told:0};bisiSave39();}}catch(e){}
 return r;};}
// the morning: last night's evening is over (her memory, the bag)
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.nextday==='function'&&typeof FOUND38!=='undefined'){const prevNextday39a=ACTIONS.nextday;ACTIONS.nextday=function(){
 try{bisiHide39();bisiDropBag39();bisiRunReset39();BISI39.run.kidsToast=false;}catch(e){}
 const r=prevNextday39a.apply(this,arguments);try{if(BISI39.flags.now&&BISI39.flags.now<S.day)BISI39.flags.now=0;if(BISI39.flags.off>0&&BISI39.flags.off+1<S.day)BISI39.flags.off=0;}catch(e){}return r;};}
// the URL flags (?bisi=now, ?bisi=off, ?gist39=playtest): read once a page load, taken out of the address, noted for the tab (spec §15)
function bisiFlags39(){const F=BISI39.flags;if(F.parsed)return F;
 try{const q=new URLSearchParams((typeof location!=='undefined'&&location.search)||'');const a=q.get('bisi'),c=q.get('gist39');if(!a&&!c)return F;F.parsed=true;
  if(a==='now'){F.value='now';F.now=-1;}if(a==='off'){F.value='off';F.off=-1;}if(c==='playtest'){F.value=F.value||'playtest';F.playtest=true;}
  try{if(typeof sessionStorage!=='undefined'){if(a)sessionStorage.setItem('gist39.flag.'+a,'1');if(c)sessionStorage.setItem('gist39.flag.'+c,'1');}}catch(e){}
  q.delete('bisi');q.delete('gist39');try{if(typeof history!=='undefined'&&history.replaceState){const s=q.toString();history.replaceState(null,'',location.pathname+(s?'?'+s:'')+(location.hash||''));}}catch(e){}}catch(e){}
 return F;}
if(typeof FOUND38!=='undefined')bisiFlags39();
// entering the world: everything of hers comes down and is disposed; the step builds what the state calls for
if(typeof enterWorld==='function'&&typeof FOUND38!=='undefined'){const prevEnter39a=enterWorld;enterWorld=function(){try{bisiFlags39();bisiTeardown39();}catch(e){}
 const r=prevEnter39a.apply(this,arguments);try{const F=BISI39.flags;if(F.now===-1&&S&&S.p)F.now=S.day;
  if(F.off===-1&&S&&S.p){const first=bisiFirst39();if(first&&first+1<S.day){F.off=0;F.off=bisiDay39(S.day)?S.day+1:S.day+2;}}BISI39.checkAt=0;}catch(e){}return r;};}
// a new household (or the question first): nothing of the old one stays in the scene
if(typeof ACTIONS!=='undefined'&&typeof FOUND38!=='undefined'){for(const n of ['newgame','newconfirm']){const prev=ACTIONS[n];if(typeof prev!=='function')continue;
 ACTIONS[n]=function(){try{bisiTeardown39();}catch(e){}return prev.apply(this,arguments);};}}

/* ======================================================================================================================================
   12. The shelf picture (spec §11.2; cut item 2, built): "See your shelf" shows a picture of the whole shelf above its lists, so the carvings
   under the top bar on a phone can be seen. A camera 1.5 m in front of the shelf (spec: about 2.3 m; nearer, so the shelf fills the picture) at plank height renders into its own render target
   (never the shared canvas, so nothing flashes behind the panel), read back into a 2D canvas as a JPEG data URL; the previous render target is
   put back; cached until the shelf next rebuilds. Null in Node, in silentMode, online and with no renderer: the lists alone, as v38.
   ====================================================================================================================================== */
const SHOT39={W:480,H:300,cam:null,rt:null,key:'',url:null,BACK:1.5,FOV:42};
function shelfShot39(opts){try{
 if(typeof renderer==='undefined'||!renderer||typeof renderer.setRenderTarget!=='function'||typeof renderer.readRenderTargetPixels!=='function')return null;
 if(bisiSilent39()||bisiOnline39()||typeof scene==='undefined'||!scene||typeof FOUND38==='undefined')return null;
 const sh=FOUND38.world.shelf;if(!sh||sh.parent!==scene)return null;const key=FOUND38.world.shelfKey+'|'+(opts&&opts.key||'');
 if(SHOT39.url&&SHOT39.key===key)return SHOT39.url;
 const SH=FOUND38.SHELF,X=SH.x,Z=SH.z,Y=(SH.tiers[0]+SH.tiers[SH.tiers.length-1])/2+0.06;
 if(!SHOT39.cam){quiet39(()=>{SHOT39.cam=new THREE.PerspectiveCamera(SHOT39.FOV,SHOT39.W/SHOT39.H,0.05,30);SHOT39.cam.userData.gist39='shotcam';
  SHOT39.rt=new THREE.WebGLRenderTarget(SHOT39.W,SHOT39.H);SHOT39.rt.texture.userData={gist39:'shotrt'};});}
 const cam=SHOT39.cam;cam.position.set(X,Y+0.12,Z+SHOT39.BACK);cam.lookAt(X,Y,Z);cam.updateMatrixWorld(true);
 const prev=renderer.getRenderTarget(),buf=new Uint8Array(SHOT39.W*SHOT39.H*4);
 try{renderer.setRenderTarget(SHOT39.rt);renderer.render(scene,cam);renderer.readRenderTargetPixels(SHOT39.rt,0,0,SHOT39.W,SHOT39.H,buf);}finally{renderer.setRenderTarget(prev);}
 const cv=document.createElement('canvas');cv.width=SHOT39.W;cv.height=SHOT39.H;const c=cv.getContext('2d');if(!c||typeof c.createImageData!=='function')return null;
 const img=c.createImageData(SHOT39.W,SHOT39.H),row=SHOT39.W*4;for(let y=0;y<SHOT39.H;y++)img.data.set(buf.subarray((SHOT39.H-1-y)*row,(SHOT39.H-y)*row),y*row);   // the target's rows run bottom up
 c.putImageData(img,0,0);const url=typeof cv.toDataURL==='function'?cv.toDataURL('image/jpeg',0.86):'';if(!url||url.indexOf('data:image')!==0)return null;
 SHOT39.url=url;SHOT39.key=key;return url;}catch(e){if(typeof console!=='undefined')console.warn('bisi39 shot',e);return null;}}
function shelfShotDrop39(){if(SHOT39.rt){try{SHOT39.rt.dispose();}catch(e){}}SHOT39.rt=null;SHOT39.cam=null;SHOT39.url=null;SHOT39.key='';}
// wrap: the shelf panel gains the picture above its lists while the shelf is up (no picture: v38's panel unchanged)
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.gist38ShelfView==='function'&&typeof FOUND38!=='undefined'){const prevShelfView39=ACTIONS.gist38ShelfView;ACTIONS.gist38ShelfView=function(){
 const G=S&&S.life&&S.life.gist38?bisiGist39():null;const url=G&&G.shelf&&G.shelf.state==='up'?shelfShot39():null;if(!url)return prevShelfView39.apply(this,arguments);
 const keep=openPanel;let html=null;openPanel=function(h){html=h;};let r;try{r=prevShelfView39.apply(this,arguments);}finally{openPanel=keep;}
 if(typeof html==='string'){const at=html.indexOf('</h2>');if(at>=0)html=html.slice(0,at+5)+`<img class="gist39-shot" src="${url}" alt="Your shelf, with everything on it" width="${SHOT39.W}" height="${SHOT39.H}">`+html.slice(at+5);openPanel(html);}
 return r;};}

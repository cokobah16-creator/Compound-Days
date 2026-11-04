/* v40 Notices, children's things and fresh evenings: the board and the household's legs (engineer A; v40/SPEC.md §1, §5, §6 and column A of
   §18.1).
   At half past ten Mrs. Oyelaran changes the notices (owner decision 1, "One a day": "A reason to cross the courtyard every late morning, which is
   the gap this build is aimed at."). Among them is a "LOST:" card in a neighbour's own hand for a small thing only the board tells you about. Read
   it and the thing lies in its area with a soft glint over it; pick it up (it is pocket-sized and listed on Today, never drawn) and give it to its
   owner where they are for their thanks and friendship. Returns stay thanks and friendship, never cash (the owner's v39 words: "Returns stay
   thanks and friendship, never cash."). The card is crossed out in the owner's hand and comes down at the second change after. Ten things, two per
   neighbour, then an "again" cycle with each owner's "again" card and thanks, each thing in a second area. From half past twelve a notice in
   Mrs. Oyelaran's hand asks you to carry something between two neighbours (owner decision 2, "Add it"): collect it from the sender, carry it (the
   parcel is drawn in a hand), give it to the receiver by six. No money changes hands.
   Inert until a trigger (§1.3): with FOUND38, GIST38 or GIST39 absent it installs nothing. Layer 2 opens after v39 is discovered (any later day)
   or, for a household with v38 but not v39, from day 8: from 10:30 the first card is on the board in the world with a soft pulse, the board's
   panel shows it, and Mrs. Oyelaran's bubble asks a passer-by to read it; nothing is saved, logged, toasted or shown on Today. The first read of
   the board while a v40 card shows discovers v40 (G.b40 inside S.life.gist38). No TICK_HOOKS entry (the step rides EVENING35.tick by property,
   inside typeof guards), no cue subscriber, no audio recipe, no LINES35/WHEN35/DAYS35.rows/FINDS34 change, no collider, no blocked() or
   levelAt() call at run time, no Math.random call (every three.js construction runs inside quiet40), no wall clock (BOARD40.t is the sum of
   the frame steps), never the base showBubble. Online it is all off.
   Loaded after gist-v39.js and before mallam-v40.js, gist-v40.js (engineer B) and daily-v40.js (the integrator). quiet40, bubble40, gistSave40
   and layer40 are shared with them. Every change wraps an earlier global and calls it. Top-level names end in 40; wrapper bindings live inside
   blocks. */
'use strict';

/* ======================================================================================================================================
   1. The object and the copy (spec §1.6, §5.2, §6.2, §13.1). Cards are written UI in standard English; speech is a draft for the Nigerian
   reader (ids bd40-…). B's GIST40.CARDS may give any of these ids its own words; it wins where it does.
   ====================================================================================================================================== */
const BOARD40={v:1,t:0,checkAt:0,
 on:typeof FOUND38!=='undefined'&&!!FOUND38&&typeof GIST38!=='undefined'&&!!GIST38&&typeof GIST39!=='undefined'&&!!GIST39,
 UP:10.5,                                    // Mrs. Oyelaran changes the notices at half past ten
 GATE_DAY:8,                                 // layer 2 for a household with v38 but not v39
 // the upper slot moved left of the spec's (0.12, 1.90): the door's teal shutter east of the board hid its right half from the desk camera
 SLOT:{card:[-0.25,1.97,-5.255,0.40,0.20],notice:[-0.62,1.30,-5.255,0.40,0.26]},  // 2:1, like wallSign's canvas (critic finding 14)
 PULSE:{s:2.4,toWhite:[0.0,0.35],plain:0.84}, // colour lerp towards white (MeshBasicMaterial has no emissive); plain: the card's resting tint
 BUBBLE:{range:6,from:10.5,to:12.0,ms:3600,board:[0,-5.5]},
 GLINT:{far:5,near:3,period:1.2,lo:0.25,hi:0.9,size:0.7,camRef:7.4,y:0.25},GROUND:0.012,
 PICK:1.3,PICK_LEAD:0.25,GIVE:1.8,GIVE_LEAD:1.1,ERRAND_LEAD:1.08,
 READ_LEAD:0.1,                              // the board's read over talking to Mrs. Oyelaran while a v40 card is up and unread (fix round, S9)
 CROSS_CHANGES:2,                            // a crossed-out card stays through the next change and comes down at the second
 // the places a card thing may lie: each one of the twelve v38/v39 lost-thing areas, its spot list read (never written) from their tables
 AREA_OF:{glasses:'bench',chisel:'rocks',adapter:'stage',lenscap:'photo',wrapper:'street',rule:'market',seeds:'garden',pencil:'yard',tape:'stage',pin:'market',cloth:'waterW',pins:'court'},
 // say: the Today line and the first cards' sense ("lost … {area}"); look: the again cards, after "Look", "look" or "This time" (fix round, DOD-F9)
 AREAS:{stage:{src:['adapter','tape'],say:'by the square’s stage',where:'By the square’s stage',look:'by the stage in the square'},
  garden:{src:['seeds'],say:'by the square’s garden bed',where:'By the square’s garden bed',look:'by the garden bed in the square'},
  bench:{src:['glasses'],say:'on the waterfront sand by the bench',where:'On the waterfront sand by the bench',look:'on the sand by the waterfront bench'},
  market:{src:['rule','pin'],say:'on Market Road, between the stalls',where:'On Market Road, between the stalls',look:'along Market Road, between the stalls'},
  yard:{src:['pencil'],say:'in the Makers’ Yard',where:'In the Makers’ Yard',look:'round the Makers’ Yard'},
  rocks:{src:['chisel'],say:'near the rocks',where:'Near the rocks',look:'round the rocks'},
  photo:{src:['lenscap'],say:'on the waterfront, east of the photo spot',where:'On the waterfront, east of the photo spot',look:'along the waterfront, east of the photo spot'},
  // the lens cloth's spots west of x -12 (deviation: the spec's "west of x -14" leaves a single spot; see the README)
  waterW:{src:['cloth'],xMax:-12,say:'on the waterfront, towards the square',where:'On the waterfront, towards the square',look:'along the waterfront, towards the square'},
  street:{src:['wrapper'],say:'in the street, west of the gate',where:'In the street, west of the gate',look:'along the street, west of the gate'},
  court:{src:['pins'],say:'in the courtyard, by the noticeboard',where:'In the courtyard, by the noticeboard',look:'round the courtyard, by this board'}},
 // the points no card thing may lie within 2.2 m of: Mallam's spot, his seat, the fan point (the suya prompt) and the board's prompt
 AVOID:[[-1.8,12.4],[-4.2,13.0],[-3.0,11.2],[0,-5.5]],AVOID_R:2.2,NOON_R:2.2,
 NPC_R:2.2,                                  // nor within 2.2 m of a neighbour's morning or afternoon place (NPC_SPOTS, read; fix round, S10)
 ORDER:['knob','rose','spoon','pad','block','oil','film','print','pegs','minutes'],
 THINGS:{
  knob:{owner:'tunde',name:'radio knob',long:'the volume knob off his small radio',area:'stage',area2:'garden',pickLabel:'a radio knob',give:'Give Tunde his radio knob'},
  rose:{owner:'tunde',name:'sprinkler head',long:'the sprinkler head off his watering can',area:'garden',area2:'stage',pickLabel:'a sprinkler head',give:'Give Tunde his sprinkler head'},
  spoon:{owner:'nkechi',name:'wooden spoon',long:'her long wooden stirring spoon',area:'bench',area2:'market',pickLabel:'a long wooden spoon',give:'Give Mama Nkechi her spoon'},
  pad:{owner:'nkechi',name:'receipt pad',long:'her receipt pad',area:'market',area2:'bench',pickLabel:'a receipt pad',give:'Give Mama Nkechi her receipt pad'},
  block:{owner:'ada',name:'sanding block',long:'her sanding block',area:'yard',area2:'rocks',pickLabel:'a sanding block',give:'Give Ada her sanding block'},
  oil:{owner:'ada',name:'tin of wood oil',long:'a small tin of wood oil',area:'rocks',area2:'yard',pickLabel:'a small tin of wood oil',give:'Give Ada her wood oil'},
  film:{owner:'bassey',name:'film canister',long:'an old film canister',area:'photo',area2:'waterW',pickLabel:'a film canister',give:'Give Mr. Bassey his film canister'},
  print:{owner:'bassey',name:'old wedding print',long:'a wedding photograph in a brown envelope',area:'waterW',area2:'photo',pickLabel:'a brown envelope',give:'Give Mr. Bassey his photograph'},
  pegs:{owner:'oyelaran',name:'bag of clothes pegs',long:'a bag of clothes pegs',area:'street',area2:'court',pickLabel:'a bag of clothes pegs',give:'Give Mrs. Oyelaran her pegs'},
  minutes:{owner:'oyelaran',name:'minutes book',long:'the compound meeting’s minutes book',area:'court',area2:'street',pickLabel:'a minutes book',give:'Give Mrs. Oyelaran her minutes book'}},
 HAND:{tunde:'t',nkechi:'n',ada:'a',bassey:'b',oyelaran:'o'},
 INITIAL:{tunde:'— T.',nkechi:'— Mama N.',ada:'— A.',bassey:'Bassey',oyelaran:'— O.'},
 CARDS:{
  // the ten cards, in the owner's hand, past tense (cards: standard English, "Flat 3" the only digit, at most 200 characters)
  'bd40-card-knob':'LOST: the volume knob off my small radio. Black, round, very important. Somewhere by the stage. Now the radio only shouts. — T.',
  'bd40-card-rose':'LOST: the sprinkler head off my watering can. Green, full of small holes. By the garden bed in the square. My seedlings are drinking from a cup. — T.',
  'bd40-card-spoon':'LOST: my long wooden spoon. The good one. On the sand by the bench, I think. Bring it to the shop. I will know it is mine. — Mama N.',
  'bd40-card-pad':'LOST: my receipt pad, the small yellow one. On Market Road, between the stalls. My sums are all in my head now, and my head is full. Return it to the shop. — Mama N.',
  'bd40-card-block':'LOST: my sanding block. About the size of my hand. Somewhere in the Yard. See sketch. — A.',
  'bd40-card-oil':'LOST: a small tin of wood oil, lid on, I hope. Near the rocks, where I was carving. The wood is thirsty. — A.',
  'bd40-card-film':'LOST: an old film canister, black, with a grey lid. On the waterfront past my corner. If found, kindly return. With thanks, Bassey.',
  'bd40-card-print':'LOST: a wedding photograph in a brown envelope, an old one. On the waterfront, towards the square. If found, kindly return. With thanks, Bassey.',
  'bd40-card-pegs':'LOST: one bag of wooden clothes pegs, blue nylon. In the street, west of the gate. The washing is holding on by faith. Kindly return to the top flat. — O.',
  'bd40-card-minutes':'LOST: the minutes book of the compound meeting. Somebody will say this was on purpose. It was not. In the courtyard, by this board. — O.',
  // the again cycle: one card per owner, naming the thing's second area ({thing} the thing, {area} its area)
  'bd40-again-tunde':'LOST AGAIN: my {thing}. Not where it went last time, of course. Look {area}. — T.',
  'bd40-again-nkechi':'LOST AGAIN: my {thing}. I know. This time look {area}, and drop it at the shop. — Mama N.',
  'bd40-again-ada':'LOST AGAIN: my {thing}. I blame the Yard. Try looking {area}. — A.',
  'bd40-again-bassey':'LOST AGAIN: my {thing}, I regret to say. This time {area}. With thanks, Bassey.',
  'bd40-again-oyelaran':'LOST AGAIN: the {thing}. No comment. Look {area}. — O.',
  // the thanks, spoken in the give panel (ten, then one "again" thanks per owner)
  'bd40-ty-knob':'My knob! The radio has been shouting at me since yesterday. Now it can whisper again. Thank you o.',
  'bd40-ty-rose':'My sprinkler head! Gardeners call it a rose, you know. My seedlings thank you, and they do not thank anybody.',
  'bd40-ty-spoon':'My spoon! This one has stirred more stew than you have eaten. God bless you.',
  'bd40-ty-pad':'My receipt pad! Now my sums will add up again. Bless you, my dear.',
  'bd40-ty-block':'My block. I have been sanding with a stone all day, and the stone is winning. Thank you, sha.',
  'bd40-ty-oil':'My oil. The iroko was starting to look at me. Thank you.',
  'bd40-ty-film':'My canister. Empty, yes, but it has been with me since my first camera. Thank you, my friend.',
  'bd40-ty-print':'The envelope. They were married in this compound, you know. Before your time. Thank you, my friend.',
  'bd40-ty-pegs':'My pegs. Thank you. The washing can stop holding on by itself.',
  'bd40-ty-minutes':'The minutes. Thank you. Everything this compound has ever agreed is in here. It is a short book.',
  'bd40-againty-tunde':'Again! My {thing} likes you more than it likes me. Thank you o.',
  'bd40-againty-nkechi':'Again, my dear? God bless you twice.',
  'bd40-againty-ada':'Again. Next time I will nail it down.',
  'bd40-againty-bassey':'Again, my friend. A man of my age should not lose things twice. Thank you.',
  'bd40-againty-oyelaran':'Thank you. We will not mention this at the meeting.',
  // the cross-out notes, one per owner
  'bd40-cross-tunde':'Found. Thank you. — T.','bd40-cross-nkechi':'FOUND. God bless Flat 3. — Mama N.','bd40-cross-ada':'Found. Measured twice. — A.',
  'bd40-cross-bassey':'Found and returned. With thanks, Bassey.','bd40-cross-oyelaran':'Found, and returned by Flat 3. Noted. — O.',
  // Mrs. Oyelaran's bubble on a card day (world only)
  'bd40-oy-bubble':'New notices. Kindly read them.',
  // the errand: the notice in Mrs. Oyelaran's hand ({sender} {item} {receiver} {place}), the sender's line on collection, the receiver's thanks
  'bd40-er-notice':'NOTICE. {sender} has {item} for {receiver}. Kindly collect from {place} after half past twelve. — O.',
  'bd40-er-take-nkechi':'Take it carefully, my dear. And do not open it on the way.',
  'bd40-er-take-ada':'Mind it. I have only just made it right.',
  'bd40-er-take-bassey':'Carefully, my friend. That one is older than you.',
  'bd40-er-take-tunde':'Thank you o. Tell them it is from me, with respect.',
  'bd40-er-ty-plate':'Jollof from Mama Nkechi. She knows I forget lunch. Thank you for carrying it.',
  'bd40-er-ty-frame':'My frame. Ada has made it straighter than it ever was. Thank you, my friend.',
  'bd40-er-ty-tape':'Highlife from Mr. Bassey’s own box! I will copy it and give it back before he misses it.',
  'bd40-er-ty-seedlings':'Pepper seedlings from Tunde. By the rains I will have my own pepper. Thank you, my dear.',
  'bd40-er-ty-bread':'Still warm. Mama Nkechi takes care of all of us. Thank you, my friend.',
  'bd40-er-ty-box':'A box for my speaker! Ada measured it with her eyes and it fits. Thank you o.',
  'bd40-er-ty-photo':'The Yard, before me. Look at that bench. Thank you for bringing it.',
  'bd40-er-ty-lead':'My extension lead. Tunde borrowed it for one evening, a long time ago. Thank you.'},
 // the errand (owner decision 2): eight fixed pairs in a hash order; Mrs. Oyelaran is never a sender or a receiver
 ERRAND:{from:12.5,giveBy:18.0,traceDays:2,
  pairs:[{id:'plate',from:'nkechi',to:'ada',item:'a covered plate of jollof',short:'plate',place:'the shop'},
   {id:'frame',from:'ada',to:'bassey',item:'a mended picture frame',short:'frame',place:'the Makers’ Yard'},
   {id:'tape',from:'bassey',to:'tunde',item:'an old highlife cassette',short:'cassette',place:'the waterfront'},
   {id:'seedlings',from:'tunde',to:'nkechi',item:'a tray of pepper seedlings',short:'seedlings',place:'the courtyard'},
   {id:'bread',from:'nkechi',to:'bassey',item:'a warm loaf of bread',short:'bread',place:'the shop'},
   {id:'box',from:'ada',to:'tunde',item:'a small wooden box',short:'box',place:'the Makers’ Yard'},
   {id:'photo',from:'bassey',to:'ada',item:'an old photograph of the Yard',short:'photograph',place:'the waterfront'},
   {id:'lead',from:'tunde',to:'ada',item:'an extension lead',short:'extension lead',place:'the courtyard'}]},
 SELF:{nkechi:'herself',ada:'herself',bassey:'himself',tunde:'himself',oyelaran:'herself'},
 // the interface (plain English)
 UI:{kicker:'ON THE NOTICEBOARD',still:'Still lost.',close:'Close',givenBack:'Given back',
  pick:'Pick up {label}',pickToast:'{owner}’s {name}. {where}',
  take:'Take the {short} for {receiver}',giveErr:'Give {receiver} the {short}',takeToast:'The {short}, for {receiver}. Give it by six.',
  errKicker:'An errand',lapse:'{sender} took it over {self} in the end.',
  todayBefore:'The noticeboard: Mrs. Oyelaran changes the notices at half past ten.',todayNew:'New notices are up.',
  todayRead:'On the noticeboard: {owner} lost {pron} {name} {area}.',todayHand:'{owner}’s {name} is with you.',todayBack:'{owner}’s {name} is back. {sub} crossed it off {self}.',
  playtest:'Lines heard in the last fortnight: {n}.'},
 WHERE:{tunde:['He is at the garden corner until noon, then in the courtyard.','He is in the courtyard.'],
  nkechi:['She is at her shop.','She is at her shop.'],ada:['She is at the Makers’ Yard until six.','She is in the courtyard after six.'],
  bassey:['He is at the photo corner this morning.','He is on the waterfront this afternoon.','He is in the courtyard this evening.'],
  oyelaran:['She is in the courtyard this morning.','She is out until six, then in the courtyard.','She is in the courtyard.']},
 world:{upper:null,upperKey:'',lower:null,lowerKey:'',thing:null,thingKey:'',glint:null,parcel:null,traces:[],bub:{},live:[]},
 mem:{readDay:0,readKey:'',bubDay:0,lapseToast:null,morningToast:null,change:0},
 flags:{now:0,playtest:false,value:null,parsed:false},
 cost:{steps:0,checks:0,builds:0}};

/* ======================================================================================================================================
   2. Shared helpers: the quiet builder, the bubbles, the save, layer 2 (spec §1.2, §1.3, §1.7). Shared with mallam-v40.js, gist-v40.js and
   daily-v40.js.
   ====================================================================================================================================== */
// a copy of quiet39 with its own seed and generator state: three.js draws Math.random for every new object's UUID, so every v40 construction
// runs with a local generator in its place for a moment and the game's own sequence never shifts
let quietSeed40=0x4000,quietOn40=false;
function quiet40(fn){if(quietOn40)return fn();const keep=Math.random;let s=quietSeed40;quietOn40=true;
 Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
 try{return fn();}finally{quietSeed40=s;Math.random=keep;quietOn40=false;}}
function boardOnline40(){return typeof NET!=='undefined'&&!!NET&&!!NET.on;}
function boardIsAI40(i){return typeof AI!=='undefined'&&!!AI&&!!AI.on&&i===AI.i;}
function boardLog40(k,a){try{if(typeof LOG35!=='undefined'&&LOG35&&typeof LOG35.add==='function')LOG35.add(k,a);}catch(e){}}
function boardToast40(m){try{if(typeof toast==='function')toast(m);}catch(e){}}
function boardSave40(){try{if(typeof save==='function')save();}catch(e){}}
function boardSilent40(){try{return typeof silentMode==='function'&&silentMode();}catch(e){return false;}}
function boardOverlay40(){try{return typeof overlayOpen==='function'&&overlayOpen();}catch(e){return false;}}
function boardFill40(t,v){return String(t).replace(/\{(\w+)\}/g,(m,k)=>v&&v[k]!=null?v[k]:m);}
function boardUp40(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1);}
function boardName40(k){return typeof CAST!=='undefined'&&CAST[k]?CAST[k].name:k;}
function boardNpc40(k){return typeof found38Npc==='function'?found38Npc(k):null;}
function boardInGist40(){return (typeof GIST38!=='undefined'&&!!GIST38&&!!GIST38.visit)||(typeof EVENING35!=='undefined'&&!!EVENING35&&EVENING35.state!=='idle');}
// the copy for an id: B's GIST40.CARDS where it has the id, else BOARD40.CARDS
function boardText40(id){try{if(typeof GIST40!=='undefined'&&GIST40&&GIST40.CARDS&&typeof GIST40.CARDS[id]==='string')return GIST40.CARDS[id];}catch(e){}return BOARD40.CARDS[id]||'';}
function boardLive40(){return typeof S!=='undefined'&&!!S&&!!S.p&&S.phase==='play'&&typeof players!=='undefined'&&players.length>0;}
// the v38 record, read without filling it (layer 2 before discovery writes nothing)
function boardG40(){return typeof S!=='undefined'&&S&&S.life&&S.life.gist38&&typeof S.life.gist38==='object'?S.life.gist38:null;}
// layer 2 (spec §1.3): v39 discovered on an earlier day, or v38 discovered and day 8 or later; offline; ?board=now opens it for today. Pure.
function layer40(){if(!BOARD40.on||!boardLive40()||boardOnline40())return false;const G=boardG40();if(!G)return false;
 if(BOARD40.flags.now&&BOARD40.flags.now===S.day)return true;
 const b=G.b39&&typeof G.b39==='object'?G.b39:null;if(b&&S.day>(b.since|0))return true;return S.day>=BOARD40.GATE_DAY;}
// the v40 record inside S.life.gist38 (spec §21), or null; create makes it (v40 discovery) and gives null unless layer 2 is open. Fields are
// lazy and additive: a record from an earlier v40 build gains what this one reads.
function gistSave40(create){const G=boardG40();if(!G||!BOARD40.on)return null;
 if(!G.b40||typeof G.b40!=='object'){if(!create||boardOnline40()||S.phase!=='play'||!layer40())return null;
  const via=G.b39&&typeof G.b39==='object'&&S.day>(G.b39.since|0)?'b39':'b38';
  G.b40={v:1,since:S.day,via,card:null,cards:{n:0,cycle:0,lastOwner:null,done:[],ahead:[]},crossed:null,chg:{day:0,n:0},errand:null,errands:{n:0,cycle:0,lastSender:null,done:[]},
   kid:null,kids:{n:0,last:{emeka:0,kemi:0}},heard:{},said:{},mallam:null,once:{}};
  if(typeof gistSave38==='function')gistSave38();}
 const b=G.b40;if(!b.cards||typeof b.cards!=='object')b.cards={n:0,cycle:0,lastOwner:null,done:[],ahead:[]};
 for(const k of ['done','ahead'])if(!Array.isArray(b.cards[k]))b.cards[k]=[];
 if(!b.errands||typeof b.errands!=='object')b.errands={n:0,cycle:0,lastSender:null,done:[]};if(!Array.isArray(b.errands.done))b.errands.done=[];
 if(!b.chg||typeof b.chg!=='object')b.chg={day:0,n:0};if(!b.kids||typeof b.kids!=='object')b.kids={n:0,last:{emeka:0,kemi:0}};
 for(const k of ['heard','said','once'])if(!b[k]||typeof b[k]!=='object')b[k]={};
 for(const k of ['card','crossed','errand','kid','mallam'])if(b[k]===undefined)b[k]=null;
 return b;}
// a copy of bisiSprite39 (football's fbTextSprite37): one canvas sprite per text, the bubble's paper and ink; every line drawn (finisher: the
// copy's three-line cap cut the end off Mallam's kept line, which takes four)
function boardSprite40(text){const cv=document.createElement('canvas'),sc=2,g=cv.getContext('2d'),fs=34,font=`700 ${fs}px Fraunces, Georgia, serif`;g.font=font;
 const mw=t=>{const m=g.measureText&&g.measureText(t);return m&&m.width?m.width:t.length*fs*0.55;},words=String(text).split(' '),lines=[];let cur='';
 for(const w of words){const t=cur?cur+' '+w:w;if(cur&&mw(t)>440){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);
 const n=lines.length,W=Math.min(496,Math.max(...lines.slice(0,n).map(mw))+44),H=n*42+30;cv.width=512*sc;cv.height=Math.ceil(H+8)*sc;if(g.scale)g.scale(sc,sc);
 g.fillStyle='rgba(248,239,221,.96)';if(typeof roundRect==='function')roundRect(g,256-W/2,4,W,H,16);if(g.fill)g.fill();g.fillStyle='#2A1F17';g.font=font;g.textAlign='center';g.textBaseline='middle';
 for(let k=0;k<n;k++)if(g.fillText)g.fillText(lines[k],256,4+15+21+k*42);const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));sp.userData.h40=(H+8)/512;sp.name='board40_bubble';sp.renderOrder=5;return sp;}
// the quiet, module-timed bubble (bisiBubble39's pattern): one sprite per text, cached by text, built inside quiet40, timed on BOARD40.t, never in
// the base's bubbles, out of the scene when it ends or its speaker hides; a speaker has one bubble at a time; drawn inside each camera's half
// (boardClamp40); null when silent. Used by every v40 file: bubble40(text, ms, obj, y).
function bubble40(text,ms,obj,y){const B=BOARD40,W=B.world;if(!B.on||boardSilent40()||typeof scene==='undefined'||!scene||!obj||!text)return null;
 let b=W.bub[text];if(!b){b=quiet40(()=>boardSprite40(text));b.userData.gist40='bubble';b.onBeforeRender=boardClamp40;b.frustumCulled=false;W.bub[text]=b;B.cost.builds++;}
 for(let j=W.live.length-1;j>=0;j--){const o=W.live[j];if(o!==b&&o.userData.f40&&o.userData.f40.obj===obj){o.visible=false;if(o.parent)o.parent.remove(o);W.live.splice(j,1);}}
 const h=typeof innerHeight==='number'&&innerHeight>0?innerHeight:800,k=Math.min(1.8,Math.max(1,600/h)),Wd=1.7*k;b.scale.set(Wd,Wd*b.userData.h40,1);
 b.userData.f40={obj,y:(y||2.3)+Wd*b.userData.h40/2,hy:(y||2.3)-0.7,end:B.t+(ms||3600)/1000,sx:Wd,sy:Wd*b.userData.h40};
 b.position.set(obj.position.x,(obj.position.y||0)+b.userData.f40.y,obj.position.z);b.visible=true;if(b.parent!==scene)scene.add(b);
 if(!W.live.includes(b))W.live.push(b);return b;}
// MIN_PX: the smallest on-screen text height in either half, in CSS px (fix round, S8: the lower half's camera sits further back); FONT: the
// sprite's text height over its width (boardSprite40's 34 px on 512); HUD: the chips a bubble keeps clear of in its player's half, PAD px apart
// (fix round, S7: the pantry or carrying chip, #inv0 and #inv1, and the prompt pill while it shows, #pr0 and #pr1)
const CLAMP40={v:null,w:null,M:0.02,SEEN:0.1,MIN_PX:13,FONT:34/512,PAD:4,HUD:['inv','pr'],vp:null,sz:null};
// the viewport the renderer is drawing now, in CSS px from the top left ({x, y, w, h}), or null (bisiClamp39's renderer, read only)
function boardVp40(rend){try{if(!rend||typeof rend.getViewport!=='function'||typeof rend.getSize!=='function')return null;const V=rend.getViewport(CLAMP40.vp||(CLAMP40.vp=new THREE.Vector4())),Z=rend.getSize(CLAMP40.sz||(CLAMP40.sz=new THREE.Vector2()));
 if(!(V.z>0&&V.w>0&&Z.y>0))return null;return {x:V.x,y:Z.y-V.y-V.w,w:V.z,h:V.w};}catch(e){return null;}}
// the HUD chips of player i that show, in CSS px ({l, t, r, b}); none without a DOM
function boardHud40(i){const out=[];if(!(i>=0)||typeof document==='undefined'||!document||typeof document.getElementById!=='function')return out;
 for(const k of CLAMP40.HUD){const el=document.getElementById(k+i);if(!el||typeof el.getBoundingClientRect!=='function')continue;if(k==='pr'&&!(el.classList&&el.classList.contains('on')))continue;
  let r=null;try{r=el.getBoundingClientRect();}catch(e){r=null;}if(r&&r.width>0&&r.height>0)out.push({l:r.left,t:r.top,r:r.right,b:r.bottom});}return out;}
// the bubble's centre (NDC x, y; half sizes hw, hh) moved off the HUD chips: up, down, right or left, whichever is the shortest move that stays
// inside the camera's half (top, bot); unchanged when nothing overlaps or no move fits
function boardOffHud40(x,y,hw,hh,top,bot,vp,hud){const m=CLAMP40.M,P=CLAMP40.PAD;if(!vp||!hud.length)return [x,y];
 for(let pass=0;pass<3;pass++){const L=vp.x+(x-hw+1)/2*vp.w,R=vp.x+(x+hw+1)/2*vp.w,T=vp.y+(1-(y+hh))/2*vp.h,B=vp.y+(1-(y-hh))/2*vp.h;
  const o=hud.find(r=>r.l<R+P&&r.r>L-P&&r.t<B+P&&r.b>T-P);if(!o)break;
  const c=[[x,1-2*(o.t-P-vp.y)/vp.h+hh],[x,1-2*(o.b+P-vp.y)/vp.h-hh],[2*(o.r+P-vp.x)/vp.w-1+hw,y],[2*(o.l-P-vp.x)/vp.w-1-hw,y]]
   .filter(q=>q[1]+hh<=top-m+1e-9&&q[1]-hh>=bot+m-1e-9&&q[0]+hw<=1-m+1e-9&&q[0]-hw>=-1+m-1e-9);
  if(!c.length)break;c.sort((a,b)=>(Math.abs(a[0]-x)*vp.w+Math.abs(a[1]-y)*vp.h)-(Math.abs(b[0]-x)*vp.w+Math.abs(b[1]-y)*vp.h));x=c[0][0];y=c[0][1];}
 return [x,y];}
// is the point inside camera i's frame (under its top bar) and in front of it, allowing a margin (bisiSeen39's test)
function boardSeen40(camera,i,x,y,z){const v=CLAMP40.w||(CLAMP40.w=new THREE.Vector3());camera.updateMatrixWorld();v.set(x,y,z).applyMatrix4(camera.matrixWorldInverse);const behind=-v.z<=0.1;
 v.set(x,y,z).project(camera);let top=1;if(i>=0&&typeof v21Viewport==='function'){const vp=v21Viewport(i);if(vp&&vp.h>0)top=1-2*(vp.top||0)/vp.h;}
 const M=CLAMP40.SEEN;return !behind&&v.x>=-1-M&&v.x<=1+M&&v.y>=-1-M&&v.y<=top+M;}
// drawn by each camera in turn: put back over its speaker, then moved inside that camera's half at the same depth (bisiClamp39's pattern), at
// least MIN_PX of text high and clear of that player's HUD chips
function boardClamp40(rend,sc,camera){const b=this,f=b.userData&&b.userData.f40;if(!f||!f.obj||!camera||!camera.isPerspectiveCamera)return;
 const v=CLAMP40.v||(CLAMP40.v=new THREE.Vector3()),ax=f.obj.position.x,ay=(f.obj.position.y||0)+f.y,az=f.obj.position.z;b.position.set(ax,ay,az);if(f.sx)b.scale.set(f.sx,f.sy,1);
 try{camera.updateMatrixWorld();v.set(ax,ay,az).applyMatrix4(camera.matrixWorldInverse);const dz=-v.z;const i=typeof cams!=='undefined'&&cams?cams.indexOf(camera):-1;
  if(dz>0.1){let top=1,bot=-1;if(i>=0&&typeof v21Viewport==='function'){const vp=v21Viewport(i);if(vp&&vp.h>0){top=1-2*(vp.top||0)/vp.h;bot=-1+2*(vp.bottom||0)/vp.h;}}
   const m=CLAMP40.M,th=Math.tan((camera.fov||50)*Math.PI/360),vp=boardVp40(rend);let hh=(b.scale.y/2)/(dz*th),hw=(b.scale.x/2)/(dz*th*(camera.aspect||1));
   // a camera further back draws the text smaller: raised to MIN_PX on screen (fix round, S8), then fitted into the half as before
   const ph=vp?vp.h:(typeof innerHeight==='number'&&innerHeight>0?innerHeight:800),fpx=(b.scale.x*CLAMP40.FONT)/(dz*th)*(ph/2);
   if(fpx>0&&fpx<CLAMP40.MIN_PX){const g=CLAMP40.MIN_PX/fpx;b.scale.set(b.scale.x*g,b.scale.y*g,1);hw*=g;hh*=g;}
   const k=Math.min(1,(1-m)/hw,((top-bot)/2-m)/hh);if(k<1&&k>0){b.scale.set(b.scale.x*k,b.scale.y*k,1);hw*=k;hh*=k;}
   v.set(ax,ay,az).project(camera);let x=Math.max(-1+m+hw,Math.min(1-m-hw,v.x)),y=Math.max(bot+m+hh,Math.min(top-m-hh,v.y));
   // clear of the player's HUD chips and prompt pill (fix round, S7)
   [x,y]=boardOffHud40(x,y,hw,hh,top,bot,vp,boardHud40(i));
   if(x!==v.x||y!==v.y){v.x=x;v.y=y;v.unproject(camera);b.position.copy(v);}}
  if(!boardSeen40(camera,i,ax,(f.obj.position.y||0)+f.hy,az))b.scale.set(0,0,1);}catch(e){}
 b.updateMatrixWorld();}
function boardBubbleStep40(){const W=BOARD40.world,L=W.live;if(!L.length)return;
 for(let k=L.length-1;k>=0;k--){const b=L[k],f=b.userData.f40;
  if(!f||BOARD40.t>=f.end||!f.obj||!f.obj.visible||!f.obj.parent){b.visible=false;if(b.parent)b.parent.remove(b);L.splice(k,1);continue;}
  b.position.set(f.obj.position.x,(f.obj.position.y||0)+f.y,f.obj.position.z);}}
function boardBubblesOff40(obj){const W=BOARD40.world;for(let k=W.live.length-1;k>=0;k--){const b=W.live[k];if(obj&&!(b.userData.f40&&b.userData.f40.obj===obj))continue;b.visible=false;if(b.parent)b.parent.remove(b);W.live.splice(k,1);}}

/* ======================================================================================================================================
   3. Which card, which errand, where (spec §5.3, §6.2): pure functions of the day and the save. The API for B and the integrator (§1.7).
   ====================================================================================================================================== */
// the day's noon thing (v38's and v39's chain, read only): {id, src, owner, area, spot} or null. Pure.
function boardNoon40(day){const G=boardG40();if(!G||!G.lost)return null;const L=G.lost,i=L.i|0;
 if(!(L.status==='out'||L.status==='pocket')||!((L.since|0)<=day))return null;
 let e=FOUND38.LOST[i]||null;if(!e&&typeof rotEntry39==='function'){try{e=rotEntry39(i);}catch(x){e=null;}}if(!e)return null;
 const src=e.base||(typeof rotSrc39==='function'?rotSrc39(e):e.id),sp=L.status==='out'&&e.spots&&e.spots.length?e.spots[hash38(L.since|0,i)%e.spots.length]:null;
 return {id:e.id,src,owner:e.owner,area:BOARD40.AREA_OF[src]||null,spot:sp,since:L.since|0};}
// the area of a card thing in a cycle: the first area in even cycles, the second in odd ones (the again cycle, then alternating)
function cardArea40(id,cycle){const t=BOARD40.THINGS[id];return t?((cycle|0)%2===0?t.area:t.area2):null;}
// the ten in a hash order for cycle c (hash38(c,40,k)); memory only
const CARDORD40={};
function cardOrder40(c){if(CARDORD40[c])return CARDORD40[c];const O=BOARD40.ORDER;return (CARDORD40[c]=O.map((id,k)=>({id,k,h:hash38(c,40,k)})).sort((a,b)=>(a.h-b.h)||(a.k-b.k)).map(x=>x.id));}
// the record of cards so far (the save's, or a fresh one before discovery)
function cardRec40(){const b=gistSave40(false);return b?b.cards:{n:0,cycle:0,lastOwner:null,done:[],ahead:[]};}
// (repair, VN-1) the spots of the things lying out now (or out from noon today): the noon thing (v38's and v39's chain, boardNoon40) and a
// child's thing on the sand (gist-v40.js's record). The errand's parcel is never on the ground (it is carried in a hand). Pure.
function cardOut40(day){const out=[],n=boardNoon40(day);if(n&&n.spot)out.push(n.spot);
 const b=gistSave40(false),k=b&&b.kid;if(k&&k.state==='lost'&&Array.isArray(k.spot))out.push(k.spot);return out;}
// at least 2.2 m from every thing lying out
function cardFar40(s,out){return out.every(o=>Math.hypot(s[0]-o[0],s[1]-o[1])>=BOARD40.NOON_R);}
// the spots a card thing may lie on today: its area's (cardSpots40) at least 2.2 m from every thing lying out; when none is, the spots left out
// beside a neighbour's place that are; else none (the card thing never lies within 2.2 m of a thing lying out, in any pass)
function cardFarSpots40(id,cycle,out){const dr=[],all=cardSpots40(cardArea40(id,cycle),dr);const L=all.filter(s=>cardFar40(s,out));return L.length?L:dr.map(x=>x.spot).filter(s=>cardFar40(s,out));}
// the next card for a day (spec §5.3), pure: {id, cycle, ahead, pass}. Never the last card's owner; never the owner or area of the thing that
// comes out at noon today (a thing lying out since an earlier day keeps only the 2.2 m spot rule, cardSpot40); the current cycle in its order
// first, then (when nothing in it passes) the first passing item of the next cycle's order that the current cycle has already had (it is
// marked done there, the skipped items stay due); and only a thing with a spot at least 2.2 m from the noon thing's (cardSpot40). Owner decision 1 is "One a day", so the rules give way in turn when nothing passes (fix
// round, DOD-F1): pass 1 drops the noon owner (the area stays), pass 2 the last card's owner as well, and pass 3 drops the noon area too: the
// current cycle's first item still due, then the next cycle's. Every pass keeps the 2.2 m rule (repair, VN-1: the card thing never lies within
// 2.2 m of any thing lying out, cardFarSpots40); pass 4 takes an item still due in its next cycle's area (its card of this cycle skipped, booked
// done here and ahead there). Null only when no item in either of its areas has such a spot: check 3 proves this never happens (every noon
// spot with every child's spot leaves no item with both areas blocked), so "One a day" holds in every reachable state.
function cardFor40(day,rec){const C=rec||cardRec40(),T=BOARD40.THINGS,n0=boardNoon40(day),noon=n0&&n0.since===(day|0)?n0:null,c=C.cycle|0,out=cardOut40(day);
 const far=(id,cy)=>cardFarSpots40(id,cy,out).length>0;
 for(const pass of [0,1,2,3]){const ok=(id,cy)=>{const t=T[id];if(!t||(pass<2&&t.owner===C.lastOwner))return false;if(noon&&pass<3&&((pass<1&&t.owner===noon.owner)||cardArea40(id,cy)===noon.area))return false;return far(id,cy);};
  for(const id of cardOrder40(c))if(!C.done.includes(id)&&ok(id,c))return {id,cycle:c,ahead:false,pass};
  for(const id of cardOrder40(c+1))if(C.done.includes(id)&&!C.ahead.includes(id)&&ok(id,c+1))return {id,cycle:c+1,ahead:true,pass};}
 for(const id of cardOrder40(c))if(!C.done.includes(id)&&!C.ahead.includes(id)&&far(id,c+1))return {id,cycle:c+1,ahead:true,skip:true,pass:4};
 return null;}
// a card goes up: the record books it (done in its cycle, or ahead in the next; a full cycle moves on)
function cardBook40(C,pick){const t=BOARD40.THINGS[pick.id];C.n=(C.n|0)+1;C.lastOwner=t.owner;
 if(pick.skip&&!C.done.includes(pick.id))C.done.push(pick.id);                  // (repair, VN-1) pass 4: this cycle's card skipped
 if(pick.ahead){if(!C.ahead.includes(pick.id))C.ahead.push(pick.id);}else if(!C.done.includes(pick.id))C.done.push(pick.id);
 if(C.done.length>=BOARD40.ORDER.length){C.cycle=(C.cycle|0)+1;C.done=C.ahead.slice();C.ahead=[];}}
// the neighbours' morning and afternoon places (NPC_SPOTS, read): [x, z, who]
function boardNpcSpots40(){const out=[];if(typeof NPC_SPOTS==='undefined'||!NPC_SPOTS)return out;
 for(const k in NPC_SPOTS){const q=NPC_SPOTS[k];if(!q)continue;for(const sl of ['morning','afternoon']){const v=q[sl];if(Array.isArray(v)&&v.length>=2)out.push([v[0],v[1],k+' '+sl]);}}return out;}
// the spots of an area: the source things' spot lists (v38's FOUND38.LOST and v39's round table, read), less any within 2.2 m of a v40 point or
// of a neighbour's morning or afternoon place (fix round, S10); dropped (an array, optional) collects what was left out and why
function cardSpots40(area,dropped){const A=BOARD40.AREAS[area];if(!A)return [];const out=[],npc=boardNpcSpots40();
 for(const src of A.src){let e=FOUND38.LOST.find(x=>x.id===src);if(!e&&GIST39.LINES&&GIST39.LINES.round)e=GIST39.LINES.round[src];if(!e||!e.spots)continue;
  for(const s of e.spots){if(A.xMax!==undefined&&s[0]>A.xMax)continue;if(BOARD40.AVOID.some(p=>Math.hypot(p[0]-s[0],p[1]-s[1])<BOARD40.AVOID_R))continue;
   const n=npc.find(p=>Math.hypot(p[0]-s[0],p[1]-s[1])<BOARD40.NPC_R);if(n){if(Array.isArray(dropped))dropped.push({area,spot:s.slice(),near:n[2]});continue;}out.push(s.slice());}}
 return out;}
// where a card's thing lies (spec §5.3), pure: one of its area's spots by hash38(day,41), at least 2.2 m from every thing lying out now (the noon
// thing of today, a child's thing); when none of the area's spots is that far, one of the spots left out beside a neighbour's place that is;
// else null (repair, VN-1: never within 2.2 m of a thing lying out; the card stays read and its thing comes out at the first check with room)
function cardSpot40(day,id,cycle){const now=typeof S!=='undefined'&&S&&(S.day|0)>(day|0)?S.day|0:day;const L=cardFarSpots40(id,cycle,cardOut40(now));if(!L.length)return null;return L[hash38(day,41)%L.length].slice();}
// a card's thing as a view: id, owner, names, area words, the again cycle's flag
function cardThing40(id,cycle){const t=BOARD40.THINGS[id];if(!t)return null;const area=cardArea40(id,cycle);
 const A=BOARD40.AREAS[area];return {id,owner:t.owner,name:t.name,long:t.long,pickLabel:t.pickLabel,give:t.give,area,say:A.say,look:A.look||A.say,again:(cycle|0)>=1,cycle:cycle|0};}
// the card's words: the owner's card (first cycle) or the owner's "again" card naming the second area in its look form (fix round, DOD-F9)
function cardText40(id,cycle){const th=cardThing40(id,cycle);if(!th)return '';if(!th.again)return boardText40('bd40-card-'+id);
 return boardFill40(boardText40('bd40-again-'+th.owner),{thing:th.name,area:th.look,Area:boardUp40(th.look)});}
// the errands in a hash order for cycle c (hash38(c,42,k))
const ERRORD40={};
function errandOrder40(c){if(ERRORD40[c])return ERRORD40[c];const P=BOARD40.ERRAND.pairs;return (ERRORD40[c]=P.map((p,k)=>({id:p.id,k,h:hash38(c,42,k)})).sort((a,b)=>(a.h-b.h)||(a.k-b.k)).map(x=>x.id));}
function errandPair40(id){return BOARD40.ERRAND.pairs.find(p=>p.id===id)||null;}
// today's errand pick, pure: never the last errand's sender, never a receiver who owns today's card thing; the cycle in its order, then the next
function errandFor40(day,rec,cardOwner){const E=rec||{n:0,cycle:0,lastSender:null,done:[]},c=E.cycle|0;
 const ok=id=>{const p=errandPair40(id);return !!p&&p.from!==E.lastSender&&p.to!==cardOwner;};
 for(const id of errandOrder40(c))if(!E.done.includes(id)&&ok(id))return {id,cycle:c};
 for(const id of errandOrder40(c+1))if(ok(id))return {id,cycle:c+1,next:true};return null;}
function errandBook40(E,pick){const p=errandPair40(pick.id);E.n=(E.n|0)+1;E.lastSender=p.from;
 if(pick.next){E.cycle=(E.cycle|0)+1;E.done=[pick.id];}else{E.done.push(pick.id);if(E.done.length>=BOARD40.ERRAND.pairs.length){E.cycle=(E.cycle|0)+1;E.done=[];}}}
// the card that shows on the board now ({id, cycle, state, crossed, pre}) or null; pre: layer 2 before discovery (world and panel only)
function boardCardNow40(){if(!layer40())return null;const b=gistSave40(false);
 if(!b){if(!(S.time>=BOARD40.UP)&&!(BOARD40.flags.now===S.day))return null;const p=cardFor40(S.day);return p?{id:p.id,cycle:p.cycle,state:'up',pre:true}:null;}
 const c=b.card;if(!c)return null;return {id:c.id,cycle:c.cycle|0,state:c.state,pre:false};}
// the errand that shows today (after its notice went up): the pair and its state
function boardErrandNow40(){const b=gistSave40(false);if(!b||!b.errand||b.errand.day!==S.day)return null;const p=errandPair40(b.errand.id);return p?{p,e:b.errand}:null;}

/* ---------- the API (spec §1.7) ---------- */
// Today's morning board line {html} or null (after discovery only): before 10:30, after it unread, read (the card in a sentence), with you, back
function board40Today(){try{const b=gistSave40(false);if(!b||boardOnline40()||!boardLive40())return null;const U=BOARD40.UI,c=b.card;
 const th=c?cardThing40(c.id,c.cycle):null,own=th?boardName40(th.owner):'',he=!!th&&(th.owner==='tunde'||th.owner==='bassey');
 const read=()=>({html:esc(boardFill40(U.todayRead,{owner:own,pron:he?'his':'her',name:th.name,area:th.say})),state:'read'}),hand=()=>({html:esc(boardFill40(U.todayHand,{owner:own,name:th.name})),state:'hand'});
 if(c&&c.state==='back'&&c.backDay===S.day)return {html:esc(boardFill40(U.todayBack,{owner:own,name:th.name,sub:he?'He':'She',self:he?'himself':'herself'})),state:'back'};
 if(c&&c.state==='hand')return hand();if(c&&c.state==='read')return read();
 if(b.chg.day!==S.day)return {html:esc(U.todayBefore),state:'before'};
 // the change put no new card up (a card still up from an earlier day): nothing, never "New notices are up." (fix round, DOD-F1)
 if(!c||c.day!==S.day)return null;
 return {html:esc(U.todayNew),state:'new'};}catch(e){return null;}}
// what the household carries for the board (the card thing and the parcel): [{who, text}]
function board40Hand(){const b=gistSave40(false);if(!b)return [];const out=[];
 if(b.card&&b.card.state==='hand'){const th=cardThing40(b.card.id,b.card.cycle);out.push({who:th.owner,text:boardName40(th.owner)+'’s '+th.name,where:boardWhere40(th.owner),kind:'card'});}
 const er=boardErrandNow40();if(er&&er.e.state==='hand')out.push({who:er.p.to,text:boardName40(er.p.from)+'’s '+er.p.short+' for '+boardName40(er.p.to),where:boardWhere40(er.p.to),kind:'errand'});
 return out;}
// the card things given back on a day: [{id, owner}] (pure)
function board40Returned(day){const b=gistSave40(false);if(!b||!Array.isArray(b.backs))return [];return b.backs.filter(r=>r.day===day).map(r=>({id:r.id,owner:r.owner,again:!!r.again}));}
// the day's errand: {id, sender, receiver, item, state} or null (pure)
function board40Errand(day){const b=gistSave40(false);if(!b||!b.errand||b.errand.day!==day)return null;const p=errandPair40(b.errand.id);if(!p)return null;
 return {id:'errand-'+p.id,pair:p.id,sender:p.from,receiver:p.to,item:p.item,short:p.short,state:b.errand.state};}
// where an owner is now, in a sentence (Today and the pickup toast)
function boardWhere40(k){const W=BOARD40.WHERE[k];if(!W)return '';const t=typeof S!=='undefined'&&S?S.time:10;if(W.length===3)return t<12?W[0]:t<18?W[1]:W[2];return t<(k==='ada'?18:12)?W[0]:W[1];}

/* ======================================================================================================================================
   4. Meshes (spec §5.1, §5.2, §6.1): the cards' canvases, the ten things, the glint, the parcel; built only inside quiet40
   ====================================================================================================================================== */
function boardMat40(c,o){const m=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));m.userData.own40=true;return m;}
function boardMesh40(g,geo,c,x,y,z,o){const m=new THREE.Mesh(geo,boardMat40(c,o));m.position.set(x,y,z);m.castShadow=false;m.receiveShadow=false;g.add(m);return m;}
// a card's canvas at its slot's aspect (512 wide): "LOST:" and the owner's initial only; a crossed card struck through; a notice
function boardCanvas40(kind,owner,w,h){const W=512,H=Math.round(512*h/w),cv=document.createElement('canvas'),sc=2;cv.width=W*sc;cv.height=H*sc;const g=cv.getContext('2d');if(g.scale)g.scale(sc,sc);
 const paper={o:'#F4F1E6',t:'#EDE6D3',a:'#F1EDE2',n:'#FFF6C9',b:'#F3EEE0'}[BOARD40.HAND[owner]||'o'],ink={o:'#1F3F8A',t:'#1E1E1E',a:'#4A4A4A',n:'#7A2E12',b:'#1B2C5A'}[BOARD40.HAND[owner]||'o'];
 g.fillStyle=paper;g.fillRect(0,0,W,H);g.strokeStyle='rgba(42,31,23,.35)';g.lineWidth=6;g.strokeRect(3,3,W-6,H-6);
 if(BOARD40.HAND[owner]==='o'){g.strokeStyle='rgba(31,63,138,.18)';g.lineWidth=2;for(let y=46;y<H;y+=34){g.beginPath();g.moveTo(10,y);g.lineTo(W-10,y);g.stroke();}}
 g.fillStyle='#B33A2E';g.beginPath();if(g.arc)g.arc(W/2,22,10,0,Math.PI*2);g.fill&&g.fill();
 g.fillStyle=ink;g.textAlign='center';g.textBaseline='middle';
 const big=kind==='notice'?'NOTICE':'LOST:',fs=Math.round(H*0.36);g.font=`800 ${fs}px Georgia, serif`;g.fillText&&g.fillText(big,W/2,H*0.46);
 g.font=`italic 700 ${Math.round(H*0.17)}px Georgia, serif`;g.fillText&&g.fillText(BOARD40.INITIAL[owner]||'',W/2,H*0.8);
 if(kind==='crossed'){g.strokeStyle=ink;g.lineWidth=10;g.beginPath();g.moveTo(W*0.12,H*0.58);g.lineTo(W*0.88,H*0.3);g.stroke();}
 const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;return t;}
function boardCardMesh40(kind,owner,slot){const [x,y,z,w,h]=slot,tex=boardCanvas40(kind,owner,w,h),P=BOARD40.PULSE.plain;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,color:new THREE.Color(P,P,P)}));m.position.set(x,y,z);m.rotation.y=0;m.userData.gist40='card';m.name='board40_card_'+kind;return m;}
// one card thing, lying on the ground, centred on the group's origin (about 1.5 times life, as v38's)
function boardThingMesh40(id){const g=new THREE.Group();g.name='board40_'+id;const k=new THREE.Group();g.add(k);const B=(w,h,d,c,x,y,z)=>boardMesh40(k,new THREE.BoxGeometry(w,h,d),c,x,y,z),
 C=(r,h,c,x,y,z,rt,seg)=>boardMesh40(k,new THREE.CylinderGeometry(rt===undefined?r:rt,r,h,seg||12),c,x,y,z);
 if(id==='knob'){C(0.03,0.022,'#1B1B1B',0,0.011,0,undefined,16);C(0.006,0.004,'#C9C9C9',0.018,0.024,0,undefined,8);}
 else if(id==='rose'){const a=C(0.045,0.012,'#3E8C4A',0,0.006,0,0.045,14);a.rotation.z=0;C(0.012,0.05,'#3E8C4A',0,0.012,-0.05,0.018,8).rotation.x=Math.PI/2;}
 else if(id==='spoon'){const h=C(0.009,0.26,'#B08250',0,0.009,0,undefined,8);h.rotation.x=Math.PI/2;const b=boardMesh40(k,new THREE.SphereGeometry(0.035,10,6),'#B08250',0,0.012,0.15);b.scale.set(1,0.35,1.4);}
 else if(id==='pad'){B(0.07,0.018,0.1,'#E9C23A',0,0.009,0);B(0.068,0.004,0.016,'#8C6A2A',0,0.02,-0.04);}
 else if(id==='block'){B(0.11,0.035,0.07,'#C9A06A',0,0.0175,0);B(0.11,0.006,0.07,'#6B6B5E',0,0.038,0);}
 else if(id==='oil'){C(0.03,0.045,'#C8A23A',0,0.0225,0,undefined,14);C(0.031,0.008,'#8C7A3A',0,0.048,0,undefined,14);}
 else if(id==='film'){C(0.016,0.05,'#151515',0,0.016,0,undefined,12).rotation.z=Math.PI/2;C(0.018,0.01,'#8A8A8A',0.028,0.016,0,undefined,12).rotation.z=Math.PI/2;}
 else if(id==='print'){B(0.16,0.008,0.11,'#A8784A',0,0.004,0);B(0.15,0.002,0.03,'#8A6038',0,0.009,-0.035);}
 else if(id==='pegs'){B(0.12,0.04,0.08,'#3E6FB8',0,0.02,0);for(let n=0;n<3;n++)B(0.012,0.05,0.01,'#C9A06A',-0.03+n*0.03,0.05,0);}
 else{B(0.1,0.022,0.14,'#5A2E2A',0,0.011,0);B(0.094,0.018,0.136,'#EDE6D3',0.004,0.011,0);}
 k.scale.setScalar(1.5);return g;}
// the glint: a soft four-pointed star on a warm halo (v38's), its own texture
function boardStarTex40(){const W=BOARD40.world;if(W.star)return W.star;const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');
 const g=c.createRadialGradient(32,32,0,32,32,30);g.addColorStop(0,'rgba(255,252,236,1)');g.addColorStop(0.16,'rgba(255,214,110,0.95)');g.addColorStop(0.45,'rgba(240,170,40,0.45)');g.addColorStop(1,'rgba(240,170,40,0)');
 c.fillStyle=g;c.fillRect(0,0,64,64);c.fillStyle='rgba(255,236,170,0.95)';c.beginPath();c.moveTo(32,2);c.lineTo(35,29);c.lineTo(62,32);c.lineTo(35,35);c.lineTo(32,62);c.lineTo(29,35);c.lineTo(2,32);c.lineTo(29,29);c.closePath();c.fill();
 W.star=new THREE.CanvasTexture(cv);return W.star;}
function boardGlintMesh40(){const m=new THREE.SpriteMaterial({map:boardStarTex40(),color:'#FFFFFF',transparent:true,depthWrite:false,opacity:0});const s=new THREE.Sprite(m);s.name='board40_glint';s.visible=false;return s;}
// the parcel: a small cloth-wrapped bundle carried in a hand
function boardParcelMesh40(id){const g=new THREE.Group();g.name='board40_parcel_'+id;const c={plate:'#C8553D',frame:'#7A5230',tape:'#2A2A2A',seedlings:'#3E8C4A',bread:'#D9A85B',box:'#A8784A',photo:'#D9C9A0',lead:'#E8E2D0'}[id]||'#C8553D';
 boardMesh40(g,new THREE.BoxGeometry(0.2,0.1,0.15),c,0,0,0);boardMesh40(g,new THREE.BoxGeometry(0.21,0.02,0.04),'#F2C230',0,0.055,0);g.userData.gist40='parcel';return g;}

/* ======================================================================================================================================
   5. The world: build to match the state, four times a second; teardown is exact (spec §1.3, §5.1)
   ====================================================================================================================================== */
function boardDrop40(o){if(!o)return;if(o.parent)o.parent.remove(o);o.traverse(m=>{if(m.geometry)m.geometry.dispose();
 if(m.material){const ms=Array.isArray(m.material)?m.material:[m.material];for(const x of ms){if(x.map&&x.map!==BOARD40.world.star)x.map.dispose();x.dispose();}}});}
function boardDropThing40(){const W=BOARD40.world;boardDrop40(W.thing);boardDrop40(W.glint);W.thing=null;W.glint=null;W.thingKey='';}
function boardDropCards40(){const W=BOARD40.world;boardDrop40(W.upper);boardDrop40(W.lower);W.upper=null;W.lower=null;W.upperKey='';W.lowerKey='';}
function boardDropParcel40(){const W=BOARD40.world;boardDrop40(W.parcel);W.parcel=null;W.parcelKey='';}
function boardAny40(){const W=BOARD40.world;return !!(W.upper||W.lower||W.thing||W.glint||W.parcel||W.traces.length||W.live.length||Object.keys(W.bub).length);}
// everything out and disposed (a new household, enterWorld, online)
function boardTeardown40(){const W=BOARD40.world;boardDropCards40();boardDropThing40();boardDropParcel40();for(const t of W.traces)boardDrop40(t);W.traces.length=0;
 boardBubblesOff40();for(const k in W.bub){const b=W.bub[k];if(b.parent)b.parent.remove(b);boardDrop40(b);}W.bub={};
 if(typeof scene!=='undefined'&&scene&&scene.children){for(const o of scene.children.slice())if(o.userData&&o.userData.gist40&&['card','thing','glint','parcel','trace','bubble'].includes(o.userData.gist40))boardDrop40(o);}
 BOARD40.mem.lapseToast=null;}
// the two world cards: the upper slot (today's card, or a crossed card when no new one went up) and the lower slot (today's errand notice)
function boardWorldCards40(){const B=BOARD40,W=B.world,cn=boardCardNow40(),b=gistSave40(false);let up='',lo='',upOwner=null,upKind='card';
 if(cn&&cn.state!=='back'){upOwner=B.THINGS[cn.id].owner;up='card:'+cn.id+':'+cn.cycle;}
 else if(b&&b.crossed){upOwner=b.crossed.owner;upKind='crossed';up='crossed:'+b.crossed.id;}
 else if(cn&&cn.state==='back'){upOwner=B.THINGS[cn.id].owner;upKind='crossed';up='crossed:'+cn.id;}
 const er=boardErrandNow40();if(er&&S.time>=B.UP)lo='notice:'+er.p.id;
 if(up!==W.upperKey||(W.upper&&W.upper.parent!==scene)){boardDrop40(W.upper);W.upper=null;W.upperKey=up;if(up){W.upper=quiet40(()=>boardCardMesh40(upKind,upOwner,B.SLOT.card));scene.add(W.upper);B.cost.builds++;}}
 if(lo!==W.lowerKey||(W.lower&&W.lower.parent!==scene)){boardDrop40(W.lower);W.lower=null;W.lowerKey=lo;if(lo){W.lower=quiet40(()=>boardCardMesh40('notice','oyelaran',B.SLOT.notice));scene.add(W.lower);B.cost.builds++;}}}
// the card's pulse (colour towards white and back over 2.4 s) while it is unread today; plain otherwise
// (repair, H4) the key of the card on the board now (its id and the day it went up; before discovery today's), and whether it is unread: a read
// is recorded against the card it showed, so a morning read of yesterday's card leaves today's new card unread
function boardReadKey40(cn){if(!cn)return '';const b=gistSave40(false);return cn.pre||!b||!b.card?'pre:'+S.day+':'+cn.id:cn.id+':'+(b.card.day|0);}
function boardUnread40(cn){return !!(cn&&cn.state==='up'&&BOARD40.mem.readKey!==boardReadKey40(cn));}
function boardPulse40(){const B=BOARD40,W=B.world,m=W.upper&&W.upper.material;if(!m||!m.color)return;const cn=boardCardNow40(),P=B.PULSE;
 const on=!!(boardUnread40(cn)&&!boardOverlay40());const u=on?P.toWhite[0]+(P.toWhite[1]-P.toWhite[0])*(0.5-0.5*Math.cos(B.t*2*Math.PI/P.s)):0;
 const v=P.plain+(1-P.plain)*u;if(m.color.r!==v)m.color.setRGB(v,v,v);}
// the card's thing on the ground (after the card is read), with its glint
function boardWorldThing40(){const B=BOARD40,W=B.world,b=gistSave40(false),c=b&&b.card;const key=c&&c.state==='read'&&c.spot?c.id+':'+c.day+':'+c.spot.join(','):'';
 if(key===W.thingKey&&(!W.thing||W.thing.parent===scene))return;boardDropThing40();if(!key)return;
 const sp=c.spot,g=quiet40(()=>boardThingMesh40(c.id));g.position.set(sp[0],(sp[2]===undefined?B.GROUND:sp[2])+0.002,sp[1]);g.rotation.y=(hash38(c.day,43)%628)/100;g.userData.gist40='thing';scene.add(g);W.thing=g;
 const gl=quiet40(()=>boardGlintMesh40());gl.position.set(sp[0],(sp[2]===undefined?B.GROUND:sp[2])+B.GLINT.y,sp[1]);gl.userData.gist40='glint';scene.add(gl);W.glint=gl;W.thingKey=key;B.cost.builds++;boardGlintFrame40();}
// the glint every frame: shown within 5 m of a human, full strength within 3 m, pulsing; its size follows the camera distance (v38's)
function boardGlintFrame40(){const B=BOARD40,W=B.world,g=W.glint;if(!g)return;const G=B.GLINT;let d=1e9;
 for(const p of players){if(boardIsAI40(p.i)||(p.y||0)>1)continue;const q=Math.hypot(p.g.position.x-g.position.x,p.g.position.z-g.position.z);if(q<d)d=q;}
 if(!(d<G.far)){if(g.visible){g.visible=false;g.material.opacity=0;}return;}
 const pulse=G.lo+(G.hi-G.lo)*(0.5+0.5*Math.sin(B.t*2*Math.PI/G.period)),k=d<=G.near?1:0.7+0.3*(G.far-d)/(G.far-G.near);g.material.opacity=pulse*k;g.visible=true;
 const cam=typeof v21Dist!=='undefined'&&v21Dist?Math.max(1,v21Dist[0]/G.camRef):1;const s=G.size*cam;g.scale.set(s,s,1);}
// the parcel in a hand (the left: v39's bag is drawn in the right hand, seller-v39.js bisiBagFrame39)
const PARV40={v:null};
function boardWorldParcel40(){const W=BOARD40.world,er=boardErrandNow40(),key=er&&er.e.state==='hand'&&S.time<BOARD40.ERRAND.giveBy?er.p.id+':'+(er.e.by|0):'';
 if(key!==W.parcelKey){boardDropParcel40();W.parcelKey=key;if(key){W.parcel=quiet40(()=>boardParcelMesh40(er.p.id));scene.add(W.parcel);BOARD40.cost.builds++;}}
 if(W.parcel)boardParcelFrame40();}
function boardParcelFrame40(){const W=BOARD40.world,er=boardErrandNow40(),p=er?players[er.e.by|0]:null;if(!W.parcel||!p)return;const g=p.g;
 if(g.hero&&g.hero.handL){const v=PARV40.v||(PARV40.v=new THREE.Vector3());g.updateMatrixWorld(true);g.hero.handL.getWorldPosition(v);W.parcel.position.set(v.x,v.y-0.1,v.z);}
 else W.parcel.position.set(g.position.x+Math.sin(g.rotation.y-1.2)*0.25,(g.position.y||0)+0.85,g.position.z+Math.cos(g.rotation.y-1.2)*0.25);
 W.parcel.rotation.y=g.rotation.y;W.parcel.visible=true;}
// the world to match the state now
function boardSync40(){if(!layer40()){boardDropCards40();boardDropThing40();boardDropParcel40();return;}
 boardWorldCards40();boardWorldThing40();boardWorldParcel40();}

/* ======================================================================================================================================
   6. The day (spec §5.1, §6.1): the 10:30 change (a new card once the last is back; the crossed card down at the second change after; today's
   errand notice), the errand's 18:00 lapse; after v40 discovery only
   ====================================================================================================================================== */
function boardChange40(b){const B=BOARD40;if(b.chg.day===S.day)return false;b.chg.day=S.day;b.chg.n=(b.chg.n|0)+1;
 if(b.crossed&&b.chg.n-(b.crossed.n|0)>=B.CROSS_CHANGES)b.crossed=null;
 const c=b.card;let owner=null;
 if(!c||c.state==='back'){const pick=cardFor40(S.day,b.cards);if(pick){cardBook40(b.cards,pick);b.card={day:S.day,id:pick.id,cycle:pick.cycle,state:'up',spot:null};owner=B.THINGS[pick.id].owner;}
  else if(c&&c.state==='back'){}}
 else owner=B.THINGS[c.id].owner;
 // the errand (owner decision 2): one a day, never on the v35 evening's day, never online
 b.errand=null;const ev=S.life&&S.life.evening35;
 if(ev&&(ev.doneDay|0)<S.day){const pe=errandFor40(S.day,b.errands,owner);if(pe){errandBook40(b.errands,pe);b.errand={day:S.day,id:pe.id,state:'up',seen:0};}}
 return true;}
// four times a second: layer 2, the change, the lapse, the bubble, the world
function boardCheck40(){const B=BOARD40;B.cost.checks++;
 if(!boardLive40())return;if(boardOnline40()){if(boardAny40())boardTeardown40();return;}
 if(!layer40()){if(boardAny40())boardSync40();return;}
 const b=gistSave40(false);
 if(b&&!boardOverlay40()){let ch=false;
  if(S.time>=B.UP||B.flags.now===S.day)ch=boardChange40(b)||ch;
  // (repair, VN-1) a card read while every spot of its area lay within 2.2 m of a thing lying out: its thing comes out once one is clear
  const rc=b.card;if(rc&&rc.state==='read'&&!rc.spot){const sp=cardSpot40(rc.day,rc.id,rc.cycle);if(sp){rc.spot=sp;ch=true;}}
  // the errand's lapse at 18:00 (not given by then: the parcel goes; a toast after the gist when it had been collected)
  const e=b.errand;if(e&&e.day===S.day&&(e.state==='up'||e.state==='hand')&&S.time>=B.ERRAND.giveBy){if(e.state==='hand')B.mem.lapseToast={id:e.id,day:S.day};e.state='lapsed';ch=true;}
  if(ch&&!boardInGist40())boardSave40();}
 // the lapse toast after the gist (or at once with no gist due tonight)
 const lt=B.mem.lapseToast;if(lt&&!boardInGist40()&&!boardOverlay40()){if(lt.day!==S.day)B.mem.lapseToast=null;
  else if(!(typeof gistDueTonight38==='function'&&gistDueTonight38())||S.time>=22){const p=errandPair40(lt.id);B.mem.lapseToast=null;if(p)boardToast40(boardFill40(B.UI.lapse,{sender:boardName40(p.from),self:B.SELF[p.from]}));}}
 // (repair, H7) an errand that lapsed when the day ended (Sleep before six): its toast the next morning
 const mt=B.mem.morningToast;if(mt&&!boardInGist40()&&!boardOverlay40()){B.mem.morningToast=null;if(mt.day===S.day){const p=errandPair40(mt.id);if(p)boardToast40(boardFill40(B.UI.lapse,{sender:boardName40(p.from),self:B.SELF[p.from]}));}}
 // Mrs. Oyelaran's bubble: once a morning on a card day, while the card is unread, to a player within 6 m of the board 10:30 to 12:00
 const cn=boardCardNow40();if(cn&&cn.state==='up'&&B.mem.bubDay!==S.day&&S.time>=B.BUBBLE.from&&S.time<B.BUBBLE.to&&!boardOverlay40()){const n=boardNpc40('oyelaran');
  if(n){for(const p of players){if(!p||!p.g||boardIsAI40(p.i))continue;if(Math.hypot(p.g.position.x-B.BUBBLE.board[0],p.g.position.z-B.BUBBLE.board[1])<B.BUBBLE.range){B.mem.bubDay=S.day;bubble40(boardText40('bd40-oy-bubble'),B.BUBBLE.ms,n.g,2.1);break;}}}}
 boardSync40();}
// the per-frame step (the EVENING35.tick wrapper below): between checks only the pulse, the glint, the parcel and the bubbles move
BOARD40.step=function(dt){const B=BOARD40;dt=Math.max(0,+dt||0);B.t+=dt;B.cost.steps++;const W=B.world;
 if(W.upper)boardPulse40();if(W.glint)boardGlintFrame40();if(W.parcel)boardParcelFrame40();if(W.live.length)boardBubbleStep40();
 if(B.t<B.checkAt)return;B.checkAt=B.t+0.25;boardCheck40();};

/* ======================================================================================================================================
   7. The board's panel (spec §5.1): the openBoard wrapper; v40's blocks after the heading, newest first; discovery on the first read
   ====================================================================================================================================== */
// a card's text as HTML: in Mrs. Oyelaran's hand only her first word ("NOTICE.", "LOST:", "LOST AGAIN:") is underlined (fix round, C16)
function boardInk40(hand,t){const h=esc(t);if(hand!=='o')return h;const m=/^(LOST AGAIN:|LOST:|NOTICE\.)([\s\S]*)$/.exec(h);return m?`<span class="gist40-u">${m[1]}</span>${m[2]}`:h;}
function boardCardHTML40(id,cycle,opts){const th=cardThing40(id,cycle),hand=BOARD40.HAND[th.owner];opts=opts||{};
 const raw=cardText40(id,cycle),text=boardInk40(hand,raw),sk=/See sketch/.test(raw)?' gist40-sketch':'';    // Ada's sketch mark only where her card says so
 if(opts.crossed)return `<div class="gist40-card gist40-hand-${hand} gist40-crossed"><p><s>${text}</s></p><p class="gist40-note">${esc(boardText40('bd40-cross-'+th.owner))}</p></div>`;
 return `<div class="gist40-card gist40-hand-${hand}${sk}"><p>${text}</p>${opts.still?`<p class="gist40-still">${esc(BOARD40.UI.still)}</p>`:''}</div>`;}
function boardNoticeHTML40(p){const t=boardFill40(boardText40('bd40-er-notice'),{sender:boardName40(p.from),item:p.item,receiver:boardName40(p.to),place:p.place});
 return `<div class="gist40-card gist40-hand-o gist40-notice"><p>${boardInk40('o',t)}</p></div>`;}
// the v40 blocks now: today's card (or the card still up), the errand's notice, a crossed card; at most four; '' when there is nothing. A Back
// button after them shows only on a short screen (a phone on its side), so the newest card and Back are in the first screen (gist-v40.css)
function boardHTML40(){if(!layer40())return '';const b=gistSave40(false),cn=boardCardNow40(),out=[];
 if(cn&&cn.state!=='back')out.push(boardCardHTML40(cn.id,cn.cycle,{still:!cn.pre&&b&&b.card&&b.card.day<S.day}));
 const er=boardErrandNow40();if(er&&S.time>=BOARD40.UP)out.push(boardNoticeHTML40(er.p));
 if(b&&b.crossed)out.push(boardCardHTML40(b.crossed.id,b.crossed.cycle|0,{crossed:true}));
 else if(cn&&cn.state==='back')out.push(boardCardHTML40(cn.id,cn.cycle,{crossed:true}));
 if(!out.length)return '';const foot=b&&BOARD40.flags.playtest?`<p class="gist40-foot">${esc(boardFill40(BOARD40.UI.playtest,{n:Object.keys(b.heard||{}).length}))}</p>`:'';
 return `<div class="gist40-board">${out.slice(0,4).join('')}<div class="actions gist40-back">${btn('Back','close',{},'quiet')}</div></div>${foot}`;}
// a read of the board: discovery (the first read with a v40 card showing, from 10:30), the card read (its thing out), the errand seen
function boardRead40(){const B=BOARD40,cn=boardCardNow40();if(!cn)return false;let b=gistSave40(false),changed=false;
 if(!b){if(!cn.pre)return false;b=gistSave40(true);if(!b)return false;const pick=cardFor40(S.day,b.cards);if(!pick)return false;cardBook40(b.cards,pick);
  b.card={day:S.day,id:pick.id,cycle:pick.cycle,state:'up',spot:null};b.chg={day:S.day,n:1};
  const ev=S.life&&S.life.evening35;if(ev&&(ev.doneDay|0)<S.day){const pe=errandFor40(S.day,b.errands,B.THINGS[pick.id].owner);if(pe){errandBook40(b.errands,pe);b.errand={day:S.day,id:pe.id,state:'up',seen:0};}}
  boardLog40('board','read '+pick.id);changed=true;}
 const c=b.card;if(c&&c.state==='up'){c.state='read';c.readDay=S.day;c.spot=cardSpot40(c.day,c.id,c.cycle);if(!changed)boardLog40('board','read '+c.id);changed=true;}
 const e=b.errand;if(e&&e.day===S.day&&!e.seen){e.seen=S.day;changed=true;}
 B.mem.readDay=S.day;B.mem.readKey=boardReadKey40(boardCardNow40()||cn);if(changed){boardSave40();boardSync40();}return changed;}
if(BOARD40.on&&typeof openBoard==='function'){const prevOpenBoard40=openBoard;openBoard=function(){
 // before v40's cards exist, online, or with nothing to show: the board as it was
 let html40='';try{html40=!boardOnline40()&&layer40()?boardHTML40():'';}catch(e){html40='';}
 if(!html40)return prevOpenBoard40.apply(this,arguments);
 try{boardRead40();html40=boardHTML40()||html40;}catch(e){if(typeof console!=='undefined')console.warn('board40',e);}
 const keep=openPanel;let caught=null,r;openPanel=function(h){caught=h;};try{r=prevOpenBoard40.apply(this,arguments);}finally{openPanel=keep;}
 if(typeof caught==='string'){const at=caught.indexOf('</h2>');caught=at>=0?caught.slice(0,at+5)+html40+caught.slice(at+5):html40+caught;openPanel(caught);}
 return r;};}

/* ======================================================================================================================================
   8. The prompts and acts (spec §4, §5.4, §6.1): pick a card thing, give it; take the parcel, give it. Nothing for the AI player.
   ====================================================================================================================================== */
// the board's read while a v40 card is up and unread (after v40 discovery, within the board's own reach): a small lead over talking to Mrs.
// Oyelaran, who stands beside the board in the mornings (fix round, S9); the base's own 'board' act opens it
function boardReadHot40(i,list,d){if(!list||!BOARD40.on||boardOnline40())return null;const p=typeof players!=='undefined'?players[i]:null;if(!p||boardIsAI40(i)||(p.y||0)>1||p.g.sitting)return null;
 const b=gistSave40(false);if(!b||!b.card||!layer40()||!boardUnread40(boardCardNow40()))return null;const dd=d(BOARD40.BUBBLE.board[0],BOARD40.BUBBLE.board[1]);if(!(dd<1.8))return null;
 const n=typeof npcs!=='undefined'&&npcs?npcs.oyelaran:null;if(!n||!n.g||!n.g.visible)return null;const dn=d(n.g.position.x,n.g.position.z);if(!(dn<1.8))return null;
 list.push({id:'board',label:'Read the noticeboard',dist:Math.min(dd,dn-0.4)-BOARD40.READ_LEAD});return null;}
function boardHot40(i,list,d){if(!list||!BOARD40.on)return null;boardReadHot40(i,list,d);const p=typeof players!=='undefined'?players[i]:null;if(!p||boardIsAI40(i)||(p.y||0)>1||p.g.sitting)return null;
 const b=gistSave40(false);if(!b||boardOnline40())return null;const B=BOARD40,W=B.world,U=B.UI;
 if(W.thing&&b.card&&b.card.state==='read'){const dd=d(W.thing.position.x,W.thing.position.z);if(dd<B.PICK){const th=cardThing40(b.card.id,b.card.cycle);list.push({id:'card40pick',label:boardFill40(U.pick,{label:th.pickLabel}),dist:dd-B.PICK_LEAD});}}
 if(b.card&&b.card.state==='hand'){const th=cardThing40(b.card.id,b.card.cycle),n=boardNpc40(th.owner);if(n){const dd=d(n.g.position.x,n.g.position.z);if(dd<B.GIVE)list.push({id:'card40give',label:th.give,dist:dd-B.GIVE_LEAD});}}
 const er=boardErrandNow40();if(er&&S.time<B.ERRAND.giveBy){const P=er.p,E=er.e;
  if(E.state==='up'&&S.time>=B.ERRAND.from){const n=boardNpc40(P.from);if(n){const dd=d(n.g.position.x,n.g.position.z);if(dd<B.GIVE)list.push({id:'errand40take',label:boardFill40(U.take,{short:P.short,receiver:boardName40(P.to)}),dist:dd-B.ERRAND_LEAD});}}
  if(E.state==='hand'){const n=boardNpc40(P.to);if(n){const dd=d(n.g.position.x,n.g.position.z);if(dd<B.GIVE)list.push({id:'errand40give',label:boardFill40(U.giveErr,{short:P.short,receiver:boardName40(P.to)}),dist:dd-B.ERRAND_LEAD});}}}
 return null;}
// a card thing picked up: into the hand record (not drawn), the toast names its owner and where they are, the chime, the log, one save
function boardPick40(i){const B=BOARD40,b=gistSave40(false),c=b&&b.card;if(!c||c.state!=='read'||!B.world.thing)return;const th=cardThing40(c.id,c.cycle);
 c.state='hand';c.by=i;boardDropThing40();boardToast40(boardFill40(B.UI.pickToast,{owner:boardName40(th.owner),name:th.name,where:boardWhere40(th.owner)}));
 try{if(typeof playPick==='function'&&players[i])playPick(players[i].g);}catch(e){}
 try{if(typeof chime40==='function')chime40('card');}catch(e){}
 boardLog40('board','pick '+c.id);boardSave40();}
// given back at the owner's live place: thanks and friendship (no money, no keepsake), the card crossed out at once, the log, one save
function boardGive40(i){const B=BOARD40,b=gistSave40(false),c=b&&b.card;if(!c||c.state!=='hand')return;const th=cardThing40(c.id,c.cycle);if(!boardNpc40(th.owner))return;
 c.state='back';c.backDay=S.day;b.crossed={id:c.id,cycle:c.cycle|0,owner:th.owner,day:S.day,n:b.chg.n|0};
 if(!Array.isArray(b.backs))b.backs=[];b.backs.push({id:c.id,owner:th.owner,day:S.day,again:th.again});if(b.backs.length>40)b.backs.splice(0,b.backs.length-40);
 try{aff(th.owner,1);}catch(e){}boardLog40('board','back '+c.id);boardSave40();boardSync40();
 const ty=th.again?boardFill40(boardText40('bd40-againty-'+th.owner),{thing:th.name}):boardText40('bd40-ty-'+c.id);
 openPanel(`<section class="gist40-panel gist40-return"><p class="gist40-kicker">${esc(B.UI.givenBack)}</p><h2>${esc(boardName40(th.owner))}</h2><div class="gist40-thanks">${say(th.owner,esc(ty))}</div><div class="actions">${btn(esc(B.UI.close),'card40Close',{},'primary block')}</div></section>`);}
// the parcel collected at the sender's live place: carried in a hand, the sender's line over them
function boardTake40(i){const B=BOARD40,er=boardErrandNow40();if(!er||er.e.state!=='up'||S.time<B.ERRAND.from||S.time>=B.ERRAND.giveBy)return;const n=boardNpc40(er.p.from);if(!n)return;
 er.e.state='hand';er.e.by=i;boardToast40(boardFill40(B.UI.takeToast,{short:er.p.short,receiver:boardName40(er.p.to)}));bubble40(boardText40('bd40-er-take-'+er.p.from),3600,n.g,2.1);
 try{if(typeof playPick==='function'&&players[i])playPick(players[i].g);}catch(e){}boardSave40();boardSync40();}
// given at the receiver's live place by six: their thanks and friendship; no money changes hands
function boardErrGive40(i){const B=BOARD40,er=boardErrandNow40();if(!er||er.e.state!=='hand'||S.time>=B.ERRAND.giveBy)return;const P=er.p;if(!boardNpc40(P.to))return;
 er.e.state='given';er.e.givenAt=Math.round(S.time*1e4)/1e4;try{aff(P.to,1);}catch(e){}boardLog40('board','errand '+P.id);boardSave40();boardSync40();
 openPanel(`<section class="gist40-panel gist40-errand"><p class="gist40-kicker">${esc(B.UI.errKicker)}</p><h2>${esc(boardName40(P.to))}</h2><div class="gist40-thanks">${say(P.to,esc(boardText40('bd40-er-ty-'+P.id)))}</div><div class="actions">${btn(esc(B.UI.close),'errand40Close',{},'primary block')}</div></section>`);}
function boardAct40(i,kind){if(kind!=='card40pick'&&kind!=='card40give'&&kind!=='errand40take'&&kind!=='errand40give')return false;
 if(boardOnline40()||boardIsAI40(i))return true;
 if((kind==='card40give'||kind==='errand40give')&&typeof foundGuard38==='function')foundGuard38();
 if(kind==='card40pick')boardPick40(i);else if(kind==='card40give')boardGive40(i);else if(kind==='errand40take')boardTake40(i);else boardErrGive40(i);
 return true;}
if(BOARD40.on&&typeof ACTIONS!=='undefined'){
 ACTIONS.card40Close=function(){try{closePanel();}catch(e){}boardSave40();};
 ACTIONS.errand40Close=function(){try{closePanel();}catch(e){}boardSave40();};
 ACTIONS.board40Close=function(){try{closePanel();}catch(e){}};
 if(typeof LOCAL_ONLY!=='undefined')for(const n of ['board40Close','card40Close','errand40Close'])LOCAL_ONLY.add(n);}

/* ======================================================================================================================================
   9. Wrappers: the tick, the hooks, the day, the world, a new household, the URL flags (spec §1.4, §1.5, §15)
   ====================================================================================================================================== */
// the board, the card things and the errand run after v39's steps
if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.tick==='function'&&typeof GIST39!=='undefined'&&typeof FOUND38!=='undefined'&&BOARD40.on){
 const prevEveTick40a=EVENING35.tick;EVENING35.tick=function(dt){const r=prevEveTick40a.apply(this,arguments);
  try{BOARD40.step(dt);}catch(e){if(typeof console!=='undefined')console.warn('board40',e);}return r;};}
if(BOARD40.on&&typeof HOTSPOT_HOOKS!=='undefined')HOTSPOT_HOOKS.push(boardHot40);
if(BOARD40.on&&typeof ACT_HOOKS!=='undefined')ACT_HOOKS.push(function(i,kind,arg){return boardAct40(i,kind,arg);});
// the morning: memory reset (the bubble, the lapse toast); the flags of an earlier day lapse
// (repair, H7) the day ends: an errand still up or in hand lapses then; when it was in hand (or its 18:00 toast had not been shown yet) its toast
// comes the next morning
function boardDayEnd40(){const B=BOARD40,b=gistSave40(false),e=b&&b.errand;let t=null;
 if(e&&e.day===S.day&&(e.state==='up'||e.state==='hand')){if(e.state==='hand')t=e.id;e.state='lapsed';}
 const lt=B.mem.lapseToast;if(lt&&lt.day===S.day)t=lt.id;B.mem.lapseToast=null;B.mem.morningToast=t?{id:t,day:(S.day|0)+1}:null;}
if(BOARD40.on&&typeof ACTIONS!=='undefined'&&typeof ACTIONS.nextday==='function'){const prevNextday40a=ACTIONS.nextday;ACTIONS.nextday=function(){
 try{boardBubblesOff40();boardDayEnd40();}catch(e){}
 const r=prevNextday40a.apply(this,arguments);try{if(BOARD40.flags.now&&BOARD40.flags.now<S.day)BOARD40.flags.now=0;BOARD40.checkAt=0;}catch(e){}return r;};}
// the URL flags (?board=now, ?gist40=playtest): read once a page load, taken out of the address, noted for the tab (spec §15)
function boardFlags40(){const F=BOARD40.flags;if(F.parsed)return F;
 try{const q=new URLSearchParams((typeof location!=='undefined'&&location.search)||'');const a=q.get('board'),c=q.get('gist40');if(!a&&!c)return F;F.parsed=true;
  if(a==='now'){F.value='now';F.now=-1;}if(c==='playtest'){F.value=F.value||'playtest';F.playtest=true;}
  try{if(typeof sessionStorage!=='undefined'){if(a)sessionStorage.setItem('gist40.flag.'+a,'1');if(c)sessionStorage.setItem('gist40.flag.'+c,'1');}}catch(e){}
  q.delete('board');if(c==='playtest'){}try{if(typeof history!=='undefined'&&history.replaceState){const s=q.toString();history.replaceState(null,'',location.pathname+(s?'?'+s:'')+(location.hash||''));}}catch(e){}}catch(e){}
 return F;}
if(BOARD40.on)boardFlags40();
// entering the world: everything of v40's board comes down and is disposed; the step builds what the state calls for
if(BOARD40.on&&typeof enterWorld==='function'){const prevEnter40a=enterWorld;enterWorld=function(){try{boardFlags40();boardTeardown40();}catch(e){}
 const r=prevEnter40a.apply(this,arguments);try{const F=BOARD40.flags;if(F.now===-1&&S&&S.p)F.now=S.day;BOARD40.checkAt=0;}catch(e){}return r;};}
// a new household: nothing of the old one stays in the scene (repair, H8: only the confirmed new game; the question, "No, keep it", changes nothing)
if(BOARD40.on&&typeof ACTIONS!=='undefined'){for(const n of ['newgame']){const prev=ACTIONS[n];if(typeof prev!=='function')continue;
 ACTIONS[n]=function(){try{boardTeardown40();BOARD40.mem.readDay=0;BOARD40.mem.readKey='';BOARD40.mem.bubDay=0;BOARD40.mem.morningToast=null;}catch(e){}return prev.apply(this,arguments);};}}

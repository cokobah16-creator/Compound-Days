/* v41 Ada's commissions: the workshop and the money (engineer A; v41/SPEC.md §1, §4, §5, §6 and column A of §18.1).
   Owner decision 1, the prices, "₦8,000–10,000": "Enough to bring the morning fishing back on settled days, about five casts a day. Dearer than
   our culture reader suggested for the smaller pieces, and dearer than Finds' coffee table (₦6,750)." Owner decision 3, the last polish, "About
   14 s, skippable": "\"The last polish is yours.\" Around 14 seconds alone, about 11 for a pair, with \"Leave it to Ada\" to skip it, and a short
   pause afterwards so a tapping thumb opens nothing by accident."
   Ada's slate stands at a small trestle in the Makers' Yard (the station, never on Ada), and beside her veranda chair on a day the household
   invited her. "Read Ada’s slate" opens it; the first read is v41's discovery (G.b41 inside S.life.gist38). One piece at a time: half when you
   order (spend()), something to bring before she cuts it (from Palm Court Finds, from Dayo's fabrics, three of the shells the household keeps,
   a photograph of the lagoon from Mr. Bassey; a neighbour's own thing through gifts-v41.js and ada41Got), handed over at the station; cut that
   evening, ready from the next morning, waiting for ever. The collection at the station: the rest (spend()), the next piece in the same panel
   (never a money button where the last one was; the touch hold re-armed on every step), then the last polish: a copy of Mallam's fan beat with
   his tested values and his lone-player and one-presser turn rules, or "Leave it to Ada", and a two-second hush after either. The piece, wrapped
   in newspaper, is carried in front; a flat piece taken indoors appears at once in its own place (the back wall, the top of the fridge, the
   door), drawn by v41 from G.b41.home into the base's furnGroup: never an ITEMS key, never S.home.items or S.home.storage.
   Inert until layer 2 opens (G.b40, day 8 or later and after v40's discovery day): before that nothing changes; in layer 2 before discovery the
   station and its prompt only. No TICK_HOOKS entry (the step rides EVENING35.tick by property, inside typeof guards), no Math.random call (every
   three.js construction runs inside quiet41), no wall clock, no performance.now, never the base showBubble, no blocked() or levelAt() call on
   an inert frame. Online it is all off. Installs nothing unless v40 installed itself (BOARD40, GIST40 and DAILY40 all on); every top-level name
   ends in 41 and is declared unconditionally. Shared with gifts-v41.js (B) and daily-v41.js (the integrator): quiet41, bubble41, gistSave41,
   layer41 and the API of spec §1.7. */
'use strict';

/* ======================================================================================================================================
   1. The object, the pieces and the copy (spec §1.6, §5, §6.1, §13.1–§13.3). Speech is a draft for the Nigerian reader; B's GIFT41.LINES may
   give any id its own words and wins where it does. The slate is written UI in standard English.
   ====================================================================================================================================== */
const ADA41={v:1,t:0,checkAt:0,
 on:typeof BOARD40!=='undefined'&&!!BOARD40&&!!BOARD40.on&&typeof GIST40!=='undefined'&&!!GIST40&&!!GIST40.on&&typeof DAILY40!=='undefined'&&!!DAILY40&&!!DAILY40.on,
 DAY:8,OPEN:8.0,CLOSE:18.0,
 // the station at the Yard: the probed point (v41/architect/probe/y2.json); reach 1.0 m (the spec's 1.2 m let "Talk to Ada", 2.55 m away at
 // talk's distance minus 0.4, win the edge of the disc nearest her: A's day-1 probe); the mesh just north of the point, away from the camera
 STATION:{yard:[-2.5,-17.5],reach:1.0,mesh:[0,-0.55],hushR:2.5,hush:2.0,away:4.0,
  // (fix round, S4) the polish's standing points at the trestle's corners, so a camera sees the piece between the players, as Mallam's fan
  // point is beside his grill. (repair 2, R2-1) 0.8 m east and west of its middle and 0.1 m in front of it: a player standing there clears the
  // trestle's end (0.4 m from its middle, the player 0.33 m round) and, facing the trestle, leaves the piece's projected middle clear of every
  // player's body in each camera's half at 1280 x 800, 844 x 390 and 390 x 844; each reaches 1.05 m, so the station's own point (0.92 m) and
  // anywhere a player walks up to it are within reach of both
  side:0.8,sideZ:0.1,sideR:1.05},
 // (repair 2, R2-1) the walk to the standing points when the beat begins: a walking pace (m/s), the trestle's half-width and half-depth with a
 // player's radius added (the walk goes round it), the radius kept clear of the base's walls and furniture, and how far a player may be moved
 // by anything else before the walk and the hold let go (the player walking off, or put somewhere else)
 WALK:{speed:1.6,hx:0.73,hz:0.53,r:0.3,slip:0.02},
 // (fix round, S2) what the evening's two sellers charge: Mallam's kept order (the base round's ₦2,000, mallam-v40.js) and one item from
 // Aunty Bisi's tray (BISI39.PRICE when it is there)
 KEEP:{mallam:2000,bisi:500},
 // the veranda station: 2.5 m south of Ada's live chair (the spec's 2.3 m put her talk within reach of the disc's edge), then 0.9 m east, then
 // 0.9 m west, each free at PR + 0.5, level 0 and 2.2 m from every prompt point there; else none that day
 VERANDA:{south:2.5,side:0.9,clear:2.2,door:[-4.1,5.05],mesh:[0,-0.5]},
 LEAD:{read:0,collect:0.04,hand:0.04,msg:0.04,polish:0.05,turn:0.04,hushD:1.3,beat:1.3,door:0.6,doorR:1.6,photo:0.99,photoR:1.8},
 // Mallam's tested values and turn rules (mallam-v40.js GLOW; rub = his fan, rubber = his fanner)
 GLOW:{up:0.07,sink:0.07,hold:0.6,holdS:4.75,rubS:0.45,turnS:0.45,turns:2,turnFrom:0.3,bub1:0.3,bub2:0.6,rubber:1.0,lone:2.0},
 // (fix round, DOD-3) the household's rub slot: a rub within slack seconds after its slot keeps it
 HOUSE:{slack:0.05},
 SHELLS:3,
 PLACES:{finds:'Palm Court Finds',dayo:'Dayo’s fabrics',bassey:'Mr. Bassey',store:'the shells you keep'},
 // the six pieces for the flat, in order (§6.1): id, name, wood, price, its place, what to bring
 FLAT:[
  {id:'shelf',name:'kitchen shelf',wood:'afara',price:9000,where:'on the back wall, above the stove',wall:true,bring:{kind:'hooks',thing:'four cup hooks',short:'cup hooks',from:'finds',cost:500,ask:'ad41-bring-hooks'}},
  {id:'mirror',name:'shells mirror',wood:'afara',price:10000,where:'on the back wall, facing your door',wall:true,bring:{kind:'glass',thing:'a piece of mirror glass',short:'mirror glass',from:'finds',cost:1500,shells:3,ask:'ad41-bring-mirror'}},
  {id:'clock',name:'clock surround',wood:'iroko',price:9000,where:'on the back wall, above the kitchen shelf',wall:true,bring:{kind:'clock',thing:'a plain wall clock',short:'wall clock',from:'finds',cost:2500,ask:'ad41-bring-clock'}},
  {id:'box',name:'box with a lid',wood:'obeche',price:8000,where:'on the fridge, under the mirror',bring:{kind:'cloth',thing:'a small piece of lining cloth',short:'lining cloth',from:'dayo',cost:500,ask:'ad41-bring-lining'}},
  {id:'plate',name:'door plate',wood:'iroko',price:8000,where:'on your door',bring:{kind:'screws',thing:'four brass screws',short:'brass screws',from:'finds',cost:500,ask:'ad41-bring-screws'}},
  {id:'panel',name:'carved panel of the lagoon',wood:'mahogany',price:10000,where:'on the back wall, above the sofa',wall:true,bring:{kind:'photo',thing:'a photograph of the lagoon',short:'lagoon photograph',from:'bassey',cost:0,ask:'ad41-bring-photo'}}],
 // the places in the flat, fixed in world terms (§6.2; set by A's day-1 capture): x, y of the piece's middle, z of its back. The back wall
 // already carries the base's sign over the sofa (x -6.3..-4.3, y 1.45..2.45), its shelf of pots (x -5.0..-3.4 at 1.75 m) and the
 // splashback (to 1.5 m); the panel hangs under the sign, the mirror over the pots, the kitchen shelf and the clock over the stove
 // (fix round, S9) the clock and the mirror hang lower, under the top bar's band at the default camera height: the clock just clear of the
 // kitchen shelf's top (1.80 m), the mirror just clear of the pots' shelf and the box on the fridge
 HOME:{panel:[-5.3,1.25,2.06],mirror:[-3.95,2.26,2.06],shelf:[-3.05,1.62,2.06],clock:[-3.05,2.1,2.06],box:[0,0,0],plate:[-4.95,0.82,5.87]},
 // (fix round, S9) a piece taken indoors is framed for this long by the camera of the player who took it in (and the other's, near the door)
 FRAME:{s:2.5,near:5.0},frame:null,
 WOOD:{iroko:'#9A6A34',afara:'#D9BF8C',obeche:'#E6D3A8',mahogany:'#7A3A26'},
 LINES:{
  // §13.1 the slate (written UI)
  'ad41-slate-head':'PIECES TO ORDER. Only one on my bench at once. Half when you order, the rest when you collect. I work at night; collect in the morning. — A.',
  // §13.2 Ada at the order
  'ad41-slate-first':'You read my slate. Good. Most people only read the noticeboard, and then they come to me with complaints.',
  'ad41-person':'I make for the person, not for the room. Rooms never say thank you.',
  // (fix round, C13) a remark of her own on a wall piece, answering nothing the player did
  'ad41-wall':'Wall pieces I measure from the wall, not from your description. Walls do not exaggerate.',
  'ad41-terms':'Half now, for the wood. The rest when you come for it. That is how I work with everybody, Tunde included.',
  'ad41-night':'I cut it tonight and finish before the Yard opens. Come for it in the morning, not before.',
  'ad41-one':'One piece at a time. I am one woman with one bench. Choose the next when this one leaves my hands.',
  'ad41-wood-iroko':'Iroko for this. It is heavy, it lasts, and the colour deepens with the years. Few things improve with age. Iroko does.',
  'ad41-wood-obeche':'Obeche is light and kind to the knife. Good for a box. Not for anything somebody will sit on.',
  'ad41-wood-mahogany':'Mahogany, from the sawmill across the water. Red when it is cut, brown once it has made up its mind.',
  // (fix round, C5) Ada's afara line lives in GIFT41.LINES only (B's wording, which the game always read first; the first draft's line here was
  // never shown)
  'ad41-bring-hooks':'A kitchen shelf needs hooks for the cups. Four small ones from Palm Court Finds. Brass, if they have it.',
  'ad41-bring-mirror':'You keep shells, I know. Give me three of the smooth ones. Then buy the glass at Palm Court Finds. I do not cut glass.',
  'ad41-bring-mirror-few':'Three smooth shells, when you have them; the shore gives them up in the mornings. And the glass from Palm Court Finds.',
  'ad41-bring-clock':'I make the surround. I do not make clocks. Palm Court Finds has a plain one. Carry it gently, like a tray of eggs.',
  'ad41-bring-lining':'Beads like a soft bed. Bring me a small piece of cloth from Dayo for the lining. Any colour you would wear yourself.',
  'ad41-bring-screws':'A plate for your door wants brass screws. Palm Court Finds keeps a tin of them. Bring four; I will not put nails in a door.',
  'ad41-bring-photo':'I carve what I have looked at. Ask Mr. Bassey for a photograph of the lagoon. He has hundreds, and he will pretend he has one.',
  'ad41-bring-like':'One like yours, then. Bring me what you brought the first time, and my hands will remember the rest.',
  'ad41-bring-got':'Good. That is all I was waiting for.',
  // (fix round, DOD-5) the glass handed over while the three shells are still owed: the piece still waits
  'ad41-bring-glass-got':'The glass, good. Now only the three smooth shells, and I can begin.',
  'ad41-short-bench':'No hurry. The wood is not going anywhere, and neither am I until six.',
  'ad41-short-veranda':'No hurry. The wood waits at the Yard, and wood is good at waiting.',
  'ad41-gift-pick':'For a neighbour? Good. Some pieces should live where people pass.',
  'ad41-nk-msg':'A stool for Mama Nkechi. Tell her yes. Tell her also that I will not make it taller, whatever she says.',
  // §13.3 the collection and the polish
  'ad41-ready':'Finished. Run your hand along it, against the grain too. Feel anything? No. That is the work.',
  'ad41-brought':'I brought it with me. It was coming this way anyway, and so was I.',
  'ad41-short-collect':'Pay the rest when you can. It will sit here under a cloth and wait. It has nowhere else to be.',
  'ad41-short-collect-v':'Settle it whenever suits you. It waits under a cloth. A good piece is patient, like a good customer.',
  'ad41-next':'And the next one? Choose now, or come back to my slate later.',
  // (fix round, C2) the owner's quoted sentence whole, then a follow-on for a piece for the flat or for a neighbour's piece
  'ad41-polish':'The last polish is yours.',
  'ad41-polish-own':'Then it is truly yours.',
  'ad41-polish-gift':'Then it leaves my bench from your hands, and {name} will know it.',
  'ad41-polish-b1':'With the grain. As if you are calming it down.',
  'ad41-polish-b2':'There. Now it shines like it means it.',
  'ad41-polish-skip':'Then I do it. Quickly, because you are watching.',
  'ad41-care':'Nothing wet on it for a day. After that, use it hard. A piece that is never used gets proud.',
  'ad41-guarantee':'If it shakes, bring it back. It will not shake. But bring it back.',
  // Mr. Bassey's lagoon photograph (B's line; said here only while gifts-v41.js is not installed)
  'gf41-ba-lagoon':'The lagoon, for Ada? Here, one from the dry season. The water was behaving itself that day.',
  // toasts (§13.6)
  'gf41-shells-give':'Three smooth shells, from the ones you keep, go to Ada.',
  'gf41-home-toast':'The {piece} is inside. You will find it {where}.',
  // (fix round, C7 and S12) the door plate goes up outside, on the door itself
  'gf41-plate-toast':'The door plate is up, on the outside of your door, where every visitor will read it.',
  // the interface strings
  'ui41-read':'Read Ada’s slate','ui41-hand':'Hand Ada the {thing}','ui41-msg':'Give Ada Mama Nkechi’s message','ui41-collect':'Collect your {piece}',
  'ui41-polish':'Polish the {piece}','ui41-turn':'Turn it over','ui41-hush-watch':'Ada is watching the polish.','ui41-hush-wrap':'Wrapped. Mind the corners.',
  'ui41-inside':'Take the {piece} inside','ui41-plate':'Put up the door plate','ui41-shells':'Give Ada three smooth shells','ui41-photo':'Ask for a lagoon photograph',
  'ui41-order':'Order this · {dep} now','ui41-short':'When you have it.','ui41-pay':'Pay the rest · {bal}','ui41-take':'Take it from the trestle','ui41-later':'Later',
  'ui41-polish-btn':'Polish it','ui41-leave':'Leave it to Ada','ui41-back':'Back',
  'ui41-flat':'For your flat: {piece}.','ui41-nb':'For a neighbour: {piece}, for {name}.','ui41-bring':'Bring: {thing}, from {place}.','ui41-bring-shells':'Bring: three of the shells you keep.','ui41-price':'{price} · half now {dep}',
  'ui41-open-cut':'On the bench now: {piece}. Ready in the morning.','ui41-open-wait':'Waiting for its {thing}: the {piece}, on the bench.',
  'ui41-open-ready':'Finished and waiting on my trestle: the {piece}. Collect it when your hands are free.',
  'ui41-flat-done':'For your flat: nothing more for now. Your walls are full, and so is my notebook.',
  'ui41-nk-slate':'For a neighbour: Mama Nkechi’s stool. She settles with me herself.','ui41-nk-next':'Hers next, after yours.',
  'ui41-shop':'For Ada’s {piece}: {thing} · {price}','ui41-buy':'Buy it','ui41-shop-go':'Pay for it at the stall itself.',
  'ui41-got':'{Thing} for Ada, carried with you.','ui41-where-wait':'with your stored things until the fridge is back out',
  'ui41-kicker':'ADA’S SLATE','ui41-title':'Pieces to order','ui41-kicker-c':'ADA’S BENCH','ui41-title-c':'Your {piece}',
  // (repair 2) the hand-over and the collection at the veranda station
  'ui41-kicker-v':'ADA ON THE VERANDA',
  // (repair 2, R2-3) the slate while the mirror's glass is handed over and only the shells are owed
  'ui41-shells-owed':'three smooth shells',
  // (repair 2) the box's place when the shells mirror does not hang over the fridge
  'ui41-where-fridge':'on top of the fridge',
  // (fix round, C2) a neighbour's piece is never called the household's own at the collection
  'ui41-collect-nb':'Collect {name}’s {piece}','ui41-title-nb':'{name}’s {piece}',
  'ui41-ordered':'Ordered: {piece}','ui41-ordered-nb':'Ordered: {piece}, for {name}',
  // (fix round, S2) the collection's next order when its deposit would leave the purse short of tonight's sellers ("Later" is then the default)
  'ui41-keep':'Keep {money} for {what} tonight.','ui41-keep-mallam':'Mallam’s sticks','ui41-keep-bisi':'Aunty Bisi’s tray','ui41-keep-and':'{a} and {b}',
  // Today's piece line (ada41Today; the integrator's block shows it)
  'ui41-today-ready':'Ada’s {piece} is ready at her bench.','ui41-today-pay':'To pay on collection: {bal}.','ui41-today-veranda':'Ada has brought your {piece} to the veranda.',
  'ui41-today-coll':'Your {piece} waits at Ada’s trestle for its last polish.','ui41-today-hand':'With you: the {piece}. It goes in at your door.',
  // (repair 2) the door plate goes up on the door itself; a ready piece on a visit day with no room for Ada's trestle on the veranda
  'ui41-today-hand-plate':'With you: the door plate. It goes up on your door.',
  'ui41-today-tomorrow':'Ada sits on your veranda today, with no room for her trestle; collect it tomorrow.',
  'ui41-today-bring':'Ada needs {thing} from {place}.','ui41-today-cut':'Ada is making your {piece} tonight. Ready in the morning.',
  'ui41-first':'The first piece made for us','ui41-six':'Ada’s pieces, all six, home'},
 world:{station:null,stationKey:'',slate:null,slateKey:'',top:null,topKey:'',bundle:{},home:[],tpl:{},bub:{},live:[],tex:[]},
 run:{day:0,key:'',glow:0,hold:0,pose:{0:-9,1:-9},lastRub:{0:-9,1:-9},anyRub:-9,buf:{0:'',1:''},turns:0,turnAt:0,b1:false,b2:false,done:false,doneAt:0,last:0,rubbed:[],turned:[],walk:null,walked:false,hushTo:-9,hushPos:null},
 panel:{kind:'',step:0,i:0,order:null},
 vcache:{key:'',pt:null},
 flags:{now:0,ready:0,parsed:false},
 cost:{steps:0,checks:0,builds:0}};

/* ======================================================================================================================================
   2. Shared helpers: the quiet builder, the bubbles, the save, layer 2 (spec §1.2, §1.3, §1.7). Shared with gifts-v41.js and daily-v41.js.
   ====================================================================================================================================== */
// a copy of quiet40 with its own seed and generator state: three.js draws Math.random for every new object's UUID, so every v41 construction
// runs with a local generator in its place for a moment and the game's own sequence never shifts
let quietSeed41=0x4100,quietOn41=false;
function quiet41(fn){if(quietOn41)return fn();const keep=Math.random;let s=quietSeed41;quietOn41=true;
 Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
 try{return fn();}finally{quietSeed41=s;Math.random=keep;quietOn41=false;}}
function adaOnline41(){return typeof NET!=='undefined'&&!!NET&&!!NET.on;}
function adaIsAI41(i){return typeof AI!=='undefined'&&!!AI&&!!AI.on&&i===AI.i;}
function adaLog41(a){try{if(typeof LOG35!=='undefined'&&LOG35&&typeof LOG35.add==='function')LOG35.add('commission',a);}catch(e){}}
function adaToast41(m){try{if(typeof toast==='function')toast(m);}catch(e){}}
function adaSilent41(){try{return typeof silentMode==='function'&&silentMode();}catch(e){return false;}}
function adaOverlay41(){try{return typeof overlayOpen==='function'&&overlayOpen();}catch(e){return false;}}
function adaInGist41(){return (typeof GIST38!=='undefined'&&!!GIST38&&!!GIST38.visit)||(typeof EVENING35!=='undefined'&&!!EVENING35&&EVENING35.state!=='idle');}
function adaSave41(){try{if(typeof save==='function'&&!adaInGist41())save();}catch(e){}}
function adaFill41(t,v){return String(t).replace(/\{(\w+)\}/g,(m,k)=>v&&v[k]!=null?v[k]:m);}
function adaUp41(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1);}
function adaNaira41(n){return typeof naira==='function'?naira(n):'₦'+n;}
function adaName41(k){return typeof CAST!=='undefined'&&CAST[k]?CAST[k].name:k;}
// the copy for an id: B's GIFT41.LINES where it has the id, else ADA41.LINES
function adaLine41(id){try{if(typeof GIFT41!=='undefined'&&GIFT41&&GIFT41.LINES&&typeof GIFT41.LINES[id]==='string')return GIFT41.LINES[id];}catch(e){}return ADA41.LINES[id]||'';}
function adaText41(id,v){return adaFill41(adaLine41(id),v);}
function adaLive41(){return typeof S!=='undefined'&&!!S&&!!S.p&&S.phase==='play'&&typeof players!=='undefined'&&players.length>0;}
function adaG41(){return typeof S!=='undefined'&&S&&S.life&&S.life.gist38&&typeof S.life.gist38==='object'?S.life.gist38:null;}
function adaPartyOn41(){return !!(typeof S!=='undefined'&&S&&S.party&&S.party.on&&!S.party.done);}
// layer 2 (spec §1.3): v40 discovered on an earlier day and day 8 or later; offline; not the v35 evening's day; not during a party; ?ada=now
// opens it today. Pure; reads a few fields and allocates nothing.
function layer41(){if(!ADA41.on||!adaLive41()||adaOnline41()||adaSilent41())return false;const G=adaG41();if(!G)return false;const b=G.b40;if(!b||typeof b!=='object')return false;
 if(adaPartyOn41())return false;const ev=S.life.evening35;if(!ev||!((ev.doneDay|0)<S.day))return false;
 if(ADA41.flags.now&&ADA41.flags.now===S.day)return true;return S.day>=ADA41.DAY&&S.day>(b.since|0);}
// the v41 record inside S.life.gist38 (spec §21), or null; create makes it (v41 discovery) and gives null unless layer 2 is open. Fields are
// lazy and additive.
function gistSave41(create){const G=adaG41();if(!G||!ADA41.on)return null;
 if(!G.b41||typeof G.b41!=='object'){if(!create||!layer41())return null;
  G.b41={v:1,since:S.day,piece:null,coll:null,hand:null,home:{},done:{flat:[],nb:[]},like:{n:0,cycle:0,last:null,done:[],week:{}},nk:{due:false,heard:false,told:false},
   later:null,haggled:{},returns:{},said:{},saidFor:{},once:{}};}
 const b=G.b41;if(!b.home||typeof b.home!=='object')b.home={};if(!b.done||typeof b.done!=='object')b.done={flat:[],nb:[]};
 for(const k of ['flat','nb'])if(!Array.isArray(b.done[k]))b.done[k]=[];
 if(!b.like||typeof b.like!=='object')b.like={n:0,cycle:0,last:null,done:[],week:{}};if(!b.nk||typeof b.nk!=='object')b.nk={due:false,heard:false,told:false};
 for(const k of ['haggled','returns','said','saidFor','once'])if(!b[k]||typeof b[k]!=='object')b[k]={};
 for(const k of ['piece','coll','hand','later'])if(b[k]===undefined)b[k]=null;
 return b;}
// the quiet, module-timed bubble (bubble40's pattern, with v40's phone rules: drawn by boardClamp40 inside each camera's half, at least 13 px of
// text, off the pantry chip and the prompt pill): one sprite per text, cached, built inside quiet41, timed on ADA41.t, out of the scene when it
// ends or its speaker hides; one bubble per speaker; tagged gist41='bubble'; disposed at teardown. bubble41(text, ms, obj, y).
function bubble41(text,ms,obj,y){const A=ADA41,W=A.world;if(!A.on||adaSilent41()||typeof scene==='undefined'||!scene||!obj||!text||typeof boardSprite40!=='function')return null;
 let b=W.bub[text];if(!b){b=quiet41(()=>boardSprite40(text));b.name='ada41_bubble';try{b.material.depthTest=false;b.renderOrder=6;}catch(e){}b.userData.gist41='bubble';if(typeof boardClamp40==='function')b.onBeforeRender=adaClamp41;b.frustumCulled=false;W.bub[text]=b;A.cost.builds++;}
 for(let j=W.live.length-1;j>=0;j--){const o=W.live[j];if(o!==b&&o.userData.f40&&o.userData.f40.obj===obj){o.visible=false;if(o.parent)o.parent.remove(o);W.live.splice(j,1);}}
 const h=typeof innerHeight==='number'&&innerHeight>0?innerHeight:800,k=Math.min(1.8,Math.max(1,600/h)),Wd=1.7*k;b.scale.set(Wd,Wd*b.userData.h40,1);
 b.userData.f40={obj,y:(y||2.3)+Wd*b.userData.h40/2,hy:(y||2.3)-0.7,end:A.t+(ms||3600)/1000,sx:Wd,sy:Wd*b.userData.h40};
 b.position.set(obj.position.x,(obj.position.y||0)+b.userData.f40.y,obj.position.z);b.visible=true;if(b.parent!==scene)scene.add(b);
 if(!W.live.includes(b))W.live.push(b);return b;}
function adaBubbleStep41(){const W=ADA41.world,L=W.live;if(!L.length)return;
 for(let k=L.length-1;k>=0;k--){const b=L[k],f=b.userData.f40;
  if(!f||ADA41.t>=f.end||!f.obj||!f.obj.visible||!f.obj.parent){b.visible=false;if(b.parent)b.parent.remove(b);L.splice(k,1);continue;}
  b.position.set(f.obj.position.x,(f.obj.position.y||0)+f.y,f.obj.position.z);}}
function adaBubblesOff41(){const W=ADA41.world;for(const b of W.live){b.visible=false;if(b.parent)b.parent.remove(b);}W.live.length=0;}
// (fix round, S4) v41's own bubbles are drawn over the players (no depth test), so a player standing at the trestle's corner never hides
// Ada's polish words from the other camera.
// (fix round, S4) a bubble is never drawn for a camera that cannot see what it hangs over: v40's clamp places it in the camera's half, then a
// bubble whose speaker (or thing) projects outside that camera's view is drawn at no size for that camera (v40's clamp kept an empty box at
// the half's edge)
function adaAnchorIn41(f,camera){try{const v=ADA41.vec||(ADA41.vec=new THREE.Vector3());camera.updateMatrixWorld();v.set(f.obj.position.x,(f.obj.position.y||0)+(f.hy!=null?f.hy:1.4),f.obj.position.z).applyMatrix4(camera.matrixWorldInverse);
 if(!(-v.z>0.1))return false;v.set(f.obj.position.x,(f.obj.position.y||0)+(f.hy!=null?f.hy:1.4),f.obj.position.z).project(camera);return Math.abs(v.x)<=1&&Math.abs(v.y)<=1;}catch(e){return true;}}
function adaClamp41(rend,sc,camera){const b=this,f=b.userData&&b.userData.f40;try{if(typeof boardClamp40==='function')boardClamp40.apply(this,arguments);}catch(e){}
 if(!f||!f.obj||!camera||!camera.isPerspectiveCamera)return;if(!adaAnchorIn41(f,camera))b.scale.set(1e-4,1e-4,1);}
// Ada's figure when she is somewhere a bubble can hang over her
function adaNpc41(){return typeof found38Npc==='function'?found38Npc('ada'):null;}
function adaSays41(id,v,ms){const n=adaNpc41();if(!n)return null;return bubble41(adaText41(id,v),ms||3600,n.g,2.1);}
// (fix round, S4) Ada's words at the polish hang over the trestle, where both cameras see the piece (at the Yard she is 2.55 m off, outside
// a player's view there)
function adaTrestleSays41(id,v,ms){const W=ADA41.world;if(W.station&&W.station.parent&&W.station.visible!==false)return bubble41(adaText41(id,v),ms||3600,W.station,1.5);return adaSays41(id,v,ms);}

/* ======================================================================================================================================
   3. Where Ada and the station are; the piece; the API for B and the integrator (spec §1.7). All pure.
   ====================================================================================================================================== */
function adaVisitDay41(){try{const v=S.life&&S.life.visit;return !!(v&&v.k==='ada'&&v.day===S.day);}catch(e){return false;}}
// 'bench' | 'veranda' | 'courtyard' | 'away', from Ada's live figure and the hour
function ada41Where(){if(!adaLive41())return 'away';const n=adaNpc41();if(!n||n.route)return 'away';const x=n.g.position.x,z=n.g.position.z;
 if(adaVisitDay41()&&z>5.5)return 'veranda';
 if(S.time>=ADA41.OPEN&&S.time<ADA41.CLOSE&&Math.hypot(x+4.2,z+15.6)<1.5)return 'bench';
 if(S.time>=18)return 'courtyard';return 'away';}
// the gist has begun tonight (or is over): the veranda station goes then
function adaGistBegun41(){if(adaInGist41())return true;try{return typeof gistSeenToday38==='function'&&gistSeenToday38();}catch(e){return false;}}
// prompt points the veranda station keeps 2.2 m from (the flat door, the pepper pot, the household's bench, Mallam's fan point and stand, the
// things lying out; (fix round, S7) Aunty Bisi's stop and her walk-in point while her evening is due today)
function adaBisiDue41(){try{return typeof bisiEvening39==='function'&&typeof BISI39!=='undefined'&&!!BISI39&&!!BISI39.ROUTE&&!!bisiEvening39();}catch(e){return false;}}
function adaVerandaAvoid41(){const out=[ADA41.VERANDA.door,[-5.6,6.35]];
 try{if(adaBisiDue41()){out.push(BISI39.ROUTE.stop);out.push(BISI39.ROUTE.strollIn);}}catch(e){}
 try{if(typeof BENCH36!=='undefined'&&BENCH36&&BENCH36.pose&&BENCH36.state&&BENCH36.state!=='off')out.push([BENCH36.pose.x,BENCH36.pose.z]);}catch(e){}
 try{if(typeof MALLAM40!=='undefined'&&MALLAM40&&MALLAM40.on){out.push(MALLAM40.fanAt);out.push(MALLAM40.spot);}}catch(e){}
 try{if(typeof BOARD40!=='undefined'&&BOARD40.world&&BOARD40.world.thing)out.push([BOARD40.world.thing.position.x,BOARD40.world.thing.position.z]);}catch(e){}
 try{const W=typeof FOUND38!=='undefined'&&FOUND38.world;if(W&&W.item&&W.itemKey)out.push([W.item.position.x,W.item.position.z]);}catch(e){}
 return out;}
// the veranda station's point from Ada's live chair (spec §5.7): south of her, then east, then west, under the rules; null when none passes
function verandaPoint41(ax,az){const V=ADA41.VERANDA,key=S.day+':'+ax.toFixed(3)+':'+az.toFixed(3)+':'+(adaBisiDue41()?1:0);if(ADA41.vcache.key===key)return ADA41.vcache.pt;
 // Ada standing on a balcony cell something already stands on (the balcony full: the base leaves her at its own spot): no station that day
 try{const col=Math.round((ax-FLAT.x0-FLAT.cell/2)/FLAT.cell);if(typeof itemAt==='function'&&itemAt(col,FLAT.rows)){ADA41.vcache={key,pt:null};return null;}}catch(e){}
 const av=adaVerandaAvoid41(),ok=(x,z)=>{try{if(blocked(x,z,PR+0.5,{lvl:0,noCrate:true}))return false;if(Math.abs(levelAt(x,z))>0.09)return false;if(typeof inFlat==='function'&&inFlat(x,z)&&z<6.45)return false;}catch(e){return false;}
  return av.every(p=>Math.hypot(p[0]-x,p[1]-z)>V.clear);};
 let pt=null;for(const dx of [0,V.side,-V.side]){const x=ax+dx,z=az+V.south;if(ok(x,z)){pt=[Math.round(x*1000)/1000,Math.round(z*1000)/1000];break;}}
 // (fix round, S7) then twice as far east and west, so a station can stand 2.2 m clear of Aunty Bisi's stop
 if(!pt)for(const k of [2,-2]){const x=ax+k*V.side,z=az+V.south;if(ok(x,z)){pt=[Math.round(x*1000)/1000,Math.round(z*1000)/1000];break;}}
 ADA41.vcache={key,pt};return pt;}
// the station now: {at:'yard'|'veranda', x, z} or null (no station shows)
function ada41Station(){if(!layer41())return null;const w=ada41Where();
 if(w==='bench')return {at:'yard',x:ADA41.STATION.yard[0],z:ADA41.STATION.yard[1]};
 if(w==='veranda'&&!adaGistBegun41()){const n=adaNpc41();const p=verandaPoint41(n.g.position.x,n.g.position.z);return p?{at:'veranda',x:p[0],z:p[1]}:null;}
 return null;}
function adaFlatDef41(id){return ADA41.FLAT.find(f=>f.id===id)||null;}
function adaDep41(price){return Math.ceil(price/2/500)*500;}
// a piece's display name, model and thing to bring (flat or a neighbour's piece, whose record carries its own)
// (fix round, C1) a neighbour's copy by its base name ("shells mirror"); "like yours" is only the slate's offer
function adaPieceName41(p){if(!p)return '';if(p.base)return p.base;if(p.list==='nb'){const m=/^like-(\w+)-/.exec(String(p.id||''));const f=m&&adaFlatDef41(m[1]);if(f)return f.name;}if(p.name)return p.name;const f=adaFlatDef41(p.id);return f?f.name:String(p.id);}
function adaReady41(p){return !!(p&&p.state==='cut'&&typeof p.cutDay==='number'&&S.day>p.cutDay)||!!(p&&p.state==='ready');}
// the open piece (on the bench): {id, list, for, state, price, dep, bal, bring, cutDay} or null
function ada41Piece(){const b=gistSave41(false);if(!b||!b.piece)return null;const p=b.piece;
 return {id:p.id,list:p.list,for:p.for||null,name:adaPieceName41(p),state:adaReady41(p)?'ready':p.state,price:p.price,dep:p.dep,bal:p.bal,bring:p.bring?Object.assign({},p.bring):null,cutDay:p.cutDay,paid:!!p.paid};}
function ada41Coll(){const b=gistSave41(false);return b&&b.coll?Object.assign({},b.coll):null;}
function ada41Hand(){const b=gistSave41(false);return b&&b.hand?Object.assign({},b.hand):null;}
// the next flat piece (not done, not open, not being collected or carried), or null
function adaNextFlat41(b){const busy=new Set([b.piece&&b.piece.list==='flat'?b.piece.id:'',b.coll&&b.coll.list==='flat'?b.coll.id:'',b.hand&&b.hand.list==='flat'?b.hand.id:'']);
 const f=ADA41.FLAT.find(x=>!b.done.flat.includes(x.id)&&!b.home[x.id]&&!busy.has(x.id));return f||null;}
// the slate's two offers (pure): {flat:{id,price,dep,...}|null, nb:{id,for,price,dep,...}|null}; B supplies the neighbour half (gift41Next)
function ada41Next(){const b=gistSave41(false);const out={flat:null,nb:null};if(!b)return out;const f=adaNextFlat41(b);
 if(f)out.flat={id:f.id,list:'flat',name:f.name,wood:f.wood,price:f.price,dep:adaDep41(f.price),bring:Object.assign({},f.bring)};
 try{if(typeof gift41Next==='function'){const n=gift41Next();if(n&&n.id)out.nb=Object.assign({list:'nb'},n,{dep:n.dep!=null?n.dep:adaDep41(n.price|0)});}}catch(e){}
 return out;}
// what the open piece waits for (pure): {kind, from, got, need, handed, shells} or null
function ada41Bring(){const b=gistSave41(false),p=b&&b.piece;if(!p||p.state!=='wait'||!p.bring)return null;const B=p.bring;
 return {kind:B.kind,thing:B.thing,short:B.short||B.thing,from:B.from,cost:B.cost|0,got:!!B.got,handed:!!B.handed,need:!B.handed||!!(B.shells&&!B.shellsGiven),shells:B.shells?(B.shellsGiven?0:B.shells):0};}
// a neighbour's thing asked for at their live place (B): into the pocket for the waiting piece; true when it was wanted
function ada41Got(kind){const b=gistSave41(false),p=b&&b.piece;if(!p||p.state!=='wait'||!p.bring||p.bring.kind!==kind||p.bring.got)return false;p.bring.got=S.day;adaLog41('bring '+kind);adaSave41();return true;}
// the piece taken out of the hands by B's give to a neighbour (at their live place): booked with the place and hour; true when done
function ada41Delivered(k,place){const b=gistSave41(false),h=b&&b.hand;if(!h||h.list!=='nb'||(k&&h.for&&h.for!==k))return false;
 b.done.nb.push({id:h.id,for:h.for||k||null,day:S.day,time:Math.round(S.time*1e4)/1e4,place:place||null});b.hand=null;adaDropBundle41();adaSave41();return true;}
// pieces collected on a day: [{id, list, for, at, time}] (B's gist reads the place and hour)
function ada41Collected(day){const b=gistSave41(false);if(!b)return [];const L=Array.isArray(b.once.collected)?b.once.collected:[];return L.filter(r=>r.day===day).map(r=>({id:r.id,list:r.list,for:r.for||null,at:r.at,time:r.time}));}
// Today's line for the piece (the integrator's block reads it): {html} or null
// (repair 2) a visit day with Ada in her veranda chair and no room there for her trestle (the balcony full, or Aunty Bisi's stop too near): a
// piece ready today can be collected only at her bench tomorrow (pure)
function adaReadyLater41(){try{return adaVisitDay41()&&!ada41Station()&&!adaGistBegun41();}catch(e){return false;}}
function ada41Today(){try{const b=gistSave41(false);if(!b||!layer41())return null;const p=b.piece,h=b.hand,c=b.coll;
 if(p&&adaReady41(p)){const nm=adaPieceName41(p),pay=p.bal>0?' '+adaText41('ui41-today-pay',{bal:adaNaira41(p.bal)}):'';if(ada41Where()==='veranda'&&ada41Station())return {html:esc(adaText41('ui41-today-veranda',{piece:nm})),k:'ready'};
  return {html:esc(adaText41('ui41-today-ready',{piece:nm})+(adaReadyLater41()?' '+adaLine41('ui41-today-tomorrow'):'')+pay),k:'ready'};}
 if(c)return {html:esc(adaText41('ui41-today-coll',{piece:adaPieceName41(c)})),k:'coll'};
 if(h&&h.list==='flat')return {html:esc(h.id==='plate'?adaLine41('ui41-today-hand-plate'):adaText41('ui41-today-hand',{piece:adaPieceName41(h)})),k:'hand'};
 if(p&&p.state==='wait'&&p.bring&&!p.bring.got){const B=p.bring;if(B.from==='finds'||B.from==='dayo')return {html:esc(adaText41('ui41-today-bring',{thing:B.thing,place:ADA41.PLACES[B.from]})),k:'bring'};}
 if(p&&p.state==='cut')return {html:esc(adaText41('ui41-today-cut',{piece:adaPieceName41(p)})),k:'cut'};
 return null;}catch(e){return null;}}

/* ======================================================================================================================================
   4. The models, the station, the bundle and the pieces in the flat (spec §5.1, §6.2, §6.3). Every build inside quiet41.
   ====================================================================================================================================== */
function adaMat41(c,o){const m=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));m.userData.own41=true;return m;}
function adaBox41(g,w,h,d,c,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),adaMat41(c));m.position.set(x,y,z);g.add(m);return m;}
function adaCyl41(g,r,h,c,x,y,z,seg){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg||12),adaMat41(c));m.position.set(x,y,z);g.add(m);return m;}
function adaTag41(o,tag){o.traverse(m=>{m.userData.gist41=tag;});return o;}
// a canvas texture (the slate's chalk, the door plate's lettering), kept for disposal
function adaCanvas41(w,h,draw){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');try{draw(g,w,h);}catch(e){}const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;ADA41.world.tex.push(t);return t;}
// one piece's model, its back at z 0, facing +z, centred in x and y (the flat's wall places, the trestle top and the bundle's size use it)
function pieceModel41(id,wood){const g=new THREE.Group();g.name='ada41_'+id;const wc=ADA41.WOOD[wood]||ADA41.WOOD.iroko,dark='#4A3020';
 const B=(w,h,d,c,x,y,z)=>adaBox41(g,w,h,d,c,x,y,z),C=(r,h,c,x,y,z,s)=>adaCyl41(g,r,h,c,x,y,z,s);
 switch(id){
  case 'shelf':B(0.72,0.04,0.2,wc,0,-0.12,0.1);B(0.72,0.04,0.2,wc,0,0.14,0.1);B(0.04,0.34,0.2,wc,-0.34,0.01,0.1);B(0.04,0.34,0.2,wc,0.34,0.01,0.1);
   for(let k=0;k<4;k++){const h=C(0.012,0.06,'#C9A13B',-0.24+k*0.16,-0.17,0.17,6);h.rotation.x=Math.PI/2;}
   B(0.1,0.12,0.1,'#2F4B8F',-0.18,-0.04,0.1);B(0.08,0.1,0.08,'#C9663C',0.16,-0.05,0.1);break;
  case 'mirror':B(0.5,0.62,0.04,wc,0,0,0.02);B(0.4,0.52,0.01,'#CFE3E8',0,0,0.045);
   for(const [x,y] of [[-0.19,0.25],[0.19,0.25],[0,-0.28]]){const s=new THREE.Mesh(new THREE.SphereGeometry(0.04,8,6),adaMat41('#F2E6D6'));s.scale.set(1,0.75,0.45);s.position.set(x,y,0.05);g.add(s);}break;
  case 'clock':B(0.5,0.5,0.05,wc,0,0,0.025);{const f=C(0.16,0.02,'#F6F1E4',0,0,0.06,20);f.rotation.x=Math.PI/2;const r=C(0.175,0.015,dark,0,0,0.052,20);r.rotation.x=Math.PI/2;}
   B(0.012,0.11,0.006,'#2A1F17',0,0.045,0.072);B(0.08,0.012,0.006,'#2A1F17',0.035,0,0.072);break;
  case 'box':B(0.34,0.14,0.22,wc,0,-0.02,0.11);B(0.36,0.04,0.24,dark,0,0.07,0.11);B(0.06,0.02,0.04,'#C9A13B',0,0.1,0.11);break;
  case 'plate':{B(0.42,0.24,0.03,wc,0,0,0.015);const t=adaCanvas41(256,144,(c,w,h)=>{c.fillStyle='#E9D6B0';c.fillRect(0,0,w,h);c.fillStyle='#3A2416';c.font='700 64px Georgia, serif';c.textAlign='center';c.textBaseline='middle';c.fillText('Flat 3',w*0.42,h/2);c.strokeStyle='#2F6B4F';c.lineWidth=6;c.beginPath();c.moveTo(w*0.86,h*0.85);c.lineTo(w*0.86,h*0.3);c.stroke();c.beginPath();c.arc(w*0.86,h*0.3,22,Math.PI,2*Math.PI);c.stroke();});
   const m=new THREE.Mesh(new THREE.PlaneGeometry(0.36,0.19),new THREE.MeshBasicMaterial({map:t}));m.material.userData.own41=true;m.position.set(0,0,0.032);g.add(m);break;}
  // a long, low relief (the base's own sign hangs over the sofa from 1.45 m, so the panel sits between the sofa's back and the sign)
  case 'panel':B(1.2,0.34,0.05,wc,0,0,0.025);B(1.1,0.26,0.01,'#9A5A3E',0,0,0.055);for(let k=0;k<3;k++)B(1.0-k*0.12,0.012,0.01,'#C59A72',0,-0.05-k*0.035,0.065);
   for(const [x,h] of [[-0.38,0.2],[-0.27,0.16],[0.36,0.18]]){B(0.02,h,0.012,'#5C3423',x,-0.1+h/2,0.066);B(0.11,0.025,0.012,'#5C3423',x,h-0.1,0.068);}break;
  // (fix round, DOD-10 and C10; spec §7.4) the neighbours' pieces from the flat models: the frame is the mirror's frame with the wedding print's
  // sepia in place of the glass and no shells; the name board and the café sign are the door plate with their own lettering (letters only)
  case 'frame':{B(0.5,0.62,0.04,wc,0,0,0.02);const t=adaCanvas41(160,208,(c,w,h)=>{const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#D9C29A');gr.addColorStop(1,'#B89468');c.fillStyle=gr;c.fillRect(0,0,w,h);
    c.fillStyle='#6B4A2E';for(const [x,r] of [[w*0.36,15],[w*0.64,14]]){c.beginPath();c.arc(x,h*0.4,r,0,2*Math.PI);c.fill();c.beginPath();c.moveTo(x-r*1.7,h*0.88);c.quadraticCurveTo(x,h*0.12,x+r*1.7,h*0.88);c.closePath();c.fill();}
    c.strokeStyle='#F1E4CC';c.lineWidth=6;c.strokeRect(3,3,w-6,h-6);});
   const m=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.52),new THREE.MeshBasicMaterial({map:t}));m.material.userData.own41=true;m.position.set(0,0,0.045);g.add(m);break;}
  case 'nboard':case 'nsign':{B(0.42,0.24,0.03,wc,0,0,0.015);const nb=id==='nboard';const t=adaCanvas41(256,144,(c,w,h)=>{c.fillStyle='#E9D6B0';c.fillRect(0,0,w,h);c.fillStyle='#3A2416';c.textAlign='center';c.textBaseline='middle';
    if(nb){c.font='italic 700 66px Georgia, serif';c.fillText('Tunde',w/2,h*0.46);const x=w/2+c.measureText('Tunde').width/2;c.strokeStyle='#3A2416';c.lineWidth=5;c.beginPath();c.moveTo(x-6,h*0.6);c.bezierCurveTo(x+24,h*0.7,x+34,h*0.22,x+12,h*0.2);c.quadraticCurveTo(x+2,h*0.22,x+8,h*0.34);c.stroke();}
    else{c.font='700 38px Georgia, serif';c.fillText('Mama Nkechi’s',w/2,h*0.4);c.font='700 24px Georgia, serif';c.fillText('C A F É',w/2,h*0.74);c.strokeStyle='#2F6B4F';c.lineWidth=3;c.beginPath();c.moveTo(w*0.3,h*0.59);c.lineTo(w*0.7,h*0.59);c.stroke();}});
   const m=new THREE.Mesh(new THREE.PlaneGeometry(0.36,0.19),new THREE.MeshBasicMaterial({map:t}));m.material.userData.own41=true;m.position.set(0,0,0.032);g.add(m);break;}
  case 'stool':B(0.34,0.04,0.34,wc,0,0.25,0);for(const [x,z] of [[-0.13,-0.13],[0.13,-0.13],[-0.13,0.13],[0.13,0.13]])B(0.04,0.5,0.04,wc,x,0,z);break;
  case 'table':B(0.6,0.04,0.4,wc,0,0.2,0);for(const [x,z] of [[-0.26,-0.16],[0.26,-0.16],[-0.26,0.16],[0.26,0.16]])B(0.04,0.4,0.04,wc,x,0,z);break;
  default:B(0.4,0.3,0.06,wc,0,0,0.03);}
 return g;}
// the newspaper bundle: one wrapped shape, small or medium
function bundleModel41(size){const g=new THREE.Group();g.name='ada41_bundle';const s=size==='small'?[0.34,0.26,0.12]:[0.56,0.4,0.16];
 adaBox41(g,s[0],s[1],s[2],'#E4DED0',0,0,0);adaBox41(g,s[0]+0.005,0.03,s[2]+0.005,'#8A8478',0,0,0);adaBox41(g,0.03,s[1]+0.005,s[2]+0.005,'#8A8478',0,0,0);return g;}
// small or medium (spec §1.6), by the piece's id or its model's id (a copy's id is like-…; the name board's model is nboard), DOD-10
function adaSize41(id,model){const S41=['box','plate','frame','board','nkstool','sign','nboard','nsign'];return [id,model].some(x=>S41.includes(String(x)))?'small':'medium';}
// the trestle and the slate (chalk on a canvas: "PIECES TO ORDER" and two small sketches)
function adaSlateTex41(key){return adaCanvas41(512,384,(c,w,h)=>{c.fillStyle='#2B2F2C';c.fillRect(0,0,w,h);c.strokeStyle='#7A5230';c.lineWidth=18;c.strokeRect(0,0,w,h);
 c.fillStyle='#EDEBE2';c.font='700 46px Georgia, serif';c.textAlign='center';c.fillText('PIECES TO ORDER',w/2,78);c.strokeStyle='#EDEBE2';c.lineWidth=4;
 c.strokeRect(70,140,150,110);c.beginPath();c.moveTo(70,195);c.lineTo(220,195);c.stroke();c.strokeRect(300,150,130,90);c.beginPath();c.arc(365,195,30,0,2*Math.PI);c.stroke();
 c.font='400 30px Georgia, serif';c.fillText('— A.',w-90,h-40);});}
function stationModel41(){const g=new THREE.Group();g.name='ada41_station';const W='#8A5A34',D='#5E3B22';
 const t=new THREE.Group();t.name='ada41_trestle';g.add(t);adaBox41(t,0.8,0.04,0.4,W,0,0.7,0);
 for(const sx of [-0.32,0.32]){const l1=adaBox41(t,0.04,0.74,0.04,D,sx,0.35,-0.12);l1.rotation.x=0.18;const l2=adaBox41(t,0.04,0.74,0.04,D,sx,0.35,0.12);l2.rotation.x=-0.18;}
 adaTag41(t,'trestle');
 const s=new THREE.Group();s.name='ada41_slate';g.add(s);adaBox41(s,0.54,0.42,0.03,'#5E3B22',0,0.93,-0.16).rotation.x=-0.22;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.38),new THREE.MeshBasicMaterial({map:adaSlateTex41(''),color:'#FFFFFF'}));m.material.userData.own41=true;m.position.set(0,0.93,-0.142);m.rotation.x=-0.22;s.add(m);s.userData.face=m;
 adaTag41(s,'slate');return g;}
function adaDrop41(o,keepShared){if(!o)return;if(o.parent)o.parent.remove(o);if(keepShared)return;o.traverse(m=>{if(m.geometry)m.geometry.dispose();
 const ms=m.material?(Array.isArray(m.material)?m.material:[m.material]):[];for(const x of ms){if(x.map&&x.map.dispose)x.map.dispose();x.dispose();}});}
// a model from the cache, cloned (shared geometry and materials; the templates are disposed at teardown)
function adaClone41(id,wood,tag){const W=ADA41.world,k=id+':'+(wood||'');let t=W.tpl[k];if(!t){t=quiet41(()=>pieceModel41(id,wood));W.tpl[k]=t;ADA41.cost.builds++;}
 const c=quiet41(()=>t.clone());adaTag41(c,tag);return c;}
function adaDropBundle41(){const W=ADA41.world;for(const k in W.bundle){adaDrop41(W.bundle[k]);delete W.bundle[k];}}
function adaDropTop41(){const W=ADA41.world;if(W.top)adaDrop41(W.top,true);W.top=null;W.topKey='';}
function adaDropStation41(){const W=ADA41.world;adaDropTop41();adaDrop41(W.station);W.station=null;W.stationKey='';W.slateKey='';}
function adaDropHome41(){const W=ADA41.world;for(const o of W.home)adaDrop41(o,true);W.home.length=0;}
function adaAny41(){const W=ADA41.world;return !!(W.station||W.top||Object.keys(W.bundle).length||W.home.length||W.live.length);}
function adaTeardown41(){const W=ADA41.world;adaDropStation41();adaDropBundle41();adaDropHome41();adaBubblesOff41();
 for(const k in W.bub){adaDrop41(W.bub[k]);delete W.bub[k];}for(const k in W.tpl){adaDrop41(W.tpl[k]);delete W.tpl[k];}for(const t of W.tex)try{t.dispose();}catch(e){}W.tex.length=0;
 adaRunReset41();ADA41.run.hushTo=-9;ADA41.run.hushPos=null;ADA41.vcache={key:'',pt:null};ADA41.frame=null;}
function adaRunReset41(){const r=ADA41.run;Object.assign(r,{day:0,key:'',glow:0,hold:0,pose:{0:-9,1:-9},lastRub:{0:-9,1:-9},anyRub:-9,buf:{0:'',1:''},turns:0,turnAt:0,b1:false,b2:false,done:false,doneAt:0,last:0,rubbed:[],turned:[],walk:null,walked:false});}
// the slate's chalk key: the two offers' ids (rebuilt only when they change)
function adaSlateKey41(){const b=gistSave41(false);if(!b)return 'pre';const n=ada41Next();return (n.flat?n.flat.id:'-')+'|'+(n.nb?n.nb.id:'-');}
// the station's mesh where the station is, the piece on its top (ready, or paid and being polished), the cloth over a ready piece whose balance waits
function adaSyncStation41(st){const A=ADA41,W=A.world;if(!st){adaDropStation41();return;}const V=st.at==='yard'?A.STATION.mesh:A.VERANDA.mesh;
 const key=st.at+':'+st.x+':'+st.z;if(!W.station){W.station=quiet41(stationModel41);A.cost.builds++;}
 if(W.stationKey!==key){W.station.position.set(st.x+V[0],0,st.z+V[1]);W.stationKey=key;}if(W.station.parent!==scene)scene.add(W.station);
 const sk=adaSlateKey41();if(W.slateKey!==sk){const s=W.station.children.find(c=>c.name==='ada41_slate'),f=s&&s.userData.face;if(f){const old=f.material.map;f.material.map=quiet41(()=>adaSlateTex41(sk));f.material.needsUpdate=true;
   if(old){const i=W.tex.indexOf(old);if(i>=0)W.tex.splice(i,1);old.dispose();}}W.slateKey=sk;}
 const b=gistSave41(false),p=b&&b.coll?b.coll:(b&&b.piece&&adaReady41(b.piece)?b.piece:null);const cloth=!!(p&&p===b.piece&&p.short===S.day);
 const tk=p?(p.id+':'+(p.wood||'')+':'+(cloth?'c':'o')+(p===b.coll?':p':'')):'';
 if(W.topKey!==tk){adaDropTop41();if(p){const f=adaFlatDef41(p.id),mid=p.id==='frame'?'frame':(p.model||p.id),g=quiet41(()=>new THREE.Group());g.name='ada41_top';
   const m=adaClone41(mid,p.wood||(f&&f.wood),'piece');const sc=p.scale||1;m.scale.setScalar(sc*0.8);
   if(['stool','table'].includes(mid)){m.position.set(0,0.72,0);}else{m.rotation.x=-Math.PI/2;m.position.set(0,0.74,0.02);}g.add(m);
   if(cloth){const c=quiet41(()=>{const q=new THREE.Group();adaBox41(q,0.6,0.08,0.34,'#D8CBB0',0,0.78,0.02);return q;});adaTag41(c,'cloth');g.add(c);}
   W.top=g;W.topKey=tk;}}
 if(W.top){if(W.top.parent!==W.station)W.station.add(W.top);}}
// the bundle held in front of its carrier at chest height
function adaSyncBundle41(){const W=ADA41.world,b=gistSave41(false),h=b&&b.hand;const i=h?(h.by|0):-1;
 for(const k in W.bundle)if(+k!==i){adaDrop41(W.bundle[k]);delete W.bundle[k];}
 if(!h||!players[i])return;if(!W.bundle[i]){const g=quiet41(()=>bundleModel41(adaSize41(h.id,h.model)));adaTag41(g,'bundle');W.bundle[i]=g;ADA41.cost.builds++;}
 const g=W.bundle[i],p=players[i].g;if(g.parent!==scene)scene.add(g);const yaw=p.rotation.y;g.position.set(p.position.x+Math.sin(yaw)*0.32,(p.position.y||0)+1.0,p.position.z+Math.cos(yaw)*0.32);g.rotation.y=yaw;}
// Ada's pieces in the flat: built into the base's furnGroup in their own places (after the base and every earlier wrapper built the flat)
function homePieces41(){const W=ADA41.world;adaDropHome41();const b=gistSave41(false);if(!b||adaOnline41()||typeof furnGroup==='undefined'||!furnGroup)return;
 const H=ADA41.HOME;for(const f of ADA41.FLAT){if(!b.home[f.id])continue;const m=adaClone41(f.id,f.wood,'home');let pos=H[f.id];
  if(f.id==='box'){const it=S.home&&Array.isArray(S.home.items)?S.home.items.find(x=>x.type==='fridge'):null;if(!it)continue;const [cx,cz]=cellToWorld(it.x,it.y);pos=[cx,1.7+0.09,2.30];m.position.set(pos[0],pos[1],pos[2]);}
  else if(f.id==='plate'){m.position.set(pos[0],pos[1],pos[2]);}
  else m.position.set(pos[0],pos[1],pos[2]);
  furnGroup.add(m);W.home.push(m);}}

/* ======================================================================================================================================
   5. The per-frame step (the EVENING35.tick wrapper below): the station by the hour and the place, the piece on the trestle, the bundle, the beat
   ====================================================================================================================================== */
function adaCheck41(){const A=ADA41;A.cost.checks++;
 if(!layer41()){if(adaAny41()){adaDropStation41();adaDropBundle41();if(adaOnline41())adaDropHome41();}return;}
 const st=ada41Station();adaSyncStation41(st);
 const b=gistSave41(false);
 // (fix round, DOD-7) the veranda's station goes when the gist begins: a piece paid for there and still on the trestle is finished as "Leave it
 // to Ada" (into the hands of the player who rubbed last, or who collected it), so the paid piece is never left behind overnight
 // (repair 2) and so is a piece paid for at the Yard whose polish still runs when the Yard's station closes at six
 if(b&&b.coll&&!A.run.done&&!st&&((b.coll.at==='veranda'&&adaGistBegun41())||(b.coll.at==='yard'&&S.time>=A.CLOSE))){A.run.done=true;A.run.doneAt=A.t;polishDone41(A.run.rubbed.length?(A.run.last|0):(A.panel.i|0),true,true);return;}if(b&&b.hand)adaSyncBundle41();else if(Object.keys(A.world.bundle).length)adaDropBundle41();
 // the beat's record belongs to today's collected piece
 const c=b&&b.coll;const key=c?S.day+':'+c.id:'';if(A.run.key!==key){adaRunReset41();A.run.key=key;A.run.day=S.day;}}
ADA41.step=function(dt){const A=ADA41;dt=Math.max(0,+dt||0);A.t+=dt;A.cost.steps++;
 if(A.world.live.length)adaBubbleStep41();
 if(A.world.station||Object.keys(A.world.bundle).length){const b=gistSave41(false);if(b&&b.hand&&Object.keys(A.world.bundle).length)adaSyncBundle41();if(b&&b.coll&&A.world.station){if(!adaOverlay41())adaWalkStep41(dt);polishBeat41(dt);}}
 if(A.t<A.checkAt)return;A.checkAt=A.t+0.25;adaCheck41();};

/* ======================================================================================================================================
   6. The last polish (spec §5.6; owner decision 3): a copy of Mallam's fan beat, his values and turn rules; the hush after it
   ====================================================================================================================================== */
function adaStationNear41(i,r){const st=ada41Station(),p=players[i];if(!st||!p)return false;return Math.hypot(p.g.position.x-st.x,p.g.position.z-st.z)<r;}
// (fix round, S4) the polish's two standing points beside the trestle (pure): [[x,z],[x,z]] for a station
function adaSides41(st){const A=ADA41,V=st.at==='yard'?A.STATION.mesh:A.VERANDA.mesh,cx=st.x+V[0],cz=st.z+V[1]+A.STATION.sideZ;return [[cx-A.STATION.side,cz],[cx+A.STATION.side,cz]];}
// the distance from a point to the nearer standing point (d is the hotspot hook's own distance function, or a plain hypot)
function adaSideDist41(st,d){return Math.min.apply(null,adaSides41(st).map(q=>d(q[0],q[1])));}
// player i stands within reach of a standing point (the polish's Act counts there)
function adaPolishNear41(i){const st=ada41Station(),p=players[i];if(!st||!p)return false;const x=p.g.position.x,z=p.g.position.z;return adaSideDist41(st,(a,c)=>Math.hypot(x-a,z-c))<ADA41.STATION.sideR;}
// (repair 2, R2-1) the trestle's middle (pure)
function adaTrestle41(st){const V=st.at==='yard'?ADA41.STATION.mesh:ADA41.VERANDA.mesh;return [st.x+V[0],st.z+V[1]];}
// (repair 2, R2-1) the way from a player to a standing point (pure): straight, or round the trestle (in front, beside, behind), each leg clear of
// the trestle (a player's radius added) and of the base's walls and furniture; the shortest that is clear, else straight
function adaWalkPath41(from,to,mid){const R=ADA41.WALK;
 const inT=(x,z)=>Math.abs(x-mid[0])<R.hx&&Math.abs(z-mid[1])<R.hz;
 const legOK=(a,b)=>{const n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/0.05));for(let k=1;k<=n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(inT(x,z))return false;
   try{if(typeof blocked==='function'&&blocked(x,z,R.r,{lvl:0,noCrate:true}))return false;}catch(e){}}return true;};
 const zf=mid[1]+R.hz+0.02,zb=mid[1]-R.hz-0.02;let best=null,bl=1e9;
 for(const P of [[to],[[from[0],zf],[to[0],zf],to],[[to[0],from[1]],to],[[from[0],zb],[to[0],zb],to]]){let a=from,L=0,ok=true;for(const q of P){if(!legOK(a,q)){ok=false;break;}L+=Math.hypot(q[0]-a[0],q[1]-a[1]);a=q;}if(ok&&L<bl){bl=L;best=P;}}
 return best||[to];}
// (repair 2, R2-1) when the beat begins, each human player within STATION.away of the station walks to a standing point (a lone player to the
// nearer one; a pair, each to the one that makes the shorter walk for both) and turns to face the trestle, so each camera sees the piece between
// them; a standing point something stands on is left out (that player polishes from where they are)
function adaWalkStart41(){const A=ADA41,r=A.run,st=ada41Station();r.walked=true;r.walk={};if(!st||adaOnline41())return;
 const sd=adaSides41(st),mid=adaTrestle41(st),pos=i=>[players[i].g.position.x,players[i].g.position.z],far=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 const who=[0,1].filter(i=>{const p=players[i];return !!p&&!adaIsAI41(i)&&!(p.g&&p.g.sitting)&&(p.y||0)<=1&&far(pos(i),[st.x,st.z])<A.STATION.away;});if(!who.length)return;
 const pick={};if(who.length===1)pick[who[0]]=far(pos(who[0]),sd[0])<=far(pos(who[0]),sd[1])?0:1;
 else{const [a,c]=who;if(far(pos(a),sd[0])+far(pos(c),sd[1])<=far(pos(a),sd[1])+far(pos(c),sd[0])){pick[a]=0;pick[c]=1;}else{pick[a]=1;pick[c]=0;}}
 for(const i of who){const t=sd[pick[i]];try{if(typeof blocked==='function'&&blocked(t[0],t[1],A.WALK.r,{lvl:0,noCrate:true}))continue;}catch(e){}
  r.walk[i]={path:adaWalkPath41(pos(i),t,mid),n:0,at:null,face:[mid[0]-t[0],mid[1]-t[1]]};}}
// (repair 2, R2-1) the walk, then the hold: at a walking pace along the path, facing the way; there, turned to the trestle and held so (the base's
// idle turn towards the camera never starts) until the beat ends or is left to Ada; a player who walks off (or is put elsewhere) is let go
function adaWalkStep41(dt){const A=ADA41,W=A.run.walk;if(!W)return;for(const k in W){const p=players[+k],G=W[k];if(!p||adaIsAI41(+k)){delete W[k];continue;}
  const x0=p.g.position.x,z0=p.g.position.z;if(G.at&&Math.hypot(x0-G.at[0],z0-G.at[1])>A.WALK.slip){delete W[k];continue;}
  let x=x0,z=z0,step=A.WALK.speed*Math.max(0,Math.min(+dt||0,0.1)),fx=0,fz=0;
  while(step>0&&G.n<G.path.length){const t=G.path[G.n],dx=t[0]-x,dz=t[1]-z,d=Math.hypot(dx,dz);if(d>1e-6){fx=dx/d;fz=dz/d;}if(d<=step){x=t[0];z=t[1];step-=d;G.n++;}else{x+=dx/d*step;z+=dz/d*step;step=0;}}
  if(G.n>=G.path.length){const m=Math.hypot(G.face[0],G.face[1])||1;fx=G.face[0]/m;fz=G.face[1]/m;}
  p.g.position.x=x;p.g.position.z=z;p.prev=[x,z];if(fx||fz){p.face=[fx,fz];p.g.rotation.y=Math.atan2(fx,fz);}p.idleT=0;G.at=[x,z];}}
function polishBeat41(dt){const A=ADA41,r=A.run,G=A.GLOW,b=gistSave41(false);if(!b||!b.coll||r.done||adaOverlay41())return;
 // leaving (no human within 4 m of the station) pauses it with the sheen kept
 if(![0,1].some(i=>players[i]&&!adaIsAI41(i)&&adaStationNear41(i,A.STATION.away)))return;
 for(const i of [0,1]){const k=r.buf[i];if(k&&!(r.pose[i]>A.t)){if(k==='rub'&&!adaRubSlot41())continue;r.buf[i]='';if(k==='rub')polishRub41(i);else polishTurn41(i);}}
 r.glow=Math.max(0,r.glow-G.sink*dt);if(r.glow>=G.hold)r.hold+=dt;else r.hold=0;
 if(r.turns<G.turns&&(r.turns>0||r.glow>=G.turnFrom)){if(!r.turnAt)r.turnAt=A.t;}else r.turnAt=0;
 if(!r.b1&&r.glow>=G.bub1){r.b1=true;adaTrestleSays41('ad41-polish-b1',null,2600);}
 if(!r.b2&&r.glow>=G.bub2){r.b2=true;adaTrestleSays41('ad41-polish-b2',null,2000);}
 if(r.hold>=G.holdS&&r.turns>=G.turns){r.done=true;r.doneAt=A.t;polishDone41(r.last|0,false);}}
// (fix round, DOD-3) one rub per GLOW.rubS for the household: each rub takes the next slot of the household's (anyRub, GLOW.rubS after the
// last; a rub made within HOUSE.slack of its slot keeps the slot, so frame rounding neither adds nor loses a rub); a rub pressed before the
// slot is kept (one press each) and made when the slot comes. Two rubbers rise no faster than one rub every GLOW.rubS; a lone player's own
// pose (unchanged) is what binds alone
function adaRubSlot41(){const A=ADA41,r=A.run;return A.t-r.anyRub>=A.GLOW.rubS-1e-9;}
function polishRub41(i){const A=ADA41,r=A.run,G=A.GLOW;if(r.done)return;if(r.pose[i]>A.t||!adaRubSlot41()){r.buf[i]='rub';return;}r.pose[i]=A.t+G.rubS;r.lastRub[i]=A.t;r.anyRub=Math.max(r.anyRub+G.rubS,A.t-A.HOUSE.slack);r.last=i;r.glow=Math.min(1,r.glow+G.up);if(!r.rubbed.includes(i))r.rubbed.push(i);}
function polishTurn41(i){const A=ADA41,r=A.run,G=A.GLOW;if(r.done||r.turns>=G.turns)return;if(r.pose[i]>A.t){r.buf[i]='turn';return;}r.pose[i]=A.t+G.turnS;r.turns++;r.turnAt=A.t;if(!r.turned.includes(i))r.turned.push(i);}
// the beat ends (or "Leave it to Ada"): wrapped, into the hands of the player who rubbed last (or who chose); Ada's line; the hush for 2 s
function polishDone41(i,skipped,quiet){const A=ADA41,b=gistSave41(false);if(!b||!b.coll)return;const c=b.coll;A.run.walk=null;
 b.hand={id:c.id,list:c.list,for:c.for||null,name:c.name||null,base:c.base||null,model:c.model||null,wood:c.wood||null,by:i,day:S.day,polished:!skipped};b.coll=null;
 A.run.hushTo=A.t+A.STATION.hush;const st=ada41Station();A.run.hushPos=st?[st.x,st.z]:null;
 if(skipped){if(!quiet)adaTrestleSays41('ad41-polish-skip',null,2600);}else{const n=(b.once.care|0);b.once.care=n+1;adaTrestleSays41(n%2?'ad41-guarantee':'ad41-care',null,3600);adaLog41('polish');}
 try{if(typeof aff==='function'&&S.nb&&S.nb.ada)aff('ada',1);}catch(e){}A.world.topKey='~';adaSave41();adaCheck41();}
// the hush (pure): during the beat, or for STATION.hush after it ends or after "Leave it to Ada"
function adaHushed41(){const A=ADA41;return A.run.hushTo>A.t;}
function adaBar41(v){const n=Math.max(0,Math.min(5,Math.round(v*5)));return ' '+'●'.repeat(n)+'○'.repeat(5-n);}

/* ======================================================================================================================================
   7. The prompts and the acts (spec §4's table): at the station only, one at a time by state; the hush; the door; nothing for the AI player
   ====================================================================================================================================== */
// the station's prompt for player i now ({id, label, lead}) or null (pure)
function adaStationPrompt41(i){const A=ADA41,b=gistSave41(false),L=A.LEAD;if(!b)return {id:'slate41read',label:adaLine41('ui41-read'),lead:L.read};
 if(b.coll){const r=A.run,G=A.GLOW,o=1-i,po=players[o];if(r.done)return null;
  const me=A.t-r.lastRub[i]<G.rubber,other=!!po&&!adaIsAI41(o)&&A.t-r.lastRub[o]<G.rubber&&!me;
  const two=!!(po&&!adaIsAI41(o)&&adaPolishNear41(o));const lone=r.turnAt>0&&A.t-r.turnAt>=G.lone;
  const turn=r.turns<G.turns&&(r.turns>0?(!(two&&me)||lone):r.glow>=(other?G.turnFrom:G.hold));const nm=adaPieceName41(b.coll);
  return turn?{id:'ada41turn',label:adaLine41('ui41-turn')+adaBar41(r.glow),lead:L.turn}:{id:'ada41polish',label:adaText41('ui41-polish',{piece:nm})+adaBar41(r.glow),lead:L.polish};}
 const p=b.piece;
 if(p&&adaReady41(p)&&!b.hand)return {id:'ada41collect',label:p.list==='nb'&&p.for?adaText41('ui41-collect-nb',{name:adaName41(p.for),piece:adaPieceName41(p)}):adaText41('ui41-collect',{piece:adaPieceName41(p)}),lead:L.collect};
 if(p&&p.state==='wait'&&p.bring&&p.bring.got&&!p.bring.handed)return {id:'ada41hand',label:adaText41('ui41-hand',{thing:p.bring.short||p.bring.thing}),lead:L.hand};
 if(adaMsgDue41(b))return {id:'ada41msg',label:adaLine41('ui41-msg'),lead:L.msg};
 return {id:'slate41read',label:adaLine41('ui41-read'),lead:L.read};}
// Mama Nkechi's message waits to be given at the station (B's record: heard, not yet told)
function adaMsgDue41(b){return !!(b&&b.nk&&b.nk.heard&&!b.nk.told);}
function adaHot41(i,list,d){if(!list||!ADA41.on||adaOnline41())return null;const A=ADA41,p=typeof players!=='undefined'?players[i]:null;
 if(!p||adaIsAI41(i)||(p.y||0)>1||(p.g&&p.g.sitting))return null;
 if(!A.world.station&&!adaHushed41()&&!A.world.bundle[i])return null;
 const st=A.world.station?ada41Station():null;
 if(st){const dd=d(st.x,st.z),b=gistSave41(false);
  // for STATION.hush after the beat or "Leave it to Ada": "Ada is wrapping it." to everyone within 2.5 m, ahead of every prompt there (at a fixed
  // -1.3, not the spec's dist - 1.3: 1.84 m from the station and 0.7 m from Ada, dist - 1.3 lost to her talk); its act does nothing
  if(adaHushed41()){if(dd<A.STATION.hushR)list.push({id:'ada41hush',label:adaLine41('ui41-hush-wrap'),dist:adaFirst41(list,-A.LEAD.hushD)});}
  // (fix round, S4) during the beat Polish and Turn are offered at the two standing points beside the trestle, by the nearer one; a player
  // within 2.5 m of the station and not within reach of either gets "Ada is watching the polish."
  else if(b&&b.coll&&!A.run.done){const sd=adaSideDist41(st,d);const q=sd<A.STATION.sideR?adaStationPrompt41(i):null;
   if(q)list.push({id:q.id,label:q.label,dist:adaFirst41(list,adaLeads41(list,d,Math.min(sd,dd),q.lead))});else if(dd<A.STATION.hushR)list.push({id:'ada41hush',label:adaLine41('ui41-hush-watch'),dist:adaFirst41(list,-A.LEAD.hushD)});}
  else if(dd<A.STATION.reach){const q=adaStationPrompt41(i);if(q)list.push({id:q.id,label:q.label,dist:adaLeads41(list,d,dd,q.lead)});}}
 else if(adaHushed41()&&A.run.hushPos){const dd=d(A.run.hushPos[0],A.run.hushPos[1]);if(dd<A.STATION.hushR)list.push({id:'ada41hush',label:adaLine41('ui41-hush-wrap'),dist:adaFirst41(list,-A.LEAD.hushD)});}
 // the door: a flat piece carried by this player
 const b=gistSave41(false),h=b&&b.hand;
 if(h&&h.list==='flat'&&(h.by|0)===i){const D=A.VERANDA.door,dd=d(D[0],D[1]);if(dd<A.LEAD.doorR)list.push({id:'home41in',label:h.id==='plate'?adaLine41('ui41-plate'):adaText41('ui41-inside',{piece:adaPieceName41(h)}),dist:dd-A.LEAD.door});}
 // Mr. Bassey's lagoon photograph for the panel, while gifts-v41.js is not installed to ask for it
 if(!adaGiftsOn41()&&b&&b.piece&&b.piece.state==='wait'&&b.piece.bring&&b.piece.bring.from==='bassey'&&!b.piece.bring.got&&!adaInGist41()){
  const n=typeof found38Npc==='function'?found38Npc('bassey'):null;if(n){const dd=d(n.g.position.x,n.g.position.z);if(dd<A.LEAD.photoR)list.push({id:'ada41photo',label:adaLine41('ui41-photo'),dist:dd-A.LEAD.photo});}}
 return null;}
function adaGiftsOn41(){return typeof GIFT41!=='undefined'&&!!GIFT41&&!!GIFT41.on;}
// (fix round, DOD-9) the station's distance in the list: dd - lead, and ahead of Aunty Bisi's buy (already in the list: v39's hook runs before
// v41's) while the player is nearer the station's own point than her; nearer her, her buy keeps its place (v40's S1 rule, her buy first at her
// stop) (pure)
function adaLeads41(list,d,dd,lead){let v=dd-lead;try{const e=list.find(x=>x&&x.id==='bisi39buy');const g=typeof BISI39!=='undefined'&&BISI39&&BISI39.world?BISI39.world.fig:null;
 if(e&&g&&!(d(g.position.x,g.position.z)<dd)&&e.dist<=v)v=e.dist-0.001;}catch(x){}return v;}
// (repair 2, R2-2) during the beat and the hush after it, the station's prompt beats every prompt that is not v41's: the ones already in the list
// (a passing neighbour's errand or photo task, Aunty Bisi's and Mallam's buys) and those added after v41's hook (talk to a passing neighbour, the
// base's stalls and spots, at -0.4 at least; gifts-v41.js's, at -1.0 at least), so a thumb tapping the polish never opens anything else (pure)
function adaFirst41(list,v){let m=Math.min(v,-ADA41.LEAD.beat);try{for(const e of list)if(e&&typeof e.dist==='number'&&!ADA41_KINDS.includes(e.id)&&e.dist-0.001<m)m=e.dist-0.001;}catch(x){}return m;}
const ADA41_KINDS=['slate41read','ada41hand','ada41msg','ada41collect','ada41polish','ada41turn','ada41hush','home41in','ada41photo'];
function adaAct41(i,kind){if(!ADA41_KINDS.includes(kind))return false;if(adaOnline41()||adaIsAI41(i))return true;
 // (fix round, DOD-1) a press of the hush while it runs starts it again (daily-v40's hold): a thumb still tapping keeps it, and it ends
 // STATION.hush after the last tap
 if(kind==='ada41hush'){if(adaHushed41())ADA41.run.hushTo=ADA41.t+ADA41.STATION.hush;return true;}
 // (repair 2) a touch Act by the last pointer's pointerType (daily-v41.js), so a mouse click just before a key press is not a touch
 const touch=typeof dailyTouch41==='function'?dailyTouch41(i):(typeof dailyTouch40==='function'&&dailyTouch40(i)),was=adaOverlay41();
 // (repair 2, R2-1) a beat begun without the walk (after a reload) walks to the standing points at its first press
 if((kind==='ada41polish'||kind==='ada41turn')&&gistSave41(false)&&gistSave41(false).coll&&!ADA41.run.walked)adaWalkStart41();
 if(kind==='ada41polish'){if(gistSave41(false)&&gistSave41(false).coll&&adaPolishNear41(i))polishRub41(i);}
 else if(kind==='ada41turn'){if(gistSave41(false)&&gistSave41(false).coll&&adaPolishNear41(i))polishTurn41(i);}
 else if(kind==='slate41read')slateOpen41(i);
 else if(kind==='ada41hand')adaHandOver41(i);
 else if(kind==='ada41msg')adaMessage41(i);
 else if(kind==='ada41collect')collectOpen41(i);
 else if(kind==='home41in')adaIndoors41(i);
 else if(kind==='ada41photo')adaPhoto41(i);
 // a v41 panel opened by a touch Act holds its taps (daily-v40.js's hold and dimming apply to every .gist40-panel)
 try{if(touch&&!was&&typeof dailyPanel40==='function'&&dailyPanel40()&&typeof FOUND38!=='undefined')DAILY40.hold=FOUND38.t+DAILY40.HOLD;}catch(e){}
 return true;}

/* ======================================================================================================================================
   8. The slate, the order, the things to bring, the hand-over (spec §5.2–§5.5)
   ====================================================================================================================================== */
function adaSay41(id,v){return `<div class="card say gist41-say"><span class="name">Ada</span>${esc(adaText41(id,v))}</div>`;}
function adaBringLine41(B){return adaText41('ui41-bring',{thing:B.thing,place:B.from==='store'?ADA41.PLACES.store:(ADA41.PLACES[B.from]||adaName41(B.from))});}
// "a kitchen shelf", "an iroko box" (a copy's name as the slate offers it, C1)
function adaArt41(s){s=String(s||'');return (/^[aeiou]/i.test(s)?'an ':'a ')+s;}
function adaOfferHTML41(o,canPay,inCollect,keep){const isNb=o.list==='nb';const head=isNb?adaText41('ui41-nb',{piece:o.like?adaArt41(o.name):o.name,name:adaName41(o.for)}):adaText41('ui41-flat',{piece:o.name});
 const price=o.price>0?`<p class="gist41-price">${esc(adaText41('ui41-price',{price:adaNaira41(o.price),dep:adaNaira41(o.dep)}))}</p>`:'';
 const bring=o.bring?(o.bring.shells?`<p class="gist41-bring">${esc(adaLine41('ui41-bring-shells'))}</p>`:'')+`<p class="gist41-bring">${esc(adaBringLine41(o.bring))}</p>`:'';
 const b=o.order===false?'':btn(esc(adaText41('ui41-order',{dep:adaNaira41(o.dep)})),'ada41Order',{v:o.list},(keep?'block':'primary block')+' gist41-orderbtn')+(canPay?'':`<p class="small gist41-short">${esc(adaLine41('ui41-short'))}</p>`);
 return `<div class="gist41-offer gist41-offer-${o.list}"><p class="gist41-offer-head"><b>${esc(head)}</b>${o.wood?' <span class="small">('+esc(o.wood)+')</span>':''}</p>${price}${bring}${canPay?b:b.replace('<button ','<button disabled ')}</div>`;}
// the offers as the slate shows them (both lists), the flat line when the six are done, Mama Nkechi's stool
function adaOffersHTML41(b,inCollect,keep){const n=ada41Next(),out=[];const money=S.money|0;const kp=o=>!!(keep&&keep.n>0&&money>=o.dep&&money-o.dep<keep.n);
 if(n.flat)out.push(adaOfferHTML41(n.flat,money>=n.flat.dep,inCollect,kp(n.flat)));else if(b.done.flat.length+Object.keys(b.home).length>0&&ADA41.FLAT.every(f=>b.home[f.id]||b.done.flat.includes(f.id)||(b.hand&&b.hand.id===f.id)||(b.coll&&b.coll.id===f.id)))out.push(`<p class="gist41-offer">${esc(adaLine41('ui41-flat-done'))}</p>`);
 if(n.nb){if(n.nb.msg)out.push(`<p class="gist41-offer">${esc(adaLine41('ui41-nk-slate'))}</p>`);else out.push(adaOfferHTML41(n.nb,money>=n.nb.dep,inCollect,kp(n.nb)));}
 const short=[n.flat,n.nb&&!n.nb.msg?n.nb:null].some(o=>o&&kp(o));
 return {html:out.join(''),n,any:!!(n.flat||(n.nb&&!n.nb.msg)),keep:short};}
// (fix round, S2) what tonight's sellers will ask, while it is still to pay: Mallam's kept order (ordered this morning, not yet handed over)
// and Aunty Bisi's tray (her evening due, before she leaves, nothing bought from her yet): {n, why:[...]} (pure)
function adaKeep41(){const K=ADA41.KEEP,out={n:0,why:[]};
 try{if(typeof mallamRec40==='function'){const m=mallamRec40(false);if(m&&m.order&&m.kept!==S.day){out.n+=K.mallam;out.why.push('mallam');}}}catch(e){}
 try{if(typeof bisiTonight39==='function'&&typeof BISI39!=='undefined'&&BISI39&&BISI39.HOURS){const t=bisiTonight39();
  if(t.on&&S.time<BISI39.HOURS.until&&t.phase!=='out'&&!t.bought.puffpuff&&!t.bought.groundnut){out.n+=(BISI39.PRICE&&BISI39.PRICE.puffpuff)||K.bisi;out.why.push('bisi');}}}catch(e){}
 return out;}
function adaKeepLine41(k){const w=k.why.map(x=>adaLine41('ui41-keep-'+x));const what=w.length>1?adaText41('ui41-keep-and',{a:w[0],b:w[1]}):w[0];return adaText41('ui41-keep',{money:adaNaira41(k.n),what});}
function adaShort41(st){return st&&st.at==='veranda'?'ad41-short-veranda':'ad41-short-bench';}
function adaShellsBtn41(b){const p=b&&b.piece;if(!p||p.state!=='wait'||!p.bring||!p.bring.shells||p.bring.shellsGiven)return '';
 const n=typeof life34==='function'&&life34()?(life34().shells|0):0,h=btn(esc(adaLine41('ui41-shells')),'ada41Shells',{},'block gist41-shellsbtn');
 return n>=ADA41.SHELLS?h:h.replace('<button ','<button disabled ')+`<p class="small gist41-short">${esc(adaLine41('ui41-short'))}</p>`;}
function adaPanel41(cls,kicker,title,body){openPanel(`<section class="gist40-panel ${cls}"><p class="gist40-kicker">${esc(kicker)}</p><h2>${esc(title)}</h2>${body}</section>`);}
// the slate panel; the first read with layer 2 open is v41 discovery
function slateOpen41(i,extra){const A=ADA41;if(adaOverlay41()&&!extra)return;const st=ada41Station();if(!st)return;let b=gistSave41(false),first=false;
 if(!b){b=gistSave41(true);if(!b)return;first=true;adaLog41('read');adaSave41();}
 A.panel={kind:'slate',step:0,i,order:null};const p=b.piece,parts=[];
 parts.push(`<div class="gist41-slate-board"><p>${esc(adaLine41('ad41-slate-head'))}</p></div>`);
 if(extra)parts.push(extra);
 else if(p){const nm=adaPieceName41(p);
  if(adaReady41(p))parts.push(`<p class="gist41-open">${esc(adaText41('ui41-open-ready',{piece:nm}))}</p>`);
  else if(p.state==='cut')parts.push(`<p class="gist41-open">${esc(adaText41('ui41-open-cut',{piece:nm}))}</p>`);
  // (repair 2, R2-3) the glass handed over and only the shells owed: the slate waits for the shells
  else{const B=p.bring,owed=!!(B&&B.handed&&B.shells&&!B.shellsGiven);parts.push(`<p class="gist41-open">${esc(adaText41('ui41-open-wait',{piece:nm,thing:owed?adaLine41('ui41-shells-owed'):B?(B.short||B.thing):''}))}</p>`);}
  const n=ada41Next();if(n.nb&&n.nb.msg)parts.push(`<p class="gist41-offer">${esc(adaLine41('ui41-nk-next'))}</p>`);
  parts.push(adaShellsBtn41(b));parts.push(adaSay41('ad41-one'));}
 else{const o=adaOffersHTML41(b,false);parts.push(`<div class="gist41-offers">${o.html}</div>`);
  const wall=o.n.flat&&adaFlatDef41(o.n.flat.id)&&adaFlatDef41(o.n.flat.id).wall;
  parts.push(adaSay41(first?'ad41-slate-first':(wall&&(hash38(S.day,410)&1)?'ad41-wall':'ad41-person')));
  if(o.any&&[o.n.flat,o.n.nb].filter(x=>x&&!x.msg).every(x=>(S.money|0)<x.dep))parts.push(adaSay41(adaShort41(st)));}
 parts.push(`<div class="actions gist41-actions">${btn(esc(adaLine41('ui41-back')),'ada41Close',{},'quiet gist41-back')}</div>`);
 adaPanel41('gist41-slate',adaLine41('ui41-kicker'),adaLine41('ui41-title'),parts.join(''));}
// the order (spec §5.3): the deposit through spend(); the piece waits for its thing; Ada's terms, the wood, her ask
function orderPiece41(list){const b=gistSave41(false);if(!b||b.piece)return null;const n=ada41Next(),o=list==='nb'?n.nb:n.flat;if(!o||o.msg)return null;
 if(!((S.money|0)>=o.dep))return null;try{spend(o.dep);}catch(e){return null;}
 const B=o.bring?Object.assign({},o.bring):null;if(B){B.got=false;B.handed=false;if(B.shells)B.shellsGiven=false;if(B.from==='store')B.got=S.day;}
 const st=ada41Station();
 b.piece={id:o.id,list:o.list,for:o.for||null,name:o.list==='nb'?(o.name||null):null,base:o.list==='nb'?(o.base||null):null,model:o.model||null,wood:o.wood||null,scale:o.scale||null,price:o.price|0,dep:o.dep|0,bal:Math.max(0,(o.price|0)-(o.dep|0)),
  state:'wait',cutDay:null,paid:false,polished:false,oil:0,bring:B,at:st?st.at:null,orderDay:S.day};
 if(o.list==='nb'&&typeof o.onOrder==='function')try{o.onOrder();}catch(e){}
 adaLog41('order '+o.id);adaSave41();return b.piece;}
function adaTermsHTML41(p){const parts=[adaSay41(p.list==='nb'?'ad41-gift-pick':'ad41-terms')];const w=p.wood||(adaFlatDef41(p.id)||{}).wood;if(w&&adaLine41('ad41-wood-'+w))parts.push(adaSay41('ad41-wood-'+w));
 const B=p.bring;if(B){let ask=B.ask||'ad41-bring-like';if(B.shells&&ask==='ad41-bring-mirror'){const n=typeof life34==='function'&&life34()?(life34().shells|0):0;if(n<ADA41.SHELLS)ask='ad41-bring-mirror-few';}parts.push(adaSay41(ask));}
 const b=gistSave41(false);parts.push(adaShellsBtn41(b));return parts.join('');}
// the shells from the household's own store (the one base field v41 writes): three, once, by the button
function adaShells41(){const b=gistSave41(false),p=b&&b.piece;if(!p||p.state!=='wait'||!p.bring||!p.bring.shells||p.bring.shellsGiven)return false;const l=typeof life34==='function'?life34():null;
 if(!l||(l.shells|0)<ADA41.SHELLS)return false;l.shells=(l.shells|0)-ADA41.SHELLS;p.bring.shellsGiven=S.day;adaToast41(adaLine41('gf41-shells-give'));adaLog41('bring shells');adaCutIfReady41(p);adaSave41();return true;}
// cut once everything is handed over (the thing, and the shells where they are asked)
function adaCutIfReady41(p){if(!p||p.state!=='wait'||!p.bring)return false;const B=p.bring;if(!B.handed)return false;if(B.shells&&!B.shellsGiven)return false;p.state='cut';p.cutDay=S.day;adaLog41('cut '+p.id);return true;}
// "Hand Ada the {thing}" at the station: the thing handed over; cut tonight when nothing else is owed
function adaHandOver41(i){const b=gistSave41(false),p=b&&b.piece;if(!p||p.state!=='wait'||!p.bring||!p.bring.got||p.bring.handed||!adaStationNear41(i,ADA41.STATION.reach))return;
 p.bring.handed=S.day;adaLog41('bring '+p.bring.kind);const cut=adaCutIfReady41(p);adaSave41();
 const st=ada41Station();const owed=!!(p.bring.shells&&!p.bring.shellsGiven);
 const body=cut?adaSay41('ad41-bring-got')+adaSay41('ad41-night'):adaSay41(owed?'ad41-bring-glass-got':'ad41-bring-got')+adaShellsBtn41(b);
 ADA41.panel={kind:'hand',step:0,i,order:null};
 adaPanel41('gist41-hand',adaKicker41(st),adaUp41(adaPieceName41(p)),body+`<div class="actions gist41-actions">${btn(esc(adaLine41('ui41-back')),'ada41Close',{},'quiet gist41-back')}</div>`);}
// Mama Nkechi's message given at the station: her stool cut tonight when the bench is free, else next (B's record; no money)
function adaMessage41(i){const b=gistSave41(false);if(!adaMsgDue41(b)||!adaStationNear41(i,ADA41.STATION.reach))return;b.nk.told=S.day;adaLog41('message');
 const free=!b.piece;if(free)adaStoolOn41(b);adaSave41();ADA41.panel={kind:'msg',step:0,i,order:null};
 adaPanel41('gist41-hand',adaKicker41(ada41Station()),adaName41('nkechi'),adaSay41('ad41-nk-msg')+(free?adaSay41('ad41-night'):`<p class="gist41-offer">${esc(adaLine41('ui41-nk-next'))}</p>`)+`<div class="actions gist41-actions">${btn(esc(adaLine41('ui41-back')),'ada41Close',{},'quiet gist41-back')}</div>`);}
// her stool on the bench: no deposit, no balance; its thing (the message) given, so it is cut that evening
function adaStoolOn41(b){if(b.piece||!b.nk||!b.nk.told)return false;if(b.once.nkStool)return false;b.once.nkStool=S.day;
 b.piece={id:'nkstool',list:'nb',for:'nkechi',name:'counter stool',model:'stool',wood:'iroko',scale:null,price:0,dep:0,bal:0,state:'cut',cutDay:S.day,paid:false,polished:false,oil:0,bring:{kind:'message',thing:'Mama Nkechi’s message',from:'nkechi',got:b.nk.told,handed:S.day},at:null,orderDay:S.day};
 adaLog41('cut nkstool');return true;}
// the lagoon photograph from Mr. Bassey (only while gifts-v41.js is not installed; B's ask takes its place when it is)
function adaPhoto41(i){if(adaGiftsOn41())return;const b=gistSave41(false),p=b&&b.piece;if(!p||p.state!=='wait'||!p.bring||p.bring.from!=='bassey'||p.bring.got)return;
 const n=found38Npc('bassey');if(!n)return;ada41Got(p.bring.kind);bubble41(adaLine41('gf41-ba-lagoon'),4200,n.g,2.1);}

/* ======================================================================================================================================
   9. The collection (spec §5.6): in steps; the hold re-armed on every step; no money button where the last one was
   ====================================================================================================================================== */
function adaRearm41(){try{if(typeof DAILY40!=='undefined'&&DAILY40&&DAILY40.on&&typeof FOUND38!=='undefined')DAILY40.hold=FOUND38.t+DAILY40.HOLD;}catch(e){}}
function collectOpen41(i){if(adaOverlay41())return;const b=gistSave41(false),p=b&&b.piece;if(!p||!adaReady41(p)||b.hand||b.coll||!adaStationNear41(i,ADA41.STATION.reach))return;
 ADA41.panel={kind:'collect',step:1,i,order:null};collectRender41(false);adaAlign41();}
function collectRender41(rearm){const A=ADA41,P=A.panel,b=gistSave41(false);if(!b)return;const st=ada41Station(),ver=st&&st.at==='veranda';
 const back=label=>btn(esc(label),'ada41Close',{},'quiet gist41-back');let body='',title='';
 if(P.step===1){const p=b.piece;if(!p)return;title=adaTitle41(p);const short=p.bal>0&&!((S.money|0)>=p.bal);
  body=adaSay41(ver&&!P.said?'ad41-brought':'ad41-ready');
  if(short){body+=adaSay41(ver?'ad41-short-collect-v':'ad41-short-collect');p.short=S.day;A.world.topKey='~';
   body+=`<div class="actions gist41-steps">${back(adaLine41('ui41-back'))}</div>`;}
  else body+=`<div class="actions gist41-steps">${back(adaLine41('ui41-back'))}${btn(esc(p.bal>0?adaText41('ui41-pay',{bal:adaNaira41(p.bal)}):adaLine41('ui41-take')),'ada41Pay',{},'primary gist41-paybtn')}</div>`;}
 else if(P.step===2){const c=b.coll;title=adaTitle41(c);const k=adaKeep41(),o=adaOffersHTML41(b,true,k);
  // (fix round, S2) a deposit that would leave the purse short of tonight's sellers: said plainly, and "Later" the default (the primary button)
  const warn=o.keep?`<p class="gist41-keep">${esc(adaKeepLine41(k))}</p>`:'';
  // (fix round, DOD-2 and S3) "Later" takes the row where "Pay the rest" was, and the offers sit below that row, at every width
  body=`<div class="gist41-head">${adaSay41('ad41-next')}${warn}</div><div class="actions gist41-steps"><span class="gist41-gap"></span>${btn(esc(adaLine41('ui41-later')),'ada41Later',{},(o.keep?'primary ':'')+'gist41-laterbtn')}</div><div class="gist41-next gist41-offers">${o.html}</div>`;}
 else{const c=b.coll;if(!c)return;title=adaTitle41(c);
  body=adaSay41('ad41-polish')+(c.list==='nb'?adaSay41('ad41-polish-gift',{name:adaName41(c.for)}):adaSay41('ad41-polish-own'))+`<div class="actions gist41-steps">${btn(esc(adaLine41('ui41-leave')),'ada41Leave',{},'quiet gist41-leavebtn')}${btn(esc(adaLine41('ui41-polish-btn')),'ada41Polish',{},'primary gist41-polishbtn')}</div>`+(P.order?adaOrderedHTML41(P.order):'');}
 adaPanel41('gist41-collect gist41-step'+P.step,adaKicker41(st),title,body);if(rearm)adaRearm41();}
// (repair 2) the hand-over's and the collection's kicker: the bench at the Yard, the veranda at the veranda station
function adaKicker41(st){return adaLine41(st&&st.at==='veranda'?'ui41-kicker-v':'ui41-kicker-c');}
// (fix round, DOD-2 and S3) the collection panel is held to the top of the screen (ada-v41.css), so a step's rows stay put between steps. Step 1
// records where its button row is; step 2 pads Ada's line until "Later"'s row is no higher than that, and pads the offers until they start
// below it, so no Order button can sit where "Pay the rest" was, at any width or panel height. A browser measures; Node has no layout (no-op).
function adaAlign41(){const P=ADA41.panel;try{if(typeof document==='undefined'||!document||typeof document.querySelector!=='function')return;
 const sec=document.querySelector('#panel .gist41-collect'),row=sec&&sec.querySelector('.gist41-steps');if(!sec||!row||typeof row.getBoundingClientRect!=='function')return;
 const s0=sec.getBoundingClientRect().top,r=row.getBoundingClientRect();if(!(r.height>0))return;
 if(P.step===1){P.rowTop=r.top-s0;P.rowBot=r.bottom-s0;return;}
 if(P.step!==2||typeof P.rowTop!=='number')return;const h=sec.querySelector('.gist41-head'),o=sec.querySelector('.gist41-offers');
 if(h&&r.top-s0<P.rowTop-0.5)h.style.paddingBottom=Math.ceil(P.rowTop-(r.top-s0))+'px';
 if(o){const t=o.getBoundingClientRect().top-s0;if(t<P.rowBot+6)o.style.marginTop=Math.ceil(P.rowBot+6-t)+'px';}}catch(e){}}
// (fix round, S8) a piece just ordered, in its own card with its own heading: Ada's terms, the wood, her ask and the shells button
function adaOrderedHTML41(p){const h=p.list==='nb'&&p.for?adaText41('ui41-ordered-nb',{piece:adaPieceName41(p),name:adaName41(p.for)}):adaText41('ui41-ordered',{piece:adaPieceName41(p)});
 return `<div class="gist41-ordered gist41-ordered-${p.list==='nb'?'nb':'flat'}"><p class="gist41-ordered-head"><b>${esc(h)}</b></p>${adaTermsHTML41(p)}</div>`;}
// the collection's title: the household's own piece, or a neighbour's by the neighbour's name (C2)
function adaTitle41(p){return p&&p.list==='nb'&&p.for?adaText41('ui41-title-nb',{name:adaName41(p.for),piece:adaPieceName41(p)}):adaText41('ui41-title-c',{piece:adaPieceName41(p)});}
function adaCollectStep41(step){const P=ADA41.panel;P.step=step;P.said=true;collectRender41(true);adaAlign41();}
// the rest paid: the piece leaves the bench for the trestle's polish (coll); the next can be chosen
function adaPay41(){const A=ADA41,P=A.panel,b=gistSave41(false),p=b&&b.piece;if(P.kind!=='collect'||P.step!==1||!p||!adaReady41(p)||b.coll)return;
 if(p.bal>0){if(!((S.money|0)>=p.bal))return;try{spend(p.bal);}catch(e){return;}}
 const st=ada41Station();p.paid=true;p.state='ready';delete p.short;
 b.coll={id:p.id,list:p.list,for:p.for||null,name:p.name||null,base:p.base||null,model:p.model||null,wood:p.wood||null,scale:p.scale||null,price:p.price,paid:S.day,at:st?st.at:null};b.piece=null;
 if(!Array.isArray(b.once.collected))b.once.collected=[];b.once.collected.push({id:p.id,list:p.list,for:p.for||null,day:S.day,at:st?st.at:null,time:Math.round(S.time*1e4)/1e4});
 b.once.collected=b.once.collected.filter(r=>r.day>S.day-28);
 adaLog41('collect '+p.id);
 // Mama Nkechi's stool joins the bench now if her message is waiting for a free bench
 adaStoolOn41(b);adaSave41();A.world.topKey='~';
 const o=ada41Next();adaCollectStep41(b.piece||!(o.flat||(o.nb&&!o.nb.msg))?3:2);}
function adaLater41(){const P=ADA41.panel,b=gistSave41(false);if(P.kind!=='collect'||P.step!==2||!b)return;b.later=S.day;adaSave41();adaCollectStep41(3);}
function adaOrderNow41(list){const A=ADA41,P=A.panel;const p=orderPiece41(list);if(!p)return;
 if(P.kind==='collect'&&P.step===2){P.order=p;adaCollectStep41(3);return;}
 // ordered from the slate: the terms and the ask, then Back
 P.order=p;slateOpen41(P.i,adaOrderedHTML41(p));}

/* ======================================================================================================================================
   10. Carrying and taking a piece indoors (spec §5.8); the shop blocks (spec §5.5)
   ====================================================================================================================================== */
function adaIndoors41(i){const b=gistSave41(false),h=b&&b.hand;if(!h||h.list!=='flat'||(h.by|0)!==i)return;const D=ADA41.VERANDA.door,p=players[i].g.position;if(Math.hypot(p.x-D[0],p.z-D[1])>=ADA41.LEAD.doorR)return;
 const f=adaFlatDef41(h.id);b.home[h.id]=S.day;if(!b.done.flat.includes(h.id))b.done.flat.push(h.id);b.hand=null;adaDropBundle41();
 let where=f?f.where:'';if(h.id==='box'&&!(S.home&&Array.isArray(S.home.items)&&S.home.items.some(x=>x.type==='fridge')))where=adaLine41('ui41-where-wait');
 // (repair 2) "under the mirror" only while the shells mirror hangs over the fridge where it stands
 else if(h.id==='box'&&!adaBoxUnder41(b))where=adaLine41('ui41-where-fridge');
 adaToast41(h.id==='plate'?adaLine41('gf41-plate-toast'):adaText41('gf41-home-toast',{piece:adaPieceName41(h),where}));adaLog41('home '+h.id);
 const n=Object.keys(b.home).length;try{if(typeof remember==='function'){if(n===1&&!b.once.memFirst){b.once.memFirst=S.day;remember(adaLine41('ui41-first'),'moment');}if(n>=6&&!b.once.memSix){b.once.memSix=S.day;remember(adaLine41('ui41-six'),'moment');}}}catch(e){}
 try{if(typeof rebuildFurniture==='function')rebuildFurniture();}catch(e){}adaFrame41(i,h.id);adaSave41();}
// (repair 2) the shells mirror is home and hangs over the fridge (its middle within 0.6 m of the fridge's in x) (pure)
function adaBoxUnder41(b){try{if(!b||!b.home||!b.home.mirror)return false;const it=S.home.items.find(x=>x.type==='fridge');if(!it||typeof cellToWorld!=='function')return false;const [cx]=cellToWorld(it.x,it.y);return Math.abs(cx-ADA41.HOME.mirror[0])<0.6;}catch(e){return false;}}
// (fix round, S9) the piece just taken in joins the interaction points of the camera of the player who took it in (and of the other player's,
// when they are near the door) for ADA41.FRAME.s seconds, so the camera eases out to show it and then back; the cameras keep no saved state
function adaFrame41(i,id){const A=ADA41;A.frame=null;try{const m=A.world.home.find(o=>o.name==='ada41_'+id);if(!m)return;const bb=new THREE.Box3().setFromObject(m),c=bb.getCenter(new THREE.Vector3());
 const D=A.VERANDA.door,o=players[1-i];A.frame={i,both:!!(o&&Math.hypot(o.g.position.x-D[0],o.g.position.z-D[1])<A.FRAME.near),until:A.t+A.FRAME.s,p:[c.x,c.y,c.z],h:Math.max(0.05,(bb.max.y-bb.min.y)/2)};}catch(e){A.frame=null;}}
// what the open piece wants from a shop now: the Finds page or Dayo's stall ('finds' | 'dayo'), or null (pure)
function adaShopWant41(from){const p=(gistSave41(false)||{}).piece;if(!p||p.state!=='wait'||!p.bring||p.bring.got||p.bring.from!==from||adaOnline41())return null;return p;}
function shopBlock41(from,canBuy){const p=adaShopWant41(from);if(!p)return '';const B=p.bring;
 const head=adaText41('ui41-shop',{piece:adaPieceName41(p),thing:B.thing,price:adaNaira41(B.cost|0)});
 const can=canBuy&&(S.money|0)>=(B.cost|0);
 return `<div class="life-note34 gist41-shop" data-shop41="${esc(from)}"><b>${esc(head)}</b>${canBuy?(can?btn(esc(adaLine41('ui41-buy')),'ada41Buy',{v:from},'primary gist41-buybtn'):btn(esc(adaLine41('ui41-buy')),'ada41Buy',{v:from},'primary gist41-buybtn').replace('<button ','<button disabled ')+`<p class="small">${esc(adaLine41('ui41-short'))}</p>`):`<p class="small">${esc(adaLine41('ui41-shop-go'))}</p>`}</div>`;}
function adaBuy41(from){const p=adaShopWant41(from);if(!p)return false;if(from==='finds'&&typeof market34==='function'&&!market34())return false;const c=p.bring.cost|0;if(!((S.money|0)>=c))return false;
 try{spend(c);}catch(e){return false;}p.bring.got=S.day;adaLog41('bring '+p.bring.kind);adaToast41(adaText41('ui41-got',{Thing:adaUp41(p.bring.thing)}));adaSave41();return true;}

/* ======================================================================================================================================
   11. The actions, the wrappers and the hooks (spec §1.4, §1.5): every one inside the guard
   ====================================================================================================================================== */
function adaFlags41(){const F=ADA41.flags;if(F.parsed)return F;
 try{const q=new URLSearchParams((typeof location!=='undefined'&&location.search)||'');const a=q.get('ada');if(!a)return F;F.parsed=true;if(a==='now')F.now=-1;if(a==='ready')F.ready=-1;
  try{if(typeof sessionStorage!=='undefined')sessionStorage.setItem('gist41.flag.ada-'+a,'1');}catch(e){}
  q.delete('ada');try{if(typeof history!=='undefined'&&history.replaceState){const s=q.toString();history.replaceState(null,'',location.pathname+(s?'?'+s:'')+(location.hash||''));}}catch(e){}}catch(e){}
 return F;}
if(ADA41.on&&typeof ACTIONS!=='undefined'){
 ACTIONS.ada41Slate=function(){const P=ADA41.panel;slateOpen41(P.i|0);};
 ACTIONS.ada41Order=function(d){const v=d&&d.v;if(v!=='flat'&&v!=='nb')return;adaOrderNow41(v);};
 ACTIONS.ada41Pay=function(){adaPay41();};
 ACTIONS.ada41Later=function(){adaLater41();};
 ACTIONS.ada41Polish=function(){const P=ADA41.panel;if(P.kind!=='collect'||P.step!==3)return;P.kind='';try{closePanel();}catch(e){}try{adaWalkStart41();}catch(e){}};
 ACTIONS.ada41Leave=function(){const P=ADA41.panel,b=gistSave41(false);if(P.kind!=='collect'||P.step!==3||!b||!b.coll)return;P.kind='';try{closePanel();}catch(e){}ADA41.run.done=true;polishDone41(P.i|0,true);};
 ACTIONS.ada41Shells=function(){if(!adaShells41())return;const P=ADA41.panel;if(P.kind==='collect'&&P.step===3)collectRender41(true);else if(adaOverlay41()&&P.kind==='slate')slateOpen41(P.i|0,P.order?adaTermsHTML41(gistSave41(false).piece||P.order):null);else if(adaOverlay41())slateOpen41(P.i|0);};
 ACTIONS.ada41Buy=function(d){const v=d&&d.v;if(v!=='finds'&&v!=='dayo')return;if(!adaBuy41(v))return;
  if(v==='finds'){try{if(typeof openLife34==='function')openLife34('market');}catch(e){}}else{try{const st=typeof STALLS!=='undefined'?STALLS.find(s=>s.id==='s8'):null;if(st)openStall(ADA41.panel.shopI|0,st);}catch(e){}}};
 ACTIONS.ada41Ask=function(){};
 ACTIONS.ada41Close=function(){ADA41.panel.kind='';try{closePanel();}catch(e){}adaSave41();};
 if(typeof LOCAL_ONLY!=='undefined')for(const n of ['ada41Slate','ada41Order','ada41Pay','ada41Polish','ada41Leave','ada41Later','ada41Ask','ada41Buy','ada41Shells','ada41Close'])LOCAL_ONLY.add(n);}
// the station, the piece and the polish run after v40's steps (outermost after daily-v40's)
if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.tick==='function'&&typeof DAILY40!=='undefined'&&DAILY40&&DAILY40.on&&ADA41.on){
 const prevEveTick41a=EVENING35.tick;EVENING35.tick=function(dt){const r=prevEveTick41a.apply(this,arguments);
  try{ADA41.step(dt);}catch(e){if(typeof console!=='undefined')console.warn('ada41',e);}return r;};}
if(ADA41.on&&typeof HOTSPOT_HOOKS!=='undefined')HOTSPOT_HOOKS.push(adaHot41);
if(ADA41.on&&typeof ACT_HOOKS!=='undefined')ACT_HOOKS.push(function(i,kind,arg){return adaAct41(i,kind,arg);});
if(ADA41.on&&typeof LOG35!=='undefined'&&LOG35&&Array.isArray(LOG35.kinds)&&!LOG35.kinds.includes('commission'))LOG35.kinds.push('commission');
// the Finds page: one block for the thing Ada waits for, above the cards (never on the catch card)
if(ADA41.on&&typeof openLifePanel34==='function'){const prevLifePanel41=openLifePanel34;openLifePanel34=function(content,tab){
 try{if(tab==='market'&&typeof content==='string'&&adaShopWant41('finds')){const blk=shopBlock41('finds',typeof market34==='function'?market34():true);const at=content.indexOf('<div class="life-chips34">');
   if(blk&&at>=0)content=content.slice(0,at)+blk+content.slice(at);}}catch(e){if(typeof console!=='undefined')console.warn('ada41 finds',e);}
 return prevLifePanel41.apply(this,[content,tab].concat([].slice.call(arguments,2)));};}
// Dayo's stall (s8): the same block above his four fabrics while the lining cloth is wanted
if(ADA41.on&&typeof openStall==='function'){const prevStall41=openStall;openStall=function(i,st){
 if(!(st&&st.id==='s8'&&adaShopWant41('dayo')))return prevStall41.apply(this,arguments);ADA41.panel.shopI=i|0;
 const o=openPanel;openPanel=function(h){try{const blk=shopBlock41('dayo',true);const at=String(h).indexOf('</h2>');if(blk&&at>=0)h=h.slice(0,at+5)+blk+h.slice(at+5);}catch(e){}return o.apply(this,[h]);};
 try{return prevStall41.apply(this,arguments);}finally{openPanel=o;}};}
// the flat: Ada's pieces in their places after the base and every earlier wrapper have built it
// (fix round, S9) the framing (adaFrame41): two points, the piece's top and bottom, added to that camera's points while it runs
if(ADA41.on&&typeof v21InteractionPoints==='function'){const prevPts41=v21InteractionPoints;v21InteractionPoints=function(i,joint){const pts=prevPts41.apply(this,arguments);
 try{const F=ADA41.frame;if(F&&ADA41.t<F.until&&Array.isArray(pts)&&(i===F.i||F.both)&&!adaOnline41())pts.push(new THREE.Vector3(F.p[0],F.p[1]-F.h,F.p[2]),new THREE.Vector3(F.p[0],F.p[1]+F.h,F.p[2]));}catch(e){}return pts;};}
if(ADA41.on&&typeof rebuildFurniture==='function'){const prevRebuild41=rebuildFurniture;rebuildFurniture=function(){const r=prevRebuild41.apply(this,arguments);
 try{if(gistSave41(false))homePieces41();else if(ADA41.world.home.length)ADA41.world.home.length=0;}catch(e){if(typeof console!=='undefined')console.warn('ada41 home',e);}return r;};}
// the morning: a cut piece is ready; the beat and the bubbles reset
if(ADA41.on&&typeof ACTIONS!=='undefined'&&typeof ACTIONS.nextday==='function'){const prevNextday41a=ACTIONS.nextday;ACTIONS.nextday=function(){
 try{adaBubblesOff41();adaRunReset41();ADA41.run.hushTo=-9;}catch(e){}const r=prevNextday41a.apply(this,arguments);
 try{const b=gistSave41(false),p=b&&b.piece;if(p&&p.state==='cut'&&typeof p.cutDay==='number'&&S.day>p.cutDay)p.state='ready';if(ADA41.flags.now&&ADA41.flags.now<S.day)ADA41.flags.now=0;ADA41.checkAt=0;}catch(e){}return r;};}
if(ADA41.on)adaFlags41();
if(ADA41.on&&typeof enterWorld==='function'){const prevEnter41a=enterWorld;enterWorld=function(){try{adaFlags41();adaTeardown41();ADA41.panel.kind='';}catch(e){}
 const r=prevEnter41a.apply(this,arguments);
 try{const F=ADA41.flags;if(F.now===-1&&S&&S.p)F.now=S.day;if(F.ready===-1&&S&&S.p){const b=gistSave41(false),p=b&&b.piece;if(p&&p.state==='cut'){p.cutDay=S.day-1;p.state='ready';}F.ready=0;}ADA41.checkAt=0;}catch(e){}return r;};}
// only the confirmed new household ("Yes, new household" dispatches newgame): the question itself changes nothing
if(ADA41.on&&typeof ACTIONS!=='undefined'){const prev=ACTIONS.newgame;if(typeof prev==='function')ACTIONS.newgame=function(){try{adaTeardown41();ADA41.panel.kind='';}catch(e){}return prev.apply(this,arguments);};}

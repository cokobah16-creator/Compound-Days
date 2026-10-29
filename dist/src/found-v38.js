/* v38 Evening gist and daily finds: the finds (engineer A; gist/SPEC.md §1, §7–§11 and column A of §18.1).
   From midday on day 3 a lost thing lies somewhere in the compound with a soft glint over it: seven in all, one at a time, from five
   neighbours. Pick it up, carry it in your pocket, give it back to its owner for their thanks and, the first time, a keepsake. After the
   first find (or the first evening gist, gist-v38.js) the morning shells have kinds, every third afternoon the high water leaves three
   shells at the water's edge (one a cowrie), Ada will put up a shelf on the back wall for ₦5,000 for the wood, and she carves the fish you
   bring her (owner decision 2: a gift; FOUND38.CARVE_PRICE). Once a day she names one fish she has not carved, in the gist the evening before
   or in her talk that day; it bites only in the early afternoon (12:30 to 15:30; the catfish after six), so the errand falls in the middle of
   the day. Keep it for her from the catch card, give it to her, and the carving is on the shelf's top plank the next morning. The shelf
   shows the keepsakes, the shell kinds and the carvings; each completed set is an album memory. A glint in reach but out of view shows as a
   small star at the edge of that view; a panel opened by a touch Act ignores the click its own release makes.
   Inert until a trigger (§1.3): before discovery nothing is saved, logged, toasted or shown on Today; the only change is the first lost
   thing's mesh, glint and prompt in the world from 12:00 on day 3 or later. No TICK_HOOKS entry (the step rides EVENING35.tick by property,
   inside a typeof guard), no cue subscriber, no LINES35/WHEN35/DAYS35.rows/FINDS34 change, no collider, no Math.random call (every three.js
   construction runs inside quiet38), no wall clock (FOUND38.t is the sum of the frame steps). Online it is all off.
   Loaded after football-v37.js and before gist-v38.js. Every change wraps an earlier global and calls it. Top-level names end in 38; the
   wrapper bindings live inside blocks. Owner-facing choices are the named constants in FOUND38 (PRICE, CARVE_PRICE, CARVE_KEEP_UNTIL). */
'use strict';

/* ======================================================================================================================================
   1. Constants and state (spec §1.6, §7.1, §8.1, §9.2). Every coordinate below passed the spot rules of §4 (check 2 re-probes them).
   ====================================================================================================================================== */
const FOUND38={v:1,t:0,checkAt:0,
 LOST_AT:12,CHAIN_UNTIL:15.5,PICK:1.3,GIVE:1.8,
 // the give prompt's lead: within GIVE of the owner it beats "Talk to …" (−0.4) and the shop counter's prompt that Mama Nkechi stands 0.94 m behind
 GIVE_LEAD:1.2,
 // the ground's top where a spot gives no height of its own (the sand and the streets; the promenade's paving is 0.085 m, written on its spots)
 GROUND:0.012,
 // the pick prompt's lead: the household ball rests 0.61 m from the glasses, so the thing wins unless the ball is clearly nearer
 PICK_LEAD:0.45,
 // metres; the sprite's size scales with the camera distance (v21Dist[0] over the landscape fit, 7.4 m)
 GLINT:{far:5,near:3,first:8,stale:9,period:1.2,lo:0.25,hi:0.9,size:0.7,camRef:7.4,y:0.25},
 WASH:{every:3,first:2,from:13.5,to:15.5,fade:2},
 PRICE:{shelf:5000},                              // owner decision 3: the shelf costs ₦5,000 for Ada's wood
 CARVE_PRICE:0,                                   // owner decision 2: Ada's carvings are her gift (the owner may set 1500 later)
 CARVE_KEEP_UNTIL:18,                             // a fish kept for Ada lasts until the next evening: 18:00 the day after it was kept
 // the shelf (spec §9.2, moved in the browser check §17.1.4): the back wall over the sofa carries the household's painted sign "Same roof, bigger
 // dreams" (x -6.3 to -4.3, 1.45 to 2.45 m), the wall over the stove its kitchen shelf (1.75 m) and the west wall two windows (1.6 to 2.6 m),
 // so the shelf goes over the mattress (columns 0-1), 1.4 m wide, above the intercom, the switch plate (1.85 m) and anything hung there (wall
 // pieces reach 1.87 m). Re-planned by the fixer so that all three sets sit below the top bar on the default desk camera at 1280 x 800 for a
 // player standing in front of it at the mattress: a small shelf unit with two side boards and no brackets (their feet 0.02 m under the
 // lowest plank, at 1.89 m), the shells (drawn at SHELL_SCALE) at 1.91 m, the keepsakes (at KEEP_SCALE) at 2.07 m and Ada's carvings (at
 // CARVE_SCALE) at 2.27 m; the carvings' top is at 2.37 m (it was 2.73 m, under the bar)
 SHELF:{w:1.4,tiers:[1.91,2.07,2.27],depth:0.16,z:2.09,x:-7.1,cols:[0,1],foot:0.02,side:0.025,KEEP_SCALE:0.75,SHELL_SCALE:0.9,CARVE_SCALE:0.85},
 LOST:[
  {id:'glasses',owner:'nkechi',name:'glasses',long:'reading glasses on a beaded chain',area:'the waterfront sand by the bench',say:'On the waterfront sand by the bench',first:true,ownerKnown:true,
   spots:[[0.6,13.4,0.085]],pickLabel:'reading glasses',
   pickToast:'Reading glasses on a beaded chain. Mama Nkechi wears a chain like that.',giveLabel:'Give Mama Nkechi her glasses'},
  {id:'chisel',owner:'ada',name:'chisel',long:'a small chisel',area:'near the rocks',say:'Somewhere near the rocks',ownerKnown:false,
   spots:[[9.6,13.2],[8.6,13.2],[10.4,12.6],[8.8,12.2],[11.2,12.0]],pickLabel:'a small chisel',
   pickToast:'A small chisel, worn smooth at the handle. Somebody will be missing this.',pickToastKnown:'A small chisel, worn smooth at the handle. Ada’s, surely.',giveLabel:'Give Ada her chisel'},
  {id:'adapter',owner:'tunde',name:'adapter',long:'a small black audio adapter',area:'by the square’s stage',say:'Over by the stage in the square',ownerKnown:true,
   spots:[[-15.1,3.3],[-14.5,4.1],[-14.1,3.1],[-15.1,2.3],[-15.1,4.9]],pickLabel:'a small black plug',
   pickToast:'A small black plug with a long tail of wire. Tunde would know.',giveLabel:'Give Tunde his adapter'},
  {id:'lenscap',owner:'bassey',name:'lens cap',long:'a camera lens cap',area:'the waterfront, east of the photo spot',say:'Somewhere past where Mr. Bassey takes his pictures',ownerKnown:false,
   spots:[[6.2,12.7,0.085],[7.2,12.8,0.085],[7.9,12.1,0.085],[6.9,11.3]],pickLabel:'a lens cap',
   pickToast:'A camera lens cap, half buried in the sand.',giveLabel:'Give Mr. Bassey his lens cap'},
  {id:'wrapper',owner:'oyelaran',name:'wrapper',long:'a blue wrapper off the line',area:'the street, west of the gate',say:'Out in the street by the gate',ownerKnown:false,
   spots:[[0.6,8.8],[-0.4,8.8],[0.6,9.8],[1.6,8.8]],pickLabel:'a blue wrapper',
   pickToast:'A blue wrapper, caught on a post. It smells of somebody’s soap.',giveLabel:'Give Mrs. Oyelaran her wrapper'},
  {id:'rule',owner:'ada',name:'folding rule',long:'a folding rule',area:'Market Road, between the stalls',say:'Somewhere on Market Road',ownerKnown:true,
   spots:[[21.9,0.1],[22.9,0.1],[20.9,-0.1],[21.9,1.1],[20.9,0.9]],pickLabel:'a folding rule',
   pickToast:'A folding rule with Ada’s mark scratched on it.',giveLabel:'Give Ada her folding rule'},
  {id:'seeds',owner:'tunde',name:'seeds',long:'a packet of scent-leaf seed',area:'by the square’s garden bed',say:'By the garden in the square',ownerKnown:false,
   spots:[[-22.0,-6.6],[-23.0,-6.6],[-21.0,-6.6],[-24.0,-6.6],[-20.0,-6.6]],pickLabel:'a packet of seed',
   pickToast:'A small packet of seed, rolled shut. Scent leaf, says the pencil.',giveLabel:'Give Tunde his seeds'}],
 // where each owner is through the day (Today's pocket row, B's pocket tip); the give prompt itself follows the live NPC
 WHERE:{nkechi:'She is at her shop all day.',ada:'She is at the Makers’ Yard by day, and in the courtyard after six.',
  tunde:'He is at the Yard in the morning and the courtyard after.',bassey:'He is in the Yard in the morning, on the waterfront in the afternoon and in the courtyard in the evening.',
  oyelaran:'She is in the courtyard in the mornings and evenings, and out in the afternoon.'},
 KEEPSAKES:{nkechi:'fan',ada:'bird',tunde:'plate',bassey:'print',oyelaran:'record'},
 // what a thank-you tells about the next lost thing (its second speech block): its owner, and, when it comes out tomorrow, that it was heard
 TOLD_NEXT:{glasses:{owner:true},chisel:{owner:true}},
 KEEP_ORDER:['fan','bird','plate','print','record'],
 SHELLS:[{id:'cockle',name:'a ridged cockle',short:'ridged cockle',toast:'A ridged cockle.'},{id:'olive',name:'a glossy olive shell',short:'olive shell',toast:'A glossy olive shell.'},
  {id:'periwinkle',name:'a periwinkle, spiralled tight',short:'periwinkle',toast:'A periwinkle, spiralled tight.'},{id:'murex',name:'a spiny murex',short:'spiny murex',toast:'A spiny murex.'},
  {id:'cowrie',name:'a cowrie',short:'cowrie',toast:'A cowrie, smooth as a tooth.'}],
 COMMON:['cockle','olive','periwinkle','murex'],
 WASH_SPOTS:[[-0.6,15.5],[1.4,15.5],[3.4,15.4]],
 CARVE:['tilapia','mullet','bonga','croaker','snapper','catfish'],
 // Ada's ask (owner decision 2, moved into the middle of the day by engineer C): she names one fish she has not carved, in the gist the evening
 // before (if she is a guest) or in her talk that day. It bites only in its window, the five day fish in the early afternoon (FISH_WIN.day,
 // 12:30 to 15:30) and the catfish after six; within the window it comes on one cast in CARVE_ODDS (by hash) and by the fourth cast at the
 // latest (CARVE_SURE). One ask a day, always optional: an unkept ask lapses at the end of its day.
 CARVE_ASK:['croaker','snapper','bonga','mullet','tilapia','catfish'],
 FISH_WIN:{day:[12.5,15.5],catfish:[18,22]},CARVE_ODDS:3,CARVE_SURE:3,
 // the base's catch pools (life-v34.js, ACTIONS.lifeReel: by day, and from 18:00), read only: v38 steers the one draw that picks the species,
 // never adds one (the R() draw order is unchanged)
 POOL:{day:['tilapia','tilapia','mullet','mullet','croaker','bonga','snapper'],eve:['catfish','catfish','croaker','snapper','mullet','bonga']},
 SETS:{keepsake:5,shells:5,carve:6},
 // the copy: plain English in the interface; the neighbours' speech (thanks, Ada's carve lines) is a draft for the Nigerian reader (§13.6)
 UI:{
  keepsake:{fan:'Mama Nkechi pressed a hand fan into your hands. It will look well somewhere you can see it.',bird:'Ada gave you a little wooden bird, made from an offcut.',
   plate:'Tunde gave you a souvenir plate from somebody’s owambe. He did the sound.',print:'Mr. Bassey gave you a print of the compound gate in the gold hour.',
   record:'Mrs. Oyelaran gave you an old highlife record. ‘Play it quietly.’'},
  shelfHint:'Ada could put up a shelf for things like this.',
  keepName:{fan:'a hand fan from Mama Nkechi',bird:'a wooden bird from Ada',plate:'a souvenir plate from Tunde',print:'a framed print from Mr. Bassey',record:'a highlife record from Mrs. Oyelaran'},
  washLabel:'Pick up a shell from the wet sand',newKind:' One for the shelf.',
  returnKicker:'Given back',close:'Close',
  notEnough:'Not enough in the purse',shelfOrdered:'Ada says the wood is ready. The shelf goes up tomorrow morning.',
  shelfTitle:'Your shelf',shelfSub:'Ada put it up. Everything on it came from somewhere.',shelfNone:'Ada will put up a shelf for the things you find: ₦5,000 for the wood.',
  shelfSoon:'Ada says the wood is ready. The shelf goes up tomorrow morning.',
  setKeep:'Keepsakes',setShells:'Shells',setCarve:'Ada’s carvings',of:'{n} of {m}',complete:'Complete',
  keepMore:'(more from the neighbours you help)',shellMore:'(one more kind, at the water’s edge after a wash)',shellsMore:'({k} more kinds, on the beach and at the water’s edge)',
  carveMore:'({k} more fish to bring her)',carveMoreOne:'(one more fish to bring her)',nothingYet:'nothing yet',
  playtest:'Days with gist: {g} · Lost things given back: {r} · Longest quiet stretch yesterday: {q}',
  forAdaBtn:'Keep it for Ada',forAdaKicker:'For Ada',forAdaTitle:'A {fish} for carving.',
  forAdaText:'Ada is at the Makers’ Yard until six, then in the courtyard. It will keep until tomorrow evening.',castAgain:'Cast again',backShore:'Back to the shore',
  giveAda:'Give Ada the {fish}',carveNote:'She will have it carved by tomorrow morning.',carveShelf:'It goes on your shelf.',carveNoShelf:'It will wait for a shelf.',
  carvePaid:'You paid Ada {price} for the wood.',carveNoMoney:'Not enough in the purse for the wood',
  carveAsk:'Ada asked for a {fish} to carve. They bite only in the early afternoon, from half past twelve to half past three.',
  carveAskCat:'Ada asked for a catfish to carve. Catfish bite only after six in the evening.',
  carveKept:'A {fish} kept for Ada. She is at the Makers’ Yard until six, then in the courtyard. It keeps until {until}.',
  untilTomorrow:'tomorrow evening',untilToday:'six this evening',carveDoing:'Ada is carving your {fish}. It goes on your shelf tomorrow morning.',
  carveDoingNoShelf:'Ada is carving your {fish}. It will be ready tomorrow morning, and it will wait for a shelf.',
  memory:{keepsake:'Five keepsakes from five neighbours, on our shelf.',shells:'Our shelf has all five shells from the beach.',carve:'Ada’s six carved fish, all on our shelf.'}},
 SPEECH:{
  // thank-yous in the return panel (ids gs38-ty-<id>, gs38-ty-glasses-late; listed with their ids on docs/READER_gist.md); the glasses' and the
  // chisel's run to two speech blocks (over 160 characters): the second tells you about the next thing (Mama Nkechi: Ada's chisel; Ada: Tunde's
  // adapter, passed on at Tunde's own asking), so Today can say what was heard (found38Give)
  ty:{glasses:['My glasses! I have been reading prices from across the road. God bless you, my dear. Take this fan. It is too hot to argue.',
    'And Ada has been turning the rocks over all morning for her chisel. Go and help her look.'],
   glassesLate:['My glasses! I have been reading prices from across the road. God bless you, my dear. Take this fan. It is too hot to argue.',
    'Ada is carving by the rocks tomorrow, and her tools wander. Keep an eye out after midday.'],
   chisel:['You found it. Good. I bought another one today and I already hate it. Here. A bird I made from an offcut. It wants a shelf.',
    'Tunde is doing the sound by the stage tomorrow. He says if anybody finds a small black plug after midday, it is his.'],
   adapter:['My adapter! I have been blaming the fish all day. You have saved a wedding. Small exaggeration. Take this plate. Somebody’s owambe. My sound.'],
   lenscap:['Thank you, my friend. I said I would be careful. I was careful for a whole morning. Take this print. The gate, in good light.'],
   wrapper:['My wrapper. Thank you. I will not ask how it got to the street. I have a record I do not play. Take it. Play it quietly.'],
   rule:['My rule. You see? Things come back to people who measure twice. Thank you, sha.'],
   seeds:['My seeds! New compound rule: whoever finds my things gets first look at my seedlings. I have just invented it.']},
  // Ada's line when you give her a fish to carve (ids gs38-ada-<fish>)
  carve:{tilapia:'A tilapia. Small, honest fish. It will look like it is about to say something.',mullet:'Mullet. Always in a hurry. I will carve it standing still, for once.',
   bonga:'Bonga. Everybody eats it, nobody carves it. Until now.',croaker:'A croaker. Good face on it. I will start on it tonight.',
   snapper:'Red snapper. The iroko is already blushing.',catfish:'Catfish. Look at those whiskers. This one I will enjoy, sha.'},
  // Ada names the fish she wants to carve: in the gist, for tomorrow; in her talk, for today ({thing} is the fish as she says it). Three of each
  // for the day fish (the fixer, from the session review), one a day by the day's number, so an ask that runs on is said differently; none
  // promises the shelf, which may not be up yet
  ask:{gist:[['gs38-ask-gist','I have a piece of iroko waiting for a {thing}. They only bite in the early afternoon. Bring me one tomorrow, and I will carve it that night.'],
    ['gs38-ask-gist2','Tomorrow my hands want to carve a {thing}. They bite in the early afternoon. Bring me one, if the lagoon agrees.'],
    ['gs38-ask-gist3','If you fish tomorrow after midday, bring me a {thing}. I have the wood ready, and the wood is impatient.']],
   talk:[['gs38-ask-talk','I have a piece of iroko waiting for a {thing}. They only bite in the early afternoon. Bring me one today, and I will carve it tonight.'],
    ['gs38-ask-talk2','My hands want to carve a {thing} today. They bite in the early afternoon. Bring me one, if the lagoon agrees.'],
    ['gs38-ask-talk3','If you fish after midday, bring me a {thing}. I have the wood ready, and the wood is impatient.']],
   catGist:['gs38-ask-cat-gist','Catfish do not come out by day. Neither do I, some days. Tomorrow, fish after six and bring one to me in the courtyard.'],
   catTalk:['gs38-ask-cat-talk','Catfish do not come out by day. Neither do I, some days. Fish after six this evening, and bring one to me in the courtyard.']},
  fishSay:{tilapia:'tilapia',mullet:'mullet',bonga:'bonga',croaker:'croaker',snapper:'red snapper',catfish:'catfish'}},
 world:{item:null,itemKey:'',glint:null,glintRange:5,wash:[],washDay:0,fadeT:0,fading:[],shelf:null,shelfKey:''},
 flags:{now:false,playtest:false,value:null,parsed:false},
 handlers:{},mats:{},cost:{steps:0,builds:0}};

/* ======================================================================================================================================
   2. Shared helpers: the hash, the quiet builder, the save (spec §1.2, §1.7, §10)
   ====================================================================================================================================== */
// the one shared deterministic hash (FNV-1a over integers)
function hash38(){let h=2166136261>>>0;for(let k=0;k<arguments.length;k++){h=Math.imul(h^(arguments[k]|0),16777619)>>>0;}return h;}
// three.js draws four values from Math.random for every new object's UUID; v38 builds with a local generator in its place for a moment (a copy of
// football's fbQuiet37), so it never shifts the game's own random sequence. Nested calls reuse the one already in place.
let quietSeed38=0x3800,quietOn38=false;
function quiet38(fn){if(quietOn38)return fn();const keep=Math.random;let s=quietSeed38;quietOn38=true;
 Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
 try{return fn();}finally{quietSeed38=s;Math.random=keep;quietOn38=false;}}
function found38Online(){return typeof NET!=='undefined'&&!!NET.on;}
function found38IsAI(i){return typeof AI!=='undefined'&&!!AI.on&&i===AI.i;}
function found38Log(k,a){try{if(typeof LOG35!=='undefined'&&LOG35&&typeof LOG35.add==='function')LOG35.add(k,a);}catch(e){}}
function found38Toast(m){try{if(typeof toast==='function')toast(m);}catch(e){}}
function found38Save(){try{if(typeof save==='function')save();}catch(e){}}
function found38On(ev,fn){if(typeof fn!=='function')return;(FOUND38.handlers[ev]||(FOUND38.handlers[ev]=[])).push(fn);}
function found38Emit(ev,data){const hs=FOUND38.handlers[ev];if(!hs)return;for(const fn of hs){try{fn(data||{});}catch(e){if(typeof console!=='undefined')console.warn('found38 '+ev,e);}}}
function found38Item(id){return FOUND38.LOST.find(x=>x.id===id)||null;}
function found38Shell(id){return FOUND38.SHELLS.find(x=>x.id===id)||null;}
function found38Name(k){return typeof CAST!=='undefined'&&CAST[k]?CAST[k].name:k;}
function found38Fill(G){
 // fields are lazy and additive: an older v38 record gains what this build reads
 if(!G.lost)G.lost={i:0,since:3,at:FOUND38.LOST_AT,status:'out',heard:0,told:0,ownerTold:0};
 if(!Array.isArray(G.returned))G.returned=[];
 if(!G.keep)G.keep={};for(const k of ['shells','keepsake','carve'])if(!Array.isArray(G.keep[k]))G.keep[k]=[];
 if(!G.shelf)G.shelf={state:'none',day:0,upDay:0};if(!G.wash)G.wash={picked:{}};if(!G.wash.picked)G.wash.picked={};
 if(!G.ada)G.ada={forAda:null,pending:null,gaveDay:0};if(!G.sets)G.sets={};
 for(const k of ['tries','said','once'])if(!G[k]||typeof G[k]!=='object')G[k]={};
 if(!G.eve)G.eve={day:0,n:0,first:0};if(G.last===undefined)G.last=null;return G;}
// the first lost thing as it is before discovery: out from midday on day 3 or later (§6.2), with no record
function found38Default(){return {i:0,since:Math.max(3,S.day|0),at:FOUND38.flags.now?0:FOUND38.LOST_AT,status:'out',heard:0,told:0,ownerTold:0};}
// S.life.gist38, or null; create makes it (discovery: a pickup, or the first gist line shown, gist-v38.js). via defaults to 'gist'.
function gistSave38(create,via){
 if(typeof S==='undefined'||!S||!S.p)return null;
 const L=S.life;if(L&&L.gist38&&typeof L.gist38==='object')return found38Fill(L.gist38);
 if(!create||found38Online()||S.phase!=='play')return null;
 const l=typeof life34==='function'?life34():(S.life=S.life||{});if(!l)return null;
 const d=found38Default();
 l.gist38={v:1,found:S.day,via:via==='find'?'find':'gist',lost:d,returned:[],keep:{shells:[],keepsake:[],carve:[]},
  shelf:{state:'none',day:0,upDay:0},wash:{picked:{}},ada:{forAda:null,pending:null,gaveDay:0,ask:null},sets:{},
  eve:{day:0,n:0,first:0},last:null,tries:{},said:{},once:{}};
 if(FOUND38.flags.playtest)l.gist38.once.playtest=true;
 found38Emit('discover',{via:l.gist38.via,day:S.day});return l.gist38;}

/* ======================================================================================================================================
   3. The cycles, pure (spec §6.2): the current lost thing, today and tomorrow, wash days. The API for engineer B (§1.7).
   ====================================================================================================================================== */
function found38Lost(){const G=gistSave38();return G?G.lost:found38Default();}
function found38IsOut(L,day,time){return !!L&&L.status==='out'&&L.i<FOUND38.LOST.length&&day>=3&&(day>L.since||(day===L.since&&time>=L.at));}
function found38Spot(i,since){const s=FOUND38.LOST[i].spots;return s[hash38(since,i)%s.length];}
function found38WashDay(day,G){G=G===undefined?gistSave38():G;if(!G)return false;const F=G.found|0,W=FOUND38.WASH;return day>=F+W.first&&(day-F-W.first)%W.every===0;}
function found38Known(L,it){return !!(it.ownerKnown||(L.heard|0)>0||(L.ownerTold|0)>0);}
function found38LostView(L,it,day,time){return {id:it.id,i:L.i,owner:it.owner,name:it.name,long:it.long,area:it.area,where:FOUND38.WHERE[it.owner],
 isNew:L.since===day,stale:day>L.since,status:found38IsOut(L,day,time)?'out':'due',told:L.told|0,heard:L.heard|0,since:L.since,at:L.at};}
// today: the lost thing out today (now, or later today), the thing in your pocket, and whether today is a wash day. Pure.
function found38Today(){if(!S||!S.p)return {lost:null,pocket:null,wash:false};const L=found38Lost(),it=FOUND38.LOST[L.i];let lost=null,pocket=null;
 if(it&&L.status==='out'&&S.day>=3&&L.since<=S.day)lost=found38LostView(L,it,S.day,S.time);
 if(it&&L.status==='pocket')pocket={id:it.id,owner:it.owner,name:it.name,long:it.long,where:FOUND38.WHERE[it.owner],known:found38Known(L,it),ownerTold:L.ownerTold|0};
 return {lost,pocket,wash:found38WashDay(S.day)};}
// tomorrow: the lost thing out tomorrow (isNew when it first comes out then), the pocket (it stays), and tomorrow's wash. Pure.
function found38Tomorrow(){if(!S||!S.p)return {lost:null,pocket:null,wash:false};const d=S.day+1,L=found38Lost(),it=FOUND38.LOST[L.i];let lost=null,pocket=null;
 if(it&&L.status==='out'&&d>=3&&L.since<=d){lost=found38LostView(L,it,d,FOUND38.LOST_AT);lost.status=L.since===d&&L.at>0?'due':'out';}
 if(it&&L.status==='pocket')pocket={id:it.id,owner:it.owner,name:it.name,long:it.long,where:FOUND38.WHERE[it.owner],known:found38Known(L,it),ownerTold:L.ownerTold|0};
 return {lost,pocket,wash:found38WashDay(d)};}
// the ids given back on a day (B's line about today)
function found38Returned(day){const G=gistSave38();return G?G.returned.filter(r=>r.day===day).map(r=>r.id):[];}
// the shelf's counts for the Today card: [have, of] per set; have/of in all count the keepsakes and the shells only (ten), and Ada's carvings
// are their own count once she has carved one or one is waiting (the session review: a full shelf no longer drops to "11 of 16")
function found38ShelfCount(){const G=gistSave38();if(!G)return null;const c=G.keep,carve=c.carve.length||(G.ada&&G.ada.pending)?1:0;
 const sets={keepsake:[c.keepsake.length,FOUND38.SETS.keepsake],shells:[c.shells.length,FOUND38.SETS.shells]};
 let have=0,of=0;for(const k in sets){have+=sets[k][0];of+=sets[k][1];}if(carve)sets.carve=[c.carve.length,FOUND38.SETS.carve];
 return {state:G.shelf.state,have,of,sets,carve:carve?sets.carve:null,complete:Object.assign({},G.sets)};}

/* ======================================================================================================================================
   4. Meshes (spec §7.2, §8.3, §9.3): small procedural groups, about 1.5 times life so they read; built only inside quiet38
   ====================================================================================================================================== */
function found38Mat(c,o){const F=FOUND38,k=c+(o?JSON.stringify(o):'');if(!F.mats[k])F.mats[k]=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));return F.mats[k];}
function found38Mesh(g,geo,c,x,y,z,o){const m=new THREE.Mesh(geo,found38Mat(c,o));m.position.set(x,y,z);m.castShadow=false;m.receiveShadow=false;g.add(m);return m;}
function found38Box(g,w,h,d,c,x,y,z,o){return found38Mesh(g,new THREE.BoxGeometry(w,h,d),c,x,y,z,o);}
function found38Cyl(g,r,h,c,x,y,z,seg,rt){return found38Mesh(g,new THREE.CylinderGeometry(rt===undefined?r:rt,r,h,seg||12),c,x,y,z);}
function found38Ball(g,r,c,x,y,z,sx,sy,sz){const m=found38Mesh(g,new THREE.SphereGeometry(r,10,7),c,x,y,z);m.scale.set(sx||1,sy||1,sz||1);return m;}
function found38Ring(g,r,t,c,x,y,z,arc){const m=found38Mesh(g,new THREE.TorusGeometry(r,t,5,18,arc||Math.PI*2),c,x,y,z);m.rotation.x=-Math.PI/2;return m;}
function found38Cone(g,r,h,c,x,y,z){return found38Mesh(g,new THREE.ConeGeometry(r,h,8),c,x,y,z);}
// one lost thing, lying on the ground, centred on the group's origin
function found38ItemMesh(it){const g=new THREE.Group();g.name='found38_'+it.id;const k=new THREE.Group();g.add(k);
 const GOLD='#C9A23A';
 if(it.id==='glasses'){for(const s of [-1,1]){found38Ring(k,0.026,0.0045,GOLD,s*0.03,0.006,0);const l=found38Cyl(k,0.023,0.002,'#DCE7EA',s*0.03,0.004,0,14);l.material=found38Mat('#DCE7EA',{transparent:true,opacity:0.6});
   found38Box(k,0.004,0.004,0.1,GOLD,s*0.056,0.005,-0.05);}
  found38Box(k,0.014,0.004,0.004,GOLD,0,0.007,0);const ch=found38Ring(k,0.07,0.0022,GOLD,0,0.003,0.045,Math.PI*1.4);ch.rotation.z=0.6;}
 else if(it.id==='chisel'){const h=found38Cyl(k,0.013,0.1,'#9A6B3E',-0.03,0.013,0,10);h.rotation.z=Math.PI/2;const f=found38Cyl(k,0.014,0.012,'#8C8C8C',0.026,0.013,0,10);f.rotation.z=Math.PI/2;
  found38Box(k,0.08,0.005,0.016,'#A9AEB2',0.072,0.009,0);}
 else if(it.id==='adapter'){found38Box(k,0.032,0.018,0.046,'#1E1E1E',0,0.009,0);found38Box(k,0.004,0.004,0.016,'#B8B8B8',-0.007,0.009,-0.03);found38Box(k,0.004,0.004,0.016,'#B8B8B8',0.007,0.009,-0.03);
  found38Ring(k,0.045,0.0035,'#2A2A2A',0.05,0.004,0.03,Math.PI*1.6);found38Ring(k,0.03,0.0035,'#2A2A2A',0.06,0.004,0.035,Math.PI*1.2);}
 else if(it.id==='lenscap'){const c=found38Cyl(k,0.03,0.01,'#151515',0,0.002,0,18);c.rotation.z=0.22;const r=found38Ring(k,0.027,0.0025,'#3A3A3A',0,0.008,0);r.rotation.y=0.22;}
 else if(it.id==='wrapper'){const a=found38Box(k,0.3,0.03,0.2,'#2D5DA8',0,0.015,0);a.rotation.y=0.15;const b=found38Box(k,0.22,0.025,0.16,'#4A78C2',0.03,0.04,0.02);b.rotation.y=-0.2;
  found38Box(k,0.22,0.004,0.03,'#E8D7A8',0.03,0.054,0.0).rotation.y=-0.2;}
 else if(it.id==='rule'){for(let s=0;s<4;s++){const b=found38Box(k,0.12,0.004,0.018,'#E8C23A',-0.15+s*0.1,0.003+s*0.0035,(s%2)*0.03);b.rotation.y=(s%2?-0.45:0.45);}}
 else if(it.id==='seeds'){found38Box(k,0.06,0.01,0.09,'#D8C59A',0,0.005,0);found38Box(k,0.06,0.006,0.02,'#C7B282',0,0.011,-0.036);found38Box(k,0.03,0.002,0.03,'#5E8C4A',0,0.011,0.01);}
 k.scale.setScalar(1.5);return g;}
// the glint: a soft star sprite over the thing (the base's glow texture), opacity and size set every frame
// a soft four-pointed star on a warm halo, drawn once (normal blending, so it reads on bright sand as well as in the evening)
function found38StarTex(){const F=FOUND38;if(F.star)return F.star;const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');
 const g=c.createRadialGradient(32,32,0,32,32,30);g.addColorStop(0,'rgba(255,252,236,1)');g.addColorStop(0.16,'rgba(255,214,110,0.95)');g.addColorStop(0.45,'rgba(240,170,40,0.45)');g.addColorStop(1,'rgba(240,170,40,0)');
 c.fillStyle=g;c.fillRect(0,0,64,64);c.fillStyle='rgba(255,236,170,0.95)';c.beginPath();c.moveTo(32,2);c.lineTo(35,29);c.lineTo(62,32);c.lineTo(35,35);c.lineTo(32,62);c.lineTo(29,35);c.lineTo(2,32);c.lineTo(29,29);c.closePath();c.fill();
 F.star=new THREE.CanvasTexture(cv);return F.star;}
function found38GlintMesh(){const m=new THREE.SpriteMaterial({map:found38StarTex(),color:'#FFFFFF',transparent:true,depthWrite:false,opacity:0});const s=new THREE.Sprite(m);s.name='found38_glint';s.visible=false;return s;}
// a shell of a kind, about the size of the shore shells
function found38ShellMesh(kind,sc){const g=new THREE.Group();g.name='found38_shell_'+kind;const k=new THREE.Group();g.add(k);
 if(kind==='cockle'){found38Ball(k,0.06,'#E7CBA4',0,0.02,0,1,0.45,0.9);for(let r=-1;r<=1;r++)found38Box(k,0.006,0.012,0.09,'#C7A27B',r*0.025,0.04,0);}
 else if(kind==='olive'){found38Ball(k,0.045,'#7A6648',0,0.025,0,0.65,0.55,1.4);found38Box(k,0.008,0.004,0.08,'#3E3324',0.0,0.047,0);}
 else if(kind==='periwinkle'){found38Ball(k,0.035,'#5B4A40',0,0.03,0);const c=found38Cone(k,0.03,0.07,'#4A3C33',0,0.075,0);c.rotation.z=0.15;}
 else if(kind==='murex'){const c=found38Cone(k,0.04,0.11,'#DCC6A2',0,0.03,0);c.rotation.z=Math.PI/2;for(const s of [-1,1]){const p=found38Cone(k,0.01,0.05,'#B89C74',s*0.02,0.05,s*0.02);p.rotation.x=s*0.9;}}
 else{found38Ball(k,0.05,'#F3E9D6',0,0.028,0,1,0.6,1.45);found38Box(k,0.006,0.004,0.1,'#8C6A4A',0,0.058,0);
  for(const [x,z] of [[0.02,0.03],[-0.02,-0.02],[0.015,-0.04]])found38Ball(k,0.008,'#C9A983',x,0.05,z,1,0.3,1);}
 k.scale.setScalar(sc||1.6);return g;}
// a keepsake on the top plank (its base at y 0)
function found38KeepMesh(id){const g=new THREE.Group();g.name='found38_keep_'+id;
 if(id==='fan'){const a=found38Mesh(g,new THREE.CircleGeometry(0.11,14,0,Math.PI),'#C8553D',0,0.07,0);a.material=found38Mat('#C8553D',{side:THREE.DoubleSide});
  const b=found38Mesh(g,new THREE.CircleGeometry(0.07,12,0,Math.PI),'#E9B44C',0,0.071,0.003);b.material=found38Mat('#E9B44C',{side:THREE.DoubleSide});
  found38Box(g,0.016,0.08,0.012,'#7A5230',0,0.035,0);g.rotation.x=-0.12;}
 else if(id==='bird'){found38Box(g,0.06,0.012,0.04,'#7A5230',0,0.006,0);found38Ball(g,0.04,'#A8784A',0,0.05,0,1.4,1,1);found38Ball(g,0.026,'#A8784A',0.05,0.085,0);
  const t=found38Cone(g,0.018,0.05,'#946A40',-0.065,0.06,0);t.rotation.z=Math.PI/2+0.4;found38Cone(g,0.006,0.02,'#5E3B22',0.08,0.085,0).rotation.z=-Math.PI/2;}
 else if(id==='plate'){found38Box(g,0.06,0.02,0.05,'#4A3626',0,0.01,0.02);const p=found38Cyl(g,0.09,0.012,'#F2EBDC',0,0.095,0,22);p.rotation.x=Math.PI/2-0.2;
  const r=found38Mesh(g,new THREE.TorusGeometry(0.084,0.006,5,22),'#2E6FA8',0,0.095,0.007);r.rotation.x=-0.2;}
 else if(id==='print'){const f=found38Box(g,0.2,0.16,0.02,'#3B2A1E',0,0.08,0);f.rotation.x=-0.12;const i=found38Box(g,0.17,0.13,0.004,'#D9A85B',0,0.081,0.011);i.rotation.x=-0.12;
  const gt=found38Box(g,0.07,0.05,0.003,'#5A3B28',0,0.06,0.015);gt.rotation.x=-0.12;}
 else if(id==='record'){const s=found38Box(g,0.2,0.2,0.008,'#2F6B4F',0,0.1,0);s.rotation.x=-0.16;const d=found38Cyl(g,0.09,0.004,'#151515',0.05,0.095,-0.012,22);d.rotation.x=Math.PI/2-0.16;
  found38Box(g,0.07,0.07,0.002,'#E3A72F',0,0.13,0.006).rotation.x=-0.16;}
 return g;}
// a carved wooden fish for the top plank (SHELF.tiers[2]), stained faintly with the species' colour
function found38CarveMesh(fish){const g=new THREE.Group();g.name='found38_carve_'+fish;const f=(typeof FISH34!=='undefined'?FISH34:[]).find(x=>x.id===fish);
 const wood=new THREE.Color('#B88A5A');if(f&&f.colour)wood.lerp(new THREE.Color(f.colour),0.3);const c='#'+wood.getHexString();
 found38Box(g,0.05,0.012,0.04,'#5E3B22',0,0.006,0);found38Ball(g,0.045,c,0,0.055,0,2.0,0.85,0.6);const t=found38Cone(g,0.035,0.05,c,-0.11,0.055,0);t.rotation.z=Math.PI/2;
 if(fish==='catfish')for(const s of [-1,1]){const w=found38Box(g,0.05,0.002,0.002,'#5E3B22',0.1,0.05,s*0.015);w.rotation.y=s*0.4;}
 return g;}
// the shelf: a small unit of two side boards and two planks (three once Ada has carved a fish), with the sets on them; built along local x,
// facing local +z; nothing under the lowest plank but the side boards' feet (SHELF.foot)
function found38ShelfMesh(G,span){const F=FOUND38,SH=F.SHELF,g=new THREE.Group();g.name='found38_shelf';const carve=G.keep.carve.length>0;
 const tiers=carve?SH.tiers:SH.tiers.slice(0,2);let items=0;
 for(const y of tiers)found38Box(g,SH.w,0.03,SH.depth,'#8A5A33',0,y,0);
 {const lo=SH.tiers[0]-SH.foot,hi=tiers[tiers.length-1]+0.05;for(const s of [-1,1])found38Box(g,SH.side,hi-lo,SH.depth,'#5E3B22',s*(SH.w+SH.side)/2,(lo+hi)/2,0);}
 const top=y=>y+0.015,slot=(k,n)=>{const w=SH.w-0.1;return -w/2+w*(k+0.5)/n;};
 // the second plank (SHELF.tiers[1]): the keepsakes in their set order, drawn at KEEP_SCALE so the unit stays low
 F.KEEP_ORDER.forEach((id,k)=>{if(!G.keep.keepsake.includes(id))return;const m=found38KeepMesh(id);m.scale.setScalar(SH.KEEP_SCALE);m.position.set(slot(k,5),top(SH.tiers[1]),0);g.add(m);items++;});
 // the first plank (SHELF.tiers[0]): one of each kind of shell
 F.SHELLS.forEach((s,k)=>{if(!G.keep.shells.includes(s.id))return;const m=found38ShellMesh(s.id,SH.SHELL_SCALE);m.position.set(slot(k,5),top(SH.tiers[0]),0);m.rotation.y=0.4;g.add(m);items++;});
 // the top plank (SHELF.tiers[2]), only once Ada has carved a fish: her carvings in the order of the catalogue
 if(carve)F.CARVE.forEach((id,k)=>{if(!G.keep.carve.includes(id))return;const m=found38CarveMesh(id);m.scale.setScalar(SH.CARVE_SCALE);m.position.set(slot(k,6),top(SH.tiers[2]),0);g.add(m);items++;});
 g.position.set(span.x,0,span.z);g.rotation.y=span.yaw;g.userData.items=items;g.userData.span=span.wall;return g;}

/* ======================================================================================================================================
   5. The world: build to match the state; teardown is exact (spec §1.3, §7.2, §8.3, §11)
   ====================================================================================================================================== */
function found38Live(){return typeof scene!=='undefined'&&!!scene&&typeof S!=='undefined'&&!!S&&!!S.p&&S.phase==='play'&&typeof players!=='undefined'&&players.length>0&&!found38Online();}
function found38Drop(o){if(!o)return;if(o.parent)o.parent.remove(o);o.traverse(m=>{if(m.geometry)m.geometry.dispose();if(m.isSprite&&m.material)m.material.dispose();
 if(m.material&&m.material.userData&&m.material.userData.own38)m.material.dispose();});}
function found38DropItem(){const W=FOUND38.world;found38Drop(W.item);found38Drop(W.glint);W.item=null;W.glint=null;W.itemKey='';foundEdgeHide38();}
function found38DropWash(){const W=FOUND38.world;for(const s of W.wash){found38Drop(s.decal);found38Drop(s.shell);}for(const d of W.fading)found38Drop(d);W.wash.length=0;W.fading.length=0;W.fadeT=0;W.washDay=0;}
function found38Teardown(){const W=FOUND38.world;found38DropItem();found38DropWash();found38Drop(W.shelf);W.shelf=null;W.shelfKey='';
 // and anything tagged that a scene change left behind
 if(typeof scene!=='undefined'&&scene&&scene.children){for(const o of scene.children.slice())if(o.userData&&o.userData.gist38)found38Drop(o);}}
function found38Any(){const W=FOUND38.world;return !!(W.item||W.glint||W.wash.length||W.fading.length||W.shelf);}
// the key of the lost thing that should lie in the world now ('' for none)
function found38OutKey(){if(S.day<3)return '';const L=found38Lost();if(!found38IsOut(L,S.day,S.time))return '';return L.i+':'+L.since;}
function found38BuildItem(){const F=FOUND38,W=F.world,L=found38Lost(),it=F.LOST[L.i],sp=found38Spot(L.i,L.since);
 const g=quiet38(()=>found38ItemMesh(it));
 g.position.set(sp[0],(sp[2]===undefined?F.GROUND:sp[2])+0.002,sp[1]);g.rotation.y=(hash38(L.since,L.i,9)%628)/100;g.userData.gist38='lost:'+it.id;scene.add(g);W.item=g;
 const gl=quiet38(()=>found38GlintMesh());gl.position.set(sp[0],(sp[2]===undefined?F.GROUND:sp[2])+F.GLINT.y,sp[1]);gl.userData.gist38='glint';scene.add(gl);W.glint=gl;
 W.itemKey=L.i+':'+L.since;found38GlintRange();F.cost.builds++;found38GlintFrame();}
// the glint's reach: 5 m, 8 m for the first thing, 9 m once it has lain out since an earlier day
function found38GlintRange(){const F=FOUND38,W=F.world,L=found38Lost(),it=F.LOST[L.i];if(!it)return;
 W.glintRange=Math.max(S.day>L.since?F.GLINT.stale:F.GLINT.far,it.first?F.GLINT.first:0);}
// the glint every frame: shown within range of a human, full strength within GLINT.near, pulsing; its size follows the camera distance
function found38GlintFrame(){const F=FOUND38,W=F.world,g=W.glint;if(!g)return;const G=F.GLINT;let d=1e9;
 for(const p of players){if(found38IsAI(p.i)||(p.y||0)>1)continue;const q=Math.hypot(p.g.position.x-g.position.x,p.g.position.z-g.position.z);if(q<d)d=q;}
 const pulse=G.lo+(G.hi-G.lo)*(0.5+0.5*Math.sin(F.t*2*Math.PI/G.period));foundEdgeFrame38(pulse);
 if(!(d<W.glintRange)){if(g.visible){g.visible=false;g.material.opacity=0;}return;}
 const k=d<=G.near?1:0.7+0.3*(W.glintRange-d)/(W.glintRange-G.near);
 g.material.opacity=pulse*k;g.visible=true;
 const cam=typeof v21Dist!=='undefined'&&v21Dist?Math.max(1,v21Dist[0]/G.camRef):1;const s=G.size*cam;g.scale.set(s,s,1);}
// the glint at the edge of a view (the session review, S4): in a split half the glint itself is on screen only within about 2 m, so while a
// human is within its reach (5, 8 or 9 m) and it is outside that human's view, a small soft star sits at the edge of the view towards it,
// pulsing with it. Two DOM elements made once (class gist38-edge, gist-v38.css); a style write only when the place or the pulse step changes.
const EDGE38={el:[null,null],key:['',''],v:null,INSET:24,TOP:84,BOTTOM:96};
function foundEdgeEl38(i){if(EDGE38.el[i])return EDGE38.el[i];if(typeof document==='undefined'||!document.body||typeof document.createElement!=='function')return null;
 const e=document.createElement('div');e.className='gist38-edge';e.setAttribute('aria-hidden','true');e.style.display='none';document.body.appendChild(e);EDGE38.el[i]=e;return e;}
// view i's rectangle on screen in CSS pixels (renderFrame's layout: one view for a companion household; else halves, side by side in landscape,
// player 1 above in portrait), with the insets the star keeps from its edges (the top bar and the bottom row of chips at the screen's edges)
function foundEdgeRect38(i){const W=innerWidth,H=innerHeight,si=typeof singleIdx==='function'?singleIdx():-1;let r;
 if(si>=0){if(i!==si)return null;r={x:0,y:0,w:W,h:H};}else if(H>W){const h=Math.floor(H/2);r={x:0,y:i===0?0:H-h,w:W,h};}else{const w=Math.floor(W/2);r={x:i===0?0:W-w,y:0,w,h:H};}
 const E=EDGE38;r.l=r.x+E.INSET;r.r=r.x+r.w-E.INSET;r.t=r.y+(r.y<=0?E.TOP:E.INSET);r.b=r.y+r.h-(r.y+r.h>=H?E.BOTTOM:E.INSET);return r;}
// where view i would put the star now: null when its human is out of reach, or the glint is inside the view
function foundEdgeAt38(i){const g=FOUND38.world.glint,p=players[i];if(!g||!p||found38IsAI(i)||(p.y||0)>1||typeof cams==='undefined'||!cams[i])return null;
 if(!(Math.hypot(p.g.position.x-g.position.x,p.g.position.z-g.position.z)<FOUND38.world.glintRange))return null;const r=foundEdgeRect38(i);if(!r)return null;
 const c=cams[i];c.updateMatrixWorld();const v=EDGE38.v||(EDGE38.v=new THREE.Vector3());v.copy(g.position).project(c);let nx=v.x,ny=v.y;if(v.z>1){nx=-nx;ny=-ny;}
 const px=r.x+(nx+1)/2*r.w,py=r.y+(1-ny)/2*r.h;if(v.z<=1&&px>=r.l&&px<=r.r&&py>=r.t&&py<=r.b)return null;
 const cx=(r.l+r.r)/2,cy=(r.t+r.b)/2,dx=px-cx,dy=py-cy,k=Math.min(dx?(r.r-r.l)/2/Math.abs(dx):1e9,dy?(r.b-r.t)/2/Math.abs(dy):1e9);
 return {x:Math.round(cx+dx*k),y:Math.round(cy+dy*k)};}
function foundEdgeFrame38(pulse){for(let i=0;i<2;i++){const at=FOUND38.world.glint?foundEdgeAt38(i):null;const key=at?at.x+','+at.y+','+Math.round(pulse*20):'';
  if(key===EDGE38.key[i])continue;const e=foundEdgeEl38(i);if(!e)continue;EDGE38.key[i]=key;
  if(!at){e.style.display='none';continue;}e.style.display='block';e.style.left=at.x+'px';e.style.top=at.y+'px';e.style.opacity=String(Math.round((0.35+0.65*pulse)*20)/20);}}
function foundEdgeHide38(){for(let i=0;i<2;i++){if(EDGE38.el[i]&&EDGE38.key[i]!==''){EDGE38.el[i].style.display='none';}EDGE38.key[i]='';}}
// the wash: three shells at the water's edge from 13:30 to 15:30 on a wash day (after discovery); at 15:30 the decals fade over 2 s
function found38WashKind(day,n,G){const C=FOUND38.COMMON,cw=hash38(day,5)%3;
 if(n===cw&&(day===(G.found|0)+FOUND38.WASH.first||!G.keep.shells.includes('cowrie')))return 'cowrie';return C[hash38(day,n,7)%C.length];}
function found38WashSync(){const F=FOUND38,W=F.world,G=gistSave38(),on=!!(G&&found38WashDay(S.day,G)&&S.time>=F.WASH.from&&S.time<F.WASH.to);
 if(!on){if(W.wash.length)found38WashGo();return;}
 if(W.washDay===S.day)return;
 found38DropWash();W.washDay=S.day;
 F.WASH_SPOTS.forEach(([x,z],n)=>{if(G.wash.picked[n]===S.day)return;const kind=found38WashKind(S.day,n,G);
  const decal=quiet38(()=>{const m=new THREE.Mesh(new THREE.CircleGeometry(0.6,20),new THREE.MeshBasicMaterial({color:'#6B5843',transparent:true,opacity:0.35,depthWrite:false}));
   m.material.userData.own38=true;m.rotation.x=-Math.PI/2;return m;});
  decal.position.set(x,F.GROUND+0.004,z);decal.userData.gist38='wash:'+n;scene.add(decal);
  const shell=quiet38(()=>found38ShellMesh(kind));shell.position.set(x,F.GROUND,z);shell.rotation.y=(hash38(S.day,n,3)%628)/100;shell.userData.gist38='wash:'+n;scene.add(shell);
  W.wash.push({n,x,z,kind,decal,shell});});
 F.cost.builds++;}
// the water takes the shells back: shells at once, the wet sand over WASH.fade seconds
function found38WashGo(){const W=FOUND38.world;for(const s of W.wash){found38Drop(s.shell);if(s.decal)W.fading.push(s.decal);}W.wash.length=0;W.fadeT=FOUND38.WASH.fade;}
function found38FadeFrame(dt){const W=FOUND38.world;W.fadeT=Math.max(0,W.fadeT-Math.max(0,+dt||0));const a=0.35*W.fadeT/FOUND38.WASH.fade;
 for(const d of W.fading)if(d.material)d.material.opacity=a;if(W.fadeT<=0){for(const d of W.fading)found38Drop(d);W.fading.length=0;}}
// the shelf's span: the back wall over the mattress (columns 0-1), clear of everything the flat hangs there (see SHELF)
function found38ShelfSpan(){const SH=FOUND38.SHELF;return {wall:'back',cols:SH.cols,x:SH.x,z:SH.z,yaw:0};}
// built on refreshHomeExtras, enterWorld, nextday and every keep (through the sync), never per frame: only when its key changes
function found38Shelf(){const F=FOUND38,W=F.world;const G=gistSave38();
 if(!(G&&G.shelf.state==='up'&&found38Live())){if(W.shelf){found38Drop(W.shelf);W.shelf=null;W.shelfKey='';}return null;}
 const span=found38ShelfSpan(),key=JSON.stringify([span.wall,span.x,G.keep.keepsake,G.keep.shells,G.keep.carve]);
 if(W.shelf&&W.shelf.parent===scene&&W.shelfKey===key)return W.shelf;
 found38Drop(W.shelf);W.shelf=null;
 const g=quiet38(()=>found38ShelfMesh(G,span));g.userData.gist38='shelf';scene.add(g);
 W.shelf=g;W.shelfKey=key;
 F.cost.builds++;return g;}
// the world to match the state now (the step calls it four times a second; acts call it at once)
function found38Sync(){const W=FOUND38.world;
 if(!found38Live()){if(found38Any())found38Teardown();return;}
 const k=found38OutKey();if(k!==W.itemKey||(W.item&&W.item.parent!==scene)){found38DropItem();if(k)found38BuildItem();}else if(W.item)found38GlintRange();
 found38WashSync();found38Shelf();}

/* ======================================================================================================================================
   6. The per-frame step (spec §1.5): FOUND38.t sums frame steps; the checks run every 0.25 s of it; between checks only the glint and a fade
   ====================================================================================================================================== */
FOUND38.step=function(dt){const F=FOUND38,W=F.world;F.t+=Math.max(0,+dt||0);F.cost.steps++;
 if(W.glint)found38GlintFrame();
 if(W.fadeT>0)found38FadeFrame(dt);
 if(F.t<F.checkAt)return;F.checkAt=F.t+0.25;
 if(typeof S==='undefined'||!S||!S.p||S.phase!=='play'||!players.length)return;
 if(found38Online()){if(found38Any())found38Teardown();return;}
 if(typeof overlayOpen==='function'&&overlayOpen())return;           // the clock is stopped under a panel; acts sync at once themselves
 found38Sync();};
// the finds' step runs after the evening and football (football's wrapper returns early on idle during a match; this one is outside it)
if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.tick==='function'){
 const prevEveTick38a=EVENING35.tick;EVENING35.tick=function(dt){const r=prevEveTick38a.apply(this,arguments);
  try{FOUND38.step(dt);}catch(e){if(typeof console!=='undefined')console.warn('found38',e);}return r;};}

/* ======================================================================================================================================
   7. Picking up, the pocket and giving back (spec §7.3–§7.5); Ada's carvings (owner decision 2); the wash shells (§8.3)
   ====================================================================================================================================== */
function found38Visiting(k){try{return typeof EVENING35!=='undefined'&&!!EVENING35&&EVENING35.state!=='idle'&&Array.isArray(EVENING35.guests)&&EVENING35.guests.includes(k);}catch(e){return false;}}
function found38Npc(k){const n=typeof npcs!=='undefined'?npcs[k]:null;return n&&n.g&&n.g.visible&&!found38Visiting(k)?n:null;}
function found38Fish(id){return (typeof FISH34!=='undefined'?FISH34:[]).find(f=>f.id===id)||null;}
// a fish kept for Ada is good until 18:00 the day after it was kept
function found38ForAda(G){const a=G&&G.ada&&G.ada.forAda;if(!a)return null;if(S.day===a.day||(S.day===a.day+1&&S.time<FOUND38.CARVE_KEEP_UNTIL))return a;return null;}
// one HOTSPOT_HOOKS entry: honest distances, pushed onto the list (never exclusive)
function found38Hot(i,list,d){if(!list||typeof S==='undefined'||!S||!S.p||S.phase!=='play'||found38Online())return null;const p=players[i];if(!p||found38IsAI(i)||(p.y||0)>1)return null;
 const F=FOUND38,W=F.world;
 if(W.item&&W.itemKey){const dd=d(W.item.position.x,W.item.position.z);if(dd<F.PICK){const it=F.LOST[found38Lost().i];if(it)list.push({id:'gist38pick',label:'Pick up '+it.pickLabel,dist:dd-F.PICK_LEAD});}}
 for(const s of W.wash){const dd=d(s.x,s.z);if(dd<1.3)list.push({id:'gist38wash:'+s.n,label:F.UI.washLabel,dist:dd-0.2});}
 const G=S.life&&S.life.gist38?gistSave38():null;if(!G)return null;
 if(G.lost.status==='pocket'){const it=F.LOST[G.lost.i],n=it&&found38Npc(it.owner);if(n){const dd=d(n.g.position.x,n.g.position.z);if(dd<F.GIVE)list.push({id:'gist38give',label:it.giveLabel,dist:dd-F.GIVE_LEAD});}}
 const fa=found38ForAda(G);if(fa&&G.ada.gaveDay!==S.day){const n=found38Npc('ada');if(n){const dd=d(n.g.position.x,n.g.position.z),f=found38Fish(fa.id);
  if(dd<F.GIVE&&f)list.push({id:'gist38ada',label:F.UI.giveAda.replace('{fish}',f.name.toLowerCase()),dist:dd-F.GIVE_LEAD+0.01});}}
 return null;}
HOTSPOT_HOOKS.push(found38Hot);
function found38Pick(i){const F=FOUND38,W=F.world;if(!W.item||!W.itemKey)return;const L0=found38Lost();if(L0.status!=='out')return;const it=F.LOST[L0.i];
 const G=gistSave38(true,'find');if(!G)return;
 // a thing whose owner you have been told (Mama Nkechi's thank-you names Ada's chisel) says whose it is (the reviews' L2/C2)
 G.lost.status='pocket';found38DropItem();found38Toast(it.pickToastKnown&&found38Known(G.lost,it)?it.pickToastKnown:it.pickToast);found38Log('find',it.id);
 try{if(typeof playPick==='function'&&players[i])playPick(players[i].g);}catch(e){}
 found38Emit('pickup',{id:it.id,owner:it.owner});found38Save();}
// a set completes: the day, the log, an album memory
function found38SetCheck(set){const G=gistSave38();if(!G||G.sets[set])return false;const n=set==='keepsake'?G.keep.keepsake.length:set==='shells'?G.keep.shells.length:G.keep.carve.length;
 if(n<FOUND38.SETS[set])return false;G.sets[set]=S.day;found38Log('set',set);try{remember(FOUND38.UI.memory[set],'moment');}catch(e){}found38Emit('set',{set});return true;}
function found38Give(i){const F=FOUND38,G=gistSave38();if(!G||G.lost.status!=='pocket')return;const L=G.lost,it=F.LOST[L.i],who=it.owner,early=S.time<F.CHAIN_UNTIL;
 const n=found38Npc(who);if(!n)return;
 L.status='back';G.returned.push({id:it.id,day:S.day});try{aff(who,1);}catch(e){}
 let ks=F.KEEPSAKES[who];if(ks&&G.keep.keepsake.includes(ks))ks=null;if(ks)G.keep.keepsake.push(ks);
 found38Log('return',who+':'+it.id);if(ks)found38Log('keep','keepsake:'+ks);
 // the next one (§6.2): the first day's chain brings the second at once before 15:30; otherwise the next comes at midday tomorrow
 const ni=L.i+1;if(ni<F.LOST.length)G.lost=L.i===0&&early?{i:ni,since:S.day,at:Math.floor(S.time*1e4)/1e4,status:'out',heard:0,told:0,ownerTold:0}:{i:ni,since:S.day+1,at:F.LOST_AT,status:'out',heard:0,told:0,ownerTold:0};
 // the thank-you's second block tells you about the next thing (FOUND38.SPEECH.ty): Mama Nkechi names Ada's chisel (its owner is known from
 // now on), and Ada passes on Tunde's word about tomorrow's adapter; told about tomorrow, it is heard (Today: "Ada said yesterday: ...")
 const tn=F.TOLD_NEXT[it.id];if(tn&&ni<F.LOST.length&&G.lost.i===ni){if(tn.owner)G.lost.ownerTold=S.day;if(G.lost.since>S.day){G.lost.heard=S.day;G.lost.heardMode='thanks';G.lost.heardBy=who;}}
 const hint=ks&&G.shelf.state==='none'&&!G.once.shelfHint;if(hint)G.once.shelfHint=S.day;
 found38Emit('return',{id:it.id,owner:who,keepsake:ks});if(ks)found38Emit('keep',{kind:'keepsake',id:ks});if(ks)found38SetCheck('keepsake');
 found38Save();found38Sync();
 const ty=(typeof GIST38!=='undefined'&&GIST38&&GIST38.LINES&&GIST38.LINES.ty&&GIST38.LINES.ty[it.id])||F.SPEECH.ty[it.id==='glasses'&&!early?'glassesLate':it.id];
 const speech=(Array.isArray(ty)?ty:[ty]).map(t=>say(who,esc(t))).join('');
 const keep=ks?`<p class="gist38-keep">${esc(F.UI.keepsake[ks]+(hint?' '+F.UI.shelfHint:''))}</p>`:'';
 openPanel(`<section class="gist38-panel gist38-return"><p class="gist38-kicker">${esc(F.UI.returnKicker)}</p><h2>${esc(found38Name(who))}</h2><div class="gist38-thanks">${speech}</div>${keep}<div class="actions">${btn(F.UI.close,'gist38Close',{},'primary block')}</div></section>`);}
// the wash shell: a shell as the base counts one, its kind recorded
function found38Wash(i,arg){const F=FOUND38,W=F.world,G=gistSave38();const n=Number(arg),s=W.wash.find(x=>x.n===n);if(!G||!s)return;
 const l=life34();l.shells++;try{day34().gathered++;}catch(e){}G.wash.picked[n]=S.day;found38Drop(s.shell);found38Drop(s.decal);W.wash.splice(W.wash.indexOf(s),1);
 const isNew=!G.keep.shells.includes(s.kind);if(isNew)G.keep.shells.push(s.kind);
 found38Toast(found38Shell(s.kind).toast+(isNew?F.UI.newKind:''));if(isNew){found38Log('keep','shell:'+s.kind);found38Emit('keep',{kind:'shell',id:s.kind});found38SetCheck('shells');}
 try{if(typeof playPick==='function'&&players[i])playPick(players[i].g);}catch(e){}
 found38Save();found38Shelf();}
// Ada's carving: give her the fish you kept for her; she carves it overnight
function found38GiveAda(i){const F=FOUND38,G=gistSave38(),fa=found38ForAda(G);if(!fa||G.ada.gaveDay===S.day||!found38Npc('ada'))return;const f=found38Fish(fa.id);if(!f)return;
 let paid='';if(F.CARVE_PRICE>0){if(S.money<F.CARVE_PRICE){found38Toast(F.UI.carveNoMoney);return;}spend(F.CARVE_PRICE);paid=F.UI.carvePaid.replace('{price}',naira(F.CARVE_PRICE));}
 G.ada.pending={id:fa.id,day:S.day};G.ada.forAda=null;G.ada.gaveDay=S.day;try{aff('ada',1);}catch(e){}found38Log('carve',fa.id);
 found38Emit('carve',{id:fa.id});found38Save();
 const line=(typeof GIST38!=='undefined'&&GIST38&&GIST38.LINES&&GIST38.LINES.carve&&GIST38.LINES.carve[fa.id])||F.SPEECH.carve[fa.id];
 const note=F.UI.carveNote+' '+(G.shelf.state==='none'?F.UI.carveNoShelf:F.UI.carveShelf)+(paid?' '+paid:'');
 openPanel(`<section class="gist38-panel gist38-carve"><p class="gist38-kicker">${esc(F.UI.forAdaKicker)}</p><h2>${esc(found38Name('ada'))}</h2><div class="gist38-thanks">${say('ada',esc(line))}</div><p class="gist38-keep">${esc(note)}</p><div class="actions">${btn(F.UI.close,'gist38Close',{},'primary block')}</div></section>`);}
// one ACT_HOOKS entry
function found38Act(i,kind,arg){if(kind!=='gist38pick'&&kind!=='gist38give'&&kind!=='gist38wash'&&kind!=='gist38ada')return false;
 if(found38Online())return true;
 if(kind==='gist38give'||kind==='gist38ada')foundGuard38();
 if(kind==='gist38pick')found38Pick(i);else if(kind==='gist38give')found38Give(i);else if(kind==='gist38wash')found38Wash(i,arg);else found38GiveAda(i);
 return true;}
// a panel opened by an Act that came from a pointer (a touch Act: a pointer down now, or within the last 0.5 s of play) ignores clicks on
// itself for 0.4 s of play (FOUND38.t) and, while that pointer is down, until just after it comes up: a touch Act fires on pointerdown, and the
// click the browser makes at touchend would otherwise land on the panel's Close, which sits over both Act buttons on an upright phone (the
// session review, S3). A keyboard Act sets no guard. Real clicks only: dispatch() and the keys are untouched.
const GUARD38={until:-1,down:false,ptr:0,last:-9,HOLD:0.4,AFTER:0.05,RECENT:0.5};
function foundGuard38(){const g=GUARD38,t=FOUND38.t;if(!(g.ptr>0||t-g.last<g.RECENT)){g.until=-1;g.down=false;return;}g.until=t+g.HOLD;g.down=g.ptr>0;}
function foundPointer38(down){const g=GUARD38;if(down){g.ptr=1;g.last=FOUND38.t;return;}g.ptr=0;if(g.down){g.down=false;g.until=Math.max(g.until,FOUND38.t+g.AFTER);}}   // any pointer up ends the hold (never stuck)
// the click handler (capture phase): true when it swallowed the click
function foundPanelClick38(e){const g=GUARD38;if(!g.down&&FOUND38.t>=g.until)return false;const t=e&&e.target;if(!(t&&typeof t.closest==='function'&&t.closest('.gist38-panel')))return false;
 try{if(e.preventDefault)e.preventDefault();if(e.stopImmediatePropagation)e.stopImmediatePropagation();if(e.stopPropagation)e.stopPropagation();}catch(x){}return true;}
if(typeof document!=='undefined'&&document&&typeof document.addEventListener==='function'){document.addEventListener('click',foundPanelClick38,true);
 document.addEventListener('pointerdown',()=>foundPointer38(true),true);for(const ev of ['pointerup','pointercancel'])document.addEventListener(ev,()=>foundPointer38(false),true);}
ACT_HOOKS.push(function(i,kind,arg){return found38Act(i,kind,arg);});

/* ======================================================================================================================================
   8. Actions: the shelf (owner decision 3), the shelf panel, closing, "Keep it for Ada"
   ====================================================================================================================================== */
if(typeof ACTIONS!=='undefined'){
 ACTIONS.gist38Close=function(){closePanel();found38Save();};
 ACTIONS.gist38Shelf=function(){const F=FOUND38,G=gistSave38();if(!G||found38Online()||G.shelf.state!=='none')return;
  if(S.money<F.PRICE.shelf){found38Toast(F.UI.notEnough);return;}
  spend(F.PRICE.shelf);G.shelf={state:'ordered',day:S.day,upDay:0};found38Toast(F.UI.shelfOrdered);found38Log('buy','shelf38');found38Emit('shelf',{state:'ordered'});found38Save();
  try{if(typeof overlayOpen==='function'&&overlayOpen()&&typeof LIFE34!=='undefined'&&LIFE34.tab==='today'&&typeof openLife34==='function'&&String(panel.innerHTML).includes('gist38Shelf'))openLife34('today');}catch(e){}};
 ACTIONS.gist38ShelfView=function(){const G=gistSave38();if(!G||found38Online())return;openPanel(found38ShelfHTML(G));};
 ACTIONS.gist38ForAda=function(){const F=FOUND38,G=gistSave38(),l=S.life,c=l&&l.catch;if(!G||!c||!found38CarveOffer(G,c.id))return;
  const f=found38Fish(c.id);
  // through the base, as "Let it swim": the catch is settled, the cast ends, the days log sees it; then this page instead of its own
  ACTIONS.lifeCatch({v:'release'});if(l.catch)return;
  const ask=found38AskOpen(G);if(ask)ask.kept=S.day;
  G.ada.forAda={id:c.id,day:S.day};found38Emit('forAda',{id:c.id});found38Save();
  const html=`<p class="life-kicker">${esc(F.UI.forAdaKicker.toUpperCase())}</p><h2>${esc(F.UI.forAdaTitle.replace('{fish}',f.name.toLowerCase()))}</h2><p>${esc(F.UI.forAdaText)}</p><div class="actions">${btn(F.UI.castAgain,'lifeFish',{},'primary')}${btn(F.UI.backShore,'close',{},'quiet')}</div>`;
  if(typeof openLifePanel34==='function')openLifePanel34(html,'fish');else openPanel(html);};
 if(typeof LOCAL_ONLY!=='undefined')for(const n of ['gist38Close','gist38Shelf','gist38ShelfView','gist38ForAda'])LOCAL_ONLY.add(n);}
// Ada's ask (engineer C): the fish she names next, the window it bites in, whether she may name one for a day, the ask open now, her line
// the next fish Ada would name: the first in her order she has not carved, is not carving and has not been kept for her
function found38CarveNext(G){const a=G.ada,kept=found38ForAda(G);
 return FOUND38.CARVE_ASK.find(id=>!G.keep.carve.includes(id)&&!(a.pending&&a.pending.id===id)&&!(kept&&kept.id===id))||null;}
// the hours a fish Ada asked for bites in (the five day fish in the early afternoon, the catfish after six)
function found38FishWin(id){const W=FOUND38.FISH_WIN;return id==='catfish'?W.catfish:W.day;}
// may Ada name a fish for this day (today in her talk, tomorrow in the gist)? One ask a day; none while a fish kept for her waits, none on a day
// she has already had one, none online, none when nothing is left to carve; in a talk only while its window is still to come or open
function found38AskDue(G,day,via){if(!G||found38Online()||typeof S==='undefined'||!S)return false;const a=G.ada,ask=a.ask;
 if(ask&&ask.day>=day)return false;if(found38ForAda(G))return false;const id=found38CarveNext(G);if(!id)return false;
 if(via==='talk'){if(day!==S.day||a.gaveDay===S.day||S.time>=found38FishWin(id)[1])return false;}else if(day!==S.day+1)return false;
 return true;}
// the ask open now: asked for today and not yet kept
function found38AskOpen(G){const ask=G&&G.ada&&G.ada.ask;return ask&&ask.day===S.day&&!ask.kept&&!found38Online()?ask:null;}
// Ada's line naming the fish, for the gist (tomorrow) or her talk (today); pure: null when she may not ask
function found38AskLine(G,via){const day=via==='talk'?S.day:S.day+1;if(!found38AskDue(G,day,via))return null;const id=found38CarveNext(G),SP=FOUND38.SPEECH,
 g=(typeof GIST38!=='undefined'&&GIST38&&GIST38.LINES&&GIST38.LINES.ask)||SP.ask,list=id==='catfish'?(via==='talk'?g.catTalk:g.catGist):(via==='talk'?g.talk:g.gist);
 const e=Array.isArray(list[0])?list[day%list.length]:list;
 return {fish:id,day,id:e[0],text:String(e[1]).replace(/\{thing\}/g,SP.fishSay[id]||id)};}
// the ask is said (Ada's talk, or the gist line shown): kept in the save
function found38Asked(G,a,via){G.ada.ask={id:a.fish,day:a.day,via,said:S.day,casts:0,kept:0};found38Emit('ask',{id:a.fish,day:a.day,via});}
// the carving offer on a catch card: the fish Ada asked for today, until it is kept
function found38CarveOffer(G,id){const ask=found38AskOpen(G);return !!(ask&&ask.id===id&&FOUND38.CARVE.includes(id)&&G.ada.gaveDay!==S.day);}
// Today's carving row: the ask, the fish kept for her, or her carving (one row at a time)
function found38CarveRow(G){if(!G||found38Online())return null;const U=FOUND38.UI,name=id=>{const f=found38Fish(id);return f?f.name.toLowerCase():id;};
 const kept=found38ForAda(G);if(kept)return U.carveKept.replace('{fish}',name(kept.id)).replace('{until}',kept.day===S.day?U.untilTomorrow:U.untilToday);
 const p=G.ada.pending;if(p&&p.day===S.day)return (G.shelf.state==='none'?U.carveDoingNoShelf:U.carveDoing).replace('{fish}',name(p.id));
 const ask=found38AskOpen(G);if(ask&&S.time<found38FishWin(ask.id)[1])return ask.id==='catfish'?U.carveAskCat:U.carveAsk.replace('{fish}',name(ask.id));
 return null;}
function found38ShelfHTML(G){const F=FOUND38,U=F.UI,c=G.keep,fill=(t,v)=>String(t).replace(/\{(\w+)\}/g,(m,k)=>v[k]!=null?v[k]:'');
 const num=n=>['no','one','two','three','four','five','six'][n]||String(n);
 const row=(title,have,of,names,more,set)=>`<div class="gist38-set"><b>${esc(title)} · ${esc(fill(U.of,{n:have,m:of}))}${G.sets[set]?` · <span class="gist38-done">${esc(U.complete)}</span>`:''}</b><span>${esc(names.length?names.join(' · '):U.nothingYet)}${have<of?' · '+esc(more):''}</span></div>`;
 let h=`<section class="gist38-panel gist38-shelf"><h2>${esc(U.shelfTitle)}</h2>`;
 if(G.shelf.state!=='up')h+=`<p class="small">${esc(G.shelf.state==='ordered'?U.shelfSoon:U.shelfNone)}</p>`;else h+=`<p class="small">${esc(U.shelfSub)}</p>`;
 const keeps=F.KEEP_ORDER.filter(k=>c.keepsake.includes(k)).map(k=>U.keepName[k]);
 h+=row(U.setKeep,c.keepsake.length,F.SETS.keepsake,keeps,U.keepMore,'keepsake');
 const shells=F.SHELLS.filter(s=>c.shells.includes(s.id)).map(s=>s.short||s.id),miss=F.SETS.shells-c.shells.length;
 const shellMore=miss===1&&!c.shells.includes('cowrie')?U.shellMore:fill(U.shellsMore,{k:num(miss)});
 h+=row(U.setShells,c.shells.length,F.SETS.shells,shells,shellMore,'shells');
 if(c.carve.length||G.ada.pending){const carv=F.CARVE.filter(k=>c.carve.includes(k)).map(k=>{const f=found38Fish(k);return f?f.name.toLowerCase():k;});const k=F.SETS.carve-c.carve.length;
  h+=row(U.setCarve,c.carve.length,F.SETS.carve,carv,k===1?U.carveMoreOne:fill(U.carveMore,{k:num(k)}),'carve');}
 if(G.once&&G.once.playtest)h+=`<p class="gist38-foot">${esc(fill(U.playtest,{g:(G.eve&&G.eve.n)|0,r:G.returned.length,q:found38Quiet(S.day-1)}))}</p>`;
 return h+`<div class="actions">${btn(U.close,'gist38Close',{},'primary block')}</div></section>`;}
// the playtest footer's longest stretch with no logged event on a day (played seconds, as the day log keeps them)
function found38Quiet(day){try{if(typeof LOG35==='undefined')return '0:00';const ev=LOG35.events(day);let best=0;for(let k=1;k<ev.length;k++)best=Math.max(best,(ev[k].t|0)-(ev[k-1].t|0));
 return Math.floor(best/60)+':'+String(best%60).padStart(2,'0');}catch(e){return '0:00';}}
// the catch card gains a quiet "Keep it for Ada" before "Let it swim" (a second primary would break tune's one-button fishing)
if(typeof openLifePanel34==='function'){const prevLifePanel38=openLifePanel34;openLifePanel34=function(content,tab){
 try{const G=S&&S.life&&S.life.gist38?gistSave38():null,c=S&&S.life&&S.life.catch;
  if(G&&tab==='fish'&&c&&typeof content==='string'&&content.includes('class="catch34"')&&found38CarveOffer(G,c.id)){
   const at=content.indexOf('<button class="btn quiet" data-act="lifeCatch"');
   if(at>=0)content=content.slice(0,at)+btn(FOUND38.UI.forAdaBtn,'gist38ForAda',{},'quiet')+content.slice(at);}}catch(e){}
 return prevLifePanel38.call(this,content,tab);};}
// the fish Ada asked for bites only in its window (engineer C). The one R() draw that picks the species is steered, never added to, so the draw
// order is unchanged: outside the window her fish becomes the next fish along in the base's pool; inside it, on one cast in CARVE_ODDS (by hash)
// and by the fourth cast at the latest, the draw lands on her fish. Only while an ask is open (after discovery, offline); otherwise a pass-through.
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.lifeReel==='function'){const prevReel38=ACTIONS.lifeReel;ACTIONS.lifeReel=function(){
 let ask=null;try{ask=S&&S.life&&S.life.gist38?found38AskOpen(gistSave38()):null;}catch(e){ask=null;}
 const l=ask?S.life:null,f=ask&&typeof LIFE34!=='undefined'?LIFE34.fish:null;
 if(!ask||!l||l.catch||!f||f.phase!=='bite'||typeof R!=='function')return prevReel38.apply(this,arguments);
 const F=FOUND38,pool=S.time>=18?F.POOL.eve:F.POOL.day,w=found38FishWin(ask.id),inWin=S.time>=w[0]&&S.time<w[1],n=pool.length;
 const want=inWin&&(hash38(S.day,ask.casts|0,38)%F.CARVE_ODDS===0||(ask.casts|0)>=F.CARVE_SURE),keepR=R;let first=true;
 R=function(){const u=keepR.apply(this,arguments);if(!first)return u;first=false;let j=Math.min(n-1,Math.floor(u*n));const j0=j;
  if(inWin){if(want&&pool[j]!==ask.id){const k=pool.indexOf(ask.id);if(k>=0)j=k;}}else for(let s=0;s<n&&pool[j]===ask.id;s++)j=(j+1)%n;
  return j===j0?u:(j+Math.min(0.999,Math.max(0.001,u*n-j0)))/n;};
 let r;try{r=prevReel38.apply(this,arguments);}finally{R=keepR;}
 if(inWin&&l.catch){ask.casts=(ask.casts|0)+1;found38Save();}
 return r;};}
// Ada names the fish in her talk (engineer C): her table line for that talk is the ask, once a day, after discovery; her bench thank-you comes
// first when it is due (football's rule). The v35 evening, the bench and the gist (all {evening:true}) pass straight through.
if(typeof line35==='function'){const prevLine38c=line35;line35=function(who,ctx){
 if(who!=='ada'||!ctx||ctx.evening||typeof S==='undefined'||!S||!S.life||!S.life.gist38)return prevLine38c.apply(this,arguments);
 try{if(!(typeof fbBenchThanksDue37==='function'&&fbBenchThanksDue37('ada'))){const G=gistSave38(),a=found38AskLine(G,'talk');
   if(a){found38Asked(G,a,'talk');found38Save();return {id:a.id,text:a.text};}}}catch(e){if(typeof console!=='undefined')console.warn('found38 ask',e);}
 return prevLine38c.apply(this,arguments);};}

/* ======================================================================================================================================
   9. Wrappers: shells, the day, the world, a new household, the flat's extras, the shared state (spec §1.4, §8.2, §9, §10, §11)
   ====================================================================================================================================== */
// the morning shells after discovery: a kind each (by hash), its own toast, " One for the shelf." for a new kind; the base count unchanged
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.lifeShell==='function'){const prevShell38=ACTIONS.lifeShell;ACTIONS.lifeShell=function(d){
 const G=S&&S.life&&S.life.gist38&&!found38Online()?gistSave38():null;if(!G)return prevShell38.apply(this,arguments);
 const F=FOUND38,k=Number(d&&d.k),kind=F.COMMON[hash38(S.day,k,3)%F.COMMON.length],isNew=!G.keep.shells.includes(kind),n0=S.life.shells|0;
 const text=found38Shell(kind).toast+(isNew?F.UI.newKind:'');const t=toast;toast=function(m){if(m==='A smooth shell. Ada makes things with these.')m=text;return t.call(this,m);};
 let r;try{r=prevShell38.apply(this,arguments);}finally{toast=t;}
 if((S.life.shells|0)>n0&&isNew){G.keep.shells.push(kind);found38Log('keep','shell:'+kind);found38Emit('keep',{kind:'shell',id:kind});found38SetCheck('shells');found38Save();found38Shelf();}
 return r;};}
// the morning: the shelf ordered yesterday goes up; Ada's carving is done; the world for the new day
function found38Morning(){const G=S&&S.life&&S.life.gist38?gistSave38():null;if(!G||found38Online())return;let changed=false;
 if(G.shelf.state==='ordered'&&S.day>G.shelf.day){G.shelf.state='up';G.shelf.upDay=S.day;found38Log('keep','shelf');found38Emit('shelf',{state:'up'});changed=true;}
 const p=G.ada.pending;if(p&&S.day>p.day){if(!G.keep.carve.includes(p.id))G.keep.carve.push(p.id);G.ada.pending=null;found38Log('keep','carve:'+p.id);found38Emit('keep',{kind:'carve',id:p.id});found38SetCheck('carve');changed=true;}
 if(G.ada.forAda&&!found38ForAda(G)&&S.day>G.ada.forAda.day+1){G.ada.forAda=null;changed=true;}
 if(changed)found38Save();}
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.nextday==='function'){const prevNextday38=ACTIONS.nextday;ACTIONS.nextday=function(){
 const r=prevNextday38.apply(this,arguments);try{found38Morning();found38Sync();}catch(e){if(typeof console!=='undefined')console.warn('found38 nextday',e);}return r;};}
// the URL flag (?gist=now, ?gist=playtest): read once a page load, taken out of the address, noted for the tab (spec §15). gist-v38.js reads
// FOUND38.flags (it loads after this module, which has already taken the flag out of the address).
function found38Flags(){const F=FOUND38.flags;if(F.parsed)return F;
 try{const q=new URLSearchParams((typeof location!=='undefined'&&location.search)||'');const v=q.get('gist');if(!v)return F;F.parsed=true;F.value=v;
  if(v==='now')F.now=true;if(v==='playtest')F.playtest=true;
  try{if(typeof sessionStorage!=='undefined')sessionStorage.setItem('gist38.flag.'+v,'1');}catch(e){}
  q.delete('gist');try{if(typeof history!=='undefined'&&history.replaceState){const s=q.toString();history.replaceState(null,'',location.pathname+(s?'?'+s:'')+(location.hash||''));}}catch(e){}}catch(e){}
 return F;}
found38Flags();
// entering the world: everything of v38's comes down first, then whatever the state calls for goes up
if(typeof enterWorld==='function'){const prevEnter38=enterWorld;enterWorld=function(){try{found38Flags();found38Teardown();}catch(e){}
 const r=prevEnter38.apply(this,arguments);try{found38Sync();}catch(e){if(typeof console!=='undefined')console.warn('found38 world',e);}return r;};}
// a new household (or the question first): nothing of the old one stays in the scene
if(typeof ACTIONS!=='undefined'){for(const n of ['newgame','newconfirm']){const prev=ACTIONS[n];if(typeof prev!=='function')continue;
 ACTIONS[n]=function(){try{found38Teardown();}catch(e){}return prev.apply(this,arguments);};}}
// the flat's extras: the shelf is redrawn with the furniture (homeuse's pattern: after every furniture rebuild)
if(typeof refreshHomeExtras==='function'){const prevExtras38=refreshHomeExtras;refreshHomeExtras=function(){const r=prevExtras38.apply(this,arguments);
 try{found38Shelf();}catch(e){if(typeof console!=='undefined')console.warn('found38 shelf',e);}return r;};}
// the shared state online carries no finds record (device-only, as the day log)
if(typeof stripState==='function'){const prevStrip38=stripState;stripState=function(){const o=prevStrip38.apply(this,arguments);if(o&&o.life&&o.life.gist38)delete o.life.gist38;return o;};}

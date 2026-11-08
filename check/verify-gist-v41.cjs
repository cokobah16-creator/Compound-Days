// v41 Ada's commissions (dist/src/ada-v41.js, engineer A; dist/src/gifts-v41.js, engineer B; dist/src/daily-v41.js, the integrator), checked
// on the real game logic in Node with the shipped Three.js (v41/SPEC.md §16). Built on check/runtime-harness.cjs and the world of
// verify-gist-v40.cjs (the bench's world: a local two-player household made with the real setup actions, the sofa placed through its own success
// path), the players driven through the game's own key state (P1 WASD and E, P2 the arrows and Enter) and the real tick, one frame at a time.
// Setup may set the day, the time, S.money, S.home.items, S.home.storage and life34().shells, and v38-v40 state only through their own actions
// (v40 is discovered by a real read of the board with a card up); it never sets S.life.gist38.b41 and never calls a v41 action except through
// a hotspot act or a panel button's own data-act (the pure API functions of spec §1.7 are read). The clock, Math.random, Date and
// performance.now are stubbed; reads of performance.now, Date.now and Math.random made directly from ada-v41.js are counted, and Math.random
// calls inside v41's builds are counted (both must be 0). The results file holds no wall-clock value.
// The checks run twice in child processes and the two reports must match. Each mutant (a one-place change to a v41 file in a copy of dist) reruns
// only its named check, which must fail. Load passes: a copy of dist without the three v41 tags runs every check and each must fail there; a copy
// without the four v40 tags (v41 present) loads and installs nothing (the same scene count, Math.random calls, hooks and board as the copy with
// neither), and so do the copies without v39 and without v38; the verify-lines, verify-log and verify-tune subset copies with the v41 tags load
// with no error, no new global but v41's and no warning naming 39, 40 or 41. GIST41_JOBS (default 2, at most 2) runs the children in parallel.
// Engineer A's checks are 1, 2, 3, 4, 5 and 10 (mutants M1-M30, M53); B's 6, 7, 8, 11 and 12 (M31-M48, M50-M52); the integrator's 9 (M49, M54-M59).
// The fix round's game-logic findings (v41/build/RULINGS.md) add assertions to checks 2, 3, 4, 6, 7, 8 and 9 and mutants M60-M77; its screen
// and copy findings add assertions to checks 2, 3, 5 and 11 and mutants M78-M90. The collection's and the slate's real rectangles at
// 1280 x 800, 390 x 844 and 844 x 390 are measured in a browser (docs/TESTING_gist.md, v41 section); here their layout is checked by structure.
'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const OUT=path.join(__dirname,'results-gist-v41.json');
const GAME=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');process.env.COMPOUND_GAME_DIR=GAME;
const NAMES={
 1:'1. inert: (a) on day 3 at 10:00 before v38 is discovered the save, the keys of S and S.life, 600 frames of cameras and prompts, the Menu, Today and the pins (TICK_HOOKS 17, cue hooks 2, the audio recipes, LINES35, WHEN35, DAYS35.rows, FINDS34, ITEMS and PROP_FURN keys, the five pinned sources) are as without v41; (b) v40 discovered on day 5, days 6 and 7 (layer 2 closed): every digest as without v41, no v41 object, no G.b41; (c) layer 2 open, v41 not discovered (days 8-10 of a pair, day 9 a visit day, day 8 of a companion household, a walk past the station at 09:00): every digest as without v41 apart from the station\'s mesh and prompt, which show at the Yard and on the veranda; no G.b41; one HOTSPOT_HOOKS and one ACT_HOOKS entry, no ITEMS key',
 2:'2. station-and-order: (fix round, DOD-11, S14) the slate’s offers side by side and Back at the top right under 480 px of height; (DOD-8, C3) the veranda hand-over says Ada’s night line; no station on day 7 (G.b40 present), before 08:00, at 18:00 on a bench day or online; at the Yard\'s probed point from 08:00 on day 8; the failing probe (the point 2.2 m from every Yard prompt and spot, free and level; over a 3 m grid round the station the station\'s prompt top within its reach and every prompt as without v41 outside it; no v41 prompt round Ada; her talk and "Join Ada’s bench" top at their own points) with nothing open, a thing in the pocket, a piece ready and during the beat; discovery on the first read (G.b41, commission read), the two offers with their prices and things to bring; refused with "When you have it." when short; the deposit once through spend() for a double tap; Ada\'s terms, wood and ask; one at a time; on a visit day the station on the veranda from Ada\'s live chair in each of her five columns (none with the balcony full), discovery there, still there after six, gone once the gist begins; (fix round) Aunty Bisi due: the veranda station 2.2 m clear of her stop (S7), from 17:00 to 18:15 the station\'s prompt top at its point while she passes and round her at 17:20 her buy top wherever a player is nearer her (DOD-9); during the beat the polish top within its standing points\' reach (S4)',
 3:'3. making-and-collection: (fix round, DOD-2, S3) step 2 puts "Later" in the row where "Pay the rest" was and the offers below it, the panel held to the top; (S8) the new order in its own card; a piece waits for its thing (nothing on the trestle); cut the evening it is handed over, not ready that day, ready after Sleep before six, a reload and a jump, and two days on; no station after six on a bench day and no v41 prompt by Ada in the courtyard; a short purse: Ada\'s line, no pay button, nothing taken, the cloth, still there tomorrow; the balance through spend() with "Pay the rest" lower right; the next piece in the same panel with "Later" where "Pay the rest" was; the polish step with no money button lower right; "Later" recorded; no write to S.home.items or S.home.storage in any step; ITEMS and PROP_FURN keys, CARVE_PRICE 0 and the shelf\'s ₦5,000 unchanged; (fix round, S2) Mallam\'s order kept tonight and the next deposit would leave less: step 2 says so plainly and "Later" is the default, and the deposit is paid at the slate later that day',
 4:'4. polish: the sheen rises with presses and sinks without them; Ada\'s bubble at 0.3; the prompt "Polish the …" with the sheen bar; away 4 m pauses with the sheen kept; a reload restarts it from 0 with the piece paid for; rubbed to 0.75 with both turns, standing still does not finish it; the four runs (a lone human, a pair, a pair where only one presses, a companion household) at the cap rate and at the bot\'s rate each finish in 10-15 s with Ada\'s friendship +1, a pair where both rub in 10-12 s and a lone player in 13-15 s (fix round, DOD-3); the standing points beside the trestle and Ada\'s polish words over it, each bubble\'s anchor in view, none drawn where its anchor is not (S4); a lone player not rubbing for 1 s is offered the turn with Polish hidden; the hush after the beat and after "Leave it to Ada" (taps open no panel and spend no talk; four taps a second for 3 s from two points, the hush started again by each tap, DOD-1); on the veranda the gist begun during the polish finishes it as "Leave it to Ada" (DOD-7); at 390 x 844 and 844 x 390 the SCREEN-1 shape presses nothing and pays nothing, and a double tap on "Pay the rest" pays once and orders nothing; from a keyboard-opened panel the same',
 5:'5. bring-and-carry: (fix round, S9) the toast names the back wall and the piece just taken in is framed in the half of the player who took it in, then the framing ends; (C7, S12) the door plate’s own toast; (DOD-10, C10) the frame, name board and café sign models and the bundle’s size by model; the Finds block only while a thing sold there is wanted (the cards, paints and Bisi\'s tip unchanged below it), bought through spend(), gone once bought, never on the catch card; the bundle drawn while carried and hidden online; a flat piece drawn only once taken inside, in its place, with its toast, log and the first album memory; the mirror\'s shells button only with three kept, three taken once; the clock (Finds), the box (Dayo\'s block), the door plate (Finds) and the panel (Mr. Bassey\'s photograph); all six home with the sixth\'s memory, the slate\'s flat list ended; the box hidden with the fridge in storage; after a reload; none online, back offline',
 6:'6. gifts: the neighbour list in its order (the frame only once the print is back, the table once the minutes book is back); each neighbour\'s thing asked at their live place by the hour (Mrs. Oyelaran never 12:00-18:00, never during the gist), passed to A, handed over at the station; Mama Nkechi\'s ask only after the first flat piece, her bubble within 6 m by day, her message at the station, her stool free; gives at the live place by the hour with lead 1.0 (every earlier give wins a tie), friendship +1, no money; "one like yours" to over sixty pieces, never the same neighbour twice running, each pair once, then the woods again; the weekly option; the puff-puff at most once in fourteen days; (fix round) her stool by her name at the collection, the owner\'s sentence whole and the neighbour\'s follow-on (C2), no photo line for it (C4), no puff-puff for it (C8); "like yours" in no panel, prompt, toast or Today but the slate\'s offer (C1); never the same piece twice running in "one like yours" (S10)',
 7:'7. gist: the plan pure, the same as without v41 before discovery; after it at most one v41 line a night, never an insert (the gist as long as v40\'s plan), script.g39 and script.g40 kept, only the v41 line differs, the entry info:1 with v41k its id and no cat, today, v39 or v40k; v39\'s stool line kept; one save() per gist, the v41 id booked in G.b41.said before v40\'s one save; (fix round, DOD-4) never in a guest\'s opener or goodbye',
 8:'8. sweep: an eager pair and a companion household, inviting Ada daily and never, nights 8-40 (8-16 with GIST41_SHORT), discovery on the household\'s first walk to the station: a piece about every day, both lists advancing, the purse never negative, every v41 line true when said (who, where they were at the hour, where the piece is, where and when it was given), each id at most once in fourteen evenings, the said record pruned at 28 days; the receivers\' mention rate recorded; the set pieces, each on a night its speaker has a free place: a piece collected on the veranda (no photo line), Tunde\'s board given after noon (it goes up in the morning) and at the garden corner with Ada a guest (no hearsay), Mama Nkechi\'s stool cut (Ada\'s own line) and a piece waiting for its thing (nothing about the morning); (fix round) no v41 line in an opener or goodbye (DOD-4), a free place never one, and "making something for your flat" only while it is cut (C14a)',
 9:'9. today-and-log: v41\'s Today block (data-today41) straight after v40\'s block, outside the gist card, never before v41\'s discovery or online, Today otherwise exactly as without it; its six states in §14.1\'s order (a piece ready, a piece on the trestle, a piece in the hands, a thing to bring by place and hour, Mama Nkechi\'s word, a piece being made, the slate\'s offers), A\'s and B\'s own words, a neighbour\'s piece by the neighbour\'s name; Mrs. Oyelaran after noon "easiest in the morning"; at most two lines, one at 390 px; a busy day at 390 px (a thing lying out, then in the pocket, the wash, the pot, Aunty Bisi, v40\'s three lines, a piece ready and a piece in the hands): v40\'s block with its three lines, Bisi\'s sentence and v41\'s first line all there; the touch guard: the slate re-rendered by Order this holds a second tap, and Buy it in a shop block holds the shop panel\'s clicks for a second (dimmed); the log kinds commission and gift once each and the gates tool reading them with no warning; (fix round) the thing in the pocket and the shells still owed on Today (DOD-6), the glass handed over with the shells owed (DOD-5), and at 390 x 844 a touch Act at the rocks leaves the fishing panel open (S1)',
 10:'10. save-modes-and-cost: the scene after a new household as without v41; stripState has no life.gist38; online no v41 object, back offline; "No, keep it" changes nothing; none after an enterWorld into day 2 or newgame; no Math.random call inside v41\'s builds and no performance.now, Date.now or Math.random read by ada-v41.js; an inert frame: 0 blocked, 0 levelAt, 0 builds over 600 frames; v38-v40 saves keep the keys of S and S.life and gain no G.b41; a v41 save with all six pieces home, and one with a piece in the hands, load in the v40 build (a copy without the v41 tags) with no error through a visit day\'s reroute and the storage list, b41 kept',
 11:'11. copy: (fix round, C5, C6, C7, C9, C11, C13, C14, S11) every row of the reader sheet’s v41.3 reads the game’s own text, every id listed once, the questions numbered as v41.1; no thing “in your pocket” and none an abstraction; no money idiom at the rail; every v41 string (ADA41.LINES and GIFT41.LINES, B\'s wording where it has the id): ids gs41-/ad41-/gf41-/ui41-, no weekday or month, curly apostrophes, British spelling, no digit or ₦ in speech and at most 160 characters, "Flat 3" the only digit in UI and at most 200, no money word at the rail, no debt word in speech, no Pidgin in the slate\'s written words; every gist line in one family; no run of five words shared with any shipped string or another v41 string',
 12:'12. companion-and-interplay: the AI\'s trace over day 8 as without v41; aiGoal and aiThink carry no v41 code; no v41 prompt for the AI player over three days of a companion household (beside each neighbour, the station and the flat door); none at Mallam\'s stand or Aunty Bisi\'s stop; Finds\' page and Dayo\'s stall unchanged with no thing wanted'};
const ORDER=[1,2,3,4,5,6,7,8,9,10,11,12];
// one-place changes, each of which must turn its check red (pass:'noV39' or 'subset': a load pass of the mutant copy must fail instead)
const MUTANTS=[
 {name:'M1 gistSave41(true) without a read (in the step)',check:1,file:'ada-v41.js',find:'if(A.t<A.checkAt)return;A.checkAt=A.t+0.25;adaCheck41();};',replace:'if(A.t<A.checkAt)return;A.checkAt=A.t+0.25;gistSave41(true);adaCheck41();};'},
 {name:'M2 the station shown with layer 2 closed (G.b40 present, day 7)',check:1,file:'ada-v41.js',find:'return S.day>=ADA41.DAY&&S.day>(b.since|0);}',replace:'return true;}'},
 {name:'M3 a v41 hook pushed when v40 is not installed (the copy without v39)',check:1,pass:'noV39',file:'ada-v41.js',find:"if(ADA41.on&&typeof HOTSPOT_HOOKS!=='undefined')HOTSPOT_HOOKS.push(adaHot41);",replace:"if(typeof HOTSPOT_HOOKS!=='undefined')HOTSPOT_HOOKS.push(adaHot41);"},
 {name:'M4 a key added to ITEMS by v41',check:1,file:'ada-v41.js',find:"if(ADA41.on&&typeof HOTSPOT_HOOKS!=='undefined')HOTSPOT_HOOKS.push(adaHot41);",replace:"if(ADA41.on&&typeof HOTSPOT_HOOKS!=='undefined')HOTSPOT_HOOKS.push(adaHot41);if(ADA41.on&&typeof ITEMS!=='undefined')ITEMS.adashelf41={name:'Kitchen shelf',w:1,h:1,price:9000,wall:true,tags:[]};"},
 {name:'M5 a v41 global created inside the guard (the subset\'s otherNew)',check:1,pass:'subset',file:'ada-v41.js',find:"if(ADA41.on)adaFlags41();",replace:"if(ADA41.on)adaFlags41();if(ADA41.on)globalThis.adaStation=ADA41.STATION;"},
 {name:'M6 the station at every hour (a read and discovery at 19:00)',check:2,file:'ada-v41.js',find:'if(S.time>=ADA41.OPEN&&S.time<ADA41.CLOSE&&Math.hypot(x+4.2,z+15.6)<1.5)return \'bench\';',replace:'if(Math.hypot(x+4.2,z+15.6)<1.5)return \'bench\';'},
 {name:'M7 a v41 prompt pushed at Ada\'s NPC (covers "Talk to Ada")',check:2,file:'ada-v41.js',find:' // the door: a flat piece carried by this player\n',replace:" {const n=adaNpc41();if(n&&layer41()){const dd=d(n.g.position.x,n.g.position.z);if(dd<1.8)list.push({id:'slate41read',label:'Read Ada’s slate',dist:dd-1.0});}}\n // the door: a flat piece carried by this player\n"},
 {name:'M8 the deposit written to S.money without spend()',check:2,file:'ada-v41.js',find:'if(!((S.money|0)>=o.dep))return null;try{spend(o.dep);}catch(e){return null;}',replace:'if(!((S.money|0)>=o.dep))return null;S.money-=o.dep;'},
 {name:'M9 a second order while a piece is open',check:2,file:'ada-v41.js',find:'function orderPiece41(list){const b=gistSave41(false);if(!b||b.piece)return null;',replace:'function orderPiece41(list){const b=gistSave41(false);if(!b)return null;'},
 {name:'M10 the station\'s point 1.2 m from "Talk to Ada"',check:2,file:'ada-v41.js',find:'STATION:{yard:[-2.5,-17.5],',replace:'STATION:{yard:[-3.3,-16.4],'},
 {name:'M11 the station left at the Yard on a visit day (none on the veranda)',check:2,file:'ada-v41.js',find:"if(w==='bench')return {at:'yard',",replace:"if(w==='bench'||adaVisitDay41())return {at:'yard',"},
 {name:'M12 a piece cut at the order, without its thing',check:3,file:'ada-v41.js',find:"state:'wait',cutDay:null,paid:false,polished:false,oil:0,bring:B,",replace:"state:'cut',cutDay:S.day,paid:false,polished:false,oil:0,bring:B,"},
 {name:'M13 a piece ready on the day it is cut',check:3,file:'ada-v41.js',find:"function adaReady41(p){return !!(p&&p.state==='cut'&&typeof p.cutDay==='number'&&S.day>p.cutDay)",replace:"function adaReady41(p){return !!(p&&p.state==='cut'&&typeof p.cutDay==='number'&&S.day>=p.cutDay)"},
 {name:'M14 a cut piece lost on Sleep before six',check:3,file:'ada-v41.js',find:"try{adaBubblesOff41();adaRunReset41();ADA41.run.hushTo=-9;}catch(e){}",replace:"try{adaBubblesOff41();adaRunReset41();ADA41.run.hushTo=-9;const b=gistSave41(false);if(b&&b.piece&&b.piece.state==='cut'&&S.time<18)b.piece.state='wait';}catch(e){}"},
 {name:'M15 the collection offered after six on a day without a visit',check:3,file:'ada-v41.js',find:"if(S.time>=18)return 'courtyard';return 'away';}",replace:"if(S.time>=18)return 'bench';return 'away';}"},
 {name:'M16 the balance taken when the purse is short (no refusal)',check:3,file:'ada-v41.js',find:'const short=p.bal>0&&!((S.money|0)>=p.bal);',replace:'const short=false;'},
 {name:'M17 a v41 write to S.home.storage',check:3,file:'ada-v41.js',find:"const st=ada41Station();p.paid=true;p.state='ready';",replace:"const st=ada41Station();p.paid=true;p.state='ready';S.home.storage.push('art');"},
 {name:'M18 the polish calls passTime',check:4,short:true,file:'ada-v41.js',find:'r.last=i;r.glow=Math.min(1,r.glow+G.up);',replace:'r.last=i;r.glow=Math.min(1,r.glow+G.up);try{passTime(0.05);}catch(e){}'},
 {name:'M19 the sheen does not sink between rubs',check:4,short:true,file:'ada-v41.js',find:'r.glow=Math.max(0,r.glow-G.sink*dt);',replace:'r.glow=Math.max(0,r.glow);'},
 {name:'M20 "Polish" kept ahead of "Turn it over" after the first turn (the first draft\'s lone-player bug)',check:4,short:true,file:'ada-v41.js',find:'r.turns<G.turns&&(r.turns>0?(!(two&&me)||lone):r.glow>=(other?G.turnFrom:G.hold))',replace:'r.turns<G.turns&&(r.turns>0?(!me&&two):r.glow>=(other?G.turnFrom:G.hold))'},
 {name:'M21 the pair\'s 2.0 s rule dropped (a pair where only one presses cannot finish)',check:4,short:true,file:'ada-v41.js',find:'const lone=r.turnAt>0&&A.t-r.turnAt>=G.lone;',replace:'const lone=false;'},
 {name:'M22 the polish prompt offered to the AI player',check:4,short:true,file:'ada-v41.js',find:"if(!p||adaIsAI41(i)||(p.y||0)>1||(p.g&&p.g.sitting))return null;",replace:"if(!p||(p.y||0)>1||(p.g&&p.g.sitting))return null;"},
 {name:'M23 the collection panel without the class gist40-panel (the touch hold lost)',check:4,short:true,file:'ada-v41.js',find:"adaPanel41('gist41-collect gist41-step'+P.step,adaKicker41(st),title,body);",replace:"openPanel('<section class=\"gist41-collect\">'+body+'</section>');"},
 {name:'M24 the hold not re-armed on a step change (a double tap on "Pay the rest" orders)',check:4,short:true,file:'ada-v41.js',find:"title,body);if(rearm)adaRearm41();}",replace:"title,body);}"},
 {name:'M25 the hush dropped (a tap just after the beat opens a panel)',check:4,short:true,file:'ada-v41.js',find:'A.run.hushTo=A.t+A.STATION.hush;',replace:'A.run.hushTo=A.t;'},
 {name:'M26 the Finds block shown with no thing wanted',check:5,file:'ada-v41.js',find:"try{if(tab==='market'&&typeof content==='string'&&adaShopWant41('finds')){",replace:"try{if(tab==='market'&&typeof content==='string'){"},
 {name:'M26b the second half of M26: an empty block',with:'M26',file:'ada-v41.js',find:"function shopBlock41(from,canBuy){const p=adaShopWant41(from);if(!p)return '';",replace:"function shopBlock41(from,canBuy){const p=adaShopWant41(from);if(!p)return '<div class=\"life-note34 gist41-shop\"></div>';"},
 {name:'M27 the shop block on the catch card',check:5,file:'ada-v41.js',find:"try{if(tab==='market'&&typeof content==='string'&&adaShopWant41('finds')){",replace:"try{if(typeof content==='string'&&adaShopWant41('finds')){"},
 {name:'M27b the second half of M27: the block put first where Finds\' chips are missing',with:'M27',file:'ada-v41.js',find:"if(blk&&at>=0)content=content.slice(0,at)+blk+content.slice(at);}}",replace:"if(blk)content=content.slice(0,Math.max(0,at))+blk+content.slice(Math.max(0,at));}}"},
 {name:'M28 the mirror\'s shells taken with fewer than three kept',check:5,file:'ada-v41.js',find:"if(!l||(l.shells|0)<ADA41.SHELLS)return false;",replace:"if(!l)return false;"},
 {name:'M28b the second half of M28: the shells button never waits',with:'M28',file:'ada-v41.js',find:"return n>=ADA41.SHELLS?h:h.replace(",replace:"return true?h:h.replace("},
 {name:'M29 a flat piece drawn in the flat before it is taken inside',check:5,file:'ada-v41.js',find:"for(const f of ADA41.FLAT){if(!b.home[f.id])continue;",replace:"for(const f of ADA41.FLAT){if(!b.home[f.id]&&!(b.hand&&b.hand.id===f.id))continue;"},
 {name:'M30 the veranda station at a fixed point, not worked out from Ada\'s live seat',check:2,file:'ada-v41.js',find:"for(const dx of [0,V.side,-V.side]){const x=ax+dx,z=az+V.south;",replace:"for(const dx of [0,V.side,-V.side]){const x=-6.65+dx,z=6.3+V.south;"},
 {name:'M53 the station built outside quiet41',check:10,file:'ada-v41.js',find:'if(!W.station){W.station=quiet41(stationModel41);',replace:'if(!W.station){W.station=stationModel41();'},
 //@@BMUT
 {name:'M31 a neighbour\'s piece given to Mrs. Oyelaran at 14:00 (her seat read, not her live figure)',check:6,file:'gifts-v41.js',find:"function giftNpc41(k){try{return typeof found38Npc==='function'?found38Npc(k):null;}catch(e){return null;}}",replace:"function giftNpc41(k){try{const n=typeof found38Npc==='function'?found38Npc(k):null;return n||(k==='oyelaran'?{g:{position:{x:-0.35,z:-3.45}}}:null);}catch(e){return null;}}"},
 {name:'M31b',with:'M31',file:'gifts-v41.js',find:"function giftGiveOK41(k){if(giftOyOut41(k)||giftInGist41())return false;",replace:"function giftGiveOK41(k){if(giftInGist41())return false;"},
 {name:'M32 the frame offered before Mr. Bassey\'s print is back',check:6,file:'gifts-v41.js',find:"function giftNeedOK41(b,x){return !x.needs||giftBack41(b,x.needs);}",replace:"function giftNeedOK41(b,x){return true;}"},
 {name:'M33 the same neighbour twice running in "one like yours"',check:6,file:'gifts-v41.js',find:"LIKE:{salt:414,notTwice:true,",replace:"LIKE:{salt:414,notTwice:false,"},
 {name:'M34 Mama Nkechi\'s stool charges the household',check:6,file:'ada-v41.js',find:"price:0,dep:0,bal:0,state:'cut'",replace:"price:8000,dep:0,bal:8000,state:'cut'"},
 {name:'M35 a gift adds money to the purse',check:6,file:'gifts-v41.js',find:"try{if(typeof aff==='function'&&S.nb&&S.nb[k])aff(k,1);}catch(e){}",replace:"try{if(typeof aff==='function'&&S.nb&&S.nb[k])aff(k,1);S.money+=500;}catch(e){}"},
 {name:'M36 the gift\'s give at lead 1.25 (beats v38\'s give)',check:6,file:'gifts-v41.js',find:"LEAD:{give:1.0,",replace:"LEAD:{give:1.25,"},
 {name:'M37 no "woods again" (the neighbour list runs dry)',check:6,file:'gifts-v41.js',find:"if(full||stuck){cyc++;done=[];rem=left(done);}",replace:"if(false){cyc++;done=[];rem=left(done);}"},
 {name:'M38 a neighbour\'s ask offered while the gist runs',check:6,file:'gifts-v41.js',find:"function giftAskOK41(k){return !giftOyOut41(k)&&!giftInGist41()&&!!giftNpc41(k);}",replace:"function giftAskOK41(k){return !giftOyOut41(k)&&!!giftNpc41(k);}"},
 {name:'M39 the plan wrapper inserts the v41 line',check:7,file:'gifts-v41.js',find:"sc[q]=e;sc.g41=",replace:"sc.splice(q,0,e);sc.g41="},
 {name:'M40 the plan wrapper drops script.g40',check:7,file:'gifts-v41.js',find:"for(const x of Object.keys(p.script))if(!/^\\d+$/.test(x))sc[x]=p.script[x];",replace:"for(const x of Object.keys(p.script))if(!/^\\d+$/.test(x)&&x!=='g40')sc[x]=p.script[x];"},
 {name:'M41 the v41 entry without info:1 (v40\'s guard may swap it)',check:7,file:'gifts-v41.js',find:"v41k:id,info:1,key41:",replace:"v41k:id,key41:"},
 {name:'M42 the plan wrapper writes G.b41.said',check:7,file:'gifts-v41.js',find:"const old=sc[q],e={k:c.k,",replace:"b.said[id]=S.day;const old=sc[q],e={k:c.k,"},
 {name:'M43 the done wrapper calls save() itself',check:7,file:'gifts-v41.js',find:"return prevDone41.apply(this,arguments);};}",replace:"try{save();}catch(e){}return prevDone41.apply(this,arguments);};}"},
 {name:'M44 gs41-ba-photo after a collection on the veranda',check:8,short:true,file:'gifts-v41.js',find:"filter(r=>r.at==='yard'&&r.time>=8.25)",replace:"filter(r=>r.time>=8.25)"},
 {name:'M45 gs41-ad-open while the piece waits for its thing',check:8,short:true,file:'gifts-v41.js',find:"if(pc&&pc.state==='cut'&&pc.cutDay===day){",replace:"if(pc&&(pc.state==='cut'&&pc.cutDay===day||pc.state==='wait')){"},
 {name:'M46 gs41-tu-board for a board given after noon',check:8,short:true,file:'gifts-v41.js',find:"return r.place==='yard'&&t<12?'tu-board':'tu-board-am';",replace:"return 'tu-board';"},
 {name:'M47 gs41-ad-gift for a gift at the photo corner',check:8,short:true,file:'gifts-v41.js',find:"(r.place==='shop'||((r.place==='waterfront'",replace:"(r.place==='shop'||r.place==='yard'||((r.place==='waterfront'"},
 {name:'M48 gs41-ad-open for Mama Nkechi\'s stool',check:8,short:true,file:'gifts-v41.js',find:"if(pc.id==='nkstool')out.push({n:4,k:'ada',fam:'ad-nk',",replace:"if(pc.id==='nkstool')out.push({n:4,k:'ada',fam:'ad-open',"},
 {name:'M50 a gist line that names paying',check:11,file:'gifts-v41.js',find:"'gs41-ad-gift':'I hear my work has gone to a neighbour’s. Good.",replace:"'gs41-ad-gift':'I hear my work has gone to a neighbour’s and was paid for without arguing. Good."},
 {name:'M51 a v41 line sharing five words with a shipped line',check:11,file:'gifts-v41.js',find:"'gs41-ad-gift2':'Somebody told me a piece of mine went visiting today.",replace:"'gs41-ad-gift2':'A smooth shell. Ada makes things with these. Somebody told me a piece of mine went visiting today."},
 {name:'M52 an aiGoal wrapper that walks the companion to the station',check:12,file:'gifts-v41.js',find:"if(GIFT41.on&&typeof ACTIONS!=='undefined'){const prev=ACTIONS.newgame;",replace:"if(GIFT41.on&&typeof aiGoal==='function'){const pg41=aiGoal;aiGoal=function(p,dt){if(S.day>=8&&S.time>=9&&S.time<9.5&&typeof aiNavTo==='function')return aiNavTo(p,-2.5,-16.4,0.6);return pg41.apply(this,arguments);};}\nif(GIFT41.on&&typeof ACTIONS!=='undefined'){const prev=ACTIONS.newgame;"},
 //@@BMUT-END
 //@@IMUT (the integrator's, check 9)
 {name:'M49 Today\'s v41 line pushed into the gist card\'s rows',check:9,file:'daily-v41.js',find:"   return at<0?h:h.slice(0,at)+blk+h.slice(at);}catch(e){if(typeof console!=='undefined')console.warn('daily41 today',e);return h;}};}",replace:"   {const g=h.indexOf('<div class=\"life-note34 gist38-card\">');if(g>=0)at=g+'<div class=\"life-note34 gist38-card\">'.length;}return at<0?h:h.slice(0,at)+blk+h.slice(at);}catch(e){if(typeof console!=='undefined')console.warn('daily41 today',e);return h;}};}"},
 {name:'M54 two v41 lines at 390 px (the narrow cap dropped)',check:9,file:'daily-v41.js',find:"const cap=(typeof innerWidth==='number'&&innerWidth<=DAILY41.NARROW)?DAILY41.MAX_NARROW:DAILY41.MAX;",replace:"const cap=DAILY41.MAX;"},
 {name:'M55 the lines not in §14.1\'s order of urgency',check:9,file:'daily-v41.js',find:"return out.sort((x,y)=>x.r-y.r);}catch(e){return [];}}",replace:"return out;}catch(e){return [];}}"},
 {name:'M56 a neighbour\'s piece called "your" piece on Today (Mama Nkechi\'s stool)',check:9,file:'daily-v41.js',find:"const nbv=x=>x&&x.list==='nb'&&x.for?{name:dailyName41(x.for),piece:adaPieceName41(x)}:null;",replace:"const nbv=x=>null;"},
 {name:'M57 the slate re-rendered by "Order this" without the hold re-armed (a double tap lands on Back)',check:9,file:'daily-v41.js',find:"ACTIONS.ada41Order=function(){const r=prevOrder41.apply(this,arguments);dailyRearm41();return r;};",replace:"ACTIONS.ada41Order=function(){const r=prevOrder41.apply(this,arguments);return r;};"},
 {name:'M58 no hold after "Buy it" (a double tap on the shop block buys a Finds card)',check:9,file:'daily-v41.js',find:"DAILY41.shop=FOUND38.t+DAILY41.HOLD;DAILY41.n41.shop++;",replace:"DAILY41.n41.shop++;"},
 {name:'M59 Today creates G.b41 (v41 discovered, and its block shown, before the slate is read)',check:9,file:'daily-v41.js',find:"const b=gistSave41(false);if(!b)return [];",replace:"const b=gistSave41(true);if(!b)return [];"},
 //@@IMUT-END
 // (fix round: the game-logic findings of v41's reviews, v41/build/RULINGS.md)
 {name:'M60 a v41 line in a guest\'s opener or goodbye (DOD-4, S13)',check:7,file:'gifts-v41.js',find:"s.swap40&&gistSlotOK41(s)&&['v38'",replace:"s.swap40&&['v38'"},
 {name:'M61 Mr. Bassey\'s photo line for Mama Nkechi\'s stool (C4)',check:6,short:true,file:'gifts-v41.js',find:".filter(r=>r.list==='flat')",replace:""},
 {name:'M62 the puff-puff armed by Mama Nkechi\'s own stool (C8)',check:6,short:true,file:'gifts-v41.js',find:"if(k==='nkechi'&&h.id!=='nkstool'){",replace:"if(k==='nkechi'){"},
 {name:'M63 a neighbour\'s piece called the household\'s own at the collection (C2)',check:6,short:true,file:'ada-v41.js',find:"function adaTitle41(p){return p&&p.list==='nb'&&p.for?",replace:"function adaTitle41(p){return false?"},
 {name:'M63b',with:'M63',file:'ada-v41.js',find:"label:p.list==='nb'&&p.for?adaText41('ui41-collect-nb'",replace:"label:false?adaText41('ui41-collect-nb'"},
 {name:'M63c',with:'M63',file:'ada-v41.js',find:"(c.list==='nb'?adaSay41('ad41-polish-gift',{name:adaName41(c.for)}):adaSay41('ad41-polish-own'))",replace:"adaSay41('ad41-polish-own')"},
 {name:'M64 a copy named by its slate label everywhere ("<piece> like yours", C1)',check:6,short:true,file:'ada-v41.js',find:"if(p.base)return p.base;if(p.list==='nb'){",replace:"if(p.list==='never'){"},
 {name:'M65 "one like yours" by hash38 alone (the same piece twice running, S10)',check:6,short:true,file:'gifts-v41.js',find:"const pair=pool[giftH41(L.n|0,GIFT41.LIKE.salt,cyc)%pool.length];",replace:"const pair=rem[giftH41(L.n|0,GIFT41.LIKE.salt,cyc)%rem.length];"},
 {name:'M66 "That is all I was waiting for" with the shells still owed (DOD-5)',check:9,file:'ada-v41.js',find:"adaSay41(owed?'ad41-bring-glass-got':'ad41-bring-got')",replace:"adaSay41('ad41-bring-got')"},
 {name:'M67 Today silent with the thing for Ada in the pocket (DOD-6)',check:9,file:'daily-v41.js',find:"if(p&&p.state==='wait'&&p.bring&&p.bring.got&&!p.bring.handed)push('pocket',",replace:"if(false)push('pocket',"},
 {name:'M68 the next order\'s deposit taken with nothing said about tonight\'s sellers (S2)',check:3,file:'ada-v41.js',find:"function adaKeep41(){const K=ADA41.KEEP,out={n:0,why:[]};",replace:"function adaKeep41(){const K=ADA41.KEEP,out={n:0,why:[]};return out;"},
 {name:'M69 the hush not started again by a tap (DOD-1, S5)',check:4,short:true,file:'ada-v41.js',find:"if(kind==='ada41hush'){if(adaHushed41())ADA41.run.hushTo=ADA41.t+ADA41.STATION.hush;return true;}",replace:"if(kind==='ada41hush'){return true;}"},
 {name:'M70 two rubbers each at their own rate (the household\'s slot dropped, DOD-3, S6)',check:4,short:true,file:'ada-v41.js',find:"if(r.pose[i]>A.t||!adaRubSlot41()){r.buf[i]='rub';return;}",replace:"if(r.pose[i]>A.t){r.buf[i]='rub';return;}"},
 {name:'M71 the paid piece left on the veranda\'s trestle when the gist begins (DOD-7)',check:4,short:true,file:'ada-v41.js',find:"(b.coll.at==='veranda'&&adaGistBegun41())",replace:"false"},
 {name:'M72 Ada\'s polish bubbles over Ada at her bench, not the trestle (S4)',check:4,short:true,file:'ada-v41.js',find:"return bubble41(adaText41(id,v),ms||3600,W.station,1.5);",replace:"return adaSays41(id,v,ms);"},
 {name:'M73 a bubble drawn for a camera that cannot see its anchor (S4)',check:4,short:true,file:'ada-v41.js',find:"if(!adaAnchorIn41(f,camera))b.scale.set(1e-4,1e-4,1);}",replace:"}"},
 {name:'M74 Aunty Bisi\'s buy ahead of the station within its reach (DOD-9)',check:2,file:'ada-v41.js',find:"if(e&&g&&!(d(g.position.x,g.position.z)<dd)&&e.dist<=v)v=e.dist-0.001;",replace:""},
 {name:'M75 the veranda station beside Aunty Bisi\'s stop (S7)',check:2,file:'ada-v41.js',find:"if(adaBisiDue41()){out.push(BISI39.ROUTE.stop);",replace:"if(false){out.push(BISI39.ROUTE.stop);"},
 {name:'M76 the fishing panel closed by the touchend\'s own click (S1)',check:9,file:'daily-v41.js',find:"function dailyFishArm41(i,was){const D=DAILY41;try{",replace:"function dailyFishArm41(i,was){const D=DAILY41;try{return false;"},
 {name:'M77 "making something for your flat" while the piece waits for its thing (C14a)',check:8,short:true,file:'gifts-v41.js',find:"only:pc.state==='cut'&&!(pc.cutDay<day)?null:['gs41-nk-open2']",replace:"only:null"},
 // the fix round's screen and copy findings (fix-screen)
 {name:'M78 step 2\'s offers above "Later" again (an Order button where "Pay the rest" was, DOD-2, S3)',check:3,file:'ada-v41.js',find:"body=`<div class=\"gist41-head\">${adaSay41('ad41-next')}${warn}</div><div class=\"actions gist41-steps\">",replace:"body=`<div class=\"gist41-head\">${adaSay41('ad41-next')}${warn}</div><div class=\"gist41-next gist41-offers\">${o.html}</div><div class=\"actions gist41-steps\">"},
 {name:'M79 the collection panel centred again (a taller step moves the rows, DOD-2)',check:3,file:'ada-v41.css',find:"#ov:has(> #panel > .gist41-collect){align-items:flex-start;",replace:"#ov:has(> #panel > .gist41-collectx){align-items:flex-start;"},
 {name:'M80 the slate\'s Back held to the bottom under 480 px of height (over the offers, DOD-11, S14)',check:2,file:'ada-v41.css',find:"#panel .gist41-slate>.gist41-actions{position:absolute;",replace:"#panel .gist41-slate>.gist41-actions{position:sticky;"},
 {name:'M81 the new order\'s lines under the collected piece\'s heading (S8)',check:3,file:'ada-v41.js',find:"+(P.order?adaOrderedHTML41(P.order):'');}",replace:";if(P.order)body=adaTermsHTML41(P.order)+body;}"},
 {name:'M82 "We can choose here" at the veranda hand-over (DOD-8, C3)',check:2,file:'ada-v41.js',find:"adaSay41('ad41-bring-got')+adaSay41('ad41-night')",replace:"adaSay41('ad41-bring-got')+(st&&st.at==='veranda'?'<p>We can choose here.</p>':adaSay41('ad41-night'))"},
 {name:'M83 the piece taken in not framed (off the half from the door, S9)',check:5,file:'ada-v41.js',find:"try{if(typeof rebuildFurniture==='function')rebuildFurniture();}catch(e){}adaFrame41(i,h.id);adaSave41();}",replace:"try{if(typeof rebuildFurniture==='function')rebuildFurniture();}catch(e){}adaSave41();}"},
 {name:'M84 the door plate "inside" (C7, S12)',check:5,file:'ada-v41.js',find:"adaToast41(h.id==='plate'?adaLine41('gf41-plate-toast'):",replace:"adaToast41(false?adaLine41('gf41-plate-toast'):"},
 {name:'M85 the frame built as the shells mirror (DOD-10, C10)',check:5,file:'gifts-v41.js',find:"name:'frame for the wedding print',model:'frame',",replace:"name:'frame for the wedding print',model:'mirror',"},
 {name:'M86 the name board and the café sign a plain plank (DOD-10, C10)',check:5,file:'ada-v41.js',find:"case 'nboard':case 'nsign':{",replace:"case 'nboard-x':case 'nsign-x':{"},
 {name:'M87 the bundle\'s size by the piece\'s id only (DOD-10)',check:5,file:'ada-v41.js',find:"return [id,model].some(x=>S41.includes(String(x)))?'small':'medium';",replace:"return [id].some(x=>S41.includes(String(x)))?'small':'medium';"},
 {name:'M88 a shipped line changed and the reader sheet not regenerated (C5)',check:11,file:'gifts-v41.js',find:"I have written it down, so Ada cannot argue.",replace:"I have written it down, so Ada will not argue."},
 {name:'M89 a clock "in your pocket" (C9)',check:11,file:'ada-v41.js',find:"'ui41-got':'{Thing} for Ada, carried with you.',",replace:"'ui41-got':'{Thing} for Ada, in your pocket.',"},
 {name:'M90 the sign\'s words handed over as an abstraction (C14 c)',check:11,file:'gifts-v41.js',find:"thing:'a paper with the sign’s words',short:'paper with the sign’s words',",replace:"thing:'the sign’s words',short:'sign’s words',"},
  // the repair round's findings (v41/build/RULINGS-2.md, repair2/fix2)
 {name:'M91 no walk to the standing points when the beat begins (R2-1)',check:4,short:true,file:'ada-v41.js',find:"function adaWalkStart41(){const A=ADA41,r=A.run,st=ada41Station();r.walked=true;r.walk={};",replace:"function adaWalkStart41(){const A=ADA41,r=A.run,st=ada41Station();r.walked=true;r.walk={};return;"},
 {name:'M92 the players let go at the standing points (the idle turn towards the camera, R2-1)',check:4,short:true,file:'ada-v41.js',find:"p.idleT=0;G.at=[x,z];}}",replace:"G.at=[x,z];if(G.n>=G.path.length)delete W[k];}}"},
 {name:'M93 the standing points back at 0.6 m and 0.25 m (a player\'s body over the piece, R2-1)',check:4,short:true,file:'ada-v41.js',find:"side:0.8,sideZ:0.1,sideR:1.05},",replace:"side:0.6,sideZ:0.25,sideR:1.05},"},
 {name:'M94 a lone player walked to the farther standing point (R2-1)',check:4,short:true,file:'ada-v41.js',find:"pick[who[0]]=far(pos(who[0]),sd[0])<=far(pos(who[0]),sd[1])?0:1;",replace:"pick[who[0]]=far(pos(who[0]),sd[0])<=far(pos(who[0]),sd[1])?1:0;"},
 {name:'M95 a passing neighbour\'s talk ahead of the polish (R2-2)',check:4,short:true,file:'ada-v41.js',find:"function adaFirst41(list,v){let m=Math.min(v,-ADA41.LEAD.beat);",replace:"function adaFirst41(list,v){return v;let m=0;"},
 {name:'M96 the polish left on the Yard\'s trestle at six (repair 2, DOD-7 at the Yard)',check:4,short:true,file:'ada-v41.js',find:"||(b.coll.at==='yard'&&S.time>=A.CLOSE)",replace:""},
 {name:'M97 the slate "Waiting for its mirror glass" with only the shells owed (R2-3)',check:5,file:'ada-v41.js',find:"thing:owed?adaLine41('ui41-shells-owed'):B?",replace:"thing:false?adaLine41('ui41-shells-owed'):B?"},
 {name:'M98 "Four cup hooks for Ada: you have it with you." (R2-4)',check:11,file:'ada-v41.js',find:"'ui41-got':'{Thing} for Ada, carried with you.',",replace:"'ui41-got':'{Thing} for Ada: you have it with you.',"},
 {name:'M99 Mr. Bassey\'s "your piece" for Tunde\'s name board (R2-5)',check:6,short:true,file:'gifts-v41.js',find:".filter(r=>r.list==='flat')",replace:".filter(r=>r.id!=='nkstool'&&r.for!=='bassey')"},
 {name:'M100 Today silent on a purse short of Mallam\'s price (the purse reminder)',check:9,file:'daily-v41.js',find:"return money<DAILY41.PRICE?{price:DAILY41.PRICE,money}:null;",replace:"return null;"},
 {name:'M101 a mouse click before a key press taken for a touch (repair 2)',check:9,file:'daily-v41.js',find:"return DAILY41.ptype!=='mouse';",replace:"return true;"},
];

const TAGS41=[/<script type="text\/javascript" src="src\/ada-v41\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/gifts-v41\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/daily-v41\.js"><\/script>\n?/];
const TAGS40=[/<script type="text\/javascript" src="src\/board-v40\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/mallam-v40\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/gist-v40\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/daily-v40\.js"><\/script>\n?/];
const TAGS39=[/<script type="text\/javascript" src="src\/seller-v39\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/gist-v39\.js"><\/script>\n?/];
const TAGS38=[/<script type="text\/javascript" src="src\/found-v38\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/gist-v38\.js"><\/script>\n?/];
const strip=(html,tags)=>{let o=html;for(const T of tags)o=o.replace(T,'');return o;};
// a copy of dist with index.html changed by htmlFn and the named src files by srcFns (everything else linked)
function variantDir(htmlFn,srcFns,base){base=base||GAME;const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd41-gist-'));srcFns=srcFns||{};
 for(const f of ['assets','data'])if(fs.existsSync(path.join(base,f)))fs.symlinkSync(path.join(base,f),path.join(d,f));
 fs.mkdirSync(path.join(d,'src'));for(const f of fs.readdirSync(path.join(base,'src'))){if(srcFns[f]){fs.writeFileSync(path.join(d,'src',f),srcFns[f](fs.readFileSync(path.join(base,'src',f),'utf8')));continue;}fs.symlinkSync(path.join(base,'src',f),path.join(d,'src',f));}
 fs.writeFileSync(path.join(d,'index.html'),htmlFn?htmlFn(fs.readFileSync(path.join(base,'index.html'),'utf8')):fs.readFileSync(path.join(base,'index.html'),'utf8'));return d;}
// the subset copies the v35 harnesses make (bare -v35 tags after the cut removed; typed tags stay), optionally without the v41 tags
function subsetDir41(last,noV41){const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd41-sub-'));
 for(const f of ['assets','src','data'])if(fs.existsSync(path.join(GAME,f)))fs.symlinkSync(path.join(GAME,f),path.join(d,f));
 let html=fs.readFileSync(path.join(GAME,'index.html'),'utf8'),cut=false;
 for(const [tag,src] of [...html.matchAll(/<script src="([^"]+-v35\.js)"><\/script>\n?/g)]){if(cut)html=html.replace(tag,'');if(src.endsWith('/'+last))cut=true;}
 if(!cut){fs.rmSync(d,{recursive:true,force:true});throw new Error('subset: '+last+' not found');}
 if(noV41)html=strip(html,TAGS41);fs.writeFileSync(path.join(d,'index.html'),html);return d;}

// the world of verify-gist-v40.cjs (copied)
async function world(){const {benchWorld}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));const h=await benchWorld();const {run,context}=h;
 const store=new Map();context.sessionStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 run("var PH='',TOASTS=[],PHN=0;{const o=openPanel;openPanel=function(h){if(!silentMode()){PH=h;PHN++;}return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}");
 run("var hxOVC=ov.classList.contains;var hxOverlay=on=>{ov.classList.contains=on?(c=>c==='on'):hxOVC;};");
 run("{const o=openPanel,c=closePanel;openPanel=function(h){const r=o.apply(this,arguments);if(!silentMode())hxOverlay(true);return r;};closePanel=function(){const r=c.apply(this,arguments);if(!silentMode())hxOverlay(false);return r;};}");
 run(`var hxF=()=>typeof FOUND38!=='undefined'?FOUND38:null;var hxG=()=>(S&&S.life&&S.life.gist38)||null;
 var hxKEYS=[{up:'w',down:'s',left:'a',right:'d',act:'e'},{up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright',act:'enter'}];
 var hxSetKeys=(i,dir)=>{const K=hxKEYS[i];keys[K.up]=keys[K.down]=keys[K.left]=keys[K.right]=false;if(!dir)return;if(dir[0]<0)keys[K.left]=true;if(dir[0]>0)keys[K.right]=true;if(dir[1]<0)keys[K.up]=true;if(dir[1]>0)keys[K.down]=true;};
 var hxNoKeys=()=>{hxSetKeys(0,null);hxSetKeys(1,null);keys['e']=false;keys['enter']=false;};
 var hxRaw=(x,z)=>{const fl=Math.hypot(CAM_DIR.x,CAM_DIR.z),fx=-CAM_DIR.x/fl,fz=-CAM_DIR.z/fl,n=Math.hypot(x,z)||1;return [(x*(-fz)-z*fx)/n,(x*fx-z*fz)/n];};
 var hxCombo=(wx,wz)=>{let best=null,bd=-2;for(const x of [-1,0,1])for(const z of [-1,0,1]){if(!x&&!z)continue;const v=hxRaw(x,z),d=(v[0]*wx+v[1]*wz)/Math.hypot(wx,wz);if(d>bd){bd=d;best=[x,z];}}return best;};
 var hxAt=(i,x,z,face)=>{const p=players[i];p.g.position.set(x,0,z);p.prev=[x,z];p.y=0;p.lvl=0;p.g.baseY=0;if(face){p.face=[face[0],face[1]];p.g.rotation.y=Math.atan2(face[0],face[1]);}};
 var hxPos=i=>[players[i].g.position.x,players[i].g.position.z];
 var hxPress=i=>{keys[hxKEYS[i].act]=true;act[i]=true;if(!lastInput[i]||lastInput[i]==='pad')lastInput[i]='key';};
 var hxRelease=i=>{keys[hxKEYS[i].act]=false;};
 var hxFT=0,hxDT=1000/30;
 var hxFrames=n=>{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<n;k++){T35+=hxDT;PERF35+=hxDT;last=hxFT;hxFT+=hxDT;tick(hxFT);}}finally{renderFrame=rf;}};
 var hxScreen=(w,h,touch)=>{innerWidth=w;innerHeight=h;navigator.maxTouchPoints=touch?1:0;for(let i=0;i<2;i++){const vp=v21Viewport(i);cams[i].aspect=vp.w/vp.h;cams[i].updateProjectionMatrix();}};
 var hxQC={in:0,n:0};var hxReclock=()=>{hxFT=0;last=0;const r=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Math.random=function(){if(hxQC.in)hxQC.n++;return r();};};
 var hxFresh=(day,time)=>{hxReclock();NET.on=false;NET.isHost=true;AI.on=false;_silent=false;hxNoKeys();hxOverlay(false);location.search='';
  dispatch('newgame');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupstep',{v:'p0'});dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();
  sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();hxScreen(1280,800,false);
  if(day!==undefined)S.day=day;if(time!==undefined)S.time=time;lastInput[0]=lastInput[1]='key';hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);hxFrames(2);PH='';TOASTS=[];};
 var hxWalk=(i,x,z,stop)=>{const p=hxPos(i),dx=x-p[0],dz=z-p[1],d=Math.hypot(dx,dz);if(d<=(stop||0.15)){hxSetKeys(i,null);return d;}hxSetKeys(i,hxCombo(dx,dz));return d;};
 var hxWalkTo=(i,x,z,stop,max)=>{for(let k=0;k<(max||300);k++){if(hxWalk(i,x,z,stop)<=(stop||0.15)){hxSetKeys(i,null);return k;}hxFrames(1);}hxSetKeys(i,null);return -1;};
 var hxBearing=(x,z,near,from)=>{for(let a=0;a<8;a++){const ux=Math.sin(a*Math.PI/4),uz=Math.cos(a*Math.PI/4);let ok=true;for(let r=near;r<=from+1e-9;r+=0.1){const px=x+ux*r,pz=z+uz*r;if(blocked(px,pz,PR)||Math.abs(levelAt(px,pz))>0.01){ok=false;break;}}if(ok)return [ux,uz];}return null;};
 var hxCount=()=>{let n=0;scene.traverse(()=>{n++;});return n;};`);
 return h;}

// v40's counters inside the game (prefix hx): direct reads of performance.now, Date.now and Math.random from board-v40.js and mallam-v40.js (by
// the caller's file name); Math.random calls inside v40's builds (hxQC); blocked() and levelAt() calls inside v40's steps and prompt hooks
// (hxCost40); the tagged v40 objects anywhere in the scene

// v41's counters inside the game (prefix hx): direct reads of performance.now, Date.now and Math.random from ada-v41.js (by the caller's file
// name); Math.random calls inside v41's builds (hxQC); blocked() and levelAt() calls inside v41's step and prompt hook (hxCost41); the tagged v41
// objects anywhere in the scene (and in furnGroup)
async function world41(){const h=await world();const {run}=h;
 run(`var hxDirect41={pn:0,dn:0,mr:0};var hxFrom41=()=>{const s=String(new Error().stack||'').split('\\n');return !!(s[3]&&/(ada|gifts|daily)-v41\\.js/.test(s[3]));};
 {const pn=performance.now;performance.now=function(){if(hxFrom41())hxDirect41.pn++;return pn.apply(this,arguments);};const dn=Date.now;Date.now=function(){if(hxFrom41())hxDirect41.dn++;return dn.apply(this,arguments);};}
 {const rc=hxReclock;hxReclock=function(){const r=rc.apply(this,arguments);const m=Math.random;Math.random=function(){if(hxFrom41())hxDirect41.mr++;return m.apply(this,arguments);};return r;};}
 var hxCost41={in:0,b:0,l:0};
 if(typeof ADA41!=='undefined'&&ADA41.on){
  for(const n of ['adaCheck41','slateOpen41','collectRender41','polishDone41','homePieces41','adaSyncStation41','adaSyncBundle41','bubble41']){const f=globalThis[n];if(typeof f==='function')globalThis[n]=function(){hxQC.in++;try{return f.apply(this,arguments);}finally{hxQC.in--;}};}
  {const st=ADA41.step;ADA41.step=function(){hxCost41.in++;hxQC.in++;try{return st.apply(this,arguments);}finally{hxCost41.in--;hxQC.in--;}};}
  {const f=adaHot41;const k=HOTSPOT_HOOKS.indexOf(f);if(k>=0){HOTSPOT_HOOKS[k]=function(){hxCost41.in++;try{return f.apply(this,arguments);}finally{hxCost41.in--;}};}}
  const bl=blocked;blocked=function(){if(hxCost41.in)hxCost41.b++;return bl.apply(this,arguments);};const lv=levelAt;levelAt=function(){if(hxCost41.in)hxCost41.l++;return lv.apply(this,arguments);};}
 var hxTag41=()=>{const out=[];scene.traverse(o=>{if(o.userData&&o.userData.gist41)out.push(o.userData.gist41);});return out.sort();};
 var hxB41=()=>(S&&S.life&&S.life.gist38&&S.life.gist38.b41)||null;
 var hxB40=()=>(S&&S.life&&S.life.gist38&&S.life.gist38.b40)||null;`);
 return h;}
const r3=v=>Math.round(v*1000)/1000;

//@@CHECKS
function checks(h,only,side){const {run}=h,J=c=>JSON.parse(run('JSON.stringify((()=>{const v=('+c+');return v===undefined?null:v;})())'));const out=[];
 /* ---------- shared steps, all by real keys (verify-gist-v39.cjs's) ---------- */
 const frames=n=>run('hxFrames('+n+')');
 const press=(i)=>{run(`hxPress(${i});hxFrames(1);hxRelease(${i});hxFrames(1);`);};
 const item=()=>J("(()=>{const W=hxF()&&hxF().world;return W&&W.item?{key:W.itemKey,x:Math.round(W.item.position.x*1000)/1000,z:Math.round(W.item.position.z*1000)/1000}:null;})()");
 const label=(i)=>J(`hotspotCache[${i||0}]?hotspotCache[${i||0}].label:''`);
 const hsid=(i)=>J(`hotspotCache[${i||0}]?hotspotCache[${i||0}].id:''`);
 const cands=(i)=>J(`(()=>{const p=players[${i||0}].g.position,list=[],d=(a,b)=>Math.hypot(p.x-a,p.z-b);for(const h of HOTSPOT_HOOKS){const r=h(${i||0},list,d);if(r)return [r.id];}return list.map(x=>x.id);})()`);
 const approach=(i,x,z,stop,from)=>{from=from||1.2;const b=J(`hxBearing(${x},${z},${Math.min(stop,0.4)},${from})`);assert(b,'a free way to ('+x+', '+z+')');
  run(`hxAt(${i},${x+b[0]*from},${z+b[1]*from},[${-b[0]},${-b[1]}]);hxFrames(1);`);const k=J(`hxWalkTo(${i},${x+b[0]*stop},${z+b[1]*stop},0.08,200)`);assert(k>=0,'walked to ('+x+', '+z+')');frames(2);};
 const away=(i)=>run(`hxAt(${i},-8,-10);`);
 const to=t=>{let n=0;while(J('S.time')<t-0.004&&n<80000){frames(5);n+=5;}while(J('S.time')<t&&n<80000){frames(1);n++;}return n;};
 const pickNow=(i)=>{for(let f=0;f<12&&!item();f++)frames(1);const it=item();assert(it,'a lost thing lies out');approach(i,it.x,it.z,0.5);assert(/^Pick up /.test(label(i)),'the pick prompt: '+label(i));run('TOASTS=[];');press(i);return J('TOASTS.slice()');};
 const settled=(k)=>{for(let f=0;f<1200;f+=10){if(J(`!!(npcs.${k}&&npcs.${k}.g.visible&&!npcs.${k}.route)`))return true;frames(10);}return false;};
 const npcAt=k=>J(`[npcs.${k}.g.position.x,npcs.${k}.g.position.z]`);
 const giveNow=(i,owner)=>{assert(settled(owner),owner+' is there');const p=npcAt(owner);approach(i,p[0],p[1],1.2,2.0);
  const l=label(i);assert(/^Give /.test(l),'the give prompt beside '+owner+': '+l);run('PH="";');press(i);const ph=J('PH');run('closePanel();');return {label:l,panel:ph};};
 const nextday=()=>{run("dispatch('nextday');closePanel();hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);");frames(2);};
 const EV=()=>J("typeof EVENING35!=='undefined'?EVENING35.state:'none'");
 const pair=()=>run('hxAt(0,-5.2,6.4,[0,1]);hxAt(1,-4.6,6.4,[0,1]);');
 const waitStart=max=>{for(let k=0;k<(max||3000);k+=5){if(EV()!=='idle')return k;frames(5);}return EV()!=='idle'?0:-1;};
 const waitTalk=()=>{for(let k=0;k<1500;k+=10){const s=EV();if(s==='talking')return k;if(s==='idle')return -1;frames(10);}return -1;};
 const untilIdle=()=>{for(let k=0;k<4000&&EV()!=='idle';k+=10)frames(10);return EV();};
 const lineNow=()=>J("(()=>{const E=EVENING35,L=E.lines[E.line];return L?{line:E.line,n:E.lines.length,id:L.id,k:L.k}:null;})()");
 const listen=()=>{const out=[];for(let k=0;k<30&&EV()==='talking';k++){const s=lineNow();if(!s)break;out.push(s);for(let f=0;f<400&&EV()==='talking'&&J('EVENING35.line')===s.line;f++)frames(1);}return out;};
 const visit=()=>J("typeof GIST38!=='undefined'&&GIST38.visit?{guests:GIST38.visit.guests.slice(),script:GIST38.visit.script.map(s=>s.id)}:null");
 const gistOnce=(max)=>{const st=waitStart(max);if(st<0)return null;const t0=J('S.time'),v=visit();const tk=waitTalk();if(tk<0)return {t0,v,shown:[],aborted:true};const shown=listen();const end=untilIdle();return {t0,v,shown,end};};
 const buttons=html=>[...String(html||'').matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(m=>{const a=m[1],data={};for(const x of a.matchAll(/data-(?!act)([\w-]+)="([^"]*)"/g))data[x[1]]=x[2];
  return {act:(a.match(/data-act="([^"]*)"/)||[])[1]||null,data,cls:(a.match(/class="([^"]*)"/)||[])[1]||'',disabled:/\sdisabled(?=[\s=>\/]|$)/.test(a),text:m[2].replace(/<[^>]+>/g,'')};});
 const click=(act,pred)=>{assert(J('overlayOpen()'),'a panel is open for '+act);const b=buttons(J('PH')).find(x=>x.act===act&&!x.disabled&&(!pred||pred(x)));assert(b,'the button '+act+' in the panel: '+JSON.stringify(buttons(J('PH')).map(x=>x.act)));
  run(`dispatch(${JSON.stringify(act)},${JSON.stringify(b.data)})`);return b;};
 const logHas=(k,a)=>J(`(LOG35.events(S.day)||[]).some(e=>e.k==='${k}'&&e.a==='${a}')`);
 const hash=s=>{let x=2166136261>>>0;s=String(s);for(let q=0;q<s.length;q++){x^=s.charCodeAt(q);x=Math.imul(x,16777619)>>>0;}return x.toString(16);};
 const has40=()=>J("typeof BOARD40!=='undefined'&&!!BOARD40&&!!BOARD40.on&&typeof MALLAM40!=='undefined'&&!!MALLAM40.on");
 const tags=()=>J('hxTag40()');
 const B40=()=>J('hxB40()');
 // v39's: Aunty Bisi's street buy (P(i) placed 1 m south of her during her stroll), her figure
 const Bv=()=>J("typeof BISI39!=='undefined'&&BISI39.world.fig?{vis:!!(BISI39.world.fig.visible&&BISI39.world.fig.parent===scene),x:BISI39.world.fig.position.x,z:BISI39.world.fig.position.z,phase:BISI39.run.phase}:null");
 const streetPanel=(i)=>{const b=Bv();assert(b&&b.vis,'she is in the street');run(`hxAt(${i},${b.x},${b.z+1.0},[0,-1]);`);frames(1);assert.equal(label(i),'Buy from Aunty Bisi','the street buy prompt');run('PH="";');press(i);assert(J('overlayOpen()'),'her panel');return J('PH');};
 const herDay=()=>{for(let k=0;k<6&&!J('bisiDay39(S.day)');k++)nextday();assert(J('bisiDay39(S.day)'),'a day she passes');};
 // households: v38 discovered on day 3 by the glasses (picked up and given back by keys), the v35 evening on day 3, the morning of day 4
 const disc=()=>{run('hxFresh(3,12.02);');away(1);frames(4);pickNow(0);giveNow(0,'nkechi');run('life34().evening35={doneDay:3};');nextday();};
 // v39 discovered on day 4 by a purchase from Aunty Bisi on her first evening; the morning of day 5
 const disc39=()=>{disc();run('S.time=17.1;S.money=9000;hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);');for(let k=0;k<30&&!(Bv()&&Bv().vis);k++)frames(4);streetPanel(1);click('bisi39Buy',x=>x.data.v==='puffpuff');click('bisi39Close');frames(2);
  assert(J('!!(hxG().b39)'),'v39 discovered');run('S.time=21.5;');frames(2);nextday();};
 // the board read at 10:35 with P(0) at its prompt: the panel's HTML
 const read=()=>{run('S.time=Math.max(S.time,10.55);hxAt(0,0,-4.6,[0,-1]);');frames(6);run("PH='';PHN=0;openBoard();");const ph=J('PH'),n=J('PHN'),inner=J('panel.innerHTML');run('closePanel();');frames(2);return {ph,n,inner};};
 // v40 discovered: via b38 (v38 only, day 8) or via b39 (v39 bought on day 4, read on day 5)
 const disc40=(via)=>{if(via==='b39'){disc39();}else{disc();for(let k=0;k<4;k++)nextday();}const r=read();assert(J('!!hxB40()'),'v40 discovered by the read');return r;};
 const card=()=>J('hxB40()&&hxB40().card');
 const thingAt=()=>J("BOARD40.world.thing?[Math.round(BOARD40.world.thing.position.x*1000)/1000,Math.round(BOARD40.world.thing.position.z*1000)/1000]:null");
 // the card thing picked up and given back by keys; its owner's give waits for them to be there (Mrs. Oyelaran after six)
 const pickCard=(i)=>{const t=thingAt();assert(t,'the card thing lies out');approach(i,t[0],t[1],0.5);assert(/^Pick up /.test(label(i))&&hsid(i)==='card40pick','the card pick prompt: '+label(i));run('TOASTS=[];');press(i);return J('TOASTS.slice()');};
 const giveCard=(i)=>{const c=card();const ow=J(`BOARD40.THINGS['${c.id}'].owner`);if(!J(`!!found38Npc('${ow}')`))return null;assert(settled(ow),ow+' is there');const p=npcAt(ow);approach(i,p[0],p[1],1.2,2.0);
  const l=label(i);assert(hsid(i)==='card40give','the card give prompt beside '+ow+': '+l+' '+hsid(i));run('PH="";');press(i);const ph=J('PH');run('closePanel();');return {label:l,panel:ph,owner:ow};};
 // a day's digest (1(b), 1(c)): Today and the save at 07:30, the talk lines, the prompts over the late morning by the board and the suya stand,
 // the noon and the late afternoon, the save at 18:00, the plan, the gist, the save and Today after it, the day log
 const dayDigest=(dig,tag)=>{const note=(k,v)=>dig.push([tag+':'+k,v]);run('S.time=7.5;');frames(2);note('today07',J('todayHTML34()'));note('save07',J('JSON.stringify(S)'));
  note('talk',J("['tunde','nkechi','ada','bassey','oyelaran'].map(k=>{try{const l=line35(k,lineCtx35(k));return l?l.id:null;}catch(e){return 'x';}})"));
  const labs=[];const lab=()=>labs.push(J("players.map((p,i)=>{const h=nearest(i);return h?h.label:'';}).join('|')"));
  run('S.time=10.4;hxAt(0,0,-4.6,[0,-1]);hxAt(1,-3,10.4,[0,1]);');for(let k=0;k<30;k++){frames(30);lab();}
  run('hxAt(0,0.5,-3.8);hxAt(1,-3,11.0);');for(let k=0;k<8;k++){frames(30);lab();}
  run('S.time=12.0;hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);');for(let k=0;k<8;k++){frames(30);lab();}
  run('S.time=16.9;hxAt(0,-3,10.6,[0,1]);hxAt(1,-3.4,10.2,[0,1]);');for(let k=0;k<30;k++){frames(30);lab();}
  note('labels',labs.join(';'));run('S.time=18.05;');pair();frames(2);note('save18',J('JSON.stringify(S)'));note('plan',J("typeof gistPlan38==='function'?JSON.stringify(gistPlan38()):''"));
  const g=gistOnce(3000);note('gist',g?JSON.stringify([g.t0,g.v,g.shown.map(s=>s.id),g.end]):'none');note('saveEnd',J('JSON.stringify(S)'));note('todayEnd',J('todayHTML34()'));
  note('log',J('JSON.stringify(LOG35.events(S.day)||[])'));};
 const digestOf=dig=>{const all=JSON.stringify(dig);return {digest:hash(all)+':'+all.length,parts:dig.map(([k,v])=>k+':'+hash(v))};};
 const check=(n,fn)=>{if(only&&!only.includes(n))return;const name=NAMES[n];
  try{const info=fn();out.push({n,name,passed:true,info});}catch(e){if(process.env.HXSTACK)console.error(e&&e.stack);const m=String(e&&e.message||e).replace(/(?:\/[\w.@~-]+){2,}(?::\d+)*/g,'…').split('\n'),gen=e&&e.generatedMessage&&'actual' in e?' '+JSON.stringify(e.actual)+' vs '+JSON.stringify(e.expected):'';out.push({n,name,passed:false,failure:(m[0]+gen).slice(0,400)+(process.env.DEBUG41?' @@ '+String(e&&e.stack).split('\n').slice(1,4).join(' | '):'')});}
  try{run("hxNoKeys();hxOverlay(false);hxDT=1000/30;NET.on=false;NET.isHost=true;AI.on=false;closePanel();S.party=null;if(typeof FOOTBALL37!=='undefined'){FOOTBALL37.lastMatchDay=0;if(!FOOTBALL37.kids&&FOOTBALL37.state==='idle')FOOTBALL37.state='off';}if(typeof BISI39!=='undefined')BISI39.OFF.rule='hash';");}catch(e){}};
 /* ---------- v41's steps, all by real keys and panel buttons ---------- */
 const ST=[-2.5,-17.5];
 const B41=()=>J('hxB41()');
 const tags41=()=>J('hxTag41()');
 const stationNow=()=>J('ada41Station()');
 // P(i) walked up to the station's point (from 0.9 m on a free bearing)
 const atPoint=(i,x,z,stop)=>{approach(i,x,z,stop==null?0.15:stop,0.9);};
 const atStation=(i,stop)=>{for(let k=0;k<1500&&!stationNow();k+=10)frames(10);const s=stationNow();assert(s,'a station shows');atPoint(i,s.x,s.z,stop);return s;};
 const homeJSON=()=>J('JSON.stringify([S.home.items,S.home.storage])');
 const pins41=()=>J(`({tick:TICK_HOOKS.length,cue:CUE35_HOOKS.length,recipes:Object.keys(AUDIO35.recipes),twins:Object.keys(AUDIO35.twins||{}),talk:['tunde','nkechi','ada'].map(k=>LINES35[k].length),evening:Object.keys(LINES35.evening).map(k=>LINES35.evening[k].length),
   short:Object.keys(LINES35.short).length,text:Object.keys(LINES35.text).length,when:Object.keys(WHEN35).length,rows:DAYS35.rows.length,finds:FINDS34.length,items:Object.keys(ITEMS).join(),propFurn:typeof PROP_FURN!=='undefined'?Object.keys(PROP_FURN).join():'',
   src:[talk.toString().includes('lines_talk35'),openTalk.toString().includes('life-talk34')&&openTalk.toString().includes('act.before(card)'),finishParty.toString().includes('partyLines35'),ACTIONS.nethost.toString().includes('born35'),setupTouch.toString().includes('actPrimary35')]})`);
 const itemsKeys=()=>J("Object.keys(ITEMS).join()+'|'+(typeof PROP_FURN!=='undefined'?Object.keys(PROP_FURN).join():'')");
 let ITEMS0=null;const itemsSame=tag=>{const k=itemsKeys();if(ITEMS0===null)ITEMS0=k;assert.equal(k,ITEMS0,'ITEMS and PROP_FURN keys unchanged ('+tag+')');};
 // a pair household with v38 (day 3), v39 (day 4) and v40 read on day 5 (since 5): the morning of day 6
 const house=()=>{disc40('b39');nextday();assert.equal(J('S.day'),6,'day 6');};
 // a companion household the same way (gist-v40 check 7's setup): the morning of day 6
 const houseComp=()=>{run(`hxReclock();NET.on=false;AI.on=false;_silent=false;hxNoKeys();hxOverlay(false);location.search='';dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();dispatch('movein');closePanel();
   sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();hxScreen(1280,800,false);S.day=3;S.time=12.02;hxAt(0,-5.2,4.0);hxFrames(2);PH='';TOASTS=[];`);
  frames(4);pickNow(0);giveNow(0,'nkechi');run('life34().evening35={doneDay:3};');run("dispatch('nextday');closePanel();AI.on=true;hxAt(0,-5.2,4.0);");frames(2);
  run('S.time=17.1;S.money=9000;hxAt(0,-5.2,4.0);');for(let k=0;k<40&&!(Bv()&&Bv().vis);k++)frames(4);streetPanel(0);click('bisi39Buy',x=>x.data.v==='puffpuff');click('bisi39Close');frames(2);assert(J('!!(hxG().b39)'),'v39 discovered');
  run("S.time=21.5;");frames(2);run("dispatch('nextday');closePanel();AI.on=true;hxAt(0,-5.2,4.0);");frames(2);read();assert(J('!!hxB40()'),'v40 discovered (companion)');run("dispatch('nextday');closePanel();AI.on=true;hxAt(0,-5.2,4.0);");frames(2);};
 const nextdayC=()=>{run("dispatch('nextday');closePanel();AI.on=true;hxAt(0,-5.2,4.0);");frames(2);};
 const dayTo=(d,comp)=>{while(J('S.day')<d)(comp?nextdayC:nextday)();};
 // Ada invited to the veranda today (the base's own visit; its unlock is a base field set as setup), P(0) in the flat
 const invite=()=>{run('life34().visitsUnlocked=true;hxAt(0,-5.2,4.0);');frames(1);run("dispatch('lifeVisit');closePanel();");frames(4);assert(J("(()=>{const v=life34().visit;return !!(v&&v.day===S.day);})()"),'Ada visits today');};
 // the slate read by P(i) by keys: the panel's HTML
 const readSlate=(i)=>{atStation(i);assert.equal(hsid(i),'slate41read','the read prompt at the station: '+label(i));run('PH="";');press(i);assert(J('overlayOpen()'),'the slate panel is open');return J('PH');};
 const order=list=>click('ada41Order',x=>x.data.v===list);
 const closeP=()=>{if(J('overlayOpen()')){const b=buttons(J('PH')).find(x=>x.act==='ada41Close');if(b)run("dispatch('ada41Close',{})");else run('closePanel();');}frames(1);};
 // the Finds page read on Market Road: the block's buy button pressed
 const buyFinds=(i)=>{run(`hxAt(${i},20.8,6.0,[0,1]);`);frames(2);run("PH='';openLife34('market');");const ph=J('PH');assert(/gist41-shop/.test(ph),'the Finds block');click('ada41Buy');run('closePanel();');frames(1);return ph;};
 // Dayo's stall by its own prompt: the block's buy button
 const buyDayo=(i)=>{run(`hxAt(${i},28.6,2.1,[0,1]);`);frames(3);assert(/Dayo/.test(label(i)),'Dayo’s stall prompt: '+label(i));run('PH="";');press(i);const ph=J('PH');assert(/gist41-shop/.test(ph),'Dayo’s block');click('ada41Buy');run('closePanel();');frames(1);return ph;};
 const handOver=(i)=>{atStation(i);assert.equal(hsid(i),'ada41hand','the hand-over prompt: '+label(i));run('PH="";');press(i);const ph=J('PH');closeP();return ph;};
 const collectOpen=(i)=>{atStation(i);assert.equal(hsid(i),'ada41collect','the collect prompt: '+label(i));run('PH="";');press(i);assert(J('overlayOpen()'),'the collection panel');return J('PH');};
 // the clock moved 1.1 s on (the touch hold of 1.0 s has run out) before a deliberate press
 const waitHold=()=>{for(let k=0;k<60&&J("typeof DAILY40!=='undefined'&&DAILY40.hold>FOUND38.t");k++)frames(1);};
 // the polish beat: who presses (P(0) alone, or P(1) turning when offered), every `every` frames; until the piece is in a pair of hands
 const beat=(o)=>{o=o||{};const every=o.every||2,max=o.max||1500;const t0=J('S.time');let f=0;
  for(;f<max&&!J('!!(hxB41()&&hxB41().hand)');f++){
   for(const i of (o.who||[0])){const id=hsid(i);if(f%every===0&&(id==='ada41polish'||id==='ada41turn')&&!(o.turner===i&&id==='ada41polish')&&!(o.noTurn===i&&id==='ada41turn'))run(`hxPress(${i});`);}
   frames(1);for(const i of (o.who||[0]))run(`hxRelease(${i});`);}
  return {done:J('!!(hxB41()&&hxB41().hand)'),secs:Math.round((J('S.time')-t0)*60*100)/100,frames:f};};
 // a flat piece ordered, its thing bought (Finds or Dayo) and handed over, the next morning ready: the household's next piece
 const fullOrder=(i,list)=>{readSlate(i);order(list||'flat');closeP();const p=J('hxB41().piece');const br=p.bring;
  if(br.shells&&!br.shellsGiven){run('life34().shells=Math.max(life34().shells|0,3);');readSlate(i);click('ada41Shells');closeP();}
  if(br.from==='finds')buyFinds(i);else if(br.from==='dayo')buyDayo(i);else if(br.from==='bassey'){photo(i);}
  run('S.time=Math.max(S.time,10.2);');if(!J('ada41Station()'))run('S.time=11;');frames(4);handOver(i);return p;};
 // Mr. Bassey's lagoon photograph (gifts-v41.js's ask at his live place; A's own ask only while gifts-v41.js is not installed)
 const photo=(i)=>{if(J('S.time')>=12)run('S.time=9;');frames(6);assert(settled('bassey'),'Mr. Bassey is there');const q=npcAt('bassey');approach(i,q[0],q[1],1.0,1.7);const want=J("typeof GIFT41!=='undefined'&&GIFT41.on")?'gift41ask':'ada41photo';
  assert.equal(hsid(i),want,'the lagoon photograph ask: '+label(i));assert(/lagoon photograph/.test(label(i)),'the ask names the photograph: '+label(i));press(i);if(J('overlayOpen()'))run('closePanel();');frames(1);};
 const collectAll=(i,o)=>{o=o||{};collectOpen(i);waitHold();click('ada41Pay');waitHold();if(buttons(J('PH')).some(b=>b.act==='ada41Later')){click('ada41Later');waitHold();}
  if(o.leave){click('ada41Leave');}else{click('ada41Polish');frames(1);beat({who:[i]});}frames(70);};
 const carryIn=(i)=>{run('S.time=Math.max(S.time,9);');approach(i,-4.1,5.05,0.3,1.3);assert(J('hotspotCache['+i+']&&/^(Take the|Put up)/.test(hotspotCache['+i+'].label)'),'the door prompt: '+label(i));run('TOASTS=[];');press(i);return J('TOASTS.slice()');};
 // the top prompt with v41's hook taken out (the run without v41's prompts, in the same world)
 const topWithout=(i)=>J(`(()=>{const k=HOTSPOT_HOOKS.findIndex(f=>f===adaHot41||String(f).includes('hxCost41'));const f=HOTSPOT_HOOKS[k];if(k>=0)HOTSPOT_HOOKS.splice(k,1);try{const n=nearest(${i});return n?n.id:'';}finally{if(k>=0)HOTSPOT_HOOKS.splice(k,0,f);}})()`);
 const topAt=(i,x,z)=>{run(`hxAt(${i},${x},${z});`);return J(`(()=>{const n=nearest(${i});return n?n.id:'';})()`);};
 // the failing probe (spec §5.1, §5.7): the station's point against every Yard prompt and spot; a 3 m grid round the station and round Ada:
 // within the reach the station's prompt is top, outside it every prompt is as without v41's hook; Ada's talk and "Join Ada’s bench" win at
 // their own points
 const yardProbe=(tag)=>{for(const k of ['ada','bassey','tunde'])settled(k);const bad=[],P=J(`(()=>{const out=[];for(const k of ['ada','bassey','tunde']){const q=NPC_SPOTS[k].morning;out.push([q[0],q[1],'talk:'+k]);const n=found38Npc(k);if(n&&!n.route)out.push([n.g.position.x,n.g.position.z,'talk:'+k+' (live)']);}
    for(const p of [[-6,-15.2,'ws:ada'],[6,-15.2,'ws:tunde'],[-6,-19.3,'ws:bassey'],[6,-19.3,'ws:kitchen'],[0,-17.7,'tailor']])out.push(p);
    const box=s=>s[0]>-9&&s[0]<10&&s[1]>-22&&s[1]<-11;try{for(const e of FOUND38.LOST)for(const s of (e.spots||[]))if(box(s))out.push([s[0],s[1],'v38:'+e.id]);}catch(e){}
    try{const R=GIST39.LINES.round;for(const k in R)for(const s of (R[k].spots||[]))if(box(s))out.push([s[0],s[1],'v39:'+k]);}catch(e){}
    try{for(const a in BOARD40.AREAS){for(const s of cardSpots40(a,[]))if(box(s))out.push([s[0],s[1],'v40:'+a]);}}catch(e){}return out;})()`);
  const S0=J('ADA41.STATION.yard'),R=J('ADA41.STATION.reach');
  for(const p of P){const d=Math.hypot(p[0]-S0[0],p[1]-S0[1]);if(d<2.2)bad.push(tag+': the station within 2.2 m of '+p[2]+' ('+r3(d)+' m)');}
  if(J(`!!blocked(${S0[0]},${S0[1]},PR+0.5,{lvl:0,noCrate:true})`))bad.push(tag+': the station point not free at PR + 0.5');if(J(`Math.abs(levelAt(${S0[0]},${S0[1]}))>0.09`))bad.push(tag+': not level 0');
  const offers=J(`!!ada41Station()`);const grid=[];
  // (fix round, S4: adjusted for the ruling) during the beat Polish and Turn are offered at the two standing points beside the trestle, each
  // with its own reach, which may pass the edge of the station's: there the top prompt is the polish's
  const beatOn=J('!!(hxB41()&&hxB41().coll)'),SD=beatOn&&J("typeof adaSides41==='function'")?J('adaSides41(ada41Station())'):[],SR=J('ADA41.STATION.sideR')||0;
  for(let dx=-3;dx<=3.001;dx+=0.5)for(let dz=-3;dz<=3.001;dz+=0.5){const x=r3(S0[0]+dx),z=r3(S0[1]+dz);if(J(`!!blocked(${x},${z},PR,{lvl:0,noCrate:true})`))continue;run(`hxAt(1,-8,-10);hxAt(0,${x},${z});`);
   const top=J('(()=>{const n=nearest(0);return n?n.id:"";})()'),wo=topWithout(0),d=Math.hypot(dx,dz);grid.push([x,z,top]);
   if(d<R-1e-9&&offers){if(!/^(slate41read|ada41hand|ada41msg|ada41collect|ada41polish|ada41turn|ada41hush)$/.test(top))bad.push(tag+': ('+x+', '+z+') '+r3(d)+' m from the station: top '+top);}
   else if(!J('adaHushed41()')&&!J('!!(hxB41()&&hxB41().coll)')&&top!==wo)bad.push(tag+': ('+x+', '+z+') outside the reach: '+top+' against '+wo);
   else if(SD.some(q=>Math.hypot(q[0]-x,q[1]-z)<SR-1e-9)){if(!/^(ada41polish|ada41turn|ada41hush)$/.test(top))bad.push(tag+': ('+x+', '+z+') within a standing point’s reach during the beat: top '+top);}
   else if(top!==wo&&top!=='ada41hush')bad.push(tag+': ('+x+', '+z+') outside the reach during the beat: '+top+' against '+wo);}
  // round Ada (3 m): no v41 prompt on her; her talk and "Join Ada’s bench" top at their own points (outside the hush)
  const A0=J("(()=>{const a=found38Npc('ada');return a?[a.g.position.x,a.g.position.z]:null;})()");
  if(A0){for(let dx=-3;dx<=3.001;dx+=0.5)for(let dz=-3;dz<=3.001;dz+=0.5){const x=r3(A0[0]+dx),z=r3(A0[1]+dz);if(Math.hypot(x-S0[0],z-S0[1])<J('ADA41.STATION.hushR')+0.01)continue;if(J(`!!blocked(${x},${z},PR,{lvl:0,noCrate:true})`))continue;run(`hxAt(0,${x},${z});`);
    const c=cands(0);if(c.some(id=>/41/.test(id)&&id!=='home41in'))bad.push(tag+': a v41 prompt near Ada at ('+x+', '+z+'): '+c.join());}
   run(`hxAt(0,${A0[0]},${A0[1]+0.6});`);const t=J('(()=>{const n=nearest(0);return n?n.id:"";})()');if(t!=='talk:ada')bad.push(tag+': at Ada the top prompt is '+t);
   run('hxAt(0,-6,-15.2);');const w=J('(()=>{const n=nearest(0);return n?n.id:"";})()');if(w!=='ws:ada')bad.push(tag+': at Join Ada’s bench the top prompt is '+w);}
  run('hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);');return {bad,grid:grid.length};};
 // the veranda station from Ada's live chair: Ada in each of her five columns (the balcony's earlier columns filled with plants, as Build
 // would), then the balcony full
 const verandaProbe=()=>{const out={cols:{},bad:[]};
  for(const want of [1,0,5,3,4,'full']){const order=[1,0,5,3,4];const fill=want==='full'?[0,1,2,3,4,5]:order.slice(0,order.indexOf(want));
   run(`S.home.items=S.home.items.filter(it=>!(it.y===FLAT.rows&&String(it.id).startsWith('hx41')));${fill.map(c=>`S.home.items.push({id:'hx41p${c}',type:'plant',x:${c},y:FLAT.rows,rot:0});`).join('')}rebuildFurniture();refreshVisitor34();ADA41.vcache.key='';ADA41.checkAt=0;`);frames(3);
   const st=J('ada41Station()'),ad0=J("(()=>{const a=found38Npc('ada');return a?[a.g.position.x,a.g.position.z]:null;})()"),ad=ad0&&ad0.map(r3);
   out.cols[want]={ada:ad,station:st?[st.x,st.z]:null};
   if(want==='full'){if(st)out.bad.push('the balcony full, yet a station at '+JSON.stringify(st));continue;}
   // (fix round, S7: adjusted for the ruling) Aunty Bisi due today: her stop kept 2.2 m clear, by the station's alternatives (0.9 m, then
   // 1.8 m east or west); no station when none is clear of it
   const bz=J("(typeof bisiEvening39==='function'&&bisiEvening39())?BISI39.ROUTE.stop:null"),VS=J('ADA41.VERANDA.side'),VZ=J('ADA41.VERANDA.south');
   if(!st){if(bz&&[0,VS,-VS,2*VS,-2*VS].every(dx=>Math.hypot(ad[0]+dx-bz[0],ad[1]+VZ-bz[1])<=2.2)){out.cols[want].bisi='none clear of her stop';continue;}out.bad.push('Ada in column '+want+': no station');continue;}
   if(bz&&Math.hypot(st.x-bz[0],st.z-bz[1])<=2.2)out.bad.push('column '+want+': the station '+r3(Math.hypot(st.x-bz[0],st.z-bz[1]))+' m from Aunty Bisi’s stop');
   const dA=Math.hypot(st.x-ad[0],st.z-ad[1]);if(dA<2.45)out.bad.push('column '+want+': the station '+r3(dA)+' m from Ada');
   if(Math.abs(st.x-ad[0])>(bz?2*VS+0.05:0.95)||Math.abs(st.z-ad[1]-J('ADA41.VERANDA.south'))>0.01)out.bad.push('column '+want+': the station not worked out from Ada\u2019s chair ('+st.x+', '+st.z+' for Ada at '+ad.join(', ')+')');
   if(Math.hypot(st.x+4.1,st.z-5.05)<2.2)out.bad.push('column '+want+': within 2.2 m of the flat door');
   // over the whole reach the station's prompt is top; Ada's talk at her chair
   for(let a=0;a<8;a++)for(const r of [0.3,0.6,0.95]){const x=st.x+Math.sin(a*Math.PI/4)*r,z=st.z+Math.cos(a*Math.PI/4)*r;if(J(`!!blocked(${x},${z},PR,{lvl:0,noCrate:true})`))continue;const t=topAt(0,x,z);if(!/^(slate41read|ada41)/.test(t))out.bad.push('column '+want+': ('+r3(x)+', '+r3(z)+') top '+t);}
   const t=topAt(0,ad[0],ad[1]+0.7);if(t!=='talk:ada')out.bad.push('column '+want+': at Ada’s chair the top prompt is '+t);}
  run(`S.home.items=S.home.items.filter(it=>!String(it.id).startsWith('hx41'));rebuildFurniture();refreshVisitor34();ADA41.vcache.key='';ADA41.checkAt=0;hxAt(0,-5.2,4.0);`);frames(2);return out;};
 //@@V41STEPS
  /* ---------- engineer B's steps (gifts-v41.js), all by real keys, prompts and panel buttons ---------- */
  const SHORT=!!process.env.GIST41_SHORT;
  const GB=()=>J('hxB41()');
  const nbOffer=()=>J("(()=>{const n=ada41Next();return n.nb?{id:n.nb.id,for:n.nb.for,msg:!!n.nb.msg,name:n.nb.name}:null;})()");
  const offers=()=>J("(()=>{const n=ada41Next();return {flat:n.flat?n.flat.id:null,nb:n.nb?{id:n.nb.id,for:n.nb.for,msg:!!n.nb.msg,name:n.nb.name}:null};})()");
  // the place a neighbour stands now, as the harness reads their live figure (never the module's own helper)
  const placeOf=k=>J(`(()=>{const n=found38Npc('${k}');if(!n)return null;const x=n.g.position.x,z=n.g.position.z;return x>18?'shop':z<-11?'yard':z>9?'waterfront':'courtyard';})()`);
  // P(i) 1.0 m from neighbour k's live figure (after they have settled), the prompt there
  const npcPlace={v:null,t:0};
  const byNpc=(i,k,stop)=>{assert(settled(k),k+' is there at '+J('S.time'));const q=npcAt(k);approach(i,q[0],q[1],stop||1.0,1.7);return q;};
  const actNpc=(i,k,want)=>{byNpc(i,k);
   // an earlier build's prompt at the same neighbour wins its tie by design (v38's give, v40's card thing and errand): the household does that first
   for(let n=0;n<3&&hsid(i)!==want&&/^(errand40|card40|gist38give|kid40|pot39|gist39)/.test(hsid(i));n++){press(i);if(J('overlayOpen()'))run('closePanel();');frames(3);byNpc(i,k);}
  assert.equal(hsid(i),want,'the prompt at '+k+' ('+J('S.time')+'): '+label(i)+' ('+hsid(i)+')');npcPlace.v=placeOf(k);npcPlace.t=J('S.time');run('PH="";');press(i);const ph=J('PH');if(J('overlayOpen()'))run('closePanel();');frames(1);return ph;};
  const listAt=i=>J(`(()=>{const p=players[${i}].g.position,list=[],d=(a,b)=>Math.hypot(p.x-a,p.z-b);for(const h of HOTSPOT_HOOKS){const r=h(${i},list,d);if(r)return [r];}return list.map(x=>({id:x.id,dist:Math.round(x.dist*1e6)/1e6,label:x.label}));})()`);
  const later=t=>{if(J('S.time')<t)run('S.time='+t+';');frames(4);};
  const strip=h=>String(h||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  // v40's card things given back day by day until each wanted one is back (the board read at 10:35, the thing picked and given by keys); the
  // household's evenings skipped (the gist only begins with a player at the rail)
  const cardsBack=(want,max)=>{const backs=()=>J('(hxB40()&&hxB40().backs||[]).map(r=>r.id)');let n=0;
   while(!want.every(id=>backs().includes(id))&&n<(max||20)){read();let c=card();if(c&&c.state!=='hand'&&c.state!=='back'&&thingAt())pickCard(0);c=card();if(c&&c.state==='hand'){for(const t of [null,15,18.05]){if(t)later(t);frames(30);if(giveCard(0))break;}}nextday();n++;}
   return want.every(id=>backs().includes(id));};
  // the slate read and an order by turns: the other list than last time when it has something, else the one that has
  const orderTurn=(ctx,ph)=>{const o=offers();const nb=o.nb&&!o.nb.msg?o.nb:null;let list=null;
   if(ctx.prefer&&((ctx.prefer==='nb'&&nb)||(ctx.prefer==='flat'&&o.flat)))list=ctx.prefer;else if(ctx.last==='flat'&&nb)list='nb';else if(o.flat)list='flat';else if(nb)list='nb';
   if(!list)return null;const b=buttons(J('PH')).find(x=>x.act==='ada41Order'&&x.data.v===list&&!x.disabled);if(!b)return null;order(list);ctx.last=list;frames(1);
   if(buttons(J('PH')).some(x=>x.act==='ada41Shells'&&!x.disabled)){waitHold();click('ada41Shells');frames(1);}
   return J('(hxB41()||{}).piece');};
  // a neighbour's piece given at k's live place now: the place and hour as the harness reads them
  const giveNb=(ctx,i)=>{const h=J('(hxB41()||{}).hand');const k=h.for,m0=J('S.money'),a0=J(`S.nb.${k}.aff|0`);const ph=actNpc(i,k,'gift41give');
   assert.equal(J('S.money'),m0,'no money changes hands at a gift');assert.equal(J(`S.nb.${k}.aff|0`),a0+1,'friendship +1 for '+k);
   const r={day:J('S.day'),k,id:h.id,t:npcPlace.t,place:npcPlace.v};assert(!J('(hxB41()||{}).hand'),'the piece is given');ctx.gives.push(r);return {r,ph};};
  // one eager day (spec §17.3's household, P(0) acting; the companion household's human alike): collect, order by turns, the thing to bring,
  // the hand-over, carry home or give at the neighbour's live place by the hour, Mama Nkechi's word; then (gist:true) the evening
  const eagerDay=(ctx)=>{const day=J('S.day'),ev={day,give:null,inFlat:null,coll:null,readyAm:ctx.cutDay===day-1,visit:!!ctx.invite,nooffer:false,asks:[]};ctx.ev=ev;
   run(`S.money=Math.max(S.money|0,${ctx.money||40000});life34().shells=Math.max(life34().shells|0,6);`);
   if(ctx.invite){invite();}later(8.3);
   const hasSt=()=>{for(let k=0;k<900&&!J('ada41Station()');k+=10)frames(10);return !!J('ada41Station()');};
   const pc=()=>J('ada41Piece()');
   const handIfDue=()=>{const p=pc();if(p&&p.state==='wait'&&p.bring&&p.bring.got&&!p.bring.handed&&J('ada41Station()')){handOver(0);const q=pc();if(q&&q.state==='cut'){ctx.cutDay=day;}}};
   if(hasSt()){
    handIfDue();
    // 1. a ready piece: collected, the next ordered by turns in the same panel (or Later), the polish left to Ada (ctx.polish: polished)
    let p=pc();if(p&&p.state==='ready'&&!J('(hxB41()||{}).hand')){collectOpen(0);waitHold();const t=J('S.time'),at=J('ada41Station().at');click('ada41Pay');waitHold();ev.coll={id:p.id,list:p.list,at,t};
     if(buttons(J('PH')).some(x=>x.act==='ada41Later')){const q=orderTurn(ctx);if(!q)click('ada41Later');waitHold();}
     if(ctx.polish){click('ada41Polish');frames(1);beat({who:[0]});}else click('ada41Leave');frames(70);}
    // the flat piece home at once
    const h=J('(hxB41()||{}).hand');if(h&&h.list==='flat'){carryIn(0);ev.inFlat=h.id;ctx.flatIn.push({day,id:h.id});later(8.5);hasSt();}
    // 2. Mama Nkechi's message, given at the station
    if(J("(hxB41()||{}).nk&&(hxB41()||{}).nk.heard&&!(hxB41()||{}).nk.told")&&J('ada41Station()')){atStation(0);if(hsid(0)==='ada41msg'){press(0);closeP();if(pc()&&pc().id==='nkstool'&&pc().state==='cut')ctx.cutDay=day;}}
    // 3. nothing open: the slate read and an order by turns
    if(!pc()&&J('ada41Station()')&&!J('(hxB41()||{}).coll')){const ph=readSlate(0);const o=offers();if(!o.flat&&!(o.nb&&!o.nb.msg))ev.nooffer=!(o.nb&&o.nb.msg);orderTurn(ctx);closeP();}}
   // 4. a neighbour's piece in the hands: given in the morning, or (three days in ten) in the afternoon; Mrs. Oyelaran then at six
   const pm=((day*7+(ctx.salt|0))%10)<3;const giveNow=()=>{const h=J('(hxB41()||{}).hand');if(!h||h.list!=='nb')return;if(!J(`!!found38Npc('${h.for}')`))return;ctx.lastPlace=placeOf(h.for);ev.give=giveNb(ctx,0).r;};
   if(!pm){later(10.3);giveNow();}
   // 5. the thing to bring: Finds, Dayo's stall, the shells, or the neighbour at their live place by the hour
   const brg=()=>{const p=pc();return p&&p.state==='wait'&&p.bring&&!p.bring.got?p.bring:null;};
   // (ctx.dawdle: one day in five the household leaves the thing for tomorrow; the piece waits)
   let br=ctx.dawdle&&day%5===0?null:brg();if(br){later(10.6);
    if(br.from==='finds')buyFinds(0);else if(br.from==='dayo')buyDayo(0);
    else if(br.from!=='store'){const k=br.from;if(k==='oyelaran'&&J('S.time')>=12)later(18.02);if(J(`!!found38Npc('${k}')`)){{const hh=J('(hxB41()||{}).hand');if(hh&&hh.list==='nb'&&hh.for===k)giveNow();}actNpc(0,k,'gift41ask');ev.asks.push({k,t:J('S.time')});}}}
   // Mama Nkechi's word, by day, once her ask is due: her bubble within 6 m, then "Hear Mama Nkechi out"
   const td=J('gift41Today()');if(td&&td.k==='nk'&&J('S.time')<17.5){later(11.0);run('hxAt(0,21.0,3.6,[1,0]);');frames(12);ev.nkBubble=J("hxTag41().includes('bubble')");actNpc(0,'nkechi','gift41hear');ctx.heard=day;}
   // 6. the hand-over at the station (the Yard until six; the veranda until the gist)
   if(J('S.time')<17.9){later(11.5);hasSt();handIfDue();}
   // the stool's message may wait for a free bench: given now if the bench is free
   if(J("(hxB41()||{}).nk&&(hxB41()||{}).nk.heard&&!(hxB41()||{}).nk.told")&&J('ada41Station()')&&!pc()){atStation(0);if(hsid(0)==='ada41msg'){press(0);closeP();if(pc()&&pc().id==='nkstool')ctx.cutDay=day;}}
   if(pm){const h=J('(hxB41()||{}).hand');if(h&&h.list==='nb'){later(h.for==='oyelaran'?18.04:14.6);giveNow();}}
   // the puff-puff a day or two after a gift to Mama Nkechi (cut item 1): taken when it is offered by day
   if(J('S.time')<17.5&&J("(()=>{const r=(hxB41()||{}).returns&&(hxB41()||{}).returns.nkechi;return !!(r&&!r.given&&typeof r.due==='number'&&S.day>=r.due);})()")){later(Math.max(J('S.time'),11.2));byNpc(0,'nkechi');if(hsid(0)==='gift41back'){press(0);if(J('overlayOpen()'))run('closePanel();');ctx.backs.push(day);}}
   ev.flatOpen=!!(pc()&&pc().list==='flat');return ev;};
  // the evening at the rail with Next pressed through: the plan seen, the lines shown
  const gistFast=(ctx)=>{later(18.08);if(ctx.comp)run('hxAt(0,-5.2,6.4,[0,1]);');else pair();const st=waitStart(3000);if(st<0)return null;
   const v=J("GIST38.visit?{guests:GIST38.visit.guests.slice(),script:GIST38.visit.script.map(s=>({id:s.id,k:s.k,v41k:s.v41k||null,info:s.info?1:0,open:s.open?1:0,sw:s.swap40&&s.swap40.cat||null}))}:null");
   for(let k=0;k<1500&&EV()!=='talking'&&EV()!=='idle';k+=10)frames(10);let n=0;while(EV()==='talking'&&n<40){frames(12);run('EVENING35.next();');n++;}
   for(let q=0;q<4000&&EV()!=='idle';q+=10)frames(10);const shown=J("(hxG()&&hxG().last&&hxG().last.day===S.day)?hxG().last.ids:[]");return {v,shown};};
  // §9.1's conditions as the harness reads its own day (who, where they were at the hour, where the piece is, where and when it was given)
  const FAMOF=J("(()=>{const o={};if(typeof GIFT41==='undefined')return o;for(const f in GIFT41.FAM)for(const id of GIFT41.FAM[f])o[id]=f;return o;})()");
  const SPK={'nk-stool':'nkechi','nk-sign':'nkechi','nk-gen':'nkechi','ba-frame':'bassey','ba-gen':'bassey','ba-gen-eve':'bassey','tu-board':'tunde','tu-board-am':'tunde','tu-gen':'tunde','oy-table':'oyelaran','oy-gen':'oyelaran',
   'ad-flat':'ada','ad-gift':'ada','ad-open':'ada','ad-nk':'ada','ba-photo':'bassey','oy-saw':'oyelaran','nk-open':'nkechi'};
  const RECV=['nk-stool','nk-sign','nk-gen','ba-frame','ba-gen','ba-gen-eve','tu-board','tu-board-am','tu-gen','oy-table','oy-gen'];
  const truth=(fam,F,guests)=>{const g=F.give,like=g&&/^like-/.test(g.id);switch(fam){
   case 'nk-stool':return !!(g&&g.k==='nkechi'&&g.id==='nkstool'&&g.place==='shop');case 'nk-sign':return !!(g&&g.k==='nkechi'&&g.id==='sign'&&g.place==='shop');
   case 'nk-gen':return !!(g&&g.k==='nkechi'&&like&&g.place==='shop');case 'ba-frame':return !!(g&&g.k==='bassey'&&g.id==='frame');
   case 'ba-gen':return !!(g&&g.k==='bassey'&&like&&g.t<18);case 'ba-gen-eve':return !!(g&&g.k==='bassey'&&like&&g.t>=18);
   case 'tu-board':return !!(g&&g.k==='tunde'&&g.id==='board'&&g.place==='yard'&&g.t<12);case 'tu-board-am':return !!(g&&g.k==='tunde'&&g.id==='board'&&!(g.place==='yard'&&g.t<12));
   case 'tu-gen':return !!(g&&g.k==='tunde'&&like&&g.t<15);case 'oy-table':return !!(g&&g.k==='oyelaran'&&g.id==='table'&&(g.t<12||g.t>=18));
   case 'oy-gen':return !!(g&&g.k==='oyelaran'&&like&&g.t<12);case 'ad-flat':return !!F.inFlat;
   case 'ad-gift':return !!(g&&!guests.includes(g.k)&&(g.place==='shop'||((g.place==='waterfront'||g.place==='courtyard')&&g.t<18&&!F.visit)));
   case 'ad-open':return !!(F.cut&&F.cut.id!=='nkstool'&&(F.cut.list==='flat'||F.cut.price>0));case 'ad-nk':return !!(F.cut&&F.cut.id==='nkstool');
   case 'ba-photo':return !!(F.coll&&F.coll.at==='yard'&&F.coll.t>=8.25&&!F.visit&&F.coll.list==='flat');case 'oy-saw':return !!F.readyAm;case 'nk-open':return !!F.flatOpen;}return false;};
  const newCtx=o=>Object.assign({last:null,gives:[],flatIn:[],backs:[],cutDay:null,lastPlace:null,said:{},rate:{},bad:[],lines:{},nights:0,placedNights:0},o||{});
  // one night's lines judged: each v41 line true at the moment it is said, at most one, each id at most once in fourteen evenings
  const judge=(ctx,ev,g)=>{if(!g)return;ctx.nights++;const guests=g.v?g.v.guests:[];const pcG=J('ada41Piece()');
   const F=Object.assign({},ev,{cut:pcG&&pcG.state==='cut'&&pcG.cutDay===ev.day?pcG:null,flatOpen:!!(pcG&&pcG.list==='flat')});
   const v41=(g.v?g.v.script:[]).filter(s=>s.v41k);if(v41.length>1)ctx.bad.push(ev.day+': '+v41.length+' v41 lines');
   const shown41=g.shown.filter(id=>/^gs41-/.test(id));
   for(const id of shown41){const fam=FAMOF[id];ctx.lines[id]=(ctx.lines[id]|0)+1;const s=v41.find(x=>x.id===id);
    if(!fam)ctx.bad.push(ev.day+': '+id+' has no family');else{if(!truth(fam,F,guests))ctx.bad.push(ev.day+': '+id+' said when false '+JSON.stringify({give:F.give,inFlat:F.inFlat,coll:F.coll,cut:F.cut&&[F.cut.id,F.cut.state],readyAm:F.readyAm,flatOpen:F.flatOpen,visit:F.visit}));
     if(s&&s.k!==SPK[fam])ctx.bad.push(ev.day+': '+id+' said by '+s.k);
     // (fix round, DOD-4, S13) never in an opener or a goodbye; (C14a) "making something for your flat" only while it is cut tonight
     if(s&&(s.open||/^(o|by):/.test(String(s.sw||''))))ctx.bad.push(ev.day+': '+id+' in an opener or goodbye ('+s.sw+')');
     if(id==='gs41-nk-open'&&!(F.cut&&F.cut.list==='flat'))ctx.bad.push(ev.day+': gs41-nk-open while the flat piece is not being made tonight');if(!guests.includes(SPK[fam]))ctx.bad.push(ev.day+': '+id+' by a non-guest');if(s&&!s.info)ctx.bad.push(ev.day+': '+id+' without info');}
    if(typeof ctx.said[id]==='number'&&ev.day-ctx.said[id]<14)ctx.bad.push(ev.day+': '+id+' again within fourteen evenings (day '+ctx.said[id]+')');ctx.said[id]=ev.day;}
   if(shown41.length)ctx.placedNights++;
   // the receivers' mention rate: a gift today whose mention is true, its receiver a guest
   const rf=RECV.find(f=>truth(f,F,guests));if(rf&&guests.includes(SPK[rf])){const r=ctx.rate[1]||(ctx.rate[1]={eligible:0,placed:0});r.eligible++;if(shown41.some(id=>FAMOF[id]===rf||RECV.includes(FAMOF[id])))r.placed++;}
   for(const [n,fam] of [[2,'ad-flat'],[4,'ad-open'],[5,'ba-photo'],[6,'oy-saw'],[7,'nk-open']])if(truth(fam,F,guests)&&guests.includes(SPK[fam])){const r=ctx.rate[n]||(ctx.rate[n]={eligible:0,placed:0});r.eligible++;if(shown41.some(id=>FAMOF[id]===fam))r.placed++;}};
  const eagerNight=(ctx,comp)=>{const ev=eagerDay(ctx);if(ctx.gist){const g=gistFast(ctx);judge(ctx,ev,g);ev.g=g;}(comp?nextdayC:nextday)();return ev;};
  if(side&&only&&only[0]===-1)Object.assign(side,{GB,nbOffer,offers,placeOf,byNpc,actNpc,listAt,later,cardsBack,orderTurn,giveNb,eagerDay,gistFast,judge,newCtx,eagerNight,strip,truth,FAMOF});
  //@@V41STEPS-END
 if(side&&only&&only[0]===-1){Object.assign(side,{ST,B41,tags41,stationNow,atPoint,atStation,homeJSON,pins41,itemsSame,house,houseComp,nextdayC,dayTo,invite,readSlate,order,closeP,buyFinds,buyDayo,handOver,collectOpen,waitHold,beat,fullOrder,photo,collectAll,carryIn,topWithout,topAt,yardProbe,verandaProbe,pickNow,giveNow,streetPanel,Bv,frames,press,label,hsid,cands,approach,away,to,nextday,disc,disc40,read,buttons,click,logHas,hash,check,settled,npcAt,pair,EV,gistOnce,untilIdle});return out;}
 /* ======================================================================================================================================
    Engineer A's checks: 1, 2, 3, 4, 5, 10
    ====================================================================================================================================== */
 // check 1's measures of the inert worlds, taken first, before any other check has touched the world (the runner compares them with the run
 // without v41)
 if(!only||only.includes(1)){try{
   // (a) day 3 at 10:00, no v38: the save, the keys, 600 frames of cameras and prompts, the Menu, Today, the pins
   run('hxFresh(3,10);');const sj=J('JSON.stringify(S)'),ks=J('[Object.keys(S).join(),Object.keys(S.life||{}).join()]');
   const fr=J(`(()=>{let h=2166136261>>>0;const mix=s=>{s=String(s);for(let k=0;k<s.length;k++){h^=s.charCodeAt(k);h=Math.imul(h,16777619)>>>0;}};for(let f=0;f<600;f++){hxFrames(1);mix(v21Dist.map(v=>v.toFixed(4)).join());mix(cams[0].position.toArray().map(v=>v.toFixed(3)).join()+cams[1].position.toArray().map(v=>v.toFixed(3)).join());mix(hotspotCache.map(x=>x?x.label:'').join('|'));}return h.toString(16);})()`);
   run('PH="";openMenu();');const menu=J('PH').replace(/v\d\d-[0-9a-f]{8}/g,'BUILD');run('closePanel();');const today=J('todayHTML34()');const pins=pins41();
   const all=JSON.stringify([sj,ks,fr,menu,today,pins]);side.inertA=hash(all)+':'+all.length;side.pins=pins;
   // (b) v40 discovered on day 5 (via b39), days 6 and 7: layer 2 closed (before day 8)
   {house();const dig=[];const Y=[];const yard=tag=>{run('S.time=9.0;');frames(30);Y.push(J("typeof ada41Station==='function'?JSON.stringify(ada41Station()):'null'")+'|'+J("typeof hxTag41==='function'?hxTag41().length:0"));dig.push([tag+':yard9',J("typeof ada41Station==='function'?JSON.stringify(ada41Station()):'null'")+'|'+J("typeof hxTag41==='function'?hxTag41().length:0")]);};
    yard('d6');dayDigest(dig,'d6');const t6=J("typeof hxTag41==='function'?hxTag41().length:0");nextday();yard('d7');dayDigest(dig,'d7');
    side.inertB=Object.assign(digestOf(dig),{yard:Y,tagged:t6+J("typeof hxTag41==='function'?hxTag41().length:0"),b41:J('!!(hxG()&&hxG().b41)')});}
   // (c) layer 2 open, v41 not discovered: days 8-10, a pair (Ada at her bench; day 9 a visit day) and a companion household (day 8), a player
   // walking past the station at 09:00 without reading; the digests leave out the station's own mesh and prompt, which may differ
   {nextday();const dig=[];let seen={yard:0,veranda:0};const watch=()=>{const s=J("typeof ada41Station==='function'?ada41Station():null");if(s)seen[s.at]++;};
    run('S.time=9.0;');frames(6);watch();const s8=J('JSON.stringify(S)');run('hxAt(0,-3.9,-17.5,[1,0]);');for(let k=0;k<40;k++){run("keys['d']=true;");frames(1);}run("keys['d']=false;");frames(2);
    dig.push(['walkpast',J('JSON.stringify(S)')===s8?'same':'changed']);run('hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);');dayDigest(dig,'p8');
    nextday();invite();run('S.time=9.0;');frames(6);watch();dayDigest(dig,'p9v');nextday();dayDigest(dig,'p10');
    houseComp();dayTo(8,true);run('S.time=9.0;');frames(6);watch();dayDigest(dig,'c8');
    side.inertC=Object.assign(digestOf(dig),{seen,b41:J('!!(hxG()&&hxG().b41)')});}}
  catch(e){side.inertA=side.inertA||('error '+String(e&&e.message||e).slice(0,120));side.inertB=side.inertB||{error:String(e&&e.message||e).slice(0,160)};side.inertC=side.inertC||{error:String(e&&e.message||e).slice(0,160)};}}
 // check 10's scene count runs early in a world no other check has touched: a household with the station out and a piece in the flat where v41
 // is present, then a new day-2 household (homeuse check 6's counter); the count must equal the run without v41
 if(!only||only.includes(10)){try{run("dispatch('newgame');");house();dayTo(8);run('S.time=9.0;S.money=40000;');frames(6);
   if(J("typeof ADA41!=='undefined'&&ADA41.on")){fullOrder(0);nextday();run('S.time=9.0;');frames(6);collectAll(0,{leave:true});carryIn(0);}
   run("dispatch('newconfirm');closePanel();dispatch('newgame');");run('hxFresh(2,10);');frames(30);side.count10=J('hxCount()');}catch(e){side.count10='error '+String(e&&e.message||e).slice(0,160);}}

 // 1. inert
 check(1,()=>{const R={};assert(J("typeof ADA41!=='undefined'&&ADA41.on"),'v41 installed (v40 is)');
  const p=side.pins||pins41();assert.equal(p.tick,17,'TICK_HOOKS');assert.equal(p.cue,2,'CUE35_HOOKS');assert.deepEqual(p.recipes,['cast','nibble','bite','catch','water'],'AUDIO35.recipes');
  assert.deepEqual(p.talk,[42,41,41],'LINES35 talk');assert.deepEqual(p.evening,[4,4,4],'LINES35.evening');assert.equal(p.when,31,'WHEN35');assert.equal(p.rows,12,'DAYS35.rows');assert.equal(p.finds,15,'FINDS34');
  assert.deepEqual(p.src,[true,true,true,true,true],'the pinned sources');R.pins={tick:p.tick,cue:p.cue,when:p.when,rows:p.rows,finds:p.finds};
  // the hooks: one HOTSPOT_HOOKS and one ACT_HOOKS entry for ada-v41.js; no TICK_HOOKS entry; EVENING35.tick wrapped by property
  assert(J('HOTSPOT_HOOKS.includes(adaHot41)||HOTSPOT_HOOKS.some(f=>String(f).includes("hxCost41"))'),'adaHot41 in HOTSPOT_HOOKS');
  assert.equal(J("ACT_HOOKS.filter(f=>String(f).includes('adaAct41')).length"),1,'one ACT_HOOKS entry');
  // nothing saved, logged or drawn in the flat before discovery; layer 2 closed on day 7 even with G.b40
  assert(typeof side.inertB==='object'&&!side.inertB.error,'the closed-layer days ran: '+JSON.stringify(side.inertB));assert.equal(side.inertB.tagged,0,'no v41 object on days 6 and 7');assert(side.inertB.yard.every(x=>x==='null|0'),'no station at the Yard at 09:00 on days 6 and 7: '+JSON.stringify(side.inertB.yard));assert.equal(side.inertB.b41,false,'no G.b41 before day 8');
  assert(typeof side.inertC==='object'&&!side.inertC.error,'the layer-2 days ran: '+JSON.stringify(side.inertC));assert.equal(side.inertC.b41,false,'no G.b41 in layer 2 without a read');
  assert(side.inertC.seen.yard>0&&side.inertC.seen.veranda>0,'the station shows in layer 2 (at the Yard and on the veranda): '+JSON.stringify(side.inertC.seen));
  assert(side.inertC.parts.some(x=>x.startsWith('walkpast:')),'the walk past');
  // ITEMS and PROP_FURN keys unchanged by v41 in every state (the runner also compares the whole pins with the run without v41)
  itemsSame('check 1');assert(!J("Object.keys(ITEMS).some(k=>/41|^ada/i.test(k))||(typeof PROP_FURN!=='undefined'&&Object.keys(PROP_FURN).some(k=>/41|^ada/i.test(k)))"),'no v41 key in ITEMS or PROP_FURN');R.items=J('Object.keys(ITEMS).length');
  return R;});

 // 2. station-and-order
 check(2,()=>{const R={};run("dispatch('newgame');");house();itemsSame('2 start');
  // day 7: G.b40 present, layer 2 closed: no station
  run('S.time=9.0;');frames(6);assert.equal(J('S.day'),6);nextday();run('S.time=9.0;');frames(6);assert.equal(J('ada41Station()'),null,'no station on day 7');assert.equal(tags41().length,0,'no v41 object on day 7');
  nextday();run('S.time=7.95;');frames(6);assert.equal(J('ada41Station()'),null,'no station at 07:57 (the Yard closed)');run('S.time=8.02;');frames(10);for(let k=0;k<60&&!stationNow();k++)frames(10);const st=stationNow();assert(st&&st.at==='yard','the station at the Yard from 08:00');
  assert.deepEqual([st.x,st.z],ST,'at the probed point');assert(tags41().includes('slate')&&tags41().includes('trestle'),'its mesh');
  // the probe: the point against every Yard prompt and spot; the grid round the station and round Ada (nothing open)
  run('S.time=9.0;');frames(10);const P0=yardProbe('nothing open');assert(!P0.bad.length,'the probe (nothing open): '+P0.bad.slice(0,4).join('; '));R.grid=P0.grid;
  // online: none
  run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");frames(10);assert.equal(J('ada41Station()'),null,'online: no station');assert.equal(tags41().length,0,'online: no v41 object');run('NET.on=false;NET.room=null;');frames(10);
  // 18:00: none; discovery not possible
  run('S.time=18.01;');frames(10);assert.equal(J('ada41Station()'),null,'no station at 18:00 on a day she is at her bench');assert.equal(J('!!hxB41()'),false,'no discovery');
  // the first read at the Yard at 09:00 is discovery
  run('S.time=9.0;S.money=3000;');frames(10);const ph=readSlate(0);assert(J('!!hxB41()'),'G.b41 created by the first read');assert(logHas('commission','read'),'commission read logged');
  assert(/gist40-panel gist41-slate/.test(ph),'the slate panel carries gist40-panel');assert(/PIECES TO ORDER/.test(ph),'the slate’s words');assert(/You read my slate\./.test(ph),'Ada’s first line');
  assert(/For your flat: kitchen shelf\./.test(ph)&&/₦9,000 · half now ₦4,500/.test(ph)&&/Bring: four cup hooks, from Palm Court Finds\./.test(ph),'the flat offer with its price and its thing to bring');
  // short purse: disabled, "When you have it.", Ada's short line at the Yard
  const b0=buttons(ph).find(b=>b.act==='ada41Order');assert(b0&&b0.disabled&&/When you have it\./.test(ph)&&/neither am I until six/.test(ph),'refused when short');
  assert(buttons(ph).some(b=>b.act==='ada41Close'),'Back');R.html390=/gist41-back/.test(ph);closeP();
  // (fix round, DOD-11 and S14) the offers in one holder and Back after them; under 480 px of height the offers side by side and Back at the
  // top right, beside the title (the browser measure in TESTING_gist.md checks every Order button in view and Back over no offer at 844 x 390)
  {const css=fs.readFileSync(path.join(GAME,'src','ada-v41.css'),'utf8'),io=ph.indexOf('class="gist41-offers"');
   assert(io>0&&ph.indexOf('gist41-offer gist41-offer-flat')>io&&ph.indexOf('gist41-actions')>ph.lastIndexOf('gist41-orderbtn'),'(DOD-11, S14) the slate’s offers in one holder, Back after them');
   assert(/@media \(max-height:480px\) and \(min-width:600px\)\{[^@]*#panel \.gist41-offers\{display:flex/.test(css),'(DOD-11, S14) under 480 px of height the offers side by side');
   assert(/@media \(max-height:480px\) and \(min-width:600px\)\{[^@]*#panel \.gist41-slate>\.gist41-actions\{position:absolute/.test(css),'(DOD-11, S14) under 480 px of height the slate’s Back at the top right, over no offer');}
  // the order through spend(): S.spentToday counts it; one deposit for a double tap on the same button
  run('S.money=20000;');const spent0=J('S.spentToday|0');readSlate(0);const ob=buttons(J('PH')).find(b=>b.act==='ada41Order'&&!b.disabled);assert(ob,'the order button');
  run(`dispatch('ada41Order',${JSON.stringify(ob.data)});dispatch('ada41Order',${JSON.stringify(ob.data)});`);assert.equal(J('S.money'),15500,'one deposit of ₦4,500');assert.equal(J('(S.spentToday|0)')-spent0,4500,'through spend()');
  assert(logHas('commission','order shelf'),'the order logged');const terms=J('PH');assert(/Half now, for the wood\./.test(terms)&&terms.includes(J("esc(adaLine41('ad41-wood-afara'))"))&&/Four small ones from Palm Court Finds/.test(terms),'Ada’s terms, the wood and her ask');
  assert.equal(J('hxB41().piece.state'),'wait','the piece waits for its thing');closeP();
  // one at a time: the slate offers nothing new
  const ph2=readSlate(0);assert(!buttons(ph2).some(b=>b.act==='ada41Order'),'no order button while a piece is open');assert(/Waiting for its cup hooks: the kitchen shelf, on the bench\./.test(ph2)&&/One piece at a time\./.test(ph2),'the open piece and Ada’s one-at-a-time line');closeP();
  // a thing in the pocket: the probe again (the hand-over prompt over the reach)
  buyFinds(0);run('S.time=9.0;');frames(6);const P1=yardProbe('a thing in the pocket');assert(!P1.bad.length,'the probe (a thing in the pocket): '+P1.bad.slice(0,4).join('; '));
  handOver(0);nextday();run('S.time=9.0;');frames(10);const P2=yardProbe('a piece ready');assert(!P2.bad.length,'the probe (a piece ready): '+P2.bad.slice(0,4).join('; '));
  // during the beat (outside the hush the grid round Ada; within it the hush)
  collectOpen(0);waitHold();click('ada41Pay');waitHold();click('ada41Later');waitHold();click('ada41Polish');frames(2);
  for(let k=0;k<6;k++){run('hxPress(0);');frames(2);run('hxRelease(0);');frames(12);}const P3=yardProbe('during the beat');assert(!P3.bad.length,'the probe (during the beat): '+P3.bad.slice(0,4).join('; '));
  // the veranda: a visit day in a fresh day-8 household; discovery there; no station at the Yard that day
  run("dispatch('newgame');");house();dayTo(8);invite();run('S.time=9.0;');frames(10);const sv=stationNow();assert(sv&&sv.at==='veranda','the station on the veranda on a visit day');
  assert(J("ada41Where()")==='veranda','Ada on the veranda');const V=verandaProbe();assert(!V.bad.length,'the veranda rule: '+V.bad.slice(0,4).join('; '));R.veranda=V.cols;
  readSlate(0);assert(J('!!hxB41()'),'discovery on the veranda');closeP();run('S.time=17.9;');frames(10);assert(J("ada41Station()&&ada41Station().at==='veranda'"),'still there after six on a visit day');
  // (fix round, DOD-9) from 17:00 to 18:15, Aunty Bisi passing: a player at the station's point (0.32 m off) has the station's prompt top
  // unless nearer her than the station's point; at 17:20 round her (3 m, every 0.25 m): nearer her and within her reach no v41 prompt is top,
  // nearer the station's point and within its reach the station's is
  {run('S.time=16.95;');frames(30);const bad=[];let shown=0,near=0,grid=0;const gbad=[];
   for(let k=0;k<2400&&J('S.time')<18.25;k+=6){frames(6);const st=J('ada41Station()');if(!st)continue;shown++;const px=st.x+0.25,pz=st.z+0.2;
    run(`hxAt(0,${px},${pz});hxAt(1,-8,-10);`);const top=J('(()=>{const n=nearest(0);return n?n.id:"";})()');
    const nb=J(`(()=>{const g=BISI39.world&&BISI39.world.fig;if(!g||!g.visible||!g.parent)return null;return Math.hypot(g.position.x-(${px}),g.position.z-(${pz}));})()`);
    if(nb!==null&&nb<Math.hypot(0.25,0.2)){near++;continue;}if(!/^(slate41read|ada41)/.test(top))bad.push(r3(J('S.time'))+': '+top);
    if(!grid&&J('S.time')>=17.33){const g=J("(()=>{const g=BISI39.world&&BISI39.world.fig;return g&&g.visible&&g.parent?[g.position.x,g.position.z]:null;})()");
     if(g){for(let dx=-3;dx<=3.001;dx+=0.25)for(let dz=-3;dz<=3.001;dz+=0.25){const x=r3(g[0]+dx),z=r3(g[1]+dz);if(J(`!!blocked(${x},${z},PR,{lvl:0,noCrate:true})`))continue;
       const db=Math.hypot(x-g[0],z-g[1]),ds=Math.hypot(x-st.x,z-st.z);const tp=topAt(0,x,z);grid++;
       if(db<ds&&db<2.4&&/^(slate41read|ada41)/.test(tp))gbad.push('('+x+', '+z+') nearer Aunty Bisi: '+tp);
       if(ds<=db&&ds<J('ADA41.STATION.reach')&&!/^(slate41read|ada41)/.test(tp))gbad.push('('+x+', '+z+') within the station’s reach: '+tp);}}}}
   run('hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);');
   assert(shown>100,'the veranda station from 17:00 to 18:15: '+shown);assert(!bad.length,'the station’s prompt top at its point while Aunty Bisi passes: '+bad.slice(0,4).join('; '));
   assert(grid>0,'the grid round Aunty Bisi');assert(!gbad.length,'round Aunty Bisi: '+gbad.slice(0,4).join('; '));R.bisi={shown,near,grid};}
  // the gist begun: the veranda station goes
  run('S.time=18.2;hxAt(0,-5.2,6.4,[0,1]);hxAt(1,-4.6,6.4,[0,1]);');const ws=waitStart(3000);if(ws>=0){assert.equal(J('ada41Station()'),null,'no station once the gist has begun');untilIdle();}
  // (fix round, DOD-8 and C3) the hand-over at the veranda station: Ada's night line, as at the Yard ("We can choose here" was for an order)
  {run("dispatch('newgame');");house();dayTo(8);invite();run('S.time=9.0;S.money=40000;');frames(10);readSlate(0);order('flat');closeP();buyFinds(0);run('S.time=10.0;');frames(6);
   assert.equal(J("ada41Station()&&ada41Station().at"),'veranda','the veranda station for the hand-over');const hp=handOver(0);
   assert(hp.includes(J("esc(adaLine41('ad41-night'))"))&&!/We can choose here/.test(hp),'(DOD-8, C3) the veranda hand-over says Ada’s night line: '+hp.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,240));R.verandaHand=true;}
  itemsSame('2 end');R.checked={day7:true,yard:true,veranda:true};return R;});

 // 3. making-and-collection
 check(3,()=>{const R={};run("dispatch('newgame');");house();dayTo(8);run('S.time=9.0;S.money=40000;');frames(10);const home0=homeJSON();
  readSlate(0);order('flat');closeP();
  // waits for its thing: the next morning still waiting, nothing on the trestle
  nextday();run('S.time=9.0;');frames(10);assert.equal(J('hxB41().piece.state'),'wait','still waiting the next day');assert(!tags41().includes('piece'),'nothing on the trestle');assert.equal(homeJSON(),home0,'no write to S.home');
  buyFinds(0);run('S.time=16.5;');frames(6);handOver(0);assert.equal(J('hxB41().piece.state'),'cut','cut the evening it is handed over');assert(logHas('commission','cut shelf'),'cut logged');
  run('S.time=17.9;');frames(10);assert.notEqual(J('ada41Piece().state'),'ready','not ready the same day');assert(!tags41().includes('piece'),'not on the trestle the same day');
  // Sleep before six: ready the next morning (the reload and a jump keep it)
  run('S.time=17.0;');run("dispatch('nextday');closePanel();hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);");frames(2);assert.equal(J('ada41Piece().state'),'ready','ready after Sleep before six');
  run('save();S=load();enterWorld();closePanel();');frames(4);assert.equal(J('ada41Piece().state'),'ready','ready after a reload');run('S.time=15.5;');frames(10);assert(tags41().includes('piece'),'on the trestle after a jump');
  // waits for ever
  nextday();nextday();run('S.time=9.0;');frames(10);assert.equal(J('ada41Piece().state'),'ready','still ready two days on');
  // never in the courtyard after six (no visit), never during the gist
  run('S.time=18.6;');frames(20);settled('ada');frames(10);assert.equal(J('ada41Station()'),null,'no station after six');
  // the gist (the pair at the rail), then late in the evening, Ada settled in the courtyard: still none
  pair();const g3=gistOnce(3000);if(g3)assert.equal(J('ada41Station()'),null,'no station after the gist');run('hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);');run('S.time=Math.max(S.time,22.3);');frames(20);settled('ada');frames(10);assert.equal(J('ada41Where()'),'courtyard','Ada in the courtyard');assert.equal(J('ada41Station()'),null,'no station in the courtyard after six');const ada=J("(()=>{const a=found38Npc('ada');return a?[a.g.position.x,a.g.position.z]:null;})()");
  if(ada){run(`hxAt(0,${ada[0]},${ada[1]+1.0});`);frames(2);assert(!cands(0).some(id=>/41/.test(id)),'no v41 prompt by Ada in the courtyard: '+cands(0).join());}
  // short purse: Ada's line, the cloth, nothing taken; still there tomorrow
  nextday();run('S.time=9.0;S.money=1000;');frames(10);let ph=collectOpen(0);assert(/Pay the rest when you can\./.test(ph),'Ada’s short line at the Yard');assert(!buttons(ph).some(b=>b.act==='ada41Pay'),'no pay button when short');
  assert.equal(J('S.money'),1000,'nothing taken');closeP();frames(10);assert(tags41().includes('cloth'),'the cloth over it');nextday();run('S.time=9.0;');frames(10);assert.equal(J('ada41Piece().state'),'ready','there the next day');
  // the balance through spend(), the next order in the same panel ("Later" where "Pay the rest" was), the polish choice
  run('S.money=40000;');const sp0=J('S.spentToday|0');ph=collectOpen(0);const pay=buttons(ph).find(b=>b.act==='ada41Pay');assert(pay&&/Pay the rest · ₦4,500/.test(pay.text),'"Pay the rest · ₦4,500"');
  const order1=buttons(ph).map(b=>b.act);assert.equal(order1[order1.length-1],'ada41Pay','"Pay the rest" lower right (last)');waitHold();click('ada41Pay');assert.equal(J('S.money'),35500,'the balance');assert.equal(J('(S.spentToday|0)')-sp0,4500,'through spend()');assert(logHas('commission','collect shelf'),'collect logged');
  // (fix round, DOD-2 and S3; this assertion read "Later" as the last button before the ruling moved the offers below it) "Later" in the row
  // where "Pay the rest" was, first; the offers below that row; the panel held to the top of the screen; step 2 aligned to step 1's row
  ph=J('PH');const acts2=buttons(ph).map(b=>b.act);assert.equal(acts2[0],'ada41Later','"Later" where "Pay the rest" was (first, in its row)');assert(acts2.includes('ada41Order'),'the next piece offered in the same panel');
  {const iR=ph.indexOf('gist41-steps'),iL=ph.indexOf('gist41-laterbtn'),iO=ph.indexOf('class="gist41-next gist41-offers"'),css=fs.readFileSync(path.join(GAME,'src','ada-v41.css'),'utf8');
   assert(iR>0&&iL>iR&&iO>iL&&ph.indexOf('gist41-orderbtn')>iO,'(DOD-2, S3) the offers below Later’s row: '+[iR,iL,iO,ph.indexOf('gist41-orderbtn')].join());
   assert(/#ov:has\(> #panel > \.gist41-collect\)\{align-items:flex-start/.test(css),'(DOD-2, S3) the collection panel held to the top of the screen at every width');
   assert(J("typeof adaAlign41==='function'"),'(DOD-2, S3) the step-2 rows aligned to step 1’s in a browser (adaAlign41; Node has no layout)');}
  assert(/And the next one\?/.test(ph),'Ada’s next line');waitHold();click('ada41Order',x=>x.data.v==='flat');assert.equal(J('hxB41().piece.id'),'mirror','the mirror ordered in the same panel');assert.equal(J('S.money'),30500,'its deposit');
  ph=J('PH');assert(/The last polish is yours\./.test(ph),'the polish step');
  // (fix round, S8) the polish lines straight under the collected piece's name; the new order in its own card, with its heading, Ada's terms
  // and the shells button inside it
  {const iP=ph.indexOf('The last polish is yours.'),iC=ph.indexOf('class="gist41-ordered'),iH=ph.indexOf('Ordered: shells mirror'),iT=ph.indexOf('Half now, for the wood.'),iS=ph.indexOf('gist41-shellsbtn');
   assert(iP>0&&iC>iP&&iH>iC&&iT>iH&&iS>iT,'(S8) the polish line first, then the order’s own card “Ordered: shells mirror” with the terms and the shells button: '+[iP,iC,iH,iT,iS].join());}
  const acts3=buttons(ph).map(b=>b.act);assert(!/Pay|Order/.test(buttons(ph).slice(-1)[0].text),'no money button lower right on the last step');assert(acts3.includes('ada41Leave')&&acts3.includes('ada41Polish'),'Polish it, Leave it to Ada');
  waitHold();click('ada41Leave');frames(70);assert(J('hxB41().hand&&hxB41().hand.id==="shelf"'),'the shelf in the hands');assert.equal(homeJSON(),home0,'no write to S.home through the collection');
  // "Later": a second collection
  fullOrderMirror();nextday();run('S.time=9.0;');frames(10);run('hxAt(0,-5.2,4.0);');carryIn(0);run('S.time=9.0;');frames(6);ph=collectOpen(0);waitHold();click('ada41Pay');waitHold();assert(buttons(J('PH')).some(b=>b.act==='ada41Later'),'Later offered');click('ada41Later');assert.equal(J('hxB41().later'),J('S.day'),'Later recorded');assert(!J('hxB41().piece'),'nothing ordered');
  waitHold();click('ada41Leave');frames(70);
  // (fix round, S2) Mallam's order kept for tonight (₦2,000) and the next deposit would leave less: said plainly in step 2, "Later" the
  // default (the primary button, the Order buttons plain); then the deposit paid at the slate later that day
  carryIn(0);run('S.time=9.0;S.money=40000;');frames(6);fullOrder(0);nextday();
  run('S.time=10.7;hxAt(0,-3,10.6,[0,1]);hxAt(1,-8,-10);');frames(10);assert.equal(hsid(0),'mallam40order','Mallam’s order prompt');run('PH="";');press(0);click('mallam40Order',x=>x.data.v==='onion');frames(4);if(J('overlayOpen()'))run('closePanel();');
  assert(J('!!(mallamRec40(false)&&mallamRec40(false).order)'),'Mallam keeps an order tonight');
  {const bal=J('ada41Piece().bal'),dep=J('ada41Next().flat.dep');run(`S.money=${bal+dep+1000};`);ph=collectOpen(0);waitHold();click('ada41Pay');waitHold();ph=J('PH');
   assert(/Keep ₦2,[05]00 for Mallam’s sticks( and Aunty Bisi’s tray)? tonight\./.test(ph),'step 2 says so plainly: '+ph.replace(/<[^>]+>/g,' ').slice(0,300));
   const bl=buttons(ph),lt=bl.find(x=>x.act==='ada41Later'),ob=bl.filter(x=>x.act==='ada41Order'&&!x.disabled);assert(lt&&/primary/.test(lt.cls),'"Later" the default: '+(lt&&lt.cls));
   assert(ob.length&&ob.every(x=>!/primary/.test(x.cls)),'the Order buttons plain: '+ob.map(x=>x.cls).join());click('ada41Later');waitHold();click('ada41Leave');frames(70);
   const m1=J('S.money');run('S.time=15.0;');frames(6);const ph2=readSlate(0);const o2=buttons(ph2).find(x=>x.act==='ada41Order'&&x.data.v==='flat'&&!x.disabled);assert(o2,'the slate takes the order later that day');
   order('flat');assert.equal(J('S.money'),m1-dep,'its deposit paid at the slate');assert(J('!!hxB41().piece'),'the piece ordered');closeP();R.keep={bal,dep};}
  // the owner's other prices unchanged
  assert.equal(J('FOUND38.CARVE_PRICE'),0,'CARVE_PRICE 0');assert.equal(J('FOUND38.PRICE.shelf'),5000,'the shelf ₦5,000');assert.equal(homeJSON(),home0,'no write to S.home or storage in any step');itemsSame('check 3');
  return R;});
 // the mirror's thing (three shells from the store, the glass from Finds) and its hand-over, from the station
 function fullOrderMirror(){const p=J('hxB41().piece');assert(p&&p.id==='mirror','the mirror is open');run('life34().shells=5;S.time=9.2;');frames(6);readSlate(0);const ph=J('PH');assert(buttons(ph).some(b=>b.act==='ada41Shells'&&!b.disabled),'the shells button');
  click('ada41Shells');assert.equal(J('life34().shells'),2,'three shells taken');closeP();buyFinds(0);run('S.time=10.5;');frames(6);handOver(0);assert.equal(J('hxB41().piece.state'),'cut','the mirror cut');}

 // 4. polish
 check(4,()=>{const R={lengths:{}};
  // each run starts from the same saved morning (a household made by the real steps, its piece ready; saved once and continued from the title
  // like a reload), so the eleven runs cost one household each kind
  const snaps={};const ready=(comp)=>{const k=comp?'c':'p';if(!snaps[k]){run("dispatch('newgame');");if(comp){houseComp();dayTo(8,true);}else{house();dayTo(8);}run('S.time=9.0;S.money=60000;');frames(10);fullOrder(0);(comp?nextdayC:nextday)();run('S.time=9.0;');frames(10);
    snaps[k]=J('(save(),localStorage.getItem(KEY))');}
   run(`localStorage.setItem(KEY,${JSON.stringify(snaps[k])});dispatch('continue');closePanel();`+(comp?'AI.on=true;':'')+'hxAt(0,-2.3,-15.6);hxAt(1,-1.2,-16.6);');frames(4);};
  const setup2=()=>{collectOpen(0);waitHold();click('ada41Pay');waitHold();if(buttons(J('PH')).some(b=>b.act==='ada41Later')){click('ada41Later');waitHold();}};
  const setup=(comp)=>{ready(comp);setup2();};
  const run4=(name,comp,o)=>{setup(comp);if(o.p1)run('hxAt(1,'+(ST[0]+0.45)+','+(ST[1]+0.35)+');');else if(!comp)run('hxAt(1,-8,-10);');click('ada41Polish');frames(1);
   // the companion: the AI player, put at the station's point, is offered nothing
   if(comp){const ai=J('AI.i');run(`hxAt(${ai},${ST[0]},${ST[1]+0.3});`);assert(!cands(ai).some(id=>/41/.test(id)),name+': no v41 prompt for the AI player: '+cands(ai).join());}
   const a0=J("S.nb&&S.nb.ada?S.nb.ada.aff|0:0");const r=beat(o);assert(r.done,name+': finished ('+JSON.stringify(r)+')');assert(r.secs>=10&&r.secs<=15,name+': '+r.secs+' s');R.lengths[name]=r.secs;
   assert.equal(J("S.nb&&S.nb.ada?S.nb.ada.aff|0:0")-a0,1,name+': Ada friendship +1');return r;};
  // the sheen rises with presses and sinks without; Ada's two bubbles
  setup(false);run('hxAt(1,-8,-10);');click('ada41Polish');frames(1);atPoint(0,ST[0],ST[1],0.15);for(let k=0;k<10;k++){run('hxPress(0);');frames(1);run('hxRelease(0);');frames(13);}
  const g1=J('ADA41.run.glow');assert(g1>0.3,'the sheen rises: '+g1);frames(60);const g2=J('ADA41.run.glow');assert(g2<g1-0.1,'and sinks: '+g1+' -> '+g2);
  assert(J("Object.keys(ADA41.world.bub).some(t=>/With the grain/.test(t))"),'Ada’s first bubble at 0.3');
  assert(/Polish the kitchen shelf/.test(label(0)),'the prompt reads "Polish the kitchen shelf": '+label(0));assert(/●/.test(label(0)),'the sheen bar in the pill');
  // (fix round, S4) the standing points beside the trestle's ends, Polish offered at each; Ada's words hang over the trestle, inside the view of
  // each camera whose player stands there, at 1280 x 800 and both phone sizes; a bubble whose anchor a camera cannot see draws nothing there
  {const sd=J('adaSides41(ada41Station())'),mx=ST[0]+J('ADA41.STATION.mesh[0]'),mz=ST[1]+J('ADA41.STATION.mesh[1]');
   assert(sd[0][0]<mx-0.5&&sd[1][0]>mx+0.5&&sd.every(q=>Math.abs(q[1]-mz)<0.5),'the standing points beside the trestle: '+JSON.stringify(sd));
   run(`hxAt(0,${sd[0][0]},${sd[0][1]});hxAt(1,${sd[1][0]},${sd[1][1]});`);frames(2);assert(/^ada41(polish|turn)$/.test(hsid(0))&&/^ada41(polish|turn)$/.test(hsid(1)),'Polish at both standing points: '+hsid(0)+' / '+hsid(1));
   run('ADA41.run.b1=false;');for(let k=0;k<4;k++){run('hxPress(0);');frames(1);run('hxRelease(0);');frames(13);}assert(J('ADA41.world.live.length')>0,'a bubble of Ada’s live');
   const views={};for(const [W,H,t] of [[1280,800,false],[390,844,true],[844,390,true]]){run(`hxScreen(${W},${H},${t});`);frames(2);
    const v=J(`(()=>{const out=[];for(const b of ADA41.world.live){const f=b.userData.f40;for(const i of [0,1]){const c=cams[i];if(!c)continue;c.updateMatrixWorld();const p=new THREE.Vector3(f.obj.position.x,(f.obj.position.y||0)+f.hy,f.obj.position.z);const q=p.clone().applyMatrix4(c.matrixWorldInverse);p.project(c);out.push([i,-q.z>0.1&&Math.abs(p.x)<=1&&Math.abs(p.y)<=1,Math.round(p.x*100)/100,Math.round(p.y*100)/100]);}}return out;})()`);
    views[W+'x'+H]=v;assert(v.length&&v.every(x=>x[1]),W+' x '+H+': every bubble’s anchor inside each half: '+JSON.stringify(v));}
   run('hxScreen(1280,800,false);');R.bubbles=views;
   const hid=J(`(()=>{const o={position:{x:0,y:0,z:0},visible:true,parent:scene};const b=bubble41('hx41 behind',1500,o,2.1);if(!b)return null;const out=[];
     // the anchor just past the half's left edge (NDC x -1.05, inside v40's own margin, where its clamp drew an empty box at the edge), then behind
     for(const i of [0,1])for(const nx of [-1.05,null]){const c=cams[i];c.updateMatrixWorld();const p=nx===null?new THREE.Vector3(0,0,0.5).unproject(c).sub(c.position).multiplyScalar(-1).add(c.position):new THREE.Vector3(nx,0,0.5).unproject(c);
      o.position.x=p.x;o.position.z=p.z;o.position.y=p.y-b.userData.f40.hy;b.onBeforeRender(null,scene,c);out.push(b.scale.x);}adaBubblesOff41();return out;})()`);
   assert(hid&&hid.every(x=>x<0.01),'a bubble whose anchor no camera can see draws nothing: '+JSON.stringify(hid));run('hxAt(1,-8,-10);');atPoint(0,ST[0],ST[1],0.15);}
  // leaving pauses, returning resumes
  for(let k=0;k<10;k++){run('hxPress(0);');frames(1);run('hxRelease(0);');frames(1);}const g3=J('ADA41.run.glow');run('hxAt(0,'+(ST[0]+5)+','+ST[1]+');');frames(90);assert.equal(J('ADA41.run.glow'),g3,'away 4 m: paused, the sheen kept');
  // a reload restarts it from 0 with the piece paid for
  run('save();S=load();enterWorld();closePanel();');frames(6);assert(J('!!hxB41().coll'),'the piece still paid for, on the trestle');assert.equal(J('ADA41.run.glow'),0,'the sheen from 0');atPoint(0,ST[0],ST[1],0.15);assert.equal(hsid(0),'ada41polish','"Polish the …" after the reload');
  // standing still cannot finish: rubbed to 0.75 with both turns, then still
  for(let f=0;f<400&&!(J('ADA41.run.turns')>=2&&J('ADA41.run.glow')>=0.75);f++){const id=hsid(0);if(f%2===0&&(id==='ada41polish'||id==='ada41turn'))run('hxPress(0);');frames(1);run('hxRelease(0);');}
  assert(J('ADA41.run.turns')>=2&&J('ADA41.run.glow')>=0.75,'rubbed to 0.75 with both turns');frames(600);assert(!J('!!hxB41().hand'),'standing still does not finish it');
  // the AI is never offered it
  // the four runs at the cap rate (every press made, the pose keeps one) and at the bot's rate (a press every 0.3 s)
  for(const [rate,every] of (process.env.GIST41_SHORT?[['cap',2]]:[['cap',2],['bot',9]])){
   run4('lone-'+rate,false,{who:[0],every});
   run4('pair-'+rate,false,{who:[0,1],every,p1:true,turner:1});
   run4('one-presser-'+rate,false,{who:[0],every,p1:true});
   run4('companion-'+rate,true,{who:[0],every});
   // (fix round, DOD-3, S6) a pair where both rub (each presses whatever is offered): the household's one rub per GLOW.rubS keeps it at 10-12 s
   const br=run4('both-rub-'+rate,false,{who:[0,1],every,p1:true});assert(br.secs>=10&&br.secs<=12,'both-rub-'+rate+': a pair where both rub lands at 10-12 s: '+br.secs);
   assert(R.lengths['lone-'+rate]>=13&&R.lengths['lone-'+rate]<=15,'lone-'+rate+': about 14 s alone: '+R.lengths['lone-'+rate]);}
  // in the companion run the AI got no v41 prompt
  // "Turn it over" by Mallam's rules: after the first turn, offered with Polish hidden to a player who has not rubbed in 1.0 s
  setup(false);run('hxAt(1,-8,-10);');click('ada41Polish');frames(1);atPoint(0,ST[0],ST[1],0.15);
  for(let f=0;f<800&&J('ADA41.run.turns')<1;f++){const id=hsid(0);if(f%16===0&&(id==='ada41polish'||id==='ada41turn'))run('hxPress(0);');frames(1);run('hxRelease(0);');}
  assert.equal(J('ADA41.run.turns'),1,'one turn made');frames(36);assert.equal(hsid(0),'ada41turn','a lone player not rubbing for 1 s is offered the turn, Polish hidden');
  // the hush: four taps a second for 3 s after the beat, from the point and from points nearer Ada and the bench: no panel, no talk line
  for(let f=0;f<600&&!J('!!hxB41().hand');f++){const id=hsid(0);if(f%2===0&&(id==='ada41polish'||id==='ada41turn'))run('hxPress(0);');frames(1);run('hxRelease(0);');}
  assert(J('!!hxB41().hand'),'finished');const talk0=J("S.nb&&S.nb.ada?JSON.stringify(S.nb.ada):''"),phn0=J('PHN');
  for(const [x,z] of [[ST[0],ST[1]],[ST[0]-1.2,ST[1]+1.4]]){run(`hxAt(0,${x},${z});`);for(let k=0;k<3;k++){run('hxPress(0);');frames(1);run('hxRelease(0);');frames(6);}}
  assert(!J('overlayOpen()'),'no panel opened by taps during the hush');assert.equal(J('PHN'),phn0,'no panel at all');assert.equal(J("S.nb&&S.nb.ada?JSON.stringify(S.nb.ada):''"),talk0,'no talk spent');
  // (fix round, DOD-1, S5) four taps a second for a full 3 s from the station's point, then 3 s from a point nearer Ada: every tap starts the
  // hush again, so nothing opens and nothing is spent; it ends 2 s after the last tap
  for(const [x,z] of [[ST[0],ST[1]],[ST[0]-1.2,ST[1]+1.4]]){run(`hxAt(0,${x},${z});`);for(let k=0;k<13;k++){run('hxPress(0);');frames(1);run('hxRelease(0);');frames(6);
    assert(!J('overlayOpen()'),'tap '+k+' at ('+r3(x)+', '+r3(z)+'), 4 a second for 3 s: nothing opens: '+String(J('PH')).replace(/<[^>]+>/g,' ').slice(0,80));}}
  assert.equal(J('PHN'),phn0,'no panel at all over 6 s of taps');assert.equal(J("S.nb&&S.nb.ada?JSON.stringify(S.nb.ada):''"),talk0,'no talk spent over 6 s of taps');
  assert.equal(hsid(0),'ada41hush','still hushed while the taps go on');frames(66);assert.notEqual(hsid(0),'ada41hush','the hush ends 2 s after the last tap');
  // "Leave it to Ada": at once, the hush after it
  setup(false);waitHold();click('ada41Leave');assert(J('!!hxB41().hand'),'"Leave it to Ada": the piece in the hands at once');atPoint(0,ST[0],ST[1],0.15);assert.equal(hsid(0),'ada41hush','the hush after it');
  frames(70);assert.notEqual(hsid(0),'ada41hush','the hush ends after 2 s');
  // (fix round, DOD-7) a visit day: the piece paid for on the veranda and its polish begun; the gist begins: finished as "Leave it to Ada", the
  // paid piece in the hands (never left on a trestle that has gone)
  {ready(false);invite();run('S.time=17.2;');frames(6);const sv=atStation(0);assert.equal(sv.at,'veranda','the station on the veranda');collectOpen(0);
   // (repair 2) the veranda station's own kicker on the collection
   assert(J('PH').includes('<p class="gist40-kicker">'+J("esc(adaLine41('ui41-kicker-v'))")+'</p>')&&!J('PH').includes(J("esc(adaLine41('ui41-kicker-c'))")),'(repair 2) the veranda kicker: '+strip(J('PH')).slice(0,60));waitHold();click('ada41Pay');waitHold();
   if(buttons(J('PH')).some(b=>b.act==='ada41Later')){click('ada41Later');waitHold();}click('ada41Polish');frames(1);atPoint(0,sv.x,sv.z,0.15);for(let k=0;k<5;k++){run('hxPress(0);');frames(1);run('hxRelease(0);');frames(13);}
   assert(J('!!hxB41().coll')&&J('ADA41.run.glow')>0,'the polish begun on the veranda');run('S.time=18.2;hxAt(0,-5.2,6.4,[0,1]);hxAt(1,-4.6,6.4,[0,1]);');const ws=waitStart(3000);assert(ws>=0,'the gist begins');frames(20);
   assert(J('!hxB41().coll')&&J('!!hxB41().hand'),'the paid piece in the hands once the gist begins: '+JSON.stringify(J('hxB41().hand')));untilIdle();R.veranda=J('hxB41().hand.id');}
  // touch: the SCREEN-1 shape at both phone sizes (four taps a second for 3 s from the walk up, each landing on the money button), then a double
  // tap on "Pay the rest" from a touch-opened and from a keyboard-opened panel
  run(`var hxTap41=(i,up)=>{foundPointer38(true);dailyPointer40();act[i]=true;hxFrames(3);foundPointer38(false);let pressed=null;
    if(overlayOpen()){const h=String(panel.innerHTML);const el=h.match(/<button\\b[^>]*class="[^"]*gist41-paybtn[^"]*"[^>]*>/)||h.match(/<button\\b[^>]*data-act="ada41[^"]+"[^>]*>/);if(el){const inP=h.includes('gist40-panel');const e={target:{closest:s=>s==='.gist40-panel'&&inP?{}:null}};
     if(!dailyClick40(e)&&!foundPanelClick38(e)){const act0=(el[0].match(/data-act="([^"]+)"/)||[])[1];const data={};for(const x of el[0].matchAll(/data-(?!act)([\\w-]+)="([^"]*)"/g))data[x[1]]=x[2];pressed=act0;dispatch(act0,data);}}}
    hxFrames(up);return pressed;};
   var hxClick41=(cls)=>{const h=String(panel.innerHTML);const el=h.match(new RegExp('<button\\\\b[^>]*class="[^"]*'+cls+'[^"]*"[^>]*>'));if(!el)return null;const inP=h.includes('gist40-panel');const e={target:{closest:s=>s==='.gist40-panel'&&inP?{}:null}};if(dailyClick40(e))return 'held';const act0=(el[0].match(/data-act="([^"]+)"/)||[])[1];const data={};for(const x of el[0].matchAll(/data-(?!act)([\\w-]+)="([^"]*)"/g))data[x[1]]=x[2];dispatch(act0,data);return act0;};`);
  R.thumb={};
  for(const [W,H] of [[390,844],[844,390]]){const tag=W+'x'+H;ready(false);
   run(`hxScreen(${W},${H},true);`);atStation(0);assert.equal(hsid(0),'ada41collect','the collect prompt');const m0=J('S.money'),seq=[];
   for(let k=0;k<12;k++)seq.push(J(`hxTap41(0,${k&1?5:4})`));assert(J('overlayOpen()'),tag+': the collection panel opened by the first tap');
   assert(seq.every(x=>x===null),tag+': taps press nothing: '+JSON.stringify(seq));assert.equal(J('S.money'),m0,tag+': nothing paid');assert(J('!hxB41().coll'),tag+': not collected');
   // a deliberate double tap on "Pay the rest" once the hold has run: paid once, nothing ordered, Later not pressed
   frames(36);const d1=J("hxClick41('gist41-paybtn')"),d2=J("hxClick41('gist41-orderbtn')")||J("hxClick41('gist41-laterbtn')");
   assert.equal(d1,'ada41Pay',tag+': the first tap pays');assert.equal(d2,'held',tag+': the second tap is held: '+d2);assert.equal(J('S.money'),m0-4500,tag+': paid once');assert(J('!hxB41().piece')&&J('hxB41().later')===null,tag+': nothing ordered, Later not pressed');
   R.thumb[tag]={taps:seq.length};run('closePanel();hxScreen(1280,800,false);');}
  // keyboard-opened: the double tap
  ready(false);frames(40);collectOpen(0);assert(J('!(DAILY40.hold>FOUND38.t)'),'a keyboard Act arms no hold');
  const k1=J("hxClick41('gist41-paybtn')"),k2=J("hxClick41('gist41-orderbtn')")||J("hxClick41('gist41-laterbtn')");assert.equal(k1,'ada41Pay','keyboard: pays');assert.equal(k2,'held','keyboard: the second click held (the hold re-armed on the step)');
  assert(J('!hxB41().piece'),'keyboard: nothing ordered');run('closePanel();');
  // (repair 2, R2-1) the walk to the standing points: "Polish it" walks a pair (P(0) where it collected, P(1) just beside) each to a standing
  // point of its own, facing the trestle, and holds them so (2.5 s on, and after 4.5 s more at the three sizes, the base's idle turn towards the
  // camera has not come); the piece's projected middle is inside each camera's half and clear of every player's body (the box of its visible
  // meshes, the flat ground shadows left out) at 1280 x 800, 844 x 390 and 390 x 844; a lone player walks to the nearer standing point
  {const where=()=>J("(()=>{const st=ada41Station();return {sd:adaSides41(st),mid:[ADA41.world.station.position.x,ADA41.world.station.position.z],ps:players.map(p=>[p.g.position.x,p.g.position.z,p.g.rotation.y])};})()");
   const facing=(c,tag)=>{for(const [k,p] of c.ps.entries()){const want=Math.atan2(c.mid[0]-p[0],c.mid[1]-p[1]),dif=Math.abs(Math.atan2(Math.sin(p[2]-want),Math.cos(p[2]-want)));assert(dif<0.05,'(R2-1) player '+k+' faces the trestle '+tag+': '+r3(p[2])+' against '+r3(want));}};
   setup(false);run('hxAt(1,'+(ST[0]+0.45)+','+(ST[1]+0.35)+');');frames(1);click('ada41Polish');frames(75);
   let c=where();const at=c.ps.map(p=>c.sd.findIndex(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<0.05));
   assert(at[0]>=0&&at[1]>=0&&at[0]!==at[1],'(R2-1) each player walked to a standing point of their own: '+JSON.stringify(c.ps.map(p=>p.slice(0,2).map(r3)))+' against '+JSON.stringify(c.sd));facing(c,'2.5 s on');
   const views={};for(const [W,H,t] of [[1280,800,false],[844,390,true],[390,844,true]]){run(`hxScreen(${W},${H},${t});`);frames(45);
    const v=J(`(()=>{scene.updateMatrixWorld(true);const c=new THREE.Box3().setFromObject(ADA41.world.top).getCenter(new THREE.Vector3());const out=[];
      const body=p=>{const b=new THREE.Box3();p.g.traverse(o=>{if(!o.isMesh)return;for(let q=o;q;q=q.parent)if(q.visible===false)return;const bb=new THREE.Box3().setFromObject(o);if(bb.max.y-bb.min.y<0.05)return;b.union(bb);});return b;};
      for(const i of [0,1]){const cam=cams[i];cam.updateMatrixWorld();const v=c.clone().project(cam);const cov=players.map(p=>{const b=body(p);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
        for(const X of [b.min.x,b.max.x])for(const Y of [b.min.y,b.max.y])for(const Z of [b.min.z,b.max.z]){const q=new THREE.Vector3(X,Y,Z).project(cam);x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);y0=Math.min(y0,q.y);y1=Math.max(y1,q.y);}
        return v.x>=x0&&v.x<=x1&&v.y>=y0&&v.y<=y1;});out.push({i,c:[Math.round(v.x*100)/100,Math.round(v.y*100)/100],inside:Math.abs(v.x)<=1&&Math.abs(v.y)<=1&&v.z<1,cov});}return out;})()`);
    views[W+'x'+H]=v;for(const x of v){assert(x.inside,'(R2-1) '+W+' x '+H+': the piece inside camera '+x.i+'’s half: '+JSON.stringify(x.c));assert(!x.cov.some(Boolean),'(R2-1) '+W+' x '+H+': the piece clear of every player’s body in camera '+x.i+': '+JSON.stringify(x));}}
   run('hxScreen(1280,800,false);');c=where();facing(c,'7 s on, still held');R.corners={at,views};
   for(const dx of [0.3,-0.3]){setup(false);run(`hxAt(1,-8,-10);hxAt(0,${ST[0]+dx},${ST[1]+0.1});`);frames(1);click('ada41Polish');frames(45);const c2=where(),k=c2.sd.findIndex(q=>Math.hypot(q[0]-c2.ps[0][0],q[1]-c2.ps[0][1])<0.05);
    assert.equal(k,dx>0?1:0,'(R2-1) a lone player walks to the nearer standing point (from '+dx+' m): '+JSON.stringify(c2.ps[0].map(r3)));}
   run('closePanel();');}
  // (repair 2, R2-2) Mr. Bassey's noon walk past the trestle (from 12:02 by the world's clock): a pair polishing from 11:54, each tapping Act about
  // four times a second through the beat and 3 s of the hush: at every tap the top prompt of both is the station's, nothing opens, no talk is
  // spent, and he passes within a standing point's reach; and at a standing point the polish's place in the list is ahead of an errand, Aunty
  // Bisi's and Mallam's buys at their nearest
  {ready(false);run('S.time=11.9;');frames(30);setup2();run('hxAt(1,'+(ST[0]+0.45)+','+(ST[1]+0.35)+');');frames(1);click('ada41Polish');frames(1);
   const nbX="JSON.stringify(Object.keys(S.nb).filter(k=>k!=='ada').map(k=>[k,S.nb[k]]))",nb0=J(nbX),phn0=J('PHN'),SD=J('adaSides41(ada41Station())'),SR=J('ADA41.STATION.sideR');const other=[];let near=9,f=0,open=0;
   const tap=()=>{for(const i of [0,1]){const id=hsid(i);if(!/^ada41(polish|turn|hush)$/.test(id))other.push(i+':'+id+'@'+r3(J('S.time')));run(`hxPress(${i});`);}frames(1);run('hxRelease(0);hxRelease(1);');if(J('overlayOpen()')){open++;run('closePanel();');}};
   for(;f<1500&&!J('!!hxB41().hand');f++){if(f%7===0)tap();else frames(1);const b=J("npcs.bassey&&npcs.bassey.g.visible?[npcs.bassey.g.position.x,npcs.bassey.g.position.z]:null");if(b)near=Math.min(near,...SD.map(q=>Math.hypot(q[0]-b[0],q[1]-b[1])));}
   assert(J('!!hxB41().hand'),'(R2-2) the polish finished');for(let k=0;k<13;k++){tap();frames(6);}
   assert(near<SR,'(R2-2) Mr. Bassey passes within a standing point’s reach during the beat: '+r3(near));
   assert.deepEqual(other,[],'(R2-2) the station’s prompt top at every tap through the beat and the hush: '+other.slice(0,4).join());assert.equal(open,0,'(R2-2) nothing opens');assert.equal(J('PHN'),phn0,'(R2-2) no panel at all');
   assert.equal(J(nbX),nb0,'(R2-2) no talk spent (the neighbours but Ada, whose friendship the polish raises)');R.noon={secs:r3(f/30),near:r3(near)};
   setup(false);run('hxAt(1,-8,-10);');click('ada41Polish');frames(40);const lst=J(`(()=>{const p=players[0].g.position,d=(a,b)=>Math.hypot(p.x-a,p.z-b),list=[{id:'errand40take',dist:-1.08},{id:'bisi39buy',dist:-1.2},{id:'mallam40order',dist:-0.05},{id:'gist38give',dist:-1.2}];adaHot41(0,list,d);return list.map(x=>[x.id,x.dist]);})()`);
   const me=lst.find(x=>/^ada41/.test(x[0]));assert(me&&lst.every(x=>x===me||x[1]>me[1]),'(R2-2) the polish ahead of every other prompt in the list: '+JSON.stringify(lst));run('closePanel();');}
  // (repair 2) the Yard at six: a polish still running when the Yard's station closes is finished as "Leave it to Ada" (as on the veranda), the
  // piece in the hands of the player who rubbed
  {setup(false);run('hxAt(1,-8,-10);');click('ada41Polish');frames(30);for(let k=0;k<5;k++){run('hxPress(0);');frames(1);run('hxRelease(0);');frames(13);}assert(J('!!hxB41().coll'),'the polish begun at the Yard');
   run('S.time=18.02;');frames(20);assert(J('!hxB41().coll')&&J('!!hxB41().hand')&&J('hxB41().hand.by')===0,'(repair 2) the Yard closed at six: the piece in the hands, left to Ada: '+JSON.stringify(J('hxB41().hand')));R.yardSix=J('hxB41().hand.polished');}
  // (repair 2) a visit day with the balcony full (no room for Ada's trestle on the veranda): Today says the piece is collected at her bench
  // tomorrow, never only "ready at her bench"
  {ready(false);invite();run('S.time=10.0;');frames(4);run(`${[0,1,2,3,4,5].map(c=>`S.home.items.push({id:'hx41p${c}',type:'plant',x:${c},y:FLAT.rows,rot:0});`).join('')}rebuildFurniture();refreshVisitor34();ADA41.vcache.key='';ADA41.checkAt=0;`);frames(6);
   assert(!J('ada41Station()'),'the balcony full: no station today');const tl=J('todayLines41()').find(x=>x.k==='ready'),tw=J("esc(adaLine41('ui41-today-tomorrow'))");
   assert(tw&&tl&&tl.html.includes(tw)&&J('ada41Today().html').includes(tw),'(repair 2) Today: collected at her bench tomorrow: '+JSON.stringify(tl));R.tomorrow=true;
   run(`S.home.items=S.home.items.filter(it=>!String(it.id).startsWith('hx41'));rebuildFurniture();refreshVisitor34();ADA41.vcache.key='';`);}
  return R;});

 // 5. bring-and-carry
 check(5,()=>{const R={};run("dispatch('newgame');");house();dayTo(8);run('S.time=9.0;S.money=90000;life34().shells=0;');frames(10);
  // the Finds block only while a thing sold there is wanted; never on the catch card
  run("hxAt(0,20.8,6.0,[0,1]);");frames(2);run("PH='';openLife34('market');");let ph=J('PH');assert(!/gist41-shop/.test(ph),'no Finds block before an order');const purse=h=>String(h).replace(/₦[\d,]+ in the purse/g,'PURSE');const cards0=purse(ph);run('closePanel();');
  readSlate(0);order('flat');closeP();run("hxAt(0,20.8,6.0,[0,1]);");frames(2);run("PH='';openLife34('market');");ph=J('PH');assert(/For Ada’s kitchen shelf: four cup hooks · ₦500/.test(ph),'the Finds block');
  assert.equal(purse(ph.replace(/<div class="life-note34 gist41-shop" data-shop41="finds"><b>[^<]*<\/b><button[^>]*>Buy it<\/button><\/div>/,'')),cards0,'the fifteen cards, paints and Bisi’s tip unchanged below it');
  run('closePanel();');run("life34().catch={id:'tilapia',size:20};PH='';openLifePanel34('<div class=\"catch34\"></div><div class=\"life-chips34\"></div>','fish');");assert(!/gist41-shop/.test(J('PH')),'never on the catch card (a thing wanted)');run("life34().catch=null;closePanel();openLife34('market');");
  const sp=J('S.spentToday|0');click('ada41Buy');assert.equal(J('(S.spentToday|0)')-sp,500,'bought through spend()');assert(!/gist41-shop/.test(J('PH')),'the block gone once bought');run('closePanel();');
  // the catch card never carries the block
  run("life34().catch={id:'tilapia',size:20};PH='';openLifePanel34('<div class=\"catch34\"></div>','fish');");assert(!/gist41-shop/.test(J('PH')),'never on the catch card');run("life34().catch=null;closePanel();");
  handOver(0);nextday();run('S.time=9.0;');frames(10);collectAll(0,{leave:true});
  // the bundle drawn in front while carried, hidden online
  frames(4);assert(tags41().includes('bundle'),'the bundle drawn');run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");frames(10);assert(!tags41().includes('bundle'),'hidden online');run('NET.on=false;NET.room=null;');frames(10);assert(tags41().includes('bundle'),'back offline');
  // a flat piece drawn only once taken inside, in its place
  run('save();S=load();enterWorld();closePanel();');frames(6);assert(J('!!hxB41().hand'),'still carried after a reload');assert(!J('furnGroup.children.some(c=>c.userData&&c.userData.gist41==="home")'),'not drawn before it is taken inside');
  // (fix round, S9; this assertion read "above the stove" before the ruling named places the player can see)
  const t=carryIn(0);assert(/The kitchen shelf is inside\. You will find it on the back wall, above the stove\./.test(t.join()),'the toast: '+t.join());
  // (fix round, S9) the piece just taken in framed: a second on, it is inside the half and the band below the top bar of the camera of the
  // player who took it in (and of the other player's, near the door); 2.5 s on, the cameras' points are as before
  {const pts0=J('v21InteractionPoints(0,false).length')-2;frames(30);
   const pj=J(`(()=>{const m=ADA41.world.home.find(o=>o.name==='ada41_shelf');const F=ADA41.frame;if(!m||!F)return null;const b=new THREE.Box3().setFromObject(m),c=b.getCenter(new THREE.Vector3());
     return {both:F.both,cams:[0,1].map(i=>{const vp=v21Viewport(i);cams[i].updateMatrixWorld();const v=c.clone().project(cams[i]);return [(v.x+1)/2*vp.w,(1-v.y)/2*vp.h,vp.w,vp.top,vp.h-vp.bottom];})};})()`);
   assert(pj,'(S9) the piece framed after it is taken in');for(const [k,q] of pj.cams.entries()){if(k===1&&!pj.both)continue;assert(q[0]>0&&q[0]<q[2]&&q[1]>q[3]&&q[1]<q[4],'(S9) the kitchen shelf in camera '+k+'’s half, below the top bar: '+q.map(r3).join());}
   frames(75);assert.equal(J('v21InteractionPoints(0,false).length'),pts0,'(S9) the framing ends');R.framed=pj.cams.map(q=>q.map(r3));}assert(J('furnGroup.children.some(c=>c.userData&&c.userData.gist41==="home")'),'drawn in the flat');
  assert(logHas('commission','home shelf'),'home logged');assert(J('S.memories.some(m=>m.caption==="The first piece made for us")'),'the album memory');
  const pos=J('(()=>{const m=furnGroup.children.find(c=>c.userData&&c.userData.gist41==="home");return [m.position.x,m.position.y,m.position.z];})()');assert.deepEqual(pos.map(r3),J('ADA41.HOME.shelf').map(r3),'in its place above the stove');
  // the mirror: the shells button only with three kept (the shore's morning shell otherwise unchanged), three taken once
  run('S.time=9.0;');frames(6);readSlate(0);order('flat');ph=J('PH');assert(/Three smooth shells, when you have them/.test(ph),'Ada’s ask with fewer than three kept');assert(buttons(ph).some(b=>b.act==='ada41Shells'&&b.disabled),'the shells button waits');closeP();
  // (repair 2, R2-3) the glass bought and handed over first: the slate waits for the three smooth shells, never "for its mirror glass"
  buyFinds(0);run('S.time=10;');frames(6);handOver(0);ph=readSlate(0);
  assert(ph.includes(J("esc(adaText41('ui41-open-wait',{piece:'shells mirror',thing:adaLine41('ui41-shells-owed')}))"))&&!/Waiting for its mirror glass/.test(ph),'(R2-3) the slate waits for the shells: '+strip(ph).slice(0,200));closeP();
  run('life34().shells=4;');readSlate(0);click('ada41Shells');assert.equal(J('life34().shells'),1,'three taken');click('ada41Shells');assert.equal(J('life34().shells'),1,'once');closeP();
  assert.equal(J('ada41Piece().state'),'cut','cut once the shells are given');nextday();run('S.time=9.0;');frames(10);collectAll(0,{leave:true});carryIn(0);
  // the clock (Finds), the box (Dayo's block), the door plate (Finds), the panel (Mr. Bassey's photograph)
  for(const id of ['clock','box','plate','panel']){run('S.time=9.0;');frames(6);const p=fullOrder(0);assert.equal(p.id,id,'the next piece is the '+id);nextday();run('S.time=9.0;');frames(10);collectAll(0,{leave:true});
   // (repair 2) Today with the door plate in the hands: it goes up on the door
   if(id==='plate')assert.equal(J('ada41Today().html'),J("esc(adaLine41('ui41-today-hand-plate'))"),'(repair 2) Today: the door plate goes up on your door');const tt=carryIn(0);
   // (fix round, C7 and S12) the door plate goes up on the outside of the door, with its own toast
   if(id==='plate')assert(tt.join().includes('The door plate is up, on the outside of your door')&&!/The door plate is inside/.test(tt.join()),'(C7, S12) the door plate’s own toast: '+tt.join());
   // (repair 2) "under the mirror" only when the shells mirror hangs over the fridge where it stands
   if(id==='box'){const under=J("(()=>{const it=S.home.items.find(x=>x.type==='fridge');const [cx]=cellToWorld(it.x,it.y);return Math.abs(cx-ADA41.HOME.mirror[0])<0.6;})()");
    assert.equal(/under the mirror/.test(tt.join()),under,'(repair 2) the box’s toast true where the fridge stands: '+tt.join());R.boxUnder=under;}}
  assert.deepEqual(Object.keys(J('hxB41().home')).sort(),['box','clock','mirror','panel','plate','shelf'],'all six home');assert(J('S.memories.some(m=>m.caption==="Ada’s pieces, all six, home")'),'the sixth’s album memory');
  const homes=J('furnGroup.children.filter(c=>c.userData&&c.userData.gist41==="home").length');assert.equal(homes,6,'six pieces drawn');
  // the slate's flat line after the sixth
  run('S.time=9.0;');frames(6);ph=readSlate(0);assert(/Your walls are full, and so is my notebook\./.test(ph),'the flat list ended');closeP();
  // the box hidden with the fridge in storage (S.home set as setup), back with it
  run("(()=>{const k=S.home.items.findIndex(x=>x.type==='fridge');if(k>=0){S.home.storage.push('fridge');S.home.items.splice(k,1);}rebuildFurniture();})()");assert.equal(J('furnGroup.children.filter(c=>c.userData&&c.userData.gist41==="home").length'),5,'the box hidden with the fridge stored');
  // reload with every piece home
  run('save();S=load();enterWorld();closePanel();');frames(4);assert.equal(J('furnGroup.children.filter(c=>c.userData&&c.userData.gist41==="home").length'),5,'after a reload');
  // online: none drawn; offline: back
  run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};rebuildFurniture();");frames(10);assert.equal(J('furnGroup.children.filter(c=>c.userData&&c.userData.gist41==="home").length'),0,'online: none');run('NET.on=false;NET.room=null;rebuildFurniture();');assert.equal(J('furnGroup.children.filter(c=>c.userData&&c.userData.gist41==="home").length'),5,'offline: back');
  // (fix round, DOD-10 and C10) the neighbours' models from the flat models: the frame is the mirror's frame with a sepia print and no shells;
  // the name board and the café sign the door plate with their own lettering; the bundle's size by the piece's id or its model's id
  {const m=J(`(()=>{const r={};for(const id of ['frame','nboard','nsign','mirror','plate']){const g=quiet41(()=>pieceModel41(id,'iroko'));const k=[];g.traverse(o=>{if(o.isMesh)k.push(o.geometry.type+(o.material&&o.material.map?'+map':''));});r[id]=k;adaDrop41(g);}
     r.size=[adaSize41('board','nboard'),adaSize41('sign','nsign'),adaSize41('like-plate-tunde-0','plate'),adaSize41('like-box-nkechi-0','box'),adaSize41('frame','frame'),adaSize41('like-shelf-tunde-0','shelf')];r.frameModel=GIFT41.NB.find(x=>x.id==='frame').model;return r;})()`);
   assert(m.frame.includes('PlaneGeometry+map')&&!m.frame.some(x=>/Sphere/.test(x)),'(DOD-10, C10) the frame: a print, no shells: '+m.frame.join());assert(m.mirror.some(x=>/Sphere/.test(x)),'the shells mirror keeps its shells');
   for(const k of ['nboard','nsign'])assert(m[k].includes('PlaneGeometry+map')&&m[k].length===m.plate.length,'(DOD-10, C10) the '+k+' built as the door plate with its own lettering: '+m[k].join());
   assert.deepEqual(m.size,['small','small','small','small','small','medium'],'(DOD-10) the bundle’s size by id or model');assert.equal(m.frameModel,'frame','(DOD-10) the frame’s own model');R.models=m;}
  itemsSame('check 5');R.home=Object.keys(J('hxB41().home')).length;return R;});

 // 10. save-modes-and-cost
 check(10,()=>{const R={};
  // the scene after a new household equals the run without v41 (the runner compares side.count10)
  assert(typeof side.count10==='number','the scene count ran: '+side.count10);R.count=side.count10;
  // stripState has no life.gist38
  run("dispatch('newgame');");house();dayTo(8);run('S.time=9.0;S.money=40000;');frames(10);readSlate(0);closeP();assert(J('!!hxB41()'),'discovered');
  assert(J("!(stripState().life&&stripState().life.gist38)"),'stripState has no life.gist38');
  // online: no v41 object; offline: back
  run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");frames(10);assert.equal(tags41().length,0,'online: no v41 object');run('NET.on=false;NET.room=null;');frames(10);assert(tags41().includes('slate'),'offline: the station back');
  // teardown: newconfirm ("No, keep it") changes nothing; newgame, an enterWorld into day 2 tear everything down
  run("dispatch('newconfirm');closePanel();");frames(2);assert(tags41().includes('slate'),'the question changes nothing');
  run('S.day=2;S.time=10;enterWorld();closePanel();');frames(6);assert.equal(tags41().length,0,'enterWorld into day 2: none');
  run("dispatch('newgame');");frames(2);assert.equal(tags41().length,0,'newgame: none');
  // Math.random inside v41's builds 0; no performance.now, Date.now or Math.random read by v41 directly
  run("dispatch('newgame');");house();dayTo(8);run('S.time=9.0;S.money=90000;');frames(10);run('hxQC.n=0;');fullOrder(0);nextday();run('S.time=9.0;');frames(10);collectAll(0);carryIn(0);
  assert.equal(J('hxQC.n'),0,'no Math.random call inside v41’s builds');assert.deepEqual(J('hxDirect41'),{pn:0,dn:0,mr:0},'no performance.now, Date.now or Math.random read by ada-v41.js');
  // an inert frame: day 3, 600 frames: 0 blocked(), 0 levelAt(), no v41 object built
  run('hxFresh(3,10);');run('hxCost41.b=0;hxCost41.l=0;');const b0=J('ADA41.cost.builds');frames(600);assert.deepEqual([J('hxCost41.b'),J('hxCost41.l'),J('ADA41.cost.builds')-b0],[0,0,0],'an inert frame: 0 blocked, 0 levelAt, 0 builds');
  // v35-v40 saves: keys of S and S.life unchanged after 60 frames and a save, no G.b41
  for(const [tag,setup] of [['v40',()=>{house();}],['v39',()=>{disc39();}],['v38',()=>{disc();}]]){run("dispatch('newgame');");setup();const k0=J('[Object.keys(S).join(),Object.keys(S.life).join()]');run('save();S=load();enterWorld();closePanel();');frames(60);run('save();');
   assert.deepEqual(J('[Object.keys(S).join(),Object.keys(S.life).join()]'),k0,tag+' save: keys unchanged');assert(!J('!!hxB41()'),tag+' save: no G.b41');}
  // a v41 save with every piece home, a piece in the hands and a thing in the pocket (the runner loads it in a copy of 4218ee1's dist)
  run("dispatch('newgame');");house();dayTo(8);run('S.time=9.0;S.money=200000;');frames(10);
  side.save41={};for(const id of ['shelf','mirror','clock','box','plate','panel']){run('S.time=9.0;');frames(6);fullOrder(0);nextday();run('S.time=9.0;');frames(10);collectAll(0,{leave:true});if(id==='panel'){run('save();');side.save41.hand=J('localStorage.getItem(KEY)');}carryIn(0);}
  run('S.time=9.0;');frames(6);assert.equal(Object.keys(J('hxB41().home')).length,6,'six home');run('save();');side.save41.six=J('localStorage.getItem(KEY)');
  return R;});
 //@@BCHECKS
 /* ======================================================================================================================================
    Engineer B's checks: 6, 7, 8, 11, 12 (gifts-v41.js)
    ====================================================================================================================================== */
 check(6,()=>{const R={};const esc1=id=>J(`esc(GIFT41.LINES['${id}']||ADA41.LINES['${id}']||'')`);const e1x=s=>J(`esc(${JSON.stringify(String(s))})`);
  // (a) a fresh pair on day 8 with no card thing given back: the neighbour offer skips the frame (no print back) and the table (no minutes book)
  run("dispatch('newgame');");house();dayTo(8);run('S.time=9.0;S.money=60000;');frames(10);
  assert(!J("(hxB40().backs||[]).some(r=>r.id==='print'||r.id==='minutes')"),'neither card thing back yet');
  readSlate(0);let o=offers();assert(o.nb&&o.nb.id==='board'&&o.nb.for==='tunde','the neighbour piece due: Tunde’s name board (the frame waits for the print, the table for the minutes book): '+JSON.stringify(o.nb));
  order('nb');assert(J('PH').includes(esc1('ad41-bring-letters')),'Ada asks for Tunde’s lettering');closeP();
  const td=J('gift41Today()');assert(td&&td.k==='ask'&&/Tunde/.test(td.html),'Today names the lettering and Tunde’s place: '+JSON.stringify(td));R.today=td.html;
  // never an ask during the gist (M38): the lettering still to ask for at the rail, P(1) beside Tunde while he is not a guest
  let tested=null;for(let n=0;n<6&&!tested;n++){later(18.08);pair();if(waitStart(3000)<0){nextday();continue;}const gs=J('GIST38.visit?GIST38.visit.guests.slice():[]');
   if(!gs.includes('tunde')&&J("!!found38Npc('tunde')")){const q=npcAt('tunde');run(`hxAt(1,${q[0]+0.9},${q[1]});`);frames(1);const c=cands(1);assert(!c.includes('gift41ask'),'no ask during the gist: '+c.join());tested={day:J('S.day'),state:EV()};run('hxAt(1,-4.6,6.4,[0,1]);');}
   for(let k=0;k<40&&EV()!=='idle';k++){frames(12);if(EV()==='talking')run('EVENING35.next();');}untilIdle();if(!tested)nextday();}
  assert(tested,'a gist with Tunde not a guest');R.noAskAtGist=tested;
  // after the gist, in the courtyard: asked at his live place; the thing passed to A
  const pa=actNpc(0,'tunde','gift41ask');assert(strip(pa).includes(strip(esc1('gf41-tu-letters'))),'Tunde’s line');assert(J('ada41Bring().got'),'the lettering in the pocket');assert(logHas('gift','ask letters'),'logged');
  nextday();later(9.0);handOver(0);assert.equal(J('ada41Piece().state'),'cut','cut that evening');nextday();later(9.0);
  // collected and carried; given at the garden corner in the morning: friendship, no money, the place and hour booked
  collectOpen(0);waitHold();click('ada41Pay');waitHold();if(buttons(J('PH')).some(b=>b.act==='ada41Later')){click('ada41Later');waitHold();}click('ada41Leave');frames(70);
  // (repair 2, R2-5) Tunde's name board collected at the Yard after 08:15: Mr. Bassey's "Ada showed me your piece" is never a candidate (a
  // neighbour's piece)
  assert.equal(J("gistCands41(hxB41(),{guests:['bassey','ada','tunde']}).filter(c=>c.fam==='ba-photo').length"),0,'(R2-5) no photo line for Tunde’s name board');
  later(10.2);byNpc(0,'tunde');const L=listAt(0),g=L.find(x=>x.id==='gift41give'),q=npcAt('tunde'),dd=J(`Math.hypot(players[0].g.position.x-(${q[0]}),players[0].g.position.z-(${q[1]}))`);
  assert(g,'the give prompt at Tunde: '+JSON.stringify(L.map(x=>x.id)));assert(Math.abs(dd-g.dist-1.0)<1e-5,'the give’s lead is 1.0 (every earlier give at a neighbour, 1.05 to 1.2, wins a tie): '+r3(dd-g.dist));
  const ctx=newCtx();ctx.lastPlace=placeOf('tunde');const gv=giveNb(ctx,0);assert(strip(gv.ph).includes(strip(esc1('gf41-tu-board'))),'Tunde’s thanks');
  const gg=J('gift41Given(S.day)');assert(gg.length===1&&gg[0].for==='tunde'&&gg[0].place==='yard'&&gg[0].at==='yard','booked at the garden corner: '+JSON.stringify(gg));assert(logHas('gift','give board:tunde@yard'),'the give logged');R.board=gg[0];
  // (b) Mama Nkechi's own order, due once the first flat piece is collected
  assert(!(J('gift41Today()')&&J('gift41Today()').k==='nk'),'her ask not due before a flat piece');later(10.6);run('hxAt(0,21.0,3.6,[1,0]);');frames(12);assert(!J("hxTag41().includes('bubble')"),'no bubble before a flat piece');
  nextday();later(9.0);fullOrder(0,'flat');nextday();later(9.0);collectAll(0,{leave:true});
  // (repair 2, R2-5) and a piece for the flat collected there: his line is a candidate
  assert(J("gistCands41(hxB41(),{guests:['bassey','ada','tunde']}).filter(c=>c.fam==='ba-photo').length")>=1,'(R2-5) the photo line for a piece for the flat');carryIn(0);
  const tn=J('gift41Today()');assert(tn&&tn.k==='nk','Today: Mama Nkechi wants a word: '+JSON.stringify(tn));
  later(10.6);run('hxAt(0,21.0,3.6,[1,0]);');frames(12);assert(J("hxTag41().includes('bubble')"),'her bubble within 6 m by day');const m0=J('S.money');
  const ph=actNpc(0,'nkechi','gift41hear');assert(strip(ph).includes(strip(esc1('gf41-nk-ask')))&&strip(ph).includes(strip(esc1('gf41-nk-pay'))),'her ask and her word on the money');assert(J('!!(hxB41().nk.heard)'),'heard');
  o=offers();assert(o.nb&&o.nb.msg,'the slate: her stool, settled with Ada herself');
  later(11.2);atStation(0);assert.equal(hsid(0),'ada41msg','the message at the station: '+label(0));press(0);closeP();const st=J('ada41Piece()');assert(st&&st.id==='nkstool'&&st.state==='cut'&&!st.price,'her stool cut tonight, nothing to pay: '+JSON.stringify(st));
  nextday();later(9.0);
  // (fix round, C2) her stool is never called the household's own: the prompt and the title by her name; the owner's sentence whole, then the
  // follow-on for a neighbour's piece
  atStation(0);const nkn=e1x(J("CAST['nkechi'].name"));assert(label(0).includes(J("CAST['nkechi'].name")+'’s counter stool')&&!/your/i.test(label(0)),'the collect prompt by her name: '+label(0));
  collectOpen(0);assert(J('PH').includes('<h2>'+nkn+'’s counter stool</h2>'),'the title by her name: '+strip(J('PH')).slice(0,80));
  waitHold();const bt=buttons(J('PH')).find(b=>b.act==='ada41Pay');assert(bt&&!/₦/.test(bt.text),'no money button for her stool: '+(bt&&bt.text));click('ada41Pay');waitHold();
  if(buttons(J('PH')).some(b=>b.act==='ada41Later')){click('ada41Later');waitHold();}
  {const p3=J('PH');assert(p3.includes(esc1('ad41-polish'))&&p3.includes(e1x(J("adaText41('ad41-polish-gift',{name:CAST['nkechi'].name})")))&&!/truly yours/.test(p3)&&!p3.includes('<h2>Your'),'the polish step for her stool: '+strip(p3).slice(0,200));}
  // (fix round, C4) collected at the Yard after 08:15: Mr. Bassey's photo line is never a candidate for her stool
  assert.equal(J("gistCands41(hxB41(),{guests:['bassey','ada','nkechi']}).filter(c=>c.fam==='ba-photo').length"),0,'no photo line for Mama Nkechi’s stool');
  click('ada41Leave');frames(70);
  later(10.3);ctx.lastPlace=placeOf('nkechi');const gn=giveNb(ctx,0);assert.equal(J('S.money'),m0,'Mama Nkechi’s stool costs the household nothing');assert.equal(gn.r.place,'shop','given at her shop');
  assert(strip(gn.ph).includes(strip(esc1('gf41-nk-stool'))),'her thanks');R.stool={money:'unchanged',place:gn.r.place};
  // (fix round, C8) her own stool arms no kindness back (it answers a gift)
  assert(!J('hxB41().returns.nkechi'),'no puff-puff armed by her own stool: '+JSON.stringify(J('hxB41().returns.nkechi')));
  // (c) the frame once the print is back, the table once the minutes book is back (v40's card things given back by keys)
  assert(cardsBack(['print','minutes'],24),'the print and the minutes book back');later(9.0);
  assert(!J('ada41Piece()')&&!J('(hxB41()||{}).hand'),'nothing open before the frame');
  for(const want of ['frame','table','sign']){later(9.0);
   readSlate(0);o=offers();assert(o.nb&&o.nb.id===want,'the next neighbour piece is the '+want+': '+JSON.stringify(o.nb));order('nb');closeP();const k=o.nb.for;
   if(k==='oyelaran'){later(14.0);run('hxAt(0,0.5,-3.3);');frames(2);assert(!cands(0).includes('gift41ask'),'no ask for Mrs. Oyelaran at 14:00');later(18.02);}else later(10.6);
   actNpc(0,k,'gift41ask');R['ask-'+want]={k,t:r3(J('S.time'))};
   if(J('S.time')>=17.9){nextday();later(9.0);}else later(11.0);handOver(0);nextday();later(9.0);collectAll(0,{leave:true});
   if(k==='oyelaran'){later(14.0);run('hxAt(0,0.5,-3.3);');frames(2);assert(!cands(0).includes('gift41give'),'no give to Mrs. Oyelaran at 14:00 (she is out until six)');later(18.04);}
   else if(k==='bassey')later(14.6);else later(10.3);
   ctx.lastPlace=placeOf(k);const r=giveNb(ctx,0).r;R[want]={k,place:r.place,t:r3(r.t)};
   if(k==='bassey')assert.equal(r.place,'waterfront','Mr. Bassey given his frame on the waterfront in the afternoon');if(k==='oyelaran')assert.equal(r.place,'courtyard','Mrs. Oyelaran in the courtyard at six');nextday();}
  // (d) the lists by turns, then "one like yours" every day, to over sixty pieces (forty with GIST41_SHORT): an offer every day, never the
  // same neighbour twice running, each pair once in a cycle, then the woods again; the kindness back at most once in fourteen days
  const fx=newCtx({gist:false});const goal=SHORT?40:62;let days=0,noOffer=[],woods=null;
  // (fix round, C1) "like yours" only in the slate's offer: every panel (but its offer lines, and Ada's own words choosing the copy,
  // ad41-bring-like), prompt, toast and Today read for it
  run(`var hxLike41=[],hxKeep41={o:openPanel,n:nearest,t:toast,a:esc(adaLine41('ad41-bring-like'))};openPanel=function(h){try{const x=String(h).replace(/<p class="gist41-offer-head">[\\s\\S]*?<\\/p>/g,'').split(hxKeep41.a).join('');if(/like yours/i.test(x))hxLike41.push('panel: '+x.replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').slice(0,160));}catch(e){}return hxKeep41.o.apply(this,arguments);};
   nearest=function(){const r=hxKeep41.n.apply(this,arguments);try{if(r&&/like yours/i.test(r.label||''))hxLike41.push('prompt: '+r.label);}catch(e){}return r;};toast=function(m){try{if(/like yours/i.test(String(m)))hxLike41.push('toast: '+m);}catch(e){}return hxKeep41.t.apply(this,arguments);};`);
  try{while(J('(hxB41().done.flat.length+hxB41().done.nb.length)')<goal&&days<120){const ev=eagerDay(fx);if(ev.nooffer)noOffer.push(ev.day);const n=offers();if(!woods&&n.nb&&/^(iroko|mahogany|afara|obeche) /.test(n.nb.name||''))woods={day:ev.day,name:n.nb.name};
    {const th=J('todayHTML34()');if(/like yours/i.test(th))run(`hxLike41.push(${JSON.stringify('today: '+th.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,160))})`);}nextday();days++;}}
  finally{run('openPanel=hxKeep41.o;nearest=hxKeep41.n;toast=hxKeep41.t;');}
  {const lk=J('hxLike41');assert.deepEqual(lk.slice(0,3),[],'"like yours" nowhere but the slate’s offer ('+lk.length+')');R.likeYours=0;}
  const D=J('hxB41().done.nb');assert(J('(hxB41().done.flat.length+hxB41().done.nb.length)')>=goal,'over '+goal+' pieces in '+days+' days: '+JSON.stringify({day:J('S.day'),flat:J('hxB41().done.flat'),nb:J('hxB41().done.nb.length'),piece:J('ada41Piece()'),hand:J('hxB41().hand'),coll:J('hxB41().coll'),offers:offers()}).slice(0,600));
  assert.deepEqual(noOffer,[],'an offer every day nothing is open');
  for(let j=1;j<D.length;j++)assert.notEqual(D[j].for,D[j-1].for,'never the same neighbour twice running: '+D[j-1].id+' then '+D[j].id);
  const likes=D.filter(r=>/^like-/.test(r.id)).map(r=>r.id.replace(/^like-/,'').split('-'));const byCyc={};for(const [f,k,c] of likes){const key=f+':'+k;(byCyc[c]=byCyc[c]||[]);assert(!byCyc[c].includes(key),'a pair twice in one cycle: '+key);byCyc[c].push(key);}
  assert(byCyc[0]&&byCyc[0].length>=18&&byCyc[0].length<=21,'the first cycle: the pairs once each (a cycle may close early rather than give one neighbour two running): '+(byCyc[0]&&byCyc[0].length));assert(byCyc[1]&&byCyc[1].length>0&&woods,'the woods again after the twenty-one pairs: '+JSON.stringify(woods));
  for(const [f,k] of likes)assert(!['plate:tunde','plate:nkechi','panel:bassey'].includes(f+':'+k),'no pair that reads oddly: '+f+':'+k);
  // (fix round, S10) "one like yours" the piece given least, never the same piece twice running
  {const ty=likes.map(x=>x[0]),cnt={};for(let j=1;j<ty.length;j++)assert.notEqual(ty[j],ty[j-1],'"one like yours": never the same piece twice running: '+ty.slice(Math.max(0,j-3),j+1).join());for(const t of ty)cnt[t]=(cnt[t]|0)+1;R.likeTypes=cnt;}
  for(const r of D)if(r.for==='oyelaran')assert(r.time<12||r.time>=18,'Mrs. Oyelaran never given a piece between 12:00 and 18:00: '+r.time);
  const bk=fx.backs;for(let j=1;j<bk.length;j++)assert(bk[j]-bk[j-1]>=14,'the puff-puff at most once in fourteen days: '+bk.join());assert(bk.length>=1,'the kindness came back');
  R.loop={days,pieces:J('(hxB41().done.flat.length+hxB41().done.nb.length)'),likes:likes.length,cycles:Object.keys(byCyc).length,woods,backs:bk.length};
  // (e) decision 2's bounded option (one setting): at most one gift per neighbour in any seven days
  run('GIFT41.LIKE.weekly=true;');try{const n0=D.length;for(let d=0;d<(SHORT?8:14);d++){eagerDay(fx);nextday();}const W=J('hxB41().done.nb').slice(n0);
   for(let a=0;a<W.length;a++)for(let b=a+1;b<W.length;b++)if(W[a].for===W[b].for)assert(W[b].day-W[a].day>=7,'two gifts to '+W[a].for+' within seven days with the weekly option: days '+W[a].day+', '+W[b].day);R.weekly={gifts:W.length};}
  finally{run('GIFT41.LIKE.weekly=false;');}
  return R;});
 check(7,()=>{const R={nights:0,placed:0,rules:{},saves:[]};
  run('var hxSaves=0,hxDoneSaves=-1;{const s=save;save=function(){hxSaves++;return s.apply(this,arguments);};}{const d=gistDone38;gistDone38=function(){const n0=hxSaves;try{return d.apply(this,arguments);}finally{hxDoneSaves=hxSaves-n0;}};}');
  // the plan with and without v41 (GIFT41.on is the module's own switch, as check 2 of gist-v40 turns BOARD40.on off for its comparison)
  const both=()=>J(`(()=>{const s0=JSON.stringify(S);GIFT41.on=false;const a=gistPlan38();GIFT41.on=true;const b=gistPlan38(),b2=gistPlan38();const s1=JSON.stringify(S);
   const j=x=>JSON.stringify(x===undefined?null:x);return {pure:s0===s1&&JSON.stringify(b)===JSON.stringify(b2)&&j(b.script.g40)===j(b2.script.g40),la:a.script.length,lb:b.script.length,ga:j(a.script.g40),gb:j(b.script.g40),g39a:j(a.script.g39),g39b:j(b.script.g39),
    same:JSON.stringify(a)===JSON.stringify(b),stoolA:a.script.filter(s=>s.stoolBtn).length,stoolB:b.script.filter(s=>s.stoolBtn).length,
    diff:a.script.map((s,k)=>s.id===b.script[k].id?null:k).filter(x=>x!==null),
    v41:b.script.filter(s=>s.v41k).map(s=>({id:s.id,v41k:s.v41k,info:s.info,cat:s.cat||null,today:s.today||null,v39:s.v39||null,v40k:s.v40k||null})),g41:j(b.script.g41),
    slots:b.script.map((s,k)=>s.v41k?{k,id:s.id,open:!!s.open||!!(a.script[k]&&a.script[k].open),cat:String((a.script[k]&&a.script[k].cat)||'')+'|'+String((a.script[k]&&a.script[k].swap40&&a.script[k].swap40.cat)||'')+'|'+String((s.swap40&&s.swap40.cat)||'')}:null).filter(Boolean)};})()`);
  run("dispatch('newgame');");house();
  // before v41 discovery (days 6, 7 and day 8 before the slate is read): the plan the same as without v41
  for(const d of [6,7,8]){dayTo(d);later(18.0);const x=both();assert(x.same,'day '+d+' before discovery: the plan as without v41');assert(x.pure,'pure before discovery');}
  run('S.time=9.0;');frames(6);readSlate(0);closeP();assert(J('!!hxB41()'),'discovered');
  const ctx=newCtx({gist:false,dawdle:true});const last=SHORT?14:20;
  while(J('S.day')<=last){const ev=eagerDay(ctx);later(18.05);pair();frames(2);const x=both();R.nights++;
   assert(x.pure,'day '+ev.day+': the plan is pure (called twice, the state unchanged)');assert.equal(x.lb,x.la,'day '+ev.day+': the gist no longer than v40’s plan (never an insert)');
   assert.equal(x.gb,x.ga,'day '+ev.day+': script.g40 kept (today, inserted, moved, trans)');assert.equal(x.g39b,x.g39a,'day '+ev.day+': script.g39 kept');assert.equal(x.stoolB,x.stoolA,'v39’s stool line kept');
   assert(x.v41.length<=1,'at most one v41 line: '+JSON.stringify(x.v41));assert(x.diff.length===x.v41.length,'only the v41 line differs from v40’s plan: '+JSON.stringify(x.diff));
   for(const e of x.v41){assert.equal(e.info,1,'the v41 entry carries info:1 (v40’s guard never swaps it)');assert.equal(e.v41k,e.id,'v41k is its id');assert(!e.cat&&!e.today&&!e.v39&&!e.v40k,'no cat, today, v39 or v40k: '+JSON.stringify(e));}
   // (fix round, DOD-4, S13) never in a guest's opener or goodbye (v40's entry there flagged open, or of an o: or by: category)
   for(const q of x.slots)assert(!q.open&&!/(^|\|)(o|by):/.test(q.cat),'day '+ev.day+': the v41 line in an opener or goodbye: '+JSON.stringify(q));
   if(x.v41.length){R.placed++;const g=JSON.parse(x.g41);R.rules[g.rule]=(R.rules[g.rule]|0)+1;}
   // the gist: one save, the v41 id booked before it
   const st=waitStart(3000);if(st>=0){for(let k=0;k<1500&&EV()!=='talking'&&EV()!=='idle';k+=10)frames(10);run('hxDoneSaves=-1;');let n=0;while(EV()==='talking'&&n<40){frames(12);run('EVENING35.next();');n++;}for(let q=0;q<4000&&EV()!=='idle';q+=10)frames(10);
    const sv=J('hxDoneSaves');R.saves.push(sv);assert.equal(sv,1,'day '+ev.day+': one save() per gist, in the done wrappers ('+sv+')');const shown=J("(hxG()&&hxG().last&&hxG().last.day===S.day)?hxG().last.ids:[]").filter(id=>/^gs41-/.test(id));
    for(const id of shown){assert.equal(J(`hxB41().said['${id}']`),ev.day,'the v41 line booked: '+id);assert.equal(J(`JSON.parse(localStorage.getItem(KEY)).life.gist38.b41.said['${id}']`),ev.day,'and saved by v40’s one save: '+id);}}
   nextday();}
  R.saves=[...new Set(R.saves)];return R;});
 check(8,()=>{const R={households:{},rate:{},lines:{}};const last=SHORT?16:40;
  for(const hh of [{tag:'pair',comp:false,invite:false},{tag:'pair-invites',comp:false,invite:true},{tag:'companion',comp:true,invite:false},{tag:'companion-invites',comp:true,invite:true}]){
   run("dispatch('newgame');");if(hh.comp)houseComp();else house();dayTo(8,hh.comp);
   const ctx=newCtx({gist:true,invite:hh.invite,comp:hh.comp,salt:hh.tag.length,dawdle:true});let neg=0,pieces0=0;
   while(J('S.day')<=last){eagerNight(ctx,hh.comp);if(J('S.money')<0)neg++;}
   const b=J('hxB41()');assert(b,hh.tag+': v41 discovered on the household’s first walk to the station');
   assert.equal(neg,0,hh.tag+': the purse never negative');assert.deepEqual(ctx.bad,[],hh.tag+': every v41 line true when said');
   const pieces=b.done.flat.length+b.done.nb.length;assert(pieces>=Math.floor((last-8)*0.7),hh.tag+': a piece about every day ('+pieces+' in '+(last-7)+' days, the household dawdling one day in five)');assert(b.done.flat.length>=Math.min(6,Math.floor((last-8)/3)),hh.tag+': the flat list advancing ('+b.done.flat.length+' flat, '+b.done.nb.length+' for neighbours)');assert(b.done.nb.length>=Math.floor((last-9)/3),hh.tag+': the neighbour list advancing ('+b.done.flat.length+' flat, '+b.done.nb.length+' for neighbours)');
   for(const id in b.said)assert((J('S.day')-1)-b.said[id]<28,hh.tag+': the said record pruned at 28 days at the last gist ('+id+')');
   R.households[hh.tag]={nights:ctx.nights,withLine:ctx.placedNights,pieces,flat:b.done.flat.length,nb:b.done.nb.length,rate:ctx.rate,veranda:hh.invite?ctx.ev&&ctx.ev.coll&&ctx.ev.coll.at:undefined};
   for(const n in ctx.rate){const r=R.rate[n]||(R.rate[n]={eligible:0,placed:0});r.eligible+=ctx.rate[n].eligible;r.placed+=ctx.rate[n].placed;}for(const id in ctx.lines)R.lines[id]=(R.lines[id]|0)+ctx.lines[id];}
  for(const n in R.rate){const r=R.rate[n];r.share=r.eligible?Math.round(100*r.placed/r.eligible)+'%':'-';}
  //@@SETP
  // (b) the set pieces (M44-M48): each of §9.1's place-and-hour conditions met on purpose, on a night its speaker is a guest with a free place
  // in v40's plan (the guests and the script read from v38's pure gistPlan38 in the morning, as the evening's own run shows them); a fresh
  // household for each, nights 8-40 at most (the long sweep above stops at 16 with GIST41_SHORT; these stop as soon as each is tried)
  const scriptNow=()=>J("(()=>{const p=gistPlan38(),m=p.script.g40&&p.script.g40.moved||null;return {guests:p.guests.slice(),moved:m,script:p.script.map(s=>({k:s.k,id:s.id,re:!!(s.cat&&String(s.cat).startsWith('re:')),f1:!!(s.info||s.tip||s.v40k||s.once||s.v39k||s.trans||s.g40||s.v41k),f2:!!(s.info||s.tip||s.trans||s.once||s.v39k||s.v41k),swap:!!s.swap40,t:s.g40t||null,ob:!!s.open||/^(o|by):/.test(String(s.cat||''))||!!(s.swap40&&/^(o|by):/.test(String(s.swap40.cat||'')))}))};})()");
  // (fix round, DOD-4: adjusted for the ruling) a free place is never a guest's opener or goodbye
  const freeFor=(P,k)=>P.guests.includes(k)&&P.script.some((s,q)=>s.k===k&&s.id!==P.moved&&!s.ob&&((q>=2&&s.re&&!s.f1)||(s.swap&&!s.f2&&['v38','season','evergreen'].includes(s.t))));
  const waitSt=()=>{for(let k=0;k<900&&!J('ada41Station()');k+=10)frames(10);return !!J('ada41Station()');};
  const morning=ctx=>{run('S.money=Math.max(S.money|0,60000);life34().shells=Math.max(life34().shells|0,6);');if(ctx.invite)invite();later(8.3);waitSt();};
  const evOf=(ctx,o)=>Object.assign({day:J('S.day'),give:null,inFlat:null,coll:null,readyAm:ctx.cutDay===J('S.day')-1,visit:!!ctx.invite,flatOpen:false},o||{});
  const night=(ctx,ev)=>{ev.flatOpen=!!(J('ada41Piece()')&&J('ada41Piece()').list==='flat');const g=gistFast(ctx);judge(ctx,ev,g);nextday();return g?g.shown.filter(id=>/^gs41-/.test(id)):null;};
  const collectHold=(ctx)=>{const p=J('ada41Piece()');collectOpen(0);waitHold();const t=J('S.time'),at=J('ada41Station().at');click('ada41Pay');waitHold();
   if(buttons(J('PH')).some(x=>x.act==='ada41Later')){click('ada41Later');waitHold();}click('ada41Leave');frames(70);return {id:p.id,at,t};};
  const nbStart=(ctx)=>{morning(ctx);readSlate(0);const o=offers();assert(o.nb&&o.nb.id==='board','the set piece starts with Tunde’s name board: '+JSON.stringify(o.nb));order('nb');closeP();
   later(10.6);actNpc(0,'tunde','gift41ask');later(11.5);waitSt();handOver(0);ctx.cutDay=J('S.day');night(ctx,evOf(ctx));};
  const SP={};const tries=(name,fn)=>{let r=null;for(let a=0;a<3&&!r;a++){run("dispatch('newgame');");house();dayTo(8);r=fn(newCtx({gist:true,salt:a}));}assert(r,'set piece '+name+' tried on a night its speaker had a free place');SP[name]=r;return r;};
  const upto=SHORT?30:40;
  // M44: a piece collected at the veranda station on a visit day, Mr. Bassey a guest with a free place, nothing else for the evening: no photo line
  // ((repair 2, R2-5: adjusted for the ruling) a piece for the flat, the kitchen shelf: his line is now only ever for the household's own pieces,
  // so a neighbour's piece would say nothing either way)
  const flatStart=(ctx)=>{morning(ctx);readSlate(0);const o=offers();assert(o.flat==='shelf','the set piece starts with the kitchen shelf: '+JSON.stringify(o));order('flat');closeP();
   buyFinds(0);later(11.5);waitSt();handOver(0);ctx.cutDay=J('S.day');night(ctx,evOf(ctx));};
  tries('ba-photo-veranda',ctx=>{ctx.invite=true;flatStart(ctx);
   while(J('S.day')<=upto){morning(ctx);const P=scriptNow(),p=J('ada41Piece()');
    if(process.env.SP41DBG)console.error('sp44',J('S.day'),JSON.stringify(P.guests),freeFor(P,'bassey'),p&&p.state,JSON.stringify(P.script.filter(x=>x.k==='bassey')));
    if(p&&p.state==='ready'&&freeFor(P,'bassey')){const c=collectHold(ctx);assert.equal(c.at,'veranda','collected on the veranda');const sh=night(ctx,evOf(ctx,{coll:c}));
     assert(sh&&!sh.includes('gs41-ba-photo')&&!sh.includes('gs41-ba-photo2'),'no photo line after a veranda collection: '+JSON.stringify(sh));return {day:c.t&&J('S.day')-1,guests:P.guests,shown:sh};}
    night(ctx,evOf(ctx));}return null;});
  // M46 and M47: Tunde's name board given after noon in the courtyard (his line says it goes up in the morning), and in the morning at the garden
  // corner with Ada a guest and Tunde not (Ada was at her bench beside it: no hearsay)
  tries('tu-board-pm',ctx=>{nbStart(ctx);morning(ctx);collectHold(ctx);night(ctx,evOf(ctx));
   while(J('S.day')<=upto){morning(ctx);const P=scriptNow();
    if(freeFor(P,'tunde')){later(14.6);ctx.lastPlace=placeOf('tunde');const r=giveNb(ctx,0).r;assert.equal(r.place,'courtyard','given in the courtyard after noon');const sh=night(ctx,evOf(ctx,{give:r}));
     assert(sh&&sh.includes('gs41-tu-board-am'),'Tunde’s board goes up in the morning: '+JSON.stringify(sh));return {day:r.day,t:r3(r.t),guests:P.guests,shown:sh};}
    night(ctx,evOf(ctx));}return null;});
  tries('ad-gift-yard',ctx=>{nbStart(ctx);morning(ctx);collectHold(ctx);night(ctx,evOf(ctx));
   while(J('S.day')<=upto){morning(ctx);const P=scriptNow();
    if(freeFor(P,'ada')&&!P.guests.includes('tunde')){later(10.3);ctx.lastPlace=placeOf('tunde');const r=giveNb(ctx,0).r;assert.equal(r.place,'yard','given at the garden corner');const sh=night(ctx,evOf(ctx,{give:r}));
     assert(sh&&!sh.includes('gs41-ad-gift')&&!sh.includes('gs41-ad-gift2'),'no hearsay for a gift beside Ada’s bench: '+JSON.stringify(sh));return {day:r.day,guests:P.guests,shown:sh};}
    night(ctx,evOf(ctx));}return null;});
  // M48 then M45: Mama Nkechi's stool cut tonight with Ada a guest (her own line, never "your piece"); then a piece ordered and waiting for its thing
  // with Ada a guest (nothing about the morning)
  tries('ad-nk-and-wait',ctx=>{morning(ctx);readSlate(0);let o=offers();order('flat');if(buttons(J('PH')).some(x=>x.act==='ada41Shells'&&!x.disabled)){waitHold();click('ada41Shells');}closeP();
   const p0=J('ada41Piece()');if(p0.bring.from==='finds')buyFinds(0);else if(p0.bring.from==='dayo')buyDayo(0);later(11.5);waitSt();if(J('ada41Piece()').state==='wait')handOver(0);ctx.cutDay=J('S.day');night(ctx,evOf(ctx));
   morning(ctx);collectHold(ctx);const h=J('(hxB41()||{}).hand');carryIn(0);later(11.0);run('hxAt(0,21.0,3.6,[1,0]);');frames(12);actNpc(0,'nkechi','gift41hear');night(ctx,evOf(ctx,{inFlat:h&&h.id}));
   let nk=null,wait=null;
   while(J('S.day')<=upto&&!(nk&&wait)){morning(ctx);const P=scriptNow(),pc=J('ada41Piece()');
    if(!nk&&!pc&&freeFor(P,'ada')){atStation(0);assert.equal(hsid(0),'ada41msg','her message at the station');press(0);closeP();ctx.cutDay=J('S.day');const sh=night(ctx,evOf(ctx));
     assert(sh&&sh.includes('gs41-ad-nk'),'Ada’s own line for Mama Nkechi’s stool: '+JSON.stringify(sh));nk={day:J('S.day')-1,guests:P.guests,shown:sh};continue;}
    if(nk&&pc&&pc.state==='ready'&&!J('(hxB41()||{}).hand')){collectHold(ctx);night(ctx,evOf(ctx));continue;}
    if(nk&&!pc&&freeFor(P,'ada')){readSlate(0);o=offers();assert(o.flat,'a flat piece to order');order('flat');if(buttons(J('PH')).some(x=>x.act==='ada41Shells'&&!x.disabled)){waitHold();click('ada41Shells');}closeP();
     assert.equal(J('ada41Piece().state'),'wait','the piece waits for its thing');const sh=night(ctx,evOf(ctx));
     assert(sh&&!sh.includes('gs41-ad-open')&&!sh.includes('gs41-ad-ninth'),'nothing about the morning while the piece waits for its thing: '+JSON.stringify(sh));wait={day:J('S.day')-1,guests:P.guests,shown:sh};continue;}
    night(ctx,evOf(ctx));}
   return nk&&wait?{nk,wait}:null;});
  R.setPieces=SP;
  //@@SETP-END
  const ids=Object.keys(R.lines).sort();R.lines=ids.reduce((o,k)=>(o[k]=R.lines[k],o),{});return R;});
 /* ---------- check 9: Today's v41 block, the touch guard for v41's panels and the log (the integrator; spec §10.5, §14) ---------- */
 check(9,()=>{
  const R={states:{}};assert(J("typeof DAILY41!=='undefined'&&!!DAILY41.on"),'daily-v41.js installed (v41 is)');
  // Today's HTML read as a player sees it: v41's block, v40's block, the gist card, the chips
  const blk=()=>{const th=J('todayHTML34()');const m=th.match(/<div class="life-note34 gist41-today" data-today41="1">([\s\S]*?)<\/div>/);const g=(th.match(/<div class="life-note34 gist38-card">[\s\S]*?<\/div>/)||[''])[0];
   const v=th.match(/<div class="life-note34 gist40-today"[^>]*>([\s\S]*?)<\/div>/);
   return {th,inner:m?m[1]:null,at:m?th.indexOf(m[0]):-1,whole:m?m[0]:'',keys:m?[...m[1].matchAll(/<p class="small gist41-today-(\w+)">/g)].map(x=>x[1]):[],ps:m?(m[1].match(/<p /g)||[]).length:0,
    g,v40:v?v[1]:null,v40end:v?th.indexOf(v[0])+v[0].length:-1,gat:th.indexOf('<div class="life-note34 gist38-card">'),chips:th.indexOf('<div class="life-chips34">')};};
  const e1=s=>J(`esc(${JSON.stringify(s)})`);
  const lineOf=(b,k)=>{const m=(b.inner||'').match(new RegExp('<p class="small gist41-today-'+k+'">([\\s\\S]*?)</p>'));return m?m[1]:null;};
  // the block where it belongs, and only there: after v40's block when there is one, else before the gist card (or the chips); never inside the
  // gist card; Today without v41's block is Today as daily-v40.js and the earlier modules make it (the gist card's rows and v40's block unchanged)
  const placed=(what,b)=>{assert(b.inner!==null,what+': the v41 block in Today');
   if(b.v40!==null)assert.equal(b.at,b.v40end,what+': straight after v40’s block');else assert(b.at>=0&&(b.gat<0||b.at<=b.gat)&&b.at<=b.chips,what+': before the gist card and the chips');
   assert(!b.g.includes('gist41-today'),what+': not in the gist card');
   const wo=J('(()=>{DAILY41.on=false;try{return todayHTML34();}finally{DAILY41.on=true;}})()');assert.equal(b.th.replace(b.whole,''),wo,what+': Today otherwise as without v41’s block');
   assert(b.ps<=J('DAILY41.MAX'),what+': at most two lines');if(J('innerWidth')<=480)assert(b.ps<=1,what+': one line at 480 px or less');};
  // A's and B's own first lines are the block's words for the household's own pieces and for the neighbours' (ada41Today, gift41Today)
  const same=(what,b)=>{const at=J('ada41Today()'),gt=J('gift41Today()');
   if(at&&b.keys.includes(at.k)){const slot=at.k==='coll'?'coll':at.k==='hand'?'hand':'piece',nb=J(`(()=>{const x=hxB41().${slot};return !!(x&&x.list==='nb');})()`);
    if(nb)assert(!/\byour\b/i.test(lineOf(b,at.k))&&lineOf(b,at.k).includes(e1(J(`CAST[hxB41().${slot}.for].name`))),what+': a neighbour’s piece by the neighbour’s name, never "your": '+lineOf(b,at.k));
    else assert.equal(lineOf(b,at.k),at.html,what+': ada41Today’s words');}
   if(gt&&b.keys.includes(gt.k))assert.equal(lineOf(b,gt.k),gt.html,what+': gift41Today’s words');};
  const expect=(what,keys)=>{const b=blk();placed(what,b);same(what,b);assert.deepEqual(b.keys,keys,what+': the lines '+JSON.stringify(b.keys)+' against '+JSON.stringify(keys)+' '+b.inner);R.states[what]=b.keys.map(k=>k+': '+lineOf(b,k).replace(/<[^>]+>/g,''));return b;};
  const none=what=>{const b=blk();assert.equal(b.inner,null,what+': no v41 block '+b.inner);R.states[what]='none';};
  const narrow=(what,keys)=>{run('hxScreen(390,844,true);');try{expect(what+' (390 px)',keys);}finally{run('hxScreen(1280,800,false);');}};
  const where=k=>J(`boardWhere40('${k}')`);
  /* (a) a pair household, v40 read on day 5: no block before v40 is discovered, nor in layer 2 before the slate is read */
  run("dispatch('newgame');");disc();run('S.time=10.2;');frames(4);none('v38 found, v40 not yet');
  run("dispatch('newgame');");house();dayTo(8);run('S.time=9.0;S.money=60000;life34().shells=6;');frames(10);
  // (fix round: Ada's walk to her bench varies with the world's earlier checks; the station shows once she is there)
  for(let k=0;k<90&&!J('!!ada41Station()');k++)frames(10);assert(J('!!ada41Station()'),'layer 2 open');none('layer 2, the slate not read');
  /* (b) the six states, by real keys and panel buttons */
  // 6. nothing open: the slate's two offers (and nothing else to say)
  readSlate(0);closeP();const n0=J("(()=>{const n=ada41Next();return {flat:n.flat.name,nb:n.nb.name,for:n.nb.for};})()");
  let b=expect('6 nothing open',['slate']);const sl=lineOf(b,'slate');
  assert(sl.includes(e1(n0.flat))&&sl.includes(e1(n0.nb))&&sl.includes(e1(J(`CAST['${n0.for}'].name`))),'the slate line names both offers and the neighbour: '+sl);assert(!/₦|\d/.test(sl),'no price in the slate line');
  // 3. a thing to bring from Palm Court Finds (the kitchen shelf's cup hooks)
  readSlate(0);order('flat');closeP();const p1=J('ada41Piece()');b=expect('3 a thing to buy',['bring']);
  assert(lineOf(b,'bring').includes(e1(p1.bring.thing))&&lineOf(b,'bring').includes(e1('Palm Court Finds')),'the thing and the shop: '+lineOf(b,'bring'));
  // bought: the thing is in the pocket, to hand over at the slate ((fix round, DOD-6: adjusted for the ruling) Today says so)
  buyFinds(0);b=expect('the thing in the pocket',['pocket']);assert(lineOf(b,'pocket').includes(e1(p1.bring.thing)),'the thing in the pocket named: '+lineOf(b,'pocket'));
  // 5. handed over: being made tonight
  later(10.2);handOver(0);b=expect('5 being made',['cut']);assert(lineOf(b,'cut').includes(e1(p1.name||'kitchen shelf')),'the piece named');
  // 1. the next morning: ready, with the balance due on collection (UI)
  nextday();later(9.0);b=expect('1 ready',['ready']);assert(lineOf(b,'ready').includes(e1(J('naira(4500)'))),'the balance: '+lineOf(b,'ready'));
  // collected and paid, the neighbour piece ordered in the same panel (Tunde's name board: his lettering), left to Ada: a flat piece in the hands
  // and a neighbour's thing to ask for: two lines, one at 390 px
  collectOpen(0);waitHold();click('ada41Pay');waitHold();assert(buttons(J('PH')).some(x=>x.act==='ada41Order'&&x.data.v==='nb'&&!x.disabled),'the neighbour offer in the collection panel');
  click('ada41Order',x=>x.data.v==='nb');waitHold();click('ada41Leave');frames(70);const p2=J('ada41Piece()');assert.equal(p2.for,'tunde','Tunde’s name board ordered');
  b=expect('2 a flat piece in the hands, 3 a neighbour’s thing',['hand','ask']);narrow('2+3',['hand']);
  assert(lineOf(b,'ask').includes(e1('Tunde'))&&lineOf(b,'ask').includes(e1(where('tunde'))),'his thing at his live place by the hour: '+lineOf(b,'ask'));
  // home: the ask and Mama Nkechi's word (due once the first flat piece is collected)
  carryIn(0);b=expect('3 asked, 4 Mama Nkechi',['ask','nk']);const am=lineOf(b,'ask');
  later(14.0);b=expect('3 in the afternoon',['ask','nk']);const pm=lineOf(b,'ask');assert(pm.includes(e1(where('tunde')))&&pm!==am,'Tunde’s place by the hour: '+am+' / '+pm);
  // her word heard: the message to give at the slate
  nextday();later(10.6);run('hxAt(0,21.0,3.6,[1,0]);');frames(12);actNpc(0,'nkechi','gift41hear');b=expect('4 her message',['ask','msg']);
  // Tunde asked: the lettering in the pocket; then handed over: being made, her message still to give
  actNpc(0,'tunde','gift41ask');expect('the lettering in the pocket',['pocket','msg']);later(11.2);handOver(0);expect('5 with her message',['msg','cut']);
  atStation(0);assert.equal(hsid(0),'ada41msg','the message prompt');press(0);closeP();expect('her message given (her stool next)',['cut']);
  // the board ready; collected and left to Ada: Tunde's board in the hands (where he is by the hour) and her stool cut today
  nextday();later(9.0);expect('1 the board ready',['ready']);collectOpen(0);waitHold();click('ada41Pay');waitHold();if(buttons(J('PH')).some(x=>x.act==='ada41Later')){click('ada41Later');waitHold();}click('ada41Leave');frames(70);
  b=expect('2 a neighbour’s piece in the hands, 5 her stool',['nbhand','cut']);assert(lineOf(b,'nbhand').includes(e1(where('tunde'))),'where Tunde is now: '+lineOf(b,'nbhand'));
  later(10.3);giveNb(newCtx(),0);expect('given',['cut']);
  // the stool paid for (nothing to pay) and its polish begun, then left: waiting on the trestle for its last polish
  nextday();later(9.0);collectOpen(0);waitHold();click('ada41Pay');waitHold();if(buttons(J('PH')).some(x=>x.act==='ada41Later')){click('ada41Later');waitHold();}click('ada41Polish');frames(2);
  run('hxAt(0,-2.5,-10.5);');frames(4);b=expect('1 on the trestle for its last polish',['coll']);
  atPoint(0,ST[0],ST[1],0.15);beat({who:[0]});frames(70);assert(J('!!hxB41().hand'),'polished');
  later(10.3);giveNb(newCtx(),0);
  /* (c) Mrs. Oyelaran after noon: her piece in the hands, and her own thing to ask for (the writing table's measure), each "easiest to find in the
     morning" after noon (finding 12); in the morning, where she is. A household's days by turns (a neighbour piece for her chosen when offered) */
  const oy=J('GIFT41.LINES["ui41-today-oy"]');let askPm=null,handPm=null,lastList='nb';
  const giveHand=()=>{const h=J('hxB41().hand');if(!h)return;if(h.list==='flat'){carryIn(0);return;}
   if(h.for==='oyelaran'){later(9.2);b=blk();assert(lineOf(b,'nbhand')&&lineOf(b,'nbhand').includes(e1(where('oyelaran'))),'her piece in the hands in the morning: '+b.inner);
    later(14.0);b=blk();assert(lineOf(b,'nbhand')&&lineOf(b,'nbhand').includes(e1(oy)),'her piece in the hands after noon: '+b.inner);handPm=handPm||lineOf(b,'nbhand');later(18.04);}
   else later(10.3);giveNb(newCtx(),0);};
  const bringIt=()=>{let p=J('ada41Piece()');if(!p||p.state!=='wait')return;const br=p.bring;
   if(br.shells&&!br.shellsGiven){readSlate(0);if(buttons(J('PH')).some(x=>x.act==='ada41Shells'&&!x.disabled))click('ada41Shells');closeP();}
   if(!br.got){if(br.from==='finds')buyFinds(0);else if(br.from==='dayo')buyDayo(0);
    else if(br.from!=='store'){const k=br.from;if(k==='oyelaran'){later(9.2);b=blk();assert(lineOf(b,'ask')&&lineOf(b,'ask').includes(e1('Mrs. Oyelaran'))&&lineOf(b,'ask').includes(e1(where('oyelaran'))),'her thing asked in the morning: '+b.inner);
      later(14.0);b=blk();assert(lineOf(b,'ask')&&lineOf(b,'ask').includes(e1(oy)),'her thing after noon: easiest in the morning: '+b.inner);askPm=askPm||lineOf(b,'ask');later(18.02);}
     else if(k==='bassey'&&J('S.time')>=12)later(14.6);actNpc(0,k,'gift41ask');}}
   if(J('S.time')>=17.8){nextday();later(9.0);}else later(Math.max(J('S.time'),11.0));handOver(0);};
  const dayStep=()=>{later(9.0);bringIt();let p=J('ada41Piece()');
   if(p&&p.state==='ready'&&!J('hxB41().hand')&&!J('hxB41().coll')){collectOpen(0);waitHold();click('ada41Pay');waitHold();if(buttons(J('PH')).some(x=>x.act==='ada41Later')){click('ada41Later');waitHold();}click('ada41Leave');frames(70);}
   giveHand();
   const t=J('gift41Today()');if(t&&t.k==='nk'&&J('S.time')<17){later(10.6);run('hxAt(0,21.0,3.6,[1,0]);');frames(12);actNpc(0,'nkechi','gift41hear');}
   if(J("!!(hxB41().nk&&hxB41().nk.heard&&!hxB41().nk.told)")&&J('S.time')<17.8){atStation(0);if(hsid(0)==='ada41msg'){press(0);closeP();}}
   if(!J('ada41Piece()')&&!J('hxB41().coll')&&!J('hxB41().hand')&&J('S.time')<17.8){readSlate(0);const o=offers(),nb=o.nb&&!o.nb.msg?o.nb:null;let list=null;
    if(nb&&nb.for==='oyelaran')list='nb';else if(lastList==='flat'&&nb)list='nb';else if(o.flat)list='flat';else if(nb)list='nb';
    if(list){order(list);lastList=list;}closeP();bringIt();}
   nextday();};
  for(let d=0;d<40&&!(askPm&&handPm);d++){run('S.money=Math.max(S.money|0,40000);life34().shells=Math.max(life34().shells|0,6);');dayStep();
   if(d===12&&!askPm&&!J("(hxB40().backs||[]).some(r=>r.id==='minutes')"))assert(cardsBack(['minutes'],24),'the minutes book back');}
  assert(askPm&&handPm,'both after-noon lines seen: '+JSON.stringify({askPm,handPm}));R.states['3 Mrs. Oyelaran after noon']=askPm;R.states['2 Mrs. Oyelaran after noon']=handPm;
  /* (e) a busy day at 390 px (spec §16.2 check 9): a Saturday Aunty Bisi passes (a wash day when one comes), a v38 thing lying out and then in the
     pocket, the wash told last night and the pot asked (v38's and v39's records, set through save() and load()), v40's three lines (the board read,
     Mallam's order, a child's thing after the morning match), a piece ready at Ada's bench and a piece in the hands: v40's block with its three
     lines, Aunty Bisi's sentence and v41's first line all there; the gist card and v40's block exactly as without v41's block */
  run("var hxFix41=fn=>{save();const o=JSON.parse(localStorage.getItem(KEY));fn(o,o.life.gist38);localStorage.setItem(KEY,JSON.stringify(o));S=load();enterWorld();closePanel();hxFrames(2);};");
  const bdOf=()=>J(`(()=>{for(const w of [true,false])for(let d=S.day+2;d<=S.day+60;d++)if(fbWeekday37(d)===0&&bisiDay39(d)&&(!w||found38WashDay(d)))return d;return -1;})()`);let bd=bdOf();assert(bd>0,'a Saturday Aunty Bisi passes');
  // (fix round, S10: adjusted, as "one like yours" now orders other pieces) the household's days run on until the morning before such a Saturday
  // finds a piece ready at Ada's bench (a day whose evening went to Mrs. Oyelaran at six orders nothing for the next morning)
  for(let tries=0;;tries++){while(J('S.day')<bd-1){run('S.money=Math.max(S.money|0,40000);life34().shells=Math.max(life34().shells|0,6);');dayStep();}
  // the day before: the ready piece collected and kept in the hands, the next ordered, its thing brought and handed over (ready tomorrow)
   run('S.money=Math.max(S.money|0,60000);life34().shells=Math.max(life34().shells|0,6);');later(9.0);bringIt();const p0=J('ada41Piece()');if((p0&&p0.state==='ready')||tries>=4)break;
   dayStep();bd=bdOf();assert(bd>0,'a Saturday Aunty Bisi passes');}
  {let p=J('ada41Piece()');if(p&&p.state==='ready'){collectOpen(0);waitHold();click('ada41Pay');waitHold();if(buttons(J('PH')).some(x=>x.act==='ada41Later')){click('ada41Later');waitHold();}click('ada41Leave');frames(70);}}
  assert(J('!!hxB41().hand'),'a piece in the hands');if(!J('ada41Piece()')){readSlate(0);const o=offers();order(o.flat?'flat':'nb');closeP();}bringIt();assert.equal(J('ada41Piece().state'),'cut','the next piece cut tonight');
  run('S.time=21.5;');frames(2);nextday();assert.equal(J('S.day'),bd,'the busy day');const wash=J(`found38WashDay(${bd})`);
  run(`hxFix41((o,G)=>{G.last={day:${bd-1},guests:['ada','tunde'],tips:${wash?"[{kind:'wash',arg:'wash',teller:'ada',owner:null,mode:null}]":'[]'},ids:[]};G.lost.heard=${bd-1};G.lost.heardMode='remind';G.b39.pot={day:${bd},who:'nkechi',n:2,got:0,gave:0,via:'gist',said:${bd-1}};G.b39.potLast.nkechi=${bd};});`);
  // v40's three: the board read at 10:35, Mallam's order, the morning match and a child's thing from 14:00
  read();run('S.time=Math.max(S.time,10.7);hxAt(0,-3,10.6,[0,1]);hxAt(1,-8,-10);');frames(10);assert.equal(hsid(0),'mallam40order','Mallam’s order prompt');run('PH="";');press(0);click('mallam40Order',x=>x.data.v==='onion');frames(4);
  run("if(!globalThis.hxEnd41On&&typeof football37On==='function'){globalThis.hxEnd41On=1;football37On('end',()=>{globalThis.hxEnd41={day:S.day,t:S.time};});}");run('S.time=10.9;hxAt(0,-23,12.9,[0,-1]);hxAt(1,-22,12.9,[0,-1]);');
  for(let k=0;k<20&&!J('!!FOOTBALL37.kids');k++)frames(3);assert(J('!!FOOTBALL37.kids'),'the children are out for the morning match');
  run(`FOOTBALL37.stats={kicks:{},passes:{},calls:0,outs:0,goals:[{who:'p0',own:false},{who:'kemi',own:false},{who:'p1',own:false}],streetCall:false,motor:false,challenges:0};FOOTBALL37.score=[2,1];fbEnsureSave37();fbEnd37('won');`);
  {let n=0;while(J('FOOTBALL37.state')!=='idle'&&n<3000){frames(10);n+=10;}}run('hxAt(0,-5,-2);hxAt(1,-5.6,-2);');{let n=0;while(J('!!FOOTBALL37.kids')&&n<900){frames(10);n+=10;}}
  run('S.time=12.4;hxAt(0,-5.2,4.0);hxAt(1,-8,-10);');frames(6);assert.equal(J('found38Today().lost&&found38Today().lost.status'),'out','a v38 thing lying out');
  run('S.time=13.9;hxAt(0,-23,13.9,[0,-1]);hxAt(1,-8,-10);');frames(20);run('S.time=14.0;');frames(12);assert(J('!!(kid40Today()&&kid40Today().html)'),'the children’s line from 14:00');
  run('hxAt(0,-5.2,4.0);');frames(2);
  const busy=tag=>{run('hxScreen(390,844,true);');try{const b=blk(),rows=J('gistTodayRows38(hxG()).map(r=>[r.k,r.html])'),br=J('bisiRow39()');placed(tag,b);
    assert.equal(b.ps,1,tag+': one v41 line');assert.equal(b.keys[0],'ready',tag+': v41’s first line, the piece ready: '+b.keys);
    assert(J('!!hxB41().hand'),tag+': a piece in the hands too');assert.equal((b.v40.match(/<p /g)||[]).length,3,tag+': v40’s block with its three lines: '+b.v40);
    assert(rows.some(r=>r[1].includes(br.eve)||r[1].includes(br.html)),tag+': Aunty Bisi’s sentence: '+JSON.stringify(rows));
    return {rows:rows.map(r=>r[0]),v40:3,v41:b.keys};}finally{run('hxScreen(1280,800,false);');}};
  R.busy390={day:bd,wash,lost:busy('busy day, a thing lying out')};
  // the thing picked up: in the pocket
  {const it=J("(()=>{const W=FOUND38.world;return W&&W.item?[W.item.position.x,W.item.position.z]:null;})()");if(it){run('S.time=14.1;');pickNow(0);R.busy390.pocket=busy('busy day, a thing in the pocket');}}
  /* (f) the touch guard for v41's panels: every one carries gist40-panel (daily-v40.js's guard and hold); the slate re-rendered by "Order this"
     re-arms the hold (touch or keyboard), so a second tap lands on nothing; "Buy it" in a shop block holds the shop panel's clicks for a second
     (a double tap never buys a Finds card), its buttons dimmed while it runs */
  run(`var hxTapP41=(cls)=>{const h=String(panel.innerHTML);const el=cls==='*'?h.match(/<button\\b[^>]*data-act="[^"]+"[^>]*>/):h.match(new RegExp('<button\\\\b[^>]*class="[^"]*'+cls+'[^"]*"[^>]*>'));if(!el)return null;const inP=h.includes('gist40-panel');
    const e={target:{closest:s=>s==='#panel'?{}:s==='.gist40-panel'&&inP?{}:null}};if(dailyClick40(e)||dailyClick41(e))return 'held';const act0=(el[0].match(/data-act="([^"]+)"/)||[])[1];const data={};for(const x of el[0].matchAll(/data-(?!act)([\\w-]+)="([^"]*)"/g))data[x[1]]=x[2];dispatch(act0,data);return act0;};`);
  {const G={};run("dispatch('newgame');");house();dayTo(8);run('S.time=9.0;S.money=60000;life34().shells=6;');frames(10);
   readSlate(0);assert(J('PH').includes('gist40-panel'),'the slate panel carries gist40-panel');frames(40);assert(J('!(DAILY40.hold>FOUND38.t)'),'a keyboard read arms no hold');
   const o1=J("hxTapP41('gist41-orderbtn')"),o2=J("hxTapP41('gist41-back')");assert.equal(o1,'ada41Order','the first click orders');assert.equal(o2,'held','the second click lands on nothing: '+o2);
   assert(J('overlayOpen()'),'the slate still open');frames(2);assert(J('DAILY40.dim===true'),'its buttons dimmed while the hold runs (daily-v40’s gist40-held)');frames(36);assert.equal(J("hxTapP41('gist41-back')"),'ada41Close','Back once the hold has run');G.order='held';
   // the shop block on the Finds page at the stall: "Buy it", then a second tap where a card's buy button now is
   run('hxAt(0,20.8,6.0,[0,1]);');frames(2);run("PH='';openLife34('market');");assert(/gist41-shop/.test(J('PH')),'the Finds block');const m0=J('S.money'),st0=J('S.home.storage.length');
   const b1=J("hxTapP41('gist41-buybtn')");
   assert.equal(b1,'ada41Buy','the block’s Buy it');assert(J('ada41Bring().got'),'the thing bought');assert.equal(J('S.money'),m0-J('ada41Bring().cost'),'paid once, through spend()');
   assert(J('overlayOpen()')&&!/gist41-shop/.test(J('String(panel.innerHTML)')),'the Finds page again, the block gone');
   const b2=J("hxTapP41('*')");assert.equal(b2,'held','a second tap at once lands on nothing: '+b2);frames(2);assert(J('DAILY41.dim===true'),'the Finds page dimmed while the hold runs (gist41-held)');
   assert.equal(J('S.money'),m0-J('ada41Bring().cost'),'no card bought');assert.equal(J('S.home.storage.length'),st0,'nothing into storage');
   frames(36);assert(J('DAILY41.dim===false'),'undimmed once it has run');assert.equal(J("(()=>{const e={target:{closest:s=>s==='#panel'?{}:null}};return dailyClick41(e);})()"),false,'a tap once the hold has run is a tap');
   run('closePanel();');frames(2);G.shop='held';R.touch=G;
   // (fix round, S1) at 390 x 844 a touch Act at the rocks in the morning: the fishing panel opens and stays open; the touchend's click on it,
   // before and just after the pointer comes up, lands on nothing; a deliberate tap once the hold has run is a tap
   run('hxScreen(390,844,true);S.life.catch=null;LIFE34.fish=null;hxAt(0,12.3,13.9,[0,1]);hxAt(1,-8,-10);');frames(3);assert.equal(hsid(0),'fish','the rocks’ prompt');
   const fs1=J(`(()=>{foundPointer38(true);dailyPointer40();act[0]=true;hxFrames(3);const open=overlayOpen(),ph=String(panel.innerHTML),e={target:{closest:s=>s==='#panel'?{}:null}};
     const c1=dailyClick41(e);foundPointer38(false);if(typeof dailyUp41==='function')dailyUp41();const c2=dailyClick41(e);return {open,fishing:/lifeCast/.test(ph),c1,c2,still:overlayOpen()};})()`);
   assert(fs1.open&&fs1.fishing,'the fishing panel opened by the tap: '+JSON.stringify(fs1));assert(fs1.c1&&fs1.c2,'the touchend’s click lands on nothing: '+JSON.stringify(fs1));assert(fs1.still,'the panel still open');
   frames(12);assert.equal(J("dailyClick41({target:{closest:s=>s==='#panel'?{}:null}})"),false,'a deliberate tap once the hold has run');run('closePanel();hxScreen(1280,800,false);');G.fish='held';
   // (fix round, DOD-5, DOD-6) the shells mirror: the glass handed over with the three shells still owed: Ada says only the shells remain, the
   // bring record still needs them, and Today says so; once given, cut tonight
   run('S.time=10.2;S.money=60000;life34().shells=0;');frames(4);handOver(0);nextday();later(9.0);collectOpen(0);waitHold();click('ada41Pay');waitHold();
   assert(buttons(J('PH')).some(x=>x.act==='ada41Order'&&x.data.v==='flat'&&!x.disabled),'the mirror offered in the collection');click('ada41Order',x=>x.data.v==='flat');waitHold();click('ada41Leave');frames(70);
   assert.equal(J('ada41Piece().id'),'mirror','the mirror ordered');carryIn(0);buyFinds(0);later(10.6);const hp=handOver(0);
   assert(hp.includes(J("esc(adaLine41('ad41-bring-glass-got'))"))&&!hp.includes(J("esc(adaLine41('ad41-bring-got'))")),'the glass handed over, the shells still owed: '+strip(hp).slice(0,160));
   const br=J('ada41Bring()');assert(br&&br.need&&br.handed&&br.shells===3,'the bring record still needs the shells: '+JSON.stringify(br));assert.equal(J('ada41Piece().state'),'wait','the mirror still waits');
   b=expect('the shells still owed',J("todayLines41().map(x=>x.k)").slice(0,2));assert(b.keys[0]==='shells'&&lineOf(b,'shells').includes(e1('shells mirror')),'Today: the shells still owed: '+b.inner);
   run('life34().shells=3;');readSlate(0);click('ada41Shells');closeP();assert.equal(J('ada41Piece().state'),'cut','cut once the shells are given');G.mirror='shells';}
  /* (h) (repair 2, the purse) Mallam keeping two sticks tonight and the purse below his price: Today's Mallam line (v40's block) says the price
     and what the purse holds, in the same line, so Today keeps its cap of lines; with enough in the purse, v40's line as it was. (repair 2) A
     mouse click just before a key press at the rocks is not a touch: the fishing panel opens and its clicks are not held */
  {run("dispatch('newgame');");house();dayTo(8);run('S.time=9.0;S.money=60000;');frames(10);readSlate(0);closeP();
   run('S.time=10.7;hxAt(0,-3,10.6,[0,1]);hxAt(1,-8,-10);');frames(10);assert.equal(hsid(0),'mallam40order','Mallam’s order prompt');run('PH="";');press(0);click('mallam40Order',x=>x.data.v==='onion');frames(4);if(J('overlayOpen()'))run('closePanel();');
   assert(J('!!(mallamRec40(false)&&mallamRec40(false).order)'),'Mallam keeps an order tonight');
   const ml=()=>{const b=blk(),m=(b.v40||'').match(/<p class="small gist40-today-mallam">([\s\S]*?)<\/p>/);return {line:m?m[1]:null,v40ps:((b.v40||'').match(/<p /g)||[]).length,v41ps:b.ps};};const base=J('esc(MALLAM40.UI.tonight)');
   run('S.money=5000;');const rich=ml();assert.equal(rich.line,base,'(the purse) enough in the purse: v40’s line as it was');
   run('S.money=600;');const poor=ml();const want=base+' '+J("esc(DAILY41.LINES['ui41-today-purse'].replace('{price}',naira(2000)).replace('{money}',naira(600)))");
   assert.equal(poor.line,want,'(the purse) Today’s Mallam line says the price and the purse');assert(poor.line.includes(e1(J('naira(2000)')))&&poor.line.includes(e1(J('naira(600)'))),'(the purse) ₦2,000 and ₦600 named');
   assert.deepEqual([poor.v40ps,poor.v41ps],[rich.v40ps,rich.v41ps],'(the purse) within Today’s cap: the same lines');assert.deepEqual(J('dailyPurse41()'),{price:2000,money:600},'(the purse) the end measurement’s count reads it');
   R.purse=strip(poor.line);run('S.money=60000;');
   run('S.life.catch=null;LIFE34.fish=null;hxAt(0,12.3,13.9,[0,1]);hxAt(1,-8,-10);');frames(3);assert.equal(hsid(0),'fish','the rocks’ prompt');
   const mk=J(`(()=>{dailyPtr41({pointerType:'mouse'});foundPointer38(true);foundPointer38(false);hxFrames(2);act[0]=true;hxFrames(3);const open=overlayOpen(),e={target:{closest:s=>s==='#panel'?{}:null}};const held=dailyClick41(e);dailyPtr41({pointerType:''});return {open,held,touch:dailyTouch40(0)};})()`);
   assert(mk.open&&mk.touch&&!mk.held,'(repair 2) a mouse click just before a key press: the fishing panel open (v38’s timing says touch), its clicks not held: '+JSON.stringify(mk));run('closePanel();');R.mouse=mk;}
  /* (g) the log kinds, once each; the gates tool reads them with no warning and the same grades */
  if(typeof require==='function'){const kinds=J('LOG35.kinds');for(const k of ['commission','gift'])assert.equal(kinds.filter(x=>x===k).length,1,'LOG35.kinds '+k);
   const Gt=require(path.join(__dirname,'..','tools','gates-v35.cjs'));run("LOG35.add('commission','read');LOG35.add('commission','order shelf');LOG35.add('gift','give board:tunde@yard');");
   const days=J('JSON.stringify(Object.keys(S.life.days))');const textWith=J('daysText35()');run(`for(const n of ${days}){const r=S.life.days[n];if(r&&r.events)r.events=r.events.filter(e=>!['commission','gift'].includes(e.k));}`);const textWithout=J('daysText35()');
   const an=x=>Gt.analyse([{name:'tester-1.txt',text:'Tester: Test\n'+x}],{testers:1});const aw=an(textWith),ao=an(textWithout);const warns=JSON.stringify(aw).match(/could not be read/g)||[];
   assert(['commission','gift'].every(k=>textWith.includes(' '+k+' ')),'the paste carries the two kinds');assert.equal(warns.length,0,'gates warnings');assert.deepEqual(aw.gates.map(x=>x.status),ao.gates.map(x=>x.status),'the same grades');
   R.gates={warnings:0,grades:aw.gates.map(x=>x.status)};}else R.gates='(debug run)';
  /* (d) online, and an earlier household: no block */
  run('NET.on=true;');const on=blk();run('NET.on=false;');assert.equal(on.inner,null,'no v41 block online');
  return R;
 });
 check(11,()=>{const R={};
  const T=J(`(()=>{const o=[];for(const [nm,L] of [['ADA41',ADA41.LINES],['GIFT41',GIFT41.LINES]].concat(typeof DAILY41!=='undefined'&&DAILY41.LINES?[['DAILY41',DAILY41.LINES]]:[]))for(const k in L)if(typeof L[k]==='string')o.push([nm,k,L[k]]);return o;})()`);
  // the one copy each id shows (B's GIFT41.LINES wins where it has the id)
  const use={};for(const [nm,k,s] of T)if(!use[k]||nm==='GIFT41')use[k]=s;const ids=Object.keys(use);R.strings=ids.length;R.gift41=T.filter(x=>x[0]==='GIFT41').length;
  const speech=k=>/^(ad41|gf41|gs41)-/.test(k)&&!['ad41-slate-head','gf41-oy-card'].includes(k)&&!/^gf41-(shells-give|home-toast)$/.test(k);
  const bad=[];const WEEK=/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|june|july|august|september|october|november|december)\b/i;
  const MONEY=/\b(pay|paid|price|naira|money|afford|rich|owe|credit|balance|cost|earn)\w*\b/i,DEBT=/\b(owe|owed|owing|debt|debts|credit|loan)\b/i;
  const US=/\b(color|colored|favor|favorite|center|centered|neighbor|realiz|organiz|apologiz|honor|traveled|jewelry|gotten|cozy|gray)\w*\b/i;
  const PIDGIN=/\b(ah ah|ehen|abeg|wahala|sha|o!|na|dey|una|wetin|oga)\b/i;
  for(const k of ids){const s=use[k];if(!/^(ad41|gf41|gs41|ui41)-/.test(k))bad.push('id prefix: '+k);if(WEEK.test(s))bad.push('a weekday or month: '+k);if(/'/.test(s))bad.push('a straight apostrophe: '+k);if(US.test(s))bad.push('American spelling: '+k);
   if(speech(k)){if(/[0-9₦]/.test(s))bad.push('a digit or ₦ in speech: '+k);if(s.length>160)bad.push('over 160 characters: '+k);if(DEBT.test(s))bad.push('a debt word in speech: '+k);}
   else{if(s.length>200)bad.push('over 200 characters: '+k);if(/[0-9]/.test(s.replace(/Flat 3/g,'')))bad.push('a digit in UI other than "Flat 3": '+k);}
   if(/^gs41-/.test(k)&&MONEY.test(s))bad.push('a money word at the rail: '+k+' ('+s.match(MONEY)[0]+')');
   if(/^(ad41-slate-head|gf41-oy-card)$/.test(k)&&PIDGIN.test(s))bad.push('Pidgin in written UI: '+k);}
  // every family's ids exist, each gs41 id in exactly one family
  const FAM=J('GIFT41.FAM');const inFam={};for(const f in FAM)for(const id of FAM[f]){if(!use[id])bad.push('a family id with no line: '+id);if(inFam[id])bad.push('an id in two families: '+id);inFam[id]=f;}
  for(const k of ids)if(/^gs41-/.test(k)&&!inFam[k])bad.push('a gist line in no family: '+k);
  // the five-word overlap sweep: against every shipped string (dist/src/*.js but v41's, dist/data/*.js, index.html; a quoted string of 12+
  // characters with a space) and within v41
  const words=s=>(String(s).toLowerCase().replace(/\$\{[^}]*\}/g,' ').match(/[a-z’'{}]+/g)||[]);
  const lcr=(a,b)=>{let best=0;for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){let k=0;while(i+k<a.length&&j+k<b.length&&a[i+k]===b[j+k])k++;if(k>best)best=k;}return best;};
  const old=[];const src=f=>fs.readFileSync(path.join(GAME,f),'utf8');
  const files=fs.readdirSync(path.join(GAME,'src')).filter(f=>f.endsWith('.js')&&!/-v41\.js$/.test(f)).map(f=>'src/'+f).concat(fs.existsSync(path.join(GAME,'data'))?fs.readdirSync(path.join(GAME,'data')).filter(f=>f.endsWith('.js')).map(f=>'data/'+f):[],['index.html']);
  for(const f of files){const t=src(f);for(const re of [/'([^'\n]{12,600})'/g,/"([^"\n]{12,600})"/g,/`([^`\n]{12,600})`/g])for(const m of t.matchAll(re))if(/ /.test(m[1]))old.push(words(m[1]));}
  const V=ids.map(k=>[k,words(use[k])]);let maxOld=0,maxIn=0;
  for(const [k,w] of V){for(const o of old){const n=lcr(w,o);if(n>maxOld)maxOld=n;if(n>=5){bad.push('five words shared with a shipped line: '+k);break;}}}
  for(let i=0;i<V.length;i++)for(let j=i+1;j<V.length;j++){const n=lcr(V[i][1],V[j][1]);if(n>maxIn)maxIn=n;if(n>=5)bad.push('five words shared within v41: '+V[i][0]+' / '+V[j][0]);}
  // (fix round, C9, C11, C13, C14 c, S11, C7) what is handed over is a thing (never an abstraction), never "in your pocket"; no cloth claimed by
  // the slate; no line answers a gesture; the hush after the polish true with the bundle in hand; the door plate's own toast
  for(const k of ids)if(/\bpocket\b/i.test(use[k]))bad.push('a thing “in your pocket”: '+k);
  {const th=J("ADA41.FLAT.map(f=>f.bring).concat(GIFT41.NB.map(x=>x.bring)).filter(Boolean).map(b=>[b.kind,b.thing,b.short])");for(const [kd,t,sh] of th)if(/^(measure|words)$/.test(kd)&&!(/^a paper with /.test(t)&&/^paper with /.test(sh)))bad.push('an abstraction to hand over: '+t);}
  if(/cloth/i.test(use['ui41-open-ready']||''))bad.push('the slate claims a cloth: ui41-open-ready');if(/with your hands how big/i.test(Object.values(use).join(' ')))bad.push('a line answers a gesture');
  if(/wrapping/i.test(use['ui41-hush-wrap']||''))bad.push('the hush says it is still being wrapped');
  // (repair 2, R2-4) the thing carried for Ada is named without a pronoun (four cup hooks are not "it")
  if(/\b(it|them|they)\b/i.test(use['ui41-got']||''))bad.push('a pronoun in ui41-got (plural things)');if(!use['gf41-plate-toast'])bad.push('no door plate toast');
  // (fix round, C5 and C6) docs/READER_gist.md section v41.3 reads, for every id, the text the game shows (adaLine41: GIFT41 first, then ADA41;
  // Today's DAILY41), lists every id once, and numbers the questions as v41.1 does (8 the fittings, 9 the woods, 10 gifts, 11 Mama Nkechi)
  {const md=fs.readFileSync(path.join(__dirname,'..','docs','READER_gist.md'),'utf8');const a=md.indexOf('## v41.3'),b=md.indexOf('## v41.4');const sec=a>=0&&b>a?md.slice(a,b):'';const seen={};let head=null;
   const cells=l=>l.slice(1,-1).split(/(?<!\\)\|/).map(x=>x.trim().replace(/\\\|/g,'|'));
   for(const l of sec.split('\n')){if(!/^\|.*\|$/.test(l.trim())){head=null;continue;}const c=cells(l.trim());if(/^---/.test(c[0]))continue;if(!head){head=c;continue;}if(!/^(ad41|gf41|gs41|ui41)-[\w-]+$/.test(c[0]))continue;
    const ti=head.indexOf('Who')>=0?2:1,qi=head.indexOf('Q');const game=J(`adaLine41(${JSON.stringify(c[0])})||(typeof DAILY41!=='undefined'&&DAILY41.LINES[${JSON.stringify(c[0])}])||''`);
    if(seen[c[0]])bad.push('the sheet lists an id twice: '+c[0]);seen[c[0]]={t:c[ti],q:c[qi]};if(c[ti]!==game)bad.push('the sheet’s text differs from the game’s: '+c[0]);}
   for(const k of ids)if(!seen[k])bad.push('an id missing from the sheet: '+k);
   const Q={'ad41-wood-iroko':'9','ad41-wood-afara':'9','ad41-bring-hooks':'8','gf41-home-toast':'8','gf41-nk-ask':'11','ad41-nk-msg':'11','gf41-tu-board':'10','gs41-nk-stool':'10'};for(const k in Q)if(seen[k]&&seen[k].q!==Q[k])bad.push('the sheet’s question for '+k+': '+seen[k].q+' (v41.1: '+Q[k]+')');R.sheetRows=Object.keys(seen).length;}
  assert(!bad.length,'the copy rules: '+bad.slice(0,12).join('; ')+(bad.length>12?' …':''));R.longestRunShipped=maxOld;R.longestRunWithin=maxIn;R.shipped=old.length;return R;});
 check(12,()=>{const R={};
  // the AI's trace over day 8 (layer 2 open, v41 not yet discovered, the human idle at home): the runner compares it with the run without v41
  houseComp();dayTo(8,true);run('S.time=9.0;');{const tr=[];for(let k=0;k<20;k++){frames(30);tr.push(J(`players[AI.i]?players[AI.i].g.position.x.toFixed(3)+','+players[AI.i].g.position.z.toFixed(3):''`));}side.aiTrace=hash(tr.join(';'))+':'+tr.length;}
  assert(J("typeof GIFT41!=='undefined'&&GIFT41.on"),'gifts-v41 installed');
  // aiGoal and aiThink unchanged (no v41 wrapper)
  const src=J("(typeof aiGoal==='function'?aiGoal.toString():'')+(typeof aiThink==='function'?aiThink.toString():'')");assert(src.length>0&&!/41/.test(src),'aiGoal and aiThink carry no v41 code');
  // the companion household plays days 8 to 10: no v41 prompt is ever offered to the AI player
  const ctx=newCtx({gist:false,comp:true});const seen=new Set();const aiCheck=()=>{const c=J('(()=>{const i=AI.i,p=players[i];if(!p)return [];const list=[],d=(a,b)=>Math.hypot(p.g.position.x-a,p.g.position.z-b);for(const h of HOTSPOT_HOOKS){h(i,list,d);}return list.map(x=>x.id);})()');for(const id of c)if(/41/.test(id))seen.add(id);};
  for(let d=0;d<3;d++){const ev=eagerDay(ctx);aiCheck();
   // the AI player stood beside each neighbour, the station and the flat door with a v41 thing due: nothing for it
   for(const k of ['nkechi','bassey','tunde','oyelaran'])if(J(`!!found38Npc('${k}')`)){const q=npcAt(k);run(`hxAt(AI.i,${q[0]+0.8},${q[1]});`);frames(1);aiCheck();}
   const st=J('ada41Station()');if(st){run(`hxAt(AI.i,${st.x},${st.z+0.3});`);frames(1);aiCheck();}run('hxAt(AI.i,-4.1,5.4);');frames(1);aiCheck();nextdayC();}
  assert.deepEqual([...seen],[],'no v41 prompt for the AI player');R.days=3;
  // Mallam's stand and Aunty Bisi's stop: no v41 prompt; Finds' page and Dayo's stall unchanged with no thing wanted
  run("dispatch('newgame');");house();dayTo(8);run('S.time=9.0;S.money=60000;');frames(6);readSlate(0);closeP();
  later(10.7);const ms=J('typeof MALLAM40!=="undefined"&&MALLAM40.spot?MALLAM40.spot:null');if(ms){run(`hxAt(0,${ms[0]},${ms[1]+1.0});`);frames(2);assert(!cands(0).some(id=>/41/.test(id)),'no v41 prompt at Mallam’s stand');}
  run('hxAt(0,20.8,6.0,[0,1]);');frames(2);run("PH='';openLife34('market');");assert(!/gist41-shop/.test(J('PH')),'Finds’ page unchanged with no thing wanted');run('closePanel();');
  run('hxAt(0,28.6,2.1,[0,1]);');frames(3);run('PH="";');press(0);assert(!/gist41-shop/.test(J('PH')),'Dayo’s stall unchanged with no thing wanted');run('closePanel();');frames(1);
  later(17.1);for(let k=0;k<40&&!(Bv()&&Bv().vis);k++)frames(4);if(Bv()&&Bv().vis){const b=Bv();run(`hxAt(0,${b.x},${b.z+1.0},[0,-1]);`);frames(1);assert(!cands(0).some(id=>/41/.test(id)),'no v41 prompt at Aunty Bisi’s stop');R.bisi=true;}
  return R;});
 //@@BCHECKS-END
 //@@BODY
 return out;}
const tail=o=>process.stdout.write(JSON.stringify(o)+'\n',()=>process.exit(0));
if(process.argv[2]==='--debug'){world41().then(h=>{const J=c=>JSON.parse(h.run('JSON.stringify((()=>{const v=('+c+');return v===undefined?null:v;})())'));const env={};const steps=checks(h,[-1],env);const code=fs.readFileSync(process.argv[3],'utf8');const fn=new Function('h','J','run','assert','env',code);return fn(h,J,h.run,assert,env);}).then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});}
async function inner(only){const h=await world41();const side={};const res=checks(h,only,side);return {build:h.run('BUILD_ID'),checks:res,side};}
// a subset copy's globals: load it, play 300 frames over day 3 midday and day 4 at five, list the names; warnings naming 39, 40 or 41 counted
async function globals(){const out={names:[],warn:0,played:0,error:null};try{const {benchWorld}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));
 const {run,context}=await benchWorld();let n=0;const cw=context.console.warn;context.console={...context.console,warn:(...a)=>{if(/39|40|41/.test(String(a[0])))n++;}};
 run("S.day=3;S.time=11.95;var hxF2=0;{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<300;k++){T35+=1000/30;PERF35+=1000/30;last=hxF2;hxF2+=1000/30;tick(hxF2);}}finally{renderFrame=rf;}}");
 run("dispatch('nextday');closePanel();S.time=16.95;{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<300;k++){T35+=1000/30;PERF35+=1000/30;last=hxF2;hxF2+=1000/30;tick(hxF2);}}finally{renderFrame=rf;}}enterWorld();closePanel();");
 out.played=600;out.warn=n;context.console.warn=cw;
 const html=fs.readFileSync(path.join(GAME,'index.html'),'utf8'),lex=new Set();
 for(const [,attr,body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){const src=attr.match(/src="([^"]+)"/);if(src&&src[1].includes('three-r128'))continue;const code=src?fs.readFileSync(path.join(GAME,src[1]),'utf8'):body;
  for(const m of code.matchAll(/^(?:const|let|class)\s+([A-Za-z_$][\w$]*)/gm))lex.add(m[1]);for(const m of code.matchAll(/^(?:const|let)\s+([A-Za-z_$][\w$]*\s*=[^;]*?(?:,\s*[A-Za-z_$][\w$]*\s*=[^,;]*?)*);/gm)){for(const k of m[1].matchAll(/(?:^|,)\s*([A-Za-z_$][\w$]*)\s*=/g))lex.add(k[1]);}}
 const own=run('Object.getOwnPropertyNames(globalThis).join(",")').split(','),present=[...lex].filter(k=>{try{return run('typeof '+k)!=='undefined';}catch(e){return false;}});
 out.names=[...new Set(own.concat(present))].filter(k=>!/^hx|^PH$|^TOASTS$|^T35$|^PERF35$/.test(k)).sort();}catch(e){out.error=String(e&&e.message||e).split('\n')[0].slice(0,200);}
 return out;}
// a bare load (a copy without v40, v39 or v38, with or without v41): the bench world, 900 frames over day 4 from 16:50 with the v35 evening on day
// 3 and then 600 over day 8 from 10:20, the scene count, the Math.random calls during play, the hooks, the board
async function bare(){const out={error:null};try{const {benchWorld}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));const {run}=await benchWorld();
 run("var hxMR=0;{const m=Math.random;Math.random=function(){hxMR++;return m.apply(this,arguments);};}");
 run("dispatch('nextday');closePanel();dispatch('nextday');closePanel();life34().evening35={doneDay:3};S.time=16.85;players[0].g.position.set(-4.0,0,6.5);hxMR=0;var hxF3=0;{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<900;k++){T35+=1000/30;PERF35+=1000/30;last=hxF3;hxF3+=1000/30;tick(hxF3);}}finally{renderFrame=rf;}}");
 run("S.day=8;S.time=10.3;players[0].g.position.set(-2.5,0,-17.0);{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<600;k++){T35+=1000/30;PERF35+=1000/30;last=hxF3;hxF3+=1000/30;tick(hxF3);}}finally{renderFrame=rf;}}");
 out.mr=run('hxMR');out.count=run('(()=>{let n=0;scene.traverse(()=>{n++;});return n;})()');out.hooks=run("[HOTSPOT_HOOKS.length,ACT_HOOKS.length,TICK_HOOKS.length,typeof ADA41!=='undefined'&&ADA41.on].join()");
 out.tagged=run('(()=>{let n=0;scene.traverse(o=>{if(o.userData&&o.userData.gist41)n++;});return n;})()');out.time=run('Math.round(S.time*1000)/1000');out.tick=run('String(EVENING35&&EVENING35.tick).length');}catch(e){out.error=String(e&&e.message||e).split('\n')[0].slice(0,200);}return out;}
// the v40 build reading a v41 save (check 10): load it, enter the world, 60 frames, a visit day's reroute, the storage list, save
async function loadsave(f){const out={error:null};try{const h=await world();const {run}=h;run(`localStorage.setItem(KEY,${JSON.stringify(fs.readFileSync(f,'utf8'))});S=load();enterWorld();closePanel();`);
 out.b41in=run('JSON.stringify(S.life.gist38.b41||null)');run('hxFrames(60);');
 run("life34().visitsUnlocked=true;hxAt(0,-5.2,4.0);hxFrames(1);dispatch('lifeVisit');closePanel();reroute();placeNPCs();hxFrames(30);");
 run("hxAt(0,-5.2,4.0);hxFrames(2);openLife34('home');");out.home=run("String(panel.innerHTML).includes('In storage')");run('closePanel();hxFrames(10);save();');
 out.v41=run("typeof ADA41!=='undefined'");out.b41=run('JSON.stringify(JSON.parse(localStorage.getItem(KEY)).life.gist38.b41||null)');out.day=run('S.day');}catch(e){out.error=String(e&&e.message||e).split('\n')[0].slice(0,200);}return out;}

if(process.argv[2]==='--probe'){world41().then(h=>{const env={};checks(h,[-1],env);env.house();env.dayTo(8);h.run('S.time=9.0;');env.frames(10);const y=env.yardProbe('nothing open');env.invite();env.frames(10);const v=env.verandaProbe();
 process.stdout.write(JSON.stringify({yard:y,veranda:v},null,1)+'\n');process.exit(y.bad.length||v.bad.length?1:0);}).catch(e=>{console.error(e);process.exit(1);});}
else if(process.argv[2]==='--globals'){globals().then(tail);}
else if(process.argv[2]==='--bare'){bare().then(tail);}
else if(process.argv[2]==='--loadsave'){loadsave(process.argv[3]).then(tail);}
else if(process.argv[2]==='--inner'){const only=process.argv[3]?process.argv[3].split(',').map(Number):null;inner(only).then(tail).catch(e=>{console.error(e);process.exit(1);});}
else if(process.argv[2]!=='--debug'){(async()=>{
 const child=(args,env)=>new Promise(res=>{const p=cp.spawn(process.execPath,[__filename].concat(args),{env:Object.assign({},process.env,env||{}),stdio:['ignore','pipe','pipe']});let o='',e='';p.stdout.on('data',d=>o+=d);p.stderr.on('data',d=>e+=d);
  p.on('close',code=>{try{res(JSON.parse(o.trim().split('\n').pop()));}catch(x){res({error:(e||o).slice(-600)||('exit '+code)});}});});
 const dirs=[],mut=[];let a,b,wo,n40,n40ref,n39,n39ref,n38,n38ref;const subs={},ls={};
 const html0=fs.readFileSync(path.join(GAME,'index.html'),'utf8');assert(TAGS41[0].test(html0),'the ada-v41 tag is in index.html');
 const withoutDir=variantDir(html=>strip(html,TAGS41));dirs.push(withoutDir);
 const mk=f=>{const d=variantDir(f);dirs.push(d);return d;};
 const no40=mk(h=>strip(h,TAGS40)),no40ref=mk(h=>strip(strip(h,TAGS40),TAGS41)),no39=mk(h=>strip(h,TAGS39)),no39ref=mk(h=>strip(strip(h,TAGS39),TAGS41)),no38=mk(h=>strip(h,TAGS38)),no38ref=mk(h=>strip(strip(h,TAGS38),TAGS41));
 const loadPass=(x,y)=>{const o={error:x&&x.error||y&&y.error||null,scene:x&&x.count,random:x&&x.mr,hooks:x&&x.hooks,hooksRef:y&&y.hooks};
  o.passed=!!(x&&y&&!x.error&&!y.error&&x.count===y.count&&x.mr===y.mr&&x.tagged===0&&x.time===y.time&&x.tick===y.tick&&x.hooks.split(',').slice(0,3).join()===y.hooks.split(',').slice(0,3).join()&&!/true/.test(x.hooks));return o;};
 const jobs=[async()=>{a=await child(['--inner']);},async()=>{b=await child(['--inner']);},async()=>{wo=await child(['--inner'],{COMPOUND_GAME_DIR:withoutDir});},
  async()=>{n40=await child(['--bare'],{COMPOUND_GAME_DIR:no40});n40ref=await child(['--bare'],{COMPOUND_GAME_DIR:no40ref});},
  async()=>{n39=await child(['--bare'],{COMPOUND_GAME_DIR:no39});n39ref=await child(['--bare'],{COMPOUND_GAME_DIR:no39ref});},
  async()=>{n38=await child(['--bare'],{COMPOUND_GAME_DIR:no38});n38ref=await child(['--bare'],{COMPOUND_GAME_DIR:no38ref});}]
  .concat([['lines','lines-v35.js'],['log','days-v35.js'],['tune','tune-v35.js']].map(([name,last])=>async()=>{const dW=subsetDir41(last,false),dO=subsetDir41(last,true);dirs.push(dW,dO);
   const g=await child(['--globals'],{COMPOUND_GAME_DIR:dW}),o=await child(['--globals'],{COMPOUND_GAME_DIR:dO});subs[name]={g,o};}))
  .concat(MUTANTS.filter(m=>!m.with).map((m,k)=>async()=>{const extra=MUTANTS.filter(x=>x.with===m.name.split(' ')[0]);const srcs={};
   for(const x of [m].concat(extra)){const f=x.file;const t=srcs[f]!==undefined?srcs[f]:(fs.existsSync(path.join(GAME,'src',f))?fs.readFileSync(path.join(GAME,'src',f),'utf8'):'');const n=t.split(x.find).length-1;
    if(n!==1){mut.push({name:m.name,check:m.check,result:'stale ('+n+' matches of '+x.name.split(' ')[0]+')',k});return;}srcs[f]=t.replace(x.find,x.replace);}
   const fns={};for(const f in srcs)fns[f]=()=>srcs[f];const nm=m.name+(extra.length?' (with '+extra.map(x=>x.name.split(' ')[0]).join(', ')+')':'');
   if(m.pass==='noV39'){const d=variantDir(h=>strip(h,TAGS39),fns);dirs.push(d);const x=await child(['--bare'],{COMPOUND_GAME_DIR:d}),y=await child(['--bare'],{COMPOUND_GAME_DIR:no39ref});const lp=loadPass(x,y);
    mut.push({name:nm,check:m.check,result:lp.passed?'green':'red',k,first:lp.passed?undefined:'the copy without v39 with this change: '+JSON.stringify({hooks:lp.hooks,ref:lp.hooksRef,error:lp.error})});return;}
   if(m.pass==='subset'){const d=variantDir(null,fns);dirs.push(d);let bad=0,first='';for(const [name,last] of [['lines','lines-v35.js']]){const save=process.env.COMPOUND_GAME_DIR;
     const dW=(()=>{const dd=fs.mkdtempSync(path.join(os.tmpdir(),'cd41-sub-'));for(const f of ['assets','src','data'])fs.symlinkSync(path.join(d,f),path.join(dd,f));let html=fs.readFileSync(path.join(d,'index.html'),'utf8'),cut=false;
      for(const [tag,src] of [...html.matchAll(/<script src="([^"]+-v35\.js)"><\/script>\n?/g)]){if(cut)html=html.replace(tag,'');if(src.endsWith('/'+last))cut=true;}fs.writeFileSync(path.join(dd,'index.html'),html);return dd;})();dirs.push(dW);
     const g=await child(['--globals'],{COMPOUND_GAME_DIR:dW}),o=subs.lines&&subs.lines.o?subs.lines.o:await child(['--globals'],{COMPOUND_GAME_DIR:subsetDir41(last,true)});
     const extra=(g.names||[]).filter(n=>!(o.names||[]).includes(n)),other=extra.filter(n=>!/41/.test(n));if(other.length||g.error){bad++;first='otherNew '+JSON.stringify(other)+(g.error?' '+g.error:'');}}
    mut.push({name:nm,check:m.check,result:bad?'red':'green',k,first:bad?first:undefined});return;}
   const d=variantDir(null,fns);dirs.push(d);const r=await child(['--inner',String(m.check)],m.short?{COMPOUND_GAME_DIR:d,GIST41_SHORT:'1'}:{COMPOUND_GAME_DIR:d});const c=r.checks&&r.checks.find(x=>x.n===m.check);
   mut.push({name:nm,check:m.check,result:c?(c.passed?'green':'red'):'error',k,first:c&&!c.passed?c.failure:(r.error?String(r.error).slice(0,300):undefined)});}));
 const PAR=Math.max(1,Math.min(2,+(process.env.GIST41_JOBS||2)));
 try{const q=jobs.slice();await Promise.all(Array.from({length:PAR},async()=>{while(q.length)await q.shift()();}));
  // the v41 saves in the v40 build (the copy without the v41 tags is 4218ee1's dist)
  if(a&&a.side&&a.side.save41){for(const k of ['six','hand']){if(!a.side.save41[k])continue;const f=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'cd41-save-')),'s.json');dirs.push(path.dirname(f));fs.writeFileSync(f,a.side.save41[k]);ls[k]=await child(['--loadsave',f],{COMPOUND_GAME_DIR:withoutDir});}}}
 finally{for(const d of dirs)fs.rmSync(d,{recursive:true,force:true});}
 mut.sort((x,y)=>x.k-y.k);for(const m of mut)delete m.k;
 const strip41=r=>r&&r.side&&r.side.save41?Object.assign({},r,{side:Object.assign({},r.side,{save41:Object.keys(r.side.save41).map(k=>k+':'+r.side.save41[k].length)})}):r;
 const same=JSON.stringify(strip41(a))===JSON.stringify(strip41(b));
 const find=(r,n)=>r&&r.checks?r.checks.find(c=>c.n===n):null;
 // check 1: the inert worlds equal the run without v41
 {const c1=find(a,1);if(c1&&c1.passed){const ia=a.side,iw=wo&&wo.side;
   const diff=(x,y)=>((x&&x.parts)||[]).filter((p,k)=>p!==((y&&y.parts)||[])[k]).map(p=>p.split(':').slice(0,2).join(':')).join(', ');
   if(!(iw&&ia.inertA===iw.inertA)){c1.passed=false;c1.failure='the day-3 world at 10:00 differs from the run without v41 ('+ia.inertA+' against '+(iw&&iw.inertA)+')';}
   else if(!(iw&&iw.inertB&&ia.inertB&&ia.inertB.digest===iw.inertB.digest)){c1.passed=false;c1.failure='days 6 and 7 (layer 2 closed) differ from the run without v41 in: '+diff(ia.inertB,iw&&iw.inertB);}
   else if(!(iw&&iw.inertC&&ia.inertC&&ia.inertC.digest===iw.inertC.digest)){c1.passed=false;c1.failure='the layer-2 days differ from the run without v41 in: '+diff(ia.inertC,iw&&iw.inertC);}
   else c1.info.withoutV41={dayThree:iw.inertA,closed:iw.inertB.digest,layer2:iw.inertC.digest};}}
 // check 10: the scene count after a new household equals the run without v41; the v41 saves load in the v40 build with b41 kept
 {const c10=find(a,10);if(c10&&c10.passed){const ca=a.side.count10,cw=wo&&wo.side&&wo.side.count10;
   if(!(typeof ca==='number'&&ca===cw)){c10.passed=false;c10.failure='the scene after a new household differs from the run without v41 ('+ca+' against '+cw+' objects)';}
   else{c10.info.sceneCount={objects:ca,sameAsWithout:true};const bad=Object.keys(ls).filter(k=>{const r=ls[k];return !r||r.error||r.v41!==false||r.b41!==r.b41in||r.b41==='null'||!r.home;});
    if(Object.keys(ls).length<2||bad.length){c10.passed=false;c10.failure='a v41 save in the v40 build: '+JSON.stringify(Object.keys(ls).length<2?'missing':bad.map(k=>[k,ls[k]&&ls[k].error,ls[k]&&ls[k].v41,ls[k]&&ls[k].home])).slice(0,300);}
    else c10.info.v40build={six:{error:null,b41kept:true,storageList:true},hand:{error:null,b41kept:true,storageList:true}};}}}
 // check 12: the AI's trace over day 8 equals the run without v41
 {const c12=find(a,12);if(c12&&c12.passed){const ta=a.side.aiTrace,tw=wo&&wo.side&&wo.side.aiTrace;if(!(ta&&ta===tw)){c12.passed=false;c12.failure='the AI\'s trace over day 8 differs from the run without v41 ('+ta+' against '+tw+')';}else c12.info.aiTrace={day8:ta,sameAsWithout:true};}}
 const groups=[];if(wo&&wo.checks)for(const c of wo.checks){const g=groups.find(x=>x.first===c.failure);if(c.passed)groups.push({checks:[c.n],first:'GREEN without v41'});else if(g)g.checks.push(c.n);else groups.push({checks:[c.n],first:c.failure});}
 const woRed=!!(wo&&wo.checks&&wo.checks.length===ORDER.length&&wo.checks.every(c=>!c.passed));
 const noV40=loadPass(n40,n40ref),noV39=loadPass(n39,n39ref),noV38=loadPass(n38,n38ref);
 const subsets={};let subOK=true;for(const name of ['lines','log','tune']){const s=subs[name]||{},g=s.g||{},o=s.o||{};const extra=(g.names||[]).filter(n=>!(o.names||[]).includes(n)),lost=(o.names||[]).filter(n=>!(g.names||[]).includes(n));
  const ok=!g.error&&!o.error&&extra.every(n=>/41/.test(n))&&!lost.length&&!g.warn;if(!ok)subOK=false;subsets[name]={loads:!g.error,v41Names:extra.length,otherNew:extra.filter(n=>!/41/.test(n)),gone:lost,warn:g.warn|0,error:g.error||o.error||null};}
 const report={build:a&&a.build||null,passed:!!(a&&!a.error&&same&&a.checks.length===ORDER.length&&a.checks.every(c=>c.passed)&&mut.every(m=>m.result==='red')&&woRed&&noV40.passed&&noV39.passed&&noV38.passed&&subOK),
  checks:(a&&a.checks||[]).map(c=>{const o=Object.assign({},c);delete o.n;return o;}),mutants:mut,withoutV41:{allRed:woRed,findings:groups},withoutV40:noV40,withoutV39:noV39,withoutV38:noV38,subsets,determinism:same?'identical':'differs'};
 if(a&&a.error)report.error=a.error;
 for(const c of report.checks)console.log((c.passed?'PASS ':'FAIL ')+c.name.slice(0,140)+(c.passed?'':' -- '+c.failure));
 for(const m of mut)console.log((m.result==='red'?'PASS ':'FAIL ')+'mutant '+m.name+' turns check '+m.check+' '+m.result+(m.result==='red'?'':' '+(m.first||'')));
 console.log((woRed?'PASS ':'FAIL ')+'without the v41 modules every check fails ('+groups.length+' distinct first failures)');
 for(const [nm,x] of [['v40',noV40],['v39',noV39],['v38',noV38]])console.log((x.passed?'PASS ':'FAIL ')+'without the '+nm+' modules, with v41: loads and installs nothing '+JSON.stringify({scene:x.scene,random:x.random,hooks:x.hooks,error:x.error}));
 console.log((subOK?'PASS ':'FAIL ')+'the subset copies with v41 load, no new global but v41\'s '+JSON.stringify(subsets));
 console.log((same?'PASS ':'FAIL ')+'determinism: two runs give identical reports');if(a&&a.error)console.log('ERROR',a.error);
 fs.writeFileSync(OUT,JSON.stringify(report,null,1)+'\n');console.log(`${report.checks.filter(c=>c.passed).length}/${ORDER.length} checks, ${mut.filter(m=>m.result==='red').length}/${mut.length} mutants red`);
 process.exitCode=report.passed?0:1;})();}

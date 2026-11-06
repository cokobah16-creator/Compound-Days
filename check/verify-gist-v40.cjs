// v40 Notices, children's things and fresh evenings (dist/src/board-v40.js and dist/src/mallam-v40.js, engineer A; dist/src/gist-v40.js, engineer B;
// dist/src/daily-v40.js, the integrator), checked on the real game logic in Node with the shipped Three.js (v40/SPEC.md §16). Built on
// check/runtime-harness.cjs and the world of verify-gist-v39.cjs (the bench's: a local two-player household made with the real setup actions, the
// sofa placed through its own success path), with the players driven through the game's own key state (P1 WASD and E, P2 the arrows and Enter)
// and the real tick, one frame at a time. Setup may set the day, the time, S.life.evening35, S.money and the players' standing places, and v38
// and v39 state only through their own actions; it never sets S.life.gist38.b40 and never calls a v40 action except through a hotspot act, a
// panel button's own data-act or openBoard() (the pure API functions of spec §1.7 are read). The clock, Math.random, Date and performance.now are
// stubbed; reads of performance.now, Date.now and Math.random made directly from board-v40.js and mallam-v40.js are counted, and Math.random calls
// inside v40's builds are counted (both must be 0). The results file holds no wall-clock value.
// The checks run twice in child processes and the two reports must match. Each mutant (a one-place change to a v40 file in a copy of dist) reruns
// only its named check, which must fail. Load passes: a copy of dist without the four v40 tags runs every check and each must fail there (checks
// with the same first failure are reported once); a copy without the v39 tags but with v40, and one without the v38 tags, load with no error and
// install nothing (the same scene count, Math.random calls and hooks as a copy with neither); the verify-lines, verify-log and verify-tune subset
// copies with the v40 tags load with no error, no new global but v40's and no warning naming 39 or 40. GIST40_JOBS (default 2, at most 2) runs the
// child processes in parallel.
// Engineer A's checks are 1, 2, 3, 4, 8 and 11 (mutants M1-M11, M23-M25, M30-M32); engineer B's 5, 6, 7, 10 and 12 (mutants M12-M22, M29; M21,
// M22 and M29 rerun check 7 on nights 8-16 only, GIST40_SHORT=1). The integrator's check 9 (mutants M26, M27) and check 10's part for the
// v40 block in Today (mutant M28) are in the same file; ORDER lists the checks this file runs.
// `node check/verify-gist-v40.cjs --probe` runs A's spot, route and fan-zone probe alone (exit 1 on any break).
'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const OUT=path.join(__dirname,'results-gist-v40.json');
const GAME=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');process.env.COMPOUND_GAME_DIR=GAME;
const NAMES={
 1:'1. inert: (a) on day 3 at 10:00 before v38 is discovered the save, the keys of S and S.life, 600 frames of cameras and prompts, the Menu and Today are as without v40; TICK_HOOKS 17, cue hooks 2, the audio recipes and twins, LINES35, WHEN35, DAYS35.rows, FINDS34 and the five pinned sources unchanged; (b) days 5 and 7 with v38 discovered and no v39 trigger (layer 2 closed): from 07:30 to the gist\'s end the save, Today, the plan, the talk and gist lines, the prompts, the log and the board\'s panel are as without v40, and nothing of v40\'s is in the world; (c) layer 2 open and v40 not discovered, both ways (v39 discovered: days 6 and 7; v38 only: days 8 and 9): the save, Today, the plan, the talk and gist lines, the prompts and the log as without v40, the only difference the card and its pulse from 10:30 and Mrs. Oyelaran\'s bubble; a player past the board at 10:45: the bubble built once, shown once, timed and taken down, with no Math.random call; no G.b40; (d) verify-tune check 12\'s day-1 household: the board\'s panel as without v40, with "Compound meeting this week."',
 2:'2. board: before discovery the v40 block only from 10:30 with layer 2 open, above the base cards, TUNE\'s copyFix and the host button, which are as the board without v40; the real openPanel once per read; discovery on the first read with a card (G.b40, "board read"), not before 10:30, not online, with or without G.b39 (via b38 and b39); the 10:30 change on a jump; the crossed card at once, through the next change and down at the second; the read prompt over talking to Mrs. Oyelaran beside the board while a v40 card is up and unread (and not once read); at most two world cards, the upper 0.40 x 0.20; at most four panel blocks; the pulse a colour lerp on a MeshBasicMaterial (no emissive); Mrs. Oyelaran\'s bubble once a morning within 6 m and not beyond; (repair, H4) a read before 10:30 of yesterday\'s crossed card leaves the new card unread: it pulses and the read keeps its lead',
 3:'3. card-things: cardFor40 pure and a card on every day from 5 to 60 for an eager household (the noon chain played too); never the same owner twice running, never the owner or area of the thing that comes out at noon that day; a household that leaves the noon thing out still gets a card on each of thirty days, and a record with nothing left to pass still gives one; Today never says new notices are up for a card from an earlier day; every spot 2.2 m from the neighbours\' morning and afternoon places (the dropped spots recorded) and every area keeps one; the again cycle after ten with the "again" words, each thing in its second area; every spot passes the spot rules and is at least 2.2 m from the noon spot; nothing out before the read; the pick at 1.3 m with lead 0.25; the hand record (not drawn); the give at the live owner with lead 1.1 (v38\'s give and the pot win a tie); thanks, friendship +1, no money, no keepsake; the card crossed; Mrs. Oyelaran after noon in the evening; reloads in up, read, hand, back and crossed; FOUND38.LOST and rotEntry39(7..40) unchanged; (repair, VN-1) every noon thing of the chain left out from day 5 or 9: a card every day to 60, its thing never within 2.2 m of a thing lying out (the bench\'s one spot under the glasses: no spot that day), and the proof that a card always exists (every noon spot with every child\'s spot leaves no item with both areas blocked)',
 4:'4. errand: the notice at 10:30 (the lower card and the panel); not collectable before 12:30; taken at the sender\'s live place, the parcel drawn in a hand apart from v39\'s bag; given at the receiver\'s, offered until 18:00; friendship +1, no money; the 18:00 lapse with its toast after the gist; one a day; never Mrs. Oyelaran, never the card owner as receiver, never the same sender twice running (days 5 to 60); reloads in up and hand; (repair, H7) an errand in hand when the day ends before six lapses then, its toast the next morning',
 5:'5. kids: (repair, VC-6) Mama Nkechi\'s marble line "His feet came home…" only once Emeka has gone home, another while he is still out at the pitch; the children\'s spots (free, level, outside the pitch plus 1 m and the keep region, 2.2 m from every prompt and lost-thing spot, 2.4 m from Aunty Bisi, bare ground, reachable); the leads (to Mama Nkechi below the card thing, the pot and v38\'s give; the child\'s give between v39\'s bag and Play); about one match day in three over days 5 to 60, never within two days; no drop before v40 discovery; on a morning-match day no drop at the morning exit and the drop at 14:00 with the child\'s call and Today\'s line from 14:00; the thing on the sand at once, picked at 1.3 m by keys into the hand (not drawn); given to Emeka at the pitch (his thanks, then the play line; no money); not the next day; the fade exit (Kemi\'s band), never to Mama Nkechi or Mr. Bassey, Kemi asking once the next day and her thanks; Today\'s "still on the sand"; a thing nobody heard fall (a fade exit) told on Today once the child has asked for it; no give during a live match; the call ends a match; Emeka\'s things to Mama Nkechi (her panel, friendship +1, her "again" line the second time); the window\'s close; football\'s save untouched; no say or aff for a child; nothing in FOUND38.LOST or the keepsakes; (repair, H2) the children leaving during the gist (one player home, one at the pitch): the thing drops after it',
 6:'6. gist: no line but a transition tip promises rain tomorrow (every pool, Mallam\'s lines and the cards); the plan pure for every evening 5 to 40 and the transition tip exactly on the evening before each change, naming the coming season; days 5 to 13 played (the card and the errand by keys, a real match daily, a child\'s thing after each): every v40 entry with id equal to v40k and no cat, today or v39, swap40 on every guard replacement, one insert at most and never into eight, at most two v39 lines, script.g39 kept; the skip night (v38\'s once-only football line) untouched; one match line whose facts hold, by the speaker order; the children\'s mention in both forms by the fond adult, the match line moved when it takes the slot; the errand\'s and a card thing\'s mention by the receiver or owner; the match line\'s first claim on the insert over a card thing\'s return, which takes a free reaction when one is left; rain lines only after rain; the transition tip shown and the Menu\'s season the next morning; the stool handed over to Mr. Bassey on a later night through v40\'s copy of script.g39; (repair, VP-1b) the transition tip before the children\'s mention: on a change evening with a child\'s thing lost and no free reaction the tip takes the insert and the mention waits, with one the tip takes the reaction and the mention the insert',
 7:'7. repeats: the long sweep (nights 8 to 40; a mutant\'s rerun 8 to 16), an eager pair and a companion household with a real match every day, before (v40 never discovered) and after (discovered on day 5): per category the lines heard twice within fourteen evenings, under the ceilings of the day-2 sizing run; all lines at most one in five; every first-time retelling and lost tip still told; every replaced v38 line booked in v38\'s said list; every v38 greeting shown within the sweep; gs38-ad-o1 never twice within fourteen evenings; the knees line never outside the rains; the guard\'s pool-dry count and swaps by tier recorded; on the evenings the household fanned Mallam\'s coals a guest\'s Mallam goodbye in place of a plain v38 one, at least four evenings apart and booked in v38\'s said list; (fix round, DOD-F4) the sweep to night 40, nights 29 to 40 at most one in five as well',
 9:'9. chime: with a stand-in sound bus (football\'s): no context made when none exists and nothing sounded; with Sound on two notes reach the master for a v38 thing, a card thing, a child\'s thing and a v39 thing (round two\'s first); nothing for the base\'s morning shell or with Sound off; AUDIO35.played, the five recipes and twins, the cue hooks and the tick hooks unchanged (the chime on the wash shells is cut)',
 10:'10. today-and-log: the hand (board40Hand) folded into v38\'s pocket row, its own row without one; a busy day at 390 px (the hand, the pot, Aunty Bisi\'s evening, the shelf) at four rows with the hand, the pot and Bisi\'s sentence kept; five rows at 1280 px; Today shows the hand; the integrator\'s v40 block outside the gist card when daily-v40.js has it; that block (the integrator\'s part): nothing before v40 is discovered or online, then before the gist card and the chips the board line in its five states (before half past ten, new, read, with you, back), Mallam\'s order and the children\'s line from 14:00 on the morning-match day, three lines at once, and still at 390 px; LOG35.kinds board, kid, mallam once each; the gates tool reads them with no warnings and the same grades',
 12:'12. copy: (repair) no child seller, Mrs. Oyelaran never at home "this afternoon", the v40 wash wordings varied from v38\'s (no "High water tonight. Tomorrow" opening, no five-word run in common); every GIST40.LINES and MALLAM40.LINES line (ids unique, gs40-), the cards (BOARD40.CARDS and GIST40.CARDS: bd40-, standard English with no Pidgin word, "Flat 3" the only digit, LOST cards start "LOST", signed, notices start "NOTICE."), the interface tables and every text rendered in checks 5, 6 and 10: no weekday or month, British spelling, curly apostrophes, no markup, no "at dusk", speech at most 160 characters with no digit (1979 aside) and only the allowed placeholders, cards at most 200, no Aunty or Uncle from a child, no rain tomorrow outside a transition tip; every bubble drawn whole, no line cut off',
 8:'8. mallam: none before v40 discovery; his phases by S.time (10:30-12:00 morning, 17:00 the fan open at once, 17:30 self-lit when unfanned, seated during a visit, after to 22:00), jumps snap; the order (no money, kept; a round before the gist brings another line and the order stays kept; after the gist "Your two sticks are ready." once within 4 m and not beyond; the kept order\'s line on a round after the gist, also one bought just before ten; lapsed at 22:00); the fan beat: the glow rises with presses and sinks without, "Turn the sticks" for the player not fanning (after the first turn never for the one fanning), the first stick after the hold and two turns, 12 to 15 s of S.time for one player under the bot and at most 15 s for two, at most 15 s for one human pressing four times a second (a press in the pose kept); the taste once to each helper, no money; Aunty Bisi\'s buy wins in her stroll and at her stop where it comes before the base round, and elsewhere at her stop the fan takes the base round\'s place ((-2.85, 10.86), (-3.0, 10.6), (-3.3, 10.3)), Act there never buying the base round; the fan beats the base suya prompt at the fan point; seated at (-4.2, 13.0) during a visit; hidden at a party, online, on Sleep and on the v35 evening\'s day; the walk-in line clear and south of the ball; built in quiet40; the base round still works and no v40 ACT_HOOKS entry mentions suya; (repair) H1: a kept order always collectable after the gist ("Collect your two sticks, ₦2,000" ahead of the base round: a round at 18:05 before the gist, a purse that cannot pay, the gist skipped: from ten, while he stays until half past ten); a round just before ten with no order brings his line; VP-3: a pair where only one presses finishes within 15 s; H5: same-frame presses open one order panel with his name; H6: a reload mid-beat keeps who fanned; H9: an afternoon round while he is away brings no line at five; VP-2: "Your two sticks are ready." only once his bubble is drawn for the player who came near (walks from the rail side at 1280 x 800 and at 390 x 844: never while his bubble point is outside that player\'s camera, always before the fan point); H3: no panel opens by itself at the beat\'s end (the taste is the "Taste the first stick" prompt, a press still coming in the first 0.8 s opens nothing, the player\'s own Act opens the panel)',
 11:'11. save-modes-and-cost: v35, v36, v37, v38 and v39 saves load, run 60 frames and save with the keys of S and S.life unchanged and no G.b40; a v40 save loads in the v39 build (a copy without the v40 tags) with b40 kept; stripState has no life.gist38; online no v40 object, offline back; no v40 object after newgame, newconfirm, an enterWorld into day 2 and going online, and the scene count as without v40; no Math.random call in v40\'s builds (cards, thing, glint, parcel, bubbles, Mallam, stool, glow, fan); no wall-clock or Math.random read by board-v40.js or mallam-v40.js; an inert frame and a frame with the card up: no blocked() or levelAt() call, no new object; (repair, H8) the question alone (newconfirm, then "No, keep it") changes nothing, mid fan beat too'};
const ORDER=[1,2,3,4,5,6,7,8,9,10,11,12];
// one-place changes, each of which must turn its check red
const MUTANTS=[
 {name:'M1 gistSave40(true) without a read (in the step)',check:1,file:'board-v40.js',find:'if(B.t<B.checkAt)return;B.checkAt=B.t+0.25;boardCheck40();};',replace:'if(B.t<B.checkAt)return;B.checkAt=B.t+0.25;gistSave40(true);boardCheck40();};'},
 {name:'M2 the world card with layer 2 closed (v38 discovered, day 7, no G.b39)',check:1,file:'board-v40.js',find:'return S.day>=BOARD40.GATE_DAY;}',replace:'return true;}'},
 {name:'M3 the openBoard wrapper bypasses the real openPanel (TUNE\'s copyFix lost)',check:2,file:'board-v40.js',find:'caught=at>=0?caught.slice(0,at+5)+html40+caught.slice(at+5):html40+caught;openPanel(caught);}',replace:'caught=at>=0?caught.slice(0,at+5)+html40+caught.slice(at+5):html40+caught;panel.innerHTML=caught;ov.classList.add(\'on\');}'},
 {name:'M4 discovery on a read before 10:30',check:2,file:'board-v40.js',find:'if(!b){if(!(S.time>=BOARD40.UP)&&!(BOARD40.flags.now===S.day))return null;',replace:'if(!b){'},
 {name:'M5 the card mesh built outside quiet40',check:11,file:'board-v40.js',find:'W.upper=quiet40(()=>boardCardMesh40(upKind,upOwner,B.SLOT.card));',replace:'W.upper=boardCardMesh40(upKind,upOwner,B.SLOT.card);'},
 {name:'M6 cardFor40 allows the noon thing\'s owner',check:3,file:'board-v40.js',find:'(pass<1&&t.owner===noon.owner)||',replace:''},
 {name:'M7 the card thing out before the card is read',check:3,file:'board-v40.js',find:"b.card={day:S.day,id:pick.id,cycle:pick.cycle,state:'up',spot:null};owner=B.THINGS[pick.id].owner;",replace:"b.card={day:S.day,id:pick.id,cycle:pick.cycle,state:'read',spot:cardSpot40(S.day,pick.id,pick.cycle)};owner=B.THINGS[pick.id].owner;"},
 {name:'M8 the card thing\'s give pays money',check:3,file:'board-v40.js',find:"try{aff(th.owner,1);}catch(e){}boardLog40('board','back '+c.id);",replace:"try{aff(th.owner,1);S.money+=500;}catch(e){}boardLog40('board','back '+c.id);"},
 {name:'M9 the card thing written into FOUND38.LOST',check:3,file:'board-v40.js',find:"c.state='hand';c.by=i;boardDropThing40();",replace:"c.state='hand';c.by=i;FOUND38.LOST.push({id:'card40-'+c.id,owner:th.owner,spots:[]});boardDropThing40();"},
 {name:'M10 the errand collectable before 12:30',check:4,file:'board-v40.js',find:"if(E.state==='up'&&S.time>=B.ERRAND.from){",replace:"if(E.state==='up'){"},
 {name:'M11 the parcel not removed at the 18:00 lapse',check:4,file:'board-v40.js',find:"key=er&&er.e.state==='hand'&&S.time<BOARD40.ERRAND.giveBy?",replace:"key=er&&(er.e.state==='hand'||er.e.state==='lapsed')?"},
 {name:'M34 cardFor40 without its last passes (DOD-F1: a day without a card)',check:3,file:'board-v40.js',find:'for(const pass of [0,1,2,3]){',replace:'for(const pass of [0]){'},
 {name:'M34b the second half of M34: no pass 3 or 4',with:'M34',file:'board-v40.js',find:' for(const id of cardOrder40(c))if(!C.done.includes(id)&&!C.ahead.includes(id)&&far(id,c+1))return {id,cycle:c+1,ahead:true,skip:true,pass:4};\n',replace:'\n'},
 {name:'M42 the board\'s read loses to talking to Mrs. Oyelaran (S9)',check:2,file:'board-v40.js',find:'READ_LEAD:0.1,',replace:'READ_LEAD:-0.1,'},
 {name:'M43 card spots beside a neighbour\'s place (S10)',check:3,file:'board-v40.js',find:'NPC_R:2.2,',replace:'NPC_R:0,'},
 {name:'M48 the again card names its area in the first form ("Try near the rocks", DOD-F9)',check:3,file:'board-v40.js',find:'{thing:th.name,area:th.look,Area:boardUp40(th.look)}',replace:'{thing:th.name,area:th.say,Area:boardUp40(th.say)}'},
 {name:'M46 no minimum text height for a bubble (S8)',check:8,file:'board-v40.js',find:'MIN_PX:13,',replace:'MIN_PX:0,'},
 {name:'M47 a bubble not moved off the HUD chips (S7)',check:8,file:'board-v40.js',find:'   [x,y]=boardOffHud40(x,y,hw,hh,top,bot,vp,boardHud40(i));\n',replace:'\n'},
 {name:'M73 a top-level name not ending in 40 again (gistB40w, repair VN-2)',check:12,file:'gist-v40.js',find:'function gistRec40(){',replace:'function gistRec40(){return gistB40w();}\nfunction gistB40w(){'},
 {name:'M51 a straight apostrophe in an area\'s again form (the board\'s strings in check 12)',check:12,file:'board-v40.js',find:"look:'round the Makers’ Yard'",replace:"look:'round the Makers\\' Yard'"},
 {name:'M52 the sketch mark on every card in Ada\'s hand (C16)',check:12,file:'board-v40.js',find:"sk=/See sketch/.test(raw)?' gist40-sketch':''",replace:"sk=hand==='a'?' gist40-sketch':''"},
 {name:'M53 the bubble cut to three lines again (the kept line loses its end)',check:12,file:'board-v40.js',find:'const n=lines.length,',replace:'const n=Math.min(lines.length,3),'},
 {name:'M63 a card thing beside a thing lying out (the 2.2 m rule off, repair VN-1)',check:3,file:'board-v40.js',find:'function cardFar40(s,out){return out.every(',replace:'function cardFar40(s,out){return true||out.every('},
 {name:'M64 a read recorded per day again (a read before 10:30 silences the new card, repair H4)',check:2,file:'board-v40.js',find:'BOARD40.mem.readKey!==boardReadKey40(cn));}',replace:'BOARD40.mem.readDay!==S.day);}'},
 {name:'M67 no lapse when the day ends (the parcel goes silently on Sleep before six, repair H7)',check:4,file:'board-v40.js',find:'try{boardBubblesOff40();boardDayEnd40();}',replace:'try{boardBubblesOff40();BOARD40.mem.lapseToast=null;}'},
 {name:'M31 cardFor40 with no next-cycle fallback (a day without a card)',check:3,file:'board-v40.js',find:'  for(const id of cardOrder40(c+1))if(C.done.includes(id)&&!C.ahead.includes(id)&&ok(id,c+1))return {id,cycle:c+1,ahead:true,pass};}',replace:'}'},
 {name:'M12 a child\'s thing dropped with a synthetic record (no result)',check:5,file:'gist-v40.js',find:"return !!(l&&l.day===day&&typeof l.result==='string'&&Array.isArray(l.scorers));}",replace:"return !!(l&&l.day===day);}"},
 {name:'M13 a child\'s spot at z 13.4 (inside the pitch plus 1 m)',check:5,file:'gist-v40.js',find:'[-24.5,13.9]',replace:'[-24.5,13.4]'},
 {name:'M14 Emeka\'s thing to Mama Nkechi with lead 1.25 (beats v38\'s give)',check:5,file:'gist-v40.js',find:'shopLead:1.05,',replace:'shopLead:1.25,'},
 {name:'M15 say(child, …) called on the thanks',check:5,file:'gist-v40.js',find:"k.state='back';k.backDay=S.day;k.to=k.who;",replace:"k.state='back';k.backDay=S.day;k.to=k.who;try{say(k.who,'');}catch(e){}"},
 {name:'M40 the match line never inserts; the card thing\'s return takes the insert (S5)',check:6,file:'gist-v40.js',find:'[[()=>matchLine40(b,p,sc,used),true],[()=>cardLine40(b,p),true]',replace:'[[()=>matchLine40(b,p,sc,used),false],[()=>cardLine40(b,p),true]'},
 {name:'M41 the child\'s ask leaves the thing unheard (S6)',check:5,file:'gist-v40.js',find:'k.asked=S.day;k.heard=true;',replace:'k.asked=S.day;'},
 {name:'M44 the Mallam goodbye every evening he is fanned (no four-evening spacing, S4)',check:7,short:true,file:'gist-v40.js',find:' if(mallamNight40()&&!mallamByeRecent40(b)){',replace:' if(mallamNight40()){'},
 {name:'M49 the wordings for the information lines off (nights 29 to 40 over one in five, DOD-F4)',check:7,file:'gist-v40.js',find:'if(!s||s.v40k||s.g40pot||s.g40info||!gistHeard40(b,s.id))continue;',replace:'continue;'},
 {name:'M54 the transition tip placed after the line about today again (the day-9 night loses it to the match line, fix round 2)',check:6,file:'gist-v40.js',find:' transTip40();\n // 2. the children\'s mention',replace:' // 2. the children\'s mention'},
 {name:'M54b the second half of M54: the tip\'s call after the today lines',with:'M54',file:'gist-v40.js',find:'\n // 3b. (fix round, S4)',replace:'\n transTip40();\n // 3b. (fix round, S4)'},
 {name:'M71 the children\'s mention before the transition tip again (a change evening loses the tip to the mention, repair VP-1b)',check:6,file:'gist-v40.js',find:' transTip40();\n // 2. the children\'s mention',replace:' // 2. the children\'s mention'},
 {name:'M71b the second half of M71: the tip after the mention',with:'M71',file:'gist-v40.js',find:' const km=kidMention40(b,p);if(km&&!toSlot(km))insert(km)||toRe(km);\n',replace:' const km=kidMention40(b,p);if(km&&!toSlot(km))insert(km)||toRe(km);\n transTip40();\n'},
 {name:'M70 the children\'s exit seen only outside the gist (a thing never dropped when they leave during it, repair H2)',check:5,file:'gist-v40.js',find:"if(F.kids&&Gs.mem.exitOf!==F.kids&&['kemi','emeka']",replace:"if(!gistInGist40()&&F.kids&&Gs.mem.exitOf!==F.kids&&['kemi','emeka']"},
 {name:'M16 the plan wrapper drops script.g39',check:6,file:'gist-v40.js',find:'const sc=p.script.map(s=>Object.assign({},s));sc.g39=p.script.g39;',replace:'const sc=p.script.map(s=>Object.assign({},s));'},
 {name:'M17 a v40 entry carries cat',check:6,file:'gist-v40.js',find:"if(e)return {k,id:e[0],v40k:e[0],text:e[2],info:1};}",replace:"if(e)return {k,id:e[0],v40k:e[0],text:e[2],info:1,cat:'re:'+k};}"},
 {name:'M18 the match line taken on the night v38\'s once-only line is due',check:6,file:'gist-v40.js',find:' if(fbDueNight40(G,p))return null;\n',replace:'\n'},
 {name:'M19 a non-transition line says rain tomorrow',check:6,file:'gist-v40.js',find:"'Good night. Keep your feet dry. That is advice from a man with old shoes.'",replace:"'Rain tomorrow, my knees say.'"},
 {name:'M20 the plan wrapper writes G.b40.heard',check:6,file:'gist-v40.js',find:' sc.g40=meta;\n return Object.assign',replace:" sc.g40=meta;b.heard['gs40-m20']=S.day;\n return Object.assign"},
 {name:'M21 the repeat guard swaps a told:<id> first retelling (the slot always replaceable)',check:7,short:true,file:'gist-v40.js',find:"const slot=ti>=0&&(GIST40.REPEATABLE.includes(sc[ti].id)||GIST40.REPEATABLE.includes(String(sc[ti].today)))&&!sc[ti].v39k?ti:-1;",replace:'const slot=ti>=0?ti:-1;'},
 {name:'M22 HEARD_NIGHTS 3 instead of 13',check:7,short:true,file:'gist-v40.js',find:'HEARD_NIGHTS:13,',replace:'HEARD_NIGHTS:3,'},
 {name:'M29 the swap40 booking skipped (v38\'s greeting rotation frozen)',check:7,short:true,file:'gist-v40.js',find:'if(s.swap40&&s.swap40.cat&&s.swap40.id)swapBook40(G,String(s.swap40.cat),s.k,s.swap40.id);',replace:''},
 {name:'M23 Mallam standing at his spot (not seated, not gone) during a visit',check:8,file:'mallam-v40.js',find:"if(ph==='seated'){r.mode='sit';mallamSit40(M.seat[0],M.seat[1],Math.PI/2);return;}",replace:"if(ph==='seated'){r.mode='stand';mallamPlace40(M.spot[0],M.spot[1],Math.PI);return;}"},
 {name:'M24 the fan\'s lead 0.35 (beats Aunty Bisi\'s buy from the south)',check:8,file:'mallam-v40.js',find:'reach:1.2,fanReach:1.6,orderReach:1.6,fanLead:0.05,',replace:'reach:1.2,fanReach:1.6,orderReach:1.6,fanLead:0.35,'},
 {name:'M25 the taste spends money',check:8,file:'mallam-v40.js',find:'m.tasted=S.day;\n',replace:'m.tasted=S.day;spend(500);\n'},
 {name:'M30 an ACT_HOOKS entry for suya (never reached; his line missing on the round)',check:8,file:'mallam-v40.js',find:"if(MALLAM40.on&&typeof ACT_HOOKS!=='undefined')ACT_HOOKS.push(function(i,kind,arg){return mallamAct40(i,kind,arg);});",replace:"if(MALLAM40.on&&typeof ACT_HOOKS!=='undefined')ACT_HOOKS.push(function(i,kind,arg){if(kind==='suya'){mallamSuyaLine40=1;}return mallamAct40(i,kind,arg);});var mallamSuyaLine40=0;"},
 {name:'M30b the second half of M30: the flag watch taken out',with:'M30',file:'mallam-v40.js',find:' mallamSuyaWatch40(ph,g);}',replace:'}'},
 {name:'M32 the fan offered at Aunty Bisi\'s stop where her buy comes first',check:8,file:'mallam-v40.js',find:'dd<M.fanReach&&!mallamBisiFirst40(list,dd)){',replace:'dd<M.fanReach){'},
 {name:'M33 the fan hidden by a 2.4 m radius round Aunty Bisi at her stop (the base round at the stall\'s front, S1)',check:8,file:'mallam-v40.js',find:'dd<M.fanReach&&!mallamBisiFirst40(list,dd)){',replace:"dd<M.fanReach&&!(BISI39.run.phase==='stop'&&BISI39.world.fig&&Math.hypot(p.g.position.x-BISI39.world.fig.position.x,p.g.position.z-BISI39.world.fig.position.z)<=2.4)){"},
 {name:'M35 the kept order\'s line before the gist (DOD-F5)',check:8,file:'mallam-v40.js',find:'if(m&&m.order&&m.kept!==S.day&&mallamHandOver40()){m.kept=S.day;',replace:'if(m&&m.order&&m.kept!==S.day){m.kept=S.day;'},
 {name:'M36 no flag watch at ten (a round bought just before ten loses his line)',check:8,file:'mallam-v40.js',find:'if(r.linger){if(M.t<r.linger)return;}else if(mallamOverlay40())return;else if(mallamSuyaWatch40(r.phase,W.fig)){r.linger=M.t+M.LINGER;return;}',replace:''},
 {name:'M37 no "Your two sticks are ready." after the gist',check:8,file:'mallam-v40.js',find:"r.ready=1;bubble40(mallamLine40('ready'),3600,g,M.READY_Y);",replace:'r.ready=1;'},
 {name:'M38 a press during the fan pose dropped (S2)',check:8,file:'mallam-v40.js',find:"if(r.pose[i]>M.t){r.buf[i]='fan';return;}",replace:'if(r.pose[i]>M.t)return;'},
 {name:'M39 the turn offered to the fanner after the first turn (DOD-F7)',check:8,file:'mallam-v40.js',find:'r.turns>0?(!(two&&me)||lone):',replace:'r.turns>0?true:'},
 {name:'M45 Mallam back behind his stall at (-3, 13.2), out of the desk cameras (S3)',check:8,file:'mallam-v40.js',find:'spot:[-1.8,12.4],',replace:'spot:[-3.0,13.2],'},
 {name:'M50 his name line with a sentence the owner did not see (C4)',check:8,file:'mallam-v40.js',find:"'Sannu. My name is Sani. Everybody calls me Mallam.'",replace:"'Sannu. My name is Sani. Everybody calls me Mallam. You can call me either.'"},
 {name:'M60 no collection of the kept order (the base round\'s one per sitting refuses it, repair H1)',check:8,file:'mallam-v40.js',find:" if((ph==='after'||ph==='lit')&&dd<M.orderReach&&mallamCollectable40(m))list.push(",replace:" if(false&&(ph==='after'||ph==='lit')&&dd<M.orderReach&&mallamCollectable40(m))list.push("},
 {name:'M61 the collection on credit (no purse test, repair H1)',check:8,file:'mallam-v40.js',find:"if(!(S.money>=2000)){try{if(typeof toast==='function')toast('Not enough in the purse');}catch(e){}return;}",replace:''},
 {name:'M72 no stay after ten for a waiting order (a skipped gist never hands it over, repair H1)',check:8,file:'mallam-v40.js',find:'hold:0.5,',replace:'hold:0,'},
 {name:'M55 "Your two sticks are ready." to a player within 4 m whatever his camera shows (unseen from the rail side, repair VP-2)',check:8,file:'mallam-v40.js',find:'return boardSeen40(cam,c,',replace:'return true||boardSeen40(cam,c,'},
 {name:'M56 the taste panel opened by itself at the beat\'s end again (under both thumbs at 390 x 844, repair H3)',check:8,file:'mallam-v40.js',find:"if(M.world.fig)bubble40(mallamLine40('going'),2600,M.world.fig,2.1);mallamSave40();}}",replace:"if(M.world.fig)bubble40(mallamLine40('going'),2600,M.world.fig,2.1);mallamSave40();mallamTastePanel40();}}"},
 {name:'M57 no pause after the beat (a fanning tap still coming opens the taste panel, repair H3)',check:8,file:'mallam-v40.js',find:'TASTE:{cheer:4,energy:5,pause:0.8,hush:2.0},',replace:'TASTE:{cheer:4,energy:5,pause:0,hush:2.0},'},
 {name:'M58 "His feet came home and his marble stayed out to play." while Emeka is still out at the pitch (repair VC-6)',check:5,file:'gist-v40.js',find:"if(id==='marble'){const c=kidChild40('emeka');",replace:"if(false){const c=kidChild40('emeka');"},
 {name:'M59 a child seller in Mr. Bassey\'s wash line again (repair VC-1)',check:12,file:'gist-v40.js',find:'In my day we threaded them into necklaces.',replace:'In my time the children sold them to visitors.'},
 {name:'M74 Mrs. Oyelaran wiping the rail "this afternoon" while she is out (repair VC-4)',check:12,file:'gist-v40.js',find:'I wiped it at six, when I came in.',replace:'I wiped it this afternoon.'},
 {name:'M75 Mrs. Oyelaran\'s wash wording a near copy of v38\'s again (repair VC-3)',check:12,file:'gist-v40.js',find:"'The rains have filled the lagoon, and it climbs higher tonight. I am told there will be shells tomorrow afternoon. Wipe your feet when you come back.'",replace:"'High water tonight. Tomorrow afternoon there will be shells along the water’s edge. Wipe your feet when you come back.'"},
 {name:'M62 the lone fanner never offered the second turn (a pair where one presses never finishes, repair VP-3)',check:8,file:'mallam-v40.js',find:'fanner:1.0,lone:2.0}',replace:'fanner:1.0,lone:999}'},
 {name:'M65 the order panel opened twice by same-frame presses (the name line spent on the hidden one, repair H5)',check:8,file:'mallam-v40.js',find:"if(M.run.phase!=='morning'||mallamOverlay40())return;const named",replace:"if(M.run.phase!=='morning')return;const named"},
 {name:'M66 the helpers overwritten at the beat\'s end (a reload loses who fanned before it, repair H6)',check:8,file:'mallam-v40.js',find:'m.fanned=[...new Set((m.fanned||[]).concat(r.fanned))];',replace:'m.fanned=r.fanned.slice();'},
 {name:'M69 the suya flags not kept current while he is away (an afternoon round brings his line at five, repair H9)',check:8,file:'mallam-v40.js',find:'  if(t>=M.morning[1]&&t<M.arrive&&r.day===S.day)r.suya=mallamFlagsNow40();\n',replace:'\n'},
 {name:'M68 the teardown on the question (newconfirm) again (\"No, keep it\" resets the beat, repair H8)',check:11,file:'mallam-v40.js',find:"{for(const n of ['newgame']){const prev=ACTIONS[n];if(typeof prev!=='function')continue;\n ACTIONS[n]=function(){try{mallamTeardown40();}",replace:"{for(const n of ['newgame','newconfirm']){const prev=ACTIONS[n];if(typeof prev!=='function')continue;\n ACTIONS[n]=function(){try{mallamTeardown40();}"},
 {name:'M81 Ada\'s catfish ask a near copy of v38\'s again (repair 3 R3-3)',check:12,file:'gist-v40.js',find:"'Catfish like the dark, and the rains make the evenings darker. Tomorrow after six, catch one and carry it to the courtyard for me.'",replace:"'Catfish like the dark, and the rains make the evenings darker. Tomorrow, fish after six and bring one to me in the courtyard.'"},
 {name:'M82 a pot wording that promises rain on a dry evening again (repair 3 R3-4)',check:12,file:'gist-v40.js',find:"'The rainy season wants soup, my dear.",replace:"'Rain like this wants soup, my dear."},
 {name:'M83 Tunde\'s "The rain came through the courtyard today." on a dry rains evening (no rain gate; repair 3 R3-6, moved in the final touch)',check:12,file:'gist-v40.js',find:"The rain came through the courtyard today. My speakers are under three layers of nylon. They are drier than me.','rain']",replace:"The rain came through the courtyard today. My speakers are under three layers of nylon. They are drier than me.']"},
 {name:'M76 he leaves at half past ten after a late gist (no margin after its end, repair 3 R3-1)',check:8,file:'mallam-v40.js',find:'return Math.max(M.until+M.hold,e!==null?e+M.margin:0);}',replace:'return M.until+M.hold;}'},
 {name:'M77 he leaves at half past ten during a late gist (repair 3 R3-1)',check:8,file:'mallam-v40.js',find:'if(mallamInGist40())return Math.max(M.until+M.hold,S.time+M.margin);',replace:''},
 {name:'M79 the base round bought by an Act straight after the taste (no hush, repair 3 R3-2)',check:8,file:'mallam-v40.js',find:"if(mallamHushed40()&&(ph==='set'||ph==='lit')",replace:"if(false&&(ph==='set'||ph==='lit')"},
 {name:'M80 the name line spent when a touch-opened panel opens, before it is seen (repair 3 R3-2)',check:8,file:'mallam-v40.js',find:'if(mallamHeld40())MALLAM40.run.namePend=S.day;else{',replace:'{'},
 {name:'M78 the touch hold not started again by each press (a thumb tapping on presses Taste unseen, repair 3 R3-2)',check:8,file:'daily-v40.js',find:'if(!dailyPanel40()){D.hold=-1;return;}D.hold=FOUND38.t+D.HOLD;}',replace:'if(!dailyPanel40()){D.hold=-1;return;}}'},
 {name:'M90 Mrs. Oyelaran watching the afternoon match from her window again (repair 4 R4-5)',check:12,file:'gist-v40.js',find:'Football in the compound. Somebody always tells me all about it, whether I ask or not.',replace:'I watched the match from my window. I did not shout. I nearly shouted.'},
 {name:'M91 an again tip that says "today" the evening before (repair 4 R4-3)',check:12,file:'gist-v40.js',find:'Next it will be my {thing}, I can feel it.',replace:'Today it was my {thing}.'},
 {name:'M84 a reload during a late gist loses the kept order (the gistOn mark not read, repair 4 R4-1)',check:8,file:'mallam-v40.js',find:'if(!(m.gistOn===S.day||mallamGistOver40()',replace:'if(!(mallamGistOver40()'},
 {name:'M85 no mark in his record when a gist starts with the order waiting (repair 4 R4-1)',check:8,file:'mallam-v40.js',find:'try{if(r&&mallamEligible40())mallamGistOn40();}',replace:'try{}'},
 {name:'M86 with no order waiting he leaves at ten in the middle of a late gist (repair 4 R4-2)',check:8,file:'mallam-v40.js',find:'return mallamInGist40()?Math.max(M.until,S.time+M.margin):M.until;',replace:'return M.until;'},
 {name:'M87 he vanishes from his stool when a gist past ten ends (no beat at his grill, repair 4 R4-2)',check:8,file:'mallam-v40.js',find:"if(r.phase==='seated'&&!mallamInGist40()){mallamSnap40('after');r.phase='after';r.beat=M.t+M.LINGER;r.lastTime=t;return;}",replace:''},
 {name:'M88 "Your two sticks are ready." by boardSeen40\'s 0.1 margin again (said at 844 x 390 where it cannot show, repair 4 R4-6)',check:8,file:'mallam-v40.js',find:'return boardSeen40(cam,c,x,y+R-0.7,z)&&mallamInFrame40(cam,c,x,y+R-0.7,z)&&mallamInFrame40(cam,c,x,y+R,z);',replace:'return boardSeen40(cam,c,x,y+R-0.7,z);'},
 {name:'M92 the wet match lines on the day\'s rain alone again (a morning match before the rain, repair 5 R5-1)',check:12,file:'gist-v40.js',find:'wet:gistWet40(),',replace:'wet:gistRained40(),'},
 {name:'M93 no record of when the match ended (football\'s end event not read, repair 5 R5-1)',check:6,file:'gist-v40.js',find:"if(GIST40.on&&typeof football37On==='function')football37On('end',",replace:"if(false)football37On('end',"},
 {name:'M94 Mrs. Oyelaran\'s match news pinned to six o\'clock again (repair 5 R5-2)',check:12,file:'gist-v40.js',find:"'The street has told me already: you won.",replace:"'The street told me before I reached the gate at six: you won."},
 {name:'M95 Mrs. Oyelaran claiming the ball touched her window today again (repair 5 R5-2)',check:12,file:'gist-v40.js',find:"'One day that ball will find my window. Once is a game.",replace:"'The ball touched my window once today. Once is a game."},
 {name:'M96 a general (hearsay) match line by Mr. Bassey, who watched from the touchline (repair 5)',check:12,file:'gist-v40.js',find:"const e=p.guests[1]!=='bassey'?pick(L.g,9):null;",replace:'const e=pick(L.g,9);'},
 {name:'M97 an again tip in today\'s season wording on the evening before the season changes (repair 5)',check:12,file:'gist-v40.js',find:'seT=gistSeason40(S.day+1)===se0?se0:null,',replace:'seT=se0,'},
 {name:'M89 the touch hold not shown (buttons never dimmed, repair 4 R4-7)',check:8,file:'daily-v40.js',find:'dailyDim40();return r;',replace:'return r;'},
 {name:'M26 the chime calls AUDIO35.play()',check:9,file:'daily-v40.js',find:'DAILY40.n40.chime++;',replace:"DAILY40.n40.chime++;AUDIO35.play('catch');"},
 {name:'M27 the chime sounds with Sound off',check:9,file:'daily-v40.js',find:'AUDIO35.master&&typeof AUDIO35.on===\'function\'&&AUDIO35.on()?AUDIO35:null;}',replace:'AUDIO35.master?AUDIO35:null;}'},
 {name:'M28 Today\'s board line pushed into the gist card\'s rows (dropped at the cap)',check:10,file:'daily-v40.js',find:"if(typeof todayHTML34==='function'){const prevToday40=todayHTML34;",replace:"if(typeof gistTodayRows38==='function'){const prevRowsM28=gistTodayRows38;gistTodayRows38=function(){const rows=prevRowsM28.apply(this,arguments);try{const b=board40Today();if(b&&Array.isArray(rows)){rows.push({k:'board',html:b.html});return rows.slice(0,typeof innerWidth!=='undefined'&&innerWidth<=480?4:5);}}catch(e){}return rows;};}if(false){const prevToday40=todayHTML34;"}];
const TAGS40=[/<script type="text\/javascript" src="src\/board-v40\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/mallam-v40\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/gist-v40\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/daily-v40\.js"><\/script>\n?/];
const TAGS39=[/<script type="text\/javascript" src="src\/seller-v39\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/gist-v39\.js"><\/script>\n?/];
const TAGS38=[/<script type="text\/javascript" src="src\/found-v38\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/gist-v38\.js"><\/script>\n?/];
const strip=(html,tags)=>{let o=html;for(const T of tags)o=o.replace(T,'');return o;};

// a copy of dist with index.html changed by htmlFn and the named src files by srcFns (everything else linked)
function variantDir(htmlFn,srcFns){const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd40-gist-'));srcFns=srcFns||{};
 for(const f of ['assets','data'])if(fs.existsSync(path.join(GAME,f)))fs.symlinkSync(path.join(GAME,f),path.join(d,f));
 fs.mkdirSync(path.join(d,'src'));for(const f of fs.readdirSync(path.join(GAME,'src'))){if(srcFns[f]){fs.writeFileSync(path.join(d,'src',f),srcFns[f](fs.readFileSync(path.join(GAME,'src',f),'utf8')));continue;}fs.symlinkSync(path.join(GAME,'src',f),path.join(d,'src',f));}
 fs.writeFileSync(path.join(d,'index.html'),htmlFn?htmlFn(fs.readFileSync(path.join(GAME,'index.html'),'utf8')):fs.readFileSync(path.join(GAME,'index.html'),'utf8'));return d;}
// the subset copies the v35 harnesses make (bare -v35 tags after the cut removed; typed tags stay), optionally without the v40 tags
function subsetDir40(last,noV40){const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd40-sub-'));
 for(const f of ['assets','src','data'])if(fs.existsSync(path.join(GAME,f)))fs.symlinkSync(path.join(GAME,f),path.join(d,f));
 let html=fs.readFileSync(path.join(GAME,'index.html'),'utf8'),cut=false;
 for(const [tag,src] of [...html.matchAll(/<script src="([^"]+-v35\.js)"><\/script>\n?/g)]){if(cut)html=html.replace(tag,'');if(src.endsWith('/'+last))cut=true;}
 if(!cut){fs.rmSync(d,{recursive:true,force:true});throw new Error('subset: '+last+' not found');}
 if(noV40)html=strip(html,TAGS40);fs.writeFileSync(path.join(d,'index.html'),html);return d;}

// the world of verify-gist-v39.cjs (copied: the bench's world, a local pair on day 2 with the sofa placed, and the harness helpers inside the game)
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
async function world40(){const h=await world();const {run}=h;
 run(`var hxDirect40={pn:0,dn:0,mr:0};var hxFrom40=()=>{const s=String(new Error().stack||'').split('\\n');return !!(s[3]&&/(board|mallam)-v40\\.js/.test(s[3]));};
 {const pn=performance.now;performance.now=function(){if(hxFrom40())hxDirect40.pn++;return pn.apply(this,arguments);};const dn=Date.now;Date.now=function(){if(hxFrom40())hxDirect40.dn++;return dn.apply(this,arguments);};}
 {const rc=hxReclock;hxReclock=function(){const r=rc.apply(this,arguments);const m=Math.random;Math.random=function(){if(hxFrom40())hxDirect40.mr++;return m.apply(this,arguments);};return r;};}
 var hxCost40={in:0,b:0,l:0};
 if(typeof BOARD40!=='undefined'){
  for(const n of ['boardCheck40','boardRead40','boardPick40','boardGive40','boardTake40','boardErrGive40','bubble40','mallamCheck40','mallamBuild40','mallamTastePanel40']){const f=globalThis[n];if(typeof f==='function')globalThis[n]=function(){hxQC.in++;try{return f.apply(this,arguments);}finally{hxQC.in--;}};}
  for(const O of [BOARD40,typeof MALLAM40!=='undefined'?MALLAM40:null]){if(!O||typeof O.step!=='function')continue;const st=O.step;O.step=function(){hxCost40.in++;hxQC.in++;try{return st.apply(this,arguments);}finally{hxCost40.in--;hxQC.in--;}};}
  for(const n of ['boardHot40','mallamHot40']){const f=globalThis[n];const k=HOTSPOT_HOOKS.indexOf(f);if(k>=0){HOTSPOT_HOOKS[k]=function(){hxCost40.in++;try{return f.apply(this,arguments);}finally{hxCost40.in--;}};}}
  const bl=blocked;blocked=function(){if(hxCost40.in)hxCost40.b++;return bl.apply(this,arguments);};const lv=levelAt;levelAt=function(){if(hxCost40.in)hxCost40.l++;return lv.apply(this,arguments);};}
 var hxTag40=()=>{const out=[];scene.traverse(o=>{if(o.userData&&o.userData.gist40)out.push(o.userData.gist40);});return out.sort();};
 var hxB40=()=>(S&&S.life&&S.life.gist38&&S.life.gist38.b40)||null;
 var hxM=()=>{const M=typeof MALLAM40!=='undefined'?MALLAM40:null;if(!M)return null;const g=M.world.fig;return {vis:!!(g&&g.visible&&g.parent===scene),x:g?Math.round(g.position.x*1000)/1000:null,z:g?Math.round(g.position.z*1000)/1000:null,sit:!!(g&&g.sitting),phase:M.run.phase,mode:M.run.mode,glow:Math.round(M.run.glow*1000)/1000};};`);
 return h;}

const r3=v=>Math.round(v*1000)/1000;
// the spot, route and fan-zone probe (spec §4, §5.3, §11.2, §18.1 day 1): every card thing's spot in both areas free at PR + 0.5 and level, not in
// a flat, at least 2.2 m from every prompt the base, v38, v39 and v40 put in the world (the noon things' own spots are their list-mates: checked
// day by day in check 3), outside the gist's guest patch, at least 2.4 m from Aunty Bisi's route and rail spot; Mallam's spot, seat and fan point
// free; his walk-in line clear at r 0.3 every 0.1 m and south of the household ball; the fan zone (1.2 m of the fan point) apart from Bisi's stop
function probe(J){return J(`(()=>{const B=BOARD40,M=MALLAM40,out={areas:{},bad:[],mallam:{}};const free=(x,z,r)=>!blocked(x,z,r,{lvl:0,noCrate:true})&&Math.abs(levelAt(x,z))<=0.09;
 const PROMPTS=[[0,-5.5,'board'],[-3,11.2,'suya'],[3,12.5,'photospot'],[12.4,14.2,'fish'],[26.4,0,'popup'],[-22,-4.0,'garden'],[0,-17.7,'tailor'],[-6,-15.2,'ws ada'],[6,-15.2,'ws tunde'],[-6,-19.3,'ws bassey'],[6,-19.3,'ws kitchen']];
 for(const st of STALLS){const dir=st.z<0?1:-1;PROMPTS.push([st.x,st.z+dir*1.1,'stall '+st.id]);}
 const R=BISI39.ROUTE,T=BISI39.STROLL,bisi=[];for(let x=T.x0;x<=T.x1+1e-9;x+=0.25)bisi.push([x,T.z]);bisi.push(R.rail,R.stop);
 const NPCP=[];for(const k in NPC_SPOTS)for(const sl of ['morning','afternoon']){const q=NPC_SPOTS[k][sl];if(q)NPCP.push([q[0],q[1],k+' '+sl]);}out.dropped=[];
 for(const a in B.AREAS){const L=cardSpots40(a,out.dropped);out.areas[a]=L.length;if(!L.length)out.bad.push(a+': no spot');
  for(const s of L){const tag=a+' ('+s[0]+', '+s[1]+')';if(!free(s[0],s[1],PR+0.5))out.bad.push(tag+' not free at PR + 0.5');if(inFlat(s[0],s[1]))out.bad.push(tag+' in a flat');
   for(const p of PROMPTS)if(Math.hypot(p[0]-s[0],p[1]-s[1])<2.2)out.bad.push(tag+' within 2.2 m of '+p[2]);
   for(const p of B.AVOID)if(Math.hypot(p[0]-s[0],p[1]-s[1])<2.2)out.bad.push(tag+' within 2.2 m of a v40 point');
   for(const p of NPCP)if(Math.hypot(p[0]-s[0],p[1]-s[1])<2.2)out.bad.push(tag+' within 2.2 m of '+p[2]);
   if(s[0]>=-9.8&&s[0]<=-1.4&&s[1]>=7.8&&s[1]<=9.2)out.bad.push(tag+' in the guest patch');
   // the street's spots are v38's wrapper spots, on her route since v39 (v39's own again round puts the wrapper back there): recorded, not dropped
   if(bisi.some(p=>Math.hypot(p[0]-s[0],p[1]-s[1])<2.4)){if(a==='street')(out.known||(out.known=[])).push(tag+' within 2.4 m of Aunty Bisi\\'s route (v38\\'s wrapper spot)');else out.bad.push(tag+' within 2.4 m of Aunty Bisi\\'s route');}}}
 for(const [n,p] of [['spot',M.spot],['seat',M.seat],['fanAt',M.fanAt]]){out.mallam[n]=free(p[0],p[1],0.3);if(!out.mallam[n])out.bad.push('Mallam '+n+' blocked');}
 let wb=0,south=true;const W=M.walk;for(let k=1;k<W.length;k++){const a=W[k-1],b=W[k],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/0.1));
  for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n;if(blocked(x,z,0.3,{lvl:0,noCrate:true}))wb++;
   const H=typeof FOOTBALL37!=='undefined'?FOOTBALL37.HOME:[0,13.5];if(Math.hypot(x-H[0],z-H[1])<0.6)south=false;}}
 out.mallam.walkBlocked=wb;out.mallam.southOfBall=south;if(wb)out.bad.push('the walk-in line blocked at '+wb+' samples');if(!south)out.bad.push('the walk-in line within 0.6 m of the household ball');
 out.mallam.fanToStop=Math.round(Math.hypot(M.fanAt[0]-R.stop[0],M.fanAt[1]-R.stop[1])*100)/100;
 return out;})()`);}

function checks(h,only,side){const {run}=h,J=c=>JSON.parse(run('JSON.stringify((()=>{const v=('+c+');return v===undefined?null:v;})())'));const out=[];
 const check=(n,fn)=>{if(only&&!only.includes(n))return;const name=NAMES[n];
  try{const info=fn();out.push({n,name,passed:true,info});}catch(e){const m=String(e&&e.message||e).replace(/(?:\/[\w.@~-]+){2,}(?::\d+)*/g,'…').split('\n'),gen=e&&e.generatedMessage&&'actual' in e?' '+JSON.stringify(e.actual)+' vs '+JSON.stringify(e.expected):'';out.push({n,name,passed:false,failure:(m[0]+gen).slice(0,400)+(process.env.DEBUG40?' @@ '+String(e&&e.stack).split('\n').slice(1,4).join(' | '):'')});}
  try{run("hxNoKeys();hxOverlay(false);hxDT=1000/30;NET.on=false;NET.isHost=true;AI.on=false;closePanel();S.party=null;if(typeof FOOTBALL37!=='undefined'){FOOTBALL37.lastMatchDay=0;if(!FOOTBALL37.kids&&FOOTBALL37.state==='idle')FOOTBALL37.state='off';}if(typeof BISI39!=='undefined')BISI39.OFF.rule='hash';");}catch(e){}};

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

 /* ======================================================================================================================================
    Engineer A's checks: 1, 2, 3, 4, 8, 11
    ====================================================================================================================================== */
 // check 1's measures of the inert worlds, taken first, before any other check has touched the world (the runner compares them with the run
 // without v40)
 if(!only||only.includes(1)){try{
   // (a) day 3 at 10:00, no v38
   run('hxFresh(3,10);');const sj=J('JSON.stringify(S)'),ks=J('[Object.keys(S).join(),Object.keys(S.life||{}).join()]');
   const fr=J(`(()=>{let h=2166136261>>>0;const mix=s=>{s=String(s);for(let k=0;k<s.length;k++){h^=s.charCodeAt(k);h=Math.imul(h,16777619)>>>0;}};for(let f=0;f<600;f++){hxFrames(1);mix(v21Dist.map(v=>v.toFixed(4)).join());mix(cams[0].position.toArray().map(v=>v.toFixed(3)).join()+cams[1].position.toArray().map(v=>v.toFixed(3)).join());mix(hotspotCache.map(x=>x?x.label:'').join('|'));}return h.toString(16);})()`);
   run('PH="";openMenu();');const menu=J('PH').replace(/v\d\d-[0-9a-f]{8}/g,'BUILD');run('closePanel();');const today=J('todayHTML34()');const all=JSON.stringify([sj,ks,fr,menu,today]);side.inertA=hash(all)+':'+all.length;
   // (b) v38 discovered, no v39 trigger: days 5 and 7 (layer 2 closed), the board's panel at 11:00 included
   disc();nextday();{const dig=[];dayDigest(dig,'d5');run("S.time=11;hxAt(0,0,-4.6);");frames(2);run("PH='';openBoard();");dig.push(['d5:board',J('panel.innerHTML')]);run('closePanel();');
    const t5=J("typeof hxTag40==='function'?hxTag40().length:0");nextday();nextday();dayDigest(dig,'d7');run("S.time=11;hxAt(0,0,-4.6);");frames(2);run("PH='';openBoard();");dig.push(['d7:board',J('panel.innerHTML')]);run('closePanel();');
    side.inertB=Object.assign(digestOf(dig),{tagged:t5+J("typeof hxTag40==='function'?hxTag40().length:0"),b40:J('!!(hxG()&&hxG().b40)')});}
   // (c) layer 2 open, v40 not discovered: v39 discovered on day 4 (days 6 and 7), and v38 only (days 8 and 9); the card and the bubble may differ
   {run("dispatch('newgame');");disc39();nextday();const dig=[];let cardSeen=0,bub=0;const watch=()=>{if(J("typeof hxTag40==='function'&&hxTag40().includes('card')"))cardSeen++;};
    dayDigest(dig,'b39d6');watch();nextday();dayDigest(dig,'b39d7');watch();
    run("dispatch('newgame');");disc();for(let k=0;k<4;k++)nextday();dayDigest(dig,'b38d8');watch();nextday();dayDigest(dig,'b38d9');watch();
    side.inertC=Object.assign(digestOf(dig),{cardSeen,b40:J('!!(hxG()&&hxG().b40)')});}
   // (d) verify-tune check 12's case: a day-1 AI household's board
   {run("hxReclock();NET.on=false;AI.on=false;_silent=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();dispatch('movein');closePanel();");
    run("PH='';openBoard();");side.tune12=J('panel.innerHTML');run('closePanel();');}}
  catch(e){side.inertA=side.inertA||('error '+String(e&&e.message||e).slice(0,120));side.inertB=side.inertB||{error:String(e&&e.message||e).slice(0,160)};side.inertC=side.inertC||{error:String(e&&e.message||e).slice(0,160)};}}
 // check 11's scene count runs early, in a world no other check has touched: v40 discovered with the card, its thing and Mallam out where v40 is
 // present, then a new day-2 household (homeuse check 6's counter)
 if(!only||only.includes(11)){try{run("dispatch('newgame');");disc();for(let k=0;k<4;k++)nextday();read();run('S.time=10.9;hxAt(0,-3,10.6);');frames(60);
   run("dispatch('newgame');hxFresh(2,10);");frames(30);side.count11=J('hxCount()');}catch(e){side.count11='error '+String(e&&e.message||e).slice(0,100);}}

 check(1,()=>{const R={};assert(has40(),'the module');
  const pins=J(`({tick:TICK_HOOKS.length,cue:CUE35_HOOKS.length,recipes:Object.keys(AUDIO35.recipes),twins:Object.keys(AUDIO35.twins||{}),talk:['tunde','nkechi','ada'].map(k=>LINES35[k].length),evening:Object.keys(LINES35.evening).map(k=>LINES35.evening[k].length),
   short:Object.keys(LINES35.short).length,text:Object.keys(LINES35.text).length,when:Object.keys(WHEN35).length,rows:DAYS35.rows.length,finds:FINDS34.length,
   src:[talk.toString().includes('lines_talk35'),openTalk.toString().includes('life-talk34')&&openTalk.toString().includes('act.before(card)'),finishParty.toString().includes('partyLines35'),ACTIONS.nethost.toString().includes('born35'),setupTouch.toString().includes('actPrimary35')]})`);
  assert.equal(pins.tick,17,'TICK_HOOKS');assert.equal(pins.cue,2,'CUE35_HOOKS');assert.deepEqual(pins.recipes,['cast','nibble','bite','catch','water'],'AUDIO35.recipes');assert.deepEqual(pins.twins.slice().sort(),['bite','cast','catch','nibble','water'],'AUDIO35.twins');
  assert.deepEqual(pins.talk,[42,41,41],'LINES35 talk');assert.deepEqual(pins.evening,[4,4,4],'LINES35.evening');assert.equal(pins.short,15,'LINES35.short');assert.equal(pins.text,58,'LINES35.text');
  assert.equal(pins.when,31,'WHEN35');assert.equal(pins.rows,12,'DAYS35.rows');assert.equal(pins.finds,15,'FINDS34');assert.deepEqual(pins.src,[true,true,true,true,true],'the pinned sources');R.pins=pins;
  // (a) compared by the runner; here: nothing of v40's on day 3
  run('hxFresh(3,10);');frames(30);assert.deepEqual(tags(),[],'no v40 object on day 3');assert.equal(J('!!S.life.gist38'),false,'v38 undiscovered');
  // (b) layer 2 closed on days 5 and 7 with v38 alone: nothing in the world, nothing saved (the digests are compared by the runner)
  const ib=side.inertB||{};assert(!ib.error,'the day-5 and day-7 runs: '+ib.error);assert.equal(ib.tagged,0,'no v40 object on days 5 and 7 (layer 2 closed)');assert.equal(ib.b40,false,'no G.b40');
  R.layerClosed={days:[5,7],objects:0,b40:false};
  // (c) layer 2 open, undiscovered: the card was in the world on each of the four days; nothing saved
  const ic=side.inertC||{};assert(!ic.error,'the layer-2 runs: '+ic.error);assert.equal(ic.cardSeen,4,'the world card on days 6, 7 (via v39) and 8, 9 (via v38)');assert.equal(ic.b40,false,'no G.b40 after layer 2 days');
  R.layerOpen={days:{b39:[6,7],b38:[8,9]},card:true,b40:false};
  // the bubble: a player past the board at 10:45 on a layer-2 day (v39 discovered); built once, shown once, timed (3.6 s), taken down; quiet
  disc39();nextday();run('S.time=10.6;hxAt(0,-6,-1);hxAt(1,-8,-10);hxQC.n=0;');frames(10);assert.deepEqual(J('BOARD40.world.live.length'),0,'no bubble before a player comes near');
  assert(tags().includes('card'),'the world card is up at 10:36');const c0=J('(()=>{const m=BOARD40.world.upper.material;return [m.type,m.color.r];})()');
  run('S.time=10.75;hxAt(0,1.5,-1.5);');frames(8);const live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');
  assert.deepEqual(live,['New notices. Kindly read them.'],'Mrs. Oyelaran\'s bubble shown to a player within 6 m');const bub0=J('Object.keys(BOARD40.world.bub).length');
  frames(140);assert.equal(J('BOARD40.world.live.length'),0,'taken down after 3.6 s');run('hxAt(0,4,-6);');frames(10);run('hxAt(0,1.5,-1.5);');frames(30);assert.equal(J('BOARD40.world.live.length'),0,'once a morning');
  assert.equal(J('Object.keys(BOARD40.world.bub).length'),bub0,'one sprite for the text');assert.equal(J('hxQC.n'),0,'no Math.random call in the card and the bubble');assert.equal(J('!!hxB40()'),false,'no G.b40');
  R.bubble={shown:1,ms:3600,down:true,quiet:0};R.card={material:c0[0],pulse:'colour lerp'};
  // (d) verify-tune check 12's board compared by the runner; "Compound meeting this week." in it
  assert(/Compound meeting this week\./.test(side.tune12||''),'TUNE\'s copyFix on the day-1 board');R.tune12='Compound meeting this week.';
  return R;});

 check(2,()=>{const R={};assert(has40(),'the module');
  // via v38 on day 8: nothing before 10:30, not even on a read; the block from 10:30
  run("dispatch('newgame');");disc();for(let k=0;k<4;k++)nextday();assert.equal(J('S.day'),8,'day 8');
  run('S.time=10.2;hxAt(0,0,-4.6);');frames(6);assert.deepEqual(tags().filter(t=>t==='card'),[],'no world card before 10:30');run("PH='';openBoard();");const pre=J('PH');run('closePanel();');
  assert(!/gist40-board/.test(pre),'no v40 block before 10:30');assert.equal(J('!!hxB40()'),false,'no discovery on a read before 10:30');
  run('S.time=10.52;');frames(8);assert(tags().includes('card'),'the world card from 10:30');assert.equal(J('BOARD40.world.lowerKey'),'','no lower card before discovery (no errand yet)');
  // online: no card, no discovery
  run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");frames(8);assert.deepEqual(tags(),[],'online: no v40 object');
  run("PH='';openBoard();");assert(!/gist40-board/.test(J('PH')),'online: the board as it was');run('closePanel();NET.on=false;');assert.equal(J('!!hxB40()'),false,'no discovery online');frames(8);
  // the base part of the panel as the board without v40 (BOARD40.on off for one read gives the base board through the wrapper's pass-through)
  run('BOARD40.on=false;');run("PH='';openBoard();");const baseInner=J('panel.innerHTML'),baseRaw=J('PH');run('closePanel();BOARD40.on=true;');
  const r=read();assert(/<h2>Palm Court noticeboard<\/h2><div class="gist40-board">/.test(r.ph),'the v40 block straight after the heading');assert.equal(r.n,1,'the real openPanel once per read');
  assert.equal(r.inner.replace(/<div class="gist40-board">[\s\S]*?<\/div><\/div>/,''),baseInner,'the base cards, copyFix and the host button as the board without v40');
  assert(/Compound meeting this week\./.test(r.inner),'TUNE\'s copyFix ran');assert.equal(r.ph.replace(/<div class="gist40-board">[\s\S]*?<\/div><\/div>/,''),baseRaw,'the base HTML unchanged');
  const b=B40();assert(b&&b.since===8&&b.via==='b38','discovered via b38 on day 8: '+JSON.stringify(b&&[b.since,b.via]));assert(logHas('board','read '+b.card.id),'the log: board read');
  assert.equal(b.card.state,'read','the card read');R.discovery={via:'b38',day:8,card:b.card.id};
  // at most two world cards, the upper slot 0.40 x 0.20 on a MeshBasicMaterial (no emissive); at most four blocks
  frames(8);const wc=J("(()=>{const W=BOARD40.world;return {n:[W.upper,W.lower].filter(Boolean).length,up:W.upper?[W.upper.geometry.parameters.width,W.upper.geometry.parameters.height,W.upper.material.type,'emissive' in W.upper.material]:null};})()");
  assert(wc.n<=2,'at most two world cards');assert.deepEqual(wc.up.slice(0,3),[0.4,0.2,'MeshBasicMaterial'],'the upper card 0.40 x 0.20, MeshBasicMaterial');assert.equal(wc.up[3],false,'no emissive');
  assert((r.ph.match(/class="gist40-card /g)||[]).length<=4,'at most four panel blocks');
  {const src=fs.readFileSync(path.join(GAME,'src','board-v40.js'),'utf8');assert(!/\.emissive/.test(src),'no emissive read in board-v40.js');}
  // the card given back: crossed at once; through the next change; down at the second
  pickCard(0);const gv=giveCard(0);assert(gv,'the owner was there');frames(10);assert(/^crossed:/.test(J('BOARD40.world.upperKey')),'crossed at once in the world');
  let rr=read();assert(/gist40-crossed/.test(rr.ph),'crossed at once in the panel');
  nextday();run('S.time=11.2;');frames(10);assert.equal(J('hxB40().chg.day'),9,'the 10:30 change on a jump to 11:12');assert.equal(J('hxB40().card.day'),9,'a new card once the last is back');
  assert(/^card:/.test(J('BOARD40.world.upperKey')),'the new card in the upper slot');rr=read();assert(/gist40-crossed/.test(rr.ph),'the crossed card through the next change (in the panel)');
  nextday();run('S.time=10.6;');frames(10);assert.equal(J('hxB40().crossed'),null,'the crossed card down at the second change');assert.equal(J('hxB40().card.day'),9,'the day-9 card stays while its thing is out');
  rr=read();assert(/gist40-still/.test(rr.ph)&&!/gist40-crossed/.test(rr.ph),'"Still lost." and no crossed card');R.cross={atOnce:true,next:true,second:'down',still:true};
  pickCard(0);giveCard(0);
  // the pulse: the colour moves towards white and back while the card is unread; plain once read
  nextday();run('S.time=10.6;hxAt(0,6,-8);');frames(10);assert.equal(J('hxB40().card.state'),'up','a new card, unread');const cols=[];for(let k=0;k<12;k++){frames(6);cols.push(J('BOARD40.world.upper?BOARD40.world.upper.material.color.r:null'));}
  assert(Math.max(...cols)-Math.min(...cols)>0.05,'the colour pulses while unread: '+JSON.stringify(cols.map(r3)));
  // (fix round, S9) the reading spot beside Mrs. Oyelaran: "Read the noticeboard" while the card is unread, not "Talk to Mrs. Oyelaran"
  {assert(settled('oyelaran'),'Mrs. Oyelaran in place');run('hxAt(0,0.15,-4.31,[0,-1]);');frames(2);const oy=J('Math.hypot(npcs.oyelaran.g.position.x-0.15,npcs.oyelaran.g.position.z+4.31)');assert(oy<1.8,'her talk offered here ('+r3(oy)+' m)');
   assert.equal(J('nearest(0)&&nearest(0).id'),'board','the read prompt at (0.15, -4.31) with Mrs. Oyelaran in place: '+J('nearest(0)&&nearest(0).label'));assert.equal(J('nearest(0).label'),'Read the noticeboard','the base label');R.readSpot={at:[0.15,-4.31],oy:r3(oy)};}
  read();frames(6);
  {run('hxAt(0,0.15,-4.31,[0,-1]);');frames(2);assert.equal(J('nearest(0)&&nearest(0).id'),'talk:oyelaran','once read, her talk as before');}const plain=J('BOARD40.world.upper.material.color.r');assert(Math.abs(plain-J('BOARD40.PULSE.plain'))<1e-9,'plain once read');
  pickCard(0);if(!giveCard(0)){run('S.time=18.05;');frames(6);giveCard(0);}
  // Mrs. Oyelaran's bubble: within 6 m, not beyond (the next morning, the card unread)
  nextday();run('S.time=10.6;hxAt(0,0,0.8);');frames(10);assert.equal(J('hxB40().card.state'),'up','a new card, unread');assert.equal(J('BOARD40.world.live.length'),0,'no bubble at 6.3 m');
  run('hxAt(0,0,-0.2);');frames(10);assert.equal(J('BOARD40.world.live.length'),1,'the bubble at 5.3 m');R.bubble={near:5.3,far:6.3};
  // via v39 (bought on day 4): the first read on day 5
  run("dispatch('newgame');");disc39();run('S.time=10.2;hxAt(0,0,-4.6);');frames(10);run("PH='';openBoard();closePanel();");assert.equal(J('!!hxB40()'),false,'no discovery on a read before 10:30 on day 5');
  run('S.time=10.6;');frames(4);read();const b5=B40();assert(b5&&b5.via==='b39'&&b5.since===5,'discovered via b39 on day 5');R.viaB39={day:5};
  // (repair, H4) a read is recorded against the card it showed: a morning read before 10:30 (yesterday's card, crossed out) leaves the new card
  // of 10:30 unread, so it pulses and "Read the noticeboard" keeps its lead beside Mrs. Oyelaran
  {pickCard(0);if(!giveCard(0)){run('S.time=18.05;');frames(6);giveCard(0);}nextday();run('S.time=9.5;hxAt(0,0,-4.6,[0,-1]);');frames(6);run("PH='';openBoard();");const early=J('PH');run('closePanel();');frames(2);
   assert(/gist40-crossed/.test(early),'the early read shows yesterday\'s card crossed out');
   run('S.time=10.6;hxAt(0,6,-8);');frames(10);assert(J('hxB40().card.state')==='up'&&J('hxB40().card.day')===J('S.day'),'today\'s card up at 10:30 after the early read: '+JSON.stringify(card()));
   const c2=[];for(let k=0;k<12;k++){frames(6);c2.push(J('BOARD40.world.upper?BOARD40.world.upper.material.color.r:null'));}assert(Math.max(...c2)-Math.min(...c2)>0.05,'today\'s card pulses after a read of yesterday\'s before 10:30: '+JSON.stringify(c2.map(r3)));
   assert(settled('oyelaran'),'Mrs. Oyelaran in place');run('hxAt(0,0.15,-4.31,[0,-1]);');frames(2);assert.equal(J('nearest(0)&&nearest(0).id'),'board','"Read the noticeboard" keeps its lead after the early read: '+J('nearest(0)&&nearest(0).label'));
   R.earlyRead={pulse:r3(Math.max(...c2)-Math.min(...c2)),lead:'board'};}
  return R;});

 check(3,()=>{const R={};assert(has40(),'the module');
  run("dispatch('newgame');");disc39();read();const lost0=J('FOUND38.LOST.length'),rot0=J('JSON.stringify((()=>{const o=[];for(let i=7;i<=40;i++)o.push(rotEntry39(i));return o;})())');
  // purity: cardFor40 twice, S unchanged
  {const s0=J('JSON.stringify(S)'),a=J('JSON.stringify(cardFor40(S.day))'),b=J('JSON.stringify(cardFor40(S.day))');assert.equal(a,b,'cardFor40 pure');assert.equal(J('JSON.stringify(S)'),s0,'S unchanged by cardFor40');}
  const days=[],errs=[],bad=[],SP=[];let lastOwner=null,lastSender=null,again=0,noonHits=0,ahead=0,keep0=J('JSON.stringify(hxG().keep.keepsake)'),reloads=[];
  const noonNow=()=>J('boardNoon40(S.day)');
  // the noon chain by keys: the thing in the pocket given to its owner when they are there (settled), else the thing out picked up and given
  const tryGive=ow=>{if(!ow||!J(`!!found38Npc('${ow}')`)||!settled(ow)||!J(`!!found38Npc('${ow}')`))return false;giveNow(0,ow);return true;};
  const noonStep=()=>{const own=()=>J('(()=>{const G=hxG(),e=FOUND38.LOST[G.lost.i];return e?e.owner:null;})()');
   if(J("hxG().lost.status==='pocket'")){tryGive(own());return;}if(item()){pickNow(0);tryGive(own());}};
  for(let d=5;d<=60;d++){
   if(d>5){nextday();run('S.time=10.6;');frames(8);read();}
   const c=card(),b=B40();if(!c||c.day!==d){bad.push('day '+d+': no card ('+JSON.stringify(c)+')');continue;}
   const th=J(`cardThing40('${c.id}',${c.cycle})`),noon=noonNow();days.push(c.id);
   if(th.owner===lastOwner)bad.push('day '+d+': '+th.owner+' twice running');lastOwner=th.owner;
   if(noon){noonHits++;if(noon.since===d&&noon.owner===th.owner)bad.push('day '+d+': the noon owner '+noon.owner);if(noon.since===d&&noon.area===th.area)bad.push('day '+d+': the noon area '+noon.area);
    if(noon.spot&&c.spot&&Math.hypot(noon.spot[0]-c.spot[0],noon.spot[1]-c.spot[1])<2.2)bad.push('day '+d+': within 2.2 m of the noon spot');}
   if(c.cycle>=1){again++;const word=J(`cardText40('${c.id}',${c.cycle})`);if(!/^LOST AGAIN:/.test(word))bad.push('day '+d+': not the again words');if(!th.look||!word.includes(th.look)||(th.look!==th.say&&word.includes(th.say)))bad.push('day '+d+': the again card does not name its area in the again form: '+word);
    const exp=J(`BOARD40.THINGS['${c.id}'][${c.cycle%2===1?"'area2'":"'area'"}]`);if(th.area!==exp)bad.push('day '+d+': the area '+th.area+' not '+exp);}
   if((b.cards.ahead||[]).length)ahead++;SP.push(c.spot);
   const er=J('board40Errand(S.day)');if(er){errs.push(er.pair);if(er.receiver===th.owner)bad.push('day '+d+': the errand to the card owner');if(er.sender===lastSender)bad.push('day '+d+': the same sender twice running');
    if(er.sender==='oyelaran'||er.receiver==='oyelaran')bad.push('day '+d+': Mrs. Oyelaran in an errand');lastSender=er.sender;}
   // the first day: nothing out before the read (shown on a later day); the pick at 1.3 m; the hand; the give
   if(d===6){run('hxSave6=1;');}
   pickCard(0);const ow=th.owner;assert.equal(card().state,'hand','in the hand on day '+d);
   if(d===5){assert(!tags().includes('thing'),'the thing is not drawn once picked up');const hand=J('board40Hand()');assert(hand.length===1&&hand[0].kind==='card','the hand record: '+JSON.stringify(hand));
    run('save();S=load();enterWorld();closePanel();');frames(4);assert.equal(card().state,'hand','reload in hand');reloads.push('hand');}
   const money=J('S.money'),aff=J(`S.nb.${ow}.aff`),kp=J('JSON.stringify(hxG().keep)');let gv=giveCard(0);
   if(!gv){run('S.time=18.05;');frames(6);gv=giveCard(0);assert(gv,'Mrs. Oyelaran in the evening on day '+d);R.oyelaranEvening=d;}
   assert.equal(J('S.money'),money,'no money on day '+d);assert.equal(J('JSON.stringify(hxG().keep)'),kp,'no keepsake on day '+d);assert.equal(J(`S.nb.${ow}.aff`)-aff,1,'friendship +1 on day '+d);assert.equal(card().state,'back','back on day '+d);
   if(d===5){assert(/gist40-return/.test(gv.panel)&&/class="card say"/.test(gv.panel),'the thanks panel');run('save();S=load();enterWorld();closePanel();');frames(4);assert.equal(card().state,'back','reload in back');
    assert(J('!!hxB40().crossed'),'reload: crossed');reloads.push('back','crossed');}
   // the noon chain (v38's seven, v39's round two and again): the noon thing picked up and given back when it is out
   run('S.time=12.05;hxAt(1,-8,-10);');frames(10);noonStep();if(J("hxG().lost.status==='pocket'")){run('S.time=18.05;');frames(10);noonStep();}
   run('S.time=21.5;');frames(2);}
  assert.deepEqual(bad.slice(0,8),[],'the card rules over days 5 to 60: '+JSON.stringify(bad.slice(0,8)));assert.equal(days.length,56,'a card on every day from 5 to 60');
  assert(again>=30,'the again cycle after ten: '+again+' again cards');assert(noonHits>=20,'the noon thing out on enough days: '+noonHits);
assert.equal(J('FOUND38.LOST.length')>=lost0,true,'FOUND38.LOST');
  assert(!J("FOUND38.LOST.some(e=>/^card40|^(knob|rose|spoon|pad|block|oil|film|print|pegs|minutes)$/.test(e.id))"),'no card thing in FOUND38.LOST');
  assert.equal(J('JSON.stringify((()=>{const o=[];for(let i=7;i<=40;i++)o.push(rotEntry39(i));return o;})())'),rot0,'rotEntry39(7..40) unchanged');
  R.sweep={days:56,again,noonDays:noonHits,aheadDays:ahead,first10:days.slice(0,10),errands:errs.length};
  // (fix round, S10) every spot 2.2 m from the neighbours' morning and afternoon places, the dropped ones recorded, every area keeps one
  {const pr=probe(J);assert.deepEqual(pr.bad,[],'the spot probe');assert(Object.values(pr.areas).every(n=>n>=1),'every area keeps a spot: '+JSON.stringify(pr.areas));R.spots={areas:pr.areas,dropped:pr.dropped};}

  // up, read and the pick distance, on a fresh day: nothing out before the read; the prompt within 1.3 m only, lead 0.25
  nextday();run('S.time=10.6;hxAt(0,6,-8);');frames(8);assert.equal(card().state,'up','up after the change');assert(!tags().includes('thing'),'nothing out before the read');
  run('save();S=load();enterWorld();closePanel();');frames(4);assert.equal(card().state,'up','reload in up');reloads.push('up');
  read();assert.equal(card().state,'read','read');frames(4);run('save();S=load();enterWorld();closePanel();');frames(6);assert.equal(card().state,'read','reload in read');assert(tags().includes('thing'),'the thing rebuilt after the reload');reloads.push('read');
  const t=thingAt(),b=J(`hxBearing(${t[0]},${t[1]},0.4,1.6)`);run(`hxAt(0,${t[0]+b[0]*1.35},${t[1]+b[1]*1.35});`);frames(2);assert(!cands(0).includes('card40pick'),'no pick prompt at 1.35 m');
  run(`hxAt(0,${t[0]+b[0]*1.25},${t[1]+b[1]*1.25});`);frames(2);assert(cands(0).includes('card40pick'),'the pick prompt at 1.25 m');
  const dist=J(`(()=>{const p=players[0].g.position,list=[],d=(a,b)=>Math.hypot(p.x-a,p.z-b);boardHot40(0,list,d);const e=list.find(x=>x.id==='card40pick');return e?Math.round((d(${t[0]},${t[1]})-e.dist)*1000)/1000:null;})()`);
  assert.equal(dist,0.25,'the pick lead 0.25');R.reloads=reloads;R.pick={reach:1.3,lead:0.25};
  // the give's lead against v38's give at the same owner: v38's (1.2) wins a tie
  // Mrs. Oyelaran's thing picked up after noon: no give while she is out; given in the courtyard after six
  pickCard(0);giveCard(0);let od=0;for(;od<24;od++){nextday();run('S.time=10.6;hxAt(0,6,-8);');frames(10);if(J("BOARD40.THINGS[hxB40().card.id].owner")==='oyelaran')break;read();pickCard(0);if(!giveCard(0)){run('S.time=18.05;');frames(10);giveCard(0);}}
  assert(od<24,'a card of Mrs. Oyelaran\'s');read();run('S.time=12.6;');for(let k=0;k<120&&J("!!found38Npc('oyelaran')");k++)frames(10);pickCard(0);assert.equal(J("!!found38Npc('oyelaran')"),false,'she is out after noon');assert.equal(giveCard(0),null,'no give while she is out');
  run('S.time=18.05;');frames(10);const og=giveCard(0);assert(og&&og.owner==='oyelaran','given in the courtyard after six');R.oyelaran='after six';
  {const lead=J(`(()=>{const list=[];const ow=BOARD40.THINGS[hxB40().card.id].owner;return BOARD40.GIVE_LEAD;})()`);assert.equal(lead,1.1,'the card give lead 1.1');assert(lead<J('FOUND38.GIVE_LEAD')&&lead<J('GIST39.POT.lead'),'v38\'s give (1.2) and the pot (1.15) win a tie');}
  // (fix round, DOD-F1) "One a day": a household that leaves the noon thing out (v38 keeps it on the same thing) gets a card on each of thirty
  // days (the pure pick on its own record); a record with nothing left to pass (the last two things the last owner's, every other one ahead)
  // still gives a card; Today never says new notices are up for a card from an earlier day
  {run("dispatch('newgame');");disc39();read();const L0=J('hxG().lost');
   const r30=J(`(()=>{const d0=S.day,C=JSON.parse(JSON.stringify(hxB40().cards)),none=[];let n=0;try{for(let d=d0+1;d<=d0+30;d++){S.day=d;const p=cardFor40(d,C);if(!p){none.push(d);continue;}cardBook40(C,p);n++;}}finally{S.day=d0;}return {n,none,lost:hxG().lost};})()`);
   assert(L0&&L0.status==='out'&&r30.lost.since===L0.since&&r30.lost.i===L0.i,'the noon thing left out all along: '+JSON.stringify(L0));assert.deepEqual(r30.none,[],'a card on each of thirty days with the noon thing left out');
   const dead=J(`(()=>{const O=BOARD40.ORDER,rest=['pegs','minutes'],done=O.filter(x=>!rest.includes(x));return cardFor40(S.day,{n:16,cycle:0,lastOwner:'oyelaran',done:done.slice(),ahead:done.slice()});})()`);
   assert(dead&&['pegs','minutes'].includes(dead.id),'a record with nothing left to pass still gives a card: '+JSON.stringify(dead));R.thirty={cards:r30.n,deadEnd:dead.id};
   pickCard(0);if(!giveCard(0)){run('S.time=18.05;');frames(6);giveCard(0);}nextday();run('S.time=10.6;hxAt(0,6,-8);');frames(8);assert.equal(J('board40Today().state'),'new','a card that went up today: new');
   nextday();run('S.time=10.6;');frames(8);const c=card();assert(c.state==='up'&&c.day<J('S.day'),'the card unread since an earlier day: '+JSON.stringify(c));const t=J('board40Today()');assert(!(t&&t.state==='new'),'not "New notices are up." for an earlier day\'s card: '+JSON.stringify(t));}
  // (repair, VN-1; the node verifier's probes x, y and z) a card thing never lies within 2.2 m of a thing lying out, in any pass: each thing of
  // the noon chain (v38's seven, v39's round entries) left out from day 5 or day 9, a card booked every day to 60 on a record of its own (the pure
  // pick and spot; the chain's record put back, S unchanged): a card every day, its spot at least 2.2 m from the thing left out
  {run("dispatch('newgame');");disc39();read();
   const y=J(`(()=>{const G=hxG(),s0=JSON.stringify(S),keep=JSON.stringify(G.lost),d0=S.day,res=[];try{
     for(let i=0;i<FOUND38.LOST.length+6;i++)for(const since of [5,9]){G.lost={i,since,at:12,status:'out',heard:0,told:0,ownerTold:0};const n0=boardNoon40(since);if(!n0||!n0.spot)continue;
      const C={n:0,cycle:0,lastOwner:null,done:[],ahead:[]};let near=0,none=0,nul=0,p4=0;const ex=[];
      for(let d=since;d<=60;d++){S.day=d;const p=cardFor40(d,C);if(!p){none++;continue;}if(p.pass===4)p4++;const sp=cardSpot40(d,p.id,p.cycle),n=boardNoon40(d);
       if(!sp)nul++;else if(n&&n.spot){const dd=Math.hypot(sp[0]-n.spot[0],sp[1]-n.spot[1]);if(dd<2.2){near++;if(ex.length<3)ex.push([d,p.id,p.cycle,p.pass,Math.round(dd*100)/100]);}}cardBook40(C,p);}
      res.push({id:n0.id,since,none,nul,near,p4,ex});}}
    finally{S.day=d0;G.lost=JSON.parse(keep);}return {res,same:JSON.stringify(S)===s0};})()`);
   assert(y.same,'S unchanged by the pure sweep');assert(y.res.length>=14,'every thing of the chain left out: '+y.res.length);
   const yb=y.res.filter(r=>r.none||r.nul||r.near);assert.deepEqual(yb,[],'a card every day and its thing at least 2.2 m from the thing left out: '+JSON.stringify(yb.slice(0,4)));
   // the bench has one spot, the glasses' own (probe z): with the glasses out there, the bench's card thing has no spot that day (it waits)
   const z=J(`(()=>{const G=hxG(),keep=JSON.stringify(G.lost);try{G.lost={i:0,since:S.day,at:12,status:'out',heard:0,told:0,ownerTold:0};const n=boardNoon40(S.day);
     return {glasses:n&&n.spot,bench:cardSpots40('bench'),spoon:cardSpot40(S.day,'spoon',0)};}finally{G.lost=JSON.parse(keep);}})()`);
   assert(z.glasses&&z.bench.length===1&&Math.hypot(z.bench[0][0]-z.glasses[0],z.bench[0][1]-z.glasses[1])<0.01&&z.spoon===null,'the bench\'s one spot under the glasses: no spot for the spoon that day: '+JSON.stringify(z));
   // the proof that a card always exists: for every noon spot of the chain with every child's spot or none, no card thing has both its areas
   // blocked (so cardFor40's pass 4 always finds one: some item is always due), and no child's spot lies within 2.2 m of a card spot
   const pf=J(`(()=>{const B=BOARD40,A=Object.keys(B.AREAS),NOON=[];for(let i=0;i<FOUND38.LOST.length;i++)for(const s of (FOUND38.LOST[i].spots||[]))NOON.push(s);
     for(let i=FOUND38.LOST.length;i<=60;i++){let e=null;try{e=rotEntry39(i);}catch(x){}if(e&&e.spots)for(const s of e.spots)NOON.push(s);}
     const sp=a=>{const dr=[],all=cardSpots40(a,dr);return all.concat(dr.map(x=>x.spot));},K=GIST40.KIDS.spots;let both=0,minFree=99,kidNear=0;
     for(const a of A)for(const s of sp(a))for(const k of K)if(Math.hypot(s[0]-k[0],s[1]-k[1])<2.2)kidNear++;
     for(const n of NOON)for(const k of K.concat([null])){const out=[n].concat(k?[k]:[]);const bl=A.filter(a=>!sp(a).some(s=>out.every(o=>Math.hypot(s[0]-o[0],s[1]-o[1])>=2.2)));
      both+=B.ORDER.filter(id=>bl.includes(B.THINGS[id].area)&&bl.includes(B.THINGS[id].area2)).length;minFree=Math.min(minFree,B.ORDER.filter(id=>!bl.includes(B.THINGS[id].area)).length);}
     return {noonSpots:NOON.length,both,minFree,kidNear};})()`);
   assert(pf.noonSpots>=100&&pf.both===0&&pf.kidNear===0&&pf.minFree>=1,'a card always exists (no item with both areas blocked by any noon spot and child\'s spot): '+JSON.stringify(pf));
   R.outThings={sweeps:y.res.length,pass4:y.res.reduce((a,r)=>a+r.p4,0),proof:pf};}
  return R;});


 check(4,()=>{const R={};assert(has40(),'the module');
  const P=J('BOARD40.ERRAND.pairs');assert.equal(P.length,8,'eight pairs');assert(!P.some(p=>p.from==='oyelaran'||p.to==='oyelaran'),'never Mrs. Oyelaran');assert(!P.some(p=>p.from===p.to),'never to oneself');
  // day 5 (v39 discovered on day 4): the notice with the card at the read
  run("dispatch('newgame');");disc39();const r=read();const er=J('board40Errand(S.day)');assert(er&&er.state==='up','the day\'s errand: '+JSON.stringify(er));
  assert(/gist40-notice/.test(r.ph)&&r.ph.includes('Kindly collect from')&&r.ph.includes('after half past twelve'),'the notice in the panel');frames(10);assert.equal(J('BOARD40.world.lowerKey'),'notice:'+er.pair,'the notice in the lower slot');
  const cown=J('BOARD40.THINGS[hxB40().card.id].owner');assert(er.receiver!==cown,'never to the card thing\'s owner');
  run('save();S=load();enterWorld();closePanel();');frames(10);assert.equal(J('board40Errand(S.day).state'),'up','reload in up');
  // not collectable before 12:30 (the sender settled in the afternoon place first)
  run('S.time=12.08;hxAt(0,-5.2,4.0);');frames(4);assert(settled(er.sender),er.sender+' is there');run('S.time=12.3;');frames(10);let s=npcAt(er.sender);approach(0,s[0],s[1],1.2,2.0);
  assert(J('S.time')<12.5,'still before 12:30');assert(!cands(0).includes('errand40take'),'not collectable before 12:30: '+JSON.stringify(cands(0)));
  run('S.time=12.55;');frames(10);s=npcAt(er.sender);approach(0,s[0],s[1],1.2,2.0);assert.equal(hsid(0),'errand40take','the take prompt at the sender\'s from 12:30: '+label(0));
  assert.equal(label(0),J(`boardFill40(BOARD40.UI.take,{short:'${er.short}',receiver:CAST['${er.receiver}'].name})`),'the take label');
  run('TOASTS=[];');press(0);frames(4);assert.equal(J('board40Errand(S.day).state'),'hand','in the hand');assert(J('tags=hxTag40()').includes('parcel'),'the parcel drawn');
  const hands=J("(()=>{const g=players[0].g,W=BOARD40.world;if(!g.hero)return null;g.updateMatrixWorld(true);const a=new THREE.Vector3(),b=new THREE.Vector3();g.hero.handL.getWorldPosition(a);g.hero.handR.getWorldPosition(b);const p=W.parcel.position;return [Math.hypot(p.x-a.x,p.z-a.z),Math.hypot(p.x-b.x,p.z-b.z)];})()");
  assert(hands&&hands[0]<0.05&&hands[1]>hands[0],'the parcel in the left hand, apart from v39\'s bag in the right: '+JSON.stringify(hands));
  run('save();S=load();enterWorld();closePanel();');frames(10);assert.equal(J('board40Errand(S.day).state'),'hand','reload in hand');assert(J('hxTag40()').includes('parcel'),'the parcel back after the reload');
  // given at the receiver's: thanks, friendship, no money, the log
  assert(settled(er.receiver),er.receiver+' is there');const rv=npcAt(er.receiver);approach(0,rv[0],rv[1],1.2,2.0);assert.equal(hsid(0),'errand40give','the give prompt at the receiver\'s: '+label(0));
  const money=J('S.money'),aff=J(`S.nb.${er.receiver}.aff`);run('PH="";');press(0);const ph=J('PH');run('closePanel();');frames(4);
  assert(/gist40-errand/.test(ph)&&/class="card say"/.test(ph),'the receiver\'s thanks');assert.equal(J('S.money'),money,'no money changes hands');assert.equal(J(`S.nb.${er.receiver}.aff`)-aff,1,'friendship +1');
  assert.equal(J('board40Errand(S.day).state'),'given','given');assert(logHas('board','errand '+er.pair),'the log: board errand');assert(!J('hxTag40()').includes('parcel'),'the parcel gone');
  assert(!cands(0).includes('errand40give')&&!cands(0).includes('errand40take'),'one a day');R.given={pair:er.pair,day:5};
  // the next day: taken, offered until 18:00, then the lapse at 18:00 with its toast after the gist
  nextday();run('S.time=10.6;');frames(10);let cdone=J('hxB40().card.state');read();const e2=J('board40Errand(S.day)');assert(e2,'an errand on day 6');assert(e2.sender!==er.sender,'not the same sender twice running');
  run('S.time=12.08;');frames(4);assert(settled(e2.sender),'the sender');run('S.time=12.6;');frames(10);s=npcAt(e2.sender);approach(0,s[0],s[1],1.2,2.0);press(0);frames(4);assert.equal(J('board40Errand(S.day).state'),'hand','taken on day 6');
  run('S.time=17.4;hxAt(1,-8,-10);');frames(10);assert(settled(e2.receiver),'the receiver');if(J('S.time')<17.85)run('S.time=17.85;');frames(2);const r2=npcAt(e2.receiver);approach(0,r2[0],r2[1],1.2,2.0);assert(J('S.time')<18,'before six: '+JSON.stringify([e2.receiver,J('S.time'),r2]));
  assert(cands(0).includes('errand40give'),'the give offered before six: '+JSON.stringify(cands(0)));run('TOASTS=[];S.time=18.004;');frames(10);
  assert.equal(J('board40Errand(S.day).state'),'lapsed','lapsed at 18:00');assert(!J('hxTag40()').includes('parcel'),'the parcel gone at the lapse');assert(!cands(0).includes('errand40give'),'no give after six');
  const lapse=J(`boardFill40(BOARD40.UI.lapse,{sender:CAST['${e2.sender}'].name,self:BOARD40.SELF['${e2.sender}']})`);assert(!J('TOASTS').includes(lapse),'no toast before the gist');
  run('S.time=18.2;');pair();const g=gistOnce(3000);assert(g&&g.end==='idle','the gist that evening');frames(12);assert(J('TOASTS').includes(lapse),'the lapse toast after the gist: '+JSON.stringify(J('TOASTS')));
  R.lapse={at:'18:00',toast:'after the gist'};R.hands='parcel left, bag right';R.reloads=['up','hand'];
  // (repair, H7) the errand in hand when the day ends before six (Sleep at 15:00): it lapses then, and its toast comes the next morning
  {nextday();run('S.time=10.6;');frames(10);if(card()&&card().state==='up')read();const e3=J('board40Errand(S.day)');assert(e3&&e3.state==='up','an errand on day '+J('S.day'));
   run('S.time=12.08;');frames(4);assert(settled(e3.sender),'the sender');run('S.time=12.6;');frames(10);const s3=npcAt(e3.sender);approach(0,s3[0],s3[1],1.2,2.0);press(0);frames(4);assert.equal(J('board40Errand(S.day).state'),'hand','taken');
   const d3=J('S.day');run('S.time=15.0;TOASTS=[];');frames(4);run("dispatch('sleep');");run('closePanel();');nextday();frames(10);
   assert.equal(J('S.day'),d3+1,'the next morning');const rec=J('hxB40().errand');assert(rec&&rec.day===d3&&rec.state==='lapsed','lapsed when the day ended: '+JSON.stringify(rec));
   const lapse3=J(`boardFill40(BOARD40.UI.lapse,{sender:CAST['${e3.sender}'].name,self:BOARD40.SELF['${e3.sender}']})`);assert(J('TOASTS').includes(lapse3),'its toast the next morning: '+JSON.stringify(J('TOASTS')));
   R.dayEnd={lapsed:true,toast:'the next morning'};}
  return R;});

 check(8,()=>{const R={};assert(has40(),'the module');
  const M=()=>J('hxM()'),tagsHas=t=>J('hxTag40()').includes(t);
  // none before v40 discovery (layer 2 open via v39 on day 5)
  run("dispatch('newgame');");disc39();run('S.time=10.75;hxAt(0,-3,10.4);');frames(10);assert(!tagsHas('mallam'),'no Mallam in the morning before discovery');
  run('S.time=17.05;');frames(10);assert(!tagsHas('mallam'),'no Mallam at five before discovery');assert(!/Fan the coals/.test(label(0)),'no fan prompt before discovery');
  // discovered on day 6 at 10:35; the morning: seated behind his stall; the order (no money), the name once
  nextday();read();run('S.time=10.8;hxAt(0,-3,10.6,[0,1]);hxAt(1,-8,-10);');frames(10);let m=M();assert(m&&m.vis&&m.sit&&m.phase==='morning','seated in the morning: '+JSON.stringify(m));
  // (fix round, S3) his head on screen in both desk cameras at 1280 x 800, a pair at his stall (P(0) at (-3, 10.9), P(1) beside at
  // (-2.15, 11.02), then the other way round), under the top bar: the morning (seated) here, at five (standing) below
  const headSeen=(when)=>{const out=[];run('hxScreen(1280,800,false);');for(const [a,b] of [[[-3,10.9],[-2.15,11.02]],[[-2.15,11.02],[-3,10.9]]]){run(`hxAt(0,${a[0]},${a[1]},[0,1]);hxAt(1,${b[0]},${b[1]},[0,1]);`);frames(150);
    const q=J(`(()=>{const c=MALLAM40.world.cap,g=MALLAM40.world.fig;if(!c||!g||!g.visible)return null;const v=new THREE.Vector3();g.updateMatrixWorld(true);c.getWorldPosition(v);const o=[];for(let i=0;i<2;i++){const cam=cams[i];cam.updateMatrixWorld();const p=v.clone().project(cam);const vp=v21Viewport(i);o.push([Math.round(p.x*1000)/1000,Math.round(p.y*1000)/1000,Math.round((1-2*(vp.top||0)/vp.h)*1000)/1000]);}return o;})()`);
    assert(q,'his figure and cap '+when);q.forEach((c,i)=>{assert(Math.abs(c[0])<=0.95&&c[1]>=-0.95&&c[1]<=c[2]-0.02,'his head on screen in desk camera '+i+' '+when+' (P(0) at ('+a+')): NDC '+JSON.stringify(c));});out.push(q);}return out;};
  R.headSeen={morning:headSeen('in the morning')};run('S.time=10.8;hxAt(0,-3,10.6,[0,1]);hxAt(1,-8,-10);');frames(4);
  assert.equal(hsid(0),'mallam40order','the order prompt at the stand: '+label(0));const money0=J('S.money');run('PH="";');press(0);let ph=J('PH');assert(/My name is Sani\./.test(ph),'his name, the first time');
  // (fix round, C4) the owner's two sentences after his greeting, nothing added (owner decision 4, "He says it once")
  assert(ph.includes('Sannu. My name is Sani. Everybody calls me Mallam.</div>'),'the name line as the owner approved it: '+(ph.match(/Sannu\.[^<]*/)||[''])[0]);
  click('mallam40Order',x=>x.data.v==='pepper');frames(4);assert.equal(J('S.money'),money0,'no money for the order');assert.equal(J('hxB40().mallam.order'),'pepper','the order kept');assert(logHas('mallam','order pepper'),'the log');
  assert.notEqual(hsid(0),'mallam40order','the order prompt gone');assert.equal(J('mallam40Today()&&mallam40Today().html'),'Mallam is keeping two sticks for you tonight.','Today\'s line');
  // jumps snap: off at 12:30; at 17:00 the fan open at once (and it beats the base suya prompt at the fan point)
  run('S.time=12.5;');frames(10);assert(!J('hxM().vis'),'not there at 12:30');
  run('S.time=17.01;hxAt(0,-3,11.2,[0,1]);');frames(10);m=M();assert(m.vis&&m.phase==='set'&&!m.sit,'at his stand at five: '+JSON.stringify(m));assert.equal(hsid(0),'mallam40fan','the fan beats the suya prompt at the fan point: '+label(0));
  assert(cands(0).includes('suya'),'the base suya prompt there too');
  // the glow rises with presses and sinks without
  for(let k=0;k<3;k++){press(0);frames(14);}const g1=J('MALLAM40.run.glow');frames(60);const g2=J('MALLAM40.run.glow');assert(g1>0.1&&g2<g1-0.1,'the glow rises and sinks: '+[g1,g2].map(r3));
  // a single player under the bot: from the first press to the first stick, 12-15 s of S.time; "Turn the sticks" offered to them from 0.6
  // (repair, VP-2) a walk from the rail side to the fan point for player i (about 1.5 m/s, one frame per 0.05 m), the other far off: at each frame
  // whether his bubble point (1.4 m up) is inside player i's camera, under its top bar, by the harness's own projection (bisiSeen39's margin),
  // and whether "Your two sticks are ready." has been said; it ends when it is said
  const readyWalk=(i,W,H,touch)=>J(`(()=>{hxScreen(${W},${H},${touch});hxAt(${1-i},-8,-10);const P=[[-4.0,6.6],[-4.0,7.6],[-3.6,8.6],[-3.3,9.3],[-3.1,9.9],[-3.0,10.3],[-3.0,11.2]];
    const cam=cams[${i}],vp=v21Viewport(${i}),top=1-2*(vp.top||0)/vp.h,g=MALLAM40.world.fig,RD=mallamLine40('ready');
    const seen=()=>{const v=new THREE.Vector3(g.position.x,(g.position.y||0)+1.4,g.position.z);cam.updateMatrixWorld();const c=v.clone().applyMatrix4(cam.matrixWorldInverse);if(-c.z<=0.1)return false;v.project(cam);return v.x>=-1.1&&v.x<=1.1&&v.y>=-1.1&&v.y<=top+0.1;};
    hxAt(${i},P[0][0],P[0][1],[0,1]);hxFrames(150);let at=null,unseenNear=0,firedUnseen=0,ready0=MALLAM40.run.ready;
    for(let k=1;k<P.length&&at===null;k++){const a=P[k-1],b=P[k],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/0.05);
     for(let s=1;s<=n;s++){const x=a[0]+(b[0]-a[0])*s/n,z=a[1]+(b[1]-a[1])*s/n;hxAt(${i},x,z,[b[0]-a[0],b[1]-a[1]]);hxFrames(1);
      const d=Math.hypot(x+3,z-11.2),sn=seen();if(d<MALLAM40.READY_R&&!sn)unseenNear++;
      if(MALLAM40.run.ready===1){at={d:Math.round(d*100)/100,seen:sn,live:BOARD40.world.live.some(q=>BOARD40.world.bub[RD]===q)};if(!sn)firedUnseen++;break;}}}
    hxScreen(1280,800,false);return {at,unseenNear,firedUnseen,ready0};})()`);
  const beat=(pairMode)=>{let t0=null,ids={0:{},1:{}},fanTurn=0;for(let f=0;f<1500;f++){if(J('overlayOpen()||MALLAM40.run.done'))break;const a=hsid(0),b=hsid(1);ids[0][a]=1;ids[1][b]=1;if(pairMode&&a==='mallam40turn'&&J('MALLAM40.run.turns>=1&&MALLAM40.t-MALLAM40.run.lastFan[0]<MALLAM40.GLOW.fanner'))fanTurn++;
    const p0=a==='mallam40fan'||a==='mallam40turn',p1=pairMode&&b==='mallam40turn';if(p0||p1){if(t0===null)t0=J('S.time');run((p0?'hxPress(0);':'')+(p1?'hxPress(1);':'')+'hxFrames(1);hxRelease(0);hxRelease(1);');}else frames(1);}
   return {secs:Math.round((J('S.time')-t0)*60*100)/100,ids,panel:J('PH'),fanTurn};};
  nextday();run('S.time=16.98;hxAt(0,-3,11.2,[0,1]);hxAt(1,-8,-10);');frames(10);to(17.005);frames(4);run('PH="";');let b1=beat(false);
  // (repair, H3) no panel opens by itself when the beat ends (at 390 x 844 it opened under both thumbs and the next fanning tap pressed Taste):
  // the taste is the "Taste the first stick" prompt; presses still coming in the first 0.8 s open nothing; then the player's own Act opens it
  {const STK=J("esc(mallamLine40('stick'))");assert(J('MALLAM40.run.done')&&!J('overlayOpen()')&&!b1.panel.includes(STK),'no panel opens by itself at the end of the beat');
   assert.equal(hsid(0),'mallam40taste','"Taste the first stick" offered as the prompt: '+label(0));assert.equal(label(0),'Taste the first stick','its label');
   press(0);frames(4);press(0);frames(4);press(0);assert(!J('overlayOpen()')&&J('hxB40().mallam.tasted')===0,'three fanning taps still coming in the first 0.8 s open nothing');
   frames(24);run('PH="";');press(0);assert(J('overlayOpen()')&&J('PH').includes(STK),'the first stick panel by the player\'s own Act');R.tastePrompt={pause:J('MALLAM40.TASTE.pause'),selfOpen:false};}assert(b1.secs>=12&&b1.secs<=15,'one player: 12 to 15 s of S.time ('+b1.secs+')');assert(b1.ids[0].mallam40turn,'"Turn the sticks" for the single player');
  const mood=J('S.p[0].mood'),mood1=J('S.p[1].mood'),money1=J('S.money');click('mallam40Taste');assert.equal(J('S.p[0].mood')-mood,4,'the taste: a small cheer for the one who helped');assert.equal(J('S.p[1].mood'),mood1,'nothing for the player who did not');
  assert.equal(J('S.money'),money1,'no money changes hands');assert(!cands(0).includes('mallam40taste'),'once an evening');R.single=b1.secs;
  // the base round still works and brings his line (the kept order's on the evening of an order, another's otherwise)
  // (repair 3, R3-2) for two seconds after the taste panel closes "The coals are going." leads at the stand and buys nothing; then the base round
  frames(2);assert.equal(hsid(0),'mallam40hush','"The coals are going." just after the taste: '+label(0));run('S.money=9000;TOASTS=[];');press(0);assert.equal(J('S.money'),9000,'an Act just after the taste buys nothing');assert(!J('overlayOpen()'),'and opens nothing');
  frames(70);assert.equal(label(0),'Two suyas, ₦2,000','the base prompt once the coals are going');run('PH="";');press(0);assert(/Two suyas/.test(J('PH')),'the base panel');assert.equal(J('S.money'),7000,'₦2,000');run('closePanel();');frames(10);
  let live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');assert(live.some(t=>!/as you said/.test(t)),'his line on the round (no order today): '+JSON.stringify(live));
  run('TOASTS=[];');press(0);assert(J('TOASTS').includes('Mallam says one round per sitting.'),'one round per sitting');run('closePanel();');
  // the order kept from this morning? (an order on day 6, collected? no: lapsed at 22:00 on day 6) the next morning: "Tomorrow, then."
  // the gist: seated by his grill at (-4.2, 13.0) while the evening runs; after it, at his grill
  run('S.time=18.2;');pair();const st=waitStart(3000);assert(st>=0,'a visit');frames(10);m=M();assert(J("EVENING35.state")!=='idle'&&m.sit&&Math.abs(m.x+4.2)<1e-6&&Math.abs(m.z-13.0)<1e-6&&m.phase==='seated','seated at (-4.2, 13.0) during the visit: '+JSON.stringify(m));
  untilIdle();frames(10);m=M();assert(m.vis&&!m.sit&&m.phase==='after','at his grill after the gist: '+JSON.stringify(m));
  // a round bought just before ten with no order today: his line (the flag watch at ten; the base passTime carries the clock past it), he stays
  // while it shows, then goes
  run('S.time=21.75;S.money=9000;hxAt(0,-3,11.2,[0,1]);hxAt(1,-8,-10);');frames(10);assert.equal(hsid(0),'suya','the base round at ten to ten (no order today): '+label(0));run('PH="";');press(0);assert(J('S.time')>=22,'the base passTime carries the clock past ten');run('closePanel();');frames(10);
  live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');assert(live.length>=1&&J('hxM().vis'),'his line on a round bought just before ten: '+JSON.stringify(live));frames(160);assert(!J('hxM().vis'),'gone at 22:00 once it ends');
  // the next morning: yesterday's order (day 6) was never collected: "Tomorrow, then." once at the stand
  // (day 7's beat above ran on day 7; the order was on day 6, so day 7 morning had it; check on a new order instead)
  nextday();run('S.time=10.8;hxAt(0,-3,10.6,[0,1]);');frames(10);press(0);click('mallam40Order',x=>x.data.v==='onion');frames(4);
  // a pair under the bot on the evening of the order: P1 turns while P0 fans; the kept order's line on the round
  run('S.time=16.98;hxAt(0,-3,11.2,[0,1]);hxAt(1,-3.5,10.95,[1,1]);');frames(10);to(17.005);frames(4);const b2=beat(true);
  assert(b2.secs>=10&&b2.secs<=15,'two players: at most 15 s of S.time ('+b2.secs+')');assert(b2.ids[1].mallam40turn,'"Turn the sticks" for the player not fanning');assert.equal(b2.fanTurn,0,'after the first turn never "Turn the sticks" for the one fanning (DOD-F7)');
  frames(30);press(0);const moods=[J('S.p[0].mood'),J('S.p[1].mood')];click('mallam40Taste');assert.deepEqual([J('S.p[0].mood')-moods[0],J('S.p[1].mood')-moods[1]],[4,4],'the taste for each helper');R.pair=b2.secs;
  const KEPT=J("mallamFill40(mallamLine40('kept'),{choice:MALLAM40.UI.choice.onion})"),READY=J("mallamLine40('ready')");
  // (fix round, DOD-F5) a round before the gist: another line, the order still kept ("He hands over your sticks afterwards.")
  run('S.money=9000;hxAt(1,-8,-10);');frames(70);run('PH="";');press(0);run('closePanel();');frames(10);live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');
  assert(live.length>=1&&!live.includes(KEPT),'before the gist a regular\'s or the season\'s line, not the kept order\'s: '+JSON.stringify(live));assert.equal(J('hxB40().mallam.kept'),0,'the order still kept before the gist');assert(J('mallam40Today()'),'Today still says he is keeping two sticks');
  assert(J('ACT_HOOKS.filter(h=>/40\\(/.test(String(h))).every(h=>!/suya/.test(String(h)))'),'no v40 ACT_HOOKS entry mentions suya');
  // the gist; afterwards "Your two sticks are ready." once to a player within 4 m (not at 5.2 m); a round bought just before ten brings the kept
  // order's line (the base passTime carries the clock past ten: he stays while it shows, then goes)
  run('S.time=18.2;');pair();{const g=gistOnce(3000);assert(g&&g.end==='idle','the gist that evening');}frames(10);assert.equal(J('hxM().phase'),'after','at his grill after the gist');
  run('hxAt(0,-3,6.0);hxAt(1,-8,-10);');frames(10);live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');assert(!live.includes(READY),'no reminder at 5.2 m: '+JSON.stringify(live));
  // (repair, VP-2) at 1280 x 800 from the rail side: never said while he is outside the camera of the player who came near; said before the fan point
  {const w=readyWalk(0,1280,800,false);assert(w.ready0===0&&w.unseenNear>0,'1280 x 800: the walk from the rail side has frames within 4 m with him outside the camera: '+JSON.stringify(w));
   assert(w.at&&w.firedUnseen===0&&w.at.seen,'1280 x 800: "Your two sticks are ready." only once his bubble is drawn, and before the fan point: '+JSON.stringify(w));assert(w.at.live,'its bubble shows');R.readyWalk={desk:w.at.d,deskUnseenNear:w.unseenNear};}
  run('hxAt(0,-3,4.0);');frames(130);run('hxAt(0,-3,10.6);');frames(40);live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');assert(!live.includes(READY),'the reminder once');
  // (repair, H1) the kept order collected just before ten: "Collect your two sticks, ₦2,000" leads the base round at the fan point; ₦2,000, the
  // kept order's line; its passTime carries the clock past ten and he stays while the line shows, then goes
  run('S.time=21.75;S.money=9000;hxAt(0,-3,11.2,[0,1]);');frames(10);assert.equal(hsid(0),'mallam40collect','the collection leads at ten to ten: '+label(0));assert.equal(label(0),'Collect your two sticks, ₦2,000','its label');assert(cands(0).includes('suya'),'the base round there too');
  run('PH="";');press(0);assert(J('S.time')>=22,'the collection\'s passTime carries the clock past ten');assert.equal(J('S.money'),7000,'₦2,000 on collection');assert(!/Two suyas/.test(J('PH')),'not the base round');frames(10);
  live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');assert(live.includes(KEPT)&&J('hxM().vis'),'the kept order\'s line on the collection just before ten: '+JSON.stringify(live));assert.equal(J('hxB40().mallam.kept'),J('S.day'),'the order handed over');
  frames(160);assert(!J('hxM().vis'),'then he goes');R.kept={beforeGist:'another line',ready:'within 4 m, once',collectBeforeTen:true};
  // (fix round, S2) one human pressing about four times a second (a press in the pose is kept, not dropped): at most 15 s
  {nextday();run('closePanel();S.time=16.98;hxAt(0,-3,11.2,[0,1]);hxAt(1,-8,-10);');frames(10);to(17.005);frames(4);let t0=null;
   for(let k=0;k<1200;k++){if(J('overlayOpen()')||J('MALLAM40.run.done'))break;const a=hsid(0);if(a==='mallam40fan'||a==='mallam40turn'){if(t0===null)t0=J('S.time');run('hxPress(0);');}frames(1);run('hxRelease(0);');frames(7);}
   const hs=Math.round((J('S.time')-t0)*60*100)/100;assert(J('MALLAM40.run.done')&&hs<=15,'one human at four presses a second: at most 15 s ('+hs+')');R.human=hs;run('closePanel();');}
  // unfanned: he lights it himself at 17:30 (no taste); an order not collected: "Tomorrow, then." the next morning
  nextday();run('S.time=10.8;hxAt(0,-3,10.6,[0,1]);');frames(10);press(0);click('mallam40Order',x=>x.data.v==='pepper');frames(4);
  run('S.time=17.2;hxAt(0,-8,-10);hxAt(1,-8,-10);');frames(10);assert.equal(J('hxM().phase'),'set','set at 17:12');R.headSeen.five=headSeen('at five');assert.equal(J('hxM().phase'),'set','still set');run('hxAt(0,-8,-10);hxAt(1,-8,-10);');frames(2);run('S.time=17.52;');frames(10);assert.equal(J('hxM().phase'),'lit','lit at 17:31');assert.equal(J('hxB40().mallam.lit'),'self','by himself');
  run('hxAt(0,-3,11.2);');frames(4);assert(!cands(0).includes('mallam40taste')&&!cands(0).includes('mallam40fan'),'no taste and no fan when he lit it');run('S.time=21.9;');frames(4);
  nextday();run('S.time=10.7;hxAt(0,-3,9.5);');frames(10);run('hxAt(0,-3,10.6);');frames(10);live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');assert(live.includes('Tomorrow, then.'),'"Tomorrow, then." the morning after an order not collected: '+JSON.stringify(live));
  // Aunty Bisi: in her stroll her street-side buy beats the fan (lead 0.05; at 0.35 the fan would win), at her stop the fan is not offered
  herDay();run('S.time=17.0;hxAt(0,-8,-10);hxAt(1,-8,-10);');frames(10);to(17.17);frames(2);let bv=Bv();assert(bv&&bv.vis&&bv.phase==='stroll','she strolls: '+JSON.stringify(bv));
  const zz=J(`(()=>{const bx=${bv.x};let best=null;for(let z=10.05;z<=10.95;z+=0.01){const dB=Math.hypot(-3-bx,z-8.8),dF=Math.abs(11.2-z);if(dB<2.3&&dF<1.15){const k=Math.abs(dB-dF-0.3);if(!best||k<best[1])best=[z,k];}}return best?best[0]:null;})()`);
  assert(zz,'a place between her and the fan point');run(`hxAt(0,-3,${zz},[0,-1]);`);frames(1);const c1=cands(0);assert(c1.includes('mallam40fan')&&c1.includes('bisi39buy'),'both prompts there: '+JSON.stringify(c1));assert.equal(hsid(0),'bisi39buy','her stroll buy wins over the fan: '+label(0));
  streetPanel(1);click('bisi39Buy',x=>x.data.v==='groundnut');click('bisi39Close');for(let k=0;k<60;k++){frames(10);const q=Bv();if(q&&q.phase==='stop'&&Math.abs(q.x+4)<0.01&&Math.abs(q.z-8.8)<0.01)break;}
  bv=Bv();assert(bv.phase==='stop','at her stop: '+JSON.stringify(bv));
  // (fix round, S1) at her stop: where her buy comes before the base round it wins and the fan is not offered; everywhere else at the stand the
  // fan takes the base round's place, and Act there never buys the base round before the coals are lit
  const woFan=()=>J(`(()=>{const p=players[0].g.position,all=[],d=(a,b)=>Math.hypot(p.x-a,p.z-b);for(const h of HOTSPOT_HOOKS){const r=h(0,all,d);if(r)return r.id;}const list=all.filter(e=>!/^mallam40/.test(e.id));
   {const dd=d(-3,11.2);if(dd<1.6)list.push({id:'suya',dist:dd});}list.sort((a,b)=>a.dist-b.dist);return list[0]?list[0].id:'';})()`);
  for(const [x,z] of [[-3.3,10.3],[-2.85,10.86],[-3.0,10.6]]){run(`hxAt(0,${x},${z},[0,1]);hxAt(1,-8,-10);`);frames(1);const c2=cands(0);assert.equal(woFan(),'suya','without the fan the base round would come first at ('+x+', '+z+')');
   assert(c2.includes('bisi39buy'),'her buy offered at ('+x+', '+z+') (within her 2.4 m)');assert.equal(hsid(0),'mallam40fan','"Fan the coals", not the base round, at ('+x+', '+z+'): '+label(0));}
  {const zb=J(`(()=>{for(let z=10.4;z>=9.4;z-=0.02){const dB=Math.hypot(-3.6+4,z-8.8),dF=Math.hypot(-3.6+3,z-11.2);if(dF<1.55&&dB<dF-0.1)return Math.round(z*100)/100;}return null;})()`);assert(zb,'a place where her buy comes first');
   run(`hxAt(0,-3.6,${zb},[0,1]);`);frames(1);assert.equal(woFan(),'bisi39buy','her buy before the base round at (-3.6, '+zb+')');assert(!cands(0).includes('mallam40fan'),'no fan where her buy comes first: '+JSON.stringify(cands(0)));assert.equal(hsid(0),'bisi39buy','her buy wins there');
   run('hxAt(0,-2.85,10.86,[0,1]);');frames(1);const m0=J('S.money'),t0=J('S.time');run('PH="";');press(0);assert.equal(J('S.money'),m0,'Act at the stall\'s front: no money');assert(J('S.time')-t0<0.05,'no base passTime');assert(!/Two suyas/.test(J('PH')),'no base panel');run('closePanel();');
   R.bisi={stroll:'her buy',stop:'her buy where it comes first ((-3.6, '+zb+')); the fan at (-3.3, 10.3), (-2.85, 10.86), (-3.0, 10.6)'};}
  // (fix round, S7 and S8) his bubble as each camera draws it (boardClamp40 with the renderer's viewport): at 390 x 844 at least 13 px of text in
  // the lower half (and the upper); at 844 x 390 by touch clear of the player's pantry chip and prompt pill (stand-in chips where the bubble
  // would be drawn without them), inside its half
  {run('S.time=17.3;hxAt(0,-3,10.9,[0,1]);hxAt(1,-2.15,11.02,[0,1]);hxScreen(390,844,true);');frames(90);
   const bub=J(`(()=>{const g=MALLAM40.world.fig,B=BOARD40;if(!g||!g.visible)return null;const b=bubble40('Two sticks, as I promised. More onion on yours, as you said. I told you I would remember.',9000,g,2.1);if(!b)return null;
    const rend=(x,y,w,h,W,H)=>({getViewport:v=>v.set(x,y,w,h),getSize:v=>v.set(W,H)}),px=(cam,vp)=>{const v=b.position.clone().applyMatrix4(cam.matrixWorldInverse),dz=-v.z,th=Math.tan(cam.fov*Math.PI/360);
     const hh=(b.scale.y/2)/(dz*th),hw=(b.scale.x/2)/(dz*th*cam.aspect),c=b.position.clone().project(cam);return {font:Math.round(b.scale.x*CLAMP40.FONT/(dz*th)*(vp.h/2)*100)/100,
      l:vp.x+(c.x-hw+1)/2*vp.w,r:vp.x+(c.x+hw+1)/2*vp.w,t:vp.y+(1-(c.y+hh))/2*vp.h,b:vp.y+(1-(c.y-hh))/2*vp.h};};
    const out={};const W=innerWidth,H=innerHeight,h2=Math.floor(H/2);
    for(const i of [0,1]){const cam=cams[i];cam.updateMatrixWorld();b.onBeforeRender(rend(0,i===0?H-h2:0,W,h2,W,H),scene,cam);out['portrait'+i]=px(cam,{x:0,y:i===0?0:H-h2,w:W,h:h2});}
    hxScreen(844,390,true);hxFrames(90);const w2=Math.floor(844/2);for(let k=0;k<2;k++)cams[k].updateMatrixWorld();
    const cam=cams[0],R0=rend(0,0,w2,390,844,390),VP={x:0,y:0,w:w2,h:390};b.onBeforeRender(R0,scene,cam);const free=px(cam,VP);
    // stand-in chips: one over the bubble's lower left corner (the pantry chip), one over its right edge (the prompt pill)
    const chips={inv0:{left:free.l-30,top:free.b-12,right:free.l+70,bottom:free.b+30},pr0:{left:free.r-40,top:free.t+4,right:free.r+60,bottom:free.t+40}};const keep=document.getElementById;
    document.getElementById=function(id){const c=chips[id];if(c)return {classList:{contains:k=>k==='on'},getBoundingClientRect:()=>Object.assign({width:c.right-c.left,height:c.bottom-c.top},c)};return keep.apply(this,arguments);};
    try{b.onBeforeRender(R0,scene,cam);out.land=px(cam,VP);}finally{document.getElementById=keep;}out.free=free;out.chips=chips;out.top=1-2*v21Viewport(0).top/390;out.vpTop=v21Viewport(0).top;out.vpBot=v21Viewport(0).bottom;
    hxScreen(1280,800,false);return out;})()`);
   assert(bub,'his bubble built');const r1=x=>Math.round(x*10)/10;assert(bub.free.r-bub.free.l>40&&bub.land.r-bub.land.l>40,'the bubble drawn at 844 x 390: '+JSON.stringify([bub.free,bub.land]));
   assert(bub.portrait1.font>=12.99&&bub.portrait0.font>=12.99,'at 390 x 844 at least 13 px of text in both halves: '+JSON.stringify([bub.portrait0.font,bub.portrait1.font]));
   const L=bub.land,hit=c=>c.left<L.r&&c.right>L.l&&c.top<L.b&&c.bottom>L.t;
   assert(!hit(bub.chips.inv0)&&!hit(bub.chips.pr0),'at 844 x 390 the bubble clear of the pantry chip and the prompt pill: '+JSON.stringify({bubble:[L.l,L.t,L.r,L.b].map(r1),chips:bub.chips}));
   assert(L.l>=0&&L.r<=422+0.5&&L.t>=bub.vpTop-0.5&&L.b<=390-bub.vpBot+0.5,'and inside its half, under the top bar and above the touch buttons: '+JSON.stringify([L.l,L.t,L.r,L.b].map(r1)));
   R.bubble={portraitFont:[bub.portrait0.font,bub.portrait1.font],landscape:{without:[bub.free.l,bub.free.t,bub.free.r,bub.free.b].map(r1),moved:[L.l,L.t,L.r,L.b].map(r1)}};
   run('BOARD40.world.live.forEach(b=>{b.visible=false;if(b.parent)b.parent.remove(b);});BOARD40.world.live.length=0;hxScreen(1280,800,false);');frames(2);}
  // hidden: a party, online, Sleep, the v35 evening's day
  run('S.time=17.3;hxAt(0,-3,10.4);');frames(10);assert(J('hxM().vis'),'there at 17:18');run('S.party={on:true,done:false,guests:[]};');frames(10);assert(!J('hxM().vis'),'hidden at a party');run('S.party=null;');frames(10);assert(J('hxM().vis'),'back');
  run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");frames(10);assert(!J('hxTag40()').includes('mallam'),'online: gone');run('NET.on=false;');frames(10);assert(J('hxM().vis'),'offline: back');
  run("dispatch('nextday');closePanel();");assert(!J('hxM().vis'),'hidden on Sleep');run('S.time=17.3;life34().evening35={doneDay:S.day};');frames(10);assert(!J('hxM().vis'),'not on the v35 evening\'s day');run('life34().evening35={doneDay:3};');
  // the walk-in at five with a player near: along the probed line, south of the ball
  run('S.time=16.99;hxAt(0,-1,12.4);hxAt(1,-8,-10);');frames(4);to(17.002);const path=[];for(let k=0;k<60;k++){frames(5);const q=M();if(q&&q.vis)path.push([q.x,q.z]);}
  assert(path.length&&path[0][0]>0.5,'walked in from the east: '+JSON.stringify(path.slice(0,3)));assert(path.every(p=>Math.hypot(p[0]-0,p[1]-13.5)>=0.6),'south of the household ball');const pr=probe(J);assert.equal(pr.mallam.walkBlocked,0,'the walk-in line clear');
  R.walk={from:path[0],southOfBall:true};R.hidden=['party','online','Sleep','v35 evening'];
  // (repair, H9) a base round bought in the afternoon sitting while he is away (14:00): no line over him at five, the round counter unchanged
  // (he saw the late morning, so his record of the flags is from before noon)
  {nextday();run('S.time=10.6;hxAt(0,-8,-10);hxAt(1,-8,-10);');frames(10);assert.equal(J('hxM().phase'),'morning','his late morning');run('S.time=14.0;S.money=9000;hxAt(0,-3,10.6,[0,1]);hxAt(1,-8,-10);');frames(10);assert.equal(hsid(0),'suya','the base round at 14:00');assert(!J('hxM().vis'),'he is away at 14:00');run('PH="";');press(0);run('closePanel();');
   assert(J("!!S.flags['suya'+S.day+'afternoon']"),'the afternoon round bought');const n0=J('hxB40().once.suyaN|0');run('hxAt(0,-12,4,[0,1]);S.time=16.95;');frames(10);to(17.02);frames(12);live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');
   assert(J('hxM().vis')&&J('hxM().phase')==='set','at his stand at five');assert.deepEqual(live,[],'no line over him at five for the afternoon round: '+JSON.stringify(live));assert.equal(J('hxB40().once.suyaN|0'),n0,'the round counter unchanged');R.afternoonRound='no line';
   // (repair, H6) a reload mid-beat: P(0) fans six times, the game is saved and loaded, P(1) finishes the beat alone; both keep the taste
   run('hxAt(0,-3,11.2,[0,1]);hxAt(1,-8,-10);');frames(4);let n=0;for(let k=0;k<80&&n<6;k++){if(hsid(0)==='mallam40fan'){run('hxPress(0);');n++;}frames(1);run('hxRelease(0);');frames(14);}
   assert.equal(n,6,'six fans');assert.deepEqual(J('hxB40().mallam.fanned'),[0],'P(0) recorded');run('save();S=load();enterWorld();closePanel();');frames(6);assert.deepEqual(J('MALLAM40.run.fanned'),[],'the run\'s memory empty after the reload');
   run('hxAt(0,-5,8,[0,1]);hxAt(1,-3,11.2,[0,1]);');frames(4);for(let k=0;k<300;k++){if(J('overlayOpen()')||J('MALLAM40.run.done'))break;const a=hsid(1);if(a==='mallam40fan'||a==='mallam40turn')run('hxPress(1);');frames(1);run('hxRelease(1);');frames(7);}
   assert(J('MALLAM40.run.done'),'P(1) finished the beat');run('closePanel();');const rec=J('hxB40().mallam');assert(rec.fanned.includes(0)&&rec.fanned.includes(1),'both kept as helpers after the reload: '+JSON.stringify(rec));
   run('hxAt(0,-3,11.2,[0,1]);hxAt(1,-2.6,11.0,[0,1]);');frames(2);assert(cands(0).includes('mallam40taste')&&cands(1).includes('mallam40taste'),'the taste for both: '+JSON.stringify([cands(0),cands(1)]));R.reloadBeat={fanned:rec.fanned};}
  // (repair, VP-3) a pair where only one presses (the other within reach of the fan point, never pressing): the fanner is offered the turn once
  // the other has not turned within 2 s of it being ready; the beat ends within 15 s
  {nextday();run('S.time=16.98;hxAt(0,-3,11.2,[0,1]);hxAt(1,-3,9.62,[0,1]);');frames(10);to(17.005);frames(4);assert(J('Math.hypot(players[1].g.position.x+3,players[1].g.position.z-11.2)')<J('MALLAM40.fanReach'),'the other player within reach of the fan point');
   let t0=null;const ids={};for(let k=0;k<1500;k++){if(J('overlayOpen()')||J('MALLAM40.run.done'))break;const a=hsid(0);ids[a]=1;if(a==='mallam40fan'||a==='mallam40turn'){if(t0===null)t0=J('S.time');run('hxPress(0);');}frames(1);run('hxRelease(0);');frames(7);}
   const secs=t0===null?null:Math.round((J('S.time')-t0)*60*100)/100;assert(J('MALLAM40.run.done')&&secs!==null&&secs<=15,'a pair where only one presses finishes within 15 s ('+secs+', turns '+J('MALLAM40.run.turns')+')');assert(ids.mallam40turn,'"Turn the sticks" offered to the fanner');
   run('closePanel();');R.lonePair=secs;}
  // (repair, H1; owner decision 3, "He hands over your sticks afterwards.") the kept order always collectable after the gist: (a) a round bought
  // at 18:05, before the gist, uses the evening's sitting; after the gist "Your two sticks are ready." and "Collect your two sticks, ₦2,000";
  // (b) a purse that cannot pay: the base round's toast, no credit, the order still kept; then paid: ₦2,000, the base round's cheer, its passTime,
  // the kept line, Today silent after
  {nextday();run('S.time=10.8;S.money=9000;hxAt(0,-3,10.6,[0,1]);hxAt(1,-8,-10);');frames(10);press(0);click('mallam40Order',x=>x.data.v==='pepper');frames(4);assert.equal(J('hxB40().mallam.order'),'pepper','ordered');
   const KP=J("mallamFill40(mallamLine40('kept'),{choice:MALLAM40.UI.choice.pepper})"),RD=J("mallamLine40('ready')");
   run('S.time=18.05;hxAt(0,-3,11.2,[0,1]);hxAt(1,-8,-10);');frames(10);assert.equal(hsid(0),'suya','the base round before the gist (no collection yet): '+label(0));run('PH="";');press(0);run('closePanel();');frames(10);
   assert(J("!!S.flags['suya'+S.day+'evening']"),'the evening\'s sitting used before the gist');assert.equal(J('hxB40().mallam.kept'),0,'still kept');
   pair();{const g=gistOnce(3000);assert(g&&g.end==='idle','the gist');}frames(10);assert.equal(J('hxM().phase'),'after','at his grill after the gist');
   // (repair, VP-2) at 390 x 844, P(0) in the upper half, from the rail side
   {const w=readyWalk(0,390,844,true);assert(w.ready0===0&&w.unseenNear>0,'390 x 844: the walk from the rail side has frames within 4 m with him outside the camera: '+JSON.stringify(w));
    assert(w.at&&w.firedUnseen===0&&w.at.seen&&w.at.live,'390 x 844: "Your two sticks are ready." after the gist, only once his bubble is drawn, before the fan point: '+JSON.stringify(w));R.readyWalk.portrait=w.at.d;R.readyWalk.portraitUnseenNear=w.unseenNear;}
   run('hxAt(0,-3,11.2,[0,1]);S.money=1000;');frames(4);assert.equal(hsid(0),'mallam40collect','the collection after the gist with the evening\'s sitting used: '+label(0));
   run('TOASTS=[];PH="";');press(0);frames(4);assert(J('TOASTS').includes('Not enough in the purse'),'a purse that cannot pay: the base round\'s toast');assert.equal(J('S.money'),1000,'no credit');assert.equal(J('hxB40().mallam.kept'),0,'still kept');assert(J('mallam40Today()'),'Today still says he is keeping them');
   run('S.money=9000;S.p[0].mood=50;S.p[1].mood=50;S.p[0].energy=50;S.p[1].energy=50;TOASTS=[];');press(0);frames(10);
   assert.equal(J('S.money'),7000,'₦2,000 on collection');assert.equal(J('hxB40().mallam.kept'),J('S.day'),'handed over');
   assert.deepEqual([J('S.p[0].mood'),J('S.p[1].mood'),J('S.p[0].energy')>=59,J('S.p[1].energy')>=59],[58,58,true,true],'the base round\'s cheer and energy for both');
   live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');assert(live.includes(KP),'the kept order\'s line: '+JSON.stringify(live));assert.equal(J('mallam40Today()'),null,'Today no longer says he is keeping them');assert(logHas('mallam','kept'),'the log');
   assert.notEqual(hsid(0),'mallam40collect','collected once');run('TOASTS=[];');press(0);assert(J('TOASTS').includes('Mallam says one round per sitting.'),'the base round after it: one per sitting');run('closePanel();');
   R.collect={beforeGist:'base round, still kept',poorPurse:'no credit',paid:2000};}
  // (c) the gist skipped (the household stays at the stall): no collection while a gist can still come; from ten, when its window has closed,
  // "Your two sticks are ready." and the collection, while he stays at his grill until half past ten; uncollected, he goes then and the next
  // morning "Tomorrow, then."
  {nextday();run('S.time=10.8;S.money=9000;hxAt(0,-3,10.6,[0,1]);hxAt(1,-8,-10);');frames(10);press(0);click('mallam40Order',x=>x.data.v==='onion');frames(4);
   const KO=J("mallamFill40(mallamLine40('kept'),{choice:MALLAM40.UI.choice.onion})"),RD=J("mallamLine40('ready')");
   run('S.time=19.45;hxAt(0,-3,11.2,[0,1]);hxAt(1,-3.6,9.0,[0,1]);');frames(10);assert(J('gistDueTonight38()')&&!J('home34()'),'a gist still due, nobody home');assert.notEqual(hsid(0),'mallam40collect','no collection while a gist can still come');
   run('S.time=21.9;hxAt(0,-3,9.0,[0,1]);');frames(10);assert(!cands(0).includes('mallam40collect'),'none at 21:54');to(22.02);frames(10);
   assert(J('hxM().vis'),'still at his grill after ten with the order waiting');run('hxAt(0,-3,10.3,[0,1]);');frames(40);live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');assert(live.includes(RD),'"Your two sticks are ready." at ten: '+JSON.stringify(live));assert(J('mallam40Today()'),'Today still says he is keeping them');
   run('hxAt(0,-3,11.2,[0,1]);');frames(4);assert.equal(hsid(0),'mallam40collect','the collection from ten: '+label(0));press(0);frames(10);live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');
   assert(live.includes(KO)&&J('hxB40().mallam.kept')===J('S.day'),'collected after ten with the kept line: '+JSON.stringify(live));frames(160);assert(!J('hxM().vis'),'then he goes');
   nextday();run('S.time=10.8;hxAt(0,-3,10.6,[0,1]);');frames(10);press(0);click('mallam40Order',x=>x.data.v==='pepper');frames(4);run('S.time=22.1;hxAt(0,-3,9.0,[0,1]);hxAt(1,-3.6,9.0,[0,1]);');frames(10);assert(J('hxM().vis'),'there at 22:06 with an order waiting');
   run('S.time=22.52;');frames(10);assert(!J('hxM().vis'),'gone at half past ten');assert.equal(J('mallam40Today()'),null,'Today silent once it lapses');
   nextday();run('S.time=10.7;hxAt(0,-3,9.5);');frames(10);run('hxAt(0,-3,10.6);');frames(10);live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');assert(live.includes('Tomorrow, then.'),'"Tomorrow, then." the next morning: '+JSON.stringify(live));R.skipped={collectFrom:22,until:22.5};}
  // (repair, H5) both players press "Order two sticks for tonight" in the same frame: one panel, and it carries his name line (spent by the panel shown)
  {run("dispatch('newgame');");disc39();nextday();read();run('S.time=10.8;S.money=9000;hxAt(0,-3,10.6,[0,1]);hxAt(1,-2.5,10.9,[-1,0]);');frames(12);assert(hsid(0)==='mallam40order'&&hsid(1)==='mallam40order','both at the order');
   run('PH="";PHN=0;hxPress(0);hxPress(1);hxFrames(1);hxRelease(0);hxRelease(1);hxFrames(1);');assert.equal(J('PHN'),1,'one panel for two same-frame presses');assert(/My name is Sani\./.test(J('panel.innerHTML')),'the panel shown carries his name line');run('closePanel();');R.sameFrame={panels:1,name:true};}
  // (repair 3, R3-1; owner decision 3, "He hands over your sticks afterwards.") the verifier's b3 shape: home at half past nine, a slow gist (every
  // line on its own timer) that ends after half past ten. He stays seated through it past half past ten, and at his grill for half an hour after
  // it ends, with Today's line; the collection works then. The next night (home at 21:42), uncollected: there at the end plus 0.45 h, gone at the end plus 0.5 h
  {const lateGist=(st)=>{run('S.time=10.8;S.money=9000;hxAt(0,-3,10.6,[0,1]);hxAt(1,-8,-10);');frames(10);press(0);click('mallam40Order',x=>x.data.v==='pepper');frames(4);assert.equal(J('hxB40().mallam.order'),'pepper','ordered');
    run('hxAt(0,-3,9.0,[0,1]);hxAt(1,-3.6,9.0,[0,1]);S.time='+(st-0.02)+';');frames(10);to(st);pair();assert(waitStart(3000)>=0,'a gist from '+st);assert(waitTalk()>=0,'its lines');
    let late=null;for(let k=0;k<8000&&EV()!=='idle';k++){frames(10);if(!late&&J('S.time')>=22.52&&EV()!=='idle')late={t:r3(J('S.time')),m:J('hxM()'),today:!!J('mallam40Today()')};}
    const end=J('S.time');frames(10);return {late,end};};
   nextday();const KP=J("mallamFill40(mallamLine40('kept'),{choice:MALLAM40.UI.choice.pepper})");const g=lateGist(21.5);
   assert(g.end>22.5,'the slow gist ends after half past ten ('+r3(g.end)+')');assert(g.late&&g.late.m.vis&&g.late.m.sit&&g.late.m.phase==='seated','seated by his grill through the gist past half past ten: '+JSON.stringify(g.late));
   assert.equal(J('hxM().phase'),'after','at his grill after the late gist');assert(J('hxM().vis'),'visible after it');assert(J('mallam40Today()'),'Today still says he is keeping them');
   assert(Math.abs(J('hxB40().mallam.gistEnd')-g.end)<0.01,'the gist\'s end kept in his record');
   run('hxAt(0,-3,11.2,[0,1]);S.money=9000;');frames(10);assert.equal(hsid(0),'mallam40collect','the collection after the late gist: '+label(0));press(0);frames(10);
   assert.equal(J('S.money'),7000,'₦2,000 on collection');assert.equal(J('hxB40().mallam.kept'),J('S.day'),'handed over after the late gist');
   live=J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');assert(live.includes(KP)&&J('hxM().vis'),'the kept line, and he stays while it shows: '+JSON.stringify(live));
   frames(160);assert(!J('hxM().vis'),'then he goes');R.lateGist={end:r3(g.end),seatedAt:g.late.t};
   nextday();const g2=lateGist(21.7);assert(g2.end>22.5,'the second slow gist ends after half past ten ('+r3(g2.end)+')');
   run('hxAt(0,-3,9.0,[0,1]);S.time='+(g2.end+0.45)+';');frames(10);assert(J('hxM().vis')&&J('mallam40Today()'),'still there with Today\'s line at the end plus 0.45 h');
   run('S.time='+(g2.end+0.52)+';');frames(10);assert(!J('hxM().vis'),'gone at the end plus half an hour');assert.equal(J('mallam40Today()'),null,'Today silent once it lapses');R.lateGist.margin=0.5;}
  // (repair 4, R4-2; owner decision 3, "he stays by his grill during the gist") no order waiting, a slow gist from half past nine that runs past
  // ten: he stays seated by his grill through it (the ten o'clock hide never cuts it), gets up when it ends, stands at his grill a short beat, and goes
  {nextday();run('hxAt(0,-3,9.0,[0,1]);hxAt(1,-3.6,9.0,[0,1]);S.time=21.48;');frames(10);to(21.5);pair();assert(waitStart(3000)>=0,'a gist from half past nine (no order)');assert(waitTalk()>=0,'its lines');
   assert(!J('hxB40().mallam&&hxB40().mallam.day===S.day&&hxB40().mallam.order'),'no order waiting tonight');
   let past=null,cut=null;for(let k=0;k<8000&&EV()!=='idle';k++){frames(10);if(EV()==='idle')break;const t=J('S.time');if(t<22)continue;const m=J('hxM()');if(!past&&t>=22.02)past={t:r3(t),m};if(!cut&&!(m.vis&&m.sit&&m.phase==='seated'))cut={t:r3(t),m};}
   const end=J('S.time');assert(end>22.25,'the slow gist runs past ten ('+r3(end)+')');assert(past&&!cut,'seated by his grill through the whole gist past ten with no order waiting: '+JSON.stringify({past,cut}));
   let up=null;for(let k=0;k<12&&!up;k++){frames(5);const m=J('hxM()');if(m.phase!=='seated')up=m;}
   assert(up&&up.vis&&!up.sit&&up.phase==='after','up from his stool and at his grill when it ends: '+JSON.stringify(up));frames(160);assert(!J('hxM().vis'),'gone a short beat after it');R.lateNoOrder={end:r3(end),seatedAt:past.t};}
  // (repair 4, R4-1; owner decision 3, "He hands over your sticks afterwards.") a reload during a late gist with an order waiting: the stores the game
  // itself saves while the gist talks (the verifier's two shapes: one before half past ten, from a gist at half past nine; one after it, from a
  // gist at 21:54), each booted in a fresh world (a child process, --boot40). The gist cannot come round again and the record carries the mark
  // made when it started (gistOn), so the reload counts as the gist's end: at his grill with Today's line, still there with it 0.45 h later, the
  // collection offered at the fan point, and paid. (repair 4, R4-6) The first boots at 844 x 390 with P(0) standing still where his bubble point
  // is just below that half (inside boardSeen40's 0.1 margin, outside the camera): "Your two sticks are ready." is not said there; walking up to
  // the fan point it is said once it will show (the point and the bubble's height inside the camera with no margin, and the clamp draws it)
  {const midStore=(st,from,below)=>{nextday();run('S.time=10.8;S.money=9000;hxAt(0,-3,10.6,[0,1]);hxAt(1,-8,-10);');frames(10);press(0);click('mallam40Order',x=>x.data.v==='onion');frames(4);
     run('hxAt(0,-3,9.0,[0,1]);hxAt(1,-3.6,9.0,[0,1]);S.time='+(st-0.02)+';');frames(10);to(st);pair();assert(waitStart(3000)>=0,'a gist from '+st);const t0=J('S.time');assert(waitTalk()>=0,'its lines');
     let raw=null,t=null;for(let k=0;k<8000&&EV()!=='idle';k++){frames(10);if(EV()==='idle')break;const tt=J('JSON.parse(localStorage.getItem(KEY)).time');if(tt>=from){raw=J('localStorage.getItem(KEY)');t=tt;break;}}
     assert(raw&&t>t0&&t<below,'the game saved during the gist between '+from+' and '+below+': '+JSON.stringify({t0:r3(t0),t:t&&r3(t),ev:EV()}));const rec=JSON.parse(raw).life.gist38.b40.mallam;
     assert(rec.order==='onion'&&rec.gistOn===J('S.day')&&rec.gistEnd===undefined,'the saved record carries the mark of a gist begun with the order waiting, and no end: '+JSON.stringify(rec));untilIdle();return {raw,t};};
   const A=midStore(21.5,22.25,22.5),B=midStore(21.9,22.5,23.5);const KO=J("mallamFill40(mallamLine40('kept'),{choice:MALLAM40.UI.choice.onion})");
   const pj=require('path').join,tmp=fs.mkdtempSync(pj(os.tmpdir(),'cd40-boot-'));let a,b;
   try{const boot=(raw,mode)=>{const f=pj(tmp,mode+'.json');fs.writeFileSync(f,raw);return JSON.parse(cp.execFileSync(process.execPath,[__filename,'--boot40',f,mode],{env:process.env,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop());};
    a=boot(A.raw,'phone');b=boot(B.raw,'desk');}finally{fs.rmSync(tmp,{recursive:true,force:true});}
   for(const [n,x,s0] of [['the 22:15-22:30 store',a,A],['the store past half past ten',b,B]]){assert(!x.error,n+': the boot: '+x.error);
    assert(x.boot.vis&&['lit','after'].includes(x.boot.phase)&&x.boot.today&&x.boot.ev==='idle',n+': after the reload at his grill with Today\'s line: '+JSON.stringify(x.boot));
    assert(Math.abs(x.boot.end-s0.t)<0.02&&x.boot.on===x.boot.day,n+': the reload counted as the gist\'s end: '+JSON.stringify(x.boot));
    assert(x.later.vis&&x.later.today&&x.later.id==='mallam40collect',n+': still there 0.45 h after the reload with Today\'s line, the collection offered at the fan point: '+JSON.stringify(x.later));
    assert(x.collected.money===7000&&x.collected.kept===x.boot.day&&x.collected.live.includes(KO)&&!x.collected.today,n+': collected (₦2,000, the kept line, Today silent): '+JSON.stringify(x.collected));}
   assert(b.boot.t>22.5,'the second store past half past ten ('+b.boot.t+')');
   assert(a.still.ready===0&&a.stillSeen[0]===true&&a.stillSeen[1]===false,'844 x 390, P(0) standing still 5 s at (-4, 8.5): his bubble point inside boardSeen40\'s margin but not the camera, and "Your two sticks are ready." not said: '+JSON.stringify([a.still,a.stillSeen]));
   assert(a.walk&&a.walk.zero[0]&&a.walk.zero[1]&&a.walk.drawn&&a.walk.live,'844 x 390: walking up it is said once it will show (no margin at the point and at the bubble\'s height; the clamp draws it): '+JSON.stringify(a.walk));
   R.reload={stores:[r3(A.t),r3(B.t)],until:[a.boot.until,b.boot.until],phoneReadyAt:a.walk.d};}
  // (repair 3, R3-2) a thumb tapping Act four times a second for three seconds after the fan beat (the hunt's SCREEN-1 shape) at 390 x 844 and
  // at 844 x 390, each tap a pointer down (dailyPointer40), the touch Act, a pointer up and the click landing on the first button of any v40
  // panel open under the thumb (as on an upright phone, where Taste lies over Act): it presses nothing, spends nothing, and the name line stays
  // unused until the panel carrying it has been open with no tap for 1.0 s. Then a deliberate tap tastes; taps straight after it buy nothing
  // for two seconds. At 844 x 390 also the morning: an order panel opened by a tap and closed under the thumb leaves the name line unused
  run(`var hxTap40=(i,up)=>{foundPointer38(true);dailyPointer40();act[i]=true;hxFrames(3);foundPointer38(false);let pressed=null;
    if(dailyPanel40()){const el=String(panel.innerHTML).match(/<button\\b[^>]*data-act="([^"]+)"[^>]*>/);if(el){const e={target:{closest:s=>s==='.gist40-panel'?{}:null}};
     if(!dailyClick40(e)&&!foundPanelClick38(e)){const data={};for(const x of el[0].matchAll(/data-(?!act)([\\w-]+)="([^"]*)"/g))data[x[1]]=x[2];pressed=el[1];dispatch(el[1],data);}}}
    hxFrames(up);return pressed;};
   var hxHeld40=null;panel.classList.toggle=function(c,on){if(c==='gist40-held')hxHeld40=!!on;};`);
  R.thumb={};
  for(const [W,H] of [[390,844],[844,390]]){const tag=W+'x'+H;run("dispatch('newgame');");disc39();nextday();read();assert(!J('hxB40().once.mallamName'),tag+': the name line not yet said');
   run(`hxScreen(${W},${H},true);`);
   if(W>H){run('S.time=10.8;S.money=9000;hxAt(0,-3,10.6,[0,1]);hxAt(1,-8,-10);');frames(10);assert.equal(hsid(0),'mallam40order','the order prompt');const pr=[];for(let k=0;k<7;k++)pr.push(J(`hxTap40(0,${k&1?5:4})`));
    assert(J('overlayOpen()')&&/My name is Sani\./.test(J('panel.innerHTML')),tag+': the order panel opened by the first tap carries the name line');assert(pr.every(x=>x===null),tag+': taps on the order panel press nothing: '+JSON.stringify(pr));
    run('closePanel();');frames(4);assert(!J('hxB40().once.mallamName')&&!J('hxB40().mallam&&hxB40().mallam.order'),tag+': closed under the thumb: no order, the name line unused');}
   run('S.time=16.98;S.money=9000;hxAt(0,-3,11.2,[0,1]);hxAt(1,-8,-10);');frames(10);to(17.005);frames(4);run('PH="";');const bt=beat(false);assert(J('MALLAM40.run.done')&&!J('overlayOpen()'),tag+': the beat done, no panel');
   const money0=J('S.money'),fl=J('JSON.stringify(mallamFlagsNow40())'),seq=[];
   for(let k=0;k<12;k++){const pressed=J(`hxTap40(0,${k&1?5:4})`);seq.push({pressed,open:J('overlayOpen()'),name:!!J('hxB40().once.mallamName'),held:J('DAILY40.hold>FOUND38.t'),dim:J('hxHeld40')});}
   // (repair 4, R4-7) while the hold runs the panel's buttons are dimmed (gist40-held on #panel), so a player knows to wait
   assert(seq.some(x=>x.open&&x.held)&&seq.filter(x=>x.open&&x.held).every(x=>x.dim===true),tag+': the buttons dimmed while the hold runs: '+JSON.stringify(seq.map(x=>[x.open,x.held,x.dim])));
   assert(seq.every(x=>x.pressed===null),tag+': four taps a second for three seconds press nothing: '+JSON.stringify(seq));assert.equal(J('S.money'),money0,tag+': nothing spent');assert.equal(J('JSON.stringify(mallamFlagsNow40())'),fl,tag+': no base round bought');
   assert.equal(J('hxB40().mallam.tasted'),0,tag+': not tasted');assert(seq.some(x=>x.open)&&J('overlayOpen()')&&/My name is Sani\./.test(J('panel.innerHTML')),tag+': the taste panel opened by a tap carries the name line: '+JSON.stringify(seq));
   assert(seq.every(x=>!x.name),tag+': the name line unused while the thumb taps');frames(16);assert(!J('hxB40().once.mallamName'),tag+': still unused 0.8 s after the last tap\'s press');
   frames(12);assert.equal(J('hxB40().once.mallamName'),J('S.day'),tag+': spent once the panel has been open with no tap for 1.0 s (seen)');
   assert(J('overlayOpen()')&&J('!(DAILY40.hold>FOUND38.t)')&&J('hxHeld40')===false,tag+': undimmed once the hold has run out, the panel still open');assert(logHas('mallam','name'),tag+': the log');
   assert.equal(J('hxTap40(0,4)'),'mallam40Taste',tag+': a deliberate tap after it presses Taste');assert(J('hxB40().mallam.tasted')===J('S.day')&&!J('overlayOpen()'),tag+': tasted');
   const after=[];for(let k=0;k<6;k++)after.push([J(`hxTap40(0,${k&1?5:4})`),J('hotspotCache[0]?hotspotCache[0].id:""')]);
   assert.equal(J('S.money'),money0,tag+': taps straight after the taste buy nothing: '+JSON.stringify(after));assert.equal(J('JSON.stringify(mallamFlagsNow40())'),fl,tag+': no base round in the two seconds after the taste panel closes');
   assert(after.every(x=>x[0]===null&&x[1]==='mallam40hush'),tag+': "The coals are going." there, pressing nothing: '+JSON.stringify(after));
   frames(40);assert.equal(hsid(0),'suya',tag+': then the base round is offered again');run('hxScreen(1280,800,false);');R.thumb[tag]={taps:12,pressed:0,spent:0,nameSeenAfterQuiet:1.0};}
  return R;});

 check(11,()=>{const R={};assert(has40(),'the module');
  const keysOf=()=>J('[Object.keys(JSON.parse(localStorage.getItem(KEY))).join(),Object.keys(JSON.parse(localStorage.getItem(KEY)).life||{}).join()]');
  const one=name=>{const k0=keysOf();run('S=load();enterWorld();closePanel();S.time=10.7;');frames(60);run('save();');const k1=keysOf();assert.deepEqual(k1,k0,name+': the keys of S and S.life');
   assert.equal(J('!!(JSON.parse(localStorage.getItem(KEY)).life.gist38&&JSON.parse(localStorage.getItem(KEY)).life.gist38.b40)'),false,name+': no G.b40');};
  run("dispatch('newgame');hxFresh(8,10.7);life34().evening35={doneDay:3};save();");one('v35');
  run("S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i95',type:'bench',x:0,y:4,rot:0,pose36:'out'});save();");one('v36');
  run("S.life.football37={v:2,found:2,played:1,last:{day:S.day-1}};save();");one('v37');
  run("dispatch('newgame');");disc();for(let k=0;k<4;k++)nextday();run('save();');one('v38');assert(J('hxTag40()').includes('card'),'the world card on a v38 save past day 8');
  run("dispatch('newgame');");disc39();run('save();');one('v39');R.saves=['v35','v36','v37','v38','v39'];
  // a v40 save loads in the v39 build (a copy of dist without the v40 tags) with b40 kept
  read();run('save();');const b40=J('JSON.stringify(hxB40())');assert(b40&&b40!=='null','a v40 record');
  {const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'cd40-save-'));const f=path.join(tmp,'save.json');fs.writeFileSync(f,J('localStorage.getItem(KEY)'));const d=variantDir(html=>strip(html,TAGS40));
   try{const r=JSON.parse(cp.execFileSync(process.execPath,[__filename,'--loadsave',f],{env:{...process.env,COMPOUND_GAME_DIR:d},encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop());
    assert(!r.error,'the v39 build on a v40 save: '+r.error);assert.equal(r.v40,false,'no v40 there');assert.equal(r.b40,b40,'the v40 record kept untouched by the v39 build');R.v39build={b40:'kept'};}
   finally{fs.rmSync(tmp,{recursive:true,force:true});fs.rmSync(d,{recursive:true,force:true});}}
  assert.equal(J('!!(stripState().life&&stripState().life.gist38)'),false,'stripState drops life.gist38');
  // online: no v40 object; offline: back
  frames(10);assert(J('hxTag40()').includes('card'),'the card up');run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");frames(12);assert.deepEqual(J('hxTag40()'),[],'online: no v40 object');
  run('NET.on=false;');frames(12);assert(J('hxTag40()').includes('card'),'offline: back');
  // teardown with the cards, the thing, Mallam and a bubble out: newconfirm, newgame, an enterWorld into day 2, online
  run('S.time=10.9;hxAt(0,-3,10.6);');frames(12);const t0=J('hxTag40()');assert(t0.includes('mallam')&&t0.includes('thing'),'Mallam and the thing out: '+JSON.stringify(t0));
  // (repair, H8) the question alone changes nothing ("Start over?", then "No, keep it"); only the confirmed new household tears down
  {const m0=J('[BOARD40.mem.readDay,BOARD40.mem.readKey,BOARD40.mem.bubDay]');run('ACTIONS.newconfirm();');assert.deepEqual(J('hxTag40()'),t0,'the question changes nothing in the scene');run('closePanel();');frames(12);
   assert.deepEqual(J('hxTag40()').filter(x=>x!=='bubble'),t0.filter(x=>x!=='bubble'),'"No, keep it": nothing changed');assert.deepEqual(J('[BOARD40.mem.readDay,BOARD40.mem.readKey,BOARD40.mem.bubDay]'),m0,'the board\'s memory kept');
   run('S.time=16.98;hxAt(0,-3,11.2,[0,1]);hxAt(1,-8,-10);');frames(10);to(17.01);frames(4);let n=0;for(let k=0;k<80&&n<9;k++){if(hsid(0)==='mallam40fan'){run('hxPress(0);');n++;}frames(1);run('hxRelease(0);');frames(10);}
   const g0=J('MALLAM40.run.glow');run('ACTIONS.newconfirm();');run('closePanel();');frames(2);const g1=J('MALLAM40.run.glow');
   assert(g0>0.2&&g1>g0-0.05&&J('MALLAM40.run.fanned').includes(0),'mid fan beat, "No, keep it": the glow and who fanned kept: '+JSON.stringify([g0,g1,J('MALLAM40.run.fanned')]));R.keepIt={glow:[r3(g0),r3(g1)]};}
  run("dispatch('newgame');");assert.deepEqual(J('hxTag40()'),[],'after newgame');
  disc39();read();run('S.time=12.6;');frames(4);const er=J('board40Errand(S.day)');settled(er.sender);const s=npcAt(er.sender);approach(0,s[0],s[1],1.2,2.0);press(0);frames(4);assert(J('hxTag40()').includes('parcel'),'the parcel');
  run('S.day=2;enterWorld();closePanel();');assert.deepEqual(J('hxTag40()'),[],'after an enterWorld into day 2');frames(12);assert.deepEqual(J('hxTag40()'),[],'and it stays down');
  run("dispatch('newgame');");disc39();read();run('S.time=10.9;hxAt(0,-3,10.6);');frames(12);assert(J('hxTag40()').length>0,'there');run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");frames(12);
  assert.deepEqual(J('hxTag40()'),[],'after going online');run('NET.on=false;');R.teardown=['newconfirm','newgame','enterWorld day 2','online'];
  // quiet construction: no Math.random call in v40's builds (hero and lite Mallam, the cards, the thing, its glint, the parcel, the bubbles, the
  // stool, the glow, the fan)
  run("dispatch('newgame');");disc39();run('hxQC.n=0;');read();run('S.time=10.9;hxAt(0,-3,10.6);');frames(12);run('S.time=12.6;');frames(4);
  {const e=J('board40Errand(S.day)');settled(e.sender);const p=npcAt(e.sender);approach(0,p[0],p[1],1.2,2.0);press(0);frames(4);}
  run('S.time=17.05;hxAt(0,-3,11.2);');frames(12);for(let k=0;k<4;k++){press(0);frames(14);}const qh=J('hxQC.n');
  run("dispatch('newgame');");disc39();run("HERO.state='loading';hxQC.n=0;");read();run('S.time=10.9;hxAt(0,-3,10.6);');frames(12);const lite=J('MALLAM40.world.lite');run("HERO.state='ready';");frames(12);const rebuilt=!J('MALLAM40.world.lite');const ql=J('hxQC.n');
  assert(lite&&rebuilt,'the lite body while the hero is not ready, then the hero once');assert.deepEqual([qh,ql],[0,0],'Math.random calls in v40\'s builds [hero day, lite and rebuild]');R.quiet={builds:0};
  assert.deepEqual(J('[hxDirect40.pn,hxDirect40.dn,hxDirect40.mr]'),[0,0,0],'direct reads [performance.now, Date.now, Math.random]');
  for(const f of ['board-v40.js','mallam-v40.js']){const src=fs.readFileSync(path.join(GAME,'src',f),'utf8');assert(!/performance\.now|Date\.now|new Date|Math\.random\(\)|showBubble\(|TICK_HOOKS\.push|CUE35_HOOKS\.push/.test(src),'a wall-clock read, a Math.random call, the base showBubble or a hook list push in '+f);}
  // the cost: an inert frame (day 3, 10:00) and frames with the card up (layer 2, undiscovered): no blocked() or levelAt() call, no new object
  run('hxFresh(3,10);');away(1);frames(2);const b0=J('BOARD40.cost.builds+MALLAM40.cost.builds');run('hxCost40.b=0;hxCost40.l=0;');frames(600);
  assert.deepEqual(J('[hxCost40.b,hxCost40.l,hxTag40().length,BOARD40.cost.builds+MALLAM40.cost.builds-'+b0+']'),[0,0,0,0],'an inert frame: [blocked, levelAt, objects, builds] over 600 frames');
  run("dispatch('newgame');");disc39();run('S.time=10.6;hxAt(0,1,-3);');frames(12);const b1=J('BOARD40.cost.builds');run('hxCost40.b=0;hxCost40.l=0;');frames(600);
  assert.deepEqual(J('[hxCost40.b,hxCost40.l,BOARD40.cost.builds-'+b1+']'),[0,0,0],'600 frames with the card up: [blocked, levelAt, builds]');
  R.cost={inert:'0 blocked, 0 levelAt, 0 objects over 600 frames',cardUp:'0 blocked, 0 levelAt, no rebuild'};
  return R;});

 /* ======================================================================================================================================
    Engineer B's checks: 5, 6, 7, 10, 12 (the children's things, the gist, the repeats, Today and the log, the copy)
    ====================================================================================================================================== */
 const SEEN40=[];const seen=t=>{if(t)SEEN40.push(String(t).replace(/<[^>]+>/g,' ').replace(/&#39;/g,'’').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim());};
 const fb=()=>J("typeof FOOTBALL37!=='undefined'&&FOOTBALL37?{state:FOOTBALL37.state,kids:FOOTBALL37.kids?Object.keys(FOOTBALL37.kids).map(k=>FOOTBALL37.kids[k].mode).join():null}:null");
 const kid=()=>J('hxB40()&&hxB40().kid');
 const kidTags=()=>tags().filter(t=>t==='kid').length;
 const toDay=d=>{let n=0;while(J('S.day')<d&&n<80){nextday();n++;}assert.equal(J('S.day'),d,'reached day '+d);};
 // a real match through football's own end: the children out (a player within 12 m of the pitch in their hours), the goals in football's own
 // stats, fbEnd37; then the summary and the clearing until football is idle again
 const realEnd=(res,goals)=>{run("if(!globalThis.hxEnd40On&&typeof football37On==='function'){globalThis.hxEnd40On=1;football37On('end',()=>{globalThis.hxEnd40={day:S.day,t:S.time};});}");run('hxAt(0,-23,12.9,[0,-1]);hxAt(1,-22,12.9,[0,-1]);');for(let k=0;k<20&&!J('!!FOOTBALL37.kids');k++)frames(3);assert(J('!!FOOTBALL37.kids'),'the children are out');
  run(`FOOTBALL37.stats={kicks:{},passes:{},calls:0,outs:0,goals:${JSON.stringify(goals.map(w=>({who:w.replace(':og',''),own:/:og$/.test(w)})))},streetCall:false,motor:false,challenges:0};FOOTBALL37.score=[2,1];fbEnsureSave37();fbEnd37(${JSON.stringify(res)});`);
  let n=0;while(J('FOOTBALL37.state')!=='idle'&&n<3000){frames(10);n+=10;}assert.equal(J('FOOTBALL37.state'),'idle','football idle after the end');};
 // the children's exit by the fade: everyone more than 18 m away for 5 s
 const leaveFade=()=>{run('hxAt(0,-5,-2);hxAt(1,-5.6,-2);');let n=0;while(J('!!FOOTBALL37.kids')&&n<900){frames(10);n+=10;}assert(!J('!!FOOTBALL37.kids'),'the children faded');};
 const kidAt=k=>J(`FOOTBALL37.kids&&FOOTBALL37.kids.${k}&&!FOOTBALL37.kids.${k}.gone?[FOOTBALL37.kids.${k}.g.position.x,FOOTBALL37.kids.${k}.g.position.z]:null`);
 const bubbles=()=>J('Object.keys(BOARD40.world.bub)');
 const nearKid=(i,k)=>{const p=kidAt(k);assert(p,k+' is out');run(`hxAt(${i},${p[0]+0.95},${p[1]},[-1,0]);`);frames(2);return p;};
 const atSpot=(i,sp)=>{run(`hxAt(${i},${sp[0]+0.85},${sp[1]},[-1,0]);`);frames(3);};
 const nkechiAt=i=>{assert(settled('nkechi'),'Mama Nkechi is at her shop');const p=npcAt('nkechi');approach(i,p[0],p[1],1.2,2.0);};
 // a fixture through save() and load() (v38/v39 state the checks cannot reach by play in a few frames)
 run("var hxFix40=fn=>{save();const o=JSON.parse(localStorage.getItem(KEY));fn(o,o.life.gist38);localStorage.setItem(KEY,JSON.stringify(o));S=load();enterWorld();closePanel();hxFrames(2);};");
 // a gist by the engine with Next pressed through each line (as a player does), the visit's script and meta, the lines shown
 const gistFast=(max)=>{const st=waitStart(max||3000);if(st<0)return null;const v=J("GIST38.visit?{guests:GIST38.visit.guests.slice(),script:GIST38.visit.script.map(s=>({id:s.id,k:s.k,cat:s.cat||null,v40k:s.v40k||null,tip:s.tip?1:0,info:s.info?1:0,trans:s.trans?1:0,swap40:s.swap40||null,g40:s.g40?1:0,g40t:s.g40t||null,today:s.today||null,v39:s.v39||null,v39k:s.v39k||null,once:s.once||null,open:s.open?1:0,kid40:s.kid40||null,text:s.text})),meta:GIST38.visit.script.g40||null,g39:typeof GIST38.visit.script.g39==='object'&&GIST38.visit.script.g39?GIST38.visit.script.g39:null}:null");
  const tk=waitTalk();if(tk<0)return {v,shown:[],aborted:true};let stool=null;let n=0;while(EV()==='talking'&&n<60){frames(20);if(!stool&&J('!!GIST39.stool'))stool=J('GIST39.stool.k');run('EVENING35.next();');n++;}
  untilIdle();const shown=J("(hxG().last&&hxG().last.day===S.day)?hxG().last.ids.slice():[]");return {v,shown,stool,lines:J('EVENING35.lines?EVENING35.lines.map(l=>l.id):[]')};};
 // the facts of today's match, from football's saved record (an independent reading for the match line's eligibility)
 const factsNow=()=>J(`(()=>{const L=S.life.football37,l=L&&L.last;if(!l||l.day!==S.day||typeof l.result!=='string'||!Array.isArray(l.scorers))return null;const n={};let og=false;
  for(const s of l.scorers){if(/:og$/.test(s)){if(/^(p0|p1|ai)/.test(s))og=true;continue;}n[s]=(n[s]|0)+1;}const top=k=>(n[k]|0)>0&&Object.keys(n).every(o=>o===k||(n[o]|0)<(n[k]|0));const se=season(S.day);
  const w=S.weather;return {won:l.result==='won',lost:l.result==='lost',unf:l.result!=='won'&&l.result!=='lost',last:!!l.last&&l.result!=='unfinished',called:!!l.called,kemi:top('kemi'),emeka:top('emeka'),og,first:!!(L.firsts&&L.firsts.win===S.day),
   rain:!!(w&&w.day===S.day&&typeof w.rainAt==='number'&&S.time>=w.rainAt),dry:se==='dry',harm:se==='harmattan',any:true,
   // (repair 5) from the harness's own record of football's end event: the rain began before the match ended; it ended at noon or later; no photo
   wet:(()=>{const e=globalThis.hxEnd40;return !!(w&&w.day===S.day&&typeof w.rainAt==='number'&&S.time>=w.rainAt&&e&&e.day===S.day&&w.rainAt<e.t);})(),
   aft:(()=>{const e=globalThis.hxEnd40;return !!(e&&e.day===S.day&&e.t>=12);})(),nopic:!(L.firsts&&(L.firsts.win===S.day||L.firsts.last===S.day))};})()`);
 const RESULTS=[['won',['p0','kemi','p1']],['lost',['kemi','kemi','p0']],['unfinished',['emeka','p1']],['won',['p0','p1:og','p1','emeka']],['lost',['emeka','emeka','kemi','p1']],['won',['p1','p0']]];

 /* ---------- check 5: Kemi's and Emeka's things (spec §7) ---------- */
 check(5,()=>{const R={};assert(has40(),'the module');const K=J('GIST40.KIDS'),L=J('GIST40.LINES.kid'),U=J('GIST40.UI');
  // the children's say/aff calls recorded (they are not in CAST: never)
  run("var hxKidCalls=[];{const s=say,a=aff;say=function(w){if(w==='kemi'||w==='emeka')hxKidCalls.push('say:'+w);return s.apply(this,arguments);};aff=function(w){if(w==='kemi'||w==='emeka')hxKidCalls.push('aff:'+w);return a.apply(this,arguments);};}");
  // (a) the spots: free at PR and PR + 0.5, level, not in a flat, outside the pitch plus 1 m and football's keep region, west of x -17, 2.2 m
  // from every prompt and lost-thing spot (v38's, v39's rounds, the card things' areas, Mallam's points), outside the guest patch, 2.4 m from
  // Aunty Bisi's route, the ground under them bare (rays from 2.5 m), reachable from the flat's door (A* on a 0.25 m grid)
  const pr=J(`(()=>{const F=FOOTBALL37,K=GIST40.KIDS,bad=[],P=F.PITCH,KP=F.KEEP;const pts=[[0,-5.5],[-3,11.2],[3,12.5],[12.4,14.2],[26.4,0],[-22,-4.0],[0,-17.7],[-6,-15.2],[6,-15.2],[-6,-19.3],[6,-19.3],MALLAM40.spot,[-4.2,13.0]];
   for(const st of STALLS){const dir=st.z<0?1:-1;pts.push([st.x,st.z+dir*1.1]);}for(let i=0;i<FOUND38.LOST.length;i++)for(const s of FOUND38.LOST[i].spots)pts.push([s[0],s[1]]);
   for(let i=7;i<=30;i++){const e=rotEntry39(i);if(e)for(const s of e.spots)pts.push([s[0],s[1]]);}for(const a in BOARD40.AREAS)for(const s of cardSpots40(a))pts.push([s[0],s[1]]);
   const R0=BISI39.ROUTE,T=BISI39.STROLL,bisi=[];for(let x=T.x0;x<=T.x1+1e-9;x+=0.25)bisi.push([x,T.z]);bisi.push(R0.rail,R0.stop);
   const rc=new THREE.Raycaster(),objs=[];scene.updateMatrixWorld(true);scene.traverse(o=>{if(o.isMesh&&o.visible&&!(o.material&&o.material.transparent&&o.material.opacity<0.05)&&!(o.userData&&(o.userData.gist38||o.userData.gist39||o.userData.gist40||o.userData.football37))&&!players.some(p=>{let q=o;while(q){if(q===p.g)return true;q=q.parent;}return false;}))objs.push(o);});
   const top=(x,z)=>{rc.set(new THREE.Vector3(x,2.5,z),new THREE.Vector3(0,-1,0));const h=rc.intersectObjects(objs,false);return h.length?2.5-h[0].distance:null;};
   const STEP=0.25,X0=-40,Z0=-10,NX=200,NZ=110,free=new Int8Array(NX*NZ).fill(-1);const isFree=(ix,iz)=>{const k=iz*NX+ix;if(free[k]>=0)return free[k]===1;const x=X0+ix*STEP,z=Z0+iz*STEP;const v=!blocked(x,z,PR,{lvl:0,noCrate:true})&&Math.abs(levelAt(x,z))<0.3;free[k]=v?1:0;return v;};
   const reach=(fx,fz,tx,tz)=>{const ci=x=>Math.round((x-X0)/STEP),cj=z=>Math.round((z-Z0)/STEP);const s=[ci(fx),cj(fz)],t=[ci(tx),cj(tz)];const seen=new Uint8Array(NX*NZ),q=[s];seen[s[1]*NX+s[0]]=1;
    while(q.length){const [x,z]=q.shift();if(Math.abs(x-t[0])<=1&&Math.abs(z-t[1])<=1)return true;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const u=x+a,v=z+b;if(u<0||v<0||u>=NX||v>=NZ||seen[v*NX+u]||!isFree(u,v))continue;seen[v*NX+u]=1;q.push([u,v]);}}return false;};
   const out=[];for(const [x,z] of K.spots){const why=[];if(blocked(x,z,PR,{lvl:0,noCrate:true}))why.push('blocked at PR');if(blocked(x,z,PR+0.5,{lvl:0,noCrate:true}))why.push('blocked at PR + 0.5');
    if(Math.abs(levelAt(x,z))>1e-6)why.push('not level');if(inFlat(x,z))why.push('in a flat');if(x>=P.x1-1&&x<=P.x2+1&&z>=P.z1-1&&z<=P.z2+1)why.push('inside the pitch plus 1 m');
    if(x>=KP.x1&&x<=KP.x2&&z>=KP.z1&&z<=KP.z2)why.push('inside football\\'s keep region');if(!(x<-17))why.push('east of x -17');
    const dp=Math.min(...pts.map(p=>Math.hypot(p[0]-x,p[1]-z)));if(!(dp>2.2))why.push('a prompt or lost-thing spot at '+dp.toFixed(2)+' m');
    if(x>=-9.8&&x<=-1.4&&z>=7.8&&z<=9.2)why.push('in the guest patch');const db=Math.min(...bisi.map(p=>Math.hypot(p[0]-x,p[1]-z)));if(db<2.4)why.push('Aunty Bisi at '+db.toFixed(2)+' m');
    let mx=-1;for(const [dx,dz] of [[0,0],[0.3,0],[-0.3,0],[0,0.3],[0,-0.3]])mx=Math.max(mx,top(x+dx,z+dz)??-1);if(mx>0.1)why.push('covered at '+mx.toFixed(2)+' m');
    if(!reach(-3.95,6.6,x,z))why.push('unreachable from the door');out.push({x,z,near:+dp.toFixed(2)});if(why.length)bad.push('('+x+', '+z+'): '+why.join(', '));}
   return {bad,out};})()`);
  assert.deepEqual(pr.bad,[],'the children\'s spots: '+JSON.stringify(pr.bad));R.spots=pr.out.map(s=>[s.x,s.z,s.near]);
  // the leads: Emeka's thing to Mama Nkechi below the card thing's 1.1, the pot's 1.15 and v38's give 1.2 (they win a tie); the child's give
  // between v39's bag (0.6) and Play (0.4)
  const leads=J("({shop:GIST40.KIDS.shopLead,card:BOARD40.GIVE_LEAD,pot:GIST39.POT.lead,kid:GIST40.KIDS.lead,bag:BISI39.KIDS_LEAD!==undefined?BISI39.KIDS_LEAD:0.6})");
  assert(leads.shop<leads.card&&leads.shop<leads.pot&&leads.shop<1.2,'Emeka\'s thing to Mama Nkechi loses ties to the card thing, the pot and v38\'s give: '+JSON.stringify(leads));
  assert(leads.kid<leads.bag&&leads.kid>0.4,'the child\'s give between the bag and Play: '+JSON.stringify(leads));R.leads=leads;
  // (b) the rate, pure from the hash and the two-day rule, for a household that plays every day 5 to 60: about one match day in three, and every
  // morning-match day that the rule allows
  const sched=J(`(()=>{let last=0;const out=[],sat=[];for(let d=5;d<=60;d++){const isSat=fbWeekday37(d)===0;const ok=!(last&&d-last<=GIST40.KIDS.gap)&&(isSat||hash38(d,44)%GIST40.KIDS.every===0);if(ok){out.push(d);last=d;}if(isSat)sat.push([d,ok]);}return {out,sat};})()`);
  const hd=J('Array.from({length:56},(_,i)=>i+5).filter(d=>hash38(d,44)%GIST40.KIDS.every===0).length'),rate=sched.out.length/56;assert(hd/56>0.25&&hd/56<0.42,'the hash picks about one match day in three: '+hd+' of 56');
  assert(rate>0.18&&rate<0.4,'with the two-day gap and the morning-match days: '+sched.out.length+' of 56');assert(sched.sat.every(([d,ok],k)=>ok||sched.out.some(x=>d-x>0&&d-x<=2)),'every morning-match day the gap allows');assert(sched.out.every((d,k)=>k===0||d-sched.out[k-1]>2),'never two days running, two days\' gap');
  R.rate={hashDays:hd,days:sched.out.length,of:56,sat:sched.sat.filter(x=>x[1]).map(x=>x[0])};
  // (c) no drop without v40 discovery: v38 discovered, day 6 (one of the hash's days), a real match and the children's exit: nothing
  disc();toDay(6);assert(J('hash38(6,44)%3===0'),'day 6 is a child\'s day by the hash');run('S.time=15.6;');realEnd('won',['p0']);leaveFade();
  assert(!B40()&&!kidTags()&&!logHas('kid','drop marble'),'nothing without v40: '+JSON.stringify({b40:!!B40(),tags:tags()}));R.undiscovered='no drop';
  // v40 discovered on day 8 (v38 only: layer 2 from day 8) by the first read
  toDay(8);read();assert(B40(),'v40 discovered');
  // (d) a morning-match day (day 8): the morning match, its exit (no drop before 14:00), then at 14:00 the drop in the children's afternoon play
  assert(J('fbWeekday37(8)')===0,'day 8 a morning-match day');run('S.time=10.6;');realEnd(RESULTS[0][0],RESULTS[0][1]);leaveFade();
  assert.equal(kid(),null,'no drop at the morning exit');assert.equal(J('kid40Today()'),null,'Today has nothing before 14:00');
  run('S.time=13.9;hxAt(0,-23,13.9,[0,-1]);hxAt(1,-8,-10);');frames(20);assert(J('!!FOOTBALL37.kids'),'the children back out for the afternoon');const fb0=J('JSON.stringify(S.life.football37)');
  run('S.time=14.0;');frames(12);let k=kid();assert(k&&k.state==='lost'&&k.at==='afternoon'&&k.who==='emeka'&&k.id==='marble'&&k.day===8,'the afternoon drop: '+JSON.stringify(k));
  const sh=L.shoutAft.emeka[1].replace('{thing}',L.items.marble.name);assert(bubbles().includes(sh),'Emeka\'s call over him: '+JSON.stringify(bubbles()));seen(sh);
  assert(logHas('kid','drop marble'),'kid drop logged');const tl=J('kid40Today()');assert(tl&&tl.html===J(`esc(${JSON.stringify(U.todayAft.replace('{child}','Emeka').replace('{pron}','his').replace('{name}',L.items.marble.name))})`),'Today from 14:00: '+JSON.stringify(tl));seen(tl.html);
  assert.equal(kidTags(),2,'the thing and its glint in the world at once');assert(k.spot[1]===13.9&&K.spots.some(s=>s[0]===k.spot[0]),'on a z 13.9 spot');
  // picked up at once (1.3 m, lead 0.25), by keys; the toast; into the hand (not drawn)
  atSpot(0,k.spot);assert.equal(hsid(0),'kid40pick','the pick prompt: '+label(0));assert.equal(label(0),'Pick up '+L.items.marble.pickLabel);run('TOASTS=[];');press(0);
  k=kid();assert.equal(k.state,'hand','in the hand');assert.equal(kidTags(),0,'nothing drawn in the hand');const tst=J('TOASTS.slice()');assert(tst.some(t=>/^Emeka’s best marble\./.test(t)),'the toast: '+JSON.stringify(tst));tst.forEach(seen);assert(logHas('kid','pick marble'),'kid pick logged');
  // given to Emeka at the pitch (football idle): his prompt beats Play; his thanks, then the play line; no friendship, no money
  const money0=J('S.money');nearKid(0,'emeka');assert.equal(hsid(0),'kid40give','the give prompt beside Emeka: '+label(0)+' '+JSON.stringify(cands(0)));assert.equal(label(0),'Give Emeka his best marble');
  assert(cands(0).some(c=>/37$/.test(c)),'football\'s prompt (Play, Wait) is offered too, and loses: '+JSON.stringify(cands(0)));
  press(0);k=kid();assert(k.state==='back'&&k.to==='emeka'&&k.backDay===8,'back to Emeka: '+JSON.stringify(k));assert(bubbles().includes(L.ty.marble[1]),'his thanks over him');seen(L.ty.marble[1]);
  for(let f=0;f<130;f++)frames(1);assert(bubbles().includes(L.play.emeka[1]),'then the play line');seen(L.play.emeka[1]);assert.equal(J('S.money'),money0,'no money');assert(logHas('kid','back marble'),'kid back logged');
  assert.equal(J('JSON.stringify(S.life.football37)'),fb0,'football\'s save untouched by the drop, the pick and the give');
  // (e) never two days running: day 9 (a hash day) one day after: a real match and its exit, no drop
  nextday();assert(J('hash38(9,44)%3===0'),'day 9 a hash day');run('S.time=15.2;');realEnd(RESULTS[1][0],RESULTS[1][1]);leaveFade();assert(kid().day===8,'no drop the next day (the two-day gap)');
  // (f) day 11, the fade exit: Kemi's hair band; it lies on the sand; never to an adult (Mama Nkechi, Mr. Bassey); the next day Kemi asks once,
  // then has it back at the pitch
  // no drop with a synthetic record (v38 check 8's and v39 check 10's fixtures: last:{day}, no result, no scorers): day 11, a hash day the gap allows
  toDay(11);run('S.time=15.6;hxAt(0,-23,12.9,[0,-1]);hxAt(1,-22,12.9,[0,-1]);');for(let f=0;f<20&&!J('!!FOOTBALL37.kids');f++)frames(3);assert(J('!!FOOTBALL37.kids'),'the children out');
  run('fbEnsureSave37();S.life.football37.last={day:S.day};FOOTBALL37.lastMatchDay=S.day;');leaveFade();assert(kid().day===8,'no drop on a synthetic record (a fixture): '+JSON.stringify(kid()));
  // day 11, the fade exit after a real match: Kemi's hair band
  run('S.time=15.9;');realEnd(RESULTS[2][0],RESULTS[2][1]);leaveFade();k=kid();
  assert(k&&k.state==='lost'&&k.at==='exit'&&k.who==='kemi'&&k.id==='band'&&k.day===11,'the fade exit\'s drop: '+JSON.stringify(k));assert(logHas('kid','drop band'),'logged');assert.equal(kidTags(),2,'visible at once');
  atSpot(1,k.spot);assert.equal(hsid(1),'kid40pick','P2 picks it up');press(1);assert.equal(kid().state,'hand','in the hand');
  run('S.time=16.4;');nkechiAt(1);assert(!cands(1).includes('kid40shop')&&hsid(1)!=='kid40shop','Kemi\'s band never to Mama Nkechi: '+JSON.stringify(cands(1)));
  {const b=settled('bassey');if(b){const p=npcAt('bassey');approach(1,p[0],p[1],1.2,2.0);assert(!/^kid40/.test(hsid(1))&&!cands(1).some(c=>/^kid40/.test(c)),'nor to Mr. Bassey');R.notBassey=true;}}
  nextday();run('S.time=15.6;hxAt(0,-8,-10);hxAt(1,-23,12.9,[0,-1]);');for(let f=0;f<30&&!J('!!FOOTBALL37.kids');f++)frames(3);frames(12);
  const ask=L.ask.kemi[1].replace('{thing}',L.items.band.name);assert(bubbles().includes(ask),'Kemi asks once: '+JSON.stringify(bubbles()));assert.equal(kid().asked,12,'asked recorded');seen(ask);
  nearKid(1,'kemi');assert.equal(hsid(1),'kid40give','the give beside Kemi: '+label(1));assert.equal(label(1),'Give Kemi her hair band');press(1);k=kid();assert(k.state==='back'&&k.to==='kemi','back to Kemi');
  assert(bubbles().includes(L.ty.band[1]),'her thanks');seen(L.ty.band[1]);for(let f=0;f<130;f++)frames(1);assert(bubbles().includes(L.play.kemi[1]),'her play line');seen(L.play.kemi[1]);
  // (g) day 15 (a morning-match day): Emeka's bottle tops at 14:00; left on the sand; the next morning Today says it is still there; picked up and
  // kept; during a live match no give at the pitch; given to Mama Nkechi at her shop: her panel, friendship +1
  toDay(15);run('S.time=10.6;');realEnd(RESULTS[3][0],RESULTS[3][1]);leaveFade();run('S.time=13.9;hxAt(0,-23,13.9,[0,-1]);hxAt(1,-8,-10);');frames(20);run('S.time=14.0;');frames(12);k=kid();
  assert(k&&k.who==='emeka'&&k.id==='tops'&&k.at==='afternoon'&&k.heard,'day 15\'s drop: '+JSON.stringify(k));
  // (repair, VC-6) Mama Nkechi's marble line: "His feet came home…" only once Emeka has gone home; while he is still out at the pitch, the line for that
  assert(J("!!kidChild40('emeka')")&&J("kidNkFirst40('marble')[0]")==='gs40-kid-nk-marble-out','while Emeka is still out at the pitch, her marble line says so: '+J("kidNkFirst40('marble')[0]"));
  leaveFade();assert.equal(J("kidNkFirst40('marble')[0]"),'gs40-kid-nk-marble','"His feet came home…" once he has gone home');assert.equal(J("kidNkFirst40('tops')[0]"),'gs40-kid-nk-tops','the tops line either way');R.marbleLine={out:'gs40-kid-nk-marble-out',home:'gs40-kid-nk-marble'};nextday();
  const still=J('kid40Today()');assert(still&&still.html===J(`esc(${JSON.stringify(U.todayStill.replace('{child}','Emeka').replace('{name}',L.items.tops.name))})`),'the next morning: still on the sand: '+JSON.stringify(still));seen(still.html);
  assert.equal(kidTags(),2,'still in the world the next day');atSpot(0,kid().spot);press(0);assert.equal(kid().state,'hand','picked up on day 16');
  toDay(21);assert(J('fbWeekday37(21)')>=2,'day 21 a school day');run('S.time=17.85;hxAt(0,-23,12.9,[0,-1]);hxAt(1,-22,12.9,[0,-1]);');for(let f=0;f<20&&!J('!!FOOTBALL37.kids');f++)frames(3);
  run('football37Start();');let n=0;while(J('FOOTBALL37.state')!=='live'&&n<2000){frames(10);n+=10;}assert.equal(J('FOOTBALL37.state'),'live','a live match');
  {const e=kidAt('emeka');run(`hxAt(0,${e[0]+0.9},${e[1]},[-1,0]);`);frames(1);assert(!cands(0).includes('kid40give')&&hsid(0)!=='kid40give','no give during a live match');}
  run('S.time=18.34;');n=0;while(J('FOOTBALL37.state')!=='idle'&&J('FOOTBALL37.state')!=='off'&&n<3000){frames(10);n+=10;}const call=J('S.life.football37.last');assert(call.day===21&&call.called===true,'the match ran to the call: '+JSON.stringify(call));
  assert(kid().state==='hand','the tops still in the hand (no drop while a thing is in the hand)');
  nextday();run('S.time=10.5;');const aff0=J('S.nb.nkechi.aff|0');nkechiAt(0);assert.equal(hsid(0),'kid40shop','the shop prompt: '+label(0));assert.equal(label(0),'Give Mama Nkechi Emeka’s '+L.items.tops.name);
  run('PH="";');press(0);let ph=J('PH');run('closePanel();');seen(ph);assert(ph.includes(J(`esc(${JSON.stringify(L.nkechi.tops[1])})`))&&ph.includes(J(`esc(${JSON.stringify(L.nkechi.close[1])})`)),'her panel: '+ph.replace(/<[^>]+>/g,' ').slice(0,300));
  assert(/gist40-nkechi/.test(ph),'her panel\'s class');assert.equal(J('S.nb.nkechi.aff|0'),aff0+1,'friendship +1');k=kid();assert(k.state==='back'&&k.to==='nkechi','back through Mama Nkechi');
  // (h) day 24, the window's close (18:30) with the household at the pitch: Kemi's whistle
  toDay(24);run('S.time=18.0;');realEnd(RESULTS[4][0],RESULTS[4][1]);run('S.time=18.45;hxAt(0,-23,13.9,[0,-1]);hxAt(1,-22,13.9,[0,-1]);');n=0;while(!kid()||kid().day!==24){frames(10);n+=10;if(n>3000)break;}
  k=kid();assert(k&&k.day===24&&k.who==='kemi'&&k.id==='whistle'&&k.at==='exit','the window\'s close drops: '+JSON.stringify(k));assert(fb().kids===null||/leave|fadeout/.test(fb().kids),'they were leaving: '+JSON.stringify(fb()));
  assert(bubbles().includes(L.shout.whistle[1]),'Kemi\'s call');seen(L.shout.whistle[1]);
  // (i) day 30, the call at 18:20 ends a live match (Emeka called in): his marble; given to Mama Nkechi the next day, her "again" line
  toDay(30);run('S.time=17.85;hxAt(0,-23,12.9,[0,-1]);hxAt(1,-22,12.9,[0,-1]);');for(let f=0;f<20&&!J('!!FOOTBALL37.kids');f++)frames(3);
  // the whistle from day 24 first: picked off the sand and given to Kemi before kick-off
  atSpot(1,kid().spot);press(1);nearKid(1,'kemi');press(1);assert.equal(kid().state,'back','the whistle back to Kemi');
  run('football37Start();');n=0;while(J('FOOTBALL37.state')!=='live'&&n<2000){frames(10);n+=10;}run('S.time=18.34;');n=0;while(J('FOOTBALL37.state')!=='idle'&&J('FOOTBALL37.state')!=='off'&&n<3000){frames(10);n+=10;}frames(12);
  k=kid();assert(k&&k.day===30&&k.who==='emeka'&&k.id==='marble'&&k.at==='exit','the call drops: '+JSON.stringify(k));assert(J('S.life.football37.last.called'),'called in');
  nextday();atSpot(0,kid().spot);press(0);run('S.time=10.5;');nkechiAt(0);run('PH="";');press(0);ph=J('PH');run('closePanel();');seen(ph);
  assert(ph.includes(J(`esc(${JSON.stringify(L.nkechi.again[1].replace('{thing}',L.items.marble.name))})`)),'her "again" line the second time: '+ph.replace(/<[^>]+>/g,' ').slice(0,300));
  R.drops={afternoon:[8,15],fade:11,window:24,call:30,gapDay:9};

  // (j) the children never in say or aff; nothing in FOUND38.LOST or the keepsakes
  assert.deepEqual(J('hxKidCalls'),[],'no say or aff for a child');assert.equal(J("FOUND38.LOST.filter(e=>/marble|tops|band|whistle|kid/.test(e.id)).length"),0,'nothing of the children\'s in FOUND38.LOST');
  assert.equal(J('hxG().keep.keepsake.filter(x=>/marble|tops|band|whistle/.test(x)).length'),0,'never G.keep.keepsake');
  // (fix round, S6) a thing nobody heard fall: a fade exit with everyone away (Today silent), the child asks the next day at the pitch, then
  // Today tells the household where it is
  {const d=11;run("dispatch('newgame');");disc();toDay(8);read();toDay(d);run('S.time=15.6;hxAt(0,-23,12.9,[0,-1]);hxAt(1,-22,12.9,[0,-1]);');for(let f=0;f<20&&!J('!!FOOTBALL37.kids');f++)frames(3);assert(J('!!FOOTBALL37.kids'),'the children are out');
   // the match ended through football's own end with the household already walking off (everyone more than 20 m from the children at their exit)
   run(`FOOTBALL37.stats={kicks:{},passes:{},calls:0,outs:0,goals:[{who:'p0',own:false},{who:'kemi',own:false}],streetCall:false,motor:false,challenges:0};FOOTBALL37.score=[2,1];fbEnsureSave37();fbEnd37('won');hxAt(0,8,-8);hxAt(1,8.6,-8);`);
   {let n=0;while((J('!!FOOTBALL37.kids')||J("FOOTBALL37.state!=='idle'&&FOOTBALL37.state!=='off'"))&&n<3000){frames(10);n+=10;}}const ex=fb();
   k=kid();assert(k&&k.day===d&&k.state==='lost'&&k.at==='exit'&&k.heard===false,'dropped unheard at the fade exit: '+JSON.stringify(k)+' '+JSON.stringify([ex,J('S.time')]));assert.equal(J('kid40Today()'),null,'Today silent while nobody heard it');
   nextday();run('S.time=15.6;hxAt(0,-8,-10);hxAt(1,-23,12.9,[0,-1]);');for(let f=0;f<30&&!J('!!FOOTBALL37.kids');f++)frames(3);frames(12);k=kid();
   assert(k.asked===d+1&&k.heard===true,'asked, and heard: '+JSON.stringify(k));const it=L.items[k.id],tl=J('kid40Today()');
   assert(tl&&tl.html===J(`esc(${JSON.stringify(U.todayStill.replace('{child}',k.who==='kemi'?'Kemi':'Emeka').replace('{name}',it.name))})`),'Today tells the household once the child has asked: '+JSON.stringify(tl));seen(tl.html);R.unheard={day:d,asked:d+1,today:true};}
  // (repair, H2) one player home and the other at the pitch: the gist starts at 18:20 and the children leave during it; the exit is recorded then
  // and the thing drops after the gist (a child's day)
  {run("dispatch('newgame');");disc();toDay(8);read();const dk=J('(()=>{for(let d=12;d<60;d++)if(hash38(d,44)%3===0&&fbWeekday37(d)>=2)return d;return -1;})()');assert(dk>0,'a child\'s school day');toDay(dk);run('S.time=15.6;FOOTBALL37.called=false;');realEnd('won',['p0','kemi']);
   run('hxAt(0,-5.2,4.0);hxAt(1,-23,12.4,[0,-1]);');frames(4);assert(J('home34()'),'one player home');to(18.3);{const k0=kid();assert(!(k0&&k0.day===dk)&&J('!!FOOTBALL37.kids'),'the children still out and nothing dropped before the gist: '+JSON.stringify([k0,fb()]));}
   const st=waitStart(3000);assert(st>=0,'the gist starts with one player at the pitch');let left=false;for(let q=0;q<4000&&EV()!=='idle';q+=10){frames(10);const f=fb();if(f&&(f.state==='off'||/leave|fadeout/.test(String(f.kids))))left=true;}
   assert(left,'the children left during the gist');frames(30);const k5=kid();assert(k5&&k5.day===dk&&k5.state==='lost'&&k5.at==='exit','the child\'s thing dropped after the gist: '+JSON.stringify(k5));R.exitInGist={day:dk,id:k5.id,heard:k5.heard};}
  return R;});

 /* ---------- check 6: the gist (spec §8, §9) ---------- */
 check(6,()=>{const R={};assert(has40(),'the module');
  // the rain rule over every pool: no line but a transition tip promises rain tomorrow (critic finding 19); the transition tips say tomorrow
  {const T=J('GIST40.LINES');const all=[];const walk=(o,pre)=>{if(Array.isArray(o)&&typeof o[0]==='string'&&/^gs40-/.test(o[0])){const t=o.slice(1).filter(x=>typeof x==='string').sort((a,b)=>b.length-a.length)[0];all.push([o[0],t,pre]);return;}
    if(Array.isArray(o))o.forEach((v,k)=>walk(v,pre+'['+k+']'));else if(o&&typeof o==='object')for(const k in o)walk(o[k],pre+'.'+k);};walk(T,'');
   const RT=/\b(rain|raining)\b[^.]*\btomorrow\b/i;const bad=all.filter(([id,t,pre])=>!/^\.tr\./.test(pre)&&RT.test(t)).map(x=>x[0]);assert.deepEqual(bad,[],'a non-transition line promises rain tomorrow');
   const tr=all.filter(([id,t,pre])=>/^\.tr\./.test(pre));assert(tr.length>=15&&tr.every(([id,t])=>/tomorrow/i.test(t)),'the transition tips say tomorrow');
   const mal=J("typeof MALLAM40!=='undefined'?Object.values(MALLAM40.LINES).map(e=>e[1]):[]").concat(J("Object.values(BOARD40.CARDS)"));assert(!mal.some(t=>RT.test(t)),'nor Mallam\'s lines or the cards');R.rainRule={lines:all.length,transition:tr.length};}
  // v40 discovered on day 5 through v39 (a purchase from Aunty Bisi on day 4, the board read on day 5)
  disc40('b39');assert.equal(J('S.day'),5,'discovered on day 5');
  // (a) pure plans for every evening 5 to 40 (S.day set, the plan called twice, S unchanged): the transition tip exactly on the evening before a
  // season changes, a tip that names the coming season
  const scan=J(`(()=>{const d0=S.day,t0=S.time,out=[];try{for(let d=5;d<=40;d++){S.day=d;S.time=18.2;const s0=JSON.stringify(S),a=JSON.stringify(gistPlan38()),b=JSON.stringify(gistPlan38());const p=gistPlan38();
    out.push({d,pure:a===b&&JSON.stringify(S)===s0,change:season(d+1)!==season(d),to:season(d+1),tr:p.script.filter(s=>s.trans).map(s=>({id:s.id,tip:s.tip,v40k:s.v40k}))});}}finally{S.day=d0;S.time=t0;}return out;})()`);
  assert(scan.every(x=>x.pure),'the plan pure (twice the same, S unchanged): '+JSON.stringify(scan.filter(x=>!x.pure).map(x=>x.d)));
  const pre={dry:'dry',harmattan:'har',rains:'rai'};const trBad=scan.filter(x=>x.change?!(x.tr.length===1&&x.tr[0].tip===1&&x.tr[0].v40k===x.tr[0].id&&x.tr[0].id.startsWith('gs40-tr-'+pre[x.to])):x.tr.length>0);
  assert.deepEqual(trBad.map(x=>x.d),[],'the transition tip the evening before each change, never otherwise: '+JSON.stringify(trBad));R.transition=scan.filter(x=>x.change).map(x=>x.d);
  // (b) days 5 to 13 played: the card thing and the errand every day by keys, a real match every afternoon (children's things after every match:
  // the playtest flag), the gist at the rail every evening with Next pressed through; per night the invariants
  run("sessionStorage.setItem('gist40.flag.playtest','1');GIST40.flags.parsed=false;enterWorld();closePanel();");frames(2);assert(J('GIST40.flags.playtest'),'the playtest flag');
  const nights=[];let skipNight=null,mentions={out:0,back:0,moved:0},errands=0,cards=0,menuSeason=[],quietDay=0;const fond={emeka:'nkechi',kemi:'bassey'};
  for(let day=5;day<=13;day++){if(day>5)nextday();const d=J('S.day');
   if(d>5){const prev=scan.find(x=>x.d===d-1);if(prev&&prev.change){run('PH="";openMenu();');const menu=J('PH');run('closePanel();');menuSeason.push([d,J('seasonName()'),menu.includes(J('seasonName()'))]);}}
   // the card: read at 10:35, the thing picked and given back where its owner is (Mrs. Oyelaran is out 12:00-18:00: given after six)
   const c0=card();if(d>5||!c0||c0.state==='up')read();
   if(card()&&card().state==='read'&&thingAt()){pickCard(0);const g=giveCard(0);if(g){seen(g.panel);cards++;}}
   // the match in the children's hours (from 10:00 on a morning-match day, else after school), then their exit by the fade
   const match=()=>{const h=J('fbWeekday37(S.day)===0?10.6:fbWeekday37(S.day)===1?15.2:15.6');if(J('S.time')<h)run('S.time='+h+';');const rr=RESULTS[d%RESULTS.length];
    // an earlier day's thing first: picked off the sand and given to its child at the pitch before kick-off
    {let k0=kid();if(k0&&k0.state==='lost'){atSpot(0,k0.spot);press(0);}k0=kid();if(k0&&k0.state==='hand'){run('hxAt(0,-23,12.9,[0,-1]);');for(let f=0;f<20&&!J('!!FOOTBALL37.kids');f++)frames(3);frames(6);if(kidAt(k0.who)){nearKid(0,k0.who);press(0);}}}
    realEnd(rr[0],rr[1]);
    // (repair 5, R5-1) v40 records the hour the match ended, from football's own end event
    {const fe=J('hxB40().fbEnd||null'),he=J('globalThis.hxEnd40||null');assert(fe&&he&&fe.day===he.day&&fe.t===he.t&&fe.day===d,'v40 records when today\'s match ended (R5-1): '+JSON.stringify([fe,he]));}
    const guests=J('(()=>{const t=S.time;S.time=18.2;try{return gistPlan38().guests;}finally{S.time=t;}})()');leaveFade();const kk=kid();
    // a thing of Emeka's lost tonight with Mama Nkechi a guest: given to her before the gist once the "out" form has been heard (the "back" form)
    if(kk&&kk.day===d&&kk.who==='emeka'&&kk.state==='lost'&&guests.includes('nkechi')&&mentions.out>0){atSpot(0,kk.spot);press(0);run('S.time=Math.max(S.time,16.5);');nkechiAt(0);run('PH="";');press(0);seen(J('PH'));run('closePanel();');}};
   if(J('fbWeekday37(S.day)')===0)match();
   // the errand from 12:30: taken at the sender's live place, given at the receiver's
   run('S.time=Math.max(S.time,12.55);');frames(4);const er=J('board40Errand(S.day)');
   if(er&&er.state==='up'&&settled(er.sender)){const p=npcAt(er.sender);approach(0,p[0],p[1],1.2,2.0);if(hsid(0)==='errand40take'){press(0);if(settled(er.receiver)){const q=npcAt(er.receiver);approach(0,q[0],q[1],1.2,2.0);if(hsid(0)==='errand40give'){run('PH="";');press(0);seen(J('PH'));run('closePanel();');errands++;}}}}
   // the noon thing (eager: picked and given back through v38's own functions; Mrs. Oyelaran's after six)
   frames(4);for(let f=0;f<24&&!J('!!(FOUND38.world.item)');f++)frames(1);let owLate=null;if(J('!!(FOUND38.world.item)')){run('found38Pick(0);closePanel();');const ow=J('hxG().lost.status==="pocket"?FOUND38.LOST[hxG().lost.i].owner:null');if(ow){frames(30);if(J(`!!found38Npc('${ow}')`))run('found38Give(0);closePanel();');else owLate=ow;}}
   // (fix round, S5) the match line has the first claim on the night's insert, so on a match night the errand's mention rarely finds room: one
   // school day from day 9 with the errand given to a guest of tonight and no mention heard yet, the household plays no match (a quiet day); not
   // the evening before a season changes, where the transition tip comes first and takes the insert (fix round 2)
   let quiet=false;if(J('fbWeekday37(S.day)')!==0&&d>=9&&!quietDay&&!nights.some(x=>x.errand)&&J('season(S.day+1)===season(S.day)')){const e=J('board40Errand(S.day)');if(e&&e.state==='given'&&J('(()=>{const t=S.time;S.time=18.2;try{return gistPlan38().guests;}finally{S.time=t;}})()').includes(e.receiver))quiet=true;}
   if(quiet)quietDay=d;else if(J('fbWeekday37(S.day)')!==0)match();
   if(owLate||(card()&&card().state==='hand')){run('S.time=Math.max(S.time,18.05);');frames(30);if(owLate&&J(`!!found38Npc('${owLate}')`))run('found38Give(0);closePanel();');if(card()&&card().state==='hand'){const g=giveCard(0);if(g){seen(g.panel);cards++;}}}
   run('S.time=Math.max(S.time,18.2);');pair();const fd=J('!hxG().once.fb37&&!!(hxG().eve&&(hxG().eve.n|0)>0)&&S.life.football37.eveDay!==S.day');const g=gistFast(3000);assert(g&&!g.aborted,'a gist on day '+d);const v=g.v,sc=v.script,meta=v.meta;
   for(const s of sc)if(g.shown.includes(s.id))seen(s.text);
   const n={d,guests:v.guests,len:sc.length,v40:sc.filter(s=>s.v40k).map(s=>s.id),meta};nights.push(n);
   // every v40 entry: id equal to its v40k, no cat, today or v39; every guard replacement carries swap40; at most one insert, never into eight;
   // at most two v39 lines; g39 kept
   for(const s of sc){if(s.v40k){assert(s.id===s.v40k&&!s.cat&&!s.today&&!s.v39,'a v40 entry\'s fields on day '+d+': '+JSON.stringify(s));}if(s.g40t)assert(s.swap40&&s.swap40.cat&&s.swap40.id,'swap40 on a guard replacement: '+JSON.stringify(s));}
   if(meta){assert(sc.length<=meta.len0+1&&(meta.len0<8||sc.length<=meta.len0),'one insert at most, never into eight: '+sc.length+' from '+meta.len0);}
   assert(sc.filter(s=>s.v39).length<=2,'at most two v39 lines');assert(v.g39&&typeof v.g39==='object','script.g39 kept on day '+d);
   // the skip night: v38's once-only football line due (Mama Nkechi a guest, a match today): v40 leaves the whole night alone
   if(fd&&v.guests.includes('nkechi')&&!skipNight){assert(!meta&&!sc.some(s=>s.v40k||s.swap40),'the skip night untouched: '+JSON.stringify(sc.map(s=>s.id)));
    assert(g.lines.includes('fb37-nkechi-evening')&&g.lines.filter(x=>/^gs40-fb-|^fb37-/.test(x)).length===1,'one match line, v38\'s: '+JSON.stringify(g.lines));skipNight=d;continue;}
   // the match line: one, by the speaker order (Mr. Bassey with an eligible line, else the other guest, else a general line by guests[1])
   const f=factsNow(),ml=sc.filter(s=>/^gs40-fb-/.test(s.id));if(quietDay===d)assert(!f&&!ml.length,'no match, no match line on the quiet day');else assert(f,'a real record on day '+d);assert(ml.length<=1,'one match line at most');
   if(ml.length){const m=ml[0],FB=J('GIST40.LINES.fb'),line=(FB[m.k]||[]).concat(FB.g).find(e=>e[0]===m.id);assert(line,'the match line\'s entry');
    assert(String(line[1]).split('+').every(x=>f[x]),'its facts hold: '+line[1]+' '+JSON.stringify(f));
    const heard=J('hxB40().heard');const elig=k=>(FB[k]||[]).some(e=>String(e[1]).split('+').every(x=>f[x])&&!(typeof heard[e[0]]==='number'&&heard[e[0]]<d&&d-heard[e[0]]<=13)&&!sc.some(s=>s.id===e[0]&&s!==m));
    if(/^gs40-fb-g/.test(m.id))assert(m.k===v.guests[1]&&!v.guests.some(k=>elig(k)),'a general line only when no guest has one');
    else{assert(v.guests.includes(m.k),'a guest says it');if(v.guests.includes('bassey')&&m.k!=='bassey'&&!sc.some(s=>s.k==='bassey'&&s.once&&/^thank39:/.test(s.once)))assert(!elig('bassey'),'Mr. Bassey first when he has a line');}
    n.match=[m.k,m.id];}
   else n.match=null;
   // the children's mention: the night a thing was lost, by the fond adult when a guest; a tip while it is out (true: it lies on the sand), thanks once back
   const kk=kid();const mn=sc.filter(s=>/^gs40-kid-mn-/.test(s.id));
   // (repair, VP-1b) on the evening before a season changes the transition tip comes first; a mention that then finds no room waits
   const chg=scan.find(x=>x.d===d);
   if(kk&&kk.day===d&&v.guests.includes(fond[kk.who])&&!mn.length&&chg&&chg.change&&sc.some(s=>s.trans))mentions.waited=(mentions.waited|0)+1;
   else if(kk&&kk.day===d&&v.guests.includes(fond[kk.who])){assert.equal(mn.length,1,'the children\'s mention on day '+d);const m=mn[0];assert.equal(m.k,fond[kk.who],'by the fond adult');
    const form=/-out$/.test(m.id)?'out':'back';if(form==='out'){assert(m.tip===1&&kidTags()===2,'a tip, and the thing lies out');mentions.out++;}else{assert(m.info===1&&kk.state==='back','thanks once back');mentions.back++;}
    if(meta&&meta.today===m.id&&ml.length){assert(meta.moved===ml[0].id,'the match line moved to a reaction');mentions.moved++;}}
   else assert.equal(mn.length,0,'no children\'s mention without the fond adult or a loss today');
   // the errand's mention and a card thing's return, by the receiver or owner when a guest
   const ed=J('board40Errand(S.day)');const em=sc.filter(s=>/^gs40-er-/.test(s.id));if(em.length){assert(ed&&ed.state==='given'&&em[0].k===ed.receiver&&em[0].info===1,'the errand\'s mention by its receiver');n.errand=em[0].id;}
   if(ed&&ed.state==='given'&&!v.guests.includes(ed.receiver))assert.equal(em.length,0,'no errand mention without its receiver');
   const cm=sc.filter(s=>/^gs40-ret-/.test(s.id));if(cm.length){const r=J('board40Returned(S.day)');assert(r.some(x=>x.owner===cm[0].k)&&cm[0].info===1,'a card thing\'s return by its owner');n.cardLine=cm[0].id;}
   // rain lines only after rain; "the rain is resting" only on a rains day without it
   const SE=J('GIST40.LINES.se');for(const s of sc){if(!/^gs40-se-/.test(s.id))continue;const e=SE[s.k].find(x=>x[0]===s.id);const w=J('S.weather');
    if(e[4]==='rain')assert(w&&w.day===d&&typeof w.rainAt==='number','a rained-today line only after rain: '+s.id);if(e[4]==='norain')assert(J('season(S.day)')==='rains'&&!(w&&typeof w.rainAt==='number'),'the rain resting only on a dry rains day: '+s.id);
    assert.equal(e[1],J('season(S.day)'),'a season line of today\'s season');}
   // the transition tip that evening (shown)
   const prev=scan.find(x=>x.d===d);if(prev.change)assert(sc.some(s=>s.trans&&g.shown.includes(s.id)),'the transition tip shown on day '+d);
   R.lastDay=d;}
  assert(skipNight,'a skip night came');assert(mentions.out>=1&&mentions.back>=1,'both forms of the children\'s mention: '+JSON.stringify(mentions));
  assert(menuSeason.length>=2&&menuSeason.every(x=>x[2]),'the Menu names the new season the morning after: '+JSON.stringify(menuSeason));
  assert(errands>=5&&cards>=4,'the errand and the card played most days: '+errands+' errands, '+cards+' cards');
  assert(nights.some(x=>x.errand),'an errand\'s mention came: '+JSON.stringify(nights.map(x=>x.errand||null)));
  R.nights=nights.map(x=>({d:x.d,guests:x.guests.join('+'),match:x.match?x.match[0]:null,v40:x.v40.length,swaps:x.meta?x.meta.swaps.length:0}));R.skipNight=skipNight;R.quietDay=quietDay;R.mentions=mentions;R.menu=menuSeason;R.played={errands,cards};
  // (c) the stool handed over on a later night with v40 loaded: the tenth stool and Mr. Bassey's first time (a fixture through save and load), then
  // the next evening he is a guest: GIST39.step reads script.g39.stool from v40's copy
  run(`hxFix40((o,G)=>{G.b39.stool={from:'tenth',day:${J('S.day')}};G.b39.once['stool39:bassey']=${J('S.day')};});`);run("sessionStorage.removeItem('gist40.flag.playtest');GIST40.flags.parsed=false;GIST40.flags.playtest=false;enterWorld();closePanel();");frames(2);
  const sd=J(`(()=>{const d0=S.day;try{for(let d=d0+1;d<=d0+30;d++){S.day=d;S.time=18.2;const p=gistPlan38();if(p.guests.includes('bassey')&&p.script.g39&&p.script.g39.stool==='bassey'&&!p.script.g39.stoolFirst)return d;}return -1;}finally{S.day=d0;}})()`);
  assert(sd>0,'an evening with Mr. Bassey');run(`S.day=${sd};S.time=18.2;`);pair();frames(1);const gs=gistFast(3000);assert(gs&&gs.v.g39&&gs.v.g39.stool==='bassey','script.g39 in v40\'s copy names him');assert.equal(gs.stool,'bassey','the stool handed over to Mr. Bassey');R.stool=sd;
  // (d) (fix round, S5) the match line's first claim on the night's insert (§9.3): a real match, a card thing given back today by a guest, the slot
  // a first-time retelling and no free reaction: the match line takes the insert and the return is not said; with a free reaction the return takes it
  {run("dispatch('newgame');");disc40('b39');pickCard(0);let gv=giveCard(0);if(!gv){run('S.time=18.05;');frames(6);gv=giveCard(0);}assert(gv,'a card thing given back');run('S.time=15.6;');realEnd(RESULTS[0][0],RESULTS[0][1]);
   const ow=gv.owner,ot=ow==='bassey'?'tunde':'bassey',base=[{k:ow,id:'gs38-x-o',cat:'o:'+ow,open:1,text:'a'},{k:ot,id:'gs38-y-o',cat:'o:'+ot,open:1,text:'b'},{k:ow,id:'gs38-told-x',today:'told:x',text:'c'},{k:ot,id:'gs39-z',v39k:'z',text:'d'},{k:ow,id:'gs38-by-x',cat:'by:'+ow,text:'e'}];
   const plan=sc=>J(`(()=>{const t=S.time;S.time=18.2;try{const p={guests:${JSON.stringify([ow,ot])},script:${JSON.stringify(sc)}};p.script.g39={};const q=gistPlan40(p);return q?{ids:q.script.map(s=>s.id),meta:q.script.g40}:null;}finally{S.time=t;}})()`);
   const a=plan(base);assert(a&&/^gs40-fb-/.test(a.meta.inserted||'')&&!a.ids.some(x=>/^gs40-ret-/.test(x)),'the match line takes the insert, the return waits: '+JSON.stringify(a));
   const b=plan(base.slice(0,4).concat([{k:ot,id:'gs38-re-z',cat:'re:'+ot,text:'r'}],base.slice(4)));assert(b&&b.ids.some(x=>/^gs40-fb-/.test(x))&&b.ids.some(x=>/^gs40-ret-/.test(x))&&b.meta.inserted&&b.meta.moved,'with a free reaction both are said (one in the reaction, one in the insert): '+JSON.stringify(b));
   R.matchFirst={insert:a.meta.inserted,withReaction:[b.meta.moved,b.meta.inserted]};
  // (e) (fix round 2) the transition tip comes before the line about today (§9.4: a promise, said on every change evening): the browser play's
  // day 9, the evening before harmattan: Tunde and Mama Nkechi, a match lost 1-3 today, her greeting carrying v39's stool button and her stool
  // line, Tunde's reaction gone to v39 (no free reaction), the slot a first-time retelling, seven lines: the tip takes the insert (by a teller who
  // is a guest, never on the stool-button greeting); the match line, with no room left, is not said
   toDay(9);assert.equal(J('season(S.day+1)'),'harmattan','day 9 is the evening before harmattan');run('hxFix40((o,G)=>{G.once.fb37=8;});');assert(J('!!hxG().once.fb37'),'v38\'s once-only football line said before (not the skip night)');run('S.time='+J('fbWeekday37(S.day)===0?10.6:fbWeekday37(S.day)===1?15.2:15.6')+';');realEnd(RESULTS[4][0],RESULTS[4][1]);
   const f9=factsNow();assert(f9&&f9.lost,'a match lost today: '+JSON.stringify(f9));{const k9=kid();if(k9&&k9.day===J('S.day')&&k9.state==='lost'){atSpot(0,k9.spot);press(0);}}
   assert(J("!(hxB40().kid&&hxB40().kid.day===S.day&&hxB40().kid.state!=='hand')"),'no children\'s mention tonight (a thing lost today picked up, in the hand)');
   const nine=[{k:'tunde',id:'gs38-tu-soon',open:1,once:'tuSoon',text:'a'},{k:'nkechi',id:'gs38-nk-o1',cat:'o:nkechi',open:1,stoolBtn:'nkechi',text:'b'},{k:'nkechi',id:'gs39-st-nkechi',v39:'stool',v39k:'stool',stool:'nkechi',text:'c'},
    {k:'tunde',id:'gs38-told-rule',today:'told:rule',text:'d'},{k:'nkechi',id:'gs38-lost-seeds',tip:1,text:'e'},{k:'tunde',id:'gs38-back-seeds',text:'f'},{k:'nkechi',id:'gs38-by-nk3',cat:'by:nkechi',text:'g'}];
   const n9=J(`(()=>{const t=S.time;S.time=18.2;try{const p={guests:['tunde','nkechi'],script:${JSON.stringify(nine)}};p.script.g39={stool:'nkechi',stoolFirst:true};const q=gistPlan40(p);return q?{sc:q.script.map(s=>({id:s.id,k:s.k,trans:s.trans?1:0,tip:s.tip?1:0,stoolBtn:s.stoolBtn||null})),meta:q.script.g40,tellers:GIST40.TRANS_BY.harmattan}:null;}finally{S.time=t;}})()`);
   assert(n9,'a v40 plan on day 9');const tr9=n9.sc.filter(s=>s.trans);
   assert(tr9.length===1&&/^gs40-tr-har-/.test(tr9[0].id)&&tr9[0].tip===1&&['tunde','nkechi'].includes(tr9[0].k)&&n9.tellers.includes(tr9[0].k),'day 9 (before harmattan, the match lost, no free reaction, the stool button on her greeting) carries the transition tip: '+JSON.stringify(n9.sc.map(s=>s.id)));
   assert(n9.meta.trans===tr9[0].id&&n9.meta.inserted===tr9[0].id&&n9.sc.length<=n9.meta.len0+1&&n9.sc.findIndex(s=>s.trans)>n9.sc.findIndex(s=>s.id==='gs38-told-rule'),'the tip in the night\'s one insert, after the line about today: '+JSON.stringify(n9.meta));
   assert(n9.sc.some(s=>s.id==='gs38-nk-o1'&&s.stoolBtn==='nkechi')&&n9.sc.some(s=>s.id==='gs39-st-nkechi')&&!n9.sc.some(s=>s.trans&&s.stoolBtn),'the stool button and v39\'s line untouched');
   R.changeEveningTip={day:9,ids:n9.sc.map(s=>s.id),inserted:n9.meta.inserted};}
  // (f) (repair, VP-1b) the tip first of all: a change evening with a child's thing lost today and its fond adult a guest, the slot a first-time
  // retelling, every greeting once-only or carrying the stool button, seven lines: the tip takes the insert and the children's mention waits (not
  // said that night); with a free reaction the tip takes the reaction and the mention the insert
  {run("sessionStorage.setItem('gist40.flag.playtest','1');GIST40.flags.parsed=false;enterWorld();closePanel();");frames(2);
   const last=J('(hxB40().kids&&hxB40().kids.lastDay)|0');let dc=-1;for(let d=J('S.day')+1;d<=J('S.day')+16;d++){if(J(`season(${d}+1)!==season(${d})&&fbWeekday37(${d})>=2`)&&(!last||d-last>2)){dc=d;break;}}
   assert(dc>0,'a change evening ahead');toDay(dc);run('S.time=15.6;');
   {let k0=kid();if(k0&&k0.state==='lost'){atSpot(0,k0.spot);press(0);}k0=kid();if(k0&&k0.state==='hand'){run('hxAt(0,-23,12.9,[0,-1]);');for(let f=0;f<20&&!J('!!FOOTBALL37.kids');f++)frames(3);frames(6);if(kidAt(k0.who)){nearKid(0,k0.who);press(0);}}}
   realEnd(RESULTS[0][0],RESULTS[0][1]);leaveFade();const kf=kid();assert(kf&&kf.day===dc&&kf.state==='lost','a child\'s thing lost on the change evening: '+JSON.stringify(kf));
   const F=({emeka:'nkechi',kemi:'bassey'})[kf.who],O=F==='nkechi'?'tunde':'ada';
   const six=[{k:O,id:'gs38-x-once',open:1,once:'xOnce',text:'a'},{k:F,id:'gs38-f-o',cat:'o:'+F,open:1,stoolBtn:F,text:'b'},{k:F,id:'gs39-st-'+F,v39:'stool',v39k:'stool',stool:F,text:'c'},{k:O,id:'gs38-told-q',today:'told:q',text:'d'},{k:F,id:'gs38-lost-q',tip:1,text:'e'}];
   const plan=sc=>J(`(()=>{const t=S.time;S.time=18.2;try{const p={guests:${JSON.stringify([F,O])},script:${JSON.stringify(sc)}};p.script.g39={stool:${JSON.stringify(F)},stoolFirst:true};const q=gistPlan40(p);return q?{sc:q.script.map(s=>({id:s.id,k:s.k,trans:s.trans?1:0})),meta:q.script.g40}:null;}finally{S.time=t;}})()`);
   const a=plan(six.concat([{k:O,id:'gs38-back-q',text:'f'},{k:F,id:'gs38-by-f',cat:'by:'+F,text:'g'}]));
   assert(a&&a.sc.filter(s=>s.trans).length===1&&a.meta.inserted===a.meta.trans&&!a.sc.some(s=>/^gs40-kid-mn-/.test(s.id)),'the tip takes the insert, the children\'s mention waits: '+JSON.stringify(a&&a.sc.map(s=>s.id)));
   const b=plan(six.concat([{k:O,id:'gs38-re-q',cat:'re:'+O,text:'r'},{k:F,id:'gs38-by-f',cat:'by:'+F,text:'g'}]));
   assert(b&&b.sc.filter(s=>s.trans).length===1&&b.sc.some(s=>s.trans&&s.id===b.meta.trans)&&/^gs40-kid-mn-/.test(b.meta.inserted||''),'with a free reaction: the tip in the reaction, the mention in the insert: '+JSON.stringify(b&&{ids:b.sc.map(s=>s.id),meta:b.meta}));
   run("sessionStorage.removeItem('gist40.flag.playtest');GIST40.flags.parsed=false;GIST40.flags.playtest=false;enterWorld();closePanel();");frames(2);
   R.tipFirst={day:dc,who:kf.who,waits:a.sc.map(s=>s.id),withReaction:[b.meta.trans,b.meta.inserted]};}
  return R;});

 /* ---------- check 7: the repeats (spec §9.5-§9.7); the long sweep once ---------- */
 // a household (pair or companion) from day 3: v38 by the glasses, the v35 evening on day 3, v39 by a purchase from Aunty Bisi on day 4; v40
 // discovered by the read on day 5 (after) or never (before); every day the noon thing picked and given (eager), from day 5 a real match through
 // football's own end, the gist at the rail with Next pressed through; nights to LAST: the lines shown, the plans' meta, the booking
 const sweep=(comp,withV40,last)=>{
  if(comp){run(`hxReclock();NET.on=false;AI.on=false;_silent=false;hxNoKeys();hxOverlay(false);location.search='';dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();dispatch('movein');closePanel();
   sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();hxScreen(1280,800,false);S.day=3;S.time=12.02;hxAt(0,-5.2,4.0);hxFrames(2);PH='';TOASTS=[];`);}
  else run('hxFresh(3,12.02);hxAt(1,-8,-10);');
  frames(4);pickNow(0);giveNow(0,'nkechi');run('life34().evening35={doneDay:3};');const out=[];
  for(let day=4;day<=last;day++){run("dispatch('nextday');closePanel();hxAt(0,-5.2,4.0);"+(comp?'':"hxAt(1,-4.6,4.4);"));frames(2);
   if(day===5&&withV40){read();assert(B40(),'v40 discovered on day 5');}
   run('S.time=12.02;');frames(4);for(let f=0;f<24&&!J('!!(FOUND38.world.item)');f++)frames(1);let owLate=null;if(J('!!(FOUND38.world.item)')){run('found38Pick(0);closePanel();');const ow=J('hxG().lost.status==="pocket"?FOUND38.LOST[hxG().lost.i].owner:null');
    if(ow){frames(30);if(J(`!!found38Npc('${ow}')`))run('found38Give(0);closePanel();');else owLate=ow;}}
   if(day===4){run('S.time=17.1;S.money=9000;hxAt(0,-5.2,4.0);');for(let k=0;k<40&&!(Bv()&&Bv().vis);k++)frames(4);streetPanel(0);click('bisi39Buy',x=>x.data.v==='puffpuff');click('bisi39Close');frames(2);assert(J('!!(hxG().b39)'),'v39 discovered');}
   if(day>=5){const h=J('fbWeekday37(S.day)===0?10.6:fbWeekday37(S.day)===1?15.2:15.6');if(J('S.time')<h)run('S.time='+h+';');const rr=RESULTS[day%RESULTS.length];
    run('hxAt(0,-23,12.9,[0,-1]);'+(comp?'':'hxAt(1,-22,12.9,[0,-1]);'));for(let k=0;k<20&&!J('!!FOOTBALL37.kids');k++)frames(3);
    run(`FOOTBALL37.stats={kicks:{},passes:{},calls:0,outs:0,goals:${JSON.stringify(rr[1].map(w=>({who:w.replace(':og',''),own:/:og$/.test(w)})))},streetCall:false,motor:false,challenges:0};FOOTBALL37.score=[2,1];fbEnsureSave37();fbEnd37(${JSON.stringify(rr[0])});`);
    let n=0;while(J('FOOTBALL37.state')!=='idle'&&n<3000){frames(10);n+=10;}run('hxAt(0,-5,-2);'+(comp?'':'hxAt(1,-5.6,-2);'));n=0;while(J('!!FOOTBALL37.kids')&&n<900){frames(10);n+=10;}
    // (fix round, S4) at five P(0) at Mallam's stand: one fan when it is offered (after v40 discovery), in both runs the same steps
    if(J('S.time')<17.02)run('S.time=17.02;');run('hxAt(0,-3,11.2,[0,1]);');frames(6);if(hsid(0)==='mallam40fan')press(0);run('hxAt(0,-5.2,4.0);');}
   if(owLate){run('S.time=Math.max(S.time,18.05);');frames(30);if(J(`!!found38Npc('${owLate}')`))run('found38Give(0);closePanel();');}
   run('S.time=Math.max(S.time,18.2);hxAt(0,-5.2,6.4,[0,1]);'+(comp?'':'hxAt(1,-4.6,6.4,[0,1]);'));
   const ret=J("typeof found38Returned==='function'?found38Returned(S.day):[]");const g=gistFast(3000);if(!g||g.aborted){out.push({day,shown:[]});continue;}
   // the booking: every shown entry in place of a v38 entry has that entry booked in v38's own said list
   const said=J('hxG().said');const unbooked=g.v.script.filter((s,k)=>s.swap40&&g.lines[k]===s.id&&!(Array.isArray(said[s.swap40.cat])&&said[s.swap40.cat].includes(s.swap40.id)));
   out.push({day,season:J('season(S.day)'),next:J('season(S.day+1)'),guests:g.v.guests,shown:g.shown,meta:g.v.meta,ret,trans:g.v.script.filter(s=>s.trans).map(s=>({id:s.id,k:s.k,tip:s.tip})),fb37:(g.lines||[]).includes('fb37-nkechi-evening'),unbooked:unbooked.map(s=>s.swap40.id),told:g.v.script.filter(s=>s.today&&/^told:/.test(s.today)&&s.id!=='gs39-told-again').map(s=>s.id)});}
  return {nights:out,said:J('hxG().said')};};
 const CAT7=id=>{if(/^gs38-..-o\d|first$|soon$|ad-shelf$/.test(id))return 'opener';if(/^gs38-pl-/.test(id))return 'plain';if(/^gs38-re-/.test(id))return 'reaction';if(/^gs38-by-/.test(id))return 'goodbye';
  if(/^gs39-told-again/.test(id))return 'again retelling';if(/^gs39-again-/.test(id))return 'again tip';if(/^gs39-pot-/.test(id))return 'pot ask';if(/^gs38-ask-gist|^gs38-ask-cat-gist|^gs40-ask-/.test(id))return 'Ada\'s ask';if(/^gs38-wash|^gs40-wash-/.test(id))return 'wash tip';if(/^gs40-ag-/.test(id))return 'again tip';if(/^gs40-pot-/.test(id))return 'pot ask';if(/^gs40-tom-/.test(id))return 'Bisi tomorrow';
  if(/^gs39-bi-tom/.test(id))return 'Bisi tomorrow';if(/^gs40-tr-/.test(id))return 'v40 transition tip';if(/^gs40-(er|ret|kid)-/.test(id))return 'v40 information';if(/^gs40-/.test(id))return 'v40 line';return 'information and first-time';};
 const repeats=(nights,from,to)=>{const seen={},C={};let tot=0,rep=0;for(const r of nights){for(const id of r.shown||[]){if(!id)continue;const c=CAT7(id),inW=r.day>=from&&r.day<=to;const prev=(seen[id]||[]).filter(x=>r.day-x<14);
    if(inW){tot++;C[c]=C[c]||[0,0];C[c][0]++;if(prev.length){rep++;C[c][1]++;}}(seen[id]=seen[id]||[]).push(r.day);}}return {tot,rep,C};};
 check(7,()=>{const R={};assert(has40(),'the module');const short=process.env.GIST40_SHORT==='1',LAST=short?16:40;
  const runs={};for(const [name,comp,v] of short?[['pairBefore',false,false],['pairAfter',false,true]]:[['pairBefore',false,false],['pairAfter',false,true],['compBefore',true,false],['compAfter',true,true]])runs[name]=sweep(comp,v,LAST);
  // the ceilings, per category, from the day-2 sizing run (v40/build/gist/NOTES.txt): nights 8 to 28, lines heard on any of the previous thirteen
  // evenings; the guard's history starts at discovery, so a line last heard before day 5 can come back once
  const CEIL={opener:1,goodbye:2,reaction:2,plain:0,'again retelling':1,'v40 line':0};
  for(const h of short?['pair']:['pair','comp']){const b=repeats(runs[h+'Before'].nights,8,LAST),a=repeats(runs[h+'After'].nights,8,LAST);R[h]={before:{shown:b.tot,heardTwice:b.rep,byCategory:b.C},after:{shown:a.tot,heardTwice:a.rep,byCategory:a.C}};
   for(const c in CEIL)assert(((a.C[c]||[0,0])[1])<=CEIL[c],h+': '+c+' heard twice within fourteen evenings '+((a.C[c]||[0,0])[1])+' > '+CEIL[c]);
   assert(a.rep*5<=a.tot,h+': all lines at most one in five heard twice ('+a.rep+' of '+a.tot+')');
   // (fix round, DOD-F4) past the fourth week too: nights 29 to 40, at most one in five
   if(!short){const a4=repeats(runs[h+'After'].nights,29,LAST);assert(a4.rep*5<=a4.tot,h+': nights 29 to '+LAST+', all lines at most one in five heard twice ('+a4.rep+' of '+a4.tot+')');R[h].after.nights29to40={shown:a4.tot,heardTwice:a4.rep,byCategory:a4.C};}
   // the first-time retellings and tips are never replaced: the same as without v40 (v40 never changes the guests, the noon chain or the tips)
   const ft=r=>r.nights.reduce((n,x)=>n+(x.shown||[]).filter(id=>/^gs3[89]-told-/.test(id)&&id!=='gs39-told-again'&&x.day>=8).length,0),lt=r=>r.nights.reduce((n,x)=>n+(x.shown||[]).filter(id=>/^gs3[89]-lost-/.test(id)&&x.day>=8).length,0);
   {if(process.env.TOLD40)fs.writeFileSync(process.env.TOLD40,JSON.stringify({a:runs[h+'After'].nights.map(x=>[x.day,x.guests,x.shown]),b:runs[h+'Before'].nights.map(x=>[x.day,x.guests,x.shown])}));const tl=r=>r.nights.filter(x=>x.day>=8).map(x=>x.day+':'+(x.shown||[]).filter(id=>/^gs3[89]-told-/.test(id)&&id!=='gs39-told-again').join(',')+'/'+(x.guests||[]).join('+')).join(' ');assert.equal(ft(runs[h+'After']),ft(runs[h+'Before']),h+': every first-time retelling still told: after '+tl(runs[h+'After'])+' || before '+tl(runs[h+'Before']));}assert.equal(lt(runs[h+'After']),lt(runs[h+'Before']),h+': every first-time lost tip still told');
   // the swap40 booking: every replaced v38 line is booked in v38's said list (the rotation moves)
   const ub=runs[h+'After'].nights.filter(x=>x.unbooked&&x.unbooked.length);assert.deepEqual(ub.map(x=>x.day+':'+x.unbooked.join(',')),[],h+': the swap40 booking');
   // v38's greetings rotate: every greeting of each neighbour (Ada's three without her bench) shown within the sweep
   if(!short){const all=[].concat(...runs[h+'After'].nights.map(x=>x.shown||[]));const O=J("GIST38.LINES.o");const miss=[];for(const k in O)for(const e of O[k]){if(e[2]==='bench')continue;if(!all.includes(e[0]))miss.push(e[0]);}
    assert.deepEqual(miss,[],h+': every v38 greeting shown within the sweep');}
   // Ada's first greeting never twice within fourteen evenings; the knees line never outside the rains
   const ada=runs[h+'After'].nights.filter(x=>(x.shown||[]).includes('gs38-ad-o1')).map(x=>x.day);assert(ada.every((d,k)=>k===0||d-ada[k-1]>=14||ada[k-1]<5),h+': gs38-ad-o1 twice within fourteen evenings: '+ada.join(','));
   const kn=runs[h+'After'].nights.filter(x=>(x.shown||[]).includes('gs38-pl-oy2')&&x.season!=='rains');assert.deepEqual(kn.map(x=>x.day),[],h+': the knees line outside the rains');
   const kept={},tiers={};for(const x of runs[h+'After'].nights){if(!x.meta)continue;for(const q of x.meta.kept)kept[q[0]]=(kept[q[0]]||0)+1;for(const q of x.meta.swaps)tiers[q[3]]=(tiers[q[3]]||0)+1;}R[h].poolDry=kept;R[h].swapsByTier=tiers;
   // (fix round, S4) the evenings the household fanned his coals: a guest's Mallam goodbye in place of a plain v38 one, at least four evenings apart
   const mb=runs[h+'After'].nights.filter(x=>x.day>=5&&(x.shown||[]).some(id=>/^gs40-ev-..-b2$/.test(id))).map(x=>x.day);assert(mb.length>=1,h+': a Mallam goodbye on a fanned evening');
   assert(mb.every((d,k)=>k===0||d-mb[k-1]>=4),h+': Mallam goodbyes at least four evenings apart: '+mb.join(','));R[h].mallamBye=mb;
   // (fix round 2) every change evening after discovery with a teller among the guests carries exactly one trans:1 line, a tip naming the coming
   // season by a teller who is a guest, shown; no other evening has one (the skip night, v38's once-only football line, aside: v40 leaves it alone)
   const TB=J('GIST40.TRANS_BY'),TK=J('Object.fromEntries(Object.entries(GIST40.LINES.tr).map(([s,o])=>[s,Object.keys(o)]))'),pre7={dry:'dry',harmattan:'har',rains:'rai'};
   const ch=runs[h+'After'].nights.filter(x=>x.day>=5&&x.guests&&x.next&&x.next!==x.season&&TB[x.next].some(k=>x.guests.includes(k)&&TK[x.next].includes(k)));
   const trBad7=ch.filter(x=>!(x.trans.length===1&&x.trans[0].tip===1&&x.trans[0].id.startsWith('gs40-tr-'+pre7[x.next]+'-')&&x.guests.includes(x.trans[0].k)&&TB[x.next].includes(x.trans[0].k)&&x.shown.includes(x.trans[0].id))&&!(x.fb37&&!x.meta&&!x.trans.length));
   assert.deepEqual(trBad7.map(x=>x.day+':'+x.guests.join('+')+':'+JSON.stringify(x.trans)),[],h+': the transition tip on every change evening with a teller among the guests');
   const trOdd7=runs[h+'After'].nights.filter(x=>x.trans&&x.trans.length&&!(x.next&&x.next!==x.season));assert.deepEqual(trOdd7.map(x=>x.day),[],h+': no transition tip on another evening');
   assert(ch.length>=(short?2:8),h+': change evenings in the sweep: '+ch.map(x=>x.day).join(','));R[h].changeEvenings=ch.map(x=>x.day+(x.trans.length?':'+x.trans[0].id:':skip'));}
  R.nights=short?'8-16 (a mutant\'s rerun)':'8-40';return R;});

 /* ---------- check 9: the pickup chime (the integrator; spec §12) ---------- */
 // a stand-in for the v35 sound bus (football's audioStub37): a running context that counts the oscillators made and what reaches the master,
 // Sound on or off as asked; and an AudioContext spy that counts the contexts made
 run(`var AUD40={osc:0,conn:0,made:0,on:false,keep:null,ac:null};var audioStub40=on=>{if(!AUD40.keep)AUD40.keep={ctx:AUDIO35.ctx,master:AUDIO35.master,on:AUDIO35.on};AUD40.on=on;const M={connect(){}},param=()=>({setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
  const node=()=>({frequency:param(),gain:param(),Q:param(),type:'',buffer:null,onended:null,connect(n){if(n===M)AUD40.conn++;},disconnect(){},start(){},stop(){}});
  AUDIO35.ctx={state:'running',currentTime:0,sampleRate:44100,destination:{},createOscillator:()=>{AUD40.osc++;return node();},createGain:node,createBiquadFilter:node,createBufferSource:node,createBuffer:(c,n)=>({getChannelData:()=>new Float32Array(n)})};AUDIO35.master=M;AUDIO35.on=()=>AUD40.on;};
 var audioRestore40=()=>{if(AUD40.keep){AUDIO35.ctx=AUD40.keep.ctx;AUDIO35.master=AUD40.keep.master;AUDIO35.on=AUD40.keep.on;AUD40.keep=null;}if(AUD40.ac){window.AudioContext=AUD40.ac[0];window.webkitAudioContext=AUD40.ac[1];AUD40.ac=null;}};
 var audioSpy40=()=>{if(!AUD40.ac)AUD40.ac=[window.AudioContext,window.webkitAudioContext];window.AudioContext=function(){AUD40.made++;};window.webkitAudioContext=window.AudioContext;};`);
 check(9,()=>{const R={};assert(has40(),'the module');assert(J("typeof DAILY40!=='undefined'&&!!DAILY40.on&&typeof chime40==='function'&&typeof audio40==='function'"),'the chime installed (daily-v40.js)');
  const pins=()=>J("({recipes:Object.keys(AUDIO35.recipes).join(),twins:Object.keys(AUDIO35.twins||{}).join(),cue:CUE35_HOOKS.length,tick:TICK_HOOKS.length,tickAudio:TICK_HOOKS.filter(f=>/audio|chime/i.test(String(f))).length,played:AUDIO35.played.join()})");
  const p0=pins();assert.equal(p0.recipes,'cast,nibble,bite,catch,water','the five recipes');assert.equal(p0.twins,'cast,nibble,bite,catch,water','the five twins');assert.equal(p0.cue,2,'CUE35_HOOKS');assert.equal(p0.tick,17,'TICK_HOOKS');assert.equal(p0.tickAudio,0,'no tick hook mentions audio');
  const n=()=>J('({osc:AUD40.osc,conn:AUD40.conn,chime:DAILY40.n40.chime})');const delta=(a,b)=>({osc:b.osc-a.osc,conn:b.conn-a.conn,chime:b.chime-a.chime});
  const sounded=(d,what)=>{assert.deepEqual(d,{osc:2,conn:2,chime:1},what+': two notes reach the master, one chime');};
  const silent=(d,what)=>{assert.deepEqual(d,{osc:0,conn:0,chime:0},what+': nothing');};
  try{
   // (a) no context: Node never unlocks the sound bus, so AUDIO35.ctx is null; v38's first pickup (the glasses, its discovery) makes no context
   // and sounds nothing
   run('audioSpy40();AUD40.made=0;');assert.equal(J('AUDIO35.ctx'),null,'no sound context in the world');
   run('hxFresh(3,12.02);');away(1);frames(4);let a=n();pickNow(0);silent(delta(a,n()),'v38\'s first pickup with no context');assert.equal(J('AUD40.made'),0,'no context created');assert.equal(J('AUDIO35.ctx'),null,'still none');
   giveNow(0,'nkechi');R.noContext={made:0,chimes:0};
   // (b) Sound on: a v38 thing (the chisel, out at once after the glasses come back before 15:30)
   run('audioStub40(true);');a=n();pickNow(0);sounded(delta(a,n()),'a v38 thing');R.v38=delta(a,n());
   // the base's morning shell: never a chime (it is not a lost thing)
   {const sh=J('SHELLS34[1]'),s0=J('life34().shells');run(`hxAt(0,${sh[0]},${sh[1]-0.9},[0,1]);`);frames(3);a=n();if(hsid(0)==='shell34')press(0);else run('dispatch("lifeShell",{k:1});');frames(2);
    assert.equal(J('life34().shells'),s0+1,'the base shell picked');silent(delta(a,n()),'a base morning shell');R.baseShell='silent';}
   // a card thing (v40 discovered on day 8 through v38's gate) and a child's thing (Emeka's marble at 14:00 on the morning-match day)
   run('life34().evening35={doneDay:3};');nextday();toDay(8);read();assert(B40(),'v40 discovered');a=n();pickCard(0);sounded(delta(a,n()),'a card thing');R.card=delta(a,n());
   run('S.time=10.6;');realEnd(RESULTS[0][0],RESULTS[0][1]);leaveFade();run('S.time=13.9;hxAt(0,-23,13.9,[0,-1]);hxAt(1,-8,-10);');frames(20);run('S.time=14.0;');frames(12);
   const k=kid();assert(k&&k.state==='lost','a child\'s thing on the sand: '+JSON.stringify(k));atSpot(0,k.spot);assert.equal(hsid(0),'kid40pick','the pick prompt');a=n();press(0);assert.equal(kid().state,'hand','in the hand');
   sounded(delta(a,n()),'a child\'s thing');R.kid=delta(a,n());
   // a v39 thing: round two's first (a fixture of a household that has given back all seven, as verify-gist-v39 check 8 makes it), at noon on R+2
   run('hxFresh(3,12.02);');away(1);frames(4);pickNow(0);giveNow(0,'nkechi');run('life34().evening35={doneDay:3};');nextday();
   run(`hxFix40((o,G)=>{G.lost={i:6,since:8,at:12,status:'back',heard:0,told:0,ownerTold:0};G.returned=[['glasses',3],['chisel',4],['adapter',4],['lenscap',5],['wrapper',6],['rule',7],['seeds',8]].map(([id,day])=>({id,day}));G.keep.keepsake=['fan','bird','plate','print','record'];G.eve={day:7,n:4,first:4};G.last={day:7,guests:['tunde','ada'],tips:[],ids:[]};o.day=8;o.time=20;});`);
   nextday();nextday();assert.equal(J('hxG().lost.i'),7,'round two\'s first thing due');run('S.time=12.02;hxAt(1,-8,-10);');frames(4);a=n();const tid=J('FOUND38.LOST[7].id');pickNow(0);sounded(delta(a,n()),'a v39 thing ('+tid+')');R.v39={id:tid,d:delta(a,n())};
   // (c) Sound off: the same pickup sounds nothing
   run('audioStub40(false);hxFresh(3,12.02);');away(1);frames(4);a=n();pickNow(0);silent(delta(a,n()),'a pickup with Sound off');R.soundOff='silent';
   // the pins: AUDIO35.played untouched (the chime never calls AUDIO35.play()), the recipes, twins, cue hooks and tick hooks as before
   assert.deepEqual(pins(),p0,'the sound pins and AUDIO35.played unchanged');assert.equal(J('AUD40.made'),0,'no context created at any point');
   R.byKind=J('DAILY40.n40.byKind');R.wash='not built (cut item 1)';}
  finally{run('audioRestore40();');}
  return R;});

 /* ---------- check 10: Today and the log (spec §14) ---------- */
 check(10,()=>{const R={};assert(has40(),'the module');const U=J('GIST40.UI');
  const rows=()=>J('gistTodayRows38(hxG()).map(r=>[r.k,r.html])');
  disc40('b39');assert(card()&&card().state==='read','the card read on day 5');pickCard(0);assert.equal(card().state,'hand','the card thing in the hand');
  const hand=J('board40Hand()');assert(hand.length===1&&hand[0].kind==='card','board40Hand: '+JSON.stringify(hand));
  // the noon thing in the pocket: the hand folded into v38's pocket row (no extra row)
  run('S.time=12.05;');frames(4);let it=item();if(it){pickNow(0);}let rw=rows();const pk=rw.find(r=>r[0]==='pocket');
  if(pk){const also=J(`esc(${JSON.stringify(U.handAlso.replace('{list}',''))})`).slice(0,15);assert(pk[1].includes(also)&&pk[1].includes(J(`esc(${JSON.stringify(hand[0].text)})`)),'the hand folded into the pocket row: '+pk[1]);
   assert(!rw.some(r=>r[0]==='hand'),'no hand row beside a pocket row');seen(pk[1]);R.folded=true;
   const ow=J('FOUND38.LOST[hxG().lost.i].owner');if(!J(`!!found38Npc('${ow}')`))run('S.time=18.05;');frames(30);run('found38Give(0);closePanel();');}
  // no pocket row: the hand is its own row
  rw=rows();const hr=rw.find(r=>r[0]==='hand');const hn=J('board40Hand()');assert(hr&&hr[1]===J(`esc(${JSON.stringify(U.handRow.replace('{list}',hn[0].text+' ('+hn[0].where.replace(/\.$/,'').replace(/^(He|She) /,m=>m.toLowerCase())+')'))})`),'the hand row: '+JSON.stringify(rw));seen(hr[1]);
  // a busy day at 390 px: the pot asked (a fixture of v39's record), Aunty Bisi's evening, the evening row, the shelf row, the hand: at most four
  // rows, the hand and Bisi's sentence kept (wait, shelf, carve go first; then her sentence folded, never dropped)
  run('S.time=9.0;');frames(2);let bd=0;for(let k=0;k<6&&!J('bisiDay39(S.day)');k++){nextday();bd++;}assert(J('bisiDay39(S.day)'),'a day she passes');
  run(`hxFix40((o,G)=>{G.b39.pot={day:o.day,who:'nkechi',n:2,got:0,gave:0,via:'gist',said:o.day-1};G.b39.potLast.nkechi=o.day;});`);run('S.time=9.0;');frames(2);
  assert.equal(card().state,'hand','the card thing still in the hand (it never lapses)');
  run('hxScreen(390,844,true);');rw=rows();const keys=rw.map(r=>r[0]);const br=J('bisiRow39()');
  assert(rw.length<=4,'at most four rows at 390 px: '+JSON.stringify(keys));assert(keys.includes('hand')&&keys.includes('pot'),'the hand and the pot kept: '+JSON.stringify(keys));
  assert(rw.some(r=>r[1].includes(br.eve)||r[1].includes(br.html)),'Aunty Bisi\'s sentence present: '+JSON.stringify(rw));R.busy390=keys;
  const th=J('todayHTML34()');assert(th.includes(J(`esc(${JSON.stringify(hand[0].text)})`)),'Today shows the hand');seen(th);
  // the integrator's v40 block (the board line, the children's line, Mallam's order) outside the gist card, when daily-v40.js has it
  if(J("typeof DAILY40!=='undefined'&&!!DAILY40&&typeof todayBlock40==='function'")){const bl=J('board40Today()');assert(bl&&th.includes(bl.html),'the board line in Today');const card38=(th.match(/<div class="life-note34 gist38-card">[\s\S]*?<\/div>/)||[''])[0];assert(!card38.includes(bl.html),'outside the gist card');R.block='present';}
  else R.block='daily-v40.js has no block yet (the integrator\'s part of this check)';
  run('hxScreen(1280,800,false);');rw=rows();assert(rw.length<=5&&rw.some(r=>r[0]==='hand'),'five rows at most at 1280 px, the hand kept: '+JSON.stringify(rw.map(r=>r[0])));
  // the fullest day: a thing lying out as heard, a wash day told last night, the hand, the pot, Aunty Bisi's evening (five rows none of which may
  // drop): at 390 px her sentence is folded into the row before it, never dropped; at 1280 px all five
  const wd=J(`(()=>{for(let d=S.day+1;d<=S.day+40;d++)if(found38WashDay(d)&&bisiDay39(d))return d;return -1;})()`);assert(wd>0,'a wash day she passes');toDay(wd);
  run(`hxFix40((o,G)=>{G.last={day:${wd-1},guests:['ada','tunde'],tips:[{kind:'wash',arg:'wash',teller:'ada',owner:null,mode:null}],ids:[]};G.lost.heard=${wd-1};G.lost.heardMode='remind';G.b39.pot={day:${wd},who:'nkechi',n:2,got:0,gave:0,via:'gist',said:${wd-1}};G.b39.potLast.nkechi=${wd};});`);
  run('S.time=12.4;');frames(6);assert.equal(J('found38Today().lost&&found38Today().lost.status'),'out','a thing lying out');assert.equal(card().state,'hand','the card thing still in the hand');
  run('hxScreen(390,844,true);');rw=rows();let ks=rw.map(r=>r[0]);const br2=J('bisiRow39()');
  assert(['lost','wash','hand','pot'].every(k=>ks.includes(k))&&rw.length<=4,'four rows at 390 px, none of lost, wash, hand, pot dropped: '+JSON.stringify(ks));
  assert(!ks.includes('bisi')&&rw.some(r=>r[1].includes(br2.html)),'Aunty Bisi\'s sentence folded into the row before it: '+JSON.stringify(rw));R.full390=ks;seen(rw.map(r=>r[1]).join(' '));
  run('hxScreen(1280,800,false);');rw=rows();ks=rw.map(r=>r[0]);assert(['lost','wash','hand','pot','bisi'].every(k=>ks.includes(k))&&rw.length===5,'all five at 1280 px: '+JSON.stringify(ks));R.full1280=ks;
  // the children's line (kid40Today) and the hand with a child's thing: covered by check 5's states; here its fold with the card thing
  // the log kinds once each; the gates tool reads them with no warnings and the same grades
  const kinds=J('LOG35.kinds');for(const k of ['board','kid','mallam'])assert.equal(kinds.filter(x=>x===k).length,1,'LOG35.kinds '+k);
  const Gt=require(path.join(__dirname,'..','tools','gates-v35.cjs'));run("LOG35.add('kid','drop marble');LOG35.add('kid','pick marble');LOG35.add('kid','back marble');LOG35.add('mallam','fan');LOG35.add('board','read knob');");
  const days=J('JSON.stringify(Object.keys(S.life.days))');const textWith=J('daysText35()');run(`for(const n of ${days}){const r=S.life.days[n];if(r&&r.events)r.events=r.events.filter(e=>!['board','kid','mallam'].includes(e.k));}`);const textWithout=J('daysText35()');
  const an=x=>Gt.analyse([{name:'tester-1.txt',text:'Tester: Test\n'+x}],{testers:1});const aw=an(textWith),ao=an(textWithout);const warns=JSON.stringify(aw).match(/could not be read/g)||[];
  assert(['board','kid','mallam'].every(k=>textWith.includes(' '+k+' ')),'the paste carries the three kinds');assert.equal(warns.length,0,'gates warnings');assert.deepEqual(aw.gates.map(x=>x.status),ao.gates.map(x=>x.status),'the same grades');
  R.gates={warnings:0,grades:aw.gates.map(x=>x.status)};
  // the integrator's part (spec §14.1): Today's v40 block, outside the gist card and before it, with the board line in each of its states, the
  // children's line and Mallam's order; nothing before v40 is discovered (a v38 household, layer 2 open on day 8)
  {const blk=()=>{const th=J('todayHTML34()');const m=th.match(/<div class="life-note34 gist40-today"[^>]*>([\s\S]*?)<\/div>/),g=(th.match(/<div class="life-note34 gist38-card">[\s\S]*?<\/div>/)||[''])[0];
    return {th,inner:m?m[1]:null,at:m?th.indexOf(m[0]):-1,gat:th.indexOf('<div class="life-note34 gist38-card">'),chips:th.indexOf('<div class="life-chips34">'),g};};
   const inBlock=(what,html,st)=>{const b=blk();assert(b.inner!==null,what+': the v40 block in Today');assert(b.inner.includes(html),what+': '+html+' in the block: '+b.inner);assert(!b.g.includes(html),what+': not in the gist card');
    assert(b.at>=0&&b.at<b.chips&&(b.gat<0||b.at<b.gat),what+': the block before the gist card and the chips');seen(html);return b;};
   const S10={};disc();toDay(8);run('S.time=10.4;hxAt(0,-8,-10);hxAt(1,-7,-10);');frames(4);assert(!B40(),'v40 not yet discovered');assert.equal(blk().inner,null,'no v40 block before discovery (layer 2 open, the card up)');
   read();let bl=J('board40Today()');assert(bl&&bl.state==='read','the board line read: '+JSON.stringify(bl));inBlock('read',bl.html);S10.read=bl.html;
   // Mallam's order: its line in the block
   run('S.time=Math.max(S.time,10.7);hxAt(0,-3,10.6,[0,1]);hxAt(1,-8,-10);');frames(10);assert.equal(hsid(0),'mallam40order','the order prompt');run('PH="";');press(0);click('mallam40Order',x=>x.data.v==='onion');frames(4);
   const ml=J('mallam40Today()');assert(ml&&ml.html,'Mallam\'s order line');inBlock('the order',ml.html);S10.order=ml.html;
   // the card thing in the hand
   pickCard(0);bl=J('board40Today()');assert.equal(bl.state,'hand','the board line with you');inBlock('hand',bl.html);S10.hand=bl.html;
   // the morning match, its exit, and the children's line from 14:00 (a child's thing lost in the afternoon play)
   run('S.time=10.9;');realEnd(RESULTS[0][0],RESULTS[0][1]);leaveFade();run('S.time=13.9;hxAt(0,-23,13.9,[0,-1]);hxAt(1,-8,-10);');frames(20);run('S.time=14.0;');frames(12);
   const kl=J('kid40Today()');assert(kl&&kl.html,'the children\'s line from 14:00');const kb=inBlock('the children',kl.html);assert(kb.inner.includes(bl.html)&&kb.inner.includes(ml.html),'three lines at once');S10.kid=kl.html;S10.three=(kb.inner.match(/<p /g)||[]).length;
   // the card thing given back: "back"
   let gv=giveCard(0);if(!gv){run('S.time=18.02;');frames(4);gv=giveCard(0);}assert(gv,'the card thing given back');bl=J('board40Today()');assert.equal(bl.state,'back','the board line back');inBlock('back',bl.html);S10.back=bl.html;
   // the next morning before half past ten ("before"), and after it with the new card up and unread ("new")
   run('S.time=21.5;');frames(2);nextday();run('S.time=9.0;');frames(4);bl=J('board40Today()');assert.equal(bl&&bl.state,'before','before half past ten: '+JSON.stringify(bl));inBlock('before',bl.html);S10.before=bl.html;
   run('S.time=10.55;hxAt(0,-8,-10);');frames(8);bl=J('board40Today()');assert.equal(bl&&bl.state,'new','after half past ten, unread: '+JSON.stringify(bl));inBlock('new',bl.html);S10.fresh=bl.html;
   // at 390 px with the gist card's rows at their cap, the block is still there
   run('hxScreen(390,844,true);');inBlock('390 px',bl.html);run('hxScreen(1280,800,false);');
   // online: no block
   run('NET.on=true;');const on=blk();run('NET.on=false;');assert.equal(on.inner,null,'no v40 block online');
   R.block40=S10;}
  return R;});

 /* ---------- check 12: the copy (spec §4, §13) ---------- */
 check(12,()=>{const R={};assert(has40(),'the module');
  // (repair, VN-2) every top-level name in the four v40 files ends in 40, apart from the spec's API names (board40Today and the like, §1.7)
  {const bad=[];for(const f of ['board-v40.js','mallam-v40.js','gist-v40.js','daily-v40.js']){const src=fs.readFileSync(path.join(GAME,'src',f),'utf8');
    for(const m of src.matchAll(/^(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm))if(!/40$/.test(m[1])&&!/^[a-z]+40[A-Z][a-z]+$/.test(m[1]))bad.push(f+': '+m[1]);}
   assert.deepEqual(bad,[],'top-level names end in 40: '+JSON.stringify(bad));R.names40='all';}
  const T=J("({L:GIST40.LINES,U:GIST40.UI,C:GIST40.CARDS,BC:BOARD40.CARDS,BU:BOARD40.UI,ML:typeof MALLAM40!=='undefined'?MALLAM40.LINES:{},MU:typeof MALLAM40!=='undefined'?MALLAM40.UI:{}})");
  const leaves=(o,pre,acc)=>{if(typeof o==='string')acc.push([pre,o]);else if(Array.isArray(o))o.forEach((v,k)=>leaves(v,pre+'['+k+']',acc));else if(o&&typeof o==='object')for(const k in o)leaves(o[k],pre?pre+'.'+k:k,acc);return acc;};
  // the speech: every gs40 entry (its text the longest string in it), Mallam's lines; the cards (written UI); the interface tables
  const lines=[];const walk=(o,pre)=>{if(Array.isArray(o)&&typeof o[0]==='string'&&/^gs\d\d-/.test(o[0])){const t=o.slice(1).filter(x=>typeof x==='string').sort((a,b)=>b.length-a.length)[0];lines.push([o[0],t,pre]);return;}
   if(Array.isArray(o))o.forEach((v,k)=>walk(v,pre+'['+k+']'));else if(o&&typeof o==='object')for(const k in o)walk(o[k],pre+'.'+k);};walk(T.L,'GIST40.LINES');walk(T.ML,'MALLAM40.LINES');
  const ids=lines.map(p=>p[0]);assert.deepEqual(ids.filter((x,k)=>ids.indexOf(x)!==k),[],'ids unique');assert(ids.every(id=>/^gs40-/.test(id)),'every line id gs40-');
  const cards=Object.entries(T.BC).concat(Object.entries(T.C));assert(cards.every(([id])=>/^bd40-/.test(id)),'every card id bd40-');
  const items=leaves(T.L.kid.items,'GIST40.LINES.kid.items',[]);const ui=leaves(T.U,'GIST40.UI',[]).concat(leaves(T.BU,'BOARD40.UI',[]),leaves(T.MU,'MALLAM40.UI',[]),items);
  const OK=new Set(['thing','owner','area','where','name','sender','receiver','item','child','choice','Area','n','place']);const WEEK=/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)s?\b/i,MONTH=/\b(January|February|March|April|June|July|August|September|October|November|December)\b/;
  const US=/\b(color|colors|favorite|favor|flavor|neighbor|neighbors|center|centers|honor|labor|gray|organize|realize|apologize|traveled|jewelry|theater|mom|program|pajamas|mold)\b/i;
  const PIDGIN={test:t=>/\bo\b(?![’'])/.test(t)||/\b(abeg|na|sha|wahala|oya|dey|don|una|abi|ehen|chai|nna|wetin|sef|jare)\b(?![’'])/i.test(t)},RT=/\b(rain|raining)\b[^.]*\btomorrow\b/i;
  const bad=[];const rule=(where,t,kind)=>{if(WEEK.test(t))bad.push(where+': a weekday');if(MONTH.test(t))bad.push(where+': a month');if(US.test(t))bad.push(where+': American spelling');if(/'/.test(t))bad.push(where+': a straight apostrophe');
   if(/[<>]/.test(t))bad.push(where+': markup');if(/\bat dusk\b/i.test(t))bad.push(where+': "at dusk"');if(/\b(Aunty|Auntie|Uncle)\b/.test(t)&&/kid\.(ty|play|ask|shout)/.test(where))bad.push(where+': Aunty or Uncle from a child');
   if(kind==='speech'){if(t.length>160)bad.push(where+': '+t.length+' characters');for(const m of t.matchAll(/\{(\w+)\}/g))if(!OK.has(m[1]))bad.push(where+': the placeholder {'+m[1]+'}');if(/[0-9₦]/.test(t.replace(/1979/g,'')))bad.push(where+': a digit or ₦ in speech');}
   if(kind==='card'){if(t.length>200)bad.push(where+': '+t.length+' characters');if(PIDGIN.test(t))bad.push(where+': a Pidgin word on a card');if(/[0-9₦]/.test(t.replace(/Flat 3/g,'')))bad.push(where+': a digit other than Flat 3');for(const m of t.matchAll(/\{(\w+)\}/g))if(!OK.has(m[1]))bad.push(where+': the placeholder {'+m[1]+'}');}
   if(kind==='ui'){if(PIDGIN.test(t.replace(/\{[^}]+\}/g,'')))bad.push(where+': a Pidgin word in the interface');if(t.length>200)bad.push(where+': '+t.length+' characters');}};
  for(const [id,t,pre] of lines){rule(pre+' '+id,t,'speech');if(!/\.tr\./.test(pre)&&RT.test(t))bad.push(id+': rain tomorrow outside a transition tip');}
  // (repair) the culture rules of the repair round: no child seller in any line or card (VC-1, "No child seller"); Mrs. Oyelaran, out all afternoon,
  // never says she did something there "this afternoon" (VC-4); no v40 wash wording opens as v38's do ("High water tonight. Tomorrow…") or
  // shares a run of five words with a v38 wash line (VC-3)
  {const SELL=/\b(child|children|kids?|boys?|girls?)\b[^.]*\b(sold|sell|sells|selling|hawk|hawked|hawking)\b/i,c=[];
   for(const [id,t] of lines.map(x=>[x[0],x[1]]).concat(cards))if(SELL.test(t))c.push(id);assert.deepEqual(c,[],'no child seller (VC-1): '+JSON.stringify(c));
   const oy=lines.filter(([id])=>/-oy-/.test(id)&&/\bthis afternoon\b/i.test(lines.find(x=>x[0]===id)[1])).map(x=>x[0]);assert.deepEqual(oy,[],'Mrs. Oyelaran out all afternoon (VC-4): '+JSON.stringify(oy));
   // (repair 4, R4-5) she is out from twelve to six and most matches are played from three: no match line of hers says she watched or heard the
   // match from home (news she had at six, or her opinion)
   const FB=J('GIST40.LINES.fb.oyelaran'),HOME=/upstairs|\b(from|at|through) (my|the) window\b|\bfrom home\b|\bI (watched|saw|heard|could hear|could see)\b/i,fo=FB.filter(e=>HOME.test(e[2])).map(e=>e[0]);
   assert(FB.length===7&&fo.length===0,'Mrs. Oyelaran\'s match lines: none watched or heard from home (R4-5): '+JSON.stringify(fo));
   // (repair 4, R4-3) the again tips are said the evening before the thing goes missing: none says "today", counts the losses ("a second time") or
   // says it has already gone
   const AG=lines.filter(([id])=>/^gs40-ag-/.test(id)),GONE=/\btoday\b|second time|\b(has|have|is|was) (gone|missing|lost|run away|wandered|disappeared|strayed|taken)\b|\b(gone|lost) again\b|\bit was my\b/i,ag=AG.filter(x=>GONE.test(x[1])).map(x=>x[0]);
   assert(AG.length===20&&ag.length===0,'the again tips true the evening before (R4-3): '+JSON.stringify(ag));R.againTips=AG.length;
   const W38=J("Object.values(GIST38.LINES.wash).map(e=>e[1])"),W40=lines.filter(([id])=>/^gs40-wash-/.test(id));const wd=t=>t.toLowerCase().match(/[a-z’']+/g)||[];
   const g5=t=>{const w=wd(t),o=new Set();for(let k=0;k+5<=w.length;k++)o.add(w.slice(k,k+5).join(' '));return o;},G38=new Set(W38.flatMap(t=>[...g5(t)]));
   const wb=W40.filter(([id,t])=>/^High water tonight\. Tomorrow/.test(t)||[...g5(t)].some(g=>G38.has(g))).map(x=>x[0]);assert(W40.length===10&&wb.length===0,'the v40 wash wordings vary from v38\'s (VC-3): '+JSON.stringify(wb));R.washVary=W40.length;}
  // (repair 3, R3-3) no line of GIST40.LINES, MALLAM40.LINES or the cards shares a run of more than four words with a shipped v38 or v39 line (every
  // quoted string of found-v38, gist-v38, seller-v39 and gist-v39) or with another of those v40 lines, place phrases (BOARD40.AREAS and WHERE,
  // v38's and v39's place wordings, the children's and the spoon's sand) and the fixed facts and forms below masked first
  {const words=t=>(String(t).toLowerCase().match(/[a-z’'{}]+/g)||[]);const old=[];
   for(const f of ['found-v38.js','gist-v38.js','seller-v39.js','gist-v39.js']){const src=fs.readFileSync(path.join(GAME,'src',f),'utf8');for(const m of src.matchAll(/'([^'\n]{12,400})'/g))if(/ /.test(m[1]))old.push([f,m[1]]);}
   const places=new Set(['on the sand by the pitch','on the sand by the bench']);const lv=(o,a)=>{if(typeof o==='string')a.push(o);else if(o&&typeof o==='object')for(const k in o)lv(o[k],a);return a;};
   for(const t of lv(J('BOARD40.AREAS'),[]).concat(lv(J('BOARD40.WHERE||{}'),[])))if(t.split(' ').length>=2)places.add(t);
   for(const [,t] of old)if(/^(Over |Near |On |In |Along |By |Round |At |Past |Behind |Under |Beside )/.test(t)&&t.split(' ').length<=8&&!/[.!?]$/.test(t))places.add(t);
   const FACTS=['after six','by six','at six','half past ten','half past twelve','after half past twelve','half past five','by half past five','after two o’clock','caught after two o’clock','after two','in the early afternoon','tomorrow afternoon','tomorrow after midday','after midday','from five','five o’clock',
    'the rains come back tomorrow','the rainy season comes back tomorrow','the rainy season returns tomorrow','the dry season starts tomorrow','the dry season comes tomorrow','from tomorrow the dry season','harmattan is coming tomorrow',
    'good evening my dear','good evening my friend','good night my dear','good night my friend','good morning my dear','good morning my friend','thank you my dear','thank you my friend','with thanks bassey','mama n','lost again my {thing}','if found kindly return'];
   let pw=[...places].map(words).filter(w=>w.length>=2).concat(FACTS.map(words));pw=pw.concat(pw.filter(w=>['over','on','in','along','by','round','near','at','past'].includes(w[0])&&w.length>=3).map(w=>w.slice(1))).sort((a,b)=>b.length-a.length);
   let uniq=0;const mask=w=>{const o=w.slice();for(const q of pw)for(let i=0;i+q.length<=o.length;i++){let ok=true;for(let k=0;k<q.length;k++)if(o[i+k]!==q[k]){ok=false;break;}if(ok)for(let k=0;k<q.length;k++)o[i+k]='#'+(uniq++);}return o;};
   const g5=w=>{const o=new Set();for(let k=0;k+5<=w.length;k++)o.add(w.slice(k,k+5).join(' '));return o;};
   const OLD=new Map();for(const [f,t] of old)for(const g of g5(mask(words(t))))if(!OLD.has(g))OLD.set(g,f+': '+t.slice(0,60));
   const V=lines.map(([id,t])=>[id,t]).concat(cards).map(([id,t])=>({id,t,g:g5(mask(words(t)))}));const over=[];
   for(const a of V){for(const g of a.g)if(OLD.has(g)){over.push(a.id+' ['+g+'] ~ '+OLD.get(g));break;}}
   for(let i=0;i<V.length;i++)for(let j=i+1;j<V.length;j++){if(V[i].t===V[j].t)continue;for(const g of V[i].g)if(V[j].g.has(g)){over.push(V[i].id+' ['+g+'] ~ '+V[j].id);break;}}
   assert.deepEqual(over,[],'no v40 line shares more than four words in a row with a v38, v39 or other v40 line (R3-3): '+JSON.stringify(over.slice(0,6)));R.overlap={v40:V.length,old:old.length,places:places.size,runs:0};}
  // (repair 3, R3-4, R3-6) a line that says it rained today ("Rain like this…", "The water came back.") is said only after rain that day: its entry
  // carries the 'rain' gate (the pot and again wordings are swapped by season only, so they never say it)
  {const RN=/\b(rain like this|rain comes like this|rained today|so much rain today|the rain came|after rain like that|the water came back|rain caught me|stairs still wet|through the rain)\b/i,un=[];
   const wk=o=>{if(Array.isArray(o)&&typeof o[0]==='string'&&/^gs40-/.test(o[0])){const t=o.slice(1).filter(x=>typeof x==='string').sort((a,b)=>b.length-a.length)[0];if(RN.test(t)&&!o.includes('rain'))un.push(o[0]);return;}if(o&&typeof o==='object')for(const k in o)wk(o[k]);};wk(T.L);
   assert.deepEqual(un,[],'a line about today\'s rain only after rain that day (R3-4, R3-6): '+JSON.stringify(un));}
  for(const [id,t] of cards){if(!/^bd40-(card-|again-|cross-|er-notice|season)/.test(id)){rule('BOARD40.CARDS '+id+' (spoken)',t,'speech');continue;}rule('card '+id,t,'card');if(/^bd40-(card|again)-/.test(id)&&!/^LOST/.test(t))bad.push(id+': a lost card starts "LOST:"');if(/^bd40-(card|again|cross)-/.test(id)&&!/(— (T|A|O|Mama N)\.|Bassey\.?)$/.test(t))bad.push(id+': not signed');
   if(/^bd40-er-notice/.test(id)&&!/^NOTICE\./.test(t))bad.push(id+': a notice starts "NOTICE."');}
  for(const [w,t] of ui)rule(w,t,'ui');
  // (fix round, C2, C6, DOD-F9) the board's other strings a player sees (the things' names, pick and give labels, the areas' three forms, where
  // the owners are, the initials), every card filled for each thing in both cycles, the notice for each pair, Mallam's filled lines
  const BT=J("({TH:BOARD40.THINGS,AR:BOARD40.AREAS,WH:BOARD40.WHERE,IN:BOARD40.INITIAL})"),more=[];
  for(const id in BT.TH)for(const k of ['name','long','pickLabel','give'])more.push(['BOARD40.THINGS.'+id+'.'+k,BT.TH[id][k]]);
  for(const a in BT.AR)for(const k of ['say','where','look'])if(typeof BT.AR[a][k]==='string')more.push(['BOARD40.AREAS.'+a+'.'+k,BT.AR[a][k]]);else bad.push('BOARD40.AREAS.'+a+': no '+k);
  for(const [w,t] of more.concat(leaves(BT.WH,'BOARD40.WHERE',[]),leaves(BT.IN,'BOARD40.INITIAL',[])))rule(w,t,'ui');
  const filled=J("(()=>{const o=[];for(const id in BOARD40.THINGS)for(const c of [0,1,2])o.push(['card '+id+' cycle '+c,cardText40(id,c)]);for(const p of BOARD40.ERRAND.pairs)o.push(['notice '+p.id,boardFill40(boardText40('bd40-er-notice'),{sender:boardName40(p.from),item:p.item,receiver:boardName40(p.to),place:p.place})]);return o;})()");
  for(const [w,t] of filled){rule('filled '+w,t,'card');if(/\{\w+\}/.test(t))bad.push('filled '+w+': a placeholder left');if(!/(— (T|A|O|Mama N)\.|Bassey\.?)$/.test(t))bad.push('filled '+w+': not signed');}
  const said=J("['pepper','onion'].map(c=>['ordered','kept'].map(k=>mallamFill40(mallamLine40(k),{choice:MALLAM40.UI.choice[c]}))).flat()");for(const t of said)rule('filled Mallam: '+t.slice(0,30),t,'speech');
  R.boardStrings=more.length+filled.length;
  // (fix round, C16) the cards' marks: Ada's sketch only on the card that says "See sketch"; in Mrs. Oyelaran's hand only the first word underlined
  const hm=J(`(()=>{const p=BOARD40.ERRAND.pairs[0];return {block:boardCardHTML40('block',0),oil:boardCardHTML40('oil',0),oilAgain:boardCardHTML40('oil',1),pegs:boardCardHTML40('pegs',0),minutes2:boardCardHTML40('minutes',1),notice:boardNoticeHTML40(p),crossed:boardCardHTML40('block',0,{crossed:true})};})()`);
  assert(/gist40-sketch/.test(hm.block)&&!/gist40-sketch/.test(hm.oil)&&!/gist40-sketch/.test(hm.oilAgain)&&!/gist40-sketch/.test(hm.crossed),'the sketch mark only on the card that mentions a sketch');
  assert(/<p><span class="gist40-u">LOST:<\/span> /.test(hm.pegs)&&/<p><span class="gist40-u">LOST AGAIN:<\/span> /.test(hm.minutes2)&&/<p><span class="gist40-u">NOTICE\.<\/span> /.test(hm.notice)&&[hm.pegs,hm.notice].every(h=>(h.match(/gist40-u/g)||[]).length===1)&&!/gist40-u/.test(hm.block),'only Mrs. Oyelaran\'s first word underlined: '+JSON.stringify([hm.pegs.slice(0,90),hm.notice.slice(0,90)]));
  // (finisher) every bubble drawn whole: with the module's own width estimate (34 px x 0.55 a character) the sprite draws every word of each of
  // Mallam's lines (both choices), the children's bubble lines and the board's bubbles (the copied three-line cap cut the end off the kept line)
  const sp=J(`(()=>{const T=[];for(const k in MALLAM40.LINES)for(const c of ['pepper','onion'])T.push(mallamFill40(mallamLine40(k),{choice:MALLAM40.UI.choice[c]}));
   const kid=o=>{if(typeof o==='string')T.push(o.replace(/\{\w+\}/g,'skipping rope'));else if(o&&typeof o==='object')for(const k in o)kid(o[k]);};kid(GIST40.LINES.kid);
   T.push(boardText40('bd40-oy-bubble'));for(const p of BOARD40.ERRAND.pairs)T.push(boardText40('bd40-er-take-'+p.from));
   const dc=document.createElement,cut=[],U=[...new Set(T)];let drawn=[],max=0;
   document.createElement=function(t){const e=dc.apply(this,arguments);if(t==='canvas'&&e&&e.getContext){const gc=e.getContext;e.getContext=function(){const g=gc.apply(this,arguments);if(g){g.measureText=s=>({width:String(s).length*34*0.55});const f=g.fillText;g.fillText=function(s){drawn.push(s);return f&&f.apply(this,arguments);};}return g;};}return e;};
   try{for(const t of U){drawn=[];quiet40(()=>boardSprite40(t));max=Math.max(max,drawn.length);if(drawn.join(' ')!==t)cut.push(t.slice(0,60)+' / '+drawn.length);}}finally{document.createElement=dc;}
   return {n:U.length,max,cut};})()`);
  assert.deepEqual(sp.cut,[],'every bubble drawn whole: '+JSON.stringify(sp.cut.slice(0,4)));R.bubbles={texts:sp.n,mostLines:sp.max};
  // the texts rendered in checks 5, 6 and 10 (toasts, rows, panels, bubbles and the lines shown at the gist)
  for(const t of SEEN40){rule('rendered: '+t.slice(0,40),t,'rendered');if(/\{\w+\}/.test(t))bad.push('rendered with a placeholder: '+t.slice(0,60));}
  assert.deepEqual(bad,[],'the copy rules: '+JSON.stringify(bad.slice(0,12)));
  // (repair 5, R5-1, R5-2) the match lines true whenever the match ended. (a) Rain: no match line rides the bare 'rain' fact (it rained at some hour
  // today); a line that speaks of rain, wet or mud carries 'wet' (the rain began before the match ended). (b) Mrs. Oyelaran, out from twelve to
  // six, a match decided as late as 18:20: no match line of hers claims an hour or a first-hand sight. (c) In the world: the match-end hour in
  // v40's record against the day's rain (a Saturday-morning match before the rain, a 15:30 match before rain at four, rain at half past
  // three during the match, rain before a match, no rain); Tunde's courtyard line only for a match that ended from noon; no general (hearsay)
  // line by Mr. Bassey, who watched from the touchline; on the evening before a season changes, the again tip in its season-free wording
  {const FBA=J('GIST40.LINES.fb'),all=[].concat(...Object.values(FBA)),WETX=/\b(rain|rained|raining|wet|mud|puddles?)\b/i;
   const bare=all.filter(e=>String(e[1]).split('+').includes('rain')).map(e=>e[0]),wl=all.filter(e=>WETX.test(e[2])&&!String(e[1]).split('+').includes('wet')).map(e=>e[0]);
   assert(bare.length===0&&wl.length===0,'match lines about rain only when it began before the match ended (R5-1): '+JSON.stringify({bare,wl}));R.wetLines=all.filter(e=>String(e[1]).split('+').includes('wet')).map(e=>e[0]);
   const OYF=FBA.oyelaran,TIME=/\b(at|by|before|after|until|till|since|from) (one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|noon|midday)\b|o’clock|\bhalf past\b|\bwhen I (came|got|reached|arrived|was)\b|\b(came|got) (in|back|home)\b|\bthis (morning|afternoon)\b|\bat the gate\b/i,
    SIGHT=/\bI (watched|saw|see|heard|could hear|could see|noticed|looked)\b|\b(touched|hit|broke|found|knocked) my window\b|\bmy window (once|today|twice)\b|\bstate of the sand\b|\bmy own eyes\b|\bupstairs\b|\bfrom home\b/i;
   const oyT=OYF.filter(e=>TIME.test(e[2])).map(e=>e[0]),oyS=OYF.filter(e=>SIGHT.test(e[2])).map(e=>e[0]);
   assert(OYF.length===7&&!oyT.length&&!oyS.length,'no Oyelaran match line claims a time or a first-hand sight (R5-2): '+JSON.stringify({time:oyT,sight:oyS}));R.oyelaranMatch='no hour, no sight';
   run("dispatch('newgame');");disc40('b39');
   const W=J(`(()=>{const b=hxB40(),L=fbEnsureSave37(),t0=S.time,w0=JSON.stringify(S.weather||null),l0=JSON.stringify(L.last||null),f0=JSON.stringify(L.firsts||null),e0=b.fbEnd,h0=JSON.stringify(b.heard),out=[];
    try{L.last={day:S.day,mode:'coop',a:2,b:1,result:'won',last:false,called:false,scorers:['p0','kemi']};L.firsts={win:0,last:0};
     const elig=f=>{const o=[];for(const k in GIST40.LINES.fb)for(const e of GIST40.LINES.fb[k])if(matchOK40(f,e[1]))o.push(e[0]);return o;};
     for(const [n,end,rain] of [['Saturday morning, ended 10:40, rain 14:00',10.67,14],['ended 15:50, rain from 16:00',15.84,16],['15:30 to 16:10, rain from 15:30',16.17,15.5],['rain 13:00, ended 15:50',15.84,13],['no rain, ended 15:50',15.84,null]]){
      S.weather={day:S.day};if(rain!==null){S.weather.rainAt=rain;S.weather.rainTo=rain+1;}b.fbEnd={day:S.day,t:end};S.time=19;const f=matchFacts40(),el=elig(f);
      out.push({n,wet:f.wet,aft:f.aft,rain:f.rain,wetEl:el.filter(id=>/-(ba10|nk7|oy5)$/.test(id)),tu5:el.includes('gs40-fb-tu5'),oy:matchLine40(b,{guests:['oyelaran','nkechi']},[],new Set())});}
     S.weather={day:S.day,rainAt:13,rainTo:14};b.fbEnd={day:S.day,t:15.84};b.heard={};for(const k of ['tunde','bassey'])for(const e of GIST40.LINES.fb[k])b.heard[e[0]]=S.day-1;
     const gb=matchLine40(b,{guests:['tunde','bassey']},[],new Set());return {cases:out,bassey2:gb};}
    finally{S.time=t0;S.weather=JSON.parse(w0);L.last=JSON.parse(l0);L.firsts=JSON.parse(f0);if(e0)b.fbEnd=e0;else delete b.fbEnd;b.heard=JSON.parse(h0);}})()`);
   const C=W.cases,want=[[false,false],[false,true],[true,true],[true,true],[false,true]];
   C.forEach((c,k)=>{assert(c.wet===want[k][0]&&c.wetEl.length===(want[k][0]?3:0),'the wet lines '+(want[k][0]?'':'not ')+'eligible: '+c.n+' '+JSON.stringify(c));assert(c.aft===want[k][1]&&c.tu5===want[k][1],'Tunde\'s courtyard line only from noon: '+c.n+' '+JSON.stringify(c));
    if(!want[k][0])assert(!(c.oy&&/-(ba10|nk7|oy5)$/.test(c.oy.id)),'no wet line picked: '+c.n+' '+JSON.stringify(c.oy));});
   assert(C[0].rain===true&&C[0].wet===false,'a Saturday-morning match before the day\'s rain is not "in the wet" (R5-1): '+JSON.stringify(C[0]));
   assert(!(W.bassey2&&W.bassey2.k==='bassey'),'no general match line by Mr. Bassey: '+JSON.stringify(W.bassey2));R.wetCases=C.map(c=>c.n+': '+(c.wet?'wet':'dry')+(c.aft?', from noon':''));
   // the again tip on the evening before a season changes: the season-free wording (the loss is tomorrow, in the next season)
   let dc=-1;for(let d=J('S.day')+1;d<=J('S.day')+14;d++)if(J(`season(${d}+1)!==season(${d})`)){dc=d;break;}assert(dc>0,'a change evening ahead');toDay(dc);
   const ag=J(`(()=>{const b=hxB40(),t0=S.time,h0=JSON.stringify(b.heard);try{S.time=18.2;b.heard['gs39-again-ada']=S.day-1;const sc=[{k:'ada',id:'gs38-x-o',cat:'o:ada',open:1,once:'x',text:'a'},{k:'tunde',id:'gs38-y-o',cat:'o:tunde',open:1,once:'y',text:'b'},{k:'ada',id:'gs39-again-ada',tip:1,text:'c'},{k:'tunde',id:'gs38-by-y',cat:'by:tunde',once:'z',text:'d'}];
     const p={guests:['ada','tunde'],script:sc,tips:[{kind:'lost',owner:'ada',arg:'chisel'}]};p.script.g39={};const q=gistPlan40(p);return {se:season(S.day),next:season(S.day+1),ids:q?q.script.map(s=>s.id):null};}finally{S.time=t0;b.heard=JSON.parse(h0);}})()`);
   assert(ag.se!==ag.next&&ag.ids&&ag.ids.includes('gs40-ag-ada')&&!ag.ids.some(id=>/^gs40-ag-ad-/.test(id)),'the evening before a change, the again tip\'s season-free wording: '+JSON.stringify(ag));R.againChange=ag;}
  const cnt=k=>lines.filter(x=>x[2].startsWith('GIST40.LINES.'+k)).length;R.lines={speech:lines.length,cards:cards.length,ui:ui.length,rendered:SEEN40.length,kid:cnt('kid'),match:cnt('fb'),season:cnt('se'),evergreen:cnt('ev'),transition:cnt('tr'),cardReturn:cnt('ret'),errand:cnt('er'),mallam:lines.filter(x=>x[2].startsWith('MALLAM40')).length};
  return R;});

 out.sort((a,b)=>a.n-b.n);return out;}

async function inner(only){const h=await world40();const side={};const res=checks(h,only,side);return {build:h.run('BUILD_ID'),checks:res,side};}

// a subset copy's globals: load it, play 300 frames over day 3 midday and day 4 at five, list the names; warnings naming 39 or 40 counted
async function globals(){const out={names:[],warn:0,played:0,error:null};try{const {benchWorld}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));
 const {run,context}=await benchWorld();let n=0;const cw=context.console.warn;context.console={...context.console,warn:(...a)=>{if(/39|40/.test(String(a[0])))n++;}};
 run("S.day=3;S.time=11.95;var hxF2=0;{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<300;k++){T35+=1000/30;PERF35+=1000/30;last=hxF2;hxF2+=1000/30;tick(hxF2);}}finally{renderFrame=rf;}}");
 run("dispatch('nextday');closePanel();S.time=16.95;{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<300;k++){T35+=1000/30;PERF35+=1000/30;last=hxF2;hxF2+=1000/30;tick(hxF2);}}finally{renderFrame=rf;}}enterWorld();closePanel();");
 out.played=600;out.warn=n;context.console.warn=cw;
 const html=fs.readFileSync(path.join(GAME,'index.html'),'utf8'),lex=new Set();
 for(const [,attr,body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){const src=attr.match(/src="([^"]+)"/);if(src&&src[1].includes('three-r128'))continue;const code=src?fs.readFileSync(path.join(GAME,src[1]),'utf8'):body;
  for(const m of code.matchAll(/^(?:const|let|class)\s+([A-Za-z_$][\w$]*)/gm))lex.add(m[1]);for(const m of code.matchAll(/^(?:const|let)\s+([A-Za-z_$][\w$]*\s*=[^;]*?(?:,\s*[A-Za-z_$][\w$]*\s*=[^,;]*?)*);/gm)){for(const k of m[1].matchAll(/(?:^|,)\s*([A-Za-z_$][\w$]*)\s*=/g))lex.add(k[1]);}}
 const own=run('Object.getOwnPropertyNames(globalThis).join(",")').split(','),present=[...lex].filter(k=>{try{return run('typeof '+k)!=='undefined';}catch(e){return false;}});
 out.names=[...new Set(own.concat(present))].filter(k=>!/^hx|^PH$|^TOASTS$|^T35$|^PERF35$/.test(k)).sort();}catch(e){out.error=String(e&&e.message||e).split('\n')[0].slice(0,200);}
 return out;}
// a bare load (a copy without the v38 or v39 tags, or without v38, v39 and v40): the bench world, 900 frames over day 4 from 16:50 with the v35
// evening on day 3 and then 600 over day 8 from 10:20, the scene count, the Math.random calls during play, the hooks
async function bare(){const out={error:null};try{const {benchWorld}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));const {run}=await benchWorld();
 run("var hxMR=0;{const m=Math.random;Math.random=function(){hxMR++;return m.apply(this,arguments);};}");
 run("dispatch('nextday');closePanel();dispatch('nextday');closePanel();life34().evening35={doneDay:3};S.time=16.85;players[0].g.position.set(-4.0,0,6.5);hxMR=0;var hxF3=0;{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<900;k++){T35+=1000/30;PERF35+=1000/30;last=hxF3;hxF3+=1000/30;tick(hxF3);}}finally{renderFrame=rf;}}");
 run("S.day=8;S.time=10.3;players[0].g.position.set(0,0,-4.6);{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<600;k++){T35+=1000/30;PERF35+=1000/30;last=hxF3;hxF3+=1000/30;tick(hxF3);}}finally{renderFrame=rf;}}");
 out.mr=run('hxMR');out.count=run('(()=>{let n=0;scene.traverse(()=>{n++;});return n;})()');out.hooks=run("[HOTSPOT_HOOKS.length,ACT_HOOKS.length,TICK_HOOKS.length,typeof BOARD40!=='undefined'&&BOARD40.on,typeof MALLAM40!=='undefined'&&MALLAM40.on]").join();
 out.tagged=run('(()=>{let n=0;scene.traverse(o=>{if(o.userData&&o.userData.gist40)n++;});return n;})()');out.time=run('Math.round(S.time*1000)/1000');out.board=run("PH='';(()=>{let h='';const o=openPanel;openPanel=x=>{h=x;};try{openBoard();}finally{openPanel=o;}return h;})()");}catch(e){out.error=String(e&&e.message||e).split('\n')[0].slice(0,200);}return out;}
// the v39 build reading a v40 save (check 11): load it, enter the world, 60 frames, save
async function loadsave(f){const out={error:null};try{const h=await world();const {run}=h;run(`localStorage.setItem(KEY,${JSON.stringify(fs.readFileSync(f,'utf8'))});S=load();enterWorld();closePanel();`);
 run('hxFrames(60);save();');out.v40=run("typeof BOARD40!=='undefined'");out.b40=run('JSON.stringify(JSON.parse(localStorage.getItem(KEY)).life.gist38.b40||null)');out.day=run('S.day');}catch(e){out.error=String(e&&e.message||e).split('\n')[0].slice(0,200);}return out;}

// (repair 4, R4-1, R4-6; check 8) a store the game saved during a late gist booted in a fresh world, as a reload: Mallam, Today's line and the fan
// point after it, 0.45 h on, and the collection; mode 'phone' first stands P(0) still for 5 s at 844 x 390 at (-4, 8.5), where his bubble point is
// just below that half (its camera settled first at (-4, 6.0), beyond the reminder's 4 m), then walks up to the fan point (one frame per 0.05 m) until "Your two sticks are ready." is said
async function boot40(f,mode){const out={error:null};try{const h=await world40();const {run}=h;const J=c=>JSON.parse(run('JSON.stringify((()=>{const v=('+c+');return v===undefined?null:v;})())'));
 const st=()=>J("(()=>{const m=hxB40().mallam,q=hxM();return {t:Math.round(S.time*1e4)/1e4,day:S.day,vis:q.vis,phase:q.phase,ev:EVENING35.state,today:String(todayHTML34()).includes(MALLAM40.UI.tonight),until:Math.round(mallamUntil40()*1e4)/1e4,on:m.gistOn==null?null:m.gistOn,end:m.gistEnd==null?null:m.gistEnd,id:hotspotCache[0]?hotspotCache[0].id:'',ready:MALLAM40.run.ready};})()");
 const live=()=>J('BOARD40.world.live.map(b=>Object.keys(BOARD40.world.bub).find(k=>BOARD40.world.bub[k]===b))');
 run(`localStorage.setItem(KEY,${JSON.stringify(fs.readFileSync(f,'utf8'))});dispatch('continue');closePanel();`+(mode==='phone'?'hxScreen(844,390,true);hxAt(0,-4.0,6.0,[0,1]);':'hxAt(0,-3,6.0,[0,1]);')+'hxAt(1,-8,-10);hxFrames(10);');
 out.boot=st();
 // (the camera settled first 5.3 m off, beyond the reminder's 4 m, so it comes up to (-4, 8.5) from further below and never shows him on the way)
 if(mode==='phone'){run('hxFrames(150);hxAt(0,-4.0,8.5,[0,1]);hxFrames(150);');out.still=st();out.stillSeen=J('(()=>{const g=MALLAM40.world.fig;return [boardSeen40(cams[0],0,g.position.x,(g.position.y||0)+MALLAM40.READY_Y-0.7,g.position.z),mallamSeenBy40(0)];})()');
  out.walk=J(`(()=>{const a=[-4.0,8.5],b=[-3.0,11.2],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/0.05),g=MALLAM40.world.fig,RD=mallamLine40('ready'),R=MALLAM40.READY_Y;
   for(let s=1;s<=n;s++){const x=a[0]+(b[0]-a[0])*s/n,z=a[1]+(b[1]-a[1])*s/n;hxAt(0,x,z,[b[0]-a[0],b[1]-a[1]]);hxFrames(1);if(MALLAM40.run.ready!==1)continue;
    const gx=g.position.x,gy=g.position.y||0,gz=g.position.z,sp=BOARD40.world.bub[RD],on=!!sp&&BOARD40.world.live.includes(sp);let drawn=false;
    if(on){sp.onBeforeRender(null,scene,cams[0]);drawn=sp.scale.x>0&&sp.scale.y>0;}
    return {d:Math.round(Math.hypot(x+3,z-11.2)*100)/100,zero:[mallamInFrame40(cams[0],0,gx,gy+R-0.7,gz),mallamInFrame40(cams[0],0,gx,gy+R,gz)],live:on,drawn};}return null;})()`);
  run('hxScreen(1280,800,false);');}
 run('S.time='+(out.boot.t+0.45)+';hxAt(0,-3,9.0,[0,1]);hxFrames(10);hxAt(0,-3,11.2,[0,1]);hxFrames(10);');out.later=st();
 run('S.money=9000;hxPress(0);hxFrames(1);hxRelease(0);hxFrames(6);');out.collected=Object.assign(st(),{money:J('S.money'),kept:J('hxB40().mallam.kept'),live:live()});}
 catch(e){out.error=String(e&&e.message||e).split('\n')[0].slice(0,200);}return out;}

const tail=o=>process.stdout.write(JSON.stringify(o)+'\n',()=>process.exit(0));
if(process.argv[2]==='--probe'){world40().then(h=>{const J=c=>JSON.parse(h.run('JSON.stringify('+c+')'));const P=probe(J);process.stdout.write(JSON.stringify(P,null,1)+'\n');process.exit(P.bad.length?1:0);}).catch(e=>{console.error(e);process.exit(1);});}
else if(process.argv[2]==='--globals'){globals().then(tail);}
else if(process.argv[2]==='--bare'){bare().then(tail);}
else if(process.argv[2]==='--loadsave'){loadsave(process.argv[3]).then(tail);}
else if(process.argv[2]==='--boot40'){boot40(process.argv[3],process.argv[4]).then(tail);}
else if(process.argv[2]==='--debug'){world40().then(h=>{const code=fs.readFileSync(process.argv[3],'utf8');const fn=new Function('h','J','run','assert',code);return fn(h,c=>JSON.parse(h.run('JSON.stringify('+c+')')),h.run,assert);}).then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});}
else if(process.argv[2]==='--inner'){const only=process.argv[3]?process.argv[3].split(',').map(Number):null;inner(only).then(tail).catch(e=>{console.error(e);process.exit(1);});}
else{(async()=>{
 const child=(args,env)=>new Promise(res=>{const p=cp.spawn(process.execPath,[__filename].concat(args),{env:Object.assign({},process.env,env||{}),stdio:['ignore','pipe','pipe']});let o='',e='';p.stdout.on('data',d=>o+=d);p.stderr.on('data',d=>e+=d);
  p.on('close',code=>{try{res(JSON.parse(o.trim().split('\n').pop()));}catch(x){res({error:(e||o).slice(-600)||('exit '+code)});}});});
 const dirs=[],mut=[];let a,b,wo,b39n,b38n,bNone;const subs={};
 const html0=fs.readFileSync(path.join(GAME,'index.html'),'utf8');assert(TAGS40[0].test(html0),'the board-v40 tag is in index.html');
 const withoutDir=variantDir(html=>strip(html,TAGS40));dirs.push(withoutDir);
 const no39Dir=variantDir(html=>strip(html,TAGS39));dirs.push(no39Dir);const no38Dir=variantDir(html=>strip(html,TAGS38));dirs.push(no38Dir);
 const noneDir=variantDir(html=>strip(strip(strip(html,TAGS38),TAGS39),TAGS40));dirs.push(noneDir);const none39Dir=variantDir(html=>strip(strip(html,TAGS39),TAGS40));dirs.push(none39Dir);
 const jobs=[async()=>{a=await child(['--inner']);},async()=>{b=await child(['--inner']);},async()=>{wo=await child(['--inner'],{COMPOUND_GAME_DIR:withoutDir});},
  async()=>{b39n=await child(['--bare'],{COMPOUND_GAME_DIR:no39Dir});},async()=>{b38n=await child(['--bare'],{COMPOUND_GAME_DIR:no38Dir});},
  async()=>{bNone=await child(['--bare'],{COMPOUND_GAME_DIR:noneDir});},async()=>{subs.none39=await child(['--bare'],{COMPOUND_GAME_DIR:none39Dir});}]
  .concat([['lines','lines-v35.js'],['log','days-v35.js'],['tune','tune-v35.js']].map(([name,last])=>async()=>{const dW=subsetDir40(last,false),dO=subsetDir40(last,true);dirs.push(dW,dO);
   const g=await child(['--globals'],{COMPOUND_GAME_DIR:dW}),o=await child(['--globals'],{COMPOUND_GAME_DIR:dO});subs[name]={g,o};}))
  .concat(MUTANTS.filter(m=>!m.with).map((m,k)=>async()=>{const extra=MUTANTS.filter(x=>x.with===m.name.split(' ')[0]);const srcs={};
   for(const x of [m].concat(extra)){const f=x.file;const t=srcs[f]!==undefined?srcs[f]:(fs.existsSync(path.join(GAME,'src',f))?fs.readFileSync(path.join(GAME,'src',f),'utf8'):'');const n=t.split(x.find).length-1;
    if(n!==1){mut.push({name:m.name,check:m.check,result:'stale ('+n+' matches of '+x.name.split(' ')[0]+')',k});return;}srcs[f]=t.replace(x.find,x.replace);}
   const fns={};for(const f in srcs)fns[f]=()=>srcs[f];const d=variantDir(null,fns);dirs.push(d);const r=await child(['--inner',String(m.check)],m.short?{COMPOUND_GAME_DIR:d,GIST40_SHORT:'1'}:{COMPOUND_GAME_DIR:d});const c=r.checks&&r.checks.find(x=>x.n===m.check);
   mut.push({name:m.name+(extra.length?' (with '+extra.map(x=>x.name).join(', ')+')':''),check:m.check,result:c?(c.passed?'green':'red'):'error',k,first:c&&!c.passed?c.failure:(r.error?String(r.error).slice(0,300):undefined)});}));
 const PAR=Math.max(1,Math.min(2,+(process.env.GIST40_JOBS||2)));
 try{const q=jobs.slice();await Promise.all(Array.from({length:PAR},async()=>{while(q.length)await q.shift()();}));}finally{for(const d of dirs)fs.rmSync(d,{recursive:true,force:true});}
 mut.sort((x,y)=>x.k-y.k);for(const m of mut)delete m.k;
 const same=JSON.stringify(a)===JSON.stringify(b);
 const find=(r,n)=>r&&r.checks?r.checks.find(c=>c.n===n):null;
 // check 1: the inert worlds equal the run without v40
 {const c1=find(a,1);if(c1&&c1.passed){const ia=a.side,iw=wo&&wo.side;
   const diff=(x,y)=>((x&&x.parts)||[]).filter((p,k)=>p!==((y&&y.parts)||[])[k]).map(p=>p.split(':').slice(0,2).join(':')).join(', ');
   if(!(iw&&ia.inertA===iw.inertA)){c1.passed=false;c1.failure='the day-3 world at 10:00 differs from the run without v40 ('+ia.inertA+' against '+(iw&&iw.inertA)+')';}
   else if(!(iw&&iw.inertB&&ia.inertB&&ia.inertB.digest===iw.inertB.digest)){c1.passed=false;c1.failure='days 5 and 7 (layer 2 closed) differ from the run without v40 in: '+diff(ia.inertB,iw&&iw.inertB);}
   else if(!(iw&&iw.inertC&&ia.inertC&&ia.inertC.digest===iw.inertC.digest)){c1.passed=false;c1.failure='the layer-2 days differ from the run without v40 in: '+diff(ia.inertC,iw&&iw.inertC);}
   else if(!(iw&&ia.tune12===iw.tune12)){c1.passed=false;c1.failure='verify-tune check 12\'s board differs from the run without v40';}
   else c1.info.withoutV40={dayThree:iw.inertA,closed:iw.inertB.digest,layer2:iw.inertC.digest};}}
 // check 11: the scene count after a new household equals the run without v40 (exact teardown)
 {const c11=find(a,11);if(c11&&c11.passed){const ca=a.side.count11,cw=wo&&wo.side&&wo.side.count11;if(!(typeof ca==='number'&&ca===cw)){c11.passed=false;c11.failure='the scene after a new household differs from the run without v40 ('+ca+' against '+cw+' objects)';}else c11.info.sceneCount={objects:ca,sameAsWithout:true};}}
 const groups=[];if(wo&&wo.checks)for(const c of wo.checks){const g=groups.find(x=>x.first===c.failure);if(c.passed)groups.push({checks:[c.n],first:'GREEN without v40'});else if(g)g.checks.push(c.n);else groups.push({checks:[c.n],first:c.failure});}
 const woRed=!!(wo&&wo.checks&&wo.checks.length===ORDER.length&&wo.checks.every(c=>!c.passed));
 // without v39 (with v38 and v40), and without v38 (with v39 and v40): loads, installs nothing (the same scene, Math.random calls, hooks and board as
 // the copy without v40 as well)
 const loadPass=(x,y)=>{const o={error:x&&x.error||y&&y.error||null,scene:x&&x.count,random:x&&x.mr,hooks:x&&x.hooks,hooksRef:y&&y.hooks};
  o.passed=!!(x&&y&&!x.error&&!y.error&&x.count===y.count&&x.mr===y.mr&&x.tagged===0&&x.time===y.time&&x.board===y.board&&x.hooks.split(',').slice(0,3).join()===y.hooks.split(',').slice(0,3).join()&&!/true/.test(x.hooks));return o;};
 const noV39=loadPass(b39n,subs.none39),noV38=loadPass(b38n,bNone);
 // the subset copies with v40: no error, no new global but v40's, none gone, no warning naming 39 or 40
 const subsets={};let subOK=true;for(const name of ['lines','log','tune']){const s=subs[name]||{},g=s.g||{},o=s.o||{};const extra=(g.names||[]).filter(n=>!(o.names||[]).includes(n)),lost=(o.names||[]).filter(n=>!(g.names||[]).includes(n));
  const ok=!g.error&&!o.error&&extra.every(n=>/40/.test(n))&&!lost.length&&!g.warn;if(!ok)subOK=false;subsets[name]={loads:!g.error,v40Names:extra.length,otherNew:extra.filter(n=>!/40/.test(n)),gone:lost,warn:g.warn|0,error:g.error||o.error||null};}
 const report={build:a&&a.build||null,passed:!!(a&&!a.error&&same&&a.checks.length===ORDER.length&&a.checks.every(c=>c.passed)&&mut.every(m=>m.result==='red')&&woRed&&noV39.passed&&noV38.passed&&subOK),
  checks:(a&&a.checks||[]).map(c=>{const o=Object.assign({},c);delete o.n;return o;}),mutants:mut,withoutV40:{allRed:woRed,findings:groups},withoutV39:noV39,withoutV38:noV38,subsets,determinism:same?'identical':'differs'};
 if(a&&a.error)report.error=a.error;
 for(const c of report.checks)console.log((c.passed?'PASS ':'FAIL ')+c.name.slice(0,140)+(c.passed?'':' -- '+c.failure));
 for(const m of mut)console.log((m.result==='red'?'PASS ':'FAIL ')+'mutant '+m.name+' turns check '+m.check+' '+m.result);
 console.log((woRed?'PASS ':'FAIL ')+'without the v40 modules every check fails ('+groups.length+' distinct first failures)');
 console.log((noV39.passed?'PASS ':'FAIL ')+'without the v39 modules, with v40: loads and installs nothing '+JSON.stringify({scene:noV39.scene,random:noV39.random,hooks:noV39.hooks,error:noV39.error}));
 console.log((noV38.passed?'PASS ':'FAIL ')+'without the v38 modules, with v39 and v40: loads and installs nothing '+JSON.stringify({scene:noV38.scene,random:noV38.random,hooks:noV38.hooks,error:noV38.error}));
 console.log((subOK?'PASS ':'FAIL ')+'the subset copies with v40 load, no new global but v40\'s '+JSON.stringify(subsets));
 console.log((same?'PASS ':'FAIL ')+'determinism: two runs give identical reports');if(a&&a.error)console.log('ERROR',a.error);
 fs.writeFileSync(OUT,JSON.stringify(report,null,1)+'\n');console.log(`${report.checks.filter(c=>c.passed).length}/${ORDER.length} checks, ${mut.filter(m=>m.result==='red').length}/${mut.length} mutants red`);
 process.exitCode=report.passed?0:1;})();}

/* v39 Aunty Bisi, thanks at the rail and fuller afternoons: the gist and the finds (engineer B; v39/SPEC.md §6–§10, §12, §13 and column B of
   §18.1).
   At the gist: when a set on Ada's shelf is complete (with the shelf up), the neighbour who cares most about it comes to thank you, forced in
   through one narrowed call of v38's own plan (shells Ada, carvings Mr. Bassey with Ada beside him, keepsakes Tunde); the morning after the
   carvings' thank-you Mr. Bassey photographs the shelf with the household beside it, and the framed print arrives the morning after that. When
   the thing in your pocket was held through an earlier gist, its owner comes, asks for it, and "Give it back" hands it over through v38's own
   found38Give (its thanks are planned into the script; a gist in progress is never saved). The eldest guest (owner decision 3, "Only the eldest
   sits": "Ada's stool is handed over the rail to the eldest guest (Mr. Bassey, then Mrs. Oyelaran, then Mama Nkechi). Everyone else, including
   your household, stands.") gets Ada's stool, handed over the rail by a player: the first time with a button and the elder's one line, later
   as the guests arrive; it goes back over the rail at Goodnight. Now and then a guest who smells Aunty Bisi's puff-puff says so (the treat
   line), and on an evening she missed a guest says she passes tomorrow.
   In the day: Mama Nkechi or Mr. Bassey asks for two or three fish caught after two o'clock for the pot (owner decision 2, "Add it"), in their
   talk for today or at the gist for tomorrow; "Keep it for {name}'s pot" on the catch card keeps it, "Give {name} the fish" at the asker's
   place hands them over by half past five, and a bowl comes across at six. No money changes hands.
   After the seven lost things (owner decision 4, "Five new, then 'again'": "Five new small things, one per neighbour. After that, the old
   things go missing 'again', one a day. Returns stay thanks and friendship, never cash."): round two's five new things from two days after the
   seventh goes back, then the twelve go missing "again", one a day, all through v38's own machinery (entries appended to FOUND38.LOST lazily).
   Inert until a trigger (§1.3): before v38 is discovered nothing; after it, only the thank-you (a set complete with the shelf up), the
   give-back (a thing held through an earlier gist) and round two (the seventh back on an earlier day) can happen, and each discovers v39
   (G.b39 inside S.life.gist38, engineer A's gistSave39). Everything else (the stool, the pot, the treat line, Bisi's tomorrow line, Today's
   rows) waits for G.b39. No TICK_HOOKS entry (the step rides EVENING35.tick by property, outermost, inside typeof guards), no cue
   subscriber, no audio recipe, no LINES35/WHEN35/DAYS35.rows/FINDS34 change, nothing written into GIST38.LINES, GIST38.UI, FOUND38.UI,
   FOUND38.SPEECH or FOUND38.LOST at load (round two's entries are appended only when round two starts), no collider, no Math.random call (the
   stool and the print are built inside quiet39), no wall clock (GIST39.t is the sum of the frame steps). Online it is all off.
   Loaded after seller-v39.js (engineer A: quiet39, gistSave39, bisiDay39, bisiTreat39, bisiRow39, shelfShot39). Every change wraps an earlier
   global and calls it. Top-level names end in 39; wrapper bindings live inside blocks. With FOUND38 or GIST38 absent it installs nothing. */
'use strict';

/* ======================================================================================================================================
   1. The object and the copy (spec §1.6, §13). Speech is a draft for the Nigerian reader (docs/READER_gist.md, the v39 section); the
   interface is plain English. Placeholders: {thing}, {owner}, {area}, {name}, {dish} and, in the pot's asks, {n} (spoken "two" or "three").
   ====================================================================================================================================== */
const GIST39={v:1,t:0,checkAt:0,
 PATRON:{shells:'ada',carve:'bassey',keepsake:'tunde'},
 SET_ORDER:['shells','keepsake','carve'],                // two sets completed on one day are thanked in this order, one a night
 ELDEST:['bassey','oyelaran','nkechi'],                  // (fixer, C16) the owner's order (v39 decision 3, "Only the eldest sits"); the reader is asked only whether it reads right
 STOOL:{h:0.45,r:0.17,reachS:1.0},                        // chair height, never a low stool [reader]; the hand-over pose
 POT:{askers:['nkechi','bassey'],n:[2,3],every:2,talkBefore:13.5,freshFrom:14.0,giveBy:17.5,bowlAt:18.0,cheer:4,energy:6,reach:1.8,lead:1.15},
 TREAT_GAP:7,                                             // a guest's treat line at most once in seven days; no friendship
 ROUND2_GAP:2,                                            // round two's first thing comes out two days after the seventh goes back
 MAX_V39_LINES:2,                                         // per gist (§6.6)
 CODE:{tunde:'tu',nkechi:'nk',ada:'ad',bassey:'ba',oyelaran:'oy'},
 LINES:{
  // §13.2 the set thank-yous: each replaces the patron's greeting (no extra line)
  thanks:{shells:['gs39-th-shells','Five kinds of shell. The beach has been talking to you. Lend me one for a frame? I will give it back. Probably.'],
   carve:['gs39-th-carve','Ada, see your work. Six fish on one shelf, and not one of them moving. I will come with my camera in the morning.'],
   carve0:['gs39-th-carve0','Ada’s six fish on one shelf, and not one of them moving. I have photographed weddings with less patience.'],
   adaR:['gs39-th-adaR','Six. I said I would carve them and I carved them. Thank you for the fish, sha. My hands were bored.'],
   keepsake:['gs39-th-keep','Now your shelf has been to more parties than you have.']},
  // §13.3 the give-back beat, one per owner; the thanks after it are v38's own (planned into the script as gs39-gbty-1 and -2)
  give:{ada:['gs39-gb-ada','Is that my {thing} in your hand? Bring it here before Tunde borrows it.'],
   nkechi:['gs39-gb-nkechi','Eh! My {thing}! You were carrying it all this time? Come, give me.'],
   tunde:['gs39-gb-tunde','Is that my {thing}? I have been looking for it since yesterday. Quietly.'],
   bassey:['gs39-gb-bassey','My {thing}. I would know it in any light.'],
   oyelaran:['gs39-gb-oyelaran','That is mine. Hand it over the rail, please. Gently.']},
  // §13.4 the stool: each elder's line once; the other guest's line rides on the same night (it replaces their reaction)
  stool:{bassey:['gs39-st-bassey','Thank you, my friend. My knees were going to ask, but they are too proud.'],
   oyelaran:['gs39-st-oyelaran','Thank you. I will sit. Ten minutes.'],
   nkechi:['gs39-st-nkechi','Am I an old woman now? Well, since it is here. My legs have been in the shop since morning. See home training.'],
   tunde:['gs39-st-tunde','When I am old I will sit too. For now I am practising standing.'],
   ada:['gs39-st-ada','Sit well, sir. It is my work. It will hold.']},
  // §13.1 the treat line (one per guest, each guest at most once in seven days): it replaces that guest's reaction
  treat:{nkechi:['gs39-tr-nk','You bought from Bisi? I will take two and say I am not hungry.'],
   tunde:['gs39-tr-tu','Puff-puff! New compound rule: whoever buys puff-puff shares it.'],
   ada:['gs39-tr-ad','Puff-puff from Aunty Bisi. Do not tell Mama Nkechi. I will tell her myself.'],
   bassey:['gs39-tr-ba','Puff-puff in the evening. In my time this would have been a party.'],
   oyelaran:['gs39-tr-oy','Puff-puff. One. I said one.']},
  // §13.1 on an evening Aunty Bisi did not pass, a guest says she passes tomorrow (a tip that comes true: never two missed in a row)
  tom:[['gs39-bi-tom1','Aunty Bisi passes tomorrow evening. I have already told my stomach.'],['gs39-bi-tom2','Bisi’s round comes this side tomorrow. Keep small change by the door.']],
  // §13.6 the pot: an ask in the asker's talk (today) and at the gist (tomorrow); two thanks each
  // (fixer, S5) two gist asks per asker, chosen by the day's hash; (C4) Mr. Bassey's first ask at a gist carries the setup (gist0); (C13) Mama
  // Nkechi's pepper soup is for her own pot
  pot:{nkechi:{talk:['gs39-pot-nk-t','I am making pepper soup today. Anybody fishing after two, bring me {n}. Not before two. Fish that sits in the sun is not pepper soup fish.'],
    gist:[['gs39-pot-nk-g','Tomorrow, pepper soup. {n} fish, caught after two o’clock. My pot can tell.'],['gs39-pot-nk-g2','Pepper soup tomorrow, my dear. {n} fish, caught after two o’clock. Fresh fish or nothing.']],
    ty:[['gs39-pot-nk-ty1','Still shining. These were swimming an hour ago. I will send a bowl across this evening, my dear.'],['gs39-pot-nk-ty2','Fresh, fresh. You have good hands. Watch for the bowl at six.']]},
   bassey:{talk:['gs39-pot-ba-t','My sister visits and she says my cooking is a rumour. {n} fresh fish after two, and I will prove her wrong.'],
    gist0:['gs39-pot-ba-g0','My sister visits tomorrow, and she says my cooking is a rumour. {n} fresh fish after two, and I will prove her wrong.'],
    gist:[['gs39-pot-ba-g','Tomorrow I cook for my sister again. {n} fish after two, please. The last ones were the only thing she praised.'],['gs39-pot-ba-g2','My sister comes again tomorrow. {n} fish after two, please, and not a word to her about where they came from.']],
    ty:[['gs39-pot-ba-ty1','Fine fish. My sister will have to find something else to complain about.'],['gs39-pot-ba-ty2','Thank you. Something from the pot will come across. Do not tell her I had help.']]}},
  // §9.2 and §13.5 round two: five new small things, one per neighbour; each owner tells their own the evening before
  round:{
   pencil:{owner:'ada',name:'pencil stub',pocket:'pencil stub',long:'a pencil stub',area:'the Makers’ Yard',say:'Somewhere in the Makers’ Yard',pickLabel:'a pencil stub',
    pickToast:'A pencil stub, sharpened with a knife. Ada keeps one behind her ear.',giveLabel:'Give Ada her pencil',
    spots:[[-3,-14],[-2,-13.5],[1,-14],[-2.5,-12]],                               // (fixer, S19) not (2.5, -12): both views faced the Yard's wall there
    lost:['gs39-lost-pencil','Tomorrow I am at the Yard all afternoon, and my pencil lives behind my ear until it does not.'],
    told:['gs39-told-pencil','Ada says her pencil came back to her ear. She measured twice to be sure.'],
    back:['gs39-back-pencil','It is not lost. It is behind somebody else’s ear.'],
    ty:['gs39-ty-pencil','My pencil! I have been measuring with my thumb all afternoon. Thank you, sha.'],
    heard:'Ada is at the Makers’ Yard all afternoon today. Her pencil stub may go missing there.',
    recap:'Ada says her pencil stub may go missing in the Makers’ Yard tomorrow.'},
   tape:{owner:'tunde',name:'insulating tape',pocket:'roll of insulating tape',long:'a roll of insulating tape',area:'by the square’s stage',say:'Over by the stage in the square',pickLabel:'a roll of tape',
    pickToast:'A roll of black insulating tape, half used. Tunde’s, from the sound.',giveLabel:'Give Tunde his tape',
    spots:[[-16,-2],[-17,0],[-18,0],[-16,0],[-15.5,-1]],
    lost:['gs39-lost-tape','Tomorrow I am wiring the stage in the square. If a roll of black tape rolls away, it is mine. It always rolls away.'],
    told:['gs39-told-tape','Tunde says your tape saved the sound in the square. He says it every five minutes.'],
    back:['gs39-back-tape','Tape does not walk. It rolls. That is a different thing.'],
    ty:['gs39-ty-tape','My tape! The sound was holding on by a thread. You have saved the next wedding too.'],
    heard:'Tunde is wiring the square’s stage today. Look out for a roll of tape.',
    recap:'Tunde says a roll of his tape may roll away by the square’s stage tomorrow.'},
   pin:{owner:'nkechi',name:'headtie pin',pocket:'headtie pin',long:'a headtie pin with a glass bead',area:'Market Road, between the stalls',say:'Somewhere on Market Road',pickLabel:'a headtie pin',
    pickToast:'A headtie pin with a small glass bead. Mama Nkechi wears one like it.',giveLabel:'Give Mama Nkechi her pin',
    spots:[[13,-1],[13,1],[14,0],[17,0],[18,0]],
    lost:['gs39-lost-pin','Tomorrow I go down Market Road for pepper. My headtie pin has been loose all week. If it falls, it is mine.'],
    told:['gs39-told-pin','Mama Nkechi says her headtie is standing up properly again. She thanks you with her whole head.'],
    back:['gs39-back-pin','My pin is loose, not lost. There is a difference.'],
    ty:['gs39-ty-pin','My pin! My headtie has been leaning all day like a tired man. God bless you, my dear.'],
    heard:'Mama Nkechi is buying pepper on Market Road today. Her headtie pin may fall.',
    recap:'Mama Nkechi says her headtie pin may fall on Market Road tomorrow.'},
   cloth:{owner:'bassey',name:'lens cloth',pocket:'lens cloth',long:'a cloth for a camera lens',area:'the waterfront',say:'On the waterfront',pickLabel:'a lens cloth',
    pickToast:'A soft cloth for a camera lens, folded small. Mr. Bassey’s, surely.',giveLabel:'Give Mr. Bassey his lens cloth',
    spots:[[-12,12],[-13,13],[-12,14],[-11,13],[-14,12]],
    lost:['gs39-lost-cloth','Tomorrow afternoon I photograph the water again. My lens cloth likes the breeze more than I do. Mind it for me.'],
    told:['gs39-told-cloth','Mr. Bassey cleaned every lens he owns with that cloth today. Twice.'],
    back:['gs39-back-cloth','I will hold it with both hands. Firmly.'],
    ty:['gs39-ty-cloth','My lens cloth. Thank you, my friend. The water was beautiful and my lens was not.'],
    heard:'Mr. Bassey is photographing the water this afternoon. Watch for his lens cloth.',
    recap:'Mr. Bassey says his lens cloth may blow away on the waterfront tomorrow.'},
   pins:{owner:'oyelaran',name:'drawing pins',pocket:'tin of drawing pins',long:'a tin of drawing pins',area:'the courtyard, by the noticeboard',say:'In the courtyard by the noticeboard',pickLabel:'a tin of drawing pins',
    pickToast:'A small tin of drawing pins. Somebody keeps a noticeboard.',giveLabel:'Give Mrs. Oyelaran her drawing pins',
    spots:[[-0.5,-2.5,0.054],[-1.5,-1.5,0.054],[0.5,-1,0.054],[1.5,-1,0.054]],              // the courtyard's paving: 0.054 m
    lost:['gs39-lost-pins','Tomorrow I change the notices. If a tin of drawing pins goes walking, it is mine, and the noticeboard is waiting.'],
    told:['gs39-told-pins','Mrs. Oyelaran put up three new notices already. She says it is because of you. She did not smile.'],
    back:['gs39-back-pins','The noticeboard will manage for one afternoon. I will not.'],
    ty:['gs39-ty-pins','My drawing pins. Thank you. The notices were sliding off the board one by one.'],
    heard:'Mrs. Oyelaran is changing the notices today. A tin of drawing pins may go walking in the courtyard.',
    recap:'Mrs. Oyelaran says her tin of drawing pins may go walking in the courtyard tomorrow.'}},
  ROUND_ORDER:['pencil','tape','pin','cloth','pins'],
  // §13.5 the "again" round: one tip and one thank-you per owner ({thing} is the singular container noun, againNoun39: "pair of glasses",
  // "packet of seed", "tin of drawing pins"; fixer, C1); the thank-yous never count (C10)
  again:{nkechi:['gs39-again-nkechi','My {thing} has gone walking again. If you see it, you know whose it is.'],
   tunde:['gs39-again-tunde','My {thing} has gone on tour again. Without me.'],
   ada:['gs39-again-ada','My {thing} again. I measure twice and lose things once a week.'],
   bassey:['gs39-again-bassey','My {thing}. Again. Mind the light, and mind your things, I always say.'],
   oyelaran:['gs39-again-oyelaran','My {thing} is out there again. I will not discuss it.']},
  againTy:{nkechi:['gs39-againty-nkechi','Again! You are the compound’s lost-and-found now. God bless you.'],
   tunde:['gs39-againty-tunde','You again. Me again. We should stop meeting like this.'],
   ada:['gs39-againty-ada','Again. I am going to tie it to my wrist.'],
   bassey:['gs39-againty-bassey','In 1979 I lost nothing. Now look at me.'],
   oyelaran:['gs39-againty-oyelaran','Thank you. Do not tell anybody it happened again.']},
  againTold:['gs39-told-again','{owner}’s {thing} went walking again, and came home again. The compound has a new habit.'],
  againBack:['gs39-back-again','Again, yes. You may stop counting.']},
 // the interface (plain English)
 UI:{give:'Give it back',stool:'Bring the stool for {name}',
  potKeep:'Keep it for {name}’s pot',potKicker:'FOR THE POT',potTitle:'One for {name}’s pot.',
  potLeft:['That is all of them. Give them by half past five.','One more to go.','Two more to go.','Three more to go.'],
  potGive:'Give {name} the fish',potClose:'Close',castAgain:'Cast again',backShore:'Back to the shore',
  potRowAsk:'{owner}’s pot: {n} fish caught after two o’clock, by half past five.',
  potRowSome:{'1/2':'One fish kept for {owner}’s pot. One more, then give them by half past five.','1/3':'One fish kept for {owner}’s pot. Two more, then give them by half past five.',
   '2/3':'Two fish kept for {owner}’s pot. One more, then give them by half past five.'},
  potRowAll:'The fish for {owner}’s pot are kept. Give them by half past five.',
  potRowGiven:'{owner} has the fish. A bowl comes across at six.',
  potBowl:'A bowl of {dish} came across from {owner}.',dish:{nkechi:'pepper soup',bassey:'fish stew'},
  num:['none','one','two','three'],
  tenth:'Ada left a stool at your door. ‘The tenth one. It is right. For the eldest at your rail.’',
  promised:'Ada left the stool she promised at your door. ‘For your housewarming. Use it before then.’',
  photoToast:'Mr. Bassey came by with his camera and made you both stand very straight.',
  photoCaption:'Mr. Bassey photographed our shelf, and us beside it, standing very straight.',
  printToast:'Mr. Bassey brought the print, framed.',
  returned:'Things given back: {n}.',
  againPick:'{thing}, again. {owner}’s, of course.',
  againHeard:'{owner}’s {thing} has gone walking again today: {area}.',
  againRecap:'{owner}’s {thing} may go missing again tomorrow: {area}.',
  recapPot:'{owner} wants {n} fish for the pot tomorrow, caught after two o’clock.',
  // §12.4 v38's set memories without a shelf
  memoryNoShelf:{keepsake:'Five keepsakes from five neighbours, waiting for a shelf.',shells:'All five shells from the beach, waiting for a shelf.',carve:'Ada’s six carved fish, waiting for a shelf.'}},
 stool:null,                                            // the stool out at a gist: {k, obj, phase:'reach'|'seated'|'back', t, by, from, to}
 world:{print:null,printKey:''},
 added:[],                                              // the v38 table keys round two and the again round appended (for a new household)
 flags:{},cost:{steps:0,checks:0}};

/* ======================================================================================================================================
   2. Small helpers (all guarded: in the subset copies and the copy without v38, these names are undeclared)
   ====================================================================================================================================== */
function gistOn39(){return typeof FOUND38!=='undefined'&&!!FOUND38&&typeof GIST38!=='undefined'&&!!GIST38;}
function gistOnline39(){return typeof NET!=='undefined'&&!!NET&&!!NET.on;}
function gistIsAI39(i){return typeof AI!=='undefined'&&!!AI&&!!AI.on&&i===AI.i;}
function gistLog39(k,a){try{if(typeof LOG35!=='undefined'&&LOG35&&typeof LOG35.add==='function')LOG35.add(k,a);}catch(e){}}
function gistToast39(m){try{if(typeof toast==='function'&&!(typeof silentMode==='function'&&silentMode()))toast(m);}catch(e){}}
function gistSaveNow39(){try{if(typeof save==='function')save();}catch(e){}}
function gistFill39(t,v){return String(t).replace(/\{(\w+)\}/g,(m,k)=>v&&v[k]!=null?v[k]:m);}
function gistNm39(k){return typeof CAST!=='undefined'&&CAST[k]?CAST[k].name:k;}
function gistUp39(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1);}
function gistG39(){return typeof S!=='undefined'&&S&&S.p&&S.life&&S.life.gist38&&typeof gistSave38==='function'?gistSave38():null;}
function gistB39(){return typeof gistSave39==='function'?gistSave39(false):null;}
function gistUnesc39(s){return String(s).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');}
function gistOverlay39(){try{return typeof overlayOpen==='function'&&overlayOpen();}catch(e){return false;}}

/* ======================================================================================================================================
   3. Who must come tonight, pure (spec §6.2, §6.3): the give-back owner, else a pending thank-you's patron
   ====================================================================================================================================== */
// the set waiting for its thank-you (completed with the shelf up, not yet thanked), in completion order; null
function thanksPending39(G){if(!G||!G.sets||!G.shelf||G.shelf.state!=='up')return null;const b=gistB39(),O=GIST39.SET_ORDER;
 const due=O.filter(s=>G.sets[s]&&!(G.once&&G.once['thank39:'+s])&&!(b&&b.thanked&&b.thanked[s]));
 due.sort((a,c)=>(G.sets[a]|0)-(G.sets[c]|0)||O.indexOf(a)-O.indexOf(c));return due[0]||null;}
// the day the thing in the pocket was picked up, or 0: (fixer, DOD-10) from v39's own record of the pickup (G.b39.picked once v39 is discovered,
// and in memory before), the day log only as a fallback (it is capped at 300 events a day and compacted after a week)
const PICK39={id:null,day:0};
function pickDay39(G,id){const b=gistB39();if(b&&b.picked&&b.picked.id===id&&b.picked.day>0)return b.picked.day;if(PICK39.id===id&&PICK39.day>0)return PICK39.day;
 if(typeof LOG35==='undefined'||!LOG35||typeof LOG35.has!=='function')return 0;
 for(let d=S.day;d>=Math.max(1,(G.found|0)-1);d--){try{if(LOG35.has(d,'find',id))return d;}catch(e){return 0;}}return 0;}
// the give-back is due: the thing in the pocket was held through an earlier gist (picked up on a day <= G.last.day, and that gist was before
// today); {id, owner} or null
function giveDue39(G){if(!G||!G.lost||G.lost.status!=='pocket'||!G.last||!(G.last.day<S.day))return null;const it=FOUND38.LOST[G.lost.i];if(!it)return null;
 const d=pickDay39(G,it.id);if(!d||d>G.last.day)return null;return {id:it.id,owner:it.owner};}
// the guests with a role in a plan: a new lost thing's teller (from LINES.lost) and its owner, a reminder's owner (the rota fixes them)
function roles39(p){const r=[],L=GIST38.LINES;for(const t of p.tips||[]){if(t.kind!=='lost')continue;
  if(t.mode==='new'&&L.lost[t.arg]&&!r.includes(L.lost[t.arg][0]))r.push(L.lost[t.arg][0]);if(t.owner&&!r.includes(t.owner))r.push(t.owner);}
 return r.filter(k=>p.guests.includes(k));}
// one call of v38's own plan with GIST38.GUESTS narrowed to list and, for a give-back, found38Today hiding the pocket; both put back in finally
function planCall39(orig,self,args,list,hide){const keepG=GIST38.GUESTS,keepT=found38Today;
 try{if(list)GIST38.GUESTS=list.slice();if(hide)found38Today=function(){const t=keepT.apply(this,arguments);return t?Object.assign({},t,{pocket:null}):t;};
  return orig.apply(self,args);}
 finally{GIST38.GUESTS=keepG;found38Today=keepT;}}
// force a guest in (spec §6.1 steps 2-4): {p} or {defer: why}. fixed: the carvings' pair. p0 keeps its guests when the forced guest is in it.
function forceGuest39(G,p0,orig,self,args,forced,fixed,hide){
 const last=G.last&&G.last.day===S.day-1&&Array.isArray(G.last.guests)?G.last.guests:null;
 const rep=g=>!!(last&&g.length===2&&last.length===2&&g.every(k=>last.includes(k)));
 const call=list=>{try{return planCall39(orig,self,args,list,hide);}catch(e){return null;}};
 if(fixed){if(fixed.every(k=>p0.guests.includes(k)))return rep(p0.guests)?{defer:'the pair came last night'}:{p:p0};
  const p1=call(fixed);if(!p1||!fixed.every(k=>p1.guests.includes(k)))return {defer:'a tip needs another teller'};if(rep(p1.guests))return {defer:'the pair came last night'};return {p:p1};}
 if(p0.guests.includes(forced))return {p:p0};
 const ro=roles39(p0);if(ro.length>=2)return {defer:'both guests have roles'};
 const lastAny=G.last&&Array.isArray(G.last.guests)?G.last.guests:[];
 const kept=ro.length?ro[0]:(p0.guests.find(k=>!lastAny.includes(k))||p0.guests[0]);
 let p1=call([kept,forced]);if(!p1||!p1.guests.includes(forced)||!p1.guests.includes(kept))return {defer:'the narrowed plan left a guest out'};
 if(rep(p1.guests)){const other=p0.guests.find(k=>k!==kept);if(!other||other===forced)return {defer:'the pair came last night'};
  p1=call([other,forced]);if(!p1||!p1.guests.includes(forced)||!p1.guests.includes(other)||rep(p1.guests))return {defer:'the pair came last night'};}
 return {p:p1};}

/* ======================================================================================================================================
   4. The plan wrapper, pure (spec §6.1): forced guests through one narrowed call of v38's own plan, the openers swapped, at most two v39
   lines before the goodbye. Every v39 entry carries v39k (its kind); an entry that takes one of the two slots also carries v39. None has a cat.
   ====================================================================================================================================== */
function stoolHave39(b){return !!(b&&b.stool);}          // (fixer, S7) Ada's promised stool counts once it is delivered (gistMorning39)
function stoolFor39(guests){for(const k of GIST39.ELDEST)if(guests.includes(k))return k;return null;}
// (fixer, S5) the high bits of the hash: its low bit follows the day's parity, and the askers alternate, so each asker always got the same
function potN39(day){return GIST39.POT.n[0]+(gistHash39(day,13)>>>16)%2;}
function potTy39(day){return (gistHash39(day,7)>>>16)%2;}
// the gist ask for tomorrow: Mr. Bassey's first one carries the setup (C4), then one of two by the day's hash (S5); [id, text]
function potGistLine39(who,day,b){const P=GIST39.LINES.pot[who];if(P.gist0&&!(b&&b.potLast&&typeof b.potLast[who]==='number'))return P.gist0;return P.gist[(gistHash39(day,17)>>>16)%P.gist.length];}
// (fixer, C1) the singular container noun for the shared again and give-back lines: "pair of glasses", "packet of seed", "tin of drawing pins"
function againNoun39(id){const L=typeof GIST38!=='undefined'&&GIST38?GIST38.LINES:{},base=rotSrc39(id),r=GIST39.LINES.round[base];
 return (r&&r.pocket)||(L.pocketThing&&L.pocketThing[base])||(L.thing&&L.thing[base])||base;}
// a pot line with {n} spoken ("two" or "three"), capitalised where it starts a sentence
function potSay39(t,n){const w=['two','three'][n-2]||'two';return String(t).replace(/(^|[.!?]\s+)?\{n\}/g,(m,pre)=>pre!==undefined?pre+gistUp39(w):w);}
function gistHash39(){return typeof hash38==='function'?hash38.apply(null,arguments):0;}
// the pot may be asked of who for day: v39 discovered, offline, no pot for that day or still to come, this asker did not ask for the day before
function potAskDue39(who,day){const b=gistB39();if(!b||gistOnline39()||!GIST39.POT.askers.includes(who))return false;
 const p=b.pot;if(p&&(p.day===day||p.day>S.day))return false;
 if(typeof BISI39!=='undefined'&&BISI39&&BISI39.flags&&BISI39.flags.playtest)return true;
 const l=b.potLast&&b.potLast[who];return !(typeof l==='number'&&l>=day-1);}
function gistPlan39(p0,orig,self,args){
 if(!p0||!Array.isArray(p0.guests)||p0.guests.length<2||gistOnline39())return null;
 const G=gistG39();if(!G)return null;const b=gistB39();
 let p=p0,why=null;const give=giveDue39(G),th=thanksPending39(G);let gave=null,thank=null;
 // 1-4. who must come: the give-back owner, else a pending thank-you's patron; deferred on the first gist
 if(!p0.first&&give){const pH=(()=>{try{return planCall39(orig,self,args,null,true);}catch(e){return null;}})();
  if(pH){const r=forceGuest39(G,pH,orig,self,args,give.owner,null,true);if(r.p){p=r.p;gave=give;}else why=r.defer;}}
 if(!p0.first&&th){const patron=GIST39.PATRON[th],fixed=th==='carve'?['ada','bassey']:null;
  if(gave){if(fixed?fixed.every(k=>p.guests.includes(k)):p.guests.includes(patron))thank=th;}
  else{const Td=typeof found38Today==='function'?found38Today():{};const pocket=Td&&Td.pocket?Td.pocket.owner:null;
   if(!(pocket&&(pocket===patron||(fixed&&fixed.includes(pocket))))){const r=forceGuest39(G,p0,orig,self,args,patron,fixed,false);if(r.p){p=r.p;thank=th;}else why=why||r.defer;}}}
 if(p===p0&&!gave&&!thank&&!b)return null;                                  // nothing of v39's tonight: v38's plan unchanged
 // copies (the plan's own objects are new on every call; copied anyway so a swap never reaches the original's arrays)
 p=Object.assign({},p,{guests:p.guests.slice(),script:p.script.map(s=>Object.assign({},s))});const sc=p.script,L=GIST39.LINES;
 const meta={give:gave?gave.id:null,thank,stool:null,stoolFirst:false,why};
 // 5. the thank-you replaces the patron's greeting (on the carvings night Ada's greeting becomes her reply)
 const swap=(k,e,once,kind)=>{const j=sc.findIndex(s=>s.k===k&&s.open);if(j>=0)sc[j]={k,id:e[0],text:e[1],open:1,once,v39k:kind,set:thank};};
 if(thank==='carve'){swap('bassey',p.guests.includes('ada')?L.thanks.carve:L.thanks.carve0,'thank39:carve','thank');if(p.guests.includes('ada'))swap('ada',L.thanks.adaR,'thank39:carveR','thankR');}
 else if(thank)swap(GIST39.PATRON[thank],L.thanks[thank],'thank39:'+thank,'thank');
 // 6. the v39 lines, at most two, in priority order, before the goodbye
 let slots=GIST39.MAX_V39_LINES;const add=[];const gb=()=>sc.length-1;
 if(gave&&slots>0){slots--;const it=FOUND38.LOST[G.lost.i],thing=againNoun39(it.id)||it.name;const e=L.give[it.owner];
  add.push({k:it.owner,id:e[0],text:gistFill39(e[1],{thing}),v39:'give',v39k:'give',give:it.id});
  const ty=(GIST38.LINES.ty&&GIST38.LINES.ty[it.id])||FOUND38.SPEECH.ty[it.id==='glasses'?'glassesLate':it.id];
  (Array.isArray(ty)?ty:[ty]).forEach((t,n)=>{if(t)add.push({k:it.owner,id:'gs39-gbty-'+(n+1),text:String(t),v39k:'givety'});});}
 if(b){
  // the stool: the eldest guest, once the household has a stool; the first time with each elder a line (and the button on their greeting)
  const el=stoolHave39(b)?stoolFor39(p.guests):null;
  if(el){meta.stool=el;
   if(!(b.once&&b.once['stool39:'+el])&&slots>0){slots--;meta.stoolFirst=true;
    // the elder speaks second, so their line follows their own greeting (the engine's first two lines are the two greetings)
    if(p.guests[0]===el){p.guests.reverse();const a=sc.findIndex(s=>s.k===el&&s.open),c=sc.findIndex(s=>s.k!==el&&s.open);if(a>=0&&c>=0&&a<c){const t=sc[a];sc[a]=sc[c];sc[c]=t;}}
    const j=sc.findIndex(s=>s.k===el&&s.open);if(j>=0)sc[j].stoolBtn=el;
    const st=L.stool[el];sc.splice(2,0,{k:el,id:st[0],text:st[1],v39:'stool',v39k:'stool',stool:el});
    const other=p.guests.find(k=>k!==el);if((other==='tunde'||(other==='ada'&&el==='bassey'))&&L.stool[other]){                   // Ada's line says "sir": only to Mr. Bassey
     const r=sc.findIndex((s,q)=>q>2&&s.k===other&&s.cat&&s.cat.startsWith('re:'));
     if(r>=0)sc[r]={k:other,id:L.stool[other][0],text:L.stool[other][1],v39k:'stoolO'};}}}
  // the pot ask for tomorrow, by an asker who is a guest (a tip: the "Ehen?" button)
  // (fixer, S9) on a night with a give-back or an elder's first stool line the pot ask waits for the next night (spec §6.6's priority)
  if(slots>0&&!gave&&!meta.stoolFirst){const asker=GIST39.POT.askers.find(k=>p.guests.includes(k)&&potAskDue39(k,S.day+1));
   if(asker){slots--;const n=potN39(S.day+1),e=potGistLine39(asker,S.day+1,b);add.push({k:asker,id:e[0],text:potSay39(e[1],n),tip:1,v39:'potask',v39k:'potask',pot:{who:asker,n,day:S.day+1}});}}
  // the treat line: replaces a guest's reaction (or, with none, takes a slot)
  const tr=typeof bisiTreat39==='function'?bisiTreat39(S.day):null;
  // (fixer, C6) every treat line is about puff-puff: only on an evening puff-puff was bought; (C9) Ada's "Do not tell Mama Nkechi" never in
  // front of Mama Nkechi
  if(tr&&tr.items&&tr.items.includes('puffpuff')){const okK=k=>L.treat[k]&&!(k==='ada'&&p.guests.includes('nkechi'))&&!(b.treat&&typeof b.treat[k]==='number'&&S.day-b.treat[k]<GIST39.TREAT_GAP);
   const r=sc.findIndex((s,q)=>q>=2&&s.cat&&s.cat.startsWith('re:')&&okK(s.k));
   if(r>=0){const k=sc[r].k;sc[r]={k,id:L.treat[k][0],text:L.treat[k][1],v39k:'treatR',treat:k};}
   else if(slots>0){const k=p.guests.find(okK);if(k){slots--;add.push({k,id:L.treat[k][0],text:L.treat[k][1],v39:'treat',v39k:'treat',treat:k});}}}
  // Aunty Bisi passes tomorrow evening (only on an evening she did not pass)
  // (fixer, C7) the plain "Bisi" only from her near-peers (Mama Nkechi, Mr. Bassey, Mrs. Oyelaran); Tunde and Ada say "Aunty Bisi"
  if(slots>0&&typeof bisiDay39==='function'&&!bisiDay39(S.day)&&bisiDay39(S.day+1)){slots--;const k=p.guests[1],e=['nkechi','bassey','oyelaran'].includes(k)?L.tom[(gistHash39(S.day,39)>>>16)%L.tom.length]:L.tom[0];
   add.push({k,id:e[0],text:e[1],v39:'bisitom',v39k:'bisitom'});}}
 if(add.length)sc.splice(gb(),0,...add);
 sc.g39=meta;                                                                    // the night's v39 facts (an array property: JSON leaves it out)
 return p;}
if(gistOn39()&&typeof gistPlan38==='function'){const prevPlan39=gistPlan38;
 gistPlan38=function(){                                                          // v39: forced guests and v39 lines on top of v38's own plan
  const p0=prevPlan39.apply(this,arguments);try{return gistPlan39(p0,prevPlan39,this,arguments)||p0;}
  catch(e){if(typeof console!=='undefined')console.warn('gist39 plan',e);return p0;}};}

/* ======================================================================================================================================
   5. After the gist (gistDone38, after the original): friendship for a thanked patron, the treat day, the pot ask, the stool's first time,
   G.b39 at the first v39 line shown; one save (the original's save is held and made once, after these)
   ====================================================================================================================================== */
if(gistOn39()&&typeof gistDone38==='function'){const prevDone39=gistDone38;gistDone38=function(v){
 if(!v||!Array.isArray(v.script)||!v.script.some(s=>s&&s.v39k))return prevDone39.apply(this,arguments);
 const sv=save;let saved=0;save=function(){saved++;};let r;try{r=prevDone39.apply(this,arguments);}finally{save=sv;}
 try{const E=typeof EVENING35!=='undefined'?EVENING35:null,shown=(E&&Array.isArray(E.lines)?E.lines:[]).map(l=>l.id||null);
  const seen=v.script.filter((s,k)=>s&&s.v39k&&shown[k]===s.id);
  if(seen.some(s=>s.v39k==='thank'||s.v39k==='give'||s.v39k==='givety')||v.gave39)gistSave39(true);
  const b=gistB39();
  if(b){for(const s of seen){
    if(s.v39k==='thank'&&s.set&&!b.thanked[s.set]){try{aff(GIST39.PATRON[s.set],1);}catch(e){}b.thanked[s.set]=S.day;gistLog39('thanks','set:'+s.set);}
    else if(s.v39k==='stool'&&s.stool)b.once['stool39:'+s.stool]=S.day;
    else if(s.v39k==='potask'&&s.pot){b.pot={day:s.pot.day,who:s.pot.who,n:s.pot.n,got:0,gave:0,via:'gist',said:S.day};b.potLast[s.pot.who]=s.pot.day;gistLog39('pot','ask:'+s.pot.who);}
    else if((s.v39k==='treat'||s.v39k==='treatR')&&s.treat){b.treat[s.treat]=S.day;gistLog39('bisi','treat');}}}}
 catch(e){if(typeof console!=='undefined')console.warn('gist39 done',e);}
 if(saved)gistSaveNow39();return r;};}

/* ======================================================================================================================================
   6. The caption's button (gistLabel38, after the original, its pattern): "Give it back" on the give-back beat, "Bring the stool for {name}"
   on the elder's greeting the first time
   ====================================================================================================================================== */
function gistLabelFor39(){const E=typeof EVENING35!=='undefined'?EVENING35:null,v=typeof GIST38!=='undefined'&&GIST38?GIST38.visit:null;
 if(!E||!v||E.state!=='talking'||E.line>=E.lines.length-1)return null;const s=v.script[E.line];if(!s||s.id!==(E.lines[E.line]&&E.lines[E.line].id))return null;
 if(s.v39k==='give'&&!v.gave39)return GIST39.UI.give;
 if(s.stoolBtn&&!(GIST39.stool&&GIST39.stool.k===s.stoolBtn))return gistFill39(GIST39.UI.stool,{name:gistNm39(s.stoolBtn)});return null;}
if(gistOn39()&&typeof gistLabel38==='function'){const prevLabel39=gistLabel38;gistLabel38=function(){const r=prevLabel39.apply(this,arguments);
 try{const t=gistLabelFor39(),E=EVENING35;if(t&&E.el){const h=String(E.el.innerHTML||''),n=h.replace(/class="evening35-next">[^<]*<\/button>/,'class="evening35-next">'+esc(t)+'</button>');if(n!==h)E.el.innerHTML=n;}}
 catch(e){if(typeof console!=='undefined')console.warn('gist39 label',e);}return r;};}

/* ======================================================================================================================================
   7. Giving a thing back at the gist (spec §6.3): on Next of the beat line, v38's found38Give does the return with found38Visiting,
   openPanel and save swapped (a gist in progress is never saved); the caught panel's keepsake sentence is toasted whole
   ====================================================================================================================================== */
function giveAtGist39(v){const G=gistG39();if(!G||G.lost.status!=='pocket')return false;const it=FOUND38.LOST[G.lost.i];if(!it)return false;
 const kv=found38Visiting,ko=openPanel,ks=save;let caught='';
 found38Visiting=function(){return false;};openPanel=function(h){caught=String(h||'');};save=function(){};
 try{found38Give(0);}finally{found38Visiting=kv;openPanel=ko;save=ks;}
 if(G.lost.status==='pocket'&&FOUND38.LOST[G.lost.i]===it)return false;           // nothing given (the owner could not be found)
 // (fixer, S18) the planned thanks already speak the keepsake ("Take this fan."), so only the one-time shelf hint is toasted, when it is there
 const m=/<p class="gist38-keep">([\s\S]*?)<\/p>/.exec(caught),hint=FOUND38.UI.shelfHint;if(m&&hint&&gistUnesc39(m[1]).indexOf(hint)>=0)gistToast39(hint);
 // (fixer, S18) the next thing (tomorrow at noon) was not told at tonight's gist (the plan was made before the give): Today hears of it in the
 // morning, unless v38's own thank-you already told it
 const nl=G.lost;if(nl&&nl.status==='out'&&nl.since>S.day&&!(nl.heard===S.day)&&FOUND38.LOST[nl.i]){nl.heard=S.day;nl.heardMode='new';delete nl.heardBy;}
 gistLog39('thanks','give:'+it.id);v.gave39=true;return true;}

/* ======================================================================================================================================
   8. The stool for the eldest guest (spec §7): handed over the rail with a reach pose, the elder seated (polish-v30's seatPose on a 0.45 m
   stool), the stool's yaw the elder's (after faceGuests, in the updateCameras wrapper), back over the rail at Goodnight; unseated at once on
   every abort
   ====================================================================================================================================== */
function stoolMesh39(){const g=new THREE.Group();g.name='gist39_stool';const S0=GIST39.STOOL,wood=new THREE.MeshLambertMaterial({color:'#8A5A33'}),dark=new THREE.MeshLambertMaterial({color:'#5E3B22'});
 const seat=new THREE.Mesh(new THREE.CylinderGeometry(S0.r,S0.r*0.96,0.045,18),wood);seat.position.y=S0.h-0.0225;g.add(seat);
 for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4,leg=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.022,S0.h-0.045,8),dark);leg.position.set(Math.sin(a)*S0.r*0.68,(S0.h-0.045)/2,Math.cos(a)*S0.r*0.68);
  leg.rotation.z=Math.cos(a)*0.06;leg.rotation.x=-Math.sin(a)*0.06;g.add(leg);}
 const ring=new THREE.Mesh(new THREE.TorusGeometry(S0.r*0.62,0.01,5,20),dark);ring.rotation.x=Math.PI/2;ring.position.y=0.16;g.add(ring);
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.userData.own39=true;}});g.userData.gist39='stool';return g;}
function stoolDispose39(o){if(!o)return;if(o.parent)o.parent.remove(o);const mats=new Set();o.traverse(m=>{if(m.geometry)m.geometry.dispose();if(m.material)mats.add(m.material);});for(const m of mats)m.dispose();}
// the player who hands the stool over: the nearest human at the rail (on the veranda row) to the elder, or null
function stoolHander39(x,z){let best=null,bd=4.5;for(const p of players){if(!p||!p.g||gistIsAI39(p.i)||(p.y||0)>1)continue;const q=p.g.position;if(!(q.z>5.85&&q.z<7.0))continue;
  const d=Math.hypot(q.x-x,q.z-z);if(d<bd){bd=d;best=p;}}return best;}
// where the hander's hands are, over the rail towards the elder
function stoolHands39(p,x,z){const q=p.g.position,dx=x-q.x,dz=z-q.z,d=Math.hypot(dx,dz)||1;return [q.x+dx/d*0.5,1.0,q.z+dz/d*0.5];}
// start handing the stool over to elder k (the first time on Next of their greeting; later as the guests reach their spots)
function stoolStart39(k){if(GIST39.stool)return;const n=typeof npcs!=='undefined'?npcs[k]:null;if(!n||!n.g||!n.g.visible||typeof scene==='undefined'||!scene)return;
 const x=n.g.position.x,z=n.g.position.z,h=stoolHander39(x,z),obj=quiet39(()=>stoolMesh39());const from=h?stoolHands39(h,x,z):[x,0.6,z];
 obj.position.set(from[0],from[1]-0.3,from[2]);obj.rotation.y=n.g.rotation.y;scene.add(obj);
 GIST39.stool={k,obj,phase:'reach',t:0,by:h?h.i:-1,from,to:[x,z],logged:false};GIST39.cost.checks++;}
function stoolSeat39(){const st=GIST39.stool,n=npcs[st.k];if(!n)return;st.obj.position.set(st.to[0],0,st.to[1]);st.obj.rotation.y=n.g.rotation.y;st.obj.updateMatrixWorld(true);
 n.g.userData.seat={frame:st.obj,height:GIST39.STOOL.h,depth:0,spacing:0,x:0,floorY:0};n.g.sitting=true;st.phase='seated';st.t=0;
 if(!st.logged){st.logged=true;gistLog39('thanks','stool:'+st.k);}}
function stoolUnseat39(k){const n=typeof npcs!=='undefined'?npcs[k]:null;if(!n||!n.g)return;const g=n.g;if(!g.sitting&&!g.userData.seat)return;g.sitting=false;delete g.userData.seat;g.position.y=0;
 try{if(g.actions&&g.actions.idle){Object.values(g.actions).forEach(a=>a.setEffectiveWeight(0));g.actions.idle.reset().setEffectiveWeight(1).play();g.current='idle';if(g.mixer)g.mixer.update(0);}}catch(e){}}
// Goodnight: the elder stands at once, the stool goes back over the rail to the hander (or straight away with nobody at the rail)
function stoolBack39(){const st=GIST39.stool;if(!st)return;stoolUnseat39(st.k);const h=st.by>=0?players[st.by]:null;
 if(!h||st.phase==='reach'){stoolClear39();return;}st.phase='back';st.t=0;st.from=[st.obj.position.x,st.obj.position.y,st.obj.position.z];st.to=stoolHands39(h,st.from[0],st.from[2]);}
// out of the scene at once (an abort, a new day, a new household, online)
function stoolClear39(){const st=GIST39.stool;if(!st)return;GIST39.stool=null;stoolUnseat39(st.k);stoolDispose39(st.obj);}
// the stool's frame: carried over the rail, set down, seated; carried back
function stoolFrame39(dt){const st=GIST39.stool;if(!st)return;const T=GIST39.STOOL.reachS;st.t+=dt;const f=Math.min(1,st.t/T),e=f*f*(3-2*f);
 if(st.phase==='reach'){const y=(st.from[1]-0.3)*(1-e)+0.25*Math.sin(Math.PI*e);st.obj.position.set(st.from[0]+(st.to[0]-st.from[0])*e,Math.max(0,y),st.from[2]+(st.to[1]-st.from[2])*e);if(f>=1)stoolSeat39();}
 else if(st.phase==='back'){st.obj.position.set(st.from[0]+(st.to[0]-st.from[0])*e,st.from[1]+(st.to[1]-0.3-st.from[1])*e+0.25*Math.sin(Math.PI*e),st.from[2]+(st.to[2]-st.from[2])*e);if(f>=1)stoolClear39();}}
// the reach pose: the hander's arms forward over the rail while the stool is carried (after the mixer, before the render)
const REACH39={T:null,B:null};
function stoolReachPose39(){const st=GIST39.stool;if(!st||(st.phase!=='reach'&&st.phase!=='back')||st.by<0)return;const p=players[st.by];if(!p||!p.g||!p.g.hero||!p.g.hero.bones||typeof seatIK!=='function')return;
 const g=p.g,Bn=g.hero.bones,T=REACH39.T||(REACH39.T=new THREE.Vector3()),bend=REACH39.B||(REACH39.B=new THREE.Vector3()),o=st.obj.position;g.updateMatrixWorld(true);
 const fx=Math.sin(g.rotation.y),fz=Math.cos(g.rotation.y),sx=Math.cos(g.rotation.y),sz=-Math.sin(g.rotation.y);
 for(const s of [-1,1]){const side=s<0?'left':'right';const tx=(o.x+g.position.x+fx*0.55)/2+sx*0.14*(s<0?1:-1),tz=(o.z+g.position.z+fz*0.55)/2+sz*0.14*(s<0?1:-1);
  T.set(tx,Math.max(0.85,Math.min(1.25,o.y+0.45)),tz);bend.set(-fx*0.3,-1,-fz*0.3);try{seatIK(Bn[side+'arm'],Bn[side+'forearm'],Bn[side+'hand'],T,bend);}catch(e){}}}
// wrap: after the cameras (and so after faceGuests), the stool takes the elder's yaw and the reach pose is laid on; a pass-through with no stool
if(gistOn39()&&typeof updateCameras==='function'){const prevCams39=updateCameras;updateCameras=function(){const r=prevCams39.apply(this,arguments);
 const st=GIST39.stool;if(!st)return r;
 try{const n=npcs[st.k];if(n&&n.g&&st.phase==='seated'){st.obj.rotation.y=n.g.rotation.y;}stoolReachPose39();}catch(e){if(typeof console!=='undefined')console.warn('gist39 stool',e);}
 return r;};}

/* ======================================================================================================================================
   9. The evening's engine (all by property, outermost, inside typeof guards): Next, abort and the per-frame step
   ====================================================================================================================================== */
if(gistOn39()&&typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.next==='function'){const prevNext39=EVENING35.next;EVENING35.next=function(){
 const v=GIST38.visit,E=EVENING35;if(!v||E.state!=='talking'||!Array.isArray(v.script))return prevNext39.apply(this,arguments);
 const s=v.script[E.line],live=s&&E.lines[E.line]&&s.id===E.lines[E.line].id&&!(typeof clock35==='function'&&clock35()-(E.lastNext||-1e9)<300);
 try{if(live&&s.v39k==='give'&&!v.gave39)giveAtGist39(v);
  if(live&&s.stoolBtn&&!GIST39.stool)stoolStart39(s.stoolBtn);}catch(e){if(typeof console!=='undefined')console.warn('gist39 next',e);}
 const r=prevNext39.apply(this,arguments);
 try{if(E.state!=='talking'&&GIST39.stool)stoolBack39();}catch(e){}
 return r;};}
if(gistOn39()&&typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.abort==='function'){const prevAbort39=EVENING35.abort;EVENING35.abort=function(){
 const r=prevAbort39.apply(this,arguments);try{stoolClear39();}catch(e){}return r;};}
// the per-frame step (the outermost EVENING35.tick wrapper): the stool's frame; four times a second the stool on arrival, the pot's bowl and
// its lapse, the print
GIST39.step=function(dt){const Gs=GIST39;dt=Math.max(0,+dt||0);Gs.t+=dt;Gs.cost.steps++;
 if(Gs.stool&&!gistOverlay39())stoolFrame39(Math.min(dt,0.1));
 if(Gs.t<Gs.checkAt)return;Gs.checkAt=Gs.t+0.25;
 if(typeof S==='undefined'||!S||!S.p||S.phase!=='play'||typeof players==='undefined'||!players.length)return;
 if(gistOnline39()){if(Gs.stool)stoolClear39();if(Gs.world.print)printDrop39();return;}
 const v=GIST38.visit,E=typeof EVENING35!=='undefined'?EVENING35:null;
 if(Gs.stool&&(!v||!E||E.state==='idle'))stoolClear39();
 if(!S.life||!S.life.gist38)return;
 // a later gist with an elder who has had their line: the stool goes over the rail as the guests reach their spots (after the players' glide)
 if(v&&E&&E.state==='talking'&&!v.stool39&&v.script&&v.script.g39&&v.script.g39.stool&&!v.script.g39.stoolFirst&&!(v.glide&&Object.keys(v.glide).length)){v.stool39=true;stoolStart39(v.script.g39.stool);}
 const b=gistB39();if(!b)return;
 const p=b.pot;
 if(p&&p.day===S.day&&p.gave===S.day&&S.time>=Gs.POT.bowlAt&&p.bowl!==S.day&&!gistOverlay39()&&!v){p.bowl=S.day;
  for(const j of both()){try{cheer(j,Gs.POT.cheer);S.p[j].energy=clamp((S.p[j].energy||0)+Gs.POT.energy,0,100);}catch(e){}}
  gistToast39(gistFill39(Gs.UI.potBowl,{dish:Gs.UI.dish[p.who]||'soup',owner:gistNm39(p.who)}));gistSaveNow39();}
 if(p&&p.day===S.day&&p.gave!==S.day&&S.time>=Gs.POT.giveBy&&p.lapsed!==S.day){p.lapsed=S.day;}       // lapses quietly at half past five
 printSync39();};
if(gistOn39()&&typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.tick==='function'){
 const prevEveTick39b=EVENING35.tick;EVENING35.tick=function(dt){const r=prevEveTick39b.apply(this,arguments);
  try{GIST39.step(dt);}catch(e){if(typeof console!=='undefined')console.warn('gist39',e);}return r;};}

/* ======================================================================================================================================
   10. The fish for the pot (spec §10): the ask in the asker's talk (a line35 wrapper, after v39 discovery), the catch card's quiet button
   from two o'clock, the give at the asker's live place by half past five, the bowl at six (the step)
   ====================================================================================================================================== */
// the pot asked for today, open now (not given, not lapsed); null
function potOpen39(){const b=gistB39();const p=b&&b.pot;if(!p||p.day!==S.day||p.gave===S.day||S.time>GIST39.POT.giveBy)return null;return p;}
if(gistOn39()&&typeof line35==='function'){const prevLine39=line35;line35=function(who,ctx){
 if(!ctx||ctx.evening||!GIST39.POT.askers.includes(who)||typeof S==='undefined'||!S||!S.life||!S.life.gist38)return prevLine39.apply(this,arguments);
 try{const b=gistB39(),play=typeof BISI39!=='undefined'&&BISI39&&BISI39.flags&&BISI39.flags.playtest;
  if(b&&(S.time<GIST39.POT.talkBefore||play)&&!(typeof fbBenchThanksDue37==='function'&&fbBenchThanksDue37(who))&&potAskDue39(who,S.day)){
   const n=potN39(S.day),e=GIST39.LINES.pot[who].talk;b.pot={day:S.day,who,n,got:0,gave:0,via:'talk',said:S.day};b.potLast[who]=S.day;gistLog39('pot','ask:'+who);gistSaveNow39();
   return {id:e[0],text:potSay39(e[1],n)};}}
 catch(e){if(typeof console!=='undefined')console.warn('gist39 pot ask',e);}
 return prevLine39.apply(this,arguments);};}
// the catch card: a quiet "Keep it for {name}'s pot" before "Let it swim" (a second primary would break tune's one-button fishing)
if(gistOn39()&&typeof openLifePanel34==='function'){const prevLifePanel39=openLifePanel34;openLifePanel34=function(content,tab){
 try{const c=S&&S.life&&S.life.catch,p=c&&S.life.gist38?potOpen39():null;
  if(p&&tab==='fish'&&typeof content==='string'&&content.includes('class="catch34"')&&S.time>=GIST39.POT.freshFrom&&p.got<p.n&&(typeof FISH34==='undefined'||FISH34.some(f=>f.id===c.id))){
   const at=content.indexOf('<button class="btn quiet" data-act="lifeCatch"');
   if(at>=0)content=content.slice(0,at)+btn(esc(gistFill39(GIST39.UI.potKeep,{name:gistNm39(p.who)})),'pot39Keep',{},'quiet')+content.slice(at);}}catch(e){}
 return prevLifePanel39.call(this,content,tab);};}
function potHot39(i,list,d){if(!list||typeof S==='undefined'||!S||!S.p||S.phase!=='play'||gistOnline39()||!S.life||!S.life.gist38)return null;
 const p=potOpen39();if(!p||p.got<p.n)return null;const pl=players[i];if(!pl||gistIsAI39(i)||(pl.y||0)>1)return null;
 const n=typeof found38Npc==='function'?found38Npc(p.who):null;if(!n)return null;const dd=d(n.g.position.x,n.g.position.z);
 if(dd<GIST39.POT.reach)list.push({id:'pot39give',label:gistFill39(GIST39.UI.potGive,{name:gistNm39(p.who)}),dist:dd-GIST39.POT.lead});return null;}
function potGive39(i){const b=gistB39(),p=potOpen39();if(!b||!p||p.got<p.n)return;const n=found38Npc(p.who);if(!n)return;
 p.gave=S.day;try{aff(p.who,1);}catch(e){}gistLog39('pot','give:'+p.who);gistSaveNow39();
 const e=GIST39.LINES.pot[p.who].ty[potTy39(S.day)];                          // (fixer, S5) by the hash's high bits
 openPanel(`<section class="gist38-panel gist39-pot"><p class="gist38-kicker">${esc(GIST39.UI.potKicker)}</p><h2>${esc(gistNm39(p.who))}</h2><div class="gist38-thanks">${say(p.who,esc(e[1]))}</div><div class="actions">${btn(esc(GIST39.UI.potClose),'pot39Close',{},'primary block')}</div></section>`);}
if(gistOn39()&&typeof ACTIONS!=='undefined'){
 // through the base, as "Let it swim" (the catch settled, the cast ended, the day log sees it), then the pot's own page (v38's carvings' way)
 ACTIONS.pot39Keep=function(){const b=gistB39(),p=potOpen39(),l=S.life,c=l&&l.catch;if(!b||!p||!c||p.got>=p.n||S.time<GIST39.POT.freshFrom)return;
  ACTIONS.lifeCatch({v:'release'});if(l.catch)return;p.got++;gistSaveNow39();const left=p.n-p.got,U=GIST39.UI;
  const html=`<section class="gist39-pot"><p class="life-kicker">${esc(U.potKicker)}</p><h2>${esc(gistFill39(U.potTitle,{name:gistNm39(p.who)}))}</h2><p>${esc(U.potLeft[left]||'')}</p><div class="actions">${btn(esc(U.castAgain),'lifeFish',{},'primary')}${btn(esc(U.backShore),'close',{},'quiet')}</div></section>`;
  if(typeof openLifePanel34==='function')openLifePanel34(html,'fish');else openPanel(html);};
 ACTIONS.pot39Give=function(d){potGive39(d&&d.i|0);};
 ACTIONS.pot39Close=function(){try{closePanel();}catch(e){}};
 // the caption's stool button is the engine's Next (this action does the same, for a keyboard or a replay)
 ACTIONS.gist39Stool=function(){try{if(typeof EVENING35!=='undefined'&&EVENING35&&EVENING35.state==='talking')EVENING35.next();}catch(e){}};
 if(typeof LOCAL_ONLY!=='undefined')for(const n of ['pot39Keep','pot39Give','pot39Close','gist39Stool'])LOCAL_ONLY.add(n);}
if(gistOn39()&&typeof HOTSPOT_HOOKS!=='undefined')HOTSPOT_HOOKS.push(potHot39);
// (fixer, DOD-2, C4) Mr. Bassey's ask in his morning talk. His talk is the base game's (the v35 line table speaks only for Tunde, Mama Nkechi
// and Ada, so the line35 wrapper never runs for him), and talk and openTalk are never wrapped: the base talk hotspot for him is caught here, the
// base openTalk is called with openPanel swapped for that one call, and his ask is added before the panel's buttons. The record is the line35
// wrapper's own. False when the ask is not due: the base act runs as before.
function potTalk39(i){try{if(typeof S==='undefined'||!S||!S.life||!S.life.gist38||gistOnline39()||gistIsAI39(i)||typeof openTalk!=='function')return false;
 const b=gistB39(),play=typeof BISI39!=='undefined'&&BISI39&&BISI39.flags&&BISI39.flags.playtest,E=typeof EVENING35!=='undefined'?EVENING35:null;
 if(!b||!(S.time<GIST39.POT.talkBefore||play)||(E&&E.state!=='idle')||GIST38.visit||(typeof fbBenchThanksDue37==='function'&&fbBenchThanksDue37('bassey'))||!potAskDue39('bassey',S.day))return false;
 const ko=openPanel;let html=null;openPanel=function(h){html=String(h||'');};try{openTalk(i,'bassey');}finally{openPanel=ko;}if(html===null)return true;
 const n=potN39(S.day),e=GIST39.LINES.pot.bassey.talk,text=potSay39(e[1],n);b.pot={day:S.day,who:'bassey',n,got:0,gave:0,via:'talk',said:S.day};b.potLast.bassey=S.day;gistLog39('pot','ask:bassey');
 const at=html.lastIndexOf('<div class="actions">'),ask=typeof say==='function'?say('bassey',esc(text)):`<p>${esc(text)}</p>`;html=at>=0?html.slice(0,at)+ask+html.slice(at):html+ask;
 gistSaveNow39();openPanel(html);return true;}catch(e){if(typeof console!=='undefined')console.warn('gist39 talk ask',e);return false;}}
if(gistOn39()&&typeof ACT_HOOKS!=='undefined')ACT_HOOKS.push(function(i,kind,arg){if(kind==='talk'&&arg==='bassey')return potTalk39(i);if(kind!=='pot39give')return false;if(gistOnline39()||gistIsAI39(i))return true;if(typeof foundGuard38==='function')foundGuard38();potGive39(i);return true;});

/* ======================================================================================================================================
   11. After the seven (spec §9): round two's five new things, then the "again" round. Entries are pure functions of their index, appended to
   FOUND38.LOST (and their words to v38's tables, with gs39 ids) only when round two starts, at a pickup, or at a reload that needs them
   ====================================================================================================================================== */
const ROT39={cycles:{}};
// the twelve (seven of v38's and round two's five) in the again round's order for cycle c: by hash38(c, k), the first such order with never
// the same owner twice running (also across the end of the cycle before, and after round two's last)
function rotBase39(){const base=[];for(let k=0;k<7;k++){const e=FOUND38.LOST[k];base.push({id:e.id,owner:e.owner});}for(const id of GIST39.LINES.ROUND_ORDER)base.push({id,owner:GIST39.LINES.round[id].owner});return base;}
function rotCycle39(c){if(ROT39.cycles[c])return ROT39.cycles[c];const base=rotBase39(),prev=c>0?base[rotCycle39(c-1)[base.length-1]].owner:GIST39.LINES.round[GIST39.LINES.ROUND_ORDER[4]].owner;
 const pref=base.map((e,k)=>k).sort((a,b)=>(gistHash39(c,a)-gistHash39(c,b))||(a-b)),used=new Array(base.length).fill(false),out=[];
 const dfs=last=>{if(out.length===base.length)return true;for(const k of pref){if(used[k]||base[k].owner===last)continue;used[k]=true;out.push(k);if(dfs(base[k].owner))return true;used[k]=false;out.pop();}return false;};
 if(!dfs(prev)){out.length=0;for(const k of pref)out.push(k);}
 return (ROT39.cycles[c]=out);}
// (fixer, Codex P2) the again round's ids, one per cycle: the first cycle keeps "<id>-a" (a save already in it loads unchanged), cycle c from
// the second on is "<id>-a<c+1>" ("tape-a2", "tape-a3" ...), so no id repeats. v38 finds a lost thing by its id (gistItem38, gistDone38's
// heard and ownerTold, said.told for a return retold): a shared id found the first cycle's entry, and the later cycles' tips were never heard.
function rotId39(src,c){return c>0?src+'-a'+(c+1):src+'-a';}
// the source id of a lost thing (an entry, or an id): an again entry's base ("tape" for "tape-a" and "tape-a2"), else the id itself. The one
// place an again id is read: an id is an again id only when its stem is one of the twelve and its suffix one rotId39 makes.
function rotSrc39(x){if(x&&typeof x==='object'){if(x.v39==='again'&&x.base)return x.base;x=x.id;}const id=String(x),m=/^(.+)-a([2-9]|[1-9]\d+)?$/.exec(id);
 return m&&gistOn39()&&FOUND38.LOST.length>=7&&rotBase39().some(e=>e.id===m[1])?m[1]:id;}
// entry i (7 and on) of the lost things, pure: round two's five, then the again round's twelve to a cycle under rotId39's ids
function rotEntry39(i){if(!(i>=7))return null;const R=GIST39.LINES.round,U=GIST39.UI;
 if(i<12){const id=GIST39.LINES.ROUND_ORDER[i-7],r=R[id];return {id,owner:r.owner,name:r.name,long:r.long,area:r.area,say:r.say,ownerKnown:true,spots:r.spots.map(s=>s.slice()),
   pickLabel:r.pickLabel,pickToast:r.pickToast,giveLabel:r.giveLabel,v39:'round'};}
 const c=Math.floor((i-12)/12),j=(i-12)%12,base=rotBase39(),k=rotCycle39(c)[j],src=base[k];
 const o=k<7?FOUND38.LOST[k]:Object.assign({id:src.id},R[src.id]);
 return {id:rotId39(src.id,c),owner:o.owner,name:o.name,long:o.long,area:o.area,say:o.say,ownerKnown:true,spots:o.spots.map(s=>s.slice()),pickLabel:o.pickLabel,
  pickToast:gistUp39(gistFill39(U.againPick,{thing:o.long,owner:gistNm39(o.owner)})),giveLabel:o.giveLabel,v39:'again',base:src.id};}
// the words for entry e in v38's tables (only where absent), remembered so a new household can take them out again
function rotWords39(e){const L=GIST38.LINES,U=GIST38.UI,F=FOUND38,R=GIST39.LINES,set=(o,k,v,tag)=>{if(o&&!(k in o)){o[k]=v;GIST39.added.push([tag,k]);}};
 const r=e.v39==='round'?R.round[e.id]:null,base=e.base||e.id,thing=r?r.name:(L.thing[base]||e.name),pocket=r?r.pocket:((L.pocketThing&&L.pocketThing[base])||thing),own=gistNm39(e.owner);
 set(L.thing,e.id,thing,'thing');set(L.pocketThing,e.id,pocket,'pocketThing');
 if(r){set(L.lost,e.id,[e.owner,r.lost[0],r.lost[1]],'lost');set(L.told,e.id,r.told.slice(),'told');set(L.back,e.id,r.back.slice(),'back');
  set(U.heardLost,e.id,r.heard,'heardLost');set(U.recapLost,e.id,r.recap,'recapLost');set(F.SPEECH.ty,e.id,r.ty[1],'ty');}
 else{const a=R.again[e.owner],t=R.againTy[e.owner],one=againNoun39(e.id);set(L.lost,e.id,[e.owner,a[0],gistFill39(a[1],{thing:one})],'lost');     // (fixer, C1) singular nouns
  set(L.told,e.id,[R.againTold[0],gistFill39(R.againTold[1],{owner:own,thing:one})],'told');set(L.back,e.id,R.againBack.slice(),'back');
  set(U.heardLost,e.id,gistFill39(GIST39.UI.againHeard,{owner:own,thing:one,area:e.area}),'heardLost');set(U.recapLost,e.id,gistFill39(GIST39.UI.againRecap,{owner:own,thing:one,area:e.area}),'recapLost');
  set(F.SPEECH.ty,e.id,t[1],'ty');}}
function rotAppend39(i){const F=FOUND38;if(F.LOST.length!==i)return false;const e=rotEntry39(i);if(!e)return false;F.LOST.push(e);rotWords39(e);return true;}
// the entries a save needs (through i while the thing is out; through i+1 once it is in the pocket or back, so the next can be scheduled);
// a table left longer by another household is cut back to what this one needs
function rotEnsure39(){if(!gistOn39())return;const F=FOUND38,G=typeof S!=='undefined'&&S&&S.p&&S.life&&S.life.gist38&&typeof gistSave38==='function'?gistSave38():null;
 let need=7;if(G&&G.lost&&(G.lost.i|0)>=7)need=(G.lost.i|0)+(G.lost.status==='out'?1:2);
 while(F.LOST.length>need&&F.LOST.length>7)F.LOST.pop();for(let i=F.LOST.length;i<need;i++)if(!rotAppend39(i))break;
 if(G&&(G.lost.i|0)>=12)rotMigrate39(G);}
// (fixer, Codex P2) a save from a build that gave every again cycle the first cycle's ids ("tape-a" again in the second): the later returns of
// an id take their cycle's id (its n-th return is cycle n), the pickup record and last night's tips about the thing out now take its new id,
// and a tip about it that the old build failed to record as heard is recorded now (heard that night, told once; the owner told, for the
// pocket). Nothing changes for a save made by this build: no repeated id, nothing under an old id.
function rotMigrate39(G){const F=FOUND38,seen={};
 if(Array.isArray(G.returned))for(const r of G.returned){if(!r||typeof r.id!=='string')continue;const src=rotSrc39(r.id);if(src===r.id||r.id!==rotId39(src,0)){continue;}
  const n=seen[r.id]=(seen[r.id]|0)+1;if(n>1)r.id=rotId39(src,n-1);}
 const L=G.lost,it=F.LOST[L.i|0];if(!it||it.v39!=='again')return;const old=rotId39(it.base,0);if(old===it.id)return;
 const b=gistB39();if(b&&b.picked&&b.picked.id===old&&L.status==='pocket')b.picked.id=it.id;
 const last=G.last;if(!last||!Array.isArray(last.tips))return;
 for(const t of last.tips){if(!t||t.arg!==old)continue;t.arg=it.id;if(!(last.day>=(L.since|0)-1))continue;
  if(t.kind==='lost'&&L.status==='out'&&!((L.heard|0)>0)){L.heard=last.day;L.told=Math.max(1,L.told|0);L.heardMode=t.mode||'new';delete L.heardBy;}
  else if(t.kind==='pocket'&&L.status==='pocket'&&!((L.ownerTold|0)>0))L.ownerTold=last.day;}}
// a new household: round two's entries and words out of v38's tables
function rotReset39(){if(!gistOn39())return;const F=FOUND38;while(F.LOST.length>7)F.LOST.pop();
 const T={thing:GIST38.LINES.thing,pocketThing:GIST38.LINES.pocketThing,lost:GIST38.LINES.lost,told:GIST38.LINES.told,back:GIST38.LINES.back,heardLost:GIST38.UI.heardLost,recapLost:GIST38.UI.recapLost,ty:F.SPEECH.ty};
 for(const [tag,k] of GIST39.added)if(T[tag])delete T[tag][k];GIST39.added.length=0;}
// round two starts on the first new day after the seventh went back (day R+1): its first thing comes out on R+2 at noon, told at R+1's gist
// as v38's own lost:new tip; this discovers v39
function rotStart39(G){const F=FOUND38;if(!G||!G.lost||G.lost.i!==6||G.lost.status!=='back'||F.LOST.length!==7)return false;
 const last=(G.returned||[]).filter(r=>r.id===F.LOST[6].id).pop();if(!last||!(last.day<S.day))return false;
 if(!rotAppend39(7))return false;G.lost={i:7,since:S.day+GIST39.ROUND2_GAP-1,at:F.LOST_AT,status:'out',heard:0,told:0,ownerTold:0};gistSave39(true);return true;}
// meshes for round two's things (v38's found38BuildItem builds them inside quiet38); an "again" id draws its original
if(gistOn39()&&typeof found38ItemMesh==='function'){const prevItemMesh39=found38ItemMesh;found38ItemMesh=function(it){
 if(!it||!it.id)return prevItemMesh39.apply(this,arguments);const id=rotSrc39(it);
 if(!GIST39.LINES.round[id])return id===it.id?prevItemMesh39.apply(this,arguments):prevItemMesh39.call(this,Object.assign({},it,{id}));
 const g=new THREE.Group();g.name='found38_'+it.id;const k=new THREE.Group();g.add(k);
 if(id==='pencil'){const b=found38Cyl(k,0.007,0.1,'#E8C23A',0,0.007,0,8);b.rotation.z=Math.PI/2;const t=found38Cone(k,0.007,0.02,'#D9B98C',0.06,0.007,0);t.rotation.z=-Math.PI/2;found38Cyl(k,0.0075,0.012,'#C8553D',-0.056,0.007,0,8).rotation.z=Math.PI/2;}
 else if(id==='tape'){found38Ring(k,0.034,0.014,'#1E1E1E',0,0.014,0);found38Ring(k,0.02,0.004,'#C9B994',0,0.016,0);}
 else if(id==='pin'){found38Box(k,0.004,0.004,0.08,'#C9A23A',0,0.004,0);found38Ball(k,0.012,'#2E8C7A',0,0.012,-0.042);}
 else if(id==='cloth'){const a=found38Box(k,0.1,0.006,0.08,'#9DB4C8',0,0.003,0);a.rotation.y=0.2;found38Box(k,0.07,0.006,0.05,'#B9CCDB',0.01,0.009,0.01).rotation.y=-0.1;}
 else{found38Cyl(k,0.034,0.018,'#B8BEC4',0,0.009,0,16);for(const [x,z,c] of [[0.05,0.01,'#C8553D'],[0.045,-0.02,'#2E6FA8'],[-0.048,0.025,'#E9B44C']]){found38Ball(k,0.007,c,x,0.004,z);}}
 k.scale.setScalar(1.5);return g;};}
// the shelf panel gains "Things given back: {n}." once round two has begun
if(gistOn39()&&typeof found38ShelfHTML==='function'){const prevShelfHTML39=found38ShelfHTML;found38ShelfHTML=function(G){const h=prevShelfHTML39.apply(this,arguments);
 try{if(!G||!G.lost||(G.lost.i|0)<7||typeof h!=='string')return h;const at=h.lastIndexOf('<div class="actions">');if(at<0)return h;
  return h.slice(0,at)+`<p class="small gist39-returned">${esc(gistFill39(GIST39.UI.returned,{n:G.returned.length}))}</p>`+h.slice(at);}catch(e){return h;}};}
if(gistOn39()&&typeof found38On==='function'){
 // a round thing picked up: the next entry is there for found38Give to schedule tomorrow
 found38On('pickup',function(){try{const G=gistG39();if(G&&(G.lost.i|0)>=7)rotEnsure39();}catch(e){}});
 // (fixer, DOD-10) v39's own record of the pickup day for the give-back (in memory, and in G.b39 once v39 is discovered: v38's save follows)
 found38On('pickup',function(d){try{if(!d||!d.id)return;PICK39.id=d.id;PICK39.day=S.day;const b=gistB39();if(b)b.picked={id:d.id,day:S.day};}catch(e){}});
 // §12.4 v38's set memory says "on our shelf" even with no shelf: with no shelf up it says it is waiting for one
 found38On('set',function(d){try{const G=gistG39(),set=d&&d.set,cap=FOUND38.UI.memory[set],alt=GIST39.UI.memoryNoShelf[set];if(!G||!cap||!alt||G.shelf.state==='up')return;
  for(let k=S.memories.length-1;k>=0;k--){const m=S.memories[k];if(m&&m.caption===cap&&m.day===S.day){m.caption=alt;break;}}}catch(e){}});}

/* ======================================================================================================================================
   12. Mr. Bassey's photograph and the print (spec §8.2; cut item 1, built): the morning after the carvings' thank-you, an album memory with
   the household in its caption (the image from engineer A's shelfShot39; none in Node or silentMode), and the framed print the morning after,
   a separate group above the shelf (never inside W.shelf)
   ====================================================================================================================================== */
function printMesh39(url){const g=new THREE.Group();g.name='gist39_print';const frame=new THREE.MeshLambertMaterial({color:'#3B2A1E'});
 const back=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.22,0.02),frame);g.add(back);
 const tex=url&&typeof photoTexture==='function'?photoTexture(url):null;
 const pic=new THREE.Mesh(new THREE.PlaneGeometry(0.26,0.18),new THREE.MeshLambertMaterial(tex?{map:tex}:{color:'#D9C7A3'}));pic.position.z=0.0105;g.add(pic);
 g.traverse(o=>{if(o.isMesh)o.userData.own39=true;});g.userData.gist39='print';return g;}
function printDrop39(){const W=GIST39.world;if(W.print){if(W.print.parent)W.print.parent.remove(W.print);const mats=new Set();W.print.traverse(m=>{if(m.geometry)m.geometry.dispose();if(m.material)mats.add(m.material);});
  for(const m of mats){if(m.map)m.map.dispose();m.dispose();}}W.print=null;W.printKey='';}
// the print: shown while the photograph is framed and the shelf is up, in this household, offline
function printSync39(){const W=GIST39.world,b=gistB39(),G=gistG39();
 const on=!!(b&&b.photo&&b.photo.state==='framed'&&G&&G.shelf&&G.shelf.state==='up'&&typeof scene!=='undefined'&&scene&&!gistOnline39());
 if(!on){if(W.print)printDrop39();return;}const key='print:'+b.photo.day;if(W.print&&W.print.parent===scene&&W.printKey===key)return;printDrop39();
 const mem=(S.memories||[]).find(m=>m&&m.pid&&m.pid===b.photo.pid),url=mem&&mem.img?mem.img:null;const SH=FOUND38.SHELF;
 const g=quiet39(()=>printMesh39(url));g.position.set(SH.x,SH.tiers[SH.tiers.length-1]+0.3,SH.z-SH.depth/2+0.02);scene.add(g);W.print=g;W.printKey=key;}
function gistPhotoMorning39(b){if(!b||!b.thanked||!b.thanked.carve)return false;
 if(!b.photo&&S.day>b.thanked.carve){let img=null;try{img=typeof shelfShot39==='function'?shelfShot39({key:'photo'}):null;}catch(e){img=null;}
  const pid=typeof nextId==='function'?nextId('ph'):'ph39';S.memories.push({day:S.day,caption:GIST39.UI.photoCaption,kind:'moment',img,pid});try{if(typeof trimPhotos==='function')trimPhotos();}catch(e){}
  b.photo={day:S.day,state:'taken',pid};gistLog39('thanks','photo');gistToast39(GIST39.UI.photoToast);return true;}
 if(b.photo&&b.photo.state==='taken'&&S.day>b.photo.day){b.photo.state='framed';b.photo.framed=S.day;gistToast39(GIST39.UI.printToast);return true;}
 return false;}

/* ======================================================================================================================================
   13. The daily loop (spec §12): Today's pot and Bisi rows within v38's cap; the night page's pot ask; the day log's kinds
   ====================================================================================================================================== */
function potRows39(){const b=gistB39(),p=b&&b.pot;if(!p||p.day!==S.day||!p.said)return null;const U=GIST39.UI,owner=gistNm39(p.who);
 if(p.gave===S.day){if(S.time>=GIST39.POT.bowlAt||p.bowl===S.day)return null;return {k:'pot',html:esc(gistFill39(U.potRowGiven,{owner}))};}
 if(S.time>=GIST39.POT.giveBy||p.lapsed===S.day)return null;
 if(!p.got)return {k:'pot',html:esc(gistFill39(U.potRowAsk,{owner,n:U.num[p.n]}))};
 if(p.got<p.n)return {k:'pot',html:esc(gistFill39(U.potRowSome[p.got+'/'+p.n]||U.potRowAll,{owner,n:U.num[p.n]}))};
 return {k:'pot',html:esc(gistFill39(U.potRowAll,{owner,n:U.num[p.n]}))};}
// (fixer, DOD-1, C5, S2) owner decision 1: "Today tells you each morning whether she's coming". Aunty Bisi's sentence is folded into v38's
// "This evening" row ("This evening: Aunty Bisi from five, the neighbours from a quarter past six."), rebuilt here when v38's own cap dropped
// it; that row (key 'bisi') is never dropped: 'wait', then 'shelf', then 'carve' go first. With five rows that cannot drop (only on a 4-row
// phone in theory) her sentence is folded into the row before it. Before v39 discovery nothing changes.
function eveRow39(){if(!(typeof gistDueTonight38==='function'&&gistDueTonight38()&&S.time<GIST38.WIN[0]))return null;const E=typeof gistEve38==='function'?gistEve38():null;
 const b=typeof gistHome38==='function'&&gistHome38()&&E&&E.state==='idle'&&!GIST38.visit?btn(esc(GIST38.UI.wait),'gist38Wait',{},'quiet'):'';return {k:'wait',html:esc(GIST38.UI.evening),btn:b};}
if(gistOn39()&&typeof gistTodayRows38==='function'){const prevRows39=gistTodayRows38;gistTodayRows38=function(G){let rows=prevRows39.apply(this,arguments);
 try{if(!gistB39()||gistOnline39()||!Array.isArray(rows))return rows;const pr=potRows39(),br=typeof bisiRow39==='function'?bisiRow39():null;if(!pr&&!br)return rows;
  rows=rows.slice();
  if(br){const wi=rows.findIndex(r=>r.k==='wait'),w=wi>=0?rows[wi]:eveRow39();
   const row=w?{k:'bisi',html:br.eve,btn:(w.btn||'')+(br.btn||'')}:{k:'bisi',html:br.html,btn:br.btn||''};
   if(wi>=0)rows[wi]=row;else{const si=rows.findIndex(r=>r.k==='shelf');if(si>=0)rows.splice(si,0,row);else rows.push(row);}}
  if(pr)rows.push(pr);const cap=(typeof innerWidth==='number'&&innerWidth<=480)?4:5;
  for(const k of ['wait','shelf','carve'])while(rows.length>cap){const i=rows.findIndex(r=>r.k===k);if(i<0)break;rows.splice(i,1);}
  if(rows.length>cap&&br){const bi=rows.findIndex(r=>r.k==='bisi');if(bi>0){const r0=rows.splice(bi,1)[0],h=rows[bi-1];rows[bi-1]=Object.assign({},h,{html:h.html+' '+br.html,btn:(h.btn||'')+(br.btn||'')});void r0;}}
  return rows;}catch(e){if(typeof console!=='undefined')console.warn('gist39 today',e);return rows;}};}
if(gistOn39()&&typeof gistRecapHTML38==='function'){const prevRecap39=gistRecapHTML38;gistRecapHTML38=function(){const h=prevRecap39.apply(this,arguments);
 try{const G=gistG39(),b=gistB39(),p=b&&b.pot;if(!G||!b||!p||p.via!=='gist'||p.said!==S.day||!G.last||G.last.day!==S.day||!(G.last.ids||[]).some(id=>/^gs39-pot-/.test(id)))return h;
  const s=esc(gistFill39(GIST39.UI.recapPot,{owner:gistNm39(p.who),n:['two','three'][p.n-2]||'two'}));
  if(h)return h.replace(/<\/p><\/div>$/,' '+s+'</p></div>');return `<div class="recap35 gist38-recap"><p class="recap35-kicker">${esc(GIST38.UI.recapKicker)}</p><p>${s}</p></div>`;}catch(e){return h;}};}
if(gistOn39()&&typeof LOG35!=='undefined'&&LOG35&&Array.isArray(LOG35.kinds))for(const k of ['bisi','pot','thanks'])if(!LOG35.kinds.includes(k))LOG35.kinds.push(k);

/* ======================================================================================================================================
   14. The day, the world, a new household (spec §1.4): the morning's round two, the tenth stool, the photograph and the print, the pot's end;
   the stool and the print torn down; round two's entries rebuilt for the save that is loaded
   ====================================================================================================================================== */
function gistMorning39(){const G=gistG39();if(!G||gistOnline39())return;let changed=false;
 if(rotStart39(G))changed=true;
 const b=gistB39();if(b){
  if(b.pot&&b.pot.day<S.day){b.pot=null;changed=true;}
  // (fixer, S7) Ada's promised stool ("I will bring a stool to your housewarming", her talk): delivered at the door the next morning, with its
  // story, unless a housewarming has been held (then it came to the party)
  if(!b.stool&&S.flags&&S.flags.adaStool){const party=(S.flags.parties|0)>0;b.stool={from:party?'party':'promise',day:S.day};if(!party)gistToast39(GIST39.UI.promised);changed=true;}
  // Ada's tenth stool: the morning after a gist where her "nine times" line was shown
  if(!b.stool&&!(S.flags&&S.flags.adaStool)&&G.last&&G.last.day===S.day-1&&Array.isArray(G.last.ids)&&G.last.ids.includes('gs38-pl-ad1')){b.stool={from:'tenth',day:S.day};gistToast39(GIST39.UI.tenth);changed=true;}
  if(gistPhotoMorning39(b))changed=true;}
 if(changed)gistSaveNow39();}
if(gistOn39()&&typeof ACTIONS!=='undefined'&&typeof ACTIONS.nextday==='function'){const prevNextday39b=ACTIONS.nextday;ACTIONS.nextday=function(){
 try{stoolClear39();}catch(e){}const r=prevNextday39b.apply(this,arguments);try{gistMorning39();printSync39();}catch(e){if(typeof console!=='undefined')console.warn('gist39 nextday',e);}return r;};}
if(gistOn39()&&typeof enterWorld==='function'){const prevEnter39b=enterWorld;enterWorld=function(){try{stoolClear39();printDrop39();rotEnsure39();PICK39.id=null;PICK39.day=0;}catch(e){}
 const r=prevEnter39b.apply(this,arguments);try{GIST39.checkAt=0;}catch(e){}return r;};}
if(gistOn39()&&typeof ACTIONS!=='undefined'){for(const n of ['newgame','newconfirm']){const prev=ACTIONS[n];if(typeof prev!=='function')continue;
 ACTIONS[n]=function(){try{stoolClear39();printDrop39();rotReset39();}catch(e){}return prev.apply(this,arguments);};}}

/* v38 Evening gist and daily finds: the gist (engineer B; gist/SPEC.md §5, §6, §12, §13 and column B of §18.1).
   Every evening once the v35 veranda evening has happened (on an earlier day), from a quarter past six until ten, two neighbours come to the
   veranda rail for gist while someone is home. Everyone stands at the rail (owner decision 1): a pair seated on Ada's bench stand up to greet
   them, on the veranda side, and when the guests reach the rail each household player at home glides to a free spot on the veranda row by the
   rail (a player out in the compound is not moved). They say five to
   seven lines: two greetings, a line about today when there is one, a tip about tomorrow (whose thing will go missing and where, whose thing is in
   your pocket, shells at the water's edge) or plain gist, the owner's answer-back or a reaction, a second tip (the wash), and a goodbye. The tips
   come from the same pure functions that make tomorrow (found-v38.js), so every tip comes true; Today repeats only what was heard ("Heard last
   night"), and the night page adds "Tonight's gist". The caption's button reads "Ehen?" while a tip is on screen.
   The visit runs on the v35 evening's own engine (EVENING35): the guests, the gate toast and two fallback lines are swapped in for the visit and put
   back after it; the engine's finish() is undone (S.life.evening35, its cue, its album memory and its save) so the v35 evening stays a one-time
   event. Inert until a trigger (§1.3): before discovery nothing is saved, logged, toasted or shown; the first gist line shown discovers v38.
   No TICK_HOOKS entry (the step rides EVENING35.tick by property, inside a typeof guard), no cue subscriber, no LINES35/WHEN35/DAYS35.rows/FINDS34
   change, no Math.random call, no wall clock (GIST38.t is the sum of the frame steps). Online it is all off.
   Also (the integrator's day-1 measurement): once v38 is discovered, a neighbour whose morning and evening spots are the same point (Mrs. Oyelaran,
   visual-v21.js) walks back at six after an afternoon out; the base's reroute() skips her while she is hidden.
   Loaded after found-v38.js. Every change wraps an earlier global and calls it. Top-level names end in 38; wrapper bindings live inside blocks. */
'use strict';

/* ======================================================================================================================================
   1. The object, the copy (spec §1.6, §13). Speech is a draft for the Nigerian reader (docs/READER_gist.md); the interface is plain English.
   ====================================================================================================================================== */
const GIST38={v:1,t:0,checkAt:0,retryAt:0,
 WIN:[18.25,22],RETRY_H:10/60,TRIES:2,
 GUESTS:['tunde','nkechi','ada','bassey','oyelaran'],
 // the rail (owner decision 1; the session review, S2): the veranda row's z values tried in order, the places along it (x from, step, count), the
 // engine's companion offsets for the second player, the door (x, inner z, outer z) and the wall's z, the glide's speed (a walk, m/s), and
 // the bench: the seat offset along it and the distances in front tried for the stood-up pair
 RAIL:{Z:[6.4,6.55,6.65],SPAN:[-7.65,0.15,32],OFF:[[0.9,0],[-0.9,0],[1.35,0],[-1.35,0]],DOOR:[-4.1,5.05,6.35],WALL:5.85,SPEED:3.4,SEAT:0.36,FRONT:[0.55,0.45,0.65]},
 MATCH:['setout','live','goal','restart','motor','waiting','ended'],
 CODE:{tunde:'tu',nkechi:'nk',ada:'ad',bassey:'ba',oyelaran:'oy'},
 visit:null,tries:{},seen:0,
 flags:(typeof FOUND38!=='undefined'&&FOUND38&&FOUND38.flags)||{now:false,playtest:false,value:null},
 LINES:{
  // greetings, four each (Ada's fourth only with her bench placed)
  o:{tunde:[['gs38-tu-o1','Good evening o. I was passing, which is my way of saying I came on purpose.'],['gs38-tu-o2','Evening. I have brought nothing, but I have brought news, which is lighter.'],
    ['gs38-tu-o3','I will lean on your rail, if the rail agrees. It is a serious rail.'],['gs38-tu-o4','Good evening. The compound is too quiet, so somebody has to bring small noise.']],
   nkechi:[['gs38-nk-o1','Good evening, my dear. The shop can mind itself for ten minutes.'],['gs38-nk-o2','Ehen, you are home. Good. I have gist, and gist does not keep.'],
    ['gs38-nk-o3','My dear, I cannot stay long. That is what I always say. Then I stay.'],['gs38-nk-o4','Good evening o. You look tired in the good way. You have been working.']],
   ada:[['gs38-ad-o1','Evening. My hands smell of sawdust and I have stopped apologising for it.'],['gs38-ad-o2','I was going to work late. Then I thought, no. Gist first, wood after.'],
    ['gs38-ad-o3','Good evening. I will not keep you long. I say that every time.'],['gs38-ad-o4','Evening. I came to see if the bench is still standing. It is. Of course it is.','bench']],
   bassey:[['gs38-ba-o1','Good evening, my friend. The light is nearly gone, which is the best time for talking.'],['gs38-ba-o2','Good evening. I took no photographs today, so I have energy for conversation.'],
    ['gs38-ba-o3','Evening, evening. I was told there was gist here. I came to check the facts.'],['gs38-ba-o4','Good evening. Your veranda faces the right way. I noticed that the first day.']],
   oyelaran:[['gs38-oy-o1','Good evening. I said ten minutes upstairs. Let us see what happens down here.'],['gs38-oy-o2','Good evening. My radio is resting, so I came to hear people instead.'],
    ['gs38-oy-o3','Evening. Listen once, I will not repeat it: the noticeboard is not for selling cars.'],['gs38-oy-o4','Good evening. Ten-thirty, I go up. Until then, gist.']]},
  // one-time openers (each replaces that neighbour's greeting once, ever)
  once:{nkFirst:['nkechi','gs38-nk-first','Last time we only came to greet you. Tonight I have gist.'],
   tuSoon:['tunde','gs38-tu-soon','We said we would do it again soon. This is soon.'],
   adShelf:['ada','gs38-ad-shelf','The shelf is level. I checked it twice. Then I checked it again, because it is me.']},
  // on EVENING35.copy.fallback for the visit only (the engine's own copy covers only Tunde, Mama Nkechi and Ada)
  fallback:{bassey:'Good evening, my friend. I came for the conversation.',oyelaran:'Good evening. I will not stay long.'},
  // lost things, all about tomorrow, from the owner's own plans or told to the owner's face (§13.2)
  lost:{chisel:['tunde','gs38-lost-chisel','Ada is carving by the rocks tomorrow. Every time she works out there, a tool walks away. Look down after midday.'],
   adapter:['tunde','gs38-lost-adapter','I am doing the sound by the stage tomorrow. If a small black plug goes missing, it is mine. It is called an adapter. It has a family.'],
   lenscap:['nkechi','gs38-lost-lenscap','Mr. Bassey is photographing the water tomorrow afternoon. Watch. By evening he will be looking for the cap of his camera.'],
   wrapper:['oyelaran','gs38-lost-wrapper','I am washing tomorrow, and the wind is coming. If a blue wrapper goes over the wall, it is mine. You did not see it.'],
   rule:['ada','gs38-lost-rule','I am measuring stalls on Market Road tomorrow. I will put my folding rule down somewhere. I always do. If you find it, it is mine.'],
   seeds:['nkechi','gs38-lost-seeds','Tunde is taking his scent-leaf seed to the square garden tomorrow. He carries a packet like a man carrying a bird. It will fly.']},
  back:{chisel:['gs38-back-chisel','Tools do not walk. The rocks take them. It is different.'],
   lenscap:['gs38-back-lenscap','Thirty-one years and I have never lost a lens cap. I will be very careful. Probably.'],
   seeds:['gs38-back-seeds','It will not fly. I have a system. The system is my pocket.']},
  // a thing out now, told at most once before ({Area} is the thing's spoken place, FOUND38.LOST[].say)
  remind:['gs38-lost-r','Nobody has found {owner}’s {thing} yet. {Area}, still.'],
  remindGlasses:['gs38-lost-glasses','Mama Nkechi is reading prices from across the road again. Her glasses are somewhere on the waterfront sand.'],
  backR:{nkechi:['gs38-back-r-nkechi','I can see perfectly well. From across the road.'],ada:['gs38-back-r-ada','It is not lost. It is resting.'],
   tunde:['gs38-back-r-tunde','It is fine. I am fine. Everything is fine.'],bassey:['gs38-back-r-bassey','I know where it is. Approximately.'],
   oyelaran:['gs38-back-r-oyelaran','I said it was mine. I did not say I would go into the street for it.']},
  // the thing in your pocket (never said by its owner, who is not invited)
  pocket:['gs38-pocket','That {thing} you picked up? {Owner}’s. {Where}.'],
  where:{nkechi:'She is at her shop all day',ada:'She is at the Makers’ Yard by day, and in the courtyard after six',tunde:'He is at the Yard in the morning and the courtyard after',
   bassey:'He is on the waterfront in the afternoons',oyelaran:'She is in the courtyard in the mornings and evenings'},
  // speech words for the things (possessive: "Ada’s chisel"; pocket: "That chisel you picked up?")
  thing:{glasses:'glasses',chisel:'chisel',adapter:'adapter',lenscap:'lens cap',wrapper:'wrapper',rule:'folding rule',seeds:'seeds'},
  pocketThing:{glasses:'pair of glasses',chisel:'chisel',adapter:'adapter',lenscap:'lens cap',wrapper:'blue wrapper',rule:'folding rule',seeds:'packet of seed'},
  // tomorrow is a wash day: high water in the night leaves shells at the water's edge (13:30 to 15:30)
  wash:{tunde:['gs38-wash-tu','The lagoon is coming up tonight. Tomorrow it leaves shells on the sand. Free things. My favourite price.'],
   nkechi:['gs38-wash-nk','Big water tonight. When it goes back after midday tomorrow, the edge will be full of shells.'],
   adaCowrie:['gs38-wash-ad-cowrie','High water tonight. Tomorrow after midday, look along the edge. People find cowries there. I have one. I am not giving it to you.'],
   ada:['gs38-wash-ad','High water tonight. Tomorrow after midday, look along the edge. The lagoon always leaves something.'],
   bassey:['gs38-wash-ba','The water comes up high tonight. Tomorrow afternoon it leaves shells along the edge. I photographed that in 1979. It has not changed.'],
   oyelaran:['gs38-wash-oy','High water tonight. Tomorrow afternoon, shells along the water’s edge. Mind your shoes.']},
  // the line about today: a return retold (by a guest who is not the owner), or what the household did (§6.5)
  told:{glasses:['gs38-told-glasses','Mama Nkechi is telling every customer about her glasses. Some of them came only to hear it.'],
   chisel:['gs38-told-chisel','Ada told the whole Yard you found her chisel. I have heard it twice.'],
   adapter:['gs38-told-adapter','Tunde says you saved a wedding. I asked which one. He says all of them.'],
   lenscap:['gs38-told-lenscap','Mr. Bassey says you have a photographer’s eye for small things. From him, that is a medal.'],
   wrapper:['gs38-told-wrapper','Mrs. Oyelaran says she thanked you once and that is enough. Then she told me about it three times.'],
   rule:['gs38-told-rule','Ada says her rule came back because she measures twice. I say it came back because of you.'],
   seeds:['gs38-told-seeds','Tunde planted the scent leaf already. He talks to it. He says it is your fault.']},
  today:{catch:['gs38-today-catch','I saw you two at the rocks half the afternoon. The fish must be tired.'],
   shells:['gs38-today-shells','You have been walking the beach, I hear. Bring me a small one.'],
   harvest:['gs38-today-harvest','Your pepper pot is doing better than mine. I will not say more.']},
  // line 5 when there is no answer-back (two each)
  react:{tunde:[['gs38-re-tu1','Na wa. And nobody told me first? I live here.'],['gs38-re-tu2','I will pretend I knew that already.']],
   nkechi:[['gs38-re-nk1','Na true? Ehen. Now everybody knows.'],['gs38-re-nk2','You see? The compound tells you everything if you stand still long enough.']],
   ada:[['gs38-re-ad1','Hm. That is useful, sha.'],['gs38-re-ad2','I heard that too. Not from you. Go on.']],
   bassey:[['gs38-re-ba1','Have you heard? Now I have heard.'],['gs38-re-ba2','I am making a note. A mental note. The camera is resting.']],
   oyelaran:[['gs38-re-oy1','I will put it on the noticeboard. In small letters.'],['gs38-re-oy2','Listen to that. Once is enough.']]},
  // line 4 when there is nothing to tell (the first draft's running jokes, and one more each, new in this build, for the reader)
  plain:{tunde:[['gs38-pl-tu1','Mama Nkechi says I owe her for sugar. I paid. She says show me. Who keeps receipts for sugar?'],['gs38-pl-tu2','Somebody has been watering my scent leaf at night. I have asked everybody. Nobody will confess. I am touched.']],
   nkechi:[['gs38-pl-nk1','Tunde says he paid me. He paid me in compliments. I cannot buy oil with compliments.'],['gs38-pl-nk2','Somebody asked me when the café is opening. I said: when I finish frying.']],
   ada:[['gs38-pl-ad1','I have made the same stool nine times. The tenth will be right. Or I will make an eleventh.'],['gs38-pl-ad2','A man asked me for a table that folds into a chair. I said yes. Now I must think.']],
   bassey:[['gs38-pl-ba1','I once photographed a wedding where the groom came late by boat. Nobody minded. It was a good boat.'],['gs38-pl-ba2','The keke man waved at me today. In my time we waved at the boats.']],
   oyelaran:[['gs38-pl-oy1','Somebody keeps leaving an extension box on the stairs. I will not say who. Tunde.'],['gs38-pl-oy2','My radio says rain tomorrow. My knees say no rain. I trust my knees.']]},
  // line 7 (three each)
  bye:{tunde:[['gs38-by-tu1','Right. I have said too much, which is the right amount.'],['gs38-by-tu2','New compound rule: gist ends when the mosquitoes vote. They have voted.'],['gs38-by-tu3','Let me be going. My plants worry when I am out late.']],
   nkechi:[['gs38-by-nk1','Let me be going, my dear. Sleep well. Greet your house.'],['gs38-by-nk2','I am going. I said that already. This time I mean it.'],['gs38-by-nk3','That is enough gist for one night. Leave some for tomorrow.']],
   ada:[['gs38-by-ad1','Good night. I have a leg to finish. A chair leg.'],['gs38-by-ad2','Good night, sha. Do not sit up too late.'],['gs38-by-ad3','I am going before I start talking about wood. Too late. Good night.']],
   bassey:[['gs38-by-ba1','Good night, my friend. Mind the light tomorrow.'],['gs38-by-ba2','Let me go before I start telling you about my old cameras.'],['gs38-by-ba3','Good night. That was a good evening. I would print it.']],
   oyelaran:[['gs38-by-oy1','Ten-thirty. I go up. Good night.'],['gs38-by-oy2','My radio is waiting. Good night o.'],['gs38-by-oy3','Good night. Keep your door shut against the mosquitoes.']]}},
 // interface copy (plain English)
 UI:{ehen:'Ehen?',gate:'{a} and {b} are at the gate.',gate2:'{b} is at the gate.',memory:'The first evening of gist at the rail.',
  nudge:'The neighbours are coming by your veranda for gist tonight. Be home before ten.',
  benchOffer:'Wait here until the neighbours come',benchSub:'Evening gist at the rail',
  kicker:'WHAT THE COMPOUND IS SAYING',pocketUntold:'In your pocket: {long}. {hint}',pocketKnown:'In your pocket: {owner}’s {thing}. {where}',
  hint:{nkechi:'Somebody at the shops will know.',ada:'Somebody at the Makers’ Yard will know.',tunde:'Whoever keeps a garden will know.',bassey:'Somebody on the waterfront will know.',oyelaran:'Somebody in the courtyard will know.'},
  heard:'Heard last night: ',heardBefore:'Heard the other night: ',
  heardLost:{chisel:'Ada is carving by the rocks today, and her tools have a way of walking off.',adapter:'Tunde is doing the sound by the square’s stage today. Look out for a small black plug.',
   lenscap:'Mr. Bassey is out on the waterfront this afternoon, and his lens cap never stays on long.',wrapper:'Mrs. Oyelaran is washing today. A blue wrapper may go over the wall into the street, west of the gate.',
   rule:'Ada is measuring stalls on Market Road today. Her folding rule may stay behind.',seeds:'Tunde is taking scent-leaf seed to the square’s garden bed today. Watch for a packet.'},
  heardStill:'Still lying out, as you heard: {owner}’s {thing}, {area}.',heardWash:'shells at the water’s edge after midday.',
  saidYesterday:'{who} said yesterday: ',saidBefore:'{who} said the other day: ',
  evening:'This evening: the neighbours come by from a quarter past six.',wait:'Wait until then',
  shelfCount:'Your shelf: {have} of {of}.',shelfCarve:'Ada’s carvings: {have} of {of}.',shelfDone:{keepsake:'Keepsakes: Complete.',shells:'Shells: Complete.',carve:'Carvings: Complete.'},shelfSee:'See your shelf',shelfAsk:'Ask Ada',
  recapKicker:'TONIGHT’S GIST',
  // the night page after a gist: in place of the base's "The compound was quiet." (the culture and session reviews)
  nightGist:'{a} and {b} stood at the rail with you until the mosquitoes won.',nightQuiet:'The compound was quiet.',
  recapLost:{chisel:'Tunde says Ada will lose a tool by the rocks tomorrow.',adapter:'Tunde says his adapter may go missing by the square’s stage tomorrow.',
   lenscap:'Mama Nkechi says Mr. Bassey will lose his lens cap on the waterfront tomorrow.',wrapper:'Mrs. Oyelaran says a blue wrapper may blow into the street west of the gate tomorrow.',
   rule:'Ada says she will put her folding rule down somewhere on Market Road tomorrow.',seeds:'Mama Nkechi says Tunde will lose his scent-leaf seed by the square’s garden bed tomorrow.'},
  recapRemind:'Nobody has found {owner}’s {thing} yet.',recapPocket:'The {thing} is {owner}’s, says {teller}.',recapWash:'Shells at the water’s edge after midday tomorrow.'}};

/* ======================================================================================================================================
   2. Small helpers (all guarded: in the verify-lines, verify-log and verify-tune subsets EVENING35, LOG35 and others are undeclared)
   ====================================================================================================================================== */
function gistEve38(){return typeof EVENING35!=='undefined'&&EVENING35?EVENING35:null;}
function gistOnline38(){return typeof online34==='function'?online34():(typeof NET!=='undefined'&&!!NET.on);}
function gistName38(k){return typeof CAST!=='undefined'&&CAST[k]?CAST[k].name:k;}
function gistFill38(t,v){return String(t).replace(/\{(\w+)\}/g,(m,k)=>v[k]!=null?v[k]:m);}
function gistCap38(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1);}
function gistLog38(k,a){try{if(typeof LOG35!=='undefined'&&LOG35&&typeof LOG35.add==='function')LOG35.add(k,a);}catch(e){}}
function gistCount38(day,k){try{return typeof LOG35!=='undefined'&&LOG35&&typeof LOG35.count==='function'?LOG35.count(day,k)|0:0;}catch(e){return 0;}}
function gistSaveG38(){return typeof gistSave38==='function'?gistSave38():null;}
function gistFound38(){return typeof found38Today==='function'&&typeof found38Tomorrow==='function';}
function gistItem38(id){return typeof FOUND38!=='undefined'&&FOUND38?FOUND38.LOST.find(x=>x.id===id)||null:null;}
function gistHashS38(s){let h=2166136261>>>0;s=String(s);for(let k=0;k<s.length;k++){h^=s.charCodeAt(k);h=Math.imul(h,16777619)>>>0;}return h;}
function gistHash38(){return typeof hash38==='function'?hash38.apply(null,arguments):0;}
// the evening window, or the ?gist=now flag's (07:30 to 22:00)
function gistWin38(){return GIST38.flags&&GIST38.flags.now?[7.5,GIST38.WIN[1]]:GIST38.WIN;}
function gistSeenToday38(){const G=S&&S.life&&S.life.gist38;return GIST38.seen===S.day||!!(G&&G.eve&&G.eve.day===S.day);}
function gistTries38(){return GIST38.tries[S.day]|0;}
function gistHome38(){try{return typeof home34==='function'&&home34();}catch(e){return false;}}
function gistPanel38(){try{return typeof overlayOpen==='function'&&overlayOpen();}catch(e){return false;}}
function gistParty38(){return !!(S.party&&S.party.on&&!S.party.done);}
// football is quiet: no match on, and on a day a match was played not before football's own call-in time (18:20), so the guests arrive after
// the children are called in; a household that did not play today gets its gist from 18:15
function gistFootballQuiet38(){if(typeof FOOTBALL37==='undefined'||!FOOTBALL37)return true;const F=FOOTBALL37;if(GIST38.MATCH.includes(F.state))return false;
 let played=false;try{played=typeof fbPlayedToday37==='function'&&!!fbPlayedToday37();}catch(e){}
 const call=F.HOURS&&typeof F.HOURS.call==='number'?F.HOURS.call:18+20/60;return !(played&&S.time<call-1e-9);}

/* ======================================================================================================================================
   3. When a gist comes (spec §5.1)
   ====================================================================================================================================== */
// due tonight: everything but the time, home and what holds it back (the Today card's evening row, the bench offer)
function gistDueTonight38(){const E=gistEve38();if(!E||typeof S==='undefined'||!S||!S.p||S.phase!=='play'||typeof players==='undefined'||!players.length)return false;
 if(gistOnline38()||(typeof silentMode==='function'&&silentMode()))return false;
 if(!(typeof E.done==='function'&&E.done()&&S.life&&S.life.evening35&&S.life.evening35.doneDay<S.day))return false;     // the v35 evening on an earlier day
 if(gistSeenToday38()||gistTries38()>=GIST38.TRIES)return false;return true;}
function gistDue38(){const E=gistEve38();if(!E||E.state!=='idle')return false;const w=gistWin38();if(!(S.time>=w[0]&&S.time<w[1]))return false;
 if(!gistDueTonight38())return false;
 if(gistPanel38()||gistParty38()||(S.roof&&S.roof.on)||(typeof sofa!=='undefined'&&sofa&&sofa.carrying))return false;
 if(typeof benchBusy36==='function'&&benchBusy36())return false;
 if(!gistFootballQuiet38())return false;
 if(GIST38.t<GIST38.retryAt)return false;
 return gistHome38();}

/* ======================================================================================================================================
   4. The tip engine, pure (spec §6): guests, tips and the script from the save, the day and the finds' own cycles
   ====================================================================================================================================== */
// the first line of a category not yet said, from a day-hashed start (all said: start again)
function gistPick38(G,cat,list,day){const n=list.length;if(!n)return null;const said=(G&&G.said&&Array.isArray(G.said[cat]))?G.said[cat]:[];
 const s0=gistHash38(day,gistHashS38(cat)%100000)%n;for(let j=0;j<n;j++){const e=list[(s0+j)%n];if(!said.includes(e[0]))return e;}return list[s0];}
function gistBenchPlaced38(){try{return typeof benchItem36==='function'&&!!benchItem36();}catch(e){return false;}}
function gistAdaVisiting38(){return !!(S.life&&S.life.visit&&S.life.visit.day===S.day&&S.life.visit.k==='ada');}
function gistPlan38(){const L=GIST38.LINES,G=gistSaveG38(),day=S.day,first=!(G&&G.eve&&(G.eve.n|0)>0);
 const Td=gistFound38()?found38Today():{lost:null,pocket:null,wash:false},Tm=gistFound38()?found38Tomorrow():{lost:null,pocket:null,wash:false};
 const pocketOwner=Td.pocket?Td.pocket.owner:null;
 // 1-2. the candidate tips: lost (new tomorrow, or a reminder for a thing out now told at most once), else pocket; then the wash
 let t1=null,t2=null;const nl=Tm.lost;
 if(nl&&nl.isNew&&L.lost[nl.id])t1={kind:'lost',arg:nl.id,owner:nl.owner,teller:L.lost[nl.id][0],mode:'new'};
 else if(Td.lost&&Td.lost.status==='out'&&(Td.lost.told|0)<=1)t1={kind:'lost',arg:Td.lost.id,owner:Td.lost.owner,teller:null,mode:'remind'};
 else if(Td.pocket&&!Td.pocket.known)t1={kind:'pocket',arg:Td.pocket.id,owner:Td.pocket.owner,teller:null,mode:null};
 const washTomorrow=Tm.wash;
 if(washTomorrow){const w={kind:'wash',arg:'wash',owner:null,teller:null,mode:null};if(t1)t2=w;else t1=w;}
 const plain=!t1;if(plain)t1={kind:'plain',arg:'plain',owner:null,teller:null,mode:null};
 // 3-4. the guests (the pocket owner never comes; the same pair never two nights running)
 const excl=pocketOwner?[pocketOwner]:[];const last=G&&G.last&&G.last.day===day-1?G.last.guests:null;
 const rota=(seed,out,fixed)=>{let list=GIST38.GUESTS.filter(k=>!out.includes(k));
  if(fixed&&last&&last.includes(fixed)){const rep=last.find(k=>k!==fixed);const l2=list.filter(k=>k!==rep);if(l2.length)list=l2;}
  return list.length?list[gistHash38(day,seed)%list.length]:null;};
 let A=null,B=null,teller=null;const own=t1.kind==='lost'?t1.owner:null;
 if(first&&!excl.includes('nkechi')){A='nkechi';
  if(t1.teller){if(t1.teller!==A){B=t1.teller;teller=B;}else{teller=A;B=own&&own!==A?own:rota(7,[A].concat(excl),A);}}
  else if(t1.kind==='lost'){if(own===A){B=rota(7,[A].concat(excl),A);teller=B;}else{B=own;teller=A;}}
  else{B=rota(7,[A].concat(excl),A);teller=B;}}
 else if(t1.teller){A=t1.teller;teller=A;B=own&&own!==A?own:rota(7,[A].concat(excl),A);}
 else if(t1.kind==='lost'){B=own;A=rota(11,[own].concat(excl),B);teller=A;}
 else{A=rota(11,excl,null);B=rota(7,[A].concat(excl),A);teller=A;}
 t1.teller=teller;const other=teller===A?B:A;
 const answer=t1.kind==='lost'&&own&&own!==teller&&other===own?other:null;
 if(t2)t2.teller=B!==answer?B:A;
 // 5-6. the script (§5.5): at most seven lines
 const script=[],once=(G&&G.once)||{};
 const open=(who)=>{
  if(who==='nkechi'&&!once.nkFirst)return {k:who,id:L.once.nkFirst[1],text:L.once.nkFirst[2],open:1,once:'nkFirst'};
  if(who==='tunde'&&!once.tuSoon)return {k:who,id:L.once.tuSoon[1],text:L.once.tuSoon[2],open:1,once:'tuSoon'};
  if(who==='ada'&&!once.adShelf&&G&&G.shelf&&G.shelf.state==='up')return {k:who,id:L.once.adShelf[1],text:L.once.adShelf[2],open:1,once:'adShelf'};
  const list=L.o[who].filter(e=>e[2]!=='bench'||gistBenchPlaced38());const e=gistPick38(G,'o:'+who,list,day);return {k:who,id:e[0],text:e[1],open:1,cat:'o:'+who};};
 script.push(open(A),open(B));
 // the line about today, by the guest who does not tell tip 1
 const td=gistToday38(G,day,other);if(td)script.push(td);
 // tip 1 (or plain gist)
 const it=t1.kind==='lost'||t1.kind==='pocket'?gistItem38(t1.arg):null,thing=it?L.thing[it.id]:'';
 if(t1.kind==='lost'&&t1.mode==='new'){const e=L.lost[t1.arg];script.push({k:teller,id:e[1],text:e[2],tip:1});}
 else if(t1.kind==='lost'){const g=t1.arg==='glasses'&&!(Td.lost.told|0);const text=g?L.remindGlasses[1]:gistFill38(L.remind[1],{owner:gistName38(own),thing,Area:gistCap38(it?(it.say||it.area):'')});
  script.push({k:teller,id:g?L.remindGlasses[0]:L.remind[0],text,tip:1});}
 else if(t1.kind==='pocket'){const text=gistFill38(L.pocket[1],{thing:L.pocketThing[it.id],Owner:gistName38(t1.owner),Where:L.where[t1.owner]});script.push({k:teller,id:L.pocket[0],text,tip:1});}
 else if(t1.kind==='wash')script.push(gistWashLine38(teller));
 else{const e=gistPick38(G,'pl:'+teller,L.plain[teller],day);script.push({k:teller,id:e[0],text:e[1],cat:'pl:'+teller});}
 // the owner's answer-back, or a reaction (none when the same guest tells the wash next)
 if(answer){const e=t1.mode==='new'?L.back[t1.arg]:L.backR[answer];if(e)script.push({k:answer,id:e[0],text:e[1]});}
 else if(!(t2&&t2.teller===other)){const e=gistPick38(G,'re:'+other,L.react[other],day);script.push({k:other,id:e[0],text:e[1],cat:'re:'+other});}
 // tip 2 (the wash)
 if(t2)script.push(gistWashLine38(t2.teller));
 // Ada names tomorrow's fish to carve, when she is a guest and may ask (found-v38.js; engineer C): before the goodbye
 if((A==='ada'||B==='ada')&&typeof found38AskLine==='function'&&G){const a=found38AskLine(G,'gist');if(a)script.push({k:'ada',id:a.id,text:a.text,carve:a.fish,carveDay:a.day});}
 // goodbye
 const e=gistPick38(G,'by:'+A,L.bye[A],day);script.push({k:A,id:e[0],text:e[1],cat:'by:'+A});
 const visiting=gistAdaVisiting38()&&(A==='ada'||B==='ada');
 const gate=gistFill38(GIST38.UI.gate,{a:gistName38(A),b:gistName38(B)}),gate2=visiting?gistFill38(GIST38.UI.gate2,{b:gistName38(A==='ada'?B:A)}):gate;
 const tips=(plain?[]:[t1]).concat(t2?[t2]:[]).map(t=>({kind:t.kind,arg:t.arg,teller:t.teller,owner:t.owner,mode:t.mode}));
 return {day,first,guests:[A,B],tips,script,gate,gate2};}
function gistWashLine38(who){const L=GIST38.LINES,G=gistSaveG38();let e=L.wash[who];
 if(who==='ada'&&!(G&&G.keep&&Array.isArray(G.keep.shells)&&G.keep.shells.includes('cowrie')))e=L.wash.adaCowrie;return {k:who,id:e[0],text:e[1],tip:1};}
// line 3: a return today retold (each thing once), else three catches, three shells or a harvest today (each at most once in any three gists)
function gistToday38(G,day,who){const L=GIST38.LINES,said=(G&&G.said)||{},n=((G&&G.eve&&G.eve.n)|0)+1;
 const ret=typeof found38Returned==='function'?found38Returned(day):[];const toldSaid=Array.isArray(said.told)?said.told:[];
 for(const id of ret){const it=gistItem38(id);if(!it||it.owner===who||toldSaid.includes(id)||!L.told[id])continue;return {k:who,id:L.told[id][0],text:L.told[id][1],today:'told:'+id};}
 const recent=Array.isArray(said.today)?said.today:[];const ok=k=>!recent.some(r=>r&&r.k===k&&n-(r.n|0)<3);
 if(gistCount38(day,'catch')>=3&&ok('catch'))return {k:who,id:L.today.catch[0],text:L.today.catch[1],today:'catch'};
 if(gistCount38(day,'shell')>=3&&ok('shells'))return {k:who,id:L.today.shells[0],text:L.today.shells[1],today:'shells'};
 if(gistCount38(day,'harvest')>=1&&ok('harvest'))return {k:who,id:L.today.harvest[0],text:L.today.harvest[1],today:'harvest'};
 return null;}

/* ======================================================================================================================================
   5. The visit on the v35 engine (spec §5.2-§5.9; ported from the critic's prototype, critic/scripts/dbg4.js)
   ====================================================================================================================================== */
// a pair seated on Ada's bench stand up to greet the neighbours, with the bench's own "Stand up" (no panel is open when a gist starts), and
// then stand in front of the bench on the veranda side, each in front of the seat they had (the session review, S2: the bench's own stand-up
// puts them back where they sat down from, which can be inside the room)
function gistStandUp38(){try{if(typeof BENCH36!=='undefined'&&BENCH36&&BENCH36.state==='seated'&&typeof bench36StandUp==='function'){const seated=players.filter(p=>p&&p.g&&p.g.sitting).map(p=>p.i);
   bench36StandUp();if(typeof benchStoodUp36==='function')benchStoodUp36();gistBenchFront38(seated);return true;}}catch(e){}return false;}
function gistBenchFront38(seated){const it=typeof benchItem36==='function'?benchItem36():null;if(!it||typeof benchPoseOf36!=='function')return;const P=benchPoseOf36(it.pose36),R=GIST38.RAIL;
 const ax=[Math.cos(P.yaw),-Math.sin(P.yaw)],fw=[Math.sin(P.yaw),Math.cos(P.yaw)],side=fw[1]>=0?1:-1,taken=[];      // the side towards the rail (south)
 const ok=(x,z)=>gistRailOK38(x,z,seated)&&taken.every(q=>Math.hypot(q[0]-x,q[1]-z)>=0.6);
 for(const i of seated){const p=players[i];if(!p||gistIsAI38(i))continue;const sx=P.x+ax[0]*(i===0?-1:1)*R.SEAT,sz=P.z+ax[1]*(i===0?-1:1)*R.SEAT;let at=null;
  // straight in front of the seat when there is room between the bench and the rail; else the nearest free place on the veranda row
  for(const d of R.FRONT){const x=sx+fw[0]*d*side,z=sz+fw[1]*d*side;if(ok(x,z)){at=[x,z];break;}}
  if(!at){let best=null,bd=1e9;for(const z of R.Z)for(let k=-20;k<=20;k++){const x=sx+k*0.15,dd=Math.hypot(x-sx,z-sz);if(dd<bd&&ok(x,z)){bd=dd;best=[x,z];}}at=best;}
  if(at){gistPlace38(p,at[0],at[1],0,1);taken.push(at);}}}
// owner decision 1, everyone stands at the rail (the session review, S2): when the guests reach the rail, each local household player who is in
// the flat or on the veranda goes to a free spot on the veranda row by the rail, with a short glide (by the door from inside the room), not a
// cut. The first player's spot is where the guests were placed from (pickSpots' rule: the player's x when they came, kept between -7.4 and
// -3.0); the other's is the first free one of the places the engine gives the companion beside a player on the veranda (0.9 m east, west, then
// 1.35 m). A player out in the compound is not moved: the gist behaves for them as the v35 evening does. A companion household's companion is
// the engine's (it follows its human).
function gistIsAI38(i){return typeof AI!=='undefined'&&!!AI.on&&i===AI.i;}
// a standing spot: free of walls and furniture, in the flat's bounds on the veranda row, and clear of every player not in skip
function gistRailOK38(x,z,skip){if(typeof blocked!=='function'||blocked(x,z,PR)||!inFlat(x,z)||z<=6.05)return false;
 for(const p of players){if(!p||skip.includes(p.i))continue;if(Math.hypot(p.g.position.x-x,p.g.position.z-z)<0.75)return false;}return true;}
function gistPlace38(p,x,z,fx,fz){p.g.position.set(x,0,z);p.prev=[x,z];p.y=0;p.lvl=0;p.g.baseY=0;if(fx||fz){p.face=[fx,fz];p.g.rotation.y=Math.atan2(fx,fz);}}
function gistHomePlayers38(){return players.filter(p=>p&&!gistIsAI38(p.i)&&(p.y||0)<=1&&inFlat(p.g.position.x,p.g.position.z));}
// the rail spots for the players at home: {index: [x, z]}
function gistRailSpots38(v){const R=GIST38.RAIL,out={},home=gistHomePlayers38();if(!home.length)return out;const skip=home.map(p=>p.i),taken=[];
 const free=(x,z)=>gistRailOK38(x,z,skip)&&taken.every(q=>Math.hypot(q[0]-x,q[1]-z)>=0.85);
 let first=home[0];for(const p of home)if(p.i===v.hi){first=p;break;}
 // the nearest free place on the veranda row to x (the rows of R.Z in turn), or null
 const near=x=>{for(const z of R.Z){let best=null,bd=1e9;for(let k=0;k<=R.SPAN[2];k++){const xx=R.SPAN[0]+k*R.SPAN[1],dd=Math.abs(xx-x);if(dd<bd&&free(xx,z)){bd=dd;best=[xx,z];}}if(best)return best;}return null;};
 const a=near(v.ax);if(!a)return out;out[first.i]=a;taken.push(a);
 for(const p of home){if(p===first)continue;let b=null;for(const z of R.Z){for(const o of R.OFF)if(free(a[0]+o[0],z)){b=[a[0]+o[0],z];break;}if(b)break;}if(!b)b=near(a[0]);if(b){out[p.i]=b;taken.push(b);}}
 return out;}
function gistGlideStart38(v){const R=GIST38.RAIL;v.glide={};if(!gistHomePlayers38().length)return;
 if(typeof SEATING30!=='undefined'&&SEATING30.active&&typeof sitStop==='function'){try{sitStop();}catch(e){}}      // off the sofa first
 const sp=gistRailSpots38(v);
 for(const k in sp){const p=players[k],t=sp[k];if(!p)continue;const x=p.g.position.x,z=p.g.position.z;if(Math.hypot(t[0]-x,t[1]-z)<0.05)continue;
  v.glide[k]={path:z<R.WALL?[[R.DOOR[0],R.DOOR[1]],[R.DOOR[0],R.DOOR[2]],t]:[t],n:0};}}
function gistGlideFrame38(v,dt){const R=GIST38.RAIL;if(!v.glide)return;for(const k in v.glide){const p=players[k],G=v.glide[k];if(!p){delete v.glide[k];continue;}
  let step=R.SPEED*Math.max(0,Math.min(+dt||0,0.1)),x=p.g.position.x,z=p.g.position.z,fx=0,fz=0;
  while(step>0&&G.n<G.path.length){const t=G.path[G.n],dx=t[0]-x,dz=t[1]-z,d=Math.hypot(dx,dz);if(d>1e-6){fx=dx/d;fz=dz/d;}if(d<=step){x=t[0];z=t[1];step-=d;G.n++;}else{x+=dx/d*step;z+=dz/d*step;step=0;}}
  gistPlace38(p,x,z,fx,fz);if(G.n>=G.path.length){gistPlace38(p,x,z,0,1);delete v.glide[k];}}}
function gistStart38(){const E=gistEve38();if(!E)return false;const plan=gistPlan38(),fb=E.copy.fallback;
 const v={day:S.day,guests:plan.guests.slice(),script:plan.script,tips:plan.tips,first:plan.first,phase:'arriving',
  saved:{guests:E.guests.slice(),gate:E.copy.gate,gate2:E.copy.gate2,fallback:{bassey:fb.bassey,oyelaran:fb.oyelaran},hasFb:{bassey:'bassey' in fb,oyelaran:'oyelaran' in fb}}};
 gistStandUp38();
 // where the guests are placed from (the engine's human and pickSpots' x rule): the rail spots are taken from here when they arrive
 {const h=gistHumanAt38();v.hi=h?h.i:0;v.ax=Math.min(-3.0,Math.max(-7.4,h?h.g.position.x:-4.1));}
 gistBody38(true);
 E.guests=plan.guests.slice();E.copy.gate=plan.gate;E.copy.gate2=plan.gate2;
 fb.bassey=GIST38.LINES.fallback.bassey;fb.oyelaran=GIST38.LINES.fallback.oyelaran;
 GIST38.visit=v;
 let ok=false;try{ok=!!E.start();}catch(e){if(typeof console!=='undefined')console.warn('gist38 start',e);}
 if(!ok){gistRestore38();GIST38.retryAt=GIST38.t+2;return false;}
 return true;}
// put back what the visit swapped (the engine's guests, the gate toasts and the fallback lines)
// the engine's human: a player in the flat first, else the first (AI excluded)
function gistHumanAt38(){let first=null;for(const p of players){if(!p||gistIsAI38(p.i))continue;if(inFlat(p.g.position.x,p.g.position.z))return p;if(!first)first=p;}return first;}
// body.gist38-visit while a visit is live: the prompts give way and, on a short screen, the caption is a low strip (gist-v38.css; S1, S9)
function gistBody38(on){try{if(typeof document!=='undefined'&&document.body&&document.body.classList)document.body.classList.toggle('gist38-visit',!!on);}catch(e){}}
// the gate toast goes when the guests reach the rail (the base's toast otherwise stays its 2.4 s, which a slow frame rate can stretch past the
// arrival)
function gistGateGone38(){try{const t=typeof document!=='undefined'&&document.getElementById('toast');const E=gistEve38();
 if(t&&E&&t.classList&&t.classList.contains('on')&&(t.textContent===E.copy.gate||t.textContent===E.copy.gate2)){t.classList.remove('on');clearTimeout(t._t);}}catch(e){}}
function gistRestore38(){const E=gistEve38(),v=GIST38.visit;if(!v){return;}GIST38.visit=null;gistBody38(false);if(!E)return;const s=v.saved,fb=E.copy.fallback;
 E.guests=s.guests.slice();E.copy.gate=s.gate;E.copy.gate2=s.gate2;
 for(const k of ['bassey','oyelaran']){if(s.hasFb[k])fb[k]=s.fallback[k];else delete fb[k];}}
// once in a save: football's evening line for Mama Nkechi (it would otherwise replace her greeting every evening after a match)
function gistOnce38(k){const G=gistSaveG38();return !!(G&&G.once&&G.once[k]);}
function gistFootballDue38(){const v=GIST38.visit;if(!v||v.first)return false;const G=gistSaveG38();if(!G||G.once.fb37)return false;
 try{if(typeof fbSave37!=='function')return false;const L=fbSave37();if(!L||!L.last||(typeof fbOnline37==='function'&&fbOnline37()))return false;
  if(!(L.last.day===S.day||L.last.day===S.day-1))return false;if(L.eveDay===S.day)return false;return true;}catch(e){return false;}}
// football's evening line for Mama Nkechi (once in a save, never at the first gist) takes the place of the line about today, after the two
// greetings, so she still says good evening (the session review, S10); the line it replaces is not marked said
function gistFootballLine38(who,l){const v=GIST38.visit;if(!v||v.fb37)return;v.fb37=true;const line={k:who,id:l.id,text:l.text,fb37:1};
 const k=v.script.findIndex(x=>x.today);if(k>=0)v.script.splice(k,1,line);else v.script.splice(2,0,line);}
// the caption's button: "Ehen?" while a tip line is on screen (the engine's render resets it to Next on every line)
function gistLabel38(){const E=gistEve38();if(!E||E.state!=='talking'||!E.el)return;const L=E.lines[E.line];if(!L||!L.tip||E.line>=E.lines.length-1)return;
 const h=String(E.el.innerHTML||'');const n=h.replace('class="evening35-next">Next</button>','class="evening35-next">'+GIST38.UI.ehen+'</button>');if(n!==h)E.el.innerHTML=n;}
// a gist has finished (Goodnight): the record, the tips heard, the used lines, the log, the album (the first only), one save
function gistDone38(v){const E=gistEve38();v.phase='done';GIST38.seen=S.day;const G=gistSave38(true);if(!G)return;
 const shown=(E&&Array.isArray(E.lines)?E.lines:[]).map(l=>l.id||null);
 G.eve={day:S.day,n:((G.eve&&G.eve.n)|0)+1,first:(G.eve&&G.eve.first)||S.day};
 G.last={day:S.day,guests:v.guests.slice(),tips:v.tips.map(t=>Object.assign({},t)),ids:shown};
 for(const t of v.tips){const it=gistItem38(t.arg);
  if(t.kind==='lost'&&it&&typeof FOUND38!=='undefined'&&FOUND38.LOST[G.lost.i]===it&&G.lost.status==='out'){G.lost.heard=S.day;G.lost.told=(G.lost.told|0)+1;G.lost.heardMode=t.mode||'new';delete G.lost.heardBy;}
  if(t.kind==='pocket'&&it&&FOUND38.LOST[G.lost.i]===it&&G.lost.status==='pocket')G.lost.ownerTold=S.day;}
 const said=G.said;
 v.script.forEach((s,k)=>{if(s.replaced)return;const id=shown[k];
  if(s.once&&id===s.id)G.once[s.once]=S.day;
  if(s.cat&&id===s.id){const L=GIST38.LINES,list=s.cat.startsWith('o:')?L.o[s.k]:s.cat.startsWith('pl:')?L.plain[s.k]:s.cat.startsWith('re:')?L.react[s.k]:L.bye[s.k];
   let a=Array.isArray(said[s.cat])?said[s.cat]:[];if(a.length>=list.length||list.every(e=>a.includes(e[0])||e[0]===id))a=[];if(!a.includes(id))a.push(id);said[s.cat]=a;}
  if(s.today){if(s.today.startsWith('told:')){const a=Array.isArray(said.told)?said.told:[];a.push(s.today.slice(5));said.told=a;}
   else{const a=Array.isArray(said.today)?said.today.filter(r=>r&&G.eve.n-(r.n|0)<3):[];a.push({k:s.today,n:G.eve.n});said.today=a;}}});
 if(v.fb37)G.once.fb37=S.day;
 // Ada's ask, when its line was shown: the fish she wants tomorrow (engineer C)
 v.script.forEach((s,k)=>{if(s.carve&&shown[k]===s.id&&typeof found38Asked==='function'&&G.ada)found38Asked(G,{fish:s.carve,day:s.carveDay},'gist');});
 const kinds=v.tips.map(t=>t.kind);gistLog38('gist',v.guests.join('+')+':'+(kinds.join('+')||'plain'));
 if(G.eve.n===1){try{remember(GIST38.UI.memory,'moment');}catch(e){}}
 try{if(typeof save==='function')save();}catch(e){}}

// the per-frame step (from the outer EVENING35.tick wrapper): the talking frame, the hand-back, and four times a second the trigger and the nudge
GIST38.step=function(dt,was){const Gs=GIST38;Gs.t+=Math.max(0,+dt||0);const v=Gs.visit;
 if(v){const E=gistEve38();
  if(E&&was==='arriving'&&E.state==='talking'&&v.phase==='arriving'){
   // the first gist line shown: discovery (a first gist), the rest of the script after the engine's one line per guest, the label for line 0
   if(!gistSaveG38())gistSave38(true,'gist');
   for(let k=0;k<E.lines.length&&k<v.script.length;k++){if(v.script[k].tip)E.lines[k].tip=1;}
   for(const s of v.script.slice(E.lines.length))E.lines.push({k:s.k,id:s.id,text:s.text,tip:s.tip?1:0});
   v.phase='talking';gistLabel38();gistGateGone38();gistGlideStart38(v);}
  else if(E&&E.state==='idle'&&(v.phase==='done'||v.phase==='leaving'))gistRestore38();
  if(GIST38.visit===v)gistGlideFrame38(v,dt);
  return;}
 if(Gs.t<Gs.checkAt)return;Gs.checkAt=Gs.t+0.25;
 if(typeof S==='undefined'||!S||!S.p||S.phase!=='play'||typeof players==='undefined'||!players.length)return;
 const w=gistWin38();if(!(S.time>=w[0]&&S.time<w[1]))return;
 if(gistDue38()){gistStart38();return;}
 // the nudge: once per household, after discovery, the first evening a gist is due except that nobody is home
 const G=S.life&&S.life.gist38?gistSaveG38():null;
 if(G&&!G.once.nudge&&S.time>=GIST38.WIN[0]&&!gistHome38()&&!gistPanel38()&&gistDueTonight38()){const E=gistEve38();if(E&&E.state==='idle'){G.once.nudge=S.day;
  try{if(!(typeof silentMode==='function'&&silentMode()))toast(GIST38.UI.nudge);}catch(e){}try{if(typeof save==='function')save();}catch(e){}}}};

/* ======================================================================================================================================
   6. Wrappers on the evening's engine (all by property, inside typeof guards)
   ====================================================================================================================================== */
// the gist's trigger, its talking frame and its hand-back run last, after the evening, football and the finds' step
if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.tick==='function'){
 const prevEveTick38b=EVENING35.tick;EVENING35.tick=function(dt){const was=EVENING35.state;const r=prevEveTick38b.apply(this,arguments);
  try{GIST38.step(dt,was);}catch(e){if(typeof console!=='undefined')console.warn('gist38',e);}return r;};}
// Next on a gist: finish() would mark the v35 evening done, cue it (the day log's "evening"), add its album memory and save; for a gist only
// the caption and the way out stay. Then the "Ehen?" label for the new line.
if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.next==='function'){
 const prevNext38=EVENING35.next;EVENING35.next=function(){const v=GIST38.visit;
  if(!v||EVENING35.state!=='talking')return prevNext38.apply(this,arguments);
  const eve=JSON.stringify(S.life.evening35),c=cue35,m=remember,sv=save;
  cue35=function(name){if(name==='evening')return;return c.apply(this,arguments);};
  remember=function(){};save=function(){};
  let r;try{r=prevNext38.apply(this,arguments);}
  finally{cue35=c;remember=m;save=sv;S.life.evening35=JSON.parse(eve);}
  try{if(EVENING35.state==='leaving'&&v.phase==='talking')gistDone38(v);else gistLabel38();}catch(e){if(typeof console!=='undefined')console.warn('gist38 next',e);}
  return r;};}
// an aborted gist (a new day, entering the world, online, a party, nobody home for 3 s): the swaps go back, nothing is logged or saved, the try
// is counted, and a retry may come after ten game minutes; a second abort ends gists for the day
if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.abort==='function'){
 const prevAbort38=EVENING35.abort;EVENING35.abort=function(){const v=GIST38.visit;const r=prevAbort38.apply(this,arguments);
  if(v){const counted=v.phase==='arriving'||v.phase==='talking';gistRestore38();
   if(counted&&typeof S!=='undefined'&&S){GIST38.tries[S.day]=(GIST38.tries[S.day]|0)+1;GIST38.retryAt=GIST38.t+GIST38.RETRY_H*60;}}
  return r;};}
// the neighbours' lines while a gist visit is live (outermost); a pure pass-through, called once, otherwise
if(typeof line35==='function'){const prevLine38=line35;
 line35=function(who,ctx){const v=GIST38.visit;
  if(!(v&&ctx&&ctx.evening&&gistEve38()&&EVENING35.state!=='idle'))return prevLine38.apply(this,arguments);   // v35, bench and football untouched
  if(who==='nkechi'&&gistFootballDue38()){const l=prevLine38.apply(this,arguments);                               // football's line, at most once per save
   if(l&&l.id==='fb37-nkechi-evening')gistFootballLine38(who,l);}
  const s=v&&v.script.find(x=>x.k===who&&x.open);return s?{id:s.id,text:s.text}:null;};}                         // null: the engine's fallback copy

/* ======================================================================================================================================
   7. The daily loop: Today, the night page, the day log, the bench offer, waiting (spec §5.7, §12)
   ====================================================================================================================================== */
// the rows of Today's card (only what was heard; at most five, four on a narrow screen: the wait row goes first, then the shelf row)
function gistTodayRows38(G){const U=GIST38.UI,L=GIST38.LINES,rows=[];if(!gistFound38())return rows;const Td=found38Today();
 if(Td.pocket){const p=Td.pocket,it=gistItem38(p.id);
  rows.push({k:'pocket',html:esc(p.known?gistFill38(U.pocketKnown,{owner:gistName38(p.owner),thing:L.thing[p.id],where:p.where}):gistFill38(U.pocketUntold,{long:it?it.long:p.long,hint:U.hint[p.owner]||''}))});}
 const lt=G.lost,last=G.last;
 // the lost row (the review's M1): how it was heard is kept with the lost record (heardMode: 'new' or 'remind' from a gist, 'thanks' from a
 // thank-you, with heardBy); "today" is said only on the day the thing comes out after a tip about it; a thing that has lain out since an
 // earlier day is "still lying out, as you heard", with its place
 if(Td.lost&&(lt.heard|0)>0&&S.day>(lt.heard|0)){const it=gistItem38(Td.lost.id);
  const mode=lt.heardMode||(last&&last.day===lt.heard&&last.tips.some(t=>t.kind==='lost'&&t.mode==='remind'&&t.arg===Td.lost.id)?'remind':'new');
  const fresh=mode!=='remind'&&S.day===Td.lost.since&&!!U.heardLost[Td.lost.id],ago=S.day-lt.heard===1;
  const pre=mode==='thanks'&&lt.heardBy?gistFill38(ago?U.saidYesterday:U.saidBefore,{who:gistName38(lt.heardBy)}):(ago?U.heard:U.heardBefore);
  rows.push({k:'lost',html:esc(fresh?pre+U.heardLost[Td.lost.id]:gistFill38(U.heardStill,{owner:gistName38(Td.lost.owner),thing:L.thing[Td.lost.id],area:it?it.area:''}))});}
 if(Td.wash&&last&&last.day===S.day-1&&last.tips.some(t=>t.kind==='wash'))rows.push({k:'wash',html:esc(U.heard+U.heardWash)});
 if(typeof found38CarveRow==='function'){const c=found38CarveRow(G);if(c)rows.push({k:'carve',html:esc(c)});}
 if(gistDueTonight38()&&S.time<GIST38.WIN[0]){const E=gistEve38();const b=gistHome38()&&E&&E.state==='idle'&&!GIST38.visit?btn(esc(U.wait),'gist38Wait',{},'quiet'):'';rows.push({k:'wait',html:esc(U.evening),btn:b});}
 if(typeof found38ShelfCount==='function'){const c=found38ShelfCount(),F=typeof FOUND38!=='undefined'?FOUND38:null;
  if(c&&c.state==='up'){let t=gistFill38(U.shelfCount,{have:c.have,of:c.of});for(const k of ['keepsake','shells'])if(c.complete[k])t+=' '+U.shelfDone[k];
   if(c.carve)t+=' '+(c.complete.carve?U.shelfDone.carve:gistFill38(U.shelfCarve,{have:c.carve[0],of:c.carve[1]}));rows.push({k:'shelf',html:esc(t),btn:btn(esc(U.shelfSee),'gist38ShelfView',{},'quiet')});}
  else if(c&&c.state==='ordered'&&F)rows.push({k:'shelf',html:esc(F.UI.shelfSoon),btn:btn(esc(U.shelfSee),'gist38ShelfView',{},'quiet')});
  else if(c&&F)rows.push({k:'shelf',html:esc(F.UI.shelfNone),btn:btn(esc(U.shelfAsk),'gist38Shelf',{},'quiet')});}
 const cap=(typeof innerWidth==='number'&&innerWidth<=480)?4:5;
 for(const drop of ['wait','shelf','carve']){if(rows.length<=cap)break;const k=rows.findIndex(r=>r.k===drop);if(k>=0)rows.splice(k,1);}
 return rows.slice(0,cap);}
function gistCardHTML38(G){const rows=gistTodayRows38(G);if(!rows.length)return '';
 return `<div class="life-note34 gist38-card"><p class="life-kicker">${esc(GIST38.UI.kicker)}</p>${rows.map(r=>`<p class="gist38-row" data-row="${r.k}">${r.html}</p>${r.btn||''}`).join('')}</div>`;}
// wrap (outermost): Today's card, directly before the chips (after football's card), only after discovery and offline
if(typeof todayHTML34==='function'){const prevToday38=todayHTML34;todayHTML34=function(){const h=prevToday38.apply(this,arguments);
 try{if(typeof h!=='string'||!S||!S.life||!S.life.gist38||gistOnline38())return h;const G=gistSaveG38();if(!G)return h;const at=h.indexOf('<div class="life-chips34">');if(at<0)return h;
  const card=gistCardHTML38(G);return card?h.slice(0,at)+card+h.slice(at):h;}catch(e){if(typeof console!=='undefined')console.warn('gist38 today',e);return h;}};}
// the night page's "Tonight's gist" block: after a gist tonight that told a tip; pure (the same on every call)
function gistRecapHTML38(){const G=S&&S.life&&S.life.gist38?gistSaveG38():null;if(!G||gistOnline38())return '';const last=G.last;if(!last||last.day!==S.day||!last.tips.length)return '';
 const U=GIST38.UI,L=GIST38.LINES,out=[];
 for(const t of last.tips){if(t.kind==='lost'&&t.mode==='new'&&U.recapLost[t.arg])out.push(U.recapLost[t.arg]);
  else if(t.kind==='lost')out.push(gistFill38(U.recapRemind,{owner:gistName38(t.owner),thing:L.thing[t.arg]}));
  else if(t.kind==='pocket')out.push(gistFill38(U.recapPocket,{thing:L.thing[t.arg],owner:gistName38(t.owner),teller:gistName38(t.teller)}));
  else if(t.kind==='wash')out.push(U.recapWash);}
 if(!out.length)return '';return `<div class="recap35 gist38-recap"><p class="recap35-kicker">${esc(U.recapKicker)}</p><p>${esc(out.join(' '))}</p></div>`;}
// after a gist tonight the base's "The compound was quiet." gives way to the two neighbours at the rail (the culture review, C4)
function gistNightQuiet38(h){const G=S&&S.life&&S.life.gist38?gistSaveG38():null;if(!G||gistOnline38()||!G.last||G.last.day!==S.day||!Array.isArray(G.last.guests)||G.last.guests.length<2)return h;
 const U=GIST38.UI;if(h.indexOf(U.nightQuiet)<0)return h;return h.split(U.nightQuiet).join(esc(gistFill38(U.nightGist,{a:gistName38(G.last.guests[0]),b:gistName38(G.last.guests[1])})));}
if(typeof days_night35==='function'){const prevNight38=days_night35;days_night35=function(){let h=prevNight38.apply(this,arguments);
 try{if(typeof h!=='string'||!S||!S.life||!S.life.gist38)return h;h=gistNightQuiet38(h);const add=gistRecapHTML38();if(!add)return h;
  const k=h.indexOf('<p class="recap35-kicker">TOMORROW</p>');let at=-1;if(k>=0){const e=h.indexOf('</div>',k);if(e>=0)at=e+6;}
  if(at<0){const r=h.indexOf('<div class="rate35"');at=r>=0?r:h.indexOf('<div class="actions">');}
  return at>=0?h.slice(0,at)+add+h.slice(at):h+add;}catch(e){return h;}};}
// the day log's six kinds (football's precedent: pushed at load when absent; carve, a fish given to Ada, is engineer C's)
if(typeof LOG35!=='undefined'&&LOG35&&Array.isArray(LOG35.kinds))for(const k of ['gist','find','return','keep','set','carve'])if(!LOG35.kinds.includes(k))LOG35.kinds.push(k);
// sitting on Ada's bench: "Wait here until the neighbours come" (18:15; bench36Wait sends only 18 to the v35 evening's wait)
if(typeof BENCH36!=='undefined'&&BENCH36&&Array.isArray(BENCH36.restOffers))BENCH36.restOffers.push(function(){const E=gistEve38();
 if(!gistSaveG38()||!E||E.state!=='idle'||S.time>=GIST38.WIN[0]||!gistDueTonight38())return null;
 return {label:GIST38.UI.benchOffer,t:GIST38.WIN[0],sub:GIST38.UI.benchSub};});
// Today's "Wait until then": sit until a quarter past six (as the sofa's wait does), when home with no visit on
if(typeof ACTIONS!=='undefined'){ACTIONS.gist38Wait=function(){if(gistHome38()&&S.time<GIST38.WIN[0]&&!GIST38.visit&&typeof ACTIONS.sitwait==='function'){ACTIONS.sitwait({t:GIST38.WIN[0]});GIST38.checkAt=0;GIST38.retryAt=0;}else{try{closePanel();}catch(e){}}};
 if(typeof LOCAL_ONLY!=='undefined')LOCAL_ONLY.add('gist38Wait');}

// a new household, or entering the world (continue, a reload): the gist's own runtime state starts afresh (the save keeps what was heard)
function gistReset38(){GIST38.tries={};GIST38.seen=0;GIST38.retryAt=0;GIST38.checkAt=0;}
if(typeof enterWorld==='function'){const prevEnter38b=enterWorld;enterWorld=function(){try{gistReset38();}catch(e){}return prevEnter38b.apply(this,arguments);};}
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.newgame==='function'){const prevNewgame38=ACTIONS.newgame;ACTIONS.newgame=function(){try{gistReset38();}catch(e){}return prevNewgame38.apply(this,arguments);};}

/* ======================================================================================================================================
   8. The base's reroute() and Mrs. Oyelaran (the integrator's day-1 measurement, gist/day/sim/probe-oye-v38.cjs)
   ====================================================================================================================================== */
// Her morning and evening spots are the same point (visual-v21.js), so at six reroute() skips her while she is still hidden after her afternoon
// out, and her lost thing could never be given back in the evening. After discovery only (before it every frame is as it was): a hidden
// neighbour with no route, whose spot for the slot is the one she last stood at, walks back to it from the base's usual way in.
function gistBackHome38(){if(typeof S==='undefined'||!S||!S.life||!S.life.gist38||gistOnline38()||typeof npcs==='undefined'||typeof NPC_SPOTS==='undefined'||typeof walkNPC!=='function')return;
 const sl=slot();for(const k in npcs){const n=npcs[k],spots=NPC_SPOTS[k];if(!n||!spots)continue;if(S.party&&S.party.on&&Array.isArray(S.party.guests)&&S.party.guests.includes(k))continue;
  const spot=spots[sl];if(!spot||n.g.visible||n.route||!n.home||n.home[0]!==spot[0]||n.home[1]!==spot[1])continue;
  n.g.visible=true;n.g.position.set(NAV[12][0],0,NAV[12][1]);walkNPC(n,spot,false);}}
if(typeof reroute==='function'){const prevReroute38=reroute;reroute=function(){const r=prevReroute38.apply(this,arguments);try{gistBackHome38();}catch(e){if(typeof console!=='undefined')console.warn('gist38 reroute',e);}return r;};}

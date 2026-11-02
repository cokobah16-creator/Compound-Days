// v39 Aunty Bisi, thanks at the rail and fuller afternoons (dist/src/seller-v39.js, engineer A; dist/src/gist-v39.js, engineer B), checked on the
// real game logic in Node with the shipped Three.js (v39/SPEC.md §16). Built on check/runtime-harness.cjs and the world of verify-gist-v38.cjs
// (the bench's: a local two-player household made with the real setup actions, the sofa placed through its own success path), with the players
// driven through the game's own key state (P1 WASD and E, P2 the arrows and Enter) and the real tick, one frame at a time. Setup may set the day,
// the time, S.life.evening35, S.money, S.home.items, the screen size and the players' standing places, and v38 state only through v38's own
// actions; it never sets S.life.gist38.b39 and never calls a v39 action except through a hotspot act or a panel button's own data-act (the pure
// API functions of spec §1.7 are read). The clock, Math.random, Date and performance.now are stubbed; reads of performance.now, Date.now and
// Math.random made directly from seller-v39.js are counted, and Math.random calls inside v39's builds are counted (both must be 0). The results
// file holds no wall-clock value.
// The checks run twice in child processes and the two reports must match. Each mutant (a one-place change to a v39 file in a copy of dist) reruns
// only its named check, which must fail. Three load passes: a copy of dist without the two v39 tags runs every check and each must fail there
// (checks with the same first failure are reported once); a copy without the two v38 tags but with v39 loads with no error and builds nothing
// (the same scene count, Math.random calls and hooks as a copy with neither); the verify-lines, verify-log and verify-tune subset copies with
// the v39 tags load with no error and no new global but v39's. GIST39_JOBS (default 2, at most 2) runs the child processes in parallel.
// Engineer A's checks are 1, 2, 3, 7, 10 and 11 (mutants M1-M5, M14, M15, M16, M19); engineer B's are 4, 5, 6, 8, 9 and 12 (M6-M13, M17, M18, M20), in the section marked "engineer B".
// `node check/verify-gist-v39.cjs --probe` runs A's route and zone probe alone (exit 1 on any break).
'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const OUT=path.join(__dirname,'results-gist-v39.json');
const GAME=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');process.env.COMPOUND_GAME_DIR=GAME;
const NAMES={
 1:'1. inert: (a) on day 3 at 10:00 before v38 is discovered the save, the keys of S and S.life, 600 frames of cameras and prompts, the Menu and Today are as without v39; TICK_HOOKS 17, cue hooks 2, the audio recipes, LINES35, WHEN35, DAYS35.rows, FINDS34 and the pinned sources unchanged; a household past its v35 evening with v38 undiscovered gets no Bisi at 17:20; (b) on day 5 with v38 discovered by a pickup and no v39 trigger, from 07:30 to the end of the gist the save, Today, the plan, the talk lines and the gist lines are as without v39 (only her figure, bubbles and prompts differ, between 16:54 and 18:10); no G.b39, no v39 log line, no wait for her anywhere',
 2:'2. bisi-walk: bisiDay39 pure, true on the first gist evening, never false two days running over days 4-60, the alternative rule false only on days 2, 9, 16 ...; a non-regular evening: nothing at 16:53, in from the gate, the stroll as a triangle wave in S.time, out from 17:50, hidden by 18:10; a regular: at her stop at 17:00, one call, out from 18:00; the call from the rail: she walks to (-4.0, 7.55) and stops calling; frozen for 300 frames under a panel; jumps to 17:00, 17:30, 18:00, 18:12, 18:15 and +0.15 h snap or hide her; none on the v35 evening\'s day, online, at a party; hidden on Sleep, enterWorld, a new household; the route clear at r 0.3 and her stroll and stop off the walker lanes; her bubbles one sprite per text, never in the base\'s bubbles, gone when she hides; no wall-clock read; (fixer) an evening off in the five after her first; the street-side buy beats the suya stand; her bubbles drawn inside each camera\'s half on both phones; her call on the HUD for a player who cannot see her; (polish) a speaker\'s new line replaces that speaker\'s live bubble; no bubble for a camera that cannot see the speaker, and the HUD chip agrees with it',
 3:'3. bisi-buy: the call zone (x -4.9 to -3.1 on the rail, standing only); during the stroll the buy prompt only from the street side; at her stop within 2.4 m from the rail and not at 2.5 m; south of her Mallam\'s prompt wins at equal distance; the panel with one primary before and after a sale; ₦500 and buy puffpuff39; one of each; the toasts; cheer and energy; no game time; a regular bought from at the rail stands at the rail spot during the panel and walks back after; Help her lift the tray (the pose, her bubble, bisi lift); the taste with ₦400 (once, no credit); jara on the third evening; the bag carried to the pitch and given (beats Play; not in a live match); the bag gone when the children go in, with its toast; the Finds tip names tomorrow\'s piece (the armchair first) and pays off the next day only; Wait for Aunty Bisi on Today and the bench lands at 17:00, offered only before 17:00 and after discovery; (fixer) the call and a regular\'s buy beat the pepper pot anywhere in front of the walkway; her line in her heading with a plain toast; after a sale or the taste an item the purse cannot pay for shows no price and gives no taste; the lift above the items; the tray lowered and lifted with the players\' hands; the bag offered after the children went in while their window is open, kept through a reload, and given on walking back; the payoff with a companion beside you',
 7:'7. interplay: on her evening the gist due at 18:15 on a day with no match starts by 18:16, after a match at 18:20; the sofa\'s 18:12 then the gist by 18:16; bench36Wait {t:18.25} and gist38Wait land at 18:15; she is never visible while EVENING35 is not idle (?gist=now at 17:30 hides her), and hidden by 18:10; at most two v39 lines in any gist; the bench page keeps v38\'s strings; (fixer) no save() by v39 while a gist runs, the bag\'s toast after Goodnight',
 4:'4. thanks: a set completed with the shelf up brings its patron to the next gist (the shells Ada, the keepsakes Tunde, the carvings Mr. Bassey with Ada beside him on days 12, 14 and 15) through one narrowed call of v38\'s own plan (the rest of the script is v38\'s for the narrowed pair), the patron\'s greeting swapped for the thank-you (on the carvings night Ada\'s too), no slot taken, GIST38.GUESTS and found38Today put back, the plan pure; on a plain night the kept guest is the one not in last night\'s pair; never last night\'s pair; deferred while both guests have roles and on the first gist; none without the shelf; once per set; friendship +1, thanks set:, v39 discovered; Mr. Bassey\'s photograph the next morning (the album memory, the caption in Node) and the print the morning after, in its own group outside the shelf',
 5:'5. give-back: a thing held through an earlier gist brings its owner (forced in, the pocket hidden for the one call): the beat line with "Give it back", v38\'s own thanks planned right after it, before the goodbye, one slot; on Next found38Give does the return (back, returned, the keepsake on a first return, the next thing tomorrow, TOLD_NEXT, the logs, friendship) with openPanel, found38Visiting and save put back, no save() between the beat and Goodnight and one at Goodnight, the keepsake toast with its shelf hint; Ada\'s ask booked on that night and G.last.ids the lines shown; a thing picked up that day: no owner; an abort before the beat: still in the pocket; (fixer) only the shelf hint toasted over the planned thanks; a full day log still gives the give-back',
 6:'6. stool: the eldest by ELDEST (Mr. Bassey, Mrs. Oyelaran before Mama Nkechi, none with Tunde and Ada); Ada\'s tenth stool the morning after her "nine times" line; the first gist with Mr. Bassey: his line right after his greeting, the greeting\'s button "Bring the stool for Mr. Bassey", the reach pose over the rail, seated on the 0.45 m stool at his spot (hips above 0.45 m), the stool\'s yaw his, the household and the other guest standing; framing at 1280x800, 390x844 and 844x390 no worse seated than standing; Goodnight: he stands and the stool goes back over the rail; the next gist: seated as they arrive, no line, no button; unseated with the stool gone on a direct abort, a new day, walking out, a party and going online; (fixer) no pot ask on an elder\'s first stool night',
 8:'8. rounds: rotEntry39 pure for 7 to 40, round two one thing per neighbour, then the again round (an again entry with its base; the first cycle under <id>-a), never the same owner twice running, no again id of any cycle in TOLD_NEXT; round two\'s spots pass v38\'s check-2 rules and spec §4 (the guest patch, Aunty Bisi\'s route, reachable); the seventh back on day R: entry 8 set at R+1\'s new day (v39 discovered), nothing at R+1\'s noon, told at R+1\'s gist by its owner, out at R+2\'s noon at its spot, Today\'s heard and pocket rows, entry 9 appended at the pickup, given back by keys (friendship, her thanks, no keepsake twice, the next tomorrow); every appended id has every v38 table entry with gs39 ids; reloads with lost.i 9 out, pocket and back keep the state (entries through 10, or 11); an again thing never fires TOLD_NEXT; found38Today and Today\'s pocket row for entry 15; (fixer, Codex P2) for every entry 24 to 47 (the second and third cycles) the thing told at a gist is heard (heard that night, told 1), on Today the next morning, reminded once the evening after (told 2) and not again; a save from the build that repeated the -a ids (second cycle) loads with each return under its cycle id and last night\'s untracked tip recorded as heard, and reloads unchanged; every entry 0 to 60 has its own id, the first cycle <id>-a, cycle c <id>-a<c+1>',
 9:'9. pot: no ask before v39 discovery; the ask in Mama Nkechi\'s talk (today, n by hash, the number as words), recorded with the log; never Mrs. Oyelaran; Today\'s row; no catch-card button before 14:00, from 14:00 a quiet one (one primary) through lifeCatch release, none once all are kept; "Give Mama Nkechi the fish" at her live place, her thanks, friendship +1, the bowl at six with cheer +4 and energy +6; not the same asker two days running; at a gist with Mr. Bassey the ask for tomorrow before the goodbye with "Ehen?", recorded only when shown, told on the night page, pending; Ada\'s and the pot\'s buttons together; the give prompt gone and the pot lapsed after half past five, no bowl; Today\'s cap: a five-row v38 day with the pot and Bisi rows drops Bisi\'s, then the wait (and the shelf on a phone), never the pot; (fixer) Aunty Bisi\'s sentence folded into the evening row and never dropped, on an evening off too; counts, thanks and gist asks by the hash\'s high bits; Mr. Bassey\'s ask in his morning talk',
 12:'12. copy: every GIST39.LINES and BISI39.LINES line (ids unique and gs39-) and every UI string: no weekday, British spelling, curly apostrophes, no markup, at most 160 characters, only the placeholders thing, owner, area, where, name, fish, piece, dish and n, no digit or ₦ in speech but 1979; every round-two and again entry complete (7 to 30); the toasts, rows, panels and lines rendered in checks 4 to 9 under the same rules; (fixer) the again and give-back lines read right for all twelve things, in the first three cycles',
 10:'10. save-modes-and-cost: v35, v36, v37 and v38 saves load, run 60 frames and save with the keys of S and S.life unchanged and no G.b39; a v39 save loads and plays in the v38 build (a copy without the v39 tags); stripState has no life.gist38; online no v39 object, offline back; no v39 object after newgame, newconfirm, an enterWorld into day 2 and going online (bubbles and the bag included), and the scene count as without v39; no Math.random call inside her builds (hero and lite), her bubbles and the bag; no wall-clock or Math.random read by seller-v39.js; an inert frame and a frame with her in the street: no blocked() or levelAt() call, no new object',
 11:'11. walk-and-shelf: the household walks to the rail (the walk clip on at least 90% of the glide frames for each player gliding), from inside the flat by the door (a sample at x -4.1 between z 5.0 and 6.4), to the very spots v38 chose (to 1 mm, and as without v39); the path round the furniture (cut item 3, built): planned for each player starting inside, and for 33 free starts in a default flat clear at r 0.3 to the door; the shelf picture (cut item 2, built): null in Node, rendered once into its own target with the previous one put back, cached, shown above the lists in See your shelf'};
const ORDER=[1,2,3,4,5,6,7,8,9,10,11,12];
// one-place changes, each of which must turn its check red
const MUTANTS=[
 {name:'M1 gistSave39(true) without a trigger (in the step)',check:1,file:'seller-v39.js',find:'if(B.t<B.checkAt)return;B.checkAt=B.t+0.25;',replace:'if(B.t<B.checkAt)return;B.checkAt=B.t+0.25;gistSave39(true);'},
 {name:'M2 Bisi spawns without S.life.gist38',check:1,file:'seller-v39.js',find:' if(!S.life||!S.life.gist38)return false;\n if(!(typeof gistDueTonight38',replace:' if(!(typeof gistDueTonight38'},
 {name:'M2b the second half of M2',with:'M2',file:'seller-v39.js',find:"if(!S.life||!S.life.gist38){if(!(B.flags.now&&B.flags.now===S.day)){if(B.world.fig&&B.world.fig.parent)bisiHide39();return;}}",replace:''},
 {name:'M3 Bisi walks to the rail spot while a panel is open',check:2,file:'seller-v39.js',find:'function bisiFrame39(dt){const B=BISI39,r=B.run,g=B.world.fig;if(!g)return;let moving=false,speed=B.WALK;\n if(!bisiOverlay39()&&!r.lift){',replace:'function bisiFrame39(dt){const B=BISI39,r=B.run,g=B.world.fig;if(!g)return;let moving=false,speed=B.WALK;\n if(!r.lift){'},
 {name:'M4 Bisi hidden at 18:20 instead of 18:10',check:7,file:'seller-v39.js',find:'hide:18.1667}',replace:'hide:18.3333}'},
 {name:'M5 Bisi\'s avatar built outside quiet39',check:10,file:'seller-v39.js',find:'const r=quiet39(()=>bisiMake39());',replace:'const r=bisiMake39();'},
 {name:'M14 the empty purse refused',check:3,file:'seller-v39.js',find:'if(S.money<B.PRICE[v]){if(had.length){bisiReopen39(null);return;}bisiTaste39();return;}',replace:'if(S.money<B.PRICE[v]){return;}'},
 {name:'M15 the walking glide\'s final spot moved by 0.1 m',check:11,file:'seller-v39.js',find:'P.push([R.DOOR[0],R.DOOR[2]],t);',replace:'P.push([R.DOOR[0],R.DOOR[2]],[t[0]+0.1,t[1]]);'},
 {name:'M16 shelfShot39 leaves the previous render target unrestored',check:11,file:'seller-v39.js',find:'finally{renderer.setRenderTarget(prev);}',replace:'finally{}'},
 {name:'M19 bisiBubble39 timed on performance.now()',check:10,file:'seller-v39.js',find:'end:BISI39.t+(ms||3600)/1000,',replace:'end:BISI39.t+(ms||3600)/1000+0*performance.now(),'},
 // the fix round's (each turns red a check that a finding's fix made pass)
 {name:'M21 (S17) no evening off guaranteed in her first week',check:2,file:'seller-v39.js',find:'if(d>=first+W.from&&d<=first+W.to){',replace:'if(false){'},
 {name:'M22 (S1) the street-side buy has no lead over the suya stand',check:2,file:'seller-v39.js',find:'CALLDIST:0.3,STREET_LEAD:0.5,',replace:'CALLDIST:0.3,STREET_LEAD:0,'},
 {name:'M23 (I4, S14) bubbles not clamped into their half',check:2,file:'seller-v39.js',find:'b.onBeforeRender=bisiClamp39;',replace:''},
 {name:'M24 (S4) no call chip on the HUD',check:2,file:'seller-v39.js',find:' bisiChip39(false);}',replace:'}'},
 {name:'M25 (S1) the call at its old distance, under the pepper pot\'s prompt',check:3,file:'seller-v39.js',find:'CALLDIST:0.3,STREET_LEAD:0.5,',replace:'CALLDIST:1.2,STREET_LEAD:0.5,'},
 {name:'M26 (DOD-9, C3) the taste again after a purchase',check:3,file:'seller-v39.js',find:'if(had.length){bisiReopen39(null);return;}',replace:''},
 {name:'M27 (S3) the bag only while the children are out this minute',check:3,file:'seller-v39.js',find:'return BISI39.kidsDay===S.day||(typeof fbPlayedToday37===\'function\'&&!!fbPlayedToday37());}catch(e){return false;}}',replace:'return false;}catch(e){return false;}}'},
 {name:'M28 (DOD-6) the bag not rebuilt after a reload',check:3,file:'seller-v39.js',find:'else if(!B.world.bag&&typeof scene!==\'undefined\'&&scene)bisiBagMake39();',replace:''},
 {name:'M29 (DOD-4) the payoff only at the end of the toast',check:3,file:'seller-v39.js',find:'if(typeof m===\'string\'&&/ is in Build storage\\./.test(m)&&m.indexOf(add)<0)m=m.replace(\' is in Build storage.\',\' is in Build storage.\'+add);',replace:'if(typeof m===\'string\'&&/ is in Build storage\\.$/.test(m))m=m+add;'},
 {name:'M38 (polish) a speaker\'s new line drawn over their live one',check:2,file:'seller-v39.js',find:' for(let j=W.live.length-1;j>=0;j--){const o=W.live[j];if(o!==b&&o.userData.f39&&o.userData.f39.obj===obj){o.visible=false;if(o.parent)o.parent.remove(o);W.live.splice(j,1);}}\n',replace:''},
 {name:'M39 (polish) a bubble drawn for a speaker the camera cannot see',check:2,file:'seller-v39.js',find:'.seen)b.scale.set(0,0,1);}catch(e){}',replace:'.seen){}}catch(e){}'},
 {name:'M40 (polish) the HUD chip\'s own edge test, without the bubble\'s margin',check:2,file:'seller-v39.js',find:'out.inside=s.seen;',replace:'out.inside=!s.behind&&px>=0&&px<=vp.w&&py>=(vp.top||0)&&py<=vp.h;'},
 {name:'M30 (DOD-8) the bag\'s end saved during a gist',check:7,file:'seller-v39.js',find:'if(!bisiInGist39())bisiSave39();}',replace:'bisiSave39();}'},
 // engineer B's (gist-v39.js)
 {name:'M6 the plan wrapper rebuilds the script instead of calling the original',check:4,file:'gist-v39.js',find:'let p1=call([kept,forced]);',replace:'let p1=Object.assign({},p0,{guests:[kept,forced],script:p0.script.map(s=>s.k===p0.guests.find(k=>k!==kept)?Object.assign({},s,{k:forced}):s)});'},
 {name:'M7 GIST38.GUESTS not restored in finally',check:4,file:'gist-v39.js',find:'finally{GIST38.GUESTS=keepG;found38Today=keepT;}',replace:'finally{found38Today=keepT;}'},
 {name:'M8 the thank-you ignores shelf.state===\'up\'',check:4,file:'gist-v39.js',find:"if(!G||!G.sets||!G.shelf||G.shelf.state!=='up')return null;",replace:'if(!G||!G.sets||!G.shelf)return null;'},
 {name:'M9 the give-back allowed on the first gist after the pickup',check:5,file:'gist-v39.js',find:'if(!d||d>G.last.day)return null;',replace:'if(!d)return null;'},
 {name:'M10 found38Visiting not restored after the give-back',check:5,file:'gist-v39.js',find:'finally{found38Visiting=kv;openPanel=ko;save=ks;}',replace:'finally{openPanel=ko;save=ks;}'},
 {name:'M11 the stool not removed on abort',check:6,file:'gist-v39.js',find:'const r=prevAbort39.apply(this,arguments);try{stoolClear39();}catch(e){}return r;',replace:'const r=prevAbort39.apply(this,arguments);return r;'},
 {name:'M12 round two\'s first thing at R+1',check:8,file:'gist-v39.js',find:'since:S.day+GIST39.ROUND2_GAP-1,',replace:'since:S.day,'},
 {name:'M13 the pot accepts fish caught before 14:00',check:9,file:'gist-v39.js',find:'S.time>=GIST39.POT.freshFrom&&p.got<p.n&&',replace:'p.got<p.n&&'},
 {name:'M17 the give-back calls found38Give without holding off save',check:5,file:'gist-v39.js',find:"openPanel=function(h){caught=String(h||'');};save=function(){};",replace:"openPanel=function(h){caught=String(h||'');};"},
 {name:'M18 Today drops the pot row before the shelf and carve rows',check:9,file:'gist-v39.js',find:"for(const k of ['wait','shelf','carve'])while",replace:"for(const k of ['wait','pot','shelf','carve'])while"},
 {name:'M31 (DOD-1, C5, S2) Today drops Aunty Bisi\'s sentence first',check:9,file:'gist-v39.js',find:"for(const k of ['wait','shelf','carve'])while",replace:"for(const k of ['bisi','wait','shelf','carve'])while"},
 {name:'M32 (DOD-2, I1, S6) Mr. Bassey never asks in his talk',check:9,file:'gist-v39.js',find:"if(kind==='talk'&&arg==='bassey')return potTalk39(i);",replace:''},
 {name:'M33 (S5) the pot\'s count follows the day\'s parity',check:9,file:'gist-v39.js',find:'return GIST39.POT.n[0]+(gistHash39(day,13)>>>16)%2;}',replace:'return GIST39.POT.n[0]+gistHash39(day,13)%2;}'},
 {name:'M34 (DOD-10) the give-back keyed on the day log alone',check:5,file:'gist-v39.js',find:'if(b&&b.picked&&b.picked.id===id&&b.picked.day>0)return b.picked.day;if(PICK39.id===id&&PICK39.day>0)return PICK39.day;',replace:''},
 {name:'M35 (S18) the keepsake toasted over its own thanks',check:5,file:'gist-v39.js',find:'if(m&&hint&&gistUnesc39(m[1]).indexOf(hint)>=0)gistToast39(hint);',replace:'if(m)gistToast39(gistUnesc39(m[1]));'},
 {name:'M36 (S9) the pot ask on an elder\'s first stool night',check:6,file:'gist-v39.js',find:'if(slots>0&&!gave&&!meta.stoolFirst){',replace:'if(slots>0){'},
 {name:'M37 (C1, DOD-5, S10) the again and give-back lines fill the bare plural noun',check:12,file:'gist-v39.js',find:'return (r&&r.pocket)||(L.pocketThing&&L.pocketThing[base])||(L.thing&&L.thing[base])||base;}',replace:'return (L.thing&&L.thing[base])||(r&&r.name)||base;}'},
 {name:'M20 the narrowed pair allowed to repeat last night\'s pair',check:4,file:'gist-v39.js',find:'const rep=g=>!!(last&&g.length===2&&last.length===2&&g.every(k=>last.includes(k)));',replace:'const rep=g=>false;'},
 {name:'M41 (Codex P2) every again cycle under the first cycle\'s -a ids',check:8,file:'gist-v39.js',find:"function rotId39(src,c){return c>0?src+'-a'+(c+1):src+'-a';}",replace:"function rotId39(src,c){return src+'-a';}"},
 {name:'M42 (Codex P2) a save\'s repeated -a ids left as they were',check:8,file:'gist-v39.js',find:' if(G&&(G.lost.i|0)>=12)rotMigrate39(G);}',replace:'}'},
 {name:'M43 (Codex P2) the again noun read from a bare -a suffix',check:12,file:'gist-v39.js',find:'base=rotSrc39(id),r=GIST39.LINES.round[base];',replace:"base=String(id).replace(/-a$/,''),r=GIST39.LINES.round[base];"},]
const TAGS39=[/<script type="text\/javascript" src="src\/seller-v39\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/gist-v39\.js"><\/script>\n?/];
const TAGS38=[/<script type="text\/javascript" src="src\/found-v38\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/gist-v38\.js"><\/script>\n?/];
const strip=(html,tags)=>{let o=html;for(const T of tags)o=o.replace(T,'');return o;};

// a copy of dist with index.html changed by htmlFn and the named src files by srcFns (everything else linked)
function variantDir(htmlFn,srcFns){const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd39-gist-'));srcFns=srcFns||{};
 for(const f of ['assets','data'])if(fs.existsSync(path.join(GAME,f)))fs.symlinkSync(path.join(GAME,f),path.join(d,f));
 fs.mkdirSync(path.join(d,'src'));for(const f of fs.readdirSync(path.join(GAME,'src'))){if(srcFns[f]){fs.writeFileSync(path.join(d,'src',f),srcFns[f](fs.readFileSync(path.join(GAME,'src',f),'utf8')));continue;}fs.symlinkSync(path.join(GAME,'src',f),path.join(d,'src',f));}
 fs.writeFileSync(path.join(d,'index.html'),htmlFn?htmlFn(fs.readFileSync(path.join(GAME,'index.html'),'utf8')):fs.readFileSync(path.join(GAME,'index.html'),'utf8'));return d;}
// the subset copies the v35 harnesses make (subsetDir35 in verify-lines, verify-log and verify-tune: bare -v35 tags after the cut removed; typed
// tags stay), optionally with the v39 tags taken out as well
function subsetDir39(last,noV39){const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd39-sub-'));
 for(const f of ['assets','src','data'])if(fs.existsSync(path.join(GAME,f)))fs.symlinkSync(path.join(GAME,f),path.join(d,f));
 let html=fs.readFileSync(path.join(GAME,'index.html'),'utf8'),cut=false;
 for(const [tag,src] of [...html.matchAll(/<script src="([^"]+-v35\.js)"><\/script>\n?/g)]){if(cut)html=html.replace(tag,'');if(src.endsWith('/'+last))cut=true;}
 if(!cut){fs.rmSync(d,{recursive:true,force:true});throw new Error('subset: '+last+' not found');}
 if(noV39)html=strip(html,TAGS39);fs.writeFileSync(path.join(d,'index.html'),html);return d;}

// the world of verify-gist-v38.cjs (copied: the bench's world, a local pair on day 2 with the sofa placed, and the harness helpers inside the game)
async function world(){const {benchWorld}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));const h=await benchWorld();const {run,context}=h;
 const store=new Map();context.sessionStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 run("var PH='',TOASTS=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}");
 run("var hxOVC=ov.classList.contains;var hxOverlay=on=>{ov.classList.contains=on?(c=>c==='on'):hxOVC;};");
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
 // the Math.random stub counts the calls made while QC38.in (the quiet-construction count of check 10)
 var hxQC={in:0,n:0};var hxReclock=()=>{hxFT=0;last=0;const r=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Math.random=function(){if(hxQC.in)hxQC.n++;return r();};};
 var hxFresh=(day,time)=>{hxReclock();NET.on=false;NET.isHost=true;AI.on=false;_silent=false;hxNoKeys();hxOverlay(false);location.search='';
  dispatch('newgame');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupstep',{v:'p0'});dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();
  sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();hxScreen(1280,800,false);
  if(day!==undefined)S.day=day;if(time!==undefined)S.time=time;lastInput[0]=lastInput[1]='key';hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);hxFrames(2);PH='';TOASTS=[];};
 var hxCompanion=(day,time)=>{hxReclock();NET.on=false;AI.on=false;_silent=false;hxNoKeys();hxOverlay(false);location.search='';
  dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();dispatch('movein');closePanel();
  sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();hxScreen(1280,800,false);if(day!==undefined)S.day=day;if(time!==undefined)S.time=time;hxAt(0,-5.2,4.0);hxFrames(2);PH='';TOASTS=[];};
 // the walking bot: each frame the one of the eight camera-relative key combinations nearest the needed direction
 var hxWalk=(i,x,z,stop)=>{const p=hxPos(i),dx=x-p[0],dz=z-p[1],d=Math.hypot(dx,dz);if(d<=(stop||0.15)){hxSetKeys(i,null);return d;}hxSetKeys(i,hxCombo(dx,dz));return d;};
 var hxWalkTo=(i,x,z,stop,max)=>{for(let k=0;k<(max||300);k++){if(hxWalk(i,x,z,stop)<=(stop||0.15)){hxSetKeys(i,null);return k;}hxFrames(1);}hxSetKeys(i,null);return -1;};
 // a free line towards a point: the first of eight bearings whose points from 'near' to 'from' metres out are free for a player
 var hxBearing=(x,z,near,from)=>{for(let a=0;a<8;a++){const ux=Math.sin(a*Math.PI/4),uz=Math.cos(a*Math.PI/4);let ok=true;for(let r=near;r<=from+1e-9;r+=0.1){const px=x+ux*r,pz=z+uz*r;if(blocked(px,pz,PR)||Math.abs(levelAt(px,pz))>0.01){ok=false;break;}}if(ok)return [ux,uz];}return null;};
 // the tagged v38 objects at the top of the scene
 var hxTagged=()=>scene.children.filter(o=>o.userData&&o.userData.gist38).map(o=>o.userData.gist38);
 var hxCount=()=>{let n=0;scene.traverse(()=>{n++;});return n;};`);
 // cost and quiet-construction counters: blocked() and levelAt() calls, and Math.random calls, inside the module's step and prompt hook and the
 // shelf build (wrappers round them; nothing is called)
 run(`var hxCost={in:0,b:0,l:0};if(typeof FOUND38!=='undefined'&&FOUND38&&typeof FOUND38.step==='function'){const st=FOUND38.step;FOUND38.step=function(){hxCost.in++;hxQC.in++;try{return st.apply(this,arguments);}finally{hxCost.in--;hxQC.in--;}};
  const k=HOTSPOT_HOOKS.indexOf(typeof found38Hot==='function'?found38Hot:null);if(k>=0){const hk=HOTSPOT_HOOKS[k];HOTSPOT_HOOKS[k]=function(){hxCost.in++;try{return hk.apply(this,arguments);}finally{hxCost.in--;}};}
  if(typeof found38Shelf==='function'){const sh=found38Shelf;found38Shelf=function(){hxQC.in++;try{return sh.apply(this,arguments);}finally{hxQC.in--;}};}
  const bl=blocked;blocked=function(){if(hxCost.in)hxCost.b++;return bl.apply(this,arguments);};const lv=levelAt;levelAt=function(){if(hxCost.in)hxCost.l++;return lv.apply(this,arguments);};}`);
 return h;}


// v39's own counters and helpers inside the game (prefix hx, as v38's): reads of performance.now, Date.now and Math.random made directly from
// seller-v39.js (by the caller's file name); Math.random calls inside v39's builds (hxQC, v38's counter); blocked() and levelAt() calls inside
// v39's step and prompt hook (hxCost39); her state; the tagged v39 objects anywhere in the scene; panel buttons
async function world39(){const h=await world();const {run}=h;
// a panel stops the clock in the page; the Node document's classList does nothing, so the overlay follows openPanel and closePanel here
 run("{const o=openPanel,c=closePanel;openPanel=function(h){const r=o.apply(this,arguments);if(!silentMode())hxOverlay(true);return r;};closePanel=function(){const r=c.apply(this,arguments);if(!silentMode())hxOverlay(false);return r;};}");
 run(`var hxDirect39={pn:0,dn:0,mr:0};var hxFrom39=()=>{const s=String(new Error().stack||'').split('\\n');return !!(s[3]&&s[3].includes('seller-v39.js'));};
 {const pn=performance.now;performance.now=function(){if(hxFrom39())hxDirect39.pn++;return pn.apply(this,arguments);};const dn=Date.now;Date.now=function(){if(hxFrom39())hxDirect39.dn++;return dn.apply(this,arguments);};}
 {const rc=hxReclock;hxReclock=function(){const r=rc.apply(this,arguments);const m=Math.random;Math.random=function(){if(hxFrom39())hxDirect39.mr++;return m.apply(this,arguments);};return r;};}
 var hxCost39={in:0,b:0,l:0};var hxB39=()=>typeof BISI39!=='undefined'?BISI39:null;
 if(typeof BISI39!=='undefined'){
  for(const n of ['bisiBuild39','bisiBubble39','bisiBagMake39']){const f=globalThis[n];if(typeof f==='function')globalThis[n]=function(){hxQC.in++;try{return f.apply(this,arguments);}finally{hxQC.in--;}};}
  {const st=BISI39.step;BISI39.step=function(){hxCost39.in++;try{return st.apply(this,arguments);}finally{hxCost39.in--;}};}
  {const k=HOTSPOT_HOOKS.indexOf(typeof bisiHot39==='function'?bisiHot39:null);if(k>=0){const hk=HOTSPOT_HOOKS[k];HOTSPOT_HOOKS[k]=function(){if(globalThis.hxSkip39)return null;hxCost39.in++;try{return hk.apply(this,arguments);}finally{hxCost39.in--;}};}}
  const bl=blocked;blocked=function(){if(hxCost39.in)hxCost39.b++;return bl.apply(this,arguments);};const lv=levelAt;levelAt=function(){if(hxCost39.in)hxCost39.l++;return lv.apply(this,arguments);};}
 var hxB=()=>{const B=hxB39();if(!B)return null;const g=B.world.fig;return {vis:!!(g&&g.visible&&g.parent===scene),x:g?Math.round(g.position.x*1000)/1000:null,z:g?Math.round(g.position.z*1000)/1000:null,
  phase:B.run.phase,mode:B.run.mode,atRail:B.run.atRail,held:B.heldDay===S.day,calls:B.run.calls,t:Math.round(S.time*1e5)/1e5};};
 var hxTag39=()=>{const out=[];scene.traverse(o=>{if(o.userData&&o.userData.gist39)out.push(o.userData.gist39);});return out.sort();};
 var hxB39G=()=>(S&&S.life&&S.life.gist38&&S.life.gist38.b39)||null;
 var hxBub39=()=>{const B=hxB39();return B?Object.keys(B.world.bub).sort():[];};
 var hxLive39=()=>{const B=hxB39();return B?B.world.live.filter(b=>b.visible&&b.parent===scene).map(b=>Object.keys(B.world.bub).find(k=>B.world.bub[k]===b)):[];};`);
 return h;}

const r3=v=>Math.round(v*1000)/1000;
// the route and zone probe (spec §5.1, §5.2, §19 R1): every polyline she walks free at r 0.3 and level every 0.1 m; her stroll and stop off the
// walker lanes (z 8.0 and 9.6, each +-0.3); the rail spot free; the stroll's west end 2.4 m from every v38 prompt; the bench pair of v38's check 8
// outside every v39 zone; her buy prompt reaching the veranda row from x -5.05 to -2.95 at her stop. Returns the table; bad lists every break.
function probe(J){return J(`(()=>{const B=BISI39,R=B.ROUTE,T=B.STROLL,out={lines:{},bad:[]};const bad=(x,z)=>blocked(x,z,0.3,{lvl:0,noCrate:true})||Math.abs(levelAt(x,z))>0.01;
 const line=(name,a,b,lanes)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/0.1));let k=0;for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n;
   if(bad(x,z)){k++;out.bad.push(name+' blocked at '+x.toFixed(2)+','+z.toFixed(2));}if(lanes&&(Math.abs(z-8.0)<=0.3||Math.abs(z-9.6)<=0.3)){k++;out.bad.push(name+' on a walker lane at '+x.toFixed(2)+','+z.toFixed(2));}}
  out.lines[name]={len:Math.round(L*100)/100,samples:n+1,bad:k};};
 line('in',R.enter,R.strollIn,false);line('in (a regular)',R.enter,R.stop,false);line('stroll',[T.x0,T.z],[T.x1,T.z],true);line('stop',R.stop,R.stop,true);line('rail spot',R.rail,R.rail,true);
 line('rail spot to stop',R.rail,R.stop,false);line('stop to the gate',R.stop,R.exitTo,false);
 for(let x=T.x0;x<=T.x1+1e-9;x+=0.5){line('stroll '+x.toFixed(1)+' to the rail spot',[x,T.z],R.rail,false);line('stroll '+x.toFixed(1)+' to the gate',[x,T.z],R.exitTo,false);}
 // the stroll's west end and v38's prompts (the lost things' spots, the wash, the shelf's wall is indoors) and the base's suya stand
 const v38=[];for(const it of FOUND38.LOST)for(const s of it.spots)v38.push([s[0],s[1],it.id]);for(const s of FOUND38.WASH_SPOTS)v38.push([s[0],s[1],'wash']);
 out.westEnd=Math.round(Math.min(...v38.map(s=>Math.hypot(s[0]-T.x0,s[1]-T.z)))*100)/100;if(out.westEnd<2.4)out.bad.push('the west end '+out.westEnd+' m from a v38 prompt');
 // v38 check 8's bench pair (-5.9, 6.4) and (-5.1, 6.5): outside the call zone, and on the rail side (no stroll prompt there)
 const C=B.CALLZONE;for(const p of [[-5.9,6.4],[-5.1,6.5]]){if(p[0]>=C.x0&&p[0]<=C.x1)out.bad.push('the bench pair in the call zone');if(p[1]>B.RAILZ)out.bad.push('the bench pair on the street side');}
 // her buy prompt from the rail at her stop: the veranda row's free places within REACH
 const ver=[];for(let x=-5.4;x<=-2.6;x+=0.05){let m=null;for(let z=6.0;z<=7.2;z+=0.01){if(!blocked(x,z,PR)&&inFlat(x,z))m=z;}if(m!==null&&Math.hypot(x-R.stop[0],m-R.stop[1])<B.REACH)ver.push(x);}
 out.railReach=ver.length?[Math.round(Math.min(...ver)*100)/100,Math.round(Math.max(...ver)*100)/100]:null;if(!out.railReach||out.railReach[0]>-5.0||out.railReach[1]<-3.0)out.bad.push('the rail reach '+JSON.stringify(out.railReach));
 out.railFree=!bad(R.rail[0],R.rail[1]);out.suya=Math.round(Math.hypot(-3-R.stop[0],11.2-R.stop[1])*100)/100;
 return out;})()`);}

function checks(h,only,side){const {run}=h,J=c=>JSON.parse(run('JSON.stringify((()=>{const v=('+c+');return v===undefined?null:v;})())'));const out=[];
 const check=(n,fn)=>{if(only&&!only.includes(n))return;const name=NAMES[n];
  try{const info=fn();out.push({n,name,passed:true,info});}catch(e){const m=String(e&&e.message||e).replace(/(?:\/[\w.@~-]+){2,}(?::\d+)*/g,'…').split('\n'),gen=e&&e.generatedMessage&&'actual' in e?' '+JSON.stringify(e.actual)+' vs '+JSON.stringify(e.expected):'';out.push({n,name,passed:false,failure:(m[0]+gen).slice(0,400)+(process.env.DEBUG39?' @@ '+String(e&&e.stack).split('\n').slice(1,4).join(' | '):'')});}
  try{run("hxNoKeys();hxOverlay(false);hxDT=1000/30;NET.on=false;NET.isHost=true;AI.on=false;closePanel();S.party=null;if(typeof FOOTBALL37!=='undefined'){FOOTBALL37.lastMatchDay=0;if(!FOOTBALL37.kids&&FOOTBALL37.state==='idle')FOOTBALL37.state='off';}if(typeof BISI39!=='undefined')BISI39.OFF.rule='hash';");}catch(e){}};

 /* ---------- shared steps, all by real keys (v38's, verify-gist-v38.cjs) ---------- */
 const frames=n=>run('hxFrames('+n+')');
 const press=(i)=>{run(`hxPress(${i});hxFrames(1);hxRelease(${i});hxFrames(1);`);};
 const item=()=>J("(()=>{const W=hxF()&&hxF().world;return W&&W.item?{key:W.itemKey,tag:W.item.userData.gist38,x:Math.round(W.item.position.x*1000)/1000,z:Math.round(W.item.position.z*1000)/1000}:null;})()");
 const label=(i)=>J(`hotspotCache[${i||0}]?hotspotCache[${i||0}].label:''`);
 const hsid=(i)=>J(`hotspotCache[${i||0}]?hotspotCache[${i||0}].id:''`);
 // every prompt the hooks offer P(i) where it stands (not only the nearest)
 const cands=(i)=>J(`(()=>{const p=players[${i||0}].g.position,list=[],d=(a,b)=>Math.hypot(p.x-a,p.z-b);for(const h of HOTSPOT_HOOKS){const r=h(${i||0},list,d);if(r)return [r.id];}return list.map(x=>x.id);})()`);
 const approach=(i,x,z,stop,from)=>{from=from||1.2;const b=J(`hxBearing(${x},${z},${Math.min(stop,0.4)},${from})`);assert(b,'a free way to ('+x+', '+z+')');
  run(`hxAt(${i},${x+b[0]*from},${z+b[1]*from},[${-b[0]},${-b[1]}]);hxFrames(1);`);const k=J(`hxWalkTo(${i},${x+b[0]*stop},${z+b[1]*stop},0.08,200)`);assert(k>=0,'walked to ('+x+', '+z+')');frames(2);};
 const away=(i)=>run(`hxAt(${i},-8,-10);`);
 const until=(t,max)=>{for(let k=0;k<(max||60000)&&J('S.time')<t;k+=10)frames(10);};
 // frames one at a time until the game time reaches t (a whole frame past it)
 const to=t=>{let n=0;while(J('S.time')<t-0.004&&n<80000){frames(5);n+=5;}while(J('S.time')<t&&n<80000){frames(1);n++;}return n;};
 const pickNow=(i)=>{for(let f=0;f<12&&!item();f++)frames(1);const it=item();assert(it,'a lost thing lies out');approach(i,it.x,it.z,0.5);assert(/^Pick up /.test(label(i)),'the pick prompt: '+label(i));run('TOASTS=[];');press(i);return J('TOASTS.slice()');};
 const settled=(k)=>{for(let f=0;f<1200;f+=10){if(J(`!!(npcs.${k}&&npcs.${k}.g.visible&&!npcs.${k}.route)`))return true;frames(10);}return false;};
 const giveNow=(i,owner)=>{assert(settled(owner),owner+' is there');const p=J(`[npcs.${owner}.g.position.x,npcs.${owner}.g.position.z]`);approach(i,p[0],p[1],1.2,2.0);
  const l=label(i);assert(/^Give /.test(l),'the give prompt beside '+owner+': '+l);run('PH="";');press(i);const ph=J('PH');run('closePanel();');return {label:l,panel:ph};};
 const nextday=()=>{run("dispatch('nextday');closePanel();hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);");frames(2);};
 const EV=()=>J("typeof EVENING35!=='undefined'?EVENING35.state:'none'");
 const pair=()=>run('hxAt(0,-5.2,6.4,[0,1]);hxAt(1,-4.6,6.4,[0,1]);');
 const waitStart=max=>{for(let k=0;k<(max||3000);k+=5){if(EV()!=='idle')return k;frames(5);}return EV()!=='idle'?0:-1;};
 const waitTalk=()=>{for(let k=0;k<1500;k+=10){const s=EV();if(s==='talking')return k;if(s==='idle')return -1;frames(10);}return -1;};
 const untilIdle=()=>{for(let k=0;k<4000&&EV()!=='idle';k+=10)frames(10);return EV();};
 const lineNow=()=>J("(()=>{const E=EVENING35,L=E.lines[E.line];return L?{line:E.line,n:E.lines.length,id:L.id,k:L.k,text:L.text}:null;})()");
 const visit=()=>J("typeof GIST38!=='undefined'&&GIST38.visit?{guests:GIST38.visit.guests.slice(),first:GIST38.visit.first,script:GIST38.visit.script.map(s=>({k:s.k,id:s.id,tip:!!s.tip,open:!!s.open,v39:s.v39||null})),tips:GIST38.visit.tips.map(t=>Object.assign({},t))}:null");
 const listen=()=>{const out=[];for(let k=0;k<30&&EV()==='talking';k++){const s=lineNow();if(!s)break;out.push(s);for(let f=0;f<400&&EV()==='talking'&&J('EVENING35.line')===s.line;f++)frames(1);}return out;};
 const gistOnce=(max)=>{const st=waitStart(max);if(st<0)return null;const t0=J('S.time'),v=visit();const tk=waitTalk();if(tk<0)return {t0,v,shown:[],aborted:true};const shown=listen();const end=untilIdle();return {t0,v,shown,end};};
 /* ---------- v39's steps ---------- */
 const B=()=>J('hxB()');
 const tags=()=>J('hxTag39()');
 const has39=()=>J("typeof BISI39!=='undefined'&&!!BISI39");
 // the panel's buttons, as the page would show them: act, data, class, disabled, text
 const buttons=html=>[...String(html||'').matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(m=>{const a=m[1],data={};for(const x of a.matchAll(/data-(?!act)([\w-]+)="([^"]*)"/g))data[x[1]]=x[2];
  return {act:(a.match(/data-act="([^"]*)"/)||[])[1]||null,data,cls:(a.match(/class="([^"]*)"/)||[])[1]||'',disabled:/\sdisabled(?=[\s=>\/]|$)/.test(a),text:m[2].replace(/<[^>]+>/g,'')};});
 const primaries=html=>buttons(html).filter(b=>/(^|\s)primary(\s|$)/.test(b.cls)&&!b.disabled&&b.act);
 // a click on the open panel's button with this data-act (and data), as the page's own click handler dispatches it
 const click=(act,pred)=>{assert(J('overlayOpen()'),'a panel is open for '+act);const b=buttons(J('PH')).find(x=>x.act===act&&!x.disabled&&(!pred||pred(x)));assert(b,'the button '+act+' in the panel: '+JSON.stringify(buttons(J('PH')).map(x=>x.act+(x.disabled?'(off)':''))));
  run(`dispatch(${JSON.stringify(act)},${JSON.stringify(b.data)})`);return b;};
 // a household with v38 discovered on day 3 by the glasses (picked up and given back by keys), its v35 evening on day 3; morning of day 4
 const disc=()=>{run('hxFresh(3,12.02);');away(1);frames(4);pickNow(0);giveNow(0,'nkechi');run('life34().evening35={doneDay:3};');nextday();};
 // on to the next day she passes (bisiDay39, read)
 const herDay=()=>{for(let k=0;k<6&&!J('bisiDay39(S.day)');k++)nextday();assert(J('bisiDay39(S.day)'),'a day she passes');};
 // her evening from 16:50 with the pair inside the flat; on to time t
 const evening=(t)=>{run('S.time=16.85;hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);TOASTS=[];');frames(2);if(t)to(t);};
 // the triangle wave of her stroll, independently: from x +1.0 at 17:00 west to -6.0, back, 20 game minutes a leg
 const tri=t=>{const u=Math.max(0,(t-17)*60),k=Math.floor(u/20),f=(u-k*20)/20;return k%2===0?1-7*f:-6+7*f;};
 // buy from her on the street beside her (P(i) placed 1 m south of her during her stroll): the panel open
 const streetPanel=(i)=>{const b=B();assert(b&&b.vis,'she is in the street');run(`hxAt(${i},${b.x},${b.z+1.0},[0,-1]);`);frames(1);assert.equal(label(i),'Buy from Aunty Bisi','the street buy prompt');run('PH="";');press(i);assert(J('overlayOpen()'),'her panel');return J('PH');};
 // Kemi and Emeka out at the pitch: P(i) goes there (they come out when a player is within 12 m of the pitch's centre in their hours) and stays
 const kidsOut=(i)=>{run(`hxAt(${i},-20,9.8,[-1,0]);`);for(let k=0;k<20&&!J('!!FOOTBALL37.kids');k++)frames(5);assert(J('!!(FOOTBALL37.kids&&FOOTBALL37.kids.kemi)'),'Kemi and Emeka out');};
 const logHas=(k,a)=>J(`(LOG35.events(S.day)||[]).some(e=>e.k==='${k}'&&e.a==='${a}')`);
 const logCount=(k,a)=>J(`(LOG35.events(S.day)||[]).filter(e=>e.k==='${k}'&&(${a===undefined?'true':`e.a==='${a}'`})).length`);
 const sameish=(a,b,tol)=>Math.abs(a-b)<=(tol||1e-3);
 const rowsCard=()=>{run("PH='';openLife34('today');");const h=J('PH');run('closePanel();');return h;};

 /* ======================================================================================================================================
    Engineer A's checks: 1, 2, 3, 7, 10, 11
    ====================================================================================================================================== */
 // check 1's measures of the inert world, taken first, before any other check has touched the world (the runner compares them with the run
 // without v39): (a) day 3 at 10:00, no v38; (b) day 5 with v38 discovered by a pickup, the whole day to the end of the gist
 if(!only||only.includes(1)){try{run('hxFresh(3,10);');const sj=J('JSON.stringify(S)'),ks=J('[Object.keys(S).join(),Object.keys(S.life||{}).join()]');
   const fr=J(`(()=>{let h=2166136261>>>0;const mix=s=>{s=String(s);for(let k=0;k<s.length;k++){h^=s.charCodeAt(k);h=Math.imul(h,16777619)>>>0;}};for(let f=0;f<600;f++){hxFrames(1);mix(v21Dist.map(v=>v.toFixed(4)).join());mix(cams[0].position.toArray().map(v=>v.toFixed(3)).join()+cams[1].position.toArray().map(v=>v.toFixed(3)).join());mix(hotspotCache.map(x=>x?x.label:'').join('|'));}return h.toString(16);})()`);
   run('PH="";openMenu();');const menu=J('PH').replace(/v3\d-[0-9a-f]{8}/g,'BUILD');run('closePanel();');const today=J('todayHTML34()');const all=JSON.stringify([sj,ks,fr,menu,today]);let hh=2166136261>>>0;for(let k=0;k<all.length;k++){hh^=all.charCodeAt(k);hh=Math.imul(hh,16777619)>>>0;}
   side.inertA=hh.toString(16)+':'+all.length;
   // (b): the glasses on day 3 (picked up, given back), the v35 evening on day 3, two mornings on to day 5; the day from 07:30 to the gist's end
   run('hxFresh(3,12.02);');away(1);frames(4);pickNow(0);giveNow(0,'nkechi');run('life34().evening35={doneDay:3};');nextday();nextday();
   const dig=[];const note=(k,v)=>dig.push([k,v]);
   note('today07',J('todayHTML34()'));note('save07',J('JSON.stringify(S)'));
   note('talk',J("['tunde','nkechi','ada','bassey','oyelaran'].map(k=>{try{const l=line35(k,lineCtx35(k));return l?l.id:null;}catch(e){return 'x';}})"));
   run('S.time=16.8;hxAt(0,-5.2,6.4,[0,1]);hxAt(1,-4.6,6.4,[0,1]);');frames(2);
   // the prompts as they would be without her (her own prompt hook skipped for the reading: since the fix round her call beats the pepper pot's)
   let seen=0,labels=[];for(let k=0;k<84;k++){frames(30);const b=J('hxB()');if(b&&b.vis)seen++;const l=J("(()=>{globalThis.hxSkip39=true;try{return players.map((p,i)=>{const h=nearest(i);return h?h.label:'';}).join('|');}finally{globalThis.hxSkip39=false;}})()");labels.push(l);}
   note('labels',labels.join(';'));note('save18',J('JSON.stringify(S)'));note('plan',J("typeof gistPlan38==='function'?JSON.stringify(gistPlan38()):''"));
   const g=gistOnce(3000);note('gist',g?JSON.stringify([g.t0,g.v,g.shown.map(s=>s.id),g.end]):'none');note('saveEnd',J('JSON.stringify(S)'));note('todayEnd',J('todayHTML34()'));
   const all2=JSON.stringify(dig);let h2=2166136261>>>0;for(let k=0;k<all2.length;k++){h2^=all2.charCodeAt(k);h2=Math.imul(h2,16777619)>>>0;}
   side.inertB={digest:h2.toString(16)+':'+all2.length,parts:dig.map(([k,v])=>{let x=2166136261>>>0;const s=String(v);for(let q=0;q<s.length;q++){x^=s.charCodeAt(q);x=Math.imul(x,16777619)>>>0;}return k+':'+x.toString(16);}),seen,
    b39:J('!!(S.life.gist38&&S.life.gist38.b39)'),log39:J("['bisi','pot','thanks'].map(k=>(LOG35.events(S.day)||[]).filter(e=>e.k===k).length).concat([(LOG35.events(S.day)||[]).filter(e=>e.k==='buy'&&/39$/.test(e.a||'')).length])")};}
  catch(e){side.inertA=side.inertA||('error '+String(e&&e.message||e).slice(0,120));side.inertB={error:String(e&&e.message||e).slice(0,160)};}}
 // check 10's scene count runs early, in a world no other check has touched (the runner compares it with the run without v39): her evening with
 // a bubble and the bag shown where v39 is present, then a new day-2 household (homeuse check 6's counter)
 if(!only||only.includes(10)){try{run('hxFresh(3,12.02);');away(1);frames(4);pickNow(0);run('life34().evening35={doneDay:3};');nextday();run('S.time=17.05;');pair();frames(60);
   run("dispatch('newgame');hxFresh(2,10);");frames(30);side.count10=J('hxCount()');}catch(e){side.count10='error '+String(e&&e.message||e).slice(0,100);}}

 // check 11's walk to the rail, measured in a world no other check has touched (the runner compares the spots with the run without v39): the
 // pair inside the flat on day 4 (the first gist) walk to the rail when the guests arrive, by the door
 if(!only||only.includes(11)){try{disc();run('S.time=18.2;hxAt(0,-5.6,4.0,[0,1]);hxAt(1,-4.9,3.6,[0,1]);');frames(2);const st=waitStart(1200);if(st<0)throw new Error('no gist');
   let gl=0,walk={},frm={},door=false,targets=null,plans=null,v38spots=null;for(let k=0;k<1500;k++){frames(1);const s=J("(()=>{const v=GIST38.visit;if(!v||!v.glide)return null;const o={};for(const k in v.glide){const p=players[k];o[k]={cur:p.g.current,x:p.g.position.x,z:p.g.position.z,to:v.glide[k].path[v.glide[k].path.length-1],plan:!!v.glide[k].plan39,len:v.glide[k].path.length};}return o;})()");
    if(s&&Object.keys(s).length){gl++;if(!targets){targets={};plans={};for(const k in s){targets[k]=s[k].to;plans[k]=s[k].plan;}v38spots=J('gistRailSpots38(GIST38.visit)');}for(const k in s){frm[k]=(frm[k]||0)+1;if(s[k].cur==='walk')walk[k]=(walk[k]||0)+1;if(Math.abs(s[k].x+4.1)<0.05&&s[k].z>5.0&&s[k].z<6.4)door=true;}}
    else if(gl>0)break;}
   const fin=J('players.map(p=>[p.g.position.x,p.g.position.z])');side.walk11={gl,walk,frm,door,targets,fin,plans,v38spots};side.rail11=targets?Object.keys(targets).sort().map(k=>[k,r3(fin[k][0]),r3(fin[k][1])]):null;untilIdle();}
  catch(e){side.walk11={error:String(e&&e.message||e).slice(0,120)};side.rail11=null;}}

 check(1,()=>{const R={};assert(has39(),'the module');
  const pins=J(`({tick:TICK_HOOKS.length,cue:CUE35_HOOKS.length,recipes:Object.keys(AUDIO35.recipes),talk:['tunde','nkechi','ada'].map(k=>LINES35[k].length),evening:Object.keys(LINES35.evening).map(k=>LINES35.evening[k].length),
   short:Object.keys(LINES35.short).length,text:Object.keys(LINES35.text).length,when:Object.keys(WHEN35).length,rows:DAYS35.rows.length,finds:FINDS34.length,
   src:[talk.toString().includes('lines_talk35'),openTalk.toString().includes('life-talk34')&&openTalk.toString().includes('act.before(card)'),finishParty.toString().includes('partyLines35'),ACTIONS.nethost.toString().includes('born35'),setupTouch.toString().includes('actPrimary35')]})`);
  assert.equal(pins.tick,17,'TICK_HOOKS');assert.equal(pins.cue,2,'CUE35_HOOKS');assert.deepEqual(pins.recipes,['cast','nibble','bite','catch','water'],'AUDIO35.recipes');
  assert.deepEqual(pins.talk,[42,41,41],'LINES35 talk');assert.deepEqual(pins.evening,[4,4,4],'LINES35.evening');assert.equal(pins.short,15,'LINES35.short');assert.equal(pins.text,58,'LINES35.text');
  assert.equal(pins.when,31,'WHEN35');assert.equal(pins.rows,12,'DAYS35.rows');assert.equal(pins.finds,15,'FINDS34');assert.deepEqual(pins.src,[true,true,true,true,true],'the pinned sources');R.pins=pins;
  // (a) the inert day-3 world is compared with the run without v39 by the runner; here: nothing of v39's in it
  run('hxFresh(3,10);');frames(30);assert.deepEqual(tags(),[],'no v39 object on day 3');assert.equal(J('!!S.life.gist38'),false,'v38 undiscovered');
  // a household past its v35 evening (day 3) with v38 undiscovered: no Bisi at all in her hours, no prompt, nothing saved
  run('hxFresh(4,16.85);life34().evening35={doneDay:3};hxAt(0,-4.0,6.5,[0,1]);hxAt(1,-0.5,9.6,[0,-1]);');let vis=0,lab=[];
  for(let k=0;k<60;k++){frames(30);if(J('hxB()&&hxB().vis'))vis++;lab.push(label(0),label(1));}
  assert.equal(vis,0,'no Bisi before v38 is discovered');assert(!lab.some(l=>/Aunty Bisi/.test(l)),'no prompt for her');assert.deepEqual(tags(),[],'no v39 object');assert.equal(J('!!S.life.gist38'),false,'nothing saved');
  R.beforeV38={day:4,from:'16:51',to:'17:51',bisi:false};
  // (b) day 5 after v38's discovery: the digests are compared with the run without v39 by the runner; she was there, nothing of v39 saved or logged
  const ib=side.inertB||{};assert(!ib.error,'the day-5 run: '+ib.error);
  assert(ib.seen>0,'she walked the street on day 5 (world only)');assert.equal(ib.b39,false,'no G.b39');assert.deepEqual(ib.log39,[0,0,0,0],'no v39 log line [bisi, pot, thanks, buy]');
  R.dayFive={seen:ib.seen>0,b39:false,log:'none'};
  // no "Wait for Aunty Bisi" before v39 discovery: Today at 16:00 on her evening and the bench's offers
  run('hxFresh(3,12.02);');away(1);frames(4);pickNow(0);giveNow(0,'nkechi');run('life34().evening35={doneDay:3};');nextday();run('S.time=16.0;');pair();frames(2);
  const card=rowsCard();assert(!/Aunty Bisi/.test(card),'no Bisi row or wait on Today before discovery');
  const offers=J("typeof benchRestOffers36==='function'?benchRestOffers36().map(o=>o.label):[]");assert(!offers.some(l=>/Aunty Bisi/.test(l)),'no bench wait for her: '+JSON.stringify(offers));
  assert.equal(J('bisiRow39()'),null,'bisiRow39 null before discovery');R.waits='none before discovery';
  return R;});

 check(2,()=>{const R={};assert(has39(),'the module');
  // the route and zones
  const P=probe(J);assert.deepEqual(P.bad,[],'the route probe');R.route={lines:Object.keys(P.lines).length,westEnd:P.westEnd,railReach:P.railReach,railFree:P.railFree};
  // a household whose first gist was on day 4
  disc();run('S.time=18.2;');pair();const g=gistOnce(1200);assert(g&&!g.aborted&&g.end==='idle','the first gist on day 4');assert.equal(J('hxG().eve.first'),4,'the first gist evening');
  // the schedule: pure, the first gist evening, never two missing; the alternative rule
  const days=J('(()=>{const o=[];for(let d=4;d<=60;d++)o.push(bisiDay39(d)?1:0);return o;})()'),again=J('(()=>{const o=[];for(let d=4;d<=60;d++)o.push(bisiDay39(d)?1:0);return o;})()');
  assert.deepEqual(again,days,'bisiDay39 pure');assert.equal(days[0],1,'the first gist evening');
  const h38=function(){let h=2166136261>>>0;for(let k=0;k<arguments.length;k++){h=Math.imul(h^(arguments[k]|0),16777619)>>>0;}return h;},off=x=>(h38(x,39)>>>16)%4===0;
  // (fixer, S17) with no hash evening off in the five after the first (days 5-9), the third of them (day 7) is one
  const miss=d=>d!==4&&off(d)&&!off(d-1),anyW=[5,6,7,8,9].some(miss);
  days.forEach((v,k)=>{const d=k+4,want=d===4?1:(!anyW&&d===7)?0:miss(d)?0:1;assert.equal(v,want,'bisiDay39('+d+')');if(k>0)assert(v||days[k-1],'two missing in a row at day '+d);});
  assert(days.slice(1,6).includes(0),'(fixer, S17) an evening off in the five after her first, so she stays a treat: '+JSON.stringify(days.slice(0,8)));
  const missing=days.map((v,k)=>v?null:k+4).filter(x=>x);assert(missing.length>=5&&missing.length<=20,'about one evening in five missing: '+missing.length+' of 57');
  run("BISI39.OFF.rule='rest';");const alt=J('(()=>{const o=[];for(let d=2;d<=60;d++)if(!bisiDay39(d))o.push(d);return o;})()');run("BISI39.OFF.rule='hash';");
  assert.deepEqual(alt,[2,9,16,23,30,37,44,51,58],'the alternative rule');R.days={missing,alternative:alt.slice(0,3)};
  // (polish) ?bisi=off for testers: the evening after her first is off, the next is hers, never two missed in a row
  {run("BISI39.flags.off=-1;");const od=J('(()=>{const o=[];for(let d=4;d<=20;d++)o.push(bisiDay39(d)?1:0);return o;})()');run("BISI39.flags.off=0;");
   assert(od[0]===1&&od[1]===0&&od[2]===1,'(polish) ?bisi=off: her first evening, then the evening off, then hers: '+JSON.stringify(od));od.forEach((v,k)=>{if(k>0)assert(v||od[k-1],'?bisi=off: two missing in a row at day '+(k+4));});
   assert.deepEqual(J('(()=>{const o=[];for(let d=4;d<=60;d++)o.push(bisiDay39(d)?1:0);return o;})()'),days,'the schedule back without the flag');R.days.offFlag=od.map((v,k)=>v?null:k+4).filter(x=>x);}
  // a non-regular evening: in from the gate, the stroll, out, hidden
  nextday();herDay();const day=J('S.day');evening();
  to(16.89);assert.equal(J('hxB()&&hxB().vis'),false,'nothing before 16:54');
  to(16.95);let b=B();assert(b.vis&&b.phase==='in','walking in at 16:57: '+JSON.stringify(b));
  {const t=b.t,s=(t-16.9)*78,ax=4.0-3.0*Math.min(1,s/Math.hypot(3,0.8)),az=9.6-0.8*Math.min(1,s/Math.hypot(3,0.8));assert(Math.hypot(b.x-ax,b.z-az)<0.15,'on her way in: '+JSON.stringify([b.x,b.z,ax,az]));}
  // (fixer, S4) while she calls, a player within 12 m whose view does not show her has the call on the HUD (computed here from the cameras)
  {let want=0,shown=0,wrong=0;for(let k=0;k<60&&J('S.time')<17.14;k++){frames(5);const s=J(`(()=>{const B=BISI39,g=B.world.fig;if(!g||!g.visible)return null;
     const live=B.world.live.filter(b=>b.visible&&b.userData.f39&&b.userData.f39.obj===g).map(b=>Object.keys(B.world.bub).find(k=>B.world.bub[k]===b)).filter(t=>B.LINES.call.some(c=>c[1]===t));
     return [0,1].map(i=>{const p=players[i].g.position,d=Math.hypot(p.x-g.position.x,p.z-g.position.z),c=cams[i];c.updateMatrixWorld();const v=new THREE.Vector3(g.position.x,1.6,g.position.z),vz=v.clone().applyMatrix4(c.matrixWorldInverse).z,q=v.project(c),vp=v21Viewport(i),px=(q.x+1)/2*vp.w,py=(1-q.y)/2*vp.h;
      const inside=vz<-0.05&&px>=0&&px<=vp.w&&py>=(vp.top||0)&&py<=vp.h;return {want:live.length>0&&d<=12&&!inside,inside,chip:CHIP39.k[i]!==''&&CHIP39.k[i].includes(live[0]||'@')};});})()`);
    if(!s)continue;for(const x of s){if(x.want)want++;if(x.want&&x.chip)shown++;if(x.inside&&x.chip)wrong++;}}
   assert(want>0&&shown>0,'(fixer, S4) her call on the HUD for a player who cannot see her: '+JSON.stringify({want,shown}));assert.equal(wrong,0,'no chip in a view that shows her');R.chip={samples:want,shown};}
  const samples=[];for(const t of [17.02,17.15,17.3,17.45,17.6,17.75,17.82]){to(t);b=B();assert(b.vis&&b.phase==='stroll','strolling at '+t+': '+JSON.stringify(b));
   assert(sameish(b.x,tri(b.t),0.002)&&sameish(b.z,8.8),'the triangle wave at '+b.t+': '+b.x+' against '+tri(b.t).toFixed(3));samples.push([b.t,b.x]);}
  const xs=samples.map(s=>s[1]);assert(Math.min(...xs)<-4&&Math.max(...xs)>-1,'she strolls the length of the street');
  const bubs=J('hxBub39()');assert.deepEqual(bubs,['Groundnut! Fresh groundnut!','Puff-puff dey o!','Puff-puff! Hot puff-puff!'],'one sprite per call text');
  assert.equal(J("Object.values(bubbles).filter(b=>b&&b.userData&&b.userData.gist39).length"),0,'none in the base\'s bubbles');
  // (fixer, I4 and S14) as each camera draws a bubble it is inside that camera's half (under the top bar, clear of the split edge), on both phones
  {const cl=J(`(()=>{const B=BISI39,g=B.world.fig,b=B.world.bub['Puff-puff dey o!'],keep=g.position.clone(),kf=b.userData.f39,s0=[b.scale.x,b.scale.y],out=[];
    for(const [w,h] of [[844,390],[390,844]]){hxScreen(w,h,true);for(let i=0;i<2;i++){const c=cams[i];c.updateMatrixWorld();
     for(const [nx,ny] of [[0.97,0.9],[-0.97,0.9],[0.97,-0.3],[-0.97,-0.3]]){const v=new THREE.Vector3(nx,ny,0.5).unproject(c);g.position.set(v.x,0,v.z);
      b.scale.set(s0[0],s0[1],1);b.userData.f39={obj:g,y:2.3+s0[1]/2,end:B.t+5,sx:s0[0],sy:s0[1]};
      const box=()=>{const p=b.position.clone().applyMatrix4(c.matrixWorldInverse),dz=-p.z,th=Math.tan(c.fov*Math.PI/360),hh=(b.scale.y/2)/(dz*th),hw=(b.scale.x/2)/(dz*th*c.aspect),q=b.position.clone().project(c),vp=v21Viewport(i);
       return {l:q.x-hw,r:q.x+hw,t:q.y+hh,b:q.y-hh,top:1-2*(vp.top||0)/vp.h,bot:-1+2*(vp.bottom||0)/vp.h,dz};};
      b.position.set(g.position.x,b.userData.f39.y,g.position.z);const raw=box();b.onBeforeRender(null,scene,c);const got=box();
      out.push({w,i,raw:raw.dz>0.1&&(raw.l<-1||raw.r>1||raw.t>raw.top||raw.b<raw.bot),ok:got.dz<=0.1||(got.l>=-1-1e-6&&got.r<=1+1e-6&&got.t<=got.top+1e-6&&got.b>=got.bot-1e-6)});}}}
    hxScreen(1280,800,false);g.position.copy(keep);b.userData.f39=kf;b.scale.set(s0[0],s0[1],1);return out;})()`);
   assert(cl.some(x=>x.raw),'some places put the bubble out of its half unclamped');assert.deepEqual(cl.filter(x=>!x.ok),[],'(fixer, I4) every bubble inside its camera\'s half: '+JSON.stringify(cl.filter(x=>!x.ok)));
   R.clamp={cases:cl.length,outsideUnclamped:cl.filter(x=>x.raw).length};}
  // (polish) no bubble for a speaker a camera cannot see: with a stub camera (no half) the bubble shows when her head is in view or outside by
  // less than the margin (clamped inside), and is drawn at zero scale when it is further out or behind the camera; the next camera gets its
  // scale back; and on the players' own cameras the HUD chip's "cannot see her" is exactly the bubble's hidden, at the frame's edges and the top bar
  {const sc=J(`(()=>{const B=BISI39,g=B.world.fig,b=B.world.bub['Puff-puff dey o!'],keep=g.position.clone(),kf=b.userData.f39,s0=[b.scale.x,b.scale.y];
    const at=(c,nx,ny)=>{c.updateMatrixWorld();const o=new THREE.Vector3(0,1.6,0).project(c),v=new THREE.Vector3(nx,ny==null?o.y:ny,o.z).unproject(c);return v;};
    const draw=(c,h)=>{g.position.set(h.x,h.y-1.6,h.z);b.scale.set(s0[0],s0[1],1);b.userData.f39={obj:g,y:2.3+s0[1]/2,hy:1.6,end:B.t+5,sx:s0[0],sy:s0[1]};b.onBeforeRender(null,scene,c);
     const q=b.position.clone().project(c);return {shown:b.scale.x>0&&b.scale.y>0,x:Math.round(q.x*1000)/1000};};
    const c=new THREE.PerspectiveCamera(50,1.6,0.1,200);c.position.set(0,6,12);c.lookAt(0,1,0);c.updateProjectionMatrix();c.updateMatrixWorld();
    const out={stub:{}};for(const nx of [0,1.05,-1.05,1.3,-1.3])out.stub[nx]=draw(c,at(c,nx));out.stub.behind=draw(c,new THREE.Vector3(0,1.6,20)).shown;
    const far=at(c,1.3),c2=new THREE.PerspectiveCamera(50,1.6,0.1,200);c2.position.set(far.x,6,far.z+12);c2.lookAt(far.x,1,far.z);c2.updateProjectionMatrix();c2.updateMatrixWorld();
    out.pair=[draw(c,far).shown,(b.onBeforeRender(null,scene,c2),b.scale.x>0)];
    out.agree=[];for(let i=0;i<2;i++){const ci=cams[i];for(const [nx,ny] of [[0,null],[0.95,null],[1.05,null],[1.09,null],[1.11,null],[1.3,null],[-1.09,null],[-1.11,null],[0,0.5],[0,0.7],[0,0.8],[0,0.86],[0,0.95],[0,-1.09],[0,-1.11]]){
     const h=at(ci,nx,ny),bub=draw(ci,h).shown,chip=bisiProject39(i,h.x,h.y,h.z).inside;out.agree.push({i,nx,ny,bub,chip});}}
    g.position.copy(keep);b.userData.f39=kf;b.scale.set(s0[0],s0[1],1);return out;})()`);
   const st=sc.stub;assert(st[0].shown&&st[1.05].shown&&st[-1.05].shown,'(polish) a bubble over a speaker in view or just outside it: '+JSON.stringify(st));
   assert(Math.abs(st[1.05].x)<=1&&Math.abs(st[-1.05].x)<=1,'just outside: clamped inside the frame: '+JSON.stringify(st));
   assert(!st[1.3].shown&&!st[-1.3].shown&&!st.behind,'(polish) no bubble for a speaker outside the frame by more than the margin or behind the camera: '+JSON.stringify(st));
   assert.deepEqual(sc.pair,[false,true],'hidden for the camera that cannot see her only, shown for the next one that can');
   const dis=sc.agree.filter(a=>a.bub!==a.chip);assert.deepEqual(dis,[],'(polish) the HUD chip\'s "cannot see her" agrees with the bubble\'s margin');
   assert(sc.agree.some(a=>a.bub)&&sc.agree.some(a=>!a.bub),'both shown and hidden among the samples: '+JSON.stringify(sc.agree));
   R.unseen={stub:Object.keys(st).length,agree:sc.agree.length,hidden:sc.agree.filter(a=>!a.bub).length};}
  to(17.86);b=B();assert(b.vis&&b.phase==='out'&&b.x>tri(17.8333)+0.3,'out east from 17:50: '+JSON.stringify(b));
  to(18.17);assert.equal(J('hxB().vis'),false,'gone by 18:10');assert.deepEqual(tags().filter(t=>t!=='bag'),[],'no figure or bubble left in the scene');assert.deepEqual(J('hxLive39()'),[],'no live bubble');
  R.nonRegular={day,in:'16:54',stroll:samples.length,out:'17:50',gone:'18:10'};
  // the call from the rail; frozen under a panel; she stops calling
  nextday();herDay();evening(17.1);b=B();assert(b.vis&&b.phase==='stroll','strolling');
  // (fixer, S1) the street-side buy beats Mallam's suya: at (-3.2, 9.9) with her about 1.7 m away (the session's place, portrait day 5)
  {to(17+((1+1.82)/7*20)/60);b=B();const P=[-3.2,9.9],dh=Math.hypot(b.x-P[0],b.z-P[1]);assert(dh>1.4&&dh<2.0,'she is about 1.7 m from (-3.2, 9.9): '+JSON.stringify([b,dh]));
   run(`hxAt(0,${P[0]},${P[1]},[0,-1]);hxAt(1,-8,-10);`);frames(1);assert.equal(hsid(0),'bisi39buy','the street buy beats the suya stand: '+JSON.stringify(cands(0)));R.street={at:P,her:r3(dh)};}
  run('hxAt(0,-4.0,6.5,[0,1]);');frames(1);assert.equal(label(0),'Call Aunty Bisi','the call prompt');
  // (polish) a second line from the same speaker replaces the first: her call is up as she is called, then only 'I dey come!' is visible and live
  const mine=()=>J("BISI39.world.live.filter(b=>b.userData.f39&&b.userData.f39.obj===BISI39.world.fig).map(b=>[Object.keys(BISI39.world.bub).find(k=>BISI39.world.bub[k]===b),b.visible,b.parent===scene])");
  run("bisiBubble39(BISI39.LINES.call[0][1],3000);");const call1=J('BISI39.LINES.call[0][1]');assert(mine().some(x=>x[0]===call1&&x[1]&&x[2]),'her call up before she is called');
  run('TOASTS=[];');press(0);frames(8);
  assert.deepEqual(mine(),[['I dey come!',true,true]],'(polish) one bubble of hers visible and live after her second line');
  assert.equal(J(`(()=>{const b=BISI39.world.bub[${JSON.stringify(call1)}];return b.visible||b.parent===scene;})()`),false,'her call taken down');R.replace={speaker:'bisi',live:1};
  const calls0=J('hxB().calls');assert(J("hxLive39().includes('I dey come!')"),'"I dey come!"');
  run("openPanel('<h2>Wait</h2>');");const before=B();frames(300);const after=B();run('closePanel();');assert(before.x===after.x&&before.z===after.z&&before.t===after.t,'frozen for 300 frames under a panel: '+JSON.stringify([before,after]));
  frames(240);b=B();assert(sameish(b.x,-4.0,0.01)&&sameish(b.z,7.55,0.01),'at the rail spot: '+JSON.stringify(b));frames(600);assert.equal(J('hxB().calls'),calls0,'no call once called');assert.equal(J('!!hxB39G()'),false,'the call saves nothing');
  R.call={rail:[-4.0,7.55],frozen:300,calls:'stopped'};
  // jumps: the waits to 17:00, 17:30 and 18:00, the sofa's 18:12, 18:15, a catch's +0.15 h
  nextday();herDay();run('S.time=16.5;');pair();frames(2);run("dispatch('sitwait',{t:17.0});closePanel();");frames(10);b=B();assert(b.vis&&b.phase==='stroll'&&sameish(b.x,tri(b.t),0.01),'17:00: '+JSON.stringify(b));
  run("dispatch('sitwait',{t:17.5});closePanel();");frames(10);b=B();assert(b.vis&&sameish(b.x,tri(b.t),0.01),'17:30: '+JSON.stringify(b));
  run('S.time=S.time+0.15;');frames(10);b=B();assert(b.vis&&sameish(b.x,tri(b.t),0.01),'+0.15 h: '+JSON.stringify(b));
  run("dispatch('sitwait',{t:18.0});closePanel();");frames(10);assert.equal(J('hxB().vis'),false,'18:00: already out of sight');
  nextday();herDay();run('S.time=16.5;');pair();frames(2);run("dispatch('sitwait',{t:18.2});closePanel();");frames(10);assert.equal(J('hxB()&&hxB().vis'),false,'18:12: gone');
  nextday();herDay();run('S.time=16.5;');pair();frames(2);run("dispatch('sitwait',{t:18.25});closePanel();");frames(10);assert.equal(J('hxB()&&hxB().vis'),false,'18:15: gone');R.jumps=['17:00','17:30','+0.15 h','18:00','18:12','18:15'];
  // a regular: two evenings bought from (by the street panel), then at her stop at 17:00, one call, out from 18:00
  for(let e=0;e<2;e++){nextday();herDay();evening(17.1);run('S.money=9000;');streetPanel(1);click('bisi39Buy',x=>x.data.v==='puffpuff');click('bisi39Close');frames(2);}
  nextday();herDay();evening(16.995);to(17.0);b=B();assert(b.vis&&Math.hypot(b.x+4.0,b.z-8.8)<=0.05,'a regular at her stop at 17:00: '+JSON.stringify(b));
  to(17.5);b=B();assert(b.vis&&b.phase==='stop'&&b.x===-4&&b.z===8.8&&b.calls===1,'at her stop at 17:30 with one call: '+JSON.stringify(b));
  to(17.99);b=B();assert(b.x===-4&&b.z===8.8,'still there at 17:59');to(18.03);b=B();assert(b.vis&&b.phase==='out'&&b.x>-3.5,'out from 18:00: '+JSON.stringify(b));R.regular={stop:'17:00',calls:1,out:'18:00'};
  // none on the v35 evening's day, online, at a party
  run('hxFresh(3,12.02);');away(1);frames(4);pickNow(0);nextday();run('S.time=17.2;');pair();frames(30);assert.equal(J('hxB()&&hxB().vis'),false,'none on the v35 evening\'s day (it is still to come)');
  disc();evening(17.2);assert(J('hxB().vis'),'there on day 4');run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");frames(12);
  assert.deepEqual(tags(),[],'online: none');run('NET.on=false;');frames(12);assert(J('hxB().vis'),'offline: back');
  run('S.party={on:true,done:false,guests:[]};');frames(12);assert.equal(J('hxB().vis'),false,'none at a party');run('S.party=null;');frames(12);assert(J('hxB().vis'),'back after');
  // hidden on Sleep, enterWorld, a new household
  run("dispatch('nextday');closePanel();");assert.deepEqual(tags(),[],'Sleep: none in the scene');
  disc();evening(17.2);assert(J('hxB().vis'),'there');run('enterWorld();closePanel();');assert.deepEqual(tags(),[],'enterWorld: none');
  frames(12);assert(J('hxB().vis'),'her evening still: back');run("dispatch('newgame');");assert.deepEqual(tags(),[],'a new household: none');run('closePanel();');
  // no wall-clock read and no Math.random draw by seller-v39.js
  assert.deepEqual(J('[hxDirect39.pn,hxDirect39.dn,hxDirect39.mr]'),[0,0,0],'direct reads [performance.now, Date.now, Math.random]');
  return R;});

 check(3,()=>{const R={};assert(has39(),'the module');
  disc();for(let k=0;k<3&&J('(()=>{const l=life34();return ((S.day+1-l.startDay)%3+3)%3;})()')!==1;k++)nextday();
  run('S.money=20000;');evening(17.05);let b=B();assert(b.vis&&b.phase==='stroll','strolling on day 4');
  // the call zone: standing on the rail in front of the walkway only
  const zone=[];for(const [x,z] of [[-4.9,6.5],[-3.1,6.5],[-4.0,6.3],[-5.0,6.5],[-3.0,6.5],[-4.0,6.2]]){run(`hxAt(0,${x},${z},[0,1]);hxAt(1,-8,-10);`);frames(1);zone.push(cands(0).includes('bisi39call')?1:0);}
  assert.deepEqual(zone,[1,1,1,0,0,0],'the call zone x -4.9 to -3.1, z from 6.3: '+JSON.stringify(zone));
  // (fixer, S1) the pepper pot's prompt (d - 0.2) no longer hides the call in the west of the zone
  run('hxAt(0,-4.7,6.6,[0,1]);hxAt(1,-8,-10);');frames(1);assert.equal(hsid(0),'bisi39call','the call beats the pepper pot at (-4.7, 6.6): '+JSON.stringify(cands(0)));
  // the street side only while she strolls: none from the veranda within reach, one in the street
  run(`hxAt(0,${b.x<-5?-5.0:Math.min(-3.0,b.x)},6.6,[0,1]);`);frames(1);assert.notEqual(hsid(0),'bisi39buy','no buy prompt from the rail during her stroll');
  b=B();run(`hxAt(1,${b.x+1.2},${b.z+0.6},[-1,0]);`);frames(1);assert.equal(hsid(1),'bisi39buy','the street buy prompt');
  // the call; at the rail spot; buying across the rail
  run('hxAt(0,-4.0,6.5,[0,1]);hxAt(1,-4.8,6.5,[0,1]);');frames(1);assert.equal(label(0),'Call Aunty Bisi','the call');press(0);frames(260);b=B();assert(sameish(b.x,-4)&&sameish(b.z,7.55),'at the rail spot');
  assert.equal(label(0),'Buy from Aunty Bisi','the buy prompt across the rail');const t0=J('S.time'),m0=J('S.money'),mood0=J('[S.p[0].mood,S.p[1].mood,S.p[0].energy,S.p[1].energy]');
  run('PH="";TOASTS=[];');press(0);let ph=J('PH');assert(J('overlayOpen()'),'her panel');const t1=J('S.time');
  assert.deepEqual(primaries(ph).map(x=>x.act+':'+(x.data.v||'')),['bisi39Buy:puffpuff'],'one primary before a sale: puff-puff');assert(J('!!panelPrimary35(PH)'),'tune\'s one-button press finds it');
  assert(/AUNTY BISI/.test(ph)&&/Puff-puff, a nylon of five/.test(ph)&&/Groundnut, a small bottle/.test(ph),'the panel\'s wares');
  click('bisi39Buy',x=>x.data.v==='puffpuff');ph=J('PH');
  assert.equal(J('S.money'),m0-500,'₦500 spent');assert(logHas('buy','puffpuff39'),'buy puffpuff39');assert(J('!!hxB39G()'),'v39 discovered');assert.deepEqual(J('TOASTS'),[],'(fixer, DOD-7) no toast over her open panel');
  assert((ph.match(/<h2>([^<]*)<\/h2>/)||[])[1]==='Still warm. Enjoy. Anything else?','(fixer, C2 and C15) her line in her heading: '+(ph.match(/<h2>([^<]*)<\/h2>/)||[])[1]);
  const mood1=J('[S.p[0].mood,S.p[1].mood,S.p[0].energy,S.p[1].energy]');assert.deepEqual(mood1.map((v,k)=>v-mood0[k]),[3,3,5,5].map((v,k)=>Math.min(v,(k<2?100:100)-mood0[k])),'cheer +3 and energy +5 for both');
  assert.deepEqual(primaries(ph).map(x=>x.act),['bisi39Lift'],'one primary after a sale: Help her lift the tray');
  assert(ph.indexOf('data-act="bisi39Lift"')<ph.indexOf('data-v="groundnut"'),'(fixer, DOD-7) the lift above the items, on screen on a short phone');assert(buttons(ph).some(x=>x.disabled&&/Puff-puff, a nylon of five · Bought/.test(x.text)),'puff-puff Bought');
  click('bisi39Buy',x=>x.data.v==='groundnut');assert.equal(J('S.money'),m0-1000,'groundnut ₦500');assert.deepEqual(J('TOASTS'),[],'no toast yet');assert(/<h2>A small bottle, roasted this morning, salted just right\.<\/h2>/.test(J('PH')),'her groundnut line');
  run("dispatch('bisi39Buy',{v:'puffpuff'});");assert.equal(J('S.money'),m0-1000,'one of each an evening');frames(30);assert.equal(J('S.time'),t1,'no game time while her panel is open');void t0;
  assert.equal(J('S.dishes.length'),0,'nothing in S.dishes');
  // the Finds tip, after the first purchase of the evening
  const tip=J("(hxB39G().finds||null)");ph=J('PH');R.tip=tip;
  // Help her lift the tray: the pose, her bubble, the log
  // (fixer, S8) the lift: she holds her place, the tray (lowered while she served) goes up onto her head over 1.2 s, the players' hands go forward
  // and up to it, and her thanks come once it is up
  const lp=()=>J("(()=>{const g=players[0].g,B=BISI39,f=B.world.fig;g.updateMatrixWorld(true);const v=new THREE.Vector3();g.hero.handR.getWorldPosition(v);const t=new THREE.Vector3();B.world.tray.getWorldPosition(t);const hd=new THREE.Vector3();f.hero?f.hero.head.getWorldPosition(hd):hd.set(0,1.6,0);"+
   "const fx=Math.sin(g.rotation.y),fz=Math.cos(g.rotation.y),ex=t.x-g.position.x,ez=t.z-g.position.z,el=Math.hypot(ex,ez)||1;return {hand:Math.round(v.y*100)/100,tray:Math.round(t.y*100)/100,head:Math.round(hd.y*100)/100,toward:Math.round(((v.x-g.position.x)*ex/el+(v.z-g.position.z)*ez/el)*100)/100,at:[Math.round(f.position.x*1000)/1000,Math.round(f.position.z*1000)/1000]};})()");
  const lowT=J('(()=>{const t=new THREE.Vector3();BISI39.world.tray.getWorldPosition(t);return Math.round(t.y*100)/100;})()');
  click('bisi39Lift');assert.equal(J('overlayOpen()'),false,'the panel closes');assert.deepEqual(J('TOASTS'),['Puff-puff, five in a nylon.','A small bottle of groundnut.'],'the plain toasts as the panel closes');frames(3);const l0=lp();frames(15);const l1=lp();frames(12);const l2=lp();
  assert(lowT<1.35,'the tray lowered to her chest while she served: '+lowT);assert(l0.toward>0.3&&l1.toward>0.3,'the hands go forward to her tray: '+JSON.stringify([l0,l1]));
  assert(l1.hand>l0.hand+0.1&&l1.tray>l0.tray,'the hands and the tray rise together: '+JSON.stringify([l0,l1,l2]));assert.deepEqual(l2.at,l0.at,'she holds her place through the lift');
  frames(10);assert(J("hxLive39().includes('Help me small. Ehen. Thank you, my customer.')"),'her lift line once the tray is up');assert(logHas('bisi','lift'),'bisi lift');
  {const tr=J('(()=>{const t=new THREE.Vector3();BISI39.world.tray.getWorldPosition(t);return t.y;})()');assert(tr>l0.head,'the tray back on her head: '+JSON.stringify([tr,l0]));}
  frames(30);const pose2=J("(()=>{const g=players[0].g;g.updateMatrixWorld(true);const v=new THREE.Vector3();g.hero.handR.getWorldPosition(v);return v.y;})()");assert(pose2<1.3,'the pose over after 1.2 s: '+pose2);
  frames(150);b=B();assert(sameish(b.x,-4)&&sameish(b.z,8.8),'back at her stop after the sale: '+JSON.stringify(b));R.sale={money:-1000,toast:true,lift:true};
  // the tip names tomorrow's piece; the payoff only the next day
  if(tip){assert.equal(tip.day,J('S.day'),'the tip\'s day');const offer=J(`(()=>{const l=life34(),dk=((S.day+1-l.startDay)%3+3)%3;return [0,1,2,3,4].map(i=>FINDS34[dk*5+i]);})()`);assert(offer.includes(tip.piece),'tomorrow\'s offer has the '+tip.piece);
   if(offer.includes('armchair'))assert.equal(tip.piece,'armchair','the armchair first');
   assert(/I passed Finds on my way/.test(ph)&&ph.includes(J(`'the '+bisiPiece39(${JSON.stringify(tip.piece)})`)),'the tip in her panel');}
  // the taste with ₦400: once, no credit; the bag; a regular's evening; the payoff
  nextday();herDay();
  if(tip){const price=J(`paid34('${tip.piece}')`);run(`S.money=${price+400};hxAt(0,20.8,7.4,[0,-1]);`);frames(2);run("PH='';openLife34('market');");const mk=J('PH');const bb=buttons(mk).find(x=>x.act==='lifeBuy'&&x.data.t===tip.piece);
   assert(bb,'the '+tip.piece+' at Finds today');run('TOASTS=[];');run(`dispatch('lifeBuy',${JSON.stringify(bb.data)});`);const ts=J('TOASTS.slice(-1)')[0]||'';assert(/ is in Build storage\. Aunty Bisi was right about the /.test(ts),'the payoff toast: '+ts);
   run('closePanel();hxAt(0,-5.2,4.0);');R.payoff=ts;}
  run('S.money=400;');evening(17.1);kidsOut(1);const pm=streetPanel(0);void pm;const m2=J('S.money'),mo2=J('[S.p[0].mood,S.p[1].mood]');click('bisi39Buy',x=>x.data.v==='puffpuff');
  assert.equal(J('S.money'),m2,'no money taken');assert(/Taste am first\. Next time you go buy\./.test(J('PH')),'the taste');assert(logHas('bisi','taste'),'bisi taste');
  const mo3=J('[S.p[0].mood,S.p[1].mood]');assert.deepEqual(mo3.map((v,k)=>v-mo2[k]),[2,2].map((v,k)=>Math.min(v,100-mo2[k])),'cheer +2');
  {const bs=buttons(J('PH')).filter(x=>/Puff-puff, a nylon|Groundnut, a small|A bag for Kemi/.test(x.text));assert(bs.length>=2&&bs.every(x=>x.disabled&&!/₦/.test(x.text)),'(fixer, C3) after the taste the items show no price and cannot be pressed: '+JSON.stringify(bs));}
  run("TOASTS=[];dispatch('bisi39Buy',{v:'groundnut'});");assert.equal(J('S.money'),m2,'no credit');assert.deepEqual(J('[S.p[0].mood,S.p[1].mood]'),mo3,'one taste an evening');assert.equal(logCount('bisi','taste'),1,'logged once');
  assert.deepEqual(J('TOASTS'),[],'(fixer, C3) no toast at her tray');
  assert.equal(J('hxB39G().bisi.taste'),J('S.day'),'the taste recorded');
  // the bag for Kemi and Emeka: the children out at the pitch (a school day, from 15:30), bought, carried, given
  click('bisi39Close');frames(2);run('S.money=9000;');ph=streetPanel(0);assert(/A bag for Kemi and Emeka/.test(ph),'the bag offered while the children are out');click('bisi39Buy',x=>x.data.v==='kids');assert(J("hxTag39().includes('bag')"),'the bag in hand');
  assert.equal(J("hxB39G().bisi.kids&&hxB39G().bisi.kids.day"),J('S.day'),'the bag recorded');assert(logHas('buy','kids39'),'buy kids39');click('bisi39Close');frames(2);
  const kid=J("(()=>{const K=FOOTBALL37.kids;return K&&K.kemi?[K.kemi.pos[0],K.kemi.pos[1]]:null;})()");assert(kid,'Kemi at the pitch');
  run("FOOTBALL37.state='live';");approach(0,kid[0],kid[1],1.2,1.8);assert.notEqual(hsid(0),'bisi39kids','not during a live match');run("FOOTBALL37.state='idle';");frames(1);
  assert.equal(label(0),'Give Kemi and Emeka the puff-puff','the give prompt beats Play');press(0);frames(2);assert(!J("hxTag39().includes('bag')"),'the bag given');
  {const lv=J("hxLive39().filter(t=>!/^(Puff-puff|Groundnut)/.test(t)).sort()");assert.deepEqual(lv,['Auntie’s own is sweeter. But this one is hot.','Thank you o! Half half, Emeka. Fair is fair.'],'the children\'s two lines: '+JSON.stringify(lv));}assert(logHas('bisi','kids'),'bisi kids');
  run('hxAt(0,-5.2,4.0);');R.bag={given:true};
  // a regular's evening (bought on days 4 and 5): at her stop by herself; within 2.4 m from the rail and not at 2.5 m; the rail spot for the sale;
  // jara; the bag not given before the children go in, with its toast
  nextday();herDay();run('S.money=9000;');evening(17.1);kidsOut(1);b=B();assert(b.phase==='stop'&&b.x===-4&&b.z===8.8,'a regular\'s stop');
  const reach=[];for(const [x,z] of [[-4.0,6.66],[-5.05,6.66],[-2.95,6.66],[-4.0,6.2],[-4.6,6.5],[-4.0,6.35]]){run(`hxAt(0,${x},${z},[0,1]);hxAt(1,-8,-10);`);frames(1);reach.push(cands(0).includes('bisi39buy')?1:0);}
  assert.deepEqual(reach,[1,1,1,0,1,1],'within 2.4 m from the rail (x -5.05 to -2.95) and (fixer, S1) anywhere in front of the walkway, not behind it: '+JSON.stringify(reach));
  run('hxAt(0,-4.6,6.5,[0,1]);');frames(1);assert.equal(hsid(0),'bisi39buy','(fixer, S1) the pepper pot does not hide her at (-4.6, 6.5): '+JSON.stringify(cands(0)));
  run('hxAt(1,-3.5,10.0,[0,1]);');frames(1);assert.equal(hsid(1),'suya','south of her the suya stand wins at equal distance: '+JSON.stringify([B(),J(`(()=>{const p=players[1].g.position,list=[],d=(a,b)=>Math.hypot(p.x-a,p.z-b);for(const h of HOTSPOT_HOOKS){const r=h(1,list,d);if(r)return [r];}return list;})()`)]));run('hxAt(1,-20,9.8,[-1,0]);');
  run('hxAt(0,-4.0,6.6,[0,1]);');frames(1);run('TOASTS=[];');press(0);b=B();assert(sameish(b.x,-4)&&sameish(b.z,7.55),'at the rail spot during the panel: '+JSON.stringify(b));const ph0=J('PH');
  click('bisi39Buy',x=>x.data.v==='puffpuff');assert(logHas('bisi','jara'),'bisi jara');
  assert(/<h2>Five, and one jara\. Na so we dey do am for our people\. Enjoy\. Anything else\?<\/h2>/.test(J('PH')),'(fixer, C2) the jara line in her heading');
  assert(tip?/You bought the armchair\? I told you\./.test(ph0)||/You bought the [a-z ]+\? I told you\./.test(ph0):/Ah, my customer!/.test(ph0),'her greeting at the next sale: '+(J('PH').match(/<span class="name">Aunty Bisi<\/span>([^<]*)/)||[])[1]);click('bisi39Buy',x=>x.data.v==='kids');
  // (fixer, DOD-9) after a purchase, an item the purse cannot pay for is shown without a price and pressing it gives no taste
  {const mm=J('S.money');run("S.money=300;TOASTS=[];dispatch('bisi39Buy',{v:'groundnut'});");const pp=J('PH'),gb=buttons(pp).find(x=>/^Groundnut, a small bottle/.test(x.text));
   assert(gb&&gb.disabled&&!/₦/.test(gb.text),'groundnut shown without its price: '+JSON.stringify(gb));assert(!/Taste am first/.test(pp)&&J('hxB39G().bisi.taste')!==J('S.day'),'no taste after a purchase');
   assert.deepEqual(J('[S.money,TOASTS.length]'),[300,0],'nothing spent, no toast');run(`S.money=${mm};`);}
  click('bisi39Close');assert(J("TOASTS.includes('Six puff-puff in the nylon: five, and one extra.')"),'jara: the plain toast as her panel closes');frames(200);b=B();assert(sameish(b.x,-4)&&sameish(b.z,8.8),'back at her stop after: '+JSON.stringify(b));
  assert(J("hxTag39().includes('bag')"),'the bag in hand');run("dispatch('sitwait',{t:18.55});closePanel();hxAt(0,-8,-10);hxAt(1,-8,-10.5);TOASTS=[];");frames(20);
  assert(!J("hxTag39().includes('bag')"),'the bag gone when the children went in');assert(J("TOASTS.includes('Kemi and Emeka had already gone in. You shared the puff-puff yourselves instead.')"),'its toast');R.regular={reach:'2.4 m',jara:true,bagGone:true};
  // the waits: Today's row and the bench (after discovery, on her evening, before 17:00), landing at 17:00
  nextday();herDay();run('S.time=16.0;');pair();frames(2);const card=rowsCard();const row=J('bisiRow39()');assert(row&&/Aunty Bisi passes this evening from five/.test(row.html)&&/bisi39Wait/.test(row.btn),'Today\'s row and its wait: '+JSON.stringify(row));
  run("PH='';");run("dispatch('bisi39Wait');");assert.equal(J('S.time'),17,'Wait for Aunty Bisi lands at 17:00');run('closePanel();');void card;
  assert.equal(J('bisiRow39()&&bisiRow39().btn'),'','no wait offered from 17:00');
  nextday();herDay();run('S.time=16.0;');pair();frames(2);const offers=J("benchRestOffers36().map(o=>[o.label,o.t])");assert(offers.some(o=>o[0]==='Wait here for Aunty Bisi'&&o[1]===17),'the bench offer: '+JSON.stringify(offers));
  run('S.time=17.0;');assert(!J("benchRestOffers36().some(o=>o.label==='Wait here for Aunty Bisi')"),'not from 17:00');R.waits={today:'17:00',bench:'17:00'};
  // the tip's payoff only on the day after she named it: the same piece bought three days later says nothing of her
  disc();for(let k=0;k<3&&J('(()=>{const l=life34();return ((S.day+1-l.startDay)%3+3)%3;})()')!==1;k++)nextday();run('S.money=9000;');evening(17.1);streetPanel(1);click('bisi39Buy',x=>x.data.v==='groundnut');click('bisi39Close');
  const tip2=J('hxB39G().finds');assert(tip2&&tip2.piece==='armchair','the armchair named again: '+JSON.stringify(tip2));for(let k=0;k<4;k++)nextday();
  run(`S.money=${J("paid34('armchair')")+100};hxAt(0,20.8,7.4,[0,-1]);`);frames(2);run("PH='';openLife34('market');");const bb2=buttons(J('PH')).find(x=>x.act==='lifeBuy'&&x.data.t==='armchair');assert(bb2,'the armchair at Finds three days later');
  run('TOASTS=[];');run(`dispatch('lifeBuy',${JSON.stringify(bb2.data)});closePanel();`);const ts2=J('TOASTS.slice(-1)')[0]||'';assert(/ is in Build storage\.$/.test(ts2),'no payoff on another day: '+ts2);R.payoffOtherDay=ts2;
  // (fixer, S3) a pair who walked away from the pitch together: the children went in, but their window is open, so the bag is offered; (DOD-6) a
  // reload with it in hand keeps it; walking back brings the children out again (football's own spawn) and it is given
  nextday();herDay();run('S.money=9000;');evening(17.05);kidsOut(1);run('hxAt(0,-0.5,9.8,[0,-1]);hxAt(1,-1.1,9.8,[0,-1]);');
  for(let k=0;k<60&&J('!!(FOOTBALL37.kids&&!FOOTBALL37.kids.kemi.gone)');k++)frames(10);assert(J('!(FOOTBALL37.kids&&!FOOTBALL37.kids.kemi.gone)'),'Kemi and Emeka went in when everyone walked away');
  ph=streetPanel(0);assert(buttons(ph).some(x=>x.act==='bisi39Buy'&&x.data.v==='kids'&&!x.disabled),'(fixer, S3) the bag offered after they went in, their window still open: '+JSON.stringify(buttons(ph).map(x=>(x.data.v||x.act)+(x.disabled?'(off)':''))));
  click('bisi39Buy',x=>x.data.v==='kids');click('bisi39Close');frames(2);run('save();S=load();enterWorld();closePanel();');frames(12);
  assert(J("hxTag39().includes('bag')"),'(fixer, DOD-6) the bag back in hand after a reload');kidsOut(0);
  {const k3=J("[FOOTBALL37.kids.kemi.pos[0],FOOTBALL37.kids.kemi.pos[1]]");approach(0,k3[0],k3[1],1.2,1.8);assert.equal(label(0),'Give Kemi and Emeka the puff-puff','the give prompt after walking back');press(0);frames(2);}
  assert.equal(J('hxB39G().bisi.kids.given'),J('S.day'),'the bag given');R.bagWalkedHome={offered:true,reload:true,given:true};
  // (fixer, DOD-4) a companion household with the companion beside you: the payoff follows "storage." and the companion's line comes after it
  run('hxCompanion(3,12.02);');frames(4);pickNow(0);giveNow(0,'nkechi');run('life34().evening35={doneDay:3};');nextday();
  for(let k=0;k<3&&J('(()=>{const l=life34();return ((S.day+1-l.startDay)%3+3)%3;})()')!==1;k++)nextday();
  run('S.money=9000;');evening(17.1);streetPanel(0);click('bisi39Buy',x=>x.data.v==='groundnut');click('bisi39Close');const tipC=J('hxB39G().finds');assert(tipC&&tipC.piece,'her tip in the companion household: '+JSON.stringify(tipC));
  nextday();run(`S.money=${J("paid34("+JSON.stringify(tipC.piece)+")")+400};hxAt(0,20.8,7.4,[0,-1]);hxAt(1,21.5,7.6,[0,-1]);`);frames(2);run("PH='';openLife34('market');");
  {const bc=buttons(J('PH')).find(x=>x.act==='lifeBuy'&&x.data.t===tipC.piece);assert(bc,'the '+tipC.piece+' at Finds');run('TOASTS=[];');run(`dispatch('lifeBuy',${JSON.stringify(bc.data)});closePanel();`);
   const tc=J('TOASTS.slice(-1)')[0]||'';assert(/ is in Build storage\. Aunty Bisi was right about the [^.]+\./.test(tc),'(fixer, DOD-4) the payoff with the companion beside you: '+tc);R.payoffCompanion=tc;}
  return R;});

 check(7,()=>{const R={};assert(has39(),'the module');
  // on her evening (day 4, the first gist evening): she is gone by 18:10 and the gist starts by 18:16 (no match)
  disc();evening(17.8);pair();assert(J('hxB().vis'),'there at 17:48');to(18.1667+0.0002);assert.equal(J('hxB().vis'),false,'hidden by 18:10');assert.equal(J('bisiTonight39().phase'),'off','her phase at 18:10: off');
  for(let k=0;k<12;k++){frames(10);assert.equal(J('hxB().vis'),false,'still hidden at '+J('S.time').toFixed(3));}
  let st=waitStart(2400);assert(st>=0,'a gist');let t=J('S.time');assert(t>=18.25-1e-6&&t<=18+16/60,'the gist starts by 18:16: '+t);
  let vis=0,v39=0;const v=visit();if(v)v39=v.script.filter(s=>s.v39).length;for(let k=0;k<200&&EV()!=='idle';k++){frames(10);if(J('hxB()&&hxB().vis'))vis++;}assert.equal(vis,0,'never visible in a visit');assert(v39<=2,'at most two v39 lines');
  // after a match at 18:20
  nextday();herDay();evening(18.1);pair();run("FOOTBALL37.state='idle';FOOTBALL37.lastMatchDay=S.day;");st=waitStart(3000);t=J('S.time');assert(st>=0&&t>=18+20/60-1e-6&&t<18+21.5/60,'after a match at 18:20: '+t);untilIdle();run('FOOTBALL37.lastMatchDay=0;');
  // the sofa's 18:12 then the gist by 18:16
  nextday();herDay();run('S.time=16.0;{const sp=sofaPos();hxAt(0,sp[0]-0.3,sp[1]+0.6,[0,-1]);hxAt(1,sp[0]+0.3,sp[1]+0.6,[0,-1]);}');frames(2);
  run('PH="";');press(0);let ph=J('PH');const sit=buttons(ph).find(x=>x.act==='sitwait'&&+x.data.t===18.2);assert(sit,'the sofa\'s "Sit until the evening"');run(`dispatch('sitwait',${JSON.stringify(sit.data)});closePanel();`);
  assert.equal(J('S.time'),18.2,'18:12');st=waitStart(1200);t=J('S.time');assert(st>=0&&t<=18+16/60,'the gist by 18:16: '+t);untilIdle();
  // the bench's and Today's waits to 18:15
  nextday();herDay();run("life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i95',type:'bench',x:0,y:4,rot:0,pose36:'out'});save();S=load();enterWorld();closePanel();hxFrames(1);");
  run('S.time=17.2;hxAt(0,-5.9,6.4,[-1,0]);hxAt(1,-5.1,6.5,[-1,0]);');frames(2);assert.equal(label(0),'Sit on the bench together','the bench');press(0);frames(3);run('PH="";');press(0);ph=J('PH');
  for(const s of ['Ada’s bench','Wait here until the neighbours come','Sit for a minute','Stand up'])assert(ph.includes(s),'the bench page keeps "'+s+'"');
  const w=buttons(ph).find(x=>x.act==='bench36Wait'&&+x.data.t===18.25);assert(w,'the 18:15 wait');run(`dispatch('bench36Wait',${JSON.stringify(w.data)});closePanel();`);assert.equal(J('S.time'),18.25,'bench36Wait lands at 18:15');
  st=waitStart(1200);assert(st>=0,'its gist');untilIdle();
  nextday();herDay();run('S.time=17.2;');pair();frames(2);run("dispatch('gist38Wait');closePanel();");assert.equal(J('S.time'),18.25,'gist38Wait lands at 18:15');st=waitStart(1200);assert(st>=0,'its gist');untilIdle();
  // ?gist=now at 17:30 hides her at once
  nextday();herDay();evening(17.5);pair();assert(J('hxB().vis'),'there at 17:30');
  run("hxF().flags.now=true;");st=waitStart(600);assert(st>=0,'?gist=now starts a visit');vis=0;for(let k=0;k<200&&EV()!=='idle';k++){if(J('hxB()&&hxB().vis'))vis++;frames(10);}
  run("hxF().flags.now=false;hxF().flags.parsed=false;");assert.equal(vis,0,'never visible while EVENING35 is not idle');
  R.gist={noMatch:'by 18:16',match:'18:20',sofa:'by 18:16',waits:'18:15',gistNow:'hidden'};
  // (fixer, DOD-8) the bag not given when the children go in during a gist: v39 makes no save() while the visit runs; its toast after Goodnight
  nextday();herDay();run("S.money=9000;if(!FOOTBALL37.kids&&FOOTBALL37.state==='idle')FOOTBALL37.state='off';FOOTBALL37.lastMatchDay=0;");evening(17.2);kidsOut(1);run('hxAt(0,-4.6,6.4,[0,1]);');frames(3);streetPanel(0);click('bisi39Buy',x=>x.data.v==='kids');click('bisi39Close');
  run(`hxAt(0,-5.2,6.4,[0,1]);TOASTS=[];var hxSvV39={n:0};{const sv=save;save=function(){if(typeof GIST38!=='undefined'&&GIST38.visit&&String(new Error().stack||'').includes('seller-v39.js'))hxSvV39.n++;return sv.apply(this,arguments);};}`);
  to(18.25);assert(waitStart(3000)>=0,'the gist');waitTalk();for(let k=0;k<300&&EV()==='talking'&&!J('hxB39G().bisi.kids.gone');k++)frames(10);
  assert.equal(J('hxB39G().bisi.kids.gone'),J('S.day'),'the bag gone as the children went in, mid-gist');assert.equal(J('hxSvV39.n'),0,'(fixer, DOD-8) no save() by v39 while the visit runs');
  untilIdle();frames(20);assert(J(`TOASTS.includes(${JSON.stringify('Kemi and Emeka had already gone in. You shared the puff-puff yourselves instead.')})`),'its toast after Goodnight');R.bagInGist={saves:0,toast:true};
  return R;});

 check(10,()=>{const R={};assert(has39(),'the module');
  const keysOf=()=>J('[Object.keys(JSON.parse(localStorage.getItem(KEY))).join(),Object.keys(JSON.parse(localStorage.getItem(KEY)).life||{}).join()]');
  // v35, v36, v37 and v38 saves: each loads, runs 60 frames on her evening and saves with the keys unchanged and no G.b39
  const fx={};
  run('hxFresh(5,17.1);life34().evening35={doneDay:3};save();');fx.v35=1;
  const one=name=>{const k0=keysOf();run('S=load();enterWorld();closePanel();');frames(60);run('save();');const k1=keysOf();assert.deepEqual(k1,k0,name+': the keys of S and S.life');
   assert.equal(J('!!(JSON.parse(localStorage.getItem(KEY)).life.gist38&&JSON.parse(localStorage.getItem(KEY)).life.gist38.b39)'),false,name+': no G.b39');};
  one('v35');run("S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i95',type:'bench',x:0,y:4,rot:0,pose36:'out'});save();");one('v36');
  run("S.life.football37={v:2,found:2,played:1,last:{day:S.day-1}};save();");one('v37');
  run('hxFresh(3,12.02);');away(1);frames(4);pickNow(0);run('life34().evening35={doneDay:3};');nextday();run('S.time=17.1;save();');one('v38');assert(J('hxB().vis'),'she walks the street on a v38 save\'s evening');R.saves=['v35','v36','v37','v38'];
  // a v39 save (bought from) loads and plays in the v38 build: a copy of dist without the v39 tags
  run('S.money=9000;');streetPanel(1);click('bisi39Buy',x=>x.data.v==='puffpuff');click('bisi39Close');run('save();');assert(J('!!hxB39G()'),'a v39 record');
  {const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'cd39-save-'));const f=path.join(tmp,'save.json');fs.writeFileSync(f,J('localStorage.getItem(KEY)'));const d=variantDir(html=>strip(html,TAGS39));
   try{const r=JSON.parse(cp.execFileSync(process.execPath,[__filename,'--loadsave',f],{env:{...process.env,COMPOUND_GAME_DIR:d},encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop());
    assert(!r.error,'the v38 build on a v39 save: '+r.error);assert.equal(r.v39,false,'no v39 there');assert.equal(r.b39,true,'the v39 record kept by the v38 build');R.v38build=r;}
   finally{fs.rmSync(tmp,{recursive:true,force:true});fs.rmSync(d,{recursive:true,force:true});}}
  assert.equal(J('!!(stripState().life&&stripState().life.gist38)'),false,'stripState drops life.gist38');
  // online: no v39 object; offline: back
  assert(J('hxB().vis'),'there');run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");frames(12);assert.deepEqual(tags(),[],'online: no v39 object');
  run('NET.on=false;');frames(12);assert(J('hxB().vis'),'offline: back');
  // teardown with her figure, a bubble and the bag out: newconfirm, newgame, an enterWorld into day 2, online
  const full=()=>{run("S.money=9000;");frames(2);const t=tags();assert(t.includes('bisi'),'her figure: '+JSON.stringify(t));};
  full();run('ACTIONS.newconfirm();');assert.deepEqual(tags(),[],'after newconfirm');run('closePanel();');frames(12);assert(J('hxB().vis'),'"No, keep it": back');
  run("dispatch('newgame');");assert.deepEqual(tags(),[],'after newgame');
  disc();evening(17.1);kidsOut(0);run('S.money=9000;');streetPanel(1);click('bisi39Buy',x=>x.data.v==='kids');click('bisi39Close');frames(2);const t1=tags();assert(t1.includes('bag')&&t1.includes('bisi'),'the bag and her figure: '+JSON.stringify(t1));
  run('S.day=2;enterWorld();closePanel();');assert.deepEqual(tags(),[],'after an enterWorld into day 2');frames(12);assert.deepEqual(tags(),[],'and it stays down');
  disc();evening(17.1);assert(tags().includes('bisi'),'there');run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");frames(12);assert.deepEqual(tags(),[],'after going online');run('NET.on=false;');
  R.teardown=['newconfirm','newgame','enterWorld day 2','online'];
  // quiet construction: no Math.random call inside her builds (hero, then lite with the hero not ready, rebuilt once when it is), her bubbles, the bag
  run("dispatch('newgame');");disc();run('hxQC.n=0;');evening(17.1);assert(J('hxB().vis'),'built (hero)');const qh=J('hxQC.n');assert(J('!BISI39.world.lite'),'the hero rig');
  run("dispatch('newgame');");disc();run("HERO.state='loading';hxQC.n=0;");evening(17.1);const lite=J('BISI39.world.lite');const ql=J('hxQC.n');run("HERO.state='ready';");frames(12);const rebuilt=J('!BISI39.world.lite');const qr=J('hxQC.n');
  kidsOut(0);run('S.money=9000;');streetPanel(1);click('bisi39Buy',x=>x.data.v==='kids');click('bisi39Close');frames(2);const qb=J('hxQC.n');
  assert(lite&&rebuilt,'the lite body while the hero is not ready, then the hero once: '+JSON.stringify([lite,rebuilt]));assert.deepEqual([qh,ql,qr,qb],[0,0,0,0],'Math.random calls in her builds [hero, lite, rebuild, bubbles and bag]');R.quiet={hero:0,lite:0,rebuild:0,bag:0};
  // no wall-clock read and no Math.random draw by seller-v39.js; the source says the same
  assert.deepEqual(J('[hxDirect39.pn,hxDirect39.dn,hxDirect39.mr]'),[0,0,0],'direct reads [performance.now, Date.now, Math.random]');
  {const src=fs.readFileSync(path.join(GAME,'src','seller-v39.js'),'utf8');assert(!/performance\.now|Date\.now|new Date|Math\.random\(\)|showBubble\(/.test(src),'a wall-clock read, a Math.random call or the base showBubble in seller-v39.js');}
  // the cost: an inert frame (day 3, 10:00) and frames with her in the street: no blocked() or levelAt() call, no new object
  run('hxFresh(3,10);');away(1);frames(2);const b0=J('BISI39.cost.builds');run('hxCost39.b=0;hxCost39.l=0;');frames(600);const inert=J('[hxCost39.b,hxCost39.l,hxTag39().length,BISI39.cost.builds-'+b0+']');
  assert.deepEqual(inert,[0,0,0,0],'an inert frame: [blocked, levelAt, objects, builds] over 600 frames');
  disc();evening(17.1);run('hxAt(1,-0.5,9.8,[0,-1]);hxCost39.b=0;hxCost39.l=0;');frames(600);const street=J('[hxCost39.b,hxCost39.l]');assert.deepEqual(street,[0,0],'600 frames with her in the street: [blocked, levelAt]');
  R.cost={inert:'0 blocked, 0 levelAt, 0 objects over 600 frames',street:'0 blocked, 0 levelAt',steps:J('BISI39.cost.steps')>0};
  return R;});

 check(11,()=>{const R={};assert(has39(),'the module');
  // the pair inside the flat on day 4 (the first gist): they walk to the rail when the guests arrive, by the door
  const W=side.walk11;assert(W&&!W.error,'the glide run: '+(W&&W.error));const {gl,walk,frm,door,targets,fin}=W;
  assert(gl>0&&targets,'the glide ran');for(const k in frm)assert(walk[k]/frm[k]>=0.9,'the walk clip on '+(walk[k]||0)+' of '+frm[k]+' glide frames for player '+k);assert(door,'by the door (x -4.1, z 5.0 to 6.4)');
  for(const k in targets){const v=W.v38spots&&W.v38spots[k];assert(v&&Math.abs(fin[k][0]-v[0])<=0.001&&Math.abs(fin[k][1]-v[1])<=0.001,'player '+k+' on gistRailSpots38\'s spot: '+JSON.stringify([fin[k],v]));}
  for(const k in targets){assert(Math.abs(fin[k][0]-targets[k][0])<=0.001&&Math.abs(fin[k][1]-targets[k][1])<=0.001,'player '+k+' on the spot v38 chose: '+JSON.stringify([fin[k],targets[k]]));}
  // the path round the furniture (cut item 3, built): both started inside, both planned; for 33 free starts inside a default flat the planned way to
  // the door is clear at r 0.3 (every 0.1 m) and ends on the door's inner step
  assert(W.plans&&Object.values(W.plans).every(x=>x),'the path planned for each player starting inside: '+JSON.stringify(W.plans));
  run("dispatch('newgame');");disc();const P33=J(`(()=>{const out=[];for(let z=2.3;z<=5.6&&out.length<33;z+=0.35)for(let x=-7.6;x<=-2.9&&out.length<33;x+=0.4){if(blocked(x,z,PR)||!inFlat(x,z))continue;
   const p=railPath39(x,z,[GIST38.RAIL.DOOR[0],GIST38.RAIL.DOOR[1]]);let bad=0,len=0,a=[x,z];if(p)for(const b of p){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/0.1));len+=L;for(let k=1;k<=n;k++){const px=a[0]+(b[0]-a[0])*k/n,pz=a[1]+(b[1]-a[1])*k/n;if(blocked(px,pz,0.3))bad++;}a=b;}
   out.push({x:Math.round(x*100)/100,z:Math.round(z*100)/100,ok:!!p,bad,end:p?p[p.length-1]:null,len:Math.round(len*100)/100});}return out;})()`);
  assert.equal(P33.length,33,'33 free starts inside');const broken=P33.filter(p=>!p.ok||p.bad||Math.abs(p.end[0]+4.1)>1e-9||Math.abs(p.end[1]-5.05)>1e-9);assert.deepEqual(broken,[],'every planned path clear at r 0.3 to the door');
  // the shelf picture (cut item 2, built): null in Node; with a recording stand-in for the renderer it renders once into its own target, puts the
  // previous target back, caches until the shelf rebuilds, and "See your shelf" shows it above the lists; with no shelf, v38's panel
  run('hxFresh(3,12.02);');away(1);frames(4);pickNow(0);run("S.money=9000;dispatch('gist38Shelf');");giveNow(0,'nkechi');nextday();frames(4);assert(J('!!(hxF().world.shelf)'),'the shelf up');
  assert.equal(J('shelfShot39()'),null,'shelfShot39 null in Node');run("PH='';dispatch('gist38ShelfView');");assert(!/gist39-shot/.test(J('PH')),'no picture without a renderer');run('closePanel();');
  run(`var hxRT={cur:'PREV',n:0,reads:0};var hxCE=document.createElement;renderer={getRenderTarget:()=>hxRT.cur,setRenderTarget:t=>{hxRT.cur=t;},render:(sc,c)=>{hxRT.n++;hxRT.cam=[c.position.x,c.position.y,c.position.z].map(v=>Math.round(v*100)/100);},readRenderTargetPixels:()=>{hxRT.reads++;}};
   document.createElement=function(t){const e=hxCE.apply(this,arguments);if(t==='canvas')e.toDataURL=()=>'data:image/jpeg;base64,QUJD';return e;};`);
  let shot;try{const u1=J('shelfShot39()'),st1=J('[hxRT.cur,hxRT.n,hxRT.reads]'),u2=J('shelfShot39()'),n2=J('hxRT.n');run("PH='';dispatch('gist38ShelfView');");const ph=J('PH');run('closePanel();');
   shot={u1,st1,u2,n2,cam:J('hxRT.cam'),img:/<img class="gist39-shot" src="data:image\/jpeg;base64,QUJD"/.test(ph),lists:/Keepsakes/.test(ph)};}
  finally{run('renderer=undefined;document.createElement=hxCE;');}
  assert.equal(shot.u1,'data:image/jpeg;base64,QUJD','a JPEG data URL');assert.deepEqual(shot.st1,['PREV',1,1],'rendered once into its own target, read back, the previous target put back');
  assert.equal(shot.u2,shot.u1,'cached');assert.equal(shot.n2,1,'no second render while the shelf is unchanged');assert(shot.img&&shot.lists,'the picture above the lists in "See your shelf"');
  R.walk={frames:frm,walking:walk,door,spots:'as v38 chose',planned:W.plans};R.paths={starts:33,clear:true,longest:Math.max(...P33.map(p=>p.len))};R.shot={node:null,rendered:1,restored:true,cached:true,camera:shot.cam,panel:true};
  return R;});

 /* ======================================================================================================================================
    Engineer B's checks: 4, 5, 6, 8, 9, 12 (added by engineer B)
    ====================================================================================================================================== */
 // ---- B BEGIN ----
 // engineer B's steps. A save fixture (hxFix39) is the game's own save() and load() with v38's record edited in between (spec §16: checks 8's
 // reloads; v38 state a few real actions cannot reach in reasonable time: a set complete, the seventh back, a later round). It never writes
 // G.b39: v39 is discovered in these checks by a real purchase across Aunty Bisi's panel, a v39 line shown at a gist, or round two starting.
 run(`var hxFix39=fn=>{save();const o=JSON.parse(localStorage.getItem(KEY));fn(o,o.life.gist38);localStorage.setItem(KEY,JSON.stringify(o));S=load();enterWorld();closePanel();hxFrames(2);};
  var hxSv39={inNext:0,n:0};{const sv=save;save=function(){if(hxSv39.inNext)hxSv39.n++;return sv.apply(this,arguments);};
   if(typeof EVENING35!=='undefined'&&EVENING35){const nx=EVENING35.next;EVENING35.next=function(){hxSv39.inNext++;try{return nx.apply(this,arguments);}finally{hxSv39.inNext--;}};}}
  var hxLC39=[];if(typeof ACTIONS!=='undefined'&&ACTIONS.lifeCatch){const lc=ACTIONS.lifeCatch;ACTIONS.lifeCatch=function(d){hxLC39.push(d&&d.v);return lc.apply(this,arguments);};}
  var hxPlan39=()=>{const p=gistPlan38();return {guests:p.guests.slice(),first:p.first,ids:p.script.map(s=>s.id),kinds:p.script.map(s=>s.v39k||''),slots:p.script.filter(s=>s.v39).length,
   opens:p.script.map(s=>s.open?s.k:''),tips:p.tips.map(t=>t.kind+':'+(t.mode||'')+':'+t.arg+':'+t.teller),texts:p.script.map(s=>s.text),g39:p.script.g39||null};};`);
 const SEEN39=[];const seen=(...t)=>{for(const x of t)if(typeof x==='string'&&x)for(const y of x.replace(/<[^>]+>/g,'\n').split('\n')){const z=y.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();if(z)SEEN39.push(z);}};
 const has39b=()=>J("typeof GIST39!=='undefined'&&!!GIST39");
 // Today's card rows [key, text] (v38's), a catch at the rocks (v38's) and settling it by selling
 const rows=()=>{run("PH='';openLife34('today');");const h=J('PH');run('closePanel();');const m=h.match(/<div class="life-note34 gist38-card">[\s\S]*?<\/div>/);seen(m?m[0]:'');
  return {html:h,card:m?m[0]:'',rows:m?[...m[0].matchAll(/data-row="(\w+)">([^<]*)</g)].map(x=>[x[1],x[2]]):[]};};
 const catchNow=()=>{run('hxAt(0,12.3,13.6);');frames(2);run("dispatch('lifeFish');");run("dispatch('lifeCast');");for(let f=0;f<400&&J("!!(LIFE34.fish&&LIFE34.fish.phase==='waiting')");f+=10)frames(10);
  assert.equal(J("LIFE34.fish&&LIFE34.fish.phase"),'bite','a bite');run("dispatch('lifeReel');");return {card:J('PH'),id:J('S.life.catch&&S.life.catch.id'),t:J('S.time')};};
 const settle=()=>{run("dispatch('lifeCatch',{v:'sell'});closePanel();");};
 // a household that has given all seven back (no lost thing out, no pocket: the rota's pairs are v38's plain ones)
 const ALL7="G.lost={i:6,since:3,at:12,status:'back',heard:0,told:0,ownerTold:0};G.keep.keepsake=['fan','bird','plate','print','record'];";
 const fix39=code=>run(`hxFix39((o,G)=>{${code}});`);
 const plan39=()=>J('hxPlan39()');
 const b39=()=>J('hxB39G()');
 const btnLabel39=()=>J("typeof EVENING35!=='undefined'&&EVENING35.el?((String(EVENING35.el.innerHTML).match(/evening35-next\">([^<]*)/)||[])[1]||''):''");
 // the plan is pure: twice deep-equal, the state unchanged, GIST38.GUESTS and found38Today put back
 const pure39=w=>{const r=J(`(()=>{const G0=GIST38.GUESTS.slice(),T0=found38Today,s0=JSON.stringify(S),a=JSON.stringify(gistPlan38()),b=JSON.stringify(gistPlan38());
   return {twice:a===b,state:JSON.stringify(S)===s0,guests:JSON.stringify(GIST38.GUESTS)===JSON.stringify(G0)&&GIST38.GUESTS.length===5,today:found38Today===T0};})()`);
  assert.deepEqual(r,{twice:true,state:true,guests:true,today:true},(w||'')+': the plan is pure and puts GIST38.GUESTS and found38Today back');};
 // a day (from 'from') whose plan, with G.last set to last (the day before), meets cond; the state is put back after each try
 const dayWhere39=(from,to,last,cond,off)=>J(`(()=>{const G=hxG(),d0=S.day,l0=G.last,k=${JSON.stringify(off||'')},had=k&&(k in G.once);if(k)G.once[k]=1;
   try{for(let d=${from};d<=${to};d++){S.day=d;G.last=${last?`{day:d-1,guests:${JSON.stringify(last)},tips:[],ids:[]}`:'l0'};
   const p=hxPlan39();if((${cond})(p))return d;}return -1;}finally{S.day=d0;G.last=l0;if(k&&!had)delete G.once[k];}})()`);
 // every line of a gist by P1's Act (Listen), each line's id and button as shown and the save() calls made inside that Next; then the record
 const talk39=(onLine)=>{const out=[];for(let k=0;k<30&&EV()==='talking';k++){const s=lineNow();if(!s)break;s.btn=btnLabel39();out.push(s);frames(12);run('hxSv39.n=0;');
   run('hxPress(0);hxFrames(1);hxRelease(0);hxFrames(2);');s.saves=J('hxSv39.n');if(onLine)onLine(s);}return out;};
 const gist39=(onLine)=>{const st=waitStart(3000);if(st<0)return null;const v=visit(),toasts0=J('TOASTS.length');const tk=waitTalk();if(tk<0)return {v,shown:[],aborted:true};
  const shown=talk39(onLine);const end=untilIdle();return {v,shown,end,toasts:J(`TOASTS.slice(${toasts0})`)};};
 const ids39=g=>g.shown.map(s=>s.id);
 // a talk with neighbour k by the base's talk hotspot act ("Talk to ..."); the panel's text
 const talkTo39=k=>{assert(settled(k),k+' is there');const p=J(`[npcs.${k}.g.position.x,npcs.${k}.g.position.z]`);approach(0,p[0],p[1],1.1,2.0);run(`PH='';dispatch('hs',{i:0,id:'talk:${k}'});`);const ph=J('PH');run('closePanel();');return ph;};
 const text39=t=>J(`esc(${JSON.stringify(t)})`);
 // v39 discovered by a real purchase: on Aunty Bisi's evening (bisiDay39), puff-puff across her panel on the street, then her quiet Close
 const buy39=()=>{herDay();run('S.money=Math.max(S.money,3000);');evening(17.12);const ph=streetPanel(0);seen(ph);click('bisi39Buy',b=>b.data.v==='puffpuff');click('bisi39Close');assert(b39(),'v39 discovered by the purchase');};

 /* ---------- check 4: the set thank-you (spec §6.1, §6.2, §8.2) ---------- */
 check(4,()=>{const R={};assert(has39b(),'the module');const L=J('GIST39.LINES.thanks');
  disc();const d0=J('S.day');
  // the shells, completed with the shelf up: Ada forced in on a plain night (no lost thing, no pocket: the seventh is back); the kept guest is
  // the one of v38's pair not in last night's
  fix39(ALL7+"G.shelf={state:'up',day:3,upDay:4};G.keep.shells=['cockle','olive','periwinkle','murex','cowrie'];G.sets={keepsake:4,shells:6};G.once['thank39:keepsake']=4;G.eve={day:5,n:3,first:4};o.day=6;o.time=18.2;");
  // v38's own plan for the day (the thank-you switched off for the one call by its once key) and with GUESTS narrowed
  const ref=(set,list)=>J(`(()=>{const G=hxG(),k='thank39:${set}',had=k in G.once,keep=GIST38.GUESTS;G.once[k]=1;try{${list?`GIST38.GUESTS=${JSON.stringify(list)};`:''}return hxPlan39();}finally{GIST38.GUESTS=keep;if(!had)delete G.once[k];}})()`);
  const last1=['tunde','oyelaran'];
  const d1=dayWhere39(7,40,last1,"p=>!p.guests.includes('ada')&&!p.tips.some(t=>/^lost/.test(t))&&p.guests.some(k=>!"+JSON.stringify(last1)+".includes(k))&&p.guests.some(k=>"+JSON.stringify(last1)+".includes(k))",'thank39:shells');
  assert(d1>0,'a plain night without Ada');
  fix39(`G.last={day:${d1-1},guests:${JSON.stringify(last1)},tips:[],ids:[]};G.eve={day:${d1-1},n:3,first:4};o.day=${d1};o.time=18.2;`);
  const p0=ref('shells'),kept=p0.guests.find(k=>!last1.includes(k));let p=plan39();pure39('shells');
  assert(p.guests.includes('ada')&&p.guests.includes(kept),'Ada forced in beside '+kept+' (not in last night’s pair): '+JSON.stringify([p0.guests,p.guests]));
  {const r=ref('shells',[kept,'ada']),k=p.ids.indexOf(L.shells[0]);assert(k>=0&&p.opens[k]==='ada'&&p.kinds[k]==='thank','Ada’s greeting is the thank-you: '+JSON.stringify(p.ids));
   assert.deepEqual(p.ids.map((id,j)=>j===k?'OPENER':id),r.ids.map((id,j)=>r.opens[j]==='ada'?'OPENER':id),'the rest is v38’s own script for the narrowed pair');assert.equal(p.slots,0,'a thank-you takes no slot');}
  R.shells={day:d1,v38:p0.guests,forced:p.guests,kept};
  // the gist itself: the thank-you shown; afterwards friendship +1, the once key, b39 (discovery), the log; the next night no second thank-you
  const aff0=J('S.nb.ada.aff|0');assert.equal(b39(),null,'no b39 before');pair();const g=gist39();assert(g&&!g.aborted,'a gist');assert(ids39(g).includes(L.shells[0]),'the thank-you shown: '+JSON.stringify(ids39(g)));
  assert.equal(J('S.nb.ada.aff|0'),aff0+1,'friendship +1');assert.equal(J("hxG().once['thank39:shells']"),d1,'the once key');assert(b39()&&b39().thanked.shells===d1,'v39 discovered, thanked recorded');
  assert(logHas('thanks','set:shells'),'thanks set:shells logged');assert.deepEqual(J('hxG().last.ids'),ids39(g),'G.last.ids are the lines shown');
  nextday();run('S.time=18.2;');pair();frames(1);assert(!plan39().ids.some(id=>/^gs39-th-/.test(id)),'once per set');R.shellsGist={shown:ids39(g).length,once:true};
  // the carvings (days 12, 14 and 15): Ada and Mr. Bassey, both greetings swapped; the photograph the next morning, the print the morning after
  R.carve={};for(const d of [12,14,15]){fix39(`G.keep.carve=['tilapia','mullet','bonga','croaker','snapper','catfish'];G.sets.carve=${d-1};G.last={day:${d-1},guests:['ada','nkechi'],tips:[],ids:[]};G.eve={day:${d-1},n:5,first:4};o.day=${d};o.time=18.2;`);
   const q0=ref('carve');p=plan39();pure39('carvings day '+d);assert.deepEqual(p.guests.slice().sort(),['ada','bassey'],'day '+d+': Ada and Mr. Bassey: '+JSON.stringify(p.guests));
   assert(p.ids.includes(L.carve[0])&&p.ids.includes(L.adaR[0]),'day '+d+': both greetings swapped: '+JSON.stringify(p.ids));R.carve[d]={v38:q0.guests,forced:p.guests};}
  pair();const items0=J('hxF().world.shelf?hxF().world.shelf.userData.items:-1');const gc=gist39();assert(ids39(gc).includes(L.carve[0])&&ids39(gc).includes(L.adaR[0]),'the carvings’ thank-you shown');
  seen(...gc.shown.map(s=>s.text));run('TOASTS=[];');nextday();let t=J('TOASTS.slice()');const P=J('GIST39.UI');seen(...t);
  assert(t.includes(P.photoToast),'the photograph the next morning: '+JSON.stringify(t));assert(J(`S.memories.some(m=>m.caption===${JSON.stringify(P.photoCaption)}&&m.day===S.day&&m.pid)`),'the album memory (the caption, in Node with no image)');
  assert.equal(b39().photo.state,'taken','taken');assert(logHas('thanks','photo'),'thanks photo logged');assert(!J("hxTag39().includes('print')"),'no print yet');
  run('TOASTS=[];');nextday();t=J('TOASTS.slice()');seen(...t);assert(t.includes(P.printToast),'the print the morning after');assert.equal(b39().photo.state,'framed','framed');frames(10);
  const pr=J("(()=>{let p=null;scene.traverse(o=>{if(o.userData&&o.userData.gist39==='print')p=o;});const sh=hxF().world.shelf;let inside=false;if(sh&&p)sh.traverse(o=>{if(o===p)inside=true;});return p?{parent:p.parent===scene,inside,items:sh?sh.userData.items:-1}:null;})()");
  assert(pr&&pr.parent&&!pr.inside&&pr.items===items0,'the print in its own group, outside the shelf, the shelf’s items unchanged: '+JSON.stringify([pr,items0]));R.photo={taken:'next morning',print:'the morning after',items:pr.items};
  // the keepsakes (Tunde): deferred while both of v38's guests have roles (the lens cap told by Mama Nkechi to Mr. Bassey's face), forced the
  // next night with the role kept; on the first gist, deferred; with no shelf, none; never last night's pair
  const kd=J('S.day')+1;fix39(`delete G.once['thank39:keepsake'];G.sets.keepsake=${kd-1};G.lost={i:3,since:${kd+1},at:12,status:'out',heard:0,told:0,ownerTold:0};G.last={day:${kd-1},guests:['ada','oyelaran'],tips:[],ids:[]};G.eve={day:${kd-1},n:6,first:4};o.day=${kd};o.time=18.2;`);
  p=plan39();assert.deepEqual(p.guests.slice().sort(),['bassey','nkechi'],'the lens cap’s teller and owner: '+JSON.stringify(p.guests));assert(!p.ids.includes(L.keepsake[0])&&p.g39&&/roles/.test(p.g39.why||''),'deferred: both guests have roles: '+JSON.stringify(p.g39));
  fix39(`G.lost.since=${kd};G.lost.told=1;G.lost.heard=${kd};G.last={day:${kd},guests:['nkechi','bassey'],tips:[],ids:[]};G.eve={day:${kd},n:7,first:4};o.day=${kd+1};o.time=18.2;`);
  p=plan39();pure39('keepsakes');assert(p.guests.includes('tunde')&&p.guests.includes('bassey')&&p.ids.includes(L.keepsake[0]),'the next night Tunde comes beside the reminder’s owner: '+JSON.stringify([p.guests,p.tips]));
  assert(!(p.guests.includes('nkechi')&&p.guests.includes('bassey')),'not last night’s pair');R.keepsake={deferred:kd,forced:kd+1,guests:p.guests};
  // no forced night repeats last night's pair: last night was v38's would-be kept guest with Tunde
  {fix39(`G.last={day:${kd},guests:['bassey','tunde'],tips:[],ids:[]};`);p=plan39();
   assert(!(p.guests.includes('bassey')&&p.guests.includes('tunde')),'never last night’s pair: '+JSON.stringify(p));R.noRepeat={last:['bassey','tunde'],tonight:p.guests,why:p.g39&&p.g39.why||null};}
  fix39(`G.eve={day:0,n:0,first:0};G.last=null;`);p=plan39();assert(p.first&&!p.ids.includes(L.keepsake[0]),'deferred on the first gist');
  fix39(`G.eve={day:${kd},n:7,first:4};G.last={day:${kd},guests:['nkechi','ada'],tips:[],ids:[]};G.shelf={state:'none',day:0,upDay:0};`);p=plan39();
  assert(!p.ids.some(id=>/^gs39-th-/.test(id)),'no thank-you without a shelf: '+JSON.stringify(p.ids));R.deferrals={firstGist:true,noShelf:true};
  return R;});

 /* ---------- check 5: giving a thing back at the gist (spec §6.3) ---------- */
 check(5,()=>{const R={};assert(has39b(),'the module');const L=J('GIST39.LINES.give');
  // a local pair: the glasses picked up on day 3 by keys and kept in the pocket; the v35 evening on day 3; the first gist on day 4 (v38's pocket
  // tip: Mama Nkechi is not invited)
  run('hxFresh(3,12.02);');away(1);frames(4);pickNow(0);run('life34().evening35={doneDay:3};');nextday();run('S.time=18.2;');pair();frames(1);
  const g4=gist39();assert(g4&&!g4.aborted,'the first gist');assert(!g4.v.guests.includes('nkechi')&&!ids39(g4).some(id=>/^gs39-/.test(id)),'day 4: v38’s gist, the owner not invited: '+JSON.stringify(g4.v.guests));
  // a later evening with Ada among the guests (her ask in the script): the owner forced in; held through day 4's gist, so the give-back is due
  const d=dayWhere39(5,40,null,"p=>p.guests.includes('nkechi')&&p.guests.includes('ada')&&p.ids.some(id=>/^gs38-ask-/.test(id))");assert(d>0,'an evening with Mama Nkechi and Ada');
  run(`S.day=${d};S.time=18.2;`);pair();frames(1);const p=plan39();pure39('give-back');
  const k=p.ids.indexOf(L.nkechi[0]),ty=J("hxF().SPEECH.ty.glassesLate");
  assert(k>=0&&p.kinds[k]==='give','the beat line: '+JSON.stringify(p.ids));assert.deepEqual([p.ids[k+1],p.ids[k+2],p.texts[k+1],p.texts[k+2]],['gs39-gbty-1','gs39-gbty-2',ty[0],ty[1]],'the planned thanks right after it');
  assert(k<p.ids.length-1&&p.kinds[p.ids.length-1]==='','before the goodbye');assert.equal(p.slots,1,'one slot');
  run('var hxOP39=openPanel,hxFV39=found38Visiting,hxSV39=save;TOASTS=[];');const aff0=J('S.nb.nkechi.aff|0');let at=null;
  const g=gist39(s=>{if(s.id===L.nkechi[0])at={btn:s.btn,saves:s.saves,G:J('(()=>{const G=hxG();return {lost:G.lost,returned:G.returned.slice(),keep:G.keep.keepsake.slice()};})()'),restored:J('openPanel===hxOP39&&found38Visiting===hxFV39&&save===hxSV39')};});
  assert(g&&!g.aborted,'the give-back gist');assert(at,'the beat shown: '+JSON.stringify(ids39(g)));seen(...g.shown.map(s=>s.text),...g.toasts);
  assert.equal(at.btn,'Give it back','the button on the beat');assert.equal(at.restored,true,'openPanel, found38Visiting and save put back');
  assert.equal(at.saves,0,'no save() inside the beat’s Next');
  const G=J('hxG()');assert.equal(G.lost.i,1,'the next thing (the chisel)');assert.equal(G.lost.since,d+1,'tomorrow');assert.deepEqual(G.returned.slice(-1),[{id:'glasses',day:d}],'returned');
  assert(G.keep.keepsake.includes('fan'),'the keepsake on a first return');assert.equal(G.lost.ownerTold,d,'TOLD_NEXT: the chisel’s owner told');assert.deepEqual([G.lost.heard,G.lost.heardMode,G.lost.heardBy],[d,'thanks','nkechi'],'TOLD_NEXT: heard by the thanks');
  assert(logHas('return','nkechi:glasses')&&logHas('keep','keepsake:fan')&&logHas('thanks','give:glasses'),'the return, keep and thanks logged');assert.equal(J('S.nb.nkechi.aff|0'),aff0+1,'friendship +1');
  {const hint=J('hxF().UI.shelfHint'),fan=J('hxF().UI.keepsake.fan');assert(g.toasts.includes(hint),'the one-time shelf hint toasted: '+JSON.stringify(g.toasts));
   assert(!g.toasts.some(t=>t.includes(fan)),'(fixer, S18) the keepsake not toasted over its own planned thanks: '+JSON.stringify(g.toasts));}
  const saves=g.shown.map(s=>s.saves);assert.deepEqual(saves.slice(0,-1).filter(n=>n!==0),[],'no save() between the beat and Goodnight: '+JSON.stringify(saves));assert.equal(saves[saves.length-1],1,'one save() at Goodnight');
  assert.deepEqual(ids39(g),g.v.script.map(s=>s.id),'every line in order');const ask=J('hxG().ada.ask');assert(ask&&ask.day===d+1&&ask.via==='gist','Ada’s ask booked: '+JSON.stringify(ask));
  assert.deepEqual(J('hxG().last.ids'),ids39(g),'G.last.ids equal the lines shown');assert(b39(),'v39 discovered by the give-back');
  R.giveBack={day:d,guests:g.v.guests,beat:L.nkechi[0],thanks:2,saves,keepsake:'fan',told:'chisel',adaAsk:ask.id};
  // a thing picked up that day: its owner is not invited (v38's rule kept)
  // (fixer, DOD-10) the day's log is full (300 events) before the pickup, so the log has no 'find' for it: v39's own record still knows the day
  nextday();run("S.time=12.04;for(let k=0;k<320;k++)LOG35.add('cast');");frames(10);pickNow(0);assert.equal(J("LOG35.has(S.day,'find','chisel')"),false,'the full log dropped the find');
  run('S.time=18.2;');pair();frames(1);let q=plan39();
  assert(!q.guests.includes('ada')&&!q.ids.some(id=>/^gs39-gb-/.test(id)),'picked up today: Ada is not invited: '+JSON.stringify(q.guests));const g2=gist39();assert(g2&&!g2.aborted,'that night’s gist');
  // an abort before the beat: the thing stays in the pocket
  nextday();run('S.time=18.2;');pair();frames(1);q=plan39();assert(q.guests.includes('ada')&&q.ids.includes(L.ada[0]),'the next evening Ada is due: '+JSON.stringify(q));
  assert(waitStart(3000)>=0&&waitTalk()>=0,'it talks');away(0);away(1);for(let f=0;f<300&&EV()!=='idle';f+=10)frames(10);assert.equal(EV(),'idle','aborted');
  assert.equal(J('hxG().lost.status'),'pocket','still in the pocket after an abort before the beat');R.picked='no owner the same night';R.abort='still in the pocket';
  return R;});

 /* ---------- check 6: the stool for the eldest guest (spec §7) ---------- */
 check(6,()=>{const R={};assert(has39b(),'the module');const LS=J('GIST39.LINES.stool');
  disc();buy39();
  // Ada's tenth stool: the morning after a gist where her "nine times" line was shown (that gist's record loaded as a fixture)
  fix39(ALL7+`G.eve={day:${J('S.day')},n:1,first:${J('S.day')}};G.last={day:${J('S.day')},guests:['ada','tunde'],tips:[],ids:['gs38-nk-first','gs38-ad-o1','gs38-pl-ad1','gs38-re-tu1','gs38-by-ad1']};`);
  assert.equal(b39().stool,null,'no stool yet');run('TOASTS=[];');nextday();const tenth=J('GIST39.UI.tenth');assert(J('TOASTS.slice()').includes(tenth),'the tenth stool’s toast');seen(tenth);
  assert.equal(b39().stool.from,'tenth','the tenth stool');
  // the eldest by ELDEST: Mr. Bassey with anyone, Mrs. Oyelaran before Mama Nkechi, none with Tunde and Ada
  const st=c=>{const d=dayWhere39(J('S.day'),120,null,c);assert(d>0,'a day for '+c);return J(`(()=>{const d0=S.day;S.day=${d};try{const p=hxPlan39();return {d:${d},guests:p.guests,stool:p.g39&&p.g39.stool,st:p.ids.filter(id=>/^gs39-st-/.test(id))};}finally{S.day=d0;}})()`);};
  const e1=st("p=>p.guests.includes('oyelaran')&&p.guests.includes('nkechi')"),e2=st("p=>p.guests.includes('tunde')&&p.guests.includes('ada')"),e3=st("p=>p.guests.includes('bassey')&&p.guests.includes('oyelaran')");
  assert.deepEqual([e1.stool,e2.stool,e3.stool],['oyelaran',null,'bassey'],'the eldest: '+JSON.stringify([e1,e2,e3]));R.eldest={oyelaranNkechi:e1.stool,tundeAda:e2.stool,basseyOyelaran:e3.stool};
  assert(!e1.st.includes(LS.nkechi[0])&&!e3.st.includes(LS.oyelaran[0])&&!e2.st.length,'an elder who is the other guest has no stool line; none with Tunde and Ada: '+JSON.stringify([e1.st,e2.st,e3.st]));
  // the first gist with Mr. Bassey: his greeting's button, the reach over the rail, seated on a 0.45 m stool, his line next; the others stand
  const d=dayWhere39(J('S.day'),120,null,"p=>p.guests.includes('bassey')&&p.g39&&p.g39.stoolFirst");assert(d>0,'an evening with Mr. Bassey');
  run(`S.day=${d};S.time=18.2;`);pair();frames(1);let p=plan39();pure39('stool');const kb=p.ids.indexOf(LS.bassey[0]);
  assert(kb===2&&p.opens[1]==='bassey'&&p.kinds[kb]==='stool','his line right after his greeting (he speaks second): '+JSON.stringify(p.ids));
  assert(J("potAskDue39('bassey',S.day+1)")&&!p.kinds.includes('potask'),'(fixer, S9) his pot ask waits for a night without his first stool line: '+JSON.stringify(p.ids));
  const lay=()=>J(`(()=>{const n=npcs.bassey.g,b=n.hero&&n.hero.bones;n.updateMatrixWorld(true);const v=new THREE.Vector3();if(b)b.hips.getWorldPosition(v);let so=null;scene.traverse(o=>{if(o.userData&&o.userData.gist39==='stool')so=o;});
   const others=GIST38.visit.guests.filter(k=>k!=='bassey').map(k=>!!npcs[k].g.sitting);return {sit:!!n.sitting,seat:!!n.userData.seat,hips:Math.round(v.y*1000)/1000,y:n.position.y,
   stool:so?{x:Math.round(so.position.x*1000)/1000,z:Math.round(so.position.z*1000)/1000,yaw:so.rotation.y===n.rotation.y,top:Math.round(GIST39.STOOL.h*100)/100}:null,at:[Math.round(n.position.x*1000)/1000,Math.round(n.position.z*1000)/1000],
   players:players.map(q=>!!q.g.sitting),others};})()`);
  // the framing: E.fits for each view and how far the guests' heads and feet stand out of each view (0 inside), seated and stood (the stool's
  // frame kept), at the three sizes
  const frame=()=>J(`(()=>{const E=EVENING35,out={fits:[],over:0};const v=new THREE.Vector3();for(let i=0;i<2;i++){if(!cams[i])continue;out.fits.push(E.fits(i,1));const c=cams[i];c.updateMatrixWorld();
    for(const k of GIST38.visit.guests){const n=npcs[k].g;for(const y of [0.05,1.75]){v.set(n.position.x,(n.sitting?0.45:0)+y*(n.sitting?0.62:1),n.position.z).project(c);out.over=Math.max(out.over,Math.abs(v.x)-1,Math.abs(v.y)-1,0);}}}
   out.over=Math.round(out.over*1000)/1000;return out;})()`);
  const hold=n=>{for(let k=0;k<n;k+=10){run('EVENING35.lineT=0;');frames(10);}};
  let first=null,reach=null,seated=null,framing=null,back=null;const labels=[];
  const g=gist39(s=>{labels.push(s.btn);
   if(/^Bring the stool/.test(s.btn)&&!first){first={btn:s.btn,line:s.id};frames(4);
    reach=J("(()=>{const st=GIST39.stool;if(!st)return null;const q=players[st.by];if(!q||!q.g.hero)return {phase:st.phase,by:st.by};const g=q.g;g.updateMatrixWorld(true);const v=new THREE.Vector3();g.hero.handR.getWorldPosition(v);"+
     "const fx=Math.sin(g.rotation.y),fz=Math.cos(g.rotation.y);return {phase:st.phase,by:st.by,fwd:Math.round(((v.x-g.position.x)*fx+(v.z-g.position.z)*fz)*100)/100,y:Math.round(v.y*100)/100};})()");
    hold(45);seated=lay();framing={};for(const [w,h,t] of [[1280,800,0],[390,844,1],[844,390,1]]){run(`hxScreen(${w},${h},${t});`);hold(60);const a=frame();
     run("var hxSeat39=npcs.bassey.g.userData.seat;npcs.bassey.g.sitting=false;delete npcs.bassey.g.userData.seat;npcs.bassey.g.position.y=0;");hold(60);const b=frame();
     run("npcs.bassey.g.sitting=true;npcs.bassey.g.userData.seat=hxSeat39;");hold(10);framing[w+'x'+h]={seated:a,standing:b};}run('hxScreen(1280,800,0);');hold(30);}
   if(EV()!=='talking'&&!back){back={now:lay(),phase:J('GIST39.stool&&GIST39.stool.phase')};frames(45);back.after=J("hxTag39().includes('stool')");}});
  assert(g&&!g.aborted&&first,'the first gist with Mr. Bassey, his button: '+JSON.stringify(labels));seen(...g.shown.map(s=>s.text));
  assert.equal(first.btn,'Bring the stool for Mr. Bassey','the button');assert(reach&&reach.phase==='reach'&&reach.by>=0,'handed over the rail by a player: '+JSON.stringify(reach));
  assert(reach.fwd>0.25&&reach.y>0.75&&reach.y<1.4,'the reach pose (hands forward over the rail): '+JSON.stringify(reach));
  assert(seated.sit&&seated.seat&&seated.hips>0.45&&seated.stool&&seated.stool.yaw&&Math.abs(seated.stool.x-seated.at[0])<0.01&&Math.abs(seated.stool.z-seated.at[1])<0.01,'seated on the stool at his spot, the stool’s yaw his: '+JSON.stringify(seated));
  assert.deepEqual([seated.players,seated.others],[[false,false],[false]],'the household and the other guest stand');
  const ib=ids39(g).indexOf(LS.bassey[0]);assert(ib>0&&ids39(g)[ib-1]===first.line,'his line follows his greeting: '+JSON.stringify(ids39(g)));
  for(const k in framing){const f=framing[k];assert(f.seated.fits.every((x,i)=>x||!f.standing.fits[i])&&f.seated.over<=f.standing.over+1e-3,'framing at '+k+' no worse seated: '+JSON.stringify(f));}
  assert(back&&!back.now.sit&&back.now.y===0&&back.phase==='back'&&back.after===false,'Goodnight: he stands, the stool goes back over the rail: '+JSON.stringify(back));
  assert.equal(b39().once['stool39:bassey'],d,'his first time recorded');assert(logHas('thanks','stool:bassey'),'thanks stool:bassey');
  R.first={day:d,button:first.btn,reach:{fwd:reach.fwd,y:reach.y},hips:seated.hips,framing:Object.fromEntries(Object.entries(framing).map(([k,f])=>[k,{seated:f.seated,standing:f.standing}]))};
  // the next gist with Mr. Bassey: seated as they arrive, no line, no button
  nextday();const d2=dayWhere39(J('S.day'),140,null,"p=>p.guests.includes('bassey')");assert(d2>0,'another evening with Mr. Bassey');run(`S.day=${d2};S.time=18.2;`);pair();frames(1);p=plan39();
  assert(p.g39&&p.g39.stool==='bassey'&&!p.g39.stoolFirst&&!p.ids.some(id=>/^gs39-st-/.test(id)),'no line the second time: '+JSON.stringify(p));
  assert(waitStart(3000)>=0&&waitTalk()>=0,'it talks');hold(75);const s2=lay();assert(s2.sit&&s2.stool,'seated as the guests arrive: '+JSON.stringify(s2));const l2=[];talk39(s=>l2.push(s.btn));untilIdle();
  assert(!l2.some(b=>/stool/i.test(b)),'no button: '+JSON.stringify(l2));R.second={day:d2,seated:true,lines:l2.length};
  // unseated and the stool gone on every abort: an abort called directly, a new day, walking out, a party, going online
  const ab={};let dd=d2;const startSeated=()=>{dd=dayWhere39(dd+1,240,null,"p=>p.guests.includes('bassey')");assert(dd>0,'an evening with him');run(`S.day=${dd};S.time=18.2;`);pair();frames(1);
   assert(waitStart(3000)>=0&&waitTalk()>=0,'it talks');hold(75);assert(lay().sit,'seated');};
  const gone=()=>J("(()=>{const n=npcs.bassey.g;return {sit:!!n.sitting,seat:!!n.userData.seat,y:n.position.y,stool:hxTag39().includes('stool')};})()");const ok={sit:false,seat:false,y:0,stool:false};
  startSeated();ab.direct=J("(()=>{EVENING35.abort();const n=npcs.bassey.g;return {sit:!!n.sitting,seat:!!n.userData.seat,y:n.position.y,stool:hxTag39().includes('stool')};})()");run('closePanel();');frames(2);
  startSeated();run("dispatch('nextday');closePanel();");ab.nextday=gone();
  startSeated();away(0);away(1);for(let f=0;f<300&&EV()!=='idle';f+=10)frames(10);ab.walkedOut=gone();
  startSeated();run('S.party={on:true,done:false,guests:[]};');frames(3);ab.party=gone();run('S.party=null;');frames(2);
  startSeated();run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");frames(3);ab.online=gone();run('NET.on=false;NET.room=null;');frames(4);
  for(const k in ab)assert.deepEqual(ab[k],ok,'unseated, the stool gone ('+k+')');R.aborts=Object.keys(ab);
  return R;});

 /* ---------- check 8: round two and the again round (spec §9) ---------- */
 check(8,()=>{const R={};assert(has39b(),'the module');
  // pure entries: 7 to 40 twice the same, never the same owner twice running, every id's words present
  const ents=J("(()=>{const a=[],b=[];for(let i=7;i<=40;i++){a.push(JSON.stringify(rotEntry39(i)));b.push(JSON.stringify(rotEntry39(i)));}return {same:JSON.stringify(a)===JSON.stringify(b),list:a.map(x=>JSON.parse(x))};})()");
  assert(ents.same,'rotEntry39 pure');const own=ents.list.map(e=>e.owner);for(let k=1;k<own.length;k++)assert.notEqual(own[k],own[k-1],'never the same owner twice running at '+(k+7));
  assert.equal(JSON.stringify(own.slice(0,5)),JSON.stringify(['ada','tunde','nkechi','bassey','oyelaran']),'round two: one each');
  // (fixer, Codex P2) an again entry carries its base; the first cycle's ids are <id>-a (a save in it loads unchanged); no again id of any cycle
  // in TOLD_NEXT (each cycle's own id is checked at the end of this check)
  assert(ents.list.slice(5).every(e=>e.v39==='again'&&typeof e.base==='string'&&e.id.startsWith(e.base+'-a')),'the again round’s entries carry their base');
  assert(ents.list.slice(5,17).every(e=>e.id===e.base+'-a'),'the first cycle’s ids are <id>-a');
  assert(J("(()=>{const T=hxF().TOLD_NEXT;for(let i=12;i<=60;i++)if(rotEntry39(i).id in T)return false;return Object.keys(T).every(k=>rotSrc39(k)===k);})()"),'no again id in TOLD_NEXT');
  // round two's spots: v38's check-2 rules and spec §4 (outside the guest patch, 2.4 m from Aunty Bisi's route and rail spot, 2.2 m from every
  // prompt and v38's lost spots), reachable from the door
  const sp=J(`(()=>{const out={},bad=[];const H=[[12.4,14.2],[-3,11.2],[3,12.5],[20.8,7.1],[26.4,0],[6,-15.2],[-6,-15.2],[6,-19.3],[-6,-19.3],[0,-5.5],[-22,-4.0],[-18,6.4],[0,-17.7],[-5.6,6.35]];
   for(const st of STALLS){const dir=st.z<0?1:-1;H.push([st.x,st.z+dir*1.1]);}for(const s of SHELLS34)H.push([s[0],s[1]]);for(const it of hxF().LOST.slice(0,7))for(const s of it.spots)H.push([s[0],s[1]]);for(const s of hxF().WASH_SPOTS)H.push(s);
   const BOATS=[[-8,14.6],[9,15.1]],md=(x,z,L)=>Math.min(...L.map(h=>Math.hypot(h[0]-x,h[1]-z)));const seg=(px,pz,ax,az,bx,bz)=>{const dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz;let t=l?((px-ax)*dx+(pz-az)*dz)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(px-ax-t*dx,pz-az-t*dz);};
   const Rt=BISI39.ROUTE,T=BISI39.STROLL,ROUTE=[[Rt.enter[0],Rt.enter[1],Rt.strollIn[0],Rt.strollIn[1]],[T.x1,T.z,T.x0,T.z],[Rt.enter[0],Rt.enter[1],Rt.stop[0],Rt.stop[1]],[Rt.stop[0],Rt.stop[1],Rt.rail[0],Rt.rail[1]]];
   // an A* over blocked() from the flat door (v38's probe, verify-gist-v38.cjs)
 const STEP=0.25,X0=-34,Z0=-22,NX=Math.round(66/STEP)+1,NZ=Math.round(39/STEP)+1,free=new Int8Array(NX*NZ).fill(-1); 
   const isFree=(ix,iz)=>{const k=iz*NX+ix;if(free[k]>=0)return free[k]===1;const x=X0+ix*STEP,z=Z0+iz*STEP;const v=!blocked(x,z,PR,{lvl:0,noCrate:true})&&Math.abs(levelAt(x,z))<0.3;free[k]=v?1:0;return v;}; 
   const ci=x=>Math.max(0,Math.min(NX-1,Math.round((x-X0)/STEP))),cj=z=>Math.max(0,Math.min(NZ-1,Math.round((z-Z0)/STEP))); 
   const near=(x,z)=>{const ix=ci(x),iz=cj(z);for(let r=0;r<=4;r++){let best=null,bd=1e9;for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){const u=ix+a,v=iz+b;if(u<0||v<0||u>=NX||v>=NZ)continue;if(isFree(u,v)){const d=Math.hypot(a,b);if(d<bd){bd=d;best=[u,v];}}}if(best)return best;}return null;}; 
   const pathLen=(from,to)=>{const s=near(from[0],from[1]),t=near(to[0],to[1]);if(!s||!t)return null;const g=new Float32Array(NX*NZ).fill(1e9),Hh=[];const hh=(ix,iz)=>Math.hypot(ix-t[0],iz-t[1]); 
    const push=(f,k)=>{Hh.push([f,k]);let i=Hh.length-1;while(i>0){const p=(i-1)>>1;if(Hh[p][0]<=Hh[i][0])break;[Hh[p],Hh[i]]=[Hh[i],Hh[p]];i=p;}}; 
    const pop=()=>{const top=Hh[0],l=Hh.pop();if(Hh.length){Hh[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let m=i;if(a<Hh.length&&Hh[a][0]<Hh[m][0])m=a;if(b<Hh.length&&Hh[b][0]<Hh[m][0])m=b;if(m===i)break;[Hh[m],Hh[i]]=[Hh[i],Hh[m]];i=m;}}return top;}; 
    const ks=s[1]*NX+s[0],kt=t[1]*NX+t[0];g[ks]=0;push(hh(s[0],s[1]),ks);let n=0; 
    while(Hh.length&&n<600000){const [f,k]=pop();n++;if(k===kt)return Math.round(g[k]*STEP*10)/10;const ix=k%NX,iz=(k-ix)/NX;if(f-hh(ix,iz)>g[k]+1e-6)continue; 
     for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const u=ix+a,v=iz+b;if(u<0||v<0||u>=NX||v>=NZ||!isFree(u,v))continue;if(a&&b&&(!isFree(ix+a,iz)||!isFree(ix,iz+b)))continue; 
      const k2=v*NX+u,ng=g[k]+Math.hypot(a,b);if(ng<g[k2]){g[k2]=ng;push(ng+hh(u,v),k2);}}}return null;};
   const rc=new THREE.Raycaster(),objs=[];scene.updateMatrixWorld(true);scene.traverse(o=>{if(o.isMesh&&o.visible&&!(o.material&&o.material.transparent&&o.material.opacity<0.05)&&!(o.userData&&(o.userData.gist38||o.userData.gist39))&&!players.some(p=>{let q=o;while(q){if(q===p.g)return true;q=q.parent;}return false;}))objs.push(o);});
   const top=(x,z)=>{rc.set(new THREE.Vector3(x,2.5,z),new THREE.Vector3(0,-1,0));const h=rc.intersectObjects(objs,false);return h.length?2.5-h[0].distance:null;};
   for(let i=7;i<12;i++){const e=rotEntry39(i);out[e.id]=[];for(const [x,z,y] of e.spots){const why=[];let mx=-1;for(const [dx,dz] of [[0,0],[0.3,0],[-0.3,0],[0,0.3],[0,-0.3]])mx=Math.max(mx,top(x+dx,z+dz));const c=top(x,z);
     if(mx>0.1)why.push('covered at '+mx.toFixed(2));const want=y===undefined?hxF().GROUND:y;if(c===null||Math.abs(c-want)>0.005)why.push('the ground at '+(c===null?'none':c.toFixed(3))+', not '+want);
     if(blocked(x,z,PR))why.push('blocked at PR');if(blocked(x,z,PR+0.5))why.push('blocked at PR+0.5');if(Math.abs(levelAt(x,z))>1e-6)why.push('not level');if(inFlat(x,z))why.push('in a flat');
     if(x>-30.9&&x<-16.3&&z>6.1&&z<13.3)why.push('in the football zone');if(Math.abs(x+21)<=4&&z>-4.94-1.5&&z<-2.06+1.5)why.push('in a square goal mouth');
     const dh=md(x,z,H);if(!(dh>2.2))why.push('a prompt at '+dh.toFixed(2));if(md(x,z,BOATS)<1.5)why.push('a boat');if(x>-9.8&&x<-1.4&&z>7.8&&z<9.2)why.push('in the guest patch');
     const dr=Math.min(...ROUTE.map(s=>seg(x,z,...s)));if(dr<2.4)why.push('Bisi’s route at '+dr.toFixed(2));const pth=pathLen([-3.95,6.6],[x,z]);if(pth===null)why.push('unreachable');
     out[e.id].push([x,z,+dh.toFixed(2),+dr.toFixed(2),pth]);if(why.length)bad.push(e.id+' ('+x+', '+z+'): '+why.join(', '));}}return {out,bad};})()`);
  assert.deepEqual(sp.bad,[],'round two’s spots: '+JSON.stringify(sp.bad));R.spots=sp.out;
  // the seventh back on day R (a fixture of a household that has given back all seven): nothing on R+1 at noon, round two's first thing at R+2
  // at noon, told at R+1's gist by its owner; v39 discovered by round two starting
  disc();fix39("G.lost={i:6,since:8,at:12,status:'back',heard:0,told:0,ownerTold:0};G.returned=[['glasses',3],['chisel',4],['adapter',4],['lenscap',5],['wrapper',6],['rule',7],['seeds',8]].map(([id,day])=>({id,day}));G.keep.keepsake=['fan','bird','plate','print','record'];G.eve={day:7,n:4,first:4};G.last={day:7,guests:['tunde','ada'],tips:[],ids:[]};o.day=8;o.time=20;");
  const Rd=8;assert.equal(J('hxF().LOST.length'),7,'seven before');assert.equal(b39(),null,'no b39');nextday();
  assert.deepEqual(J('[hxF().LOST.length,hxG().lost.i,hxG().lost.since,hxG().lost.status]'),[8,7,Rd+2,'out'],'R+1: entry 8 for R+2');assert(b39(),'v39 discovered by round two');
  run('S.time=11.95;hxAt(0,-8,-10);hxAt(1,-7,-10);');frames(2);until(12.2);assert.equal(item(),null,'nothing on R+1 at noon');
  run('S.time=18.2;');pair();frames(1);const pr=plan39();assert(pr.tips.some(t=>t==='lost:new:pencil:ada'),'told at R+1’s gist by its owner: '+JSON.stringify(pr.tips));
  const gR=gist39();assert(gR&&!gR.aborted&&ids39(gR).includes('gs39-lost-pencil'),'the tip shown: '+JSON.stringify(gR&&ids39(gR)));seen(...gR.shown.map(s=>s.text));
  nextday();run('S.time=11.95;hxAt(0,-8,-10);hxAt(1,-7,-10);');frames(2);until(11+59.5/60);assert.equal(item(),null,'nothing before noon on R+2');until(12.01);for(let f=0;f<20&&!item();f++)frames(1);
  const it=item(),spot=J(`(()=>{const e=hxF().LOST[7],s=e.spots[hash38(${Rd+2},7)%e.spots.length];return s;})()`);assert(it&&it.tag==='lost:pencil'&&Math.abs(it.x-spot[0])<1e-3&&Math.abs(it.z-spot[1])<1e-3,'the pencil at noon on R+2 at its spot: '+JSON.stringify([it,spot]));
  let rws=rows();assert(rws.rows.some(r=>r[0]==='lost'&&r[1].includes(J("esc(GIST38.UI.heardLost.pencil)"))),'Today: heard last night: '+JSON.stringify(rws.rows));
  const t0=pickNow(0);seen(...t0);assert.equal(J('hxF().LOST.length'),9,'entry 9 appended at the pickup');rws=rows();assert(rws.rows.some(r=>r[0]==='pocket'),'Today’s pocket row for entry 8');
  const aff0=J('S.nb.ada.aff|0'),keep0=J('hxG().keep.keepsake.slice()');run('S.time=14;');frames(30);const gv=giveNow(0,'ada');seen(gv.label,gv.panel);
  assert.deepEqual(J('[hxG().lost.i,hxG().lost.since]'),[8,Rd+3],'the next tomorrow at noon');assert.deepEqual(J('hxG().keep.keepsake'),keep0,'no keepsake twice');assert.equal(J('S.nb.ada.aff|0'),aff0+1,'friendship +1');
  assert(gv.panel.includes(J("esc(GIST39.LINES.round.pencil.ty[1])")),'her thanks');R.roundTwo={R:Rd,out:Rd+2,told:Rd+1,spot,next:Rd+3};
  // every appended id has every table entry
  const tables=J("(()=>{const L=GIST38.LINES,U=GIST38.UI,F=hxF();return F.LOST.slice(7).map(e=>({id:e.id,ok:[L.thing,L.pocketThing,L.lost,L.told,L.back,U.heardLost,U.recapLost,F.SPEECH.ty].every(t=>t&&t[e.id]),fields:['owner','name','long','area','say','pickLabel','pickToast','giveLabel'].every(k=>typeof e[k]==='string'&&e[k])&&e.spots.length>0,gs39:/^gs39-/.test(L.lost[e.id][1])&&/^gs39-/.test(L.told[e.id][0])&&/^gs39-/.test(L.back[e.id][0])}));})()");
  for(const t of tables)assert(t.ok&&t.fields&&t.gs39,'every table entry for '+t.id+': '+JSON.stringify(t));
  // reloads with lost.i 9: out (entries through 10), in the pocket and back (through 11 so the next can be scheduled)
  const rel={};for(const st of ['out','pocket','back']){fix39(`G.lost={i:9,since:${J('S.day')},at:12,status:'${st}',heard:0,told:0,ownerTold:0};`);const a=J('JSON.stringify(hxG().lost)');run('save();S=load();enterWorld();closePanel();');frames(2);
   rel[st]={same:J('JSON.stringify(hxG().lost)')===a,len:J('hxF().LOST.length')};assert(rel[st].same&&rel[st].len===(st==='out'?10:11),'a reload with lost.i 9 '+st+': '+JSON.stringify(rel[st]));}R.reload=rel;
  // an "again" thing (entry 12) found and given back: TOLD_NEXT never fires for it, no keepsake twice; Today's pocket row for entry 15
  fix39(`G.lost={i:12,since:${J('S.day')},at:0,status:'out',heard:0,told:0,ownerTold:0};o.time=12.2;`);frames(10);const e12=J('hxF().LOST[12]');assert(e12.v39==='again'&&e12.id===e12.base+'-a','entry 12 is an again thing: '+e12.id);
  const t12=pickNow(0);seen(...t12);const at={nkechi:13,ada:14,tunde:13,bassey:14,oyelaran:18.3}[e12.owner];
  if(e12.owner==='oyelaran'){for(let f=0;f<2400&&J('npcs.oyelaran.g.visible||!!npcs.oyelaran.route');f+=10)frames(10);run('S.time=17.98;');frames(40);}
  run(`S.time=${at};`);frames(30);const g12=giveNow(0,e12.owner);seen(g12.panel);assert(g12.panel.includes(J(`esc(GIST39.LINES.againTy.${e12.owner}[1])`)),'the again thanks');
  assert.deepEqual(J('[hxG().lost.i,hxG().lost.heard|0,hxG().lost.heardMode||null,hxG().lost.ownerTold|0]'),[13,0,null,0],'TOLD_NEXT never fires for an -a id');assert.deepEqual(J('hxG().keep.keepsake'),keep0,'no keepsake twice');
  fix39("G.lost={i:15,since:3,at:12,status:'pocket',heard:0,told:0,ownerTold:0};");const tp=J("(()=>{const t=found38Today();return t.pocket?{id:t.pocket.id,long:t.pocket.long}:null;})()");const e15=J('hxF().LOST[15]');
  assert(tp&&tp.id===e15.id,'found38Today for entry 15: '+JSON.stringify(tp));rws=rows();assert(rws.rows.some(r=>r[0]==='pocket'&&r[1].includes(J(`esc(GIST38.LINES.thing[${JSON.stringify(e15.id)}])`))),'Today’s pocket row for entry 15: '+JSON.stringify(rws.rows));
  R.again={entry12:e12.id,toldNext:false,entry15:e15.id};
  // (fixer, Codex P2) the second and third cycles (entries 24 to 47): the thing that comes out tomorrow is told at tonight's gist by its owner
  // (v38's own lost:new tip) and heard (heard tonight, told 1); Today says so in the morning; the evening after it is reminded once (told 2),
  // and the evening after that not again. v38 records a tip as heard only when gistItem38(id) is FOUND38.LOST[G.lost.i]: an id shared with an
  // earlier cycle finds the earlier entry, and the tip is never heard.
  {const cyc=[];let D=120;
   for(let I=24;I<=47;I++,D+=4){
    fix39(`G.lost={i:${I},since:${D+1},at:12,status:'out',heard:0,told:0,ownerTold:0};G.eve={day:${D-1},n:30,first:4};G.last={day:${D-1},guests:['tunde','ada'],tips:[],ids:[]};o.day=${D};o.time=18.2;`);
    const e=J(`(()=>{const e=hxF().LOST[${I}];return {id:e.id,owner:e.owner,same:gistItem38(e.id)===e,line:GIST38.LINES.lost[e.id][1]};})()`);
    pair();frames(1);const p1=plan39();assert(p1.tips.includes('lost:new:'+e.id+':'+e.owner),'entry '+I+' ('+e.id+') told tonight by its owner: '+JSON.stringify(p1.tips));
    const g1=gist39();assert(g1&&!g1.aborted&&ids39(g1).includes(e.line),'entry '+I+': the tip shown: '+JSON.stringify(g1&&ids39(g1)));seen(...g1.shown.map(s=>s.text));
    assert.deepEqual(J('[hxG().lost.heard|0,hxG().lost.told|0,hxG().lost.heardMode||null]'),[D,1,'new'],'entry '+I+' ('+e.id+'): the tip heard');
    nextday();run('S.time=10;');frames(2);const rw=rows();const heard=J(`esc(GIST38.UI.heard+GIST38.UI.heardLost[${JSON.stringify(e.id)}])`);
    assert(rw.rows.some(r=>r[0]==='lost'&&r[1]===heard),'entry '+I+': Today the next morning: '+JSON.stringify(rw.rows));
    run('S.time=18.2;');pair();frames(1);const p2=plan39();assert(p2.tips.some(t=>t.startsWith('lost:remind:'+e.id+':')),'entry '+I+': reminded the evening after: '+JSON.stringify(p2.tips));
    const g2=gist39();assert(g2&&!g2.aborted,'entry '+I+': the reminder gist');seen(...g2.shown.map(s=>s.text));
    assert.deepEqual(J('[hxG().lost.status,hxG().lost.heard|0,hxG().lost.told|0,hxG().lost.heardMode||null]'),['out',D+1,2,'remind'],'entry '+I+' ('+e.id+'): the reminder counted');
    nextday();run('S.time=18.2;');pair();frames(1);const p3=plan39();assert(!p3.tips.some(t=>t.split(':')[2]===e.id),'entry '+I+': no third telling: '+JSON.stringify(p3.tips));
    cyc.push(e.id);}
   R.cycles={entries:'24-47',ids:cyc};}
  // (fixer, Codex P2) a save from the build that repeated the -a ids, in the second cycle: in the pocket at 26 (the returns of 24 and 25 under
  // the first cycle's ids; last night's pocket tip under the old id) and out at 24 (told last night under the old id, never heard)
  {const oldIds=I=>J(`(()=>{const o=[];for(let i=0;i<${I};i++){const e=i<7?hxF().LOST[i]:rotEntry39(i);o.push(e.v39==='again'?e.base+'-a':e.id);}return o;})()`);
   const want=I=>J(`(()=>{const o=[];for(let i=0;i<${I};i++)o.push(i<7?hxF().LOST[i].id:rotEntry39(i).id);return o;})()`);const mig={};
   {const I=26,D=230,ids=oldIds(I),e=J(`(()=>{const e=rotEntry39(${I});return {id:e.id,base:e.base,owner:e.owner};})()`);
    assert(ids.filter((x,k)=>ids.indexOf(x)!==k).length===2,'the fixture repeats two ids');
    fix39(`G.lost={i:${I},since:${D-1},at:12,status:'pocket',heard:0,told:0,ownerTold:0};G.returned=${JSON.stringify(ids)}.map((id,k)=>({id,day:10+k*2}));G.eve={day:${D-1},n:40,first:4};
     G.last={day:${D-1},guests:['tunde','ada'],tips:[{kind:'pocket',arg:'${e.base}-a',teller:'tunde',owner:'${e.owner}',mode:null}],ids:[]};o.day=${D};o.time=10;`);
    const r=J('(()=>{const G=hxG();return {ret:G.returned.map(x=>x.id),tip:G.last.tips[0].arg,ownerTold:G.lost.ownerTold|0,id:hxF().LOST[G.lost.i].id};})()');
    assert.deepEqual(r.ret,want(I),'each return under its cycle’s id');assert.deepEqual([r.id,r.tip,r.ownerTold],[e.id,e.id,D-1],'last night’s pocket tip under the new id, the owner told');
    const rel=J('(()=>{const a=JSON.stringify(hxG());save();S=load();enterWorld();closePanel();hxFrames(2);return JSON.stringify(hxG())===a;})()');assert(rel,'reloads unchanged');mig.pocket26=r;}
   {const I=24,D=240,ids=oldIds(I),e=J(`(()=>{const e=rotEntry39(${I});return {id:e.id,base:e.base,owner:e.owner};})()`);
    fix39(`G.lost={i:${I},since:${D},at:12,status:'out',heard:0,told:0,ownerTold:0};G.returned=${JSON.stringify(ids)}.map((id,k)=>({id,day:10+k*2}));G.eve={day:${D-1},n:41,first:4};
     G.last={day:${D-1},guests:['tunde','ada'],tips:[{kind:'lost',arg:'${e.base}-a',teller:'${e.owner}',owner:'${e.owner}',mode:'new'}],ids:[]};o.day=${D};o.time=10;`);
    const r=J('(()=>{const G=hxG();return {lost:[G.lost.heard|0,G.lost.told|0,G.lost.heardMode||null],tip:G.last.tips[0].arg};})()');
    assert.deepEqual(r,{lost:[D-1,1,'new'],tip:e.id},'last night’s untracked tip recorded as heard: '+JSON.stringify(r));
    const rw=rows(),heard=J(`esc(GIST38.UI.heard+GIST38.UI.heardLost[${JSON.stringify(e.id)}])`);assert(rw.rows.some(x=>x[0]==='lost'&&x[1]===heard),'Today: heard last night: '+JSON.stringify(rw.rows));mig.out24=r;}
   R.oldSave=mig;}
  // (fixer, Codex P2) every entry 0 to 60 has its own id: the first cycle <id>-a, cycle c from the second on <id>-a<c+1>
  {const all=J("(()=>{const o=[];for(let i=0;i<=60;i++){const e=i<7?hxF().LOST[i]:rotEntry39(i);o.push({i,id:e.id,base:e.base||null});}return o;})()"),ids=all.map(e=>e.id);
   assert.deepEqual(ids.filter((x,k)=>ids.indexOf(x)!==k),[],'every entry 0 to 60 has its own id');
   for(const e of all.filter(x=>x.i>=12)){const c=Math.floor((e.i-12)/12);assert.equal(e.id,e.base+(c?'-a'+(c+1):'-a'),'entry '+e.i+'’s cycle id');}R.ids={unique:ids.length,last:ids[60]};}
  return R;});

 /* ---------- check 9: the fish for the pot (spec §10, §12.1) ---------- */
 check(9,()=>{const R={};assert(has39b(),'the module');const P=J('GIST39.LINES.pot'),U=J('GIST39.UI');
  disc();const d4=J('S.day');run('S.time=9;');frames(2);let ph=talkTo39('nkechi');assert(!ph.includes('gs39')&&!J('hxB39G()'),'no ask before v39 discovery');
  assert(!ph.includes(text39(P.nkechi.talk[1].slice(0,30))),'no pot line before discovery');
  buy39();fix39(ALL7+`G.eve={day:${J('S.day')},n:1,first:${J('S.day')}};`);nextday();const d=J('S.day');run('S.time=9;');frames(2);
  // the ask in Mama Nkechi's talk, for today: n by hash; Today's row; never Mrs. Oyelaran
  ph=talkTo39('nkechi');const n=J(`2+(hash38(${d},13)>>>16)%2`),askT=J(`potSay39(${JSON.stringify(P.nkechi.talk[1])},${n})`);assert.equal(askT,P.nkechi.talk[1].replace('{n}',['two','three'][n-2]),'mid-sentence: lower case');seen(askT);
  assert(ph.includes(text39(askT)),'the ask in her talk: '+ph.replace(/<[^>]+>/g,' ').slice(0,300));const pot=b39().pot;
  assert.deepEqual([pot.day,pot.who,pot.n,pot.via,b39().potLast.nkechi],[d,'nkechi',n,'talk',d],'the pot recorded: '+JSON.stringify(pot));assert(logHas('pot','ask:nkechi'),'pot ask:nkechi');
  ph=talkTo39('oyelaran');assert(!/pot|fish/i.test(ph.replace(/<[^>]+>/g,' ').replace(/Mrs\. Oyelaran/g,'')),'never Mrs. Oyelaran: '+ph.replace(/<[^>]+>/g,' ').slice(0,200));
  let rws=rows();const rowT=J(`esc(${JSON.stringify(U.potRowAsk.replace('{owner}','Mama Nkechi').replace('{n}',U.num[n]))})`);seen(U.potRowAsk.replace('{owner}','Mama Nkechi').replace('{n}',U.num[n]));
  assert(rws.rows.some(r=>r[0]==='pot'&&r[1]===rowT),'Today’s pot row: '+JSON.stringify(rws.rows));
  // the catch card: no button before two o'clock; from two, the quiet button (tune's one primary kept); through lifeCatch({v:'release'})
  run('S.time=13.8;');frames(2);let c=catchNow();assert(!c.card.includes('data-act="pot39Keep"'),'no pot button before 14:00 ('+c.t.toFixed(2)+')');settle();
  run('S.time=14.05;');frames(2);const kept=[];for(let k=0;k<n;k++){c=catchNow();assert(c.card.includes('data-act="pot39Keep"'),'the pot button from 14:00');
   const b=buttons(c.card).find(x=>x.act==='pot39Keep');assert(/(^|\s)quiet(\s|$)/.test(b.cls)&&b.text===U.potKeep.replace('{name}','Mama Nkechi'),'quiet: '+JSON.stringify(b));assert.equal(primaries(c.card).length,1,'one primary on the card');
   run('hxLC39.length=0;');click('pot39Keep');kept.push({release:J('hxLC39.slice()'),catch:J('S.life.catch'),got:b39().pot.got,panel:J('PH')});run('closePanel();');seen(kept[k].panel);}
  assert(kept.every((x,k)=>x.release.join()==='release'&&x.catch===null&&x.got===k+1),'kept through lifeCatch release: '+JSON.stringify(kept));
  c=catchNow();assert(!c.card.includes('data-act="pot39Keep"'),'no button once all are kept');settle();
  // the give at her live place (not for the companion), until half past five; her thanks; friendship; the bowl at six with cheer and energy
  assert(settled('nkechi'),'she is at her shop');{const q=J('[npcs.nkechi.g.position.x,npcs.nkechi.g.position.z]');approach(0,q[0],q[1],1.2,2.0);}
  assert.equal(label(0),U.potGive.replace('{name}','Mama Nkechi'),'the give prompt');const aff0=J('S.nb.nkechi.aff|0');run('PH="";');press(0);ph=J('PH');run('closePanel();');seen(ph);
  const ty=P.nkechi.ty[J(`(hash38(${d},7)>>>16)%2`)][1];assert(ph.includes(text39(ty)),'her thanks');assert.equal(b39().pot.gave,d,'given');assert.equal(J('S.nb.nkechi.aff|0'),aff0+1,'friendship +1');assert(logHas('pot','give:nkechi'),'pot give logged');
  rws=rows();assert(rws.rows.some(r=>r[0]==='pot'&&r[1]===J(`esc(${JSON.stringify(U.potRowGiven.replace('{owner}','Mama Nkechi'))})`)),'Today: a bowl at six');
  run('S.p[0].mood=50;S.p[1].mood=50;S.p[0].energy=50;S.p[1].energy=50;TOASTS=[];S.time=17.97;hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);');frames(2);until(18.02);frames(10);const bowl=U.potBowl.replace('{dish}','pepper soup').replace('{owner}','Mama Nkechi');seen(bowl);
  assert(J('TOASTS.slice()').includes(bowl),'the bowl at six: '+JSON.stringify(J('TOASTS.slice()')));assert.deepEqual(J('[S.p[0].mood,S.p[1].mood,S.p[0].energy,S.p[1].energy]'),[54,54,56,56],'cheer and energy');
  R.talk={day:d,n,kept:n,bowl:'18:00'};
  // never the same asker two days running; at a gist with Mr. Bassey the ask for tomorrow (a tip), recorded only when shown; Ada's and the pot's
  // buttons together; at half past five the give prompt goes and the pot lapses quietly
  nextday();run('S.time=9;');frames(2);ph=talkTo39('nkechi');assert(!ph.includes(text39(P.nkechi.talk[1].slice(0,24))),'not the same asker two days running');assert.equal(b39().pot,null,'yesterday’s pot cleared');
  const dg=dayWhere39(J('S.day'),90,null,"p=>p.guests.includes('bassey')&&p.ids.some(id=>/^gs39-pot-ba-g/.test(id))");assert(dg>0,'an evening with Mr. Bassey’s ask: '+JSON.stringify(J("(()=>{const o=[];const d0=S.day;for(let d=d0;d<d0+6;d++){S.day=d;const p=hxPlan39();o.push([d,p.guests,p.ids.slice(-3),potAskDue39('bassey',d+1),JSON.stringify(hxB39G().pot),hxB39G().potLast]);}S.day=d0;return o;})()")));run(`S.day=${dg};S.time=18.2;`);pair();frames(1);
  let p=plan39();const kg=p.ids.findIndex(id=>/^gs39-pot-ba-g/.test(id)),ng=J(`2+(hash38(${dg+1},13)>>>16)%2`);assert.equal(p.ids[kg],'gs39-pot-ba-g0','(fixer, C4) his first ask carries the setup');assert(kg>0&&kg===p.ids.length-2||p.kinds[p.ids.length-2],'the ask before the goodbye: '+JSON.stringify(p.ids));
  assert.equal(p.texts[kg],P.bassey.gist0[1].replace('{n}',['Two','Three'][ng-2]),'its text (a sentence starts with the number)');assert.equal(J('hxPlan39().slots')>=1,true,'it takes a slot');
  const gg=gist39();assert(gg&&!gg.aborted,'the gist');const gi=gg.shown.findIndex(s=>s.id==='gs39-pot-ba-g0');assert(gi>=0&&gg.shown[gi].btn==='Ehen?','shown with Ehen?: '+JSON.stringify(gg.shown.map(s=>s.id+'/'+s.btn)));
  assert.deepEqual([b39().pot.day,b39().pot.who,b39().pot.n,b39().pot.via],[dg+1,'bassey',ng,'gist'],'recorded for tomorrow');seen(...gg.shown.map(s=>s.text));
  assert(J(`(()=>{const h=days_night35();return h.includes(esc(${JSON.stringify(U.recapPot.replace('{owner}','Mr. Bassey').replace('{n}',['two','three'][ng-2]))}));})()`),'the night page tells it');
  nextday();run('S.time=9;');frames(2);assert.equal(J("potAskDue39('nkechi',S.day)"),false,'pending: no second pot for the day');rws=rows();assert(rws.rows.some(r=>r[0]==='pot'),'Today’s row for Mr. Bassey’s pot');
  // Ada asks today too (her talk): her fish's card has both quiet buttons
  ph=talkTo39('ada');const askA=J('hxG().ada.ask');if(askA&&askA.day===J('S.day')&&askA.id!=='catfish'){run('S.time=14.05;');frames(2);let both=null;for(let k=0;k<8&&!both;k++){c=catchNow();if(c.card.includes('data-act="gist38ForAda"')){both=c;break;}
    assert(c.card.includes('data-act="pot39Keep"'),'the pot button on every card');if(J('hxB39G().pot.got')<ng-1)click('pot39Keep');else settle();run('closePanel();');}
   assert(both&&both.card.includes('data-act="pot39Keep"')&&primaries(both.card).length===1,'Ada’s and the pot’s buttons together, one primary');click('pot39Keep');run('closePanel();');R.together=askA.id;}
  while(J('hxB39G().pot.got')<ng){c=catchNow();click('pot39Keep');run('closePanel();');}
  run('S.time=16.9;');frames(30);assert(settled('bassey'),'Mr. Bassey on the waterfront');{const q=J('[npcs.bassey.g.position.x,npcs.bassey.g.position.z]');approach(0,q[0],q[1],1.2,2.0);}
  assert.equal(label(0),U.potGive.replace('{name}','Mr. Bassey'),'the give prompt at his live place before half past five: '+JSON.stringify([J('[JSON.stringify(hxB39G().pot),S.time,S.day,hxPos(0),[npcs.bassey.g.position.x,npcs.bassey.g.position.z]]'),cands(0)]));const q2=J('hxPos(0)');until(17.52);run(`hxAt(0,${q2[0]},${q2[1]});`);frames(4);
  assert.notEqual(label(0),U.potGive.replace('{name}','Mr. Bassey'),'gone after half past five');assert.equal(b39().pot.lapsed,J('S.day'),'lapsed quietly');rws=rows();assert(!rws.rows.some(r=>r[0]==='pot'),'no row after it lapsed');
  run('TOASTS=[];S.time=17.97;hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);');frames(2);until(18.02);frames(10);assert(!J('TOASTS.slice()').some(t=>/bowl/.test(t)),'no bowl');R.gist={day:dg,n:ng,lapsed:true};
  // the companion's AI player never gets the give prompt
  {const ai=J("(()=>{const list=[],d=(a,b)=>0;potHot39(1,list,()=>0.5);return list.length;})()");assert.equal(ai,0,'no prompt for a player without a pot open');}
  // Today's cap: a five-row v38 day (the lost thing heard, the wash heard, Ada's ask, this evening, the shelf) with the pot and Bisi's rows
  const capFix=D=>fix39(`G.found=${D-2};G.lost={i:2,since:${D},at:12,status:'out',heard:${D-1},told:1,ownerTold:0,heardMode:'new'};G.last={day:${D-1},guests:['tunde','ada'],tips:[{kind:'wash',arg:'wash',teller:'ada',owner:null,mode:null}],ids:[]};G.ada.ask={id:'croaker',day:${D},via:'talk',said:${D},casts:0,kept:0};G.ada.forAda=null;G.ada.pending=null;G.shelf={state:'none',day:0,upDay:0};o.day=${D};o.time=9;`);
  nextday();const dc=J('S.day');run('S.time=9;');frames(2);capFix(dc);
  ph=talkTo39(J(`potAskDue39('nkechi',S.day)`)?'nkechi':'bassey');const capR=rows().rows,capD=capR.map(r=>r[0]);run('hxScreen(390,844,true);');const capN=rows().rows.map(r=>r[0]);run('hxScreen(1280,800,false);');
  // (fixer, DOD-1, C5, S2) owner decision 1: Today says each morning whether she is coming; her sentence is folded into v38's "This evening" row
  // and that row is never dropped: the shelf, then carve, go instead
  assert.deepEqual(capD,['lost','wash','carve','bisi','pot'],'1280: Aunty Bisi in the evening row, the shelf dropped, the pot kept: '+JSON.stringify(capD));
  assert.deepEqual(capN,['lost','wash','bisi','pot'],'390: then carve, her sentence and the pot kept: '+JSON.stringify(capN));
  {const br=capR.find(r=>r[0]==='bisi'),want=J(`esc(bisiDay39(S.day)?BISI39.UI.eveOn:BISI39.UI.eveOff)`);assert(br&&br[1]===want,'her sentence in the evening row: '+JSON.stringify([br,want]));seen(br[1]);}
  R.cap={desk:capD,phone:capN};
  {const off=J('(()=>{for(let d=S.day+1;d<S.day+60;d++)if(!bisiDay39(d))return d;return -1;})()');assert(off>0,'an evening she does not pass');capFix(off);
   const rd=rows().rows;run('hxScreen(390,844,true);');const rn=rows().rows;run('hxScreen(1280,800,false);');const want=J('esc(BISI39.UI.eveOff)');
   assert(rd.some(r=>r[0]==='bisi'&&r[1]===want)&&rn.some(r=>r[0]==='bisi'&&r[1]===want),'(fixer, S2) on an evening off, a five-row morning says she is not passing, at both widths: '+JSON.stringify([rd,rn]));seen(want);R.capOff={day:off,desk:rd.map(r=>r[0]),phone:rn.map(r=>r[0])};}
  // (fixer, S5) the pot's count, its thanks and the gist ask follow the hash's high bits, not the day's parity: an asker (every second day) meets both
  {const par=J(`(()=>{const r=[];for(const q of [0,1]){const n=new Set(),t=new Set(),g=new Set();for(let d=5;d<=20;d++)if(d%2===q){n.add(potN39(d));t.add(potTy39(d));g.add(potGistLine39('nkechi',d,{potLast:{nkechi:1}})[0]);}r.push([n.size,t.size,g.size]);}return r;})()`);
   assert.deepEqual(par,[[2,2,2],[2,2,2]],'both counts, both thanks and both gist asks on odd and on even days: '+JSON.stringify(par));R.hash=par;}
  // (fixer, DOD-2, I1, S6) Mr. Bassey asks in his morning talk (the base talk, caught at its hotspot; talk and openTalk never wrapped)
  {nextday();for(let k=0;k<6&&!J("potAskDue39('bassey',S.day)");k++)nextday();assert(J("potAskDue39('bassey',S.day)"),'a morning his ask is due');run('S.time=9;');frames(2);
   const pb=talkTo39('bassey'),nb=J('potN39(S.day)'),tb=J(`potSay39(${JSON.stringify(P.bassey.talk[1])},${nb})`);seen(tb);
   assert(pb.includes(text39(tb)),'his ask in his talk: '+pb.replace(/<[^>]+>/g,' ').slice(0,300));assert(/data-act="close"/.test(pb),'his talk keeps its button');
   const pt=b39().pot;assert.deepEqual([pt.who,pt.via,pt.day,pt.n],['bassey','talk',J('S.day'),nb],'recorded: '+JSON.stringify(pt));assert(logHas('pot','ask:bassey'),'pot ask:bassey');
   rws=rows();assert(rws.rows.some(r=>r[0]==='pot'&&/Mr\. Bassey/.test(r[1])),'Today’s row for his pot');R.basseyTalk={day:J('S.day'),n:nb};}
  return R;});

 /* ---------- check 12: the copy (spec §4, §13) ---------- */
 check(12,()=>{const R={};assert(has39b(),'the module');
  const T=J("({L:GIST39.LINES,U:GIST39.UI,BL:typeof BISI39!=='undefined'?BISI39.LINES:{},BU:typeof BISI39!=='undefined'?BISI39.UI:{}})");
  const leaves=(o,pre,acc)=>{if(typeof o==='string')acc.push([pre,o]);else if(Array.isArray(o))o.forEach((v,k)=>leaves(v,pre+'['+k+']',acc));else if(o&&typeof o==='object')for(const k in o)leaves(o[k],pre?pre+'.'+k:k,acc);return acc;};
  // the speech: every [id, text] pair in GIST39.LINES and BISI39.LINES, and every text of round two's things; the interface: the UI tables
  const pairs=[];const walk=(o,pre)=>{if(Array.isArray(o)&&o.length===2&&typeof o[0]==='string'&&/^gs\d\d-/.test(o[0])&&typeof o[1]==='string'){pairs.push([o[0],o[1],pre]);return;}
   if(Array.isArray(o))o.forEach((v,k)=>walk(v,pre+'['+k+']'));else if(o&&typeof o==='object')for(const k in o)walk(o[k],pre+'.'+k);};walk(T.L,'GIST39.LINES');walk(T.BL,'BISI39.LINES');
  const ids=pairs.map(p=>p[0]);assert.deepEqual(ids.filter((x,k)=>ids.indexOf(x)!==k),[],'ids unique');assert(ids.every(id=>/^gs39-/.test(id)),'every id gs39-');
  const speech=pairs.map(p=>[p[2],p[1]]);for(const id in T.L.round){const r=T.L.round[id];for(const k of ['heard','recap','pickToast','giveLabel','pickLabel','long','area','say','name','pocket'])speech.push(['round.'+id+'.'+k,r[k]]);}
  const ui=leaves(T.U,'GIST39.UI',[]).concat(leaves(T.BU,'BISI39.UI',[]));
  const OK=new Set(['thing','owner','area','where','name','fish','piece','dish','n']);const WEEK=/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)s?\b/i;
  const US=/\b(color|colors|favorite|neighbor|neighbors|center|centers|honor|labor|gray|organize|realize|apologize|traveled|jewelry|theater|mom|program)\b/i;
  const bad=[];const rule=(where,t,isSpeech)=>{if(WEEK.test(t))bad.push(where+': a weekday');if(US.test(t))bad.push(where+': American spelling');if(/'/.test(t))bad.push(where+': a straight apostrophe');
   if(/[<>]/.test(t))bad.push(where+': markup');if(t.length>160)bad.push(where+': '+t.length+' characters');for(const m of t.matchAll(/\{(\w+)\}/g))if(!OK.has(m[1]))bad.push(where+': the placeholder {'+m[1]+'}');
   if(isSpeech&&/[0-9₦]/.test(t.replace(/1979/g,'')))bad.push(where+': a digit or ₦ in speech');};
  for(const [w,t] of speech)rule(w,t,true);for(const [w,t] of ui)rule(w,t,false);
  // every round-two and again entry complete (spots, labels, words), 7 to 30
  const ent=J("(()=>{const out=[];for(let i=7;i<=30;i++){const e=rotEntry39(i),R=GIST39.LINES,r=R.round[e.base||e.id];const w=e.v39==='round'?['lost','told','back','ty','heard','recap'].every(k=>r&&r[k]):(R.again[e.owner]&&R.againTy[e.owner]);"+
   "out.push({i,id:e.id,ok:!!(w&&e.spots.length&&e.pickLabel&&e.pickToast&&e.giveLabel&&e.say&&e.area&&e.long&&CAST[e.owner])});}return out;})()");for(const e of ent)if(!e.ok)bad.push('entry '+e.i+' ('+e.id+') incomplete');
  // (fixer, C1, DOD-5, S10) the again tip, the heard row and the give-back beat for every one of the twelve things read right (singular nouns)
  {const g=J(`(()=>{const out=[];for(let i=12;i<48;i++){const e=rotEntry39(i),n=againNoun39(e.id),U=GIST39.UI;
     out.push(gistFill39(GIST39.LINES.again[e.owner][1],{thing:n}),gistFill39(U.againHeard,{owner:CAST[e.owner].name,thing:n,area:e.area}),gistFill39(GIST39.LINES.give[e.owner][1],{thing:n}));}return out;})()`);
   const BADG=/(?<!of )\b(glasses|seeds|drawing pins) (has|is)\b|\bmy (glasses|seeds|drawing pins)\b|’s (glasses|seeds|drawing pins) /i;for(const t of g){if(BADG.test(t))bad.push('again or give-back: '+t);rule('again: '+t.slice(0,40),t,true);}R.again12=g.length;}
  // the texts rendered in checks 4 to 9 (toasts, rows, panels and lines shown, collected as they ran)
  for(const t of SEEN39)rule('rendered: '+t.slice(0,40),t.replace(/\s+/g,' ').trim(),false);
  assert.deepEqual(bad,[],'the copy rules: '+JSON.stringify(bad.slice(0,12)));R.lines={speech:speech.length,ids:ids.length,ui:ui.length,entries:ent.length,rendered:SEEN39.length};
  return R;});
 // ---- B END ----

 out.sort((a,b)=>a.n-b.n);return out;}

async function inner(only){const h=await world39();const side={};const res=checks(h,only,side);return {build:h.run('BUILD_ID'),checks:res,side};}

// a subset copy's globals: load it (the bench world: buildWorld, a household), play 300 frames over day 3 midday and day 4 at five, list the names
async function globals(){const out={names:[],warn:0,played:0,error:null};try{const {benchWorld}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));
 const {run,context}=await benchWorld();let n=0;const cw=context.console.warn;context.console={...context.console,warn:(...a)=>{if(/39/.test(String(a[0])))n++;}};
 run("S.day=3;S.time=11.95;var hxF2=0;{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<300;k++){T35+=1000/30;PERF35+=1000/30;last=hxF2;hxF2+=1000/30;tick(hxF2);}}finally{renderFrame=rf;}}");
 run("dispatch('nextday');closePanel();S.time=16.95;{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<300;k++){T35+=1000/30;PERF35+=1000/30;last=hxF2;hxF2+=1000/30;tick(hxF2);}}finally{renderFrame=rf;}}enterWorld();closePanel();");
 out.played=600;out.warn=n;context.console.warn=cw;
 const html=fs.readFileSync(path.join(GAME,'index.html'),'utf8'),lex=new Set();
 for(const [,attr,body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){const src=attr.match(/src="([^"]+)"/);if(src&&src[1].includes('three-r128'))continue;const code=src?fs.readFileSync(path.join(GAME,src[1]),'utf8'):body;
  for(const m of code.matchAll(/^(?:const|let|class)\s+([A-Za-z_$][\w$]*)/gm))lex.add(m[1]);for(const m of code.matchAll(/^(?:const|let)\s+([A-Za-z_$][\w$]*\s*=[^;]*?(?:,\s*[A-Za-z_$][\w$]*\s*=[^,;]*?)*);/gm)){for(const k of m[1].matchAll(/(?:^|,)\s*([A-Za-z_$][\w$]*)\s*=/g))lex.add(k[1]);}}
 const own=run('Object.getOwnPropertyNames(globalThis).join(",")').split(','),present=[...lex].filter(k=>{try{return run('typeof '+k)!=='undefined';}catch(e){return false;}});
 out.names=[...new Set(own.concat(present))].filter(k=>!/^hx|^PH$|^TOASTS$|^T35$|^PERF35$/.test(k)).sort();}catch(e){out.error=String(e&&e.message||e).split('\n')[0].slice(0,200);}
 return out;}
// a bare load (the copy without the v38 tags, or without v38 and v39): the bench world, 900 frames over day 4 from 16:50 with the v35 evening on
// day 3, the scene count, the Math.random calls during play, the hooks
async function bare(){const out={error:null};try{const {benchWorld}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));const {run}=await benchWorld();
 run("var hxMR=0;{const m=Math.random;Math.random=function(){hxMR++;return m.apply(this,arguments);};}");
 run("dispatch('nextday');closePanel();dispatch('nextday');closePanel();life34().evening35={doneDay:3};S.time=16.85;players[0].g.position.set(-4.0,0,6.5);hxMR=0;var hxF3=0;{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<900;k++){T35+=1000/30;PERF35+=1000/30;last=hxF3;hxF3+=1000/30;tick(hxF3);}}finally{renderFrame=rf;}}");
 out.mr=run('hxMR');out.count=run('(()=>{let n=0;scene.traverse(()=>{n++;});return n;})()');out.hooks=run('[HOTSPOT_HOOKS.length,ACT_HOOKS.length,TICK_HOOKS.length,typeof BISI39]').join();
 out.tagged=run('(()=>{let n=0;scene.traverse(o=>{if(o.userData&&o.userData.gist39)n++;});return n;})()');out.time=run('Math.round(S.time*1000)/1000');}catch(e){out.error=String(e&&e.message||e).split('\n')[0].slice(0,200);}return out;}
// the v38 build reading a v39 save (check 10): load it, enter the world, 60 frames on its evening, save
async function loadsave(f){const out={error:null};try{const h=await world();const {run}=h;run(`localStorage.setItem(KEY,${JSON.stringify(fs.readFileSync(f,'utf8'))});S=load();enterWorld();closePanel();`);
 run('hxFrames(60);save();');out.v39=run("typeof BISI39!=='undefined'");out.b39=run('!!(JSON.parse(localStorage.getItem(KEY)).life.gist38.b39)');out.day=run('S.day');}catch(e){out.error=String(e&&e.message||e).split('\n')[0].slice(0,200);}return out;}

const tail=o=>process.stdout.write(JSON.stringify(o)+'\n',()=>process.exit(0));
if(process.argv[2]==='--probe'){world39().then(h=>{const J=c=>JSON.parse(h.run('JSON.stringify('+c+')'));const P=probe(J);process.stdout.write(JSON.stringify(P,null,1)+'\n');process.exit(P.bad.length?1:0);}).catch(e=>{console.error(e);process.exit(1);});}
else if(process.argv[2]==='--globals'){globals().then(tail);}
else if(process.argv[2]==='--bare'){bare().then(tail);}
else if(process.argv[2]==='--loadsave'){loadsave(process.argv[3]).then(tail);}
else if(process.argv[2]==='--debug'){world39().then(h=>{const code=fs.readFileSync(process.argv[3],'utf8');const fn=new Function('h','J','run','assert',code);return fn(h,c=>JSON.parse(h.run('JSON.stringify('+c+')')),h.run,assert);}).then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});}
else if(process.argv[2]==='--inner'){const only=process.argv[3]?process.argv[3].split(',').map(Number):null;inner(only).then(tail).catch(e=>{console.error(e);process.exit(1);});}
else{(async()=>{
 const child=(args,env)=>new Promise(res=>{const p=cp.spawn(process.execPath,[__filename].concat(args),{env:Object.assign({},process.env,env||{}),stdio:['ignore','pipe','pipe']});let o='',e='';p.stdout.on('data',d=>o+=d);p.stderr.on('data',d=>e+=d);
  p.on('close',code=>{try{res(JSON.parse(o.trim().split('\n').pop()));}catch(x){res({error:(e||o).slice(-600)||('exit '+code)});}});});
 const dirs=[],mut=[];let a,b,wo,b38,bNone;const subs={};
 const html0=fs.readFileSync(path.join(GAME,'index.html'),'utf8');assert(TAGS39[0].test(html0),'the seller-v39 tag is in index.html');
 const withoutDir=variantDir(html=>strip(html,TAGS39));dirs.push(withoutDir);
 const no38Dir=variantDir(html=>strip(html,TAGS38));dirs.push(no38Dir);const noneDir=variantDir(html=>strip(strip(html,TAGS38),TAGS39));dirs.push(noneDir);
 const jobs=[async()=>{a=await child(['--inner']);},async()=>{b=await child(['--inner']);},async()=>{wo=await child(['--inner'],{COMPOUND_GAME_DIR:withoutDir});},
  async()=>{b38=await child(['--bare'],{COMPOUND_GAME_DIR:no38Dir});},async()=>{bNone=await child(['--bare'],{COMPOUND_GAME_DIR:noneDir});}]
  .concat([['lines','lines-v35.js'],['log','days-v35.js'],['tune','tune-v35.js']].map(([name,last])=>async()=>{const dW=subsetDir39(last,false),dO=subsetDir39(last,true);dirs.push(dW,dO);
   const g=await child(['--globals'],{COMPOUND_GAME_DIR:dW}),o=await child(['--globals'],{COMPOUND_GAME_DIR:dO});subs[name]={g,o};}))
  .concat(MUTANTS.filter(m=>!m.with).map((m,k)=>async()=>{const extra=MUTANTS.filter(x=>x.with===m.name.split(' ')[0]);const srcs={};
   for(const x of [m].concat(extra)){const f=x.file||'seller-v39.js';const t=srcs[f]!==undefined?srcs[f]:(fs.existsSync(path.join(GAME,'src',f))?fs.readFileSync(path.join(GAME,'src',f),'utf8'):'');const n=t.split(x.find).length-1;
    if(n!==1){mut.push({name:m.name,check:m.check,result:'stale ('+n+' matches of '+x.name.split(' ')[0]+')',k});return;}srcs[f]=t.replace(x.find,x.replace);}
   const fns={};for(const f in srcs)fns[f]=()=>srcs[f];const d=variantDir(null,fns);dirs.push(d);const r=await child(['--inner',String(m.check)],{COMPOUND_GAME_DIR:d});const c=r.checks&&r.checks.find(x=>x.n===m.check);
   mut.push({name:m.name+(extra.length?' (with '+extra.map(x=>x.name).join(', ')+')':''),check:m.check,result:c?(c.passed?'green':'red'):'error',k,first:c&&!c.passed?c.failure:(r.error?String(r.error).slice(0,300):undefined)});}));
 const PAR=Math.max(1,Math.min(2,+(process.env.GIST39_JOBS||2)));
 try{const q=jobs.slice();await Promise.all(Array.from({length:PAR},async()=>{while(q.length)await q.shift()();}));}finally{for(const d of dirs)fs.rmSync(d,{recursive:true,force:true});}
 mut.sort((x,y)=>x.k-y.k);for(const m of mut)delete m.k;
 const same=JSON.stringify(a)===JSON.stringify(b);
 const find=(r,n)=>r&&r.checks?r.checks.find(c=>c.n===n):null;
 // check 1: the inert worlds equal the run without v39
 {const c1=find(a,1);if(c1&&c1.passed){const ia=a.side,iw=wo&&wo.side;
   if(!(iw&&ia.inertA===iw.inertA)){c1.passed=false;c1.failure='the day-3 world at 10:00 differs from the run without v39 ('+ia.inertA+' against '+(iw&&iw.inertA)+')';}
   else if(!(iw&&iw.inertB&&ia.inertB&&ia.inertB.digest===iw.inertB.digest)){const pa=(ia.inertB&&ia.inertB.parts)||[],pw=(iw&&iw.inertB&&iw.inertB.parts)||[];c1.passed=false;c1.failure='the day-5 run differs from the run without v39 in: '+pa.filter((p,k)=>p!==pw[k]).map(p=>p.split(':')[0]).join(', ');}
   else c1.info.withoutV39={dayThree:iw.inertA,dayFive:iw.inertB.digest};}}
 // check 10: the scene count after a new household equals the run without v39 (exact teardown)
 {const c10=find(a,10);if(c10&&c10.passed){const ca=a.side.count10,cw=wo&&wo.side&&wo.side.count10;if(!(typeof ca==='number'&&ca===cw)){c10.passed=false;c10.failure='the scene after a new household differs from the run without v39 ('+ca+' against '+cw+' objects)';}else c10.info.sceneCount={objects:ca,sameAsWithout:true};}}
 // check 11: the rail spots equal the run without v39
 {const c11=find(a,11);if(c11&&c11.passed){const ra=a.side.rail11,rw=wo&&wo.side&&wo.side.rail11;if(JSON.stringify(ra)!==JSON.stringify(rw)){c11.passed=false;c11.failure='the rail spots differ from the run without v39: '+JSON.stringify([ra,rw]);}else c11.info.withoutV39={rail:rw};}}
 const groups=[];if(wo&&wo.checks)for(const c of wo.checks){const g=groups.find(x=>x.first===c.failure);if(c.passed)groups.push({checks:[c.n],first:'GREEN without v39'});else if(g)g.checks.push(c.n);else groups.push({checks:[c.n],first:c.failure});}
 const woRed=!!(wo&&wo.checks&&wo.checks.length===ORDER.length&&wo.checks.every(c=>!c.passed));
 // without v38, with v39: loads, builds nothing (the same scene, Math.random calls and hooks as a copy with neither)
 const noV38={error:b38&&b38.error||null,same:!!(b38&&bNone&&!b38.error&&!bNone.error&&b38.count===bNone.count&&b38.mr===bNone.mr&&b38.tagged===0&&b38.time===bNone.time),
  scene:b38&&b38.count,random:b38&&b38.mr,hooks:b38&&b38.hooks,hooksNone:bNone&&bNone.hooks};
 noV38.passed=noV38.same&&!!(b38&&bNone&&b38.hooks.split(',').slice(0,3).join()===bNone.hooks.split(',').slice(0,3).join());
 // the subset copies with v39: no error, no new global but v39's, none gone, no v39 warning
 const subsets={};let subOK=true;for(const name of ['lines','log','tune']){const s=subs[name]||{},g=s.g||{},o=s.o||{};const extra=(g.names||[]).filter(n=>!(o.names||[]).includes(n)),lost=(o.names||[]).filter(n=>!(g.names||[]).includes(n));
  const ok=!g.error&&!o.error&&extra.every(n=>/39/.test(n))&&!lost.length&&!g.warn;if(!ok)subOK=false;subsets[name]={loads:!g.error,v39Names:extra.length,otherNew:extra.filter(n=>!/39/.test(n)),gone:lost,warn:g.warn|0,error:g.error||o.error||null};}
 const report={build:a&&a.build||null,passed:!!(a&&!a.error&&same&&a.checks.length===ORDER.length&&a.checks.every(c=>c.passed)&&mut.every(m=>m.result==='red')&&woRed&&noV38.passed&&subOK),
  checks:(a&&a.checks||[]).map(c=>{const o=Object.assign({},c);delete o.n;return o;}),mutants:mut,withoutV39:{allRed:woRed,findings:groups},withoutV38:noV38,subsets,determinism:same?'identical':'differs'};
 if(a&&a.error)report.error=a.error;
 for(const c of report.checks)console.log((c.passed?'PASS ':'FAIL ')+c.name.slice(0,140)+(c.passed?'':' -- '+c.failure));
 for(const m of mut)console.log((m.result==='red'?'PASS ':'FAIL ')+'mutant '+m.name+' turns check '+m.check+' '+m.result);
 console.log((woRed?'PASS ':'FAIL ')+'without the v39 modules every check fails ('+groups.length+' distinct first failures)');
 console.log((noV38.passed?'PASS ':'FAIL ')+'without the v38 modules, with v39: loads and builds nothing '+JSON.stringify({scene:noV38.scene,random:noV38.random,hooks:noV38.hooks,error:noV38.error}));
 console.log((subOK?'PASS ':'FAIL ')+'the subset copies with v39 load, no new global but v39\'s '+JSON.stringify(subsets));
 console.log((same?'PASS ':'FAIL ')+'determinism: two runs give identical reports');if(a&&a.error)console.log('ERROR',a.error);
 fs.writeFileSync(OUT,JSON.stringify(report,null,1)+'\n');console.log(`${report.checks.filter(c=>c.passed).length}/${ORDER.length} checks, ${mut.filter(m=>m.result==='red').length}/${mut.length} mutants red`);
 process.exitCode=report.passed?0:1;})();}

// v38 Evening gist and daily finds (dist/src/found-v38.js, engineer A; dist/src/gist-v38.js, engineer B), checked on the real game logic in
// Node with the shipped Three.js (gist/SPEC.md §16). Households are made with the real setup actions (a local two-player household; the
// companion household through aiStart), the sofa is placed through its own success path, and the players are driven through the game's own
// key state (P1 WASD and E, P2 the arrows and Enter: keys[...] each frame, act[i] on the press frame) and the real tick, one frame at a time,
// with the 8-direction bot of bench §10.2. Setup may set the day, the time, S.life.evening35, S.money, S.home.items, the screen size and the
// players' standing places (as the bench and football harnesses do); it never sets S.life.gist38 and never calls a v38 function, except
// through a panel button's own data-act. Clock, Math.random, Date and performance.now are stubbed; the results file holds no wall-clock value.
// The checks run twice in child processes and the two reports must match. Each mutant (a one-place change to found-v38.js or gist-v38.js in a
// copy of dist) reruns only its named check, which must fail. A copy of dist without the two v38 tags runs every check, and each must fail
// there (checks with the same first failure are reported once). Check 10 also loads the verify-lines, verify-log and verify-tune subset copies
// with both v38 tags present. Prints one PASS or FAIL line per check and writes check/results-gist-v38.json. GIST38_JOBS (default 2, at most 2)
// runs the child processes in parallel.
// Engineer A's checks are 2, 6, 7 and 10 (and mutants M5, M10, M11, M12); engineer B's are 1, 3, 4, 5, 8 and 9 (and M1-M4, M6-M9, M13), added
// in the section marked "engineer B" below. Engineer C's is check 11, Ada's carvings (the afternoon fish), with mutants M14-M19; the runner also
// compares check 11's reels before discovery with the run without the modules. The fixer's assertions (the reviews of the integrated build) are
// marked "the fixer" with the finding's id, with mutants M20-M32. `node check/verify-gist-v38.cjs --probe` runs A's spot probe alone (exit 1 on any break).
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const OUT=path.join(__dirname,'results-gist-v38.json');
const GAME=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');process.env.COMPOUND_GAME_DIR=GAME;
const NAMES={
 1:'1. inert: on day 3 at 10:00 before discovery the world (3,000 blocked() points, the save and its keys, 600 frames of cameras and prompts, the Menu, Today) and line35 for the v35 guests are as without the modules; TICK_HOOKS 17, cue hooks 2, the audio recipes, LINES35, WHEN35, DAYS35.rows and the pinned sources unchanged; a v35-pending household runs the v35 evening and no gist; a day-3 household after its v35 evening gets none; positive: the glasses lie out at 12:00 on day 3 with no record',
 2:'2. first-find (local pair, real keys): every candidate spot passes the spot rules; nothing at 11:59, the glasses at 12:00 at (0.6, 13.4) within 1 mm; the glint invisible beyond 8 m and visible within, and its star at the edge of the view exactly when it is in reach but out of view; "Pick up reading glasses" within 1.3 m and not at 1.4 m; Act: the toast, S.life.gist38 (via find, found 3), the pocket, the find log, the mesh gone, no game time; "Give Mama Nkechi her glasses" beats "Talk to Mama Nkechi" at 1.2 m; the return panel, the fan, friendship +1, the log; the click guard on the panel just after the Act (and while the pointer is held); the chain: given back at 14:00 the chisel lies at its spot the same frame, its owner told (its toast names Ada), Ada\'s thanks passes on the adapter, at 15:45 not until midday tomorrow; day 4: the adapter at its hashed spot from 12:00 and not before, Today saying what Ada said; a day-old thing glints at 9 m; the companion household by P1\'s keys',
 3:'3. gist-visit (local pair, day 4, v35 evening on day 3): seated on the bench at 18:14, standing on the veranda by the bench as the guests come at 18:15 with the gate toast, which goes when they reach the rail; both glide to the rail (from inside the room by the door; a player out in the compound is not moved; a pair seated from inside stand on the veranda side); spots by the evening\'s rules; discovery on the talking frame; every script line in order by Listen, gs38 ids, gs38-nk-first first; Ehen? on tip lines, Next, Goodnight; no empty caption; S.life.evening35, doneToday, the album (+1, then +0), one gist and no evening event, the engine\'s guests and copy as at load; the zobo tray; the 8 s timer; the fallback lines for Mr. Bassey and Mrs. Oyelaran; aborts (a new day, a party, online, walking out) put everything back, log nothing and count a try; a retry after ten game minutes; no third try',
 4:'4. tips-tomorrow (a pair and a companion household, days F to F+6, real keys): every tip pays off the next day at its time and not before (a new thing at 12:00 at its spot, the wash at 13:30, the pocket owner where told), Today\'s rows are the tips heard, the owner of a thing told by another is the other guest and answers back, the pocket owner never comes, no pair two nights running, gistPlan38 twice deep-equal and changes nothing, the line about today retells today\'s return; Mrs. Oyelaran back at six',
 5:'5. copy: every line of GIST38.LINES and FOUND38\'s speech (no weekday, British spelling, no digit or ₦ but 1979, curly apostrophes, no markup, at most 160 characters, only the four placeholders), ids unique and gs38-; UI text; every tip kind has a line for every teller, every lost thing its pickup, give, thanks, retold and tip lines and an answer-back where needed; the texts as rendered',
 6:'6. shells-wash: before discovery the base toast; after it the kind by hash, "One for the shelf" for new kinds only, the base count exactly as before; on the wash day (F+2) nothing at 13:29, three shells at 13:30 at the probed spots, the cowrie at hash38(day,5) % 3 counted as a shell and kept; the shells gone at 15:30 and the wet sand faded in 2 s; no wash on other days; no cowrie from a morning spot on days F to F+8',
 7:'7. shelf: ₦4,999 refused; ₦5,000 ordered, up the next morning on the back wall over the mattress (columns 0-1, clear of the sign over the sofa) within 1 mm, planks at 1.91 and 2.07 m; wall pieces hung under it stay clear of it; blocked() and fitsHome34 identical with it up; at most 10 item groups; no rebuild over 300 idle frames; the panel\'s counts; both sets complete (memory, log, "Complete"); the full shelf and the carvings\' place below the top bar at 1280x800 for a player in front of it',
 8:'8. interplay: the bench (no offer before discovery; Wait here until the neighbours come at 18:15; they stand; ade36 unused; the page as bench check 13 reads it; held while carried); football (waits for a match and the call-in at 18:20, 18:15 without a match; its evening line once a save, never on the first gist); framing at 1280x800, 390x844 and 844x390, and at 844x390 the caption strip below every guest; football\'s line third, after her greeting; the sofa\'s 18:12 then the gist by 18:16; a companion household; a v35-pending household as before; Mrs. Oyelaran back at six; the nudge once per household after discovery',
 9:'9. day-loop: no card before discovery; the rows per state (the chisel\'s owner named after the glasses\' thanks), after football\'s card, at most four at 390 px; Today\'s lost row "today" only on the day a told thing comes out, then "still lying out, as you heard"; contrast 4.5:1; the night page and recap35 as without a record; Tonight\'s gist after a tip, pure; no "The compound was quiet." after a gist; LOG35.kinds has the six kinds once (carve is engineer C\'s); the gates tool reads them with no warnings and the same grades; tools/quiet-v38.cjs reads a paste',
 10:'10. save-modes-and-cost: a v37-style save loads, plays and saves with the keys of S and S.life unchanged and no v38 record; a reload keeps the pocket; stripState has no gist38; online no v38 object, offline back; no tagged object after newgame, newconfirm, an enterWorld into day 2 and going online, and the scene count the same as without the modules; ?gist=now applied once; the verify-lines, verify-log and verify-tune subset copies load with both v38 tags, no error and no new global but v38\'s; no Math.random call across a lost-thing spawn, a wash spawn and a shelf build; the cost: no blocked() or levelAt() call in the step or the prompt hook on an inert frame, an item frame or a spawn, at most 2 v38 objects outside the flat (8 on a wash afternoon); the step ran',
 11:'11. carvings (engineer C; owner decision 2, the afternoon fish): before discovery the reels are the base\'s and Ada names nothing; after it Ada names one fish a day she has not carved, in her talk (today) or in the gist before the goodbye (tomorrow), the plan pure; it bites only in its window (12:30 to 15:30; the catfish after six), within four casts there and never outside; the catch card\'s quiet Keep it for Ada through Let it swim (nothing sold, one primary); Today\'s row (asked, kept, carving); given to Ada by keys for her line, free (FOUND38.CARVE_PRICE 0; above 0 spend() is used), friendship and the carve log; carved the next morning onto the third plank; a kept fish keeps until six the next evening and blocks a new ask; six carvings complete the set, below the top bar at 1280x800; the shelf row counts them on their own; a companion household with no shelf (the carving waits for one)'};
const ORDER=[1,2,3,4,5,6,7,8,9,10,11];
// one-place changes, each of which must turn its check red (file: the module changed; B adds M1-M4, M6-M9 and M13)
const MUTANTS=[
 {name:'M5 the first item ignores LOST_AT',check:2,file:'found-v38.js',find:'at:FOUND38.flags.now?0:FOUND38.LOST_AT,',replace:'at:0,'},
 {name:'M10 the shelf adds a box to FURN_OBS',check:7,file:'found-v38.js',find:'W.shelf=g;W.shelfKey=key;',
  replace:"W.shelf=g;W.shelfKey=key;if(typeof FURN_OBS!=='undefined'){const h=FOUND38.SHELF.w/2;FURN_OBS.push(span.wall==='back'?{x1:span.x-h,x2:span.x+h,z1:2.0,z2:2.0+FOUND38.SHELF.depth+0.02,tag:'furn'}:{x1:-8.0,x2:-8.0+FOUND38.SHELF.depth+0.02,z1:span.z-h,z2:span.z+h,tag:'furn'});}"},
 {name:'M11 the typeof EVENING35 guard around A\'s tick wrapper removed',check:10,file:'found-v38.js',find:"if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.tick==='function'){\n const prevEveTick38a",replace:"{\n const prevEveTick38a"},
 {name:'M12 the lost thing\'s mesh built outside quiet38',check:10,file:'found-v38.js',find:'const g=quiet38(()=>found38ItemMesh(it));',replace:'const g=found38ItemMesh(it);'},
 // engineer B's
 {name:'M1 gistSave38(true) called without a trigger (in the step)',check:1,file:'gist-v38.js',find:'if(Gs.t<Gs.checkAt)return;Gs.checkAt=Gs.t+0.25;',replace:'if(Gs.t<Gs.checkAt)return;Gs.checkAt=Gs.t+0.25;gistSave38(true);'},
 {name:'M2 the next wrapper does not restore S.life.evening35',check:3,file:'gist-v38.js',find:'finally{cue35=c;remember=m;save=sv;S.life.evening35=JSON.parse(eve);}',replace:'finally{cue35=c;remember=m;save=sv;}'},
 {name:'M3 the cue35 filter removed',check:3,file:'gist-v38.js',find:"cue35=function(name){if(name==='evening')return;return c.apply(this,arguments);};",replace:''},
 {name:'M4 the trigger drops doneDay < S.day',check:8,file:'gist-v38.js',find:'S.life.evening35.doneDay<S.day))return false;',replace:'S.life.evening35.doneDay<=S.day))return false;'},
 {name:'M6 the abort wrapper does not restore E.guests',check:3,file:'gist-v38.js',find:"const counted=v.phase==='arriving'||v.phase==='talking';gistRestore38();",replace:"const counted=v.phase==='arriving'||v.phase==='talking';const g=EVENING35.guests;gistRestore38();EVENING35.guests=g;"},
 {name:'M7 the recap block clears last after drawing',check:9,file:'gist-v38.js',find:"if(!out.length)return '';return `<div class=\"recap35 gist38-recap\">",replace:"G.last=null;if(!out.length)return '';return `<div class=\"recap35 gist38-recap\">"},
 {name:'M8 the wash tip reads today instead of tomorrow',check:4,file:'gist-v38.js',find:'const washTomorrow=Tm.wash;',replace:'const washTomorrow=Td.wash;'},
 {name:'M9 the line35 wrapper serves gist lines without a live visit',check:1,file:'gist-v38.js',find:"if(!(v&&ctx&&ctx.evening&&gistEve38()&&EVENING35.state!=='idle'))return prevLine38.apply(this,arguments);",replace:"if(!(ctx&&ctx.evening))return prevLine38.apply(this,arguments);"},
 {name:'M13 fb37-nkechi-evening let through on every gist',check:8,file:'gist-v38.js',find:"if(!G||G.once.fb37)return false;",replace:"if(!G)return false;"},
 // engineer C's (Ada's carvings)
 {name:'M14 the asked fish bites outside its window',check:11,file:'found-v38.js',find:'else for(let s=0;s<n&&pool[j]===ask.id;s++)j=(j+1)%n;',replace:''},
 {name:'M15 Keep it for Ada offered for any species not carved (the first design)',check:11,file:'found-v38.js',
  find:'function found38CarveOffer(G,id){const ask=found38AskOpen(G);return !!(ask&&ask.id===id&&FOUND38.CARVE.includes(id)&&G.ada.gaveDay!==S.day);}',
  replace:'function found38CarveOffer(G,id){return !!(G&&!found38Online()&&FOUND38.CARVE.includes(id)&&!G.keep.carve.includes(id)&&!(G.ada.pending&&G.ada.pending.id===id)&&!found38ForAda(G)&&G.ada.gaveDay!==S.day);}'},
 {name:'M16 a second ask the same day',check:11,file:'found-v38.js',find:'if(ask&&ask.day>=day)return false;',replace:''},
 {name:'M17 Keep it for Ada clears the catch itself (not through Let it swim)',check:11,file:'found-v38.js',find:"ACTIONS.lifeCatch({v:'release'});if(l.catch)return;",replace:'l.catch=null;'},
 {name:'M18 the gist plan records Ada\'s ask (not pure)',check:11,file:'gist-v38.js',find:"if(a)script.push({k:'ada',id:a.id,text:a.text,carve:a.fish,carveDay:a.day});",replace:"if(a){found38Asked(G,a,'gist');script.push({k:'ada',id:a.id,text:a.text,carve:a.fish,carveDay:a.day});}"},
 {name:'M19 the carving is not free',check:11,file:'found-v38.js',find:'CARVE_PRICE:0,',replace:'CARVE_PRICE:1500,'},
 // the fixer's (the reviews of the integrated build)
 {name:'M20 Today\'s heard row back to the last gist alone (M1: how it was heard ignored, and "today" on any day)',check:9,file:'gist-v38.js',find:'const mode=lt.heardMode||(',replace:'const mode=('},
 {name:'M20b the second half of M20',with:'M20',file:'gist-v38.js',find:"const fresh=mode!=='remind'&&S.day===Td.lost.since&&",replace:"const fresh=mode!=='remind'&&"},
 {name:'M21 no glide to the rail when the guests arrive (S2)',check:3,file:'gist-v38.js',find:'gistGateGone38();gistGlideStart38(v);}',replace:'gistGateGone38();}'},
 {name:'M22 the bench pair stand where they sat down from (S2)',check:3,file:'gist-v38.js',find:'gistBenchFront38(seated);return true;',replace:'return true;'},
 {name:'M23 a thank-you tells nothing about the next thing (L2, C2)',check:2,file:'found-v38.js',find:'TOLD_NEXT:{glasses:{owner:true},chisel:{owner:true}},',replace:'TOLD_NEXT:{},'},
 {name:'M24 the night page still calls the compound quiet after a gist (C4)',check:9,file:'gist-v38.js',find:'h=gistNightQuiet38(h);',replace:''},
 {name:'M25 no click guard on a panel opened by an Act (S3)',check:2,file:'found-v38.js',find:"if(kind==='gist38give'||kind==='gist38ada')foundGuard38();",replace:''},
 {name:'M26 no star at the edge of the view (S4)',check:2,file:'found-v38.js',find:'foundEdgeFrame38(pulse);',replace:''},
 {name:'M27 the shelf back at its first heights (M2)',check:11,file:'found-v38.js',find:'tiers:[1.91,2.07,2.27]',replace:'tiers:[2.02,2.32,2.62]'},
 {name:'M28 the carvings back in the shelf\'s count (S8)',check:11,file:'found-v38.js',find:'let have=0,of=0;for(const k in sets){have+=sets[k][0];of+=sets[k][1];}if(carve)sets.carve=[c.carve.length,FOUND38.SETS.carve];',
  replace:'if(carve)sets.carve=[c.carve.length,FOUND38.SETS.carve];let have=0,of=0;for(const k in sets){have+=sets[k][0];of+=sets[k][1];}'},
 {name:'M29 football\'s line replaces Mama Nkechi\'s greeting again (S10)',check:8,file:'gist-v38.js',find:"if(l&&l.id==='fb37-nkechi-evening')gistFootballLine38(who,l);",replace:"if(l&&l.id==='fb37-nkechi-evening'){gistFootballLine38(who,l);return l;}"},
 {name:'M30 Today promises the shelf when there is none (L1)',check:11,file:'found-v38.js',find:"(G.shelf.state==='none'?U.carveDoingNoShelf:U.carveDoing)",replace:'U.carveDoing'},
 {name:'M31 the landscape caption back over the guests (S1)',check:8,file:'gist-v38.css',find:'bottom:calc(72px + env(safe-area-inset-bottom,0px));',replace:''},
 {name:'M32 the gate toast stays after the guests reach the rail',check:3,file:'gist-v38.js',find:'gistGateGone38();gistGlideStart38(v);}',replace:'gistGlideStart38(v);}'}];
const TAGS=[/<script type="text\/javascript" src="src\/found-v38\.js"><\/script>\n?/,/<script type="text\/javascript" src="src\/gist-v38\.js"><\/script>\n?/];

// a copy of dist with index.html changed by htmlFn and the named src files by srcFns (everything else linked)
function variantDir(htmlFn,srcFns){const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd38-gist-'));srcFns=srcFns||{};
 for(const f of ['assets','data'])if(fs.existsSync(path.join(GAME,f)))fs.symlinkSync(path.join(GAME,f),path.join(d,f));
 fs.mkdirSync(path.join(d,'src'));for(const f of fs.readdirSync(path.join(GAME,'src'))){if(srcFns[f]){fs.writeFileSync(path.join(d,'src',f),srcFns[f](fs.readFileSync(path.join(GAME,'src',f),'utf8')));continue;}fs.symlinkSync(path.join(GAME,'src',f),path.join(d,'src',f));}
 fs.writeFileSync(path.join(d,'index.html'),htmlFn?htmlFn(fs.readFileSync(path.join(GAME,'index.html'),'utf8')):fs.readFileSync(path.join(GAME,'index.html'),'utf8'));return d;}
// the subset copies the v35 harnesses make (subsetDir35 in verify-lines, verify-log and verify-tune: bare -v35 tags after the cut removed;
// typed tags stay), optionally with the v38 tags taken out as well
function subsetDir38(last,noV38){const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd38-sub-'));
 for(const f of ['assets','src','data'])if(fs.existsSync(path.join(GAME,f)))fs.symlinkSync(path.join(GAME,f),path.join(d,f));
 let html=fs.readFileSync(path.join(GAME,'index.html'),'utf8'),cut=false;
 for(const [tag,src] of [...html.matchAll(/<script src="([^"]+-v35\.js)"><\/script>\n?/g)]){if(cut)html=html.replace(tag,'');if(src.endsWith('/'+last))cut=true;}
 if(!cut){fs.rmSync(d,{recursive:true,force:true});throw new Error('subset: '+last+' not found');}
 if(noV38)for(const T of TAGS)html=html.replace(T,'');fs.writeFileSync(path.join(d,'index.html'),html);return d;}

// the world every check uses (the bench's: a local pair on day 2 with the sofa placed), plus the harness helpers inside the game (prefix hx)
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

const r3=v=>Math.round(v*1000)/1000;
// the spot rules of §4 and §7.2 (A's probe): free at PR and PR + 0.5, level ground, not in a flat, outside the football zone (0.5 m margin),
// 1.5 m clear of the square goal's mouths, more than 2.2 m from every prompt (the stall prompts and the morning shells included), 1.5 m from the
// boats, and reachable on foot from the flat door; the wash spots free at PR on level sand, 2.2 m from the morning shells and the photo spot and
// 2 m apart; the shelf spans clear of the wall top. Returns the table; throws on the first break.
function probe(J){return J(`(()=>{const F=FOUND38,out={lost:{},wash:[],shelf:null},bad=[];
 const H=[[12.4,14.2],[-3,11.2],[3,12.5],[20.8,7.1],[26.4,0],[6,-15.2],[-6,-15.2],[6,-19.3],[-6,-19.3],[0,-5.5],[-22,-4.0],[-18,6.4],[0,-17.7],[-5.6,6.35]];
 for(const st of STALLS){const dir=st.z<0?1:-1;H.push([st.x,st.z+dir*1.1]);}for(const s of SHELLS34)H.push([s[0],s[1]]);
 const BOATS=[[-8,14.6],[9,15.1]];
 // an A* over blocked() from the flat door (the day sim's NAV38, 0.25 m grid)
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
 const door=[-3.95,6.6],md=(x,z,L)=>Math.min(...L.map(h=>Math.hypot(h[0]-x,h[1]-z)));
 // the ground's top under a spot, and nothing standing over it (a prop with no collider would hide the thing): five rays from 2.5 m
 const rc=new THREE.Raycaster(),objs=[];scene.updateMatrixWorld(true);scene.traverse(o=>{if(o.isMesh&&o.visible&&!(o.material&&o.material.transparent&&o.material.opacity<0.05)&&!(o.userData&&o.userData.gist38)&&!players.some(p=>{let q=o;while(q){if(q===p.g)return true;q=q.parent;}return false;}))objs.push(o);});
 const top=(x,z)=>{rc.set(new THREE.Vector3(x,2.5,z),new THREE.Vector3(0,-1,0));const h=rc.intersectObjects(objs,false);return h.length?2.5-h[0].distance:null;};
 const ground=(x,z,y,why)=>{const c=top(x,z);let mx=-1;for(const [dx,dz] of [[0,0],[0.3,0],[-0.3,0],[0,0.3],[0,-0.3]])mx=Math.max(mx,top(x+dx,z+dz));
  if(mx>0.1)why.push('covered at '+mx.toFixed(2)+' m');const want=y===undefined?F.GROUND:y;if(c===null||Math.abs(c-want)>0.005)why.push('the ground at '+(c===null?'none':c.toFixed(3))+' m, not '+want);return c===null?null:+c.toFixed(3);};
 for(const it of F.LOST){out.lost[it.id]=[];for(const [x,z,y] of it.spots){const why=[];const gy=ground(x,z,y,why);
  if(blocked(x,z,PR))why.push('blocked at PR');if(blocked(x,z,PR+0.5))why.push('blocked at PR+0.5');if(Math.abs(levelAt(x,z))>1e-6)why.push('not level');if(inFlat(x,z))why.push('in a flat');
  if(x>-30.9&&x<-16.3&&z>6.1&&z<13.3)why.push('in the football zone');if(Math.abs(x+21)<=4&&z>-4.94-1.5&&z<-2.06+1.5)why.push('in a square goal mouth');
  const dh=md(x,z,H);if(!(dh>2.2))why.push('a prompt at '+dh.toFixed(2)+' m');const db=md(x,z,BOATS);if(db<1.5)why.push('a boat at '+db.toFixed(2)+' m');
  const L=pathLen(door,[x,z]);if(L===null)why.push('unreachable');out.lost[it.id].push([x,z,+dh.toFixed(2),L,gy]);if(why.length)bad.push(it.id+' ('+x+', '+z+'): '+why.join(', '));}}
 for(let n=0;n<F.WASH_SPOTS.length;n++){const [x,z]=F.WASH_SPOTS[n],why=[];if(blocked(x,z,PR))why.push('blocked at PR');if(Math.abs(levelAt(x,z))>1e-6)why.push('not level');
  const ds=md(x,z,SHELLS34.map(s=>[s[0],s[1]])),dp=Math.hypot(x-3,z-12.5);if(!(ds>=2.2))why.push('a morning shell at '+ds.toFixed(2));if(!(dp>=2.2))why.push('the photo spot at '+dp.toFixed(2));
  for(let m=0;m<n;m++){const q=F.WASH_SPOTS[m];if(Math.hypot(q[0]-x,q[1]-z)<2)why.push('another wash spot within 2 m');}
  const gy=ground(x,z,undefined,why);const L=pathLen(door,[x,z]);if(L===null)why.push('unreachable');out.wash.push([x,z,+ds.toFixed(2),L,gy]);if(why.length)bad.push('wash ('+x+', '+z+'): '+why.join(', '));}
 const SH=F.SHELF,shTop=SH.tiers[SH.tiers.length-1]+0.015+0.12;if(shTop>2.8)bad.push('the shelf reaches '+shTop.toFixed(2)+' m, above the 2.8 m wall');
 // the shelf's volume (its span on the back wall, from the side boards' feet to the top of the third plank's carvings) clear of everything in the
 // flat: the scene's meshes and the painted signs (buildSigns and buildSigns2 run at boot in the browser; drawn here into a scene of their own)
 {const lo=SH.tiers[0]-(SH.foot!==undefined?SH.foot:0.135),hi=shTop,x1=SH.x-SH.w/2,x2=SH.x+SH.w/2,z1=SH.z-SH.depth/2,z2=SH.z+SH.depth/2,bb=new THREE.Box3(),hits=[];
  if(x1<FLAT.x0+FLAT.cell*SH.cols[0]-1e-9||x2>FLAT.x0+FLAT.cell*(SH.cols[1]+1)+1e-9)bad.push('the shelf is wider than its two columns');
  const real=scene,keepR=Math.random;let sg=null;try{let q=99;Math.random=()=>{q=(q*16807)%2147483647;return q/2147483647;};scene=new THREE.Scene();if(typeof buildSigns==='function'&&SIGNS.length)buildSigns();if(typeof buildSigns2==='function')buildSigns2();sg=scene;}catch(e){bad.push('the signs could not be drawn: '+e.message);}finally{scene=real;Math.random=keepR;}
  const test=root=>{root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh||!o.visible||(o.userData&&o.userData.gist38))return;bb.setFromObject(o);if(bb.max.x-bb.min.x>3||bb.max.z-bb.min.z>3)return;
   if(bb.min.x<x2&&bb.max.x>x1&&bb.min.y<hi&&bb.max.y>lo&&bb.min.z<z2&&bb.max.z>z1)hits.push([bb.min.x,bb.max.x,bb.min.y,bb.max.y,bb.min.z,bb.max.z].map(v=>+v.toFixed(2)));});};
  test(scene);if(sg)test(sg);if(hits.length)bad.push('the shelf meets '+JSON.stringify(hits.slice(0,3)));
  // and the sign over the sofa is still where it is drawn (the reason the shelf is not over the sofa)
  out.signs=sg?sg.children.length:0;}
 out.shelf={x:SH.x,w:SH.w,tiers:SH.tiers,top:+shTop.toFixed(3)};out.bad=bad;return out;})()`);}

// check 9's stylesheet reader (bench check 30's, copied with its names ending in 38)
// check 30's own stylesheet reader: the page's stylesheets in page order (the linked files and the inline blocks), the rules of those @media
// blocks that apply at a given screen, and a cascade over an element chain (tag, id, classes): selectors of tags, ids, classes, attributes,
// :root and :not() joined by descendant or child combinators (anything else never matches), specificity, !important, inheritance of color
// and of custom properties, var(); a colour is a hex, rgb()/rgba() or a few names, and a background is the nearest one in the chain
function sheets38(game){const html=fs.readFileSync(path.join(game,'index.html'),'utf8'),out=[];const re=/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>|<style[^>]*>([\s\S]*?)<\/style>/g;let m;
 while((m=re.exec(html))){if(m[1]){if(/^https?:/.test(m[1]))continue;out.push(fs.readFileSync(path.join(game,m[1]),'utf8'));}else out.push(m[2]);}return out;}
function media38(q,scr){return q.split(',').some(part=>{let p=part.trim().toLowerCase(),neg=false;if(p.startsWith('not ')){neg=true;p=p.slice(4);}
  const ok=p.split(/\s+and\s+/).every(t=>{t=t.trim();if(t==='screen'||t==='all'||t==='only screen')return true;const f=/^\(\s*([a-z-]+)\s*:\s*([^)]+?)\s*\)$/.exec(t);if(!f)return false;const v=f[2];
   switch(f[1]){case 'max-width':return scr.w<=parseFloat(v);case 'min-width':return scr.w>=parseFloat(v);case 'max-height':return scr.h<=parseFloat(v);case 'min-height':return scr.h>=parseFloat(v);
    case 'orientation':return v===(scr.h>scr.w?'portrait':'landscape');case 'hover':return v===(scr.touch?'none':'hover');case 'pointer':return v===(scr.touch?'coarse':'fine');
    case 'prefers-color-scheme':return v===(scr.scheme||'light');default:return false;}});return neg?!ok:ok;});}
function strip38(css){return css.replace(/\/\*[\s\S]*?\*\//g,'');}
// the style rules in order: [{sel, decls:[[prop,value,important]]}], with the @media blocks that apply flattened in place
function rules38(css,scr,out){css=strip38(css);out=out||[];let i=0;const n=css.length;
 while(i<n){const ob=css.indexOf('{',i);if(ob<0)break;const head=css.slice(i,ob).trim();let d=1,j=ob+1;while(j<n&&d){if(css[j]==='{')d++;else if(css[j]==='}')d--;j++;}const body=css.slice(ob+1,j-1);i=j;
  if(head.startsWith('@media')){if(media38(head.slice(6).trim(),scr))rules38(body,scr,out);continue;}if(head.startsWith('@'))continue;
  const decls=[];for(const dcl of body.split(';')){const c=dcl.indexOf(':');if(c<0)continue;let p=dcl.slice(0,c).trim().toLowerCase(),v=dcl.slice(c+1).trim();const imp=/!important\s*$/.test(v);if(imp)v=v.replace(/!important\s*$/,'').trim();if(p)decls.push([p,v,imp]);}
  for(const sel of splitTop38(head))out.push({sel:sel.trim(),decls,order:out.length});}
 return out;}
function splitTop38(s){const out=[];let d=0,cur='';for(const ch of s){if(ch==='('||ch==='[')d++;if(ch===')'||ch===']')d--;if(ch===','&&!d){out.push(cur);cur='';}else cur+=ch;}if(cur.trim())out.push(cur);return out;}
// a compound selector against one element {tag, id, cls:[], attrs:{}, root}
function compound38(c,el){let rest=c,spec=[0,0,0];const take=re=>{const m=re.exec(rest);if(!m)return null;rest=rest.slice(m[0].length);return m;};
 let m=take(/^([a-zA-Z][a-zA-Z0-9-]*|\*)/);if(m){if(m[1]!=='*'){if(m[1].toLowerCase()!==el.tag)return null;spec[2]++;}}
 while(rest.length){if((m=take(/^#([\w-]+)/))){if(el.id!==m[1])return null;spec[0]++;continue;}
  if((m=take(/^\.([\w-]+)/))){if(!el.cls.includes(m[1]))return null;spec[1]++;continue;}
  if((m=take(/^\[\s*([\w-]+)\s*(?:([~|^$*]?=)\s*["']?([^"'\]]*)["']?\s*)?\]/))){const v=(el.attrs||{})[m[1]];if(v===undefined)return null;if(m[2]&&!(m[2]==='='?v===m[3]:m[2]==='~='?v.split(/\s+/).includes(m[3]):m[2]==='^='?v.startsWith(m[3]):m[2]==='$='?v.endsWith(m[3]):v.includes(m[3])))return null;spec[1]++;continue;}
  if((m=take(/^:root/))){if(!el.root)return null;spec[1]++;continue;}
  if((m=take(/^:not\(([^()]*)\)/))){const r=compound38(m[1].trim(),el);if(r)return null;spec[1]++;continue;}
  return null;}                                                                       // :hover, :has(), ::before and the rest never match here
 return spec;}
// a complex selector against the chain (root first, the element last): descendant and child combinators only
function match38(sel,chain){const parts=sel.replace(/\s*>\s*/g,' > ').trim().split(/\s+/);if(parts.some(p=>p==='+'||p==='~'||/[+~]/.test(p.replace(/\[[^\]]*\]/g,''))))return null;
 const total=[0,0,0];const last=parts.pop(),s0=compound38(last,chain[chain.length-1]);if(!s0)return null;s0.forEach((v,k)=>total[k]+=v);
 let idx=chain.length-2;while(parts.length){let comb=' ';if(parts[parts.length-1]==='>'){comb='>';parts.pop();}const c=parts.pop();if(c===undefined)return null;
  if(comb==='>'){if(idx<0)return null;const s=compound38(c,chain[idx]);if(!s)return null;s.forEach((v,k)=>total[k]+=v);idx--;}
  else{let found=null;while(idx>=0){const s=compound38(c,chain[idx]);idx--;if(s){found=s;break;}}if(!found)return null;found.forEach((v,k)=>total[k]+=v);}}
 return total;}
function cmpSpec38(a,b){for(let k=0;k<3;k++)if(a[k]!==b[k])return a[k]-b[k];return 0;}
// the cascaded value of prop on chain[k] (no inheritance), or undefined
function cascaded38(R,chain,k,prop){let best=null;const sub=chain.slice(0,k+1);
 for(const r of R){const d=r.decls.filter(x=>x[0]===prop);if(!d.length)continue;const sp=match38(r.sel,sub);if(!sp)continue;for(const x of d){const cand={v:x[1],imp:x[2],sp,o:r.order};
   if(!best||(cand.imp!==best.imp?cand.imp:(cmpSpec38(cand.sp,best.sp)>0||(cmpSpec38(cand.sp,best.sp)===0&&cand.o>=best.o))))best=cand;}}
 return best?best.v:undefined;}
function inherited38(R,chain,k,prop){for(let j=k;j>=0;j--){const v=cascaded38(R,chain,j,prop);if(v!==undefined&&v!=='inherit')return [v,j];}return [undefined,-1];}
function resolveVar38(R,chain,k,v,depth){depth=depth||0;if(depth>8)return v;return v.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g,(m,name,fb)=>{const [x,j]=inherited38(R,chain,k,name);return x!==undefined?resolveVar38(R,chain,j,x,depth+1):(fb||'');});}
const NAMED38={white:[255,255,255,1],black:[0,0,0,1],transparent:[0,0,0,0]};
function colour38(v){if(!v)return null;v=v.trim().toLowerCase();if(NAMED38[v])return NAMED38[v].slice();let m=/^#([0-9a-f]{3,8})$/.exec(v);
 if(m){let h=m[1];if(h.length===3||h.length===4)h=h.split('').map(c=>c+c).join('');const n=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));n.push(h.length===8?parseInt(h.slice(6,8),16)/255:1);return n;}
 m=/^rgba?\(([^)]*)\)$/.exec(v);if(m){const p=m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);return [p[0],p[1],p[2],p.length>3?p[3]:1];}return null;}
// the element's colour (inherited) and the nearest background colour in the chain at or above it (a background shorthand's colour, or
// background-color; a gradient or image counts as no colour, so the search goes on up)
function colours38(R,chain){const k=chain.length-1;const [cv,cj]=inherited38(R,chain,k,'color');const fg=cv===undefined?[0,0,0,1]:colour38(resolveVar38(R,chain,cj,cv));
 let bg=null,bgAt=-1;for(let j=k;j>=0&&!bg;j--){for(const p of ['background-color','background']){const v=cascaded38(R,chain,j,p);if(v===undefined)continue;const r=resolveVar38(R,chain,j,v);
   const c=colour38(r)||colour38((/(#[0-9a-f]{3,8}|rgba?\([^)]*\))\s*$/i.exec(r)||[])[1]);if(c&&c[3]>=0.999&&!/gradient|url\(/i.test(r)){bg=c;bgAt=j;break;}}}
 return {fg,bg:bg||[255,255,255,1],bgAt};}
function lum38(c){const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]);}
function contrast38(fg,bg){const a=fg[3]===undefined?1:fg[3],mix=[0,1,2].map(i=>fg[i]*a+bg[i]*(1-a)),L1=lum38(mix),L2=lum38(bg);return (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);}

// the checks: each returns a deterministic summary or throws
function checks(h,only,side){const {run}=h,J=c=>JSON.parse(run('JSON.stringify((()=>{const v=('+c+');return v===undefined?null:v;})())'));const out=[];
 const check=(n,fn)=>{if(only&&!only.includes(n))return;const name=NAMES[n];
  try{const info=fn();out.push({n,name,passed:true,info});}catch(e){const m=String(e&&e.message||e).replace(/(?:\/[\w.@~-]+){2,}(?::\d+)*/g,'…').split('\n'),gen=e&&e.generatedMessage&&'actual' in e?' '+JSON.stringify(e.actual)+' vs '+JSON.stringify(e.expected):'';out.push({n,name,passed:false,failure:(m[0]+gen).slice(0,400)+(process.env.DEBUG38?' @@ '+String(e&&e.stack).split('\n').slice(1,4).join(' | '):'')});}
  try{run('hxNoKeys();hxOverlay(false);hxDT=1000/30;NET.on=false;NET.isHost=true;AI.on=false;closePanel();');}catch(e){}};
 const pending=n=>check(n,()=>{throw new Error('pending: engineer B has not added check '+n+' yet');});

 /* ---------- shared steps, all by real keys ---------- */
 const frames=n=>run('hxFrames('+n+')');
 const press=(i)=>{run(`hxPress(${i});hxFrames(1);hxRelease(${i});hxFrames(1);`);};
 const item=()=>J("(()=>{const W=hxF()&&hxF().world;return W&&W.item?{key:W.itemKey,tag:W.item.userData.gist38,x:Math.round(W.item.position.x*1000)/1000,z:Math.round(W.item.position.z*1000)/1000}:null;})()");
 const label=(i)=>J(`hotspotCache[${i||0}]?hotspotCache[${i||0}].label:''`);
 // walk P(i) up to a point: placed 'from' metres out on a free bearing, then walked by keys to 'stop' metres from it
 const approach=(i,x,z,stop,from)=>{from=from||1.2;const b=J(`hxBearing(${x},${z},${Math.min(stop,0.4)},${from})`);assert(b,'a free way to ('+x+', '+z+')');
  run(`hxAt(${i},${x+b[0]*from},${z+b[1]*from},[${-b[0]},${-b[1]}]);hxFrames(1);`);const k=J(`hxWalkTo(${i},${x+b[0]*stop},${z+b[1]*stop},0.08,200)`);assert(k>=0,'walked to ('+x+', '+z+')');frames(2);};
 // the other player out of the way (beyond every glint)
 const away=(i)=>run(`hxAt(${i},-8,-10);`);
 // run frames until the game time passes t (whole frames)
 const until=(t,max)=>{for(let k=0;k<(max||40000)&&J('S.time')<t;k+=10)frames(10);};
 // pick the thing lying out now by P(i)'s keys; returns the toast
 const pickNow=(i)=>{for(let f=0;f<12&&!item();f++)frames(1);const it=item();assert(it,'a lost thing lies out');approach(i,it.x,it.z,0.5);assert(/^Pick up /.test(label(i)),'the pick prompt: '+label(i));run('TOASTS=[];');press(i);return J('TOASTS.slice()');};
 // wait for a neighbour to be standing still and visible
 const settled=(k)=>{for(let f=0;f<1200;f+=10){if(J(`!!(npcs.${k}&&npcs.${k}.g.visible&&!npcs.${k}.route)`))return true;frames(10);}return false;};
 // give the pocket thing back to its owner by P(i)'s keys; returns the panel
 const giveNow=(i,owner)=>{assert(settled(owner),owner+' is there');const p=J(`[npcs.${owner}.g.position.x,npcs.${owner}.g.position.z]`);approach(i,p[0],p[1],1.2,2.0);
  const l=label(i);assert(/^Give /.test(l),'the give prompt beside '+owner+': '+l);run('PH="";');press(i);const ph=J('PH');run('closePanel();');return {label:l,panel:ph};};
 const nextday=()=>{run("dispatch('nextday');closePanel();hxAt(0,-5.2,4.0);hxAt(1,-4.6,4.4);");frames(2);};
 const LOST=J("hxF()?hxF().LOST.map(x=>({id:x.id,owner:x.owner,spots:x.spots,pickToast:x.pickToast,pickToastKnown:x.pickToastKnown||null,giveLabel:x.giveLabel})):[]");
 const hash38=function(){let h=2166136261>>>0;for(let k=0;k<arguments.length;k++){h=Math.imul(h^(arguments[k]|0),16777619)>>>0;}return h;};
 const spotOf=(i,since)=>LOST[i].spots[hash38(since,i)%LOST[i].spots.length];
 const near1=(a,b)=>Math.abs(a[0]-b[0])<=0.001&&Math.abs(a[1]-b[1])<=0.001;
 // the blocked() sample: 3,000 seeded points over the world and a 5 cm grid over the flat at two radii (as a string)
 const blockedSample=()=>J(`(()=>{let s=12345,o='';const rn=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};for(let k=0;k<3000;k++){const x=-31+62*rn(),z=-24+40*rn(),r=0.1+0.4*rn();o+=blocked(x,z,r)?1:0;}
  for(let x=-8.3;x<=-2.3;x+=0.05)for(let z=1.6;z<=7.0;z+=0.05){o+=blocked(x,z,0.1)?1:0;o+=blocked(x,z,PR)?1:0;}let h=2166136261>>>0;for(let k=0;k<o.length;k++){h^=o.charCodeAt(k);h=Math.imul(h,16777619)>>>0;}return h.toString(16)+':'+o.length;})()`);
 // the fixer (M2): the shelf's highest point on screen at 1280 x 800 for P1 standing in front of it at the mattress (z 3.25, x -7.5 and -7.1),
 // P2 across the room: the smallest screen y in pixels of the shelf's top corners (and of a point at 'extra' m, the carvings' top when that
 // plank is not up yet). The camera looks from the south-south-east, so the shelf's west end shows higher on the screen than its east end.
 const TOPBAR38=64;    // the top bar's height at 1280 x 800 (measured in Chromium: #topbar's bottom edge)
 const shelfTopY=extra=>J(`(()=>{hxScreen(1280,800,false);const out=[];for(const x of [-7.5,-7.1]){hxAt(0,x,3.25,[0,-1]);hxAt(1,-4.5,4.5);hxFrames(150);const c=cams[0];c.updateMatrixWorld();
  const b=new THREE.Box3().setFromObject(hxF().world.shelf),v=new THREE.Vector3();for(const px of [b.min.x,(b.min.x+b.max.x)/2,b.max.x])for(const y of [b.max.y,${extra||0}]){v.set(px,y,b.max.z).project(c);out.push((1-v.y)/2*v21Viewport(0).h);}}
  return Math.round(Math.min(...out));})()`);
 const fitsSample=()=>J(`(()=>{let o='';for(const t of Object.keys(ITEMS))for(let y=0;y<=FLAT.rows;y++)for(let x=0;x<FLAT.cols;x++)for(const rot of [0,1])o+=fitsHome34(t,x,y,rot)?1:0;let h=2166136261>>>0;for(let k=0;k<o.length;k++){h^=o.charCodeAt(k);h=Math.imul(h,16777619)>>>0;}return h.toString(16)+':'+o.length;})()`);

 /* ======================================================================================================================================
    Engineer A's checks: 2, 6, 7, 10
    ====================================================================================================================================== */
 // engineer B: the engine's load-time guests and copy (no visit has run yet), and check 1's measures of the inert world, taken first, before any
 // other check has touched the world (the runner compares them with the run without the modules): the football digest's state (a local pair,
 // day 3, 10:00): 3,000 blocked() points, the save, the keys of S and S.life, 600 frames of camera distances and hotspot labels, the Menu and
 // Today; then line35 for the three v35 guests with {evening:true}
 const COPY0=J("typeof EVENING35!=='undefined'?JSON.stringify(EVENING35.copy):''"),GUESTS0=J("typeof EVENING35!=='undefined'?EVENING35.guests.slice():null");
 if(!only||only.includes(1)){try{run('hxFresh(3,10);');const bs=blockedSample(),sj=J('JSON.stringify(S)'),ks=J('[Object.keys(S).join(),Object.keys(S.life||{}).join()]');
   const fr=J(`(()=>{let h=2166136261>>>0;const mix=s=>{s=String(s);for(let k=0;k<s.length;k++){h^=s.charCodeAt(k);h=Math.imul(h,16777619)>>>0;}};for(let f=0;f<600;f++){hxFrames(1);mix(v21Dist.map(v=>v.toFixed(4)).join());mix(cams[0].position.toArray().map(v=>v.toFixed(3)).join()+cams[1].position.toArray().map(v=>v.toFixed(3)).join());mix(hotspotCache.map(x=>x?x.label:'').join('|'));}return h.toString(16);})()`);
   run('PH="";openMenu();');const menu=J('PH');run('closePanel();');const today=J('todayHTML34()');const all=JSON.stringify([bs,sj,ks,fr,menu,today]);let h=2166136261>>>0;for(let k=0;k<all.length;k++){h^=all.charCodeAt(k);h=Math.imul(h,16777619)>>>0;}
   side.inert1={digest:h.toString(16)+':'+all.length,save:J('!!(S.life&&S.life.gist38)'),card:today.includes('gist38-card')};
   run('hxFresh(3,10);');side.lines1=J("['tunde','nkechi','ada'].map(k=>{const l=line35(k,Object.assign(lineCtx35(k),{evening:true}));return l?l.id:null;})");}
  catch(e){side.inert1={error:String(e&&e.message||e).slice(0,120)};}}
 // check 10's scene count runs first, in a world no other check has touched, with no module accessor (the runner compares it with the run
 // without the modules): a day-3 household past midday (the glasses out), then a new day-2 household (homeuse check 6's counter)
 if(!only||only.includes(10)){try{run('hxFresh(3,12.5);hxFrames(20);hxFresh(2,19);hxFrames(4);');side.count10=J('hxCount()');}catch(e){side.count10='error '+String(e&&e.message||e).slice(0,80);}}

 // check 11's reels before discovery (engineer C): a day-4 household with no record casts twelve times from 13:00 (the asked fish's window);
 // the runner compares the species and sizes with the run without the modules
 if(!only||only.includes(11)){try{run('hxFresh(4,13);');run('hxAt(1,-8,-10);');const seq=[];for(let k=0;k<12;k++){run('hxAt(0,12.3,13.6);hxFrames(2);');run("dispatch('lifeFish');dispatch('lifeCast');");
   for(let f=0;f<400&&J("!!(LIFE34.fish&&LIFE34.fish.phase==='waiting')");f+=10)run('hxFrames(10)');run("dispatch('lifeReel');");seq.push(J('S.life.catch?S.life.catch.id+":"+S.life.catch.size:null'));run("dispatch('lifeCatch',{v:'sell'});closePanel();");}
   side.reel11={seq,save:J('!!(S.life&&S.life.gist38)')};
   // and back to a world with nothing of v38's in it (the glasses lie out on day 4 at 13:00; check 2's spot probe reads the scene next)
   run('hxFresh(2,9);hxFrames(4);');}catch(e){side.reel11={error:String(e&&e.message||e).slice(0,120)};}}

 check(2,()=>{const R={};
  const P=probe(J);assert.deepEqual(P.bad,[],'spot rules: '+JSON.stringify(P.bad));R.spots={lost:P.lost,wash:P.wash,shelf:P.shelf};
  // nothing at 11:59; the glasses at 12:00 at (0.6, 13.4) within 1 mm, tagged, with no save
  run('hxFresh(3,11+58/60);hxAt(0,0.6,12.2,[0,1]);');away(1);frames(2);until(11+59/60);
  assert.equal(item(),null,'nothing at 11:59');assert.deepEqual(J('hxTagged()'),[],'no v38 object at 11:59');assert(!/^Pick up/.test(label(0)),'no prompt at 11:59: '+label(0));
  let f12=-1;for(let f=0;f<120;f++){frames(1);const t=J('S.time');if(t>=12&&f12<0)f12=f;if(item())break;}
  const g=item();assert(g&&g.tag==='lost:glasses'&&near1([g.x,g.z],[0.6,13.4]),'the glasses at (0.6, 13.4): '+JSON.stringify(g));
  assert(J('S.time')>=12&&J('S.time')<12+0.5/60,'out by 12:00 (within 30 s of game time): '+J('S.time'));
  assert.deepEqual(J('hxTagged().sort()'),['glint','lost:glasses'],'the thing and its glint');assert.equal(J('!!hxG()'),false,'no save before discovery');R.glasses={at:[g.x,g.z],time:'12:00'};
  // the glint: invisible beyond 8 m, visible within (both players counted; the other one far away)
  run('hxAt(0,8.9,13.4);');frames(2);const gOff=J('[hxF().world.glint.visible,hxF().world.glint.material.opacity]');
  run('hxAt(0,7.9,13.4);');frames(2);const gOn=J('[hxF().world.glint.visible,hxF().world.glint.material.opacity]');
  assert(gOff[0]===false&&gOn[0]===true&&gOn[1]>0.05,'the glint at 8.3 m and 7.3 m: '+JSON.stringify([gOff,gOn]));R.glint={'8.3m':'hidden','7.3m':'shown'};
  // the fixer (S4): the star at the edge of P1's view, from 6 m on each of eight bearings: shown exactly when the glint is outside the view's
  // inset rectangle, on its edge; hidden beyond the glint's reach (9 m) and for P2, who is far away
  {const edge=()=>J("(()=>{const e=EDGE38.el[0],r=foundEdgeRect38(0),c=cams[0];c.updateMatrixWorld();const v=hxF().world.glint.position.clone().project(c),px=r.x+(v.x+1)/2*r.w,py=r.y+(1-v.y)/2*r.h;"+
    "return {shown:!!(e&&e.style.display==='block'),x:e?parseInt(e.style.left):null,y:e?parseInt(e.style.top):null,inside:v.z<=1&&px>=r.l&&px<=r.r&&py>=r.t&&py<=r.b,r:[r.l,r.r,r.t,r.b]};})()");
   const seen=[];for(let a=0;a<8;a++){const ux=Math.sin(a*Math.PI/4),uz=Math.cos(a*Math.PI/4);run(`hxAt(0,${0.6+ux*6},${13.4+uz*6});`);frames(3);const e=edge();
    assert.equal(e.shown,!e.inside,'bearing '+a+': the star shown exactly when the glint is outside the view: '+JSON.stringify(e));
    if(e.shown)assert(e.x===e.r[0]||e.x===e.r[1]||e.y===e.r[2]||e.y===e.r[3],'bearing '+a+': the star on the view\'s edge: '+JSON.stringify(e));seen.push(e.shown?1:0);}
   assert(seen.some(x=>x),'the star on some bearing at 6 m: '+seen.join(''));
   run('hxAt(0,9.7,13.4);');frames(3);assert.equal(edge().shown,false,'no star beyond the reach');assert.equal(J("!!(EDGE38.el[1]&&EDGE38.el[1].style.display==='block')"),false,'none for P2, far away');
   R.edge={bearings6m:seen.join(''),beyond:'hidden'};}
  // the prompt: within 1.3 m and not at 1.4 m
  run('hxAt(0,0.6,12.2,[0,1]);');frames(2);const l12=label(0);run('hxAt(0,0.6,12.0,[0,1]);');frames(2);const l14=label(0);
  assert.equal(l12,'Pick up reading glasses','the prompt at 1.2 m');assert.notEqual(l14,'Pick up reading glasses','no prompt at 1.4 m');R.prompt={'1.2m':l12,'1.4m':l14||null};
  // Act by P1's E: the toast, the save (via find, found 3), the pocket, the log, the mesh gone, no game time
  run('hxAt(0,0.6,12.0,[0,1]);');frames(1);assert(J('hxWalkTo(0,0.6,12.6,0.06,100)')>=0,'walked up');frames(1);
  const t0=J('S.time');run('TOASTS=[];');run('hxPress(0);hxFrames(1);');const t1=J('S.time');run('hxRelease(0);hxFrames(1);');
  assert.deepEqual(J('TOASTS'),[LOST[0].pickToast],'the pick-up toast');assert(t1-t0<0.001,'no game time: '+(t1-t0));
  const G=J('hxG()');assert(G&&G.via==='find'&&G.found===3&&G.lost.i===0&&G.lost.status==='pocket','the save: '+JSON.stringify(G&&{via:G.via,found:G.found,lost:G.lost}));
  assert(J("LOG35.has(S.day,'find','glasses')"),'the find log');assert.equal(item(),null,'the mesh gone');assert.deepEqual(J('hxTagged()'),[],'no v38 object left');
  R.pick={toast:true,save:{via:G.via,found:G.found},log:'find glasses'};
  // give back by keys at 14:00 beside Mama Nkechi: the give prompt beats "Talk to Mama Nkechi" at 1.2 m; the panel; the fan; friendship +1; the chain
  run('S.time=14;');frames(2);const aff0=J('S.nb.nkechi.aff||0');
  assert(settled('nkechi'),'Mama Nkechi at her shop');const np=J('[npcs.nkechi.g.position.x,npcs.nkechi.g.position.z]');approach(0,np[0],np[1],1.2,2.0);
  const gl=label(0);const dN=J(`Math.hypot(players[0].g.position.x-${np[0]},players[0].g.position.z-${np[1]})`);assert.equal(gl,LOST[0].giveLabel,'the give prompt at '+dN.toFixed(2)+' m');
  const talkThere=J(`(()=>{const l=[];const d=(x,z)=>Math.hypot(players[0].g.position.x-x,players[0].g.position.z-z);for(const k in npcs){const n=npcs[k];if(!n.g.visible)continue;const dd=d(n.g.position.x,n.g.position.z);if(dd<1.8)l.push({id:'talk:'+k,label:'Talk to '+CAST[k].name,dist:dd-0.4});}return l;})()`);
  assert(talkThere.some(t=>t.label==='Talk to Mama Nkechi'),'"Talk to Mama Nkechi" is on offer there too');
  run('PH="";');press(0);const ph=J('PH');
  assert(ph.includes('Mama Nkechi')&&ph.includes(J("esc(hxF().SPEECH.ty.glasses[0])"))&&ph.includes(J("esc(hxF().UI.keepsake.fan)")),'the return panel: '+ph.slice(0,200));
  assert(ph.includes('data-act="gist38Close"'),'the panel closes by its button');
  // the fixer (S3): this Act came from the keyboard, so a click on the panel goes through at once
  const CLICK38="({target:{closest:s=>s==='.gist38-panel'?{}:null},preventDefault(){},stopPropagation(){},stopImmediatePropagation(){}})";
  const swKey=J(`foundPanelClick38(${CLICK38})`);
  const it1=item(),c1=spotOf(1,3);assert(it1&&it1.tag==='lost:chisel'&&near1([it1.x,it1.z],c1),'the chisel at its spot the same frame: '+JSON.stringify([it1,c1]));
  assert.equal(J('S.nb.nkechi.aff')-aff0,1,'friendship +1');assert(J("LOG35.has(S.day,'return','nkechi:glasses')&&LOG35.has(S.day,'keep','keepsake:fan')"),'the return and keep logs');
  assert.deepEqual(J('hxG().keep.keepsake'),['fan'],'the fan kept');run("dispatch('gist38Close');");frames(1);assert.equal(J('overlayOpen()'),false,'closed');
  assert.equal(swKey,false,'no click guard after a keyboard Act');
  R.give={label:gl,at:+dN.toFixed(2),beats:'Talk to Mama Nkechi',keepsake:'fan',chisel:{at:c1,when:'the same frame'}};
  // the chisel back to Ada at the Yard the same afternoon, then day 4: the adapter at spots[hash38(4,2) % 5] from 12:00, not before
  run('S.time=14.5;');frames(2);const tc=pickNow(0);assert.deepEqual(tc,[LOST[1].pickToastKnown],'the chisel toast names Ada (her thank-you said whose it is)');
  assert.equal(J('hxG().lost.ownerTold'),3,'the chisel\'s owner told by the thanks');
  // the fixer (S3): an Act with a pointer down (a touch Act): a click on the panel is swallowed while the pointer is held and on its release,
  // then goes through; outside the panel never
  run('foundPointer38(true);');const gv=giveNow(0,'ada');assert(gv.panel.includes(J("esc(hxF().UI.keepsake.bird)")),'the bird');
  assert(gv.panel.includes(J("esc(hxF().SPEECH.ty.chisel[1])")),'Ada passes on Tunde\'s word about the adapter');
  frames(20);const held=J(`foundPanelClick38(${CLICK38})`),out=J("foundPanelClick38({target:{closest:()=>null}})");run('foundPointer38(false);');const up=J(`foundPanelClick38(${CLICK38})`);frames(3);const after=J(`foundPanelClick38(${CLICK38})`);
  assert.deepEqual([held,out,up,after],[true,false,true,false],'the click guard with the pointer held: while held, not outside the panel, on its release, then not');
  assert.deepEqual(J('[hxG().lost.i,hxG().lost.heard,hxG().lost.heardMode,hxG().lost.heardBy]'),[2,3,'thanks','ada'],'the adapter heard from Ada');
  nextday();run('S.time=11+59/60;');frames(2);until(11+59.5/60);assert.equal(item(),null,'no adapter before 12:00');for(let f=0;f<60&&!item();f++)frames(1);
  const ad=item(),as=spotOf(2,4);assert(ad&&ad.tag==='lost:adapter'&&near1([ad.x,ad.z],as),'the adapter at its spot: '+JSON.stringify([ad,as]));R.day4={adapter:as};
  {run("openLife34('today');");const h=J('PH');run('closePanel();');const row=(h.match(/data-row="lost">([^<]*)</)||[])[1]||'';
   assert.equal(row,J("esc('Ada said yesterday: '+GIST38.UI.heardLost.adapter)"),'Today on day 4: what Ada said: '+row);R.day4.today=row;}
  // a second household: given back at 15:45, no chisel until 12:00 the next day; then the day-old chisel's glint reaches 9 m
  run('hxFresh(3,13);');away(1);frames(4);pickNow(0);run('S.time=15.75;');frames(2);giveNow(0,'nkechi');
  assert.equal(item(),null,'no chisel after a 15:45 return');assert.deepEqual(J('[hxG().lost.i,hxG().lost.since,hxG().lost.at]'),[1,4,12],'the chisel tomorrow at midday');
  run('S.time=20;');frames(4);assert.equal(item(),null,'none that evening');nextday();run('S.time=11.9;');frames(4);assert.equal(item(),null,'none at 11:54 the next day');
  until(12.01);for(let f=0;f<20&&!item();f++)frames(1);const ch=item(),cs=spotOf(1,4);assert(ch&&near1([ch.x,ch.z],cs),'the chisel at 12:00 on day 4: '+JSON.stringify([ch,cs]));
  nextday();run('S.time=9;');frames(4);const c5=item();assert(c5&&c5.key==='1:4','the chisel still out on day 5');
  run(`hxAt(0,${cs[0]+8.8},${cs[1]});`);frames(3);const s88=J('hxF().world.glint.visible');run(`hxAt(0,${cs[0]+9.3},${cs[1]});`);frames(3);const s93=J('hxF().world.glint.visible');
  assert(s88===true&&s93===false,'a day-old thing glints at 9 m: '+JSON.stringify([s88,s93]));R.late={chisel:'day 4 12:00',glint:'9 m on day 5'};
  // the companion household: the same by P1's keys
  run('hxCompanion(3,11.95);');frames(2);until(12.01);for(let f=0;f<20&&!item();f++)frames(1);assert(item(),'the glasses in a companion household');
  const tcomp=pickNow(0);assert.deepEqual(tcomp,[LOST[0].pickToast],'the companion household picks them up');run('S.time=13;');frames(2);
  const gc=giveNow(0,'nkechi');assert(gc.panel.includes(J("esc(hxF().UI.keepsake.fan)")),'and gives them back');R.companion={pick:true,give:true};
  return R;});

 check(6,()=>{const R={};const F=J('hxF()?{COMMON:hxF().COMMON,SHELLS:hxF().SHELLS,WASH:hxF().WASH_SPOTS}:null');assert(F,'the module');
  const shellAt=k=>J(`SHELLS34[${k}]`);
  // a morning shell by keys: returns [toast, base count before, after]
  const pickShell=(k)=>{const s=shellAt(k);approach(0,s[0],s[1],0.5);const l=label(0);assert.equal(l,'Pick up a shore shell','the shell prompt');const n0=J('S.life.shells');run('TOASTS=[];');press(0);return [J('TOASTS.slice()'),n0,J('S.life.shells')];};
  run('hxFresh(3,9);');away(1);frames(2);
  const b=pickShell(0);assert.deepEqual(b[0],['A smooth shell. Ada makes things with these.'],'before discovery the base toast');assert.equal(b[2],b[1]+1,'counted');assert.equal(J('!!hxG()'),false,'nothing saved');
  // discovery (the glasses at noon), then the other two shells of the day with their kinds
  run('S.time=12.05;');frames(10);pickNow(0);assert(J('!!hxG()'),'discovered');const Fd=J('hxG().found');
  const kinds={},seen=new Set(),log=[];
  const kindOf=(d,k)=>F.COMMON[hash38(d,k,3)%F.COMMON.length],toastOf=id=>F.SHELLS.find(s=>s.id===id).toast;
  const morning=(d,ks)=>{for(const k of ks){const kind=kindOf(d,k),fresh=!seen.has(kind);const r=pickShell(k);
   assert.deepEqual(r[0],[toastOf(kind)+(fresh?' One for the shelf.':'')],'day '+d+' shell '+k+': '+JSON.stringify(r[0]));assert.equal(r[2],r[1]+1,'the base count, one a shell');
   seen.add(kind);(kinds[d]=kinds[d]||[]).push(kind);assert(kind!=='cowrie','no cowrie from a morning spot');}};
  morning(3,[1,2]);
  const keepShells=()=>J('hxG().keep.shells.slice()');assert.deepEqual(keepShells(),[...seen],'the kept kinds');
  // day 4: no wash; day 5 (F+2) the wash
  nextday();run('S.time=9;');frames(2);morning(4,[0,1,2]);run('S.time=14;');frames(10);assert.deepEqual(J("hxTagged().filter(t=>/^wash/.test(t))"),[],'no wash on day 4');
  nextday();run('S.time=9;');frames(2);morning(5,[0,1,2]);
  run('S.time=13+29/60;hxAt(0,1.4,14.2);');frames(10);assert.deepEqual(J("hxTagged().filter(t=>/^wash/.test(t))"),[],'nothing at 13:29');until(13.5);for(let f=0;f<12;f++)frames(1);
  const W=J("hxF().world.wash.map(s=>({n:s.n,kind:s.kind,x:s.x,z:s.z,shell:[Math.round(s.shell.position.x*1000)/1000,Math.round(s.shell.position.z*1000)/1000]}))");
  assert.equal(W.length,3,'three shells at 13:30');for(const s of W)assert(near1(s.shell,F.WASH[s.n]),'at the probed spot '+JSON.stringify(s));
  const cw=hash38(5,5)%3;assert.equal(W.find(s=>s.n===cw).kind,'cowrie','the cowrie at hash38(5,5) % 3 = '+cw);assert(W.filter(s=>s.kind==='cowrie').length===1,'one cowrie');
  // the cowrie by keys
  const cs=F.WASH[cw];approach(0,cs[0],cs[1],0.5);assert.equal(label(0),'Pick up a shell from the wet sand','the wash prompt');const n0=J('S.life.shells');run('TOASTS=[];');press(0);
  assert.deepEqual(J('TOASTS'),['A cowrie, smooth as a tooth. One for the shelf.'],'the cowrie toast');assert.equal(J('S.life.shells'),n0+1,'counted as a shell');assert(keepShells().includes('cowrie'),'kept');
  assert(J("LOG35.has(S.day,'keep','shell:cowrie')"),'logged');R.wash5={cowrie:cw,kinds:W.map(s=>s.kind)};
  // 15:30: the shells go at once, the wet sand fades over 2 s
  until(15.5);for(let f=0;f<10;f++)frames(1);const at15=J("[hxF().world.wash.length,hxTagged().filter(t=>/^wash/.test(t)).length]");
  assert(at15[0]===0&&at15[1]===2,'at 15:30 the shells gone, two wet patches left: '+JSON.stringify(at15));frames(66);
  assert.deepEqual(J("hxTagged().filter(t=>/^wash/.test(t))"),[],'faded in 2 s');
  // days 6 and 7 no wash; days 8 and 11 (F+5, F+8) a wash with no cowrie (one is kept); morning shells through day 11 (F+8), never a cowrie
  for(let d=6;d<=11;d++){nextday();run('S.time=9;');frames(2);morning(d,[0,1,2]);run('S.time=14;');frames(10);const ws=J("hxF().world.wash.map(s=>s.kind)");
   if((d-Fd-2)%3===0){assert.equal(ws.length,3,'a wash on day '+d);assert(!ws.includes('cowrie'),'no second cowrie');}else assert.equal(ws.length,0,'no wash on day '+d);}
  R.found=Fd;R.morningKinds=kinds;R.kept=keepShells();return R;});

 check(7,()=>{const R={};assert(J('!!hxF()'),'the module');
  // a household that found and gave back the glasses (the fan) on day 3
  run('hxFresh(3,12.2);');away(1);frames(4);pickNow(0);giveNow(0,'nkechi');
  // the Today card's offer (engineer B's card) when the gist module is loaded
  run("openLife34('today');");const today0=J('PH');run('closePanel();');R.offer=J("typeof GIST38!=='undefined'")?(today0.includes('data-act="gist38Shelf"')?'on Today':'MISSING'):'pending (engineer B\'s card)';
  assert(R.offer!=='MISSING','the shelf offer on Today');
  // ₦4,999 refused; ₦5,000 ordered
  run("S.money=4999;TOASTS=[];dispatch('gist38Shelf');");assert.deepEqual(J('[TOASTS,hxG().shelf.state,S.money]'),[['Not enough in the purse'],'none',4999],'refused at ₦4,999');
  const blk0=blockedSample(),fit0=fitsSample(),obs0=J('JSON.stringify([OBS.length,FURN_OBS,PUSH.length])');
  run("S.money=5000;TOASTS=[];dispatch('gist38Shelf');");assert.deepEqual(J('[TOASTS,hxG().shelf.state,S.money]'),[['Ada says the wood is ready. The shelf goes up tomorrow morning.'],'ordered',0],'ordered at ₦5,000');
  assert(J("LOG35.has(S.day,'buy','shelf38')"),'the buy log');assert.equal(J('!!hxF().world.shelf'),false,'not up the same day');
  nextday();const sh=J("(()=>{const s=hxF().world.shelf;if(!s)return null;const planks=[];s.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.parameters&&Math.abs(o.geometry.parameters.width-hxF().SHELF.w)<1e-9)planks.push(Math.round(o.position.y*1000)/1000);});return {x:Math.round(s.position.x*1000)/1000,z:Math.round(s.position.z*1000)/1000,yaw:s.rotation.y,planks,items:s.userData.items,tag:s.userData.gist38};})()");
  assert(sh&&sh.tag==='shelf'&&near1([sh.x,sh.z],[-7.1,2.09])&&sh.yaw===0,'up over the mattress at columns 0-1: '+JSON.stringify(sh));assert.deepEqual(sh.planks,[1.91,2.07],'planks at 1.91 and 2.07 m');
  assert.equal(J('hxG().shelf.state'),'up','up');assert(J("LOG35.has(S.day,'keep','shelf')"),'logged on the morning');R.up={at:[sh.x,sh.z],planks:sh.planks,items:sh.items};
  // blocked() and fitsHome34 the same with the shelf up
  assert.equal(J('JSON.stringify([OBS.length,FURN_OBS,PUSH.length])'),obs0,'no collider added (OBS, FURN_OBS, PUSH)');assert.equal(blockedSample(),blk0,'blocked() unchanged with the shelf up');assert.equal(fitsSample(),fit0,'fitsHome34 unchanged');
  // wall pieces hung under it (they reach 1.87 m) stay clear of it
  const span=()=>J("(()=>{const s=hxF().world.shelf;return s?[Math.round(s.position.x*1000)/1000,Math.round(s.position.z*1000)/1000,Math.round(s.rotation.y*1000)/1000]:null;})()");
  run("S.home.items.push({id:'i9101',type:'art',x:0,y:0,rot:0},{id:'i9102',type:'photo',x:1,y:0,rot:0});rebuildFurniture();");frames(2);assert.deepEqual(span(),[-7.1,2.09,0],'a wall piece under it: the shelf stays');
  const clear=J("(()=>{const bb=new THREE.Box3();let top=-1;furnGroup.updateMatrixWorld(true);S.home.items.forEach((it,i)=>{if(!ITEMS[it.type].wall)return;bb.setFromObject(furnGroup.children[i]);top=Math.max(top,bb.max.y);});const s=new THREE.Box3().setFromObject(hxF().world.shelf);return [Math.round(top*1000)/1000,Math.round(s.min.y*1000)/1000];})()");
  assert(clear[0]>1&&clear[1]>clear[0]+0.01,'the shelf clears the hung pieces: '+JSON.stringify(clear));assert.equal(blockedSample(),blk0,'blocked() unchanged with them');
  run("S.home.items=S.home.items.filter(i=>!['i9101','i9102'].includes(i.id));rebuildFurniture();");frames(2);assert.deepEqual(span(),[-7.1,2.09,0],'still there');R.hung={pieceTop:clear[0],shelfBottom:clear[1]};
  // no rebuild over 300 idle frames
  const id0=J('hxF().world.shelf.uuid'),b0=J('hxF().cost.builds');frames(300);assert.deepEqual([J('hxF().world.shelf.uuid'),J('hxF().cost.builds')],[id0,b0],'no rebuild over 300 frames');
  // the panel
  run("dispatch('gist38ShelfView');");let ph=J('PH');run('closePanel();');assert(ph.includes('Keepsakes · 1 of 5')&&ph.includes('a hand fan from Mama Nkechi')&&ph.includes('Shells · 0 of 5'),'the panel: '+ph.slice(0,300));
  // the keepsake set: the chisel (out since day 3), the adapter, the lens cap and the wrapper, each found and given back by keys; the morning
  // shells picked each day on the way
  const shellsToday=()=>{for(const k of [0,1,2]){const s=J(`SHELLS34[${k}]`);if(J(`life34().shellDays[${k}]===S.day`))continue;approach(0,s[0],s[1],0.5);press(0);}};
  const giveAt={ada:14,tunde:13,bassey:14,oyelaran:18.3};
  for(const owner of ['ada','tunde','bassey','oyelaran']){for(let k=0;k<3&&J('hxG().lost.since>S.day');k++)nextday();
   if(J('S.time')<9){run('S.time=9;');frames(2);}shellsToday();
   if(!item()){run(`S.time=${Math.max(12.05,J('S.time'))};`);frames(10);for(let f=0;f<30&&!item();f++)frames(1);}
   assert.equal(J('hxF().LOST[hxG().lost.i].owner'),owner,'the next lost thing is '+owner+'\'s');pickNow(0);
   if(J('S.time')<giveAt[owner]){run(`S.time=${giveAt[owner]};`);frames(30);}const gv=giveNow(0,owner);assert(/^Give /.test(gv.label),'given to '+owner);nextday();}
  const G1=J('hxG()');assert.deepEqual(G1.keep.keepsake,['fan','bird','plate','print','record'],'five keepsakes');assert(G1.sets.keepsake>0,'the keepsake set complete');
  assert(J("S.memories.some(m=>m.caption===hxF().UI.memory.keepsake)"),'its memory');assert(J(`LOG35.has(${G1.sets.keepsake},'set','keepsake')`),'its log');
  run("dispatch('gist38ShelfView');");ph=J('PH');run('closePanel();');assert(/Keepsakes · 5 of 5 · <span class="gist38-done">Complete/.test(ph),'Complete on the panel');
  if(J("typeof GIST38!=='undefined'")){run("openLife34('today');");const t=J('PH');run('closePanel();');R.todayComplete=t.includes('Complete');}
  // the shells set: morning kinds until the four are kept, and the cowrie at the next wash (F+2, F+5, ...)
  for(let d=0;d<12&&J('hxG().keep.shells.length')<5;d++){if(d)nextday();run('S.time=9;');frames(2);shellsToday();
   if(J('hxF()&&(()=>{const G=hxG();return S.day>=G.found+2&&(S.day-G.found-2)%3===0;})()')){run('S.time=13.6;');frames(10);const ws=J("hxF().world.wash.map(s=>[s.n,s.kind])");const c=ws.find(w=>w[1]==='cowrie');
    if(c){const sp=J(`hxF().WASH_SPOTS[${c[0]}]`);approach(0,sp[0],sp[1],0.5);press(0);}}}
  const G2=J('hxG()');assert.equal(G2.keep.shells.length,5,'five kinds: '+JSON.stringify(G2.keep.shells));assert(G2.sets.shells>0,'the shells set complete');
  assert(J("S.memories.some(m=>m.caption===hxF().UI.memory.shells)"),'its memory');assert(J(`LOG35.has(${G2.sets.shells},'set','shells')`),'its log');
  const sh2=J("hxF().world.shelf.userData.items");assert(sh2===10,'ten things on the shelf: '+sh2);R.sets={keepsake:G1.sets.keepsake,shells:G2.sets.shells,items:sh2};
  // the fixer (M2): the full shelf, and where the carvings will stand, below the top bar at 1280 x 800 for a player at the mattress
  {const y=shelfTopY(J('hxF().SHELF.tiers[2]+0.015+0.093*hxF().SHELF.CARVE_SCALE'));assert(y>=TOPBAR38+2,'the shelf below the top bar: its top at '+y+' px');R.view={topPx:y,bar:TOPBAR38};}
  // Ada's carvings and the third plank: check 11
  return R;});

 check(10,()=>{const R={};assert(J('!!hxF()'),'the module');
  // a v37-style save past its v35 evening (day 5, 13:00: the glasses lie out) loads, runs 60 frames and saves with the keys unchanged
  run('hxFresh(5,13);life34().evening35={doneDay:3};save();');const raw0=J("localStorage.getItem(KEY)");const k0=J('[Object.keys(JSON.parse(localStorage.getItem(KEY))).join(),Object.keys(JSON.parse(localStorage.getItem(KEY)).life).join()]');
  run('S=load();enterWorld();closePanel();');frames(60);run('save();');const k1=J('[Object.keys(JSON.parse(localStorage.getItem(KEY))).join(),Object.keys(JSON.parse(localStorage.getItem(KEY)).life).join()]');
  assert.deepEqual(k1,k0,'the keys of S and S.life');assert(!J('!!JSON.parse(localStorage.getItem(KEY)).life.gist38'),'no v38 record');assert(item(),'the glasses out at 13:00 on an old save');R.oldSave={keys:'unchanged',glasses:'out'};
  // a reload with the glasses in the pocket keeps them; the give prompt still works
  away(1);pickNow(0);run('save();S=load();enterWorld();closePanel();');frames(4);assert.equal(J('hxG()&&hxG().lost.status'),'pocket','the pocket after a reload');
  assert(settled('nkechi'),'Mama Nkechi');const np=J('[npcs.nkechi.g.position.x,npcs.nkechi.g.position.z]');approach(0,np[0],np[1],1.2,2.0);assert.equal(label(0),LOST[0].giveLabel,'the give prompt after the reload');
  assert.equal(J('!!(stripState().life&&stripState().life.gist38)'),false,'stripState drops life.gist38');assert(J('!!S.life.gist38'),'kept on the device');
  // online: no v38 object; offline: back (the chisel after giving back, and the shelf)
  press(0);run("closePanel();S.money=9000;dispatch('gist38Shelf');");nextday();run('S.time=12.5;');frames(10);
  const before=J('hxTagged().sort()');assert(before.includes('shelf')&&before.some(t=>/^lost:/.test(t)),'the shelf and a lost thing: '+JSON.stringify(before));
  run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");frames(12);assert.deepEqual(J('hxTagged()'),[],'online: no v38 object');const onl=label(0);
  run('NET.on=false;');frames(12);assert.deepEqual(J('hxTagged().sort()'),before,'offline: back');R.online={off:'nothing',back:before};
  // teardown: newconfirm, newgame, an enterWorld into day 2, going online
  run('ACTIONS.newconfirm();');assert.deepEqual(J('hxTagged()'),[],'after newconfirm');run('closePanel();');frames(12);assert(J('hxTagged().length')>0,'"No, keep it": back');
  run("dispatch('newgame');");assert.deepEqual(J('hxTagged()'),[],'after newgame');
  run('hxFresh(3,12.5);');frames(10);assert(item(),'a lost thing');run('S.day=2;enterWorld();closePanel();');assert.deepEqual(J('hxTagged()'),[],'after an enterWorld into day 2');frames(12);assert.deepEqual(J('hxTagged()'),[],'and it stays down');
  run('S.day=3;');frames(12);assert(item(),'back on day 3');run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");frames(12);assert.deepEqual(J('hxTagged()'),[],'after going online');run('NET.on=false;');R.teardown=['newconfirm','newgame','enterWorld day 2','online'];
  // flags: ?gist=now brings the first lost thing before midday, applied once a page load
  run("hxFresh(3,9);location.search='?gist=now';enterWorld();closePanel();");
  const fl=J('[hxF().flags.now,sessionStorage.getItem("gist38.flag.now")]');frames(10);const early=item();
  run("location.search='?gist=playtest';enterWorld();closePanel();");const fl2=J('[hxF().flags.playtest,hxF().flags.value]');
  run("hxF().flags.now=false;hxF().flags.playtest=false;hxF().flags.value=null;hxF().flags.parsed=false;location.search='';");
  assert(fl[0]===true&&fl[1]==='1'&&early&&early.tag==='lost:glasses','?gist=now: '+JSON.stringify([fl,early]));assert.deepEqual(fl2,[false,'now'],'applied once a page load');R.flags={now:'09:00 glasses',once:true};
  // the subset copies (verify-lines, verify-log, verify-tune) with both v38 tags: they load and play a little with no error and no new global but v38's
  R.subsets={};for(const [name,last] of [['lines','lines-v35.js'],['log','days-v35.js'],['tune','tune-v35.js']]){const dW=subsetDir38(last,false),dO=subsetDir38(last,true);
   try{const g=JSON.parse(cp.execFileSync(process.execPath,[__filename,'--globals'],{env:{...process.env,COMPOUND_GAME_DIR:dW},encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop());
    const o=JSON.parse(cp.execFileSync(process.execPath,[__filename,'--globals'],{env:{...process.env,COMPOUND_GAME_DIR:dO},encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop());
    assert(!g.error,name+' subset with v38: '+g.error);assert(!o.error,name+' subset without v38: '+o.error);
    const extra=g.names.filter(n=>!o.names.includes(n)),lost=o.names.filter(n=>!g.names.includes(n));
    assert.deepEqual(extra.filter(n=>!/38/.test(n)),[],name+': new globals not v38\'s');assert.deepEqual(lost,[],name+': globals gone');assert.equal(g.warn,0,name+': v38 warnings while playing');
    R.subsets[name]={loads:true,v38Names:extra.length,played:g.played};}finally{fs.rmSync(dW,{recursive:true,force:true});fs.rmSync(dO,{recursive:true,force:true});}}
  // quiet construction: no Math.random call inside the step or the shelf build across a lost-thing spawn, a wash spawn and a shelf build
  run('hxFresh(3,11.98);');away(1);frames(2);run('hxQC.n=0;');until(12.02);for(let f=0;f<12;f++)frames(1);assert(item(),'spawned');const q1=J('hxQC.n');
  pickNow(0);giveNow(0,'nkechi');run("S.money=9000;dispatch('gist38Shelf');hxQC.n=0;");nextday();
  run('S.time=9;');frames(4);const q3=J('hxQC.n');assert(J('!!hxF().world.shelf'),'the shelf built');
  for(let d=0;d<6&&!J('(()=>{const G=hxG();return S.day>=G.found+2&&(S.day-G.found-2)%3===0;})()');d++)nextday();run('S.time=13.48;hxQC.n=0;');frames(2);until(13.51);for(let f=0;f<12;f++)frames(1);assert.equal(J('hxF().world.wash.length'),3,'the wash spawned on day '+J('S.day'));const q2=J('hxQC.n');
  assert.deepEqual([q1,q2,q3],[0,0,0],'Math.random calls in a spawn [lost thing, wash, shelf]');R.quiet={lost:0,wash:0,shelf:0};
  // the cost: an inert frame, an item frame, a spawn; v38 objects outside the flat
  const outside=()=>J("scene.children.filter(o=>o.userData&&o.userData.gist38&&o.userData.gist38!=='shelf').length");
  assert(outside()<=8,'on a wash afternoon at most 8 v38 objects outside the flat: '+outside());
  run('hxFresh(3,10);');away(1);run('hxAt(0,0.6,12.0);');frames(2);const b0=J('hxF().cost.builds');run('hxCost.b=0;hxCost.l=0;');frames(600);
  const inert=J('[hxCost.b,hxCost.l,hxTagged().length,hxF().cost.builds-'+b0+']');assert.deepEqual(inert,[0,0,0,0],'an inert frame: [blocked, levelAt, objects, builds] over 600 frames');
  run('S.time=11.98;hxCost.b=0;hxCost.l=0;');until(12.02);for(let f=0;f<12;f++)frames(1);assert(item(),'spawned');const spawn=J('[hxCost.b,hxCost.l]');
  run('hxCost.b=0;hxCost.l=0;');frames(300);const itemF=J('[hxCost.b,hxCost.l]');assert.deepEqual([spawn,itemF],[[0,0],[0,0]],'a spawn and 300 item frames: [blocked, levelAt]');
  assert(outside()<=2,'at most 2 v38 objects outside the flat: '+outside());
  // the module never reads the wall clock and never draws from Math.random itself
  {const src=fs.readFileSync(path.join(GAME,'src','found-v38.js'),'utf8');assert(!/performance\.now|Date\.now|new Date|Math\.random\(\)/.test(src),'a wall-clock or Math.random call in found-v38.js');}
  const steps=J('hxF().cost.steps');assert(steps>0,'the step ran');R.cost={inert:'0 blocked, 0 levelAt, 0 objects over 600 frames',spawn:spawn,item:itemF,outside:outside(),stepRan:true};
  return R;});

 /* ======================================================================================================================================
    Engineer B's checks: 1, 3, 4, 5, 8, 9 (their shared steps first)
    ====================================================================================================================================== */
 const has38=()=>J("typeof GIST38!=='undefined'&&!!GIST38");
 const EV=()=>J("typeof EVENING35!=='undefined'?EVENING35.state:'none'");
 const btnLabel=()=>J("typeof EVENING35!=='undefined'&&EVENING35.el?((String(EVENING35.el.innerHTML).match(/evening35-next\">([^<]*)/)||[])[1]||''):''");
 const visit=()=>J("typeof GIST38!=='undefined'&&GIST38.visit?{guests:GIST38.visit.guests.slice(),first:GIST38.visit.first,script:GIST38.visit.script.map(s=>({k:s.k,id:s.id,tip:!!s.tip,open:!!s.open})),tips:GIST38.visit.tips.map(t=>Object.assign({},t))}:null");
 const tries=d=>J(`typeof GIST38!=='undefined'?(GIST38.tries[${d}]|0):-1`);
 const G38=()=>J('hxG()');
 const pair=()=>run('hxAt(0,-5.2,6.4,[0,1]);hxAt(1,-4.6,6.4,[0,1]);');
 // a household whose v35 evening was on an earlier day (doneDay), at time t of day d; the pair (or P1 of a companion household) on the veranda row
 const eveHouse=(d,t,done,comp)=>{run(`${comp?'hxCompanion':'hxFresh'}(${d},17.0);life34().evening35={doneDay:${done===undefined?d-1:done}};S.time=${t};`);if(comp)run('hxAt(0,-5.2,6.4,[0,1]);');else pair();run('hxFrames(1);PH="";TOASTS=[];');};
 // frames until an evening visit starts (-1 if none within max frames); until it talks; until it is over
 const waitStart=max=>{for(let k=0;k<(max||3000);k+=5){if(EV()!=='idle')return k;frames(5);}return EV()!=='idle'?0:-1;};
 const waitTalk=()=>{for(let k=0;k<1500;k+=10){const s=EV();if(s==='talking')return k;if(s==='idle')return -1;frames(10);}return -1;};
 const untilIdle=()=>{for(let k=0;k<4000&&EV()!=='idle';k+=10)frames(10);return EV();};
 // every line: by P(i)'s Act ("Listen"), or by the 8 s timer; each line's id, speaker, text and the button's label as shown
 const lineNow=()=>J("(()=>{const E=EVENING35,L=E.lines[E.line];return L?{line:E.line,n:E.lines.length,id:L.id,k:L.k,text:L.text}:null;})()");
 const listen=(i,how)=>{const out=[];for(let k=0;k<30&&EV()==='talking';k++){const s=lineNow();if(!s)break;s.btn=btnLabel();out.push(s);
   if(how==='timer'){for(let f=0;f<400&&EV()==='talking'&&J('EVENING35.line')===s.line;f++)frames(1);}
   else{frames(12);run(`hxPress(${i});hxFrames(1);hxRelease(${i});hxFrames(2);`);}}return out;};
 // one whole gist at home: the visit as planned, the lines as shown, the gist record after it
 const gistOnce=(i,how,max)=>{const st=waitStart(max);if(st<0)return null;const t0=J('S.time'),v=visit(),toasts=J('TOASTS.slice()');const tk=waitTalk();if(tk<0)return {t0,v,toasts,shown:[],aborted:true};
  const shown=listen(i||0,how);const end=untilIdle();return {t0,v,toasts,shown,end,last:J('hxG()&&hxG().last')};};
 const ids=g=>g.shown.map(s=>s.id);
 // the buttons: "Ehen?" on a tip line, "Goodnight" on the last, "Next" otherwise
 const buttonsOK=g=>{const tip=new Set(g.v.script.filter(s=>s.tip).map(s=>s.id));g.shown.forEach((s,k)=>{const want=k===g.shown.length-1?'Goodnight':tip.has(s.id)?'Ehen?':'Next';
  assert.equal(s.btn,want,'the button on line '+(k+1)+' ('+s.id+')');});};
 const copyNow=()=>J("typeof EVENING35!=='undefined'?JSON.stringify(EVENING35.copy):''"),guestsNow=()=>J("typeof EVENING35!=='undefined'?EVENING35.guests.slice():null");
 const rows=()=>{run("openLife34('today');");const h=J('PH');run('closePanel();');const m=h.match(/<div class="life-note34 gist38-card">[\s\S]*?<\/div>/);
  return {html:h,card:m?m[0]:'',rows:m?[...m[0].matchAll(/data-row="(\w+)">([^<]*)</g)].map(x=>[x[1],x[2]]):[]};};
 const placeBench=()=>run("life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i95',type:'bench',x:0,y:4,rot:0,pose36:'out'});save();S=load();enterWorld();closePanel();hxFrames(1);");
 // sit the pair on the bench by P1's Act at its east end
 const seatPair=()=>{run('hxAt(0,-5.9,6.4,[-1,0]);hxAt(1,-5.1,6.5,[-1,0]);');frames(2);const l=label(0);assert.equal(l,'Sit on the bench together','the bench prompt: '+l);press(0);frames(3);assert.equal(J('BENCH36.state'),'seated','seated on the bench');};
 const placeCoffee=()=>run("(()=>{for(let y=0;y<=FLAT.rows;y++)for(let x=0;x<FLAT.cols;x++)if(fitsHome34('coffee',x,y,0)){S.home.items.push({id:'i9301',type:'coffee',x,y,rot:0});rebuildFurniture();return [x,y];}return null;})()");
 const logN=(d,k)=>J(`LOG35.count(${d},'${k}')`);
 const nb=k=>J(`(()=>{const n=npcs.${k};return {vis:n.g.visible,route:!!n.route,x:Math.round(n.g.position.x*100)/100,z:Math.round(n.g.position.z*100)/100};})()`);

 /* ======================================================================================================================================
    Engineer B's checks: 1, 3, 4, 5, 8, 9
    ====================================================================================================================================== */
 check(1,()=>{const R={};
  // the pins (TICK_HOOKS, cue hooks, audio recipes, LINES35, WHEN35, DAYS35.rows, the pinned sources)
  const pins=J(`({tick:TICK_HOOKS.length,cue:CUE35_HOOKS.length,recipes:Object.keys(AUDIO35.recipes),talk:['tunde','nkechi','ada'].map(k=>LINES35[k].length),evening:Object.keys(LINES35.evening).map(k=>LINES35.evening[k].length),
   keys:Object.keys(LINES35).map(k=>k+':'+(Array.isArray(LINES35[k])?LINES35[k].length:Object.keys(LINES35[k]).length)),short:Object.keys(LINES35.short).length,text:Object.keys(LINES35.text).length,when:Object.keys(WHEN35).length,rows:DAYS35.rows.length,finds:FINDS34.length,
   src:[talk.toString().includes('lines_talk35'),openTalk.toString().includes('life-talk34')&&openTalk.toString().includes('act.before(card)'),finishParty.toString().includes('partyLines35'),ACTIONS.nethost.toString().includes('born35'),setupTouch.toString().includes('actPrimary35')]})`);
  assert.equal(pins.tick,17,'TICK_HOOKS');assert.equal(pins.cue,2,'CUE35_HOOKS');assert.deepEqual(pins.recipes,['cast','nibble','bite','catch','water'],'AUDIO35.recipes');
  assert.deepEqual(pins.talk,[42,41,41],'LINES35 talk');assert.deepEqual(pins.evening,[4,4,4],'LINES35.evening');assert.equal(pins.short,15,'LINES35.short');assert.equal(pins.text,58,'LINES35.text');
  assert.equal(pins.when,31,'WHEN35');assert.equal(pins.rows,12,'DAYS35.rows');assert.deepEqual(pins.src,[true,true,true,true,true],'the pinned sources');R.pins=pins;
  // the state before discovery (the football digest's day 3 at 10:00, local pair): no record, no card, no gist kinds of its own on the day; the
  // digest of the world is compared with the run without the modules by the runner
  assert(side.inert1&&!side.inert1.error,'the inert digest: '+JSON.stringify(side.inert1));assert.equal(side.inert1.save,false,'no S.life.gist38 at 10:00 after 600 frames');
  assert.equal(side.inert1.card,false,'no gist card on Today');R.digest=side.inert1.digest;
  // line35 for the three v35 guests with {evening:true}: the v35 evening's own lines (compared with the run without the modules)
  assert(side.lines1&&side.lines1.every(l=>/^[tna]e0\d$/.test(l)),'the v35 evening lines: '+JSON.stringify(side.lines1));R.lines=side.lines1;
  // a v35-pending household on day 5 at 19:30 runs the v35 evening and gets no gist; then nothing more that night
  run('hxFresh(5,19.5);');pair();run('TOASTS=[];');assert(waitStart(300)>=0,'the v35 evening starts');assert.equal(J("typeof GIST38!=='undefined'&&!!GIST38.visit"),false,'not a gist');
  assert(waitTalk()>=0,'the v35 evening talks');const sh=listen(0);untilIdle();assert(sh.every(s=>/^[tna]e0\d$/.test(s.id)),'its lines: '+JSON.stringify(sh.map(s=>s.id)));
  assert.deepEqual(J('S.life.evening35'),{doneDay:5},'marked done');frames(900);assert.equal(EV(),'idle','no gist the same night');assert.equal(J('!!S.life.gist38'),false,'nothing saved');R.v35={ids:sh.map(s=>s.id),gistAfter:false};
  // a day-3 household after its v35 evening gets no gist
  run('hxFresh(3,17);life34().evening35={doneDay:3};S.time=19;');pair();frames(900);assert.equal(EV(),'idle','no gist on the v35 evening\'s own day');assert.equal(J('!!S.life.gist38'),false,'nothing saved');R.day3={gist:false};
  // positive: on day 3 at 12:00 the glasses lie out with no record
  run('hxFresh(3,11.98);');run('hxAt(0,-8,-10);hxAt(1,-7,-10);');until(12.01);frames(12);assert(J("hxTagged().includes('lost:glasses')"),'the glasses at 12:00 on day 3');assert.equal(J('!!S.life.gist38'),false,'with no record');R.glasses='out at 12:00, no record';
  return R;});

 check(3,()=>{const R={};
  // the pair seated on Ada's bench at 18:14 on day 4 (v35 evening on day 3, no glasses found); at 18:15 they stand as the guests come
  run('hxFresh(4,17.0);life34().evening35={doneDay:3};');placeBench();const coffee=placeCoffee();assert(coffee,'a coffee table placed');run('S.time=18.2;');seatPair();run('TOASTS=[];PH="";');
  // the toast element's class list made real for this check (the harness DOM's is a no-op), to see the gate toast go
  run("{const t=document.getElementById('toast');t.classList={s:new Set(),add(c){this.s.add(c);},remove(c){this.s.delete(c);},toggle(c,o){if(o===undefined?!this.s.has(c):o)this.s.add(c);else this.s.delete(c);},contains(c){return this.s.has(c);}};}");
  for(let k=0;k<200&&J('S.time')<18+14/60;k++)frames(5);assert.equal(EV(),'idle','nobody at 18:14');assert.equal(J('BENCH36.state'),'seated','still seated at 18:14');
  const mem0=J('S.memories.length');const st=waitStart(400);assert(st>=0,'a gist by 18:16');const t0=J('S.time');assert(t0>=18.25&&t0<18.27,'it starts at 18:15: '+t0);
  assert.equal(J('BENCH36.state'),'placed','the pair stood up');const v=visit();assert(v&&v.guests.length===2,'two guests');
  // the fixer (S2): each stands on the veranda side of the bench, near the seat they had (the bench's own stand-up puts them back where they
  // sat down from; the case of a pair who sat down from inside the room is at the end of this check)
  {const B=J("(()=>{const P=benchPoseOf36(benchItem36().pose36);return [P.x,P.z];})()"),p0=J('hxPos(0)'),p1=J('hxPos(1)');
   assert(p0[1]>6.05&&p1[1]>6.05&&p0[1]<7&&p1[1]<7&&Math.hypot(p0[0]-(B[0]-0.36),p0[1]-B[1])<2.2&&Math.hypot(p1[0]-(B[0]+0.36),p1[1]-B[1])<2.6,'standing on the veranda by the bench: '+JSON.stringify({bench:B,p0,p1}));R.stood={p0:p0.map(r3),p1:p1.map(r3)};}
  assert(J("document.getElementById('toast').classList.contains('on')")&&J("document.getElementById('toast').textContent")===J("EVENING35.copy.gate"),'the gate toast up');
  const gate=J('CAST[\''+v.guests[0]+'\'].name')+' and '+J('CAST[\''+v.guests[1]+'\'].name')+' are at the gate.';assert(J('TOASTS').includes(gate),'the gate toast "'+gate+'": '+JSON.stringify(J('TOASTS')));
  // the guests' spots pass the evening's rules (with the pair standing)
  const spots=J("Object.entries(EVENING35.spots).map(([k,s])=>[k,s[0],s[1],s[1]>7.4&&!inFlat(s[0],s[1])&&levelAt(s[0],s[1])===0&&!blocked(s[0],s[1],PR)&&players.every(p=>Math.hypot(p.g.position.x-s[0],p.g.position.z-s[1])>=0.9)])");
  assert(spots.length===2&&spots.every(s=>s[3]),'the spots: '+JSON.stringify(spots));R.spots=spots.map(s=>s.slice(0,3));
  // the talking frame: discovery (by the gist), the whole script, the tray
  assert(waitTalk()>=0,'they talk');const G0=G38();assert(G0&&G0.via==='gist'&&G0.found===4,'discovered by the gist: '+JSON.stringify(G0&&{via:G0.via,found:G0.found}));
  assert.equal(J("document.getElementById('toast').classList.contains('on')"),false,'the gate toast gone when they reach the rail');
  // the fixer (S2): at the rail, the veranda row, 0.85 m or more apart, within two seconds
  frames(60);{const p0=J('hxPos(0)'),p1=J('hxPos(1)');assert(p0[1]>6.05&&p0[1]<6.75&&p1[1]>6.05&&p1[1]<6.75&&Math.hypot(p0[0]-p1[0],p0[1]-p1[1])>=0.85&&J('!GIST38.visit.glide||!Object.keys(GIST38.visit.glide).length'),
   'both at the rail: '+JSON.stringify([p0,p1]));R.rail={p0:p0.map(r3),p1:p1.map(r3)};}
  assert.equal(J('HOMEUSE35.trayOn()'),true,'the zobo tray on the coffee table');
  const shown=listen(0);assert.equal(untilIdle(),'idle','they leave');
  assert.deepEqual(shown.map(s=>s.id),v.script.map(s=>s.id),'every line in order');assert(shown.every(s=>/^gs38-/.test(s.id)),'gs38 ids');assert.equal(shown[0].id,'gs38-nk-first','the first line');
  assert(shown.every(s=>typeof s.text==='string'&&s.text.trim().length>0),'no caption empty');buttonsOK({v,shown});
  R.first={guests:v.guests,ids:shown.map(s=>s.id),buttons:shown.map(s=>s.btn),start:'18:15'};
  // after Goodnight: the v35 evening untouched, the album +1, one gist event and no evening event, the engine's guests and copy as at load
  assert.deepEqual(J('S.life.evening35'),{doneDay:3},'S.life.evening35');assert.equal(J('EVENING35.doneToday()'),false,'doneToday');assert.equal(J('S.memories.length')-mem0,1,'one memory');
  assert.equal(J('S.memories[S.memories.length-1].caption'),'The first evening of gist at the rail.','the memory');assert.equal(logN(4,'evening'),0,'no evening event');assert.equal(logN(4,'gist'),1,'one gist event');
  assert.deepEqual(guestsNow(),GUESTS0,'EVENING35.guests');assert.equal(copyNow(),COPY0,'EVENING35.copy');assert(!J('todayHTML34()').includes('evening35-card'),'no v35 evening card on Today');
  R.after={evening35:'unchanged',memories:'+1',log:J("LOG35.events(4).filter(e=>e.k==='gist').map(e=>e.a)")};
  // the next evening: the album +0; the 8 s timer path (no presses)
  run("dispatch('nextday');closePanel();S.time=18.2;");pair();const mem1=J('S.memories.length');const g5=gistOnce(0,'timer');assert(g5&&!g5.aborted,'a gist on day 5');
  assert.deepEqual(ids(g5),g5.v.script.map(s=>s.id),'every line by the timer');assert.equal(J('S.memories.length')-mem1,0,'no memory the second time');buttonsOK(g5);R.timer={ids:ids(g5)};
  // the fallback copy: with the gist's line lookup made to miss for Mr. Bassey and Mrs. Oyelaran, their greeting is the visit's fallback line
  run("var hxMiss=1;if(!globalThis.hxMissOn){globalThis.hxMissOn=1;const l=line35;line35=function(who,ctx){if(hxMiss&&ctx&&ctx.evening&&(who==='bassey'||who==='oyelaran'))return null;return l.apply(this,arguments);};}");
  const fbSeen={};for(let d=6;d<=12&&!(fbSeen.bassey&&fbSeen.oyelaran);d++){run("dispatch('nextday');closePanel();S.time=18.2;");pair();const g=gistOnce(0);assert(g&&!g.aborted,'a gist on day '+d);
   for(const s of g.shown){assert(s.text&&s.text.trim(),'no caption empty (day '+d+')');if((s.k==='bassey'||s.k==='oyelaran')&&s.line<2){assert.equal(s.id,null,'the lookup missed');assert.equal(s.text,J('GIST38.LINES.fallback.'+s.k),'the fallback line');fbSeen[s.k]=d;}}}
  run('hxMiss=0;');assert(fbSeen.bassey&&fbSeen.oyelaran,'both fallbacks shown: '+JSON.stringify(fbSeen));assert.equal(copyNow(),COPY0,'the copy restored after');R.fallback=fbSeen;
  // aborts: each puts the engine back, logs nothing and counts a try. A new day mid-arrival (and nothing discovered before the first line)
  const abortCase=(name,how)=>{eveHouse(4,18.2,3);assert(waitStart(300)>=0,name+': started');run(how);frames(4);
   assert.equal(EV(),'idle',name+': stopped');assert.equal(J("typeof GIST38!=='undefined'&&!!GIST38.visit"),false,name+': no visit');assert.deepEqual(guestsNow(),GUESTS0,name+': guests');assert.equal(copyNow(),COPY0,name+': copy');
   assert.equal(logN(4,'gist'),0,name+': nothing logged');assert.equal(J('!!S.life.gist38'),false,name+': nothing discovered');return tries(4);};
  R.aborts={nextday:abortCase('a new day',"dispatch('nextday');closePanel();")};
  R.aborts.party=abortCase('a party',"globalThis.hxParty=S.party;S.party={on:true,done:false,guests:[],indoor:false};");run('S.party=hxParty;');
  R.aborts.online=abortCase('online',"NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");run('NET.on=false;');
  assert.deepEqual([R.aborts.party,R.aborts.online],[1,1],'a try counted for each');
  // walking out for 3 s; the retry after ten game minutes; a second abort ends gists for the day
  eveHouse(4,18.2,3);assert(waitStart(300)>=0,'started');run('hxAt(0,0,-10);hxAt(1,1,-10);');frames(80);assert.equal(EV(),'arriving','still there at 2.6 s');frames(30);assert.equal(EV(),'idle','gone after 3 s away');
  assert.equal(tries(4),1,'one try');assert.deepEqual(guestsNow(),GUESTS0,'guests');pair();const tw=J('S.time');assert.equal(waitStart(270),-1,'no retry within nine game minutes');
  assert(waitStart(120)>=0,'a retry after ten game minutes');const tr=J('S.time');run('hxAt(0,0,-10);hxAt(1,1,-10);');frames(110);assert.equal(EV(),'idle','the retry walked out of');assert.equal(tries(4),2,'two tries');
  pair();assert.equal(waitStart(1200),-1,'no third try');assert.equal(logN(4,'gist'),0,'nothing logged');R.retry={first:'walked out',retryAfter:Math.round((tr-tw)*60*10)/10+' game minutes',third:false};
  // the fixer (S2): a pair inside the room (by the sofa) glide out by the door to the rail when the guests arrive; a player out in the compound
  // stays where they are
  {eveHouse(5,18.2,4);run('hxAt(0,-5.6,4.0,[0,1]);hxAt(1,-4.9,3.6,[0,1]);');assert(waitStart(300)>=0&&waitTalk()>=0,'a gist with the pair inside');const path=[];
   for(let f=0;f<90;f+=5){frames(5);path.push(J('hxPos(0)').map(r3));}const p0=J('hxPos(0)'),p1=J('hxPos(1)');
   assert(p0[1]>6.05&&p0[1]<6.75&&p1[1]>6.05&&p1[1]<6.75,'the pair from inside at the rail: '+JSON.stringify([p0,p1]));
   assert(path.some(q=>Math.abs(q[0]+4.1)<0.05&&q[1]>5.0&&q[1]<6.4),'by the door: '+JSON.stringify(path));listen(0);untilIdle();R.rail.inside={p0:p0.map(r3),p1:p1.map(r3)};
   eveHouse(5,18.2,4);run('hxAt(1,2.0,-9.0,[0,1]);');assert(waitStart(300)>=0&&waitTalk()>=0,'a gist with P2 out');frames(60);
   assert.deepEqual(J('hxPos(1)').map(r3),[2,-9],'P2 out in the compound not moved');const q0=J('hxPos(0)');assert(q0[1]>6.05&&q0[1]<6.75,'P1 at the rail');listen(0);untilIdle();R.rail.out='not moved';
   // a pair who sat on the bench from inside the room (its prompt reaches through the wall) stand on the veranda side when the guests come
   run('hxFresh(6,17.0);life34().evening35={doneDay:3};');placeBench();run('S.time=18.2;hxAt(0,-7.0,5.4,[0,1]);hxAt(1,-6.3,5.4,[0,1]);');frames(2);assert.equal(label(0),'Sit on the bench together','the bench prompt from inside');
   press(0);frames(3);assert.equal(J('BENCH36.state'),'seated','seated from inside');assert(waitStart(400)>=0,'the gist');const s0=J('hxPos(0)'),s1=J('hxPos(1)');
   assert(s0[1]>6.05&&s1[1]>6.05,'stood up on the veranda side, not back inside: '+JSON.stringify([s0,s1]));R.rail.fromInside={p0:s0.map(r3),p1:s1.map(r3)};waitTalk();listen(0);untilIdle();}
  return R;});

 check(4,()=>{const R={days:{},companion:{}};
  // invariants of every gist: the pocket owner never comes, no pair two nights running, the owner of a lost thing told by someone else is the
  // other guest and answers back, the line about today matches the day's log, the buttons
  const invariants=(g,d,prev,pocketOwner)=>{const v=g.v;assert(!v.guests.includes(pocketOwner),'day '+d+': the pocket owner is not a guest');
   if(prev&&prev.day===d-1)assert.notDeepEqual([...v.guests].sort(),[...prev.guests].sort(),'day '+d+': the same pair two nights running');
   const t1=v.tips[0];if(t1&&t1.kind==='lost'&&t1.owner!==t1.teller){assert(v.guests.includes(t1.owner),'day '+d+': the owner '+t1.owner+' is a guest');
    const back=t1.mode==='new'?'gs38-back-'+t1.arg:'gs38-back-r-'+t1.owner;assert(ids(g).includes(back),'day '+d+': the answer-back '+back+' in '+JSON.stringify(ids(g)));}
   for(const id of ids(g))if(/^gs38-told-/.test(id)){const x=id.slice(10);assert(J(`hxF().LOST.some(it=>it.id==='${x}'&&LOG35.has(${d},'return',it.owner+':'+it.id))`),'day '+d+': '+id+' retells a return of today');}
   const ret=J(`hxF().LOST.filter(it=>LOG35.has(${d},'return',it.owner+':'+it.id)&&!${JSON.stringify(v.guests)}.includes(it.owner)).map(it=>it.id)`);
   if(ret.length===1)assert(ids(g).includes('gs38-told-'+ret[0]),'day '+d+': today\'s return retold');
   assert.deepEqual(ids(g),v.script.map(s=>s.id),'day '+d+': every line in order');buttonsOK(g);};
  // Today's rows equal the tips heard: a lost row only for a thing told last night (or before) and out today; a wash row only on a wash day told
  const todayOK=(d,prevTips)=>{const r=rows();const kinds=r.rows.map(x=>x[0]),Gn=G38();
   const lostHeard=Gn.lost.heard>0&&Gn.lost.heard<d&&Gn.lost.status==='out';assert.equal(kinds.includes('lost'),lostHeard,'day '+d+': the lost row '+JSON.stringify(r.rows));
   const wash=!!(prevTips||[]).find(t=>t.kind==='wash');assert.equal(kinds.includes('wash'),wash,'day '+d+': the wash row '+JSON.stringify(r.rows));return r.rows;};
  // the payoff of last night's tips today: a new thing from 12:00 and not before, at its spot; the wash from 13:30 and not before
  const payoff=(d,prevTips)=>{const out=[];const nt=(prevTips||[]).find(t=>t.kind==='lost'&&t.mode==='new');
   if(nt){run('S.time=11.95;hxAt(0,-8,-10);hxAt(1,-7,-10);');frames(2);until(11+59.5/60);assert.equal(item(),null,'day '+d+': nothing before 12:00');until(12.005);for(let f=0;f<20&&!item();f++)frames(1);
    const it=item(),i=J(`hxF().LOST.findIndex(x=>x.id==='${nt.arg}')`);assert(it&&it.tag==='lost:'+nt.arg&&near1([it.x,it.z],spotOf(i,d)),'day '+d+': the '+nt.arg+' at 12:00 at its spot: '+JSON.stringify(it));out.push(nt.arg+' 12:00');}
   const wt=(prevTips||[]).find(t=>t.kind==='wash');const wd=J('(()=>{const G=hxG();return S.day>=G.found+2&&(S.day-G.found-2)%3===0;})()');assert.equal(wd,!!wt,'day '+d+': a wash day exactly when it was told');
   if(wt){run('S.time=13.45;');frames(2);until(13+29.5/60);assert.equal(J('hxF().world.wash.length'),0,'day '+d+': no wash at 13:29');until(13.505);frames(12);assert.equal(J('hxF().world.wash.length'),3,'day '+d+': the wash at 13:30');out.push('wash 13:30');}
   return out;};
  const evening=(d,comp)=>{run('S.time=18.2;');if(comp)run('hxAt(0,-5.2,6.4,[0,1]);');else pair();frames(1);
   // the plan is pure: twice in the same state, deep-equal, and the state unchanged
   const s0=J('JSON.stringify(S)'),p1=J('JSON.stringify(gistPlan38())'),p2=J('JSON.stringify(gistPlan38())');assert.equal(p1,p2,'day '+d+': the plan twice');assert.equal(J('JSON.stringify(S)'),s0,'day '+d+': the plan changes nothing');
   const pocketOwner=J('(()=>{const t=found38Today();return t.pocket?t.pocket.owner:null;})()');const prev=J('hxG()&&hxG().last');const g=gistOnce(0);assert(g&&!g.aborted,'day '+d+': a gist');invariants(g,d,prev,pocketOwner);
   const last=J('hxG().last');assert.deepEqual(last.tips,g.v.tips,'day '+d+': the tips recorded');return {guests:g.v.guests,tips:last.tips.map(t=>t.kind+(t.mode?':'+t.mode:'')+(t.arg!==t.kind?':'+t.arg:'')+':'+t.teller),ids:ids(g)};};
  const give=(owner,at)=>{if(J('S.time')<at){run(`S.time=${at};`);frames(30);}giveNow(0,owner);};
  const dawn=d=>{nextday();run('S.time=9;');frames(2);};
  // a local pair: the glasses and the chisel found on day 3 (F = 3), the glasses given back, the chisel kept in the pocket (whose it is was said
  // in Mama Nkechi's thanks); the v35 evening on day 3. Day 8 the household is out for the evening (no gist), so day 9's wrapper comes out
  // unannounced and, kept in the pocket, is the pocket tip that night (the fixer: since the reviews' L2 the chisel's owner is always told)
  run('hxFresh(3,12.02);');away(1);frames(4);pickNow(0);give('nkechi',13);pickNow(0);run('life34().evening35={doneDay:3};');const F=J('hxG().found');assert.equal(F,3,'F');
  let prevTips=null;const plan={4:'keep',5:'give-chisel',6:'leave',7:'find-give',8:'find-give-away',9:'find-keep'};
  for(let d=4;d<=9;d++){dawn(d);const rs=todayOK(d,prevTips);const pay=payoff(d,prevTips);
   const p=plan[d];if(p==='give-chisel')give('ada',14);
   if(p==='find-keep'){if(!item()){run('S.time=12.05;');frames(10);}assert.equal(J('hxG().lost.heard'),0,'day '+d+': out unannounced');pickNow(0);}
   if(p==='find-give'||p==='find-give-evening'||p==='find-give-away'){if(!item()){run('S.time=12.05;');frames(10);}const owner=J('hxF().LOST[hxG().lost.i].owner');pickNow(0);
    if(owner==='oyelaran'){// she is out in the afternoon: hidden once at the end of her walk, she comes back at six (the reroute fix) and takes it there
     for(let f=0;f<2400&&J('npcs.oyelaran.g.visible||!!npcs.oyelaran.route');f+=10)frames(10);assert.equal(J('npcs.oyelaran.g.visible'),false,'day '+d+': Mrs. Oyelaran is out');
     run('S.time=17.98;');frames(40);const o=nb('oyelaran');assert(o.vis&&o.route,'day '+d+': Mrs. Oyelaran walks back at six: '+JSON.stringify(o));give('oyelaran',18.02);}
    else give(owner,{nkechi:13,ada:14,tunde:13,bassey:14}[owner]);}
   if(p==='find-give-away'){R.days[d]={today:rs.map(x=>x[0]),payoff:pay,away:true};prevTips=null;continue;}
   const e=evening(d);R.days[d]={today:rs.map(x=>x[0]),payoff:pay,guests:e.guests,tips:e.tips,ids:e.ids};prevTips=J('hxG().last.tips');}
  // the tips this run had to cover: pocket, a new thing told by its owner, a reminder answered back, a new thing answered back with the wash told
  // by the teller, the wash twice
  const all=Object.values(R.days).filter(x=>x.tips).map(x=>x.tips.join(',')).join(';');for(const k of ['pocket:','lost:new:adapter','lost:remind:adapter','lost:new:lenscap','wash'])assert(all.includes(k),'covered: '+k+' in '+all);
  // a companion household (P1 and the companion): find and give back every thing the day it comes out
  run('hxCompanion(3,12.02);');frames(4);pickNow(0);give('nkechi',13);run('life34().evening35={doneDay:3};');prevTips=null;
  for(let d=4;d<=9;d++){dawn(d);const rs=todayOK(d,prevTips);const pay=payoff(d,prevTips);
   if(!item()){run(`S.time=${Math.max(12.05,J('S.time'))};`);frames(10);}
   if(item()){const owner=J('hxF().LOST[hxG().lost.i].owner');pickNow(0);
    if(owner==='oyelaran'){for(let f=0;f<2400&&J('npcs.oyelaran.g.visible||!!npcs.oyelaran.route');f+=10)frames(10);run('S.time=17.98;');frames(40);give('oyelaran',18.02);}
    else give(owner,{nkechi:13,ada:14,tunde:13,bassey:14}[owner]);}
   const e=evening(d,true);R.companion[d]={today:rs.map(x=>x[0]),payoff:pay,guests:e.guests,tips:e.tips};prevTips=J('hxG().last.tips');}
  return R;});

 check(5,()=>{const R={};assert(has38(),'the module');
  const WEEK=/\b(mon|tues|wednes|thurs|fri|satur|sun)days?\b/i,AMER=/\b(neighbor|neighbors|neighborhood|color|colors|colored|favorite|favorites|center|centers|gray|apartment|apartments|mom|moms)\b/i;
  const bad=[];const speech=(where,s,ph)=>{if(typeof s!=='string'||!s.trim()){bad.push(where+': empty');return;}
   if(WEEK.test(s))bad.push(where+': weekday');if(AMER.test(s))bad.push(where+': American spelling');if(/[0-9₦]/.test(s.replace(/1979/g,'')))bad.push(where+': a digit or ₦');
   if(/'/.test(s))bad.push(where+': a straight apostrophe');if(/[<>&]|undefined|NaN/.test(s))bad.push(where+': markup or undefined');if(s.length>160)bad.push(where+': '+s.length+' characters');
   for(const m of s.matchAll(/\{(\w+)\}/g))if(!['thing','owner','area','where'].includes(m[1].toLowerCase()))bad.push(where+': placeholder '+m[0]);};
  const ui=(where,s)=>{if(typeof s!=='string'){bad.push(where+': not text');return;}if(WEEK.test(s))bad.push(where+': weekday');if(AMER.test(s))bad.push(where+': American spelling');if(/'/.test(s))bad.push(where+': a straight apostrophe');if(/undefined|NaN/.test(s))bad.push(where+': undefined');};
  const L=J('GIST38.LINES'),U=J('GIST38.UI'),F=J('{UI:hxF().UI,SPEECH:hxF().SPEECH,LOST:hxF().LOST,SHELLS:hxF().SHELLS}');const idsAll=[];const take=(where,e)=>{idsAll.push(e[0]);speech(where+' '+e[0],e[1]);};
  for(const k in L.o)L.o[k].forEach(e=>take('greeting',e));for(const k in L.once)take('opener',[L.once[k][1],L.once[k][2]]);for(const k in L.fallback)speech('fallback '+k,L.fallback[k]);
  for(const k in L.lost)take('lost',[L.lost[k][1],L.lost[k][2]]);for(const k in L.back)take('back',L.back[k]);take('reminder',L.remind);take('reminder',L.remindGlasses);for(const k in L.backR)take('back-r',L.backR[k]);
  take('pocket',L.pocket);for(const k in L.where)speech('where '+k,L.where[k]);for(const k in L.wash)take('wash',L.wash[k]);for(const k in L.told)take('told',L.told[k]);for(const k in L.today)take('today',L.today[k]);
  for(const cat of ['react','plain','bye'])for(const k in L[cat])L[cat][k].forEach(e=>take(cat,e));
  assert.equal(new Set(idsAll).size,idsAll.length,'ids unique');assert(idsAll.every(i=>/^gs38-/.test(i)),'ids start gs38-');
  for(const k in F.SPEECH.ty)F.SPEECH.ty[k].forEach((s,n)=>speech('thanks '+k+' '+n,s));for(const k in F.SPEECH.carve)speech('carve '+k,F.SPEECH.carve[k]);
  // engineer C: Ada's ask (her talk and the gist), each with every fish she can name filled in
  const askAll=[];for(const k in F.SPEECH.ask){const v=F.SPEECH.ask[k];for(const e of Array.isArray(v[0])?v:[v]){askAll.push(e);idsAll.push(e[0]);speech('ask '+e[0],e[1]);for(const f in F.SPEECH.fishSay)speech('ask '+e[0]+' '+f,e[1].replace('{thing}',F.SPEECH.fishSay[f]));}}
  assert(F.SPEECH.ask.talk.length>=3&&F.SPEECH.ask.gist.length>=3,'three ask lines each for the day fish (S10)');
  // the fixer, from the reviews: no promise of the shelf in Ada's ask or carve lines (L1); the culture review's wording (C3, C5-C9, C11)
  for(const e of askAll)if(/shelf/i.test(e[1]))bad.push('ask '+e[0]+': promises the shelf');for(const k in F.SPEECH.carve)if(/shelf/i.test(F.SPEECH.carve[k]))bad.push('carve '+k+': promises the shelf');
  for(const k in L.plain)for(const e of L.plain[k])if(/\bghost|\bcredit\b/i.test(e[1]))bad.push(e[0]+': a ghost or a debt');for(const e of L.react.oyelaran)if(/Joke/.test(e[1]))bad.push(e[0]+': Tunde\'s tag');
  if(/wood that blushes/.test(F.SPEECH.carve.snapper))bad.push('carve snapper: against her iroko');if(/not said it is mine/.test(L.backR.oyelaran[1]))bad.push('gs38-back-r-oyelaran: denies her own line');
  if(/^Thank you, my friend\. Thirty-one years/.test(F.SPEECH.ty.lenscap[0]))bad.push('thanks lenscap: the joke twice');if(/It was not, she told me/.test(L.told.wrapper[1]))bad.push('gs38-told-wrapper');
  for(const it of F.LOST){if(/gold/i.test(it.long+' '+it.pickToast))bad.push(it.id+': gold');if(!it.say)bad.push(it.id+': no spoken place');else{speech('say '+it.id,it.say);
   const r=L.remind[1].replace('{owner}','X').replace('{thing}','y').replace('{Area}',it.say);if(/photo spot|west of|east of|between the stalls/.test(r))bad.push('reminder '+it.id+': map words');}}
  if(/lagoon/.test(F.UI.memory.shells))bad.push('the shells memory: of the lagoon');if(F.SHELLS.some(x=>!x.short))bad.push('a shell with no short name');
  assert.equal(new Set(idsAll).size,idsAll.length,'ids unique with the ask lines');assert(idsAll.every(i=>/^gs38-/.test(i)),'the ask ids start gs38-');
  const walk=(o,p)=>{if(typeof o==='string')ui(p,o);else if(o&&typeof o==='object')for(const k in o)walk(o[k],p+'.'+k);};walk(U,'GIST38.UI');walk(F.UI,'FOUND38.UI');
  for(const it of F.LOST)for(const k of ['pickToast','giveLabel','long','area'])ui('FOUND38.LOST '+it.id+'.'+k,it[k]);
  // every tip kind has a line for every teller it can have; every lost thing has pickup, give, thank-you, retold and tip lines, and an answer-back
  // where someone else tells it
  const G5=['tunde','nkechi','ada','bassey','oyelaran'];for(const k of G5){for(const cat of ['o','react','plain','bye'])assert(L[cat][k]&&L[cat][k].length,'a '+cat+' line for '+k);assert(L.wash[k],'a wash line for '+k);assert(L.backR[k],'a reminder answer-back for '+k);assert(L.where[k],'where '+k+' is');}
  for(const it of F.LOST){assert(it.pickToast&&it.giveLabel,'pickup and give for '+it.id);assert(F.SPEECH.ty[it.id],'thanks for '+it.id);assert(L.told[it.id],'retold '+it.id);assert(L.thing[it.id]&&L.pocketThing[it.id],'words for '+it.id);
   if(it.id==='glasses')assert(L.remindGlasses,'the glasses\' reminder');else{assert(L.lost[it.id],'a tip for '+it.id);if(L.lost[it.id][0]!==it.owner)assert(L.back[it.id],'an answer-back for '+it.id);}}
  // the texts as rendered: Today's card, the night page, the toasts and panels of a short run (the glasses found and kept, the first gist, the
  // morning after, the chisel)
  run('hxFresh(3,12.02);');away(1);frames(4);pickNow(0);run('life34().evening35={doneDay:3};');nextday();const seen=[];seen.push(rows().card);run('S.time=18.2;');pair();run('TOASTS=[];');const g=gistOnce(0);assert(g,'a gist');
  for(const s of g.shown)speech('shown '+s.id,s.text);seen.push(...g.toasts);run('DAYS35.nightHTML=\'<h2>Night</h2><div class="actions"></div>\';');seen.push(J('days_night35()'));nextday();seen.push(rows().card);
  run('S.time=13;');frames(2);const gv=giveNow(0,'nkechi');seen.push(gv.label,gv.panel);run("dispatch('gist38ShelfView');");seen.push(J('PH'));run('closePanel();');
  for(const h of seen){const t=String(h).replace(/<[^>]*>/g,' ');if(/undefined|NaN|\{\w+\}/.test(t))bad.push('rendered: '+t.slice(0,120));if(WEEK.test(t))bad.push('rendered weekday: '+t.slice(0,120));}
  assert.deepEqual(bad,[],'copy: '+bad.slice(0,6).join(' | '));R.lines=idsAll.length;R.rendered=seen.length;R.gistShown=ids(g);return R;});

 check(8,()=>{const R={};
  // the bench: before discovery no offer; after it "Wait here until the neighbours come", which sits them to 18:15; the gist starts and they stand;
  // Ada's ade36 is not used; the bench's page still reads as bench check 13 asks
  run('hxFresh(4,17.0);life34().evening35={doneDay:3};');placeBench();run('S.time=17.0;');seatPair();run('PH="";');press(0);let page=J('PH');run('closePanel();');
  assert(/Ada’s bench/.test(page)&&/Sit for a minute/.test(page)&&/Stand up/.test(page),'the bench page');assert(!page.includes('until the neighbours come'),'no offer before discovery');
  // discovery by a first gist that evening, then the next day's page
  run('S.time=18.2;');frames(2);const g4=gistOnce(0);assert(g4&&!g4.aborted,'the first gist');assert.equal(J('BENCH36.state'),'placed','they stood for it');assert.equal(J('!!(S.life.bench36&&S.life.bench36.adEve)'),false,'ade36 not used');
  assert(!ids(g4).includes('ade36'),'no ade36 line');nextday();run('S.time=17.0;');seatPair();run('PH="";');press(0);page=J('PH');
  assert(/Ada’s bench/.test(page)&&/Sit for a minute/.test(page)&&/Stand up/.test(page),'the bench page after discovery');assert(page.includes('data-act="bench36Wait" data-t="18.25"'),'the offer: '+page.slice(0,400));
  assert(page.includes('Wait here until the neighbours come'),'its label');run("dispatch('bench36Wait',{t:18.25});");assert.equal(J('S.time'),18.25,'sat until 18:15');assert.equal(J('BENCH36.state'),'seated','still seated');
  const g5=gistOnce(0,null,120);assert(g5&&!g5.aborted,'the gist comes');assert.equal(J('S.life.bench36.adEve||null'),null,'ade36 still unused');R.bench={offer:'18:15',stood:true,ade36:'unused'};
  // with the pair standing, the guests' spots (as the critic measured them seated: (-7.70, 7.80) and (-8.45, 7.80))
  // the bench in hands holds the gist back
  run('hxFresh(5,17.0);life34().evening35={doneDay:4};S.time=18.3;');pair();run("BENCH36.state='carrying';");frames(300);assert.equal(EV(),'idle','no gist while the bench is carried');run("BENCH36.state='off';");
  assert(waitStart(60)>=0,'the gist once it is down');untilIdle();R.carry='held';
  // football: a gist due at 18:15 waits for a late match and then for the call-in at 18:20; a household that did not play starts at 18:15
  run("hxFresh(5,17.0);life34().evening35={doneDay:4};S.time=18.2;FOOTBALL37.state='live';");pair();frames(120);assert.equal(EV(),'idle','no gist during a match');
  run("FOOTBALL37.state='idle';FOOTBALL37.lastMatchDay=S.day;");const tm=J('S.time');assert(tm<18+20/60,'before the call-in: '+tm);const st=waitStart(900);assert(st>=0,'then the gist');
  const tc=J('S.time');assert(tc>=18+20/60-1e-6&&tc<18+21.5/60,'after the call-in: '+tc);untilIdle();run("FOOTBALL37.lastMatchDay=0;");
  eveHouse(5,18.2,4);assert(waitStart(300)>=0,'no football today: a gist');const tn=J('S.time');assert(tn>=18.25&&tn<18.27,'at 18:15: '+tn);untilIdle();R.football={match:'waits',calledIn:'18:20',noMatch:'18:15'};
  // football's evening line: after matches on consecutive days, Mama Nkechi's line at most once in the save, never on the first gist
  eveHouse(4,18.2,3);run("life34();S.life.football37={v:2,found:2,played:1,last:{day:S.day}};FOOTBALL37.lastMatchDay=S.day;");let fbShown=[],nkNights=0;
  for(let d=4;d<=14&&nkNights<2;d++){if(d>4){run("dispatch('nextday');closePanel();S.time=18.2;S.life.football37.last={day:S.day};FOOTBALL37.lastMatchDay=S.day;");pair();}
   const g=gistOnce(0);assert(g&&!g.aborted,'a gist on day '+d);if(g.v.guests.includes('nkechi')&&!g.v.first)nkNights++;if(ids(g).includes('fb37-nkechi-evening')){fbShown.push({d,first:g.v.first});const I=ids(g);
    // the fixer (S10): football's line is the line about today (line 3); Mama Nkechi still greets
    assert.equal(I.indexOf('fb37-nkechi-evening'),2,'football\'s line third: '+JSON.stringify(I));assert(I.slice(0,2).some(x=>/^gs38-nk-/.test(x||'')),'her greeting kept: '+JSON.stringify(I));}}
  assert(nkNights>=2,'Mama Nkechi came on two evenings after a match');assert.equal(fbShown.length,1,'football\'s line once: '+JSON.stringify(fbShown));assert(!fbShown[0].first,'never on the first gist');run("FOOTBALL37.lastMatchDay=0;");R.football.line={once:fbShown[0].d,nights:nkNights};
  // framing with the pair standing: each guest's box, and each player's own, in view at 1280x800, 390x844 and 844x390; E.fits(0,1) at
  // 1280x800; at the phone sizes E.fits is as for the v35 evening's own framing (the caption's margin; recorded, the v35 rules accepted)
  run(`var hxInView=i=>{const c=cams[i];c.updateMatrixWorld();const v=new THREE.Vector3();let m=0;const chk=(x,z)=>{for(const dx of [-.44,.44])for(const h of [-.06,1.98])for(const dz of [-.36,.36]){v.set(x+dx,h,z+dz).project(c);m=Math.max(m,Math.abs(v.x),Math.abs(v.y));}};
   chk(players[i].g.position.x,players[i].g.position.z);for(const k of EVENING35.guests)if(npcs[k]&&npcs[k].g.visible)chk(npcs[k].g.position.x,npcs[k].g.position.z);return Math.round(m*100)/100;};`);
  // the fixer (S1): on a landscape phone the caption, a strip during a gist (gist-v38.css), sits below every guest: its top from the cascaded
  // bottom and max-height (the page's sheets and the v35 caption's own, which evening-v35.js adds at load), against the lowest pixel of each
  // guest's box in either view
  run(`var hxFeet=i=>{const c=cams[i];c.updateMatrixWorld();const v=new THREE.Vector3(),H=v21Viewport(i).h;let m=0;for(const k of EVENING35.guests){const n=npcs[k];if(!n||!n.g.visible)continue;
   for(const dx of [-.44,.44])for(const y of [-.06,1.98])for(const dz of [-.36,.36]){v.set(n.g.position.x+dx,y,n.g.position.z+dz).project(c);m=Math.max(m,(1-v.y)/2*H);}}return Math.round(m);};`);
  const capTop=(w,h)=>{const Rr=[];for(const css of sheets38(GAME).concat([J('EVENING35.css')]))rules38(css,{w,h,touch:true},Rr);const E=(tag,id,cls)=>({tag,id:id||'',cls:cls||[],attrs:{}});
   const chain=[Object.assign(E('html'),{root:true}),E('body','',['gist38-visit','evening35-on']),E('div','evening35',['on'])],px=v=>{const m=/(-?\d+(?:\.\d+)?)px/.exec(v||'');return m?+m[1]:null;};
   const b=px(cascaded38(Rr,chain,2,'bottom')),mh=px(cascaded38(Rr,chain,2,'max-height'));return h-(b===null?32:b)-(mh===null?120:mh);};   // 120: the v35 caption's stacked height
  R.framing={};for(const [w,h,t] of [[1280,800,0],[390,844,1],[844,390,1]]){eveHouse(4,18.2,3);run(`hxScreen(${w},${h},${t});`);assert(waitStart(300)>=0&&waitTalk()>=0,'a gist at '+w+'x'+h);frames(40);
   const m=[J('hxInView(0)'),J('hxInView(1)')],fits=[J('EVENING35.fits(0,1)'),J('EVENING35.fits(1,1)')];assert(m[0]<=1&&m[1]<=1,'in view at '+w+'x'+h+': '+JSON.stringify(m));if(w===1280)assert.deepEqual(fits,[true,true],'E.fits at 1280x800');
   R.framing[w+'x'+h]={inView:m,fits};
   if(w===844){const feet=[J('hxFeet(0)'),J('hxFeet(1)')],top=capTop(w,h);assert(Math.max(...feet)<top,'the guests above the caption at 844x390: feet at '+JSON.stringify(feet)+' px, the caption from '+top+' px');R.framing[w+'x'+h].caption={feet,top};}
   listen(0);untilIdle();}
  run('hxScreen(1280,800,false);');
  // the sofa's "Sit until the evening" (18:12), then the gist by 18:16
  run('hxFresh(5,16.0);life34().evening35={doneDay:4};');run('{const sp=sofaPos();hxAt(0,sp[0]-0.3,sp[1]+0.6,[0,-1]);hxAt(1,sp[0]+0.3,sp[1]+0.6,[0,-1]);}');frames(2);
  assert.equal(label(0),'Sit on the sofa together','the sofa prompt');run('PH="";');press(0);const sp=J('PH');assert(/data-act="sitwait" data-t="18.2"/.test(sp),'Sit until the evening: '+sp.slice(0,300));
  run("dispatch('sitwait',{t:18.2});");assert.equal(J('S.time'),18.2,'18:12');const s2=waitStart(400);assert(s2>=0&&J('S.time')<18+16/60,'the gist by 18:16: '+J('S.time'));untilIdle();R.sofa={sat:'18:12',gist:'by 18:16'};
  // a companion household: a whole gist with the companion beside the player
  eveHouse(4,18.2,3,true);const gc=gistOnce(0);assert(gc&&!gc.aborted&&gc.shown.length===gc.v.script.length,'a companion household\'s gist');
  R.companion={ids:ids(gc)};
  // a v35-pending household: the v35 evening exactly as before (its own lines, saved once, one evening event), and no gist after it that night
  run('hxFresh(3,17.95);');pair();const m0=J('S.memories.length');assert(waitStart(300)>=0,'the v35 evening');assert.equal(J("!!GIST38.visit"),false,'not a gist');assert(waitTalk()>=0,'it talks');const v35=listen(0);untilIdle();
  assert(v35.every(s=>/^[tna]e0\d$/.test(s.id))&&v35.length===3,'its three lines: '+JSON.stringify(v35.map(s=>s.id)));assert.deepEqual(J('S.life.evening35'),{doneDay:3},'done');assert.equal(J('S.memories.length')-m0,1,'its memory');
  assert.equal(logN(3,'evening'),1,'one evening event');run('S.time=19.5;');pair();frames(900);assert.equal(EV(),'idle','no gist the same night');assert.equal(logN(3,'gist'),0,'no gist event');R.v35={ids:v35.map(s=>s.id)};
  // Mrs. Oyelaran back at six after her afternoon out (after discovery)
  eveHouse(5,11.97,4);run('hxAt(1,-7,-10);');until(12.005);frames(10);pickNow(0);assert(J('!!S.life.gist38'),'discovered');
  for(let f=0;f<2400&&J('npcs.oyelaran.g.visible||!!npcs.oyelaran.route');f+=10)frames(10);assert.equal(J('npcs.oyelaran.g.visible'),false,'out in the afternoon');run('S.time=17.98;');frames(60);
  const o=nb('oyelaran');assert(o.vis,'Mrs. Oyelaran comes back at six: '+JSON.stringify(o));R.oyelaran={back:'18:00'};
  // the nudge: before discovery none; after it, the first evening a gist is due with nobody home, once per household, never again
  eveHouse(5,18.2,4);run('hxAt(0,0,-10);hxAt(1,1,-10);TOASTS=[];');frames(120);const nudge=J('GIST38.UI.nudge');assert(!J('TOASTS').includes(nudge),'no nudge before discovery');
  pair();const gn=gistOnce(0);assert(gn&&!gn.aborted,'a gist (discovery)');nextday();run('S.time=18.2;hxAt(0,0,-10);hxAt(1,1,-10);TOASTS=[];');frames(120);
  assert.equal(J('TOASTS').filter(t=>t===nudge).length,1,'the nudge once: '+JSON.stringify(J('TOASTS')));assert.equal(EV(),'idle','nobody home: no gist');
  nextday();run('S.time=18.2;hxAt(0,0,-10);hxAt(1,1,-10);TOASTS=[];');frames(120);assert(!J('TOASTS').includes(nudge),'never again');R.nudge={once:true};
  return R;});

 check(9,()=>{const R={};
  // no card before discovery
  eveHouse(4,10,3);assert(!rows().card,'no card before discovery');assert(!J('days_night35()').includes('gist38-recap'),'no recap block before discovery');
  // after discovery on day 3 (the glasses in the pocket): the night page is the same with and without the record; the rows of each state
  run('hxFresh(3,12.02);');away(1);frames(4);run("life34();S.life.football37={v:2,found:2,played:0};");pickNow(0);
  run("DAYS35.nightHTML='<h2>Night</h2><p>x</p><div class=\"actions\"></div>';");const n3=J('days_night35()'),r3=J('JSON.stringify(recap35())');
  run('{const g=S.life.gist38;delete S.life.gist38;globalThis.hxKeep=g;}');const n3w=J('days_night35()'),r3w=J('JSON.stringify(recap35())');run('S.life.gist38=hxKeep;');
  assert.equal(n3,n3w,'the night page with a record and no gist');assert.equal(r3,r3w,'recap35 deep-equal');
  let t=rows();assert.deepEqual(t.rows.map(x=>x[0]),['pocket','shelf'],'day 3: '+JSON.stringify(t.rows));assert(t.rows[0][1].includes('Mama Nkechi’s glasses'),'the pocket row names her: '+t.rows[0][1]);
  const hi=k=>t.html.indexOf(k);assert(hi('fb37-morning-card')>=0&&hi('fb37-morning-card')<hi('gist38-card')&&hi('gist38-card')<hi('<div class="life-chips34">'),'after football\'s card, before the chips');
  // the glasses back, the chisel picked up untold; day 4: the pocket hint, the evening row and its wait
  run('S.time=13;');frames(2);giveNow(0,'nkechi');pickNow(0);run('life34().evening35={doneDay:3};');nextday();pair();run('S.time=17.5;');t=rows();
  assert.deepEqual(t.rows.map(x=>x[0]),['pocket','wait','shelf'],'day 4: '+JSON.stringify(t.rows));
  // the fixer (L2/C2): Mama Nkechi's thanks named Ada, so the pocket row knows whose the chisel is
  assert.equal(t.rows[0][1],J("esc('In your pocket: Ada’s chisel. '+hxF().WHERE.ada)"),'the pocket row names Ada: '+t.rows[0][1]);
  assert(t.card.includes('data-act="gist38Wait"'),'the wait button');run("dispatch('gist38Wait');");assert.equal(J('S.time'),18.25,'waited until 18:15');
  // at 390 px wide, at most four rows; contrast of the card's kicker and rows on the Today page at both widths (bench check 30's method)
  run('hxScreen(390,844,true);S.time=17.5;');assert(rows().rows.length<=4,'four rows at 390 px');run('hxScreen(1280,800,false);S.time=18.25;');
  {const SH=sheets38(GAME),E=(tag,id,cls,attrs)=>({tag,id:id||'',cls:cls||[],attrs:attrs||{}});const base=[Object.assign(E('html'),{root:true}),E('body'),E('div','ov',['on'])];
   const chain=base.concat([E('div','panel',['life-panel34'],{role:'dialog'}),E('section','',['life34']),E('div','',['life-note34','gist38-card'])]);R.contrast=[];
   for(const scr of [{w:1280,h:800,touch:false,n:'1280x800'},{w:390,h:844,touch:true,n:'390x844'}]){const Rr=[];for(const css of SH)rules38(css,scr,Rr);assert.equal(colours38(Rr,chain).bgAt,chain.length-1,scr.n+': the card sets its own paper');
    for(const [n,el] of [['kicker',E('p','',['life-kicker'])],['row',E('p','',['gist38-row'])]]){const c=colours38(Rr,chain.concat([el])),k=contrast38(c.fg,c.bg);assert(k>=4.5,scr.n+' '+n+': '+k.toFixed(2)+':1');R.contrast.push([scr.n,n,+k.toFixed(2)]);}}}
  // the gist (the chisel's owner is known, so no pocket tip: tomorrow's wash): the recap block after it, the same on every call; Today the
  // morning after names the owner (the pocket tip and its recap are check 4's day 9)
  const g=gistOnce(0);assert(g&&g.v.tips.length&&g.v.tips[0].kind==='wash'&&!g.v.tips.some(x=>x.kind==='pocket'),'a wash tip, no pocket tip: '+JSON.stringify(g&&g.v.tips));
  run("DAYS35.nightHTML='<h2>Night</h2><p>x</p><p class=\"small muted\">The compound was quiet. Mrs. Oyelaran’s radio played highlife until nine, then the generator next door took over the melody.</p><div class=\"actions\"></div>';");
  const n4=J('days_night35()'),n4b=J('days_night35()');assert.equal(n4,n4b,'days_night35 twice');const blk=(n4.match(/<div class="recap35 gist38-recap">[\s\S]*?<\/div>/)||[''])[0];
  assert(blk.includes('TONIGHT’S GIST')&&blk.includes(J('GIST38.UI.recapWash')),'the block: '+blk);
  // the fixer (C4): after a gist the night page does not call the compound quiet; it names the two at the rail
  {const want=J(`esc('${'{a} and {b} stood at the rail with you until the mosquitoes won.'}'.replace('{a}',CAST['${g.v.guests[0]}'].name).replace('{b}',CAST['${g.v.guests[1]}'].name))`);
   assert(!n4.includes('The compound was quiet.')&&n4.includes(want),'the night page after a gist: '+n4.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').slice(0,300));R.night=want;}
  assert(n4.indexOf('gist38-recap')>n4.indexOf('TOMORROW')||!n4.includes('TOMORROW'),'after TOMORROW');R.recap=blk.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  nextday();t=rows();assert(t.rows[0][0]==='pocket'&&t.rows[0][1].includes('Ada’s chisel'),'day 5 knows whose: '+JSON.stringify(t.rows));if(J('(()=>{const G=hxG();return S.day>=G.found+2&&(S.day-G.found-2)%3===0;})()'))assert(t.rows.some(r=>r[0]==='wash'),'the wash heard');
  R.rows={day3:['pocket','shelf'],day4:['pocket','wait','shelf'],day5:t.rows.map(x=>x[0])};
  // a plain gist (nothing to tell): no recap block
  run('S.time=14;');frames(2);giveNow(0,'ada');run("S.time=18.2;");pair();const gp=gistOnce(0);run("DAYS35.nightHTML='<h2>Night</h2><p>x</p><div class=\"actions\"></div>';");
  if(!gp.v.tips.length)assert(!J('days_night35()').includes('gist38-recap'),'no block after a plain gist');else assert(J('days_night35()').includes('gist38-recap'),'a block after a tip');R.plainNight=gp.v.tips.length?'tip':'no block';
  // the fixer (M1): the adapter, told last night, lies out from day 6 and is left there; Today says "today" only on day 6, and on day 8 (after a
  // reminder on day 6 and a gist on day 7 that left it out) it is still lying out, as heard, with its place
  {assert(gp.v.tips.some(x=>x.kind==='lost'&&x.arg==='adapter'&&x.mode==='new'),'day 5: the adapter told: '+JSON.stringify(gp.v.tips));const lostRow=()=>(rows().rows.find(r=>r[0]==='lost')||[])[1]||null;
   nextday();const r6=lostRow();assert.equal(r6,J("esc(GIST38.UI.heard+GIST38.UI.heardLost.adapter)"),'day 6: '+r6);run('S.time=18.2;');pair();const g6=gistOnce(0);
   assert(g6.v.tips.some(x=>x.kind==='lost'&&x.mode==='remind'),'day 6: a reminder: '+JSON.stringify(g6.v.tips));nextday();run('S.time=18.2;');pair();const g7=gistOnce(0);
   assert(!g7.v.tips.some(x=>x.kind==='lost'),'day 7: no third telling: '+JSON.stringify(g7.v.tips));nextday();const r8=lostRow();
   assert(r8===J("esc('Still lying out, as you heard: Tunde’s adapter, by the square’s stage.')")&&!/today/.test(r8),'day 8: '+r8);R.heardRows={day6:r6,day8:r8};}
  // the five kinds, once each; the gates tool reads them with no warnings and the same grades; quiet-v38 reads a paste
  const kinds=J('LOG35.kinds');for(const k of ['gist','find','return','keep','set','carve'])assert.equal(kinds.filter(x=>x===k).length,1,'LOG35.kinds '+k);
  const Gt=require(path.join(__dirname,'..','tools','gates-v35.cjs'));run("LOG35.add('set','keepsake');LOG35.add('carve','croaker');");
  const days=J('JSON.stringify(Object.keys(S.life.days))');const textWith=J(`daysText35()`);run(`for(const n of ${days}){const r=S.life.days[n];if(r&&r.events)r.events=r.events.filter(e=>!['gist','find','return','keep','set','carve'].includes(e.k));}`);const textWithout=J('daysText35()');
  const an=x=>Gt.analyse([{name:'tester-1.txt',text:'Tester: Test\n'+x}],{testers:1});const aw=an(textWith),ao=an(textWithout);const warns=JSON.stringify(aw).match(/could not be read/g)||[];
  assert(['gist','find','return','keep','set','carve'].every(k=>textWith.includes(' '+k+' ')),'the paste carries the six kinds');assert.equal(warns.length,0,'gates warnings');assert.deepEqual(aw.gates.map(x=>x.status),ao.gates.map(x=>x.status),'the same grades');
  R.gates={warnings:0,grades:aw.gates.map(x=>x.status)};
  {const fx=path.join(os.tmpdir(),'cd38-quiet-'+process.pid+'.txt');fs.writeFileSync(fx,textWith);let o='';try{o=cp.execFileSync(process.execPath,[path.join(__dirname,'..','tools','quiet-v38.cjs'),fx],{encoding:'utf8'});}finally{fs.rmSync(fx,{force:true});}
   const ls=o.trim().split('\n');assert(ls.length>=2&&/^Day \d+:/.test(ls.find(l=>/^Day /.test(l))||''),'quiet-v38 output: '+o.slice(0,200));R.quiet=ls.filter(l=>/^Day /.test(l)).length+' days';}
  return R;});


 /* ======================================================================================================================================
    Engineer C's check: 11 (Ada's carvings, the afternoon fish)
    ====================================================================================================================================== */
 check(11,()=>{const R={};assert(J('!!hxF()&&typeof found38AskLine==="function"'),'the module');
  const F=J('{SP:hxF().SPEECH,UI:hxF().UI,WIN:hxF().FISH_WIN,ASK:hxF().CARVE_ASK,price:hxF().CARVE_PRICE}');
  const fishName=id=>J(`FISH34.find(f=>f.id==='${id}').name.toLowerCase()`);
  // Ada's ask as said on a day: the catfish's one line, else the day fish's line of that day (three each, by the day's number; the fixer, S10)
  const askText=(via,id,day)=>{if(id==='catfish')return F.SP.ask[via==='talk'?'catTalk':'catGist'][1];const l=F.SP.ask[via];return l[day%l.length][1].replace('{thing}',F.SP.fishSay[id]);};
  const ASKS=[];for(const k in F.SP.ask){const v=F.SP.ask[k];for(const e of Array.isArray(v[0])?v:[v])for(const f in F.SP.fishSay)ASKS.push(e[1].replace('{thing}',F.SP.fishSay[f]));}
  const anyAsk=ph=>ASKS.some(t=>has(ph,t));
  // a catch by the panel buttons at the rocks (the cast, the bite, Reel in); returns the card
  const catchNow=()=>{run('hxAt(0,12.3,13.6);');frames(2);run("dispatch('lifeFish');");run("dispatch('lifeCast');");for(let f=0;f<400&&J("!!(LIFE34.fish&&LIFE34.fish.phase==='waiting')");f+=10)frames(10);
   assert.equal(J("LIFE34.fish&&LIFE34.fish.phase"),'bite','a bite');run("dispatch('lifeReel');");return {card:J('PH'),id:J('S.life.catch&&S.life.catch.id'),t:J('S.time')};};
  const settle=()=>{run("dispatch('lifeCatch',{v:'sell'});closePanel();");};
  const offers=c=>c.card.includes('data-act="gist38ForAda"');
  // talk to Ada by P1's keys (the base's "Talk to Ada" prompt); returns the talk panel's text
  // (with a fish kept for her the give prompt leads, so that talk goes through the base's own talk hotspot act)
  const talkAda=(behind)=>{assert(settled('ada'),'Ada is there');const p=J('[npcs.ada.g.position.x,npcs.ada.g.position.z]');approach(0,p[0],p[1],1.1,2.0);const l=label(0);
   if(behind){assert(/^Give Ada the /.test(l),'the give prompt leads: '+l);run("PH='';dispatch('hs',{i:0,id:'talk:ada'});");}else{assert.equal(l,'Talk to Ada','the talk prompt: '+l);run('PH="";');press(0);}const ph=J('PH');run('closePanel();');return ph;};
  const has=(ph,t)=>ph.includes(J(`esc(${JSON.stringify(t)})`));
  const ask=()=>J('hxG().ada.ask');
  // until the asked fish is on the card (at most CARVE_SURE + 1 casts); every other card has no Keep it for Ada
  const castForAda=(want,max)=>{const seen=[];for(let k=0;k<(max||6);k++){const c=catchNow();seen.push(c.id);if(offers(c)){assert.equal(c.id,want,'the card offering Keep it for Ada is the '+want+': '+c.id);return {c,seen};}assert.notEqual(c.id,want,'the asked fish without the offer');settle();}
   assert.fail('no '+want+' within '+(max||6)+' casts: '+JSON.stringify(seen));};
  const keep=()=>{run("dispatch('gist38ForAda');");const a=J('[S.life.catch,LIFE34.fish,!!LIFE34.fishingWorld,hxG().ada.forAda,PH]');run('closePanel();');return a;};
  const giveAda=()=>{assert(settled('ada'),'Ada is there to take it');const p=J('[npcs.ada.g.position.x,npcs.ada.g.position.z]');approach(0,p[0],p[1],1.2,J(`hxBearing(${p[0]},${p[1]},0.4,2.0)`)?2.0:1.5);const l=label(0);run('PH="";TOASTS=[];');press(0);const ph=J('PH');run('closePanel();');return {label:l,panel:ph,toasts:J('TOASTS.slice()')};};
  // before discovery: the reels are exactly the base's (the runner compares this run's sequence with the run without the modules)
  assert(side.reel11&&Array.isArray(side.reel11.seq)&&side.reel11.seq.length===12,'the reels before discovery: '+JSON.stringify(side.reel11));assert.equal(side.reel11.save,false,'no record');R.before={reels:side.reel11.seq.length};
  // a household that found and gave back the glasses on day 3 (discovery) and asked Ada for the shelf
  run('hxFresh(3,12.02);');away(1);frames(4);pickNow(0);run("S.money=5000;dispatch('gist38Shelf');");giveNow(0,'nkechi');run('life34().evening35={doneDay:3};');
  // day 4, 09:00: Ada names a fish in her talk (the first of her order, the croaker), once a day; the Today card says when it bites
  nextday();run('S.time=9;');frames(2);const want=F.ASK[0];let ph=talkAda();assert(has(ph,askText('talk',want,J('S.day'))),'Ada names the '+want+': '+ph.replace(/<[^>]+>/g,' ').slice(0,300));
  assert.deepEqual(ask(),{id:want,day:4,via:'talk',said:4,casts:0,kept:0},'the ask saved');ph=talkAda();assert(!anyAsk(ph),'one ask a day: the second talk has none');
  let t=rows();const carveRow=()=>(t.rows.find(r=>r[0]==='carve')||[])[1]||null;assert.equal(carveRow(),J(`esc(${JSON.stringify(F.UI.carveAsk.replace('{fish}',fishName(want)))})`),'Today: '+JSON.stringify(t.rows));R.ask={via:'talk',fish:want,today:'asked'};
  // the morning: the asked fish never bites before 12:30, and no catch card offers it
  run('S.time=8;');const morning=[];for(let k=0;k<18&&J('S.time')<12.3;k++){const c=catchNow();morning.push(c.id);assert(!offers(c),'no offer in the morning');settle();}
  assert(morning.length>=12&&!morning.includes(want),'no '+want+' before 12:30: '+JSON.stringify(morning));assert.equal(ask().casts,0,'no afternoon casts counted');R.morning={casts:morning.length,asked:0};
  // 12:30: it bites within four casts; the card's Keep it for Ada is quiet, the one primary kept
  run('S.time=12.5;');frames(2);const fa=castForAda(want,4);const money0=J('S.money'),sold0=J(`LOG35.count(S.day,'sell')`);
  assert(fa.c.card.includes('<button class="btn quiet" data-act="gist38ForAda">Keep it for Ada</button>'),'the quiet button');assert.equal((fa.c.card.match(/class="btn primary/g)||[]).length,1,'still one primary');
  assert.equal(J('typeof panelPrimary35==="function"&&!!panelPrimary35()'),true,'tune\'s one-button fishing finds its primary');R.afternoon={casts:fa.seen.length,seen:fa.seen,at:Math.round(fa.c.t*100)/100};
  // Keep it for Ada: through Let it swim (the cast put away, nothing sold), her page, the ask kept
  let k=keep();assert(k[0]===null&&k[1]===null&&k[2]===false&&k[3]&&k[3].id===want&&k[3].day===4&&k[4].includes('FOR ADA'),'kept for Ada through Let it swim: '+JSON.stringify(k.slice(0,4)));
  assert.equal(J('S.money'),money0,'nothing sold');assert.equal(J(`LOG35.count(S.day,'sell')`),sold0,'no sell logged');assert.equal(ask().kept,4,'the ask kept');
  t=rows();assert.equal(carveRow(),J(`esc(${JSON.stringify(F.UI.carveKept.replace('{fish}',fishName(want)).replace('{until}',F.UI.untilTomorrow))})`),'Today, kept: '+JSON.stringify(t.rows));
  {const c=catchNow();assert(!offers(c),'no second offer once kept');settle();}
  // to Ada at the Yard by keys: her line, free, friendship, the log; Today says she is carving; no second ask today
  const aff0=J('S.nb.ada.aff||0'),money1=J('S.money');let gv=giveAda();assert.equal(gv.label,'Give Ada the '+fishName(want),'the give prompt');assert(has(gv.panel,F.SP.carve[want]),'her line for the '+want);
  assert.equal(J('S.money'),money1,'free');assert.equal(F.price,0,'FOUND38.CARVE_PRICE is 0');assert.equal(J('S.nb.ada.aff||0'),aff0+1,'friendship +1');assert(J(`LOG35.has(S.day,'carve','${want}')`),'the carve log');
  t=rows();assert.equal(carveRow(),J(`esc(${JSON.stringify(F.UI.carveDoing.replace('{fish}',fishName(want)))})`),'Today, carving: '+JSON.stringify(t.rows));ph=talkAda();assert(!anyAsk(ph),'no ask after a hand-over');
  // the next morning: carved, on the third plank (FOUND38.SHELF.tiers[2]) with its own mesh
  nextday();let G=J('hxG()');assert.deepEqual(G.keep.carve,[want],'carved overnight');assert(J(`LOG35.has(S.day,'keep','carve:${want}')`),'logged on the morning');
  // the fixer (S8): Today's shelf row counts the keepsakes and shells in ten, and the carvings on their own
  {t=rows();const sr=(t.rows.find(r=>r[0]==='shelf')||[])[1]||'';const c=J('[hxG().keep.keepsake.length+hxG().keep.shells.length]')[0];
   assert(sr.startsWith(J(`esc('Your shelf: ${c} of 10.')`))&&sr.includes(J("esc('Ada’s carvings: 1 of 6.')")),'the shelf row: '+sr);R.shelfRow=sr;}
  const shelf=()=>J("(()=>{const s=hxF().world.shelf;if(!s)return null;const planks=[],carved=[];s.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.parameters&&Math.abs(o.geometry.parameters.width-hxF().SHELF.w)<1e-9)planks.push(Math.round(o.position.y*1000)/1000);if(/^found38_carve_/.test(o.name||''))carved.push([o.name.slice(14),Math.round(o.position.y*1000)/1000]);});return {planks,carved,items:s.userData.items};})()");
  let sh=shelf();assert(sh&&sh.planks.length===3&&sh.planks[2]===J('hxF().SHELF.tiers[2]'),'the third plank: '+JSON.stringify(sh));assert.deepEqual(sh.carved,[[want,Math.round((J('hxF().SHELF.tiers[2]')+0.015)*1000)/1000]],'the carving on it: '+JSON.stringify(sh));
  R.carved={fish:want,plank:sh.planks[2],items:sh.items};
  // day 5: the next fish (snapper) in the morning talk; after 15:30 it never bites and Today no longer mentions it; the ask lapses
  run('S.time=9;');frames(2);const want2=F.ASK[1];ph=talkAda();assert(has(ph,askText('talk',want2,J('S.day'))),'Ada names the '+want2);
  run('S.time=15.55;');frames(2);const late=[];for(let k=0;k<14;k++){const c=catchNow();late.push(c.id);assert(!offers(c),'no offer after 15:30');settle();}
  assert(!late.includes(want2),'no '+want2+' after 15:30: '+JSON.stringify(late));t=rows();assert.equal(carveRow(),null,'Today after the window: '+JSON.stringify(t.rows));R.late={casts:late.length,asked:0};
  // a talk after 15:30 names nothing (the window has passed); the next day the old ask is closed
  nextday();run('S.time=15.6;');frames(2);ph=talkAda();assert(!anyAsk(ph),'no ask after 15:30');assert.equal(ask().day,5,'the day-5 ask lapsed');
  // the gist: on the first evening Ada is a guest she names tomorrow's fish before the goodbye ("Next"); the plan is pure; one ask a day
  let gd=null,gg=null;for(let d=0;d<8&&!gd;d++){if(d)nextday();run('S.time=18.2;');pair();frames(1);const p=J('JSON.stringify(gistPlan38())'),s0=J('JSON.stringify(S)');
   assert.equal(J('JSON.stringify(gistPlan38())'),p,'the plan twice');assert.equal(J('JSON.stringify(S)'),s0,'the plan changes nothing');const g=gistOnce(0);assert(g&&!g.aborted,'a gist');
   if(g.v.guests.includes('ada')){gd=J('S.day');gg=g;}}
  assert(gd,'Ada came to a gist');const ai=gg.shown.findIndex(s=>/^gs38-ask-gist/.test(s.id||''));assert(ai>=0&&ai===gg.shown.length-2,'her ask before the goodbye: '+JSON.stringify(ids(gg)));
  assert.equal(gg.shown[ai].k,'ada','said by Ada');assert.equal(gg.shown[ai].text,askText('gist',want2,gd+1),'the line');assert.equal(gg.shown[ai].btn,'Next','its button');buttonsOK(gg);
  assert.deepEqual(ask(),{id:want2,day:gd+1,via:'gist',said:gd,casts:0,kept:0},'the ask for tomorrow');R.gist={day:gd,guests:gg.v.guests,line:ai+1,of:gg.shown.length};
  nextday();run('S.time=9;');frames(2);t=rows();assert.equal(carveRow(),J(`esc(${JSON.stringify(F.UI.carveAsk.replace('{fish}',fishName(want2)))})`),'Today after the gist');ph=talkAda();assert(!anyAsk(ph),'no second ask the next day');
  // kept but not given: it keeps until six the next evening; no ask while it waits
  run('S.time=12.5;');frames(2);castForAda(want2,4);k=keep();assert(k[3]&&k[3].id===want2,'kept');nextday();run('S.time=9;');frames(2);ph=talkAda(true);assert(!anyAsk(ph),'no ask while a kept fish waits');
  t=rows();assert.equal(carveRow(),J(`esc(${JSON.stringify(F.UI.carveKept.replace('{fish}',fishName(want2)).replace('{until}',F.UI.untilToday))})`),'Today, the day after');
  run('S.time=17.9;');frames(2);assert(settled('ada'),'Ada at the Yard');{const p=J('[npcs.ada.g.position.x,npcs.ada.g.position.z]');approach(0,p[0],p[1],1.2,2.0);}assert.equal(label(0),'Give Ada the '+fishName(want2),'still good at 17:54');
  until(18.02);frames(4);{const p=J('[npcs.ada.g.position.x,npcs.ada.g.position.z]');approach(0,p[0],p[1],1.2,2.0);}assert.notEqual(label(0),'Give Ada the '+fishName(want2),'gone at six');t=rows();assert.equal(carveRow(),null,'Today: gone');R.keeps={until:'18:00 the next day'};
  // the named price: above 0, spend() is used (₦1,499 refused, ₦1,500 paid); then back to the gift
  nextday();run('S.time=9;');frames(2);ph=talkAda();assert(has(ph,askText('talk',want2,J('S.day'))),'asked again');run('S.time=12.5;');frames(2);castForAda(want2,4);keep();
  run('hxF().CARVE_PRICE=1500;S.money=1499;');gv=giveAda();assert(gv.toasts.includes(F.UI.carveNoMoney)&&!J('hxG().ada.pending'),'₦1,499 refused: '+JSON.stringify(gv.toasts));
  run('S.money=1500;');gv=giveAda();assert(J('hxG().ada.pending')&&J('S.money')===0&&has(gv.panel,F.UI.carvePaid.replace('{price}',J('naira(1500)'))),'₦1,500 paid: '+gv.panel.replace(/<[^>]+>/g,' ').slice(0,200));run('hxF().CARVE_PRICE=0;S.money=0;');R.price={refused:1499,paid:1500};
  // the other three day fish, then the catfish: named for after six, never by day, by the fourth evening cast
  for(const f of F.ASK.slice(2,5)){nextday();run('S.time=9;');frames(2);ph=talkAda();assert(has(ph,askText('talk',f,J('S.day'))),'Ada names the '+f);run('S.time=12.5;');frames(2);castForAda(f,4);keep();gv=giveAda();assert(has(gv.panel,F.SP.carve[f]),'given: '+f);}
  nextday();run('S.time=9;');frames(2);ph=talkAda();assert(has(ph,askText('talk','catfish',J('S.day'))),'Ada names the catfish: '+ph.replace(/<[^>]+>/g,' ').slice(0,300));
  run('S.time=12.5;');frames(2);const day=[];for(let k=0;k<6;k++){const c=catchNow();day.push(c.id);assert(!offers(c),'no catfish offer by day');settle();}assert(!day.includes('catfish'),'no catfish by day');
  away(1);run('S.time=18.3;');frames(2);castForAda('catfish',4);keep();gv=giveAda();assert(has(gv.panel,F.SP.carve.catfish),'the catfish given in the courtyard: '+gv.label);
  nextday();G=J('hxG()');assert.deepEqual(G.keep.carve.slice().sort(),F.ASK.slice().sort(),'six carvings');assert(G.sets.carve>0,'the set complete');assert(J("S.memories.some(m=>m.caption===hxF().UI.memory.carve)"),'its memory');assert(J(`LOG35.has(${G.sets.carve},'set','carve')`),'its log');
  sh=shelf();assert.equal(sh.carved.length,6,'six on the third plank');
  // the fixer (M2): all six carvings below the top bar at 1280 x 800 for a player at the mattress
  {const y=shelfTopY(0);assert(y>=TOPBAR38+2,'the carvings below the top bar: the shelf\'s top at '+y+' px');R.view={topPx:y,bar:TOPBAR38};}run("dispatch('gist38ShelfView');");ph=J('PH');run('closePanel();');assert(/Ada’s carvings · 6 of 6 · <span class="gist38-done">Complete/.test(ph),'Complete on the panel');
  nextday();run('S.time=9;');frames(2);ph=talkAda();assert(!anyAsk(ph),'nothing left to name');R.set={carved:6,day:G.sets.carve};
  // a companion household: P1 is asked, keeps and gives by keys
  run('hxCompanion(3,12.02);');frames(4);pickNow(0);giveNow(0,'nkechi');nextday();run('S.time=9;');frames(2);ph=talkAda();assert(has(ph,askText('talk',F.ASK[0],J('S.day'))),'the companion household is asked');
  run('S.time=12.5;');frames(2);castForAda(F.ASK[0],4);keep();gv=giveAda();assert(has(gv.panel,F.SP.carve[F.ASK[0]]),'and gives');R.companion='asked, kept, given';
  // the fixer (L1): with no shelf, the carving waits for one, in the panel and on Today
  assert.equal(J('hxG().shelf.state'),'none','no shelf in this household');assert(has(gv.panel,F.UI.carveNote+' '+F.UI.carveNoShelf),'the panel: no shelf');
  t=rows();assert.equal(carveRow(),J(`esc(${JSON.stringify(F.UI.carveDoingNoShelf.replace('{fish}',fishName(F.ASK[0])))})`),'Today with no shelf: '+JSON.stringify(t.rows));
  return R;});

 out.sort((a,b)=>a.n-b.n);return out;}

async function inner(only){const h=await world();const side={};const res=checks(h,only,side);return {build:h.run('BUILD_ID'),checks:res,side};}

// a subset copy's globals: load it (the bench world: buildWorld, a household), play 300 frames over day 3 midday, list the global names
async function globals(){const out={names:[],warn:0,played:0,error:null};try{const {benchWorld}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));
 const {run,context}=await benchWorld();const warn=context.console.warn;let n=0;context.console={...context.console,warn:(...a)=>{if(/38/.test(String(a[0])))n++;}};
 run("S.day=3;S.time=11.95;var hxF2=0;{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<300;k++){T35+=1000/30;PERF35+=1000/30;last=hxF2;hxF2+=1000/30;tick(hxF2);}}finally{renderFrame=rf;}}");
 run("dispatch('nextday');closePanel();enterWorld();closePanel();");out.played=300;out.warn=n;context.console.warn=warn;
 const html=fs.readFileSync(path.join(GAME,'index.html'),'utf8'),lex=new Set();
 for(const [,attr,body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){const src=attr.match(/src="([^"]+)"/);if(src&&src[1].includes('three-r128'))continue;const code=src?fs.readFileSync(path.join(GAME,src[1]),'utf8'):body;
  for(const m of code.matchAll(/^(?:const|let|class)\s+([A-Za-z_$][\w$]*)/gm))lex.add(m[1]);for(const m of code.matchAll(/^(?:const|let)\s+([A-Za-z_$][\w$]*\s*=[^;]*?(?:,\s*[A-Za-z_$][\w$]*\s*=[^,;]*?)*);/gm)){for(const k of m[1].matchAll(/(?:^|,)\s*([A-Za-z_$][\w$]*)\s*=/g))lex.add(k[1]);}}
 const own=run('Object.getOwnPropertyNames(globalThis).join(",")').split(','),present=[...lex].filter(k=>{try{return run('typeof '+k)!=='undefined';}catch(e){return false;}});
 out.names=[...new Set(own.concat(present))].filter(k=>!/^hx|^PH$|^TOASTS$|^T35$|^PERF35$/.test(k)).sort();}catch(e){out.error=String(e&&e.message||e).split('\n')[0].slice(0,200);}
 return out;}

if(process.argv[2]==='--probe'){world().then(h=>{const J=c=>JSON.parse(h.run('JSON.stringify('+c+')'));const P=probe(J);process.stdout.write(JSON.stringify(P,null,1)+'\n');process.exit(P.bad.length?1:0);}).catch(e=>{console.error(e);process.exit(1);});}
else if(process.argv[2]==='--globals'){globals().then(r=>{process.stdout.write(JSON.stringify(r)+'\n',()=>process.exit(0));});}
else if(process.argv[2]==='--debug'){world().then(h=>{const code=fs.readFileSync(process.argv[3],'utf8');const fn=new Function('h','J','run','assert',code);return fn(h,c=>JSON.parse(h.run('JSON.stringify('+c+')')),h.run,assert);}).then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});}
else if(process.argv[2]==='--inner'){const only=process.argv[3]?process.argv[3].split(',').map(Number):null;inner(only).then(r=>{process.stdout.write(JSON.stringify(r)+'\n',()=>process.exit(0));}).catch(e=>{console.error(e);process.exit(1);});}
else{(async()=>{
 const child=(args,env)=>new Promise(res=>{const p=cp.spawn(process.execPath,[__filename].concat(args),{env:Object.assign({},process.env,env||{}),stdio:['ignore','pipe','pipe']});let o='',e='';p.stdout.on('data',d=>o+=d);p.stderr.on('data',d=>e+=d);
  p.on('close',code=>{try{res(JSON.parse(o.trim().split('\n').pop()));}catch(x){res({error:(e||o).slice(-600)||('exit '+code)});}});});
 const dirs=[],mut=[];let a,b,wo;
 const withoutDir=variantDir(html=>{let o=html;assert(TAGS[0].test(o),'the found-v38 tag is in index.html');for(const T of TAGS)o=o.replace(T,'');return o;});dirs.push(withoutDir);
 const jobs=[async()=>{a=await child(['--inner']);},async()=>{b=await child(['--inner']);},async()=>{wo=await child(['--inner'],{COMPOUND_GAME_DIR:withoutDir});}]
  .concat(MUTANTS.filter(m=>!m.with).map((m,k)=>async()=>{const extra=MUTANTS.filter(x=>x.with===m.name.split(' ')[0]);const srcs={};
   for(const x of [m].concat(extra)){const f=x.file||'found-v38.js';const t=srcs[f]!==undefined?srcs[f]:(fs.existsSync(path.join(GAME,'src',f))?fs.readFileSync(path.join(GAME,'src',f),'utf8'):'');const n=t.split(x.find).length-1;
    if(n!==1){mut.push({name:m.name,check:m.check,result:'stale ('+n+' matches of '+x.name.split(' ')[0]+')',k});return;}srcs[f]=t.replace(x.find,x.replace);}
   const fns={};for(const f in srcs)fns[f]=()=>srcs[f];const d=variantDir(null,fns);dirs.push(d);const r=await child(['--inner',String(m.check)],{COMPOUND_GAME_DIR:d});const c=r.checks&&r.checks[0];
   mut.push({name:m.name+(extra.length?' (with '+extra.map(x=>x.name).join(', ')+')':''),check:m.check,result:c?(c.passed?'green':'red'):'error',k,first:c&&!c.passed?c.failure:(r.error?String(r.error).slice(0,300):undefined)});}));
 const PAR=Math.max(1,Math.min(2,+(process.env.GIST38_JOBS||2)));
 try{const q=jobs.slice();await Promise.all(Array.from({length:PAR},async()=>{while(q.length)await q.shift()();}));}finally{for(const d of dirs)fs.rmSync(d,{recursive:true,force:true});}
 mut.sort((x,y)=>x.k-y.k);for(const m of mut)delete m.k;
 const same=JSON.stringify(a)===JSON.stringify(b);
 // check 10: the scene count after a new household equals the run without the modules (exact teardown)
 if(a&&a.checks){const c10=a.checks.find(c=>c.n===10);const ca=a.side&&a.side.count10,cw=wo&&wo.side&&wo.side.count10;
  if(c10&&c10.passed&&!(typeof ca==='number'&&ca===cw)){c10.passed=false;c10.failure='the scene after a new household differs from the run without the modules ('+ca+' against '+cw+' objects)';}else if(c10&&c10.passed)c10.info.sceneCount={objects:ca,sameAsWithout:true};}
 // check 1: the inert world and the v35 guests' evening lines equal the run without the modules
 if(a&&a.checks){const c1=a.checks.find(c=>c.n===1);const ia=a.side&&a.side.inert1,iw=wo&&wo.side&&wo.side.inert1,la=a.side&&a.side.lines1,lw=wo&&wo.side&&wo.side.lines1;
  if(c1&&c1.passed){if(!(ia&&iw&&ia.digest&&ia.digest===iw.digest)){c1.passed=false;c1.failure='the day-3 world at 10:00 differs from the run without the modules ('+(ia&&ia.digest)+' against '+(iw&&iw.digest)+')';}
   else if(JSON.stringify(la)!==JSON.stringify(lw)){c1.passed=false;c1.failure='line35 for the v35 guests differs from the run without the modules: '+JSON.stringify([la,lw]);}
   else c1.info.withoutModules={digest:iw.digest,lines:lw};}}
 // check 11: the reels before discovery equal the run without the modules (the species draw is steered only while an ask is open)
 if(a&&a.checks){const c11=a.checks.find(c=>c.n===11);const ra=a.side&&a.side.reel11,rw=wo&&wo.side&&wo.side.reel11;
  if(c11&&c11.passed){if(!(ra&&rw&&Array.isArray(ra.seq)&&JSON.stringify(ra.seq)===JSON.stringify(rw.seq))){c11.passed=false;c11.failure='the reels before discovery differ from the run without the modules: '+JSON.stringify([ra&&ra.seq,rw&&rw.seq]).slice(0,300);}
   else c11.info.withoutModules={reels:rw.seq.length,same:true};}}
 const groups=[];if(wo&&wo.checks)for(const c of wo.checks){const g=groups.find(x=>x.first===c.failure);if(c.passed)groups.push({checks:[c.n],first:'GREEN without the modules'});else if(g)g.checks.push(c.n);else groups.push({checks:[c.n],first:c.failure});}
 const woRed=!!(wo&&wo.checks&&wo.checks.length===ORDER.length&&wo.checks.every(c=>!c.passed));
 const report={build:a&&a.build||null,passed:!!(a&&!a.error&&same&&a.checks.length===ORDER.length&&a.checks.every(c=>c.passed)&&mut.every(m=>m.result==='red')&&woRed),
  checks:(a&&a.checks||[]).map(c=>{const o=Object.assign({},c);delete o.n;return o;}),mutants:mut,withoutModules:{allRed:woRed,findings:groups},determinism:same?'identical':'differs'};
 if(a&&a.error)report.error=a.error;
 for(const c of report.checks)console.log((c.passed?'PASS ':'FAIL ')+c.name.slice(0,140)+(c.passed?'':' -- '+c.failure));
 for(const m of mut)console.log((m.result==='red'?'PASS ':'FAIL ')+'mutant '+m.name+' turns check '+m.check+' '+m.result);
 console.log((woRed?'PASS ':'FAIL ')+'without the v38 modules every check fails ('+groups.length+' distinct first failures)');
 console.log((same?'PASS ':'FAIL ')+'determinism: two runs give identical reports');if(a&&a.error)console.log('ERROR',a.error);
 fs.writeFileSync(OUT,JSON.stringify(report,null,1)+'\n');console.log(`${report.checks.filter(c=>c.passed).length}/${ORDER.length} checks, ${mut.filter(m=>m.result==='red').length}/${mut.length} mutants red`);
 process.exitCode=report.passed?0:1;})();}

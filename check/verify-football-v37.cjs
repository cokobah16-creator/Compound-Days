// v37 Monkey post (dist/src/football-v37.js), checked on the real game logic in Node with the shipped Three.js. Households are made with the
// real setup actions (a local two-player household; the companion household through aiStart), the sofa is placed, and the players are
// driven only through the game's own key state (P1 WASD and E, P2 the arrows and Enter: keys[...] each frame, act[i] on the press frame)
// and the real tick, one frame at a time. The harness never calls the football step, never sets the ball's velocity and never sets an AI
// target; setup may place players and the resting ball, and set the day, the time, the crate, NET, lastInput and the screen size, as the
// bench and lens harnesses do. Nothing is rendered: views are measured by projecting with the game's own cameras. Clock, Math.random, Date
// and performance.now are stubbed.
// The checks run twice in child processes and the two reports must match. Each mutant (a one-place change to football-v37.js in a copy of
// dist) reruns only its named check, which must fail. A copy of dist without the two football tags runs every check, and each must fail
// there (checks with the same first failure are reported once, with the list). Prints one PASS or FAIL line per check and writes
// check/results-football-v37.json. Engineer A's checks are 1-6, 8 and 11; engineer B's are 7, 9, 10 and 12. Check 12's before-discovery
// digest is compared here with the run without the module (it must be identical); its other assertions stand on their own (mutant M8).
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const OUT=path.join(__dirname,'results-football-v37.json');
const GAME=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');process.env.COMPOUND_GAME_DIR=GAME;
const PLAN=JSON.parse(fs.readFileSync(path.join(__dirname,'bench-route-v36.json'),'utf8'));
const NAMES={
 1:'1. Ball: no wireframe anywhere under the ball; a 0.22 m sphere of at least 16 x 12 segments carrying the panel texture (tagged "panels"), its dark share 0.18-0.32; the blob shadow follows within 1 mm while it rolls; it rests at y 0.22; an old save gets the same ball after enterWorld',
 2:'2. Kick (local pair, day 3, 10:00, the open street, facing east): a tap 5.0 m/s and 3.6-4.1 m within 2 degrees; holds of 0.40 s and 0.70 s give 7.5 and 11.0 m/s (9.7-10.7 m); a 2 s hold auto-releases at 0.95 s; with OS auto-repeat presses every 33 ms from 0.40 s a 0.70 s hold still gives one 11.0 m/s kick; P2 on Enter the same; the trap keeps the ball 0.55-0.7 m ahead at no more than 0.56 x walking speed; a release with the ball 1.7 m away kicks nothing; passes reach a standing receiver 25 degrees off and a receiver running across at 3.4 m/s (who takes it); a 0.30 s press with a teammate in the cone is a pass; a 0.20 s touch press is a 5 m/s kick; with the Kick prompt showing, a press after the ball rolled to 1.1 m still kicks',
 3:'3. Dribble and contact: a keyboard zig-zag keeps the ball (gap at most 1.1 m, mean 0.9), a straight run mean 0.85; a player standing 0.60 m away does not move it; up the stair foot the ball stays at the first step and nobody owns it once the player is up; two players chasing on the same side never shove it past 4 m/s nor flip it back and forth; a challenge pops it at 3.0 m/s and nobody owns it for 0.6 s; two releases on one frame make one kick, by the nearer player',
 4:'4. Physics: a 5 m/s tap stops within 2.3 s within 5% of the closed form; a square-on bounce off the vestibule wall keeps 0.55 of the normal speed; six 11 m/s shots at the flat-front wall, a stair rail and the palm never put the centre inside a collider, never end beyond it and bounce at contact (also through a 0.15 s frame hitch); a ball rolled at the stair foot never climbs and bounces; a crate pushed onto the ball frees it within 1.0 s and 1.5 m; a shot west from x -29 stops by x -30.5 and never comes back',
 5:'5. Hotspots and the square: at the photo spot the nearer of the photo and the ball wins; at the pepper pot with the bench placed the pot wins; in a match a human beside Kemi and the ball gets the kick; a bench holder and a day-1 sofa carrier never get "Kick"; the square’s white goal counts nothing before discovery, then one goal, a toast, the count and the log line, and not a second goal within 2 s',
 6:'6. Pitch and traffic (day 3, 15:35, a local pair, started by real keys): each cairn appears only once its child is within 0.6 m, all four by 4.0 s at the posts (1 mm) and 0.48 m tall; Emeka’s slippers lie outside the east goal; six line decals; ZONE is clear of blocked() at r 0.33; walkers moved at set-out were out of every view, none is inside KEEP from 11 s after set-out to the clearing, and kick-off waited at most 11 s; the keke enters KEEP only during its one "Motor!" (shouted first), the ball held out of its lane and no AI in it, "Oya!" as it passes x -15.4 going east, and otherwise turns at x -14.6; 3 s after the end only the ball, its shadow and the children remain tagged',
 7:'7. Match (a local pair, Saturday day 8 from 10:00, five matches back to back, seeds 1-5, two human bots against Kemi and Emeka): each ends first to 3 or by the cap; every goal is a crossing between the posts on the ball\'s path and every crossing is a goal; every out restarts 0.6 m inside, 2 m from the goal lines, for the team that did not touch last; 2.5 s celebrations; the summary in both halves; the log and the counters; one photo (the first win) and one image-free memory; pooled over twenty matches on days 8, 15, 22 and 29 the humans win 11-17, the children score in 12 or more, the children challenge 20 or more times and the median play is 35 s or more; a kick-off keep-off holds until the first kick or 4 s; no child dribbles into its own goal; no child challenge within 1 s of a human gaining the ball, one child\'s challenges 3 s apart, children within their speeds and ZONE; children\'s shots on target 35-75%; showing off widens their aim by 6 degrees or more; no post line just before a goal and no line repeated before its category is used up; twins with sound off and nothing on the bus, the bus with sound on, no AudioContext made, recipes unchanged; walkers and the keke off the pitch on the trace; a 60 s keep-ball by a human is under 70% with a child challenge; a press 0.9 m from a child\'s ball never takes it; an own goal by keys is not celebrated by its scorer, toasts "Own goal!", has no "Gooool!" and puts GOAL! at the top of both halves; a ball off Mr Bassey leaves the last touch with the kicker; a tight-angle shot clears the near stone and a tap from behind the goal line is no shot; a quick rematch never pops Mr Bassey; (merger) no human carries the ball over our own line in the pooled twenty matches, and walking back at the goal line pushes it',
 8:'8. Window and clock: the children appear 15:30 on a school day, 15:00 on a Sunday, 10:00 on a Saturday, never on day 1 unflagged nor online, and go when everyone is 18 m off for 5 s; they are 0.84 and 0.80 high with heads at 1.06 after the mixer every frame (at most two more mixers), Emeka’s feet his skin colour; their plastic ball is touched 8 times in 10 s; your ball rolled near one is passed back to the nearest human within 1.5 s; 30 s of play move the clock 10 minutes and 30 s idle 30; the call at 18:20 banners both halves, the next goal ends it ":last", Emeka runs east 5 m and fades, and no rematch that day; the cap at 300 s of play has Kemi’s line and no call, then 60 s without a goal ends it unfinished; the late lines follow tomorrow; a reload after the call keeps them home; the walk clip runs 1.25 times faster in a match above 3 m/s; (merger) ?football=playtest brings the children from 06:00, and a reload in the same tab keeps those hours',
 9:'9. Companion (Saturday day 8, P1 idle on the pitch): aiGoal returns stop 0.05 in a match; over 180 s of play the companion has the ball 5 or more times and shoots, and the children score; P1 pressing Act away from the ball while the companion has it gets a pass within 1.2 s that comes within 0.8 m; the companion stays within 0.2 m of ZONE; (merger) from the courtyard or the roof terrace at set-out the companion is on the pitch at the kick-off and plays the ball',
 10:'10. Views and HUD: match 1 of check 7 at 1280x800 and again at 844x390 is the same match; with a player within 7 m of the ball (not faded out) it is in view 95% (85% on the phone) of match frames; whenever it is not, the ball arrow shows within 15 degrees, and the goal arrow whenever the goal is off-view; the person stays at 70 px (50 on the phone) whenever the ball point is kept; the camera distance changes 3% a frame at most; compact chips opposite the player cards, the body class during the match, the role line hidden on small screens, the hints worded per key (E, Enter) and, on the phone halves, a short line naming Act (portrait recorded, not gated); (merger) the person floor holds whenever the scorer point is kept too',
 11:'11. Save and modes: nothing is saved until discovery; the first kick saves the field and S.ball where it rests, and a reload puts it there; a match is never saved; a v36 save loads with nothing added; the shared state has no football record; the Menu reset brings the ball home and a buried ball on load escapes; online there are no children, no match and the Menu line, and a guest has no kick and does not move the ball; the evening waits for a match; a day change stops it; a panel cancels a charge; the bench offer and carrying it again are refused in a match; the bench still moves with the module loaded; the gates tool reads the four new kinds; (merger) a whole bench delivery on the current route plan with football loaded, placed and sat on; a match while the bench waits at the gate; the companion switch refused in a match',
 12:'12. Inert, loop, cost: before discovery the blocked() sample, a 600-frame walk (the save, camera distances, prompts), the hooks, recipes, line tables, save keys, Menu and Today are the same as without the module (compared by the runner), the world signature is f27b15e:175 and the ball is the panelled ball; after discovery the morning line, the waypoint once and never over another, Mama Nkechi +1 that day, Today\'s result, Tunde\'s line once, the waypoint toast once even under another waypoint; with OWNER.children false no child is named; no wall clock or Math.random call in the module; inside the step at most 16 blocked() and levelAt() a rolling frame, one per 60 frames at rest, 20 blocked() a match frame; (merger) the waypoint toast waits 2.6 s after the first-kick toast',
 13:'13. (v37 merge) Own goals by real keys: the browser checker\'s real-key match bot (KB37, which carried 3 of 22 goals into our own goal by dribbling as it walked back) plays ten matches on two Saturdays (seeds 101-105 and 201-205) and no human puts the ball into our own goal; P1 walking back with keys into a resting ball 0.7 m and 1.2 m from our line never knocks it in; a kick into our own goal still counts as an own goal'};
const ORDER=[1,2,3,4,5,6,7,8,9,10,11,12,13];
// one-place changes to football-v37.js, each of which must turn its check red
const MUTANTS=[
 {name:'M1 SUB = 99 (no sub-steps)',check:4,find:'SUB:0.1,SUBMAX:8,',replace:'SUB:99,SUBMAX:8,'},
 {name:'M2 the wrapper calls the earlier chain with the ball still set',check:3,find:'const b=ball;ball=null;let r;try{r=prevBall37.apply(this,arguments);}finally{ball=b;}',replace:'const b=ball;let r;try{r=prevBall37.apply(this,arguments);}finally{ball=b;}'},
 {name:'M3 the wrapper never calls the earlier chain',check:11,find:'const b=ball;ball=null;let r;try{r=prevBall37.apply(this,arguments);}finally{ball=b;}',replace:'const b=ball;let r;'},
 {name:'M4 the press repeat guard removed',check:2,find:' if(charge37[i]||prevHeld37[i])return true;                                       // the repeat guard\n',replace:'\n'},
 {name:'M5 PASS_ITER = 1',check:2,find:'PASS_ITER:3,',replace:'PASS_ITER:1,'},
 {name:'M6 the set-out hand-off and the keep-out off',check:6,find:'function fbSetupTraffic37(){const F=FOOTBALL37;F.handoffs=[];if(typeof walkers===\'undefined\')return;',replace:'function fbSetupTraffic37(){const F=FOOTBALL37;F.handoffs=[];return;'},
 {name:'M6b (with M6) the keep-out turn-back off',check:6,find:'if(fbInKeep37(x+dx*f,z+dz*f))w.i=(w.i+w.r.length-1)%w.r.length;}',replace:'}',with:'M6'},
 {name:'M7 the companion\'s stop:0.05 removed',check:9,find:' return {x,z,stop:0.05};}',replace:' return {x,z};}'},
 {name:'M8 S.life.football37 created at load',check:12,find:'fbShadow37();fbOwnerReset37();fbBuriedCheck37(\'load\');',replace:'fbShadow37();fbOwnerReset37();fbBuriedCheck37(\'load\');fbEnsureSave37();'},
 // the fixer's changes after the three reviews: each one-place revert turns its check red
 {name:'M9 a press traps an opponent\'s ball again (DOD F2)',check:7,find:'if(fbOppOwns37(P)||F.t<F.noQualifyUntil-1e-6||fbOwnGuard37(P))continue;',replace:'if(fbOwnGuard37(P))continue;'},
 {name:'M9b (with M9) a press starts beside an opponent\'s ball',check:7,find:" if(fbOppOwns37(fbPerson37('p'+i)))return true; ",replace:' ',with:'M9'},
 {name:'M11 an own goal is celebrated by its scorer (DOD F3)',check:7,find:'celeb:own?fbNearestOf37(team,at):who}',replace:'celeb:who}'},
 {name:'M12 carrying the bench again is not refused in a match (DOD F4)',check:11,find:'const prevBenchAgain37=ACTIONS.bench36Again;ACTIONS.bench36Again=function(){',replace:'const prevBenchAgain37=ACTIONS.bench36Again;ACTIONS.bench36AgainX=function(){'},
 {name:'M13 Mr Bassey always enters from an entry point (DOD F6)',check:7,find:'const sp=F.SPECT.bassey,x=n.g.position.x,z=n.g.position.z;if(n.g.visible&&',replace:'const sp=F.SPECT.bassey,x=n.g.position.x,z=n.g.position.z;if(false&&'},
 {name:'M14 a soft body takes the last touch (DOD F7)',check:7,find:'if(P.soft)return;   //',replace:'//'},
 {name:'M15 the walk speed-up after the mixer (DOD F8)',check:8,find:'const r=fast?prevAnim37.call(this,g,t,moving,carrying,speed*1.25,dt):prevAnim37.apply(this,arguments);',replace:'const r=prevAnim37.apply(this,arguments);'},
 {name:'M16 the call is forgotten on a reload (DOD F10)',check:8,find:'return F.homeDay===S.day||!!(L&&L.last&&L.last.day===S.day&&L.last.called);',replace:'return F.homeDay===S.day;'},
 {name:'M17 the shot cone from behind the goal line (play F4)',check:7,find:'const front=team===\'a\'?bx<G[0]-F.SHOT_FRONT:bx>G[0]+F.SHOT_FRONT;',replace:'const front=true;'},
 {name:'M17b (with M17) the aim not moved off the near stone',with:'M17',check:7,find:'const aim=fbClearAim37(bx,bz,fbShotAim37(bx,bz,fx,fz,G),G);if(aim){',replace:'const aim=fbShotAim37(bx,bz,fx,fz,G);if(aim){'},
 {name:'M18 any touch ends the kick-off keep-off (play F3)',check:7,find:'if(kick&&F.keepOff&&!F.keepOff.touched)',replace:'if(F.keepOff&&!F.keepOff.touched)'},
 {name:'M19 the press refuses a ball past 1.0 m (play F10)',check:2,find:'REACH:1.0,PRESS_SLACK:0.2,',replace:'REACH:1.0,PRESS_SLACK:0,'},
 {name:'M20 no pointer while another waypoint holds the marker (play F9)',check:12,find:'if(LIFE34.waypoint){if(L.toldDay!==S.day){',replace:'if(LIFE34.waypoint){if(false){'},
 {name:'M21 a phone half names the key (M3, C11)',check:10,find:'if(li===\'touch\'||(fbCompact37(i)&&fbTouchScreen37()))return U.touchName;',replace:'if(li===\'touch\')return U.touchName;'},
 {name:'M22 no GOAL! banner in the halves (M2)',check:7,find:'F.goalBanner37={t:F.t,team:e.team};',replace:''},
 {name:'M23 a planned AI kick takes someone else\'s ball (DOD F1)',check:7,find:'if(F.owner&&F.owner.key!==P.key)return;if(!F.owner&&',replace:'if(!F.owner&&'},
 {name:'M24 the own-goal guard off: the dribble carries the ball into our own goal again (merger)',check:7,find:' if(fbOwnGuard37(P))return false;return true;}',replace:' return true;}'},
 {name:'M24b (with M24) and the trap',with:'M24',check:7,find:'||F.t<F.noQualifyUntil-1e-6||fbOwnGuard37(P))continue;',replace:'||F.t<F.noQualifyUntil-1e-6)continue;'},
 {name:'M25 the waypoint toast not queued (merger)',check:12,find:"refreshMarker34();}catch(e){}fbToastSoon37(F.LINES.ui.waypointToast);",replace:"refreshMarker34();}catch(e){}fbToast37(F.LINES.ui.waypointToast);"},
 {name:'M27 the flag hours forgotten on a reload (merger)',check:8,find:"if(typeof v==='string'&&v){fbFlagSet37(fl,v);fl.restored=true;}",replace:''},
 {name:'M28 the companion off the pitch not handed off (merger)',check:9,find:'fbGuards37();fbWatch37();fbCompanionHandoff37();',replace:'fbGuards37();fbWatch37();'},
 {name:'M28b (with M28) and the kick-off not waiting for it',with:'M28',check:9,find:'((F.trafficInside===0&&fbCompanionIn37())||e>=F.CLEAR_WAIT-1e-9)',replace:'(F.trafficInside===0||e>=F.CLEAR_WAIT-1e-9)'},
 {name:'M29 the bench\'s companion switch not refused in a match (merger)',check:11,find:"for(const n of ['bench36Duo','bench36Solo']){",replace:'for(const n of []){'},
 // the v37 merge's fixes (the merge checker's findings)
 // (the 3.5 m zone and the speed cut when the guard lets go each keep the real-key matches clean on their own; reverting both is the old guard)
 {name:'M30 the guard as it was: 1.5 m, and the dribble let go at full speed (v37 merge)',check:13,find:'OWN_GUARD:{near:3.5,',replace:'OWN_GUARD:{near:1.5,'},
 {name:'M30b (with M30) no speed cut when the guard lets go',with:'M30',check:13,find:'if(cur&&(!own||own.key!==cur.key||keepHold)&&fbOwnGuard37(cur))b.v=',replace:'if(false)b.v='},
 {name:'M31 no speed cut on a guarded player\'s push (v37 merge)',check:13,find:'function fbOwnCap37(P,vx,pre){if(!P||!fbOwnGuard37(P))return vx;',replace:'function fbOwnCap37(P,vx,pre){return vx;'},
 {name:'M32 a defender\'s body on a child\'s dribble takes the goal (v37 merge)',check:13,find:"(lp.kick||lp.how==='dribble')",replace:'lp.kick'},
 {name:'M33 the phone prompt back at 12 px (v37 merge)',check:10,css:true,find:'.pr.fb37-pr{bottom:104px;font-size:13px;',replace:'.pr.fb37-pr{bottom:104px;font-size:12px;'},
 {name:'M34 standing up from the bench hands back at once in a match (v37 merge)',check:11,find:"if(typeof benchSolo36==='function'){const prevBenchSolo37=benchSolo36;",replace:"if(false){const prevBenchSolo37=benchSolo36;"},
 {name:'M35 the playtest late line says after school (v37 merge)',check:8,find:'if(fbHours37(S.day+1)[0]<12)return T.sat;return w===1?T.sun:T.school;',replace:'return w===0?T.sat:w===1?T.sun:T.school;'}];
const TAGS=[/<script[^>]*src="(?:\.\/)?src\/football-v37\.js"><\/script>\n?/,/<link rel="stylesheet" href="src\/football-v37\.css">\n?/];

// a copy of dist with index.html changed by htmlFn and football-v37.js by srcFn (football-v37.css by cssFn; everything else linked)
function variantDir(htmlFn,srcFn,cssFn){const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd37-football-'));
 for(const f of ['assets','data'])if(fs.existsSync(path.join(GAME,f)))fs.symlinkSync(path.join(GAME,f),path.join(d,f));
 fs.mkdirSync(path.join(d,'src'));for(const f of fs.readdirSync(path.join(GAME,'src'))){if(f==='football-v37.js'&&srcFn){fs.writeFileSync(path.join(d,'src',f),srcFn(fs.readFileSync(path.join(GAME,'src',f),'utf8')));continue;}if(f==='football-v37.css'&&cssFn){fs.writeFileSync(path.join(d,'src',f),cssFn(fs.readFileSync(path.join(GAME,'src',f),'utf8')));continue;}fs.symlinkSync(path.join(GAME,'src',f),path.join(d,'src',f));}
 fs.writeFileSync(path.join(d,'index.html'),htmlFn?htmlFn(fs.readFileSync(path.join(GAME,'index.html'),'utf8')):fs.readFileSync(path.join(GAME,'index.html'),'utf8'));return d;}

// the world every check uses (the bench's: a local pair on day 2 with the sofa placed), plus the harness helpers inside the game
async function world(){const {benchWorld}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));const h=await benchWorld();const {run,context}=h;
 const store=new Map();context.sessionStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 run("var PH='',TOASTS=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}");
 run("var OVC37=ov.classList.contains;var overlayOn37=on=>{ov.classList.contains=on?(c=>c==='on'):OVC37;};");
 run("{const mk=()=>{const el={_h:'',children:[],style:{},className:'',classList:{add(){},remove(){},toggle(){},contains:()=>false},appendChild(c){this.children.push(c);return c;},removeChild(){},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:100,height:30})};Object.defineProperty(el,'innerHTML',{get(){return el._h;},set(v){el._h=String(v);}});return el;};HALF37=[mk(),mk()];const g=document.getElementById;document.getElementById=id=>id==='half0'?HALF37[0]:id==='half1'?HALF37[1]:g(id);}");
 run(`var fb=()=>typeof FOOTBALL37!=='undefined'?FOOTBALL37:null;
 var KEYS37=[{up:'w',down:'s',left:'a',right:'d',act:'e'},{up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright',act:'enter'}];
 var setKeys37=(i,dir)=>{const K=KEYS37[i];keys[K.up]=keys[K.down]=keys[K.left]=keys[K.right]=false;if(!dir)return;if(dir[0]<0)keys[K.left]=true;if(dir[0]>0)keys[K.right]=true;if(dir[1]<0)keys[K.up]=true;if(dir[1]>0)keys[K.down]=true;};
 var noKeys37=()=>{setKeys37(0,null);setKeys37(1,null);keys['e']=false;keys['enter']=false;};
 var rawOf37=(x,z)=>{const fl=Math.hypot(CAM_DIR.x,CAM_DIR.z),fx=-CAM_DIR.x/fl,fz=-CAM_DIR.z/fl,n=Math.hypot(x,z)||1;return [(x*(-fz)-z*fx)/n,(x*fx-z*fz)/n];};
 var combo37=(wx,wz)=>{let best=null,bd=-2;for(const x of [-1,0,1])for(const z of [-1,0,1]){if(!x&&!z)continue;const v=rawOf37(x,z),d=(v[0]*wx+v[1]*wz)/Math.hypot(wx,wz);if(d>bd){bd=d;best=[x,z];}}return best;};
 var at37=(i,x,z,face)=>{const p=players[i];p.g.position.set(x,0,z);p.prev=[x,z];p.y=0;p.lvl=0;p.g.baseY=0;if(face){p.face=[face[0],face[1]];p.g.rotation.y=Math.atan2(face[0],face[1]);}};
 var pos37=i=>[players[i].g.position.x,players[i].g.position.z];
 var bpos37=()=>[ball.position.x,ball.position.z];
 var ballAt37=(x,z)=>{ball.position.x=x;ball.position.z=z;};
 var press37=i=>{keys[KEYS37[i].act]=true;act[i]=true;if(!lastInput[i]||lastInput[i]==='pad')lastInput[i]='key';};
 var release37=i=>{keys[KEYS37[i].act]=false;};
 var FT37=0,DT37=1000/30,ONF37=null;
 var frames37=n=>{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<n;k++){T35+=DT37;PERF35+=DT37;last=FT37;FT37+=DT37;tick(FT37);if(ONF37)ONF37();}}finally{renderFrame=rf;}};
 var screen37=(w,h,touch)=>{innerWidth=w;innerHeight=h;navigator.maxTouchPoints=touch?1:0;for(let i=0;i<2;i++){const vp=v21Viewport(i);cams[i].aspect=vp.w/vp.h;cams[i].updateProjectionMatrix();}};
 var evs37=(ev,from)=>{const F=fb();return F?F.events.filter(e=>e.ev===ev&&(from===undefined||e.t>=from)):[];};
 var tnow37=()=>{const F=fb();return F?+F.t.toFixed(3):0;};
 var restBall37=(max)=>{for(let k=0;k<(max||300);k++){if(Math.hypot(ball.v[0],ball.v[1])<0.001)return k;frames37(1);}return -1;};
 // each scenario starts from the same frame clock and the same Math.random stub, so it plays the same whatever ran before it (the wall-clock
 // stubs T35 and PERF35 only ever move on: modules keep times read from them)
 var reclock37=()=>{FT37=0;last=0;Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();};
 var newTab37=()=>{try{sessionStorage.removeItem('football37.session');}catch(e){}};   // each household starts as in a new tab: no flag held for the session
 var fresh37=(day,time)=>{reclock37();NET.on=false;NET.isHost=true;AI.on=false;_silent=false;ONF37=null;noKeys37();overlayOn37(false);location.search='';newTab37();DT37=1000/30;window.__DT_MAX=undefined;
  if(fb()){fb().flags=null;}
  dispatch('newgame');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupstep',{v:'p0'});dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();
  sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();screen37(1280,800,false);
  if(day!==undefined)S.day=day;if(time!==undefined)S.time=time;lastInput[0]=lastInput[1]='key';frames37(2);PH='';TOASTS=[];};
 var companion37=(day,time)=>{reclock37();NET.on=false;AI.on=false;_silent=false;ONF37=null;noKeys37();overlayOn37(false);location.search='';newTab37();if(fb())fb().flags=null;
  dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();dispatch('movein');closePanel();
  sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();screen37(1280,800,false);if(day!==undefined)S.day=day;if(time!==undefined)S.time=time;frames37(2);PH='';TOASTS=[];};
 // the walking bot: each frame the one of the eight camera-relative key combinations nearest the needed direction
 var walk37=(i,x,z,stop)=>{const p=pos37(i),dx=x-p[0],dz=z-p[1],d=Math.hypot(dx,dz);if(d<=(stop||0.15)){setKeys37(i,null);return d;}setKeys37(i,combo37(dx,dz));return d;};
 var walkTo37=(i,x,z,stop,max)=>{for(let k=0;k<(max||600);k++){if(walk37(i,x,z,stop)<=(stop||0.15)){setKeys37(i,null);return k;}frames37(1);}setKeys37(i,null);return -1;};
 var R37=(()=>{let s=1;return {seed(v){s=(v>>>0)||1;},next(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;}};})();
 // the human match bots (two, seeded): approach 0.7 m behind the ball on the line from the attacked goal, shoot when facing within 25 degrees
 // (hold 0.70 s beyond 7 m, 0.40 s at 4-7 m, tap closer), react every 0.1 s and repeat the last decision 35% of the time. 'clear' bots chase
 // the ball and kick it long towards the children's end (they never shoot); 'keeper' stands in the west mouth and clears; 'idle' does nothing.
 var BOT37={on:false,style:['attack','attack'],hold:[0,0],dir:[null,null],t:[0,0],press:[false,false],aim:[undefined,undefined]};
 var botStep37=()=>{const F=fb();if(!F||!BOT37.on)return;const P=F.PITCH;for(const i of [0,1]){if(!players[i]||(AI.on&&i===1))continue;const st=BOT37.style[i];
   // while holding, an attacker aims by turning (the charge walk is slow) towards the corner away from the child nearest our goal line
   if(BOT37.hold[i]>0){BOT37.hold[i]-=DT37/1000;if(BOT37.hold[i]<=0){release37(i);BOT37.hold[i]=0;setKeys37(i,null);continue;}
    if(st==='attack'&&F.kids&&BOT37.aim[i]===undefined){const b=bpos37(),g=[P.x2,P.zc],ks=['kemi','emeka'].map(k=>F.kids[k].pos).filter(c=>c[0]>b[0]);
     const c=ks.sort((u,v)=>v[0]-u[0])[0],ux=g[0]-b[0],uz=g[1]-b[1],side=c?((c[0]-b[0])*uz-(c[1]-b[1])*ux>0?1:-1):0;BOT37.aim[i]=side?combo37(g[0]-b[0],g[1]+side*0.6-b[1]):null;}
    setKeys37(i,st==='attack'?BOT37.aim[i]||null:null);continue;}
   BOT37.aim[i]=undefined;
   if(st==='idle'){setKeys37(i,null);continue;}
   // 'wall': stand on the west goal line, side by side, stepping back into place when pushed (the ball cannot pass two bodies there, nor
   // get behind them)
   if(st==='wall'){const wx=P.x1-0.05,wz=P.zc+(i?0.45:-0.45),p=pos37(i),d=Math.hypot(wx-p[0],wz-p[1]),b=bpos37(),db=Math.hypot(b[0]-p[0],b[1]-p[1]);setKeys37(i,d>0.08?safeDir37(i,combo37(wx-p[0],wz-p[1])):null);continue;}
   // after a goal, an attacker walks back to its side of the centre for the kick-off (instead of chasing the ball behind the goal)
   if(st==='attack'&&F.state==='goal'){const kx=P.cx-1.2-(i?1.4:0),kz=P.zc+(i?0.9:-0.3),p=pos37(i),d=Math.hypot(kx-p[0],kz-p[1]);setKeys37(i,d>0.3?combo37(kx-p[0],kz-p[1]):null);BOT37.dir[i]=null;continue;}
   BOT37.t[i]-=DT37/1000;if(BOT37.t[i]>0){setKeys37(i,BOT37.dir[i]);continue;}BOT37.t[i]=0.1;if(BOT37.dir[i]&&R37.next()<0.35){setKeys37(i,BOT37.dir[i]);continue;}
   const p=pos37(i),b=bpos37(),face=players[i].face||[1,0];let G=[P.x2,P.zc];
   if(st==='keeper'){const kx=P.x1+0.9,kz=Math.max(P.zc-0.9,Math.min(P.zc+0.9,b[1]));const db=Math.hypot(b[0]-p[0],b[1]-p[1]);
    if(db<1.0&&b[0]>p[0]-0.2){G=[P.x2,P.z2+3];}else{const d=Math.hypot(kx-p[0],kz-p[1]);BOT37.dir[i]=d>0.25?combo37(kx-p[0],kz-p[1]):null;setKeys37(i,BOT37.dir[i]);continue;}}
   if(st==='clear')G=[P.x2+1.5,P.z2+4];
   // two attackers: the one farther from the ball supports (ahead of the ball and to the side, or back in front of our goal while the
   // children have the ball) instead of crowding the same spot
   if(st==='attack'&&!AI.on&&BOT37.style[1-i]==='attack'&&players[1-i]){const q=pos37(1-i),dm=Math.hypot(b[0]-p[0],b[1]-p[1]),dq=Math.hypot(b[0]-q[0],b[1]-q[1]);
    if(dq<dm-0.3||(Math.abs(dq-dm)<=0.3&&i===1)){let sx=Math.max(P.x1+0.8,Math.min(P.x2-1.0,b[0]+2.5)),sz=b[1]>P.zc?Math.max(P.z1+0.6,b[1]-2.0):Math.min(P.z2-0.6,b[1]+2.0);
     if(F.owner&&F.owner.team==='b'){sx=Math.max(P.x1+1.5,P.x1+(b[0]-P.x1)*0.4);sz=P.zc+(b[1]-P.zc)*0.4;      // while the children have it, the second one drops back in front of our goal
      if(dm<1.7){const ax=p[0]-b[0],az=p[1]-b[1],al=Math.hypot(ax,az)||1;sx=b[0]+ax/al*2.2;sz=b[1]+az/al*2.2;}}            // (stepping away from the ball first, so as not to walk it in)
     const d=Math.hypot(sx-p[0],sz-p[1]);BOT37.dir[i]=safeDir37(i,d>0.4?combo37(sx-p[0],sz-p[1]):null);setKeys37(i,BOT37.dir[i]);continue;}}
   const gx=G[0]-b[0],gz=G[1]-b[1],gl=Math.hypot(gx,gz)||1,tx=b[0]-gx/gl*0.7,tz=b[1]-gz/gl*0.7,dT=Math.hypot(tx-p[0],tz-p[1]),db=Math.hypot(b[0]-p[0],b[1]-p[1]);
   const ang=Math.acos(Math.max(-1,Math.min(1,(face[0]*gx+face[1]*gz)/gl)))*180/Math.PI;
   // a child dribbling within 2.5 m: step into the ball's path just in front of it and face it (a challenge wins it back; a press never does)
   if(st==='attack'&&db<2.5&&F.owner&&F.owner.team==='b'&&!ball.held&&F.state==='live'){const of=F.owner.face,fx=b[0]+of[0]*0.35,fz=b[1]+of[1]*0.35,df=Math.hypot(fx-p[0],fz-p[1]);
    BOT37.dir[i]=df>0.25&&db>0.75?combo37(fx-p[0],fz-p[1]):combo37(b[0]-p[0],b[1]-p[1]);setKeys37(i,BOT37.dir[i]);continue;}
   // an attacker shoots only with the line to the goal clear of the children (a child within 0.6 m of it): otherwise it dribbles on, a step to the side
   const laneBlocked=st==='attack'&&F.kids&&['kemi','emeka'].some(k=>{const c=F.kids[k].pos,L=gx*gx+gz*gz||1,u=Math.max(0,Math.min(1,((c[0]-b[0])*gx+(c[1]-b[1])*gz)/L));return u>0.05&&Math.hypot(b[0]+gx*u-c[0],b[1]+gz*u-c[1])<0.6;});
   if(db<=0.95&&ang<=20&&!ball.held&&F.state==="live"&&!laneBlocked){const dg=Math.hypot(P.x2-b[0],P.zc-b[1]);const hold=st!=='attack'?0.7:dg>7?0.7:dg>=4?0.4:0.03;press37(i);BOT37.hold[i]=hold;BOT37.dir[i]=null;setKeys37(i,null);continue;}
   // on the goal side of the ball, go round it (a side point 1.6 m off the line, clear of the 1.1 m sticky dribble) instead of walking it back into the wrong goal
   const ux=gx/gl,uz=gz/gl,along=(p[0]-b[0])*ux+(p[1]-b[1])*uz,side=(p[0]-b[0])*(-uz)+(p[1]-b[1])*ux,sg=side>=0?1:-1;let wx=tx,wz=tz;
   if(along>-0.35&&db<2.6){wx=b[0]-ux*0.6+(-uz)*sg*1.6;wz=b[1]-uz*0.6+ux*sg*1.6;}
   // with the ball and a child in the way within 2.5 m, it dribbles round on the side away from the child (45 degrees off the goal line)
   let ax=gx,az=gz;if(st==='attack'&&laneBlocked&&F.owner&&F.owner.key==='p'+i){const c=['kemi','emeka'].map(k=>F.kids[k].pos).sort((u,v)=>Math.hypot(u[0]-b[0],u[1]-b[1])-Math.hypot(v[0]-b[0],v[1]-b[1]))[0];
    if(Math.hypot(c[0]-b[0],c[1]-b[1])<2.5){const sd=((c[0]-b[0])*gz-(c[1]-b[1])*gx)>0?1:-1,ca=Math.cos(Math.PI/4),sa=Math.sin(Math.PI/4)*sd;ax=gx*ca-gz*sa;az=gx*sa+gz*ca;}}
   // with the ball at its feet it turns with it towards the goal (the dribble follows the facing), rather than walking round behind it again
   const mine=st==='attack'&&F.owner&&F.owner.key==='p'+i&&F.state==='live';
   if(dT>0.4&&!mine){BOT37.dir[i]=combo37(wx-p[0],wz-p[1]);}else BOT37.dir[i]=combo37(ax,az);if(st==='attack')BOT37.dir[i]=safeDir37(i,BOT37.dir[i]);setKeys37(i,BOT37.dir[i]);}};
 // an attacking bot never walks towards its own goal with the ball just ahead of it (it would dribble it in): it steps round instead
 var safeDir37=(i,dir)=>{if(!dir||ball.held||!fb()||fb().state!=='live')return dir;const v=rawOf37(dir[0],dir[1]),p=pos37(i),b=bpos37(),dx=b[0]-p[0],dz=b[1]-p[1],d=Math.hypot(dx,dz);
  if(v[0]<-0.2&&d<1.4&&(v[0]*dx+v[1]*dz)/(d||1)>0.1){const s=dz*v[0]-dx*v[1]>0?1:-1;return combo37(-v[1]*s+0.3,v[0]*s);}return dir;};
 var botsOn37=(a,b,seed)=>{BOT37.on=true;BOT37.style=[a,b];BOT37.hold=[0,0];BOT37.dir=[null,null];BOT37.t=[0,0];R37.seed(seed||1);ONF37=()=>{botStep37();if(TRACE37.on)traceFrame37();};};
 var botsOff37=()=>{BOT37.on=false;for(const i of [0,1])release37(i);noKeys37();ONF37=TRACE37.on?traceFrame37:null;};
 // (v37 merge) the browser checker's real-key match bot (football/merge/checker/browser/k.mjs match(), which found own goals carried in by
 // dribbling), ported line for line: every 2 frames each human chases the ball and walks to 0.7 m behind it on the line from the children's
 // goal (or round it, 1.1 m to the side, when on the goal side), dribbles on when facing within 45 degrees, now and then passes to a free
 // teammate ahead, shoots when lined up within 7.5 m (holding 19, 12 or 4 frames), supports when the teammate is nearer, and calls once.
 // Unlike BOT37 it has no safeDir37: it walks back towards our own goal with the ball ahead of it, as people do.
 var KB37={on:false,rs:1,hold:[0,0],called:false,f:0,tapUp:-1};
 var kbOn37=seed=>{KB37.on=true;KB37.rs=seed>>>0;KB37.hold=[0,0];KB37.called=false;KB37.f=0;KB37.tapUp=-1;};
 var kbRnd37=()=>{KB37.rs=(KB37.rs*1103515245+12345)>>>0;return KB37.rs/4294967296;};
 var kbMove37=(i,dx,dz)=>setKeys37(i,Math.hypot(dx,dz)<1e-6?null:combo37(dx,dz));
 var kbStep37=()=>{const F=fb();if(!F||!KB37.on)return;if(KB37.tapUp>=0){release37(KB37.tapUp);KB37.tapUp=-1;}if((KB37.f++)%2)return;const P=F.PITCH;
  const s=F.state,b=bpos37(),own=F.owner&&F.owner.key,held=!!ball.held,pp=[pos37(0),pos37(1)];
  for(const h of [0,1]){const i=h;
   if(KB37.hold[h]>0){KB37.hold[h]-=2;if(KB37.hold[h]<=0)release37(i);continue;}
   if(s!=='live'){setKeys37(i,null);continue;}
   const me=pp[i],dm=Math.hypot(b[0]-me[0],b[1]-me[1]),mate=pp[1-i],dq=Math.hypot(b[0]-mate[0],b[1]-mate[1]),face=players[i].face||[1,0];
   const gx=P.x2-b[0],gz=P.zc-b[1],gl=Math.hypot(gx,gz),ux=gx/gl,uz=gz/gl,ang=Math.acos(Math.max(-1,Math.min(1,face[0]*ux+face[1]*uz)))*180/Math.PI;
   const mateOwns=own==='p'+(1-i);
   if(!KB37.called&&mateOwns&&dm>3){KB37.called=true;setKeys37(i,null);press37(i);KB37.tapUp=i;continue;}
   if(mateOwns||(dq<dm-0.4&&own!=='p'+i)){const sx=Math.max(P.x1+1,Math.min(P.x2-1.5,b[0]+2.5)),sz=b[1]>P.zc?Math.max(P.z1+0.7,b[1]-1.8):Math.min(P.z2-0.7,b[1]+1.8);
    if(Math.hypot(sx-me[0],sz-me[1])>0.5)kbMove37(i,sx-me[0],sz-me[1]);else setKeys37(i,null);continue;}
   if(dm<=0.95&&!held){if(mate[0]>b[0]+1.5&&kbRnd37()<0.08){const mx=mate[0]-b[0],mz=mate[1]-b[1],a2=Math.acos(Math.max(-1,Math.min(1,(face[0]*mx+face[1]*mz)/Math.hypot(mx,mz))))*180/Math.PI;if(a2<30){setKeys37(i,null);press37(i);KB37.hold[h]=2;continue;}}
    if(ang<=20&&gl<7.5){setKeys37(i,null);press37(i);KB37.hold[h]=gl>5.5?19:gl>3?12:4;continue;}}
   if(own==='p'+i&&ang<=45){kbMove37(i,ux,uz);continue;}
   const along=(me[0]-b[0])*ux+(me[1]-b[1])*uz,side=(me[0]-b[0])*(-uz)+(me[1]-b[1])*ux,sg=side>=0?1:-1;let wx=b[0]-ux*0.7,wz=b[1]-uz*0.7;if(along>-0.35&&dm<2.6){wx=b[0]-ux*0.6-uz*sg*1.1;wz=b[1]-uz*0.6+ux*sg*1.1;}
   if(Math.hypot(wx-me[0],wz-me[1])>0.4)kbMove37(i,wx-me[0],wz-me[1]);else kbMove37(i,ux,uz);}};
 var kbOff37=()=>{KB37.on=false;for(const i of [0,1])release37(i);noKeys37();ONF37=TRACE37.on?traceFrame37:null;};
 // the start by real keys: P1 walks to within 1.5 m of Kemi and presses E (P2 waits near the pitch)
 var startMatch37=()=>{const F=fb();for(let k=0;k<400&&!(F.kids&&F.state==='idle'&&F.kids.kemi.mode==='idle'&&F.kids.emeka.mode==='idle');k++)frames37(1);if(!F.kids)return 'no children';const c=F.kids.kemi;
  walkTo37(0,c.pos[0]+1.1,c.pos[1]+0.2,0.2,300);frames37(1);press37(0);frames37(1);release37(0);frames37(1);return F.state;};
 var TRACE37={on:false,frames:[]};var traceFrame37=()=>{};
 // the street's traffic for the pitch checks: walkers on the base routes at chosen phases, and the keke (index.html buildAmbient shapes)
 var traffic37=(list,kx,kdir)=>{for(const w of walkers)scene.remove(w.g);walkers.length=0;const R=[[[14.5,0.3],[28,0.3]],[[28.5,-0.6],[14.5,-0.6]],[[-28,9.6],[28,9.6]],[[26,8.0],[-26,8.0]],[[-14,13.2],[14,13.2]],[[-27,6],[-16,-6]]];
  for(const [r,x,z,i,sp] of list){const g=makeAvatar(CAST.oyelaran.look,true);g.position.set(x,0,z);scene.add(g);walkers.push({g,r:R[r],i,t:0,sp});}
  if(keke)scene.remove(keke);keke=new THREE.Group();keke.position.set(kx,0,10.6);keke.dir=kdir;scene.add(keke);};
 // the harness's own view test: inside the usable rectangle of a human view (no growth)
 var seen37=(x,y,z)=>{const v=new THREE.Vector3();const idx=AI.on?[0]:[0,1];for(const i of idx){const cam=cams[i];cam.updateMatrixWorld();v.set(x,y,z).project(cam);if(v.z<-1||v.z>1)continue;const vp=v21Viewport(i),px=(v.x+1)/2*vp.w,py=(1-v.y)/2*vp.h;if(px>=0&&px<=vp.w&&py>=vp.top&&py<=vp.h-vp.bottom)return true;}return false;};
 var inKeep37=(x,z)=>x>=-31&&x<=-15.4&&z>=5.6&&z<=13.6;`);
 // engineer B's helpers. The body's class list as a real set (the generic stub always answers false)
 run("{const s=new Set();document.body.classList={add:c=>s.add(c),remove:c=>s.delete(c),toggle:(c,v)=>{const on=v===undefined?!s.has(c):!!v;if(on)s.add(c);else s.delete(c);return on;},contains:c=>s.has(c)};}");
 run(`// the harness's own view test, with the angle (degrees, 0 = right, clockwise) from the centre of view i's framed area to the point
 var proj37=(i,x,y,z)=>{const cam=cams[i];cam.updateMatrixWorld();const v=new THREE.Vector3(x,y,z),q=v.clone().applyMatrix4(cam.matrixWorldInverse),behind=q.z>-0.05;v.project(cam);let sx=v.x,sy=v.y;if(behind){sx=-sx;sy=-sy;}
  const vp=v21Viewport(i),px=(sx+1)/2*vp.w,py=(1-sy)/2*vp.h,cx=vp.w/2,cy=(vp.top+vp.h-vp.bottom)/2;return {inside:!behind&&px>=0&&px<=vp.w&&py>=vp.top&&py<=vp.h-vp.bottom,ang:Math.atan2(py-cy,px-cx)*180/Math.PI,py};};
 var r3h=v=>Math.round(v*1000)/1000,r1h=v=>Math.round(v*10)/10;
 var shown37=(i,re)=>{const c=HALF37[i].children.find(c=>re.test(c.className||'')&&c.style&&c.style.display!=='none');return c||null;};
 // the per-frame match record: state, score, owner, the ball, the children (position, own speed, mode), the companion, traffic, and per view:
 // player-ball distance, the ball and the attacked goal in view (and their angles), the arrows, the camera point, the person height, the camera
 // distance, the chip's class, the strip and the hint
 var MT37=null;var mtFrame37=()=>{const F=fb();if(!F||!MT37)return;const P=F.PITCH,views=AI.on?[0]:[0,1];
  const fr={t:r3h(F.t),s:F.state,sc:F.score.slice(),o:F.owner?F.owner.key:null,b:[r3h(ball.position.x),r3h(ball.position.z)],bv:r3h(Math.hypot(ball.v[0],ball.v[1])),held:!!(ball.held||ball.motor),vis:ball.material&&ball.material.transparent&&ball.material.opacity<0.999?0:1,
   k:F.kids?['kemi','emeka'].map(k=>{const c=F.kids[k];return [r3h(c.pos[0]),r3h(c.pos[1]),r3h(c.vmove37||0),c.mode];}):null,ai:AI.on&&players[1]?[r3h(players[1].g.position.x),r3h(players[1].g.position.z)]:null,
   p:[0,1].map(i=>players[i]?[r3h(players[i].g.position.x),r3h(players[i].g.position.z)]:null),
   w:walkers.filter(w=>w.g.visible&&inKeep37(w.g.position.x,w.g.position.z)).length,kk:keke?[r3h(keke.position.x),keke.dir,inKeep37(keke.position.x,keke.position.z)?1:0]:null,body:document.body.classList.contains('football37-match')?1:0,ko:F.keepOff?1:0,
   v:views.map(i=>{const p=players[i].g.position,bd=Math.hypot(ball.position.x-p.x,ball.position.z-p.z),pb=proj37(i,ball.position.x,0.22,ball.position.z),pg=proj37(i,P.x2,0.3,P.zc),A=F.arrows37[i]||{ball:{},goal:{}},C=F.cam37[i]||{};
    const vp=v21Viewport(i),pf=proj37(i,p.x,players[i].y||0,p.z),ph=proj37(i,p.x,(players[i].y||0)+1.65,p.z),px=pf.py-ph.py,chip=shown37(i,/^fb37-score/),strip=F.state==='ended'?shown37(i,/^fb37-strip/):null,hint=shown37(i,/^fb37-hint/);
    return [r1h(bd),pb.inside?1:0,r1h(pb.ang),pg.inside?1:0,r1h(pg.ang),A.ball.show?1:0,A.ball.ang,A.goal.show?1:0,A.goal.ang,C.kept?1:0,r1h(px),C.floor||0,+v21Dist[i].toFixed(4),chip?chip.className:'',strip?strip.innerHTML:'',hint?hint.innerHTML:'',C.qKept?1:0];})};
  MT37.frames.push(fr);};
 // a stand-in for the v35 sound bus: a context that records what is connected to the master, and an AudioContext spy
 var AUD37={conn:0,made:0,on:false,keep:null};var audioStub37=on=>{if(!AUD37.keep)AUD37.keep={ctx:AUDIO35.ctx,master:AUDIO35.master,on:AUDIO35.on};AUD37.on=on;const M={connect(){}},param=()=>({setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
  const node=()=>({frequency:param(),gain:param(),type:'',buffer:null,connect(n){if(n===M)AUD37.conn++;},start(){},stop(){}});
  AUDIO35.ctx={state:'running',currentTime:0,sampleRate:44100,createOscillator:node,createGain:node,createBiquadFilter:node,createBufferSource:node,createBuffer:(c,n)=>({getChannelData:()=>new Float32Array(n)})};AUDIO35.master=M;AUDIO35.on=()=>AUD37.on;
  window.AudioContext=function(){AUD37.made++;};window.webkitAudioContext=window.AudioContext;};
 var audioRestore37=()=>{if(AUD37.keep){AUDIO35.ctx=AUD37.keep.ctx;AUDIO35.master=AUD37.keep.master;AUDIO35.on=AUD37.keep.on;AUD37.keep=null;}};
 // the cost counter: blocked() and levelAt() calls made inside football37Step (the module's step only)
 var COST37={in:false,b:0,l:0};if(typeof football37Step==='function'){const st=football37Step;football37Step=function(){COST37.in=true;try{return st.apply(this,arguments);}finally{COST37.in=false;}};
  const bl=blocked;blocked=function(){if(COST37.in)COST37.b++;return bl.apply(this,arguments);};const lv=levelAt;levelAt=function(){if(COST37.in)COST37.l++;return lv.apply(this,arguments);};}`);
 return h;}

const r3=v=>Math.round(v*1000)/1000,r2=v=>Math.round(v*100)/100;

// the checks: each returns a deterministic summary or throws
function checks(h,only,side){const {run}=h,J=c=>JSON.parse(run('JSON.stringify((()=>{const v=('+c+');return v===undefined?null:v;})())'));const out=[];
 const check=(n,fn)=>{if(only&&!only.includes(n))return;const name=NAMES[n];
  try{const info=fn();out.push({n,name,passed:true,info});}catch(e){const m=String(e&&e.message||e).replace(/(?:\/[\w.@~-]+){2,}(?::\d+)*/g,'…').split('\n'),gen=e&&e.generatedMessage&&'actual' in e?' '+JSON.stringify(e.actual)+' vs '+JSON.stringify(e.expected):'';out.push({n,name,passed:false,failure:(m[0]+gen).slice(0,400)});}
  try{run('ONF37=null;BOT37.on=false;KB37.on=false;noKeys37();overlayOn37(false);DT37=1000/30;window.__DT_MAX=undefined;NET.on=false;NET.isHost=true;AI.on=false;TRACE37.on=false;');}catch(e){}};
 // one kick from the open street: place the player and the resting ball, hold the key for n frames (0: a one-frame tap), return the launch
 const kick=(i,opts)=>{opts=opts||{};const x=opts.x===undefined?-4:opts.x,z=opts.z===undefined?10.2:opts.z,f=opts.face||[1,0];run('restBall37(400)');
  run(`at37(${i},${x},${z},${JSON.stringify(f)});at37(${1-i},${opts.ox===undefined?-4:opts.ox},${opts.oz===undefined?13.0:opts.oz},[0,-1]);ballAt37(${x+f[0]*0.62},${z+f[1]*0.62});frames37(2);`);
  if(opts.input)run(`lastInput[${i}]=${JSON.stringify(opts.input)};`);
  const t0=J('tnow37()');run(`press37(${i});frames37(1);`);if(opts.input)run(`lastInput[${i}]=${JSON.stringify(opts.input)};`);
  if(opts.repeat){for(let k=1;k<opts.hold;k++){if(k>=12)run(`act[${i}]=true;`);run('frames37(1)');}}else if(opts.hold>1)run(`frames37(${opts.hold-1})`);
  run(`release37(${i});frames37(1);`);const ks=J(`evs37('kick',${t0})`);const k=ks[0]||null;if(!k)return {ks,k:null};
  let travel=null,stopT=null;if(opts.travel){const a=k.at;const n=J('restBall37(200)');const b=J('bpos37()');travel=Math.hypot(b[0]-a[0],b[1]-a[1]);stopT=n<0?null:(n+1)/30;}
  return {ks,k,travel,stopT,t0};};
 const angDeg=(a,b)=>Math.acos(Math.max(-1,Math.min(1,(a[0]*b[0]+a[1]*b[1])/(Math.hypot(a[0],a[1])*Math.hypot(b[0],b[1])))))*180/Math.PI;

 // check 12's before-discovery measurement runs first, in a world no other check has touched (so the run without the module compares
 // like with like); its assertions are reported by check 12
 const fnv12=s=>{let h=2166136261>>>0;for(let k=0;k<s.length;k++){h^=s.charCodeAt(k);h=Math.imul(h,16777619)>>>0;}return h.toString(16);};
 let pre12=null;if(!only||only.includes(12)){try{pre12=(()=>{const R={};
  // before discovery: the same household and walk as the run without the module (compared by the parent), and these on their own
  run('fresh37(3,10);');
  const base={tick:J('TICK_HOOKS.length'),cue:J('CUE35_HOOKS.length'),recipes:J('Object.keys(AUDIO35.recipes)'),lines:J('Object.keys(LINES35).map(k=>k+":"+(Array.isArray(LINES35[k])?LINES35[k].length:Object.keys(LINES35[k]).length))')};
  run(`var BL37=[];{let s=12345;const rn=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};for(let k=0;k<3000;k++){const x=-31+62*rn(),z=-24+40*rn(),r=0.1+0.4*rn(),o=blocked(x,z,r);BL37.push(o?1:0);}}`);
  const blk=J('BL37.join("")');run('at37(0,-24,-18,[1,0]);at37(1,-22,-16,[1,0]);frames37(2);');/* the bare plot behind the square: nothing there to walk into */let minB=9,minP=99;const cams=[],labels=[];
  for(let f=0;f<600;f++){const dir=[[1,0],[0,1],[-1,0],[0,-1]][Math.floor(f/75)%4];run(`setKeys37(0,${JSON.stringify(dir)});setKeys37(1,${JSON.stringify([-dir[0],dir[1]])});frames37(1);`);
   const q=J("[Math.min(...[0,1].map(i=>Math.hypot(players[i].g.position.x-ball.position.x,players[i].g.position.z-ball.position.z))),Math.min(...[0,1].map(i=>Math.hypot(players[i].g.position.x+23.3,players[i].g.position.z-9.8))),v21Dist.map(d=>+d.toFixed(5)),[0,1].map(i=>hotspotCache[i]?hotspotCache[i].label:'')]");
   minB=Math.min(minB,q[0]);minP=Math.min(minP,q[1]);cams.push(q[2].join(','));labels.push(q[3].join('|'));}
  run('noKeys37();');assert(minB>1.5&&minP>12,'the walk kept away from the ball and the pitch: '+[minB,minP]);
  run('openMenu();');const menu=J('panel.innerHTML');run('closePanel();openLife34("today");');const today=J('panel.innerHTML');run('closePanel();');
  const st=J('JSON.stringify(S)'),keys=J('[Object.keys(S).join(),Object.keys(S.life||{}).join()]');
  const {worldSig}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));const sig=worldSig(J('benchBoxes36(0,0,1e4,{}).map(b=>[b.x1,b.x2,b.z1,b.z2])'));
  side.inert12=fnv12([sig,blk,st,cams.join(';'),labels.join(';'),menu,today,JSON.stringify(base),JSON.stringify(keys)].join('\n'));if(process.env.PARTS37)side.parts={sig,blk,st,cams,labels,menu,today,base,keys};
  assert(!J('!!(S.life&&S.life.football37)'),'no football record before discovery');assert.deepEqual(J('S.ball'),[0,13.5],'S.ball untouched');  assert(!/monkey post|Street football/i.test(menu+today),'the Menu and Today say nothing of monkey post before discovery');
  assert.equal(J('ball.userData.football37'),'panels','the panelled ball');R.before={walkFrames:600,blockedPoints:3000,boxesNow:sig,digest:side.inert12};
  return {R};})();}catch(e){pre12={error:e};}}
 check(1,()=>{run('fresh37(3,10);');
  assert.equal(J("(()=>{let w=0;ball.traverse(o=>{if(o.material&&(Array.isArray(o.material)?o.material.some(m=>m.wireframe):o.material.wireframe))w++;});return w;})()"),0,'no wireframe under the ball');
  const g=J('[ball.geometry.parameters.radius,ball.geometry.parameters.widthSegments,ball.geometry.parameters.heightSegments,!!ball.material.map,ball.userData.football37]');
  assert.equal(g[0],0.22,'radius');assert(g[1]>=16&&g[2]>=12,'segments '+g[1]+'x'+g[2]);assert.equal(g[3],true,'the panel texture');assert.equal(g[4],'panels');
  const dark=J('fb().texStats.dark');assert(dark>=0.18&&dark<=0.32,'dark share '+dark);
  assert(Math.abs(J('ball.position.y')-0.22)<=0.001,'rests at 0.22');
  const r=kick(0,{hold:12});assert(r.k,'a kick');let worst=0;for(let k=0;k<30;k++){run('frames37(1)');const d=J("(()=>{const s=scene.children.find(o=>o.userData&&o.userData.football37==='shadow');return s?Math.hypot(s.position.x-ball.position.x,s.position.z-ball.position.z):9;})()");worst=Math.max(worst,d);}
  assert(worst<=0.001,'the shadow follows: '+worst);
  // an old (v36) save: the default ball, no football record
  run("restBall37(400);{const o=JSON.parse(JSON.stringify(S));delete o.ball;o.ball=[0,13.5];if(o.life)delete o.life.football37;localStorage.setItem(KEY,JSON.stringify(o));}S=load();enterWorld();closePanel();frames37(2);");
  const o=J("[ball.userData.football37,ball.geometry.parameters.radius,(()=>{let w=0;ball.traverse(x=>{if(x.material&&x.material.wireframe)w++;});return w;})(),ball.children.length,r3(ball.position.x),r3(ball.position.z),r3(ball.position.y),!!(S.life&&S.life.football37)]".replace(/r3\(/g,'(v=>Math.round(v*1000)/1000)('));
  assert.deepEqual(o,['panels',0.22,0,0,0,13.5,0.22,false],'the old save: '+JSON.stringify(o));
  return {radius:g[0],segments:[g[1],g[2]],dark,shadowWorst:worst,oldSave:'panels at (0, 13.5)'};});

 check(2,()=>{run('fresh37(3,10);');const R={};
  const tap=kick(0,{hold:0,travel:true});assert(tap.k,'the tap kicks');assert.equal(tap.ks.length,1,'one kick');assert(Math.abs(tap.k.speed-5)<=0.15,'tap speed '+tap.k.speed);
  assert(tap.travel>=3.6&&tap.travel<=4.1,'tap travel '+tap.travel);assert(angDeg(tap.k.dir,[1,0])<=2,'tap direction');R.tap=[tap.k.speed,r3(tap.travel)];
  const h40=kick(0,{hold:12});assert(h40.k&&Math.abs(h40.k.speed-7.5)<=0.3,'0.40 s: '+(h40.k&&h40.k.speed));R.h40=h40.k.speed;
  const h70=kick(0,{hold:21,travel:true});assert(h70.k&&Math.abs(h70.k.speed-11)<=0.2,'0.70 s: '+(h70.k&&h70.k.speed));assert(h70.travel>=9.7&&h70.travel<=10.7,'0.70 s travel '+h70.travel);R.h70=[h70.k.speed,r3(h70.travel)];
  const auto=kick(0,{hold:60});assert(auto.k,'auto-release kicks');const at=r3(auto.k.t-auto.t0-1/30);assert(Math.abs(at-0.95)<=0.04,'auto-release at '+at);assert(Math.abs(auto.k.speed-11)<=0.2);R.auto=at;
  const rep=kick(0,{hold:21,repeat:true});assert.equal(rep.ks.length,1,'one kick with auto-repeat presses');assert(Math.abs(rep.k.speed-11)<=0.2,'auto-repeat: '+rep.k.speed);R.repeat=rep.k.speed;
  const p2t=kick(1,{hold:0,ox:-4,oz:13});assert(p2t.k&&p2t.k.who==='p1'&&Math.abs(p2t.k.speed-5)<=0.15,'P2 tap');const p2h=kick(1,{hold:21,ox:-4,oz:13});assert(p2h.k&&Math.abs(p2h.k.speed-11)<=0.2,'P2 hold');R.p2=[p2t.k.speed,p2h.k.speed];
  // the trap: charging and walking east for 0.9 s (the charge auto-releases at 0.95 s)
  run("restBall37(400);at37(1,-4,13,[0,-1]);at37(0,-4,10.2,[1,0]);ballAt37(-3.38,10.2);frames37(2);press37(0);frames37(1);");const c=J('combo37(1,0)');let worstNear=9,worstFar=0;const p0=J('pos37(0)');
  for(let k=0;k<26;k++){run(`setKeys37(0,${JSON.stringify(c)});frames37(1);`);const d=J('Math.hypot(ball.position.x-players[0].g.position.x,ball.position.z-players[0].g.position.z)');if(k>=3){worstNear=Math.min(worstNear,d);worstFar=Math.max(worstFar,d);}}
  const p1=J('pos37(0)'),spd=Math.hypot(p1[0]-p0[0],p1[1]-p0[1])/(26/30);run("setKeys37(0,null);release37(0);frames37(2);");
  assert(worstFar<=0.7,'the trap keeps the ball within 0.7 m: '+worstFar);assert(worstNear>=0.55-1e-6,'never inside the legs: '+worstNear);assert(spd<=0.56*3.4,'walking while charging '+spd);R.trap=[r3(worstNear),r3(worstFar),r3(spd)];
  // a release with the ball 1.7 m away (the player put there by hand mid-charge): no kick
  run("restBall37(400);at37(0,-4,10.2,[1,0]);ballAt37(-3.38,10.2);frames37(2);");const t1=J('tnow37()');run("press37(0);frames37(3);at37(0,-3.38-1.7,10.2,[1,0]);frames37(2);release37(0);frames37(2);");
  assert.equal(J(`evs37('kick',${t1}).length`),0,'no kick from 1.7 m');assert(J(`evs37('whiff',${t1}).length`)>=1,'a whiff');
  // a press with the ball 1.1 m away (just past the prompt's 1.0 m, as when it rolls on after the 0.25 s prompt refresh) still starts the charge
  run("restBall37(400);at37(0,-4,10.2,[1,0]);ballAt37(-3.2,10.2);frames37(10);");const kp0=J('hotspotCache[0]&&hotspotCache[0].id');run("ballAt37(-2.9,10.2);");const t1b=J('tnow37()');run("press37(0);frames37(5);release37(0);frames37(2);");assert.equal(kp0,'kick37','the Kick prompt at 0.8 m');
  assert.equal(J(`evs37('kick',${t1b}).length`),1,'a press with the ball 1.1 m away kicks');
  // a pass to a standing receiver 6 m away, 25 degrees off the facing
  const rx=-3.38+6*Math.cos(25*Math.PI/180),rz=10.2-6*Math.sin(25*Math.PI/180);
  const pass=(hold,recvRun)=>{run(`restBall37(400);at37(0,-4,10.2,[1,0]);ballAt37(-3.38,10.2);at37(1,${recvRun?recvRun.x:rx},${recvRun?recvRun.z:rz},[0,-1]);frames37(2);`);const t0=J('tnow37()');
   run(`press37(0);frames37(1);`);let closest=9,vAt=null,owned=false;
   for(let k=1;k<Math.max(hold,1);k++){if(recvRun)run(`setKeys37(1,${JSON.stringify(recvRun.keys)});`);run('frames37(1)');}
   run('release37(0);');let vPrev=null;for(let k=0;k<90;k++){if(recvRun)run(`setKeys37(1,${JSON.stringify(recvRun.keys)});`);const pb=J('[bpos37(),pos37(1)]');run('frames37(1)');const nb=J('[bpos37(),pos37(1),fb().owner?fb().owner.key:null]');
    const d=Math.hypot(nb[0][0]-nb[1][0],nb[0][1]-nb[1][1]),v=Math.hypot(nb[0][0]-pb[0][0],nb[0][1]-pb[0][1])*30;if(d<closest){closest=d;if(vAt===null&&d<=0.6)vAt=vPrev===null?v:vPrev;}if(d>0.6)vPrev=v;if(nb[2]==='p1')owned=true;}
   run('setKeys37(1,null);frames37(1);');return {k:J(`evs37('kick',${t0})[0]`),closest,vAt,owned};};
  const st=pass(0);assert(st.k&&st.k.kind==='pass','a tap with a teammate in the cone is a pass: '+(st.k&&st.k.kind));assert(st.closest<=0.6,'reaches the standing receiver: '+st.closest);assert(st.vAt>=0.8&&st.vAt<=2.5,'arrives at '+st.vAt);R.standing=[r3(st.closest),r2(st.vAt)];
  // a receiver 5 m away running across the pass line at 3.4 m/s on P2's keys (arrow down: south-south-east)
  const dn=J('rawOf37(0,1)'),sx=-3.38+4.7,sz=10.2-1.7;const rn=pass(0,{x:sx,z:sz,keys:[0,1]});
  assert(rn.k&&rn.k.kind==='pass','a pass to the runner');assert(rn.closest<=0.8,'meets the running receiver: '+rn.closest);assert(rn.owned,'the runner takes it');R.running=[r3(rn.closest),rn.owned,[r3(dn[0]),r3(dn[1])]];
  const lt=pass(9);assert(lt.k&&lt.k.kind==='pass','a 0.30 s press is still a pass: '+(lt.k&&lt.k.kind));assert(lt.closest<=0.6,'the long tap reaches: '+lt.closest);R.longTap=[lt.k.speed,r3(lt.closest)];
  const tt=kick(0,{hold:6,input:'touch'});assert(tt.k&&tt.k.kind==='kick'&&Math.abs(tt.k.speed-5)<=0.15,'a 0.20 s touch press is a 5 m/s kick: '+JSON.stringify(tt.k&&[tt.k.kind,tt.k.speed]));R.touch=tt.k.speed;
  return R;});

 check(3,()=>{run('fresh37(3,10);');const R={};
  // zig-zag: D, then D+S, alternating every 0.5 s for 6 s, starting with the ball in front
  const zig=(seq,secs,st)=>{const d0=J(`rawOf37(${seq[0][0]},${seq[0][1]})`);run(`restBall37(400);at37(1,-4,14.4,[0,-1]);at37(0,${st[0]},${st[1]},${JSON.stringify(d0)});ballAt37(${st[0]}+${d0[0]}*0.62,${st[1]}+${d0[1]}*0.62);frames37(2);`);
   let mx=0,sum=0,n=0;for(let f=0;f<secs*30;f++){const s=seq[Math.floor(f/15)%seq.length];run(`setKeys37(0,${JSON.stringify(s)});frames37(1);`);if(f>=10){const d=J('Math.hypot(ball.position.x-players[0].g.position.x,ball.position.z-players[0].g.position.z)');mx=Math.max(mx,d);sum+=d;n++;}}
   run('setKeys37(0,null);frames37(2);');if(process.env.DBG37)console.error('zig',JSON.stringify(J('[ball.held,!!ball.glide,!!ball.fade,!!ball.motor,fb().noQualifyUntil,fb().t,fb().kickBy,fb().state,players[0].moving,fb().persons.map(p=>[p.key,p.speed])]')));return {max:mx,mean:sum/n};};
  const z=zig([[1,0],[1,1]],6,[-30,10.5]);assert(z.max<=1.1,'zig-zag max gap '+z.max);assert(z.mean<=0.9,'zig-zag mean gap '+z.mean);R.zigzag=[r3(z.max),r3(z.mean)];
  const s=zig([[1,1]],4,[-30,7.5]);assert(s.mean<=0.85,'straight mean gap '+s.mean);R.straight=r3(s.mean);
  run('restBall37(400);at37(0,-4,10.2,[1,0]);ballAt37(-3.4,10.2);frames37(2);');const b0=J('bpos37()');run('frames37(60)');const b1=J('bpos37()');const mv=Math.hypot(b1[0]-b0[0],b1[1]-b0[1]);
  assert(mv<0.01,'a standing player 0.60 m away moves it '+mv);R.standing=r3(mv);
  // the stairs: dribbling north up the stair foot from z 10.6
  run('restBall37(400);at37(1,-4,14.4,[0,-1]);at37(0,6.7,10.6,[0,-1]);ballAt37(6.7,10.0);frames37(2);');let lvlOwned=0,climbed=0,up=false;
  for(let f=0;f<150;f++){run(`setKeys37(0,combo37(0,-1));frames37(1);`);const q=J("[players[0].lvl||0,fb().owner?fb().owner.key:null,levelAt(ball.position.x,ball.position.z)]");if(q[0]>0){up=true;if(q[1]==='p0')lvlOwned++;}if(q[2]>0.05)climbed++;}
  run('setKeys37(0,null);frames37(2);');assert(up,'the player climbed the stairs');assert.equal(lvlOwned,0,'nobody owns the ball once the player is up');assert.equal(climbed,0,'the ball never climbs');R.stairs={up,climbed};
  // the same-side chase: both run from the same side at a loose ball, 0.3 m apart
  run('restBall37(400);at37(0,-29,8.85,[1,0]);at37(1,-29,9.15,[1,0]);ballAt37(-26.5,9.3);frames37(2);');const c=J('combo37(1,0)');let vmax=0,flips=0,changes=0,prevOwner=J('fb().owner?fb().owner.key:null'),prevV=null,pops=0;const tc=J('tnow37()');
  for(let f=0;f<60;f++){const pb=J('bpos37()');run(`setKeys37(0,${JSON.stringify(c)});setKeys37(1,${JSON.stringify(c)});frames37(1);`);const nb=J('bpos37()'),v=[(nb[0]-pb[0])*30,(nb[1]-pb[1])*30],sp=Math.hypot(v[0],v[1]);vmax=Math.max(vmax,sp);
   if(prevV&&sp>0.3&&Math.hypot(prevV[0],prevV[1])>0.3&&angDeg(prevV,v)>150)flips++;prevV=sp>0.3?v:prevV;const o=J('fb().owner?fb().owner.key:null');if(o!==prevOwner){if(o)changes++;prevOwner=o;}}
  pops=J(`evs37('challenge',${tc}).length`);run('noKeys37();frames37(2);');
  assert(vmax<=4.0,'the ball never shoots off: '+vmax);assert(changes-pops<=1,'owner changes '+changes+' (challenges '+pops+')');assert(flips<=2,'direction flips '+flips);R.chase={vmax:r2(vmax),changes,pops,flips};
  // the challenge: P2 faces the ball in P1's path, more than 1 s after P1 took it
  // (P2 runs beside P1, 0.45 m to the side and 0.1 m ahead, facing the ball; humans pass through each other outside a match)
  const c2=[1,0],d2=J('rawOf37(1,0)'),sd=[d2[1],-d2[0]];run(`restBall37(400);at37(0,-29,12.0,${JSON.stringify(d2)});at37(1,-29+${d2[0]}*0.1+${sd[0]}*0.45,12.0+${d2[1]}*0.1+${sd[1]}*0.45,${JSON.stringify(d2)});ballAt37(-29+${d2[0]}*0.62,12.0+${d2[1]}*0.62);frames37(2);`);let pop=null,popF=-1,gapT=null;const t2=J('tnow37()');const frames=[];
  // after the pop P1 stops and P2 goes after the ball (the harness's walking bot)
  for(let f=0;f<150;f++){const pb=J('bpos37()');run(pop?`setKeys37(0,null);walk37(1,ball.position.x,ball.position.z,0.05);frames37(1);`:`setKeys37(0,${JSON.stringify(c2)});setKeys37(1,${JSON.stringify(c2)});frames37(1);`);const nb=J('[bpos37(),fb().owner?fb().owner.key:null]');frames.push([nb[1],Math.hypot(nb[0][0]-pb[0],nb[0][1]-pb[1])*30]);
   if(!pop){const e=J(`evs37('challenge',${t2})`);if(e.length){pop=e[0];popF=f;}}else if(gapT===null&&nb[1]){gapT=(f-popF)/30;break;}}
  run('noKeys37();frames37(2);');assert(pop,'P2 takes it with a challenge');assert.equal(pop.who,'p1');const gained=J(`evs37('owner',${t2}).find(e=>e.who==='p0')`);assert(gained&&pop.t-gained.t>=1.0-1e-6,'not within 1 s of P1 taking it: '+(gained&&r3(pop.t-gained.t)));const popV=frames[popF][1];assert(Math.abs(popV-3.0)<=0.1,'pops at '+popV);
  assert(gapT!==null&&Math.abs(gapT-0.6)<=0.04,'nobody owns it for '+gapT+' s');R.challenge={pop:r2(popV),free:r3(gapT)};
  // two releases on the same frame, both within reach: one kick, by the nearer
  run('restBall37(400);at37(0,-4,10.2,[1,0]);at37(1,-2.6,10.2,[-1,0]);ballAt37(-3.4,10.25);frames37(2);');const t3=J('tnow37()');run("press37(0);press37(1);frames37(4);release37(0);release37(1);frames37(2);");
  const ks=J(`evs37('kick',${t3})`);assert.equal(ks.length,1,'one kick: '+ks.length);const near=J('[Math.hypot(-4+3.4,0.05),Math.hypot(-2.6+3.4,0.05)]');assert.equal(ks[0].who,near[0]<near[1]?'p0':'p1','the nearer kicks');R.both=ks[0].who;
  // recorded, not gated: head-on
  run('restBall37(400);at37(0,-29,9.8,[1,0]);at37(1,-23,9.8,[-1,0]);ballAt37(-26,9.8);frames37(2);');const t4=J('tnow37()');
  for(let f=0;f<45;f++)run(`setKeys37(0,combo37(1,0));setKeys37(1,combo37(-1,0));frames37(1);`);run('noKeys37();frames37(2);');R.headOn={owners:J(`evs37('owner',${t4}).map(e=>e.who)`).slice(0,8),challenges:J(`evs37('challenge',${t4}).length`)};
  return R;});

 check(4,()=>{run('fresh37(3,10);');const R={};
  // a free 5 m/s tap: stops within 2.3 s, travel within 5% of the closed form 3.73 m
  const tap=kick(0,{hold:0,travel:true});const cf=5/0.8-1.25*Math.log((5+1.25)/1.25)/0.8;assert(tap.stopT<=2.3,'stops after '+tap.stopT);assert(Math.abs(tap.travel-cf)/cf<=0.05,'travel '+tap.travel+' against '+cf);R.tap=[r3(tap.travel),r3(cf),r2(tap.stopT)];
  // the vestibule wall square-on (facing north): the bounce keeps 0.55 of the normal speed
  run('restBall37(400);at37(1,-4,14,[0,-1]);at37(0,-0.7,8.3,[0,-1]);ballAt37(-0.7,7.68);frames37(2);');const tb=J('tnow37()');run('press37(0);frames37(1);release37(0);');let vin=null,vout=null,prev=J('ball.v.slice()');
  for(let f=0;f<60;f++){run('frames37(1)');const v=J('ball.v.slice()');if(prev[1]<0&&v[1]>0){vin=-prev[1];vout=v[1];break;}prev=v;}
  const wall=J(`evs37('wall',${tb})`);assert(vin&&vout,'it bounced');const ratioFrame=vout/vin;assert(ratioFrame>=0.45&&ratioFrame<=0.6,'frame ratio '+ratioFrame);
  assert(wall.length>=1,'the bounce is recorded');const ratio=wall[0].vout/wall[0].vin;assert(Math.abs(ratio-0.55)<=0.03,'bounce ratio '+ratio);R.bounce=[r3(ratio),r3(ratioFrame)];
  // no tunnelling and no early bounce: six 11 m/s shots (the flat-front wall, a stair rail, the palm at -9.8, 8.0)
  const shots=[{n:'flat wall',x:-5,z:9.6,f:[0,-1],face:7.15,axis:1,side:1},{n:'flat wall 2',x:-3.5,z:9.6,f:[0,-1],face:7.15,axis:1,side:1},
   {n:'stair rail',x:3.2,z:8.0,f:[1,0],face:5.9,axis:0,side:-1},{n:'stair rail 2',x:3.2,z:9.0,f:[1,0],face:5.9,axis:0,side:-1},
   {n:'palm east face',x:-6.0,z:8.0,f:[-1,0],face:J("(()=>{const o=OBS.find(o=>o.tag==='palm'&&o.x1<-9.7&&o.x2>-9.9&&o.z1<8&&o.z2>8);return o?o.x2:-9.6;})()"),axis:0,side:1},
   {n:'palm west face',x:-13.0,z:8.0,f:[1,0],face:J("(()=>{const o=OBS.find(o=>o.tag==='palm'&&o.x1<-9.7&&o.x2>-9.9&&o.z1<8&&o.z2>8);return o?o.x1:-10;})()"),axis:0,side:-1}];
  R.shots=[];
  for(const s of shots){run(`restBall37(400);at37(1,-4,14.5,[0,-1]);at37(0,${s.x},${s.z},${JSON.stringify(s.f)});ballAt37(${s.x+s.f[0]*0.62},${s.z+s.f[1]*0.62});frames37(2);`);const t0=J('tnow37()');
   run('press37(0);frames37(21);release37(0);');let inside=0,beyond=0,gap=null;
   for(let f=0;f<90;f++){run('frames37(1)');const q=J('[bpos37(),!!blocked(ball.position.x,ball.position.z,0.011)]');if(q[1])inside++;const c=q[0][s.axis];if(s.side>0?c<s.face:c>s.face)beyond++;}
   const w=J(`evs37('wall',${t0})`)[0];if(w)gap=Math.abs(w.at[s.axis]-s.face)-0.22;
   assert.equal(inside,0,s.n+': inside a collider on '+inside+' frames');assert.equal(beyond,0,s.n+': beyond it');assert(w,s.n+': it bounced');assert(gap<=0.1+0.02,s.n+': bounced '+gap+' m short of contact');R.shots.push([s.n,r3(gap)]);}
  // a frame hitch (one 0.15 s frame) at full speed: still never through
  run('restBall37(400);at37(0,-5,9.6,[0,-1]);ballAt37(-5,8.98);frames37(2);press37(0);frames37(21);release37(0);frames37(1);window.__DT_MAX=0.2;DT37=200;frames37(1);DT37=1000/30;window.__DT_MAX=undefined;');
  const hz=J('[ball.position.z,!!blocked(ball.position.x,ball.position.z,0.011)]');assert(hz[0]>7.15&&!hz[1],'through the wall on a hitch: '+JSON.stringify(hz));run('frames37(30)');assert(J('ball.position.z')>7.15,'stays on the street side');R.hitch=r3(hz[0]);
  // the stair foot: a 6 m/s ball rolled north never climbs and bounces
  run('restBall37(400);at37(0,6.7,11.6,[0,-1]);ballAt37(6.7,10.98);frames37(2);');const ts=J('tnow37()');run('press37(0);frames37(8);release37(0);');let climb=0,bounced=false,pv=J('ball.v[1]');
  for(let f=0;f<60;f++){run('frames37(1)');const q=J('[levelAt(ball.position.x,ball.position.z),ball.v[1]]');if(q[0]>0.05)climb++;if(pv<0&&q[1]>0)bounced=true;pv=q[1];}
  const sk=J(`evs37('kick',${ts})[0]`);assert(sk&&Math.abs(sk.speed-6)<=0.2,'6 m/s: '+(sk&&sk.speed));assert.equal(climb,0,'never on the stairs');assert(bounced,'it bounces off the stair foot');R.stairFoot={speed:sk.speed,bounced};
  // buried: the crate pushed onto the ball, then the furniture rebuilt
  run('restBall37(400);at37(0,-4,10.2,[1,0]);ballAt37(1.0,11.0);frames37(2);');const bb=J('bpos37()');run('crate.position.x=1.0;crate.position.z=11.0;rebuildFurniture();');let freeAt=null;
  for(let f=0;f<45;f++){run('frames37(1)');const q=J('[!!blocked(ball.position.x,ball.position.z,0.22),bpos37()]');if(!q[0]&&freeAt===null)freeAt=(f+1)/30;}const ba=J('bpos37()');
  assert(freeAt!==null&&freeAt<=1.0,'free after '+freeAt);assert(Math.hypot(ba[0]-bb[0],ba[1]-bb[1])<=1.5,'within 1.5 m');run('crate.position.x=-1.75;crate.position.z=1.0;S.crate=[-1.75,1.0];');R.buried=[freeAt,r3(Math.hypot(ba[0]-bb[0],ba[1]-bb[1]))];
  // the west edge: a shot west from x -29
  run('restBall37(400);at37(0,-28.4,9.8,[-1,0]);ballAt37(-29.02,9.8);frames37(2);press37(0);frames37(21);release37(0);');let pos=0,minx=0;
  for(let f=0;f<90;f++){run('frames37(1)');const q=J('[ball.position.x,ball.v[0]]');if(q[1]>0)pos++;minx=Math.min(minx,q[0]);}
  assert(minx>=-30.5,'stops at '+minx);assert.equal(pos,0,'vx never turns positive');R.west=r3(minx);
  return R;});

 check(5,()=>{run('fresh37(3,10);');const R={};
  // the photo spot (3, 12.5): the nearer of the photo spot and the ball wins
  run('restBall37(400);at37(1,-4,10,[0,-1]);at37(0,3,12.0,[0,-1]);ballAt37(3.9,12.0);frames37(2);');const a=J('hotspotCache[0]&&hotspotCache[0].label');assert(/photo/i.test(a),'the photo spot wins: '+a);
  run('ballAt37(3.0,11.6);frames37(2);');const b=J('hotspotCache[0]&&hotspotCache[0].label');assert.equal(b,J('fb().LINES.ui.kick'),'the ball nearer wins: '+b);R.photo=[a,b];
  // the pepper pot with the bench placed, the ball beside the pot point
  run("life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i95',type:'bench',x:0,y:4,rot:0,pose36:'out'});save();S=load();enterWorld();closePanel();frames37(1);");
  run('at37(0,-5.6,6.35,[0,1]);at37(1,-5.2,4.4,[0,1]);ballAt37(-5.0,6.55);frames37(3);');const pot=J('[hotspotCache[0]&&hotspotCache[0].label,Math.hypot(ball.position.x+5.6,ball.position.z-6.35)]');
  assert(/pepper pot|Harvest your peppers/.test(pot[0]),'the pot wins: '+pot[0]);assert(pot[1]<=1.0,'the ball is within reach: '+pot[1]);R.pot=pot[0];
  // a bench holder in ready beside the ball, and a day-1 sofa carrier, never get Kick
  run('fresh37(3,10);ACTIONS.bench36Start();ACTIONS.close();');const e1=J('benchEnd36(BENCH36.pose,1,1.05)'),e0=J('benchEnd36(BENCH36.pose,0,1.05)');
  run(`at37(0,${e1[0]},${e1[1]});at37(1,${e0[0]},${e0[1]});frames37(2);press37(0);frames37(3);release37(0);frames37(2);`);assert.equal(J('BENCH36.state'),'ready','the bench is in hand');
  run(`ballAt37(${e1[0]}+0.5,${e1[1]}+0.3);frames37(3);`);const hold=J('[hotspotCache[0]&&hotspotCache[0].label,Math.hypot(ball.position.x-players[0].g.position.x,ball.position.z-players[0].g.position.z)]');
  assert(hold[1]<=1.0&&hold[0]!==J('fb().LINES.ui.kick'),'a bench holder gets '+hold[0]);run('ACTIONS.bench36Cancel&&ACTIONS.bench36Cancel();closePanel();');
  run("dispatch('newgame');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupstep',{v:'p0'});dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();frames37(2);");
  const sp=J('S.sofa.state');run('{const e0=sofaEnd(0),e1=sofaEnd(1);at37(0,e0[0],e0[1]);at37(1,e1[0],e1[1]);}frames37(1);press37(0);press37(1);frames37(2);release37(0);release37(1);frames37(2);');
  const carrying=J('!!(sofa&&sofa.carrying)');if(carrying){run('{const q=pos37(0);ballAt37(q[0]+0.5,q[1]+0.2);}frames37(2);');}
  const sofaHot=J('hotspotCache[0]&&hotspotCache[0].label');assert(carrying,'the sofa is carried ('+sp+')');assert(sofaHot!==J('fb().LINES.ui.kick'),'a sofa carrier gets '+sofaHot);R.carriers=[hold[0],sofaHot];
  // the square's goal: nothing before discovery
  run('fresh37(3,10);');assert.equal(J('!!(S.life&&S.life.football37)'),false,'not yet discovered');
  {const w=J('rawOf37(-1,-1)');run(`restBall37(400);at37(1,-17,1.5,[0,-1]);at37(0,-19.9,-3.4,${JSON.stringify(w)});ballAt37(-19.9+${w[0]}*0.62,-3.4+${w[1]}*0.62);frames37(2);TOASTS=[];`);
   for(let f=0;f<24;f++)run('setKeys37(0,[-1,-1]);frames37(1);');run('setKeys37(0,null);frames37(30);');assert(J('ball.position.x')<-21.3,'dribbled through the square goal: '+J('ball.position.x'));}
  assert.equal(J('!!(S.life&&S.life.football37&&S.life.football37.square)'),false,'no count before discovery');assert.equal(J("TOASTS.filter(t=>/square/.test(t)).length"),0,'no toast before discovery');
  // after discovery: a shot from (-17, -3.5) west through it
  run('restBall37(400);at37(0,-4,10.2,[1,0]);ballAt37(-3.38,10.2);frames37(2);press37(0);frames37(1);release37(0);frames37(2);');assert(J('!!(S.life&&S.life.football37)'),'discovered by a kick');
  run('restBall37(400);at37(1,-23.0,-3.6,[1,0]);at37(0,-17,-3.5,[-1,0]);ballAt37(-17.62,-3.5);frames37(2);TOASTS=[];');const t0=J('tnow37()');run('press37(0);frames37(14);release37(0);');
  // P2 sends it straight back the moment it reaches them: a second crossing within 2 s does not count
  let back=false;for(let f=0;f<75;f++){run('frames37(1)');if(!back&&J('Math.hypot(ball.position.x-players[1].g.position.x,ball.position.z-players[1].g.position.z)')<=0.95){run('press37(1);frames37(1);release37(1);');back=true;}}
  const sq=J(`evs37('square',${t0})`),cross=J(`evs37('kick',${t0}).map(e=>e.who)`);
  assert.equal(J('S.life.football37.square'),1,'one goal at the square');assert(J("TOASTS.some(t=>t===fbFill37(fb().LINES.toasts.square,{n:1}))"),'the toast: '+J('TOASTS'));
  assert(J("LOG35.has(S.day,'ball','square')"),'the log line');assert(back,'P2 sent it back');assert.equal(sq.length,1,'not a second goal within 2 s');R.square={count:1,kicks:cross};
  return R;});

 check(6,()=>{run('fresh37(3,15+35/60);fb().matchNo=60;');const R={};
  run('at37(0,-25.8,11.6,[0,-1]);at37(1,-21.5,11.2,[0,-1]);ballAt37(-22.5,12.0);frames37(2);');
  // traffic: a street walker at x -27 heading east, one at x -16.5 heading west, one on the square's diagonal, one coming from the east; the keke in KEEP heading west
  run('traffic37([[2,-27,9.6,1,1.3],[3,-16.5,8.0,1,1.5],[5,-26.8,5.8,1,1.2],[2,-9,9.6,0,1.6]],-20,-1);frames37(3);');
  for(let k=0;k<120&&!J('!!(fb()&&fb().kids&&fb().state==="idle")');k++)run('frames37(1)');assert(J('!!(fb()&&fb().kids)'),'the children are out');
  const kemi=J('fb().kids.kemi.pos');run(`walkTo37(0,${kemi[0]+1.1},${kemi[1]+0.2},0.2,300);frames37(1);`);
  const before=J('walkers.map(w=>[w.g.position.x,w.g.position.z,seen37(w.g.position.x,1.0,w.g.position.z),inKeep37(w.g.position.x,w.g.position.z)])');
  // per-frame trace from the press: walkers and the keke in KEEP, the state, the cairns and their children, the ball and the AI in the keke's lane
  run(`TRACE37.on=true;TRACE37.frames=[];traceFrame37=()=>{const F=fb();if(!F)return;const kk=keke?[+keke.position.x.toFixed(3),keke.dir]:null;
   TRACE37.frames.push({t:+F.t.toFixed(3),s:F.state,w:walkers.filter(w=>inKeep37(w.g.position.x,w.g.position.z)).length,k:kk,kin:keke?inKeep37(keke.position.x,keke.position.z):false,
    c:F.mesh.cairns.map(c=>c.g.visible?1:0),cd:F.mesh.cairns.map(c=>{const kid=F.kids&&F.kids[c.by];return kid?+Math.hypot(kid.pos[0]-c.pos[0],kid.pos[1]-c.pos[1]).toFixed(3):9;}),
    b:[+ball.position.x.toFixed(3),+ball.position.z.toFixed(3)],bv:+Math.hypot(ball.v[0],ball.v[1]).toFixed(3),ai:F.kids?['kemi','emeka'].map(k=>+F.kids[k].pos[1].toFixed(3)):[]});};ONF37=traceFrame37;`);
  run("var GP37=[];football37On('goal',()=>{const r=v=>+v.toFixed(2);GP37.push([pos37(0).map(r),pos37(1).map(r),bpos37().map(r),fb().kids.kemi.pos.map(r),fb().kids.emeka.pos.map(r)]);});");
  const t0=J('tnow37()');run('press37(0);frames37(1);release37(0);');assert.equal(J('fb().state'),'setout','Act beside Kemi starts the set-out');
  const ho=J('fb().handoffs');R.handoffs=ho.map(h=>({from:h.from,seen:h.seen}));
  for(const h of ho){const b=before.find(q=>Math.abs(q[0]-h.from[0])<0.06&&Math.abs(q[1]-h.from[1])<0.06);assert(b,'a moved walker was a walker');if(!h.seen)assert.equal(b[2],false,'a walker moved off-view was in a view: '+JSON.stringify(h));}
  assert(ho.some(h=>!h.seen),'one walker handed off out of view');assert(ho.some(h=>h.seen),'one walker in view walks out');
  for(let k=0;k<400&&!J("evs37('kickoffwait').length");k++)run('frames37(1)');      // the set-out (cairns by 4.0 s, the road clear by 11 s)
  const tr=J('TRACE37.frames');const appear=[null,null,null,null];for(const f of tr)for(let k=0;k<4;k++)if(appear[k]===null&&f.c[k]){appear[k]={t:r3(f.t-t0),d:f.cd[k]};}
  for(let k=0;k<4;k++){assert(appear[k],'cairn '+k+' placed');assert(appear[k].d<=0.6,'cairn '+k+' appeared with its child '+appear[k].d+' m away');assert(appear[k].t<=4.0+1e-6,'cairn '+k+' down at '+appear[k].t);}
  const cz=J("fb().mesh.cairns.map(c=>{c.g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(c.g);return [c.g.position.x,c.g.position.z,b.max.y-b.min.y];})"),posts=[[-28.8,8.6],[-28.8,11.0],[-17.8,8.6],[-17.8,11.0]];
  for(let k=0;k<4;k++){assert(Math.hypot(cz[k][0]-posts[k][0],cz[k][1]-posts[k][1])<=0.001,'cairn '+k+' at its post');assert(Math.abs(cz[k][2]-0.48)<=0.02,'cairn height '+cz[k][2]);}
  const sl=J("(()=>{const s=scene.children.find(o=>o.userData&&o.userData.football37==='slipper');if(!s)return null;s.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(s);return [s.position.x,s.position.z,b.max.y];})()");
  assert(sl,'Emeka’s slippers are out');assert(sl[2]<0.05,'on the ground: '+sl[2]);assert(sl[0]>-17.8,'outside the east goal');
  assert.equal(J("scene.children.filter(o=>o.userData&&o.userData.football37==='line').length"),6,'six line decals');
  const zone=J("(()=>{const Z=fb().ZONE;let n=0,bad=0;for(let x=Z.x1;x<=Z.x2+1e-9;x+=0.1)for(let z=Z.z1;z<=Z.z2+1e-9;z+=0.1){n++;if(blocked(x,z,0.33,{noBench:true}))bad++;}return [n,bad];})()");assert.equal(zone[1],0,'ZONE blocked at '+zone[1]+' of '+zone[0]+' points');
  const ko=J("evs37('kickoffwait')[0]");assert(ko,'kick-off');assert(ko.waited<=11+1e-6,'kick-off waited '+ko.waited);R.setout={cairns:appear.map(a=>a.t),waited:ko.waited,zonePoints:zone[0]};
  // the match: kept going (a keeper and a clearer) until the keke has been through, then played out
  run('botsOn37("wall","wall",6);ONF37=()=>{botStep37();traceFrame37();};');let motor=false;for(let k=0;k<200&&!motor;k++){run('frames37(30)');motor=J("evs37('motor').some(e=>e.on===false)");if(J('fb().state')==='ended'||J('fb().state')==='idle')break;}
  assert(motor,'the keke came through once ("Motor!") within the match: '+JSON.stringify(J("[fb().state,fb().score,+fb().playT.toFixed(1),fb().kekeAt,fb().stats&&fb().stats.goals.map(g=>g.who+'@'+g.playT),GP37]")));run('BOT37.style=["attack","attack"];');
  for(let k=0;k<400&&J('fb().state')!=='ended';k++)run('frames37(30)');assert.equal(J('fb().state'),'ended','the match ends');const tEnd=J('tnow37()');
  run('frames37(240)');const T=J('TRACE37.frames');run('ONF37=null;TRACE37.on=false;');
  // walkers off KEEP from 11 s after the set-out until the clearing; the keke inside KEEP only during "Motor!", once
  let wIn=0,kOut=0,lane=0,turns=[],kicks=J("evs37('kick',"+t0+").filter(e=>e.who!=='p0'||true)");const ms=J("evs37('motor').filter(e=>e.on)"),me=J("evs37('motor').filter(e=>!e.on)");
  const shoutT=J("fb().shouts.filter(s=>s.text===fb().LINES.shouts.motor).map(s=>s.t)"),oya=J("fb().shouts.filter(s=>s.text===fb().LINES.shouts.oya).map(s=>[s.t,s.who])");
  let firstIn=null,prevK=null;for(const f of T){if(f.t>=t0+11&&f.s!=='clearing'&&f.s!=='idle'&&f.w>0)wIn++;if(f.kin&&f.s!=='motor'&&f.s!=='setout')kOut++;if(f.kin&&firstIn===null&&f.t>ko.t)firstIn=f.t;
   if(prevK&&prevK[1]<0&&f.k&&f.k[1]>0&&f.s!=='motor')turns.push(f.k[0]);prevK=f.k;
   if(f.s==='motor'&&ms.length&&f.t>=ms[0].t+1.5){const L=[9.4,11.8];for(const z of f.ai)if(z>L[0]&&z<L[1])lane++;}}
  assert.equal(wIn,0,'walkers inside KEEP after 11 s on '+wIn+' frames');assert.equal(kOut,0,'the keke in KEEP outside "Motor!" on '+kOut+' frames');
  assert.equal(ms.length,1,'one "Motor!" a match');assert(shoutT.length>=1&&firstIn!==null&&shoutT[0]<=firstIn,'"Motor!" before the keke entered KEEP');
  const mk=J(`evs37('kick',${ms[0].t}).filter(e=>e.t>${ms[0].t}&&e.t<=${me[0].t})`).length;           // (a kick on the very frame the keke is let through comes first)
  assert.equal(mk,0,'no kick while the keke passes');
  const held=T.filter(f=>f.s==='motor'&&f.t>=ms[0].t+1.2);assert(held.length>0&&held.every(f=>f.bv<0.001&&(f.b[1]<=9.4-0.22+0.31||f.b[1]>=11.8+0.22-0.31||true)),'the ball rests while it passes: '+JSON.stringify(held.filter(f=>f.bv>=0.001).slice(0,4)));
  const lastHeld=held[held.length-1];assert(lastHeld.b[1]<=9.4||lastHeld.b[1]>=11.8,'the ball is out of the lane: '+lastHeld.b[1]);
  assert.equal(lane,0,'an AI in the keke’s lane on '+lane+' frames');assert(oya.some(o=>Math.abs(o[0]-me[0].t)<0.05&&o[1]==='kemi'),'"Oya!" from Kemi as it goes');
  const kx=T.find(f=>f.t>=me[0].t-0.001);assert(kx&&kx.k[0]>=-15.4-0.2&&kx.k[1]>0,'released as the keke passes x -15.4 going east: '+JSON.stringify(kx&&kx.k));
  assert(turns.length>=1&&turns.every(x=>Math.abs(x+14.6)<=0.3),'the keke turns at x -14.6 outside "Motor!": '+JSON.stringify(turns));
  const tagged=J("(()=>{const out=[];scene.traverse(o=>{if(o.userData&&o.userData.football37&&!['panels','shadow','kid','kidball'].includes(o.userData.football37)){let p=o.parent,inKid=false;while(p){if(p.userData&&p.userData.football37==='kid')inKid=true;p=p.parent;}if(!inKid)out.push(o.userData.football37);}});return out;})()");
  assert.deepEqual(tagged,[],'3 s after the end only the ball, its shadow and the children are tagged: '+JSON.stringify(tagged));
  R.match={motor:[r3(ms[0].t-t0),r3(me[0].t-ms[0].t)],turns:turns.length,score:J('fb().score'),end:r3(tEnd-t0)};return R;});

 /* ---------- engineer B's checks (7, 9, 10, 12) ---------- */
 // one recorded series of matches (cached, so checks 7 and 10 share the same trace): a fresh local pair, the screen, the street's traffic
 // placed the same way every time, then matches started by real keys (P1 walks to Kemi and presses E) with the two human bots, every frame
 // recorded by mtFrame37 from the start key to the end of the clearing
 const SERIES={},TEAM=k=>k==='kemi'||k==='emeka'?'b':k?'a':null,fnv=s=>{let h=2166136261>>>0;for(let k=0;k<s.length;k++){h^=s.charCodeAt(k);h=Math.imul(h,16777619)>>>0;}return h.toString(16);};
 const PLAY=new Set(['kick','goal','out','post','owner','challenge','restart','kickoff','motor','banner','end']);
 const series=(key,o)=>{if(SERIES[key])return SERIES[key];
  run(`fresh37(${o.day},${o.time});screen37(${o.w},${o.h},${!!o.touch});fb().matchNo=0;at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);traffic37([[2,-9,9.6,0,1.4],[3,-12,8.0,1,1.5],[4,-6,13.2,1,1.3]],-6,-1);frames37(25);`);
  const out=[];for(let m=1;m<=o.n;m++){const st=J('startMatch37()');if(st!=='setout'){out.push({start:st});break;}const t0=J("evs37('start').slice(-1)[0].t");
   if(o.kbot)run(`MT37={frames:[]};kbOn37(${o.kbot+m});ONF37=()=>{kbStep37();mtFrame37();};`);
   else run(`MT37={frames:[]};botsOn37(${JSON.stringify(o.styles?o.styles[0]:'attack')},${JSON.stringify(o.styles?o.styles[1]:'attack')},${m});ONF37=()=>{botStep37();mtFrame37();};`);
   const maxF=o.maxPlay?Math.round(o.maxPlay*30):14000;let n=0;for(;n<maxF&&J("!['ended','idle','off'].includes(fb().state)");n+=30)run('frames37(30)');
   if(!o.maxPlay)for(let k=0;k<400&&J("fb().state!=='idle'");k+=10)run('frames37(10)');
   const rec=J(`(()=>{const F=fb();return {frames:MT37.frames,events:F.events.filter(e=>e.t>=${t0}),result:F.result,score:F.score,playT:+F.playT.toFixed(3),goals:F.stats.goals,shouts:F.shouts.filter(s=>s.t>=${t0})};})()`);
   run('botsOff37();kbOff37();MT37=null;if(fb().state!=="idle"&&fb().state!=="off"){ACTIONS.football37Stop();frames37(2);}at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(10);');
   rec.t0=t0;rec.digest=fnv(JSON.stringify(rec.events.filter(e=>PLAY.has(e.ev)).map(e=>[Math.round((e.t-t0)*30),e.ev,e.who||e.team||e.to||e.kind||null,e.at||e.spot||null])));out.push(rec);}
  return (SERIES[key]=out);};
 const ZN={x1:-30.4,x2:-16.8,z1:6.6,z2:12.8},PT={x1:-28.8,x2:-17.8,z1:7.0,z2:12.6,zc:9.8,half:1.2};
 const shotOn=e=>{if(!(e.dir[0]<0))return false;const t=(PT.x1-e.at[0])/e.dir[0],z=e.at[1]+e.dir[1]*t;return Math.abs(z-PT.zc)<=0.82;};
 const shotErr=e=>angDeg(e.dir,[PT.x1-e.at[0],e.aimZ-e.at[1]]);

 check(7,()=>{const R={};run('audioStub37(false);AUD37.conn=0;AUD37.made=0;');const tw0=J('Object.assign({},fb()?fb().twins37:{})'),rk0=J('Object.keys(AUDIO35.recipes).join()');
  const S7=series('desk',{day:8,time:10,w:1280,h:800,n:5});assert(S7.length===5&&S7.every(m=>m.frames),'five matches were played: '+JSON.stringify(S7.map(m=>m.start||m.result)));
  let wins=0,aiScored=0,kidShots=[],allEv=[];R.matches=[];const KSP=J('[fb().KIDS.kemi.speed,fb().KIDS.emeka.speed]');
  // (v37 merge) a child's planned kick fires only on its own ball or a free one within reach: never on a ball someone else holds (DOD F1)
  for(const [mi,M] of S7.entries()){let o=null;for(const e of M.events){if(e.ev==='owner'){o=e;continue;}if(e.ev!=='kick'||TEAM(e.who)!=='b')continue;const prev=o&&Math.abs(o.t-e.t)<1e-6&&o.who===null?o.from:(o?o.who:null);
   assert(!prev||prev===e.who,'match '+(mi+1)+': '+e.who+'\'s planned '+e.kind+' took '+prev+'\'s ball at '+e.t);}}
  for(const [mi,M] of S7.entries()){const E=M.events,F=M.frames,res=M.result;allEv=allEv.concat(E);
   // each match ends first to 3 within 300 s of play, or by the cap
   assert(res&&(res.a===3||res.b===3||res.last||res.result==='unfinished'),'match '+(mi+1)+' did not end first to 3 or by the cap: '+JSON.stringify(res));assert(M.playT<=300+60+1,'match '+(mi+1)+' play '+M.playT);
   if(res.result==='won')wins++;if(res.b>0)aiScored++;
   // every goal is a crossing of the line between the posts on the ball's own path (the street's call: a human kick off a cairn just before)
   const goals=E.filter(e=>e.ev==='goal');for(const g of goals){if(g.how==='street'){assert(E.some(e=>e.ev==='post'&&e.t<=g.t&&g.t-e.t<=0.6),'a street call without a post');continue;}
    const k=F.findIndex(f=>f.t>=g.t-1e-6&&f.s==='goal');assert(k>0,'the goal frame');const a=F[k-1].b,b=F[k].b,X=g.team==='a'?PT.x2:PT.x1;
    assert(g.team==='a'?(a[0]<X+0.0006&&b[0]>=X-0.0006):(a[0]>X-0.0006&&b[0]<=X+0.0006),'goal '+JSON.stringify(g)+' without a crossing: '+JSON.stringify([a,b]));const zc=a[1]+(b[1]-a[1])*(X-a[0])/((b[0]-a[0])||1e-9);assert(Math.abs(zc-PT.zc)<PT.half,'crossed outside the posts at '+zc);}
   for(let k=1;k<F.length;k++){const a=F[k-1],b=F[k];if(a.s!=='live'||b.s!=='live'||a.held||b.held)continue;for(const [X,dir] of [[PT.x2,1],[PT.x1,-1]])if((b.b[0]-X)*dir>0.0006&&(a.b[0]-X)*dir<0){const zc=a.b[1]+(b.b[1]-a.b[1])*(X-a.b[0])/((b.b[0]-a.b[0])||1e-9);assert(Math.abs(zc-PT.zc)>=PT.half,'a crossing between the posts with no goal at t '+b.t);}}
   // every out restarts inside the pitch (0.6 m in, 2 m from the goal lines) for the team that did not touch last
   for(const o of E.filter(e=>e.ev==='out')){const lt=E.slice(0,E.indexOf(o)).filter(e=>e.ev==='touch').slice(-1)[0],want=lt?(TEAM(lt.who)==='a'?'b':'a'):'b';assert.equal(o.team,want,'the restart team after '+JSON.stringify(lt));
    const r=E.find(e=>e.ev==='restart'&&e.t>=o.t);if(r){assert(r.spot[0]>=PT.x1+2-1e-6&&r.spot[0]<=PT.x2-2+1e-6&&r.spot[1]>=PT.z1+0.6-1e-6&&r.spot[1]<=PT.z2-0.6+1e-6,'restart spot '+JSON.stringify(r.spot));assert.equal(r.team,want);}}
   // the celebration lasts 2.5 s; the summary shows in both halves
   const st=E.filter(e=>e.ev==='state');for(let k=0;k<st.length-1;k++)if(st[k].to==='goal'){const d=st[k+1].t-st[k].t;assert(Math.abs(d-2.5)<=0.1,'celebration '+d);}
   const ended=F.filter(f=>f.s==='ended');assert(ended.length&&ended.some(f=>f.v.length===2&&f.v.every(v=>/(Full time|Last goal wins|Unfinished)/.test(v[14]))),'the summary in both halves');
   // calm, measured: no child challenge within 1 s of a human gaining the ball; one child's challenges 3 s apart (2 s for Kemi while the humans lead by 2)
   const ch=E.filter(e=>e.ev==='challenge'&&TEAM(e.who)==='b'&&TEAM(e.from)==='a');for(const c of ch){const g=E.filter(e=>e.ev==='owner'&&e.who===c.from&&e.t<=c.t).slice(-1)[0];assert(g&&c.t-g.t>=1.0-1e-6,'a child challenged within 1 s: '+JSON.stringify([c,g]));}
   for(const who of ['kemi','emeka']){const cs=ch.filter(c=>c.who===who);for(let k=1;k<cs.length;k++){const f=F.find(x=>x.t>=cs[k].t)||F[F.length-1],serious=who==='kemi'&&f.sc[0]-f.sc[1]>=2;assert(cs[k].t-cs[k-1].t>=(serious?2.0:3.0)-1e-6,who+' challenged again after '+(cs[k].t-cs[k-1].t));}}
   for(const f of F){if(!f.k)continue;for(let j=0;j<2;j++){const [x,z,sp,mode]=f.k[j];if(mode!=='play')continue;assert(sp<=KSP[j]*1.01+1e-9,['kemi','emeka'][j]+' at '+sp+' m/s');assert(x>=ZN.x1-1e-6&&x<=ZN.x2+1e-6&&z>=ZN.z1-1e-6&&z<=ZN.z2+1e-6,'a child outside ZONE');}}
   // traffic on the trace: no walker inside KEEP from 11 s after the start until the clearing; the keke inside it only during "Motor!"
   const t0=F[0].t;for(const f of F){if(f.t>=t0+11&&!['clearing','idle','off'].includes(f.s))assert.equal(f.w,0,'a walker inside KEEP at '+f.t);if(f.kk&&f.kk[2]&&!['motor','setout'].includes(f.s))assert.fail('the keke inside KEEP outside "Motor!" at '+f.t);}
   kidShots=kidShots.concat(E.filter(e=>e.ev==='kick'&&e.kind==='shot'&&TEAM(e.who)==='b'));
   // Mr Bassey: no post line within 0.5 s before a goal
   for(const l of E.filter(e=>e.ev==='line'&&e.cat==='post')){const g=goals.find(g=>g.t>l.t-1e-9&&g.t-l.t<=0.5);if(g)assert.fail('a post line just before a goal: '+JSON.stringify([l,g]));}
   // a kick-off that goes to us keeps the children 2 m off until our first kick or 4 s: a body touch or a dribble flicker never ends it early
   for(const ko of E.filter(e=>e.ev==='kickoff'&&e.team==='a')){const k1=E.find(e=>e.ev==='kick'&&e.t>=ko.t),until=Math.min(k1?k1.t:1e9,ko.t+4);
    const gap=F.find(f=>f.t>ko.t+1e-6&&f.t<until-0.04&&f.s==='live'&&!f.ko);assert(!gap,'the kick-off keep-off ended at +'+(gap&&r3(gap.t-ko.t))+' s, before the first kick');}
   R.matches.push({score:[res.a,res.b],result:res.result,last:res.last,play:M.playT,goals:goals.map(g=>g.team+':'+g.who+(g.own?':og':'')),outs:E.filter(e=>e.ev==='out').length,challenges:ch.length,
    motor:E.some(e=>e.ev==='motor'),lines:E.filter(e=>e.ev==='line').length,digest:M.digest});}
  // the log and the counters
  const lg=J('LOG35.events(S.day)'),L=J('S.life.football37');assert.equal(lg.filter(e=>e.k==='match'&&e.a==='coop').length,5,'match coop x5');const ng=S7.reduce((s,m)=>s+m.goals.length,0);
  assert.equal(lg.filter(e=>e.k==='goal').length,ng,'goal x'+ng);const ft=lg.filter(e=>e.k==='fulltime').map(e=>e.a);assert(ft.length===5&&ft.every(a=>/^(won|lost|unfinished):\d+-\d+(:last)?$/.test(a)),'fulltime x5: '+JSON.stringify(ft));
  assert.equal(L.played,5);assert.equal(L.won,wins);assert.equal(L.won+L.lost+L.drawn,5);const hum=S7.reduce((s,m)=>s+m.goals.filter(g=>!g.own&&(g.who==='p0'||g.who==='p1')).length,0);assert.equal(L.goals.p0+L.goals.p1,hum,'the goal counters');
  // the album: one image memory at the first win (Mr Bassey's), and one image-free memory for the day
  const mem=J('S.memories.filter(m=>m.day===S.day).map(m=>[m.caption,"pid" in m])'),ph=mem.filter(m=>/^Mr\.? Bassey took a picture/.test(m[0])),rm=mem.filter(m=>/^Monkey post at the end of the street/.test(m[0]));
  assert.equal(ph.length,1,'one photo: '+JSON.stringify(mem));assert(ph[0][1],'the photo went through takePhoto');assert.equal(rm.length,1,'one image-free memory for the day');assert(!rm[0][1]);R.album=[ph[0][0],rm[0][0]];
  // sound and twins: with sound off every kick, post and goal still makes its twin, nothing reaches the bus and no context is made
  const tw=J('fb().twins37'),cnt=ev=>allEv.filter(e=>e.ev===ev).length;assert.equal(tw.kick-(tw0.kick||0),cnt('kick'),'kick twins');assert.equal(tw.post-(tw0.post||0),cnt('post'),'post twins');assert.equal(tw.goal-(tw0.goal||0),cnt('goal'),'goal twins');
  assert.equal(J('AUD37.conn'),0,'nothing played with sound off');assert.equal(J('AUD37.made'),0,'no AudioContext made');
  run('audioStub37(true);AUD37.conn=0;');const k1=kick(0,{hold:0});const conn=J('AUD37.conn');run('audioRestore37();');assert(k1.k&&conn>0,'with sound on the kick reaches the master bus: '+conn);assert.equal(J('Object.keys(AUDIO35.recipes).join()'),rk0,'the recipes are unchanged');
  R.twins={kick:tw.kick-(tw0.kick||0),post:tw.post-(tw0.post||0),goal:tw.goal-(tw0.goal||0),soundOnConnections:conn};
  // the children's shots: more matches of the same kind (later Saturdays) until there are 40 normal shots and 6 while showing off
  let extra=0;for(const day of [15,22,29,36])if(kidShots.filter(e=>!e.showOff).length<40||kidShots.filter(e=>e.showOff).length<6){const X=series('extra'+day,{day,time:10,w:1280,h:800,n:5});
   for(const M of X)if(M.events){const ks=M.events.filter(e=>e.ev==='kick'&&e.kind==='shot'&&TEAM(e.who)==='b');kidShots=kidShots.concat(ks);extra++;}}
  // a sixth scenario, idle human bots, when the matches above gave fewer than 6 shots while the children led by 2 (its showing-off shots only)
  let idle=0;if(kidShots.filter(e=>e.showOff).length<6){const X=series('showoff',{day:43,time:10,w:1280,h:800,n:6,styles:['idle','idle']});for(const M of X)if(M.events){kidShots=kidShots.concat(M.events.filter(e=>e.ev==='kick'&&e.kind==='shot'&&TEAM(e.who)==='b'&&e.showOff));idle++;}}
  // shots on target (the launch line crosses the goal line inside the clean window zc +/- 0.82), counted on the normal (not showing-off) shots
  const norm=kidShots.filter(e=>!e.showOff),show=kidShots.filter(e=>e.showOff),on=norm.filter(shotOn).length,share=on/Math.max(1,norm.length);
  assert(norm.length>=40&&share>=0.35&&share<=0.75,'children on target '+on+' of '+norm.length);R.kidShots={onTarget:on,shots:norm.length,extraMatches:extra,idleMatches:idle};
  // balance, pooled over twenty matches on four Saturdays (days 8, 15, 22 and 29, seeds 1-5 each), so the tune is not fitted to one day's seeds:
  // the humans win 55-85% and the children score in at least 60%; the children win the ball back from a human by a challenge at least once a
  // match on average; the median match lasts at least 35 s of play (a guard: the bots play faster than people)
  let pool=[];for(const day of [8,15,22,29]){const X=day===8?S7:series('extra'+day,{day,time:10,w:1280,h:800,n:5});assert(X.length===5&&X.every(m=>m.frames),'day '+day+': five matches');pool=pool.concat(X);}
  const pw=pool.filter(m=>m.result.result==='won').length,ps=pool.filter(m=>m.result.b>0).length,pch=pool.reduce((s,m)=>s+m.events.filter(e=>e.ev==='challenge'&&TEAM(e.who)==='b'&&TEAM(e.from)==='a').length,0),pt=pool.map(m=>m.playT).sort((a,b)=>a-b),med=(pt[9]+pt[10])/2;
  for(const M of pool)for(const g of M.events.filter(e=>e.ev==='goal'&&e.own&&TEAM(e.who)==='b')){const lt=M.events.filter(e=>e.ev==='touch'&&e.t<=g.t&&e.who===g.who).slice(-1)[0];assert(!(lt&&lt.how==='dribble'),'a child dribbled the ball over its own line: '+JSON.stringify(g));}
  // (merger) and no human carries it over our own line: no own goal by a human whose last touch was a dribble or a trap (a push by the body may still go in)
  let humanOG=0;for(const M of pool)for(const g of M.events.filter(e=>e.ev==='goal'&&e.own&&TEAM(e.who)==='a')){humanOG++;const lt=M.events.filter(e=>e.ev==='touch'&&e.t<=g.t&&e.who===g.who).slice(-1)[0];assert(!(lt&&(lt.how==='dribble'||lt.how==='trap')),'a human carried the ball over our own line: '+JSON.stringify([g,lt]));}
  assert(pw>=11&&pw<=17,'the humans won '+pw+' of 20');assert(ps>=12,'the children scored in '+ps+' of 20');assert(pch>=20,'the children won the ball back by a challenge '+pch+' times in 20 matches');assert(med>=35,'median play '+med+' s');
  R.balance={day8:{wins,aiScored},pooled:{matches:20,wins:pw,childrenScored:ps,childChallenges:pch,medianPlay:+med.toFixed(1),play:[+pt[0].toFixed(1),+pt[19].toFixed(1)],humanOwnGoals:humanOG,carriedIn:0}};
  // showing off, measured on the shots: the mean angular error while showing off is at least the normal mean + 6 degrees
  const mean=a=>a.reduce((s,e)=>s+shotErr(e),0)/Math.max(1,a.length);assert(show.length>=6,'showing-off shots: '+show.length);
  const mS=mean(show),mN=mean(norm);assert(mS>=mN+6,'showing off '+mS.toFixed(1)+' against '+mN.toFixed(1));R.showOff={shots:show.length,mean:+mS.toFixed(1),normal:+mN.toFixed(1)};
  // Mr Bassey's lines: no line repeats in a day before its category is used up (scorer-specific lines aside)
  const lines=allEv.filter(e=>e.ev==='line');assert(lines.length>=5,'Mr Bassey spoke '+lines.length+' times');const CAT=J('fb().LINES.bassey'),used={};
  for(const l of lines){const ids=(CAT[l.cat]||[]).filter(x=>!x[2]).map(x=>x[0]),k=l.id.split('-').pop(),u=used[l.cat]||(used[l.cat]=new Set());if(u.has(k)){assert(ids.every(x=>u.has(x)),'line '+l.id+' repeated before '+l.cat+' was used up');u.clear();}u.add(k);}
  R.lines=lines.length;
  // a human who keeps the ball and never kicks (a 2 m loop round the centre for 60 s, seeds 1-3) keeps it under 70% of the live frames, and the
  // children challenge for it; a child's ball is never taken by a press within reach (no challenge, no grace): the owner stays the child
  R.keepBall=[];for(const seed of [1,2,3]){run('fresh37(3,15+40/60);fb().matchNo='+(seed-1)+';at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');
   for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');run('at37(1,-27,12.3,[0,-1]);');const t0=J('tnow37()');let own=0,n=0;
   for(let f=0;f<1800;f++){const q=J('[fb().state,pos37(0),bpos37(),fb().owner&&fb().owner.key]');if(q[0]!=='live'){run('setKeys37(0,null);frames37(1)');continue;}n++;if(q[3]==='p0')own++;
    let tx,tz;if(q[3]==='p0'){const a=Math.atan2(q[1][1]-9.8,q[1][0]+23.3)+0.6;tx=-23.3+Math.cos(a)*2.2;tz=9.8+Math.sin(a)*1.8;}else{tx=q[2][0];tz=q[2][1];}run(`walk37(0,${tx},${tz},0.05);frames37(1);`);}
   const ch=J(`evs37('challenge',${t0}).filter(e=>(e.who==='kemi'||e.who==='emeka')&&e.from==='p0').length`);run('noKeys37();ACTIONS.football37Stop();frames37(2);');R.keepBall.push([seed,+(own/Math.max(1,n)).toFixed(3),ch]);
   assert(own/Math.max(1,n)<0.7,'seed '+seed+': the human kept the ball '+(100*own/Math.max(1,n)).toFixed(1)+'% of live frames');assert(ch>=1,'seed '+seed+': no child challenged');}
  R.trap=[];for(let trial=0;trial<3;trial++){run('fresh37(3,15+40/60);fb().matchNo='+trial+';at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');
   for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');run('at37(1,-28,12.3,[0,-1]);');let ok=false;for(let k=0;k<900&&!ok;k++){run('frames37(1)');ok=J("fb().state==='live'&&!!fb().owner&&fb().owner.kind==='kid'");}assert(ok,'a child gained the ball');
   const kid=J('fb().owner.key');run("{const O=fb().owner,b=bpos37();at37(0,b[0]+O.face[0]*0.9,b[1]+O.face[1]*0.9,[-O.face[0],-O.face[1]]);}");const t1=J('tnow37()');run('press37(0);frames37(1);');const after=[];for(let k=0;k<6;k++){after.push(J('fb().owner&&fb().owner.key'));run('frames37(1)');}
   run('release37(0);frames37(2);');const ks=J(`evs37('kick',${t1}).filter(e=>e.who==='p0').length`);run('ACTIONS.football37Stop();frames37(2);');R.trap.push([kid,after.join(',')]);
   assert(after.every(o=>o!=='p0'),'a press 0.9 m away took the child\'s ball: '+after.join(','));assert.equal(ks,0,'and kicked it');}
  const live=(t,seed)=>{run('fresh37(3,'+t+');fb().matchNo='+seed+';at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');};
  // an own goal by keys (P1 taps the ball into our west goal from 0.6 m; v37 merge: walking it in by the body no longer scores, check 13):
  // nobody celebrates it as theirs (P1 neither waves nor hops), the toast says only "Own goal!", no child shouts "Gooool!"; "GOAL!" shows at
  // the top of both halves and no goal sprite rises from the goal
  live(15+40/60,1);run('at37(1,-19,12.4,[0,-1]);at37(0,-27.58,9.0,[-1,0]);ballAt37(-28.2,9.0);TOASTS=[];frames37(2);');const to=J('tnow37()');let hop=0,wave=false,banner=false,sprite=false;
  run('press37(0);frames37(1);release37(0);');for(let f=0;f<150;f++){run('setKeys37(0,null);frames37(1);');const q=J("[players[0].g.position.y,(a=>!!(a&&a.loop===THREE.LoopOnce&&a.isRunning()&&a.getEffectiveWeight()>0))(players[0].g.actions&&players[0].g.actions.wave),HALF37.every(h=>h.children.some(c=>/^fb37-goal/.test(c.className)&&c.style.display!=='none'&&/GOAL!/.test(c.innerHTML))),(fb().fx37||[]).some(o=>o.kind==='goal'&&o.m.position.x<-27)]");hop=Math.max(hop,q[0]);wave=wave||q[1];banner=banner||q[2];sprite=sprite||q[3];}
  run('setKeys37(0,null);');const og=J(`evs37('goal',${to})`)[0];assert(og&&og.own&&og.who==='p0','an own goal by P1: '+JSON.stringify(og));
  const ogt=J(`evs37('touch',${to}).filter(e=>e.who==='p0'&&e.t<=${og.t})`);assert(ogt.length&&ogt[ogt.length-1].how==='kick'&&ogt.every(e=>e.how!=='dribble'&&e.how!=='trap'),'P1 kicked it in, never dribbled it in: '+JSON.stringify(ogt.map(e=>e.how)));assert(!wave&&hop<0.01,'P1 celebrated its own goal: '+JSON.stringify([wave,r3(hop)]));
  assert(J("TOASTS.includes(fb().LINES.toasts.ownGoal)"),'the own-goal toast');assert(!J(`evs37('shout',${to}).some(s=>s.text===fb().LINES.shouts.goal)`),'"Gooool!" for an own goal');assert(banner,'"GOAL!" at the top of both halves');assert(!sprite,'a goal sprite over the goal');
  R.ownGoal={celebrated:J(`fb().celeb37?fb().celeb37.who:null`)||'done',banner,touches:ogt.map(e=>e.how).join()};run('ACTIONS.football37Stop();frames37(2);');
  // (the props' fade in a match is checked in the browser: the Node world builds no palms or shrubs; see docs/TESTING_football.md)
  // Mr Bassey is a body only: a ball off him leaves the last touch with the kicker (credit, the restart); his name reads "Mr. Bassey"
  run('fresh37(3,15+40/60);fb().matchNo=3;at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');
  for(let k=0;k<600&&J("!(fb().bassey37&&fb().bassey37.phase==='spot'&&fb().state==='live')");k++)run('frames37(1)');for(let k=0;k<300&&J('!!(ball.held||ball.fade||ball.glide)');k++)run('frames37(1)');
  run('at37(1,-19,12.4,[0,-1]);at37(0,-24.2,7.92,[0,-1]);ballAt37(-24.2,7.3);frames37(3);');const tb=J('tnow37()');run('press37(0);frames37(1);release37(0);');let md=9;
  for(let k=0;k<20;k++){run('frames37(1)');md=Math.min(md,J('Math.hypot(ball.position.x-npcs.bassey.g.position.x,ball.position.z-npcs.bassey.g.position.z)'));}
  const bt=J(`evs37('touch',${tb}).filter(e=>e.who==='bassey').length`),lt=J('fb().lastTouch&&fb().lastTouch.who');assert(md<=0.53,'the ball reached Mr Bassey: '+r3(md));assert.equal(bt,0,'a touch credited to Mr Bassey');assert(lt!=='bassey','the last touch is Mr Bassey\'s');assert.equal(J("fbNameOf37('bassey')"),J('CAST.bassey.name'),'his name');R.bassey={lastTouch:lt};run('ACTIONS.football37Stop();frames37(2);');
  // the shot assist never aims into the near stone: from a tight angle beside the east goal's south stone, facing the middle of the goal, the tap
  // shot goes in past the stone; and a tap from just behind the goal line is never a shot
  live(15+40/60,4);run('frames37(45);at37(1,-19,12.4,[0,-1]);at37(0,-18.55-0.62*0.7071,11.35+0.62*0.7071,[0.7071,-0.7071]);ballAt37(-18.55,11.35);frames37(1);');const tp=J('tnow37()');run('press37(0);frames37(1);release37(0);frames37(30);');
  const pk=J(`evs37('kick',${tp}).filter(e=>e.who==='p0')[0]`),pp=J(`evs37('post',${tp}).length`),pg=J(`evs37('goal',${tp}).length`);assert(pk&&pk.kind==='shot','a shot: '+JSON.stringify(pk&&pk.kind));assert.equal(pp,0,'post hits '+pp);assert.equal(pg,1,'it goes in');R.nearPost=[pk.kind,pp,pg];run('ACTIONS.football37Stop();frames37(2);');
  live(15+40/60,4);run('frames37(45);at37(1,-19,12.4,[0,-1]);at37(0,-17.70-0.62*0.06,11.43+0.62,[-0.06,-1]);ballAt37(-17.70,11.43);frames37(1);');const tq=J('tnow37()');run('press37(0);frames37(1);release37(0);frames37(5);');
  const pk2=J(`evs37('kick',${tq}).filter(e=>e.who==='p0')[0]`);assert(pk2&&pk2.kind!=='shot','a shot from behind the goal line: '+JSON.stringify(pk2&&pk2.kind));R.behindLine=pk2.kind;run('ACTIONS.football37Stop();frames37(2);');
  // a quick rematch while Mr Bassey walks home in view: he turns back from where he is, he never pops to the entry point
  live(15+40/60,5);run('botsOn37("attack","attack",5);');for(let k=0;k<12000&&J('fb().state')!=='ended';k+=30)run('frames37(30)');run('botsOff37();');for(let k=0;k<600&&J('fb().state')!=='idle';k++)run('frames37(1)');
  run('at37(1,-23.5,7.6,[0,-1]);frames37(20);');const kp=J('fb().kids.kemi.pos');run(`walkTo37(0,${kp[0]+1.1},${kp[1]+0.2},0.2,300);frames37(1);`);const seenB=J('npcs.bassey.g.visible&&seen37(npcs.bassey.g.position.x,1,npcs.bassey.g.position.z)');
  run('press37(0);frames37(1);release37(0);');let prevB=J('[npcs.bassey.g.position.x,npcs.bassey.g.position.z,npcs.bassey.g.visible]'),jump=0;for(let k=0;k<300;k++){run('frames37(1)');const q=J('[npcs.bassey.g.position.x,npcs.bassey.g.position.z,npcs.bassey.g.visible]');if(q[2]&&prevB[2])jump=Math.max(jump,Math.hypot(q[0]-prevB[0],q[1]-prevB[1]));prevB=q;}
  assert(J('fb().state')!=='idle','the rematch started');assert(jump<0.3,'Mr Bassey jumped '+r3(jump)+' m in a frame'+(seenB?' in view':''));R.rematchBassey={inView:!!seenB,maxStep:r3(jump)};run('ACTIONS.football37Stop();frames37(2);');
  return R;});

 check(8,()=>{const R={};
  const kidsAt=(day,time,frames,opts)=>{run(`fresh37(${day},${time});`);if(opts&&opts.online)run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};");
   run(`at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(${frames});`);const k=J('fb()&&fb().kids?["kemi","emeka"].map(k=>+fb().kids[k].opacity.toFixed(3)):null');if(opts&&opts.online)run('NET.on=false;');return k;};
  assert.equal(kidsAt(3,15+29/60,15),null,'none at 15:29 on a school day');
  run('S.time=15.5;frames37(30);');assert.deepEqual(J('fb()&&fb().kids?["kemi","emeka"].map(k=>+fb().kids[k].opacity.toFixed(3)):null'),[1,1],'both faded in at 15:30');
  assert.equal(kidsAt(2,14+59/60,15),null,'none at 14:59 on a Sunday');run('S.time=15;frames37(30);');assert(J('!!fb().kids'),'there at 15:00 on a Sunday');
  assert.deepEqual(kidsAt(8,10,30),[1,1],'there at 10:00 on a Saturday');
  assert.equal(kidsAt(1,16,30),null,'none on day 1 without a flag');
  // (merger) ?football=playtest: the children from 06:00 on a Sunday; the flag is marked used for the tab; a reload (no flag in the address) keeps the
  // hours for the session without applying it again, and the first kick stores playtest; a new tab (the session gone) has the Sunday hours again
  run("fresh37(2,8);location.search='?football=playtest';fb().flags=null;at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(30);");
  const f1=J("[!!fb().kids,!!fb().flags.playtest,!!fb().flags.restored,sessionStorage.getItem('football37.flag.playtest'),sessionStorage.getItem('football37.session')]");
  assert.deepEqual(f1,[true,true,false,'1','playtest'],'the playtest flag at 08:00 on a Sunday: '+JSON.stringify(f1));
  run("location.search='';save();S=load();fb().flags=null;enterWorld();closePanel();S.time=8.5;at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(30);");
  const f2=J("[!!fb().kids,!!fb().flags.on,!!fb().flags.restored,!!fb().flags.playtest]");assert.deepEqual(f2,[true,true,true,true],'after a reload the playtest hours hold: '+JSON.stringify(f2));
  run("location.search='?football=playtest';fb().flags=null;");assert.equal(J('!!fb()&&!!football37Flags().restored'),true,'the same flag in the address again is not applied afresh (only the session hours)');run("location.search='';");
  kick(0,{hold:0,x:-4,z:11.0,ox:-4,oz:8.4});assert.equal(J('!!(S.life.football37&&S.life.football37.playtest)'),true,'playtest stored at discovery after the reload');
  run("newTab37();save();S=load();fb().flags=null;enterWorld();closePanel();S.time=8.5;at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(30);");
  assert.equal(J('!!fb().kids'),false,'a new tab: no children at 08:30 on a Sunday');R.flags={applied:f1,reloaded:f2,newTab:'Sunday hours'};
  assert.equal(kidsAt(3,16,30,{online:true}),null,'none online');
  // everyone 18 m off for 5 s
  kidsAt(3,16,30);run('at37(0,-4,10.2);at37(1,-3,10.2);frames37(140);');assert(J('!!fb().kids'),'still there before 5 s');run('frames37(50);');assert.equal(J('!!fb().kids'),false,'gone after 5 s far off');
  // the models: scale, head bone after the mixer every frame, mixers, Emeka's feet
  run('fresh37(3,16);at37(0,-4,10.2);at37(1,-3,10.2);frames37(2);');const mix0=J("(()=>{let n=0;scene.traverse(o=>{if(o.mixer)n++;});return n;})()");
  run('at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');const mix1=J("(()=>{let n=0;scene.traverse(o=>{if(o.mixer)n++;});return n;})()");
  let headBad=0,scales=null;for(let f=0;f<60;f++){run('frames37(1)');const q=J("['kemi','emeka'].map(k=>{const g=fb().kids[k].g;return [g.scale.x,g.hero&&g.hero.bones.head?g.hero.bones.head.scale.x:null];})");scales=q.map(x=>x[0]);for(const x of q)if(x[1]===null||Math.abs(x[1]-1.06)>0.01)headBad++;}
  assert.deepEqual(scales.map(v=>+v.toFixed(3)),[0.84,0.8],'scales');assert.equal(headBad,0,'the head bone at 1.06 after the mixer on every frame');assert(mix1-mix0<=2&&mix1-mix0>=1,'mixers added: '+(mix1-mix0));
  const feet=J("(()=>{const out=[];fb().kids.emeka.g.traverse(o=>{if(!o.isMesh||!o.visible)return;const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms)if(m&&(m.name==='shoe'||m.name==='sole'))out.push('#'+m.color.getHexString());});return out;})()");
  const skin='#'+J("new THREE.Color(fb().KIDS.emeka.look.skin).getHexString()");assert(feet.length>0&&feet.every(c=>c===skin),'Emeka’s shoe and sole parts are his skin: '+JSON.stringify(feet)+' '+skin);
  // the plastic ball: touches are the low points of its bounce
  let touches=0,py=null,dir=0;for(let f=0;f<300;f++){run('frames37(1)');const y=J("(()=>{const m=scene.children.find(o=>o.userData&&o.userData.football37==='kidball');return m&&m.visible?m.position.y:null;})()");
   if(y!==null&&py!==null){const d=y>py+1e-6?1:y<py-1e-6?-1:0;if(d>0&&dir<0)touches++;if(d)dir=d;}py=y;}
  assert(touches>=8,'plastic-ball touches in 10 s: '+touches);R.models={scales,mixers:mix1-mix0,feet:feet.length,touches};
  // your ball rolled near a child comes back to the nearest human
  const kp=J('fb().kids.kemi.pos');run(`restBall37(400);at37(0,${kp[0]-2.6},${kp[1]+1.0},[${2.6/2.785},${-1.0/2.785}]);at37(1,-20.5,14.0,[0,-1]);ballAt37(${kp[0]-2.6+0.62*2.6/2.785},${kp[1]+1.0-0.62/2.785});frames37(2);`);
  const tb=J('tnow37()');run('press37(0);frames37(1);release37(0);');let near=null;for(let f=0;f<120;f++){run('frames37(1)');const d=J("Math.min(...['kemi','emeka'].map(k=>Math.hypot(fb().kids[k].pos[0]-ball.position.x,fb().kids[k].pos[1]-ball.position.z)))");if(near===null&&d<=1.2)near=J('tnow37()');
   const kk=J(`evs37('kick',${tb}).filter(e=>e.who==='kemi'||e.who==='emeka')`);if(kk.length){const k=kk[0];assert(near!==null&&k.t-near<=1.5,'passed back '+(near===null?'?':r3(k.t-near))+' s after it came near');
    const p0=J('pos37(0)'),dd=[p0[0]-k.at[0],p0[1]-k.at[1]];assert(angDeg(k.dir,dd)<=30,'towards the nearest human: '+angDeg(k.dir,dd));R.passBack=r3(k.t-near);break;}}
  assert(R.passBack!==undefined,'a child passed it back');
  // the clock: 30 s of play move it 10 minutes; 30 s idle, 30
  run('fresh37(3,15+40/60);fb().matchNo=30;at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');let live=0,dLive=0;assert.equal(J('startMatch37()'),'setout');run('botsOn37("wall","wall",3);');for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');
  for(let k=0;k<6000&&live<900;k++){const a=J('[fb().state,S.time]');if(a[0]==='idle'){run('botsOff37();');assert.equal(J('startMatch37()'),'setout');run('botsOn37("wall","wall",3);');continue;}   // (another match if the children won that one)
   run('frames37(1)');const b=J('[fb().state,S.time]');if(a[0]==='live'&&b[0]==='live'){live++;dLive+=b[1]-a[1];}}
  const why=J("[fb().state,fb().score,fb().stats&&fb().stats.goals.map(g=>g.who+'@'+g.playT),fb().events.filter(e=>e.ev==='state').slice(-6).map(e=>e.to+':'+(e.why||''))]");run('botsOff37();ACTIONS.football37Stop();frames37(2);');assert.equal(live,900,'30 s of live play: '+live+' '+JSON.stringify(why));assert(Math.abs(dLive*60-10)<=0.2,'30 s of play: '+r3(dLive*60)+' minutes');
  const i0=J('S.time');assert.equal(J('fb().state'),'idle');run('frames37(900)');const dIdle=(J('S.time')-i0)*60;assert(Math.abs(dIdle-30)<=0.2,'30 s idle: '+r3(dIdle));R.clock=[r3(dLive*60),r3(dIdle)];
  // the call at 18:20: kick-offs at about 17:58, seeds 1, 2, 3... until a match reaches it undecided
  let called=null,seed=0;for(seed=1;seed<=6&&!called;seed++){run('fresh37(3,17+54.6/60);fb().matchNo='+(seed-1)+';at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');run('botsOn37("wall","wall",'+seed+');');
   for(let k=0;k<400&&J('fb().state')==='setout';k++)run('frames37(1)');const ko=J('S.time');
   for(let k=0;k<6000;k++){run('frames37(1)');const st=J('[fb().state,fb().called]');if(st[1]){called={ko,seed};break;}if(st[0]==='ended'||st[0]==='idle')break;}if(!called)run('botsOff37();');}
  assert(called,'a match reached the call undecided');const bn=J("evs37('banner').filter(e=>e.kind==='call').slice(-1)[0]");assert(bn&&Math.abs(bn.time-(18+20/60))*60<=1,'the call at '+(bn&&bn.time));
  run('frames37(2)');assert(J("HALF37.every(h=>h.children.some(c=>/Last goal wins/.test(c.innerHTML)))"),'the banner in both halves');
  assert(J("fb().shouts.some(s=>s.who==='emeka'&&s.text===fb().LINES.shouts.called)"),'Emeka is called');
  run('BOT37.style=["attack","attack"];');for(let k=0;k<4000&&J('fb().state')!=='ended';k++)run('frames37(1)');assert.equal(J('fb().state'),'ended','the next goal ends it');
  const fl=J("LOG35.events(S.day).filter(e=>e.k==='fulltime').slice(-1)[0]");assert(fl&&/:last$/.test(fl.a),'fulltime ...:last: '+JSON.stringify(fl));run('botsOff37();');
  for(let k=0;k<400&&J('fb().state')!=='idle';k++)run('frames37(1)');const ex0=J('fb().kids?fb().kids.emeka.pos[0]:null');let exMax=ex0,goneAt=null;
  for(let k=0;k<300;k++){run('frames37(1)');const q=J('fb().kids?[fb().kids.emeka.pos[0],fb().kids.emeka.gone,fb().kids.emeka.opacity]:null');if(!q||q[1]){goneAt=k;break;}exMax=Math.max(exMax,q[0]);}
  assert(ex0!==null&&exMax-ex0>=5,'Emeka runs east '+r3(exMax-ex0)+' m');assert(goneAt!==null,'and fades');
  // a reload that day (the runtime marks start afresh, as on a new page): still no children, from the saved last match
  run('save();S=load();fb().homeDay=0;fb().lastMatchDay=0;enterWorld();closePanel();S.time=17;at37(0,-23.3,10.5);at37(1,-22,10.5);frames37(60);');assert.equal(J('!!fb().kids'),false,'no children again that day, after a reload too');
  assert(!J("[0,1].some(i=>{const h=nearest(i);return h&&h.label==='Another game?';})"),'no "Another game?"');R.call={seed:called.seed,kickoff:r3(called.ko),at:r3(bn.time),result:fl.a,emeka:r3(exMax-ex0)};
  // the cap at 300 s of play (school day, 15:35): Kemi's line, no call; then 60 s with no goal ends it unfinished
  let capped=null;for(seed=1;seed<=4&&!capped;seed++){run('fresh37(3,15+35/60);fb().matchNo='+(10+seed)+';at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');
   const tc0=J('tnow37()');run('botsOn37("wall","wall",'+(20+seed)+');');for(let k=0;k<12000;k++){run('frames37(1)');const st=J('[fb().state,fb().capped]');if(st[1]){capped={seed,playT:J('fb().playT'),t0:tc0};break;}if(st[0]==='ended'||st[0]==='idle')break;}
   if(capped){const g0=J("evs37('goal').length");for(let k=0;k<2400&&J('fb().state')!=='ended';k++)run('frames37(1)');const end=J("evs37('end').slice(-1)[0]");if(!end||end.result!=='unfinished'){capped=null;}else capped.end=end;}
   run('botsOff37();ACTIONS.football37Stop();frames37(1);');}
  assert(capped,'a match reached the cap and then 60 s without a goal');const cb=J("evs37('banner').filter(e=>e.kind==='cap').slice(-1)[0]");
  assert(cb.playT>=300-1e-6&&cb.playT<=303,'the cap at '+cb.playT+' s of play (at 300 s, or on the first live frame after a restart or a celebration in progress then)');assert(J("fb().shouts.some(s=>s.who==='kemi'&&s.text===fb().LINES.shouts.cap)"),'Kemi’s cap line');
  assert(!J("evs37('banner').some(e=>e.kind==='call'&&e.t>="+capped.t0+")"),'no call');assert(!J("fb().shouts.some(s=>s.t>="+capped.t0+"&&s.text===fb().LINES.shouts.called)"),'no call line');assert(Math.abs(capped.end.playT-cb.playT-60)<=1,'unfinished at banner + '+r3(capped.end.playT-cb.playT));
  R.cap={seed:capped.seed,cap:cb.playT,unfinished:r3(capped.end.playT)};
  // the walk clip a quarter quicker above 3 m/s in a match: P2's walk advances 1.25 times as far per frame at full pace as outside one
  const walkRate=match=>{run('fresh37(3,15+40/60);at37(0,-24,12.4,[0,-1]);at37(1,-25,8.0,[1,0]);frames37(25);');if(match){assert.equal(J('startMatch37()'),'setout');for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');run('at37(1,-25,8.0,[1,0]);');}
   else run('at37(1,-4,10.2,[1,0]);at37(0,-4,13.5,[0,-1]);');run('setKeys37(1,combo37(1,0));frames37(10);');let sum=0,n=0;
   for(let k=0;k<8;k++){const a=J('(()=>{const g=players[1].g,w=g.actions&&g.actions.walk;return w?[w.time,w.getClip().duration,g.current]:null;})()');run('frames37(1)');const b=J('players[1].g.actions.walk.time');if(a&&a[2]==='walk'){let d=b-a[0];if(d<0)d+=a[1];sum+=d;n++;}}
   run('setKeys37(1,null);');if(match)run('ACTIONS.football37Stop();frames37(2);');return n?sum/n:0;};
  const wFree=walkRate(false),wMatch=walkRate(true);assert(wFree>0&&Math.abs(wMatch/wFree-1.25)<=0.03,'the walk in a match runs at '+r3(wMatch/wFree)+' of free play');R.walk=r3(wMatch/wFree);
  // the late lines at 18:01 (tomorrow a school day, Saturday, Sunday, a school day)
  R.late={};const LT=J('fb().LINES.shouts.late');for(const [day,name,want] of [[3,'Monday',LT.school],[7,'Friday',LT.sat],[8,'Saturday',LT.sun],[9,'Sunday',LT.school]]){
   run(`fresh37(${day},18+1/60);at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);`);const k=J('fb().kids&&fb().kids.kemi.pos');assert(k,name+': the children are out');run(`at37(0,${k[0]+1.0},${k[1]+0.3});frames37(2);`);
   const h=J('hotspotCache[0]&&hotspotCache[0].label');assert.equal(h,want,name+' late line');run('press37(0);frames37(1);release37(0);frames37(2);');assert.equal(J('fb().state'),'idle',name+': Act starts nothing');R.late[name]=h;}
  // (v37 merge) in playtest mode the children are out from 06:00 every day, so the late line before a school day says "Tomorrow morning!"
  run("fresh37(3,18+1/60);sessionStorage.removeItem('football37.flag.playtest');location.search='?football=playtest';fb().flags=null;at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);");const kpl=J('fb().kids&&fb().kids.kemi.pos');assert(kpl,'playtest: the children are out');
  run(`at37(0,${kpl[0]+1.0},${kpl[1]+0.3});frames37(2);`);const hp=J('hotspotCache[0]&&hotspotCache[0].label');run("location.search='';newTab37();sessionStorage.removeItem('football37.flag.playtest');fb().flags=null;");assert.equal(hp,LT.sat,'the playtest late line follows the 06:00 hours: '+hp);R.late.playtest=hp;
  return R;});

 check(9,()=>{const R={};run(`companion37(8,10);fb().matchNo=0;var GOAL37=null;{const ag=aiGoal;aiGoal=function(p,dt){const r=ag.apply(this,arguments);if(AI.on&&p&&p.i===AI.i&&fb()&&fb().state==='live')GOAL37=r;return r;};}
   at37(0,-24,12.4,[0,-1]);at37(1,-25,13.0,[0,-1]);traffic37([[2,-9,9.6,0,1.4]],-6,-1);frames37(25);`);
  let play=0,owns=0,shots=0,kidGoals=0,maxOut=0,called=null,matches=0,tries=0;const stand=[-21.5,7.5];
  for(let m=0;m<10&&play<180;m++){const st=J('startMatch37()');assert.equal(st,'setout','the match starts by real keys');matches++;const t0=J("evs37('start').slice(-1)[0].t");
   run(`walkTo37(0,${stand[0]},${stand[1]},0.2,200);`);
   if(m===0){for(let k=0;k<400&&J("fb().state")!=='live';k++)run('frames37(1)');run('GOAL37=null;');for(let k=0;k<60&&!(J('GOAL37')&&J("(()=>{const p=players[1].g.position,Z=fb().ZONE;return p.x>=Z.x1&&p.x<=Z.x2&&p.z>=Z.z1&&p.z<=Z.z2;})()"));k++)run('frames37(1)');const g=J('GOAL37');assert(g&&g.stop===0.05,'aiGoal in a match returns stop 0.05: '+JSON.stringify(g));R.stop=g.stop;}
   for(let k=0;k<20000&&!['ended','idle','off'].includes(J('fb().state'));k++){run('frames37(1)');
    const q=J("[fb().playT,players[1].g.position.x,players[1].g.position.z,fb().owner?fb().owner.key:null,Math.hypot(ball.position.x-players[0].g.position.x,ball.position.z-players[0].g.position.z),fb().state]");
    maxOut=Math.max(maxOut,Math.max(ZN.x1-q[1],q[1]-ZN.x2,ZN.z1-q[2],q[2]-ZN.z2,0));
    // "Release!": P1 presses Act away from the ball (2-8 m, no child within 1 m of the line between them) while the companion has had it for
    // 0.2 s; a press that lands as the companion loses or kicks the ball that same frame makes no call, and a call after which the companion
    // loses the ball before kicking, or whose pass a child cuts out, is tried again later
    if(!called&&q[0]>5&&q[3]==='ai'&&q[4]>2.0&&q[4]<8&&q[5]==='live'&&J("fb().t-fb().ownerSince>=0.2&&hotspotCache[0]&&hotspotCache[0].id==='call37'")&&J("(()=>{const a=bpos37(),b=pos37(0),dx=b[0]-a[0],dz=b[1]-a[1],L=dx*dx+dz*dz;return ['kemi','emeka'].every(k=>{const c=fb().kids[k].pos,u=Math.max(0,Math.min(1,((c[0]-a[0])*dx+(c[1]-a[1])*dz)/L));return Math.hypot(a[0]+dx*u-c[0],a[1]+dz*u-c[1])>1.0;});})()")){
     const tc=J('tnow37()');run('press37(0);frames37(1);release37(0);');tries++;if(J(`evs37('call',${tc}).length`)!==1){run('frames37(50)');continue;}let pass=null,near=9,lost=false;
     for(let f=0;f<120;f++){run('frames37(1)');if(!pass){const e=J(`evs37('kick',${tc}).find(e=>e.who==='ai')`);if(e)pass=e;else if(J(`evs37('challenge',${tc}).length||evs37('owner',${tc}).some(e=>e.from==='ai')`))lost=true;}if(pass)near=Math.min(near,J('Math.hypot(ball.position.x-players[0].g.position.x,ball.position.z-players[0].g.position.z)'));if(pass&&f>60)break;}
     const cut=pass&&near>0.8&&J(`evs37('touch',${pass.t}).some(e=>e.who==='kemi'||e.who==='emeka')`);                       // a child cut the pass out: not the companion's doing
     if((lost&&!pass)||cut){run(`walkTo37(0,${stand[0]},${stand[1]},0.2,200);`);continue;}
     called={pass:pass?[pass.kind,!!pass.called,r3(pass.t-tc),pass.recv]:null,near:r3(near),tries};assert(pass&&pass.kind==='pass'&&pass.called&&pass.recv==='p0'&&pass.t-tc<=1.2+1e-6,'the companion passes within 1.2 s of the call: '+JSON.stringify(called));
     assert(near<=0.8,'the pass reaches P1: '+near+' '+JSON.stringify([pass,J(`fb().events.filter(e=>e.t>=${tc}&&e.t<=${tc}+3&&['touch','owner','challenge'].includes(e.ev)).map(e=>[e.t,e.ev,e.who,e.how||e.from])`)]));run(`walkTo37(0,${stand[0]},${stand[1]},0.2,200);`);}}
   const ev=J(`fb().events.filter(e=>e.t>=${t0})`);play+=J('fb().playT');owns+=ev.filter(e=>e.ev==='owner'&&e.who==='ai').length;shots+=ev.filter(e=>e.ev==='kick'&&e.who==='ai'&&e.kind==='shot').length;kidGoals+=ev.filter(e=>e.ev==='goal'&&e.team==='b').length;
   for(let k=0;k<400&&J("fb().state")!=='idle';k++)run('frames37(1)');run('at37(0,-24,12.4,[0,-1]);frames37(10);');}
  // (merger) a companion in the courtyard when the match is set out (P1 at the pitch) is on the pitch by the kick-off, which waits for it, and
  // touches the ball within 20 s of play; the same from the roof terrace
  R.away=[];for(const [nm,x,z,lvl] of [['courtyard',0.0,0.0,0],['roof',10.0,0.0,1]]){run('companion37(8,10);fb().matchNo=0;at37(0,-24,12.4,[0,-1]);at37(1,-25,13.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');
   run(`at37(1,${x},${z},[0,1]);${lvl?`players[1].y=levelAt(${x},${z});players[1].lvl=lvlOf(players[1].y);players[1].g.baseY=players[1].y;players[1].g.position.y=players[1].y;`:''}AI.path=null;`);const ts=J("evs37('start').slice(-1)[0].t");let ko=null;
   for(let k=0;k<900&&!ko;k++){run('frames37(1)');if(J("fb().state")==='live')ko=J('[tnow37(),players[1].g.position.x,players[1].g.position.z,players[1].y||0]');}
   assert(ko,nm+': the match kicked off');const Z=J('fb().ZONE');assert(ko[1]>=Z.x1-1&&ko[1]<=Z.x2+1&&ko[2]>=Z.z1-1&&ko[2]<=Z.z2+1&&ko[3]<=0.05,nm+': the companion on the pitch at the kick-off: '+JSON.stringify(ko));
   let touch=null;for(let k=0;k<600&&!touch;k++){run('frames37(1)');const e=J(`evs37('touch',${ko[0]}).find(e=>e.who==='ai')`);if(e)touch=e;if(['ended','idle'].includes(J('fb().state')))break;}assert(touch,nm+': the companion plays the ball within 20 s');
   R.away.push({from:nm,kickoffAfter:r3(ko[0]-ts),handoffs:J(`evs37('handoff',${ts}).length`),firstTouch:r3(touch.t-ko[0])});run('ACTIONS.football37Stop();frames37(2);');}
  assert(owns>=5,'the companion had the ball '+owns+' times');assert(shots>=1,'the companion shot '+shots+' times');assert(kidGoals>=1,'the children scored '+kidGoals+' '+JSON.stringify({play:Math.round(play),matches,owns,shots,called}));assert(called,'P1 called for the ball');assert(maxOut<=0.2,'the companion left ZONE by '+maxOut);
  Object.assign(R,{play:Math.round(play),matches,owns,shots,kidGoals,called,zoneOut:r3(maxOut)});return R;});

 check(10,()=>{const R={};
  // each match in a fresh game (a child process), so the module's own clock is the same at the start of both and only the screen differs
  const fresh=(key,o)=>{const r=cp.spawnSync(process.execPath,[__filename,'--series',key,JSON.stringify(o)],{env:process.env,maxBuffer:1<<28,encoding:'utf8'});try{return JSON.parse(r.stdout.trim().split('\n').pop());}catch(e){throw new Error('the '+key+' match did not run');}};   // (no stack text in the message: the results stay the same from any checkout)
  const desk=fresh('desk1',{day:8,time:10,w:1280,h:800,n:1})[0],phone=fresh('phone',{day:8,time:10,w:844,h:390,touch:true,n:1})[0];
  assert(desk.frames&&phone.frames,'both matches ran');if(phone.digest!==desk.digest){const ev=M=>M.events.filter(e=>PLAY.has(e.ev)).map(e=>JSON.stringify([Math.round((e.t-M.t0)*30),e.ev,e.who||e.team||e.to||e.kind||null,e.at||e.spot||null]));const a=ev(desk),b=ev(phone);let k=0;while(k<a.length&&a[k]===b[k])k++;assert.fail('the match at 844x390 differs from 1280x800 from event '+k+': '+a[k]+' against '+b[k]);}
  const measure=(M,floor,need)=>{const out={};const views=M.frames[0].v.length;let dmax=0;
   for(let i=0;i<views;i++){let near=0,seen=0,dead=0,deadSeen=0,miss=0,arrowBad=0,goalOff=0,goalBad=0,kept=0,floorBad=0,qKept=0,qBad=0,minPx=1e9;
    for(let k=0;k<M.frames.length;k++){const f=M.frames[k],v=f.v[i];if(['clearing','idle','off'].includes(f.s))continue;
     if(k>0&&!['clearing','idle','off'].includes(M.frames[k-1].s)){const d0=M.frames[k-1].v[i][12],d1=v[12];dmax=Math.max(dmax,Math.abs(d1-d0)/d0);}
     if(v[9]){kept++;if(v[10]<floor-1e-6)floorBad++;}if(v[16]){qKept++;if(v[10]<floor-1e-6)qBad++;}if(f.s==='goal')minPx=Math.min(minPx,v[10]);
     if(v[0]<=7&&f.vis){near++;if(v[1])seen++;if(!['live','restart','motor'].includes(f.s)){dead++;if(v[1])deadSeen++;}}
     if(!v[1]&&f.vis){miss++;if(!v[5]||Math.abs(((v[6]-v[2])%360+540)%360-180)>15)arrowBad++;}
     if(f.s!=='ended'&&!v[3]){goalOff++;if(!v[7]||Math.abs(((v[8]-v[4])%360+540)%360-180)>15)goalBad++;}}
    const share=seen/Math.max(1,near);out['view'+i]={near,share:+share.toFixed(3),deadBall:[deadSeen,dead],offView:miss,arrowBad,goalOff,goalBad,kept,floorBad,scorerKept:qKept,scorerFloorBad:qBad,celebrationMinPx:minPx<1e9?minPx:null};
    if(need){assert(share>=need,'view '+i+': the ball in view '+(share*100).toFixed(1)+'% of near frames');assert.equal(arrowBad,0,'view '+i+': the ball arrow missing or off by more than 15 degrees on '+arrowBad+' frames');
     assert.equal(goalBad,0,'view '+i+': the goal arrow missing or wrong on '+goalBad+' frames');assert.equal(floorBad,0,'view '+i+': the person below '+floor+' px with the ball point kept on '+floorBad+' frames');assert.equal(qBad,0,'view '+i+': the person below '+floor+' px with the scorer point kept on '+qBad+' frames');assert(kept>0,'view '+i+': the ball point was used');}}
   out.maxDistChange=+dmax.toFixed(4);if(need)assert(dmax<=0.03,'the camera distance changed by '+(dmax*100).toFixed(2)+'% in a frame');return out;};
  R.desk=measure(desk,70,0.95);R.phone=measure(phone,50,0.85);
  // at 844x390 the chip is compact, on the side opposite each player card (right in the left half, left in the right half), the body class is set
  const live=phone.frames.filter(f=>f.s==='live');assert(live.length&&live.every(f=>/\bcompact\b/.test(f.v[0][13])&&/side-r/.test(f.v[0][13])&&/\bcompact\b/.test(f.v[1][13])&&/side-l/.test(f.v[1][13])),'the compact chips: '+(live[0]&&live[0].v.map(v=>v[13])));
  assert(phone.frames.filter(f=>!['clearing','idle','off'].includes(f.s)).every(f=>f.body===1),'body.football37-match during the match');assert.equal(phone.frames[phone.frames.length-1].body,0,'and not after it');
  const css=fs.readFileSync(path.join(GAME,'src','football-v37.css'),'utf8');assert(css.split('\n').some(l=>l.startsWith('@media (max-width:820px),(max-height:520px){')&&l.includes('body.football37-match .pcard .prole{display:none}')),'the role line is hidden on small screens');
  // (v37 merge) the phone prompt in a match is at least 13 px, its key glyph too (it was 12 px and the glyph 11.2 px)
  {const ln=css.split('\n').find(l=>l.includes('body.football37-match .half .pr.fb37-pr{'))||'',fs=[...ln.matchAll(/\.pr\.fb37-pr(?: \.k)?\{[^}]*font-size:(\d+(?:\.\d+)?)px/g)].map(m=>+m[1]);
   assert(fs.length===2&&fs.every(v=>v>=13),'the phone prompt and its key glyph at 13 px or more: '+JSON.stringify(fs));R.phonePromptPx=fs;}
  assert(phone.frames.some(f=>f.v.every(v=>/Tap Act: pass/.test(v[15])))&&!phone.frames.some(f=>f.v.some(v=>/Tap (E|Enter)\b/.test(v[15]))),'the short hint on the phone halves names Act, never a key');
  assert(desk.frames.some(f=>/Tap E: pass/.test(f.v[0][15])&&!/Turn the phone/.test(f.v[0][15]))&&desk.frames.some(f=>/Tap Enter: pass/.test(f.v[1][15])),'the first-match hint at 1280x800, worded for each player\'s key');
  // recorded, not gated: 60 s of the same match at 390x844; the landscape hint there
  const port=fresh('portrait',{day:8,time:10,w:390,h:844,touch:true,n:1,maxPlay:60})[0];R.portrait=measure(port,50,0);
  assert(port.frames.some(f=>f.v.every(v=>/Turn the phone sideways/.test(v[15]))),'the landscape hint for two players on a portrait phone');
  R.digest=desk.digest;return R;});

 check(11,()=>{const R={};
  // a fresh household: a 600-frame walk that never comes within 1.5 m of the ball saves nothing
  run('fresh37(3,10);at37(0,-4,9.0,[1,0]);at37(1,-4,8.0,[1,0]);frames37(2);');const b0=J('bpos37()');let minD=9;
  for(let f=0;f<600;f++){const dir=[[1,0],[0,1],[-1,0],[0,-1]][Math.floor(f/75)%4];run(`setKeys37(0,${JSON.stringify(dir)});setKeys37(1,${JSON.stringify([-dir[0],-dir[1]])});frames37(1);`);minD=Math.min(minD,J('Math.min(...[0,1].map(i=>Math.hypot(players[i].g.position.x-ball.position.x,players[i].g.position.z-ball.position.z)))'));}
  run('noKeys37();save();');assert(minD>1.5,'the walk stayed away from the ball: '+minD);assert.equal(J('!!(S.life&&S.life.football37)'),false,'no football record');assert.deepEqual(J('S.ball'),[0,13.5],'S.ball at the default');
  // the first E kick: the field and the toast; the save writes where it rests; a reload puts it there
  run('TOASTS=[];');const k1=kick(0,{hold:0,x:-4,z:11.0,ox:-4,oz:8.4});assert(k1.k,'kicked');assert(J('!!(S.life&&S.life.football37)'),'the record after the first kick');
  assert(J("TOASTS.includes(fb().LINES.toasts.firstKick)"),'the first-kick toast');run('restBall37(300);save();');const rest=J('bpos37()'),sb=J('S.ball');
  assert(Math.abs(sb[0]-rest[0])<=0.001&&Math.abs(sb[1]-rest[1])<=0.001,'S.ball '+JSON.stringify(sb)+' at rest '+JSON.stringify(rest));run('S=load();enterWorld();closePanel();frames37(2);');const re=J('bpos37()');
  assert(Math.abs(re[0]-rest[0])<=0.001&&Math.abs(re[1]-rest[1])<=0.001,'reloaded at '+JSON.stringify(re));R.saved=sb;
  // a match is never saved
  run('fresh37(3,15+40/60);at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');
  run('save();S=load();enterWorld();closePanel();');const mid=J("[fb().state,!!fb().kids,scene.children.filter(o=>o.userData&&['post','line','slipper'].includes(o.userData.football37)).length,Object.keys(S.life.football37).sort().join()]");
  assert.deepEqual(mid.slice(0,3),['off',false,0],'after a mid-match reload: no match, no cairns, no children ('+JSON.stringify(mid)+')');R.midMatch=mid.slice(0,3);
  // a v36 save loads with nothing added; the shared state has no football record
  run("fresh37(3,10);{const o=JSON.parse(JSON.stringify(S));if(o.life)delete o.life.football37;localStorage.setItem(KEY,JSON.stringify(o));}S=load();enterWorld();closePanel();");const k0=J('[Object.keys(S).sort().join(),S.life?Object.keys(S.life).sort().join():""]');
  run('frames37(60);save();');assert.deepEqual(J('[Object.keys(S).sort().join(),S.life?Object.keys(S.life).sort().join():""]'),k0,'nothing added to a v36 save');assert.equal(J('!!(S.life&&S.life.football37)'),false);
  run('life34();S.life.football37={v:2};');assert.equal(J('!!(stripState().life&&stripState().life.football37)'),false,'stripState has no football record');run('delete S.life.football37;');
  // the Menu reset; a buried ball on load escapes
  kick(0,{hold:21,x:-4,z:10.2});run('restBall37(300);TOASTS=[];openMenu();');const menu=J('panel.innerHTML');assert(menu.includes(J('fb().LINES.ui.menuHome')),'the Menu reset button');run("ACTIONS.football37BallHome();frames37(20);");
  const home=J('[bpos37(),!!blocked(ball.position.x,ball.position.z,0.22)]');assert(Math.hypot(home[0][0],home[0][1]-13.5)<=0.001&&!home[1],'the ball at home and free: '+JSON.stringify(home));
  run("save();{const o=JSON.parse(localStorage.getItem(KEY));o.ball=[-5.3,7.05];localStorage.setItem(KEY,JSON.stringify(o));}S=load();enterWorld();closePanel();frames37(15);");const bu=J('[bpos37(),!!blocked(ball.position.x,ball.position.z,0.22)]');
  assert(!bu[1]&&Math.hypot(bu[0][0]+5.3,bu[0][1]-7.05)<=1.5,'a buried ball on load escapes: '+JSON.stringify(bu));R.buried=bu[0].map(r3);
  // online: no children, no match hotspot, the Menu line; a guest has no kick and does not move the ball
  run("fresh37(3,16);life34();S.life.football37||(S.life.football37={v:2,found:3,played:0,won:0,lost:0,drawn:0,goals:{p0:0,p1:0,ai:0},square:0,streetCalls:0,last:null,said:{day:0,who:[],bassey:[]},firsts:{win:0,last:0},memDay:0,nkechiDay:0,pointed:false,hints:0,playtest:false,runs:[]});");
  run("NET.on=true;NET.isHost=true;NET.myIndex=0;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};at37(0,-24,12.4,[0,-1]);frames37(30);openMenu();");
  assert.equal(J('!!fb().kids'),false,'no children online');assert(J('panel.innerHTML').includes(J('fb().LINES.ui.menuOnline')),'the Menu line online');run('closePanel();');
  run('at37(0,-22.6,9.2);frames37(2);');const oh=J('hotspotCache[0]&&hotspotCache[0].id');assert(!/^(play37|again37|wait37)$/.test(oh||''),'no match hotspot online: '+oh);
  run('NET.isHost=false;at37(0,-4,10.2,[1,0]);ballAt37(-3.38,10.2);frames37(2);');const g0=J('[hotspotCache[0]&&hotspotCache[0].label,bpos37(),ball.userData.football37]');run('setKeys37(0,[1,0]);frames37(20);setKeys37(0,null);');const g1=J('bpos37()');
  assert(g0[0]!==J('fb().LINES.ui.kick'),'a guest gets no kick: '+g0[0]);assert.deepEqual(g1,g0[1],'the guest step does not move the ball');assert.equal(g0[2],'panels','the guest sees the panelled ball');run('NET.on=false;NET.isHost=true;');
  // the evening waits for a match and starts after it
  run('fresh37(3,17+52/60);at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');
  const pend=J('EVENING35.pending()');run('S.time=18.1;');assert.equal(J('EVENING35.start()'),false,'EVENING35.start() returns false in a match');assert.equal(J('EVENING35.pending()'),pend,'pending() unchanged');assert.equal(J('EVENING35.state'),'idle');
  run('ACTIONS.football37Stop();frames37(2);at37(0,-4.1,5.2);at37(1,-3.4,5.0);');let ev=false;for(let k=0;k<300&&!ev;k++){run('frames37(1)');ev=J("EVENING35.state!=='idle'");}assert(ev,'the evening starts after the match');R.evening='waited, then started';
  // a day change stops a match: cairns cleared, children gone, fulltime stopped
  run('fresh37(3,15+40/60);at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');
  run("dispatch('nextday');closePanel();frames37(2);");const nd=J("[scene.children.filter(o=>o.userData&&o.userData.football37==='post').length,!!fb().kids,LOG35.events(S.day-1).filter(e=>e.k==='fulltime').map(e=>e.a)]");
  assert.equal(nd[0],0,'cairns cleared');assert.equal(nd[1],false,'children gone');assert(nd[2].some(a=>/^stopped:\d+-\d+$/.test(a)),'fulltime stopped: '+JSON.stringify(nd[2]));R.dayChange=nd[2];
  // a panel opened mid-charge: no kick after it closes
  run('fresh37(3,10);restBall37(300);at37(0,-4,10.2,[1,0]);ballAt37(-3.38,10.2);frames37(2);');const tp=J('tnow37()');run("press37(0);frames37(8);openPanel('<p>x</p>');frames37(3);closePanel();release37(0);frames37(10);");
  assert.equal(J(`evs37('kick',${tp}).length`),0,'no kick after a panel');
  // the bench offer during a match is refused
  run('fresh37(3,15+40/60);at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');run('TOASTS=[];ACTIONS.bench36Start();frames37(1);');
  assert.equal(J('BENCH36.state'),'off','no delivery started');assert(J("TOASTS.includes(fb().LINES.toasts.finishGame)"),'the refusal toast');run('ACTIONS.football37Stop();frames37(1);');
  // and so is carrying it again from the Menu while the bench is placed
  run("fresh37(3,15+40/60);life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i95',type:'bench',x:0,y:4,rot:0,pose36:'out'});save();S=load();enterWorld();closePanel();frames37(1);");
  run('at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');const bp=J('BENCH36.state');
  run('TOASTS=[];ACTIONS.bench36Again();frames37(3);');assert.equal(J('BENCH36.state'),bp,'carrying the bench again does not start in a match');assert(J("TOASTS.includes(fb().LINES.toasts.finishGame)"),'refused with the toast');run('ACTIONS.football37Stop();frames37(1);');
  // (merger) a whole bench delivery with football loaded: the current route plan (check/bench-route-v36.json, read at run time) replayed by the
  // bench harness's own plan follower (the closed loop on the pose with its coast and cross-track terms, as verify-bench-v36.cjs drives it) from
  // the gate to the doorway; the clock held while it is carried; the arrangement agreed, the bench placed and sat on together
  run(`var PLAN37=${JSON.stringify(PLAN)};var FOL37={k:0,o:null};
   var follow37=plan=>{const B=BENCH36;if(B.state!=='carrying'){noKeys37();return 'idle';}const seg=plan.segments[FOL37.k];if(!seg){noKeys37();return 'done';}
    const f=B.front?1:-1,T=seg.until,wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
    // (round 2b) the offset that puts the bench's yaw on the segment's arc, from the previous segment's yaw to this one's (or nearest to it)
    if(FOL37.o===null){const prev=(FOL37.k>0?plan.segments[FOL37.k-1].until.yaw:plan.start.yaw)*Math.PI/180,to=T.yaw*Math.PI/180;
     const arcD=o=>{const a=prev+o,span=wrap(to-prev),d=wrap(B.pose.yaw-a);if(Math.abs(span)>1e-9&&Math.sign(d)===Math.sign(span)&&Math.abs(d)<=Math.abs(span))return 0;return Math.min(Math.abs(d),Math.abs(wrap(B.pose.yaw-(to+o))));};
     FOL37.o=arcD(Math.PI)<arcD(0)?Math.PI:0;}
    const tT=T.yaw*Math.PI/180+FOL37.o,m=B.mover,t=1-m;let mDir=null,tDir=null;const ux=Math.cos(tT),uz=-Math.sin(tT),e=[Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f];
    const dth=wrap(tT-B.pose.yaw),coastW=B.vel.w*B.vel.w/(2*B.WMAX/B.STOP)+Math.abs(B.vel.w)*DT37/1000;
    if(seg.op==='fwd'||seg.op==='back'){const r=(T.x-B.pose.x)*ux+(T.z-B.pose.z)*uz,coast=B.vel.s*B.vel.s/(2*B.V/B.STOP)+Math.abs(B.vel.s)*DT37/1000,ct=-(T.x-B.pose.x)*uz+(T.z-B.pose.z)*ux;
     if(Math.abs(r)<=0.012){FOL37.k++;FOL37.o=null;}else if(Math.abs(r)>coast+0.004)mDir=[ux*Math.sign(r),uz*Math.sign(r)];
     const want=wrap(dth-Math.max(-0.05,Math.min(0.05,ct*2*Math.sign(r||1))));if(Math.abs(want)>0.004&&Math.abs(want)>coastW+0.002)tDir=[e[0]*Math.sign(want),e[1]*Math.sign(want)];}
    else{if(Math.abs(dth)<=0.6*Math.PI/180){FOL37.k++;FOL37.o=null;}else if(Math.abs(dth)>coastW+0.002)tDir=[e[0]*Math.sign(dth),e[1]*Math.sign(dth)];}
    setKeys37(m,mDir?combo37(mDir[0],mDir[1]):null);setKeys37(t,tDir?combo37(tDir[0],tDir[1]):null);return 'go';};
   var drive37=(plan,n)=>{let r='go',f=0;for(;f<n;f++){r=follow37(plan);frames37(1);if(r!=='go'&&BENCH36.state!=='carrying')break;}noKeys37();return {r,f,k:FOL37.k};};`);
  run(`fresh37(2,10);BENCH36.states=[];ACTIONS.bench36Start();ACTIONS.close();
   {const B=BENCH36,FE=PLAN37.start.yaw===0?1:0,f=benchEnd36(B.pose,FE,1.1),r=benchEnd36(B.pose,1-FE,1.1);at37(0,f[0],f[1]);at37(1,r[0],r[1]);}frames37(2);press37(0);frames37(3);release37(0);press37(1);frames37(3);release37(1);`);
  assert.equal(J('BENCH36.state'),'carrying','the bench is lifted');assert.deepEqual([J('PLAN37.scheme'),J('PLAN37.world')],[PLAN.scheme,PLAN.world],'the plan in use is the current one');
  const c0=J('S.time');run('frames37(60);');const held=J('S.time')-c0;assert(Math.abs(held)<1e-9,'the clock held while the bench is carried: '+held);
  const dv=J('drive37(PLAN37,7200)');assert.equal(J('BENCH36.state'),'choosing','the bench reached the doorway: '+JSON.stringify(dv));
  run("{let g=0;while(BENCH36.choice!=='out'&&g++<4){keys['arrowright']=true;frames37(2);keys['arrowright']=false;frames37(3);}}press37(0);frames37(2);release37(0);press37(1);frames37(2);release37(1);");
  for(let k=0;k<400&&J('BENCH36.state')==='settling';k++)run('frames37(1)');assert.equal(J('BENCH36.state'),'placed','placed');
  assert.deepEqual(J('BENCH36.states.slice()'),['grounded','ready','carrying','choosing','settling','placed'],'the delivery states, as without football');
  run('noKeys37();at37(0,-5.95,6.4);at37(1,-5.4,6.5);frames37(2);');assert.equal(J('hotspotCache[0]&&hotspotCache[0].label'),'Sit on the bench together');run('press37(0);frames37(3);release37(0);frames37(2);');
  assert.equal(J("[BENCH36.state,players.every(p=>p.g.sitting)].join()"),'seated,true','sat together');run('openMenu();closePanel();frames37(2);');assert.equal(J('BENCH36.state'),'seated','the Menu keeps them seated');
  R.bench={segments:dv.k,frames:dv.f,placed:J("S.home.items.find(i=>i.type==='bench').pose36"),seated:true,clockHeld:true};
  // a match while the bench waits at the gate (a delivery started, the bench down, nobody holding it): it starts, the clock runs at a third in play,
  // the bench stays where it lies; "Carry Ada's bench again" is not on offer (no bench placed) and the Menu's bench lines and football's card are both there
  run('fresh37(3,15+40/60);ACTIONS.bench36Start();ACTIONS.close();frames37(2);');const gp=J("[BENCH36.state,BENCH36.paused,BENCH36.pose.x,BENCH36.pose.z,BENCH36.pose.yaw]");assert.equal(gp[0],'grounded','the bench waits at the gate');
  run('at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout','a match starts while the bench waits');for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');
  const tm0=J('S.time');let lf=0;for(let k=0;k<90;k++){const a=J("fb().state==='live'");run('frames37(1)');if(a&&J("fb().state==='live'"))lf++;}const rate=(J('S.time')-tm0)*60/(90/30);
  assert(lf===90&&Math.abs(rate-1/3)<0.02,'the clock at a third in play with the bench at the gate: '+rate);run('life34();openMenu();');const menuG=J('panel.innerHTML');run('closePanel();');
  assert(menuG.includes('Find the bench')&&menuG.includes(J('fb().LINES.ui.menuStop')),'the Menu has the bench lines and football\'s card');run('ACTIONS.football37Stop();frames37(2);');
  assert.deepEqual(J("[BENCH36.state,BENCH36.paused,BENCH36.pose.x,BENCH36.pose.z,BENCH36.pose.yaw]"),gp,'the bench untouched by the match');R.benchAtGate={state:gp[0],clockInPlay:+rate.toFixed(4)};
  // the companion switch is refused while the companion plays, and so is the way back (two players who switched): the match goes on as it was
  run('companion37(3,15+40/60);at37(0,-24,12.4,[0,-1]);at37(1,-25,13.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');
  run('TOASTS=[];ACTIONS.bench36Duo();frames37(2);');assert.deepEqual(J("[AI.on,S.ai,BENCH36.state,fb().state!=='idle'&&fb().state!=='off']"),[true,true,'off',true],'the companion stays in the match');
  assert(J("TOASTS.includes(fb().LINES.toasts.finishGame)"),'refused with the toast');run('ACTIONS.football37Stop();frames37(2);');
  run("life34();S.life.bench36={v:1,state:'off',pos:[4,8.6],yaw:0,mover:0,choice:'out',deliveries:0,again:false,hints:0,placedDay:null,playtest:false,runs:[]};ACTIONS.bench36Duo();ACTIONS.close();frames37(2);");assert.equal(J('AI.on'),false,'outside a match the switch works');
  assert.deepEqual(J("[!!(S.life.bench36&&S.life.bench36.duo),BENCH36.state]"),[true,'grounded'],'two players on this device, the bench at the gate');
  run('at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout','the two of them start a match');for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');
  run('TOASTS=[];ACTIONS.bench36Solo();frames37(2);');assert.equal(J('AI.on'),false,'the second player stays a player in the match');assert(J("TOASTS.includes(fb().LINES.toasts.finishGame)"),'the way back refused with the toast');
  run('ACTIONS.football37Stop();frames37(2);ACTIONS.bench36Solo();frames37(2);');assert.equal(J('AI.on'),true,'after the match the way back works');
  // (v37 merge) two players who switched stand up from the placed bench during a match: the stand-up's own hand-back waits for the match to
  // end (it ran at once, and the companion took over player 2 mid-match), then happens on its own when the match is stopped
  run("companion37(3,15+40/60);life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[],duo:{v:1,ai:true,i:AI.i,pos:[-20.5,12.0],day:3}};S.ai=false;S.home.items.push({id:'i95',type:'bench',x:0,y:4,rot:0,pose36:'out'});save();S=load();enterWorld();aiRestore();closePanel();frames37(2);");
  assert.deepEqual(J("[AI.on,BENCH36.state,!!S.life.bench36.duo]"),[false,'placed',true],'two players on this device, the bench placed');
  run('at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout','the two of them start a match');for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');
  run('noKeys37();at37(0,-5.95,6.4);at37(1,-5.4,6.5);frames37(2);');assert.equal(J('hotspotCache[0]&&hotspotCache[0].label'),'Sit on the bench together');run('press37(0);frames37(3);release37(0);frames37(2);');
  assert.equal(J("[BENCH36.state,players.every(p=>p.g.sitting)].join()"),'seated,true','they sit on the bench while the match is on');
  run('setKeys37(0,[0,1]);setKeys37(1,[0,1]);frames37(20);noKeys37();frames37(2);TOASTS=TOASTS||[];');const up=J("[BENCH36.state,AI.on,S.ai,!!S.life.bench36.duo,fb().state]");
  assert.deepEqual(up.slice(0,4),['placed',false,false,true],'standing up mid-match keeps the two players: '+JSON.stringify(up));assert(['live','goal','restart','motor','waiting'].includes(up[4]),'the match goes on: '+up[4]);
  run('TOASTS=[];ACTIONS.football37Stop();frames37(3);');const after=J("[AI.on,S.ai,!!(S.life.bench36&&S.life.bench36.duo)]");assert.deepEqual(after,[true,true,false],'the companion is back once the match is over: '+JSON.stringify(after));
  assert(J("TOASTS.some(t=>/keeping you company again/.test(t))"),'with the bench\'s own toast');
  R.companionSwitch={duoRefused:true,soloRefused:true,afterMatch:'companion back',standUpInMatch:'deferred to the end'};
  // the gates tool reads a day carrying the four new kinds with no warnings and the same grades as without them
  const G=require(path.join(__dirname,'..','tools','gates-v35.cjs'));run("fresh37(3,10);");run("LOG35.add('ball','kick');LOG35.add('match','coop');LOG35.add('goal','a:p0');LOG35.add('fulltime','won:3-1');");
  const blockWith=J('days_block35(Object.keys(S.life.days))');run("{const r=S.life.days[String(S.day)];if(r&&r.events)r.events=r.events.filter(e=>!['ball','match','goal','fulltime'].includes(e.k));}");const blockWithout=J('days_block35(Object.keys(S.life.days))');
  const an=t=>G.analyse([{name:'tester-1.txt',text:'Tester: Test\n'+t}],{testers:1});const aw=an(blockWith),ao=an(blockWithout);const warns=JSON.stringify(aw).match(/could not be read/g)||[];
  const kindsKnown=/'fulltime'/.test(fs.readFileSync(path.join(__dirname,'..','tools','gates-v35.cjs'),'utf8'));
  if(kindsKnown){assert.equal(warns.length,0,'gates warnings: '+warns.length);assert.deepEqual(aw.gates.map(g=>g.status),ao.gates.map(g=>g.status),'the same grades');R.gates={warnings:0,grades:aw.gates.map(g=>g.status)};}
  else R.gates={pending:'tools/gates-v35.cjs KINDS lacks ball, match, goal and fulltime (the integrator adds them, spec section 10)',warnings:warns.length,sameGrades:JSON.stringify(aw.gates.map(g=>g.status))===JSON.stringify(ao.gates.map(g=>g.status))};
  return R;});
 check(12,()=>{
  if(!pre12)throw new Error('check 12 was not measured');if(pre12.error)throw pre12.error;const R=pre12.R;
  // after discovery, on a football day: the morning line, the waypoint once (and never over another), the friendship, Today, Tunde's line
  kick(0,{hold:0,x:-4,z:11.0,ox:-4,oz:8.4});assert(J('!!(S.life&&S.life.football37)'),'discovered');run('restBall37(300);S.time=15+20/60;closePanel();openLife34("today");');
  const morning=J('panel.innerHTML');run('closePanel();');assert(morning.includes(J("esc(fbFill37(fb().LINES.ui.morning,{h:'3:30 pm'}))")),'the morning line');
  run("LIFE34.waypoint={x:1,z:1,name:'Somewhere else'};S.time=15.6;TOASTS=[];frames37(30);");assert.equal(J('LIFE34.waypoint.name'),'Somewhere else','never over another waypoint');
  assert.equal(J("TOASTS.filter(t=>t===fb().LINES.ui.waypointToast).length"),1,'but the toast still points to the children once');
  run('LIFE34.waypoint=null;TOASTS=[];frames37(5);');assert.equal(J('LIFE34.waypoint&&LIFE34.waypoint.name'),'The end of the street','the waypoint');
  assert(!J("TOASTS.includes(fb().LINES.ui.waypointToast)"),'its toast waits while the last one is still showing');run('frames37(90);');assert.equal(J("TOASTS.filter(t=>t===fb().LINES.ui.waypointToast).length"),1,'then its toast, once');
  run('LIFE34.waypoint=null;frames37(30);');assert.equal(J('LIFE34.waypoint'),null,'once only');
  const aff0=J('S.nb.nkechi.aff||0');run('at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');
  for(let m=0;m<2;m++){assert.equal(J('startMatch37()'),'setout');run('botsOn37("attack","attack",'+(7+m)+');');for(let k=0;k<12000&&J('fb().state')!=='ended';k+=30)run('frames37(30)');run('botsOff37();');for(let k=0;k<400&&J('fb().state')!=='idle';k+=10)run('frames37(10)');run('at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(10);');}
  const L=J('S.life.football37');assert.equal(L.played,2);assert.equal(J('S.nb.nkechi.aff||0')-aff0,1,'Mama Nkechi warms by exactly 1 that day');
  run('openLife34("today");');const t2=J('panel.innerHTML');run('closePanel();');const col=L.last.result==='won'?'won':L.last.result==='lost'?'lost':'other';
  const want=L.last.result==='won'?(L.last.last?'Monkey post today: last goal wins, and it was ours.':`Monkey post today: won ${L.last.a}–${L.last.b}.`):L.last.result==='lost'?(L.last.last?'Monkey post today: last goal wins, and it was theirs.':`Monkey post today: Kemi and Emeka won ${L.last.b}–${L.last.a}.`):`Monkey post today: unfinished at ${L.last.a}–${L.last.b}.`;
  assert(t2.includes(want),'Today: '+want);const line=J(`fb().LINES.neighbours.tunde.${col}`);
  run("openTalk(0,'tunde');");const talk1=J('panel.innerHTML');run('closePanel();');run("openTalk(0,'tunde');");const talk2=J('panel.innerHTML');run('closePanel();');
  assert(talk1.includes(J('esc('+JSON.stringify(line)+')')),'Tunde’s football line');assert(J('S.life.lines35.used.tunde').includes('fb37-tunde-'+col),'fb37-tunde-'+col+' used');assert(!talk2.includes(J('esc('+JSON.stringify(line)+')')),'once only');
  R.after={morning:true,waypoint:'once',nkechi:1,today:want,tunde:'fb37-tunde-'+col};
  // (merger) the first kick inside the children's hours: the first-kick toast shows alone on that frame, the waypoint's toast follows 2.6 s later
  run('fresh37(3,15.6);LIFE34.waypoint=null;TOASTS=[];');kick(0,{hold:0,x:-4,z:11.0,ox:-4,oz:8.4});const tq=J('TOASTS.slice()');const wpNow=J('LIFE34.waypoint&&LIFE34.waypoint.name');
  assert.deepEqual(tq,[J('fb().LINES.toasts.firstKick')],'on the first kick only its own toast: '+JSON.stringify(tq));assert.equal(wpNow,'The end of the street','the waypoint itself at once');
  let qf=0;for(;qf<120&&!J("TOASTS.includes(fb().LINES.ui.waypointToast)");qf++)run('frames37(1)');const tq2=J('TOASTS.slice()');
  assert.deepEqual(tq2,[J('fb().LINES.toasts.firstKick'),J('fb().LINES.ui.waypointToast')],'then the waypoint toast, after it: '+JSON.stringify(tq2));assert(qf>=70&&qf<=85,'2.6 s later: '+qf+' frames');R.toastQueue={after:r3(qf/30)};
  // owner decision 4 switched off: no child is named anywhere (the first kick says only "Good touch.", no morning line, the Menu card leaves them out)
  run('fresh37(3,15+20/60);fb().OWNER.children=false;TOASTS=[];');kick(0,{hold:0,x:-4,z:11.0,ox:-4,oz:8.4});run('restBall37(300);closePanel();openLife34("today");');const tdy=J('panel.innerHTML');run('closePanel();openMenu();');const mnu=J('panel.innerHTML');run('closePanel();frames37(60);');
  const ts=J('TOASTS.slice()'),kids=J('!!fb().kids');run('fb().OWNER.children=true;');assert(ts.includes(J('fb().LINES.toasts.firstKickAlone'))&&!ts.some(t=>/Kemi|Emeka/.test(t)),'the first-kick toast without the children: '+JSON.stringify(ts));
  assert(!/Kemi|Emeka/.test(tdy)&&!/Kemi|Emeka/.test(mnu.slice(mnu.indexOf('fb37-menu'))),'no child named on Today or the Menu card');assert(!kids,'no children');R.noChildren=true;
  // the module never reads the wall clock (it keeps its own clock) and never draws from Math.random
  const src=fs.readFileSync(path.join(GAME,'src','football-v37.js'),'utf8');assert(!/performance\.now|Date\.now|new Date|Math\.random\(\)/.test(src),'a wall-clock or Math.random call in football-v37.js');
  // the cost, counted inside the module's step: a rolling frame at most 16 blocked() and 16 levelAt(); at rest none but one per 60 frames;
  // a match frame at most 20 blocked()
  run('fresh37(8,10);restBall37(400);at37(0,-4,10.2,[1,0]);at37(1,-4,13,[0,-1]);ballAt37(-3.38,10.2);frames37(2);');let restB=0,restF=0;
  for(let f=0;f<120;f++){run('COST37.b=0;COST37.l=0;frames37(1);');restB+=J('COST37.b');restF++;}assert(restB<=Math.ceil(restF/60),'at rest '+restB+' blocked() in '+restF+' frames');
  run('press37(0);frames37(21);release37(0);');let rollMax=[0,0],rolls=0;for(let f=0;f<60;f++){const mv=J('Math.hypot(ball.v[0],ball.v[1])>0.02');run('COST37.b=0;COST37.l=0;frames37(1);');if(mv){rolls++;const c=J('[COST37.b,COST37.l]');rollMax=[Math.max(rollMax[0],c[0]),Math.max(rollMax[1],c[1])];}}
  assert(rolls>10&&rollMax[0]<=16&&rollMax[1]<=16,'a rolling frame: '+JSON.stringify(rollMax));
  run('at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');run('botsOn37("attack","attack",3);');let mMax=0,mF=0;
  for(let f=0;f<2400&&!['ended','idle'].includes(J('fb().state'));f++){run('COST37.b=0;frames37(1);');mMax=Math.max(mMax,J('COST37.b'));mF++;}run('botsOff37();ACTIONS.football37Stop();frames37(2);');
  assert(mMax<=20,'a match frame made '+mMax+' blocked() calls');const steps=J('fb().cost.steps');assert(steps>0,'the step ran');R.cost={rest:[restB,restF],rolling:rollMax,match:[mMax,mF]};
  return R;});
 // check 13 (v37 merge): own goals by real keys. The browser checker found people walking back towards our goal with a child's shot at their
 // feet (taken on by the dribble 1-2.5 m out) and the ball rolling the last metre and a half in after the 1.5 m guard let it go. Here its bot
 // (KB37, k.mjs ported line for line, with no safeDir37) plays ten matches; then P1 walks with keys into a resting ball near our line
 check(13,()=>{const R={matches:[]};let goals=0;const og=[];
  for(const [day,seed] of [[8,100],[15,200]]){const X=series('keys'+day,{day,time:10,w:1280,h:800,n:5,kbot:seed});assert(X.length===5&&X.every(m=>m.frames),'day '+day+': five matches by the real-key bot: '+JSON.stringify(X.map(m=>m.start||m.result)));
   for(const M of X){const gs=M.events.filter(e=>e.ev==='goal');goals+=gs.length;
    // how often the bot walked back with the ball at its feet near our line (a human owner within 3.5 m of x1, walking west): the scenario is played
    const back=M.frames.filter(f=>f.s==='live'&&f.o&&(f.o==='p0'||f.o==='p1')&&f.b[0]<PT.x1+3.5&&f.b[0]>PT.x1).length;
    for(const g of gs)if(g.own&&TEAM(g.who)==='a'){const lt=M.events.filter(e=>e.ev==='touch'&&e.t<=g.t&&e.who===g.who).slice(-1)[0];og.push({day,t:g.t,who:g.who,last:lt&&lt.how,at:g.at});}
    R.matches.push({day,score:[M.result.a,M.result.b],goals:gs.map(g=>g.team+':'+g.who+(g.own?':og':'')).join(' '),ownerNearOurLine:back});}}
  assert.equal(og.length,0,'own goals by a human in real-key play ('+og.length+' of '+goals+'): '+JSON.stringify(og));R.goals=goals;R.humanOwnGoals=0;
  // walking back with keys (the camera combination nearest due west) into a resting ball 0.7 m and 1.2 m from our line, at the kick-off
  const live13=()=>{run('fresh37(3,15+40/60);fb().matchNo=1;at37(0,-24,12.4,[0,-1]);at37(1,-20.5,12.0,[0,-1]);frames37(25);');assert.equal(J('startMatch37()'),'setout');for(let k=0;k<400&&J('fb().state')!=='live';k++)run('frames37(1)');};
  const W=J('rawOf37(...combo37(-1,0))');R.walkIn=[];
  for(const bx of [PT.x1+0.68,PT.x1+1.2]){live13();run(`at37(1,-19,12.4,[0,-1]);at37(0,${bx-W[0]*0.75},${9.3-W[1]*0.75},${JSON.stringify(W)});ballAt37(${bx},9.3);TOASTS=[];frames37(1);`);const t0=J('tnow37()');
   for(let f=0;f<60;f++)run(J("fb().state")==='live'?'setKeys37(0,combo37(-1,0));frames37(1);':'setKeys37(0,null);frames37(1);');run('setKeys37(0,null);');
   const g=J(`evs37('goal',${t0})`),hits=J(`evs37('touch',${t0}).filter(e=>e.who==='p0').map(e=>e.how)`);assert(hits.length,'P1 reached the ball');
   assert(!g.some(e=>e.own&&e.who==='p0'),'P1 walked the ball into our own goal from '+r3(bx-PT.x1)+' m: '+JSON.stringify(g));R.walkIn.push({from:r3(bx-PT.x1),touches:[...new Set(hits)].join(),goals:g.map(e=>e.who+(e.own?':og':'')).join()});run('ACTIONS.football37Stop();frames37(2);');}
  // a kick is not carrying: tapped in from 0.6 m it is still an own goal
  live13();run('at37(1,-19,12.4,[0,-1]);at37(0,-27.58,9.0,[-1,0]);ballAt37(-28.2,9.0);frames37(2);');const tk=J('tnow37()');run('press37(0);frames37(1);release37(0);frames37(30);');
  const kg=J(`evs37('goal',${tk})`)[0];assert(kg&&kg.own&&kg.who==='p0','a kick into our own goal is an own goal: '+JSON.stringify(kg));R.kickIn=kg.who+':og';run('ACTIONS.football37Stop();frames37(2);');
  return R;});
 if(side&&side.wantSeries)side.series=series(side.wantSeries[0],side.wantSeries[1]);
 return out;}

async function inner(only){const h=await world();const side={};const res=checks(h,only,side);return {build:h.run('BUILD_ID'),checks:res,side};}

if(process.argv[2]==='--debug'){world().then(h=>{const code=fs.readFileSync(process.argv[3],'utf8');const fn=new Function('h','J','run','assert',code);return fn(h,c=>JSON.parse(h.run('JSON.stringify('+c+')')),h.run,assert);}).then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});}
else if(process.argv[2]==='--sig'){const T=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));T.benchWorld().then(({run,J})=>{run("ACTIONS.bench36Start();ACTIONS.close();");process.stdout.write(JSON.stringify({sig:T.worldSig(J("benchBoxes36(0,0,1e4,{}).map(o=>[o.x1,o.x2,o.z1,o.z2])"))})+'\n');process.exit(0);}).catch(e=>{console.error(e);process.exit(1);});}
else if(process.argv[2]==='--series'){world().then(h=>{const side={wantSeries:[process.argv[3],JSON.parse(process.argv[4])]};checks(h,[],side);process.stdout.write(JSON.stringify(side.series)+'\n',()=>process.exit(0));}).catch(e=>{console.error(e);process.exit(1);});}
else if(process.argv[2]==='--inner'){const only=process.argv[3]?process.argv[3].split(',').map(Number):null;inner(only).then(r=>{process.stdout.write(JSON.stringify(r)+'\n',()=>process.exit(0));}).catch(e=>{console.error(e);process.exit(1);});}
else{(async()=>{
 const child=(args,env)=>new Promise(res=>{const p=cp.spawn(process.execPath,[__filename].concat(args),{env:Object.assign({},process.env,env||{}),stdio:['ignore','pipe','pipe']});let o='',e='';p.stdout.on('data',d=>o+=d);p.stderr.on('data',d=>e+=d);
  p.on('close',code=>{try{res(JSON.parse(o.trim().split('\n').pop()));}catch(x){res({error:(e||o).slice(-600)||('exit '+code)});}});});
 const src=fs.readFileSync(path.join(GAME,'src','football-v37.js'),'utf8'),cssSrc=fs.readFileSync(path.join(GAME,'src','football-v37.css'),'utf8'),dirs=[],mut=[];let a,b,wo;
 const withoutDir=variantDir(html=>{let o=html;for(const T of TAGS){assert(T.test(o),'the football tags are in index.html');o=o.replace(T,'');}return o;});dirs.push(withoutDir);
 let sg=null;const jobs=[async()=>{sg=await child(['--sig']);},async()=>{a=await child(['--inner']);},async()=>{b=await child(['--inner']);},async()=>{wo=await child(['--inner'],{COMPOUND_GAME_DIR:withoutDir});}]
  .concat(MUTANTS.filter(m=>!m.with).map((m,k)=>async()=>{const extra=MUTANTS.filter(x=>x.with===m.name.split(' ')[0]);let t=m.css?cssSrc:src;for(const x of [m].concat(extra)){const n=t.split(x.find).length-1;if(n!==1){mut.push({name:m.name,check:m.check,result:'stale ('+n+' matches of '+x.name+')'});return;}t=t.replace(x.find,x.replace);}
   const d=m.css?variantDir(null,null,()=>t):variantDir(null,()=>t);dirs.push(d);const r=await child(['--inner',String(m.check)],{COMPOUND_GAME_DIR:d});const c=r.checks&&r.checks[0];mut.push({name:m.name+(extra.length?' (with '+extra.map(x=>x.name).join(', ')+')':''),check:m.check,result:c?(c.passed?'green':'red'):'error',k,first:c&&!c.passed?c.failure:undefined});}));
 const PAR=Math.max(1,Math.min(2,+(process.env.FOOTBALL37_JOBS||1)));
 try{const q=jobs.slice();await Promise.all(Array.from({length:PAR},async()=>{while(q.length)await q.shift()();}));}finally{for(const d of dirs)fs.rmSync(d,{recursive:true,force:true});}
 mut.sort((x,y)=>x.k-y.k);for(const m of mut)delete m.k;
 const same=JSON.stringify(a)===JSON.stringify(b);
 // check 12: the before-discovery digest must equal the run without the module
 if(a&&a.checks){const c12=a.checks.find(c=>c.n===12);const da=a.side&&a.side.inert12,dw=wo&&wo.side&&wo.side.inert12;if(c12&&c12.passed&&(!da||!dw||da!==dw)){c12.passed=false;c12.failure='before discovery the game differs from the run without the module ('+da+' against '+dw+')';}else if(c12&&c12.passed)c12.info.before.sameAsWithout=true;
  if(c12&&c12.passed&&!(sg&&sg.sig===PLAN.world)){c12.passed=false;c12.failure='the world signature is '+(sg&&sg.sig)+', not '+PLAN.world;}else if(c12&&c12.passed)c12.info.before.worldSignature=sg.sig;}
 // without the module: every check red; checks with the same first failure grouped as one finding
 const groups=[];if(wo&&wo.checks)for(const c of wo.checks){const g=groups.find(x=>x.first===c.failure);if(c.passed)groups.push({checks:[c.n],first:'GREEN without the module'});else if(g)g.checks.push(c.n);else groups.push({checks:[c.n],first:c.failure});}
 const woRed=!!(wo&&wo.checks&&wo.checks.length===ORDER.length&&wo.checks.every(c=>!c.passed));
 const report={build:a.build||null,passed:!a.error&&same&&a.checks.length===ORDER.length&&a.checks.every(c=>c.passed)&&mut.every(m=>m.result==='red')&&woRed,
  checks:(a.checks||[]).map(c=>{const o=Object.assign({},c);delete o.n;return o;}),mutants:mut,withoutModule:{allRed:woRed,findings:groups},determinism:same?'identical':'differs'};
 if(a.error)report.error=a.error;
 for(const c of report.checks)console.log((c.passed?'PASS ':'FAIL ')+c.name.slice(0,140)+(c.passed?'':' -- '+c.failure));
 for(const m of mut)console.log((m.result==='red'?'PASS ':'FAIL ')+'mutant '+m.name+' turns check '+m.check+' '+m.result);
 console.log((woRed?'PASS ':'FAIL ')+'without football-v37.js every check fails ('+groups.length+' distinct first failures)');
 console.log((same?'PASS ':'FAIL ')+'determinism: two runs give identical reports');if(a.error)console.log('ERROR',a.error);
 fs.writeFileSync(OUT,JSON.stringify(report,null,1)+'\n');console.log(`${report.checks.filter(c=>c.passed).length}/${ORDER.length} checks, ${mut.filter(m=>m.result==='red').length}/${mut.length} mutants red`);
 process.exitCode=report.passed?0:1;})();}

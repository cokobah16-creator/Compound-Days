/* v37 Monkey post: street football at the end of the street, where the keke turns ("We need to make street soccer a serious part of
   the game as well."). The household ball becomes a scuffed panelled football with real rolling physics from load, in every household;
   tap Act near it to pass, hold to shoot, walk into it to dribble. Kemi and Emeka come out in the afternoon, place two stone cairns at each
   end of the open ground and play first to 3 against the two of you (or you and the companion), with "last goal wins" at the tiredness
   cap or when Mama Nkechi calls at 18:20.
   Loaded after bench-v36.js. Every change wraps an earlier global and calls it. Top-level names end in 37. The wall clock is never read
   (the module's own clock FOOTBALL37.t is the sum of the frame steps) and Math.random is never used (rng37, seeded).
   Sections: A (engineer A: ball, kick, pitch, match core, save, online, the A/B API) and B (engineer B: the people's lines, the team AI,
   Mr Bassey, shouts, rings, twins and sounds, the interface per view, cameras and arrows, the daily loop). Owner-facing choices are the
   named constants in FOOTBALL37.OWNER; every line of copy is in FOOTBALL37.LINES. */
'use strict';

/* ======================================================================================================================================
   A.1 Constants and state (spec §1.6). Values are A's starting points; owner-facing choices live in FOOTBALL37.OWNER.
   ====================================================================================================================================== */
const FOOTBALL37={v:2,t:0,playT:0,
 // owner decisions (spec §22), all recommended options; change one here and nothing else
 OWNER:{
  pitch:'keke-turn',            // 1: the open ground at the end of the street where the keke turns
  southEdge:5.6,                // 2: pitch width in metres (5.6 out to the sand; 4.2 would be the street-edge variant, which needs PITCH42 and a retune)
  mode:'together',              // 3: Phase 1 plays together against Kemi and Emeka only
  children:true,                // 4: Kemi and Emeka, Emeka as Mama Nkechi's nephew
  goals:'cairns',               // 5: 0.48 m stone cairns with Emeka's slippers beside the east pair ('blocks' is the sandcrete alternative)
  ball:'panels',                // 6: scuffed black-and-white panelled household ball (the children keep their own plastic ball)
  clockSlow:1/3,                // 7: the clock runs at a third while the ball is in play (1 keeps the normal rate)
  phoneFloor:50,                // 8: split views with ball framing and a 50 px person floor on phone halves (B)
  online:'look-and-host',       // 9: online gets the ball's look and host physics only
  streetCall:true,              // 10: the street's call, once per match, together mode only
  sundayFrom:15,                // 11: Sundays from 15:00, after church
  realName:false},              // 12: the fallback line instead of the real footballer's name (B's commentary)
 R:0.22,SEG:[16,12],HOME:[0,13.5],SHADOW_R:0.20,
 MU:0.8,DECEL:1.0,E_WALL:0.55,TAN_WALL:0.9,E_POST:0.6,E_BODY:0.3,SUB:0.1,SUBMAX:8,WEST_STOP:-30.45,LEVEL_WALL:0.05,
 REACH:1.0,PRESS_SLACK:0.2,RELEASE_REACH:1.6,TAP:{key:0.18,touch:0.22,pad:0.18},FULL:0.70,AUTO:0.25,KMIN:5.0,KMAX:11.0,
 CHARGE_WALK:0.55,TRAP_AHEAD:0.62,OWNER_WALK:0.78,
 ASSIST:{key:23,touch:22,pad:12,touchIdle:35},AIM_HALF:0.65,SHOT_RANGE:14,SHOT_FRONT:0.3,
 PASS_CONE:35,PASS_MAX:9,PASS_ARRIVE:1.5,PASS_VMAX:11,PASS_ITER:3,PASS_BELOW:7.0,
 STICKY:{r:1.1,ahead:0.62,gain:6,dot:0.15,grace:0.35,minSpeed:0.3,vmax:5.0,hold:0.2,holdR:1.4},
 CHALLENGE:{d:0.7,t:0.25,pop:3.0,spread:30,regain:0.6,graceOwner:1.15,kidEvery:3.45,kidEverySerious:2.0,face:0.3},
 PITCH:{x1:-28.8,x2:-17.8,z1:7.0,z2:12.6,cx:-23.3,zc:9.8,half:1.2,postR:0.16,cairnH:0.48},
 ZONE:{x1:-30.4,x2:-16.8,z1:6.6,z2:12.8},
 KEEP:{x1:-31,x2:-15.4,z1:5.6,z2:13.6},
 KEKE:{lane:[9.4,11.8],edge:[9.1,12.1],warnX:-11.0,turnX:-14.6,outX:-15.4,after:[15,40]},
 SQUARE_GOAL:{x:-21,z1:-4.94,z2:-2.06,every:2,recent:4},
 OUT:0.3,RESTART_INSET:0.6,RESTART_GOAL:2.0,KEEPOFF:2.0,KEEPOFF_T:{kickoff:4,restart:3},
 SPAWN:12,DESPAWN:18,DESPAWN_T:5,SETOUT_CAP:4.0,CLEAR_WAIT:11,CLEAR_T:1.6,AWAY:6,AWAY_T:45,START_NEAR:10,
 HOURS:{weekday:[15.5,18.5],sat:[10,18.5],sun:[15,18.5],flag:[6,20],lastStart:18,call:18+20/60,capPlay:300,unfinishedPlay:60},
 OWN_GUARD:{near:3.5,side:1.0,vmin:0.2,stop:0.5},COMP_IN:[-16.2,9.8],COMP_HAND:{z:9.8,x0:-16.2,x1:0,step:0.5,gain:2,every:1.0},TOAST_GAP:2.6,
 MOUTH:{op:0.85,hw:0.05},TARGET:3,CELEBRATE:2.5,SUMMARY:6,HINT_SHORT:4,GOAL_BANNER:1.4,CREDIT_DEFLECT:1.5,
 COL:{a:'#2E9E5B',b:'#F08A24'},
 KICKOFF:{kemi:[-21.3,9.0],emeka:[-19.8,10.6]},
 SPECT:{bassey:[-24.2,6.5],enter:[[-12.9,6.5],[-30.4,6.5]],walk:1.3,near:15},
 KIDS:{kemi:{idle:[-25.0,9.4],speed:2.7,scale:0.84,head:1.06,r:0.28,aimSd:10,look:{skin:'#6E4630',hair:'twists',outfit:'tee',oc:'#F2C14E'}},
       emeka:{idle:[-21.0,10.2],speed:2.4,scale:0.80,head:1.06,r:0.27,aimSd:13,look:{skin:'#905F3F',hair:'low',outfit:'tee',oc:'#F4F1EA'}}},
 KEEPY:{gap:2.5,every:0.55,jitter:0.08,swap:6,hMin:0.25,hMax:0.6,back:1.2,backDelay:[0.6,1.0]},
 state:'off',score:[0,0],owner:null,lastTouch:null,persons:[],posts:[],marks:[],flags:null,stats:null,
 // runtime
 tex:null,texStats:null,shadow:null,kids:null,matchNo:0,rng:null,events:[],handlers:{},lastGoal:false,called:false,capped:false,
 bannerPlayT:0,kekeAt:0,kekeDone:false,kekeThrough:false,kekeSkip:false,stateT:0,setout:null,keepOff:null,out:null,pendingCall:null,
 streetCallUsed:false,homeDay:0,awayT:0,despawnT:0,restT:0,lastCrate:'',lastBench:'',lastSofa:'',seq:0,lastMatchDay:0,result:null,
 call:null,callT:[-9,-9],noQualifyUntil:0,ownerSince:0,chT:{},kidChT:{},kickBy:{},lastPostHit:null,squareT:-9,mesh:{cairns:[],slippers:null,lines:[]},
 shouts:[],cost:{blocked:0,levelAt:0,steps:0},kickoffTeam:'a',kickoffT:0,waitingFrom:null,cleared:null,hudKey:'',trace:null};

/* ---------- B.0 Every line of copy the people say (spec §11). Drafts: a Nigerian reader checks them all before release (§11.5).
   Pidgin lives only in shouts and speech; the interface stays plain English. Never pushed into LINES35. ---------- */
FOOTBALL37.LINES={
 // toasts (plain English)
 toasts:{firstKick:'Good touch. Kemi and Emeka play monkey post at the end of the street in the afternoons.',firstKickAlone:'Good touch.',
  fetch:'Emeka ran to get your ball.',measure:'Kemi measures the goals heel to toe.',street:'Off the stone! The street says it went in.',ownGoal:'Own goal!',
  square:'Goal at the square! Goals at the square: {n}.',finishGame:'Finish the game first.',bench:'Finish carrying Ada’s bench first.',sofa:'Put the sofa down first.',seated:'Stand up first.',
  photoLast:'{bassey} took a picture: last goal wins, and it was ours.',photoWin:'{bassey} took a picture: our first win at monkey post, Us {a}, Kemi and Emeka {b}.',
  remember:'Monkey post at the end of the street: Us {a}, Kemi and Emeka {b}.'},
 // the children's shouts (bubbles over their heads; mirrored into the commentary line when the child is off-screen in a view)
 shouts:{setout:'You two against us two. Oya!',oya:'Oya!',goal:'Gooool!',ourBall:'Our ball!',motor:'Motor!',cap:'We don tire. Last goal wins!',
  called:'Auntie is calling me!',ownGoal:{kemi:'Kemi!',emeka:'Emeka!'},last:'Last goal wins!',unfinished:'We go finish am tomorrow.',away:'Oya, come back!',passBack:['Your ball!','Oya, take am!'],
  bye:'Tomorrow again!',late:{school:'It’s late. Tomorrow after school.',sat:'It’s late. Tomorrow morning!',sun:'It’s late. Tomorrow after church.'}},
 // Mr Bassey's commentary by category: [id, text, {who}] (who: only when that child scored); no line repeats in a day before its category is used up
 bassey:{
  goalA:[['a1','Ehen! See leg work!'],['a2','Goal! Even my knees felt that one.'],['a3','Na so! Clean, clean.'],['a4','That one would be in the net, if there was a net.'],
   ['a5','My camera is not fast enough for that one.'],['a6','Who taught you that? Not me.'],['a7','That ball had eyes.'],['a8','Sharp, sharp! Between the stones.']],
  goalB:[['b1','That girl was born with a ball at her feet.',{who:'kemi'}],['b2','Emeka, where are your slippers? Oh. By the goal.',{who:'emeka'}],['b3','The small ones are teaching you today.'],['b4','Ah ah! Una no fit stop am?'],
   ['b5','The children have spoken.'],['b6','Defend, my people, defend!'],['b7','Small legs, big goal.'],['b8','They practise every afternoon. It shows.']],
  own:[['o1','Ah, wrong goal! It happens to everybody. Even me, in 1979.']],
  post:[['p1','Stone! Who put that stone there?'],['p2','Off the stone. Unlucky.']],
  street:[['s1','Ojoro? No. I saw it. It went in.'],['s2','From where I am standing, that one entered.']],
  dribbleUs:[['d1','See guiding!']],dribbleKemi:[['d2','Leave am, leave am, she don pass you.']],
  showOff:[['l1','They are showing off now.']],serious:[['l2','Ehen. Kemi is serious now.']],motor:[['m1','Make una shift for motor!']],
  cap:[['c1','Everybody is tired. Last goal wins.']],call:[['c2','Last goal wins! Mama Nkechi is calling.']],
  won:[['e1','Well played. Go and drink water.'],['e4','A proper game. Well done, all of you.'],['e5','Victory! Now go and rest your legs.']],
  lost:[['e2','Tomorrow you will beat them. Maybe.'],['e6','The children were sharper today. It happens.'],['e7','No shame in it. They play here every day.']],unfinished:[['e3','We go finish am tomorrow, abi?']],
  photo:[['f1','Stand still, stand still. Yes! That one is the keeper.']]},
 // owner decision 12: the real footballer's name only with the owner's and the reader's approval (OWNER.realName); otherwise b1 above
 realName:'Kemi again! That girl plays like Oshoala.',
 // one line each after a match (today's or yesterday's), ids fb37-<who>-<won|lost|other>; Mama Nkechi's rely on Emeka being her nephew
 neighbours:{
  tunde:{won:'I heard you beat the small ones at the end of the street. Don’t let it go to your head. Kemi will want revenge.',lost:'Kemi beat you? Join the club. She did me last week.',other:'Last goal wins, and nobody scored? That is a true street game.'},
  nkechi:{won:'Emeka came home talking about you. He wants a rematch after his food.',lost:'Emeka came in grinning from ear to ear. So you were the ones he beat?',other:'I called him in and he said, ‘Last goal, Auntie, last goal!’',otherUncalled:'Emeka says nobody won. He says it like it is a trophy.'},
  ada:{won:'Mr. Bassey told the whole Yard about your goal. I have heard it four times.',lost:'Lose today, win tomorrow. That is how the street works.',other:'A draw? Then everybody gets to talk.'},
  bassey:{won:'I am still talking about that goal.',lost:'Ah, these small ones! Next time una go learn.',other:'Unfinished business. The best kind.'},
  // (fixer, v37 review F11) Mama Nkechi's line on the veranda evening after a match (today's or yesterday's)
  nkechiEvening:'Emeka told me the whole game before he even washed his feet. Every goal, twice.'},
 // the interface (plain English)
 ui:{us:'Us',them:'Kemi & Emeka',firstTo:'first to 3',lastGoal:'Last goal wins',role:'Monkey post · Green',
  hint:'Tap {k}: pass · hold {k}: shoot · {k} away from the ball: call for it',hintShort:'Tap {k}: pass · Hold {k}: shoot',landscape:'Turn the phone sideways: both of you get more room.',
  keyName:['E','Enter'],touchName:'Act',padName:'A',
  releaseChip:'{name}: Release!',goalArrow:'Goal',goalSprite:'GOAL!',
  fullTime:'Full time · Us {a} – {b} Kemi & Emeka',lastUs:'Last goal wins · Us! ({a} – {b} before it)',lastThem:'Last goal wins · Kemi & Emeka! ({a} – {b} before it)',
  unfinished:'Unfinished · {a} – {b} · to finish tomorrow',goals:'Goals: {list}',og:'(o.g.)',
  morning:'Kemi and Emeka play monkey post at the end of the street today from {h}.',morningFlag:'Kemi and Emeka play monkey post at the end of the street.',waypoint:'The end of the street',
  waypointToast:'Kemi and Emeka are playing at the end of the street.',
  benchWait:'Sit until {h}',benchWaitSub:'Then Kemi and Emeka are out at the end of the street',
  kick:'Kick · hold to shoot',call:'Call for it',motor:'Motor!',road:'Wait for the road to clear',play:'Play monkey post',again:'Another game?',wait:'Wait for {name}',
  menuTitle:'Street football.',menuWhat:'Monkey post (from “mocking post”, a joke on real goalposts) is small-goal street football: no keeper, no referee.',
  menuWhen:'Kemi and Emeka play at the end of the street after school from {wd0} to {wd1}, and at the weekend from {sat}, or from {sun} after church.',
  menuHow:'Walk into the ball to dribble. Tap action near it to pass, hold to shoot. Action away from the ball calls for it.',menuRecord:'Played {played} · won {won} · goals at the square {square}.',
  menuOnline:'Monkey post needs you both on one device.',menuHome:'Ball stuck? Bring it back',menuStop:'Stop the game',menuRuns:'Football runs',
  controls:'dribble the ball by walking into it; tap action near it to pass, hold to shoot',release:'Release!',
  today:{won:'Monkey post {when}: won {a}–{b}.',wonLast:'Monkey post {when}: last goal wins, and it was ours.',lost:'Monkey post {when}: Kemi and Emeka won {b}–{a}.',
   lostLast:'Monkey post {when}: last goal wins, and it was theirs.',unfinished:'Monkey post {when}: unfinished at {a}–{b}.',today:'today',yesterday:'yesterday'}}};
function fbFill37(t,v){return String(t).replace(/\{(\w+)\}/g,(m,k)=>v&&v[k]!=null?String(v[k]):'');}

/* ---------- small helpers ---------- */
const r3_37=v=>Math.round(v*1000)/1000;
// mulberry32: every random choice in the module comes from one of these (spec §5.6)
function rng37(seed){let a=seed>>>0;const f=()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
 f.range=(lo,hi)=>lo+(hi-lo)*f();f.normal=()=>{let u=f();if(u<1e-9)u=1e-9;return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*f());};return f;}
FOOTBALL37.rng=rng37(37);
const D2R37=Math.PI/180;
// three.js draws every new object's UUID from Math.random. The module never uses Math.random for anything, but building its meshes would still
// shift the game's own random sequence (which every harness stubs), so constructions run with a local generator in its place for a moment.
let fbUid37=0x3700;
function fbQuiet37(fn){const keep=Math.random;let s=fbUid37;Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};try{return fn();}finally{fbUid37=s;Math.random=keep;}}
const fbOpts37={};                                   // one shared options object for the ball's blocked() tests (spec §2.3)
function fbClamp37(v,a,b){return v<a?a:v>b?b:v;}
function fbLen37(x,z){return Math.hypot(x,z);}
function fbAng37(ax,az,bx,bz){const la=Math.hypot(ax,az)||1,lb=Math.hypot(bx,bz)||1;return Math.acos(fbClamp37((ax*bx+az*bz)/(la*lb),-1,1))/D2R37;}
function fbRot37(x,z,deg){const a=deg*D2R37,c=Math.cos(a),s=Math.sin(a);return [x*c-z*s,x*s+z*c];}
function fbToast37(m){try{if(typeof toast==='function'&&!(typeof silentMode==='function'&&silentMode())){toast(m);FOOTBALL37.toastAt37=FOOTBALL37.t;}}catch(e){}}
// (merger) a toast that must not cover the one just shown waits its turn: shown once the last module toast has had TOAST_GAP s (the base shows one for
// 2.4 s), in the order queued, on the module's own clock
function fbToastSoon37(m){const F=FOOTBALL37,Q=F.toastQ37||(F.toastQ37=[]);if(!Q.length&&F.t-(F.toastAt37===undefined?-99:F.toastAt37)>=F.TOAST_GAP-1e-9){fbToast37(m);return;}Q.push(m);}
function fbToastStep37(){const F=FOOTBALL37,Q=F.toastQ37;if(!Q||!Q.length)return;if(F.t-(F.toastAt37===undefined?-99:F.toastAt37)>=F.TOAST_GAP-1e-9)fbToast37(Q.shift());}
function fbHUD37(){try{if(typeof updateHUD==='function')updateHUD();}catch(e){}}
function fbLog37(k,a){try{if(typeof LOG35!=='undefined'&&LOG35&&typeof LOG35.add==='function')LOG35.add(k,a);}catch(e){}}
function fbOnline37(){return typeof NET!=='undefined'&&!!NET.on;}
function fbGuest37(){return fbOnline37()&&!NET.isHost;}
function fbCompanion37(){return typeof AI!=='undefined'&&!!AI.on;}
function fbLocalPair37(){return typeof singleIdx==='function'&&singleIdx()===-1&&!fbOnline37()&&!fbCompanion37();}
function fbName37(i){try{return pname(i);}catch(e){return i?'Player 2':'Player 1';}}
function fbSave37(){return S&&S.life&&S.life.football37?S.life.football37:null;}
function fbPartyOn37(){return !!(S&&((S.party&&S.party.on&&!S.party.done)||(S.roof&&S.roof.on)));}
function fbInRect37(x,z,r,pad){pad=pad||0;return x>=r.x1-pad&&x<=r.x2+pad&&z>=r.z1-pad&&z<=r.z2+pad;}
function fbRectDist37(x,z,r){const dx=Math.max(r.x1-x,0,x-r.x2),dz=Math.max(r.z1-z,0,z-r.z2);return Math.hypot(dx,dz);}
// the states in which a match is on (posts out)
const MATCH37=['setout','live','goal','restart','motor','waiting','ended','clearing'];
const PLAY37=['live','goal','restart','motor'];
function fbMatchOn37(){return MATCH37.includes(FOOTBALL37.state);}
function fbPlaying37(){return PLAY37.includes(FOOTBALL37.state);}
function fbPostsOut37(){return FOOTBALL37.mesh.cairns.length>0||['setout','live','goal','restart','motor','waiting','ended','clearing'].includes(FOOTBALL37.state);}

/* ---------- A.2 The A/B API (spec §20.1) ---------- */
// events: kick, post, goal, out, call, owner, state, motor, banner (and challenge, whiff, square, shout, restart, kickoff, end, stop)
function football37On(ev,fn){(FOOTBALL37.handlers[ev]||(FOOTBALL37.handlers[ev]=[])).push(fn);return fn;}
function fbEmit37(ev,data){const F=FOOTBALL37,rec=Object.assign({t:r3_37(F.t),ev},data||{});F.events.push(rec);if(F.events.length>6000)F.events.splice(0,F.events.length-6000);
 const hs=F.handlers[ev];if(hs)for(const h of hs.slice()){try{h(rec);}catch(e){if(typeof console!=='undefined')console.warn('football37 handler',ev,e);}}return rec;}
function football37State(){return FOOTBALL37.state;}
function football37Owner(){const o=FOOTBALL37.owner;return o?o.key:null;}
function football37Score(){return FOOTBALL37.score.slice();}
function football37Pitch(){return Object.assign({},FOOTBALL37.PITCH,{posts:fbPostsAt37()});}
function football37Persons(){return FOOTBALL37.persons;}
function football37Team(key){if(key==='p0'||key==='p1')return 'a';if(key==='ai')return fbMatchOn37()?'a':null;if(key==='kemi'||key==='emeka')return 'b';return null;}
function fbPostsAt37(){const P=FOOTBALL37.PITCH,h=P.half;return [[P.x1,P.zc-h],[P.x1,P.zc+h],[P.x2,P.zc-h],[P.x2,P.zc+h]];}
function fbGoalOf37(team){const P=FOOTBALL37.PITCH;return team==='a'?[P.x2,P.zc]:[P.x1,P.zc];}       // the goal a team attacks
function fbOwnGoal37(team){return fbGoalOf37(team==='a'?'b':'a');}

/* ======================================================================================================================================
   A.3 The ball's look (spec §2.1): a 0.22 m panelled ball (truncated icosahedron), scuffed, no wireframe, with a blob shadow
   ====================================================================================================================================== */
function football37Texture(){const F=FOOTBALL37;if(F.tex)return F.tex;return fbQuiet37(fbTextureBuild37);}
function fbTextureBuild37(){const F=FOOTBALL37;
 const lite=typeof qLite==='function'&&qLite(),W=lite?256:512,H=lite?128:256;
 const t=(1+Math.sqrt(5))/2,nrm=v=>{const l=Math.hypot(v[0],v[1],v[2]);return [v[0]/l,v[1]/l,v[2]/l];};
 const V=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(nrm);
 const FACES=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
 const C=V.map(v=>({v,dark:true})).concat(FACES.map(f=>({v:nrm([0,1,2].map(k=>V[f[0]][k]+V[f[1]][k]+V[f[2]][k])),dark:false})));
 const rnd=rng37(9137),G=[16,8],grid=[];for(let k=0;k<(G[0]+1)*(G[1]+1);k++)grid.push(rnd());
 const noise=(u,v)=>{const x=u*G[0],y=v*G[1],i=Math.min(G[0]-1,Math.floor(x)),j=Math.min(G[1]-1,Math.floor(y)),fx=x-i,fy=y-j,s=a=>a*a*(3-2*a),gx=s(fx),gy=s(fy),g=(a,b)=>grid[b*(G[0]+1)+a];
  return (g(i,j)*(1-gx)+g(i+1,j)*gx)*(1-gy)+(g(i,j+1)*(1-gx)+g(i+1,j+1)*gx)*gy;};
 const smudge=[[rnd(),0.25+rnd()*0.5,0.05+rnd()*0.04],[rnd(),0.25+rnd()*0.5,0.04+rnd()*0.04]];
 const px=new Uint8ClampedArray(W*H*4);let dark=0;
 const DK=[0x1E,0x1B,0x18],WH=[0xF4,0xF1,0xEA],SE=[0x9A,0x94,0x8A];
 for(let j=0;j<H;j++){const th=(j+0.5)/H*Math.PI,st=Math.sin(th),ct=Math.cos(th);
  for(let i=0;i<W;i++){const ph=(i+0.5)/W*2*Math.PI,dx=-Math.cos(ph)*st,dy=ct,dz=Math.sin(ph)*st;let b1=-2,b2=-2,c1=null;
   for(const c of C){const d=dx*c.v[0]+dy*c.v[1]+dz*c.v[2];if(d>b1){b2=b1;b1=d;c1=c;}else if(d>b2)b2=d;}
   const a1=Math.acos(Math.min(1,b1)),a2=Math.acos(Math.min(1,b2)),o=(j*W+i)*4;let col;
   if(a2-a1<0.022)col=SE;else if(c1.dark){col=DK;dark++;}else col=WH;
   let m=1;if(col===WH){const u=i/W,v=j/H;m=0.88+0.12*noise(u,v);for(const [su,sv,sr] of smudge){let du=Math.abs(u-su);if(du>0.5)du=1-du;const dd=(du*du*4+(v-sv)*(v-sv))/(sr*sr);if(dd<1)m*=1-0.08*(1-dd);}}
   px[o]=col[0]*m;px[o+1]=col[1]*m;px[o+2]=col[2]*m;px[o+3]=255;}}
 F.texStats={dark:r3_37(dark/(W*H)),w:W,h:H};
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d');
 try{const img=ctx.createImageData(W,H);if(img&&img.data){img.data.set(px);ctx.putImageData(img,0,0);}}catch(e){}
 const tex=new THREE.CanvasTexture(cv);F.tex=tex;return tex;}
// the look swap on the same ball object (other code holds ball.v and its position): no children, the panel texture, radius 0.22
function fbLook37(){return fbQuiet37(fbLookBuild37);}
function fbLookBuild37(){const F=FOOTBALL37;if(typeof ball==='undefined'||!ball)return;
 for(const c of ball.children.slice()){ball.remove(c);c.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.material!==ball.material)o.material.dispose();});}
 if(!(ball.userData&&ball.userData.football37==='panels')){if(ball.geometry)ball.geometry.dispose();             // (the base material is the shared mat() cache entry: never disposed)
  ball.geometry=F.geo||(F.geo=new THREE.SphereGeometry(F.R,F.SEG[0],F.SEG[1]));
  ball.material=F.mat||(F.mat=new THREE.MeshLambertMaterial({map:football37Texture()}));
  ball.userData.football37='panels';}
 ball.castShadow=true;ball.position.y=F.R;if(!Array.isArray(ball.v))ball.v=[0,0];
 ball.h=0;ball.vy=0;ball.held=false;ball.glide=null;ball.fade=null;ball.buried=false;ball.motor=false;
 if(F.shadow&&F.shadow.parent)F.shadow.parent.remove(F.shadow);
 const sh=new THREE.Mesh(F.shGeo||(F.shGeo=new THREE.CircleGeometry(F.SHADOW_R,20)),F.shMat||(F.shMat=new THREE.MeshBasicMaterial({color:'#000000',transparent:true,opacity:0.22,depthWrite:false})));
 sh.rotation.x=-Math.PI/2;sh.position.set(ball.position.x,0.015,ball.position.z);sh.renderOrder=1;sh.userData.football37='shadow';sh.name='football37-shadow';scene.add(sh);F.shadow=sh;}
function fbShadow37(){const F=FOOTBALL37,sh=F.shadow;if(!sh||!ball)return;sh.position.x=ball.position.x;sh.position.z=ball.position.z;
 const op=ball.material&&ball.material.transparent?ball.material.opacity:1;sh.material.opacity=0.22*op*Math.max(0.4,1-(ball.h||0)*0.8);}
function fbBallOpacity37(o){if(!ball||!ball.material)return;const m=ball.material;if(o>=0.999){if(m.transparent){m.transparent=false;m.opacity=1;m.needsUpdate=true;}}else{if(!m.transparent){m.transparent=true;m.needsUpdate=true;}m.opacity=Math.max(0,o);}}

/* ======================================================================================================================================
   A.4 Participants (spec §2.5): humans always, the companion in a match, the children whenever spawned; the online guest is soft only
   ====================================================================================================================================== */
const fbLast37={};
function fbHumans37(){if(typeof players==='undefined'||!players.length)return [];if(fbOnline37())return [NET.myIndex].filter(i=>players[i]);if(fbCompanion37())return players[0]?[0]:[];return [0,1].filter(i=>players[i]);}
// velocity from this module's own last position per participant (the base keeps p.prev only for the companion's drive); a jump longer
// than a fast walk can cover in the frame (a placement, a rescue, a sit) counts as standing still
function fbPersonOf37(p,key,n,kind,team,r,dt){const x=p.g.position.x,z=p.g.position.z,L=fbLast37[key];let vx=0,vz=0;
 if(L&&dt>0){const d=Math.hypot(x-L[0],z-L[1]);if(d<=SPEED*1.6*dt+0.02){vx=(x-L[0])/dt;vz=(z-L[1])/dt;}}if(dt>0)fbLast37[key]=[x,z];
 let fx=p.face?p.face[0]:0,fz=p.face?p.face[1]:1;const fl=Math.hypot(fx,fz)||1;
 return {key,n,kind,idx:p.i,team,pos:[x,z],vel:[vx,vz],face:[fx/fl,fz/fl],r,speed:Math.hypot(vx,vz),lvl:p.lvl||0,y:p.y||0,moving:!!p.moving,g:p.g,p,soft:kind==='guest'};}
function fbRefresh37(dt){const F=FOOTBALL37,out=[];if(typeof players==='undefined')return (F.persons=out);
 const humans=fbHumans37(),match=fbMatchOn37();
 for(const i of humans)out.push(fbPersonOf37(players[i],'p'+i,i,'human','a',PR,dt));
 if(fbCompanion37()&&match&&players[AI.i])out.push(fbPersonOf37(players[AI.i],'ai',2,'companion','a',PR,dt));
 if(fbOnline37()&&NET.isHost)for(const p of players)if(p.i!==NET.myIndex)out.push(fbPersonOf37(p,'g'+p.i,5+p.i,'guest',null,PR,dt));
 // Mr Bassey at the touchline is a soft ball body (r 0.30); he never owns or challenges
 const BS=F.bassey37,bn=BS&&BS.phase==='spot'?fbBasseyNPC37():null;if(bn&&bn.g.visible)out.push({key:'bassey',n:6,kind:'bassey',idx:-1,team:null,pos:[bn.g.position.x,bn.g.position.z],vel:[0,0],face:[0,1],r:0.30,speed:0,lvl:0,y:0,moving:false,g:bn.g,soft:true});
 const K=F.kids;if(K)for(const k of ['kemi','emeka']){const c=K[k];if(!c||!c.g||c.gone)continue;
  out.push({key:k,n:k==='kemi'?3:4,kind:'kid',idx:-1,team:'b',pos:[c.pos[0],c.pos[1]],vel:[c.vel[0],c.vel[1]],face:[c.face[0],c.face[1]],r:F.KIDS[k].r,speed:Math.hypot(c.vel[0],c.vel[1]),lvl:0,y:0,moving:Math.hypot(c.vel[0],c.vel[1])>0.05,g:c.g,kid:c,soft:false});}
 return (F.persons=out);}
function fbPerson37(key){return FOOTBALL37.persons.find(p=>p.key===key)||null;}
// a participant who may not take or touch the ball as a player: a bench holder or bench-seated player, a sofa carrier, anyone seated, off level 0
function fbBarred37(P){if(P.kind==='guest')return true;if((P.y||0)>FOOTBALL37.LEVEL_WALL)return true;const p=P.p;if(!p)return false;
 if(p.g&&p.g.sitting)return true;if(typeof sofa!=='undefined'&&sofa&&sofa.carrying&&sofa.holder&&sofa.holder.includes(p.i))return true;
 if(typeof BENCH36!=='undefined'&&BENCH36&&typeof benchHolderOf36==='function'){const s=BENCH36.state;if((s==='ready'||s==='carrying')&&benchHolderOf36(p.i)>=0&&!BENCH36.paused)return true;}
 return false;}

/* ======================================================================================================================================
   A.5 The physics step (spec §2.3-2.6), host or offline only
   ====================================================================================================================================== */
function fbBlocked37(x,z){FOOTBALL37.cost.blocked++;return blocked(x,z,FOOTBALL37.R,fbOpts37);}
function fbLevel37(x,z){FOOTBALL37.cost.levelAt++;return levelAt(x,z)>FOOTBALL37.LEVEL_WALL;}
function football37Ball(dt){const F=FOOTBALL37,b=ball;if(!b)return;
 // a glide (to the centre, out of the keke's lane, out of a collider) or a fade (the ball fetched) holds the ball
 if(b.fade){const f=b.fade,e=F.t-f.t0;
  if(f.phase==='out'){fbBallOpacity37(1-e/0.25);if(e>=0.25){b.position.x=f.to[0];b.position.z=f.to[1];b.v=[0,0];b.h=0;b.vy=0;f.phase='in';f.t0=F.t;}}
  else{fbBallOpacity37(e/0.25);if(e>=0.25){fbBallOpacity37(1);b.fade=null;if(f.done)f.done();}}
  b.position.y=F.R+(b.h||0);return;}
 if(b.glide){const g=b.glide,k=Math.min(1,(F.t-g.t0)/g.dur),e=k*k*(3-2*k);b.position.x=g.from[0]+(g.to[0]-g.from[0])*e;b.position.z=g.from[1]+(g.to[1]-g.from[1])*e;b.v=[0,0];
  if(k>=1){b.glide=null;if(g.done)g.done();}b.position.y=F.R;return;}
 fbHeight37(dt);
 const st=F.state,canPlay=!b.held&&!b.motor&&st!=='goal'&&st!=='restart'&&st!=='waiting';
 if(!b.held&&!b.motor)fbContacts37(dt,canPlay);
 if(b.held){b.v=[0,0];b.position.y=F.R+(b.h||0);return;}
 fbSubsteps37(dt);
 // the owner never ends a frame inside its own body (a trap or a dribble round a turn)
 const o=F.owner;if(o){const dx=b.position.x-o.pos[0],dz=b.position.z-o.pos[1],d=Math.hypot(dx,dz),m=F.R+o.r;if(d<m&&d>1e-6){const nx=o.pos[0]+dx/d*m,nz=o.pos[1]+dz/d*m;if(!fbBlocked37(nx,nz)&&!fbLevel37(nx,nz)){b.position.x=nx;b.position.z=nz;}}}
 b.position.y=F.R+(b.h||0);}
// height is visual only: a hard shot or a post hit pops it, gravity brings it down, collisions and goals ignore it
function fbHeight37(dt){const b=ball;if(!(b.h>0||b.vy>0))return;b.vy-=9.8*dt;b.h+=b.vy*dt;if(b.h<=0){b.h=0;if(Math.abs(b.vy)<0.6)b.vy=0;else b.vy=-b.vy*0.4;if(b.vy<0.6)b.vy=Math.max(0,b.vy);}}
// (fixer, v37 review I7) the bench while it is carried is no collider for blocked() (the world signature stays as it is), so the ball tests it
// itself: the box of the carried bench, or null; and the outward normal of the face nearest a point inside or touching it
function fbCarried37(){if(typeof BENCH36==='undefined'||!BENCH36||BENCH36.state!=='carrying'||BENCH36.paused||typeof benchBox36!=='function')return null;return benchBox36(BENCH36.pose,0);}
function fbBoxNormal37(x,z,B){const c=Math.cos(B.yaw),s=Math.sin(B.yaw),dx=x-B.x,dz=z-B.z,lx=dx*c-dz*s,lz=dx*s+dz*c;
 if(Math.abs(lx)-B.hx>=Math.abs(lz)-B.hz){const g=lx>=0?1:-1;return {n:[g*c,-g*s],out:(B.hx-Math.abs(lx))};}const g=lz>=0?1:-1;return {n:[g*s,g*c],out:(B.hz-Math.abs(lz))};}
function fbSubsteps37(dt){const F=FOOTBALL37,b=ball,CB=fbCarried37();let vx=b.v[0],vz=b.v[1],s=Math.hypot(vx,vz);
 if(s<0.02&&!(b.h>0)){
  // a carried bench moved onto a resting ball pushes it out of its way, as a walker does
  if(CB&&bench36CircleOBB(b.position.x,b.position.z,F.R,CB)){const q=fbBoxNormal37(b.position.x,b.position.z,CB);vx=q.n[0]*1.0;vz=q.n[1]*1.0;s=1.0;}else{
  // at rest: a player walking into it knocks it on at their walking speed (circle tests only, no blocked() call)
  let kx=0,kz=0,ks=0,kP=null;if(!b.motor)for(const P of F.persons){if((P.y||0)>F.LEVEL_WALL)continue;const ddx=b.position.x-P.pos[0],ddz=b.position.z-P.pos[1],dd=Math.hypot(ddx,ddz);if(dd>=F.R+P.r||dd<1e-6)continue;
   const vpn=P.vel[0]*ddx/dd+P.vel[1]*ddz/dd;if(vpn>ks){ks=vpn;kx=ddx/dd;kz=ddz/dd;kP=P;}}
  if(ks<0.05){b.v=[0,0];F.restT+=dt;if(F.restT>=2.0){F.restT=0;fbBuriedCheck37('rest');}return;}
  vx=fbOwnCap37(kP,kx*ks,0);vz=kz*ks;s=Math.max(Math.hypot(vx,vz),0.02);const P0=F.persons.find(P=>Math.hypot(b.position.x-P.pos[0],b.position.z-P.pos[1])<F.R+P.r);if(P0)fbTouch37(P0,'body');}}
 F.restT=0;
 const n=Math.min(F.SUBMAX,Math.max(1,Math.ceil(s*dt/F.SUB))),h=dt/n,fric=(F.state==='restart'||b.motor)?3:1;
 let inside;const ox0=b.position.x,oz0=b.position.z;
 const escapes=(o,nx,nz,ox,oz)=>{if(inside===undefined)inside=fbBlocked37(ox0,oz0)||null;if(!inside||!o||!(o.x1===inside.x1&&o.z1===inside.z1&&o.x2===inside.x2&&o.z2===inside.z2))return false;
  const cx=(o.x1+o.x2)/2,cz=(o.z1+o.z2)/2;return Math.hypot(nx-cx,nz-cz)>Math.hypot(ox-cx,oz-cz)+1e-9;};
 for(let k=0;k<n;k++){
  const ox=b.position.x,oz=b.position.z;let nx=ox+vx*h,nz=oz;
  // walls, axis-separated: blocked() or a raised level (the stairs, the roof footprint, diorama floors) is a wall for the ball
  let o=fbBlocked37(nx,oz);let lv=!o&&fbLevel37(nx,oz);if((o&&!escapes(o,nx,oz,ox,oz))||lv){const vi=vx;vx=-vx*F.E_WALL;vz*=F.TAN_WALL;nx=ox;fbWall37('x',vi,vx,ox,oz,lv);}
  nz=oz+vz*h;o=fbBlocked37(nx,nz);lv=!o&&fbLevel37(nx,nz);if((o&&!escapes(o,nx,nz,nx,oz))||lv){const vi=vz;vz=-vz*F.E_WALL;vx*=F.TAN_WALL;nz=oz;fbWall37('z',vi,vz,nx,oz,lv);}
  // the cairns: ball-only posts while they are out
  if(F.mesh.cairns.length){for(let pi=0;pi<4;pi++){const c=F.mesh.cairns[pi];if(!c||!c.placed)continue;const px=c.pos[0],pz=c.pos[1],ddx=nx-px,ddz=nz-pz,dd=Math.hypot(ddx,ddz),rr=F.R+F.PITCH.postR;
   if(dd<rr&&dd>1e-6){const ux=ddx/dd,uz=ddz/dd,vn=vx*ux+vz*uz;if(vn<0){const sp=Math.hypot(vx,vz);vx-=(1+F.E_POST)*vn*ux;vz-=(1+F.E_POST)*vn*uz;fbPostHit37(pi,sp);}nx=px+ux*rr;nz=pz+uz*rr;}}}
  // (fixer, I7) the carried bench: the ball bounces off it as off a wall, and one inside it (the bench came onto it) leaves by the nearest face
  if(CB&&bench36CircleOBB(nx,nz,F.R,CB)){const q=fbBoxNormal37(nx,nz,CB),vn=vx*q.n[0]+vz*q.n[1];if(vn<0){const vi=Math.abs(vn);vx-=(1+F.E_WALL)*vn*q.n[0];vz-=(1+F.E_WALL)*vn*q.n[1];fbWall37('bench',vi,vi*F.E_WALL,nx,nz,false);}
   if(!bench36CircleOBB(ox,oz,F.R,CB)){nx=ox;nz=oz;}else{const d=q.out+F.R+0.005;nx+=q.n[0]*d;nz+=q.n[1]*d;}}
  // people: soft bodies (not the owner); a walking player knocks a ball at least at their walking speed
  if(!b.motor)for(const P of F.persons){if(F.owner&&P.key===F.owner.key)continue;if((P.y||0)>F.LEVEL_WALL)continue;if(F.kickBy[P.key]!==undefined&&F.t-F.kickBy[P.key]<0.25)continue;/* a ball just kicked never bounces off its own kicker */const ddx=nx-P.pos[0],ddz=nz-P.pos[1],dd=Math.hypot(ddx,ddz),rr=F.R+P.r;
   if(dd<rr&&dd>1e-6){const ux=ddx/dd,uz=ddz/dd,vn=vx*ux+vz*uz,vpn=Math.max(0,P.vel[0]*ux+P.vel[1]*uz);
    if(vn<vpn){const tw=fbOwnGoal37(P.team||'a')[0]>F.PITCH.cx?1:-1,pre=Math.max(0,vx*tw);let outv=vn<0?-vn*F.E_BODY+0.3*vpn:vn;outv=Math.max(outv,vpn);vx+=(outv-vn)*ux;vz+=(outv-vn)*uz;vx=fbOwnCap37(P,vx,pre);fbTouch37(P,'body');}
    const tx=P.pos[0]+ux*rr,tz=P.pos[1]+uz*rr;if(!fbBlocked37(tx,tz)&&!fbLevel37(tx,tz)){nx=tx;nz=tz;}}}
  // a ball wedged between two people (pushed out of one into the other) does not squeeze through: it stays where it was, and stops
  if(!b.motor&&F.persons.length>1){let wedged=0;for(const P of F.persons){if(F.owner&&P.key===F.owner.key)continue;if((P.y||0)>F.LEVEL_WALL)continue;if(Math.hypot(nx-P.pos[0],nz-P.pos[1])<F.R+P.r-0.01)wedged++;}
   if(wedged){nx=ox;nz=oz;vx*=0.2;vz*=0.2;}}
  // the west edge: the world's invisible bound would bounce it off thin air
  if(nx<F.WEST_STOP){nx=F.WEST_STOP;if(vx<0)vx=0;}
  fbLineTests37(ox,oz,nx,nz,vx,vz);
  b.position.x=nx;b.position.z=nz;
  const sp=Math.hypot(vx,vz);if(sp>1e-6){fbQ37.setFromAxisAngle(fbAx37.set(vz/sp,0,-vx/sp),sp*h/F.R);b.quaternion.premultiply(fbQ37);}
  // friction after the move: dv/dt = -(MU v + DECEL) on the ground; a ball in the air loses only 0.1 v per second
  s=Math.hypot(vx,vz);const s2=b.h>0?s-0.1*s*h:Math.max(0,s-(F.MU*s+F.DECEL)*h*fric);if(s2<0.02){vx=0;vz=0;break;}const sc=s2/s;vx*=sc;vz*=sc;}
 b.v=[vx,vz];}
const fbQ37=new THREE.Quaternion(),fbAx37=new THREE.Vector3();
// a bounce off a wall or a raised level: the normal speeds in and out, and where the centre was (it stops within one sub-step of contact)
function fbWall37(axis,vin,vout,x,z,lv){if(Math.abs(vin)<0.3)return;fbEmit37('wall',{axis,vin:r3_37(Math.abs(vin)),vout:r3_37(Math.abs(vout)),at:[r3_37(x),r3_37(z)],level:!!lv});}
function fbPostHit37(pi,sp){const F=FOOTBALL37,b=ball;const c=F.mesh.cairns[pi];
 if(c&&F.t-(c.hitT||-9)<0.15)return;if(c)c.hitT=F.t;
 if(sp>=6&&!(b.h>0)){b.vy=1.0;b.h=0.001;}
 const lt=F.lastTouch;F.lastPostHit={post:pi,t:F.t,team:lt?lt.team:null};
 if(c){c.wobble=F.t;}
 // the street's call: a human's kick hits a cairn of the goal it is moving towards, and does not go in within 0.5 s
 const east=pi>=2;if(F.OWNER.streetCall&&F.OWNER.mode==='together'&&F.state==='live'&&!F.streetCallUsed&&east&&b.v[0]>0&&lt&&(lt.kind==='human')&&lt.kick)F.pendingCall={t:F.t,team:'a',post:pi,who:lt.who};
 fbEmit37('post',{post:pi,speed:r3_37(sp)});}
// who touched it last: every kick, pop, dribble and body contact updates it (credit for goals, the restart team, square practice)
function fbTouch37(P,how,kick){const F=FOOTBALL37,pv=F.lastTouch;if(P.soft)return;   // (fixer) Mr Bassey and an online guest are only bodies: never credited, never the restart's last touch
 F.lastTouch={who:P.key,team:P.team,t:F.t,kind:P.kind,how,kick:!!kick};if(!pv||pv.who!==P.key||pv.how!==how)fbEmit37('touch',{who:P.key,how});if(how!=='body')F.lastPlay=F.lastTouch;
 if(kick&&F.keepOff&&!F.keepOff.touched)F.keepOff.touched=true;}   // (fixer) only a kick ends a kick-off's or a restart's keep-off: a body touch or a dribble flicker no longer does

/* ---------- contacts first: the trap while charging, the sticky dribble and ownership, challenges (spec §2.5, §3.2) ---------- */
function fbQualifies37(P){const F=FOOTBALL37,b=ball,S2=F.STICKY;if(P.soft||fbBarred37(P))return false;if(P.speed<=S2.minSpeed&&!fbKidWinding37(P))return false;
 const dx=b.position.x-P.pos[0],dz=b.position.z-P.pos[1],d=Math.hypot(dx,dz);if(d>S2.r||d<1e-6)return false;
 if(P.face[0]*dx/d+P.face[1]*dz/d<=S2.dot)return false;
 const lk=F.kickBy[P.key];if(lk!==undefined&&F.t-lk<=S2.grace)return false;
 if(P.kind==='kid'&&P.kid&&P.kid.noBall)return false;
 // nobody walks a hard shot dead: a ball coming faster than STICKY.vmax relative to the player only bounces off them (the owner keeps it)
 if(!(F.owner&&F.owner.key===P.key)&&Math.hypot(b.v[0]-P.vel[0],b.v[1]-P.vel[1])>S2.vmax)return false;
 if(fbOwnGuard37(P))return false;return true;}
// (merger) near our own goal line, a human or the companion walking towards that line no longer takes the ball on (no dribble, no trap): within
// OWN_GUARD.near m of the line and the mouth's width plus OWN_GUARD.side m either side, the ball is only pushed by the body, as any walker pushes
// it, so nobody carries it over their own line by walking back with it.
// (v37 merge) The ball's roll counts too: 3.5 m (it was 1.5 m, and a ball let go there at walking pace rolled the last 1.5 m in on its own), and
// whenever the guard lets a dribble or a trap go, or such a player's body knocks the ball, its speed towards that line is cut to what stops it
// OWN_GUARD.stop m short (fbOwnCap37). A shot or a pass already going in keeps its own speed; only the guarded player's own push is held back.
function fbOwnGuard37(P){const F=FOOTBALL37;if(F.state!=='live'||(P.kind!=='human'&&P.kind!=='companion'))return false;const G=F.OWN_GUARD,Pt=F.PITCH,O=fbOwnGoal37(P.team||'a'),b=ball,tow=O[0]>Pt.cx?1:-1;
 const d=(O[0]-b.position.x)*tow;if(d>G.near||d<-0.5||Math.abs(b.position.z-O[1])>Pt.half+G.side)return false;return P.vel[0]*tow>G.vmin;}
// the distance a ball rolls from speed v on the ground (dv/dt = -(MU v + DECEL)), and the speed that rolls exactly d (bisection, deterministic)
function fbRoll37(v){const F=FOOTBALL37;return v<=0?0:v/F.MU-F.DECEL/(F.MU*F.MU)*Math.log(1+F.MU*v/F.DECEL);}
function fbRollV37(d){if(!(d>0))return 0;let lo=0,hi=40;for(let k=0;k<40;k++){const m=(lo+hi)/2;if(fbRoll37(m)<d)lo=m;else hi=m;}return lo;}
// the ball's x speed after P's touch, with its speed towards P's own line cut so that it stops OWN_GUARD.stop m short (never below pre, the speed
// towards the line it had before P touched it); unchanged unless P is guarded (fbOwnGuard37)
function fbOwnCap37(P,vx,pre){if(!P||!fbOwnGuard37(P))return vx;const F=FOOTBALL37,G=F.OWN_GUARD,O=fbOwnGoal37(P.team||'a'),tow=O[0]>F.PITCH.cx?1:-1;
 const d=(O[0]-ball.position.x)*tow,cap=Math.max(pre||0,fbRollV37(d-G.stop)),vt=vx*tow;return vt>cap?cap*tow:vx;}
// does someone on the other team (in a match) own the ball? In free play everyone is on one side (fixer)
function fbOppOwns37(P){const O=FOOTBALL37.owner;return !!(O&&P&&O.key!==P.key&&O.team&&P.team&&O.team!==P.team);}
// a child standing to shoot keeps the ball at its feet, as a human winding up keeps it with the trap (fixer)
function fbKidWinding37(P){if(P.kind!=='kid'||!FOOTBALL37.owner||FOOTBALL37.owner.key!==P.key)return false;const S7=AI37.st[P.key];return !!(S7&&S7.kick&&S7.kick.kind==='shot');}
// a child may take a human's ball by walking onto it only under the challenge limits: not in the human's first second with it, and at most
// once per kidEvery (kidEverySerious for Kemi while serious) counting its challenges (fixer: every way a child wins the ball is paced alike)
function fbKidBarred37(P,cur){const F=FOOTBALL37,C=F.CHALLENGE;if(P.kind!=='kid'||!cur||cur.kind==='kid'||cur.team===P.team)return false;if(F.t-F.ownerSince<C.graceOwner)return true;
 const every=(P.key==='kemi'&&F.serious)?C.kidEverySerious:C.kidEvery;return F.t-(F.kidChT[P.key]===undefined?-99:F.kidChT[P.key])<every;}
function fbSetOwner37(P){const F=FOOTBALL37,prev=F.owner?F.owner.key:null,next=P?P.key:null;F.owner=P||null;if(prev!==next){F.ownerSince=F.t;F.chT={};fbEmit37('owner',{who:next,from:prev});}}
function fbContacts37(dt,canPlay){const F=FOOTBALL37,b=ball,C=F.CHALLENGE;
 if(!canPlay){if(F.owner)fbSetOwner37(null);return;}
 // a charging player traps the ball at their feet (it counts as ownership, so an opponent can still win it). Only a free ball, their own or
 // a teammate's: an opponent's ball is won by a challenge, never by a press; and not while a challenge's pop keeps everyone off (fixer)
 let trap=null,td=1e9;for(const P of F.persons){if(P.kind!=='human'||!charge37[P.idx]||fbBarred37(P))continue;if(fbOppOwns37(P)||F.t<F.noQualifyUntil-1e-6||fbOwnGuard37(P))continue;const d=Math.hypot(b.position.x-P.pos[0],b.position.z-P.pos[1]);if(d<=F.RELEASE_REACH&&d<td){td=d;trap=P;}}
 if(trap){if(!F.owner||F.owner.key!==trap.key)fbSetOwner37(trap);else F.owner=trap;F.ownerOk37=F.t;
  b.v=[(trap.pos[0]+trap.face[0]*F.TRAP_AHEAD-b.position.x)*8+trap.vel[0],(trap.pos[1]+trap.face[1]*F.TRAP_AHEAD-b.position.z)*8+trap.vel[1]];fbTouch37(trap,'trap');}
 else{
  // ownership: the owner keeps the ball while it still qualifies; otherwise the nearest qualifier (ties to the lower key) or nobody. An owner
  // who stops qualifying for a moment (a turn, a step that slows below 0.3 m/s) keeps it for STICKY.hold unless a teammate qualifies: an
  // opponent cannot walk off with it in that moment, only win it by a challenge (fixer: no owner flicker, no free steals)
  let own=null,keepHold=false,cur=null;if(F.t>=F.noQualifyUntil-1e-6){cur=F.owner?F.persons.find(p=>p.key===F.owner.key):null;
   if(cur&&fbQualifies37(cur))own=cur;else{let bd=1e9;for(const P of F.persons){if(!fbQualifies37(P)||fbKidBarred37(P,cur))continue;const d=Math.hypot(b.position.x-P.pos[0],b.position.z-P.pos[1]);if(d<bd-1e-9||(Math.abs(d-bd)<=1e-9&&own&&P.n<own.n)){bd=d;own=P;}}
    if(cur&&!cur.soft&&!fbBarred37(cur)&&F.t-(F.ownerOk37===undefined?-9:F.ownerOk37)<=F.STICKY.hold+1e-9&&Math.hypot(b.position.x-cur.pos[0],b.position.z-cur.pos[1])<=F.STICKY.holdR&&
     (!own||(own.team&&cur.team&&own.team!==cur.team))){own=cur;keepHold=true;}}}
  // (v37 merge) a dribble or a trap the own-goal guard lets go keeps no speed that would roll it over that player's own line
  if(cur&&(!own||own.key!==cur.key||keepHold)&&fbOwnGuard37(cur))b.v=[fbOwnCap37(cur,b.v[0],0),b.v[1]];
  if(own&&own.kind==='kid'&&F.owner&&F.owner.kind!=='kid'&&own.key!==F.owner.key)F.kidChT[own.key]=F.t;      // a child walking off with a human's ball counts as its challenge
  if((own?own.key:null)!==(F.owner?F.owner.key:null))fbSetOwner37(own);else F.owner=own;
  if(own&&!keepHold){F.ownerOk37=F.t;const S2=F.STICKY;b.v=[own.face[0]*own.speed+(own.pos[0]+own.face[0]*S2.ahead-b.position.x)*S2.gain,own.face[1]*own.speed+(own.pos[1]+own.face[1]*S2.ahead-b.position.z)*S2.gain];fbTouch37(own,'dribble');}}
 // challenges: a non-owner within 0.7 m of the ball, facing it, for 0.25 s in a row takes it (never within 1 s of the owner gaining it;
 // a child against a human at most once every 3 s, or 2 s for Kemi while she is serious); it pops loose at 3 m/s
 const O=F.owner;if(!O){F.chT={};return;}
 for(const P of F.persons){if(P.key===O.key||P.soft||fbBarred37(P))continue;if(fbMatchOn37()&&P.team&&P.team===O.team)continue;
  if(P.kind==='kid'&&P.kid&&!P.kid.mayChallenge){F.chT[P.key]=0;continue;}
  const dx=b.position.x-P.pos[0],dz=b.position.z-P.pos[1],d=Math.hypot(dx,dz);
  if(d>C.d||d<1e-6||P.face[0]*dx/d+P.face[1]*dz/d<=C.face){F.chT[P.key]=0;continue;}
  F.chT[P.key]=(F.chT[P.key]||0)+dt;if(F.chT[P.key]<C.t-1e-9)continue;
  if(F.t-F.ownerSince<C.graceOwner)continue;
  if(P.kind==='kid'&&O.kind!=='kid'){const every=(P.key==='kemi'&&F.serious)?C.kidEverySerious:C.kidEvery;if(F.t-(F.kidChT[P.key]===undefined?-99:F.kidChT[P.key])<every)continue;F.kidChT[P.key]=F.t;}
  const [ux,uz]=fbRot37(dx/d,dz/d,(F.rng()*2-1)*C.spread);b.v=[ux*C.pop,uz*C.pop];
  fbEmit37('challenge',{who:P.key,from:O.key,owner:O.team,kid:P.kind==='kid'});fbSetOwner37(null);F.noQualifyUntil=F.t+C.regain;fbTouch37(P,'challenge');F.chT={};break;}}

/* ---------- per sub-step: goals, outs and the square's white goal (spec §6.5, §4.4, §4.6) ---------- */
function fbLineTests37(ox,oz,nx,nz,vx,vz){const F=FOOTBALL37,P=F.PITCH,b=ball;
 if(F.state==='live'&&!b.held&&!b.motor){
  // a goal: the centre crosses a goal line moving towards it, between the posts
  if(ox<P.x2&&nx>=P.x2&&vx>0){const zc=oz+(nz-oz)*(P.x2-ox)/((nx-ox)||1e-9);if(Math.abs(zc-P.zc)<P.half){football37Goal('a','line',[P.x2,zc]);return;}}
  if(ox>P.x1&&nx<=P.x1&&vx<0){const zc=oz+(nz-oz)*(P.x1-ox)/((nx-ox)||1e-9);if(Math.abs(zc-P.zc)<P.half){football37Goal('b','line',[P.x1,zc]);return;}}
  // an out: the centre 0.3 m past a line without scoring
  if(nx<P.x1-F.OUT||nx>P.x2+F.OUT||nz<P.z1-F.OUT||nz>P.z2+F.OUT)fbOut37(nx,nz);}
 // the square's goal: free-play practice after discovery
 const L=fbSave37(),G=F.SQUARE_GOAL;if(L&&!fbMatchOn37()&&F.t-F.squareT>=G.every){const lt=F.lastTouch;
  if(lt&&lt.kind==='human'&&F.t-lt.t<=G.recent&&((ox<G.x&&nx>=G.x)||(ox>G.x&&nx<=G.x))){const zc=oz+(nz-oz)*(G.x-ox)/((nx-ox)||1e-9);
   if(zc>G.z1+F.R&&zc<G.z2-F.R){F.squareT=F.t;L.square=(L.square||0)+1;fbToast37(fbFill37(F.LINES.toasts.square,{n:L.square}));
    const day=S.day;if(L.squareDay!==day){L.squareDay=day;fbLog37('ball','square');}fbEmit37('square',{n:L.square});}}}}

/* ---------- buried balls, the stuck reset and the ball's home (spec §2.6) ---------- */
function fbFreeAt37(x,z){const F=FOOTBALL37;if(fbBlocked37(x,z))return false;if(levelAt(x,z)>F.LEVEL_WALL)return false;for(const P of F.persons)if(Math.hypot(x-P.pos[0],z-P.pos[1])<F.R+P.r)return false;return true;}
function fbRing37(x,z){for(let r=0.30;r<=1.5001;r+=0.15)for(let k=0;k<16;k++){const a=k/16*Math.PI*2,px=x+Math.sin(a)*r,pz=z+Math.cos(a)*r;if(fbFreeAt37(px,pz))return [px,pz];}return null;}
function football37Buried(){const F=FOOTBALL37;if(!ball)return false;const x=ball.position.x,z=ball.position.z;return !!fbBlocked37(x,z)||levelAt(x,z)>F.LEVEL_WALL;}
function fbBuriedCheck37(why){const F=FOOTBALL37;if(!ball||ball.glide||ball.fade||fbGuest37())return false;if(!football37Buried())return false;
 const spot=fbRing37(ball.position.x,ball.position.z);ball.buried=true;ball.v=[0,0];
 if(spot){ball.glide={from:[ball.position.x,ball.position.z],to:spot,t0:F.t,dur:0.3,done:()=>{ball.buried=false;}};}
 else{const h=F.HOME,s2=fbFreeAt37(h[0],h[1])?h:(fbRing37(h[0],h[1])||h);ball.fade={phase:'out',t0:F.t,to:s2,done:()=>{ball.buried=false;}};}
 fbEmit37('buried',{why});return true;}
function football37BallHome(){const F=FOOTBALL37;if(!ball||fbMatchOn37()||fbGuest37())return false;const h=F.HOME,s2=fbFreeAt37(h[0],h[1])?h:(fbRing37(h[0],h[1])||h);
 ball.glide=null;ball.v=[0,0];ball.fade={phase:'out',t0:F.t,to:s2};fbSetOwner37(null);return true;}
// cheap per-frame watch: the crate's position, the bench's and the sofa's states (no blocked() call unless one changed)
// (fixer, v37 review I7) and the grounded bench's pose: a reset that moves it re-runs the buried check
function fbWatch37(){const F=FOOTBALL37;const c=typeof crate!=='undefined'&&crate?crate.position.x+','+crate.position.z:'';const bs=typeof BENCH36!=='undefined'&&BENCH36?BENCH36.state+(BENCH36.paused?'p':'')+(BENCH36.state==='grounded'&&BENCH36.pose?'@'+Math.round(BENCH36.pose.x*100)+','+Math.round(BENCH36.pose.z*100)+','+Math.round(BENCH36.pose.yaw*100):''):'';const ss=S&&S.sofa?S.sofa.state+(typeof sofa!=='undefined'&&sofa&&sofa.carrying?'c':''):'';
 const ch=c!==F.lastCrate||bs!==F.lastBench||ss!==F.lastSofa;F.lastCrate=c;F.lastBench=bs;F.lastSofa=ss;if(ch&&F.watchArmed)fbBuriedCheck37('watch');F.watchArmed=true;}

/* ======================================================================================================================================
   A.6 Inputs: press, hold, release (spec §3.1)
   ====================================================================================================================================== */
const held37=[false,false],prevHeld37=[false,false],touchHeld37=[false,false],inputKind37=['key','key'],charge37=[null,null];
function fbKeysHeld37(i){if(typeof keys==='undefined')return false;return i===0?!!keys['e']:!!(keys['enter']||keys['/']||keys['shift']);}
// the hold, read from the game's own state each step (keys, the module's touch listeners); pads are taps in Phase 1
function fbReadHeld37(){for(const i of [0,1])prevHeld37[i]=held37[i];
 if(fbCompanion37()||fbOnline37()){const any=fbKeysHeld37(0)||fbKeysHeld37(1)||touchHeld37[0]||touchHeld37[1],me=fbOnline37()?NET.myIndex:0;held37[0]=held37[1]=false;held37[me]=any;}
 else{held37[0]=fbKeysHeld37(0)||touchHeld37[0];held37[1]=fbKeysHeld37(1)||touchHeld37[1];}}
function fbCancel37(i){if(i===undefined){charge37[0]=charge37[1]=null;}else charge37[i]=null;}
// a press through the kick37 hotspot (ACT_HOOKS): a held key's auto-repeat never restarts a charge
function football37Press(i){const F=FOOTBALL37;if(fbGuest37()||!ball||typeof players==='undefined'||!players[i])return true;
 if(charge37[i]||prevHeld37[i])return true;                                       // the repeat guard
 const p=players[i],d=Math.hypot(ball.position.x-p.g.position.x,ball.position.z-p.g.position.z);if(d>F.REACH+F.PRESS_SLACK||ball.held||ball.motor||F.state==='goal')return true;
 if(fbOppOwns37(fbPerson37('p'+i)))return true;                                     // (fixer) an opponent's ball is won by a challenge, not a press
 const li=typeof lastInput!=='undefined'?lastInput[i]:'key';inputKind37[i]=li==='touch'?'touch':li==='pad'?'pad':'key';
 charge37[i]={t0:F.t,kind:inputKind37[i],idle:true};fbHUD37();return true;}
function fbChargeK37(i){const F=FOOTBALL37,c=charge37[i];if(!c)return 0;const TAP=F.TAP[c.kind]||F.TAP.key;return fbClamp37((F.t-c.t0-TAP)/(F.FULL-TAP),0,1);}
function fbChargeLabel37(i){const F=FOOTBALL37,c=charge37[i];const e=c?F.t-c.t0:0,cells=1+Math.min(3,Math.floor(Math.min(1,e/F.FULL)*3+1e-9));return 'Shoot '+'▮'.repeat(cells)+'▯'.repeat(4-cells);}
// the step's part of the input: track the hold, release on let-go or at the auto-release, resolve two releases in one frame
function fbInputs37(){const F=FOOTBALL37;fbReadHeld37();const rel=[];
 for(const i of [0,1]){const c=charge37[i];if(!c)continue;
  if(c.kind==='touch'&&typeof sticks!=='undefined'&&sticks[i]&&Math.hypot(sticks[i].v[0],sticks[i].v[1])>0.2)c.idle=false;
  if(fbCompanion37()&&typeof sticks!=='undefined'&&c.kind==='touch'&&sticks[1-i]&&Math.hypot(sticks[1-i].v[0],sticks[1-i].v[1])>0.2)c.idle=false;
  const e=F.t-c.t0;if(!held37[i])rel.push({i,held:e});else if(e>=F.FULL+F.AUTO-1e-9)rel.push({i,held:F.FULL+F.AUTO});}
 if(rel.length===2){const d=k=>{const p=players[rel[k].i];return Math.hypot(ball.position.x-p.g.position.x,ball.position.z-p.g.position.z);};
  if(d(0)<=F.RELEASE_REACH&&d(1)<=F.RELEASE_REACH){const keep=d(0)<d(1)-1e-9?0:d(1)<d(0)-1e-9?1:(rel[0].i<rel[1].i?0:1);charge37[rel[1-keep].i]=null;rel.splice(1-keep,1);}}
 for(const r of rel)football37Release(r.i,r.held);}
function football37Release(i,heldT){const F=FOOTBALL37,c=charge37[i];if(!c)return false;charge37[i]=null;fbHUD37();
 const p=players[i];if(!p||!ball)return false;const held=heldT===undefined?F.t-c.t0:heldT;
 if(ball.held||ball.motor||F.state==='goal'||F.state==='restart'||F.state==='waiting')return false;
 const bx=ball.position.x,bz=ball.position.z,dx=bx-p.g.position.x,dz=bz-p.g.position.z,d=Math.hypot(dx,dz);
 if(fbOppOwns37(fbPerson37('p'+i)))return false;                                    // (fixer) the ball was won by an opponent during the charge
 if(d>F.RELEASE_REACH){fbEmit37('whiff',{who:'p'+i,d:r3_37(d)});fbDust37(p.g.position.x,p.g.position.z);return false;}
 const P=fbPerson37(fbOnline37()?'p'+NET.myIndex:'p'+i)||fbPersonOf37(p,'p'+i,i,'human','a',PR,0);
 const TAP=F.TAP[c.kind]||F.TAP.key,k=fbClamp37((held-TAP)/(F.FULL-TAP),0,1),raw=F.KMIN+(F.KMAX-F.KMIN)*k;
 const plan=fbClassify37(P,raw,c);football37Kick(P,plan.dir,plan.speed,plan.kind,{held:r3_37(held),k:r3_37(k),raw:r3_37(raw),act:true,aim:plan.aim||null,recv:plan.recv||null});return true;}

/* ======================================================================================================================================
   A.7 The kick (spec §3.2): one function launches the ball, for humans, the children and the companion
   ====================================================================================================================================== */
// classification by situation: a shot when the attacked goal is in the cone (a match only), a pass under 7 m/s with a teammate in the
// pass cone, otherwise a kick along the facing at the raw speed
function fbClassify37(P,raw,c){const F=FOOTBALL37,b=ball,bx=b.position.x,bz=b.position.z;let fx=P.face[0],fz=P.face[1];
 const dx=bx-P.pos[0],dz=bz-P.pos[1],d=Math.hypot(dx,dz);
 if(d>1e-6&&(fx*dx+fz*dz)/d<-0.2)return {dir:[dx/d,dz/d],speed:Math.min(raw,F.KMIN),kind:'kick'};   // the ball behind: a back-heel from the centre through the ball, at tap speed
 const team=P.team||'a';
 if(fbPlaying37()&&F.state==='live'){const G=fbGoalOf37(team),ang=fbAng37(fx,fz,G[0]-bx,G[1]-bz),kind=c?c.kind:'key';
  const A=kind==='touch'?(c&&c.idle?F.ASSIST.touchIdle:F.ASSIST.touch):kind==='pad'?F.ASSIST.pad:F.ASSIST.key;
  const front=team==='a'?bx<G[0]-F.SHOT_FRONT:bx>G[0]+F.SHOT_FRONT;
  if(front&&ang<=A&&Math.hypot(G[0]-bx,G[1]-bz)<=F.SHOT_RANGE){const aim=fbClearAim37(bx,bz,fbShotAim37(bx,bz,fx,fz,G),G);if(aim){const ax=aim[0]-bx,az=aim[1]-bz,al=Math.hypot(ax,az)||1;return {dir:[ax/al,az/al],speed:raw,kind:'shot',aim};}}}   // (fixer) never aimed into the near stone
 const R=fbPassCandidate37(P,fx,fz);
 if(R&&raw<F.PASS_BELOW){const s=football37PassSolve([bx,bz],R);return {dir:s.dir,speed:s.v0,kind:'pass',recv:R.key,aim:s.aim};}
 return {dir:[fx,fz],speed:raw,kind:'kick'};}
// the point of [zc-0.65, zc+0.65] on the goal line nearest the facing ray (the clean window for a 0.22 ball is zc +/- 0.82)
function fbShotAim37(bx,bz,fx,fz,G){const F=FOOTBALL37;let z;if(Math.abs(fx)>1e-6&&(G[0]-bx)*fx>0)z=bz+fz*(G[0]-bx)/fx;else z=bz;return [G[0],fbClamp37(z,G[1]-F.AIM_HALF,G[1]+F.AIM_HALF)];}
// does the line from the ball to the aim point pass clear of every placed cairn (ball radius + post radius)?
// the aim point moved along the mouth, from where the facing points towards the middle and on to the far post, until the line from the ball
// clears both stones; null when no point in the window does (fixer: a shot from a tight angle goes in past the near stone, not into it)
function fbClearAim37(bx,bz,aim,G){const F=FOOTBALL37;if(fbClearOfPosts37(bx,bz,aim))return aim;const lo=G[1]-F.AIM_HALF,hi=G[1]+F.AIM_HALF,dir=bz>G[1]?-1:1;
 for(let z=aim[1];z>=lo-1e-9&&z<=hi+1e-9;z+=dir*0.05){const a=[aim[0],z];if(fbClearOfPosts37(bx,bz,a))return a;}return null;}
function fbClearOfPosts37(bx,bz,aim){const F=FOOTBALL37,rr=F.R+F.PITCH.postR;for(const c of F.mesh.cairns){if(!c.placed)continue;if(fbSegDist37(c.pos,[bx,bz],aim)<rr)return false;}return true;}
function fbTeammates37(P){const F=FOOTBALL37;if(fbMatchOn37())return F.persons.filter(Q=>Q.key!==P.key&&Q.team&&Q.team===P.team&&!Q.soft);
 if(P.kind==='human'&&fbLocalPair37())return F.persons.filter(Q=>Q.kind==='human'&&Q.key!==P.key);return [];}
function fbPassCandidate37(P,fx,fz){const F=FOOTBALL37,b=ball;let best=null,ba=1e9;
 for(const Q of fbTeammates37(P)){const dx=Q.pos[0]-b.position.x,dz=Q.pos[1]-b.position.z,dd=Math.hypot(dx,dz);if(dd>F.PASS_MAX||dd<0.3)continue;const a=fbAng37(fx,fz,dx,dz);if(a<=F.PASS_CONE&&a<ba){ba=a;best=Q;}}
 return best;}
// the closed-form roll: distance covered from v0 down to va, and the time it takes (dv/dt = -(0.8 v + 1))
function fbRollD37(v0,va){const F=FOOTBALL37,c=F.DECEL/F.MU;return (v0-va)/F.MU-c*Math.log((v0+c)/(va+c))/F.MU;}
function fbRollT37(v0,va){const F=FOOTBALL37,c=F.DECEL/F.MU;return Math.log((v0+c)/(va+c))/F.MU;}
// the iterative lead: aim where a running receiver will be when the ball arrives, arriving at a takeable speed
function football37PassSolve(from,recv){const F=FOOTBALL37,P=F.PITCH;let A=[recv.pos[0],recv.pos[1]],v0=F.KMIN,T=0;
 const rv=recv.vel||[0,0];
 for(let it=0;it<F.PASS_ITER;it++){const dx=A[0]-from[0],dz=A[1]-from[1],d=Math.hypot(dx,dz)||1e-6,ux=dx/d,uz=dz/d;
  const va=Math.max(F.PASS_ARRIVE,1.0+(rv[0]*ux+rv[1]*uz));
  let lo=F.KMIN,hi=F.PASS_VMAX;if(fbRollD37(hi,va)<=d)v0=hi;else if(fbRollD37(lo,Math.min(va,lo))>=d)v0=lo;else{for(let k=0;k<12;k++){const m=(lo+hi)/2;if(fbRollD37(m,va)<d)lo=m;else hi=m;}v0=(lo+hi)/2;}
  const vEnd=Math.min(va,v0);let Tm;if(fbRollD37(v0,0)<=d)Tm=fbRollT37(v0,0);else{let a=0,c=v0;for(let k=0;k<20;k++){const m=(a+c)/2;if(fbRollD37(v0,m)>d)a=m;else c=m;}Tm=fbRollT37(v0,(a+c)/2);}
  T=Tm;A=[recv.pos[0]+rv[0]*T,recv.pos[1]+rv[1]*T];
  if(fbMatchOn37())A=[fbClamp37(A[0],P.x1+0.5,P.x2-0.5),fbClamp37(A[1],P.z1+0.5,P.z2-0.5)];void vEnd;}
 const dx=A[0]-from[0],dz=A[1]-from[1],d=Math.hypot(dx,dz)||1e-6;return {dir:[dx/d,dz/d],v0,aim:A,T};}
function football37Kick(person,dir,speed,kind,info){const F=FOOTBALL37,b=ball;if(!b)return false;
 const P=typeof person==='string'?fbPerson37(person):person;if(!P)return false;
 const dl=Math.hypot(dir[0],dir[1])||1,ux=dir[0]/dl,uz=dir[1]/dl;b.v=[ux*speed,uz*speed];b.held=false;
 if(speed>=9&&kind==='shot'){b.vy=1.2;b.h=Math.max(b.h||0,0.001);}                 // a hard shot pops (visual only)
 F.kickBy[P.key]=F.t;b.kickT=F.t;fbSetOwner37(null);fbTouch37(P,kind,true);F.noQualifyUntil=Math.min(F.noQualifyUntil,F.t);
 // the kick swing on the kicker's legs: full for shots, 60% for passes, 30% for keepy-up touches
 if(P.g)P.g.userData.swing37={t0:F.t,amp:kind==='shot'||(kind==='kick'&&speed>7)?1:kind==='touch'?0.3:0.6};
 const st=F.stats;if(st&&P.kind==='human'){const k='p'+P.idx;st.kicks[k]=(st.kicks[k]||0)+1;if(kind==='pass')st.passes[k]=(st.passes[k]||0)+1;}
 // the first Act kick: discovery (spec §7.6) and the day's first kick in the log
 if(info&&info.act&&P.kind==='human'){const fresh=!fbSave37();const L=fbEnsureSave37();if(L){if(fresh)fbToast37(F.OWNER.children?F.LINES.toasts.firstKick:F.LINES.toasts.firstKickAlone);if(L.kickDay!==S.day){L.kickDay=S.day;fbLog37('ball','kick');}}}
 fbEmit37('kick',Object.assign({who:P.key,team:P.team,kind,speed:r3_37(speed),dir:[r3_37(ux),r3_37(uz)],at:[r3_37(b.position.x),r3_37(b.position.z)]},info||{}));
 fbTwinKick37(P,speed);return true;}

/* ======================================================================================================================================
   A.8 The pitch (spec §4.2, §4.3): stone cairns placed by the children, Emeka's slippers, faint broken lines
   ====================================================================================================================================== */
function fbStone37(w,h,d,col,seed){const r=rng37(seed),g=new THREE.IcosahedronGeometry(1,1),p=g.attributes.position;
 for(let k=0;k<p.count;k++){const j=1+(r()*2-1)*0.08;p.setXYZ(k,p.getX(k)*j*w/2,p.getY(k)*j*h/2,p.getZ(k)*j*d/2);}g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:col}));m.castShadow=true;m.rotation.y=r()*Math.PI*2;return m;}
// one template (shared geometry and materials), cloned per post; the chalk band is in the defending team's colour
function football37Cairn(){const F=FOOTBALL37;if(F.cairnT)return F.cairnT;return fbQuiet37(fbCairnBuild37);}
function fbCairnBuild37(){const F=FOOTBALL37;const T={};
 for(const team of ['a','b']){const g=new THREE.Group();const parts=[[0.30,0.18,0.26,'#DCD5C6'],[0.24,0.15,0.21,'#EDE7DA'],[0.17,0.14,0.16,'#CFC7B6']];let y=0;   // (fixer) pale limestone: reads against the sand and the street
  parts.forEach(([w,h,d,c],k)=>{const s=fbStone37(w,h,d,c,370+k*7+(team==='b'?3:0));s.position.y=y+h/2;y+=h-0.003;g.add(s);});
  g.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(g),sc=F.PITCH.cairnH/(bb.max.y-bb.min.y);for(const c of g.children){c.position.y=(c.position.y-bb.min.y)*sc;c.scale.y=sc;}
  const band=new THREE.Mesh(new THREE.TorusGeometry(0.14,0.022,6,24),new THREE.MeshLambertMaterial({color:F.COL[team]}));band.rotation.x=Math.PI/2;band.position.y=0.06;g.add(band);
  g.userData.football37='post';T[team]=g;}
 return (F.cairnT=T);}
function fbSlippers37(){const g=new THREE.Group(),sole=new THREE.MeshLambertMaterial({color:'#2F6DB5'}),strap=new THREE.MeshLambertMaterial({color:'#F4F1EA'});
 for(const [dx,dz,ry] of [[0,0,0.35],[0.06,0.17,-0.25]]){const s=new THREE.Group();const so=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.025,14),sole);so.scale.set(0.135,1,0.05);s.add(so);
  for(const side of [-1,1]){const st=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.012,0.012),strap);st.position.set(0.02,0.018,side*0.022);st.rotation.y=side*0.6;s.add(st);}
  s.position.set(dx,0.013,dz);s.rotation.y=ry;g.add(s);}
 g.position.set(-17.45,0,8.4);g.userData.football37='slipper';g.name='football37-slippers';return g;}
// six faint, broken decals: two touchlines, two goal-line strips with the mouths cut out, two mouths
function fbLines37(){const F=FOOTBALL37,P=F.PITCH,r=rng37(3700+F.matchNo),out=[];
 const strip=(segs,op,hw)=>{const pos=[];for(const [x0,z0,x1,z1] of segs){const L=Math.hypot(x1-x0,z1-z0),ux=(x1-x0)/L,uz=(z1-z0)/L,nx=-uz*(hw||0.025),nz=ux*(hw||0.025);
   const dashes=[];if(op>=0.6)dashes.push([0,L]);else for(let m=0;m<L;m+=1){const cov=0.6+r()*0.25,len=Math.min(1,L-m),n=1+Math.floor(r()*2),dl=len*cov/n,gap=len*(1-cov)/n;let s=m+gap*r();for(let q=0;q<n;q++){dashes.push([s,Math.min(m+len,s+dl)]);s+=dl+gap;}}
   for(const [a,b] of dashes){if(b<=a)continue;const ax=x0+ux*a,az=z0+uz*a,bx=x0+ux*b,bz=z0+uz*b;pos.push(ax-nx,0,az-nz,bx-nx,0,bz-nz,bx+nx,0,bz+nz,ax-nx,0,az-nz,bx+nx,0,bz+nz,ax+nx,0,az+nz);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:'#FFFFFF',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));m.position.y=0.025;m.renderOrder=1;m.userData.football37='line';m.userData.op37=op;m.name='football37-line';return m;};
 const a=P.zc-P.half,b=P.zc+P.half;
 out.push(strip([[P.x1,P.z1,P.x2,P.z1]],0.3),strip([[P.x1,P.z2,P.x2,P.z2]],0.3));
 out.push(strip([[P.x1,P.z1,P.x1,a],[P.x1,b,P.x1,P.z2]],0.3),strip([[P.x2,P.z1,P.x2,a],[P.x2,b,P.x2,P.z2]],0.3));
 out.push(strip([[P.x1,a,P.x1,b]],F.MOUTH.op,F.MOUTH.hw),strip([[P.x2,a,P.x2,b]],F.MOUTH.op,F.MOUTH.hw));return out;}   // (fixer) the mouths read at a glance
function fbPitchOut37(){return fbQuiet37(fbPitchBuild37);}
function fbPitchBuild37(){const F=FOOTBALL37;fbPitchClear37(true);const T=football37Cairn(),posts=fbPostsAt37();
 F.mesh.cairns=posts.map((p,k)=>{const g=T[k<2?'a':'b'].clone();g.position.set(p[0],0,p[1]);g.visible=false;g.scale.setScalar(0.6);g.userData.football37='post';g.userData.post37=k;scene.add(g);return {g,pos:p,placed:false,t0:0,by:k<2?'kemi':'emeka',k};});
 F.mesh.lines=fbLines37();for(const l of F.mesh.lines)scene.add(l);F.mesh.slippers=null;F.lineFade={t0:F.t,dir:1};}
function fbPlaceCairn37(k,who){return fbQuiet37(()=>fbPlaceCairnQ37(k,who));}
function fbPlaceCairnQ37(k,who){const F=FOOTBALL37,c=F.mesh.cairns[k];if(!c||c.placed)return;c.placed=true;c.t0=F.t;c.g.visible=true;c.g.scale.setScalar(0.6);c.placedBy=who||null;
 fbEmit37('cairn',{k,who:who||null,at:c.pos.slice()});fbDust37(c.pos[0],c.pos[1]);
 if(c.by==='emeka'&&!F.mesh.slippers){const s=fbSlippers37();scene.add(s);F.mesh.slippers=s;}}
// immediate: every football37 mesh but the ball, its shadow, the children and their plastic ball goes (shared template geometry kept)
function fbPitchClear37(){const F=FOOTBALL37;for(const c of F.mesh.cairns)if(c.g.parent)c.g.parent.remove(c.g);F.mesh.cairns=[];
 for(const l of F.mesh.lines){if(l.parent)l.parent.remove(l);l.geometry.dispose();l.material.dispose();}F.mesh.lines=[];
 if(F.mesh.slippers){const s=F.mesh.slippers;if(s.parent)s.parent.remove(s);s.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});F.mesh.slippers=null;}F.lineFade=null;}
function fbPitchAnim37(dt){const F=FOOTBALL37;
 for(const c of F.mesh.cairns){if(!c.placed)continue;const e=F.t-c.t0;
  if(c.clearT!==undefined){const k=Math.min(1,(F.t-c.clearT)/0.2);c.g.scale.setScalar(1-0.4*k);c.g.visible=k<1;continue;}
  c.g.scale.setScalar(e>=0.15?1:0.6+0.4*e/0.15);
  const w=c.wobble!==undefined?F.t-c.wobble:9;c.g.rotation.z=w<0.3?Math.sin(w*40)*6*D2R37*(1-w/0.3):0;}
 const lf=F.lineFade;if(lf){const k=Math.min(1,(F.t-lf.t0)/0.6);for(const l of F.mesh.lines)l.material.opacity=l.userData.op37*(lf.dir>0?k:1-k);}}

/* ======================================================================================================================================
   A.9 Flags (spec §17), each applied once: stored, removed from the URL, remembered for the tab so an F5 never re-applies one
   ====================================================================================================================================== */
// (merger) the flag's hours hold for the rest of the tab's session: the value applied is kept in sessionStorage['football37.session'], and a reload
// (F5) with no flag in the address reads it back as the same hours (fl.restored), re-running nothing: a flag is still applied once only, playtest:true
// is stored at discovery as before, and a new tab starts without it
function fbFlagSet37(fl,v){fl.on=true;fl.value=v;if(v==='now')fl.now=true;if(v==='playtest')fl.playtest=true;}
function football37Flags(){const F=FOOTBALL37;if(F.flags)return F.flags;const fl={};F.flags=fl;
 try{const q=new URLSearchParams((typeof location!=='undefined'&&location.search)||'');if(q.has('football')){const v=q.get('football')||'on';let seen=false;
   try{seen=typeof sessionStorage!=='undefined'&&sessionStorage.getItem('football37.flag.'+v)==='1';}catch(e){}
   if(!seen){fbFlagSet37(fl,v);try{if(typeof sessionStorage!=='undefined'){sessionStorage.setItem('football37.flag.'+v,'1');sessionStorage.setItem('football37.session',v);}}catch(e){}}
   q.delete('football');try{if(typeof history!=='undefined'&&history.replaceState){const s=q.toString();history.replaceState(null,'',location.pathname+(s?'?'+s:'')+(location.hash||''));}}catch(e){}}
  if(!fl.on){let v=null;try{v=typeof sessionStorage!=='undefined'?sessionStorage.getItem('football37.session'):null;}catch(e){}if(typeof v==='string'&&v){fbFlagSet37(fl,v);fl.restored=true;}}}catch(e){}
 return fl;}

/* ======================================================================================================================================
   A.10 The children's window, spawn and despawn (spec §5.3), and the day's hours
   ====================================================================================================================================== */
function fbWeekday37(day){return ((day-1)%7+7)%7;}                 // 0 Saturday, 1 Sunday, 2-6 the school days (WEEK: day 1 is a Saturday)
function fbHours37(day){const F=FOOTBALL37,H=F.HOURS,w=fbWeekday37(day);if(football37Flags().on)return H.flag;return w===0?H.sat:w===1?[F.OWNER.sundayFrom,H.sun[1]]:H.weekday;}
function football37Window(){const F=FOOTBALL37;if(!S||!S.p||!F.OWNER.children)return false;const fl=football37Flags();
 if(!(S.day>=2||fl.on))return false;const h=fbHours37(S.day);if(!(S.time>=h[0]&&S.time<h[1]))return false;
 if(fbOnline37()||S.phase!=='play'||fbPartyOn37())return false;if(fbHomeToday37())return false;return true;}
// (fixer) Mama Nkechi's call holds for the rest of the day across a reload: read from the saved last match as well as the runtime mark
function fbHomeToday37(){const F=FOOTBALL37,L=fbSave37();return F.homeDay===S.day||!!(L&&L.last&&L.last.day===S.day&&L.last.called);}
function fbPlayedToday37(){const F=FOOTBALL37,L=fbSave37();return F.lastMatchDay===S.day||!!(L&&L.last&&L.last.day===S.day);}
// (v37 merge) the line follows tomorrow's hours, so in playtest mode (out from 06:00 every day) it is "Tomorrow morning!", never "after school"
function fbLateLine37(){const w=fbWeekday37(S.day+1),T=FOOTBALL37.LINES.shouts.late;if(fbHours37(S.day+1)[0]<12)return T.sat;return w===1?T.sun:T.school;}
function fbCentreDist37(i){const p=players[i];if(!p)return 1e9;const P=FOOTBALL37.PITCH;return Math.hypot(p.g.position.x-P.cx,p.g.position.z-P.zc);}

/* ---------- the children's models (scale, head after the mixer, Emeka's bare feet) ---------- */
function fbKidModel37(key){const F=FOOTBALL37,K=F.KIDS[key];let g=null,lite=false;
 try{if(typeof makeHeroAvatar==='function'&&typeof HERO!=='undefined'&&HERO.state==='ready')g=makeHeroAvatar(Object.assign({},K.look,{rig:'hero'}));}catch(e){g=null;}
 if(!g){lite=true;try{g=makeAvatar(Object.assign({},K.look),true);}catch(e){g=null;}}
 if(!g){g=new THREE.Group();const m=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.2,1.3,10),new THREE.MeshLambertMaterial({color:K.look.oc}));m.position.y=0.65;g.add(m);}
 g.traverse(o=>{if(o.isMesh&&o.material){if(Array.isArray(o.material))o.material=o.material.map(m=>{const c=m.clone();c.name=m.name;return c;});else{const n=o.material.name;o.material=o.material.clone();o.material.name=n;}}});   // its own materials (fades never touch a shared one)
 g.scale.setScalar(K.scale);g.userData.football37='kid';g.userData.kid37=key;g.userData.lite37=lite;
 if(!lite&&key==='emeka'){const skin=new THREE.Color(K.look.skin),sole=skin.clone();   // (fixer) one skin colour, no darker sole: a raised foot reads as a foot
  g.traverse(o=>{if(!o.isMesh)return;if(o.userData&&o.userData.wardrobe&&/sneaker|sandal/.test(o.userData.wardrobe)){o.visible=false;return;}
   const mats=Array.isArray(o.material)?o.material:[o.material];let hit=false;const out=mats.map(m=>{if(m&&(m.name==='shoe'||m.name==='sole')){hit=true;const c=m.clone();c.name=m.name;c.color.copy(m.name==='shoe'?skin:sole);if(c.map)c.map=null;return c;}return m;});
   if(hit){o.material=Array.isArray(o.material)?out:out[0];o.visible=true;}});}
 return g;}
function fbKidBall37(){const g=new THREE.SphereGeometry(0.11,12,8),p=g.attributes.position,col=[];const Y=new THREE.Color('#F2C230'),Rd=new THREE.Color('#D2342A');
 for(let k=0;k<p.count;k++){const c=p.getY(k)>=0?Y:Rd;col.push(c.r,c.g,c.b);}g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.castShadow=true;m.userData.football37='kidball';m.name='football37-kidball';return m;}
function fbKidFade37(c,o){c.opacity=o;if(!c.g)return;c.g.visible=o>0.001;c.g.traverse(m=>{if(!m.isMesh||!m.material)return;const ms=Array.isArray(m.material)?m.material:[m.material];
 for(const q of ms){if(q.userData.fbBaseT37===undefined){q.userData.fbBaseT37=!!q.transparent;q.userData.fbBaseO37=q.opacity===undefined?1:q.opacity;}
  if(o>=0.999){q.transparent=q.userData.fbBaseT37;q.opacity=q.userData.fbBaseO37;}else{q.transparent=true;q.opacity=q.userData.fbBaseO37*o;}}});}
function fbKeepySpots37(){const F=FOOTBALL37,a=F.KIDS.kemi.idle,b=F.KIDS.emeka.idle,mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,h=F.KEEPY.gap/2;
 return {kemi:[mx-dx/L*h,mz-dz/L*h],emeka:[mx+dx/L*h,mz+dz/L*h]};}
function fbKidsSpawn37(instant){return fbQuiet37(()=>fbKidsSpawnQ37(instant));}
function fbKidsSpawnQ37(instant){const F=FOOTBALL37;if(F.kids)return;const spots=fbKeepySpots37();F.kids={};
 for(const k of ['kemi','emeka']){const g=fbKidModel37(k),p=spots[k],o=spots[k==='kemi'?'emeka':'kemi'];g.position.set(p[0],0,p[1]);const fx=o[0]-p[0],fz=o[1]-p[1],fl=Math.hypot(fx,fz)||1;
  g.rotation.y=Math.atan2(fx,fz);scene.add(g);F.kids[k]={key:k,g,pos:[p[0],p[1]],vel:[0,0],face:[fx/fl,fz/fl],t:0,opacity:0,fade:{t0:F.t,dir:1},mode:'idle',noBall:false,mayChallenge:false,target:null,queue:[],place:null,back:null,leave:null,gone:false};
  fbKidFade37(F.kids[k],instant?1:0);if(instant)F.kids[k].fade=null;}
 const kb=fbKidBall37();scene.add(kb);F.kidBall={m:kb,holder:'kemi',nextT:F.t+0.3,lastT:F.t,h:0.4,swap:F.t+F.KEEPY.swap,arc:null,touches:0,hidden:false};
 fbEmit37('kids',{on:true});}
function fbKidsRemove37(){const F=FOOTBALL37;if(F.kids){for(const k in F.kids){const c=F.kids[k];if(c.g){if(c.g.parent)c.g.parent.remove(c.g);if(typeof envDisposePerson==='function')try{envDisposePerson(c.g);}catch(e){}}}}
 F.kids=null;if(F.kidBall){const m=F.kidBall.m;if(m.parent)m.parent.remove(m);m.geometry.dispose();m.material.dispose();F.kidBall=null;}
 for(const k in fbLast37)if(k==='kemi'||k==='emeka')delete fbLast37[k];fbEmit37('kids',{on:false});}

/* ======================================================================================================================================
   A.11 The match: states, starting, set-out, kick-off, goals, outs, the keke moment, the call, the cap, the end (spec §4.4-4.5, §6)
   ====================================================================================================================================== */
function fbSetState37(s,why){const F=FOOTBALL37;if(F.state===s)return;const from=F.state;F.state=s;F.stateT=F.t;F.seq++;fbEmit37('state',{to:s,from,why:why||null});fbBodyClass37();fbHUD37();}
function fbEnsureSave37(){if(!S||!S.p||fbOnline37())return null;const L=(typeof life34==='function'?life34():(S.life=S.life||{}));if(!L)return null;
 if(!L.football37){const fl=football37Flags();L.football37={v:2,found:S.day,played:0,won:0,lost:0,drawn:0,goals:{p0:0,p1:0,ai:0},square:0,streetCalls:0,last:null,
  said:{day:0,who:[],bassey:[]},firsts:{win:0,last:0},memDay:0,nkechiDay:0,pointed:false,hints:0,playtest:!!fl.playtest,runs:[]};}
 return L.football37;}
// may a match start? (spec §6.1) {ok, why}
function football37CanStart(i){const F=FOOTBALL37;if(!(F.state==='idle'||F.state==='ended'))return {ok:false,why:'state'};
 if(!F.kids)return {ok:false,why:'kids'};if(S.time>=F.HOURS.lastStart)return {ok:false,why:'late'};
 if(fbOnline37())return {ok:false,why:'online'};
 const T=F.LINES.toasts;if(typeof benchBusy36==='function'&&benchBusy36())return {ok:false,why:'bench',msg:T.bench};
 if(typeof sofa!=='undefined'&&sofa&&sofa.carrying)return {ok:false,why:'sofa',msg:T.sofa};
 if(players.some(p=>p.g&&p.g.sitting))return {ok:false,why:'seated',msg:T.seated};
 if(typeof EVENING35!=='undefined'&&EVENING35.active&&EVENING35.active())return {ok:false,why:'evening'};
 if(fbLocalPair37()){const o=1-(i||0);if(fbCentreDist37(0)>F.START_NEAR||fbCentreDist37(1)>F.START_NEAR)return {ok:false,why:'wait',other:fbCentreDist37(o)>F.START_NEAR?o:(i||0)};}
 return {ok:true};}
function football37Start(){const F=FOOTBALL37;const L=fbEnsureSave37();F.matchNo++;F.rng=rng37((S.day*7919+F.matchNo*101+37)>>>0);F.score=[0,0];F.playT=0;
 F.stats={kicks:{},passes:{},calls:0,outs:0,goals:[],streetCall:false,motor:false,challenges:0};F.lastGoal=false;F.called=false;F.capped=false;F.bannerPlayT=0;F.result=null;
 F.kekeDone=false;F.kekeThrough=false;F.kekeAt=0;F.pendingCall=null;F.streetCallUsed=false;F.keepOff=null;F.out=null;F.awayT=0;F.waitingFrom=null;F.saidAway=false;F.serious=false;F.showOff=false;F.call=null;
 F.kidChT={};F.chT={};fbCancel37();fbSetOwner37(null);
 if(typeof LIFE34!=='undefined'&&LIFE34.waypoint&&LIFE34.waypoint.name==='The end of the street'){LIFE34.waypoint=null;try{if(typeof refreshMarker34==='function')refreshMarker34();}catch(e){}}
 fbPitchOut37();F.setout={t0:F.t,cairns:false,clearAt:null,ball:false};
 // the ball comes to the centre and is held until kick-off; Emeka fetches it from farther than 6 m
 const P=F.PITCH,far=Math.hypot(ball.position.x-P.cx,ball.position.z-P.zc)>6;ball.held=true;ball.v=[0,0];ball.motor=false;
 if(far){ball.glide=null;ball.fade={phase:'out',t0:F.t,to:[P.cx,P.zc],done:()=>{F.setout&&(F.setout.ball=true);}};fbToast37(F.LINES.toasts.fetch);}
 else{ball.fade=null;ball.glide={from:[ball.position.x,ball.position.z],to:[P.cx,P.zc],t0:F.t,dur:0.4,done:()=>{F.setout&&(F.setout.ball=true);}};}
 // the children: Kemi tucks the plastic ball away, then each places their goal's stones, north then south
 const K=F.kids;if(K){K.kemi.queue=[0,1];K.emeka.queue=[2,3];for(const k in K){K[k].mode='setout';K[k].noBall=true;K[k].place=null;K[k].back=null;K[k].mayChallenge=false;}}
 if(F.kidBall){F.kidBall.hidden=true;F.kidBall.m.visible=false;if(K&&K.kemi.g&&typeof playPick==='function')playPick(K.kemi.g);}
 fbSetupTraffic37();fbSetState37('setout','start');fbLog37('match','coop');
 fbShout37('kemi',F.LINES.shouts.setout);fbToast37(F.LINES.toasts.measure);
 // (fixer, v37 review F3) the first-match hints wait for the kick-off (fbHintsGo37): during the set-out its toast has the screen
 F.hintUntil=F.hintShortUntil=F.landUntil37=0;F.hintAtKick37=false;if(L&&(L.hints||0)<2){L.hints=(L.hints||0)+1;F.hintAtKick37=true;}
 fbEmit37('start',{matchNo:F.matchNo});return true;}
function fbKickoff37(team,first){const F=FOOTBALL37,P=F.PITCH;F.kickoffTeam=team;F.kickoffT=F.t;
 const go=()=>{ball.held=false;F.keepOff={team:team==='a'?'b':'a',until:F.t+F.KEEPOFF_T.kickoff,touched:false,kind:'kickoff'};fbShout37('kemi',F.LINES.shouts.oya);fbEmit37('kickoff',{team,first:!!first});};
 if(first){if(!F.kekeAt)F.kekeAt=F.rng.range(F.KEKE.after[0],F.KEKE.after[1]);fbSetState37('live','kickoff');go();fbHintsGo37();return;}
 fbSetState37('live','kickoff');ball.held=true;ball.v=[0,0];ball.motor=false;fbSetOwner37(null);
 const far=Math.hypot(ball.position.x-P.cx,ball.position.z-P.zc)>3;
 if(far)ball.fade={phase:'out',t0:F.t,to:[P.cx,P.zc],done:go};else ball.glide={from:[ball.position.x,ball.position.z],to:[P.cx,P.zc],t0:F.t,dur:0.4,done:go};}
// (fixer, v37 review F3) at the first kick-off: the set-out toast is cleared, then one card at a time: on a portrait phone the "turn sideways" line
// for 4 s, then the short line naming Act for 4 s; on larger halves the full line for 16 s
function fbHintsGo37(){const F=FOOTBALL37;try{const el=typeof document!=='undefined'&&document.getElementById?document.getElementById('toast'):null;if(el&&el.classList)el.classList.remove('on');}catch(e){}
 if(!F.hintAtKick37)return;F.hintAtKick37=false;const portrait=typeof innerHeight!=='undefined'&&innerHeight>innerWidth&&fbLocalPair37();
 F.landUntil37=portrait?F.t+F.HINT_SHORT:0;F.hintShortUntil=(portrait?F.landUntil37:F.t)+F.HINT_SHORT;F.hintUntil=Math.max(F.t+16,F.hintShortUntil);}
function football37Goal(team,how,at){const F=FOOTBALL37,pc=F.pendingCall;if(!(F.state==='live'||(how==='street'&&(F.state==='restart'||F.state==='live'))))return false;
 if(how!=='street')F.pendingCall=null;else{F.pendingCall=null;F.streetCallUsed=true;if(F.stats)F.stats.streetCall=true;}
 if(F.state==='restart'){ball.fade=null;fbBallOpacity37(1);F.out=null;}
 // credit: the last touch; but a shot that merely deflects in off a defender's body (within 1.5 s of the scoring team's kick) stays the shooter's
 // (v37 merge) and so does a ball the scoring side was dribbling in when it brushed a defender (Kemi walking it in past you is Kemi's goal)
 let lt=F.lastTouch;const lp=F.lastPlay;if(lt&&lt.how==='body'&&lp&&lp.team===team&&(lp.kick||lp.how==='dribble')&&F.t-lp.t<=F.CREDIT_DEFLECT)lt=lp;
 if(how==='street'&&pc&&pc.who)lt={who:pc.who,team:'a',kick:true};   // the street's call: the goal is the kicker's whose shot hit the stone (integrator fix)
 const who=lt?lt.who:null,own=!!(lt&&lt.team&&lt.team!==team)&&how!=='street';F.score[team==='a'?0:1]++;
 const decided=F.lastGoal||F.score[0]>=F.TARGET||F.score[1]>=F.TARGET;
 if(F.stats)F.stats.goals.push({team,who,own,how,playT:r3_37(F.playT)});
 fbLog37('goal',team+':'+(who||'none'));const L=fbSave37();if(L&&!own&&who&&L.goals&&who in L.goals&&team==='a')L.goals[who]++;
 if(how==='street'){if(L)L.streetCalls=(L.streetCalls||0)+1;fbToast37(F.LINES.toasts.street);}else if(own)fbToast37(F.LINES.toasts.ownGoal);
 F.goalInfo={team,who,own,how,decided,t0:F.t,photo:false,celeb:own?fbNearestOf37(team,at):who};fbSetOwner37(null);F.keepOff=null;
 fbSetState37('goal',how);fbEmit37('goal',{team,who,own,how,score:F.score.slice(),decided,at:at?[r3_37(at[0]),r3_37(at[1])]:null,last:F.lastGoal});
 // (fixer) nobody shouts "Gooool!" for an own goal: the other child says the scorer's name instead
 if(who==='kemi'||who==='emeka'){if(!own)fbShout37(who,F.LINES.shouts.goal);else{const o=who==='kemi'?'emeka':'kemi';if(F.kids&&F.kids[o])fbShout37(o,F.LINES.shouts.ownGoal[who]);}}return true;}
// the scoring team's player nearest the goal mouth (who celebrates an own goal in its favour)
function fbNearestOf37(team,at){const F=FOOTBALL37,p=at||[ball.position.x,ball.position.z];let best=null,bd=1e9;for(const P of F.persons){if(P.team!==team||P.soft)continue;const d=Math.hypot(P.pos[0]-p[0],P.pos[1]-p[1]);if(d<bd){bd=d;best=P.key;}}return best;}
function fbOut37(x,z){const F=FOOTBALL37,P=F.PITCH;if(F.state!=='live')return;const lt=F.lastTouch,team=lt&&lt.team?(lt.team==='a'?'b':'a'):'b';
 const sx=fbClamp37(x,P.x1+F.RESTART_GOAL,P.x2-F.RESTART_GOAL),sz=fbClamp37(z,P.z1+F.RESTART_INSET,P.z2-F.RESTART_INSET);
 F.out={t0:F.t,x:r3_37(x),z:r3_37(z),team,spot:[sx,sz],phase:'roll'};if(F.stats)F.stats.outs++;fbSetOwner37(null);fbCancel37();
 fbSetState37('restart','out');fbEmit37('out',{at:[r3_37(x),r3_37(z)],team,spot:[r3_37(sx),r3_37(sz)],last:lt?lt.who:null});}
function fbBanner37(kind){const F=FOOTBALL37;if(kind==='call'){F.called=true;fbShout37('emeka',F.LINES.shouts.called);}
 if(F.lastGoal){fbEmit37('banner',{kind,again:true});return;}
 F.lastGoal=true;F.bannerPlayT=F.playT;if(kind==='cap'){F.capped=true;fbShout37('kemi',F.LINES.shouts.cap);}else fbShout37('kemi',F.LINES.shouts.last);
 fbEmit37('banner',{kind,playT:r3_37(F.playT),time:r3_37(S.time)});}
// the end of a match that was played out (not stopped): the summary, the counters, the log, the friendship, the album
function fbEnd37(result){const F=FOOTBALL37,L=fbSave37(),[a,b]=F.score,last=F.lastGoal&&result!=='unfinished';F.result={result,a,b,last,called:F.called};
 fbSetState37('ended',result);F.lastMatchDay=S.day;fbCancel37();fbSetOwner37(null);
 fbLog37('fulltime',result+':'+a+'-'+b+(last?':last':''));
 if(L){L.played++;if(result==='won')L.won++;else if(result==='lost')L.lost++;else L.drawn++;
  L.last={day:S.day,mode:'coop',a,b,result,last,called:F.called,scorers:(F.stats?F.stats.goals:[]).map(g=>g.who+(g.own?':og':''))};
  if(L.nkechiDay!==S.day&&S.nb&&S.nb.nkechi&&typeof aff==='function'){L.nkechiDay=S.day;aff('nkechi',1);}
  const firstWin=result==='won'&&!L.firsts.win,firstLast=result==='won'&&last&&!L.firsts.last;
  if(!(firstWin||firstLast)&&F.photoMatch37!==F.matchNo&&L.memDay!==S.day&&typeof remember==='function'){L.memDay=S.day;remember(fbFill37(F.LINES.toasts.remember,{a,b}),'moment');}
  if(L.playtest){const st=F.stats||{};L.runs.push({dur:Math.round(F.playT),a,b,kicks:{p0:(st.kicks||{}).p0||0,p1:(st.kicks||{}).p1||0},passes:{p0:(st.passes||{}).p0||0,p1:(st.passes||{}).p1||0},calls:st.calls||0,outs:st.outs||0,streetCall:!!st.streetCall,motor:!!st.motor,last});if(L.runs.length>10)L.runs.shift();}}
 fbEmit37('end',{result,a,b,last,called:F.called,playT:r3_37(F.playT)});}
// the first win (and the first last-goal win) gets Mr Bassey's photo at 1.0 s into the deciding goal's celebration
function fbPhoto37(){const F=FOOTBALL37,gi=F.goalInfo,L=fbSave37();if(!gi||gi.photo||!gi.decided||gi.team!=='a'||!L)return;if(F.t-gi.t0<1.0)return;gi.photo=true;
 const [a,b]=F.score,last=F.lastGoal;let cap=null;if(last&&!L.firsts.last){L.firsts.last=S.day;cap=fbFill37(F.LINES.toasts.photoLast,{bassey:fbBasseyName37()});if(!L.firsts.win)L.firsts.win=S.day;}
 else if(!L.firsts.win){L.firsts.win=S.day;cap=fbFill37(F.LINES.toasts.photoWin,{bassey:fbBasseyName37(),a,b});}
 if(cap)F.photoMatch37=F.matchNo;if(cap&&typeof takePhoto==='function'){try{takePhoto(cap,'moment');}catch(e){if(S&&S.memories)S.memories.push({day:S.day,caption:cap,kind:'moment'});}fbEmit37('photo',{caption:cap});}}
// stopped: no counters, no friendship, no memory; the posts clear at once (spec §6.8)
function football37Stop(reason,remove){const F=FOOTBALL37;const on=fbMatchOn37();if(!on){if(remove&&F.kids){fbKidsRemove37();fbSetState37('off',reason);}return false;}
 const was=F.state;if(was!=='ended'&&was!=='clearing')fbLog37('fulltime','stopped:'+F.score[0]+'-'+F.score[1]);
 fbPitchClear37();fbCancel37();fbSetOwner37(null);F.keepOff=null;F.out=null;F.pendingCall=null;F.kekeThrough=false;F.setout=null;F.goalInfo=null;
 if(ball){if(ball.fade){const f=ball.fade;ball.position.x=f.to[0];ball.position.z=f.to[1];ball.fade=null;fbBallOpacity37(1);}ball.glide=null;ball.held=false;ball.motor=false;}
 if(remove||!F.kids){fbKidsRemove37();fbSetState37('off',reason);}else{fbKidsToIdle37();fbSetState37('idle',reason);}
 fbEmit37('stop',{reason:reason||null,from:was});return true;}
function fbKidsToIdle37(){const F=FOOTBALL37,K=F.kids;if(!K)return;const spots=fbKeepySpots37();for(const k in K){const c=K[k];c.mode='return';c.target=spots[k];c.noBall=false;c.mayChallenge=false;c.queue=[];c.place=null;c.kick=null;}
 if(F.kidBall){F.kidBall.hidden=false;F.kidBall.holder='kemi';F.kidBall.nextT=F.t+0.6;F.kidBall.swap=F.t+F.KEEPY.swap;}}
// the motor: the keke is let through once a match; the ball is held off the lane until it has gone (spec §4.5)
function fbMotor37(){const F=FOOTBALL37;F.kekeThrough=true;if(F.stats)F.stats.motor=true;fbSetOwner37(null);fbCancel37();ball.motor=true;F.motorRest=false;
 const K=F.kids;let who='kemi';if(K&&typeof keke!=='undefined'&&keke){let bd=1e9;for(const k in K){const d=Math.hypot(K[k].pos[0]-keke.position.x,K[k].pos[1]-keke.position.z);if(d<bd){bd=d;who=k;}}}
 fbShout37(who,F.LINES.shouts.motor);fbSetState37('motor','keke');fbEmit37('motor',{on:true,who});}
function fbMotorEnd37(){const F=FOOTBALL37;F.kekeThrough=false;F.kekeDone=true;ball.motor=false;ball.held=false;ball.glide=null;fbShout37('kemi',F.LINES.shouts.oya);fbSetState37('live','keke gone');fbEmit37('motor',{on:false});}
// the per-frame match clock
function fbMatchStep37(dt){const F=FOOTBALL37,P=F.PITCH,st=F.state;
 if(PLAY37.includes(st))F.playT+=fbTick37(dt);
 if(st==='setout'){const so=F.setout;if(!so)return;const e=F.t-so.t0;
  if(e>=F.SETOUT_CAP-1e-9)for(let k=0;k<4;k++)if(F.mesh.cairns[k]&&!F.mesh.cairns[k].placed)fbPlaceCairn37(k,null);
  so.cairns=F.mesh.cairns.every(c=>c.placed);
  if(so.cairns&&so.ball&&((F.trafficInside===0&&fbCompanionIn37())||e>=F.CLEAR_WAIT-1e-9)){so.waited=r3_37(e);fbEmit37('kickoffwait',{waited:so.waited,inside:F.trafficInside});F.setout=null;fbKickoff37('a',true);}
  return;}
 if(st==='live'){
  if(F.keepOff&&(F.keepOff.touched||F.t>=F.keepOff.until))F.keepOff=null;
  // the street's call resolves 0.5 s after the post (a goal clears it)
  if(F.pendingCall&&F.t-F.pendingCall.t>=0.5){football37Goal('a','street',null);return;}
  if(!F.lastGoal&&F.playT>=F.HOURS.capPlay-1e-9)fbBanner37('cap');
  if(!F.called&&S.time>=F.HOURS.call-1e-9)fbBanner37('call');
  if(F.lastGoal&&F.playT-F.bannerPlayT>=F.HOURS.unfinishedPlay-1e-9){fbShout37('kemi',F.LINES.shouts.unfinished);fbEnd37('unfinished');return;}
  if(fbAwayCheck37())return;
  return;}
 if(st==='goal'){fbPhoto37();if(F.t-F.stateT>=F.CELEBRATE-1e-9){const gi=F.goalInfo;
   if(gi&&gi.decided){fbPhoto37();fbEnd37(gi.team==='a'?'won':'lost');}else fbKickoff37(gi?(gi.team==='a'?'b':'a'):'a',false);}
  return;}
 if(st==='restart'){const o=F.out;if(!o){fbSetState37('live','restart');return;}
  if(F.pendingCall&&F.t-F.pendingCall.t>=0.5){football37Goal('a','street',null);return;}
  if(o.phase==='roll'&&F.t-o.t0>=0.6-1e-9){o.phase='fade';ball.held=true;ball.v=[0,0];ball.fade={phase:'out',t0:F.t,to:o.spot,done:()=>{o.phase='done';}};}
  if(o.phase==='done'){ball.held=false;F.out=null;F.keepOff={team:o.team==='a'?'b':'a',until:F.t+F.KEEPOFF_T.restart,touched:false,kind:'restart'};
   fbSetState37('live','restart');fbEmit37('restart',{team:o.team,spot:[r3_37(o.spot[0]),r3_37(o.spot[1])]});
   if(o.team==='b'&&F.kids){const c=fbNearestKid37(o.spot);if(c)fbShout37(c.key,F.LINES.shouts.ourBall);}}
  return;}
 if(st==='motor'){
  // the ball rolls to rest (friction x 3), then glides out of the keke's lane if it stopped in it
  if(!F.motorRest&&!ball.glide&&Math.hypot(ball.v[0],ball.v[1])<0.02){F.motorRest=true;const z=ball.position.z,L=F.KEKE.lane,E=F.KEKE.edge;
   if(z>L[0]&&z<L[1]){const tz=z-L[0]<L[1]-z?E[0]:E[1];ball.glide={from:[ball.position.x,z],to:[ball.position.x,tz],t0:F.t,dur:0.4,done:()=>{ball.held=true;}};}else ball.held=true;}
  return;}
 if(st==='waiting'){const back=fbHumans37().every(i=>fbRectDist37(players[i].g.position.x,players[i].g.position.z,P)<=F.AWAY);
  if(back){ball.held=false;fbSetState37('live','back');return;}
  if(F.t-F.waitingFrom>=F.AWAY_T-1e-9){football37Stop('away',false);}return;}
 if(st==='ended'){if(F.t-F.stateT>=F.SUMMARY-1e-9)fbClearStart37();return;}
 if(st==='clearing'){fbClearStep37();return;}}
function fbAwayCheck37(){const F=FOOTBALL37,P=F.PITCH;const away=fbHumans37().some(i=>fbRectDist37(players[i].g.position.x,players[i].g.position.z,P)>F.AWAY);if(!away)return false;
 F.waitingFrom=F.t;fbSetOwner37(null);fbCancel37();ball.held=true;ball.v=[0,0];const d=Math.hypot(ball.position.x-P.cx,ball.position.z-P.zc);
 if(d>0.05){if(d>3)ball.fade={phase:'out',t0:F.t,to:[P.cx,P.zc]};else ball.glide={from:[ball.position.x,ball.position.z],to:[P.cx,P.zc],t0:F.t,dur:0.4};}
 if(!F.saidAway){F.saidAway=true;fbShout37('kemi',F.LINES.shouts.away);}fbSetState37('waiting','away');return true;}
function fbNearestKid37(p){const K=FOOTBALL37.kids;if(!K)return null;let best=null,bd=1e9;for(const k in K){const d=Math.hypot(K[k].pos[0]-p[0],K[k].pos[1]-p[1]);if(d<bd){bd=d;best=K[k];}}return best;}
// clearing (1.6 s): Emeka's slippers first, then the stones in reverse order, the lines fade; then the children go back to their ball
function fbClearStart37(){const F=FOOTBALL37;fbSetState37('clearing','summary');F.clearing={t0:F.t,k:0};F.lineFade={t0:F.t+0.6,dir:-1};
 const K=F.kids;if(K)for(const k in K){K[k].mode='clear';K[k].noBall=true;K[k].mayChallenge=false;}}
function fbClearStep37(){const F=FOOTBALL37,c=F.clearing,e=F.t-c.t0;
 if(e>=0.1&&F.mesh.slippers){const s=F.mesh.slippers;if(s.parent)s.parent.remove(s);s.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});F.mesh.slippers=null;}
 const order=[3,2,1,0];for(let q=0;q<4;q++){const cc=F.mesh.cairns[order[q]];if(cc&&cc.clearT===undefined&&e>=0.3+q*0.3){cc.clearT=F.t;const K=F.kids;if(K){const kid=K[cc.by];if(kid&&kid.g&&typeof playPick==='function')playPick(kid.g);}}}
 if(F.lineFade&&F.t<F.lineFade.t0){for(const l of F.mesh.lines)l.material.opacity=l.userData.op37;}
 if(e>=F.CLEAR_T-1e-9){fbPitchClear37();const called=F.result&&F.result.called;
  if(called){F.homeDay=S.day;fbKidsHome37();fbSetState37('idle','home');}
  else{fbKidsToIdle37();fbSetState37('idle','cleared');}
  F.clearing=null;}}
// after Mama Nkechi's call: Emeka runs east along the street towards her shop, Kemi says goodbye and walks off, and they fade
function fbKidsHome37(){const F=FOOTBALL37,K=F.kids;if(!K)return;fbShout37('kemi',F.LINES.shouts.bye);
 K.emeka.mode='leave';K.emeka.leave={from:K.emeka.pos.slice(),to:[K.emeka.pos[0]+6,9.0],speed:2.7,dir:[1,0]};K.emeka.leave.to=[K.emeka.pos[0]+6,9.0];
 K.kemi.mode='leave';const a=K.kemi.pos,dx=-27-a[0],dz=5-a[1],d=Math.hypot(dx,dz)||1;K.kemi.leave={from:a.slice(),to:[a[0]+dx/d*3,a[1]+dz/d*3],speed:1.4};
 if(F.kidBall){F.kidBall.hidden=true;F.kidBall.m.visible=false;}}

/* ======================================================================================================================================
   A.12 The children each frame: spawn and despawn, keepy-up, your ball passed back, set-out, clearing, going home (spec §5.3, §4.2)
   ====================================================================================================================================== */
function fbKidMove37(c,tx,tz,speed,dt,o){o=o||{};const F=FOOTBALL37,dx=tx-c.pos[0],dz=tz-c.pos[1],d=Math.hypot(dx,dz);let wx=0,wz=0;
 if(d>0.01){const sp=o.direct?Math.min(speed,d/Math.max(dt,1e-6)):(d<0.6?speed*Math.max(0.15,d/0.6):speed);wx=dx/d*sp;wz=dz/d*sp;}
 if(o.direct||dt<=0){c.vel=[wx,wz];}else{const ax=wx-c.vel[0],az=wz-c.vel[1],al=Math.hypot(ax,az),mx=F.AI.accel*dt;if(al>mx){c.vel=[c.vel[0]+ax/al*mx,c.vel[1]+az/al*mx];}else c.vel=[wx,wz];}
 {const vl=Math.hypot(c.vel[0],c.vel[1]);if(vl>speed&&vl>1e-9){c.vel=[c.vel[0]*speed/vl,c.vel[1]*speed/vl];}}   // (fixer) never above its own pace
 c.vwant37=Math.hypot(c.vel[0],c.vel[1]);let nx=c.pos[0]+c.vel[0]*dt,nz=c.pos[1]+c.vel[1]*dt;
 if(o.zone){const Z=F.ZONE;nx=fbClamp37(nx,Z.x1,Z.x2);nz=fbClamp37(nz,Z.z1,Z.z2);
  // a child's own step never takes it into a cairn (a 0.6 m disc) or into a human or the companion: it is put back to contact, which slides
  // it round them; if it was already closer (a human walked into it), its step only keeps it from getting closer (fbSeparate37 parts them)
  const keepOut=(px,pz,m)=>{const ex=nx-px,ez=nz-pz,ed=Math.hypot(ex,ez);if(ed>=m||ed<1e-6)return;const d0=Math.hypot(c.pos[0]-px,c.pos[1]-pz),want=Math.min(m,d0);if(ed<want){nx=px+ex/ed*want;nz=pz+ez/ed*want;}};
  for(const cc of F.mesh.cairns){if(!cc.placed||o.noPosts)continue;keepOut(cc.pos[0],cc.pos[1],0.6);}
  const kr=F.KIDS[c.key]?F.KIDS[c.key].r:0.28;for(const P of F.persons){if(P.kind!=='human'&&P.kind!=='companion')continue;keepOut(P.pos[0],P.pos[1],kr+P.r+0.05);}}
 if(dt>0){c.vel=[(nx-c.pos[0])/dt,(nz-c.pos[1])/dt];}c.pos=[nx,nz];
 const sp=Math.hypot(c.vel[0],c.vel[1]);if(sp>0.05&&!o.keepFace){const want=Math.atan2(c.vel[0],c.vel[1]),cur=Math.atan2(c.face[0],c.face[1]);let dd=want-cur;while(dd>Math.PI)dd-=2*Math.PI;while(dd<-Math.PI)dd+=2*Math.PI;
  const mx=F.AI.turn*D2R37*dt,a=cur+fbClamp37(dd,-mx,mx);c.face=[Math.sin(a),Math.cos(a)];}
 return d;}
// a child with the ball near its own goal line, facing its own goal, clears it upfield instead of dribbling it over its own line (fixer)
function fbKidClear37(P,c,S7){const F=FOOTBALL37,A=F.AI,b=ball;if(F.state!=='live'||b.held||b.motor||!(F.owner&&F.owner.key===P.key))return;const O=fbOwnGoal37(P.team),Pt=F.PITCH;
 if(Math.abs(b.position.x-O[0])>A.clearNear)return;const tow=(O[0]-P.pos[0])>0?1:-1;if(P.face[0]*tow<=0)return;
 const dx=Pt.cx-b.position.x,dz=Pt.zc-b.position.z,dl=Math.hypot(dx,dz)||1;S7.kick=null;football37Kick(P,[dx/dl,dz/dl],F.KMIN,'kick',{ai:true,clear:true});}
function fbKidFaceTo37(c,x,z){const dx=x-c.pos[0],dz=z-c.pos[1],d=Math.hypot(dx,dz);if(d>1e-6)c.face=[dx/d,dz/d];}
function fbKidsStep37(dt){const F=FOOTBALL37,st=F.state;
 // spawn: in the window, when a human comes within 12 m of the pitch centre
 if(!F.kids){if(st==='off'&&football37Window()&&fbHumans37().some(i=>fbCentreDist37(i)<=F.SPAWN)){fbKidsSpawn37(!!football37Flags().now);fbSetState37('idle','spawn');}return;}
 const K=F.kids;
 // despawn (no match on): everyone far for 5 s fades them; the window closing sends them off towards the square
 if(st==='idle'){const far=fbHumans37().every(i=>fbCentreDist37(i)>F.DESPAWN);F.despawnT=far?F.despawnT+dt:0;
  const leaving=K.kemi.mode==='leave'||K.emeka.mode==='leave'||K.kemi.mode==='fadeout'||K.emeka.mode==='fadeout';
  if(!leaving&&(F.despawnT>=F.DESPAWN_T||!football37Window())){if(F.despawnT>=F.DESPAWN_T){for(const k in K){K[k].fade={t0:F.t,dir:-1};K[k].mode='fadeout';}}
   else{for(const k in K){const c=K[k],dx=-27-c.pos[0],dz=5-c.pos[1],d=Math.hypot(dx,dz)||1;c.mode='leave';c.leave={from:c.pos.slice(),to:[c.pos[0]+dx/d*3,c.pos[1]+dz/d*3],speed:1.4};}if(F.kidBall){F.kidBall.hidden=true;F.kidBall.m.visible=false;}}}}
 let allGone=true;
 for(const k of ['kemi','emeka']){const c=K[k];if(c.gone)continue;allGone=false;const KD=F.KIDS[k];c.t+=dt;
  if(c.fade){const e=(F.t-c.fade.t0)/0.6;if(c.fade.dir>0){fbKidFade37(c,Math.min(1,e));if(e>=1)c.fade=null;}else{fbKidFade37(c,Math.max(0,1-e));if(e>=1){c.gone=true;c.g.visible=false;continue;}}}
  let speed=0;
  if(c.mode==='leave'){const L=c.leave;const d=fbKidMove37(c,L.to[0],L.to[1],L.speed,dt,{direct:true});speed=L.speed;if(d<0.05&&!c.fade)c.fade={t0:F.t,dir:-1};}
  else if(c.mode==='setout')speed=fbSetoutKid37(c,dt);
  else if(c.mode==='clear'){speed=0;c.vel=[0,0];}
  else if(c.mode==='return'){const d=fbKidMove37(c,c.target[0],c.target[1],KD.speed*0.6,dt,{});speed=KD.speed*0.6;if(d<0.05){c.mode='idle';c.vel=[0,0];}}
  else if(c.mode==='idle'||c.mode==='fadeout')speed=fbIdleKid37(c,dt);
  else if(c.mode==='play')speed=0;                                               // the AI moves it (football37AI)
  c.g.position.set(c.pos[0],0,c.pos[1]);c.g.rotation.y=Math.atan2(c.face[0],c.face[1]);
  if(c.mode!=='play'){const mv=Math.hypot(c.vel[0],c.vel[1])>0.05;if(typeof animAvatar==='function')animAvatar(c.g,c.t,mv,false,mv?Math.max(speed,Math.hypot(c.vel[0],c.vel[1])):0,dt);}}
 if(allGone){fbKidsRemove37();if(F.state==='idle')fbSetState37('off','gone');return;}
 fbKidBallStep37(dt);
 if(['setout','live','goal','restart','motor','waiting','ended'].includes(st)||(st==='clearing'))football37AI(dt);}
// set-out: each child jogs to 0.45 m outside a post, picks, the cairn appears; then off to the kick-off spot
function fbSetoutKid37(c,dt){const F=FOOTBALL37,KD=F.KIDS[c.key];
 if(c.place){if(F.t-c.place.t0>=0.3-1e-9){fbPlaceCairn37(c.place.k,c.key);c.place=null;}c.vel=[0,0];return 0;}
 while(c.queue.length&&F.mesh.cairns[c.queue[0]]&&F.mesh.cairns[c.queue[0]].placed)c.queue.shift();
 if(c.queue.length){const k=c.queue[0],cc=F.mesh.cairns[k],out=cc.pos[0]<F.PITCH.cx?-0.45:0.45,tx=cc.pos[0]+out,tz=cc.pos[1];
  const d=fbKidMove37(c,tx,tz,KD.speed,dt,{direct:true});if(d<=0.05||Math.hypot(c.pos[0]-tx,c.pos[1]-tz)<=0.02){c.pos=[tx,tz];fbKidFaceTo37(c,cc.pos[0],cc.pos[1]);c.place={k,t0:F.t};if(typeof playPick==='function')playPick(c.g);}
  return KD.speed;}
 const ko=F.KICKOFF[c.key];const d=fbKidMove37(c,ko[0],ko[1],KD.speed,dt,{direct:true});if(d<0.05){c.vel=[0,0];fbKidFaceTo37(c,ball.position.x,ball.position.z);}return KD.speed;}
// idle: keepy-up with their own plastic ball, facing each other; your ball rolling near gets passed back to the nearest human
function fbIdleKid37(c,dt){const F=FOOTBALL37,KD=F.KIDS[c.key],B=F.KEEPY;
 const nearest=()=>{let best=null,bd=1e9;for(const i of fbHumans37()){const p=players[i],d=Math.hypot(p.g.position.x-c.pos[0],p.g.position.z-c.pos[1]);if(d<bd){bd=d;best=p;}}return best;};
 if(c.mode==='idle'&&ball&&!ball.held&&!ball.glide&&!ball.fade){const bd=Math.hypot(ball.position.x-c.pos[0],ball.position.z-c.pos[1]);
  if(!c.back&&bd<=B.back&&F.t>=(c.backCool||0)&&!(F.owner&&F.owner.kind==='human'))c.back={t:F.t+F.rng.range(B.backDelay[0],B.backDelay[1])};
  if(c.back){if(bd>0.75){fbKidMove37(c,ball.position.x,ball.position.z,KD.speed*0.7,dt,{});}else{c.vel=[0,0];fbKidFaceTo37(c,ball.position.x,ball.position.z);}
   if(F.t>=c.back.t){c.back=null;c.backCool=F.t+2;const P=fbPerson37(c.key),h=nearest();
    if(P&&h&&bd<=F.RELEASE_REACH){const R=fbPersonOf37(h,'p'+h.i,h.i,'human','a',PR,0);R.vel=(fbPerson37('p'+h.i)||R).vel;const s=football37PassSolve([ball.position.x,ball.position.z],R);
     football37Kick(P,s.dir,s.v0,'pass',{back:true,to:'p'+h.i});fbShout37(c.key,F.LINES.shouts.passBack[F.rng()<0.5?0:1]);}}
   return KD.speed*0.7;}}
 const spots=fbKeepySpots37(),home=spots[c.key];const d=Math.hypot(home[0]-c.pos[0],home[1]-c.pos[1]);
 if(d>0.05){fbKidMove37(c,home[0],home[1],KD.speed*0.6,dt,{});return KD.speed*0.6;}
 c.vel=[0,0];const o=spots[c.key==='kemi'?'emeka':'kemi'];fbKidFaceTo37(c,o[0],o[1]);return 0;}
function fbKidBallStep37(dt){const F=FOOTBALL37,kb=F.kidBall,K=F.kids;if(!kb||!K)return;const m=kb.m;
 if(kb.hidden||F.state!=='idle'){m.visible=false;return;}
 const h=K[kb.holder];if(!h||h.gone||h.mode!=='idle'||K.kemi.mode!=='idle'||K.emeka.mode!=='idle'||h.back){m.visible=!!(h&&!h.gone&&h.mode==='idle'&&h.opacity>0.5);if(h){m.position.set(h.pos[0]+h.face[0]*0.25,0.25,h.pos[1]+h.face[1]*0.25);}return;}
 m.visible=h.opacity>0.5;
 if(kb.arc){const a=kb.arc,u=Math.min(1,(F.t-a.t0)/a.dur),x=a.from[0]+(a.to[0]-a.from[0])*u,z=a.from[1]+(a.to[1]-a.from[1])*u;m.position.set(x,0.25+4*1.1*u*(1-u),z);m.rotation.x+=dt*8;
  if(u>=1){kb.arc=null;kb.holder=a.toKey;kb.nextT=F.t+0.2;kb.lastT=F.t;kb.swap=F.t+F.KEEPY.swap;}return;}
 const foot=[h.pos[0]+h.face[0]*0.25,h.pos[1]+h.face[1]*0.25];
 if(F.t>=kb.swap){const oKey=kb.holder==='kemi'?'emeka':'kemi',o=K[oKey];kb.arc={from:foot,to:[o.pos[0]+o.face[0]*0.25,o.pos[1]+o.face[1]*0.25],t0:F.t,dur:0.8,toKey:oKey};
  h.g.userData.swing37={t0:F.t,amp:0.6};kb.touches++;fbEmit37('keepy',{who:h.key,swap:true});return;}
 if(F.t>=kb.nextT){kb.lastT=F.t;const iv=F.KEEPY.every+(F.rng()*2-1)*F.KEEPY.jitter;kb.nextT=F.t+iv;kb.iv=iv;kb.h=F.rng.range(F.KEEPY.hMin,F.KEEPY.hMax);kb.touches++;
  h.g.userData.swing37={t0:F.t,amp:0.3};fbEmit37('keepy',{who:h.key});}
 const iv=kb.iv||F.KEEPY.every,u=fbClamp37((F.t-kb.lastT)/iv,0,1);m.position.set(foot[0],0.12+4*kb.h*u*(1-u),foot[1]);m.rotation.x+=dt*5;}

/* ======================================================================================================================================
   B.1 The team AI (spec §5.6): roles decided every 0.2 s per AI person (staggered by key, applied after a reaction delay of 0.25 s for
   the children and 0.2 s for the companion), targets every frame, the carrier's choices (called pass, shot, pass, Kemi's feint), the
   kick-off tap, movement with separation. All randomness comes from the match generator (rng37 seeded per match).
   ====================================================================================================================================== */
// the AI's own tunables (spec §5.6). Tuned within 15% for the five-seed balance (README): shootRange 5.5 -> 6.3, aimZ 0.7 -> 0.8; with
// the children's speeds 3.0/2.7 -> 2.55/2.3, aim spreads 7/10 -> 8/11.5 degrees (KIDS) and their challenge interval 3.0 -> 3.45 s (CHALLENGE)
// share (not in the spec): after the browser pass, where the companion took three shots in 25 s and scored twice, it passes to a free human from beyond 4 m 60% of the time
FOOTBALL37.AI={accel:8,turn:540,chargeWalk:0,decide:0.2,react:{kid:0.25,companion:0.2},shootRange:4.7,shootRangeShow:4.0,shootTurn:50,hold:[0.30,0.58],aimZ:0.95,compSd:9,share:0.6,showOffSd:12,
 passPress:1.4,passCone:35,passFree:1.0,passLane:0.6,passP:0.7,feintP:0.35,feintPShow:0.6,feintNear:2.5,feintDeg:49,feintT:0.4,keep:0.6,
 support:[3.0,1.8],back:0.4,engage:2.0,room:0.8,roomAfter:0.2,roomCone:40,press:0.3,laneRange:6,laneCone:30,laneOff:0.9,faceNear:1.2,clearNear:1.5,backMin:3.0,steer:40,steerCone:30,steerNear:2,lead:0.6,qBehind:0.45,qBeyond:1.5,sep:1.5};
const AI37={match:-1,st:{}};
function fbAIOf37(key){const F=FOOTBALL37;if(AI37.match!==F.matchNo){AI37.match=F.matchNo;AI37.st={};F.koPass37=null;F.chaser37={};}
 return AI37.st[key]||(AI37.st[key]={next:F.t+({ai:2,kemi:3,emeka:4}[key]||0)*0.05,role:null,q:[],tgt:null,feint:null,feintT:-9,kick:null});}
function fbTeamOf37(key){return football37Team(key);}
function fbSpeedOf37(P){const F=FOOTBALL37;return P.kind==='human'?SPEED:P.kind==='kid'?F.KIDS[P.key].speed:P.kind==='companion'?3.1:1;}
function fbSegDist37(q,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],L=dx*dx+dz*dz||1e-9,u=fbClamp37(((q[0]-a[0])*dx+(q[1]-a[1])*dz)/L,0,1);return Math.hypot(a[0]+dx*u-q[0],a[1]+dz*u-q[1]);}
function fbOpps37(team){return FOOTBALL37.persons.filter(Q=>Q.team&&Q.team!==team&&!Q.soft);}
// who should do what right now (the decision reads this; spec §5.6 "Roles")
function fbRoles37(team){const F=FOOTBALL37,b=ball,bx=b.position.x,bz=b.position.z,mem=F.persons.filter(P=>P.team===team&&!P.soft),roles={},O=F.owner;
 if(O&&O.team===team){for(const P of mem)roles[P.key]=P.key===O.key?'carry':'support';return roles;}
 if(!F.chaser37)F.chaser37={};let best=null,bt=1e9;
 // a pass on its way to a teammate is theirs to take (the passer does not run after it)
 const lp=F.lastPass37;if(lp&&F.t-lp.t<=2&&Math.hypot(b.v[0],b.v[1])>0.5){const R=mem.find(P=>P.key===lp.recv);if(R)best=R;}
 if(!best) {for(const P of mem){if(P.kind==='human'&&P.speed<0.3&&mem.length>1&&mem.some(Q=>Q.kind!=='human'))continue;     // a human standing still is not chasing: the companion goes
  const d=Math.max(0,Math.hypot(P.pos[0]-bx,P.pos[1]-bz)-(F.chaser37[team]===P.key?0.6:0)),t=d/fbSpeedOf37(P);if(t<bt-1e-9||(Math.abs(t-bt)<=1e-9&&best&&P.n<best.n)){bt=t;best=P;}}}
 F.chaser37[team]=best?best.key:null;for(const P of mem)roles[P.key]=P===best?'chase':'back';return roles;}
// the targets, every frame from the person's current role
function fbAITarget37(P,role,S7){const F=FOOTBALL37,A=F.AI,Pt=F.PITCH,b=ball,bx=b.position.x,bz=b.position.z,team=P.team,G=fbGoalOf37(team),O=fbOwnGoal37(team),ad=team==='a'?1:-1;let tx,tz;
 const gx=G[0]-bx,gz=G[1]-bz,gl=Math.hypot(gx,gz)||1;
 if(role==='carry'){let dx=G[0]-P.pos[0],dz=G[1]-P.pos[1];const dl=Math.hypot(dx,dz)||1;dx/=dl;dz/=dl;
  // steer 40 degrees away from an opponent within 2 m in the 60-degree cone ahead
  let near=null,nd=9;for(const Q of fbOpps37(team)){const qx=Q.pos[0]-P.pos[0],qz=Q.pos[1]-P.pos[1],qd=Math.hypot(qx,qz);if(qd<A.steerNear&&qd<nd&&fbAng37(dx,dz,qx,qz)<=A.steerCone){near=Q;nd=qd;}}
  if(near){const qx=near.pos[0]-P.pos[0],qz=near.pos[1]-P.pos[1],side=(dx*qz-dz*qx)>0?-1:1;[dx,dz]=fbRot37(dx,dz,A.steer*side);}
  if(S7&&S7.feint){if(F.t<S7.feint.until)[dx,dz]=fbRot37(dx,dz,A.feintDeg*S7.feint.side);else S7.feint=null;}
  tx=P.pos[0]+dx*1.5;tz=P.pos[1]+dz*1.5;}
 else if(role==='chase'){
  // the companion walks onto the ball facing the goal (point Q behind it, then through it); the children intercept
  if(P.kind==='companion'){const qx=bx-gx/gl*A.qBehind,qz=bz-gz/gl*A.qBehind;if(Math.hypot(P.pos[0]-qx,P.pos[1]-qz)>0.5){tx=qx;tz=qz;}else{tx=bx+gx/gl*A.qBeyond;tz=bz+gz/gl*A.qBeyond;}}
  else{const O=F.owner,ch=O&&O.kind==='human'?charge37[O.idx]:null,room=P.kind==='kid'&&!!ch&&F.t-ch.t0>A.roomAfter-1e-9;
   if(room){// a child gives a human winding up a kick room to shoot (a charge older than 0.2 s): 0.8 m off, out of the line of the kick (fixer)
    let ux=P.pos[0]-bx,uz=P.pos[1]-bz;const ul=Math.hypot(ux,uz)||1;ux/=ul;uz/=ul;const fa=fbAng37(O.face[0],O.face[1],ux,uz);
    if(fa<A.roomCone){const side=(O.face[0]*uz-O.face[1]*ux)>=0?1:-1;[ux,uz]=fbRot37(O.face[0],O.face[1],A.roomCone*side);}tx=bx+ux*A.room;tz=bz+uz*A.room;}
   else if(P.kind==='kid'&&O&&O.team&&O.team!==team){// against a dribbler: the point just in front of the ball, read every frame (fixer)
    const d=Math.hypot(bx-P.pos[0],bz-P.pos[1]),lead=Math.min(A.lead,d/fbSpeedOf37(P)),OG=fbGoalOf37(O.team),ox=OG[0]-bx,oz=OG[1]-bz,ol=Math.hypot(ox,oz)||1;
    if(O.kind==='human'&&ol<=A.laneRange&&fbAng37(O.face[0],O.face[1],ox,oz)<=A.laneCone){// a human lined up on goal: press from the side, off the line of the shot
     const side=((P.pos[0]-bx)*oz-(P.pos[1]-bz)*ox)>=0?1:-1;tx=bx+(-oz/ol)*side*A.laneOff+b.v[0]*lead;tz=bz+(ox/ol)*side*A.laneOff+b.v[1]*lead;}
    else{tx=bx+O.face[0]*A.press+b.v[0]*lead;tz=bz+O.face[1]*A.press+b.v[1]*lead;}}
   else{const d=Math.hypot(bx-P.pos[0],bz-P.pos[1]),lead=Math.min(A.lead,d/fbSpeedOf37(P));tx=bx+b.v[0]*lead;tz=bz+b.v[1]*lead;}}}
 else if(role==='support'){let side=1,nd=1e9;for(const Q of fbOpps37(team)){const d=Math.hypot(Q.pos[0]-bx,Q.pos[1]-bz);if(d<nd){nd=d;side=Q.pos[1]>bz?-1:1;}}
  tx=fbClamp37(bx+ad*A.support[0],Pt.x1+0.5,Pt.x2-0.5);tz=fbClamp37(bz+side*A.support[1],Pt.z1+0.5,Pt.z2-0.5);}
 else{tx=O[0]+(bx-O[0])*A.back;tz=O[1]+(bz-O[1])*A.back;tx=team==='a'?Math.max(tx,Pt.x1+A.backMin):Math.min(tx,Pt.x2-A.backMin);}
 // opponents of a kick-off or a restart keep 2 m off the ball until the first touch (the AI only)
 const ko=F.keepOff;if(ko&&ko.team===team&&!ko.touched){const dx=tx-bx,dz=tz-bz,d=Math.hypot(dx,dz);if(d<F.KEEPOFF){const ux=d>1e-6?dx/d:-ad,uz=d>1e-6?dz/d:0;tx=bx+ux*F.KEEPOFF;tz=bz+uz*F.KEEPOFF;}}
 return [tx,tz];}
// the decision: every 0.2 s (staggered by key), the wanted role and, for the children, its target as seen at that moment; both apply after
// the reaction delay (so a child runs to where the ball was a quarter of a second ago). The owner carries at once; the carrier's choices.
function fbDecide37(P){const F=FOOTBALL37,A=F.AI,S7=fbAIOf37(P.key),kid=P.kind==='kid',delay=kid?A.react.kid:A.react.companion,own=!!(F.owner&&F.owner.key===P.key);
 // the last defender steps in at once when an opponent carries the ball to within 2 m of it (it becomes the chaser; the other drops back)
 const O=F.owner;if(kid&&!own&&O&&O.team&&O.team!==P.team&&S7.role!=='chase'&&Math.hypot(O.pos[0]-P.pos[0],O.pos[1]-P.pos[1])<A.engage){S7.role='chase';S7.tgt=null;S7.q=[];if(!F.chaser37)F.chaser37={};
  const was=F.chaser37[P.team];F.chaser37[P.team]=P.key;if(was&&was!==P.key){const W=fbAIOf37(was);W.role='back';W.tgt=null;W.q=[];}}
 if(own&&S7.role!=='carry'){S7.role='carry';S7.q=[];S7.tgt=null;}
 if(!S7.role){S7.role=fbRoles37(P.team)[P.key]||'back';S7.tgt=kid?fbAITarget37(P,S7.role,S7):null;}
 if(F.t>=S7.next-1e-9){S7.next+=A.decide;if(S7.next<=F.t)S7.next=F.t+A.decide;
  const want=own?'carry':(fbRoles37(P.team)[P.key]||'back');
  (S7.q||(S7.q=[])).push({role:want,tgt:kid&&want!=='carry'?fbAITarget37(P,want,S7):null,at:F.t+delay});
  if(own)fbCarrier37(P,S7);}
 while(S7.q&&S7.q.length&&F.t>=S7.q[0].at-1e-9){const d=S7.q.shift();if(own&&d.role!=='carry')continue;S7.role=d.role;S7.tgt=d.tgt;}
 return S7;}
// the carrier's choices, in order (spec §5.6): (the called pass is handled every frame) shoot, pass when pressed, Kemi's feint, keep carrying
function fbCarrier37(P,S7){const F=FOOTBALL37,A=F.AI,b=ball;if(S7.kick||F.state!=='live'||b.held||b.motor)return;if(F.t-F.ownerSince<A.keep-1e-9)return;
 const G=fbGoalOf37(P.team),dg=Math.hypot(G[0]-P.pos[0],G[1]-P.pos[1]),ang=fbAng37(P.face[0],P.face[1],G[0]-P.pos[0],G[1]-P.pos[1]);
 const showOff=!!F.showOff&&P.team==='b',range=P.key==='kemi'&&showOff?A.shootRangeShow:A.shootRange;
 // the companion shares: from beyond 4 m, with its human free and not behind it, it passes rather than shoots (A.share of the time)
 if(dg<=range&&ang<=A.shootTurn&&P.kind==='companion'&&dg>A.shootRangeShow){const M=fbFreeHuman37(P,G,dg);if(M&&F.rng()<A.share){S7.kick={at:F.t,kind:'pass',recv:M.key};return;}}
 if(dg<=range&&ang<=A.shootTurn){const hold=F.rng.range(A.hold[0],A.hold[1]),k=fbClamp37((hold-F.TAP.key)/(F.FULL-F.TAP.key),0,1),speed=F.KMIN+(F.KMAX-F.KMIN)*k;
  const aimZ=G[1]+F.rng.range(-A.aimZ,A.aimZ),sd=(P.kind==='kid'?F.KIDS[P.key].aimSd:A.compSd)+(showOff?A.showOffSd:0),err=F.rng.normal()*sd;
  S7.kick={at:F.t+hold,kind:'shot',speed,aimZ,err,hold,showOff};return;}
 const opp=fbOpps37(P.team),mates=F.persons.filter(Q=>Q.team===P.team&&Q.key!==P.key&&!Q.soft),bp=[b.position.x,b.position.z];
 const pressed=opp.some(Q=>{const dx=Q.pos[0]-P.pos[0],dz=Q.pos[1]-P.pos[1];return Math.hypot(dx,dz)<A.passPress&&fbAng37(P.face[0],P.face[1],dx,dz)<=A.passCone;});
 if(pressed){const R=mates.find(M=>!opp.some(Q=>Math.hypot(Q.pos[0]-M.pos[0],Q.pos[1]-M.pos[1])<A.passFree)&&!opp.some(Q=>fbSegDist37(Q.pos,bp,M.pos)<A.passLane));
  if(R&&F.rng()<A.passP){S7.kick={at:F.t,kind:'pass',recv:R.key};return;}}
 // Kemi feints at a defender in front of her (a side-step of 0.9 m over 0.4 s, keeping the ball)
 if(P.key==='kemi'&&!S7.feint&&opp.some(Q=>Math.hypot(Q.pos[0]-P.pos[0],Q.pos[1]-P.pos[1])<A.feintNear)&&F.rng()<(showOff?A.feintPShow:A.feintP)){S7.feint={until:F.t+A.feintT,side:F.rng()<0.5?-1:1};S7.feintT=F.t;fbEmit37('feint',{who:P.key});}}
function fbFreeHuman37(P,G,dg){const F=FOOTBALL37,A=F.AI,opp=fbOpps37(P.team),bp=[ball.position.x,ball.position.z];
 return F.persons.find(M=>M.team===P.team&&M.kind==='human'&&!M.soft&&Math.hypot(M.pos[0]-P.pos[0],M.pos[1]-P.pos[1])<=9&&Math.hypot(G[0]-M.pos[0],G[1]-M.pos[1])<=dg+1
  &&!opp.some(Q=>Math.hypot(Q.pos[0]-M.pos[0],Q.pos[1]-M.pos[1])<A.passFree)&&!opp.some(Q=>fbSegDist37(Q.pos,bp,M.pos)<A.passLane))||null;}
// the companion answers "Release!": a pass after a seeded 0.3-0.6 s, always within 1.0 s of the call
function fbCalledPass37(P,S7){const F=FOOTBALL37,c=F.call;if(!c||F.t-c.t>2||!(F.owner&&F.owner.key===P.key)||(S7.kick&&S7.kick.called))return;
 S7.kick={at:Math.min(c.t+1.0,Math.max(F.t,c.t+(c.delay||0.3))),kind:'pass',recv:'p'+c.who,called:true};F.call=null;}
// the kick-off: the kicking team's nearest AI taps a pass to its teammate (unless a human on that team touched the ball first)
function fbKickoffPass37(P,S7){const F=FOOTBALL37,ko=F.koPass37;if(!ko||ko.team!==P.team||S7.kick||!(F.owner&&F.owner.key===P.key))return;F.koPass37=null;
 const R=F.persons.find(Q=>Q.team===P.team&&Q.key!==P.key&&!Q.soft);if(R)S7.kick={at:F.t,kind:'pass',recv:R.key,kickoff:true};}
// a planned kick fires when due, if the ball is still at the carrier's feet (a shot is aimed at fire time from where the ball then is)
function fbKickDue37(P,S7){const F=FOOTBALL37,k=S7.kick,b=ball;if(!k||F.t<k.at-1e-9)return;S7.kick=null;if(F.state!=='live'||b.held||b.motor)return;
 const bx=b.position.x,bz=b.position.z;if(F.owner&&F.owner.key!==P.key)return;if(!F.owner&&Math.hypot(bx-P.pos[0],bz-P.pos[1])>F.RELEASE_REACH)return;   // (fixer) never someone else's ball
 if(k.kind==='shot'){const G=fbGoalOf37(P.team),ax=G[0]-bx,az=k.aimZ-bz,al=Math.hypot(ax,az)||1,dir=fbRot37(ax/al,az/al,k.err);
  football37Kick(P,dir,k.speed,'shot',{ai:true,aimZ:r3_37(k.aimZ),err:r3_37(k.err),hold:r3_37(k.hold),showOff:!!k.showOff});return;}
 const R=fbPerson37(k.recv);if(!R)return;const s=football37PassSolve([bx,bz],R);football37Kick(P,s.dir,s.v0,'pass',{ai:true,recv:R.key,called:!!k.called,kickoff:!!k.kickoff});}
football37On('kickoff',e=>{FOOTBALL37.koPass37={team:e.team,t:e.t};});
football37On('kick',e=>{const F=FOOTBALL37;F.lastPass37=e.kind==='pass'&&e.recv?{recv:e.recv,t:F.t}:null;});
football37On('owner',e=>{const F=FOOTBALL37;if(F.koPass37&&e.who&&(e.who==='p0'||e.who==='p1'))F.koPass37=null;});
// the children each frame in a match: special states, then the role target; movement, separation, animation
function football37AI(dt){const F=FOOTBALL37,K=F.kids,st=F.state;if(!K)return;const Pt=F.PITCH;
 for(const k of ['kemi','emeka']){const c=K[k];if(c.gone)continue;const KD=F.KIDS[k],P=fbPerson37(k);if(!P)continue;
  if(st==='setout'){if(c.mode==='setout'&&!c.queue.length&&!c.place){const ko=F.KICKOFF[k];if(Math.hypot(c.pos[0]-ko[0],c.pos[1]-ko[1])<0.06)c.mode='play';}if(c.mode!=='play')continue;}
  if(st==='clearing'||st==='ended'){if(c.mode==='play'){c.mode='clear';c.hop37=0;}continue;}
  if(c.mode!=='play'){if(c.mode==='setout'||c.mode==='idle'||c.mode==='return'){c.mode='play';c.noBall=false;}else continue;}
  let tx,tz,sp=KD.speed,face=null;c.noBall=st!=='live';c.mayChallenge=false;const ko=F.KICKOFF[k];
  if(st==='setout'||st==='waiting'||(st==='live'&&ball.held&&!ball.motor)){tx=ko[0];tz=ko[1];sp=KD.speed*0.6;}
  else if(st==='goal'){const gi=F.goalInfo,mine=gi&&gi.team==='b',sc=mine&&gi.celeb&&gi.celeb!==k&&K[gi.celeb]?K[gi.celeb]:null;
   if(mine&&gi.celeb===k){tx=c.pos[0];tz=c.pos[1];}                                               // the scorer (or, for an own goal, the nearest child) stays and celebrates
   else if(sc){const dx=c.pos[0]-sc.pos[0],dz=c.pos[1]-sc.pos[1],d=Math.hypot(dx,dz)||1;tx=sc.pos[0]+dx/d*0.8;tz=sc.pos[1]+dz/d*0.8;}   // a teammate jogs over
   else{tx=ko[0];tz=ko[1];sp=KD.speed*0.5;}}                                                     // the other team walks back
  else if(st==='motor'){const L=F.KEKE.lane,z=c.pos[1],mid=(L[0]+L[1])/2;tx=c.pos[0];tz=z<mid?Math.min(z,L[0]-0.5):Math.max(z,L[1]+0.5);face=[0,z<mid?1:-1];}
  else if(st==='restart'){const o=F.out;if(o&&o.team==='b'&&fbNearestKid37(o.spot)===c){tx=o.spot[0]+0.5;tz=o.spot[1];}else[tx,tz]=fbAITarget37(P,'back');}
  else{const S7=fbDecide37(P);fbKickoffPass37(P,S7);fbKickDue37(P,S7);c.mayChallenge=S7.role==='chase';[tx,tz]=fbAITarget37(P,S7.role,S7);c.role37=S7.role;fbKidClear37(P,c,S7);}   // (fixer) targets every frame; the reaction delay holds role changes only
  if(st==='live'){const S7=fbAIOf37(k);if(S7.kick&&S7.kick.kind==='shot')sp*=F.AI.chargeWalk;}            // a child plants its feet to shoot (chargeWalk 0; a human walks at 0.55 while charging)
  fbKidMove37(c,tx,tz,sp,dt,{zone:true});c.vmove37=c.vwant37;if(face&&c.vmove37<0.05)c.face=face;
  if(st==='live'&&c.role37==='chase'&&c.mayChallenge&&!(F.owner&&F.owner.key===k)){const dx=ball.position.x-c.pos[0],dz=ball.position.z-c.pos[1],dd=Math.hypot(dx,dz);   // (fixer) near the ball a chaser turns to face it
   if(dd<F.AI.faceNear&&dd>1e-6){const want=Math.atan2(dx,dz),cur=Math.atan2(c.face[0],c.face[1]);let da=want-cur;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;const mx=F.AI.turn*D2R37*dt,a=cur+fbClamp37(da,-mx,mx);c.face=[Math.sin(a),Math.cos(a)];}}
  P.pos=[c.pos[0],c.pos[1]];P.vel=[c.vel[0],c.vel[1]];P.face=[c.face[0],c.face[1]];P.speed=c.vmove37;}
 fbSeparate37(dt);
 for(const k of ['kemi','emeka']){const c=K[k];if(c.gone||c.mode!=='play')continue;c.g.position.set(c.pos[0],c.hop37||0,c.pos[1]);c.g.rotation.y=Math.atan2(c.face[0],c.face[1]);
  const mv=c.vmove37||0;if(typeof animAvatar==='function')animAvatar(c.g,c.t,mv>0.05,false,mv,dt);}}
// people as discs (spec §5.5): pairs closer than r_i + r_j + 0.05 are pushed apart. AI against AI half each, at most 1.5 m/s; a human
// against an AI that squares up to them (faces them) 50/50, otherwise the AI 80%, the AI's share at most 1.5 m/s and the human's the rest
// (only where the human is not blocked); human against human half each. Match only.
function fbSeparate37(dt){const F=FOOTBALL37;if(!fbMatchOn37())return;const L=F.persons.filter(P=>P.kind==='human'||P.kind==='companion'||(P.kind==='kid'&&P.kid&&!P.kid.gone&&P.kid.mode==='play'));
 const step=F.AI.sep*Math.max(0,dt);
 for(let a=0;a<L.length;a++)for(let b=a+1;b<L.length;b++){const A=L[a],B=L[b],dx=B.pos[0]-A.pos[0],dz=B.pos[1]-A.pos[1],d=Math.hypot(dx,dz),m=A.r+B.r+0.05;if(d>=m)continue;
  const ux=d>1e-6?dx/d:1,uz=d>1e-6?dz/d:0,o=m-d,hA=A.kind==='human',hB=B.kind==='human';let sa,sb;
  if(!hA&&!hB){sa=sb=Math.min(o,step)/2;}
  else if(hA&&hB){sa=sb=o/2;}
  else{const H=hA?A:B,Q=hA?B:A,faces=(Q.face[0]*(H.pos[0]-Q.pos[0])+Q.face[1]*(H.pos[1]-Q.pos[1]))/Math.max(d,1e-6)>0.3,ai=Math.min(o*(faces?0.5:0.8),step),hu=o-ai;if(hA){sa=hu;sb=ai;}else{sa=ai;sb=hu;}}
  fbNudge37(A,-ux*sa,-uz*sa);fbNudge37(B,ux*sb,uz*sb);}}
function fbNudge37(P,dx,dz){if(Math.abs(dx)+Math.abs(dz)<1e-9)return;const F=FOOTBALL37;
 if(P.kind==='kid'){const c=P.kid,Z=F.ZONE;c.pos=[fbClamp37(c.pos[0]+dx,Z.x1,Z.x2),fbClamp37(c.pos[1]+dz,Z.z1,Z.z2)];P.pos=[c.pos[0],c.pos[1]];return;}
 const p=P.p;if(!p||!p.g)return;const nx=p.g.position.x+dx,nz=p.g.position.z+dz;F.cost.blocked++;if(blocked(nx,nz,PR,{lvl:p.lvl||0}))return;p.g.position.x=nx;p.g.position.z=nz;P.pos=[nx,nz];}
// (merger) is the companion (in a companion household) on the pitch, ZONE grown by 1 m? The kick-off waits for it, as for the road (CLEAR_WAIT at most)
function fbCompanionIn37(){if(!fbCompanion37()||typeof players==='undefined'||!players[AI.i])return true;const g=players[AI.i].g.position;return fbInRect37(g.x,g.z,FOOTBALL37.ZONE,1.0)&&!((players[AI.i].y||0)>FOOTBALL37.LEVEL_WALL);}
// (merger) a companion off the pitch and out of sight once a match is on (in the courtyard, the flat, upstairs, the market) is handed off, as the
// street's walkers are at set-out: to the nearest free point on the street east of the pitch that no view sees, if that is nearer the pitch (or
// it was upstairs); from there it walks in. Once a second at most, never while it is seen
function fbCompanionHandoff37(){const F=FOOTBALL37,H=F.COMP_HAND;if(!fbCompanion37()||!fbMatchOn37()||F.state==='ended'||F.state==='clearing'||fbOnline37())return;const p=players[AI.i];if(!p||fbCompanionIn37())return;
 if(F.t-(F.compHand37===undefined?-99:F.compHand37)<H.every-1e-9)return;F.compHand37=F.t;const x0=p.g.position.x,z0=p.g.position.z,up=(p.lvl||0)>0||(p.y||0)>F.LEVEL_WALL;
 if(fbInAnyView37(x0,1.0,z0))return;const Pt=F.PITCH,d0=Math.hypot(x0-Pt.cx,z0-Pt.zc);
 for(let x=H.x0;x<=H.x1+1e-9;x+=H.step){const z=H.z;if(!up&&Math.hypot(x-Pt.cx,z-Pt.zc)>d0-H.gain)break;F.cost.blocked++;if(blocked(x,z,PR)||levelAt(x,z)>F.LEVEL_WALL||fbInAnyView37(x,1.0,z))continue;
  p.g.position.set(x,0,z);p.prev=[x,z];p.y=0;p.lvl=0;p.g.baseY=0;p.g.position.y=0;delete fbLast37.ai;if(typeof AI!=='undefined'){AI.path=null;AI.rescue=-1;AI.detour=null;AI.stuck=0;AI.sideT=0;}
  fbEmit37('handoff',{who:'ai',from:[r3_37(x0),r3_37(z0)],to:[r3_37(x),r3_37(z)],up});return;}}
// the companion in a match: its own target from the team AI, with stop 0.05 so it walks onto a resting ball (spec §5.2)
function fbCompanionGoal37(p,dt){const F=FOOTBALL37,P=fbPerson37('ai');if(!P)return null;const st=F.state,Pt=F.PITCH,K0=[Pt.cx-2.0,Pt.zc-0.8];let t;
 if(st==='ended'||st==='clearing')return null;
 if(st==='setout'||st==='waiting'||(st==='live'&&ball.held&&!ball.motor))t=K0;
 else if(st==='goal'){const gi=F.goalInfo,sc=gi&&gi.team==='a'&&gi.celeb&&gi.celeb!=='ai'?fbPerson37(gi.celeb):null;t=sc?[sc.pos[0]-0.9,sc.pos[1]]:K0;}
 else if(st==='motor'){const L=F.KEKE.lane,z=P.pos[1],mid=(L[0]+L[1])/2;t=[P.pos[0],z<mid?Math.min(z,L[0]-0.5):Math.max(z,L[1]+0.5)];}
 else if(st==='restart'){const o=F.out;t=o&&o.team==='a'?[o.spot[0]-0.6,o.spot[1]]:fbAITarget37(P,'back');}
 else{const S7=fbDecide37(P);fbCalledPass37(P,S7);fbKickoffPass37(P,S7);fbKickDue37(P,S7);t=fbAITarget37(P,S7.role,S7);F.aiRole37=S7.role;}
 const Z=F.ZONE,x=fbClamp37(t[0],Z.x1,Z.x2),z=fbClamp37(t[1],Z.z1,Z.z2);
 // from off the pitch (the companion was elsewhere when the match began) it finds its way with the base navigation first, to one fixed point on
 // the street at the pitch's east end (merger: a moving target restarted the base's route at every metre, so from the courtyard it could take the
 // whole match; one fixed point keeps the route, and from there it plays; within 9 m in a clear line it goes straight to its target, as before)
 if(!fbInRect37(P.pos[0],P.pos[1],Z,1.0)&&typeof aiNavTo==='function'){const near=Math.hypot(x-P.pos[0],z-P.pos[1])<9&&typeof lineClear==='function'&&lineClear(P.pos[0],P.pos[1],x,z,p.lvl||0);
  const E=F.COMP_IN,g=near?aiNavTo(p,x,z,0.05):aiNavTo(p,E[0],E[1],0.3);if(g)return g;}
 return {x,z,stop:0.05};}

/* ======================================================================================================================================
   B.2 Mr Bassey, the touchline elder (spec §5.4): when the posts go out he leaves his schedule, enters off-view at one of two points on
   z 6.5, walks straight to the spectator spot at 1.3 m/s, stands there as a ball body (r 0.30) facing the play, comments, takes the
   first-win photo, says his end line and is walked back to his schedule after the clearing.
   ====================================================================================================================================== */
const FB_WALK37=[[0,0]];                                     // a route marker: the base walk skips him, the base idle pose leaves him alone
function fbBasseyNPC37(){return typeof npcs!=='undefined'&&npcs?npcs.bassey||null:null;}
function fbBasseyStart37(){const F=FOOTBALL37,n=fbBasseyNPC37();if(!n||F.bassey37)return;F.bassey37={phase:'wait',t0:F.t,test:-9,entry:null};if(!F.npcExempt.includes('bassey'))F.npcExempt.push('bassey');
 // (fixer) already in sight and near (a quick rematch while he walks home): he turns round and walks back from where he is, never popping away
 const sp=F.SPECT.bassey,x=n.g.position.x,z=n.g.position.z;if(n.g.visible&&Math.hypot(x-sp[0],z-sp[1])<=F.SPECT.near){const B=F.bassey37;B.entry=[x,z];B.phase='walk';n.route=FB_WALK37;n.ri=0;n.dest=null;n.hideAtEnd=false;fbEmit37('bassey',{phase:'walk',from:[r3_37(x),r3_37(z)],waited:0,near:true});}}
function fbBasseyStep37(dt){const F=FOOTBALL37,B=F.bassey37,n=fbBasseyNPC37(),sp=F.SPECT;if(!B||!n)return;
 if(B.phase==='wait'){if(F.t-B.test<0.5-1e-9)return;B.test=F.t;let pick=null;for(const e of sp.enter)if(!fbInAnyView37(e[0],1.0,e[1])){pick=e;break;}
  if(!pick&&F.t-B.t0>=20-1e-9)pick=sp.enter[0];if(!pick)return;
  B.entry=pick.slice();B.phase='walk';n.route=FB_WALK37;n.ri=0;n.dest=null;n.hideAtEnd=false;n.g.visible=true;n.g.position.set(pick[0],0,pick[1]);n.g.rotation.y=Math.atan2(sp.bassey[0]-pick[0],0);
  fbEmit37('bassey',{phase:'walk',from:pick.slice(),waited:r3_37(F.t-B.t0)});return;}
 if(B.phase==='walk'){const tx=sp.bassey[0],tz=sp.bassey[1],dx=tx-n.g.position.x,dz=tz-n.g.position.z,d=Math.hypot(dx,dz),s=sp.walk*dt;
  if(d<=s+1e-6){n.g.position.set(tx,0,tz);n.route=null;n.home=[tx,tz,fbBasseyYaw37()];B.phase='spot';fbEmit37('bassey',{phase:'spot'});return;}
  n.g.position.x+=dx/d*s;n.g.position.z+=dz/d*s;n.g.rotation.y=Math.atan2(dx,dz);n.t=(n.t||0)+dt;if(typeof animAvatar==='function')animAvatar(n.g,n.t,true,false,sp.walk,dt);return;}
 if(B.phase==='spot'){n.route=null;n.home=[sp.bassey[0],sp.bassey[1],fbBasseyYaw37()];}}
// he faces the ball when it is within 6 m, otherwise the pitch centre
function fbBasseyYaw37(){const F=FOOTBALL37,s=F.SPECT.bassey,b=ball,d=b?Math.hypot(b.position.x-s[0],b.position.z-s[1]):99;const t=d<=6?[b.position.x,b.position.z]:[F.PITCH.cx,F.PITCH.zc];return Math.atan2(t[0]-s[0],t[1]-s[1]);}
function fbBasseyFace37(){const F=FOOTBALL37,B=F.bassey37,n=fbBasseyNPC37();if(!B||!n||B.phase==='wait')return;
 if(B.phase==='walk'){n.g.rotation.y=Math.atan2(F.SPECT.bassey[0]-n.g.position.x,F.SPECT.bassey[1]-n.g.position.z);return;}n.g.rotation.y=fbBasseyYaw37();}
// back to his schedule (a world change places everyone afresh, so nothing to do there)
function fbBasseyRelease37(how){const F=FOOTBALL37,B=F.bassey37,n=fbBasseyNPC37();F.bassey37=null;F.npcExempt=F.npcExempt.filter(k=>k!=='bassey');F.lineQ37=[];if(!n||!B)return;
 if(n.route===FB_WALK37)n.route=null;if(B.phase==='wait'||how==='world')return;
 try{const party=S.party&&S.party.on&&S.party.guests&&S.party.guests.includes('bassey'),spot=party?(S.party.indoor?partySpotIn('bassey'):partySpot('bassey')):NPC_SPOTS.bassey[slot()];
  if(spot)walkNPC(n,spot,false);else walkNPC(n,null,true);}catch(e){}fbEmit37('bassey',{phase:'off',how:how||null});}

/* ---------- his commentary (spec §11.1): no repeat in a day before the category is used up; at most one line per 6 s except goals,
   the street's call, the cap, the call, the end and the photo; post lines held 0.5 s and dropped if a goal follows; only at his spot ---------- */
const ALWAYS37=['goalA','goalB','own','street','cap','call','won','lost','unfinished','photo'];
function fbSay37(cat,o){const F=FOOTBALL37,B=F.bassey37;o=o||{};if(!B||B.phase!=='spot')return false;const always=ALWAYS37.includes(cat);
 (F.lineQ37||(F.lineQ37=[])).push({cat,o,at:F.t+(o.delay||0),until:F.t+(o.delay||0)+(o.ttl===undefined?(always?0:4):o.ttl),always});fbLinesStep37();return true;}
function fbLinesStep37(){const F=FOOTBALL37,Q=F.lineQ37;if(!Q||!Q.length)return;const B=F.bassey37;if(!B||B.phase!=='spot'){Q.length=0;return;}
 for(let k=0;k<Q.length;k++){const q=Q[k];if(F.t<q.at-1e-9)continue;
  if((!q.always&&F.t-(F.lineT37===undefined?-99:F.lineT37)<6-1e-9)||(q.cat==='post'&&fbGoalNear37())){if(F.t>q.until+1e-9)Q.splice(k--,1);continue;}
  Q.splice(k--,1);fbSpeak37(q.cat,q.o);}}
// is a goal about to happen (the ball within 0.8 s of crossing a goal line near the mouth)? the post line waits until it is not
// (or the ball within 5 m of a goal, where a quick shot could still go in): the post line waits until it is not, or is dropped
function fbGoalNear37(){const F=FOOTBALL37,P=F.PITCH,b=ball;if(!b||F.state!=='live')return false;const x=b.position.x,z=b.position.z;
 if(Math.hypot(x-P.x1,z-P.zc)<5||Math.hypot(x-P.x2,z-P.zc)<5)return true;const vx=b.v[0],vz=b.v[1];if(Math.abs(vx)<0.05)return false;
 const X=vx>0?P.x2:P.x1,t=(X-x)/vx;if(t<0||t>0.8)return false;return Math.abs(z+vz*t-P.zc)<P.half+0.4;}
function fbSpeak37(cat,o){const F=FOOTBALL37,T=F.LINES.bassey[cat],L=fbSave37();if(!T)return null;o=o||{};
 let said=null;if(L){if(!L.said||L.said.day!==S.day)L.said={day:S.day,who:[],bassey:[]};said=L.said.bassey;}
 let cands=T.filter(x=>!x[2]||!x[2].who||x[2].who===o.who);if(!cands.length)return null;
 let fresh=said?cands.filter(x=>!said.includes(x[0])):cands;if(!fresh.length){for(const x of T){const j=said.indexOf(x[0]);if(j>=0)said.splice(j,1);}fresh=cands;}
 F.lineN37=(F.lineN37||0)+1;const r=rng37(((S.day||1)*7919+F.lineN37*131)>>>0),pick=fresh[Math.floor(r()*fresh.length)];
 const text=pick[0]==='b1'&&F.OWNER.realName?F.LINES.realName:pick[1],id='fb37b-'+cat+'-'+pick[0];if(said)said.push(pick[0]);F.lineT37=F.t;
 F.lastLine37={t:F.t,who:'bassey',name:fbBasseyName37(),text,id};fbEmit37('line',{who:'bassey',cat,id,text});
 try{const n=fbBasseyNPC37(),allCompact=[0,1].filter(fbHalfShown37).every(fbCompact37);if(n&&!allCompact&&typeof showBubble==='function'&&!(typeof silentMode==='function'&&silentMode()))fbBubble37('fb37:bassey:'+pick[0],text,n.g,2.05,3600,2.1);}catch(e){}return id;}
football37On('goal',e=>{const F=FOOTBALL37;if(F.lineQ37)F.lineQ37=F.lineQ37.filter(q=>q.cat!=='post');
 fbSay37(e.how==='street'?'street':e.own?'own':e.team==='a'?'goalA':'goalB',{who:e.who});
 // visible both ways: the children show off when they lead by 2, Kemi gets serious when the humans do
 const lead=e.score[1]-e.score[0],show=lead>=2,ser=lead<=-2,saidToday=id=>{const L=fbSave37();return !!(L&&L.said&&L.said.day===S.day&&L.said.bassey.includes(id));};   // (fixer) these two at most once a day
 if(show&&!F.showOff&&!saidToday('l1'))fbSay37('showOff',{delay:1.0,ttl:12});if(ser&&!F.serious&&!saidToday('l2'))fbSay37('serious',{delay:1.0,ttl:12});
 F.showOff=show;F.serious=ser;const cw=F.goalInfo?F.goalInfo.celeb:e.who;F.celeb37=cw?{who:cw,team:e.team,t0:F.t}:null;if(cw)fbCelebStart37(cw);});   // (fixer) an own goal is celebrated by the side it helps, never by its scorer
football37On('post',()=>{fbSay37('post',{delay:0.5,ttl:2.5});});
football37On('banner',e=>{if(e.again)return;fbSay37(e.kind==='cap'?'cap':'call');});
football37On('motor',e=>{if(e.on)fbSay37('motor',{ttl:3});});
football37On('end',e=>{fbSay37(e.result==='won'?'won':e.result==='lost'?'lost':'unfinished');});
football37On('photo',()=>{fbSay37('photo');});
// "See guiding!": an owner who keeps the ball past an opponent who came within 0.9 m, and leaves them 2 m behind within 3 s
function fbDribbleWatch37(){const F=FOOTBALL37,O=F.owner;if(!fbPlaying37()||F.state!=='live'||!O){F.beat37=null;return;}
 const w=F.beat37;if(w&&(w.owner!==O.key||F.t-w.t>3)){F.beat37=null;}
 for(const Q of fbOpps37(O.team||'a')){const d=Math.hypot(Q.pos[0]-O.pos[0],Q.pos[1]-O.pos[1]);
  if(!F.beat37&&d<0.9){F.beat37={owner:O.key,opp:Q.key,t:F.t};}
  else if(F.beat37&&F.beat37.opp===Q.key&&d>=2.0){F.beat37=null;fbSay37(O.key==='kemi'?'dribbleKemi':'dribbleUs',{ttl:1.0});fbEmit37('dribble',{who:O.key,past:Q.key});}}}
football37On('state',e=>{if(e.to==='setout')fbBasseyStart37();if(e.to==='idle'||e.to==='off')fbBasseyRelease37(e.why==='world'?'world':null);});

/* ======================================================================================================================================
   B.3 Shouts (spec §11.2): bubbles over the children; mirrored into a view's commentary line only when that child is off-screen there
   ====================================================================================================================================== */
// v37 speech bubbles: the base bubble's look (cream, dark ink) but sized to the words, wrapped to two lines, a little smaller in the world so a
// shout over a child does not cover the play, larger on short screens, following its speaker, and shown for ms of game time (the base: 3.6 s)
function fbTextSprite37(text){const cv=document.createElement('canvas'),sc=2,g=cv.getContext('2d'),fs=34,font=`700 ${fs}px Fraunces, Georgia, serif`;g.font=font;
 const mw=t=>{const m=g.measureText&&g.measureText(t);return m&&m.width?m.width:t.length*fs*0.55;},words=String(text).split(' '),lines=[];let cur='';
 for(const w of words){const t=cur?cur+' '+w:w;if(cur&&mw(t)>440){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);
 const n=Math.min(lines.length,3),W=Math.min(496,Math.max(...lines.slice(0,n).map(mw))+44),H=n*42+30;cv.width=512*sc;cv.height=Math.ceil(H+8)*sc;g.scale(sc,sc);
 g.fillStyle='rgba(248,239,221,.96)';roundRect(g,256-W/2,4,W,H,16);g.fill();g.fillStyle='#2A1F17';g.font=font;g.textAlign='center';g.textBaseline='middle';
 for(let k=0;k<n;k++)g.fillText(lines[k],256,4+15+21+k*42);const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));sp.userData.fb37h=(H+8)/512;return sp;}
function fbBubble37(key,text,obj,y,ms,w){if(typeof bubbles==='undefined'||typeof scene==='undefined'||!obj)return;let b=bubbles[key];
 if(!b){b=fbQuiet37(()=>fbTextSprite37(text));scene.add(b);bubbles[key]=b;b.until=0;}
 const h=typeof innerHeight==='number'&&innerHeight>0?innerHeight:800,k=Math.min(1.8,Math.max(1,600/h)),W=(w||1.7)*k;b.scale.set(W,W*b.userData.fb37h,1);
 b.userData.fb37f={obj,y:(y||2)+W*b.userData.fb37h/2};b.position.set(obj.position.x,(obj.position.y||0)+b.userData.fb37f.y,obj.position.z);b.visible=true;
 b.until=Infinity;const F=FOOTBALL37;   // (fixer) timed only on the module's clock (no wall clock): the base's expiry never touches it
 b.userData.fb37end=F.t+(ms||3600)/1000;if(!F.bub37)F.bub37=[];if(!F.bub37.includes(b))F.bub37.push(b);}
function fbBubbleStep37(){const L=FOOTBALL37.bub37;if(!L||!L.length)return;for(let k=L.length-1;k>=0;k--){const b=L[k],f=b.userData.fb37f;
 if(!f||FOOTBALL37.t>=b.userData.fb37end){b.visible=false;b.until=0;L.splice(k,1);continue;}
 b.visible=true;b.until=Infinity;b.position.set(f.obj.position.x,(f.obj.position.y||0)+f.y,f.obj.position.z);}}   // timed on the game's clock, so a pause or a slow frame keeps it
function fbShout37(who,text){const F=FOOTBALL37;F.shouts.push({t:r3_37(F.t),who,text});if(F.shouts.length>200)F.shouts.shift();fbEmit37('shout',{who,text});
 try{const K=F.kids,obj=who==='kemi'||who==='emeka'?(K&&K[who]?K[who].g:null):null;if(obj&&typeof showBubble==='function'&&!(typeof silentMode==='function'&&silentMode()))fbBubble37('fb37:'+who+':'+text,text,obj,1.62,2600,1.7);}catch(e){}}

/* ======================================================================================================================================
   B.4 Team rings, the celebration and the visual twins with their sounds (spec §7.2, §6.5, §9). Sounds play straight on AUDIO35's own
   context and master bus, only when it exists and sound is on: no context is ever created, no recipe or cue hook is added.
   ====================================================================================================================================== */
function fbRingsStep37(){const F=FOOTBALL37,on=['setout','live','goal','restart','motor','waiting','ended'].includes(F.state);
 if(!on){if(F.rings37){for(const r of F.rings37)if(r.m.parent)r.m.parent.remove(r.m);F.rings37=null;}return;}
 if(!F.rings37)fbQuiet37(()=>{F.ringG37=F.ringG37||{big:new THREE.RingGeometry(0.28,0.36,28),small:new THREE.RingGeometry(0.24,0.31,28)};
  F.ringM37=F.ringM37||{a:new THREE.MeshBasicMaterial({color:F.COL.a,transparent:true,opacity:0.55,depthWrite:false}),b:new THREE.MeshBasicMaterial({color:F.COL.b,transparent:true,opacity:0.55,depthWrite:false})};F.rings37=[];});
 const want=F.persons.filter(P=>P.team&&!P.soft);
 for(const P of want){let r=F.rings37.find(x=>x.key===P.key);if(!r){fbQuiet37(()=>{const m=new THREE.Mesh(P.kind==='kid'?F.ringG37.small:F.ringG37.big,F.ringM37[P.team]);m.rotation.x=-Math.PI/2;m.renderOrder=1;m.userData.football37='ring';m.name='football37-ring';scene.add(m);r={key:P.key,m};F.rings37.push(r);});}
  r.m.position.set(P.pos[0],0.03,P.pos[1]);r.m.visible=!(P.kind==='kid'&&P.kid&&(P.kid.opacity||0)<0.5);r.seen=F.t;}
 for(let k=F.rings37.length-1;k>=0;k--){const r=F.rings37[k];if(r.seen!==F.t){if(r.m.parent)r.m.parent.remove(r.m);F.rings37.splice(k,1);}}}
// the scorer waves and hops twice; humans and the companion too (visual only, on level 0)
function fbPlayOnce37(g,name){try{if(!g||!g.mixer||!g.actions||!g.actions[name])return;const a=g.actions[name];a.reset();a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=false;a.setEffectiveWeight(1);a.play();}catch(e){}}
function fbScorerG37(who){const F=FOOTBALL37;if(who==='kemi'||who==='emeka')return F.kids&&F.kids[who]?F.kids[who].g:null;if(who==='ai')return typeof AI!=='undefined'&&players[AI.i]?players[AI.i].g:null;
 if(who==='p0'||who==='p1'){const p=players[+who[1]];return p?p.g:null;}return null;}
function fbCelebStart37(who){const g=fbScorerG37(who);if(g)fbPlayOnce37(g,'wave');}
function fbCelebStep37(){const F=FOOTBALL37,c=F.celeb37;if(!c)return;const e=F.t-c.t0,h=e<0.9?0.18*Math.abs(Math.sin(Math.PI*e/0.45)):0;
 if(c.who==='kemi'||c.who==='emeka'){const k=F.kids&&F.kids[c.who];if(k)k.hop37=h;}
 else{const g=fbScorerG37(c.who),p=g&&players.find(q=>q.g===g);if(g&&p&&!(p.lvl>0))g.position.y=(g.baseY||0)+h;}
 if(e>=0.9||F.state!=='goal'){if(c.who==='kemi'||c.who==='emeka'){const k=F.kids&&F.kids[c.who];if(k)k.hop37=0;}F.celeb37=null;}}
// small effects: dust motes, the post star, the rising "GOAL!" (each removed when done; tagged 'fx')
function fbFx37(m,life,kind,upd){m.userData.football37='fx';scene.add(m);(FOOTBALL37.fx37||(FOOTBALL37.fx37=[])).push({m,t0:FOOTBALL37.t,life,kind,upd});}
function fbMotes37(x,z,n,y0){const F=FOOTBALL37;fbQuiet37(()=>{F.moteG37=F.moteG37||new THREE.SphereGeometry(0.05,6,4);
 for(let k=0;k<n;k++){const m=new THREE.Mesh(F.moteG37,new THREE.MeshBasicMaterial({color:'#C9AF86',transparent:true,opacity:0.8,depthWrite:false}));const a=k/n*Math.PI*2+0.4;
  m.position.set(x+Math.sin(a)*0.08,(y0||0.05)+0.02*k,z+Math.cos(a)*0.08);const vx=Math.sin(a)*0.35,vz=Math.cos(a)*0.35;
  fbFx37(m,0.45,'mote',(o,u,dt)=>{o.m.position.x+=vx*dt;o.m.position.z+=vz*dt;o.m.position.y+=0.35*dt;o.m.scale.setScalar(1+u*1.5);o.m.material.opacity=0.8*(1-u);});}});}
function fbStarTex37(){const F=FOOTBALL37;if(F.starT37)return F.starT37;const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d');
 try{g.translate(32,32);g.fillStyle='#FFF4C8';for(let k=0;k<4;k++){g.rotate(Math.PI/2);g.beginPath();g.moveTo(0,-30);g.lineTo(5,-5);g.lineTo(-5,-5);g.closePath();g.fill();}g.beginPath();g.arc(0,0,7,0,Math.PI*2);g.fill();}catch(e){}
 F.starT37=new THREE.CanvasTexture(cv);return F.starT37;}
function fbStar37(x,z){fbQuiet37(()=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:fbStarTex37(),transparent:true,depthWrite:false}));s.scale.set(0.5,0.5,1);s.position.set(x,0.62,z);
 fbFx37(s,0.3,'star',(o,u)=>{o.m.material.opacity=1-u;o.m.scale.setScalar(0.5+0.3*u);});});}
function fbGoalSprite37(x,z){const F=FOOTBALL37;fbQuiet37(()=>{const s=typeof textSprite==='function'?textSprite(F.LINES.ui.goalSprite,{w:1.8,size:64,bg:'rgba(46,158,91,.92)',fg:'#FFF6E2'}):new THREE.Sprite(new THREE.SpriteMaterial({transparent:true}));
 s.position.set(x,1.1,z);fbFx37(s,1.4,'goal',(o,u)=>{o.m.position.y=1.1+0.8*u;o.m.material.opacity=u<0.7?1:1-(u-0.7)/0.3;});});}
function fbFxStep37(dt){fbBubbleStep37();const F=FOOTBALL37,L=F.fx37;if(!L||!L.length)return;for(let k=L.length-1;k>=0;k--){const o=L[k],u=(F.t-o.t0)/o.life;
 if(u>=1){if(o.m.parent)o.m.parent.remove(o.m);if(o.kind==='mote'||o.kind==='star')o.m.material.dispose();else if(o.kind==='goal'){if(o.m.material.map)o.m.material.map.dispose();o.m.material.dispose();}L.splice(k,1);continue;}
 if(o.upd)o.upd(o,u,dt);}}
function fbFxClear37(){const F=FOOTBALL37;for(const o of (F.fx37||[]))if(o.m.parent)o.m.parent.remove(o.m);F.fx37=[];}
// the sounds
function fbAudio37(){return typeof AUDIO35!=='undefined'&&AUDIO35&&AUDIO35.ctx&&AUDIO35.master&&typeof AUDIO35.on==='function'&&AUDIO35.on()?AUDIO35:null;}
let fbNoiseBuf37=null,fbNoiseCtx37=null;
function fbNoise37(c){if(fbNoiseBuf37&&fbNoiseCtx37===c)return fbNoiseBuf37;const sr=c.sampleRate||44100,n=Math.max(64,Math.floor(sr*0.06)),buf=c.createBuffer(1,n,sr),d=buf.getChannelData(0),r=rng37(3707);
 for(let k=0;k<n;k++)d[k]=r()*2-1;fbNoiseBuf37=buf;fbNoiseCtx37=c;return buf;}
function fbBurst37(c,out,t,type,freq,gain,len){const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=fbNoise37(c);f.type=type;f.frequency.setValueAtTime(freq,t);
 g.gain.setValueAtTime(gain,t);g.gain.linearRampToValueAtTime(0.0001,t+len);s.connect(f);f.connect(g);g.connect(out);s.start(t);s.stop(t+len+0.01);}
function fbSound37(kind,k){const A=fbAudio37();if(!A)return false;try{const c=A.ctx;if(c.state&&c.state!=='running')return false;const t=c.currentTime+0.005,M=A.master;k=k===undefined?1:k;
 if(kind==='kick'){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(95,t);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.6*k,t+0.02);g.gain.linearRampToValueAtTime(0.0001,t+0.12);
  o.connect(g);g.connect(M);o.start(t);o.stop(t+0.13);fbBurst37(c,M,t,'bandpass',900,0.3*k,0.05);}
 else if(kind==='tok'){for(const f of [1650,2400]){const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(0.25*k,t+0.004);g.gain.exponentialRampToValueAtTime(0.0001,t+0.09);o.connect(g);g.connect(M);o.start(t);o.stop(t+0.1);}}
 else if(kind==='goal'){for(const dt of [0,0.11,0.24])fbBurst37(c,M,t+dt,'highpass',1500,0.45*k,0.025);const o=c.createOscillator(),g=c.createGain(),t1=t+0.3;o.type='sine';
  o.frequency.setValueAtTime(420,t1);o.frequency.linearRampToValueAtTime(760,t1+0.35);g.gain.setValueAtTime(0.0001,t1);g.gain.linearRampToValueAtTime(0.25*k,t1+0.05);g.gain.linearRampToValueAtTime(0.0001,t1+0.35);
  o.connect(g);g.connect(M);o.start(t1);o.stop(t1+0.37);}
 FOOTBALL37.sound37[kind]=(FOOTBALL37.sound37[kind]||0)+1;return true;}catch(e){return false;}}
FOOTBALL37.twins37={kick:0,post:0,goal:0,cairn:0,square:0};FOOTBALL37.sound37={};
// the kick: three dust motes at the kicker's foot (the leg swing is set by football37Kick) and the thud
function fbTwinKick37(P,speed){const F=FOOTBALL37;if(!P||!P.pos)return;const fx=P.face?P.face[0]:0,fz=P.face?P.face[1]:1;fbMotes37(P.pos[0]+fx*0.3,P.pos[1]+fz*0.3,3,0.04);F.twins37.kick++;
 fbSound37('kick',fbClamp37(speed/11,0.35,1));}
function fbDust37(x,z){fbEmit37('dust',{at:[r3_37(x),r3_37(z)]});fbMotes37(x,z,5,0.05);}
football37On('post',e=>{const F=FOOTBALL37,c=F.mesh.cairns[e.post];if(c)fbStar37(c.pos[0],c.pos[1]);F.twins37.post++;fbSound37('tok',Math.max(0.25,Math.min(1,(e.speed||0)/5)));});   /* a dribbled knock is a soft tok, a shot a full one */
football37On('cairn',()=>{FOOTBALL37.twins37.cairn++;fbSound37('tok',0.5);});
football37On('goal',e=>{const F=FOOTBALL37;F.goalBanner37={t:F.t,team:e.team};F.twins37.goal++;fbSound37('goal',1);});   // (fixer) the banner sits at the top of each view, not over the goal
football37On('square',()=>{const F=FOOTBALL37,G=F.SQUARE_GOAL;fbGoalSprite37(G.x,(G.z1+G.z2)/2);F.twins37.square++;fbSound37('goal',0.5);});

/* ======================================================================================================================================
   B.5 The interface per split view (spec §7): score chip (compact on phones, opposite the player card), the "Last goal wins" banner, the
   commentary line, the summary strip, the "Release!" chip, the first-match and landscape hints; prompts and the role line through the
   updateHUD wrapper. Elements are made once per half and touched only when their text or class changes.
   ====================================================================================================================================== */
FOOTBALL37.ui37=[{},{}];FOOTBALL37.arrows37=[null,null];FOOTBALL37.cam37=[null,null];
// the page knows a match is on (the CSS hides the wayfinding pill, and on small screens the Pantry cards): set from setout to clearing
function fbBodyClass37(){if(typeof document==='undefined'||!document.body||!document.body.classList)return;const on=MATCH37.includes(FOOTBALL37.state),cl=document.body.classList;if(cl.contains('football37-match')!==on)cl.toggle('football37-match',on);}
// (fixer, v37 review F8) beside the children waiting to play, the wayfinding pill steps aside too (football37-near), as it does in a match
function fbNearClass37(){if(typeof document==='undefined'||!document.body||!document.body.classList)return;const on=fbNearKids37(),cl=document.body.classList;if(cl.contains('football37-near')!==on)cl.toggle('football37-near',on);}
function fbHalfShown37(i){if(typeof players==='undefined'||!players[i])return false;if(fbOnline37())return i===NET.myIndex;if(fbCompanion37())return i===0;return true;}
function fbEl37(i,key,cls){const F=FOOTBALL37,U=F.ui37[i];if(U[key])return U[key];if(typeof document==='undefined'||!document.getElementById)return null;const host=document.getElementById('half'+i);
 if(!host||!host.appendChild||!document.createElement)return null;const el=document.createElement('div');el.className=cls;if(el.style)el.style.display='none';host.appendChild(el);U[key]=el;return el;}
function fbPut37(el,cls,html,show){if(!el)return;const k=show?cls+'|'+html:'';if(el._k37===k)return;el._k37=k;if(!show){if(el.style)el.style.display='none';return;}
 el.className=cls;el.innerHTML=html;if(el.style)el.style.display='';}
function fbCompact37(i){return typeof v21Viewport==='function'&&v21Viewport(i).w<=480;}
// the chip goes on the side opposite the player card: the left card in every half but a landscape pair's right half (its card is on the right)
function fbSide37(i){return i===1&&fbLocalPair37()&&typeof innerWidth!=='undefined'&&innerWidth>=innerHeight?'l':'r';}
// the name of the Act control as this player knows it (fixer, C11 and M3): a phone half on a touch screen always says Act
function fbKeyName37(i){const U=FOOTBALL37.LINES.ui,li=typeof lastInput!=='undefined'?lastInput[i]:'key';if(li==='touch'||(fbCompact37(i)&&fbTouchScreen37()))return U.touchName;if(li==='pad')return U.padName;return U.keyName[fbCompanion37()?0:i]||U.keyName[0];}
function fbTouchScreen37(){try{return typeof navigator!=='undefined'&&(navigator.maxTouchPoints||0)>0;}catch(e){return false;}}
function fbNameOf37(key){if(key==='p0'||key==='p1')return fbName37(+key[1]);if(key==='ai')return fbName37(1);if(key==='kemi')return 'Kemi';if(key==='emeka')return 'Emeka';if(key==='bassey')return fbBasseyName37();return key||'';}
function fbBasseyName37(){try{if(typeof CAST!=='undefined'&&CAST.bassey&&CAST.bassey.name)return CAST.bassey.name;}catch(e){}return 'Mr. Bassey';}
function fbSummary37(){const F=FOOTBALL37,U=F.LINES.ui,R=F.result;if(!R)return null;const goals=(F.stats&&F.stats.goals)||[];let top;
 if(R.result==='unfinished')top=fbFill37(U.unfinished,{a:R.a,b:R.b});
 else if(R.last){const g=goals[goals.length-1],a=R.a-(g&&g.team==='a'?1:0),b=R.b-(g&&g.team==='b'?1:0);top=fbFill37(R.result==='won'?U.lastUs:U.lastThem,{a,b});}
 else top=fbFill37(U.fullTime,{a:R.a,b:R.b});
 const tally=[];for(const g of goals){const n=fbNameOf37(g.who)+(g.own?' '+U.og:'');const t=tally.find(x=>x.n===n);if(t)t.c++;else tally.push({n,c:1});}
 return {top,goals:tally.length?fbFill37(U.goals,{list:tally.map(t=>t.n+(t.c>1?' ×'+t.c:'')).join(', ')}):''};}
function fbHudStep37(){const F=FOOTBALL37;if(typeof document==='undefined'||!document.getElementById)return;const U=F.LINES.ui,on=fbMatchOn37()&&F.state!=='clearing';fbNearClass37();
 // (fixer, F4) the prompt follows the kick entry on the frame it comes or goes, not up to 0.25 s later
 if(typeof hotspotCache!=='undefined'){const kk=F.kickHot37||(F.kickHot37=[false,false]);let ch=false;for(const i of [0,1]){const k=!!(hotspotCache[i]&&hotspotCache[i].id==='kick37');if(k!==kk[i]){kk[i]=k;ch=true;}}if(ch)fbHUD37();}
 // the summary goes on an Act press by either human (not the one asking for another game)
 if(F.state==='ended')for(const i of [0,1])if(held37[i]&&!prevHeld37[i]){const hs=typeof hotspotCache!=='undefined'?hotspotCache[i]:null;if(!(hs&&/^(again37|play37|kick37)$/.test(hs.id))){fbClearStart37();break;}}
 // the charge cells advance between the base's 0.25 s refreshes
 for(const i of [0,1]){const lb=charge37[i]?fbChargeLabel37(i):'';if(lb!==(F.chargeLbl37||(F.chargeLbl37=['','']))[i]){F.chargeLbl37[i]=lb;fbHUD37();}}
 const sum=F.state==='ended'?fbSummary37():null,line=F.lastLine37&&F.t-F.lastLine37.t<3?F.lastLine37:null,shout=F.shouts.length?F.shouts[F.shouts.length-1]:null;
 for(const i of [0,1]){const show=on&&fbHalfShown37(i);if(!show&&!F.ui37[i].chip)continue;const compact=fbCompact37(i),side=fbSide37(i),sc=compact?' compact side-'+side:'';
  // score chip and banner
  const banner=F.lastGoal?`<span class="to">·</span> <span class="fb37-banner">${esc(U.lastGoal)}</span>`:`<span class="to">· ${esc(U.firstTo)}</span>`;
  fbPut37(fbEl37(i,'chip','fb37-score'),'fb37-score'+sc,compact?`<span class="team37 a">● ${F.score[0]}</span> – <span class="team37 b">${F.score[1]} ●</span>${F.lastGoal?`<br><span class="fb37-banner">${esc(U.lastGoal)}</span>`:''}`
   :`<span class="team37 a">${esc(U.us)} ${F.score[0]}</span> – <span class="team37 b">${F.score[1]} ${esc(U.them)}</span> ${banner}`,show);
  // the commentary line: Mr Bassey's latest line for 3 s, or a child's shout for 2 s when that child is off-screen in this view (always in a
  // compact half, where a bubble over a child is too small to read)
  let txt='';const sh=shout&&F.t-shout.t<2&&(shout.who==='kemi'||shout.who==='emeka')&&F.kids&&F.kids[shout.who]?shout:null;
  if(sh&&(!line||sh.t>=line.t)){const c=F.kids[sh.who];if(!fbSeen37(i,c.pos[0],1.0,c.pos[1]))txt=fbNameOf37(sh.who)+': '+sh.text;else if(line)txt=line.name+': '+line.text;}
  else if(line)txt=line.name+': '+line.text;
  fbPut37(fbEl37(i,'line','fb37-line'),'fb37-line'+sc+(F.lastGoal&&compact?' low':''),esc(txt),show&&!!txt);
  // the summary strip
  fbPut37(fbEl37(i,'strip','fb37-strip'),'fb37-strip',sum?`<b>${esc(sum.top)}</b>${sum.goals?`<span>${esc(sum.goals)}</span>`:''}`:'',show&&!!sum);
  // the first-match hint (and, for two players on a portrait screen, the landscape hint)
  // (fixer) worded for the player's own input (E, Enter, Act, A); on a phone half a short line at the top for 4 s, the "turn sideways" line apart
  const hint=show&&F.hintUntil&&F.t<F.hintUntil&&F.state!=='ended';const portrait=typeof innerHeight!=='undefined'&&innerHeight>innerWidth&&fbLocalPair37();
  const land=portrait&&F.t<(F.landUntil37||0),kn=fbKeyName37(i),hs=land?'':compact?(F.t<(F.hintShortUntil||0)?`<span>${esc(fbFill37(U.hintShort,{k:kn}))}</span>`:''):`<span>${esc(fbFill37(U.hint,{k:kn}))}</span>`,hl=land?`<span class="land">${esc(U.landscape)}</span>`:'';   // (fixer, F3) one at a time
  fbPut37(fbEl37(i,'hint','fb37-hint'),'fb37-hint'+(compact?' compact':''),hs+hl,!!hint&&!!(hs||hl));
  // (fixer) "GOAL!" at the top of each view, clear of the goal and the people, in the scoring side's colour
  const gb=F.goalBanner37&&F.t-F.goalBanner37.t<F.GOAL_BANNER?F.goalBanner37:null;
  fbPut37(fbEl37(i,'goal','fb37-goal'),'fb37-goal team37 '+(gb?gb.team:'a')+(compact?' compact':''),gb?esc(U.goalSprite):'',show&&!!gb);
  // "{caller}: Release!" in the owner's half, with an arrow towards the caller
  const cc=F.callChip37&&F.callChip37.owner===i&&F.t<F.callChip37.until&&F.owner&&F.owner.kind==='human'&&F.owner.idx===i?F.callChip37:null;let ch='';
  if(cc&&players[cc.caller]){const q=players[cc.caller].g.position,r=fbProject37(i,q.x,1.0,q.z);ch=`<span class="ar" style="transform:rotate(${(r.ang*180/Math.PI).toFixed(0)}deg)">➜</span><span>${esc(fbFill37(U.releaseChip,{name:fbName37(cc.caller)}))}</span>`;}
  fbPut37(fbEl37(i,'call','fb37-call'),'fb37-call',ch,show&&!!ch);}}
football37On('call',e=>{const F=FOOTBALL37,i=+String(e.who).slice(1),O=F.owner;if(fbLocalPair37()&&O&&O.kind==='human'&&O.idx!==i)F.callChip37={owner:O.idx,caller:i,until:F.t+1.5};});
// the prompt (read live, so it changes on the frame of a match transition or a charge cell) and the role line, in a match or a charge
function fbPrompts37(){const F=FOOTBALL37;if(!S||!S.p||typeof players==='undefined'||!players.length||typeof document==='undefined'||S.phase!=='play')return;
 const on=fbMatchOn37();if(!on&&!charge37[0]&&!charge37[1]&&!F.roleOn37)return;const open=typeof overlayOpen==='function'&&overlayOpen();
 for(const i of [0,1]){if(!players[i]||(fbOnline37()&&i!==NET.myIndex)||(fbCompanion37()&&i!==0))continue;const pr=document.getElementById('pr'+i),role=document.getElementById('prole'+i);
  if(typeof bench36Role==='function'&&bench36Role(i))continue;   // (fixer, I1) a bench holder keeps the bench's own Move/Turn prompt and role line
  if(pr&&(on||charge37[i])&&!open){const hs=typeof nearest==='function'?nearest(i):hotspotCache[i];
   const g37=fbCompact37(i)&&fbTouchScreen37()?FOOTBALL37.LINES.ui.touchName:glyph(i);   // (fixer) never a key glyph on a phone half
   if(hs&&hs.label){pr.className='pr on p'+i+(on?' fb37-pr':'');pr.innerHTML=`<span class="k">${esc(g37)}</span><span>${esc(hs.label)}</span>`;}else pr.className='pr p'+i;}
  if(role&&role.style){if(on){role.textContent=F.LINES.ui.role;role.style.color='#8FDDAE';}else if(F.roleOn37)role.style.color='';}}
 F.roleOn37=on;}
// where a world point falls in view i: inside the framed area (between the top and bottom margins), and the screen angle from its centre
const fbPv37=new THREE.Vector3();
function fbProject37(i,x,y,z){const out={inside:false,ang:0,px:0,py:0};if(typeof cams==='undefined'||!cams[i]||typeof v21Viewport!=='function')return out;const cam=cams[i];cam.updateMatrixWorld();
 fbPv37.set(x,y,z).applyMatrix4(cam.matrixWorldInverse);const behind=fbPv37.z>-0.05;fbPv37.set(x,y,z).project(cam);
 const vp=v21Viewport(i);let sx=fbPv37.x,sy=fbPv37.y;if(behind){sx=-sx;sy=-sy;}const px=(sx+1)/2*vp.w,py=(1-sy)/2*vp.h,cx=vp.w/2,cy=(vp.top+vp.h-vp.bottom)/2;
 out.px=px;out.py=py;out.inside=!behind&&px>=0&&px<=vp.w&&py>=vp.top&&py<=vp.h-vp.bottom;out.ang=Math.atan2(py-cy,px-cx);return out;}
function fbSeen37(i,x,y,z){return fbProject37(i,x,y,z).inside;}
// slide a point on the edge rectangle (fbEdge37's) along its edge until it is at least min px from 'from' (away from it, or the other way if the
// corner stops it); e is changed in place
function fbSlide37(i,e,from,min){if(Math.hypot(e[0]-from[0],e[1]-from[1])>=min)return e;const vp=v21Viewport(i),x0=Math.max(28,vp.w*0.06),x1=vp.w-x0,y0=vp.top+30,y1=Math.max(y0+20,vp.h-vp.bottom-30);
 const vert=Math.abs(e[0]-x0)<1||Math.abs(e[0]-x1)<1,a=vert?1:0,lo=vert?y0:x0,hi=vert?y1:x1,off=Math.abs(e[1-a]-from[1-a]),need=Math.sqrt(Math.max(0,min*min-off*off));
 const dir=e[a]>=from[a]?1:-1;let v=from[a]+dir*need;if(v<lo||v>hi)v=from[a]-dir*need;e[a]=fbClamp37(v,lo,hi);return e;}
// the nearest place along the edge (in 4 px steps, up to 240 px either way) at least 60 px from this view's player and 44 px from the other arrow
function fbPlace37(i,e,pt,other){const ok=(x,y)=>(!pt||Math.hypot(x-pt[0],y-pt[1])>=60)&&(!other||Math.hypot(x-other[0],y-other[1])>=44);if(ok(e[0],e[1]))return e;
 const vp=v21Viewport(i),x0=Math.max(28,vp.w*0.06),x1=vp.w-x0,y0=vp.top+30,y1=Math.max(y0+20,vp.h-vp.bottom-30),vert=Math.abs(e[0]-x0)<1||Math.abs(e[0]-x1)<1,a=vert?1:0,lo=vert?y0:x0,hi=vert?y1:x1;
 for(let k=1;k<=60;k++)for(const sg of [1,-1]){const v=e[a]+sg*4*k;if(v<lo||v>hi)continue;const q=[e[0],e[1]];q[a]=v;if(ok(q[0],q[1])){e[a]=v;return e;}}
 if(pt)fbSlide37(i,e,pt,60);return e;}
function fbEdge37(i,ang){const vp=v21Viewport(i),x0=Math.max(28,vp.w*0.06),x1=vp.w-x0,y0=vp.top+30,y1=Math.max(y0+20,vp.h-vp.bottom-30),cx=vp.w/2,cy=(y0+y1)/2,dx=Math.cos(ang),dy=Math.sin(ang);
 let t=1e9;if(dx>1e-6)t=Math.min(t,(x1-cx)/dx);if(dx<-1e-6)t=Math.min(t,(x0-cx)/dx);if(dy>1e-6)t=Math.min(t,(y1-cy)/dy);if(dy<-1e-6)t=Math.min(t,(y0-cy)/dy);return [cx+dx*t,cy+dy*t];}

/* ======================================================================================================================================
   B.6 Cameras (spec §8): the ball point in each split view (within 7 m, eased in over 0.4 s, growing at most 3 m/s relative to the player,
   never shrinking the player below the person floor: 50 px on a phone half, 70 px otherwise), the scorer in the celebration, and in free
   play after discovery a moving ball within 4 m; edge arrows to the ball and the attacked goal (transform only, two per half)
   ====================================================================================================================================== */
// the camera point's tunables: it starts easing in when the ball comes within 9 m (so it is already out there by the time the ball is within
// the 7 m that is framed), out beyond 10 m; it reaches at most 7 m from the player (4 m in free play) and moves at most 6 m/s; the camera
// distance itself moves at most 2.9% a frame while the point is used (fbCamRate37), which is what keeps the view calm
FOOTBALL37.PERSON_H=1.65;   // (v37 merge) feet to crown, for the person floor as drawn
FOOTBALL37.CAM37={on:9.0,off:10.0,reach:7.0,free:4.0,rate:6,camRate:0.029,goal:8.0,goalPhone:5.0};
const fbBox37=new THREE.Box3(),fbCen37=new THREE.Vector3(),fbTmp37=new THREE.Vector3();
const fbCube37=[[],[]];for(const a of fbCube37)for(let k=0;k<24;k++)a.push(new THREE.Vector3());
function fbFitDist37(i,pts){const vp=v21Viewport(i),c=fbBox37.setFromPoints(pts).getCenter(fbCen37),tanV=Math.tan(THREE.MathUtils.degToRad(cams[i].fov/2)),tanH=tanV*vp.w/vp.h,usableY=Math.max(.30,1-(vp.top+vp.bottom)/vp.h),usableX=.82;
 let fit=innerHeight>innerWidth?7.1:7.3;if(typeof LENS35!=='undefined'&&LENS35&&LENS35.on&&typeof LENS35.minScale==='function')fit*=LENS35.minScale();
 for(const p of pts){fbTmp37.copy(p).sub(c);const depth=fbTmp37.dot(CAM_DIR);fit=Math.max(fit,depth+Math.abs(fbTmp37.dot(v21Right))/(tanH*usableX),depth+Math.abs(fbTmp37.dot(v21Up))/(tanV*usableY));}return fit+.10;}
// (v37 merge) the person as drawn: view i's player from the feet to the crown (PERSON_H, 1.65 m) projected through a camera at the framed
// distance, placed and aimed as updateCameras places it (the centre of the points fbFitDist37 just measured, lifted for the top and bottom bars).
// It was the bench's estimate, a 1.98 m box at the distance plus 2 m, which drew a 50 px floor 39-42 px high at 844 x 390 (the merge checker)
function fbPersonPx37(i,dist){const vp=v21Viewport(i),tanV=Math.tan(THREE.MathUtils.degToRad(cams[i].fov/2)),k=-(vp.bottom-vp.top)/vp.h*dist*tanV,p=players[i].g.position,y0=players[i].y||0;
 const cx=fbCen37.x+v21Up.x*k+CAM_DIR.x*dist,cy=fbCen37.y+v21Up.y*k+CAM_DIR.y*dist,cz=fbCen37.z+v21Up.z*k+CAM_DIR.z*dist;
 const ndc=y=>{const rx=p.x-cx,ry=y-cy,rz=p.z-cz,depth=-(rx*CAM_DIR.x+ry*CAM_DIR.y+rz*CAM_DIR.z);return (rx*v21Up.x+ry*v21Up.y+rz*v21Up.z)/(Math.max(0.1,depth)*tanV);};
 return (ndc(y0+FOOTBALL37.PERSON_H)-ndc(y0))/2*vp.h;}
function fbCube8_37(arr,o,x,z,h,y0){for(let k=0;k<8;k++)arr[o+k].set(x+(k&1?h:-h),(y0||0)+(k&2?0.6:0),z+(k&4?h:-h));}
function fbCamPoints37(i,pts){const F=FOOTBALL37;if(!Array.isArray(pts)||typeof ball==='undefined'||!ball||typeof players==='undefined'||!players[i]||fbOnline37()||typeof cams==='undefined'||!cams[i])return;
 if(fbCompanion37()&&i!==0)return;const match=['setout','live','goal','restart','motor','waiting','ended'].includes(F.state),L=fbSave37();
 if(!match&&!L)return;                                                                       // before discovery nothing changes
 const st=F.cam37[i]||(F.cam37[i]={rel:[0,0],q:[0,0],s:0,on:false,t:F.t,kept:false,px:null,floor:70});const dt=fbClamp37(F.t-st.t,0,0.1);st.t=F.t;
 const p=players[i].g.position,bx=ball.position.x-p.x,bz=ball.position.z-p.z,bd=Math.hypot(bx,bz);let R=F.CAM37.reach;
 if(match){const C=F.CAM37;if(bd<=C.on)st.on=true;else if(bd>=C.off)st.on=false;}
 else{R=F.CAM37.free;const kb=F.kickBy['p'+i],kicked=kb!==undefined&&F.t-kb<=1.5;st.on=bd<=F.CAM37.free&&(Math.hypot(ball.v[0],ball.v[1])>1.0||kicked);}
 st.s=st.on?Math.min(1,st.s+dt/0.4):Math.max(0,st.s-dt/0.4);
 // the point moves at most 3 m/s towards where it should be, either relative to the player (the spec's growth cap) or in the world (so a
 // player walking away from a resting ball keeps it): whichever lands nearer; never more than 7 m (4 m in free play) from the player
 const k=bd>R?R/bd:1,tx=bx*k*st.s,tz=bz*k*st.s,lim=F.CAM37.rate*dt,step=(fx,fz,gx,gz)=>{let dx=gx-fx,dz=gz-fz;const dd=Math.hypot(dx,dz);if(dd>lim){dx*=lim/dd;dz*=lim/dd;}return [fx+dx,fz+dz];};
 const a1=step(st.rel[0],st.rel[1],tx,tz),w=st.w||[p.x+st.rel[0],p.z+st.rel[1]],w2=step(w[0],w[1],p.x+tx,p.z+tz),a2=[w2[0]-p.x,w2[1]-p.z];
 let [rx,rz]=Math.hypot(a2[0]-tx,a2[1]-tz)<Math.hypot(a1[0]-tx,a1[1]-tz)?a2:a1;const rl=Math.hypot(rx,rz);if(rl>R){rx*=R/rl;rz*=R/rl;}st.rel=[rx,rz];st.w=[p.x+rx,p.z+rz];
 const vp=v21Viewport(i),Hu=vp.h-vp.top-vp.bottom;st.floor=Hu<260?F.OWNER.phoneFloor:70;st.aim=st.floor*1.03;   // (v37 merge) aimed 3% above the floor: the camera's easing draws the person up to 1% smaller than framed
 const C=fbCube37[i],n0=pts.length;st.kept=false;st.px=null;
 if(Math.hypot(st.rel[0],st.rel[1])>0.05){fbCube8_37(C,0,p.x+st.rel[0],p.z+st.rel[1],0.3);for(let q=0;q<8;q++)pts.push(C[q]);let px=fbPersonPx37(i,fbFitDist37(i,pts));
  if(px<st.aim){let lo=0,hi=1;for(let it=0;it<7;it++){const m=(lo+hi)/2;fbCube8_37(C,0,p.x+st.rel[0]*m,p.z+st.rel[1]*m,0.3);if(fbPersonPx37(i,fbFitDist37(i,pts))>=st.aim)lo=m;else hi=m;}
   st.rel=[st.rel[0]*lo,st.rel[1]*lo];st.w=[p.x+st.rel[0],p.z+st.rel[1]];fbCube8_37(C,0,p.x+st.rel[0],p.z+st.rel[1],0.3);if(lo<0.05){pts.length=n0;st.dropped=true;}else px=fbPersonPx37(i,fbFitDist37(i,pts));}
  if(pts.length>n0){st.kept=true;st.px=px;st.dropped=false;}}
 // the celebration: the scorer joins the frame when within 7 m (eased in at the same rate)
 const gi=F.state==='goal'?F.goalInfo:null,sg=gi&&gi.celeb?fbScorerG37(gi.celeb):null;let qx=0,qz=0;   // (fixer) the celebrating player, not an own goal's scorer
 if(sg&&sg!==players[i].g){const sx=sg.position.x-p.x,sz=sg.position.z-p.z;if(Math.hypot(sx,sz)<=7){qx=sx;qz=sz;}}
 {let ex=qx-st.q[0],ez=qz-st.q[1];const ed=Math.hypot(ex,ez);if(ed>lim){ex*=lim/ed;ez*=lim/ed;}st.q=[st.q[0]+ex,st.q[1]+ez];}
 // (merger) the scorer point keeps the person floor too, as the ball point and the goal point do (it had none): drawn in only as far as the
 // player stays at the floor (70 px, 50 on a phone half), or dropped
 st.qKept=false;if(Math.hypot(st.q[0],st.q[1])>0.05){const n1=pts.length,put=m=>{const x=p.x+st.q[0]*m,z=p.z+st.q[1]*m;for(let q=0;q<8;q++)pts[n1+q]=C[8+q].set(x+(q&1?0.44:-0.44),q&2?1.98:-0.06,z+(q&4?0.36:-0.36));};
  put(1);if(fbPersonPx37(i,fbFitDist37(i,pts))<st.aim){let lo=0,hi=1;for(let it=0;it<7;it++){const m=(lo+hi)/2;put(m);if(fbPersonPx37(i,fbFitDist37(i,pts))>=st.aim)lo=m;else hi=m;}
   st.q=[st.q[0]*lo,st.q[1]*lo];if(lo<0.05)pts.length=n1;else put(1);}
  st.qKept=pts.length>n1;}
 // (fixer) in a match the goal this view's player attacks joins the frame within CAM37.goal m (eased in at the same rate), unless it would push
 // the player below the person floor
 let gx=0,gz=0;if(match&&F.state!=='ended'){const G=fbGoalOf37('a'),dx=G[0]-p.x,dz=G[1]-p.z;if(Math.hypot(dx,dz)<=(fbCompact37(i)?F.CAM37.goalPhone:F.CAM37.goal)){gx=dx;gz=dz;}}
 {const g0=st.g||(st.g=[0,0]);let ex=gx-g0[0],ez=gz-g0[1];const ed=Math.hypot(ex,ez);if(ed>lim){ex*=lim/ed;ez*=lim/ed;}st.g=[g0[0]+ex,g0[1]+ez];}
 st.goalKept=false;if(Math.hypot(st.g[0],st.g[1])>0.05){const n1=pts.length,G=fbGoalOf37('a');for(let q=0;q<8;q++)pts.push(C[16+q].set(p.x+st.g[0]+(q&1?0.3:-0.3),q&2?0.5:0,p.z+st.g[1]+(q&4?1.2:-1.2)));
  if(fbPersonPx37(i,fbFitDist37(i,pts))<st.aim)pts.length=n1;else st.goalKept=true;void G;}}
// the edge arrows: the ball (in a match, and in free play within 15 m after discovery) and, in a match, the goal being attacked
// (fixer, v37 review I2) in free play the arrow follows the camera's rule: only a ball rolling faster than 1 m/s, or kicked by this player in the
// last 1.5 s, earns it; and never while anything else is guiding: the bench in hands, the chooser, its glide or sitting on it, the evening, or
// a player in the flat
function fbFreeArrow37(i,p){const F=FOOTBALL37;if(typeof benchBusy36==='function'&&benchBusy36())return false;
 if(typeof BENCH36!=='undefined'&&BENCH36&&(BENCH36.state==='seated'||BENCH36.state==='settling'))return false;
 if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.active==='function'&&EVENING35.active())return false;
 if(typeof inFlat==='function'&&inFlat(p.x,p.z))return false;
 const kb=F.kickBy['p'+i];return Math.hypot(ball.v[0],ball.v[1])>1.0||(kb!==undefined&&F.t-kb<=1.5);}
function fbArrows37(){const F=FOOTBALL37;if(typeof document==='undefined'||!document.getElementById||typeof ball==='undefined'||!ball||typeof cams==='undefined')return;
 const match=['setout','live','goal','restart','motor','waiting','ended'].includes(F.state),L=fbSave37();
 for(const i of [0,1]){let sb=false,sg=false,ab=0,ag=0;
  if((match||L)&&fbHalfShown37(i)&&!fbOnline37()&&!(fbCompanion37()&&i!==0)&&players[i]){const p=players[i].g.position;
   if(match||(Math.hypot(ball.position.x-p.x,ball.position.z-p.z)<=15&&fbFreeArrow37(i,p))){const r=fbProject37(i,ball.position.x,F.R,ball.position.z);if(!r.inside){sb=true;ab=r.ang;}}
   if(match&&F.state!=='ended'){const G=fbGoalOf37('a'),r=fbProject37(i,G[0],0.3,G[1]);if(!r.inside){sg=true;ag=r.ang;}}}
  const deg=a=>Math.round(a*1800/Math.PI)/10;
  // (fixer, v37 review F2) where each arrow sits on the edge: never within 60 px of this view's player (slid along the edge away from them) and
  // never within 40 px of the other arrow (the goal arrow slides on by 44 px), so neither stacks on the other nor reads as a name tag
  const eb=sb?fbEdge37(i,ab):null,eg=sg?fbEdge37(i,ag):null;if(eb||eg){const q=players[i].g.position,pp=fbProject37(i,q.x,(players[i].y||0)+0.9,q.z);
   const pt=pp.inside?[pp.px,pp.py]:null;if(eb)fbPlace37(i,eb,pt,null);if(eg)fbPlace37(i,eg,pt,eb);}
  F.arrows37[i]={ball:{show:sb,ang:sb?deg(ab):null,at:eb?[Math.round(eb[0]),Math.round(eb[1])]:null},goal:{show:sg,ang:sg?deg(ag):null,at:eg?[Math.round(eg[0]),Math.round(eg[1])]:null}};
  const U=F.ui37[i];if(!sb&&!sg&&!U.aBall)continue;
  const put=(key,cls,show,ang,cap)=>{const el=fbEl37(i,key,'fb37-arrow '+cls);if(!el)return;if(!show){if(el._on37){el._on37=false;if(el.style)el.style.display='none';}return;}
   if(!el._on37){el._on37=true;el.className='fb37-arrow '+cls;el.innerHTML=`<span class="g">➜</span>${cap}`;if(el.style)el.style.display='';}
   const e=key==='aBall'?eb:eg;if(el.style)el.style.transform=`translate(${e[0].toFixed(0)}px,${e[1].toFixed(0)}px) translate(-50%,-50%)`;
   if(el.firstChild&&el.firstChild.style)el.firstChild.style.transform=`rotate(${(ang*180/Math.PI).toFixed(0)}deg)`;el._ang37=ang;};
  put('aBall','ball',sb,ab,'<span class="b"></span>');put('aGoal','goal',sg,ag,`<span class="c">${esc(F.LINES.ui.goalArrow)}</span>`);}}

/* ======================================================================================================================================
   B.7 The daily loop (spec §12, §10): the day-log kinds, the one-time waypoint, the morning line, the Today line, neighbours' lines
   ====================================================================================================================================== */
if(typeof LOG35!=='undefined'&&LOG35&&Array.isArray(LOG35.kinds))for(const k of ['ball','match','goal','fulltime'])if(!LOG35.kinds.includes(k))LOG35.kinds.push(k);
// once ever, the first time the children's window opens after discovery and before any match: a waypoint to the end of the street
function fbDailyStep37(){const F=FOOTBALL37,L=fbSave37();if(!L||L.pointed||L.played>0||typeof LIFE34==='undefined'||!LIFE34)return;
 if(fbMatchOn37()||!football37Window()||fbHumans37().some(i=>fbCentreDist37(i)<=F.SPAWN))return;
 // (fixer) another waypoint holds the marker: never over it, but the toast still says where the children are, once a day, and the waypoint waits
 if(LIFE34.waypoint){if(L.toldDay!==S.day){L.toldDay=S.day;fbToastSoon37(F.LINES.ui.waypointToast);fbEmit37('waypoint',{day:S.day,toastOnly:true});}return;}
 L.pointed=true;LIFE34.waypoint={x:F.PITCH.cx,z:F.PITCH.zc,name:F.LINES.ui.waypoint};try{if(typeof refreshMarker34==='function')refreshMarker34();}catch(e){}fbToastSoon37(F.LINES.ui.waypointToast);fbEmit37('waypoint',{day:S.day});}
function fbHHMM37(v){return fbClock37(v);}
// a time of day the way the game's top bar writes it (3:30 pm), not the 24-hour clock (fixer, C8)
function fbClock37(v){let m=Math.round(v*60);const h24=Math.floor(m/60)%24;m=m%60;const h=h24%12===0?12:h24%12;return `${h}:${String(m).padStart(2,'0')} ${h24<12?'am':'pm'}`;}
function fbTodayLine37(L){const F=FOOTBALL37,T=F.LINES.ui.today,l=L&&L.last;if(!l||!(l.day===S.day||l.day===S.day-1))return '';const v={when:l.day===S.day?T.today:T.yesterday,a:l.a,b:l.b};
 return fbFill37(l.result==='won'?(l.last?T.wonLast:T.won):l.result==='lost'?(l.last?T.lostLast:T.lost):T.unfinished,v);}
function fbTodayAdd37(h){const F=FOOTBALL37,L=fbSave37();if(!L||typeof h!=='string'||fbOnline37())return h;
// (fixer, v37 review F5) a small card of its own, never spliced into another morning card; once today's game is played (or the children are
 // called in, or their hours are over) it goes, and Today's result line says what happened
 const hrs=fbHours37(S.day);if(F.OWNER.children&&(S.day>=2||football37Flags().on)&&!fbPlayedToday37()&&!fbHomeToday37()&&S.time<hrs[1]){const line=`<p class="small fb37-morning">${esc(football37Flags().on?F.LINES.ui.morningFlag:fbFill37(F.LINES.ui.morning,{h:fbHHMM37(hrs[0])}))}</p>`;
  h=h.replace('<div class="life-chips34">',`<div class="life-note34 fb37-morning-card">${line}</div><div class="life-chips34">`);}
 const t=fbTodayLine37(L);if(t)h=h.replace('<div class="life-chips34">',`<p class="small fb37-today">${esc(t)}</p><div class="life-chips34">`);return h;}
function fbNeighbourLine37(who){const F=FOOTBALL37,L=fbSave37(),T=F.LINES.neighbours[who];if(!T||!L||!L.last||fbOnline37())return null;if(!(L.last.day===S.day||L.last.day===S.day-1))return null;
 if(who==='bassey'){if(L.said&&L.said.day===S.day&&L.said.who.includes('bassey'))return null;}
 else{const u=S.life&&S.life.lines35&&S.life.lines35.day===S.day&&S.life.lines35.used&&S.life.lines35.used[who];if(Array.isArray(u)&&u.some(id=>String(id).startsWith('fb37-')))return null;}
 let col=L.last.result==='won'?'won':L.last.result==='lost'?'lost':'other';if(col==='other'&&!L.last.called&&T.otherUncalled)col='otherUncalled';return {id:`fb37-${who}-${col}`,text:T[col]};}

/* ======================================================================================================================================
   A.13 Passing traffic (spec §4.5): walkers handed off out of view or walking out, the keep-out while the posts are out, the keke
   turning early except for the one "Motor!" lap
   ====================================================================================================================================== */
function fbInKeep37(x,z){return fbInRect37(x,z,FOOTBALL37.KEEP);}
// is a world point inside any human view's usable rectangle (grown by 10%)? the same projection the cameras draw with
function fbInAnyView37(x,y,z){if(typeof cams==='undefined'||typeof v21Viewport!=='function')return true;const v=fbV37;
 for(const i of fbHumans37()){const cam=cams[i];if(!cam)continue;cam.updateMatrixWorld();v.set(x,y,z).project(cam);if(v.z<-1||v.z>1)continue;
  const vp=v21Viewport(i),px=(v.x+1)/2*vp.w,py=(1-v.y)/2*vp.h,gx=vp.w*0.05,gy=(vp.h-vp.top-vp.bottom)*0.05;
  if(px>=-gx&&px<=vp.w+gx&&py>=vp.top-gy&&py<=vp.h-vp.bottom+gy)return true;}
 return false;}
const fbV37=new THREE.Vector3();
// where a walker's route leaves KEEP towards its outside end: [point 0.8 m beyond the edge, the index of that end] or null
function fbRouteExit37(w){const K=FOOTBALL37.KEEP,r=w.r;if(!r||r.length<2)return null;let end=-1;for(let k=0;k<r.length;k++)if(!fbInKeep37(r[k][0],r[k][1])){end=k;break;}if(end<0)return null;
 const p=[w.g.position.x,w.g.position.z],q=r[end],dx=q[0]-p[0],dz=q[1]-p[1],L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L;
 let tE=L;
 const ts=[];if(ux>1e-9)ts.push((K.x2-p[0])/ux);if(ux<-1e-9)ts.push((K.x1-p[0])/ux);if(uz>1e-9)ts.push((K.z2-p[1])/uz);if(uz<-1e-9)ts.push((K.z1-p[1])/uz);
 for(const t of ts)if(t>=0&&t<tE)tE=t;const t2=Math.min(L,tE+0.8);return {pt:[p[0]+ux*t2,p[1]+uz*t2],end};}
// at set-out: each walker inside KEEP is moved off-view at once, or (if a human view sees it) turned to walk out; the keke turns east
function fbSetupTraffic37(){const F=FOOTBALL37;F.handoffs=[];if(typeof walkers==='undefined')return;
 walkers.forEach((w,k)=>{if(!w.g||!w.g.visible)return;const x=w.g.position.x,z=w.g.position.z;if(!fbInKeep37(x,z))return;const ex=fbRouteExit37(w);if(!ex)return;
  const seen=fbInAnyView37(x,1.0,z);
  if(!seen){w.g.position.x=ex.pt[0];w.g.position.z=ex.pt[1];w.i=ex.end;F.handoffs.push({k,from:[r3_37(x),r3_37(z)],to:[r3_37(ex.pt[0]),r3_37(ex.pt[1])],seen:false});}
  else{w.i=ex.end;F.handoffs.push({k,from:[r3_37(x),r3_37(z)],to:null,seen:true});}});
 if(typeof keke!=='undefined'&&keke&&fbInKeep37(keke.position.x,keke.position.z)&&keke.dir<0){keke.dir=1;keke.rotation.y=0;}}
function fbTrafficCount37(){let n=0;if(typeof walkers!=='undefined')for(const w of walkers)if(w.g&&w.g.visible&&fbInKeep37(w.g.position.x,w.g.position.z))n++;
 if(typeof keke!=='undefined'&&keke&&!FOOTBALL37.kekeThrough&&fbInKeep37(keke.position.x,keke.position.z))n++;return n;}
if(typeof updateAmbient==='function'){const prevAmbient37=updateAmbient;updateAmbient=function(dt){ // v37: walkers keep off the pitch while the posts are out; the keke turns early but for one lap
 const F=FOOTBALL37;if(!fbPostsOut37()){F.trafficInside=0;return prevAmbient37.apply(this,arguments);}
 const t=Math.max(0,+dt||0);
 if(typeof walkers!=='undefined')for(const w of walkers){const g=w.g,q=w.r&&w.r[w.i];if(!g||!q||!g.visible)continue;const x=g.position.x,z=g.position.z;if(fbInKeep37(x,z))continue;
  const dx=q[0]-x,dz=q[1]-z,d=Math.hypot(dx,dz);if(d<1e-6)continue;const f=Math.min(1,(w.sp*t+0.05)/d);if(fbInKeep37(x+dx*f,z+dz*f))w.i=(w.i+w.r.length-1)%w.r.length;}
 const kk=typeof keke!=='undefined'&&keke?keke:null,kx0=kk?kk.position.x:0,kd0=kk?kk.dir:0,kr0=kk?kk.rotation.y:0;
 const r=prevAmbient37.apply(this,arguments);
 // (fixer, v37 review I6) under an open panel the match is paused, and so is the keke while the posts are out: it never drives through the
 // frozen children, and its one "Motor!" lap waits for the players
 if(kk&&typeof overlayOpen==='function'&&overlayOpen()){kk.position.x=kx0;kk.dir=kd0;kk.rotation.y=kr0;}
 if(kk){const x=kk.position.x;
  if(F.state==='live'&&!F.kekeDone&&!F.kekeThrough&&!F.lastGoal&&F.playT>=F.kekeAt&&F.kekeAt>0&&kk.dir<0&&kx0>F.KEKE.warnX&&x<=F.KEKE.warnX)fbMotor37();
  if(F.kekeThrough){if(kk.dir>0&&kx0<F.KEKE.outX&&x>=F.KEKE.outX&&F.state==='motor')fbMotorEnd37();}
  else if(kk.dir<0&&x<F.KEKE.turnX){kk.position.x=F.KEKE.turnX;kk.dir=1;kk.rotation.y=0;fbEmit37('keketurn',{x:r3_37(F.KEKE.turnX)});}}
 F.trafficInside=fbTrafficCount37();return r;};}
// residents walking their schedules wait at the edge of KEEP while the posts are out (Mr Bassey is exempt when B brings him on)
FOOTBALL37.npcExempt=[];
if(typeof updateNPCWalk==='function'){const prevNPCWalk37=updateNPCWalk;updateNPCWalk=function(dt){ // v37: residents wait at the edge of the pitch while the posts are out
 const F=FOOTBALL37;if(!fbPostsOut37()||typeof npcs==='undefined')return prevNPCWalk37.apply(this,arguments);const t=Math.max(0,+dt||0),held=[];
 for(const k in npcs){if(F.npcExempt.includes(k))continue;const n=npcs[k],q=n.route&&n.route[n.ri];if(!q||!n.g.visible)continue;const x=n.g.position.x,z=n.g.position.z;if(fbInKeep37(x,z))continue;
  const dx=q[0]-x,dz=q[1]-z,d=Math.hypot(dx,dz);if(d<1e-6)continue;const f=Math.min(1,(1.7*t+0.05)/d);if(fbInKeep37(x+dx*f,z+dz*f)){held.push([n,n.route]);n.route=null;}}
 const r=prevNPCWalk37.apply(this,arguments);for(const [n,rt] of held){n.route=rt;n.t=(n.t||0)+t;if(typeof animAvatar==='function')animAvatar(n.g,n.t,false,false,0,t);}return r;};}

/* ======================================================================================================================================
   A.14 Hotspots and Act (spec §3.4, §3.5, §5.3): one HOTSPOT_HOOKS entry and one ACT_HOOKS entry
   ====================================================================================================================================== */
function fbKickEligible37(i){const p=players[i];if(!p||fbGuest37())return false;if(typeof overlayOpen==='function'&&overlayOpen())return false;
 const P=fbPerson37(fbOnline37()?'p'+NET.myIndex:'p'+i)||fbPersonOf37(p,'p'+i,i,'human','a',PR,0);return !fbBarred37(P);}
function football37Hot(i,list,d){const F=FOOTBALL37,U=F.LINES.ui;if(!S||S.phase!=='play'||typeof ball==='undefined'||!ball||!players[i])return null;if(fbGuest37())return null;
 if(fbOnline37()&&i!==NET.myIndex)return null;
 const p=players[i],px=p.g.position.x,pz=p.g.position.z,bd=Math.hypot(ball.position.x-px,ball.position.z-pz),st=F.state;
 if(charge37[i])return {id:'kick37',label:fbChargeLabel37(i),dist:0};
 const reach=F.REACH+(typeof hotspotCache!=='undefined'&&hotspotCache[i]&&hotspotCache[i].id==='kick37'?F.PRESS_SLACK:0);   // (fixer) the Kick prompt holds 0.2 m longer than it appears, as the press does
 // in a match, for a human on the pitch (grown by 1 m), the match hook wins outright
 if(['setout','live','restart','motor','goal','waiting'].includes(st)&&fbInRect37(px,pz,F.PITCH,1.0)){
  if(st==='motor'&&(ball.held||ball.motor))return {id:'none37',label:U.motor,dist:0};
  if(st==='setout'&&F.setout&&F.setout.cairns&&F.trafficInside>0)return {id:'none37',label:U.road,dist:0};
  if((st==='live'||st==='restart')&&bd<=reach&&!ball.held&&!ball.motor&&st==='live'&&fbKickEligible37(i))return {id:'kick37',label:U.kick,dist:0};
  const O=F.owner;if(O&&O.team==='a'&&O.key!=='p'+i&&st==='live')return {id:'call37',label:U.call,dist:0};
  return {id:'none37',label:'',dist:0};}
 if(!list)return null;
 // free play: an honest-distance entry beside the ball
 if(bd<=reach&&fbKickEligible37(i)&&!ball.held&&!ball.fade&&!ball.glide)list.push({id:'kick37',label:U.kick,dist:bd});
 // the children, in idle and after a match: play, another game, wait for the other player, or the late line
 const K=F.kids;if(K&&(st==='idle'||st==='ended')&&!fbOnline37()){let kd=1e9;for(const k in K){const c=K[k];if(c.gone||c.mode==='leave'||c.mode==='fadeout')continue;kd=Math.min(kd,Math.hypot(c.pos[0]-px,c.pos[1]-pz));}
  if(kd<=1.8){const cs=football37CanStart(i);let e=null;
   if(S.time>=F.HOURS.lastStart)e={id:'late37',label:fbLateLine37()};
   else if(cs.ok)e={id:fbPlayedToday37()?'again37':'play37',label:fbPlayedToday37()?U.again:U.play};
   else if(cs.why==='wait')e={id:'wait37',label:fbFill37(U.wait,{name:fbName37(cs.other)})};
   else if(cs.msg)e={id:fbPlayedToday37()?'again37':'play37',label:fbPlayedToday37()?U.again:U.play};
   if(e){e.dist=kd-0.4;list.push(e);}}}
 return null;}
HOTSPOT_HOOKS.push(football37Hot);
// (fixer, v37 review F4) beside the suya stand a ball within the press's reach is what Act is for: the stand's entry (which the base adds after
// every hook, at up to 1.6 m) gives way to the kick when the ball is within REACH + PRESS_SLACK, and to nothing (no prompt, no purchase) when the
// ball is nearer than the stand point and within 1.6 m. The prompt is redrawn on the frame the kick entry comes or goes (fbHudStep37).
function fbNearest37(i,r){if(!r||r.id!=='suya'||typeof ball==='undefined'||!ball||!players[i]||ball.held||ball.fade||ball.glide||!fbKickEligible37(i))return r;
 const F=FOOTBALL37,p=players[i].g.position,bd=Math.hypot(ball.position.x-p.x,ball.position.z-p.z);
 if(bd<=F.REACH+F.PRESS_SLACK)return {id:'kick37',label:F.LINES.ui.kick,dist:bd};if(bd<=F.RELEASE_REACH&&bd<(r.dist||0))return {id:'none37',label:'',dist:bd};return r;}
if(typeof nearest==='function'){const prevNearest37=nearest;nearest=function(i){const r=prevNearest37.apply(this,arguments);try{return fbNearest37(i,r);}catch(e){return r;}};}
function football37Act(i,kind){const F=FOOTBALL37;if(!/37$/.test(kind))return false;
 if(kind==='kick37'){football37Press(i);return true;}
 if(kind==='call37'){football37Call(i);return true;}
 if(kind==='none37')return true;
 if(kind==='play37'||kind==='again37'){if(F.state==='ended')fbClearNow37();const cs=football37CanStart(i);if(cs.ok)football37Start();else if(cs.msg)fbToast37(cs.msg);return true;}
 if(kind==='wait37'){return true;}
 if(kind==='late37'){fbShout37('kemi',fbLateLine37());return true;}
 return true;}
ACT_HOOKS.push(function(i,kind){return football37Act(i,kind);});
// a rematch pressed during the summary skips the clearing animation
function fbClearNow37(){const F=FOOTBALL37;fbPitchClear37();F.clearing=null;fbKidsToIdle37();fbSetState37('idle','again');}
// "Release!": the companion passes; the other human gets a chip in their half (spec §3.5)
function football37Call(i){const F=FOOTBALL37;if(F.t-(F.callT[i]||-9)<1.5)return false;F.callT[i]=F.t;F.call={who:i,t:F.t,delay:F.rng.range(0.3,0.6)};if(F.stats)F.stats.calls++;
 try{if(typeof showBubble==='function'&&players[i]&&!(typeof silentMode==='function'&&silentMode()))fbBubble37('fb37:call:'+i,F.LINES.ui.release,players[i].g,2.0,1200,1.4);}catch(e){}
 fbEmit37('call',{who:'p'+i,owner:F.owner?F.owner.key:null});return true;}

/* ======================================================================================================================================
   A.15 The per-frame step and the wrappers (spec §1.4, §1.5)
   ====================================================================================================================================== */
function fbGuards37(){const F=FOOTBALL37;
 if(fbOnline37()||S.phase!=='play'){if(fbMatchOn37())football37Stop(fbOnline37()?'online':'phase',true);else if(F.kids){fbKidsRemove37();fbSetState37('off','away');}return;}
 if(fbPartyOn37()&&(fbMatchOn37()||F.kids)){if(fbMatchOn37())football37Stop('party',true);else{fbKidsRemove37();fbSetState37('off','party');}}
 // (fixer, v37 review I1) the two never run at once: a pair who walk off a match and lift the open bench delivery end the match there and then
 if(fbMatchOn37()&&F.state!=='clearing'&&typeof benchBusy36==='function'&&benchBusy36())football37Stop('bench',false);}
// a human inside a cairn after moving is put back out to contact, if that point is free (one blocked() call per contact frame)
function fbPushOutPosts37(){const F=FOOTBALL37;if(!F.mesh.cairns.length)return;for(const P of F.persons){if(P.kind!=='human'&&P.kind!=='companion')continue;const p=P.p;if(!p)continue;
 for(const c of F.mesh.cairns){if(!c.placed||c.clearT!==undefined)continue;const dx=p.g.position.x-c.pos[0],dz=p.g.position.z-c.pos[1],d=Math.hypot(dx,dz),m=F.PITCH.postR+PR;
  if(d<m&&d>1e-6){const nx=c.pos[0]+dx/d*m,nz=c.pos[1]+dz/d*m;F.cost.blocked++;if(!blocked(nx,nz,PR)){p.g.position.x=nx;p.g.position.z=nz;P.pos=[nx,nz];}}}}}
// the module's own clock advances in whole steps of 1/65536 s (within 0.02% of the frame time), so every difference of two of its times is
// exact and a match plays the same whatever the clock read when it began
function fbTick37(dt){return Math.round(Math.max(0,+dt||0)*65536)/65536;}
function football37Step(dt){const F=FOOTBALL37;if(typeof ball==='undefined'||!ball||!S||!S.p)return;F.t+=fbTick37(dt);F.cost.steps++;
 if(fbGuest37()){ball.position.y=F.R;fbShadow37();return;}                            // a guest only shows the host's ball
 fbGuards37();fbWatch37();fbCompanionHandoff37();fbRefresh37(dt);fbInputs37();fbPushOutPosts37();
 fbMatchStep37(dt);fbKidsStep37(dt);fbBasseyStep37(dt);
 football37Ball(dt);fbPitchAnim37(dt);fbShadow37();
 fbDribbleWatch37();fbLinesStep37();fbRingsStep37();fbCelebStep37();fbFxStep37(dt);fbDailyStep37();fbToastStep37();
 if(F.trace)F.trace.onStep(dt);
 fbHudStep37();}
// v37: the football step; the base shove is skipped (ball hidden from the earlier chain), the bench step still runs
const prevBall37=updateBall;updateBall=function(dt){
 const b=ball;ball=null;let r;try{r=prevBall37.apply(this,arguments);}finally{ball=b;}
 football37Step(dt);return r;};
// v37: the new ball's look, a buried or lost ball on load, and no match or children across a world change
const prevEnter37=enterWorld;enterWorld=function(){football37Stop('world',true);for(const [m,e] of fbFade37.map){if(e.orig){m.material.dispose();m.material=e.orig;}}fbFade37.map.clear();fbFade37.list=null;if(FOOTBALL37.kids){fbKidsRemove37();FOOTBALL37.state='off';}
 const r=prevEnter37.apply(this,arguments);
 try{fbLook37();const F=FOOTBALL37,W=typeof WORLD!=='undefined'?WORLD:{x1:-31,x2:31,z1:-24,z2:16},x=ball.position.x,z=ball.position.z;
  if(!(isFinite(x)&&isFinite(z))||x<W.x1||x>W.x2||z<W.z1||z>W.z2){ball.position.x=F.HOME[0];ball.position.z=F.HOME[1];}
  fbShadow37();fbOwnerReset37();fbBuriedCheck37('load');}catch(e){if(typeof console!=='undefined')console.warn('football37 load',e);}
 return r;};
function fbOwnerReset37(){const F=FOOTBALL37;F.owner=null;F.lastTouch=null;F.lastPlay=null;F.kickBy={};F.chT={};F.noQualifyUntil=0;fbCancel37();F.watchArmed=false;for(const k in fbLast37)delete fbLast37[k];}
// v37: once football is discovered, the ball's resting place is saved (an existing key, read by the base on load); a match never is
const prevSave37=save;save=function(){try{if(!fbOnline37()&&fbSave37()&&ball&&S){const b=ball.fade?ball.fade.to:[ball.position.x,ball.position.z];S.ball=[r3_37(b[0]),r3_37(b[1])];}}catch(e){}return prevSave37.apply(this,arguments);};
// v37: the football record stays on this device
const prevStrip37=stripState;stripState=function(){const o=prevStrip37.apply(this,arguments);if(o&&o.life&&o.life.football37)delete o.life.football37;return o;};
// v37: a charging player walks at 0.55 (aiming is turning while holding); in a match a human with the ball at 0.85
const prevInput37=inputVec;inputVec=function(i){const v=prevInput37.apply(this,arguments);const F=FOOTBALL37;if(!Array.isArray(v))return v;
 const me=fbCompanion37()?0:i;let k=1;if(charge37[me]&&(!fbCompanion37()||i===0))k=F.CHARGE_WALK;else if(fbMatchOn37()&&F.owner&&F.owner.key==='p'+i)k=F.OWNER_WALK;
 return k===1?v:[v[0]*k,v[1]*k];};
// v37: a third speed while the ball is in play (owner decision 7)
if(typeof advanceClock33==='function'){const prevClock37=advanceClock33;advanceClock33=function(h){ // v37: the clock runs slower during play
 const s=FOOTBALL37.state;return prevClock37.call(this,(s==='live'||s==='goal'||s==='restart'||s==='motor')?h*FOOTBALL37.OWNER.clockSlow:h);};}
// v37: a panel cancels every charge, so nothing kicks on close; after discovery the controls card tells the new controls
const prevPanel37=openPanel;openPanel=function(html){fbCancel37();if(typeof html==='string'&&fbSave37()&&html.includes('kick the ball on the sand by walking into it'))
 html=html.replace('kick the ball on the sand by walking into it',FOOTBALL37.LINES.ui.controls);return prevPanel37.call(this,html);};
// v37: the kick swing after the mixer; the children's heads at 1.06; the walk a quarter quicker above 3 m/s in a match
const prevAnim37=animAvatar;animAvatar=function(g,t,moving,carrying,speed,dt){const F=FOOTBALL37,fast=!!(g&&g.userData&&moving&&speed>3.0&&(g.userData.kid37||fbMatchOn37()));
 const r=fast?prevAnim37.call(this,g,t,moving,carrying,speed*1.25,dt):prevAnim37.apply(this,arguments);if(!g||!g.userData)return r;   // (fixer) the speed-up reaches the mixer
 const kid=g.userData.kid37;if(kid&&g.hero&&g.hero.bones&&g.hero.bones.head)g.hero.bones.head.scale.setScalar(F.KIDS[kid].head);
 const sw=g.userData.swing37;if(sw&&g.hero&&g.hero.bones){const e=F.t-sw.t0;if(e<0||e>0.28){g.userData.swing37=null;}else{const B=g.hero.bones,ease=u=>u*u*(3-2*u);let up,lo;
   if(e<0.10){const u=ease(e/0.10);up=-25*u;lo=30*u;}else if(e<0.18){const u=ease((e-0.10)/0.08);up=-25+80*u;lo=30*(1-u);}else{const u=ease((e-0.18)/0.10);up=55*(1-u);lo=0;}
   if(B.rightupleg)B.rightupleg.rotateX(-up*sw.amp*D2R37);if(B.rightleg)B.rightleg.rotateX(lo*sw.amp*D2R37);}}
 return r;};
// v37: the companion plays for the household in a match (stop 0.05 so it walks onto a resting ball)
if(typeof aiGoal==='function'){const prevAiGoal37=aiGoal;aiGoal=function(p,dt){const F=FOOTBALL37;if(fbCompanion37()&&p&&p.i===AI.i&&fbMatchOn37()&&F.state!=='ended'&&F.state!=='clearing'){const g=fbCompanionGoal37(p,dt);if(g)return g;}return prevAiGoal37.apply(this,arguments);};}
// v37: in a match the companion with the ball moves at 0.85 of its pace, as a human dribbler does (aiDrive's own pace is fixed)
if(typeof aiDrive==='function'){const prevDrive37=aiDrive;aiDrive=function(p,dt){const r=prevDrive37.apply(this,arguments);try{const F=FOOTBALL37;
 if(p&&fbCompanion37()&&p.i===AI.i&&fbPlaying37()&&F.owner&&F.owner.key==='ai'&&p.prev){const x=p.prev[0]+(p.g.position.x-p.prev[0])*F.OWNER_WALK,z=p.prev[1]+(p.g.position.z-p.prev[1])*F.OWNER_WALK;p.g.position.x=x;p.g.position.z=z;}}catch(e){}return r;};}
// v37: a buried ball escapes after the furniture changes
if(typeof rebuildFurniture==='function'){const prevFurn37=rebuildFurniture;rebuildFurniture=function(){const r=prevFurn37.apply(this,arguments);try{if(ball&&ball.userData&&ball.userData.football37)fbBuriedCheck37('furniture');}catch(e){}return r;};}
// v37: the evening waits for a match (it retries on its own)
if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.start==='function'){const prevEvening37=EVENING35.start;EVENING35.start=function(){
 if(['setout','live','goal','restart','motor','waiting','ended'].includes(FOOTBALL37.state))return false;return prevEvening37.apply(this,arguments);};}
// v37 (fixer, review I5): nor does its "Head home" nudge come during a match (the step's idle checks wait; the nudge comes once it is over).
// eveningTick35 calls EVENING35.tick by property, so the wrap is seen; the tick caps its own wall-clock gap at 1 s, so the skipped calls cost nothing
if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.tick==='function'){const prevEveTick37=EVENING35.tick;EVENING35.tick=function(dt){
 if(EVENING35.state==='idle'&&['setout','live','goal','restart','motor','waiting','ended'].includes(FOOTBALL37.state))return;return prevEveTick37.apply(this,arguments);};}
// v37: a day change or a new household stops a match cleanly first (and the children go). Going online (nethost, netjoin) is caught by the
// step's guard on the next frame instead: verify-tune-v35 reads ACTIONS.nethost's own source, so it is left unwrapped.
// (fixer, v37 review I9) not at the presses that only ask first ("Start over?", and Sleep's "Sleep anyway?" on an evening day): the match
// stops when the day really ends (endDay, the night card) or the new household really starts
for(const n of ['nextday','newgame']){const prev=typeof ACTIONS!=='undefined'?ACTIONS[n]:null;if(typeof prev!=='function')continue;
 ACTIONS[n]=function(){try{football37Stop(n,true);if(n==='newgame'){FOOTBALL37.homeDay=0;FOOTBALL37.lastMatchDay=0;}}catch(e){}return prev.apply(this,arguments);};}
if(typeof endDay==='function'){const prevEndDay37=endDay;endDay=function(){try{football37Stop('sleep',true);}catch(e){}return prevEndDay37.apply(this,arguments);};}
// v37: no bench delivery starts during a match
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.bench36Start==='function'){const prevBenchStart37=ACTIONS.bench36Start;ACTIONS.bench36Start=function(){
 if(fbMatchOn37()&&FOOTBALL37.state!=='clearing'){try{closePanel();}catch(e){}fbToast37(FOOTBALL37.LINES.toasts.finishGame);return;}return prevBenchStart37.apply(this,arguments);};}
// v37: nor does carrying it again from the Menu (fixer)
if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.bench36Again==='function'){const prevBenchAgain37=ACTIONS.bench36Again;ACTIONS.bench36Again=function(){
 if(fbMatchOn37()&&FOOTBALL37.state!=='clearing'){try{closePanel();}catch(e){}fbToast37(FOOTBALL37.LINES.toasts.finishGame);return;}return prevBenchAgain37.apply(this,arguments);};}
// v37 (merger): nor does the bench's companion switch, either way ("Play this with two players on this device" from the Menu or Tasks, "Back to my
// companion"): the companion stays the companion, or the second player stays a player, until the match is over
for(const n of ['bench36Duo','bench36Solo']){const prev=typeof ACTIONS!=='undefined'?ACTIONS[n]:null;if(typeof prev!=='function')continue;
 ACTIONS[n]=function(){if(fbMatchOn37()&&FOOTBALL37.state!=='clearing'){try{closePanel();}catch(e){}fbToast37(FOOTBALL37.LINES.toasts.finishGame);return;}return prev.apply(this,arguments);};}
// v37 (merge): and standing up from the placed bench, which hands the controls back by calling benchSolo36 itself (benchStoodUp36), past the
// Menu's refusal: during a match the switch back waits, and happens on its own once the match is over (the clearing, or a stop)
if(typeof benchSolo36==='function'){const prevBenchSolo37=benchSolo36;
 benchSolo36=function(){if(fbMatchOn37()&&FOOTBALL37.state!=='clearing'){FOOTBALL37.soloLater37=true;return false;}return prevBenchSolo37.apply(this,arguments);};
 football37On('state',e=>{const F=FOOTBALL37;if(!F.soloLater37||!['clearing','idle','off'].includes(e.to))return;F.soloLater37=false;
  const L=typeof benchSave36==='function'?benchSave36():null;if(L&&L.duo&&!(typeof benchBusy36==='function'&&benchBusy36()))benchSolo36();});}   // (fixer, I4) whatever the bench's state (after "Leave the bench for now" it is off), unless it is in hands
// (fixer, v37 review F1) sitting on Ada's bench: "Sit until 3:00 pm" when the children come out later today (after discovery, before today's game)
if(typeof BENCH36!=='undefined'&&BENCH36&&Array.isArray(BENCH36.restOffers))BENCH36.restOffers.push(function(){const F=FOOTBALL37,L=fbSave37();
 if(!L||!F.OWNER.children||fbOnline37()||fbPlayedToday37()||fbHomeToday37()||!(S.day>=2||football37Flags().on))return null;const h=fbHours37(S.day)[0];if(!(S.time<h))return null;
 return {label:fbFill37(F.LINES.ui.benchWait,{h:fbClock37(h)}),t:h,sub:F.LINES.ui.benchWaitSub};});
// the Menu: the ball reset and the stop button, after discovery (B words the card)
if(typeof ACTIONS!=='undefined'){ACTIONS.football37BallHome=function(){try{closePanel();}catch(e){}if(!football37BallHome())fbToast37(FOOTBALL37.LINES.toasts.finishGame);};
 ACTIONS.football37Stop=function(){try{closePanel();}catch(e){}football37Stop('menu',false);};
 ACTIONS.football37Runs=function(){const L=fbSave37(),runs=(L&&L.runs)||[];openPanel(`<h2>Football runs</h2>${runs.length?'<ol class="small">'+runs.map(r=>`<li>${Math.floor(r.dur/60)}:${String(r.dur%60).padStart(2,'0')}, ${r.a}–${r.b}${r.last?', last goal':''}; kicks ${r.kicks.p0}/${r.kicks.p1}, passes ${r.passes.p0}/${r.passes.p1}, calls ${r.calls}, outs ${r.outs}${r.motor?', motor':''}${r.streetCall?', street call':''}</li>`).join('')+'</ol>':'<p class="small">No matches yet.</p>'}${btn('Close','close',{},'block')}`);};}
function fbMenuHTML37(){const F=FOOTBALL37,L=fbSave37(),U=F.LINES.ui;if(!L)return '';if(fbOnline37())return `<div class="card small fb37-menu">${esc(U.menuOnline)}${NET.isHost?`<div class="actions">${btn(U.menuHome,'football37BallHome',{},'quiet')}</div>`:''}</div>`;
 const H=F.HOURS,hh=fbClock37;
 let h=`<div class="card small fb37-menu"><b>${esc(U.menuTitle)}</b> ${esc(U.menuWhat)} ${F.OWNER.children?esc(fbFill37(U.menuWhen,{wd0:hh(H.weekday[0]),wd1:hh(H.weekday[1]),sat:hh(H.sat[0]),sun:hh(F.OWNER.sundayFrom)}))+' ':''}${esc(U.menuHow)} ${esc(fbFill37(U.menuRecord,{played:L.played,won:L.won,square:L.square||0}))}`;
 h+=`<div class="actions">${fbMatchOn37()?btn(U.menuStop,'football37Stop',{},'quiet'):btn(U.menuHome,'football37BallHome',{},'quiet')}${L.playtest?btn(U.menuRuns,'football37Runs',{},'quiet'):''}</div></div>`;return h;}
// (fixer, v37 review I8) while a match is on, the bench buttons football would refuse (or that would hand the controls back mid-match) are not
// offered: the first one becomes the plain line "Finish the game first.", the others go
const FB_BENCHBTN37=/<button[^>]*data-act="(?:bench36Start|bench36Again|bench36Duo|bench36Solo|bench36Leave|bench36Cancel)"[^>]*>[\s\S]*?<\/button>/g;
function fbBenchButtons37(h){if(typeof h!=='string'||!fbMatchOn37()||FOOTBALL37.state==='clearing')return h;let n=0;
 return h.replace(FB_BENCHBTN37,()=>n++?'':`<p class="small fb37-later">${esc(FOOTBALL37.LINES.toasts.finishGame)}</p>`);}
if(typeof openMenu==='function'){const prevMenu37=openMenu;openMenu=function(){const r=prevMenu37.apply(this,arguments);try{if(typeof silentMode==='function'&&silentMode())return r;
 if(typeof panel!=='undefined'&&panel&&typeof panel.innerHTML==='string'){const b=fbBenchButtons37(panel.innerHTML);if(b!==panel.innerHTML)panel.innerHTML=b;}const h=fbMenuHTML37();
 if(h&&typeof panel!=='undefined'&&typeof panel.innerHTML==='string'){const at=panel.innerHTML.indexOf('<div class="card small"><b>Where things are.');if(at>=0)panel.innerHTML=panel.innerHTML.slice(0,at)+h+panel.innerHTML.slice(at);else panel.innerHTML+=h;}}catch(e){}return r;};}
// the touch Act buttons: the base listens only for pointerdown (and calls stopPropagation, not stopImmediatePropagation), so the hold is tracked here
function fbTouchSetup37(){if(typeof document==='undefined'||!document.getElementById)return;for(const [id,i] of [['actl',0],['actr',1]]){const b=document.getElementById(id);if(!b||!b.addEventListener||b.fb37)continue;b.fb37=true;
 b.addEventListener('pointerdown',()=>{touchHeld37[i]=true;});const up=()=>{touchHeld37[i]=false;};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);}}
fbTouchSetup37();
// a lost focus (another window) clears the Act keys and every charge: a hold never outlives a missed keyup
// (fixer, v37 review I10) and so does a hidden page (a phone's app switch hides the page without blurring the window); the charge itself is
// cancelled here, so keys another listener has already cleared (the bench's) are never read as a release on the next frame
function fbLetGo37(){try{for(const k of ['e','enter','/','shift'])if(typeof keys!=='undefined')keys[k]=false;touchHeld37[0]=touchHeld37[1]=false;fbCancel37();}catch(e){}}
function fbVis37(){if(typeof document!=='undefined'&&(document.hidden||document.visibilityState==='hidden'))fbLetGo37();}
FOOTBALL37.listeners=[['window','blur',fbLetGo37],['document','visibilitychange',fbVis37]];
for(const [tg,t,f] of FOOTBALL37.listeners){const T=tg==='document'?(typeof document!=='undefined'?document:null):(typeof window!=='undefined'?window:null);if(T&&T.addEventListener)T.addEventListener(t,f);}

/* ======================================================================================================================================
   B.8 Engineer B's wrappers (each calls the earlier function; each one-line comment says what it changes)
   ====================================================================================================================================== */
// v37: in a match or a charge the prompt is read live and the role line says "Monkey post · Green"
const prevHUD37=updateHUD;updateHUD=function(){const r=prevHUD37.apply(this,arguments);try{fbPrompts37();}catch(e){}return r;};
// v37: the ball point (and the scorer in a celebration) joins each split view's camera fit; outermost, after the bench's
const prevPoints37=v21InteractionPoints;v21InteractionPoints=function(i,joint){const pts=prevPoints37.apply(this,arguments);try{fbCamPoints37(i,pts);}catch(e){}return pts;};
// v37: the edge arrows to the ball and the goal, and Mr Bassey turned towards the play, after the cameras have moved
const prevCams37=updateCameras;updateCameras=function(dt){const pre=typeof v21Dist!=='undefined'?[v21Dist[0],v21Dist[1]]:null;const r=prevCams37.apply(this,arguments);try{fbCamRate37(pre);fbArrows37();fbBasseyFace37();}catch(e){}return r;};
// while the ball point is in a view's fit, its camera distance moves at most 2.9% a frame (spec §8's 3% limit, held at the camera itself)
function fbCamRate37(pre){const F=FOOTBALL37;if(!pre||typeof cams==='undefined'||typeof focus==='undefined'||typeof camPosS==='undefined')return;
 for(const i of [0,1]){const st=F.cam37[i];if(!st)continue;if(Math.hypot(st.rel[0],st.rel[1])>0.05||Math.hypot(st.q[0],st.q[1])>0.05||(st.g&&Math.hypot(st.g[0],st.g[1])>0.05))st.used37=F.t;if(!(st.used37!==undefined&&F.t-st.used37<3))continue;   // (and for 3 s after, while the camera eases back)
  const p=pre[i],d=v21Dist[i],lim=F.CAM37.camRate,D=Math.min(p*(1+lim),Math.max(p/(1+lim),d));if(Math.abs(D-d)<1e-9||!focus[i]||!cams[i])continue;
  v21Dist[i]=D;camPosS[i].copy(focus[i]).addScaledVector(CAM_DIR,D);cams[i].position.copy(camPosS[i]);cams[i].lookAt(focus[i]);}}
// v37: while Mr Bassey watches, a schedule change or a re-placement leaves him where he is (the evening's keep pattern)
function fbKeepBassey37(fn){return function(){const B=FOOTBALL37.bassey37,n=fbBasseyNPC37();if(!B||B.phase==='wait'||!n)return fn.apply(this,arguments);
 const s={route:n.route,ri:n.ri,dest:n.dest,home:n.home,hide:n.hideAtEnd,vis:n.g.visible,x:n.g.position.x,z:n.g.position.z,ry:n.g.rotation.y};const r=fn.apply(this,arguments);
 n.route=s.route;n.ri=s.ri;n.dest=s.dest;n.home=s.home;n.hideAtEnd=s.hide;n.g.visible=s.vis;n.g.position.set(s.x,0,s.z);n.g.rotation.y=s.ry;return r;};}
if(typeof reroute==='function'){const prevReroute37=reroute;reroute=fbKeepBassey37(prevReroute37);}          // v37: the slot change leaves the watching elder alone
if(typeof placeNPCs==='function'){const prevPlace37=placeNPCs;placeNPCs=fbKeepBassey37(prevPlace37);}      // v37: so does a re-placement of the neighbours
// v37: the base walk leaves Mr Bassey alone while he walks his own straight line along z 6.5 to the touchline
if(typeof updateNPCWalk==='function'){const prevWalkB37=updateNPCWalk;updateNPCWalk=function(){const n=fbBasseyNPC37();if(!n||n.route!==FB_WALK37)return prevWalkB37.apply(this,arguments);
 n.route=null;try{return prevWalkB37.apply(this,arguments);}finally{n.route=FB_WALK37;}};}
// v37 (fixer): while a match is on, the props between a view's camera and the play (palm fronds, the bougainvillea, the potted plant) fade,
// and any prop standing on the pitch itself stays faded; they come back afterwards. Visual only: no collider and no blocked() result changes.
// The base's own fade (updateFades) still runs: its value is kept apart and this factor is applied on top, as the evening does for labels.
FOOTBALL37.FADE37={region:{x1:-34,x2:-12,z1:4,z2:18},to:0.2,onPitch:0.15,edge:1.2,rate:6,maxR:4.5,minTop:0.45,pad:0.15};
const fbFade37={list:null,map:new Map()};
const fbFv37=new THREE.Vector3(),fbFw37=new THREE.Vector3(),fbFs37=new THREE.Sphere();
function fbFadeRoots37(){const out=new Set();try{for(const p of players)out.add(p.g);if(typeof npcs!=='undefined')for(const k in npcs)out.add(npcs[k].g);if(typeof walkers!=='undefined')for(const w of walkers)out.add(w.g);if(typeof keke!=='undefined'&&keke)out.add(keke);
 const K=FOOTBALL37.kids;if(K)for(const k in K)out.add(K[k].g);if(ball)out.add(ball);}catch(e){}return out;}
function fbFadeCands37(){if(fbFade37.list)return fbFade37.list;const F=FOOTBALL37,R=F.FADE37.region,roots=fbFadeRoots37(),out=[];
 for(const top of scene.children){if(roots.has(top)||(top.userData&&top.userData.football37))continue;
  top.traverse(o=>{if(!o.isMesh||o.isSprite||Array.isArray(o.material)||!o.material||!o.geometry)return;if(o.userData&&o.userData.football37)return;
   if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();o.updateMatrixWorld();fbFs37.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld);
   const c=fbFs37.center,r=fbFs37.radius;if(r>F.FADE37.maxR||c.x<R.x1||c.x>R.x2||c.z<R.z1||c.z>R.z2||c.y+r<F.FADE37.minTop)return;
   const P=F.PITCH,E=F.FADE37.edge,on=c.x>=P.x1-E&&c.x<=P.x2+E&&c.z>=P.z1-E&&c.z<=P.z2+E&&c.y<2.5;out.push({m:o,c:c.clone(),r,on});});}
 return (fbFade37.list=out);}
function fbSegSphere37(a,b,c,r){fbFw37.subVectors(b,a);const L=fbFw37.lengthSq()||1e-9;const u=fbClamp37(fbFv37.subVectors(c,a).dot(fbFw37)/L,0,1);fbFv37.copy(a).addScaledVector(fbFw37,u);return fbFv37.distanceTo(c)<r;}
// (fixer, v37 review F9) and before a match, from when a player comes within 3 m of a child waiting to play, so the invitation is seen
function fbNearKids37(){const F=FOOTBALL37,K=F.kids;if(!K||!(F.state==='idle'||F.state==='ended'))return false;
 for(const i of fbHumans37()){const p=players[i].g.position;for(const k in K){const c=K[k];if(!c.gone&&Math.hypot(c.pos[0]-p.x,c.pos[1]-p.z)<=3)return true;}}return false;}
function fbFadeOn37(){return (fbMatchOn37()&&FOOTBALL37.state!=='clearing')||fbNearKids37();}
function fbFadeStep37(dt){const F=FOOTBALL37,M=fbFade37.map,on=fbFadeOn37(),t=Math.max(0,Math.min(+dt||0,0.1)),k=Math.min(1,t*F.FADE37.rate);
 const want=new Set();
 if(on&&typeof cams!=='undefined'){const cands=fbFadeCands37(),tg=[];if(ball)tg.push(new THREE.Vector3(ball.position.x,F.R,ball.position.z));
  for(const P of F.persons){if(P.soft)continue;tg.push(new THREE.Vector3(P.pos[0],1.1*(P.kind==='kid'?0.82:1),P.pos[1]));tg.push(new THREE.Vector3(P.pos[0],0.2,P.pos[1]));}
  for(const i of [0,1]){if(!fbHalfShown37(i)||!cams[i])continue;const cp=cams[i].position;for(const c of cands){if(want.has(c))continue;if(c.on){want.add(c);continue;}for(const q of tg)if(fbSegSphere37(cp,q,c.c,c.r+F.FADE37.pad)){want.add(c);break;}}}}
 for(const c of want)if(!M.has(c.m)){const m=c.m,fadeable=typeof FADEABLE!=='undefined'&&FADEABLE.includes(m);const e={f:1,base:m.material.opacity,orig:null,on:c.on};
  if(!fadeable){e.orig=m.material;m.material=fbQuiet37(()=>e.orig.clone());m.material.transparent=true;e.base=1;}M.set(m,e);}
 for(const [m,e] of M){const c=fbFade37.list&&fbFade37.list.find(x=>x.m===m),w=c&&want.has(c),to=w?(e.on?F.FADE37.onPitch:F.FADE37.to):1;e.f+=(to-e.f)*k;if(!w&&e.f>0.995)e.f=1;
  if(!e.orig)e.base=m.material.opacity;
  if(!w&&e.f>=1){if(e.orig){m.material.dispose();m.material=e.orig;}else{m.material.opacity=e.base;m.material.depthWrite=e.base>0.6;}M.delete(m);continue;}
  m.material.opacity=e.base*e.f;m.material.depthWrite=m.material.opacity>0.6;}
 if(!on&&!M.size)fbFade37.list=null;}                        // (rescanned at the next match: furniture or the world may have changed)
if(typeof updateFades==='function'){const prevFades37=updateFades;updateFades=function(dt){ // v37 (fixer): props between the cameras and a match fade on top of the base's fade
 for(const [m,e] of fbFade37.map)if(!e.orig)m.material.opacity=e.base;const r=prevFades37.apply(this,arguments);try{fbFadeStep37(dt);}catch(e){}return r;};}
// v37: Tunde, Mama Nkechi and Ada give one football line each after a match (today's or yesterday's), in ordinary talk only
// (fixer, v37 review I3) but Ada's one-time thank-you for the bench (adb36, placed today or yesterday) comes first: the football line waits a talk
function fbBenchThanksDue37(who){if(who!=='ada'||typeof benchSave36!=='function')return false;const B=benchSave36();if(!B||B.state!=='placed'||B.placedDay==null||B.adb)return false;
 if(!(S.day===B.placedDay||S.day===B.placedDay+1))return false;const u=S.life&&S.life.lines35&&S.life.lines35.day===S.day&&S.life.lines35.used&&S.life.lines35.used.ada;return !(Array.isArray(u)&&u.includes('adb36'));}
// (fixer, v37 review F11) and on the veranda evening after a match, Mama Nkechi brings it up once
function fbEveningLine37(who){const F=FOOTBALL37,L=fbSave37();if(who!=='nkechi'||!L||!L.last||fbOnline37()||!(L.last.day===S.day||L.last.day===S.day-1))return null;if(L.eveDay===S.day)return null;L.eveDay=S.day;return {id:'fb37-nkechi-evening',text:F.LINES.neighbours.nkechiEvening};}
if(typeof line35==='function'){const prevLine37=line35;line35=function(who,ctx){try{if(ctx&&ctx.evening){const e=fbEveningLine37(who);if(e)return e;}else if(!fbBenchThanksDue37(who)){const l=fbNeighbourLine37(who);if(l)return l;}}catch(e){}return prevLine37.apply(this,arguments);};}
// v37: Mr Bassey's line after a match (the v35 line table has none for him, so his talk is wrapped instead)
if(typeof talk==='function'){const prevTalk37=talk;talk=function(i,who){/* outside lines_talk35 (the v35 lines wrapper, still underneath) */const out=prevTalk37.apply(this,arguments);try{if(who==='bassey'){const l=fbNeighbourLine37('bassey'),L=fbSave37();
  if(l&&L){if(!L.said||L.said.day!==S.day)L.said={day:S.day,who:[],bassey:[]};L.said.who.push('bassey');return say('bassey',esc(l.text))+(out||'');}}}catch(e){}return out;};}
// v37: the Today page (the morning card's renderer): the football line on a football morning and the latest match, after discovery
if(typeof todayHTML34==='function'){const prevMorning37=todayHTML34;todayHTML34=function(){const h=prevMorning37.apply(this,arguments);try{return fbBenchButtons37(fbTodayAdd37(h));}catch(e){return h;}};}

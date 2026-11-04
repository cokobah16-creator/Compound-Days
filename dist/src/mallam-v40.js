/* v40 Mallam's day (engineer A; v40/SPEC.md §11; owner decisions 3 and 4).
   Owner decision 3, "Morning order, evening coals": "You order your suya at half past ten, help fan the coals from five, and he stays by his
   grill during the gist. He hands over your sticks afterwards." Owner decision 4, "He says it once": "He becomes a neighbour with a name, but the
   compound still calls him Mallam."
   From half past ten to noon he sits behind his stall threading sticks: "Order two sticks for tonight" (no money now) keeps an order for the
   evening. At five he comes to his stand and lays the charcoal: "Fan the coals" opens at once, a short beat of open-clock input: each press
   raises the glow on the grill, which sinks between presses; a second player turns the sticks while the first fans (a single player stops
   fanning to turn them); when the glow has held and the sticks are turned twice, the first stick is shared by those who helped. No money changes
   hands. The first stick is offered as the "Taste the first stick" prompt, never as a panel that opens by itself (repair, H3: at 390 x 844 it
   opened under both thumbs and the next fanning tap pressed Taste); a press in the first moment after the beat ends is a fanning tap and does
   nothing. (repair 3, R3-2) From the beat's end, and for two seconds after the taste panel closes, an Act at the stand never buys the base
   round: the taste prompt, or "The coals are going." that does nothing, leads it there. On touch his panels take a tap only once Act has been
   quiet for a second (daily-v40.js), and the name line is spent only when a panel carrying it has been seen that long. Unfanned, he lights it himself at half past five. During the gist he sits by his grill, through any gist however late (repair 4,
   R4-2: the ten o'clock hide never cuts one; with no order waiting he goes a short beat after a gist that ran past ten ends). Afterwards, to ten, he is at his grill; when
   the base round ("Two suyas, ₦2,000") is bought his line shows as a bubble over him, read from the base's own suya flag: no hook on the sale,
   no wrapper on the base act. A kept order is handed over only after the gist (fix round, DOD-F5): a round before it brings a regular's or the
   season's line and the order stays kept; after it "Your two sticks are ready." once to a player within 4 m whose camera shows him (repair, VP-2; with no margin, repair 4, R4-6),
   and v40's own collection at the fan
   point, "Collect your two sticks, ₦2,000", ahead of the base round (repair, H1: the base allows one round per sitting, so a round bought from
   six before the gist would block it): what the base round charges and gives, and the kept order's line. A household that skips the gist
   collects from ten, when the gist's window has closed; while a kept order waits he stays at his grill until half past ten, and through
   tonight's gist until half an hour after it ends however late that is (repair 3, R3-1: a slow gist from half past nine ends after half past
   ten), so the household can walk over and collect. The end is kept in his record (gistEnd); (repair 4, R4-1) a gist that starts with the order
   waiting marks the record (gistOn), so a reload made during the gist counts the gist as ended at the reload and the half hour runs from then.
   Inert until v40 is discovered (G.b40, board-v40.js): before that he is not there and nothing changes. No TICK_HOOKS entry (the step rides
   EVENING35.tick by property, inside typeof guards), no Math.random call (his figure, stool, glow and fan are built inside quiet40), no wall
   clock, never the base showBubble, no blocked() or levelAt() call at run time. Online it is all off. Requires BOARD40 (quiet40, bubble40,
   gistSave40, layer40); with it absent this file installs nothing. Top-level names end in 40. */
'use strict';

const MALLAM40={v:1,t:0,checkAt:0,
 on:typeof BOARD40!=='undefined'&&!!BOARD40&&!!BOARD40.on,
 morning:[10.5,12.0],arrive:17.0,selfLight:17.5,fanTo:18.1667,until:22.0,
 // (repair, H1) while a kept order still waits he stays at his grill until half past ten (hold): the household that skips the gist collects it from
 // ten, when no gist can start any more, and one whose gist ends after ten still finds him there
 // (repair 3, R3-1) margin: while it waits he also stays through tonight's gist and until this long after it ends (the end is kept in his record
 // as gistEnd), however late; a gist can start until ten and a slow one runs about an hour
 hold:0.5,margin:0.5,
 // his place in the morning and at his grill: the stall's east end, facing the customer at the fan point (fix round, S3: behind the stall at
 // (-3, 13.2) the desk camera cut him off at his own stall); seat: his stool by the grill during the gist; face: his yaw towards the fan point
 spot:[-1.8,12.4],seat:[-4.2,13.0],fanAt:[-3.0,11.2],face:Math.atan2(-1.2,-1.2),
 walk:[[1.2,13.6],[1.0,14.2],[-1.0,14.2],[-1.2,13.6],[-1.8,12.4]],   // south of the household ball (critic finding 12)
 reach:1.2,fanReach:1.6,orderReach:1.6,fanLead:0.05,orderLead:0.05,turnLead:0.04,tasteLead:0.05,collectLead:0.04,FADE_R:10,WALK:1.3,JUMP_H:0.02,HELLO_R:4,READY_R:4,READY_Y:2.1,LINGER:4.3,
 // each fan +GLOW.up and a GLOW.fanS pose (about two a second at most; one press made during the pose is kept and made when it ends); the glow
 // sinks GLOW.sink a second; held at 0.6 or more for GLOW.holdS with the sticks turned twice: the first stick. "Turn the sticks" from 0.3 for
 // the player who is not fanning (a pair), from 0.6 for one who is (a single player); once the first turn is made, until the second, to a
 // player who has not fanned in the last GLOW.fanner seconds (a lone player at the stand: to them as well). Set (fix round, S2) so the beat
 // lasts 12 to 15 s (spec §11.2): one human about 13 to 14 s, a pair about 12 s
 // (repair, VP-3) a pair where only one presses: when the other player has not turned within GLOW.lone seconds of a turn being ready, the
 // fanner is offered it too
 GLOW:{up:0.07,sink:0.07,hold:0.6,holdS:4.75,fanS:0.45,turnS:0.45,turns:2,turnFrom:0.3,bub1:0.3,bub2:0.6,fanner:1.0,lone:2.0},
 // (repair, H3) pause: for this long after the beat ends (seconds of MALLAM40.t) a press on "Taste the first stick" is a fanning tap still coming
 // and does nothing; then the prompt opens the panel by the player's own Act
 // (repair 3, R3-2) hush: for this long after the beat ends and after the taste panel closes, an Act at the stand does not buy the base round
 // (at 390 x 844 a thumb still tapping pressed Taste and then bought it unseen)
 TASTE:{cheer:4,energy:5,pause:0.8,hush:2.0},
 SEAT_AT_GIST:true,                          // the day-1 camera probe (spec §17.1 item 0): seated by his grill during a visit; false: he walks off
 SEAT_H:0.45,
 LOOK:{skin:'#5A3826',hair:'low',outfit:'kaftan',oc:'#D9D2C1',oc2:'#D9D2C1'},CAP:'#EFEADF',
 LINES:{
  name:['gs40-ma-name','Sannu. My name is Sani. Everybody calls me Mallam.'],
  yaji:['gs40-ma-yaji','This yaji is my father’s own. Groundnut, pepper, ginger, and one more thing I will not tell you.'],
  ordered:['gs40-ma-ordered','More {choice}. Come back this evening. I will remember.'],
  tomorrow:['gs40-ma-tomorrow','Tomorrow, then.'],
  charcoal:['gs40-ma-charcoal','Sannu da zuwa. The charcoal is laid. Fan it small for me?'],
  shy:['gs40-ma-shy','Gently. The fire is shy at first.'],
  yauwa:['gs40-ma-yauwa','Yauwa.'],
  going:['gs40-ma-going','The coals are going.'],
  stick:['gs40-ma-stick','The first stick is for whoever fanned. Taste. Then tell me the truth.'],
  self:['gs40-ma-self','The fire came on its own in the end. It usually does.'],
  kept:['gs40-ma-kept','Two sticks, as I promised. More {choice} on yours, as you said. I told you I would remember.'],
  ready:['gs40-ma-ready','Your two sticks are ready.'],
  regular:['gs40-ma-regular','You again. Good. Same as before? I have already started.'],
  rains:['gs40-ma-rains','In the rains the charcoal sulks. Give it time. Everybody sulks a little in the rains.'],
  dry:['gs40-ma-dry','Dry season. The fire is quick and the onions are sweet.'],
  harmattan:['gs40-ma-harmattan','Harmattan is good for suya. The fire burns clean and people want something hot.'],
  away:['gs40-ma-away','More charcoal. I am coming.'],                 // not used in this build (he sits by his grill)
  bye:['gs40-ma-bye','Na gode. Sai gobe.']},                         // not used in this build (culture C14)
 UI:{name:'Mallam',kicker:'MALLAM',order:'Order two sticks for tonight',orderText:'Two sticks for tonight. Which do you want more of, pepper or onion? You pay when you collect them.',
  pepper:'Extra pepper',onion:'Extra onion',notToday:'Not today',fan:'Fan the coals',turn:'Turn the sticks',taste:'Taste the first stick',tasteBtn:'Taste',
  collect:'Collect your two sticks, ₦2,000',tasteText:'One stick to share. He will not take money for it.',tasteToast:'A taste of the first stick.',close:'Close',
  tonight:'Mallam is keeping two sticks for you tonight.',choice:{pepper:'pepper',onion:'onion'}},
 world:{fig:null,stool:null,glow:null,fan:null,lite:false,cap:null},
 run:{day:0,phase:'off',mode:'',pos:null,path:null,prog:0,lastTime:-1,yaw:Math.PI,glow:0,hold:0,pose:{0:-9,1:-9},lastFan:{0:-9,1:-9},poseKind:{0:'',1:''},
  turns:0,fanned:[],turned:[],b1:false,b2:false,done:false,hello:0,suya:null,seated:false,owed:0,buf:{0:'',1:''},ready:0,linger:0,turnAt:0,doneAt:0,tasteOpen:0,tasteShut:0,namePend:0,beat:0},
 flags:{now:0,value:null,parsed:false},
 cost:{steps:0,checks:0,builds:0}};

/* ======================================================================================================================================
   1. When he is there, pure (spec §11.2): his evening, his phase from the clock and the save; the record of his day; the API (§1.7)
   ====================================================================================================================================== */
function mallamOnline40(){return typeof NET!=='undefined'&&!!NET&&!!NET.on;}
function mallamIsAI40(i){return typeof AI!=='undefined'&&!!AI&&!!AI.on&&i===AI.i;}
function mallamLog40(k,a){try{if(typeof LOG35!=='undefined'&&LOG35&&typeof LOG35.add==='function')LOG35.add(k,a);}catch(e){}}
function mallamOverlay40(){try{return typeof overlayOpen==='function'&&overlayOpen();}catch(e){return false;}}
function mallamSilent40(){try{return typeof silentMode==='function'&&silentMode();}catch(e){return false;}}
function mallamSave40(){try{if(typeof save==='function'&&!mallamInGist40())save();}catch(e){}}
function mallamInGist40(){return (typeof GIST38!=='undefined'&&!!GIST38&&!!GIST38.visit)||(typeof EVENING35!=='undefined'&&!!EVENING35&&EVENING35.state!=='idle');}
function mallamFill40(t,v){return String(t).replace(/\{(\w+)\}/g,(m,k)=>v&&v[k]!=null?v[k]:m);}
function mallamLine40(k){const e=MALLAM40.LINES[k];try{if(typeof GIST40!=='undefined'&&GIST40&&GIST40.LINES&&typeof GIST40.LINES[e[0]]==='string')return GIST40.LINES[e[0]];}catch(x){}return e[1];}
// his evening, apart from the clock: v40 discovered, offline, not silent, no party, the v35 evening on an earlier day
function mallamEligible40(){if(!MALLAM40.on||typeof S==='undefined'||!S||!S.p||S.phase!=='play'||typeof players==='undefined'||!players.length)return false;
 if(mallamOnline40()||mallamSilent40())return false;if(S.party&&S.party.on&&!S.party.done)return false;
 if(!gistSave40(false))return false;const ev=S.life&&S.life.evening35;if(!ev||!((ev.doneDay|0)<S.day))return false;return true;}
// his record of today (b40.mallam), or null; create makes it (an order, the fan beat, the self-light)
function mallamRec40(create){const b=gistSave40(false);if(!b)return null;const m=b.mallam;if(m&&m.day===S.day)return m;if(!create)return null;
 const owed=m&&m.order&&m.day===S.day-1&&m.kept!==m.day?1:0;
 b.mallam={day:S.day,order:null,glow:0,fanned:[],turned:[],tasted:0,lit:null,kept:0,owed};return b.mallam;}
function mallamGistOver40(){return typeof GIST38!=='undefined'&&!!GIST38&&GIST38.seen===S.day;}
// the time he hands over a kept order (owner decision 3, "He hands over your sticks afterwards."): after tonight's gist (seen this session or in
// the saved record), or from six when no gist is due tonight any more; never during one (pure)
function mallamHandOver40(){if(mallamInGist40())return false;if(mallamGistOver40())return true;try{if(typeof gistSeenToday38==='function'&&gistSeenToday38())return true;}catch(e){}
 if(S.time>=MALLAM40.until)return true;                                          // (repair, H1) ten: the gist's window has closed
 return S.time>=18&&!(typeof gistDueTonight38==='function'&&gistDueTonight38());}
// (repair, H1) his last hour today: ten, or half past ten while a kept order still waits; (repair 3, R3-1) while it waits, also through tonight's
// gist and until margin after it ends; (repair 4, R4-2) with no order waiting he still stays through any gist ("he stays by his grill during the
// gist"): a gist that runs past ten is never cut, and he goes a short beat after it ends (mallamCheck40) (pure)
function mallamUntil40(){const M=MALLAM40,m=mallamRec40(false);if(!(m&&m.order&&m.kept!==S.day))return mallamInGist40()?Math.max(M.until,S.time+M.margin):M.until;if(mallamInGist40())return Math.max(M.until+M.hold,S.time+M.margin);return mallamLate40(m);}
// (repair 3, R3-1) the latest he stays tonight for an order, whatever its state: half past ten, or margin after tonight's gist ended (pure)
function mallamLate40(m){const M=MALLAM40;if(m===undefined)m=mallamRec40(false);const e=m&&typeof m.gistEnd==='number'?m.gistEnd:null;return Math.max(M.until+M.hold,e!==null?e+M.margin:0);}
// (repair 3, R3-1) tonight's gist has just ended with an order waiting: its end time kept in his record (once; saved). (repair 4, R4-1) A gist
// that started with the order waiting marked the record (gistOn, mallamGistOn40); finding that mark with no end and no gist running is a reload
// made during the gist (the game saves while it talks, and the gist cannot come round again past ten): the gist counts as ended at the reload,
// and the half-hour margin runs from then
function mallamGistEnd40(){const m=mallamRec40(false);if(!m||!m.order||m.kept===S.day||typeof m.gistEnd==='number'||mallamInGist40())return;
 if(!(m.gistOn===S.day||mallamGistOver40()||(typeof gistSeenToday38==='function'&&gistSeenToday38())))return;m.gistEnd=Math.round(S.time*1e4)/1e4;mallamSave40();}
// (repair 4, R4-1) a gist has started with an order waiting: the mark in his record, saved by the game's own saves during the gist; an end kept
// from an earlier start is dropped (a reload during a gist before ten lets it come round again, and its own end counts)
function mallamGistOn40(){const m=mallamRec40(false);if(!m||!m.order||m.kept===S.day||!mallamInGist40())return;m.gistOn=S.day;delete m.gistEnd;}
// (repair, H1) the kept order can be collected now: ordered, not yet handed over, and he hands it over (pure)
function mallamCollectable40(m){return !!(m&&m.order&&m.kept!==S.day&&mallamHandOver40());}
// today's three suya flags (the base's own, read)
function mallamFlagsNow40(){const now={};for(const s of ['morning','afternoon','evening'])now[s]=!!(S.flags&&S.flags['suya'+S.day+s]);return now;}
// his phase now: 'off' | 'morning' | 'set' | 'lit' | 'seated' | 'away' | 'after' (pure)
function mallamPhase40(t){const M=MALLAM40;if(t===undefined)t=S.time;if(!mallamEligible40())return 'off';
 if(M.flags.now&&M.flags.now===S.day){if(mallamInGist40())return M.SEAT_AT_GIST?'seated':'away';const m=mallamRec40(false);return m&&m.lit?'lit':'set';}
 if(t>=M.morning[0]&&t<M.morning[1])return 'morning';
 if(t<M.arrive||t>=mallamUntil40())return 'off';
 if(mallamInGist40())return M.SEAT_AT_GIST?'seated':'away';
 if(mallamGistOver40())return 'after';
 const m=mallamRec40(false),fanned=!!(m&&m.fanned&&m.fanned.length);
 if((m&&m.lit)||t>=M.fanTo||(t>=M.selfLight&&!fanned))return 'lit';return 'set';}
// tonight, pure: {on, phase, glow, fanned, tasted, order}
function mallamTonight40(){const ph=mallamPhase40(),m=mallamRec40(false),R=MALLAM40.run;
 return {on:ph!=='off',phase:ph,glow:Math.round((m&&m.lit?1:(R.day===S.day?R.glow:0))*100)/100,fanned:!!(m&&m.fanned&&m.fanned.length),tasted:!!(m&&m.tasted),order:m&&m.order&&m.kept!==S.day?m.order:null};}
// Today's line about the kept order (for the integrator's block): the sentence, or null
function mallam40Today(){try{const m=mallamRec40(false);if(!m||!m.order||m.kept===S.day||S.time>=mallamUntil40()||mallamOnline40())return null;return {html:esc(MALLAM40.UI.tonight)};}catch(e){return null;}}

/* ======================================================================================================================================
   2. Building him (spec §11.1, §10.6): the hero rig (the lite body while the hero is not ready), a plain cap, his stool, the grill's glow, the
   raffia fan; everything inside quiet40, built once per household and kept hidden between his hours
   ====================================================================================================================================== */
function mallamMat40(c,o){const m=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));m.userData.own40=true;return m;}
function mallamMake40(){const M=MALLAM40,look=Object.assign({},M.LOOK);let g=null,lite=false;
 if(typeof HERO!=='undefined'&&HERO&&HERO.state==='ready'){try{g=makeAvatar(Object.assign({},look,{rig:'hero'}));}catch(e){g=null;}}
 if(!g||!g.hero){lite=true;try{g=makeAvatar(look,true);}catch(e){g=null;}}
 if(!g){g=new THREE.Group();const m=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.2,1.5,10),mallamMat40(M.LOOK.oc));m.position.y=0.75;g.add(m);lite=true;}
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.095,0.1,0.075,14),mallamMat40(M.CAP));cap.name='mallam40_cap';
 if(!lite&&g.hero&&g.hero.head){cap.position.set(0,0.185,-0.01);cap.scale.setScalar(1/Math.max(0.01,g.scale.x||1));g.hero.head.add(cap);}else{cap.position.set(0,1.66,0);g.add(cap);}
 g.name='mallam40';g.userData.gist40='mallam';g.baseY=0;g.visible=false;return {g,lite,cap};}
function mallamStoolMesh40(){const g=new THREE.Group();g.name='mallam40_stool';const H=MALLAM40.SEAT_H,wood='#7A5230';
 const top=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.04,14),mallamMat40(wood));top.position.y=H-0.02;g.add(top);
 for(let k=0;k<3;k++){const a=k*Math.PI*2/3,l=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.022,H-0.04,6),mallamMat40('#5E3B22'));l.position.set(Math.sin(a)*0.11,(H-0.04)/2,Math.cos(a)*0.11);g.add(l);}
 g.userData.gist40='mallam';return g;}
function mallamGlowMesh40(){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.08,0.4),new THREE.MeshBasicMaterial({color:'#2A2420'}));m.rotation.x=-Math.PI/2;m.position.set(-3,1.206,12.3);m.name='mallam40_glow';m.userData.gist40='glow';return m;}
function mallamFanMesh40(){const g=new THREE.Group();g.name='mallam40_fan';const f=new THREE.Mesh(new THREE.CircleGeometry(0.13,12),mallamMat40('#C9A86A',{side:THREE.DoubleSide}));f.position.y=0.17;g.add(f);
 const h=new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.012,0.14,6),mallamMat40('#7A5230'));h.position.y=0.05;g.add(h);g.userData.gist40='fan';return g;}
function mallamBuild40(){const M=MALLAM40,W=M.world;
 if(W.fig&&!(W.lite&&typeof HERO!=='undefined'&&HERO&&HERO.state==='ready'))return W.fig;
 const keep=W.fig?{pos:W.fig.position.clone(),rot:W.fig.rotation.y,parent:W.fig.parent,sit:W.fig.sitting,seat:W.fig.userData.seat}:null;if(W.fig)mallamDropFig40();
 const r=quiet40(()=>mallamMake40());W.fig=r.g;W.lite=r.lite;W.cap=r.cap;M.cost.builds++;
 if(keep){r.g.position.copy(keep.pos);r.g.rotation.y=keep.rot;if(keep.sit&&keep.seat){r.g.sitting=true;r.g.userData.seat=keep.seat;}if(keep.parent)keep.parent.add(r.g);}
 if(!W.stool){W.stool=quiet40(()=>mallamStoolMesh40());M.cost.builds++;}
 if(!W.glow){W.glow=quiet40(()=>mallamGlowMesh40());M.cost.builds++;}
 if(!W.fan){W.fan=quiet40(()=>mallamFanMesh40());M.cost.builds++;}
 return W.fig;}
function mallamDispose40(o){if(!o)return;o.traverse(m=>{if(m.userData&&m.userData.own40||m.name==='mallam40_glow'){if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose();}});}
function mallamDropFig40(){const W=MALLAM40.world;if(W.fig){if(W.fig.parent)W.fig.parent.remove(W.fig);if(W.cap){if(W.cap.parent)W.cap.parent.remove(W.cap);mallamDispose40(W.cap);}}W.fig=null;W.cap=null;W.lite=false;}
// hidden: his figure, stool, glow and fan out of the scene (kept for his next hours in this household)
function mallamHide40(){const W=MALLAM40.world;for(const k of ['fig','stool','glow','fan']){const o=W[k];if(o){o.visible=false;if(o.parent)o.parent.remove(o);}}
 if(W.fig){W.fig.sitting=false;delete W.fig.userData.seat;W.fig.position.y=0;}if(typeof boardBubblesOff40==='function'&&W.fig)boardBubblesOff40(W.fig);MALLAM40.run.phase='off';MALLAM40.run.seated=false;}
// a new day's memory of the beat
function mallamRunReset40(){const r=MALLAM40.run;r.day=0;r.phase='off';r.mode='';r.pos=null;r.path=null;r.prog=0;r.lastTime=-1;r.yaw=Math.PI;r.glow=0;r.hold=0;r.pose={0:-9,1:-9};r.lastFan={0:-9,1:-9};r.poseKind={0:'',1:''};
 r.turns=0;r.fanned=[];r.turned=[];r.b1=false;r.b2=false;r.done=false;r.hello=0;r.suya=null;r.seated=false;r.owed=0;r.buf={0:'',1:''};r.ready=0;r.linger=0;r.turnAt=0;r.doneAt=0;r.tasteOpen=0;r.tasteShut=0;r.namePend=0;r.beat=0;}
// everything out and disposed (a new household, enterWorld, online)
function mallamTeardown40(){const W=MALLAM40.world;mallamHide40();mallamDropFig40();for(const k of ['stool','glow','fan']){if(W[k]){if(W[k].parent)W[k].parent.remove(W[k]);mallamDispose40(W[k]);}W[k]=null;}
 if(typeof scene!=='undefined'&&scene&&scene.children){for(const o of scene.children.slice())if(o.userData&&['mallam','glow','fan'].includes(o.userData.gist40)){scene.remove(o);mallamDispose40(o);}}
 mallamRunReset40();}

/* ======================================================================================================================================
   3. Moving him (spec §11.2): phases from the clock, movement from dt only while no panel is open; a jump snaps him to his phase's place
   ====================================================================================================================================== */
function mallamLen40(P){let L=0;for(let k=1;k<P.length;k++)L+=Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]);return L;}
function mallamAt40(P,s){let left=Math.max(0,s);for(let k=1;k<P.length;k++){const a=P[k-1],b=P[k],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(left<=d||k===P.length-1){const f=d>1e-9?Math.min(1,left/d):1;
  return {x:a[0]+(b[0]-a[0])*f,z:a[1]+(b[1]-a[1])*f,dx:d>1e-9?(b[0]-a[0])/d:0,dz:d>1e-9?(b[1]-a[1])/d:0};}left-=d;}const e=P[P.length-1];return {x:e[0],z:e[1],dx:0,dz:0};}
function mallamPlace40(x,z,yaw){const g=MALLAM40.world.fig,r=MALLAM40.run;if(!g)return;g.position.set(x,g.sitting?g.position.y:0,z);r.pos=[x,z];if(yaw!==undefined){r.yaw=yaw;g.rotation.y=yaw;}}
// the stool under him at (x, z) facing yaw, and the base seat pose (polish-v30's seatPose through animAvatar)
function mallamSit40(x,z,yaw){const M=MALLAM40,W=M.world,g=W.fig,st=W.stool;if(!g||!st)return;st.position.set(x,0,z);st.rotation.y=yaw;st.visible=true;if(st.parent!==scene)scene.add(st);st.updateMatrixWorld(true);
 g.position.set(x,0,z);g.rotation.y=yaw;M.run.yaw=yaw;M.run.pos=[x,z];g.userData.seat={frame:st,height:M.SEAT_H,depth:0,spacing:0,x:0,floorY:0};g.sitting=true;M.run.seated=true;}
function mallamStand40(){const M=MALLAM40,W=M.world,g=W.fig;if(g&&g.sitting){g.sitting=false;delete g.userData.seat;g.position.y=0;}if(W.stool){W.stool.visible=false;if(W.stool.parent)W.stool.parent.remove(W.stool);}M.run.seated=false;}
function mallamNear40(x,z,r){for(const p of players){if(p&&p.g&&Math.hypot(p.g.position.x-x,p.g.position.z-z)<r)return true;}return false;}
// (repair, VP-2) is his bubble drawn for player i: the point it hangs from inside that player's camera, by the test the bubble clamp itself uses
// (boardSeen40; a camera that cannot see it draws the bubble at size 0); the companion's view is the human's camera only. (repair 4, R4-6) With
// no margin, and at the bubble's height as well as at the point the clamp tests: boardSeen40's 0.1 margin let the line be spent at 844 x 390
// with him just below both halves, where a household standing still never saw it
const SEENV40={v:null};
function mallamInFrame40(cam,c,x,y,z){const v=SEENV40.v||(SEENV40.v=new THREE.Vector3());cam.updateMatrixWorld();v.set(x,y,z).applyMatrix4(cam.matrixWorldInverse);if(-v.z<=0.1)return false;
 v.set(x,y,z).project(cam);let top=1;if(c>=0&&typeof v21Viewport==='function'){const vp=v21Viewport(c);if(vp&&vp.h>0)top=1-2*(vp.top||0)/vp.h;}return v.x>=-1&&v.x<=1&&v.y>=-1&&v.y<=top;}
function mallamSeenBy40(i){try{const g=MALLAM40.world.fig;if(!g||!g.visible||!g.parent||typeof cams==='undefined'||!cams||typeof boardSeen40!=='function')return false;
 const si=typeof singleIdx==='function'?singleIdx():-1;if(si>=0&&i!==si)return false;const c=si>=0?si:i,cam=cams[c];if(!cam)return false;const x=g.position.x,y=g.position.y||0,z=g.position.z,R=MALLAM40.READY_Y;
 return boardSeen40(cam,c,x,y+R-0.7,z)&&mallamInFrame40(cam,c,x,y+R-0.7,z)&&mallamInFrame40(cam,c,x,y+R,z);}catch(e){return false;}}
// (repair, VP-2) a human player within r of (x, z) who will see his bubble
function mallamNearSeen40(x,z,r){for(let i=0;i<players.length;i++){const p=players[i];if(!p||!p.g||mallamIsAI40(i))continue;if(Math.hypot(p.g.position.x-x,p.g.position.z-z)<r&&mallamSeenBy40(i))return true;}return false;}
// the place his phase gives him now (a first sight, a jump or a reload snaps him there)
function mallamSnap40(ph){const M=MALLAM40,r=M.run;mallamStand40();r.path=null;r.prog=0;
 if(ph==='morning'){r.mode='sit';mallamSit40(M.spot[0],M.spot[1]+0.05,M.face);return;}
 if(ph==='seated'){r.mode='sit';mallamSit40(M.seat[0],M.seat[1],Math.PI/2);return;}
 if(ph==='away'){r.mode='gone';return;}
 r.mode='stand';mallamPlace40(M.spot[0],M.spot[1],M.face);}
// one visible frame: walk (no panel open), face, animate
function mallamFrame40(dt){const M=MALLAM40,r=M.run,g=M.world.fig;if(!g)return;let moving=false;
 if(!mallamOverlay40()&&r.path&&(r.mode==='walk'||r.mode==='leave')){const L=mallamLen40(r.path);r.prog=Math.min(L,r.prog+M.WALK*dt);const p=mallamAt40(r.path,r.prog);moving=true;
  mallamPlace40(p.x,p.z,(p.dx||p.dz)?Math.atan2(p.dx,p.dz):undefined);
  if(r.prog>=L-1e-9){if(r.mode==='leave'){r.mode='gone';r.path=null;g.visible=false;if(g.parent)g.parent.remove(g);return;}r.mode='stand';r.path=null;mallamPlace40(M.spot[0],M.spot[1],M.face);}}
 if(!moving&&r.mode==='stand'){let want=M.face,bd=4;for(const p of players){if(!p||!p.g)continue;const d=Math.hypot(p.g.position.x-g.position.x,p.g.position.z-g.position.z);if(d<bd){bd=d;want=Math.atan2(p.g.position.x-g.position.x,p.g.position.z-g.position.z);}}
  let dy=want-g.rotation.y;while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;g.rotation.y+=dy*Math.min(1,dt*5);r.yaw=g.rotation.y;}
 try{if(typeof animAvatar==='function')animAvatar(g,M.t,moving,false,M.WALK,dt);}catch(e){}}
// the grill's glow (dark coals to orange) and the fan (in the hand of a player mid-fan, else on the counter)
const FANV40={v:null};
function mallamGlowFrame40(){const M=MALLAM40,W=M.world,gl=W.glow;if(!gl||!gl.parent)return;const r=M.run,m=mallamRec40(false);const v=m&&m.lit?0.85+0.15*Math.sin(M.t*2.1):Math.max(0,Math.min(1,r.glow));
 const R=0.16+0.84*v,G=0.14+0.36*v*v,B=0.12+0.02*v;if(gl.material.color.r!==R)gl.material.color.setRGB(R,G,B);}
function mallamFanFrame40(){const M=MALLAM40,W=M.world,f=W.fan;if(!f||!f.parent)return;let who=-1;for(const i of [0,1])if(M.run.poseKind[i]==='fan'&&M.run.pose[i]>M.t)who=i;
 if(who>=0&&players[who]){const g=players[who].g;if(g.hero&&g.hero.handR){const v=FANV40.v||(FANV40.v=new THREE.Vector3());g.updateMatrixWorld(true);g.hero.handR.getWorldPosition(v);f.position.set(v.x,v.y-0.05,v.z);}
  else f.position.set(g.position.x+Math.sin(g.rotation.y)*0.35,0.95,g.position.z+Math.cos(g.rotation.y)*0.35);f.rotation.set(-0.5+0.7*Math.sin((M.run.pose[who]-M.t)*Math.PI*4),g.rotation.y,0);}
 else{f.position.set(-3.62,0.905,12.12);f.rotation.set(-Math.PI/2,0,0.4);}}

/* ======================================================================================================================================
   4. The check, four times a second (spec §11.2, §11.3): phase, snap or walk, the self-light, the beat's end, the bubbles, the suya flag
   ====================================================================================================================================== */
function mallamShow40(o){if(o&&o.parent!==scene){o.visible=true;scene.add(o);}else if(o)o.visible=true;}
function mallamSeason40(){try{return typeof season==='function'?season(S.day):'rains';}catch(e){return 'rains';}}
function mallamCheck40(){const M=MALLAM40,r=M.run,W=M.world;M.cost.checks++;
 if(typeof S==='undefined'||!S||!S.p||S.phase!=='play'||typeof players==='undefined'||!players.length){if(W.fig&&W.fig.parent)mallamHide40();return;}
 if(mallamOnline40()){if(W.fig||W.stool||W.glow||W.fan)mallamTeardown40();return;}
 try{mallamGistEnd40();}catch(e){}
 const t=S.time,U=mallamUntil40();if((t<M.morning[0]||(t>=M.morning[1]&&t<M.arrive)||t>=U)&&!(M.flags.now&&M.flags.now===S.day)){
  // (repair 4, R4-2) a gist that ran past ten has just ended with no order waiting: he gets up from his stool, stands at his grill for a short beat
  // (LINGER), then goes
  if(t>=U&&r.day===S.day&&W.fig&&W.fig.parent&&W.fig.visible){if(r.phase==='seated'&&!mallamInGist40()){mallamSnap40('after');r.phase='after';r.beat=M.t+M.LINGER;r.lastTime=t;return;}
   if(r.beat&&M.t<r.beat)return;}
  // ten o'clock with him at his grill: the flag watch first (a round bought just before ten carried the clock past it); while the base panel is
  // open he waits; when his line comes he stays until it ends
  if(t>=U&&t<mallamLate40()+1&&r.day===S.day&&W.fig&&W.fig.parent&&W.fig.visible&&(r.phase==='after'||r.phase==='lit'||r.phase==='set')){
   if(r.linger){if(M.t<r.linger)return;}else if(mallamOverlay40())return;else if(mallamSuyaWatch40(r.phase,W.fig)){r.linger=M.t+M.LINGER;return;}}
  // (repair, H9) his hours away at midday: the flag record kept current, so a round bought while he is not there brings no line at five
  if(t>=M.morning[1]&&t<M.arrive&&r.day===S.day)r.suya=mallamFlagsNow40();
  if(W.fig&&W.fig.parent)mallamHide40();r.lastTime=t;return;}
 const ph=mallamPhase40(t);if(ph==='off'){if(W.fig&&W.fig.parent)mallamHide40();if(r.day===S.day)r.suya=mallamFlagsNow40();r.lastTime=t;return;}
 if(r.day!==S.day){mallamRunReset40();r.day=S.day;const m=mallamRec40(false);if(m&&m.lit)r.done=true;if(m)r.turns=m.turns|0;
  const b=gistSave40(false),y=b&&b.mallam;if(y&&((y.day===S.day-1&&y.order&&y.kept!==y.day)||(y.day===S.day&&y.owed)))r.owed=1;}
 mallamBuild40();const g=W.fig;const first=!g.parent||!g.visible||r.pos===null,jump=r.lastTime>=0&&Math.abs(t-r.lastTime)>M.JUMP_H,was=r.phase;r.lastTime=t;r.phase=ph;
 // the stand's glow and the fan from five
 if(ph==='morning'){if(W.glow&&W.glow.parent)scene.remove(W.glow);if(W.fan&&W.fan.parent)scene.remove(W.fan);}else{mallamShow40(W.glow);mallamShow40(W.fan);}
 if(first||jump){
  // first seen at five: walked in along the probed line when a player is near, else simply there; any other first sight or jump snaps
  if(first&&ph==='set'&&was==='off'&&r.mode!=='walk'&&t<M.arrive+0.15&&mallamNear40(M.spot[0],M.spot[1],M.FADE_R)&&!jump){mallamStand40();r.mode='walk';r.path=M.walk.map(p=>p.slice());r.prog=0;const p=mallamAt40(r.path,0);mallamPlace40(p.x,p.z,Math.atan2(p.dx,p.dz));}
  else mallamSnap40(ph);
  if(r.mode!=='gone')mallamShow40(g);else{g.visible=false;if(g.parent)g.parent.remove(g);}}
 else if(ph!==was){
  if(ph==='seated'){mallamSnap40('seated');mallamShow40(g);}
  else if(ph==='away'){mallamStand40();r.mode='leave';r.path=M.walk.slice().reverse().map(p=>p.slice());r.path[0]=[g.position.x,g.position.z];r.prog=0;bubble40(mallamLine40('away'),3000,g,2.1);}
  else if(was==='seated'||was==='away'){if(was==='away'){mallamStand40();r.mode='walk';r.path=M.walk.map(p=>p.slice());r.prog=0;const p=mallamAt40(r.path,0);mallamPlace40(p.x,p.z);mallamShow40(g);}else mallamSnap40(ph);}
  else if(was==='morning')mallamSnap40(ph);}
 if(mallamOverlay40())return;
 const m=mallamRec40(false);
 // the morning: "Tomorrow, then." once, to a player near the stand, when yesterday's order was not collected
 if(ph==='morning'){
  if(r.owed===1&&mallamNear40(M.fanAt[0],M.fanAt[1],3)){r.owed=2;bubble40(mallamLine40('tomorrow'),2600,g,1.7);}}
 // from five: his hello once, to a player near the stand while the charcoal waits
 if(ph==='set'&&!r.hello&&!(m&&m.fanned&&m.fanned.length)&&mallamNear40(M.fanAt[0],M.fanAt[1],M.HELLO_R)&&r.mode!=='walk'){r.hello=1;bubble40(mallamLine40('charcoal'),3600,g,2.1);}
 // after the gist, the kept order waiting: "Your two sticks are ready." once, to a player within 4 m of the stand whose camera shows him (repair,
 // VP-2: from the rail side at 3.7 m he was below both desk cameras and the line was spent unseen), whatever prompt is on top there
 if((ph==='after'||ph==='lit')&&!r.ready&&mallamCollectable40(m)&&mallamNearSeen40(M.fanAt[0],M.fanAt[1],M.READY_R)){r.ready=1;bubble40(mallamLine40('ready'),3600,g,M.READY_Y);}
 // half past five with nobody fanning: he lights it himself (no taste tonight)
 if((ph==='lit'||ph==='after'||ph==='seated')&&!(m&&m.lit)&&!M.flags.now){const mm=mallamRec40(true);if(mm&&!mm.lit){mm.lit=mm.fanned.length?'late':'self';if(!mm.fanned.length&&ph==='lit')bubble40(mallamLine40('self'),3600,g,2.1);r.done=true;mallamSave40();}}
 // the beat's bubbles as the glow passes 0.3 and 0.6
 if(ph==='set'&&!r.done){if(!r.b1&&r.glow>=M.GLOW.bub1){r.b1=true;bubble40(mallamLine40('shy'),2600,g,2.1);}if(!r.b2&&r.glow>=M.GLOW.bub2){r.b2=true;bubble40(mallamLine40('yauwa'),2000,g,2.1);}}
 // the base round bought (its own flag turning true) while he is at his stand: his line over him
 mallamSuyaWatch40(ph,g);}
// the suya flags of today's three sittings, remembered at each check; one that turns true while he is at his stand brings his line
function mallamSuyaWatch40(ph,g){const r=MALLAM40.run,now=mallamFlagsNow40();
 const prev=r.suya;r.suya=now;if(!prev||!(ph==='set'||ph==='lit'||ph==='after'))return false;let turned=false;for(const s in now)if(now[s]&&!prev[s])turned=true;if(!turned)return false;
 const m=mallamRec40(false),b=gistSave40(false);let line;
 if(m&&m.order&&m.kept!==S.day&&mallamHandOver40()){m.kept=S.day;line=mallamFill40(mallamLine40('kept'),{choice:MALLAM40.UI.choice[m.order]||m.order});mallamLog40('mallam','kept');mallamSave40();}
 else{const n=b?(b.once.suyaN|0):0;if(b)b.once.suyaN=n+1;line=n>=1&&(hash38(S.day,47)&1)?mallamLine40('regular'):mallamLine40(mallamSeason40());}
 bubble40(line,4200,g,2.1);return true;}
// the fan beat between checks: the glow sinks, the hold counts, the beat ends (the first stick)
function mallamBeat40(dt){const M=MALLAM40,r=M.run,G=M.GLOW;if(r.done||r.phase!=='set'||mallamOverlay40())return;
 for(const i of [0,1]){const k=r.buf[i];if(k&&!(r.pose[i]>M.t)){r.buf[i]='';if(k==='fan')mallamFan40(i);else mallamTurn40(i);}}
 r.glow=Math.max(0,r.glow-G.sink*dt);if(r.glow>=G.hold)r.hold+=dt;else r.hold=0;
 // (repair, VP-3) when a turn became ready (the glow at 0.3 for the first, the last turn for the second)
 if(r.turns<G.turns&&(r.turns>0||r.glow>=G.turnFrom)){if(!r.turnAt)r.turnAt=M.t;}else r.turnAt=0;
 // (repair, H6) the helpers merged into the saved record (a reload mid-beat keeps who fanned before it)
 if(r.hold>=G.holdS&&r.turns>=G.turns){r.done=true;const m=mallamRec40(true);if(!m)return;m.lit='fan';m.glow=1;m.fanned=[...new Set((m.fanned||[]).concat(r.fanned))];m.turned=[...new Set((m.turned||[]).concat(r.turned))];
  // (repair, H3) no panel opens by itself: the taste is offered as the prompt, from TASTE.pause after now
  r.doneAt=M.t;mallamLog40('mallam','lit');if(M.world.fig)bubble40(mallamLine40('going'),2600,M.world.fig,2.1);mallamSave40();}}
// the per-frame step (the EVENING35.tick wrapper below)
MALLAM40.step=function(dt){const M=MALLAM40;dt=Math.max(0,+dt||0);M.t+=dt;M.cost.steps++;const W=M.world;
 mallamPanelWatch40();
 if(W.fig&&W.fig.parent){mallamFrame40(dt);mallamBeat40(dt);mallamGlowFrame40();mallamFanFrame40();}
 if(M.t<M.checkAt)return;M.checkAt=M.t+0.25;mallamCheck40();};

/* ======================================================================================================================================
   5. His prompts and acts (spec §4, §11.2, §11.3): the order (10:30 to noon), the fan and the turn (from five), the taste. Nothing for the AI
   player and nothing for 'suya' (the base act is itself an early ACT_HOOKS entry: a later one would never run, critic finding 13)
   ====================================================================================================================================== */
function mallamBar40(v){const n=Math.max(0,Math.min(5,Math.round(v*5)));return ' '+'●'.repeat(n)+'○'.repeat(5-n);}
// Aunty Bisi at her stop (or held there tonight, v39's own reading), her buy already in this player's list (v39's hook runs before v40's) and ahead of the base round here (dd, the base
// suya prompt's distance): her buy comes first, the fan is not offered. Wherever the base round would have come before her buy, the fan takes its
// place from five (fix round, S1: a 2.4 m radius round her stop left the base round, bought by Act before the coals were lit, at the stall's
// front; her reach is 2.4 m too, so her entry alone is not enough: at (-2.85, 10.86) it is in the list, 2.36 m off, behind the base round's 0.37)
function mallamBisiFirst40(list,dd){try{if(typeof BISI39==='undefined'||!BISI39)return false;const ph=BISI39.run.phase;if(!(ph==='stop'||(ph==='stroll'&&typeof bisiHeld39==='function'&&bisiHeld39())))return false;const e=list.find(x=>x&&x.id==='bisi39buy');return !!e&&e.dist<=dd;}catch(e){return false;}}
function mallamHot40(i,list,d){if(!list||!MALLAM40.on)return null;const M=MALLAM40,W=M.world,r=M.run,p=typeof players!=='undefined'?players[i]:null;
 if(!p||mallamIsAI40(i)||(p.y||0)>1||p.g.sitting||!W.fig||!W.fig.visible||!W.fig.parent||mallamOnline40())return null;
 const ph=r.phase,dd=d(M.fanAt[0],M.fanAt[1]),U=M.UI;
 if(ph==='morning'){const m=mallamRec40(false);if(!(m&&m.order)&&dd<M.orderReach)list.push({id:'mallam40order',label:U.order,dist:dd-M.orderLead});return null;}
 if(ph==='set'&&!r.done&&S.time<M.fanTo&&dd<M.fanReach&&!mallamBisiFirst40(list,dd)){const o=1-i,G=M.GLOW,po=players[o],me=M.t-r.lastFan[i]<G.fanner,other=po&&!mallamIsAI40(o)&&M.t-r.lastFan[o]<G.fanner&&!me;
  // a second human at the stand: from the first turn on the turn is offered only to the one who has not just fanned
  const two=!!(po&&!mallamIsAI40(o)&&po.g&&Math.hypot(po.g.position.x-M.fanAt[0],po.g.position.z-M.fanAt[1])<M.fanReach);
  const lone=r.turnAt>0&&M.t-r.turnAt>=G.lone;
  const turn=r.turns<G.turns&&(r.turns>0?(!(two&&me)||lone):r.glow>=(other?G.turnFrom:G.hold));
  if(turn)list.push({id:'mallam40turn',label:U.turn+mallamBar40(r.glow),dist:dd-M.turnLead});else list.push({id:'mallam40fan',label:U.fan+mallamBar40(r.glow),dist:dd-M.fanLead});}
 // (repair, H3) the taste as a prompt, offered to every helper within the fan's reach (it no longer opens by itself)
 const m=mallamRec40(false);if(m&&m.lit==='fan'&&!m.tasted&&(ph==='set'||ph==='lit')&&dd<M.fanReach&&(m.fanned.includes(i)||m.turned.includes(i)))list.push({id:'mallam40taste',label:U.taste,dist:dd-M.tasteLead});
 // (repair 3, R3-2) from the beat's end and for TASTE.hush after the taste panel closes, nothing that buys: where no taste prompt is offered,
 // "The coals are going." leads the base round at the stand and does nothing
 if(mallamHushed40()&&(ph==='set'||ph==='lit')&&dd<M.fanReach&&!list.some(x=>x&&x.id==='mallam40taste'))list.push({id:'mallam40hush',label:mallamLine40('going'),dist:dd-M.tasteLead});
 // (repair, H1) the kept order collected at the fan point once he hands it over: ahead of the base round there
 if((ph==='after'||ph==='lit')&&dd<M.orderReach&&mallamCollectable40(m))list.push({id:'mallam40collect',label:U.collect,dist:dd-M.collectLead});
 return null;}
function mallamFan40(i){const M=MALLAM40,r=M.run,G=M.GLOW;if(r.phase!=='set'||r.done)return;if(r.pose[i]>M.t){r.buf[i]='fan';return;}r.pose[i]=M.t+G.fanS;r.poseKind[i]='fan';r.lastFan[i]=M.t;r.glow=Math.min(1,r.glow+G.up);
 if(!r.fanned.includes(i)){r.fanned.push(i);const m=mallamRec40(true);if(m&&!m.fanned.includes(i)){m.fanned.push(i);mallamLog40('mallam','fan');}}}
function mallamTurn40(i){const M=MALLAM40,r=M.run,G=M.GLOW;if(r.phase!=='set'||r.done||r.turns>=G.turns)return;if(r.pose[i]>M.t){r.buf[i]='turn';return;}r.pose[i]=M.t+G.turnS;r.poseKind[i]='turn';r.turns++;
 r.turnAt=M.t;if(!r.turned.includes(i))r.turned.push(i);const m=mallamRec40(true);if(m){if(!m.turned.includes(i))m.turned.push(i);m.turns=r.turns;}mallamLog40('mallam','turn');}
function mallamAct40(i,kind){if(kind!=='mallam40order'&&kind!=='mallam40fan'&&kind!=='mallam40turn'&&kind!=='mallam40taste'&&kind!=='mallam40collect'&&kind!=='mallam40hush')return false;
 if(mallamOnline40()||mallamIsAI40(i)||kind==='mallam40hush')return true;
 if(kind==='mallam40fan')mallamFan40(i);else if(kind==='mallam40turn')mallamTurn40(i);else if(kind==='mallam40order')mallamOrderPanel40(i);else if(kind==='mallam40collect')mallamCollect40(i);else if(!mallamTastePaused40())mallamTastePanel40();
 return true;}
// (repair, H3) the moment after the beat ends: a press then is a fanning tap still coming, not a choice (pure)
function mallamTastePaused40(){const M=MALLAM40,r=M.run;return r.day===S.day&&r.doneAt>0&&M.t-r.doneAt<M.TASTE.pause;}
// (repair 3, R3-2) the hush: the beat ended or the taste panel closed less than TASTE.hush ago, or the taste panel is open (pure)
function mallamHushed40(){const M=MALLAM40,r=M.run,h=M.TASTE.hush;return r.day===S.day&&(!!r.tasteOpen||(r.doneAt>0&&M.t-r.doneAt<h)||(r.tasteShut>0&&M.t-r.tasteShut<h));}
// (repair 3, R3-2) a touch-opened v40 panel still holding its taps (daily-v40.js's hold), pure
function mallamHeld40(){try{return typeof DAILY40!=='undefined'&&!!DAILY40&&!!DAILY40.on&&typeof FOUND38!=='undefined'&&!!FOUND38&&DAILY40.hold>FOUND38.t;}catch(e){return false;}}
// (repair 3, R3-2) every frame: the taste panel's close noted (the hush runs from it); a name line held in a touch-opened panel is spent once that
// panel has been open with no tap for the hold (seen), and not at all if it closes before
function mallamPanelWatch40(){const r=MALLAM40.run;if(!r.namePend&&!r.tasteOpen)return;const open=mallamOverlay40();
 if(r.tasteOpen&&!open){r.tasteOpen=0;r.tasteShut=MALLAM40.t;}
 if(r.namePend){if(!open)r.namePend=0;else if(!mallamHeld40())mallamNameSeen40();}}
function mallamNameSeen40(){const r=MALLAM40.run;if(!r.namePend)return;r.namePend=0;const b=gistSave40(false);if(!b||b.once.mallamName)return;b.once.mallamName=S.day;mallamLog40('mallam','name');}
// (repair, H1; owner decision 3, "He hands over your sticks afterwards.") the kept order handed over: what the base round charges and gives
// ("You pay when you collect them": ₦2,000, a cheer and energy for both, its passTime, this sitting's round used), his kept line over him; a
// purse that cannot pay: the base round's own toast, no credit, the order still kept
function mallamCollect40(i){const M=MALLAM40,r=M.run,m=mallamRec40(false);if(!(r.phase==='after'||r.phase==='lit')||!mallamCollectable40(m))return;
 if(!(S.money>=2000)){try{if(typeof toast==='function')toast('Not enough in the purse');}catch(e){}return;}
 const k='suya'+S.day+(typeof slot==='function'?slot():'evening');try{spend(2000);}catch(e){S.money-=2000;}if(S.flags)S.flags[k]=true;
 try{for(const j of (typeof both==='function'?both():[0,1])){cheer(j,8);S.p[j].energy=clamp(S.p[j].energy+10,0,100);}}catch(e){}
 m.kept=S.day;mallamLog40('mallam','kept');
 try{if(typeof passTime==='function')passTime(0.3);}catch(e){}try{if(S.recent&&typeof S.recent.push==='function')S.recent.push('intimate');}catch(e){}
 // the flag watch counts this round as seen (no second line); the reminder is spent; past ten he stays while the line shows
 r.suya=mallamFlagsNow40();r.ready=1;r.linger=M.t+M.LINGER;
 if(M.world.fig)bubble40(mallamFill40(mallamLine40('kept'),{choice:M.UI.choice[m.order]||m.order}),4200,M.world.fig,2.1);
 mallamSave40();}
function mallamSay40(text){return `<div class="card say gist40-mallam-say"><span class="name">${esc(MALLAM40.UI.name)}</span>${esc(text)}</div>`;}
// the name line, once for the household (owner decision 4, "He says it once"), before his first line in a panel; (repair 3, R3-2) in a panel a
// touch Act opened it is spent only once that panel has been seen (mallamPanelWatch40), so a panel closed under a thumb still tapping keeps it
function mallamNamed40(){const b=gistSave40(false);if(!b)return '';if(b.once.mallamName)return '';
 if(mallamHeld40())MALLAM40.run.namePend=S.day;else{b.once.mallamName=S.day;mallamLog40('mallam','name');}return mallamSay40(mallamLine40('name'));}
function mallamOrderPanel40(i){const M=MALLAM40,U=M.UI;if(M.run.phase!=='morning'||mallamOverlay40())return;const named=mallamNamed40();   // (repair, H5) one panel: a same-frame second press opens nothing
 openPanel(`<section class="gist40-panel gist40-mallam"><p class="gist40-kicker">${esc(U.kicker)}</p><h2>${esc(U.name)}</h2>${named}${mallamSay40(mallamLine40('yaji'))}<p>${esc(U.orderText)}</p><div class="actions">${btn(esc(U.pepper),'mallam40Order',{v:'pepper'},'primary block')}${btn(esc(U.onion),'mallam40Order',{v:'onion'},'block')}${btn(esc(U.notToday),'mallam40Close',{},'quiet')}</div></section>`);}
function mallamTastePanel40(){const M=MALLAM40,U=M.UI,m=mallamRec40(false);if(!m||m.lit!=='fan'||m.tasted||mallamOverlay40())return;const named=mallamNamed40();M.run.tasteOpen=1;
 openPanel(`<section class="gist40-panel gist40-mallam"><p class="gist40-kicker">${esc(U.kicker)}</p><h2>${esc(U.name)}</h2>${named}${mallamSay40(mallamLine40('stick'))}<p>${esc(U.tasteText)}</p><div class="actions">${btn(esc(U.tasteBtn),'mallam40Taste',{},'primary block')}</div></section>`);}
if(MALLAM40.on&&typeof ACTIONS!=='undefined'){
 // the order: kept for the evening; no money now
 ACTIONS.mallam40Order=function(d){const M=MALLAM40,v=d&&d.v;if((v!=='pepper'&&v!=='onion')||M.run.phase!=='morning'){try{closePanel();}catch(e){}return;}const m=mallamRec40(true);if(!m)return;
  mallamNameSeen40();m.order=v;m.orderAt=Math.round(S.time*1e4)/1e4;try{closePanel();}catch(e){}mallamLog40('mallam','order '+v);mallamSave40();
  if(M.world.fig)bubble40(mallamFill40(mallamLine40('ordered'),{choice:M.UI.choice[v]}),3600,M.world.fig,1.7);};
 // the taste: a small cheer and energy for each player who fanned or turned; once an evening; no money changes hands
 ACTIONS.mallam40Taste=function(){const M=MALLAM40,m=mallamRec40(false);mallamNameSeen40();try{closePanel();}catch(e){}if(!m||m.lit!=='fan'||m.tasted)return;m.tasted=S.day;
  const who=[...new Set((m.fanned||[]).concat(m.turned||[]))];for(const j of who){try{cheer(j,M.TASTE.cheer);S.p[j].energy=clamp((S.p[j].energy||0)+M.TASTE.energy,0,100);}catch(e){}}
  mallamLog40('mallam','taste');try{if(typeof toast==='function')toast(M.UI.tasteToast);}catch(e){}mallamSave40();};
 ACTIONS.mallam40Close=function(){mallamNameSeen40();try{closePanel();}catch(e){}};
 if(typeof LOCAL_ONLY!=='undefined')for(const n of ['mallam40Taste','mallam40Order','mallam40Close'])LOCAL_ONLY.add(n);}

/* ======================================================================================================================================
   6. Wrappers: the tick, the hooks, the gist's start, the day, the world, a new household, the URL flag (spec §1.4, §1.5, §15)
   ====================================================================================================================================== */
if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.tick==='function'&&typeof BOARD40!=='undefined'&&MALLAM40.on){
 const prevEveTick40m=EVENING35.tick;EVENING35.tick=function(dt){const r=prevEveTick40m.apply(this,arguments);
  try{MALLAM40.step(dt);}catch(e){if(typeof console!=='undefined')console.warn('mallam40',e);}return r;};}
if(MALLAM40.on&&typeof HOTSPOT_HOOKS!=='undefined')HOTSPOT_HOOKS.push(mallamHot40);
if(MALLAM40.on&&typeof ACT_HOOKS!=='undefined')ACT_HOOKS.push(function(i,kind,arg){return mallamAct40(i,kind,arg);});
// a visit starts: he sits by his grill (or walks off) at once; (repair 4, R4-1) with an order waiting, the mark in his record
if(MALLAM40.on&&typeof gistStart38==='function'){const prevGistStart40=gistStart38;gistStart38=function(){const r=prevGistStart40.apply(this,arguments);
 try{if(r&&mallamEligible40())mallamGistOn40();}catch(e){if(typeof console!=='undefined')console.warn('mallam40',e);}
 try{if(MALLAM40.world.fig&&MALLAM40.world.fig.parent){MALLAM40.checkAt=0;mallamCheck40();}}catch(e){if(typeof console!=='undefined')console.warn('mallam40',e);}return r;};}
// the morning (Sleep): hidden; the day's memory reset
if(MALLAM40.on&&typeof ACTIONS!=='undefined'&&typeof ACTIONS.nextday==='function'){const prevNextday40m=ACTIONS.nextday;ACTIONS.nextday=function(){
 try{mallamHide40();mallamRunReset40();}catch(e){}const r=prevNextday40m.apply(this,arguments);try{if(MALLAM40.flags.now&&MALLAM40.flags.now<S.day)MALLAM40.flags.now=0;MALLAM40.checkAt=0;}catch(e){}return r;};}
function mallamFlags40(){const F=MALLAM40.flags;if(F.parsed)return F;
 try{const q=new URLSearchParams((typeof location!=='undefined'&&location.search)||'');const a=q.get('mallam');if(!a)return F;F.parsed=true;if(a==='now'){F.value='now';F.now=-1;}
  try{if(typeof sessionStorage!=='undefined')sessionStorage.setItem('gist40.flag.mallam-'+a,'1');}catch(e){}
  q.delete('mallam');try{if(typeof history!=='undefined'&&history.replaceState){const s=q.toString();history.replaceState(null,'',location.pathname+(s?'?'+s:'')+(location.hash||''));}}catch(e){}}catch(e){}
 return F;}
if(MALLAM40.on)mallamFlags40();
if(MALLAM40.on&&typeof enterWorld==='function'){const prevEnter40m=enterWorld;enterWorld=function(){try{mallamFlags40();mallamTeardown40();}catch(e){}
 const r=prevEnter40m.apply(this,arguments);try{const F=MALLAM40.flags;if(F.now===-1&&S&&S.p)F.now=S.day;MALLAM40.checkAt=0;}catch(e){}return r;};}
// (repair, H8) only the confirmed new household: the question itself ("No, keep it") changes nothing
if(MALLAM40.on&&typeof ACTIONS!=='undefined'){for(const n of ['newgame']){const prev=ACTIONS[n];if(typeof prev!=='function')continue;
 ACTIONS[n]=function(){try{mallamTeardown40();}catch(e){}return prev.apply(this,arguments);};}}

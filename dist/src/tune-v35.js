/* v35 tuning (plan section 4): a purse that says no, the day-2 seedling and ripen-on-water crop rule, a wall-clock bite with a nibble,
   one Act button while fishing, outdoor seats with a kept walkway and path to the pot, wall colour and floor, and the copy that must match
   the new rules. Loaded straight after bridge-v34b.js. Every behaviour change wraps an earlier global and calls it.
   Top-level names are only the public ones in the v35 spec (section 4); everything else lives in the blocks below. */

/* v35 shared core (owned by tune-v35.js). One stubbable wall clock and one cue bus. */
const CLOCK35={fn:null};                                   // harnesses set CLOCK35.fn=()=>T to drive time
function clock35(){return CLOCK35.fn?CLOCK35.fn():Date.now();}   // epoch ms
const CUE35_HOOKS=[];                                      // subscribers: (name,data)=>void
function cue35(name,data){if(typeof silentMode==='function'&&silentMode())return;
 for(const h of CUE35_HOOKS){try{h(name,data||{});}catch(e){if(typeof console!=='undefined')console.warn('cue35',name,e);}}}

/* Wall colours and floors, always on offer at Palm Court Finds (₦1,500–2,500). */
const PAINTS35=[
 {id:'indigo',kind:'wall',name:'Adire indigo',hex:'#6D8AB8',price:2500},     // a soft indigo limewash: still blue, not lilac, under the evening light, and well clear of
                                                                             // every top the wardrobe gives a player (#3F5B8E read as a flat royal blue, the tee's own colour)
 {id:'palm',kind:'wall',name:'Palm green',hex:'#A9BF9C',price:2000},
 {id:'ochre',kind:'wall',name:'Ochre limewash',hex:'#E6C98C',price:1500},
 {id:'terrazzo',kind:'floor',name:'Cream terrazzo',hex:'#DCCFB8',price:2500},
 {id:'teak',kind:'floor',name:'Teak brown',hex:'#8E6243',price:2000}];

const TUNE35={version:1,purse:6000,paints:PAINTS35,
 paintOf:id=>PAINTS35.find(p=>p.id===id)||null,
 flat:{walls:[],floor:null},
 // the six flat walls as buildWorld draws them: x1,x2,z1,z2,h (the colour argument is ignored)
 flatWalls:[[-8.25,-2.35,1.75,2.0,2.8],[-8.25,-8.0,1.75,5.85,2.8],[-2.6,-2.35,1.75,4.3,1.2],[-2.6,-2.35,5.5,5.85,1.2],[-8.0,-4.6,5.6,5.85,1.2],[-3.6,-2.35,5.6,5.85,1.2]],
 flatFloor:[5.4,3.6,-5.3,3.8],
 // kept clear: the veranda cell beside the pot, the veranda cell outside the door and the room cell just inside it (the only way out to the veranda)
 reserved:[[3,4,'the path to the pot'],[4,4,'the walkway'],[4,3,'the way to the veranda']],
 panelAt:0,seq:0,paintUndo:null,applied:null,shown:null,frame:null,harvestCard:false,
 fishActs:new Set(['lifeCast','lifeReel','lifeCatch','lifeFish']),
 copy:{approve:['That will look lovely in the flat.','Good choice. I can already see it there.','We needed that, you know.','Ehen! That is the one.','That one is correct. The flat will thank us.'],
  note:'A note from Tunde by the pot: plant it, water it, then we see.',refusePlant:'Tunde’s seedling arrives tomorrow morning.',
  harvestTitle:'Three red peppers',harvestBase:'Three peppers, into the pantry.',harvestNkechi:'Two are for Mama Nkechi’s pot.',harvestTunde:'Tunde will want to hear.',
  learnBeansdodo:'Mama Nkechi showed you, for one fresh fish.',kept:'Dashed spaces stay clear: the doorway and the way to your pot.'},
 copyFix:[
  ['Water it on Sundays.','Water it when the soil looks dry. It forgives a lot.'],
  ['jollof on Fridays','jollof every evening'],
  ['I come here on Thursdays.','I come here most afternoons.'],
  ['Compound meeting Sunday.','Compound meeting this week.'],
  ['Film night on Saturdays','Film night once a week'],
  ['Film night is Saturday.','Film night is coming.'],
  ['Film night next Saturday.','Film night soon.'],
  ['Cream with a sheen. Sunday, properly.','Cream with a sheen. For church and owambe.'],
  ['Sunday Housewarming','After-church Housewarming'],
  ['Sunday, properly','After church, properly']]};
// the base templates add a full stop after vibe(), which already ends with one (the night panel and the Menu)
TUNE35.fixVibe=function(s){if(typeof s!=='string'||s.indexOf('Home vibe:')<0)return s;return s.replace(/(Home vibe: <b>[^<]*\.)<\/b>\./g,'$1</b>').replace(/(Home vibe: [^<]*\.)\.(?=<)/g,'$1');};
TUNE35.fixCopy=function(s){if(typeof s!=='string'||s.indexOf('day')<0)return s;for(const [a,b] of TUNE35.copyFix)if(s.indexOf(a)>=0)s=s.split(a).join(b);return s;};
// Tunde has promised the seedling and it has not arrived yet
TUNE35.seedlingPending=function(){return !!(S&&S.born35&&!(S.life&&S.life.seed35)&&S.day<2);};
// planting is allowed: old households always, new ones once the seedling is here (from day 2 whatever happened)
TUNE35.seedlingReady=function(){return !(S&&S.born35)||!!(S.life&&S.life.seed35)||S.day>=2;};
// the seedling arrives (idempotent); the caller's save covers it
TUNE35.grantSeedling=function(){if(!S||!S.born35||(S.life&&S.life.seed35)||S.day<2)return false;life34().seed35={day:S.day};
 try{refreshGarden34();}catch(e){}remember(TUNE35.copy.note,'moment');return true;};
TUNE35.nibble=function(){const f=LIFE34.fish;return !!(f&&f.phase==='waiting'&&LIFE34.tab==='fish'&&f.biteAt-f.elapsed<=0.6);};
// the open panel is one of the fishing panels: the line (fishing34), the catch card (catch34) or the "Cast again" page after a decision
TUNE35.isFishPanel=function(){if(LIFE34.tab!=='fish')return false;const h=String(panel.innerHTML);return h.startsWith('<section class="life34">')&&/class="[^"]*\b(fishing34|catch34)\b|data-act="lifeFish"/.test(h);};

/* ---------- 4.4 Act presses the fishing panel's single primary button ---------- */
// pure parser: the one enabled primary button with a data-act in the html, with its data-* attributes as the panel click handler passes them
function panelPrimary35(html){html=html==null?String(panel.innerHTML||''):String(html);let one=null,n=0;
 for(const m of html.matchAll(/<button\b([^>]*)>/g)){const a=' '+m[1],cls=(a.match(/\sclass="([^"]*)"/)||[])[1]||'';
  if(!/(^|\s)primary(\s|$)/.test(cls)||/\sdisabled(?=[\s=>\/]|$)/.test(a)||!/\sdata-act="[^"]*"/.test(a))continue;n++;one=a;}
 if(n!==1)return null;const un=v=>v.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');const data={};
 for(const m of one.matchAll(/\sdata-([a-z0-9-]+)="([^"]*)"/g))data[m[1].replace(/-([a-z0-9])/g,(x,c)=>c.toUpperCase())]=un(m[2]);
 return data.act?{act:data.act,data}:null;}
// Act (E, Enter, touch Act, pad A) presses Cast, Reel in, Keep or Cast again on the fishing panel only, never within 300 ms of a panel change
function actPrimary35(){
 if(!S||S.phase!=='play'||!overlayOpen()||!TUNE35.isFishPanel()||clock35()-TUNE35.panelAt<300)return false;
 const ae=typeof document!=='undefined'?document.activeElement:null;if(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(String(ae.tagName||'').toUpperCase()))return false;
 const p=panelPrimary35();if(!p||!TUNE35.fishActs.has(p.act))return false;dispatch(p.act,p.data);return true;}

/* ---------- 4.6 Paint: recolour the tagged flat boxes from S.home.wall / S.home.floor ---------- */
function applyPaint35(){const f=TUNE35.flat;if(!f||(!f.walls.length&&!f.floor))return;
 const h=(S&&S.home)||{},pick=(id,kind)=>{const p=TUNE35.paintOf(id);return p&&p.kind===kind?p:null;};
 const wp=pick(h.wall,'wall'),fp=pick(h.floor,'floor'),key=(wp?wp.id:'')+'|'+(fp?fp.id:'');
 const ok=(list,p)=>list.every(m=>!m||!!(m.userData.paint35Own)===!!p&&(!p||m.userData.paint35Id===p.id));
 const floors=f.floor?[f.floor]:[];if(key===TUNE35.applied&&ok(f.walls,wp)&&ok(floors,fp))return;
 const paintMesh=(m,p)=>{if(!m)return;const u=m.userData;
  if(p){if(u.paint35Own&&u.paint35Id===p.id)return;if(!u.paint35Own)u.paint35Base=m.material;else if(m.material&&m.material!==u.paint35Base&&m.material.dispose)m.material.dispose();
   const c=u.paint35Base.clone();if(c.color)c.color.set(p.hex);if(typeof FADEABLE!=='undefined'&&FADEABLE.includes(m))c.transparent=true;m.material=c;u.paint35Own=true;u.paint35Id=p.id;}
  else if(u.paint35Own){if(m.material&&m.material!==u.paint35Base&&m.material.dispose)m.material.dispose();m.material=u.paint35Base;delete u.paint35Base;delete u.paint35Id;u.paint35Own=false;}};
 f.walls.forEach(m=>paintMesh(m,wp));floors.forEach(m=>paintMesh(m,fp));TUNE35.applied=key;}

{
 const silent=()=>typeof silentMode==='function'&&silentMode();

 /* ---------- 4.1 Purse: new households start with ₦6,000 ---------- */
 for(const n of ['newgame','aiStart','nethost']){const prev=ACTIONS[n];if(typeof prev!=='function')continue;
  // wrap: a household created here (not by newState alone, which harnesses and the wardrobe prefetch use) gets the v35 purse and the seedling rule
  ACTIONS[n]=function(){const s0=S;const r=prev.apply(this,arguments);if(S&&S!==s0){S.money=TUNE35.purse;S.born35=true;}return r;};}
 const shopPrev=aiShoppingItem;
 // wrap: during the guided shop stage a new household's companion buys any jollof item it can afford (the old ₦6,000 floor would stop after one)
 aiShoppingItem=function(){
  if(S&&S.born35&&typeof guided33==='function'&&guided33()&&evening33().stage==='shop'){if(S.time<8||S.time>=19)return null;
   for(const k of RECIPES.jollof.needs){if(haveCount(k)||AI.bought.includes(k))continue;const st=STALLS.find(s=>s.items.includes(k));if(!st)continue;
    const it=S.mkt&&S.mkt.items&&S.mkt.items[k],price=it?Math.round(it.price*(1-((S.mkt.disc&&S.mkt.disc[st.id])||0))/50)*50:ING[k].price;if(S.money>=price)return {k,st};}
   return null;}
  return shopPrev.apply(this,arguments);};

 /* ---------- 4.2 The crop: the seedling arrives on day 2; watering a stage-2 plant ripens it ---------- */
 const nextPrev=ACTIONS.nextday;
 // wrap: the new day brings Tunde's seedling; a Today page life already opened is re-rendered so it shows it (no other panel is opened)
 ACTIONS.nextday=function(){const d0=S&&S.day;const r=nextPrev.apply(this,arguments);
  if(S&&S.day!==d0&&TUNE35.grantSeedling()&&!silent()&&String(panel.innerHTML).startsWith('<section class="life34">'))openLife34('today');return r;};
 const contPrev=ACTIONS.continue;
 // wrap: a new household's save that reached day 2 without the seedling gets it on load (no panel, no toast)
 ACTIONS.continue=function(){const r=contPrev.apply(this,arguments);try{if(S&&S.phase==='play')TUNE35.grantSeedling();}catch(e){}return r;};
 const plantPrev=ACTIONS.lifePlant;
 // wrap: grant a due seedling first; before it arrives, planting is refused with one short toast
 ACTIONS.lifePlant=function(){if(S&&S.p)TUNE35.grantSeedling();if(!TUNE35.seedlingReady()){if(!silent())toast(TUNE35.copy.refusePlant);return;}return plantPrev.apply(this,arguments);};
 const waterPrev=ACTIONS.lifeWater;
 // wrap: watering a stage-2 plant ripens it on the spot; only a successful watering emits the water cue
 ACTIONS.lifeWater=function(){const c=life34()&&life34().crop;const st=c?c.stage:0,wd=c?c.wateredDay:0;const r=waterPrev.apply(this,arguments);
  if(c&&c.wateredDay===S.day&&wd!==S.day){if(st===2){c.stage=3;refreshGarden34();save();if(!silent())openLife34('garden');}cue35('water',{stage:c.stage});
   if(c.stage<3)clearMark35('garden');}return r;};      // watered and not ripe: nothing more to do at the pot today
 const harvestPrev=ACTIONS.lifeHarvest;
 // wrap: a harvest gets its own card on the Garden page (instead of the reset plant under a toast), and the pot marker has done its job
 ACTIONS.lifeHarvest=function(){const c=life34()&&life34().crop,n=c?c.harvests:0;if(silent())return harvestPrev.apply(this,arguments);
  const tp=toast;TUNE35.harvestCard=true;toast=function(m){if(m==='Three red peppers, into the pantry.')return;return tp.apply(this,arguments);};
  let r;try{r=harvestPrev.apply(this,arguments);}finally{toast=tp;TUNE35.harvestCard=false;}if(c&&c.harvests>n)clearMark35('garden');return r;};
 const gardenMeshPrev=refreshGarden34;
 // wrap: once the seedling has arrived and is not yet planted, a nursery bag with two leaves and Tunde's folded note sit by the pot
 refreshGarden34=function(){const r=gardenMeshPrev.apply(this,arguments);const g=LIFE34.garden,l=S&&S.life;
  // (on the soil, not on the stand beside it: from the default camera the veranda wall hides everything below the pot's rim)
  if(g&&l&&l.seed35&&l.crop&&l.crop.stage===0){mesh34(g,new THREE.CylinderGeometry(.07,.06,.12,10),'#3B3A33',.05,.43,.05);
   leaf34(g,.02,.53,.05,.09,.5);leaf34(g,.09,.55,.04,.08,-.6);box34(g,.13,.012,.09,'#F6EEDA',-.11,.385,.09).rotation.y=.4;}
  // stage 2 reads at phone size: fuller leaves and white pepper flowers at the top (stage 1 has neither)
  if(g&&l&&l.crop&&l.crop.stage===2){for(const m of g.children)if(m.scale&&Math.abs(m.scale.y-.018)<1e-6){m.scale.x*=1.3;m.scale.z*=1.3;}
   for(const [x,y,z] of [[-.07,.84,.04],[.06,.88,.02],[.0,.93,-.03],[.1,.79,.05]]){mesh34(g,new THREE.SphereGeometry(.034,8,6),'#F7F2E4',x,y,z);mesh34(g,new THREE.SphereGeometry(.013,6,4),'#E3B23C',x,y+.022,z);}}
  return r;};

 /* ---------- 4.3 Wall-clock bite, nibble and cues ---------- */
 const castPrev=ACTIONS.lifeCast;
 // wrap: a cast that went out starts the wall clock for its bite and emits the cast cue
 ACTIONS.lifeCast=function(){const f0=LIFE34.fish,ph=f0&&f0.phase;const r=castPrev.apply(this,arguments);const f=LIFE34.fish;
  if(f&&ph==='ready'&&f.phase==='waiting'){f.wall35=clock35();f.nib35=false;cue35('cast');}return r;};
 const tickPrev=tickFishing34;
 // wrap: the wait counts real seconds (the larger of the clamped dt and the wall delta, capped), so a slow phone cannot stretch it; nibble and bite cues
 tickFishing34=function(dt){const f=LIFE34.fish;
  if(!(f&&f.phase==='waiting'&&LIFE34.tab==='fish')){if(f)f.wall35=null;return tickPrev.apply(this,arguments);}
  const now=clock35(),w=f.wall35==null?0:Math.min(Math.max(0,(now-f.wall35)/1000),0.5);f.wall35=now;
  const base=Math.min(dt,.1);f.elapsed+=Math.max(base,w)-base;
  const r=tickPrev.apply(this,arguments);
  if(LIFE34.fish===f&&f.phase==='waiting'&&!f.nib35&&f.biteAt-f.elapsed<=0.6){f.nib35=true;cue35('nibble');
   const el=panel.querySelector&&panel.querySelector('.fishing34');if(el&&el.classList)el.classList.add('nibble35');}
  if(f.phase==='bite')cue35('bite');return r;};
 const reelPrev=ACTIONS.lifeReel;
 // wrap: a reel that records a catch emits the catch cue once
 ACTIONS.lifeReel=function(){const had=!!(life34()&&life34().catch);const r=reelPrev.apply(this,arguments);const c=life34()&&life34().catch;if(!had&&c)cue35('catch',{id:c.id});return r;};

 /* ---------- Directions marker: done jobs clear it; the distance is the human's ---------- */
 // clear the marker when it points at the pot ('garden') or at a neighbour (their key) and that job is done
 function clearMark35(what){const w=LIFE34.waypoint;if(!w||silent())return;
  const hit=what==='garden'?(w.x===-5.6&&w.z===6.35):!!(CAST[what]&&w.name===CAST[what].name);if(!hit)return;LIFE34.waypoint=null;if(typeof refreshMarker34==='function')refreshMarker34();}
 TUNE35.clearMark=clearMark35;
 const requestPrev=ACTIONS.lifeRequest;
 // wrap: a finished request clears that neighbour's marker
 ACTIONS.lifeRequest=function(d){const k=d&&d.k,ok=!!(k&&REQUESTS34[k]),st=ok?request34(k).stage:0;const r=requestPrev.apply(this,arguments);if(ok&&request34(k).stage>st)clearMark35(k);return r;};
 // the chip's distance counts human players only (life-world measures from the nearest player, the companion included)
 let guideEl=null;
 const guideTick=()=>{const w=LIFE34.waypoint;if(!w)return;if(!guideEl)guideEl=typeof document!=='undefined'&&document.getElementById?document.getElementById('life-guide34'):null;
  if(!guideEl||!guideEl.style||guideEl.style.display==='none'||!guideEl.querySelector)return;const span=guideEl.querySelector('span');if(!span)return;
  let d=1e9;for(const p of players){if(!p||(typeof AI!=='undefined'&&AI.on&&p.i===AI.i))continue;d=Math.min(d,Math.hypot(p.g.position.x-w.x,p.g.position.z-w.z));}if(d===1e9)return;
  const want=d<2?'You’re here. Use Act.':Math.ceil(d)+' m away',h=span.innerHTML;if(h.indexOf(want)>=0)return;const n=h.replace(/You’re here\. Use Act\.|\d+ m away/,want);if(n!==h)span.innerHTML=n;};

 /* ---------- 4.4 Act: panel stamps, keyboard, touch, pad ---------- */
 const openPrev=openPanel;
 // wrap: stamp the panel change for Act's 300 ms guard (synchronously) and take weekday prose out of every panel
 openPanel=function(html){if(!silent()){TUNE35.panelAt=clock35();TUNE35.seq++;}return openPrev.call(this,TUNE35.fixCopy(TUNE35.fixVibe(html)));};
 const closePrev=closePanel;
 // wrap: closing a panel is a panel change too
 closePanel=function(){if(!silent()){TUNE35.panelAt=clock35();TUNE35.seq++;
   // "See it in the room" (or any close) right after placing a piece: the camera fit includes it for 2.5 s
   const sh=TUNE35.shown;if(sh&&LIFE34.tab==='home'&&clock35()-sh.at<120000&&S&&S.home.items.some(x=>x.id===sh.id))TUNE35.frame={id:sh.id,until:clock35()+2500};TUNE35.shown=null;}
  return closePrev.apply(this,arguments);};
 if(typeof window!=='undefined'&&window.addEventListener)window.addEventListener('keydown',e=>{
  if(!e||e.repeat||!(e.key==='e'||e.key==='E'||e.key==='Enter'))return;if(!overlayOpen())return;
  if(e.key==='Enter'){const ae=document.activeElement;if(ae&&(ae.tagName==='BUTTON'||ae.tagName==='A')&&panel.contains&&panel.contains(ae))return;}
  if(actPrimary35()&&e.preventDefault)e.preventDefault();});
 const touchPrev=setupTouch;
 // wrap: after the base Act listeners exist, add ours on the same buttons so they run after them; a press that worked the fishing panel queues no world Act (actPrimary35)
 setupTouch=function(){const r=touchPrev.apply(this,arguments);
  for(const id of ['actl','actr']){const b=document.getElementById(id);if(b&&b.addEventListener)b.addEventListener('pointerdown',()=>{if(overlayOpen()&&actPrimary35()){act[0]=act[1]=false;}});}
  return r;};
 const fishPrev=ACTIONS.lifeFish;
 // wrap: "Cast again" on the page after a catch casts straight away (one press per cast, not two); from the world it opens the line as before
 ACTIONS.lifeFish=function(){const again=!silent()&&!LIFE34.fish&&!(life34()&&life34().catch)&&TUNE35.isFishPanel();const r=fishPrev.apply(this,arguments);
  if(again&&LIFE34.fish&&LIFE34.fish.phase==='ready')ACTIONS.lifeCast();return r;};
 let fishSeq=-1,fishTab=null,fishShown=false,bodyFish=false,padDown=false;
 const fishPanelNow=()=>{if(!overlayOpen()){fishShown=false;fishSeq=-1;return false;}if(TUNE35.seq!==fishSeq||LIFE34.tab!==fishTab){fishSeq=TUNE35.seq;fishTab=LIFE34.tab;fishShown=TUNE35.isFishPanel();}return fishShown;};
 // twitch the world float before the bite (after life-world's and the bridge's bob updates), lift touch Act over the fishing sheet, read the pad's A button
 TICK_HOOKS.push(function tune_tick35(){if(!S||S.phase!=='play')return;
  const g=LIFE34.fishingWorld,bob=g&&g.userData.bob;
  if(bob&&TUNE35.nibble()){const t=clock35()/1000;bob.position.y=.12-.035*Math.abs(Math.sin(t*26));const ring=g.userData.ring;if(ring)ring.scale.setScalar(1+.15*Math.sin(t*26));}
  const fishNow=fishPanelNow();
  if(fishNow!==bodyFish){bodyFish=fishNow;if(document.body&&document.body.classList)document.body.classList.toggle('fishact35',fishNow);}
  guideTick();
  if(fishNow&&typeof navigator!=='undefined'&&navigator.getGamepads){let down=false;try{const pads=navigator.getGamepads()||[];for(let k=0;k<pads.length;k++){const p=pads[k];if(p&&p.buttons&&p.buttons[0]&&p.buttons[0].pressed){down=true;break;}}}catch(e){}
   if(down&&!padDown)actPrimary35();padDown=down;}else padDown=false;});

 /* ---------- 4.5 Outdoor seats; the walkway and the path to the pot stay clear ---------- */
 ITEMS.armchair.outdoor=true;ITEMS.chairs.outdoor=true;
 const fitsPrev=fitsHome34;
 // wrap: the armchair and chairs may stand on the veranda row; no new piece may cover the walkway (column 4) or the path to the pot (column 3)
 fitsHome34=function(type,x,y,rot=0,ignore){const d=ITEMS[type];let ok;
  if(d&&d.outdoor&&!d.anywhere&&y===FLAT.rows){d.anywhere=true;try{ok=fitsPrev.call(this,type,x,y,rot,ignore);}finally{delete d.anywhere;}}else ok=fitsPrev.call(this,type,x,y,rot,ignore);
  if(!ok)return false;const fp=footprint34(type,rot),R=TUNE35.reserved;for(let k=0;k<R.length;k++){const rx=R[k][0],ry=R[k][1];if(rx>=x&&rx<x+fp[0]&&ry>=y&&ry<y+fp[1])return false;}return true;};

 /* ---------- 4.5 Veranda reach: no placement, move or turn may shut the pot or the walkway off on foot from inside the flat ---------- */
 // A breadth-first walk over blocked() at the player's radius, on a 0.1 m grid aligned with the cell centres, from the room cell just inside
 // the veranda door (always kept clear, so it is inside the flat). It runs only when a placement, move or turn is tried, never per frame.
 // Only the pepper pot and the walkway outside the door count: a free veranda cell may be cut off (an armchair beside the pot may close the
 // far end of the row, as Tunde's line and the day-2 beat have it). A change is refused only if it shuts off one of those two that was
 // reachable before it, so a layout already saved stays as it is and can still be decorated (nothing is moved for the player).
 TUNE35.copy.blockWay='That would block the way along the veranda.';
 TUNE35.reachRuns=0;
 const RG={x0:-8.15,z0:4.8,nx:59,nz:23};               // x -8.15..-2.35, z 4.8..7.0: the front row of the room and the veranda, inside their walls
                                                       // (the veranda opens only through the door above the start, so deeper room never helps)
 const gi=x=>Math.round((x-RG.x0)*10),gj=z=>Math.round((z-RG.z0)*10);
 // the furniture boxes a layout would give (the same boxes life's rebuildFurniture makes), without building any meshes
 const boxesFor=items=>{const out=[],c=FLAT.cell;for(const it of items){const d=ITEMS[it.type];if(!d||d.flat||d.wall)continue;const [w,h]=footprint34(it.type,it.rot||0),[cx,cz]=cellToWorld(it.x,it.y);
   const v=it.y===FLAT.rows,wx=cx+(w-1)*c/2,wz=v?cz:cz+(h-1)*c/2;out.push({x1:wx-w*c/2+.1,x2:wx+w*c/2-.1,z1:wz-(v?.4:h*c/2-.1),z2:wz+(v?.4:h*c/2-.1),tag:'furn'});}return out;};
 // the targets a layout cannot reach on foot: 'pot' for the pepper pot, 'walk' for the walkway cell outside the veranda door
 TUNE35.reach=function(items){TUNE35.reachRuns++;items=items||(S&&S.home&&S.home.items)||[];
  const pot=typeof BRIDGE34B!=='undefined'?BRIDGE34B.potCell:[2,FLAT.rows],walk=(TUNE35.reserved.find(r=>r[2]==='the walkway')||[4,FLAT.rows]);
  const tg=[['pot',pot[0]],['walk',walk[0]]].map(([k,x])=>{const [wx,wz]=cellToWorld(x,FLAT.rows);return {k,n:gi(wx)*RG.nz+gj(wz)};});
  const keep=FURN_OBS,seen=new Uint8Array(RG.nx*RG.nz),q=new Int32Array(RG.nx*RG.nz);FURN_OBS=boxesFor(items);
  try{const s=cellToWorld(4,3),si=gi(s[0]),sj=gj(s[1]+.05),free=(i,j)=>!blocked(RG.x0+i/10,RG.z0+j/10,PR,{noCrate:true,noSofa:true});
   if(!free(si,sj))return [];                           // nowhere to start from (never in a real flat): refuse nothing
   let head=0,tail=0,left=tg.length;q[tail++]=si*RG.nz+sj;seen[si*RG.nz+sj]=1;
   while(head<tail&&left>0){const n=q[head++],i=(n/RG.nz)|0,j=n-i*RG.nz;for(const t of tg)if(t.n===n&&!t.hit){t.hit=true;left--;}
    for(const [a,b] of [[i+1,j],[i-1,j],[i,j+1],[i,j-1]]){if(a<0||b<0||a>=RG.nx||b>=RG.nz)continue;const m=a*RG.nz+b;if(seen[m])continue;seen[m]=1;if(free(a,b))q[tail++]=m;}}}
  finally{FURN_OBS=keep;}
  return tg.filter(t=>!t.hit).map(t=>t.k);};
 // would this layout shut off the pot or the walkway that the current layout reaches?
 TUNE35.shutsWay=function(after){const a=TUNE35.reach(after);if(!a.length)return false;const b=TUNE35.reach(S.home.items);return a.some(k=>!b.includes(k));};
 const refuseWay=()=>toast(TUNE35.copy.blockWay);
 // a placement from storage on the Home page, exactly as life's lifeCell would make it
 const cellShuts=d=>{if(!S||!S.home||!d||typeof home34!=='function'||!home34())return false;if(typeof validSel34b==='function')validSel34b();const ix=LIFE34.selection;if(ix===null||ix===undefined)return false;
  const t=S.home.storage[ix],x=Number(d.x),y=Number(d.y),r=LIFE34.rotation||0;if(!t||!ITEMS[t]||!fitsEditor34(t,x,y,r)||(ITEMS[t].replaces&&placed(t)))return false;
  return TUNE35.shutsWay(S.home.items.filter(it=>!ITEMS[t].replaces||it.type!==ITEMS[t].replaces).concat([{id:'reach35',type:t,x,y,rot:r}]));};
 const selectPrev=ACTIONS.lifeSelect;
 // wrap: choosing another stored piece (say after a refusal) really chooses it; the bridge's follow-the-item rule otherwise put the earlier
 // choice back while the Home page redrew, until that piece was placed
 ACTIONS.lifeSelect=function(d){const i=Number(d&&d.ix);if(S&&S.home&&Number.isInteger(i)&&S.home.storage[i]&&typeof home34==='function'&&home34())LIFE34.selType34b=S.home.storage[i];
  return selectPrev.apply(this,arguments);};
 const cellPrev=ACTIONS.lifeCell;
 // wrap: a placement that would shut the pot or the walkway off on foot is refused with one line; a piece newly placed from the Home page
 // is remembered, so closing the page can frame it (closePanel above)
 ACTIONS.lifeCell=function(d){if(!silent()&&cellShuts(d)){refuseWay();return;}
  const ids=S&&S.home?new Set(S.home.items.map(x=>x.id)):null;const r=cellPrev.apply(this,arguments);
  if(ids&&!silent())for(const it of S.home.items)if(!ids.has(it.id))TUNE35.shown={id:it.id,at:clock35()};return r;};
 const rotatePrev=ACTIONS.lifeRotate;
 // wrap: turning a placed piece is refused (one line) if the turned piece would shut the pot or the walkway off on foot
 ACTIONS.lifeRotate=function(){if(!silent()&&S&&S.home&&typeof home34==='function'&&home34()){if(typeof validSel34b==='function')validSel34b();
   const it=LIFE34.selection===null||LIFE34.selection===undefined?S.home.items.find(x=>x.id===LIFE34.selectedItem):null;
   if(it&&ITEMS[it.type]&&!ITEMS[it.type].wall){const r=((it.rot||0)+1)%4;if(fitsEditor34(it.type,it.x,it.y,r,it.id)&&TUNE35.shutsWay(S.home.items.map(x=>x===it?Object.assign({},x,{rot:r}):x))){refuseWay();return;}}}
  return rotatePrev.apply(this,arguments);};
 if(typeof placeGhost==='function'){const ghostPrev=placeGhost;
  // wrap: a piece carried with Build (bought, from storage or picked up to move it) is not put down where it would shut the pot or the walkway
  // off on foot; the piece stays in hand so it can go elsewhere (the per-frame ghost check is untouched)
  placeGhost=function(i){const gh=ghosts[i];
   if(gh&&gh.ok&&!silent()&&S&&S.home&&ITEMS[gh.type]){const d=ITEMS[gh.type],rep=gh.buy&&d.replaces;
    if(TUNE35.shutsWay(S.home.items.filter(it=>!rep||it.type!==rep).concat([{id:'reach35',type:gh.type,x:gh.cell[0],y:gh.cell[1],rot:0}]))){refuseWay();return;}}
   return ghostPrev.apply(this,arguments);};}
 if(typeof v21InteractionPoints==='function'){const FB=[];for(let k=0;k<8;k++)FB.push(new THREE.Vector3());const ptsPrev=v21InteractionPoints;
  // wrap: while a just-placed piece is being shown, the human view's camera fit includes its box
  v21InteractionPoints=function(i){const pts=ptsPrev.apply(this,arguments);const f=TUNE35.frame;if(!f||!Array.isArray(pts))return pts;
   if(clock35()>=f.until){TUNE35.frame=null;return pts;}if(typeof AI!=='undefined'&&AI.on&&i===AI.i)return pts;
   const it=S&&S.home&&S.home.items.find(x=>x.id===f.id);if(!it){TUNE35.frame=null;return pts;}
   const fp=footprint34(it.type,it.rot||0),a=cellToWorld(it.x,it.y),half=FLAT.cell/2,x0=a[0]-half,z0=a[1]-half,x1=x0+fp[0]*FLAT.cell,z1=z0+fp[1]*FLAT.cell;let k=0;
   for(const x of [x0,x1])for(const y of [0,1.1])for(const z of [z0,z1])pts.push(FB[k++].set(x,y,z));return pts;};}

 /* ---------- 4.6 Paint: tag the flat's boxes as they are made ---------- */
 let building=false;
 const near=(a,b)=>Math.abs(a-b)<0.001;
 const worldPrev=buildWorld;
 // wrap: note the six flat walls and the flat floor while the world is built, then paint them
 buildWorld=function(){TUNE35.flat={walls:[],floor:null};TUNE35.applied=null;building=true;let r;try{r=worldPrev.apply(this,arguments);}finally{building=false;}try{applyPaint35();}catch(e){}return r;};
 const wallPrev=wall;
 // wrap: a flat wall made during buildWorld is remembered (the mesh returned is the final, bevelled one)
 wall=function(x1,x2,z1,z2,h){const m=wallPrev.apply(this,arguments);if(building&&m&&TUNE35.flatWalls.some(v=>near(v[0],x1)&&near(v[1],x2)&&near(v[2],z1)&&near(v[3],z2)&&near(v[4],h))&&!TUNE35.flat.walls.includes(m))TUNE35.flat.walls.push(m);return m;};
 const slabPrev=slab;
 // wrap: the flat's floor slab made during buildWorld is remembered (the veranda slab is not)
 slab=function(w,d,c,x,z){const m=slabPrev.apply(this,arguments);const F=TUNE35.flatFloor;if(building&&m&&near(w,F[0])&&near(d,F[1])&&near(x,F[2])&&near(z,F[3]))TUNE35.flat.floor=m;return m;};
 const enterPrev=enterWorld;
 // wrap: entering the world (new game, Continue) shows the household's paint
 enterWorld=function(){const r=enterPrev.apply(this,arguments);try{applyPaint35();}catch(e){}return r;};
 const syncPrev=syncWorld;
 // wrap: an online state sync re-applies paint whatever the sync decided (its signature ignores paint; applyPaint35 is a no-op when nothing changed)
 syncWorld=function(){const r=syncPrev.apply(this,arguments);try{applyPaint35();}catch(e){}return r;};
 if(typeof envApplyMaterials==='function'){const envPrev=envApplyMaterials;
  // wrap: hand env its own material back before it swaps materials (so it disposes only its own clone), then paint over the new one
  envApplyMaterials=function(){const f=TUNE35.flat,all=f.walls.concat(f.floor?[f.floor]:[]);
   for(const m of all){const u=m&&m.userData;if(!u||!u.paint35Own)continue;if(m.material&&m.material!==u.paint35Base&&m.material.dispose)m.material.dispose();m.material=u.paint35Base;delete u.paint35Base;delete u.paint35Id;u.paint35Own=false;}
   TUNE35.applied=null;const r=envPrev.apply(this,arguments);try{applyPaint35();}catch(e){}return r;};}
 const ownsPaint=id=>!!(S.home.paints&&S.home.paints.includes(id));
 // buy a paint at the stall (shared: money and home)
 ACTIONS.buyPaint35=function(d){const id=d&&d.id;if(!market34()){navigate34('market');return;}const p=TUNE35.paintOf(id);
  if(!p||ownsPaint(id)||S.money<p.price)return;spend(p.price);(S.home.paints||(S.home.paints=[])).push(id);LIFE34.undo=null;save();
  if(!silent()){openLife34('market');toast(p.name+' is yours. Change the walls and floor from Home.'+approveLine(id));}};
 // paint the walls or the floor at home: an owned paint, or 'wall:base' / 'floor:base' for the original (shared)
 ACTIONS.paint35=function(d){const id=d&&d.id;if(!home34())return;let kind,val;
  if(id==='wall:base'||id==='floor:base'){kind=id.slice(0,id.indexOf(':'));val='';}
  else{const p=TUNE35.paintOf(id);if(!p||!ownsPaint(id))return;kind=p.kind;val=id;}
  const before={wall:S.home.wall||'',floor:S.home.floor||''};if(before[kind]===val){if(!silent())openLife34('home');return;}
  TUNE35.paintUndo=silent()?null:before;if(val)S.home[kind]=val;else delete S.home[kind];applyPaint35();save();if(!silent())openLife34('home');};
 // undo the last paint with the values to restore, so both devices agree (shared)
 ACTIONS.paintUndo35=function(d){d=d||{};const okv=(v,kind)=>v===''||(ownsPaint(v)&&TUNE35.paintOf(v)&&TUNE35.paintOf(v).kind===kind);
  const w=d.wall==null?'':String(d.wall),f=d.floor==null?'':String(d.floor);if(!okv(w,'wall')||!okv(f,'floor'))return;
  if(w)S.home.wall=w;else delete S.home.wall;if(f)S.home.floor=f;else delete S.home.floor;applyPaint35();save();TUNE35.paintUndo=null;if(!silent())openLife34('home');};
 const KEEP_UNDO=new Set(['paint35','paintUndo35','lifeTab','close','lifeSelect','lifeCancel']);
 const dispatchPrev=dispatch;
 // wrap: any other action ends the paint undo, as life's dispatch does for furniture
 dispatch=function(name){if(!KEEP_UNDO.has(name))TUNE35.paintUndo=null;return dispatchPrev.apply(this,arguments);};

 /* ---------- 4.8 Finds never asks for agreement; the companion approves ---------- */
 const approveLine=id=>{if(!(typeof AI!=='undefined'&&AI.on&&S.p[AI.i]))return '';const a=players[AI.i],h=players.find(p=>p&&p.i!==AI.i);
  if(a&&h&&Math.hypot(a.g.position.x-h.g.position.x,a.g.position.z-h.g.position.z)>6)return '';     // across town, the companion says nothing
  const L=TUNE35.copy.approve;let n=0;for(const ch of String(id))n=(n*31+ch.charCodeAt(0))>>>0;return ' '+(pname(AI.i)||'Your companion')+': “'+L[n%L.length]+'”';};
 const buyPrev=ACTIONS.lifeBuy;
 // wrap: after a Finds purchase in a companion household, the companion says one approving line in the toast
 ACTIONS.lifeBuy=function(d){const t=d&&d.t,key=S.day+':'+t,l=life34(),had=!!(l&&l.orders[key]);const line=silent()?'':approveLine(t);let r;
  if(line&&ITEMS[t]){const tp=toast,base=ITEMS[t].name+' is in Build storage.';toast=function(m){if(m===base)return;return tp.apply(this,arguments);};   // said once, below, with the line
   try{r=buyPrev.apply(this,arguments);}finally{toast=tp;}}else r=buyPrev.apply(this,arguments);
  if(!had&&l&&l.orders[key]&&line)toast(ITEMS[t].name+' is in Build storage.'+line);return r;};

 /* ---------- 4.7 Copy that matches the new rules ---------- */
 if(typeof PLANS33!=='undefined'){
  PLANS33.recipe.detail='Tomorrow morning, find Mama Nkechi at her shop on Market Road. She has a use for a fresh fish, and a recipe to go with it.';
  PLANS33.photo.detail='Tomorrow morning, Ada will want to hear what you make of the flat. Mr. Bassey’s advice: put your favourite piece where the afternoon light falls.';
  PLANS33.garden.detail='Tomorrow morning, look in the pot on your veranda. Tunde said he would leave something there.';}
 if(RECIPES.beansdodo){const learn=RECIPES.beansdodo.learn;
  // a new household learns beans and dodo from Mama Nkechi's fish request, not at the community kitchen
  Object.defineProperty(RECIPES.beansdodo,'learn',{configurable:true,enumerable:true,get(){return S&&S.born35?TUNE35.copy.learnBeansdodo:learn;}});}
 Object.defineProperty(REQUESTS34.tunde[0],'text',{configurable:true,enumerable:true,get(){return TUNE35.seedlingPending()?'Your veranda pot is empty for now. Tomorrow morning I will leave you a seedling. Then we see.':'I left a seedling by your pot. Plant it, give it water. Tomorrow we see.';}});
 const gardenPagePrev=gardenHTML34;
 // wrap: the garden page follows the day-2 seedling and the ripen-on-water rule; it never says "two watered nights"
 const harvestCard=()=>{const C=TUNE35.copy,nk=request34('nkechi'),tu=request34('tunde'),nkDue=nk.stage===1&&nk.lastDay!==S.day,tuDue=tu.stage===1&&tu.lastDay!==S.day;
  const say=[C.harvestBase,nkDue?C.harvestNkechi:'',tuDue?C.harvestTunde:''].filter(Boolean).join(' ');
  const b=(nkDue?btn('Find Mama Nkechi','lifeGo',{v:'nkechi'},'primary'):'')+(tuDue?btn('Find Tunde','lifeGo',{v:'tunde'},nkDue?'quiet':'primary'):'');
  return `<div class="life-note34 harvest35"><p class="life-kicker">FROM YOUR VERANDA</p><h3>${esc(C.harvestTitle)}</h3><div class="harvest35-icons" aria-hidden="true">${pepperIcon34()}${pepperIcon34()}${pepperIcon34()}</div><p>${esc(say)}</p>${b}</div>`;};
 gardenHTML34=function(){let h=gardenPagePrev.apply(this,arguments);const c=life34().crop;
  if(TUNE35.harvestCard)h=harvestCard()+h;
  if(c.stage===0&&TUNE35.seedlingPending()){h=h.replace('Tunde has left a seedling. The pot, soil and first plant are a welcome gift.','An empty pot, for now. Tunde said he would leave something in it tomorrow morning.')
    .replace(btn('Plant the seedling','lifePlant',{},'primary'),'<span class="life-pill34">Waiting for Tunde’s seedling</span>');}
  else if(c.stage===0&&S.life.seed35)h=h.replace('Tunde has left a seedling. The pot, soil and first plant are a welcome gift.','Tunde has left a seedling and a note by the pot. Plant it whenever you like.');
  return h.replace('A little water today means new growth tomorrow. It needs two watered nights to fruit.',c.stage===2?'Water it today and the peppers will ripen.':'A little water today and it will be taller by morning.');};
 const todayPrev=todayHTML34;
 // wrap: Today's crop lines follow the new rule; the seedling card says the pot is empty until Tunde's seedling arrives
 todayHTML34=function(){let h=todayPrev.apply(this,arguments);const l=life34(),age=S.day-l.startDay;
  h=h.replace('With two watered nights, the first peppers are ready.','The first peppers are ready to pick.');
  if(l.crop.stage===2&&age>=2)h=h.replace('The pepper plant is growing at its own pace. A little water, a walk by the water, a new corner for something you love.','The pepper plant is taller this morning. Water it today and the peppers will ripen.');
  if(TUNE35.seedlingPending())h=h.replace('<b>A seedling from Tunde</b>','<b>An empty pot, for now</b>');return h;};
 const almanacPrev=almanacHTML34;
 // wrap: the almanac keeps Mama Nkechi's recipes beside the fish and peppers
 almanacHTML34=function(){const h=almanacPrev.apply(this,arguments),at=h.lastIndexOf('</div>');if(at<0)return h;const known=S.recipes||[];
  const row=['beansdodo','puffpuff'].filter(k=>RECIPES[k]).map(k=>esc(RECIPES[k].name)+' <span class="recipe35-state">· '+(known.includes(k)?'learnt':'not yet')+'</span>').join('<br>');
  return h.slice(0,at)+`<article class="life-card34 recipes35">${pepperIcon34()}<h3>Mama Nkechi’s recipes</h3><p class="small">${row}</p></article>`+h.slice(at);};
 // weekday prose out of the data the HUD does not own (WEEK stays: it is the calendar)
 ITEMS.plant.blurb=TUNE35.fixCopy(ITEMS.plant.blurb);
 if(typeof SQUARE_STAGES!=='undefined')for(let k=0;k<SQUARE_STAGES.length;k++)SQUARE_STAGES[k]=TUNE35.fixCopy(SQUARE_STAGES[k]);
 if(typeof ENV_PRESETS!=='undefined')for(const p of ENV_PRESETS){p.name=TUNE35.fixCopy(p.name);p.tag=TUNE35.fixCopy(p.tag);p.description=TUNE35.fixCopy(p.description);}
 const toastPrev=toast;
 // wrap: toasts lose weekday prose (the square's film-night line)
 toast=function(m){return toastPrev.call(this,TUNE35.fixCopy(m));};
 const rememberPrev=remember;
 // wrap: album captions lose weekday prose
 remember=function(caption,kind){return rememberPrev.call(this,TUNE35.fixCopy(caption),kind);};
 const photoPrev=takePhoto;
 // wrap: photo captions lose weekday prose (the finished square)
 takePhoto=function(caption,kind){return photoPrev.call(this,TUNE35.fixCopy(caption),kind);};
 const occPrev=occasions;
 // wrap: occasion names lose weekday prose; the ids are save data and stay
 occasions=function(){return occPrev.apply(this,arguments).map(o=>Object.assign({},o,{name:TUNE35.fixCopy(o.name)}));};

 /* ---------- Finds and Home pages: paints, the walkway and the path ---------- */
 const marketPagePrev=marketHTML34;
 // wrap: the paints follow the whole Finds page, always on offer
 marketHTML34=function(){let h=marketPagePrev.apply(this,arguments);const at=market34();
  if(!owned34('armchair')&&ITEMS.armchair){const i=h.indexOf('<h3>'+ITEMS.armchair.name+'</h3>'),j=i>0?h.lastIndexOf('<span class="life-label34">',i):-1;
   if(j>=0){const k=j+'<span class="life-label34">'.length;h=h.slice(0,k)+'FROM ADA’S WORKSHOP · '+h.slice(k);}}
  const cards=PAINTS35.map(p=>`<article class="life-card34 paint35-card"><span class="paint35-swatch" style="background:${p.hex}"></span><span class="life-label34">${p.kind==='wall'?'FOR THE WALLS':'FOR THE FLOOR'}</span><h3>${esc(p.name)}</h3><b>${naira(p.price)}</b>${ownsPaint(p.id)?'<span class="life-pill34">Yours</span>':btn(at?'Buy for the flat':'Visit to buy','buyPaint35',{id:p.id},'primary block').replace('<button ',S.money<p.price?'<button disabled ':'<button ')}</article>`).join('');
  return h+`<section class="paint35"><h3>For the walls and floor</h3><p class="small">Always on offer. Change the walls and floor from Home.</p><div class="life-grid34">${cards}</div></section>`;};
 const PATH35='<path d="M50 80V18" stroke="#A89878" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 13"/><path d="M38 30L50 18L62 30" fill="none" stroke="#A89878" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>';
 const homePagePrev=homeHTML34;
 // wrap: the walkway and the path to the pot show as kept cells; at home, a walls-and-floor strip and the paint undo
 homeHTML34=function(){let h=homePagePrev.apply(this,arguments);if(!home34())return h;
  for(const [x,y,label] of TUNE35.reserved){if(itemAt(x,y))continue;
   h=h.replace(new RegExp(`<button class="cell34 ([^"]*)" data-act="lifeCell" data-x="${x}" data-y="${y}" aria-label="(Veranda|Row \\d+), column ${x+1}, empty"([^>]*)>[\\s\\S]*?</button>`),
    (m,cls,where,b)=>`<button class="cell34 walkway35 ${cls}" data-act="lifeCell" data-x="${x}" data-y="${y}" aria-label="${where}, column ${x+1}, ${label}"${b.includes('disabled')?b:b+' disabled'}>${lifeSVG34(PATH35)}</button>`);}
  h=h.replace('<p class="life-label34 room-caption34">VERANDA · THE OPEN AIR</p>',m=>m+`<p class="small muted walkway35-note">${esc(TUNE35.copy.kept)}</p>`);
  const owned=PAINTS35.filter(p=>ownsPaint(p.id));let strip;
  if(!owned.length)strip='<p class="small muted">Paints are always on offer at Palm Court Finds.</p>';
  else strip=[['wall','Walls','the walls'],['floor','Floor','the floor']].map(([kind,title,what])=>{const cur=S.home[kind]||'',mine=owned.filter(p=>p.kind===kind);
   const chip=(id,name,hex,sel)=>`<button class="paint35-chip${sel?' selected':''}" data-act="paint35" data-id="${id}" aria-label="Paint ${what} ${esc(name)}"${sel?' aria-pressed="true"':''}><span style="background:${hex}"></span>${esc(name)}</button>`;
   return `<div class="paint35-row"><b>${title}</b>${chip(kind+':base','Original',kind==='wall'?'#F3E9D8':'#C9663C',!TUNE35.paintOf(cur)||TUNE35.paintOf(cur).kind!==kind)}${mine.map(p=>chip(p.id,p.name,p.hex,cur===p.id)).join('')}</div>`;}).join('');
  const block=`<div class="paint35-strip"><h3>Walls and floor</h3>${strip}</div>`,browse=h.indexOf('data-act="lifeTab" data-v="market"');
  if(browse>=0){const at=h.lastIndexOf('<button',browse);h=h.slice(0,at)+block+h.slice(at);}else h+=block;
  if(TUNE35.paintUndo&&!LIFE34.undo){const o=h.indexOf('<div class="life-options">');if(o>=0){const end=h.indexOf('</div>',o);h=h.slice(0,end)+btn('Undo the paint','paintUndo35',{wall:TUNE35.paintUndo.wall,floor:TUNE35.paintUndo.floor},'quiet')+h.slice(end);}}
  return h;};

 /* ---------- Stylesheet ---------- */
 TUNE35.css=`.fishing34.nibble35 .float34{animation:nibble35 .16s ease-in-out infinite}
@keyframes nibble35{50%{margin-top:6px;transform:translate(-50%,-50%) rotate(-12deg)}}
@media(prefers-reduced-motion:reduce){.fishing34.nibble35 .float34{animation:none}}
@media (hover:none) and (pointer:coarse){body.fishact35 #touch{z-index:21}body.fishact35 #touch .zone{pointer-events:none}
 body.fishact35 #touch .stick{display:none!important}body.fishact35 #touch .act{pointer-events:auto}
 body.fishact35 #panel.life-panel34{padding-bottom:calc(112px + env(safe-area-inset-bottom,0px))}}
#panel .paint35{margin-top:18px}#panel .paint35>h3{margin:0 0 4px}
#panel .paint35-swatch{display:block;height:64px;border-radius:12px;margin:0 0 10px;border:1px solid #0002}
#panel .paint35-card h3{margin:4px 0 2px}#panel .paint35-card>.btn{margin-top:10px}
#panel .paint35-strip{margin:14px 0 6px}#panel .paint35-strip h3{margin:0 0 4px}
#panel .paint35-row{display:flex;flex-wrap:wrap;align-items:center;gap:0;margin:2px 0}#panel .paint35-row>b{flex:0 0 100%;font-size:13px;color:#5c6859;margin:6px 0 0 4px}
#panel .paint35-strip .paint35-chip{display:inline-flex;align-items:center;gap:8px;min-height:48px;min-width:48px;padding:6px 12px;margin:4px;border-radius:12px;border:1px solid #ccd1b9;background:#faf7e9;color:#355145;font:inherit;cursor:pointer}
#panel .paint35-chip span{flex:0 0 26px;width:26px;height:26px;border-radius:50%;border:1px solid #0003}
#panel .paint35-strip .paint35-chip.selected{border:2px solid #517a56;padding:5px 11px;font-weight:700}
#panel .recipe35-state{white-space:nowrap}
#panel .cell34.walkway35{background:#efe9d9;border-style:dashed}#panel .cell34.walkway35 svg{opacity:.9}
#panel .walkway35-note{margin:2px 0 8px}
#panel .harvest35 .harvest35-icons{display:flex;gap:6px;margin:6px 0 4px}#panel .harvest35 .harvest35-icons svg{width:40px;height:40px}#panel .harvest35 .btn{margin:8px 8px 0 0}
#life-guide34 button{width:44px;height:44px;min-width:44px;margin:-7px -8px -7px -6px;flex:0 0 44px}
#panel .btn[data-act="aspeed"]{min-height:44px}`;
 if(typeof document!=='undefined'&&document.createElement){const st=document.createElement('style');st.id='tune-v35-css';st.textContent=TUNE35.css;
  const put=()=>document.body&&document.body.appendChild(st);if(document.readyState==='loading'&&document.addEventListener)document.addEventListener('DOMContentLoaded',put);else put();}
}

/* v34b bridge: fixes found when the living-compound loop (life-*-v34) first rendered on the authored character.
   Loaded last. The life modules stay byte-identical; every change here wraps an earlier function and calls it. */
const BRIDGE34B={version:1,potLift:.55,castZ:17.25,protectedStore:['sofa','mattress','table','fan'],potCell:[2,4],
 shells:[[-3,14.9],[5.6,15.0],[11.2,15.1]],fishMarker:[12.2,13.75]};

/* ---------- Fishing: float in open water, rod in the right hand, the camera frames both, the bite shows in the world ---------- */
function castSpot34b(p){return [Math.max(10.6,Math.min(15.4,p.g.position.x)),BRIDGE34B.castZ];}
const _a34b=new THREE.Vector3(),_b34b=new THREE.Vector3(),_d34b=new THREE.Vector3(),_q34b=new THREE.Quaternion(),_w34b=new THREE.Quaternion(),_p34b=new THREE.Quaternion(),UP34B=new THREE.Vector3(0,1,0);
function aimBone34b(bone,child,target){bone.getWorldPosition(_a34b);child.getWorldPosition(_b34b);_d34b.subVectors(_b34b,_a34b);if(_d34b.lengthSq()<1e-8||!bone.parent)return;_d34b.normalize();
 _q34b.setFromUnitVectors(_d34b,target);bone.getWorldQuaternion(_w34b);bone.parent.getWorldQuaternion(_p34b);_w34b.premultiply(_q34b);bone.quaternion.copy(_p34b.invert().multiply(_w34b));bone.updateMatrixWorld(true);}
function fishPose34b(p,g){
 const yaw=g.userData.yaw;p.g.rotation.y=yaw;p.g.updateMatrixWorld(true);
 const fwd=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),right=new THREE.Vector3(-Math.cos(yaw),0,Math.sin(yaw)),b=p.g.hero&&p.g.hero.bones;
 const rodDir=fwd.clone().multiplyScalar(.77).addScaledVector(UP34B,.64).normalize();let grip,fore=fwd.clone();
 if(b&&b.rightarm&&b.rightforearm&&b.righthand){
  const chain=[b.rightarm,b.rightforearm,b.righthand];if(!p.g.userData.fishPre34b)p.g.userData.fishPre34b={bones:chain,q:chain.map(x=>x.quaternion.clone())};
  aimBone34b(b.rightarm,b.rightforearm,fwd.clone().multiplyScalar(.55).addScaledVector(UP34B,-.8).addScaledVector(right,.14).normalize());
  fore=fwd.clone().multiplyScalar(.96).addScaledVector(UP34B,.2).addScaledVector(right,-.08).normalize();aimBone34b(b.rightforearm,b.righthand,fore);
  grip=b.righthand.getWorldPosition(new THREE.Vector3()).addScaledVector(fore,.07);
 }else if(p.g.parts&&p.g.parts.elbowR){grip=p.g.parts.elbowR.localToWorld(new THREE.Vector3(0,-.26,0));}
 else grip=p.g.position.clone().add(new THREE.Vector3(0,1,0)).addScaledVector(right,.25).addScaledVector(fwd,.2);
 const rod=g.userData.rod,line=g.userData.line,bob=g.userData.bob,len=1.85,butt=grip.clone().addScaledVector(rodDir,-.25),tip=butt.clone().addScaledVector(rodDir,len);
 rod.position.copy(butt).addScaledVector(rodDir,len/2);rod.quaternion.setFromUnitVectors(UP34B,rodDir);rod.scale.set(1,len/rod.geometry.parameters.height,1);
 const seg=bob.position.clone().sub(tip),l=seg.length();line.position.copy(tip).addScaledVector(seg,.5);line.quaternion.setFromUnitVectors(UP34B,seg.normalize());line.scale.set(1,l/line.geometry.parameters.height,1);
 g.userData.grip=grip;g.userData.tip=tip;
}
function unposeFish34b(){players.forEach(p=>{const s=p.g&&p.g.userData.fishPre34b;if(!s)return;s.bones.forEach((x,k)=>x.quaternion.copy(s.q[k]));delete p.g.userData.fishPre34b;});}
// wrap: build the original float and line, then move the float out over open water and hand the rod to the angler
const buildFishing34a=buildFishing34;buildFishing34=function(){buildFishing34a();const g=LIFE34.fishingWorld,f=LIFE34.fish,p=f&&players[f.i];if(!g||!p)return;
 const [fx,fz]=castSpot34b(p),bob=g.userData.bob,ring=g.children.find(o=>o!==bob&&o.geometry&&o.geometry.type==='TorusGeometry');bob.position.set(fx,.12,fz);if(ring)ring.position.set(fx,.055,fz);
 const sticks=g.children.filter(o=>o.geometry&&o.geometry.type==='CylinderGeometry');g.userData.rod=sticks[0];g.userData.line=sticks[1];g.userData.ring=ring;g.userData.float=[fx,fz];
 g.userData.yaw=Math.atan2(fx-p.g.position.x,fz-p.g.position.z);fishPose34b(p,g);};
// wrap: the camera fit also includes the float while a line is out
const v21Pts34b=v21InteractionPoints;v21InteractionPoints=function(i,joint){const pts=v21Pts34b(i,joint),g=LIFE34.fishingWorld,f=LIFE34.fish;
 if(g&&f&&g.userData.float&&(joint||f.i===i)){const [x,z]=g.userData.float;pts.push(new THREE.Vector3(x-.35,0,z-.35),new THREE.Vector3(x+.35,.35,z+.35));}return pts;};
// wrap: on a phone the fishing panel is a bottom sheet, so the camera fits the angler and float into the space above it
const v21Viewport34b=v21Viewport;v21Viewport=function(i){const vp=v21Viewport34b(i);if(!LIFE34.fishingWorld||!overlayOpen()||!panel.getBoundingClientRect)return vp;const r=panel.getBoundingClientRect();
 if(r.height>0&&r.bottom>=innerHeight-2&&r.top>innerHeight*.25)return Object.assign({},vp,{bottom:Math.max(vp.bottom,Math.round(innerHeight-r.top+12))});return vp;};
function fishTick34b(){const g=LIFE34.fishingWorld,f=LIFE34.fish,p=f&&players[f.i];
 if(!g||!p||!g.userData.rod){unposeFish34b();return;}
 const t=performance.now()/1000,bob=g.userData.bob,ring=g.userData.ring;
 if(f.phase==='bite'){bob.position.y=.03+Math.sin(t*11)*.05;if(ring){const s=1.25+Math.sin(t*6)*.25;ring.scale.set(s,s,s);}}else if(ring)ring.scale.set(1,1,1);
 fishPose34b(p,g);}
// wrap: a waiting cast pauses while another panel (the Menu) is open, so the bite never replaces it;
// it also notes what this device's panel now shows (a journal tab such as 'fish', or 'other', and whether it is the catch panel) for the online rules below
BRIDGE34B.panelSeq=0;BRIDGE34B.shown=null;BRIDGE34B.catchShown=false;
const openPanel34b=openPanel;openPanel=function(html){const quiet=silentMode(),life=String(html).startsWith('<section class="life34">');if(!quiet&&LIFE34.fish&&LIFE34.fish.phase==='waiting'&&!life)LIFE34.tab='paused34b';
 const r=openPanel34b(html);if(!quiet){BRIDGE34B.panelSeq++;BRIDGE34B.shown=life?LIFE34.tab:'other';BRIDGE34B.catchShown=life&&String(html).includes('data-act="lifeCatch"');}return r;};
// end this device's cast cleanly: float and line gone, the arm let go, no phase left to bite
function endCast34b(){clearFishing34();LIFE34.fish=null;unposeFish34b();}

/* ---------- The guided first evening keeps its journal behind Tasks ---------- */
// wrap: while the first evening is guided, Menu > Our tasks opens the evening journal; afterwards, the day in Palm Court
const tasksbtn34b=ACTIONS.tasksbtn;ACTIONS.tasksbtn=d=>guided33()?journal34(d):tasksbtn34b(d);
function htasksGuided34b(e){if(!S||!S.p||S.phase!=='play'||overlayOpen()||!guided33())return;e.stopImmediatePropagation();journal33();}
{const el=document.getElementById('htasks');if(el)el.addEventListener('click',htasksGuided34b,true);}

/* ---------- Journal pages ---------- */
const todayHTML34b=todayHTML34;todayHTML34=function(){let h=todayHTML34b();const l=life34(),e=evening33(),age=S.day-l.startDay;
 // the first-evening card comes first, with a primary button, while the evening is still going
 const m=h.match(/<div class="life-note34"><b>Your first evening is still here\.<\/b>[\s\S]*?<\/button><\/div>/);
 if(m){h=h.replace(m[0],'');const card=m[0].replace('class="btn quiet" data-act="firstEvening34"','class="btn primary" data-act="firstEvening34"');h=h.replace('<div class="life-chips34">',card+'<div class="life-chips34">');}
 // one way back (the footer), and no early night promoted during the guided evening
 h=h.replace(btn('Back to the compound','close',{},'primary'),'');if(guided33())h=h.replace(btn('Rest until tomorrow','sleep',{},'quiet'),'');h=h.replace('<div class="actions"></div>','');
 // the title follows the crop, not just the calendar
 if(age>=2&&l.crop.stage!==3)h=h.replace(/<h2>Look what you grew\.<\/h2><p>[^<]*<\/p>/,`<h2>Your pace. Your place.</h2><p>${l.crop.stage===0?'Tunde’s seedling is still waiting on the veranda. Plant it whenever you like; nothing here is in a hurry.':'The pepper plant is growing at its own pace. A little water, a walk by the water, a new corner for something you love.'}</p>`);
 // the morning after the first evening keeps its gift and album line
 if(e&&e.completed&&e.plan&&S.day===e.finishedDay+1){const t=`<b>${esc(PLANS33[e.plan].title)}</b>`,at=h.indexOf(t);if(at>=0){const end=h.indexOf('</p></div>',at);if(end>=0)h=h.slice(0,end+4)+'<p class="small muted">Your gift is in the flat or Build storage. Last night’s memories are in the album.</p>'+h.slice(end+4);}}
 return h;};
// wrap: the garden page uses the footer's way back only
const gardenHTML34b=gardenHTML34;gardenHTML34=function(){return gardenHTML34b().replace(btn('Back to the compound','close',{},'quiet'),'');};
// wrap: today's five finds come first; an upgrade already in the home is shown as owned, not for sale
const marketHTML34b=marketHTML34;marketHTML34=function(){let h=marketHTML34b();const start=h.indexOf('<div class="life-grid34">'),end=h.indexOf('</div><div class="life-note34"><h3>');
 if(start>=0&&end>start){const head=start+'<div class="life-grid34">'.length,cards=h.slice(head,end).match(/<article class="life-card34[^"]*">[\s\S]*?<\/article>/g)||[];
  const sorted=cards.filter(c=>!c.includes('later34')).concat(cards.filter(c=>c.includes('later34')));h=h.slice(0,head)+sorted.join('')+h.slice(end);}
 for(const t of offers34())if(upgradeOwned34b(t))h=h.replace(new RegExp(`<button class="btn primary block" data-act="lifeBuy" data-t="${t}"[^>]*>[^<]*</button>`),'<span class="life-pill34">Already in your home</span>');
 return h;};
const homeHTML34b=homeHTML34;homeHTML34=function(){validSel34b();let h=homeHTML34b();const it=S.home.items.find(x=>x.id===LIFE34.selectedItem);
 if(it&&BRIDGE34B.protectedStore.includes(it.type))h=h.replace(btn('Put in storage','lifeStore',{},'quiet'),'');
 const [px,py]=BRIDGE34B.potCell;if(!itemAt(px,py))h=h.replace(new RegExp(`(<button class="cell34 veranda[^"]*" data-act="lifeCell" data-x="${px}" data-y="${py}" aria-label="Veranda, column ${px+1}), empty"([^>]*)>[\\s\\S]*?</button>`),(m,a,b)=>`${a}, the pepper pot"${b.includes('disabled')?b:b+' disabled'}>${pepperIcon34()}</button>`);
 const carried=(typeof ghosts!=='undefined'?ghosts:[]).filter(g=>g&&g.free);if(carried.length&&home34())h=h.replace(/<h3>In storage · \d+<\/h3>/,m=>m+carried.map(g=>`<p class="small muted">The ${esc(ITEMS[g.type].name.toLowerCase())} is being carried with Build. Place it there first.</p>`).join(''));
 return h;};
// wrap: icons for the furniture every flat starts with (the original draws chairs for anything it does not know)
const ICONS34B={
 mattress:'<rect x="10" y="30" width="80" height="30" rx="8" fill="#ECDDBD"/><rect x="10" y="50" width="80" height="12" rx="5" fill="#C9B48E"/><rect x="16" y="24" width="24" height="12" rx="5" fill="#FFF8EB"/>',
 table:'<rect x="16" y="24" width="68" height="12" rx="4" fill="#98684B"/><path d="M24 36V70M76 36V70" stroke="#374D46" stroke-width="6"/>',
 fan:'<circle cx="50" cy="28" r="20" fill="none" stroke="#374D46" stroke-width="4"/><path d="M50 28L50 10M50 28L66 38M50 28L34 38" stroke="#628675" stroke-width="7" stroke-linecap="round"/><path d="M50 48V70M36 72H64" stroke="#374D46" stroke-width="5"/>',
 sofa:'<rect x="12" y="22" width="76" height="24" rx="9" fill="#3E5C8A"/><rect x="8" y="40" width="84" height="20" rx="7" fill="#4C6EA3"/><path d="M18 60V70M82 60V70" stroke="#374D46" stroke-width="6"/>',
 stove:'<rect x="16" y="30" width="68" height="40" rx="5" fill="#A9B7A7"/><rect x="14" y="22" width="72" height="10" rx="4" fill="#374D46"/><ellipse cx="35" cy="22" rx="11" ry="4" fill="#ECDDBD"/><ellipse cx="65" cy="22" rx="11" ry="4" fill="#ECDDBD"/>',
 fridge:'<rect x="28" y="6" width="44" height="66" rx="6" fill="#ECDDBD"/><path d="M28 30H72" stroke="#98684B" stroke-width="2"/><path d="M64 14V24M64 38V52" stroke="#374D46" stroke-width="4"/>',
 photo:'<rect x="22" y="12" width="56" height="50" rx="3" fill="#98684B"/><rect x="28" y="18" width="44" height="38" fill="#ECDDBD"/><circle cx="42" cy="34" r="6" fill="#CC9A4D"/><circle cx="58" cy="34" r="6" fill="#628675"/><path d="M32 54Q42 42 50 54Q58 42 68 54" fill="#628675"/>'
};
const furnishingIcon34b=furnishingIcon34;furnishingIcon34=function(t){return ICONS34B[t]?lifeSVG34(ICONS34B[t]):furnishingIcon34b(t);};
// wrap: re-rendering the same journal page keeps its scroll position; on a phone the selected tab is brought into view; no journal UI on a remote replay
const openLife34b=openLife34;openLife34=function(tab){if(silentMode())return;validSel34b();const next=LIFE_TABS34.some(([k])=>k===tab)?tab:'today';
 const same=overlayOpen()&&panel.classList.contains('life-panel34')&&LIFE34.tab===next,top=same?panel.scrollTop:0;const r=openLife34b(tab);
 if(same)panel.scrollTop=top;const strip=panel.querySelector&&panel.querySelector('.life-tabs34'),sel=strip&&strip.querySelector('.selected');
 if(strip&&sel&&strip.scrollWidth>strip.clientWidth)strip.scrollLeft=Math.max(0,sel.offsetLeft-(strip.clientWidth-sel.offsetWidth)/2);return r;};
// wrap: a remote replay never restyles whatever panel is open on this device
const openLifePanel34b=openLifePanel34;openLifePanel34=function(c,t){if(silentMode())return;return openLifePanel34b(c,t);};

/* ---------- Request card inside the base talk dialogue ---------- */
// wrap: the card sits above the dialogue's own Later button (its colours are fixed in the stylesheet below)
// a remote talk replays silently: run the base dialogue only, so no request card lands in whatever panel is open here
const openTalk34b=openTalk;openTalk=function(i,k){if(silentMode())return talk34(i,k);const r=openTalk34b(i,k);const card=panel.querySelector&&panel.querySelector('.life-talk34'),act=card&&[...panel.children].find(x=>x.classList&&x.classList.contains('actions'));if(card&&act)act.before(card);return r;};

/* ---------- Decorating: an undo that cannot eat the sofa, selections that follow their item ---------- */
function homeSig34b(){return JSON.stringify([S.home.items,S.home.storage]);}
function validSel34b(){if(LIFE34.selection===null||LIFE34.selection===undefined)return;const s=S.home.storage;if(LIFE34.selType34b&&s[LIFE34.selection]!==LIFE34.selType34b){const k=s.indexOf(LIFE34.selType34b);LIFE34.selection=k>=0?k:null;if(k<0){LIFE34.selType34b=null;LIFE34.rotation=0;}}else if(!s[LIFE34.selection])LIFE34.selection=null;}
// wrap: remember which item was chosen, not just its storage slot
const lifeSelect34b=ACTIONS.lifeSelect;ACTIONS.lifeSelect=d=>{lifeSelect34b(d);LIFE34.selType34b=LIFE34.selection===null?null:S.home.storage[LIFE34.selection];};
for(const n of ['lifeCell','lifeRotate','lifeStore']){const orig=ACTIONS[n];
 // wrap: an editor change records what the flat looked like right after it, so Undo can tell if anything else changed since
 ACTIONS[n]=d=>{validSel34b();const before=LIFE34.undo;if(n==='lifeStore'){const it=S.home.items.find(x=>x.id===LIFE34.selectedItem);if(it&&BRIDGE34B.protectedStore.includes(it.type)){toast('The '+ITEMS[it.type].name.toLowerCase()+' stays in the flat. You can turn it instead.');return;}}
  orig(d);if(LIFE34.undo&&LIFE34.undo!==before)LIFE34.undoSig34b=homeSig34b();if(LIFE34.selection===null)LIFE34.selType34b=null;};}
// wrap: Undo only restores the flat if nothing outside the editor (the sofa carry, a gift, old Build, the other player) changed it since
const lifeUndo34b=ACTIONS.lifeUndo;ACTIONS.lifeUndo=d=>{if(!silentMode()&&LIFE34.undo&&LIFE34.undoSig34b!==homeSig34b()){LIFE34.undo=null;toast('The flat has changed since then, so there is nothing to undo.');openLife34('home');return;}lifeUndo34b(d);};
// wrap: placing the carried sofa (from the game tick, outside dispatch) ends the editor's undo
const sofaSuccess34b=sofaSuccess;sofaSuccess=function(){LIFE34.undo=null;return sofaSuccess34b.apply(this,arguments);};
// wrap: automatic placements (gifts, rewards) end the editor's undo too
const placeAuto34b=placeAuto;placeAuto=function(t){const r=placeAuto34b(t);if(r)LIFE34.undo=null;return r;};
// wrap: the veranda cell under the pepper pot's stand stays free
const fitsHome34b=fitsHome34;fitsHome34=function(type,x,y,rot=0,ignore){if(!fitsHome34b(type,x,y,rot,ignore))return false;const [w,h]=footprint34(type,rot),[px,py]=BRIDGE34B.potCell;return !(px>=x&&px<x+w&&py>=y&&py<y+h);};

/* ---------- Market and storage guards ---------- */
function upgradeOwned34b(t){const d=ITEMS[t];return !!(d&&d.replaces&&(placed(t)||S.home.storage.includes(t)));}
// wrap: an upgrade the home already has (placed or waiting in storage) is not sold twice
const lifeBuy34b=ACTIONS.lifeBuy;ACTIONS.lifeBuy=d=>{if(d&&upgradeOwned34b(d.t)){toast('You already have the '+ITEMS[d.t].name.toLowerCase()+'.');return;}lifeBuy34b(d);};

/* ---------- Garden: the pot stands where the camera can see it; the harvest says so ---------- */
// wrap: rebuild the pot, then lift it onto a small timber stand so the plant shows over the veranda wall
const refreshGarden34b=refreshGarden34;refreshGarden34=function(){refreshGarden34b();const g=LIFE34.garden;if(!g)return;const L=BRIDGE34B.potLift;g.position.y=.06+L;
 box34(g,.52,.05,.52,'#8C6A4C',0,-.025,0);box34(g,.44,.03,.44,'#8C6A4C',0,-L+.16,0);for(const sx of [-1,1])for(const sz of [-1,1])box34(g,.05,L+.04,.05,'#6E5039',sx*.21,-(L+.04)/2,sz*.21);};
// wrap: a short confirmation when the peppers go into the pantry
const lifeHarvest34b=ACTIONS.lifeHarvest;ACTIONS.lifeHarvest=d=>{const c=life34()&&life34().crop,n=c?c.harvests:0;lifeHarvest34b(d);if(c&&c.harvests>n)toast('Three red peppers, into the pantry.');};

/* ---------- Shells on the sand, a marker clear of the rocks ---------- */
BRIDGE34B.shells.forEach((s,k)=>{SHELLS34[k]=s.slice();});
// wrap: the fishing marker sits on the sand beside the rocks; 'shells' points at the nearest shell still on the beach today
const navigate34b=navigate34;navigate34=function(place){navigate34b(place);const w=LIFE34.waypoint;if(!w)return;
 if(place==='fish'){w.x=BRIDGE34B.fishMarker[0];w.z=BRIDGE34B.fishMarker[1];refreshMarker34();}
 if(place==='shells'){const l=life34(),p=players.find(q=>!(AI.on&&q.i===AI.i))||players[0];const left=SHELLS34.map((s,k)=>[s,k]).filter(([s,k])=>l.shellDays[k]!==S.day);
  if(left.length&&p){left.sort((a,b)=>Math.hypot(a[0][0]-p.g.position.x,a[0][1]-p.g.position.z)-Math.hypot(b[0][0]-p.g.position.x,b[0][1]-p.g.position.z));w.x=left[0][0][0];w.z=left[0][0][1];refreshMarker34();}}};

/* ---------- Rotation-aware spots for cooking, sleeping, sitting and the dinner plate ---------- */
function footCentre34b(it){const [w,h]=footprint34(it.type,it.rot||0),[cx,cz]=cellToWorld(it.x,it.y);return [cx+(w-1)*FLAT.cell/2,it.y===FLAT.rows?cz:cz+(h-1)*FLAT.cell/2];}
function freeSpot34b(a,b){return inFlat(a,b)&&a>FLAT.x0+.3&&a<FLAT.x0+FLAT.cols*FLAT.cell-.3&&!blocked(a,b,PR*.8);}
// the turned front first, then the back and the sides; in a crowded flat the nearest free spot around the piece; failing that, the unrotated reach point
function frontSpot34b(it,gap,base){const [x,z]=footCentre34b(it),d=ITEMS[it.type],r=((it.rot||0)%4+4)%4,depth=d.h*FLAT.cell/2+gap,side=d.w*FLAT.cell/2+gap;
 const f=[[0,1],[1,0],[0,-1],[-1,0]][r],s=[f[1],-f[0]];const cand=[[x+f[0]*depth,z+f[1]*depth],[x-f[0]*depth,z-f[1]*depth],[x+s[0]*side,z+s[1]*side],[x-s[0]*side,z-s[1]*side]];
 const hit=cand.find(([a,b])=>freeSpot34b(a,b));if(hit)return hit;
 for(let rad=Math.min(depth,side);rad<=2.4;rad+=.15)for(let k=0;k<24;k++){const an=k/24*Math.PI*2,a=x+Math.sin(an)*rad,b=z+Math.cos(an)*rad;if(freeSpot34b(a,b))return [a,b];}
 return base||cand[0];}
// The hotspot scan asks for these spots for both players every frame, and in a crowded flat the ring search costs milliseconds, so the spot is
// kept per layout: the items (with their rotations) and everything blocked() tests in the flat (the furniture boxes, the crate, the loose sofa,
// pushables). Players never block a spot (blocked() ignores them), so walking about does not recompute it.
BRIDGE34B.reach={};
// A loose blocker counts only while its box could touch a free spot (freeSpot34b's area grown by the spot radius); outside the flat it
// reads 'out', so pushing the crate or a cooler about the courtyard does not rerun the search every frame.
function nearFlat34b(o){const r=PR*.8+.01;return o.x2+r>FLAT.x0+.3&&o.x1-r<FLAT.x0+FLAT.cols*FLAT.cell-.3&&o.z2+r>FLAT.z0-.1&&o.z1-r<7;}
function blockSig34b(){const n=v=>Math.round(v*1e3),bx=o=>nearFlat34b(o)?n(o.x1)+','+n(o.x2)+','+n(o.z1)+','+n(o.z2):'out';
 let k=OBS.length+';'+(crate?bx(crateBox()):'-')+';'+(sofa&&sofa.g.visible&&!sofa.carrying?bx(sofaBox()):'-');
 for(const pb of PUSH)if(!pb.lvl&&!pb.gone)k+=';'+bx(pushBox(pb));return k;}
function reach34b(key,it,gap,base){const c=BRIDGE34B.reach[key],sig=JSON.stringify(S.home.items)+'|'+blockSig34b();
 if(!c||c.sig!==sig||c.furn!==FURN_OBS){BRIDGE34B.reach[key]={sig,furn:FURN_OBS,at:frontSpot34b(it,gap,base).slice()};BRIDGE34B.reachRuns=(BRIDGE34B.reachRuns||0)+1;}return BRIDGE34B.reach[key].at.slice();}
// wrap: a turned kitchen, bed or sofa is used from its turned front (the originals assume rotation 0)
const flatKitchenPos34b=flatKitchenPos;flatKitchenPos=function(){const it=S.home.items.find(i=>i.type==='kitchen')||S.home.items.find(i=>i.type==='stove');return it&&(it.rot||0)%4?reach34b('cook',it,.35,flatKitchenPos34b()):flatKitchenPos34b();};
const bedPos34b=bedPos;bedPos=function(){const it=S.home.items.find(i=>i.type==='bed'||i.type==='mattress');return it&&(it.rot||0)%4?reach34b('bed',it,.35,bedPos34b()):bedPos34b();};
const sofaPos34b=sofaPos;sofaPos=function(){const it=S.home.items.find(i=>i.type==='sofa');return it&&(it.rot||0)%4?reach34b('sofa',it,.3,sofaPos34b()):sofaPos34b();};
// wrap: the plate sits on the middle of a turned table
const refreshHomeExtras34b=refreshHomeExtras;refreshHomeExtras=function(){const r=refreshHomeExtras34b();const tbl=S.home.items.find(i=>i.type==='dining')||S.home.items.find(i=>i.type==='table');
 if(plateMesh&&tbl&&(tbl.rot||0)%4){const [x,z]=footCentre34b(tbl);plateMesh.position.x=x;plateMesh.position.z=z;}return r;};

/* ---------- The companion does not stand in for the player ---------- */
function humansOnly34b(fn){return function(){if(!(typeof AI!=='undefined'&&AI.on&&players.length>1))return fn.apply(this,arguments);const all=players;players=all.filter(p=>p.i!==AI.i);try{return fn.apply(this,arguments);}finally{players=all;}};}
// wrap: home34/near34/market34 count only human players when the companion is on
home34=humansOnly34b(home34);near34=humansOnly34b(near34);market34=humansOnly34b(market34);

/* ---------- Ada's visit spot ---------- */
// wrap: Ada waits on a free veranda cell away from Tunde's party spot and the pepper pot (same depth, z 6.3)
const refreshVisitor34b=refreshVisitor34;refreshVisitor34=function(){refreshVisitor34b();const l=life34(),n=l&&l.visit&&npcs[l.visit.k];if(!n||l.visit.day!==S.day||n.g.position.x!==-4.5||n.g.position.z!==6.3)return;
 const col=[1,0,5,3,4].find(c=>!itemAt(c,FLAT.rows));if(col===undefined)return;const x=cellToWorld(col,FLAT.rows)[0];n.g.position.x=x;if(n.home)n.home[0]=x;};

/* ---------- Online: life UI stays on its own device; remote replays carry what they need ---------- */
['lifeTab','lifeGo','lifeClear','lifeSelect','lifeCancel','lifeFish','lifeCast','firstEvening34'].forEach(n=>LOCAL_ONLY.add(n));
const EDIT34B=new Set(['lifeCell','lifeRotate','lifeStore','lifeUndo']);
// wrap: editor actions travel with the sender's selection (and Undo with its snapshot); a reel travels with the angler
const dispatch34b=dispatch;dispatch=function(name,d){if(EDIT34B.has(name)){validSel34b();d=Object.assign({},d,{_ed:{sel:LIFE34.selection,type:LIFE34.selection===null?null:S.home.storage[LIFE34.selection],rot:LIFE34.rotation,item:LIFE34.selectedItem,undo:name==='lifeUndo'?LIFE34.undo:null}});}
 if(name==='lifeReel'&&LIFE34.fish)d=Object.assign({},d,{i:LIFE34.fish.i});return dispatch34b(name,d);};
// wrap: a remote replay uses the sender's editor context and keeps this device's selection and waypoint; a remote change to the flat ends local Undo.
// A silent replay (no shared panel) also keeps this device's cast and tab. A shared-panel replay (sitwait, nextday, cook...) that opens or closes
// the panel here ends this device's cast, so the bite cannot come back over it. A remote reel that records the shared catch ends this device's
// cast in every phase (ready, waiting, bite: lifeCast and lifeReel refuse while a catch is out) and an open fishing panel shows that catch instead.
// A remote decision on the shared catch (Keep, Sell, Let it swim) ends any local cast too, and an open catch panel here closes with a toast
// saying what the other player did, so its buttons are never left dead.
const applyRemote34b=applyRemote;applyRemote=function(m){const a=(m&&m.data)||{},d=a.data||{};if(!m||m.sameTab||!ACTIONS[a.name]||LOCAL_ONLY.has(a.name)||!S||!S.p)return applyRemote34b(m);
 const shared=SHARED_PANEL.has(a.name),seq=BRIDGE34B.panelSeq,hadCatch=!!(life34()&&life34().catch),catchId=hadCatch?life34().catch.id:null;
 const keep={fish:LIFE34.fish,world:LIFE34.fishingWorld,sel:LIFE34.selection,type:LIFE34.selType34b,item:LIFE34.selectedItem,rot:LIFE34.rotation,tab:LIFE34.tab,way:LIFE34.waypoint,undo:LIFE34.undo,usig:LIFE34.undoSig34b},sig=homeSig34b();
 if(!shared){LIFE34.fish=null;LIFE34.fishingWorld=null;}
 if(d._ed){const e=d._ed;let ix=null;if(e.type!=null){ix=S.home.storage[e.sel]===e.type?e.sel:S.home.storage.indexOf(e.type);if(ix<0)ix=null;}LIFE34.selection=ix;LIFE34.selType34b=e.type;LIFE34.selectedItem=e.item||null;LIFE34.rotation=e.rot||0;LIFE34.undo=e.undo||null;}
 if(!shared&&a.name==='lifeReel'&&!hadCatch)LIFE34.fish={i:+d.i||0,phase:'bite',elapsed:0,biteAt:0};
 try{return applyRemote34b(m);}finally{Object.assign(LIFE34,{selection:keep.sel,selType34b:keep.type,selectedItem:keep.item,rotation:keep.rot,undoSig34b:keep.usig});
  if(!shared)Object.assign(LIFE34,{fish:keep.fish,fishingWorld:keep.world,tab:keep.tab});
  if(shared&&LIFE34.fish&&BRIDGE34B.panelSeq!==seq&&BRIDGE34B.shown!=='fish')endCast34b();
  if(!shared&&a.name==='lifeReel'&&!hadCatch&&life34().catch&&keep.fish){endCast34b();if(BRIDGE34B.shown==='fish')openFishing34();}
  if(!shared&&a.name==='lifeCatch'&&hadCatch&&!life34().catch){if(LIFE34.fish)endCast34b();if(BRIDGE34B.catchShown)settledToast34b(a,catchId);}
  if(!LIFE34.fishingWorld)unposeFish34b();
  LIFE34.undo=homeSig34b()===sig?keep.undo:null;if(LIFE34.waypoint!==keep.way){LIFE34.waypoint=keep.way;refreshMarker34();}validSel34b();if(LIFE34.selectedItem&&!S.home.items.some(x=>x.id===LIFE34.selectedItem))LIFE34.selectedItem=null;}};
// the other player settled the shared catch first: close this device's catch panel and say what they did
function settledToast34b(a,id){const d=a.data||{},f=FISH34.find(x=>x.id===id)||{name:'fish',value:0},src=a.src!=null&&S.p[+a.src]?+a.src:(NET.myIndex?0:1),who=pname(src),n=f.name.toLowerCase();
 closePanel();toast(d.v==='keep'?`${who} kept the ${n} for the kitchen.`:d.v==='sell'?`${who} sold the ${n} for ${naira(f.value)}.`:`${who} let the ${n} swim.`);}
// wrap: closing a panel on a remote replay does not end this device's cast
const close34b=closePanel;closePanel=function(){if(silentMode())return close34();BRIDGE34B.panelSeq++;BRIDGE34B.shown=null;BRIDGE34B.catchShown=false;return close34b();};
// wrap: a remote replay of a Menu action does not add the journal button to whatever panel is open here
const menu34b=openMenu;openMenu=function(){if(silentMode())return menu34();return menu34b();};

/* ---------- Directions pill: clear of the toast and the companion card, with a direction arrow ---------- */
function guideTick34b(){const el=lifeGuideEl34;if(!el||el.style.display==='none'||!LIFE34.waypoint)return;const phone=innerWidth<=560;let top=phone?112:82;
 const t=document.getElementById('toast');if(t&&t.classList.contains('on')&&t.getBoundingClientRect){const r=t.getBoundingClientRect();if(r.bottom>0&&r.height>0)top=Math.max(top,Math.round(r.bottom+8));}el.style.top=top+'px';
 const span=el.querySelector&&el.querySelector('span');if(!span||typeof cams==='undefined')return;const w=LIFE34.waypoint,si=typeof singleIdx==='function'?singleIdx():-1,i=si>=0?si:0,p=players[i],c=cams[i];if(!p||!c)return;
 const far=Math.min(...players.map(q=>Math.hypot(q.g.position.x-w.x,q.g.position.z-w.z)))>=2;if(!far){if(span.dataset.arrow)delete span.dataset.arrow;return;}
 c.updateMatrixWorld();const a=new THREE.Vector3(p.g.position.x,0,p.g.position.z).project(c),b=new THREE.Vector3(w.x,0,w.z).project(c),ang=Math.atan2((b.x-a.x)*(c.aspect||1),b.y-a.y);
 if(!span.dataset.arrow){span.dataset.arrow='1';span.innerHTML=span.innerHTML.replace('◇','<b class="arrow34b" aria-hidden="true">↑</b>');}const ar=span.querySelector('.arrow34b');if(ar)ar.style.transform=`rotate(${ang.toFixed(3)}rad)`;}
/* ---------- Toasts clear of the journal tabs ---------- */
// while a journal page is open the toast sits just below its tab strip (or the top of the panel if the strip has scrolled away); otherwise where the base puts it
function toastSpot34b(){const t=document.getElementById('toast');if(!t||!t.style)return;let top='';
 if(overlayOpen()&&panel.classList.contains('life-panel34')&&panel.querySelector&&panel.getBoundingClientRect){const strip=panel.querySelector('.life-tabs34');
  if(strip&&strip.getBoundingClientRect){const r=strip.getBoundingClientRect(),pr=panel.getBoundingClientRect();if(r.height>0)top=Math.round(Math.max(r.bottom,pr.top)+8)+'px';}}
 if(t.style.top!==top)t.style.top=top;}
// wrap: a toast raised while a journal page is open is placed at once, not a frame later
const toast34b=toast;toast=function(){const r=toast34b.apply(this,arguments);toastSpot34b();return r;};
TICK_HOOKS.push(dt=>{if(!S||S.phase!=='play')return;fishTick34b();toastSpot34b();guideTick34b();});

/* ---------- Shoreline water stays above the sand ---------- */
// The base water is a plane at y .03 whose waves move it by up to ±.12, while the beach slab is at .012 and the ground under the sea at -.02,
// so at a trough the shallows vanish and the float seems to sit on dry sand. Near the shore the waves are scaled down to amp[0] and the surface is
// lifted a little; both ease to the open-sea values (amp[1], lift[1]) between world z shore[0] and shore[1]. The open sea keeps its full waves.
BRIDGE34B.water={shore:[17.6,23],amp:[.3,1],lift:[.025,.085]};
const buildWater34b=buildWater;buildWater=function(){const r=buildWater34b.apply(this,arguments),m=typeof waterMesh!=='undefined'&&waterMesh&&waterMesh.material,W=BRIDGE34B.water,n=v=>v.toFixed(3);
 if(m&&m.isShaderMaterial&&m.vertexShader.includes('p.z+=w;')&&!m.vertexShader.includes('shore34b')){
  m.vertexShader=m.vertexShader.replace('p.z+=w;',`float shore34b=smoothstep(${n(W.shore[0])},${n(W.shore[1])},(modelMatrix*vec4(position,1.0)).z); float amp34b=mix(${n(W.amp[0])},${n(W.amp[1])},shore34b); p.z+=w*amp34b+mix(${n(W.lift[0])},${n(W.lift[1])},shore34b);`)
   .replace('*0.07; float dy','*0.07*amp34b; float dy').replace('*0.05; vN=','*0.05*amp34b; vN=');m.needsUpdate=true;BRIDGE34B.waterPatched=true;}
 return r;};

/* ---------- Stylesheet: specific enough to win over the base and life sheets in any order ---------- */
BRIDGE34B.css=`#panel .life-talk34 .request34{color:#334d43}#panel .life-talk34 .request34 h3{color:#2f5143}#panel .life-talk34 .request34 .muted{color:#5c6859}#panel .life-talk34 .request34 .life-label34{color:#6c5c39}#panel .life-talk34{margin:4px 0 16px}
@media(max-width:560px){#panel .life-tabs34{flex-wrap:wrap;overflow-x:visible;gap:4px}#panel .life-tabs34 button{flex:1 1 30%}}
#panel .life-card34.later34>svg{opacity:1}#panel .life-card34.later34>svg>*{opacity:.6}
#panel .life-card34 .life-pill34{display:table;margin-top:10px}
#life-guide34 .arrow34b{display:inline-block;margin-right:3px;transition:transform .2s;font-weight:800}`;
{const st=document.createElement('style');st.id='bridge-v34b-css';st.textContent=BRIDGE34B.css;const put=()=>document.body.appendChild(st);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',put);else put();}

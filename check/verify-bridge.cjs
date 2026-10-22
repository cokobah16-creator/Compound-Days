// Combining the lines (v34b): every fix in dist/src/bridge-v34b.js, checked on the real game logic in Node.
// The living-compound loop (life-*-v34) stays byte-identical; the bridge wraps it. Nothing is rendered here:
// the float, rod, contrast, pot stand and phone layout were also checked in headless Chromium (see README).
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {load}=require('./runtime-harness.cjs');
const checks=[];let runFn=null;
(async()=>{
 const {run}=await load();runFn=run;
 const pass=(n,info)=>{checks.push({name:n,passed:true,info});console.log('PASS',n,info?JSON.stringify(info):'');};
 const J=code=>JSON.parse(run('JSON.stringify('+code+')'));
 assert.equal(run('typeof BRIDGE34B'),'object');
 // The life modules are untouched: the bridge is the last script and no life file mentions it.
 const html=fs.readFileSync(path.join(__dirname,'..','dist','index.html'),'utf8');const order=[...html.matchAll(/<script src="src\/([^"]+)"/g)].map(m=>m[1]);
 {const b=order.indexOf('bridge-v34b.js');assert(b>=0&&order.slice(b+1).every(f=>/-v35\.js$/.test(f)),'only v35 modules load after the bridge');assert.equal(order.indexOf('life-world-v34.js'),b-1);}
 for(const f of ['life-v34.js','life-ui-v34.js','life-world-v34.js','life-v34.css'])assert(!fs.readFileSync(path.join(__dirname,'..','dist','src',f),'utf8').includes('v34b'),f+' carries no bridge edit');
 // A companion household with the real world, the authored hero and the life world.
 run("buildTextures();buildTextures2();S=newState();S.phase='play';S.ai=true;AI.on=true;S.p[0].name='Efe';S.p[1].name='Ola';players=S.p.map((p,i)=>({i,g:makeHeroAvatar(lookFor(i)),y:0,t:0,prev:[0,0],face:[0,-1],moving:false}));players.forEach((p,i)=>{scene.add(p.g);p.g.position.set(S.p[i].pos[0],0,S.p[i].pos[1]);});buildWorld();buildProps();rebuildFurniture();spawnNPCs();ensureMarket();courtLight=new THREE.PointLight();sofa.L=1.657;sofa.W=.837;enterWorld();closePanel();");
 run("var PH='',TOASTS=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}");
 const at=(x,z,i=0)=>run(`players[${i}].y=0;players[${i}].g.position.set(${x},0,${z});players[${i}].prev=[${x},${z}];`);
 const inFlatSpot=[-5.2,4.0],away=[10,10];

 // 1. Fishing: the float lies in open water, the rod is in the right hand facing it, the camera fit includes the float, the bite shows, the arm is released.
 at(12.3,13.9);at(11,13,1);run("players[0].g.rotation.y=Math.PI;S.life.catch=null;doFish(0);ACTIONS.lifeCast();");
 const fw=J("(()=>{const g=LIFE34.fishingWorld,p=players[0],b=g.userData.bob.position;p.g.updateMatrixWorld(true);const h=p.g.hero.handR.getWorldPosition(new THREE.Vector3());const grip=g.userData.grip,tip=g.userData.tip,seg=tip.clone().sub(grip);const t=Math.max(0,Math.min(1,h.clone().sub(grip).dot(seg)/seg.lengthSq()));const rocks=OBS.filter(o=>o.tag!=='water'&&hitAABB(b.x,b.z,.12,o)).length,water=OBS.some(o=>o.tag==='water'&&hitAABB(b.x,b.z,0,o));const want=Math.atan2(b.x-p.g.position.x,b.z-p.g.position.z);const pts=v21InteractionPoints(0,false);return {bob:[b.x,b.y,b.z],rocks,water,handToRod:h.distanceTo(grip.clone().addScaledVector(seg,t)),tipY:tip.y,yawErr:Math.abs(p.g.rotation.y-want),framed:pts.some(q=>Math.hypot(q.x-b.x,q.z-b.z)<.6)};})()");
 assert(fw.bob[2]>=16.6,'float out past the rocks');assert.equal(fw.rocks,0,'float clear of every rock and prop box');assert(fw.water,'float over the water');
 assert(fw.handToRod<.1,'rod in the right hand: '+fw.handToRod);assert(fw.tipY>1.6,'rod raised');assert(fw.yawErr<1e-6,'angler faces the float');assert(fw.framed,'camera fit includes the float');
 run("{const vp0=v21Viewport(0);globalThis.VP0=vp0.bottom;const oc=ov.classList.contains;ov.classList.contains=c=>c==='on';const g=panel.getBoundingClientRect;panel.getBoundingClientRect=()=>({top:420,bottom:800,height:380});globalThis.VP1=v21Viewport(0).bottom;panel.getBoundingClientRect=g;ov.classList.contains=oc;}");
 assert.equal(run('VP1'),800-420+12,'phone bottom sheet: the camera fits above it');
 for(let k=0;k<80&&run("LIFE34.fish.phase")==='waiting';k++)run('tickFishing34(.1)');assert.equal(run("LIFE34.fish.phase"),'bite');run('fishTick34b()');
 const biteY=run('LIFE34.fishingWorld.userData.bob.position.y');assert(biteY<=.081,'float dips at the bite');
 run("ACTIONS.lifeReel()");assert.equal(run('LIFE34.fishingWorld'),null);run('fishTick34b()');assert.equal(run('!!players[0].g.userData.fishPre34b'),false,'arm released after the catch');run("ACTIONS.lifeCatch({v:'release'})");
 // biteY follows the wall clock (the bob animation), so only the outcome is recorded: results files must not change between runs
 pass('Fishing: float in open water and in the camera fit, rod in the right hand facing it, a visible bite, arm released',{float:fw.bob.map(v=>+v.toFixed(2)),handToRod:+fw.handToRod.toFixed(3),tipY:+fw.tipY.toFixed(2),biteBelowRest:biteY<.12});

 // 2. A waiting cast pauses while another panel (the Menu) is open: the bite never replaces it.
 run("closePanel();S.life.catch=null;doFish(0);ACTIONS.lifeCast();openMenu();PH_MENU=PH;for(let k=0;k<80;k++)tickFishing34(.1);");
 assert.equal(run("LIFE34.fish.phase"),'waiting');assert.equal(run('PH===PH_MENU'),true);run('closePanel()');assert.equal(run('LIFE34.fish'),null);
 pass('A cast waiting behind the Menu does not bite over it; closing ends the cast');

 // 3. Request card in the talk dialogue: legible colours (WCAG AA on the cream card), above the Later button.
 const css=run('BRIDGE34B.css');const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2];};const cr=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05);};
 const talk={};for(const [k,sel] of [['title','.request34 h3'],['reward','.request34 .muted'],['label','.request34 .life-label34'],['body','.request34{']]){const m=css.match(new RegExp('#panel \\.life-talk34 '+sel.replace(/[.{]/g,c=>'\\'+c).replace('\\{','')+'\\{?color:(#[0-9a-f]{6})'));assert(m,'rule for '+k);talk[k]=+cr(m[1],'#fbf8ed').toFixed(2);assert(talk[k]>=4.5,k+' contrast '+talk[k]);}
 assert(/#panel \.life-talk34 \.request34 h3\{/.test(css));assert(run('openTalk.toString()').includes('life-talk34')&&run('openTalk.toString()').includes('act.before(card)'));
 pass('Talk-dialogue request card: title, body, label and reward reach 4.5:1 on the cream card and sit above Later',talk);

 // 4. Tasks during the guided first evening opens the evening journal; the Today page leads with the evening card.
 assert.equal(run('guided33()'),true);run("PH='';ACTIONS.tasksbtn()");assert(run("PH.includes('evening33')"),'Our tasks opens the evening journal');
 assert.equal(run("typeof htasksGuided34b"),'function');run("globalThis.STOP=0;htasksGuided34b({stopImmediatePropagation(){STOP++;}});");assert.equal(run('STOP'),1);assert(run("PH.includes('evening33')"));run('closePanel()');
 run("openLife34('today')");let today=run('PH');assert(today.indexOf('Your first evening is still here')<today.indexOf('life-grid34'),'evening card first');assert(today.includes('class="btn primary" data-act="firstEvening34"'));
 assert.equal((today.match(/Back to the compound/g)||[]).length,1,'one way back');assert(!today.includes('Rest until tomorrow'),'no early night promoted during the guided evening');
 run("S.firstEvening.completed=true;PH='';ACTIONS.tasksbtn();");assert(run("PH.includes('life34')"),'after the evening, Tasks opens the day in Palm Court');run("S.firstEvening.completed=false;closePanel();");
 pass('During the guided first evening Tasks opens its journal; Today puts the evening card first');

 // 5. Undo cannot eat the sofa: the carry placing it ends undo, and any outside change since the last edit makes Undo refuse.
 run(`S.home.storage=['lamp'];S.sofa.state='gate';sofa.g.visible=true;LIFE34.undo=null;`);at(...inFlatSpot);at(...away,1);run("dispatch('lifeSelect',{ix:0});dispatch('lifeCell',{x:1,y:3});");assert.equal(run('!!LIFE34.undo'),true);
 run("sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();");assert.equal(run('LIFE34.undo'),null,'sofaSuccess ends undo');at(...inFlatSpot);
 run("dispatch('lifeUndo',{})");assert(run("S.home.items.some(i=>i.type==='sofa')"));run("save();S=load();");assert(run("S.home.items.some(i=>i.type==='sofa')"),'sofa survives');
 run("S.home.storage.push('plant');dispatch('lifeSelect',{ix:S.home.storage.length-1});dispatch('lifeCell',{x:5,y:3});S.home.items.push({id:'ix9',type:'speaker',x:0,y:2});TOASTS=[];dispatch('lifeUndo',{});");
 assert(run("S.home.items.some(i=>i.id==='ix9')&&S.home.items.some(i=>i.type==='plant')"),'outside change kept');assert.equal(run('LIFE34.undo'),null);assert.equal(run('TOASTS[0]'),'The flat has changed since then, so there is nothing to undo.');
 run("S.home.items=S.home.items.filter(i=>i.id!=='ix9');rebuildFurniture();S.home.storage.push('lamp');dispatch('lifeSelect',{ix:S.home.storage.length-1});dispatch('lifeCell',{x:5,y:2});{const n=S.home.items.length;dispatch('lifeUndo',{});globalThis.N0=n;}");assert.equal(run('S.home.items.length'),run('N0')-1,'a clean undo still works');
 pass('Home editor Undo never restores over the placed sofa or any other outside change');

 // 6. Online: life UI is local; a remote replay keeps local fishing, selection and Undo rules, carries the sender's editor context and records the sender's catch.
 const LOC=['lifeTab','lifeGo','lifeClear','lifeSelect','lifeCancel','lifeFish','lifeCast','firstEvening34'];assert.deepEqual(J(`${JSON.stringify(LOC)}.filter(n=>!LOCAL_ONLY.has(n))`),[]);
 at(12.3,13.9);run("closePanel();S.life.catch=null;doFish(0);ACTIONS.lifeCast();");
 run("applyRemote({data:{name:'pickup',data:{i:1,id:'nope'},seed:3}});applyRemote({data:{name:'hs',data:{i:1,id:'fish'},seed:4}});");assert.equal(run("LIFE34.fish&&LIFE34.fish.phase"),'waiting','local cast survives remote replays');assert(run('!!LIFE34.fishingWorld'));
 run("globalThis.C0=S.life.metrics.caught;applyRemote({data:{name:'lifeReel',data:{i:1},seed:77}});");assert.equal(run('S.life.metrics.caught'),run('C0')+1,'remote catch recorded');assert(run('!!S.life.catch'));assert.equal(run("LIFE34.fish"),null,'the shared catch ends the local cast (check 24)');assert.equal(run('LIFE34.fishingWorld'),null);
 run("applyRemote({data:{name:'lifeCatch',data:{v:'release'},seed:78}});");assert.equal(run('S.life.catch'),null);assert.equal(run("LIFE34.fish"),null);run('closePanel()');
 run("globalThis.INS=[];{const ia=panel.insertAdjacentHTML;panel.insertAdjacentHTML=function(p,h){INS.push(h);};_silent=true;openMenu();_silent=false;panel.insertAdjacentHTML=ia;}");assert.equal(run('INS.filter(h=>h.includes("Your day in Palm Court")).length'),0);
 run("globalThis.CLS=[];{const a=panel.classList.add;panel.classList.add=c=>CLS.push(c);_silent=true;openLifePanel34('<p>x</p>','today');openLife34('market');_silent=false;panel.classList.add=a;}");assert.equal(run('CLS.length'),0,'no restyle on a remote replay');
 at(...inFlatSpot);run("S.home.items=newState().home.items;rebuildFurniture();S.home.storage=['lamp','plant','rug'];LIFE34.selection=0;LIFE34.selType34b='lamp';LIFE34.rotation=0;LIFE34.undo=null;applyRemote({data:{name:'lifeCell',data:{x:3,y:1,_ed:{sel:2,type:'rug',rot:0,item:null,undo:null}},seed:5}});");
 assert(run("S.home.items.some(i=>i.type==='rug'&&i.x===3&&i.y===1)"),'remote placement uses the sender selection');assert.deepEqual(J('[LIFE34.selection,S.home.storage[LIFE34.selection]]'),[0,'lamp'],'local selection untouched');
 run("dispatch('lifeCell',{x:1,y:2});");assert.equal(run('!!LIFE34.undo'),true);run("applyRemote({data:{name:'storeitem',data:{id:S.home.items.find(i=>i.type==='fan').id},seed:9}});");assert.equal(run('LIFE34.undo'),null,'remote change ends local undo');
 run("dispatch('lifeSelect',{ix:0});dispatch('lifeCell',{x:5,y:3});");assert.equal(run('!!LIFE34.undo'),true);run("applyRemote({data:{name:'wear',data:{i:1,id:null},seed:10}});");assert.equal(run('!!LIFE34.undo'),true,'a remote action that leaves the flat alone keeps undo');
 pass('Online: life UI stays local; remote replays keep this device’s cast and selection, carry the sender’s context, record its catch and end stale Undo');

 // 7. Pepper pot on a stand that clears the veranda wall; its veranda cell stays free.
 run("refreshGarden34()");const pot=J("[LIFE34.garden.position.y,LIFE34.garden.children.length]");assert(pot[0]>=.5,'pot lifted');
 const top=run("(()=>{const b=new THREE.Box3().setFromObject(LIFE34.garden);return b.max.y;})()"),bottom=run("(()=>{const b=new THREE.Box3().setFromObject(LIFE34.garden);return b.min.y;})()");assert(bottom<.1,'stand reaches the floor');
 assert.equal(run("fitsHome34('planter',2,4,0)"),false);assert.equal(run("fitsHome34('planter',1,4,0)||fitsHome34('planter',3,4,0)"),true);run("S.home.items=newState().home.items;for(let k=0;k<8;k++)placeAuto('planter');");assert.equal(run("S.home.items.some(i=>i.x===2&&i.y===4)"),false);
 assert(run("homeHTML34().includes('the pepper pot')"));
 pass('Pepper pot stands where the camera sees it over the veranda wall; its veranda cell stays free',{lift:+pot[0].toFixed(2),standBottom:+bottom.toFixed(2),top:+top.toFixed(2)});

 // 8. Icons: every starter piece has its own picture.
 assert.deepEqual(J("['mattress','table','fan','sofa','stove','fridge','photo'].filter(t=>furnishingIcon34(t)===furnishingIcon34('chairs'))"),[]);assert.equal(J("new Set(['mattress','table','fan','sofa','stove','fridge','photo','chairs'].map(furnishingIcon34)).size"),8);
 pass('Home editor draws the mattress, table, fan, sofa, stove, fridge and photo with their own icons');

 // 9. Journal pages: one way back, Today follows the crop, the morning after keeps the gift line, the harvest confirms.
 run("S.home.items=newState().home.items;rebuildFurniture();openLife34('garden')");assert.equal((run('PH').match(/Back to the compound/g)||[]).length,1);
 run("S.day=S.life.startDay+4;S.life.crop.stage=0;openLife34('today')");assert(run("PH.includes('<h2>Your pace. Your place.</h2>')"));run("S.life.crop.stage=3;openLife34('today')");assert(run("PH.includes('<h2>Look what you grew.</h2>')"));
 run("S.day=S.life.startDay;S.firstEvening={version:1,enabled:true,done:{move:1,shop:1,cook:1,host:1,gift:1,tomorrow:1},reward:'rug',plan:'photo',stage:'complete',completed:true,finishedDay:S.day};PH='';ACTIONS.nextday({});");
 assert(run("PH.includes('life34')&&PH.includes('Find the light with Mr. Bassey')&&PH.includes('Your gift is in the flat or Build storage.')"),'morning line kept');
 at(...inFlatSpot);run("TOASTS=[];S.life.crop.stage=3;ACTIONS.lifeHarvest();ACTIONS.lifeHarvest();");assert.deepEqual(J('TOASTS'),['Three red peppers, into the pantry.']);
 pass('Journal pages: one way back, a title that follows the crop, the morning-after line, a harvest confirmation');

 // 10. Finds: today's five first; an upgrade already in the home is not sold again.
 at(20.8,7.1);run("S.day=S.life.startDay+2;S.money=99999;openLife34('market')");const mk=run('PH');const labels=[...mk.matchAll(/<span class="life-label34">([A-Z’ ]+)/g)].map(m=>m[1].trim());assert.deepEqual(labels.slice(0,5),Array(5).fill('TODAY’S FIND'));
 run("S.home.items=S.home.items.filter(i=>i.type!=='stove');S.home.items.push({id:'ik',type:'kitchen',x:4,y:1});{const m=S.money;ACTIONS.lifeBuy({t:'kitchen'});globalThis.M0=m;}");assert.equal(run('S.money'),run('M0'));assert(!run("S.home.storage.includes('kitchen')"));
 run("openLife34('market')");assert(run("PH.includes('Already in your home')"));run("{const m=S.money;ACTIONS.lifeBuy({t:'wardrobe'});globalThis.M1=m;}");assert(run('S.money<M1'),'an ordinary find still sells');
 pass('Finds lists today’s five first and will not sell an upgrade the home already has');

 // 11. Editor: the selection follows its item; protected pieces stay; an item carried in old Build is noted.
 at(...inFlatSpot);run("S.home.items=newState().home.items;S.home.storage=['rug','plant'];rebuildFurniture();dispatch('lifeSelect',{ix:0});closePanel();dispatch('ghoststore',{i:0,ix:0});openLife34('home');");
 assert.equal(run('LIFE34.selection'),null,'no other item inherits the selection');assert(run("PH.includes('The woven rug is being carried with Build.')"));run("if(ghosts[0]){scene.remove(ghosts[0].g);ghosts[0]=null;}");
 run("S.home.storage=['lamp','rug'];dispatch('lifeSelect',{ix:1});S.home.storage.unshift('plant');openLife34('home');");assert.deepEqual(J('[LIFE34.selection,S.home.storage[LIFE34.selection]]'),[2,'rug']);run("dispatch('lifeCancel',{})");
 run("TOASTS=[];LIFE34.selectedItem='i1';openLife34('home');");assert(!run("PH.includes('data-act=\"lifeStore\"')"));run("ACTIONS.lifeStore();");assert(run("S.home.items.some(i=>i.id==='i1')"));assert.equal(run('TOASTS[0]'),'The mattress stays in the flat. You can turn it instead.');
 run("S.home.items.push({id:'ip',type:'plant',x:5,y:3});LIFE34.selectedItem='ip';ACTIONS.lifeStore();");assert(run("S.home.storage.includes('plant')&&!S.home.items.some(i=>i.id==='ip')"));
 pass('Editor selections follow their item; the sofa, mattress, table and fan cannot be stored; a carried piece is explained');

 // 12. Rotation-aware spots: a turned kitchen is used from inside the flat; the plate sits on a turned table; unrotated spots are unchanged.
 const base=J('[flatKitchenPos(),bedPos(),sofaPos()]');
 run("S.home.items=newState().home.items.filter(i=>!['stove','fridge','table'].includes(i.type));S.home.items.push({id:'k',type:'kitchen',x:5,y:1,rot:1},{id:'d',type:'dining',x:3,y:2,rot:1});S.dishes=[{name:'Jollof rice',q:80}];rebuildFurniture();");
 const kp=J('flatKitchenPos()');assert(run(`inFlat(${kp[0]},${kp[1]})&&!blocked(${kp[0]},${kp[1]},PR*.8)`),'cook spot reachable: '+kp);assert(kp[0]<-2.9,'not on the east wall');
 const plate=J('[plateMesh.position.x,plateMesh.position.z]'),dc=J("footCentre34b(S.home.items.find(i=>i.id==='d'))");assert(Math.hypot(plate[0]-dc[0],plate[1]-dc[1])<1e-6,'plate centred');
 run("S.home.items=newState().home.items;rebuildFurniture();");assert.deepEqual(J('[flatKitchenPos(),bedPos(),sofaPos()]'),base);
 pass('Turned kitchen, bed and sofa are used from a reachable side; the plate sits on a turned table',{cook:kp.map(v=>+v.toFixed(2))});

 // 13. The companion does not stand in for the player at home, by the water or at the stall; two humans both still count.
 at(...away);at(...inFlatSpot,1);assert.equal(run('home34()'),false);at(...inFlatSpot);assert.equal(run('home34()'),true);
 at(...away);at(20.8,7.1,1);assert.equal(run('market34()'),false);run('AI.on=false');assert.equal(run('market34()'),true);at(...inFlatSpot,1);assert.equal(run('home34()'),true);run('AI.on=true');
 pass('With the companion on, only the human opens home, waterside and market actions; local two-player is unchanged');

 // 14. Ada's veranda visit: a free cell away from Tunde's party spot and the pot, same depth.
 run("S.life.visitsUnlocked=true;S.life.visit={k:'ada',day:S.day};S.party=null;refreshVisitor34();");const ada=J('[npcs.ada.g.position.x,npcs.ada.g.position.z]');
 assert.equal(ada[1],6.3);assert(Math.hypot(ada[0]+4.2,ada[1]-6.5)>=1.5,'clear of Tunde');assert(Math.abs(ada[0]+5.6)>=.9,'clear of the pot');run("placeNPCs()");assert.deepEqual(J('[npcs.ada.g.position.x,npcs.ada.g.position.z]'),ada);
 pass('Ada waits on a free veranda cell clear of Tunde’s party spot and the pepper pot',{ada:ada.map(v=>+v.toFixed(2))});

 // 15. Shells on the sand; the shells marker finds the nearest one left; the fishing marker sits on the sand within the hotspot.
 const shells=J('SHELLS34');for(const [x,z] of shells){assert(z>14.5&&z<15.9,'on the sand strip');assert.equal(run(`OBS.filter(o=>hitAABB(${x},${z},.15,o)).length`),0);}
 run("S.life.shellDays={};refreshShore34();");at(shells[1][0],shells[1][1]);run("{const s=S.life.shells;ACTIONS.lifeShell({k:1});globalThis.SH=s;}");assert.equal(run('S.life.shells'),run('SH')+1);
 at(shells[2][0]-.5,shells[2][1]-1);run("navigate34('shells')");assert.deepEqual(J('[LIFE34.waypoint.x,LIFE34.waypoint.z]'),shells[2]);run("navigate34('fish')");const fm=J('[LIFE34.waypoint.x,LIFE34.waypoint.z]');assert(Math.hypot(fm[0]-12.4,fm[1]-14.2)<1.9);run('ACTIONS.lifeClear()');
 pass('Shells lie on the sand; the shells marker picks the nearest one left; the fishing marker is clear of the rocks',{shells});

 // 16. Directions pill: below the toast while it shows, back at its place after; an arrow replaces the diamond when far.
 run("{const t=document.getElementById('toast');t.classList.contains=c=>c==='on';t.getBoundingClientRect=()=>({bottom:142,height:38});LIFE34.waypoint={x:20.8,z:7.1,name:'Palm Court Finds'};lifeGuideEl34.style.display='flex';guideTick34b();globalThis.T1=lifeGuideEl34.style.top;t.classList.contains=()=>false;guideTick34b();globalThis.T2=lifeGuideEl34.style.top;LIFE34.waypoint=null;}");
 assert.equal(run('T1'),'150px');assert.equal(run('T2'),'82px');assert(run('BRIDGE34B.css').includes('.arrow34b'));
 pass('Directions pill moves below the toast while it shows and returns after');

 // 17. Journal scroll and phone tabs: re-rendering the same page keeps its scroll; a new tab starts at the top; six tabs wrap into two rows on a phone.
 run("{const oc=ov.classList.contains;ov.classList.contains=c=>c==='on';const pc=panel.classList.contains;panel.classList.contains=c=>c==='life-panel34';LIFE34.tab='home';panel.scrollTop=400;openLife34('home');globalThis.S1=panel.scrollTop;LIFE34.tab='home';panel.scrollTop=400;openLife34('market');globalThis.S2=panel.scrollTop;panel.classList.contains=pc;ov.classList.contains=oc;closePanel();}");
 assert.equal(run('S1'),400);assert.equal(run('S2'),0);assert(/@media\(max-width:560px\)\{#panel \.life-tabs34\{flex-wrap:wrap/.test(run('BRIDGE34B.css')));
 pass('Same-page journal actions keep the scroll position; phone tabs wrap so Home is always on screen');

 // 18. Online: a remote shared-panel replay (sitwait, nextday, cook) ends this device's cast, so the bite cannot reopen or replace the shared panel.
 const castOut=()=>{at(12.3,13.9);at(11,13,1);run("closePanel();S.ck=null;S.life.catch=null;doFish(0);ACTIONS.lifeCast();fishTick34b();");assert.equal(run('LIFE34.fish.phase'),'waiting');assert.equal(run('!!players[0].g.userData.fishPre34b'),true);};
 const fishState=()=>J("{fish:LIFE34.fish&&LIFE34.fish.phase,world:!!LIFE34.fishingWorld,floats:scene.children.filter(o=>o.name==='fishing_float34').length,posed:!!players[0].g.userData.fishPre34b}");
 const ended={fish:null,world:false,floats:0,posed:false};const tick6=()=>run("for(let k=0;k<60;k++){tickFishing34(.1);fishTick34b();}");
 castOut();run("applyRemote({data:{name:'sitwait',data:{t:S.time+0.5},seed:7,src:1}});globalThis.PHA=PH;");assert.deepEqual(fishState(),ended,'remote sitwait ends the cast');tick6();assert.deepEqual(fishState(),ended);assert.equal(run('PH===PHA'),true,'no bite panel after a remote sitwait');
 castOut();run("S.day=S.life.startDay+1;applyRemote({data:{name:'nextday',data:{},seed:9,src:1}});globalThis.PHA=PH;");assert(run("PH.includes('life34')"),'the remote nextday opened the day page here');assert.deepEqual(fishState(),ended,'remote nextday ends the cast');tick6();assert.equal(run('PH===PHA'),true,'the day page is not replaced by a bite');
 run("for(const k of Object.keys(ING))S.pantry[k]=5;");castOut();run("applyRemote({data:{name:'cook',data:{r:'jollof'},seed:11,src:1}});globalThis.PHA=PH;");assert(run("PHA.includes('Jollof')"),'the shared cook panel opened');assert.deepEqual(fishState(),ended,'remote cook ends the cast');tick6();assert.equal(run('PH===PHA'),true,'the cook panel is not replaced by a bite');
 run("S.ck=null;for(const k of Object.keys(ING))S.pantry[k]=0;");castOut();run("TOASTS=[];applyRemote({data:{name:'cook',data:{r:'jollof'},seed:12,src:1}});");assert.equal(run('LIFE34.fish&&LIFE34.fish.phase'),'waiting','a shared action that opens nothing here keeps the cast');assert(run('!!LIFE34.fishingWorld'));run('closePanel()');
 pass('Online: a remote sitwait, nextday or cook ends this device’s cast cleanly; the shared panel stays and no bite replaces it');

 // 19. Online: the other player reels in while this device is at the bite: the local bite ends and the shared catch shows instead of a dead Reel in.
 castOut();for(let k=0;k<80&&run("LIFE34.fish.phase")==='waiting';k++)run('tickFishing34(.1)');assert.equal(run("LIFE34.fish.phase"),'bite');assert(run("PH.includes('data-act=\"lifeReel\"')"));
 run("applyRemote({data:{name:'lifeReel',data:{i:1},seed:79,src:1}});");assert.deepEqual(fishState(),ended,'local bite, float and pose end');assert(run('!!S.life.catch'));assert(run("PH.includes('data-act=\"lifeCatch\"')&&!PH.includes('data-act=\"lifeReel\"')"),'the shared catch replaces the dead Reel in');
 run("applyRemote({data:{name:'lifeCatch',data:{v:'release'},seed:80,src:1}});closePanel();");assert.equal(run('S.life.catch'),null);
 pass('Online: a remote reel at this device’s bite ends the local bite and shows the shared catch');

 // 20. Online: a remote talk (silent hs) does not insert the request card into whatever panel is open here; a local talk still shows it.
 run("closePanel();openMenu();globalThis.PHM=PH;globalThis.INS2=[];globalThis.TALKS=0;{const ia=panel.insertAdjacentHTML,ot=openTalk;panel.insertAdjacentHTML=function(p,h){INS2.push(String(h));};openTalk=function(i,k){TALKS++;return ot(i,k);};try{applyRemote({data:{name:'hs',data:{i:1,id:'talk:tunde'},seed:3,src:1}});}finally{panel.insertAdjacentHTML=ia;openTalk=ot;}}");
 assert.equal(run('TALKS'),1,'the remote talk reached openTalk');assert.equal(run("INS2.filter(h=>h.includes('life-talk34')).length"),0,'no request card in the Menu');assert.equal(run('PH===PHM'),true);
 run("closePanel();globalThis.INS2=[];{const ia=panel.insertAdjacentHTML;panel.insertAdjacentHTML=function(p,h){INS2.push(String(h));};try{openTalk(0,'tunde');}finally{panel.insertAdjacentHTML=ia;}}closePanel();");assert.equal(run("INS2.filter(h=>h.includes('life-talk34')).length"),1,'a local talk still shows the card');
 pass('Online: a remote talk leaves this device’s open panel alone; a local talk still carries the request card');

 // 21. A turned sofa in a crowded flat: the nearest free spot around it, never a blocked one; with no free spot at all, the unrotated reach point.
 const spot=c=>J(`(()=>{const p=${c};return {p:p.map(v=>+v.toFixed(2)),free:inFlat(p[0],p[1])&&!blocked(p[0],p[1],PR*.8)};})()`);
 run("S.home.items=newState().home.items;S.home.items.push({id:'sf',type:'sofa',x:0,y:1,rot:1});rebuildFurniture();");const sClean=spot('sofaPos()');assert(sClean.free,'clean flat: the turned front');
 run("{const sf=S.home.items.find(i=>i.id==='sf'),[fw,fh]=footprint34('sofa',1);for(let y=0;y<=FLAT.rows;y++)for(let x=0;x<FLAT.cols;x++)if(x>=sf.x-1&&x<=sf.x+fw&&y>=sf.y-1&&y<=sf.y+fh&&fitsHome34('plant',x,y,0))S.home.items.push({id:'pp'+x+'_'+y,type:'plant',x,y});}rebuildFurniture();");
 const sides=J("(()=>{const it=S.home.items.find(i=>i.id==='sf'),[x,z]=footCentre34b(it),d=ITEMS.sofa,dep=d.h*FLAT.cell/2+.3,sd=d.w*FLAT.cell/2+.3;return [[x+dep,z],[x-dep,z],[x,z-sd],[x,z+sd]].filter(([a,b])=>freeSpot34b(a,b)).length;})()");assert.equal(sides,0,'every side of the turned sofa is blocked');
 const sCrowd=spot('sofaPos()');assert(sCrowd.free,'crowded flat: a free spot '+JSON.stringify(sCrowd));
 run("for(let y=0;y<=FLAT.rows;y++)for(let x=0;x<FLAT.cols;x++)if(fitsHome34('plant',x,y,0))S.home.items.push({id:'pq'+x+'_'+y,type:'plant',x,y});rebuildFurniture();");assert.deepEqual(J('sofaPos()'),J('sofaPos34b()'),'no free spot anywhere: the unrotated reach point');
 run("S.home.items=newState().home.items;rebuildFurniture();");
 pass('A turned sofa in a crowded flat is used from the nearest free spot; with none free, from its unrotated reach point',{clean:sClean.p,crowded:sCrowd.p});

 // 22. Shoreline water: the base waves (±.12 around y .03) dip below the beach slab (.012) and the ground under the sea (-.02); the bridge eases them
 // near the shore so the surface stays above both at the float and along the visible shore at every phase, while the open sea keeps its full waves.
 const wvs=J("{vs:waterMesh.material.vertexShader,W:BRIDGE34B.water,g:waterMesh.geometry.parameters,y:waterMesh.position.y,z:waterMesh.position.z,rx:waterMesh.rotation.x}");
 assert(wvs.vs.includes('shore34b')&&wvs.vs.includes('p.z+=w*amp34b+mix(')&&wvs.vs.includes('*0.07*amp34b')&&wvs.vs.includes('*0.05*amp34b'),'water vertex shader patched');
 assert(wvs.vs.includes(`smoothstep(${wvs.W.shore[0].toFixed(3)},${wvs.W.shore[1].toFixed(3)},`)&&wvs.vs.includes(`mix(${wvs.W.amp[0].toFixed(3)},${wvs.W.amp[1].toFixed(3)},shore34b)`)&&wvs.vs.includes(`mix(${wvs.W.lift[0].toFixed(3)},${wvs.W.lift[1].toFixed(3)},shore34b)`),'shader uses BRIDGE34B.water');
 assert(Math.abs(wvs.rx+Math.PI/2)<1e-9);
 {const {width:PW,height:PH2,widthSegments:GX,heightSegments:GY}=wvs.g,W=wvs.W,sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
  // the shader's wave per vertex (local x, local y; world z = position.z - local y), interpolated over PlaneGeometry's triangles as the GPU does
  const vh=(ix,iy,t,on)=>{const x=ix*PW/GX-PW/2,y=PH2/2-iy*PH2/GY,w=Math.sin(x*.35+t*1.1)*.07+Math.cos(y*.5+t*.8)*.05;if(!on)return wvs.y+w;const s=sm(W.shore[0],W.shore[1],wvs.z-y);return wvs.y+w*(W.amp[0]+(W.amp[1]-W.amp[0])*s)+W.lift[0]+(W.lift[1]-W.lift[0])*s;};
  const surf=(X,Z,t,on)=>{const fx=(X+PW/2)/(PW/GX),fy=(Z-(wvs.z-PH2/2))/(PH2/GY),ix=Math.min(GX-1,Math.floor(fx)),iy=Math.min(GY-1,Math.floor(fy)),u=fx-ix,v=fy-iy;const a=vh(ix,iy,t,on),b=vh(ix,iy+1,t,on),c=vh(ix+1,iy+1,t,on),d=vh(ix+1,iy,t,on);return u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v);};
  const T=[];for(let t=0;t<Math.PI*20;t+=.05)T.push(t);// 20π s: the joint period of both wave terms
  const range=(pts,on)=>{let lo=1,hi=-1;for(const t of T)for(const [x,z] of pts){const h=surf(x,z,t,on);lo=Math.min(lo,h);hi=Math.max(hi,h);}return [+lo.toFixed(3),+hi.toFixed(3)];};
  const floatPts=[],shorePts=[],seaPts=[],openPts=[];for(let x=10.6;x<=15.41;x+=.4)floatPts.push([x,17.25]);for(let x=-22;x<=22;x+=.5)for(const z of [16,16.5,17,17.5,18])shorePts.push([x,z]);
  for(let x=-44;x<=44;x+=2)for(let z=16;z<=45.9;z+=1)seaPts.push([x,z]);for(let x=-44;x<=44;x+=2)for(let z=24;z<=45.9;z+=1)openPts.push([x,z]);
  const wr={floatBefore:range(floatPts,false),float:range(floatPts,true),shoreBefore:range(shorePts,false),shore:range(shorePts,true),sea:range(seaPts,true),openSea:range(openPts,true),openSeaBefore:range(openPts,false)};
  assert(wr.floatBefore[0]<-.02,'the base water dips below the seabed at the float');
  assert(wr.float[0]>.012&&wr.shore[0]>.012,'float spot and shore stay above the sand: '+JSON.stringify(wr));assert(wr.sea[0]>-.02,'nowhere below the seabed');
  const swing=r=>r[1]-r[0];assert(swing(wr.openSea)>=swing(wr.openSeaBefore)-1e-9,'open sea keeps its waves');assert(swing(wr.float)<swing(wr.floatBefore)*.4,'calmer at the float');
  pass('Shoreline water stays above the sand and the seabed at the float and along the shore at every wave phase; the open sea keeps its waves',wr);}

 // 23. Toasts sit below the journal tabs while a journal page is open (and return after); the 'Already in your home' pill has its own line.
 run("{const t=document.getElementById('toast'),oc=ov.classList.contains,pc=panel.classList.contains,pq=panel.querySelector,pr=panel.getBoundingClientRect;ov.classList.contains=c=>c==='on';panel.classList.contains=c=>c==='life-panel34';panel.querySelector=q=>q==='.life-tabs34'?{getBoundingClientRect:()=>({top:84,bottom:126,height:42})}:null;panel.getBoundingClientRect=()=>({top:60,bottom:740,height:680});toast('Three red peppers, into the pantry.');globalThis.TT1=t.style.top;panel.querySelector=q=>q==='.life-tabs34'?{getBoundingClientRect:()=>({top:-200,bottom:-150,height:50})}:null;toastSpot34b();globalThis.TT2=t.style.top;ov.classList.contains=oc;panel.classList.contains=pc;panel.querySelector=pq;panel.getBoundingClientRect=pr;toastSpot34b();globalThis.TT3=t.style.top;}");
 assert.equal(run('TT1'),'134px','below the tab strip');assert.equal(run('TT2'),'68px','strip scrolled away: just inside the panel top');assert.equal(run('TT3'),'','no journal page: the base position');
 assert(run('BRIDGE34B.css').includes('#panel .life-card34 .life-pill34{display:table;margin-top:10px}'));
 pass('Journal toasts sit below the tab strip; the Already in your home pill sits on its own line under the price');

 // 24. Online: the other player's reel records the shared catch, which ends this device's cast in every phase (ready, waiting, bite) and turns an
 // open fishing panel into that catch; when the other player then decides (Keep, Sell, Let it swim) this device's catch panel closes with a toast.
 run("globalThis.CLOSES=0;{const c=closePanel;closePanel=function(){if(!silentMode())CLOSES++;return c.apply(this,arguments);};}");
 const fishName=()=>run("FISH34.find(x=>x.id===S.life.catch.id).name.toLowerCase()"),catchPanel=()=>run("PH.includes('data-act=\"lifeCatch\"')&&!PH.includes('data-act=\"lifeCast\"')&&!PH.includes('data-act=\"lifeReel\"')&&!PH.includes('Waiting for a bite')");
 const settled=(v,seed,want)=>{const n=fishName(),val=run("FISH34.find(x=>x.id===S.life.catch.id).value");run(`TOASTS=[];CLOSES=0;applyRemote({data:{name:'lifeCatch',data:{v:'${v}'},seed:${seed},src:1}});`);
  assert.equal(run('S.life.catch'),null);assert.deepEqual(fishState(),ended);assert.equal(run('CLOSES'),1,'the dead catch panel closes');assert.deepEqual(J('[BRIDGE34B.shown,BRIDGE34B.catchShown]'),[null,false]);
  const t=want(n,val);assert.deepEqual(J('TOASTS'),[t]);return t;};
 const said=[];
 // waiting: the cast ends at once and does not come back as a bite behind the shared catch
 castOut();run("applyRemote({data:{name:'lifeReel',data:{i:1},seed:81,src:1}});");assert.deepEqual(fishState(),ended,'a waiting cast ends when the shared catch is recorded');assert(run('!!S.life.catch'));assert(catchPanel(),'the waiting panel shows the shared catch');
 tick6();assert.deepEqual(fishState(),ended,'no bite comes back');assert(catchPanel());
 run("globalThis.PF=S.pantry.fish||0;");said.push(settled('keep',82,n=>`Ola kept the ${n} for the kitchen.`));assert.equal(run('S.pantry.fish'),run('PF')+1);
 // ready: the Cast button would be refused while the catch is out, so the panel shows the catch instead
 run("closePanel();S.life.catch=null;doFish(0);");assert.equal(run('LIFE34.fish.phase'),'ready');assert(run("PH.includes('data-act=\"lifeCast\"')"));
 run("applyRemote({data:{name:'lifeReel',data:{i:1},seed:83,src:1}});");assert.deepEqual(fishState(),ended,'a ready cast ends');assert(catchPanel(),'the ready panel shows the shared catch, not a refused Cast');
 run("globalThis.M0=S.money;");said.push(settled('sell',84,(n,val)=>`Ola sold the ${n} for ${run('naira('+val+')')}.`));assert(run('S.money>M0'));
 // bite (check 19's case), then the other player lets it swim
 castOut();for(let k=0;k<80&&run("LIFE34.fish.phase")==='waiting';k++)run('tickFishing34(.1)');assert.equal(run("LIFE34.fish.phase"),'bite');
 run("applyRemote({data:{name:'lifeReel',data:{i:1},seed:85,src:1}});");assert.deepEqual(fishState(),ended);assert(catchPanel());said.push(settled('release',86,n=>`Ola let the ${n} swim.`));
 // this device reeled in, the other player decided first: the local catch state ends too
 castOut();for(let k=0;k<80&&run("LIFE34.fish.phase")==='waiting';k++)run('tickFishing34(.1)');run("ACTIONS.lifeReel()");assert.equal(run('LIFE34.fish.phase'),'caught');assert(catchPanel());
 said.push(settled('keep',87,n=>`Ola kept the ${n} for the kitchen.`));
 // a remote decision while this device shows something else leaves that panel alone and says nothing
 run("closePanel();S.life.catch={id:'bonga',size:15};openMenu();globalThis.PHM=PH;TOASTS=[];CLOSES=0;applyRemote({data:{name:'lifeCatch',data:{v:'keep'},seed:88,src:1}});");
 assert.equal(run('S.life.catch'),null);assert.equal(run('PH===PHM'),true);assert.equal(run('CLOSES'),0);assert.deepEqual(J('TOASTS'),[]);run('closePanel()');
 pass('Online: the shared catch ends this device’s cast when ready, waiting or at the bite and shows in its fishing panel; the other player’s decision closes it with a toast',{toasts:said});

 // 25. The turned kitchen, bed and sofa spots are kept per layout: the hotspot scan (both players, every frame) does not repeat the search while
 // nothing in the flat changes, even with the players walking about or the crate pushed about outside the flat; any change to the items, a rotation
 // or a blocker in the flat recomputes it.
 run("globalThis.FS=0;globalThis.FSO=freeSpot34b;globalThis.CR0=[crate.position.x,crate.position.z];freeSpot34b=function(a,b){FS++;return FSO(a,b);};");
 const fresh=(sel,gap,base)=>J(`frontSpot34b(S.home.items.find(i=>${sel}),${gap},${base})`);
 const frames=n=>run(`(()=>{const f0=FS;for(let k=0;k<${n};k++){players[0].g.position.set(-6+(k%9)*.2,0,3.4+(k%5)*.2);players[1].g.position.set(-4.6-(k%7)*.2,0,4-(k%3)*.3);nearest(0);nearest(1);}return FS-f0;})()`);
 at(-6,4);at(-5,3,1);run("S.home.items=newState().home.items;S.home.items.push({id:'sf',type:'sofa',x:0,y:1,rot:1});rebuildFurniture();{const sf=S.home.items.find(i=>i.id==='sf'),[fw,fh]=footprint34('sofa',1);for(let y=0;y<=FLAT.rows;y++)for(let x=0;x<FLAT.cols;x++)if(x>=sf.x-1&&x<=sf.x+fw&&y>=sf.y-1&&y<=sf.y+fh&&fitsHome34('plant',x,y,0))S.home.items.push({id:'pp'+x+'_'+y,type:'plant',x,y});}rebuildFurniture();");
 const first=frames(1);assert(first>0,'the first frame searches');const steady=frames(120);assert.equal(steady,0,'no search while the layout stands: '+steady);
 assert.deepEqual(J('sofaPos()'),fresh("i.id==='sf'",.3,'sofaPos34b()'),'the kept spot is the searched spot');
 const changes={};const recompute=(label,code)=>{run(code);const f0=run('FS');const got=J('sofaPos()');changes[label]=run('FS')>f0;assert(changes[label],label+' recomputes');assert.deepEqual(got,fresh("i.type==='sofa'",.3,'sofaPos34b()'),label);assert.equal(frames(30),0,label+' then steady');};
 recompute('rotation',"S.home.items.find(i=>i.id==='sf').rot=3;rebuildFurniture();");
 recompute('items',"S.home.items=S.home.items.filter(i=>!i.id.startsWith('pp'));rebuildFurniture();");
 recompute('rotation before the boxes are rebuilt',"S.home.items.find(i=>i.id==='sf').rot=1;");run('rebuildFurniture()');{const f0=run('FS');J('sofaPos()');changes['furniture boxes']=run('FS')>f0;assert(changes['furniture boxes'],'a rebuild of the furniture boxes recomputes');}
 recompute('crate',"{const p=sofaPos();crate.position.set(p[0],crate.position.y,p[1]);}");assert.equal(run("(()=>{const p=sofaPos();return !!blocked(p[0],p[1],PR*.8);})()"),false,'never a spot under the crate');
 run("S.home.items=newState().home.items.filter(i=>!['stove','fridge'].includes(i.type));S.home.items.push({id:'k',type:'kitchen',x:5,y:1,rot:1});S.home.items.find(i=>i.type==='mattress').rot=1;rebuildFurniture();crate.position.set(CR0[0],crate.position.y,CR0[1]);");
 frames(1);assert.equal(frames(60),0,'turned kitchen and bed: no search while the layout stands');
 assert.equal(run('nearFlat34b(crateBox())'),false,'the crate starts outside the flat');const crateOutside=run(`(()=>{const f0=FS;for(let k=0;k<60;k++){crate.position.x=CR0[0]+(k%50)*.02;nearest(0);nearest(1);}crate.position.x=CR0[0];return FS-f0;})()`);assert.equal(crateOutside,0,'pushing the crate about outside the flat does not search: '+crateOutside);
 assert.deepEqual(J('flatKitchenPos()'),fresh("i.id==='k'",.35,'flatKitchenPos34b()'));assert.deepEqual(J('bedPos()'),fresh("i.type==='mattress'",.35,'bedPos34b()'));
 run("S.home.items=newState().home.items;rebuildFurniture();freeSpot34b=FSO;");
 pass('Turned kitchen, bed and sofa spots are kept per layout: no search per frame while the flat stands or the crate is pushed about outside it; items, rotation and blockers in the flat recompute it',{firstFrameCalls:first,steadyCallsIn120Frames:steady,crateOutsideCallsIn60Frames:crateOutside,recomputed:changes});

 const report={build:run('BUILD_ID'),passed:true,checks,method:'Actual runtime state/actions in Node with shipped Three.js, the authored hero and the life modules; remote play through applyRemote. Visual results were checked separately in headless Chromium (SwiftShader).'};fs.writeFileSync(path.join(__dirname,'results-bridge.json'),JSON.stringify(report,null,2)+'\n');
})().catch(e=>{console.error(e);let build=null;try{build=runFn&&runFn('BUILD_ID');}catch(_){}
 fs.writeFileSync(path.join(__dirname,'results-bridge.json'),JSON.stringify({build,passed:false,checks,failure:String(e&&e.stack||e)},null,2)+'\n');process.exitCode=1;});

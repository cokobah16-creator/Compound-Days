/* Palm Court: small discoveries, a growing home, and people who remember. */
const FINDS34=['plant','lamp','chairs','rug','art','planter','shelf','coffee','armchair','speaker','bed','dining','wardrobe','kitchen','tvconsole'];
const FISH34=[
 {id:'tilapia',name:'Lagoon tilapia',colour:'#759C86',value:1300,min:15,max:28,note:'A little silver-green flash in the shallows.'},
 {id:'mullet',name:'Silver mullet',colour:'#8BA9B1',value:1600,min:20,max:40,note:'Gone in a flash. Almost.'},
 {id:'catfish',name:'Catfish',colour:'#7A7C93',value:2100,min:28,max:50,note:'Whiskers, and a very serious expression.'},
 {id:'croaker',name:'Croaker',colour:'#CCB687',value:1800,min:22,max:38,note:'The afternoon has provided dinner.'},
 {id:'bonga',name:'Bonga',colour:'#B1C9CB',value:1100,min:12,max:24,note:'Small fish, big entrance.'},
 {id:'snapper',name:'Red snapper',colour:'#CC806E',value:2600,min:25,max:45,note:'A splash of red worth remembering.'}
];
const SHELLS34=[[-3,13.1],[5.6,13.5],[10,13.7]];
const LIFE34={tab:'today',fish:null,selection:null,selectedItem:null,rotation:0,undo:null,waypoint:null,world:null,garden:null,shore:null,marker:null,fishingWorld:null,noticeT:0};
function life34(){
 if(!S||!S.p)return null;
 if(!S.life)S.life={version:1,startDay:S.day,collection:{},catch:null,crop:{stage:0,wateredDay:0,waterings:0,harvests:0},shells:0,shellDays:{},orders:{},requests:{},daily:{},metrics:{caught:0,decorated:0},lastDecor:null,visit:null};
 return S.life;
}
function day34(){const l=life34();const key=String(S.day);if(!l.daily[key])l.daily[key]={caught:0,gathered:0,watered:false,helped:0,decorated:0};return l.daily[key];}
function near34(x,z,r=2.7,i){return players.some(p=>(i===undefined||p.i===i)&&Math.hypot(p.g.position.x-x,p.g.position.z-z)<r&&(p.y||0)<1);}
function home34(){return players.some(p=>inFlat(p.g.position.x,p.g.position.z));}
function market34(){return near34(20.8,7.1,3.1)||players.some(p=>p.g.position.x>13.5&&p.g.position.x<30&&Math.abs(p.g.position.z)<5);}
function neighbourNear34(k){const n=npcs[k];return !!(n&&n.g.visible&&near34(n.g.position.x,n.g.position.z,2.8));}
function offers34(){return Array.from({length:5},(_,i)=>FINDS34[((S.day-life34().startDay)%3+3)%3*5+i]);}
function owned34(t){return S.home.items.some(x=>x.type===t)||S.home.storage.includes(t);}
function paid34(t){return Math.round(ITEMS[t].price*.75);}
function navigate34(place){
 const fixed={fish:[12.4,14.2,'Fishing rocks'],garden:[-5.6,6.35,'Your pepper pot'],market:[20.8,7.1,'Palm Court Finds'],home:[-4.1,6.3,'Flat 3'],shells:[5.6,13.5,'Shells on the beach']};
 let target=fixed[place];
 if(CAST[place]){const n=npcs[place];if(!n||!n.g.visible){toast(CAST[place].name+' is out. Try again later.');return;}target=[n.g.position.x,n.g.position.z,CAST[place].name];}
 if(!target)return;LIFE34.waypoint={x:target[0],z:target[1],name:target[2]};closePanel();refreshMarker34();toast(target[2]+' is marked. Follow the distance on screen.');
}
const save34=save;save=function(){if(S&&S.phase==='play')life34();return save34();};
const enterWorld34=enterWorld;enterWorld=function(){life34();LIFE34.undo=null;LIFE34.selection=null;LIFE34.selectedItem=null;LIFE34.fish=null;LIFE34.waypoint=null;enterWorld34();buildLifeWorld34();refreshVisitor34();};
const nextDay34=ACTIONS.nextday;ACTIONS.nextday=d=>{
 const l=life34(),c=l.crop,oldDay=S.day;
 if(c.stage>0&&c.stage<3&&c.wateredDay===oldDay)c.stage++;
 l.visit=null;LIFE34.undo=null;nextDay34(d);life34();day34();refreshGarden34();refreshShore34();save();
 const ordinal=S.day-l.startDay;
 if(ordinal<=2)openLife34('today');
};

/* Fishing: readable bobber, an unhurried bite, and atomic catch decisions. */
doFish=function(i){life34();LIFE34.fish={i,phase:'ready',elapsed:0,biteAt:0};openFishing34();};
function openFishing34(){
 const l=life34();if(l.catch){const f=FISH34.find(x=>x.id===l.catch.id);openLifePanel34(`<p class="life-kicker">WATERSIDE · A LITTLE DISCOVERY</p><h2>${esc(f.name)}</h2><div class="catch34">${fishIcon34(f)}<b>${l.catch.size} cm</b></div><p>${esc(f.note)}</p><p class="small muted">Recorded in your almanac. Keep it for cooking, sell it, or let it swim.</p><div class="life-options">${btn('Keep for the kitchen','lifeCatch',{v:'keep'},'primary')}${btn('Sell for '+naira(f.value),'lifeCatch',{v:'sell'})}${btn('Let it swim','lifeCatch',{v:'release'},'quiet')}</div>`,'fish');return;}
 const f=LIFE34.fish||{phase:'ready',i:0};LIFE34.fish=f;
 const title=f.phase==='bite'?'There! The float dipped.':f.phase==='waiting'?'A quiet moment by the water.':'What’s in the water today?';
 openLifePanel34(`<p class="life-kicker">WATERSIDE · TAKE YOUR TIME</p><h2>${title}</h2><div class="fishing34 ${f.phase}"><div class="water-line34"></div><span class="float34"></span><span class="ripple34"></span><span class="ripple34 second"></span></div><p role="status">${f.phase==='bite'?'Tap Reel in when you are ready. The bite will wait for you.':f.phase==='waiting'?'Watch the float. A fish will be along in a moment.':'Six discoveries for your almanac. Each cast is a new chance.'}</p><div class="actions">${f.phase==='ready'?btn('Cast your line','lifeCast',{},'primary block'):f.phase==='bite'?btn('Reel in','lifeReel',{},'primary block'):'<button class="btn block" disabled>Waiting for a bite…</button>'}${btn('Back to the shore','close',{},'quiet')}</div>`,'fish');
}
ACTIONS.lifeFish=()=>{if(life34().catch){openFishing34();return;}if(!near34(12.4,14.2,3)){navigate34('fish');return;}doFish(players.find(p=>Math.hypot(p.g.position.x-12.4,p.g.position.z-14.2)<3)?.i||0);};
ACTIONS.lifeCast=()=>{if(life34().catch||!LIFE34.fish||LIFE34.fish.phase!=='ready'||!near34(12.4,14.2,3,LIFE34.fish.i))return;LIFE34.fish.phase='waiting';LIFE34.fish.elapsed=0;LIFE34.fish.biteAt=2.2+R()*2.2;buildFishing34();openFishing34();};
function tickFishing34(dt){const f=LIFE34.fish;if(!f||f.phase!=='waiting'||LIFE34.tab!=='fish')return;f.elapsed+=Math.min(dt,.1);if(f.elapsed>=f.biteAt){f.phase='bite';openFishing34();}}
ACTIONS.lifeReel=()=>{const l=life34(),f=LIFE34.fish;if(l.catch||!f||f.phase!=='bite')return;
 const pool=S.time>=18?[2,2,3,5,1,4]:[0,0,1,1,3,4,5];const kind=FISH34[pool[Math.floor(R()*pool.length)]];
 const size=Math.round(kind.min+R()*(kind.max-kind.min));const known=l.collection[kind.id]||(l.collection[kind.id]={count:0,best:0,firstDay:S.day});known.count++;known.best=Math.max(known.best,size);
 l.catch={id:kind.id,size};l.metrics.caught++;day34().caught++;f.phase='caught';passTime(.15);tire(f.i,2);clearFishing34();save();openFishing34();
};
ACTIONS.lifeCatch=d=>{const l=life34(),c=l.catch;if(!c||!['keep','sell','release'].includes(d.v))return;const f=FISH34.find(x=>x.id===c.id);l.catch=null;LIFE34.fish=null;
 if(d.v==='keep')addPantry('fish',1);if(d.v==='sell')S.money+=f.value;save();openLifePanel34(`<p class="life-kicker">A GOOD LITTLE DAY</p><h2>${d.v==='keep'?'Dinner, sorted.':d.v==='sell'?'A little towards home.':'Back into the blue.'}</h2><p>${d.v==='keep'?'One fresh fish is in your pantry. Mama Nkechi may have a use for it, too.':d.v==='sell'?naira(f.value)+' added to the household purse.':'The discovery stays in your almanac.'}</p><div class="actions">${btn('Cast again','lifeFish',{},'primary')}${btn('Open the almanac','lifeTab',{v:'almanac'})}${btn('Back to the shore','close',{},'quiet')}</div>`,'fish');};

/* A forgiving two-growth-day crop. Missing a watering never kills it. */
ACTIONS.lifePlant=()=>{const c=life34().crop;if(c.stage||!home34())return;c.stage=1;c.wateredDay=0;remember('Tunde left a pepper seedling for the veranda.','moment');refreshGarden34();save();openLife34('garden');};
ACTIONS.lifeWater=()=>{const c=life34().crop;if(!home34()||!c.stage||c.stage===3||c.wateredDay===S.day)return;c.wateredDay=S.day;c.waterings++;day34().watered=true;refreshGarden34();save();openLife34('garden');};
ACTIONS.lifeHarvest=()=>{const c=life34().crop;if(!home34()||c.stage!==3)return;c.stage=1;c.wateredDay=0;c.harvests++;day34().harvested=true;addPantry('pepper',3);if(c.harvests===1)remember('Three red peppers from our first veranda harvest.','moment');refreshGarden34();save();openLife34('garden');};
ACTIONS.lifeShell=d=>{const k=Number(d.k),l=life34();if(!Number.isInteger(k)||!SHELLS34[k]||l.shellDays[k]===S.day||!near34(...SHELLS34[k],1.8))return;l.shellDays[k]=S.day;l.shells++;day34().gathered++;refreshShore34();save();toast('A smooth shell. Ada makes things with these.');};

/* Market stock is deterministic across reloads; every offer lasts a full game day. */
ACTIONS.lifeBuy=d=>{const t=d.t,l=life34(),key=S.day+':'+t;if(!market34()){navigate34('market');return;}if(!offers34().includes(t)||l.orders[key]||S.money<paid34(t))return;
 spend(paid34(t));S.home.storage.push(t);l.orders[key]=true;LIFE34.undo=null;save();openLife34('market');toast(ITEMS[t].name+' is in Build storage.');};
ACTIONS.lifeSell=d=>{const k=d.k;if(!market34()){navigate34('market');return;}if(!['fish','pepper'].includes(k)||haveCount(k)<1)return;takeItem(k,1);S.money+=k==='fish'?1200:600;LIFE34.undo=null;save();openLife34('market');};

/* Three neighbours; one request each per day, with persistent callbacks. */
const REQUESTS34={
 tunde:[{title:'A seedling needs a neighbour',text:'I put a pot on your veranda. Plant it, give it water. Tomorrow we see.',goal:'Water your pepper seedling once',test:()=>life34().crop.waterings>=1,reward:'A potted plant',item:'plant'},
 {title:'Your first harvest',text:'Red peppers. That is the plant saying thank you. Bring me news when you pick them.',goal:'Harvest your veranda peppers',test:()=>life34().crop.harvests>=1,reward:'₦1,500 for your next plant',cash:1500},
 {title:'A green corner',text:'Put the plant somewhere with light. Then show me what you have done.',goal:'Place a potted plant in the flat',test:()=>placed('plant'),reward:'A balcony planter',item:'planter'}],
 nkechi:[{title:'Something fresh',text:'Bring one fish. I will show you how we stretch a meal for visitors.',goal:'Bring 1 fresh fish',test:()=>haveCount('fish')>=1,take:'fish',n:1,reward:'Beans and dodo recipe + ₦1,000',recipe:'beansdodo',cash:1000},
 {title:'A little heat',text:'Two peppers for the pot. Your own, or from the market. Good food takes neighbours.',goal:'Bring 2 peppers',test:()=>haveCount('pepper')>=2,take:'pepper',n:2,reward:'₦2,000 and a spice pack',cash:2000,ingredient:'spices'},
 {title:'Let me taste',text:'You have been busy in that kitchen. Bring one finished dish. I will give an honest opinion.',goal:'Bring 1 cooked dish',test:()=>S.dishes.length>0,dish:true,reward:'Puff-puff recipe + ₦2,500',recipe:'puffpuff',cash:2500}],
 ada:[{title:'A corner of your own',text:'Move something. Put something down because you like it there. Then tell me about it.',goal:'Place a furnishing with the home editor',test:()=>life34().metrics.decorated>=1,reward:'A piece of wall art',item:'art'},
 {title:'Found on the shore',text:'Two smooth shells. I am trying a frame that looks like it remembers the water.',goal:'Bring 2 beach shells',test:()=>life34().shells>=2,shells:2,reward:'₦1,500 for the house',cash:1500},
 {title:'I should come and see',text:'The way you describe this flat, I should inspect it myself. As a friend, this time.',goal:'Have 8 furnishings placed in the flat',test:()=>S.home.items.length>=8,reward:'Ada can visit your veranda',visit:true}]
};
function request34(k){const l=life34();return l.requests[k]||(l.requests[k]={stage:0,lastDay:0});}
function callback34(k){const r=request34(k),l=life34();if(k==='tunde')return l.crop.harvests?'I told you that plant had sense. Keep watering.':l.crop.waterings?'The leaves are standing up. You have been paying attention.':'Morning water. Remember that.';if(k==='nkechi')return r.stage>=2?'Those peppers went in the pot. People asked for seconds.':r.stage?'That fish did not go to waste. Your name came up at lunch.':'I like people who come back.';return l.lastDecor?'The '+ITEMS[l.lastDecor].name.toLowerCase()+'. You found a place for it. Good.':'A room becomes yours one decision at a time.';}
ACTIONS.lifeRequest=d=>{const k=d.k;if(!REQUESTS34[k]||!neighbourNear34(k))return;const r=request34(k),q=REQUESTS34[k][r.stage];if(!q||r.lastDay===S.day||!q.test())return;
 if(q.take)takeItem(q.take,q.n);if(q.dish)S.dishes.shift();if(q.shells)life34().shells-=q.shells;
 if(q.cash)S.money+=q.cash;if(q.item)S.home.storage.push(q.item);if(q.recipe&&!S.recipes.includes(q.recipe))S.recipes.push(q.recipe);if(q.ingredient)addPantry(q.ingredient,1);if(q.visit)life34().visitsUnlocked=true;
 r.stage++;r.lastDay=S.day;day34().helped++;aff(k,2);remember(CAST[k].name+': '+q.title+'.','moment');refreshHomeExtras();LIFE34.undo=null;save();openNeighbour34(k);};
function openNeighbour34(k){openLifePanel34(`<p class="life-kicker">YOUR PEOPLE · ${esc(CAST[k].name)}</p><h2>${esc(callback34(k))}</h2>${requestCard34(k)}${btn('All neighbours','lifeTab',{v:'people'},'quiet')}${btn('Back to the compound','close',{},'primary')}`,'people');}
const talk34=openTalk;openTalk=function(i,k){talk34(i,k);if(REQUESTS34[k]){panel.insertAdjacentHTML('beforeend',`<div class="life-talk34">${requestCard34(k)}</div>`);}};
ACTIONS.lifeVisit=()=>{const l=life34();if(!l.visitsUnlocked||!home34()||(S.party&&S.party.on&&!S.party.done))return;l.visit={k:'ada',day:S.day};refreshVisitor34();save();closePanel();toast('Ada is on the veranda. Go and say hello.');};
function refreshVisitor34(){const l=life34();if(!l||!l.visit||l.visit.day!==S.day||(S.party&&S.party.on&&!S.party.done))return;const n=npcs[l.visit.k];if(!n)return;n.route=null;n.home=[-4.5,6.3,Math.PI];n.g.visible=true;n.g.position.set(-4.5,0,6.3);n.g.rotation.y=Math.PI;}
const placeNPCs34=placeNPCs;placeNPCs=function(){placeNPCs34();refreshVisitor34();};
const reroute34=reroute;reroute=function(){reroute34();refreshVisitor34();};

/* Tap-to-place decoration, footprint-aware rotation and a single safe undo. */
function footprint34(t,rot=0){const d=ITEMS[t];return rot%2?[d.h,d.w]:[d.w,d.h];}
itemAt=function(x,y){return S.home.items.find(it=>{const [w,h]=footprint34(it.type,it.rot||0);return x>=it.x&&x<it.x+w&&y>=it.y&&y<it.y+h;});};
function fitsHome34(type,x,y,rot=0,ignore){const d=ITEMS[type];if(!d||![x,y,rot].every(Number.isInteger))return false;const [w,h]=footprint34(type,rot);
 if(x<0||x+w>FLAT.cols||y<0||y+h>FLAT.rows+1)return false;
 if(d.balcony&&y!==FLAT.rows)return false;if(d.wall&&(y!==0||rot%2))return false;
 if(!d.balcony&&!d.anywhere&&y+h>FLAT.rows)return false;if(y===FLAT.rows&&h>1)return false;
 for(let a=x;a<x+w;a++)for(let b=y;b<y+h;b++){const it=itemAt(a,b);if(it&&it.id!==ignore)return false;}return true;
}
fits=function(t,x,y,ignore){return fitsHome34(t,x,y,0,ignore);};
function fitsEditor34(t,x,y,rot=0,ignore){
 const d=ITEMS[t];if(!d)return false;
 const replaced=d.replaces&&S.home.items.find(it=>it.type===d.replaces);
 if(!fitsHome34(t,x,y,rot,ignore||(replaced&&replaced.id)))return false;
 if(d.flat||d.wall)return true;
 const [w,h]=footprint34(t,rot),[cx,cz]=cellToWorld(x,y),wx=cx+(w-1)*FLAT.cell/2,wz=y===FLAT.rows?cz:cz+(h-1)*FLAT.cell/2;
 const box={x1:wx-w*FLAT.cell/2+.1,x2:wx+w*FLAT.cell/2-.1,z1:wz-(y===FLAT.rows?.4:h*FLAT.cell/2-.1),z2:wz+(y===FLAT.rows?.4:h*FLAT.cell/2-.1)};
 return !players.some(p=>(p.y||0)<1&&hitAABB(p.g.position.x,p.g.position.z,PR,box));
}
function homeUndo34(){LIFE34.undo={items:JSON.parse(JSON.stringify(S.home.items)),storage:S.home.storage.slice(),seq:S.home.seq};}
function decorate34(t){life34().metrics.decorated++;life34().lastDecor=t;day34().decorated++;S.today.placed=(S.today.placed||0)+1;rebuildFurniture();save();}
ACTIONS.lifeSelect=d=>{const i=Number(d.ix);if(!home34()||!Number.isInteger(i)||!S.home.storage[i])return;LIFE34.selection=i;LIFE34.selectedItem=null;LIFE34.rotation=0;openLife34('home');};
ACTIONS.lifeCancel=()=>{LIFE34.selection=null;LIFE34.selectedItem=null;LIFE34.rotation=0;openLife34('home');};
ACTIONS.lifeCell=d=>{if(!home34())return;const x=Number(d.x),y=Number(d.y),ix=LIFE34.selection;
 if(ix===null){const it=itemAt(x,y);LIFE34.selectedItem=it?it.id:null;openLife34('home');return;}
 const t=S.home.storage[ix],r=LIFE34.rotation;if(!t||!fitsEditor34(t,x,y,r))return;
 if(ITEMS[t].replaces&&placed(t)){toast('That upgrade is already in your home.');return;}
 homeUndo34();if(ITEMS[t].replaces)S.home.items=S.home.items.filter(it=>it.type!==ITEMS[t].replaces);
 S.home.storage.splice(ix,1);S.home.items.push({id:'i'+(++S.home.seq),type:t,x,y,rot:r});LIFE34.selection=null;LIFE34.selectedItem=null;decorate34(t);openLife34('home');};
ACTIONS.lifeRotate=()=>{if(!home34())return;if(LIFE34.selection!==null){const t=S.home.storage[LIFE34.selection];if(t&&!ITEMS[t].wall)LIFE34.rotation=(LIFE34.rotation+1)%4;openLife34('home');return;}
 const it=S.home.items.find(x=>x.id===LIFE34.selectedItem);if(!it||ITEMS[it.type].wall)return;const r=((it.rot||0)+1)%4;if(!fitsEditor34(it.type,it.x,it.y,r,it.id)){toast('That turn needs more space. Move clear of the furniture, too.');return;}homeUndo34();it.rot=r;decorate34(it.type);openLife34('home');};
ACTIONS.lifeStore=()=>{if(!home34())return;const i=S.home.items.findIndex(x=>x.id===LIFE34.selectedItem);if(i<0)return;homeUndo34();const it=S.home.items.splice(i,1)[0];S.home.storage.push(it.type);LIFE34.selectedItem=null;rebuildFurniture();save();openLife34('home');};
ACTIONS.lifeUndo=()=>{if(!home34()||!LIFE34.undo)return;const u=LIFE34.undo;S.home.items=u.items;S.home.storage=u.storage;S.home.seq=u.seq;LIFE34.undo=null;LIFE34.selection=null;LIFE34.selectedItem=null;rebuildFurniture();save();openLife34('home');};
const rebuildFurn34=rebuildFurniture;rebuildFurniture=function(){rebuildFurn34();FURN_OBS=[];S.home.items.forEach((it,i)=>{const d=ITEMS[it.type],g=furnGroup.children[i];if(!g)return;const [w,h]=footprint34(it.type,it.rot||0),[cx,cz]=cellToWorld(it.x,it.y);const wx=cx+(w-1)*FLAT.cell/2,wz=it.y===FLAT.rows?cz:cz+(h-1)*FLAT.cell/2;g.rotation.y=(it.rot||0)*Math.PI/2;g.position.x=d.wall?cx:wx;if(!d.wall)g.position.z=wz;
 if(!d.flat&&!d.wall)FURN_OBS.push({x1:wx-w*FLAT.cell/2+.1,x2:wx+w*FLAT.cell/2-.1,z1:wz-(it.y===FLAT.rows?.4:h*FLAT.cell/2-.1),z2:wz+(it.y===FLAT.rows?.4:h*FLAT.cell/2-.1),tag:'furn'});
 });};

const dispatch34=dispatch;dispatch=function(name,d){if(!['lifeCell','lifeSelect','lifeCancel','lifeRotate','lifeStore','lifeUndo','lifeTab','close'].includes(name))LIFE34.undo=null;return dispatch34(name,d);};
const close34=closePanel;closePanel=function(){clearFishing34();LIFE34.fish=null;return close34();};
const journal34=journal33;ACTIONS.firstEvening34=journal34;ACTIONS.eveningJournal=journal34;ACTIONS.tasksbtn=()=>openLife34('today');
ACTIONS.lifeTab=d=>openLife34(d.v);ACTIONS.lifeGo=d=>navigate34(d.v);ACTIONS.lifeClear=()=>{LIFE34.waypoint=null;refreshMarker34();};
const menu34=openMenu;openMenu=function(){menu34();panel.insertAdjacentHTML('afterbegin',btn('Your day in Palm Court','lifeTab',{v:'today'},'primary block'));};
const taskList34=tasks;tasks=function(){if(guided33())return taskList34();const l=life34(),d=day34();return [{txt:l.crop.stage===3?'Harvest your peppers':'Visit your veranda garden',done:d.watered||d.harvested},{txt:'A discovery by the water',done:d.caught>0},{txt:'Help a neighbour',done:d.helped>0}];};

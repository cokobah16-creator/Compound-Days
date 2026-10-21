const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {load}=require('./runtime-harness.cjs');
(async()=>{
 const {run}=await load(),checks=[];
 const pass=name=>{checks.push({name,passed:true});console.log('PASS',name);};
 const act=(name,data={})=>run(`dispatch(${JSON.stringify(name)},${JSON.stringify(data)})`);
 const home=()=>run("players.forEach((p,i)=>{p.y=0;p.g.position.set(-4.2+i*.8,0,6.6)});");
 const approach=k=>run(`npcs[${JSON.stringify(k)}].g.visible=true;players[0].g.position.copy(npcs[${JSON.stringify(k)}].g.position);players[0].y=0`);
 run("buildTextures();buildTextures2();S=newState();S.phase='play';S.p[0].name='Chika';S.p[1].name='Obi';players=S.p.map((p,i)=>({i,g:makeHeroAvatar(lookFor(i)),y:0,t:0}));players.forEach(p=>scene.add(p.g));rebuildFurniture();spawnNPCs();ensureMarket();courtLight=new THREE.PointLight();");home();
 run('save();S=load()');const prior=run('JSON.stringify({p:S.p,items:S.home.items,recipes:S.recipes})');run('delete S.life;life34();save();S=load()');
 assert.equal(run('JSON.stringify({p:S.p,items:S.home.items,recipes:S.recipes})'),prior);assert.equal(run('S.life.startDay'),1);pass('Additive migration preserves names, bases, belongings and recipes');

 act('lifePlant');act('lifeWater');act('lifeWater');assert.equal(run('S.life.crop.waterings'),1);assert.equal(run('S.life.crop.stage'),1);
 act('nextday');assert.equal(run('S.life.crop.stage'),2);assert.equal(run('S.day'),2);home();act('lifeWater');act('nextday');assert.equal(run('S.life.crop.stage'),3);home();
 const peppers=run("haveCount('pepper')");act('lifeHarvest');act('lifeHarvest');assert.equal(run("haveCount('pepper')"),peppers+3);assert.equal(run('S.life.crop.harvests'),1);assert.equal(run('S.life.crop.stage'),1);
 act('nextday');assert.equal(run('S.life.crop.stage'),1);assert.equal(run('load().life.crop.harvests'),1);pass('Two watered nights yield exactly three peppers; duplicate actions and dry days are safe');

 run('players.forEach(p=>p.g.position.set(12.4,0,14.2))');act('lifeFish');act('lifeReel');assert.equal(run('S.life.catch'),null);act('lifeCast');assert.equal(run('LIFE34.fish.phase'),'waiting');run('for(let n=0;n<60;n++)tickFishing34(.1)');assert.equal(run('LIFE34.fish.phase'),'bite');
 act('lifeReel');act('lifeReel');assert.equal(run('S.life.metrics.caught'),1);assert.equal(run('Object.keys(S.life.collection).length'),1);run('S=load()');assert(run('S.life.catch'));const fishBefore=run("haveCount('fish')");act('lifeCatch',{v:'keep'});act('lifeCatch',{v:'keep'});assert.equal(run("haveCount('fish')"),fishBefore+1);
 run("doFish(0);ACTIONS.lifeCast();LIFE34.fish.phase='bite';ACTIONS.lifeReel();");const worth=run('FISH34.find(f=>f.id===S.life.catch.id).value'),cash=run('S.money');act('lifeCatch',{v:'sell'});act('lifeCatch',{v:'sell'});assert.equal(run('S.money'),cash+worth);assert.equal(run('S.life.metrics.caught'),2);pass('Fishing waits for a bite, records catches and settles each pending catch only once across reload');

 const stock=run('JSON.stringify(offers34())');run('save();S=load()');assert.equal(run('JSON.stringify(offers34())'),stock);
 assert.equal(run('new Set(Array.from({length:3},(_,day)=>FINDS34.slice(day*5,day*5+5)).flat()).size'),15);
 const buyCash=run('S.money'),buyStorage=run('S.home.storage.length');act('lifeBuy',{t:'plant'});assert.equal(run('S.money'),buyCash);assert.equal(run('S.home.storage.length'),buyStorage);
 run('players[0].g.position.set(20.8,0,7.2)');const price=run("paid34('plant')");act('lifeBuy',{t:'plant'});act('lifeBuy',{t:'plant'});assert.equal(run('S.money'),buyCash-price);assert.equal(run('S.home.storage.length'),buyStorage+1);
 act('lifeBuy',{t:'bed'});assert.equal(run('S.money'),buyCash-price);run('save();S=load()');act('lifeBuy',{t:'plant'});assert.equal(run('S.money'),buyCash-price);
 const sellBefore=run('S.money'),fishCount=run("haveCount('fish')");act('lifeSell',{k:'fish'});assert.equal(run('S.money'),sellBefore+1200);assert.equal(run("haveCount('fish')"),fishCount-1);pass('Rotating market offers persist; remote, duplicate and out-of-stock purchases cannot charge the purse');

 home();const giftBefore=run('S.home.storage.length');act('lifeRequest',{k:'tunde'});assert.equal(run('S.home.storage.length'),giftBefore);
 approach('tunde');act('lifeRequest',{k:'tunde'});act('lifeRequest',{k:'tunde'});assert.equal(run("request34('tunde').stage"),1);assert.equal(run('S.home.storage.length'),giftBefore+1);
 act('nextday');approach('tunde');const rewardBefore=run('S.money');act('lifeRequest',{k:'tunde'});assert.equal(run("request34('tunde').stage"),2);assert.equal(run('S.money'),rewardBefore+1500);
 run("addPantry('fish',1)");approach('nkechi');const delivery=run("haveCount('fish')");act('lifeRequest',{k:'nkechi'});act('lifeRequest',{k:'nkechi'});assert.equal(run("haveCount('fish')"),delivery-1);assert.equal(run("request34('nkechi').stage"),1);assert.equal(run("S.recipes.filter(x=>x==='beansdodo').length"),1);pass('Neighbour requests require proximity, consume once, reward once and advance on different days');

 run('players[0].g.position.set(...[SHELLS34[0][0],0,SHELLS34[0][1]])');act('lifeShell',{k:0});act('lifeShell',{k:0});assert.equal(run('S.life.shells'),1);assert.equal(run('LIFE34.shore.children.length'),10);
 act('nextday');run('players[0].g.position.set(...[SHELLS34[0][0],0,SHELLS34[0][1]])');act('lifeShell',{k:0});assert.equal(run('S.life.shells'),2);pass('Beach shells can be gathered once per spot per in-game day');

 home();run("S.home.storage.push('plant');rebuildFurniture()");const count=run('S.home.items.length'),storageCount=run('S.home.storage.length');act('lifeSelect',{ix:storageCount-1});act('lifeCell',{x:5,y:3});assert.equal(run('S.home.items.length'),count+1);assert.equal(run('S.home.storage.length'),storageCount-1);assert.equal(run('S.life.lastDecor'),'plant');
 act('lifeUndo');assert.equal(run('S.home.items.length'),count);assert.equal(run('S.home.storage.length'),storageCount);act('lifeUndo');assert.equal(run('S.home.storage.length'),storageCount);
 act('lifeSelect',{ix:storageCount-1});act('lifeCell',{x:5,y:3});act('lifeCell',{x:5,y:3});act('lifeStore');assert.equal(run('S.home.items.length'),count);act('lifeUndo');assert.equal(run('S.home.items.length'),count+1);assert.equal(run('S.home.storage.length'),storageCount-1);
 assert.equal(run("fitsHome34('bed',5,3,0)"),false);assert.equal(run("fitsHome34('bed',3,2,1)"),true);assert.equal(run("fitsHome34('bed',3,3,1)"),false);
 run("S.home.storage.push('bed')");act('lifeSelect',{ix:run('S.home.storage.length-1')});act('lifeCell',{x:0,y:0});assert.equal(run("placed('mattress')"),false);assert.equal(run("placed('bed')"),true);act('lifeUndo');assert.equal(run("placed('mattress')"),true);
 run("players[0].g.position.set(...[cellToWorld(3,3)[0],0,cellToWorld(3,3)[1]])");assert.equal(run("fitsEditor34('plant',3,3)"),false);pass('Home placement, storage and undo conserve inventory; rotated footprints, upgrades and player clearance are checked');

 home();run("S.home.storage.push('bed');S.home.items=S.home.items.filter(it=>it.type!=='plant');rebuildFurniture()");act('lifeSelect',{ix:run('S.home.storage.length-1')});act('lifeRotate');act('lifeCell',{x:3,y:2});
 assert.equal(run("S.home.items.find(it=>it.type==='bed').rot"),1);assert(run("FURN_OBS.some(o=>Math.abs((o.x2-o.x1)-.7)<.001&&Math.abs((o.z2-o.z1)-1.6)<.001)"));
 act('lifeTab',{v:'market'});run('players[0].g.position.set(20.8,0,7.2)');act('lifeBuy',{t:'wardrobe'});assert.equal(run('LIFE34.undo'),null);act('lifeUndo');assert(run("S.home.storage.includes('wardrobe')"));pass('Rotated models use matching collision bounds; a transaction invalidates decoration undo');

 approach('ada');act('lifeRequest',{k:'ada'});assert.equal(run("request34('ada').stage"),1);act('nextday');approach('ada');act('lifeRequest',{k:'ada'});assert.equal(run('S.life.shells'),0);assert.equal(run("request34('ada').stage"),2);
 act('nextday');run("while(S.home.items.length<8){if(!placeAuto('plant'))break;}rebuildFurniture()");approach('ada');act('lifeRequest',{k:'ada'});assert.equal(run('S.life.visitsUnlocked'),true);home();act('lifeVisit');assert.equal(run('npcs.ada.g.position.z'),6.3);run('save();S=load();placeNPCs()');assert.equal(run('npcs.ada.g.position.z'),6.3);act('nextday');assert.equal(run('S.life.visit'),null);pass('Ada notices decorating, accepts shells and visits after her third story, with reload-safe placement');

 run('buildLifeWorld34();buildLifeWorld34();refreshGarden34();refreshShore34()');assert.equal(run("OBS.filter(o=>o.tag==='finds34').length"),1);assert.equal(run("scene.children.filter(o=>o.name==='palm_court_finds34').length"),1);
 assert.equal(run("(()=>{let ok=true;for(const g of [LIFE34.world,LIFE34.garden,LIFE34.shore])g.traverse(o=>{if(o.geometry){const a=o.geometry.attributes.position.array;for(const n of a)if(!Number.isFinite(n))ok=false;}});return ok;})()"),true);
 for(const tab of ['today','almanac','garden','market','people','home']){home();run(`openLife34(${JSON.stringify(tab)})`);assert.equal(run('panel.innerHTML.includes("undefined")'),false);assert.equal(run('panel.innerHTML.includes("NaN")'),false);}
 run('save();ACTIONS.continue()');assert.equal(run('S.p[0].name'),'Chika');assert.equal(run('S.life.metrics.caught'),2);assert.equal(run('S.life.crop.harvests'),1);assert.equal(run("request34('ada').stage"),3);pass('World additions remain finite and singular; all journal tabs and complete resume keep progress');

 const report={build:run('BUILD_ID'),passed:true,checks,method:'Actual shipped runtime, Three.js and glTF in Node. Browser preview served, but its WebGL context was unavailable. No visual/GPU/phone claim.'};
 fs.writeFileSync(path.join(__dirname,'results-v34.json'),JSON.stringify(report,null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1});

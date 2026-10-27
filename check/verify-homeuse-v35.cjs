// Home uses (v35, dist/src/homeuse-v35.js; art brief section 5): the TV console's screen glows from 18:00 until the household sleeps,
// and a tray with a jug and cups stands on the coffee table while neighbours are visiting (the veranda evening and the housewarming).
// Checked on the real game logic in Node with the shipped Three.js and the catalogue pieces; nothing is rendered here, so "shown" means
// the object is in the scene graph under the placed piece with it and every parent visible. The checks run twice in child processes and
// the two reports must match, and once more in a copy of the game without homeuse-v35.js, where every check must fail. Clock35, Math.random,
// Date.now and performance.now are stubbed; no wall-clock value reaches the results.
// Prints one PASS or FAIL line per check and writes check/results-homeuse-v35.json.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const OUT=path.join(__dirname,'results-homeuse-v35.json');
const GAME=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');
const TAG=/<script src="src\/homeuse-v35\.js"><\/script>\n?/;
const NAMES=[
 '1. Loads after audio-v35.js with HOMEUSE35 its only new top-level name; no tick hook (the same TICK_HOOKS as the build without it), no light, no texture or asset file, and it writes nothing into the saved state',
 '2. TV console (catalogue pieces): the screen and its soft halo are shown on the lamp\'s hours, from 18:00 to 06:00, exactly when the lamp is lit, and dark by day; the lit plane sits just in front of the television\'s body, inside its glass',
 '3. Until the household sleeps: the real Sleep (the night panel) puts the screen out for the rest of the evening, the morning is dark, the next evening it glows again, and the base\'s past-midnight sleep puts it out too',
 '4. Only when placed: no TV console or coffee table, or one in storage, means no glow and no tray in the scene; each hangs on its own piece, so it turns and moves with it, and leaves when the piece is picked up',
 '5. The veranda evening: the tray appears on the coffee table within a frame of the neighbours setting off from the gate, stays through every line and their walk away, and goes within a frame of the last one leaving; it rests on the table top, inside its footprint',
 '6. The housewarming: the tray is there from the real party start through every round and the reveal (the guests stay) until the household sleeps and the morning comes; not while the party is only being planned',
 '7. Nothing per frame beyond a cheap state check: 300 real frames with nothing changing rebuild nothing, change no visibility and create no object or material; the check changes the scene once when 18:00 comes and once when the neighbours arrive',
 '8. Survives reload: Continue at 19:00 with a party on brings back the glow and the tray; after Sleep a reload finds the household up again (the screen glows, as the evening goes on); a reload mid-evening ends the visit and the tray goes with it',
 '9. Old saves: a save from before v35 (no life, no born35, ₦55,000) with both pieces placed shows the glow and the tray, and no new field is written',
 '10. Online: the visuals follow the shared household document (time, party, pieces) applied with applyState, the shared Sleep replayed from the other device puts the screen out, and with no veranda evening online the tray waits for a party',
 '11. Before the catalogue loads: on the grey stand-in console a dark set of the television\'s size carries the glow, the tray sits on the stand-in table, and when the catalogue television arrives the stand-in set goes',
 '12. Without homeuse-v35.js every check above fails (the same checks run in a copy of the game with its script tag removed)',
 '13. Determinism: two runs give identical reports'];

function variantDir(fn){const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd35-homeuse-'));
 for(const f of ['assets','src','data'])if(fs.existsSync(path.join(GAME,f)))fs.symlinkSync(path.join(GAME,f),path.join(d,f));
 fs.writeFileSync(path.join(d,'index.html'),fn(fs.readFileSync(path.join(GAME,'index.html'),'utf8')));return d;}

function inner(){
 const {load,parse}=require('./runtime-harness.cjs');const checks=[];let run=null,context=null;
 const step=async(idx,fn)=>{const name=NAMES[idx];try{const info=await fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});}
  catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});if(process.env.DEBUG35)console.error(name.slice(0,3),e&&e.stack);}};
 (async()=>{
  ({run,context}=await load());
  const J=code=>JSON.parse(run('JSON.stringify('+code+')'));
  const r3=v=>Math.round(v*1000)/1000;
  // determinism helpers (spec 11.2)
  run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;");
  run("var T35=1790000000000;if(typeof CLOCK35!=='undefined')CLOCK35.fn=()=>T35;var PERF35=1000;performance={now:()=>PERF35};");
  run("var PH='',TOASTS=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}");
  const base={tick:run('TICK_HOOKS.length')};
  // the catalogue pieces the two uses sit on (and the lamp's stand-in is built in)
  for(const id of ['tv_console','television','coffee_table']){context.prop35=await parse('assets/props/'+id+'.gltf.json');context.propId35=id;
   run("{let ex;prop35.scene.traverse(o=>{if(!ex&&o.userData.prop)ex=o.userData;});prop35.extras=ex||{prop:propId35,size:[1,1,1]};prop35.scene=propMerge(prop35.scene,propId35);PROPS.cache[propId35]=prop35;}");}
  // a companion household (verify-evening's set-up): the real world, the authored hero, NPCs and the life world
  run("buildTextures();buildTextures2();S=newState();S.phase='play';S.ai=true;AI.on=true;S.p[0].name='Efe';S.p[1].name='Ola';players=S.p.map((p,i)=>({i,g:makeHeroAvatar(lookFor(i)),y:0,t:0,prev:[0,0],face:[0,-1],moving:false}));players.forEach((p,i)=>{scene.add(p.g);p.g.position.set(S.p[i].pos[0],0,S.p[i].pos[1]);});buildWorld();buildProps();rebuildFurniture();spawnNPCs();ensureMarket();courtLight=new THREE.PointLight();sofa.L=1.657;sofa.W=.837;enterWorld();closePanel();");
  const at=(x,z,i=0)=>run(`players[${i}].y=0;players[${i}].g.position.set(${x},0,${z});players[${i}].prev=[${x},${z}];`);
  // the real base frame (input, the companion, TICK_HOOKS, NPCs, cameras); renderFrame only sets the view's aspect, as nothing is drawn
  run("var FT35=0;var frames35=n=>{const rf=renderFrame;renderFrame=function(){const si=singleIdx(),c=cams[si>=0?si:0];c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();};try{for(let k=0;k<n;k++){T35+=33;PERF35+=33;last=FT35;FT35+=33;tick(FT35);}}finally{renderFrame=rf;}};");
  const frames=n=>run(`frames35(${n})`);
  // what the player can see: an object found by name in the live scene, and whether it and every parent up to the scene are visible
  run(`var HU35={find:n=>{let f=null;scene.traverse(o=>{if(!f&&o.name===n)f=o;});return f;},
   shown:n=>{const o=HU35.find(n);if(!o)return null;for(let p=o;p;p=p.parent){if(!p.visible)return false;if(p===scene)return true;}return false;},
   piece:t=>{const ix=S.home.items.findIndex(i=>i.type===t);return ix<0?null:furnGroup.children[ix];},
   under:(n,t)=>{const o=HU35.find(n),g=HU35.piece(t);if(!o||!g)return false;for(let p=o;p;p=p.parent)if(p===g)return true;return false;},
   box:o=>{o.updateWorldMatrix(true,true);const b=new THREE.Box3().setFromObject(o);return [b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z];}};`);
  const screen=()=>run("HU35.shown('homeuse35_screen')"),halo=()=>run("HU35.shown('homeuse35_halo')"),tray=()=>run("HU35.shown('homeuse35_tray')");
  // a fresh household: day d at time t, the guided evening done, the sofa in, the given pieces placed, no evening pending unless asked
  const fresh=(day,time,pieces,o={})=>{run(`S=newState();S.phase='play';S.ai=true;AI.on=true;S.p[0].name='Efe';S.p[1].name='Ola';S.firstEvening.completed=true;S.firstEvening.plan='garden';S.firstEvening.invitationSeen=true;S.sofa.state='placed';S.day=${day};S.time=${time};life34();
   S.home.items=S.home.items.filter(i=>i.type!=='table');S.home.items.push(...${JSON.stringify(pieces)});NET.on=false;enterWorld();closePanel();PH='';EVENING35.checkAt=${o.evening?0:'1e18'};`);
   at(-5.2,4.4);at(-4.4,4.0,1);};
  const TV={id:'tv35',type:'tvconsole',x:0,y:1,rot:0},CF={id:'cf35',type:'coffee',x:2,y:2,rot:0},LAMP={id:'lp35',type:'lamp',x:5,y:3,rot:0};
  const both=[TV,CF];
  // the real housewarming actions: a dish, no music, Tunde invited, start; on a dry evening (the base's rooftop rain draw is held off)
  const PARTYGO="{const c=chance;chance=()=>false;try{dispatch('partystart');}finally{chance=c;}}";
  const startParty=()=>{run("S.dishes.push({recipe:'jollof',name:'Jollof rice',quality:70,spec:false,tags:[],day:S.day});dispatch('partysetup');dispatch('ptdish',{ix:S.dishes.length-1});dispatch('ptmusic',{v:'none'});dispatch('ptinv',{k:'tunde'});"+PARTYGO+"closePanel();");
   assert.equal(run('!!(S.party&&S.party.on)'),true,'the party started');};

  await step(0,()=>{
   const html=fs.readFileSync(path.join(GAME,'index.html'),'utf8'),src=fs.readFileSync(path.join(GAME,'src/homeuse-v35.js'),'utf8');
   const ia=html.indexOf('<script src="src/audio-v35.js"></script>'),ih=html.indexOf('<script src="src/homeuse-v35.js"></script>');
   assert(ia>0&&ih>ia,'homeuse-v35.js is loaded after audio-v35.js');
   const tops=[...src.matchAll(/^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)].map(m=>m[1]);assert.deepEqual(tops,['HOMEUSE35'],'top-level names: '+tops.join());
   assert.equal(run('typeof HOMEUSE35'),'object');
   assert.equal(run('[typeof tvBuild,typeof trayBuild,typeof groupFor,typeof extrasPrev,typeof lampPrev,typeof SCREEN].join()'),'undefined,undefined,undefined,undefined,undefined,undefined','helpers stay in the block');
   // no tick hook: the same TICK_HOOKS as the build without the module (measured in a child process on a copy without the tag)
   const d=variantDir(h=>{assert(TAG.test(h),'the homeuse tag is in index.html');return h.replace(TAG,'');});let other;
   try{other=JSON.parse(cp.execFileSync(process.execPath,[__filename,'--hooks'],{env:{...process.env,COMPOUND_GAME_DIR:d},encoding:'utf8'}).trim().split('\n').pop());}finally{fs.rmSync(d,{recursive:true,force:true});}
   assert.equal(other.homeuse,'undefined');assert.equal(base.tick,other.tick,'the same number of tick hooks with and without the module');
   assert.equal(run("TICK_HOOKS.filter(h=>/HOMEUSE35|homeuse/.test(String(h))).length"),0);
   // no light, no texture or asset, no storage, no write to the saved state in the source
   assert(!/new THREE\.\w*Light|TextureLoader|GLTFLoader|assets\/|\.gltf|localStorage|sessionStorage|fetch\(/.test(src),'no light, loader, asset or storage');
   assert(!/\bS(?:\.[\w$]+|\[[^\]]+\])+\s*(?:=(?!=)|\+\+|--|\+=|-=)/.test(src),'never assigns into S');
   // in play: at 19:00 with both pieces and a party the scene has as many lights as without them, and the saved state names nothing new
   fresh(2,19,[]);frames(2);const lights0=run('(()=>{let n=0;scene.traverse(o=>{if(o.isLight)n++;});return n;})()');const keys0=J('Object.keys(S).sort()');
   fresh(2,19,both);run("S.party={on:true,done:false,guests:[],indoor:false,round:0};");frames(2);
   assert.equal(screen(),true,'the screen glows at 19:00');assert.equal(tray(),true,'the tray is out for the party');
   assert.equal(run('(()=>{let n=0;scene.traverse(o=>{if(o.isLight)n++;});return n;})()'),lights0,'no new light');
   run('save()');const saved=run("localStorage.getItem(KEY)");assert(!/homeuse|HOMEUSE|tray|screen/i.test(saved),'nothing of the module in the save');
   assert.deepEqual(J('Object.keys(S).filter(k=>k!=="party").sort()'),keys0.filter(k=>k!=='party'),'no new top-level save field');
   run('S.party=null;');
   return {tickHooks:base.tick,lights:lights0};});

  await step(1,()=>{
   fresh(2,12,[TV,CF,LAMP]);frames(1);
   assert.equal(run("HU35.under('homeuse35_screen','tvconsole')"),true,'the glow hangs on the TV console');
   const hours=[6,12,17.9,18,19,21.5,23.9,24.1],rows=[];
   for(const h of hours){run(`S.time=${h};`);frames(1);const lit=run('lampLight.intensity>0'),s=screen(),hl=halo();rows.push([h,s]);
    assert.equal(s,lit,`at ${h} the screen is ${s?'lit':'dark'} and the lamp ${lit?'lit':'dark'}`);assert.equal(hl,s,'the halo goes with the screen at '+h);}
   assert.equal(rows.find(r=>r[0]===17.9)[1],false);assert.equal(rows.find(r=>r[0]===18)[1],true);assert.equal(rows.find(r=>r[0]===12)[1],false);
   // where the light sits: the catalogue television's body is 0.91 x 0.52 m from 0.08 m up with its front face 0.0198 m forward, the glass 0.86 x 0.48 m at 0.34 m
   run('S.time=19;');frames(1);
   const g=J(`(()=>{const t=HU35.find('prop_television'),s=HU35.find('homeuse35_screen'),k=t.scale.y;s.updateWorldMatrix(true,false);t.updateWorldMatrix(true,false);
    const inv=new THREE.Matrix4().copy(t.matrixWorld).invert(),c=new THREE.Vector3().setFromMatrixPosition(s.matrixWorld).applyMatrix4(inv);
    const n=new THREE.Vector3(0,0,1).transformDirection(s.matrixWorld),f=new THREE.Vector3(0,0,1).transformDirection(t.matrixWorld);
    const sc=new THREE.Vector3();s.matrixWorld.decompose(new THREE.Vector3(),new THREE.Quaternion(),sc);
    return {local:[c.x,c.y,c.z],w:0.84*sc.x/k,h:0.46*sc.y/k,facing:n.dot(f),k,body:HU35.find('homeuse35_tvbody').visible};})()`);
   assert(Math.abs(g.local[0])<0.005&&Math.abs(g.local[1]-0.34)<0.005,'centred on the glass: '+JSON.stringify(g.local));
   const gap=g.local[2]-0.01975;assert(gap>=0.003&&gap<=0.01,'just in front of the body: '+r3(gap)+' m');
   assert(g.w<=0.86&&g.h<=0.48&&g.w>=0.8&&g.h>=0.43,'inside the glass, filling it');assert(g.facing>0.999,'faces the way the television faces');
   assert.equal(g.body,false,'no stand-in set on the catalogue television');
   return {hours:rows.map(r=>r[0]+(r[1]?' lit':' dark')).join(', '),gapMm:r3(gap*1000),screenM:[r3(g.w),r3(g.h)]};});

  await step(2,()=>{
   fresh(2,19.5,both);frames(2);assert.equal(screen(),true,'glowing at 19:30');
   run("dispatch('sleep')");assert(run("PH.includes('night')"),'the night panel is up');frames(1);
   assert.equal(screen(),false,'Sleep puts the screen out');run('S.time=21;');frames(1);assert.equal(screen(),false,'still out later that night');
   run("dispatch('nextday')");frames(1);assert.equal(run('S.day'),3);assert.equal(screen(),false,'dark in the morning');
   run('S.time=17.95;');frames(1);assert.equal(screen(),false);run('S.time=18;EVENING35.checkAt=1e18;');frames(1);assert.equal(screen(),true,'glows again the next evening');
   // the base's past-midnight sleep: the real frames carry the clock over 24.2
   run('closePanel();S.time=24.18;');let k=0;for(;k<400&&!run('S._late');k++)frames(1);assert(run('S._late'),'the base put them to sleep after midnight');
   frames(1);assert.equal(screen(),false,'out after the past-midnight sleep');
   run("dispatch('nextday')");frames(1);assert.equal(screen(),false,'dark the next morning');
   return {framesToMidnightSleep:k};});

  await step(3,()=>{
   fresh(2,19,[]);frames(1);assert.equal(run("HU35.find('homeuse35_screen')"),null,'no TV console, no glow');assert.equal(run("HU35.find('homeuse35_tray')"),null,'no coffee table, no tray');
   run("S.party={on:true,done:false,guests:[],indoor:false,round:0};S.home.storage.push('tvconsole','coffee');rebuildFurniture();");frames(1);
   assert.equal(run("HU35.find('homeuse35_screen')"),null,'a TV console in storage: no glow');assert.equal(run("HU35.find('homeuse35_tray')"),null,'a coffee table in storage: no tray');
   run(`S.home.storage=[];S.home.items.push(${JSON.stringify(TV)},${JSON.stringify(CF)});rebuildFurniture();`);frames(1);
   assert.equal(screen(),true);assert.equal(tray(),true);assert.equal(run("HU35.under('homeuse35_screen','tvconsole')&&HU35.under('homeuse35_tray','coffee')"),true,'each on its own piece');
   const facing=()=>J("(()=>{const s=HU35.find('homeuse35_screen');s.updateWorldMatrix(true,false);const n=new THREE.Vector3(0,0,1).transformDirection(s.matrixWorld);const p=new THREE.Vector3().setFromMatrixPosition(s.matrixWorld);return [Math.round(n.x*1000)/1000,Math.round(n.z*1000)/1000,p.x,p.z];})()");
   const f0=facing();assert.deepEqual(f0.slice(0,2),[0,1],'faces into the room (+z) unturned');
   run("S.home.items.find(i=>i.type==='tvconsole').rot=1;rebuildFurniture();");frames(1);const f1=facing();
   assert(Math.abs(Math.abs(f1[0])-1)<0.001&&Math.abs(f1[1])<0.001,'turned a quarter with the piece: '+JSON.stringify(f1));
   const tray0=J("HU35.box(HU35.find('homeuse35_tray'))");run("S.home.items.find(i=>i.type==='coffee').x=3;rebuildFurniture();");frames(1);const tray1=J("HU35.box(HU35.find('homeuse35_tray'))");
   assert(Math.abs((tray1[0]-tray0[0])-0.9)<0.001,'the tray moved one cell with the table');assert.equal(tray(),true);
   run("S.home.items=S.home.items.filter(i=>i.type!=='tvconsole'&&i.type!=='coffee');S.home.storage.push('tvconsole','coffee');rebuildFurniture();");frames(1);
   assert.equal(run("HU35.find('homeuse35_screen')"),null,'picked up: the glow goes');assert.equal(run("HU35.find('homeuse35_tray')"),null,'picked up: the tray goes');
   run('S.party=null;');
   return {facingTurned:f1.slice(0,2)};});

  await step(4,()=>{
   fresh(3,18.5,both,{evening:true});at(-4.1,6.4);at(-5.2,4.0,1);
   assert.equal(tray(),false,'no tray before the neighbours come');assert.equal(run("HU35.find('homeuse35_tray')!==null"),true);
   let k=0;for(;k<60&&run('EVENING35.state')==='idle';k++)frames(1);assert.equal(run('EVENING35.state'),'arriving','the evening started');
   frames(1);assert.equal(tray(),true,'within a frame of the guests setting off');
   const seen={arriving:0,talking:0,leaving:0};let lines=0,f=0;
   for(;f<6000;f++){const st=run('EVENING35.state');if(st==='idle')break;seen[st]++;assert.equal(tray(),true,'the tray stays while '+st+' (frame '+f+')');
    if(st==='talking'&&seen.talking%20===0){run('T35+=300;EVENING35.lastNext=-1e9;EVENING35.next();');lines++;}frames(1);}
   assert.equal(run('EVENING35.state'),'idle','the guests have gone');assert(seen.arriving>0&&seen.talking>0&&seen.leaving>0,'every phase seen: '+JSON.stringify(seen));
   frames(1);assert.equal(tray(),false,'within a frame of the last guest leaving');
   // the tray stands on the catalogue table's top, inside its footprint
   run("HOMEUSE35.tray.visible=true;");const tb=J("HU35.box(HU35.find('homeuse35_tray'))"),cb=J("HU35.box(HU35.find('prop_coffee_table'))");run("HOMEUSE35.sync();HOMEUSE35.shown.tray=null;HOMEUSE35.sync();");
   assert(Math.abs(tb[1]-cb[4])<0.005,'on the top: tray from '+r3(tb[1])+' m, table top '+r3(cb[4])+' m');
   assert(tb[0]>=cb[0]&&tb[3]<=cb[3]&&tb[2]>=cb[2]&&tb[5]<=cb[5],'inside the table footprint');assert.equal(tray(),false);
   return {framesByPhase:seen,lines,trayOnTableTopM:r3(cb[4]),trayHeightM:r3(tb[4]-tb[1])};});

  await step(5,()=>{
   fresh(2,19,both);run("S.dishes.push({recipe:'jollof',name:'Jollof rice',quality:70,spec:false,tags:[],day:S.day});");
   run("dispatch('partysetup');dispatch('ptdish',{ix:S.dishes.length-1});dispatch('ptmusic',{v:'none'});dispatch('ptinv',{k:'tunde'});");frames(1);assert(run("PH.length>0"),'the planning panel');
   assert.equal(tray(),false,'not while the party is only being planned');
   run(PARTYGO);assert.equal(run('S.party&&S.party.on'),true,'the party started');assert.equal(run('S.party.round'),1,'a dry party, first round');frames(1);assert.equal(tray(),true,'the tray is out from the first knock');
   let rounds=0;for(;rounds<10&&!run('S.party.done');rounds++){run("dispatch('ptpick',{i:0,v:S.party.opts[0].id});dispatch('ptpick',{i:1,v:(S.party.opts[1]||S.party.opts[0]).id});dispatch('ptgo');");frames(1);
    if(!run('S.party.done'))assert.equal(tray(),true,'through round '+(rounds+1));}
   assert.equal(run('S.party.done'),true,'the party reached its reveal');frames(1);assert.equal(tray(),true,'the guests stay after the reveal, and so does the tray');
   run("closePanel();dispatch('sleep')");frames(1);assert.equal(tray(),true,'still out on the night page (the guests go home in the morning)');assert.equal(screen(),false,'the screen is out once they sleep');
   run("dispatch('nextday')");frames(1);assert.equal(run('S.party'),null);assert.equal(tray(),false,'gone in the morning');
   return {rounds};});

  await step(6,()=>{
   fresh(2,17.5,both);frames(2);
   run("var HUC35={attach:0,changed:0};{const a=HOMEUSE35.attach;HOMEUSE35.attach=function(){HUC35.attach++;return a.apply(this,arguments);};const s=HOMEUSE35.sync;HOMEUSE35.sync=function(){const r=s.apply(this,arguments);if(r)HUC35.changed++;return r;};}");
   // every object in the scene, and the visibility of everything on the furniture (the pieces, the glow, the tray)
   const snap=()=>run("(()=>{let n=0,f=0,v=0;scene.traverse(o=>{n++;});furnGroup.traverse(o=>{f++;if(o.visible)v++;});return n+' objects, furniture '+f+'/'+v+' visible';})()");
   const s0=snap(),mats0=run('Object.keys(MATS).length');
   // 300 real frames standing still at 17:30-ish: nothing changes
   run('S.time=17.5;');for(let k=0;k<30;k++){run('S.time=17.5;');frames(10);}
   assert.equal(run('HUC35.attach'),0,'nothing rebuilt');assert.equal(run('HUC35.changed'),0,'no visibility changed');
   assert.equal(snap(),s0,'the same objects, the same visibility');assert.equal(run('Object.keys(MATS).length'),mats0,'no new material');
   // the check itself makes nothing: a thousand calls create no Object3D (ids are sequential) and change nothing
   const ids=run("(()=>{const a=new THREE.Object3D().id;for(let k=0;k<1000;k++)HOMEUSE35.sync();return new THREE.Object3D().id-a-1;})()");assert.equal(ids,0,'no object made by the check');
   // the clock reaching 18:00 changes the scene once; the neighbours arriving once more
   run('S.time=17.99;');frames(1);const before=run('HUC35.changed');run('S.time=18;');frames(5);assert.equal(run('HUC35.changed')-before,1,'one change at 18:00');assert.equal(screen(),true);
   run("S.party={on:true,done:false,guests:[],indoor:false,round:0};");frames(5);assert.equal(run('HUC35.changed')-before,2,'one more when the guests come');assert.equal(tray(),true);
   run('S.party=null;');frames(1);
   return {objectsVisible:s0,frames:300,attachCalls:0,stateChanges:2};});

  await step(7,()=>{
   fresh(2,19,both);startParty();
   run('S.time=19;save();S=null;ACTIONS.continue();closePanel();');frames(2);assert(Math.abs(run('S.time')-19)<0.05,'19:00 again');
   assert.equal(screen(),true,'the glow is back after Continue');assert.equal(tray(),true,'the party resumed with its tray');
   run("S.party=null;rebuildFurniture();dispatch('sleep');");frames(1);assert.equal(screen(),false);
   run('closePanel();S.time=19.2;save();S=null;ACTIONS.continue();closePanel();');frames(2);assert.equal(screen(),true,'after a reload the household is up and the screen glows');
   // mid-evening reload: the visit ends with the reload, and the tray goes
   fresh(3,18.5,both,{evening:true});at(-4.1,6.4);at(-5.2,4.0,1);let k=0;for(;k<60&&run('EVENING35.state')==='idle';k++)frames(1);frames(2);assert.equal(tray(),true);
   run('save();S=null;ACTIONS.continue();closePanel();EVENING35.checkAt=1e18;');frames(2);assert.equal(run('EVENING35.state'),'idle');assert.equal(tray(),false,'no guests after the reload, no tray');
   return {};});

  await step(8,()=>{
   run(`S=newState();S.phase='play';S.ai=true;AI.on=true;S.money=55000;delete S.life;delete S.born35;S.day=4;S.time=19;S.sofa.state='placed';S.firstEvening.completed=true;
    S.home.items.push(${JSON.stringify(TV)},${JSON.stringify(CF)});
    save();var OLD35=JSON.parse(localStorage.getItem(KEY));S=null;ACTIONS.continue();closePanel();EVENING35.checkAt=1e18;`);
   frames(2);assert.equal(run('S.money'),55000);assert.equal(run('S.born35'),undefined,'still an old save');
   assert.equal(screen(),true,'the glow on an old save');assert.equal(tray(),false);
   run('save()');const now=J("JSON.parse(localStorage.getItem(KEY))");const old=J('OLD35');
   const added=Object.keys(now).filter(k=>!(k in old)),homeAdded=Object.keys(now.home).filter(k=>!(k in old.home));
   assert(!added.some(k=>/home|tv|tray|screen|glow|use/i.test(k)),'no new field for the uses: '+added.join());assert.deepEqual(homeAdded,[],'nothing new in home');
   startParty();frames(1);assert.equal(tray(),true,'the tray at an old household\'s party');
   run('S.party=null;');
   return {fieldsAddedByOtherModules:added.sort()};});

  await step(9,()=>{
   fresh(3,15,both);frames(1);assert.equal(screen(),false);
   run("NET.on=true;NET.myIndex=1;NET.isHost=false;NET.otherOnline=true;NET.room=new Proxy({},{get:()=>()=>Promise.resolve()});_stateSig=null;");
   try{
    // the host's document: 19:00, both pieces where the host put them (the TV turned), no party
    const doc=t=>run(`(()=>{const d=JSON.parse(JSON.stringify(S));d.time=${t};d.rev=(S.rev||0)+1;d.home.items.find(i=>i.type==='tvconsole').rot=${t>=19?1:0};return JSON.stringify(d);})()`);
    run(`applyState(JSON.parse(${JSON.stringify(doc(19))}));`);frames(1);
    assert.equal(screen(),true,'the shared time lights the screen');assert.equal(run("HU35.under('homeuse35_screen','tvconsole')"),true,'on the piece from the shared document');
    assert.equal(run('Math.round(HU35.piece("tvconsole").rotation.y*1000)'),1571,'turned as the document says');
    // no veranda evening online: on the veranda at 18:30 on day 3 nothing comes, so no tray
    at(-4.1,6.4,1);run('EVENING35.checkAt=0;S.time=18.5;');frames(30);assert.equal(run('EVENING35.state'),'idle','no evening online');assert.equal(tray(),false);
    run(`(()=>{const d=JSON.parse(JSON.stringify(S));d.rev=(S.rev||0)+1;d.time=19.4;d.party={on:true,done:false,guests:['tunde'],indoor:false,round:1,log:[],f:{welcomed:{},served:{},danced:0,photo:false,intro:false,story:false,kitchen:0},served:[],music:'none',dishIx:[]};applyState(d);})()`);frames(1);
    assert.equal(tray(),true,'the shared party brings the tray out');
    // the other device pressed Sleep: the shared action replays here
    run("applyRemote({data:{name:'sleep',data:{},seed:5}})");frames(1);assert.equal(screen(),false,'the replayed Sleep puts the screen out');
    run("applyRemote({data:{name:'nextday',data:{},seed:6}})");frames(1);assert.equal(tray(),false,'the shared morning sends the tray away');assert.equal(screen(),false);
   }finally{run("NET.on=false;NET.otherOnline=false;NET.room=null;_stateSig=null;closePanel();");}
   return {};});

  await step(10,()=>{
   run("var HIDE35={};for(const k of ['tv_console','television','coffee_table']){HIDE35[k]=PROPS.cache[k];delete PROPS.cache[k];}");
   try{
    fresh(2,19,both);run("S.party={on:true,done:false,guests:[],indoor:false,round:0};");frames(1);
    assert.equal(run("HU35.find('prop_television')"),null,'the catalogue is not loaded');assert.equal(screen(),true);assert.equal(run("HU35.shown('homeuse35_tvbody')"),true,'the stand-in set is there');
    const g=J(`(()=>{const tv=HOMEUSE35.tv,b=HU35.box(tv.getObjectByName('homeuse35_tvbody').children[0]),s=HU35.box(tv.getObjectByName('homeuse35_screen')),c=HU35.box(HU35.piece('tvconsole').children[0]);return {b,s,c};})()`);
    assert(Math.abs(g.b[1]-(g.c[4]+0.08))<0.002,'the set stands on the 0.5 m stand-in box');
    const gap=g.s[5]-g.b[5];assert(gap>=0.003&&gap<=0.01,'the glow just in front of the set: '+r3(gap));
    assert(g.s[0]>g.b[0]&&g.s[3]<g.b[3]&&g.s[1]>g.b[1]&&g.s[4]<g.b[4],'inside its face');
    const tb=J("HU35.box(HU35.find('homeuse35_tray'))"),cb=J("HU35.box(HU35.piece('coffee').children[0])");
    assert(Math.abs(tb[1]-cb[4])<0.005,'the tray on the stand-in table top');assert.equal(tray(),true);
   }finally{run("for(const k in HIDE35)PROPS.cache[k]=HIDE35[k];");}
   run("propArrived('television');");frames(1);
   assert(run("HU35.find('prop_television')!==null"),'the catalogue television arrived');assert.equal(run("HU35.shown('homeuse35_tvbody')"),false,'the stand-in set goes');assert.equal(screen(),true);
   run('S.party=null;');
   return {};});

  process.stdout.write('\n'+JSON.stringify({build:run('BUILD_ID'),checks})+'\n');
 })().catch(e=>{process.stdout.write('\n'+JSON.stringify({build:null,checks,crash:String(e&&e.message||e).split('\n')[0]})+'\n');});
}

function hooks(){const {load}=require('./runtime-harness.cjs');
 load().then(({run})=>{console.log(JSON.stringify({tick:run('TICK_HOOKS.length'),homeuse:run('typeof HOMEUSE35')}));}).catch(e=>{console.error(e);process.exitCode=1;});}

function outer(){
 const once=env=>{let out='';try{out=cp.execFileSync(process.execPath,[__filename,'--run'],{env,encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']});}catch(e){out=String(e.stdout||'');}
  try{return JSON.parse(out.trim().split('\n').pop());}catch(e){return {build:null,checks:[],crash:'no report'};}};
 const runs=[once(process.env),once(process.env)];
 const D=NAMES.length-2,a=runs[0],checks=NAMES.slice(0,D).map(n=>a.checks.find(c=>c.name===n)||{name:n,passed:false,failure:a.crash||'did not run'});
 // check 12: the same checks in a copy of the game without the module must all fail
 let without=null;const d=variantDir(h=>h.replace(TAG,''));try{without=once({...process.env,COMPOUND_GAME_DIR:d});}finally{fs.rmSync(d,{recursive:true,force:true});}
 const wc=NAMES.slice(0,D).map(n=>without.checks.find(c=>c.name===n)||{name:n,passed:false,failure:without.crash||'did not run'});
 const stillPass=wc.filter(c=>c.passed).map(c=>c.name.split('.')[0]);
 checks.push(stillPass.length===0?{name:NAMES[D],passed:true,info:{failedWithout:wc.length,firstFailures:wc.slice(0,D).map(c=>c.name.split('.')[0]+': '+String(c.failure).slice(0,90))}}
  :{name:NAMES[D],passed:false,failure:'checks still passing without the module: '+stillPass.join()});
 const allOk=checks.every(c=>c.passed),same=JSON.stringify(runs[0])===JSON.stringify(runs[1]);
 checks.push(allOk&&same?{name:NAMES[D+1],passed:true}:{name:NAMES[D+1],passed:false,failure:!allOk?'checks 1-'+(D+1)+' must pass':'the two runs differ'});
 for(const c of checks)console.log(c.passed?'PASS':'FAIL',c.name,c.passed?(c.info?JSON.stringify(c.info):''):'— '+c.failure);
 const passed=checks.every(c=>c.passed);
 const report={build:a.build,passed,checks,method:'Actual runtime state, frames and actions in Node with the shipped Three.js, the catalogue pieces, the authored hero, the life modules and the v35 modules; clock35, Math.random, Date.now and performance.now stubbed; "shown" read from the scene graph; run twice in child processes and compared, and once without homeuse-v35.js. Nothing is rendered here.'};
 fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');console.log(`${checks.filter(c=>c.passed).length}/${checks.length} passed`);if(!passed)process.exitCode=1;
}
if(process.argv[2]==='--run')inner();else if(process.argv[2]==='--hooks')hooks();else outer();

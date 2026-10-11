// Run against the locally served game; uses a separate, temporary browser profile.
const fs=require('fs'),path=require('path'),assert=require('assert');const {chromium}=require('playwright');const launch=()=>chromium.launch();
const root=path.resolve(__dirname,'..'),out=root+'/review';fs.mkdirSync(out,{recursive:true});fs.mkdirSync(out+'/replay-frames',{recursive:true});
const report={build:'19.0',browser:'Playwright Chromium (local runtime)',checks:[],errors:[]};
const pass=(name,detail)=>{report.checks.push({name,passed:true,detail});console.log('PASS',name,detail||'');};
const controlled=()=>{window.__frames=[];window.requestAnimationFrame=f=>{window.__frames.push(f);return window.__frames.length};window.cancelAnimationFrame=()=>{};window.__step=async n=>{for(let k=0;k<n;k++){if(typeof last!=='undefined')last=performance.now()-33.333;for(const f of window.__frames.splice(0))f(performance.now());await new Promise(r=>setTimeout(r,5));}};};
async function ready(p){await p.waitForFunction(()=>HERO.state==='ready'&&Object.keys(WARDROBE.cache).length===13&&Object.keys(PROPS.cache).length===30,null,{timeout:60000,polling:100});}
async function setup(p){await p.evaluate(()=>{S=newState();S.phase='play';S.p[0].name='Efe';S.p[0].hair='low';S.p[1].name='Ola';AI.on=false;enterWorld();closePanel();for(const p of players){p.g.rotation.y=FACE_YAW;}updateCameras(2);updateHUD();renderFrame();});}
(async()=>{const b=await launch(),p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>report.errors.push(e.message));await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.addInitScript(controlled);await p.goto((process.env.COMPOUND_GAME_URL||'http://127.0.0.1:8000'),{waitUntil:'domcontentloaded'});await ready(p);await setup(p);
const assets=await p.evaluate(()=>({rigs:players.map(p=>p.g.rig),wardrobe:Object.keys(WARDROBE.cache).length,props:Object.keys(PROPS.cache).length,failed:{...WARDROBE.failed,...PROPS.failed},render:{...renderer.info.render}}));assert.deepEqual(assets.rigs,['hero','hero']);assert.equal(Object.keys(assets.failed).length,0);pass('Both players and all assets load',assets);
await p.screenshot({path:out+'/gameplay.png'});
const before=await p.evaluate(()=>players.map(p=>p.g.position.toArray()));await p.keyboard.down('s');await p.keyboard.down('ArrowDown');await p.evaluate(()=>__step(14));await p.keyboard.up('s');await p.keyboard.up('ArrowDown');const moved=await p.evaluate(()=>players.map(p=>({pos:p.g.position.toArray(),clip:p.g.current})));assert(moved.every((v,i)=>Math.hypot(v.pos[0]-before[i][0],v.pos[2]-before[i][2])>.25));pass('Independent keyboard movement',moved);await setup(p);
// Actual equipped geometry, rendered with a review camera inside the same scene.
await p.addStyleTag({content:'body.reviewing #topbar,body.reviewing #halves,body.reviewing #divider,body.reviewing #toast,body.reviewing #touch,body.reviewing #grade{display:none!important}'});
await p.setViewportSize({width:480,height:640});
for(const [hair,outfit] of [['low','tee'],['braids','ankara'],['locs','kaftan']]){
 for(const [view,yaw] of [['front',0],['side',Math.PI/2],['back',Math.PI]]){
  await p.evaluate(({hair,outfit,yaw})=>{document.body.classList.add('reviewing');S.p[0].hair=hair;S.p[0].outfit=outfit;refreshAvatar(0);players[0].g.position.set(2.6,0,8.6);players[0].g.rotation.y=yaw;players[1].g.visible=false;for(let k=0;k<8;k++)animAvatar(players[0].g,k*.05,false,false,0,.05);const c=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.05,100);c.position.set(2.6,1.25,12.1);c.lookAt(2.6,1.0,8.6);renderer.setSize(innerWidth,innerHeight);renderer.setScissorTest(false);renderer.setViewport(0,0,innerWidth,innerHeight);renderer.render(scene,c);},{hair,outfit,yaw});
  await p.screenshot({path:out+'/'+outfit+'-'+view+'.png'});
 }
 await p.evaluate(()=>{players[0].g.rotation.y=0;for(let k=0;k<12;k++)animAvatar(players[0].g,k*.04,true,false,1.3,.04);const c=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.05,100);c.position.set(3.4,1.35,12.0);c.lookAt(2.6,1.0,8.6);renderer.render(scene,c);});await p.screenshot({path:out+'/'+outfit+'-walk.png'});
 pass('Look renders in idle and walk',outfit);
}
await p.setViewportSize({width:960,height:600});await p.evaluate(()=>{document.body.classList.remove('reviewing');renderer.setSize(innerWidth,innerHeight);});await setup(p);
// Clear the existing pushable crate through movePlayer before the carry fixture.
const cratePush=await p.evaluate(()=>{const p=players[0],old=p.g.position.clone(),before=crate.position.clone();p.g.position.set(-1.75,0,1.8);for(let k=0;k<95;k++)movePlayer(p,0,-.03);p.g.position.copy(old);return{before:before.toArray(),after:crate.position.toArray()};});assert(cratePush.after[2]<.3);pass('Crate push clears the passage',cratePush);
await p.evaluate(()=>{doAct(0,{id:'sofa'});doAct(1,{id:'sofa'});for(let k=0;k<12;k++){for(const p of players)animAvatar(p.g,k*.1,false,'low',0,.1);updateSofaCarry();}updateCameras(2);both().forEach(i=>hotspotCache[i]=nearest(i));updateHUD();document.getElementById('toast').classList.remove('on');renderFrame();});assert(await p.evaluate(()=>sofa.carrying));pass('Two-person pickup and carryLow',await p.evaluate(()=>players.map(p=>p.g.current)));
await p.screenshot({path:out+'/carrying.png'});
const route=JSON.parse(fs.readFileSync(root+'/tools/carry-route.json','utf8')).path;assert(route&&route.length);await p.evaluate(route=>{window.__route=route;window.__routeIndex=0;window.__stuck=0;window.__carryStep=()=>{
 if(S.sofa.state==='placed')return 'placed';const cfg=window.__route[window.__routeIndex];if(!cfg)return 'route-ended';const [cx,cz,yaw]=cfg,d=(sofa.L+.3)/2;
 const targets=[-1,1].map(s=>[cx+Math.cos(yaw)*d*s,cz-Math.sin(yaw)*d*s]);const delta=players.map((p,i)=>[targets[i][0]-p.g.position.x,targets[i][1]-p.g.position.z]);const gap=Math.max(...delta.map(d=>Math.hypot(...d)));
 if(gap<.007){window.__routeIndex++;window.__stuck=0;return 'next';}
 const f=Math.min(1,.030/gap);const before=players.map(p=>p.g.position.clone());players.forEach((p,i)=>{p.prev=[p.g.position.x,p.g.position.z];movePlayer(p,delta[i][0]*f,delta[i][1]*f);p.t+=.025;animAvatar(p.g,p.t,true,'low',1.2,.025);});updateSofaCarry();
 const distance=players.reduce((sum,p,i)=>sum+p.g.position.distanceTo(before[i]),0);window.__stuck=distance<.0001?window.__stuck+1:0;if(window.__stuck>30)return 'blocked';
 updateCameras(.025);updateFades(.025);both().forEach(i=>hotspotCache[i]=nearest(i));updateHUD();return 'moving';};},route);
let done=false,frame=0,status='';for(;frame<600;frame++){
 const state=await p.evaluate(()=>{let status='';for(let i=0;i<4;i++){status=window.__carryStep();if(['blocked','placed','route-ended'].includes(status))break;}document.getElementById('toast').classList.remove('on');renderFrame();return{status,idx:window.__routeIndex,sofa:S.sofa.state,positions:players.map(p=>p.g.position.toArray())};});
 const bytes=await p.screenshot({type:'jpeg',quality:78});fs.writeFileSync(out+'/replay-frames/'+String(frame).padStart(4,'0')+'.jpg',bytes);
 if(frame%60===0)console.log('REPLAY',frame,state.idx,state.status);
 if(state.status==='placed'){done=true;status=state;break;}if(['blocked','route-ended'].includes(state.status)){status=state;break;}
}
assert(done,'Carry did not finish: '+JSON.stringify(status));pass('Carry through gate, turn and home doorway',{frames:frame+1,...status});await p.screenshot({path:out+'/sofa-placed.png'});
await p.evaluate(()=>{closePanel();S.p[0].outfit='tee';S.p[0].hair='low';S.p[1].hair='locs';S.p[1].headwear='wrap';S.p[1].outfit='kaftan';save();});const saved=await p.evaluate(()=>({looks:S.p.map(p=>({hair:p.hair,headwear:p.headwear||'none',outfit:p.outfit,skin:p.skin})),sofa:S.sofa.state}));await p.reload({waitUntil:'domcontentloaded'});await ready(p);await p.evaluate(()=>{ACTIONS.continue();});const reloaded=await p.evaluate(()=>({looks:S.p.map(p=>({hair:p.hair,headwear:p.headwear||'none',outfit:p.outfit,skin:p.skin})),sofa:S.sofa.state}));assert.deepEqual(saved,reloaded);pass('Save and reload both looks, headwear and placed sofa',reloaded);
report.errors=[...new Set(report.errors)];assert.equal(report.errors.length,0);fs.writeFileSync(out+'/test-results.json',JSON.stringify(report,null,2));console.log('COMPLETE',report.checks.length);await b.close();process.exit(0);
})().catch(e=>{report.failure=String(e);fs.writeFileSync(out+'/test-results.json',JSON.stringify(report,null,2));console.error(e);process.exit(1)});

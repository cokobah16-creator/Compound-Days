#!/usr/bin/env node
// Real Three.js WebGL bench for the V71 Player 1 file on a phone-sized page (headless Chromium, software GL).
// Run: node check/bench-garment-v71.cjs [out-dir]     (default artifacts/v71-garment; needs playwright + Chromium)
//
// 1. Boot: the V71 file is the one requested and it loads; no page error, no failed request from the game.
// 2. Creator, Clothes tab: the underarm panel is looked at from the left three-quarter view in Sky and in Coral.
//    Every panel vertex is skinned, projected and the pixel under it read. In Coral none of them may be blue or
//    black: that is what the delivered candidate's panel showed here (the whole atlas through the wrong UVs, and
//    no recolour), and what an untinted panel would show.
// 3. The world: both players are moved in, Player 1 walks, then carries (the game is told Player 1 holds a roof
//    prop) and the real loop must pick Carry standing and WalkCarry walking, with the hands in front of the hips.
// 4. ?hero=v61 loads the original V61 file, for the side-by-side pictures.
// The PNGs are the renderer's own canvas. This is not a physical phone and not a frame-rate test.
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const out=path.resolve(process.argv[2]||'artifacts/v71-garment'); fs.mkdirSync(out,{recursive:true});
let playwright; try{ playwright=require('playwright'); }catch(e){ console.error('Install playwright and its Chromium browser first'); process.exit(2); }
const root=path.resolve(process.env.COMPOUND_GAME_DIR||path.join(__dirname,'../dist'));
const mimes={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let u; try{ u=decodeURIComponent(new URL(req.url,'http://localhost').pathname); }catch{ res.writeHead(400).end(); return; }
 const file=path.resolve(root,'.'+(u==='/'?'/index.html':u));
 if(!file.startsWith(root+path.sep)){ res.writeHead(403).end(); return; }
 fs.stat(file,(err,s)=>{ if(err||!s.isFile()){ res.writeHead(404).end('Not Found'); return; }
  res.writeHead(200,{'content-type':mimes[path.extname(file)]||'application/octet-stream','content-length':s.size,'cache-control':'no-store'}); fs.createReadStream(file).pipe(res); });
});

// In the page: render the creator's preview scene from a yaw around the figure at chest height and return the PNG;
// with probe, also the colour under every skinned vertex of the 435-vertex panel.
function shot({yaw,probe,pose}){
 const g=prevChar, r=prevR, W=720, H=720; if(!g||!g.userData.hero61) throw new Error('the preview is not the V61 figure');
 let mx=null, act=null; if(pose){ mx=new THREE.AnimationMixer(g); act=mx.clipAction(HERO61.clips[pose.clip]); act.play(); mx.setTime(HERO61.clips[pose.clip].duration*pose.at); }
 g.updateMatrixWorld(true);
 const old=r.getSize(new THREE.Vector2()), oldPR=r.getPixelRatio(), box=new THREE.Box3().setFromObject(g), h=box.max.y-box.min.y;
 const tgt=new THREE.Vector3((box.min.x+box.max.x)/2,box.min.y+h*0.72,(box.min.z+box.max.z)/2), d=h*1.25, a=yaw+g.rotation.y;
 const cam=new THREE.PerspectiveCamera(24,1,0.01,100); cam.position.set(tgt.x+Math.sin(a)*d,tgt.y+h*0.02,tgt.z+Math.cos(a)*d); cam.lookAt(tgt); cam.updateMatrixWorld(true);
 r.setPixelRatio(1); r.setSize(W,H,false); r.render(prevScene,cam);
 const res={png:r.domElement.toDataURL('image/png')};
 if(probe){ const gl=r.getContext(), px=new Uint8Array(W*H*4); gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px);
  let panel=null; g.traverse(o=>{ if(o.isSkinnedMesh&&o.geometry.attributes.position.count===435) panel=o; }); if(!panel) throw new Error('no 435-vertex panel on the figure');
  const v=new THREE.Vector3(); let seen=0, blue=0, black=0; const sum=[0,0,0];
  for(let i=0;i<435;i++){ panel.boneTransform(i,v); v.applyMatrix4(panel.matrixWorld).project(cam); if(Math.abs(v.x)>=1||Math.abs(v.y)>=1) continue;
   const x=Math.min(W-1,Math.floor((v.x+1)/2*W)), y=Math.min(H-1,Math.floor((v.y+1)/2*H)), o=(y*W+x)*4, R=px[o], G=px[o+1], B=px[o+2]; seen++; sum[0]+=R; sum[1]+=G; sum[2]+=B;
   if(R+G+B<120) black++; else if(B>=R) blue++; }
  res.probe={slot:panel.userData.hero61Slot,material:panel.material.name,shirt:(panel.material.userData&&panel.material.userData.cdShirt66)||null,seen,blue,black,mean:sum.map(s=>Math.round(s/Math.max(1,seen)))}; }
 if(mx){ act.stop(); mx.uncacheRoot(g); }
 r.setPixelRatio(oldPR); r.setSize(old.x,old.y,false); r.render(prevScene,prevCam); return res;
}

(async()=>{
 await new Promise((ok,bad)=>server.once('error',bad).listen(0,'127.0.0.1',ok));
 const base='http://127.0.0.1:'+server.address().port+'/'; let browser; const errors=[]; const report={status:'FAIL'};
 const save=(name,dataUrl)=>{ const b=Buffer.from(dataUrl.split(',')[1],'base64'); assert(b.length>2000,name+' is not a picture'); fs.writeFileSync(path.join(out,name),b); return crypto.createHash('sha256').update(b).digest('hex'); };
 try{
  browser=await playwright.chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--no-sandbox']});
  const open=async(query)=>{ const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
   await ctx.route(u=>!String(u).startsWith(base),r=>r.abort());                       // web fonts: the bench needs no network
   const page=await ctx.newPage(); page.on('pageerror',e=>errors.push(query+' '+e.message)); page.on('response',r=>{ if(r.status()>=400&&r.url().startsWith(base)) errors.push('HTTP '+r.status()+' '+r.url()); });
   await page.goto(base+query,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>typeof HERO61!=='undefined'&&['ready','error'].includes(HERO61.state),null,{timeout:120000});
   return {ctx,page}; };
  const creator=async page=>{ await page.evaluate(()=>{ ACTIONS.newgame(); ACTIONS.setupstep({v:'p0'}); ACTIONS.creator30tab({v:'clothes'}); });
   await page.waitForFunction(()=>!!document.querySelector('.shirt66-swatch')&&typeof prevChar!=='undefined'&&prevChar&&prevChar.userData&&prevChar.userData.hero61,null,{timeout:30000}); };
  const coral=async page=>{ await page.evaluate(()=>{ document.querySelector('[data-act="shirt66set"][data-v="coral"]').click(); });
   await page.waitForFunction(()=>prevChar&&prevChar.userData&&prevChar.userData.shirt66==='coral',null,{timeout:30000}); };

  // 1 and 2: the default page
  const A=await open(''); let page=A.page;
  report.boot=await page.evaluate(()=>({state:HERO61.state,error:HERO61.error,url:HERO61.url,bytes:HERO61.bytes,loadedMs:HERO61.loadedMs,clips:Object.keys(HERO61.clips),build:BUILD_ID,menu:heroStatusText()}));
  assert.equal(report.boot.state,'ready',report.boot.error||'not ready'); assert.equal(report.boot.url,'assets/characters/player1-v71.glb'); assert.equal(report.boot.clips.length,8);
  assert(report.boot.menu.includes('assets/characters/player1-v71.glb loaded'),'the Menu line does not name the V71 file');
  await creator(page);
  report.figure=await page.evaluate(()=>{ const o=[]; prevChar.traverse(m=>{ if(m.isSkinnedMesh) o.push({slot:m.userData.hero61Slot,vertices:m.geometry.attributes.position.count,albedo:m.material.map===HERO61.albedo}); }); return o; });
  assert.deepEqual(report.figure.map(m=>m.slot),['skin','hair','top','bottom','shoe','top']); assert(report.figure.every(m=>m.albedo),'a primitive without the albedo');
  const pictures={};
  const sky=await page.evaluate(shot,{yaw:0.9,probe:true}); pictures['v71-sky-left.png']=save('v71-sky-left.png',sky.png);
  pictures['v71-sky-front.png']=save('v71-sky-front.png',(await page.evaluate(shot,{yaw:0})).png);
  await coral(page);
  const cor=await page.evaluate(shot,{yaw:0.9,probe:true}); pictures['v71-coral-left.png']=save('v71-coral-left.png',cor.png);
  pictures['v71-walkcarry-front.png']=save('v71-walkcarry-front.png',(await page.evaluate(shot,{yaw:0,pose:{clip:'walkCarry',at:0.79}})).png);
  report.panel={sky:sky.probe,coral:cor.probe};
  for(const p of [sky.probe,cor.probe]){ assert.equal(p.slot,'top'); assert.equal(p.material,'top'); assert(p.seen>=300,'only '+p.seen+' panel vertices on screen'); assert.equal(p.black,0,'black pixels on the panel'); }
  assert.equal(sky.probe.shirt,null); assert(sky.probe.mean[2]>sky.probe.mean[0],'the sky panel is not blue');
  assert.equal(cor.probe.shirt,'coral'); assert.equal(cor.probe.blue,0,cor.probe.blue+' blue pixels on the coral panel'); assert(cor.probe.mean[0]>cor.probe.mean[2]+40,'the coral panel is not coral: '+cor.probe.mean);

  // 3: the world
  await page.evaluate(()=>{ ACTIONS.setupnext({i:0}); ACTIONS.setupnext({i:1}); });
  await page.waitForFunction(()=>S.phase==='play'&&typeof players!=='undefined'&&players.length===2&&players[0].g&&players[0].g.userData.hero61,null,{timeout:60000});
  await page.evaluate(()=>closePanel());
  const where=()=>page.evaluate(()=>{ const g=players[0].g, h=new THREE.Vector3(), a=new THREE.Vector3(); g.updateMatrixWorld(true); carryAnchor(players[0],a); g.hero.body.skeleton.bones.find(b=>b.name==='Hips').getWorldPosition(h); g.worldToLocal(a); g.worldToLocal(h);
   return {x:+g.position.x.toFixed(3),z:+g.position.z.toFixed(3),clip:g.current,hero61:!!g.userData.hero61,shirt:g.userData.shirt66,anchorForward:+(a.z-h.z).toFixed(3),p2:{x:+players[1].g.position.x.toFixed(3),z:+players[1].g.position.z.toFixed(3),clip:players[1].g.current,hero61:!!players[1].g.userData.hero61}}; });
  // hold each key in turn until that player has covered some ground (furniture and walls stop a walk, a panel that opens swallows
  // keys, and the software renderer's frame rate decides how far a held key carries in a second, so time alone proves nothing)
  const walk=async(who,keys,need)=>{ let during=null; for(const key of keys){ await page.evaluate(()=>{ if(overlayOpen()) closePanel(); }); const from=await where();
    await page.keyboard.down(key); for(let t=0;t<40;t++){ await page.waitForTimeout(150); during=await where(); const a=who?from.p2:from, b=who?during.p2:during; during.moved=+Math.hypot(b.x-a.x,b.z-a.z).toFixed(3); if(during.moved>need) break; }
    await page.keyboard.up(key); await page.waitForTimeout(350); during.key=key; if(during.moved>need) break; } return during; };
  const start=await where(); const walking=await walk(0,['d','a','w','s'],0.3); const p2=await walk(1,['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'],0.15);
  await page.waitForFunction(()=>players[0].g.current==='idle'&&players[1].g.current==='idle',null,{timeout:20000}).catch(()=>{}); const stopped=await where();
  assert.equal(start.hero61,true); assert.equal(start.p2.hero61,false,'Player 2 drawn with Player 1\'s file'); assert.equal(start.shirt,'coral','the world figure lost the chosen shirt');
  assert(walking.moved>0.3,'Player 1 did not move'); assert.equal(walking.clip,'walk'); assert(p2.moved>0.15,'Player 2 did not move'); assert.equal(p2.p2.clip,'walk'); assert.equal(stopped.clip,'idle');
  await page.evaluate(()=>{ window.__carriedProp71=carriedProp; carriedProp=function(i){ return i===0?'bench-v71':window.__carriedProp71(i); }; });
  await page.waitForFunction(()=>players[0].g.current==='carry',null,{timeout:20000}).catch(()=>{}); const carry=await where(); const walkCarry=await walk(0,['a','d','s','w'],0.3);
  await page.evaluate(()=>{ carriedProp=window.__carriedProp71; });
  assert.equal(carry.clip,'carry'); assert(walkCarry.moved>0.3,'Player 1 did not move while carrying'); assert.equal(walkCarry.clip,'walkCarry'); assert(walkCarry.anchorForward>=0.13,'carry anchor only '+walkCarry.anchorForward+' m in front of the hips while walking');
  report.world={start,walking,player2:p2,stopped,carry,walkCarry}; const pictures0=save('v71-world.png',await page.evaluate(()=>{ renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png'); }));
  await A.ctx.close();

  // 4: the way back
  const B=await open('?hero=v61'); page=B.page;
  report.v61=await page.evaluate(()=>({state:HERO61.state,url:HERO61.url,switch:GARMENT71.enabled}));
  assert.equal(report.v61.state,'ready'); assert.equal(report.v61.url,'assets/characters/player1-v61.glb'); assert.equal(report.v61.switch,false);
  await creator(page); await coral(page);
  pictures['v61-coral-left.png']=save('v61-coral-left.png',(await page.evaluate(shot,{yaw:0.9})).png);
  pictures['v61-walkcarry-front.png']=save('v61-walkcarry-front.png',(await page.evaluate(shot,{yaw:0,pose:{clip:'walkCarry',at:0.79}})).png);
  await B.ctx.close();
  assert.notEqual(pictures['v61-coral-left.png'],pictures['v71-coral-left.png'],'V61 and V71 render identically');
  pictures['v71-world.png']=pictures0; report.pictures=pictures; report.errors=errors; report.limitations=['Headless Chromium with software GL, not a physical phone','Sampled poses and one camera per picture; no frame-rate measurement','Carry in the world is forced by answering carriedProp for Player 1; no roof prop is hung on the hands here'];
  assert.deepEqual(errors,[]); report.status='PASS';
 }catch(e){ report.failure=String(e&&e.stack||e); report.errors=errors; process.exitCode=1; }
 finally{ if(browser) await browser.close(); await new Promise(r=>server.close(r)); }
 fs.writeFileSync(path.join(out,'v71-results.json'),JSON.stringify(report,null,2)+'\n'); console.log(JSON.stringify(report,null,2));
})().catch(e=>{ console.error(e); process.exitCode=2; });

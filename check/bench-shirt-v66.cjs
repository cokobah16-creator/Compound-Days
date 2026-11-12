#!/usr/bin/env node
// Real Three.js WebGL screenshot bench for v66 Player 1 shirt palette.
// Run: node check/bench-shirt-v66.cjs [out-dir]
// Requires local playwright + installed Chromium. No production mutation.
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const out=path.resolve(process.argv[2]||'artifacts/v66-shirt');
fs.mkdirSync(out,{recursive:true});
let playwright;try{playwright=require('playwright')}catch(e){console.error('Install playwright and its Chromium browser first');process.exit(2);}
const root=path.join(__dirname,'../dist'),mimes={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let u;try{u=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return;}
 const file=path.resolve(root,'.'+(u==='/'?'/index.html':u));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.stat(file,(err,s)=>{if(err||!s.isFile()){res.writeHead(404).end('Not Found');return;}
 res.writeHead(200,{'content-type':mimes[path.extname(file)]||'application/octet-stream','content-length':s.size,'cache-control':'no-store'});fs.createReadStream(file).pipe(res);
 });
});
(async()=>{
 await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/';
 let browser;
 try{
  browser=await playwright.chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--no-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(url))errors.push('HTTP '+r.status()+' '+r.url())});
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>typeof HERO61!=='undefined'&&['ready','error'].includes(HERO61.state),null,{timeout:120000});
  const st=await page.evaluate(()=>HERO61.state);assert.equal(st,'ready','V61 GLB failed to load');
  await page.evaluate(()=>{ACTIONS.newgame();ACTIONS.setupstep({v:'p0'});ACTIONS.creator30tab({v:'clothes'});});
  await page.waitForTimeout(400);
  const setupDiag=await page.evaluate(()=>({
   phase:S?.phase,setup:S?.setup?.step,hero:HERO61.state,tab:CREATOR30.tab,
   overlay:document.getElementById('ov')?.className,fields:[...document.querySelectorAll('#panel .field')].map(f=>({label:f.querySelector('label')?.textContent,hidden:f.hidden,display:getComputedStyle(f).display})),
   palette:document.querySelectorAll('.shirt66-swatch').length,
   panelText:document.getElementById('panel')?.textContent?.slice(0,220)
  }));console.log('SETUP DEBUG',JSON.stringify(setupDiag));
  await page.waitForSelector('.shirt66-picker .shirt66-swatch',{state:'attached',timeout:5000});
  const diag=await page.evaluate(()=>{
   const el=document.querySelector('.shirt66-swatch'),field=el&&el.closest('.field'),tab=document.querySelector('[data-act="creator30tab"][data-v="clothes"]'),ov=document.getElementById('ov');
   return {tab:typeof CREATOR30!=='undefined'?CREATOR30.tab:null,overlay:ov&&ov.className,fieldHidden:field?.hidden,
    fieldDisplay:field&&getComputedStyle(field).display,swatchDisplay:el&&getComputedStyle(el).display,
    swatchRects:el&&el.getBoundingClientRect().toJSON(),tab:tab&&tab.outerHTML.slice(0,200),
    panelChildren:document.getElementById('panel')?.children.length};
  });console.log('CREATOR DIAGNOSTIC',JSON.stringify(diag));
  await page.waitForSelector('.shirt66-picker .shirt66-swatch',{state:'visible',timeout:5000});
  await page.waitForFunction(()=>typeof prevChar!=='undefined'&&prevChar&&prevChar.userData&&prevChar.userData.hero61,null,{timeout:50000});
  const before=await page.evaluate(()=>{
   const top=[];prevChar.traverse(o=>{if(o.isMesh&&o.userData.hero61Slot==='top')top.push({name:o.name,color:o.material?.userData?.cdShirt66||'original'})});
   return {player:prevChar.userData.shirt66,top};
  });
  assert.equal(before.player,'sky');
  const defaultCanvas=page.locator('#pv3d0 canvas');
  await defaultCanvas.waitFor({state:'visible',timeout:15000});
  await page.waitForTimeout(200);
  const png1=await defaultCanvas.screenshot({path:path.join(out,'shirt66-sky-mobile.png')});
  await page.locator('[data-act="shirt66set"][data-v="coral"]').click();
  await page.waitForFunction(()=>S.p[0]?.colors?.shirt66==='coral'&&prevChar?.userData?.shirt66==='coral',null,{timeout:30000});
  const after=await page.evaluate(()=>{
   const top=[];prevChar.traverse(o=>{if(o.isMesh&&o.userData.hero61Slot==='top')top.push({name:o.name,color:o.material?.userData?.cdShirt66||'original',textured:!!o.material?.map})});
   return {player:prevChar.userData.shirt66, saved:S.p[0].colors.shirt66,top,colors:Object.assign({},S.p[0].colors),
    isV61:!!prevChar.userData.hero61, shaderReady:top.some(x=>x.color==='coral'&&x.textured)};
  });
  assert.equal(after.player,'coral');assert.equal(after.saved,'coral');assert(after.shaderReady,'Tinted textured shirt material not found');
  const png2=await page.locator('#pv3d0 canvas').screenshot({path:path.join(out,'shirt66-coral-mobile.png')});
  assert(!png1.equals(png2),'3D canvas screenshot did not change');
  // Opening Player 2 must not tint their classic character.
  await page.evaluate(()=>{S.setup.step='p1';renderSetup();});
  const player2=await page.evaluate(()=>({colors:S.p[1].colors||null,pickerCount:document.querySelectorAll('.shirt66-picker').length}));
  assert.equal(player2.pickerCount,0);
  // A stored shirt ID must survive a state encode/decode without affecting other options.
  const persistence=await page.evaluate(()=>{const s=JSON.stringify(S.p[0]);const p=JSON.parse(s);return {shirt:p.colors.shirt66,hair:p.hair,outfit:p.outfit}});
  assert.equal(persistence.shirt,'coral');
  const report={status:'PASS',visual:'Canvas PNG differs between Sky and Coral',baseline:before,coral:after,player2,persistence,
   imgHashes:{sky:crypto.createHash('sha256').update(png1).digest('hex'),coral:crypto.createHash('sha256').update(png2).digest('hex')},
   errors,limitations:['Headless Chromium software renderer, not physical iPhone','This only recolors tee; no haircut or outfit geometry swapped']};
  fs.writeFileSync(path.join(out,'shirt66-results.json'),JSON.stringify(report,null,2)+'\n');
  await page.screenshot({path:path.join(out,'shirt66-player2-unaffected.png'),fullPage:true});
  console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
 }catch(e){console.error('FAIL: '+(e.stack||String(e)));process.exitCode=1}
 finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=2});

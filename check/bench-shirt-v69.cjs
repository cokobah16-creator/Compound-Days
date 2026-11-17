#!/usr/bin/env node
// V69 rendered mobile art gate: compare shipped Player 1 against the
// generated seam candidate in the real Three.js creator at 390x844.
// Never alters the game build or deploys candidate.
'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),
 assert=require('node:assert/strict'),crypto=require('crypto');
const out=path.resolve(process.argv[2]||'artifacts/v69');
const candidate=path.resolve(process.argv[3]||'artifacts/v69/player1-v69-seam-review.glb');
if(!fs.existsSync(candidate))throw Error('Missing candidate '+candidate);
fs.mkdirSync(out,{recursive:true});
let playwright;try{playwright=require('playwright')}catch(e){console.error('Install Playwright');process.exit(2)}
const root=path.resolve(__dirname,'../dist'),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 let uri;try{uri=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch(e){res.writeHead(400).end();return}
 const file=path.resolve(root,'.'+(uri==='/'?'/index.html':uri));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
 fs.stat(file,(e,s)=>{if(e||!s.isFile()){res.writeHead(404).end();return}
 res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
 fs.createReadStream(file).pipe(res);
 });
});
(async()=>{
 await new Promise((yes,no)=>server.once('error',no).listen(0,'127.0.0.1',yes));
 const url='http://127.0.0.1:'+server.address().port+'/';let browser;const errors=[];
 try{
 browser=await playwright.chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--no-sandbox']});
 const trials={};
 for(const mode of ['baseline','candidate']){
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  page.on('pageerror',e=>errors.push(mode+' '+e.message));
  if(mode==='candidate')await page.route('**/assets/characters/player1-v61.glb*',route=>route.fulfill({
    status:200,contentType:'model/gltf-binary',body:fs.readFileSync(candidate)}));
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:100000});
  await page.waitForFunction(()=>typeof HERO61!=='undefined'&&['ready','error'].includes(HERO61.state),null,{timeout:120000});
  assert.equal(await page.evaluate(()=>HERO61.state),'ready',mode+' failed V61 GLB loader');
  await page.evaluate(()=>{ACTIONS.newgame();ACTIONS.setupstep({v:'p0'});});
  await page.waitForFunction(()=>!!prevChar?.userData?.hero61&&!!prevR?.domElement,null,{timeout:40000});
  trials[mode]={};
  for(const camera of ['full','underarm']){
   const snapshot=await page.evaluate(camera=>{
    const g=prevChar; if(!g.userData.hero61)throw Error('Classic fallback unexpectedly used');
    if(camera==='full'){prevCam.position.set(0,1.2,2.55);prevCam.lookAt(0,1,0)}
    else {prevCam.position.set(.66,1.22,.65);prevCam.lookAt(.13,1.15,.028)}
    prevCam.updateProjectionMatrix();
    animAvatar(g,0,false,false,0,1/60);
    prevR.render(prevScene,prevCam);
    const info={triangles:prevR.info.render.triangles,calls:prevR.info.render.calls,materials:[]};
    g.traverse(o=>{if(o.isMesh&&o.userData.hero61Slot==='top')
      info.materials.push({name:o.material.name,textured:!!o.material.map,
       vertices:o.geometry.attributes.position?.count||0,triangles:o.geometry.index?.count/3||0})});
    return {png:prevR.domElement.toDataURL('image/png'),info};
   },camera);
   const bytes=Buffer.from(snapshot.png.split(',')[1],'base64');
   assert(bytes.length>500,'Empty screenshot '+mode+' '+camera);
   const file=path.join(out,mode+'-'+camera+'.png');
   fs.writeFileSync(file,bytes);
   trials[mode][camera]={sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,info:snapshot.info};
   assert(snapshot.info.triangles>70000,'Character disappeared in '+mode+' '+camera);
   assert(snapshot.info.calls>0);
  }
  await page.close();
 }
 assert.notEqual(trials.baseline.underarm.sha256,trials.candidate.underarm.sha256,'Underarm view did not change');
 assert.equal(trials.baseline.full.info.triangles,trials.candidate.full.info.triangles,'Geometry triangle count changed');
 assert.equal(errors.length,0,errors.join('; '));
 const result={status:'PASS—REVIEW ONLY',renderedOn:'headless Chromium 390x844 Three.js r128',trials,
   errors,limitations:['No actual physical iPhone or mobile GPU timing','Face/hands/mesh topology are unchanged',
    'The visual underarm change still needs human approval','The candidate was intercepted for testing, not deployed']};
 fs.writeFileSync(path.join(out,'v69-render-results.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
 }catch(e){console.error('V69 FAIL:',e.stack||String(e));process.exitCode=1}
 finally{if(browser)await browser.close();await new Promise(res=>server.close(res))}
})().catch(e=>{console.error(e);process.exitCode=2});

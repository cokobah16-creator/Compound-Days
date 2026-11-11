#!/usr/bin/env node
// V64: uses the SAME Three.js r128 and GLTFLoader shipped in Compound Days.
// Run from repo root: node check/bench-character-v64.cjs /path/to/V63.glb [outDir]
// Requires local playwright: npm install --no-save playwright
// Browser install: npx playwright install chromium
// Deliberately does not publish/replace the game's character or touch saves.
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const candidate=process.argv[2],dest=path.resolve(process.argv[3]||'artifacts/character-v64');
if(!candidate||!fs.existsSync(candidate)){console.error('Usage: node check/bench-character-v64.cjs /path/to/V63.glb [outDir]');process.exit(2)}
let playwright;
try{playwright=require('playwright')}catch(_){try{playwright=require('playwright-core')}catch(_2){
 console.error('Missing Playwright. Install with npm install --no-save playwright && npx playwright install chromium');process.exit(2)
}}
const dist=path.resolve(__dirname,'../dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
function serve(req,res){
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch(_){res.writeHead(400).end();return}
 if(pathname==='/')pathname='/character-v64-bench.html';
 const file=path.resolve(dist,'.'+pathname);
 if(file!==dist&&!file.startsWith(dist+path.sep)){res.writeHead(403).end();return}
 fs.stat(file,(e,s)=>{
  if(e||!s.isFile()){res.writeHead(404).end('Not Found');return}
  res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream',
   'cache-control':'no-store','content-length':s.size});
  fs.createReadStream(file).pipe(res);
 });
}
(async()=>{
 fs.mkdirSync(dest,{recursive:true});
 const server=http.createServer(serve);
 await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/character-v64-bench.html';
 let browser;
 try{
  const opts={headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--no-sandbox']};
  if(process.env.CHROME_PATH)opts.executablePath=process.env.CHROME_PATH;
  browser=await playwright.chromium.launch(opts);
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',error=>errors.push('PAGE '+error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push('CONSOLE '+message.text().slice(0,600))});
  page.on('response',response=>{if(response.status()>=400)errors.push('HTTP '+response.status()+' '+response.url())});
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CD_V64&&['hero-ready','ready'].includes(window.CD_V64.status),null,{timeout:120000});
  await page.locator('#candidateInput').setInputFiles(path.resolve(candidate));
  await page.waitForFunction(()=>window.CD_V64&&window.CD_V64.candidateReady,null,{timeout:120000});
  await page.evaluate(()=>window.CD_V64.runBench());
  const output=await page.evaluate(()=>window.CD_V64.report);
  output.harness={browser:'Chromium via Playwright',mode:'headless software ANGLE SwiftShader',deviceEmulation:'390x844 mobile',
   runMethod:'three.js WebGLRenderer.info + framebuffer sample',notPhysicalPhone:true,notLiveCreator:true,
   candidatePath:path.basename(candidate),pageErrors:errors};
  fs.writeFileSync(path.join(dest,'character-v64-results.json'),JSON.stringify(output,null,2)+'\n');
  await page.screenshot({path:path.join(dest,'character-v64-audition.png'),fullPage:true});
  console.log(JSON.stringify({result:dest,passForCulling:output.passForCulling,candidateCases:output.summary.candidateFrames,
   hardFailures:output.hardFailures,errors,notLiveGame:true},null,2));
  if(!output.passForCulling||errors.length)process.exitCode=1;
 }catch(e){console.error('V64 engine bench unavailable or failed: '+String(e.stack||e));process.exitCode=2}
 finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=2});

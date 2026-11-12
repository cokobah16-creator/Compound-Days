#!/usr/bin/env node
// V67 mobile WebGL pose comparison on the shipped Three.js r128 V61 character.
'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict'),crypto=require('crypto');
const out=path.resolve(process.argv[2]||'artifacts/v67-pose');fs.mkdirSync(out,{recursive:true});
let pw;try{pw=require('playwright')}catch(e){console.error('Playwright required');process.exit(2)}
const root=path.resolve(__dirname,'../dist'),mimes={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost').pathname,file=path.resolve(root,'.'+(url==='/'?'/index.html':url));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
 fs.stat(file,(err,s)=>{if(err||!s.isFile()){res.writeHead(404).end('Not found');return}
 res.writeHead(200,{'content-type':mimes[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(file).pipe(res)});
});
(async()=>{
 await new Promise((ok,bad)=>server.once('error',bad).listen(0,'127.0.0.1',ok));
 let browser;const errors=[];
 try{
 browser=await pw.chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>typeof HERO61!=='undefined'&&HERO61.state==='ready',null,{timeout:100000});
 await page.evaluate(()=>{ACTIONS.newgame();ACTIONS.setupstep({v:'p0'});CREATOR30.zoom='body';CREATOR30.yaw=0;CREATOR30.pose='idle';});
 await page.waitForFunction(()=>typeof prevChar!=='undefined'&&prevChar&&prevChar.userData?.hero61&&prevChar.hero?.bones?.leftarm,null,{timeout:40000});
 const capture=async(enabled,name)=>{
 const result=await page.evaluate(enabled=>{
  POSE67.enabled=enabled;
  mountPreview(document.getElementById('pv3d0'),lookFor(0));
  const g=prevChar;if(!g?.hero?.v61)throw Error('Not V61');
  g.rotation.y=0;let cost=0;
  for(let i=0;i<50;i++){const t=performance.now();animAvatar(g,i/60,false,false,0,1/60);cost+=performance.now()-t;}
  g.updateMatrixWorld(true);const bones=g.hero.bones;
  function local(b){return g.worldToLocal(b.getWorldPosition(new THREE.Vector3()))}
  function angle(a,b){const v=local(b).sub(local(a)).normalize();return Math.atan2(Math.abs(v.x),-v.y)*180/Math.PI}
  const measures={left:angle(bones.leftarm,bones.leftforearm),right:angle(bones.rightarm,bones.rightforearm),
   handSpan:Math.abs(local(bones.lefthand).x-local(bones.righthand).x),
   applied:!!g.userData.pose67?.applied,weight:g.userData.pose67?.weight||0,costMs:cost/50,
   hero61:!!g.userData.hero61};
  prevR.render(prevScene,prevCam);return {measures,img:prevR.domElement.toDataURL('image/png')};
 },enabled);
 const png=Buffer.from(result.img.split(',')[1],'base64');assert(png.length>500,'Empty PNG');
 fs.writeFileSync(path.join(out,name),png);return {metrics:result.measures,hash:crypto.createHash('sha256').update(png).digest('hex')};
 };
 const original=await capture(false,'v61-original-idle.png'),relaxed=await capture(true,'v67-relaxed-idle.png');
 assert(original.metrics.hero61&&relaxed.metrics.hero61);
 assert(relaxed.metrics.applied&&relaxed.metrics.weight>.98);
 assert(original.metrics.left-relaxed.metrics.left>=4,'Left arm failed to lower');
 assert(original.metrics.right-relaxed.metrics.right>=4,'Right arm failed to lower');
 assert(relaxed.metrics.handSpan<original.metrics.handSpan-.045,'Hands not sufficiently closer');
 assert.notEqual(original.hash,relaxed.hash,'Rendered preview unchanged');

 // The front-only pass can hide a broken side silhouette. Render three more
 // views on the SAME live skinned avatar, plus a frame of its real Walk clip.
 const views={};
 for(const [id,yaw] of [['three-quarter',-.58],['profile',Math.PI/2],['back',Math.PI]]){
  const data=await page.evaluate(yaw=>{
   const g=prevChar;CREATOR30.yaw=yaw;g.rotation.y=yaw;
   for(let i=0;i<20;i++)animAvatar(g,3+i/60,false,false,0,1/60);
   g.updateMatrixWorld(true);prevR.render(prevScene,prevCam);
   return {pose:g.current,weight:g.userData.pose67?.weight||0,img:prevR.domElement.toDataURL('image/png')};
  },yaw);
  assert.equal(data.pose,'idle','Not in idle for '+id);assert(data.weight>.98,'Pose not settled for '+id);
  const png=Buffer.from(data.img.split(',')[1],'base64');assert(png.length>500,'Blank view '+id);
  const name='v67-'+id+'-idle.png';fs.writeFileSync(path.join(out,name),png);
  views[id]={name,hash:crypto.createHash('sha256').update(png).digest('hex')};
 }
 const walking=await page.evaluate(()=>{
  const g=prevChar;CREATOR30.yaw=-.4;g.rotation.y=-.4;
  for(let i=0;i<40;i++)animAvatar(g,4+i/60,true,false,3.2,1/60);
  g.updateMatrixWorld(true);prevR.render(prevScene,prevCam);
  return {clip:g.current,weight:g.userData.pose67?.weight||0,img:prevR.domElement.toDataURL('image/png')};
 });
 assert.equal(walking.clip,'walk');assert.equal(walking.weight,0,'Pose correction must disengage during walk');
 const walkPNG=Buffer.from(walking.img.split(',')[1],'base64');assert(walkPNG.length>500);
 fs.writeFileSync(path.join(out,'v67-walking-unchanged.png'),walkPNG);
 views.walk={clip:walking.clip,hash:crypto.createHash('sha256').update(walkPNG).digest('hex')};
 const modes=await page.evaluate(()=>{
  POSE67.enabled=true;const g=prevChar;
  const idle=pose67Apply(g,1/60);
  g.current='walk';const walk=pose67Apply(g,1/60);
  g.current='carry';const carry=pose67Apply(g,1/60);
  const classic=pose67Apply({userData:{hero61:false},hero:{v61:false},current:'idle'},1/60);
  return {idle,walk,carry,classic};
 });
 assert(modes.idle&&!modes.walk&&!modes.carry&&!modes.classic);
 assert.equal(errors.length,0,errors.join('\n'));
 const report={result:'PASS',original,relaxed,views,modes,errors,limitations:['headless SwiftShader not real iPhone','human pose review before release']};
 fs.writeFileSync(path.join(out,'pose-v67-results.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
 }catch(e){console.error('V67 FAIL:',e.stack||String(e));process.exitCode=1}
 finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=2});

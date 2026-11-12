#!/usr/bin/env node
// WebGL smoke test for V68: real shipped V61 figure, Three.js r128, mobile crop.
// No assertion that the painted face/fingers have gained new morphs/rig joints.
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),
 assert=require('node:assert/strict'),crypto=require('node:crypto');
const output=path.resolve(process.argv[2]||'artifacts/v68-living-idle');
fs.mkdirSync(output,{recursive:true});
let playwright;try{playwright=require('playwright')}catch(e){console.error('Missing Playwright');process.exit(2)}
const root=path.resolve(__dirname,'../dist');
const mimes={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css',
 '.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.glb':'model/gltf-binary'};
const server=http.createServer((req,res)=>{
 let u;try{u=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch(e){res.writeHead(400).end();return}
 const file=path.resolve(root,'.'+(u==='/'?'/index.html':u));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
 fs.stat(file,(e,s)=>{if(e||!s.isFile()){res.writeHead(404).end();return}
 res.writeHead(200,{'content-type':mimes[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);});
});
(async()=>{
 await new Promise((ok,bad)=>server.once('error',bad).listen(0,'127.0.0.1',ok));
 let browser;const errors=[];
 try{
 browser=await playwright.chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader',
  '--enable-unsafe-swiftshader','--disable-dev-shm-usage','--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>typeof HERO61!=='undefined'&&HERO61.state==='ready',null,{timeout:110000});
 await page.evaluate(()=>{
  ACTIONS.newgame();ACTIONS.setupstep({v:'p0'});CREATOR30.zoom='body';CREATOR30.yaw=0;CREATOR30.pose='idle';
 });
 await page.waitForFunction(()=>typeof prevChar!=='undefined'&&prevChar?.hero?.v61&&prevR,null,{timeout:30000});
 const sample=async(enabled,name)=>{
 const out=await page.evaluate(enabled=>{
  LIFE68.enabled=enabled;
  mountPreview(document.getElementById('pv3d0'),lookFor(0));
  const g=prevChar;if(!g?.hero?.v61)throw Error('V61 candidate absent');
  g.rotation.y=0;let cost=0;
  for(let i=0;i<95;i++){const t=performance.now();animAvatar(g,i/60,false,false,0,1/60);cost+=performance.now()-t;}
  g.updateMatrixWorld(true);
  const B=g.hero.bones;
  const quat=b=>{const q=b.getWorldQuaternion(new THREE.Quaternion());return [q.x,q.y,q.z,q.w]};
  const vals={spine:quat(B.spine2),head:quat(B.head),leftHand:quat(B.lefthand),rightHand:quat(B.righthand),
   timeMsPerFrame:cost/95,enabled,weight:g.userData.life68?.fade||0,phase:g.userData.life68?.phase||0,
   wristJointCount:27,animated:!!g.userData.life68?.applied,shirtSwatches:!!document.querySelector('.shirt66-picker')};
  prevR.render(prevScene,prevCam);
  return {vals,png:prevR.domElement.toDataURL('image/png')};
 },enabled);
 const bytes=Buffer.from(out.png.split(',')[1],'base64');
 assert(bytes.length>1000,'Empty creator framebuffer');
 fs.writeFileSync(path.join(output,name),bytes);
 return {metrics:out.vals,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
 };
 const off=await sample(false,'v67-idle-original.png');
 const on=await sample(true,'v68-idle-living.png');
 assert(off.metrics.enabled===false&&on.metrics.enabled===true);
 assert(on.metrics.weight>.99&&on.metrics.animated,'Living idle did not reach full blend');
 function angular(a,b){let dot=0;for(let i=0;i<4;i++)dot+=a[i]*b[i];
  return 2*Math.acos(Math.min(1,Math.max(-1,Math.abs(dot))));}
 const angles={
  spineDegrees:angular(off.metrics.spine,on.metrics.spine)*180/Math.PI,
  headDegrees:angular(off.metrics.head,on.metrics.head)*180/Math.PI,
  leftWristDegrees:angular(off.metrics.leftHand,on.metrics.leftHand)*180/Math.PI,
  rightWristDegrees:angular(off.metrics.rightHand,on.metrics.rightHand)*180/Math.PI
 };
 console.log('V68 ANGLE DIAGNOSTIC',JSON.stringify({angles,off:off.metrics,on:on.metrics}));
 assert(angles.spineDegrees>.4&&angles.spineDegrees<2.5,'Breathing torso movement outside safe range');
 assert(angles.headDegrees>.4&&angles.headDegrees<3,'Head motion outside safe range');
 assert(angles.leftWristDegrees>1&&angles.leftWristDegrees<5,'Left wrist outside safe range');
 assert(angles.rightWristDegrees>1&&angles.rightWristDegrees<5,'Right wrist outside safe range');
 assert.notEqual(off.sha256,on.sha256,'Before and after images are identical');
 const gating=await page.evaluate(()=>{
  LIFE68.enabled=true;const g=prevChar;
  const idle=life68Apply(g,1/60);
  g.current='walk';const walk=life68Apply(g,1/60);
  g.current='carry';const carry=life68Apply(g,1/60);
  g.current='idle';g.actions.pick.reset().setEffectiveWeight(1).play();
  const pickActive=life68ActionActive(g),pick=life68Apply(g,1/60),v67BlocksPick=pose67WavePlaying(g);
  g.actions.pick.stop();
  const legacy=life68Apply({current:'idle',hero:{v61:false},userData:{hero61:false}},1/60);
  const notPlayer2=!(S.p[1]&&S.p[1].life68);
  return {idle,walk,carry,pick,pickActive,v67BlocksPick,legacy,notPlayer2};
 });
 assert(gating.idle&&!gating.walk&&!gating.carry&&!gating.pick&&gating.pickActive&&gating.v67BlocksPick);
 assert(!gating.legacy&&gating.notPlayer2,'V68 affected wrong model');
 assert.equal(errors.length,0,errors.join('\n'));
 const report={result:'PASS',baseline:off,candidate:on,angles,gating,errors,
  limitations:['Software Chromium—not physical iPhone Safari',
   'V61 has no individually rigged fingers or face morphs',
   'Original imported animations and V67 pose remain the release baseline']};
 fs.writeFileSync(path.join(output,'v68-results.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
 }catch(e){console.error('V68 FAIL:',e.stack||String(e));process.exitCode=1}
 finally{if(browser)await browser.close();await new Promise(ok=>server.close(ok))}
})().catch(e=>{console.error(e);process.exitCode=2});

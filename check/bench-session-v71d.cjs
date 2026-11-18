#!/usr/bin/env node
// The session log and the build check (dist/src/session-v71d.js) in REAL browsers: one headless Chromium process per
// phone, phone-sized, joined through the game's own PeerJS and real WebRTC with the local signalling server
// (check/local-peer-server.cjs), so nothing leaves this machine. Buttons are pressed in the page as a player would.
// Run: node check/bench-session-v71d.cjs [out-dir]     (default artifacts/v71d-session; needs playwright + Chromium)
//
// 1. Two phones on the same build start and join a household and move in: no banner on either. On the guest, Menu >
//    Session log > Save as a file gives a real download: a .txt that starts with what it is, has the join and the
//    host's actions in it, and does not contain the household code. A picture of the panel is saved.
// 2. A third phone that says it is on another build joins a fresh household with the first: both phones show the
//    version banner, inside the screen; its picture is saved; dismissing it hides it.
//
// What this is not: real phones (Share, a phone's download folder, a locked screen) or real networks.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let playwright; try{ playwright=require('playwright'); }catch(e){ console.error('Install playwright and its Chromium browser first'); process.exit(2); }
const {staticServer,signalServer}=require('./local-peer-server.cjs');
const root=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');
const out=path.resolve(process.argv[2]||path.join(__dirname,'..','artifacts','v71d-session')); fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage',
 '--disable-features=WebRtcHideLocalIpsWithMdns','--allow-loopback-in-peer-connection',
 '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost'];
const inWorld=()=>!!(typeof S!=='undefined'&&S&&S.phase==='play'&&players.length===2);
(async()=>{
 const web=await staticServer(root), sig=await signalServer(), base='http://127.0.0.1:'+web.port+'/', url=base+'?peer=127.0.0.1:'+sig.port;
 const phones=[], report={build:null,passed:false,checks:[]};
 const pass=(name,info)=>{ report.checks.push({name,passed:true,info}); console.log('PASS',name,JSON.stringify(info||{})); };
 const phone=async(name,build)=>{ const browser=await playwright.chromium.launch({headless:true,args:ARGS});
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,acceptDownloads:true});
  await ctx.addInitScript(()=>{ try{ localStorage.setItem('cd3-shadows','off'); localStorage.setItem('cd3-quality','lite'); }catch(e){} });
  await ctx.route(u=>{ const s=String(u); return !(s.startsWith(base)||s.includes('127.0.0.1:'+sig.port)); },r=>r.abort());
  const page=await ctx.newPage(), P={name,browser,page,errors:[]}; phones.push(P);
  page.on('pageerror',e=>P.errors.push(String(e&&e.message||e).slice(0,200)));
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>typeof SESSION71D!=='undefined'&&typeof ov!=='undefined'&&ov.classList.contains('on')&&!!document.querySelector('[data-act="nethost"]'),null,{timeout:180000});
  if(build) await page.evaluate(b=>{ SESSION71D.build=b; },build);     // this phone says it is on another build
  P.tap=async sel=>{ await page.waitForSelector(sel,{state:'attached',timeout:120000}); await page.evaluate(s=>{ document.querySelector(s).click(); },sel); };
  P.type=async(sel,text)=>{ await page.waitForSelector(sel,{state:'attached',timeout:120000}); await page.evaluate(([s,t])=>{ const el=document.querySelector(s); el.value=t; el.dispatchEvent(new Event('input',{bubbles:true})); },[sel,text]); };
  P.wait=(fn,arg,ms)=>page.waitForFunction(fn,arg===undefined?null:arg,{timeout:ms||150000,polling:250});
  P.ev=(fn,arg)=>page.evaluate(fn,arg);
  P.closePanels=async()=>{ for(let k=0;k<6;k++){ const open=await page.evaluate(()=>{ if(!overlayOpen()) return false; const c=panel.querySelector('[data-act="close"]'); if(c) c.click(); else dispatch('close',{}); return true; }); if(!open) break; await sleep(400); } };
  P.shot=async n=>{ await sleep(400); await page.screenshot({path:path.join(out,n+'.png'),timeout:120000}); };
  return P; };
 // start a household on A, join it on B, move both in
 const pair=async(A,B,an,bn)=>{ await A.tap('[data-act="nethost"]'); await A.wait(()=>!!document.getElementById('nm0')||/Could not open/.test(panel.textContent));
  const code=await A.ev(()=>NET.code); await A.type('#nm0',an); await A.tap('[data-act="netready"]'); await A.wait(()=>NET.lobby&&S.ready&&S.ready[0]);
  await B.tap('[data-act="netjoin"]'); await B.type('#jc',code); await B.tap('[data-act="netjoingo"]'); await B.wait(()=>!!document.getElementById('nm1'));
  await B.type('#nm1',bn); await B.tap('[data-act="netready"]'); await B.wait(()=>S.ready&&S.ready[0]&&S.ready[1]&&!!document.querySelector('[data-act="netmovein"]'));
  await B.tap('[data-act="netmovein"]'); await Promise.all([A.wait(inWorld,null,240000),B.wait(inWorld,null,240000)]); await sleep(1500); await A.closePanels(); await B.closePanels(); return code; };
 const banner=P=>P.ev(()=>{ const el=document.querySelector('.sess71d-ver'); if(!el) return null; const cs=getComputedStyle(el), r=el.getBoundingClientRect();
  return {shown:cs.display!=='none',text:el.textContent.replace(/\s+/g,' ').trim(),box:[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)],inScreen:r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}; });
 try{
  const A=await phone('A'), B=await phone('B'); report.build=await A.ev(()=>BUILD_ID);
  /* 1. same build: no banner; the guest saves its log as a real file */
  const code=await pair(A,B,'Ada','Bola');
  await A.ev(()=>{ dispatch('buy',{i:NET.myIndex,k:'tomato',st:'s1',price:S.mkt.items.tomato.price}); }); await sleep(3000); await A.closePanels();
  assert.deepEqual([await banner(A),await banner(B)].map(b=>b&&b.shown),[null,null],'no banner on the same build');
  await B.ev(()=>{ document.getElementById('hmenu').click(); }); await B.wait(()=>!!panel.querySelector('[data-act="sesslog71d"]'),null,30000);
  await B.tap('[data-act="sesslog71d"]'); await B.wait(()=>/Session log/.test(panel.textContent)&&!!panel.querySelector('[data-act="sesssave71d"]'),null,30000); await B.shot('1-guest-session-log');
  const [dl]=await Promise.all([B.page.waitForEvent('download',{timeout:60000}),B.tap('[data-act="sesssave71d"]')]);
  const file=path.join(out,'1-'+dl.suggestedFilename()); await dl.saveAs(file); const text=fs.readFileSync(file,'utf8');
  assert(/^compound-days-session-v71-[0-9a-f]{8}-\d{4}-\d\d-\d\d-\d\d-\d\d\.txt$/.test(dl.suggestedFilename()),dl.suggestedFilename());
  assert(/^Compound Days session log\nBuild: v71-[0-9a-f]{8}\nSite: 127\.0\.0\.1:\d+\nSaved: [^\n]+ UTC\n/.test(text),'the file says what it is: '+text.slice(0,120)); assert(/room: joined palm-\*\*\*\*/.test(text)&&/got buy #\d+ from P1/.test(text),'the join and the host’s purchase are in it');
  assert(!text.includes(code)&&!text.includes(code.split('-').pop()),'the household code is not in it');
  await Promise.all([B.page.waitForEvent('load',{timeout:120000}),B.ev(()=>{ setTimeout(()=>dispatch('title',{}),50); })]);   // leaving from the world saves and reloads the page
  await B.wait(()=>typeof SESSION71D!=='undefined'&&!!document.querySelector('#titlemark [data-act="sesslog71d"]'),null,180000);   // back on the title screen, the log is still offered
  await B.shot('1-title-offers-the-log'); assert.deepEqual([A.errors,B.errors],[[],[]],'no page error');
  pass('Same build: no banner on either phone; on the guest, Menu > Session log > Save as a file downloads a dated .txt that says what it is, holds the join and the host’s purchase, and not the household code; back on the title screen the log is still offered',{file:dl.suggestedFilename().replace(/\d{4}-\d\d-\d\d-\d\d-\d\d/,'<date>'),lines:text.split('\n').length>10?'more than ten':'few'});
  /* 2. a phone that says it is on another build */
  for(const P of [A,B]){ await P.browser.close(); phones.splice(phones.indexOf(P),1); }   // two new phones for a new household
  const A2=await phone('A2'), C=await phone('C','v71-0000beef'); await pair(A2,C,'Ada','Chidi'); await sleep(3000);
  const ba=await banner(A2), bc=await banner(C);
  assert(ba&&ba.shown&&bc&&bc.shown,'both phones show the banner'); assert(ba.inScreen&&bc.inScreen,'inside the screen: '+JSON.stringify([ba.box,bc.box]));
  assert(/^Different versions/.test(ba.text),ba.text); await A2.tap('.sess71d-ver [data-sess71d="details"]'); await A2.wait(()=>/Two versions of the game/.test(panel.textContent),null,30000);
  const details=await A2.ev(()=>panel.textContent.replace(/\s+/g,' ').trim()); assert(/Chidi’s phone is running a different version of the game \(this phone: v71-[0-9a-f]{8}, that one: v71-0000beef\)/.test(details),details.slice(0,200));
  await A2.shot('2-version-details'); await A2.closePanels();
  const tb=await A2.ev(()=>{ toast('Tomatoes into Ada’s bag'); const t=document.getElementById('toast').getBoundingClientRect(), b=document.querySelector('.sess71d-ver').getBoundingClientRect(); return {toastTop:Math.round(t.top),bannerBottom:Math.round(b.bottom)}; });
  assert(tb.toastTop>=tb.bannerBottom,'a toast is drawn below the banner: '+JSON.stringify(tb));
  await A2.shot('2-version-banner-host'); await C.shot('2-version-banner-other-build');
  await A2.tap('.sess71d-ver [data-sess71d="dismiss"]'); await sleep(2500); assert.equal((await banner(A2)).shown,false,'dismissed');
  assert.deepEqual([A2.errors,C.errors],[[],[]],'no page error');
  pass('A phone on another build: both phones show the version notice, inside a phone-sized screen, as one line whose Details name the partner and both builds; a toast is drawn below it; hiding it hides it',{notice:ba.text,box:ba.box,details:details.slice(0,90)});
  report.passed=true;
 }catch(e){ report.failure=String(e&&e.stack||e).slice(0,900); report.errors=phones.map(P=>({phone:P.name,errors:P.errors.slice(0,5)})); process.exitCode=1; }
 for(const P of phones){ try{ await P.browser.close(); }catch(e){} } await web.stop(); await sig.stop();
 fs.writeFileSync(path.join(out,'v71d-session-results.json'),JSON.stringify(report,null,2)+'\n'); console.log(JSON.stringify(report,null,2));
})().catch(e=>{ console.error(e); process.exitCode=2; });

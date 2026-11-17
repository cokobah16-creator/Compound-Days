#!/usr/bin/env node
// Two-phone check in REAL browsers for dist/src/pair-v71b.js: headless Chromium processes, one per phone, joined
// through the game's own PeerJS and real WebRTC data channels, with a local signalling server
// (check/local-peer-server.cjs) so nothing leaves this machine. Buttons are pressed in the page as a player would.
// Run: node check/bench-pair-v71b.cjs [out-dir]     (default artifacts/v71b-pair; needs playwright + Chromium)
//
// 1. A household is started; the second phone joins by code in the usual order, makes choices on the character
//    screen (each one must be drawn and none may throw), and both move in.
// 2. After the guest has opened and closed its Menu, the guest still takes the host's household.
// 3. Both press the night panel's only button together: one day passes and both phones wake to the same market.
// 4. A third phone typing the code is turned away with a message and the two players are untouched.
//
// What this is not: phones, mobile networks, the public PeerJS service or the relay. The state checks that need
// exact timing (lost messages, sleeping phones, reloads mid-carry) are in check/verify-pair-v71b.cjs.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let playwright; try{ playwright=require('playwright'); }catch(e){ console.error('Install playwright and its Chromium browser first'); process.exit(2); }
const {staticServer,signalServer}=require('./local-peer-server.cjs');
const root=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');
const out=path.resolve(process.argv[2]||path.join(__dirname,'..','artifacts','v71b-pair')); fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage',
 '--disable-features=WebRtcHideLocalIpsWithMdns','--allow-loopback-in-peer-connection',
 '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost'];   // no name outside this machine resolves
const Q=()=>({rev:S.rev||0,count:S.aseq||0,day:S.day,money:S.money,me:NET.myIndex,host:NET.isHost,other:NET.otherOnline,names:S.p.map(p=>p.name),market:S.mkt&&(S.mkt.day+':'+S.mkt.items.rice.price+':'+S.mkt.items.tomato.price)});
const inWorld=()=>!!(typeof S!=='undefined'&&S&&S.phase==='play'&&players.length===2);

(async()=>{
 const web=await staticServer(root), sig=await signalServer(), base='http://127.0.0.1:'+web.port+'/', url=base+'?peer=127.0.0.1:'+sig.port;
 const phones=[], report={build:null,passed:false,checks:[]};
 const pass=(name,info)=>{ report.checks.push({name,passed:true,info}); console.log('PASS',name,JSON.stringify(info||{})); };
 // one browser process per phone: two pages in one headless browser starve each other under software rendering
 const phone=async name=>{ const browser=await playwright.chromium.launch({headless:true,args:ARGS});
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await ctx.addInitScript(()=>{ try{ localStorage.setItem('cd3-shadows','off'); localStorage.setItem('cd3-quality','lite'); }catch(e){} });   // the game's own lighter settings
  await ctx.route(u=>{ const s=String(u); return !(s.startsWith(base)||s.includes('127.0.0.1:'+sig.port)); },r=>r.abort());
  const page=await ctx.newPage(), P={name,browser,page,errors:[]}; phones.push(P);
  page.on('pageerror',e=>P.errors.push(String(e&&e.message||e).slice(0,200)));
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>typeof NET!=='undefined'&&typeof PAIR71B!=='undefined'&&typeof ov!=='undefined'&&ov.classList.contains('on')&&!!document.querySelector('[data-act="nethost"]'),null,{timeout:180000});
  P.tap=async sel=>{ await page.waitForSelector(sel,{state:'attached',timeout:120000}); await page.evaluate(s=>{ document.querySelector(s).click(); },sel); };
  P.type=async(sel,text)=>{ await page.waitForSelector(sel,{state:'attached',timeout:120000}); await page.evaluate(([s,t])=>{ const el=document.querySelector(s); el.value=t; el.dispatchEvent(new Event('input',{bubbles:true})); },[sel,text]); };
  P.wait=(fn,arg,ms)=>page.waitForFunction(fn,arg===undefined?null:arg,{timeout:ms||150000,polling:250});
  P.ev=(fn,arg)=>page.evaluate(fn,arg);
  P.closePanels=async()=>{ for(let k=0;k<6;k++){ const open=await page.evaluate(()=>{ if(!overlayOpen()) return false; const c=panel.querySelector('[data-act="close"]'); if(c) c.click(); else dispatch('close',{}); return true; }); if(!open) break; await sleep(400); } };
  return P; };
 try{
  const A=await phone('A'); report.build=await A.ev(()=>BUILD_ID);
  /* 1. start, join in the usual order, choose on the character screen, move in */
  await A.tap('[data-act="nethost"]'); await A.wait(()=>!!document.getElementById('nm0')||/Could not open/.test(panel.textContent));
  const code=await A.ev(()=>NET.code); await A.type('#nm0','Ada'); await A.tap('[data-act="netready"]'); await A.wait(()=>NET.lobby&&S.ready&&S.ready[0]);
  const B=await phone('B'); await B.tap('[data-act="netjoin"]'); await B.type('#jc',code); await B.tap('[data-act="netjoingo"]');
  await B.wait(()=>!!document.getElementById('nm1')||/Could not join|Waiting for the host/.test(panel.textContent));
  await sleep(4000);                                                         // the host's household reaches the guest while it looks at its character screen
  const pick=async(k,v)=>{ await B.tap(`[data-act="setp"][data-i="1"][data-k="${k}"][data-v="${v}"]`); await sleep(500);
   return B.ev(([k,v])=>({value:S.p[1][k],drawnAsPicked:!!document.querySelector(`[data-act="setp"][data-i="1"][data-k="${k}"][data-v="${v}"].picked`),step:S.setup&&S.setup.step}),[k,v]); };
  const hair=await pick('hair','afro'), outfit=await pick('outfit','kaftan');
  assert.deepEqual(hair,{value:'afro',drawnAsPicked:true,step:'p1'}); assert.deepEqual(outfit,{value:'kaftan',drawnAsPicked:true,step:'p1'});
  await B.type('#nm1','Bola'); await B.tap('[data-act="netready"]');
  await A.wait(()=>S.ready&&S.ready[0]&&S.ready[1]); await B.wait(()=>S.ready&&S.ready[0]&&S.ready[1]&&!!document.querySelector('[data-act="netmovein"]'));
  const seen=await A.ev(()=>[S.p[1].name,S.p[1].hair,S.p[1].outfit]); assert.deepEqual(seen,['Bola','afro','kaftan'],'the host sees what the guest chose');
  await B.tap('[data-act="netmovein"]'); await Promise.all([A.wait(inWorld,null,240000),B.wait(inWorld,null,240000)]); await sleep(1500);
  await A.closePanels(); await B.closePanels(); assert.deepEqual([A.errors,B.errors],[[],[]],'no page error on either phone');
  pass('Start, join by code, choose hair and outfit on the guest’s character screen, move in: every choice is drawn, reaches the host, and no page error occurs',{guestChoices:[hair.value,outfit.value],hostSees:seen});

  /* 2. the guest presses its own Menu and Close; it still takes the host's household */
  await B.ev(()=>{ document.getElementById('hmenu').click(); const c=panel.querySelector('[data-act="close"]'); if(c) c.click(); });
  await A.ev(()=>{ S.flags.pairProbe=7; NET.dirty=true; });                      // something only the host's household can bring
  await B.wait(()=>S.flags&&S.flags.pairProbe===7,null,30000); const step2={A:await A.ev(Q),B:await B.ev(Q)};
  assert.equal(step2.A.count,step2.B.count,'both phones count the same actions');
  pass('After the guest opens and closes its Menu, the host’s household still reaches the guest',{hostRevision:step2.A.rev,guestRevision:step2.B.rev,counts:[step2.A.count,step2.B.count]});

  /* 3. both press the night panel's one button together */
  await B.ev(()=>{ openSleep(); panel.querySelector('[data-act="sleep"]').click(); }); await A.wait(()=>!!document.querySelector('[data-act="nextday"]'),null,30000);
  const press=()=>{ panel.querySelector('[data-act="nextday"]').click(); return performance.timeOrigin+performance.now(); };
  const t=await Promise.all([A.ev(press),B.ev(press)]); await sleep(2500); await A.closePanels(); await B.closePanels(); await sleep(4000);
  const night={A:await A.ev(Q),B:await B.ev(Q)}; assert.deepEqual([night.A.day,night.B.day],[2,2],'one day passed'); assert.equal(night.A.market,night.B.market,'the same market on both phones');
  pass('Both phones press the night panel’s button together: one day passes and both wake to the same market',{pressesApartMs:+Math.abs(t[1]-t[0]).toFixed(1),day:[night.A.day,night.B.day],market:night.A.market});

  /* 4. a third phone types the code */
  const C=await phone('C'); await C.tap('[data-act="netjoin"]'); await C.type('#jc',code); await C.tap('[data-act="netjoingo"]');
  await C.wait(()=>/Could not join/.test(panel.textContent)||(typeof S!=='undefined'&&S&&S.phase==='play'),null,60000);
  const third=await C.ev(()=>({on:NET.on,text:panel.textContent.replace(/\s+/g,' ').trim().slice(0,110),kept:Object.keys(localStorage).filter(k=>/^cd3-(net|online)/.test(k))}));
  assert.equal(third.on,false); assert(/already has two phones playing/.test(third.text),third.text); assert.deepEqual(third.kept,[]);
  await sleep(2500); const after={A:await A.ev(Q),B:await B.ev(Q)}; assert.deepEqual([after.A.other,after.B.other,after.A.me,after.B.me],[true,true,0,1]);
  assert.deepEqual([A.errors,B.errors,C.errors],[[],[],[]],'no page error on any phone');
  pass('A third phone typing the code is turned away with a message and keeps nothing; the two players carry on',{thirdPhoneSees:third.text});
  report.passed=true;
 }catch(e){ report.failure=String(e&&e.stack||e).slice(0,900); report.errors=phones.map(P=>({phone:P.name,errors:P.errors.slice(0,5)})); process.exitCode=1; }
 for(const P of phones){ try{ await P.browser.close(); }catch(e){} } await web.stop(); await sig.stop();
 fs.writeFileSync(path.join(out,'v71b-pair-results.json'),JSON.stringify(report,null,2)+'\n'); console.log(JSON.stringify(report,null,2));
})().catch(e=>{ console.error(e); process.exitCode=2; });

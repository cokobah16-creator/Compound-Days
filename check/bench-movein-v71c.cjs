#!/usr/bin/env node
// "Moving day" (dist/src/movein-v71c.js) in a real browser: headless Chromium, software GL, the game's own pages.
// Run: node check/bench-movein-v71c.cjs [out-dir]     (default artifacts/v71c-movein; needs playwright + Chromium)
//
// For each screen (desktop, phone portrait and landscape at two sizes; one screen with two players, a companion, and two phones over
// WebRTC with check/local-peer-server.cjs): the mission card is shown in each player's own view, inside it, readable,
// and over none of the HUD (player cards, prompt, bag, top bar, partner card, touch controls), and a toast does not cover it. Then the sofa is lifted
// and carried a little: the gold ring is drawn, and when the next place is off screen an arrow sits at the edge of the
// view. A picture of every screen is saved.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let playwright; try{ playwright=require('playwright'); }catch(e){ console.error('Install playwright and its Chromium browser first'); process.exit(2); }
const {staticServer,signalServer}=require('./local-peer-server.cjs');
const root=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');
const out=path.resolve(process.argv[2]||path.join(__dirname,'..','artifacts','v71c-movein')); fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage',
 '--disable-features=WebRtcHideLocalIpsWithMdns','--allow-loopback-in-peer-connection','--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost'];
// in the page: every mission card shown, and what it must not cover
const LAYOUT=()=>{ const R=el=>{ if(!el) return null; const cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden') return null; const r=el.getBoundingClientRect(); return r.width>0&&r.height>0?{x1:Math.round(r.left),y1:Math.round(r.top),x2:Math.round(r.right),y2:Math.round(r.bottom)}:null; };
 const hit=(a,b)=>a&&b&&a.x1<b.x2-1&&b.x1<a.x2-1&&a.y1<b.y2-1&&b.y1<a.y2-1;
 const others=[]; const add=(n,el)=>{ const r=R(el); if(r) others.push({n,r}); };
 add('top bar',document.getElementById('topbar')); for(const i of [0,1]){ const h=document.getElementById('half'+i); if(!h||!R(h)) continue;
  add('player card '+i,h.querySelector('.pcard')); add('prompt '+i,h.querySelector('.pr')); add('bag '+i,h.querySelector('.inv')); add('partner card '+i,h.querySelector('.ocard')); }
 document.querySelectorAll('#touch .act').forEach((b,k)=>add('act button '+k,b)); document.querySelectorAll('#touch .zone').forEach((z,k)=>add('stick zone '+k,z));
 // the sofa's own step toasts are left out while a card is shown; any other toast raised now must not cover a card
 let toastR=null, stepToast=false; const tEl=document.getElementById('toast'); if(tEl&&typeof toast==='function'&&document.querySelector('.mv71c.on')){
  tEl.textContent=''; tEl.classList.remove('on'); toast('Lifted. Carry it together.'); stepToast=tEl.classList.contains('on'); toast('Tomatoes into Ola’s bag'); toastR=R(tEl); }
 const cards=[]; for(const i of [0,1]){ const h=document.getElementById('half'+i), c=h&&h.querySelector('.mv71c.on'), r=R(c); if(!r) continue; const hr=R(h);
  cards.push({i,r,inHalf:!!hr&&r.x1>=hr.x1&&r.x2<=hr.x2+1&&r.y1>=hr.y1&&r.y2<=hr.y2+1,inScreen:r.x1>=0&&r.y1>=0&&r.x2<=innerWidth&&r.y2<=innerHeight,
   covers:others.filter(o=>hit(r,o.r)).map(o=>o.n),underToast:!!hit(r,toastR),text:[...c.children].map(x=>x.textContent).join(' ').replace(/\s+/g,' ').trim(),font:parseFloat(getComputedStyle(c.querySelector('.mv71c-d')).fontSize)}); }
 const arrows=[...document.querySelectorAll('.mv71c-arrow')].map(a=>R(a)).filter(Boolean);
 return {w:innerWidth,h:innerHeight,cards,arrows,single:singleIdx(),stepToast}; };
(async()=>{
 const web=await staticServer(root), sig=await signalServer(), base='http://127.0.0.1:'+web.port+'/';
 const report={build:null,passed:false,checks:[]}; const browsers=[];
 const pass=(name,info)=>{ report.checks.push({name,passed:true,info}); console.log('PASS',name,JSON.stringify(info||{})); };
 const open=async(o)=>{ const browser=await playwright.chromium.launch({headless:true,args:ARGS}); browsers.push(browser);
  const ctx=await browser.newContext(Object.assign({deviceScaleFactor:1},o.ctx)); await ctx.addInitScript(()=>{ try{ localStorage.setItem('cd3-shadows','off'); localStorage.setItem('cd3-quality','lite'); }catch(e){} });
  await ctx.route(u=>{ const s=String(u); return !(s.startsWith(base)||s.includes('127.0.0.1:'+sig.port)); },r=>r.abort());
  const page=await ctx.newPage(), errors=[]; page.on('pageerror',e=>errors.push(String(e&&e.message||e).slice(0,200)));
  await page.goto(base+(o.peer?'?peer=127.0.0.1:'+sig.port:''),{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>typeof MOVEIN71C!=='undefined'&&typeof ov!=='undefined'&&ov.classList.contains('on')&&typeof HERO61!=='undefined'&&['ready','error'].includes(HERO61.state),null,{timeout:240000});
  if(!report.build) report.build=await page.evaluate(()=>BUILD_ID); return {browser,page,errors}; };
 const inWorld=()=>!!(typeof S!=='undefined'&&S&&S.phase==='play'&&players.length===2&&sofa);
 // let the game draw a few frames, then the layout and a picture of the page as a player sees it
 const look=async(P,name)=>{ await P.page.evaluate(()=>new Promise(r=>{ let n=0; const f=()=>{ if(++n>=8) r(); else requestAnimationFrame(f); }; requestAnimationFrame(f); })); await sleep(600);
  const L=await P.page.evaluate(LAYOUT); await P.page.screenshot({path:path.join(out,name+'.png'),timeout:120000}); return L; };
 const ok=(L,want,label)=>{ assert.equal(L.cards.length,want,label+': '+want+' card(s) shown, got '+L.cards.length);
  for(const c of L.cards){ assert(c.inHalf,label+': card '+c.i+' outside its view'); assert(c.inScreen,label+': card '+c.i+' off screen'); assert.deepEqual(c.covers,[],label+': card '+c.i+' covers '+c.covers); assert(!c.underToast,label+': a toast covers card '+c.i); assert(!L.stepToast,label+': a sofa step toast shown over the card'); assert(c.font>=12,label+': card text '+c.font+' px'); } };
 const local=P=>P.page.evaluate(()=>{ NET.on=false; AI.on=false; dispatch('newgame'); S.p[0].name='Efe'; S.p[1].name='Ola'; dispatch('setupstep',{v:'p0'}); dispatch('setupnext',{i:0}); dispatch('setupnext',{i:1}); });
 const companion=P=>P.page.evaluate(()=>{ NET.on=false; dispatch('aiStart'); S.p[0].name='Efe'; S.p[1].name='Ola'; dispatch('setupnext',{i:0}); dispatch('setupnext',{i:1}); });
 const closePanels=P=>P.page.evaluate(()=>{ for(let k=0;k<4&&overlayOpen();k++){ const c=panel.querySelector('[data-act="close"]'); if(c) c.click(); else closePanel(); } });
 try{
  /* 1. one screen, two players, at three screen sizes: taking the ends, then the carry */
  const sizes=[{n:'desktop-1280x800',ctx:{viewport:{width:1280,height:800}}},{n:'phone-portrait-390x844',ctx:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}},{n:'phone-landscape-844x390',ctx:{viewport:{width:844,height:390},isMobile:true,hasTouch:true}},
   {n:'small-phone-portrait-360x640',ctx:{viewport:{width:360,height:640},isMobile:true,hasTouch:true}},{n:'small-phone-landscape-740x360',ctx:{viewport:{width:740,height:360},isMobile:true,hasTouch:true}}];
  for(const z of sizes){ const P=await open(z); await local(P); await P.page.waitForFunction(inWorld,null,{timeout:240000});
   const intro=await P.page.evaluate(()=>(panel.querySelector('.hint')||{}).textContent||''); assert(/Your first job together/.test(intro),'move-in panel: '+intro);
   await closePanels(P); const a=await look(P,'1-'+z.n+'-take'); ok(a,2,z.n+' take'); assert(a.cards.every(c=>/STEP 1 OF 5 Take an end/.test(c.text)),JSON.stringify(a.cards.map(c=>c.text)));
   await P.page.evaluate(()=>{ dispatch('hs',{i:0,id:'sofa'}); dispatch('hs',{i:1,id:'sofa'}); });
   await P.page.evaluate(()=>{ keys['w']=true; keys['arrowup']=true; }); await sleep(2500); await P.page.evaluate(()=>{ keys['w']=false; keys['arrowup']=false; });
   const b=await look(P,'1-'+z.n+'-carry'); ok(b,2,z.n+' carry'); const st=await P.page.evaluate(()=>({carrying:!!sofa.carrying,goal:MOVEIN71C.goal&&MOVEIN71C.goal.visible,stage:moveinRoute71c()}));
   assert.equal(st.carrying,true,z.n+': carrying'); assert.equal(st.goal,true,z.n+': gold ring drawn');
   // a few seconds into the step: no card covers its player, the sofa or the gold ring (where it would, only its title shows)
   await P.page.evaluate(()=>{ MOVEIN71C.fullUntil=[-99,-99]; updateHUD(); });
   const hid=await P.page.evaluate(()=>moveinViews71c().map(i=>{ const el=MOVEIN71C.cards[i], h=document.getElementById('half'+i).getBoundingClientRect(), c=el.getBoundingClientRect();
    return {i,mini:el.classList.contains('mini'),gone:el.classList.contains('gone'),covers:moveinCovers71c(i,{x1:c.left-h.left,x2:c.right-h.left,y1:c.top-h.top,y2:c.bottom-h.top})}; }));
   const cv=await look(P,'1-'+z.n+'-later'); ok(cv,hid.filter(k=>!k.gone).length,z.n+' later');
   for(const k of hid) assert(k.gone||!k.covers,z.n+': card '+k.i+' covers its player, the sofa or the ring'+(k.mini?' even as its title':''));
   // the next place off screen: the arrow sits at the edge of each view, inside the screen and over no card
   await P.page.evaluate(()=>{ MOVEIN71C.saved=JSON.stringify(MOVEIN71C.target); for(const k of Object.keys(MOVEIN71C.target)) MOVEIN71C.target[k]=[[-28,-20,0.1]]; });   // every ring far away, off screen
   const c=await look(P,'1-'+z.n+'-arrow'); await P.page.evaluate(()=>{ MOVEIN71C.target=JSON.parse(MOVEIN71C.saved); });
   assert(c.arrows.length>=1,z.n+': an edge arrow'); for(const r of c.arrows){ assert(r.x1>=0&&r.y1>=0&&r.x2<=c.w&&r.y2<=c.h,z.n+': arrow on screen '+JSON.stringify(r)); for(const k of c.cards) assert(!(r.x1<k.r.x2&&k.r.x1<r.x2&&r.y1<k.r.y2&&k.r.y1<r.y2),z.n+': arrow over a card'); }
   assert.deepEqual(P.errors,[],z.n+': page errors');
   pass('One screen, two players, '+z.n.replace(/-/g,' ')+': both cards in their own views, over none of the HUD; lifted and carried, the gold ring is drawn; a few seconds on no card covers its player, the sofa or the ring; with the next place off screen an arrow sits at the edge',{cards:b.cards.map(k=>({player:k.i+1,box:k.r,text:k.text.slice(0,60)})),titleOnly:hid.filter(k=>k.mini&&!k.gone).map(k=>k.i+1),outOfSight:hid.filter(k=>k.gone).map(k=>k.i+1),arrows:c.arrows.length,stage:st.stage});
   await P.browser.close(); }
  /* 2. a companion, phone portrait: one card, in the player's own view */
  { const P=await open(sizes[1]); await companion(P); await P.page.waitForFunction(inWorld,null,{timeout:240000}); await closePanels(P);
   const a=await look(P,'2-companion-phone-portrait'); ok(a,1,'companion'); assert.equal(a.cards[0].i,0);
   await P.page.evaluate(()=>{ dispatch('hs',{i:0,id:'sofa'}); }); await P.page.waitForFunction(()=>sofa.carrying,null,{timeout:60000}); const b=await look(P,'2-companion-phone-portrait-lifted'); ok(b,1,'companion lifted');
   assert(/In through the gate/.test(b.cards[0].text),b.cards[0].text); assert.deepEqual(P.errors,[]);
   pass('A companion, phone portrait: one card, in the player’s view, over none of the HUD; the companion takes the other end and the card moves on',{box:b.cards[0].r,text:b.cards[0].text.slice(0,70)});
   await P.browser.close(); }
  /* 3. two phones over WebRTC, phone portrait: each phone shows its own player's card */
  { const tap=async(P,sel)=>{ await P.page.waitForSelector(sel,{state:'attached',timeout:120000}); await P.page.evaluate(s=>document.querySelector(s).click(),sel); };
   const type=async(P,sel,t)=>{ await P.page.waitForSelector(sel,{state:'attached',timeout:120000}); await P.page.evaluate(([s,v])=>{ const e=document.querySelector(s); e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); },[sel,t]); };
   const A=await open(Object.assign({peer:true},sizes[1])); await tap(A,'[data-act="nethost"]'); await A.page.waitForFunction(()=>!!document.getElementById('nm0'),null,{timeout:150000});
   const code=await A.page.evaluate(()=>NET.code); await type(A,'#nm0','Ada'); await tap(A,'[data-act="netready"]'); await A.page.waitForFunction(()=>NET.lobby&&S.ready&&S.ready[0],null,{timeout:150000});
   const B=await open(Object.assign({peer:true},sizes[1])); await tap(B,'[data-act="netjoin"]'); await type(B,'#jc',code); await tap(B,'[data-act="netjoingo"]');
   await B.page.waitForFunction(()=>!!document.getElementById('nm1'),null,{timeout:150000}); await type(B,'#nm1','Bola'); await tap(B,'[data-act="netready"]');
   await B.page.waitForFunction(()=>S.ready&&S.ready[0]&&S.ready[1]&&!!document.querySelector('[data-act="netmovein"]'),null,{timeout:150000}); await tap(B,'[data-act="netmovein"]');
   await Promise.all([A.page.waitForFunction(inWorld,null,{timeout:240000}),B.page.waitForFunction(inWorld,null,{timeout:240000})]); await sleep(1500); await closePanels(A); await closePanels(B);
   const a=await look(A,'3-two-phones-host'), b=await look(B,'3-two-phones-guest'); ok(a,1,'host phone'); ok(b,1,'guest phone'); assert.deepEqual([a.cards[0].i,b.cards[0].i],[0,1]);
   assert.deepEqual([A.errors,B.errors],[[],[]]);
   pass('Two phones over WebRTC, phone portrait: each phone shows one card, its own player’s, over none of the HUD',{host:{box:a.cards[0].r,text:a.cards[0].text.slice(0,60)},guest:{box:b.cards[0].r,text:b.cards[0].text.slice(0,60)}}); }
  report.passed=true;
 }catch(e){ report.failure=String(e&&e.stack||e).slice(0,900); process.exitCode=1; }
 for(const b of browsers){ try{ await b.close(); }catch(e){} } await web.stop(); await sig.stop();
 fs.writeFileSync(path.join(out,'v71c-movein-results.json'),JSON.stringify(report,null,2)+'\n'); console.log(JSON.stringify(report,null,2));
})().catch(e=>{ console.error(e); process.exitCode=2; });

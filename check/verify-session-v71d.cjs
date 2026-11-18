// v71d "Session log" and "Build check" (dist/src/session-v71d.js), on two or three copies of the real game joined through
// the real room code (check/two-phones.cjs). Check 7 gives one phone the page of the build before the check: taken from
// git history (the commit below, with git archive, into a temporary folder that is removed afterwards), or from
// COMPOUND_OLD_BUILD_DIR if set. Without either (a shallow clone) check 7 fails and says why.
// Nothing here is a phone test: what a real browser does with Save as a file is in check/bench-session-v71d.cjs.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const OLD_COMMIT='11c236f4bf32421fafdabdcc0ae6cea8efb5cd50';   // the last build before the session log and the build check
const T=require('./two-phones.cjs');const {W}=T;
const checks=[];let build=null;const live=[];
const pass=(n,info)=>{checks.push({name:n,passed:true,info});console.log('PASS',n,info?JSON.stringify(info):'');};
const phone=async(label,o)=>{const P=await T.makePhone(label,o);live.push(P);if(!build&&!(o&&o.root))build=P.run('BUILD_ID');return P;};
const fresh=()=>{live.splice(0).forEach(P=>{if(!P.dead)T.kill(P);});T.reset();};
const two=async o=>{fresh();const A=await phone('A'),B=await phone('B');const code=await T.pair(A,B,o);return {A,B,code};};
const buy=(P,k)=>P.run(`dispatch('buy',{i:NET.myIndex,k:'${k}',st:'s1',price:S.mkt.items.${k}.price})`);
const lines=P=>P.J('SESSION71D.lines.map(l=>l[1])');
const has=(P,re)=>lines(P).some(l=>re.test(l));
const stored=P=>P.storage.get('cd3-session71d')||'';
const noErrors=()=>assert.deepEqual(W.errors,[],'errors: '+JSON.stringify(W.errors.slice(0,3)));
let failed=0;const step=async(n,what,fn)=>{try{await fn();}catch(e){failed++;const why=String(e&&e.message||e).split('\n')[0].slice(0,240);checks.push({name:'Check '+n+' failed: '+what,passed:false,failure:why});console.log('FAIL',n,what,'|',why);}};
let oldTmp=null;
function oldBuild(){ if(process.env.COMPOUND_OLD_BUILD_DIR) return process.env.COMPOUND_OLD_BUILD_DIR;
 try{ oldTmp=fs.mkdtempSync(path.join(os.tmpdir(),'compound-old-')); const tar=cp.execFileSync('git',['-C',path.resolve(__dirname,'..'),'archive',OLD_COMMIT,'dist'],{maxBuffer:1<<30,stdio:['ignore','pipe','ignore']});
  cp.execFileSync('tar',['-x','-C',oldTmp],{input:tar,stdio:['pipe','ignore','ignore']}); return path.join(oldTmp,'dist'); }catch(e){ return ''; } }
const OLD=oldBuild();
(async()=>{
 /* 1. One-phone play leaves no trace. */
 await step(1,'One-phone play leaves no trace',async()=>{fresh();const P=await phone('A');
  P.run("NET.on=false;dispatch('newgame');S.p[0].name='Ada';S.p[1].name='Bola';dispatch('setupstep',{v:'p0'});dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();");
  P.run("dispatch('buy',{i:0,k:'tomato',st:'s1',price:S.mkt.items.tomato.price});closePanel();toast('A one-phone toast');openMenu();");await T.settle(3000);
  assert.deepEqual([P.J('SESSION71D.armed'),P.J('SESSION71D.lines.length'),P.storage.has('cd3-session71d')],[false,0,false],'nothing kept or written');
  assert(!/sesslog71d/.test(String(P.run('panel.innerHTML'))),'the Menu offers no session log');assert.equal(P.J('SESSION71D.banner'),null,'no banner');
  assert.equal(P.J('TICK_HOOKS.length'),17,'no new per-frame hook');noErrors();
  pass('One-phone play: the log never starts, nothing is written to the phone, the Menu offers no log and no banner is drawn; the per-frame hook list is unchanged',{tickHooks:17});});

 /* 2. A normal two-phone session, on both phones. */
 await step(2,'A normal two-phone session is logged on both phones',async()=>{const {A,B,code}=await two();
  buy(B,'tomato');await T.play([A,B],3);buy(A,'pepper');await T.play([A,B],32);
  for(const [P,role] of [[A,'P1: writes the household, holds the meeting point'],[B,'P2: follows the host\u2019s household, joined the meeting point']]){const L=lines(P);
   assert(/^session log on \(a two-phone household\): build v71-[0-9a-f]{8}, site [^,]+, screen 390x800, touch, time zone UTC[+-]\d\d:\d\d; /.test(L[0]),'starts with build, site, device and time zone: '+L[0]);
   assert(has(P,new RegExp('^this phone is '+role+'$')),P.label+' says who it is: '+L.filter(l=>/this phone is/.test(l)));assert(has(P,/^partner P[12] on the same build \(v71-[0-9a-f]{8}\), room id /),P.label+' names the partner\u2019s build and room id');
   assert(has(P,/^status: P[12]: .*last heard \d+\.\d s ago, its clock [+-]\d+\.\d s;/),'a status line with when the partner was last heard and its clock');assert.equal(P.J('SESSION71D.bannerKey'),null,'no banner');
   assert(!has(P,/not taken/),'no household refused in a normal session: '+L.filter(l=>/not taken/.test(l)));}
  assert(!has(B,/^this phone is P1/),'the guest never claims Player 1 before the room has spoken');
  assert(has(A,/^room: holding palm-\*\*\*\* \(this phone's room id the meeting point\)$/)&&has(B,/^room: joined palm-\*\*\*\* \(this phone's room id [^)]+\)$/),'the room lines, masked, with room ids');
  const sent=lines(B).find(l=>/^sent buy #\d+$/.test(l)),n=sent&&sent.split('#')[1];assert(n,'the guest logs its purchase with its number');
  assert(has(A,new RegExp('^got buy #'+n+' from P2$')),'the host logs the same number from P2');assert(has(A,/^sent buy #\d+$/)&&has(B,/^got buy #\d+ from P1$/),'and the other way');
  const text=B.run('sess71dText()'),both=stored(A)+stored(B)+text+A.run('sess71dText()'),tail=code.split('-').pop();
  for(const secret of [code,tail,'compound-days-v47-'+code,'cd3-online-'+code]) assert(!both.includes(secret),'nothing contains '+(secret===tail?'the code\u2019s secret part':secret.replace(code,'the code')));
  assert(/^Compound Days session log\nBuild: v71-[0-9a-f]{8}\nSite: [^\n]+\nSaved: [^\n]+ UTC\n/.test(text)&&/Times are UTC/.test(text),'the saved text says what it is, and that times are UTC');
  const s0=stored(B);B.run("toast('A toast to log')");assert.equal(stored(B),s0,'nothing is written to storage inside a game call');await T.play([A,B],1.5);assert(stored(B).includes('toast: A toast to log'),'it is written within a second or two');
  A.run("ACTIONS.boom71d=()=>{}");B.run("ACTIONS.boom71d=()=>{throw new Error('kaboom')}");A.run("dispatch('boom71d',{})");await T.play([A,B],1);
  assert(has(B,/^error caught: remote action failed boom71d kaboom$/),'a replay that throws on this phone is logged: '+lines(B).filter(l=>/error/.test(l)));
  B.run("closePanel();openMenu();");assert(/data-act="sesslog71d"/.test(String(B.run('panel.innerHTML'))),'the two-phone Menu offers the log');
  B.run("sess71dAdd('a line with <b>markup</b> in it');dispatch('sesslog71d')");const h=String(B.run('panel.innerHTML'));
  assert(/&lt;b&gt;markup&lt;\/b&gt;/.test(h)&&!/<b>markup/.test(h),'lines are shown as text');assert(/does not include the household code/.test(h)&&/up to seven days/.test(h),'the panel says what is in it and how long it stays');
  assert.equal(String(A.run('panel.innerHTML')).includes('Session log'),false,'opening it is this phone\u2019s only');
  B.run("var savedBlob=null;URL.createObjectURL=b=>{savedBlob=b;return 'blob:x';};URL.revokeObjectURL=()=>{};var made=[];{const ce=document.createElement;document.createElement=function(){const e=ce.apply(this,arguments);made.push(e);return e;};}dispatch('sesssave71d')");
  await T.settle(100);assert.equal(B.J('SESSION71D.saved'),1,'saved once');assert(/^compound-days-session-v71-[0-9a-f]{8}-\d{4}-\d\d-\d\d-\d\d-\d\d\.txt$/.test(B.run('made[made.length-1].download')),'a dated .txt file name');
  B.run("var blobText=null;savedBlob.text().then(t=>{blobText=t;})");await T.settle(50);assert(/^Compound Days session log/.test(B.run('blobText')),'the file holds the log');
  B.run("dispatch('sesscopy71d')");assert(/select the text below/.test(String(B.run('panel.innerHTML'))),'without a clipboard the text is shown to copy');
  B.run("dispatch('sessclear71d')");assert.deepEqual(lines(B),['log cleared'],'Clear empties it');noErrors();
  pass('A normal session: both phones log build, site, device and time zone, the room lines with room ids, who they are (the guest only once the room has said), the partner on the same build, each action sent and received with the same number, no refused household, status lines with when the partner was last heard and its clock, and an error caught while replaying an action; storage is never written inside a game call; nothing kept, shown or saved contains the household code or its secret part; the Menu offers the log, which shows lines as text, saves a dated .txt file, falls back to showing the text to copy, clears, and opens on this phone only',{numbered:'buy #'+n});});

 /* 3. Trouble: a locked phone, a dropped link, lost and kept actions, a reload, a device turned away. */
 await step(3,'Trouble is logged',async()=>{const out={};
  {let {A,B,code}=await two();T.sleep(B);await T.play([A],40);T.wake(B);await T.play([A,B],25);
   assert(has(B,/^no frame for 4\d\.\d s \(the page was paused or busy\)$/),'the guest notes the pause');
   assert(has(A,/^room: guest (silent|out)/)&&has(A,/^partner away$/)&&has(A,/^partner here$/),'the host notes the guest going and coming back');
   assert(has(A,/^nothing heard from the other phone for [5-9] s$/),'the host notes the silence before the room gives up on the guest');
   assert(has(B,/^room: (looking for the meeting point|trying again in \d+\.\d s \(attempt \d+\))/),'the guest\u2019s attempts to get back are logged');
   const before=lines(B).length;T.kill(B);B=await T.reopen(B);live.push(B);await T.play([A,B],3);
   assert(lines(B).length>before&&has(B,/^page opened: build v71-[0-9a-f]{8}, site /),'the log survives a reload and goes on');
   const C=await phone('C');await T.join(C,code);
   assert(has(C,/^join failed after \d+ ms: That household already has two phones playing/),'the turned-away device logs why');
   assert(/data-act="sesslog71d"/.test(String(C.run('panel.innerHTML')))&&/Could not join/.test(String(C.run('panel.innerHTML'))),'the Could not join panel offers the log');
   assert(!stored(C).includes(code)&&!stored(C).includes(code.split('-').pop()),'masked there too');out.locked='pause, silence, retries, reload, refusal';}
  {const {A,B}=await two();T.cut(B,true);await T.play([A,B],45);buy(B,'tomato');buy(A,'pepper');await T.play([A,B],5);T.cut(B,false);await T.play([A,B],25);   // both act apart: the host's household stands
   assert(has(B,/^caught up with the host's household \(rev \d+ count \d+\); never reached the host: buy #\d+$/),'the guest names its action that never arrived: '+lines(B).filter(l=>/caught up|never/.test(l)));out.bothActed='the lost action named';}
  {const {A,B}=await two();T.cut(B,true);await T.play([A,B],45);buy(B,'tomato');await T.play([A,B],5);T.cut(B,false);await T.play([A,B],25);   // only the guest acted: its household is kept
   assert(has(B,/^offered this phone's household as the newer copy/),'the guest offers its household');
   assert(has(A,/^took the other phone's household \(rev \d+ count \d+\) over this phone's \(rev \d+ count \d+\)$/),'the host says it took it: '+lines(A).filter(l=>/took|offer/.test(l)));out.guestOnly='offer and take logged';}
  noErrors();pass('Trouble is logged: a phone locked for forty seconds notes the pause, the host the silence, the guest going and its return, and the guest its attempts to get back; the log survives a reload; a device turned away logs why and its Could not join panel offers the log; when both acted apart the guest names its action that never reached the host; when only the guest did, it logs its offer and the host logs taking the guest\u2019s household',out);});

 /* 4. What is never kept: codes as typed, text from the other phone. */
 await step(4,'Codes as typed, and text from the other phone',async()=>{const {A,B,code}=await two();const tail=code.split('-').pop();
  const C=await phone('C');for(const typed of ['palm-','palm-'+code,code.toUpperCase(),tail,code]){C.run(`dispatch('netjoin')`);C.el('jc').value=typed;C.run("dispatch('netjoingo')");await T.settle(3500);}
  assert(has(C,/^joining household palm-\*\*\*\* \(\d+ characters typed\)$/),'joins are logged without the code');assert(!has(C,/^panel: Joining palm/),'the joining title is named, not quoted');
  assert(!stored(C).toLowerCase().includes(tail)&&!C.run('sess71dText()').toLowerCase().includes(tail),'the secret part is never kept, whatever form it was typed in');
  A.run("applyRemote({data:{name:'made-up\\n2026-01-01 00:00:00.000  forged line',data:{},src:1}});applyRemote({data:{name:'buy',data:{i:1,k:'tomato\\nforged'},src:1}});");
  for(let k=0;k<11;k++)A.run("sess71dSecond()");await T.play([A,B],11);
  assert(!lines(A).some(l=>/\n|forged line/.test(l)),'nothing from the other phone becomes a line of its own');assert(has(A,/^got \d+ actions? this build does not know$/),'unknown actions are only counted');
  B.run("SESSION71D.build='x'.repeat(5000)");await T.play([A,B],3);   // a phone announcing something that is not a build name
  const ban=String(A.run('SESSION71D.banner&&SESSION71D.banner.innerHTML')),msg=A.J('SESSION71D.bannerMsg&&SESSION71D.bannerMsg.text')||'';
  assert(/does not recognise/.test(msg)&&!msg.includes('xxxx')&&ban.length<400&&!ban.includes('xxxx'),'an odd build is not shown, only said to be unrecognised');noErrors();
  pass('Never kept: the household code typed after "palm-", in capitals, only its secret part, or after a first try with only "palm-" in the field (the joining panel is named, not quoted); an action name or field from the other phone with a line break in it, or one this build does not know (only counted); a partner build that is not a build name is called unrecognised and not shown',{typed:5});});

 /* 5. The log, its limits, and its life. */
 await step(5,'The log stays small, short-lived and two-phone only',async()=>{const {A,B}=await two();
  A.run("for(let k=0;k<5;k++)sess71dAdd('the same line');");assert.equal(lines(A).slice(-1)[0],'the same line (x5)','a repeated line gets a count');
  A.run("for(let k=0;k<3000;k++)sess71dAdd('line '+k+' '+'x'.repeat(150));SESSION71D.dirty=true;sess71dFlush();");
  const n=A.J('SESSION71D.lines.length'),bytes=stored(A).length;assert(n<=1500&&bytes<=180000,'kept '+n+' lines, '+bytes+' bytes');
  assert(/^line 2999 /.test(lines(A).slice(-1)[0]),'the newest kept');assert(/earlier lines dropped/.test(A.run('sess71dText()')),'the file says lines were dropped');
  // the phone later plays on its own: nothing of that is recorded, the Menu does not offer the log, the title does
  A.run("dispatch('title')");await T.settle(500);const L0=lines(A).length;
  A.run("NET.on=false;dispatch('newgame');S.p[0].name='Solo';S.p[1].name='Two';dispatch('setupstep',{v:'p0'});dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();toast('A toast in one-phone play');openMenu();");await T.settle(3000);
  assert(!lines(A).slice(L0).some(l=>/toast:|panel:/.test(l)),'one-phone play is not recorded');assert(!/sesslog71d/.test(String(A.run('panel.innerHTML'))),'the one-phone Menu does not offer it');
  // lines older than seven days go when the page opens
  const old=JSON.stringify({v:2,dropped:0,lines:[[A.J('Date.now()')-8*864e5,'an old line']]});const P=await phone('P',{storage:[['cd3-session71d',old]]});
  assert.deepEqual([P.J('SESSION71D.armed'),P.storage.has('cd3-session71d')],[false,false],'a log with nothing from the last seven days is dropped and the log is off');noErrors();
  pass('Limits and life: a line repeated within ten seconds gets a count; after 3000 long lines the phone keeps the newest, at most 1500 lines and 180 KB, and the file says older lines were dropped; one-phone play afterwards is not recorded and its Menu does not offer the log; a log with nothing from the last seven days is dropped when the page opens',{kept:n});});

 /* 6. Two phones on different builds, or sites. */
 await step(6,'Two phones on different builds',async()=>{fresh();const A=await phone('A'),B=await phone('B');B.run("SESSION71D.build='v71-0000beef'");await T.pair(A,B);await T.play([A,B],3);
  assert.deepEqual([A.J('SESSION71D.bannerKey'),B.J('SESSION71D.bannerKey')],['build:v71-0000beef','build:'+build],'each phone names the other\u2019s build');
  const pill=String(A.run('SESSION71D.banner.innerHTML')),t=A.J('SESSION71D.bannerMsg.text');assert(/^<span>Different versions<\/span>/.test(pill)&&/data-sess71d="details"/.test(pill)&&/data-sess71d="dismiss"/.test(pill),'a one-line notice with Details and hide: '+pill.slice(0,160));
  assert(/Bola\u2019s phone is running a different version of the game \(this phone: v71-[0-9a-f]{8}, that one: v71-0000beef\)\. Reload the page on both phones, then tap Continue together\./.test(t),t.slice(0,220));
  A.run("ACTIONS.sessver71d()");const dp=String(A.run('panel.innerHTML'));assert(/Two versions of the game/.test(dp)&&/data-act="sessreload71d"/.test(dp)&&/data-act="sessdismiss71d"/.test(dp),'Details: the message, Reload and hide');
  assert(has(A,/^partner P2 on v71-0000beef/)&&has(A,/^told the player: /),'logged');
  A.run("ACTIONS.sessdismiss71d()");await T.play([A,B],4);assert.deepEqual([A.J('SESSION71D.bannerKey'),A.J('SESSION71D.banner.className'),A.J('overlayOpen()')],[null,'sess71d-ver',false],'hidden (the Details panel closes with it), it stays away');
  B.run("ACTIONS.sessreload71d()");assert.equal(B.context.__reloads,1,'Reload reloads the page');assert(has(B,/^reload pressed on the version notice$/)&&stored(B).includes('reload pressed'),'and is written first');
  buy(B,'tomato');await T.play([A,B],3);assert(T.same(A,B),'play goes on: it never blocks');
  // a partner on another site (the preview against the live site): no Reload, open the same address
  fresh();const C=await phone('C'),D=await phone('D');C.run("SESSION71D.site='game.example'");D.run("SESSION71D.site='preview.example'");await T.pair(C,D);await T.play([C,D],3);
  const s=C.J('SESSION71D.bannerMsg.text');assert(/Bola\u2019s phone is on preview\.example, this one on game\.example: two different versions of the game\. Open the same address on both phones/.test(s),s.slice(0,200));
  C.run("ACTIONS.sessver71d()");assert(!/data-act="sessreload71d"/.test(String(C.run('panel.innerHTML'))),'no Reload when the sites differ');noErrors();
  pass('Different builds: each phone shows a one-line notice whose Details name both builds, with Reload and hide, and logs it; hidden it stays away; Reload writes the log and reloads the page; play is never blocked. Different sites: the message names both and asks to open the same address, with no Reload',{});});

 /* 7. A partner on a build from before the check. */
 await step(7,'A partner on a build from before the check',async()=>{assert(OLD,'no older build: this clone has no history of commit '+OLD_COMMIT.slice(0,7)+' (fetch it, or set COMPOUND_OLD_BUILD_DIR)');
  fresh();const A=await phone('A'),B=await phone('B',{root:OLD});assert.equal(B.run('typeof SESSION71D'),'undefined','B runs the older build');
  await T.pair(A,B);await T.play([A,B],3);assert.equal(A.J('SESSION71D.bannerKey'),'old','A sees a partner with no build');
  const t=A.J('SESSION71D.bannerMsg.text');assert(/Bola\u2019s phone is running an older version of the game\. Bola should reload the page there, then tap Continue together\./.test(t),t.slice(0,200));
  A.run("ACTIONS.sessver71d()");assert(!/data-act="sessreload71d"/.test(String(A.run('panel.innerHTML'))),'no Reload here: this phone is the newer one');
  buy(B,'tomato');await T.play([A,B],3);assert(T.same(A,B),'they still play together');noErrors();
  pass('A partner on a build from before the check (the real previous build\u2019s page, from git history): the phone with the check says the partner should reload, and offers no Reload of its own; the two still play together',{});});

 fresh();if(oldTmp){try{fs.rmSync(oldTmp,{recursive:true,force:true});}catch(e){}}
 const report={build,passed:failed===0,checks,method:'Two or three copies of the shipped game in one Node process, joined through the real room code over a stand-in for PeerJS (check/two-phones.cjs); one world clock, seeded random numbers. Not a phone test.'};
 fs.writeFileSync(path.join(__dirname,'results-session-v71d.json'),JSON.stringify(report,null,2)+'\n');if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);fs.writeFileSync(path.join(__dirname,'results-session-v71d.json'),JSON.stringify({build,passed:false,checks,failure:String(e&&e.stack||e)},null,2)+'\n');process.exitCode=1;});

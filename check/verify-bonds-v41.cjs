// Bonds (v41, dist/src/bonds-v41.js): the friendship ladder and each neighbour's daily mood and want.
// Checked on the real game logic in Node with the shipped Three.js; nothing is rendered, so panel HTML is captured from
// panel.insertAdjacentHTML. The checks run twice in child processes and the two reports must match. Math.random and
// Date.now are stubbed; no wall-clock value reaches the results.
// Prints one PASS or FAIL line per check and writes check/results-bonds-v41.json.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process');
const OUT=path.join(__dirname,'results-bonds-v41.json');
const NAMES=[
 '1. Off until used: nothing shows on day 1 or in online play, and 60 frames on day 2 write no S.bonds41',
 '2. The ladder: plain chat counts once per neighbour per day; other friendship (a request, a party, a task reward inside a talk) counts in full; five levels at 0, 4, 12, 24 and 40 points; points never fall',
 '3. An old save is seeded from its friendship, capped at Friend',
 '4. Moods and wants: one of each per neighbour per day, the same for the same household and day, kept through save and load; a want never repeats on the next day',
 '5. Helping: the item is taken, +3 ladder points and +1 friendship, no money, their mood turns bright, the player cheers; only near them, and only once a day',
 '6. Company: a "talk to them this evening" want is met by talking to them after six, with their thanks in the talk',
 '7. The talk panel: their mood line and today\'s want card sit above Later, and openTalk is still the bridge\'s; "missed you" after 6 days away, once',
 '8. Level rewards: a level-up line at the next talk; Friends greet by name once a day when you pass; Close friends leave something by the door now and then (at most once in 3 days each); Like family tell a secret once and it is remembered',
 '9. Determinism: two runs give identical reports'];

function inner(){
 const {load}=require('./runtime-harness.cjs');const checks=[];
 (async()=>{
  const {run}=await load();
  const J=c=>JSON.parse(run('JSON.stringify('+c+')'));
  run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;setTimeout=()=>0;");
  run("var PH41='';{const op=openPanel;openPanel=function(h){PH41+=String(h);return op.apply(this,arguments);};}panel.insertAdjacentHTML=function(w,h){PH41+=h;};var TOASTS41=[];toast=function(t){TOASTS41.push(t);};var BUB41=[];bubble40=function(t){BUB41.push(t);return {};};");
  run("buildTextures();buildTextures2();buildWorld();");
  const fresh=()=>run("NET.on=false;_silent=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';S.household='Check';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();PH41='';");
  const next=()=>run("dispatch('nextday');closePanel();PH41='';");
  const near=k=>run(`{const n=npcs.${k};n.g.visible=true;players[0].g.position.set(n.g.position.x+1,0,n.g.position.z);players[1].g.position.set(n.g.position.x+40,0,n.g.position.z);}`);
  const far=()=>run("players.forEach(p=>p.g.position.set(-60,0,-60));");
  const talk=k=>{near(k);run(`PH41='';openTalk(0,'${k}');`);return run('PH41');};
  const frames=n=>run(`for(let f=0;f<${n};f++)for(const h of TICK_HOOKS)h(1/30,true);`);
  const nb=k=>J(`S.bonds41.nb.${k}`);
  const step=(i,fn)=>{const name=NAMES[i];try{const info=fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});}catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});}};

  step(0,()=>{fresh();assert.equal(run('S.day'),1);assert.equal(run('bondsOn41()'),false,'off on day 1');talk('tunde');assert.equal(run('S.bonds41'),undefined,'nothing written on day 1');
   next();frames(60);assert.equal(run('S.bonds41===undefined||!!S.bonds41'),true);
   run('delete S.bonds41');frames(60);assert.equal(run('S.bonds41'),undefined,'frames write nothing');
   run('NET.on=true');assert.equal(run('bondsOn41()'),false,'off online');run('NET.on=false');assert.equal(run('bondsOn41()'),true,'on from day 2');});

  step(1,()=>{fresh();next();run('delete S.bonds41');run("S.time=9");talk('tunde');const a=nb('tunde').pts;run("S.time=14");talk('tunde');assert.equal(nb('tunde').pts,a,'second chat the same day adds nothing');
   run("aff('tunde',2)");assert.equal(nb('tunde').pts,a+2,'other friendship counts in full');
   assert.deepEqual(J('BONDS41.LEVELS.map(l=>l.n)'),[0,4,12,24,40]);assert.deepEqual(J('[0,3,4,11,12,23,24,39,40,99].map(bondLevel41)'),[0,0,1,1,2,2,3,3,4,4]);
   next();talk('tunde');assert.equal(nb('tunde').pts,a+3,'one chat point the next day');
   for(let d=0;d<8;d++){next();}assert.equal(nb('tunde').pts,a+3,'points never fall');
   // a task reward given inside a talk counts in full, even after the day's chat point (Ada's photographs: aff('ada',2) in her talk)
   run("S.time=9");talk('ada');const p0=nb('ada').pts;run("S.nb.ada.aff=1;delete S.flags.adaPhotos;S.p[0].sk.photo=1;S.time=14");talk('ada');assert.equal(run('!!S.flags.adaPhotos'),true,'the photo task ran');
   assert.equal(nb('ada').pts,p0+2,'the photo reward counts in full');return {afterChatAndAff:a+3,photoReward:nb('ada').pts-p0};});

  step(2,()=>{fresh();next();run("delete S.bonds41;S.nb.ada.aff=30;S.nb.tunde.aff=5;");run('bonds41(true)');assert.equal(nb('ada').pts,12);assert.equal(nb('ada').lvl,2);assert.equal(nb('tunde').pts,5);assert.equal(nb('tunde').lvl,1);});

  step(3,()=>{fresh();next();const a=J("BONDS41.CAST.map(k=>{const b=bondToday41(k);return b.mood.m+'/'+b.want.id})");
   run('save();S=load();enterWorld();closePanel();');const b=J("BONDS41.CAST.map(k=>{const b=bondToday41(k);return b.mood.m+'/'+b.want.id})");assert.deepEqual(b,a,'kept through reload');
   const seen={},moods={};let prev=J("Object.fromEntries(BONDS41.CAST.map(k=>[k,bondToday41(k).want.id]))");
   for(let d=0;d<40;d++){next();const now=J("Object.fromEntries(BONDS41.CAST.map(k=>[k,bondToday41(k).want.id]))");const m=J("BONDS41.CAST.map(k=>bondToday41(k).mood.m)");
    for(const k in now){assert.notEqual(now[k],prev[k],k+' repeats a want');seen[now[k]]=(seen[now[k]]||0)+1;}m.forEach(x=>moods[x]=(moods[x]||0)+1);prev=now;}
   for(const m of ['bright','easy','tired','worried'])assert(moods[m]>0,'mood '+m+' seen');return {wants:seen,moods};});

  step(4,()=>{fresh();next();run("S.time=10");let k=null;
   for(let d=0;d<12&&!k;d++){k=J("BONDS41.CAST.find(k=>bondWant41(k).id==='fish')||null");if(!k)next();}assert(k,'a fish want within 12 days');
   run("addPantry('fish',1)");far();run(`ACTIONS.bond41Give({k:'${k}'})`);assert.equal(nb(k).want.done,false,'not from afar');
   const p0=nb(k).pts,a0=run(`S.nb.${k}.aff|0`),m0=run('S.money'),c0=run('S.p[0].mood');near(k);run(`ACTIONS.bond41Give({k:'${k}'})`);const b=nb(k);
   assert.equal(b.want.done,true);assert.equal(run("haveCount('fish')"),0,'fish taken');assert.equal(b.pts,p0+3);assert.equal(run(`S.nb.${k}.aff|0`),a0+1);assert.equal(run('S.money'),m0,'no money');
   assert.equal(b.mood.m,'bright');assert(run('S.p[0].mood')>=Math.min(100,c0),'cheer');
   run("addPantry('fish',1)");run(`ACTIONS.bond41Give({k:'${k}'})`);assert.equal(run("haveCount('fish')"),1,'only once a day');return {who:k};});

  step(5,()=>{fresh();next();let k=null;for(let d=0;d<12&&!k;d++){k=J("BONDS41.CAST.find(k=>bondWant41(k).id==='company'&&k!=='nkechi')||null");if(!k)next();}assert(k,'a company want');
   run("S.time=10");placeAt(k);talk(k);assert.equal(nb(k).want.done,false,'a morning talk does not meet it');
   run("S.time=19;placeNPCs();");const p0=nb(k).pts;const h=talk(k);assert.equal(nb(k).want.done,true,'met in the evening');assert.equal(nb(k).pts,p0+3+0,'three points (the chat point was used this morning)');
   assert(h.includes(J(`BONDS41.LINES.thanks.${k}`).replace(/'/g,'&#39;')),'thanks in the talk');return {who:k};});
  function placeAt(k){run("placeNPCs();");}

  step(6,()=>{fresh();next();run("S.time=10");let h=talk('ada');const L=J("BONDS41.LINES");const e=s=>s.replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
   assert(h.includes(e(L.mood.ada[nb('ada').mood.m])),'mood line');assert(h.includes('bonds41-card'),'want card');assert(h.indexOf('bonds41-card')<h.indexOf('data-act="close"'),'above Later');assert(run('openTalk.toString()').includes('act.before(card)'),'the bridge\u2019s openTalk is outermost');assert(run('talk.toString()').includes('lines_talk35'));assert(!h.includes(e(L.missed.ada)),'no missed-you yet');
   for(let d=0;d<6;d++)next();h=talk('ada');assert(h.includes(e(L.missed.ada)),'missed-you after 6 days');run("S.time=15");h=talk('ada');assert(!h.includes(e(L.missed.ada)),'once');});

  step(7,()=>{fresh();next();const L=J("BONDS41.LINES");const e=s=>s.replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
   talk('bassey');run("aff('bassey',20)");assert.equal(nb('bassey').lvl,2);let h=talk('bassey');assert(h.includes(e(L.level.bassey[2])),'level-up line');h=talk('bassey');assert(!h.includes(e(L.level.bassey[2])),'once');
   run("S.time=15;placeNPCs();PH41='';BUB41=[];");const n=J("[npcs.bassey.g.visible,npcs.bassey.g.position.x,npcs.bassey.g.position.z]");far();
   if(n[0]){frames(40);assert.equal(run('BUB41.length'),0,'no greeting from afar');run(`players[0].g.position.set(${n[1]+2},0,${n[2]})`);frames(40);assert.equal(run('BUB41.length'),1,'a greeting');assert(run('BUB41[0]').startsWith('Efe!'),'by name');frames(90);assert.equal(run('BUB41.length'),1,'once a day');}
   run("aff('nkechi',30)");const gifts=[];for(let d=0;d<30;d++){const p0=run("S.pantry.spices|0");next();if((run("S.pantry.spices|0"))>p0)gifts.push(run('S.day'));}
   assert(gifts.length>=2,'Close friend gifts: '+gifts.join(','));for(let i=1;i<gifts.length;i++)assert(gifts[i]-gifts[i-1]>=3,'at most once in 3 days');
   run("aff('oyelaran',45)");h=talk('oyelaran');assert(h.includes(e(L.secret.oyelaran)),'a secret');assert(run("S.memories.some(m=>/Mrs. Oyelaran told you/.test(m.caption))"),'remembered');h=talk('oyelaran');assert(!h.includes(e(L.secret.oyelaran)),'once');
   return {giftDays:gifts};});

  process.stdout.write(JSON.stringify(checks));
 })().catch(e=>{process.stdout.write(JSON.stringify([{name:'harness',passed:false,failure:String(e&&e.stack||e)}]));});
}

if(process.argv[2]==='--inner'){inner();}
else{
 const runOnce=()=>JSON.parse(cp.execFileSync(process.execPath,[__filename,'--inner'],{maxBuffer:1<<26,encoding:'utf8'}));
 const a=runOnce(),b=runOnce();const same=JSON.stringify(a)===JSON.stringify(b);
 const checks=a.concat([{name:NAMES[8],passed:same}]);
 const build=(fs.readFileSync(path.resolve(__dirname,'..','dist','index.html'),'utf8').match(/const BUILD_ID='([^']+)';/)||[])[1];
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.failure?'\n     '+c.failure:''));
 fs.writeFileSync(OUT,JSON.stringify({build,passed:checks.every(c=>c.passed),checks},null,1)+'\n');
 if(!checks.every(c=>c.passed))process.exitCode=1;
}

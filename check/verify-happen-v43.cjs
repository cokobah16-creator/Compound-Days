// Happenings and festivals (v43, dist/src/happen-v43.js): a happening every morning, called out by its neighbour at its
// hour, Saturday market day, a festival at the end of each season with preparations over the season, and keepsakes for
// the Almanac. Checked on the real game logic in Node with the shipped Three.js; nothing is rendered. The checks run
// twice in child processes and the two reports must match. Math.random and Date.now are stubbed; no wall-clock value
// reaches the results.
// Prints one PASS or FAIL line per check and writes check/results-happen-v43.json.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process');
const OUT=path.join(__dirname,'results-happen-v43.json');
const NAMES=[
 '1. Off until a new morning: frames on day 1 write no S.happen43, nothing online; the first Sleep rolls a happening and opens the season\'s festival preparations',
 '2. Variety: over 36 days no pool happening comes back within 8 days, Saturdays are market day, each season\'s last day is its festival, one-season happenings only come in their season, and at least 15 different happenings turn up',
 '3. The world starts it, once Today has shown it: nothing before the happening\'s hour, the neighbour calls it out at the hour (a toast with their name), it waits while a panel is open, and the storm brings rain to the shore',
 '4. Doing it: the day\'s goal is met by the household\'s own counters (a dish for the wedding), a neighbour\'s talk (the goat), three different neighbours (the news) or a neighbour\'s own request (school out early); a keepsake, an album memory and friendship, never cash or the base mood',
 '5. The neighbour talks about the day\'s happening once a day for each player',
 '6. Festivals: preparations add up across the season (catches, dishes, all five neighbours), the festival opens by itself at half past six when nothing else is on screen, once; full preparations give a gold keepsake and every neighbour friendship, and fill v42\'s fun and social',
 '7. Today\'s card shows the happening, its hour, its goal and keepsake, and the festival countdown and preparations; the Almanac lists the keepsakes',
 '8. The pinned hooks hold: TICK_HOOKS 17, the bridge\'s openTalk outermost, talk still wrapped by the v35 lines, and v41\'s ladder and v42\'s talk wants still count the talk',
 '9. Determinism: two runs give identical reports'];

function inner(){
 const {load}=require('./runtime-harness.cjs');const checks=[];
 (async()=>{
  const {run}=await load();
  const J=c=>JSON.parse(run('JSON.stringify('+c+')'));
  run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;setTimeout=function(f){try{f();}catch(e){}return 0;};");
  run("var PH43='';{const op=openPanel;openPanel=function(h){PH43+=String(h);return op.apply(this,arguments);};}panel.insertAdjacentHTML=function(w,h){PH43+=h;};var TOASTS43=[];toast=function(t){TOASTS43.push(t);};");
  run("buildTextures();buildTextures2();buildWorld();");
  const fresh=()=>run(`NET.on=false;_silent=false;dispatch('aiStart');S.p[0].name='Efe';S.p[0].aspiration='stall';S.household='Check';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();PH43='';TOASTS43=[];`);
  const next=()=>run("dispatch('nextday');closePanel();PH43='';TOASTS43=[];EVENING35.tick(1.05);");
  // the harness's overlay is a stand-in whose classList does not record "on", so a busy screen is stubbed
  const busy=()=>run("var OO43=overlayOpen;overlayOpen=()=>true;"),free=()=>run("overlayOpen=OO43;closePanel();");
  const settle=()=>run("EVENING35.tick(1.05);");
  const force=id=>run(`S.happen43.day={d:S.day,id:'${id}',c:0,talkK:[],done:false,knocked:false,said:[false,false],shown:true};HAPPEN43.state.snap=null;`+"EVENING35.tick(1.05);");
  const at=h=>run(`S.time=${h};EVENING35.tick(1.05);`);
  const talkTo=(i,k)=>run(`{const n=npcs.${k};n.g.visible=true;players[${i}].g.position.set(n.g.position.x+1,0,n.g.position.z);}S.time+=0.01;openTalk(${i},'${k}');closePanel();`);
  const step=(i,fn)=>{const name=NAMES[i];try{const info=fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});}catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});}};

  step(0,()=>{fresh();for(let k=0;k<60;k++)run("for(const h of TICK_HOOKS)h(1/30,true);");at(12);assert.equal(run('S.happen43'),undefined,'nothing before Sleep');
   run('NET.on=true');assert.equal(run('happenOn43()'),false);run('NET.on=false');next();
   const d=J('S.happen43.day');assert.equal(d.d,2);assert(J(`!!happenDef43('${d.id}')`),'a real happening');assert(J("Object.keys(S.happen43.fest).length")===1,'the season’s preparations');return {day2:d.id};});

  step(1,()=>{fresh();const seq=[];for(let k=0;k<36;k++){next();seq.push([J('S.day'),J('S.happen43.day.id'),J('season(S.day)'),J('WEEK[(S.day-1)%7]')]);}
   const seen={};for(const [d,id,se,wd] of seq){
    if(J(`happenFestDay43(${d})`)){assert.equal(id,'fest:'+se,'festival on day '+d);continue;}
    if(wd==='Saturday'){assert.equal(id,'market','market on day '+d);continue;}
    const def=J(`HAPPEN43.POOL.find(x=>x.id==='${id}')`);assert(def,'from the pool: '+id);if(def.season)assert.equal(def.season,se,id+' in its season');
    if(seen[id])assert(d-seen[id]>=8,id+' came back after '+(d-seen[id])+' days');seen[id]=d;}
   const kinds=new Set(seq.map(s=>s[1]));assert(kinds.size>=15,'only '+kinds.size+' kinds');return {kinds:kinds.size,first12:seq.slice(0,12).map(s=>s[1])};});

  step(2,()=>{fresh();next();run("S.happen43.day={d:S.day,id:'storm',c:0,talkK:[],done:false,knocked:false,said:[false,false],shown:false};");at(15);assert.equal(J('S.happen43.day.knocked'),false,'nobody calls out a happening not yet seen on Today');
   run('S.time=9;');force('storm');at(10);assert.equal(J('S.happen43.day.knocked'),false,'not before two');
   busy();at(14.1);assert.equal(J('S.happen43.day.knocked'),false,'waits for the panel');free();at(14.2);
   assert.equal(J('S.happen43.day.knocked'),true);assert(run("TOASTS43.some(t=>/^Tunde: Storm in an hour/.test(t))"),'Tunde calls it out');
   const w=J('S.weather');assert.equal(w.day,J('S.day'));assert(w.rainAt>14.2&&w.rainTo>w.rainAt,'rain is coming');
   const n=run("TOASTS43.length");at(15);assert.equal(run("TOASTS43.length"),n,'once');return {rainAt:Math.round(w.rainAt*100)/100};});

  step(3,()=>{fresh();next();force('wedding');const a0=J('S.nb.oyelaran.aff'),m0=J('[S.p[0].mood,S.p[1].mood]'),c0=J('S.money');
   run("S.cooked.jollof=(S.cooked.jollof|0)+1;");settle();assert.equal(J('S.happen43.day.done'),true,'the dish');assert(J("S.happen43.book.wedding")>0,'keepsake');
   assert.equal(J('S.nb.oyelaran.aff'),a0+2,'friendship');assert(run("S.memories.some(m=>/^A wedding next door: A green and gold aso-ebi ribbon/.test(m.caption))"),'album');
   assert.deepEqual(J('[S.p[0].mood,S.p[1].mood]'),m0,'the base mood is untouched');assert.equal(J('S.money'),c0,'no cash');assert(run("TOASTS43.some(t=>/^New keepsake: /.test(t))"));
   next();force('goat');talkTo(0,'ada');assert.equal(J('S.happen43.day.done'),false);talkTo(1,'tunde');assert.equal(J('S.happen43.day.done'),true,'either player');
   next();force('gossip');talkTo(0,'tunde');talkTo(0,'tunde');talkTo(1,'ada');assert.equal(J('S.happen43.day.c'),2);talkTo(0,'bassey');assert.equal(J('S.happen43.day.done'),true,'three different');
   next();force('school');run("life34();day34().helped++;");settle();assert.equal(J('S.happen43.day.done'),true,'a neighbour\u2019s own request counts as help');
   return {keepsakes:J('Object.keys(S.happen43.book)')};});

  step(4,()=>{fresh();next();force('parrot');run("PH43='';");run("{const n=npcs.bassey;n.g.visible=true;players[0].g.position.set(n.g.position.x+1,0,n.g.position.z);}openTalk(0,'bassey');");
   assert(run('PH43').includes('somebody taught it my name'),'the line');run("closePanel();PH43='';");talkTo(0,'bassey');assert(!run('PH43').includes('somebody taught it my name'),'once for this player');
   run("{const n=npcs.bassey;n.g.visible=true;players[1].g.position.set(n.g.position.x+1,0,n.g.position.z);}openTalk(1,'bassey');");assert(run('PH43').includes('somebody taught it my name'),'the other player hears it too');run('closePanel();');});

  step(5,()=>{fresh();next();assert.equal(J('season(S.day)'),'rains');
   run("S.life=S.life||life34();");for(let k=0;k<3;k++){run("S.life.metrics.caught++;");settle();}
   run("S.cooked.jollof=(S.cooked.jollof|0)+1;");settle();next();run("S.cooked.jollof=(S.cooked.jollof|0)+1;");settle();
   for(const k of ['tunde','nkechi','ada'])talkTo(0,k);next();for(const k of ['bassey','oyelaran'])talkTo(1,k);
   const key=J('happenFestKey43(S.day)');{const c=J(`S.happen43.fest['${key}'].c`);assert.deepEqual(c,[3,2,5],'all three ready: '+JSON.stringify(c));}
   while(J('S.day')<6)next();assert.equal(J('S.happen43.day.id'),'fest:rains');
   // not yet seen on Today: the festival stays shut (the harness panel cannot render Today, so the sighting is set by hand)
   at(18.7);assert.equal(J(`S.happen43.fest['${key}'].held`),false,'not before Today has shown it');run("S.time=17;S.happen43.day.shown=true;");
   const aff0=J("Object.fromEntries(Object.keys(CAST).map(k=>[k,S.nb[k].aff]))");   at(18);assert.equal(J(`S.happen43.fest['${key}'].held`),false,'not before half past six');busy();at(18.6);assert.equal(J(`S.happen43.fest['${key}'].held`),false,'waits');free();run("PH43='';S.needs42.p.forEach(P=>{P.fun=20;P.social=20;});S.needs42.t={day:S.day,time:18.7};");at(18.7);
   assert.equal(J(`S.happen43.fest['${key}'].held`),true);assert(run('PH43').includes('Rain’s End')&&run('PH43').includes('Everything was ready.'),'the festival panel');
   const aff1=J("Object.fromEntries(Object.keys(CAST).map(k=>[k,S.nb[k].aff]))");for(const k in aff0)assert(aff1[k]>=aff0[k]+2,k+' friendship');
   assert(J("S.happen43.book['gold:rains']")>0,'gold');assert(J("S.happen43.book['fest:rains']")>0,'keepsake');{const v=J('S.needs42.p.map(P=>[Math.round(P.fun),Math.round(P.social)])');assert.deepEqual(v,[[50,55],[50,55]],'needs: '+JSON.stringify(v));}
   run("closePanel();PH43='';");at(19.5);assert(!run('PH43').includes('Rain’s End'),'once');
   // a festival with nothing ready still happens
   while(J('S.day')<9)next();run("S.happen43.day.shown=true;S.happen43.fest[happenFestKey43(S.day)].c=[0,0,0];closePanel();PH43='';");at(19);assert(run('PH43').includes('Lantern Night')&&run('PH43').includes('Nothing was ready'));
   assert.equal(run("S.happen43.book['gold:dry']"),undefined);return {rains:[3,2,5]};});

  step(6,()=>{fresh();for(let k=0;k<3;k++)next();force('wedding');const h=run('happenTodayHTML43()');for(const s of ['TODAY IN PALM COURT','A wedding next door','Cook a dish to send over','Rain’s End in','Getting ready','keepsakes in the Almanac','12:00 pm'])assert(h.includes(s),s);
   const a=run('happenAlmanacHTML43()');assert(a.includes('KEEPSAKES · 0/'+J('happenKeepTotal43()')));assert(a.includes('rainy season'));
   run("S.cooked.jollof=(S.cooked.jollof|0)+1;");settle();assert(run('happenAlmanacHTML43()').includes('A green and gold aso-ebi ribbon'));
   // (the harness panel has no querySelector, so the placement on the Today page and in the Almanac is checked in the browser)
   return {total:J('happenKeepTotal43()')};});

  step(7,()=>{fresh();next();force('match');assert.equal(run('TICK_HOOKS.length'),17);assert(run('openTalk.toString()').includes('act.before(card)'));assert(run('talk.toString()').includes('lines_talk35'));
   const p0=J('S.bonds41?S.bonds41.nb.ada.pts:0');talkTo(0,'ada');assert.equal(J('S.bonds41.nb.ada.pts'),p0+1,'v41 still counts the chat');
   assert(J("S.needs42.day.talkK[0].includes('ada')"),'v42 still counts the talk');});

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

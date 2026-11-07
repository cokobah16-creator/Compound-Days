// Save slots and the two-phone room (v47, dist/src/slots-v47.js and dist/src/together-v47.js). Checked on the real game
// logic in Node with the shipped Three.js; nothing is rendered and nothing connects (the harness has no WebRTC, so the
// room module stays off; the phone-to-phone room is checked in a browser, see the README). The checks run twice in child
// processes and the two reports must match. Math.random and Date.now are stubbed; no wall-clock value reaches the results.
// Prints one PASS or FAIL line per check and writes check/results-slots-v47.json.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process');
const OUT=path.join(__dirname,'results-slots-v47.json');
const NAMES=[
 '1. Slot 1 is the old key: with no slot chosen, a household moving in is saved under compound-days-3d-v1 and nowhere else, so a save from before v47 is slot 1',
 '2. Slot 2: saves and loads go to compound-days-3d-v1-slot2 and slot 1 is left exactly as it was; switching back loads slot 1',
 '3. The slot list: filled slots give the household, day and mode, a household still in setup counts as empty, and the first empty slot is picked for a new household',
 '4. Replacing or deleting asks first: New in a filled slot and Delete open a question and change nothing; Delete with the answer empties only that slot',
 '5. The Menu: Start a new household opens the slot list (the current household is marked, not replaced); the slot actions are never sent online',
 '6. The room stays off without WebRTC (NET.capable false, no room); the room panels\' Back button has an action',
 '7. Determinism: two runs give identical reports'];

function inner(){
 const {load,context}=require('./runtime-harness.cjs');const checks=[];
 (async()=>{
  const {run}=await load();
  const J=c=>JSON.parse(run('JSON.stringify('+c+')'));
  run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;setTimeout=function(f){try{f();}catch(e){}return 0;};");
  run("var PH47='';{const op=openPanel;openPanel=function(h){PH47=String(h);return op.apply(this,arguments);};}");
  run("buildTextures();buildTextures2();buildWorld();");
  const raw=k=>run(`SLOTS47.raw.get(${JSON.stringify(k)})`);
  const keys=()=>J("['compound-days-3d-v1','compound-days-3d-v1-slot2','compound-days-3d-v1-slot3'].map(k=>SLOTS47.raw.get(k)?1:0)");
  const fresh=(name,ai)=>run(`NET.on=false;_silent=false;dispatch('${ai?'aiStart':'newgame'}');S.p[0].name='${name}';S.p[1].name=S.p[1].name||'Kola';S.household='${name} House';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});if(S.phase!=='play'){dispatch('movein');}closePanel();save();`);
  const step=(i,fn)=>{const name=NAMES[i];try{const info=fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});}catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e)});}};

  step(0,()=>{assert.equal(run('SLOTS47.active'),1);fresh('Efe',true);assert.equal(run('S.phase'),'play');
   assert.deepEqual(keys(),[1,0,0]);assert.equal(JSON.parse(raw('compound-days-3d-v1')).household,'Efe House');assert.equal(run("load().household"),'Efe House');
   return {keys:keys()};});
  step(1,()=>{const before=raw('compound-days-3d-v1');run("slots47SetActive(2);");fresh('Ngozi',false);
   assert.equal(raw('compound-days-3d-v1'),before,'slot 1 untouched');assert.equal(JSON.parse(raw('compound-days-3d-v1-slot2')).household,'Ngozi House');
   assert.equal(run("load().household"),'Ngozi House');assert.equal(raw('cd3-slot'),'2');
   run("S.day=4;save();");assert.equal(JSON.parse(raw('compound-days-3d-v1-slot2')).day,4);assert.equal(raw('compound-days-3d-v1'),before);
   run("slots47SetActive(1);");assert.equal(run("load().household"),'Efe House');return {keys:keys()};});
  step(2,()=>{const all=J('slots47All()');assert.deepEqual(all.map(x=>x.filled),[true,true,false]);
   assert.equal(all[0].ai,true);assert.equal(all[1].ai,false);assert.equal(all[1].day,4);assert.equal(run('slots47FirstEmpty()'),3);
   run("SLOTS47.raw.set('compound-days-3d-v1-slot3',JSON.stringify({p:[{name:'x'},{name:'y'}],phase:'setup'}));");
   assert.equal(J('slots47Info(3)').filled,false,'setup is empty');
   const html=run("slots47HTML('title')");assert.match(html,/Efe House, day 1 · with a companion/);assert.match(html,/Ngozi House, day 4 · two on one phone/);
   assert.equal((html.match(/data-act="slot47go"/g)||[]).length,2);assert.equal((html.match(/data-act="slot47new"/g)||[]).length,2);
   return {labels:all.map(x=>x.filled?x.household+' '+x.day:'empty')};});
  step(3,()=>{const s1=raw('compound-days-3d-v1'),s2=raw('compound-days-3d-v1-slot2');
   run("S=null;players.length=0;dispatch('slot47new',{k:2,mode:'ai'});");assert.match(run('PH47'),/Replace Ngozi House\?/);assert.equal(raw('compound-days-3d-v1-slot2'),s2);assert.equal(run('SLOTS47.active'),1);
   run("dispatch('slot47del',{k:2});");assert.match(run('PH47'),/Delete Ngozi House\?/);assert.equal(raw('compound-days-3d-v1-slot2'),s2);
   run("dispatch('slot47del',{k:2,sure:1});");assert.equal(raw('compound-days-3d-v1-slot2'),null);assert.equal(raw('compound-days-3d-v1'),s1);
   run("dispatch('slot47pick',{mode:'pair'});");assert.equal(run('SLOTS47.active'),2,'first empty slot');assert.equal(run('S.mode'),'partners');
   run("slots47SetActive(1);");return {keys:keys()};});
  step(4,()=>{run("dispatch('slot47go',{k:1});");assert.equal(run("S&&S.household"),'Efe House');
   run("dispatch('newconfirm');");const h=run('PH47');assert.match(h,/<h2>Households<\/h2>/);assert.match(h,/Playing now/);assert.match(h,/saved in slot 1/);
   assert.equal(raw('compound-days-3d-v1')!==null,true);
   for(const n of ['slot47go','slot47new','slot47ask','slot47pick','slot47del','slot47back'])assert.equal(run(`LOCAL_ONLY.has('${n}')`),true,n);});
  step(5,()=>{assert.equal(run('NET.capable'),false);assert.equal(run('together47Supported()'),false);assert.equal(run('TOGETHER47.room'),null);
   assert.equal(run("typeof ACTIONS.title"),'function');assert.equal(run("typeof Peer"),'undefined');});
  process.stdout.write(JSON.stringify(checks));
 })().catch(e=>{process.stdout.write(JSON.stringify([{name:'harness',passed:false,failure:String(e&&e.stack||e)}]));});
}

if(process.argv[2]==='--inner'){inner();}
else{
 const runOnce=()=>JSON.parse(cp.execFileSync(process.execPath,[__filename,'--inner'],{maxBuffer:1<<26,encoding:'utf8'}));
 const a=runOnce(),b=runOnce();const same=JSON.stringify(a)===JSON.stringify(b);
 const checks=a.concat([{name:NAMES[6],passed:same}]);
 const build=(fs.readFileSync(path.resolve(__dirname,'..','dist','index.html'),'utf8').match(/const BUILD_ID='([^']+)';/)||[])[1];
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.failure?'\n     '+c.failure:''));
 fs.writeFileSync(OUT,JSON.stringify({build,passed:checks.every(c=>c.passed),checks},null,1)+'\n');
 if(!checks.every(c=>c.passed))process.exitCode=1;
}

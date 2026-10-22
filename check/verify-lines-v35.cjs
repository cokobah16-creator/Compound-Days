// v35 dialogue (dist/data/lines-v35.js), checked on the real game logic in Node: the line tables and the copy other v35 modules
// read, the copy rules, day coverage, no repeats inside a day, the once-a-day base hint lines, the talk wiring (request card,
// gifts, rng untouched, silent replays), lines that read the game state, the housewarming lines and the veranda-evening lines.
// Prints one PASS or FAIL line per check and writes check/results-lines-v35.json (no wall-clock values; byte-identical across runs).
// Part of check 7 runs in a subset pass: a temporary dist that loads the v35 modules only up to lines-v35.js, so the later modules
// (days, evening, audio) are truly undeclared there.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const SUBSET=process.argv[2]==='--subset';
const {load,root}=require('./runtime-harness.cjs');
const WEEKDAY35=/\b(mon|tues|wednes|thurs|fri|satur|sun)days?\b/i;
const AMERICAN=/\b(neighbor|neighbors|neighborhood|color|colors|colored|favorite|favorites|center|centers|gray|apartment|apartments|mom|moms)\b/i;
const OUT=path.join(__dirname,'results-lines-v35.json');
const WHO=['tunde','nkechi','ada'];
const ROWS=['evening-again','seedling','grew','waiting','unplanted','ripe','finds-return','ada-invite','ada-visit','evening-fish','shells','quiet'];
const SPEAKERS=['seedling','grew','waiting','unplanted','ripe','ada-invite','ada-visit','shells'];
const VERBATIM={'recap.seedling':'Tunde said he would leave something in your pot.','recap.grew':'The seedling will be taller by morning.',
 'recap.finds-return':'The {a} and the {b} are back at Finds tomorrow.','recap.clause.chair':'Ada wants to hear where the chair went.',
 'recap.clause.pot-again':'Tunde says the pot will fruit again.','morning.grew.title':'It grew overnight.'};
const checks=[];let runFn=null;

// a dist that loads only the v35 modules up to and including `last` (spec 11.2)
function subsetDir35(last){const base=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd35-'));
 for(const f of ['assets','src','data'])if(fs.existsSync(path.join(base,f)))fs.symlinkSync(path.join(base,f),path.join(d,f));
 let html=fs.readFileSync(path.join(base,'index.html'),'utf8'),cut=false;
 for(const [tag,src] of [...html.matchAll(/<script src="([^"]+-v35\.js)"><\/script>\n?/g)]){if(cut)html=html.replace(tag,'');if(src.endsWith('/'+last))cut=true;}
 if(!cut){fs.rmSync(d,{recursive:true,force:true});throw new Error('subset: '+last+' not found');}fs.writeFileSync(path.join(d,'index.html'),html);return d;}

(async()=>{
 const {run}=await load();runFn=run;
 const J=code=>JSON.parse(run('JSON.stringify('+code+')'));
 // determinism helpers (spec 11.2)
 run("Math.random=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();Date.now=()=>1790000000000;");
 run("var T35=1790000000000;if(typeof CLOCK35!=='undefined')CLOCK35.fn=()=>T35;");
 run("var PH='',TOASTS=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}");
 const need=()=>assert.equal(run('typeof LINES35'),'object','lines-v35.js is loaded');
 const at=(x,z,i=0)=>run(`players[${i}].y=0;players[${i}].g.position.set(${x},0,${z});players[${i}].prev=[${x},${z}];`);
 const HOME=[-5.2,4.0],AWAY=[10,10];
 // a new companion household through the real entry points (the title screen's companion button)
 const newHH=()=>{run("AI.on=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();dispatch('movein');closePanel();TOASTS=[];PH='';");at(...AWAY,1);};
 // an old (pre-v35) two-player household loaded from a save
 const oldHH=()=>{run("AI.on=false;S=newState();S.phase='play';save();ACTIONS.continue();closePanel();TOASTS=[];PH='';");at(...AWAY,1);};
 // the escaped table text of a line id, as the talk panel shows it
 const shown=(who,id)=>run(`esc(lines_fill35((LINES35['${who}'].find(x=>x.id==='${id}')||{}).text||'',lineCtx35('${who}')))`);
 const used=who=>J(`(S.life.lines35&&S.life.lines35.day===S.day&&S.life.lines35.used['${who}'])||[]`);
 const html=()=>run('String(panel.innerHTML)');
 const fall=who=>run(`esc(text35('fallback.${who}'))`);
 const check=(n,label,fn)=>{const name=n+'. '+label;try{need();const info=fn();checks.push(info===undefined?{name,passed:true}:{name,passed:true,info});console.log('PASS',name);}
  catch(e){checks.push({name,passed:false,failure:String(e&&e.message||e).split('\n')[0]});console.log('FAIL',name);if(process.env.VERBOSE)console.error(e);}finally{try{run('_silent=false;');}catch(_){}}};

 let setupError=null;try{run("buildTextures();buildTextures2();buildWorld();");}catch(e){setupError=e;}

 if(SUBSET){
  /* ---------------- subset pass: modules up to lines-v35.js only ---------------- */
  const out=[];const sub=(key,fn)=>{try{if(setupError)throw setupError;need();const info=fn();out.push({key,passed:true,info});}catch(e){out.push({key,passed:false,failure:String(e&&e.message||e).split('\n')[0]});}finally{try{run('_silent=false;');}catch(_){}}};
  sub('7',()=>{
   assert.equal(run("typeof LOG35==='undefined'&&typeof DAYS35==='undefined'&&typeof EVENING35==='undefined'&&typeof AUDIO35==='undefined'"),true,'later v35 modules are undeclared');
   newHH();at(...HOME);
   assert.equal(run("lineCtx35('ada').eveningDone"),false,'eveningDone is false with EVENING absent');
   const said={};
   for(const w of WHO){run(`S.nb['${w}'].aff=1;openTalk(0,'${w}');`);const h=html();const u=used(w);assert(u.length===1&&h.includes(shown(w,u[0]))&&h.includes('card say'),w+' says a table line');said[w]=u[0];}
   for(const w of WHO){const l=J(`line35('${w}',Object.assign(lineCtx35('${w}'),{evening:true}))`);assert(l&&l.text,w+' has an evening line');}
   return {said};});
  process.stdout.write(JSON.stringify(out)+'\n');return;
 }
 if(setupError)throw setupError;

 /* ---------------- main pass: every module in dist/index.html ---------------- */
 let subset={};let subsetError=null;
 try{const d=subsetDir35('lines-v35.js');try{const o=cp.execFileSync(process.execPath,[__filename,'--subset'],{env:{...process.env,COMPOUND_GAME_DIR:d},encoding:'utf8'});
   for(const c of JSON.parse(o.trim().split('\n').pop()))subset[c.key]=c;}finally{fs.rmSync(d,{recursive:true,force:true});}}
 catch(e){subsetError=String(e&&e.message||e).split('\n')[0];}
 const subOK=k=>{const c=subset[k];assert(c&&c.passed,'subset pass: '+(c?c.failure:subsetError||'missing'));return c.info;};

 // 1. The module
 check(1,'The dialogue module is loaded with its public functions',()=>{
  const fns=['line35','useLine35','lineCtx35','text35','itemShort35','partyLines35'];
  for(const f of fns)assert.equal(run('typeof '+f),'function',f);
  assert.equal(run("typeof WHEN35==='object'&&Object.isFrozen(WHEN35)"),true,'WHEN35 is a frozen table');
  assert(run('talk.toString()').includes('lines_talk35'),'talk is wrapped by LINES');assert(run('finishParty.toString()').includes('partyLines35'),'finishParty is wrapped by LINES');
  return {functions:fns,when:J('Object.keys(WHEN35).length')};});

 // 2. Tables
 check(2,'Tables: at least 24 talk lines each, unique ids, valid min/max and when keys, evening tables end on default, every text key present and the plan strings verbatim',()=>{
  const L=J('LINES35'),keys=new Set(J('Object.keys(WHEN35)'));const ids=new Set();const counts={},ev={};
  for(const w of WHO){const t=L[w];assert(Array.isArray(t),w);counts[w]=t.length;assert(t.length>=24,w+' has '+t.length+' lines');
   const pre={tunde:'tu',nkechi:'nk',ada:'ad'}[w];
   for(const l of t){assert(typeof l.id==='string'&&l.id.startsWith(pre)&&!ids.has(l.id),'id '+l.id);ids.add(l.id);
    assert(Number.isInteger(l.min)&&l.min>=1,'min '+l.id);assert(l.max===undefined||(Number.isInteger(l.max)&&l.max>=l.min),'max '+l.id);
    assert(Array.isArray(l.when)&&l.when.length>0,'when '+l.id);for(const k of l.when)assert(keys.has(k),'unknown when key '+k+' in '+l.id);
    assert(typeof l.text==='string'&&l.text.length>0,'text '+l.id);}
   const e=L.evening[w];assert(Array.isArray(e)&&e.length>=4,'evening '+w);ev[w]=e.length;
   for(const l of e){assert(typeof l.id==='string'&&!ids.has(l.id),'evening id '+l.id);ids.add(l.id);for(const k of l.when)assert(keys.has(k),'unknown when key '+k+' in '+l.id);}
   assert.deepEqual(e[e.length-1].when,['default'],'the last evening line of '+w+' is the default');}
  const need=[...ROWS.map(r=>'recap.'+r),'recap.clause.chair','recap.clause.pot-again','recap.clause.evening-missed',
   ...ROWS.flatMap(r=>['morning.'+r+'.title','morning.'+r+'.body']),...SPEAKERS.map(r=>'morning.'+r+'.say'),
   'party.tunde.seedling','party.ada.armchair','fallback.tunde','fallback.nkechi','fallback.ada'];
  for(const k of need)assert(typeof L.text[k]==='string'&&L.text[k].trim().length>0,'text key '+k);
  for(const [k,v] of Object.entries(VERBATIM))assert.equal(L.text[k],v,k);
  assert.equal(run("text35('recap.finds-return',{a:'lamp',b:'rug'})"),'The lamp and the rug are back at Finds tomorrow.');assert.equal(run("text35('no.such.key')"),'');
  assert.equal(run("text35('recap.finds-return',{a:'lamp'})"),'The lamp and the  are back at Finds tomorrow.','an unknown {k} is left empty');
  for(const k of ['recap.evening-again','morning.evening-again.title','morning.evening-again.body'])assert(!/\bagain\b|\bmissed\b|last night/i.test(L.text[k]),k+' reads as a first invitation');
  assert(/Tunde’s note/.test(L.text['morning.seedling.body']),'the seedling morning names Tunde’s note');
  assert.equal(run("itemShort35('chairs')"),'chairs');assert.equal(run("itemShort35('sofa')"),'indigo sofa','falls back to the item name');assert.equal(run("itemShort35('nope')"),'');
  assert.deepEqual(Object.keys(L.short).sort(),J('FINDS34.slice().sort()'),'a short name for each of the fifteen Finds furnishings');
  // every DAYS morning row has its copy (when DAYS is loaded)
  let days=null;if(run("typeof DAYS35!=='undefined'&&Array.isArray(DAYS35.rows)")){days=J('DAYS35.rows.map(r=>[r.id,!!r.who])');
   for(const [id,who] of days){assert(L.text['recap.'+id]&&L.text['morning.'+id+'.title'],'copy for DAYS row '+id);if(who)assert(L.text['morning.'+id+'.say'],'say for DAYS row '+id);}}
  return {talk:counts,evening:ev,textKeys:Object.keys(L.text).length,daysRowsCovered:days?days.length:'DAYS not loaded'};});

 // 3. Copy rules
 check(3,'Copy rules: no weekday, no ₦ or digits in spoken lines, British spelling, no HTML or undefined, at most 160 characters, {item} only with decorated',()=>{
  const L=J('LINES35'),bad=[];const all=[];
  for(const w of WHO){for(const l of L[w])all.push(['talk '+l.id,l.text,true,l.when]);for(const l of L.evening[w])all.push(['evening '+l.id,l.text,true,l.when]);}
  for(const [k,v] of Object.entries(L.text))all.push(['text '+k,v,/^(party|fallback)\./.test(k),null]);
  for(const [k,v] of Object.entries(L.short))all.push(['short '+k,v,false,null]);
  for(const [where,s,spoken,when] of all){
   if(WEEKDAY35.test(s))bad.push(where+': weekday');if(AMERICAN.test(s))bad.push(where+': American spelling');
   if(/undefined|NaN/.test(s))bad.push(where+': undefined');if(/[<>&]/.test(s))bad.push(where+': HTML');if(s.length>160)bad.push(where+': '+s.length+' chars');
   if(spoken&&/[₦0-9]/.test(s))bad.push(where+': ₦ or digit');if(s.includes("'"))bad.push(where+': straight apostrophe');
   const vars=(s.match(/\{\w+\}/g)||[]);for(const v of vars){const ok=where.startsWith('text ')?['{a}','{b}'].includes(v):v==='{item}'||v==='{player}';if(!ok)bad.push(where+': '+v);}
   if(s.includes('{item}')&&!(when&&when.includes('decorated')))bad.push(where+': {item} without decorated');}
  // every {item} line reads well for each of the fifteen short names
  let filled=0;for(const [where,s] of all)if(s.includes('{item}'))for(const n of Object.values(L.short)){const f=s.split('{item}').join(n);filled++;if(f.length>160)bad.push(where+' with '+n+': '+f.length+' chars');}
  assert.deepEqual(bad,[]);return {strings:all.length,itemFills:filled};});

 // 4. Coverage
 check(4,'Coverage: on every day 1-12 each neighbour has at least four lines that need no state, so three talks a day never repeat',()=>{
  const L=J('LINES35'),min={};
  for(const w of WHO){min[w]=99;for(let d=1;d<=12;d++){const n=L[w].filter(l=>l.when.every(k=>k==='default')&&l.min<=d&&d<=(l.max==null?99:l.max)).length;assert(n>=4,w+' day '+d+': '+n);min[w]=Math.min(min[w],n);}}
  const itemFrom2=WHO.map(w=>L[w].filter(l=>l.text.includes('{item}')&&l.min<=2).map(l=>l.id));assert(itemFrom2.every(a=>a.length>=1),'an {item} line for each neighbour from day 2');
  return {fewestNeutralPerDay:min,itemLines:itemFrom2};});

 // 5. No repeats
 check(5,'No repeats: thirty talks on one day give distinct table lines and then the fallback; Nkechi’s base café line never returns; a new day resets',()=>{
  oldHH();at(...HOME);run("S.day=2;S.time=6;S.flags.tundePlant=true;S.nb.tunde.aff=5;");
  const ids=[];let fellBack=0;
  for(let k=0;k<30;k++){run("openTalk(0,'tunde');");const u=used('tunde'),h=html();
   if(u.length>ids.length){const id=u[u.length-1];assert(!ids.includes(id),'repeat '+id);assert(h.includes(shown('tunde',id)),'panel shows '+id);assert(!h.includes(fall('tunde')),'no fallback while lines remain');ids.push(id);assert.equal(fellBack,0,'no table line after the fallback');}
   else{assert(h.includes(fall('tunde')),'the fallback once the table is used up');fellBack++;}}
  assert(ids.length>=4&&fellBack>0,'exhausted: '+ids.length+' lines, '+fellBack+' fallbacks');
  run("S.time=6;S.nb.nkechi.aff=1;if(!S.recipes.includes('puffpuff'))S.recipes.push('puffpuff');");let nk=0,last='';
  for(let k=0;k<30;k++){run("openTalk(0,'nkechi');");last=html();assert(!last.includes('café I want'),'the base café line never returns');assert(!WEEKDAY35.test(last),'no weekday');nk=used('nkechi').length;}
  assert(last.includes(fall('nkechi')),'ends on the Nkechi fallback');
  run("S.time=20;dispatch('nextday');S.time=8;");assert.equal(run('S.day'),3);run("openTalk(0,'tunde');");const u3=used('tunde');assert.equal(u3.length,1,'a new day starts a fresh list');assert(!html().includes(fall('tunde')));
  return {tundeDistinct:ids,tundeFallbacks:fellBack,nkechiDistinct:nk,day3:u3[0]};});

 // 5a. Hint lines
 check('5a','Base hint lines: Tunde’s planter line and Nkechi’s recipe line follow the table line once a day; a base gift is always kept; silent replays agree',()=>{
  oldHH();at(...HOME);run("S.day=2;S.time=8;S.nb.tunde.aff=1;delete S.flags.seedlings;delete S.flags.tundePlant;");
  const EAST='Your balcony faces east';
  run("openTalk(0,'tunde');");let h=html();const first=used('tunde')[0];assert(h.includes(EAST),'hint on the first talk');assert(h.indexOf(shown('tunde',first))<h.indexOf(EAST),'after the table line');
  run("openTalk(0,'tunde');");assert(!html().includes(EAST),'not on the second talk');
  run("S.time=20;dispatch('nextday');S.time=8;");run("openTalk(0,'tunde');");h=html();assert(h.includes(EAST),'again on the next day');
  run("openTalk(0,'tunde');");assert(!html().includes(EAST),'once that day');
  run("S.home.items.push({id:'i'+(++S.home.seq),type:'planter',x:0,y:4,rot:0});S.nb.tunde.aff=1;delete S.flags.tundePlant;");run("openTalk(0,'tunde');");h=html();
  assert.equal(run('!!S.flags.seedlings'),true,'the talk planted the seedlings');assert(h.includes('Seedlings planted'),'the base narrative is kept when the base talk changed something');
  run("S.nb.nkechi.aff=1;S.recipes=S.recipes.filter(r=>r!=='puffpuff');");run("openTalk(0,'nkechi');");assert(html().includes('Buy from me twice'),'Nkechi’s hint once');run("openTalk(0,'nkechi');");assert(!html().includes('Buy from me twice'),'not twice a day');
  // the same talk, locally and as a silent remote replay, from the same state
  run("S.time=20;dispatch('nextday');S.time=8;S.nb.tunde.aff=1;S.home.items=S.home.items.filter(x=>x.type!=='planter');delete S.flags.seedlings;globalThis.SNAP=JSON.stringify(S);openTalk(0,'tunde');globalThis.LA=JSON.stringify(S.life.lines35);");
  run("S=JSON.parse(SNAP);closePanel();applyRemote({data:{name:'hs',data:{i:0,id:'talk:tunde'},seed:3,src:1}});globalThis.LB=JSON.stringify(S.life.lines35);");
  assert.equal(run('LA'),run('LB'),'lines35 equal after a local and a silent remote talk');assert.equal(run('S.life.lines35.hint.tunde'),run('S.day'),'hint day recorded on the replay');
  return {lines35:J('S.life.lines35')};});

 // 6. Wiring
 check(6,'Wiring: the talk panel shows a table line with the request card above Later, gifts and their narrative stay, the rng is untouched, and a silent replay picks the same line',()=>{
  oldHH();at(...HOME);run("S.day=2;S.time=8;S.nb.tunde.aff=1;");
  run("globalThis.INS=[];{const ia=panel.insertAdjacentHTML;panel.insertAdjacentHTML=function(p,h){INS.push(String(h));};try{openTalk(0,'tunde');}finally{panel.insertAdjacentHTML=ia;}}");
  const h=html(),id=used('tunde')[0];assert(h.includes('<div class="card say"')&&h.includes(shown('tunde',id)),'a table line in a say card');
  assert.equal(run("INS.filter(h=>h.includes('life-talk34')).length"),1,'the request card is still inserted');assert(run('openTalk.toString()').includes('act.before(card)'),'the bridge’s openTalk is outermost');
  run("closePanel();S.nb.tunde.aff=3;delete S.flags.tundePlant;globalThis.ST0=S.home.storage.filter(x=>x==='plant').length;openTalk(0,'tunde');");
  assert.equal(run("S.home.storage.filter(x=>x==='plant').length-ST0"),1,'Tunde’s potted plant reaches storage');assert(html().includes('A potted plant added'),'and its narrative stays');
  const s0=run('_seed');run("talk(0,'ada',false);talk(0,'nkechi',false);talk(0,'tunde',false);");assert.equal(run('_seed'),s0,'_seed untouched by talk');
  const src=fs.readFileSync(path.join(process.env.COMPOUND_GAME_DIR||root,'data','lines-v35.js'),'utf8');assert(!/\bR\(\)|\brnd\(|\bchance\(|Math\.random/.test(src),'no rng in the module source');
  run("S.time=20;dispatch('nextday');S.time=8;S.nb.ada.aff=1;globalThis.SNAP=JSON.stringify(S);openTalk(0,'ada');globalThis.LA=JSON.stringify(S.life.lines35);");
  run("S=JSON.parse(SNAP);closePanel();applyRemote({data:{name:'hs',data:{i:1,id:'talk:ada'},seed:5,src:1}});globalThis.LB=JSON.stringify(S.life.lines35);");
  assert.equal(run('LA'),run('LB'),'the silent replay records the same line');
  return {line:id,replayed:J('S.life.lines35.used.ada')};});

 // 7. Context
 check(7,'Context: watering, the placed armchair and Nkechi’s peppers pick the matching lines; with the later modules absent every talk still works',()=>{
  oldHH();at(...HOME);run("S.day=2;S.time=8;dispatch('lifePlant');dispatch('lifeWater');");assert.equal(run('S.life.crop.wateredDay'),2,'watered today');
  run("S.nb.tunde.aff=1;openTalk(0,'tunde');");const tu=used('tunde')[0];assert(J(`LINES35.tunde.find(x=>x.id==='${tu}').when`).includes('watered'),'Tunde credits the watering: '+tu);
  run("S.nb.ada.aff=1;S.home.items.push({id:'i'+(++S.home.seq),type:'armchair',x:1,y:4,rot:0});decorate34('armchair');openTalk(0,'ada');");
  const a1=used('ada')[0];assert(J(`LINES35.ada.find(x=>x.id==='${a1}').when`).includes('chair-veranda'),'Ada reads the armchair on the veranda: '+a1);
  run("S.home.items.find(x=>x.type==='armchair').y=1;delete S.life.lines35;openTalk(0,'ada');");
  const a2=used('ada')[0];assert(J(`LINES35.ada.find(x=>x.id==='${a2}').when`).includes('chair-placed'),'Ada reads the armchair indoors: '+a2);
  run("S.day=3;S.nb.nkechi.aff=1;request34('nkechi').stage=1;request34('nkechi').lastDay=0;S.life.crop.stage=2;S.life.crop.wateredDay=2;delete S.pantry.pepper;openTalk(0,'nkechi');");
  const nk=used('nkechi')[0],nt=run(`LINES35.nkechi.find(x=>x.id==='${nk}').text`);assert(/pepper/i.test(nt),'Nkechi asks after peppers: '+nt);
  const s=subOK('7');return {tunde:tu,adaVeranda:a1,adaIndoors:a2,nkechi:nk,subset:s};});

 // 8. Party
 check(8,'Party: a new household’s housewarming carries Tunde’s seedling promise and Ada’s armchair until they no longer apply; old households see nothing new',()=>{
  const party=g=>run(`S.party={on:true,done:false,guests:${JSON.stringify(g)},round:5,opts:[],pick:[null,null],dishIx:[],indoor:false,music:'none',f:{served:{},danced:0,intro:false,photo:true,kitchen:0}};S.pt=null;`);
  const T=run("esc(text35('party.tunde.seedling'))"),A=run("esc(text35('party.ada.armchair'))");
  newHH();assert.equal(run('S.born35===true&&S.day===1'),true,'a born35 household on day 1');party(['tunde','ada']);
  run("globalThis.INS=[];{const ia=panel.insertAdjacentHTML;panel.insertAdjacentHTML=function(p,h){INS.push(String(h));};try{finishParty();}finally{panel.insertAdjacentHTML=ia;}}");
  const ins=J('INS').join('');assert(ins.includes(T)&&ins.includes(A),'the party panel gets both lines');assert(ins.indexOf(T)<ins.indexOf(A));assert(ins.includes('card say'));
  party(['tunde','ada']);assert(run('partyLines35()').includes(T)&&run('partyLines35()').includes(A));
  run("S.home.storage.push('armchair');");const own=run('partyLines35()');assert(own.includes(T)&&!own.includes(A),'Ada’s line goes once the armchair is owned');run("S.home.storage=S.home.storage.filter(x=>x!=='armchair');");
  run("S.day=2;");assert(!run('partyLines35()').includes(A),'Ada’s line goes on day 2');
  run("TUNE35.grantSeedling();");assert.equal(run('partyLines35()'),'','nothing after the grant');
  oldHH();party(['tunde','ada']);assert.equal(run('partyLines35()'),'','an old household gets nothing');
  run("globalThis.INS=[];{const ia=panel.insertAdjacentHTML;panel.insertAdjacentHTML=function(p,h){INS.push(String(h));};try{finishParty();}finally{panel.insertAdjacentHTML=ia;}}");
  assert.equal(run("INS.filter(h=>h.includes('card say')).length"),0,'nothing inserted into an old household’s party');
  return {inserted:ins.length>0};});

 // 9. Evening
 check(9,'Evening lines: Ada follows the armchair, then the last thing placed, then her default; Tunde and Nkechi read the crop and the requests; nothing is marked used',()=>{
  oldHH();run("S.day=3;");const ev=w=>J(`line35('${w}',Object.assign(lineCtx35('${w}'),{evening:true}))`);
  run("S.home.items.push({id:'i'+(++S.home.seq),type:'armchair',x:1,y:4,rot:0});decorate34('armchair');");const a1=ev('ada');assert.equal(a1.id,'ae01');assert(/armchair/.test(a1.text));
  run("S.home.items.find(x=>x.type==='armchair').y=1;");const a2=ev('ada');assert.equal(a2.id,'ae02');
  run("S.home.items=S.home.items.filter(x=>x.type!=='armchair');S.life.lastDecor='lamp';");const a3=ev('ada');assert.equal(a3.id,'ae03');assert(a3.text.includes('the lamp.'),a3.text);
  run("S.life.metrics.decorated=0;");const a4=ev('ada');assert.equal(a4.id,'ae04');
  run("S.life.crop.stage=1;S.life.crop.harvests=0;");assert.equal(ev('tunde').id,'te03');run("S.life.crop.stage=3;");assert.equal(ev('tunde').id,'te02');run("S.life.crop.harvests=1;");assert.equal(ev('tunde').id,'te01');
  run("S.life.crop.stage=0;S.life.crop.harvests=0;");assert.equal(ev('tunde').id,'te04');
  run("request34('nkechi').stage=1;");assert.equal(ev('nkechi').id,'ne03');run("request34('nkechi').stage=2;");assert.equal(ev('nkechi').id,'ne02');run("request34('nkechi').stage=0;");assert.equal(ev('nkechi').id,'ne04');
  assert.deepEqual(used('ada'),[],'evening lines are not marked used');
  return {ada:[a1.id,a2.id,a3.id,a4.id],lampLine:a3.text};});

 const report={build:run('BUILD_ID'),passed:checks.every(c=>c.passed)&&checks.length===10,checks,method:'Actual runtime state and actions in Node with the shipped Three.js and the authored hero; old households from a save, new ones through dispatch(aiStart); talks through the real openTalk and silent remote replays through applyRemote; check 7 includes a subset pass that loads the v35 modules only up to lines-v35.js. Nothing rendered here.'};
 fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);if(SUBSET){process.exitCode=1;return;}let build=null;try{build=runFn&&runFn('BUILD_ID');}catch(_){}
 fs.writeFileSync(OUT,JSON.stringify({build,passed:false,checks,failure:String(e&&e.message||e).split('\n')[0]},null,2)+'\n');process.exitCode=1;});

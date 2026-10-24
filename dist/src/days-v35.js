/* v35 days: the day log (S.life.days), the morning event, the recap after sleep and the rating.
   Loads after tune-v35.js and lines-v35.js; reads evening-v35.js at call time only. Every change wraps an earlier
   function and calls it. Local and companion households keep the log; online play gets the morning and the recap only. */
const LOG35={cap:300,
 kinds:['wake','morning','at-rocks','cast','bite','catch','plant','water','harvest','buy','sell','place','paint','request','shell','evening','sleep','resume'],
 add(k,a){if(online34())return;const rec=days_wake35();if(!rec)return;const e={t:Math.round((rec.playedMs+rec.panelMs)/1000),k};if(a!==undefined&&a!==null)e.a=String(a);days_push35(rec,e);},
 day(n){const d=S&&S.life&&S.life.days;return d&&d[String(n)]||null;},
 today(){return S?LOG35.day(S.day):null;},
 events(n){const r=LOG35.day(n);return r&&r.events?r.events.map(e=>Object.assign({},e)):[];},
 has(n,k,a){return LOG35.count(n,k,a)>0;},
 count(n,k,a){const r=LOG35.day(n);if(!r)return 0;if(!r.events)return (r.counts&&r.counts[k])||0;
  return r.events.filter(e=>e.k===k&&(a===undefined||e.a===a||String(e.a).startsWith(a+':'))).length;}};
const DAYS35={planLead:{recipe:'nkechi',photo:'ada',garden:'tunde'},nightHTML:null,lastInput:0,savedAt:0,dirty:false,todayRated:0,
 // The morning table: the first row whose day and test match wins. day: exactly that day; slot: the cycle slot (days 7+ repeat 4-6); min: that day or later.
 rows:[
  // the evening leads the morning on alternate days while it is pending, so the day 4-6 rows still get their mornings (Today's evening card says it on the others)
  {id:'evening-again',min:4,test:c=>!!c.eveningPending&&c.prevRow!=='evening-again'},
  {id:'seedling',day:2,test:c=>!!c.seedGrantedToday,marker:'garden',lead:'plan',who:'tunde'},
  {id:'grew',day:3,test:c=>c.crop===2,marker:'garden',lead:'nkechi',who:'nkechi'},
  {id:'waiting',day:3,test:c=>c.crop===1,marker:'garden',lead:'tunde',who:'tunde'},
  {id:'unplanted',day:3,test:c=>c.crop===0&&!!c.seedReady,marker:'garden',lead:'tunde',who:'tunde'},
  {id:'ripe',day:3,test:c=>c.crop===3,marker:'garden',lead:'nkechi',who:'nkechi'},
  {id:'finds-return',slot:4,test:c=>(c.returning||[]).length>=2,marker:'market'},
  {id:'ada-invite',slot:5,test:c=>c.adaStage===2&&!c.visitsUnlocked,lead:'ada',who:'ada'},
  {id:'ada-visit',slot:5,test:c=>!!c.visitsUnlocked&&!c.visitToday,marker:'home',lead:'ada',who:'ada'},
  {id:'evening-fish',slot:6,test:c=>!c.caughtCatfish,marker:'fish'},
  {id:'shells',min:4,test:()=>true,marker:'shells',lead:'ada',who:'ada'},
  {id:'quiet',min:2,test:()=>true,lead:'plan-day2'}],
 // marks player activity now; the day's record gets its startedAt from the first one
 activity(){if(typeof silentMode==='function'&&silentMode())return;DAYS35.lastInput=clock35();if(S&&S.phase==='play'&&S.life&&!online34())days_wake35();},
 // the day-3 prompts save as they are typed (the base bind handler writes the value, never saves), at most once a second
 onInput(e){if(!(e&&e.target&&e.target.dataset&&String(e.target.dataset.bind||'').startsWith('life.days.')))return;DAYS35.dirty=true;
  if(clock35()-DAYS35.savedAt>=1000){save();DAYS35.savedAt=clock35();DAYS35.dirty=false;}},
 // the directions marker without the "is marked" toast, so nothing covers the morning card
 // a finger held on the touch stick sends pointermove only, so a held drag counts as activity (once a second); a hovering mouse does not
 onMove(e){if(!e||!(e.pointerType==='touch'||e.buttons))return;if(clock35()-DAYS35.lastInput<1000)return;DAYS35.activity();},
 mark(place){const t=toast;toast=function(){};try{navigate34(place);}finally{toast=t;}}};

/* ---------- The record ---------- */
function days_blank35(){return {startedAt:null,sleptAt:null,playedMs:0,panelMs:0,rating:null,want:null,neighbour:null,dropped:0,events:[]};}
// the day's record exists from the start of the day; it is only woken (given a startedAt) by the player's first activity
function days_ensure35(){if(!S||!S.p||!S.life||online34())return null;const d=S.life.days||(S.life.days={}),k=String(S.day);return d[k]||(d[k]=days_blank35());}
function days_push35(rec,e){if(!rec.events)return;if(rec.events.length>=LOG35.cap){rec.dropped=(rec.dropped||0)+1;return;}rec.events.push(e);}
function days_wake35(){const rec=days_ensure35();if(!rec)return null;if(rec.startedAt===null){rec.startedAt=clock35();days_push35(rec,{t:0,k:'wake'});
 if(rec.morning){days_push35(rec,{t:0,k:'morning',a:String(rec.morning)});delete rec.morning;}}return rec;}
// the latest seven days keep their events; older ones keep totals, the prompts and a count per kind
function days_compact35(){const d=S.life&&S.life.days;if(!d)return;for(const k of Object.keys(d)){const r=d[k];if(!(Number(k)<S.day-6)||!r||!r.events)continue;const counts={};
 for(const e of r.events)counts[e.k]=(counts[e.k]||0)+1;d[k]={startedAt:r.startedAt,sleptAt:r.sleptAt,playedMs:r.playedMs,panelMs:r.panelMs,rating:r.rating,want:r.want,neighbour:r.neighbour,dropped:r.dropped||0,counts};}}

/* ---------- The morning ---------- */
function days_slot35(day){return day<=6?day:4+((day-4)%3);}
function pickMorning35(day,ctx){if(!(day>=2))return null;const c=ctx||{},s=days_slot35(day);
 return DAYS35.rows.find(r=>(r.day!==undefined?day===r.day:r.slot!==undefined?s===r.slot:day>=r.min)&&r.test(c))||null;}
function morningCtx35(day,projected){const l=life34(),c=l.crop,dk=((day-l.startDay)%3+3)%3;
 const offer=[0,1,2,3,4].map(i=>FINDS34[dk*5+i]);
 const order=['lamp','rug','chairs','art','plant','planter','shelf','coffee','armchair','speaker','bed','dining','wardrobe','kitchen','tvconsole'];
 let crop=c.stage,seedGrantedToday=!!(l.seed35&&l.seed35.day===day);
 if(projected){crop=Math.min(3,c.stage+(c.wateredDay===S.day&&c.stage>=1&&c.stage<=2?1:0));seedGrantedToday=typeof TUNE35!=='undefined'&&TUNE35.seedlingPending()&&day>=2;}
 const m=l.morning35,prevRow=m&&m.day===day-1?m.id:null;      // yesterday's row (today's, when projecting tomorrow)
 return {day,crop,seedReady:typeof TUNE35==='undefined'||TUNE35.seedlingReady(),seedGrantedToday,prevRow,
  eveningPending:typeof EVENING35!=='undefined'&&!!EVENING35.pending(),
  returning:order.filter(t=>offer.includes(t)&&!owned34(t)),adaStage:(l.requests&&l.requests.ada||{stage:0}).stage,visitsUnlocked:!!l.visitsUnlocked,
  visitToday:!!(l.visit&&l.visit.day===day),caughtCatfish:!!l.collection.catfish};}
function days_text35(key,vars){return typeof text35==='function'?String(text35(key,vars)||''):'';}
function days_short35(t){return typeof itemShort35==='function'?itemShort35(t):(ITEMS[t]?ITEMS[t].name.toLowerCase():'');}
function days_vars35(ctx){const r=(ctx&&ctx.returning)||[];return {a:r[0]?days_short35(r[0]):'',b:r[1]?days_short35(r[1]):''};}
function days_lead35(row,day){if(!row||!row.lead)return null;const e=typeof evening33==='function'?evening33():null,plan=e&&e.plan;
 if(row.lead==='plan')return DAYS35.planLead[plan]||'tunde';if(row.lead==='plan-day2')return day===2&&DAYS35.planLead[plan]||null;return row.lead;}
// today's row: the one chosen at nextday (stable across reloads, shared online), or worked out without side effects for an older save
function days_todayRow35(){if(!S||!(S.day>=2))return {row:null,ctx:null};const ctx=morningCtx35(S.day),m=S.life&&S.life.morning35;
 const row=m&&m.day===S.day&&DAYS35.rows.find(r=>r.id===m.id)||pickMorning35(S.day,ctx);return {row,ctx};}

/* ---------- Recap, rating and the day-3 prompts ---------- */
function recap35(){const ctx=morningCtx35(S.day+1,true),row=pickMorning35(S.day+1,ctx),d=day34();let clause=null;
 if(d.harvested)clause='pot-again';
 else if(placed('armchair')&&(online34()?(S.life.lastDecor==='armchair'&&d.decorated>0):LOG35.has(S.day,'place','armchair')))clause=days_adaChairHeard35()?'chair-heard':'chair';
 else if(S.day>=3&&typeof EVENING35!=='undefined'&&EVENING35.pending()&&(!row||row.id!=='evening-again'))clause='evening-missed';
 const text=[row?days_text35('recap.'+row.id,days_vars35(ctx)):'',clause?days_text35('recap.clause.'+clause):''].filter(Boolean).join(' ');
 return {rowId:row?row.id:null,clauseId:clause,text};}
// Ada has already said her armchair line today (the talk table's used list is shared online, so both peers agree)
function days_adaChairHeard35(){const L=S.life&&S.life.lines35,u=L&&L.day===S.day&&L.used&&L.used.ada;return !!(u&&u.some(id=>id==='ad03'||id==='ad04'));}
// the morning row's job is done today: the card says so instead of pointing at the pot again
function days_doneMorning35(id){const l=life34(),c=l.crop,watered=c.wateredDay===S.day&&c.stage>=1,picked=!!(l.daily&&l.daily[String(S.day)]&&l.daily[String(S.day)].harvested);
 if((id==='seedling'||id==='unplanted')&&watered)return {title:'morning.done.planted.title',body:'morning.done.grow.body'};
 if(id==='waiting'&&watered)return {title:'morning.done.watered.title',body:'morning.done.grow.body'};
 if((id==='grew'||id==='ripe')&&picked)return {title:'morning.done.harvested.title',body:'morning.done.harvested.body'};return null;}
function days_face35(v){const mouth=['M13 27H27','M13 25Q20 30 27 25','M11 23Q20 34 29 23'][v-1];
 return `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="18" fill="#F1E4CC" stroke="#2A1F17" stroke-opacity=".35"/><circle cx="14" cy="16" r="2.4" fill="#2A1F17"/><circle cx="26" cy="16" r="2.4" fill="#2A1F17"/><path d="${mouth}" fill="none" stroke="#2A1F17" stroke-width="2.6" stroke-linecap="round"/></svg>`;}
function days_rateHTML35(n,heading){const r=LOG35.day(n);if(!r)return '';const names=['Not much','It was nice','Lovely'];
 return `<div class="rate35" role="group" aria-label="${heading}"><h3>${heading}</h3><div class="rate35-faces">${[1,2,3].map(v=>`<button class="rate35-face${r.rating===v?' chosen':''}" data-act="rate35" data-v="${v}" data-day="${n}" aria-label="${names[v-1]}" aria-pressed="${r.rating===v}">${days_face35(v)}</button>`).join('')}</div></div>`;}
function days_promptsHTML35(){const r=LOG35.day(3);if(!r||r.rating==null)return '';
 return `<div class="prompts35"><label>One thing you want for your flat<input type="text" maxlength="140" data-bind="life.days.3.want" value="${esc(r.want||'')}"></label><label>One thing you know about a neighbour<input type="text" maxlength="140" data-bind="life.days.3.neighbour" value="${esc(r.neighbour||'')}"></label><p class="small muted">Optional. Saved as you type.</p></div>`;}
// the night panel: the base html (kept, so its neighbour line is not re-rolled) with the recap, the faces and the prompts before its Sleep button
function days_night35(){const h=String(DAYS35.nightHTML||'');const r=recap35();let add=r.text?`<div class="recap35"><p class="recap35-kicker">TOMORROW</p><p>${esc(r.text)}</p></div>`:'';
 if(!online34()){days_ensure35();add+=days_rateHTML35(S.day,'How was today?');if(S.day===3)add+=days_promptsHTML35();}
 const at=h.indexOf('<div class="actions">');return at>=0?h.slice(0,at)+add+h.slice(at):h+add;}

/* ---------- The copy text ---------- */
function daysText35(){if(online34()||!S||!S.life||!S.life.days)return '';const keys=Object.keys(S.life.days).map(Number).filter(n=>Number.isFinite(n)).sort((a,b)=>a-b);if(!keys.length)return '';
 const iso=ms=>typeof ms==='number'?new Date(ms).toISOString():'—',min=ms=>((ms||0)/60000).toFixed(1),mmss=t=>Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
 const out=[`Compound Days days (${BUILD_ID})`];
 for(const n of keys){const r=S.life.days[n];
  out.push(`Day ${n} · started ${iso(r.startedAt)} · slept ${iso(r.sleptAt)} · play ${min(r.playedMs)} min · panels ${min(r.panelMs)} min · rating ${r.rating?r.rating+'/3':'—'}${r.dropped?' · dropped '+r.dropped:''}`);
  const said=[r.want?`want: "${r.want}"`:'',r.neighbour?`neighbour: "${r.neighbour}"`:''].filter(Boolean);if(said.length)out.push('  '+said.join(' · '));
  if(r.events){const ev=r.events.map(e=>`${mmss(e.t||0)} ${e.k}${e.k==='resume'?' '+iso(e.w):e.a!==undefined?' '+e.a:''}`);for(let i=0;i<ev.length;i+=8)out.push('  '+ev.slice(i,i+8).join(' · '));}
  else if(r.counts)out.push('  counts: '+LOG35.kinds.filter(k=>r.counts[k]).map(k=>k+' '+r.counts[k]).join(' · '));}
 out.push('',days_block35(keys));return out.join('\n');}
// The same days for the reviewer's gates tool (tools/gates-v35.cjs): the records as JSON (exact ms, the two answers escaped), ASCII only and with
// no spaces (\u escapes), cut into 64-character lines that each start "CD35/1 ", so a quoted or re-wrapped paste still reads. The last line gives
// the length and an FNV-1a hash, so a cut or edited paste is noticed. Nothing beyond the log itself: no names, only the two typed answers.
function days_block35(keys){const days={};
 for(const n of keys){const r=S.life.days[n],o={startedAt:r.startedAt,sleptAt:r.sleptAt,playedMs:Math.round(r.playedMs||0),panelMs:Math.round(r.panelMs||0),
   rating:r.rating==null?null:r.rating,want:r.want||null,neighbour:r.neighbour||null,dropped:r.dropped||0};
  if(r.events)o.events=r.events.map(e=>{const a=[e.t||0,e.k];if(e.k==='resume')a.push(typeof e.w==='number'?e.w:null);else if(e.a!==undefined)a.push(String(e.a));return a;});
  else if(r.counts)o.counts=Object.assign({},r.counts);days[n]=o;}
 const json=JSON.stringify({v:1,build:BUILD_ID,copiedAt:clock35(),day:S.day,days}).replace(/[\u0000-\u0020\u007f-\uffff]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
 let h=0x811c9dc5;for(let i=0;i<json.length;i++){h^=json.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
 const lines=['Data for the reviewer’s gates tool (the same days as above):'];for(let i=0;i<json.length;i+=64)lines.push('CD35/1 '+json.slice(i,i+64));
 lines.push('CD35/1 end '+json.length+' '+h.toString(16).padStart(8,'0'));return lines.join('\n');}

/* ---------- Time, idle, at-rocks, the gamepad and the prompt flush (one tick hook, no allocation per frame) ---------- */
const days_tickState35={last:null,pad:0,rocks:[null,null]};
function days_tick35(dt,active){const st=days_tickState35,now=clock35(),d=st.last===null?0:Math.min(Math.max(0,now-st.last),1000);st.last=now;
 if(!S||!S.p||S.phase!=='play'||!S.life||online34())return;
 const rec=days_ensure35();
 if(now-st.pad>=250){st.pad=now;try{const pads=typeof navigator!=='undefined'&&navigator.getGamepads?navigator.getGamepads():null;
  if(pads)for(const g of pads){if(!g)continue;if(g.buttons&&g.buttons.some(b=>b&&b.pressed)||g.axes&&g.axes.some(a=>Math.abs(a)>.5)){DAYS35.activity();break;}}}catch(e){}}
 for(const p of players){if(!p||!p.g||(typeof AI!=='undefined'&&AI.on&&p.i===AI.i))continue;const r=Math.hypot(p.g.position.x-12.4,p.g.position.z-14.2),was=st.rocks[p.i];
  st.rocks[p.i]=r;if(r<3&&(p.y||0)<1&&typeof was==='number'&&was>=3)LOG35.add('at-rocks');}
 if(DAYS35.dirty&&now-DAYS35.savedAt>=1000){save();DAYS35.savedAt=now;DAYS35.dirty=false;}
 if(typeof document!=='undefined'&&document.hidden)return;
 if(!rec||rec.startedAt===null||now-DAYS35.lastInput>60000)return;
 if(overlayOpen())rec.panelMs+=d;else rec.playedMs+=d;}
TICK_HOOKS.push(days_tick35);

/* ---------- Wrappers ---------- */
{
 // wrap: any dispatched action counts as activity for the day it was pressed in
 const prevDispatch=dispatch;dispatch=function(name){if(name!=='continue')DAYS35.activity();return prevDispatch.apply(this,arguments);};
 // logging: each wrap compares state before and after and logs only on success
 const wrap=(name,fn)=>{const prev=ACTIONS[name];if(typeof prev!=='function')return;ACTIONS[name]=function(d){return fn.call(this,prev,d||{},arguments);};};
 wrap('lifeCast',function(prev,d,a){const ph=LIFE34.fish&&LIFE34.fish.phase,r=prev.apply(this,a);if(ph==='ready'&&LIFE34.fish&&LIFE34.fish.phase==='waiting')LOG35.add('cast');return r;});
 wrap('lifeReel',function(prev,d,a){const had=!!(S.life&&S.life.catch),r=prev.apply(this,a);if(!had&&S.life&&S.life.catch)LOG35.add('catch',S.life.catch.id);return r;});
 wrap('lifeCatch',function(prev,d,a){const c=S.life&&S.life.catch,r=prev.apply(this,a);if(c&&d.v==='sell'&&!S.life.catch)LOG35.add('sell','catch:'+c.id);return r;});
 wrap('lifeSell',function(prev,d,a){const k=d.k,ok=k==='fish'||k==='pepper',n=ok?haveCount(k):0,r=prev.apply(this,a);if(ok&&haveCount(k)<n)LOG35.add('sell',k);return r;});
 wrap('lifePlant',function(prev,d,a){const s=life34().crop.stage,r=prev.apply(this,a);if(s===0&&life34().crop.stage===1)LOG35.add('plant');return r;});
 wrap('lifeWater',function(prev,d,a){const c=life34().crop,w=c.wateredDay,r=prev.apply(this,a);if(w!==S.day&&c.wateredDay===S.day)LOG35.add('water',String(c.stage));return r;});
 wrap('lifeHarvest',function(prev,d,a){const c=life34().crop,n=c.harvests,r=prev.apply(this,a);if(c.harvests>n)LOG35.add('harvest');return r;});
 wrap('lifeBuy',function(prev,d,a){const key=S.day+':'+d.t,had=!!life34().orders[key],r=prev.apply(this,a);if(!had&&life34().orders[key])LOG35.add('buy',d.t);return r;});
 wrap('buyPaint35',function(prev,d,a){const n=(S.home.paints||[]).length,r=prev.apply(this,a);if((S.home.paints||[]).length>n)LOG35.add('buy','paint:'+d.id);return r;});
 const placeWrap=function(prev,d,a){const ids=new Set(S.home.items.map(x=>x.id)),r=prev.apply(this,a);
  for(const it of S.home.items)if(!ids.has(it.id))LOG35.add('place',it.type+(it.y===FLAT.rows?':veranda':''));return r;};
 wrap('lifeCell',placeWrap);wrap('placeItem',placeWrap);
 wrap('paint35',function(prev,d,a){const w=S.home.wall,f=S.home.floor,r=prev.apply(this,a);
  if(S.home.wall!==w)LOG35.add('paint','wall:'+(S.home.wall||'base'));if(S.home.floor!==f)LOG35.add('paint','floor:'+(S.home.floor||'base'));return r;});
 wrap('paintUndo35',function(prev,d,a){const w=S.home.wall,f=S.home.floor,r=prev.apply(this,a);
  if(S.home.wall!==w)LOG35.add('paint','undo:wall:'+(S.home.wall||'base'));if(S.home.floor!==f)LOG35.add('paint','undo:floor:'+(S.home.floor||'base'));return r;});
 wrap('lifeRequest',function(prev,d,a){const k=d.k,ok=!!REQUESTS34[k],s=ok?request34(k).stage:0,r=prev.apply(this,a);if(ok&&request34(k).stage>s)LOG35.add('request',k+':'+request34(k).stage);return r;});
 wrap('lifeShell',function(prev,d,a){const n=life34().shells,r=prev.apply(this,a);if(life34().shells>n)LOG35.add('shell',String(d.k));return r;});
 // the bite and the veranda evening reach the log through the cue bus
 if(typeof CUE35_HOOKS!=='undefined')CUE35_HOOKS.push(n=>{if(n==='bite')LOG35.add('bite');else if(n==='evening')LOG35.add('evening','done');});

 // wrap: Continue notes the wall time of the sitting (without waking the day)
 const prevContinue=ACTIONS.continue;ACTIONS.continue=function(){const r=prevContinue.apply(this,arguments);
  if(S&&S.phase==='play'&&S.life&&!online34()){const rec=days_ensure35();if(rec&&rec.startedAt!==null)days_push35(rec,{t:Math.round((rec.playedMs+rec.panelMs)/1000),k:'resume',w:clock35()});}return r;};   // an unwoken day's wake carries the wall time

 // wrap: Sleep logs and stamps the day; the new day gets its record (not yet woken), its morning row, the marker and the Today page
 const prevNext=ACTIONS.nextday;ACTIONS.nextday=function(){
  if(S&&S.life&&!online34()){LOG35.add('sleep');const rec=days_ensure35();if(rec)rec.sleptAt=clock35();}
  const d0=S.day,r=prevNext.apply(this,arguments);if(!S||S.day===d0)return r;DAYS35.nightHTML=null;DAYS35.todayRated=0;
  try{const off=!online34();let rec=null;if(off){rec=days_ensure35();days_compact35();}
   const row=pickMorning35(S.day,morningCtx35(S.day));
   if(row){life34().morning35={day:S.day,id:row.id};if(rec&&rec.startedAt===null)rec.morning=row.id;if(!silentMode()&&off&&row.marker)DAYS35.mark(row.marker);}
   save();}catch(e){if(typeof console!=='undefined')console.warn('days-v35 morning',e);}
  if(!silentMode())openLife34('today');return r;};

 // wrap: the night panel gains the recap, the faces and (day 3, once rated) the two prompts; the base html is kept for re-renders
 const prevEnd=endDay;endDay=function(){if(silentMode())return prevEnd.apply(this,arguments);let html=null,r;const keep=openPanel;openPanel=h=>{html=h;};
  try{r=prevEnd.apply(this,arguments);}finally{openPanel=keep;}if(html===null)return r;
  // a new household's night: Ada says something smelled good only if something was cooked today and she did not just come by (the base reads
  // 'ever cooked'); her card gives way to the quiet-compound paragraph after the base has drawn it, so the shared rng is used exactly as before
  html=String(html);const smelt=html.indexOf('Something smelled good at yours this evening.');
  if(smelt>=0&&S.born35&&!(S.today&&S.today.cooked&&!(typeof EVENING35!=='undefined'&&EVENING35.doneToday()))){const a=html.lastIndexOf('<div class="card say"',smelt),b=html.indexOf('</div>',smelt);
   if(a>=0&&b>a)html=html.slice(0,a)+'<p class="small muted">The compound was quiet. Mrs. Oyelaran’s radio played highlife until nine, then the generator next door took over the melody.</p>'+html.slice(b+6);}
  DAYS35.nightHTML=html.replace(/(data-act="nextday"[^>]*>)Sleep, and start day \d+(<)/,'$1Sleep until tomorrow$2');openPanel(days_night35());return r;};
 ACTIONS.rate35=d=>{if(online34()||!S||!S.life)return;const v=Number(d&&d.v),n=Number(d&&d.day),rec=LOG35.day(n);
  if(![1,2,3].includes(v)||!Number.isInteger(n)||n>S.day||!rec)return;rec.rating=v;save();if(silentMode())return;
  if(n===S.day&&DAYS35.nightHTML)openPanel(days_night35());else if(n<S.day){DAYS35.todayRated=n;openLife34('today');}};
 LOCAL_ONLY.add('rate35');

 // wrap: Today opens with the morning card (and the lead neighbour), asks about yesterday when the night was skipped, and says Sleep
 const prevToday=todayHTML34;todayHTML34=function(){let h=prevToday.apply(this,arguments);
  h=h.replace(btn('Rest until tomorrow','sleep',{},'quiet'),btn('Sleep until tomorrow','sleep',{},'quiet'));
  const {row,ctx}=days_todayRow35();let yest='';
  if(!online34()&&S.day>=2){const y=LOG35.day(S.day-1);if(y&&(y.rating===null||DAYS35.todayRated===S.day-1)){yest=days_rateHTML35(S.day-1,'How was yesterday?');if(S.day-1===3&&DAYS35.todayRated===3)yest+=days_promptsHTML35();}}
  let card='';
  if(row){const vars=days_vars35(ctx),done=days_doneMorning35(row.id),title=done?days_text35(done.title):days_text35('morning.'+row.id+'.title',vars);
   if(title){const body=done?days_text35(done.body):days_text35('morning.'+row.id+'.body',vars),said=row.who&&!done?days_text35('morning.'+row.id+'.say',vars):'',m=done?null:row.marker;
    const b=m==='garden'?(home34()?btn('Open the garden','lifeTab',{v:'garden'},'primary'):btn('Walk to your pot','lifeGo',{v:'garden'},'primary')):m==='market'?btn('See today’s finds','lifeTab',{v:'market'},'primary'):m?btn('Show me the way','lifeGo',{v:m},'primary'):'';
    card=`<div class="life-note34 morning35" data-morning="${esc(row.id)}"><p class="life-kicker">THIS MORNING</p><h3>${esc(title)}</h3>${body?`<p>${esc(body)}</p>`:''}${said?say(row.who,esc(said)):''}${b}${yest}</div>`;yest='';}
   const lead=days_lead35(row,S.day);if(lead&&REQUESTS34[lead])card+=`<div class="morning35-lead">${requestCard34(lead)}</div>`;}
  if(yest)card=`<div class="life-note34 morning35 yesterday35">${yest}</div>`+card;
  return card?h.replace('<div class="life-chips34">',card+'<div class="life-chips34">'):h;};

 // wrap: the copied timeline carries every day after the first evening
 const prevSummary=timelineSummary34;timelineSummary34=function(){const t=prevSummary.apply(this,arguments),d=daysText35();return d?t+'\n\n'+d:t;};
 // wrap: the Menu shows the day count and today's minutes; it offers the copy button when the first-evening line did not
 const prevMenu=openMenu;openMenu=function(){const r=prevMenu.apply(this,arguments);if(silentMode()||online34()||!S||!S.life||!S.life.days)return r;
  const n=Object.keys(S.life.days).length;if(!n)return r;const t=LOG35.today(),mins=t?((t.playedMs+t.panelMs)/60000).toFixed(1):'0.0';
  const actions=typeof document!=='undefined'&&document.querySelector?document.querySelector('#panel .actions'):null;
  if(actions){actions.insertAdjacentHTML('beforebegin',`<p class="small days35-menu">Days in Palm Court: ${n} · today ${mins} min</p>`);
   if(!(typeof eveningStatusText34==='function'&&eveningStatusText34()))actions.insertAdjacentHTML('beforeend',btn('Copy timeline and days','copyTimeline',{},'quiet'));
   // feel's button copies the same text; it says so, so testers look for one name (docs/TESTING_v35.md)
   else{const b=actions.querySelector&&actions.querySelector('[data-act="copyTimeline"]');if(b)b.textContent='Copy timeline and days';}}return r;};
 // wrap: the day log stays on this device; the morning row and the line bookkeeping stay in the shared document
 const prevStrip=stripState;stripState=function(){const o=prevStrip.apply(this,arguments);if(o&&o.life)delete o.life.days;return o;};

 // listeners: input from any device wakes the day; the prompts save as typed
 if(typeof window!=='undefined'&&window.addEventListener){window.addEventListener('keydown',()=>DAYS35.activity(),true);window.addEventListener('pointerdown',()=>DAYS35.activity(),true);
  window.addEventListener('pointermove',e=>DAYS35.onMove(e),true);}
 if(typeof panel!=='undefined'&&panel&&panel.addEventListener){panel.addEventListener('input',e=>DAYS35.onInput(e));panel.addEventListener('change',e=>DAYS35.onInput(e));}
}

#!/usr/bin/env node
// Compound Days v35 tester gates (docs/PLAN_v35_three_days.md section 7, docs/TESTING_v35.md part C).
// Reads what testers pasted from Menu > "Copy timeline and days" and reports the seven gates.
// Dependency-free. Usage:
//   node tools/gates-v35.cjs [--json] [--final] [--testers N] [--now ISO] [file ...]     (no file, or "-", reads stdin)
// Tester names come from a "Tester: <name>" line, else from the file name ("amaka-2.txt" is Amaka's second sitting).
// Reviewer lines, each on its own line before or after a paste: "Coached: no|yes", "Done: yes", "Note: <text>".
// The output never depends on the wall clock: "--now" is the only way to give the tool today's date.
'use strict';
const fs=require('fs'),path=require('path');

const KINDS=['wake','morning','at-rocks','cast','bite','catch','plant','water','harvest','buy','sell','place','paint','request','shell','evening','sleep','resume'];
const H48=48*3600*1000,MIN20=20*60000,MIN35=35*60000,CATCH_S=120,BACK_S=120;
const NON_ANSWERS=new Set(['','-','--','?','??','.','...','no','nope','none','nil','nothing','nothing really','not really','nothing much','n/a','na','idk','i dont know','i don\'t know','dunno','not sure','unsure','no idea','anything','everything','something','stuff','things','more stuff','ok','okay','yes','fine','good','nice','x','asdf','test']);

/* ---------- Reading pastes ---------- */
const unquote=l=>l.replace(/\r$/,'').replace(/^(\s*>)+\s?/,'');
function fnv(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h.toString(16).padStart(8,'0');}
function isoMs(s){if(!s||s==='—'||s==='-')return null;const t=Date.parse(s);return Number.isFinite(t)&&/^\d{4}-\d\d-\d\dT/.test(s)?t:NaN;}

// Splits one input text into segments: {name, coached, done, notes, pastes:[{lines}]}. A "Tester:" line starts a new tester; a new paste starts at
// a timeline header (or a second days header) once the current paste has begun.
function splitText(text,fileName){
 const segs=[];let seg=null,paste=null;
 const newSeg=name=>{seg={name,coached:null,done:false,notes:[],pastes:[],source:fileName};segs.push(seg);paste=null;};
 const lines=String(text).split('\n').map(unquote);
 for(let i=0;i<lines.length;i++){const l=lines[i],t=l.trim();let m;
  if((m=t.match(/^tester\s*:\s*(.+)$/i))){newSeg(m[1].trim());continue;}
  if(!seg)newSeg(null);
  if((m=t.match(/^coached\s*:\s*(yes|no|y|n)\b/i))){seg.coached=/^y/i.test(m[1]);continue;}
  if((m=t.match(/^done\s*:\s*(yes|no|y|n)\b/i))){seg.done=/^y/i.test(m[1]);continue;}
  if((m=t.match(/^note\s*:\s*(.*)$/i))){if(m[1].trim())seg.notes.push(m[1].trim());continue;}
  const evHead=/^Compound Days first evening \(/.test(t)||t==='No first-evening timeline yet.',dayHead=/^Compound Days days \(/.test(t);
  if(evHead||dayHead){if(!paste||(evHead&&(paste.hasEvening||paste.hasDays))||(dayHead&&paste.hasDays)){paste={lines:[],hasEvening:false,hasDays:false};seg.pastes.push(paste);}
   if(evHead)paste.hasEvening=true;else paste.hasDays=true;}
  if(!paste){if(t){paste={lines:[],hasEvening:false,hasDays:false};seg.pastes.push(paste);}else continue;}
  paste.lines.push(l);}
 return segs;}

// The machine block: "CD35/1 <chunk>" lines, then "CD35/1 end <length> <hash>".
function readBlock(lines){let chunks=[],end=null,seen=false;
 for(const l of lines){const t=l.trim();let m;
  if((m=t.match(/^CD35\/1 end (\d+) ([0-9a-f]{8})$/))){end={len:+m[1],hash:m[2]};break;}
  if((m=t.match(/^CD35\/1 (\S+)$/))){chunks.push(m[1]);seen=true;}
  else if(seen&&/^CD35\/1/.test(t))chunks.push(t.slice(7).replace(/\s+/g,''));}
 if(!seen&&!end)return {state:'absent'};
 const json=chunks.join('');
 if(!end)return {state:'cut',detail:'the data block has no end line'};
 if(json.length!==end.len)return {state:'cut',detail:`the data block holds ${json.length} of ${end.len} characters`};
 if(fnv(json)!==end.hash)return {state:'changed',detail:'the data block does not match its check value'};
 try{const o=JSON.parse(json);if(!o||o.v!==1||typeof o.days!=='object')return {state:'changed',detail:'the data block is not version 1'};return {state:'ok',data:o};}
 catch(e){return {state:'changed',detail:'the data block is not valid JSON'};}}

// The human-readable lines (used when the block is missing or broken). Minutes come to 0.1.
function readHuman(lines,warn){const days={};let cur=null,build=null,any=false;
 for(let i=0;i<lines.length;i++){const raw=lines[i],t=raw.trim();let m;if(!t)continue;
  if((m=t.match(/^Compound Days days \(([^)]*)\)$/))){build=m[1];any=true;continue;}
  if(/^Day \d/.test(t)){any=true;
   m=t.match(/^Day (\d+) · started (\S+) · slept (\S+) · play (\d+\.\d) min · panels (\d+\.\d) min · rating (?:(\d)\/3|—)(?: · dropped (\d+))?$/);
   if(!m){warn(`line "${t.slice(0,48)}" could not be read (cut short?)`);cur=null;continue;}
   const g=m.slice(1);const s=isoMs(g[1]),z=isoMs(g[2]);
   if(Number.isNaN(s)||Number.isNaN(z)){warn(`day ${g[0]}: a time could not be read`);cur=null;continue;}
   cur=days[g[0]]={startedAt:s,sleptAt:z,playedMs:Math.round(+g[3]*60000),panelMs:Math.round(+g[4]*60000),rating:g[5]?+g[5]:null,want:null,neighbour:null,dropped:g[6]?+g[6]:0,events:[],approx:true};continue;}
  if(!cur)continue;                                   // the day's own lines (their indent may be lost in a paste)
  if(/^(want|neighbour): "/.test(t)){
   let w=null,n=null;if(t.startsWith('want: "')){const k=t.lastIndexOf('" · neighbour: "');if(k>0&&t.endsWith('"')){w=t.slice(7,k);n=t.slice(k+16,-1);}else if(t.endsWith('"'))w=t.slice(7,-1);else warn(`day's answers look cut short`);}
   else if(t.endsWith('"'))n=t.slice(12,-1);else warn(`day's answers look cut short`);
   if(w!==null)cur.want=w;if(n!==null)cur.neighbour=n;continue;}
  if(t.startsWith('counts: ')){delete cur.events;cur.counts={};for(const p of t.slice(8).split(' · ')){const q=p.match(/^(\S+) (\d+)$/);if(q)cur.counts[q[1]]=+q[2];}continue;}
  if(/^\d+:\d\d /.test(t)&&cur.events){for(const p of t.split(' · ')){const q=p.match(/^(\d+):(\d\d) (\S+)(?: (\S+))?$/);
    if(!q||!KINDS.includes(q[3])){warn(`an event "${p.slice(0,24)}" could not be read (cut short?)`);continue;}
    const e=[+q[1]*60+ +q[2],q[3]];if(q[3]==='resume'){const w=isoMs(q[4]);e.push(Number.isFinite(w)?w:null);}else if(q[4]!==undefined)e.push(q[4]);cur.events.push(e);}}}
 return any?{build,days}:null;}

// a block's records, keeping only well-formed fields (the check value already guards against damage; this guards against odd data)
function clean(days){const out={},num=v=>typeof v==='number'&&Number.isFinite(v)?v:null,str=v=>typeof v==='string'?v:null;
 for(const [k,r] of Object.entries(days||{})){if(!r||typeof r!=='object')continue;
  const o={startedAt:num(r.startedAt),sleptAt:num(r.sleptAt),playedMs:num(r.playedMs)||0,panelMs:num(r.panelMs)||0,rating:[1,2,3].includes(r.rating)?r.rating:null,want:str(r.want),neighbour:str(r.neighbour),dropped:num(r.dropped)||0};
  if(Array.isArray(r.events))o.events=r.events.filter(e=>Array.isArray(e)&&typeof e[0]==='number'&&typeof e[1]==='string');
  else if(r.counts&&typeof r.counts==='object')o.counts=Object.assign({},r.counts);else o.events=[];out[k]=o;}
 return out;}
// One paste: block first, the human lines as the fallback.
function readPaste(p){const warnings=[],warn=s=>warnings.push(s);const b=readBlock(p.lines);
 const out={hasEvening:p.hasEvening,hasDays:p.hasDays,days:null,build:null,copiedAt:null,source:'none',warnings};
 if(b.state==='ok'){out.days=clean(b.data.days);out.build=b.data.build||null;out.copiedAt=typeof b.data.copiedAt==='number'?b.data.copiedAt:null;out.source='block';return out;}
 const h=readHuman(p.lines,warn);
 if(b.state!=='absent')warn(b.detail+'; read from the readable lines instead (minutes to 0.1)');
 else if(h)warn('no data block at the end: the paste may be cut short or come from an older build; read from the readable lines (minutes to 0.1)');
 if(h){out.days=h.days;out.build=h.build;out.source='text';}
 else if(p.hasEvening)warn('only the first-evening timeline, no days: an online household, or a copy from before v35');
 else warn('nothing in this paste looks like a Compound Days copy');
 return out;}

/* ---------- Testers ---------- */
function nameFromFile(f){if(!f||f==='-')return null;return path.basename(f).replace(/\.[^.]+$/,'').replace(/[-_ ](?:sitting|part|s)?[-_ ]?\d+$/i,'').replace(/ \(\d+\)$/,'').trim()||null;}
const tkey=n=>String(n).trim().toLowerCase();

function score(r){return [r.sleptAt!=null?1:0,(r.playedMs||0)+(r.panelMs||0),r.events?r.events.length:0];}
function better(a,b){const x=score(a),y=score(b);for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]>y[i];}return false;}

// inputs: [{name, text}] -> testers in first-seen order
function collect(inputs){const map=new Map(),order=[];
 for(const inp of inputs){for(const seg of splitText(inp.text,inp.name)){const name=seg.name||nameFromFile(inp.name)||'tester';const k=tkey(name);
  if(!map.has(k)){map.set(k,{name,sources:[],coached:null,done:false,notes:[],pastes:[]});order.push(k);}const t=map.get(k);
  const src=inp.name&&inp.name!=='-'?path.basename(inp.name):'stdin';if(!t.sources.includes(src))t.sources.push(src);
  if(seg.coached!==null)t.coached=seg.coached;if(seg.done)t.done=true;t.notes.push(...seg.notes);
  for(const p of seg.pastes)t.pastes.push(readPaste(p));}}
 return order.map(k=>mergeTester(map.get(k)));}

function mergeTester(t){const days={},warnings=[],builds=new Set();let copiedAt=null,anyDays=false,approx=false;
 t.pastes.forEach((p,i)=>{for(const w of p.warnings)warnings.push(`sitting ${i+1}: ${w}`);if(p.build)builds.add(p.build);if(p.copiedAt!=null)copiedAt=Math.max(copiedAt||0,p.copiedAt);
  if(!p.days)return;anyDays=true;if(p.source==='text')approx=true;
  for(const [k,r] of Object.entries(p.days)){const n=Number(k);if(!Number.isInteger(n)||n<1)continue;const prev=days[n];
   if(prev&&prev.startedAt!=null&&r.startedAt!=null&&prev.startedAt!==r.startedAt)warnings.push(`sittings disagree on when day ${n} started: two households or devices?`);
   if(!prev||better(r,prev)||(!better(prev,r)))days[n]=Object.assign({},r,{want:r.want||(prev&&prev.want)||null,neighbour:r.neighbour||(prev&&prev.neighbour)||null});}});
 if(!t.pastes.length)warnings.push('no paste found for this tester');
 else if(!anyDays)warnings.push('no day log: play the test in a single-player or companion household (online play keeps no log)');
 if(builds.size>1)warnings.push('sittings come from different builds: '+[...builds].sort().join(', '));
 return {name:t.name,sources:t.sources,coached:t.coached,done:t.done,notes:t.notes,days,copiedAt,builds:[...builds].sort(),approx,warnings,sittings:t.pastes.length};}

/* ---------- Per-tester measures ---------- */
const realMs=r=>r?(r.playedMs||0)+(r.panelMs||0):null;
const daySec=r=>{const ev=r&&r.events||[];return Math.max(Math.round(realMs(r)/1000),ev.length?ev[ev.length-1][0]:0);};
function specific(s){if(s==null)return false;const v=String(s).trim().toLowerCase().replace(/[’`]/g,'\'').replace(/[!.?,;:]+$/,'').replace(/\s+/g,' ');
 if(NON_ANSWERS.has(v))return false;const letters=(v.match(/\p{L}/gu)||[]).length;if(letters<3)return false;const words=v.split(' ').filter(w=>/\p{L}/u.test(w));
 return words.length>=2||letters>=4;}
// when the tester came back for day N (see gate 2): {at, how:'start'|'resume'} or null while day N has not really been played. A tap on the
// morning page (closing it, or Menu > Copy) wakes the day at once, so the start may be that tap; the game logs a 'resume' with the wall time
// on Continue and on the first input after 10 minutes away (or the page shown after 10 minutes hidden). The return is the first resume after
// the previous day's Sleep (`after`) logged before two minutes of that day's play (a later one is a pause in a day already being played);
// without one it is the day's start, once the day shows play beyond its wake and morning.
function returnAt(r,after){if(!r||r.startedAt==null)return null;if(!r.events)return {at:r.startedAt,how:'start'};
 for(const e of r.events)if(e[1]==='resume'&&typeof e[2]==='number'&&e[0]<BACK_S&&(after==null||e[2]>after))return {at:e[2],how:'resume'};
 if(r.events.some(e=>e[1]!=='wake'&&e[1]!=='morning'&&e[1]!=='resume'))return {at:r.startedAt,how:'start'};
 return realMs(r)>=BACK_S*1000?{at:r.startedAt,how:'start'}:null;}
function reached(t){let r=0;for(const [n,d] of Object.entries(t.days))if(d.startedAt!=null)r=Math.max(r,+n);return r;}
const slept=(t,n)=>!!(t.days[n]&&t.days[n].sleptAt!=null);
const has=(r,k)=>!!r&&(r.events?r.events.some(e=>e[1]===k):!!(r.counts&&r.counts[k]));

function firstCatch(t){const ns=Object.keys(t.days).map(Number).sort((a,b)=>a-b);let anchor=null,elapsed=0,compacted=false;
 for(const n of ns){const r=t.days[n];if(!r.events){if(r.counts&&(r.counts['at-rocks']||r.counts.catch))compacted=true;if(anchor)elapsed+=daySec(r);continue;}
  for(const e of r.events){if(!anchor){if(e[1]==='catch')return {state:'unknown',why:'a catch before any at-rocks event (a reload at the rocks?)'};if(e[1]==='at-rocks')anchor={day:n,t:e[0]};continue;}
   if(e[1]==='catch'){const s=n===anchor.day?e[0]-anchor.t:elapsed+e[0];return {state:'caught',seconds:s,day:anchor.day,catchDay:n};}}
  if(anchor)elapsed+=n===anchor.day?daySec(r)-anchor.t:daySec(r);}
 if(anchor)return {state:'waiting',day:anchor.day,since:elapsed};
 return {state:compacted?'unknown':'none',why:compacted?'the fishing days are summarised (counts only)':''};}

function measure(t,opt){const fin=opt.final||t.done,r=reached(t),d=t.days;
 const fc=firstCatch(t),eve3=has(d[3],'evening'),eveDay=Object.keys(d).map(Number).sort((a,b)=>a-b).find(n=>has(d[n],'evening'))||null;
 const ans=d[3]?[d[3].want,d[3].neighbour]:[null,null];
 return {name:t.name,reached:r,slept:[1,2,3].map(n=>slept(t,n)),minutes:[1,2,3].map(n=>d[n]&&d[n].sleptAt!=null?realMs(d[n]):(d[n]&&d[n].startedAt!=null?realMs(d[n]):null)),
  complete:[1,2,3].map(n=>slept(t,n)),ratings:[1,2,3].map(n=>d[n]?d[n].rating:null),answers:ans,specific:ans.map(specific),fc,eve3,eveDay,fin,slept4:slept(t,4)};}

/* ---------- Gates ---------- */
const fmtMin=ms=>ms==null?'—':(ms/60000).toFixed(1);
const mmss=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
function hours(ms){return (ms/3600000).toFixed(1)+' h';}
// k of n: yes, no, pending (missing testers count as pending, or as no when final)
function kOf(k,yes,pending,opt,missing){const p=pending+(opt.final?0:missing);return yes>=k?'PASS':yes+p<k?'FAIL':'NOT YET';}
// every tester it applies to: any no fails; anything still open (or testers still to come) is not yet; nobody to judge fails only when final
function every(yes,no,pend,opt,missing){return no?'FAIL':pend||(!opt.final&&missing)?'NOT YET':!yes?(opt.final?'FAIL':'NOT YET'):'PASS';}
function median(a){if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2;}

function gates(testers,opt){const N=opt.testers,K4=Math.ceil(N*4/5),K3=Math.ceil(N*3/5),ms=testers.map(t=>measure(t,opt)),missing=Math.max(0,N-testers.length),G=[];
 const names=a=>a.length?a.join(', '):'none';
 // 1. Four of five finish day 2 without coaching
 {const yes=[],logOnly=[],no=[],pend=[];testers.forEach((t,i)=>{const m=ms[i];
   if(m.slept[1]){if(t.coached===false)yes.push(t.name);else if(t.coached===true)no.push(t.name+' (coached)');else logOnly.push(t.name);}
   else if(m.fin||m.reached>=3)no.push(t.name);else pend.push(t.name);});
  const st=kOf(K4,yes.length,pend.length+logOnly.length,opt,missing);
  const logCount=yes.length+logOnly.length;
  G.push({gate:1,title:'Four of five finish day 2 without coaching',status:st,
   numbers:{sleptDay2:logCount,confirmedNotCoached:yes.length,awaitingNote:logOnly.length,coached:no.filter(s=>/coached/.test(s)).length,notYet:pend.length,missing},
   lines:[`The log shows ${logCount} of ${N} slept on day 2 (${names(yes.concat(logOnly))}); ${K4} needed.`,
    `Coaching is the reviewer’s call, not the log’s: ${yes.length} confirmed “Coached: no”`+(logOnly.length?`, still to note: ${logOnly.join(', ')}`:'')+(no.length?`; not counted: ${no.join(', ')}`:'')+'.']});}
 // 2. Day-3 startedAt within 48 hours of day-2 sleptAt. A tap on the morning page (closing it, or Menu > Copy) wakes day 3 at once, so day 3's
 // start for this gate is the first return logged after day 2's Sleep (Continue, or the first input after 10 minutes away), when there is one.
 {const rows=[],yes=[],no=[],pend=[];testers.forEach((t,i)=>{const m=ms[i],d2=t.days[2],d3=t.days[3];
   if(!(d2&&d2.sleptAt!=null)){if(!m.fin&&m.reached<3)pend.push(t.name);return;}
   const back=returnAt(d3,d2.sleptAt);
   if(back){const g=back.at-d2.sleptAt;rows.push(`${t.name} ${hours(g)}${back.how==='resume'?' (by its return)':''}`);(g<=H48?yes:no).push(t.name);return;}
   const asOf=Math.max(t.copiedAt||0,opt.now||0);if(asOf&&asOf-d2.sleptAt>H48){no.push(t.name);rows.push(`${t.name} not back after ${hours(asOf-d2.sleptAt)}`);}
   else if(m.fin){no.push(t.name);rows.push(`${t.name} did not come back for day 3`);}else{pend.push(t.name);rows.push(`${t.name} not back yet`);}});
  const st=every(yes.length,no.length,pend.length,opt,missing);
  G.push({gate:2,title:'Day 3 starts within 48 hours of sleeping on day 2',status:st,numbers:{within:yes.length,over:no.length,notYet:pend.length},
   lines:[rows.length?'Gap from day-2 Sleep to coming back for day 3: '+rows.join(' · ')+'.':'Nobody has slept on day 2 yet.','Every tester who slept on day 2 must be back within 48 hours.']});}
 // 3. Day 3 mean rating at least day 1's; three of five give day 3 the top face
 {const r1=[],r3=[];let top=0,pend3=0,pend1=0;testers.forEach((t,i)=>{const m=ms[i];
   if(m.ratings[0]!=null)r1.push(m.ratings[0]);else if(!(m.fin||m.reached>=3))pend1++;
   if(m.ratings[2]!=null){r3.push(m.ratings[2]);if(m.ratings[2]===3)top++;}else if(!(m.fin||m.reached>=5||m.slept4))pend3++;});
  const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null,m1=mean(r1),m3=mean(r3);
  const topSt=kOf(K3,top,pend3,opt,missing),open=pend1+pend3+(opt.final?0:missing);
  const meanOK=m1!=null&&m3!=null&&m3+1e-9>=m1;
  const st=topSt==='FAIL'||(!open&&!meanOK)?'FAIL':topSt==='PASS'&&!open&&meanOK?'PASS':'NOT YET';
  G.push({gate:3,title:'Day 3 rated at least as well as day 1, and three of five give day 3 the top face',status:st,
   numbers:{day1Mean:m1==null?null:Math.round(m1*100)/100,day3Mean:m3==null?null:Math.round(m3*100)/100,day1Rated:r1.length,day3Rated:r3.length,day3Top:top,notYet:pend1+pend3},
   lines:[`Mean rating: day 1 ${m1==null?'—':m1.toFixed(2)} (${r1.length} rated), day 3 ${m3==null?'—':m3.toFixed(2)} (${r3.length} rated).`,`Top face on day 3: ${top} of ${N} (${K3} needed).`]});}
 // 4. Each tester answers both day-3 prompts specifically
 {const yes=[],no=[],pend=[],rows=[];testers.forEach((t,i)=>{const m=ms[i],ok=m.specific[0]&&m.specific[1];
   rows.push(`${t.name}: want ${m.answers[0]?'“'+m.answers[0]+'”':'—'}${m.answers[0]&&!m.specific[0]?' (vague)':''}; neighbour ${m.answers[1]?'“'+m.answers[1]+'”':'—'}${m.answers[1]&&!m.specific[1]?' (vague)':''}`);
   if(ok)yes.push(t.name);else if(m.fin||m.reached>=5||m.slept4)no.push(t.name);else pend.push(t.name);});
  G.push({gate:4,title:'Each tester answers both day-3 prompts specifically',status:kOf(N,yes.length,pend.length,opt,missing),numbers:{specific:yes.length,notSpecific:no.length,notYet:pend.length},
   lines:rows.concat(['The tool counts an answer as specific when it has two words, or one word of four letters or more, and is not a non-answer such as “nothing” or “idk”. Read the answers yourself too.'])});}
 // 5. Median real day 20 to 35 minutes
 {const all=[],per=[[],[],[]];let open=opt.final?0:missing;testers.forEach((t,i)=>{const m=ms[i];for(let n=1;n<=3;n++)if(slept(t,n)){const v=realMs(t.days[n]);all.push(v);per[n-1].push(v);}
   if(!m.fin&&!m.slept[2])open++;});
  const med=median(all),ok=med!=null&&med>=MIN20&&med<=MIN35;const st=open?'NOT YET':ok?'PASS':'FAIL';
  G.push({gate:5,title:'The median real day (play plus panels) is 20 to 35 minutes',status:st,
   numbers:{days:all.length,medianMs:med==null?null:Math.round(med),day1MedianMs:med1(per[0]),day2MedianMs:med1(per[1]),day3MedianMs:med1(per[2]),testersStillPlaying:open},
   lines:[`Median of ${all.length} finished days (days 1 to 3, slept): ${fmtMin(med)} min. By day: ${per.map((a,k)=>`day ${k+1} ${fmtMin(median(a))}`).join(', ')}.`,
    'If it stays under 20 minutes, the plan slows the clock outside the guided evening to half a game minute per second.']});}
 // 6. Four of five see the veranda evening on day 3
 {const yes=[],no=[],pend=[];testers.forEach((t,i)=>{const m=ms[i];if(m.eve3)yes.push(t.name);else if(m.fin||m.slept[2]||m.reached>=4)no.push(t.name+(m.eveDay?` (day ${m.eveDay})`:''));else pend.push(t.name);});
  G.push({gate:6,title:'Four of five see the veranda evening on day 3',status:kOf(K4,yes.length,pend.length,opt,missing),numbers:{sawDay3:yes.length,missed:no.length,notYet:pend.length},
   lines:[`Saw it on day 3: ${names(yes)} (${K4} of ${N} needed).`+(no.length?` Missed: ${no.join(', ')}.`:'')]});}
 // 7. First catch within two minutes of the first at-rocks event
 {const yes=[],no=[],pend=[],rows=[];testers.forEach((t,i)=>{const m=ms[i],f=m.fc;
   if(f.state==='caught'){rows.push(`${t.name} ${mmss(f.seconds)}${f.catchDay!==f.day?` (rocks day ${f.day}, catch day ${f.catchDay})`:''}`);(f.seconds<=CATCH_S?yes:no).push(t.name);}
   else if(f.state==='waiting'){if(f.since>CATCH_S||m.fin){no.push(t.name);rows.push(`${t.name} no catch in ${mmss(f.since)}`);}else{pend.push(t.name);rows.push(`${t.name} at the rocks, no catch yet`);}}
   else if(f.state==='unknown'){rows.push(`${t.name} unknown: ${f.why}`);if(!m.fin)pend.push(t.name);}
   else if(!m.fin)pend.push(t.name);});
  const st=every(yes.length,no.length,pend.length,opt,missing);
  G.push({gate:7,title:'First catch within two minutes of first reaching the rocks',status:st,numbers:{within:yes.length,over:no.length,notYet:pend.length},
   lines:[rows.length?'Play time from first reaching the rocks to the first catch: '+rows.join(' · ')+'.':'Nobody has reached the rocks yet.','Every tester who reached the rocks must catch within 2:00 of play.']});}
 return {ms,gates:G};
 function med1(a){const m=median(a);return m==null?null:Math.round(m);}}

/* ---------- Report ---------- */
function pad(s,n){s=String(s);return s.length>=n?s+' ':s+' '.repeat(n-s.length);}
function analyse(inputs,o){const opt=Object.assign({testers:5,final:false,now:null},o||{});const testers=collect(inputs);const g=gates(testers,opt);
 return {expected:opt.testers,final:!!opt.final,now:opt.now,testers:testers.map((t,i)=>{const m=g.ms[i];return {name:t.name,sources:t.sources,sittings:t.sittings,builds:t.builds,coached:t.coached,done:t.done,
   notes:t.notes,reachedDay:m.reached,sleptDays:[1,2,3].filter((n,k)=>m.slept[k]),minutesMs:m.minutes,ratings:m.ratings,answers:{want:m.answers[0],neighbour:m.answers[1]},promptsSpecific:m.specific.filter(Boolean).length,
   firstCatch:m.fc.state==='caught'?{seconds:m.fc.seconds,rocksDay:m.fc.day,catchDay:m.fc.catchDay}:{state:m.fc.state},eveningDay:m.eveDay,approx:t.approx,warnings:t.warnings,
   days:t.days};}),gates:g.gates};}

function textReport(a){const out=[];
 out.push('Compound Days v35 tester gates');
 out.push(`Testers: ${a.testers.length} of ${a.expected} · ${a.final?'final: every sitting is in':'in progress (add --final once every sitting is in)'}`+(a.now?` · as of ${new Date(a.now).toISOString()}`:''));
 out.push('');
 const W=[12,6,22,10,9,13,8];out.push([pad('Tester',W[0]),pad('Days',W[1]),pad('Real min d1/d2/d3',W[2]),pad('Ratings',W[3]),pad('Prompts',W[4]),pad('First catch',W[5]),'Evening'].join('').trimEnd());
 for(const t of a.testers){const fc=t.firstCatch.seconds!=null?mmss(t.firstCatch.seconds):t.firstCatch.state==='waiting'?'none yet':t.firstCatch.state==='unknown'?'unknown':'—';
  const mins=t.minutesMs.map((v,k)=>v==null?'—':fmtMin(v)+(t.sleptDays.includes(k+1)?'':'+')).join(' / ');
  out.push([pad(t.name.slice(0,11),W[0]),pad(t.reachedDay||'—',W[1]),pad(mins,W[2]),pad(t.ratings.map(r=>r==null?'—':r).join(' '),W[3]),pad(t.promptsSpecific+'/2',W[4]),pad(fc,W[5]),t.eveningDay?'day '+t.eveningDay:'no'].join('').trimEnd());}
 out.push('Days: the last day started. A “+” marks a day not yet slept. Minutes are play plus panels.');
 out.push('');
 for(const g of a.gates){out.push(`Gate ${g.gate}  ${g.title}: ${g.status}`);for(const l of g.lines)out.push('  '+l);out.push('');}
 const notes=[];for(const t of a.testers){for(const w of t.warnings)notes.push(`${t.name}: ${w}`);for(const n of t.notes)notes.push(`${t.name} (reviewer): ${n}`);if(t.approx)notes.push(`${t.name}: some days read from the readable lines, so minutes are to 0.1`);}
 if(a.testers.length<a.expected)notes.push(`${a.expected-a.testers.length} of ${a.expected} testers have no paste yet`);
 if(notes.length){out.push('Notes');for(const n of notes)out.push('  '+n);}
 return out.join('\n').replace(/\n+$/,'')+'\n';}

/* ---------- Command line ---------- */
function main(argv){const opt={testers:5,final:false,now:null},files=[];let json=false;
 for(let i=0;i<argv.length;i++){const a=argv[i];let m;
  if(a==='--json')json=true;else if(a==='--final')opt.final=true;
  else if((m=a.match(/^--testers(?:=(.*))?$/))){const v=m[1]!==undefined?m[1]:argv[++i];opt.testers=parseInt(v,10);if(!(opt.testers>0))return usage('--testers needs a number');}
  else if((m=a.match(/^--now(?:=(.*))?$/))){const v=m[1]!==undefined?m[1]:argv[++i];opt.now=Date.parse(v);if(!Number.isFinite(opt.now))return usage('--now needs a date such as 2026-11-02T18:00:00Z');}
  else if(a==='-h'||a==='--help')return usage(null);
  else if(a.startsWith('--'))return usage('unknown option '+a);else files.push(a);}
 const inputs=[];
 if(!files.length)files.push('-');
 for(const f of files){try{inputs.push({name:f,text:f==='-'?fs.readFileSync(0,'utf8'):fs.readFileSync(f,'utf8')});}catch(e){process.stderr.write(`gates-v35: cannot read ${f}: ${e.code||e.message}\n`);return 2;}}
 const a=analyse(inputs,opt);process.stdout.write(json?JSON.stringify(a,null,2)+'\n':textReport(a));return 0;}
function usage(err){const u='Usage: node tools/gates-v35.cjs [--json] [--final] [--testers N] [--now ISO] [file ...]\n';
 if(err){process.stderr.write('gates-v35: '+err+'\n'+u);return 2;}process.stdout.write(u);return 0;}

module.exports={analyse,textReport,splitText,readBlock,readHuman,readPaste,collect,specific,firstCatch,main,fnv};
if(require.main===module)process.exitCode=main(process.argv.slice(2));

#!/usr/bin/env node
// Compound Days v38: the quiet stretches of a playtest (gist/SPEC.md §12.3, docs/TESTING_gist.md).
// Reads what a tester pasted from Menu > "Copy timeline and days" (the CD35/1 block, or the readable day lines when the block is missing) and
// prints, for each day, the three longest stretches with no logged event between 10:30 and 18:00 game time, in real seconds of played time.
// The day log keeps played time, not the clock: one game hour is one real minute of open play from 07:30 (the "wake" or "morning" event), so
// 10:30 to 18:00 is read as 180 to 630 seconds after the day's first event. Panels stop the clock but count in the log's time, and reels and
// waits move the clock without play, so the window is approximate; a stretch is the gap between two logged events (or the window's edges).
// Dependency-free, no wall clock. Usage:
//   node tools/quiet-v38.cjs [--from 10.5] [--to 18] [--top 3] [--json] [file ...]     (no file, or "-", reads stdin)
'use strict';
const fs=require('fs');

function fnv(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h.toString(16).padStart(8,'0');}
// the CD35/1 block (as tools/gates-v35.cjs reads it)
function readBlock(text){let chunks=[],end=null,seen=false;
 for(const raw of String(text).split('\n')){const t=raw.replace(/\r$/,'').replace(/^(\s*>)+\s?/,'').trim();let m;
  if((m=t.match(/^CD35\/1 end (\d+) ([0-9a-f]{8})$/))){end={len:+m[1],hash:m[2]};break;}
  if((m=t.match(/^CD35\/1 (\S+)$/))){chunks.push(m[1]);seen=true;}else if(seen&&/^CD35\/1/.test(t))chunks.push(t.slice(7).replace(/\s+/g,''));}
 if(!seen)return null;const json=chunks.join('');if(!end||json.length!==end.len||fnv(json)!==end.hash)return null;
 try{const o=JSON.parse(json);return o&&o.days?o.days:null;}catch(e){return null;}}
// the readable lines: "Day n · …" then "m:ss kind arg · …"
function readHuman(text){const days={};let cur=null;
 for(const raw of String(text).split('\n')){const t=raw.replace(/\r$/,'').replace(/^(\s*>)+\s?/,'').trim();let m;
  if((m=t.match(/^Day (\d+) · /))){cur=days[m[1]]={events:[]};continue;}
  if(cur&&/^\d+:\d\d /.test(t))for(const p of t.split(' · ')){const q=p.match(/^(\d+):(\d\d) (\S+)/);if(q)cur.events.push([+q[1]*60+ +q[2],q[3]]);}}
 return Object.keys(days).length?days:null;}
const mmss=s=>Math.floor(s/60)+':'+String(Math.round(s)%60).padStart(2,'0');
function quiet(days,opt){const out=[];const a=(opt.from-7.5)*60,b=(opt.to-7.5)*60;
 for(const n of Object.keys(days).map(Number).filter(Number.isFinite).sort((x,y)=>x-y)){const r=days[String(n)];if(!r||!Array.isArray(r.events)||!r.events.length){out.push({day:n,stretches:[],note:'no events'});continue;}
  const ev=r.events.map(e=>Array.isArray(e)?{t:+e[0],k:e[1]}:{t:+e.t,k:e.k}).filter(e=>Number.isFinite(e.t)).sort((x,y)=>x.t-y.t);const t0=ev[0].t,lo=t0+a,hi=t0+b;
  const pts=[lo].concat(ev.map(e=>e.t).filter(t=>t>lo&&t<hi),[hi]);const st=[];
  for(let k=1;k<pts.length;k++){const from=pts[k-1],to=pts[k];if(to>from)st.push({from:from-t0,to:to-t0,secs:to-from});}
  st.sort((x,y)=>y.secs-x.secs||x.from-y.from);out.push({day:n,stretches:st.slice(0,opt.top)});}
 return out;}
const clock=s=>{const h=7.5+s/60,hh=Math.floor(h),mm=Math.round((h-hh)*60);return String(hh+(mm===60?1:0)).padStart(2,'0')+':'+String(mm%60).padStart(2,'0');};
function main(argv){const opt={from:10.5,to:18,top:3,json:false};const files=[];
 for(let i=0;i<argv.length;i++){const a=argv[i];if(a==='--json')opt.json=true;else if(a==='--from')opt.from=+argv[++i];else if(a==='--to')opt.to=+argv[++i];else if(a==='--top')opt.top=Math.max(1,+argv[++i]|0);else files.push(a);}
 const text=(files.length?files:['-']).map(f=>f==='-'?fs.readFileSync(0,'utf8'):fs.readFileSync(f,'utf8')).join('\n');
 const days=readBlock(text)||readHuman(text);if(!days){process.stderr.write('No day log found (paste the Menu\'s "Copy timeline and days").\n');return 1;}
 const res=quiet(days,opt);
 if(opt.json){process.stdout.write(JSON.stringify(res)+'\n');return 0;}
 const lines=[`Quiet stretches between ${clock((opt.from-7.5)*60)} and ${clock((opt.to-7.5)*60)} (real seconds of played time, longest first)`];
 for(const d of res)lines.push(`Day ${d.day}: `+(d.stretches.length?d.stretches.map(s=>`${mmss(s.secs)} (about ${clock(s.from)} to ${clock(s.to)})`).join(' · '):(d.note||'none')));
 process.stdout.write(lines.join('\n')+'\n');return 0;}
module.exports={readBlock,readHuman,quiet,main};
if(require.main===module)process.exitCode=main(process.argv.slice(2));

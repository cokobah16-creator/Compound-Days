/* v42: Needs and aspirations. The household's own life-sim layer: needs that run down through the day and are filled by
   living (eating, playing, talking, a comfortable flat), a mood that follows them and changes how things go, and the
   aspiration each player chose in the creator turned into daily wants, one fear, and a long goal with milestones.
   One module, object NEEDS42, loaded after bonds-v41.js. It wraps ACTIONS.eat, ACTIONS.lifeReel, ACTIONS.lifeSell,
   ACTIONS.lifeCatch, finishCook, talk, openLife34, ACTIONS.nextday and EVENING35.tick, and calls the originals. It pushes
   no hook. Everything else it learns by watching the household's own counters once a second (dishes cooked, parties held,
   matches played, the evening gist, harvests, decorating, photographs, a neighbour helped).

   Needs (0-100, per player): hunger, fun, social, comfort; energy is the base game's own. Each game hour hunger falls 4,
   fun 3, social 2.5, and comfort falls 2 away from the flat and rises at home with how furnished it is. The felt mood is
   the base game's mood (cheer(), wants met, fears) and the average of the five, half each; the base field is never
   overwritten. Mood matters: a cheerful cook adds to a dish, a low one
   takes away; neighbours notice when someone is hungry, lonely, bored or worn out; a need falling low gets one toast.

   Aspirations (ASPIRATIONS in the base): every morning each player gets three wants (two from their aspiration, one
   general) and one fear. A want met: +10 mood and aspiration points (2 for an aspiration want, 1 for a general one). A
   fear met: -12 mood. Points climb four milestones per aspiration, each with an album memory and, at the third, a perk.

   Starts on the first new morning after this build loads (nothing is written before Sleep), never in online play. Save
   field S.needs42, additive. */
const NEEDS42={
 on:true,
 KEYS:['hunger','fun','social','comfort'],
 NAME:{hunger:'Hunger',fun:'Fun',social:'Social',comfort:'Comfort',energy:'Energy'},
 DECAY:{hunger:4,fun:3,social:2.5,comfort:2},      // per game hour
 LOW:25,                                          // a toast once when a need falls below this
 MAX_DT:4,                                        // the most game hours one step may count (a long panel, a skip)
 FILL:{eat:{hunger:45,social:8},party:{social:40,fun:25,hunger:30},cook:{fun:10},catch:{fun:8},talk:{social:12,fun:3},gist:{social:30,fun:15},
  football:{fun:30,social:10},decorate:{fun:5,comfort:6},harvest:{fun:6},help:{social:10},photo:{fun:8},shell:{fun:3},water:{comfort:2}},
 WANT_MOOD:10, FEAR_MOOD:-12,
 MILESTONES:[5,12,22,35],
 state:{t:0,snap:null,lowSaid:{}}
};
NEEDS42.LINES={
 low:{hunger:'{name} is getting hungry.',fun:'{name} is bored. Something fun would help.',social:'{name} is lonely. A chat would help.',comfort:'{name} wants to be somewhere comfortable.'},
 notice:{
  hunger:{tunde:'You look hungry. My plants eat better than you, and they eat sunlight.',nkechi:'Have you eaten? Do not lie to me. I can see it.',ada:'Go and eat. You cannot think on an empty stomach. I have tried.',bassey:'Eat something first. Hungry people make terrible photographs.',oyelaran:'You are hungry. It shows. Go and eat, then come back.'},
  social:{tunde:'You have been quiet. Too quiet. Come and gist sometimes.',nkechi:'You have been hiding in that flat. People are asking.',ada:'You look like you need company. Sit, I will not make you sand anything.',bassey:'Ah, a face! Stay a minute. Talk to an old man.',oyelaran:'You do not come out much. The compound is better when you do.'},
  fun:{tunde:'You look bored. Go and kick that ball with the children.',nkechi:'Your face says the day is long. Go to the water, catch something.',ada:'You need something to do with your hands. Trust me.',bassey:'Bored? Take a photograph of something you have never looked at properly.',oyelaran:'Do something for fun today. It is not against the rules. I checked.'},
  energy:{tunde:'You are tired. Even my plants rest.',nkechi:'Go and sleep. The shop will still be here tomorrow.',ada:'Rest. Tired hands make crooked joints.',bassey:'You look the way I felt after a three-day wedding.',oyelaran:'Bed. Early. That is not a suggestion.'}},
 cook:{up:'Cooked in a good mood. It shows in the pot.',down:'Nobody was in the mood. The dish knows.'},
 wantDone:'{name}: “{want}” done.',
 fearHit:'{name}: {fear}',
 levelUp:'{name}: {title}'
};
/* wants: ev is the event, n how many, who a neighbour for talk wants */
NEEDS42.WANTS={
 general:[{id:'g-talk3',ev:'talkK',n:3,text:'Talk to three different neighbours'},{id:'g-eat',ev:'eat',n:1,text:'Eat together'},{id:'g-catch',ev:'catch',n:1,text:'Catch a fish'},{id:'g-help',ev:'help',n:1,text:'Help a neighbour with what they need'}],
 quiet:[{id:'q-water',ev:'water',n:1,text:'Water the pepper pot'},{id:'q-decor',ev:'decorate',n:1,text:'Put something new in its place'},{id:'q-shell',ev:'shell',n:2,text:'Find two shells on the beach'},{id:'q-buy',ev:'buy',n:1,text:'Bring something home from Finds'},{id:'q-harvest',ev:'harvest',n:1,text:'Harvest the peppers'}],
 stall:[{id:'s-cook',ev:'cook',n:1,text:'Cook something'},{id:'s-cook2',ev:'cook',n:2,text:'Cook two dishes'},{id:'s-catch2',ev:'catch',n:2,text:'Catch two fish for the pot'},{id:'s-sell',ev:'sell',n:1,text:'Sell something you caught or grew'},{id:'s-tastenk',ev:'talk:nkechi',n:1,text:'Talk food with Mama Nkechi'}],
 studio:[{id:'p-photo',ev:'photo',n:1,text:'Take a photograph'},{id:'p-bassey',ev:'talk:bassey',n:1,text:'Ask Mr. Bassey about light'},{id:'p-shell',ev:'shell',n:1,text:'Find a shell worth photographing'},{id:'p-gist',ev:'gist',n:1,text:'Be at the rail for the evening gist'},{id:'p-catch',ev:'catch',n:1,text:'Catch something with good colours'}],
 host:[{id:'h-gist',ev:'gist',n:1,text:'Be at the rail for the evening gist'},{id:'h-talk3',ev:'talkK',n:3,text:'Talk to three different neighbours'},{id:'h-help',ev:'help',n:1,text:'Help a neighbour'},{id:'h-cook',ev:'cook',n:1,text:'Cook something to share'},{id:'h-party',ev:'party',n:1,text:'Host the housewarming'}],
 maker:[{id:'m-decor',ev:'decorate',n:1,text:'Rearrange something in the flat'},{id:'m-ada',ev:'talk:ada',n:1,text:'Talk shop with Ada'},{id:'m-shell',ev:'shell',n:2,text:'Find two shells for a project'},{id:'m-buy',ev:'buy',n:1,text:'Find a piece at Finds'},{id:'m-help',ev:'help',n:1,text:'Help a neighbour with something'}]
};
NEEDS42.FEARS=[
 {id:'f-hungry',text:'Going to bed hungry',test:(i,N)=>N.p[i].hunger<20,said:'went to bed hungry.'},
 {id:'f-lonely',text:'A whole day without talking to a neighbour',test:(i,N)=>!needsTalked42(N,i).length,said:'went a whole day without talking to anyone.'},
 {id:'f-bored',text:'A day with nothing fun in it',test:(i,N)=>N.p[i].fun<20,said:'had a day with nothing fun in it.'},
 {id:'f-broke',text:'The purse running under ₦1,000',test:(i,N)=>N.day.minMoney!=null&&N.day.minMoney<1000,said:'watched the purse run under ₦1,000.'}];
NEEDS42.TITLES={
 quiet:['A tidy corner','A home that breathes','The calm flat on the courtyard','Palm Court’s garden flat'],
 stall:['People ask what you cooked','A dish with your name on it','Neighbours queue at your door','The compound’s favourite cook'],
 studio:['An eye for light','Photographs on the wall','People ask you to take their picture','The compound’s photographer'],
 host:['A welcoming door','The flat people drop by','Everybody’s evening spot','The heart of Palm Court'],
 maker:['Hands that fix things','A corner for making','Things in the flat you shaped','A workshop of your own']};
NEEDS42.PERK={quiet:'Comfort rises twice as fast at home.',stall:'Dishes you cook are a little better.',studio:'Photographs lift fun twice as much.',host:'Talking fills social half as much again.',maker:'Decorating lifts fun and comfort twice as much.'};

/* ---------- state ---------- */
function needsOn42(){return NEEDS42.on&&typeof S!=='undefined'&&S&&S.phase==='play'&&S.p&&!(typeof NET!=='undefined'&&NET.on);}
function needsSilent42(){try{return typeof silentMode==='function'&&silentMode();}catch(e){return false;}}
function needs42(create){if(!needsOn42())return null;
 if(!S.needs42||typeof S.needs42!=='object'){if(!create)return null;
  S.needs42={v:1,since:S.day,p:[0,1].map(()=>({hunger:70,fun:70,social:70,comfort:70})),asp:[0,1].map(()=>({pts:0,lvl:0})),day:null,t:{day:S.day,time:S.time}};}
 return S.needs42;}
function needsHash42(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function needsAsp42(i){const a=S.p[i]&&S.p[i].aspiration;return NEEDS42.WANTS[a]?a:'host';}
function needsName42(i){return (S.p[i]&&S.p[i].name)||((typeof AI!=='undefined'&&AI.on&&AI.i===i)?'Your companion':(i?'Player 2':'Player 1'));}
function needsClamp42(v){return Math.max(0,Math.min(100,Math.round(v*1e6)/1e6));}
/* the day's wants and fear for both players, rolled once per day from a hash of the household and the day */
function needsRoll42(N){const seed=(S.household||'')+'|'+N.since+'|'+S.day;
 const pick=(arr,n,salt,avoid)=>{const out=[];let k=needsHash42(seed+'|'+salt)%arr.length;for(let t=0;out.length<n&&t<arr.length*2;t++){const w=arr[(k+t)%arr.length];if(!out.includes(w)&&!(avoid||[]).some(x=>x.ev===w.ev))out.push(w);}return out;};
 N.day={d:S.day,talkK:[[],[]],minMoney:S.money,w:[0,1].map(i=>{const a=needsAsp42(i);const mine=pick(NEEDS42.WANTS[a],2,'a'+i);const gen=pick(NEEDS42.WANTS.general,1,'g'+i,mine);
   return mine.map(w=>({id:w.id,ev:w.ev,n:w.n,text:w.text,asp:true,c:0,done:false})).concat(gen.map(w=>({id:w.id,ev:w.ev,n:w.n,text:w.text,asp:false,c:0,done:false})));}),
  f:[0,1].map(i=>{const f=NEEDS42.FEARS[needsHash42(seed+'|f'+i)%NEEDS42.FEARS.length];return {id:f.id,hit:false};})};
 }
// the neighbours one player has talked to today (each player keeps their own list)
function needsTalked42(N,i){const t=N.day.talkK;if(!Array.isArray(t[0]))N.day.talkK=[[],[]];return N.day.talkK[i]||(N.day.talkK[i]=[]);}

/* ---------- events ---------- */
// one thing happened: fill needs (for one player or the whole household), then count it toward today's wants
function needsEvent42(ev,who,arg){const N=needs42(false);if(!N||!N.day||N.day.d!==S.day)return;const players_=who==null?[0,1]:[who];
 const fill=NEEDS42.FILL[ev]||{};
 for(const i of players_){const P=N.p[i];if(!P)continue;const a=needsAsp42(i),perk=N.asp[i].lvl>=3;
  for(const k in fill){let v=fill[k];if(perk&&a==='host'&&ev==='talk'&&k==='social')v*=1.5;if(perk&&a==='studio'&&ev==='photo')v*=2;if(perk&&a==='maker'&&ev==='decorate')v*=2;P[k]=needsClamp42(P[k]+v);if(P[k]>=NEEDS42.LOW+10)NEEDS42.state.lowSaid[i+k]=false;}}
 if(ev==='talk'&&arg&&who!=null){const t=needsTalked42(N,who);if(!t.includes(arg))t.push(arg);}
 const evs=[ev];if(ev==='talk'){evs.push('talk:'+arg);}
 for(const i of players_.length===1&&ev!=='talk'?[0,1]:players_)for(const w of N.day.w[i]){if(w.done)continue;
  if(w.ev==='talkK'){if(ev!=='talk')continue;w.c=needsTalked42(N,i).length;}else if(evs.includes(w.ev))w.c++;else continue;
  if(w.c>=w.n)needsWantDone42(N,i,w);}}
function needsWantDone42(N,i,w){w.done=true;w.c=w.n;try{cheer(i,NEEDS42.WANT_MOOD);}catch(e){}const A=N.asp[i];A.pts+=w.asp?2:1;
 const lvl=NEEDS42.MILESTONES.filter(m=>A.pts>=m).length;
 if(lvl>A.lvl){A.lvl=lvl;const title=NEEDS42.TITLES[needsAsp42(i)][lvl-1];try{remember(needsName42(i)+': '+title+'.','moment');}catch(e){}
  needsToast42(NEEDS42.LINES.levelUp.replace('{name}',needsName42(i)).replace('{title}',title)+(lvl===3?' '+NEEDS42.PERK[needsAsp42(i)]:''));}
 else needsToast42(NEEDS42.LINES.wantDone.replace('{name}',needsName42(i)).replace('{want}',w.text));}
function needsToast42(t){if(needsSilent42())return;try{toast(t);}catch(e){}}

/* ---------- the clock: decay, comfort at home, mood, watched counters ---------- */
function needsCounters42(){const l=typeof life34==='function'&&S.life?S.life:null;let cooked=0;for(const k in (S.cooked||{}))cooked+=S.cooked[k]|0;
 let helped=0;if(S.bonds41)for(const k in S.bonds41.nb){const w=S.bonds41.nb[k].want;if(w&&w.done&&w.day===S.day)helped++;}
 return {cooked,party:(S.flags&&S.flags.parties)|0,football:(l&&l.football37&&l.football37.played)|0,gist:(typeof GIST38!=='undefined'&&GIST38.seen===S.day)?1:0,
  harvest:(l&&l.crop&&l.crop.harvests)|0,water:(l&&l.crop&&l.crop.waterings)|0,decorate:(l&&l.metrics&&l.metrics.decorated)|0,shell:(l&&l.shells)|0,
  photo:(S.memories||[]).filter(m=>m.kind==='photo').length,buy:(l&&l.orders)?Object.keys(l.orders).length:0,help:helped,day:S.day};}
function needsWatch42(){const now=needsCounters42(),was=NEEDS42.state.snap;NEEDS42.state.snap=now;if(!was||was.day!==now.day)return;
 for(const k of ['cooked','party','football','gist','harvest','water','decorate','buy','help','photo']){const d=now[k]-was[k];if(d>0)for(let j=0;j<Math.min(d,3);j++)needsEvent42(k==='cooked'?'cook':k,null);}
 if(now.shell>was.shell)needsEvent42('shell',null);}
// the felt mood: the base game's mood (cheer, wants met, fears) and the needs together, half each; the base field is never overwritten
function needsMood42(i){const N=needs42(false),m=(S.p[i]&&S.p[i].mood)|0;if(!N||!N.p[i])return m;const P=N.p[i];return Math.round((m+(P.hunger+P.fun+P.social+P.comfort+((S.p[i].energy)|0))/5)/2);}
function needsComfortRate42(){const n=(S.home&&S.home.items||[]).length;return Math.min(8,2+n/3);}
function needsStep42(dh){const N=needs42(false);if(!N)return;
 for(const i of [0,1]){const P=N.p[i],pl=(typeof players!=='undefined'?players:[]).find(p=>p.i===i);if(!P)continue;
  for(const k of ['hunger','fun','social'])P[k]=needsClamp42(P[k]-NEEDS42.DECAY[k]*dh);
  const home=pl&&typeof inFlat==='function'&&inFlat(pl.g.position.x,pl.g.position.z);
  const perk=N.asp[i].lvl>=3&&needsAsp42(i)==='quiet';P.comfort=needsClamp42(P.comfort+(home?needsComfortRate42()*(perk?2:1):-NEEDS42.DECAY.comfort)*dh);
  for(const k of NEEDS42.KEYS){if(P[k]<NEEDS42.LOW&&!NEEDS42.state.lowSaid[i+k]){NEEDS42.state.lowSaid[i+k]=true;if(i===0||!(typeof AI!=='undefined'&&AI.on&&AI.i===i))needsToast42(NEEDS42.LINES.low[k].replace('{name}',needsName42(i)));}}}
}
function needsTick42(dt){if(!needsOn42()||!S.needs42)return;const st=NEEDS42.state;st.t+=dt;if(st.t<1)return;st.t=0;const N=S.needs42;
 if(!N.day||N.day.d!==S.day)needsRoll42(N);
 const t=N.t||{day:S.day,time:S.time};let dh=t.day===S.day?S.time-t.time:0;N.t={day:S.day,time:S.time};
 if(dh>0)needsStep42(Math.min(dh,NEEDS42.MAX_DT));N.day.minMoney=Math.min(N.day.minMoney==null?S.money:N.day.minMoney,S.money);needsWatch42();}
// wrap: the per-frame step rides on EVENING35.tick, as v40's and v41's do, so the pinned TICK_HOOKS list stays as it is
if(typeof EVENING35!=='undefined'&&typeof EVENING35.tick==='function'){const prevEveTick42=EVENING35.tick;EVENING35.tick=function(dt){const r=prevEveTick42.apply(this,arguments);try{needsTick42(dt);}catch(e){}return r;};}

/* ---------- direct events ---------- */
// wrap: eating together fills hunger for both
const eat42=ACTIONS.eat;ACTIONS.eat=function(d){const had=S&&S.dishes&&S.dishes[+d.ix];const r=eat42.apply(this,arguments);try{if(had)needsEvent42('eat',null);}catch(e){}return r;};
// wrap: a reel that lands a fish is fun for the one fishing
const reel42=ACTIONS.lifeReel;ACTIONS.lifeReel=function(){const l=S&&S.life,before=l&&l.metrics?l.metrics.caught:0,i=typeof LIFE34!=='undefined'&&LIFE34.fish?LIFE34.fish.i:0;const r=reel42.apply(this,arguments);try{if(S.life&&S.life.metrics.caught>before)needsEvent42('catch',i|0);}catch(e){}return r;};
// wrap: selling a catch or a harvest counts toward a stall want
const sell42=ACTIONS.lifeSell;ACTIONS.lifeSell=function(){const m=S&&S.money;const r=sell42.apply(this,arguments);try{if(S.money>m)needsEvent42('sell',null);}catch(e){}return r;};
const catch42=ACTIONS.lifeCatch;ACTIONS.lifeCatch=function(d){const m=S&&S.money;const r=catch42.apply(this,arguments);try{if(d&&d.v==='sell'&&S.money>m)needsEvent42('sell',null);}catch(e){}return r;};
// wrap: the cook's mood goes into the dish (and the stall perk adds a little more)
const cook42=finishCook;finishCook=function(){const before=S&&S.dishes?S.dishes.length:0;const r=cook42.apply(this,arguments);
 try{const N=needs42(false);if(N&&S.dishes.length>before){const d=S.dishes[S.dishes.length-1];const moods=both().map(i=>needsMood42(i)),avg=moods.reduce((a,b)=>a+b,0)/moods.length;
  let b=avg>=75?3:avg<35?-4:0;if(both().some(i=>N.asp[i].lvl>=3&&needsAsp42(i)==='stall'))b+=3;
  if(b){d.quality=Math.max(40,Math.min(96,d.quality+b));if(!needsSilent42()&&(avg>=75||avg<35)){try{panel.insertAdjacentHTML('beforeend',`<p class="small needs42-cook">${esc(avg>=75?NEEDS42.LINES.cook.up:NEEDS42.LINES.cook.down)}</p>`);}catch(e){}}}}}catch(e){}return r;};
// wrap: a talk fills social for the one talking; a neighbour notices a need that is low (outside lines_talk35 and bonds-v41, still underneath)
const talk42=talk;talk=function(i,k){/* outside lines_talk35 (the v35 lines wrapper, still underneath) */let out=talk42.apply(this,arguments);
 try{const N=needs42(false);if(N&&!needsSilent42()&&CAST[k]){const P=N.p[i];const low=['hunger','social','fun'].filter(x=>P[x]<NEEDS42.LOW).sort((a,b)=>P[a]-P[b])[0]||((S.p[i].energy|0)<NEEDS42.LOW?'energy':null);
  const L=low&&NEEDS42.LINES.notice[low]&&NEEDS42.LINES.notice[low][k];if(L)out+=say(k,esc(L));needsEvent42('talk',i,k);}}catch(e){}return out;};

/* ---------- a new morning: fears are judged, the night does its work, the day's wants are rolled ---------- */
const nextday42=ACTIONS.nextday;ACTIONS.nextday=function(){let hits=[];
 try{const N=needs42(false);if(N&&N.day&&N.day.d===S.day){for(const i of both()){const f=N.day.f[i],F=NEEDS42.FEARS.find(x=>x.id===f.id);if(F&&!f.hit&&F.test(i,N)){f.hit=true;hits.push([i,F]);}}}}catch(e){}
 const r=nextday42.apply(this,arguments);
 try{const N=needs42(true);if(N){for(const [i,F] of hits){S.p[i].mood=Math.max(0,(S.p[i].mood|0)+NEEDS42.FEAR_MOOD);}
  const bed=typeof placed==='function'&&placed('bed');for(const i of [0,1]){const P=N.p[i];P.hunger=needsClamp42(P.hunger-20);P.social=needsClamp42(P.social-5);P.comfort=needsClamp42(P.comfort+(bed?25:12));}
  N.t={day:S.day,time:S.time};needsRoll42(N);NEEDS42.state.snap=null;save();
  // the earlier wrappers opened Today before the new morning was rolled: draw it again with today's wants
  try{if(!needsSilent42()&&typeof overlayOpen==='function'&&overlayOpen()&&panel.classList.contains('life-panel34')&&LIFE34.tab==='today')openLife34('today');}catch(e){}
  if(hits.length&&!needsSilent42())setTimeout(()=>{try{toast(hits.map(([i,F])=>NEEDS42.LINES.fearHit.replace('{name}',needsName42(i)).replace('{fear}',F.said)).join(' '));}catch(e){}},4200);}}catch(e){}
 return r;};

/* ---------- Today: needs bars, mood, the aspiration and the day's wants and fear ---------- */
function needsBar42(k,v){const tone=v<NEEDS42.LOW?'low':v<55?'mid':'ok';return `<div class="needs42-bar ${tone}"><span>${esc(NEEDS42.NAME[k])}</span><i><b style="width:${Math.round(v)}%"></b></i></div>`;}
function needsMoodWord42(m){return m>=80?'Glowing':m>=60?'Content':m>=40?'So-so':m>=20?'Low':'Miserable';}
function needsTodayHTML42(){const N=needs42(false);if(!N||!N.day)return `<div class="needs42"><p class="life-kicker">HOW YOU ARE</p><p class="small muted">From tomorrow morning: your needs, your mood and what each of you wants from the day.</p></div>`;
 return `<div class="needs42"><p class="life-kicker">HOW YOU ARE</p>${both().map(i=>{const P=N.p[i],A=N.asp[i],a=needsAsp42(i),asp=ASPIRATIONS.find(x=>x.id===a);const next=NEEDS42.MILESTONES[A.lvl],prev=A.lvl?NEEDS42.MILESTONES[A.lvl-1]:0;
  const fear=NEEDS42.FEARS.find(x=>x.id===N.day.f[i].id);
  return `<article class="life-card34 needs42-card"><span class="life-label34">${esc(needsName42(i))} · ${esc(needsMoodWord42(needsMood42(i)))}</span>
  <div class="needs42-bars">${NEEDS42.KEYS.map(k=>needsBar42(k,P[k])).join('')}${needsBar42('energy',S.p[i].energy|0)}</div>
  <p class="small"><b>${esc(asp?asp.name:'')}</b><br><span class="muted">${A.lvl?esc(NEEDS42.TITLES[a][A.lvl-1]):'Just starting'}${next?` · ${A.pts-prev}/${next-prev} to “${esc(NEEDS42.TITLES[a][A.lvl])}”`:''}</span></p>
  <ul class="needs42-wants">${N.day.w[i].map(w=>`<li class="${w.done?'done':''}">${w.done?'✓':'○'} ${esc(w.text)}${w.n>1&&!w.done?` <span class="muted">${w.c}/${w.n}</span>`:''}</li>`).join('')}<li class="fear">⚠ Fear: ${esc(fear.text)}</li></ul></article>`;}).join('')}</div>`;}
// wrap: the Today page gains "How you are" under its hero
const openLife42=openLife34;openLife34=function(tab){const r=openLife42.apply(this,arguments);try{if(needsOn42()&&!needsSilent42()&&LIFE34.tab==='today'){const sec=panel.querySelector&&panel.querySelector('.life34');
 const at=sec&&sec.querySelector&&(sec.querySelector('.life-chips34')||sec.querySelector('.life-hero34'));if(at)at.insertAdjacentHTML('afterend',needsTodayHTML42());}}catch(e){}return r;};

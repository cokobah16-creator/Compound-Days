/* v43: Happenings and festivals. Every morning Palm Court has something going on: a wedding next door, the light going
   off at night, a goat loose in the courtyard, the boats coming in heavy. Saturdays are market day, and the last day
   of each season is a festival the whole compound gets ready for. The world starts these by itself: at the
   happening's hour the neighbour it belongs to calls it out, wherever you are. Each happening has one small thing to do
   and a keepsake for doing it; the keepsakes fill a book in the Almanac, and some only turn up in one season.
   One module, object HAPPEN43, loaded after needs-v42.js. It wraps ACTIONS.eat, talk, openLife34, ACTIONS.nextday and
   EVENING35.tick, and calls the originals. It pushes no hook. The rest it learns by watching the household's own
   counters once a second (cooking, catches, the gist, football, harvests, shells, photographs, decorating, buying,
   helping), the same counters v42 reads.

   Rewards are friendship, an album memory and the keepsake, never cash, and never the base mood (other checks pin it).
   A festival also lifts the household's fun and social (v42's needs) and, with full preparations, gives every
   neighbour a little more friendship.

   A day's happening goes live once the household has seen it on the Today page (which opens by itself every morning):
   until then nobody calls it out, its goal does not count and its festival does not open. The season's festival
   preparations count either way.

   Starts on the first new morning after this build loads (nothing is written before Sleep), never in online play.
   Save field S.happen43, additive. */
const HAPPEN43={
 on:true,
 REPEAT:8,            // a happening does not come back within this many days
 FEST_AT:18.5,        // the festival starts at half past six
 FEST_UNTIL:23,       // and waits for you until eleven
 state:{t:0,snap:null}
};
/* ev is the counted event (as v42 names them, plus talk:<neighbour>, talkK distinct neighbours, eat, catch, fest);
   at is the hour the neighbour calls it out; season limits it to one season */
HAPPEN43.POOL=[
 {id:'wedding',who:'oyelaran',at:12,title:'A wedding next door',text:'Mrs. Oyelaran’s cousin is getting married on the next street. The music will start at noon and it will not stop.',
  knock:'The wedding has started. Can you hear it? Send something over for the pot.',line:'My cousin’s daughter. The aso-ebi is green and gold. I did not choose it. Nobody asked me.',
  goal:{ev:'cook',n:1,text:'Cook a dish to send over to the wedding'},keep:'A green and gold aso-ebi ribbon'},
 {id:'lightoff',who:'tunde',at:19,title:'Light off tonight',text:'The word on the street is that the light will go tonight. When it goes, the whole compound comes outside.',
  knock:'The light has gone. Everybody outside! Come to the rail.',line:'When the light goes, the stars come out. And Mr. Bassey’s stories. Mostly the stories.',
  goal:{ev:'gist',n:1,text:'Join the neighbours at the rail in the dark'},keep:'A candle stub from the night the light went'},
 {id:'goat',who:'tunde',at:10.5,title:'A goat in the courtyard',text:'Somebody’s goat got in overnight. It has eaten half of Tunde’s calendar and is looking at his plants.',
  knock:'There is a goat looking at my plants. Somebody come and talk me down.',line:'It ate March and April. I do not know what day it is any more. Neither does the goat.',
  goal:{ev:'talk:tunde',n:1,text:'Go and calm Tunde down about the goat'},keep:'A chewed corner of Tunde’s calendar'},
 {id:'boats',who:'bassey',at:9,title:'The boats came in heavy',text:'The fishermen had a big night. The water is full of fish this morning and the gulls know it.',
  knock:'The boats came in heavy. The fish are biting at the shore. Go now, before the gulls.',line:'Forty years I have watched the boats. A heavy morning still makes me smile.',
  goal:{ev:'catch',n:2,text:'Catch two fish while they are biting'},keep:'A fisherman’s knot, tied for you'},
 {id:'sister',who:'ada',at:11,title:'Ada’s sister is visiting',text:'Ada’s younger sister has come from Ibadan for the day. Ada has been sweeping since six.',
  knock:'My sister is here. Come and say hello so she sees I have friends.',line:'She says I work too much. I told her I am working on a friendship. She laughed. Rude.',
  goal:{ev:'talk:ada',n:1,text:'Go and meet Ada’s sister'},keep:'A small carved spoon from Ada’s sister'},
 {id:'match',who:'tunde',at:16,title:'Big match on the radio',text:'There is a big match this afternoon. Kemi and Emeka want to play their own before it starts.',
  knock:'The match is at five. Kemi and Emeka are already at the pitch. Go and play!',line:'If we lose today I am not talking to anybody until Tuesday.',
  goal:{ev:'football',n:1,text:'Play a match with Kemi and Emeka'},keep:'A torn match ticket stub'},
 {id:'naming',who:'nkechi',at:10,title:'A naming ceremony',text:'Mama Nkechi’s niece has had a baby girl. The naming is this evening, and you cannot come empty-handed.',
  knock:'The naming is tonight. Bring a little something from Finds. Not money. Something.',line:'Seven pounds. Loud already. She will run this street one day.',
  goal:{ev:'buy',n:1,text:'Bring home something from Finds as a gift'},keep:'A little bag of sweets from the naming'},
 {id:'camera',who:'bassey',at:15,title:'Mr. Bassey found his old camera',text:'Mr. Bassey found his first camera in a box under the bed. He wants to see someone young use a camera properly.',
  knock:'I found my old camera! Take a picture today. Show me what you see.',line:'This camera saw my wedding, my children and three coups. Be gentle with it.',
  goal:{ev:'photo',n:1,text:'Take a photograph for Mr. Bassey'},keep:'A faded print from Mr. Bassey’s first camera'},
 {id:'tide',who:'bassey',at:13,title:'A very low tide',text:'The tide has gone out further than anyone remembers. The beach is covered in shells.',
  knock:'The tide is out further than I have ever seen it. Go and look at the shells before it comes back.',line:'Low tides like this come a few times a year. The sea is showing off.',
  goal:{ev:'shell',n:2,text:'Find two shells on the low-tide beach'},keep:'A perfect spiral shell'},
 {id:'school',who:'nkechi',at:13,title:'School’s out early',text:'The teachers have a meeting, so the children are home early and everybody’s errands are late.',
  knock:'The children are home and I have three customers. Somebody help a neighbour, please.',line:'Half a day of school and a full day of noise. I love them. I need a nap.',
  goal:{ev:'help',n:1,text:'Help a neighbour with what they need'},keep:'A chalk drawing the children made of you'},
 {id:'birthday',who:'tunde',at:17,title:'Tunde’s birthday (he says)',text:'Tunde says today is his birthday. Last year he said it was in March. Nobody argues.',
  knock:'It is my birthday. Officially. Somebody should eat with somebody to celebrate.',line:'Twenty-nine again. It is a good age. I am keeping it.',
  goal:{ev:'eat',n:1,text:'Share a meal in Tunde’s honour'},keep:'A paper crown, slightly squashed'},
 {id:'parrot',who:'bassey',at:11.5,title:'A parrot on the roof',text:'A green parrot is sitting on the water tank and saying “Bassey!” over and over. Mr. Bassey says he has never seen it before.',
  knock:'There is a parrot saying my name. I need a witness. Come and talk to me.',line:'I have never owned a parrot. But somebody taught it my name. I want to know who.',
  goal:{ev:'talk:bassey',n:1,text:'Go and see the parrot with Mr. Bassey'},keep:'A green feather'},
 {id:'gossip',who:'oyelaran',at:12.5,title:'News travels',text:'Something happened on the next street and nobody knows exactly what. Everybody has a different version.',
  knock:'Have you heard? No? Go round and ask. Everybody has a piece of it.',line:'I heard it was a goat. Tunde heard it was a wedding. We are both probably right.',
  goal:{ev:'talkK',n:3,text:'Hear the news from three different neighbours'},keep:'A scrap of paper with the whole story on it'},
 {id:'landlord',who:'oyelaran',at:10,title:'The landlord is coming',text:'The landlord is visiting today. Mrs. Oyelaran wants every flat looking cared for.',
  knock:'The landlord is on his way. Make the flat look loved. Move something, at least.',line:'He will look at the gutters and say “hmm”. He always says “hmm”.',
  goal:{ev:'decorate',n:1,text:'Make the flat look cared for'},keep:'The landlord’s “hmm”, written on a receipt'},
 /* one season only: the rare ones */
 {id:'storm',season:'rains',who:'tunde',at:14,title:'Storm coming',text:'The sky over the water has gone a heavy grey. The fish always bite just before the rain.',
  knock:'Storm in an hour. The fish bite before the rain. Go now!',line:'My plants are excited. I am less excited. My window does not close.',
  goal:{ev:'catch',n:1,text:'Catch a fish before the storm'},keep:'A pebble polished by the storm',effect:'storm'},
 {id:'mangoes',season:'dry',who:'nkechi',at:10,title:'Mangoes everywhere',text:'The tree behind the shop dropped half its mangoes overnight. Mama Nkechi wants them gone before they rot.',
  knock:'Mangoes! Too many! Take some round to the neighbours.',line:'Every year the tree does this. Every year I say I will make chutney. Every year I do not.',
  goal:{ev:'talkK',n:3,text:'Pass mangoes around to three neighbours'},keep:'A washed mango seed, drying in the sun'},
 {id:'dust',season:'harmattan',who:'oyelaran',at:9.5,title:'Dust on everything',text:'The harmattan wind blew all night. There is fine red dust on every surface in the compound.',
  knock:'Dust! Everywhere! Give your flat a proper clean today. Move things. Shake things.',line:'Every year the desert visits. It never brings a gift. Only dust.',
  goal:{ev:'decorate',n:1,text:'Give the flat a harmattan clean'},keep:'A small palm-frond broom'},
 {id:'bonfire',season:'harmattan',who:'bassey',at:18,title:'A cold harmattan night',text:'It is the coldest night of the year so far. Somebody has lit a fire in a tin drum by the rail.',
  knock:'There is a fire by the rail. Come and warm your hands. Bring a story.',line:'In harmattan you can see your breath. And everyone’s secrets come out by the fire.',
  goal:{ev:'gist',n:1,text:'Warm your hands at the fire by the rail'},keep:'A spark-scorched piece of firewood'}
];
HAPPEN43.MARKET={id:'market',who:'nkechi',at:9,title:'Market day',text:'It is Saturday. The road is louder than usual, the sellers have come in from the villages, and Finds has new things.',
 knock:'Market day! Go and see what came in. Bring something home.',line:'Saturday is the only day I make real money. Also the only day I sit down. Strange.',
 goal:{ev:'buy',n:1,text:'Bring something home from Finds'},keep:'A market-day token from the sellers'};
/* each season ends with a festival; preparations add up over the whole season */
HAPPEN43.FESTS={
 rains:{name:'Rain’s End',who:'oyelaran',text:'The rains are ending. Tonight the compound eats together in the courtyard, under the last of the clouds.',
  prep:[{ev:'catch',n:3,text:'Catch three fish for the feast'},{ev:'cook',n:2,text:'Cook two dishes over the season'},{ev:'talkK',n:5,text:'Invite every neighbour (talk to all five)'}],
  keep:'A Rain’s End garland',scene:'Lanterns along the rail, a long table out of every flat’s table, and rain that held off just long enough.',
  lines:{oyelaran:'The rains came, the roof held, and we are all still here. Eat.',tunde:'My plants had the best season of their lives. I want that on record.'}},
 dry:{name:'Lantern Night',who:'bassey',text:'The dry season is ending. Tonight every flat hangs a lantern, and everyone walks the compound to see them.',
  prep:[{ev:'shell',n:3,text:'Find three shells to hang in your lantern'},{ev:'decorate',n:2,text:'Make the flat ready (two changes)'},{ev:'photo',n:1,text:'Take one photograph to remember it'}],
  keep:'A paper lantern with shells in it',scene:'Paper lanterns in every window, the shells catching the light, the children counting them twice.',
  lines:{bassey:'I have photographed forty Lantern Nights. This is one of the good ones.',ada:'I made the frames. Do not touch them. Admire them.'}},
 harmattan:{name:'Harmattan Fair',who:'nkechi',text:'The harmattan is ending. Tonight the courtyard is a fair: food, music, and everyone selling something they made.',
  prep:[{ev:'harvest',n:1,text:'Harvest something to show at the fair'},{ev:'cook',n:2,text:'Cook two dishes for the fair'},{ev:'gist',n:2,text:'Be at the rail for two evening gists'}],
  keep:'A ribbon from the Harmattan Fair',scene:'Music from a borrowed speaker, a table of everything people made, and dust in the air turning the lights gold.',
  lines:{nkechi:'Everybody brought something. Even Tunde. It is a plant. Of course it is a plant.',bassey:'The harmattan is going. I will miss it for one day, then I will not.'}}
};

/* ---------- state ---------- */
function happenOn43(){return HAPPEN43.on&&typeof S!=='undefined'&&S&&S.phase==='play'&&S.p&&!(typeof NET!=='undefined'&&NET.on);}
function happenSilent43(){try{return typeof silentMode==='function'&&silentMode();}catch(e){return false;}}
function happen43(create){if(!happenOn43())return null;
 if(!S.happen43||typeof S.happen43!=='object'){if(!create)return null;S.happen43={v:1,since:S.day,day:null,last:{},book:{},fest:{}};}
 return S.happen43;}
function happenHash43(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function happenWeekday43(d){return WEEK[(d-1)%7];}
// the last day of a season is its festival
function happenFestDay43(d){return season(d)!==season(d+1);}
function happenFestKey43(d){return Math.floor((d-1)/12)+':'+season(d);}
function happenDef43(id){if(!id)return null;if(id==='market')return HAPPEN43.MARKET;if(id.indexOf('fest:')===0){const s=id.slice(5),F=HAPPEN43.FESTS[s];return F?{id,who:F.who,at:HAPPEN43.FEST_AT,title:F.name,text:F.text,knock:F.name+' is starting in the courtyard. Come down!',line:F.lines[F.who]||'',goal:{ev:'fest',n:1,text:'Be there when '+F.name+' starts, from half past six'},keep:F.keep,fest:s}:null;}
 return HAPPEN43.POOL.find(x=>x.id===id)||null;}
function happenName43(i){return (S.p[i]&&S.p[i].name)||(i?'Player 2':'Player 1');}
// the day's happening: the festival on a season's last day, market day on Saturdays, otherwise one from the pool
// (in season, not seen in the last eight days), picked from a hash of the household and the day
function happenPick43(H,d){if(happenFestDay43(d))return 'fest:'+season(d);if(happenWeekday43(d)==='Saturday')return 'market';
 const se=season(d);let ok=HAPPEN43.POOL.filter(x=>(!x.season||x.season===se)&&!(H.last[x.id]&&d-H.last[x.id]<HAPPEN43.REPEAT));
 if(!ok.length)ok=HAPPEN43.POOL.filter(x=>!x.season||x.season===se);
 // a season's own happenings come up more often while it lasts
 const w=[];for(const x of ok){w.push(x);if(x.season)w.push(x);}
 return w[happenHash43((S.household||'')+'|'+H.since+'|'+d)%w.length].id;}
function happenRoll43(H){const id=happenPick43(H,S.day);H.day={d:S.day,id,c:0,talkK:[],done:false,knocked:false,said:[false,false],shown:false};H.last[id]=S.day;
 const s=season(S.day),key=happenFestKey43(S.day);if(!H.fest[key])H.fest[key]={c:[0,0,0],talkK:[],held:false};}
function happenFest43(H){const key=happenFestKey43(S.day);return H.fest[key]||(H.fest[key]={c:[0,0,0],talkK:[],held:false});}

/* ---------- events: count toward today's happening and this season's festival ---------- */
function happenEvent43(ev,arg){const H=happen43(false);if(!H||!H.day||H.day.d!==S.day)return;const D=H.day,def=happenDef43(D.id),F=happenFest43(H),FD=HAPPEN43.FESTS[season(S.day)];
 const evs=[ev];if(ev==='talk'&&arg){evs.push('talk:'+arg);if(!D.talkK.includes(arg))D.talkK.push(arg);if(!F.talkK.includes(arg))F.talkK.push(arg);}
 if(FD&&!F.held)FD.prep.forEach((p,j)=>{if(p.ev==='talkK'){if(ev==='talk')F.c[j]=Math.min(p.n,F.talkK.length);}else if(evs.includes(p.ev))F.c[j]=Math.min(p.n,F.c[j]+1);});
 if(def&&!D.done&&D.shown){const g=def.goal;if(g.ev==='talkK'){if(ev!=='talk')return;D.c=D.talkK.length;}else if(evs.includes(g.ev))D.c++;else return;if(D.c>=g.n)happenDone43(H,def);}}
function happenDone43(H,def){const D=H.day;D.done=true;D.c=def.goal.n;const first=!H.book[def.id];if(first)H.book[def.id]=S.day;
 try{if(CAST[def.who])aff(def.who,2);}catch(e){}
 try{remember(def.title+': '+def.keep+'.','moment');}catch(e){}
 happenToast43((first?'New keepsake: ':'Keepsake again: ')+def.keep+'.');}
function happenToast43(t){if(happenSilent43())return;try{toast(t);}catch(e){}}

/* ---------- the clock: the neighbour calls it out at its hour; the festival; watched counters ---------- */
function happenCounters43(){const c=typeof needsCounters42==='function'?needsCounters42():{day:S.day};const l=S.life;c.catch=(l&&l.metrics&&l.metrics.caught)|0;
 // a neighbour's own request (their little stories) counts as help too, read without creating the day's record
 const dl=l&&l.daily&&l.daily[String(S.day)];c.help=(c.help|0)+((dl&&dl.helped)|0);c.day=S.day;return c;}
function happenWatch43(){const now=happenCounters43(),was=HAPPEN43.state.snap;HAPPEN43.state.snap=now;if(!was||was.day!==now.day)return;
 for(const k of ['cooked','football','gist','harvest','decorate','buy','help','photo','catch']){const d=(now[k]|0)-(was[k]|0);if(d>0)for(let j=0;j<Math.min(d,3);j++)happenEvent43(k==='cooked'?'cook':k);}
 if((now.shell|0)>(was.shell|0))happenEvent43('shell');}
function happenKnock43(H){const D=H.day,def=happenDef43(D.id);if(!def||!D.shown||D.knocked||S.time<def.at)return;
 if(typeof overlayOpen==='function'&&overlayOpen())return;D.knocked=true;
 if(def.effect==='storm'&&S.weather){S.weather={day:S.day,rainAt:Math.max(S.time+1,def.at+1),rainTo:Math.max(S.time+1,def.at+1)+1.4};}
 if(happenSilent43())return;const n=typeof npcs!=='undefined'&&npcs[def.who];
 const text=def.knock;if(n&&n.g&&n.g.visible&&typeof bubble40==='function'&&bubble40(text,4200,n.g,2.25)){}
 try{toast(CAST[def.who].name+': '+text);}catch(e){}}
// the festival opens by itself once it has started, as soon as nothing else is on screen
function happenFestTick43(H){const D=H.day;if(!D||!D.shown||D.id.indexOf('fest:')!==0||D.done)return;if(S.time<HAPPEN43.FEST_AT||S.time>=HAPPEN43.FEST_UNTIL)return;
 if(S.party||(typeof overlayOpen==='function'&&overlayOpen()))return;happenFestival43(H);}
function happenFestival43(H){const s=season(S.day),FD=HAPPEN43.FESTS[s],F=happenFest43(H);if(F.held)return;F.held=true;
 const done=FD.prep.filter((p,j)=>F.c[j]>=p.n).length;
 // everyone's friendship grows with how ready the compound was; the household's fun and social fill
 for(const k of Object.keys(CAST)){try{if(S.nb[k])aff(k,done>=3?2:done>=1?1:0);}catch(e){}}
 const N=S.needs42;if(N&&N.p)for(const P of N.p){P.fun=Math.min(100,P.fun+30);P.social=Math.min(100,P.social+35);}
 happenEvent43('fest');
 const grade=done>=3?'Everything was ready.':done===2?'Nearly everything was ready.':done===1?'Some of it was ready.':'Nothing was ready, and it was lovely anyway.';
 if(done>=3){const gid='gold:'+s;if(!H.book[gid])H.book[gid]=S.day;}
 try{(typeof takePhoto==='function'&&!happenSilent43()?takePhoto:remember)(FD.name+': '+FD.scene,'photo');}catch(e){}
 if(happenSilent43())return;
 const who=Object.keys(FD.lines);
 try{openPanel(`<div class="happen43-fest"><p class="life-kicker">${esc(seasonName().toUpperCase())} · DAY ${S.day}</p><h2>${esc(FD.name)}</h2><p>${esc(FD.scene)}</p>
  <ul class="happen43-prep">${FD.prep.map((p,j)=>`<li class="${F.c[j]>=p.n?'done':''}">${F.c[j]>=p.n?'✓':'○'} ${esc(p.text)}</li>`).join('')}</ul><p class="small"><b>${esc(grade)}</b>${done>=3?' Every neighbour will remember tonight.':''}</p>
  ${who.map(k=>say(k,esc(FD.lines[k]))).join('')}<p class="small muted">Keepsake: ${esc(FD.keep)}${done>=3?' (with a gold thread, for a festival fully ready)':''}.</p><div class="actions">${btn('Join in','close',{},'primary')}</div></div>`);}catch(e){}}
function happenTick43(dt){if(!happenOn43()||!S.happen43)return;const st=HAPPEN43.state;st.t+=dt;if(st.t<1)return;st.t=0;const H=S.happen43;
 if(!H.day||H.day.d!==S.day)happenRoll43(H);happenWatch43();happenKnock43(H);happenFestTick43(H);}
// wrap: the per-second step rides on EVENING35.tick, as v40's to v42's do, so the pinned TICK_HOOKS list stays as it is
if(typeof EVENING35!=='undefined'&&typeof EVENING35.tick==='function'){const prevEveTick43=EVENING35.tick;EVENING35.tick=function(dt){const r=prevEveTick43.apply(this,arguments);try{happenTick43(dt);}catch(e){}return r;};}

/* ---------- direct events ---------- */
// wrap: eating together
const eat43=ACTIONS.eat;ACTIONS.eat=function(d){const had=S&&S.dishes&&S.dishes[+d.ix];const r=eat43.apply(this,arguments);try{if(had)happenEvent43('eat');}catch(e){}return r;};
// wrap: the neighbour talks about the day's happening, once a day for each player (outside lines_talk35, bonds-v41 and needs-v42, still underneath)
const talk43=talk;talk=function(i,k){/* outside lines_talk35 (the v35 lines wrapper, still underneath) */let out=talk43.apply(this,arguments);
 try{const H=happen43(false);if(H&&H.day&&H.day.d===S.day&&CAST[k]){const def=happenDef43(H.day.id);
  if(def&&H.day.shown&&def.who===k&&def.line&&!H.day.said[i]&&!happenSilent43()){H.day.said[i]=true;out+=`<div class="happen43-say">${say(k,esc(def.line))}</div>`;}
  happenEvent43('talk',k);}}catch(e){}return out;};

/* ---------- a new morning: roll the day's happening ---------- */
const nextday43=ACTIONS.nextday;ACTIONS.nextday=function(){const r=nextday43.apply(this,arguments);
 try{const H=happen43(true);if(H){happenRoll43(H);HAPPEN43.state.snap=null;save();
  // the earlier wrappers opened Today before the happening was rolled: draw it again
  try{if(!happenSilent43()&&typeof overlayOpen==='function'&&overlayOpen()&&panel.classList.contains('life-panel34')&&LIFE34.tab==='today')openLife34('today');}catch(e){}}}catch(e){}
 return r;};

/* ---------- Today and the Almanac ---------- */
function happenKeepTotal43(){return HAPPEN43.POOL.length+1+Object.keys(HAPPEN43.FESTS).length;}
function happenKeepCount43(H){return Object.keys(H.book).filter(k=>k.indexOf('gold:')!==0).length;}
// compact: the hero above already carries the happening's title and text
function happenTodayHTML43(compact){const H=happen43(false);if(!H||!H.day||H.day.d!==S.day)return `<div class="happen43"><p class="life-kicker">TODAY IN PALM COURT</p><p class="small muted">From tomorrow morning, something will be going on in the compound every day.</p></div>`;
 const D=H.day,def=happenDef43(D.id),g=def.goal,se=season(S.day),FD=HAPPEN43.FESTS[se],F=happenFest43(H);
 let left=0;for(let d=S.day;!happenFestDay43(d)&&left<13;d++)left++;
 const hh=Math.floor(def.at),mm=Math.round((def.at-hh)*60),when=`${hh%12===0?12:hh%12}:${mm<10?'0':''}${mm} ${hh<12?'am':'pm'}`;
 return `<div class="happen43"><p class="life-kicker">TODAY IN PALM COURT · ${esc(happenWeekday43(S.day).toUpperCase())}</p>
 <article class="life-card34 happen43-card${D.id.indexOf('fest:')===0?' fest':D.id==='market'?' market':''}"><span class="life-label34">${esc(CAST[def.who].name)} · from ${when}</span>${compact?'':`<h3>${esc(def.title)}</h3><p>${esc(def.text)}</p>`}
 <p class="small ${D.done?'happen43-done':''}">${D.done?'✓':'○'} ${esc(g.text)}${g.n>1&&!D.done?` <span class="muted">${D.c}/${g.n}</span>`:''}</p><p class="small muted">Keepsake: ${esc(def.keep)}${H.book[def.id]&&!D.done?' (you have this one)':''}</p></article>
 ${FD&&!F.held?`<article class="life-card34 happen43-card prep"><span class="life-label34">${left?`${esc(FD.name)} in ${left} day${left>1?'s':''}`:esc(FD.name)+' is tonight'}</span><h3>Getting ready</h3><ul class="happen43-prep">${FD.prep.map((p,j)=>`<li class="${F.c[j]>=p.n?'done':''}">${F.c[j]>=p.n?'✓':'○'} ${esc(p.text)}${F.c[j]<p.n&&p.n>1?` <span class="muted">${F.c[j]}/${p.n}</span>`:''}</li>`).join('')}</ul></article>`:''}
 <p class="small muted">${happenKeepCount43(H)}/${happenKeepTotal43()} keepsakes in the Almanac.</p></div>`;}
function happenAlmanacHTML43(){const H=happen43(false);const book=H?H.book:{};const all=[...HAPPEN43.POOL,HAPPEN43.MARKET,...Object.keys(HAPPEN43.FESTS).map(s=>happenDef43('fest:'+s))];
 return `<div class="happen43 happen43-book"><p class="life-kicker">KEEPSAKES · ${H?happenKeepCount43(H):0}/${happenKeepTotal43()}</p><p class="small">One from every happening you took part in. Some only come in one season.</p>
 <div class="happen43-grid">${all.map(d=>{const got=book[d.id],gold=d.fest&&book['gold:'+d.fest],se=d.season||(d.fest?d.fest:null);
  return `<div class="happen43-keep${got?' got':''}${gold?' gold':''}"><b>${got?esc(d.keep):'?'}</b><span>${esc(d.title)}${se?` · ${esc({rains:'rainy season',dry:'dry season',harmattan:'harmattan'}[se])}`:''}</span></div>`;}).join('')}</div></div>`;}
// wrap: Today leads with the day's happening (and stops repeating the same heading every morning); the Almanac gains the keepsakes
const openLife43=openLife34;openLife34=function(tab){const r=openLife43.apply(this,arguments);try{if(happenOn43()&&!happenSilent43()){const sec=panel.querySelector&&panel.querySelector('.life34');
 if(LIFE34.tab==='today'){const hero=sec&&sec.querySelector&&sec.querySelector('.life-hero34');if(hero){const H=happen43(false),h2=hero.querySelector&&hero.querySelector('h2');
   const take=!!(H&&H.day&&H.day.d===S.day&&h2&&/Your pace\. Your place\./.test(h2.textContent||''));
   if(take){const def=happenDef43(H.day.id);h2.textContent=def.title+'.';const p=hero.querySelector('p:not(.life-kicker)');if(p)p.textContent=def.text;}
   hero.insertAdjacentHTML('afterend',happenTodayHTML43(take));if(H&&H.day&&H.day.d===S.day)H.day.shown=true;}}
 else if(LIFE34.tab==='almanac'&&sec){const foot=sec.querySelector&&sec.querySelector('.life-footer34');if(foot)foot.insertAdjacentHTML('beforebegin',happenAlmanacHTML43());else if(sec.insertAdjacentHTML)sec.insertAdjacentHTML('beforeend',happenAlmanacHTML43());}}}catch(e){}return r;};

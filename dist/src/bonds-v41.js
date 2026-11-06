/* v41: Bonds. A friendship ladder that keeps every "+1" meaningful, and a daily mood and want for each neighbour.
   Two systems, one module (object BONDS41), loaded after every earlier module. It only wraps earlier functions (aff, talk,
   openLife34, ACTIONS.nextday, EVENING35.tick) and calls them; it pushes no hook.

   1. The ladder. Each neighbour has ladder points (S.bonds41.nb[k].pts) and five named levels (BONDS41.LEVELS). Points come from
      the base aff() calls (every return, errand, party, request), with plain chat capped at one point per neighbour per day, and
      from helping with a neighbour's want (BONDS41.WANT_PTS). Points never fall. A neighbour you have not talked to for
      BONDS41.MISSED days says so the next time ("missed you"), once. Each level brings something you can see:
        Neighbour: you can read their mood (the People tab and the talk panel).
        Friend: they greet you by name, once a day, when you pass near them.
        Close friend: now and then they leave a small thing by your door overnight.
        Like family: they tell you something they have told nobody else, once, and it goes in the album.
   2. Moods and wants. Each morning every neighbour gets a mood (bright, easy, tired, worried), from a hash of the day, the
      season, the morning's rain and whether you helped them yesterday, and one want built from things the game already has:
      fish, peppers, a cooked dish, a shell, a pantry ingredient, or just company in the evening. Talk to them to hear it; help
      at their live place. Helping earns ladder points and friendship (never money), lifts their mood and yours.

   Nothing shows before day 2 or in online play. Save fields are additive and lazy: S.bonds41 is written only once the system is
   used (talk, People tab, a new morning). An old save is seeded from its aff values on first use. */
const BONDS41={
 on:true,
 FROM_DAY:2,
 CAST:['tunde','nkechi','ada','bassey','oyelaran'],
 LEVELS:[
  {n:0,name:'New face',next:'Talk, help out, and they will start to know you.'},
  {n:4,name:'Neighbour',next:'At Friend, they greet you by name around the compound.'},
  {n:12,name:'Friend',next:'At Close friend, they sometimes leave a small thing by your door.'},
  {n:24,name:'Close friend',next:'At Like family, they will tell you something they keep to themselves.'},
  {n:40,name:'Like family',next:'You are one of their people now.'}],
 SEED_CAP:12,         // an old save starts at most at Friend
 WANT_PTS:3,          // ladder points for helping with a want (plus one base friendship)
 MISSED:6,            // days without a talk before the "missed you" line
 GIFT_EVERY:3,        // a Close friend leaves something at most once in this many days
 GREET_R:4.5,         // metres for the Friend greeting
 MOODS:['bright','easy','tired','worried'],
 MOOD_NAME:{bright:'in high spirits',easy:'easy today',tired:'tired today',worried:'worried about something'},
 state:{greetT:0}
};

/* ---------- lines (for the Nigerian reader: every new line is here) ---------- */
BONDS41.LINES={
 mood:{
  tunde:{bright:'The new speaker cone came. The bass is now saying the truth.',easy:'Morning. The plants are behaving. So am I.',tired:'Three events last night. My ears are still at the venue.',worried:'The generator coughed twice this morning. I do not like that sound.'},
  nkechi:{bright:'Customers since six o’clock. God is good, my feet are not.',easy:'Quiet morning. Sit, if you like. Do not touch the biscuits.',tired:'The supplier came late, then he came short. I have been arguing since dawn.',worried:'Prices again. Everything is going up except my patience.'},
  ada:{bright:'The ninth piece behaved today. I almost do not trust it.',easy:'Sanding. It is the closest thing I have to peace.',tired:'I remade the same joint four times. My hands are angry with me.',worried:'The gallery called. They want a date. I want another month.'},
  bassey:{bright:'The light this morning! I took nine photographs of one wall.',easy:'Good day. I am cleaning lenses that are already clean.',tired:'My knee says it will rain. My knee is a liar, but a tired one.',worried:'Only two people signed up for the workshop. Maybe I talk too much.'},
  oyelaran:{bright:'The minutes are typed, the board is straight. A rare day.',easy:'Good day. Nobody has complained to me yet. It is still early.',tired:'Somebody played music until one. I will find out who.',worried:'The landlord is coming about the gate. I have prepared three speeches.'}},
 missed:{
  tunde:'Ah. You are alive. I was going to water you.',
  nkechi:'Where have you been? I almost gave your face to another customer.',
  ada:'You disappeared. I thought maybe you bought a chair from someone else.',
  bassey:'There you are. I was about to put your photograph on the noticeboard.',
  oyelaran:'You have travelled? Nobody informed the board.'},
 level:{  // the first talk after reaching a level (index 1..4)
  tunde:['', 'You are not new again. You are just a neighbour that waters things.','Friend. I have said it. Do not make it a big thing.','Close friend. If my plants need a babysitter, it is you.','Family. You know what that means here. You will be asked to carry things.'],
  nkechi:['', 'I know your face now. That is the first discount. There is no first discount.','You are my friend. My friends buy on time and gist on credit.','Close friend. I will tell you which tins to avoid.','You are family now. Family eats first and complains last.'],
  ada:['', 'Neighbour. I will stop calling you the sofa people. Maybe.','You are a friend now. You may sit on the chairs I have not finished.','Close friend. I will show you the drawings nobody sees.','Family. Come to the opening early. Help me not to panic.'],
  bassey:['', 'Neighbour. I have a photograph of your gate. Everybody begins there.','Friend. I remember your good side. You have one.','Close friend. I will lend you a lens. I do not lend lenses.','Family. When I print the compound book, you are in it. Properly.'],
  oyelaran:['', 'You are on my list of reasonable people. It is a short list.','Friend. The board is still the board, but you may write on it.','Close friend. I will tell you before the meeting what the meeting decided.','Family. You know where the spare key is now. Tell nobody.']},
 greet:{
  tunde:'{name}! Water the pot before the sun climbs.',
  nkechi:'{name}! Come and buy something, or come and gist.',
  ada:'{name}. I see you. Wave back, it is polite.',
  bassey:'{name}! Stop. Yes. Good light on you today.',
  oyelaran:'Good day, {name}. Everything in order?'},
 gift:{
  tunde:['pepper',2,'Tunde left two peppers by your door, wrapped in an old event flyer.'],
  nkechi:['spices',1,'Mama Nkechi left a spice pack by your door. A note: “Do not tell the others.”'],
  ada:['onion',2,'Ada left two onions by your door. “Somebody gave me too many. Do not ask.”'],
  bassey:['tomato',1,'Mr. Bassey left tomatoes by your door, in a bag from a photo lab.'],
  oyelaran:['yam',1,'Mrs. Oyelaran left a yam tuber by your door. The note says: “For the household. — O.”']},
 secret:{
  tunde:'Before sound, I wanted to be a farmer. My father said farmers do not get rich. My plants do not know that.',
  nkechi:'The café. I have already chosen the name. “Nkechi’s Table.” Say it nowhere.',
  ada:'The ninth piece is for my mother. That is why I keep remaking it.',
  bassey:'I kept one photograph from every wedding. One. Thirty-one years in one shoebox.',
  oyelaran:'I keep the board because my husband kept it. Twenty years now. He would have hated the new gate.'},
 thanks:{
  tunde:'You remembered. That is the whole of friendship, you know. Remembering.',
  nkechi:'See? This is why I like you. You do not just talk.',
  ada:'Thank you. Truly. I will pretend I did not need it.',
  bassey:'Ah, thank you. I will tell people about this. At length.',
  oyelaran:'Thank you. I am writing it down. In the good book.'}
};
/* each want: who can ask, what they say, what it takes */
BONDS41.WANTS=[
 {id:'fish',who:['nkechi','bassey','oyelaran','tunde'],goal:'Bring 1 fresh fish',test:()=>haveCount('fish')>=1,take:()=>takeItem('fish',1),
  say:{nkechi:'A customer wants fish stew tomorrow and I have no fish. One fresh one, if the water is kind.',bassey:'I promised my sister fish pepper soup. I have not held a rod since 1994.',oyelaran:'I am cooking for the meeting. One fish would save my reputation.',tunde:'One fish. Do not ask why. Fine. It is for my uncle.'}},
 {id:'pepper',who:['nkechi','oyelaran','bassey'],goal:'Bring 2 peppers',test:()=>haveCount('pepper')>=2,take:()=>takeItem('pepper',2),
  say:{nkechi:'My pepper woman did not come. Two peppers, and I will owe you.',oyelaran:'My stew is pale. Pale stew is a disgrace. Two peppers.',bassey:'Two peppers, please. My doctor says no. My stew says yes.'}},
 {id:'dish',who:['tunde','ada','bassey'],goal:'Bring 1 cooked dish',test:()=>S.dishes.length>0,take:()=>S.dishes.shift(),
  say:{tunde:'I have been at the venue since morning. If something from your kitchen happened to come this way…',ada:'I forgot to eat. Again. Anything from your pot, I will not complain.',bassey:'Cooking for one is sad. Eating something you cooked is less sad.'}},
 {id:'shell',who:['ada','bassey'],goal:'Bring 1 shell from the beach',test:()=>life34().shells>=1,take:()=>{life34().shells--;},
  say:{ada:'One smooth shell. I want to try it as a drawer pull.',bassey:'A shell for a still life. One. The beach has many.'}},
 {id:'onion',who:['nkechi','oyelaran','tunde'],goal:'Bring 1 onion',test:()=>haveCount('onion')>=1,take:()=>takeItem('onion',1),
  say:{nkechi:'Can you believe it? A provisions shop with no onions. One, to hold me till the van comes.',oyelaran:'One onion. I am in the middle of something and I refuse to go out.',tunde:'One onion. My kitchen is a speaker store with a stove.'}},
 {id:'company',who:['tunde','nkechi','ada','bassey','oyelaran'],goal:'Talk to them this evening',company:true,test:()=>false,take:()=>{},
  say:{tunde:'Come and gist in the evening. The day is too loud to talk properly.',nkechi:'Pass by this evening, when the shop is quiet. I have gist.',ada:'Come back this evening and tell me something that is not about wood.',bassey:'This evening, come and sit. I have stories, and nobody to bore.',oyelaran:'Come and see me this evening. It is about the meeting. And also not.'}}
];

/* ---------- state ---------- */
function bondsOn41(){return BONDS41.on&&typeof S!=='undefined'&&S&&S.phase==='play'&&S.nb&&S.day>=BONDS41.FROM_DAY&&!(typeof NET!=='undefined'&&NET.on);}
function bondsSilent41(){try{return typeof silentMode==='function'&&silentMode();}catch(e){return false;}}
function bonds41(create){
 if(!bondsOn41())return null;
 if(!S.bonds41||typeof S.bonds41!=='object'){if(!create)return null;
  const nb={};for(const k of BONDS41.CAST)nb[k]={pts:Math.min(BONDS41.SEED_CAP,(S.nb[k]&&S.nb[k].aff)|0),lvl:0,seen:0,chatDay:0,missedSaid:0,greetDay:0,giftDay:0,secret:false,want:null,mood:null};
  for(const k of BONDS41.CAST)nb[k].lvl=bondLevel41(nb[k].pts);
  S.bonds41={v:1,since:S.day,nb};}
 const B=S.bonds41;for(const k of BONDS41.CAST){if(!B.nb[k])B.nb[k]={pts:0,lvl:0,seen:0,chatDay:0,missedSaid:0,greetDay:0,giftDay:0,secret:false,want:null,mood:null};}
 return B;
}
function bondLevel41(pts){let l=0;BONDS41.LEVELS.forEach((L,i)=>{if(pts>=L.n)l=i;});return l;}
function bondHash41(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function bondSeed41(){return (S.household||'')+'|'+((S.bonds41&&S.bonds41.since)|0);}

/* the day's mood and want for one neighbour, rolled once per day and kept */
function bondToday41(k){const B=bonds41(true);if(!B)return null;const b=B.nb[k];
 if(!b.mood||b.mood.day!==S.day){
  const h=bondHash41(bondSeed41()+'|mood|'+k+'|'+S.day);let w=[3,3,2,2];   // bright, easy, tired, worried
  const sea=season(S.day);if(sea==='harmattan'){w[2]+=1;}if(sea==='dry'){w[0]+=1;}
  if(S.weather&&S.weather.day===S.day&&S.weather.rainAt){w[1]+=1;w[3]+=1;}
  if(b.want&&b.want.done&&b.want.day===S.day-1){w[0]+=3;w[3]=Math.max(0,w[3]-1);}
  let r=h%w.reduce((a,c)=>a+c,0),m=0;while(r>=w[m]){r-=w[m];m++;}
  b.mood={day:S.day,m:BONDS41.MOODS[m]};}
 if(!b.want||b.want.day!==S.day){
  const pool=BONDS41.WANTS.filter(W=>W.who.includes(k));const prev=b.want&&b.want.id;
  let ix=bondHash41(bondSeed41()+'|want|'+k+'|'+S.day)%pool.length;if(pool.length>1&&pool[ix].id===prev)ix=(ix+1)%pool.length;
  b.want={day:S.day,id:pool[ix].id,done:false};}
 return b;
}
function bondWant41(k){const b=bondToday41(k);return b?BONDS41.WANTS.find(W=>W.id===b.want.id):null;}

/* ---------- earning points ---------- */
function bondAdd41(k,n,why){const B=bonds41(true);if(!B||!B.nb[k]||!(n>0))return;const b=B.nb[k];const before=b.lvl;b.pts+=n;b.lvl=bondLevel41(b.pts);
 if(b.lvl>before){b.lvlNew=b.lvl;const L=BONDS41.LEVELS[b.lvl];try{remember(CAST[k].name+' and your household: '+L.name+'.','moment');}catch(e){}
  if(!bondsSilent41())setTimeout(()=>{try{toast(CAST[k].name+' now thinks of you as: '+L.name+'.');}catch(e){}},2500);}}
// wrap: every base friendship gain also climbs the ladder; plain chat counts once per neighbour per day
const aff41=aff;aff=function(who,n){try{if(bondsOn41())bonds41(true);}catch(e){}const r=aff41(who,n);try{if(bondsOn41()&&BONDS41.CAST.includes(who)){const B=bonds41(true),b=B.nb[who];
 if(BONDS41.state.talkAff)BONDS41.state.talkAff.push([who,n]);else bondAdd41(who,n,'aff');}}catch(e){}return r;};
// inside a talk, gains are held until it returns: the base talk's chat bump (its last aff call, made only on a first talk)
// is capped at one point per neighbour per day; any task reward given in the same dialogue counts in full
function bondTalkAff41(calls,first){calls.forEach(([who,n],ix)=>{if(first&&ix===calls.length-1){const b=S.bonds41.nb[who];if(b.chatDay!==S.day){b.chatDay=S.day;bondAdd41(who,1,'chat');}}else bondAdd41(who,n,'aff');});}

/* ---------- the talk panel ---------- */
function bondMarks41(l){return `<span class="bonds41-marks" aria-label="${esc(BONDS41.LEVELS[l].name)}">${[1,2,3,4].map(i=>`<i class="${i<=l?'on':''}"></i>`).join('')}</span>`;}
function bondCard41(k,inTalk){const b=bondToday41(k);if(!b)return '';const W=bondWant41(k),L=BONDS41.LEVELS[b.lvl],near=typeof neighbourNear34==='function'&&neighbourNear34(k);
 const nextL=BONDS41.LEVELS[b.lvl+1];const toNext=nextL?Math.max(0,nextL.n-b.pts):0;
 const moodTxt=b.lvl>=1?`<p class="small bonds41-mood m-${b.mood.m}">${esc(CAST[k].name)} is ${esc(BONDS41.MOOD_NAME[b.mood.m])}.</p>`:'';
 const wantTxt=b.want.done?`<p class="small ok">You helped today. ${esc(CAST[k].name)} will remember.</p>`
  :`<p class="small"><b>${esc(W.goal)}</b> <span class="muted">for points with ${esc(CAST[k].name)}, never money</span></p>${W.company?'<p class="tiny muted">After six o\u2019clock, find them and talk.</p>':!near?'':W.test(k)?btn('Help with this','bond41Give',{k},'primary'):''}`;
 return `<article class="life-card34 bonds41-card"><span class="life-label34">${esc(CAST[k].name)} · ${esc(L.name)} ${bondMarks41(b.lvl)}</span>${moodTxt}${inTalk?'':`<p class="small">${esc(BONDS41.LINES.mood[k][b.mood.m])}</p>`}${b.lvl>=1||inTalk?`<p class="small"><i>“${esc(W.say[k])}”</i></p>${wantTxt}`:`<p class="small muted">Talk to ${esc(CAST[k].name)} to find out what today needs.</p>`}<p class="tiny muted">${nextL?esc(toNext+' more to '+nextL.name+'. '+L.next):esc(L.next)}</p></article>`;}
function bondTalkLines41(k){const B=bonds41(true),b=bondToday41(k);if(!b)return '';let out='';
 if(b.seen&&S.day-b.seen>=BONDS41.MISSED&&b.missedSaid!==S.day){b.missedSaid=S.day;out+=say(k,esc(BONDS41.LINES.missed[k]));}
 if(b.lvlNew){out+=say(k,esc(BONDS41.LINES.level[k][b.lvlNew]));b.lvlNew=0;}
 if(b.lvl>=4&&!b.secret){b.secret=true;out+=say(k,esc(BONDS41.LINES.secret[k]));try{remember(CAST[k].name+' told you something they keep to themselves.','moment');}catch(e){}}
 out+=say(k,esc(BONDS41.LINES.mood[k][b.mood.m]));b.seen=S.day;
 return out;}
// wrap: the talk dialogue (outside lines_talk35 and football's wrapper, still underneath) gains their mood line (and any
// missed-you, level-up or secret line) and today's want card at its end, so they sit above the request card and Later.
// openTalk itself is not wrapped: the bridge's openTalk stays outermost.
const talk41=talk;talk=function(i,k){/* outside lines_talk35 (the v35 lines wrapper, still underneath) */if(!bondsOn41()||bondsSilent41()||!BONDS41.CAST.includes(k))return talk41.apply(this,arguments);
 const calls=[];BONDS41.state.talkAff=calls;let out;try{out=talk41.apply(this,arguments);}finally{BONDS41.state.talkAff=null;}
 try{bondTalkAff41(calls,!!arguments[2]);}catch(e){}
 try{let lines=bondTalkLines41(k);
  // "company" is met by talking to them in the evening (from six)
  const b=S.bonds41.nb[k];if(!b.want.heard)b.want.heard=slot();if(b.want.id==='company'&&!b.want.done&&slot()==='evening'&&bondGive41(k,true))lines+=say(k,esc(BONDS41.LINES.thanks[k]));
  out+=`<div class="bonds41-talk">${lines}${bondCard41(k,true)}</div>`;save();}catch(e){}
 return out;};

/* ---------- helping ---------- */
function bondGive41(k,quiet){const b=bondToday41(k);if(!b||b.want.done)return false;const W=bondWant41(k);if(!(W.company?quiet:W.test(k)))return false;
 W.take();b.want.done=true;b.mood={day:S.day,m:'bright'};
 bondAdd41(k,BONDS41.WANT_PTS,'want');try{aff41(k,1);}catch(e){}
 try{both().forEach(i=>cheer(i,8));}catch(e){}try{if(typeof day34==='function')day34().helped++;}catch(e){}
 save();
 if(!quiet&&!bondsSilent41())openPanel(`<section class="bonds41-panel"><h2>${esc(CAST[k].name)}</h2>${say(k,esc(BONDS41.LINES.thanks[k]))}<p class="small ok">${esc(CAST[k].name)} is in high spirits. ${bondMarks41(b.lvl)} ${esc(BONDS41.LEVELS[b.lvl].name)}</p><div class="actions">${btn('Later','close',{},'primary block')}</div></section>`);
 return true;}
ACTIONS.bond41Give=d=>{const k=d.k;if(!bondsOn41()||!BONDS41.CAST.includes(k)||!(typeof neighbourNear34==='function'&&neighbourNear34(k)))return;bondGive41(k,false);};

/* ---------- the People tab: everyone, with level, mood and want ---------- */
const openLife41=openLife34;openLife34=function(tab){const r=openLife41(tab);try{if(bondsOn41()&&!bondsSilent41()&&LIFE34.tab==='people'){const sec=panel.querySelector&&panel.querySelector('.life34');
 const html=`<div class="bonds41-people"><p class="life-kicker">EVERYONE IN PALM COURT</p><h3>How they are today</h3>${BONDS41.CAST.map(k=>bondCard41(k,false)).join('')}</div>`;
 const foot=sec&&sec.querySelector&&sec.querySelector('.life-footer34');if(foot)foot.insertAdjacentHTML('beforebegin',html);else if(sec)sec.insertAdjacentHTML('beforeend',html);}}catch(e){}return r;};

/* ---------- a new morning: Close friends' small gifts ---------- */
const nextday41=ACTIONS.nextday;ACTIONS.nextday=function(){const r=nextday41.apply(this,arguments);try{const B=bonds41(true);if(B){const notes=[];
 for(const k of BONDS41.CAST){const b=B.nb[k];if(b.lvl<3||S.day-(b.giftDay|0)<BONDS41.GIFT_EVERY)continue;
  if(bondHash41(bondSeed41()+'|gift|'+k+'|'+S.day)%3!==0)continue;const g=BONDS41.LINES.gift[k];addPantry(g[0],g[1]);b.giftDay=S.day;notes.push(g[2]);if(notes.length>=1)break;}
 for(const k of BONDS41.CAST)bondToday41(k);save();
 if(notes.length&&!bondsSilent41())setTimeout(()=>{try{toast(notes[0]);}catch(e){}},3200);}}catch(e){}return r;};

/* ---------- Friends greet you by name, once a day each ---------- */
function bondGreetTick41(dt){if(!bondsOn41()||bondsSilent41())return;const st=BONDS41.state;st.greetT+=dt;if(st.greetT<1)return;st.greetT=0;
 const B=S.bonds41;if(!B)return;for(const k of BONDS41.CAST){const b=B.nb[k],n=npcs[k];if(!b||b.lvl<2||b.greetDay===S.day||!n||!n.g.visible)continue;
  const p=players.find(p=>Math.hypot(p.g.position.x-n.g.position.x,p.g.position.z-n.g.position.z)<BONDS41.GREET_R&&(p.y||0)<1);if(!p)continue;
  if(typeof overlayOpen==='function'&&overlayOpen())return;
  b.greetDay=S.day;const name=(S.p[p.i]&&S.p[p.i].name)||'neighbour';const text=BONDS41.LINES.greet[k].replace('{name}',name);
  if(typeof bubble40==='function'&&bubble40(text,3200,n.g,2.25)){}else toast(CAST[k].name+': '+text);return;}}
// wrap: the per-frame step rides on EVENING35.tick, as v40's does, so the pinned TICK_HOOKS list stays as it is
if(typeof EVENING35!=='undefined'&&typeof EVENING35.tick==='function'){const prevEveTick41=EVENING35.tick;EVENING35.tick=function(dt){const r=prevEveTick41.apply(this,arguments);try{bondGreetTick41(dt);}catch(e){}return r;};}

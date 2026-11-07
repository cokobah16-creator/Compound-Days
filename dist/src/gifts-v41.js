/* v41 Ada's commissions: the neighbours and the evening (engineer B; v41/SPEC.md §7, §9, §13 and column B of §18.1).
   Owner decision 2, after the lists, "Every day, for good": "A piece for a neighbour can be ordered every day, so mornings keep a purpose. A
   neighbour's kindness back comes at most once a fortnight, so gifts don't feel like a treadmill of thanks."
   The pieces for a neighbour, offered as the slate's "For a neighbour" (gift41Next, read by ada-v41.js): Mama Nkechi's own counter stool (she
   asks at her shop once the household has collected its first flat piece, and settles with Ada herself; her message, given at Ada's slate, is
   its thing to bring), Mr. Bassey's frame for the wedding print (once v40's card thing 'print' has come back), Tunde's name board, Mrs.
   Oyelaran's writing table for the minutes book (once 'minutes' has come back), Mama Nkechi's café sign; then "one like yours", a copy of a
   flat piece the household has, for each neighbour in turn, never the same neighbour twice running, each pair once, then the woods again.
   Every thing asked of a neighbour (the print lent, the lettering, the book's size, the sign's words, and Mr. Bassey's lagoon photograph for
   the flat's panel) is asked at the neighbour's live place by the hour and passed to A through ada41Got. A neighbour's piece is given at the
   receiver's live place by the hour, for thanks and friendship; no money changes hands. A day or two after a gift, Mama Nkechi's puff-puff
   (cut item 1), at most once in fourteen days.
   The evening: at most one v41 line a night (§9.1's seven priorities, each true at that place and hour), in a free reaction by the same
   speaker or a line v40's repeat guard swapped in for that speaker (§9.2; the day-1 sizing, §9.5, kept the rule as written), never an insert;
   the plan stays pure; the done wrapper books the ids shown before v40's single save.
   Requires ADA41.on (and so BOARD40, GIST40 and DAILY40). Every top-level name ends in 41 and is declared unconditionally; every installing
   statement sits inside a typeof guard. No TICK_HOOKS entry (the step rides EVENING35.tick by property, outermost), no Math.random call (the
   bubbles are A's bubble41, inside quiet41), no wall clock, no performance.now. hash38's salts here are numbers (411-419): hash38 coerces
   each argument with |0, so a string salt would read as 0. Warnings read 'gift41'. */
'use strict';

/* ======================================================================================================================================
   1. The object: the neighbour list, the copies, the leads and the lines (every line a draft for the Nigerian reader; docs/READER_gist.md)
   ====================================================================================================================================== */
const GIFT41={v:1,t:0,checkAt:0,
 on:typeof ADA41!=='undefined'&&!!ADA41&&!!ADA41.on,
 // the neighbour list in order (§7.1): the stool is Mama Nkechi's own order (no money); the rest the household's gifts at the recommended band
 NB:[
  {id:'nkstool',for:'nkechi',name:'counter stool',model:'stool',wood:'iroko',price:0,msg:true},
  {id:'frame',for:'bassey',name:'frame for the wedding print',model:'frame',wood:'iroko',price:8000,needs:'print',
   bring:{kind:'print',thing:'the wedding print',short:'wedding print',from:'bassey',cost:0,ask:'ad41-bring-print'}},
  {id:'board',for:'tunde',name:'name board for the garden corner',model:'nboard',scale:1.3,wood:'iroko',price:8000,
   bring:{kind:'letters',thing:'Tunde’s lettering',short:'lettering',from:'tunde',cost:0,ask:'ad41-bring-letters'}},
  {id:'table',for:'oyelaran',name:'writing table for the minutes book',model:'table',wood:'mahogany',price:9000,needs:'minutes',
   bring:{kind:'measure',thing:'a paper with the minutes book’s size',short:'paper with the book’s size',from:'oyelaran',cost:0,ask:'ad41-bring-measure'}},
  {id:'sign',for:'nkechi',name:'carved sign for the café',model:'nsign',scale:1.6,wood:'iroko',price:9000,
   bring:{kind:'words',thing:'a paper with the sign’s words',short:'paper with the sign’s words',from:'nkechi',cost:0,ask:'ad41-bring-sign'}}],
 KS:['nkechi','bassey','tunde','oyelaran'],
 // "one like yours" (§7.1): pairs (flat piece at home, neighbour) in a hash38 order, never the same neighbour twice running, each pair once;
 // pairs that would read oddly left out; then the woods again. weekly: decision 2's bounded option (one setting; off: the owner chose daily)
 LIKE:{salt:414,notTwice:true,weekly:false,skip:['plate:tunde','plate:nkechi','panel:bassey']},
 WOODS:['iroko','mahogany','afara','obeche'],
 // a wood whose line fits the piece (Ada's wood lines name what each wood is for: obeche "Good for a box", afara for a shelf or a frame)
 WOODFIT:{afara:['shelf','mirror'],obeche:['box']},
 RETURN:{after:[1,2],every:14,salt:415,near:6},     // the kindness a day or two after a gift, at most once in fourteen days (cut item 1)
 LEAD:{give:1.0,ask:0.99,hear:0.98,back:0.97,reach:1.8},
 NK:{near:6,from:7.5,to:18},                       // Mama Nkechi's bubble within 6 m of her by day
 MAX_LINE:1,SAID_DAYS:14,PRUNE:28,
 // §9.1, in priority order: the families of lines (each id said at most once in fourteen evenings; a family at most once for its piece)
 FAM:{
  'nk-stool':['gs41-nk-stool'],'nk-sign':['gs41-nk-sign'],'nk-gen':['gs41-nk-gen','gs41-nk-gen2','gs41-nk-gen3'],
  'ba-frame':['gs41-ba-frame'],'ba-gen':['gs41-ba-gen','gs41-ba-gen2','gs41-ba-gen3'],'ba-gen-eve':['gs41-ba-gen-eve','gs41-ba-gen-eve2'],
  'tu-board':['gs41-tu-board'],'tu-board-am':['gs41-tu-board-am'],'tu-gen':['gs41-tu-gen','gs41-tu-gen2','gs41-tu-gen3'],
  'oy-table':['gs41-oy-table'],'oy-gen':['gs41-oy-gen','gs41-oy-gen2','gs41-oy-gen3'],
  'ad-flat':['gs41-ad-after','gs41-ad-name'],'ad-gift':['gs41-ad-gift','gs41-ad-gift2'],'ad-open':['gs41-ad-open','gs41-ad-ninth'],'ad-nk':['gs41-ad-nk'],
  'ba-photo':['gs41-ba-photo','gs41-ba-photo2'],'oy-saw':['gs41-oy-saw','gs41-oy-saw2'],'nk-open':['gs41-nk-open','gs41-nk-open2']},
 LINES:{
  // §13.2 Ada's asks for a neighbour's piece (at the station, after the order)
  'ad41-bring-print':'I need the print itself to make the frame. Ask Mr. Bassey to lend it to you. Tell him I wash my hands first.',
  'ad41-bring-letters':'Ask Tunde how he wants his name to look. Write it down. Do not let him spell it twice.',
  'ad41-bring-measure':'Ask Mrs. Oyelaran for the size of her minutes book. She will have measured it already. She measures everything.',
  'ad41-bring-sign':'Ask Mama Nkechi what the sign should say. Bring it back in her words, not yours.',
  // Ada's afara line, said at the shells mirror's order too: true for a shelf and for a frame that holds glass
  'ad41-wood-afara':'Afara: pale, light and patient. It takes a nail without a quarrel and holds glass without a crack.',
  // §13.4 Mama Nkechi's order and the neighbours' things, at their live places
  'gf41-nk-bubble':'My dear! A word, when you have a minute.',
  'gf41-nk-ask':'My dear, when you pass the Yard, tell Ada I want a stool for behind my counter. She knows my height. My legs know my age.',
  'gf41-nk-pay':'I will settle with Ada myself. Do not carry my money about. Just carry my message.',
  'gf41-ba-lend':'My wedding print, for Ada? Take it. Carry it flat, like a letter from home. Tell her the corners are older than she is.',
  'gf41-ba-lagoon2':'Another lagoon for Ada? This one has the boats in it. She may leave them out if they quarrel with her chisel.',
  'gf41-tu-letters':'Write it like this. A big T, and a curl on the e. Ada will say the curl is too much. Tell her it stays.',
  'gf41-oy-measure':'The minutes book? I measured it last year, for no reason at all. Now there is a reason. Here, on this paper.',
  'gf41-nk-words':'The sign? My name, and the café underneath. Small, until it opens. Then big. I have written it down, so Ada cannot argue.',
  // the thanks, at the receiver's live place (each opens with the small protest where it is a present)
  'gf41-nk-stool':'Ah! See this stool. Look at the legs, my dear. Now I can sit and watch Market Road like a queen. God bless you, and bless Ada.',
  'gf41-ba-frame':'My print, framed! Now that couple can stand on my wall instead of hiding in an envelope. Thank you, my friend.',
  'gf41-tu-board':'A name board for my garden corner! Now the plants have an address. And Ada kept the curl. I am moved.',
  'gf41-oy-table':'A table the exact size of the minutes book. Now the compound’s business has somewhere to sit. I will write that down.',
  'gf41-nk-sign':'So this is the sign! Just as I said it. Now I must open the café. You people are pushing me.',
  'gf41-nk-gen':'Ah ah! A {piece}, for me? You people want to spoil me. God bless you, and Ada too.',
  'gf41-nk-gen2':'Again? My dear, this {piece} is too fine for a provisions shop. I will keep it anyway, before you change your mind.',
  'gf41-nk-gen3':'Ehen! Another of Ada’s? Bring the {piece} here, where my customers will see it first. Thank you, my dear.',
  'gf41-ba-gen':'For me? A {piece}? My friend, you should not have. But since you have, thank you.',
  'gf41-ba-gen2':'You spoil an old man. A {piece} from Ada’s bench. I will tell people I knew her before she was famous.',
  'gf41-ba-gen3':'Again, my friend? First I protest, then I accept. That is the proper order. Thank you for the {piece}.',
  'gf41-tu-gen':'A {piece}! You know I will tell everybody it was my idea. Thank you.',
  'gf41-tu-gen2':'This {piece} is for me? You people! I will look after it the way I look after my seedlings. Better, even.',
  'gf41-tu-gen3':'No, no, you must not. Hm. All right, now that you have carried it this far, the {piece} is mine. Thank you, truly.',
  'gf41-oy-gen':'A {piece}. You did not have to. I will say thank you once, and mean it twice.',
  'gf41-oy-gen2':'For me? You are too kind to an old woman. It is very handsome, and I accept it gladly.',
  'gf41-oy-gen3':'I told myself I would refuse the next one. Look at me, taking the {piece} at once. Thank you.',
  // the kindness that comes back (cut item 1)
  'gf41-nk-return':'Here, take puff-puff, still hot. Nothing to do with the {piece}. Nothing pays for that. This is just because.',
  // §13.5 the gist (information; at most one a night; §9.1's conditions)
  'gs41-ad-open':'Your piece will be ready in the morning. I like it already. Do not tell it I said so.',
  'gs41-ad-ninth':'Yours I finish on the day I said. My own ninth piece I will never finish. Customers get the better of me.',
  'gs41-ad-nk':'Mama Nkechi’s stool is on my bench tonight. She will say it is too low. It is exactly right.',
  'gs41-ad-after':'Tell me where you put it. No, do not tell me. I will guess, and I will be right.',
  'gs41-ad-name':'When your guests ask who made it, say my name slowly. That is all the advertising I do.',
  'gs41-ad-gift':'I hear my work has gone to a neighbour’s. Good. Wood should be looked at by many people.',
  'gs41-ad-gift2':'Somebody told me a piece of mine went visiting today. Good. A piece that stays at home learns nothing.',
  'gs41-ba-photo':'Ada showed me your piece before the last polish. I asked to photograph it. She said only when it is finished. She is right.',
  'gs41-ba-photo2':'I saw your piece on Ada’s trestle this morning, from my corner. The light was good. My camera stayed in its bag, as she asked.',
  'gs41-oy-saw':'I heard Ada’s saw from my stairs before the Yard opened. When she saws that early, it is for a customer she likes.',
  'gs41-oy-saw2':'Ada was planing before the cocks had finished. I know that sound. Somebody’s piece was done before breakfast.',
  'gs41-nk-open':'I hear Ada is making something for your flat. That girl will not tell me what. I asked three times. I will ask again.',
  'gs41-nk-open2':'Something is coming to your flat from Ada’s bench, I am told. Nobody tells me what. In my own compound!',
  'gs41-nk-stool':'I have sat on the new stool already. My legs say thank you. My customers say I look like a chief.',
  'gs41-ba-frame':'The wedding couple go up on my wall tonight, in Ada’s frame. They have waited in that envelope long enough.',
  'gs41-tu-board':'My garden corner has a name board now. The seedlings are standing up straighter. Do not argue with me.',
  'gs41-tu-board-am':'My name board goes up at the garden corner in the morning. I have warned the seedlings to look smart.',
  'gs41-oy-table':'The minutes book has its own table now. The compound meeting will have to behave.',
  'gs41-nk-sign':'There is a sign with my name on it now, for the café. The café is not open. The sign is ready. One of us is early.',
  'gs41-nk-gen':'That piece you brought me is already the first thing my customers notice. Thank you again, my dear.',
  'gs41-nk-gen2':'Customers kept asking me today who made my new piece. I told them Ada, and I told them who brought it.',
  'gs41-nk-gen3':'My shop has looked more serious since you came by today. Your present did that. Now I must raise my standards.',
  'gs41-ba-gen':'Your present kept me company by the water today. People asked about it. I said a friend, and nothing more.',
  'gs41-ba-gen2':'Everybody at the water wanted to see what I was holding today. I let them look. I did not let them touch.',
  'gs41-ba-gen3':'Since you gave it to me I have looked at your present more than at the water. That has never happened before.',
  'gs41-ba-gen-eve':'You brought it just in time. It goes home with me after this, and I will admire it properly there.',
  'gs41-ba-gen-eve2':'Your present walks back beside me tonight. By morning it will be the finest thing in my room.',
  'gs41-tu-gen':'Everybody who passed today asked about my new piece. I said I chose the wood. That is nearly true.',
  'gs41-tu-gen2':'People in the courtyard kept stopping this afternoon to look at my new piece. I let them. I am generous like that.',
  'gs41-tu-gen3':'Your present has been admired all afternoon. I have started telling people I helped Ada carve it.',
  'gs41-oy-gen':'My new piece has been admired twice today. Once by me, once by a man waiting for the bus.',
  'gs41-oy-gen2':'I came home at six and looked at your present before I took my shoes off. From me, that is a compliment.',
  'gs41-oy-gen3':'Your present waited for me all afternoon while I was out. It was the first thing I greeted when I came in.',
  // interface strings: prompts, panels, the slate's copies, Today's lines
  'ui41-give':'Give {name} the {piece}','ui41-give-frame':'Give Mr. Bassey his frame','ui41-give-board':'Give Tunde his name board',
  'ui41-give-table':'Give Mrs. Oyelaran her writing table','ui41-give-sign':'Give Mama Nkechi her café sign','ui41-give-nkstool':'Give Mama Nkechi her stool',
  'ui41-ask-print':'Borrow the wedding print','ui41-ask-letters':'Ask Tunde for his lettering','ui41-ask-measure':'Ask for the minutes book’s size',
  'ui41-ask-words':'Ask about the sign’s words','ui41-hear':'Hear Mama Nkechi out','ui41-puff':'Take the puff-puff','ui41-tell':'I will tell Ada',
  'ui41-kicker-ask':'For Ada’s bench','ui41-kicker-give':'A piece from Ada’s bench','ui41-kicker-nk':'A word from Mama Nkechi','ui41-kicker-back':'Just because',
  'ui41-like':'{piece} like yours','ui41-like-w':'{wood} {piece} like yours',
  'ui41-today-nb':'With you: {name}’s {piece}. {where}','ui41-today-oy':'She is easiest to find in the morning, in the courtyard.',
  'ui41-today-ask':'Ada needs {thing} from {name}. {where}','ui41-today-own':'Ada needs {thing}. {where}','ui41-today-nk':'Mama Nkechi wants a word at her shop.',
  'ui41-today-msg':'Mama Nkechi’s word for Ada: give it at Ada’s slate.'},
 world:{bub:{}},
 mem:{nkBubDay:0,nkBubAt:-99,backBubDay:0},
 flags:{playtest:false,parsed:false},
 cost:{steps:0,checks:0}};

/* ======================================================================================================================================
   2. Small helpers (pure unless said)
   ====================================================================================================================================== */
function giftOnline41(){return typeof NET!=='undefined'&&!!NET&&!!NET.on;}
function giftIsAI41(i){return typeof AI!=='undefined'&&!!AI&&!!AI.on&&i===AI.i;}
function giftLog41(a){try{if(typeof LOG35!=='undefined'&&LOG35&&typeof LOG35.add==='function')LOG35.add('gift',a);}catch(e){}}
function giftToast41(m){try{if(typeof toast==='function')toast(m);}catch(e){}}
function giftOverlay41(){try{return typeof overlayOpen==='function'&&overlayOpen();}catch(e){return false;}}
function giftInGist41(){return (typeof GIST38!=='undefined'&&!!GIST38&&!!GIST38.visit)||(typeof EVENING35!=='undefined'&&!!EVENING35&&EVENING35.state!=='idle');}
function giftGistSeen41(){try{return typeof gistSeenToday38==='function'&&gistSeenToday38();}catch(e){return false;}}
function giftSave41(){try{if(typeof save==='function'&&!giftInGist41())save();}catch(e){}}
function giftFill41(t,v){return String(t).replace(/\{(\w+)\}/g,(m,k)=>v&&v[k]!=null?v[k]:m);}
function giftUp41(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1);}
function giftName41(k){return typeof CAST!=='undefined'&&CAST[k]?CAST[k].name:k;}
function giftLine41(id){if(typeof GIFT41.LINES[id]==='string')return GIFT41.LINES[id];try{if(typeof ADA41!=='undefined'&&ADA41&&ADA41.LINES&&typeof ADA41.LINES[id]==='string')return ADA41.LINES[id];}catch(e){}return '';}
function giftText41(id,v){return giftFill41(giftLine41(id),v);}
function giftH41(){return typeof hash38==='function'?hash38.apply(null,arguments):0;}
function giftLive41(){return typeof S!=='undefined'&&!!S&&!!S.p&&S.phase==='play'&&typeof players!=='undefined'&&players.length>0;}
// the v41 record (A's gistSave41), never created here
function giftB41(){if(!GIFT41.on||typeof gistSave41!=='function')return null;try{return gistSave41(false);}catch(e){return null;}}
function giftOpen41(){return GIFT41.on&&giftLive41()&&!giftOnline41()&&typeof layer41==='function'&&layer41()&&!!giftB41();}
// a neighbour's live figure (never NPC_SPOTS alone), or null while they are a guest at the rail
function giftNpc41(k){try{return typeof found38Npc==='function'?found38Npc(k):null;}catch(e){return null;}}
// the place a neighbour is at now, from the live figure: 'shop' | 'yard' (the photo or garden corner) | 'waterfront' | 'courtyard'
function giftPlace41(k){const n=giftNpc41(k);if(!n)return null;const x=n.g.position.x,z=n.g.position.z;
 if(x>18)return 'shop';if(z<-11)return 'yard';if(z>9)return 'waterfront';return 'courtyard';}
// Mrs. Oyelaran is out from 12:00 to 18:00 (no ask, no give then, whatever her figure does)
function giftOyOut41(k){return k==='oyelaran'&&S.time>=12&&S.time<18;}
function giftNbDef41(id){return GIFT41.NB.find(x=>x.id===id)||null;}
function giftFlatDef41(id){try{return ADA41.FLAT.find(f=>f.id===id)||null;}catch(e){return null;}}
// v40's card thing come back (the print for the frame, the minutes book for the table): its record of returns, its cycle's done list
function giftBack41(b,id){if(b&&b.once&&b.once['back:'+id])return true;try{const b40=S.life.gist38.b40;if(!b40)return false;
 if(Array.isArray(b40.backs)&&b40.backs.some(r=>r&&r.id===id))return true;if(b40.cards&&Array.isArray(b40.cards.done)&&b40.cards.done.includes(id)&&!(b40.card&&b40.card.id===id))return true;}catch(e){}return false;}
function giftNeedOK41(b,x){return !x.needs||giftBack41(b,x.needs);}
// the neighbour of the most recent neighbour piece (on the bench, on the trestle, in the hands, or the last given)
function giftLast41(b){for(const s of [b.piece,b.coll,b.hand])if(s&&s.list==='nb'&&s.for)return s.for;const d=b.done.nb;return d.length?d[d.length-1].for:null;}
// the first flat piece has been collected (Mama Nkechi's ask is due from then)
function giftFlatCollected41(b){if(b.done.flat.length||Object.keys(b.home).length)return true;if((b.coll&&b.coll.list==='flat')||(b.hand&&b.hand.list==='flat'))return true;
 return Array.isArray(b.once.collected)&&b.once.collected.some(r=>r&&r.list==='flat');}
function giftNkDue41(b){return !!(b&&b.nk&&!b.nk.heard&&(b.nk.due||giftFlatCollected41(b)));}

/* ======================================================================================================================================
   3. The neighbour list and "one like yours" (spec §7.1, §7.6): gift41Next is pure; its piece's onOrder books the copy when ordered
   ====================================================================================================================================== */
// every (flat piece, neighbour) pair, in a fixed order
function giftPairs41(){const out=[];for(const f of ADA41.FLAT)for(const k of GIFT41.KS){if(GIFT41.LIKE.skip.includes(f.id+':'+k))continue;out.push(f.id+':'+k);}return out;}
// the wood of a copy in a cycle: its own wood first (where its line fits), then the next fitting wood each time round
function giftWood41(fid,cyc){const f=giftFlatDef41(fid),W=GIFT41.WOODS,fit=w=>!GIFT41.WOODFIT[w]||GIFT41.WOODFIT[w].includes(fid);
 const own=f&&fit(f.wood)?f.wood:'iroko';if(!cyc)return own;const L=W.filter(w=>w!==own&&fit(w));return L[(cyc-1)%L.length];}
// the next copy: {pair, f, k, cyc} or null (pure); pairs whose flat piece is not at home yet wait
function giftLikePick41(b,last){const L=b.like||{},all=giftPairs41();let cyc=L.cycle|0,done=Array.isArray(L.done)?L.done:[];
 const busy=[b.piece,b.coll,b.hand].filter(Boolean).map(s=>giftPairOf41(s.id));
 const left=d=>{let r=all.filter(p=>!d.includes(p)&&!busy.includes(p)&&b.home[p.split(':')[0]]);if(GIFT41.LIKE.weekly)r=r.filter(p=>!giftWeekBusy41(b,p.split(':')[1]));return r;};
 const other=r=>GIFT41.LIKE.notTwice&&last?r.filter(p=>p.split(':')[1]!==last):r;
 // a cycle is over when every pair is done, or when the only pairs left are for the neighbour just given one (never twice running): the next
 // cycle starts, each pair still at most once in a cycle
 let rem=left(done);const full=all.every(p=>done.includes(p)),stuck=rem.length>0&&!other(rem).length&&all.filter(p=>!done.includes(p)).every(p=>p.split(':')[1]===last||busy.includes(p));
 if(full||stuck){cyc++;done=[];rem=left(done);}
 rem=other(rem);if(!rem.length)return null;
 // (fix round, S10) the piece type the household has given least (copies ordered, on the bench, on the trestle, in the hands or given), never
 // the type of the last copy while another can be made; then hash38 among that type's pairs, as before
 const cnt=giftLikeCounts41(b),lastF=giftLastLikeF41(b),ty=p=>p.split(':')[0];let pool=rem.filter(p=>ty(p)!==lastF);if(!pool.length)pool=rem;
 const min=Math.min.apply(null,pool.map(p=>cnt[ty(p)]|0));pool=pool.filter(p=>(cnt[ty(p)]|0)===min);
 const pair=pool[giftH41(L.n|0,GIFT41.LIKE.salt,cyc)%pool.length];const [fid,k]=pair.split(':');return {pair,f:fid,k,cyc};}
// the copies of each flat piece type made so far for neighbours: {shelf:n, ...} (pure)
function giftLikeCounts41(b){const out={},add=id=>{const m=/^like-(\w+)-/.exec(String(id||''));if(m)out[m[1]]=(out[m[1]]|0)+1;};
 for(const r of b.done.nb)if(r)add(r.id);for(const x of [b.piece,b.coll,b.hand])if(x)add(x.id);return out;}
// the type of the most recent copy (on the bench, on the trestle, in the hands, else the last given), or null (pure)
function giftLastLikeF41(b){for(const x of [b.piece,b.coll,b.hand]){const m=x&&/^like-(\w+)-/.exec(String(x.id||''));if(m)return m[1];}
 for(let j=b.done.nb.length-1;j>=0;j--){const m=b.done.nb[j]&&/^like-(\w+)-/.exec(String(b.done.nb[j].id||''));if(m)return m[1];}return null;}
function giftLikeOffer41(c){const f=giftFlatDef41(c.f),wood=giftWood41(c.f,c.cyc);if(!f)return null;
 const name=c.cyc?giftText41('ui41-like-w',{wood,piece:f.name}):giftText41('ui41-like',{piece:f.name});
 const bring=Object.assign({},f.bring,{ask:'ad41-bring-like'});
 return {id:'like-'+c.f+'-'+c.k+'-'+c.cyc,for:c.k,name,base:f.name,model:f.id,wood,price:f.price,bring,like:{pair:c.pair,f:c.f,k:c.k,cyc:c.cyc},
  onOrder:function(){giftLikeBooked41(c);}};}
// a copy ordered: the count, the pair done in its cycle (a new cycle when the last one was full)
function giftLikeBooked41(c){const b=giftB41();if(!b)return;const L=b.like;if((L.cycle|0)!==c.cyc){L.cycle=c.cyc;L.done=[];}
 if(!Array.isArray(L.done))L.done=[];if(!L.done.includes(c.pair))L.done.push(c.pair);L.n=(L.n|0)+1;L.last=c.k;}
// a copy's pair from its id ('like-<flat>-<neighbour>-<cycle>'); decision 2's bounded option: a neighbour given a piece within seven days
function giftPairOf41(id){const m=/^like-(\w+)-(\w+)-\d+$/.exec(String(id||''));return m?m[1]+':'+m[2]:null;}
function giftWeekBusy41(b,k){const d=b.like&&b.like.week?b.like.week[k]:undefined;return typeof d==='number'&&S.day-d<7;}
function giftNamedOffer41(x){const o=Object.assign({},x);delete o.needs;if(x.bring)o.bring=Object.assign({},x.bring);return o;}
// the slate's neighbour offer (pure): Mama Nkechi's message while it waits; else the first named piece due for another neighbour than the
// last; else a copy; else the named piece left (only when it is for the last neighbour and no copy can be made); else null
function gift41Next(){try{const b=giftB41();if(!b)return null;
 if(b.nk&&b.nk.heard&&!b.nk.told)return giftNamedOffer41(GIFT41.NB[0]);
 const busy=[b.piece,b.coll,b.hand].filter(Boolean).map(s=>s.id),gone=b.done.nb.map(r=>r.id),last=giftLast41(b);
 const named=GIFT41.NB.filter(x=>!x.msg&&!gone.includes(x.id)&&!busy.includes(x.id)&&giftNeedOK41(b,x)&&!(GIFT41.LIKE.weekly&&giftWeekBusy41(b,x.for)));
 const first=named.find(x=>x.for!==last);if(first)return giftNamedOffer41(first);
 const c=giftLikePick41(b,last);if(c)return giftLikeOffer41(c);
 return named.length?giftNamedOffer41(named[0]):null;}catch(e){return null;}}
// the neighbour pieces given on a day (pure): [{id, for, at:'yard'|'away', place, time}]
function gift41Given(day){const b=giftB41();if(!b)return [];return b.done.nb.filter(r=>r&&r.day===day&&r.place).map(r=>({id:r.id,for:r.for,at:r.place==='yard'?'yard':'away',place:r.place,time:r.time,ag:!!r.ag}));}

/* ======================================================================================================================================
   4. At the neighbours' live places (spec §7.2, §7.3, §7.5): the asks, Mama Nkechi's word, the gives, the kindness back. Nothing for the AI.
   ====================================================================================================================================== */
const GIFT41_ASK={print:'ui41-ask-print',photo:'ui41-photo',letters:'ui41-ask-letters',measure:'ui41-ask-measure',words:'ui41-ask-words'};
// the open piece's thing asked of a neighbour (the receiver's own thing, or Mr. Bassey's lagoon photograph): {k, kind} or null
function giftAskDue41(b){const p=b&&b.piece;if(!p||p.state!=='wait'||!p.bring||p.bring.got||p.bring.handed)return null;const B=p.bring;
 if(!GIFT41_ASK[B.kind]||!GIFT41.KS.includes(B.from))return null;return {k:B.from,kind:B.kind,p};}
// may a neighbour be given a piece now: at their live place, the evening idle, before tonight's gist (Mrs. Oyelaran also after it, in the
// courtyard), never 12:00-18:00 for her
function giftGiveOK41(k){if(giftOyOut41(k)||giftInGist41())return false;if(giftGistSeen41()&&k!=='oyelaran')return false;
 const pl=giftPlace41(k);if(!pl)return false;if(k==='nkechi'&&pl!=='shop')return false;if(k==='oyelaran'&&pl!=='courtyard')return false;return true;}
function giftAskOK41(k){return !giftOyOut41(k)&&!giftInGist41()&&!!giftNpc41(k);}
function giftBackDue41(b){const r=b&&b.returns&&b.returns.nkechi;return !!(r&&typeof r.due==='number'&&S.day>=r.due&&!r.given&&S.time>=GIFT41.NK.from&&S.time<GIFT41.NK.to);}
function giftHot41(i,list,d){if(!list||!GIFT41.on||giftOnline41())return null;const p=typeof players!=='undefined'?players[i]:null;
 if(!p||giftIsAI41(i)||(p.y||0)>1||(p.g&&p.g.sitting))return null;const b=giftB41();if(!b||typeof layer41!=='function'||!layer41())return null;const L=GIFT41.LEAD;
 const at=(k,id,label,lead)=>{const n=giftNpc41(k);if(!n)return;const dd=d(n.g.position.x,n.g.position.z);if(dd<L.reach)list.push({id,label,dist:dd-lead});};
 // give the neighbour's piece this player carries
 const h=b.hand;if(h&&h.list==='nb'&&h.for&&(h.by|0)===i&&giftGiveOK41(h.for)){const lab=GIFT41.LINES['ui41-give-'+h.id]?giftLine41('ui41-give-'+h.id):giftText41('ui41-give',{name:giftName41(h.for),piece:h.base||giftBase41(h)});at(h.for,'gift41give',lab,L.give);}
 // ask a neighbour for the open piece's thing
 const a=giftAskDue41(b);if(a&&giftAskOK41(a.k))at(a.k,'gift41ask',giftLine41(GIFT41_ASK[a.kind]),L.ask);
 // Mama Nkechi's word (her ask due, not yet heard), by day
 if(giftNkDue41(b)&&S.time>=GIFT41.NK.from&&S.time<GIFT41.NK.to&&!giftInGist41())at('nkechi','gift41hear',giftLine41('ui41-hear'),L.hear);
 // her puff-puff, a day or two after a gift to her (cut item 1)
 if(giftBackDue41(b)&&!giftInGist41())at('nkechi','gift41back',giftLine41('ui41-puff'),L.back);
 return null;}
// the plain name of a carried neighbour piece (a copy's own flat piece name)
function giftBase41(h){if(!h)return '';if(h.base)return h.base;const x=giftNbDef41(h.id);if(x)return x.name;const m=/^like-(\w+)-/.exec(String(h.id));const f=m&&giftFlatDef41(m[1]);return f?f.name:(h.name||'');}
function giftSay41(k,text){return `<div class="card say gist41-say"><span class="name">${esc(giftName41(k))}</span>${esc(text)}</div>`;}
function giftPanel41(cls,kicker,title,body){openPanel(`<section class="gist40-panel gist41-gift ${cls}"><p class="gist40-kicker">${esc(kicker)}</p><h2>${esc(title)}</h2>${body}</section>`);}
function giftBackBtn41(label,act){return `<div class="actions gist41-actions">${btn(esc(label),act||'gift41Close',{},'quiet gist41-back')}</div>`;}
// the thing asked for: the neighbour's line, the thing in the pocket (A's ada41Got)
function giftAsk41(i){const b=giftB41(),a=giftAskDue41(b);if(!a||!giftAskOK41(a.k))return;if(typeof ada41Got!=='function'||!ada41Got(a.kind))return;
 let id={print:'gf41-ba-lend',photo:'gf41-ba-lagoon',letters:'gf41-tu-letters',measure:'gf41-oy-measure',words:'gf41-nk-words'}[a.kind];
 if(a.kind==='photo'){const n=(b.once.photos|0);b.once.photos=n+1;if(n%2)id='gf41-ba-lagoon2';}
 giftLog41((a.kind==='print'?'lend ':'ask ')+a.kind);giftSave41();
 const thing=a.p.bring.thing||a.p.bring.short||'';
 giftPanel41('gist41-ask',giftLine41('ui41-kicker-ask'),giftName41(a.k),giftSay41(a.k,giftLine41(id))+`<p class="small gist41-pocket">${esc(giftText41('ui41-got',{Thing:giftUp41(thing)}))}</p>`+giftBackBtn41(giftLine41('ui41-back')));}
// Mama Nkechi's word: her ask heard (the message is the stool's thing to bring, given at Ada's slate)
function giftHear41(i){const b=giftB41();if(!giftNkDue41(b)||!giftNpc41('nkechi'))return;b.nk.due=b.nk.due||S.day;b.nk.heard=S.day;giftLog41('message nkechi');giftSave41();
 giftPanel41('gist41-nk',giftLine41('ui41-kicker-nk'),giftName41('nkechi'),giftSay41('nkechi',giftLine41('gf41-nk-ask'))+giftSay41('nkechi',giftLine41('gf41-nk-pay'))+giftBackBtn41(giftLine41('ui41-tell'),'gift41Hear'));}
// the thanks line for a given piece
const GIFT41_AB={nkechi:'nk',bassey:'ba',tunde:'tu',oyelaran:'oy'};
function giftThanksId41(h){const pre='gf41-'+GIFT41_AB[h.for]+'-',own=pre+(h.id==='nkstool'?'stool':h.id);if(!/^like-/.test(String(h.id))&&GIFT41.LINES[own])return own;
 const b=giftB41(),n=b?b.done.nb.filter(r=>r.for===h.for&&/^like-/.test(String(r.id))).length:0;return pre+'gen'+(n%3?String(n%3+1):'');}
// give the carried neighbour's piece: thanks and friendship, booked with the place and the hour (A's ada41Delivered); no money
function giftGive41(i){const b=giftB41(),h=b&&b.hand;if(!h||h.list!=='nb'||!h.for||(h.by|0)!==i||!giftGiveOK41(h.for))return;const k=h.for,place=giftPlace41(k),ag=giftGistSeen41();
 const tid=giftThanksId41(h),base=giftBase41(h);if(typeof ada41Delivered!=='function'||!ada41Delivered(k,place))return;
 const r=b.done.nb[b.done.nb.length-1];if(r&&r.id===h.id){r.base=base;if(ag)r.ag=1;}
 try{if(typeof aff==='function'&&S.nb&&S.nb[k])aff(k,1);}catch(e){}
 {const L=b.like;if(!L.week||typeof L.week!=='object')L.week={};L.week[k]=S.day;}
 // the kindness back (cut item 1): Mama Nkechi, a day or two after, at most once in fourteen days
 // (fix round, C8) never for her own stool, which she ordered and settles for herself: the kindness answers a gift
 if(k==='nkechi'&&h.id!=='nkstool'){const R=b.returns.nkechi;if(!(R&&typeof R.last==='number'&&S.day-R.last<GIFT41.RETURN.every)&&!(R&&!R.given&&typeof R.due==='number'))b.returns.nkechi={due:S.day+GIFT41.RETURN.after[giftH41(S.day,GIFT41.RETURN.salt)%2],piece:base,given:false,last:R&&R.last};}
 giftLog41('give '+h.id+':'+k+'@'+place);giftSave41();
 giftPanel41('gist41-thanks',giftLine41('ui41-kicker-give'),giftName41(k),giftSay41(k,giftText41(tid,{piece:base}))+giftBackBtn41(giftLine41('ui41-back')));}
// the puff-puff: cheer and energy as Aunty Bisi's treat, for both; nothing to pay; at most once in fourteen days
function giftBack41Take(i){const b=giftB41();if(!giftBackDue41(b)||!giftNpc41('nkechi'))return;const R=b.returns.nkechi;R.given=S.day;R.last=S.day;
 const T=typeof BISI39!=='undefined'&&BISI39&&BISI39.TREAT?BISI39.TREAT:{cheer:3,energy:5};
 try{for(const j of (typeof both==='function'?both():[0,1])){if(typeof cheer==='function')cheer(j,T.cheer);S.p[j].energy=Math.max(0,Math.min(100,(S.p[j].energy||0)+T.energy));}}catch(e){}
 giftLog41('back nkechi');giftSave41();
 giftPanel41('gist41-back',giftLine41('ui41-kicker-back'),giftName41('nkechi'),giftSay41('nkechi',giftText41('gf41-nk-return',{piece:R.piece||'piece'}))+giftBackBtn41(giftLine41('ui41-back')));}
const GIFT41_KINDS=['gift41give','gift41ask','gift41hear','gift41back'];
function giftAct41(i,kind){if(!GIFT41_KINDS.includes(kind))return false;if(giftOnline41()||giftIsAI41(i))return true;
 // (repair 2) a touch Act by the last pointer's pointerType (daily-v41.js)
 const touch=typeof dailyTouch41==='function'?dailyTouch41(i):(typeof dailyTouch40==='function'&&dailyTouch40(i)),was=giftOverlay41();
 if(!was){if(kind==='gift41give')giftGive41(i);else if(kind==='gift41ask')giftAsk41(i);else if(kind==='gift41hear')giftHear41(i);else giftBack41Take(i);}
 // a panel opened by a touch Act holds its taps (daily-v40.js's hold and dimming apply to every .gist40-panel)
 try{if(touch&&!was&&typeof dailyPanel40==='function'&&dailyPanel40()&&typeof FOUND38!=='undefined')DAILY40.hold=FOUND38.t+DAILY40.HOLD;}catch(e){}
 return true;}

/* ======================================================================================================================================
   5. The per-frame step (the EVENING35.tick wrapper below, outermost): Mama Nkechi's bubble when her word is due, the puff-puff's call, and
   the records v40's card things leave (the print and the minutes book back), checked four times a second; an inert frame returns at once
   ====================================================================================================================================== */
function giftNear41(k,r){const n=giftNpc41(k);if(!n||typeof players==='undefined')return false;for(const p of players){if(!p||!p.g||giftIsAI41(p.i))continue;if(Math.hypot(p.g.position.x-n.g.position.x,p.g.position.z-n.g.position.z)<r)return true;}return false;}
function giftCheck41(){const G=GIFT41;G.cost.checks++;if(!giftOpen41())return;const b=giftB41();
 for(const id of ['print','minutes'])if(!b.once['back:'+id]&&giftBack41(b,id))b.once['back:'+id]=S.day;
 if(giftInGist41()||giftOverlay41())return;const day=S.day,by=S.time>=G.NK.from&&S.time<G.NK.to;
 if(by&&giftNkDue41(b)&&G.mem.nkBubDay!==day&&giftNear41('nkechi',G.NK.near)){const n=giftNpc41('nkechi');if(n&&typeof bubble41==='function'&&bubble41(giftLine41('gf41-nk-bubble'),3600,n.g,2.1)){G.mem.nkBubDay=day;if(!b.nk.due)b.nk.due=day;}}}
GIFT41.step=function(dt){const G=GIFT41;dt=Math.max(0,+dt||0);G.t+=dt;G.cost.steps++;if(G.t<G.checkAt)return;G.checkAt=G.t+0.25;giftCheck41();};

/* ======================================================================================================================================
   6. The gist (spec §9): the plan wrapper (outermost, after v40's; pure) and the done wrapper (books before v40's single save)
   ====================================================================================================================================== */
// a family's line for tonight: the first id not said within fourteen evenings, the never-said first, then the one said longest ago (pure)
function gistFam41(b,fam,only){const ids=GIFT41.FAM[fam]&&only?GIFT41.FAM[fam].filter(id=>only.includes(id)):GIFT41.FAM[fam];if(!ids)return null;const said=b.said||{};
 const ok=ids.filter(id=>!(typeof said[id]==='number'&&S.day-said[id]<GIFT41.SAID_DAYS)&&said[id]!==S.day);if(!ok.length)return null;
 const never=ok.filter(id=>typeof said[id]!=='number');if(never.length)return never[0];return ok.slice().sort((x,y)=>said[x]-said[y])[0];}
// a gift booked today before the gist (and Mrs. Oyelaran's after the previous gist): the receiver's family by the place and hour (§9.1, §9.3)
function gistMention41(r){const k=r.for,t=+r.time||0,named=giftNbDef41(r.id),like=/^like-/.test(String(r.id));
 if(k==='nkechi'){if(r.place!=='shop')return null;return r.id==='nkstool'?'nk-stool':r.id==='sign'?'nk-sign':like?'nk-gen':null;}
 if(k==='bassey'){if(r.id==='frame')return 'ba-frame';if(like)return t<18?'ba-gen':'ba-gen-eve';return null;}
 if(k==='tunde'){if(r.id==='board')return r.place==='yard'&&t<12?'tu-board':'tu-board-am';if(like)return t<15?'tu-gen':null;return null;}
 if(k==='oyelaran'){if(r.id==='table')return (t<12||t>=18)?'oy-table':null;if(like)return t<12&&r.day===S.day?'oy-gen':null;return null;}
 return named?null:null;}
// tonight's candidates in §9.1's order: [{k, fam, key}] (pure)
function gistCands41(b,p){const out=[],day=S.day,g=p.guests;
 // 1. the receivers' mentions
 const gifts=b.done.nb.filter(r=>r&&(r.day===day&&!r.ag||(r.for==='oyelaran'&&r.id==='table'&&r.ag&&(r.day===day-1))));
 for(const r of gifts.slice().reverse()){const fam=gistMention41(r);if(fam)out.push({n:1,k:r.for,fam,key:r.id+'@'+r.day});}
 // 2. Ada after a flat piece went in today
 const inToday=ADA41.FLAT.filter(f=>b.home[f.id]===day);if(inToday.length)out.push({n:2,k:'ada',fam:'ad-flat',key:inToday[inToday.length-1].id});
 // 3. Ada's hearsay after a gift away from the Yard (at the shop; at the waterfront or in the courtyard only by day on a day she is at her
 // bench, so she was not there to see it), its receiver not a guest
 const visit=(()=>{try{const v=S.life.visit;return !!(v&&v.k==='ada'&&v.day===day);}catch(e){return false;}})();
 for(const r of b.done.nb)if(r&&r.day===day&&!r.ag&&!g.includes(r.for)&&(r.place==='shop'||((r.place==='waterfront'||r.place==='courtyard')&&(+r.time)<18&&!visit))){out.push({n:3,k:'ada',fam:'ad-gift',key:r.id+'@'+r.day});break;}
 // 4. Ada on a piece cut tonight: the household's own or a paid gift; Mama Nkechi's stool its own line
 const pc=b.piece;if(pc&&pc.state==='cut'&&pc.cutDay===day){if(pc.id==='nkstool')out.push({n:4,k:'ada',fam:'ad-nk',key:pc.id+'@'+day});else if(pc.list==='flat'||(pc.price|0)>0)out.push({n:4,k:'ada',fam:'ad-open',key:pc.id+'@'+day});}
 // 5. Mr. Bassey on the polish: a piece collected at the Yard's station today after 08:15 (it lay on the trestle during his morning there)
 // (fix round, C4) never for Mama Nkechi's stool (not the household's piece) or for a piece made for Mr. Bassey himself; (repair 2, R2-5) only
 // for the household's own pieces for the flat ("Ada showed me your piece": never Tunde's name board or any neighbour's piece)
 const col=typeof ada41Collected==='function'?ada41Collected(day).filter(r=>r.at==='yard'&&r.time>=8.25).filter(r=>r.list==='flat'):[];if(col.length)out.push({n:5,k:'bassey',fam:'ba-photo',key:col[col.length-1].id+'@'+day});
 // 6. Mrs. Oyelaran on the early saw: a piece became ready this morning (made overnight at the Yard)
 const am=b.once.readyAm;if(am&&am.day===day)out.push({n:6,k:'oyelaran',fam:'oy-saw',key:am.id+'@'+day});
 // 7. Mama Nkechi's hearsay: a flat piece open on Ada's bench ((fix round, C14a) "making something" only while it is cut and being made
 // tonight; waiting for its thing, or ready, only "Something is coming")
 if(pc&&pc.list==='flat')out.push({n:7,k:'nkechi',fam:'nk-open',key:pc.id+'@'+(pc.orderDay|0),only:pc.state==='cut'&&!(pc.cutDay<day)?null:['gs41-nk-open2']});
 return out;}
// where the line goes (§9.2): a free reaction by the speaker (rule 1), else a line v40's repeat guard swapped in for the speaker (rule 2);
// never an insert, and (fix round, DOD-4 and S13) never a guest's opener or goodbye (an entry flagged open, or of v38's o: or by: category,
// its own or the one v40's guard swapped out), so every evening still opens with a greeting and ends with a goodbye. Returns the index or -1
// (pure)
function gistSlotOK41(s){if(!s||s.open)return false;const c=String(s.cat||'')+'|'+String(s.swap40&&s.swap40.cat||'');return !/(^|\|)(o|by):/.test(c);}
function gistPlace41(sc,k){const m=sc.g40||null,moved=m&&m.moved;
 for(let q=2;q<sc.length;q++){const s=sc[q];if(s&&s.k===k&&gistSlotOK41(s)&&s.cat&&String(s.cat).startsWith('re:')&&!s.info&&!s.tip&&!s.v40k&&!s.once&&!s.v39k&&!s.trans&&!s.g40&&!s.v41k&&s.id!==moved)return q;}
 for(let q=0;q<sc.length;q++){const s=sc[q];if(s&&s.k===k&&s.swap40&&gistSlotOK41(s)&&['v38','season','evergreen'].includes(s.g40t)&&!s.info&&!s.tip&&!s.trans&&!s.once&&!s.v39k&&!s.v41k&&s.id!==moved)return q;}
 return -1;}
function gistPlan41(p){if(!GIFT41.on||!p||!Array.isArray(p.script)||!Array.isArray(p.guests)||p.guests.length<2||giftOnline41())return null;
 const b=giftB41();if(!b)return null;const said=b.saidFor||{};
 for(const c of gistCands41(b,p)){if(!p.guests.includes(c.k))continue;if(said[c.fam+':'+c.key])continue;const id=gistFam41(b,c.fam,c.only);if(!id)continue;
  const q=gistPlace41(p.script,c.k);if(q<0)continue;
  const sc=p.script.map(s=>Object.assign({},s));for(const x of Object.keys(p.script))if(!/^\d+$/.test(x))sc[x]=p.script[x];
  const old=sc[q],e={k:c.k,id,text:giftLine41(id),v41k:id,info:1,key41:c.fam+':'+c.key};
  if(old.swap40)e.swap40=Object.assign({},old.swap40);else if(old.cat)e.swap40={cat:old.cat,id:old.id};
  sc[q]=e;sc.g41={id,n:c.n,at:q,rule:old.cat&&String(old.cat).startsWith('re:')&&!old.g40&&!old.swap40?1:2,replaced:old.id};
  return Object.assign({},p,{guests:p.guests.slice(),script:sc});}
 return null;}
if(GIFT41.on&&typeof gistPlan38==='function'){const prevPlan41=gistPlan38;
 gistPlan38=function(){                                                          // v41: one line about the commissions on top of v40's plan (pure)
  const p=prevPlan41.apply(this,arguments);try{const q=gistPlan41(p);return q||p;}catch(e){if(typeof console!=='undefined')console.warn('gift41 plan',e);return p;}};}
// after the gist: the v41 ids shown booked (said, and said for their piece) BEFORE v40's wrapper, whose one save carries them
if(GIFT41.on&&typeof gistDone38==='function'){const prevDone41=gistDone38;gistDone38=function(v){
 try{const b=giftB41();if(b&&v&&Array.isArray(v.script)){const E=typeof EVENING35!=='undefined'?EVENING35:null,shown=(E&&Array.isArray(E.lines)?E.lines:[]).map(l=>l.id||null);
  v.script.forEach((s,k)=>{if(!s||!s.v41k||shown[k]!==s.id)return;b.said[s.v41k]=S.day;if(s.key41)b.saidFor[s.key41]=S.day;});
  for(const id in b.said)if(!(S.day-b.said[id]<GIFT41.PRUNE))delete b.said[id];
  for(const id in b.saidFor)if(typeof b.saidFor[id]==='number'&&!(S.day-b.saidFor[id]<GIFT41.PRUNE))delete b.saidFor[id];}}
 catch(e){if(typeof console!=='undefined')console.warn('gift41 done',e);}
 return prevDone41.apply(this,arguments);};}

/* ======================================================================================================================================
   7. Today's neighbour line (the integrator's v41 block reads it): a neighbour's piece in the hands, a thing to ask a neighbour for, Mama
   Nkechi's word or her message; each by the neighbour's live place and the hour (BOARD40.WHERE's timetable, read only)
   ====================================================================================================================================== */
function giftWhere41(k){if(k==='oyelaran'&&S.time>=12&&S.time<18)return '';try{return typeof boardWhere40==='function'?boardWhere40(k):'';}catch(e){return '';}}
function gift41Today(){try{if(!giftOpen41())return null;const b=giftB41(),h=b.hand;
 const where=k=>k==='oyelaran'&&S.time>=12&&S.time<18?giftLine41('ui41-today-oy'):giftWhere41(k);
 if(h&&h.list==='nb'&&h.for)return {html:esc(giftText41('ui41-today-nb',{name:giftName41(h.for),piece:giftBase41(h),where:where(h.for)}).trim()),k:'nbhand'};
 const a=giftAskDue41(b);if(a){const th=a.p.bring.thing,nm=giftName41(a.k);return {html:esc(giftText41(th.indexOf(nm)===0?'ui41-today-own':'ui41-today-ask',{thing:th,name:nm,where:where(a.k)}).trim()),k:'ask'};}
 if(b.nk&&b.nk.heard&&!b.nk.told)return {html:esc(giftLine41('ui41-today-msg')),k:'msg'};
 if(giftNkDue41(b))return {html:esc(giftLine41('ui41-today-nk')),k:'nk'};
 return null;}catch(e){return null;}}

/* ======================================================================================================================================
   8. The actions, the wrappers and the hooks (spec §1.4, §1.5): every one inside the guard
   ====================================================================================================================================== */
function giftFlags41(){const F=GIFT41.flags;if(F.parsed)return F;F.parsed=true;
 try{const q=new URLSearchParams((typeof location!=='undefined'&&location.search)||'');if(q.get('gift41')==='playtest'){F.playtest=true;try{if(typeof sessionStorage!=='undefined')sessionStorage.setItem('gist41.flag.gift41-playtest','1');}catch(e){}}}catch(e){}
 return F;}
if(GIFT41.on&&typeof ACTIONS!=='undefined'){
 ACTIONS.gift41Close=function(){try{closePanel();}catch(e){}giftSave41();};
 ACTIONS.gift41Hear=function(){try{closePanel();}catch(e){}giftSave41();};
 if(typeof LOCAL_ONLY!=='undefined')for(const n of ['gift41Close','gift41Hear'])LOCAL_ONLY.add(n);}
// the neighbours run last (outermost after ada-v41.js's wrapper)
if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.tick==='function'&&typeof ADA41!=='undefined'&&ADA41.on&&GIFT41.on){
 const prevEveTick41b=EVENING35.tick;EVENING35.tick=function(dt){const r=prevEveTick41b.apply(this,arguments);
  try{GIFT41.step(dt);}catch(e){if(typeof console!=='undefined')console.warn('gift41',e);}return r;};}
if(GIFT41.on&&typeof HOTSPOT_HOOKS!=='undefined')HOTSPOT_HOOKS.push(giftHot41);
if(GIFT41.on&&typeof ACT_HOOKS!=='undefined')ACT_HOOKS.push(function(i,kind,arg){return giftAct41(i,kind,arg);});
if(GIFT41.on&&typeof LOG35!=='undefined'&&LOG35&&Array.isArray(LOG35.kinds)&&!LOG35.kinds.includes('gift'))LOG35.kinds.push('gift');
// the morning: a piece that became ready overnight (Mrs. Oyelaran's saw); the bubble's day
if(GIFT41.on&&typeof ACTIONS!=='undefined'&&typeof ACTIONS.nextday==='function'){const prevNextday41b=ACTIONS.nextday;ACTIONS.nextday=function(){
 const r=prevNextday41b.apply(this,arguments);
 try{const b=giftB41(),p=b&&b.piece;if(p&&typeof p.cutDay==='number'&&p.cutDay===S.day-1){b.once.readyAm={day:S.day,id:p.id};giftSave41();}GIFT41.mem.nkBubDay=0;GIFT41.checkAt=0;}catch(e){}return r;};}
if(GIFT41.on)giftFlags41();
if(GIFT41.on&&typeof enterWorld==='function'){const prevEnter41b=enterWorld;enterWorld=function(){try{giftFlags41();GIFT41.mem.nkBubDay=0;}catch(e){}
 const r=prevEnter41b.apply(this,arguments);
 try{if(GIFT41.flags.playtest){const b=giftB41();if(b&&b.nk&&!b.nk.heard&&!b.nk.due)b.nk.due=S.day;}GIFT41.checkAt=0;}catch(e){}return r;};}
if(GIFT41.on&&typeof ACTIONS!=='undefined'){const prev=ACTIONS.newgame;if(typeof prev==='function')ACTIONS.newgame=function(){try{GIFT41.mem.nkBubDay=0;}catch(e){}return prev.apply(this,arguments);};}

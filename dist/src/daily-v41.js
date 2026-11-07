/* v41 Ada's commissions: Today's v41 block and the touch guard for v41's panels (the integrator; v41/SPEC.md §1.1, §10.5, §14.1).
   Owner decision 2, after the lists, "Every day, for good": "A piece for a neighbour can be ordered every day, so mornings keep a purpose. A
   neighbour's kindness back comes at most once a fortnight, so gifts don't feel like a treadmill of thanks." Today says each morning what the
   piece on Ada's bench wants, so a household knows where its morning goes.
   - Today's v41 block: a todayHTML34 wrapper (outermost, after daily-v40's) puts one small block of its own straight after v40's block (or, with
     no v40 block, where v40's would go: before the gist card, else before the chips), so the gist card's cap of rows never drops it and v40's
     block keeps its own lines. No DAYS35.rows push, no gist card row. Only after v41's discovery (G.b41) and with layer 2 open, offline. At most
     two lines (DAILY41.MAX), one at a width of 480 px or less (MAX_NARROW, the gist card's own narrow test), in this order of urgency (§14.1),
     the first that apply:
       1. a piece ready at the station (or paid for and waiting for its last polish on the trestle);
       2. a piece in the hands: a flat piece (ada41Today's line), a neighbour's piece with where that neighbour is by the hour (gift41Today's
          line; Mrs. Oyelaran after noon: "easiest to find in the morning");
       3. a thing to bring: from Palm Court Finds or Dayo's fabrics (ada-v41.js's line), or from a neighbour at their live place by the hour
          (gifts-v41.js's line);
       4. Mama Nkechi's word (her ask due, or her message to give at the slate);
       5. a piece being made tonight;
       6. nothing open: the slate's two offers, the gentlest line, only on a day nothing else applies.
     The words are A's and B's own (ada41Today, gift41Today and their ui41-today strings) and, for the sixth line only, DAILY41.LINES (written
     UI, standard English, no price). Everything here is pure: Today never writes state.
   - The touch guard for v41's panels: every v41 panel carries the class gist40-panel, so daily-v40.js's click swallowing, its 1.0 s hold
     (restarted by every press while it runs) and the dimmed buttons apply unchanged; ada-v41.js and gifts-v41.js arm DAILY40.hold in their own
     act functions when a panel opens from a touch Act (dailyTouch40), and the collection panel re-arms it on every step (adaRearm41). This file
     adds the two re-renders those miss, for touch and keyboard alike, so a second tap never lands on a button that was not there for the first:
       - the slate panel after "Order this" (the terms, Ada's ask and the shells button take the offers' place) and after "Give Ada three
         smooth shells": the hold is re-armed (DAILY40.hold), as the collection does on each step;
       - the shop block's "Buy it" on the Finds page and on Dayo's stall: those are base panels (not .gist40-panel), and the block goes once the
         thing is bought, so the cards move up under the thumb. For DAILY41.HOLD after a buy, clicks inside the panel are swallowed (every press
         while it runs restarts it) and its buttons are shown dimmed (#panel.gist41-held), read each frame on the EVENING35.tick by property.
   Installs nothing unless ADA41 installed itself (and so BOARD40, GIST40 and DAILY40); the copies without v40, v39 or v38 and the subset copies
   load it with no hook, no wrapper and no global write but its own declarations. No Math.random, no wall clock, no performance.now.
   - (fix round, S1) The fishing panel: at 390 x 844 a touch Act at the rocks opened the panel and the touchend's click closed it at once ("Back
     to the shore" sits under the thumb). A doFish wrapper (the original first) holds clicks inside #panel for DAILY41.FISH after a touch Act
     opens it, and while that pointer is down until just after it comes up (dailyClick41's capture, as for the shop hold). A keyboard Act, and
     every Node harness (no pointer), arms nothing.
   - (repair 2) A touch Act is decided by the last pointer's pointerType (dailyPtr41 records it at every pointerdown, capture phase): v38's
     timing test (a pointer down now, or within its RECENT) and a pointer that was not a mouse, so a mouse click just before a key press never
     arms the fishing hold or a v41 panel's hold (dailyTouch41; ada-v41.js and gifts-v41.js read it). The Node harnesses send no pointer event,
     so their touch Acts are as before.
   - (repair 2, the purse) When Mallam is keeping an order tonight and the purse holds less than his price, Today's Mallam line (v40's
     mallam40Today, wrapped: the original first) says so plainly in the same line ("They are ₦2,000; the purse holds ₦600."), so Today keeps its
     cap of lines; only after v41's discovery with layer 2 open (dailyPurse41, pure, which the end measurement counts).
   Public names (all end in 41): DAILY41, dailyArt41, dailyName41, todayLines41, todayBlock41, dailyRearm41, dailyPointer41, dailyClick41,
   dailyDim41, dailyUp41, dailyFishArm41, dailyPtr41, dailyTouch41, dailyPurse41; the wrapper bindings prevToday41, prevOrder41, prevShells41,
   prevBuy41, prevFish41, prevMallamToday41 and prevEveTick41d. */
'use strict';
const DAILY41={v:1,on:false,MAX:2,MAX_NARROW:1,NARROW:480,
 // §14.1's order of urgency, by the key each module's Today line carries ((fix round, DOD-6) pocket and shells: a thing to bring)
 RANK:{ready:1,coll:1,hand:2,nbhand:2,bring:3,ask:3,pocket:3,shells:3,msg:4,nk:4,cut:5,slate:6},
 HOLD:1.0,shop:-1,dim:false,n41:{rearm:0,shop:0,swallow:0,fish:0,fishSwallow:0},
 // (fix round, S1) the fishing panel opened by a touch Act at the rocks: clicks inside the panel are swallowed for FISH s of FOUND38.t, and
 // while that pointer is still down until just after it comes up (AFTER), so the touchend's click never lands on "Back to the shore"
 FISH:0.35,AFTER:0.05,fish:-1,fishDown:false,
 // (repair 2) the last pointerdown's pointerType ('' before any, and in Node); Mallam's price for the purse line (mallam-v40.js's ₦2,000)
 ptype:'',PRICE:2000,
 LINES:{
  // the slate's offers, put together from parts: "Ada’s slate: a kitchen shelf for your flat, or a name board for the garden corner, for Tunde."
  'ui41-today-slate':'Ada’s slate: {offers}.','ui41-today-slate-flat':'{flat} for your flat','ui41-today-slate-nb':'{nb}, for {name}','ui41-today-slate-or':'{a}, or {b}',
  // a neighbour's piece is never "your" piece (spec §9.1, finding 18): Mama Nkechi's stool and the gifts by the neighbour's name
  'ui41-today-ready-nb':'{name}’s {piece} is ready at Ada’s bench.',
  'ui41-today-veranda-nb':'Ada has brought {name}’s {piece} along to the veranda.',
  'ui41-today-cut-nb':'{name}’s {piece} is on Ada’s bench tonight, done by morning.',
  'ui41-today-coll-nb':'The last polish is still to do on {name}’s {piece}, at Ada’s trestle.',
  // (fix round, DOD-6) a thing for Ada already bought or given, not yet handed over; the shells still owed for a mirror
  'ui41-today-pocket':'With you for Ada: {thing}, to hand over at her slate.',
  'ui41-today-shells':'Ada still needs three smooth shells for the {piece}.',
  // (repair 2) the purse short of Mallam's price
  'ui41-today-purse':'They are {price}; the purse holds {money}.'}};
// "a kitchen shelf", "an obeche box" (a piece's name as the slate's offer gives it)
function dailyArt41(s){s=String(s||'');return (/^[aeiou]/i.test(s)?'an ':'a ')+s;}
function dailyName41(k){return typeof CAST!=='undefined'&&CAST&&CAST[k]?CAST[k].name:String(k||'');}
// every line that applies now, in §14.1's order: [{k, html, r}] (pure)
function todayLines41(){if(!DAILY41.on)return [];
 try{if(typeof layer41!=='function'||!layer41()||typeof gistSave41!=='function')return [];const b=gistSave41(false);if(!b)return [];
  const out=[],push=(k,html)=>{if(html&&!out.some(x=>x.k===k))out.push({k,html,r:DAILY41.RANK[k]||9});};
  // A's lines: the piece ready on the bench, on the trestle and in the hands, the thing to buy, the piece being made (ada41Today's words for the
  // household's own pieces; a neighbour's piece by the neighbour's name)
  const h=b.hand,p=b.piece,L=DAILY41.LINES,fill=(t,v)=>String(t).replace(/\{(\w+)\}/g,(m,k)=>v[k]!=null?v[k]:m);
  const nbv=x=>x&&x.list==='nb'&&x.for?{name:dailyName41(x.for),piece:adaPieceName41(x)}:null;
  if(typeof adaText41==='function'&&typeof adaPieceName41==='function'&&typeof adaReady41==='function'){
   if(p&&adaReady41(p)){const ver=typeof ada41Where==='function'&&ada41Where()==='veranda'&&!!ada41Station(),v=nbv(p);
    const pay=p.bal>0&&typeof adaNaira41==='function'?' '+adaText41('ui41-today-pay',{bal:adaNaira41(p.bal)}):'';
    // (repair 2) a visit day with no room for Ada's trestle on the veranda: collected at her bench tomorrow (ada-v41.js's sentence after the line)
    const later=!ver&&typeof adaReadyLater41==='function'&&adaReadyLater41()?' '+adaLine41('ui41-today-tomorrow'):'';
    push('ready',esc(v?fill(L[ver?'ui41-today-veranda-nb':'ui41-today-ready-nb'],v)+(ver?'':later+pay):ver?adaText41('ui41-today-veranda',{piece:adaPieceName41(p)}):adaText41('ui41-today-ready',{piece:adaPieceName41(p)})+later+pay));}
   if(b.coll){const v=nbv(b.coll);push('coll',esc(v?fill(L['ui41-today-coll-nb'],v):adaText41('ui41-today-coll',{piece:adaPieceName41(b.coll)})));}
   if(h&&h.list==='flat')push('hand',esc(h.id==='plate'&&typeof adaLine41==='function'?adaLine41('ui41-today-hand-plate'):adaText41('ui41-today-hand',{piece:adaPieceName41(h)})));
   if(p&&p.state==='wait'&&p.bring&&!p.bring.got&&(p.bring.from==='finds'||p.bring.from==='dayo')&&typeof ADA41!=='undefined')
    push('bring',esc(adaText41('ui41-today-bring',{thing:p.bring.thing,place:ADA41.PLACES[p.bring.from]})));
   // (fix round, DOD-6) the thing in the pocket for Ada, and the shells she still waits for
   if(p&&p.state==='wait'&&p.bring&&p.bring.got&&!p.bring.handed)push('pocket',esc(fill(L['ui41-today-pocket'],{thing:p.bring.thing||p.bring.short||''})));
   if(p&&p.state==='wait'&&p.bring&&p.bring.shells&&!p.bring.shellsGiven)push('shells',esc(fill(L['ui41-today-shells'],{piece:adaPieceName41(p)})));
   if(p&&p.state==='cut'&&!adaReady41(p)){const v=nbv(p);push('cut',esc(v?fill(L['ui41-today-cut-nb'],v):adaText41('ui41-today-cut',{piece:adaPieceName41(p)})));}}
  // B's lines: a neighbour's piece in the hands, a neighbour's thing to ask for, Mama Nkechi's word (gift41Today gives the first; a neighbour's
  // thing is asked by the same words when a neighbour's piece is in the hands too)
  const gt=typeof gift41Today==='function'?gift41Today():null;if(gt&&gt.html)push(gt.k,gt.html);
  if(gt&&gt.k==='nbhand'&&typeof giftAskDue41==='function'&&typeof giftText41==='function'){const a=giftAskDue41(b);
   if(a){const th=a.p.bring.thing,nm=giftName41(a.k),where=a.k==='oyelaran'&&S.time>=12&&S.time<18?giftLine41('ui41-today-oy'):giftWhere41(a.k);
    push('ask',esc(giftText41(th.indexOf(nm)===0?'ui41-today-own':'ui41-today-ask',{thing:th,name:nm,where}).trim()));}}
  if(gt&&(gt.k==='nbhand'||gt.k==='ask')&&b.nk&&typeof giftLine41==='function'){if(b.nk.heard&&!b.nk.told)push('msg',esc(giftLine41('ui41-today-msg')));
   else if(typeof giftNkDue41==='function'&&giftNkDue41(b))push('nk',esc(giftLine41('ui41-today-nk')));}
  // 6. nothing open (no piece on the bench, the trestle or in the hands, nothing asked): the slate's offers
  if(!out.length&&!p&&!b.coll&&!h&&typeof ada41Next==='function'){const n=ada41Next(),f=n.flat,nb=n.nb&&!n.nb.msg?n.nb:null;
   const a=f?fill(L['ui41-today-slate-flat'],{flat:dailyArt41(f.name)}):'',c=nb?fill(L['ui41-today-slate-nb'],{nb:dailyArt41(nb.base||nb.name),name:dailyName41(nb.for)}):'';
   const offers=a&&c?fill(L['ui41-today-slate-or'],{a,b:c}):a||c;if(offers)push('slate',esc(fill(L['ui41-today-slate'],{offers})));}
  return out.sort((x,y)=>x.r-y.r);}catch(e){return [];}}
// the block: the first lines that apply, two at most, one on a narrow screen (pure)
function todayBlock41(){if(!DAILY41.on||typeof S==='undefined'||!S||!S.life||!S.life.gist38||(typeof NET!=='undefined'&&NET&&NET.on))return '';
 const cap=(typeof innerWidth==='number'&&innerWidth<=DAILY41.NARROW)?DAILY41.MAX_NARROW:DAILY41.MAX;
 const lines=todayLines41().slice(0,cap);if(!lines.length)return '';
 return `<div class="life-note34 gist41-today" data-today41="1">${lines.map(x=>`<p class="small gist41-today-${x.k}">${x.html}</p>`).join('')}</div>`;}
// a v41 panel re-rendered by its own button: the hold re-armed, as the collection does on each step (touch and keyboard alike)
function dailyRearm41(){try{if(typeof dailyPanel40==='function'&&dailyPanel40()&&typeof FOUND38!=='undefined'){DAILY40.hold=FOUND38.t+DAILY40.HOLD;DAILY41.n41.rearm++;}}catch(e){}}
// after "Buy it": a press while the shop hold runs starts it again; with no panel open it is dropped
function dailyPointer41(){const D=DAILY41;try{if(!(FOUND38.t<D.shop))return;if(!(typeof overlayOpen==='function'&&overlayOpen())){D.shop=-1;return;}D.shop=FOUND38.t+D.HOLD;}catch(e){}}
// after "Buy it", and (fix round, S1) just after a touch Act opened the fishing panel: a click inside the panel is swallowed (capture phase);
// true when it swallowed it
function dailyClick41(e){try{const D=DAILY41,shop=FOUND38.t<D.shop,fish=D.fishDown||FOUND38.t<D.fish;if(!shop&&!fish)return false;const t=e&&e.target;if(!(t&&typeof t.closest==='function'&&t.closest('#panel')))return false;
 if(e.preventDefault)e.preventDefault();if(e.stopImmediatePropagation)e.stopImmediatePropagation();if(e.stopPropagation)e.stopPropagation();if(shop)D.n41.swallow++;else D.n41.fishSwallow++;return true;}catch(x){return false;}}
// (fix round, S1) the pointer that opened the fishing panel comes up: its click (made at once) still falls inside AFTER
function dailyUp41(){const D=DAILY41;try{if(!D.fishDown)return;D.fishDown=false;D.fish=Math.max(D.fish,FOUND38.t+D.AFTER);}catch(e){}}
// (fix round, S1) the fishing panel opened by a touch Act (v38's test: a pointer down now, or within its RECENT): the clicks held (pure test)
function dailyFishArm41(i,was){const D=DAILY41;try{if(was||!(typeof overlayOpen==='function'&&overlayOpen()))return false;if(!dailyTouch41(i))return false;
 D.fish=FOUND38.t+D.FISH;D.fishDown=typeof GUARD38!=='undefined'&&GUARD38.ptr>0;D.n41.fish++;return true;}catch(e){return false;}}
// (repair 2) every pointerdown's pointerType, kept (capture phase)
function dailyPtr41(e){try{DAILY41.ptype=e&&typeof e.pointerType==='string'?e.pointerType:'';}catch(x){}}
// (repair 2) a touch Act: v38's timing test, by a pointer that was not a mouse (pure)
function dailyTouch41(i){try{if(!(typeof dailyTouch40==='function'&&dailyTouch40(i)))return false;return DAILY41.ptype!=='mouse';}catch(e){return false;}}
// (repair 2, the purse) Mallam keeping an order tonight and the purse below his price, after v41's discovery: {price, money} or null (pure)
function dailyPurse41(){try{if(!DAILY41.on||typeof layer41!=='function'||!layer41()||typeof gistSave41!=='function'||!gistSave41(false))return null;
 if(typeof mallamRec40!=='function')return null;const m=mallamRec40(false);if(!m||!m.order||m.kept===S.day)return null;const money=S.money|0;return money<DAILY41.PRICE?{price:DAILY41.PRICE,money}:null;}catch(e){return null;}}
// the shop hold shown: the panel's buttons dimmed while it runs; the class touched only when that changes
function dailyDim41(){const D=DAILY41;try{const on=FOUND38.t<D.shop&&typeof overlayOpen==='function'&&overlayOpen();if(on===D.dim)return;D.dim=on;if(typeof panel!=='undefined'&&panel&&panel.classList)panel.classList.toggle('gist41-held',on);}catch(e){}}
if(typeof ADA41!=='undefined'&&ADA41&&ADA41.on&&typeof DAILY40!=='undefined'&&DAILY40&&DAILY40.on){
 DAILY41.on=true;
 // wrap (outermost): Today's v41 block straight after v40's block, or where v40's would go
 if(typeof todayHTML34==='function'){const prevToday41=todayHTML34;todayHTML34=function(){const h=prevToday41.apply(this,arguments);
  try{if(typeof h!=='string')return h;const blk=todayBlock41();if(!blk)return h;let at=-1;const v40=h.indexOf('<div class="life-note34 gist40-today"');
   if(v40>=0){const end=h.indexOf('</div>',v40);if(end>=0)at=end+6;}
   if(at<0)at=h.indexOf('<div class="life-note34 gist38-card">');if(at<0)at=h.indexOf('<div class="life-chips34">');
   return at<0?h:h.slice(0,at)+blk+h.slice(at);}catch(e){if(typeof console!=='undefined')console.warn('daily41 today',e);return h;}};}
 // the slate re-rendered by "Order this" and by "Give Ada three smooth shells": the hold re-armed
 if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.ada41Order==='function'){const prevOrder41=ACTIONS.ada41Order;ACTIONS.ada41Order=function(){const r=prevOrder41.apply(this,arguments);dailyRearm41();return r;};}
 if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.ada41Shells==='function'){const prevShells41=ACTIONS.ada41Shells;ACTIONS.ada41Shells=function(){const r=prevShells41.apply(this,arguments);dailyRearm41();return r;};}
 // "Buy it" in a shop block: once the thing is bought, the panel's clicks are held for DAILY41.HOLD
 if(typeof ACTIONS!=='undefined'&&typeof ACTIONS.ada41Buy==='function'){const prevBuy41=ACTIONS.ada41Buy;ACTIONS.ada41Buy=function(){
  let was=null;try{const w=typeof ada41Bring==='function'?ada41Bring():null;was=w?!!w.got:null;}catch(e){}
  const r=prevBuy41.apply(this,arguments);
  try{const w=typeof ada41Bring==='function'?ada41Bring():null;if(was===false&&w&&w.got&&typeof FOUND38!=='undefined'){DAILY41.shop=FOUND38.t+DAILY41.HOLD;DAILY41.n41.shop++;}}catch(e){}return r;};}
 if(typeof FOUND38!=='undefined'&&FOUND38&&typeof document!=='undefined'&&document&&typeof document.addEventListener==='function'){
  document.addEventListener('click',dailyClick41,true);document.addEventListener('pointerdown',dailyPointer41,true);document.addEventListener('pointerdown',dailyPtr41,true);
  for(const ev of ['pointerup','pointercancel'])document.addEventListener(ev,dailyUp41,true);}
 // (fix round, S1) the morning fishing pays for Ada: a touch Act at the rocks opens the panel (the original first) and holds its clicks
 if(typeof doFish==='function'&&typeof FOUND38!=='undefined'){const prevFish41=doFish;doFish=function(i){const was=typeof overlayOpen==='function'&&overlayOpen();const r=prevFish41.apply(this,arguments);
  try{dailyFishArm41(i,was);}catch(e){}return r;};}
 // (repair 2, the purse) Today's Mallam line, with the purse when it is short of his price (the original first)
 if(typeof mallam40Today==='function'){const prevMallamToday41=mallam40Today;mallam40Today=function(){const r=prevMallamToday41.apply(this,arguments);
  try{const q=r&&typeof r.html==='string'&&r.html?dailyPurse41():null;if(q){const n=typeof naira==='function'?naira:(x=>'₦'+x);return Object.assign({},r,{html:r.html+' '+esc(String(DAILY41.LINES['ui41-today-purse']).replace('{price}',n(q.price)).replace('{money}',n(q.money)))});}}catch(e){}return r;};}
 // the shop hold's dimmed buttons, every frame (the tick runs under a panel; FOUND38.t, the hold's clock, advances there)
 if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.tick==='function'){const prevEveTick41d=EVENING35.tick;EVENING35.tick=function(dt){const r=prevEveTick41d.apply(this,arguments);dailyDim41();return r;};}}

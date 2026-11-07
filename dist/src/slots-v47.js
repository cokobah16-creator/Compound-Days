/* v47 "Slots": three households saved on this phone.

   Before v47 a phone kept one household under KEY ('compound-days-3d-v1'). "Start a new household" (title or
   Menu) and "Start with a companion" replaced it as soon as the new household moved in, with no way back.

   Now there are three slots. Slot 1 is KEY itself, so the household already on a phone is slot 1 and nothing moves.
   Slots 2 and 3 are KEY+'-slot2' and KEY+'-slot3'. The active slot is remembered in 'cd3-slot'. save() and load()
   (and every module wrapper around them) are untouched: while slot 2 or 3 is active, this phone's localStorage
   reads and writes of KEY are pointed at that slot's key. Nothing else is redirected, and with slot 1 active
   nothing changes at all.

   The title lists the three slots (Continue, New with a companion, New on one phone, Delete). Replacing or deleting
   a household always asks first. The Menu's "Start a new household" opens the same list; switching households from
   inside the world saves, then reloads the page into the chosen slot. Online households are separate: each phone
   keeps those under their own code (together-v47.js). */
const SLOTS47={n:3,active:1,raw:null,nextKey:'cd3-slot-next'};
function slots47Key(k){ return k===1?KEY:KEY+'-slot'+k; }
(function slots47Install(){
 if(typeof localStorage==='undefined'||!localStorage) return;
 let real=null;
 try{ if(typeof Storage!=='undefined'&&localStorage instanceof Storage) real=Storage.prototype; }catch(e){}
 const host=real||localStorage, g=host.getItem, s=host.setItem, r=host.removeItem;
 SLOTS47.raw={get:k=>g.call(localStorage,k),set:(k,v)=>s.call(localStorage,k,v),del:k=>r.call(localStorage,k)};
 const map=(st,k)=>(st===localStorage&&k===KEY&&SLOTS47.active!==1)?slots47Key(SLOTS47.active):k;
 // wrap: localStorage reads and writes of KEY go to the active slot's key (slot 1 is KEY itself)
 host.getItem=function(k){ return g.call(this,map(this,k)); };
 host.setItem=function(k,v){ return s.call(this,map(this,k),v); };
 host.removeItem=function(k){ return r.call(this,map(this,k)); };
 try{ const a=+SLOTS47.raw.get('cd3-slot'); if(a>=1&&a<=SLOTS47.n) SLOTS47.active=a; }catch(e){}
})();
function slots47SetActive(k){ SLOTS47.active=k; try{ SLOTS47.raw.set('cd3-slot',String(k)); }catch(e){} }
function slots47Info(k){
 let d=null; try{ d=JSON.parse(SLOTS47.raw.get(slots47Key(k))||'null'); }catch(e){}
 if(!d||!d.p||d.phase!=='play') return {k,filled:false};
 const names=(d.p||[]).map(p=>p&&p.name).filter(Boolean);
 return {k,filled:true,household:d.household||names.join(' & ')||'Your household',day:d.day||1,ai:!!d.ai,names};
}
function slots47All(){ const out=[]; for(let k=1;k<=SLOTS47.n;k++) out.push(slots47Info(k)); return out; }
function slots47FirstEmpty(){ const e=slots47All().find(x=>!x.filled); return e?e.k:0; }
function slots47InWorld(){ return typeof players!=='undefined'&&players.length>0&&!!S&&S.phase==='play'; }
function slots47Label(x){ return x.filled?`${esc(x.household)}, day ${x.day}${x.ai?' · with a companion':' · two on one phone'}`:'Empty'; }
// the slot list, for the title and the Menu
function slots47HTML(from){
 const rows=slots47All().map(x=>{ const playing=from==='menu'&&x.k===SLOTS47.active;
  const acts=x.filled
   ?(playing?`<span class="tiny">Playing now</span>`:btn('Continue →','slot47go',{k:x.k},'primary'))+btn('New here','slot47ask',{k:x.k},'quiet')+(playing?'':btn('Delete','slot47del',{k:x.k},'quiet'))
   :btn('New with a companion','slot47new',{k:x.k,mode:'ai'},'primary')+btn('New on one phone','slot47new',{k:x.k,mode:'pair'},'quiet');
  return `<div class="card slot47${x.filled?'':' empty'}${playing?' now':''}"><div class="smallcaps">Slot ${x.k}</div><b class="slot47-name">${slots47Label(x)}</b><div class="row">${acts}</div></div>`; }).join('');
 return `<h3 style="margin-top:10px">Saved on this phone</h3><p class="tiny muted" style="margin:2px 0 6px">Three households, each saved on its own. Play on one phone, or with a companion.</p><div class="slots47">${rows}</div>`;
}
// wrap: the title shows the three slots in place of the single Continue / Start a new household pair
const openTitle47base=openTitle;
openTitle=function(){ const r=openTitle47base.apply(this,arguments); try{ slots47Title(); }catch(e){ console.warn('slots47 title',e); } return r; };
function slots47Title(){
 if(typeof panel==='undefined'||!panel||!panel.querySelectorAll) return;
 const h3=[...panel.querySelectorAll('h3')].find(h=>/one phone, two of you/i.test(h.textContent||''));
 if(h3){ const acts=h3.nextElementSibling; const box=document.createElement('div'); box.innerHTML=slots47HTML('title');
  h3.parentNode.insertBefore(box,h3); h3.remove(); if(acts&&acts.classList&&acts.classList.contains('actions')) acts.remove(); }
 // the companion card starts in the first empty slot (or asks which household to replace)
 panel.querySelectorAll('[data-act="aiStart"]').forEach(b=>{ b.setAttribute('data-act','slot47pick'); b.setAttribute('data-mode','ai'); });
 slots47Pending();
}
// after a reload into another slot, carry on with what was chosen
function slots47Pending(){
 let next=null; try{ next=JSON.parse(sessionStorage.getItem(SLOTS47.nextKey)||'null'); sessionStorage.removeItem(SLOTS47.nextKey); }catch(e){}
 if(!next||!next.act) return;
 setTimeout(()=>{ if(next.act==='continue'&&slots47Info(SLOTS47.active).filled) dispatch('continue',{});
  else if(next.act==='ai') ACTIONS.aiStart(); else if(next.act==='pair') ACTIONS.newgame(); },0);
}
// switch to slot k and do act ('continue' | 'ai' | 'pair'); from inside the world, save first and reload
function slots47Switch(k,act){
 if(slots47InWorld()){ try{ save(); }catch(e){} slots47SetActive(k);
  try{ sessionStorage.setItem(SLOTS47.nextKey,JSON.stringify({act})); }catch(e){} location.reload(); return; }
 slots47SetActive(k);
 if(act==='continue') ACTIONS.continue(); else if(act==='ai') ACTIONS.aiStart(); else ACTIONS.newgame();
}
ACTIONS.slot47go=d=>{ const k=+d.k; if(!slots47Info(k).filled) return; slots47Switch(k,'continue'); };
ACTIONS.slot47new=d=>{ const k=+d.k, mode=d.mode==='ai'?'ai':'pair', x=slots47Info(k);
 if(x.filled&&!+d.sure){ openPanel(`<h2>Replace ${esc(x.household)}?</h2><p>Slot ${k} holds ${esc(x.household)}, day ${x.day}. A new household here replaces it once you move in, and it cannot be brought back.</p><div class="actions">${btn('Yes, replace it','slot47new',{k,mode,sure:1},'primary')}${btn('No, keep it','slot47back',{},'quiet')}</div>`); return; }
 slots47Switch(k,mode); };
ACTIONS.slot47ask=d=>{ const k=+d.k, x=slots47Info(k); openPanel(`<h2>A new household in slot ${k}</h2><p class="muted">${x.filled?`This replaces ${esc(x.household)}, day ${x.day}, once you move in.`:'This slot is empty.'}</p><div class="actions">${btn('With a companion','slot47new',{k,mode:'ai'},'primary')}${btn('Two of us on one phone','slot47new',{k,mode:'pair'},'')}${btn('Back','slot47back',{},'quiet')}</div>`); };
ACTIONS.slot47pick=d=>{ const mode=d.mode==='ai'?'ai':'pair', k=slots47FirstEmpty(); if(k){ slots47Switch(k,mode); return; }
 openPanel(`<h2>All three slots are full</h2><p class="muted">Pick a household to replace. It is gone once the new one moves in.</p>${slots47All().map(x=>`<div class="card"><div class="smallcaps">Slot ${x.k}</div><b>${slots47Label(x)}</b><div class="row">${btn('Replace this one','slot47new',{k:x.k,mode},'quiet')}</div></div>`).join('')}<div class="actions">${btn('Back','slot47back',{},'primary')}</div>`); };
ACTIONS.slot47del=d=>{ const k=+d.k, x=slots47Info(k); if(!x.filled) return;
 if(!+d.sure){ openPanel(`<h2>Delete ${esc(x.household)}?</h2><p>Slot ${k}, day ${x.day}. This cannot be undone.</p><div class="actions">${btn('Yes, delete it','slot47del',{k,sure:1},'primary')}${btn('No, keep it','slot47back',{},'quiet')}</div>`); return; }
 try{ SLOTS47.raw.del(slots47Key(k)); }catch(e){} toast(`Slot ${k} is empty now.`); ACTIONS.slot47back(); };
ACTIONS.slot47back=()=>{ if(slots47InWorld()) slots47Menu(); else openTitle(); };
function slots47Menu(){ openPanel(`<h2>Households</h2><p class="muted">${esc(S.household||'This household')} is saved in slot ${SLOTS47.active}. Switching saves it first.</p>${slots47HTML('menu')}<div class="actions">${btn('Back to the game','close',{},'primary')}</div>`); }
// wrap: the Menu's "Start a new household" opens the slot list instead of replacing this household (online play keeps the old question)
if(typeof ACTIONS.newconfirm==='function'){ const newconfirm47base=ACTIONS.newconfirm;
 ACTIONS.newconfirm=function(){ const r=newconfirm47base.apply(this,arguments); if(!(typeof NET!=='undefined'&&NET.on)&&slots47InWorld()) slots47Menu(); return r; }; }
// wrap: the Menu button says what it opens now
if(typeof openMenu==='function'){ const openMenu47base=openMenu;
 openMenu=function(){ const r=openMenu47base.apply(this,arguments); try{ if(!(typeof NET!=='undefined'&&NET.on)&&panel&&panel.querySelectorAll) panel.querySelectorAll('[data-act="newconfirm"]').forEach(b=>{ b.textContent='Households and save slots'; }); }catch(e){} return r; }; }
['slot47go','slot47new','slot47ask','slot47pick','slot47del','slot47back'].forEach(n=>LOCAL_ONLY.add(n));

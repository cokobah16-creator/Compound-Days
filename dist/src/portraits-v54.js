/* v54 "Face revision portraits": the owner's eight Blender face renders (Compound_Days_Face_Revision_Game_Images.zip,
   MakeHuman CC0 anatomy, see docs/PROVENANCE.md) shown in the panels.

   When a panel opens, its title and its small labels are read: a heading or label that begins with a neighbour's name
   gets that neighbour's portrait (assets/faces/<id>.webp, 512 x 512 with transparent padding). The panel HTML itself is
   not changed, so every earlier wrapper of openPanel and every harness that reads panel HTML sees the same text.
   The two player renders ship too (player_everyday, player_ankara) for later use; the players keep their own made look. */
'use strict';
const PORTRAITS54={
 BY_NAME:[['Mama Nkechi','market_auntie'],['Aunty Bisi','market_auntie'],['Mallam','suya_vendor'],['Tunde','neighbour_locs'],
  ['Ada','utility_artisan'],['Mr. Bassey','compound_elder'],['Mrs. Oyelaran','neighbour_linen']],
 url(id){ return 'assets/faces/'+id+'.webp'; },
 of(text){ const t=String(text||'').trim(); for(const [n,id] of PORTRAITS54.BY_NAME){ if(t===n||t.startsWith(n+' ')||t.startsWith(n+'·')||t.startsWith(n+',')||t.startsWith(n+':')||t.toUpperCase().startsWith(n.toUpperCase()+' ')||t.toUpperCase()===n.toUpperCase()) return id; } return null; }
};
function portraits54Decorate(root){
 if(!root||typeof root.querySelectorAll!=='function') return 0; let n=0;
 const add=(el,cls)=>{ if(!el||el.querySelector&&el.querySelector('.face54')) return; const id=PORTRAITS54.of(el.textContent); if(!id) return;
  const img=document.createElement('span'); img.className='face54 '+cls; img.style.backgroundImage='url("'+PORTRAITS54.url(id)+'")'; img.setAttribute('aria-hidden','true');
  el.insertBefore(img,el.firstChild); n++; };
 const h=root.querySelector('h2'); if(h) add(h,'face54-title');
 root.querySelectorAll('.life-label34,.gist38-kicker,.gist40-kicker').forEach(el=>add(el,'face54-label'));
 return n;
}
if(typeof openPanel==='function'){ const portraits54Open=openPanel;
 openPanel=function(){ const r=portraits54Open.apply(this,arguments); try{ if(typeof panel!=='undefined'&&panel) portraits54Decorate(panel); }catch(e){} return r; }; }

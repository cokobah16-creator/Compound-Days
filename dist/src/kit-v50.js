/* v50 "Kit": shoes and accessories, from the owner's two Blender render sheets (Footwear F01-F08, Accessories A01-A12).

   Twenty pieces, either player, seven slots (feet, head, face, ears, neck, wrists, bag). The household owns a piece once;
   each player wears at most one piece per slot (S.p[i].kit = {slot:id}). Compound slides come with the flat; the other
   nineteen are collected from Dayo's table on Market Road, which shows a different few each day (and more on market day).
   The Menu's Wardrobe opens the collection: icons cut from the render sheets (assets/wear/<id>.webp), what is collected,
   what Dayo has today, and who is wearing what.

   On the avatars the pieces are modelled here in three.js, to the render sheets' shapes and colours, and mounted on the
   rig: the hero rig's bones (player 1) and the built-in avatar's joints (player 2). Footwear replaces the outfit's own
   shoes. Nothing changes for a player who wears nothing from the kit, so older saves and every harness see the same
   avatars as v49. Meshes are only built when a piece is worn, so no harness draws from Math.random here. */
const KIT50={
 SLOTS:[['feet','Feet'],['head','Head'],['face','Face'],['ears','Ears'],['neck','Neck'],['wrists','Wrists'],['bag','Bag']],
 ITEMS:[
  {id:'F01',slot:'feet',name:'Compound slides',price:0,style:'slide',c:['#8E4426','#EBDCC4','#6E3018'],note:'The ones by the door. Everybody has a pair.'},
  {id:'F02',slot:'feet',name:'Cross-strap sandals',price:3500,style:'cross',c:['#C8572A','#6B3220','#D08A36'],note:'Crossed leather on a cork-coloured sole.'},
  {id:'F03',slot:'feet',name:'Everyday sneakers',price:6000,style:'sneaker',c:['#EFE6D6','#F6EFE2','#C9822F','#2F6B4F'],note:'Cream canvas, orange sole. Goes with anything.'},
  {id:'F04',slot:'feet',name:'Town runners',price:8500,style:'runner',c:['#2F6B4F','#EFE6D6','#C9822F'],note:'Green and cream, studded sole for the pitch.'},
  {id:'F05',slot:'feet',name:'Woven loafers',price:7000,style:'loafer',c:['#C8602F','#A9481F','#2A1F1A'],note:'Hand-woven vamp. Sunday-ready, Monday-comfortable.'},
  {id:'F06',slot:'feet',name:'Mary Janes',price:7500,style:'maryjane',c:['#8E2F3F','#C9A24A','#2A1F1A'],note:'Burgundy with a little gold buckle.'},
  {id:'F07',slot:'feet',name:'Patterned high-tops',price:9500,style:'hightop',c:['#2E4A8F','#EFE6D6','#F6EFE2'],note:'Indigo with a diamond print up the side.'},
  {id:'F08',slot:'feet',name:'Weekend sandals',price:4000,style:'weekend',c:['#C8572A','#C9A24A','#B4481F'],note:'Ankle strap and a gold buckle. Made for walking the waterfront.'},
  {id:'A01',slot:'bag',name:'Cognac crossbody bag',price:9000,style:'crossbody',c:['#B4481F','#C9A24A','#D06A38'],note:'Round strap, gold hardware, room for a phone and keys.'},
  {id:'A02',slot:'head',name:'Bucket hat',price:4500,style:'bucket',c:['#E4D2AE','#2E4A8F','#EFE6D6'],note:'Sand-coloured, with an indigo band.'},
  {id:'A03',slot:'head',name:'Everyday cap',price:3000,style:'cap',c:['#2F6B4F','#EFE6D6'],note:'Green, cream badge. Keeps the sun off at the pitch.'},
  {id:'A04',slot:'head',name:'Patterned scarf',price:3500,style:'scarf',c:['#2E4A8F','#EFE6D6'],note:'Indigo and cream, tied at the side.'},
  {id:'A05',slot:'face',name:'Round tortoiseshell shades',price:5000,style:'round',c:['#9A4E1C','#3A2418'],note:'Round and warm. Very waterfront.'},
  {id:'A06',slot:'face',name:'Soft square shades',price:5500,style:'square',c:['#231A16','#3A2418'],note:'Black, square, soft at the corners.'},
  {id:'A07',slot:'head',name:'Occasion cap',price:6500,style:'occasion',c:['#7A2232','#C9A24A','#9A3044'],note:'Deep red with a gold zigzag. For days that matter.'},
  {id:'A08',slot:'ears',name:'Gold hoops',price:6000,style:'hoops',c:['#C9922A'],note:'Chunky, golden, catch the light.'},
  {id:'A09',slot:'neck',name:'Short pendant chain',price:8000,style:'chain',c:['#C9922A'],note:'A short gold chain with a square pendant.'},
  {id:'A10',slot:'wrists',name:'Leather watch',price:12000,style:'watch',c:['#8E4426','#C9922A','#B08A3E'],note:'Gold face, brown strap. Never late for jollof.'},
  {id:'A11',slot:'wrists',name:'Beaded bracelets',price:2500,style:'beads',c:['#D9714E','#5A2E1C','#C9922A'],note:'Two strands: coral and dark wood, gold between.'},
  {id:'A12',slot:'bag',name:'Woven market tote',price:4000,style:'tote',c:['#D9B77A','#2F6B4F','#22305A','#EFE6D6'],note:'Raffia basket, green handles. Market Road essential.'}],
 STARTER:['F01'],
 DAILY:4, MARKET_DAY:6,
 who:0,
 tex:{}
};
function kitItem50(id){ return KIT50.ITEMS.find(x=>x.id===id)||null; }
// the household's collection, made on first use (an untouched save never gains the key)
function kitState50(){ if(!S) return {owned:KIT50.STARTER.slice()}; if(!S.kit50||!Array.isArray(S.kit50.owned)) S.kit50={owned:KIT50.STARTER.slice()}; return S.kit50; }
function kitOwned50(id){ const k=S&&S.kit50; return k&&Array.isArray(k.owned)?k.owned.includes(id):KIT50.STARTER.includes(id); }
function kitOwnedCount50(){ return KIT50.ITEMS.filter(x=>kitOwned50(x.id)).length; }
function kitWorn50(p){ return (p&&p.kit&&typeof p.kit==='object')?p.kit:null; }
function kitIcon50(id){ const u='assets/wear/'+id+'.webp?v='+(typeof BUILD_ID!=='undefined'?BUILD_ID:''); return u; }
// market day: v43's Saturdays (a festival day is the festival, not market day)
function kitMarketDay50(){ try{ if(typeof happenWeekday43==='function'&&typeof happenFestDay43==='function') return happenWeekday43(S.day)==='Saturday'&&!happenFestDay43(S.day); }catch(e){} return false; }
// Dayo's table today: a fixed shuffle, seeded by the day (never Math.random), of what the household had not collected when the
// day began; a piece bought today stays on the list (sold), so the table does not reshuffle under the player
function kitHadBefore50(id,day){ if(!kitOwned50(id)) return false; const got=S&&S.kit50&&S.kit50.got; return !(got&&got[id]===day); }
function kitTable50(){ if(!S) return []; const day=S.day|0; const left=KIT50.ITEMS.filter(x=>!kitHadBefore50(x.id,day)); let h=(day*2654435761)>>>0; const order=left.map(x=>{ h=(Math.imul(h^(h>>>15),2246822519)+x.id.charCodeAt(1)*31+x.id.charCodeAt(2))>>>0; return [h,x]; }).sort((a,b)=>a[0]-b[0]).map(a=>a[1]);
 return order.slice(0,kitMarketDay50()?KIT50.MARKET_DAY:KIT50.DAILY); }
function kitToday50(){ return kitTable50().filter(x=>!kitOwned50(x.id)); }

/* ---------------------------------------------------------------- actions ---------------------------------------------------------------- */
ACTIONS.kitopen=d=>{ if(d&&d.i!==undefined) KIT50.who=+d.i; kitPanel50(); };
ACTIONS.kitwho=d=>{ KIT50.who=+d.i; kitPanel50(); };
ACTIONS.kitwear=d=>{ const i=+d.i; const it=kitItem50(d.id); if(!it||!S.p[i]||!kitOwned50(it.id)) return; const p=S.p[i]; p.kit=Object.assign({},kitWorn50(p)||{});
 if(p.kit[it.slot]===it.id) delete p.kit[it.slot]; else p.kit[it.slot]=it.id; if(!Object.keys(p.kit).length) delete p.kit;
 if(typeof refreshAvatar==='function') refreshAvatar(i); if(typeof save==='function') save(); if(document.getElementById('kit50')) kitPanel50(); };
ACTIONS.kitoff=d=>{ const i=+d.i; if(!S.p[i]) return; delete S.p[i].kit; if(typeof refreshAvatar==='function') refreshAvatar(i); if(typeof save==='function') save(); if(document.getElementById('kit50')) kitPanel50(); };
ACTIONS.kitbuy=d=>{ const it=kitItem50(d.id); if(!it||kitOwned50(it.id)) return; if(!kitToday50().some(x=>x.id===it.id)){ toast('Dayo has not got that one out today.'); return; } if(it.price>S.money){ toast('Not enough in the purse'); return; }
 spend(it.price); const K=kitState50(); K.owned.push(it.id); K.got=K.got||{}; K.got[it.id]=S.day|0; toast(`${it.name}: in the wardrobe now.`); if(typeof passTime==='function') passTime(0.05); if(typeof save==='function') save();
 const st=STALLS.find(s=>s.id==='s8'); if(document.getElementById('kitstall50')&&st&&typeof openStall==='function') openStall(+d.i||0,st); };
['kitopen','kitwho'].forEach(n=>LOCAL_ONLY.add(n));
PER_PLAYER.add('kitwear'); PER_PLAYER.add('kitoff');

/* ---------------------------------------------------------------- panels ---------------------------------------------------------------- */
function kitTile50(it,i,worn){ const own=kitOwned50(it.id); const on=worn&&worn[it.slot]===it.id; const today=!own&&kitToday50().some(x=>x.id===it.id);
 const label=own?(on?'Wearing':'Wear'):(today?`At Dayo’s, ${naira(it.price)}`:'Not found yet');
 return `<button class="kit50-tile${own?'':' kit50-locked'}${on?' picked':''}" ${own?`data-act="kitwear" data-i="${i}" data-id="${it.id}"`:'disabled'} aria-pressed="${on?'true':'false'}"><img src="${kitIcon50(it.id)}" alt="" loading="lazy" decoding="async"><span class="kit50-name">${esc(it.name)}</span><span class="kit50-sub">${esc(label)}</span></button>`; }
function kitPanel50(){ if(!S||!S.p) return; let i=KIT50.who|0; if(typeof NET!=='undefined'&&NET.on&&NET.otherOnline) i=NET.myIndex|0; if(!S.p[i]) i=0; KIT50.who=i;
 const worn=kitWorn50(S.p[i])||{}; const n=kitOwnedCount50();
 const who=(typeof NET!=='undefined'&&NET.on&&NET.otherOnline)?'':`<div class="opts kit50-who">${[0,1].map(k=>`<button class="opt ${k===i?'picked':''}" data-act="kitwho" data-i="${k}">${esc(pname(k))}</button>`).join('')}</div>`;
 const slots=KIT50.SLOTS.map(([s,label])=>{ const it=worn[s]?kitItem50(worn[s]):null; return `<span class="kit50-slot${it?' on':''}">${it?`<img src="${kitIcon50(it.id)}" alt="">`:''}<b>${label}</b>${it?esc(it.name):'nothing'}</span>`; }).join('');
 const groups=KIT50.SLOTS.map(([s,label])=>{ const list=KIT50.ITEMS.filter(x=>x.slot===s); return `<h3 class="kit50-h">${label}</h3><div class="kit50-grid">${list.map(it=>kitTile50(it,i,worn)).join('')}</div>`; }).join('');
 openPanel(`<div id="kit50"><p class="life-kicker">Wardrobe</p><h2>Shoes and accessories</h2><p class="small">${n} of ${KIT50.ITEMS.length} collected. Dayo puts a few new pieces out on Market Road every day, more on market day. Tap a piece you have to put it on, tap again to take it off.</p>${who}<div class="kit50-slots">${slots}</div>${groups}<div class="actions">${Object.keys(worn).length?btn(`${esc(pname(i))}: take everything off`,'kitoff',{i},'quiet'):''}${btn('Back to the Menu','kitmenu',{},'quiet')}${btn('Done','close',{},'primary')}</div></div>`); }
ACTIONS.kitmenu=()=>{ if(typeof openMenu==='function') openMenu(); }; LOCAL_ONLY.add('kitmenu');

// wrap: the Menu's Wardrobe card opens the shoes and accessories collection
if(typeof wardrobeHTML==='function'){ const wardrobeHTML50base=wardrobeHTML;
 wardrobeHTML=function(){ const base=wardrobeHTML50base.apply(this,arguments); if(!S||!S.p) return base; const n=kitOwnedCount50();
  return `<div class="card small kit50-card"><b>Shoes and accessories.</b> ${n} of ${KIT50.ITEMS.length} collected.<div class="row">${btn('Open the wardrobe','kitopen',{},'quiet')}</div></div>`+base; }; }
// wrap: Dayo's fabric stall also lays out today's shoes and accessories
if(typeof openStall==='function'){ const openStall50base=openStall;
 openStall=function(i,st){ const r=openStall50base.apply(this,arguments); try{ if(st&&st.id==='s8'&&S&&panel&&ov.classList.contains('on')&&!document.getElementById('kitstall50')) kitStall50(i); }catch(e){} return r; }; }
function kitStall50(i){ const today=kitTable50(); const md=kitMarketDay50(); let html;
 if(!today.length) html=`<p class="small">You have every piece Dayo stocks. “You two are better dressed than me now.”</p>`;
 else html=today.map(it=>`<div class="card kit50-buy"><img src="${kitIcon50(it.id)}" alt=""><div><b>${esc(it.name)}</b> <span class="small">${naira(it.price)}</span><div class="tiny">${esc(it.note)}</div><div class="row">${kitOwned50(it.id)?'<span class="small kit50-sold">Yours now. In the wardrobe.</span>':btn('Buy it','kitbuy',{i,id:it.id},'')}</div></div></div>`).join('');
 const box=document.createElement('div'); box.id='kitstall50'; box.className='kit50-stall';
 box.innerHTML=`<p class="life-kicker">${md?'Market day: the whole table':'Also on Dayo’s table today'}</p><h3>Shoes and accessories</h3>${html}<p class="tiny">${kitOwnedCount50()} of ${KIT50.ITEMS.length} in your wardrobe. New pieces come out every morning.</p>`;
 const actions=panel.querySelector('.row:last-of-type'); if(actions&&actions.parentNode===panel) panel.insertBefore(box,actions); else panel.appendChild(box); }

/* ---------------------------------------------------------------- 3D ---------------------------------------------------------------- */
function kitMat50(c,o){ return new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})); }
function kitAdd50(parent,geo,mat,x,y,z,o){ const m=new THREE.Mesh(geo,mat); m.position.set(x||0,y||0,z||0); o=o||{}; if(o.rx) m.rotation.x=o.rx; if(o.ry) m.rotation.y=o.ry; if(o.rz) m.rotation.z=o.rz; if(o.s) m.scale.set(o.s[0],o.s[1],o.s[2]); m.castShadow=!o.noShadow; m.receiveShadow=false; m.userData.kit50=true; parent.add(m); return m; }
// small canvas prints for the bucket hat band, the scarf, the occasion cap's zigzag, the tote's raffia and the high-tops
function kitTex50(kind,c1,c2){ const key=kind+c1+c2; if(KIT50.tex[key]) return KIT50.tex[key]; let t=null;
 try{ const cv=document.createElement('canvas'); cv.width=128; cv.height=64; const g=cv.getContext('2d');
  if(kind==='zigzag'){ g.clearRect(0,0,128,64); g.strokeStyle=c2; g.lineWidth=5; g.beginPath(); for(let x=0;x<=128;x+=16){ g.lineTo(x,x%32?14:50); } g.stroke(); }
  else if(kind==='raffia'){ g.fillStyle=c1; g.fillRect(0,0,128,64); g.strokeStyle=c2; g.globalAlpha=0.35; g.lineWidth=2; for(let y=2;y<64;y+=5){ g.beginPath(); for(let x=0;x<=128;x+=8) g.lineTo(x,y+((x/8)%2?1.5:-1.5)); g.stroke(); } }
  else { g.fillStyle=c1; g.fillRect(0,0,128,64); g.strokeStyle=c2; g.fillStyle=c2; g.lineWidth=4;
   if(kind==='band'){ for(let x=-16;x<144;x+=32){ g.beginPath(); g.moveTo(x,32); g.lineTo(x+16,12); g.lineTo(x+32,32); g.lineTo(x+16,52); g.closePath(); g.stroke(); } }
   else if(kind==='scarf'){ for(let y=6;y<64;y+=20) for(let x=0;x<128;x+=32){ g.beginPath(); g.moveTo(x,y+8); g.lineTo(x+12,y); g.lineTo(x+24,y+8); g.stroke(); } }
   else if(kind==='diamond'){ for(let x=8;x<128;x+=24) for(let y=10;y<64;y+=22){ g.beginPath(); g.moveTo(x,y-7); g.lineTo(x+5,y); g.lineTo(x,y+7); g.lineTo(x-5,y); g.closePath(); g.lineWidth=2; g.stroke(); } } }
  t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; }catch(e){ t=null; }
 KIT50.tex[key]=t; return t; }
function kitPrint50(kind,c1,c2,rx,ry,o){ const t=kitTex50(kind,c1,c2); if(!t) return kitMat50(c1,o); const tt=t.clone(); tt.needsUpdate=true; tt.repeat.set(rx||1,ry||1); return kitMat50('#ffffff',Object.assign({map:tt},o||{})); }

// a rounded slab: a box with half-round ends, lying along z
function kitSlab50(g,w,len,th,y,zc,mat){ const core=Math.max(0.001,len-w); kitAdd50(g,new THREE.BoxGeometry(w,th,core),mat,0,y,zc); for(const s of [-1,1]) kitAdd50(g,new THREE.CylinderGeometry(w/2,w/2,th,16),mat,0,y,zc+s*core/2); }
// the closed upper: half an ellipsoid over the sole; y of its surface at a z
function kitDome50(g,W,L,h,sole,zc,mat){ return kitAdd50(g,new THREE.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),mat,0,sole,zc,{s:[W*0.48,h,L*0.48]}); }
function kitDomeY50(W,L,h,sole,zc,z,x){ const t=(z-zc)/(L*0.48), u=(x||0)/(W*0.48); const r=1-t*t-u*u; return sole+h*Math.sqrt(Math.max(0,r)); }
// one shoe, origin on the ground under the ankle, toe towards +z. d: W (width), L (length), zb (heel z), ank (ankle height), skin
function kitShoe50(it,d){ const g=new THREE.Group(); g.name='kit50_shoe'; const W=d.W,L=d.L,zc=d.zb+L/2,c=it.c; const style=it.style;
 const skinM=kitMat50(d.skin||'#8B5A3C');
 const open=style==='slide'||style==='cross'||style==='weekend';
 if(open){ const sole=style==='slide'?0.036:0.04; const soleM=kitMat50(style==='slide'?c[2]:c[2]); kitSlab50(g,W,L,sole,sole/2,zc,soleM);
  kitSlab50(g,W*0.9,L*0.94,0.012,sole+0.004,zc,kitMat50(style==='slide'?c[1]:c[1]));
  kitDome50(g,W*0.82,L*0.86,0.05,sole+0.008,zc-0.005,skinM);
  const up=kitMat50(c[0],{side:THREE.DoubleSide});
  if(style==='slide'){ kitAdd50(g,new THREE.CylinderGeometry(W*0.53,W*0.53,L*0.36,20,1,true,Math.PI/2,Math.PI),up,0,sole+0.004,zc+L*0.1,{rx:Math.PI/2,s:[1,1,0.95]}).scale.set(1,1,0.9); }
  else if(style==='cross'){ for(const s of [-1,1]) kitAdd50(g,new THREE.CylinderGeometry(W*0.52,W*0.52,0.05,18,1,true,Math.PI/2,Math.PI),up,0,sole+0.004,zc+L*0.12,{rx:Math.PI/2,ry:s*0.55});
   kitAdd50(g,new THREE.TorusGeometry(W*0.46,0.011,6,16,Math.PI),up,0,sole+0.05,d.zb+W*0.48,{rx:-Math.PI/2}); for(const s of [-1,1]) kitAdd50(g,new THREE.BoxGeometry(0.014,0.05,0.03),up,s*W*0.46,sole+0.028,d.zb+W*0.48,{noShadow:true}); }
  else { kitAdd50(g,new THREE.CylinderGeometry(W*0.53,W*0.53,L*0.22,20,1,true,Math.PI/2,Math.PI),up,0,sole+0.004,zc+L*0.2,{rx:Math.PI/2});
   const ay=d.ank, az=d.zb+W*0.5; kitAdd50(g,new THREE.TorusGeometry(W*0.36,0.015,8,20),up,0,ay,az,{rx:Math.PI/2}); kitAdd50(g,new THREE.BoxGeometry(0.03,ay-sole,0.016),up,0,sole+(ay-sole)/2,d.zb+0.012);
   for(const s of [-1,1]) kitAdd50(g,new THREE.BoxGeometry(0.014,ay-sole-0.01,0.024),up,s*W*0.42,sole+(ay-sole)/2,az+0.01,{noShadow:true});
   kitAdd50(g,new THREE.BoxGeometry(0.008,0.026,0.026),kitMat50(c[1]),W*0.37,ay,az,{noShadow:true}); }
  return g; }
 // closed shoes
 const sth=style==='runner'?0.034:0.03; const h=style==='hightop'?0.1:0.088; const soleM=kitMat50(style==='sneaker'?c[2]:style==='runner'?c[1]:style==='hightop'?c[2]:c[2]);
 kitSlab50(g,W*1.02,L,sth,sth/2,zc,soleM);
 if(style==='runner'){ kitSlab50(g,W*1.04,L*1.0,0.008,0.004,zc,kitMat50(c[2])); for(const s of [-1,1]) for(let k=0;k<5;k++) kitAdd50(g,new THREE.CylinderGeometry(0.009,0.011,0.012,8),kitMat50(c[2]),s*W*0.44,-0.002,d.zb+L*(0.12+k*0.18),{noShadow:true}); }
 if(style==='hightop'){ kitSlab50(g,W*1.03,L*1.0,0.006,sth-0.006,zc,kitMat50(c[0])); }
 const upM=style==='hightop'?kitMat50(c[0]):kitMat50(c[0]);
 kitDome50(g,W,L,h,sth,zc,upM);
 // the opening at the back, the inside colour
 const oz=zc-L*0.2, oy=kitDomeY50(W,L,h,sth,zc,oz)-0.004; kitAdd50(g,new THREE.CylinderGeometry(W*0.3,W*0.3,0.01,16),kitMat50(style==='maryjane'?'#3A2418':'#8A6A4A'),0,oy,oz,{s:[1,1,1.35],noShadow:true});
 const lace=(col,n,z0,step,wid)=>{ for(let k=0;k<n;k++){ const z=zc+L*(z0+k*step); const y=kitDomeY50(W,L,h,sth,zc,z)+0.002; const dz=0.004, y2=kitDomeY50(W,L,h,sth,zc,z+dz); kitAdd50(g,new THREE.BoxGeometry(W*wid,0.006,0.014),kitMat50(col),0,y,z,{rx:-Math.atan2(y2-y+0.002-0.002,dz),noShadow:true}); } };
 if(style==='sneaker'){ lace(c[1],3,0.0,0.075,0.46); kitAdd50(g,new THREE.BoxGeometry(0.02,0.03,0.01),kitMat50(c[3]),0,kitDomeY50(W,L,h,sth,zc,d.zb+0.02)+0.01,d.zb+0.012,{noShadow:true}); }
 else if(style==='runner'){ lace(c[1],3,0.0,0.075,0.46); kitAdd50(g,new THREE.SphereGeometry(1,18,10,0,Math.PI*2,0,Math.PI/2),kitMat50(c[1]),0,sth,zc-L*0.3,{s:[W*0.5,h*0.8,L*0.2]}); }
 else if(style==='loafer'){ for(let r=0;r<3;r++) for(let k=0;k<4;k++){ const x=(k-1.5)*W*0.16, z=zc+L*(0.05+r*0.08); kitAdd50(g,new THREE.BoxGeometry(W*0.13,0.012,L*0.06),kitMat50(c[1]),x,kitDomeY50(W,L,h,sth,zc,z,x)-0.002,z,{rx:-(r*0.35+0.1),noShadow:true}); } }
 else if(style==='maryjane'){ const z=zc-L*0.04; kitAdd50(g,new THREE.TorusGeometry(W*0.5,0.009,6,18,Math.PI),kitMat50(shade(c[0],0.85)),0,sth,z,{s:[1,(kitDomeY50(W,L,h,sth,zc,z)-sth+0.006)/(W*0.5),1]}); kitAdd50(g,new THREE.BoxGeometry(0.008,0.02,0.02),kitMat50(c[1]),W*0.47,sth+h*0.55,z,{noShadow:true}); }
 else if(style==='hightop'){ lace(c[2],3,-0.02,0.07,0.46); kitAdd50(g,new THREE.SphereGeometry(1,18,10,0,Math.PI*2,0,Math.PI/2),kitMat50(c[1]),0,sth,zc+L*0.25,{s:[W*0.5,h*0.62,L*0.25]});
  kitAdd50(g,new THREE.CylinderGeometry(W*0.38,W*0.44,0.085,16,1,true),kitPrint50('diamond',c[0],c[2],3,1,{side:THREE.DoubleSide}),0,oy+0.03,oz-0.004); }
 return g; }

/* rig anchors: a group parented to a joint, axes aligned with the avatar's at rest, origin at the joint */
function kitRig50(g){ if(g.hero&&g.hero.bones&&g.hero.bones.head){ const b=g.hero.bones; return {hero:true,head:b.head,neck:b.neck,torso:b.spine,footL:b.leftfoot,footR:b.rightfoot,wrist:b.lefthand,hand:b.lefthand,
  foot:{W:0.13,L:0.29,zb:-0.092,ground:-0.1,ank:0.095},wristR:0.04,wristY:0.035,handY:-0.085,chain:{r:0.08,y:-0.012,z:0.012,tilt:0.45,py:-0.07,pz:0.085,prx:-0.2},
  torsoF:(x,y)=>{ const a=0.165,b2=0.135+0.012*Math.min(1,Math.max(0,y/0.3)); const u=Math.min(0.98,Math.abs(x)/a); return b2*Math.sqrt(1-u*u)+0.012; },strap:[[-0.16,-0.04],[0.14,0.36]],bagAt:[-0.19,-0.1,0.04],face:{y:0,z:-0.085}}; }
 const P=g.parts||{}; if(!P.head) return null;
 return {hero:false,head:P.head,neck:P.neck,torso:P.spine,footL:P.footL,footR:P.footR,wrist:P.elbowR,hand:P.elbowR,
  foot:{W:0.155,L:0.3,zb:-0.09,ground:-0.08,ank:0.09},wristR:0.057,wristY:-0.2,handY:-0.31,chain:{r:0.126,y:0.172,z:0,tilt:0,py:0.128,pz:0.178,prx:-0.75},
  torsoF:(x,y)=>{ const r=0.19+0.04*Math.min(1,Math.max(0,y/0.46)); return Math.sqrt(Math.max(0,r*r-x*x))+0.012; },strap:[[-0.16,0.0],[0.15,0.44]],bagAt:[-0.25,-0.1,0.04],face:{y:0,z:0}}; }
function kitMount50(joint,name){ const m=new THREE.Group(); m.name=name; m.userData.kit50=true; joint.add(m); return m; }
// the head mount: the built-in head's own space (centre 0.28 above the joint, radius 0.3); on the hero rig, the hair mount's mapping
function kitHeadMount50(g,R){ const m=kitMount50(R.head,'kit50_head'); if(R.hero){ let hm=null; g.traverse(o=>{ if(!hm&&o.userData&&o.userData.hairMount) hm=o.userData.hairMount; }); const r=(hm&&hm.headR)||0.3; if(hm){ m.scale.setScalar(hm.scale); m.position.set(hm.x||0,hm.y-(r-0.02)*hm.scale,hm.z||0); } else { m.position.set(0,0.0356,-0.006); m.scale.setScalar(0.587); } } return m; }

function kitHead50(m,it){ const c=it.c; const C=0.28;
 if(it.style==='bucket'){ const sand=kitMat50(c[0]); kitAdd50(m,new THREE.CylinderGeometry(0.255,0.305,0.21,28),sand,0,0.5,0); kitAdd50(m,new THREE.CylinderGeometry(0.258,0.258,0.006,28),kitMat50(shade(c[0],1.04)),0,0.606,0,{noShadow:true});
  kitAdd50(m,new THREE.CylinderGeometry(0.296,0.307,0.065,28,1,true),kitPrint50('band',c[1],c[2],4,1,{side:THREE.DoubleSide}),0,0.44,0,{noShadow:true});
  kitAdd50(m,new THREE.CylinderGeometry(0.3,0.43,0.05,30,1,true),kitMat50(c[0],{side:THREE.DoubleSide}),0,0.38,0); }
 else if(it.style==='cap'){ const gr=kitMat50(c[0]); kitAdd50(m,new THREE.SphereGeometry(0.318,24,12,0,Math.PI*2,0,Math.PI/2),gr,0,0.37,-0.01,{s:[1,0.82,1]}); kitAdd50(m,new THREE.SphereGeometry(0.03,10,8),gr,0,0.63,-0.01,{noShadow:true});
  kitAdd50(m,new THREE.CylinderGeometry(0.29,0.29,0.016,24,1,false,-Math.PI/2,Math.PI),kitMat50(shade(c[0],0.82)),0,0.375,0.12,{rx:0.12,s:[0.95,1,1.25]}); kitAdd50(m,new THREE.TorusGeometry(0.33,0.005,4,24,Math.PI*0.7),kitMat50(c[1]),0,0.383,0.12,{rx:Math.PI/2+0.12,rz:-Math.PI*0.15,s:[0.86,1.2,1],noShadow:true});
  kitAdd50(m,new THREE.BoxGeometry(0.1,0.045,0.014),kitMat50(c[1]),0,0.5,0.258,{rx:-0.55,noShadow:true}); }
 else if(it.style==='occasion'){ const red=kitMat50(c[0]); kitAdd50(m,new THREE.CylinderGeometry(0.275,0.31,0.27,28),red,0,0.5,0); kitAdd50(m,new THREE.CylinderGeometry(0.276,0.276,0.008,28),kitMat50(c[2]),0,0.637,0,{noShadow:true});
  kitAdd50(m,new THREE.CylinderGeometry(0.302,0.31,0.06,28,1,true),kitPrint50('zigzag','#000000',c[1],5,1,{transparent:true,alphaTest:0.4,side:THREE.DoubleSide}),0,0.415,0,{noShadow:true}).material.color.set('#ffffff');
  kitAdd50(m,new THREE.TorusGeometry(0.306,0.006,6,30),kitMat50(c[1]),0,0.448,0,{rx:Math.PI/2,s:[1,1,1],noShadow:true}); kitAdd50(m,new THREE.TorusGeometry(0.311,0.006,6,30),kitMat50(c[1]),0,0.372,0,{rx:Math.PI/2,noShadow:true}); }
 else if(it.style==='scarf'){ const pr=kitPrint50('scarf',c[0],c[1],3,1); [[0.375,0.318,0.055],[0.455,0.3,0.055],[0.53,0.262,0.05]].forEach(([y,r,t],k)=>kitAdd50(m,new THREE.TorusGeometry(r,t,10,30),pr,0,y,-0.01*k,{rx:Math.PI/2-0.08}));
  kitAdd50(m,new THREE.SphereGeometry(0.27,20,12,0,Math.PI*2,0,Math.PI/2),pr,0,0.5,-0.02,{s:[1,0.55,1]});
  const kx=0.2, ky=0.36, kz=-0.21; kitAdd50(m,new THREE.SphereGeometry(0.05,10,8),pr,kx,ky,kz,{s:[1,0.8,0.8]}); for(const s of [-1,1]) kitAdd50(m,new THREE.ConeGeometry(0.045,0.16,4),pr,kx+s*0.035,ky-0.09,kz-0.02,{rz:s*0.35,s:[1,1,0.35]}); } }
function kitFace50(m,it,R){ const c=it.c; const ex=0.105, ey=0.262, ez=0.33+((R&&R.face&&R.face.z)||0); const fr=kitMat50(c[0]); const lens=kitMat50(c[1],{transparent:true,opacity:0.88});
 const sq=it.style==='square';
 for(const s of [-1,1]){ if(sq){ kitAdd50(m,new THREE.TorusGeometry(0.088,0.02,6,4),fr,s*ex,ey,ez,{rz:Math.PI/4,s:[1.12,0.9,1]}); kitAdd50(m,new THREE.PlaneGeometry(0.13,0.1),lens,s*ex,ey,ez-0.004,{noShadow:true}); }
  else { kitAdd50(m,new THREE.TorusGeometry(0.073,0.017,8,22),fr,s*ex,ey,ez); kitAdd50(m,new THREE.CircleGeometry(0.068,20),lens,s*ex,ey,ez-0.004,{noShadow:true}); }
  // the temple: from the hinge back to the ear, along the side of the head
  const a=new THREE.Vector3(s*(sq?0.2:0.18),ey+0.02,ez-0.01), b=new THREE.Vector3(s*0.3,ey+0.0,0.04); const t=kitAdd50(m,new THREE.BoxGeometry(0.014,0.016,a.distanceTo(b)),fr,(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,{noShadow:true}); t.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),b.clone().sub(a).normalize()); }
 kitAdd50(m,new THREE.BoxGeometry(0.05,0.016,0.016),fr,0,ey+0.02,ez,{noShadow:true}); }
function kitEars50(m,it){ const gold=kitMat50(it.c[0]); for(const s of [-1,1]) kitAdd50(m,new THREE.TorusGeometry(0.052,0.013,8,22),gold,s*0.305,0.135,-0.01,{ry:Math.PI/2}); }

function kitDress50(g,look){ const kit=look&&look.kit; if(!kit||typeof kit!=='object') return; const R=kitRig50(g); if(!R) return; g.updateMatrixWorld(true);
 const ids=Object.values(kit).map(kitItem50).filter(Boolean); if(!ids.length) return;
 for(const it of ids){ try{ kitPiece50(g,R,it,look); }catch(e){ console.warn('[Compound Days] kit piece failed',it.id,e); } } }
function kitPiece50(g,R,it,look){ const s=it.slot;
 if(s==='feet'){ // hide the outfit's own shoes, then put the pair on
  if(R.hero){ g.traverse(o=>{ if(!o.isMesh||o.userData.kit50) return; const mats=Array.isArray(o.material)?o.material:[o.material]; if(/^wear_/.test(o.name)){ if(/sneaker|sandal|shoe/.test(String(o.userData.wardrobe||''))) o.visible=false; return; } if(o.isSkinnedMesh&&mats.some(m=>m&&(m.name==='shoe'||m.name==='sole'))) o.visible=false; }); }
  else { for(const f of [R.footL,R.footR]) for(const ch of f.children.slice()) if(!ch.userData.kit50) f.remove(ch); }
  const d=Object.assign({skin:look.skin||SKINS[3]},R.foot); for(const f of [R.footL,R.footR]){ const m=kitMount50(f,'kit50_feet'); m.position.y=R.foot.ground; const sh=kitShoe50(it,d); sh.userData.wardrobe='kit50_'+it.style; m.add(sh); } return; }
 if(s==='head'){ const m=kitHeadMount50(g,R); kitHead50(m,it); return; }
 if(s==='face'){ const m=kitHeadMount50(g,R); kitFace50(m,it,R); return; }
 if(s==='ears'){ if(R.hero) g.traverse(o=>{ if(o.isMesh&&o.name==='earring') o.visible=false; }); const m=kitHeadMount50(g,R); kitEars50(m,it); return; }
 if(s==='neck'&&R.neck){ const m=kitMount50(R.neck,'kit50_neck'); const gold=kitMat50(it.c[0]); const C=R.chain;
  kitAdd50(m,new THREE.TorusGeometry(C.r,0.008,6,28),gold,0,C.y,C.z,{rx:Math.PI/2-C.tilt});
  kitAdd50(m,new THREE.BoxGeometry(0.034,0.044,0.01),gold,0,C.py,C.pz,{rx:C.prx}); kitAdd50(m,new THREE.TorusGeometry(0.008,0.003,4,10),gold,0,C.py+0.026,C.pz-0.004,{rx:C.prx,noShadow:true}); return; }
 if(s==='wrists'&&R.wrist){ const m=kitMount50(R.wrist,'kit50_wrist'); m.position.y=R.wristY; const r=R.wristR;
  if(it.style==='watch'){ kitAdd50(m,new THREE.CylinderGeometry(r+0.004,r+0.004,0.028,18,1,true),kitMat50(it.c[0],{side:THREE.DoubleSide}),0,0,0); kitAdd50(m,new THREE.CylinderGeometry(0.026,0.026,0.012,18),kitMat50(it.c[1]),r+0.008,0,0,{rz:Math.PI/2}); kitAdd50(m,new THREE.CylinderGeometry(0.021,0.021,0.004,18),kitMat50(it.c[2]),r+0.015,0,0,{rz:Math.PI/2,noShadow:true}); }
  else { const n=16; [[it.c[0],0.012],[it.c[1],-0.014]].forEach(([col,y],row)=>{ for(let k=0;k<n;k++){ const a=k/n*Math.PI*2; kitAdd50(m,new THREE.SphereGeometry(0.0115,8,6),kitMat50(k%7===3?it.c[2]:col),Math.cos(a)*(r+0.008),y,Math.sin(a)*(r+0.008),{noShadow:true}); } }); }
  return; }
 if(s==='bag'&&R.torso){ if(it.style==='crossbody'){ const m=kitMount50(R.torso,'kit50_bag'); const cog=kitMat50(it.c[0]); const [bx,by,bz]=R.bagAt;
   kitAdd50(m,new THREE.BoxGeometry(0.05,0.11,0.15),cog,bx-0.02,by,bz); kitAdd50(m,new THREE.BoxGeometry(0.008,0.06,0.13),kitMat50(it.c[2]),bx-0.047,by+0.02,bz,{noShadow:true}); kitAdd50(m,new THREE.SphereGeometry(0.008,8,6),kitMat50(it.c[1]),bx-0.052,by+0.005,bz,{noShadow:true});
   // the strap: across the chest from the bag to the other shoulder, following the torso
   const [[x0,y0],[x1,y1]]=R.strap; const pts=[]; for(let k=0;k<=6;k++){ const t=k/6, x=x0+(x1-x0)*t, y=y0+(y1-y0)*t; pts.push(new THREE.Vector3(x,y,R.torsoF(x,y))); }
   pts.unshift(new THREE.Vector3(bx-0.02,by+0.055,bz)); const strapM=kitMat50(shade(it.c[0],0.92));
   for(let k=0;k<pts.length-1;k++){ const a=pts[k],b=pts[k+1]; const len=a.distanceTo(b); const seg=kitAdd50(m,new THREE.BoxGeometry(0.03,len+0.004,0.008),strapM,(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,{noShadow:true}); seg.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()); }
   return; }
  // the tote hangs from the hand
  const m=kitMount50(R.hand,'kit50_bag'); m.position.y=R.handY; const [raf,grn,nav,cream]=it.c;
  kitAdd50(m,new THREE.TorusGeometry(0.06,0.008,6,16,Math.PI),kitMat50(grn),0.0,-0.06,0,{rz:0,ry:Math.PI/2}).rotation.z=0;
  const bodyM=kitPrint50('raffia',raf,'#7A5A2A',2,2,{side:THREE.DoubleSide}); const body=kitAdd50(m,new THREE.CylinderGeometry(0.1,0.08,0.15,18,1,true),bodyM,0.02,-0.135,0,{s:[0.55,1,1]}); kitAdd50(m,new THREE.CircleGeometry(0.08,18),kitMat50(shade(raf,0.8)),0.02,-0.209,0,{rx:Math.PI/2,s:[0.55,1,1],noShadow:true});
  kitAdd50(m,new THREE.BoxGeometry(0.004,0.11,0.04),kitPrint50('diamond',nav,cream,1,2),0.02+0.057,-0.14,0,{noShadow:true}); kitAdd50(m,new THREE.BoxGeometry(0.004,0.11,0.04),kitPrint50('diamond',nav,cream,1,2),0.02-0.057,-0.14,0,{noShadow:true}); } }

// wrap: every avatar wears its player's kit (a look without one builds exactly as before)
if(typeof makeAvatar==='function'){ const makeAvatar50base=makeAvatar;
 makeAvatar=function(look,lite){ let L=look; const kit=look&&kitWorn50(look);
  // a hat or the scarf flattens the big styles: the afro and the wig sit as the low cut underneath; the scarf covers every style
  if(kit&&(kit.head==='A04'||((kit.head==='A02'||kit.head==='A03'||kit.head==='A07')&&(look.hair==='afro'||look.hair==='wig'||look.hair==='wrap')))) L=Object.assign({},look,{hair:'low',headwear:'none'});
  const g=makeAvatar50base.call(this,L,lite); if(kit&&g&&!lite){ try{ kitDress50(g,L); }catch(e){ console.warn('[Compound Days] kit dressing failed',e); } } return g; }; }
// wrap: the creator's thumbnails and the avatar cache key notice a change of kit
if(typeof stateSig==='function'){ const stateSig50base=stateSig; stateSig=function(){ const s=stateSig50base.apply(this,arguments); try{ return s+JSON.stringify([(S.kit50&&S.kit50.owned)||null,S.p.map(p=>p.kit||null)]); }catch(e){ return s; } }; }

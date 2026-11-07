/* v44 "Sleek": one look for every screen. A painted scene fills the screen behind the panel, the panel is a
   cream card with a small-caps place label, a dark green serif headline, a pale gold hint bar and green buttons
   (sleek-v44.css). This module only picks which scene sits behind the open panel; it changes no game logic,
   wraps nothing and adds no tick hook. It watches #panel in the browser only (no MutationObserver in Node). */
const SLEEK44={
 // Scenes with a painting under assets/scenes/<name>.webp. A scene not listed here falls back to the live
 // world behind a soft scrim, so no request is ever made for a picture that is not there yet.
 ready:['title','courtyard','evening','morning','veranda','board','flat','kitchen','waterfront','waterfront-dusk','market','finds','grill','yard','atelier','roof','pitch','night','festival'],
 scenes:['title','courtyard','evening','morning','veranda','board','flat','kitchen','waterfront','waterfront-dusk','market','finds','grill','yard','atelier','roof','pitch','night','festival'],
 now:null
};
// which painted place belongs behind the panel that is open now
function sleekScene44(){
 if(typeof S==='undefined'||!S||S.phase!=='play')return 'title';
 const el=typeof panel!=='undefined'?panel:null;if(!el)return 'courtyard';
 const first=el.firstElementChild,cls=' '+el.className+' '+(first&&first.className||'')+' ';
 const h=el.querySelector('h2'),k=el.querySelector('.life-kicker,.gist38-kicker,.gist40-kicker,.evening-kicker,.recap35-kicker');
 const t=((h?h.textContent:'')+' '+(k?k.textContent:'')+' '+cls).toLowerCase(),has=sel=>!!el.querySelector(sel);
 const tab=el.classList.contains('life-panel34')&&typeof LIFE34!=='undefined'?LIFE34.tab:null;
 const hour=typeof S.time==='number'?S.time:12;
 if(/happen43-fest|festival|housewarming|square.s stage|gold hour/.test(t))return 'festival';
 if(has('.recap35')||/past midnight|tomorrow is fine|sleep|goodnight|good night/.test(t))return 'night';
 if(/evening in flat/.test(t))return 'night';
 if(tab==='today'||has('.morning35-lead')||/a new day/.test(t))return 'morning';
 if(tab==='fish'||has('.fishing34,.catch34')||/fishing|waterfront|shell|crab|beach|sunset/.test(t))return hour>=17?'waterfront-dusk':'waterfront';
 if(/noticeboard|board40/.test(t)||has('.gist40-errand,.gist40-return'))return 'board';
 if(has('.gist40-mallam,.gist39-bisi')||/bisi|mallam|suya/.test(t))return 'grill';
 if(tab==='market'||/finds|sold out/.test(t))return 'finds';
 if(/market|stall/.test(t))return 'market';
 if(has('.gist38-panel,.gist39-pot,.gist40-panel')||/bench|gist|the rail/.test(t))return 'veranda';
 if(/atelier|aso-ebi|fabric|fit check|two cuts/.test(t))return 'atelier';
 if(/makers|workshop/.test(t))return 'yard';
 if(/roof/.test(t))return 'roof';
 if(/football|fb37|pitch/.test(t))return 'pitch';
 if(/kitchen|cook|suyas|dish/.test(t))return 'kitchen';
 if(tab==='home'||/flat|sofa|\bbuild\b/.test(t))return 'flat';
 try{if(typeof home34==='function'&&home34())return 'flat';if(typeof market34==='function'&&market34())return 'market';}catch(e){}
 return hour>=18?'evening':'courtyard';
}
// v45: a painted strip under the headline for the panels that have one (assets/scenes/inset-<name>.webp)
function sleekInset44(){
 const el=panel,h=el.querySelector('h2'),t=(h?h.textContent:'').toLowerCase(),has=sel=>!!el.querySelector(sel);
 if(has('.catch34'))return 'catch';
 if(has('.gist40-mallam'))return 'suya';
 if(has('.gist38-carve'))return 'carving';
 if(has('.gist38-shelf'))return 'polish';
 if(has('.gist40-errand,.gist40-return'))return 'board-yard';
 if(/noticeboard/.test(t))return 'board';
 if(has('.gist38-panel')&&!has('.gist38-return'))return 'gist';
 if(has('.say')&&/^\s*ada\s*$/.test(t))return 'carving';
 return null;
}
function sleekInsetApply44(){
 const f=panel.querySelector('.fishing34');
 if(f)ov.style.setProperty('--inset44','url("'+sleekURL44(f.classList.contains('ready')?'inset-fishing-ready.webp':'waterfront-inset.webp')+'")');
 if(panel.querySelector('.inset44'))return;
 const n=sleekInset44();if(!n)return;
 const d=document.createElement('div');d.className='inset44';d.setAttribute('aria-hidden','true');
 d.style.backgroundImage='url("'+sleekURL44('inset-'+n+'.webp')+'")';
 const h=panel.querySelector('h2');if(h&&h.parentNode)h.parentNode.insertBefore(d,h.nextSibling);else panel.insertBefore(d,panel.firstChild);
}
// v45: on a tall screen, scale the painting to the space above the card (plus a third more under its edge),
// so a tall card still shows the place itself and a short card leaves no bare band
function sleekFit44(){
 const free=Math.max(0,innerHeight-panel.getBoundingClientRect().height);
 ov.style.setProperty('--sceneh44',Math.round(Math.max(free*1.32,innerHeight*.3))+'px');
}
// an asset URL as the rest of the game asks for it: absolute, and carrying the build id (assets are cached as immutable)
function sleekURL44(file){const u='assets/scenes/'+file+'?v='+(typeof BUILD_ID!=='undefined'?BUILD_ID:'');try{return new URL(u,document.baseURI).href;}catch(e){return u;}}
function sleekApply44(){
 if(typeof ov==='undefined'||!ov||!ov.style)return;
 const sc=sleekScene44();if(sc===SLEEK44.now)return;SLEEK44.now=sc;
 ov.setAttribute('data-scene44',sc);
 const has=SLEEK44.ready.includes(sc);ov.classList.toggle('scene44',has);
 if(has)ov.style.setProperty('--scene44','url("'+sleekURL44(sc+'.webp')+'")');
 else ov.style.removeProperty('--scene44');
}
if(typeof MutationObserver==='function'&&typeof panel!=='undefined'&&panel&&panel.nodeType===1){
 const mo44=new MutationObserver(()=>{if(ov.classList.contains('on')){sleekApply44();try{sleekInsetApply44();sleekFit44();}catch(e){}}else SLEEK44.now=null;});
 addEventListener('resize',()=>{if(ov.classList.contains('on'))try{sleekFit44();}catch(e){}});
 mo44.observe(panel,{childList:true});mo44.observe(ov,{attributes:true,attributeFilter:['class']});
}

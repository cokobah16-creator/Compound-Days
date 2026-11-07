/* v44 "Sleek": one look for every screen. A painted scene fills the screen behind the panel, the panel is a
   cream card with a small-caps place label, a dark green serif headline, a pale gold hint bar and green buttons
   (sleek-v44.css). This module only picks which scene sits behind the open panel; it changes no game logic,
   wraps nothing and adds no tick hook. It watches #panel in the browser only (no MutationObserver in Node). */
const SLEEK44={
 // Scenes with a painting under assets/scenes/<name>.webp. A scene not listed here falls back to the live
 // world behind a soft scrim, so no request is ever made for a picture that is not there yet.
 ready:['waterfront'],
 scenes:['title','courtyard','flat','waterfront','market','yard','roof','pitch','morning','night','festival'],
 now:null
};
// which painted place belongs behind the panel that is open now
function sleekScene44(){
 if(typeof S==='undefined'||!S||S.phase!=='play')return 'title';
 const el=typeof panel!=='undefined'?panel:null;if(!el)return 'courtyard';
 const first=el.firstElementChild,cls=' '+el.className+' '+(first&&first.className||'')+' ';
 const h=el.querySelector('h2'),k=el.querySelector('.life-kicker,.gist38-kicker,.gist40-kicker,.evening-kicker,.recap35-kicker');
 const t=((h?h.textContent:'')+' '+(k?k.textContent:'')+' '+cls).toLowerCase();
 const tab=el.classList.contains('life-panel34')&&typeof LIFE34!=='undefined'?LIFE34.tab:null;
 if(/happen43-fest|festival|housewarming|square.s stage|gold hour/.test(t))return 'festival';
 if(el.querySelector('.recap35')||/past midnight|tomorrow is fine|sleep|goodnight|good night/.test(t))return 'night';
 if(/evening in flat/.test(t))return 'night';
 if(tab==='today'||el.querySelector('.morning35-lead')||/a new day/.test(t))return 'morning';
 if(tab==='fish'||el.querySelector('.fishing34,.catch34')||/fishing|waterfront|shell|crab|beach|sunset/.test(t))return 'waterfront';
 if(tab==='market'||/market|finds|bisi|mallam|suya|stall|sold out/.test(t))return 'market';
 if(/makers|atelier|aso-ebi|fabric|fit check|two cuts|workshop/.test(t))return 'yard';
 if(/roof/.test(t))return 'roof';
 if(/football|fb37|pitch/.test(t))return 'pitch';
 if(tab==='home'||/flat|kitchen|sofa|\bbuild\b|cook/.test(t))return 'flat';
 try{if(typeof home34==='function'&&home34())return 'flat';if(typeof market34==='function'&&market34())return 'market';}catch(e){}
 return 'courtyard';
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
 ov.style.setProperty('--inset44','url("'+sleekURL44('waterfront-inset.webp')+'")');
 const mo44=new MutationObserver(()=>{if(ov.classList.contains('on'))sleekApply44();else SLEEK44.now=null;});
 mo44.observe(panel,{childList:true});mo44.observe(ov,{attributes:true,attributeFilter:['class']});
}

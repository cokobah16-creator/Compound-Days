// Executes the shipped game logic and real Three.js/glTF loader without WebGL.
// This is geometry/state verification, not a browser or GPU performance test.
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');
const THREE=require(path.join(root,'assets/vendor/three-r128.min.js'));
const noop=()=>{};
function element(){
  const ctx=new Proxy({measureText:s=>({width:String(s).length*9}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>k in o?o[k]:noop});
  const e={style:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},dataset:{},children:[],innerHTML:'',textContent:'',clientWidth:800,clientHeight:600,width:800,height:600,
    addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,appendChild(c){this.children.push(c);c.parentNode=this;return c},removeChild:noop,remove:noop,contains:()=>true,querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML:noop,getContext:()=>ctx,toDataURL:()=>'',getBoundingClientRect:()=>({left:0,top:0,width:800,height:600}),focus:noop,blur:noop};return e;
}
const els=new Map(),storage=new Map();
const document={getElementById:id=>{if(!els.has(id))els.set(id,element());return els.get(id)},createElement:element,createElementNS:element,addEventListener:noop,querySelector:()=>null,querySelectorAll:()=>[],body:element(),documentElement:element(),fonts:{ready:Promise.resolve()},hidden:false};
const context={THREE,document,console,URL,URLSearchParams,Blob,TextDecoder,TextEncoder,ArrayBuffer,Uint8Array,Float32Array,Uint16Array,Uint32Array,DataView,Buffer,Math,Date,Promise,Map,Set,WeakMap,
  location:{search:'',hash:'',href:'http://local.test/'},navigator:{maxTouchPoints:0,userAgent:'Geometry verification',getGamepads:()=>[]},performance,innerWidth:1280,innerHeight:800,devicePixelRatio:1,
  addEventListener:noop,removeEventListener:noop,matchMedia:()=>({matches:false,addEventListener:noop}),getComputedStyle:()=>({getPropertyValue:()=>''}),
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},
  atob:s=>Buffer.from(s,'base64').toString('binary'),btoa:s=>Buffer.from(s,'binary').toString('base64'),setTimeout:()=>0,clearTimeout:noop,setInterval:()=>0,clearInterval:noop,requestAnimationFrame:()=>0,cancelAnimationFrame:noop};
context.window=context;context.self=context;
vm.createContext(context);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
// The final inline block calls boot/WebGL. Load definitions and wrappers only.
for(const [full,attr,body] of scripts){const src=attr.match(/src="([^"]+)"/);if(src){if(src[1].includes('three-r128'))continue;vm.runInContext(fs.readFileSync(path.join(root,src[1]),'utf8'),context,{filename:src[1]});}
  else if(!/else \{ boot\(\); \}/.test(body))vm.runInContext(body,context,{filename:'index-inline.js'});}
THREE.FileLoader.prototype.load=function(url,onLoad,onProgress,onError){try{let b;if(url.startsWith('data:'))b=Buffer.from(url.split(',')[1],'base64');else b=fs.readFileSync(path.resolve(root,url));const data=this.responseType==='arraybuffer'?b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength):b.toString();Promise.resolve().then(()=>onLoad(data));return data;}catch(e){if(onError)onError(e);else throw e;}};
// Texture pixels are deliberately not decoded in the geometry/state harness.
THREE.ImageLoader.prototype.load=function(url,onLoad){const image={width:1,height:1};Promise.resolve().then(()=>onLoad(image));return image;};
function run(code){return vm.runInContext(code,context);}
function parse(file){return new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(fs.readFileSync(path.join(root,file),'utf8'),'',resolve,reject));}
async function load(){
  const hero=await parse('assets/characters/efe.gltf.json');context.loadedHero=hero;
  run("HERO.gltf=loadedHero;HERO.state='ready';HERO.clips={};for(const c of loadedHero.animations){const n=heroClipName(c.name);if(n)HERO.clips[n]=c;}if(typeof presenceBakeBase==='function')presenceBakeBase();if(typeof authored34Install==='function')authored34Install();");
  const ids=run("[...new Set([...Object.values(WARDROBE.hair),...Object.values(WARDROBE.outfits).flat()])]");
  for(const id of ids){context.loadedWardrobe=await parse('assets/wardrobe/'+id+'.gltf.json');context.wardrobeId=id;run('WARDROBE.cache[wardrobeId]=loadedWardrobe');}
  run('S=newState();scene=new THREE.Scene();');
  return {run,context,THREE,parse};
}
module.exports={load,run,context,THREE,parse,root};
if(require.main===module)load().then(()=>{console.log(run("JSON.stringify({state:HERO.state,wardrobe:Object.keys(WARDROBE.cache).length,clips:Object.keys(HERO.clips)})"));}).catch(e=>{console.error(e);process.exitCode=1});

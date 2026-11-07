/* v51 Home collection: "Make the flat feel like yours." The owner's twenty Blender renders (fifteen furnishings from
   Palm Court Finds and the five wall and floor finishes) become the pictures for those pieces in Finds, Home and Build,
   a collection on the Home page counts which of the twenty the household has had, and the plainer built pieces
   (potted plant, floor lamp, chairs, woven rug, balcony planter, wall art, speaker, bookshelf, kitchen upgrade) and the three patterned
   finishes (Adire indigo walls, cream terrazzo and teak floors) are rebuilt in 3D to the renders.
   Loaded after waterfront-v48.js. Every behaviour change wraps an earlier global and calls it. */

const HOME51={
 // the sheet's order: 01-15 are FINDS34, 16-20 the PAINTS35 finishes
 pieces:['plant','lamp','chairs','rug','art','planter','shelf','coffee','armchair','speaker','bed','dining','wardrobe','kitchen','tvconsole'],
 finishes:['indigo','palm','ochre','terrazzo','teak'],
 // the built pieces this module draws itself (the others keep their catalogue models)
 built:['plant','lamp','chairs','rug','art','planter','shelf','speaker','kitchen'],
 tex:{},mats:{},
 done:'Every piece of the home collection has been through Flat 3. It feels like ours now.'
};
HOME51.all=HOME51.pieces.concat(HOME51.finishes);
function home51URL(id){const u='assets/home/'+id+'.webp?v='+(typeof BUILD_ID!=='undefined'?BUILD_ID:'');try{return new URL(u,document.baseURI).href;}catch(e){return u;}}
function home51Pic(id,cls){return `<img class="${cls||'home51-pic'}" src="${home51URL(id)}" alt="" decoding="async" loading="lazy">`;}

/* ---------- the collection: anything the household has owned at least once ---------- */
function home51OwnsNow(id){if(!S||!S.home)return false;
 if(HOME51.finishes.includes(id))return !!(S.home.paints&&S.home.paints.includes(id));
 return S.home.items.some(x=>x.type===id)||S.home.storage.includes(id);}
function home51Got(){const got=new Set((S&&S.home&&S.home.got51)||[]);for(const id of HOME51.all)if(home51OwnsNow(id))got.add(id);return HOME51.all.filter(id=>got.has(id));}
// note what is owned now into the save (called from shared actions only, so both devices agree); the twentieth piece goes in the album once
function home51Note(){if(!S||!S.home)return;const before=(S.home.got51||[]).length,got=home51Got();if(got.length===before)return;S.home.got51=got;
 if(got.length===HOME51.all.length&&!S.home.got51done){S.home.got51done=S.day;remember(HOME51.done,'moment');
  if(!(typeof silentMode==='function'&&silentMode()))toast('The home collection is complete. All twenty, in the album.');}}
for(const n of ['lifeBuy','placeItem','buyPaint35','lifeCell','ghostbuy']){const prev=ACTIONS[n];if(typeof prev!=='function')continue;
 // wrap: after a purchase or a placement, the collection notes what the household owns
 ACTIONS[n]=function(){const r=prev.apply(this,arguments);try{home51Note();}catch(e){}return r;};}

function home51CollectionHTML(){const got=new Set(home51Got()),n=got.size,T=HOME51.all.length,paint=id=>TUNE35.paintOf(id);
 const tile=id=>{const has=got.has(id),name=HOME51.finishes.includes(id)?paint(id).name:ITEMS[id].name;
  return `<div class="home51-tile${has?' got':''}" title="${esc(name)}">${home51Pic(id,'home51-mini')}<span>${esc(name)}</span><em>${has?'✓ Yours':'At Finds'}</em></div>`;};
 return `<section class="home51-collection"><p class="life-kicker">HOME COLLECTION · ${n} OF ${T}</p><h3>${n===T?'The flat feels like yours.':'Make the flat feel like yours.'}</h3>`+
  `<div class="home51-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${T}" aria-valuenow="${n}"><span style="width:${Math.round(n/T*100)}%"></span></div>`+
  `<p class="small muted">${n===T?'All twenty pieces have been yours. Rearrange to your heart’s content.':'Fifteen furnishings and five finishes, all from Palm Court Finds on Market Road.'}</p>`+
  `<h4>Furniture and plants</h4><div class="home51-grid">${HOME51.pieces.map(tile).join('')}</div><h4>Walls and floors</h4><div class="home51-grid">${HOME51.finishes.map(tile).join('')}</div></section>`;}

/* ---------- pictures in Finds, Home and Build ---------- */
const home51Icon=furnishingIcon34;
// wrap: a collection piece shows its render instead of the flat drawing
furnishingIcon34=function(t){return HOME51.pieces.includes(t)?home51Pic(t):home51Icon.apply(this,arguments);};
const home51Market=marketHTML34;
// wrap: the paint cards show the finish's render above the colour swatch, which stays as a strip of the wall colour
marketHTML34=function(){let h=home51Market.apply(this,arguments);
 for(const p of PAINTS35){const sw=`<span class="paint35-swatch" style="background:${p.hex}"></span>`;h=h.replace(sw,home51Pic(p.id)+sw);}return h;};
const home51Home=homeHTML34;
// wrap: the paint chips show a slice of the render inside the colour dot, and the collection follows the room (before "Browse today's finds")
homeHTML34=function(){let h=home51Home.apply(this,arguments);
 for(const p of PAINTS35)h=h.replace(new RegExp(`(data-act="paint35" data-id="${p.id}"[^>]*><span style="background:${p.hex}">)</span>`),`$1${home51Pic(p.id,'home51-chip')}</span>`);
 const block=home51CollectionHTML(),at=h.indexOf('data-act="lifeTab" data-v="market"');
 if(at>=0){const b=h.lastIndexOf('<button',at);return h.slice(0,b)+block+h.slice(b);}
 const w=h.indexOf('data-act="lifeGo" data-v="home"');if(w>=0){const b=h.lastIndexOf('<button',w);const e=h.indexOf('</button>',w)+9;return h.slice(0,e)+block+h.slice(e);}
 return h+block;};
const home51OpenBuild=openBuild;
// wrap: the Build catalogue's cards carry the render above the name
openBuild=function(){const r=home51OpenBuild.apply(this,arguments);if(typeof panel==='undefined'||!panel||typeof panel.innerHTML!=='string')return r;
 let h=panel.innerHTML;for(const t of HOME51.pieces){const nm=`<div class="nm">${esc(ITEMS[t].name)}</div>`;h=h.split(nm).join(home51Pic(t,'home51-thumb')+nm);}
 if(h!==panel.innerHTML)panel.innerHTML=h;return r;};

/* ---------- 3D: textures drawn once on a canvas ---------- */
// three.js uuids draw on Math.random and the harnesses seed it: everything this module builds draws on its own sequence
function home51Quiet(fn){const real=Math.random;let s=0x2545F491;Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};try{return fn();}finally{Math.random=real;}}
function home51SRGB(){return !!(THREE.sRGBEncoding&&typeof renderer!=='undefined'&&renderer&&renderer.outputEncoding===THREE.sRGBEncoding);}
// div: the material keeps the paint's own colour (v35 checks it), so the drawing is divided by it and the two multiply back to the drawn colours
function home51Canvas(w,h,draw,rep,div){const key=draw.name+':'+w+'x'+h;if(HOME51.tex[key])return HOME51.tex[key];
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext&&c.getContext('2d');if(g)try{draw(g,w,h);
  if(div&&g.getImageData){const im=g.getImageData(0,0,w,h),d=im&&im.data,col=[1,3,5].map(i=>parseInt(String(div).slice(i,i+2),16)/255);   // read from the hex itself: the game's Color may already be linear
   // with an sRGB renderer the texel is decoded and the colour is linear, so the division is done in linear light
   const lin=home51SRGB(),toL=v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4),toS=v=>v<=.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-.055;
   const k=col.map(v=>Math.max(lin?toL(v):v,1e-4)),lut=[0,1,2].map(j=>Array.from({length:256},(_,x)=>{const t=Math.min(1,(lin?toL(x/255):x/255)/k[j]);return Math.round((lin?toS(t):t)*255);}));
   if(d&&d.length===w*h*4){for(let i=0;i<d.length;i+=4)for(let j=0;j<3;j++)d[i+j]=lut[j][d[i+j]];g.putImageData(im,0,0);}}}catch(e){}
 const t=new THREE.CanvasTexture(c);if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}
 if(home51SRGB())t.encoding=THREE.sRGBEncoding;
 t.anisotropy=4;HOME51.tex[key]=t;return t;}
// a small seeded scatter for the drawings (never Math.random)
function home51Rand(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1103515245)+12345)>>>0;return (s>>>8)/16777216;};}
function adire51(g,w,h){g.fillStyle='#2C4A78';g.fillRect(0,0,w,h);const n=2,step=w/n;g.strokeStyle='#D9D3C2';g.lineWidth=2.2;
 for(let i=0;i<n;i++)for(let j=0;j<n;j++){const cx=step*(i+.5),cy=step*(j+.5);for(const r of [step*.38,step*.27,step*.15]){g.beginPath();g.moveTo(cx,cy-r);g.lineTo(cx+r,cy);g.lineTo(cx,cy+r);g.lineTo(cx-r,cy);g.closePath();g.stroke();}
  g.fillStyle='#E9E4D6';g.beginPath();g.arc(cx,cy,4,0,Math.PI*2);g.fill();for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){g.beginPath();g.arc(cx+dx*step*.46,cy+dy*step*.46,2.5,0,Math.PI*2);g.fill();}}
 g.globalAlpha=.06;const R=home51Rand(7);for(let k=0;k<900;k++){g.fillStyle=R()<.5?'#000':'#fff';g.fillRect(R()*w,R()*h,2,2);}g.globalAlpha=1;}
function terrazzo51(g,w,h){g.fillStyle='#E7E0D3';g.fillRect(0,0,w,h);const R=home51Rand(19),cols=['#C9663C','#8C8C8C','#D9A066','#3A3A3A','#B7AFA2','#E3A72F','#9A4A2E'];
 for(let k=0;k<1500;k++){const x=R()*w,y=R()*h,r=.8+R()*R()*5;g.fillStyle=cols[Math.floor(R()*cols.length)];g.beginPath();
  for(let a=0;a<5;a++){const t=a/5*Math.PI*2+R(),rr=r*(.6+R()*.6);a?g.lineTo(x+Math.cos(t)*rr,y+Math.sin(t)*rr):g.moveTo(x+Math.cos(t)*rr,y+Math.sin(t)*rr);}g.closePath();g.fill();}}
function teak51(g,w,h){const R=home51Rand(31),n=4,pw=w/n;for(let i=0;i<n;i++){const base=[160,98,58].map(v=>v+Math.round((R()-.5)*18));
  g.fillStyle=`rgb(${base})`;g.fillRect(i*pw,0,pw,h);g.globalAlpha=.16;for(let k=0;k<26;k++){g.strokeStyle=R()<.5?'#5C3A20':'#C98C5A';g.lineWidth=1+R()*1.5;const x=i*pw+R()*pw;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+(R()-.5)*8,h*.33,x+(R()-.5)*8,h*.66,x+(R()-.5)*6,h);g.stroke();}
  g.globalAlpha=1;g.fillStyle='#5A3820';g.fillRect(i*pw,0,2,h);const cut=(.2+R()*.6)*h;g.fillRect(i*pw,cut,pw,2);}}
function cane51(g,w,h){g.fillStyle='#E2C48E';g.fillRect(0,0,w,h);g.strokeStyle='#A77C44';g.lineWidth=2;const s=8;
 for(let k=-h;k<w+h;k+=s){g.beginPath();g.moveTo(k,0);g.lineTo(k+h,h);g.stroke();g.beginPath();g.moveTo(k+h,0);g.lineTo(k,h);g.stroke();}
 g.fillStyle='#7A5530';for(let x=s/2;x<w;x+=s)for(let y=s/2;y<h;y+=s)g.fillRect(x-1,y-1,2,2);}
function rug51(g,w,h){g.fillStyle='#D8BE8E';g.fillRect(0,0,w,h);g.fillStyle='#C9AC79';for(let y=0;y<h;y+=10)g.fillRect(0,y,w,4);
 const fr=26,b=46;g.fillStyle='#F0E6D2';g.fillRect(0,0,w,fr);g.fillRect(0,h-fr,w,fr);g.fillStyle='#3E5F9C';for(let x=4;x<w;x+=9){g.fillRect(x,0,3,fr-4);g.fillRect(x,h-fr+4,3,fr-4);}
 g.fillStyle='#3E5F9C';g.fillRect(b,fr+18,w-2*b,12);g.fillRect(b,h-fr-30,w-2*b,12);g.fillRect(b,fr+18,12,h-2*fr-36);g.fillRect(w-b-12,fr+18,12,h-2*fr-36);
 g.fillRect(b+26,fr+44,w-2*b-52,4);g.fillRect(b+26,h-fr-48,w-2*b-52,4);
 for(let x=b+30;x<w-b-30;x+=36){g.beginPath();g.moveTo(x,fr+48);g.lineTo(x+18,fr+48);g.lineTo(x+9,fr+64);g.closePath();g.fill();g.beginPath();g.moveTo(x,h-fr-48);g.lineTo(x+18,h-fr-48);g.lineTo(x+9,h-fr-64);g.closePath();g.fill();}}
function print51(g,w,h){g.fillStyle='#EEE3CC';g.fillRect(0,0,w,h);g.fillStyle='#E3A72F';g.beginPath();g.arc(w*.68,h*.2,w*.13,0,Math.PI*2);g.fill();
 g.fillStyle='#6E9A70';g.beginPath();g.moveTo(0,h*.62);g.lineTo(w*.28,h*.36);g.lineTo(w*.5,h*.55);g.lineTo(w*.74,h*.4);g.lineTo(w,h*.56);g.lineTo(w,h);g.lineTo(0,h);g.fill();
 g.fillStyle='#3E6B56';g.beginPath();g.moveTo(0,h*.74);g.lineTo(w*.2,h*.56);g.lineTo(w*.44,h*.7);g.lineTo(w,h*.62);g.lineTo(w,h);g.lineTo(0,h);g.fill();
 g.fillStyle='#2F4E86';g.beginPath();g.moveTo(w*.58,h*.6);g.bezierCurveTo(w*.2,h*.72,w*.8,h*.82,w*.3,h);g.lineTo(w*.52,h);g.bezierCurveTo(w*.98,h*.82,w*.4,h*.72,w*.66,h*.6);g.fill();
 g.fillStyle='#D9733F';g.beginPath();g.moveTo(0,h*.84);g.lineTo(w*.26,h*.8);g.lineTo(w*.34,h);g.lineTo(0,h);g.fill();g.beginPath();g.moveTo(w,h*.82);g.lineTo(w*.62,h*.9);g.lineTo(w*.58,h);g.lineTo(w,h);g.fill();
 g.strokeStyle='#2F4A3A';g.lineWidth=3;for(const [x,y] of [[.3,.42],[.8,.44]]){g.beginPath();g.moveTo(w*x,h*y);g.lineTo(w*x+2,h*(y-.16));g.stroke();g.fillStyle='#2F4A3A';
  for(const a of [-2.4,-1.9,-1.2,-.6]){g.beginPath();g.ellipse(w*x+2+Math.cos(a)*w*.05,h*(y-.16)+Math.sin(a)*w*.03,w*.055,w*.014,a,0,Math.PI*2);g.fill();}}}
function pleat51(g,w,h){g.fillStyle='#F4EBDA';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){g.fillStyle='rgba(150,120,80,.18)';g.fillRect(x,0,2,h);g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x+4,0,1,h);}}
const hex51=id=>TUNE35.paintOf(id).hex;
HOME51.finishTex={indigo:()=>home51Canvas(256,256,adire51,[1/0.72,1/0.72],hex51('indigo')),terrazzo:()=>home51Canvas(512,512,terrazzo51,[1/1.2,1/1.2],hex51('terrazzo')),teak:()=>home51Canvas(256,512,teak51,[1/0.8,1/1.8],hex51('teak'))};

/* ---------- 3D: the finishes on the flat's walls and floor ---------- */
const home51Paint=applyPaint35;
// wrap: after the walls and floor take their colour, the patterned finishes lay their pattern over it (the colour stays the paint's) (metre UVs, so one texture tiles everything)
applyPaint35=function(){const r=home51Paint.apply(this,arguments);try{home51Pattern();}catch(e){}return r;};
function home51Pattern(){const f=TUNE35&&TUNE35.flat;if(!f)return;const meshes=f.walls.concat(f.floor?[f.floor]:[]);
 for(const m of meshes){const u=m&&m.userData;if(!u||!u.paint35Own||!m.material)continue;const make=HOME51.finishTex[u.paint35Id];if(!make||m.material.userData.home51===u.paint35Id)continue;
  home51Quiet(()=>{const tex=make();m.material.map=tex;m.material.userData.home51=u.paint35Id;m.material.needsUpdate=true;});}}

/* ---------- 3D: the pieces, to the renders ---------- */
function home51Mat(c,o){const k=c+JSON.stringify(o||{});if(!HOME51.mats[k]){const m=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));HOME51.mats[k]=m;}return HOME51.mats[k];}
const TEAK51='#A8713F',TEAKD51='#8E5A3B';   // both are TEXFOR wood colours, so box() gives them the wood texture
function home51Build(type,w,h){const g=new THREE.Group(),W=w*FLAT.cell-0.12,D=h*FLAT.cell-0.12;
 const B=(a,b,c,col,x,y,z,o)=>box(a,b,c,col,x,y,z,Object.assign({parent:g},o||{}));const C=(r,hh,col,x,y,z,o)=>cyl(r,hh,col,x,y,z,Object.assign({parent:g},o||{}));
 const mesh=(geo,m,x,y,z)=>{const q=new THREE.Mesh(geo,m);q.position.set(x,y,z);g.add(q);return q;};
 const cane=()=>home51Mat('#FFFFFF',{map:home51Canvas(128,128,cane51,[2,2])});
 switch(type){
  case 'plant':{const tc='#C8693F';C(0.2,0.03,'#B85D36',0,0,0,{seg:20});C(0.15,0.3,tc,0,0.03,0,{seg:16,rt:0.19});C(0.195,0.04,'#B85D36',0,0.3,0,{seg:20});C(0.17,0.01,'#3A2A1F',0,0.33,0,{seg:16});
   for(let k=0;k<9;k++){const a=k*2.4,lean=0.25+(k%3)*0.12,len=0.42+(k%4)*0.08,x=Math.cos(a)*0.03,z=Math.sin(a)*0.03;
    const st=C(0.01,len,'#3F6B3A',x,0.33,z,{seg:4});st.rotation.set(Math.sin(a)*lean,0,-Math.cos(a)*lean);
    const tip=[x+Math.cos(a)*Math.sin(lean)*len,0.33+Math.cos(lean)*len,z+Math.sin(a)*Math.sin(lean)*len];
    const lf=sphere(0.11,k%2?'#5E9450':'#76A862',tip[0],tip[1]+0.04,tip[2],{parent:g,seg:8});lf.scale.set(0.45,1.25,0.14);lf.rotation.set(Math.sin(a)*lean*1.4,-a+Math.PI/2,-Math.cos(a)*lean*1.4);}break;}
  case 'chairs':{for(const [x,z,ry] of [[-0.2,-0.2,0.35],[0.2,-0.2,-0.35],[-0.2,0.2,Math.PI-0.35],[0.2,0.2,Math.PI+0.35]]){const c=new THREE.Group();c.position.set(x,0,z);c.rotation.y=ry;c.scale.setScalar(0.82);g.add(c);
    const P=(a,b,d,col,px,py,pz)=>box(a,b,d,col,px,py,pz,{parent:c});
    for(const [lx,lz] of [[-0.15,-0.15],[0.15,-0.15],[-0.15,0.15],[0.15,0.15]])P(0.035,0.44,0.035,TEAK51,lx,0,lz);
    P(0.36,0.035,0.36,TEAK51,0,0.42,0);P(0.33,0.05,0.33,'#2F5A45',0,0.455,0.005);
    for(const lx of [-0.15,0.15])P(0.035,0.46,0.035,TEAK51,lx,0.44,-0.165);P(0.33,0.035,0.035,TEAK51,0,0.88,-0.165);
    const back=new THREE.Mesh(new THREE.PlaneGeometry(0.26,0.32),cane());back.position.set(0,0.7,-0.16);c.add(back);const bb=back.clone();bb.rotation.y=Math.PI;bb.position.z=-0.17;c.add(bb);}break;}
  case 'lamp':{C(0.16,0.035,'#2A1F17',0,0,0,{seg:20});C(0.165,0.012,'#C9A14A',0,0.035,0,{seg:20});C(0.014,1.24,'#C9A14A',0,0.04,0,{seg:8});C(0.03,0.04,'#C9A14A',0,1.26,0,{seg:8});
   const sh=mesh(new THREE.CylinderGeometry(0.15,0.24,0.34,28,1,true),home51Mat('#FFFFFF',{map:home51Canvas(256,32,pleat51,[3,1]),emissive:'#E3A72F',emissiveIntensity:0.22,side:THREE.DoubleSide}),0,1.42,0);sh.castShadow=false;
   const cord=mesh(new THREE.BoxGeometry(0.28,0.01,0.012),home51Mat('#2A1F17'),0.2,0.006,0.05);cord.rotation.y=-0.3;break;}
  case 'rug':{const rg=mesh(new THREE.BoxGeometry(W,0.02,D),home51Mat('#FFFFFF',{map:home51Canvas(384,384,rug51)}),0,0.01,0);rg.receiveShadow=true;break;}
  case 'planter':{const tc='#C8693F';B(0.8,0.26,0.36,tc,0,0.05,0);B(0.84,0.05,0.4,'#B85D36',0,0.29,0);B(0.74,0.02,0.3,'#3A2A1F',0,0.3,0);
   for(const x of [-0.34,0.34])B(0.08,0.05,0.3,'#A9532F',x,0,0);
   for(let k=0;k<10;k++){const s=mesh(new THREE.BoxGeometry(0.082,0.012,0.004),home51Mat('#F1E4CC'),-0.34+k*0.076,0.17,0.182);s.rotation.z=k%2?0.5:-0.5;}
   for(let k=0;k<4;k++){const x=-0.27+k*0.18;C(0.008,0.3,'#3F7A45',x,0.3,0,{seg:4});
    for(let j=0;j<4;j++){const lf=sphere(0.07,'#4F8A4A',x+Math.cos(j*1.7+k)*0.06,0.48+j*0.035,Math.sin(j*1.7+k)*0.05,{parent:g,seg:6});lf.scale.set(1,0.25,0.5);lf.rotation.y=j*1.7+k;}
    for(let j=0;j<2;j++){const p=sphere(0.026,'#D2342A',x+(j?0.04:-0.035),0.43+j*0.06,0.04,{parent:g,seg:6});p.scale.set(1,2,1);}}break;}
  case 'art':{B(0.56,0.7,0.04,TEAKD51,0,1.12,0);B(0.48,0.62,0.01,'#F1E4CC',0,1.16,0.02);   // the top stays under 1.87 m, clear of Ada's shelf (v38)
   const pr=mesh(new THREE.PlaneGeometry(0.4,0.54),home51Mat('#FFFFFF',{map:home51Canvas(168,232,print51)}),0,1.47,0.032);pr.castShadow=false;break;}
  case 'speaker':{const bw=0.38,bh=0.66,bd=0.3;B(bw,bh,bd,TEAK51,0,0.04,0);B(bw-0.05,bh-0.1,0.012,'#2F5A45',0,0.08,bd/2);
   const gr=mesh(new THREE.PlaneGeometry(bw-0.1,bh-0.16),cane(),0,0.04+bh/2-0.02,bd/2+0.008);gr.castShadow=false;
   for(const [y,r] of [[0.52,0.075],[0.24,0.11]]){const ring=mesh(new THREE.CylinderGeometry(r,r,0.02,24),home51Mat('#2A2622'),0,y,bd/2+0.015);ring.rotation.x=Math.PI/2;const cone=mesh(new THREE.CylinderGeometry(r*0.25,r*0.8,0.03,20),home51Mat('#151515'),0,y,bd/2+0.03);cone.rotation.x=Math.PI/2;}
   for(let k=0;k<3;k++)C(0.018,0.025,'#C9A14A',-0.08+k*0.08,0.7,-0.02,{seg:10});for(const x of [-0.14,0.14])C(0.02,0.04,'#C9A14A',x,0,0.08,{seg:8});break;}
  case 'shelf':{const sw=0.72,sh=1.42,sd=0.3,t=0.035;B(t,sh,sd,TEAK51,-sw/2+t/2,0.04,0);B(t,sh,sd,TEAK51,sw/2-t/2,0.04,0);B(sw,t,sd,TEAK51,0,sh+0.04-t,0);B(sw-2*t,sh,0.012,TEAKD51,0,0.04,-sd/2+0.006);for(const y of [0.04,0.38,0.72,1.06])B(sw-2*t,t,sd,TEAK51,0,y,0);for(const x of [-0.3,0.3])B(0.04,0.04,0.04,TEAKD51,x,0,0.1);
   const R=home51Rand(type.length*97),books=['#2E4A8F','#2F6B4F','#E3A72F','#F1E4CC','#3F5B8E','#B5512C','#1F3A33'];
   for(const [y,n,x0] of [[0.075,5,-0.29],[0.415,6,-0.29],[0.755,4,-0.29]]){let x=x0;for(let k=0;k<n;k++){const bw2=0.035+R()*0.025,bh2=0.2+R()*0.08;B(bw2,bh2,0.2,books[Math.floor(R()*books.length)],x+bw2/2,y,0.01);x+=bw2+0.004;}}
   C(0.06,0.012,'#2A1F17',0.18,0.79,0.02,{seg:16}).rotation.x=Math.PI/2.4;{const v=sphere(0.06,'#C8693F',0.2,0.135,0.02,{parent:g,seg:10});v.scale.set(1,1.2,1);}
   C(0.05,0.07,'#C8693F',0.22,sh+0.04,0.01,{seg:10,rt:0.06});for(let j=0;j<5;j++){const lf=sphere(0.05,'#4F8A4A',0.22+Math.cos(j*1.3)*0.04,sh+0.16+j*0.02,0.01+Math.sin(j*1.3)*0.03,{parent:g,seg:6});lf.scale.set(1,0.35,0.55);lf.rotation.z=j;}break;}
  case 'kitchen':{const rw=0.66,cw=W-rw;B(cw,0.86,0.6,'#E9E2D5',-W/2+cw/2,0,0);B(cw,0.04,0.62,'#CFC6B7',-W/2+cw/2,0.86,0);
   for(let k=0;k<Math.max(1,Math.round(cw/0.39));k++){B(0.3,0.5,0.02,'#D9D0C0',-W/2+0.2+k*0.39,0.2,0.31);B(0.08,0.02,0.02,'#6E6A66',-W/2+0.2+k*0.39,0.56,0.33);}
   const x0=W/2-rw/2,green='#2F5A45';B(rw,0.86,0.6,green,x0,0.04,0);B(rw,0.025,0.62,'#C9A14A',x0,0.9,0);B(rw-0.02,0.02,0.58,'#1E1E1E',x0,0.925,0);
   for(const [dx,dz] of [[-0.15,-0.13],[0.15,-0.13],[-0.15,0.13],[0.15,0.13]]){C(0.075,0.015,'#2A2A2A',x0+dx,0.945,dz,{seg:14});B(0.17,0.012,0.012,'#111',x0+dx,0.96,dz);B(0.012,0.012,0.17,'#111',x0+dx,0.96,dz);}
   B(rw-0.14,0.36,0.012,'#1F3A30',x0,0.2,0.301);B(rw-0.2,0.02,0.02,'#C9A14A',x0,0.6,0.31);
   for(let k=0;k<4;k++){const kn=C(0.022,0.025,'#C9A14A',x0-0.21+k*0.14,0.72,0.3,{seg:10});kn.rotation.x=Math.PI/2;}for(const x of [-0.27,0.27])C(0.022,0.04,'#C9A14A',x0+x,0,0.24,{seg:8});
   const put=(name,x,y,z,ry,sc)=>{if(typeof propInstance!=='function'||!PROPS.cache[name])return;const inst=propInstance(name);if(!inst)return;if(sc)inst.scale.setScalar(sc);inst.position.set(x,y,z);inst.rotation.y=ry||0;g.add(inst);};
   put('cooking_pot',x0-0.15,0.94,0.13,0.3,0.9);put('kettle',x0+0.15,0.94,-0.13,-0.6,0.9);put('chopping_board',-W/2+0.3,0.88,0.06,0.15,0.9);put('blender',-W/2+0.68,0.88,-0.14,-0.2,0.9);break;}
  default:return null;}
 g.traverse(m=>{if(m.isMesh){if(m.castShadow!==false||m.geometry.type!=='PlaneGeometry')m.castShadow=true;m.receiveShadow=true;}});return g;}
HOME51.build=home51Build;
const home51Furn=buildFurn;
// wrap: the nine built pieces are drawn to the renders; the earlier builder still runs first and is set aside, so the seeded sequence the harnesses see does not move
buildFurn=function(type,w,h){const base=home51Furn.apply(this,arguments);if(!HOME51.built.includes(type))return base;let mine=null;
 try{mine=home51Quiet(()=>home51Build(type,w,h));}catch(e){if(typeof console!=='undefined')console.warn('home51',type,e);}return mine||base;};

/* ---------- stylesheet ---------- */
HOME51.css=`#panel img.home51-pic{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;object-position:50% 58%;margin:0 auto 12px;border-radius:12px;background:#F5F1E0}
#panel .paint35-card img.home51-pic{margin-bottom:6px}#panel .paint35-card .paint35-swatch{height:10px;margin:0 0 10px;border-radius:6px}
#panel .garden-art34 img.home51-pic{max-width:360px}
#panel .cell34 img.home51-pic{width:100%;height:100%;aspect-ratio:auto;margin:0;border-radius:6px;object-fit:contain;background:transparent;mix-blend-mode:multiply}
#panel .storage34 img.home51-pic{width:76px;aspect-ratio:4/3;margin:0 auto 4px;border-radius:8px}
#panel img.home51-thumb{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;object-position:50% 58%;background:#F5F1E0;border-radius:8px;margin:0 0 6px}
#panel .paint35-chip span{overflow:hidden}#panel .paint35-chip img.home51-chip{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.8);border-radius:50%}
#panel .home51-collection{margin:18px 0 12px;padding:14px;border-radius:16px;background:#FBF8EE;border:1px solid #0001}
#panel .home51-collection h3{margin:2px 0 8px}#panel .home51-collection h4{margin:12px 0 6px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#5c6859}
#panel .home51-bar{height:8px;border-radius:8px;background:#E6E0CC;overflow:hidden;margin:0 0 8px}#panel .home51-bar span{display:block;height:100%;background:#2F6B4F;border-radius:8px}
#panel .home51-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
@media(max-width:560px){#panel .home51-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
#panel .home51-tile{position:relative;border-radius:12px;background:#F5F1E0;padding:6px 6px 8px;text-align:center;font-size:12px;line-height:1.2;color:#2A3A33}
#panel .home51-tile img.home51-mini{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;filter:grayscale(.85) opacity(.5)}
#panel .home51-tile span{display:block;margin-top:4px;font-weight:600}#panel .home51-tile em{display:block;font-style:normal;font-size:11px;color:#7d8478;margin-top:2px}
#panel .home51-tile.got img.home51-mini{filter:none}#panel .home51-tile.got em{color:#2F6B4F}`;
if(typeof document!=='undefined'&&document.head&&document.head.appendChild){const st=document.createElement('style');st.id='home51-css';st.textContent=HOME51.css;document.head.appendChild(st);}

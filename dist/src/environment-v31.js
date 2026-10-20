/* Compound Days v31: coherent tactile materials, soft architecture and a lived-in entry. */
'use strict';
const ENV31={textures:new Map(),mats:new Map(),world:null,cloth:new Map()};
function texture31(name,data=false){
 const key=name+(data?':data':'');if(ENV31.textures.has(key))return ENV31.textures.get(key);
 const url='assets/materials/'+name+'.png?v='+BUILD_ID,t=new THREE.TextureLoader().load(url);t.encoding=data?THREE.LinearEncoding:THREE.sRGBEncoding;
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;t.userData={art31File:'assets/materials/'+name+'.png'};ENV31.textures.set(key,t);return t;
}
function material31(kind,color){
 const full=LOOK.pbr&&!qLite(),key=(full?'full|':'lite|')+kind+'|'+color;if(ENV31.mats.has(key))return ENV31.mats.get(key);
 const tex=['plaster','paving','terracotta','wood','cloth','sand','metal'].includes(kind)?kind:'plaster';
 if(!full){const m=new THREE.MeshLambertMaterial({name:'art31_'+kind,color,map:texture31(tex)});m.userData.art31Kind=kind;ENV31.mats.set(key,m);return m;}
 const options={name:'art31_'+kind,color,map:texture31(tex),roughness:kind==='wood'?.79:kind==='metal'?.56:kind==='cloth'?.96:.92,metalness:kind==='metal'?.18:0,
   bumpMap:texture31(tex+'-height',true),bumpScale:kind==='paving'?.012:kind==='terracotta'?.008:kind==='wood'?.0025:kind==='cloth'?.0012:.002,envMapIntensity:.38};
 if(['plaster','paving','terracotta','wood','cloth'].includes(tex))options.roughnessMap=texture31(tex+'-roughness',true);
 const m=new THREE.MeshStandardMaterial(options);m.userData.art31Kind=kind;ENV31.mats.set(key,m);return m;
}
envMat=function(kind,color){return material31(kind,color);};
envTexture=function(kind){return texture31(kind==='paving'?'paving':kind==='wood'?'wood':kind==='cloth'?'cloth':'plaster');};
function uv31(geo,scale=1){
 const p=geo.attributes.position,n=geo.attributes.normal;if(!p||!n)return;
 const uv=new Float32Array(p.count*2);
 for(let i=0;i<p.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
   uv[i*2]=(ny>nx&&ny>nz?p.getX(i):nx>nz?p.getZ(i):p.getX(i))*scale;
   uv[i*2+1]=(ny>nx&&ny>nz?p.getZ(i):p.getY(i))*scale;}
 geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
}
function bevel31(w,h,d,r=.025){
 r=Math.min(r,w*.16,h*.16,d*.16);const half=[w/2,h/2,d/2],p=[],n=[],uv=[],idx=[];
 const fractions=a=>[-a,-a+r*.30,-a+r,a-r,a-r*.30,a];
 for(const axis of [0,1,2])for(const sign of [-1,1]){
   const a=(axis+1)%3,b=(axis+2)%3,A=fractions(half[a]),B=fractions(half[b]),start=p.length/3;
   for(let j=0;j<6;j++)for(let i=0;i<6;i++){
     const v=[0,0,0];v[axis]=sign*half[axis];v[a]=A[i];v[b]=B[j];
     const q=v.map((x,k)=>Math.max(-half[k]+r,Math.min(half[k]-r,x))),normal=new THREE.Vector3(v[0]-q[0],v[1]-q[1],v[2]-q[2]).normalize();
     p.push(q[0]+normal.x*r,q[1]+normal.y*r,q[2]+normal.z*r);n.push(normal.x,normal.y,normal.z);uv.push(A[i],B[j]);
     if(i&&j){const k=start+j*6+i;const f=[k-7,k-6,k-1,k-1,k-6,k];if(sign<0)for(let t=0;t<6;t+=3)[f[t],f[t+1]]=[f[t+1],f[t]];idx.push(...f);}
   }
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));geo.setIndex(idx);uv31(geo);return geo;
}
const art31EnvMesh=envMesh;
envMesh=function(geo,material,parent,x,y,z){if(material?.userData.art31Kind&&geo.attributes.normal)uv31(geo,material.userData.art31Kind==='cloth'?2.5:1);return art31EnvMesh(geo,material,parent,x,y,z);};
const art31Box=box;
box=function(w,h,d,c,x,y,z,o){
 const mesh=art31Box(w,h,d,c,x,y,z,o),kind=mesh.userData.environmentSurface;
 if(kind&&mesh.geometry?.type==='BoxGeometry'&&Math.min(w,h,d)>.06){mesh.geometry=bevel31(w,h,d,kind==='wood'?.018:.035);}
 if(String(c).toUpperCase()==='#DCE9F2')mesh.material=new THREE.MeshStandardMaterial({name:'window31',color:'#7B9694',roughness:.27,metalness:.12,envMapIntensity:.75});
 return mesh;
};
const art31Mat=mat;
mat=function(c,options){const kind=TEXFOR[String(c).toLowerCase()];if(kind){const m=material31(kind==='zinc'?'metal':kind==='soil'?'sand':kind,c);return options?Object.assign(m.clone(),options):m;}return art31Mat(c,options);};
const art31ApplyMaterials=envApplyMaterials;
envApplyMaterials=function(p){art31ApplyMaterials(p);for(const {m,kind}of ENV23.surfaces){
 const base=material31(kind==='roof'?'terracotta':kind==='trim'?'wood':kind==='wall'?'plaster':kind,p[kind]);
 if(FADEABLE.includes(m)){m.material=base.clone();m.material.transparent=true;}else m.material=base;
 if(m.geometry?.attributes.normal)uv31(m.geometry);
 }};

// Leaves grow from a common crown, with a curved centre rib and folded edges.
function plant31(parent,height,color,seed=1){
 const p=[],c=[],idx=[],r=envRand(seed),base=new THREE.Color(color),n=12;
 for(let k=0;k<n;k++){
   const a=k*2.399+r()*.22,len=height*(.39+r()*.28),reach=height*(.22+r()*.15),y0=height*.30,tip=height*(.68+r()*.25),start=p.length/3;
   for(let j=0;j<=12;j++){const t=j/12,curve=Math.sin(t*Math.PI*.70),width=Math.sin(t*Math.PI)**.85*height*(.07+r()*.002);
     for(const side of [-1,0,1]){const x=Math.sin(a)*reach*curve+Math.cos(a)*side*width,z=Math.cos(a)*reach*curve-Math.sin(a)*side*width,y=y0+(tip-y0)*t+height*.16*Math.sin(t*Math.PI)-Math.abs(side)*height*.018;
       p.push(x,y,z);const light=.80+.22*t+(side===0?.08:0);c.push(base.r*light,base.g*light,base.b*light);}
     if(j){const b=start+(j-1)*3;idx.push(b,b+3,b+1,b+1,b+3,b+4,b+1,b+4,b+2,b+2,b+4,b+5);}}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));geo.setIndex(idx);geo.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({name:'leaf31',color:'#FFFFFF',vertexColors:true,roughness:.65,side:THREE.DoubleSide,envMapIntensity:.25});
 return envMesh(geo,material,parent);
}
const art31Planter=envPlanter;
envPlanter=function(x,z,color,height=1,parent=scene,y=0){const g=art31Planter(x,z,color,height,parent,y);
 for(const o of g.children.slice())if(o.isMesh&&o.geometry.attributes.color&&o.material.isMeshLambertMaterial){g.remove(o);o.geometry.dispose();}
 const p=ENV_PRESETS.find(p=>p.id===ENV23.id);plant31(g,height,p.leaf,Math.round((x+40)*719+(z+40)*31));return g;
};
leafPlant=function(x,z,color,height=.95){const g=envPlanter(x,z,color,height);addObs(x-.22,x+.22,z-.22,z+.22,'plant');return g;};
// Feathered palm fronds are modeled as curved leaflets in one crown mesh.
palm=function(x,z,height=4){
 const g=new THREE.Group();g.name='palm31';g.position.set(x,0,z);scene.add(g);
 const rand=envRand(Math.round((x+40)*417+(z+40)*997)),lean=(rand()-.5)*.32;
 const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(),new THREE.Vector3(lean,height*.58,0),new THREE.Vector3(lean*1.5,height,0));
 const trunk=envMesh(new THREE.TubeGeometry(curve,22,.115,10,false),material31('wood','#8B7657'),g);trunk.geometry.attributes.uv.array.forEach((v,i,a)=>a[i]=v*(i%2?2:10));
 const P=[],C=[],I=[],base=new THREE.Color('#4C7250'),top=curve.getPoint(1),fronds=qLite()?9:12;
 const blade=(start,end,width,bend,color)=>{
   const offset=P.length/3,dir=end.clone().sub(start),side=new THREE.Vector3(-dir.z,0,dir.x).normalize();
   for(let j=0;j<=6;j++){const t=j/6,centre=start.clone().addScaledVector(dir,t);centre.y+=Math.sin(t*Math.PI)*bend;
     const w=width*Math.sin(t*Math.PI)**.8;
     for(const k of [-1,0,1]){const v=centre.clone().addScaledVector(side,k*w);v.y-=Math.abs(k)*width*.18;P.push(v.x,v.y,v.z);const light=color*(k===0?1.04:.94);C.push(base.r*light,base.g*light,base.b*light);}
     if(j){const k=offset+(j-1)*3;I.push(k,k+3,k+1,k+1,k+3,k+4,k+1,k+4,k+2,k+2,k+4,k+5);}}
 };
 for(let f=0;f<fronds;f++){
   const a=f/fronds*Math.PI*2+rand()*.12,dir=new THREE.Vector3(Math.sin(a),0,Math.cos(a)),side=new THREE.Vector3(Math.cos(a),0,-Math.sin(a)),length=height*(.48+rand()*.12);
   const centre=t=>top.clone().addScaledVector(dir,t*length).add(new THREE.Vector3(0,Math.sin(t*Math.PI)*height*.11-t*t*height*.17,0));
   const stem=P.length/3;
   for(let j=0;j<=24;j++){const point=centre(j/24);for(const sign of [-1,1]){const v=point.clone().addScaledVector(side,sign*.012);P.push(v.x,v.y,v.z);C.push(base.r*.90,base.g*.90,base.b*.90);}if(j){const a=stem+j*2;I.push(a-2,a,a-1,a-1,a,a+1);}}
   for(let j=1;j<=13;j++){const t=j/14,root=centre(t),spread=height*.105*Math.sin(t*Math.PI)**.7;
     for(const sign of [-1,1]){const tip=centre(Math.min(1,t+.07)).addScaledVector(side,sign*spread);tip.y-=height*(.017+.034*t);blade(root,tip,.025*(.6+Math.sin(t*Math.PI)*.6),height*.012,.76+rand()*.35);}}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));geo.setIndex(I);geo.computeVertexNormals();
 const leaf=new THREE.MeshStandardMaterial({name:'palm31_leaf',color:'#FFFFFF',vertexColors:true,roughness:.76,side:THREE.DoubleSide,envMapIntensity:.2});const crown=envMesh(geo,leaf,g);fadeable(crown);
 const nut=new THREE.SphereGeometry(.105,10,8),nutMat=material31('wood','#61503B');for(let i=0;i<3;i++){const m=envMesh(nut,nutMat,g,top.x+Math.sin(i*2.4)*.12,top.y-.16,Math.cos(i*2.4)*.12);m.scale.y=1.25;}
 addObs(x-.2,x+.2,z-.2,z+.2,'palm');return g;
};
function wax31(){let m=ENV31.mats.get('wax31');if(!m){m=new THREE.MeshStandardMaterial({name:'wax_print31',color:'#FFFFFF',map:texture31('ankara'),bumpMap:texture31('cloth-height',true),bumpScale:.0008,roughness:.94,envMapIntensity:.30});ENV31.mats.set('wax31',m);}return m;}
const art31PropMerge=propMerge;
propMerge=function(root,name){root.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const old=o.material,n=old.name||'';
 if(/cushion_print/.test(n))o.material=wax31();
 else if(/wood|fabric|cloth|cushion/.test(n)){const kind=/wood/.test(n)?'wood':'cloth',m=material31(kind,'#FFFFFF').clone();m.name=n;m.color.copy(old.color);o.material=m;uv31(o.geometry,kind==='cloth'?3:2);}
 });return art31PropMerge(root,name);};
const art31Cushion=envCushion;
envCushion=function(x,y,z,p){const m=envMesh(new THREE.SphereGeometry(1,20,12),wax31(),ENV23.group,x,y,z);m.scale.set(.23,.09,.21);return m;};
function detail31(){
 const g=new THREE.Group();g.name='entry31';scene.add(g);ENV31.world=g;
 const cream=material31('plaster','#DED5BE'),metal=material31('metal','#465650'),timber=material31('wood','#80634B');
 // Facade base bands and lintels give the plaster a proper edge against the paving.
 for(const [x,w]of [[-5.5,4.7],[5.5,4.7]]){envBox(w,.14,.11,cream,g,x,.02,-6.28);envBox(w,.10,.15,cream,g,x,2.50,-6.30);}
 // Entry meter, conduit and modest wall plaque; all placed against the existing wall.
 const meter=envMesh(bevel31(.23,.34,.10,.018),metal,g,-7.65,1.62,2.065);meter.rotation.y=Math.PI;
 envBox(.13,.12,.012,new THREE.MeshStandardMaterial({color:'#9CAFA3',roughness:.30}),g,-7.65,1.64,2.005);
 envTube([[-7.65,1.45,2.06],[-7.65,.32,2.06],[-7.35,.22,2.06]],.012,metal,g);
 const plate=envMesh(bevel31(.28,.18,.025,.025),material31('plaster','#EEE5CE'),g,-7.12,1.76,2.035);plate.rotation.y=Math.PI;
 const number=textSprite('01',{w:.21,size:48,bg:'rgba(0,0,0,0)',fg:'#3D5C4E'});number.position.set(-7.12,1.76,2.061);g.add(number);
 // A narrow drain and metal grate run along the facade, outside the carrying route.
 envBox(14,.018,.16,material31('plaster','#817E6C'),g,0,.018,-6.05);
 const bars=[];for(let i=0;i<54;i++)bars.push([-.065,0,-.008,.065,0,-.008]);
 const gp=[],gi=[];for(let i=0;i<54;i++){const x=-6.85+i*.255,j=gp.length/3;gp.push(x-.045,.043,-6.12,x+.045,.043,-6.12,x+.045,.043,-5.98,x-.045,.043,-5.98);gi.push(j,j+2,j+1,j,j+3,j+2);}
 const grate=new THREE.BufferGeometry();grate.setAttribute('position',new THREE.Float32BufferAttribute(gp,3));grate.setIndex(gi);grate.computeVertexNormals();envMesh(grate,metal,g);
 // The doormat uses a shallow rounded slab; the woven map carries the small detail.
 envMesh(bevel31(.74,.025,.43,.012),material31('cloth','#8A795B'),g,-3.02,.043,5.91);
 // Timber covers on the two gate posts soften the high contrast orange columns.
 for(const x of [3,5])envMesh(bevel31(.47,.08,.47,.025),timber,g,x,2.34,5.98);
}
const art31BuildWorld=buildWorld;
buildWorld=function(){art31BuildWorld();detail31();if(sun){sun.shadow.normalBias=.014;sun.shadow.bias=-.00008;sun.shadow.radius=2.5;}
 // The hand-written sky/water shaders need the same output conversion as standard materials.
 for(const o of [skyDome,waterMesh]){const m=o?.material;if(m?.isShaderMaterial&&!m.fragmentShader.includes('encodings_fragment')){m.fragmentShader=m.fragmentShader.replace(/}\s*$/,'\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n}');m.needsUpdate=true;}}
};

// Keep the existing time-of-day system, using a restrained sky and a broad fill.
const LIGHT31=[
 [5,'#D8C5B4','#FFE0BF',.45,'#CFDCE1','#A79B85',.58],
 [7,'#D9D7C7','#FFF0D6',.95,'#D5E3E5','#B7AA91',.62],
 [10,'#B9D5DB','#FFF4E4',1.20,'#DCE9ED','#B8AB94',.65],
 [15,'#C1D7D7','#FFF0DC',1.13,'#DBE8E8','#B6A992',.65],
 [18,'#D9BFB0','#FFD6AC',.76,'#B8CAD4','#928470',.60],
 [19.5,'#8C9FA9','#E5C0A6',.28,'#9DB3C3','#6D7775',.55],
 [21,'#3E566D','#C5D6EA',.18,'#8399B3','#505E68',.48],
 [23,'#283C54','#AABFD9',.12,'#768EA9','#465565',.44],
 [29,'#D8C5B4','#FFE0BF',.45,'#CFDCE1','#A79B85',.58]
];
LKEY.splice(0,LKEY.length,...LIGHT31);COLOR.exposure=.88;COLOR.previewExposure=.88;COLOR.thumbExposure=.88;
const art31Lighting=applyLighting;
applyLighting=function(){art31Lighting();const h=S?S.time%24:12,night=h>=19||h<6;if(amb)amb.intensity=night?.22:.14;if(LOOK.rim)LOOK.rim.intensity=night?.16:.10;};
const art31Cameras=updateCameras;
updateCameras=function(dt){art31Cameras(dt);if(!players.length||!sun)return;const single=singleIdx(),active=single>=0?[players[single]]:players;
 const centre=new THREE.Vector3();active.forEach(p=>centre.add(p.g.position));centre.multiplyScalar(1/active.length);centre.y=0;
 const sep=active.length===2?active[0].g.position.distanceTo(active[1].g.position):0,half=Math.max(12,Math.min(25,12+sep*.55));
 sun.target.position.copy(centre);sun.position.copy(centre).add(sunDir.clone().multiplyScalar(40));const c=sun.shadow.camera;c.left=-half;c.right=half;c.top=half;c.bottom=-half;c.updateProjectionMatrix();
};

// v33a: OUTFIT_COLORS/lookColors starter lines, the hero cloth/hair texture pass and the HAIRS/CAST/ENV23_LOOKS hair reassignment removed (presets-v26/bases-v29/art-v31 retired; the authored v21 wardrobe carries its own textures).

const art31RenderSetup=renderSetup;
renderSetup=function(){art31RenderSetup();const p=document.getElementById('panel');if(p)p.classList.toggle('studio31',S?.setup?.step==='p0'||S?.setup?.step==='p1');};
const art31OpenPanel=openPanel;
openPanel=function(){document.getElementById('panel')?.classList.remove('studio31');return art31OpenPanel.apply(this,arguments);};
function disposeAvatar31(g){if(!g)return;const materials=new Set(),geometries=new Set();g.traverse(o=>{if(!o.isMesh)return;for(const m of(Array.isArray(o.material)?o.material:[o.material]))materials.add(m);if(o.geometry.userData.art31Owned)geometries.add(o.geometry);});materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());if(g.mixer){g.mixer.stopAllAction();g.mixer.uncacheRoot(g);}}
function studio31(world){if(world.userData.studio31)return;world.userData.studio31=true;world.background=new THREE.Color('#D4D1C3');
 const lights=[];world.traverse(o=>{if(o.isLight)lights.push(o);});for(const l of lights)world.remove(l);
 world.add(new THREE.HemisphereLight('#E3EBEB','#A9A18D',.8));
 for(const [color,intensity,pos]of [['#FFF0DA',1.35,[-2.5,4,3]],['#E0E9E5',.50,[3,2.5,-3]],['#E0E9E5',.40,[3,1,3]]]){const d=new THREE.DirectionalLight(color,intensity);d.position.set(...pos);world.add(d);}
}
const art31MountPreview=mountPreview;
mountPreview=function(container,look){const old=prevChar,out=art31MountPreview(container,look);if(old&&old!==prevChar)disposeAvatar31(old);if(prevScene&&!prevScene.userData.art31){
 prevScene.userData.art31=true;prevScene.background=new THREE.Color('#D4D1C3');
 const lights=[];prevScene.traverse(o=>{if(o.isLight)lights.push(o);if(o.isMesh&&o.geometry.type==='CircleGeometry')o.material=material31('plaster','#B8B6A6');});
 studio31(prevScene);
 }return out;};
thumbRender=function(look,kind){if(!thumbInit())return null;studio31(THUMB.scene);const g=makeAvatar(look);if(!g)return null;const head=['hair','headwear','face','beard'].includes(kind),scale=g.scale.y||1;
 g.rotation.y=-.24;THUMB.scene.add(g);
 // v33a: head thumbnails framed on the authored v21 head (centre 1.645 m, skull about .35 m wide, hair up to about 1.95 m).
 if(head){THUMB.cam.position.set(.05,1.69*scale,1.42);THUMB.cam.lookAt(0,1.66*scale,0);}else{THUMB.cam.position.set(0,1.38,4.6);THUMB.cam.lookAt(0,.98,0);}
 try{animAvatar(g,.4,false,false,0,.016);THUMB.r.render(THUMB.scene,THUMB.cam);return THUMB.r.domElement.toDataURL('image/png');}finally{THUMB.scene.remove(g);disposeAvatar31(g);}
};

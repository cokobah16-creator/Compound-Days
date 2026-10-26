/* Reusable geometry/material kit. No image references are presented as models. */
'use strict';
const ENV23={ready:false,id:'palm',group:null,staticGroup:null,materials:{},textures:{},surfaces:[],lights:[],fade:[],peopleReady:false,buildCount:0,loading:false};
function envRand(seed){let n=seed;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function envTexture(kind){
 if(ENV23.textures[kind])return ENV23.textures[kind];
 const cv=document.createElement('canvas');cv.width=cv.height=512;const c=cv.getContext('2d'),r=envRand(2317),n=512;
 c.fillStyle=kind==='paving'?'#b4b2aa':'#f0ede4';c.fillRect(0,0,n,n);
 if(kind==='paving'){
  for(let y=0;y<4;y++)for(let x=0;x<4;x++){const v=215+Math.round(r()*24);c.fillStyle=`rgb(${v},${v-2},${v-7})`;c.fillRect(x*128+3,y*128+3,121,121);c.fillStyle='rgba(255,255,255,.27)';c.fillRect(x*128+4,y*128+4,119,2);c.fillStyle='rgba(65,60,46,.10)';c.fillRect(x*128+5,y*128+122,118,2);}
 }else if(kind==='wood'){
  c.fillStyle='#d4c8b1';c.fillRect(0,0,n,n);for(let k=0;k<130;k++){const y=r()*n;c.strokeStyle=`rgba(78,56,38,${.03+r()*.12})`;c.lineWidth=.4+r()*1.8;c.beginPath();for(let x=0;x<=n;x+=8){const yy=y+Math.sin(x*.015+k)*2;c.lineTo(x,yy);}c.stroke();}
 }else if(kind==='cloth'){
  for(let k=0;k<n;k+=4){c.fillStyle=k%8?'rgba(255,255,255,.17)':'rgba(90,76,55,.12)';c.fillRect(k,0,1,n);c.fillRect(0,k,n,1);}
 }else{
  for(let i=0;i<120;i++){const x=r()*n,y=r()*n,rad=8+r()*50,g=c.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,'rgba(120,110,90,.035)');g.addColorStop(1,'rgba(120,110,90,0)');c.fillStyle=g;c.fillRect(x-rad,y-rad,rad*2,rad*2);}
 }
 for(let k=0;k<16000;k++){const a=.015+r()*.05;c.fillStyle=r()>.5?`rgba(255,255,255,${a})`:`rgba(35,30,23,${a})`;c.fillRect(r()*n,r()*n,1,1);}
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;ENV23.textures[kind]=t;return t;
}
function envMat(kind,color){
 const key=kind+color;if(ENV23.materials[key])return ENV23.materials[key];
 const tex=envTexture(kind);const m=new THREE.MeshStandardMaterial({color,map:tex,roughness:kind==='wood'?.84:.95,metalness:0,bumpMap:tex,bumpScale:kind==='paving'?.013:.003});m.name='env23_'+kind;m.envMapIntensity=.35;ENV23.materials[key]=m;return m;
}
function envMesh(geo,material,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;(parent||scene).add(m);return m;}
function envBox(w,h,d,material,parent,x,y,z){return envMesh(new THREE.BoxGeometry(w,h,d),material,parent,x,y+h/2,z);}
function envTube(points,radius,material,parent){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return envMesh(new THREE.TubeGeometry(curve,Math.max(6,points.length*3),radius,6,false),material,parent);}
function envLeafCloud(parent,x,y,z,radius,height,count,color,seed=37){
 const P=[],C=[],I=[],rand=envRand(seed),base=new THREE.Color(color);
 for(let k=0;k<count;k++){
  const a=rand()*Math.PI*2,rr=Math.sqrt(rand())*radius,cx=x+Math.cos(a)*rr,cz=z+Math.sin(a)*rr,cy=y+rand()*height;
  const len=.18+rand()*.18,width=len*(.22+rand()*.1),s=P.length/3,col=base.clone().multiplyScalar(.72+rand()*.48);
  for(let j=0;j<=6;j++){const t=j/6,w=Math.pow(Math.sin(t*Math.PI),.85)*width;for(const side of [-1,0,1]){P.push(cx+Math.cos(a)*(t-.5)*len-Math.sin(a)*side*w,cy+.12*len*Math.sin(t*Math.PI)-Math.abs(side)*.035+len*.4*t,cz+Math.sin(a)*(t-.5)*len+Math.cos(a)*side*w);C.push(col.r,col.g,col.b);}if(j){const b=s+(j-1)*3;I.push(b,b+1,b+3,b+1,b+4,b+3,b+1,b+2,b+4,b+2,b+5,b+4);}}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));geo.setIndex(I);geo.computeVertexNormals();
 const m=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});return envMesh(geo,m,parent);
}
function envPlanter(x,z,color='#AC6848',height=.95,parent=scene,y=0){
 const g=new THREE.Group();g.name='env23_planter';g.position.set(x,y,z);parent.add(g);const r=height*.22,h=height*.35;
 const pot=envMat('plaster',color);envMesh(new THREE.CylinderGeometry(r,r*.73,h,18),pot,g,0,h/2,0);const lip=envMesh(new THREE.TorusGeometry(r,.026,6,24),pot,g,0,h-.02,0);lip.rotation.x=Math.PI/2;
 envMesh(new THREE.CylinderGeometry(r*.89,r*.89,.025,18),envMat('plaster','#483829'),g,0,h-.025,0);
 envTube([[0,h,0],[.03,height*.59,.01],[0,height*.85,0]],.018,envMat('wood','#58633E'),g);
 envLeafCloud(g,0,height*.39,0,height*.28,height*.43,35,ENV_PRESETS.find(p=>p.id===ENV23.id).leaf,Math.round(x*479+z*711+height*19));return g;
}
function envTank(x,y,z,lvl){
 const g=new THREE.Group();g.name='env23_ribbed_tank';g.position.set(x,y,z);scene.add(g);const plinth=envMat('plaster','#ACA18A'),plastic=new THREE.MeshStandardMaterial({color:'#374C48',roughness:.65}),pipe=envMat('plaster','#C3BCAE');
 envBox(1.5,.22,1.5,plinth,g,0,0,0);envMesh(new THREE.CylinderGeometry(.61,.65,1.35,32),plastic,g,0,.895,0);
 for(let k=0;k<7;k++){const ring=envMesh(new THREE.TorusGeometry(.638,.027,6,36),plastic,g,0,.37+k*.177,0);ring.rotation.x=Math.PI/2;}
 envMesh(new THREE.CylinderGeometry(.55,.63,.12,32),plastic,g,0,1.625,0);envMesh(new THREE.CylinderGeometry(.19,.21,.06,20),plastic,g,0,1.715,0);
 envTube([[.59,.58,0],[.78,.58,0],[.83,.53,0],[.83,.18,0]],.036,pipe,g);envBox(.17,.026,.038,envMat('wood','#A46847'),g,.8,.57,0);
 addObs(x-.80,x+.80,z-.80,z+.80,'tank',lvl);g.traverse(m=>{if(m.isMesh)ENV23.fade.push(m);});return g;
}
function envHangingCloth(parent,x,y,z,w,h,color,pattern=0){
 const geo=new THREE.PlaneGeometry(w,h,16,14),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const xx=p.getX(i),yy=p.getY(i),t=(h/2-yy)/h;p.setZ(i,Math.sin(xx/w*Math.PI*8+pattern)*.028*t+.055*t*t);p.setY(i,yy-Math.sin((xx/w+.5)*Math.PI)*.034*(1-t));}geo.computeVertexNormals();
 const material=envMat('cloth',color).clone();material.side=THREE.DoubleSide;const m=envMesh(geo,material,parent,x,y-h/2,z);ENV23.fade.push(m);
 for(const sign of [-1,1])envBox(.025,.085,.027,envMat('wood','#BA9570'),parent,x+sign*w*.36,y-.028,z+.008);return m;
}
function envRoofLaundry(){
 const g=new THREE.Group();g.name='env23_roof_laundry';g.position.set(0,3.45,0);scene.add(g);
 for(const x of [9.3,11.4]){envMesh(new THREE.CylinderGeometry(.034,.045,2.02,12),envMat('plaster','#788076'),g,x,1.01,-1.2);addObs(x-.10,x+.1,-1.3,-1.1,'post',1);}
 envTube([[9.3,2.01,-1.2],[10.35,1.93,-1.2],[11.4,2.01,-1.2]],.009,envMat('wood','#584C3B'),g);
 [9.75,10.35,10.95].forEach((x,k)=>envHangingCloth(g,x,1.95,-1.2,.48,.73,['#557D90','#C7A361','#E6DECA'][k],k));
}
// Smooth-leaf replacements used while the world is being constructed.
bucketPlant=function(x,z,c){envPlanter(x,z,c,1.05);addObs(x-.24,x+.24,z-.24,z+.24,'plant');};
pot=function(x,z,c,big){envPlanter(x,z,c,big?1.13:.76);addObs(x-.22,x+.22,z-.22,z+.22,'plant');};
bougainvillea=function(x,z,r=.8,h=1.1,noObs){
 const g=new THREE.Group();g.name='env23_bougainvillea';g.position.set(x,0,z);scene.add(g);envTube([[0,0,0],[.04,h*.7,0],[.16,h,0]],.024,envMat('wood','#805E40'),g);
 envLeafCloud(g,0,h*.35,0,r*.75,h*.66,95,'#3F6B42',Math.round(x*37+z*57));envLeafCloud(g,0,h*.65,0,r*.64,h*.26,19,'#B96E8A',Math.round(x*43+z*39));if(!noObs)addObs(x-.2,x+.2,z-.2,z+.2,'plant');return g;
};
tree=function(x,z,h=3,c){const g=new THREE.Group();g.name='env23_tree';g.position.set(x,0,z);scene.add(g);envMesh(new THREE.CylinderGeometry(.07,.16,h*.72,10),envMat('wood','#785638'),g,0,h*.36,0);for(let j=0;j<3;j++){const a=j*2.3;envTube([[0,h*.4,0],[Math.sin(a)*h*.15,h*.66,Math.cos(a)*h*.15],[Math.sin(a)*h*.2,h*.8,Math.cos(a)*h*.2]],.035,envMat('wood','#785638'),g);}const leaf=envLeafCloud(g,0,h*.58,0,h*.36,h*.4,qLite()?110:180,c||'#4C7750',Math.round(x*117+z*47));ENV23.fade.push(leaf);};

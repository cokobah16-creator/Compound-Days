/* Compound Days v32: readable silhouettes, sewn garments, grounded studio and a real stair assembly. */
'use strict';

// v33a: starter/tankset outfits, coverage32, cage32, body32Skin, VIS32 and neck32Geometry removed (v29 generated body retired; the authored v21 character is used as modelled).
const SHADOW32={texture:null,geometry:null};
function shadow32Texture(){
 if(SHADOW32.texture)return SHADOW32.texture;
 const n=64,data=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const r=Math.hypot((x+.5)/n*2-1,(y+.5)/n*2-1),k=(y*n+x)*4;data[k]=data[k+1]=data[k+2]=255;data[k+3]=Math.round(255*Math.max(0,1-r*r)**3);}
 const t=new THREE.DataTexture(data,n,n,THREE.RGBAFormat);t.minFilter=t.magFilter=THREE.LinearFilter;t.needsUpdate=true;t.encoding=THREE.sRGBEncoding;SHADOW32.texture=t;return t;
}
function shadow32Geometry(){
 if(SHADOW32.geometry)return SHADOW32.geometry;
 const p=[],uv=[],idx=[];
 for(const [x,z,w,d]of [[0,.025,.74,.48],[-.10,.065,.24,.32],[.10,.065,.24,.32]]){
   const j=p.length/3;p.push(x-w/2,0,z-d/2,x+w/2,0,z-d/2,x+w/2,0,z+d/2,x-w/2,0,z+d/2);uv.push(0,0,1,0,1,1,0,1);idx.push(j,j+2,j+1,j,j+3,j+2);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();SHADOW32.geometry=g;return g;
}
function ground32(g){
 const mat=new THREE.MeshBasicMaterial({name:'contact32',color:'#443D30',map:shadow32Texture(),transparent:true,opacity:.19,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const shadow=new THREE.Mesh(shadow32Geometry(),mat);shadow.name='contact32';shadow.castShadow=false;shadow.receiveShadow=false;shadow.renderOrder=2;g.add(shadow);g.userData.contact32=shadow;updateGround32(g);
}
function updateGround32(g){const s=g.userData.contact32;if(!s)return;const scale=g.scale.y||1;s.position.y=((g.baseY||0)-g.position.y+.035)/scale;s.visible=!g.sitting;}
// v33a: the silhouette32/body32Skin assembly is gone; this wrapper only adds the contact shadow.
const make32Hero=makeHeroAvatar;
makeHeroAvatar=function(look){const g=make32Hero(look);if(g?.hero)ground32(g);return g;};
const animate32=animAvatar;
animAvatar=function(g,t,moving,carrying,speed,dt){const out=animate32.apply(this,arguments);if(g?.hero)updateGround32(g);return out;};

// A longer lens uses the existing viewport-aware fit calculation. It continues
// to include the complete actor and furniture in both players' views.
for(const c of cams){c.fov=34;c.updateProjectionMatrix();}
const init32Renderer=initRenderer;
initRenderer=function(){const out=init32Renderer();camera.fov=34;camera.updateProjectionMatrix();return out;};

function merge32(geometries){
 const p=[],n=[],u=[],idx=[];
 for(const geo of geometries){const a=geo.attributes.position,b=geo.attributes.normal,uv=geo.attributes.uv,start=p.length/3;for(let i=0;i<a.count;i++){p.push(a.getX(i),a.getY(i),a.getZ(i));n.push(b.getX(i),b.getY(i),b.getZ(i));u.push(uv?uv.getX(i):0,uv?uv.getY(i):0);}if(geo.index)idx.push(...Array.from(geo.index.array,x=>x+start));else for(let i=0;i<a.count;i++)idx.push(start+i);geo.dispose();}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));geo.setIndex(idx);return geo;
}
function rail32(a,b,r){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),g=new THREE.CylinderGeometry(r,r,v.length(),10);g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize())));g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);return g;}
function stair32(){
 const root=new THREE.Group();root.name='stair32';scene.add(root);
 const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(3.4,0);shape.lineTo(3.4,3.4);
 for(let i=9;i>=0;i--){shape.lineTo(i*.34,(i+1)*.34);shape.lineTo(i*.34,i*.34);}shape.closePath();
 const core=new THREE.ExtrudeGeometry(shape,{depth:1.2,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,steps:1,curveSegments:1});core.rotateY(Math.PI/2);core.translate(6.1,0,9.5);uv31(core);
 envRegister(envMesh(core,material31('plaster','#B7AA92'),root),'wall');
 const rails=[],noses=[],stringers=[];
 for(const x of [6.0,7.4]){
   const s=new THREE.Shape();s.moveTo(0,.10);s.lineTo(3.4,3.50);s.lineTo(3.4,3.22);s.lineTo(0,0);s.closePath();
   const g=new THREE.ExtrudeGeometry(s,{depth:.18,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:2,steps:1});g.rotateY(Math.PI/2);g.translate(x-.09,0,9.5);stringers.push(g);
   rails.push(rail32([x,1.05,9.48],[x,4.42,6.11],.034));
   for(let i=0;i<7;i++){const t=i/6,y=.21+t*3.19,z=9.45-t*3.24;rails.push(rail32([x,y,z],[x,1.08+t*3.24,z],.019));}
 }
 envRegister(envMesh(merge32(stringers),material31('plaster','#DED5BE'),root),'wall');
 envRegister(envMesh(merge32(rails),material31('metal','#4D6258'),root),'trim');
 for(let i=0;i<10;i++){const g=bevel31(1.20,.045,.115,.012);g.translate(6.7,(i+1)*.34-.015,9.45-i*.34);noses.push(g);}
 envRegister(envMesh(merge32(noses),material31('terracotta','#BA8D6D'),root),'roof');
 root.children.forEach((m,i)=>m.name=['stair32_core','stair32_stringers','stair32_rails','stair32_nosings'][i]);
 addObs(5.9,6.1,6.1,9.6,'stair',2);addObs(7.3,7.5,6.1,9.6,'stair',2);
 return root;
}
const world32=buildWorld;
buildWorld=function(){world32();
 // Copings give the existing parapets a rounded cap without moving any walls.
 const root=new THREE.Group();root.name='copings32';scene.add(root);
 for(const [w,d,x,z]of [[3.65,.33,10.25,-6.4],[.33,12.85,12,-.2],[3.65,.33,10.25,6],[.33,11.45,8.6,-.8],[.28,1.35,6.1,5.5],[2.45,.28,7.3,4.95],[1.25,.28,7.9,6.05]]){
   const g=bevel31(w,.085,d,.027);g.translate(x,4.31,z);envRegister(envMesh(g,material31('plaster','#E4DAC4'),root),'wall');
 }
};
const studio32=studio31;
studio31=function(world){studio32(world);if(world.userData.stage32)return;world.userData.stage32=true;
 world.fog=new THREE.Fog('#D4D1C3',6,14);
 for(const o of world.children.slice())if(o.isMesh&&o.geometry.type==='CircleGeometry')o.visible=false;
 const floor=envMesh(new THREE.CylinderGeometry(.72,.74,.055,64),material31('plaster','#BBB8A5'),world,0,-.026,0);floor.name='studio32_plinth';floor.castShadow=false;
 const p=[],idx=[],steps=28;
 for(let j=0;j<=steps;j++){const t=j/steps,z=2-t*5,y=t<.67?-.056:-.056+((t-.67)/.33)**2*4;for(const x of [-8,8])p.push(x,y,z);if(j){const i=j*2;idx.push(i-2,i-1,i,i-1,i+1,i);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();const mat=new THREE.MeshStandardMaterial({color:'#D4D1C3',roughness:1,side:THREE.DoubleSide});envMesh(geo,mat,world).castShadow=false;
};
// v33a: preview32 creator framing and the thumbRender replacement removed; polish-v30 and environment-v31 framing applies.

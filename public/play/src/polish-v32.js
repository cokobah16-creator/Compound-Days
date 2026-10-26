/* Compound Days v32: readable silhouettes, sewn garments, grounded studio and a real stair assembly. */
'use strict';

// A plain crew tee reads well on every starter base. Keep the tank as a separate
// optional set, with both choices using the same shorts and shoes.
WARDROBE.outfits.starter=['tee','shorts','sneakers'];
WARDROBE.outfits.tankset=['tank','shorts','sneakers'];
Object.assign(OUTFITS.find(o=>o.id==='starter'),{name:'Starter: tee & shorts'});
OUTFITS.splice(1,0,{id:'tankset',name:'Tank & shorts',c:'#E6DCC8',c2:'#46534C'});
OUTFIT_COLORS.tankset=Object.assign({},OUTFIT_COLORS.starter);

// Compose all garment openings before restoring exposed skin. Each field is
// linear on the original skin triangles; outside the outfit means outside every
// piece. Older assets retain their original masks when mixed with new pieces.
const COVER32={topology:new Map()};
function coverage32(g){
 const body=g.hero?.body,group=body?.parent;if(!group)return false;
 const names=g.hero.wardrobe?.garments||[],defs=names.map(name=>wardrobeExtras(WARDROBE.cache[name]));
 const fields=defs.filter(d=>d?.coverage32).map(d=>d.coverage32);if(!fields.length)return false;
 if(!COVER32.wrist){const src=HERO.gltf.scene.getObjectByName('Body_1').geometry.attributes.position,v=Array(src.count).fill(-1);for(const name of ['Body_5','Body_6'])for(const i of HERO.gltf.scene.getObjectByName(name).geometry.index.array)v[i]=src.getY(i)-.918;COVER32.wrist=v;}fields.push(COVER32.wrist);

 const coarse={},legacyHidden=new Set();for(const d of defs)if(d&&!d.coverage32){for(const k in d.covers||{})coarse[k]=Math.max(coarse[k]||0,d.covers[k]);for(const tri of d.hiddenBodyTriangles||[])legacyHidden.add(tri.join(','));}
 const parts=group.children.filter(o=>o.isSkinnedMesh&&o.userData.targetNames),regions=body.userData.regions||[],key=names.join('|');let topology=COVER32.topology.get(key);
 if(!topology){
   const perRegion=[],patches=[];let masked=0;
   for(const part of parts){const keep=[],indices=part.geometry.index.array;
     for(let t=0;t<indices.length;t+=3){const ids=[indices[t],indices[t+1],indices[t+2]];if(legacyHidden.has(ids.join(','))){masked++;continue;}
       const values=fields.map(f=>ids.map(i=>f[i]));if(values.every(v=>v.every(x=>x<=0))){keep.push(...ids);continue;}
       masked++;let poly=[[1,0,0],[0,1,0],[0,0,1]];
       for(const v of values){if(v.every(x=>x<=0))continue;const next=[];for(let i=0;i<poly.length;i++){
         const a=poly[i],b=poly[(i+1)%poly.length],fa=a.reduce((s,w,k)=>s+w*v[k],0),fb=b.reduce((s,w,k)=>s+w*v[k],0);
         if(fa<=0)next.push(a);if((fa<=0)!==(fb<=0)){const t=fa/(fa-fb);next.push(a.map((w,k)=>w*(1-t)+b[k]*t));}
       }poly=next;if(poly.length<3)break;}
       if(poly.length>=3&&Math.max(...ids.map(i=>part.geometry.attributes.position.getY(i)))<=1.485)patches.push({ids,poly,region:perRegion.length});
     }perRegion.push(keep);
   }topology={perRegion,patches,masked};COVER32.topology.set(key,topology);
 }
 parts.forEach((part,i)=>{part.userData.region=regions[i];part.visible=(coarse[regions[i]]||0)<BASES29.coverThreshold;const geo=new THREE.BufferGeometry();geo.attributes=Object.assign({},part.geometry.attributes);geo.setIndex(topology.perRegion[i]);part.geometry=geo;});
 const pos=[],normal=[],color=[],joints=[],weights=[],index=[],baryMeta=[],a=body.geometry.attributes;
 for(const {ids,poly,region}of topology.patches){if([1,2,3].includes(region)||(coarse[regions[region]]||0)>=BASES29.coverThreshold)continue;const start=pos.length/3;
   for(const bary of poly){const p=[0,0,0],n=[0,0,0],c=[0,0,0],inf=new Map();
     for(let k=0;k<3;k++){const i=ids[k],w=bary[k];for(let d=0;d<3;d++){p[d]+=a.position.array[i*3+d]*w;n[d]+=a.normal.array[i*3+d]*w;c[d]+=(a.color?a.color.array[i*3+d]:1)*w;}for(let d=0;d<4;d++){const j=a.skinIndex.array[i*4+d];inf.set(j,(inf.get(j)||0)+a.skinWeight.array[i*4+d]*w);}}
     const pairs=[...inf].sort((a,b)=>b[1]-a[1]).slice(0,4),total=pairs.reduce((s,p)=>s+p[1],0)||1;while(pairs.length<4)pairs.push([0,0]);pos.push(...p);normal.push(...n);color.push(...c);joints.push(...pairs.map(p=>p[0]));weights.push(...pairs.map(p=>p[1]/total));baryMeta.push({ids,bary});
   }for(let i=1;i<poly.length-1;i++)index.push(start,start+i,start+i+1);
 }
 if(pos.length){const geo=new THREE.BufferGeometry();for(const [name,data,size]of [['position',pos,3],['normal',normal,3],['color',color,3],['skinWeight',weights,4]])geo.setAttribute(name,new THREE.Float32BufferAttribute(data,size));geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(joints,4));geo.setIndex(index);geo.userData.art31Owned=true;
   const patch=new THREE.SkinnedMesh(geo,body.material);patch.name='skin_openings32';patch.userData.coverage32=baryMeta;patch.bind(body.skeleton,body.bindMatrix);patch.castShadow=patch.receiveShadow=true;group.add(patch);
 }
 g.userData.coverage=coarse;g.userData.maskedBodyTriangles=topology.masked;return true;
}

// Clean part contours use a smooth cage rather than sampling the inherited
// fused armpit/hip surface. The legacy body remains the binding reference for
// older outfits; its upper-body surfaces are retired from the visible avatar.
function cage32(source,shape){
 const geo=new THREE.BufferGeometry();geo.attributes=Object.assign({},source.attributes);geo.index=source.index;geo.groups=source.groups.map(g=>Object.assign({},g));
 const p=source.attributes.position.clone(),kind=source.attributes._cage32.getX(0),a=!!shape.m_base_a||(!shape.m_base_b&&shape.earring!==false),full=shape.m_fuller?1:shape.m_slim?-1:0;
 for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   if(kind===1){const arm=art31Smooth(.17,.24,Math.abs(x)),width=(a?.91:1)*(1+full*.045);x*=width*(1-arm)+(a?.96:1)*(1+full*.04)*arm;z*=1+full*.055;if(a&&z>0)z+=.012*art31G(y,1.33,.085)*art31G(x,0,.17);}
   else if(kind===2){const leg=1-art31Smooth(.86,.94,y),cx=Math.sign(x)*.091,k=1+full*.045;x=(x*(a?1.025:1))*(1-leg)+(cx+(x-cx)*k)*leg;z*=1+full*.045;}
   else{const cx=Math.sign(x)*.097;x=cx+(x-cx)*(a?.98:1);}
   p.setXYZ(i,x,y,z);
 }
 geo.setAttribute('position',p);geo.deleteAttribute('normal');geo.computeVertexNormals();geo.computeBoundingSphere();geo.userData.art31Owned=true;return geo;
}
function body32Skin(g,look){
 const body=g.hero.body,group=body.parent,parts=group.children.filter(o=>o.userData.targetNames);
 for(const part of parts)if(['head','torso','armL','armR'].includes(part.userData.region))part.visible=false;
 group.traverse(o=>{if(o.name==='neck_join31')o.visible=false;});
 const a=look.bodyBase==='base_a'||(!look.bodyBase&&RESIDENT_SHAPES[g.userData.residentShape]?.earring!==false),full=look.bodyBuild==='fuller'?1:look.bodyBuild==='slim'?-1:0,k=1+full*.05;
 const skin=new THREE.MeshStandardMaterial({name:'skin_contour32',color:look.skin||SKINS[4],roughness:.72,envMapIntensity:.60});
 const material=!LOOK.pbr?new THREE.MeshLambertMaterial({name:skin.name,color:skin.color}):skin;
 const attach=(P,F,J,W,name)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(J,4));geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(W,4));geo.setIndex(F);geo.computeVertexNormals();geo.userData.art31Owned=true;const mesh=new THREE.SkinnedMesh(geo,material);mesh.name=name;mesh.bind(body.skeleton,body.bindMatrix);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;};
 const P=[],F=[],J=[],W=[],cols=64,rows=48;
 const profiles=[[.92,a?.171:.158,.101,.108],[1.0,a?.175:.16,.098,.11],[1.08,a?.124:.14,.086,.088],[1.17,a?.126:.146,.087,.085],[1.30,a?.149:.177,.094,.09],[1.40,a?.160:.18,.091,.082],[1.46,a?.13:.15,.065,.065],[1.50,a?.049:.055,.047,.05]];
 const section=y=>{let j=0;for(let i=0;i<profiles.length-1;i++)if(y>=profiles[i][0])j=i;const p=profiles[j],q=profiles[j+1],t=art31Smooth(p[0],q[0],y);return p.slice(1).map((v,i)=>(v+(q[i+1]-v)*t)*k);};
 for(let r=0;r<=rows;r++){
   const y=.92+r/rows*.58,[rx,front,back]=section(y),ys=[.96,1.05,1.17,1.30];let j=0;for(let i=0;i<3;i++)if(y>=ys[i])j=i;const t=art31Smooth(ys[j],ys[j+1],y);
   for(let c=0;c<cols;c++){const theta=c/cols*Math.PI*2,x=rx*Math.sin(theta);let z=(Math.cos(theta)>0?front:back)*Math.cos(theta);if(a&&z>0)z+=.020*art31G(y,1.335,.085)*art31G(Math.abs(x),.060,.065);P.push(x,y,z);J.push(j,j+1,0,0);W.push(1-t,t,0,0);if(r){const b=r*cols+c,next=r*cols+(c+1)%cols;F.push(b-cols,next,b,b-cols,next-cols,next);}}
 }
 attach(P,F,J,W,'skin_torso32');
 const long=['office','track','lounge','kaftan'].includes(look.outfit),tank=look.outfit==='tankset',limit=tank?1.497:long?1.008:1.295;
 for(const sign of [-1,1]){
   const p=[],f=[],j=[],w=[],cols=40,rows=36;
   for(let r=0;r<=rows;r++){
     const y=.906+(limit-.906)*r/rows,upper=y>1.172,root=upper?[sign*.185,1.452,-.006]:[sign*.233,1.172,-.014],end=upper?[sign*.233,1.172,-.014]:[sign*.275,.915,0],t=Math.max(0,Math.min(1,(y-root[1])/(end[1]-root[1]))),cx=root[0]+(end[0]-root[0])*t,cz=root[2]+(end[2]-root[2])*t;
     let radius=(upper?((a?.042:.050)*(1-t)+(a?.029:.033)*t):((a?.031:.036)*(1-t)+(a?.021:.024)*t))*k;
     if(tank&&y>1.45)radius*=Math.sqrt(Math.max(.01,1-((y-1.45)/.05)**2));
     const fore=1-art31Smooth(1.14,1.205,y),bone=sign>0?8:13;
     for(let c=0;c<cols;c++){const theta=c/cols*Math.PI*2;p.push(cx+Math.sin(theta)*radius,y,cz+Math.cos(theta)*radius);j.push(bone,bone+1,0,0);w.push(1-fore,fore,0,0);if(r){const b=r*cols+c,next=r*cols+(c+1)%cols;f.push(b-cols,next,b,b-cols,next-cols,next);}}
   }attach(p,f,j,w,sign>0?'skin_armL32':'skin_armR32');
 }
}

const VIS32={headScale:1.24,headDrop:.020,neck:new Map(),shadowTexture:null,shadowGeometry:null};
function neck32Geometry(source){
 if(VIS32.neck.has(source))return VIS32.neck.get(source);
 const geo=source.clone(),p=geo.attributes.position;
 // The face, eyes and hair share a single scale. Ease the lower neck back into
 // the unchanged rig so the clavicle seam does not pull apart in animation.
 for(let i=0;i<p.count;i++){
   const y=p.getY(i)+1.57,b=art31Smooth(1.502,1.566,y),s=1+(VIS32.headScale-1)*b;
   const desiredY=y+(VIS32.headScale-1)*(y-1.57)*b-VIS32.headDrop*b;
   p.setXYZ(i,p.getX(i)*s/VIS32.headScale,(desiredY-1.57+VIS32.headDrop)/VIS32.headScale,p.getZ(i)*s/VIS32.headScale);
 }
 geo.computeVertexNormals();geo.computeBoundingSphere();geo.userData={shared31:true};VIS32.neck.set(source,geo);return geo;
}
function shadow32Texture(){
 if(VIS32.shadowTexture)return VIS32.shadowTexture;
 const n=64,data=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const r=Math.hypot((x+.5)/n*2-1,(y+.5)/n*2-1),k=(y*n+x)*4;data[k]=data[k+1]=data[k+2]=255;data[k+3]=Math.round(255*Math.max(0,1-r*r)**3);}
 const t=new THREE.DataTexture(data,n,n,THREE.RGBAFormat);t.minFilter=t.magFilter=THREE.LinearFilter;t.needsUpdate=true;t.encoding=THREE.sRGBEncoding;VIS32.shadowTexture=t;return t;
}
function shadow32Geometry(){
 if(VIS32.shadowGeometry)return VIS32.shadowGeometry;
 const p=[],uv=[],idx=[];
 for(const [x,z,w,d]of [[0,.025,.74,.48],[-.10,.065,.24,.32],[.10,.065,.24,.32]]){
   const j=p.length/3;p.push(x-w/2,0,z-d/2,x+w/2,0,z-d/2,x+w/2,0,z+d/2,x-w/2,0,z+d/2);uv.push(0,0,1,0,1,1,0,1);idx.push(j,j+2,j+1,j,j+3,j+2);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();VIS32.shadowGeometry=g;return g;
}
function ground32(g){
 const mat=new THREE.MeshBasicMaterial({name:'contact32',color:'#443D30',map:shadow32Texture(),transparent:true,opacity:.19,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const shadow=new THREE.Mesh(shadow32Geometry(),mat);shadow.name='contact32';shadow.castShadow=false;shadow.receiveShadow=false;shadow.renderOrder=2;g.add(shadow);g.userData.contact32=shadow;updateGround32(g);
}
function updateGround32(g){const s=g.userData.contact32;if(!s)return;const scale=g.scale.y||1;s.position.y=((g.baseY||0)-g.position.y+.035)/scale;s.visible=!g.sitting;}
const make32Hero=makeHeroAvatar;
makeHeroAvatar=function(look){
 const g=make32Hero(look);if(!g?.hero)return g;
 const head=g.hero.bones.head,surface=head.getObjectByName('head31_surface');if(surface)surface.geometry=neck32Geometry(surface.geometry);
 const assembly=new THREE.Group();assembly.name='silhouette32';assembly.scale.setScalar(VIS32.headScale);assembly.position.y=-VIS32.headDrop;
 for(const child of head.children.slice())if(!child.isBone)assembly.add(child);head.add(assembly);
 g.userData.silhouette32={headScale:VIS32.headScale};body32Skin(g,look);ground32(g);return g;
};
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
const preview32=creator30Preview;
creator30Preview=function(now,dt){preview32(now,dt);if(!prevChar)return;const scale=prevChar.scale.y||1;
 if(CREATOR30.zoom==='face'){prevCam.position.set(0,1.685*scale,.81);prevCam.lookAt(0,1.675*scale,0);}else{prevCam.position.set(0,1.30,4.05);prevCam.lookAt(0,.94,0);}
};
// Studio and thumbnail use the same stage and the same new head framing.
thumbRender=function(look,kind){if(!thumbInit())return null;studio31(THUMB.scene);const g=makeAvatar(look);if(!g)return null;const head=['hair','headwear','face','beard'].includes(kind),scale=g.scale.y||1;
 g.rotation.y=-.24;THUMB.scene.add(g);if(head){THUMB.cam.position.set(.09,1.685*scale,.81);THUMB.cam.lookAt(0,1.675*scale,0);}else{THUMB.cam.position.set(0,1.30,4.05);THUMB.cam.lookAt(0,.94,0);}
 try{animAvatar(g,.4,false,false,0,.016);THUMB.r.render(THUMB.scene,THUMB.cam);return THUMB.r.domElement.toDataURL('image/png');}finally{THUMB.scene.remove(g);disposeAvatar31(g);}
};

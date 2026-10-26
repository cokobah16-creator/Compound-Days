/* Compound Days v31: a newly authored head, tailored material detail and softer anatomy. */
'use strict';
const ART31={heads:new Map(),eyes:new Map(),materials:new Map(),cuts:new Map(),lite:new WeakMap()};
function art31Smooth(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
function art31G(x,c,w){return Math.exp(-(((x-c)/w)**2));}
const HEAD31_PROFILE=[
 [1.49,.043,.044,.043,-.003],[1.53,.044,.047,.047,-.005],
 [1.55,.047,.058,.051,-.007],[1.575,.061,.071,.063,-.010],
 [1.61,.076,.083,.081,-.012],[1.65,.088,.091,.092,-.012],
 [1.69,.091,.096,.096,-.014],[1.73,.087,.092,.096,-.015],
 [1.765,.074,.078,.082,-.016],[1.79,.045,.050,.052,-.016],
 [1.805,.003,.004,.004,-.016]
];
function head31Profile(y){
 let index=0;for(let i=0;i<HEAD31_PROFILE.length-1;i++)if(y>=HEAD31_PROFILE[i][0])index=i;
 const a=HEAD31_PROFILE[index],b=HEAD31_PROFILE[index+1],prev=HEAD31_PROFILE[Math.max(0,index-1)],next=HEAD31_PROFILE[Math.min(HEAD31_PROFILE.length-1,index+2)];
 const span=b[0]-a[0],t=Math.max(0,Math.min(1,(y-a[0])/span)),t2=t*t,t3=t2*t;
 const out=a.slice(1).map((v,i)=>{const j=i+1,m0=(b[j]-prev[j])/(b[0]-prev[0]),m1=(next[j]-a[j])/(next[0]-a[0]);return (2*t3-3*t2+1)*v+(t3-2*t2+t)*span*m0+(-2*t3+3*t2)*b[j]+(t3-t2)*span*m1;});
 if(y>1.754){const k=art31Smooth(1.754,1.771,y),r=Math.sqrt(Math.max(0,1-((y-1.712)/.093)**2));for(let j=0;j<3;j++)out[j]=out[j]*(1-k)+Math.max(.0015,[.088,.094,.097][j]*r)*k;}
 return out;
}
function head31Spec(look){
 const shape=RESIDENT_SHAPES[look.shape]||{},b=look.bodyBase==='base_b'||(!look.bodyBase&&shape.earring===false),face=look.face||'oval';
 return {b,face,width:b?1.015:.975,jaw:(b?1.08:.97)*(face==='angular'?1.055:face==='soft'?1.035:1)*(1+(shape.jaw||0)*.22),
   cheek:face==='soft'?.0028:face==='angular'?-.0008:.0008,nose:(b?1.08:.95)*(1+(shape.nose||0)*.16),
   lip:b?.029:.028,eyes:1+(shape.eyes||0)*.12,age:shape.grey||0};
}
function head31Width(y,s){const p=head31Profile(y),neck=s.b?.055:.049,w=art31Smooth(1.50,1.558,y),width=neck*(1-w)+p[0]*w;return width*s.width*(1+(s.jaw-1)*art31G(y,1.59,.039));}
function head31Eye(s,side){return {x:side*.415*head31Width(1.679,s),y:1.679,z:.066,rx:.0254*s.width,ry:.018,rz:.019};}
function head31Surface(x,y,s){
 const p=head31Profile(y),width=head31Width(y,s),u=Math.min(.99999,Math.abs(x)/width);
 const neckBlend=art31Smooth(1.50,1.558,y),frontDepth=(s.b?.051:.047)*(1-neckBlend)+p[1]*neckBlend;
 let z=p[3]+frontDepth*Math.sqrt(1-u*u);
 // Broad facial planes, a soft nasal bridge and alae, and a continuous muzzle.
 z+=.006*art31G(Math.abs(x),.052,.027)*art31G(y,1.651,.028);
 z+=s.cheek*art31G(Math.abs(x),.050,.029)*art31G(y,1.637,.026);
 z+=.010*s.nose*art31G(x,0,.010)*art31G(y,1.673,.033);
 z+=.023*s.nose*art31G(x,0,.0135)*art31G(y,1.649,.0115);
 z+=.008*s.nose*art31G(Math.abs(x),.014,.008)*art31G(y,1.645,.008);
 z+=.006*art31G(x,0,.033)*art31G(y,1.616,.019);
 z+=.004*art31G(x,0,.025)*art31G(y,1.573,.019);
 for(const side of [-1,1]){
   const e=head31Eye(s,side),dx=(x-e.x)/e.rx,dy=(y-e.y)/e.ry;
   const q=dx*dx+dy*dy;
   const sphere=e.z+e.rz*Math.sqrt(Math.max(0,1-Math.min(.97,q)));
   const w=art31G(Math.sqrt(q),.70,.46)*.35;
   z=z*(1-w)+(sphere+.0012)*w;
   z+=.0016*art31G(x,e.x,.027)*art31G(y,1.701,.008);
 }
 const t=x/s.lip,fade=Math.max(0,1-t*t),line=1.614+.003*t*t;
 const cupid=.0035+.002*art31G(Math.abs(t),.33,.22)-.0012*art31G(t,0,.17);
 if(Math.abs(t)<1){z+=.0035*fade*art31G(y,line+cupid*.45,.004);z+=.0055*fade*art31G(y,line-.0037,.0043);}
 return z;
}
function head31Geometry(s){
 const key=JSON.stringify(s);if(ART31.heads.has(key))return ART31.heads.get(key);
 const p=[],c=[],indices=HEAD31_DATA.indices.slice();
 for(const [u,v,side] of HEAD31_DATA.params){
   const y=1.49+Math.min(1,v)*.315,profile=head31Profile(y),x=u*head31Width(y,s);
   const neckBlend=art31Smooth(1.50,1.558,y),backDepth=(s.b?.051:.047)*(1-neckBlend)+profile[2]*neckBlend;
   const z=side>0?head31Surface(x,y,s):side<0?profile[3]-backDepth*Math.sqrt(Math.max(0,1-u*u)):profile[3];
   p.push(x,y-SCULPT29.joints.Head[1],z-SCULPT29.joints.Head[2]);
   let r=1,g=1,b=1;
   const warm=side>0?art31G(Math.abs(x),.052,.03)*art31G(y,1.641,.025):0;g-=warm*.045;b-=warm*.065;
   const jaw=art31G(y,1.537,.017)*art31G(x,0,.05);r-=jaw*.07;g-=jaw*.09;b-=jaw*.095;
   for(const sign of [-1,1]){const e=head31Eye(s,sign),under=art31G(x,e.x,.026)*art31G(y,1.666,.012);r-=under*.035;g-=under*.060;b-=under*.07;}
   c.push(r,g,b);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));geo.setIndex(indices);geo.computeVertexNormals();
 // Delaunay front faces face +Z; the back strip faces -Z.
 let front=0,count=0;const P=geo.attributes.position,N=geo.attributes.normal;
 for(let i=0;i<P.count;i++)if(P.getZ(i)>.05&&P.getY(i)>.08){front+=N.getZ(i);count++;}
 if(front<0){for(let i=0;i<indices.length;i+=3)[indices[i],indices[i+1]]=[indices[i+1],indices[i]];geo.setIndex(indices);geo.computeVertexNormals();}
 geo.computeBoundingSphere();geo.userData.shared31=true;ART31.heads.set(key,geo);return geo;
}
function head31Mesh(geo,mat,parent,name){if(!geo.userData.shared31)geo.userData.art31Owned=true;
 if(!LOOK.pbr&&mat.isMeshStandardMaterial){let light=ART31.lite.get(mat);if(!light){light=new THREE.MeshLambertMaterial({name:mat.name,color:mat.color,vertexColors:mat.vertexColors,side:mat.side,map:mat.map,transparent:mat.transparent,opacity:mat.opacity});ART31.lite.set(mat,light);}mat=light;}
 const m=new THREE.Mesh(geo,mat);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function head31EyeGeo(e,radius){
 const p=[],col=[],ids=[],rings=8,cols=48;
 for(let r=0;r<=rings;r++)for(let i=0;i<=cols;i++){
   const a=i/cols*Math.PI*2,rr=radius*r/rings,x=Math.cos(a)*rr,y=Math.sin(a)*rr;
   const z=e.rz*Math.sqrt(Math.max(0,1-(x/e.rx)**2-(y/e.ry)**2))+.00025;
   p.push(x,y,z);
   const streak=.90+.10*Math.sin(a*27+Math.sin(a*7)*1.5),edge=art31Smooth(.72,1,r/rings),inner=1-art31Smooth(.27,.47,r/rings);
   const dark=1-.70*edge-.35*inner;col.push(streak*dark,streak*dark,streak*dark);
   if(r&&i){const k=r*(cols+1)+i;ids.push(k,k-cols-1,k-1,k-1,k-cols-1,k-cols-2);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(ids);g.computeVertexNormals();return g;
}
function head31White(e,s,side){
 const p=[],idx=[],columns=48,rows=16;
 for(let r=0;r<=rows;r++)for(let i=0;i<=columns;i++){
   const t=i/columns*2-1,arc=Math.max(0,1-t*t)**.68,mid=e.y+side*t*.006*.315;
   const top=mid+.034*.315*arc,bottom=mid-.023*.315*arc,y=bottom+(top-bottom)*r/rows;
   const x=(side*.415+t*.245)*head31Width(y,s),dx=(x-e.x)/e.rx,dy=(y-e.y)/e.ry;
   const z=e.z+e.rz*Math.sqrt(Math.max(0,1-Math.min(.999,dx*dx+dy*dy)));
   const edge=art31Smooth(.68,1,Math.max(Math.abs(t),Math.abs(r/rows*2-1)));
   const zz=z*(1-edge)+(head31Surface(x,y,s)-.0003)*edge;
   p.push(x-e.x,y-e.y,zz-e.z);
   if(r&&i){const k=r*(columns+1)+i;idx.push(k,k-columns-1,k-1,k-1,k-columns-1,k-columns-2);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
function head31Lid(e,s,side,upper,material,parent){
 const p=[],idx=[],cols=40;
 for(let row=0;row<3;row++)for(let i=0;i<=cols;i++){p.push(0,0,0);if(row&&i){const k=row*(cols+1)+i;idx.push(k,k-cols-1,k-1,k-1,k-cols-1,k-cols-2);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);
 const mesh=head31Mesh(geo,material,parent,(upper?'upper':'lower')+'_lid31');mesh.castShadow=false;mesh.frustumCulled=false;
 return {mesh,upper,side,e,s,cols};
}
function head31LidUpdate(lid,blink){
 const {mesh,upper,side,e,s,cols}=lid,P=mesh.geometry.attributes.position;
 for(let row=0;row<3;row++)for(let i=0;i<=cols;i++){
   const t=i/cols*2-1,arc=Math.max(0,1-t*t)**.68,x=(side*.415+t*.245)*head31Width(e.y,s),mid=e.y+side*t*.006*.315;
   const top=mid+.034*.315*arc,bottom=mid-.023*.315*arc;
   const edge=upper?top+.0008:bottom-.0006;
   const moving=upper?top-(top-bottom)*blink*.87:bottom+(top-bottom)*blink*.16;
   const y=edge+(moving-edge)*row/2;
   const dx=(x-e.x)/e.rx,dy=(y-e.y)/e.ry;
   const z=Math.max(head31Surface(x,y,s)+.0006,e.z+e.rz*Math.sqrt(Math.max(0,1-Math.min(.99,dx*dx+dy*dy)))+.001);
   P.setXYZ(row*(cols+1)+i,x,y-1.57,z-.012);
 }
 P.needsUpdate=true;mesh.geometry.computeVertexNormals();
}
function head31Ribbon(parent,mat,s,yfn,width,halfWidth,name,zoffset=.0008){
 const p=[],idx=[],cols=48;
 for(let i=0;i<=cols;i++){const t=i/cols*2-1,x=t*width,y=yfn(t),w=halfWidth*Math.max(.05,1-t*t)**.6;
   for(const yy of [y-w,y+w])p.push(x,yy-1.57,head31Surface(x,yy,s)-.012+zoffset);
   if(i){const k=i*2;idx.push(k-2,k-1,k,k-1,k+1,k);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();return head31Mesh(geo,mat,parent,name);
}
function head31Attach(g,look){
 const head=g.hero?.bones.head;if(!head)return;const spec=head31Spec(Object.assign({},look,{shape:g.userData.residentShape})),skin=new THREE.Color(look.skin||SKINS[4]);
 // Retire the inherited head and its detached facial surfaces. The torso and rig remain live.
 neck31Retire(g);
 const retired=[];for(const o of head.children)if(o.isMesh&&!/^wearhair_|^wear_|^glasses_/.test(o.name)){o.visible=false;retired.push(o);}
 for(const o of head.children)if(/^glasses_/.test(o.name))o.position.y+=.010;
 const group=new THREE.Group();group.name='authored_head31';head.add(group);
 const material=new THREE.MeshStandardMaterial({name:'skin31',color:skin,roughness:.70,metalness:0,vertexColors:true,envMapIntensity:.65,side:THREE.DoubleSide});
 head31Mesh(head31Geometry(spec),material,group,'head31_surface');
 const skinPlain=material.clone();skinPlain.vertexColors=false;
 const brow=new THREE.MeshStandardMaterial({name:'brows31',color:'#211914',roughness:.93,side:THREE.DoubleSide});
 const lipsUpper=new THREE.MeshStandardMaterial({name:'lip31_upper',color:skin.clone().multiply(new THREE.Color(.70,.46,.46)),roughness:.66,side:THREE.DoubleSide});
 const lipsLower=new THREE.MeshStandardMaterial({name:'lip31_lower',color:skin.clone().multiply(new THREE.Color(.90,.61,.58)),roughness:.54,side:THREE.DoubleSide});
 const crease=new THREE.MeshStandardMaterial({name:'mouth31_crease',color:skin.clone().multiply(new THREE.Color(.23,.12,.11)),roughness:.86,side:THREE.DoubleSide});
 head31Ribbon(group,lipsUpper,spec,t=>1.6155+.003*t*t+.0012*art31G(Math.abs(t),.32,.22),spec.lip,.0025,'upper_lip31');
 head31Ribbon(group,lipsLower,spec,t=>1.611+.003*t*t,spec.lip,.0031,'lower_lip31');
 head31Ribbon(group,crease,spec,t=>1.614+.003*t*t,spec.lip,.00045,'mouth31',.0012);
 const eyes=[],lids=[];
 for(const side of [-1,1]){
   const e=head31Eye(spec,side),eye=new THREE.Group();eye.name='eye31_'+side;eye.position.set(e.x,e.y-1.57,e.z-.012);group.add(eye);
   const white=new THREE.MeshStandardMaterial({name:'sclera31',color:'#DDD6C5',roughness:.26,envMapIntensity:.8});
   white.side=THREE.DoubleSide;head31Mesh(head31White(e,spec,side),white,eye,'eye31_white');
   const gaze=new THREE.Group();eye.add(gaze);
   const irisMat=new THREE.MeshStandardMaterial({name:'iris31',color:'#775034',roughness:.38,vertexColors:true,side:THREE.DoubleSide});
   head31Mesh(head31EyeGeo(e,.0085),irisMat,gaze,'eye31_iris');
   const pupilMat=new THREE.MeshStandardMaterial({name:'pupil31',color:'#100E0C',roughness:.22,side:THREE.DoubleSide});
   head31Mesh(head31EyeGeo(e,.0039),pupilMat,gaze,'eye31_pupil');
   const glint=new THREE.MeshBasicMaterial({color:'#F9F3E2'}),dot=new THREE.SphereGeometry(.00125,10,8);dot.translate(-.0025,.0034,e.rz+.001);
   head31Mesh(dot,glint,gaze,'eye31_reflection').castShadow=false;
   eyes.push(gaze);lids.push(head31Lid(e,spec,side,true,skinPlain,group),head31Lid(e,spec,side,false,skinPlain,group));
   // A clean tapered brow follows the frontal plane without sitting in the eye socket.
   const ps=[],ids=[];for(let i=0;i<=32;i++){const t=i/32,x=side*(.015+t*.047)*spec.width,y=1.703+.005*Math.sin(t*Math.PI)-t*.006,w=.0029*Math.sin(Math.PI*(t*.90+.045));
     for(const yy of [y-w,y+w])ps.push(x,yy-1.57,head31Surface(x,yy,spec)-.012+.001);
     if(i){const k=i*2;ids.push(k-2,k-1,k,k-1,k+1,k);}}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));geo.setIndex(ids);geo.computeVertexNormals();head31Mesh(geo,brow,group,'brow31_'+side);
   // The helix, concha and lobe are one soft ear cup rather than a sphere on the skull.
   const ep=[],ec=[],ei=[],rings=7,cols=36;
   for(let r=0;r<=rings;r++)for(let i=0;i<=cols;i++){const a=i/cols*Math.PI*2,k=r/rings,bulge=.006*Math.sin(k*Math.PI)*Math.sin(k*Math.PI);
     ep.push(side*(.090*spec.width+.007*k+bulge*.4),1.660+Math.cos(a)*.024*k-1.57,-.008+Math.sin(a)*.014*k-.012);
     const shade=.74+.26*k;ec.push(shade,shade*.94,shade*.92);if(r&&i){const j=r*(cols+1)+i;ei.push(j,j-cols-1,j-1,j-1,j-cols-1,j-cols-2);}}
   const ear=new THREE.BufferGeometry();ear.setAttribute('position',new THREE.Float32BufferAttribute(ep,3));ear.setAttribute('color',new THREE.Float32BufferAttribute(ec,3));ear.setIndex(ei);ear.computeVertexNormals();head31Mesh(ear,material,group,'ear31_'+side);
   // Small nostril recesses are surface ribbons, kept in the authored nasal plane.
   const nostril=new THREE.SphereGeometry(1,16,10);nostril.scale(.0039,.0018,.00075);const nx=side*.012*spec.nose,ny=1.641;
   nostril.translate(nx,ny-1.57,head31Surface(nx,ny,spec)-.012+.0005);head31Mesh(nostril,crease,group,'nostril31_'+side);
 }
 g.userData.art31={spec,eyes,lids,retired};for(const l of lids)head31LidUpdate(l,0);
 if((look.acc||[]).includes('hoops')){const gold=new THREE.MeshStandardMaterial({name:'hoops31',color:'#C49A43',metalness:.85,roughness:.29});for(const side of [-1,1]){const geo=new THREE.TorusGeometry(.0095,.0015,8,28);geo.translate(side*.096,1.631-1.57,-.003-.012);head31Mesh(geo,gold,group,'hoop31_'+side);}}
 if(look.beard&&look.beard!=='none')head31Beard(group,spec,head);
}
function neck31Retire(g){
 const parts=[];g.traverse(o=>{if(o.isSkinnedMesh&&o.userData.targetNames)parts.push(o);});
 const shape=g.userData.residentShape||'base',outfit=(g.hero.wardrobe?.garments||[]).join('|');
 for(const mesh of parts){
   const key=shape+'|'+outfit+'|'+mesh.userData.region;let cut=ART31.cuts.get(key);
   if(!cut){const a=mesh.geometry.attributes,P=a.position,old=mesh.geometry.index.array,indices=[],pos=[],nrm=[],color=[],joints=[],weights=[],faces=[];
     const plane=1.502;
     for(let k=0;k<old.length;k+=3){const ids=[old[k],old[k+1],old[k+2]],ys=ids.map(i=>P.getY(i));
       if(Math.max(...ys)<=plane){indices.push(...ids);continue;}if(Math.min(...ys)>=plane)continue;
       const poly=[];
       for(let j=0;j<3;j++){const next=(j+1)%3,b0=[0,0,0],b1=[0,0,0];b0[j]=1;b1[next]=1;if(ys[j]<=plane)poly.push(b0);
         if((ys[j]<=plane)!==(ys[next]<=plane)){const t=(plane-ys[j])/(ys[next]-ys[j]);poly.push(b0.map((v,i)=>v*(1-t)+b1[i]*t));}}
       const start=pos.length/3;
       for(const bary of poly){const p=[0,0,0],n=[0,0,0],c=[0,0,0],inf=new Map();
         for(let v=0;v<3;v++){const id=ids[v],w=bary[v];for(let d=0;d<3;d++){p[d]+=a.position.array[id*3+d]*w;n[d]+=a.normal.array[id*3+d]*w;c[d]+=(a.color?a.color.array[id*3+d]:1)*w;}for(let d=0;d<4;d++){const j=a.skinIndex.array[id*4+d];inf.set(j,(inf.get(j)||0)+a.skinWeight.array[id*4+d]*w);}}
         const pairs=[...inf].sort((a,b)=>b[1]-a[1]).slice(0,4),total=pairs.reduce((s,p)=>s+p[1],0)||1;while(pairs.length<4)pairs.push([0,0]);pos.push(...p);nrm.push(...n);color.push(...c);joints.push(...pairs.map(p=>p[0]));weights.push(...pairs.map(p=>p[1]/total));}
       for(let v=1;v<poly.length-1;v++)faces.push(start,start+v,start+v+1);
     }
     let patch=null;if(pos.length){patch=new THREE.BufferGeometry();for(const [name,data,size]of [['position',pos,3],['normal',nrm,3],['color',color,3],['skinWeight',weights,4]])patch.setAttribute(name,new THREE.Float32BufferAttribute(data,size));patch.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(joints,4));patch.setIndex(faces);patch.userData.shared31=true;}
     const geometry=new THREE.BufferGeometry();geometry.attributes=Object.assign({},mesh.geometry.attributes);geometry.setIndex(indices);geometry.userData.shared31=true;
     cut={indices,patch,geometry};ART31.cuts.set(key,cut);
   }
   mesh.geometry=cut.geometry;mesh.visible=mesh.visible&&cut.indices.length>0;
   if(cut.patch){const skin=g.hero.body.material.color.clone(),mat=new THREE.MeshStandardMaterial({name:'neck_join31',color:skin,roughness:.70,vertexColors:true,side:THREE.DoubleSide});const patch=new THREE.SkinnedMesh(cut.patch,mat);patch.name='neck_join31';patch.bind(mesh.skeleton,mesh.bindMatrix);patch.castShadow=true;patch.receiveShadow=true;mesh.parent.add(patch);}
 }
}
function head31Beard(group,s,head){
 for(const o of head.children)if(o.name==='wearextra_beard_full')o.visible=false;
 const p=[],c=[],idx=[],cols=60,rows=18;
 for(let i=0;i<=cols;i++){
   const u=i/cols*2-1,top=1.600+.053*art31Smooth(.20,.95,Math.abs(u)),bottom=1.553+.032*Math.abs(u)**1.4;
   for(let r=0;r<=rows;r++){const y=bottom+(top-bottom)*r/rows,x=u*head31Width(y,s)*.95,z=head31Surface(x,y,s)+.0019;
     p.push(x,y-1.57,z-.012);const v=.80+.18*Math.sin(i*3.1+r*.7)**2;c.push(v,v,v);
     if(i&&r){const k=i*(rows+1)+r;idx.push(k,k-rows-1,k-1,k-1,k-rows-1,k-rows-2);}}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));geo.setIndex(idx);geo.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({name:'beard31',color:'#282018',roughness:.89,vertexColors:true,side:THREE.DoubleSide});head31Mesh(geo,mat,group,'beard31');
 head31Ribbon(group,mat,s,t=>1.629-.004*Math.abs(t),s.lip*.88,.0023,'moustache31',.0018);
}
const art31MakeHero=makeHeroAvatar;
makeHeroAvatar=function(look){const g=art31MakeHero(look);if(g)head31Attach(g,look);return g;};
const art31Presence=presenceUpdate;
presenceUpdate=function(g,dt,moving){art31Presence(g,dt,moving);const a=g?.userData.art31,s=g?.presence;if(!a||!s)return;
 for(const o of a.retired)o.visible=false;
 const cap=s.caps[0]||s.caps[1],blink=cap?Math.max(0,Math.min(1,1-cap.rotation.x/PRES_CAP_OPEN)):0;
 for(const e of a.eyes)e.rotation.set(-s.gazeY/.022,s.gazeX/.03,0);
 if(Math.abs((a.blink||0)-blink)>.001){for(const l of a.lids)head31LidUpdate(l,blink);a.blink=blink;}
};

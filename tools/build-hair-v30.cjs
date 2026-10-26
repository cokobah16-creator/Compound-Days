// Three compact hairstyles authored directly around the v29 skull, in Head space.
const fs=require('fs'),path=require('path');
const THREE=require('../public/play/assets/vendor/three-r128.min.js');
const outDir=path.join(__dirname,'../public/play/assets/wardrobe');
function cap(rx=.085,ry=.097,rz=.102){
 const p=[],idx=[],rows=14,cols=48;
 for(let r=0;r<=rows;r++)for(let j=0;j<=cols;j++){
  const theta=j/cols*Math.PI*2,limit=1.47-.39*Math.max(0,Math.cos(theta))+.14*Math.max(0,-Math.cos(theta));
  const phi=Math.max(.0001,r/rows)*limit;
  const k=1+.008*Math.sin(theta*17)*Math.sin(phi*31);
  p.push(rx*Math.sin(phi)*Math.sin(theta)*k,.13+ry*Math.cos(phi)*k,-.022+rz*Math.sin(phi)*Math.cos(theta)*k);
 }
 for(let r=0;r<rows;r++)for(let j=0;j<cols;j++){const a=r*(cols+1)+j,b=a+cols+1;idx.push(a,b,a+1,a+1,b,b+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();
 // Ensure all cap normals face outwards.
 const P=g.attributes.position,N=g.attributes.normal;let d=0;
 for(let i=0;i<P.count;i++)d+=P.getX(i)*N.getX(i)+(P.getY(i)-.13)*N.getY(i)+(P.getZ(i)+.022)*N.getZ(i);
 if(d<0){for(let i=0;i<idx.length;i+=3)[idx[i],idx[i+1]]=[idx[i+1],idx[i]];g.setIndex(idx);g.computeVertexNormals();}
 return g;
}
function tube(points,radius,segments=28,sides=6){return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),segments,radius,sides,false);}
function sphere(center,radius,width=8,height=5,scale=[1,1,1]){const g=new THREE.SphereGeometry(radius,width,height);g.scale(...scale);g.translate(...center);return g;}
function exportHair(name,geos,description){
 const P=[],N=[],C=[],I=[];let count=0;
 for(const [part,g] of geos.entries()){
  const p=g.attributes.position,n=g.attributes.normal;
  // Surface-net blending inflates the delivered skull beyond the parameter ellipsoid.
  // These measured clearances enclose the larger base without exposing scalp triangles.
  for(let i=0;i<p.count;i++){P.push(p.getX(i)*1.18,.13+(p.getY(i)-.13)*1.10,-.022+(p.getZ(i)+.022)*1.18);
   const normal=new THREE.Vector3(n.getX(i)/1.18,n.getY(i)/1.10,n.getZ(i)/1.18).normalize();N.push(normal.x,normal.y,normal.z);
   const variation=.78+.22*(.5+.5*Math.sin(part*2.399+i*.15));C.push(variation,variation,variation);}
  I.push(...Array.from(g.index.array,x=>x+count));count+=p.count;
 }
 const doc={asset:{version:'2.0',generator:'Compound Days v30 hair builder'},scene:0,scenes:[{nodes:[0]}],nodes:[{name,mesh:0,extras:{asset:name,kind:'hair',slots:['hair'],visualRevision:30,description}}],meshes:[],materials:[{name:'hair',doubleSided:true,pbrMetallicRoughness:{baseColorFactor:[.012,.009,.007,1],metallicFactor:0,roughnessFactor:.88}}],buffers:[],bufferViews:[],accessors:[]};
 const chunks=[];let offset=0;
 function accessor(array,width,type,component){const a=component===5125?new Uint32Array(array):new Float32Array(array);const buffer=Buffer.from(a.buffer);const view=doc.bufferViews.length;doc.bufferViews.push({buffer:0,byteOffset:offset,byteLength:buffer.length});chunks.push(buffer);offset+=buffer.length;const at={bufferView:view,componentType:component,type,count:array.length/width};if(type==='VEC3'){at.min=[Infinity,Infinity,Infinity];at.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<array.length;i++){at.min[i%3]=Math.min(at.min[i%3],array[i]);at.max[i%3]=Math.max(at.max[i%3],array[i]);}}doc.accessors.push(at);return doc.accessors.length-1;}
 const attributes={POSITION:accessor(P,3,'VEC3',5126),NORMAL:accessor(N,3,'VEC3',5126),COLOR_0:accessor(C,3,'VEC3',5126)};
 const indices=accessor(I,1,'SCALAR',5125);doc.meshes=[{name,primitives:[{attributes,indices,material:0}]}];
 const bytes=Buffer.concat(chunks);doc.buffers=[{byteLength:bytes.length,uri:'data:application/octet-stream;base64,'+bytes.toString('base64')}];
 const file=path.join(outDir,name+'.gltf.json');fs.writeFileSync(file,JSON.stringify(doc));return {name,triangles:I.length/3,bytes:fs.statSync(file).size};
}
const results=[];
results.push(exportHair('hair_lowtaper',[cap(.085,.096,.101)],'Close crop with a shaped hairline.'));
const curls=[cap(.086,.098,.103)];
// Evenly spaced clumps form a continuous short silhouette, without thousands of tiny curls.
for(let ring=0;ring<7;ring++){
 const phi=(ring+.35)/7*1.48,number=Math.max(5,Math.round(34*Math.sin(phi)));
 for(let j=0;j<number;j++){
  const theta=(j/number+ring*.032)*Math.PI*2;
  const limit=1.47-.39*Math.max(0,Math.cos(theta))+.14*Math.max(0,-Math.cos(theta));if(phi>limit)continue;
  const r=.0105*(.88+.16*Math.sin(j*2.399+ring));
  curls.push(sphere([.086*Math.sin(phi)*Math.sin(theta),.13+.100*Math.cos(phi),-.022+.103*Math.sin(phi)*Math.cos(theta)],r,7,5,[1,1.12,1]));
 }
}
results.push(exportHair('hair_curls',curls,'Short coils with a compact continuous silhouette.'));
const bun=[cap(.083,.094,.100)];
for(let k=-5;k<=5;k++){
 const x=k*.013,scale=Math.sqrt(1-(x/.084)**2),pts=[];
 for(let i=0;i<=24;i++){const t=1.10-i/24*2.64;pts.push(new THREE.Vector3(x,.13+.098*scale*Math.cos(t),-.022+.105*scale*Math.sin(t)));}
 bun.push(tube(pts,.0044,28,6));
}
bun.push(sphere([0,.145,-.142],.037,16,10,[1.12,1,.9]));
for(let band=0;band<6;band++){
 const points=[];for(let i=0;i<=32;i++){const t=i/32*Math.PI*2,r=.037;points.push(new THREE.Vector3(Math.cos(t)*r,.145+Math.sin(t)*r,-.142+.009*Math.sin(t*2+band)+(.5-band/5)*.042));}
 bun.push(tube(points,.0031,32,5));
}
results.push(exportHair('hair_braidbun',bun,'Scalp braids gathered into a low braided bun.'));
console.log(JSON.stringify(results,null,2));

// Fitted scalp surfaces and interwoven braids for the newly authored v31 head.
const fs=require('fs'),path=require('path'),{run,THREE}=require('../check/runtime-harness.cjs');
const spec=run('head31Spec({bodyBase:"base_b",face:"oval"})');
const profile=y=>run('head31Profile('+y+')');
const widths=y=>run('head31Width('+y+','+JSON.stringify(spec)+')');
const surface=(x,y)=>run('head31Surface('+x+','+y+','+JSON.stringify(spec)+')');
function shell(style){
 const P=[],C=[],I=[],rows=style==='braid'?12:style==='curls'?32:36,cols=style==='braid'?64:style==='curls'?80:112;
 for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
   const a=i/cols*Math.PI*2,t=j/rows,front=Math.max(0,Math.cos(a)),back=Math.max(0,-Math.cos(a));
   const line=1.692+.054*front-.040*back,y=1.806-(1.806-line)*t;
   const [w,f,b,cz]=profile(y),extra=style==='curls'?.009*(.4+.6*Math.sin(t*Math.PI*.8)):.0015;
   const yExtra=style==='curls'?.021*(1-t*.68):.001;
   const freq=style==='curls'?27:47,amp=style==='curls'?.0023:.00055;
   const ripple=amp*Math.sin(a*freq+Math.sin(t*75)*1.6)*Math.cos(t*127+a*3);
   const x=(w*1.025+extra)*Math.sin(a),z=cz+((Math.cos(a)>=0?f:b)*1.025+extra)*Math.cos(a);
   const n=new THREE.Vector3(Math.sin(a)*t,1-t,Math.cos(a)*t).normalize();
   P.push(x+n.x*ripple,y-1.57+yExtra+n.y*ripple,z-.012+n.z*ripple);
   const v=.80+.15*(.5+.5*Math.cos(a*freq+t*80));C.push(v,v,v);
   if(j&&i){const k=j*(cols+1)+i;I.push(k,k-cols-1,k-1,k-1,k-cols-1,k-cols-2);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeVertexNormals();
 // Orient using the crown outward normal.
 if(g.attributes.normal.getY(Math.floor(cols/4))<0){for(let i=0;i<I.length;i+=3)[I[i],I[i+1]]=[I[i+1],I[i]];g.setIndex(I);g.computeVertexNormals();}
 return g;
}
function exportHair(name,geos,description){
 const P=[],N=[],C=[],I=[];let count=0;
 for(const g of geos){const p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color;
   for(let i=0;i<p.count;i++){P.push(p.getX(i),p.getY(i),p.getZ(i));N.push(n.getX(i),n.getY(i),n.getZ(i));const v=.82+.12*Math.sin(i*.37)**2;C.push(c?c.getX(i):v,c?c.getY(i):v,c?c.getZ(i):v);}
   I.push(...Array.from(g.index.array,x=>x+count));count+=p.count;}
 const d={asset:{version:'2.0',generator:'Compound Days v31 hair authoring'},scene:0,scenes:[{nodes:[0]}],nodes:[{name,mesh:0,extras:{asset:name,kind:'hair',slots:['hair'],visualRevision:31,head31:true,description}}],meshes:[],materials:[{name:'hair',doubleSided:true,pbrMetallicRoughness:{baseColorFactor:[.019,.014,.011,1],metallicFactor:0,roughnessFactor:.82}}],buffers:[],bufferViews:[],accessors:[]},chunks=[];let offset=0;
 function accessor(data,width,type,component=5126){const a=component===5125?new Uint32Array(data):new Float32Array(data),b=Buffer.from(a.buffer),view=d.bufferViews.length;d.bufferViews.push({buffer:0,byteOffset:offset,byteLength:b.length});chunks.push(b);offset+=b.length;
 const out={bufferView:view,componentType:component,type,count:data.length/width};if(type==='VEC3'){out.min=[0,1,2].map(k=>data.filter((v,i)=>i%3===k).reduce((a,v)=>Math.min(a,v),Infinity));out.max=[0,1,2].map(k=>data.filter((v,i)=>i%3===k).reduce((a,v)=>Math.max(a,v),-Infinity));}d.accessors.push(out);return d.accessors.length-1;}
 const attributes={POSITION:accessor(P,3,'VEC3'),NORMAL:accessor(N,3,'VEC3'),COLOR_0:accessor(C,3,'VEC3')},indices=accessor(I,1,'SCALAR',5125);
 d.meshes=[{name,primitives:[{attributes,indices,material:0}]}];const bytes=Buffer.concat(chunks);d.buffers=[{byteLength:bytes.length,uri:'data:application/octet-stream;base64,'+bytes.toString('base64')}];
 fs.writeFileSync(path.join(__dirname,'../dist/assets/wardrobe',name+'.gltf.json'),JSON.stringify(d));return {name,triangles:I.length/3};
}
const coils=[shell('curls')];
for(let ring=0;ring<8;ring++){
 const t=(ring+.4)/8*.94,count=Math.max(4,Math.round(24*Math.sin(t*1.65)));
 for(let i=0;i<count;i++){
   const a=(i/count+ring*.041)*Math.PI*2,front=Math.max(0,Math.cos(a)),back=Math.max(0,-Math.cos(a)),line=1.692+.054*front-.040*back,y=1.806-(1.806-line)*t,p=profile(y),extra=.009*(.4+.6*Math.sin(t*Math.PI*.8));
   const geo=new THREE.SphereGeometry(.0041,6,4);geo.scale(1,.95,1);geo.translate((p[0]*1.025+extra)*Math.sin(a),y-1.57+.021*(1-t*.68),p[3]+((Math.cos(a)>=0?p[1]:p[2])*1.025+extra)*Math.cos(a)-.012);coils.push(geo);
 }
}
const result=[exportHair('hair_lowtaper',[shell('low')],'A close, tapered crop with a shaped temple and nape.'),exportHair('hair_curls',coils,'A compact natural coil silhouette, with small modeled coils over the continuous scalp surface.')];
const parts=[shell('braid')];
for(let k=-5;k<=5;k++){
 const x=k*.013;let top=1.804;while(widths(top)<Math.abs(x)+.002)top-=.0005;
 const points=[];
 for(let i=0;i<=40;i++){const t=i/40,y=(t<=.5?1.745:1.661)+(top-(t<=.5?1.745:1.661))*Math.sin(t*Math.PI),p=profile(y),width=widths(y);
   const z=t<=.5?surface(x,y):p[3]-p[2]*Math.sqrt(Math.max(0,1-(x/width)**2));points.push(new THREE.Vector3(x,y-1.57+.001,z-.012+(t<=.5?.001:-.001)));}
 const curve=new THREE.CatmullRomCurve3(points),steps=36,frames=curve.computeFrenetFrames(steps,false);
 for(let strand=0;strand<2;strand++){
   const twist=[];for(let j=0;j<=steps;j++){const a=j/steps*Math.PI*2*13+strand*Math.PI,p=curve.getPointAt(j/steps);p.addScaledVector(frames.normals[j],Math.cos(a)*.0017);p.addScaledVector(frames.binormals[j],Math.sin(a)*.0017);twist.push(p);}
   parts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(twist),36,.0019,4,false));}
}
const bun=new THREE.SphereGeometry(.032,20,12);bun.scale(1.13,1,.80);bun.translate(0,.124,-.139);parts.push(bun);
for(let band=0;band<4;band++){const points=[];for(let j=0;j<=36;j++){const a=j/36*Math.PI*2;points.push(new THREE.Vector3(.034*Math.cos(a),.124+.031*Math.sin(a),-.139+(band-1.5)*.009+.003*Math.sin(a*6)));}parts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),36,.0023,4,false));}
result.push(exportHair('hair_braidbun',parts,'Eleven interwoven scalp braids gathered in a low braided bun.'));
console.log(JSON.stringify(result,null,2));

/* Small authored world additions; reusable materials and bounded mesh counts. */
const LM34={};
function lifeMat34(c){if(!LM34[c])LM34[c]=LOOK.pbr?new THREE.MeshStandardMaterial({color:c,roughness:.88}):new THREE.MeshLambertMaterial({color:c});return LM34[c];}
function mesh34(g,geo,c,x,y,z){const m=new THREE.Mesh(geo,lifeMat34(c));geo.userData.life34=true;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function box34(g,w,h,d,c,x,y,z){return mesh34(g,new THREE.BoxGeometry(w,h,d),c,x,y,z);}
function rod34(g,a,b,r,c){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);const m=mesh34(g,new THREE.CylinderGeometry(r,r,delta.length(),8),c,...av.add(bv).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}
function disposeLife34(g){if(!g)return;g.parent?.remove(g);g.traverse(o=>{if(o.geometry?.userData.life34)o.geometry.dispose();if(o.userData.lifeSprite){o.material.map?.dispose();o.material.dispose();}});}
function leaf34(g,x,y,z,s,angle){const m=mesh34(g,new THREE.SphereGeometry(1,8,5),'#60895A',x,y,z);m.scale.set(s,.018,s*.4);m.rotation.z=angle;m.rotation.y=angle*.7;return m;}
function buildLifeWorld34(){
 disposeLife34(LIFE34.world);LIFE34.world=new THREE.Group();LIFE34.world.name='palm_court_finds34';const g=LIFE34.world;g.position.set(20.8,0,6.1);
 // A striped cloth canopy, timber trestle and a few things worth taking home.
 box34(g,2.7,.12,1,'#9B7354',0,.82,0);[-1.1,1.1].forEach(x=>{box34(g,.09,.8,.09,'#6B5945',x,.4,.3);box34(g,.09,2.2,.09,'#6B5945',x,1.1,-.34);});
 for(let i=0;i<10;i++){const aw=box34(g,.28,.07,1.35,i%2?'#D5DFBE':'#6C8E6C',-1.26+i*.28,2.25,-.06);aw.rotation.x=.12;box34(g,.28,.20,.05,i%2?'#D5DFBE':'#6C8E6C',-1.26+i*.28,2.08,.61);}
 const lamp=buildFurn('lamp',1,1);lamp.scale.setScalar(.55);lamp.position.set(-.8,.9,0);g.add(lamp);
 const frame=buildFurn('art',1,1);frame.scale.setScalar(.6);frame.position.set(.35,.2,0);g.add(frame);
 const cup=mesh34(g,new THREE.CylinderGeometry(.16,.12,.24,12),'#B97E5E',.85,.99,.05);leaf34(g,.85,1.25,.05,.25,.4);leaf34(g,1.0,1.34,.05,.22,-.5);
 const label=textSprite('Palm Court Finds',{w:2.2,bg:'#F3EBDD',fg:'#365944',size:34});label.userData.lifeSprite=true;label.position.set(0,1.65,.43);g.add(label);scene.add(g);
 const existing=OBS.find(o=>o.tag==='finds34');if(!existing)addObs(19.4,22.2,5.55,6.65,'finds34');
 refreshGarden34();refreshShore34();refreshMarker34();
}
function refreshGarden34(){if(!scene||!S)return;disposeLife34(LIFE34.garden);const g=new THREE.Group();g.name='veranda_peppers34';g.position.set(-5.6,.06,6.63);LIFE34.garden=g;scene.add(g);const c=life34().crop;
 mesh34(g,new THREE.CylinderGeometry(.28,.21,.36,14),'#B67858',0,.18,0);mesh34(g,new THREE.TorusGeometry(.275,.035,6,16),'#CF9771',0,.37,0).rotation.x=Math.PI/2;
 mesh34(g,new THREE.CylinderGeometry(.245,.245,.018,14),c.wateredDay===S.day?'#544635':'#74604A',0,.365,0);
 if(c.stage){const h=.22+c.stage*.14;rod34(g,[0,.37,0],[0,.37+h,0],.018,'#577850');for(let k=0;k<3+c.stage;k++){const sign=k%2?1:-1,y=.48+k*.065;rod34(g,[0,y,0],[sign*.15,y+.035,.02],.01,'#577850');leaf34(g,sign*.17,y+.04,.02,.15+c.stage*.025,sign*.4);}
 if(c.stage===3)for(let k=0;k<3;k++){const p=mesh34(g,new THREE.SphereGeometry(.08,8,6),'#C75B3D',(k-1)*.15,.64+(k%2)*.12,.10);p.scale.y=1.3;}}
 // A tiny plant label in the soil, not another floating interface.
 box34(g,.025,.21,.025,'#9B8464',.17,.46,-.05);box34(g,.15,.085,.025,'#E6DABB',.17,.58,-.05);
}
function refreshShore34(){if(!scene||!S)return;disposeLife34(LIFE34.shore);const g=new THREE.Group();g.name='shore_shells34';LIFE34.shore=g;scene.add(g);
 SHELLS34.forEach(([x,z],i)=>{if(life34().shellDays[i]===S.day)return;const sh=mesh34(g,new THREE.SphereGeometry(.13,10,6),'#E5C4A2',x,.09,z);sh.scale.set(1,.35,.8);for(let k=0;k<4;k++)rod34(g,[x-.08+k*.05,.123,z-.04],[x-.04+k*.025,.13,z+.07],.006,'#BC9777');});
}
function refreshMarker34(){disposeLife34(LIFE34.marker);LIFE34.marker=null;const w=LIFE34.waypoint;if(!w||!scene)return;const g=new THREE.Group();g.name='destination34';g.position.set(w.x,.07,w.z);const ring=mesh34(g,new THREE.TorusGeometry(.6,.035,5,28),'#D8B65E',0,0,0);ring.rotation.x=Math.PI/2;const tip=mesh34(g,new THREE.ConeGeometry(.13,.23,8),'#D8B65E',0,.55,0);tip.rotation.z=Math.PI;g.userData.tip=tip;scene.add(g);LIFE34.marker=g;}
function clearFishing34(){disposeLife34(LIFE34.fishingWorld);LIFE34.fishingWorld=null;}
function buildFishing34(){clearFishing34();const f=LIFE34.fish,p=players[f.i];if(!p)return;const g=new THREE.Group();g.name='fishing_float34';scene.add(g);LIFE34.fishingWorld=g;
 const x=p.g.position.x,z=p.g.position.z;rod34(g,[x+.25,1,z+.15],[x+.4,2.1,z+1.2],.017,'#68573D');rod34(g,[x+.4,2.1,z+1.2],[12.7,.08,16.3],.003,'#DED9BD');
 const bob=mesh34(g,new THREE.SphereGeometry(.075,8,6),'#C95F46',12.7,.12,16.3);bob.scale.y=1.5;g.userData.bob=bob;const ring=mesh34(g,new THREE.TorusGeometry(.22,.012,4,22),'#D9E3D3',12.7,.055,16.3);ring.rotation.x=Math.PI/2;
}
HOTSPOT_HOOKS.push((i,list,d)=>{const pot=d(-5.6,6.35);if(pot<1.5)list.push({id:'garden34',label:life34().crop.stage===3?'Harvest your peppers':'Tend the pepper pot',dist:pot-.2});const shop=d(20.8,7.1);if(shop<2)list.push({id:'finds34',label:'Browse Palm Court Finds',dist:shop});SHELLS34.forEach(([x,z],k)=>{const dd=d(x,z);if(dd<1.3&&life34().shellDays[k]!==S.day)list.push({id:'shell34:'+k,label:'Pick up a shore shell',dist:dd-.2});});return null;});
ACT_HOOKS.unshift((i,kind,arg)=>{if(kind==='garden34'){openLife34('garden');return true;}if(kind==='finds34'){openLife34('market');return true;}if(kind==='shell34'){ACTIONS.lifeShell({k:arg});playPick(players[i].g);return true;}return false;});
const lifeGuideEl34=document.createElement('div');lifeGuideEl34.id='life-guide34';lifeGuideEl34.style.display='none';document.body.appendChild(lifeGuideEl34);lifeGuideEl34.addEventListener('click',e=>{if(e.target.closest('button'))ACTIONS.lifeClear();});
TICK_HOOKS.push((dt)=>{if(!S||S.phase!=='play'){lifeGuideEl34.style.display='none';return;}tickFishing34(dt);const t=performance.now()/1000;
 const bob=LIFE34.fishingWorld?.userData.bob;if(bob)bob.position.y=.12+Math.sin(t*3)*.025;
 const tip=LIFE34.marker?.userData.tip;if(tip)tip.position.y=.55+Math.sin(t*2)*.06;
 LIFE34.noticeT+=dt;if(LIFE34.noticeT<.25)return;LIFE34.noticeT=0;const w=LIFE34.waypoint;
 if(!w||overlayOpen()){lifeGuideEl34.style.display='none';return;}const dist=Math.min(...players.map(p=>Math.hypot(p.g.position.x-w.x,p.g.position.z-w.z)));lifeGuideEl34.style.display='flex';lifeGuideEl34.innerHTML=`<span>◇ ${esc(w.name)} · ${dist<2?'You’re here. Use Act.':Math.ceil(dist)+' m away'}</span><button aria-label="Clear destination">×</button>`;
});

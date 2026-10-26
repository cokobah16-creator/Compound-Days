/* v35 home uses (art brief section 5): two furnishings that had no visible use beyond their home-vibe tags get a small one, built
   from a few primitives (no asset files), following the floor lamp: refreshHomeExtras builds the lamp's light after every furniture
   rebuild, and updateLamp, already called every frame by the base tick hook, switches it on from 18:00 to 06:00. This module hangs its
   two extras in the first and carries its state check in the second. The check compares two booleans with the last ones shown and
   touches the scene only when one changes, so there is no new tick hook and no per-frame scene work.
   - TV console: the screen glows softly from 18:00, on the lamp's hours, until the household sleeps: Sleep (the night panel, endDay,
     which a shared action replays on the other device online) or the base's past-midnight sleep (S._late). After a reload or Continue
     the household is up again, so the screen glows again if it is evening.
   - Coffee table: while neighbours are visiting, the host's welcome: a round cane tray with a jug of zobo and three enamel cups. Visiting
     means the veranda evening from the guests' arrival at the gate until they have walked off (EVENING35.state not idle), or the
     housewarming (S.party.on: from the first knock until the next morning, when the base sends the guests home, so it stays on the night page).
   Both show only while the piece is placed in the flat; they hang on that piece's furniture group, so they turn and move with it.
   Everything is read from the saved and shared state (S.time, S._late, S.party, S.home.items) or from this device's evening, which
   is off in online play, so an old save needs nothing new and an online household sees what the shared document says. No save
   field, no light (a new light would recompile every lit material at 18:00), no texture beyond the base's own glow. Loaded after
   audio-v35.js; HOMEUSE35 is the only new top-level name. */

const HOMEUSE35={sleptDay:null,shown:{tv:null,tray:null},tv:null,tray:null,tvItem:null,trayItem:null,
 // the household has gone to bed today: the night panel is up (Sleep pressed) or the base put them to sleep after midnight
 asleep(){return !!(S&&(S._late||HOMEUSE35.sleptDay===S.day));},
 evening(){return typeof EVENING35!=='undefined'&&EVENING35.state!=='idle';},
 party(){return !!(S&&S.party&&S.party.on);},
 // the lamp's hours (updateLamp: on from 18:00 until 06:00), until the household sleeps
 tvOn(){if(!S||!S.home||!placed('tvconsole'))return false;const h=S.time%24;return (h>=18||h<6)&&!HOMEUSE35.asleep();},
 trayOn(){return !!(S&&S.home&&placed('coffee')&&(HOMEUSE35.evening()||HOMEUSE35.party()));}};

{
 const H=HOMEUSE35;
 const SCREEN='#A9C9EC',HALO='#7FA6DA';
 // the glow in the television's own frame (the catalogue television: a 0.91 x 0.52 m body from 0.08 m up, its front face 0.02 m
 // forward, the glass 0.86 x 0.48 m centred 0.34 m up). The lit plane sits 6 mm in front of the body, a little inside the glass. When the
 // catalogue pieces have not loaded, the console is the grey stand-in box and a dark set of the same size stands on it.
 const tvBuild=()=>{const g=new THREE.Group();g.name='homeuse35_tv';
  const body=new THREE.Group();body.name='homeuse35_tvbody';
  const b=new THREE.Mesh(new THREE.BoxGeometry(0.91,0.52,0.04),mat('#1E1E1E'));b.position.set(0,0.34,0);body.add(b);
  const f=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.08,0.18),mat('#1E1E1E'));f.position.set(0,0.04,0);body.add(f);g.add(body);
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(0.84,0.46),new THREE.MeshBasicMaterial({color:SCREEN,transparent:true,opacity:0.85}));
  scr.position.set(0,0.34,0.026);scr.name='homeuse35_screen';g.add(scr);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glow||null,color:HALO,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0.5}));
  halo.scale.set(1.3,1.0,1);halo.position.set(0,0.34,0.14);halo.name='homeuse35_halo';g.add(halo);
  g.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=false;}});return g;};
 // the welcome tray: a round cane tray (it fits the oval table's top), a jug of zobo with a pale lid, three white enamel cups with blue
 // rims and zobo in them; a touch larger than life so it reads at phone size
 const trayBuild=()=>{const g=new THREE.Group();g.name='homeuse35_tray';const o={parent:g,noCol:true,noShadow:true},O=x=>Object.assign(x,o);
  cyl(0.19,0.03,'#A8713F',0,0,0,O({seg:20}));cyl(0.172,0.031,'#C8924A',0,0.001,0,O({seg:20}));
  cyl(0.058,0.18,'#9B2340',-0.07,0.03,0,O({seg:12,rt:0.046}));cyl(0.048,0.02,'#F4EEE2',-0.07,0.21,0,O({seg:12}));
  box(0.016,0.09,0.022,'#9B2340',-0.132,0.09,0,o);
  [[0.08,-0.09],[0.12,0.05],[0,0.11]].forEach(([x,z])=>{cyl(0.038,0.06,'#F6F1E6',x,0.03,z,O({seg:10}));cyl(0.04,0.008,'#2E4A8F',x,0.086,z,O({seg:10}));
   cyl(0.033,0.003,'#7A1A33',x,0.093,z,O({seg:10}));});
  g.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=true;}});return g;};
 // the item's furniture group: rebuildFurniture adds one group per S.home.items entry, in order (life-v34 relies on the same)
 const groupFor=type=>{if(typeof furnGroup==='undefined'||!furnGroup||!S||!S.home)return null;const ix=S.home.items.findIndex(i=>i.type===type);
  return ix<0?null:furnGroup.children[ix]||null;};
 const detach=o=>{if(o&&o.parent)o.parent.remove(o);};
 // hang the two extras on the placed pieces (once per rebuild; the objects are made once and reused)
 H.attach=function(){
  const tg=groupFor('tvconsole');detach(H.tv);H.tvItem=null;
  if(tg){if(!H.tv)H.tv=tvBuild();const tv=tg.getObjectByName('prop_television'),s=tv?tv.scale.y:1;
   // on the catalogue television (propFurn puts it 0.5 m up on the fitted console), or on the 0.5 m stand-in box
   H.tv.position.set(0,tv?tv.position.y:0.5,tv?tv.position.z:0.02);H.tv.scale.setScalar(s);H.tv.getObjectByName('homeuse35_tvbody').visible=!tv;tg.add(H.tv);H.tvItem=tg;}
  const cg=groupFor('coffee');detach(H.tray);H.trayItem=null;
  if(cg){if(!H.tray)H.tray=trayBuild();const ct=cg.getObjectByName('prop_coffee_table'),s=ct?ct.scale.y:1;
   // the catalogue table's top is 0.418 m up at full size (fitted to the cell, so scaled); the stand-in box is 0.5 m tall
   H.tray.position.set(0,ct?ct.position.y+0.418*s:0.5,0);cg.add(H.tray);H.trayItem=cg;}
  H.shown.tv=H.shown.tray=null;H.sync();};
 // the per-frame state check: two booleans; the scene changes only when one differs from what is shown
 H.sync=function(){const tv=H.tvOn(),tr=H.trayOn();if(tv===H.shown.tv&&tr===H.shown.tray)return false;
  H.shown.tv=tv;H.shown.tray=tr;if(H.tv)H.tv.getObjectByName('homeuse35_screen').visible=H.tv.getObjectByName('homeuse35_halo').visible=tv;if(H.tray)H.tray.visible=tr;return true;};

 // wrap: the lamp's extras (built after every furniture rebuild) also hang the screen glow and the tray on their pieces
 const extrasPrev=refreshHomeExtras;refreshHomeExtras=function(){const r=extrasPrev.apply(this,arguments);try{H.attach();}catch(e){if(typeof console!=='undefined')console.warn('homeuse35',e);}return r;};
 // wrap: the lamp's per-frame switch also runs the two-boolean check
 const lampPrev=updateLamp;updateLamp=function(){const r=lampPrev.apply(this,arguments);H.sync();return r;};
 // wrap: Sleep (the night panel) puts the household to bed for the rest of today; online the shared sleep action replays it on the other device
 const endPrev=endDay;endDay=function(){if(S)H.sleptDay=S.day;return endPrev.apply(this,arguments);};
 // wrap: entering the world (load, Continue, joining online) finds the household up
 const enterPrev=enterWorld;enterWorld=function(){H.sleptDay=null;return enterPrev.apply(this,arguments);};
}

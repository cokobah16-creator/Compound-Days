/* v35 lens (plan section 5: "Try a 30-degree lens with a higher pitch behind a flag, and keep the carry framing"). Off by default.
   The game camera today: CAM_DIR (index.html) looks from the south-south-east about 37 degrees above the ground, polish-v32 sets both
   game cameras (cams) to a 34-degree field of view, and visual-v21's updateCameras fits the player (or, during a carry, both players and
   the sofa; the float while fishing; a just-placed piece; the evening's guests) into each view's usable area, at no less than 7.1 m
   (portrait), 7.3 m (landscape) or 5.5 m (carry). evening-v35 smooths that fit and reads cams[i].fov, CAM_DIR, v21Up and v21Right
   each frame. The title camera (camera), the creator preview (prevCam, polish-v30) and the wardrobe photos (THUMB.cam, environment-v31)
   are separate cameras, and this module never touches them.
   "Camera: high and close" sets the game cameras to 30 degrees and lifts CAM_DIR to LENS35.pitch with the same compass direction, so
   v21Right, FACE_YAW, the stick mapping and the evening's sightline rules are unchanged; v21Up follows the new pitch. Every fit above
   uses the real field of view and direction, so it refits by itself; only the fixed minimum distances are scaled by tan(17)/tan(15),
   so the width seen at the player is the same as before. From the higher pitch the veranda wall no longer hides the armchair or a
   chair on the veranda row. Per device (localStorage 'cd3-lens', 'high' or 'classic'; absent means classic), switched from the Menu
   beside Sound; ?lens=30 in the address turns it on for a quick test without saving. Loads after audio-v35.js. Public name: LENS35. */
const LENS35={fov:30,pitch:50,on:false,store:'cd3-lens',classic:null,
 labels:{classic:'Camera: classic',high:'Camera: high and close'},
 wanted(){return false;},apply(){return false;},minScale(){return 1;}};
{
 const own=typeof CAM_DIR!=='undefined'&&typeof cams!=='undefined'&&typeof v21Up!=='undefined'&&typeof v21Right!=='undefined';
 let mem=null;   // this session's choice, used when storage is unavailable (private mode) or refuses the write
 const setPref=v=>{mem=v;try{localStorage.setItem(LENS35.store,v);}catch(e){}};
 const fromUrl=()=>{try{const q=typeof location!=='undefined'&&location&&typeof location.search==='string'?location.search:'';return /[?&]lens=30(?:&|$)/.test(q);}catch(e){return false;}};
 // the choice in force: this session's tap, then ?lens=30, then the saved setting
 LENS35.wanted=function(){if(mem!==null)return mem==='high';if(fromUrl())return true;try{return localStorage.getItem(LENS35.store)==='high';}catch(e){return false;}};
 if(own){
  const hl=Math.hypot(CAM_DIR.x,CAM_DIR.z);
  const C={dir:CAM_DIR.clone(),up:v21Up.clone(),fov:cams[0].fov,hx:CAM_DIR.x/hl,hz:CAM_DIR.z/hl};
  LENS35.classic={fov:C.fov,pitch:Math.round(Math.atan2(CAM_DIR.y,hl)*180/Math.PI*100)/100};
  const tanHalf=deg=>Math.tan(deg*Math.PI/360);
  // the factor on the fixed minimum distances: the same half-width at the focus as the classic lens
  LENS35.minScale=function(){return LENS35.on?tanHalf(C.fov)/tanHalf(LENS35.fov):1;};
  // switch the game cameras (both views) between the classic lens and the high one; CAM_DIR and v21Up are changed in place
  LENS35.apply=function(on){on=!!on;if(on===LENS35.on)return false;
   if(on){const p=LENS35.pitch*Math.PI/180;CAM_DIR.set(C.hx*Math.cos(p),Math.sin(p),C.hz*Math.cos(p));v21Up.crossVectors(CAM_DIR,v21Right).normalize();}
   else{CAM_DIR.copy(C.dir);v21Up.copy(C.up);}
   for(const c of cams){c.fov=on?LENS35.fov:C.fov;c.updateProjectionMatrix();}
   LENS35.on=on;return true;};
  // wrap (outermost): with the high lens, two points on the camera's vertical through the centre of everything the fit frames make the
  // fit's fixed minimum (7.1, 7.3 or 5.5 m) that minimum times minScale; symmetric about the centre, so the centre and aim are unchanged
  if(typeof v21InteractionPoints==='function'&&typeof v21Viewport==='function'){
   const ptsPrev=v21InteractionPoints,P=[new THREE.Vector3(),new THREE.Vector3()],B=new THREE.Box3(),c=new THREE.Vector3();
   v21InteractionPoints=function(i,joint){const pts=ptsPrev.apply(this,arguments);if(!LENS35.on||!Array.isArray(pts)||!pts.length)return pts;
    const vp=v21Viewport(i),usableY=Math.max(.30,1-(vp.top+vp.bottom)/vp.h),min=joint?5.5:(innerHeight>innerWidth?7.1:7.3);
    const h=min*LENS35.minScale()*tanHalf(LENS35.fov)*usableY;B.setFromPoints(pts).getCenter(c);
    pts.push(P[0].copy(c).addScaledVector(v21Up,h),P[1].copy(c).addScaledVector(v21Up,-h));return pts;};}
  LENS35.apply(LENS35.wanted());
 }
 // wrap: the Menu offers the per-device Camera setting right after Sound (at the end when there is none), also online; a silent replay inserts nothing
 if(typeof openMenu==='function'){const prevMenu=openMenu;openMenu=function(){const r=prevMenu.apply(this,arguments);if(!own||(typeof silentMode==='function'&&silentMode()))return r;
  const actions=typeof document!=='undefined'&&document.querySelector?document.querySelector('#panel .actions'):null;
  if(!actions||!actions.insertAdjacentHTML)return r;
  const on=LENS35.on,html=btn(on?LENS35.labels.high:LENS35.labels.classic,'lens35',{},'quiet').replace('<button ','<button aria-pressed="'+on+'" ');
  const after=typeof actions.querySelector==='function'?actions.querySelector('[data-act="sound35"]'):null;
  if(after&&after.insertAdjacentHTML)after.insertAdjacentHTML('afterend',html);else actions.insertAdjacentHTML('beforeend',html);return r;};}
 // the camera for this device only: saved, applied at once (the fit widens or eases in from where it is), and the Menu reopens
 if(typeof ACTIONS!=='undefined')ACTIONS.lens35=function(){if(!own)return;const high=!LENS35.on;setPref(high?'high':'classic');LENS35.apply(high);openMenu();};
 if(typeof LOCAL_ONLY!=='undefined')LOCAL_ONLY.add('lens35');
}

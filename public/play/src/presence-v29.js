/* Compound Days v29: the presence pass re-measured for the v29 sculpt.
   presence-v25.js keeps the machinery (baked occlusion to vertex colours, rim light, blinking caps, glances, breathing);
   this file supplies the sculpt's measurements: eye centres and radii, the facial tint regions, the lip shading, the
   hairline for the stubble band, lid-less eye parts that glance by rotating about the eye centre, and the blink caps
   coloured from the chosen skin. Loaded after presence-v25.js and bases-v29.js. */
'use strict';
(function(){
if(typeof PRESENCE==='undefined'||typeof SCULPT29==='undefined') return;
const SC=SCULPT29; const HJ=SC.joints.Head; const E=SC.head.eyeHead; const LM=SC.landmarks;
// eye measurements in head space (used by the sclera and iris painters and the blink caps)
PRES_EYE.x=E[0]; PRES_EYE.y=E[1]; PRES_EYE.z=E[2]; PRES_EYE.rx=SC.head.eyeR; PRES_EYE.ry=SC.head.eyeR; PRES_EYE.rz=SC.head.eyeR; PRES_EYE.irisR=0.0058;
PRESENCE.lidRest=0.0; // the resting lid is modelled into the sculpt now
const EYE_M=[[ -E[0],HJ[1]+E[1],HJ[2]+E[2]],[E[0],HJ[1]+E[1],HJ[2]+E[2]]]; // model space
const NT=LM.noseTip, MT=LM.mouth, CH=LM.chin, CK=LM.cheek, BR=LM.brow, HC=LM.headCentre;

/* ---- facial tints on the body skin (model space, bind pose) ---- */
presBodyColor=function(x,y,z,ao,out){ out[0]=out[1]=out[2]=1; presShadow(ao,out); const W=PRESENCE.warm; const ax=Math.abs(x);
  if(y>1.50){ // the head and neck
    for(const e of EYE_M){ const d=((x-e[0])/0.024)**2+((y-e[1])/0.016)**2+((z-e[2])/0.022)**2; const inS=presSmooth(1.6,0.7,d); if(inS>0){ const up=presSmooth(e[1]-0.002,e[1]+0.009,y); presTint(out,0.70,0.56,0.54,0.55*inS*up*W); presTint(out,0.88,0.76,0.74,0.4*inS*(1-up)*W); } }
    const cheek=presBump(ax,CK[0],0.03)*presBump(y,CK[1]-0.006,0.028)*presSmooth(0.02,0.06,z); presTint(out,1.0,0.88,0.84,0.5*cheek*W);
    const nose=presSmooth(0.022,0.006,Math.hypot(x,y-NT[1],z-NT[2])); presTint(out,1.0,0.90,0.87,0.45*nose*W);
    const noseSide=presBump(ax,0.0145,0.011)*presBump(y,NT[1]-0.004,0.022)*presSmooth(0.075,0.095,z); presTint(out,0.78,0.68,0.66,0.45*noseSide*W);
    const mouth=presBump(y,MT[1],0.018)*presSmooth(0.045,0.01,ax)*presSmooth(0.06,0.08,z); presTint(out,1.0,0.90,0.88,0.3*mouth*W);
    const underLip=presBump(y,MT[1]-0.013,0.008)*presSmooth(0.03,0.008,ax)*presSmooth(0.065,0.08,z); presTint(out,0.76,0.66,0.64,0.45*underLip*W);
    const chin=presBump(y,CH[1]+0.006,0.02)*presSmooth(0.03,0.06,z)*presSmooth(0.05,0.015,ax); presTint(out,0.9,0.82,0.80,0.25*chin*W);
    const underJaw=presSmooth(1.555,1.525,y)*presSmooth(1.47,1.50,y)*presSmooth(0.0,0.04,z); presTint(out,0.70,0.60,0.58,0.5*underJaw*W);
    const temple=presSmooth(0.055,0.075,ax)*presSmooth(1.66,1.70,y)*presSmooth(0.06,0.02,z)*presSmooth(1.76,1.73,y); presTint(out,0.84,0.78,0.76,0.3*temple*W);
    // stubble band: the scalp above the hairline, applied per avatar by the shader (a bald head is clean-shaven)
    const front=presSmooth(0.02,0.06,z), back=presSmooth(-0.01,-0.05,z); const hairline=1.742*front+1.705*(1-front-back)+1.69*back;
    out.stubble=presSmooth(hairline-0.008,hairline+0.02,y)*presSmooth(1.66,1.70,y); }
  else { const el=presBump(y,1.17,0.05)*presSmooth(0.17,0.21,ax); presTint(out,1.0,0.91,0.88,0.25*el*W); const hand=presSmooth(0.93,0.80,y)*presSmooth(0.2,0.25,ax); presTint(out,1.0,0.92,0.90,0.2*hand*W); const knee=presBump(y,0.50,0.05)*presSmooth(0.0,0.03,z); presTint(out,1.0,0.90,0.87,0.25*knee*W); } };
presLipColor=function(y,top,ao,out){ out[0]=out[1]=out[2]=1; presShadow(ao,out); const ml=MT[1]-HJ[1]; if(top){ const v=presSmooth(ml+0.001,ml+0.006,y); presTint(out,0.62,0.50,0.50,0.5*(1-v)); } else { const v=presSmooth(ml-0.007,ml-0.0005,y); presTint(out,0.66,0.52,0.52,0.55*v); } };

/* ---- eye parts glance by rotating about the eye centre (their nodes sit on it); the v25 translation path is bypassed ---- */
const v29Setup=presenceSetup;
presenceSetup=function(g,look){ v29Setup(g,look); const s=g&&g.presence; if(!s) return; s.eyes29=s.eyes; s.eyes=[null,null]; for(const e of s.eyes29){ if(!e) continue; for(const p of e.parts){ p.o.position.set(p.x,p.y,p.z); } } };
const v29Update=presenceUpdate;
presenceUpdate=function(g,dt,moving){ v29Update(g,dt,moving); const s=g&&g.presence; if(!s||!s.eyes29) return; const cap=s.caps[0]||s.caps[1]; const aEff=cap?1-cap.rotation.x/PRES_CAP_OPEN:0; const yaw=s.gazeX/0.03, pitch=-s.gazeY/0.022;
  for(const e of s.eyes29){ if(!e) continue; for(const p of e.parts){ p.o.rotation.set(pitch,yaw,0); if(p.hi) p.o.visible=aEff<0.5; } } };
})();
function presence29StatusText(){ return (typeof SCULPT29!=='undefined')?' Presence: re-measured for the v29 sculpt.':''; }

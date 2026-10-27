// v36 Ada's bench (dist/src/bench-v36.js), checked on the real game logic in Node with the shipped Three.js. A local two-player household
// is made with the real setup actions, the sofa is placed, and the players are driven only through the game's own key state (P1 WASD and
// E, P2 the arrows and Enter) and the real tick, one frame at a time; the harness never calls the bench step and never sets the bench pose
// (players are placed by hand, as the other harnesses do, and saved games are loaded through save/load/enterWorld). Nothing is rendered:
// views are measured by projecting with the game's own cameras. Clock, rng, Date and performance.now are stubbed.
// The checks run twice in child processes and the two reports must match; each mutant (a one-place change to bench-v36.js in a copy of
// dist) reruns only its named check, which must fail. Prints one PASS or FAIL line per check and writes check/results-bench-v36.json.
// The control plan the delivery checks follow is check/bench-route-v36.json (tools/bench-route-v36.cjs; rerun it when the world changes).
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const OUT=path.join(__dirname,'results-bench-v36.json');
const GAME=process.env.COMPOUND_GAME_DIR||path.resolve(__dirname,'..','dist');process.env.COMPOUND_GAME_DIR=GAME;
const PLAN=JSON.parse(fs.readFileSync(path.join(__dirname,'bench-route-v36.json'),'utf8'));
const {guideHash}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));
const NAMES=[
 '1. Foundation: a local pair (two cameras, singleIdx -1) in which each player’s keys move only that player, also both at once; each player’s prompt shows beside their own view near a hotspot',
 '2. Inert until started: 3,000 seeded points give the same blocked() result, a 600-frame two-player walk leaves the save, the camera distances and the hotspot labels identical, and the save’s top-level keys, the tick hooks and the LINES35 counts match the build without bench-v36.js; the companion household’s Menu matches too, apart from the one line at its top saying the bench needs two players on one device; no bench mesh exists',
 '3. Both must participate: one player alone cannot move it; the mover’s keys only translate it along its axis and the turner’s only turn it about its centre (the turner’s forward keys move nothing); with the turner’s keys zeroed for 120 s the plan never reaches the passage, and with the mover’s zeroed the centre never moves; at four corner poses (inside the gate 40° off, corner 1 half-turned, the flat door 20° off, the veranda doorway 15° off) 120 s of the mover’s keys alone (ratcheting either way, or random) leave the yaw exactly as it was, 120 s of the turner’s keys alone move the centre at most 0.08 m, and BENCH36.yawLeak stays 0; with both players’ random keys at the openings and corners the heading changes by exactly what the Turn player’s swings give, also in frames where the walls help (yawLeak counts any other change)',
 '4. Three consecutive deliveries by real keys through the gate, both corners and the doorway: no reset and the state sequence exactly the machine’s; the second with roles swapped before the lift, the third with four set-downs by alternating holders and a mid-route swap that changes the leading end; each under 60 s of game time with at most 3 bumps; Out, Gate and Water placed; the plan is the one made for the running scheme (guided-lateral) and its guidance (the BENCH36.GUIDE hash); the saved item untouched until each new agreement; the fresh start moves the crate; the preflight refuses an armchair over the slot and a piece in the room lane, and Build refuses the lane while a delivery is open',
 '5. Walls are never passed: on every frame of checks 4, 6 and 7 and of a seeded fuzz (6 x 1,000 frames of random keys and Acts for both players from the five checkpoints and the doorway, each loaded where asked, and 300 frames each of the mover’s random keys alone and of both players’ random keys and Acts from 5, 10, 14 and 20 degrees off at the passage mouth, the flat door and the veranda doorway and with a holder 0.05 m from each of their six jambs) an independent exact box test finds the bench clear of every wall, piece of furniture and the crate, and between carried frames within 0.1 mm, with the walls’ sideways help used on some of those frames; the holders stand clear on level ground at their squeezed-in radius, nobody steps to a stand point through a wall, and every frame of the glide, and every moment between its frames, is clear of the walls, the pot and both players',
 '6. Never trapped: every set-down the fuzz makes (the openings’ fuzz included) is one the harness’s own walk finds both players can lift (one at each end, in an order in which the first holder’s body leaves the other their way round), every refusal one it finds they cannot, and nobody but a holder ever stands inside the grounded bench (also after a set-down the frame after the lift); a reset after a stall at corner 2 with both players in the room lands on a liftable checkpoint, never on the old room pose; with no checkpoint liftable the bench goes to the gate with the players; a save made mid-carry with the leading holder on the row reloads liftable or at the gate; a player waiting out on the street (south of z 11) neither makes a grounded bench stuck nor sends it back on a reload, and a set-down by the street gate is not refused for them; an end counts as reachable only from a cell with a clear straight step to it (the step a take makes): set down every 30 frames from the lift through the flat door, every set-down the game accepts is lifted again for real (each player placed at the nearest such cell of their end, as the harness’s walk finds it, and Act pressed), never stranded at corner 2, and the delivery completes; every fuzz set-down, loaded as it was, is lifted for real the same way; a refusal for a holder with no room to step back is true',
 '7. Set down and swap anywhere: at 12 points along the plan the pair sets the bench down (alternating holders), swaps roles, lifts and carries on, the role lines and chips follow the swap, and the delivery completes',
 '8. Gentle stop at dt 1/60 and 1/30: pushed into a rail for 2 s, the bench moves at most 1 mm after first contact and then not at all, the holders’ walking flag does not flicker, at most one bump per 0.4 s, and the mesh recoil stays within 6 cm and returns to the pose; what meets the rail is the leading holder’s body at its squeezed-in 0.22 m (not a walking 0.33 m), so the dust rises beside that holder and both prompts say who is up against what',
 '9. Stuck and reset: held accepted keys against the vestibule wall at corner 2 (the porch turn after the passage, plan segment 7) make it stuck in about 2.5 s and the hint shows in the holders’ prompts; a key held outside the cone for 5 s does not (and its arrow hint shows after 0.6 s for the mover, 0.35 s for the turner); three swings refused within 4 s put “Your end is on the wall. Try the other way, or ask … to back up a little.” in the turner’s prompt and “… needs room. Back up a little.” in the mover’s; a set-down ends the stall (no hint, and a player at an end gets “Take this end”, never the reset); a grounded bench nobody can lift (the crate pushed onto an end) offers “Reset the bench” beside it, and Act puts it on a liftable checkpoint with the crate moved clear; the Menu reset works with the bench in the passage and sits at the top of the Menu; while stuck the player cards keep “Bench · Move” and “Bench · Turn”; a swing held against the wall for 1.5 s also brings the turner’s line; at the four corner poses of check 3 the turner’s hint points the way that swings the leading end towards the next corner (within 3 degrees), beside the turner’s end at the desk and clear of the prompt card on a phone; wedged in the corner just inside the street gate a set-down is refused because the holder there truly has no room to step back (and the toast says so), and once it is stuck the holders are offered “Put it back” with the line “Too tight to set down here…”, and Act puts it on a liftable checkpoint; the gate pillar that hides a holder fades and is itself again once the bench is down',
 '10. Controls feel: a 100 ms tap moves at most 3 cm or turns at most 1.5 degrees, a release from full speed coasts at most 5 cm or 3 degrees, forward and back speeds are equal, one held key completes a 95-degree turn, and a Menu opened and closed mid-carry leaves the bench at rest',
 '11. Placement: Out, Gate and Water pass the arrangement rule with the default, chairs-at-(5,4) and armchair-at-(5,4) layouts and inside the first chooser (reach start free, a reach run each time); a candidate over the pot keep fails; a player in the way is moved clear before the bench goes; the ghost stands at the pose; one agreement does not commit and a change clears both; both agree gives the item and the day log line; with an armchair, chairs or a plant beside the doorway (cell 5,4) the bench still glides to each arrangement (in two legs), every frame and every move between frames clear',
 '12. Save and reload: a placed bench, a bench in the chooser and a bench saved mid-carry come back as they were (grounded and liftable for the carry); an old save gets nothing; a placed state with no item heals; online the shared document keeps only {v, state, choice}; ?bench=fresh applies once; Build cannot store or pick up the bench and shows neither button; browsing in a fresh delivery’s chooser never changes the saved arrangement, so “Leave the bench where it was” leaves the save, the shared document and the next run on the placed one; in playtest mode the next run starts from the job each player did not start the last one with, and a run that is lifted and then left where it was puts back the first mover and the mover it started from, so the run after it is pre-swapped from the completed one; a chooser save with an unknown browsed arrangement, in an again run with an unknown saved choice, opens the chooser on Out (and so does lifting it there again)',
 '13. Sitting: both sit facing the seat’s way (hips 0.61 m, feet on the floor, seats 0.72 m apart); the Menu opened and closed keeps them seated; a held key stands them up on free spots; past midnight and Start day nobody is sitting and both are in the room, and the save says so; a day change by any other route stands them up at the next panel close',
 '14. Split views keep prompts and visibility: at 1280x800 and 1280x720 at the five checkpoints of a delivery, in both views the bench, both holders and the next-corner point are inside the usable area, the corner point is kept, the smaller holder is at least 70 px tall and the prompt carries the right Move or Turn chip; the camera distance changes by at most 2.5% a frame; the ghost is in both views in the chooser; at 390x844 and 844x390 the corner point is dropped for the arrow, which points where that view draws the next corner (within 3 degrees) from the edge of its framed area, never over the prompt card, and the heights are recorded',
 '15. Modes: a holder’s pad disconnecting sets it down; online it is set down, paused and absent from blocked() and the scene, an open fresh delivery is cancelled, and back on one device a player who stood where it lay is moved clear (it stays put); a pair sitting on it stand up when the household goes online; a companion household sees no offer but the two-hands line from day 2 without any flag (and nothing spawns), an online one the one-device line; a first delivery can be left for now (gone, the offer back); the evening waits while the bench is in hands, starts with it lying on the ground or placed, its pending() untouched; Ada thanks them once after placement; LINES35 is untouched',
 '16. Hotspots: with each arrangement placed a player at the pepper pot’s own point gets the pot; a player at (-5.95, 6.4) gets “Sit on the bench together” or “Wait for …”; both players pressing Act at the same end on the same frame give one holder and the toast; a player whose step to the stand point would cut through the doorway jamb is asked to come round, and takes the end once straight on',
 '17. Per-frame cost: a carry sub-step makes at most 24 blocked() calls and 12 box tests (also on the frames the walls help, whose peak is recorded), a carry frame at most 2 sub-steps, and an idle frame (no delivery, or the bench placed) no bench blocked() call at all; from the lift to the bench in its place no frame runs more than one arrangement check or more than the settle planner’s budget of box tests (counted, not timed), and the glide is planned while the pair chooses; weighed in box tests (a blocked() call 3, one answered from the reach run’s index 1/4, a walk-grid cell 1/64), no frame from the lift to the bench in its place weighs more than 1,200 (about 6 ms), and the frame the chooser opens in runs no arrangement check',
 '18. Glyph and page: Ada’s note says one walks it and one turns it, the lift toast names who walks it and who turns it, and the first lift’s hints say how; after E and Enter presses the prompts show E and ⏎, not the pad’s A; while the bench is held the area captions are hidden in both views (and the same ones come back once it is down) and the page is marked busy (the wayfinding pill and, on small screens, the Pantry card step aside), after the first two lifts the carry prompt is marked compact, the chooser marks the page for its top strip, and a see-through outline of the bench shows only while it is held',
 '19. Walls guide, never turn: the passage, the flat door, the veranda doorway and (round 2b) the street gate measured from the walls match the module’s openings (a jamb moved 4 cm switches that opening’s funnel off and logs it); at each, the mover’s keys alone 5, 10 and 14 degrees off its axis keep the yaw exactly, draw the centre closer to the opening’s centre line and move it sideways at most 0.30 m per metre pushed, and 20 degrees off move it sideways not at all; a refused push gets at most 0.15 m of sideways help a contact, which comes back after 0.30 m of unassisted travel and after a set-down and lift; and a 2 cm post beside the flat-door jamb is never crossed between frames',
 '20. Solo: one player alone for 120 s (the mover ratcheting either way or pressing random keys, or the turner pressing random keys) from ten poses (by the gate 25 and 45 degrees off, inside the gate 40 off, corner 1 half-turned, the passage mouth 30 and 15 off, the flat door 20 off, the veranda doorway 15 off, the room 25 and 45 degrees off the doorway’s axis) never changes the yaw by the mover’s keys, never moves the centre more than 0.08 m by the turner’s, never passes more than one opening and only along a straight, and reaches the chooser only in the two straight pushes from 15 degrees off at the veranda doorway and the two from 25 degrees off in the room (the shipped plan’s own last move; the build before the guided walls delivers these too), never from 45 degrees off (the delivery zone wants the bench within 30 degrees of the doorway’s axis); the walls’ help is used in these runs',
 '21. Key repeat: an OS key repeat on E or Enter is never a fresh Act anywhere in the bench (the page’s own keydown listeners, fired by hand): a held E after taking an end never swaps roles, held E and Enter while carrying never set it down (one fresh press still does), a held E in the chooser never takes the agreement back, a held E on the bench never stands them up; with no bench about, a repeat still sets the latch as before',
 '22. Focus loss: a window blur mid-push (a key held and a stick leaning) and the page hidden mid-swing let go of every key, both sticks and the Act latches; the carried bench stops dead where it is, still held, and does not move in the next 60 frames; in the chooser a held arrow stops stepping',
 '23. The clock pauses only while the bench is busy: 300 frames carried along the plan, 300 frames in the chooser and every frame of the glide move the clock by 0 h (so a carry begun at 24.19 h meets no “Past midnight” card), while 300 frames with the bench lying untouched, with one player holding an end, and sitting on it move it by the normal 1/6 h',
 '24. The directions pill: shown before, it is out of sight with one end taken, while carried, in the chooser and while sitting, and comes back exactly as it was after a set-down, after the chooser and after standing up',
 '25. The bench card: the Today page has the “Ada’s bench needs two pairs of hands” card (fetch it while it waits with Ada, Find the bench while it waits on the ground, nothing while it is in hands or placed, nothing before it is due), and the bench lines open the Menu (the offer, then Find or Pause next to the reset); a companion household’s card offers two players on this device, an online one says why; while the first-evening guide is on, Tasks opens its journal and the same card is in it, under its heading',
 '26. The chooser by touch: each view’s strip has ◀ and ▶ and its own player’s “agrees” button (tapped through the strip’s own handler), a tap browses and clears both agreements, the agreed state shows on the button, two taps commit; the ghost is in the role yellow when free and red when not, its body itself in that colour (not pale cream), with a seat-height outline, a broad 5 cm outline and a large seat arrow (0.44 m) at the arrangement and faint outlines at the other two, all seen through the parapet; the arrangement’s name is at least 1.4 rem at the desk and 16 px on phones; the buttons take taps and are at least 44 px (the stylesheet)',
 '27. Pause and find: “Pause delivery and explore” beside the reset sets a carried bench down with the safe set-down (liftable, not counted as a set-down) and frees both players’ keys; “Find the bench” marks it with the destination marker, which follows a reset and goes when either player takes an end; carrying on is walking back and lifting; in the chooser a pause leaves it in the doorway and lifting it there opens the chooser again; the player’s own destination comes back once Find’s marker goes',
 '28. A companion household with two players: its Menu and Today offer “Play this with two players on this device”, which switches to two-player controls (AI.on and S.ai false, both views) and starts the delivery; a reload mid-switch stays two-player with “Back to my companion”; a pause restores the companion exactly (AI.on, S.ai, AI.i, its position, the views, the save’s keys); a second switch through to placing, sitting and standing up restores it again, and so does leaving an again run; with the companion back and away, a player at the bench is not told to wait for it; online there is no switch',
 '29. A holder never pins the other player in (the doorway trap the guided prototype’s seed 7 found): with the bench set down in the room and its end in the veranda doorway’s mouth, a player in the room is asked to leave that end to the partner standing in the doorway (“Ola needs this end”, and Act says why), takes the far end instead, and the partner comes round and they lift; a holder who stands in the partner’s only way round is asked to let go (“Let go · Ola can’t get round”, the partner sees “Ask Efe to let go”), lets go by Act or by himself after 2.5 s, and steps back on his own side of the jamb; a set-down there puts each holder on their own side of any wall, and the harness’s walk, with the first holder’s body in the way, finds an order in which they can lift',
 // round 2b
 '30. The bench card reads clearly, in our own words: by the page’s own stylesheets (read in page order, with the @media blocks that apply and the cascade over the card’s chain of elements), its kicker, heading and text have a contrast of at least 4.5:1 against the card’s own paper, which the card sets itself, in the first-evening journal (the dark panel) and on the Today page, at 1280x800 and at 390x844; its kicker is “FOR THE TWO OF YOU”, and no card says build v36-70429384’s “Something to do together”',
 '31. Out of the pillar corner: lifted just inside the street gate and pushed into the corner by the west pillar until the walls’ sideways help for that contact is spent and the bench has stopped (by the mover alone, and with the turner swinging too), more of the same push gets no more help, and a push the other way backs it out (at least 0.3 m in 2 s) with the yaw exactly as it was and the walls’ help used again: backing out is a new contact',
 '32. Scenery never hides a holder: with the bench in hands in the corner by the street gate’s west pillar, carried through the gate, at corner 1, at the flat door and in the veranda doorway, at 1280x800 and 390x844, every wall or prop mesh that the harness’s own rays from either camera to either holder’s knee, chest and head meet (all but the players, the bench, sprites, what the base already fades, see-through meshes and floors) is faded to at most 0.5 within a second, not only the gate pillars (in the corner the compound wall is one); once the bench is down every faded mesh has its own material back, and blocked() gives the same answers throughout',
 '33. An arrow is placed before it is shown: at 844x390 and 390x844 (touch) and 1280x800, on the frame the mover’s hint, the turner’s hint or the edge arrow first appears it is laid out and placed but hidden, and from the next frame it shows, placed clear of the prompt card'];
// one-place changes to bench-v36.js, each of which must turn its check red
const MUTANTS=[
 {name:'M1 bench36Valid always true',check:5,find:'function bench36Valid(pose,inflate){',replace:'function bench36Valid(pose,inflate){return true;'},
 {name:'M2 the mover’s input also turns the bench',check:3,find:'wT=Lt?Lt.sign*Math.min(1,Math.hypot(ut[0],ut[1]))*B.WMAX*cap:0;',replace:'wT=Lt?Lt.sign*Math.min(1,Math.hypot(ut[0],ut[1]))*B.WMAX*cap:(Lm?Lm.sign*B.WMAX*cap:0);'},
 {name:'M3 bench36Liftable always true',check:6,find:'function bench36Liftable(pose,positions){',replace:'function bench36Liftable(pose,positions){return true;'},
 {name:'M4 the save wrapper passes straight through',check:12,find:'save=function(){try{benchSync36();}catch(e){}return prevSave36.apply(this,arguments);};',replace:'save=function(){return prevSave36.apply(this,arguments);};'},
 {name:'M5 the camera wrapper passes straight through',check:14,find:"if(s==='off'||s==='placed'||B.paused||!Array.isArray(pts)||!players[i])return pts;",replace:'return pts;'},
 {name:'M6a sitStop is never held back',check:13,find:"if(B.state==='seated'&&S&&S.day===B.seatDay&&!B.standing){",replace:'if(false){'},
 {name:'M6b sitStop is held back whenever seated',check:13,find:"if(B.state==='seated'&&S&&S.day===B.seatDay&&!B.standing){",replace:"if(B.state==='seated'){"},
 {name:'M7a no direction latch',check:10,find:'if(L&&ux*L.ref[0]+uz*L.ref[1]>=0)return L;',replace:''},
 {name:'M7b the old exponential easing (rate 8)',check:10,find:'B.vel.s=benchApproach36(B.vel.s,sT,B.V/B.RAMP,B.V/B.STOP,dt);B.vel.w=benchApproach36(B.vel.w,wT,B.WMAX/B.RAMP,B.WMAX/B.STOP,dt);',replace:'B.vel.s+=(sT-B.vel.s)*Math.min(1,8*dt);B.vel.w+=(wT-B.vel.w)*Math.min(1,8*dt);'},
 {name:'M8 arrangement checks not isolated',check:11,find:'BENCH36.override=box;\n try{',replace:' try{'},
 {name:'M9 the hotspot hook also answers for a placed bench',check:16,find:"if(s==='off')return null;const p=players[i];if(!p)return null;",replace:"if(s==='off')return null;const p=players[i];if(!p)return null;if(s==='placed'){const it=benchItem36();if(it&&benchBoxDist36(benchPoseOf36(it.pose36),p.g.position.x,p.g.position.z)<=1.6)return {id:'bench36Sit',label:'Sit on the bench together',dist:0};}"},
 {name:'M10 the walk grid stops at x 6.0 and z 11.0 again, and nobody outside it reaches anything',check:6,find:'const BENCH_GRID36={x0:-8.5,z0:-3.0,s:0.05,nx:361,nz:371,street:[4.0,10.2]};',replace:'const BENCH_GRID36={x0:-8.5,z0:-3.0,s:0.05,nx:291,nz:281,street:[99,99]};'},
 {name:'M11 the step to the stand point outlives a set-down',check:6,find:'B.pose={x:pose.x,z:pose.z,yaw:pose.yaw};B.snap=null;',replace:'B.pose={x:pose.x,z:pose.z,yaw:pose.yaw};'},
 {name:'M12 holders are tested at the walking radius',check:8,find:'HR:0.22,',replace:'HR:0.33,'},
 {name:'M13 a set-down keeps the stall',check:9,find:'function benchUnstick36(){const B=BENCH36;',replace:'function benchUnstick36(){const B=BENCH36;return;'},
 {name:'M14 the glide’s shortcuts are not tested',check:11,find:'const L=(a,b)=>benchPlanSafe36(raw[a],raw[b],boxes,discs);',replace:'const L=(a,b)=>true;'},
 {name:'M15 the funnel turns the bench again',check:19,find:"const q=O.ax==='z'?{x:p.x+dl,z:p.z,yaw:p.yaw}:{x:p.x,z:p.z+dl,yaw:p.yaw};",replace:"const dy=Math.sign(d)*Math.min(Math.abs(d),30*Math.PI/180*dsAbs),q=O.ax==='z'?{x:p.x+dl,z:p.z,yaw:p.yaw+dy}:{x:p.x,z:p.z+dl,yaw:p.yaw+dy};"},
 {name:'M16 no cap on the sideways help a contact',check:19,find:'CAPL:0.15,',replace:'CAPL:99,'},
 {name:'M17 a correction is tested at its end only',check:19,find:'function benchTryG36(p,q,s0){if(!bench36Valid(q))return 0;',replace:'function benchTryG36(p,q,s0){return bench36Valid(q)?1:0;'},
 {name:'M18 no cap on the centre’s step for a refused swing',check:3,find:'CAPS:0.08,',replace:'CAPS:99,'},
 {name:'M19 the sideways help may also turn the bench half a degree',check:3,find:'const q={x:base.x+s*l*n[0],z:base.z+s*l*n[1],yaw:p.yaw},r=',replace:'const q={x:base.x+s*l*n[0],z:base.z+s*l*n[1],yaw:p.yaw+(l===G.LAT?0.5*Math.PI/180:0)},r='},
 {name:'M20 a held Act key repeats again',check:21,find:'if(e&&e.repeat){act[r[0]]=r[1];',replace:'if(e&&e.repeat){'},
 {name:'M21 a blur lets go of the keys but not the carry’s speed',check:22,find:'B.raw=[[0,0],[0,0]];B.latch=[null,null];B.vel.s=0;B.vel.w=0;',replace:'B.raw=[[0,0],[0,0]];B.latch=[null,null];'},
 {name:'M22 the clock stops whenever a delivery is open',check:23,find:"return !B.paused&&(s==='carrying'||s==='choosing'||s==='settling');}",replace:"return !B.paused&&(s==='grounded'||s==='ready'||s==='carrying'||s==='choosing'||s==='settling');}"},
 {name:'M23 the clock also stops while they sit',check:23,find:"return !B.paused&&(s==='carrying'||s==='choosing'||s==='settling');}",replace:"return !B.paused&&(s==='carrying'||s==='choosing'||s==='settling'||s==='seated');}"},
 {name:'M24 the pill is never brought back',check:24,find:'else if(!hide&&B.pillHid){',replace:'else if(false){'},
 {name:'M25 the agree button does not show the agreement',check:26,find:"` aria-pressed=\"${B.agree[i]?'true':'false'}\"`",replace:"' aria-pressed=\"false\"'"},
 {name:'M26 a ghost that is not free keeps the free colour',check:26,find:'col=ok?B.COL.move:B.COL.nofree;',replace:'col=B.COL.move;'},
 {name:'M27 the Find marker outlives the grab',check:27,find:"if(s!=='grounded')benchFindClear36();",replace:''},
 {name:'M28 the companion comes back where the pair left it',check:28,find:'if(q)benchPlace36(i,q[0],q[1]);}',replace:'}'},
 {name:'M29 the switch is not saved, so a reload loses the way back',check:28,find:'L.duo={v:1,ai:!!S.ai,i,',replace:'BENCH36.duo36={v:1,ai:!!S.ai,i,'},
 {name:'M30 a player may take the end the partner needs to get round',check:29,find:'function benchTakeBoxesC36(i,e){',replace:'function benchTakeBoxesC36(i,e){return false;'},
 {name:'M31 a holder who pins the partner never lets go by himself',check:29,find:'B.pinT36+=dt;if(B.pinT36<B.PINWAIT)return;',replace:'return;'},
 {name:'M32 a holder’s body is not in the way',check:29,find:'R=B.HR+PR,R2=R*R;',replace:'R=0,R2=0;'},
 {name:'M33 a holder steps back to the first free point, even beyond the jamb',check:29,find:'benchSlideClear36([x,z],[sx,sz])?[x,z]:benchNudgeSpot36(sx,sz,box);',replace:'true?[x,z]:benchRing36(sx,sz,box);'},
 {name:'M34 “Cook” hides “Take this end” again',check:29,find:"else list.push({id:'bench36Take',label:'Take this end',dist:dd-0.5});",replace:"else list.push({id:'bench36Take',label:'Take this end',dist:dd});"},
 {name:'M35 a cancelled run keeps its first mover',check:12,find:"benchUnkeep36(L);const it=benchItem36();",replace:'const it=benchItem36();'},
 {name:'M36 the reach run walks the whole obstacle list again',check:17,find:'miss=benchReachFast36(()=>TUNE35.reach(',replace:'miss=(f=>f())(()=>TUNE35.reach('},
 {name:'M37 the chooser checks the selected arrangement in the delivery frame again',check:17,find:'B.arrFrame=B.frame;B.heavy=B.frame;benchShowGhost36();',replace:'benchArrNow36(B.choice);benchShowGhost36();'},
 {name:'M38 the ghost’s body is pale again',check:26,find:'o.material.color.set(col);o.material.opacity=0.86;',replace:''},
 // round 3
 {name:'M39 an end counts as reachable without a clear straight step to it',check:6,find:'if(dx*dx+dz*dz<=r2&&benchStepAt36(st[e],i*G.nz+j,x,z)){',replace:'if(dx*dx+dz*dz<=r2){'},
 {name:'M40 the delivery zone ignores the heading',check:20,find:'BENCH36.ZONEA=30*Math.PI/180;',replace:'BENCH36.ZONEA=Math.PI;'},
 {name:'M41 the sideways help turns the bench half a degree while Turn swings',check:3,find:'const q={x:base.x+s*l*n[0],z:base.z+s*l*n[1],yaw:p.yaw},r=',replace:'const q={x:base.x+s*l*n[0],z:base.z+s*l*n[1],yaw:p.yaw+(BENCH36.vel.w?0.5*Math.PI/180:0)},r='},
 {name:'M42 the funnel turns the bench while Turn swings',check:3,find:"const q=O.ax==='z'?{x:p.x+dl,z:p.z,yaw:p.yaw}:{x:p.x,z:p.z+dl,yaw:p.yaw};",replace:"const dy=BENCH36.vel.w?Math.sign(d)*Math.min(Math.abs(d),0.5*dsAbs):0,q=O.ax==='z'?{x:p.x+dl,z:p.z,yaw:p.yaw+dy}:{x:p.x,z:p.z+dl,yaw:p.yaw+dy};"},
 {name:'M43 the turner’s hint always points the same way round',check:9,find:'s=lead*(e[0]*v[0]+e[1]*v[1]);return s<0?-1:1;}',replace:'s=lead*(e[0]*v[0]+e[1]*v[1]);return 1;}'},
 {name:'M44 a stuck bench that cannot be set down is never put back by Act',check:9,find:'function benchPutBack36(){const B=BENCH36,r=B.refused36;return ',replace:'function benchPutBack36(){const B=BENCH36,r=B.refused36;return false&&'},
 {name:'M45 a swing held against the wall never brings the turn aid',check:9,find:'if(B.wHeld36>=1.5){',replace:'if(false){'},
 {name:'M46 the gate pillars never fade',check:9,find:'function benchOccluders36(dt){',replace:'function benchOccluders36(dt){return;'},
 {name:'M47 the stuck line replaces the role on the player card again',check:9,find:'}}   // (round 3, RP-11:',replace:"if(B.stuck&&h>=0&&B.state==='carrying')role.textContent='Stuck? Back up a little, or set it down and swap roles.';}}   // (round 3, RP-11:"},
 {name:'M48 the arrows ignore the prompt card',check:14,find:'function benchClearPos36(i,pt,sz){',replace:'function benchClearPos36(i,pt,sz){return pt;'},
 {name:'M49 a saved arrangement key is taken unchecked',check:12,find:"function benchKey36(k){return typeof k==='string'&&",replace:"function benchKey36(k){return k||null;return typeof k==='string'&&"},
 {name:'M50 Find leaves no destination behind',check:27,find:'LIFE34.waypoint=drop?null:prev;',replace:'LIFE34.waypoint=null;'},
 {name:'M51 the first-evening journal has no bench card',check:25,find:'if(typeof html===\'string\'&&html.indexOf(\'<div class="evening33">\')===0){',replace:'if(false){'},
 {name:'M52 a player waits for the companion at the bench',check:28,find:"if(near||!((typeof AI!=='undefined'&&AI.on)||",replace:"if(true||!((typeof AI!=='undefined'&&AI.on)||"},
 {name:'M53 a holder with no room is reported as boxed in',check:9,find:'function benchRefuseText36(pose,P){if(!P.pos){',replace:'function benchRefuseText36(pose,P){if(!P.pos)P={pos:[benchPos36(0),benchPos36(1)]};if(!P.pos){'},
 // round 2b
 {name:'M54 the street gate is not an opening',check:19,find:"{n:'street gate',ax:'z',c:4.0,yaw:Math.PI/2,r:[3.0,5.0,4.6,7.6]}]};",replace:']};'},
 {name:'M55 the street gate typed 6 cm off its walls',check:19,find:"{n:'street gate',ax:'z',c:4.0,",replace:"{n:'street gate',ax:'z',c:4.06,"},
 {name:'M56 a push the other way is no new contact',check:31,find:'if(A.sd&&A.sd!==sg&&(A.lat||A.sw)){A.lat=0;A.sw=0;}',replace:''},
 {name:'M57 only the gate pillars fade again',check:32,find:'out.list.push(m);out.box.push(bb.clone());',replace:'if(k>=0){out.list.push(m);out.box.push(bb.clone());}'},
 {name:'M58 an arrow shows on its first frame',check:33,find:'const first=show&&B.arrowVis36[i]!==cls;',replace:'const first=false;'}];

// a copy of dist with index.html changed by htmlFn and bench-v36.js by benchFn (everything else linked)
function variantDir(htmlFn,benchFn){const d=fs.mkdtempSync(path.join(os.tmpdir(),'cd36-bench-'));
 for(const f of ['assets','data'])if(fs.existsSync(path.join(GAME,f)))fs.symlinkSync(path.join(GAME,f),path.join(d,f));
 fs.mkdirSync(path.join(d,'src'));for(const f of fs.readdirSync(path.join(GAME,'src'))){if(f==='bench-v36.js'&&benchFn){fs.writeFileSync(path.join(d,'src',f),benchFn(fs.readFileSync(path.join(GAME,'src',f),'utf8')));continue;}fs.symlinkSync(path.join(GAME,'src',f),path.join(d,'src',f));}
 fs.writeFileSync(path.join(d,'index.html'),htmlFn?htmlFn(fs.readFileSync(path.join(GAME,'index.html'),'utf8')):fs.readFileSync(path.join(GAME,'index.html'),'utf8'));return d;}
const BENCH_TAG=/<script[^>]*src="(?:\.\/)?src\/bench-v36\.js"><\/script>\n?/;

// the world every in-process check uses (the same one tools/bench-route-v36.cjs plans in), plus the harness helpers inside the game
async function world(){const {benchWorld}=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));const h=await benchWorld();const {run,context}=h;
 const store=new Map();context.sessionStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 run("var PH='',TOASTS=[];{const o=openPanel;openPanel=function(h){if(!silentMode())PH=h;return o(h);};const t=toast;toast=function(m){if(!silentMode())TOASTS.push(m);return t(m);};}");
 run("var OVC36=ov.classList.contains;var overlayOn36=on=>{ov.classList.contains=on?(c=>c==='on'):OVC36;};");
 run(`var KEYS36=[{up:'w',down:'s',left:'a',right:'d'},{up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'}];
 var setKeys36=(i,dir)=>{const K=KEYS36[i];keys[K.up]=keys[K.down]=keys[K.left]=keys[K.right]=false;if(!dir)return;if(dir[0]<0)keys[K.left]=true;if(dir[0]>0)keys[K.right]=true;if(dir[1]<0)keys[K.up]=true;if(dir[1]>0)keys[K.down]=true;};
 var noKeys36=()=>{setKeys36(0,null);setKeys36(1,null);};
 var rawOf36=(x,z)=>{const fl=Math.hypot(CAM_DIR.x,CAM_DIR.z),fx=-CAM_DIR.x/fl,fz=-CAM_DIR.z/fl,n=Math.hypot(x,z)||1;return [(x*(-fz)-z*fx)/n,(x*fx-z*fz)/n];};
 var combo36=(wx,wz)=>{let best=null,bd=-2;for(const x of [-1,0,1])for(const z of [-1,0,1]){if(!x&&!z)continue;const v=rawOf36(x,z),d=(v[0]*wx+v[1]*wz)/Math.hypot(wx,wz);if(d>bd){bd=d;best=[x,z];}}return best;};
 var at36=(i,x,z)=>{const p=players[i];p.g.position.set(x,0,z);p.prev=[x,z];p.y=0;p.lvl=0;p.g.baseY=0;};
 var pos36=i=>[players[i].g.position.x,players[i].g.position.z];
 var press36=i=>{act[i]=true;lastInput[i]='key';};
 var FT36=0,DT36=1000/30,ONF36=null;
 var frames36=n=>{const rf=renderFrame;renderFrame=function(){};try{for(let k=0;k<n;k++){T35+=DT36;PERF35+=DT36;last=FT36;FT36+=DT36;tick(FT36);if(ONF36)ONF36();}}finally{renderFrame=rf;}};
 var screen36=(w,h,touch)=>{innerWidth=w;innerHeight=h;navigator.maxTouchPoints=touch?1:0;for(let i=0;i<2;i++){const vp=v21Viewport(i);cams[i].aspect=vp.w/vp.h;cams[i].updateProjectionMatrix();}};
 var R36=(()=>{let s=1;return {seed(v){s=(v>>>0)||1;},next(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;}};})();
 var fresh36=()=>{NET.on=false;AI.on=false;_silent=false;ONF36=(typeof WALL36!=='undefined'&&WALL36.on)?wallsFrame36:null;noKeys36();overlayOn36(false);BENCH36.flags=null;location.search='';DT36=1000/30;
  dispatch('newgame');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupstep',{v:'p0'});dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();
  sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();screen36(1280,800,false);frames36(2);PH='';TOASTS=[];};
 var start36=()=>{ACTIONS.bench36Start();ACTIONS.close();return BENCH36.state;};
 // the mover stands at the end that leads (the plan's start says which), the turner at the other; both take with their own Act key
 // a free standing spot by end e of pose P: on the axis from 1.1 m out, else the nearest free point round it
 var endSpot36=(P,e)=>{for(let t=1.1;t<=1.6;t+=0.05){const q=benchEnd36(P,e,t);if(!blocked(q[0],q[1],PR,{noBench:true}))return q;}const c=benchEnd36(P,e,1.1);
  for(let r=0.1;r<=0.8;r+=0.1)for(let k=0;k<16;k++){const x=c[0]+Math.sin(k/16*Math.PI*2)*r,z=c[1]+Math.cos(k/16*Math.PI*2)*r;if(!blocked(x,z,PR,{noBench:true})&&!bench36CircleOBB(x,z,PR,benchBox36(P,0)))return [x,z];}return c;};
 var atEnds36=P=>{const a=endSpot36(P,0),b=endSpot36(P,1);at36(0,a[0],a[1]);at36(1,b[0],b[1]);};
 var takeEnds36=(fe,mover)=>{const p=BENCH36.pose,f=benchEnd36(p,fe,1.1),r=benchEnd36(p,1-fe,1.1),m=mover===undefined?0:mover;at36(m,f[0],f[1]);at36(1-m,r[0],r[1]);frames36(2);};
 var lift36=(first,second)=>{press36(first);frames36(3);press36(second);frames36(3);return BENCH36.state;};
 // reload through the save (a saved game edited as a test fixture): the module's own load rule runs
 var reload36=()=>{save();S=load();enterWorld();closePanel();frames36(1);};
 var loadFixture36=fn=>{const o=JSON.parse(JSON.stringify(S));fn(o);localStorage.setItem(KEY,JSON.stringify(o));S=load();enterWorld();closePanel();frames36(1);};
 // (the live delivery is torn down first: otherwise the save wrapper writes the live pose over the fixture before it is saved)
 var loadAt36=(x,z,deg,extra)=>{benchTeardown36();life34();S.life.bench36=Object.assign({v:1,state:'grounded',pos:[x,z],yaw:deg*Math.PI/180,mover:0,choice:'out',deliveries:0,again:false,hints:2,placedDay:null,playtest:false,runs:[]},extra||{});save();S=load();enterWorld();closePanel();frames36(1);};`);
 // the plan follower: one frame of keys for the role each segment needs, closed loop on the pose (0.012 m / 0.6 degrees), drift corrected by short taps
 run(`var FOL36={k:0,zeroT:false,zeroM:false,o:null};
 var follow36=plan=>{const B=BENCH36;if(B.state!=='carrying'){noKeys36();return 'idle';}
  const seg=plan.segments[FOL36.k];if(!seg){noKeys36();return 'done';}
  // the bench is the same box either way round: at each segment start the plan's yaw is matched to the bench's axis (offset 0 or 180 degrees,
  // whichever end leads now), and the turn then goes the plan's way
  const f=B.front?1:-1,T=seg.until,wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
  // (round 2b) the offset is the one that puts the bench's yaw on the segment's arc, from the previous segment's yaw to this one's (or nearest
  // to it): a turn of more than 90 degrees set down past its middle is still recognised the right way round
  if(FOL36.o===null){const prev=(FOL36.k>0?plan.segments[FOL36.k-1].until.yaw:plan.start.yaw)*Math.PI/180,to=T.yaw*Math.PI/180;
   const arcD=o=>{const a=prev+o,span=wrap(to-prev),d=wrap(B.pose.yaw-a);if(Math.abs(span)>1e-9&&Math.sign(d)===Math.sign(span)&&Math.abs(d)<=Math.abs(span))return 0;return Math.min(Math.abs(d),Math.abs(wrap(B.pose.yaw-(to+o))));};
   FOL36.o=arcD(Math.PI)<arcD(0)?Math.PI:0;}
  const tT=T.yaw*Math.PI/180+FOL36.o;
  const m=B.mover,t=1-m;let mDir=null,tDir=null;const ux=Math.cos(tT),uz=-Math.sin(tT),e=[Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f];
  const dth=wrap(tT-B.pose.yaw),coastW=B.vel.w*B.vel.w/(2*B.WMAX/B.STOP)+Math.abs(B.vel.w)*DT36/1000;
  if(seg.op==='fwd'||seg.op==='back'){const r=(T.x-B.pose.x)*ux+(T.z-B.pose.z)*uz,coast=B.vel.s*B.vel.s/(2*B.V/B.STOP)+Math.abs(B.vel.s)*DT36/1000,ct=-(T.x-B.pose.x)*uz+(T.z-B.pose.z)*ux;
   if(Math.abs(r)<=0.012){FOL36.k++;FOL36.o=null;}else if(Math.abs(r)>coast+0.004)mDir=[ux*Math.sign(r),uz*Math.sign(r)];
   const want=wrap(dth-Math.max(-0.05,Math.min(0.05,ct*2*Math.sign(r||1))));if(Math.abs(want)>0.004&&Math.abs(want)>coastW+0.002)tDir=[e[0]*Math.sign(want),e[1]*Math.sign(want)];}
  else{if(Math.abs(dth)<=0.6*Math.PI/180){FOL36.k++;FOL36.o=null;}else if(Math.abs(dth)>coastW+0.002)tDir=[e[0]*Math.sign(dth),e[1]*Math.sign(dth)];}
  if(FOL36.zeroM)mDir=null;if(FOL36.zeroT)tDir=null;
  setKeys36(m,mDir?combo36(mDir[0],mDir[1]):null);setKeys36(t,tDir?combo36(tDir[0],tDir[1]):null);return 'go';};
 // drive the plan for at most n frames; stop(k) may pause at a segment index (returns true to stop)
 var drive36=(plan,n,stop)=>{let r='go',f=0;for(;f<n;f++){if(stop&&stop(FOL36.k,f)){noKeys36();return {r:'stop',f};}r=follow36(plan);frames36(1);if(r!=='go'&&BENCH36.state!=='carrying')break;}noKeys36();return {r,f};};`);
 // the independent wall test (its own box list and separating-axis test: the boxes blocked() tests at level 0, the walls and stairs, furniture,
 // the crate, the loose sofa and the pushables), and the harness's own walk (from blocked() only)
 run(`var WALL36={n:0,bad:[],hold:0,raised:0,snap:0,sweep:0,settle:0,settleBad:[],dissolve:0,dissolveBad:0,on:false,prev:null,gprev:null};
 var hbBoxes36=(x,z,R)=>{const out=[],near=o=>o.x2>x-R&&o.x1<x+R&&o.z2>z-R&&o.z1<z+R;for(const o of OBS){const l=o.lvl||0;if((l===0||l===2)&&near(o))out.push(o);}for(const o of FURN_OBS)if(near(o))out.push(o);
  if(crate){const c=crateBox();if(near(c))out.push(c);}if(sofa&&sofa.g.visible&&!sofa.carrying){const c=sofaBox();if(near(c))out.push(c);}for(const pb of PUSH){if(pb.lvl!==0||pb.gone)continue;const c=pushBox(pb);if(near(c))out.push(c);}return out;};
 var hbHit36=(p,hx,hz,list)=>{const ux=Math.cos(p.yaw),uz=-Math.sin(p.yaw),nx=Math.sin(p.yaw),nz=Math.cos(p.yaw);for(const b of list){const bx=(b.x2-b.x1)/2,bz=(b.z2-b.z1)/2,dx=(b.x1+b.x2)/2-p.x,dz=(b.z1+b.z2)/2-p.z;
   if(Math.abs(dx)>=bx+Math.abs(ux)*hx+Math.abs(nx)*hz||Math.abs(dz)>=bz+Math.abs(uz)*hx+Math.abs(nz)*hz)continue;
   if(Math.abs(dx*ux+dz*uz)>=hx+bx*Math.abs(ux)+bz*Math.abs(uz)||Math.abs(dx*nx+dz*nz)>=hz+bx*Math.abs(nx)+bz*Math.abs(nz))continue;return b;}return null;};
 // how far (m) the bench box at p is into something: 0 when clear
 var hbDepth36=p=>{const list=hbBoxes36(p.x,p.z,1.2);if(!hbHit36(p,0.76,0.26,list))return 0;let lo=0,hi=0.26;for(let k=0;k<16;k++){const m=(lo+hi)/2;if(hbHit36(p,0.76-m,0.26-m,list))lo=m;else hi=m;}return hi;};
 // the deepest point of a straight move between two poses, sampled so no point of the box moves more than 2 mm between samples
 var hbSweep36=(a,b)=>{let dy=b.yaw-a.yaw;while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;const n=Math.max(1,Math.ceil((Math.hypot(b.x-a.x,b.z-a.z)+0.81*Math.abs(dy))/0.002));let worst=0;
  for(let k=1;k<n;k++){const t=k/n,d=hbDepth36({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:a.yaw+dy*t});if(d>worst)worst=d;}return worst;};
 var POTL36=[-5.845,-5.355,6.385,6.875];
 var wallsFrame36=()=>{const B=BENCH36,s=B.state;if(B.paused){WALL36.prev=null;return;}const P={x:B.pose.x,z:B.pose.z,yaw:B.pose.yaw};
  if(s==='grounded'||s==='ready'||s==='carrying'||s==='choosing'){WALL36.n++;const d=hbDepth36(P);if(d>0&&WALL36.bad.length<5)WALL36.bad.push([s,+P.x.toFixed(3),+P.z.toFixed(3),+(P.yaw*180/Math.PI).toFixed(1),+(d*1000).toFixed(2)]);
   // between frames (a carried move is up to two sub-steps; it may graze to within a tenth of a millimetre after the bisection to contact)
   if(WALL36.prev&&s==='carrying'){const w=hbSweep36(WALL36.prev,P);WALL36.sweep=Math.max(WALL36.sweep,w);}
   if(s==='carrying')for(const i of B.holder){const q=pos36(i);if(blocked(q[0],q[1],B.HR-0.002,{noBench:true}))WALL36.hold++;if(levelAt(q[0],q[1])>=0.5)WALL36.raised++;}
   // a player stepping to a stand point never passes through a wall
   if(B.snap){const q=pos36(B.snap.i);if(blocked(q[0],q[1],B.HR-0.002,{noBench:true}))WALL36.snap++;}
   WALL36.prev=s==='carrying'?P:null;}else WALL36.prev=null;
  if(s==='settling'&&B.settle&&B.settle.kind!=='plan'){const st=B.settle;
   if(st.kind==='go'){if(st.step&&st.step.glide){WALL36.settle++;let r=null;const d=hbDepth36(P);if(d>0)r=['wall',+(d*1000).toFixed(3),+P.x.toFixed(3),+P.z.toFixed(3)];
     if(!r&&WALL36.gprev){const w=hbSweep36(WALL36.gprev,P);if(w>0)r=['between',+(w*1000).toFixed(3),+P.x.toFixed(3),+P.z.toFixed(3)];}
     const c=Math.cos(P.yaw),sn=Math.sin(P.yaw);
     if(!r){for(let a=-0.75;a<=0.751&&!r;a+=0.05)for(let b=-0.25;b<=0.251;b+=0.05){const x=P.x+a*c+b*sn,z=P.z-a*sn+b*c;if(x>POTL36[0]&&x<POTL36[1]&&z>POTL36[2]&&z<POTL36[3]){r=['pot',x,z];break;}}}
     if(!r)for(const i of [0,1]){const q=pos36(i),bx={x:P.x,z:P.z,yaw:P.yaw,hx:0.76,hz:0.26};if(bench36CircleOBB(q[0],q[1],PR-0.005,bx)){r=['player',i];break;}}
     if(r&&WALL36.settleBad.length<5)WALL36.settleBad.push(r);WALL36.gprev=P;}else WALL36.gprev=null;}
   else{WALL36.dissolve++;const same=(a,b)=>Math.abs(a.x-b.x)<1e-9&&Math.abs(a.z-b.z)<1e-9&&Math.abs(a.yaw-b.yaw)<1e-9;if(!same(B.pose,st.from)&&!same(B.pose,st.to))WALL36.dissolveBad++;}}
  else WALL36.gprev=null;};
 // the harness's own walk grid: x -8.5..9.5, z -3..15.5 at 0.05 m from blocked() at PR; anyone outside it starts from the street (4.0, 10.2)
 var HB36={g:null,sig:'',X0:-8.5,Z0:-3,S0:0.05,NX:361,NZ:371};
 var hbGrid36=()=>{const sig=crate.position.x+','+crate.position.z+'|'+FURN_OBS.map(o=>o.x1+','+o.z1).join(';')+'|'+PUSH.map(p=>p.gone?'-':p.g.position.x+','+p.g.position.z).join(';');if(HB36.sig===sig)return HB36.g;
  const {X0,Z0,S0,NX,NZ}=HB36,g=new Uint8Array(NX*NZ);for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++)if(blocked(X0+i*S0,Z0+j*S0,PR,{noBench:true}))g[i*NZ+j]=1;HB36.g=g;HB36.sig=sig;return g;};
 var hbInBox36=(x,z,r,p)=>{const c=Math.cos(p.yaw),s=Math.sin(p.yaw),dx=x-p.x,dz=z-p.z,lx=dx*c-dz*s,lz=dx*s+dz*c,ox=Math.max(0,Math.abs(lx)-0.76),oz=Math.max(0,Math.abs(lz)-0.26);return ox*ox+oz*oz<r*r;};
 // the harness's own straight step (round 3, H1): from a cell to a stand point, blocked() at the holder's 0.22 m every 2 cm, as a player's step is
 var HBS36=new Map();
 var hbStep36=(x,z,ex,ez)=>{const k=x+','+z+'>'+ex+','+ez+'|'+HB36.sig;if(HBS36.has(k))return HBS36.get(k);if(HBS36.size>200000)HBS36.clear();const n=Math.max(1,Math.ceil(Math.hypot(ex-x,ez-z)/0.02));let ok=true;
  for(let s=1;s<=n&&ok;s++){const t=s/n;if(blocked(x+(ex-x)*t,z+(ez-z)*t,0.22,{noBench:true}))ok=false;}HBS36.set(k,ok);return ok;};
 var hbSig36=()=>crate.position.x+','+crate.position.z+'|'+FURN_OBS.map(o=>o.x1+','+o.z1).join(';')+'|'+PUSH.map(p=>p.gone?'-':p.g.position.x+','+p.g.position.z).join(';');
 var hbEnds36=p=>{const ax=Math.cos(p.yaw),az=-Math.sin(p.yaw);return [[p.x-ax*0.9,p.z-az*0.9],[p.x+ax*0.9,p.z+az*0.9]];};
 // the walk grid with the bench at p, and with a holder's body (0.22 + 0.33 m) at stand point h
 var hbWith36=p=>{const {X0,Z0,S0,NX,NZ}=HB36,g=hbGrid36().slice();for(let i=0;i<NX;i++){const x=X0+i*S0;if(Math.abs(x-p.x)>1.2)continue;for(let j=0;j<NZ;j++){const z=Z0+j*S0;if(Math.abs(z-p.z)>1.2)continue;if(hbInBox36(x,z,PR,p))g[i*NZ+j]=1;}}return g;};
 var hbHeldG36=(g,h)=>{const {X0,Z0,S0,NX,NZ}=HB36,R=0.55,w=g.slice(),[hx,hz]=h;for(let i=Math.floor((hx-R-X0)/S0);i<=Math.ceil((hx+R-X0)/S0);i++)for(let j=Math.floor((hz-R-Z0)/S0);j<=Math.ceil((hz+R-Z0)/S0);j++){if(i<0||j<0||i>=NX||j>=NZ)continue;if(Math.hypot(X0+i*S0-hx,Z0+j*S0-hz)<R)w[i*NZ+j]=1;}return w;};
 // someone standing in a holder's body starts from its edge, on their own side
 var hbOut36=(q,h,p,e)=>{const R=0.55,[hx,hz]=h,d=Math.hypot(q[0]-hx,q[1]-hz);if(d>=R+0.05)return q;if(d<1e-6){const ax=Math.cos(p.yaw),az=-Math.sin(p.yaw),sg=e?1:-1;return [hx+ax*sg*(R+0.05),hz+az*sg*(R+0.05)];}return [hx+(q[0]-hx)/d*(R+0.05),hz+(q[1]-hz)/d*(R+0.05)];};
 // the cells a player at q walks to on g (from the nearest free cell within 0.35 m; from the street when outside the grid)
 var hbSeen36=(q,g)=>{const {X0,Z0,S0,NX,NZ}=HB36,seen=new Uint8Array(NX*NZ);let si=Math.round((q[0]-X0)/S0),sj=Math.round((q[1]-Z0)/S0);if(si<0||sj<0||si>=NX||sj>=NZ){si=Math.round((4.0-X0)/S0);sj=Math.round((10.2-Z0)/S0);}let s=-1,bd=1e9;for(let a=-7;a<=7;a++)for(let b=-7;b<=7;b++){const i=si+a,j=sj+b;if(i<0||j<0||i>=NX||j>=NZ||g[i*NZ+j])continue;if(a*a+b*b<bd&&a*a+b*b<=49){bd=a*a+b*b;s=i*NZ+j;}}
  if(s<0)return seen;const Q=[s];seen[s]=1;for(let h=0;h<Q.length;h++){const n=Q[h],i=(n/NZ)|0,j=n-i*NZ;for(const m of [i>0?n-NZ:-1,i<NX-1?n+NZ:-1,j>0?n-1:-1,j<NZ-1?n+1:-1])if(m>=0&&!seen[m]&&!g[m]){seen[m]=1;Q.push(m);}}return seen;};
 // the nearest walked-to cell within 0.8 m of stand point E from which the straight step to E is clear, or null
 var hbCell36=(seen,E)=>{const {X0,Z0,S0,NX,NZ}=HB36,[ex,ez]=E,c=[];for(let i=Math.floor((ex-0.8-X0)/S0);i<=Math.ceil((ex+0.8-X0)/S0);i++)for(let j=Math.floor((ez-0.8-Z0)/S0);j<=Math.ceil((ez+0.8-Z0)/S0);j++){if(i<0||j<0||i>=NX||j>=NZ)continue;const n=i*NZ+j,d=Math.hypot(X0+i*S0-ex,Z0+j*S0-ez);if(seen[n]&&d<=0.8)c.push([d,X0+i*S0,Z0+j*S0]);}
  c.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);for(const [,x,z] of c)if(hbStep36(x,z,ex,ez))return [x,z];return null;};
 var hbMatch36=(p,pos)=>{const ends=hbEnds36(p);for(const [x,z] of ends)if(blocked(x,z,BENCH36.HR,{noBench:true})||!carryLevelOK34(x,z))return false;
  const g=hbWith36(p),reach=(q,w)=>{const seen=hbSeen36(q,w);return ends.map(E=>!!hbCell36(seen,E));};
  const r0=reach(pos[0],g),r1=reach(pos[1],g);if(!((r0[0]&&r1[1])||(r0[1]&&r1[0])))return false;
  // and an order: the first to take an end stands at it (a body of 0.22 + 0.33 m the other does not walk through), and the other still
  // reaches theirs (someone standing in that body starts from its edge on their own side)
  const H=[hbHeldG36(g,ends[0]),hbHeldG36(g,ends[1])],r=[r0,r1];
  for(const m of [[0,1],[1,0]]){if(!(r[0][m[0]]&&r[1][m[1]]))continue;for(const f of [0,1]){const t=1-f;if(reach(hbOut36(pos[t],ends[m[f]],p,m[f]),H[m[f]])[m[t]])return true;}}
  return false;};
 // the harness lifts it for real (round 3, H1): in an order, each player walks (is placed) to the nearest cell of their end from which the step is
 // clear, as the harness's own walk finds it, and presses Act; returns the order, or what went wrong in each
 var hbLetGo36=()=>{const B=BENCH36;if(B.state!=='ready')return true;const i=B.holder[0]!==null?B.holder[0]:B.holder[1],q=pos36(i);setKeys36(i,combo36(q[0]-B.pose.x,q[1]-B.pose.z));frames36(16);noKeys36();frames36(2);return B.state!=='ready';};
 var hbLift36=()=>{const B=BENCH36;if(B.state!=='grounded')return {ok:false,tries:['state '+B.state]};const keep=[pos36(0),pos36(1)],P={x:B.pose.x,z:B.pose.z,yaw:B.pose.yaw},ends=hbEnds36(P),g=hbWith36(P),tries=[];
  for(const [f,e] of [[0,0],[0,1],[1,0],[1,1]]){const s=1-f;if(!hbLetGo36()){tries.push([f,e,'could not let go']);break;}at36(0,keep[0][0],keep[0][1]);at36(1,keep[1][0],keep[1][1]);frames36(1);
   const a=hbCell36(hbSeen36(keep[f],g),ends[e]);if(!a){tries.push([f,e,'first: no clear step']);continue;}at36(f,a[0],a[1]);frames36(1);press36(f);frames36(4);
   if(B.state!=='ready'||B.holder[e]!==f){tries.push([f,e,'first refused: '+(TOASTS.slice(-1)[0]||'')]);continue;}
   const b=hbCell36(hbSeen36(hbOut36(keep[s],ends[e],P,e),hbHeldG36(g,ends[e])),ends[1-e]);if(!b){tries.push([f,e,'second: no clear step']);continue;}at36(s,b[0],b[1]);frames36(1);press36(s);frames36(5);
   if(B.state==='carrying')return {ok:true,order:[f,e],tries};tries.push([f,e,'second refused: '+(TOASTS.slice(-1)[0]||'')]);}
  hbLetGo36();if(B.state==='grounded'){at36(0,keep[0][0],keep[0][1]);at36(1,keep[1][0],keep[1][1]);frames36(1);}return {ok:false,tries};};`);
 // the lone player (checks 3 and 20, after the judge's solo tool): a pose is lifted where asked (or at the nearest of a few nudges round it),
 // then ONE player acts for 120 s by keys only while the other holds their end and presses nothing
 run(`var REG36=(x,z)=>z>6.1?'street':(x>-2.35&&x<0.9&&z>2.9&&z<5.85)||(x>-2.35&&x<-1.15&&z>1.5&&z<5.85)?'passage':x<=-2.35&&z>2&&z<5.6?'room':x<=-2.35&&z>=5.6?'veranda':'courtyard';
 var NUDGE36=[[0,0],[0.1,0],[-0.1,0],[0,0.1],[0,-0.1],[0.2,0],[-0.2,0],[0,0.2],[0,-0.2],[0.15,0.15],[-0.15,0.15],[0.15,-0.15],[-0.15,-0.15],[0.3,0],[-0.3,0],[0,0.3],[0,-0.3]];
 // lift a bench loaded at (x, z, deg) or at the first nudge that loads where asked and lifts; returns the pose it was lifted at, or null
 var liftAt36=(x,z,deg,nudges)=>{for(const [ox,oz] of (nudges||NUDGE36)){const X=x+ox,Z=z+oz,P={x:X,z:Z,yaw:deg*Math.PI/180};fresh36();start36();atEnds36(P);loadAt36(X,Z,deg);
   const g=bench36Pose();if(Math.abs(g.x-X)>1e-9||Math.abs(g.z-Z)>1e-9||Math.abs(g.yaw-P.yaw)>1e-9)continue;noKeys36();press36(0);frames36(3);press36(1);frames36(4);if(BENCH36.state==='carrying')return [X,Z,deg];}return null;};
 var SOLOP36={'by the gate 25° off':[3.9,7.1,120],'by the gate 45° off':[3.9,7.1,140],'inside the gate 40° off':[3.6,5.0,135],'corner 1 half-turned':[-1.0,0.95,215],
  'passage mouth 30° off':[-1.65,1.0,240],'passage mouth 15° off':[-1.65,1.0,255],'flat door 20° off':[-2.0,4.9,200],'veranda doorway 15° off':[-4.1,4.85,255],
  'room 25° off the doorway':[-3.70,4.75,65],'room 45° off the doorway':[-3.70,4.75,45]};
 var soloRun36=(name,pat)=>{const [x,z,deg]=SOLOP36[name],at=liftAt36(x,z,deg);if(!at)return {name,pat,err:'not lifted'};const B=BENCH36,p0=bench36Pose(),leak0=B.yawLeak,as0=B.cost.assist+B.cost.funnel;
  R36.seed(Math.round(x*100+z*10+deg));let ymax=0,dmax=0,ph=0,phT=0,s0=null,dir=null,reg=[REG36(p0.x,p0.z)],cross=[],chose=false;
  for(let f=0;f<3600;f++){if(B.state!=='carrying')break;const m=B.mover,t=1-m,a=benchAxis36(B.pose.yaw),fs=B.front?1:-1;
   if(pat.startsWith('ratchet')){const sg=pat.endsWith('+')?1:-1;      // push along the bench for up to 1.5 s or until it stops, then back off 0.35 m
    if(ph===0){setKeys36(m,combo36(a[0]*fs*sg,a[1]*fs*sg));phT++;if(phT>45||(phT>8&&!B.movedPrev)){ph=1;phT=0;s0=[B.pose.x,B.pose.z];}}
    else{setKeys36(m,combo36(-a[0]*fs*sg,-a[1]*fs*sg));phT++;if(Math.hypot(B.pose.x-s0[0],B.pose.z-s0[1])>=0.35||phT>30){ph=0;phT=0;}}setKeys36(t,null);}
   else{if(f%6===0){const r=R36.next();dir=r<0.15?null:[Math.floor(R36.next()*3)-1,Math.floor(R36.next()*3)-1];if(dir&&!dir[0]&&!dir[1])dir=null;}
    const who=pat==='turner-random'?t:m;setKeys36(who,dir);setKeys36(1-who,null);}
   frames36(1);const q=B.pose,dy=Math.abs(benchWrapA36(q.yaw-p0.yaw));if(dy>ymax)ymax=dy;dmax=Math.max(dmax,Math.hypot(q.x-p0.x,q.z-p0.z));
   const rg=REG36(q.x,q.z);if(!reg.includes(rg)){reg.push(rg);cross.push(+(q.yaw*180/Math.PI).toFixed(1));}if(B.state==='choosing')chose=true;}
  noKeys36();const p=bench36Pose(),st=B.state;if(st==='choosing'){ACTIONS.bench36RoomDown();frames36(2);}
  return {name,pat,at,yawMax:ymax,moved:+dmax.toFixed(4),movedRaw:dmax,regions:reg,cross,chose,leak:B.yawLeak-leak0,assisted:B.cost.assist+B.cost.funnel-as0,end:[+p.x.toFixed(2),+p.z.toFixed(2),+(p.yaw*180/Math.PI).toFixed(1)],state:st};};`);
 // check 19: the openings by the harness's own box list (a point is free when no box holds it strictly), and a push by the mover's keys alone
 run(`var OPEN19=[{n:'passage',ax:'z',c:-1.75,s:2.3},{n:'flat door',ax:'x',c:4.9,s:-2.475},{n:'veranda doorway',ax:'z',c:-4.1,s:5.725},{n:'street gate',ax:'z',c:4.0,s:5.98}];
 var hbGap36=O=>{const free=v=>{const x=O.ax==='z'?v:O.s,z=O.ax==='z'?O.s:v;for(const b of hbBoxes36(x,z,0.05))if(x>b.x1&&x<b.x2&&z>b.z1&&z<b.z2)return false;return true;};
  const edge=dir=>{let a=0,b=0.02;while(free(O.c+dir*b)&&b<1.5){a=b;b+=0.02;}for(let k=0;k<20;k++){const m=(a+b)/2;if(free(O.c+dir*m))a=m;else b=m;}return O.c+dir*(a+b)/2;};
  const lo=edge(-1),hi=edge(1);return {lo,hi,c:(lo+hi)/2,w:hi-lo};};
 // lift at (x, z, deg) (nudged along the opening's axis only), the mover holds a key towards world direction dir for n frames (or until the
 // centre has gone far), then lets go
 var push19=(x,z,deg,dir,n,ax,far)=>{const nud=[0,0.05,-0.05,0.1,-0.1,0.15,-0.15].map(d=>ax==='z'?[0,d]:[d,0]);const at=liftAt36(x,z,deg,nud);if(!at)return {err:'not lifted'};
  const B=BENCH36,p0=bench36Pose(),c0=[B.cost.assist,B.cost.funnel],leak0=B.yawLeak;setKeys36(B.mover,combo36(dir[0],dir[1]));for(let k=0;k<n&&!(far&&Math.hypot(B.pose.x-p0.x,B.pose.z-p0.z)>=far);k++)frames36(1);noKeys36();frames36(8);const p1=bench36Pose();
  const a=benchAxis36(p0.yaw),nn=[Math.sin(p0.yaw),Math.cos(p0.yaw)],dx=p1.x-p0.x,dz=p1.z-p0.z;
  // the move split into the mover's slide along the bench (s) and a sideways shift across the opening (D, along world x or z)
  const e=ax==='z'?[1,0]:[0,1],en=e[0]*nn[0]+e[1]*nn[1],D=(dx*nn[0]+dz*nn[1])/en,sl=(dx-D*e[0])*a[0]+(dz-D*e[1])*a[1];
  return {at,p0,p1,along:dx*a[0]+dz*a[1],perp:dx*nn[0]+dz*nn[1],slide:sl,shift:D,assist:B.cost.assist-c0[0],funnel:B.cost.funnel-c0[1],leak:B.yawLeak-leak0,state:B.state};};`);
 // the page's key, focus and visibility listeners (checks 21 and 22): Node's addEventListener does nothing, so the base game's own keydown and
 // keyup lines (read from index.html) and the module's list (BENCH36.listeners, when there is one) are registered again into a recorder in page
 // order, and fire36 calls them as the browser would: capture listeners first, then the others in the order they were added
 {const lines=fs.readFileSync(path.join(GAME,'index.html'),'utf8').split('\n').map(l=>l.trim()).filter(l=>/^window\.addEventListener\('key(down|up)',e=>\{/.test(l));
  run('var EV36={window:[],document:[]};');
  for(const l of lines)run(`{const keep=window.addEventListener;window.addEventListener=(t,f,c)=>EV36.window.push([t,f,c===true||!!(c&&c.capture)]);try{${l}}finally{window.addEventListener=keep;}}`);
  run(`if(typeof BENCH36!=='undefined'&&Array.isArray(BENCH36.listeners))for(const [tg,t,f,c] of BENCH36.listeners)EV36[tg].push([t,f,!!c]);
   var fire36=(tg,type,ev)=>{ev=Object.assign({type,repeat:false,preventDefault(){},stopPropagation(){}},ev||{});const L=EV36[tg].filter(x=>x[0]===type);for(const x of L)if(x[2])x[1](ev);for(const x of L)if(!x[2])x[1](ev);return true;};
   var keyAct36=(i,repeat)=>fire36('window','keydown',{key:i?'Enter':'e',repeat:!!repeat}),keyUp36=i=>fire36('window','keyup',{key:i?'Enter':'e'});
   var chooserAt36=extra=>{benchTeardown36();life34();S.life.bench36=Object.assign({v:1,state:'choosing',pos:[-4.0166,5.0218],yaw:4.5307,mover:0,choice:'out',deliveries:0,again:false,hints:2,placedDay:null,playtest:false,runs:[]},extra||{});at36(0,-4.2154,6.1037);at36(1,-3.8178,3.9399);reload36();frames36(3);};
   var placedAt36=k=>{benchTeardown36();life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:k||'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items=S.home.items.filter(i=>i.type!=='bench');S.home.items.push({id:'i98',type:'bench',x:0,y:4,rot:0,pose36:k||'out'});reload36();};
   var strips36=()=>[0,1].map(i=>{const h=document.getElementById('half'+i),c=(h.children||[]).filter(x=>x.className==='bench36-pick');return c.length?c[c.length-1].innerHTML:'';});
   var tap36=(act,d)=>{if(typeof benchStripTap36!=='function')return false;benchStripTap36({target:{closest:()=>({dataset:Object.assign({act},d)})},preventDefault(){},stopPropagation(){}});return true;};
   var companion36=()=>{NET.on=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();dispatch('movein');closePanel();sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();screen36(1280,800,false);frames36(2);PH='';TOASTS=[];};`);}
 return h;}

const r3=v=>Math.round(v*1000)/1000,deg=v=>Math.round(v*180/Math.PI*100)/100;

// check 30's own stylesheet reader: the page's stylesheets in page order (the linked files and the inline blocks), the rules of those @media
// blocks that apply at a given screen, and a cascade over an element chain (tag, id, classes): selectors of tags, ids, classes, attributes,
// :root and :not() joined by descendant or child combinators (anything else never matches), specificity, !important, inheritance of color
// and of custom properties, var(); a colour is a hex, rgb()/rgba() or a few names, and a background is the nearest one in the chain
function sheets36(game){const html=fs.readFileSync(path.join(game,'index.html'),'utf8'),out=[];const re=/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>|<style[^>]*>([\s\S]*?)<\/style>/g;let m;
 while((m=re.exec(html))){if(m[1]){if(/^https?:/.test(m[1]))continue;out.push(fs.readFileSync(path.join(game,m[1]),'utf8'));}else out.push(m[2]);}return out;}
function media36(q,scr){return q.split(',').some(part=>{let p=part.trim().toLowerCase(),neg=false;if(p.startsWith('not ')){neg=true;p=p.slice(4);}
  const ok=p.split(/\s+and\s+/).every(t=>{t=t.trim();if(t==='screen'||t==='all'||t==='only screen')return true;const f=/^\(\s*([a-z-]+)\s*:\s*([^)]+?)\s*\)$/.exec(t);if(!f)return false;const v=f[2];
   switch(f[1]){case 'max-width':return scr.w<=parseFloat(v);case 'min-width':return scr.w>=parseFloat(v);case 'max-height':return scr.h<=parseFloat(v);case 'min-height':return scr.h>=parseFloat(v);
    case 'orientation':return v===(scr.h>scr.w?'portrait':'landscape');case 'hover':return v===(scr.touch?'none':'hover');case 'pointer':return v===(scr.touch?'coarse':'fine');
    case 'prefers-color-scheme':return v===(scr.scheme||'light');default:return false;}});return neg?!ok:ok;});}
function strip36(css){return css.replace(/\/\*[\s\S]*?\*\//g,'');}
// the style rules in order: [{sel, decls:[[prop,value,important]]}], with the @media blocks that apply flattened in place
function rules36(css,scr,out){css=strip36(css);out=out||[];let i=0;const n=css.length;
 while(i<n){const ob=css.indexOf('{',i);if(ob<0)break;const head=css.slice(i,ob).trim();let d=1,j=ob+1;while(j<n&&d){if(css[j]==='{')d++;else if(css[j]==='}')d--;j++;}const body=css.slice(ob+1,j-1);i=j;
  if(head.startsWith('@media')){if(media36(head.slice(6).trim(),scr))rules36(body,scr,out);continue;}if(head.startsWith('@'))continue;
  const decls=[];for(const dcl of body.split(';')){const c=dcl.indexOf(':');if(c<0)continue;let p=dcl.slice(0,c).trim().toLowerCase(),v=dcl.slice(c+1).trim();const imp=/!important\s*$/.test(v);if(imp)v=v.replace(/!important\s*$/,'').trim();if(p)decls.push([p,v,imp]);}
  for(const sel of splitTop36(head))out.push({sel:sel.trim(),decls,order:out.length});}
 return out;}
function splitTop36(s){const out=[];let d=0,cur='';for(const ch of s){if(ch==='('||ch==='[')d++;if(ch===')'||ch===']')d--;if(ch===','&&!d){out.push(cur);cur='';}else cur+=ch;}if(cur.trim())out.push(cur);return out;}
// a compound selector against one element {tag, id, cls:[], attrs:{}, root}
function compound36(c,el){let rest=c,spec=[0,0,0];const take=re=>{const m=re.exec(rest);if(!m)return null;rest=rest.slice(m[0].length);return m;};
 let m=take(/^([a-zA-Z][a-zA-Z0-9-]*|\*)/);if(m){if(m[1]!=='*'){if(m[1].toLowerCase()!==el.tag)return null;spec[2]++;}}
 while(rest.length){if((m=take(/^#([\w-]+)/))){if(el.id!==m[1])return null;spec[0]++;continue;}
  if((m=take(/^\.([\w-]+)/))){if(!el.cls.includes(m[1]))return null;spec[1]++;continue;}
  if((m=take(/^\[\s*([\w-]+)\s*(?:([~|^$*]?=)\s*["']?([^"'\]]*)["']?\s*)?\]/))){const v=(el.attrs||{})[m[1]];if(v===undefined)return null;if(m[2]&&!(m[2]==='='?v===m[3]:m[2]==='~='?v.split(/\s+/).includes(m[3]):m[2]==='^='?v.startsWith(m[3]):m[2]==='$='?v.endsWith(m[3]):v.includes(m[3])))return null;spec[1]++;continue;}
  if((m=take(/^:root/))){if(!el.root)return null;spec[1]++;continue;}
  if((m=take(/^:not\(([^()]*)\)/))){const r=compound36(m[1].trim(),el);if(r)return null;spec[1]++;continue;}
  return null;}                                                                       // :hover, :has(), ::before and the rest never match here
 return spec;}
// a complex selector against the chain (root first, the element last): descendant and child combinators only
function match36(sel,chain){const parts=sel.replace(/\s*>\s*/g,' > ').trim().split(/\s+/);if(parts.some(p=>p==='+'||p==='~'||/[+~]/.test(p.replace(/\[[^\]]*\]/g,''))))return null;
 const total=[0,0,0];const last=parts.pop(),s0=compound36(last,chain[chain.length-1]);if(!s0)return null;s0.forEach((v,k)=>total[k]+=v);
 let idx=chain.length-2;while(parts.length){let comb=' ';if(parts[parts.length-1]==='>'){comb='>';parts.pop();}const c=parts.pop();if(c===undefined)return null;
  if(comb==='>'){if(idx<0)return null;const s=compound36(c,chain[idx]);if(!s)return null;s.forEach((v,k)=>total[k]+=v);idx--;}
  else{let found=null;while(idx>=0){const s=compound36(c,chain[idx]);idx--;if(s){found=s;break;}}if(!found)return null;found.forEach((v,k)=>total[k]+=v);}}
 return total;}
function cmpSpec36(a,b){for(let k=0;k<3;k++)if(a[k]!==b[k])return a[k]-b[k];return 0;}
// the cascaded value of prop on chain[k] (no inheritance), or undefined
function cascaded36(R,chain,k,prop){let best=null;const sub=chain.slice(0,k+1);
 for(const r of R){const d=r.decls.filter(x=>x[0]===prop);if(!d.length)continue;const sp=match36(r.sel,sub);if(!sp)continue;for(const x of d){const cand={v:x[1],imp:x[2],sp,o:r.order};
   if(!best||(cand.imp!==best.imp?cand.imp:(cmpSpec36(cand.sp,best.sp)>0||(cmpSpec36(cand.sp,best.sp)===0&&cand.o>=best.o))))best=cand;}}
 return best?best.v:undefined;}
function inherited36(R,chain,k,prop){for(let j=k;j>=0;j--){const v=cascaded36(R,chain,j,prop);if(v!==undefined&&v!=='inherit')return [v,j];}return [undefined,-1];}
function resolveVar36(R,chain,k,v,depth){depth=depth||0;if(depth>8)return v;return v.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g,(m,name,fb)=>{const [x,j]=inherited36(R,chain,k,name);return x!==undefined?resolveVar36(R,chain,j,x,depth+1):(fb||'');});}
const NAMED36={white:[255,255,255,1],black:[0,0,0,1],transparent:[0,0,0,0]};
function colour36(v){if(!v)return null;v=v.trim().toLowerCase();if(NAMED36[v])return NAMED36[v].slice();let m=/^#([0-9a-f]{3,8})$/.exec(v);
 if(m){let h=m[1];if(h.length===3||h.length===4)h=h.split('').map(c=>c+c).join('');const n=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));n.push(h.length===8?parseInt(h.slice(6,8),16)/255:1);return n;}
 m=/^rgba?\(([^)]*)\)$/.exec(v);if(m){const p=m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);return [p[0],p[1],p[2],p.length>3?p[3]:1];}return null;}
// the element's colour (inherited) and the nearest background colour in the chain at or above it (a background shorthand's colour, or
// background-color; a gradient or image counts as no colour, so the search goes on up)
function colours36(R,chain){const k=chain.length-1;const [cv,cj]=inherited36(R,chain,k,'color');const fg=cv===undefined?[0,0,0,1]:colour36(resolveVar36(R,chain,cj,cv));
 let bg=null,bgAt=-1;for(let j=k;j>=0&&!bg;j--){for(const p of ['background-color','background']){const v=cascaded36(R,chain,j,p);if(v===undefined)continue;const r=resolveVar36(R,chain,j,v);
   const c=colour36(r)||colour36((/(#[0-9a-f]{3,8}|rgba?\([^)]*\))\s*$/i.exec(r)||[])[1]);if(c&&c[3]>=0.999&&!/gradient|url\(/i.test(r)){bg=c;bgAt=j;break;}}}
 return {fg,bg:bg||[255,255,255,1],bgAt};}
function lum36(c){const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]);}
function contrast36(fg,bg){const a=fg[3]===undefined?1:fg[3],mix=[0,1,2].map(i=>fg[i]*a+bg[i]*(1-a)),L1=lum36(mix),L2=lum36(bg);return (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);}
// the checks: each returns a deterministic summary or throws
function checks(h,only){const {run}=h,J=c=>JSON.parse(run('JSON.stringify('+c+')'));run('var PLAN36='+JSON.stringify(PLAN));
 const FE=PLAN.start.yaw===0?1:0;                                              // the end the plan leads with
 // places along the plan, found by what the segments do (so a regenerated plan keeps them): the courtyard run west, corner 1, corner 2 and the
 // run through the flat door
 const SEG=(()=>{const S=PLAN.segments,court=S.findIndex(s=>s.op==='fwd'&&s.until.x<0),c2=S.findIndex(s=>s.op.startsWith('turn')&&s.until.x<-1.0&&s.until.z>4.0);   // the porch turn after the passage (not the street turn)
  return {courtyard:court,corner1:court+1,corner2:c2,flatDoor:S.findIndex((s,k)=>k>c2&&s.op==='fwd'&&s.until.x<-2.3),stops:S.length-3};})();
 const out=[];const check=(n,fn)=>{if(only&&!only.includes(n))return;const name=NAMES[n-1];
  try{const info=fn();out.push({name,passed:true,info});}catch(e){out.push({name,passed:false,failure:String(e&&e.message||e).slice(0,400)});}
  try{run('WALL36.on=false;ONF36=null;noKeys36();overlayOn36(false);DT36=1000/30;NET.on=false;AI.on=false;')}catch(e){}};
 const deliver=(opts)=>{opts=opts||{};run((opts.fresh?'FOL36.k=0;FOL36.o=null;':'')+'FOL36.o=null;FOL36.zeroT=false;FOL36.zeroM=false;');const r=J(`drive36(PLAN36,${opts.max||7200})`);return r;};
 const agreeOn=(key)=>{let guard=0;while(J('BENCH36.choice')!==key&&guard++<4){run("keys['arrowright']=true;frames36(2);keys['arrowright']=false;frames36(3);");}
  assert.equal(J('BENCH36.choice'),key,'chose '+key);run('press36(0);frames36(2);press36(1);frames36(2);');for(let k=0;k<400&&J('BENCH36.state')==='settling';k++)run('frames36(1)');return J('BENCH36.state');};
 const walls=()=>run('WALL36.on=true;ONF36=wallsFrame36;');
 const stateSeq=()=>J('BENCH36.states.slice()');

 check(1,()=>{run('fresh36();at36(0,-4.2,3.2);at36(1,-3.2,3.2);frames36(1);');assert.equal(J('[singleIdx(),AI.on,NET.on,cams.length]').join(),'-1,false,false,2');
  const p0=J('[pos36(0),pos36(1)]');run("setKeys36(0,[1,0]);frames36(12);noKeys36();frames36(1);");const p1=J('[pos36(0),pos36(1)]');
  assert(Math.hypot(p1[0][0]-p0[0][0],p1[0][1]-p0[0][1])>0.5,'P1 walks on WASD');assert.deepEqual(p1[1],p0[1],'P2 stays');
  run("setKeys36(1,[-1,0]);frames36(12);noKeys36();frames36(1);");const p2=J('[pos36(0),pos36(1)]');assert.deepEqual(p2[0],p1[0],'P1 stays');assert(Math.hypot(p2[1][0]-p1[1][0],p2[1][1]-p1[1][1])>0.5,'P2 walks on the arrows');
  run("setKeys36(0,[0,1]);setKeys36(1,[0,1]);frames36(10);noKeys36();frames36(1);");const p3=J('[pos36(0),pos36(1)]');assert(p3[0][1]!==p2[0][1]&&p3[1][1]!==p2[1][1],'both at once');
  const cams=J('cams.map(c=>c.position.toArray().map(v=>+v.toFixed(3)))');assert.notDeepEqual(cams[0],cams[1],'two cameras');
  run('start36();');const e1=J('benchEnd36(BENCH36.pose,1,1.05)'),e0=J('benchEnd36(BENCH36.pose,0,1.05)');run(`at36(0,${e1[0]},${e1[1]});at36(1,${e0[0]},${e0[1]});frames36(10);`);
  const pr=J("[0,1].map(i=>{const e=document.getElementById('pr'+i);return [e.className,e.innerHTML];})");
  for(const i of [0,1]){assert.equal(pr[i][0],'pr on p'+i,'prompt '+i+' shown');assert(pr[i][1].includes('Take this end'),'prompt '+i+': '+pr[i][1]);}
  assert(pr[0][1].includes('role36 move')&&pr[1][1].includes('role36 turn'),'role chips');
  return {walk:[r3(p1[0][0]-p0[0][0]),r3(p2[1][0]-p1[1][0])],prompts:pr.map(p=>p[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim())};});

 check(2,()=>{const probe=dir=>JSON.parse(cp.execFileSync(process.execPath,[__filename,'--inert-probe'],{env:Object.assign({},process.env,{COMPOUND_GAME_DIR:dir}),encoding:'utf8',maxBuffer:1<<28}).trim().split('\n').pop());
  const without=variantDir(html=>{assert(BENCH_TAG.test(html),'the bench tag is in index.html');return html.replace(BENCH_TAG,'').replace(/<link rel="stylesheet" href="src\/bench-v36\.css">\n?/,'');});
  let a,b;try{a=probe(GAME);b=probe(without);}finally{fs.rmSync(without,{recursive:true,force:true});}
  assert.equal(a.module,true);assert.equal(b.module,false);
  for(const k of ['blocked','save','dist','labels','keys','tickHooks','lines','mesh']){assert.deepEqual(a[k],b[k],k+' differs from the build without the module');}
  // the companion household (day 2, the sofa in) is told, once, that the bench needs two players on one device; nothing else in its Menu changes
  const TWO='<div class="card small bench36-menu">Ada’s bench needs two pairs of hands: one to walk it, one to turn it.<div class="actions">'+run("btn('Play this with two players on this device','bench36Duo',{},'primary')")+'</div></div>';
  assert(a.menu.startsWith(TWO),'the companion Menu opens with the two-hands line');assert.equal(a.menu.split('bench36-menu').length-1,1,'one bench line');assert.equal(a.menu.slice(TWO.length),b.menu,'the rest of the companion Menu is unchanged');
  assert.equal(a.mesh,0);return {points:a.blocked.length,frames:a.labels.length,keys:a.keys.length,tickHooks:a.tickHooks,lines:a.lines,companion:'two-hands line only'};});

 // the lone player's runs, shared by checks 3 and 20 (each pose and pattern runs once in a process)
 const SOLO={},PATS=['ratchet+','ratchet-','mover-random','turner-random'];
 const solo=names=>{const out=[];for(const n of names)for(const pat of PATS){const k=n+'|'+pat;if(!SOLO[k])SOLO[k]=J(`soloRun36(${JSON.stringify(n)},'${pat}')`);out.push(SOLO[k]);}return out;};
 const leakNow=()=>J('BENCH36.yawLeak===undefined?null:BENCH36.yawLeak');
 check(3,()=>{run('fresh36();start36();');run(`at36(0,${'benchEnd36(BENCH36.pose,'+FE+',1.05)[0]'},${'benchEnd36(BENCH36.pose,'+FE+',1.05)[1]'});at36(1,6,10.5);frames36(2);press36(0);frames36(4);`);
  assert.equal(J('BENCH36.state'),'ready');const p0=J('bench36Pose()');
  // alone: pushing into the bench and sideways for 3 s
  run(`{const c=BENCH36.pose,q=pos36(0);setKeys36(0,combo36(c.x-q[0],c.z-q[1]));}frames36(45);{const a=benchAxis36(BENCH36.pose.yaw);setKeys36(0,combo36(-a[1],a[0]));}frames36(45);noKeys36();frames36(2);`);
  assert.deepEqual(J('bench36Pose()'),p0,'one player alone moves nothing');assert.equal(J('BENCH36.state'),'ready');
  run(`{const r=benchEnd36(BENCH36.pose,${1-FE},1.05);at36(1,r[0],r[1]);}frames36(2);press36(1);frames36(4);`);assert.equal(J('BENCH36.state'),'carrying');
  // only the mover: along the axis, yaw constant
  const q0=J('bench36Pose()');run(`{const B=BENCH36,a=benchAxis36(B.pose.yaw),f=B.front?1:-1;setKeys36(B.mover,combo36(-a[0]*f,-a[1]*f));}frames36(15);noKeys36();frames36(6);`);
  const q1=J('bench36Pose()');const ax=[Math.cos(q0.yaw),-Math.sin(q0.yaw)],dx=q1.x-q0.x,dz=q1.z-q0.z;
  assert(Math.abs(q1.yaw-q0.yaw)<=1e-9,'mover keys keep the yaw');assert(Math.abs(-dx*ax[1]+dz*ax[0])<=1e-9,'only along the axis');assert(Math.hypot(dx,dz)>0.05,'it moved: '+Math.hypot(dx,dz));
  // only the turner: centre constant
  run(`{const B=BENCH36,f=B.front?1:-1;setKeys36(1-B.mover,combo36(Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f));}frames36(10);noKeys36();frames36(6);`);
  const q2=J('bench36Pose()');assert.equal(q2.x,q1.x);assert.equal(q2.z,q1.z);assert(Math.abs(q2.yaw-q1.yaw)>0.05,'the turner turned it');
  // the turner pushing along the bench (outside the cone) moves nothing
  run(`{const B=BENCH36,a=benchAxis36(B.pose.yaw);setKeys36(1-B.mover,combo36(a[0],a[1]));}frames36(20);noKeys36();frames36(4);`);assert.deepEqual(J('bench36Pose()'),q2,'turner forward keys move nothing');
  // the plan with the turner's keys zeroed for 120 s never reaches the passage
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;FOL36.zeroT=true;FOL36.zeroM=false;');run('drive36(PLAN36,3600)');
  const zT=J('[bench36Pose(),FOL36.k,BENCH36.state]');assert(!(zT[0].x<-1.15&&zT[0].z>1.5),'reached the passage without the turner');
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;FOL36.zeroT=false;FOL36.zeroM=true;');const c0=J('bench36Pose()');run('drive36(PLAN36,900)');const zM=J('bench36Pose()');
  assert.equal(zM.x,c0.x);assert.equal(zM.z,c0.z);run('FOL36.zeroM=false;');
  // the corner poses: the mover's keys alone never turn it (the walls only step it sideways), the turner's alone move the centre at most CAPS
  const S3=solo(['inside the gate 40° off','corner 1 half-turned','flat door 20° off','veranda doorway 15° off']);let ym=0,tm=0;
  for(const r of S3){assert(!r.err,r.name+' '+r.pat+': '+r.err);
   if(r.pat==='turner-random'){assert(r.movedRaw<=0.08+1e-9,`${r.name}: the turner alone moved the centre ${r.movedRaw} m`);tm=Math.max(tm,r.movedRaw);}
   else{assert(r.yawMax<=1e-12,`${r.name} ${r.pat}: the mover alone turned it ${r.yawMax} rad`);ym=Math.max(ym,r.yawMax);}}
  // (round 3, M2) both players' random keys at the openings and corners, 400 frames from each of five poses and four seeds: the heading moves by
  // exactly what the Turn player's swings give, also in the frames where the walls help a swing or a push (yawLeak counts every other frame)
  const both=J(`(()=>{const B=BENCH36,out={frames:0,helped:0,leak0:B.yawLeak};for(const [x,z,dg] of [[-1.70,1.0,255],[-2.0,4.9,195],[-4.0,4.85,255],[3.6,5.6,110],[-1.2,0.85,230]])for(let sd=1;sd<=4;sd++){
    if(!liftAt36(x,z,dg))continue;R36.seed(sd*97+Math.round(x*10));let d0=null,d1=null;const rk=()=>{const v=[Math.floor(R36.next()*3)-1,Math.floor(R36.next()*3)-1];return v[0]||v[1]?v:null;};const a0=B.cost.assist+B.cost.funnel;
    for(let f=0;f<400&&B.state==='carrying';f++){if(R36.next()<0.1)d0=rk();if(R36.next()<0.1)d1=rk();setKeys36(0,d0);setKeys36(1,d1);frames36(1);out.frames++;}noKeys36();out.helped+=B.cost.assist+B.cost.funnel-a0;}
   out.leak=B.yawLeak-out.leak0;return out;})()`);
  assert(both.frames>=4000&&both.helped>0,'both players at the openings: '+JSON.stringify(both));assert.equal(both.leak,0,'a heading change no swing gave, with both players: '+both.leak);
  assert.equal(leakNow(),0,'BENCH36.yawLeak');
  return {both:{frames:both.frames,helped:both.helped>0,yawLeak:both.leak},mover:r3(Math.hypot(dx,dz)),turner:deg(q2.yaw-q1.yaw),noTurner:{x:r3(zT[0].x),z:r3(zT[0].z),segment:zT[1]},noMover:{x:r3(zM.x),z:r3(zM.z)},
   corners:{runs:S3.length,moverYaw:ym,turnerMoved:r3(tm),yawLeak:0}};});

 // shared by check 4 and check 5: three deliveries with the wall sampler on every frame
 let delivered=null;
 const threeDeliveries=()=>{if(delivered)return delivered;walls();const res=[];
  run('fresh36();');const crate0=J('[crate.position.x,crate.position.z]');assert.deepEqual(crate0,[-1.75,1],'a fresh save has the crate in the passage mouth');
  // preflight refusals first: an armchair over the slot, a piece in the lane
  run("S.home.items.push({id:'pf1',type:'armchair',x:1,y:FLAT.rows,rot:0});rebuildFurniture();TOASTS=[];");assert.equal(J('start36()'),'off');const t1=J('TOASTS.slice(-1)[0]');
  assert.equal(t1,'Ada’s bench needs the way clear. Move the woven armchair off the west end of the veranda in Home first.','slot refusal: '+t1);
  run("S.home.items=S.home.items.filter(i=>i.id!=='pf1');S.home.items.push({id:'pf2',type:'plant',x:4,y:2,rot:0});rebuildFurniture();TOASTS=[];");assert.equal(J('start36()'),'off');const t2=J('TOASTS.slice(-1)[0]');
  assert(/front of the room by the door/.test(t2),'lane refusal: '+t2);run("S.home.items=S.home.items.filter(i=>i.id!=='pf2');rebuildFurniture();TOASTS=[];");
  // delivery 1: P1 moves, Out
  run('BENCH36.states=[];');assert.equal(J('start36()'),'grounded');const crate1=J('[crate.position.x,crate.position.z]');assert.notDeepEqual(crate1,crate0,'the start moved the crate');
  assert.equal(J("fits('chairs',5,3)"),false,'Build refuses the lane while a delivery is open');
  run('takeEnds36('+FE+',0);');assert.equal(J('lift36(0,1)'),'carrying');assert.equal(J('BENCH36.mover'),0);let d=deliver({fresh:true});
  assert.equal(J('BENCH36.state'),'choosing','delivery 1 reached the doorway: '+JSON.stringify(d));const st1=J('benchStats36()');assert.equal(agreeOn('out'),'placed');
  assert.deepEqual(stateSeq(),['grounded','ready','carrying','choosing','settling','placed'],'delivery 1 states');res.push({dur:r3(st1.dur),bumps:st1.bumps,resets:st1.resets,settle:J('BENCH36.lastSettle'),placed:J("S.home.items.find(i=>i.type==='bench').pose36")});
  // delivery 2: again, roles swapped in ready before the lift (P2 leads), Gate
  const item1=J("JSON.stringify(S.home.items.find(i=>i.type==='bench'))");run('BENCH36.states=[];closePanel();ACTIONS.bench36Again();');assert.equal(J('BENCH36.state'),'grounded');
  run(`{const p=BENCH36.pose,f=benchEnd36(p,${FE},1.1),r=benchEnd36(p,${1-FE},1.1);at36(1,f[0],f[1]);at36(0,r[0],r[1]);}frames36(2);press36(0);frames36(3);`);assert.equal(J('BENCH36.state'),'ready');
  run('press36(0);frames36(3);');assert.equal(J('BENCH36.mover'),1,'swapped in ready');run('press36(1);frames36(3);');assert.equal(J('BENCH36.state'),'carrying');assert.equal(J('BENCH36.holder['+FE+']'),1,'P2 holds the leading end');
  d=deliver({fresh:true});assert.equal(J('BENCH36.state'),'choosing','delivery 2 reached the doorway: '+JSON.stringify(d));assert.equal(J("JSON.stringify(S.home.items.find(i=>i.type==='bench'))"),item1,'the saved item is untouched during the run');
  const st2=J('benchStats36()');assert.equal(agreeOn('gate'),'placed');assert.deepEqual(stateSeq(),['grounded','ready','carrying','choosing','settling','placed'],'delivery 2 states');
  res.push({dur:r3(st2.dur),bumps:st2.bumps,swaps:st2.swaps,resets:st2.resets,settle:J('BENCH36.lastSettle'),placed:J("S.home.items.find(i=>i.type==='bench').pose36")});
  // delivery 3: four set-downs at seeded segments by alternating holders, one swap mid-route that changes the leading end, Water
  const item2=J("JSON.stringify(S.home.items.find(i=>i.type==='bench'))");run('BENCH36.states=[];closePanel();ACTIONS.bench36Again();R36.seed(36);FOL36.k=0;FOL36.o=null;');
  run('takeEnds36('+FE+',0);');assert.equal(J('lift36(0,1)'),'carrying');
  const stops=J('(()=>{const s=new Set();while(s.size<4)s.add(1+Math.floor(R36.next()*'+SEG.stops+'));return [...s].sort((a,b)=>a-b);})()');const downs=[];let swapAt=stops[1],fronts=[];
  for(let k=0;k<stops.length;k++){const at=stops[k];const r=J(`drive36(PLAN36,7200,(seg)=>seg>=${at})`);assert.equal(r.r,'stop','reached segment '+at);
   const holder=k%2;let tries=0;while(J('BENCH36.state')==='carrying'&&tries<8){run(`press36(${holder});frames36(10);`);if(J('BENCH36.state')==='carrying'){tries++;run('FOL36.k=Math.min(FOL36.k,PLAN36.segments.length-1);');J('drive36(PLAN36,8)');}}
   assert.equal(J('BENCH36.state'),'grounded','set down at segment '+at);downs.push({seg:at,by:holder});
   // both stand where the set-down left them; take again (the one who set it down first), swap once, lift
   const first=holder;run(`press36(${first});frames36(3);`);assert.equal(J('BENCH36.state'),'ready');
   if(at===swapAt){const fr=J('BENCH36.front');run(`press36(${first});frames36(3);`);fronts.push(fr);}
   run(`press36(${1-first});frames36(4);`);assert.equal(J('BENCH36.state'),'carrying','lifted again at segment '+at);if(at===swapAt)fronts.push(J('BENCH36.front'));}
  assert.notEqual(fronts[0],fronts[1],'the swap changed the leading end');
  d=deliver();assert.equal(J('BENCH36.state'),'choosing','delivery 3 reached the doorway: '+JSON.stringify(d));assert.equal(J("JSON.stringify(S.home.items.find(i=>i.type==='bench'))"),item2,'the saved item is untouched during the run');
  const st3=J('benchStats36()');assert.equal(agreeOn('water'),'placed');
  const want3=['grounded','ready','carrying'];for(let k=0;k<4;k++)want3.push('grounded','ready','carrying');want3.push('choosing','settling','placed');assert.deepEqual(stateSeq(),want3,'delivery 3 states');
  res.push({dur:r3(st3.dur),bumps:st3.bumps,setdowns:st3.setdowns,swaps:st3.swaps,resets:st3.resets,settle:J('BENCH36.lastSettle'),placed:J("S.home.items.find(i=>i.type==='bench').pose36"),downs});
  for(const r of res){assert(r.dur<60,'under 60 s: '+r.dur);assert(r.bumps<=3,'at most 3 bumps: '+r.bumps);assert.equal(r.resets,0);assert.equal(r.settle,'glide','the bench glides to its place');}
  assert.equal(J('S.life.bench36.deliveries'),3);
  delivered={res,crate:[crate0,crate1.map(r3)],refusals:[t1,t2]};return delivered;};
 check(4,()=>{// the plan was made for the running carry scheme and its guidance
  const sc=J('typeof BENCH36.SCHEME==="string"?BENCH36.SCHEME:null'),gh=J('BENCH36.GUIDE?BENCH36.GUIDE:null');
  assert.equal(PLAN.scheme,sc,'the plan’s scheme against the module’s');assert(gh,'the module declares its guidance');assert.equal(PLAN.guide,guideHash(gh),'the plan’s guidance hash against the module’s');
  return Object.assign({scheme:PLAN.scheme,guide:PLAN.guide},threeDeliveries());});

 // the fuzz (checks 5 and 6): random keys and Acts for both players from the five checkpoints and the doorway
 let fuzzed=null;
 const fuzz=()=>{if(fuzzed)return fuzzed;walls();const starts=J('BENCH36.CHECK.map(c=>[c.x,c.z,c.yaw])').concat([[-4.02,5.02,260]]);const runs=[];
  run(`var SD36={acc:0,ref:0,room:0,accBad:[],refBad:[],roomBad:[],inBox:[],downs:[],prev:null,toasts:0};var sdFrame36=()=>{const B=BENCH36,s=B.state,tn=TOASTS.length;
    // nobody but a holder ever stands inside the grounded bench (a player who lifted and set down at once included)
    if(s==='grounded'||s==='ready')for(const i of [0,1]){if(benchHolderOf36(i)>=0)continue;const q=pos36(i);if(hbInBox36(q[0],q[1],PR-0.02,B.pose)&&SD36.inBox.length<5)SD36.inBox.push([s,i,+q[0].toFixed(3),+q[1].toFixed(3)]);}
    if(SD36.prev==='carrying'&&s==='grounded'){SD36.acc++;if(!hbMatch36(B.pose,[pos36(0),pos36(1)])&&SD36.accBad.length<5)SD36.accBad.push([+B.pose.x.toFixed(3),+B.pose.z.toFixed(3)]);
     if(SD36.downs.length<120)SD36.downs.push([B.pose.x,B.pose.z,B.pose.yaw,pos36(0),pos36(1),hbSig36()]);}
    for(let k=SD36.toasts;k<tn;k++)if(/^Not here, it would box/.test(TOASTS[k])&&s==='carrying'){SD36.ref++;const nud=[0,1].map(i=>{const e=benchHolderOf36(i),q=pos36(i);if(e<0)return q;return benchEnd36(B.pose,e,1.1);});if(hbMatch36(B.pose,nud)&&SD36.refBad.length<5)SD36.refBad.push([+B.pose.x.toFixed(3),+B.pose.z.toFixed(3)]);}
    // a holder with no room to step back: on rings of 0.1-0.6 m round one holder's stand point there is no free point outside the bench
    else if(/^Not here: .* has no room to step back/.test(TOASTS[k])&&s==='carrying'){SD36.room++;const P=B.pose,bad=[0,1].every(e=>{const E=hbEnds36(P)[e];for(let rad=0;rad<=0.601;rad+=0.1)for(let a=0;a<16;a++){const x=E[0]+Math.sin(a/16*Math.PI*2)*rad,z=E[1]+Math.cos(a/16*Math.PI*2)*rad;if(!blocked(x,z,PR,{noBench:true})&&!hbInBox36(x,z,PR,P)&&carryLevelOK34(x,z))return true;if(rad===0)break;}return false;});if(bad&&SD36.roomBad.length<5)SD36.roomBad.push([+P.x.toFixed(3),+P.z.toFixed(3)]);}
    SD36.toasts=tn;SD36.prev=s;wallsFrame36();};`);
  for(let k=0;k<starts.length;k++){const [x,z,dg]=starts[k];
   // the players stand at the two ends before the load (the load's own rule then keeps the pose), and the pose is the one asked for
   run(`fresh36();start36();atEnds36({x:${x},z:${z},yaw:${dg}*Math.PI/180});loadAt36(${x},${z},${dg});`);
   const got=J('bench36Pose()');assert(Math.abs(got.x-x)<1e-9&&Math.abs(got.z-z)<1e-9&&Math.abs(got.yaw-dg*Math.PI/180)<1e-9,'the fuzz starts where asked: '+JSON.stringify([x,z,dg,got]));
   run(`ONF36=sdFrame36;SD36.prev=BENCH36.state;SD36.toasts=TOASTS.length;R36.seed(${100+k});`);
   // first a directed push: lift, the mover drives one way then the other, the turner swings, then the bench is set down
   run(`press36(0);frames36(3);press36(1);frames36(3);if(BENCH36.state==='carrying'){const B=BENCH36,ax=benchAxis36(B.pose.yaw),f=B.front?1:-1,sg=R36.next()<0.5?1:-1;
    setKeys36(B.mover,combo36(ax[0]*f*sg,ax[1]*f*sg));frames36(45);setKeys36(B.mover,combo36(-ax[0]*f*sg,-ax[1]*f*sg));frames36(90);noKeys36();
    const e=[Math.sin(B.pose.yaw)*f*sg,Math.cos(B.pose.yaw)*f*sg];setKeys36(1-B.mover,combo36(e[0],e[1]));frames36(60);noKeys36();frames36(3);press36(B.holder[0]);frames36(12);}`);
   run(`{let d0=null,d1=null;for(let f=0;f<1000;f++){if(R36.next()<0.12){const r=R36.next();d0=r<0.25?null:[Math.floor(R36.next()*3)-1,Math.floor(R36.next()*3)-1];}if(R36.next()<0.12){const r=R36.next();d1=r<0.25?null:[Math.floor(R36.next()*3)-1,Math.floor(R36.next()*3)-1];}
     setKeys36(0,d0&&(d0[0]||d0[1])?d0:null);setKeys36(1,d1&&(d1[0]||d1[1])?d1:null);
     // keep both near the bench (a player who wanders off is brought back, as a playtester would walk back)
     for(const i of [0,1]){const q=pos36(i),B=BENCH36;if(B.state!=='carrying'&&Math.hypot(q[0]-B.pose.x,q[1]-B.pose.z)>3){const e=benchEnd36(B.pose,i,1.1);if(!blocked(e[0],e[1],PR))at36(i,e[0],e[1]);}}
     if(R36.next()<0.03)press36(0);if(R36.next()<0.03)press36(1);frames36(1);if(BENCH36.state==='choosing'){ACTIONS.bench36RoomDown();}if(BENCH36.state==='placed'||BENCH36.state==='settling')break;}}noKeys36();`);
   runs.push(J('[BENCH36.state,+BENCH36.pose.x.toFixed(2),+BENCH36.pose.z.toFixed(2)]'));}
  // the openings: 300 frames of the mover's random keys alone, and of both players' random keys and Acts, from 5, 10, 14 and 20 degrees off
  // at the passage mouth, the flat door and the veranda doorway, and with a holder 0.05 m from each of their six jambs (lifted first)
  run(`var opFuzz36=(x,z,deg,pat,seed,nud)=>{const at=liftAt36(x,z,deg,nud);if(!at)return {err:'not lifted '+[x,z,deg]};const B=BENCH36,a0=B.cost.assist,f0=B.cost.funnel;
    ONF36=sdFrame36;SD36.prev=B.state;SD36.toasts=TOASTS.length;WALL36.prev=null;R36.seed(seed);let d0=null,d1=null;
    const rnd=()=>{const r=R36.next();return r<0.25?null:[Math.floor(R36.next()*3)-1,Math.floor(R36.next()*3)-1];};
    for(let f=0;f<300;f++){if(R36.next()<0.12)d0=rnd();if(pat==='both'&&R36.next()<0.12)d1=rnd();const ok=d=>d&&(d[0]||d[1])?d:null;
     if(pat==='mover'){if(B.state!=='carrying')break;setKeys36(B.mover,ok(d0));setKeys36(1-B.mover,null);}
     else{setKeys36(0,ok(d0));setKeys36(1,ok(d1));
      for(const i of [0,1]){const q=pos36(i);if(B.state!=='carrying'&&Math.hypot(q[0]-B.pose.x,q[1]-B.pose.z)>3){const e=benchEnd36(B.pose,i,1.1);if(!blocked(e[0],e[1],PR))at36(i,e[0],e[1]);}}
      if(R36.next()<0.03)press36(0);if(R36.next()<0.03)press36(1);}
     frames36(1);if(B.state==='choosing')ACTIONS.bench36RoomDown();if(B.state==='placed'||B.state==='settling')break;}
    noKeys36();ONF36=null;return {at,assist:B.cost.assist-a0,funnel:B.cost.funnel-f0,end:[B.state,+B.pose.x.toFixed(2),+B.pose.z.toFixed(2)]};};`);
  const OPS=[];for(const t of [5,10,14,20])OPS.push(['passage '+t,-1.70,1.0,270-t],['flat door '+t,-2.0,4.9,180+t],['veranda doorway '+t,-4.0,4.85,270-t]);
  const ALONG=[[0,0],[0,0.1],[0,-0.1],[0,0.2],[0,-0.2]],ACROSS=[[0,0],[0.1,0],[-0.1,0],[0.2,0],[-0.2,0]];
  OPS.push(['passage west jamb',-2.08,1.0,270,ALONG],['passage east jamb',-1.42,1.0,270,ALONG],['flat door south jamb',-2.475,4.57,180,ACROSS],['flat door north jamb',-2.475,5.23,180,ACROSS],
   ['veranda doorway west jamb',-4.33,4.8,90,ALONG],['veranda doorway east jamb',-3.87,4.8,90,ALONG]);
  const opens=[];let seed=200;
  for(const [n,x,z,dg,nud] of OPS)for(const pat of ['mover','both']){const r=J(`opFuzz36(${x},${z},${dg},'${pat}',${seed++},${JSON.stringify(nud||null)})`);assert(!r.err,n+': '+r.err);opens.push([n,pat,r.at.map(v=>+v.toFixed(2)),r.assist,r.funnel,r.end]);}
  fuzzed={runs,opens,sd:J('{acc:SD36.acc,ref:SD36.ref,room:SD36.room,accBad:SD36.accBad,refBad:SD36.refBad,roomBad:SD36.roomBad,inBox:SD36.inBox,downs:SD36.downs}')};run('ONF36=null;');return fuzzed;};

 check(5,()=>{const F=fuzz();const W=J('WALL36');assert.deepEqual(W.bad,[],'the exact test found the bench in a wall');assert(W.sweep<=0.0001,'between carried frames '+W.sweep);
  assert.equal(W.hold,0,'a holder in a wall');assert.equal(W.raised,0,'a holder on raised ground');assert.equal(W.snap,0,'a player stepped to a stand point through a wall');
  assert.deepEqual(W.settleBad,[],'a glide frame (or the move between two) hit something');assert.equal(W.dissolveBad,0,'a dissolve frame between the ends');assert(W.n>=5000,'frames tested: '+W.n);
  // the settle end points: the three arrangements are clear
  for(const k of ['out','gate','water'])assert.equal(J(`hbDepth36(benchPoseOf36('${k}'))`),0,k+' is clear');
  if(!only||only.includes(4)){assert(W.settle>0,'glide frames tested');assert.equal(W.dissolve,0,'every settle glides');}
  // the openings' fuzz used the walls' sideways help (and the funnel)
  const helped=F.opens.reduce((a,o)=>a+o[3],0),fun=F.opens.reduce((a,o)=>a+o[4],0);assert(helped>0,'the walls’ help was used in the openings’ fuzz');
  return {tested:W.n>=5000,glide:W.settle>0,sweepUnder01mm:W.sweep<=0.0001,fuzz:F.runs,openings:F.opens.map(o=>[o[0],o[1],o[5]]),helpedSteps:helped,funnelSteps:fun};});

 check(6,()=>{
  // lift, then set down on the very next frame: the lifter's step to the stand point ends with the set-down, so nobody is left inside the box
  run(`fresh36();start36();{const e=benchEnd36(BENCH36.pose,1,1.05),w=benchEnd36(BENCH36.pose,0,1.6);at36(0,e[0],e[1]);at36(1,w[0],w[1]+0.25);}frames36(2);press36(0);frames36(6);press36(1);frames36(1);press36(0);frames36(12);`);
  const quick=J('[BENCH36.state,[0,1].map(i=>{const q=pos36(i);return hbInBox36(q[0],q[1],PR-0.02,BENCH36.pose);})]');assert.equal(quick[0],'grounded','set down at once');assert.deepEqual(quick[1],[false,false],'nobody inside the box after a set-down at once');
  // the street: grounded at the courtyard checkpoint, one player beside it and the other out on the street at z 11.5 (walkable, south of the old grid)
  run('fresh36();start36();at36(0,1.4,2.2);at36(1,3.0,10.0);loadAt36(1.41,1.20,170);at36(1,4.0,11.5);frames36(40);');const st=J('[bench36Pose(),BENCH36.stuck,hbMatch36(BENCH36.pose,[pos36(0),pos36(1)])]');
  assert.equal(st[1],false,'a player on the street does not make it stuck');assert.equal(st[2],true,'the harness’s walk agrees');run('reload36();');const rl=J('[bench36Pose(),pos36(1)]');
  assert.deepEqual(rl[0],st[0],'a reload keeps the courtyard pose');assert.deepEqual(rl[1],[4,11.5],'and nobody is moved to the gate');
  // the first gate fallback (5.0, 11.2): lift and set down where it lies, both holders standing at z 11.2 (south of the old grid): accepted
  run(`fresh36();start36();atEnds36({x:5,z:11.2,yaw:0});loadAt36(5,11.2,0);press36(0);frames36(3);press36(1);frames36(3);TOASTS=[];press36(0);frames36(10);`);
  const sa=J('[BENCH36.state,TOASTS.filter(t=>/^Not here/.test(t)).length,bench36Pose()]');assert.equal(sa[0],'grounded','set down by the street gate');assert.equal(sa[1],0,'not refused');
  // a stall at corner 2, set down, both players in the room, then the Menu reset
  walls();run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');const r=J("drive36(PLAN36,7200,seg=>seg>="+SEG.flatDoor+")");assert.equal(r.r,'stop');
  run(`{const B=BENCH36,a=benchAxis36(B.pose.yaw),f=B.front?1:-1;setKeys36(B.mover,combo36(a[0]*f,a[1]*f));}frames36(60);noKeys36();frames36(2);`);
  let tries=0;while(J('BENCH36.state')==='carrying'&&tries++<5)run('press36(0);frames36(10);');assert.equal(J('BENCH36.state'),'grounded','set down at corner 2');
  run('at36(0,-5.6,3.4);at36(1,-6.4,3.4);frames36(2);dispatch("bench36Reset");frames36(2);');const pr=J('bench36Pose()');
  assert(!(Math.abs(pr.x+3.26)<0.01&&Math.abs(pr.z-4.66)<0.01),'never the old room pose');assert.equal(J('hbMatch36(BENCH36.pose,[pos36(0),pos36(1)])'),true,'the reset pose is liftable');
  const cp1=J('BENCH36.CHECK.findIndex(c=>Math.abs(c.x-BENCH36.pose.x)<1e-6&&Math.abs(c.z-BENCH36.pose.z)<1e-6)');assert(cp1>=0,'a checkpoint');
  // nobody can reach any checkpoint (both stand inside walls): the gate, with the players moved there
  run('at36(0,-8.12,4.0);at36(1,-8.12,3.2);dispatch("bench36Reset");frames36(1);');const g=J('[bench36Pose(),pos36(0),pos36(1)]');assert.equal(g[0].x,4);assert.equal(g[0].z,8.6);
  assert(Math.hypot(g[1][0]-3.4,g[1][1]-9.6)<0.7&&Math.hypot(g[2][0]-4.6,g[2][1]-9.6)<0.7,'players at the gate');
  // a save mid-carry with the leading holder on the row, just short of the zone
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J(`drive36(PLAN36,7200,()=>{const B=BENCH36;return B.state==='carrying'&&[0,1].some(i=>{const q=pos36(i);return q[1]>5.8&&q[0]<-2.6;});})`);
  assert.equal(J('BENCH36.state'),'carrying');run('reload36();');const L=J('[BENCH36.state,bench36Pose(),pos36(0),pos36(1)]');assert.equal(L[0],'grounded');
  const okL=J('hbMatch36(BENCH36.pose,[pos36(0),pos36(1)])')||(L[1].x===4&&L[1].z===8.6);assert(okL,'reloads liftable or at the gate');
  // (round 2b) the corner-2 strand itself, fixed in place (the walk below now reaches corner 2 by another way, after the street gate became an
  // opening): set down at (-1.662, 4.537), 239.2 degrees, with the holders stepped back to (-1.098, 3.593) and (-2.678, 5.081), one player
  // has no clear straight step to either end; the game's liftable rule says so, as the harness's own walk does
  {const P='{x:-1.6620892157981344,z:4.53733596734834,yaw:4.1744397198255925}',Q='[[-1.0984756435654959,3.592698607725524],[-2.677555312586156,5.080611020347954]]';
   const st=J(`(fresh36(),start36(),[bench36Liftable(${P},${Q}),hbMatch36(${P},${Q})])`);assert.deepEqual(st,[false,false],'the corner-2 strand: liftable by the game / by the harness’s walk '+JSON.stringify(st));}
  // (round 3, H1) set down every 30 frames from the lift until the bench is through the flat door: every set-down the game accepts is lifted
  // again for real (each player placed at the nearest cell of their end from which the straight step is clear, as the harness's walk finds it,
  // and Act pressed), never stranded at corner 2; then the delivery completes
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');
  const seq=J(`(()=>{const B=BENCH36,out={downs:0,refused:0,fails:[],last:null};let k=0;for(let guard=0;guard<160;guard++){if(B.state!=='carrying'||FOL36.k>${SEG.flatDoor})break;
    for(let f=0;f<30&&B.state==='carrying';f++){follow36(PLAN36);frames36(1);}noKeys36();frames36(1);if(B.state!=='carrying'||FOL36.k>${SEG.flatDoor})break;
    const who=B.holder[k%2];k++;press36(who);frames36(12);if(B.state==='carrying'){out.refused++;FOL36.o=null;continue;}
    out.downs++;const p=bench36Pose(),L=hbLift36();if(!L.ok){out.fails.push([+p.x.toFixed(3),+p.z.toFixed(3),+(p.yaw*180/Math.PI).toFixed(1),FOL36.k,L.tries]);break;}FOL36.o=null;}
   out.last=[B.state,FOL36.k];return out;})()`);
  assert.deepEqual(seq.fails,[],'a set-down the pair could not lift for real: '+JSON.stringify(seq.fails));assert(seq.downs>=20,'set-downs along the way: '+seq.downs);
  assert(seq.last[1]>SEG.flatDoor,'through the flat door: '+JSON.stringify(seq.last));const sq=deliver();assert.equal(J('BENCH36.state'),'choosing','then delivered: '+JSON.stringify(sq));
  // the fuzz last (its set-downs, refusals and positions)
  const F=fuzz();assert.deepEqual(F.sd.accBad,[],'a set-down nobody can lift');assert.deepEqual(F.sd.refBad,[],'a refusal that could have been lifted');assert.deepEqual(F.sd.roomBad,[],'a refusal for no room where both had room');assert.deepEqual(F.sd.inBox,[],'a player inside the grounded bench');
  // (round 3, H1) and every set-down the fuzz made, loaded as it was (the players where it left them), is lifted for real by the harness's walk
  let replayed=0;const rbad=[];
  for(const [x,z,yaw,p0,p1,sig] of F.sd.downs){run(`fresh36();start36();at36(0,${p0[0]},${p0[1]});at36(1,${p1[0]},${p1[1]});loadAt36(${x},${z},${yaw*180/Math.PI},{yaw:${yaw}});`);
   if(J('hbSig36()')!==sig)continue;const g=J('[bench36Pose(),pos36(0),pos36(1)]');
   if(!(g[0].x===x&&g[0].z===z&&g[0].yaw===yaw)){rbad.push(['moved on load',r3(x),r3(z)]);continue;}const L=J('hbLift36()');replayed++;if(!L.ok&&rbad.length<5)rbad.push([r3(x),r3(z),deg(yaw),L.tries]);}
  assert.deepEqual(rbad,[],'a fuzz set-down the pair could not lift for real');assert(replayed>=Math.min(20,F.sd.downs.length),'replayed '+replayed+' of '+F.sd.downs.length);
  return {acc:F.sd.acc,ref:F.sd.ref,room:F.sd.room,liftedForReal:replayed,corner2:{downs:seq.downs,refused:seq.refused},openingRuns:F.opens.length,reset:J('BENCH36.CHECK['+cp1+'].n'),reload:L[1].x===4&&L[1].z===8.6?'gate':'liftable',street:{stuck:st[1],reload:'kept',setDown:sa[0]}};});

 check(7,()=>{walls();run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');const N=PLAN.segments.length,pts=[];for(let k=0;k<12;k++)pts.push(Math.floor(1+k*(N-2)/12));
  const roles=[];for(let k=0;k<12;k++){const at=pts[k];const r=J(`drive36(PLAN36,7200,seg=>seg>=${at})`);if(r.r!=='stop'&&J('BENCH36.state')!=='carrying')break;
   const holder=k%2;let tries=0;while(J('BENCH36.state')==='carrying'&&tries<10){run(`press36(${holder});frames36(10);`);if(J('BENCH36.state')==='carrying'){tries++;J('drive36(PLAN36,6)');}}
   assert.equal(J('BENCH36.state'),'grounded','set down '+k);run(`press36(${holder});frames36(3);`);assert.equal(J('BENCH36.state'),'ready');const m0=J('BENCH36.mover');run(`press36(${holder});frames36(3);`);
   assert.equal(J('BENCH36.mover'),1-m0,'swapped');run(`press36(${1-holder});frames36(9);`);assert.equal(J('BENCH36.state'),'carrying','lifted '+k);
   const m=J('BENCH36.mover'),pr=J("[0,1].map(i=>[document.getElementById('prole'+i).textContent,document.getElementById('pr'+i).innerHTML])");
   assert.equal(pr[m][0],'Bench · Move');assert.equal(pr[1-m][0],'Bench · Turn');assert(pr[m][1].includes('role36 move')&&pr[1-m][1].includes('role36 turn'),'chips follow the swap');roles.push(m);}
  const d=deliver();assert.equal(J('BENCH36.state'),'choosing','completed: '+JSON.stringify(d)+' '+JSON.stringify(J('[FOL36.k,bench36Pose(),BENCH36.front,BENCH36.mover,BENCH36.stuck,BENCH36.wall]')));return {points:pts,movers:roles,setdowns:J('benchStats36().setdowns'),swaps:J('benchStats36().swaps')};});

 check(8,()=>{const res={};for(const fps of [60,30]){run(`fresh36();start36();DT36=1000/${fps};`);
   // P1 takes the east end and moves: east into the stair rail
   run('{const e=benchEnd36(BENCH36.pose,1,1.05),w=benchEnd36(BENCH36.pose,0,1.05);at36(0,e[0],e[1]);at36(1,w[0],w[1]);}frames36(2);press36(0);frames36(3);press36(1);frames36(3);');assert.equal(J('BENCH36.state'),'carrying');
   run(`var GS36={poses:[],moving:[],off:[],b0:BENCH36.bump,cue:null};ONF36=()=>{const B=BENCH36;GS36.poses.push([B.pose.x,B.pose.z,B.pose.yaw,B.wall.s]);GS36.moving.push(B.movedPrev);GS36.off.push(Math.hypot(B.g.position.x-B.pose.x,B.g.position.z-B.pose.z));
    if(!GS36.cue&&B.bump>GS36.b0){const m=B.motes.map(o=>[o.m.position.x,o.m.position.z]),cx=m.reduce((a,q)=>a+q[0],0)/m.length,cz=m.reduce((a,q)=>a+q[1],0)/m.length;
     GS36.cue={who:B.bumpMsg&&B.bumpMsg.who,thing:B.bumpMsg&&B.bumpMsg.thing,feet:Math.hypot(cx-pos36(0)[0],cz-pos36(0)[1]),pr:[0,1].map(i=>document.getElementById('pr'+i).innerHTML.replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim())};}};`);
   run(`{const a=benchAxis36(BENCH36.pose.yaw);setKeys36(0,combo36(a[0],a[1]));}`);const n=Math.round(3.0*fps);run(`frames36(${n});noKeys36();frames36(${Math.round(0.3*fps)});`);
   const G=J('GS36');const c=G.poses.findIndex(p=>p[3]!==0);assert(c>0,'reached the rail');const after=G.poses.slice(c),p0=after[0];let maxD=0;for(const p of after)maxD=Math.max(maxD,Math.hypot(p[0]-p0[0],p[1]-p0[1]));
   assert(maxD<=0.001,'moved '+maxD+' after contact');const settled=after.slice(2);assert(settled.every(p=>p[0]===settled[0][0]&&p[1]===settled[0][1]&&p[2]===settled[0][2]),'identical frame to frame');
   const mv=G.moving.slice(c+2,c+2+2*fps);let flips=0;for(let k=1;k<mv.length;k++)if(mv[k]!==mv[k-1])flips++;assert.equal(flips,0,'the walking flag flickers');assert(mv.every(v=>v===false),'still after contact');
   const bumps=J('BENCH36.bump')-G.b0;assert(bumps<=1+Math.floor(2/0.4),'bumps '+bumps);assert(Math.max(...G.off)<=0.06,'recoil '+Math.max(...G.off));assert(G.off[G.off.length-1]<1e-9,'the mesh returns to the pose');
   // the rail is at x 5.9: the leading holder (at 0.9 m from the centre) stops 0.22 m short of it
   assert(Math.abs(p0[0]+0.9+0.22-5.9)<=0.002,'the holder’s body meets the rail at its squeezed-in radius: centre '+p0[0]);
   assert.equal(G.cue.who,0,'the cue is the leading holder’s');assert.equal(G.cue.thing,'wall');assert(G.cue.feet<=0.35,'the dust rises beside that holder: '+G.cue.feet);
   assert(G.cue.pr[0].includes('You’re up against the wall.')&&G.cue.pr[1].includes('Efe is up against the wall.'),'both prompts say so: '+JSON.stringify(G.cue.pr));
   res[fps]={contactFrame:c,contactX:r3(p0[0]),moved:r3(maxD*1000),bumps,recoil:r3(Math.max(...G.off)),cue:G.cue.pr};}
  return res;});

 check(9,()=>{// outside the cone for 5 s: not stuck, the arrow hint after 0.6 s
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);');run('{const B=BENCH36,a=benchAxis36(B.pose.yaw);setKeys36(B.mover,combo36(-a[1],a[0]));}frames36(15);');const early=J('BENCH36.arrowShown[BENCH36.mover]');
  run('frames36(6);');const shown=J('BENCH36.arrowShown[BENCH36.mover]');run('frames36(130);');const notStuck=J('BENCH36.stuck');run('noKeys36();frames36(2);');
  assert.equal(early,'','no arrow before 0.6 s');assert.equal(shown,'hint','the arrow hint shows');assert.equal(notStuck,false,'out-of-cone input is never stuck');
  // Turn aid 1: the turner's key outside its cone (along the bench) shows the turner's arrow after 0.35 s, not before
  run('{const B=BENCH36,a=benchAxis36(B.pose.yaw);setKeys36(1-B.mover,combo36(a[0],a[1]));}frames36(9);');const tEarly=J('[BENCH36.arrowShown[1-BENCH36.mover],BENCH36.outT[1]]');
  run('frames36(3);');const tShown=J('[BENCH36.arrowShown[1-BENCH36.mover],BENCH36.outT[1]]');run('noKeys36();frames36(2);');
  assert.equal(tEarly[0],'','no turner arrow at 0.3 s: '+JSON.stringify(tEarly));assert.equal(tShown[0],'hint','the turner’s arrow at 0.4 s: '+JSON.stringify(tShown));
  // wedged at corner 2: the mover pushes on into the vestibule wall
  run('FOL36.k=0;FOL36.o=null;');const r=J('drive36(PLAN36,7200,seg=>seg>='+SEG.corner2+')');assert.equal(r.r,'stop');run(`{const B=BENCH36,a=benchAxis36(B.pose.yaw),f=B.front?1:-1;setKeys36(B.mover,combo36(a[0]*f,a[1]*f));}`);for(let k=0;k<60&&!J('BENCH36.wall.s');k++)run('frames36(1)');run('frames36(90);');
  const stuck=J('[BENCH36.stuck,BENCH36.stuckT,bench36Pose(),BENCH36.wall,BENCH36.front,FOL36.k,BENCH36.state,BENCH36.mover]');
  assert(stuck[2].x<-1.0&&stuck[2].x>-2.35&&stuck[2].z>4.0&&stuck[2].z<5.6&&stuck[5]>=SEG.corner2,'wedged at corner 2 (the porch turn after the passage): '+JSON.stringify(stuck[2]));const hint=J("document.getElementById('pr'+BENCH36.mover).innerHTML"),card=J("[0,1].map(i=>document.getElementById('prole'+i).textContent)");run('noKeys36();frames36(2);');
  assert.equal(card[stuck[7]],'Bench · Move','while stuck the mover’s card keeps the role (round 3, RP-11): '+JSON.stringify(card));assert.equal(card[1-stuck[7]],'Bench · Turn','and the turner’s: '+JSON.stringify(card));assert.equal(stuck[0],true,'stuck after 3 s: '+JSON.stringify(stuck));
  assert(hint.includes('<span class="hint36">Stuck? Back up a little, or set it down and swap roles.</span>'),'the stuck hint is in the prompt: '+hint);
  // set down: the stall is over, and a player at an end gets the end, never the reset
  let tries=0;while(J('BENCH36.state')==='carrying'&&tries++<5)run('press36(0);frames36(10);');assert.equal(J('BENCH36.state'),'grounded');run('frames36(9);');
  const after=J("[BENCH36.stuck,[0,1].map(i=>document.getElementById('pr'+i).innerHTML+document.getElementById('prole'+i).textContent).join('|'),hotspotCache.map(h=>h&&h.label)]");
  assert.equal(after[0],false,'a set-down ends the stall');assert(!after[1].includes('Stuck?'),'no stuck hint after the set-down');assert.deepEqual(after[2],['Take this end','Take this end'],'both at the ends get the end');
  // the crate pushed onto one end: nobody can lift it, so it is stuck and "Reset the bench" is offered beside it; Act puts it on a checkpoint
  run('{const B=BENCH36,q=pos36(0),e0=benchEnd36(B.pose,0),e1=benchEnd36(B.pose,1),e=Math.hypot(q[0]-e0[0],q[1]-e0[1])>Math.hypot(q[0]-e1[0],q[1]-e1[1])?e0:e1;crate.position.set(e[0],0,e[1]);}frames36(40);');assert.equal(J('BENCH36.stuck'),true,'an end nobody can reach makes it stuck');
  assert.equal(J('hotspotCache[0]&&hotspotCache[0].label'),'Take this end','next to an end, Take wins over the reset');
  run('{const B=BENCH36,c=Math.cos(B.pose.yaw),s=Math.sin(B.pose.yaw);for(const sg of [1,-1]){const x=B.pose.x+sg*0.62*s,z=B.pose.z+sg*0.62*c;if(!blocked(x,z,PR)){at36(1,x,z);break;}}}frames36(2);');
  const lab=J('hotspotCache[1]&&hotspotCache[1].label');assert.equal(lab,'Reset the bench','the reset hotspot');run('press36(1);frames36(2);');
  const cp=J('BENCH36.CHECK.findIndex(c=>Math.abs(c.x-BENCH36.pose.x)<1e-6&&Math.abs(c.z-BENCH36.pose.z)<1e-6)');assert(cp>=0,'on a checkpoint');assert.equal(J('hbMatch36(BENCH36.pose,[pos36(0),pos36(1)])'),true,'liftable');
  assert.equal(J('benchCrateIntrudes36(crate.position.x,crate.position.z)'),false,'the crate moved clear');
  // the Menu reset with the bench in the passage
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J('drive36(PLAN36,7200,()=>BENCH36.pose.x<-1.15&&BENCH36.pose.z>2.4)');const inP=J('bench36Pose()');assert(inP.x<-1.15&&inP.x>-2.35&&inP.z>1.6&&inP.z<3.2,'in the passage');
  // Turn aid 2: in the passage the turner swings into the wall, lets go and tries again: the third refusal within 4 s puts the lines up
  const aid=[];run('noKeys36();frames36(6);');for(let k=0;k<3;k++){run(`{const B=BENCH36,f=B.front?1:-1;setKeys36(1-B.mover,combo36(Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f));}`);
   for(let j=0;j<45&&J('BENCH36.wall.w')===0;j++)run('frames36(1)');run('frames36(3);noKeys36();frames36(9);');aid.push(J("[0,1].map(i=>document.getElementById('pr'+i).innerHTML.replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim())"));}
  const mv=J('BENCH36.mover'),mvN=J('benchPlayerName36(BENCH36.mover)'),tnN=J('benchPlayerName36(1-BENCH36.mover)');
  const TL=`Your end is on the wall. Try the other way, or ask ${mvN} to back up a little.`,ML=`${tnN} needs room. Back up a little.`;
  assert(!aid[1][1-mv].includes(TL)&&!aid[1][mv].includes(ML),'not after two refusals: '+JSON.stringify(aid[1]));
  assert(aid[2][1-mv].includes(TL),'the turner’s line after three: '+aid[2][1-mv]);assert(aid[2][mv].includes(ML),'the mover’s line after three: '+aid[2][mv]);
  run('frames36(130);');const gone=J("[0,1].map(i=>document.getElementById('pr'+i).innerHTML).join('|')");assert(!gone.includes('needs room'),'the lines go after 4 s');
  // (round 3, RP-3) one swing held against the wall for 1.5 s brings the lines too (a held push is one refusal, never three)
  run(`{const B=BENCH36,f=B.front?1:-1;setKeys36(1-B.mover,combo36(Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f));}`);for(let j=0;j<45&&J('BENCH36.wall.w')===0;j++)run('frames36(1)');
  run('frames36(20);');const held1=J("document.getElementById('pr'+(1-BENCH36.mover)).innerHTML");run('frames36(30);');const held2=J("document.getElementById('pr'+(1-BENCH36.mover)).innerHTML");run('noKeys36();frames36(2);');
  assert(!held1.includes('Try the other way'),'not after 0.7 s held: '+held1);assert(held2.includes('Try the other way'),'a swing held against the wall for 1.5 s brings the turner’s line: '+held2);run('frames36(130);');
  run('openMenu();');const menu=J('panel.innerHTML');assert(menu.includes('data-act="bench36Reset"'),'the Menu offers the reset');assert(menu.indexOf('bench36Reset')<menu.indexOf('<h2>'),'at the top of the Menu');run('dispatch("bench36Reset");frames36(1);');
  const cp2=J('BENCH36.CHECK.findIndex(c=>Math.abs(c.x-BENCH36.pose.x)<1e-6&&Math.abs(c.z-BENCH36.pose.z)<1e-6)');assert.equal(J('BENCH36.state'),'grounded');assert(cp2>=0,'menu reset on a checkpoint');
  // (round 3, RP-1) the turner's hint points the way that swings the leading end towards the next corner, at the four corner poses of check 3,
  // and sits beside the turner's own end; on a phone it keeps clear of the prompt card. The harness finds the way itself: of the two small swings,
  // the one that brings the leading end's direction closer to the next corner's, and the push that moves the turner's end that way
  const turnHint=[];
  for(const nm of ['inside the gate 40° off','corner 1 half-turned','flat door 20° off','veranda doorway 15° off'])for(const [w,h,touch] of [[1280,800,false],[390,844,true]]){
   const [x,z,dg]=J(`SOLOP36[${JSON.stringify(nm)}]`);run(`screen36(1280,800,false);`);assert(J(`!!liftAt36(${x},${z},${dg})`),nm+' lifted');run(`screen36(${w},${h},${touch});frames36(20);`);
   const r=J(`(()=>{const B=BENCH36,t=1-B.mover,f=B.front?1:-1,e=[Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f];let kc=null,kd=2;   // the key furthest outside the turner's cone
     for(const kx of [-1,0,1])for(const kz of [-1,0,1]){if(!kx&&!kz)continue;const v=rawOf36(kx,kz),d=Math.abs(v[0]*e[0]+v[1]*e[1]);if(d<kd-1e-9){kd=d;kc=[kx,kz];}}setKeys36(t,kc);frames36(15);const P=bench36Pose(),W=B.ROUTE[B.corner];
     const ang=y=>{const u=[Math.cos(y),-Math.sin(y)],v=[W.x-P.x,W.z-P.z],lead=u[0]*v[0]+u[1]*v[1]>=0?1:-1;return Math.acos(Math.max(-1,Math.min(1,lead*(u[0]*v[0]+u[1]*v[1])/Math.hypot(v[0],v[1]))));};
     const s=ang(P.yaw+0.05)<ang(P.yaw-0.05)?1:-1,rear=B.front?0:1,end=y=>{const u=[Math.cos(y),-Math.sin(y)],sg=rear?1:-1;return [P.x+u[0]*0.9*sg,P.z+u[1]*0.9*sg];},e0=end(P.yaw),e1=end(P.yaw+s*0.01),d=[e1[0]-e0[0],e1[1]-e0[1]];
     const c=cams[t],vp=v21Viewport(t);c.updateMatrixWorld();const n=Math.hypot(d[0],d[1]),A=new THREE.Vector3(P.x,0.4,P.z).project(c),Bp=new THREE.Vector3(P.x+d[0]/n,0.4,P.z+d[1]/n).project(c),want=Math.atan2(-(Bp.y-A.y)*vp.h,(Bp.x-A.x)*vp.w)*180/Math.PI;
     const q=new THREE.Vector3(e0[0],B.y+0.9,e0[1]).project(c),endPx=[(q.x+1)/2*vp.w,(1-q.y)/2*vp.h],got=B.arrowAng[t],pos=B.arrowPos&&B.arrowPos[t];let off=got==null?null:Math.abs(got-want)%360;if(off!==null&&off>180)off=360-off;
     const portrait=innerHeight>innerWidth,tch=navigator.maxTouchPoints>0,pw=vp.w*(portrait?0.38:innerWidth<=820?0.58:0.6),pb=tch?(portrait&&t===0?14:160):14,ph=portrait?130:90,R={x1:vp.w-12-pw,y1:vp.h-pb-ph,x2:vp.w-12,y2:vp.h-pb};
     const clear=!!pos&&(pos[0]+89<=R.x1||pos[0]-89>=R.x2||pos[1]+39<=R.y1||pos[1]-39>=R.y2),shown=B.arrowShown[t];noKeys36();frames36(2);
     return {shown,off,pos,near:pos?Math.hypot(pos[0]-endPx[0],pos[1]-endPx[1]):null,clear};})()`);
   assert.equal(r.shown,'hint',nm+' '+w+': the turner’s hint shows');assert(r.off!==null&&r.off<=3,nm+' '+w+': the hint points '+r.off+' degrees off the way that turns towards the next corner');
   if(!touch)assert(r.near!==null&&r.near<=40,nm+': the hint sits beside the turner’s end ('+r.near+' px)');else assert(r.clear,nm+' '+w+': the hint is over the prompt card '+JSON.stringify(r.pos));
   turnHint.push([nm,w,r3(r.off),r.near===null?null:Math.round(r.near)]);}
  run('screen36(1280,800,false);');
  // (round 3, RP-2 and RP-5) wedged just inside the street gate, its west end in the corner: a set-down there would be refused, so the stuck line
  // says so and the holders' Act puts it back (onto a liftable checkpoint) instead of offering a set-down it would refuse; meanwhile the gate
  // pillar between a camera and the holder behind it fades, and it is itself again once the bench is down
  // (round 3, M1 and RP-2) wedged in that corner and stuck, the line no longer suggests a set-down ("Too tight to set down here. Back up a
  // little."); a set-down pressed anyway is refused for what is true (the holder in the corner has no free spot to step back to: on rings of
  // 0.1-0.6 m round their stand point the harness finds none clear of the walls and the bench), and from then on the holders' Act puts it back
  assert(J('!!liftAt36(3.2,5.0,200)'),'lifted inside the gate');run(`{const B=BENCH36,a=benchAxis36(B.pose.yaw),f=B.front?1:-1,w=a[0]*f<0?1:-1;setKeys36(B.mover,combo36(a[0]*f*w,a[1]*f*w));}frames36(120);`);
  const PIL=`(()=>{const out=[],bb=new THREE.Box3();scene.traverse(m=>{if(!m.isMesh||m.isSkinnedMesh)return;bb.setFromObject(m);if(bb.max.y>1.5&&bb.min.x>=2.74&&bb.max.x<=3.26&&bb.min.z>=5.72&&bb.max.z<=6.24)out.push(+m.material.opacity.toFixed(3));});return out;})()`;
  const LBL=`[BENCH36.stuck,bench36Pose(),hotspotCache.map(h=>h&&h.label),[0,1].map(i=>document.getElementById('pr'+i).innerHTML.replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim())]`;
  const pre=J(LBL);assert.equal(pre[0],true,'wedged and stuck: '+JSON.stringify(pre));assert.deepEqual(pre[2],['Set the bench down','Set the bench down'],'before a refusal the Act is the set-down: '+JSON.stringify(pre[2]));
  for(const t of pre[3])assert(t.includes('Too tight to set down here. Back up a little.')&&!t.includes('set it down and swap')&&!t.includes('press Act'),'the stuck line does not suggest a set-down: '+t);
  run('TOASTS=[];press36(BENCH36.holder[0]);frames36(12);');
  const room=J(`(()=>{const B=BENCH36,P=bench36Pose(),t=TOASTS.slice(),m=/^Not here: (.*) has no room to step back\\. Carry it on a little first\\.$/.exec(t[0]||'');if(!m)return {t,state:B.state};const i=[0,1].find(k=>benchPlayerName36(k)===m[1]),e=benchHolderOf36(i),E=hbEnds36(P)[e];let free=0;
    for(let rad=0;rad<=0.601;rad+=0.1)for(let a=0;a<16;a++){const x=E[0]+Math.sin(a/16*Math.PI*2)*rad,z=E[1]+Math.cos(a/16*Math.PI*2)*rad;if(!blocked(x,z,PR,{noBench:true})&&!hbInBox36(x,z,PR,P)&&carryLevelOK34(x,z))free++;if(rad===0)break;}return {t,who:m[1],state:B.state,free};})()`);
  assert.equal(room.state,'carrying','refused: '+JSON.stringify(room));assert.equal(room.free,0,'the named holder truly has no room: '+JSON.stringify(room));
  const wedge=J(LBL);assert.deepEqual(wedge[2],['Put it back','Put it back'],'after the refusal the holders are offered to put it back: '+JSON.stringify(wedge[2]));
  for(const t of wedge[3])assert(t.includes('Too tight to set down here. Back up a little, or press Act to put it back.'),'the stuck line says so: '+t);
  run('TOASTS=[];press36(BENCH36.holder[0]);frames36(4);');const pb=J(`[BENCH36.state,BENCH36.CHECK.findIndex(c=>Math.abs(c.x-BENCH36.pose.x)<1e-6&&Math.abs(c.z-BENCH36.pose.z)<1e-6),hbMatch36(BENCH36.pose,[pos36(0),pos36(1)]),TOASTS.slice()]`);
  assert.equal(pb[0],'grounded','put back');assert(pb[1]>=0,'on a checkpoint');assert.equal(pb[2],true,'liftable');
  // carried west through the gate with its far holder behind the west pillar (the cameras look from the south-east): the pillar fades, and is
  // itself again once the bench is set down
  assert(J('!!liftAt36(3.4,4.9,185)'),'lifted in the gate');run('frames36(30);');const pil=J(PIL);run('press36(BENCH36.holder[0]);frames36(12);');const pil2=J(`[BENCH36.state,${PIL}]`);
  assert(pil.length>=2&&Math.min(...pil)<0.5,'the gate pillar fades while it hides a holder: '+JSON.stringify(pil));assert.equal(pil2[0],'grounded');assert(pil2[1].every(o=>o===1),'the pillar is itself again: '+JSON.stringify(pil2));
  return {corner2:{segment:SEG.corner2,at:[r3(stuck[2].x),r3(stuck[2].z),deg(stuck[2].yaw)]},stuckAfter:r3(stuck[1]),turnerArrowAt:r3(tShown[1]),reset:J('BENCH36.CHECK['+cp+'].n'),turnAid:[aid[2][1-mv],aid[2][mv]],menuReset:J('BENCH36.CHECK['+cp2+'].n'),
   turnHint,putBack:{at:[r3(wedge[1].x),r3(wedge[1].z),deg(wedge[1].yaw)],to:J('BENCH36.CHECK['+pb[1]+'].n')},noRoom:room.t[0],pillar:Math.min(...pil)};});

 check(10,()=>{const out={};const setup=()=>{run('fresh36();start36();');run(`{const e=benchEnd36(BENCH36.pose,1,1.05),w=benchEnd36(BENCH36.pose,0,1.05);at36(0,e[0],e[1]);at36(1,w[0],w[1]);}frames36(2);press36(0);frames36(3);press36(1);frames36(3);`);
   assert.equal(J('BENCH36.state'),'carrying');};
  const mKey=sg=>`{const B=BENCH36,a=benchAxis36(B.pose.yaw),f=B.front?1:-1;setKeys36(B.mover,combo36(a[0]*f*${sg},a[1]*f*${sg}));}`;
  const tKey=sg=>`{const B=BENCH36,f=B.front?1:-1;setKeys36(1-B.mover,combo36(Math.sin(B.pose.yaw)*f*${sg},Math.cos(B.pose.yaw)*f*${sg}));}`;
  setup();// taps (100 ms = 3 frames at 30 fps), west, away from the rail
  let p0=J('bench36Pose()');run(mKey(-1)+'frames36(3);noKeys36();frames36(10);');let p1=J('bench36Pose()');out.tap=r3(Math.hypot(p1.x-p0.x,p1.z-p0.z)*100);assert(out.tap<=3,'tap '+out.tap+' cm');
  p0=p1;run(tKey(1)+'frames36(3);noKeys36();frames36(10);');p1=J('bench36Pose()');out.tapTurn=deg(Math.abs(p1.yaw-p0.yaw));assert(out.tapTurn<=1.5,'turn tap '+out.tapTurn);
  run(tKey(-1)+'frames36(3);noKeys36();frames36(10);');
  // full speed back (west) then release: the coast; speeds both ways
  run(mKey(-1)+'frames36(30);');const a1=J('bench36Pose()');run('frames36(9);');const a2=J('bench36Pose()');const vBack=Math.hypot(a2.x-a1.x,a2.z-a1.z)/0.3;run('noKeys36();');const c0=J('bench36Pose()');run('frames36(15);');const c1=J('bench36Pose()');
  out.coast=r3(Math.hypot(c1.x-c0.x,c1.z-c0.z)*100);assert(out.coast<=5,'coast '+out.coast);
  run(mKey(1)+'frames36(30);');const b1=J('bench36Pose()');run('frames36(9);');const b2=J('bench36Pose()');const vFwd=Math.hypot(b2.x-b1.x,b2.z-b1.z)/0.3;run('noKeys36();frames36(15);');
  out.speeds=[r3(vFwd),r3(vBack)];assert(Math.abs(vFwd-vBack)<1e-6,'equal speeds '+out.speeds);
  // one held key: the plan's first 95-degree turn (back a little first, as the plan does)
  setup();run(mKey(-1)+'frames36(3);noKeys36();frames36(6);');const y0=J('BENCH36.pose.yaw');const combo=J(`(()=>{const B=BENCH36,f=B.front?1:-1;return combo36(Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f);})()`);
  let turned=0;for(let k=0;k<120;k++){run(`setKeys36(1-BENCH36.mover,${JSON.stringify(combo)});frames36(1);`);turned=Math.abs(J('BENCH36.pose.yaw')-y0);if(turned>=95*Math.PI/180)break;}
  run('noKeys36();frames36(10);');out.heldTurn=deg(turned);assert(turned>=95*Math.PI/180,'a held key turned '+out.heldTurn);
  const cc=J('BENCH36.pose.yaw');run(`setKeys36(1-BENCH36.mover,${JSON.stringify(combo)});frames36(1);noKeys36();frames36(5);`);
  // the Menu mid-carry: open (the step is paused), close: at rest, no lurch
  run(mKey(-1)+'frames36(20);');const vm=J('BENCH36.vel.s');run('openMenu();overlayOn36(true);frames36(8);closePanel();overlayOn36(false);');const vAfter=J('[BENCH36.vel.s,BENCH36.vel.w]');const pm=J('bench36Pose()');run('frames36(1);');const pn=J('bench36Pose()');
  assert(Math.abs(vm)>0.5,'moving before the Menu');assert.deepEqual(vAfter,[0,0],'at rest after the Menu');assert(Math.hypot(pn.x-pm.x,pn.z-pm.z)<0.002,'no lurch');
  out.menu='rest';return out;});

 check(11,()=>{const out={};run('fresh36();at36(0,-5.2,3.6);at36(1,-6.2,3.6);');
  for(const [nm,extra] of [['default',null],['chairs',{type:'chairs',x:5,y:4}],['armchair',{type:'armchair',x:5,y:4}]]){run(`S.home.items=S.home.items.filter(i=>!/^lay/.test(i.id));${extra?`S.home.items.push(Object.assign({id:'lay1',rot:0},${JSON.stringify(extra)}));`:''}rebuildFurniture();`);
   const r=J(`['out','gate','water'].map(k=>{const n=TUNE35.reachRuns;const s=cellToWorld(4,3);const free=!blocked(s[0],s[1]+0.05,PR,{noCrate:true,noSofa:true});const ok=bench36ArrangementOK(k);return [ok,TUNE35.reachRuns-n,free];})`);
   for(const x of r){assert.equal(x[0],true,nm+' arrangement');assert.equal(x[1],1,'a reach run');assert.equal(x[2],true,'reach start free');}out[nm]=r.map(x=>x[0]);}
  run("S.home.items=S.home.items.filter(i=>!/^lay/.test(i.id));rebuildFurniture();");
  // the first chooser: the doorway bench lies over the reach start, the candidates are still judged on their own
  run('start36();takeEnds36('+FE+',0);lift36(0,1);');deliver({fresh:true});assert.equal(J('BENCH36.state'),'choosing');run('save();var CH36=localStorage.getItem(KEY);');
  const s=J("(()=>{const s=cellToWorld(4,3);return !!blocked(s[0],s[1]+0.05,PR,{noCrate:true,noSofa:true});})()");
  // the chooser checks the selected arrangement when it opens and the others one a frame after
  run('frames36(3);');
  const inside=J("['out','gate','water'].map(k=>bench36ArrangementOK(k))");assert.deepEqual(inside,[true,true,true],'in the first chooser');assert.deepEqual(J("BENCH36.okCache"),{out:true,gate:true,water:true});
  run("BENCH36.POSES.test36={name:'Test',x:-6.44,z:6.12,yaw:0,desc:''};");const blockOK=J("bench36ArrangementOK('test36')");run('delete BENCH36.POSES.test36;');assert.equal(blockOK,false,'a candidate over the pot keep fails');
  // the ghost stands at the pose; one agreement does not commit; a change clears both
  const gh=J("(()=>{const g=BENCH36.mesh.ghost;g.updateMatrixWorld(true);const p=new THREE.Vector3().setFromMatrixPosition(g.matrixWorld),q=benchPoseOf36(BENCH36.choice);return [Math.abs(p.x-q.x)<1e-9&&Math.abs(p.z-q.z)<1e-9,Math.abs(g.rotation.y-q.yaw)<1e-9];})()");assert.deepEqual(gh,[true,true],'ghost at the pose');
  run('press36(0);frames36(2);');assert.deepEqual(J('[BENCH36.state,BENCH36.agree]'),['choosing',[true,false]],'one agreement does not commit');
  run("keys['d']=true;frames36(2);keys['d']=false;frames36(2);");assert.deepEqual(J('[BENCH36.choice,BENCH36.agree]'),['gate',[false,false]],'a change clears both');
  // a player standing where the gate arrangement goes is moved clear first
  run('at36(1,-5.95,6.4);frames36(1);press36(0);frames36(1);press36(1);frames36(1);');assert.equal(J('BENCH36.state'),'settling');const pl=J('pos36(1)');
  assert.equal(J(`(()=>{const b=benchBox36(benchPoseOf36('gate'),0);return bench36CircleOBB(${pl[0]},${pl[1]},PR,b);})()`),false,'the player is clear of the gate box');
  for(let k=0;k<400&&J('BENCH36.state')==='settling';k++)run('frames36(1)');
  const item=J("S.home.items.find(i=>i.type==='bench')");delete item.id;assert.deepEqual(item,{type:'bench',x:0,y:4,rot:0,pose36:'gate'});
  assert.equal(J("LOG35.has(S.day,'place','bench')"),true,'the day log has place bench:veranda');assert.equal(J("LOG35.events(S.day).filter(e=>e.k==='place').map(e=>e.a).pop()"),'bench:veranda');
  // a piece beside the doorway (cell 5,4) leaves the row holder nowhere to step aside: the bench still glides, in two legs (the room holder steps
  // aside, the bench backs into the room, the row holder comes in through the doorway, the bench goes out to its place)
  walls();const legs={},bad0=J('WALL36.settleBad.length'),g0=J('WALL36.settle');
  for(const [nm,extra,key] of [['armchair',{type:'armchair',x:5,y:4},'out'],['armchair',{type:'armchair',x:5,y:4},'gate'],['armchair',{type:'armchair',x:5,y:4},'water'],['chairs',{type:'chairs',x:5,y:4},'water'],['plant',{type:'plant',x:5,y:4},'gate']]){
   run(`{const o=JSON.parse(CH36);o.home.items.push(Object.assign({id:'lay2',rot:0},${JSON.stringify(extra)}));localStorage.setItem(KEY,JSON.stringify(o));S=load();enterWorld();closePanel();frames36(4);}`);
   assert.equal(J('BENCH36.state'),'choosing',nm+': the chooser is back');assert.equal(agreeOn(key),'placed',nm+' '+key+' placed');
   assert.equal(J('BENCH36.lastSettle'),'glide',nm+' '+key+' glides');legs[nm+' '+key]=J('BENCH36.lastLegs');assert.equal(J("S.home.items.find(i=>i.type==='bench').pose36"),key);}
  assert.equal(J('WALL36.settleBad.length'),bad0,'a glide frame hit something: '+JSON.stringify(J('WALL36.settleBad')));assert(J('WALL36.settle')>g0,'glide frames tested');
  out.chooser={doorwayCoversStart:s,inside};out.kind=J("BENCH36.states.includes('settling')");out.legs=legs;return out;});

 check(12,()=>{const out={};
  // placed: pose, mesh transform and pose36 survive
  run("fresh36();life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'water',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i90',type:'bench',x:0,y:4,rot:0,pose36:'water'});reload36();");
  const g=J("(()=>{const g=furnGroup.children.find(c=>c.userData.furnitureType==='bench');return [g.position.x,g.position.y,g.position.z,g.rotation.y];})()"),w=J("benchPoseOf36('water')");
  assert.deepEqual([g[0],g[2],g[3]],[w.x,w.z,w.yaw],'placed mesh at the pose');run('reload36();');assert.deepEqual(J("(()=>{const g=furnGroup.children.find(c=>c.userData.furnitureType==='bench');return [g.position.x,g.position.y,g.position.z,g.rotation.y];})()"),g);
  assert.equal(J("S.home.items.find(i=>i.type==='bench').pose36"),'water');assert.equal(J('BENCH36.state'),'placed');
  // mid-carry: the same pose, grounded and liftable
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J('drive36(PLAN36,7200,seg=>seg>='+SEG.courtyard+')');assert.equal(J('BENCH36.state'),'carrying');const pc=J('bench36Pose()');run('reload36();');
  const pr=J('[BENCH36.state,bench36Pose()]');assert.equal(pr[0],'grounded');assert.deepEqual(pr[1],pc,'reloaded at the pose it was saved at');assert.equal(J('hbMatch36(BENCH36.pose,[pos36(0),pos36(1)])'),true,'liftable');
  const mesh=J('[BENCH36.g.position.x,BENCH36.g.position.z,BENCH36.g.rotation.y]');assert.deepEqual(mesh,[pc.x,pc.z,pc.yaw],'mesh at the pose');
  // the chooser comes back
  run('takeEnds36(BENCH36.front,BENCH36.mover);');run('lift36(BENCH36.mover,1-BENCH36.mover);');J('drive36(PLAN36,7200)');assert.equal(J('BENCH36.state'),'choosing');run("keys['d']=true;frames36(2);keys['d']=false;frames36(2);reload36();");
  assert.deepEqual(J('[BENCH36.state,BENCH36.choice,!!BENCH36.mesh.ghost&&BENCH36.mesh.ghost.visible]'),['choosing','gate',true],'the chooser reopens');
  // an old save: nothing added
  run("fresh36();delete S.life.bench36;S.home.items=S.home.items.filter(i=>i.type!=='bench');reload36();");assert.deepEqual(J("[BENCH36.state,!!(S.life&&S.life.bench36),S.home.items.some(i=>i.type==='bench'),!!scene.getObjectByName('bench36')]"),['off',false,false,false]);
  // placed with no item heals
  run("life34();S.life.bench36={v:1,state:'placed',choice:'gate'};reload36();");assert.deepEqual(J("[BENCH36.state,S.home.items.filter(i=>i.type==='bench').map(i=>i.pose36)]"),['placed',['gate']]);
  // online: only {v,state,choice}; a delivery in progress is not shared
  const st=J("stripState().life.bench36");assert.deepEqual(st,{v:1,state:'placed',choice:'gate'});run("S.life.bench36.state='grounded';");assert.equal(J("'bench36' in stripState().life"),false);run("S.life.bench36.state='placed';");
  // ?bench=fresh applies once
  run("location.search='?bench=fresh';BENCH36.readFlags();reload36();");assert.equal(J('BENCH36.state'),'grounded','the fresh flag starts a delivery');assert.equal(J('S.life.bench36.again'),true);
  run("ACTIONS.bench36Cancel();BENCH36.flags=null;location.search='?bench=fresh';BENCH36.readFlags();reload36();");assert.equal(J('BENCH36.state'),'placed','a second load with the same address does not');run("location.search='';BENCH36.flags=null;");
  // Build: no store, no pick-up, neither button
  const id=J("S.home.items.find(i=>i.type==='bench').id");run(`TOASTS=[];dispatch('storeitem',{id:'${id}'});dispatch('pickup',{id:'${id}',i:0});`);assert.equal(J("S.home.items.some(i=>i.type==='bench')"),true,'still placed');assert.equal(J("TOASTS.filter(t=>/stays where you put it/.test(t)).length"),2);
  run('at36(0,-5.2,3.6);openBuild();');const b=J('panel.innerHTML');assert(b.includes('Wooden bench'),'listed');assert(!b.includes(`data-act="pickup" data-id="${id}"`)&&!b.includes(`data-act="storeitem" data-id="${id}"`),'no buttons for the bench');run('closePanel();');
  // a fresh delivery's chooser (placed: Gate): browse to Water, save, leave the bench where it was
  run(`fresh36();life34();S.life.bench36={v:1,state:'choosing',pos:[-4.0166,5.0218],yaw:4.5307,mover:0,choice:'gate',deliveries:1,again:true,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i96',type:'bench',x:0,y:4,rot:0,pose36:'gate'});
   at36(0,-4.2154,6.1037);at36(1,-3.8178,3.9399);reload36();frames36(3);`);assert.deepEqual(J('[BENCH36.state,BENCH36.choice]'),['choosing','gate'],'the fresh delivery’s chooser, on Gate');
  run("keys['d']=true;frames36(2);keys['d']=false;frames36(2);save();");const br=J('[BENCH36.choice,S.life.bench36.choice,stripState().life]');assert.equal(br[0],'water');assert.equal(br[1],'gate','the saved arrangement is still Gate');assert.equal('bench36' in br[2],false,'not shared mid-run');
  run('ACTIONS.bench36Cancel();frames36(2);');const lv=J("[S.life.bench36.choice,S.life.bench36.pick===undefined,stripState().life.bench36,S.home.items.find(i=>i.type==='bench').pose36]");
  assert.deepEqual(lv,['gate',true,{v:1,state:'placed',choice:'gate'},'gate'],'left where it was: Gate everywhere');run('ACTIONS.bench36Again();');assert.equal(J('BENCH36.choice'),'gate','the next run starts from Gate');run('ACTIONS.bench36Cancel();');
  // playtest: the next run starts each player in the job the other started the last one with, whoever ended up walking it after a swap
  run("fresh36();life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:true,runs:[],firstMover:1,lastMover:0};S.home.items.push({id:'i97',type:'bench',x:0,y:4,rot:0,pose36:'out'});reload36();ACTIONS.bench36Again();");
  assert.equal(J('BENCH36.mover'),0,'started by Player 2 walking it, so Player 1 walks it next');
  // that run is lifted (Player 1 walking it) and then left where it was: the cancelled run leaves no trace, so the next one starts the same
  run('takeEnds36('+FE+',0);lift36(0,1);');assert.equal(J('BENCH36.state'),'carrying','the again run lifted');run('ACTIONS.bench36Cancel();frames36(1);');
  const kept=J('[S.life.bench36.firstMover,S.life.bench36.mover,S.life.bench36.keep36===undefined]');assert.deepEqual(kept,[1,0,true],'a cancelled run puts back the first mover and the mover: '+JSON.stringify(kept));
  run('ACTIONS.bench36Again();');assert.equal(J('BENCH36.mover'),0,'the next run is pre-swapped from the completed run, not the cancelled one');run('ACTIONS.bench36Cancel();');
  // (round 3, L1) a chooser save whose browsed arrangement is none of the three, in an again run whose saved choice is none of them either: the
  // chooser opens on Out and the frames run; paused and lifted there again, the again run's chooser opens on Out too
  run("fresh36();chooserAt36({again:true,choice:'sideways',pick:'nonsense'});frames36(10);");assert.deepEqual(J('[BENCH36.state,BENCH36.choice]'),['choosing','out'],'an unknown browsed arrangement');
  run('dispatch("bench36Pause");frames36(3);');assert.equal(J('BENCH36.state'),'grounded');
  run('{const B=BENCH36,e0=benchEnd36(B.pose,0,1.0),e1=benchEnd36(B.pose,1,1.0);at36(0,e0[0],e0[1]);at36(1,e1[0],e1[1]);}frames36(2);press36(0);frames36(3);press36(1);frames36(10);');
  assert.deepEqual(J('[BENCH36.state,BENCH36.choice]'),['choosing','out'],'an unknown saved choice in an again run');
  out.placed=w;out.carry=true;return {unknownKeys:'out',placed:[r3(w.x),r3(w.z),deg(w.yaw)],carry:'grounded',strip:st,browse:'kept',preSwap:'from the first mover',cancelled:'no trace'};});

 check(13,()=>{run("fresh36();life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i91',type:'bench',x:0,y:4,rot:0,pose36:'out'});reload36();");
  run('at36(0,-5.95,6.4);at36(1,-5.4,6.5);frames36(2);');assert.equal(J('hotspotCache[0].label'),'Sit on the bench together');run('press36(0);frames36(3);');
  const s=J("players.map(p=>{const h=p.g.hero.bones.hips.getWorldPosition(new THREE.Vector3()),f=p.g.hero.bones.leftfoot.getWorldPosition(new THREE.Vector3());return [h.y,f.y,p.g.sitting,new THREE.Euler().setFromQuaternion(p.g.quaternion,'YXZ').y,p.g.position.x,p.g.position.z];})");
  for(const p of s){assert.equal(p[2],true,'sitting');assert(Math.abs(p[0]-0.61)<=0.03,'hips '+p[0]);assert(p[1]<=0.2,'feet '+p[1]);assert(Math.abs(p[3])<=2*Math.PI/180,'facing '+p[3]);}
  assert(Math.abs(Math.hypot(s[0][4]-s[1][4],s[0][5]-s[1][5])-0.72)<0.01,'seats 0.72 apart');
  run('openMenu();closePanel();frames36(2);');assert.equal(J('[BENCH36.state,SEATING30.active].join()'),'seated,true','the Menu keeps them seated');
  run("setKeys36(0,[0,-1]);frames36(10);noKeys36();frames36(1);");const st=J('[BENCH36.state,SEATING30.active,pos36(0),pos36(1)]');assert.equal(st[0],'placed');assert.equal(st[1],false);
  for(const q of [st[2],st[3]])assert.equal(J(`!!blocked(${q[0]},${q[1]},PR)`),false,'stands on a free spot');
  // past midnight: Start day, nobody sitting, both in the room, the save agrees
  run('frames36(2);press36(0);frames36(3);');assert.equal(J('BENCH36.state'),'seated');run('S.time=24.1;');for(let k=0;k<200&&!J('S._late');k++)run('frames36(5)');assert(J('/Past midnight/.test(PH)'),'the past-midnight panel');
  run("dispatch('nextday');frames36(2);");const n=J("[players.map(p=>p.g.sitting),SEATING30.active,BENCH36.state,pos36(0),pos36(1),S.p.map(p=>p.pos)]");
  assert.deepEqual(n[0],[false,false]);assert.equal(n[1],false);assert.equal(n[2],'placed');assert.deepEqual([n[3],n[4]],[[-6.2,4.4],[-5.2,4.4]],'both in the room');assert.deepEqual(n[5],[[-6.2,4.4],[-5.2,4.4]],'the save says so');
  // a day change by any other route (as a shared document arriving online would) stands them up at the next panel close
  run('at36(0,-5.95,6.4);at36(1,-5.4,6.5);frames36(2);press36(0);frames36(3);');assert.equal(J('BENCH36.state'),'seated');run('S.day++;openMenu();closePanel();frames36(1);');assert.equal(J('[BENCH36.state,SEATING30.active].join()'),'placed,false','stood up after the day changed');
  return {hips:r3(s[0][0]),feet:r3(s[0][1]),apart:r3(Math.hypot(s[0][4]-s[1][4],s[0][5]-s[1][5]))};});

 check(14,()=>{const res={desk:[],phone:[]};run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');
  run('var CD36={max:0,prev:null,skip:0};ONF36=()=>{const d=[v21Dist[0],v21Dist[1]];if(CD36.prev&&!CD36.skip&&BENCH36.state==="carrying")for(const i of [0,1])CD36.max=Math.max(CD36.max,Math.abs(d[i]-CD36.prev[i])/CD36.prev[i]);if(CD36.skip)CD36.skip--;CD36.prev=d;};');
  run(`var view36=i=>{const vp=v21Viewport(i),c=cams[i];c.aspect=vp.w/vp.h;c.updateProjectionMatrix();c.updateMatrixWorld();const lo=-1+2*vp.bottom/vp.h,hi=1-2*vp.top/vp.h,v=new THREE.Vector3();
    const inside=pts=>pts.every(([x,y,z])=>{v.set(x,y,z).project(c);return Math.abs(v.x)<=0.82+0.02&&v.y>=lo-0.02&&v.y<=hi+0.02;});const B=BENCH36,info=B.camInfo&&B.camInfo[i]||{};
    const obb=[];{const cc=Math.cos(B.pose.yaw),s=Math.sin(B.pose.yaw);for(const [a,b] of [[-.76,-.26],[.76,-.26],[.76,.26],[-.76,.26]])for(const y of [B.y,B.y+0.95])obb.push([B.pose.x+a*cc+b*s,y,B.pose.z-a*s+b*cc]);}
    const hold=players.map(p=>{const q=p.g.position;const a=[];for(const dx of [-.3,.3])for(const y of [0,1.9])for(const dz of [-.3,.3])a.push([q.x+dx,y,q.z+dz]);return a;});
    const corner=info.P?[[info.P[0]-.3,0,info.P[1]-.3],[info.P[0]+.3,.6,info.P[1]+.3]]:[];
    const px=players.map(p=>{const q=p.g.position;const a=new THREE.Vector3(q.x,0,q.z).project(c),b=new THREE.Vector3(q.x,1.9,q.z).project(c);return (b.y-a.y)/2*vp.h;});
    // where this view draws the next corner, from the bench (the corner taken at most 4 m out, as the arrow does)
    const W=B.ROUTE[B.corner];let want=null;if(W){const dx=W.x-B.pose.x,dz=W.z-B.pose.z,n=Math.hypot(dx,dz)||1,k=Math.min(1,4/n),a=new THREE.Vector3(B.pose.x,0.4,B.pose.z).project(c),b=new THREE.Vector3(B.pose.x+dx*k,0.4,B.pose.z+dz*k).project(c);want=Math.atan2(-(b.y-a.y)*vp.h,(b.x-a.x)*vp.w)*180/Math.PI;}
    const ang=B.arrowAng&&B.arrowAng[i],ap=B.arrowPos&&B.arrowPos[i];let off=null;if(ang!=null&&want!=null){off=Math.abs(ang-want)%360;if(off>180)off=360-off;}
    const apIn=!!ap&&ap[0]>=vp.w*0.1&&ap[0]<=vp.w*0.9&&ap[1]>=vp.top&&ap[1]<=vp.h-vp.bottom;
    // the prompt card where the stylesheets put it (right 12 px; bottom 14 px, 160 px over the thumbs, 100 px on a short landscape phone; at most
    // 60%, 58% or 38% wide; 90 px tall, 130 px in portrait), and the arrow's box (170 x 70 px round its point)
    const portrait=innerHeight>innerWidth,tch=navigator.maxTouchPoints>0,shortL=tch&&!portrait&&innerHeight<=520,pw=vp.w*(portrait?0.38:innerWidth<=820?0.58:0.6),pb=shortL?100:tch?(portrait&&i===0?14:160):14,ph=portrait?130:shortL?80:90;
    const PR_={x1:vp.w-12-pw,y1:vp.h-pb-ph,x2:vp.w-12,y2:vp.h-pb},prClear=!ap||ap[0]+85<=PR_.x1||ap[0]-85>=PR_.x2||ap[1]+35<=PR_.y1||ap[1]-35>=PR_.y2;
    const pr=document.getElementById('pr'+i).innerHTML;return {ap,prClear,Hu:vp.h-vp.top-vp.bottom,bench:inside(obb),holders:inside(hold[0])&&inside(hold[1]),corner:info.P?inside(corner):null,kept:!!info.kept,dropped:!!info.dropped,arrow:!!info.arrow,px:Math.min(...px),chip:pr.includes('role36 '+(i===B.mover?'move':'turn')),off,apIn,shown:B.arrowShown[i]};};`);
  const N=J('BENCH36.CHECK.length');let next=0;const seen=[];
  for(let f=0;f<7200&&J('BENCH36.state')==='carrying';){const r=J(`drive36(PLAN36,7200,()=>{const c=BENCH36.CHECK[${next}];return c&&Math.hypot(BENCH36.pose.x-c.x,BENCH36.pose.z-c.z)<=1.0;})`);f+=r.f;if(r.r!=='stop')break;
   const at={cp:J(`BENCH36.CHECK[${next}].n`)};
   for(const [w,h,touch,key] of [[1280,800,false,'d1'],[1280,720,false,'d2'],[390,844,true,'p1'],[844,390,true,'p2']]){run(`screen36(${w},${h},${touch});CD36.skip=45;frames36(40);`);at[key]=J('[view36(0),view36(1)]');}
   run('screen36(1280,800,false);CD36.skip=45;frames36(30);');seen.push(at);next++;if(next>=N)break;}
  assert.equal(seen.length,N,'reached the five checkpoints: '+seen.length);let edges=0;
  for(const at of seen){for(const k of ['d1','d2'])for(const v of at[k]){assert(v.bench&&v.holders,`${at.cp} ${k}: bench and holders in view`);assert.equal(v.kept,true,`${at.cp} ${k}: corner point kept`);assert.equal(v.corner,true,`${at.cp} ${k}: corner in view`);assert(v.px>=70,`${at.cp} ${k}: ${v.px} px`);assert.equal(v.chip,true,`${at.cp} ${k}: chip`);}
   for(const k of ['p1','p2'])for(const v of at[k]){assert(v.Hu<260&&!v.kept&&v.arrow,`${at.cp} ${k}: dropped for the arrow`);if(v.shown==='edge'){edges++;assert(v.off!==null&&v.off<=3,`${at.cp} ${k}: the arrow points ${v.off} degrees off the corner`);assert(v.apIn,`${at.cp} ${k}: the arrow sits on the edge of the framed area`);
     assert(v.prClear,`${at.cp} ${k}: the arrow and its caption lie over the prompt card (round 3, M3) `+JSON.stringify(v.ap));}}
   res.desk.push({cp:at.cp,px:at.d1.map(v=>Math.round(v.px)).concat(at.d2.map(v=>Math.round(v.px)))});res.phone.push({cp:at.cp,px:at.p1.map(v=>Math.round(v.px)).concat(at.p2.map(v=>Math.round(v.px)))});}
  assert(edges>=10,'edge arrows checked: '+edges);res.edgeArrows=edges;
  run('ONF36=null;');J('drive36(PLAN36,7200)');assert.equal(J('BENCH36.state'),'choosing');run('frames36(30);');
  const gh=J(`[0,1].map(i=>{const vp=v21Viewport(i),c=cams[i];c.aspect=vp.w/vp.h;c.updateProjectionMatrix();c.updateMatrixWorld();const lo=-1+2*vp.bottom/vp.h,hi=1-2*vp.top/vp.h,g=BENCH36.mesh.ghost,b=new THREE.Box3().setFromObject(g);let ok=true;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const v=new THREE.Vector3(x,y,z).project(c);if(!(Math.abs(v.x)<=0.84&&v.y>=lo-0.02&&v.y<=hi+0.02))ok=false;}return ok;})`);
  assert.deepEqual(gh,[true,true],'the ghost is in both views');const cd=J('CD36.max');assert(cd<=0.025,'camera distance per frame '+cd);res.camStep=cd<=0.025;
  // (round 3, M3 and RP-4) a whole delivery on each phone screen, every fifth frame: an edge arrow shown in either view never lies over the
  // prompt card (as the stylesheets place it)
  res.phoneDeliveries=[];
  for(const [w,h] of [[390,844],[844,390]]){run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');run(`screen36(${w},${h},true);var PH36={n:0,edge:0,bad:[]};ONF36=()=>{if(++PH36.n%5)return;for(const i of [0,1]){if(BENCH36.arrowShown[i]!=='edge')continue;const v=view36(i);PH36.edge++;if(!v.prClear&&PH36.bad.length<5)PH36.bad.push([i,v.ap,BENCH36.arrowCap[i]]);}};`);
   const d=J('drive36(PLAN36,7200)');const ph=J('PH36');run('ONF36=null;screen36(1280,800,false);');assert.equal(J('BENCH36.state'),'choosing',w+'x'+h+' delivered: '+JSON.stringify(d));
   assert(ph.edge>=20,w+'x'+h+': edge arrows sampled '+ph.edge);assert.deepEqual(ph.bad,[],w+'x'+h+': an edge arrow over the prompt card');res.phoneDeliveries.push([w+'x'+h,ph.edge]);}
  return res;});

 check(15,()=>{const out={};run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);');run('BENCH36.onPadGone({gamepad:{index:BENCH36.holder[0]}});frames36(1);');assert.equal(J('BENCH36.state'),'grounded','a holder’s pad gone: set down');
  run('lift36(0,1);');assert.equal(J('BENCH36.state'),'carrying');run('NET.on=true;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};frames36(2);');const on=J("[BENCH36.state,BENCH36.paused,BENCH36.g.visible,(()=>{const p=BENCH36.pose;return !!blocked(p.x,p.z,0.05);})()]");
  assert.deepEqual(on,['grounded',true,false,false],'online: set down, paused, absent');run('NET.on=false;frames36(2);');assert.equal(J('BENCH36.paused'),false,'back to local play');
  // an open fresh delivery is cancelled online
  run("fresh36();life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i92',type:'bench',x:0,y:4,rot:0,pose36:'out'});reload36();ACTIONS.bench36Again();");
  assert.equal(J('[BENCH36.state,S.life.bench36.again].join()'),'grounded,true');run('NET.on=true;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};frames36(2);');assert.equal(J('[BENCH36.state,S.life.bench36.again].join()'),'placed,false','cancelled online');
  assert.equal(J("furnGroup.children.find(c=>c.userData.furnitureType==='bench').visible"),true,'the placed bench is back');run('NET.on=false;');
  // seated together, then the household goes online: they stand up
  run("frames36(2);at36(0,-5.95,6.4);at36(1,-5.4,6.5);frames36(2);press36(0);frames36(3);");assert.equal(J('BENCH36.state'),'seated');run('NET.on=true;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};frames36(3);');
  assert.deepEqual(J('[BENCH36.state,SEATING30.active,players.map(p=>!!p.g.sitting)]'),['placed',false,[false,false]],'online: stood up');run('NET.on=false;frames36(1);');
  // back on one device after a player stood where the absent bench lay (in the passage): the player is moved clear and the bench stays where it was
  run(`fresh36();start36();atEnds36({x:-1.568,z:2.6,yaw:-Math.PI/2});loadAt36(-1.568,2.6,-90);NET.on=true;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};frames36(3);at36(0,-1.47,2.6);frames36(2);NET.on=false;frames36(3);`);
  const back=J('[bench36Pose(),BENCH36.paused,(()=>{const q=pos36(0);return hbInBox36(q[0],q[1],PR-0.02,BENCH36.pose);})()]');assert.deepEqual([back[0].x,back[0].z],[-1.568,2.6],'the bench stays in the passage');assert.equal(back[1],false);assert.equal(back[2],false,'the player is moved clear');
  // an online household (day 2, the sofa in) is told why there is no bench
  run('fresh36();NET.on=true;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};openMenu();');assert(J('panel.innerHTML').includes('Carry Ada’s bench when you are both on one device.'),'the one-device line online');run('closePanel();NET.on=false;');
  // a first delivery left for now: the bench goes, the progress stays, the offer comes back (and survives a reload)
  run('fresh36();start36();openMenu();');assert(J('panel.innerHTML').includes('data-act="bench36Leave"'),'the Menu offers to leave it');run('dispatch("bench36Leave");frames36(2);');
  assert.deepEqual(J("[BENCH36.state,S.life.bench36.state,!!scene.getObjectByName('bench36')]"),['off','off',false],'left for now');run('reload36();openMenu();');
  assert(J('panel.innerHTML').includes('data-act="bench36Start"'),'the offer is back');assert.equal(J('start36()'),'grounded','and it can be fetched again');
  // a companion household: no offer; with ?bench= the line, and nothing spawns
  run("NET.on=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();dispatch('movein');closePanel();sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();openMenu();");
  const m0=J('panel.innerHTML');assert(m0.includes('needs two pairs of hands'),'the two-hands line for a companion household, with no flag');assert(!/bench36Start|Ada left her bench/.test(m0),'no offer for a companion household');
  run("location.search='?bench=on';BENCH36.readFlags();openMenu();");const m1=J('panel.innerHTML');assert(m1.includes('needs two pairs of hands'),'the two-hands line');assert(!m1.includes('bench36Start'),'no offer');
  run("TOASTS=[];bench36Start();");assert.equal(J('BENCH36.state'),'off','nothing spawns');run("location.search='';BENCH36.flags=null;closePanel();AI.on=false;");
  // the evening waits while the bench is in hands (carried in the room), starts once it lies on the ground, and starts once it is placed
  run(`fresh36();S.day=3;S.time=17;start36();atEnds36({x:-3.6,z:4.3,yaw:Math.PI/2});loadAt36(-3.6,4.3,90);press36(0);frames36(3);press36(1);frames36(3);S.time=18.5;`);
  assert.equal(J('BENCH36.state'),'carrying');const p0=J('EVENING35.pending()');run('frames36(90);');const ev=J('[EVENING35.state,EVENING35.pending()]');
  assert.deepEqual(ev,['idle',p0],'no evening while the bench is carried, pending() unchanged');assert.equal(p0,true);
  run('press36(0);frames36(10);');assert.equal(J('BENCH36.state'),'grounded');run('frames36(60);');assert.notEqual(J('EVENING35.state'),'idle','the evening starts with the bench lying on the ground');run('EVENING35.abort(false);');
  run("save();loadFixture36(o=>{o.life.bench36.state='placed';o.life.bench36.choice='out';o.life.bench36.placedDay=2;o.home.items.push({id:'i93',type:'bench',x:0,y:4,rot:0,pose36:'out'});});at36(0,-5.2,3.6);at36(1,-6.2,3.6);frames36(60);");
  assert.notEqual(J('EVENING35.state'),'idle','the evening starts once the bench is placed');run('EVENING35.abort(false);');
  // Ada, the day after placement: adb36 once
  run("S.time=10;");const t1=J("talk(0,'ada')"),t2=J("talk(0,'ada')");assert(t1.includes('Then it is yours twice'),'adb36: '+t1.slice(0,120));assert(!t2.includes('Then it is yours twice'),'once');
  out.evening='waits while carried';out.adb36=true;out.lines=J("Object.keys(LINES35).filter(k=>Array.isArray(LINES35[k])).map(k=>k+':'+LINES35[k].length).join(',')");
  assert(!/adb36|ae36/.test(J("JSON.stringify(LINES35)")),'LINES35 has no v36 entry');return out;});

 check(16,()=>{const out={};for(const k of ['out','gate','water']){run(`fresh36();life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'${k}',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i94',type:'bench',x:0,y:4,rot:0,pose36:'${k}'});reload36();`);
   run('at36(0,-5.6,6.35);at36(1,-5.2,4.4);frames36(2);');const pot=J('hotspotCache[0].label');assert(/pepper pot|Harvest your peppers/.test(pot),k+': pot point gives '+pot);
   run('at36(0,-5.95,6.4);frames36(2);');const sit=J('hotspotCache[0].label');assert(/^(Sit on the bench together|Wait for Ola)$/.test(sit),k+': '+sit);out[k]=[pot,sit];}
  run('fresh36();start36();');const e=J('benchEnd36(BENCH36.pose,1,1.05)');run(`at36(0,${e[0]},${e[1]-0.05});at36(1,${e[0]},${e[1]+0.05});frames36(2);TOASTS=[];press36(0);press36(1);frames36(2);`);
  const r=J('[BENCH36.state,BENCH36.holder,TOASTS.slice(-1)[0]]');assert.equal(r[0],'ready');assert.equal(r[1].filter(x=>x!==null).length,1,'one holder');assert.equal(r[2],'Efe has that end. Take the other one.');out.same=r[2];
  // the room checkpoint lies across the veranda doorway's mouth: from the row, the straight step to the south stand point cuts the jamb
  run(`fresh36();start36();atEnds36({x:-3.6,z:4.3,yaw:Math.PI/2});loadAt36(-3.6,4.3,90);at36(0,-3.95,5.9);frames36(3);TOASTS=[];`);
  const round=J('hotspotCache[0]&&hotspotCache[0].label');assert.equal(round,'Come round to this end','from round the jamb');run('press36(0);frames36(3);');
  assert.deepEqual(J('[BENCH36.state,TOASTS.slice(-1)[0]]'),['grounded','Come round to this end first.'],'no slide through the jamb');
  run('at36(0,-3.6,5.25);frames36(3);');assert.equal(J('hotspotCache[0]&&hotspotCache[0].label'),'Take this end','straight on');run('press36(0);frames36(3);');assert.equal(J('BENCH36.state'),'ready');out.round=round;return out;});

 check(17,()=>{run('fresh36();');
  run(`var CO36={on:false,bl:0,box:0,frames:[],idle:[]};{const b=blocked;blocked=function(){if(CO36.on)CO36.bl++;return b.apply(this,arguments);};const o=bench36ObbHit;bench36ObbHit=function(){if(CO36.on)CO36.box++;return o.apply(this,arguments);};
   const helped=()=>(BENCH36.cost.assist||0)+(BENCH36.cost.funnel||0);const st=bench36Step;bench36Step=function(dt){const s0=BENCH36.state,n0=BENCH36.cost.substeps,h0=helped();CO36.on=true;CO36.bl=0;CO36.box=0;try{return st.apply(this,arguments);}finally{CO36.on=false;const n=BENCH36.cost.substeps-n0;if(s0==='carrying'&&BENCH36.state==='carrying')CO36.frames.push([n,CO36.bl,CO36.box,helped()>h0?1:0]);else if(s0==='off'||s0==='placed')CO36.idle.push(CO36.bl);}};
   const hk=bench36Hot;HOTSPOT_HOOKS[HOTSPOT_HOOKS.indexOf(hk)]=function(){CO36.on=true;const c0=CO36.bl;try{return hk.apply(this,arguments);}finally{CO36.on=false;if(BENCH36.state==='off'||BENCH36.state==='placed')CO36.idle.push(CO36.bl-c0);CO36.bl=c0;}};}`);
  // the bench's own work each frame (all of tick: an Act's work too), counted: planner box tests, arrangement checks, walks and their cells
  // and each frame's work weighed in box tests (a planner gap or a box test 1, a blocked() call 3, one answered from the module's index 1/4, a
  // walk cell 1/64; the harness's own weights, measured: a gap about 5 microseconds, a full blocked() call 13-15, a cell under 0.1)
  run(`var W17={prev:null,max:{},plan:0,choose:0,work:0,workAt:'',chooseWork:0,delivArr:-1},W17on=()=>{ONF36=()=>{const c=BENCH36.cost,s=BENCH36.state,fast=c.fast||0;if(W17.prev&&s!=='off'&&s!=='placed'){const P=W17.prev;for(const k of ['nodes','arr','bfs','cells'])W17.max[k]=Math.max(W17.max[k]||0,c[k]-P[k]);
    const w=(c.nodes-P.nodes)+(c.box-P.box)+3*(c.blocked-P.blocked-(fast-P.fast))+0.25*(fast-P.fast)+(c.cells-P.cells)/64;if(w>W17.work){W17.work=w;W17.workAt=P.s+'>'+s;}if(s==='choosing'||P.s==='choosing')W17.chooseWork=Math.max(W17.chooseWork,w);if(P.s!=='choosing'&&s==='choosing')W17.delivArr=c.arr-P.arr;
    if(s==='choosing')W17.choose++;if(s==='settling'&&BENCH36.settle&&BENCH36.settle.kind==='plan'&&BENCH36.settleFrames>0)W17.plan++;}W17.prev={nodes:c.nodes,arr:c.arr,bfs:c.bfs,cells:c.cells,box:c.box,blocked:c.blocked,fast,s};};};`);
  run('frames36(30);start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J('drive36(PLAN36,7200,seg=>seg>='+SEG.corner1+')');
  run(`{const B=BENCH36,a=benchAxis36(B.pose.yaw),f=B.front?1:-1;setKeys36(B.mover,combo36(-a[0]*f,-a[1]*f));setKeys36(1-B.mover,combo36(Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f));}frames36(60);noKeys36();frames36(5);`);
  run('FOL36.o=null;');J('drive36(PLAN36,1500)');
  // the walls at work: a push scraping along the passage's east wall 20 degrees off (sideways help to its cap), then swings into the walls
  run(`liftAt36(-1.75,1.0,290,[[0,0]]);{const B=BENCH36;setKeys36(B.mover,combo36(0,1));frames36(60);noKeys36();const f=B.front?1:-1;for(const sg of [1,-1]){setKeys36(1-B.mover,combo36(Math.sin(B.pose.yaw)*f*sg,Math.cos(B.pose.yaw)*f*sg));frames36(45);noKeys36();frames36(6);}}`);
  run('fresh36();start36();W17on();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J('drive36(PLAN36,7200)');assert.equal(J('BENCH36.state'),'choosing','delivered');
  run('frames36(40);');assert.equal(agreeOn('water'),'placed');const W17=J('W17');run('ONF36=null;');
  assert(W17.max.arr<=1,'arrangement checks in one frame: '+W17.max.arr);assert(W17.max.nodes<=J('BENCH_PLAN36.FRAME'),'planner box tests in one frame: '+W17.max.nodes);
  assert.equal(W17.plan,0,'the glide was planned before both agreed');
  assert.equal(W17.delivArr,0,'the frame the chooser opens in runs no arrangement check (the selected one is checked in the next)');
  // the reach run's index answers exactly as the full list: every point of the walk window (and beyond it) at 0.33 and 0.05 m, with each
  // arrangement's box in place
  const eq=J(`(()=>{let n=0,diff=0;const slow=blocked,B=BENCH36;if(typeof benchReachFast36!=='function')return [0,0];for(const k of B.ORDER){B.override=benchBox36(benchPoseOf36(k),0);benchReachFast36(()=>{const fast=blocked;for(let x=-9.05;x<=10.05;x+=0.13)for(let z=-3.55;z<=16.05;z+=0.11)for(const r of [0.33,0.05]){n++;if(fast(x,z,r,{noCrate:true,noSofa:true})!==slow(x,z,r,{noCrate:true,noSofa:true}))diff++;}});}B.override=null;return [n,diff];})()`);
  assert(eq[0]>50000&&eq[1]===0,'the reach index gives the same answers: '+JSON.stringify(eq));
  assert(W17.work<=1200,'no frame from the lift to the bench in its place weighs more than 1,200 box tests (about 6 ms): '+r3(W17.work)+' at '+W17.workAt);
  run("fresh36();life34();S.life.bench36={v:1,state:'placed',pos:[0,0],yaw:0,mover:0,choice:'out',deliveries:1,again:false,hints:2,placedDay:2,playtest:false,runs:[]};S.home.items.push({id:'i95',type:'bench',x:0,y:4,rot:0,pose36:'out'});reload36();at36(0,-5.95,6.4);at36(1,-5.4,6.5);");assert.equal(J('BENCH36.state'),'placed');
  run('frames36(30);');const C=J('CO36');let worst={sub:0,bl:0,box:0},aw={n:0,bl:0,box:0};for(const [n,bl,box,hp] of C.frames){if(!n)continue;worst.sub=Math.max(worst.sub,n);worst.bl=Math.max(worst.bl,(bl-4)/n);worst.box=Math.max(worst.box,(box-2)/n);
   if(hp){aw.n++;aw.bl=Math.max(aw.bl,(bl-4)/n);aw.box=Math.max(aw.box,(box-2)/n);}}
  assert(aw.n>0,'frames on which the walls helped: '+aw.n);
  assert(worst.sub<=2,'sub-steps '+worst.sub);assert(worst.bl<=24,'blocked() calls a sub-step '+worst.bl);assert(worst.box<=12,'box tests a sub-step '+worst.box);
  assert(C.idle.length>0&&C.idle.every(v=>v===0),'idle frames call blocked(): '+C.idle.length+' '+JSON.stringify(C.idle.filter(v=>v).slice(0,5)));
  return {frames:C.frames.length,subMax:worst.sub,blockedMax:worst.bl,boxMax:worst.box,helped:{frames:aw.n,blockedMax:aw.bl,boxMax:aw.box},idle:Math.max(...C.idle),frameMax:W17.max,workMax:Math.round(W17.work),chooserWorkMax:Math.round(W17.chooseWork),indexSame:eq};});

 check(18,()=>{run('fresh36();');
  // the page's classes, seen through a recording class list
  run("var CL36=new Set();document.body.classList={add:c=>CL36.add(c),remove:c=>CL36.delete(c),contains:c=>CL36.has(c),toggle:(c,v)=>{const on=v===undefined?!CL36.has(c):!!v;if(on)CL36.add(c);else CL36.delete(c);return on;}};var cls36=()=>[...CL36].filter(c=>/^bench36/.test(c)).sort().join(' ');");
  // Ada's note, the lift toast and the first lift's hints; the area captions (the place-name signs) step out of both views while it is held
  run('PH="";ACTIONS.bench36Start();');const note=J('PH');run('ACTIONS.close();if(!FADEABLE.some(m=>m.isSprite))buildSigns();');
  assert(note.includes('One of you in front to walk it, one behind to turn it. Mind my corners.'),'Ada’s note: '+note);
  const caps=()=>J('FADEABLE.filter(m=>m.isSprite).map(m=>m.visible?1:0).join("")');const cap0=caps();assert(/1/.test(cap0),'the captions show before the lift');
  const e=J('benchEnd36(BENCH36.pose,1,1.05)'),w=J('benchEnd36(BENCH36.pose,0,1.05)');const c0=J('cls36()');run(`at36(0,${e[0]},${e[1]});at36(1,${w[0]},${w[1]});frames36(2);TOASTS=[];press36(0);frames36(2);press36(1);frames36(10);`);
  const lifted=J("[TOASTS.slice(),[0,1].map(i=>document.getElementById('pr'+i).innerHTML)]"),cap1=caps();
  assert(lifted[0].includes('Lifted. Efe walks it, Ola turns it.'),'the lift toast: '+JSON.stringify(lifted[0]));
  assert(lifted[1][0].includes('Push it along: towards your end or away from it.'),'the mover’s hint: '+lifted[1][0]);assert(lifted[1][1].includes('Push your end left or right to turn it.'),'the turner’s hint: '+lifted[1][1]);
  assert(!/1/.test(cap1),'no caption while it is held: '+cap1);
  const g=J('[glyph(0),glyph(1),lastInput.slice()]');assert.equal(g[0],'E');assert.equal(g[1],'⏎');const pr=J("document.getElementById('pr0').innerHTML");assert(pr.startsWith('<span class="k">E</span>'),'P1 prompt glyph');
  const c1=J('cls36()'),xr=J('!!(BENCH36.xray&&BENCH36.xray.visible)');assert.equal(c0,'','nothing marked before the lift');assert.equal(c1,'bench36-busy','held: busy (and not yet compact: the first lift’s hint is showing)');assert.equal(xr,true,'the see-through outline shows while held');
  // the third lift onwards, once its hint time is over: compact
  run('press36(0);frames36(10);S.life.bench36.hints=2;press36(0);frames36(3);press36(1);frames36(6);');const c2=J('cls36()');assert.equal(c2,'bench36-busy bench36-compact','after the first two lifts the carry prompt is compact');
  run('press36(0);frames36(10);');const c3=J('[cls36(),!!(BENCH36.xray&&BENCH36.xray.visible)]');assert.deepEqual(c3,['',false],'on the ground: nothing marked, no outline');
  assert.equal(caps(),cap0,'the same captions are back once it is down');
  run('reload36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J('drive36(PLAN36,7200)');assert.equal(J('BENCH36.state'),'choosing');const c4=J('cls36()');assert.equal(c4,'bench36-busy bench36-choose','the chooser marks the page');
  run('document.body.classList={add(){},remove(){},toggle(){},contains:()=>false};');return {glyphs:[g[0],g[1]],classes:[c0,c1,c2,c3[0],c4],toast:'Lifted. Efe walks it, Ola turns it.',captions:{before:cap0.length,held:cap1.replace(/0/g,'').length}};});
 check(19,()=>{const out={};
  // the openings: the module's measured centres, the harness's own scan of its own box list and the typed centres agree
  run('fresh36();start36();frames36(1);');const chk=J('BENCH36.openChk||null');assert(chk&&chk.list&&chk.list.length===4,'the module measured its four openings: '+JSON.stringify(chk&&chk.list));
  const gaps=J('OPEN19.map(hbGap36)');out.openings=[];
  for(let k=0;k<4;k++){const O=J('OPEN19['+k+']'),M=chk.list[k],g=gaps[k];assert.equal(M.n,O.n);assert(M.ok,O.n+' is on');assert(Math.abs(g.c-O.c)<=0.03,O.n+': the walls say '+g.c);
   assert(Math.abs(M.c-g.c)<=0.005,O.n+': the module measured '+M.c+', the harness '+g.c);out.openings.push([O.n,r3(g.lo),r3(g.hi),r3(M.c)]);}
  // a jamb moved 4 cm (a strip inside the passage's east wall): that opening's funnel goes off, and the log says so; taken away, it is back
  run('var JAMB19={x1:-1.23,x2:-1.15,z1:1.5,z2:2.9,lvl:0};OBS.push(JAMB19);frames36(2);');const off=J('[BENCH36.openChk.list.map(o=>o.ok),(BENCH36.openLog||[]).slice(-1)[0]||""]');
  run('OBS.splice(OBS.indexOf(JAMB19),1);frames36(2);');const back=J('BENCH36.openChk.list.map(o=>o.ok)');
  assert.deepEqual(off[0],[false,true,true,true],'a moved jamb switches its funnel off: '+JSON.stringify(off));assert(/passage/.test(off[1])&&/funnel is off/.test(off[1]),'and logs it: '+off[1]);
  assert.deepEqual(back,[true,true,true,true],'back on once the jamb is back');out.movedJamb=off[1];
  // the funnel: from 5 cm off the centre line on the side the bench's own heading carries it away from, the mover pushes in (at 20 degrees
  // from 10 cm off on the other side, so that the push meets nothing)
  const FUN=[['passage',-1.70,1.0,270,[0,1],60,'z',-1.75,0.6,0.32],['flat door',-1.6,4.95,180,[-1,0],60,'x',4.9,0.6,0.32],['veranda doorway',-4.05,4.7,270,[0,1],60,'z',-4.1,0.32,0.2],['street gate',4.05,5.0,270,[0,1],60,'z',4.0,0.6,0.32]];out.funnel=[];
  for(const [n,x0,z0,base,dir,fr,ax,c,far0,far20] of FUN)for(const th of [5,10,14,20]){const far=th<15?far0:far20,x=th<15||ax==='x'?x0:2*c-x0-0.05,z=th<15||ax==='z'?z0:2*c-z0-0.05;
   const r=J(`push19(${x},${z},${base+th},${JSON.stringify(dir)},${fr},'${ax}',${far})`);assert(!r.err,n+' '+th+': '+r.err);
   const o0=ax==='z'?c-r.p0.x:c-r.p0.z,o1=ax==='z'?c-r.p1.x:c-r.p1.z;assert.equal(r.p1.yaw,r.p0.yaw,`${n} ${th}°: the yaw changed`);assert.equal(r.leak,0);assert(Math.abs(r.along)>0.6*far,`${n} ${th}°: pushed ${r.along} `+JSON.stringify(r));
   if(th<15){assert(Math.abs(o1)<Math.abs(o0),`${n} ${th}°: not drawn to the centre line (${o0} -> ${o1})`);assert(Math.abs(r.shift)<=0.30*Math.abs(r.slide)+1e-9,`${n} ${th}°: sideways ${r.shift} for ${r.slide} pushed`);
    assert(r.funnel>0,`${n} ${th}°: no funnel step`);assert.equal(r.assist,0,`${n} ${th}°: the push met something`);}
   else{assert.equal(r.assist,0,`${n} 20°: the push met something`);assert(Math.abs(r.perp)<=1e-12,`${n} 20°: moved sideways ${r.perp}`);assert.equal(r.funnel,0,`${n} 20°: a funnel step`);}
   out.funnel.push([n,th,r3(r.slide),r3(r.shift),r3(Math.abs(o0)),r3(Math.abs(o1))]);}
  // a refused push: at most 0.15 m of sideways help a contact (20 degrees off in the passage mouth, pushed north, the leading corner scrapes
  // along the east wall; the funnel is off at that angle)
  const P19=[-1.75,1.0,290];const cap=J(`push19(${P19},[0,1],90,'z')`);assert(!cap.err,'cap: '+cap.err);
  assert(Math.abs(cap.perp)<=0.15+1e-9,'sideways help in one contact: '+cap.perp);assert(Math.abs(cap.perp)>=0.1,'the walls helped: '+cap.perp);assert(cap.assist>0);
  // after 0.35 m back (unassisted travel) the allowance is back
  run(`{const B=BENCH36,p=bench36Pose(),a=benchAxis36(p.yaw);setKeys36(B.mover,combo36(a[0]*-1,a[1]*-1));for(let k=0;k<60&&Math.hypot(B.pose.x-p.x,B.pose.z-p.z)<0.35;k++)frames36(1);noKeys36();frames36(8);}`);
  const re=J(`(()=>{const B=BENCH36,p0=bench36Pose(),a0=B.cost.assist;setKeys36(B.mover,combo36(0,1));frames36(60);noKeys36();frames36(8);const p1=bench36Pose(),n=[Math.sin(p0.yaw),Math.cos(p0.yaw)];return {perp:(p1.x-p0.x)*n[0]+(p1.z-p0.z)*n[1],assist:B.cost.assist-a0};})()`);
  assert(re.assist>0&&Math.abs(re.perp)>0.005,'help again after 0.35 m back: '+JSON.stringify(re));
  // after a set-down and lift the allowance is back
  const cap2=J(`push19(${P19},[0,1],90,'z')`);assert(Math.abs(cap2.perp)>=0.1);
  run('{const B=BENCH36,h=B.holder[0];let t=0;while(B.state==="carrying"&&t++<4){press36(h);frames36(10);}}');const down=J('BENCH36.state');
  run('{const B=BENCH36;press36(0);frames36(3);press36(1);frames36(4);}');const up=J('BENCH36.state');
  const sd=J(`(()=>{const B=BENCH36,p0=bench36Pose(),a0=B.cost.assist;setKeys36(B.mover,combo36(0,1));frames36(60);noKeys36();frames36(8);const p1=bench36Pose(),n=[Math.sin(p0.yaw),Math.cos(p0.yaw)];return {perp:(p1.x-p0.x)*n[0]+(p1.z-p0.z)*n[1],assist:B.cost.assist-a0};})()`);
  assert.equal(down,'grounded','set down');assert.equal(up,'carrying','lifted');assert(sd.assist>0&&Math.abs(sd.perp)>0.005,'help again after a set-down and lift: '+JSON.stringify(sd));
  out.cap={first:r3(cap.perp),afterBack:r3(re.perp),afterSetDown:r3(sd.perp)};
  // a 2 cm post just inside the flat door, its corner 7.5 mm into the path of the bench's edge: a correction that would cut the post's corner
  // is refused (it is tested at its midpoint), on every one of ten starts a fraction of a step apart
  walls();run('WALL36.sweep=0;WALL36.bad=[];');out.post=[];
  for(let k=0;k<10;k++){const x0=-2.43-0.0017*k;run(`var POST19={x1:${x0-0.02},x2:${x0},z1:${4.9+0.26-0.0075},z2:${4.9+0.26+0.0125},lvl:0};OBS.push(POST19);`);
   const at=J('liftAt36(-1.5,4.9,180,[[0,0]])');assert(at,'post start lifted');run('WALL36.prev=null;{const B=BENCH36;setKeys36(B.mover,combo36(-1,0));}frames36(45);noKeys36();frames36(4);');
   const r=J('[bench36Pose(),WALL36.sweep,WALL36.bad.length]');run('OBS.splice(OBS.indexOf(POST19),1);');out.post.push(r3(r[0].x));
   assert(r[1]<=0.0001,'the post was cut between frames: '+r[1]+' (start '+k+')');assert.equal(r[2],0,'the bench in the post');assert(r[0].x-0.76<x0-0.1,'the bench’s leading face went past the post: '+r[0].x);}
  return out;});
 check(20,()=>{const names=J('Object.keys(SOLOP36)'),R=solo(names);
  for(const r of R){assert(!r.err,r.name+' '+r.pat+': '+r.err);
   if(r.pat==='turner-random'){assert(r.movedRaw<=0.08+1e-9,`${r.name}: the turner alone moved the centre ${r.movedRaw} m`);assert.equal(r.regions.length,1,`${r.name}: the turner alone took it out of ${r.regions[0]}`);}
   else assert(r.yawMax<=1e-12,`${r.name} ${r.pat}: the mover alone turned it ${r.yawMax} rad`);
   assert(r.regions.length<=2,`${r.name} ${r.pat}: through more than one opening (${r.regions.join(' > ')})`);assert.equal(r.leak,0,r.name+' '+r.pat+': yaw leak');}
  const chose=R.filter(r=>r.chose).map(r=>r.name+' · '+r.pat);
  // the straight pushes in from 15 degrees off in the doorway and from 25 degrees off in the room (the shipped plan's own last move, Move's alone)
  // deliver, as they did before the guided walls; from 45 degrees off the Turn player has to swing it first (round 3, H2)
  assert.deepEqual(chose,['veranda doorway 15° off · ratchet-','veranda doorway 15° off · mover-random','room 25° off the doorway · ratchet+','room 25° off the doorway · mover-random'],'lone deliveries: '+JSON.stringify(chose));
  const helped=R.reduce((a,r)=>a+r.assisted,0);assert(helped>0,'the walls’ help was used in the lone runs: '+helped);assert.equal(leakNow(),0,'BENCH36.yawLeak');
  return {runs:R.map(r=>[r.name,r.pat,r.at.map(v=>+v.toFixed(2)),r.moved,r.regions.join(' > ')+(r.cross.length?' at '+r.cross.join(', ')+'°':''),r.end,r.chose?'chooser':r.state]),lone:chose,helped:helped>0};});
 // the round-2 checks (ideas from build v36-70429384, docs/PROVENANCE.md)
 const dropIt=()=>{let t=0;while(J('BENCH36.state')==='carrying'&&t++<6){run(`press36(BENCH36.holder[0]);frames36(10);`);if(J('BENCH36.state')==='carrying')J('drive36(PLAN36,6)');}return J('BENCH36.state');};
 check(21,()=>{const out={};
  // with no bench about, a repeat still sets the latch, as the base game always did
  run('fresh36();act[0]=false;keyAct36(0,true);');out.offRepeat=J('act[0]');run('act[0]=false;keyUp36(0);');assert.equal(out.offRepeat,true,'outside the bench a repeat is untouched');
  // grounded: Player 1 takes an end with one press, then holds E (20 repeats a frame apart): one holder, roles as they were (a repeat would swap)
  run(`start36();{const e=benchEnd36(BENCH36.pose,${FE},1.05),w=benchEnd36(BENCH36.pose,${1-FE},1.05);at36(0,e[0],e[1]);at36(1,w[0],w[1]);}frames36(2);`);
  run('keyAct36(0,false);frames36(2);');assert.equal(J('BENCH36.state'),'ready');const m0=J('BENCH36.mover');
  for(let k=0;k<20;k++)run('keyAct36(0,true);frames36(1);');
  assert.deepEqual(J('[BENCH36.state,BENCH36.mover,benchStats36().swaps]'),['ready',m0,0],'a held E swapped roles');run('keyUp36(0);');
  // Player 2 lifts with one Enter and holds it while Player 1 holds E again: a repeat would set it down
  run('keyAct36(1,false);frames36(4);');assert.equal(J('BENCH36.state'),'carrying');
  for(let k=0;k<20;k++)run('keyAct36(1,true);keyAct36(0,true);frames36(1);');assert.equal(J('BENCH36.state'),'carrying','a held Act set it down');run('keyUp36(0);keyUp36(1);');
  run('keyAct36(0,false);frames36(12);keyUp36(0);');assert.equal(J('BENCH36.state'),'grounded','one fresh press still sets it down');
  // the chooser: one press agrees, a held E never makes it "Not yet"
  run('chooserAt36();');assert.equal(J('BENCH36.state'),'choosing');run('keyAct36(0,false);frames36(1);');for(let k=0;k<20;k++)run('keyAct36(0,true);frames36(1);');run('keyUp36(0);');
  assert.deepEqual(J('BENCH36.agree'),[true,false],'a held E took the agreement back');
  // sitting: one press sits, a held E never stands them up
  run('placedAt36("out");at36(0,-5.95,6.4);at36(1,-5.4,6.5);frames36(2);keyAct36(0,false);frames36(3);');assert.equal(J('BENCH36.state'),'seated');
  for(let k=0;k<20;k++)run('keyAct36(0,true);frames36(1);');run('keyUp36(0);');assert.equal(J('BENCH36.state'),'seated','a held E stood them up');
  out.repeatsIgnored=J('BENCH36.repeats||0');return out;});

 check(22,()=>{const out={};run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);');assert.equal(J('BENCH36.state'),'carrying');
  // the mover holds a key back along the bench and the other stick leans; the window loses focus mid-push
  run(`{const B=BENCH36,a=benchAxis36(B.pose.yaw),f=B.front?1:-1;setKeys36(B.mover,combo36(-a[0]*f,-a[1]*f));}frames36(20);`);const v0=J('BENCH36.vel.s');assert(Math.abs(v0)>0.5,'pushing before the blur: '+v0);
  run("sticks[1].v=[0.6,-0.6];act[1]=true;fire36('window','blur',{});");const p0=J('bench36Pose()');run('frames36(60);');
  const a=J('[bench36Pose(),BENCH36.state,BENCH36.vel.s,BENCH36.vel.w,Object.keys(keys).filter(k=>keys[k]),sticks.map(s=>s.v),act.slice()]');
  assert.deepEqual(a[0],p0,'the bench moved after the blur');assert.equal(a[1],'carrying','still held');assert.deepEqual([a[2],a[3]],[0,0],'at rest');
  assert.deepEqual(a[4],[],'keys let go');assert.deepEqual(a[5],[[0,0],[0,0]],'sticks let go');assert.deepEqual(a[6],[false,false],'Act latches cleared');
  // the page hidden mid-swing: the turner's key held
  run(`{const B=BENCH36,f=B.front?1:-1;setKeys36(1-B.mover,combo36(Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f));}frames36(8);`);const w0=J('BENCH36.vel.w');assert(Math.abs(w0)>0.1,'swinging: '+w0);
  run("document.hidden=true;document.visibilityState='hidden';fire36('document','visibilitychange',{});document.hidden=false;delete document.visibilityState;");const q0=J('bench36Pose()');run('frames36(60);');
  assert.deepEqual(J('bench36Pose()'),q0,'the bench turned on after the page was hidden');assert.equal(J('BENCH36.state'),'carrying');run('noKeys36();');
  // the chooser: an arrow held through a blur stops stepping
  run("chooserAt36();keys['d']=true;frames36(2);");const c1=J('BENCH36.choice');run("fire36('window','blur',{});frames36(40);");const c2=J('[BENCH36.choice,keys.d]');run("keys['d']=false;");
  assert.notEqual(c1,'out','the arrow stepped once');assert.deepEqual(c2,[c1,false],'the arrow kept stepping after the blur');
  out.blur={moved:0,vel:[0,0]};out.hidden='still';out.chooser=c1;return out;});

 check(23,()=>{const out={},want=300*(1000/30/1000)/60,near=(v,w)=>Math.abs(v-w)<1e-9;
  run('fresh36();S.time=9;start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');let t0=J('S.time');J('drive36(PLAN36,300)');
  out.carried=J('S.time')-t0;assert.equal(J('BENCH36.state'),'carrying');assert.equal(out.carried,0,'the clock moved while carrying: '+out.carried);
  // set down: lying untouched, the clock runs
  assert.equal(dropIt(),'grounded');t0=J('S.time');run('noKeys36();frames36(300);');out.lying=J('S.time')-t0;assert(near(out.lying,want),'lying untouched: '+out.lying);
  // one player holds an end, the other walks off
  run(`press36(0);frames36(3);`);assert.equal(J('BENCH36.state'),'ready');t0=J('S.time');run(`{const q=pos36(1),c=BENCH36.pose,d=Math.hypot(q[0]-c.x,q[1]-c.z)||1;setKeys36(1,combo36((q[0]-c.x)/d,(q[1]-c.z)/d));}frames36(300);noKeys36();`);
  out.oneHolds=J('S.time')-t0;assert(near(out.oneHolds,want),'one holding an end: '+out.oneHolds);
  // a carry begun just before midnight meets no "Past midnight" card
  run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;S.time=24.19;PH="";');J('drive36(PLAN36,300)');const late=J('[S.time,!!S._late,/Past midnight/.test(PH),BENCH36.state]');
  assert.deepEqual(late,[24.19,false,false,'carrying'],'past midnight in a carry: '+JSON.stringify(late));run('S.time=10;');
  // the chooser, then the glide: not a moment of clock
  run('chooserAt36();S.time=11;var CK36={bad:0,n:0,prev:S.time};ONF36=()=>{const s=BENCH36.state;if(s==="choosing"||s==="settling"){CK36.n++;if(S.time!==CK36.prev)CK36.bad++;}CK36.prev=S.time;};');
  run('frames36(300);');out.chooser=J('S.time')-11;assert.equal(out.chooser,0,'the clock moved in the chooser');
  run('press36(0);frames36(1);press36(1);frames36(1);');for(let k=0;k<40&&J('BENCH36.state')==='settling';k++)run('frames36(10)');run('ONF36=null;');
  assert.equal(J('BENCH36.state'),'placed');const ck=J('CK36');assert.equal(ck.bad,0,'the clock moved during the chooser or the glide');assert(ck.n>300,'frames watched: '+ck.n);
  // sitting: the evening still comes
  run('at36(0,-5.95,6.4);at36(1,-5.4,6.5);frames36(2);press36(0);frames36(3);');assert.equal(J('BENCH36.state'),'seated');t0=J('S.time');run('frames36(300);');out.seated=J('S.time')-t0;
  assert(near(out.seated,want),'sitting: '+out.seated);
  return {carried:out.carried,chooserAndGlide:0,lying:r3(out.lying),oneHolds:r3(out.oneHolds),seated:r3(out.seated),late:'no card'};});

 check(24,()=>{const out={};const pill=()=>J('[lifeGuideEl34.style.display,lifeGuideEl34.style.visibility||""]');const mark=()=>run('LIFE34.waypoint={x:-5.6,z:6.35,name:"Your pepper pot"};refreshMarker34();frames36(10);');
  run('fresh36();');mark();const v0=pill();assert.equal(v0[0],'flex','the pill shows');out.before=v0;
  run('start36();frames36(10);');assert.deepEqual(pill(),v0,'on the ground it stays');
  run(`{const e=benchEnd36(BENCH36.pose,${FE},1.05),w=benchEnd36(BENCH36.pose,${1-FE},1.05);at36(0,e[0],e[1]);at36(1,w[0],w[1]);}frames36(2);press36(0);frames36(10);`);assert.equal(J('BENCH36.state'),'ready');
  assert.equal(pill()[1],'hidden','one end taken: hidden');run('press36(1);frames36(10);');assert.equal(J('BENCH36.state'),'carrying');assert.equal(pill()[1],'hidden','carried: hidden');
  assert.equal(dropIt(),'grounded');run('frames36(10);');assert.deepEqual(pill(),v0,'back exactly after the set-down');
  run('chooserAt36();');mark();assert.equal(pill()[1],'hidden','chooser: hidden');run('ACTIONS.bench36RoomDown();frames36(10);');assert.equal(J('BENCH36.state'),'grounded');assert.deepEqual(pill(),v0,'back after the chooser');
  run('placedAt36("gate");');mark();run('at36(0,-5.95,6.4);at36(1,-5.4,6.5);frames36(2);press36(0);frames36(10);');assert.equal(J('BENCH36.state'),'seated');assert.equal(pill()[1],'hidden','sitting: hidden');
  run('setKeys36(0,[0,-1]);frames36(12);noKeys36();frames36(10);');assert.equal(J('BENCH36.state'),'placed');assert.deepEqual(pill(),v0,'back after standing up');
  run('LIFE34.waypoint=null;refreshMarker34();');return {before:v0,held:'hidden',after:v0};});

 check(25,()=>{const out={},card=h=>{const m=h.match(/<div class="life-note34 bench36-card">[\s\S]*?<\/div>/);return m?m[0]:'';};const top=(m,a)=>m.includes(a)&&m.indexOf(a)<m.indexOf('<h2>');
  run('fresh36();S.day=1;');assert.equal(card(J('todayHTML34()')),'','no card before it is due');run('S.day=2;');
  const t0=J('todayHTML34()'),c0=card(t0);assert(c0.includes('<h3>Ada’s bench needs two pairs of hands</h3>')&&c0.includes('data-act="bench36Start"'),'Today offers the bench: '+c0);
  assert(t0.indexOf('bench36-card')>t0.indexOf('life-hero34')&&t0.indexOf('bench36-card')<t0.indexOf('<div class="life-chips34">')&&t0.indexOf('bench36-card')<t0.indexOf('life-note34"'),'the card is Today’s first card');run('openMenu();');assert(top(J('panel.innerHTML'),'data-act="bench36Start"'),'the offer opens the Menu');run('closePanel();');
  // (round 3, RP-7) while the first-evening guide is on, Tasks opens its journal: the same card is in it, under its heading
  run('S.firstEvening=S.firstEvening||{version:1,done:{},startedDay:1};S.firstEvening.enabled=true;S.firstEvening.completed=false;PH="";');const guided=J('guided33()');
  if(guided){run('dispatch("tasksbtn");');const jh=J('panel.innerHTML');run('closePanel();');assert(jh.includes('<div class="evening33">')&&card(jh)===c0,'the first-evening journal carries the card: '+jh.slice(0,300));assert(jh.indexOf('bench36-card')<jh.indexOf('evening-progress'),'under its heading');}
  run('S.firstEvening.enabled=false;');assert(guided,'the guide was on');
  run('start36();');const c1=card(J('todayHTML34()'));assert(c1.includes('data-act="bench36Find"')&&c1.includes('waiting at your gate'),'waiting at the gate: '+c1);
  run('openMenu();');const m1=J('panel.innerHTML');assert(top(m1,'data-act="bench36Find"')&&top(m1,'data-act="bench36Reset"')&&!m1.includes('bench36Pause'),'Find and the reset open the Menu');run('closePanel();');
  run('takeEnds36('+FE+',0);lift36(0,1);');assert.equal(card(J('todayHTML34()')),'','no card while it is in hands');run('openMenu();');const m2=J('panel.innerHTML');
  assert(top(m2,'data-act="bench36Pause"')&&m2.indexOf('bench36Pause')<m2.indexOf('bench36Reset'),'Pause next to the reset');run('closePanel();');
  run('placedAt36("out");');assert.equal(card(J('todayHTML34()')),'','no card once placed');
  run('companion36();');const c3=card(J('todayHTML34()'));assert(c3.includes('data-act="bench36Duo"')&&c3.includes('Play this with two players on this device'),'the companion’s card: '+c3);
  run('AI.on=false;fresh36();NET.on=true;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};');const c4=card(J('todayHTML34()'));run('NET.on=false;');
  assert(c4.includes('Carry Ada’s bench when you are both on one device.')&&!c4.includes('<button'),'online: '+c4);
  out.cards=[c0,c1,c3,c4].map(c=>c.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());return out;});

 check(26,()=>{const out={};run('fresh36();chooserAt36();frames36(4);');assert.equal(J('BENCH36.state'),'choosing');let st=J('strips36()');
  for(const i of [0,1]){assert(st[i].includes('data-act="bench36Pick" data-v="-1"')&&st[i].includes('data-act="bench36Pick" data-v="1"'),'view '+i+': ◀ and ▶');
   assert(st[i].includes(`data-act="bench36Vote" data-i="${i}" aria-pressed="false"`),'view '+i+': its own agree button');assert(!st[i].includes(`data-i="${1-i}"`),'view '+i+': not the other player’s');}
  // the ghost: role yellow, an outline at seat height and a seat arrow at the arrangement, faint outlines at the others
  const look=()=>J(`(()=>{const B=BENCH36,g=B.mesh.ghost,A=B.mesh.aux;const em=[],body=[],op=[];g.traverse(o=>{if(o.isMesh&&o.material){body.push(o.material.color.getHexString());op.push(o.material.opacity);if(o.material.emissive)em.push(o.material.emissive.getHexString());}});
   const fr=A.userData.frame,ab=new THREE.Box3().setFromObject(A.userData.arrowMesh),az=ab.max.z-ab.min.z,ax=ab.max.x-ab.min.x;
   const p=benchPoseOf36(B.choice),o=A.userData.outlines,ar=A.userData.arrow;return {col:B.ghostCol,em:[...new Set(em)],sel:o[B.choice].material.color.getHexString(),selOp:o[B.choice].material.opacity,others:B.ORDER.filter(k=>k!==B.choice).map(k=>[o[k].material.opacity,o[k].visible]),
    at:[o[B.choice].position.x===p.x&&o[B.choice].position.z===p.z&&o[B.choice].rotation.y===p.yaw,ar.position.x===p.x&&ar.position.z===p.z&&ar.rotation.y===p.yaw],seen:A.visible&&g.visible,depth:o[B.choice].material.depthTest,body:[...new Set(body)],opMin:Math.min(...op),
    frame:fr?{n:fr.children.length,at:fr.position.x===p.x&&fr.position.z===p.z&&fr.rotation.y===p.yaw,col:[...new Set(fr.children.map(m=>m.material.color.getHexString()))],depth:fr.children.every(m=>m.material.depthTest===false),w:+(fr.children[0].geometry.parameters.height).toFixed(3)}:null,arrow:[+Math.max(ax,az).toFixed(3),+Math.min(ax,az).toFixed(3)]};})()`);
  const hex=c=>J(`new THREE.Color(${JSON.stringify(c)}).getHexString()`),YEL=hex(J('BENCH36.COL.move')),RED=hex(J('BENCH36.COL.nofree'));
  const g0=look();assert.equal(g0.col,J('BENCH36.COL.move'));assert.deepEqual(g0.em,[YEL],'the ghost glows in the role yellow');assert.equal(g0.sel,YEL);assert.equal(g0.selOp,1);assert.deepEqual(g0.others,[[0.35,true],[0.35,true]],'faint outlines at the other two');
  assert.deepEqual(g0.at,[true,true],'outline and arrow at the arrangement');
  assert.deepEqual(g0.body,[YEL],'the ghost’s body itself is the role yellow (not pale cream): '+JSON.stringify(g0.body));assert(g0.opMin>=0.8,'and solid enough to read: '+g0.opMin);
  assert(g0.frame&&g0.frame.n===4&&g0.frame.at&&g0.frame.depth&&g0.frame.w>=0.05,'a broad outline (5 cm strips) at the arrangement, seen through the parapet: '+JSON.stringify(g0.frame));assert.deepEqual(g0.frame.col,[YEL]);
  assert(g0.arrow[0]>=0.4&&g0.arrow[1]>=0.35,'the seat arrow is large: '+JSON.stringify(g0.arrow));assert.equal(g0.seen,true);assert.equal(g0.depth,false,'seen through the parapet');
  // tap ▶: Gate, both agreements cleared; tap Player 1's agree: shown on the button
  run('press36(1);frames36(1);');assert.deepEqual(J('BENCH36.agree'),[false,true]);assert.equal(J('tap36("bench36Pick",{v:"1"})'),true,'the strip takes taps');run('frames36(1);');
  assert.deepEqual(J('[BENCH36.choice,BENCH36.agree]'),['gate',[false,false]],'a tap browses and clears both');const g1=look();assert.deepEqual(g1.at,[true,true],'the ghost follows');
  run('tap36("bench36Vote",{i:"0"});frames36(1);');st=J('strips36()');assert.deepEqual(J('BENCH36.agree'),[true,false]);
  assert(st[0].includes('data-act="bench36Vote" data-i="0" aria-pressed="true">✓ Efe agrees'),'the agreed state on the button: '+st[0]);assert(st[1].includes('data-i="1" aria-pressed="false">Ola agrees'),'the other still open');
  run('tap36("bench36Vote",{i:"0"});frames36(1);');assert.deepEqual(J('BENCH36.agree'),[false,false],'a second tap is “not yet”');
  // an arrangement that is not free: the ghost turns red
  run('BENCH36.okCache.water=false;tap36("bench36Pick",{v:"1"});frames36(1);');const g2=look();assert.equal(J('BENCH36.choice'),'water');assert.equal(g2.col,J('BENCH36.COL.nofree'),'not free: red');assert.deepEqual(g2.em,[RED]);assert.equal(g2.sel,RED);assert.deepEqual(g2.body,[RED]);assert.deepEqual(g2.frame.col,[RED]);
  run('BENCH36.okCache.water=true;tap36("bench36Pick",{v:"-1"});frames36(1);');assert.equal(J('BENCH36.choice'),'gate');assert.equal(look().col,J('BENCH36.COL.move'));
  run('tap36("bench36Vote",{i:"1"});frames36(1);tap36("bench36Vote",{i:"0"});frames36(1);');assert.equal(J('BENCH36.state'),'settling','two taps commit');
  // the stylesheet: the buttons take taps and are at least 44 px both ways
  const css=fs.readFileSync(path.join(GAME,'src','bench-v36.css'),'utf8'),rule=(css.match(/\.bench36-pick \.b36\{([^}]*)\}/)||[])[1]||'';
  assert(/pointer-events:auto/.test(rule)&&/min-width:44px/.test(rule)&&/min-height:44px/.test(rule),'44 px tap targets: '+rule);
  // the arrangement's name is large in the strip: at least 1.4 rem at the desk, 16 px on phones
  const nm=(css.match(/\.bench36-pick \.sel \.nm36\{font-size:([0-9.]+)rem/)||[])[1],nmS=(css.match(/\.bench36-pick \.sel \.nm36\{font-size:max\(([0-9]+)px/)||[])[1];
  assert(+nm>=1.4&&+nmS>=16,'the name is large: '+nm+' rem, '+nmS+' px');
  out.ghost={free:g0.col,notFree:g2.col,body:g0.body[0]===YEL?'role yellow':g0.body[0],frame:g0.frame.w,arrow:g0.arrow,name:[+nm,+nmS]};out.taps='browse, agree, not yet, commit';return out;});

 check(27,()=>{const out={};run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J('drive36(PLAN36,7200,seg=>seg>='+SEG.courtyard+')');assert.equal(J('BENCH36.state'),'carrying');
  run('openMenu();');const m=J('panel.innerHTML');assert(m.includes('data-act="bench36Pause">Pause delivery and explore</button>'),'the Menu offers the pause');const sd0=J('benchStats36().setdowns');
  run('dispatch("bench36Pause");frames36(12);');const a=J('[BENCH36.state,BENCH36.holder,hbMatch36(BENCH36.pose,[pos36(0),pos36(1)]),benchStats36().setdowns]');
  assert.deepEqual(a.slice(0,3),['grounded',[null,null],true],'set down safely and let go: '+JSON.stringify(a));assert.equal(a[3],sd0,'not counted as a set-down');
  const q0=J('[pos36(0),pos36(1)]');run('setKeys36(0,[1,0]);setKeys36(1,[-1,0]);frames36(12);noKeys36();frames36(1);');const q1=J('[pos36(0),pos36(1)]');
  assert(Math.hypot(q1[0][0]-q0[0][0],q1[0][1]-q0[0][1])>0.3&&Math.hypot(q1[1][0]-q0[1][0],q1[1][1]-q0[1][1])>0.3,'both walk freely after the pause');
  // find: the destination marker on the bench, following a reset, gone when an end is taken
  run('openMenu();');assert(J('panel.innerHTML').includes('data-act="bench36Find">Find the bench</button>'),'the Menu offers Find');run('LIFE34.waypoint={x:-5.6,z:6.35,name:"Your pepper pot"};refreshMarker34();dispatch("bench36Find");frames36(2);');
  const f=J('[LIFE34.waypoint,!!LIFE34.marker,bench36Pose()]');assert(f[0]&&f[0].name==='Ada’s bench'&&f[0].x===f[2].x&&f[0].z===f[2].z&&f[1],'the marker is on the bench: '+JSON.stringify(f));
  run('at36(0,-1.2,-1.6);at36(1,-0.6,-1.6);frames36(30);');assert.equal(J('LIFE34.waypoint&&LIFE34.waypoint.name'),'Ada’s bench','the marker stays while they walk');
  run('dispatch("bench36Reset");frames36(2);');const fr=J('[LIFE34.waypoint,bench36Pose()]');assert(fr[0]&&fr[0].x===fr[1].x&&fr[0].z===fr[1].z,'the marker follows a reset');
  run('takeEnds36(BENCH36.front,BENCH36.mover);press36(BENCH36.mover);frames36(3);');assert.equal(J('BENCH36.state'),'ready');assert.equal(J('LIFE34.waypoint&&LIFE34.waypoint.name'),'Your pepper pot','the marker goes when an end is taken, and the player’s own destination comes back (round 3, L2)');run('LIFE34.waypoint=null;refreshMarker34();');
  run('press36(1-BENCH36.mover);frames36(4);');assert.equal(J('BENCH36.state'),'carrying','carrying on is just lifting');
  // in the chooser: a pause leaves it in the doorway, both walk, and lifting it there opens the chooser again
  run('chooserAt36();');const pc=J('bench36Pose()');run('openMenu();');assert(J('panel.innerHTML').includes('data-act="bench36Pause"'),'the chooser’s Menu offers the pause');run('dispatch("bench36Pause");frames36(3);');
  const c=J('[BENCH36.state,bench36Pose(),hbMatch36(BENCH36.pose,[pos36(0),pos36(1)]),!!(BENCH36.mesh.ghost&&BENCH36.mesh.ghost.visible)]');
  assert.equal(c[0],'grounded');assert.deepEqual(c[1],pc,'left in the doorway');assert.equal(c[2],true,'liftable');assert.equal(c[3],false,'no ghost');
  const iv=J('(()=>{setKeys36(0,[1,0]);setKeys36(1,[-1,0]);const v=[inputVec(0),inputVec(1)].map(q=>Math.hypot(q[0],q[1]));noKeys36();return v;})()');assert(iv[0]>0.9&&iv[1]>0.9,'both players’ keys are their own again: '+iv);
  run('{const B=BENCH36,e0=benchEnd36(B.pose,0,1.0),e1=benchEnd36(B.pose,1,1.0);at36(0,e0[0],e0[1]);at36(1,e1[0],e1[1]);}frames36(2);press36(0);frames36(3);press36(1);frames36(6);');
  assert.equal(J('BENCH36.state'),'choosing','lifting it in the doorway opens the chooser again');
  out.pause={setdowns:a[3]-sd0};out.find='marked, followed a reset, cleared on taking an end';out.chooser='paused in the doorway, lifted back into the chooser';return out;});

 check(28,()=>{const out={};
  run("var CL28=new Set(['bench36-x']);document.body.classList={add:c=>CL28.add(c),remove:c=>CL28.delete(c),contains:c=>CL28.has(c),toggle:(c,v)=>{const on=v===undefined?!CL28.has(c):!!v;if(on)CL28.add(c);else CL28.delete(c);return on;}};CL28.delete('bench36-x');");
  const ctl=()=>J("[AI.on,!!S.ai,AI.i,singleIdx(),CL28.has('net')]");
  try{
  run('companion36();at36(1,1.0,2.0);frames36(1);');assert.deepEqual(ctl(),[true,true,1,0,true],'a companion household');assert.equal(J('(()=>{const q=pos36(1);return !!blocked(q[0],q[1],PR);})()'),false,'the companion stands on a free spot');const keys0=J('Object.keys(S).sort()');
  run('openMenu();');assert(J('panel.innerHTML').includes('data-act="bench36Duo">Play this with two players on this device</button>'),'the Menu offers two players');run('closePanel();');
  const c0=J('pos36(1)');run('PH="";dispatch("bench36Duo");');assert(J('PH').includes('A note from Ada'),'the delivery starts with Ada’s note');run('ACTIONS.close();frames36(2);');
  assert.deepEqual(ctl(),[false,false,1,-1,false],'two players on this device');assert.equal(J('BENCH36.state'),'grounded');assert.deepEqual(J('S.life.bench36.duo.pos'),c0,'the companion’s place is kept');
  // a reload mid-switch: still two players, with the way back
  run('save();ACTIONS.continue();frames36(2);');assert.deepEqual(ctl(),[false,false,1,-1,false],'after a reload: still two players');run('openMenu();');
  assert(J('panel.innerHTML').includes('data-act="bench36Solo">Back to my companion</button>'),'the way back is in the Menu');run('closePanel();');assert(J('todayHTML34()').includes('data-act="bench36Solo"'),'and on the Today page');
  // carry it a little, then pause: the companion is back exactly
  run('takeEnds36('+FE+',0);lift36(0,1);FOL36.k=0;FOL36.o=null;');J('drive36(PLAN36,150)');assert.equal(J('BENCH36.state'),'carrying');run('dispatch("bench36Pause");for(let k=0;k<12&&!AI.on;k++)frames36(1);');
  assert.deepEqual(ctl(),[true,true,1,0,true],'a pause restores the companion');assert.deepEqual(J('pos36(1)'),c0,'where it was');assert.equal(J('S.life.bench36.duo===undefined'),true,'the switch is over');
  assert.deepEqual(J('Object.keys(S).sort()'),keys0,'the save keeps its shape');run('frames36(2);');assert.equal(J('BENCH36.paused'),true,'the companion household does not see the bench');
  run('openMenu();');assert(J('panel.innerHTML').includes('bench36Duo'),'the switch is offered again to carry on');run('closePanel();');
  // a second switch, through the chooser to placing, sitting and standing up
  run('at36(1,1.4,1.7);frames36(1);');const c1=J('pos36(1)');assert.equal(J(`!!blocked(${c1[0]},${c1[1]},PR)`),false,'the companion stands on a free spot');run('dispatch("bench36Duo");frames36(2);');assert.deepEqual(ctl(),[false,false,1,-1,false]);assert.equal(J('BENCH36.paused'),false,'back in play');
  run('{const d=S.life.bench36.duo;chooserAt36({duo:d});}');assert.equal(J('BENCH36.state'),'choosing');run('press36(0);frames36(1);press36(1);frames36(1);');for(let k=0;k<40&&J('BENCH36.state')==='settling';k++)run('frames36(10)');
  assert.equal(J('BENCH36.state'),'placed');assert.deepEqual(ctl(),[false,false,1,-1,false],'still two players once placed');
  run('at36(0,-5.95,6.4);at36(1,-5.4,6.5);frames36(2);press36(0);frames36(3);');assert.equal(J('BENCH36.state'),'seated');assert.deepEqual(ctl().slice(0,2),[false,false],'sitting together, two players');
  run('setKeys36(0,[0,-1]);for(let k=0;k<30&&!AI.on;k++)frames36(1);noKeys36();');assert.equal(J('BENCH36.state'),'placed');assert.deepEqual(ctl(),[true,true,1,0,true],'standing up restores the companion');assert.deepEqual(J('pos36(1)'),c1,'where it was');
  // (round 3, RP-9) with the companion back and away, a player at the bench is not told to wait for it
  run('at36(0,-5.95,6.4);frames36(10);');const lab9=J('hotspotCache[0]&&hotspotCache[0].label');assert(!/^Wait for/.test(lab9||''),'no “Wait for” the companion: '+lab9);out.companionAway=lab9;
  // an again run left where it was restores it too
  run('dispatch("bench36Duo");frames36(2);');assert.deepEqual(J('[BENCH36.state,S.life.bench36.again,AI.on]'),['grounded',true,false],'carry it again with two players');run('dispatch("bench36Cancel");frames36(1);');
  assert.deepEqual(J('[BENCH36.state,AI.on,!!S.ai]'),['placed',true,true],'leaving it where it was restores the companion');
  // online: no switch
  run('AI.on=false;S.ai=false;NET.on=true;NET.room={emit:()=>Promise.resolve(),presence:()=>Promise.resolve(),leave:()=>{}};delete S.life.bench36;S.home.items=S.home.items.filter(i=>i.type!=="bench");benchTeardown36();openMenu();');const mo=J('panel.innerHTML');run('closePanel();');
  assert(!mo.includes('bench36Duo')&&mo.includes('Carry Ada’s bench when you are both on one device.'),'online: the one-device line, no switch');run('NET.on=false;');
  }finally{run("document.body.classList={add(){},remove(){},toggle(){},contains:()=>false};AI.on=false;");}
  out.restored=['pause','stand up','again left'];out.reload='two players, way back';return out;});
 check(29,()=>{const out={};
  // the doorway trap the guided prototype's seed 7 found: the bench set down in the room, its west end in the veranda doorway's mouth, one player
  // (Efe) in the room west of it and the other (Ola) standing in the doorway beyond that end, whose only way round to the far end is the gap
  // between the bench's corner and the west jamb, just where whoever holds the doorway end stands
  const S7={x:-3.2741877655391227,z:4.601752309256528,yaw:-5.238674835810746},D7=S7.yaw*180/Math.PI;
  const setup=(efe,ola)=>run(`fresh36();start36();at36(0,${efe[0]},${efe[1]});at36(1,${ola[0]},${ola[1]});loadAt36(${S7.x},${S7.z},${D7});frames36(2);TOASTS=[];`);
  const pose=()=>J('bench36Pose()'),labs=()=>J('hotspotCache.map(h=>h?h.label:"")'),st=()=>J('[BENCH36.state,BENCH36.holder]');
  setup([-4.32,5.16],[-3.965,5.541]);const p0=pose();assert(Math.abs(p0.x-S7.x)<1e-6&&Math.abs(p0.z-S7.z)<1e-6,'loaded where asked: '+JSON.stringify(p0));
  assert.equal(J('hbMatch36(BENCH36.pose,[pos36(0),pos36(1)])'),true,'liftable: Ola can take the doorway end first, or Efe the far end');
  let L=labs();assert.deepEqual(L,['Ola needs this end','Come round to this end'],'Efe is asked to leave the doorway end to Ola: '+JSON.stringify(L));
  run('press36(0);frames36(3);');assert.deepEqual(st(),['grounded',[null,null]],'Efe cannot take it');assert(J('TOASTS').includes('Ola needs this end to get round. Take the other one.'),'and is told why');
  out.trap={efe:L[0],ola:L[1]};
  // Efe takes the far end instead; Ola comes round through the gap (nobody stands in it) and they lift
  run(`{const e=benchEnd36(BENCH36.pose,1);let q=null;for(let r=0.2;r<=0.61&&!q;r+=0.05)for(let k=0;k<16&&!q;k++){const a=k/16*Math.PI*2,x=e[0]+Math.sin(a)*r,z=e[1]+Math.cos(a)*r;if(!blocked(x,z,PR)&&benchSlideClear36([x,z],e))q=[x,z];}at36(0,q[0],q[1]);}frames36(2);`);assert.equal(labs()[0],'Take this end','the far end is Efe’s to take (beside the stove, “Cook” does not hide it): '+JSON.stringify([labs(),J('pos36(0)')]));run('press36(0);frames36(4);');assert.deepEqual(st(),['ready',[null,0]],'Efe holds the far end: '+JSON.stringify([labs(),J('TOASTS'),J('pos36(0)'),J('benchEnd36(BENCH36.pose,1)')]));
  assert.equal(J('benchPinned36()'),false,'Efe at the far end leaves Ola her way round');
  run('at36(1,-4.2,5.05);frames36(3);');L=labs();assert.equal(L[1],'Lift together','Ola has come round into the room: '+JSON.stringify(L));run('press36(1);frames36(6);');assert.equal(J('BENCH36.state'),'carrying','and they lift');
  // a holder who ends up pinning the other: Efe takes the doorway end while Ola is in the room, then Ola walks out into the doorway behind him
  setup([-4.32,5.16],[-4.9,4.3]);run('press36(0);frames36(4);');assert.deepEqual(st(),['ready',[0,null]],'Efe holds the doorway end (Ola can still get round)');
  run('at36(1,-3.965,5.541);frames36(3);');L=labs();assert.deepEqual(L,['Let go · Ola can’t get round','Ask Efe to let go'],'Efe is in Ola’s only way round: '+JSON.stringify(L));
  run('press36(0);frames36(3);');assert.deepEqual(st(),['grounded',[null,null]],'Efe’s Act lets go');
  const back=J('benchSlideClear36(pos36(0),benchEnd36(BENCH36.pose,0))');assert.equal(back,true,'Efe steps back on his own side of the jamb');
  setup([-4.32,5.16],[-4.9,4.3]);run('press36(0);frames36(4);at36(1,-3.965,5.541);frames36(60);');assert.equal(J('BENCH36.state'),'ready','still held at 2 s');
  run('frames36(20);');assert.deepEqual(st(),['grounded',[null,null]],'after 2.5 s he lets go by himself');assert(J('TOASTS').includes('Efe lets go, so Ola can get round.'),'with the toast');
  out.pinned={prompt:L,letGo:'Act, or by himself after 2.5 s'};
  // at set-down: carried there with Ola at the doorway end, she sets it down; each steps back on their own side of any wall (never out beyond
  // the jamb, from where Ola would have to come all the way round), and the harness's walk finds it liftable in an order
  setup([-4.32,5.16],[-4.2,5.05]);run(`{const e=benchEnd36(BENCH36.pose,1);let q=null;for(let r=0.2;r<=0.61&&!q;r+=0.05)for(let k=0;k<16&&!q;k++){const a=k/16*Math.PI*2,x=e[0]+Math.sin(a)*r,z=e[1]+Math.cos(a)*r;if(!blocked(x,z,PR)&&benchSlideClear36([x,z],e))q=[x,z];}at36(0,q[0],q[1]);}frames36(2);press36(0);frames36(4);press36(1);frames36(6);`);
  assert.equal(J('BENCH36.state'),'carrying','lifted at the doorway pose');assert.deepEqual(J('[benchHolderOf36(0),benchHolderOf36(1)]'),[1,0],'Ola holds the doorway end');
  run('press36(1);frames36(12);');assert.equal(J('BENCH36.state'),'grounded','set down');const sd=J('[pos36(0),pos36(1),[1,0].map((e,i)=>benchSlideClear36(pos36(i),benchEnd36(BENCH36.pose,e))),hbMatch36(BENCH36.pose,[pos36(0),pos36(1)])]');
  assert.deepEqual(sd[2],[true,true],'both step back on their own side: '+JSON.stringify(sd));assert.equal(sd[3],true,'liftable');
  out.setDown={ola:sd[1].map(r3),efe:sd[0].map(r3)};return out;});


 // ---- round 2b ----
 check(30,()=>{const out={contrast:[]};const SH=sheets36(GAME),E=(tag,id,cls,attrs)=>({tag,id:id||'',cls:cls||[],attrs:attrs||{}});
  const base=[Object.assign(E('html'),{root:true}),E('body'),E('div','ov',['on'])];
  // the chains the card sits in: the first-evening journal (Tasks while the guide is on: the plain dark panel) and the Today page (the life panel)
  const ctx={journal:base.concat([E('div','panel',[],{role:'dialog'}),E('div','',['evening33'])]),today:base.concat([E('div','panel',['life-panel34'],{role:'dialog'}),E('section','',['life34'])])};
  for(const scr of [{w:1280,h:800,touch:false,n:'1280x800'},{w:390,h:844,touch:true,n:'390x844'}]){const R=[];for(const css of SH)rules36(css,scr,R);
   for(const [cn,ch] of Object.entries(ctx)){const card=ch.concat([E('div','',['life-note34','bench36-card'])]);assert.equal(colours36(R,card).bgAt,card.length-1,`${scr.n} ${cn}: the card sets its own paper`);
    for(const [n,el] of [['kicker',E('p','',['life-kicker'])],['heading',E('h3')],['text',E('p')]]){const r=colours36(R,card.concat([el])),c=contrast36(r.fg,r.bg);
     assert(c>=4.5,`${scr.n} ${cn}: the card’s ${n} is ${c.toFixed(2)}:1 (${r.fg.join(',')} on ${r.bg.join(',')})`);out.contrast.push([scr.n,cn,n,+c.toFixed(2)]);}}}
  // the card from the game, on the Today page and in the journal, in our own words
  const card=h=>{const m=h.match(/<div class="life-note34 bench36-card">[\s\S]*?<\/div>/);return m?m[0]:'';};run('fresh36();');const c0=card(J('todayHTML34()'));
  run('S.firstEvening=S.firstEvening||{version:1,done:{},startedDay:1};S.firstEvening.enabled=true;S.firstEvening.completed=false;PH="";dispatch("tasksbtn");');const c1=card(J('panel.innerHTML'));run('closePanel();S.firstEvening.enabled=false;');
  run('start36();');const c2=card(J('todayHTML34()'));run('companion36();');const c3=card(J('todayHTML34()'));run('AI.on=false;');
  for(const c of [c0,c1,c2,c3]){assert(c.includes('<p class="life-kicker">FOR THE TWO OF YOU</p>'),'the card’s kicker: '+c);assert(!/something to do together/i.test(c),'their words: '+c);}
  out.kicker='FOR THE TWO OF YOU';return out;});
 check(31,()=>{const out={};
  const corner=(x,z,d,sw)=>J(`(()=>{const at=liftAt36(${x},${z},${d},[[0,0]]);if(!at)return {err:'not lifted'};const B=BENCH36,leak0=B.yawLeak,a=benchAxis36(B.pose.yaw),f=B.front?1:-1,w=a[0]*f<0?1:-1,t=1-B.mover,e=[Math.sin(B.pose.yaw)*f,Math.cos(B.pose.yaw)*f];
   for(let k=0;k<6;k++){setKeys36(B.mover,combo36(a[0]*f*w,a[1]*f*w));if(${sw})setKeys36(t,combo36(e[0],e[1]));frames36(30);setKeys36(t,null);if(${sw})setKeys36(t,combo36(-e[0],-e[1]));frames36(20);setKeys36(t,null);}
   const spent=B.assist.lat,p1=bench36Pose(),c1=B.cost.assist;frames36(30);const p1b=bench36Pose(),more=B.cost.assist-c1;
   noKeys36();frames36(4);const p2=bench36Pose(),c2=B.cost.assist,ends=[benchEnd36(p2,0),benchEnd36(p2,1)];setKeys36(B.mover,combo36(-a[0]*f*w,-a[1]*f*w));frames36(60);noKeys36();frames36(6);const p3=bench36Pose();
   return {at,spent,still:Math.hypot(p1b.x-p1.x,p1b.z-p1.z),more,p2,moved:Math.hypot(p3.x-p2.x,p3.z-p2.z),yaw:[p2.yaw,p3.yaw],help:B.cost.assist-c2,leak:B.yawLeak-leak0,west:ends[0][0]<ends[1][0]?ends[0]:ends[1]};})()`);
  out.runs=[];
  for(const [x,z,d,sw,who] of [[3.35,5.1,210,0,'the mover alone'],[3.25,5.0,205,1,'with the turner swinging']]){const r=corner(x,z,d,sw);assert(!r.err,who+': '+r.err);
   assert(r.west[0]<2.3&&r.west[1]>5.2,who+': the west end is in the corner by the pillar: '+JSON.stringify(r.west));assert(r.spent>=0.15-1e-9,who+': the walls’ help for the contact is spent: '+r.spent);
   assert(r.still<0.001&&r.more===0,who+': more of the same push gets no more help: '+JSON.stringify([r.still,r.more]));
   assert(r.moved>=0.3,who+': a push the other way backs it out of the corner: '+r.moved);assert.equal(r.yaw[1],r.yaw[0],who+': the yaw is exactly as it was');assert(r.help>0,who+': with the walls’ help: '+r.help);assert.equal(r.leak,0,who+': yaw leak');
   out.runs.push([who,r3(r.p2.x),r3(r.p2.z),deg(r.p2.yaw),r3(r.moved),r.help]);}
  return out;});
 check(32,()=>{const out={poses:[]};
  // the harness's own rays: every mesh the camera-to-holder rays (knee, chest, head) meet, but the players, the bench, sprites, the base's own
  // fading trees and awnings, see-through meshes, floors (below 0.3 m) and the sky
  run(`var occHits36=()=>{const B=BENCH36,ch=new Set(players.filter(p=>p&&p.g).map(p=>p.g));for(const k in npcs)if(npcs[k]&&npcs[k].g)ch.add(npcs[k].g);const L=[],bb=new THREE.Box3();
    scene.traverse(m=>{if(!m.isMesh||m.isSkinnedMesh||!m.geometry||!m.material||FADEABLE.includes(m))return;const o0=m.userData.occ36?m.userData.occ36.orig:m.material;if((Array.isArray(o0)?o0:[o0]).some(t=>t.transparent&&t.opacity<0.99))return;
     for(let o=m;o;o=o.parent)if(!o.visible||ch.has(o)||String(o.name||'').indexOf('bench36')===0)return;bb.setFromObject(m);if(bb.max.y<0.3||bb.max.x-bb.min.x>60||bb.max.z-bb.min.z>60)return;L.push([m,bb.clone()]);});
    const ray=new THREE.Raycaster(),hit=new Map(),v=new THREE.Vector3(),d=new THREE.Vector3();
    for(const c of cams)for(const h of B.holder){const p=h===null?null:players[h];if(!p)continue;for(const y of [0.6,1.2,1.7]){v.set(p.g.position.x,(p.y||0)+y,p.g.position.z);d.copy(v).sub(c.position);const len=d.length();d.normalize();ray.set(c.position,d);ray.far=len-0.3;
     for(const x of ray.intersectObjects(L.map(q=>q[0]),false))if(!hit.has(x.object))hit.set(x.object,L.find(q=>q[0]===x.object)[1]);}}
    return [...hit.entries()].map(([m,b])=>({m,box:[b.min.x,b.max.x,b.min.z,b.max.z].map(q=>Math.round(q*100)/100),op:Math.max(...(Array.isArray(m.material)?m.material:[m.material]).map(t=>t.opacity)),pillar:b.min.x>=2.74&&b.max.x<=5.26&&b.min.z>=5.72&&b.max.z<=6.24&&(b.max.x<=3.26||b.min.x>=4.74)}));};
   var occBits36=()=>{let s='';for(let x=-6;x<=6;x+=0.37)for(let z=-1;z<=9.5;z+=0.41)s+=blocked(x,z,0.1,{noBench:true,noCrate:true})?1:0;return s;};
   var occNow36=()=>occHits36().map(o=>({box:o.box,op:Math.round(o.op*1000)/1000,pillar:o.pillar}));
   var occAll36=()=>{const r=[];scene.traverse(m=>{if(m.isMesh&&m.userData.occ36)r.push(m);});return r.length;};`);
  const bits0=J('(fresh36(),start36(),occBits36())');
  const poses=[['the west pillar’s corner',null],['through the gate',[3.4,4.9,185]],['corner 1',[-1.0,0.95,215]],['the flat door',[-2.0,4.9,200]],['the veranda doorway',[-4.1,4.85,255]]];
  for(const scr of [[1280,800,false],[390,844,true]])for(const [n,P] of poses){
   if(!P){const at=J('liftAt36(3.35,5.1,210,[[0,0]])');assert(at,n+': lifted');run(`{const B=BENCH36,a=benchAxis36(B.pose.yaw),f=B.front?1:-1,w=a[0]*f<0?1:-1;setKeys36(B.mover,combo36(a[0]*f*w,a[1]*f*w));}frames36(300);noKeys36();`);}
   else assert(J(`!!liftAt36(${P})`),n+': lifted');
   run(`screen36(${scr});frames36(30);`);const hits=J('occNow36()'),bits=J('occBits36()'),st=J('BENCH36.state');assert.equal(st,'carrying',n+': carried');
   for(const o of hits)assert(o.op<=0.5,`${scr[0]}x${scr[1]} ${n}: a mesh at ${JSON.stringify(o.box)} hides a holder and is not faded (${o.op})`);
   if(!P)assert(hits.some(o=>!o.pillar),`${scr[0]}x${scr[1]} ${n}: a wall that is not a gate pillar hides a holder: `+JSON.stringify(hits));
   assert.equal(bits,bits0,n+': blocked() is unchanged while scenery fades');
   // down: set down, or put back where a set-down is refused
   run('{const B=BENCH36;let t=0;while(B.state==="carrying"&&t++<4){press36(B.holder[0]);frames36(12);}}');assert.notEqual(J('BENCH36.state'),'carrying',n+': down');
   run('frames36(2);');assert.equal(J('occAll36()'),0,n+': every faded mesh has its own material back');assert(J('occNow36()').every(o=>o.op===1),n+': and is opaque again');
   out.poses.push([`${scr[0]}x${scr[1]}`,n,hits.length,hits.filter(o=>!o.pillar).length]);}
  run('screen36(1280,800,false);');return out;});
 check(33,()=>{const out={};
  run(`var arrowFirst36=(i,max)=>{const B=BENCH36,last=()=>{const h=document.getElementById('half'+i),e=(h.children||[]).filter(x=>/bench36-arrow/.test(x.className||''));return e[e.length-1]||null;};let prev=B.arrowShown[i];
    for(let k=0;k<max;k++){frames36(1);const s=B.arrowShown[i];if(s&&s!==prev){const e1=last(),first={vis:e1?e1.style.visibility:null,display:e1?e1.style.display:null};frames36(1);const e2=last(),vp=v21Viewport(i),R=benchPromptRect36(i,vp),sz=benchArrowSize36(e2,B.arrowCap[i]),P=B.arrowPos[i];
      const clear=!!P&&(!R||P[0]+sz.w/2<=R.x1||P[0]-sz.w/2>=R.x2||P[1]+sz.h/2<=R.y1||P[1]-sz.h/2>=R.y2);return {kind:s,k,first,next:{vis:e2?e2.style.visibility:null,display:e2?e2.style.display:null,kind:B.arrowShown[i]},clear};}prev=s;}return {err:'no arrow within '+max+' frames'};};`);
  out.runs=[];
  for(const scr of [[844,390,true],[390,844,true],[1280,800,false]]){
   const cases=[['the mover’s hint',`{const B=BENCH36,a=benchAxis36(B.pose.yaw);setKeys36(B.mover,combo36(-a[1],a[0]));}`,'BENCH36.mover','hint'],['the turner’s hint',`{const B=BENCH36,a=benchAxis36(B.pose.yaw);setKeys36(1-B.mover,combo36(a[0],a[1]));}`,'1-BENCH36.mover','hint']];
   if(scr[2])cases.unshift(['the edge arrow','','BENCH36.mover','edge']);
   for(const [n,keysJs,who,kind] of cases){run('fresh36();start36();takeEnds36('+FE+',0);lift36(0,1);noKeys36();frames36(2);');run(`screen36(${scr});${keysJs}`);let r=J(`arrowFirst36(${who},60)`);
    if(!r.err&&r.kind!==kind)r=J(`arrowFirst36(${who},60)`);run('noKeys36();');const tag=`${scr[0]}x${scr[1]} ${n}`;assert(!r.err,tag+': '+r.err);assert.equal(r.kind,kind,tag+': '+JSON.stringify(r));
    assert.equal(r.first.display,'',tag+': laid out on its first frame');assert.equal(r.first.vis,'hidden',tag+': hidden on its first frame: '+JSON.stringify(r.first));
    assert.equal(r.next.kind,kind,tag+': still shown');assert.equal(r.next.vis,'',tag+': shown from the next frame: '+JSON.stringify(r.next));assert(r.clear,tag+': clear of the prompt card');out.runs.push([tag,r.k]);}}
  run('screen36(1280,800,false);');return out;});

 return out;}

async function inner(only){const h=await world();const res=checks(h,only);return {build:h.run('BUILD_ID'),checks:res};}
async function inertProbe(){const H=require(path.join(__dirname,'..','tools','bench-route-v36.cjs'));const {run}=await H.benchWorld();const J=c=>JSON.parse(run('JSON.stringify('+c+')'));
 const pts=[];let s=11;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};for(let k=0;k<3000;k++)pts.push([-8.5+rnd()*15,-3+rnd()*14.5,[0.05,0.26,0.33][k%3]]);
 const blockedBits=J(`${JSON.stringify(pts)}.map(p=>blocked(p[0],p[1],p[2])?1:0).join('')`);
 run(`var FT=0;var keysR=[];var dir=[null,null];let sd=99;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};var LAB=[],DIST=[];
  {const K=[['w','s','a','d'],['arrowup','arrowdown','arrowleft','arrowright']];const rf=renderFrame;renderFrame=function(){};
   for(let f=0;f<600;f++){for(const i of [0,1]){if(r()<0.08)dir[i]=r()<0.2?null:Math.floor(r()*4);for(const k of K[i])keys[k]=false;if(dir[i]!==null)keys[K[i][dir[i]]]=true;}
    T35+=33;PERF35+=33;last=FT;FT+=33;tick(FT);LAB.push(hotspotCache.map(h=>h?h.label:null).join('|'));DIST.push(v21Dist.map(v=>+v.toFixed(9)).join(','));}renderFrame=rf;for(const k of K.flat())keys[k]=false;}`);
 const out={module:J("typeof BENCH36!=='undefined'"),blocked:blockedBits,save:J('JSON.stringify(S)'),dist:J('DIST'),labels:J('LAB'),keys:J('Object.keys(S)'),tickHooks:J('TICK_HOOKS.length'),
  mesh:J("scene.children.filter(c=>/bench36/.test(c.name||'')).length"),lines:J("Object.keys(LINES35).filter(k=>Array.isArray(LINES35[k])).map(k=>k+':'+LINES35[k].length).join(',')")};
 run("NET.on=false;dispatch('aiStart');S.p[0].name='Efe';S.p[1].name='Ola';dispatch('setupnext',{i:0});dispatch('setupnext',{i:1});closePanel();dispatch('movein');closePanel();sofa.carrying=true;sofa.holder=[0,1];sofaSuccess();closePanel();dispatch('nextday');closePanel();openMenu();");
 out.menu=J('panel.innerHTML');return out;}

if(require.main!==module)module.exports={world};   // (required by a tool: the world and its helpers, no run)
else if(process.argv[2]==='--inner'){const only=process.argv[3]?process.argv[3].split(',').map(Number):null;inner(only).then(r=>{process.stdout.write(JSON.stringify(r)+'\n');process.exit(0);}).catch(e=>{console.error(e);process.exit(1);});}
else if(process.argv[2]==='--inert-probe'){inertProbe().then(r=>{process.stdout.write(JSON.stringify(r)+'\n');process.exit(0);}).catch(e=>{console.error(e);process.exit(1);});}
else{(async()=>{
 const child=(args,env)=>new Promise(res=>{const p=cp.spawn(process.execPath,[__filename].concat(args),{env:Object.assign({},process.env,env||{}),stdio:['ignore','pipe','pipe']});let o='',e='';p.stdout.on('data',d=>o+=d);p.stderr.on('data',d=>e+=d);
  p.on('close',code=>{try{res(JSON.parse(o.trim().split('\n').pop()));}catch(x){res({error:(e||o).slice(-600)||('exit '+code)});}});});
 // the two full runs and the mutants, four children at a time (BENCH36_JOBS sets another number; each mutant reruns only its own check in a copy of dist)
 const src=fs.readFileSync(path.join(GAME,'src','bench-v36.js'),'utf8'),dirs=[],mut=[];let a,b;
 const jobs=[async()=>{a=await child(['--inner']);},async()=>{b=await child(['--inner']);}].concat(MUTANTS.map((m,k)=>async()=>{const n=src.split(m.find).length-1;if(n!==1){mut[k]={name:m.name,check:m.check,result:'stale ('+n+' matches)'};return;}
   const d=variantDir(null,t=>t.replace(m.find,m.replace));dirs.push(d);const r=await child(['--inner',String(m.check)],{COMPOUND_GAME_DIR:d});const c=r.checks&&r.checks[0];mut[k]={name:m.name,check:m.check,result:c?(c.passed?'green':'red'):'error'};}));
 try{const q=jobs.slice(),nj=Math.max(1,Math.min(8,+process.env.BENCH36_JOBS||4));await Promise.all(Array.from({length:nj},async()=>{while(q.length)await q.shift()();}));}finally{for(const d of dirs)fs.rmSync(d,{recursive:true,force:true});}
 const same=JSON.stringify(a)===JSON.stringify(b);
 const report={build:a.build||null,passed:!a.error&&same&&a.checks.length===NAMES.length&&a.checks.every(c=>c.passed)&&mut.every(m=>m.result==='red'),checks:a.checks||[],mutants:mut,determinism:same?'identical':'differs'};
 if(a.error)report.error=a.error;
 for(const c of report.checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.passed?'':' -- '+c.failure));
 for(const m of mut)console.log((m.result==='red'?'PASS ':'FAIL ')+'mutant '+m.name+' turns check '+m.check+' '+m.result);
 console.log((same?'PASS ':'FAIL ')+'determinism: two runs give identical reports');if(a.error)console.log('ERROR',a.error);
 fs.writeFileSync(OUT,JSON.stringify(report,null,1)+'\n');console.log(`${report.checks.filter(c=>c.passed).length}/${NAMES.length} checks, ${mut.filter(m=>m.result==='red').length}/${MUTANTS.length} mutants red`);
 process.exitCode=report.passed?0:1;})();}

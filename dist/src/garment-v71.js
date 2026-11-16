/* v71 "garment and carry-walk": Player 1's V61 figure with two asset repairs, drawn from a new file.

   assets/characters/player1-v71.glb is the V61 figure (same 27 joints, same eight clips, same albedo) with
   - the V70 rebuilt underarm panel: one continuous piece of shirt under the left arm in place of the torn V61 side
     and its flat patch (776 triangles became 770; 91,648 in all);
   - the V71 WalkCarry shoulders: the two shoulder rotation tracks of that one clip moved 60% toward their Carry
     pose, so the hands stay in front of the tee instead of sinking into it while walking with something.
   tools/player1_v71_shared_albedo.py makes the file from the delivered V71 candidate: the candidate's panel had a
   material and a texture of its own, which hero-v61.js (one albedo on every textured primitive) and shirt-v66.js
   (materials named 'top') cannot draw, so the panel is given the tee's material and a flat cloth texel of the
   shared albedo. Nothing else about the shape or the motion is changed (docs/PLAYER1_V71_GARMENT_CARRYWALK.md).

   This module only chooses the file. hero-v61.js still loads, validates, dresses and falls back exactly as before;
   player1-v61.glb stays in the build untouched.

   Switch: ?hero=v61 in the address, or localStorage cd3-hero=v61, draws the original V61 file (for side-by-side
   checks and as the way back); ?hero=v71 forces the V71 file over a stored choice. ?hero=v55 still loads the
   classic hero. */
'use strict';

const GARMENT71={url:'assets/characters/player1-v71.glb',v61Url:'assets/characters/player1-v61.glb',enabled:true};
// The switch: ?hero=v71 forces the V71 file, ?hero=v61 or a stored 'v61' (localStorage cd3-hero) keeps the V61 file.
function garment71Switch(search,stored){ const q=String(search||''); if(/[?&]hero=v71\b/.test(q)) return true; if(/[?&]hero=v61\b/.test(q)) return false; return stored!=='v61'; }
(function(){ let on=true; try{ on=garment71Switch((typeof location!=='undefined'&&location.search)||'',typeof localStorage!=='undefined'?localStorage.getItem('cd3-hero'):null); }catch(e){} GARMENT71.enabled=on; })();
// The file hero-v61's loader should request: the V71 one unless the switch says V61.
function garment71Url(){ return GARMENT71.enabled?GARMENT71.url:GARMENT71.v61Url; }

// heroLoad: name the file before hero-v61's wrapper requests it (only while nothing has been requested yet, so a
// file that is loading or loaded is never renamed under the Menu line that reports it).
if(typeof heroLoad==='function'&&typeof HERO61!=='undefined'){ const heroLoad71=heroLoad;
 heroLoad=function(){ if(HERO61.state==='idle') HERO61.url=garment71Url(); return heroLoad71.apply(this,arguments); }; }

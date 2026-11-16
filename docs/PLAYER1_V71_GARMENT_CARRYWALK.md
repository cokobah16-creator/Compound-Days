# V71: Player 1's underarm panel and carry-walk, in the game

Player 1 is drawn from `dist/assets/characters/player1-v71.glb`: the V61 figure with the two asset repairs the owner
delivered as review packages (`Compound_Days_V70_Garment_Review.zip`, `Compound_Days_V71_CarryWalk_Review.zip`).
`dist/assets/characters/player1-v61.glb` stays in the build untouched and is one address away (`?hero=v61`).

## 1. What changed for the player

- **The side of the tee.** V61 had a torn seam under the left arm, covered by a small flat patch (the "small black
  marks near the side" noted in `docs/PLAYER1_V67_RELAXED_IDLE.md`). V70 rebuilt it as one continuous panel: 776
  triangles became 770 on 435 vertices, including the whole 145-triangle patch and four skin triangles that
  interrupted the shirt. 91,654 triangles became 91,648.
- **Walking with something.** In V61's `WalkCarry` the shoulders pulled the hands into the tee. V71 moves the two
  shoulder rotation tracks of that one clip 60% toward their `Carry` pose (32 keys each, 14.3 to 16.2 degrees on the
  left, 15.3 to 18.5 on the right). Key times, every other track and the seven other clips are untouched.

## 2. The file

| | bytes | SHA-256 |
| --- | ---: | --- |
| `player1-v61.glb` (shipped since v61) | 5,101,400 | `7b6548f0b0243d99e0389514cd930cb763bdff5c7b8d6eec01e74bc0ab21f62b` |
| V69 seam review (input of the V70 package) | 5,109,260 | `b15a1f5f03d1fe3af9577a71d194e2b7f39a4e2c99017e2d42861400b7fad706` |
| V70 garment candidate | 6,021,008 | `67f5ea1b56b587000201dc55508a6e9130f900c00efb978486397e4eefde6f25` |
| V71 carry-walk candidate (delivered) | 6,022,440 | `79c78e311ab324ad804e3ead5263930030b54753027b49e839f9e1fd32c77fe7` |
| `player1-v71.glb` (this build) | 5,163,200 | `3d1e0c437aadc5fa460235afb9eb473f722f25fb2842d95b92690feead32b328` |

The delivered candidate could not be loaded as it was. Its panel has a material of its own
(`top_v70_rebuilt_panel`) with a second texture and UVs laid out for that texture, and the game draws this figure
with one albedo:

- `hero61Dress` (`dist/src/hero-v61.js`) puts `HERO61.albedo` on every textured primitive, so the panel sampled the
  whole atlas through the wrong UVs: a blue and black blotch under the arm.
- `shirt66Dress` (`dist/src/shirt-v66.js`) recolours materials named `top`, so the panel stayed blue when the shirt
  colour changed.

`tools/player1_v71_shared_albedo.py` makes the game file from the candidate (it refuses any other input by hash, and
two runs give the same bytes):

1. the panel gets the tee's own material and every panel UV points at one flat cloth texel block of the shared albedo
   (16 px at x 740, y 292 of the 1024 px JPEG; mean colour (246.5, 236.7, 227.7), which is the mean of the delivered
   panel texture; that texture is one flat colour to within one 8-bit step, so no drawn detail is lost);
2. the panel's material, texture and image are dropped, and so is the untextured material of the V61 patch;
3. the buffer is repacked so that only referenced data is stored (8,866 vertices that no primitive indexes are
   dropped), which brings the file from 6.02 MB back under the 5.5 MB limit `check/verify-hero-v61.cjs` holds the
   hero to. Before writing, the tool checks that every primitive's triangles are bit for bit what the candidate held.

Nothing about the shape, the weights or the motion is changed by the tool.

## 3. The module

`dist/src/garment-v71.js` (loaded after `pose-v67.js`) only chooses the file: it wraps `heroLoad` and sets
`HERO61.url` before `hero-v61.js` makes its request, and only while nothing has been requested. Loading, validation,
dressing, the fallback to the classic hero, the shirt colours (v66) and the relaxed idle (v67) are the existing code.

- `?hero=v61`, or `localStorage['cd3-hero']='v61'`: the original V61 file, for side-by-side checks and as the way back.
- `?hero=v71`: the V71 file, over a stored choice.
- `?hero=v55`: the classic hero, as before.

The Menu line names the file that was loaded. The build stamp prefix is now `v71-`.

## 4. How it was checked

`node check/verify-garment-v71.cjs` (Node, no browser; `check/results-garment-v71.json`): 8 checks, 6 mutants red.

- The file: six primitives `[skin, hair, top, bottom, shoe, top]`, five materials all on the one JPEG, 91,648
  triangles, nothing unreferenced, under 5.5 MB.
- Against `player1-v61.glb`: the same albedo bytes, joints and inverse binds; hair, trousers and shoes triangle for
  triangle; skin minus four triangles; all 14,666 tee triangles outside the panel at their V61 position, UV and
  weights (378 of them with renewed normals beside the join); 568 of 570 animation tracks byte for byte.
- The panel: no edge shared by more than two triangles; each of its 98 open edges is an open edge of the tee at the
  same positions, and each rim vertex has a tee vertex with the same joints and weights.
- The switch, the request, the figure the game builds, and the shirt colour reaching both tee primitives.
- Carry-walk, measured where the game hangs a carried object (`carryAnchor`, the midpoint of the hand bones), at 32
  points of the stride:

  | | V61 | V71 |
  | --- | ---: | ---: |
  | anchor in front of the hips, `Carry` | 0.195 m | 0.195 m |
  | anchor in front of the hips, `WalkCarry` | 0.079 to 0.090 m | 0.153 to 0.163 m |
  | jump of the anchor when Player 1 sets off | 0.147 m | 0.068 m |

  `placeCarried` reads the hand bones every frame, so a carried object follows the new pose without a code change.

`node check/bench-garment-v71.cjs` (headless Chromium, software GL, a 390 × 844 page): the V71 file loads with no
failed request; in the creator the pixel under each of the panel's 435 vertices is read from the left three-quarter
view, and in Coral none is blue or black; in the world both players move, and Player 1 plays `Carry` standing and
`WalkCarry` walking with the hands 0.13 m or more in front of the hips; `?hero=v61` loads the V61 file. The same bench
goes red on the candidate as delivered (the panel's material is not `top`) and on a copy that keeps the candidate's
panel UVs (39 black pixels on the panel).

The other Node harnesses were run twice on the stamped build with byte-identical results. `verify-hero-v61.cjs` keeps
describing the V61 file (it sets the switch the way `?hero=v61` does); `verify-authored.cjs` expects the V71 request.

## 5. Not checked here

- The delivered packages' own counts of triangle crossings between hands, arms and tee (V71: 542 to 0 over 125
  `WalkCarry` poses) were not re-run; this build checks the pose through the carry anchor and by eye in the renderer.
- No physical phone, and no frame-rate measurement. The file is 61,800 bytes larger than V61 and still six draw calls.
- In the bench Player 1 is told to carry; no roof prop was hung on the hands. Carrying the sofa uses
  `WalkCarryLow`, which V71 does not change.
- The neckline, the cuff and hem edges, the marks on the upper arm, the hands and the face are as in V61.

## 6. Going back

`?hero=v61` on any page, or `localStorage.setItem('cd3-hero','v61')`. To remove V71 from the build, delete the
`garment-v71.js` script tag in `dist/index.html`: `hero-v61.js` then requests `player1-v61.glb` as before.

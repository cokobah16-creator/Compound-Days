# V59 headless mobile review — NO GO (2026-11-09)

**Decision: KEEP V55 LIVE.** Do not promote V59 merely because it deforms correctly offline. V60 added six actions and V61 split the Everyday garment, but neither establishes that these mobile blockers are fixed.

## Evidence (be precise about provenance)

- **User-supplied headless Chromium bench:** V55 vs V59, same Three.js, phone portrait/landscape and desktop dimensions. The bench's private scratchpad and original results.json were **not accessible or independently rerun** in this review; attach captures/raw results to this PR before calling them reproducible.
- **Independently audited uploaded V59 mobile GLB:** 9,604,112 bytes, 64,445 unique position vertices, 91,654 triangles, a 0.01-scale Armature ancestor, three Idle/Walk/Run clips, missing skin/top/bottom/shoe/sole runtime slots, and 3 x 1024px compressed image textures implying ~16 MiB RGBA8+mip GPU allocation. Binary inspection supports the risks but does not independently prove a Chromium rendering failure or timing.
- Earlier offline animation/skin tests passed; that does not imply acceptance in the live engine.

| Reported metric | V55 shipped | V59 mobile |
| --- | ---: | ---: |
| Draw calls | 23 | 2 |
| GPU texture memory | 3 MB | 16 MB |
| Mesh memory | baseline | approximately 2x |
| Transfer | 5.9 MB | 9.2 MB |
| Relative software-renderer frame time | 1.0x | 1.8x |
| Creator face zoom | visible | **culled; zero drawn triangles** |
| Game clips | 8 | 3 |

**These frame-time ratios are from a software renderer, NOT actual iPhone/Android FPS.** Render quality must be signed off by a human, not a test alone.

## Prioritized blockers

### P0: culling / invalid bounds
The skinned character lives under a 0.01 node scale and compensating inverse bind. The owner's headless review found the model disappears in the face close-up view as its bounds are effectively evaluated at centimetre scale. Fix transforms, inverse binds and skinned bounds consistently **in the exported asset**. Do not depend on a permanent runtime frustumCulled=false shim. Demonstrate visible triangles throughout full-body > portrait > face camera transitions, all angles and poses, phone portrait/landscape/desktop.

### P0: facial controls
Reported blink affects ~53 vertices at <=5mm, mouth-open ~133 vertices at <=10mm, no mouth cavity, and expressions look neutral in the rendered sheet. A separate static audit counted 78/89 left/right blink and 195 mouth-open nonzero position deltas at another threshold; these are not proof of an effective expression. Retopologize eyelid rims, eye occlusion, nose and lips, mouth interior and continuous neck. Approve neutral/blink/smile/concerned/mouthOpen from front, 3/4 and profile at phone and close-up sizes.

### P0: genuine wardrobe compatibility
Matching 27 joint names is NOT matching bind pose: the model's scaled inverse bind does not equal the game's original garment IBMs. The single atlas also lacks skin/top/bottom/shoe/sole material slots. V61's Everyday garment is separated from Meshy's baked clothing; it is **not a retarget of the original authored** tee.gltf.json, jeans.gltf.json or sneakers.gltf.json. Rebuild and refit one original authored outfit, then test Walk, Carry, Pick.

### P1: rooted hair and clothing collisions
Braids penetrate the forehead, one eye and the tee shoulder. Use separate, sculpted hair with real roots, clearance, appropriate weights and side/turn checks. Avoid overbroad procedural island classifiers (the V57 face damage).

### P1: mobile memory and throughput
91.7K triangles and three uncompressed-on-GPU 1024px textures cost much more than the shipped hero, despite the reduced draw calls. Create true mesh LODs; measure decoded GPU texture memory, shader cost and actual mid-range mobile median/p95 frame times. Compressing JPEG transfers is not a polygon or GPU memory fix.

### P2: art brief
The approved orange folded headwrap and light-blue overalls aren't represented by the V59 braids, jeans and tee. Brief match must be reviewed separately from skinning.

## Release gates

1. In-engine face close-up never culls the character, including during morphs, turns, clothing switches and eight expected actions (idle, walk, carry, carryLow, walkCarry, walkCarryLow, pick, wave).
2. Real closable eyelids, believable lips/mouth and welded neck, approved front/3/4/profile; no braid or cloth penetration.
3. Exact hero/garment joint indexing, inverse binds and material slots; original garment properly fitted under real animation.
4. Quantified draw calls, triangle count, decoded texture allocation and median/p95 timings, compared to V55 with identical render settings on **real phones**.
5. Actual iPhone creator and world screenshot evidence; don't break existing saves. Keep V55 fallback.

**Recommended order:** fix and retest skinned culling on the original V59 asset to isolate camera behavior; then artistic face/hair retopo; then authored garment retargeting; finally true mobile LOD and device QA.

Local structural audit script: check/verify-character-mobile-v62.cjs. Proposed >8MiB decoded texture and >50K triangle thresholds are **provisional review alarms**, not universal game budgets. It does not run Chromium or certify appearance.
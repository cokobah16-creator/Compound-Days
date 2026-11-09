# Player 1 V59 — actual GLB repair audit (9 Nov 2026)

**Review status: NOT READY FOR MERGE / GAMEPLAY. The live character has not been changed.**

V59 is based on the user-uploaded Meshy 7.1 V58 model, not a new image generation. A downloadable binary package was made separately. GitHub stores this source/QA review only; the current connector has not uploaded the GLB binaries.

## Validated repairs

1. The dark slash above the nostril was traced via front-surface raycast to a **17-vertex, 16-face disconnected nose island**. Deleting it revealed a black hole, so deletion was rejected. Matching that island's 17 UV coordinates to nearby duplicate face vertices reduced the black artifact. No underlying vertex positions, skin weights, triangle indices or animations were moved.
2. V57's facial morphs were centered too high, around the wrong features. The new experimental targets use the measured eye landmarks (x -0.034/+0.036, y ~1.526m) and mouth y ~1.463m. Five targets: `blinkLeft`, `blinkRight`, `smile`, `concerned`, `mouthOpen`.
3. Strong eye deformations caused a dark tear across the nose and were **rejected** after rendering. Current eye morphs deliberately produce only mild lid changes, not full closure. Mouth geometry remains predominantly image-textured; `mouthOpen` cannot reveal a real oral cavity. Do not describe these as complete sculpted facial animation.
4. A coincident-vertex neck-normal smoothing trial changed 223 normals but did not materially remove the chin/neck seam. It was rejected. Artist retopology and neck weld remain necessary.
5. Both **full-texture and lighter texture variants** passed VTK glTF import, base-geometry and weights equality checks and numerical animation-skinning checks.

## Measured geometry and motion

- Model has 64,445 vertices, 91,654 triangles, and a 27-joint list using the expected **names/order**, but not the expected inverse bind pose.
- Available clips: `Idle` (single static pose), `Walk` (~1.03 sec), `Run` (~0.63 sec). Offline skinning at four independent time points per clip yielded finite plausible bounds and visibly distinct Walk/Run poses.
- Full game contract additionally requires `carry`, `carryLow`, `walkCarry`, `walkCarryLow`, `pick`, `wave`. These are missing in the candidate.
- Existing `tee.gltf.json` and `cd_overalls.gltf.json` use a hero inverse-bind Hips diagonal of 1 and y translation of -0.86 m; the Meshy candidate Hips IBM has scale about 100 and y translation -93.69 m before the compensating root scale. These are incompatible bind poses, **not** a simple name mapping.
- Candidate also lacks the hero's `skin/top/bottom/shoe/sole` material slots and independently authorable clothing/hair.
- The reduced-texture model is **not a lower-poly LOD**. No iPhone FPS or live browser creator test completed.

## Required next steps

Commission or author a clean facial retopology with true upper/lower lid loops, eye occlusion, teeth/tongue or oral cavity, and neck seam weld. Then build a stable facial rig and separate the hair and clothes. Retarget the source eight game animation actions and re-author/rebind clothing on the new 27-joint pose. Only after front/3/4/profile and real mobile creator/walk/carry checks should a source GLB be proposed for gameplay.

Use `node check/verify-v59-preflight.cjs path/to/Player1_V59_CLEAN_MASTER.glb` on a local checkout to compare the candidate with the shipping hero and representative outfit files. Failure is expected and should block swapping the player model. See the separate V59 production package for reproducible Python build, Blender prep and model/animation renders.

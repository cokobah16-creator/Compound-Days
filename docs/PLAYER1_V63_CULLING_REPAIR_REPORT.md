# V63 — GLB rig-scale normalization / culling repair (review only)

**State: mathematically verified and independently browser-proxied, NOT tested in the actual Compound Days Three.js scene, and NOT deployed. V55 remains the shipped hero.**

## Specific failure and asset-level repair

The original V59 Meshy GLB places its skinned mesh under an `Armature` node with uniform scale `[0.01,0.01,0.01]`. All child bone translations and action translation keyframes are roughly 100x real scale, and the inverse-bind matrices compensate with roughly 100x bases. Skinning can therefore look normal while a renderer using the mesh's static (non-skinning-aware) world bounding sphere sees an approximately **1.7 centimetre-tall** character centered at the feet and incorrectly culls it during face zoom.

V63 `tools/bake-armature-scale-v63.cjs` makes the change **in the GLB, not the runtime**:

1. Set Armature root scale to `[1,1,1]`.
2. Multiply all descendant node translation components by 0.01.
3. Multiply all animated translation output vectors by 0.01 (including Walk, Pick, etc.).
4. Multiply the first three **rows** of every inverse-bind matrix by 0.01, preserving the world-space combined skinning transformations.
5. Preserve positions, normals, UVs, indices, skin joint weights, original rotation curves, morph deltas and material images.
6. Do not disable frustum culling, override camera bounds, or change the currently deployed character.

A tested Python equivalent plus a separate numerical verifier and sampled-world-space renders are in the V63 download package.

## Measured independent test results

| | Original | V63 normalized |
| --- | ---: | ---: |
| Parent Armature scale | 0.01 | 1 |
| Static mesh height reported by world transform | 0.017 m | 1.700 m |
| Static sphere radius | 0.01019 m | 1.01903 m |
| V59 animation test | 18 sampled frames | All pose-equivalent |
| V61 animation test | 54 sampled frames | All pose-equivalent |
| Max sampled skinned vertex difference | n/a | 0.000000098 m (under 0.0001 mm) |
| Morph geometry | Unmodified | Unmodified |
| V61 nine action names, timing and rotations | Preserved | Preserved |

The body and separately exported blue Everyday outfit were **both normalized** in the same way; they retain identical 27-joint inverse-bind matrices and nine animation sample streams. The original authored V55 outfit remains incompatible and has NOT been retargeted.

**Headless Chromium, custom frustum proxy (not the game's Three.js renderer):**
- 390×844 face zoom: original CULLED, V63 VISIBLE.
- 844×390 face zoom: original CULLED, V63 VISIBLE.
- 390×844 full-body: both VISIBLE.
- 844×390 full-body: both VISIBLE.

The proxy uses real sampled GLB rest-pose positions and world mesh bounds but not Three.js's actual GLTFLoader or the game's shader. Source and output are in the download pack. It is a targeted diagnostic, **not** an in-engine pass.

For comparison, VTK renders of the original and fixed model at face framing had mean absolute pixel difference 0.00016 (0–255 pixel scale); this corroborates that the geometry has not visually changed.

## Reproduction

```bash
node tools/bake-armature-scale-v63.cjs path/to/V59_ORIGINAL.glb path/to/V63_FIXED.glb
node check/verify-rig-scale-v63.cjs path/to/V59_ORIGINAL.glb path/to/V63_FIXED.glb
```

For additional CPU animation validation use `verify_scale_bake_v63.py` in the downloadable V63 pack (NumPy and SciPy).

## Required release gates still failing or untested

- **Actual Three.js r128 / in-game creator test:** load V63 GLB at face close-up, full body, head turns, walk/carry/pick, in portrait and landscape; check mesh visibility and shadow behavior. The custom Chromium proxy alone is insufficient to green-light.
- **Face/hair:** bad eyelid morphs, braided hair intersections, weak mouth controls and residual nostril/neck artifacts remain. This change does not fix appearance.
- **Wardrobe:** original 27-joint V55 `tee/jeans/sneakers` uses a different bind pose. V61's mesh-derived Everyday is the only matched test pair.
- **Mobile performance:** 91,654 triangles and ~16 MiB decoded textures remain unchanged; no physical iPhone/Android FPS or memory measurements.
- **Gameplay:** no live co-op prop, wardrobe slot switching, save compatibility or full creator smoke test.
- **No automatic merge:** compare the candidate against V55 in the actual game before any promotion.

The separate GLB artifacts are not stored in GitHub in this PR; the review pack provides the binaries and reproducible source. Existing gameplay and saved users remain unaffected.

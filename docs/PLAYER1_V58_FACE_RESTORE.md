# V58 — face geometry rollback after unsafe hair classification

**Status: art review only; do not deploy or merge until in-engine evidence passes.**

The uploaded Meshy Player 1 GLB had been modified in V57 using a low-confidence braid classifier based on component extents and dark texels. The classifier also selected facial/skin islands. This caused tiny 3D changes across the nose and cheek, visible as black line defects in the rendered face.

V58 restores the *source V56 vertex positions and vertex normals*, without changing the V57 material-side shirt patch, 27-name bridge, four prototype morph targets, skin weights, indices, UVs or Idle/Walk/Run animation. 3,033 positions changed by more than 1e-8m; maximum restored displacement 6.083mm. Full and mobile binaries are in the downloadable Compound Days V58 pack, **not** this text-only PR.

## What is verified

- VTK imports both V58 master (~19.3MB) and mobile (~8.8MB).
- 27 named skin joints, 3 clips, 4 provisional morph target names, 91,654 triangles and 2 materials remain.
- Source-vs-repaired positions and normals are byte equal (V58 returns to V56 sculpt positions).
- Master/mobile GLBs preserve all animation samples, skinning attributes, morph deltas and triangle indices byte-for-byte.
- Independent regeneration produced matching SHA256 for the revised output files.
- The cheek/nose scratches are visibly reduced in the front 3D render, but not entirely gone.

## Critical safety rule

The glTF 2.0 specification defines texture coordinate (0,0) at the **upper-left** image pixel. Pillow images also use upper-left. Do **not** flip V when sampling the embedded base-color atlas. The actual V57 failure was **overly permissive mesh-island classification**, not texture UV orientation.

To edit hair automatically, first resolve the actual base-color texture through material → texture → image indices and classify mesh components; reject anything overlapping the eye, brow, nose, mouth, ear or skin of the face. Require human approval with neutral front/3/4/profile before writing geometry.

Spec: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

## Still blocked

- Small nose/chin and neck-seam artifacts remain; require Blender/WebGL comparison and manual sculpt.
- Automatic blink/smile/concerned targets are *prototypes*, not genuinely production-ready facial expressions.
- Reusing a 27-bone name list does NOT make inverse bind matrices compatible with the game's existing wardrobe; require a rig rebind and fit checks.
- 91.7K triangles are not phone-optimized. Mobile file only downsampled texture resolution.
- No new iPhone creator/world scene capture has been verified.

We keep V58 outside the live game. Do not swap it into the default character creator merely because these structure checks pass.

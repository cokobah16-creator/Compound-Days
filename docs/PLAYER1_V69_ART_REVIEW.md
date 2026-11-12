# Player 1 V69 — Shirt seam review and next hand/face sculpt

**Status:** review-only. `master` still uses the original V61 GLB. V68 breathing remains an independent draft PR.

## Verified diagnosis on the V63 scale-baked source
The character currently has one extra `top` material primitive filling a hole along the right underarm. It contributes exactly **145 triangles**, touching **115 indexed vertices**, in a small area bounded by X=+0.125–0.148 m, Y=1.074–1.207 m, Z=-0.016–0.095 m. This patch has **22 position vertices shared** with the main shirt and no duplicate full triangles. It covers about 0.00433 m² of surface, so deleting it would likely reopen an underarm gap.

Its source UVs are discontinuous relative to the shirt chart and sample dark atlas regions: the median source RGB is approximately (124,140,155) and some UVs sample nearly black around U=0.988/V=0.013. The main shirt is tinted blue over a light, textured albedo, whereas the patch has an untextured flat colour. That mismatch can produce the coloured side flecks seen in the mobile screenshots.

## Repair candidate
`tools/player1_v69_seam.py` makes a **separate**, never deployed `player1-v69-seam-review.glb` from **the exact optimized 5.1 MB `dist/assets/characters/player1-v61.glb` committed in master**:

- Identify the 145-triangle patch by topology/material; refuse ambiguous inputs
- Split those 115 vertex attributes into their own compact indexed primitive, leaving the original shared source data untouched
- Preserve all original positions, normals, joint indices, weights and skinning
- Remap that small patch's UVs using nearby vertices from the shirt's light albedo island, never the hair/denim/skin maps
- Reuse the existing textured main-shirt material
- Preserve triangle count, skeleton and every production animation; produce SHA-256 and before/after material sampling metrics
- Run the original and candidate in the actual 390×844 Three.js creator, including an underarm-focused camera

The UV projection is a **technical patch**, not an artist-approved garment topology fix. It must be visually reviewed during Idle, Walk, Pick, Carry, bent arms and close-up. If it smears fabric or exposes a hole, the candidate should be rejected and the underarm retopologized manually.

## V70 hand and face — artist-authored brief (NOT part of this patch)
The existing V61 model has a 27-joint armature but **no distinct finger joints**, and its face is baked in the skin texture with **no expression morphs**. Merely rotating the wrist does not alter individual finger silhouettes, and a texture overlay cannot open the eyelids or mouth.

Artist should make a single, polished head/hand revision, on a **duplicate** of the existing V61 source:
- Fix fingers: five recognisable digits per hand, believable knuckle forms, palm/thumbnail silhouettes, relaxed A-pose and grip poses; avoid separate capsule primitives
- Add a parented, skinned hand mesh or retopologized hand area with appropriate wrist deformation; if changing bones, supply an explicit mapping to the 27-joint game skeleton
- Sculpt eyelid margins around realistic eye sockets, integrated lips and nostrils and a clean neck-jaw transition; use 3–5 properly sculpted expression blendshapes (blink, smile, mouth open, concern), not displacing an existing texture by fractions of a millimetre
- Keep the same world scale, axis, rest pose, materials, UV atlas policy, and coordinate conventions; export glTF and test right/left profile, close-up and character creator on iPhone Safari
- No new character/face mesh should replace Player 1 automatically. First one human-reviewed front/profile/animation comparison; then optimize for mobile

## Acceptance
**V69 is an isolated underarm correction only.** Do not claim complete garment, hand, braid or facial repairs. V61 source stays shippable until the art review and full regression tests (including V66 shirt colours and V67 relaxed pose) pass.

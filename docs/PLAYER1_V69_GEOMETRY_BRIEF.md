# V69 — Character geometry upgrade: hands, face, shirt

## Scope and current truth

V68 is a **draft PR**, not on master. This V69 branch is stacked on top of it, and **must not be merged independently before V68**. The existing `player1-v61.glb` has a 27-joint skeleton, a static face and no independent finger joints. V69 is an **asset acceptance pipeline**, not a claim that a new character mesh has been sculpted or deployed. A replacement V69 GLB must be supplied or authored before geometry can actually improve.

## Sculpt / rig brief (Blender)

1. **Hands:** replace fused mitt shapes with distinct thumb and four-finger silhouettes; maintain plausible palm length and knuckles at the game's normal camera distance. Add at least one independently weighted finger joint per finger and thumb, for both hands. Inspect open-hand, carry-grip, and wave poses. Avoid intersecting fingers or a wrist seam.
2. **Face:** sculpt upper and lower eyelids around existing eye volumes; soften round eye openings; model a closed resting mouth with attached lips, natural nostrils and jaw-to-neck transition. Author shape keys named `Blink` and `Smile` on the face mesh. Shape keys must return cleanly to neutral.
3. **Shirt:** repair shoulder, underarm, neck and side seams. Check raised-arm wave, carry and bend; eliminate body clipping. Preserve V66 shirt colour materials/selection.
4. **Compatibility:** preserve root scale, metre units, +Y up, original hip/head/arm/leg bone names, and at least the five action clips `Idle`, `Walk`, `Carry`, `Pick`, `Wave`. Do not rename the game-facing rig without an explicit migration. Maintain the V61 albedo UV mapping and keep mobile triangle count at or below 180,000 as a first-pass ceiling (review draw calls/textures separately).

## Import contract and review

```bash
node tools/inspect-player1-v69.cjs /path/to/Player1_V69_CANDIDATE.glb --strict
node check/verify-player1-v69.cjs
```

The inspector checks GLB header and chunk bounds, skinned mesh presence, 27+ joint nodes, independently named finger joints, named face morph targets, action clips and a mobile triangle cap. It is intentionally strict: the old V61 character should **not** pass V69's new-geometry criteria. Static inspection is only the first gate.

After a candidate exists, create a **separate audition**: render face-front, face-three-quarter, hands-front, hands-side, wave, pick, carry, bend and all six outfits. Compare to V61/V68 under the same camera, lighting and skin tone. Run V66 palette, V67 relaxed pose, V68 endurance, culling and full mobile game tests. Do not switch the live hero until all tests and visual reviews pass.

## Known risks

- New finger bones can invalidate animations or imported inverse bind matrices if exported carelessly.
- Morph targets can inflate GLB size, GPU bandwidth and draw cost.
- Shirt seam fixes can break the V66 colour-palette mesh/material binding.
- V68's procedural wrist pose must be checked against the new finger rig.
- Current V69 script validates static structure only; it cannot prove realistic hand anatomy, eye quality, visual expression, clipping or Safari performance.

## Status

**Candidate mesh: not yet supplied.**
**V69 inspector and regression fixtures: ready for CI.**
**Live game: unchanged.**

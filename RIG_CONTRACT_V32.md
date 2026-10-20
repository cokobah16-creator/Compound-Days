# Compound Days — render body and garment contract v32

This amends v31. Coordinates remain metres, Y up, +Z forward; the original 27 joints, inverse bind matrices and nine animation clips remain unchanged. Saves keep the same base/build/face vocabulary and outfit identifiers. The starter ID now selects a crew tee and shorts; `tankset` preserves a selectable tank and shorts.

## Visible body

`assets/characters/efe.gltf.json` remains the 23,005-vertex reference used by legacy shape fields, wardrobe bindings and source animation. Its source upper-body surfaces are not the displayed sculpt. In `polish-v32.js`, `body32Skin` hides the original head, torso and arm primitives, along with old neck join patches. It adds one smooth torso loft and two smooth arm lofts to the existing skeleton. Legs, hands and feet retain the source data, with garment/ankle/wrist boundaries clipped before display.

The new torso has 64 columns and 48 segments. Arms have 40 columns and 36 segments. The torso blends between Hips, Spine, Spine1 and Spine2; arms blend between Arm and ForeArm. Separate contours avoid the source implicit mesh's fused inner-arm/waist topology. Skin materials preserve the selected sRGB colour through the existing conversion path. Slim/fuller change girth; Base A/B change proportions. Finger articulation has not been added.

`silhouette32` groups the authored v31 head, eyes, eyebrows, lips, ears, hair, beard and head accessories under the original Head bone. It scales uniformly by 1.24 and drops 0.020 m. The lower neck tapers back into the body connection; the face and every head accessory retain one coordinate frame. Blinking and gaze continue in the original local eye frame. Approximate balanced standing height is 1.84 m before the per-base actor scale; Base A retains 0.965 scale.

## New garment fit

`_CAGE32` is a scalar attribute with a constant semantic value on each primitive:

| Value | Surface |
| --- | --- |
| 1 | Sewn top |
| 2 | Bottom garment |
| 3 | Sneaker |

`residentReshape` delegates these primitives to `cage32`. The cage changes girth and Base A/B fit smoothly across the garment while preserving its sewn topology. Legacy `_BODY_IDS`, `_BODY_WEIGHTS` and `_FIT_REST` data remain embedded as reference and for older assets; those nearest-surface offsets do not drive tagged primitives. New art should target the visible contours and the current cage, not the inherited fused surface.

Each top is one connected surface, with neck, waist and two arm/cuff openings and 2 mm hem walls. There are no detached deltoid caps. Long-sleeve cuff weights resolve fully to ForeArm. The creator starter uses a crew tee; the separate tank set shares the shorts and sneakers.

## Skin boundary composition

Root extras `coverage32` contain one signed scalar per reference body vertex. Positive means covered. The runtime composes every worn field before restoring skin. For each original triangle, exposed skin is the intersection of the negative half-planes of all fields. Resulting polygon vertices retain barycentric position, normal, colour and skin-weight bindings. This prevents a patch restored by a top from piercing a bottom or shoe.

Coverage topology is cached by the complete outfit; shape positions are applied when constructing the actor, not each animation frame. New contour meshes replace the source upper-body patches. Source hand boundaries are clipped at y=0.918; ankles at y=0.127 for the new sneakers. Older assets without fields retain legacy coverage when combined with new pieces, and remain provisional.

Run `tools/complete-masks-v32.py` after rebuilding the five tops, shorts, office/cargo trousers or sneakers. That step adds current fields and `_CAGE32` attributes. Do not publish intermediate assets from the earlier body-shell tools without the final mask/cage pass.

## Rendering and review

Creator and thumbnails share the same four-light studio, platform and curved backdrop. Avatars receive one three-quad contact mesh using a cached 64-pixel radial alpha texture. Contact height follows the ground/roof while actor animation moves the body; it is hidden for sitting. Gameplay's 34-degree cameras retain the existing viewport and interaction bounds.

The staircase is four material batches with unchanged colliders and level lookup. No outline postprocess, speech rig or cloth simulation was added. `check/verify-v32.cjs` verifies geometry/state contracts and inherited behavior; `check/review32` is an offline mesh review, not a browser or GPU measurement.

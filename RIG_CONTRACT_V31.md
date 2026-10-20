# Compound Days — v31 visual integration contract

This revision preserves the v29 27-joint skeleton, metre/Y-up/+Z-forward convention, animation clips, player fields and browser save schema. The v30 seating corrections remain active.

## New head

`tools/build-head-v31.py` generates a shared triangulation with two bounded almond eye openings. `head-v31-data.js` contains its parameters and indices. `art-v31.js` evaluates the facial planes for Base A/B, the selected face, and named resident proportions. This replaces the rendered inherited head; it is not a glTF facial morph or a speech rig.

The surface attaches to `Head` in its existing local coordinates. Original skin is clipped at 1.502 m, retaining the lower neck and joining it to the new head. Retired facial parts stay hidden when legacy presence updates run. New eyes use bounded sclera patches, curved iris/pupil surfaces, tapered brows and skin lids. Blinking and gaze use the existing presence timing. Closed upper and lower lids overlap. Lip surfaces, nostril recesses, ears, beard and hoops follow the authored head.

Head geometry is cached by specification. Per-avatar facial geometry and materials are released when creator previews or thumbnails are replaced; shared head geometry remains resident.

## Body and garment shapes

`bases-v29.js` retains the original shape vocabulary while evaluating a smoother ribcage, waist and arm silhouette. Base, build and resident fields continue to contribute. The underlying skeletal body topology remains compatible with the original animation clips.

All new clothes use `_BODY_IDS`/`_BODY_WEIGHTS` to follow the exact body displacement. These three-sample CPU shape bindings are separate from normalized skeletal weights. Sewn tops additionally carry `_FIT_REST`: the weighted displacement of their Base B fit rest. Runtime position = authored position + weighted current displacement minus fitted-rest displacement. This avoids adding the sculpt a second time to an independently tailored garment. Torso panels bind to torso samples; sleeve caps use exact skin vertices and their skeletal weights. Tailored trousers use upper/lower leg blending; cuffs use forearm influences.

`build-tailored-tops-v31.py` authors torso panels, shoulder bridges, sleeves and cap panels for the tank, tee, office shirt and track/lounge tops. `build-starter-v30.py` authors the shorts, office trousers and cargo trousers; it accepts asset names as arguments. Bottoms use continuous waist/crotch/leg topology; cargo trousers add side pocket panels and flaps. Other older garments remain provisional.

## Exact skin boundaries

`extras.hiddenBodyTriangles` removes the original triangles touched by an outfit's coverage. `extras.revealSkin` retains exposed sub-triangles as source IDs and barycentric weights. The runtime rebuilds those patches with the same body displacement and skeleton.

Coverage is authored for the existing complete outfit combinations: tank with shorts, and the new tops with long trousers. This is not yet a general arbitrary layering solver. Patches from the retired neck above 1.485 m are excluded. Coarse shoe region coverage retains the legacy 0.94 threshold.

## Hair

The crop, coils and braided bun are authored against the new head in Head space. The crop and coils use a continuous scalp shell; coils add small modeled clumps. The bun uses interwoven strand paths. Each style stays below 10,000 triangles. The creator presents these three styles and bald; older saved hairstyle IDs still load for compatibility.

## Materials and lighting

Authored albedo maps are sRGB; bump and roughness maps are linear data. Gameplay, creator and thumbnails retain the managed output path. Sky and water shaders now include the output conversion chunks. The creator and thumbnails share a studio light arrangement. Gameplay uses the existing clock with a restrained daylight/evening palette.

The new environment material kit preserves the eight courtyard palettes. Paving, plaster, timber, cloth, metal, clay tiles and sand use shared maps. Windows, bevelled architecture, curved potted leaves and feathered palm crowns remain actual runtime geometry.

## Verification boundary

`check/results-v31.json` records geometry and state checks. `check/review31/` contains offline software renders of the built runtime meshes and material maps, with neutral shading. They do not reproduce the WebGL renderer, its PBR reflections, transparency, contact shadows or final display appearance. No target-phone frame rate has been measured.

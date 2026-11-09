# Compound Days — authored character contract

This describes how the game binds its character model and wardrobe from build v33a onwards: the authored hero model and the sixteen wardrobe pieces of build v21, bound the way `dist/index.html` has always bound them. Coordinates are metres, Y up, +Z forward. Assets are glTF 2.0 JSON files with one embedded base64 buffer under `dist/assets/`.

The runtime pieces that read this contract are `makeHeroAvatar`, `wardrobeEquip`, `wardrobeExtras`, `heroFindBones`, `heroClipName` and `hairOnto` in `dist/index.html`, plus the thin wrappers in `dist/src/visual-v21.js` (hair table, hair darkening and skin blend, the reference layer), `dist/src/color-v28.js` (skin recolour through the managed sRGB path) and `dist/src/authored-v34.js` (save and network migration, the hero revision query, and the single skin and hair calibration step that runs last: `skin`/`skin_dark` multiplied by `AUTHORED34.skinShade`, `wearhair_` materials set to `AUTHORED34.hairColour`). `node check/verify-authored.cjs` checks every item below against the shipped files.

## The hero: `dist/assets/characters/efe.gltf.json`

One scene with a single root node `Efe` carrying the skeleton (`Hips` subtree) and the `Body` node.

### Skeleton

One skin with exactly **27 joints in this order**, the "hero order":

```
Hips, Spine, Spine1, Spine2, Neck, Head, HeadTop_End,
LeftShoulder, LeftArm, LeftForeArm, LeftHand, LeftHandEnd,
RightShoulder, RightArm, RightForeArm, RightHand, RightHandEnd,
LeftUpLeg, LeftLeg, LeftFoot, LeftToeBase, LeftToe_End,
RightUpLeg, RightLeg, RightFoot, RightToeBase, RightToe_End
```

`heroFindBones` resolves the joints the game drives (hips, spine, spine1, spine2, neck, head, shoulders, arms, forearms, hands, up legs, legs, feet) by name through `HERO_BONE_ALIASES`; the `*_End` and toe joints are only animated. The inverse bind matrices are pure translations of the bind pose (Hips 0.86 m, Spine2 1.18 m, Arm 1.31 m, Head 1.43 m, Foot 0.10 m above the floor; toes 0.11 m forward). The SHA-256 of the inverse-bind-matrix accessor bytes starts `a0658cd22403`; every skinned wardrobe piece must carry the same bytes (see Binding below).

### Body

The `Body` node is one glTF mesh with **five primitives**, each with its own material, in this order and with exactly these material names:

| primitive | material | role |
| --- | --- | --- |
| 0 | `skin` | the whole figure including the integrated head |
| 1 | `top` | shirt volume baked into the body (textured cotton weave) |
| 2 | `bottom` | trousers volume (textured) |
| 3 | `shoe` | shoe upper |
| 4 | `sole` | sole |

Attributes: `POSITION`, `NORMAL`, `TEXCOORD_0`, `COLOR_0`, `JOINTS_0`, `WEIGHTS_0`. The loader makes each primitive its own `SkinnedMesh`, so the runtime works by material name: `makeHeroAvatar` paints `skin`, `skin_dark`, `top`, `bottom`, `shoe`, `sole` and `hair` from the look, and `wardrobeEquip` hides a slot by hiding every body primitive whose material has that name. The outfits that have no wardrobe files (`office`, `track`, `lounge`) are "painted slots": the `top`/`bottom`/`shoe`/`sole` primitives stay visible and take the outfit colours and procedural textures from `heroOutfit`.

### Head

From v55 the visible head is its own skinned mesh, `HeadSkin` (material `skin`, child of the root `Efe` beside `Body`, bound to the same skin): MakeHuman's CC0 head and neck built by `tools/hero_head.py`, chin at 1.475 m and crown at 1.775 m, the open end of the neck at 1.335 m inside every collar (radius at most 0.058 m below 1.41 m), weighted Spine2 -> Neck -> Head. The old head and neck pieces of the `skin` primitive are deleted, so the `skin` primitive now ends below 1.40 m. `HeadSkin` carries `COLOR_0`: lips, liner, brow shadow and nostrils painted as multipliers of the skin colour, so every skin swatch keeps them (`head-v55.js` turns vertex colours and morph targets back on after `heroLambert`). The lashes (`face_lash`, material `lash`), the strand brows (`face_brow`, material `hair`) and the two beard shells (`face_beard_stubble`, `face_beard_boxed`) are skinned meshes too. All five carry the same four shape keys, named in `mesh.extras.targetNames`: `masc`, `old`, `smile`, `blinkLeft`, `blinkRight`, `concerned`.

The `Head` joint carries the rigid parts in Head-joint space: the fitted eyes (`eye_l`, `eye_r`, each with `eye_white`, `iris`, `pupil`, `eye_hi`), the `earring` and its mirror `face_hoop` on the new lobes, `hair_scalp`, `hair_locs`, `hair_band` (refitted to the new skull) and the empty `face_beard` attachment. Material names matter: `color-v28.js` recolours `skin`, `skin_dark`, `eye_white`, `iris` and the `hair` material of `face_brow*`. The Head joint is drawn at scale 1: the head is sized by its geometry.

### Root extras

The root node `Efe` carries:

```json
"extras": {"hairMount": {"x": 0, "y": 0.2734, "z": 0.0261, "scale": 0.4301, "headR": 0.3},
           "headCentre": [0, 1.7034, 0.0261], "version": 5, "visualRevision": "...", "head55": {...}}
```

- `hairMount` places the game's built-in procedural hairstyles (`hairOnto`) when a wardrobe hair file is not loaded yet: `x,y,z` is the head centre in Head-joint space, `headR` the radius the built-in styles were modelled around, `scale` the factor that maps them onto this skull. With the wardrobe files present it is only the loading fallback, but it must stay.
- `headCentre` is the head centre in model space (v55: 1.70 m; the skull is about 0.22 m wide, it was 0.35 m before v55). The creator face camera (`polish-v30.js`) and the hair/headwear thumbnails (`environment-v31.js`) frame this point.

### Animation

**Eight clips**, matched by `heroClipName` on a case-insensitive substring of the clip name, so the names must contain these words: `idle`, `walk`, `carry`, `carryLow`, `walkCarry`, `walkCarryLow`, `pick`, `wave`. Each has rotation tracks on the 20 driven joints and (except `wave`) a `Hips` translation track. There is no sit clip: sofa seating is inverse kinematics on the live bones (`seatPose` in `polish-v30.js`, tuned to Hips 0.10 m above the cushion and the Foot joints 0.10 m above the floor).

## The wardrobe: `dist/assets/wardrobe/*.gltf.json`

Sixteen files, named in `WARDROBE.hair` and `WARDROBE.outfits` (`dist/index.html`, extended by `visual-v21.js`):

| look id | files |
| --- | --- |
| hair `low` | `hair_lowtaper` |
| hair `braids` | `hair_boxbraids` |
| hair `locs` | `hair_locs` |
| hair `afro` | `hair_afro` |
| hair `twists` | `hair_twists` |
| hair `wig` | `hair_wig` |
| headwear `wrap` | `headwrap_everyday` (replaces the hair) |
| outfit `tee` | `tee`, `jeans`, `sneakers` |
| outfit `ankara` | `ankara_shirt`, `ankara_trousers`, `sandals` |
| outfit `kaftan` | `kaftan_tunic`, `kaftan_trousers`, `leather_sandals` |

### Extras

Every file declares its metadata in the `extras` of a node (`wardrobeExtras` takes the first node whose extras carry `kind`):

```json
{"asset": "tee", "kind": "garment", "slots": ["top"], "tint": "top", "hideBottomBelow": 0}
```

- `kind`: `garment` (skinned cloth), `feet` (skinned shoes and sandals) or `hair` (rigid head pieces).
- `slots`: body material names to hide while the piece is worn, from `top`, `bottom`, `shoe`, `sole`. Tops hide `top`, bottoms hide `bottom`, feet hide `shoe` and `sole`, hair hides nothing.
- `tint`: `null`, `top` or `bottom`. The piece's material with that name takes the outfit colour and procedural texture that `heroOutfit` computes for the look (`fit.top`/`fit.topMap`, `fit.bottom`/`fit.botMap`); a material named `<tint>_dark` takes the shaded colour. A material named `skin` (the sandal foot) takes the player's skin tone. Every other material keeps its authored colour and embedded texture.
- `hideBottomBelow`: the height below which trousers should be cut for low shoes (0.12 on the sandals). It is declared for authoring tools; the current runtime does not read it.

### Binding

`wardrobeEquip` ignores the garment file's own skin. For every skinned mesh in the file it builds `new THREE.SkinnedMesh(geometry, material)` and calls `bind(body.skeleton, body.bindMatrix)` with the **hero's** skeleton and bind matrices; the new mesh is named `wear_<asset>_<node>` and added beside the body primitives. A piece therefore fits only when:

1. its `JOINTS_0` indices refer to the hero joint order above (every file embeds the 27-joint skin in that order), and
2. its rest-pose vertices were authored on the hero's bind pose.

The verifiable form of (2) is that the piece's inverse bind matrices are **byte-identical** to the hero's (`verify-authored.cjs` compares the accessor bytes). A file bound to another bind pose, even with the same joint names, floats off the body because the runtime rebinds it with the hero's matrices anyway. `WEIGHTS_0` rows sum to 1.

### Hair

Hair and headwear files are rigid: no skin, `POSITION`/`NORMAL` (optionally `TEXCOORD_0` and textures), authored in **Head-joint space** (origin at the `Head` joint, Y up, +Z toward the face). `wardrobeEquip` copies each node's world transform, parents the meshes under the Head bone in a `wardrobeHair` group and names them `wearhair_<node>`. Materials whose names start with `hair` take the hair colour (`visual-v21.js` darkens them and `authored-v34.js` then sets the final managed-path colour `AUTHORED34.hairColour`); `beard*` a lighter shade; anything else (`gold` cuffs, `scalp_parts`, `wrap_print`, `hair_detail`) keeps its authored colour. The pieces are sized for the hero skull. From v55 `tools/hero_head.py` moves every hair file (and the head-borne vertices of the jewellery files) from the v21 skull to the anatomical one, keeping each point's height above the skin; it always starts from the files as shipped in v54 (commit cb762f9), and each file records the fit in its extras (`fit55`: vertices, roots buried in the old scalp, vertices inside the new skin, and vertices the refit newly pushed inside, which must be about zero).

## Delivering a new authored base mesh

A replacement hero drops in without code changes when it keeps the contract:

- **Skeleton**: the 27 joints with the same names and order, one skin, skeleton root `Hips`. The bind pose may change, but then every wardrobe piece must be rebuilt on it so that all inverse bind matrices are again identical to the hero's; the seating constants in `polish-v30.js` and the camera heights in `polish-v30.js`/`environment-v31.js` are tuned to the heights above.
- **Body**: one mesh, five primitives with materials named exactly `skin`, `top`, `bottom`, `shoe`, `sole`, skinned to that skin, with `TEXCOORD_0` on the textured primitives.
- **Head**: rigid parts parented to `Head` using the material names listed under Head; built-in hair meshes named so `heroIsHairMesh` recognises them.
- **Root extras**: `hairMount` {x, y, z, scale, headR} and `headCentre` [x, y, z] measured on the new skull.
- **Clips**: eight, with names containing `idle`, `walk`, `carry`, `carryLow`, `walkCarry`, `walkCarryLow`, `pick`, `wave`, rotation tracks on the driven joints and Hips translation on the locomotion clips.
- **Materials**: un-rounded linear colours; textures embedded in the file.

Replace `dist/assets/characters/efe.gltf.json`, rebuild or re-author the sixteen wardrobe files on the new bind pose (`tools/rebuild_wardrobe.py` rebuilds the six cloth shells and the low taper on the skeleton embedded in the existing files; `tools/build_hair.py` authors the afro, twists and wig from the low-taper scalp), run `python3 tools/stamp-build.py`, then `node check/verify-authored.cjs` and `node check/verify-v33.cjs`.

## Known limitations of the v21 assets

- **Seated trousers sink into the cushion.** The loose crotch and upper thigh of `jeans`, `ankara_trousers` and `kaftan_trousers` are weighted to `Hips`, so when `seatPose` (polish-v30) bends the legs the cloth there hangs where it would standing instead of following the thighs. Measured in the harness after `sitStart()` and 45 frames: the deepest trouser vertex of the thigh band (rest height >= 0.60 m) lies up to 0.11 m below the cushion top (jeans shell), and the reviewer's narrower 0.60-0.78 m band measured 0.17 m; hips sit 0.10 m above the cushion and the sole meshes rest on the floor (within 3 mm). Raising the seated hips would lift the body rather than the cloth and would open the knees, so the constants stay as tuned; `verify-authored.cjs` records the sink and fails above 0.20 m. Fixing it means re-weighting those vertices toward `LeftUpLeg`/`RightUpLeg` in `tools/rebuild_wardrobe.py` and regenerating the three files.
- The locs' hairline band, the hard-edged low taper cap and the centre-front seam of the Ankara print are authored into the v21 files and render exactly as in the v21 captures.

## What was removed, and why

Builds v22 to v33 replaced the authored model with a procedurally generated body (`build-base-v29`: a signed-distance body with morph targets, a 0.178 m procedural head, a `sit` clip) and re-bound every wardrobe file to that body's bind pose, with fit data (`_BODY_IDS`, `_BODY_WEIGHTS`, `_CAGE32`, `_FIT_REST`, `coverage32`, `hiddenBodyTriangles`, `revealSkin`, `head31`) indexed to its 23,005 vertices. None of that fitted the authored model, and the nineteen garments and hairstyles made only for the generated body cannot be re-bound to it without re-authoring. Build v33a restores the v21 hero and its sixteen pieces verbatim and deletes the generated-character line: the modules `visual-v22`, `residents-v24`, `presence-v25`, `presets-v26`, `presence-data-v29`, `sculpt-v29-meta`, `bases-v29`, `presence-v29`, `head-v31-data` and `art-v31` (its stylesheet stays for the studio panel), the character parts of `polish-v30`, `environment-v31` and `polish-v32`, the nineteen v33-only wardrobe files, the `build-*-v30/31/32` tools, the offline review renders and the rig contracts v30 to v32. Saves and network looks that still carry the retired ids are mapped by `dist/src/authored-v34.js`. The retired pipeline and its contracts remain in git history at commit `9ea86cf` (build v33-8df2a65a).

## From v61: Player 1 loads `player1-v61.glb`; `efe.gltf.json` is the fallback

From build v61, `dist/src/hero-v61.js` loads `dist/assets/characters/player1-v61.glb` for Player 1 (`hero61Applies`: the look with `pi` 0; `visual-v21` gives every player look `rig:'hero'`) and keeps everything above as the fallback: when the V61 file fails to load or to validate, or when the game is opened with `?hero=v55` or `localStorage['cd3-hero']` is `'v55'`, `heroLoad` loads `efe.gltf.json` exactly as before and this whole contract applies unchanged (`?hero=v61` forces the V61 file on). Player 2 (the companion in solo play), the named neighbours, the sellers and the football kids keep the classic hero from `efe.gltf.json` with its wardrobe, so that file still loads at every boot; in two-phone play Player 1 is household slot 0, the host's character, drawn with V61 on both phones. The V61 asset is a binary glTF (GLB, 5,101,400 bytes) converted by `tools/player1_v61_convert.py` from the owner's V61 fitting model (`docs/PROVENANCE.md`, v61). It differs from the contract in these ways:

- **Skeleton.** The same 27 joints in hero order with the same names, under the root node `Player1` (scale 1: the source's 0.01 root scale is folded into the bone translations). The inverse bind matrices are unit-rotation blocks with metre translations (Hips about [-0.006, -0.937, -0.016]), not the pure translations of `efe.gltf.json` (Hips 0.86 m): the bind pose is Meshy's, so no wardrobe file fits this skeleton and none is bound to it.
- **Body.** One mesh `Body` with six primitives, materials in this order: `skin` (16,115 triangles), `hair` (29,939), `top` (15,293), `bottom` (24,744), `shoe` (5,418) and a second `top` (145, the untextured underarm patch, colour (0.32, 0.49, 0.77)); 91,654 triangles and 6 draw calls in all. There is no `sole` slot, no `skin_dark` and no eye, lash, brow or beard material: the face is part of the `skin` primitive and painted in the texture. Attributes are `POSITION`, `NORMAL`, `TEXCOORD_0`, `JOINTS_0`, `WEIGHTS_0` on every primitive (no `COLOR_0`, no tangents).
- **Hair** is a skinned primitive of the body (material `hair`), not a rigid piece under the Head joint; `heroIsHairMesh` matches it by material name, so `makeHeroAvatar` hides it and `hero-v61.js` shows it again.
- **Head.** No `HeadSkin`, no shape keys, no eye meshes: the asset has no morph targets at all (the source's five 5 to 10 mm targets are stripped), so `head-v55.js`'s blink and wave smile do nothing on it and the face is static.
- **Textures.** One 1024 × 1024 albedo JPEG (238,284 bytes) shared by the five textured materials.
- **Root extras.** `headCentre [-0.0019, 1.5452, 0.0555]`, `hairMount {x:0, y:1.5452, z:0, scale:0.43, headR:0.3}`, `version 61`, `visualRevision 'v61'`, `source`, `sourceSha256`. The head is smaller and lower than V55's (eyes at about 1.57 m, crown 1.70 m, chin about 1.44 m; `headCentre` 1.70 m in v55). `hairMount.y` is the world-space head centre (equal to `headCentre[1]`), not the Head-joint-space value this contract asks for (`efe`: 0.2734): the converter multiplies the Head translation by zero at `tools/player1_v61_convert.py:101`. Nothing on the V61 figure reads it, because the game's hair mount is removed and kit pieces are not mounted (below); the asset is frozen, so the converter is left as shipped, and both must change together if kit head items are ever to sit on V61.
- **Clips.** Eight, with capitalised names: `Idle` (0.03 s, a still pose), `Walk` (1.07 s), `Carry` (2.20, still), `CarryLow` (2.20, still), `WalkCarry` (1.03), `WalkCarryLow` (1.03), `Pick` (2.50), `Wave` (2.00). `heroClipName` matches them case-insensitively; the source's `Run` clip is dropped. The figure stands 1.697 m at Idle, 0.014 to 1.694 m over the Walk cycle, 0 to 1.583 m in Pick.

Runtime rules on the V61 figure (`dist/src/hero-v61.js`, checked by `node check/verify-hero-v61.cjs`):

- **No wardrobe, no kit.** `wardrobeEquip` is skipped while a V61 avatar is built: no `wear_*` mesh is bound, no `wardrobeHair` or `hairMount` group is mounted, and the asset's own hair stays visible. `makeAvatar` is wrapped outside kit-v50's wrapper and passes Player 1's look with `kit` removed, so no `kit50_*` mount is built on the figure and its own `shoe` primitive stays visible (kit-v50 places head items from the asset's `hairMount` extras and shoes to the classic foot); `S.p[0].kit` is untouched and the kit panel says so while Player 1 is selected. The creator's hair, headwear and outfit choices for Player 1, aso-ebi `wear` events and kit pieces do not change the figure; the skin tone, hair, headwear and outfit still drive the 2D portraits and everything else that reads `S.p[0]`.
- **No paint.** The textured materials are drawn with the albedo map in the asset's own colours (white for `skin`, `hair`, `bottom` and `shoe`; the tee's blue (0.32, 0.49, 0.77) for `top`) and vertex colours off; the untextured underarm patch keeps the same blue. The skin tone swatch does not recolour `skin`, and `authored-v34`'s skin shade is not applied (the `skin` materials carry `userData.authored34Skin`).
- The creator's option thumbnails are rendered on the classic hero with the chosen piece (`thumbRender` passes the look with `hero61:false`; `rig` stays `'hero'`), because every option would look identical on the V61 figure; the creator face view frames the smaller head from `HERO61.faceCam` instead of head-v55's camera.
- If the V61 build throws (in the base builder on the swapped asset or in the V61 dressing), `HERO61.state` becomes `'error'` with the reason, the console warns, and Player 1 is built from the classic asset in the same call; `HERO`'s `gltf`, `state` and `clips` are restored in every case, so a V61 fault never marks the classic asset broken.
- `frustumCulled` stays off on the skinned meshes, as `makeHeroAvatar` sets it.

`verify-authored.cjs` keeps checking the V55 fallback and the authored wardrobe against the contract above.

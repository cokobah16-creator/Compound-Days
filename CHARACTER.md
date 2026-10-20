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

The `Head` joint carries rigid, unskinned modelled face parts in Head-joint space: `eye_white`, `iris`, `pupil`, `eye_hi` (both sides), `face_lash`, `face_brow`, ears (`skin_dark`), `lip_top`, `lip`, tongue, `hair_scalp`, `hair_locs`, `hair_band`, `earring` and an empty `face_beard` attachment. Material names matter: `color-v28.js` recolours `skin`, `skin_dark`, `eye_white`, `iris`, `lip_top`, `lip` and the `hair` material of `face_brow*` nodes. The built-in locs and scalp are hidden whenever a wardrobe hairstyle is equipped (`heroIsHairMesh` matches node names containing hair/locs/braid/twist/afro/scalp/wig/wrap or a material named `hair*`).

### Root extras

The root node `Efe` carries:

```json
"extras": {"hairMount": {"x": 0, "y": 0.215, "z": 0, "scale": 0.6767, "headR": 0.3},
           "headCentre": [0, 1.645, 0], "version": 5, "visualRevision": "..."}
```

- `hairMount` places the game's built-in procedural hairstyles (`hairOnto`) when a wardrobe hair file is not loaded yet: `x,y,z` is the head centre in Head-joint space, `headR` the radius the built-in styles were modelled around, `scale` the factor that maps them onto this skull. With the wardrobe files present it is only the loading fallback, but it must stay.
- `headCentre` is the head centre in model space (1.645 m; the skull is about 0.35 m wide). The creator face camera (`polish-v30.js`) and the hair/headwear thumbnails (`environment-v31.js`) frame this point.

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

Hair and headwear files are rigid: no skin, `POSITION`/`NORMAL` (optionally `TEXCOORD_0` and textures), authored in **Head-joint space** (origin at the `Head` joint, Y up, +Z toward the face). `wardrobeEquip` copies each node's world transform, parents the meshes under the Head bone in a `wardrobeHair` group and names them `wearhair_<node>`. Materials whose names start with `hair` take the hair colour (`visual-v21.js` darkens them and `authored-v34.js` then sets the final managed-path colour `AUTHORED34.hairColour`); `beard*` a lighter shade; anything else (`gold` cuffs, `scalp_parts`, `wrap_print`, `hair_detail`) keeps its authored colour. The pieces are sized for the hero skull: the scalp boundary comes from `hair_lowtaper`, the skull is about 0.35 m wide, the crown about 0.43 m above the Head joint and the head centre 0.215 m above it, as `hairMount.y` and `headCentre` state.

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

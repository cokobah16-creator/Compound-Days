# Art brief: v35, three days in Palm Court

Status: draft for week one, written alongside the v35 code. The build ships stand-ins for everything here, so art never blocks code. Each item below replaces a stand-in without code changes beyond the binding named in its row.

**Direction.** A soft, rounded, miniature Nigerian neighbourhood. Stylised characters with recognisable Black features, expressive faces and well-shaped textured hair. Warm plaster, colourful gates, zinc roofs, patterned fabrics and lush plants, all at one level of detail. Soft shadows and clear silhouettes. Everything is judged on the test phones at the default camera, never in a desktop browser alone.

**Gate.** Silhouette and proportions are approved on one finished base and one outfit before any other outfit or hairstyle is rebuilt. That gate does not block the clips below: they are authored on the current v21 base and carry over through the contract in `CHARACTER.md`.

## 1. Character clips (current v21 base)

Authored on `dist/assets/characters/efe.gltf.json` under `CHARACTER.md`: the 27 joints in hero order, rotation tracks on the 20 driven joints, keys at 30 fps, no scale tracks. The game drives the arm pose for fishing procedurally today (`bridge-v34b.js`); these clips replace it.

| Clip | Length | Loop | Notes |
|---|---|---|---|
| `cast` | about 1.2 s, then holds its last frame | no | Rod in the right hand, a back-swing and a forward flick toward the water, ending with the arm raised and the rod tip out over the water. No Hips translation. |
| `castHold` | 2 s | yes | The waiting pose: weight shifts, a small look down the line. Must blend from the last frame of `cast`. |
| `reel` | about 0.9 s | no | A short lift and pull back, ending relaxed. Plays when Reel in is pressed. |
| `water` | about 1.6 s | yes | Watering can held in the right hand at hip height, tipped toward a pot at knee height in front. |
| `react` | about 1.0 s | no | A small pleased bounce or clap, for a catch, a harvest and a neighbour's evening line. Readable from behind at phone size. |

Binding work for the code side: the eight clip names are matched by substring in `heroClipName`, so these five need a small wrapper that maps them and plays them in place of the procedural pose. Clip names must not contain any of the existing eight words (`idle`, `walk`, `carry`, `pick`, `wave`), or the substring match will pick them up as the wrong clip.

**Hand props.** A fishing rod and a watering can, each a rigid glTF JSON file in `dist/assets/props/` with one embedded buffer, origin at the grip, +Y along the handle. Put the grip offset and rotation for the RightHand joint in the root node's `extras`, for example `{"kind":"handprop","joint":"RightHand","grip":[x,y,z],"rot":[x,y,z]}`. The rod is about 1.8 m and thin enough to read as a line at phone size; the float stays procedural.

## 2. Pepper plant on its stand

The pot stands on a timber stand on the veranda row, so the plant shows over the veranda wall. Four states, readable from the default camera on a phone, where the whole plant is about 40 to 60 pixels tall:

| State | What the player must read |
|---|---|
| Empty pot | Fresh soil, clearly waiting. Tunde's seedling arrives on the day-2 morning. |
| Stage 1 | A seedling: two or three leaves, clearly alive. |
| Stage 2 | A young bushy plant with small white flowers or green buds. |
| Stage 3 | Fruiting: three glossy red peppers (ata rodo), clearly harvestable from across the veranda. |

One file with nodes named `stage0` to `stage3` (the game shows one at a time), or four files. The footprint fits inside one 0.9 m cell, including the stand. Match the current stand height in the build so the plant clears the veranda wall. A watered plant shows darker soil until morning; a separate `soil_wet` material in each stage node is enough.

## 3. Veranda seating

The woven armchair (`armchair_woven.gltf.json`) and the chairs are the only furniture allowed on the veranda row in v35. Check that both read well outdoors at phone size: the armchair is Ada's chair, the one moment of day 2, and the player will place it and look at it. If the cane back reads as a flat block at that size, open up the weave silhouette rather than adding texture detail.

## 4. Wall colours and floors

The build ships three wall colours and two floors as flat colours on the existing room boxes, on offer at Palm Court Finds. Art supplies final swatches: a tileable 512 px texture per finish with gentle variation, readable as plaster or floor at phone size, and one flat linear colour per finish for the far level of detail. The finishes and their stand-in colours are listed below once the build fixes them.

| Finish | Stand-in in the build | Final swatch |
|---|---|---|
| (filled in from `tune-v35.js` after integration) | | |

## 5. The fifteen furnishings

Every Finds furnishing needs either a visible use or a neighbour line that reads it. Items with neither are art work: a small animation, a light or a state change that makes them worth owning.

| Item | Visible use or line in v35 | Art needed |
|---|---|---|
| (filled in after integration) | | |

## 6. Delivery checklist

- glTF 2.0 JSON, one embedded base64 buffer, metres, Y up, +Z forward, linear colours, textures embedded.
- Character files keep the 27-joint hero order and the hero's inverse bind matrices; `node check/verify-authored.cjs` passes after `python3 tools/stamp-build.py`.
- Material names follow `CHARACTER.md` where it names them.
- Each delivery comes with a phone screenshot at the default camera, taken on a real phone.

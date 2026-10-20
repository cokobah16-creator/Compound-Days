# Compound Days — Waterside

Build **v33a**, the authored-character line: the v33 environment and first-evening gameplay with the authored v21 character model and wardrobe restored. The exact id is stamped in `dist/index.html` (`BUILD_ID`), shown in the game Menu and recorded in `PACKAGE_MANIFEST.json`.

A browser life game set in a Nigerian compound. Create two independent players, move the sofa into your flat, shop, cook, learn crafts, furnish your home and host neighbours.

## Play

Choose **Start with a companion** to play alone, or **Start a new household on this phone** for two people sharing one screen.

- Player 1: WASD to move, E to interact.
- Player 2: arrow keys to move, Enter to interact.
- Phones: use the on-screen sticks and action buttons. Landscape gives both players more room.
- Saves stay in that browser on that device. Published v30–v33 share an origin and save schema; v33a reads those saves and maps their retired looks (see below).

Cross-device play requires the inherited host's room/database API, which is unavailable on this static hosted copy. Companion and same-screen play are supported.

## v33 — The first evening

New households arrive at 3pm with six saved milestones: move the sofa, gather jollof ingredients, cook together, host neighbours, choose a home gift, and choose tomorrow’s visit. Open **Tasks** on desktop or phone for the journal. The normal free-play activities remain available.

- Existing saves stay unchanged until the player chooses to follow the evening; existing achievements count.
- The guided pre-party clock pauses at 6:30pm so ordinary wandering does not close the market. Pause guidance to restore normal time. There is no real-time completion deadline.
- A one-time optional welcome basket fills only missing jollof ingredients. A meal that was eaten or sold can be cooked again before hosting.
- Action-boundary saves preserve cooking answers and party choices. Continue reopens an unfinished recipe or party.
- The first guided housewarming avoids the rooftop rain detour and always offers a photo until one is taken. Later parties keep their existing weather behavior.
- A plant, rug or wall art reward can be claimed once. A full flat sends it to Build storage. The following morning delivers the player’s chosen Yard invitation.

## v33a — The authored character

Both players, both creator previews and the five named neighbours use the authored humanoid model from build v21 (`dist/assets/characters/efe.gltf.json`: modelled head, face and body, 27 joints, eight clips). Background walkers and sellers use the same model through `environment-v23.js`. The sixteen v21 wardrobe pieces are restored verbatim and bound as in v21: tee, jeans, sneakers; Ankara shirt, trousers, sandals; kaftan tunic, trousers, leather sandals; low taper, box braids, locs, afro, twists, long wig and the everyday head wrap. Office shirt, tracksuit and lounge set are painted onto the body's own clothing slots, as in v21. `CHARACTER.md` documents the binding contract and how a new base mesh must be delivered.

Kept from the v22–v33 line: the v23/v31 environment, materials and lighting; the v28 colour pipeline; the v30 sofa seating and creator tabs (Body with skin tone, Hair, Clothes, About you), retuned to the v21 rig; the v32 joined staircase, parapet copings, lit creator/thumbnail stage, contact shadow and 34-degree lens; the v33 first evening.

Removed: the procedurally generated body, its morph bases, builds and faces, the procedural head, presence (blink, breathing, glance, rim light), the fitted v30–v32 garments and the nineteen wardrobe files that existed only for the generated body, with their modules (`visual-v22`, `residents-v24`, `presence-v25`, `presets-v26`, `presence-data-v29`, `sculpt-v29-meta`, `bases-v29`, `presence-v29`, `head-v31-data`, `art-v31`), build tools, offline review renders and rig contracts. None of it fitted the authored model (see the last section of `CHARACTER.md`). It remains in git history at build v33-8df2a65a.

Saves from v26–v33 keep working: `dist/src/authored-v34.js` maps the retired outfit ids `starter`, `tankset`, `basics`, `everydayefe` to `tee` and `everydaytunde` to `ankara`, and the retired hair ids `none` to `low`, `curls` to `twists`, `braidbun` and `braidsup` to `braids`, on load, in new-game defaults and on looks received from a co-op peer. The other saved creator fields are ignored.

## Verification

```sh
node check/verify-authored.cjs
node check/verify-v33.cjs
```

The Node harness (`check/runtime-harness.cjs`) executes the shipped JavaScript with the bundled Three.js and glTF loader; nothing is rendered. `verify-authored.cjs` writes `check/results-authored.json` and checks the hero (27 joints in hero order, 8 clips, five material-named body primitives, `hairMount`/`headCentre` extras), the sixteen wardrobe files (exactly those are referenced and parse, every skinned piece carries the hero's inverse bind matrices byte for byte), both players on the hero rig, every hair and outfit id equipping and hiding its slots with the painted outfits building cleanly, the save/network/default migration, the five neighbours plus walkers and sellers with their statures, the environment (surface registry, four-batch staircase, eight courtyard presets, material textures on disk, idempotent studio stage, 34-degree lens), seating in four sofa orientations (hips and feet at the retuned heights, sole meshes on the floor, trouser sink within the documented limit) with saves keeping standing positions, and the build id in the Menu. `verify-v33.cjs` writes `check/results-v33.json` and exercises the real cooking and party actions, reloads, clock behaviour, migration, reward deduplication and recovery paths.

Browser appearance, colour under the v28/v31 lighting, phone frame rate and audio are not covered by the harness and remain unverified in this build.

## Run a local copy

The game needs no build step or package installation. Serve `dist` through HTTP:

```sh
python -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Opening `index.html` through `file://` can block asset loading.

## Rebuild assets

Python tools require NumPy and Pillow. They are optional and not needed to play.

```sh
python tools/rebuild_wardrobe.py      # the six cloth shells and the low taper, on the skeleton embedded in the files
python tools/build_hair.py            # afro, twists and wig from the low-taper scalp
python tools/build-materials-v31.py   # the environment material maps
python tools/stamp-build.py           # always last after any change under dist/
node check/verify-authored.cjs        # rewrites check/results-authored.json for that stamp
node check/verify-v33.cjs             # rewrites check/results-v33.json
python tools/package-manifest.py      # refresh PACKAGE_MANIFEST.json after the results files
```

`tools/stamp-build.py` writes the build id (prefix `v33a-`) into `dist/index.html`; never edit it by hand. See `CHARACTER.md` for the character and wardrobe conventions and `CONTRIBUTING.md` for the repository layout. Third-party library attribution remains in the supplied files.

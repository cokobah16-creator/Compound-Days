# Compound Days — Waterside

**Your home. Your people. Your story.**

A cosy two-player life sim set in Waterside, a fictional Nigerian neighbourhood. Two people move into Palm Court, Flat 3, together: carry the sofa through the passage, shop Market Road, learn at the Makers' Yard, cook at two stations, sew aso-ebi, plant the square's garden, climb to the roof terrace, and host the courtyard when there is something to serve. Nothing is timed. Walls and weather are the only enemies.

The game is one HTML file rendered with [three.js](https://threejs.org/) r128, a small visual module, and a folder of glTF assets. This repository is at build `v21-ed74a8eb`; see `README_V21.md` for what that pass changed and what it verified, and `CHANGED_FILES_V21.txt` for the file list.

The build id is shown in the game's Menu and stored in `BUILD.json`, and every image in `review/` carries the same stamp, so a screenshot can always be matched to the build it came from. `tools/stamp_build.py` computes the id as a hash over `index.html`, `src/` and `assets/`, so `index.html` is committed byte-for-byte as shipped, including the outer artifact wrapper around the page. Rerunning the script on an unchanged checkout reproduces the same id.

## Play it

The page fetches its 3D assets with XHR, so it has to be served over HTTP rather than opened from disk.

```sh
cd Compound-Days
python3 -m http.server 8000
# then open http://localhost:8000/
```

Any static host (GitHub Pages, Netlify, Vercel, an S3 bucket) works the same way: publish the repository root as-is.

three.js is bundled in the repository, so the game runs without a connection. The display fonts come from Google Fonts and fall back to system fonts when that request fails.

The review sheet for the latest pass, with renders of all three looks and every hair option, the veranda by day and evening, and the test reports, is at `http://localhost:8000/review/`. The side-by-side against the previous build is at `http://localhost:8000/review/comparison.html`.

## Controls

One screen, two players, split side by side.

| | Player 1 | Player 2 |
|---|---|---|
| Move | WASD or left stick | Arrow keys or right stick |
| Act | E | Enter or Shift |

Gamepads are supported. On touch devices each half of the screen has its own stick and Act button.

Playing alone? Pick "Start with a companion" on the title screen. Your housemate then lives in the compound with you: they take the other end of the sofa, run their own station when you cook, pick their moves at the party, and buy what is missing at the market.

Progress saves automatically to the browser's local storage, so a household can be continued from the title screen.

## Online co-op

When the page runs inside a claude.ai artifact it can use the artifact runtime's room, database, and user capabilities to let two people play one household from separate devices. Outside that runtime those capabilities are absent and the game stays in local two-player mode.

## Repository layout

```
index.html              the game: styles, inlined GLTFLoader, and all game code
src/visual-v21.js       shared character pipeline for players and neighbours, carry framing, foliage
src/visual-v21.css      HUD and phone-control layout for that pass
BUILD.json              the build id and the files it hashes
assets/vendor/          three.js r128 (MIT)
assets/characters/      efe.gltf.json, the rigged hero character
assets/env/             courtyard.gltf.json, the Palm Court diorama
assets/props/           33 furniture, kitchen, and everyday props, including the generator,
                        washing line and banana plant used on the veranda
assets/wardrobe/        garments, six hair styles, the everyday wrap, and footwear
tools/                  wardrobe and hair build scripts, the build stamp, and two Playwright harnesses
review/                 renders and JSON reports from the latest pass
```

Keep `index.html`, `src/` and `assets/` together; the page loads the module and the library by relative path.

Every asset is a glTF 2.0 file exported from three.js and stored as `.gltf.json` with the binary buffer embedded. Props carry metadata in their root node's `extras` (prop id, footprint size, category, whether one or two people can carry it, triangle count). Wardrobe pieces carry their kind, body slots, and tint group in the same place.

## Checking a change

`tools/look-check.cjs` is a Playwright harness that drives the real game: it creates both players and the named neighbours, renders each look and every hair option, pushes the crate, carries the sofa through the passage, checks the escape after setting a rotated sofa down, and checks save and reload. `tools/touch-check.cjs` repeats the creator and carry framing under phone touch emulation in portrait and landscape. Both write their captures into `review/`, so run them on a copy if you want to keep the committed renders. With Playwright and its Chromium installed and the game served locally:

```sh
node tools/look-check.cjs
node tools/touch-check.cjs
# set COMPOUND_GAME_URL if the server is not at http://127.0.0.1:8000
```

The wardrobe meshes are generated by `tools/rebuild_wardrobe.py` and the hair assets by `tools/build_hair.py` (NumPy and Pillow) on the existing 27-joint rig. After changing anything under `index.html`, `src/` or `assets/`, run `python3 tools/stamp_build.py` to write the new build id into the page and `BUILD.json`.

The Menu also shows a frame-time readout (average ms, fps, resolution, draw calls, triangles) that accumulates both split-screen renders. Those are diagnostic counts from whatever device is running the game, not a benchmark.

## Credits

three.js and its GLTFLoader are MIT licensed. Fonts are Fraunces, Figtree, and Caveat from Google Fonts.

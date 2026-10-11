# Compound Days — Waterside

**Your home. Your people. Your story.**

A cosy two-player life sim set in Waterside, a fictional Nigerian neighbourhood. Two people move into Palm Court, Flat 3, together: carry the sofa through the passage, shop Market Road, learn at the Makers' Yard, cook at two stations, sew aso-ebi, plant the square's garden, climb to the roof terrace, and host the courtyard when there is something to serve. Nothing is timed. Walls and weather are the only enemies.

The whole game is one HTML file rendered with [three.js](https://threejs.org/) r128, plus a folder of glTF assets.

## Play it

The page fetches its 3D assets with XHR, so it has to be served over HTTP rather than opened from disk.

```sh
cd Compound-Days
python3 -m http.server 8000
# then open http://localhost:8000/
```

Any static host (GitHub Pages, Netlify, Vercel, an S3 bucket) works the same way: publish the repository root as-is.

three.js is loaded from cdnjs and the display fonts from Google Fonts, so the first load needs a network connection. The game falls back to system fonts if the font request fails and shows a plain message if three.js cannot load.

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
assets/characters/      efe.gltf.json, the rigged hero character
assets/env/             courtyard.gltf.json, the Palm Court diorama
assets/props/           31 furniture, kitchen, and everyday props
assets/wardrobe/        garments, hair, headwraps, and footwear for the hero
```

Every asset is a glTF 2.0 file exported from three.js and stored as `.gltf.json` with the binary buffer embedded. Props carry metadata in their root node's `extras` (prop id, footprint size, category, whether one or two people can carry it, triangle count). Wardrobe pieces carry their kind, body slots, and tint group in the same place.

## Credits

three.js and its GLTFLoader are MIT licensed. Fonts are Fraunces, Figtree, and Caveat from Google Fonts.

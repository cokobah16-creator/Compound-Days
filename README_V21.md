# Compound Days — Waterside · v21-ed74a8eb

A local source update based on the supplied **v20-781a1ac** archive. This ZIP has not been deployed to your Claude-hosted game.

## Use it

Keep `index.html`, `src/` and the complete `assets/` directory together. Replace the project as a whole, or ask Claude Code to merge the files listed in `CHANGED_FILES_V21.txt`. Do not import only the HTML file: it loads `src/visual-v21.js` and `src/visual-v21.css` before boot.

For a local preview, run `python3 -m http.server 8000` from this directory and open `http://localhost:8000`. The Three.js runtime is bundled. The optional web fonts still use Google Fonts; the page has fallbacks. The original online lobby requires its original service/host and is not provided by a plain static server.

The game menu and `BUILD.json` must show **v21-ed74a8eb**. `tools/stamp_build.py` creates the stamp from the runtime and asset bytes. All v21 review images use that stamp. `review/uploaded-v20.png` is explicitly labelled as the older source for comparison.

## What changed

- Both players, both creator previews and the five named neighbours now use the imported humanoid model. Each actor has its own skeleton and mixer. Background walkers and anonymous vendors remain lightweight built-in characters.
- Integrated the connected wardrobe shells from the previous v19 package into this newer v20 source: tee, jeans, Ankara shirt/trousers, kaftan tunic/trousers and the softer low taper. This removes the separate domed sleeves and hanging side panels from the three equipped looks. Kaftan trousers follow the tunic colour.
- Added separate glTF assets for a rounded textured afro, two-strand twists and a centre-parted long wig. All six hair choices and the everyday wrap now equip as wardrobe assets on both players. These are authored stylized meshes; they are not Meshy output or a commissioned strand groom. Hair remains attached to the head without simulation.
- Removed the compulsory chin-strap beard from the low-taper option. Facial-hair selection is still not implemented.
- Calibrated skin material tints locally for the existing bright game lighting. The chosen skin range remains visibly distinct; this is an art adjustment, not a claim of colour-calibrated rendering.
- Preserved v20's generator, washing lines, banana plants, veranda seating, evening light and indigo carried sofa. Added the v19 leaf-based trees and bougainvillea, and moved Mrs. Oyelaran out of the sofa's footprint.
- Kept the two-view local layout, with bounds fitting around both players and the sofa during carrying. Reduced HUD clutter and let the creator's Next action occupy space in the scrolling layout.
- Preserved the rotated-sofa escape fix. Fixed the wardrobe queue's callbacks, refreshed both previews as assets arrive, and retained transparency masks/material maps.
- The menu's render counters now accumulate both split-screen renders. They are diagnostic counts; they do not establish physical-phone performance.

## Actual checks

`review/test-results.json` records 12 checks against the build above: independent keyboard movement; distinct player skeletons and mixers; both players and five neighbours loading; 16 wardrobe and 33 prop assets with no failures; every hair/headwear option on both players; the three outfit turnarounds and walk poses; crate pushing; both carry clips; a complete sofa route through the gate, narrow passage and home entrance; escape after putting down a rotated sofa; appearance/headwear/sofa save-and-reload; and the menu stamp.

The carry fixture uses the real movement, collision and interaction functions, with a controlled clock. The seedling crate is pushed clear first. Review positions are staged where useful for inspection. The walking images are animation-pose captures, not motion-performance evidence. No v20 or v19 video is represented as v21 footage.

`review/mobile-layout-results.json` records Chromium touch emulation at 430×932 and 932×430, an actual synthetic touch gesture moving Player 1, Player 2 creator selections and 14 rendered option thumbnails, and both players/sofa staying within the camera view. Emulation is not a physical-device test.

Khronos glTF validation found **zero errors in all ten changed/new wardrobe files**. Six skinned garment files retain the non-root skinned-node warning associated with the existing runtime binding structure; these warnings are recorded in `review/asset-validation.json`. The three new static hair assets have no validator warnings.

To repeat the main checks: install Playwright in your development environment, serve the game, then run `node tools/look-check.cjs`. Run `node tools/touch-check.cjs` for the touch-emulation checks. Set `COMPOUND_GAME_URL` if you use another port. Asset-authoring scripts require Python, NumPy and Pillow; they are optional and are not needed to play.

## Still needs work

The base face/body sculpt is inherited. These changes do not achieve the richness of an AI concept painting. Hair is a first asset pass: close-up grooming, scalp-part refinement and shoulder clearance still need art review. Some wig tips and locs can intersect shoulders during motion. The Ankara texture remains the existing procedural print.

Office shirt, tracksuit, lounge set and some tailored outfits still use the base outfit slots/recolour system. Consequently some neighbours retain those simpler clothing shapes even though their body and face use the shared model. No new sitting animation, cloth simulation, finger IK or new prop interactions were added. Market-canopy occlusion is unchanged.

Physical phones, real controllers, online play/reconnection and long-session GPU/memory behaviour were not verified here. Adding modelled neighbours and hair increases geometry; assess the menu frame-time reading on the intended devices before expanding the crowd. Review screenshots are not frame-rate measurements.

The save key and schema are unchanged. Existing browser saves depend on serving from the same origin/browser. This project uses the existing fallback avatar if the character asset is unavailable.

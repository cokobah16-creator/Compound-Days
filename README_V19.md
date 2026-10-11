# Compound Days — visual pass 19.0

This is an edited copy of the uploaded game project. It has not been deployed to the existing live game. The review images come from this game's actual meshes and renderer, not AI concept art.

## Run

Keep `index.html`, `src/` and `assets/` together. From this folder run:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Open `http://localhost:8000/review/` for the comparison sheet, all three looks, the carry replay and test results. The core Three.js engine is included locally. The original online integration still requires its supported host; a local static server does not provide the online service.

For Claude Code: use this whole project as the next source revision. Do not copy only `index.html` or regenerate the garments from the review images.

## What changed

- Rebuilt the cotton tee, Ankara shirt, kaftan tunic and their three trouser assets on the existing 27-joint rig. The shoulders join the torso; the tunic has a continuous hem. Added a cloth neckline/collar and restrained trim. Removed the detached shoulder and hip-panel construction in these pieces.
- Corrected the excessive front-to-back garment depth, made fabric colour apply once, and brought the Ankara motif scale into agreement across shirt and trousers. Denim now reads as denim instead of nearly black fabric.
- Added alpha-tested hair-density texture to the existing fitted low-cut scalp. Removed the inherited hard chin-strap beard from that hairstyle. The underlying head and the braid/loc assets remain the supplied models.
- Fixed the player-selection path that previously assigned the imported character only to Player 1. Both players and their creator previews now use the same character and wardrobe pipeline.
- Preserved glTF alpha masks and material maps when the loader converts materials. Fixed wardrobe prefetch completion so a failed optional file does not stall subsequent loads. Wardrobe requests carry the build revision for cache invalidation.
- Joint sofa carrying now uses one shared camera locally. The fitted bounds include both characters and the sofa, with space for the HUD and controls. Separate views return after carrying ends. Existing keyboard, touch and network input paths remain in place.
- Reduced the HUD to a short shared goal, budget, clock and existing controls. Compacted the landscape phone controls. Kept the creator action in its scrolling layout.
- Replaced the tree and bougainvillea sphere clusters with batched leaf geometry. Added a small entrance seating corner using the project's existing chair, table, cooler and plant models; all new colliders stay west of the gate route. Brightened the teal upholstery and improved fill light.
- Kept the supplied game, activity rules, save key and appearance data fields. Save continuity depends on the same browser/origin, as in the supplied build.

## Verified here

Tests ran in Chromium 133 with a software WebGL renderer in a controlled local browser, with a fresh temporary profile.

- Both imported characters, all 13 wardrobe files and all 30 prop files loaded without asset failures.
- Both keyboard-controlled players moved independently.
- The three looks rendered from front, side, back and a walking pose. Close-ups are review-camera renders in the actual world.
- Both holders entered the carryLow animation. A scripted replay used the existing movement and collision functions to take the sofa through the gate, turn through the passage and place it inside. The pushable seedling crate was cleared first using the existing push action.
- Both players' different hair/outfit/headwear choices and the placed sofa survived save/reload.
- The Player 2 creator uses the imported rig; selection and actual-model thumbnails updated. The last choices were reachable by scrolling.
- Touch movement and carry framing were checked in Chromium mobile emulation at 430 × 932 and 932 × 430.
- The seven edited glTF assets pass Khronos glTF validation with zero errors. Advisory warnings about the inherited parented skinned-mesh layout remain; their parent transforms are identity, and runtime binding was exercised on both characters. The unused old beard node is informational only.

The JSON reports in `review/` contain the check results. The video is a scripted regression replay exported at 10 fps, not a measurement of real-time frame rate. Startup render counts vary with camera visibility: the new build uses more triangles because both players now receive the imported character and rebuilt garments. Draw-call counts alone are not a phone performance result.

## Remaining work

- The face model and body proportions are still the supplied base. This pass does not reach the quality of the earlier AI concept paintings.
- Afro, twists and wig remain the existing generated styles. Office shirt, tracksuit and lounge set remain base-clothing fallbacks. Braids and locs still need further grooming and shoulder-clearance work; this pass does not add hair dynamics or cloth simulation.
- The Ankara print is the project's existing procedural design. It is not a scan of a specified fabric.
- Hand placement uses the existing carry animation, not inverse kinematics or finger contact solving. There is no sitting animation.
- The new entrance furniture is decorative dressing. It does not add new sitting or object-interaction mechanics.
- A physical phone, real controllers, remote lobby synchronization and reconnection were not available for testing here. Validate those in the original hosting environment before treating this as a release build.

## Files and asset origin

`src/visual-v19.js` and `src/visual-v19.css` contain the runtime visual changes, loaded before boot. The seven changed model files live in `assets/wardrobe/`. Other character, environment and prop assets are retained from the uploaded project. No external model pack or image-to-3D service was added. The locally bundled Three.js r128 distribution retains its MIT licence header.

`tools/rebuild_wardrobe.py` and `tools/mesh_surface.py` reproduce the authored meshes and textures using NumPy and Pillow. They preserve the supplied skeleton, slot metadata and print texture. `tools/look-check.cjs` is the reusable Playwright regression harness; `tools/carry-route.json` is its collision-clear route fixture. Install Playwright and its Chromium browser in your development environment, serve the project, then run:

```sh
node tools/look-check.cjs
```

Use `COMPOUND_GAME_URL` if your local server uses a different URL. The harness uses a separate browser profile, writes review captures and JPEG replay frames, and reports failures rather than silently marking a check passed. It does not exercise the remote multiplayer service.

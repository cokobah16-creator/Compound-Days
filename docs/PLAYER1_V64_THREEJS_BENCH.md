# Compound Days V64 — Three.js r128 mobile character render bench

**Status: REVIEW TOOL ADDED. Actual engine render results are NOT yet available in this environment. Keep V55 live.**

## What changed

The V63 scale-bake repair normalized the bad 0.01 Armature root, but its earlier Chromium diagnostic used a custom frustum proxy rather than Three.js. V64 supplies an isolated benchmark that loads **the same Three.js r128 and GLTFLoader files used in Compound Days**, and the same shipped hero `assets/characters/efe.gltf.json`.

- `dist/character-v64-bench.html`: browser-side compare V55 hero vs any locally supplied V63 GLB. Keeps the candidate's exported node scale/rest matrices untouched and keeps default frustum culling enabled. For each case, reads WebGL renderer-info draw calls, triangle submissions and framebuffer coverage via `gl.readPixels`.
- `check/bench-character-v64.cjs`: optional Playwright headless-Chromium runner to collect 60 test cases and save JSON + a screenshot. Serves the real `dist` resources locally, reads GLB from a local file input, and does not upload the GLB or touch production.
- `check/verify-character-v64-harness.cjs`: static smoke check for script syntax, shipped assets, safe culling defaults, viewport/action coverage, and route. Static pass **does not** imply the renderer test passed.
- Optional Vercel route `/character-v64-bench.html` exposes a manual review page; `/` still points to the unchanged live game.

## Exact run procedure

Use a local clone of Compound Days, with Node 22+ and Python if needed, and the previously generated **V63 scale-baked** candidate `Player1_V61_NINE_ACTIONS_BOUND_FIXED.glb` from the V63 user download pack. The 11.8MB binary is **not included in GitHub**.

```bash
node check/verify-character-v64-harness.cjs

# Install a local Playwright dependency and Chromium if not already present.
npm install --no-save playwright
npx playwright install chromium

node check/bench-character-v64.cjs \
  /path/to/Player1_V61_NINE_ACTIONS_BOUND_FIXED.glb \
  artifacts/character-v64
```

Outputs `artifacts/character-v64/character-v64-results.json` with one entry for each measured render and `character-v64-audition.png` screenshot. The script should return nonzero when the candidate disappears or a browser error occurs.

**Manual alternative**: Serve `dist` locally with `python3 -m http.server 8000 --directory dist`, open `http://localhost:8000/character-v64-bench.html`, choose the same V63 GLB, click **Run viewport and animation checks**, then **Download JSON report**.

## Measured cases and pass rule

- **Three viewport sizes**: 390×844 portrait, 844×390 landscape, and 1024×768 desktop.
- **Two camera positions**: full body and face close-up.
- **Five named actions**: Idle, Walk, Carry, Pick, and Wave, at 42% of clip duration (Idle at start).
- **Two GLB assets**: shipped V55 baseline and V63 scale-baked candidate.
- Total **60 measured renders**, three synchronous timing repetitions per case.
- A V63 **zero-triangle or WebGL error** is a release-blocking failure. Absence of triangle-culling failures is only a *standalone-engine culling pass*, not art/game readiness.
- Framebuffer centre pixel differences help flag a model whose submitted triangles are nevertheless not onscreen.
- Read timings as **headless Chromium software renderer comparisons**, not iPhone FPS. Record raw samples; hardware benchmarks must follow.

## Mandatory remaining approvals

1. Same candidate remains visible through the **real creator's zoom camera, outfit changes, head turns and walk/carry/pick interactions**.
2. Face topology and expressive eyelids / mouth, neck seam and braid penetration require artistic repair.
3. V61 garment refit used Meshy-source apparel, **not original authored tee/jeans/sneakers**. Old wardrobe bind matrices are incompatible with the candidate.
4. ~91.7K triangles, GPU texture allocation and mobile draw cost remain a concern. Need real iPhone Safari / Android FPS and memory evidence.
5. Confirm saved characters and co-op rendering remain intact. Continue shipping V55 until these are met.

### Limitations of this work session

The V63 binaries were available locally; their 27 joint hierarchy, nine clips and unit Armature scale were confirmed. However the game source dependencies are only on GitHub, and this container's Chromium network access to the actual site/vendor libraries is blocked. **No new claim of a successful V64 Three.js render has been made.** The branch implements the repeatable test; a separate build/runner with the complete checked-out repository must execute it.

### Ownership and release policy

The V64 PR should remain draft until the JSON report and two phone-sized screen captures are attached. Do not merge the replacement avatar or change `dist/assets/characters/efe.gltf.json` as part of this test.

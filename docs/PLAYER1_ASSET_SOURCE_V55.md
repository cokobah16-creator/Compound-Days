# Player 1 V55 — choosing and delivering an artist-authored face base

## Art-source decision, 2026-11-08
The previous v53 face is built by coordinate deformations and rigid facial add-ons. V54 shipped face **portraits**, not an approved replacement of the game-rigged head. Do **not** try to fix quality by adding more spherical eyes, layered primitive lips or procedural nose tubes.

### Candidate source for a real editable base
- **Primary trial:** [Ara 3D Gen](https://ara3dgen.com/) / [source](https://github.com/olatunde85/3d-gen). Its site describes CC0 MakeHuman source meshes, adjustable morphology and downloadable rigged GLBs; the repository describes MIT-licensed app code. Validate the licence for **every added hair, textile and clothing asset** before shipping, and do not assume generated files automatically match our existing skeleton. This is a candidate source, not selected art.
- **Blender-native alternative:** [MPFB2](https://www.makehumancommunity.org/mpfb/index.html), a MakeHuman-based character generator that can supply an editable human foundation in Blender. Sculpt the stylized face manually after choosing a base; preserve artist control of proportions.
- **Optional image-to-3D services:** can be useful for *concept blocking only* until topology, rigging, expression controls, UVs and licensing are verified. A generated likeness from a concept board is not necessarily production-ready.

## One-character handoff
1. Produce one editable, stylized adult Player 1 head/neck, neutral face, no penetrating skin, believable ears/nose/eyelids/mouth. Include a 3/4 and profile in addition to frontal approval.
2. Include four named expression targets, ideally `blinkLeft`, `blinkRight`, `smile`, `concerned`. Keep the neutral upper lids resting naturally on the irises. Avoid constantly wide-open eyes.
3. Make headwear from sculpted fabric loops/folds, not two erect cylindrical horns. Support a no-headwear hairline variant.
4. Export `Player1_Head.glb` with embedded materials in **metres**. Keep a `.blend` source. For current stage, do not automatically swap the hero GLTF; first inspect geometry and visual evidence.
5. Render the candidate in Blender from the same standard four views, then export a rigged test hero keeping the 27 bone contract. Integration may require a new, carefully weighted head mesh or full-body replacement; do not simply parent a separate sculpt over a visible existing face.
6. Capture two **real live browser** mobile screenshots, in creator and walking in the shared world, from the intended phone viewport. A Blender screenshot or generated mockup does not count.

## Blender review command
```bash
blender -b -t 2 --python tools/player1_turnaround_v55.py -- \
  --candidate /path/to/Player1_Head.glb \
  --out /tmp/compound-days-player1-v55 \
  --samples 48 --resolution 1024
```

This generates `player1-front.png`, `player1-three-quarter.png`, `player1-profile.png`, `player1-back.png`, `player1-smile.png`, `player1-concerned.png`, `player1-blink.png` and `player1-review.json`. Images are Blender studio renders, **not in-game evidence**. Compare photos with the approved concept and mark artistic approval explicitly.

## Current implementation status
- **Complete:** headwrap horn geometry correction (temporary), geometry regression gate and Blender review tool committed to a draft PR.
- **Not complete:** suitable artist-authored GLB, source .blend, adaptation to existing rig, expression animation and mobile captures.
- **No deploy:** master unchanged until verified.

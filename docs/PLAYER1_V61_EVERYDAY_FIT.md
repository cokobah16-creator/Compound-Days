# V61: first separately skinned Everyday outfit, with real motion testing

**Status: offline R&D deliverable. Do not replace the live character.**

On 9 November 2026, the user-supplied V60 Meshy Player1 GLB was split into character skin, hair, fitted shirt, jeans and sneakers, keeping the existing Meshy 27-name *bridge* skeleton. To retain the underarm shirt correction, the shirt uses two independently fitted primitives (the normal shirt and the existing 145-triangle side repair). The outfit retains the same skin weights, inverse bind data and all nine clips.

### Actual offline assets (downloadable separately in chat V61 pack, NOT uploaded as GitHub binary)

- `Player1_V61_BODY_BASE.glb`: skin and hair with a temporary under-garment shrinkwrapped surface. **Temporary underbody is not proper human anatomy.**
- `CompoundDays_V61_EVERYDAY_OUTFIT.glb`: independent cream tee, jeans, shoes GLB.
- `CompoundDays_V61_EVERYDAY_BLUE_TEE.glb`: same outfit with a Compound Days-friendly muted blue shirt.
- `Player1_V61_BLUE_FITTING_PREVIEW.glb`: combined 7-primitive visualization, sharing the exact new body/garment skeleton and inverse bind.
- `*_MOBILE.glb`: lower-resolution embedded textures (geometry unchanged).
- `OPEN_V61_WARDROBE_REVIEW.html`: local 3D animation and garment-slot controls.
- `tools/build_v61.py`, `tools/export_wardrobe_v61.py`, `tools/build_preview.py`, `tools/mobile_pack.py`, `tools/validate_v61.py`: deterministic offline builders and rig-fit checks; require local original V60 GLB, NumPy, SciPy, Pillow and VTK for render tool.

### What is genuinely verified

1. The V61 **cream-coloured** segmented model and original V60 model rendered **pixel-identically** under the same VTK camera, lights and skeletal pose in Idle, Walk, Carry and Pick (zero MAE in those four stills).
2. Separate body and Everyday garment have equal names/order of all 27 bridge joints, byte-identical inverse bind matrices and identical nine animation data streams.
3. Numerically deformed garment vertices from independently exported outfit versus merged preview are equal to float precision in **Idle, Walk, Carry, WalkCarry and Pick**. The shrinkwrapped underbody stays at least **11.77 mm** behind the clothes in sampled poses. Note that this does not prove absence of all collisions.
4. At the sampled times the feet do not sink below the ground; the new garment export hasn't altered skeleton or action samples.
5. Six material primitives on the split model: skin, hair, top, bottom, shoe and the shirt underarm patch (second top); total **91,654 triangles** before the additional provisional underbody surface.
6. Texture-reduced GLBs keep equal vertex positions, skin weights, indices, morph deltas and animation numbers; these are **not decimated mobile LODs**.

### Critical limits / no false claims

- This new fitted outfit recreates Compound Days' **Everyday tee/jeans/sneakers category using Meshy's existing clothes**. It **does not include or retarget the original authored** `dist/assets/wardrobe/tee.gltf.json`, `jeans.gltf.json` or `sneakers.gltf.json` vertices. The old wardrobe was made for a different bind pose.
- The body underneath is a **clothing-derived shrinkwrapped blockout**; not accurate anatomy, not a sculpt, and not safe for arbitrary clothing changes.
- The wearer still has incomplete facial morphs and hair topology, a ~92K triangle character plus underlayer, no actual in-game item carry/pickup logic, and no mobile Safari FPS measurements.
- There is no Blender `.blend` or actual game creator screenshot from this pass. Render evidence is from an independent VTK skinning pipeline.
- Original game wardrobe and existing network saves must not be changed by a preview.

### How to test

On a development machine, unzip the V61 pack and serve its root:
```
python3 -m http.server 8000
```
Then open `http://localhost:8000/OPEN_V61_WARDROBE_REVIEW.html`. Click Idle, Walk, Carry, Pick and the separate clothing visibility switches.

On a repo checkout:
```bash
node check/verify-v61-pair.cjs path/to/Player1_V61_BODY_BASE.glb path/to/CompoundDays_V61_EVERYDAY_BLUE_TEE.glb
```
This checks **the V61 pair**, not the original wardrobe. Run the full character/wardrobe checks again only after an *artist-retargeted original* garment is produced.

# Player 1 character art — V55 review brief (not yet approved)

## Current state and purpose
The master branch's V54 shipped face-revision **UI portraits** and a repaired procedural head lighting pass; it **did not replace the playable rig with the commissioned, polished Player 1 head**. The v53 facial geometry is still built by `tools/faces_from_blender.py`. This V55 review branch starts by removing the most conspicuous two headwrap protrusions. It does not claim the head is approved, nor change the existing 27-joint rig or animations.

## Design target
Player 1 is a warm, expressive adult Nigerian woman wearing a folded orange patterned headwrap, small gold hoops, an off-white tee, gently shaped light-blue overalls and cream sneakers. Stylistic target: polished stylized realism, not a photoreal face and not toy-like spherical eyes. Artwork in the conversation is a **concept image only**, not a game capture or playable model.

**Design language:** gentle planar cheek transitions; almond-shaped eyes with visible upper/lower eyelid volume, soft brow asymmetry; considered nose bridge, tip and nostrils; integrated, relaxed full lips; clear chin and jaw contour; realistic ear positioning; skin colour variation without heavy shine; rounded, age-appropriate adult silhouette; textured cloth fold volumes with believable gravity. Avoid distinct spherical eyeballs protruding from the socket, small stuck-on lips, rigid smile or over-detailed skin that does not read on a phone.

## Artist asset workflow (mandatory)
1. Select or sculpt **one** clean artist-authored head/neck mesh. Record provenance and redistributable licence in `docs/PROVENANCE.md`. Do not build the face from separate primitive tubes and spheres or claim an AI concept sheet is a 3D asset.
2. Match the existing Y-up, +Z-forward hero and **27-bone** hierarchy in `CHARACTER.md`. Preserve body/wardrobe binding and material naming. Blend head to neck without a visible seam. Preserve the existing clips while iterating.
3. Author expressions as consistent meshes / Blender shape keys: `blinkLeft`, `blinkRight`, `smile`, `concerned`. Bake/export to test glTF with visible morph-target names (or document an equivalent facial rig before switching the runtime). No idle animation should hold a startled look.
4. Wrap: model real folded cloth with a sensible knot and tuck. The v55 branch compresses the two existing horn components to short lobes as a **temporary** geometry correction. Artist should refine and replace that knot rather than enlarging it. Confirm at front, 3/4, profile, rear, and with head turns.
5. Dress, rig and export one Player 1 GLB/glTF only; run all existing authored/wardrobe compatibility tests. Recheck skin space, colour management, blink deformation, joint parenting and phone LOD. No NPC rollout yet.

## Acceptance evidence: five captures from the **actual render**
All captures must display **the same** rigged candidate:
- `player1-front.png`: relaxed neutral face at head/shoulder crop, with eyes looking forward.
- `player1-three-quarter.png`: skin, eyes, nose, hairline and lips at 3/4 angle.
- `player1-profile.png`: no balloon forehead, floating lips, flat face or detached knot.
- `player1-creator-mobile.png`: actual iPhone portrait creator view, not an illustration.
- `player1-world-mobile.png`: actual gameplay camera in the shared compound, one neutral and one walking frame.

Optional `player1-expressions.png` covers neutral, smile, concerned, blink. Do not substitute image-generation concepts or studio portraits for in-engine proof. Validate at both 360- and 700-CSS-pixel viewport widths where practical.

### Stop/go quality gates
- No protruding antennae, detached face pieces, obvious head/neck seams or hair penetration.
- Upper lid shapes the iris; little/no white visible above the iris in neutral pose. Eyes rotate without leaving the socket.
- Mouth, nasolabial and nose profiles read naturally from the side. Expression morphs do not create slivers or visible mesh separation.
- Shoulders, wrists, elbows and fingers look plausible through an idle, walk, carry, wave, and pick cycle; no garment/body intersections.
- Gameplay remains responsive on a mid-range smartphone. Measure, don't assume, draw calls, triangles and asset transfer size.
- Existing `check/verify-authored.cjs`, `check/verify-v33.cjs`, `check/verify-faces-v53.cjs`, and wardrobe checks must remain passing (or changes must be explicitly justified and migrated).
- Art review approval precedes replacing `dist/assets/characters/efe.gltf.json` on master.

## V55 prototype done in this branch
`dist/assets/wardrobe/headwrap_everyday.gltf.json`: shortened two separate horn-shaped knot lobes by repositioning 270 vertices. Vertex count, topology, UVs, node names and original material remain stable; adjusted normals and POSITION bounds. Run `node check/verify-v55-headwrap.cjs`.

**Status:** headwrap topology-only fix ready for visual review; artist-authored face and actual mobile screenshots are **not yet delivered**. No claim that this iteration satisfies the final art acceptance criteria.

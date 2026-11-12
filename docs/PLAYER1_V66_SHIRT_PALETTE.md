# V66 Player 1 shirt-colour customization (review only)

The November 2026 mobile captures showed the V61 replacement body now looks more human than the old procedural face, but the Hair/Body/Clothes menu still did not affect that GLB. This milestone makes **one honest, visible, mobile-friendly customization** while preserving the existing saved look and network protocol.

## Implemented

- Six shirt choices in Player 1's Clothes tab: Sky (original blue), Cream, Coral, Forest, Indigo and Lilac.
- The 3D figure's `top` mesh receives a shader that replaces its baked blue color using the luminance of the existing albedo texture, preserving cloth folds. The tiny untextured shirt repair patch uses the same selected color.
- The original Sky/default choice leaves the shipped model's material untouched and does not pay for a shader variant.
- Selection stored on `S.p[0].colors.shirt66`; `colors` is already included in the game's `setchar` network payload and ordinary local saved state. It does not add a save field at top level.
- Player 2, NPCs, hair, denim, shoes and skin keep the current mesh/materials.
- Old classic hero fallback `?hero=v55` remains available. Original game wardrobe pieces **have not** been re-bound to the new body, and selecting another outfit silhouette remains portrait-only.

## Source and runtime

- `dist/src/shirt-v66.js`: wraps `hero61Dress` after the V61 source material reset; inserts buttons into the existing Outfit field and uses `ACTIONS.shirt66set`.
- `dist/src/shirt-v66.css`: six accessible touch-size swatches, active button and focus ring.
- `dist/index.html`: loads the new JS after home-v65 and the stylesheet after the existing portrait styles.
- `check/verify-shirt-v66.cjs`: syntax and isolated material/state checks.
- `check/bench-shirt-v66.cjs`: real Three.js 390x844 headless Chromium capture of actual original/Coral render; checks state persistence and that Player 2 gets no palette.
- `.github/workflows/shirt-v66.yml`: runs checks on pull request and uploads artifact screenshots.

## Explicit quality gates

1. Static check passes.
2. Browser smoke: picker truly tappable after scrolling the Clothes tab; selecting Coral visibly changes the canvas pixels and only the `top` mesh; 3D preview status and saved color agree. Keep screenshots.
3. When saved/moved in, look is carried to the world; reloading a local save shows same colour. Test a network lobby if possible.
4. Build stamp and `PACKAGE_MANIFEST.json` regenerated per `CONTRIBUTING.md`; full original game harness and actual iPhone Safari check.
5. Only after tests are green should the PR be merged into `master`.

This is not a facial retopology, full outfit swap, or new hair system. The next wardrobe milestone is a properly skinned second garment on the V61/V63 compatible bind pose, with hidden-under-clothes geometry and mobile LOD checks.

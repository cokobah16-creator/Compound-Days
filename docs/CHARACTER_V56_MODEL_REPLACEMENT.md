# Compound Days — V56 replacement-character art gate

**Status:** Reference/evaluation tooling only. No new replacement character yet. Do **not** mark this as finished character work or publish concept artwork as if it were a 3D deliverable.

## Why this is not another face patch

The V55 anatomical MakeHuman-derived head and wardrobe source passed technical tests, but the actual iPhone creator screenshots exposed a stiff stare, attached-looking lips, helmet/string hair, shoulder seams, and clothing penetration. These are fundamental design/rigging shortcomings. Further high-frequency procedural eye/nose/lip adjustments cannot be the production plan.

The next candidate should start with a licensed artist-quality *continuous sculpt* and use the existing 27-joint rig as a migration **target**, not an art constraint. The character artist must be free to choose a better skeleton, then retarget animations and clothing together if the quality difference justifies it. Do not force 27 bones on the new artist base if it would damage the model.

## Source option selected for an offline modeling pass

**First choice: Blender Studio Human Base Meshes v1.4.1 (CC0, 49 MB, requires Blender 4.2+)**

- Official download: https://mirror.blender.org/demo/asset-bundles/human-base-meshes/human-base-meshes-bundle-v1.4.1.zip
- Original landing page and license: https://www.blender.org/download/demo-files/
- Official release notes: https://developer.blender.org/docs/release_notes/4.0/asset_bundles/
- Contains stylized female and stylized head starting meshes; sculpt and fit explicitly to the Nigerian woman concept. These are unrigged art bases, **not** a completed textured, rigged character.

**Alternative for animation prototyping, not target portrait quality:**
- Quaternius Universal Base Characters: https://quaternius.com/packs/universalbasecharacters.html (inspect the pack's CC0 license, included rigs and hairstyles before use).

## Next deliverable and art sign-off

Deliver **one candidate**, never a six-NPC batch:
1. `source/Player1_v56.blend` with a true sculpted head/body, a small gold hoop, neat natural hairline, carefully shaped braids or wrapped fabric, and one sensible white-T + blue jeans outfit.
2. `source/Player1_v56.glb` with embedded textures. Model neutral pose and real proportions. Avoid primitive sphere eyes and glued lips.
3. `source/Player1_v56_LICENSE.txt`: source licenses and any texture/hair third-party credits; verify every component.
4. Face controls: neutral, left/right blink, smile, concerned. Inspect shape-key topology and eyelid closure.
5. Capture **real** front, three-quarter and profile Blender renders; include light material and neutral-background render.
6. Use `dist/character-audition.html` (serve `dist` over HTTP; not the public live game) to compare current V55 versus the candidate at equal viewport size; record triangle count, bone count, expression targets and clip behavior.
7. After approval, implement rig + wardrobe retargeting as a **separate** commit, using actual mobile creator and gameplay captures plus performance measurements. Do not deploy only a still.

## Visual gates (blocking)
- Age-appropriate adult proportions, naturally integrated eyelids, nose, mouth and ears. Neutral expression **does not** look alarmed or cross-eyed.
- Face looks good from **profile and three-quarter**, not only frontal selfie.
- Headwrap has fabric folds and gravity; no jutting horns. Braids are rooted, tied/weighted and not cylindrical string tangles.
- The neck and clavicle transition has no visible seam. Shoulders, arm sockets, wrists, hips and hands deform naturally.
- Clothing shells fit the new body, without transparent shoulder gaps or rigid crotch bulges.
- In-game FPS, transfer size and draw calls remain within an explicitly measured mobile budget.

## Audition lab instructions

On a development machine, within the checked-out branch:

```bash
python3 -m http.server 8000 --directory dist
# open http://localhost:8000/character-audition.html
```

The page loads the current built-in V55 hero as a read-only baseline; use **Choose candidate GLB** to load the new file from disk. All candidate data remains on the device. Select front, 3/4, profile, face close-up, expressions, idle/walk and use **Save comparison PNG** to record what was evaluated.

The audition page is a **studio comparison**, not an in-world visual QA. Loading a GLB for preview does not establish skeleton/wardrobe compatibility.

### Final decisions
- Keep current playable V55 model for existing saves until a candidate actually passes.
- Reject another round of procedural face decoration.
- Source a clean licensed sculpted base instead of generating random first-pass faces.
- No direct user data upload or paid third-party service should be required for the audition page.
- Automated tests cannot decide attractiveness. Require an explicit human art review.

## Development prerequisites

Changing `dist` requires re-stamping the build, regenerating `PACKAGE_MANIFEST.json` and running the repository harness and browser smoke tests according to `CONTRIBUTING.md`. Those are not yet complete for this draft branch. Do not merge until they have been run and the preview passes browser checks.

# V68 — Player 1 living idle (review candidate)

## What this solves

The V67 release made Player 1's rest pose less stiff by lowering the arms. It still reads like a still photograph because the imported V61 `Idle` clip is only 0.03 s, and the figure has no animated facial morphs or fingers.

This milestone adds **restrained animation only on the existing V61 character**:
- 4.6-second torso breathing cycle (up to ~0.8 degrees);
- a tiny nonrepeating-looking nod/yaw motion;
- a relaxed, asymmetric wrist angle (approximately 2.5 degrees);
- a short ease-in from the original idle (0.46 s);
- no added draw calls, new glTF, new textures, new save fields, facial geometry changes or outfit changes.

The V61 rig has 27 joints and **no finger joints or facial morph targets**. These wrist movements are not independent finger animation and cannot replace hand retopology.

## Safety and compatibility

- The animation correction is applied after V67's pose and Three.js AnimationMixer only while Player 1's new V61 rig is in Idle.
- Walk, Carry, CarryLow, Pick, Wave, Player 2, NPCs and the V55 fallback never intentionally receive V68 transformations.
- `playPick` does not change `g.current` away from Idle; V68 therefore guards against active Pick/Wave actions, including in V67's existing idle pose guard, to avoid overriding a cinematic gesture.
- Debug A/B switch: `?life=off` disables V68 without resetting wardrobe or skin.
- The V66 shirt-colour system remains untouched.

## Files

- `dist/src/living-idle-v68.js` — the animation correction.
- `dist/index.html` — load after V67.
- `check/bench-living-idle-v68.cjs` — actual V61 Three.js r128 headless mobile render: before and after PNG, measured changes, isolation for actions/Player 2, browser console errors.
- `.github/workflows/living-idle-v68.yml` — runs the contract tests and comparison and uploads evidence.

## Do not merge until

1. The mobile render check is green, with positive but limited angular movement.
2. A person inspects front/side and close-up preview for unintended neck seams and hand clipping.
3. Run V61, V66, wardrobe and core game regression tests; regenerate build stamp and package manifest.
4. Verify on Safari/iPhone and Android at real interaction speeds (headless software Chromium is not a device test).

**No replacement mesh is created.** Live character remains unchanged until a reviewed merge.

## Browser regression diagnosis

The first V68 screenshot failed review: the head pitched dramatically and the wrists curled unnaturally. Root cause: the V61 imported Idle clip does not necessarily rewrite every joint each frame, so simple procedural quaternion increments accumulated without bound. The corrected implementation **restores last frame's saved original local joint quaternions before the AnimationMixer and V67 run**, then snapshots their new output before adding the small offsets for this frame. The `check/bench-living-idle-v68.cjs` regression test tests a continuous 15-second idle and checks return to the V67 baseline when disabled.

The corrected 95-frame Chromium capture and angle comparison passed in [run #43186334174](https://github.com/cokobah16-creator/Compound-Days/actions/runs/43186334174). Changes measured at its capture: torso 0.666°, head 1.382°, wrists 3.075°/2.692° relative to the V67 pose. These are single-frame angles, not a quantified animation quality score. The endurance check is a separate additional gate before release.

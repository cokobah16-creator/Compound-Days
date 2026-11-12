# V67 — Relaxed idle for the new Player 1

Review date: 12 November 2026. Source: `dist/src/pose-v67.js`.

## Why

On the mobile creator, Player 1's V61 model stands with both arms angled outward; the shape is much better than the old procedural model, but the pose still looks like an inspection or 3D scan. This pass modifies **only idle**.

## How

- Execute after the existing Three.js `AnimationMixer` updates.
- Use `LeftArm → LeftForeArm` and `RightArm → RightForeArm` to calculate the actual skinned upper-arm directions.
- Aim those toward an almost vertical vector in figure space, including small natural elbow bias. No assumptions about Blender's local bone rotation axes.
- Blend toward the adjustment over 0.30 seconds; skip when walking, carrying or a wave action is active.
- Restrict to `g.hero.v61` + `g.userData.hero61`. The classic hero, companion and NPCs retain their earlier clips.
- Debug comparison: `?pose=classic` disables it, while the module is installed on the review branch.

## Automated result

GitHub Actions: https://github.com/cokobah16-creator/Compound-Days/actions/runs/43182190958

The Three.js r128 mobile-width (390×844 browser) render bench passed, producing real WebGL screenshots in artifact `compound-days-v67-relaxed-idle`.

| Metric | Original V61 | Candidate V67 |
| --- | ---: | ---: |
| Left upper-arm angle away from vertical | 26.57° | 10.76° |
| Right upper-arm angle away from vertical | 28.07° | 10.76° |
| Distance between hands, figure-local | 0.869 m | 0.481 m |
| Average idle update cost in headless harness | 0.07 ms | 0.132 ms |

Costs are from a software-rendered browser harness, not a real phone benchmark. The CI also confirmed the pose pass does not run for walk/carry/classic states and reported zero page errors. The before-and-after PNGs were reviewed: arms are meaningfully relaxed; no obvious catastrophic skinning artifacts; shirt seam and stiff fingers remain.

## Before live deployment

1. Keep pull request draft until one iPhone Safari creator test confirms the stage looks good, the animation loops smoothly and frame rate is acceptable.
2. Smoke-test walk, carry, pick, bend, wave and simultaneous two-player play; V67 has not reweighted or authored any of those clips.
3. Reconcile the stale build/manifest introduced by V66: run `python3 tools/stamp-build.py`, then `python3 tools/package-manifest.py` after final source changes, and re-run repository verification.
4. Do not advertise new hairstyle or garment meshes as supported; only V66 shirt *colour* and V67 idle pose are changed.

## Next character work

The hands and wrists still look somewhat rigid, and the V61 tee retains small black marks near the side and upper arm. These are asset-level issues. Repair them in Blender from the V61 source with clean topology and exported skinned mesh, instead of adding extra geometry from procedural code. Next actual creator milestone should be fitting one separate outfit to V61's bind matrices, hiding covered under-body sections, and testing walk/carry/bend.

## Final multi-angle review (12 November 2026)

[GitHub Actions #43183381538](https://github.com/cokobah16-creator/Compound-Days/actions/runs/43183381538) passed both the V67 mobile render and the legacy V61/wardrobe regressions. Its `compound-days-v67-relaxed-idle` artifact contains original idle, relaxed front, three-quarter, profile, back and walking PNGs plus the machine-readable measurements.

Human inspection of the six-view sheet found that the new arms sit naturally closer to the torso in front, three-quarter, profile and back views. The existing Walk animation remains active and shows a different bent-leg frame, not the pose override. Small shirt-side artifacts and stiff hands remain; those are not solved by this change.

The workflow's second job also prepared the deterministic build stamp and package-manifest files as an artifact, without committing them to `master`. Release remains gated on updating those checked files and completing an iPhone Safari check.

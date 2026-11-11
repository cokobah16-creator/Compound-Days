# Player 1 V60 — six new cooperative action clips (9 November 2026)

**Review only. No replacement of the shipped hero or mobile deployment.** The binary assets and animated-preview files are in the chat's `Compound_Days_Player1_V60_Full_Animation_Pack.zip` and `Compound_Days_Player1_V60_Mobile_Review.zip`, not the GitHub repository.

## Implemented and actually exported in GLB

Retained the V59 cleaned Meshy Player 1 (same base geometry, 27 named bridge joints, five provisional face morphs, inverse bind matrices, shirt material patches). The authoring script appended six clips and **did not alter** the original three:

| Name | Motion | Duration | Notes |
| --- | --- | ---: | --- |
| Idle | Original idle | source clip | Preserved |
| Walk | Original walk | source clip | Preserved |
| Run | Original run | source clip | Preserved |
| Carry | Two-handed raised holding stance | 2.2s | Static holding pose; no parcel attached |
| CarryLow | Lower hands for a shopping bag | 2.2s | Static holding pose; no bag attached |
| WalkCarry | Walk cycle + high holding posture | 1.033s | Leg motion preserved; arms constrained |
| WalkCarryLow | Walk cycle + low carrying posture | 1.033s | Leg motion preserved; arms constrained |
| Pick | Forward bend and reach toward low counter | 2.5s | **Not** a full floor pickup/prop grab |
| Wave | Right arm raised and waving | 2.0s | One hand only, no dialogue sync |

Carry arm IK hand targets resolved within 3.2 cm. The first Pick version pushed toes about 8 cm below floor; **rejected**. The retained forward-reaching bend keeps sampled feet at y≈0 m.

## Exact model verification

- Source: `Player1_V59_CLEAN_MASTER.glb` from previous user-provided V59 pack.
- Master SHA256: `7cff089e4f7f9a9b7436254c63f070b588bd8efc14b214873387b416a12eb88e`
- Mobile test SHA256: `831b6f431478ffd070f5a96f2388d91fa2a61b86ae58fc90dc6aca2c8678d8f9`
- 9 clips (3 original + 6 new) and 27 named joints.
- VTK GLB import succeeded. **45 independent CPU-skinned clip-frame samples** checked for finite coordinates, plausible height, and floor bounds.
- V59 source-vs-V60 vertex positions, UVs, normals, skin weights, inverse bind matrices and morph deltas are byte-identical; the original three clip samples are unchanged.
- Full and mobile GLBs have numerically identical nine animation samplers and skinned vertices.
- Actual offline VTK renders supplied: `ACTION_SHEET_1.jpg`, `ACTION_SHEET_2.jpg`, plus Wave/Pick GIF and MP4 previews.
- The compact GLB reduces texture bytes, **not** the approximately 91,654 triangles.
- The authoring script and reproducible numerical validator are in the full ZIP, with a copy of `glb_pose_utils.py`. The previous V59 source model must be supplied to rebuild; it is not duplicated in this ZIP.

## Actual game compatibility: BLOCKED

The existing `CHARACTER.md` contract requires *not only* matching 27 joint names but the same inverse bind pose as wardrobe garments and material slots named `skin`, `top`, `bottom`, `shoe`, `sole`. The Meshy model is a merged clothing/body mesh using compensated 0.01 root scale and inverse bind values around 100. Old tee/overalls remain **incompatible**.

Remaining work: split garments and face/hair, rebind/retarget wardrobe to the candidate skeleton, replace face with proper eyelid/mouth/neck topology, optimize geometry for mobile, attach parcel/bag props to hands, and run actual mobile creator/world/co-op checks. The Pick action is only a reach toward a low surface and needs gameplay item interaction logic.

## Safe manual test

Unzip the mobile package; serve the folder over HTTP, then open `OPEN_V60_ACTION_REVIEW.html` to switch among all nine clips (a model-viewer component loads from CDN). Alternatively inspect bundled JPGs and MP4 previews offline.

To reject accidentally premature integration, run:

```bash
node check/verify-v60-actions.cjs path/to/Player1_V60_GAME_ACTIONS_MASTER.glb
```

The checker should report the nine clips and then **fail closed** on wardrobe bind and material-slot issues. Do not mark red as a broken action clip—it's an intentional live-deployment hold.

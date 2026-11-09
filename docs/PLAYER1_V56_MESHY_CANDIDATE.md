# Player 1 V56 — Meshy candidate inspection (9 Nov 2026)

## Status
**In the game from build v56 as Player 1's default model (the owner's decision, 9 Nov 2026).** See README “v56 — Player 1 V56” for what was repaired (shirt patches, mobile mesh, clips, skeleton) and what is still open below (face detail, separate hair and clothing meshes, expression shape keys).

Owner uploaded actual full-resolution Meshy 7.1 source files: an unrigged model, rigged character, walking GLB and running GLB. A combined production experiment is stored in the *conversation asset pack*, not this GitHub repository (the available GitHub connector cannot upload binary GLBs). Upload it to a review-only asset route before any live test.

### Exact generated assets (external source links, may expire)
- Base model: https://v3b.fal.media/files/b/0ab1b71f/ONn1Pxgl113JY6y6ayw2E_model.glb
- Rigged model: https://v3b.fal.media/files/b/0ab1b725/Fw1OkwajyvdwJ9V_xs0cH_rigged_character.glb
- Walk clip: https://v3b.fal.media/files/b/0ab1b725/VXgSnI2KhuRPT67BhmuPY_walking.glb
- Run clip: https://v3b.fal.media/files/b/0ab1b726/RwtnCfmE7Va_-Z24476-t_running.glb

### Derived prototypes (in the downloadable V56 pack)
| Name | Byte size | SHA-256 |
| --- | ---: | --- |
| `Player1_ALL_ANIMATIONS_MASTER.glb` | 12,831,036 | `cf83bb57e41b15ea0962e9388ea2fd35f05379a3eb00cb8af594332a282e6fe0` |
| `Player1_ALL_ANIMATIONS_MOBILE.glb` | 5,798,076 | `a5ae0b713fcfc0c487d53513ee9fef30d73d9c34acba915e779210de46926c83` |

The smaller file downsamples all three embedded textures to 1024 px and converts them to JPEG. Vertex/index data, joint weights and *all animation sampler bytes* remain identical to the original uploaded files (validated offline by `tools/validate_pack.py` in the downloadable pack). It is **not a true mesh LOD**.

### Actual mesh measurements
- **91,654 triangles**, **64,445 skinned vertices**
- **24 joints** from Meshy, versus the project's **27-joint** authored hero
- **0 facial morph targets**; no eyelid blink, smile or concerned control
- One mesh and one material with three embedded textures
- Idle 72 animation channels (single frame); Walk 66; Run 66
- VTK parser successfully loaded both combined GLBs with three named clips: `Idle`, `Walk`, `Run`
- CPU skeletal-skinning previews confirm expected 1.7 m figure and pose changes over walk/run; these are not live game screenshots

### Important scale pitfall
The rigged file has an Armature root scale of 0.01 and inverse-bind matrices around 100, which **compensate** during skinning. Generic static bounds measured before skinning report an erroneous ~0.017 m tall mesh, even though CPU-skinned animated frames are ~1.7 m. **Do not multiply the rigged root by 100 in game**. The V56 audition page now samples deformed bone coordinates rather than treating its static bbox as actual size.

### Visual inspection failures
- Facial geometry is more anatomically believable but still has visible surface/texture artifacts; eyelids/lips need manual sculpt.
- Braids are too chunky/stringy; root attachment and fringe must be reworked as separate hair geometry.
- Dark brown triangular patches appear through the shirt at the torso side; repair UV/mesh penetration before approval.
- No gameplay-usable outfit or hairstyle exchange system on this candidate. Clothing is merged with the body.
- Heavy triangle count; profile iPhone performance before setting budgets.

## Test setup
Use the unmerged V56 audition page (served from `dist`); **choose candidate GLB** and select `Idle`, `Walk`, or `Run`. The standalone source pack also has `OPEN_PLAYER1_REVIEW.html`, real 3D renders and GIF/MP4 skeletal frames.

## Gates for any merge
1. Visual art approval at front/3/4/profile, including side shirt artifact and braided hairstyle.
2. Separate clothing and hair meshes, expression targets and proper eye animation.
3. Rig retargeting / animation compatibility: current Meshy 24 bones must be mapped explicitly to 27-bone hero or new animation system with safe save migration.
4. A proper low-poly mobile LOD, draw call/texture inspection, and normal map fidelity check.
5. Live mobile creator, walk, carry and world screenshots with real collision/animation QA.
6. Confirm licences/rights and provenance of generated character and used source artwork.

**The branch and game home page remain unchanged aside from the review tooling.**

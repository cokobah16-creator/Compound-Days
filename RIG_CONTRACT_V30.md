# Compound Days — v30 integration contract

This is an amendment to the supplied v29 rig. The body asset, 27-joint hierarchy, inverse bind matrices, nine animation clips, six body/face morph targets and metre/Y-up/+Z-forward convention remain unchanged.

## Shape and garment binding

Runtime customization evaluates the v29 morph targets into a shared position buffer per shape. Normal vectors are recomputed across all ten body region primitives together. Unmodified UV, colour and skin attributes are shared; each garment/body mask owns its own index buffer.

New starter meshes carry `_BODY_IDS` and `_BODY_WEIGHTS`, each a VEC3 attribute. The IDs reference three vertices of the neutral body buffer. Weights sum to one. The runtime applies the weighted body morph displacement to the garment vertex. These attributes are consumed on the CPU and do not require a custom vertex shader.

Tank cut-edge vertices retain barycentric coordinates on source triangles. Shorts use three nearby body samples to transfer shape changes to their independently tailored surface. Sneakers also use three nearby foot-surface samples.

Garment skeletal weights are distinct from shape-transfer weights. The tank uses Hips/Spine/Spine1/Spine2/Shoulder channels; shorts use Hips and the upper leg chains. This prevents the inherited nearest-segment body weights from dragging the waistband with the forearms. All skeletal weights are normalized, with at most four influences.

## Coverage

The tank and shorts root `extras.hiddenBodyTriangles` contains original body index triples. The runtime removes those triangles only when the corresponding garment is equipped. A narrow overlap remains at the garment boundary. The exposed neck, chest, shoulders and lower legs are retained.

The legacy `covers` threshold remains 0.94 for coarse coverage, principally the shoes. It is not the fitting system for the new tank or shorts. The inherited 0.72 description must not be used for this build.

## Seating

The runtime finds the rendered sofa furniture group and its `sofa_teal` instance. Seat points are expressed in that asset's local coordinates and transformed by its complete world matrix. The fallback built-in sofa has a separate cushion-height definition.

After the sitting clip is evaluated, the pelvis is placed above the cushion. Two-bone IK places the ankles at calibrated floor targets and the wrists over the thighs. Foot rotations follow sofa orientation. These corrections are applied only while the sofa interaction is open.

Standing transforms are restored on exit and used when saving during the interaction. A remote player's transform is not changed by another player's local seated interaction.

## Head and hair

Hair remains static in Head space. The three rebuilt starter styles are authored against the measured delivered skull, including the surface-net expansion beyond the original parameter ellipsoid.

Iris/pupil meshes store eye-centre translations on their nodes; sclera vertices are already in Head coordinates. Shading and eye-side detection account for that distinction. The neutral mouth surface is generated per body/face shape by projecting onto the morphed head mesh. It does not add speech or expression blendshapes.

## Verification boundary

See `check/results-v30.json` and `README.md`. Software geometry inspection and numeric checks support this integration contract. They do not substitute for a GPU gameplay review or a target-phone frame-time measurement.

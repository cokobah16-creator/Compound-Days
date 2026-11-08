"""Import one external Player 1 head GLB into Blender and write a .blend working copy.
Does NOT invent artist quality, missing shape keys, or game-rig compatibility.

Usage:
 blender -b --python tools/import_and_audit_v55.py -- --candidate /path/to/Player1_Head.glb --out ./review
"""
import bpy
import sys
import json
import argparse
from pathlib import Path

def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--candidate", required=True)
    p.add_argument("--out", required=True)
    args = p.parse_args(argv)
    src = Path(args.candidate).expanduser().resolve()
    dst = Path(args.out).resolve()
    if not src.exists():
        raise SystemExit("Missing candidate GLB: " + str(src))
    dst.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(src))
    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    arms = [obj for obj in bpy.data.objects if obj.type == "ARMATURE"]
    if not meshes:
        raise SystemExit("No mesh found in candidate")
    shapes = {o.name: [k.name for k in o.data.shape_keys.key_blocks]
              for o in meshes if o.data.shape_keys}
    found = {k for values in shapes.values() for k in values}
    required = ("blinkLeft", "blinkRight", "smile", "concerned")
    triangles = sum(sum(max(0, len(p.vertices) - 2) for p in o.data.polygons)
                    for o in meshes)
    report = {
        "source": str(src),
        "status": "REVIEW_REQUIRED",
        "meshes": [o.name for o in meshes],
        "armatures": {o.name: [b.name for b in o.data.bones] for o in arms},
        "triangle_count": triangles,
        "shape_keys": shapes,
        "missing_required_shape_keys": [k for k in required if k not in found],
        "game_rig_compatible": "NOT CHECKED",
        "note": "An imported .blend is an editable working copy, not proof of an artist-approved or game-compatible head."
    }
    bpy.ops.wm.save_as_mainfile(filepath=str(dst / "Player1_Head_Working.blend"))
    (dst / "head_geometry_audit.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"blend": str(dst / "Player1_Head_Working.blend"),
                      "audit": str(dst / "head_geometry_audit.json")}, indent=2))

if __name__ == "__main__":
    main()

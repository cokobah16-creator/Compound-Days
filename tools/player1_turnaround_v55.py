#!/usr/bin/env python3
"""Compound Days Player 1 face turnaround and acceptance evidence generator.

Run in Blender 4.x (not system Python):
  blender -b -t 2 --python tools/player1_turnaround_v55.py -- \
    --candidate /path/to/sculpted_player1.glb --out /tmp/cd-player1-review

This creates studio renders and a geometry/expression report. It intentionally
does NOT modify the playable hero, paste stills into the game, or assert that
an actual browser/mobile screenshot was taken.
"""
import argparse
import json
import math
import sys
import tempfile
from pathlib import Path

try:
    import bpy
    from mathutils import Vector
except ImportError as exc:
    raise SystemExit("Run with Blender: blender -b --python tools/player1_turnaround_v55.py -- --candidate model.glb") from exc

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_SHAPES = ("blinkLeft", "blinkRight", "smile", "concerned")


def arguments():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--candidate", required=True, help="Artist-authored .glb/.gltf/.gltf.json Player 1 candidate, exported in metres")
    p.add_argument("--out", required=True, help="Output folder for PNG review views and JSON audit")
    p.add_argument("--head-name", default="Player1_Head", help="Preferred mesh object name containing face shape keys")
    p.add_argument("--samples", type=int, default=48)
    p.add_argument("--resolution", type=int, default=1024)
    return p.parse_args(argv)


def import_candidate(src):
    if not src.exists():
        raise FileNotFoundError(src)
    if not (src.name.endswith(".glb") or src.name.endswith(".gltf") or src.name.endswith(".gltf.json")):
        raise ValueError("Export candidate from Blender as .glb or embedded .gltf")
    path = src
    if src.name.endswith(".gltf.json"):
        path = Path(bpy.app.tempdir) / ("cd_v55_" + src.stem + ".gltf")
        path.write_bytes(src.read_bytes())
    bpy.ops.import_scene.gltf(filepath=str(path))
    return [o for o in bpy.context.scene.objects if o.type == "MESH"]


def world_bbox(objects):
    points = [o.matrix_world @ Vector(v) for o in objects for v in o.bound_box]
    if not points:
        raise RuntimeError("No meshes in candidate")
    lo = Vector([min(p[i] for p in points) for i in range(3)])
    hi = Vector([max(p[i] for p in points) for i in range(3)])
    return lo, hi


def look_at(camera, target):
    camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()


def material(name, rgba, roughness=0.8):
    m = bpy.data.materials.new(name)
    m.diffuse_color = rgba
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = rgba
        bsdf.inputs["Roughness"].default_value = roughness
    return m


def studio_scene(lo, hi, size):
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("V55 studio")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.74, 0.67, 0.57, 1.0)
        bg.inputs["Strength"].default_value = 0.48

    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = max(8, size)
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = "AgX"

    def area(name, pos, energy, scale, rgb):
        dat = bpy.data.lights.new(name, type="AREA")
        dat.energy = energy
        dat.shape = "DISK"
        dat.size = scale
        dat.color = rgb
        obj = bpy.data.objects.new(name, dat)
        scene.collection.objects.link(obj)
        obj.location = pos
        look_at(obj, (lo + hi) / 2)

    centre = (lo + hi) / 2
    span = max((hi - lo).length, 0.5)
    area("Large soft key", centre + Vector((span * 0.65, -span, span * 0.85)), 450, span * 1.1, (1.0, 0.84, 0.72))
    area("Soft fill", centre + Vector((-span, -span * 0.2, span * 0.3)), 230, span * 1.2, (0.86, 0.91, 1.0))
    area("Warm rim", centre + Vector((span * 0.3, span * 0.9, span * 0.5)), 600, span * 0.65, (1.0, 0.82, 0.63))

    camera_data = bpy.data.cameras.new("Player1_review_camera")
    camera = bpy.data.objects.new("Player1_review_camera", camera_data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    camera_data.type = "ORTHO"
    return camera, centre, span


def turn(camera, centre, span, angle_deg, elevation_deg=5):
    angle = math.radians(angle_deg)
    elev = math.radians(elevation_deg)
    distance = max(2.0, span * 3.0)
    camera.location = centre + Vector((
        math.sin(angle) * distance * math.cos(elev),
        -math.cos(angle) * distance * math.cos(elev),
        math.sin(elev) * distance,
    ))
    look_at(camera, centre)


def apply_expression(objects, name):
    for obj in objects:
        keys = obj.data.shape_keys
        if not keys:
            continue
        for key in keys.key_blocks:
            if key.name not in ("Basis",):
                key.value = 0.0
        if name == "blink":
            for side in ("blinkLeft", "blinkRight"):
                if side in keys.key_blocks:
                    keys.key_blocks[side].value = 1.0
        elif name in keys.key_blocks:
            keys.key_blocks[name].value = 1.0


def metrics(objects, head_name):
    all_shapes = {}
    poly_count = 0
    tris = 0
    mats = set()
    non_manifold = []
    for obj in objects:
        me = obj.data
        poly_count += len(me.polygons)
        tris += sum(max(0, len(f.vertices) - 2) for f in me.polygons)
        mats.update(mat.name for mat in me.materials if mat)
        if me.shape_keys:
            all_shapes[obj.name] = [key.name for key in me.shape_keys.key_blocks]
        if len(me.vertices) == 0:
            non_manifold.append(obj.name + " (empty)")
    candidate = next((obj for obj in objects if obj.name == head_name), None)
    if candidate is None:
        candidate = next((obj for obj in objects if "head" in obj.name.lower()), None)
    names = set(n for values in all_shapes.values() for n in values)
    return {
        "status": "REVIEW_REQUIRED",
        "headObject": candidate.name if candidate else None,
        "meshes": len(objects),
        "polygons": poly_count,
        "triangles": tris,
        "materials": sorted(mats),
        "shapeKeys": all_shapes,
        "missingRequiredExpressions": [key for key in REQUIRED_SHAPES if key not in names],
        "emptyMeshes": non_manifold,
        "note": "This does not prove compatibility with the game's 27-joint skeleton, clothing bind or mobile performance.",
    }


def main():
    args = arguments()
    src = Path(args.candidate).resolve()
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    objects = import_candidate(src)
    lo, hi = world_bbox(objects)
    report = metrics(objects, args.head_name)
    report.update({
        "source": str(src),
        "bboxBlender": {"min": list(lo), "max": list(hi)},
        "render": "Blender studio evidence, not a live game screenshot",
    })
    camera, centre, span = studio_scene(lo, hi, args.samples)
    scene = bpy.context.scene
    scene.render.resolution_x = args.resolution
    scene.render.resolution_y = args.resolution

    views = [
        ("front", 0, "neutral"),
        ("three-quarter", 35, "neutral"),
        ("profile", 90, "neutral"),
        ("back", 180, "neutral"),
        ("smile", 0, "smile"),
        ("concerned", 0, "concerned"),
        ("blink", 0, "blink"),
    ]
    for name, angle, expr in views:
        apply_expression(objects, expr)
        turn(camera, centre, span, angle)
        camera.data.ortho_scale = max((hi - lo).z * 1.25, (hi - lo).x * 2.0, 0.7)
        scene.render.filepath = str(out / ("player1-" + name + ".png"))
        bpy.ops.render.render(write_still=True)

    (out / "player1-review.json").write_text(json.dumps(report, indent=2) + "\n")
    print("V55 studio evidence at " + str(out))
    if report["missingRequiredExpressions"]:
        print("INCOMPLETE: missing expression shape keys: " + ", ".join(report["missingRequiredExpressions"]))
    print("Actual iPhone creator and gameplay screenshots must be obtained separately.")


if __name__ == "__main__":
    main()

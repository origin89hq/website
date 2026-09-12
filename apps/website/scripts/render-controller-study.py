"""Render the homepage plates from the edited CAD scene without saving over it."""
import argparse
import json
import hashlib
from pathlib import Path
import sys

import bpy
from mathutils import Vector

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--scene",type=Path,required=True)
parser.add_argument("--output",type=Path,required=True)
parser.add_argument("--size",type=int,default=1200)
parser.add_argument("--samples",type=int,default=128)
args = parser.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else [])
if args.size < 128 or args.samples < 1:
    parser.error("size must be >= 128 and samples >= 1")
args.output.mkdir(parents=True,exist_ok=True)
source_hash = hashlib.sha256(args.scene.read_bytes()).hexdigest()

for plate in ("closed","base","cover-on"):
    bpy.ops.wm.open_mainfile(filepath=str(args.scene.resolve()))
    scene = bpy.context.scene
    controls = bpy.data.objects["O89 Controls"]
    for key,value in {"production_label":False,"cover_lift_mm":0.0,"show_enclosure":True,
                      "show_cables":False,"show_cable_sleeve":False,"show_bus_layout":False,
                      "led_on":True}.items():
        controls[key] = value
    controls.update_tag()
    bpy.context.view_layer.update()
    # The same actual camera and full pixel frame are used for every layer.
    scene.camera = bpy.data.objects["Camera | Hero"]
    scene.camera.location = (-.22, -.38, .62)
    scene.camera.rotation_euler = (Vector((0, 0, .014)) - scene.camera.location).to_track_quat('-Z', 'Y').to_euler()
    scene.camera.data.ortho_scale = .27
    bpy.data.objects["Light | Key softbox"].data.energy = 8
    scene.render.resolution_x = args.size
    scene.render.resolution_y = round(args.size*9/8)
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.cycles.samples = args.samples
    scene.cycles.seed = 89
    scene.cycles.use_denoising = True
    cover = bpy.data.objects["Cover | lift with O89 Controls"]
    cover_parts = set(cover.children_recursive)
    if plate != "closed":
        for obj in bpy.data.objects:
            if obj.type not in ("MESH","CURVE","FONT","SURFACE","META"):
                continue
            excluded = obj in cover_parts if plate == "base" else obj not in cover_parts
            if excluded:
                if obj.animation_data:
                    for driver in list(obj.animation_data.drivers):
                        if driver.data_path == "hide_render":
                            obj.driver_remove("hide_render")
                obj.hide_render = True
    prefs = bpy.context.preferences.addons["cycles"].preferences
    try:
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        if any(d.type == "METAL" for d in prefs.devices):
            for device in prefs.devices:
                device.use = device.type == "METAL"
            scene.cycles.device = "GPU"
    except (TypeError,RuntimeError):
        scene.cycles.device = "CPU"
    scene.render.filepath = str((args.output/(plate+".png")).resolve())
    bpy.ops.render.render(write_still=True)
    metadata = {"plate":plate,"width":scene.render.resolution_x,"height":scene.render.resolution_y,
                "camera":[list(row) for row in scene.camera.matrix_world],
                "ortho_scale":scene.camera.data.ortho_scale,"scene_sha256":source_hash,
                "pcb_sha256":scene["pcb_sha256"]}
    (args.output/(plate+".json")).write_text(json.dumps(metadata,indent=2)+"\n")
    print("REVEAL PLATE",plate)

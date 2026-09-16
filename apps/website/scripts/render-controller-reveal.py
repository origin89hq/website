"""Render the Products page controller plates from the CAD scene without saving over it."""
import argparse
import json
import hashlib
from pathlib import Path
import sys

import bpy

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--scene",type=Path,required=True)
parser.add_argument("--output",type=Path,required=True)
parser.add_argument("--size",type=int,default=1440)
parser.add_argument("--samples",type=int,default=128)
args = parser.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else [])
if args.size < 128 or args.samples < 1:
    parser.error("size must be >= 128 and samples >= 1")
args.output.mkdir(parents=True,exist_ok=True)
source_hash = hashlib.sha256(args.scene.read_bytes()).hexdigest()

for plate in ("closed","base"):
    bpy.ops.wm.open_mainfile(filepath=str(args.scene.resolve()))
    scene = bpy.context.scene
    controls = bpy.data.objects["O89 Controls"]
    for key,value in {"production_label":False,"cover_lift_mm":0.0,"show_enclosure":True,
                      "show_cables":True,"show_cable_sleeve":True,"show_bus_layout":False,
                      "led_on":True}.items():
        controls[key] = value
    controls.update_tag()
    bpy.context.view_layer.update()
    # Both plates use the saved Hero camera and the full pixel frame.
    scene.camera = bpy.data.objects["Camera | Hero"]
    scene.render.resolution_x = args.size
    scene.render.resolution_y = round(args.size*9/8)
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.cycles.samples = args.samples
    scene.cycles.seed = 89
    scene.cycles.use_denoising = True
    if plate == "base":
        cover = bpy.data.objects["Cover | lift with O89 Controls"]
        for obj in cover.children_recursive:
            if obj.type not in ("MESH","CURVE","FONT","SURFACE","META"):
                continue
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

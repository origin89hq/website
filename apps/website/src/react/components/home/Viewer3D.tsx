import { useEffect, useRef, useState } from "react";
import modelUrl from "../../../assets/home/controller.glb?url";

// The GLB carries three nodes from the Blender scene: cover, board and plate.
export function Viewer3D() {
  const host = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "failed">("idle");

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let dispose = () => {};
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setState("loading");
        void start(element)
          .then((stop) => {
            if (cancelled) stop();
            else {
              dispose = stop;
              setState("ready");
            }
          })
          .catch(() => setState("failed"));
      },
      { rootMargin: "400px" },
    );
    observer.observe(element);

    async function start(container: HTMLDivElement) {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      const { RoomEnvironment } = await import(
        "three/examples/jsm/environments/RoomEnvironment.js"
      );
      const { MeshoptDecoder } = await import("three/examples/jsm/libs/meshopt_decoder.module.js");
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      container.prepend(renderer.domElement);
      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 0.35;
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(-0.4, 0.8, 0.5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x9fb6ff, 1.2);
      rim.position.set(0.6, 0.3, -0.6);
      scene.add(rim);
      const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 10);
      camera.position.set(-0.18, 0.26, 0.38);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.minDistance = 0.18;
      controls.maxDistance = 0.8;
      controls.target.set(0, 0.01, 0);
      controls.autoRotate = !reduce;
      controls.autoRotateSpeed = 0.6;
      renderer.domElement.addEventListener("pointerdown", () => {
        controls.autoRotate = false;
      });
      const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
      const gltf = await loader.loadAsync(modelUrl);
      scene.add(gltf.scene);
      const cover = gltf.scene.getObjectByName("cover");
      const rest = cover ? cover.position.y : 0;
      let lift = 0;
      const resize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const resizer = new ResizeObserver(resize);
      resizer.observe(container);
      resize();
      renderer.setAnimationLoop(() => {
        const target = openRef.current ? 0.1 : 0;
        lift += (target - lift) * (reduce ? 1 : 0.08);
        if (cover) cover.position.y = rest + lift;
        controls.update();
        renderer.render(scene, camera);
      });
      return () => {
        renderer.setAnimationLoop(null);
        resizer.disconnect();
        controls.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }
    return () => {
      cancelled = true;
      observer.disconnect();
      dispose();
    };
  }, []);

  return (
    <div className="viewer" ref={host}>
      {state !== "ready" && (
        <div className="viewer-loading">
          {state === "failed" ? "The 3D model couldn’t load." : "Loading the 3D model"}
        </div>
      )}
      <div className="viewer-bar">
        <div>
          <h3>Turn it over.</h3>
          <p>The enclosure and board A from the CAD. Drag to rotate, scroll or pinch to zoom.</p>
        </div>
        <fieldset className="viewer-controls" aria-label="Cover">
          <button
            type="button"
            className="o89-plate o89-plate-ghost o89-plate-sm"
            aria-pressed={!open}
            onClick={() => setOpen(false)}
          >
            Cover on
          </button>
          <button
            type="button"
            className="o89-plate o89-plate-ghost o89-plate-sm"
            aria-pressed={open}
            onClick={() => setOpen(true)}
          >
            Lift the cover
          </button>
        </fieldset>
      </div>
    </div>
  );
}

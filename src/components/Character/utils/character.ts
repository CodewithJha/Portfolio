import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const hasWebCrypto = () => {
    // WebCrypto (crypto.subtle) is only guaranteed in secure contexts (https/localhost)
    // On a real phone hitting your dev server via LAN IP (http://192.168.x.x:5173),
    // `crypto.subtle` is often unavailable even if WebGL works fine.
    return (
      typeof window !== "undefined" &&
      // @ts-expect-error - secureContext exists on Window in browsers
      (window.isSecureContext ?? false) &&
      typeof crypto !== "undefined" &&
      !!crypto.subtle
    );
  };

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        let modelUrl: string;

        if (hasWebCrypto()) {
          const decrypted = await decryptFile("/models/character.enc", "Character3D#@");
          modelUrl = URL.createObjectURL(new Blob([decrypted]));
        } else {
          // Fallback for non-secure contexts (common on phones viewing a LAN dev server)
          modelUrl = "/models/character.glb";
        }

        let character: THREE.Object3D;
        loader.load(
          modelUrl,
          async (gltf) => {
            character = gltf.scene;
            await renderer.compileAsync(character, camera, scene);
            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                child.castShadow = false;
                child.receiveShadow = false;
                mesh.frustumCulled = true;
                if (mesh.material && !Array.isArray(mesh.material)) {
                  (mesh.material as THREE.ShaderMaterial).precision = 'mediump';
                }
              }
            });
            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();
            character!.getObjectByName("footR")!.position.y = 3.36;
            character!.getObjectByName("footL")!.position.y = 3.36;
            dracoLoader.dispose();
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;

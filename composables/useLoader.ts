import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";

export function loadModel(path: string, scene: THREE.Scene): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {

        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/draco/gltf/')
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader)
        loader.load(path, (glb) => {
            scene.add(glb.scene)
        }, undefined, reject)
    })
}
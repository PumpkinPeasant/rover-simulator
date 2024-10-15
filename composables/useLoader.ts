import * as THREE from 'three'
//@ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
//@ts-ignore
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

export async function loadModel(path: string): Promise<THREE.Group> {
    try {
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/draco/gltf/')

        const loader = new GLTFLoader()
        loader.setDRACOLoader(dracoLoader)

        //@ts-ignore
        const glb = await new Promise<THREE.GLTF>((resolve, reject) => {
            loader.load(path, resolve, undefined, reject)
        })

        return glb.scene
    } catch (error) {
        throw new Error(`Failed to load model: ${error}`)
    }
}

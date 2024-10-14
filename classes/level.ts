import * as THREE from 'three'

class Level {

    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    canvas: HTMLCanvasElement

    ambientLight: THREE.AmbientLight

    constructor(canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene()

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5; // Устанавливаем позицию камеры

        this.canvas = canvas
        this.renderer = new THREE.WebGLRenderer({canvas})
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        this.ambientLight = new THREE.AmbientLight(0x707070)
        this.scene.add(this.ambientLight)

        this.animate()
        this.resizeRendererToDisplaySize()
    }

    private animate() {
        const level = this
        requestAnimationFrame(() => level.animate())

        this.renderer.render(this.scene, this.camera)
    }

    public add(object: any) {
        this.scene.add(object)
    }

    public resizeRendererToDisplaySize() {
        const width = this.canvas.clientWidth
        const height = this.canvas.clientHeight
        const needResize = this.canvas.width !== width || this.canvas.height !== height
        if (needResize) {
            this.renderer.setSize(width, height, false)
            this.camera.aspect = width / height
            this.camera.updateProjectionMatrix()
        }
        return needResize
    }

}

export default Level
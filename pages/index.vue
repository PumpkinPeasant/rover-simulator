<template>
  <div>
    <canvas ref="canvas" id="scene"></canvas>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, watch, computed} from 'vue'
import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  Clock,
  GridHelper,
  LoadingManager,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  PointLightHelper,
  Scene,
  WebGLRenderer,
} from 'three'
import {DragControls} from 'three/examples/jsm/controls/DragControls'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import GUI from 'lil-gui'
import {useWindowSize} from '@vueuse/core'
import * as animations from '@/composables/useAnimations' // Обновите путь в соответствии с вашим проектом
import {toggleFullScreen} from '@/composables/useFullscreen' // Обновите путь в соответствии с вашим проектом
import {resizeRendererToDisplaySize} from '@/composables/useResponsiveness' // Обновите путь в соответствии с вашим проектом
// import RoverModel from '@/public/models/rover.glb'
import {loadModel} from "@/composables/useLoader";
import roverModel from "~/scripts/roverModel";

const canvas = ref<HTMLCanvasElement | null>(null)
let renderer: WebGLRenderer
let scene: Scene
let loadingManager: LoadingManager
let ambientLight: AmbientLight
let pointLight: PointLight
let cube: Mesh
let camera: PerspectiveCamera
let cameraControls: OrbitControls
let dragControls: DragControls
let axesHelper: AxesHelper
let pointLightHelper: PointLightHelper
let clock: Clock
let stats: Stats
let gui: GUI

const animation = {enabled: true, play: true}

const {width, height} = useWindowSize()
const aspectRatio = computed(() => width.value / height.value)

function init() {
  if (!canvas.value) return

  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  renderer = new WebGLRenderer({canvas: canvas.value, antialias: true, alpha: true})
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap
  scene = new Scene()

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  loadingManager = new LoadingManager()

  loadingManager.onStart = () => {
    console.log('loading started')
  }
  loadingManager.onProgress = (url, loaded, total) => {
    console.log('loading in progress:')
    console.log(`${url} -> ${loaded} / ${total}`)
  }
  loadingManager.onLoad = () => {
    console.log('loaded!')
  }
  loadingManager.onError = () => {
    console.log('❌ error while loading')
  }

  // ===== 💡 LIGHTS =====
  ambientLight = new AmbientLight('white', 0.8)
  pointLight = new PointLight('white', 80, 150)
  pointLight.position.set(-2, 6, 2)
  pointLight.castShadow = true
  pointLight.shadow.radius = 4
  pointLight.shadow.camera.near = 0.5
  pointLight.shadow.camera.far = 4000
  pointLight.shadow.mapSize.width = 2048
  pointLight.shadow.mapSize.height = 2048
  scene.add(ambientLight)
  scene.add(pointLight)

  // ===== 📦 OBJECTS =====
  const sideLength = 1
  const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
  const cubeMaterial = new MeshStandardMaterial({
    color: '#f69f1f',
    metalness: 0.5,
    roughness: 0.7,
  })
  cube = new Mesh(cubeGeometry, cubeMaterial)
  cube.castShadow = true
  cube.position.y = 0.5

  // const planeGeometry = new PlaneGeometry(50, 50)
  // const planeMaterial = new MeshLambertMaterial({
  //   color: 'gray',
  //   emissive: 'teal',
  //   emissiveIntensity: 0.2,
  //   side: 2,
  //   transparent: true,
  //   opacity: 0.4,
  // })
  // const plane = new Mesh(planeGeometry, planeMaterial)
  // plane.rotateX(Math.PI / 2)
  // plane.receiveShadow = true
  //
  // // scene.add(cube)
  // scene.add(plane)

  // ===== 🎥 CAMERA =====
  camera = new PerspectiveCamera(50, aspectRatio.value, 0.1, 100)
  camera.position.set(5, 12, 0)

  // ===== 🕹️ CONTROLS =====
  cameraControls = new OrbitControls(camera, renderer.domElement)
  // cameraControls.target = cube.position.clone()
  // cameraControls.enableDamping = true
  // cameraControls.autoRotate = false
  // cameraControls.update()

  loadModel('models/rover.glb').then(model => {
    roverModel(model, scene, camera)
  })

  dragControls = new DragControls([cube], camera, renderer.domElement)
  dragControls.addEventListener('hoveron', onHoverOn)
  dragControls.addEventListener('hoveroff', onHoverOff)
  dragControls.addEventListener('dragstart', onDragStart)
  dragControls.addEventListener('dragend', onDragEnd)
  dragControls.enabled = false

  // Full screen
  window.addEventListener('dblclick', onDoubleClick)

  // ===== 🪄 HELPERS =====
  axesHelper = new AxesHelper(4)
  axesHelper.visible = false
  scene.add(axesHelper)

  pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange')
  pointLightHelper.visible = false
  scene.add(pointLightHelper)

  const gridHelper = new GridHelper(100, 20, 'teal', 'darkgray')
  gridHelper.position.y = -0.01
  scene.add(gridHelper)

  // ===== 📈 STATS & CLOCK =====
  clock = new Clock()
  stats = Stats()
  document.body.appendChild(stats.dom)

  // ==== 🐞 DEBUG GUI ====
  gui = new GUI({title: '🐞 Debug GUI', width: 300})

  const cubeOneFolder = gui.addFolder('Cube one')

  cubeOneFolder.add(cube.position, 'x').min(-5).max(5).step(0.5).name('pos x')
  cubeOneFolder.add(cube.position, 'y').min(-5).max(5).step(0.5).name('pos y')
  cubeOneFolder.add(cube.position, 'z').min(-5).max(5).step(0.5).name('pos z')

  cubeOneFolder.add((cube.material as MeshStandardMaterial), 'wireframe')
  cubeOneFolder.addColor((cube.material as MeshStandardMaterial), 'color')
  cubeOneFolder.add((cube.material as MeshStandardMaterial), 'metalness', 0, 1, 0.1)
  cubeOneFolder.add((cube.material as MeshStandardMaterial), 'roughness', 0, 1, 0.1)

  cubeOneFolder
      .add(cube.rotation, 'x', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate x')
  cubeOneFolder
      .add(cube.rotation, 'y', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate y')
  cubeOneFolder
      .add(cube.rotation, 'z', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate z')

  cubeOneFolder.add(animation, 'enabled').name('animated')

  const controlsFolder = gui.addFolder('Controls')
  controlsFolder.add(dragControls, 'enabled').name('drag controls')

  const lightsFolder = gui.addFolder('Lights')
  lightsFolder.add(pointLight, 'visible').name('point light')
  lightsFolder.add(ambientLight, 'visible').name('ambient light')

  const helpersFolder = gui.addFolder('Helpers')
  helpersFolder.add(axesHelper, 'visible').name('axes')
  helpersFolder.add(pointLightHelper, 'visible').name('pointLight')

  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(cameraControls, 'autoRotate')

  // Сохранение состояния GUI в localStorage при изменениях
  gui.onFinishChange(() => {
    const guiState = gui.save()
    localStorage.setItem('guiState', JSON.stringify(guiState))
  })

  // Загрузка состояния GUI из localStorage, если доступно
  const guiState = localStorage.getItem('guiState')
  if (guiState) gui.load(JSON.parse(guiState))

  // Кнопка сброса состояния GUI
  const resetGui = () => {
    localStorage.removeItem('guiState')
    gui.reset()
  }
  gui.add({resetGui}, 'resetGui').name('RESET')

  gui.close()
}

// Обработчики событий для DragControls
function onHoverOn(event: any) {
  const mesh = event.object as Mesh
  const material = mesh.material as MeshStandardMaterial
  material.emissive.set('orange')
}

function onHoverOff(event: any) {
  const mesh = event.object as Mesh
  const material = mesh.material as MeshStandardMaterial
  material.emissive.set('black')
}

function onDragStart(event: any) {
  const mesh = event.object as Mesh
  const material = mesh.material as MeshStandardMaterial
  cameraControls.enabled = false
  animation.play = false
  material.emissive.set('black')
  material.opacity = 0.7
  material.needsUpdate = true
}

function onDragEnd(event: any) {
  cameraControls.enabled = true
  animation.play = true
  const mesh = event.object as Mesh
  const material = mesh.material as MeshStandardMaterial
  material.emissive.set('black')
  material.opacity = 1
  material.needsUpdate = true
}

function onDoubleClick(event: MouseEvent) {
  if (canvas.value && event.target === canvas.value) {
    toggleFullScreen(canvas.value)
  }
}

function animate() {
  requestAnimationFrame(animate)

  stats.update()

  if (animation.enabled && animation.play) {
    animations.rotate(cube, clock, Math.PI / 3)
    animations.bounce(cube, clock, 1, 0.5, 0.5)
  }

  if (resizeRendererToDisplaySize(renderer)) {
    const canvasElement = renderer.domElement
    camera.aspect = canvasElement.clientWidth / canvasElement.clientHeight
    camera.updateProjectionMatrix()
  }

  cameraControls.update()

  renderer.render(scene, camera)
}

onMounted(() => {
  init()
  animate()
})

onBeforeUnmount(() => {
  // Удаляем обработчики событий
  dragControls.removeEventListener('hoveron', onHoverOn)
  dragControls.removeEventListener('hoveroff', onHoverOff)
  dragControls.removeEventListener('dragstart', onDragStart)
  dragControls.removeEventListener('dragend', onDragEnd)
  window.removeEventListener('dblclick', onDoubleClick)

  // Уничтожаем GUI
  gui.destroy()

  // Удаляем stats
  document.body.removeChild(stats.dom)

  // Освобождаем ресурсы Three.js
  renderer.dispose()
})
</script>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

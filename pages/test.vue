<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount} from "vue";
import Level from '~/classes/level';
import * as THREE from "three";
import {loadModel} from "~/composables/useLoader";
import Rover from "~/classes/rover";

const canvas = ref<HTMLCanvasElement | null>(null);
let levelInstance: Level | null = null;
// let cube: THREE.Mesh | null = null;

const handleResize = () => {
  levelInstance?.resizeRendererToDisplaySize();
};

const configureLevel = () => {
  if (canvas.value) {
    levelInstance = new Level(canvas.value);
    window.addEventListener('resize', handleResize);

    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshPhongMaterial({ color: 0x00aaff });
    // cube = new THREE.Mesh(geometry, material);
    // levelInstance.add(cube);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 20, 10);
    levelInstance.add(light);

    loadModel('models/rover.glb').then(model => {
      const rover = new Rover(model)
      levelInstance?.add(rover.model)
    })

    // animateCube();
  }
};

// const animateCube = () => {
//   const animate = () => {
//     if (cube) {
//       cube.rotation.x += 0.01;
//       cube.rotation.y += 0.01;
//     }
//     requestAnimationFrame(animate);
//   };
//   animate();
// };

onMounted(() => {
  configureLevel();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <canvas ref="canvas" id="scene"></canvas>
</template>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

<script setup lang="ts">
import * as THREE from 'three';
import { onMounted } from 'vue';
import { degToRad } from '~/app/triggonometry/deg-rad.utils';

const props = defineProps<{
  alpha: number;
  beta: number;
  gamma: number;
  initialAlpha: number;
  initialBeta: number;
  initialGamma: number;
}>();
const container = ref<HTMLDivElement | null>(null);

onMounted(() => {
  const width = 300;
  const height = 300;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(300, 300);
  container.value?.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(3, 5, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    cube.rotation.x = degToRad(props.beta - props.initialBeta);
    cube.rotation.y = degToRad(props.gamma - props.initialGamma);
    cube.rotation.z = degToRad(props.alpha - props.initialAlpha);
  }
  animate();
});
</script>

<template>
  <p>Alpha: {{ props.alpha }}</p>
  <p>Beta: {{ props.beta }}</p>
  <p>Gamma: {{ props.gamma }}</p>
  <div ref="container" />
</template>

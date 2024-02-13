<script setup lang="ts">
import * as THREE from 'three';
import { onMounted } from 'vue';
import { degToRad } from '~/app/triggonometry/deg-rad.utils';

const props = defineProps<{
  orientation: {
    alpha: number;
    beta: number;
    gamma: number;
  },
  initialOrientation: {
    alpha: number;
    beta: number;
    gamma: number;
  },
  position: {
    x: number;
    y: number;
    z: number;
  }
}>();
const container = ref<HTMLDivElement | null>(null);

onMounted(() => {
  const width = 300;
  const height = 300;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  //const axesHelper = new THREE.AxesHelper(5);
  //scene.add(axesHelper);

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
    cube.rotation.x = degToRad(props.orientation.beta - props.initialOrientation.beta);
    cube.rotation.y = degToRad(props.orientation.gamma - props.initialOrientation.gamma);
    cube.rotation.z = degToRad(props.orientation.alpha - props.initialOrientation.alpha);
    cube.position.x = props.position.x * (3/0.1)
    cube.position.y = props.position.y * (3/0.1)
    cube.position.z = props.position.z * (3/0.1)
  }
  animate();
});
</script>

<template>
  <div>
    <p>Alpha: {{ props.orientation.alpha }}</p>
    <p>Beta: {{ props.orientation.beta }}</p>
    <p>Gamma: {{ props.orientation.gamma }}</p>
  </div>
  <div ref="container" />
</template>

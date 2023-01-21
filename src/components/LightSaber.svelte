<script lang="ts">
    import * as THREE from 'three';
    import {onMount} from "svelte";
    import {degToRad} from "../utils/deg-rad.utils";

    export let alpha, beta, gamma;

    let el;

    onMount(() => {
        const width = 300;
        const height = 300;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( 300, 300 );
        el.appendChild( renderer.domElement );

        const geometry = new THREE.BoxGeometry( 1, 5, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        scene.add( cube );

        camera.position.z = 5;

        function animate() {
            requestAnimationFrame( animate );
            renderer.render( scene, camera );
            cube.rotation.x = degToRad(gamma);
            cube.rotation.y = degToRad(beta);
            cube.rotation.z = degToRad(alpha);
        }
        animate();
    })
</script>

<div bind:this={el}></div>



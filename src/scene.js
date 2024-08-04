import * as THREE from 'three';
import * as TERRAIN from './terrain.js';

export let scene, camera, cube;

export function initScene() {
    // Scene
    scene = new THREE.Scene();

    // Skybox color
    scene.background = new THREE.Color(0x87CEEB);

    // Add fog to the scene
    scene.fog = new THREE.Fog(0x87CEEB, 200, 300);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10).normalize();
    scene.add(directionalLight);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 100, 20); // Set initial camera position behind and above the cube

    // Cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue color for the cube
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 1, 0); // Ensure cube is above the plane
    scene.add(cube);

    // Clouds
    for (let i = 0; i < 20; i++) {
        const cloudGeometry = new THREE.SphereGeometry(Math.random() * 3 + 1, 32, 32);
        const cloudMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: Math.random() * 0.5 + 0.3 });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(Math.random() * 500 - 250, Math.random() * 20 + 10, Math.random() * 500 - 250);
        scene.add(cloud);
    }
}

export const tiles = {};
export const tileSize = 100;

export function createTile(tile_i, tile_j) {
    console.log(`Creating tile at (${tile_i}, ${tile_j})`);
    const tile = TERRAIN.generateTerrain(tileSize, tile_i, tile_j);
    scene.add(tile);
    tiles[`${tile_i},${tile_j}`] = tile;
}
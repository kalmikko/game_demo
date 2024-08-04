import * as SCENE from './scene.js';
import * as RENDERER from './renderer.js';
import * as CONTROLLER from './controller.js';
import * as GENERATION from './generation.js';
import * as TERRAIN from './terrain.js';
import Stats from 'stats.js';

let lastFrameTime = 0;
let fps = 60;
let i_tile = 0; 
let j_tile = 0;
let stats, memoryStats, coordinateStats;

init();

function init() {
    SCENE.initScene();
    RENDERER.initRenderer();
    CONTROLLER.initControls();
    GENERATION.initGeneration();

    stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms/frame, 2: memory
    document.body.appendChild(stats.dom);

    memoryStats = document.createElement('div');
    memoryStats.style.position = 'absolute';
    memoryStats.style.top = '50px';
    memoryStats.style.left = '0';
    memoryStats.style.color = 'white';
    memoryStats.style.backgroundColor = 'black';
    memoryStats.style.padding = '5px';
    memoryStats.innerHTML = 'Memory: 0 MB';
    document.body.appendChild(memoryStats);

    // Add this code within the init function, below the memoryStats initialization
    coordinateStats = document.createElement('div');
    coordinateStats.style.position = 'absolute';
    coordinateStats.style.top = '100px';
    coordinateStats.style.left = '0';
    coordinateStats.style.color = 'white';
    coordinateStats.style.backgroundColor = 'black';
    coordinateStats.style.padding = '5px';
    coordinateStats.innerHTML = 'X: 0, Y: 0, Z: 0';
    document.body.appendChild(coordinateStats);

    // Set initial cube position above the ground level
    SCENE.cube.position.set(0, 1, 0); // Adjust the y-coordinate to be above the ground

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = now - lastFrameTime;

    if (delta < 1000 / 60) {
        return;
    }

    lastFrameTime = now;
    fps = 1000 / delta;

    stats.begin();

    // Cube Movement
    let moveSpeed = 0.5;
    if (CONTROLLER.isShiftDown) moveSpeed *= 10;
    if (CONTROLLER.moveForward) {
        SCENE.cube.position.x += Math.sin(SCENE.cube.rotation.y) * moveSpeed;
        SCENE.cube.position.z += Math.cos(SCENE.cube.rotation.y) * moveSpeed;
    }
    if (CONTROLLER.moveBackward) {
        SCENE.cube.position.x -= Math.sin(SCENE.cube.rotation.y) * moveSpeed;
        SCENE.cube.position.z -= Math.cos(SCENE.cube.rotation.y) * moveSpeed;
    }
    if (CONTROLLER.moveLeft) {
        SCENE.cube.position.x += Math.cos(SCENE.cube.rotation.y) * moveSpeed;
        SCENE.cube.position.z -= Math.sin(SCENE.cube.rotation.y) * moveSpeed;
    }
    if (CONTROLLER.moveRight) {
        SCENE.cube.position.x -= Math.cos(SCENE.cube.rotation.y) * moveSpeed;
        SCENE.cube.position.z += Math.sin(SCENE.cube.rotation.y) * moveSpeed;
    }
    
    // Update cube y position based on terrain height
    const terrainHeight = TERRAIN.heightFunction(SCENE.cube.position.x,SCENE.cube.position.z)

    //console.log(terrainHeight)
    if (!CONTROLLER.getIsJumping()) {
        SCENE.cube.position.y = terrainHeight + 1; // Set to ground level plus any offset needed
    }

    // Cube Rotation
    const rotateSpeed = 0.05;
    if (CONTROLLER.rotateLeft) SCENE.cube.rotation.y -= rotateSpeed;
    if (CONTROLLER.rotateRight) SCENE.cube.rotation.y += rotateSpeed;

    // Jump Logic
    if (CONTROLLER.getIsJumping()) {
        SCENE.cube.position.y += CONTROLLER.getJumpVelocity() * delta / 1000;
        CONTROLLER.setJumpVelocity(CONTROLLER.getJumpVelocity() + CONTROLLER.gravity * delta / 1000);

        // Check if cube has landed
        if (SCENE.cube.position.y <= terrainHeight + 1) { // Ensure it lands at the correct height above ground
            SCENE.cube.position.y = terrainHeight + 1; // Set to ground level plus any offset needed
            CONTROLLER.setIsJumping(false);
            CONTROLLER.setJumpVelocity(0);
        }
    } else if (SCENE.cube.position.y > terrainHeight + 1) { // Apply gravity if not on the ground
        SCENE.cube.position.y += CONTROLLER.gravity * delta / 1000;

        // Check if cube has landed
        if (SCENE.cube.position.y <= terrainHeight + 1) {
            SCENE.cube.position.y = terrainHeight + 1; // Set to ground level plus any offset needed
        }
    }

    if (CONTROLLER.isRightMouseButtonDown) {
        // Free look around the player
        SCENE.camera.position.x = SCENE.cube.position.x + CONTROLLER.cameraDistance * Math.sin(CONTROLLER.yaw) * Math.cos(CONTROLLER.pitch);
        SCENE.camera.position.y = SCENE.cube.position.y + CONTROLLER.cameraDistance * Math.sin(CONTROLLER.pitch);
        SCENE.camera.position.z = SCENE.cube.position.z + CONTROLLER.cameraDistance * Math.cos(CONTROLLER.yaw) * Math.cos(CONTROLLER.pitch);
        SCENE.camera.lookAt(SCENE.cube.position);
    } else {
        // Lock camera behind the player
        SCENE.camera.position.x = SCENE.cube.position.x - Math.sin(SCENE.cube.rotation.y) * CONTROLLER.cameraDistance;
        SCENE.camera.position.z = SCENE.cube.position.z - Math.cos(SCENE.cube.rotation.y) * CONTROLLER.cameraDistance;
        SCENE.camera.position.y = SCENE.cube.position.y + 5;
        SCENE.camera.lookAt(SCENE.cube.position);
    }

    if (fps >= 20) {
        GENERATION.updateTiles(fps);
        GENERATION.processTiles(fps);
    }

    RENDERER.renderer.render(SCENE.scene, SCENE.camera);

    stats.end();

    // Update memory stats
    if (performance.memory) {
        const usedJSHeapSize = performance.memory.usedJSHeapSize;
        const totalJSHeapSize = performance.memory.totalJSHeapSize;
        memoryStats.innerHTML = `Memory: ${(usedJSHeapSize / 1048576).toFixed(2)} MB / ${(totalJSHeapSize / 1048576).toFixed(2)} MB`;
    }

    // Update coordinate stats
    coordinateStats.innerHTML = `X: ${SCENE.cube.position.x.toFixed(2)}, Y: ${SCENE.cube.position.y.toFixed(2)}, Z: ${SCENE.cube.position.z.toFixed(2)}`;
}
import * as THREE from 'three';
import { cube, camera } from './scene.js';

export let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
export let rotateLeft = false, rotateRight = false;
export let isShiftDown = false;
export let cameraDistance = 10;
export let isSpaceDown = false;
export let jumpStartTime = 0;
let _isJumping = false;
let _jumpVelocity = 0;
export const gravity = -30; // Adjust as necessary for your scene
export const maxJumpChargeTime = 1.0; // Maximum time in seconds to charge the jump
export const maxJumpVelocity = 20; // Maximum velocity for the jump
export const minJumpVelocity = 5; // Minimum velocity after holding for too long

export function setIsJumping(value) {
    _isJumping = value;
}

export function getIsJumping() {
    return _isJumping;
}

export function setJumpVelocity(value) {
    _jumpVelocity = value;
}

export function getJumpVelocity() {
    return _jumpVelocity;
}

export function initControls() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('wheel', onMouseWheel);
}

export function onKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        case 'KeyE':
            rotateLeft = true;
            break;
        case 'KeyQ':
            rotateRight = true;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            isShiftDown = true;
            break;
        case 'Space':
            if (!getIsJumping()) {
                if (!isSpaceDown) {
                    isSpaceDown = true;
                    jumpStartTime = performance.now();
                }
            }
            break;
    }
}

export function onKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
        case 'KeyE':
            rotateLeft = false;
            break;
        case 'KeyQ':
            rotateRight = false;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            isShiftDown = false;
            break;
        case 'Space':
            if (isSpaceDown) {
                isSpaceDown = false;
                const jumpDuration = (performance.now() - jumpStartTime) / 1000; // Duration in seconds
                let jumpCharge = Math.min(jumpDuration, maxJumpChargeTime);
                if (jumpDuration > maxJumpChargeTime) {
                    const overChargeTime = jumpDuration - maxJumpChargeTime;
                    jumpCharge -= overChargeTime * 10; // Decrease jumpCharge slowly
                    jumpCharge = Math.max(jumpCharge, minJumpVelocity / maxJumpVelocity); // Ensure it doesn't go below minJumpVelocity
                }
                const jumpVelocity = maxJumpVelocity * jumpCharge;
                setJumpVelocity(jumpVelocity);
                setIsJumping(true);
            }
            break;
    }
}

export function onMouseWheel(event) {
    cameraDistance += event.deltaY * 0.05;
    cameraDistance = Math.max(5, Math.min(50, cameraDistance)); // Clamp the zoom range
}

export let isRightMouseButtonDown = false;
export let previousMousePosition = { x: 0, y: 0 };
export let yaw = 0;
export let pitch = 0;
let initialYaw = 0;
let initialPitch = 0;

document.addEventListener('mousedown', (event) => {
    if (event.button === 2) { // Right mouse button
        isRightMouseButtonDown = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };

        // Calculate initial yaw and pitch based on the current camera direction
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        initialYaw = Math.atan2(direction.x, direction.z);
        initialPitch = Math.asin(direction.y / Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z));

        // Initialize yaw and pitch to the current camera orientation
        yaw = initialYaw;
        pitch = initialPitch + Math.PI;
    }
});

document.addEventListener('mouseup', (event) => {
    if (event.button === 2) { // Right mouse button
        isRightMouseButtonDown = false;
    }
});

document.addEventListener('mousemove', (event) => {
    if (isRightMouseButtonDown) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        previousMousePosition = { x: event.clientX, y: event.clientY };

        yaw += deltaX * 0.01;
        pitch -= deltaY * 0.01;
        
        // Clamp the pitch to avoid flipping the camera
        if (pitch > Math.PI) {
            pitch = Math.PI;
        } else if (pitch < 0) {
            pitch = 0;
        }
    }
});
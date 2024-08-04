import * as THREE from 'three';
import { Noise } from 'noisejs'; // Import Noise from noisejs

const noise = new Noise(Math.random());
let maxHeight = 10; // Maximum height difference

// Function to generate a terrain tile with height variation
export function generateTerrain(tileSize, tile_i, tile_j) {
    const tileGeometry = new THREE.PlaneGeometry(tileSize, tileSize, tileSize - 1, tileSize - 1);
    const tileMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false });
    const tile = new THREE.Mesh(tileGeometry, tileMaterial);
    tile.rotation.x = -Math.PI / 2;
    tile.position.set(tile_i * tileSize - tileSize / 2, 0, tile_j * tileSize - tileSize / 2);

    const positionAttribute = tileGeometry.attributes.position;

    for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const z = -positionAttribute.getY(i); // Note: PlaneGeometry's Y axis is actually the Z axis in the final mesh due to rotation
        const worldX = tile_i * tileSize + x - tileSize / 2; 
        const worldZ = tile_j * tileSize + z - tileSize / 2;
        
        // Set the height of the vertex at the calculated index
        const y = heightFunction(worldX, worldZ);
        positionAttribute.setZ(i, y); // Note: PlaneGeometry's Y axis is actually the Z axis in the final mesh due to rotation
    }

    // Update the geometry to reflect the changes
    positionAttribute.needsUpdate = true;
    tileGeometry.computeVertexNormals();
    
    return tile;
}

// Height function using noise
export function heightFunction(x, z) {
    return noise.perlin2(x * 0.005, z * 0.01) * maxHeight;
}
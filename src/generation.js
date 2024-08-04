import { createTile, tiles, tileSize, scene, cube } from './scene.js';

export const generatedTiles = new Set();
export let tilesToCreate = [];
export const totalMemory = 256 * 1024 * 1024; // 256 MB as an example
export const allocatedTileMemory = totalMemory * 0.5; // Allocate 50% of total memory to tiles
export let currentTileMemoryUsage = 0;
export const tileMemorySize = 4096; // Estimate memory size for each tile
let lastTileGenerationTime = 0;
let tileGenerationCount = 0;
export let i_last = null;
export let j_last = null;

export function initGeneration() {
    // Create initial tiles
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            createTile(i, j);
            generatedTiles.add(`${i},${j}`);
            currentTileMemoryUsage += tileMemorySize;
        }
    }
}

export function updateTiles(fps) {
    const i = Math.floor(cube.position.x / tileSize);
    const j = Math.floor(cube.position.z / tileSize);

    if (i_last !== i || j_last !== j) {
        console.log(`Player Position (Tile Coordinates): X=${i}, Z=${j}`);

        const range = 3; // Define the range
        const highPriority = [];

        for (let di = -range; di <= range; di++) {
            for (let dj = -range; dj <= range; dj++) {
                if (di === 0 && dj === 0) continue;
                highPriority.push([i + di, j + dj]);
            }
        }

        for (let [i, j] of highPriority) {
            const tileKey = `${i},${j}`;
            if (!generatedTiles.has(tileKey)) {
                tilesToCreate.push([i, j]);
                generatedTiles.add(tileKey);
            }
        }

        i_last = i;
        j_last = j;
    }
    manageMemory();
}

export function manageMemory() {
    while (currentTileMemoryUsage > allocatedTileMemory) {
        let farthestTile = null;
        let maxDistance = 0;

        for (const key in tiles) {
            const [tileX, tileZ] = key.split(',').map(Number);
            const distance = Math.abs(tileX - cube.position.x / tileSize) + Math.abs(tileZ - cube.position.z / tileSize);
            if (distance > maxDistance) {
                maxDistance = distance;
                farthestTile = key;
            }
        }

        if (farthestTile) {
            const [tileX, tileZ] = farthestTile.split(',').map(Number);
            scene.remove(tiles[farthestTile]);
            delete tiles[farthestTile];
            currentTileMemoryUsage -= tileMemorySize;
        }
    }
}

export function processTiles(fps) {
    const now = performance.now();
    const timeSinceLastGeneration = now - lastTileGenerationTime;
    
    if (fps >= 20 && tilesToCreate.length > 0 && timeSinceLastGeneration >= 250) { // 4 tiles/sec
        const [x, z] = tilesToCreate.shift();
        createTile(x, z);
        currentTileMemoryUsage += tileMemorySize;
        lastTileGenerationTime = now;
        tileGenerationCount++;
    }

    if (tileGenerationCount < 2) {
        setTimeout(() => {
            processTiles(fps);
        }, 0);
    } else {
        tileGenerationCount = 0;
        setTimeout(() => {
            processTiles(fps);
        }, 1000);
    }    
}
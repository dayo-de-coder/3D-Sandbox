// =====================================
// 3D SANDBOX
// V1.9A — TRUE 4D WORLD DATA
// =====================================

export const World = {
    dimension: 3,
    time: 0,

    blocks: new Map(),
    history: new Map(),
    futureChanges: new Map(),
    dimensionChanges: new Map(),
    chunks: new Map()
};


// =====================================
// DIMENSIONS
// =====================================

export const Dimensions = {
    current: 3,
    min: 1,
    max: 6,

    names: {
        1: "1D",
        2: "2D",
        3: "3D",
        4: "4D",
        5: "5D",
        6: "6D"
    },

    affects: {
        1: [1],
        2: [1, 2],
        3: [1, 2, 3],
        4: [1, 2, 3, 4],
        5: [1, 2, 3, 4, 5],
        6: [1, 2, 3, 4, 5, 6]
    }
};


// =====================================
// TIME
// =====================================

export const Time = {

    now() {
        return World.time;
    },

    set(value) {
        World.time = value;
    },

    travel(amount) {
        World.time += amount;
        return World.time;
    },

    goPast() {
        return this.travel(-10);
    },

    goFuture() {
        return this.travel(10);
    },

    goPresent() {
        World.time = 0;
        return World.time;
    }
};


// =====================================
// CHUNKS
// =====================================

export const CHUNK_SIZE = 16;

export const RENDER_DISTANCE = 5;

export function getChunkId(x, z) {
    return `${x},${z}`;
}

export function worldToChunk(x, z) {
    return {
        x: Math.floor(x / CHUNK_SIZE),
        z: Math.floor(z / CHUNK_SIZE)
    };
}


// =====================================
// 4D BLOCK ID
// =====================================

export function getBlockId(x, y, z, w = 0) {

    return [
        Math.round(x),
        Math.round(y),
        Math.round(z),
        Math.round(w)
    ].join(",");

}


// =====================================
// CREATE BLOCK
// =====================================

export function createWorldBlock(
    x,
    y,
    z,
    type,
    dimension = 3,
    time = Time.now(),
    w = 0
) {

    const block = {

        id: getBlockId(
            x,
            y,
            z,
            w
        ),

        // Normal spatial coordinates
        x: Math.round(x),
        y: Math.round(y),
        z: Math.round(z),

        // Fourth spatial coordinate
        w: Math.round(w),

        type,

        dimension,

        createdAt: time,

        removedAt: null

    };

    World.blocks.set(
        block.id,
        block
    );

    recordChange(
        "CREATE",
        block
    );

    return block;
}


// =====================================
// REMOVE BLOCK
// =====================================

export function removeWorldBlock(
    x,
    y,
    z,
    w = 0
) {

    const id =
        getBlockId(
            x,
            y,
            z,
            w
        );

    const block =
        World.blocks.get(id);

    if (!block) {
        return false;
    }

    block.removedAt =
        Time.now();

    recordChange(
        "REMOVE",
        block
    );

    return true;
}


// =====================================
// GET BLOCK
// =====================================

export function getWorldBlock(
    x,
    y,
    z,
    w = 0
) {

    return World.blocks.get(
        getBlockId(
            x,
            y,
            z,
            w
        )
    );
}


// =====================================
// DETERMINISTIC TERRAIN
// =====================================

function seededRandom(x, z) {

    const value =
        Math.sin(
            x * 127.1 +
            z * 311.7
        ) * 43758.5453123;

    return value -
        Math.floor(value);
}


function terrainHeight(x, z) {

    const large =
        Math.sin(x * 0.025) * 7 +
        Math.cos(z * 0.03) * 6;

    const medium =
        Math.sin(
            (x + z) * 0.08
        ) * 2;

    return Math.max(
        1,
        Math.floor(
            5 +
            large +
            medium
        )
    );
}


// =====================================
// TREE
// =====================================

function generateTree(x, y, z) {

    const height =
        4 +
        Math.floor(
            seededRandom(
                x + 50,
                z + 50
            ) * 3
        );

    for (
        let i = 0;
        i < height;
        i++
    ) {

        createWorldBlock(
            x,
            y + i,
            z,
            "wood",
            3,
            Time.now(),
            0
        );

    }

    const top =
        y + height;

    for (
        let dx = -2;
        dx <= 2;
        dx++
    ) {

        for (
            let dz = -2;
            dz <= 2;
            dz++
        ) {

            for (
                let dy = -2;
                dy <= 1;
                dy++
            ) {

                if (
                    Math.abs(dx) +
                    Math.abs(dz) <= 3
                ) {

                    createWorldBlock(
                        x + dx,
                        top + dy,
                        z + dz,
                        "leaves",
                        3,
                        Time.now(),
                        0
                    );

                }

            }

        }

    }
}


// =====================================
// INFINITE CHUNK
// =====================================

export function generateChunk(
    chunkX,
    chunkZ
) {

    const id =
        getChunkId(
            chunkX,
            chunkZ
        );

    if (
        World.chunks.has(id)
    ) {
        return;
    }

    World.chunks.set(
        id,
        true
    );

    const startX =
        chunkX * CHUNK_SIZE;

    const startZ =
        chunkZ * CHUNK_SIZE;

    for (
        let lx = 0;
        lx < CHUNK_SIZE;
        lx++
    ) {

        for (
            let lz = 0;
            lz < CHUNK_SIZE;
            lz++
        ) {

            const x =
                startX + lx;

            const z =
                startZ + lz;

            const height =
                terrainHeight(
                    x,
                    z
                );

            for (
                let y = -4;
                y <= height;
                y++
            ) {

                let type = "stone";

                if (
                    y === height
                ) {

                    type = "grass";

                } else if (
                    y >= height - 3
                ) {

                    type = "dirt";
                }

                createWorldBlock(
                    x,
                    y,
                    z,
                    type,
                    3,
                    Time.now(),
                    0
                );
            }

            if (
                seededRandom(x, z) <
                0.018 &&
                height > 3
            ) {

                generateTree(
                    x,
                    height + 1,
                    z
                );
            }
        }
    }


    // =================================
    // 4D TEST STRUCTURES
    // =================================

    if (
        Math.abs(chunkX) <= 2 &&
        Math.abs(chunkZ) <= 2
    ) {

        generate4DStructure(
            startX + 8,
            12,
            startZ + 8
        );

    }

}


// =====================================
// 4D HYPERCUBE-LIKE BLOCK STRUCTURE
// =====================================

function generate4DStructure(
    centerX,
    centerY,
    centerZ
) {

    const size = 3;

    for (
        let x = -size;
        x <= size;
        x++
    ) {

        for (
            let y = -size;
            y <= size;
            y++
        ) {

            for (
                let z = -size;
                z <= size;
                z++
            ) {

                const edge =
                    Math.abs(x) === size ||
                    Math.abs(y) === size ||
                    Math.abs(z) === size;

                if (!edge) {
                    continue;
                }

                // Two W-slices.
                for (
                    const w of [-2, 2]
                ) {

                    createWorldBlock(
                        centerX + x,
                        centerY + y,
                        centerZ + z,
                        "purple",
                        4,
                        Time.now(),
                        w
                    );

                }
            }
        }
    }
}


// =====================================
// LOAD CHUNKS
// =====================================

export function loadChunksAround(
    playerX,
    playerZ
) {

    const center =
        worldToChunk(
            playerX,
            playerZ
        );

    for (
        let x = -RENDER_DISTANCE;
        x <= RENDER_DISTANCE;
        x++
    ) {

        for (
            let z = -RENDER_DISTANCE;
            z <= RENDER_DISTANCE;
            z++
        ) {

            generateChunk(
                center.x + x,
                center.z + z
            );

        }
    }
}


// =====================================
// ACTIVE BLOCK
// =====================================

export function isBlockActive(
    block,
    dimension =
        Dimensions.current,
    time =
        Time.now()
) {

    if (!block) {
        return false;
    }

    const allowed =
        Dimensions.affects[
            dimension
        ];

    if (
        !allowed.includes(
            block.dimension
        )
    ) {
        return false;
    }

    if (
        block.createdAt > time
    ) {
        return false;
    }

    if (
        block.removedAt !== null &&
        block.removedAt <= time
    ) {
        return false;
    }

    return true;
}


// =====================================
// ACTIVE BLOCKS
// =====================================

export function getActiveBlocks(
    dimension =
        Dimensions.current,
    time =
        Time.now()
) {

    const result = [];

    for (
        const block
        of World.blocks.values()
    ) {

        if (
            isBlockActive(
                block,
                dimension,
                time
            )
        ) {

            result.push(block);
        }
    }

    return result;
}


// =====================================
// HISTORY
// =====================================

function recordChange(
    action,
    block
) {

    const time =
        Time.now();

    if (
        !World.history.has(time)
    ) {

        World.history.set(
            time,
            []
        );
    }

    World.history
        .get(time)
        .push({

            action,

            block: {
                ...block
            }

        });
}


// =====================================
// TIME SNAPSHOT
// =====================================

export function getTimeSnapshot(
    time
) {

    const snapshot = [];

    for (
        const block
        of World.blocks.values()
    ) {

        if (
            block.createdAt <= time &&
            (
                block.removedAt === null ||
                block.removedAt > time
            )
        ) {

            snapshot.push({
                ...block
            });
        }
    }

    return snapshot;
}


// =====================================
// TIME TRAVEL
// =====================================

export function travelToTime(
    targetTime
) {

    Time.set(
        targetTime
    );

    return getTimeSnapshot(
        targetTime
    );
}


// =====================================
// DIMENSION CHANGES
// =====================================

export function recordDimensionChange(
    sourceDimension,
    targetDimension,
    change
) {

    if (
        !World.dimensionChanges
            .has(sourceDimension)
    ) {

        World.dimensionChanges.set(
            sourceDimension,
            []
        );
    }

    World.dimensionChanges
        .get(sourceDimension)
        .push({

            sourceDimension,

            targetDimension,

            time:
                Time.now(),

            change

        });
}


// =====================================
// HIGHER → LOWER
// =====================================

export function affectLowerDimension(
    sourceDimension,
    targetDimension,
    change
) {

    if (
        sourceDimension <
        targetDimension
    ) {

        return false;
    }

    recordDimensionChange(
        sourceDimension,
        targetDimension,
        change
    );

    return true;
}


// =====================================
// RESET
// =====================================

export function resetWorld() {

    World.blocks.clear();

    World.history.clear();

    World.futureChanges.clear();

    World.dimensionChanges.clear();

    World.chunks.clear();

    World.time = 0;

    Dimensions.current = 3;
}


// =====================================
// INFORMATION
// =====================================

export function getWorldInfo() {

    return {

        dimension:
            Dimensions.current,

        dimensionName:
            Dimensions.names[
                Dimensions.current
            ],

        time:
            Time.now(),

        blocks:
            World.blocks.size,

        chunks:
            World.chunks.size,

        history:
            World.history.size

    };
}


// =====================================
// DEBUG
// =====================================

export function debugWorld() {

    console.log(
        "=============================="
    );

    console.log(
        "3D SANDBOX V1.9A"
    );

    console.log(
        "Dimension:",
        Dimensions.current
    );

    console.log(
        "Time:",
        Time.now()
    );

    console.log(
        "Blocks:",
        World.blocks.size
    );

    console.log(
        "Chunks:",
        World.chunks.size
    );

    console.log(
        "=============================="
    );
}

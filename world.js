// =====================================
// 3D SANDBOX
// V1.8 INFINITE WORLD ENGINE
// =====================================

export const World = {

    dimension: 3,

    time: 0,

    timeSpeed: 1,

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

    PAST: -1,

    PRESENT: 0,

    FUTURE: 1,

    current: 0,

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

        World.time -= 10;

        return World.time;

    },

    goFuture() {

        World.time += 10;

        return World.time;

    },

    goPresent() {

        World.time = 0;

        return World.time;

    }

};


// =====================================
// CHUNK SETTINGS
// =====================================

export const CHUNK_SIZE = 16;

export const RENDER_DISTANCE = 5;


// =====================================
// CHUNK ID
// =====================================

export function getChunkId(
    chunkX,
    chunkZ
) {

    return `${chunkX},${chunkZ}`;

}


// =====================================
// BLOCK ID
// =====================================

export function getBlockId(
    x,
    y,
    z
) {

    return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;

}


// =====================================
// WORLD → CHUNK
// =====================================

export function worldToChunk(
    x,
    z
) {

    return {

        x: Math.floor(
            x / CHUNK_SIZE
        ),

        z: Math.floor(
            z / CHUNK_SIZE
        )

    };

}


// =====================================
// DETERMINISTIC RANDOM
// =====================================

function seededRandom(
    x,
    z
) {

    let value =
        Math.sin(
            x * 127.1 +
            z * 311.7
        ) *
        43758.5453123;

    return value -
        Math.floor(value);

}


// =====================================
// TERRAIN HEIGHT
// =====================================

function terrainHeight(
    x,
    z
) {

    const large =
        Math.sin(
            x * 0.025
        ) * 7 +

        Math.cos(
            z * 0.03
        ) * 6;

    const medium =
        Math.sin(
            (x + z) * 0.08
        ) * 2;

    const small =
        Math.sin(
            x * 0.2
        ) *
        Math.cos(
            z * 0.2
        );

    return Math.max(
        1,
        Math.floor(
            5 +
            large +
            medium +
            small
        )
    );

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
    time = Time.now()
) {

    const id =
        getBlockId(
            x,
            y,
            z
        );

    const block = {

        id,

        x: Math.round(x),

        y: Math.round(y),

        z: Math.round(z),

        type,

        dimension,

        createdAt: time,

        removedAt: null

    };

    World.blocks.set(
        id,
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
    z
) {

    const id =
        getBlockId(
            x,
            y,
            z
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
    z
) {

    return World.blocks.get(
        getBlockId(
            x,
            y,
            z
        )
    );

}


// =====================================
// GENERATE CHUNK
// =====================================

export function generateChunk(
    chunkX,
    chunkZ
) {

    const chunkId =
        getChunkId(
            chunkX,
            chunkZ
        );

    if (
        World.chunks.has(
            chunkId
        )
    ) {

        return;

    }

    World.chunks.set(
        chunkId,
        true
    );

    const startX =
        chunkX *
        CHUNK_SIZE;

    const startZ =
        chunkZ *
        CHUNK_SIZE;


    for (
        let localX = 0;
        localX < CHUNK_SIZE;
        localX++
    ) {

        for (
            let localZ = 0;
            localZ < CHUNK_SIZE;
            localZ++
        ) {

            const x =
                startX +
                localX;

            const z =
                startZ +
                localZ;

            const height =
                terrainHeight(
                    x,
                    z
                );


            // =============================
            // TERRAIN
            // =============================

            for (
                let y = -4;
                y <= height;
                y++
            ) {

                let type =
                    "stone";


                if (
                    y === height
                ) {

                    type =
                        "grass";

                } else if (
                    y >= height - 3
                ) {

                    type =
                        "dirt";

                }


                createWorldBlock(
                    x,
                    y,
                    z,
                    type,
                    3
                );

            }


            // =============================
            // TREES
            // =============================

            const treeChance =
                seededRandom(
                    x,
                    z
                );


            if (
                treeChance < 0.018 &&
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

}


// =====================================
// TREE
// =====================================

function generateTree(
    x,
    y,
    z
) {

    const trunkHeight =
        4 +
        Math.floor(
            seededRandom(
                x + 50,
                z + 50
            ) * 3
        );


    for (
        let i = 0;
        i < trunkHeight;
        i++
    ) {

        createWorldBlock(
            x,
            y + i,
            z,
            "wood",
            3
        );

    }


    const top =
        y +
        trunkHeight;


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
                    Math.abs(dz) <=
                    3
                ) {

                    createWorldBlock(
                        x + dx,
                        top + dy,
                        z + dz,
                        "leaves",
                        3
                    );

                }

            }

        }

    }

}


// =====================================
// LOAD WORLD AROUND PLAYER
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
// ACTIVE BLOCKS
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
// GET ACTIVE BLOCKS
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

            result.push(
                block
            );

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
        !World.history.has(
            time
        )
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
// DIMENSION EFFECTS
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

            targetDimension,

            time:
                Time.now(),

            change

        });

}


// =====================================
// HIGHER DIMENSION → LOWER
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
// WORLD RESET
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
// WORLD INFO
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
        "3D SANDBOX V1.8"
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

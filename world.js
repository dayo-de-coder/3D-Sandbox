// =====================================
// 3D SANDBOX - WORLD ENGINE
// V1.7
// =====================================

// This file controls:
// - The shared world
// - Dimensions
// - Time
// - Block history
// - Changes caused by higher dimensions
//
// game.js will use this system for
// physics, rendering, and interaction.

// =====================================
// WORLD STATE
// =====================================

export const World = {

    dimension: 3,

    time: 0,

    timeSpeed: 1,

    blocks: new Map(),

    history: new Map(),

    futureChanges: new Map(),

    dimensionChanges: new Map()

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

    // Higher dimensions can affect
    // lower dimensions.

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

    // Every change receives a timestamp.

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

    // Record the creation.

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

    const id =
        getBlockId(
            x,
            y,
            z
        );

    return World.blocks.get(
        id
    );
}

// =====================================
// IS BLOCK VISIBLE?
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

    // A dimension can see its own
    // dimension and lower dimensions.

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

    // Time rules.

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
// CHANGE HISTORY
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

            targetDimension,

            time:
                Time.now(),

            change

        });
}

// =====================================
// APPLY HIGHER-DIMENSION EFFECT
// =====================================

export function affectLowerDimension(
    sourceDimension,
    targetDimension,
    change
) {

    // A dimension cannot change a
    // higher dimension.

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

    World.time = 0;

    Dimensions.current = 3;
}

// =====================================
// WORLD INFORMATION
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
        "3D SANDBOX WORLD"
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
        "=============================="
    );

}

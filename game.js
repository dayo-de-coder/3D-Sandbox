import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import {
    World,
    Dimensions,
    Time,
    createWorldBlock,
    removeWorldBlock,
    getWorldBlock,
    getActiveBlocks,
    travelToTime,
    affectLowerDimension
} from "./world.js";

// =====================================
// SETUP
// =====================================

const game =
    document.getElementById("game");

const dimensionDisplay =
    document.getElementById("dimension");

const message =
    document.getElementById("message");

const scene =
    new THREE.Scene();

const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.1,
        500
    );

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

game.appendChild(
    renderer.domElement
);

// =====================================
// LIGHT
// =====================================

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

sun.position.set(
    30,
    50,
    20
);

scene.add(sun);

scene.add(
    new THREE.HemisphereLight(
        0xffffff,
        0x667788,
        1
    )
);

// =====================================
// BLOCK MATERIALS
// =====================================

const materials = {

    grass:
        new THREE.MeshStandardMaterial({
            color: 0x4caf50
        }),

    dirt:
        new THREE.MeshStandardMaterial({
            color: 0x795548
        }),

    stone:
        new THREE.MeshStandardMaterial({
            color: 0x888888
        }),

    wood:
        new THREE.MeshStandardMaterial({
            color: 0x8b5a2b
        }),

    leaves:
        new THREE.MeshStandardMaterial({
            color: 0x2e7d32
        }),

    sand:
        new THREE.MeshStandardMaterial({
            color: 0xd9c27c
        }),

    purple:
        new THREE.MeshStandardMaterial({
            color: 0x8b5cf6
        }),

    pink:
        new THREE.MeshStandardMaterial({
            color: 0xec4899
        }),

    orange:
        new THREE.MeshStandardMaterial({
            color: 0xffa500
        })
};

const blockGeometry =
    new THREE.BoxGeometry(
        1,
        1,
        1
    );

// =====================================
// RENDERED BLOCKS
// =====================================

const renderedBlocks =
    new Map();

function materialFor(
    type
) {

    return materials[type] ||
        materials.stone;
}

function renderWorld() {

    const active =
        getActiveBlocks(
            Dimensions.current,
            Time.now()
        );

    const activeIds =
        new Set(
            active.map(
                block => block.id
            )
        );

    // Remove blocks that should
    // no longer be visible.

    for (
        const [
            id,
            mesh
        ]
        of renderedBlocks
    ) {

        if (
            !activeIds.has(id)
        ) {

            scene.remove(
                mesh
            );

            renderedBlocks.delete(
                id
            );
        }
    }

    // Add/update visible blocks.

    for (
        const block
        of active
    ) {

        let mesh =
            renderedBlocks.get(
                block.id
            );

        if (!mesh) {

            mesh =
                new THREE.Mesh(
                    blockGeometry,
                    materialFor(
                        block.type
                    )
                );

            mesh.userData.blockId =
                block.id;

            scene.add(
                mesh
            );

            renderedBlocks.set(
                block.id,
                mesh
            );
        }

        mesh.position.set(
            block.x,
            block.y,
            block.z
        );
    }
}

// =====================================
// GENERATE WORLD
// =====================================

function terrainHeight(
    x,
    z
) {

    return Math.max(
        0,
        Math.floor(
            3 +
            Math.sin(
                x * 0.45
            ) * 1.5 +
            Math.cos(
                z * 0.35
            ) * 1.5 +
            Math.sin(
                (x + z) * 0.2
            )
        )
    );
}

function addTree(
    x,
    y,
    z
) {

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        createWorldBlock(
            x,
            y + i,
            z,
            "wood"
        );
    }

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
                let dy = 2;
                dy <= 4;
                dy++
            ) {

                if (
                    Math.abs(dx) +
                    Math.abs(dz) <
                    4
                ) {

                    createWorldBlock(
                        x + dx,
                        y + dy,
                        z + dz,
                        "leaves"
                    );
                }
            }
        }
    }
}

function generateWorld() {

    const size = 24;

    for (
        let x = -size;
        x <= size;
        x++
    ) {

        for (
            let z = -size;
            z <= size;
            z++
        ) {

            const height =
                terrainHeight(
                    x,
                    z
                );

            for (
                let y = -3;
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
                    y > height - 3
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

            if (
                Math.random() < 0.035 &&
                height > 2 &&
                Math.abs(x) > 3 &&
                Math.abs(z) > 3
            ) {

                addTree(
                    x,
                    height + 1,
                    z
                );
            }
        }
    }

    // Special higher-dimensional blocks.

    for (
        let x = -3;
        x <= 3;
        x++
    ) {

        createWorldBlock(
            x,
            4,
            -8,
            "purple",
            4
        );

        createWorldBlock(
            x,
            4,
            -10,
            "pink",
            5
        );

        createWorldBlock(
            x,
            4,
            -12,
            "orange",
            6
        );
    }

    renderWorld();
}

if (
    World.blocks.size === 0
) {

    generateWorld();

} else {

    renderWorld();
}

// =====================================
// DIMENSION SYSTEM
// =====================================

const dimensionColors = {

    1: 0x202020,

    2: 0x3575d3,

    3: 0x87ceeb,

    4: 0x6c35de,

    5: 0xd62976,

    6: 0xff9f00

};

let warpActive = false;

let warpProgress = 0;

let warpFrom = 3;

let warpTo = 3;

function setDimension(
    dimension
) {

    if (
        dimension < 1 ||
        dimension > 6
    ) {
        return;
    }

    if (
        dimension ===
        Dimensions.current
    ) {
        return;
    }

    warpFrom =
        Dimensions.current;

    warpTo =
        dimension;

    if (
        dimension >= 4
    ) {

        startWarp();

    } else {

        Dimensions.current =
            dimension;

        World.dimension =
            dimension;

        finishDimensionChange();
    }
}

function finishDimensionChange() {

    scene.background =
        new THREE.Color(
            dimensionColors[
                Dimensions.current
            ]
        );

    dimensionDisplay.textContent =
        `${Dimensions.current}D`;

    renderWorld();

    updateVision();

    message.textContent =
        `Entered ${Dimensions.current}D`;
}

// =====================================
// WARP EFFECT
// =====================================

function startWarp() {

    warpActive = true;

    warpProgress = 0;

    message.textContent =
        `Warping ${warpFrom}D → ${warpTo}D...`;
}

function updateWarp(
    delta
) {

    if (!warpActive) {
        return;
    }

    warpProgress +=
        delta * 1.8;

    const amount =
        Math.min(
            warpProgress,
            1
        );

    // Distort camera FOV.

    camera.fov =
        75 +
        Math.sin(
            amount *
            Math.PI *
            8
        ) *
        25 *
        (1 - amount);

    camera.updateProjectionMatrix();

    // Spin during warp.

    camera.rotation.z =
        Math.sin(
            amount *
            Math.PI *
            10
        ) *
        0.08;

    if (
        warpProgress >= 1
    ) {

        warpActive =
            false;

        Dimensions.current =
            warpTo;

        World.dimension =
            warpTo;

        camera.rotation.z =
            0;

        camera.fov =
            75;

        camera.updateProjectionMatrix();

        finishDimensionChange();
    }
}

// =====================================
// DIMENSION BUTTONS
// =====================================

const dimensionMenu =
    document.createElement(
        "div"
    );

dimensionMenu.id =
    "dimensionMenu";

for (
    let i = 1;
    i <= 6;
    i++
) {

    const button =
        document.createElement(
            "button"
        );

    button.textContent =
        `${i}D`;

    button.onclick =
        event => {

            event.stopPropagation();

            setDimension(i);
        };

    dimensionMenu.appendChild(
        button
    );
}

document.body.appendChild(
    dimensionMenu
);

// =====================================
// VISION
// =====================================

function updateVision() {

    const dimension =
        Dimensions.current;

    // 1D

    if (
        dimension === 1
    ) {

        camera.fov = 25;

    // 2D

    } else if (
        dimension === 2
    ) {

        camera.fov = 45;

    // 3D

    } else if (
        dimension === 3
    ) {

        camera.fov = 75;

    // 4D

    } else if (
        dimension === 4
    ) {

        camera.fov = 90;

    // 5D

    } else if (
        dimension === 5
    ) {

        camera.fov = 105;

    // 6D

    } else if (
        dimension === 6
    ) {

        camera.fov = 120;
    }

    camera.updateProjectionMatrix();
}

// =====================================
// PLAYER
// =====================================

const player = {

    position:
        new THREE.Vector3(
            0,
            8,
            5
        ),

    velocity:
        new THREE.Vector3(),

    width: 0.6,

    height: 1.8,

    depth: 0.6,

    speed: 6,

    jumpPower: 8,

    gravity: 22,

    grounded: false
};

// =====================================
// COLLISION
// =====================================

function collidesAt(
    position
) {

    const blocks =
        getActiveBlocks(
            Dimensions.current,
            Time.now()
        );

    const minX =
        position.x -
        player.width / 2;

    const maxX =
        position.x +
        player.width / 2;

    const minY =
        position.y - 1.5;

    const maxY =
        position.y + 0.3;

    const minZ =
        position.z -
        player.depth / 2;

    const maxZ =
        position.z +
        player.depth / 2;

    for (
        const block
        of blocks
    ) {

        if (
            maxX > block.x - 0.5 &&
            minX < block.x + 0.5 &&
            maxY > block.y - 0.5 &&
            minY < block.y + 0.5 &&
            maxZ > block.z - 0.5 &&
            minZ < block.z + 0.5
        ) {

            return true;
        }
    }

    return false;
}

// =====================================
// INPUT
// =====================================

const keys = {};

window.addEventListener(
    "keydown",
    event => {

        keys[event.code] =
            true;

        // 1D-6D

        if (
            event.code.startsWith(
                "Digit"
            )
        ) {

            const number =
                Number(
                    event.code.replace(
                        "Digit",
                        ""
                    )
                );

            if (
                number >= 1 &&
                number <= 6
            ) {

                setDimension(
                    number
                );
            }
        }

        // TIME TRAVEL

        if (
            event.code ===
            "KeyQ"
        ) {

            Time.goPast();

            message.textContent =
                `⏪ Time: ${Time.now()}`;

            renderWorld();
        }

        if (
            event.code ===
            "KeyE"
        ) {

            Time.goFuture();

            message.textContent =
                `⏩ Time: ${Time.now()}`;

            renderWorld();
        }

        if (
            event.code ===
            "KeyR"
        ) {

            Time.goPresent();

            message.textContent =
                "⏺ Returned to present";

            renderWorld();
        }

        // JUMP

        if (
            event.code ===
            "Space" &&
            player.grounded
        ) {

            player.velocity.y =
                player.jumpPower;

            player.grounded =
                false;
        }

        // CAMERA

        if (
            event.code ===
            "KeyV" &&
            !event.shiftKey
        ) {

            cycleCamera(1);
        }

        if (
            event.code ===
            "KeyV" &&
            event.shiftKey
        ) {

            cycleCamera(-1);
        }
    }
);

window.addEventListener(
    "keyup",
    event => {

        keys[event.code] =
            false;
    }
);

// =====================================
// CAMERA
// =====================================

const cameraModes = [
    "FIRST",
    "THIRD",
    "FIFTH"
];

let cameraMode = 0;

function cycleCamera(
    direction
) {

    cameraMode +=
        direction;

    if (
        cameraMode < 0
    ) {

        cameraMode =
            cameraModes.length - 1;
    }

    if (
        cameraMode >=
        cameraModes.length
    ) {

        cameraMode = 0;
    }

    message.textContent =
        `Camera: ${cameraModes[cameraMode]}`;
}

// =====================================
// MOUSE LOOK
// =====================================

let yaw = 0;

let pitch = 0;

document.body.addEventListener(
    "click",
    event => {

        if (
            event.target.closest(
                "#dimensionMenu"
            )
        ) {
            return;
        }

        document.body.requestPointerLock();
    }
);

document.addEventListener(
    "mousemove",
    event => {

        if (
            document.pointerLockElement !==
            document.body
        ) {
            return;
        }

        yaw -=
            event.movementX *
            0.002;

        pitch -=
            event.movementY *
            0.002;

        pitch =
            Math.max(
                -1.4,
                Math.min(
                    1.4,
                    pitch
                )
            );
    }
);

// =====================================
// MOVEMENT
// =====================================

function moveAxis(
    axis,
    amount
) {

    const steps =
        Math.max(
            1,
            Math.ceil(
                Math.abs(amount) /
                0.1
            )
        );

    const step =
        amount / steps;

    for (
        let i = 0;
        i < steps;
        i++
    ) {

        const test =
            player.position.clone();

        test[axis] +=
            step;

        if (
            !collidesAt(test)
        ) {

            player.position[
                axis
            ] += step;

        } else {

            player.velocity[
                axis
            ] = 0;

            break;
        }
    }
}

function movePlayer(
    delta
) {

    const direction =
        new THREE.Vector3();

    if (
        keys["KeyW"]
    ) {
        direction.z -= 1;
    }

    if (
        keys["KeyS"]
    ) {
        direction.z += 1;
    }

    if (
        keys["KeyA"]
    ) {
        direction.x -= 1;
    }

    if (
        keys["KeyD"]
    ) {
        direction.x += 1;
    }

    if (
        direction.length() > 0
    ) {

        direction.normalize();

        direction.applyAxisAngle(
            new THREE.Vector3(
                0,
                1,
                0
            ),
            yaw
        );

        moveAxis(
            "x",
            direction.x *
            player.speed *
            delta
        );

        moveAxis(
            "z",
            direction.z *
            player.speed *
            delta
        );
    }

    player.velocity.y -=
        player.gravity *
        delta;

    moveAxis(
        "y",
        player.velocity.y *
        delta
    );

    const below =
        player.position.clone();

    below.y -= 0.05;

    player.grounded =
        collidesAt(
            below
        );

    if (
        player.grounded
    ) {

        player.velocity.y =
            0;
    }
}

// =====================================
// BLOCK INTERACTION
// =====================================

const raycaster =
    new THREE.Raycaster();

const center =
    new THREE.Vector2(
        0,
        0
    );

document.addEventListener(
    "mousedown",
    event => {

        if (
            document.pointerLockElement !==
            document.body
        ) {
            return;
        }

        raycaster.setFromCamera(
            center,
            camera
        );

        const hits =
            raycaster.intersectObjects(
                [
                    ...renderedBlocks.values()
                ]
            );

        if (
            hits.length === 0
        ) {
            return;
        }

        const mesh =
            hits[0].object;

        const id =
            mesh.userData.blockId;

        const block =
            World.blocks.get(id);

        if (!block) {
            return;
        }

        // LEFT CLICK = BREAK

        if (
            event.button === 0
        ) {

            removeWorldBlock(
                block.x,
                block.y,
                block.z
            );

            // 4D+ can affect 3D.

            if (
                Dimensions.current >=
                4
            ) {

                affectLowerDimension(
                    Dimensions.current,
                    3,
                    {
                        type: "BLOCK_REMOVED",
                        x: block.x,
                        y: block.y,
                        z: block.z
                    }
                );
            }

            renderWorld();

            message.textContent =
                "⛏️ Block broken!";
        }

        // RIGHT CLICK = PLACE

        if (
            event.button === 2 &&
            hits[0].face
        ) {

            const normal =
                hits[0].face.normal;

            const x =
                Math.round(
                    block.x +
                    normal.x
                );

            const y =
                Math.round(
                    block.y +
                    normal.y
                );

            const z =
                Math.round(
                    block.z +
                    normal.z
                );

            const existing =
                getWorldBlock(
                    x,
                    y,
                    z
                );

            if (!existing) {

                createWorldBlock(
                    x,
                    y,
                    z,
                    "stone",
                    Dimensions.current
                );

                renderWorld();

                message.textContent =
                    "🧱 Block placed!";
            }
        }
    }
);

document.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();
    }
);

// =====================================
// CAMERA UPDATE
// =====================================

function updateCamera() {

    if (
        cameraMode === 0
    ) {

        camera.position.copy(
            player.position
        );

        camera.position.y +=
            0.25;

        camera.rotation.order =
            "YXZ";

        camera.rotation.y =
            yaw;

        camera.rotation.x =
            pitch;

    } else {

        const distance =
            cameraMode === 1
                ? 5
                : 12;

        const offset =
            new THREE.Vector3(
                0,
                2.5,
                distance
            );

        offset.applyAxisAngle(
            new THREE.Vector3(
                0,
                1,
                0
            ),
            yaw
        );

        camera.position.copy(
            player.position
        );

        camera.position.add(
            offset
        );

        camera.lookAt(
            player.position
        );
    }
}

// =====================================
// GAME LOOP
// =====================================

let previousTime =
    performance.now();

function animate() {

    requestAnimationFrame(
        animate
    );

    const now =
        performance.now();

    const delta =
        Math.min(
            (now -
                previousTime) /
                1000,
            0.05
        );

    previousTime =
        now;

    movePlayer(
        delta
    );

    updateWarp(
        delta
    );

    updateCamera();

    renderer.render(
        scene,
        camera
    );
}

// =====================================
// START
// =====================================

dimensionDisplay.textContent =
    "3D";

scene.background =
    new THREE.Color(
        dimensionColors[3]
    );

animate();

// =====================================
// RESIZE
// =====================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);

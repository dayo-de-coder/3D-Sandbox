import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// =====================================
// SETUP
// =====================================

const game = document.getElementById("game");

const dimensionDisplay =
    document.getElementById("dimension");

const message =
    document.getElementById("message");

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x87ceeb);

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
// LIGHTING
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

// =====================================
// BLOCK SYSTEM
// =====================================

const blockGeometry =
    new THREE.BoxGeometry(
        1,
        1,
        1
    );

const blocks = [];

const blockMap =
    new Map();

function blockKey(
    x,
    y,
    z
) {
    return `${x},${y},${z}`;
}

function addBlock(
    x,
    y,
    z,
    material,
    dimension = 0
) {

    const key =
        blockKey(x, y, z);

    if (
        blockMap.has(key)
    ) {
        return;
    }

    const block =
        new THREE.Mesh(
            blockGeometry,
            material
        );

    block.position.set(
        x,
        y,
        z
    );

    block.userData.dimension =
        dimension;

    block.userData.isBlock =
        true;

    scene.add(block);

    blocks.push(block);

    blockMap.set(
        key,
        block
    );

    updateBlockVisibility();

    return block;
}

function removeBlock(block) {

    const x =
        Math.round(
            block.position.x
        );

    const y =
        Math.round(
            block.position.y
        );

    const z =
        Math.round(
            block.position.z
        );

    blockMap.delete(
        blockKey(x, y, z)
    );

    const index =
        blocks.indexOf(block);

    if (index !== -1) {
        blocks.splice(
            index,
            1
        );
    }

    scene.remove(
        block
    );
}

// =====================================
// TERRAIN
// =====================================

function terrainHeight(
    x,
    z
) {

    const value =
        Math.sin(x * 0.45) * 1.5 +
        Math.cos(z * 0.35) * 1.5 +
        Math.sin(
            (x + z) * 0.2
        );

    return Math.max(
        0,
        Math.floor(
            3 + value
        )
    );
}

function createTree(
    x,
    y,
    z
) {

    // Trunk

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        addBlock(
            x,
            y + i,
            z,
            materials.wood
        );
    }

    // Leaves

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

                    addBlock(
                        x + dx,
                        y + dy,
                        z + dz,
                        materials.leaves
                    );
                }
            }
        }
    }
}

function createWorld() {

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

                let material =
                    materials.stone;

                if (
                    y === height
                ) {

                    material =
                        materials.grass;

                } else if (
                    y > height - 3
                ) {

                    material =
                        materials.dirt;
                }

                addBlock(
                    x,
                    y,
                    z,
                    material
                );
            }

            // Random trees

            if (
                Math.random() < 0.035 &&
                height > 2 &&
                Math.abs(x) > 3 &&
                Math.abs(z) > 3
            ) {

                createTree(
                    x,
                    height + 1,
                    z
                );
            }
        }
    }

    // Dimension blocks

    for (
        let x = -3;
        x <= 3;
        x++
    ) {

        addBlock(
            x,
            4,
            -8,
            materials.purple,
            4
        );

        addBlock(
            x,
            4,
            -10,
            materials.pink,
            5
        );

        addBlock(
            x,
            4,
            -12,
            materials.orange,
            6
        );
    }
}

createWorld();

// =====================================
// DIMENSIONS
// =====================================

let currentDimension = 3;

const dimensionColors = {

    1: 0x202020,
    2: 0x3575d3,
    3: 0x87ceeb,
    4: 0x6c35de,
    5: 0xd62976,
    6: 0xff9f00
};

function updateBlockVisibility() {

    for (
        const block of blocks
    ) {

        const dimension =
            block.userData.dimension;

        block.visible =
            dimension === 0 ||
            dimension ===
            currentDimension;
    }
}

function switchDimension(
    dimension
) {

    currentDimension =
        dimension;

    scene.background =
        new THREE.Color(
            dimensionColors[
                dimension
            ]
        );

    dimensionDisplay.textContent =
        `${dimension}D`;

    updateBlockVisibility();

    message.textContent =
        `Warped into ${dimension}D!`;
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

    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            switchDimension(
                i
            );
        }
    );

    dimensionMenu.appendChild(
        button
    );
}

document.body.appendChild(
    dimensionMenu
);

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

    const minX =
        position.x -
        player.width / 2;

    const maxX =
        position.x +
        player.width / 2;

    const minY =
        position.y -
        1.5;

    const maxY =
        position.y +
        0.3;

    const minZ =
        position.z -
        player.depth / 2;

    const maxZ =
        position.z +
        player.depth / 2;

    const startX =
        Math.floor(
            minX - 0.5
        );

    const endX =
        Math.floor(
            maxX + 0.5
        );

    const startY =
        Math.floor(
            minY - 0.5
        );

    const endY =
        Math.floor(
            maxY + 0.5
        );

    const startZ =
        Math.floor(
            minZ - 0.5
        );

    const endZ =
        Math.floor(
            maxZ + 0.5
        );

    for (
        let x = startX;
        x <= endX;
        x++
    ) {

        for (
            let y = startY;
            y <= endY;
            y++
        ) {

            for (
                let z = startZ;
                z <= endZ;
                z++
            ) {

                const block =
                    blockMap.get(
                        blockKey(
                            x,
                            y,
                            z
                        )
                    );

                if (
                    !block ||
                    !block.visible
                ) {
                    continue;
                }

                if (
                    maxX > x - 0.5 &&
                    minX < x + 0.5 &&
                    maxY > y - 0.5 &&
                    minY < y + 0.5 &&
                    maxZ > z - 0.5 &&
                    minZ < z + 0.5
                ) {

                    return true;
                }
            }
        }
    }

    return false;
}

// =====================================
// MOVEMENT
// =====================================

const keys = {};

window.addEventListener(
    "keydown",
    event => {

        keys[event.code] =
            true;

        // Dimension keys

        if (
            event.code >=
            "Digit1" &&
            event.code <=
            "Digit6"
        ) {

            const dimension =
                Number(
                    event.code.replace(
                        "Digit",
                        ""
                    )
                );

            switchDimension(
                dimension
            );
        }

        // Jump

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

        // Camera forward

        if (
            event.code ===
            "KeyV" &&
            !event.shiftKey
        ) {

            cycleCamera(
                1
            );
        }

        // Camera backwards

        if (
            event.code ===
            "KeyV" &&
            event.shiftKey
        ) {

            cycleCamera(
                -1
            );
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
// CAMERA MODES
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

        if (
            document.pointerLockElement !==
            document.body
        ) {

            document.body.requestPointerLock();
        }
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
// PLAYER MOVEMENT WITH COLLISION
// =====================================

function moveAxis(
    axis,
    amount
) {

    const steps =
        Math.ceil(
            Math.abs(amount) /
            0.1
        );

    const step =
        amount /
        Math.max(
            steps,
            1
        );

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

    // Gravity

    player.velocity.y -=
        player.gravity *
        delta;

    moveAxis(
        "y",
        player.velocity.y *
        delta
    );

    // Check if standing

    const below =
        player.position.clone();

    below.y -= 0.05;

    if (
        collidesAt(below)
    ) {

        player.grounded =
            true;

        player.velocity.y =
            0;

    } else {

        player.grounded =
            false;
    }
}

// =====================================
// BLOCK BREAK / PLACE
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

        const visibleBlocks =
            blocks.filter(
                block =>
                    block.visible
            );

        const hits =
            raycaster.intersectObjects(
                visibleBlocks
            );

        if (
            hits.length === 0
        ) {
            return;
        }

        const hit =
            hits[0];

        const block =
            hit.object;

        // Left = break

        if (
            event.button === 0
        ) {

            removeBlock(
                block
            );

            message.textContent =
                "⛏️ Block broken!";
        }

        // Right = place

        if (
            event.button === 2
        ) {

            if (
                !hit.face
            ) {
                return;
            }

            const normal =
                hit.face.normal.clone();

            const position =
                block.position.clone();

            position.add(
                normal
            );

            // Don't place a block
            // inside the player.

            const testPosition =
                position.clone();

            if (
                !collidesAt(
                    player.position
                )
            ) {

                addBlock(
                    Math.round(
                        testPosition.x
                    ),
                    Math.round(
                        testPosition.y
                    ),
                    Math.round(
                        testPosition.z
                    ),
                    materials.stone,
                    0
                );

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

        // FIRST PERSON

        camera.position.copy(
            player.position
        );

        camera.position.y +=
            0.25;

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
    }

    camera.rotation.order =
        "YXZ";

    if (
        cameraMode === 0
    ) {

        camera.rotation.y =
            yaw;

        camera.rotation.x =
            pitch;

    } else {

        camera.lookAt(
            player.position
        );
    }
}

// =====================================
// LOOP
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

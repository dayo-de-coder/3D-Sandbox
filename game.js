import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// =====================================
// SETUP
// =====================================

const game = document.getElementById("game");
const dimensionDisplay = document.getElementById("dimension");
const message = document.getElementById("message");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

game.appendChild(renderer.domElement);

// =====================================
// DIMENSIONS
// =====================================

let currentDimension = 3;

const dimensionNames = {
    1: "1D",
    2: "2D",
    3: "3D",
    4: "4D",
    5: "5D",
    6: "6D"
};

const dimensionColors = {
    1: 0x222222,
    2: 0x3b82f6,
    3: 0x87ceeb,
    4: 0x8b5cf6,
    5: 0xec4899,
    6: 0xffaa00
};

function updateDimensionUI() {
    dimensionDisplay.textContent =
        dimensionNames[currentDimension];

    scene.background =
        new THREE.Color(
            dimensionColors[currentDimension]
        );

    if (currentDimension === 1) {
        message.textContent =
            "1D — Only forward and backward!";
    }

    if (currentDimension === 2) {
        message.textContent =
            "2D — Welcome to the flat world!";
    }

    if (currentDimension === 3) {
        message.textContent =
            "3D — Normal sandbox!";
    }

    if (currentDimension === 4) {
        message.textContent =
            "4D — The hidden layer has appeared!";
    }

    if (currentDimension === 5) {
        message.textContent =
            "5D — Another version of reality!";
    }

    if (currentDimension === 6) {
        message.textContent =
            "6D — The final dimension!";
    }
}

// =====================================
// LIGHTING
// =====================================

const sun = new THREE.DirectionalLight(
    0xffffff,
    2
);

sun.position.set(
    20,
    30,
    10
);

scene.add(sun);

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        0.6
    )
);

// =====================================
// BLOCK SYSTEM
// =====================================

const blocks = [];

const blockGeometry =
    new THREE.BoxGeometry(
        1,
        1,
        1
    );

function createBlock(
    x,
    y,
    z,
    color,
    dimension = 0
) {
    const material =
        new THREE.MeshStandardMaterial({
            color: color
        });

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

    updateBlockVisibility();

    return block;
}

function removeBlock(block) {

    const index =
        blocks.indexOf(block);

    if (index !== -1) {
        blocks.splice(
            index,
            1
        );
    }

    scene.remove(block);
}

function updateBlockVisibility() {

    for (const block of blocks) {

        const blockDimension =
            block.userData.dimension;

        // Dimension 0 = exists everywhere.

        if (blockDimension === 0) {
            block.visible = true;
        }

        // Otherwise it only exists
        // in its own dimension.

        else {
            block.visible =
                blockDimension ===
                currentDimension;
        }
    }
}

// =====================================
// WORLD
// =====================================

function createWorld() {

    // ---------------------------------
    // NORMAL GROUND
    // ---------------------------------

    for (
        let x = -12;
        x <= 12;
        x++
    ) {

        for (
            let z = -12;
            z <= 12;
            z++
        ) {

            createBlock(
                x,
                -1,
                z,
                0x3d9b45
            );
        }
    }

    // ---------------------------------
    // 3D STRUCTURE
    // ---------------------------------

    for (
        let y = 0;
        y < 4;
        y++
    ) {

        createBlock(
            4,
            y,
            -4,
            0x777777
        );
    }

    // ---------------------------------
    // 4D BLOCKS
    // ---------------------------------

    for (
        let x = -2;
        x <= 2;
        x++
    ) {

        createBlock(
            x,
            0,
            -8,
            0x8b5cf6,
            4
        );
    }

    createBlock(
        0,
        1,
        -8,
        0xffffff,
        4
    );

    // ---------------------------------
    // 5D BLOCKS
    // ---------------------------------

    for (
        let x = -2;
        x <= 2;
        x++
    ) {

        createBlock(
            x,
            0,
            -10,
            0xec4899,
            5
        );
    }

    createBlock(
        0,
        1,
        -10,
        0xffffff,
        5
    );

    // ---------------------------------
    // 6D BLOCKS
    // ---------------------------------

    for (
        let x = -2;
        x <= 2;
        x++
    ) {

        createBlock(
            x,
            0,
            -12,
            0xffaa00,
            6
        );
    }

    createBlock(
        0,
        1,
        -12,
        0xffffff,
        6
    );
}

createWorld();

// =====================================
// PLAYER
// =====================================

const player = {

    position:
        new THREE.Vector3(
            0,
            1.5,
            5
        ),

    velocity:
        new THREE.Vector3(),

    speed: 6,

    jumpPower: 8,

    gravity: 20,

    grounded: false
};

camera.position.copy(
    player.position
);

// =====================================
// MOVEMENT
// =====================================

const keys = {};

window.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;

        // Jump

        if (
            event.code === "Space" &&
            player.grounded
        ) {

            player.velocity.y =
                player.jumpPower;

            player.grounded =
                false;
        }

        // ---------------------------------
        // DIMENSION KEYS
        // ---------------------------------

        if (
            event.code === "Digit1"
        ) {
            switchDimension(1);
        }

        if (
            event.code === "Digit2"
        ) {
            switchDimension(2);
        }

        if (
            event.code === "Digit3"
        ) {
            switchDimension(3);
        }

        if (
            event.code === "Digit4"
        ) {
            switchDimension(4);
        }

        if (
            event.code === "Digit5"
        ) {
            switchDimension(5);
        }

        if (
            event.code === "Digit6"
        ) {
            switchDimension(6);
        }
    }
);

window.addEventListener(
    "keyup",
    event => {

        keys[event.code] = false;
    }
);

// =====================================
// DIMENSION SWITCHING
// =====================================

function switchDimension(
    dimension
) {

    if (
        dimension < 1 ||
        dimension > 6
    ) {
        return;
    }

    currentDimension =
        dimension;

    updateDimensionUI();

    updateBlockVisibility();

    // Small dimension-shift effect

    camera.fov = 90;

    camera.updateProjectionMatrix();

    setTimeout(
        () => {

            camera.fov = 75;

            camera.updateProjectionMatrix();

        },
        150
    );
}

// =====================================
// MOUSE LOOK
// =====================================

let yaw = 0;
let pitch = 0;

document.body.addEventListener(
    "click",
    () => {

        if (
            document.pointerLockElement !==
            document.body
        ) {

            document.body.requestPointerLock();

            message.textContent =
                "WASD = Move • Click blocks • ESC = Release mouse";
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
                -Math.PI / 2,
                Math.min(
                    Math.PI / 2,
                    pitch
                )
            );
    }
);

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

        // ---------------------------------
        // LEFT CLICK = BREAK
        // ---------------------------------

        if (
            event.button === 0
        ) {

            // Don't delete ground.

            if (
                block.position.y >
                -1
            ) {

                removeBlock(block);

                message.textContent =
                    "Block removed!";
            }
        }

        // ---------------------------------
        // RIGHT CLICK = PLACE
        // ---------------------------------

        if (
            event.button === 2
        ) {

            if (!hit.face) {
                return;
            }

            const normal =
                hit.face.normal.clone();

            const position =
                block.position.clone();

            position.add(normal);

            createBlock(
                Math.round(
                    position.x
                ),
                Math.round(
                    position.y
                ),
                Math.round(
                    position.z
                ),
                getDimensionBlockColor(),
                currentDimension
            );

            message.textContent =
                `${currentDimension}D block placed!`;
        }
    }
);

// Disable browser right-click menu.

document.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();
    }
);

// =====================================
// BLOCK COLORS
// =====================================

function getDimensionBlockColor() {

    if (
        currentDimension === 1
    ) {
        return 0xaaaaaa;
    }

    if (
        currentDimension === 2
    ) {
        return 0x3b82f6;
    }

    if (
        currentDimension === 3
    ) {
        return 0x888888;
    }

    if (
        currentDimension === 4
    ) {
        return 0x8b5cf6;
    }

    if (
        currentDimension === 5
    ) {
        return 0xec4899;
    }

    return 0xffaa00;
}

// =====================================
// DIMENSION SPECIAL EFFECTS
// =====================================

function applyDimensionRules() {

    // 1D

    if (
        currentDimension === 1
    ) {

        player.position.x = 0;
    }

    // 2D

    if (
        currentDimension === 2
    ) {

        player.position.z =
            Math.round(
                player.position.z
            );
    }

    // 3D+

    if (
        currentDimension >= 3
    ) {

        // Normal movement.
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

    // =================================
    // MOVEMENT
    // =================================

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

    // A/D only work in 2D+

    if (
        currentDimension >= 2
    ) {

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

        player.position.x +=
            direction.x *
            player.speed *
            delta;

        player.position.z +=
            direction.z *
            player.speed *
            delta;
    }

    // =================================
    // GRAVITY
    // =================================

    player.velocity.y -=
        player.gravity *
        delta;

    player.position.y +=
        player.velocity.y *
        delta;

    // =================================
    // GROUND COLLISION
    // =================================

    if (
        player.position.y < 1.5
    ) {

        player.position.y =
            1.5;

        player.velocity.y = 0;

        player.grounded =
            true;
    }

    // =================================
    // DIMENSION RULES
    // =================================

    applyDimensionRules();

    // =================================
    // CAMERA
    // =================================

    camera.position.copy(
        player.position
    );

    camera.rotation.order =
        "YXZ";

    camera.rotation.y =
        yaw;

    camera.rotation.x =
        pitch;

    renderer.render(
        scene,
        camera
    );
}

// =====================================
// START
// =====================================

updateDimensionUI();

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

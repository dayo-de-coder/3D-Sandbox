import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const game = document.getElementById("game");
const dimensionDisplay = document.getElementById("dimension");
const message = document.getElementById("message");

// =====================================
// SCENE
// =====================================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

camera.position.set(0, 2, 6);

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
// LIGHTS
// =====================================

const sunlight = new THREE.DirectionalLight(
    0xffffff,
    2
);

sunlight.position.set(20, 30, 10);

scene.add(sunlight);

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        0.6
    )
);

// =====================================
// DIMENSION UI
// =====================================

const dimensionMenu = document.createElement("div");

dimensionMenu.id = "dimensionMenu";

dimensionMenu.innerHTML = `
    <button data-dimension="1">1D</button>
    <button data-dimension="2">2D</button>
    <button data-dimension="3">3D</button>
    <button data-dimension="4">4D</button>
    <button data-dimension="5">5D</button>
    <button data-dimension="6">6D</button>
`;

document.body.appendChild(dimensionMenu);

const dimensionButtons =
    dimensionMenu.querySelectorAll("button");

dimensionButtons.forEach(button => {

    button.addEventListener("click", event => {

        event.stopPropagation();

        const dimension =
            Number(button.dataset.dimension);

        switchDimension(dimension);
    });
});

// =====================================
// DIMENSIONS
// =====================================

let currentDimension = 3;

const dimensionColors = {
    1: 0x202020,
    2: 0x2874d8,
    3: 0x87ceeb,
    4: 0x6c35de,
    5: 0xd62976,
    6: 0xff9f00
};

const dimensionNames = {
    1: "1D",
    2: "2D",
    3: "3D",
    4: "4D",
    5: "5D",
    6: "6D"
};

function switchDimension(dimension) {

    if (dimension < 1 || dimension > 6) {
        return;
    }

    currentDimension = dimension;

    dimensionDisplay.textContent =
        dimensionNames[dimension];

    scene.background =
        new THREE.Color(
            dimensionColors[dimension]
        );

    dimensionButtons.forEach(button => {

        button.classList.remove("active");

        if (
            Number(button.dataset.dimension) ===
            dimension
        ) {
            button.classList.add("active");
        }
    });

    updateDimensionWorld();

    if (dimension === 1) {
        message.textContent =
            "1D MODE — Only one movement axis!";
    }

    if (dimension === 2) {
        message.textContent =
            "2D MODE — Welcome to the flat world!";
    }

    if (dimension === 3) {
        message.textContent =
            "3D MODE — Normal sandbox!";
    }

    if (dimension === 4) {
        message.textContent =
            "4D MODE — Hidden blocks unlocked!";
    }

    if (dimension === 5) {
        message.textContent =
            "5D MODE — Reality has changed!";
    }

    if (dimension === 6) {
        message.textContent =
            "6D MODE — MAXIMUM DIMENSION!";
    }
}

// =====================================
// BLOCKS
// =====================================

const blocks = [];

const blockGeometry =
    new THREE.BoxGeometry(1, 1, 1);

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

    block.position.set(x, y, z);

    block.userData.dimension =
        dimension;

    block.userData.isBlock =
        true;

    scene.add(block);

    blocks.push(block);

    updateDimensionWorld();

    return block;
}

function removeBlock(block) {

    const index =
        blocks.indexOf(block);

    if (index !== -1) {
        blocks.splice(index, 1);
    }

    scene.remove(block);
}

// =====================================
// WORLD
// =====================================

function createWorld() {

    // Main ground

    for (let x = -12; x <= 12; x++) {

        for (let z = -12; z <= 12; z++) {

            createBlock(
                x,
                -1,
                z,
                0x3d9b45,
                0
            );
        }
    }

    // Normal 3D tower

    for (let y = 0; y < 5; y++) {

        createBlock(
            4,
            y,
            -4,
            0x777777,
            0
        );
    }

    // 4D area

    for (let x = -3; x <= 3; x++) {

        createBlock(
            x,
            0,
            -7,
            0x8b5cf6,
            4
        );
    }

    createBlock(
        0,
        1,
        -7,
        0xffffff,
        4
    );

    // 5D area

    for (let x = -3; x <= 3; x++) {

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

    // 6D area

    for (let x = -3; x <= 3; x++) {

        createBlock(
            x,
            0,
            -13,
            0xffaa00,
            6
        );
    }

    createBlock(
        0,
        1,
        -13,
        0xffffff,
        6
    );
}

createWorld();

// =====================================
// DIMENSION WORLD RULES
// =====================================

function updateDimensionWorld() {

    for (const block of blocks) {

        const blockDimension =
            block.userData.dimension;

        // Normal blocks exist everywhere.

        if (blockDimension === 0) {

            block.visible = true;

            continue;
        }

        // Dimension-specific blocks.

        block.visible =
            blockDimension ===
            currentDimension;
    }

    // 1D makes the world extremely narrow.

    if (currentDimension === 1) {

        for (const block of blocks) {

            if (
                Math.abs(block.position.x) > 0.5
            ) {
                block.visible = false;
            }
        }
    }

    // 2D removes depth.

    if (currentDimension === 2) {

        for (const block of blocks) {

            if (
                Math.abs(block.position.z) > 0.5
            ) {
                block.visible = false;
            }
        }
    }
}

// =====================================
// PLAYER
// =====================================

const player = {

    position: new THREE.Vector3(
        0,
        1.5,
        5
    ),

    velocity: new THREE.Vector3(),

    speed: 6,

    jumpPower: 8,

    gravity: 20,

    grounded: false
};

camera.position.copy(
    player.position
);

// =====================================
// KEYBOARD
// =====================================

const keys = {};

window.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;

        // Prevent Space from scrolling.

        if (event.code === "Space") {
            event.preventDefault();
        }

        // Jump

        if (
            event.code === "Space" &&
            player.grounded
        ) {

            player.velocity.y =
                player.jumpPower;

            player.grounded = false;
        }

        // =================================
        // DIMENSION HOTKEYS
        // =================================

        const dimensionKeys = {
            Digit1: 1,
            Digit2: 2,
            Digit3: 3,
            Digit4: 4,
            Digit5: 5,
            Digit6: 6,

            Numpad1: 1,
            Numpad2: 2,
            Numpad3: 3,
            Numpad4: 4,
            Numpad5: 5,
            Numpad6: 6
        };

        if (
            dimensionKeys[event.code] !==
            undefined
        ) {

            switchDimension(
                dimensionKeys[event.code]
            );
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
// MOUSE LOOK
// =====================================

let yaw = 0;
let pitch = 0;

document.body.addEventListener(
    "click",
    event => {

        // Don't lock the mouse when clicking
        // dimension buttons.

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

            message.textContent =
                "WASD = Move • ESC = Mouse back";
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
            event.movementX * 0.002;

        pitch -=
            event.movementY * 0.002;

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
    new THREE.Vector2(0, 0);

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

        if (hits.length === 0) {
            return;
        }

        const hit = hits[0];

        const block = hit.object;

        // LEFT CLICK = BREAK

        if (event.button === 0) {

            if (
                block.position.y > -1
            ) {

                removeBlock(block);

                message.textContent =
                    "💥 Block removed!";
            }
        }

        // RIGHT CLICK = PLACE

        if (event.button === 2) {

            if (!hit.face) {
                return;
            }

            const normal =
                hit.face.normal.clone();

            const newPosition =
                block.position.clone();

            newPosition.add(normal);

            createBlock(
                Math.round(
                    newPosition.x
                ),
                Math.round(
                    newPosition.y
                ),
                Math.round(
                    newPosition.z
                ),
                getDimensionColor(),
                currentDimension
            );

            message.textContent =
                `🧱 ${currentDimension}D block placed!`;
        }
    }
);

// Stop right-click menu.

document.addEventListener(
    "contextmenu",
    event => {
        event.preventDefault();
    }
);

// =====================================
// DIMENSION BLOCK COLORS
// =====================================

function getDimensionColor() {

    if (currentDimension === 1) {
        return 0xaaaaaa;
    }

    if (currentDimension === 2) {
        return 0x2874d8;
    }

    if (currentDimension === 3) {
        return 0x777777;
    }

    if (currentDimension === 4) {
        return 0x8b5cf6;
    }

    if (currentDimension === 5) {
        return 0xec4899;
    }

    return 0xffaa00;
}

// =====================================
// MOVEMENT
// =====================================

function movePlayer(delta) {

    const direction =
        new THREE.Vector3();

    if (keys["KeyW"]) {
        direction.z -= 1;
    }

    if (keys["KeyS"]) {
        direction.z += 1;
    }

    // A/D are disabled in 1D.

    if (currentDimension >= 2) {

        if (keys["KeyA"]) {
            direction.x -= 1;
        }

        if (keys["KeyD"]) {
            direction.x += 1;
        }
    }

    if (direction.length() > 0) {

        direction.normalize();

        direction.applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
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

    // 1D locks the X position.

    if (currentDimension === 1) {
        player.position.x = 0;
    }

    // 2D locks the Z position.

    if (currentDimension === 2) {
        player.position.z = 0;
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
            (now - previousTime) / 1000,
            0.05
        );

    previousTime = now;

    movePlayer(delta);

    // Gravity

    player.velocity.y -=
        player.gravity * delta;

    player.position.y +=
        player.velocity.y * delta;

    // Ground

    if (
        player.position.y < 1.5
    ) {

        player.position.y = 1.5;

        player.velocity.y = 0;

        player.grounded = true;
    }

    // Camera

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

switchDimension(3);

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

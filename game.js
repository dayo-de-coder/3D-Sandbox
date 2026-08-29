import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const game = document.getElementById("game");
const dimensionDisplay = document.getElementById("dimension");
const message = document.getElementById("message");

// =====================================
// THREE.JS
// =====================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x87ceeb);

scene.fog =
    new THREE.Fog(
        0x87ceeb,
        20,
        100
    );

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
// LIGHTS
// =====================================

const sunlight =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

sunlight.position.set(
    20,
    30,
    10
);

scene.add(sunlight);

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        0.5
    )
);

// =====================================
// BLOCKS
// =====================================

const blocks = [];

const blockGeometry =
    new THREE.BoxGeometry(
        1,
        1,
        1
    );

const blockMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x777777
    });

function createBlock(
    x,
    y,
    z,
    color = 0x777777
) {
    const material =
        new THREE.MeshStandardMaterial({
            color
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

    block.userData.isBlock =
        true;

    scene.add(block);

    blocks.push(block);

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

// =====================================
// WORLD
// =====================================

function createWorld() {

    // Ground
    for (
        let x = -10;
        x <= 10;
        x++
    ) {
        for (
            let z = -10;
            z <= 10;
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

    // Starting structures

    for (
        let y = 0;
        y < 3;
        y++
    ) {
        createBlock(
            4,
            y,
            -4,
            0x888888
        );
    }

    for (
        let x = -3;
        x <= 3;
        x++
    ) {
        createBlock(
            x,
            0,
            -7,
            0xb07845
        );
    }

    // Floating blocks

    createBlock(
        2,
        4,
        -3,
        0xffcc33
    );

    createBlock(
        3,
        5,
        -3,
        0xff5533
    );

    createBlock(
        4,
        6,
        -3,
        0x6633ff
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
// CONTROLS
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

            player.grounded = false;
        }

        // Dimensions

        if (
            event.code === "Digit1"
        ) {
            changeDimension(1);
        }

        if (
            event.code === "Digit2"
        ) {
            changeDimension(2);
        }

        if (
            event.code === "Digit3"
        ) {
            changeDimension(3);
        }

        if (
            event.code === "Digit4"
        ) {
            changeDimension(4);
        }

        if (
            event.code === "Digit5"
        ) {
            changeDimension(5);
        }

        if (
            event.code === "Digit6"
        ) {
            changeDimension(6);
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
    () => {

        if (
            document.pointerLockElement !==
            document.body
        ) {
            document.body.requestPointerLock();

            message.textContent =
                "WASD to move • ESC to leave";
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

const mouse =
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
            mouse,
            camera
        );

        const hits =
            raycaster.intersectObjects(
                blocks
            );

        if (hits.length === 0) {
            return;
        }

        const hit =
            hits[0];

        const block =
            hit.object;

        // LEFT CLICK = BREAK

        if (
            event.button === 0
        ) {

            // Don't remove ground directly
            if (
                block.position.y >
                -1
            ) {
                removeBlock(block);
            }
        }

        // RIGHT CLICK = PLACE

        if (
            event.button === 2
        ) {

            const normal =
                hit.face.normal.clone();

            const newPosition =
                block.position.clone()
                    .add(normal);

            createBlock(
                Math.round(
                    newPosition.x
                ),
                Math.round(
                    newPosition.y
                ),
                Math.round(
                    newPosition.z
                )
            );
        }
    }
);

// Disable right-click menu

document.addEventListener(
    "contextmenu",
    event => {
        event.preventDefault();
    }
);

// =====================================
// DIMENSIONS
// =====================================

let currentDimension = 3;

function changeDimension(
    dimension
) {

    currentDimension =
        dimension;

    dimensionDisplay.textContent =
        `${dimension}D`;

    if (dimension === 1) {
        message.textContent =
            "1D — Only one direction exists!";
    }

    if (dimension === 2) {
        message.textContent =
            "2D — The world becomes flat!";
    }

    if (dimension === 3) {
        message.textContent =
            "3D — Normal sandbox mode!";
    }

    if (dimension === 4) {
        message.textContent =
            "4D — Extra dimension unlocked!";
    }

    if (dimension === 5) {
        message.textContent =
            "5D — Reality is getting weird!";
    }

    if (dimension === 6) {
        message.textContent =
            "6D — Maximum dimension!";
    }

    applyDimension();
}

// =====================================
// DIMENSION EFFECTS
// =====================================

function applyDimension() {

    if (
        currentDimension === 1
    ) {

        // 1D:
        // Lock movement to one axis.

        player.position.x = 0;

        scene.fog.near = 10;
        scene.fog.far = 50;
    }

    else if (
        currentDimension === 2
    ) {

        // 2D:
        // Flatten the world.

        scene.fog.near = 20;
        scene.fog.far = 80;

        for (
            const block of blocks
        ) {

            if (
                Math.abs(
                    block.position.z
                ) > 0.5
            ) {

                block.visible = false;

            } else {

                block.visible = true;
            }
        }
    }

    else {

        // 3D+

        for (
            const block of blocks
        ) {
            block.visible = true;
        }
    }

    // Higher dimensions:
    // Add visual effects.

    if (
        currentDimension >= 4
    ) {

        scene.background =
            new THREE.Color(
                0x332255
            );

    } else {

        scene.background =
            new THREE.Color(
                0x87ceeb
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

    previousTime = now;

    // =================================
    // MOVEMENT
    // =================================

    const direction =
        new THREE.Vector3();

    if (keys["KeyW"])
        direction.z -= 1;

    if (keys["KeyS"])
        direction.z += 1;

    if (
        currentDimension >= 2
    ) {

        if (keys["KeyA"])
            direction.x -= 1;

        if (keys["KeyD"])
            direction.x += 1;
    }

    // 1D restriction

    if (
        currentDimension === 1
    ) {
        direction.x = 0;
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
    // GROUND
    // =================================

    if (
        player.position.y < 1.5
    ) {

        player.position.y = 1.5;

        player.velocity.y = 0;

        player.grounded = true;
    }

    // =================================
    // CAMERA
    // =================================

    camera.position.copy(
        player.position
    );

    camera.rotation.order =
        "YXZ";

    camera.rotation.y = yaw;

    camera.rotation.x = pitch;

    renderer.render(
        scene,
        camera
    );
}

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

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const game = document.getElementById("game");

// ===============================
// SCENE
// ===============================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);

scene.fog = new THREE.Fog(0x87ceeb, 20, 100);

// ===============================
// CAMERA
// ===============================

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

camera.position.set(0, 3, 8);

// ===============================
// RENDERER
// ===============================

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

// ===============================
// LIGHTING
// ===============================

const sunlight = new THREE.DirectionalLight(
    0xffffff,
    2
);

sunlight.position.set(20, 30, 10);

scene.add(sunlight);

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        0.5
    )
);

// ===============================
// GROUND
// ===============================

const groundGeometry =
    new THREE.BoxGeometry(
        50,
        1,
        50
    );

const groundMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x4caf50
    });

const ground =
    new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );

ground.position.y = -0.5;

scene.add(ground);

// ===============================
// TEST BLOCKS
// ===============================

function createBlock(
    x,
    y,
    z
) {
    const geometry =
        new THREE.BoxGeometry(
            1,
            1,
            1
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x888888
        });

    const block =
        new THREE.Mesh(
            geometry,
            material
        );

    block.position.set(
        x,
        y,
        z
    );

    scene.add(block);

    return block;
}

createBlock(3, 0.5, -3);
createBlock(4, 1.5, -3);
createBlock(5, 2.5, -3);

// ===============================
// PLAYER
// ===============================

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

// ===============================
// CONTROLS
// ===============================

const keys = {};

window.addEventListener(
    "keydown",
    (event) => {
        keys[event.code] = true;

        if (
            event.code === "Space" &&
            player.grounded
        ) {
            player.velocity.y =
                player.jumpPower;

            player.grounded = false;
        }
    }
);

window.addEventListener(
    "keyup",
    (event) => {
        keys[event.code] = false;
    }
);

// ===============================
// MOUSE LOOK
// ===============================

let yaw = 0;
let pitch = 0;

document.body.addEventListener(
    "click",
    () => {
        document.body.requestPointerLock();
    }
);

document.addEventListener(
    "mousemove",
    (event) => {
        if (
            document.pointerLockElement !==
            document.body
        ) {
            return;
        }

        yaw -= event.movementX * 0.002;
        pitch -= event.movementY * 0.002;

        pitch = Math.max(
            -Math.PI / 2,
            Math.min(
                Math.PI / 2,
                pitch
            )
        );
    }
);

// ===============================
// GAME LOOP
// ===============================

let previousTime =
    performance.now();

function animate() {

    requestAnimationFrame(
        animate
    );

    const currentTime =
        performance.now();

    const delta =
        Math.min(
            (currentTime -
                previousTime) /
                1000,
            0.05
        );

    previousTime =
        currentTime;

    // ---------------------------
    // MOVEMENT
    // ---------------------------

    const direction =
        new THREE.Vector3();

    if (keys["KeyW"])
        direction.z -= 1;

    if (keys["KeyS"])
        direction.z += 1;

    if (keys["KeyA"])
        direction.x -= 1;

    if (keys["KeyD"])
        direction.x += 1;

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

    // ---------------------------
    // GRAVITY
    // ---------------------------

    player.velocity.y -=
        player.gravity *
        delta;

    player.position.y +=
        player.velocity.y *
        delta;

    // ---------------------------
    // GROUND COLLISION
    // ---------------------------

    if (
        player.position.y < 1.5
    ) {

        player.position.y = 1.5;

        player.velocity.y = 0;

        player.grounded = true;
    }

    // ---------------------------
    // CAMERA
    // ---------------------------

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

// ===============================
// WINDOW RESIZE
// ===============================

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

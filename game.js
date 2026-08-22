import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";

/* =========================================================
   GUDU BATTLE — GAME.JS
========================================================= */

const menuScreen = document.getElementById("menuScreen");
const loadingScreen = document.getElementById("loadingScreen");
const gameScreen = document.getElementById("gameScreen");

const playButton = document.getElementById("playButton");

const healthFill = document.getElementById("healthFill");
const healthText = document.getElementById("healthText");

const ammoCount = document.getElementById("ammoCount");
const killCount = document.getElementById("killCount");
const aliveCount = document.getElementById("aliveCount");

const gameMessage = document.getElementById("gameMessage");

let gameStarted = false;

/* =========================================================
   THREE.JS
========================================================= */

let scene;
let camera;
let renderer;

let clock;

let player;
let gun;

let enemies = [];

let bullets = [];

let keys = {};

let yaw = 0;
let pitch = 0;

let velocityY = 0;

let canJump = true;

let health = 100;
let ammo = 30;
let kills = 0;

let mouseLocked = false;

const playerHeight = 1.8;

/* =========================================================
   START
========================================================= */

setTimeout(() => {
    loadingScreen.style.opacity = "0";

    setTimeout(() => {
        loadingScreen.style.display = "none";
    }, 500);

}, 1200);


/* =========================================================
   PLAY BUTTON
========================================================= */

playButton.addEventListener("click", () => {

    menuScreen.style.opacity = "0";

    setTimeout(() => {
        menuScreen.style.display = "none";
        gameScreen.style.display = "block";

        startGame();

    }, 500);

});


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    if (gameStarted) return;

    gameStarted = true;

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x87cfff);

    scene.fog = new THREE.Fog(
        0x87cfff,
        45,
        180
    );


    /* CAMERA */

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        500
    );


    /* RENDERER */

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);


    /* CLOCK */

    clock = new THREE.Clock();


    /* LIGHTS */

    createLights();


    /* WORLD */

    createWorld();


    /* PLAYER */

    createPlayer();


    /* GUN */

    createGun();


    /* ENEMIES */

    createEnemies();


    /* CONTROLS */

    setupControls();


    /* RESIZE */

    window.addEventListener(
        "resize",
        onResize
    );


    /* LOOP */

    animate();
}


/* =========================================================
   LIGHTS
========================================================= */

function createLights() {

    const ambient = new THREE.HemisphereLight(
        0xffffff,
        0x355070,
        2
    );

    scene.add(ambient);


    const sun = new THREE.DirectionalLight(
        0xffffff,
        3
    );

    sun.position.set(
        40,
        70,
        30
    );

    sun.castShadow = true;

    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;

    scene.add(sun);
}


/* =========================================================
   WORLD
========================================================= */

function createWorld() {

    /* GROUND */

    const groundGeometry =
        new THREE.PlaneGeometry(
            300,
            300
        );

    const groundMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x3c8d4a,
            roughness: 1
        });

    const ground =
        new THREE.Mesh(
            groundGeometry,
            groundMaterial
        );

    ground.rotation.x =
        -Math.PI / 2;

    ground.receiveShadow = true;

    scene.add(ground);


    /* WATER */

    const waterGeometry =
        new THREE.PlaneGeometry(
            300,
            300
        );

    const waterMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x1f91c9,
            roughness: 0.2,
            metalness: 0.1
        });

    const water =
        new THREE.Mesh(
            waterGeometry,
            waterMaterial
        );

    water.rotation.x =
        -Math.PI / 2;

    water.position.y = -0.08;

    scene.add(water);


    /* ISLAND */

    const islandGeometry =
        new THREE.CylinderGeometry(
            95,
            110,
            3,
            48
        );

    const islandMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x4e9b45
        });

    const island =
        new THREE.Mesh(
            islandGeometry,
            islandMaterial
        );

    island.position.y = -1.5;

    island.receiveShadow = true;

    scene.add(island);


    /* BUILDINGS */

    createBuilding(
        -25,
        4,
        -20,
        12,
        8,
        12
    );

    createBuilding(
        25,
        4,
        -15,
        10,
        8,
        10
    );

    createBuilding(
        10,
        3,
        25,
        14,
        6,
        9
    );


    /* TREES */

    for (let i = 0; i < 35; i++) {

        const x =
            (Math.random() - 0.5) * 150;

        const z =
            (Math.random() - 0.5) * 150;

        if (
            Math.abs(x) < 35 &&
            Math.abs(z) < 35
        ) continue;

        createTree(x, z);
    }


    /* CRATES */

    for (let i = 0; i < 15; i++) {

        const x =
            (Math.random() - 0.5) * 120;

        const z =
            (Math.random() - 0.5) * 120;

        createCrate(x, z);
    }
}


/* =========================================================
   BUILDING
========================================================= */

function createBuilding(
    x,
    y,
    z,
    width,
    height,
    depth
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );

    const material =
        new THREE.MeshStandardMaterial({
            color:
                new THREE.Color(
                    `hsl(${Math.random() * 360},35%,35%)`
                )
        });

    const building =
        new THREE.Mesh(
            geometry,
            material
        );

    building.position.set(
        x,
        y,
        z
    );

    building.castShadow = true;
    building.receiveShadow = true;

    scene.add(building);


    /* ROOF */

    const roofGeometry =
        new THREE.ConeGeometry(
            Math.max(width, depth) * 0.8,
            4,
            4
        );

    const roofMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x252b35
        });

    const roof =
        new THREE.Mesh(
            roofGeometry,
            roofMaterial
        );

    roof.position.set(
        x,
        y + height / 2 + 2,
        z
    );

    roof.rotation.y =
        Math.PI / 4;

    roof.castShadow = true;

    scene.add(roof);
}


/* =========================================================
   TREE
========================================================= */

function createTree(x, z) {

    const trunkGeometry =
        new THREE.CylinderGeometry(
            0.45,
            0.6,
            4,
            8
        );

    const trunkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x633d25
        });

    const trunk =
        new THREE.Mesh(
            trunkGeometry,
            trunkMaterial
        );

    trunk.position.set(
        x,
        2,
        z
    );

    trunk.castShadow = true;

    scene.add(trunk);


    const leavesGeometry =
        new THREE.ConeGeometry(
            3.2,
            7,
            8
        );

    const leavesMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x176b35
        });

    const leaves =
        new THREE.Mesh(
            leavesGeometry,
            leavesMaterial
        );

    leaves.position.set(
        x,
        6.5,
        z
    );

    leaves.castShadow = true;

    scene.add(leaves);
}


/* =========================================================
   CRATE
========================================================= */

function createCrate(x, z) {

    const geometry =
        new THREE.BoxGeometry(
            2,
            2,
            2
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x9a672f
        });

    const crate =
        new THREE.Mesh(
            geometry,
            material
        );

    crate.position.set(
        x,
        1,
        z
    );

    crate.rotation.y =
        Math.random() * Math.PI;

    crate.castShadow = true;

    scene.add(crate);
}


/* =========================================================
   PLAYER
========================================================= */

function createPlayer() {

    player =
        new THREE.Group();

    player.position.set(
        0,
        0,
        15
    );


    /* BODY */

    const bodyGeometry =
        new THREE.BoxGeometry(
            0.8,
            1.2,
            0.45
        );

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x216cff
        });

    const body =
        new THREE.Mesh(
            bodyGeometry,
            bodyMaterial
        );

    body.position.y = 1.05;

    body.castShadow = true;

    player.add(body);


    /* HEAD */

    const headGeometry =
        new THREE.SphereGeometry(
            0.38,
            20,
            20
        );

    const headMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xffc49a
        });

    const head =
        new THREE.Mesh(
            headGeometry,
            headMaterial
        );

    head.position.y = 1.95;

    head.castShadow = true;

    player.add(head);


    scene.add(player);


    camera.position.set(
        0,
        playerHeight,
        0
    );

    player.add(camera);
}


/* =========================================================
   GUN
========================================================= */

function createGun() {

    gun =
        new THREE.Group();


    const bodyGeometry =
        new THREE.BoxGeometry(
            0.18,
            0.18,
            0.8
        );

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x15171c,
            metalness: 0.7,
            roughness: 0.25
        });

    const body =
        new THREE.Mesh(
            bodyGeometry,
            bodyMaterial
        );

    body.position.z = -0.45;

    gun.add(body);


    const barrelGeometry =
        new THREE.CylinderGeometry(
            0.05,
            0.05,
            0.55,
            12
        );

    const barrel =
        new THREE.Mesh(
            barrelGeometry,
            bodyMaterial
        );

    barrel.rotation.x =
        Math.PI / 2;

    barrel.position.z = -0.95;

    gun.add(barrel);


    gun.position.set(
        0.55,
        -0.45,
        -0.9
    );

    camera.add(gun);
}


/* =========================================================
   ENEMIES
========================================================= */

function createEnemies() {

    for (let i = 0; i < 9; i++) {

        createEnemy();
    }

    aliveCount.textContent =
        enemies.length + 1;
}


function createEnemy() {

    const enemy =
        new THREE.Group();


    const bodyGeometry =
        new THREE.BoxGeometry(
            0.8,
            1.2,
            0.45
        );

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xd82f45
        });

    const body =
        new THREE.Mesh(
            bodyGeometry,
            bodyMaterial
        );

    body.position.y = 1.05;

    body.castShadow = true;

    enemy.add(body);


    const headGeometry =
        new THREE.SphereGeometry(
            0.38,
            16,
            16
        );

    const headMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xffb58f
        });

    const head =
        new THREE.Mesh(
            headGeometry,
            headMaterial
        );

    head.position.y = 1.95;

    head.castShadow = true;

    enemy.add(head);


    enemy.position.set(
        (Math.random() - 0.5) * 120,
        0,
        (Math.random() - 0.5) * 120
    );


    enemy.userData.health = 100;

    enemy.userData.speed =
        1.2 + Math.random() * 1.2;

    enemy.userData.attackTimer = 0;

    scene.add(enemy);

    enemies.push(enemy);
}


/* =========================================================
   CONTROLS
========================================================= */

function setupControls() {

    window.addEventListener(
        "keydown",
        (event) => {

            keys[event.code] = true;

            if (
                event.code === "Space" &&
                canJump
            ) {

                velocityY = 7;

                canJump = false;
            }

            if (
                event.code === "KeyR"
            ) {

                reload();
            }
        }
    );


    window.addEventListener(
        "keyup",
        (event) => {

            keys[event.code] = false;
        }
    );


    renderer.domElement.addEventListener(
        "click",
        () => {

            renderer.domElement.requestPointerLock();

            shoot();
        }
    );


    document.addEventListener(
        "mousemove",
        (event) => {

            if (
                document.pointerLockElement !==
                renderer.domElement
            ) return;

            yaw -= event.movementX * 0.002;
            pitch -= event.movementY * 0.002;

            pitch =
                Math.max(
                    -1.4,
                    Math.min(
                        1.4,
                        pitch
                    )
                );

            player.rotation.y = yaw;

            camera.rotation.x = pitch;
        }
    );
}


/* =========================================================
   MOVEMENT
========================================================= */

function updatePlayer(delta) {

    if (!player) return;


    const speed =
        keys["ShiftLeft"] ||
        keys["ShiftRight"]
            ? 10
            : 5;


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
            new THREE.Vector3(0,1,0),
            yaw
        );

        player.position.x +=
            direction.x *
            speed *
            delta;

        player.position.z +=
            direction.z *
            speed *
            delta;
    }


    /* GRAVITY */

    velocityY -=
        18 * delta;

    player.position.y +=
        velocityY * delta;


    if (player.position.y <= 0) {

        player.position.y = 0;

        velocityY = 0;

        canJump = true;
    }


    /* WORLD LIMIT */

    player.position.x =
        THREE.MathUtils.clamp(
            player.position.x,
            -85,
            85
        );

    player.position.z =
        THREE.MathUtils.clamp(
            player.position.z,
            -85,
            85
        );
}


/* =========================================================
   SHOOT
========================================================= */

function shoot() {

    if (!gameStarted) return;

    if (ammo <= 0) {

        showMessage("RELOAD!");

        return;
    }


    ammo--;

    ammoCount.textContent =
        ammo;


    const bulletGeometry =
        new THREE.SphereGeometry(
            0.07,
            8,
            8
        );

    const bulletMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xffff66
        });

    const bullet =
        new THREE.Mesh(
            bulletGeometry,
            bulletMaterial
        );


    const direction =
        new THREE.Vector3(
            0,
            0,
            -1
        );

    direction.applyQuaternion(
        camera.getWorldQuaternion(
            new THREE.Quaternion()
        )
    );


    bullet.position.copy(
        camera.getWorldPosition(
            new THREE.Vector3()
        )
    );


    bullet.userData.velocity =
        direction.multiplyScalar(65);

    bullet.userData.life = 2;

    scene.add(bullet);

    bullets.push(bullet);
}


/* =========================================================
   BULLETS
========================================================= */

function updateBullets(delta) {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];

        bullet.position.add(
            bullet.userData.velocity
                .clone()
                .multiplyScalar(delta)
        );

        bullet.userData.life -= delta;


        let hit = false;


        /* ENEMY HIT */

        for (
            let j = enemies.length - 1;
            j >= 0;
            j--
        ) {

            const enemy =
                enemies[j];

            const distance =
                bullet.position.distanceTo(
                    enemy.position.clone()
                        .add(
                            new THREE.Vector3(
                                0,
                                1,
                                0
                            )
                        )
                );


            if (distance < 1.2) {

                enemy.userData.health -= 50;

                hit = true;

                if (
                    enemy.userData.health <= 0
                ) {

                    scene.remove(enemy);

                    enemies.splice(
                        j,
                        1
                    );

                    kills++;

                    killCount.textContent =
                        kills;

                    aliveCount.textContent =
                        enemies.length + 1;

                    showMessage(
                        "ENEMY ELIMINATED!"
                    );
                }

                break;
            }
        }


        if (
            hit ||
            bullet.userData.life <= 0
        ) {

            scene.remove(bullet);

            bullets.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   ENEMY AI
========================================================= */

function updateEnemies(delta) {

    if (!player) return;


    enemies.forEach(enemy => {

        const distance =
            enemy.position.distanceTo(
                player.position
            );


        if (
            distance > 2.5 &&
            distance < 55
        ) {

            const direction =
                new THREE.Vector3()
                    .subVectors(
                        player.position,
                        enemy.position
                    )
                    .normalize();


            enemy.position.x +=
                direction.x *
                enemy.userData.speed *
                delta;

            enemy.position.z +=
                direction.z *
                enemy.userData.speed *
                delta;


            enemy.lookAt(
                player.position.x,
                enemy.position.y,
                player.position.z
            );
        }


        /* ENEMY ATTACK */

        if (distance < 3) {

            enemy.userData.attackTimer -=
                delta;

            if (
                enemy.userData.attackTimer <= 0
            ) {

                damagePlayer(5);

                enemy.userData.attackTimer =
                    1;
            }
        }
    });
}


/* =========================================================
   DAMAGE PLAYER
========================================================= */

function damagePlayer(amount) {

    health -= amount;

    health =
        Math.max(
            0,
            health
        );


    healthFill.style.width =
        health + "%";

    healthText.textContent =
        `${health} / 100`;


    if (health <= 0) {

        gameOver();
    }
}


/* =========================================================
   RELOAD
========================================================= */

function reload() {

    if (ammo >= 30) return;

    showMessage("RELOADING...");

    setTimeout(() => {

        ammo = 30;

        ammoCount.textContent =
            ammo;

    }, 900);
}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {

    showMessage(
        "YOU DIED — REFRESH TO PLAY AGAIN"
    );

    document.exitPointerLock?.();
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(text) {

    gameMessage.textContent =
        text;

    gameMessage.style.opacity =
        "1";


    setTimeout(() => {

        gameMessage.style.opacity =
            "0";

    }, 1000);
}


/* =========================================================
   RESIZE
========================================================= */

function onResize() {

    if (!camera || !renderer) return;

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}


/* =========================================================
   GAME LOOP
========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    updatePlayer(delta);

    updateEnemies(delta);

    updateBullets(delta);


    renderer.render(
        scene,
        camera
    );
}

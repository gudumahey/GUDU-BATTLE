import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";

/* =========================================================
   GUDU BATTLE ROYALE
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

/* =========================================================
   GAME VARIABLES
========================================================= */

let scene;
let camera;
let renderer;
let clock;

let player;
let gun;

let enemies = [];
let bullets = [];
let lootItems = [];

let keys = {};

let gameStarted = false;
let gameOverState = false;

let yaw = 0;
let pitch = 0;

let velocityY = 0;
let canJump = true;

let health = 100;
let ammo = 30;
let reserveAmmo = 90;
let kills = 0;

let shootCooldown = 0;

let safeZone;
let safeZoneRadius = 75;
const safeZoneMinRadius = 12;

let zoneDamageTimer = 0;

/* =========================================================
   LOADING
========================================================= */

setTimeout(() => {

    loadingScreen.style.opacity = "0";

    setTimeout(() => {
        loadingScreen.style.display = "none";
    }, 500);

}, 1200);


/* =========================================================
   PLAY
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
    gameOverState = false;

    health = 100;
    ammo = 30;
    reserveAmmo = 90;
    kills = 0;

    safeZoneRadius = 75;

    enemies = [];
    bullets = [];
    lootItems = [];

    killCount.textContent = "0";
    ammoCount.textContent = "30";
    aliveCount.textContent = "10";

    healthFill.style.width = "100%";
    healthText.textContent = "100 / 100";


    /* SCENE */

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x82cfff);

    scene.fog = new THREE.Fog(
        0x82cfff,
        45,
        190
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

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    document.body.appendChild(
        renderer.domElement
    );


    clock = new THREE.Clock();


    createLights();

    createWorld();

    createPlayer();

    createGun();

    createEnemies();

    createSafeZone();

    spawnLoot();

    setupControls();

    window.addEventListener(
        "resize",
        onResize
    );

    animate();
}


/* =========================================================
   LIGHTS
========================================================= */

function createLights() {

    const hemisphere =
        new THREE.HemisphereLight(
            0xffffff,
            0x355070,
            2.2
        );

    scene.add(hemisphere);


    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            3
        );

    sun.position.set(
        50,
        80,
        40
    );

    sun.castShadow = true;

    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;

    sun.shadow.camera.left = -120;
    sun.shadow.camera.right = 120;
    sun.shadow.camera.top = 120;
    sun.shadow.camera.bottom = -120;

    scene.add(sun);
}


/* =========================================================
   WORLD
========================================================= */

function createWorld() {

    /* WATER */

    const waterGeometry =
        new THREE.PlaneGeometry(
            350,
            350
        );

    const waterMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x168fc4,
            roughness: 0.25,
            metalness: 0.1
        });

    const water =
        new THREE.Mesh(
            waterGeometry,
            waterMaterial
        );

    water.rotation.x =
        -Math.PI / 2;

    water.position.y = -0.15;

    scene.add(water);


    /* ISLAND */

    const islandGeometry =
        new THREE.CylinderGeometry(
            100,
            115,
            3,
            64
        );

    const islandMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x438e46,
            roughness: 1
        });

    const island =
        new THREE.Mesh(
            islandGeometry,
            islandMaterial
        );

    island.position.y = -1.5;

    island.receiveShadow = true;

    scene.add(island);


    /* CENTER GROUND */

    const groundGeometry =
        new THREE.CircleGeometry(
            97,
            64
        );

    const groundMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x4e9e4d,
            roughness: 1
        });

    const ground =
        new THREE.Mesh(
            groundGeometry,
            groundMaterial
        );

    ground.rotation.x =
        -Math.PI / 2;

    ground.position.y = 0.02;

    ground.receiveShadow = true;

    scene.add(ground);


    /* BUILDINGS */

    createBuilding(
        -25,
        4,
        -25,
        14,
        8,
        12
    );

    createBuilding(
        27,
        4,
        -18,
        12,
        8,
        12
    );

    createBuilding(
        15,
        3,
        28,
        16,
        6,
        11
    );

    createBuilding(
        -30,
        3,
        25,
        11,
        6,
        10
    );


    /* TREES */

    for (let i = 0; i < 45; i++) {

        const x =
            (Math.random() - 0.5) * 165;

        const z =
            (Math.random() - 0.5) * 165;

        if (
            Math.abs(x) < 38 &&
            Math.abs(z) < 38
        ) {
            continue;
        }

        createTree(x, z);
    }


    /* CRATES */

    for (let i = 0; i < 20; i++) {

        const x =
            (Math.random() - 0.5) * 130;

        const z =
            (Math.random() - 0.5) * 130;

        createCrate(x, z);
    }
}


/* =========================================================
   BUILDINGS
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

    const colors = [
        0x596b7d,
        0x735b49,
        0x59645a,
        0x6b526d
    ];

    const material =
        new THREE.MeshStandardMaterial({
            color:
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ]
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


    /* WINDOWS */

    const windowMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x79dfff
        });

    for (let side = -1; side <= 1; side += 2) {

        const windowGeometry =
            new THREE.BoxGeometry(
                1.8,
                1.5,
                0.1
            );

        const windowMesh =
            new THREE.Mesh(
                windowGeometry,
                windowMaterial
            );

        windowMesh.position.set(
            x + side * (width / 2 + 0.06),
            y + 0.8,
            z
        );

        scene.add(windowMesh);
    }


    /* ROOF */

    const roofGeometry =
        new THREE.ConeGeometry(
            Math.max(width, depth) * 0.8,
            4,
            4
        );

    const roofMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x202632
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
   TREES
========================================================= */

function createTree(x, z) {

    const trunkGeometry =
        new THREE.CylinderGeometry(
            0.45,
            0.65,
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
   CRATES
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
        1.65,
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


    /* GUN BODY */

    const bodyGeometry =
        new THREE.BoxGeometry(
            0.2,
            0.2,
            0.85
        );

    const gunMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x11141a,
            metalness: 0.8,
            roughness: 0.2
        });

    const gunBody =
        new THREE.Mesh(
            bodyGeometry,
            gunMaterial
        );

    gunBody.position.z =
        -0.45;

    gun.add(gunBody);


    /* BARREL */

    const barrelGeometry =
        new THREE.CylinderGeometry(
            0.055,
            0.055,
            0.6,
            12
        );

    const barrel =
        new THREE.Mesh(
            barrelGeometry,
            gunMaterial
        );

    barrel.rotation.x =
        Math.PI / 2;

    barrel.position.z =
        -0.95;

    gun.add(barrel);


    /* HANDLE */

    const handleGeometry =
        new THREE.BoxGeometry(
            0.16,
            0.4,
            0.18
        );

    const handle =
        new THREE.Mesh(
            handleGeometry,
            gunMaterial
        );

    handle.position.set(
        0,
        -0.25,
        -0.2
    );

    handle.rotation.x =
        -0.2;

    gun.add(handle);


    gun.position.set(
        0.55,
        -0.42,
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

    updateAlive();
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


    /* ENEMY HEALTH BAR */

    const barBackground =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.3,
                0.12
            ),
            new THREE.MeshBasicMaterial({
                color: 0x222222
            })
        );

    barBackground.position.y =
        2.55;

    enemy.add(barBackground);


    const bar =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.2,
                0.08
            ),
            new THREE.MeshBasicMaterial({
                color: 0xff3344
            })
        );

    bar.position.set(
        0,
        2.55,
        0.01
    );

    enemy.add(bar);


    enemy.userData.health = 100;

    enemy.userData.healthBar =
        bar;

    enemy.userData.speed =
        1.2 + Math.random() * 1.4;

    enemy.userData.attackTimer =
        Math.random();


    /* POSITION */

    let x;
    let z;

    do {

        x =
            (Math.random() - 0.5) * 130;

        z =
            (Math.random() - 0.5) * 130;

    } while (
        Math.sqrt(x * x + z * z) < 25
    );


    enemy.position.set(
        x,
        0,
        z
    );


    scene.add(enemy);

    enemies.push(enemy);
}


/* =========================================================
   SAFE ZONE
========================================================= */

function createSafeZone() {

    const geometry =
        new THREE.RingGeometry(
            74,
            75,
            96
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0x00eaff,
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide
        });

    safeZone =
        new THREE.Mesh(
            geometry,
            material
        );

    safeZone.rotation.x =
        -Math.PI / 2;

    safeZone.position.y =
        0.15;

    scene.add(safeZone);
}


function updateSafeZone(delta) {

    if (!safeZone) return;


    if (
        safeZoneRadius >
        safeZoneMinRadius
    ) {

        safeZoneRadius -=
            delta * 0.65;

        const scale =
            safeZoneRadius / 75;

        safeZone.scale.set(
            scale,
            scale,
            scale
        );
    }


    const distance =
        Math.sqrt(
            player.position.x ** 2 +
            player.position.z ** 2
        );


    if (
        distance >
        safeZoneRadius
    ) {

        zoneDamageTimer -= delta;

        if (
            zoneDamageTimer <= 0
        ) {

            damagePlayer(3);

            zoneDamageTimer = 1;

            showMessage(
                "⚠ OUTSIDE SAFE ZONE"
            );
        }
    }
}


/* =========================================================
   LOOT
========================================================= */

function spawnLoot() {

    for (let i = 0; i < 22; i++) {

        const x =
            (Math.random() - 0.5) * 135;

        const z =
            (Math.random() - 0.5) * 135;

        const type =
            Math.random() > 0.5
                ? "ammo"
                : "medkit";

        createLoot(
            x,
            z,
            type
        );
    }
}


function createLoot(x, z, type) {

    const geometry =
        new THREE.BoxGeometry(
            0.75,
            0.75,
            0.75
        );

    const color =
        type === "ammo"
            ? 0xffd43b
            : 0xff304f;

    const material =
        new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3
        });

    const item =
        new THREE.Mesh(
            geometry,
            material
        );

    item.position.set(
        x,
        0.6,
        z
    );

    item.userData.type =
        type;

    item.castShadow = true;

    scene.add(item);

    lootItems.push(item);
}


function updateLoot() {

    for (
        let i = lootItems.length - 1;
        i >= 0;
        i--
    ) {

        const item =
            lootItems[i];

        item.rotation.y += 0.025;

        item.position.y =
            0.6 +
            Math.sin(
                performance.now() * 0.003
            ) * 0.15;


        const distance =
            item.position.distanceTo(
                player.position
            );


        if (distance < 2) {

            if (
                item.userData.type ===
                "ammo"
            ) {

                reserveAmmo += 30;

                showMessage(
                    "🔫 +30 AMMO"
                );
            }


            if (
                item.userData.type ===
                "medkit"
            ) {

                health =
                    Math.min(
                        100,
                        health + 30
                    );

                updateHealth();

                showMessage(
                    "❤️ +30 HEALTH"
                );
            }


            scene.remove(item);

            lootItems.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   CONTROLS
========================================================= */

function setupControls() {

    window.addEventListener(
        "keydown",
        event => {

            keys[event.code] = true;


            if (
                event.code ===
                "Space"
            ) {

                if (canJump) {

                    velocityY = 7;

                    canJump = false;
                }
            }


            if (
                event.code ===
                "KeyR"
            ) {

                reload();
            }
        }
    );


    window.addEventListener(
        "keyup",
        event => {

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
        event => {

            if (
                document.pointerLockElement !==
                renderer.domElement
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
                THREE.MathUtils.clamp(
                    pitch,
                    -1.4,
                    1.4
                );


            player.rotation.y =
                yaw;

            camera.rotation.x =
                pitch;
        }
    );
}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer(delta) {

    if (!player) return;


    const sprint =
        keys["ShiftLeft"] ||
        keys["ShiftRight"];


    const speed =
        sprint
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


    if (
        player.position.y <= 0
    ) {

        player.position.y = 0;

        velocityY = 0;

        canJump = true;
    }


    /* MAP LIMIT */

    player.position.x =
        THREE.MathUtils.clamp(
            player.position.x,
            -90,
            90
        );

    player.position.z =
        THREE.MathUtils.clamp(
            player.position.z,
            -90,
            90
        );
}


/* =========================================================
   SHOOTING
========================================================= */

function shoot() {

    if (
        !gameStarted ||
        gameOverState
    ) {
        return;
    }


    if (
        shootCooldown > 0
    ) {
        return;
    }


    if (ammo <= 0) {

        showMessage(
            "RELOAD!"
        );

        return;
    }


    ammo--;

    ammoCount.textContent =
        ammo;


    createMuzzleFlash();


    const bulletGeometry =
        new THREE.SphereGeometry(
            0.065,
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
        direction.multiplyScalar(
            90
        );

    bullet.userData.life = 2;


    scene.add(bullet);

    bullets.push(bullet);


    shootCooldown =
        0.16;
}


/* =========================================================
   MUZZLE FLASH
========================================================= */

function createMuzzleFlash() {

    const geometry =
        new THREE.SphereGeometry(
            0.13,
            8,
            8
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xffff99
        });

    const flash =
        new THREE.Mesh(
            geometry,
            material
        );

    flash.position.set(
        0,
        0,
        -1.3
    );

    gun.add(flash);


    setTimeout(() => {

        gun.remove(flash);

    }, 60);
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


        bullet.userData.life -=
            delta;


        let hit = false;


        for (
            let j = enemies.length - 1;
            j >= 0;
            j--
        ) {

            const enemy =
                enemies[j];


            const target =
                enemy.position.clone();

            target.y += 1;


            const distance =
                bullet.position.distanceTo(
                    target
                );


            if (
                distance < 1.15
            ) {

                enemy.userData.health -=
                    50;


                updateEnemyHealth(
                    enemy
                );


                hit = true;


                if (
                    enemy.userData.health <=
                    0
                ) {

                    scene.remove(enemy);

                    enemies.splice(
                        j,
                        1
                    );


                    kills++;

                    killCount.textContent =
                        kills;


                    updateAlive();


                    showMessage(
                        "💥 ENEMY ELIMINATED!"
                    );


                    checkVictory();
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
   ENEMY HEALTH
========================================================= */

function updateEnemyHealth(enemy) {

    const percent =
        Math.max(
            0,
            enemy.userData.health /
            100
        );


    enemy.userData.healthBar.scale.x =
        percent;
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
            distance < 60
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


        /* ATTACK */

        if (
            distance < 3
        ) {

            enemy.userData.attackTimer -=
                delta;


            if (
                enemy.userData.attackTimer <=
                0
            ) {

                damagePlayer(5);

                enemy.userData.attackTimer =
                    1;
            }
        }
    });
}


/* =========================================================
   DAMAGE
========================================================= */

function damagePlayer(amount) {

    if (
        gameOverState
    ) {
        return;
    }


    health -= amount;


    health =
        Math.max(
            0,
            health
        );


    updateHealth();


    if (
        health <= 0
    ) {

        gameOver();
    }
}


/* =========================================================
   HEALTH UI
========================================================= */

function updateHealth() {

    healthFill.style.width =
        health + "%";


    healthText.textContent =
        `${health} / 100`;
}


/* =========================================================
   RELOAD
========================================================= */

function reload() {

    if (
        !gameStarted ||
        gameOverState
    ) {
        return;
    }


    if (
        ammo >= 30
    ) {
        return;
    }


    if (
        reserveAmmo <= 0
    ) {

        showMessage(
            "NO AMMO"
        );

        return;
    }


    showMessage(
        "🔄 RELOADING..."
    );


    setTimeout(() => {

        if (
            !gameStarted ||
            gameOverState
        ) {
            return;
        }


        const needed =
            30 - ammo;


        const amount =
            Math.min(
                needed,
                reserveAmmo
            );


        ammo += amount;

        reserveAmmo -= amount;


        ammoCount.textContent =
            ammo;


        showMessage(
            "🔫 RELOADED"
        );

    }, 800);
}


/* =========================================================
   UPDATE ALIVE
========================================================= */

function updateAlive() {

    aliveCount.textContent =
        enemies.length + 1;
}


/* =========================================================
   VICTORY
========================================================= */

function checkVictory() {

    if (
        enemies.length === 0 &&
        !gameOverState
    ) {

        gameOverState = true;
        gameStarted = false;


        showMessage(
            "🏆 GUDU VICTORY!"
        );


        document.exitPointerLock?.();
    }
}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {

    if (gameOverState) return;


    gameOverState = true;
    gameStarted = false;


    showMessage(
        "💀 YOU DIED — REFRESH TO PLAY AGAIN"
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

    }, 1200);
}


/* =========================================================
   SHOOT COOLDOWN
========================================================= */

function updateShooting(delta) {

    if (
        shootCooldown > 0
    ) {

        shootCooldown -=
            delta;

        if (
            shootCooldown < 0
        ) {
            shootCooldown = 0;
        }
    }
}


/* =========================================================
   RESIZE
========================================================= */

function onResize() {

    if (
        !camera ||
        !renderer
    ) {
        return;
    }


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


    if (
        !clock ||
        !renderer
    ) {
        return;
    }


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    if (
        gameStarted &&
        !gameOverState
    ) {

        updatePlayer(delta);

        updateEnemies(delta);

        updateBullets(delta);

        updateSafeZone(delta);

        updateLoot();

        updateShooting(delta);
    }


    renderer.render(
        scene,
        camera
    );
}

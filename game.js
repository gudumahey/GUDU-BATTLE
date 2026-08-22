import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";

/* =========================================================
   GUDU BATTLE v3
   1v1 BOTS • GUNS • EVO GUNS • BUNDLES • LOOT
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
let kills = 0;

let shootCooldown = 0;

let safeZone;
let safeZoneRadius = 75;
const safeZoneMinRadius = 12;
let zoneDamageTimer = 0;


/* =========================================================
   GUN DATABASE
========================================================= */

const GUNS = {

    "GUDU AR": {
        type: "AR",
        damage: 25,
        fireRate: 0.14,
        magazine: 30,
        reserve: 120,
        range: 100,
        recoil: 0.025
    },

    "GUDU SMG": {
        type: "SMG",
        damage: 17,
        fireRate: 0.07,
        magazine: 40,
        reserve: 160,
        range: 70,
        recoil: 0.04
    },

    "GUDU SHOTGUN": {
        type: "SHOTGUN",
        damage: 12,
        fireRate: 0.7,
        magazine: 6,
        reserve: 36,
        range: 35,
        pellets: 7,
        recoil: 0.1
    },

    "GUDU SNIPER": {
        type: "SNIPER",
        damage: 90,
        fireRate: 1.2,
        magazine: 5,
        reserve: 25,
        range: 250,
        recoil: 0.08
    },

    "GUDU PISTOL": {
        type: "PISTOL",
        damage: 30,
        fireRate: 0.25,
        magazine: 12,
        reserve: 60,
        range: 80,
        recoil: 0.04
    },

    "THUNDER-X EVO": {
        type: "EVO",
        damage: 38,
        fireRate: 0.10,
        magazine: 35,
        reserve: 175,
        range: 130,
        recoil: 0.025,
        evoLevel: 1
    },

    "INFERNO EVO": {
        type: "EVO",
        damage: 45,
        fireRate: 0.12,
        magazine: 30,
        reserve: 150,
        range: 120,
        recoil: 0.035,
        evoLevel: 1
    },

    "FROST EVO": {
        type: "EVO",
        damage: 34,
        fireRate: 0.08,
        magazine: 42,
        reserve: 210,
        range: 110,
        recoil: 0.025,
        evoLevel: 1
    },

    "VOID EVO": {
        type: "EVO",
        damage: 60,
        fireRate: 0.20,
        magazine: 25,
        reserve: 125,
        range: 160,
        recoil: 0.04,
        evoLevel: 1
    }
};


/* =========================================================
   BUNDLES
========================================================= */

const BUNDLES = {

    "INFERNO BUNDLE": {
        character: "Inferno GUDU",
        outfit: "Inferno Armor",
        backpack: "Fire Pack",
        weapon: "INFERNO EVO"
    },

    "THUNDER BUNDLE": {
        character: "Thunder GUDU",
        outfit: "Thunder Armor",
        backpack: "Storm Pack",
        weapon: "THUNDER-X EVO"
    },

    "FROST BUNDLE": {
        character: "Frost GUDU",
        outfit: "Frost Armor",
        backpack: "Ice Pack",
        weapon: "FROST EVO"
    },

    "VOID BUNDLE": {
        character: "Void GUDU",
        outfit: "Void Armor",
        backpack: "Dark Pack",
        weapon: "VOID EVO"
    }
};


/* =========================================================
   INVENTORY
========================================================= */

let inventory = {

    selectedGun: "THUNDER-X EVO",

    ownedGuns: [
        "GUDU AR",
        "GUDU SMG",
        "GUDU SHOTGUN",
        "GUDU SNIPER",
        "GUDU PISTOL",
        "THUNDER-X EVO"
    ],

    ownedBundles: [
        "THUNDER BUNDLE"
    ]
};


let currentGun;
let ammo = 0;
let reserveAmmo = 0;


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
   START
========================================================= */

function startGame() {

    if (gameStarted) return;

    gameStarted = true;
    gameOverState = false;

    health = 100;
    kills = 0;

    safeZoneRadius = 75;

    enemies = [];
    bullets = [];
    lootItems = [];

    killCount.textContent = "0";

    healthFill.style.width = "100%";

    healthText.textContent =
        "100 / 100";


    loadGun(
        inventory.selectedGun
    );


    scene =
        new THREE.Scene();

    scene.background =
        new THREE.Color(
            0x83cfff
        );

    scene.fog =
        new THREE.Fog(
            0x83cfff,
            45,
            190
        );


    camera =
        new THREE.PerspectiveCamera(
            75,
            window.innerWidth /
            window.innerHeight,
            0.1,
            500
        );


    renderer =
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


    renderer.shadowMap.enabled =
        true;


    document.body.appendChild(
        renderer.domElement
    );


    clock =
        new THREE.Clock();


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
   LOAD GUN
========================================================= */

function loadGun(name) {

    const data =
        GUNS[name];

    if (!data) return;


    currentGun = name;

    ammo =
        data.magazine;

    reserveAmmo =
        data.reserve;


    ammoCount.textContent =
        ammo;


    if (gun) {

        camera.remove(gun);

        gun = null;
    }
}


/* =========================================================
   LIGHTS
========================================================= */

function createLights() {

    const ambient =
        new THREE.HemisphereLight(
            0xffffff,
            0x355070,
            2.2
        );

    scene.add(ambient);


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

    sun.shadow.mapSize.width =
        2048;

    sun.shadow.mapSize.height =
        2048;

    scene.add(sun);
}


/* =========================================================
   WORLD
========================================================= */

function createWorld() {

    const water =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                350,
                350
            ),
            new THREE.MeshStandardMaterial({
                color: 0x168fc4,
                roughness: 0.25
            })
        );

    water.rotation.x =
        -Math.PI / 2;

    water.position.y =
        -0.15;

    scene.add(water);


    const island =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                100,
                115,
                3,
                64
            ),
            new THREE.MeshStandardMaterial({
                color: 0x438e46
            })
        );

    island.position.y =
        -1.5;

    island.receiveShadow = true;

    scene.add(island);


    const ground =
        new THREE.Mesh(
            new THREE.CircleGeometry(
                97,
                64
            ),
            new THREE.MeshStandardMaterial({
                color: 0x4e9e4d
            })
        );

    ground.rotation.x =
        -Math.PI / 2;

    ground.position.y =
        0.02;

    ground.receiveShadow = true;

    scene.add(ground);


    createBuilding(
        -25, 4, -25,
        14, 8, 12
    );

    createBuilding(
        27, 4, -18,
        12, 8, 12
    );

    createBuilding(
        15, 3, 28,
        16, 6, 11
    );

    createBuilding(
        -30, 3, 25,
        11, 6, 10
    );


    for (
        let i = 0;
        i < 45;
        i++
    ) {

        const x =
            (Math.random() - 0.5) * 165;

        const z =
            (Math.random() - 0.5) * 165;


        if (
            Math.abs(x) < 38 &&
            Math.abs(z) < 38
        ) continue;


        createTree(
            x,
            z
        );
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

    const building =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            new THREE.MeshStandardMaterial({
                color: 0x596b7d
            })
        );


    building.position.set(
        x,
        y,
        z
    );


    building.castShadow = true;

    building.receiveShadow = true;


    scene.add(building);


    const roof =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                Math.max(
                    width,
                    depth
                ) * 0.8,
                4,
                4
            ),
            new THREE.MeshStandardMaterial({
                color: 0x202632
            })
        );


    roof.position.set(
        x,
        y + height / 2 + 2,
        z
    );


    roof.rotation.y =
        Math.PI / 4;


    scene.add(roof);
}


/* =========================================================
   TREE
========================================================= */

function createTree(
    x,
    z
) {

    const trunk =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.45,
                0.65,
                4,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x633d25
            })
        );


    trunk.position.set(
        x,
        2,
        z
    );


    scene.add(trunk);


    const leaves =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                3.2,
                7,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x176b35
            })
        );


    leaves.position.set(
        x,
        6.5,
        z
    );


    scene.add(leaves);
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


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.8,
                1.2,
                0.45
            ),
            new THREE.MeshStandardMaterial({
                color: 0x216cff
            })
        );


    body.position.y =
        1.05;


    player.add(body);


    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.38,
                20,
                20
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffc49a
            })
        );


    head.position.y =
        1.95;


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
   GUN MODEL
========================================================= */

function createGun() {

    gun =
        new THREE.Group();


    const data =
        GUNS[currentGun];


    let gunColor =
        0x15171c;


    if (
        currentGun.includes(
            "THUNDER"
        )
    ) {
        gunColor = 0x31cfff;
    }

    if (
        currentGun.includes(
            "INFERNO"
        )
    ) {
        gunColor = 0xff3b20;
    }

    if (
        currentGun.includes(
            "FROST"
        )
    ) {
        gunColor = 0x83eaff;
    }

    if (
        currentGun.includes(
            "VOID"
        )
    ) {
        gunColor = 0x9b45ff;
    }


    const material =
        new THREE.MeshStandardMaterial({
            color: gunColor,
            metalness: 0.75,
            roughness: 0.2
        });


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.2,
                0.2,
                0.9
            ),
            material
        );


    body.position.z =
        -0.45;


    gun.add(body);


    const barrel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.05,
                0.05,
                0.6,
                12
            ),
            material
        );


    barrel.rotation.x =
        Math.PI / 2;


    barrel.position.z =
        -1;


    gun.add(barrel);


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

    /* 1v1 = ONE BOT */

    for (
        let i = 0;
        i < 1;
        i++
    ) {

        createEnemy();
    }


    aliveCount.textContent =
        "2";
}


function createEnemy() {

    const enemy =
        new THREE.Group();


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.8,
                1.2,
                0.45
            ),
            new THREE.MeshStandardMaterial({
                color: 0xd82f45
            })
        );


    body.position.y =
        1.05;


    enemy.add(body);


    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.38,
                16,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffb58f
            })
        );


    head.position.y =
        1.95;


    enemy.add(head);


    enemy.position.set(
        20,
        0,
        -20
    );


    enemy.userData.health =
        100;


    enemy.userData.speed =
        2.2;


    enemy.userData.attackTimer =
        1;


    scene.add(enemy);

    enemies.push(enemy);
}


/* =========================================================
   BOT AI
========================================================= */

function updateEnemies(delta) {

    if (
        !player ||
        enemies.length === 0
    ) return;


    enemies.forEach(enemy => {

        const distance =
            enemy.position.distanceTo(
                player.position
            );


        const direction =
            new THREE.Vector3()
                .subVectors(
                    player.position,
                    enemy.position
                )
                .normalize();


        /* CHASE */

        if (
            distance > 7 &&
            distance < 70
        ) {

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


        /* BOT ATTACK */

        if (
            distance < 30
        ) {

            enemy.userData.attackTimer -=
                delta;


            if (
                enemy.userData.attackTimer <= 0
            ) {

                damagePlayer(
                    8
                );


                enemy.userData.attackTimer =
                    0.9;
            }
        }
    });
}


/* =========================================================
   SHOOT
========================================================= */

function shoot() {

    if (
        !gameStarted ||
        gameOverState
    ) return;


    if (
        shootCooldown > 0
    ) return;


    const data =
        GUNS[currentGun];


    if (
        ammo <= 0
    ) {

        showMessage(
            "RELOAD!"
        );

        return;
    }


    ammo--;

    ammoCount.textContent =
        ammo;


    createMuzzleFlash();


    const pellets =
        data.type ===
        "SHOTGUN"
            ? data.pellets
            : 1;


    for (
        let p = 0;
        p < pellets;
        p++
    ) {

        createBullet(
            data
        );
    }


    shootCooldown =
        data.fireRate;
}


/* =========================================================
   BULLET
========================================================= */

function createBullet(
    data
) {

    const bullet =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.065,
                8,
                8
            ),
            new THREE.MeshBasicMaterial({
                color:
                    currentGun.includes(
                        "INFERNO"
                    )
                        ? 0xff5b20
                        : currentGun.includes(
                            "FROST"
                        )
                            ? 0x8beaff
                            : currentGun.includes(
                                "VOID"
                            )
                                ? 0xc06cff
                                : 0xffff66
            })
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


    direction.x +=
        (Math.random() - 0.5) *
        data.recoil;


    direction.y +=
        (Math.random() - 0.5) *
        data.recoil;


    direction.normalize();


    bullet.position.copy(
        camera.getWorldPosition(
            new THREE.Vector3()
        )
    );


    bullet.userData.velocity =
        direction.multiplyScalar(
            100
        );


    bullet.userData.damage =
        data.damage;


    bullet.userData.life =
        2.5;


    scene.add(bullet);

    bullets.push(bullet);
}


/* =========================================================
   BULLET UPDATE
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
                .multiplyScalar(
                    delta
                )
        );


        bullet.userData.life -=
            delta;


        let remove =
            false;


        for (
            let j =
                enemies.length - 1;
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
                distance < 1.3
            ) {

                enemy.userData.health -=
                    bullet.userData.damage;


                remove = true;


                if (
                    enemy.userData.health <=
                    0
                ) {

                    scene.remove(
                        enemy
                    );


                    enemies.splice(
                        j,
                        1
                    );


                    kills++;


                    killCount.textContent =
                        kills;


                    aliveCount.textContent =
                        "1";


                    showMessage(
                        "🔥 BOT ELIMINATED!"
                    );


                    setTimeout(
                        victory,
                        700
                    );
                }


                break;
            }
        }


        if (
            remove ||
            bullet.userData.life <= 0
        ) {

            scene.remove(
                bullet
            );


            bullets.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   SAFE ZONE
========================================================= */

function createSafeZone() {

    safeZone =
        new THREE.Mesh(
            new THREE.RingGeometry(
                74,
                75,
                96
            ),
            new THREE.MeshBasicMaterial({
                color: 0x00eaff,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide
            })
        );


    safeZone.rotation.x =
        -Math.PI / 2;


    safeZone.position.y =
        0.12;


    scene.add(
        safeZone
    );
}


function updateSafeZone(delta) {

    if (!safeZone) return;


    if (
        safeZoneRadius >
        safeZoneMinRadius
    ) {

        safeZoneRadius -=
            delta * 0.55;


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

        zoneDamageTimer -=
            delta;


        if (
            zoneDamageTimer <= 0
        ) {

            damagePlayer(
                3
            );


            zoneDamageTimer =
                1;
        }
    }
}


/* =========================================================
   LOOT
========================================================= */

function spawnLoot() {

    for (
        let i = 0;
        i < 20;
        i++
    ) {

        const x =
            (Math.random() - 0.5) * 130;


        const z =
            (Math.random() - 0.5) * 130;


        const type =
            Math.random() > 0.5
                ? "ammo"
                : "medkit";


        const color =
            type === "ammo"
                ? 0xffd43b
                : 0xff304f;


        const item =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.8,
                    0.8,
                    0.8
                ),
                new THREE.MeshStandardMaterial({
                    color,
                    emissive: color,
                    emissiveIntensity: 0.3
                })
            );


        item.position.set(
            x,
            0.6,
            z
        );


        item.userData.type =
            type;


        scene.add(item);

        lootItems.push(item);
    }
}


/* =========================================================
   LOOT UPDATE
========================================================= */

function updateLoot() {

    for (
        let i =
            lootItems.length - 1;
        i >= 0;
        i--
    ) {

        const item =
            lootItems[i];


        item.rotation.y +=
            0.025;


        item.position.y =
            0.6 +
            Math.sin(
                performance.now() *
                0.003
            ) *
            0.15;


        const distance =
            item.position.distanceTo(
                player.position
            );


        if (
            distance < 2
        ) {

            if (
                item.userData.type ===
                "ammo"
            ) {

                reserveAmmo +=
                    30;


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
                    "❤️ +30 HP"
                );
            }


            scene.remove(
                item
            );


            lootItems.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   MUZZLE FLASH
========================================================= */

function createMuzzleFlash() {

    const flash =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.14,
                8,
                8
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffff99
            })
        );


    flash.position.set(
        0,
        0,
        -1.3
    );


    gun.add(
        flash
    );


    setTimeout(() => {

        gun.remove(
            flash
        );

    }, 60);
}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer(delta) {

    const direction =
        new THREE.Vector3();


    if (
        keys["KeyW"]
    )
        direction.z -= 1;


    if (
        keys["KeyS"]
    )
        direction.z += 1;


    if (
        keys["KeyA"]
    )
        direction.x -= 1;


    if (
        keys["KeyD"]
    )
        direction.x += 1;


    const speed =
        keys["ShiftLeft"] ||
        keys["ShiftRight"]
            ? 10
            : 5;


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


    velocityY -=
        18 * delta;


    player.position.y +=
        velocityY *
        delta;


    if (
        player.position.y <= 0
    ) {

        player.position.y = 0;

        velocityY = 0;

        canJump = true;
    }


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
   DAMAGE
========================================================= */

function damagePlayer(
    amount
) {

    if (
        gameOverState
    ) return;


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

        defeat();
    }
}


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

    const data =
        GUNS[currentGun];


    if (
        ammo >=
        data.magazine
    ) return;


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
            gameOverState
        ) return;


        const needed =
            data.magazine -
            ammo;


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
   VICTORY / DEFEAT
========================================================= */

function victory() {

    if (
        gameOverState
    ) return;


    gameOverState = true;
    gameStarted = false;


    showMessage(
        "🏆 1V1 VICTORY!"
    );


    document.exitPointerLock?.();
}


function defeat() {

    gameOverState = true;
    gameStarted = false;


    showMessage(
        "💀 DEFEAT!"
    );


    document.exitPointerLock?.();
}


/* =========================================================
   CONTROLS
========================================================= */

function setupControls() {

    window.addEventListener(
        "keydown",
        event => {

            keys[event.code] =
                true;


            if (
                event.code ===
                "Space" &&
                canJump
            ) {

                velocityY = 7;

                canJump = false;
            }


            if (
                event.code ===
                "KeyR"
            ) {

                reload();
            }


            /* GUN SWITCHING */

            if (
                event.code ===
                "Digit1"
            ) {

                switchGun(
                    "GUDU AR"
                );
            }


            if (
                event.code ===
                "Digit2"
            ) {

                switchGun(
                    "GUDU SMG"
                );
            }


            if (
                event.code ===
                "Digit3"
            ) {

                switchGun(
                    "GUDU SHOTGUN"
                );
            }


            if (
                event.code ===
                "Digit4"
            ) {

                switchGun(
                    "GUDU SNIPER"
                );
            }


            if (
                event.code ===
                "Digit5"
            ) {

                switchGun(
                    "GUDU PISTOL"
                );
            }


            if (
                event.code ===
                "Digit6"
            ) {

                switchGun(
                    "THUNDER-X EVO"
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


    renderer.domElement.addEventListener(
        "click",
        () => {

            renderer
                .domElement
                .requestPointerLock();


            shoot();
        }
    );


    document.addEventListener(
        "mousemove",
        event => {

            if (
                document.pointerLockElement !==
                renderer.domElement
            ) return;


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
   SWITCH GUN
========================================================= */

function switchGun(
    name
) {

    if (
        !inventory.ownedGuns.includes(
            name
        )
    ) {

        showMessage(
            "🔒 LOCKED"
        );

        return;
    }


    inventory.selectedGun =
        name;


    loadGun(
        name
    );


    createGun();


    showMessage(
        "🔫 " + name
    );
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    text
) {

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
   SHOOT TIMER
========================================================= */

function updateShooting(
    delta
) {

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
    ) return;


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


    if (
        gameStarted &&
        !gameOverState
    ) {

        updatePlayer(
            delta
        );


        updateEnemies(
            delta
        );


        updateBullets(
            delta
        );


        updateSafeZone(
            delta
        );


        updateLoot();


        updateShooting(
            delta
        );
    }


    renderer.render(
        scene,
        camera
    );
}

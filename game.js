import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";


/* =========================================================
   GUDU BATTLE
   COMPLETE PLAYABLE 1V1 PROTOTYPE
========================================================= */


/* ================= DATA ================= */

const GUNS = {

    "GUDU AR": {
        damage: 25,
        fireRate: .14,
        magazine: 30,
        reserve: 120,
        range: 100,
        recoil: .025,
        color: 0x20242a
    },

    "GUDU SMG": {
        damage: 17,
        fireRate: .07,
        magazine: 40,
        reserve: 160,
        range: 70,
        recoil: .04,
        color: 0x30343c
    },

    "GUDU SHOTGUN": {
        damage: 12,
        fireRate: .7,
        magazine: 6,
        reserve: 36,
        range: 35,
        recoil: .1,
        pellets: 7,
        color: 0x292019
    },

    "GUDU SNIPER": {
        damage: 90,
        fireRate: 1.2,
        magazine: 5,
        reserve: 25,
        range: 250,
        recoil: .08,
        color: 0x17191d
    },

    "GUDU PISTOL": {
        damage: 30,
        fireRate: .25,
        magazine: 12,
        reserve: 60,
        range: 80,
        recoil: .04,
        color: 0x202020
    },

    "THUNDER-X EVO": {
        damage: 38,
        fireRate: .10,
        magazine: 35,
        reserve: 175,
        range: 130,
        recoil: .025,
        color: 0x00d9ff
    },

    "INFERNO EVO": {
        damage: 45,
        fireRate: .12,
        magazine: 30,
        reserve: 150,
        range: 120,
        recoil: .035,
        color: 0xff3920
    },

    "FROST EVO": {
        damage: 34,
        fireRate: .08,
        magazine: 42,
        reserve: 210,
        range: 110,
        recoil: .025,
        color: 0x78eaff
    },

    "VOID EVO": {
        damage: 60,
        fireRate: .20,
        magazine: 25,
        reserve: 125,
        range: 160,
        recoil: .04,
        color: 0x9d45ff
    }

};


const BUNDLES = {

    "INFERNO BUNDLE": {
        weapon: "INFERNO EVO"
    },

    "THUNDER BUNDLE": {
        weapon: "THUNDER-X EVO"
    },

    "FROST BUNDLE": {
        weapon: "FROST EVO"
    },

    "VOID BUNDLE": {
        weapon: "VOID EVO"
    }

};


/* ================= INVENTORY ================= */

const inventory = {

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


/* ================= VARIABLES ================= */

let scene;
let camera;
let renderer;
let clock;

let player;
let gun;

let enemies = [];
let bullets = [];
let loot = [];

let currentGun =
    inventory.selectedGun;

let ammo = 35;
let reserveAmmo = 175;

let health = 100;
let kills = 0;

let gameRunning = false;
let gameOver = false;

let keys = {};

let yaw = 0;
let pitch = 0;

let velocityY = 0;
let canJump = true;

let shootCooldown = 0;

let zoneRadius = 75;
let zoneDamageTimer = 0;


/* =========================================================
   LOADING
========================================================= */

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            const loading =
                document.getElementById(
                    "loadingScreen"
                );

            loading.style.opacity = "0";

            setTimeout(() => {

                loading.style.display =
                    "none";

            }, 600);

        }, 1300);

    }
);


/* =========================================================
   LOBBY PANELS
========================================================= */

window.showPanel =
function(panel) {

    document
        .querySelectorAll(".panel")
        .forEach(element => {

            element.style.display =
                "none";

        });


    document
        .querySelectorAll(".navButton")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    if (panel === "home") {

        document
            .getElementById(
                "homePanel"
            )
            .style.display =
            "block";

    }


    if (panel === "guns") {

        document
            .getElementById(
                "gunsPanel"
            )
            .style.display =
            "block";

    }


    if (panel === "evo") {

        document
            .getElementById(
                "evoPanel"
            )
            .style.display =
            "block";

    }


    if (panel === "bundles") {

        document
            .getElementById(
                "bundlesPanel"
            )
            .style.display =
            "block";

    }


    if (panel === "inventory") {

        document
            .getElementById(
                "inventoryPanel"
            )
            .style.display =
            "block";

    }


    const buttons =
        document.querySelectorAll(
            ".navButton"
        );


    const index = {

        home: 0,
        guns: 1,
        evo: 2,
        bundles: 3,
        inventory: 4

    };


    if (
        index[panel] !== undefined
    ) {

        buttons[
            index[panel]
        ].classList.add(
            "active"
        );
    }

};


/* =========================================================
   EQUIP GUN
========================================================= */

window.equipGun =
function(name) {

    if (
        !inventory.ownedGuns
            .includes(name)
    ) {

        alert(
            "🔒 Weapon locked!"
        );

        return;
    }


    inventory.selectedGun =
        name;


    currentGun =
        name;


    const element =
        document.getElementById(
            "equippedWeapon"
        );


    if (element) {

        element.textContent =
            name;

    }


    alert(
        "🔫 " +
        name +
        " equipped!"
    );

};


/* =========================================================
   BUNDLE
========================================================= */

window.claimBundle =
function(name) {

    if (
        !inventory.ownedBundles
            .includes(name)
    ) {

        inventory.ownedBundles
            .push(name);


        alert(
            "🎁 " +
            name +
            " unlocked!"
        );

    } else {

        alert(
            "👕 " +
            name +
            " equipped!"
        );

    }


    const bundleElement =
        document.getElementById(
            "equippedBundle"
        );


    if (bundleElement) {

        bundleElement.textContent =
            name;

    }

};


/* =========================================================
   PLAY BUTTON
========================================================= */

document
    .getElementById(
        "playButton"
    )
    .addEventListener(
        "click",
        startBattle
    );


window.startBattle =
function() {

    document
        .getElementById(
            "lobby"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "gameScreen"
        )
        .style.display =
        "block";


    initializeGame();

};


/* =========================================================
   INITIALIZE
========================================================= */

function initializeGame() {

    gameRunning = true;
    gameOver = false;

    health = 100;
    kills = 0;

    zoneRadius = 75;

    enemies = [];
    bullets = [];
    loot = [];

    currentGun =
        inventory.selectedGun;


    const gunData =
        GUNS[currentGun];


    ammo =
        gunData.magazine;


    reserveAmmo =
        gunData.reserve;


    updateHealth();
    updateAmmo();


    scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            0x82cfff
        );


    scene.fog =
        new THREE.Fog(
            0x82cfff,
            50,
            190
        );


    camera =
        new THREE.PerspectiveCamera(
            75,
            window.innerWidth /
            window.innerHeight,
            .1,
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


    document
        .getElementById(
            "gameScreen"
        )
        .appendChild(
            renderer.domElement
        );


    clock =
        new THREE.Clock();


    createLights();
    createWorld();
    createPlayer();
    createGun();
    createEnemy();
    createZone();
    createLoot();
    setupControls();


    window.addEventListener(
        "resize",
        resize
    );


    animate();

}


/* =========================================================
   LIGHTS
========================================================= */

function createLights() {

    const ambient =
        new THREE.HemisphereLight(
            0xffffff,
            0x36546b,
            2.2
        );


    scene.add(
        ambient
    );


    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            3
        );


    sun.position.set(
        40,
        80,
        30
    );


    sun.castShadow =
        true;


    scene.add(
        sun
    );

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
                color: 0x168ec2,
                roughness: .3
            })
        );


    water.rotation.x =
        -Math.PI / 2;


    water.position.y =
        -.2;


    scene.add(
        water
    );


    const island =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                105,
                120,
                4,
                64
            ),
            new THREE.MeshStandardMaterial({
                color: 0x438f48
            })
        );


    island.position.y =
        -2;


    island.receiveShadow =
        true;


    scene.add(
        island
    );


    const ground =
        new THREE.Mesh(
            new THREE.CircleGeometry(
                102,
                64
            ),
            new THREE.MeshStandardMaterial({
                color: 0x4e9d4c
            })
        );


    ground.rotation.x =
        -Math.PI / 2;


    ground.position.y =
        .05;


    scene.add(
        ground
    );


    for (
        let i = 0;
        i < 35;
        i++
    ) {

        const x =
            (Math.random() - .5) * 170;


        const z =
            (Math.random() - .5) * 170;


        createTree(
            x,
            z
        );

    }


    createBuilding(
        -25,
        4,
        -25,
        14,
        8,
        12
    );


    createBuilding(
        30,
        4,
        -20,
        14,
        8,
        12
    );


    createBuilding(
        20,
        3,
        30,
        16,
        6,
        12
    );

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
                .45,
                .65,
                4,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x62402a
            })
        );


    trunk.position.set(
        x,
        2,
        z
    );


    scene.add(
        trunk
    );


    const leaves =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                3.2,
                7,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x176a35
            })
        );


    leaves.position.set(
        x,
        6.5,
        z
    );


    scene.add(
        leaves
    );

}


/* =========================================================
   BUILDING
========================================================= */

function createBuilding(
    x,
    y,
    z,
    w,
    h,
    d
) {

    const building =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                w,
                h,
                d
            ),
            new THREE.MeshStandardMaterial({
                color: 0x5d6975
            })
        );


    building.position.set(
        x,
        y,
        z
    );


    building.castShadow =
        true;


    scene.add(
        building
    );


    const roof =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                Math.max(w,d) * .75,
                4,
                4
            ),
            new THREE.MeshStandardMaterial({
                color: 0x202632
            })
        );


    roof.position.set(
        x,
        y + h / 2 + 2,
        z
    );


    roof.rotation.y =
        Math.PI / 4;


    scene.add(
        roof
    );

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
        20
    );


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .8,
                1.2,
                .45
            ),
            new THREE.MeshStandardMaterial({
                color: 0x216cff
            })
        );


    body.position.y =
        1.05;


    player.add(
        body
    );


    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .38,
                20,
                20
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffc49a
            })
        );


    head.position.y =
        1.95;


    player.add(
        head
    );


    scene.add(
        player
    );


    camera.position.set(
        0,
        1.6,
        4
    );


    player.add(
        camera
    );

}


/* =========================================================
   GUN
========================================================= */

function createGun() {

    if (gun) {

        camera.remove(
            gun
        );

    }


    gun =
        new THREE.Group();


    const data =
        GUNS[currentGun];


    const material =
        new THREE.MeshStandardMaterial({
            color: data.color,
            metalness: .7,
            roughness: .2
        });


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .2,
                .2,
                .9
            ),
            material
        );


    body.position.z =
        -.45;


    gun.add(
        body
    );


    const barrel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .05,
                .05,
                .6,
                12
            ),
            material
        );


    barrel.rotation.x =
        Math.PI / 2;


    barrel.position.z =
        -1;


    gun.add(
        barrel
    );


    gun.position.set(
        .55,
        -.42,
        -.9
    );


    camera.add(
        gun
    );

}


/* =========================================================
   ENEMY
========================================================= */

function createEnemy() {

    const enemy =
        new THREE.Group();


    enemy.position.set(
        20,
        0,
        -25
    );


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .8,
                1.2,
                .45
            ),
            new THREE.MeshStandardMaterial({
                color: 0xe32e45
            })
        );


    body.position.y =
        1.05;


    enemy.add(
        body
    );


    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .38,
                20,
                20
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffb58f
            })
        );


    head.position.y =
        1.95;


    enemy.add(
        head
    );


    enemy.userData.health =
        100;


    enemy.userData.timer =
        1;


    scene.add(
        enemy
    );


    enemies.push(
        enemy
    );

}


/* =========================================================
   BOT AI
========================================================= */

function updateEnemies(
    delta
) {

    if (
        enemies.length === 0
    ) return;


    enemies.forEach(
        enemy => {

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


            if (
                distance > 7 &&
                distance < 80
            ) {

                enemy.position.x +=
                    direction.x *
                    2.3 *
                    delta;


                enemy.position.z +=
                    direction.z *
                    2.3 *
                    delta;


                enemy.lookAt(
                    player.position.x,
                    enemy.position.y,
                    player.position.z
                );

            }


            if (
                distance < 30
            ) {

                enemy.userData.timer -=
                    delta;


                if (
                    enemy.userData.timer <= 0
                ) {

                    damagePlayer(
                        7
                    );


                    enemy.userData.timer =
                        .9;

                }

            }

        }
    );

}


/* =========================================================
   SHOOT
========================================================= */

function shoot() {

    if (
        !gameRunning ||
        gameOver
    ) return;


    if (
        shootCooldown > 0
    ) return;


    if (
        ammo <= 0
    ) {

        showMessage(
            "🔄 RELOAD!"
        );

        return;
    }


    const data =
        GUNS[currentGun];


    ammo--;

    updateAmmo();


    createMuzzleFlash();


    const pellets =
        data.pellets || 1;


    for (
        let i = 0;
        i < pellets;
        i++
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
                .065,
                8,
                8
            ),
            new THREE.MeshBasicMaterial({
                color:
                    data.color
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
        (Math.random() - .5) *
        data.recoil;


    direction.y +=
        (Math.random() - .5) *
        data.recoil;


    direction.normalize();


    bullet.position.copy(
        camera.getWorldPosition(
            new THREE.Vector3()
        )
    );


    bullet.userData.velocity =
        direction.multiplyScalar(
            110
        );


    bullet.userData.damage =
        data.damage;


    bullet.userData.life =
        2.5;


    scene.add(
        bullet
    );


    bullets.push(
        bullet
    );

}


/* =========================================================
   BULLET UPDATE
========================================================= */

function updateBullets(
    delta
) {

    for (
        let i =
            bullets.length - 1;
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
                distance < 1.35
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


                    document
                        .getElementById(
                            "killCount"
                        )
                        .textContent =
                        kills;


                    document
                        .getElementById(
                            "aliveCount"
                        )
                        .textContent =
                        "1";


                    showMessage(
                        "🏆 BOT ELIMINATED!"
                    );


                    setTimeout(
                        victory,
                        800
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

function createZone() {

    const zone =
        new THREE.Mesh(
            new THREE.RingGeometry(
                74,
                75,
                96
            ),
            new THREE.MeshBasicMaterial({
                color: 0x00eaff,
                transparent: true,
                opacity: .8,
                side: THREE.DoubleSide
            })
        );


    zone.rotation.x =
        -Math.PI / 2;


    zone.position.y =
        .12;


    zone.name =
        "SAFE_ZONE";


    scene.add(
        zone
    );

}


/* =========================================================
   ZONE UPDATE
========================================================= */

function updateZone(
    delta
) {

    const zone =
        scene.getObjectByName(
            "SAFE_ZONE"
        );


    if (!zone) return;


    if (
        zoneRadius > 12
    ) {

        zoneRadius -=
            delta * .5;


        const scale =
            zoneRadius / 75;


        zone.scale.set(
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
        zoneRadius
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

function createLoot() {

    for (
        let i = 0;
        i < 15;
        i++
    ) {

        const item =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    .8,
                    .8,
                    .8
                ),
                new THREE.MeshStandardMaterial({
                    color:
                        i % 2 === 0
                            ? 0xffd633
                            : 0xff304f
                })
            );


        item.position.set(
            (Math.random() - .5) * 130,
            .6,
            (Math.random() - .5) * 130
        );


        item.userData.type =
            i % 2 === 0
                ? "ammo"
                : "health";


        scene.add(
            item
        );


        loot.push(
            item
        );

    }

}


/* =========================================================
   LOOT UPDATE
========================================================= */

function updateLoot() {

    loot.forEach(
        item => {

            item.rotation.y +=
                .02;


            item.position.y =
                .6 +
                Math.sin(
                    performance.now() *
                    .003
                ) * .15;

        }
    );


    for (
        let i =
            loot.length - 1;
        i >= 0;
        i--
    ) {

        const item =
            loot[i];


        if (
            item.position.distanceTo(
                player.position
            ) < 2
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

            } else {

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


            loot.splice(
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
                .14,
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


    setTimeout(
        () => {

            if (gun) {

                gun.remove(
                    flash
                );

            }

        },
        60
    );

}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer(
    delta
) {

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

        player.position.y =
            0;


        velocityY =
            0;


        canJump =
            true;

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
        gameOver
    ) return;


    health -=
        amount;


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


/* =========================================================
   HEALTH
========================================================= */

function updateHealth() {

    document
        .getElementById(
            "healthFill"
        )
        .style.width =
        health + "%";


    document
        .getElementById(
            "healthText"
        )
        .textContent =
        health +
        " / 100";

}


/* =========================================================
   AMMO
========================================================= */

function updateAmmo() {

    document
        .getElementById(
            "ammoCount"
        )
        .textContent =
        ammo;

}


/* =========================================================
   RELOAD
========================================================= */

function reload() {

    if (
        gameOver
    ) return;


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


    setTimeout(
        () => {

            if (gameOver)
                return;


            const needed =
                data.magazine -
                ammo;


            const amount =
                Math.min(
                    needed,
                    reserveAmmo
                );


            ammo +=
                amount;


            reserveAmmo -=
                amount;


            updateAmmo();


            showMessage(
                "🔫 RELOADED"
            );

        },
        700
    );

}


/* =========================================================
   VICTORY
========================================================= */

function victory() {

    if (
        gameOver
    ) return;


    gameOver =
        true;


    gameRunning =
        false;


    showMessage(
        "🏆 VICTORY! 1V1 WON!"
    );


    document.exitPointerLock?.();

}


/* =========================================================
   DEFEAT
========================================================= */

function defeat() {

    gameOver =
        true;


    gameRunning =
        false;


    showMessage(
        "💀 DEFEAT!"
    );


    document.exitPointerLock?.();

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message
) {

    const element =
        document.getElementById(
            "gameMessage"
        );


    element.textContent =
        message;


    element.style.opacity =
        "1";


    setTimeout(
        () => {

            element.style.opacity =
                "0";

        },
        1300
    );

}


/* =========================================================
   CONTROLS
========================================================= */

function setupControls() {

    window.onkeydown =
        event => {

            keys[event.code] =
                true;


            if (
                event.code ===
                "Space" &&
                canJump
            ) {

                velocityY =
                    7;


                canJump =
                    false;

            }


            if (
                event.code ===
                "KeyR"
            ) {

                reload();

            }


            if (
                event.code ===
                "Digit1"
            ) {

                changeGun(
                    "GUDU AR"
                );

            }


            if (
                event.code ===
                "Digit2"
            ) {

                changeGun(
                    "GUDU SMG"
                );

            }


            if (
                event.code ===
                "Digit3"
            ) {

                changeGun(
                    "GUDU SHOTGUN"
                );

            }


            if (
                event.code ===
                "Digit4"
            ) {

                changeGun(
                    "GUDU SNIPER"
                );

            }


            if (
                event.code ===
                "Digit5"
            ) {

                changeGun(
                    "GUDU PISTOL"
                );

            }


            if (
                event.code ===
                "Digit6"
            ) {

                changeGun(
                    "THUNDER-X EVO"
                );

            }


            if (
                event.code ===
                "Digit7"
            ) {

                changeGun(
                    "INFERNO EVO"
                );

            }


            if (
                event.code ===
                "Digit8"
            ) {

                changeGun(
                    "FROST EVO"
                );

            }


            if (
                event.code ===
                "Digit9"
            ) {

                changeGun(
                    "VOID EVO"
                );

            }

        };


    window.onkeyup =
        event => {

            keys[event.code] =
                false;

        };


    renderer
        .domElement
        .addEventListener(
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
                .002;


            pitch -=
                event.movementY *
                .002;


            pitch =
                THREE.MathUtils.clamp(
                    pitch,
                    -1.3,
                    1.3
                );


            player.rotation.y =
                yaw;


            camera.rotation.x =
                pitch;

        }
    );

}


/* =========================================================
   CHANGE GUN
========================================================= */

function changeGun(
    name
) {

    if (
        !inventory.ownedGuns
            .includes(name)
    ) {

        showMessage(
            "🔒 LOCKED"
        );

        return;
    }


    currentGun =
        name;


    inventory.selectedGun =
        name;


    const data =
        GUNS[name];


    ammo =
        data.magazine;


    reserveAmmo =
        data.reserve;


    updateAmmo();


    createGun();


    showMessage(
        "🔫 " + name
    );

}


/* =========================================================
   BACK TO LOBBY
========================================================= */

window.backToLobby =
function() {

    gameRunning =
        false;


    gameOver =
        true;


    document.exitPointerLock?.();


    if (renderer) {

        renderer
            .domElement
            .remove();

    }


    document
        .getElementById(
            "gameScreen"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "lobby"
        )
        .style.display =
        "block";

};


/* =========================================================
   RESIZE
========================================================= */

function resize() {

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


    if (!clock)
        return;


    const delta =
        Math.min(
            clock.getDelta(),
            .05
        );


    if (
        gameRunning &&
        !gameOver
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


        updateZone(
            delta
        );


        updateLoot();


        if (
            shootCooldown > 0
        ) {

            shootCooldown -=
                delta;

        }

    }


    renderer.render(
        scene,
        camera
    );

}

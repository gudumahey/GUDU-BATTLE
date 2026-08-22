import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";


/* =====================================================
   GUDU BATTLE
   1V1 BOT SYSTEM
===================================================== */


/* ================= WEAPONS ================= */

const GUNS = {

    "GUDU AR": {
        damage: 25,
        fireRate: .15,
        magazine: 30,
        reserve: 120,
        color: 0x333333
    },

    "GUDU SMG": {
        damage: 17,
        fireRate: .07,
        magazine: 40,
        reserve: 160,
        color: 0x444444
    },

    "GUDU SHOTGUN": {
        damage: 12,
        fireRate: .7,
        magazine: 6,
        reserve: 36,
        pellets: 7,
        color: 0x332211
    },

    "GUDU SNIPER": {
        damage: 90,
        fireRate: 1.2,
        magazine: 5,
        reserve: 25,
        color: 0x222222
    },

    "GUDU PISTOL": {
        damage: 30,
        fireRate: .25,
        magazine: 12,
        reserve: 60,
        color: 0x111111
    },

    "THUNDER-X EVO": {
        damage: 38,
        fireRate: .10,
        magazine: 35,
        reserve: 175,
        color: 0x00d9ff
    },

    "INFERNO EVO": {
        damage: 45,
        fireRate: .12,
        magazine: 30,
        reserve: 150,
        color: 0xff3b20
    },

    "FROST EVO": {
        damage: 34,
        fireRate: .08,
        magazine: 42,
        reserve: 210,
        color: 0x77eaff
    },

    "VOID EVO": {
        damage: 60,
        fireRate: .20,
        magazine: 25,
        reserve: 125,
        color: 0x9d45ff
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
    ]

};


/* ================= GAME VARIABLES ================= */

let scene;
let camera;
let renderer;
let clock;

let player;
let gun;

let bot;

let bullets = [];

let health = 100;
let botHP = 100;

let ammo = 35;
let reserveAmmo = 175;

let kills = 0;

let currentGun =
    inventory.selectedGun;

let gameRunning = false;
let gameOver = false;

let keys = {};

let yaw = 0;
let pitch = 0;

let velocityY = 0;
let canJump = true;

let shootCooldown = 0;

let botShootTimer = 0;
let botMoveTimer = 0;

let botStrafeDirection = 1;


/* =====================================================
   LOADING
===================================================== */

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            const loading =
                document.getElementById(
                    "loadingScreen"
                );

            loading.style.opacity =
                "0";

            setTimeout(() => {

                loading.style.display =
                    "none";

            }, 500);

        }, 1200);

    }
);


/* =====================================================
   PANEL SYSTEM
===================================================== */

window.showPanel =
function(panel) {

    document
        .querySelectorAll(".panel")
        .forEach(p => {

            p.style.display =
                "none";

        });


    document
        .querySelectorAll(".navButton")
        .forEach(b => {

            b.classList.remove(
                "active"
            );

        });


    const panels = {

        home:
            "homePanel",

        guns:
            "gunsPanel",

        evo:
            "evoPanel",

        bundles:
            "bundlesPanel",

        inventory:
            "inventoryPanel"

    };


    if (
        panels[panel]
    ) {

        document
            .getElementById(
                panels[panel]
            )
            .style.display =
            "block";

    }


    const indexes = {

        home: 0,
        guns: 1,
        evo: 2,
        bundles: 3,
        inventory: 4

    };


    if (
        indexes[panel] !==
        undefined
    ) {

        document
            .querySelectorAll(
                ".navButton"
            )
            [
                indexes[panel]
            ]
            .classList.add(
                "active"
            );

    }

};


/* =====================================================
   EQUIP WEAPON
===================================================== */

window.equipGun =
function(name) {

    if (
        !inventory.ownedGuns
            .includes(name)
    ) {

        alert(
            "🔒 WEAPON LOCKED"
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
        " EQUIPPED"
    );

};


/* =====================================================
   BUNDLE
===================================================== */

window.claimBundle =
function(name) {

    document
        .getElementById(
            "equippedBundle"
        )
        .textContent =
        name;


    alert(
        "👕 " +
        name +
        " EQUIPPED"
    );

};


/* =====================================================
   PLAY BUTTON
===================================================== */

document
    .getElementById(
        "playButton"
    )
    .addEventListener(
        "click",
        startBattle
    );


/* =====================================================
   START 1V1
===================================================== */

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


/* =====================================================
   INITIALIZE GAME
===================================================== */

function initializeGame() {

    gameRunning =
        true;

    gameOver =
        false;

    health =
        100;

    botHP =
        100;

    kills =
        0;


    currentGun =
        inventory.selectedGun;


    const data =
        GUNS[currentGun];


    ammo =
        data.magazine;

    reserveAmmo =
        data.reserve;


    updateHealth();

    updateBotHealth();

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
            180
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

    createBot();

    setupControls();

    animate();

}


/* =====================================================
   LIGHTS
===================================================== */

function createLights() {

    const ambient =
        new THREE.HemisphereLight(
            0xffffff,
            0x35536c,
            2
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


/* =====================================================
   WORLD
===================================================== */

function createWorld() {

    const water =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                350,
                350
            ),
            new THREE.MeshStandardMaterial({
                color: 0x168ec2
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
                color: 0x4c994b
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

        createTree(
            (Math.random() - .5) * 170,
            (Math.random() - .5) * 170
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


/* =====================================================
   TREE
===================================================== */

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


/* =====================================================
   BUILDING
===================================================== */

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


    scene.add(
        building
    );

}


/* =====================================================
   PLAYER
===================================================== */

function createPlayer() {

    player =
        new THREE.Group();


    player.position.set(
        0,
        0,
        25
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


/* =====================================================
   GUN
===================================================== */

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
            roughness: .25
        });


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .22,
                .22,
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


/* =====================================================
   CREATE BOT
===================================================== */

function createBot() {

    bot =
        new THREE.Group();


    bot.position.set(
        20,
        0,
        -25
    );


    /* BODY */

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .9,
                1.3,
                .5
            ),
            new THREE.MeshStandardMaterial({
                color: 0xd82e42
            })
        );


    body.position.y =
        1.05;


    body.castShadow =
        true;


    bot.add(
        body
    );


    /* HEAD */

    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .4,
                20,
                20
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffb58f
            })
        );


    head.position.y =
        1.95;


    bot.add(
        head
    );


    /* BOT WEAPON */

    const weapon =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .18,
                .18,
                1
            ),
            new THREE.MeshStandardMaterial({
                color: 0x222222
            })
        );


    weapon.position.set(
        .6,
        1.1,
        -.6
    );


    bot.add(
        weapon
    );


    bot.userData.hp =
        100;


    bot.userData.shootTimer =
        1;


    bot.userData.moveTimer =
        0;


    scene.add(
        bot
    );

}


/* =====================================================
   BOT AI
===================================================== */

function updateBot(
    delta
) {

    if (
        !bot ||
        gameOver
    ) return;


    const distance =
        bot.position.distanceTo(
            player.position
        );


    /* FACE PLAYER */

    bot.lookAt(
        player.position.x,
        bot.position.y,
        player.position.z
    );


    /* MOVE TOWARDS PLAYER */

    if (
        distance > 8
    ) {

        const direction =
            new THREE.Vector3()
                .subVectors(
                    player.position,
                    bot.position
                )
                .normalize();


        bot.position.x +=
            direction.x *
            2.4 *
            delta;


        bot.position.z +=
            direction.z *
            2.4 *
            delta;

    }


    /* STRAFE */

    if (
        distance <= 14
    ) {

        botMoveTimer -=
            delta;


        if (
            botMoveTimer <= 0
        ) {

            botStrafeDirection *=
                -1;


            botMoveTimer =
                1.5;

        }


        const side =
            new THREE.Vector3(
                1,
                0,
                0
            );


        side.applyQuaternion(
            bot.quaternion
        );


        bot.position.add(
            side.multiplyScalar(
                botStrafeDirection *
                1.2 *
                delta
            )
        );

    }


    /* SHOOT PLAYER */

    if (
        distance < 38
    ) {

        botShootTimer -=
            delta;


        if (
            botShootTimer <= 0
        ) {

            botShoot();


            botShootTimer =
                .7 +
                Math.random() * .6;

        }

    }

}


/* =====================================================
   BOT SHOOT
===================================================== */

function botShoot() {

    if (
        gameOver
    ) return;


    /* BOT AIM */

    const target =
        player.position.clone();


    target.y += 1.2;


    const botPos =
        bot.position.clone();


    botPos.y += 1.4;


    const direction =
        new THREE.Vector3()
            .subVectors(
                target,
                botPos
            )
            .normalize();


    /* SMALL AI AIM ERROR */

    direction.x +=
        (Math.random() - .5) *
        .08;


    direction.y +=
        (Math.random() - .5) *
        .05;


    direction.normalize();


    /* VISUAL BULLET */

    const bullet =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .07,
                8,
                8
            ),
            new THREE.MeshBasicMaterial({
                color: 0xff3030
            })
        );


    bullet.position.copy(
        botPos
    );


    bullet.userData.velocity =
        direction.multiplyScalar(
            65
        );


    bullet.userData.life =
        1.5;


    scene.add(
        bullet
    );


    bullets.push(
        bullet
    );


    /* AI DAMAGE */

    const accuracy =
        Math.random();


    if (
        accuracy < .72
    ) {

        damagePlayer(
            8
        );

    }

}


/* =====================================================
   PLAYER SHOOT
===================================================== */

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


    shootCooldown =
        data.fireRate;


    createMuzzleFlash();


    const pellets =
        data.pellets || 1;


    for (
        let i = 0;
        i < pellets;
        i++
    ) {

        createPlayerBullet(
            data
        );

    }

}


/* =====================================================
   PLAYER BULLET
===================================================== */

function createPlayerBullet(
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
                color: data.color
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
        .025;


    direction.y +=
        (Math.random() - .5) *
        .025;


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


    bullet.userData.owner =
        "player";


    bullet.userData.life =
        2;


    scene.add(
        bullet
    );


    bullets.push(
        bullet
    );

}


/* =====================================================
   BULLETS
===================================================== */

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


        /* PLAYER BULLET */

        if (
            bullet.userData.owner ===
            "player"
        ) {

            const target =
                bot.position.clone();


            target.y += 1;


            const distance =
                bullet.position.distanceTo(
                    target
                );


            if (
                distance < 1.3
            ) {

                botHP -=
                    bullet.userData.damage;


                botHP =
                    Math.max(
                        0,
                        botHP
                    );


                updateBotHealth();


                remove =
                    true;


                showMessage(
                    "💥 HIT!"
                );


                if (
                    botHP <= 0
                ) {

                    winBattle();

                }

            }

        }


        /* BOT BULLET */

        if (
            bullet.userData.owner !==
            "player"
        ) {

            const target =
                player.position.clone();


            target.y += 1;


            if (
                bullet.position.distanceTo(
                    target
                ) < 1.2
            ) {

                remove =
                    true;

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


/* =====================================================
   MUZZLE
===================================================== */

function createMuzzleFlash() {

    if (!gun)
        return;


    const flash =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .15,
                8,
                8
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffffaa
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

            gun?.remove(
                flash
            );

        },
        50
    );

}


/* =====================================================
   MOVEMENT
===================================================== */

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
        18 *
        delta;


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

}


/* =====================================================
   PLAYER DAMAGE
===================================================== */

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

        loseBattle();

    }

}


/* =====================================================
   HEALTH UI
===================================================== */

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


/* =====================================================
   BOT HEALTH UI
===================================================== */

function updateBotHealth() {

    document
        .getElementById(
            "botHealthFill"
        )
        .style.width =
        botHP + "%";


    document
        .getElementById(
            "botHealth"
        )
        .textContent =
        botHP;

}


/* =====================================================
   AMMO
===================================================== */

function updateAmmo() {

    document
        .getElementById(
            "ammoCount"
        )
        .textContent =
        ammo;

}


/* =====================================================
   RELOAD
===================================================== */

function reload() {

    if (
        gameOver
    ) return;


    const data =
        GUNS[currentGun];


    if (
        ammo >=
        data.magazine
    )
        return;


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

            if (
                gameOver
            )
                return;


            const need =
                data.magazine -
                ammo;


            const amount =
                Math.min(
                    need,
                    reserveAmmo
                );


            ammo +=
                amount;


            reserveAmmo -=
                amount;


            updateAmmo();


        },
        700
    );

}


/* =====================================================
   WIN
===================================================== */

function winBattle() {

    if (
        gameOver
    ) return;


    gameOver =
        true;


    gameRunning =
        false;


    kills = 1;


    document
        .getElementById(
            "killCount"
        )
        .textContent =
        "1";


    showMessage(
        "🏆 VICTORY! BOT ELIMINATED!"
    );


    document.exitPointerLock?.();

}


/* =====================================================
   LOSE
===================================================== */

function loseBattle() {

    if (
        gameOver
    ) return;


    gameOver =
        true;


    gameRunning =
        false;


    showMessage(
        "💀 DEFEAT! BOT WINS!"
    );


    document.exitPointerLock?.();

}


/* =====================================================
   MESSAGE
===================================================== */

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
        1200
    );

}


/* =====================================================
   CONTROLS
===================================================== */

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


            /* WEAPON SWITCH */

            const weapons = [

                "GUDU AR",
                "GUDU SMG",
                "GUDU SHOTGUN",
                "GUDU SNIPER",
                "GUDU PISTOL",
                "THUNDER-X EVO",
                "INFERNO EVO",
                "FROST EVO",
                "VOID EVO"

            ];


            const number =
                parseInt(
                    event.key
                );


            if (
                number >= 1 &&
                number <= 9
            ) {

                changeGun(
                    weapons[number - 1]
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
            )
                return;


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


/* =====================================================
   CHANGE GUN
===================================================== */

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
        "🔫 " +
        name
    );

}


/* =====================================================
   BACK TO LOBBY
===================================================== */

window.backToLobby =
function() {

    gameRunning =
        false;

    gameOver =
        true;


    document.exitPointerLock?.();


    if (
        renderer &&
        renderer.domElement
    ) {

        renderer.domElement.remove();

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


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
    "resize",
    () => {

        if (
            !camera ||
            !renderer
        )
            return;


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


/* =====================================================
   GAME LOOP
===================================================== */

function animate() {

    requestAnimationFrame(
        animate
    );


    if (
        !clock ||
        !renderer
    )
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


        updateBot(
            delta
        );


        updateBullets(
            delta
        );


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

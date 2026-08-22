import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";


console.log("GUDU GAME JS LOADED");


/* ================= DATA ================= */

const GUNS = {

    "GUDU AR":{
        damage:25,
        fireRate:.16,
        magazine:30,
        reserve:120,
        color:0x333333
    },

    "GUDU SMG":{
        damage:17,
        fireRate:.07,
        magazine:40,
        reserve:160,
        color:0x444444
    },

    "GUDU SHOTGUN":{
        damage:12,
        fireRate:.7,
        magazine:6,
        reserve:36,
        pellets:7,
        color:0x332211
    },

    "GUDU SNIPER":{
        damage:90,
        fireRate:1.2,
        magazine:5,
        reserve:25,
        color:0x222222
    },

    "GUDU PISTOL":{
        damage:30,
        fireRate:.25,
        magazine:12,
        reserve:60,
        color:0x111111
    },

    "THUNDER-X EVO":{
        damage:38,
        fireRate:.10,
        magazine:35,
        reserve:175,
        color:0x00d9ff
    },

    "INFERNO EVO":{
        damage:45,
        fireRate:.12,
        magazine:30,
        reserve:150,
        color:0xff3b20
    },

    "FROST EVO":{
        damage:34,
        fireRate:.08,
        magazine:42,
        reserve:210,
        color:0x77eaff
    },

    "VOID EVO":{
        damage:60,
        fireRate:.20,
        magazine:25,
        reserve:125,
        color:0x9d45ff
    }

};


let selectedGun = "THUNDER-X EVO";

let selectedDifficulty = "medium";

let selectedBundle = "THUNDER BUNDLE";


/* ================= GAME VARIABLES ================= */

let scene;
let camera;
let renderer;
let clock;

let player;
let bot;
let gun;

let bullets = [];

let health = 100;
let botHP = 100;

let ammo = 35;
let reserveAmmo = 175;

let kills = 0;

let yaw = 0;
let pitch = 0;

let velocityY = 0;
let canJump = true;

let keys = {};

let shootCooldown = 0;
let botShootTimer = 0;

let gameRunning = false;
let gameOver = false;

let botStrafe = 1;
let botMoveTimer = 0;


/* ================= LOADING ================= */

window.addEventListener("load",()=>{

    setTimeout(()=>{

        const screen =
            document.getElementById(
                "loadingScreen"
            );

        screen.style.opacity="0";

        setTimeout(()=>{
            screen.style.display="none";
        },500);

    },1200);

});


/* ================= PANELS ================= */

window.showPanel=function(id){

    document
    .querySelectorAll(".panel")
    .forEach(panel=>{
        panel.classList.remove(
            "activePanel"
        );
    });


    document
    .getElementById(id)
    .classList.add(
        "activePanel"
    );


    document
    .querySelectorAll(".nav")
    .forEach(button=>{
        button.classList.remove(
            "active"
        );
    });

};


/* ================= 1V1 LOBBY ================= */

window.open1v1Lobby=function(){

    document.getElementById(
        "home"
    ).style.display="none";


    document.getElementById(
        "oneLobby"
    ).style.display="block";


    document.getElementById(
        "lobbyWeapon"
    ).textContent=selectedGun;


    document.getElementById(
        "lobbyGun"
    ).textContent=selectedGun;

};


window.close1v1Lobby=function(){

    document.getElementById(
        "oneLobby"
    ).style.display="none";


    document.getElementById(
        "home"
    ).style.display="block";

};


/* ================= DIFFICULTY ================= */

window.selectDifficulty=function(level){

    selectedDifficulty=level;


    document
    .querySelectorAll(
        ".difficultyButtons button"
    )
    .forEach(button=>{
        button.classList.remove(
            "selected"
        );
    });


    document
    .getElementById(
        level+"Btn"
    )
    .classList.add(
        "selected"
    );


    const text={
        easy:"AI LEVEL 2",
        medium:"AI LEVEL 5",
        hard:"AI LEVEL 10"
    };


    document.getElementById(
        "botLevelText"
    ).textContent=text[level];

};


/* ================= READY ================= */

window.readyMatch=function(){

    const lobby =
        document.getElementById(
            "oneLobby"
        );

    lobby.style.display="none";


    startCountdown();

};


/* ================= COUNTDOWN ================= */

function startCountdown(){

    const countdown =
        document.getElementById(
            "countdown"
        );

    const number =
        document.getElementById(
            "countNumber"
        );


    countdown.style.display="flex";


    let count=3;


    number.textContent=count;


    const timer=setInterval(()=>{

        count--;


        if(count>0){

            number.textContent=count;

        }else{

            clearInterval(timer);

            number.textContent="FIGHT!";


            setTimeout(()=>{

                countdown.style.display="none";

                startGame();

            },700);

        }

    },900);

}


/* ================= GUN ================= */

window.equipGun=function(name){

    selectedGun=name;


    document.getElementById(
        "inventoryGun"
    ).textContent=name;


    document.getElementById(
        "lobbyWeapon"
    ).textContent=name;


    document.getElementById(
        "lobbyGun"
    ).textContent=name;


    showMessageSimple(
        "🔫 "+name+" EQUIPPED"
    );

};


window.equipBundle=function(name){

    selectedBundle=name;


    document.getElementById(
        "inventoryBundle"
    ).textContent=name;


    showMessageSimple(
        "👕 "+name+" EQUIPPED"
    );

};


function showMessageSimple(text){

    alert(text);

}


/* ================= START GAME ================= */

function startGame(){

    gameRunning=true;
    gameOver=false;

    health=100;
    botHP=100;
    kills=0;


    const gunData =
        GUNS[selectedGun];


    ammo=gunData.magazine;
    reserveAmmo=gunData.reserve;


    updateHealth();
    updateBotHealth();
    updateAmmo();


    document.getElementById(
        "gameScreen"
    ).style.display="block";


    scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            0x86cfff
        );


    scene.fog =
        new THREE.Fog(
            0x86cfff,
            50,
            190
        );


    camera =
        new THREE.PerspectiveCamera(
            75,
            innerWidth/innerHeight,
            .1,
            500
        );


    renderer =
        new THREE.WebGLRenderer({
            antialias:true
        });


    renderer.setSize(
        innerWidth,
        innerHeight
    );


    renderer.setPixelRatio(
        Math.min(
            devicePixelRatio,
            2
        )
    );


    document.getElementById(
        "gameScreen"
    ).appendChild(
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


/* ================= LIGHTS ================= */

function createLights(){

    const ambient =
        new THREE.HemisphereLight(
            0xffffff,
            0x31546b,
            2
        );

    scene.add(ambient);


    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            3
        );

    sun.position.set(
        40,80,30
    );

    scene.add(sun);

}


/* ================= WORLD ================= */

function createWorld(){

    const water =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                350,
                350
            ),
            new THREE.MeshStandardMaterial({
                color:0x168fc5
            })
        );


    water.rotation.x=
        -Math.PI/2;

    water.position.y=-.2;

    scene.add(water);


    const island =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                105,
                120,
                4,
                64
            ),
            new THREE.MeshStandardMaterial({
                color:0x458e47
            })
        );


    island.position.y=-2;

    scene.add(island);


    const ground =
        new THREE.Mesh(
            new THREE.CircleGeometry(
                102,
                64
            ),
            new THREE.MeshStandardMaterial({
                color:0x4e9b4e
            })
        );


    ground.rotation.x=
        -Math.PI/2;

    ground.position.y=.05;

    scene.add(ground);


    for(let i=0;i<35;i++){

        createTree(
            (Math.random()-.5)*170,
            (Math.random()-.5)*170
        );

    }


    createBuilding(
        -25,4,-25,
        14,8,12
    );


    createBuilding(
        30,4,-20,
        14,8,12
    );


    createBuilding(
        20,3,30,
        16,6,12
    );

}


/* ================= TREE ================= */

function createTree(x,z){

    const trunk =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .45,.65,4,8
            ),
            new THREE.MeshStandardMaterial({
                color:0x62402a
            })
        );


    trunk.position.set(
        x,2,z
    );


    scene.add(trunk);


    const leaves =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                3.2,7,8
            ),
            new THREE.MeshStandardMaterial({
                color:0x176a35
            })
        );


    leaves.position.set(
        x,6.5,z
    );


    scene.add(leaves);

}


/* ================= BUILDING ================= */

function createBuilding(
    x,y,z,w,h,d
){

    const building =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                w,h,d
            ),
            new THREE.MeshStandardMaterial({
                color:0x5d6975
            })
        );


    building.position.set(
        x,y,z
    );


    scene.add(building);

}


/* ================= PLAYER ================= */

function createPlayer(){

    player =
        new THREE.Group();


    player.position.set(
        0,0,25
    );


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .8,1.2,.45
            ),
            new THREE.MeshStandardMaterial({
                color:0x216cff
            })
        );


    body.position.y=1.05;

    player.add(body);


    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .38,20,20
            ),
            new THREE.MeshStandardMaterial({
                color:0xffc49a
            })
        );


    head.position.y=1.95;

    player.add(head);


    scene.add(player);


    camera.position.set(
        0,1.6,4
    );


    player.add(camera);

}


/* ================= GUN ================= */

function createGun(){

    if(gun)
        camera.remove(gun);


    gun =
        new THREE.Group();


    const data =
        GUNS[selectedGun];


    const material =
        new THREE.MeshStandardMaterial({
            color:data.color,
            metalness:.7,
            roughness:.25
        });


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .22,.22,.9
            ),
            material
        );


    body.position.z=-.45;

    gun.add(body);


    const barrel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .05,.05,.6,12
            ),
            material
        );


    barrel.rotation.x=
        Math.PI/2;

    barrel.position.z=-1;

    gun.add(barrel);


    gun.position.set(
        .55,-.42,-.9
    );


    camera.add(gun);

}


/* ================= BOT ================= */

function createBot(){

    bot =
        new THREE.Group();


    bot.position.set(
        20,0,-25
    );


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .9,1.3,.5
            ),
            new THREE.MeshStandardMaterial({
                color:0xd82e42
            })
        );


    body.position.y=1.05;

    bot.add(body);


    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .4,20,20
            ),
            new THREE.MeshStandardMaterial({
                color:0xffb58f
            })
        );


    head.position.y=1.95;

    bot.add(head);


    const weapon =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .18,.18,1
            ),
            new THREE.MeshStandardMaterial({
                color:0x222222
            })
        );


    weapon.position.set(
        .6,1.1,-.6
    );


    bot.add(weapon);


    scene.add(bot);

}


/* ================= CONTROLS ================= */

function setupControls(){

    window.onkeydown=e=>{

        keys[e.code]=true;


        if(
            e.code==="Space" &&
            canJump
        ){

            velocityY=7;
            canJump=false;

        }


        if(e.code==="KeyR")
            reload();

    };


    window.onkeyup=e=>{
        keys[e.code]=false;
    };


    renderer.domElement.addEventListener(
        "click",
        ()=>{

            renderer.domElement
                .requestPointerLock();

            shoot();

        }
    );


    document.addEventListener(
        "mousemove",
        e=>{

            if(
                document.pointerLockElement !==
                renderer.domElement
            )
                return;


            yaw-=e.movementX*.002;

            pitch-=e.movementY*.002;


            pitch=
                THREE.MathUtils.clamp(
                    pitch,
                    -1.3,
                    1.3
                );


            player.rotation.y=yaw;

            camera.rotation.x=pitch;

        }
    );

}


/* ================= PLAYER MOVEMENT ================= */

function updatePlayer(delta){

    const direction =
        new THREE.Vector3();


    if(keys["KeyW"])
        direction.z-=1;

    if(keys["KeyS"])
        direction.z+=1;

    if(keys["KeyA"])
        direction.x-=1;

    if(keys["KeyD"])
        direction.x+=1;


    if(direction.length()>0){

        direction.normalize();

        direction.applyAxisAngle(
            new THREE.Vector3(0,1,0),
            yaw
        );


        const speed =
            keys["ShiftLeft"] ||
            keys["ShiftRight"]
            ?10
            :5;


        player.position.x +=
            direction.x*speed*delta;


        player.position.z +=
            direction.z*speed*delta;

    }


    velocityY-=18*delta;

    player.position.y +=
        velocityY*delta;


    if(player.position.y<=0){

        player.position.y=0;
        velocityY=0;
        canJump=true;

    }

}


/* ================= BOT AI ================= */

function updateBot(delta){

    if(!bot || gameOver)
        return;


    const distance =
        bot.position.distanceTo(
            player.position
        );


    bot.lookAt(
        player.position.x,
        bot.position.y,
        player.position.z
    );


    let speed=2.3;

    let shootTime=.8;


    if(
        selectedDifficulty==="easy"
    ){

        speed=1.5;
        shootTime=1.4;

    }


    if(
        selectedDifficulty==="hard"
    ){

        speed=3.5;
        shootTime=.45;

    }


    if(distance>8){

        const direction =
            new THREE.Vector3()
            .subVectors(
                player.position,
                bot.position
            )
            .normalize();


        bot.position.x +=
            direction.x*speed*delta;


        bot.position.z +=
            direction.z*speed*delta;

    }


    if(distance<15){

        botMoveTimer-=delta;


        if(botMoveTimer<=0){

            botStrafe*=-1;

            botMoveTimer=1.4;

        }


        const side =
            new THREE.Vector3(
                1,0,0
            );


        side.applyQuaternion(
            bot.quaternion
        );


        bot.position.add(
            side.multiplyScalar(
                botStrafe*
                speed*
                .45*
                delta
            )
        );

    }


    if(distance<40){

        botShootTimer-=delta;


        if(botShootTimer<=0){

            botShoot();

            botShootTimer=
                shootTime;

        }

    }

}


/* ================= BOT SHOOT ================= */

function botShoot(){

    let accuracy=.72;


    if(
        selectedDifficulty==="easy"
    )
        accuracy=.45;


    if(
        selectedDifficulty==="hard"
    )
        accuracy=.9;


    if(Math.random()>accuracy)
        return;


    damagePlayer(8);

}


/* ================= PLAYER SHOOT ================= */

function shoot(){

    if(
        !gameRunning ||
        gameOver ||
        shootCooldown>0
    )
        return;


    if(ammo<=0){

        showMessage("🔄 RELOAD");

        return;

    }


    const data=
        GUNS[selectedGun];


    ammo--;

    updateAmmo();


    shootCooldown=
        data.fireRate;


    const direction =
        new THREE.Vector3(
            0,0,-1
        );


    direction.applyQuaternion(
        camera.getWorldQuaternion(
            new THREE.Quaternion()
        )
    );


    const bullet =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .065,8,8
            ),
            new THREE.MeshBasicMaterial({
                color:data.color
            })
        );


    bullet.position.copy(
        camera.getWorldPosition(
            new THREE.Vector3()
        )
    );


    direction.normalize();


    bullet.userData.velocity=
        direction.multiplyScalar(
            110
        );


    bullet.userData.damage=
        data.damage;


    bullet.userData.life=2;

    bullet.userData.owner=
        "player";


    scene.add(bullet);

    bullets.push(bullet);

}


/* ================= BULLETS ================= */

function updateBullets(delta){

    for(
        let i=bullets.length-1;
        i>=0;
        i--
    ){

        const bullet=
            bullets[i];


        bullet.position.add(
            bullet.userData.velocity
            .clone()
            .multiplyScalar(delta)
        );


        bullet.userData.life-=delta;


        if(
            bullet.userData.owner===
            "player"
        ){

            const target=
                bot.position.clone();


            target.y+=1;


            if(
                bullet.position.distanceTo(
                    target
                )<1.4
            ){

                botHP-=
                    bullet.userData.damage;


                botHP=
                    Math.max(
                        0,
                        botHP
                    );


                updateBotHealth();


                scene.remove(
                    bullet
                );


                bullets.splice(i,1);


                showMessage("💥 HIT!");


                if(botHP<=0)
                    win();

                continue;

            }

        }


        if(
            bullet.userData.life<=0
        ){

            scene.remove(
                bullet
            );

            bullets.splice(i,1);

        }

    }

}


/* ================= DAMAGE ================= */

function damagePlayer(amount){

    if(gameOver)
        return;


    health-=amount;


    health=
        Math.max(
            0,
            health
        );


    updateHealth();


    if(health<=0)
        lose();

}


/* ================= RELOAD ================= */

function reload(){

    if(gameOver)
        return;


    const data=
        GUNS[selectedGun];


    if(
        ammo>=data.magazine ||
        reserveAmmo<=0
    )
        return;


    showMessage(
        "🔄 RELOADING..."
    );


    setTimeout(()=>{

        if(gameOver)
            return;


        const need=
            data.magazine-ammo;


        const amount=
            Math.min(
                need,
                reserveAmmo
            );


        ammo+=amount;

        reserveAmmo-=amount;


        updateAmmo();

    },600);

}


/* ================= UI ================= */

function updateHealth(){

    document.getElementById(
        "healthFill"
    ).style.width=
        health+"%";


    document.getElementById(
        "healthText"
    ).textContent=
        health+" / 100";

}


function updateBotHealth(){

    document.getElementById(
        "botHealthFill"
    ).style.width=
        botHP+"%";


    document.getElementById(
        "botHealth"
    ).textContent=
        botHP;

}


function updateAmmo(){

    document.getElementById(
        "ammoCount"
    ).textContent=
        ammo;

}


/* ================= WIN ================= */

function win(){

    gameOver=true;
    gameRunning=false;


    document.getElementById(
        "killCount"
    ).textContent="1";


    showMessage(
        "🏆 VICTORY!"
    );


    document.exitPointerLock?.();

}


/* ================= LOSE ================= */

function lose(){

    gameOver=true;
    gameRunning=false;


    showMessage(
        "💀 DEFEAT!"
    );


    document.exitPointerLock?.();

}


/* ================= MESSAGE ================= */

function showMessage(text){

    const element=
        document.getElementById(
            "gameMessage"
        );


    element.textContent=text;

    element.style.opacity="1";


    setTimeout(()=>{
        element.style.opacity="0";
    },1000);

}


/* ================= BACK ================= */

window.backToLobby=function(){

    gameRunning=false;
    gameOver=true;


    document.exitPointerLock?.();


    if(
        renderer &&
        renderer.domElement
    ){

        renderer.domElement.remove();

    }


    document.getElementById(
        "gameScreen"
    ).style.display="none";


    document.getElementById(
        "oneLobby"
    ).style.display="block";


    bullets=[];

};


/* ================= RESIZE ================= */

window.addEventListener(
    "resize",
    ()=>{

        if(!camera || !renderer)
            return;


        camera.aspect=
            innerWidth/innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            innerWidth,
            innerHeight
        );

    }
);


/* ================= LOOP ================= */

function animate(){

    requestAnimationFrame(
        animate
    );


    if(!renderer)
        return;


    const delta=
        Math.min(
            clock.getDelta(),
            .05
        );


    if(
        gameRunning &&
        !gameOver
    ){

        updatePlayer(delta);

        updateBot(delta);

        updateBullets(delta);


        if(shootCooldown>0)
            shootCooldown-=delta;

    }


    renderer.render(
        scene,
        camera
    );

}

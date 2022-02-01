import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { TWEEN } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/libs/tween.module.min'

// Initialization
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 30000 );
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#background'),
});

// const controls = new OrbitControls( camera, renderer.domElement );

// DOM Elements
const loading = document.getElementById('loading');
const welcomeText = document.getElementById('welcome');
const homeText = document.getElementById('how_it_started');
const universityText = document.getElementById('university');
const teamText = document.getElementById('team');
const whatIsIt = document.getElementById('what_is_it');

// Waypoints
const stage0Target = new THREE.Vector3(213, 441, 712);
const stage1Target = new THREE.Vector3(536.9, 59.4, -829.7);
const stage2Target = new THREE.Vector3(1903, 132, -548.4);
const stage3Target = new THREE.Vector3(2054, 762, 237);
const stage4Target = new THREE.Vector3(-303, 140.5, 157.8);

const stage1Rotation = new THREE.Euler(-0.35905023813947756, -0.2938329820693414, -0.10827588411287792);
const stage2Rotation = new THREE.Euler(-1.5834528872798372, -1.1186401135901156, -1.5848667000168895);
const stage3Rotation = new THREE.Euler(2.3587336732487794, -0.49158640750423344, 2.702531599618867);
const stage4Rotation = new THREE.Euler(-2.4267208222128223,  0.8138998874683432, 2.5786644208870713);

// Control variables
let isLoading = true;

let stage = 0;
let tweening = false;
let scrolling = false;

let scrollUp = false;
let scrollDown = false;

let cameraTarget = stage0Target;
let oldRotation = undefined;
let newRotation = undefined;

// Animated objects
let sigmaCube = undefined;



// Initialize renderer
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Loads a .GLB/.GLTF file from the models folder and adds it to the scene
 * @param {String} fileName - Name of .glb file in models folder
 */
const loadGLB = async fileName => {
    const loader = new GLTFLoader();
    loader.load( `models/${fileName}.glb`, gltf => {
        scene.add(gltf.scene);
    }, 
    undefined, 
    error => {
        console.error(error);
    });
}

/**
 * Loads a .FBX file from the models folder and adds it to the scene
 * @param {String} fileName - Name of the .fbx file in the models folder
 * @param {Number} x - initial x position of object
 * @param {Number} z - initial z position of object
 * @param {Vector} rotation - vector specifying the rotation of the model
 */
const loadFBX = async (fileName, x, z, rotation) => {
    return new Promise( (resolve, reject) => {
        const loader = new FBXLoader();
        loader.load(`models/${fileName}.fbx`, fbx => {
            fbx.position.y -= 40;
            fbx.position.x = x || 0;
            fbx.position.z = z || 0;

            if(rotation) {
                fbx.rotateX( rotation.x );
                fbx.rotateY( rotation.y );
                fbx.rotateZ( rotation.z )
            }
    
            scene.add(fbx);
            resolve(fbx);
        },
        xhr => {
            console.log('Model load progress:');
            console.log(`${fileName} // (FBX File) // is ${(xhr.loaded / xhr.total) * 100}% loaded`)
        },
        error => {
            reject(error);
        });
    });
}

/**
 * Animates a particular DOM Element by appending the appropriate CSS class to it
 * @param {HTMLElement} element - DOM Element to animate
 * @param {String} animation - Animation name
 */
const animateDOMElement = (element, animation) => {
    element.classList.remove('hidden');
    switch(animation) {
        case 'fadeOut':
            element.classList.add('fadeOut');
            break;
        case 'fromTop':
            element.classList.remove('toTop');
            element.classList.add('fromTop');
            break;
        case 'toTop':
            element.classList.remove('fromTop');
            element.classList.add('toTop');
            break;
        case 'fromLeft':
            element.classList.remove('toLeft');
            element.classList.add('fromLeft');
            break;
        case 'toLeft':
            element.classList.remove('fromLeft');
            element.classList.add('toLeft');
            break;
    }
}

// Initialize lighting
const ambientLight = new THREE.AmbientLight(0xFFFFFF);
scene.add(ambientLight);
// const directionalLight = new THREE.PointLight( 0xFFFFFF, 1, 100 ); 
// scene.add(directionalLight);
// directionalLight.castShadow = true;
// directionalLight.position.set(new THREE.Vector3(0, 50, 0));

// Initialize fog
const fogColor = new THREE.Color(0xFFFFFF);
scene.background = fogColor;

scene.fog = new THREE.Fog(fogColor, 1000, 1550);

// Initialize scene
const initialize = async () => {

    console.log('%cInitializing SIGMA City! Please wait...', 'background-color: #31d472; padding: 2rem; color: #fff; font-size: 2rem;');

    // Wait for each model to load in and be added to the scene
    await loadFBX('city_block2', 164, -543);
    await loadFBX('city_block1', 164, 53);
    await loadFBX('city_block8', 164, 649);
    await loadFBX('city_block1', 164, 1245);

    await loadFBX('city_block_hospital', 664, -543);
    await loadFBX('city_block6', 664, 53);
    await loadFBX('city_block3', 664, 649);

    await loadFBX('city_block4', 1164, 53);
    await loadFBX('city_block5', 1164, -543);
    await loadFBX('city_block8', 1164, 649);

    await loadFBX('city_block1', 1664, 53);
    await loadFBX('city_block5', 1664, -543);
    await loadFBX('city_block2', 1664, 649);

    await loadFBX('slums1', 764, -917, new THREE.Vector3( 0, Math.PI / 2, 0));

    await loadFBX('university', 2394, -543);

    // Suburbs
    await loadFBX('suburban_block2', -435, 53, new THREE.Vector3( 0, Math.PI / 2, 0));

    const colinTexture = new THREE.TextureLoader().load('img/colin.jpg');
    const curtisTexture = new THREE.TextureLoader().load('img/curtis.jpg');
    const jeremyTexture = new THREE.TextureLoader().load('img/jeremy.png');
    const johnnyTexture = new THREE.TextureLoader().load('img/johnny.jpg');
    const kayleeTexture = new THREE.TextureLoader().load('img/kaylee.png');
    const owenTexture = new THREE.TextureLoader().load('img/owen.png');
    
    const sigmaCubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    const sigmaCubeMaterials = [ new THREE.MeshBasicMaterial( { map: colinTexture } ), new THREE.MeshBasicMaterial( { map: curtisTexture } ), new THREE.MeshBasicMaterial( { map: jeremyTexture } ), 
        new THREE.MeshBasicMaterial( { map: johnnyTexture } ), new THREE.MeshBasicMaterial( { map: kayleeTexture } ), new THREE.MeshBasicMaterial( { map: owenTexture } ), ]
    
    sigmaCube = new THREE.Mesh( sigmaCubeGeometry, sigmaCubeMaterials );
    scene.add( sigmaCube );
    sigmaCube.position.x = stage3Target.x;
    sigmaCube.position.y = stage3Target.y + 1.25;
    sigmaCube.position.z = stage3Target.z + 2;

    // Initial camera position
    camera.position.x = 213;
    camera.position.y = 441;
    camera.position.z = 712;

    // Look at center of city
    camera.lookAt(1700, -800, -887);

    cameraTarget = stage1Target;

    animateDOMElement(loading, 'fadeOut');

    // Await for loading screen to fade out before dropping in new text
    setTimeout(() => {
        welcomeText.classList.remove('hidden');
        animateDOMElement(welcomeText, 'fromTop');
        isLoading = false;
        console.log('%cWelcome to SIGMA City! Enjoy!', 'background-color: #31d472; padding: 2rem; color: #fff; font-size: 2rem;');
    }, 1000);
}


/**
 * Starts a tween (smooth rotation) between the cameras current position and next target
 */
const nextTween = () => {
    const startRotation = new THREE.Euler().copy(camera.rotation);
    camera.lookAt(cameraTarget);
    const endRotation = new THREE.Euler().copy(camera.rotation);
    camera.rotation.copy(startRotation);


    // Tween
    new TWEEN.Tween(camera.rotation)
        .to({x: endRotation.x, y: endRotation.y, z: endRotation.z}, 250)
        .onComplete(() => tweening = false)
        .start();
}

// Animation loop
const animate = (time) => {
    requestAnimationFrame( animate );

    const timeStep = 0.03;

    if(scrolling) {
        
        // Smoothly animate camera position
        camera.position.lerp(cameraTarget, timeStep);

        // Scroll down logic
        if(scrollDown) {

            // Only focus camera position if scrolling down (so that we can move straight backwards instead of turning around when scrolling up)
            if(stage == 0) {
                stage += 1;
                animateDOMElement(welcomeText, 'toTop');
                cameraTarget = stage1Target;
                camera.rotation.copy(stage1Rotation);
            }

            if(stage == 1) {
                // Check if user has arrived
                if(camera.position.x >= stage1Target.x - 100 && camera.position.z >= stage1Target.z - 300) {
                    animateDOMElement(homeText, 'fromTop');


                    if(camera.position.x >= stage1Target.x - 10 && camera.position.z >= stage1Target.z - 5) {
                        stage += 1
                        animateDOMElement(homeText, 'toTop');
                        cameraTarget = stage2Target;
                        camera.rotation.copy(stage2Rotation);
                    }

                } 
            }

            if(stage == 2) {
                // Check if user has arrived
                if(camera.position.x >= stage2Target.x - 150 && camera.position.z >= stage2Target.z - 300) {
                    animateDOMElement(universityText, 'fromTop');

                    if(camera.position.x >= stage2Target.x - 20 && camera.position.z >= stage2Target.z - 15) {
                        stage += 1
                        animateDOMElement(universityText, 'toTop');
                        cameraTarget = stage3Target;
                        camera.rotation.copy(stage3Rotation);
                    }
                }
            }

            if(stage == 3) {
                if(camera.position.x >= stage3Target.x - 5 && camera.position.z >= stage3Target.z - 5) {
                    animateDOMElement(teamText, 'fromLeft');

                    if(camera.position.x >= stage3Target.x - 0.5 && camera.position.z >= stage3Target.z - 0.5) {
                        stage += 1
                        animateDOMElement(teamText, 'toLeft');
                        cameraTarget = stage4Target;
                        camera.rotation.copy(stage4Rotation);
                    }
                }
            }

            if(stage == 4) {
                if(camera.position.x <= stage4Target.x + 150 && camera.position.z <= stage4Target.z + 150) {
                    animateDOMElement(whatIsIt, 'fromTop');
                }
            }

        } else {
            // TODO: Scroll up logic
            // if(stage == 0) {
            //     // console.log(camera.position.x >= stage0Target.x - 75 && camera.position.y >= stage0Target.y - 75 && camera.position.z >= stage0Target.z - 75)

            //     if(camera.position.x >= stage0Target.x - 75 && camera.position.y >= stage0Target.y - 75 && camera.position.z >= stage0Target.z - 200) {
            //         animateDOMElement(welcomeText, 'fromTop');
            //     }
            // }

            // if(stage == 1) {
            //     if(camera.position.x >= stage1Target.x - 25 && camera.position.z >= stage1Target.z - 100) {
            //         animateDOMElement(homeText, 'toTop')
            //         stage -= 1;
            //         cameraTarget = stage0Target;
            //     } 
            // }

            // if(stage == 2) {
            //     stage -= 1;
            //     cameraTarget = stage1Target;
            // }
        }

    }

    sigmaCube.rotation.x += 0.01;
    sigmaCube.rotation.y += 0.005;
    sigmaCube.rotation.z += 0.01;

    // controls.update();
    TWEEN.update();
    renderer.render( scene, camera );
}

// Wait for the content to be ready before starting the animation loop
// https://stackoverflow.com/a/31171096
document.addEventListener("DOMContentLoaded", async function() {
    // Your code to run since DOM is loaded and ready
    await initialize();
    animate();
});

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}, false);

/**
 * Debug listener to print camera position when the 'g' key is pressed.
 */
window.addEventListener('keydown', e => {
    if(e.key == 'g') {
        console.log(camera.position);
        // console.log(controls.object);
        console.log(camera.rotation);
    }
});


/**
 * Custom event listener for mouse wheel scrolling (and stopping). While scrolling, calls a custom onScroll function.
 * When stops, runs the callback.
 * 
 * Checks every 200ms.
 * 
 * @param {*} callback - Callback function when user stops scrolling
 * @returns custom event listener
 */
const createWheelStopListener = callback => {
    let handle = null;
    const onScroll = e => {
        console.log(e);
        if(!isLoading) {       
            scrolling = true;

            // Determine up or down scroll
            if(e.deltaY < 0) {
                scrollUp = true;
                scrollDown = false;
            } else {
                scrollDown = true;
                scrollUp = false;
            }

            // Only tween if not currently tweening or if the user is scrolling down
            // (we want the camera to animate backwards instead of spinning aroundg if they're scrolling up)
            // Not gonna tween for now but maybe later
            // if(!tweening && scrollDown) {
            //     tweening = true;
            //     nextTween();
            // }

            if (handle) {
                clearTimeout(handle);
            }
            handle = setTimeout(callback, 200);
        }
    };
    let listener = window.addEventListener('wheel', e => onScroll(e));
    return function() {
        window.removeEventListener(listener);
    };
}

createWheelStopListener(() => {
    scrolling = false;
})

/**
 * Allows for mobile users to trigger a wheel event
 */
window.addEventListener('touchmove', () => {
    const e = new Event('wheel');
    window.dispatchEvent(e);
})
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

// Control variables
let isLoading = true;

let stage = 0;
let tweening = false;
let scrolling = false;

let cameraTarget = new THREE.Vector3(213, 441, 712);
let oldRotation = undefined;
let newRotation = undefined;

// Initialize renderer
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

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
    switch(animation) {
        case 'fadeOut':
            element.classList.add('fadeOut');
            break;
        case 'fromTop':
            element.classList.add('fromTop');
            break;
        case 'toTop':
            element.classList.add('toTop');
            break;
    }
}

// Initialize lighting
const ambientLight = new THREE.AmbientLight(0xFFFFFF);
scene.add(ambientLight);

// Initialize fog
const fogColor = new THREE.Color(0xFFFFFF);
scene.background = fogColor;

scene.fog = new THREE.Fog(fogColor, 1000, 1750);

// Initialize scene
const initialize = async () => {

    console.log('%cInitializing SIGMA City! Please wait...', 'background-color: #31d472; padding: 2rem; color: #fff; font-size: 2rem;')

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

    await loadFBX('slums_1', 764, -917, new THREE.Vector3( 0, Math.PI / 2, 0));

    // Initial camera position
    camera.position.x = 213;
    camera.position.y = 441;
    camera.position.z = 712;

    // Look at center of city
    camera.lookAt(1700, -800, -887);

    cameraTarget = new THREE.Vector3(536.9, 59.4, -829.7);

    animateDOMElement(loading, 'fadeOut');

    // Await for loading screen to fade out before dropping in new text
    setTimeout(() => {
        welcomeText.classList.remove('hidden');
        animateDOMElement(welcomeText, 'fromTop');
        isLoading = false;
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
    new TWEEN.Tween(camera.rotation).to({x: endRotation.x, y: endRotation.y, z: endRotation.z}, 250).start();
}

// Animation loop
const animate = (time) => {
    requestAnimationFrame( animate );

    if(scrolling) {
        camera.lookAt(cameraTarget);
        camera.position.lerp(cameraTarget, 0.02);

        if(stage == 0) {
            stage += 1;
            welcomeText.classList.remove('fromTop');
            animateDOMElement(welcomeText, 'toTop');
        }

    }

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
        console.log(controls.object);
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
    var handle = null;
    var onScroll = function() {
        if(!isLoading) {       
            scrolling = true;

            if(!tweening) {
                tweening = true;
                nextTween();
            }

            if (handle) {
                clearTimeout(handle);
            }
            handle = setTimeout(callback, 200);
        }
    };
    window.addEventListener('wheel', onScroll);
    return function() {
        window.removeEventListener('wheel', onScroll);
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
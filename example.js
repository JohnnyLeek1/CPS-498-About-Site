import * as THREE from 'https://cdn.skypack.dev/three@0.137.5';

const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
camera.position.z = 1;

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
const material = new THREE.MeshNormalMaterial();

const colinTexture = new THREE.TextureLoader().load('img/colin.jpg');
const curtisTexture = new THREE.TextureLoader().load('img/curtis.jpg');
const jeremyTexture = new THREE.TextureLoader().load('img/jeremy.png');
const johnnyTexture = new THREE.TextureLoader().load('img/johnny.jpg');
const kayleeTexture = new THREE.TextureLoader().load('img/kaylee.png');
const owenTexture = new THREE.TextureLoader().load('img/owen.png');

const materials = [ new THREE.MeshBasicMaterial( { map: colinTexture } ), new THREE.MeshBasicMaterial( { map: curtisTexture } ), new THREE.MeshBasicMaterial( { map: jeremyTexture } ), 
    new THREE.MeshBasicMaterial( { map: johnnyTexture } ), new THREE.MeshBasicMaterial( { map: kayleeTexture } ), new THREE.MeshBasicMaterial( { map: owenTexture } ), ]

const mesh = new THREE.Mesh( geometry, materials );
scene.add( mesh );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animation );
document.body.appendChild( renderer.domElement );

function animation( time ) {

	mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;

	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.render( scene, camera );

}
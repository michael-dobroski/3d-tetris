import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js'
import { OrbitControls } from 'https://unpkg.com/three@0.120.1/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'https://unpkg.com/three@0.120.1/src/loaders/FontLoader.js'

const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0,0,1);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});

const controls = new OrbitControls( camera, renderer.domElement );

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.enabled = true;

let materialArray = [];
let texture_ft = new THREE.TextureLoader().load( 'front.jpg' );
let texture_bk = new THREE.TextureLoader().load( 'back.jpg' );
let texture_up = new THREE.TextureLoader().load( 'top.jpg' );
let texture_dn = new THREE.TextureLoader().load( 'bot.jpg' );
let texture_rt = new THREE.TextureLoader().load( 'left.jpg' );
let texture_lf = new THREE.TextureLoader().load( 'right.jpg' );
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));
   
for (let i = 0; i < 6; i++) {
    materialArray[i].side = THREE.BackSide;
}
   
let skyboxGeo = new THREE.BoxGeometry( 1000, 1000, 1000);
let skybox = new THREE.Mesh( skyboxGeo, materialArray );
scene.add( skybox );

// addText('Welcome to my portfolio!', 10, 0, 0, 0, 0, 25, -200);
// addText('Feel free to take a look around.', 10, 0, 0, 0, 0, 0, -200);
// addText('Thanks, enjoy!', 10, 0, 0, 0, 0, -25, -200);

// function addText(txt, fontSize, rotX, rotY, rotZ, x, y, z) {
//     const loader = new FontLoader();
//     loader.load( 'https://unpkg.com/three@0.120.1/examples/fonts/helvetiker_regular.typeface.json' , function ( font ) {

//         const textGeo = new THREE.TextGeometry( txt, {
//             font: font,
//             size: fontSize,
//             height: 1,
//             curveSegments: 12,
//         } );
//         textGeo.rotateX(rotX);
//         textGeo.rotateY(rotY);
//         textGeo.rotateZ(rotZ);
//         const material = new THREE.MeshBasicMaterial({
//             color: 0xffffff
//         });
//         const mesh = new THREE.Mesh(textGeo, material);
//         scene.add(mesh);
//         mesh.geometry.center();
//         mesh.position.set(x, y, z);

//     } );
// }

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
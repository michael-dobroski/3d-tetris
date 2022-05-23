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
   
let skyboxGeo = new THREE.BoxGeometry( 1000, 1000, 1000 );
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

// create grid
const boxes = {};
var boxGeo, boxMat, boxMesh, key;
for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 20; j++) {
        boxGeo = new THREE.BoxGeometry(.05,.05,.05);
        boxMat = new THREE.MeshBasicMaterial({
            color: 0x0000ff//'#'+Math.floor(Math.random()*16777215).toString(16)
        });
        boxMesh = new THREE.Mesh(boxGeo, boxMat);
        scene.add(boxMesh);
        boxMesh.position.set(i * .05 - .225, j * .05 - .475, 0);
        boxMesh.material.transparent = true;
        boxMesh.material.opacity = 0;
        boxes[coords(i,j)] = boxMesh;
    }
}

// starting seed for debugging
for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 4; j++) {
        boxes[coords(i, j)].material.color.setHex(0x00ffff);
        boxes[coords(i, j)].material.transparent = false;
        boxes[coords(i, j)].material.opacity = 1;
    }
}

// create frame
const frameMat = new THREE.MeshBasicMaterial({
    color: 0x808080
});
const leftFrame = new THREE.BoxGeometry(.001, 1, .05);
const leftMesh = new THREE.Mesh(leftFrame, frameMat);
scene.add(leftMesh);
leftMesh.position.set(-.25,0,0);
const rightFrame = new THREE.BoxGeometry(.001, 1, .05);
const rightMesh = new THREE.Mesh(rightFrame, frameMat);
scene.add(rightMesh);
rightMesh.position.set(.25,0,0);
const topFrame = new THREE.BoxGeometry(.5, .001, .05);
const topMesh = new THREE.Mesh(topFrame, frameMat);
scene.add(topMesh);
topMesh.position.set(0,.5,0);
const bottomFrame = new THREE.BoxGeometry(.5, .001, .05);
const bottomMesh = new THREE.Mesh(bottomFrame, frameMat);
scene.add(bottomMesh);
bottomMesh.position.set(0,-.5,0);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    tick();
}

var currPiece = null;
var currSquares = [];
var newSet = [];
var x, y, pieceColor;
var input = '';
var lenTick = 50;
var ticks = 0;
var piecePosition = '';
var linesCleared = 0;
var score = 0;
var scoringSystem = [];
scoringSystem[0] = 40;
scoringSystem[1] = 100;
scoringSystem[2] = 300;
scoringSystem[3] = 1200;
function tick() {
    if (currPiece == null) {
        // currPiece = Math.floor(Math.random() * 7);
        currPiece = 0;
        if (currPiece == 0) { // light blue piece
            setPiece(3, 19, 0x00ffff);
            setPiece(4, 19, 0x00ffff);
            setPiece(5, 19, 0x00ffff);
            setPiece(6, 19, 0x00ffff);
        } else if (currPiece == 1) { // dark blue piece
            setPiece(4, 19, 0x00008b);
            setPiece(4, 18, 0x00008b);
            setPiece(5, 18, 0x00008b);
            setPiece(6, 18, 0x00008b);
        } else if (currPiece == 2) { // orange piece
            setPiece(6, 19, 0xffa500);
            setPiece(4, 18, 0xffa500);
            setPiece(5, 18, 0xffa500);
            setPiece(6, 18, 0xffa500);
        } else if (currPiece == 3) { // yellow piece
            setPiece(4, 19, 0xffff00);
            setPiece(5, 19, 0xffff00);
            setPiece(4, 18, 0xffff00);
            setPiece(5, 18, 0xffff00);
        } else if (currPiece == 4) { // green piece
            setPiece(5, 19, 0x90ee90);
            setPiece(6, 19, 0x90ee90);
            setPiece(4, 18, 0x90ee90);
            setPiece(5, 18, 0x90ee90);
        } else if (currPiece == 5) { // purple piece
            setPiece(5, 19, 0xa020f0);
            setPiece(4, 18, 0xa020f0);
            setPiece(5, 18, 0xa020f0);
            setPiece(6, 18, 0xa020f0);
        } else if (currPiece == 6) { // red piece
            setPiece(4, 19, 0xff0000);
            setPiece(5, 19, 0xff0000);
            setPiece(5, 18, 0xff0000);
            setPiece(6, 18, 0xff0000);
        }
        piecePosition = 'A';
    } else {
        if (ticks == lenTick || input == "down") {
            var canMoveDown = true;
            for (var k = 0; k < 4; k++) { // check to see if there's room to move piece down
                if (currSquares[k][1] == 0) {
                    canMoveDown = false;
                } else if (isPieceHere(currSquares[k][0], currSquares[k][1] - 1)) {
                    canMoveDown = false;
                }
            }
            if (canMoveDown) { // move piece down
                for (var k = 0; k < 4; k++) {
                    x = currSquares[k][0];
                    y = currSquares[k][1];
                    pieceColor = '0x' + boxes[coords(x, y)].material.color.getHex().toString(16); // returns color of piece in hex
                    clearPiece(x, y);
                    newSet.push([x, y-1]);
                }
                currSquares = [];
                for (let k = 0; k < 4; k++) {
                    x = newSet[k][0];
                    y = newSet[k][1];
                    setPiece(x, y, pieceColor);
                    currSquares[k] = newSet[k];
                }
                newSet = [];
            }
            else {
                currSquares = [];
                currPiece = null;

                // check for full rows to eliminate and add points
                var rowsDel = [];
                for (var j = 0; j < 20; j++) {
                    var elim = true;
                    for (var i = 0; i < 10; i++) {
                        if (boxes[coords(i, j)].material.transparent == true) {
                            elim = false;
                            break;
                        }
                    }
                    if (elim) {
                        for (var i = 0; i < 10; i++) {
                            clearPiece(i, j);
                        }
                        rowsDel.push(j);
                    }
                }

                // add points
                if (rowsDel.length > 0) {
                    var level = Math.floor(linesCleared / 10);
                    linesCleared += rowsDel.length;
                    score += scoringSystem[rowsDel.length - 1] * (level + 1);
                    console.log(score); // display as 3D text
                }
                
                // move rows down after elimination
                for (var k = rowsDel.length - 1; k > -1; k--) { 
                    for (var j = rowsDel[k]; j < 19; j++) {
                        for (var i = 0; i < 10; i++) {
                            if (boxes[coords(i, j + 1)].material.transparent == false) {
                                movePieceDown(i, j + 1);
                            }
                        }
                    }
                }
            }
            ticks = 0;
            if (input == "down") {
                input = '';
            }
        } else {
            ticks++;
            if (input != '') {
                if (input == "left") { // try to move piece left
                    var canMoveLeft = true;
                    for (var k = 0; k < 4; k++) { // check to see if there's room to move piece left
                        if (currSquares[k][0] == 0) {
                            canMoveLeft = false;
                        } else if (isPieceHere(currSquares[k][0] - 1, currSquares[k][1])) {
                            canMoveLeft = false;
                        }
                    }
                    if (canMoveLeft) { // move piece left
                        for (var k = 0; k < 4; k++) {
                            x = currSquares[k][0];
                            y = currSquares[k][1];
                            pieceColor = '0x' + boxes[coords(x, y)].material.color.getHex().toString(16); // returns color of piece in hex
                            clearPiece(x, y);
                            newSet.push([x-1, y]);
                        }
                        currSquares = [];
                        for (let k = 0; k < 4; k++) {
                            x = newSet[k][0];
                            y = newSet[k][1];
                            setPiece(x, y, pieceColor);
                            currSquares[k] = newSet[k];
                        }
                        newSet = [];
                    }
                } else if (input == "right") {
                    var canMoveRight = true;
                    for (var k = 0; k < 4; k++) { // check to see if there's room to move piece right
                        if (currSquares[k][0] == 9) {
                            canMoveRight = false;
                        } else if (isPieceHere(currSquares[k][0] + 1, currSquares[k][1])) {
                            canMoveRight = false;
                        }
                    }
                    if (canMoveRight) { // move piece Right
                        for (var k = 0; k < 4; k++) {
                            x = currSquares[k][0];
                            y = currSquares[k][1];
                            pieceColor = '0x' + boxes[coords(x, y)].material.color.getHex().toString(16); // returns color of piece in hex
                            clearPiece(x, y);
                            newSet.push([x+1, y]);
                        }
                        currSquares = [];
                        for (let k = 0; k < 4; k++) {
                            x = newSet[k][0];
                            y = newSet[k][1];
                            setPiece(x, y, pieceColor);
                            currSquares[k] = newSet[k];
                        }
                        newSet = [];
                    }
                } else if (input == "rotate") {
                    var canRotate = true;
                    var newPiecePosition;
                    if (currPiece == 0) { // light blue piece
                        if (piecePosition == 'A') { // position A
                            newSet.push([currSquares[0][0] + 2, currSquares[0][1] + 1]);
                            newSet.push([currSquares[1][0] + 1, currSquares[1][1]]);
                            newSet.push([currSquares[2][0], currSquares[2][1] - 1]);
                            newSet.push([currSquares[3][0] - 1, currSquares[3][1] - 2]);
                            newPiecePosition = 'B';
                        } else { // position B
                            newSet.push([currSquares[0][0] - 2, currSquares[0][1] - 1]);
                            newSet.push([currSquares[1][0] - 1, currSquares[1][1]]);
                            newSet.push([currSquares[2][0], currSquares[2][1] + 1]);
                            newSet.push([currSquares[3][0] + 1, currSquares[3][1] + 2]);
                            newPiecePosition = 'A';
                        }
                    } else if (currPiece == 1) { // dark blue piece
                        if (piecePosition == 'A') { // position A
                            newSet.push([currSquares[0][0] + 2, currSquares[0][1]]);
                            newSet.push([currSquares[1][0] + 1, currSquares[1][1] + 1]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0] - 1, currSquares[3][1] - 1]);
                            newPiecePosition = 'B';
                        } else if (piecePosition == 'B') { // position B
                            newSet.push([currSquares[0][0], currSquares[0][1] - 2]);
                            newSet.push([currSquares[1][0] + 1, currSquares[1][1] - 1]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0] - 1, currSquares[3][1] + 1]);
                            newPiecePosition = 'C';
                        } else if (piecePosition == 'C') { // position C
                            newSet.push([currSquares[0][0] - 2, currSquares[0][1]]);
                            newSet.push([currSquares[1][0] - 1, currSquares[1][1] - 1]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0] + 1, currSquares[3][1] + 1]);
                            newPiecePosition = 'D';
                        } else { // position D
                            newSet.push([currSquares[0][0], currSquares[0][1] + 2]);
                            newSet.push([currSquares[1][0] - 1, currSquares[1][1] + 1]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0] + 1, currSquares[3][1] - 1]);
                            newPiecePosition = 'A';
                        }
                    } else if (currPiece == 2) { // orange piece
                        if (piecePosition == 'A') { // position A
                            newSet.push([currSquares[0][0], currSquares[0][1] - 2]);
                            newSet.push([currSquares[1][0] + 1, currSquares[1][1] + 1]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0] - 1, currSquares[3][1] - 1]);
                            newPiecePosition = 'B';
                        } else if (piecePosition == 'B') { // position B
                            newSet.push([currSquares[0][0] - 2, currSquares[0][1]]);
                            newSet.push([currSquares[1][0] + 1, currSquares[1][1] - 1]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0] - 1, currSquares[3][1] + 1]);
                            newPiecePosition = 'C';
                        } else if (piecePosition == 'C') { // position C
                            newSet.push([currSquares[0][0], currSquares[0][1] + 2]);
                            newSet.push([currSquares[1][0] - 1, currSquares[1][1] - 1]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0] + 1, currSquares[3][1] + 1]);
                            newPiecePosition = 'D';
                        } else { // position D
                            newSet.push([currSquares[0][0] + 2, currSquares[0][1]]);
                            newSet.push([currSquares[1][0] - 1, currSquares[1][1] + 1]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0] + 1, currSquares[3][1] - 1]);
                            newPiecePosition = 'A';
                        }
                    } else if (currPiece == 3) { // yellow piece; do nothing
                        canRotate = false;
                    } else if (currPiece == 4) { // green piece
                        if (piecePosition == 'A') { // position A
                            newSet.push([currSquares[0][0] + 1, currSquares[0][1] - 1]);
                            newSet.push([currSquares[1][0], currSquares[1][1] - 2]);
                            newSet.push([currSquares[2][0] + 1, currSquares[2][1] + 1]);
                            newSet.push([currSquares[3][0], currSquares[3][1]]);
                            newPiecePosition = 'B';
                        } else { // position B
                            newSet.push([currSquares[0][0] - 1, currSquares[0][1] + 1]);
                            newSet.push([currSquares[1][0], currSquares[1][1] + 2]);
                            newSet.push([currSquares[2][0] - 1, currSquares[2][1] - 1]);
                            newSet.push([currSquares[3][0], currSquares[3][1]]);
                            newPiecePosition = 'A';
                        }
                    } else if (currPiece == 5) { // purple piece
                        if (piecePosition == 'A') { // position A
                            newSet.push([currSquares[0][0], currSquares[0][1]]);
                            newSet.push([currSquares[1][0] + 1, currSquares[1][1] - 1]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0], currSquares[3][1]]);
                            newPiecePosition = 'B';
                        } else if (piecePosition == 'B') { // position B
                            newSet.push([currSquares[0][0] - 1, currSquares[0][1] - 1]);
                            newSet.push([currSquares[1][0], currSquares[1][1]]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0], currSquares[3][1]]);
                            newPiecePosition = 'C';
                        } else if (piecePosition == 'C') { // position C
                            newSet.push([currSquares[0][0], currSquares[0][1]]);
                            newSet.push([currSquares[1][0], currSquares[1][1]]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0] - 1, currSquares[3][1] + 1]);
                            newPiecePosition = 'D';
                        } else { // position D
                            newSet.push([currSquares[0][0] + 1, currSquares[0][1] + 1]);
                            newSet.push([currSquares[1][0] - 1, currSquares[1][1] + 1]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0] + 1, currSquares[3][1] - 1]);
                            newPiecePosition = 'A';
                        }
                    } else if (currPiece == 6) { // red piece
                        if (piecePosition == 'A') { // position A
                            newSet.push([currSquares[0][0], currSquares[0][1] - 2]);
                            newSet.push([currSquares[1][0] - 1, currSquares[1][1] - 1]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0] - 1, currSquares[3][1] + 1]);
                            newPiecePosition = 'B';
                        } else { // position B
                            newSet.push([currSquares[0][0], currSquares[0][1] + 2]);
                            newSet.push([currSquares[1][0] + 1, currSquares[1][1] + 1]);
                            newSet.push([currSquares[2][0], currSquares[2][1]]);
                            newSet.push([currSquares[3][0] + 1, currSquares[3][1] - 1]);
                            newPiecePosition = 'A';
                        }
                    }
                    if (canRotate) {
                        for (var k = 0; k < 4; k++) { // check to see if there's room to rotate piece
                            if (isPieceHere(newSet[k][0], newSet[k][1])) {
                                canRotate = false;
                            }
                        }
                    }
                    if (canRotate) { // rotate piece to new coords
                        piecePosition = newPiecePosition;
                        for (var k = 0; k < 4; k++) {
                            x = currSquares[k][0];
                            y = currSquares[k][1];
                            pieceColor = '0x' + boxes[coords(x, y)].material.color.getHex().toString(16); // returns color of piece in hex
                            clearPiece(x, y);
                        }
                        currSquares = [];
                        for (let k = 0; k < 4; k++) {
                            x = newSet[k][0];
                            y = newSet[k][1];
                            setPiece(x, y, pieceColor);
                            currSquares[k] = newSet[k];
                        }
                    }
                    newSet = [];
                }
                input = '';
            }
        }
    }
}

// processes any keyboard inputs
document.addEventListener('keypress', (event) => {
    var name = event.key;
    if (name == 's') {
        input = "down";
    } else if (name == 'a') {
        input = "left";
    } else if (name == 'd') {
        input = "right";
    } else if (name == 'w') {
        input = "rotate";
    }
}, false);

// returns true if there's a piece there that's not part of the current piece or coords are out of bounds
function isPieceHere(i, j) {
    if (i < 0 || i > 9 || j < 0 || j > 19) { // out of bounds check
        return true;
    }
    var isCurrPiece = false;
    if (boxes[coords(i, j)].material.transparent == false) {
        for (var k = 0; k < 4; k++) {
            if (JSON.stringify(currSquares[k]) == JSON.stringify([i, j])) {
                isCurrPiece = true;
            }
        }
        if (isCurrPiece) {
            return false;
        } else {
            return true;
        }
    }
    return false;
}

// sets a piece
function setPiece(i, j, color) {
    boxes[coords(i, j)].material.color.setHex(color);
    boxes[coords(i, j)].material.transparent = false;
    boxes[coords(i, j)].material.opacity = 1;
    currSquares.push([i, j]);
}

// moves a piece down a row
function movePieceDown(i, j) {
    var color;
    color = '0x' + boxes[coords(i, j)].material.color.getHex().toString(16);
    boxes[coords(i, j - 1)].material.color.setHex(color);
    boxes[coords(i, j - 1)].material.transparent = false;
    boxes[coords(i, j - 1)].material.opacity = 1;
    clearPiece(i, j);
}

// removes a piece from the grid
function clearPiece(i, j) {
    boxes[coords(i, j)].material.transparent = true;
    boxes[coords(i, j)].material.opacity = 0;
}

// takes ints i & j and returns corresponding key to boxes dict
function coords(i, j) {
    return i.toString() + ',' + j.toString();
}

animate();
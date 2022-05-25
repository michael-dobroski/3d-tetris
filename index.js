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

let scoreMesh, levelMesh;
var level = 0;
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
let group = new THREE.Group();
scene.add(group);
var pieces = [0,1,2,3,4,5,6];
var piece7bag = shuffle(pieces).concat(shuffle(pieces));
var hold = -1;
var gameOver = false;

// add static 3d text content
addStaticText('SCORE', 0.05, 0, 0, 0, 0.4, 0.45, 0, 0xffffff);
addStaticText('LEVEL', 0.05, 0, 0, 0, 0.388, 0.25, 0, 0xffffff);
addStaticText('HOLD', 0.05, 0, 0, 0, 0.375, -0.232, 0, 0xffffff);
addStaticText('NEXT', 0.05, 0, 0, 0, -0.37, 0.45, 0, 0xffffff);
addStaticText('3D TETRIS', 0.14, 0, 0, 0, 0, 0.63, 0, 0xffffff);
addStaticText('CONTROLS', 0.04, 0, 0, 0, 0, -0.555, 0, 0xffffff);
addStaticText("'A' - left", 0.03, 0, 0, 0, -0.12, -0.62, 0, 0xffffff);
addStaticText("'D' - right", 0.03, 0, 0, 0, -0.12, -0.67, 0, 0xffffff);
addStaticText("'S' - down", 0.03, 0, 0, 0, -0.12, -0.72, 0, 0xffffff);
addStaticText("'W' - rotate", 0.03, 0, 0, 0, 0.12, -0.62, 0, 0xffffff);
addStaticText("'F' - hold", 0.03, 0, 0, 0, 0.12, -0.67, 0, 0xffffff);
addStaticText("'R' - reset", 0.03, 0, 0, 0, 0.12, -0.72, 0, 0xffffff);
createScore();
createLevel();

// create grid
const boxes = {};
var boxGeo, boxMat, boxMesh;
for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 20; j++) {
        boxGeo = new THREE.BoxGeometry(.05,.05,.05);
        boxMat = new THREE.MeshBasicMaterial({
            color: 0x000000//'#'+Math.floor(Math.random()*16777215).toString(16)
        });
        boxMesh = new THREE.Mesh(boxGeo, boxMat);
        scene.add(boxMesh);
        boxMesh.position.set(i * .05 - .225, j * .05 - .475, 0);
        boxMesh.material.transparent = true;
        boxMesh.material.opacity = 0;
        boxes[coords(i,j)] = boxMesh;
    }
}

// backdrop for game over screen, hide for now
var gobGeo, gobMat, gobMesh;
gobGeo = new THREE.BoxGeometry(1,.5,.001);
gobMat = new THREE.MeshBasicMaterial({
    color: 0x000000
});
gobMesh = new THREE.Mesh(gobGeo, gobMat);
scene.add(gobMesh);
gobMesh.position.set(0, 0, 0.05);
gobMesh.material.transparent = true;
gobMesh.material.opacity = 0;
var gameOverMesh, resetMesh;
const loader1 = new FontLoader();
loader1.load( 'https://unpkg.com/three@0.120.1/examples/fonts/helvetiker_regular.typeface.json' , function ( font ) {

    const gameOverGeo = new THREE.TextGeometry( "GAME OVER", {
        font: font,
        size: 0.1,
        height: 0.01,
        curveSegments: 12,
    } );
    const resetGeo = new THREE.TextGeometry( "Press 'R' to reset", {
        font: font,
        size: 0.05,
        height: 0.01,
        curveSegments: 12,
    } );
    const material = new THREE.MeshBasicMaterial({
        color: 0xff0000
    });
    gameOverMesh = new THREE.Mesh(gameOverGeo, material);
    resetMesh = new THREE.Mesh(resetGeo, material);
    group.add(gameOverMesh);
    group.add(resetMesh);
    gameOverMesh.geometry.center();
    resetMesh.geometry.center();
    gameOverMesh.position.set(0, 0.05, 0.1);
    resetMesh.position.set(0, -0.07, 0.1);
    gameOverMesh.material.transparent = true;
    gameOverMesh.material.opacity = 0;
    resetMesh.material.transparent = true;
    resetMesh.material.opacity = 0;

} );

// create next pieces grid
const nextBoxes = {};
var boxNextGeo, boxNextMat, boxNextMesh, spacing = 0;
for (let j = 0; j < 12; j++) {
    for (let i = 0; i < 4; i++) {
        boxNextGeo = new THREE.BoxGeometry(.03,.03,.03);
        boxNextMat = new THREE.MeshBasicMaterial({
            color: 0x000000
        });
        boxNextMesh = new THREE.Mesh(boxNextGeo, boxNextMat);
        scene.add(boxNextMesh);
        boxNextMesh.position.set(i * .03 - .42, j * .03 - .33 + spacing, 0);
        nextBoxes[coords(i,j)] = boxNextMesh;
    }
    if (j % 2 != 0 && j != 0) {
        spacing += 0.064;
    }
}

// create hold pieces grid
const holdBoxes = {};
var boxHoldGeo, boxHoldMat, boxHoldMesh;
for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 4; i++) {
        boxHoldGeo = new THREE.BoxGeometry(.03,.03,.03);
        boxHoldMat = new THREE.MeshBasicMaterial({
            color: 0x000000
        });
        boxHoldMesh = new THREE.Mesh(boxHoldGeo, boxHoldMat);
        scene.add(boxHoldMesh);
        boxHoldMesh.position.set(i * .03 + .33, j * .03 - .4, 0);
        holdBoxes[coords(i,j)] = boxHoldMesh;
    }
}
refreshHoldPiece();

// starting seed for debugging
// for (let i = 0; i < 9; i++) {
//     for (let j = 0; j < 12; j++) {
//         boxes[coords(i, j)].material.color.setHex(0x00ffff);
//         boxes[coords(i, j)].material.transparent = false;
//         boxes[coords(i, j)].material.opacity = 1;
//     }
// }

// create grid frame
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

// create hold frame
const leftFrameHold = new THREE.BoxGeometry(.001, .17, .025);
const leftMeshHold = new THREE.Mesh(leftFrameHold, frameMat);
scene.add(leftMeshHold);
leftMeshHold.position.set(.29,-.385,0);
const rightFrameHold = new THREE.BoxGeometry(.001, .17, .025);
const rightMeshHold = new THREE.Mesh(rightFrameHold, frameMat);
scene.add(rightMeshHold);
rightMeshHold.position.set(.46,-.385,0);
const topFrameHold = new THREE.BoxGeometry(.17, .001, .025);
const topMeshHold = new THREE.Mesh(topFrameHold, frameMat);
scene.add(topMeshHold);
topMeshHold.position.set(.375,-.3,0);
const bottomFrameHold = new THREE.BoxGeometry(.17, .001, .025);
const bottomMeshHold = new THREE.Mesh(bottomFrameHold, frameMat);
scene.add(bottomMeshHold);
bottomMeshHold.position.set(.375,-.47,0);

// create next frame
const leftFrameNext = new THREE.BoxGeometry(.001, .75, .025);
const leftMeshNext = new THREE.Mesh(leftFrameNext, frameMat);
scene.add(leftMeshNext);
leftMeshNext.position.set(-.29,0,0);
const rightFrameNext = new THREE.BoxGeometry(.001, .75, .025);
const rightMeshNext = new THREE.Mesh(rightFrameNext, frameMat);
scene.add(rightMeshNext);
rightMeshNext.position.set(-.46,0,0);
const topFrameNext = new THREE.BoxGeometry(.17, .001, .025);
const topMeshNext = new THREE.Mesh(topFrameNext, frameMat);
scene.add(topMeshNext);
topMeshNext.position.set(-.375,.375,0);
const bottomFrameNext = new THREE.BoxGeometry(.17, .001, .025);
const bottomMeshNext = new THREE.Mesh(bottomFrameNext, frameMat);
scene.add(bottomMeshNext);
bottomMeshNext.position.set(-.375,-.375,0);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    if (!gameOver) {
        tick();
    }
}

var newPiece = true;
function tick() {
    if (newPiece) {
        if (currPiece == null) {
            if (piece7bag.length == 7) {
                piece7bag = shuffle(pieces).concat(piece7bag);
            }
            currPiece = piece7bag.pop();
            refreshNextPieces();
        }
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
        if (gameOver) {
            gobMesh.material.transparent = false;
            gobMesh.material.opacity = 1;
            loader1.load( 'https://unpkg.com/three@0.120.1/examples/fonts/helvetiker_regular.typeface.json' , function ( font ) {
                gameOverMesh.material.transparent = false;
                gameOverMesh.material.opacity = 1;
                resetMesh.material.transparent = false;
                resetMesh.material.opacity = 1;
            } );
        }
        piecePosition = 'A';
        newPiece = false;
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
                newPiece = true;

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
                    score += scoringSystem[rowsDel.length - 1] * (level + 1);
                    linesCleared += rowsDel.length;
                    level = Math.floor(linesCleared / 10);
                    refreshScore();
                    refreshLevel();
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
                } else if (input == 'hold') {
                    if (hold == -1) {
                        hold = currPiece;
                        currPiece = null;
                        for (let k = 0; k < 4; k++) {
                            clearPiece(currSquares[k][0], currSquares[k][1]);
                        }
                        currSquares = [];
                    } else {
                        let newPiece = hold;
                        hold = currPiece;
                        currPiece = newPiece;
                        for (let k = 0; k < 4; k++) {
                            clearPiece(currSquares[k][0], currSquares[k][1]);
                        }
                        currSquares = [];
                    }
                    newPiece = true;
                    refreshHoldPiece();
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
    } else if (name == 'f') {
        input = "hold";
    } else if (name == 'r') {
        reset();
    }
}, false);

function reset() {

    // hide game over screen
    gobMesh.material.transparent = true;
    gobMesh.material.opacity = 0;
    loader1.load( 'https://unpkg.com/three@0.120.1/examples/fonts/helvetiker_regular.typeface.json' , function ( font ) {
        gameOverMesh.material.transparent = true;
        gameOverMesh.material.opacity = 0;
        resetMesh.material.transparent = true;
        resetMesh.material.opacity = 0;
    } );

    // reset vars
    level = 0;
    currPiece = null;
    currSquares = [];
    input = '';
    ticks = 0;
    piecePosition = '';
    linesCleared = 0;
    score = 0;
    piece7bag = shuffle(pieces).concat(shuffle(pieces));
    hold = -1;
    gameOver = false;
    newPiece = true;

    // clear board
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 20; j++) {
            clearPiece(i, j);
        }
    }

}

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
    if (boxes[coords(i, j)].material.transparent == false) {
        gameOver = true;
    }
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

function refreshScore() {
    group.remove(scoreMesh);
    createScore();
}

function createScore() {
    const loader = new FontLoader();
    loader.load( 'https://unpkg.com/three@0.120.1/examples/fonts/helvetiker_regular.typeface.json' , function ( font ) {

        const textGeo = new THREE.TextGeometry( score.toString(), {
            font: font,
            size: 0.05,
            height: 0.01,
            curveSegments: 12,
        } );
        // textGeo.rotateX(rotX);
        // textGeo.rotateY(rotY);
        // textGeo.rotateZ(rotZ);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });
        scoreMesh = new THREE.Mesh(textGeo, material);
        group.add(scoreMesh);
        scoreMesh.position.set(0.283, 0.345, 0);

    } );
}

function refreshLevel() {
    group.remove(levelMesh);
    createLevel();
}

function createLevel() {
    const loader = new FontLoader();
    loader.load( 'https://unpkg.com/three@0.120.1/examples/fonts/helvetiker_regular.typeface.json' , function ( font ) {

        const textGeo = new THREE.TextGeometry( level.toString(), {
            font: font,
            size: 0.05,
            height: 0.01,
            curveSegments: 12,
        } );
        // textGeo.rotateX(rotX);
        // textGeo.rotateY(rotY);
        // textGeo.rotateZ(rotZ);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });
        levelMesh = new THREE.Mesh(textGeo, material);
        group.add(levelMesh);
        levelMesh.position.set(0.283, 0.145, 0);

    } );
}

function addStaticText(txt, fontSize, rotX, rotY, rotZ, x, y, z, fooColor) {
    const loader = new FontLoader();
    loader.load( 'https://unpkg.com/three@0.120.1/examples/fonts/helvetiker_regular.typeface.json' , function ( font ) {

        const textGeo = new THREE.TextGeometry( txt, {
            font: font,
            size: fontSize,
            height: 0.01,
            curveSegments: 12,
        } );
        textGeo.rotateX(rotX);
        textGeo.rotateY(rotY);
        textGeo.rotateZ(rotZ);
        const material = new THREE.MeshBasicMaterial({
            color: fooColor
        });
        const mesh = new THREE.Mesh(textGeo, material);
        scene.add(mesh);
        mesh.geometry.center();
        mesh.position.set(x, y, z);

    } );
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

function refreshNextPieces() {
    let nextPieces = [piece7bag.at(-1), piece7bag.at(-2), piece7bag.at(-3), piece7bag.at(-4), piece7bag.at(-5), piece7bag.at(-6)];
    let currNext, currColor;
    for (let y = 0; y < 12; y += 2) {
        currNext = nextPieces.pop();
        if (currNext == 0) {
            currColor = 0x00ffff;
            changeNextPiece(0, y, currColor);
            changeNextPiece(1, y, currColor);
            changeNextPiece(2, y, currColor);
            changeNextPiece(3, y, currColor);
            clearNextPiece(0, y + 1);
            clearNextPiece(1, y + 1);
            clearNextPiece(2, y + 1);
            clearNextPiece(3, y + 1);
        } else if (currNext == 1) {
            currColor = 0x00008b;
            changeNextPiece(0, y, currColor);
            changeNextPiece(1, y, currColor);
            changeNextPiece(2, y, currColor);
            clearNextPiece(3, y);
            changeNextPiece(0, y + 1, currColor);
            clearNextPiece(1, y + 1);
            clearNextPiece(2, y + 1);
            clearNextPiece(3, y + 1);
        } else if (currNext == 2) {
            currColor = 0xffa500;
            clearNextPiece(0, y);
            changeNextPiece(1, y, currColor);
            changeNextPiece(2, y, currColor);
            changeNextPiece(3, y, currColor);
            changeNextPiece(3, y + 1, currColor);
            clearNextPiece(0, y + 1);
            clearNextPiece(1, y + 1);
            clearNextPiece(2, y + 1);
        } else if (currNext == 3) {
            currColor = 0xffff00;
            changeNextPiece(1, y, currColor);
            changeNextPiece(1, y + 1, currColor);
            changeNextPiece(2, y, currColor);
            changeNextPiece(2, y + 1, currColor);
            clearNextPiece(0, y + 1);
            clearNextPiece(3, y + 1);
            clearNextPiece(0, y);
            clearNextPiece(3, y);
        } else if (currNext == 4) {
            currColor = 0x90ee90;
            changeNextPiece(0, y, currColor);
            changeNextPiece(1, y, currColor);
            changeNextPiece(1, y + 1, currColor);
            changeNextPiece(2, y + 1, currColor);
            clearNextPiece(0, y + 1);
            clearNextPiece(2, y);
            clearNextPiece(3, y + 1);
            clearNextPiece(3, y);
        } else if (currNext == 5) {
            currColor = 0xa020f0;
            changeNextPiece(0, y, currColor);
            changeNextPiece(1, y, currColor);
            changeNextPiece(2, y, currColor);
            changeNextPiece(1, y + 1, currColor);
            clearNextPiece(0, y + 1);
            clearNextPiece(3, y);
            clearNextPiece(2, y + 1);
            clearNextPiece(3, y + 1);
        } else {
            currColor = 0xff0000;
            changeNextPiece(1, y + 1, currColor);
            changeNextPiece(2, y + 1, currColor);
            changeNextPiece(2, y, currColor);
            changeNextPiece(3, y, currColor);
            clearNextPiece(0, y);
            clearNextPiece(1, y);
            clearNextPiece(0, y + 1);
            clearNextPiece(3, y + 1);
        }
    }
}

function changeNextPiece(i, j, color) {
    nextBoxes[coords(i, j)].material.color.setHex(color);
    nextBoxes[coords(i, j)].material.transparent = false;
    nextBoxes[coords(i, j)].material.opacity = 1;
}

function clearNextPiece(i, j) {
    nextBoxes[coords(i, j)].material.transparent = true;
    nextBoxes[coords(i, j)].material.opacity = 0;
}

function refreshHoldPiece() {
    let currColor;
    if (hold == -1) {
        clearHoldPiece(0, 0);
        clearHoldPiece(1, 0);
        clearHoldPiece(2, 0);
        clearHoldPiece(3, 0);
        clearHoldPiece(0, 1);
        clearHoldPiece(1, 1);
        clearHoldPiece(2, 1);
        clearHoldPiece(3, 1);
    }
    else if (hold == 0) {
        currColor = 0x00ffff;
        changeHoldPiece(0, 0, currColor);
        changeHoldPiece(1, 0, currColor);
        changeHoldPiece(2, 0, currColor);
        changeHoldPiece(3, 0, currColor);
        clearHoldPiece(0, 1);
        clearHoldPiece(1, 1);
        clearHoldPiece(2, 1);
        clearHoldPiece(3, 1);
    } else if (hold == 1) {
        currColor = 0x00008b;
        changeHoldPiece(0, 0, currColor);
        changeHoldPiece(1, 0, currColor);
        changeHoldPiece(2, 0, currColor);
        clearHoldPiece(3, 0);
        changeHoldPiece(0, 1, currColor);
        clearHoldPiece(1, 1);
        clearHoldPiece(2, 1);
        clearHoldPiece(3, 1);
    } else if (hold == 2) {
        currColor = 0xffa500;
        clearHoldPiece(0, 0);
        changeHoldPiece(1, 0, currColor);
        changeHoldPiece(2, 0, currColor);
        changeHoldPiece(3, 0, currColor);
        changeHoldPiece(3, 1, currColor);
        clearHoldPiece(0, 1);
        clearHoldPiece(1, 1);
        clearHoldPiece(2, 1);
    } else if (hold == 3) {
        currColor = 0xffff00;
        changeHoldPiece(1, 0, currColor);
        changeHoldPiece(1, 1, currColor);
        changeHoldPiece(2, 0, currColor);
        changeHoldPiece(2, 1, currColor);
        clearHoldPiece(0, 1);
        clearHoldPiece(3, 1);
        clearHoldPiece(0, 0);
        clearHoldPiece(3, 0);
    } else if (hold == 4) {
        currColor = 0x90ee90;
        changeHoldPiece(0, 0, currColor);
        changeHoldPiece(1, 0, currColor);
        changeHoldPiece(1, 1, currColor);
        changeHoldPiece(2, 1, currColor);
        clearHoldPiece(0, 1);
        clearHoldPiece(2, 0);
        clearHoldPiece(3, 1);
        clearHoldPiece(3, 0);
    } else if (hold == 5) {
        currColor = 0xa020f0;
        changeHoldPiece(0, 0, currColor);
        changeHoldPiece(1, 0, currColor);
        changeHoldPiece(2, 0, currColor);
        changeHoldPiece(1, 1, currColor);
        clearHoldPiece(0, 1);
        clearHoldPiece(3, 0);
        clearHoldPiece(2, 1);
        clearHoldPiece(3, 1);
    } else {
        currColor = 0xff0000;
        changeHoldPiece(1, 1, currColor);
        changeHoldPiece(2, 1, currColor);
        changeHoldPiece(2, 0, currColor);
        changeHoldPiece(3, 0, currColor);
        clearHoldPiece(0, 0);
        clearHoldPiece(1, 0);
        clearHoldPiece(0, 1);
        clearHoldPiece(3, 1);
    }
}

function changeHoldPiece(i, j, color) {
    holdBoxes[coords(i, j)].material.color.setHex(color);
    holdBoxes[coords(i, j)].material.transparent = false;
    holdBoxes[coords(i, j)].material.opacity = 1;
}

function clearHoldPiece(i, j) {
    holdBoxes[coords(i, j)].material.transparent = true;
    holdBoxes[coords(i, j)].material.opacity = 0;
}

animate();
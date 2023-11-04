let canvas;
let ctx;

let simulateRunning = false;
let state = "DRAWING"

let gridSize = 150;
let globalWorld = [];

let markedIndexes = [];

function initializeGameOfLife() {
    for(let i = 0; i < gridSize; i++) {
        globalWorld.push(new Array(gridSize));
        for(let j = 0; j < gridSize; j++) {
            globalWorld[i][j] = 0;
        }
    }

    let savedWorld =  localStorage.getItem("grid");
    if (savedWorld) {
        globalWorld = JSON.parse(savedWorld);
    }
}

// Any live cell with two or three live neighbours survives.
// Any dead cell with three live neighbours becomes a live cell.
// All other live cells die in the next generation. Similarly, all other dead cells stay dead.
function simulate(world) {
    if (!simulateRunning) {
        return world;
    }

    let newWorld = [];
    for(let i = 0; i < gridSize; i++) {
        newWorld.push(new Array(gridSize));
        for(let j = 0; j < gridSize; j++) {
            newWorld[i][j] = 2;
        }
    }

    for(let i = 0; i < world.length; i++) {
        for(let j = 0; j < world[i].length; j++) {
            if (world[i][j] == 1) {
                let neighbours = countNeighbours(world, i,j);
                if (neighbours == 2 || neighbours == 3) {
                    newWorld[i][j] = 1;
                } else {
                    newWorld[i][j] = 2;
                }
            } else if (world[i][j] == 2) {
                let neighbours = countNeighbours(world, i,j);
                if (neighbours == 3) {
                    newWorld[i][j] = 1;
                }
            }
        }
    }

    return newWorld
}

function countNeighbours(world, i,j) {
    let count = 0;

    if (i - 1 >=0 && world[i-1][j] == 1) {
        count++;
    }
    if (i - 1 >=0 && j - 1 >= 0 && world[i-1][j-1] == 1) {
        count++;
    }
    if (i - 1 >=0 && j+1 < gridSize && world[i-1][j+1] == 1) {
        count++;
    }
    if (j-1 >= 0 && world[i][j-1] == 1) {
        count++;
    }
    if (j+1 < gridSize && world[i][j+1] == 1) {
        count++;
    }
    if (i + 1 < gridSize && j - 1 >= 0 && world[i+1][j-1] == 1) {
        count++;
    }
    if (i + 1 < gridSize && world[i+1][j] == 1) {
        count++;
    }
    if (i + 1 < gridSize && j+1 < gridSize && world[i+1][j+1] == 1) {
        count++;
    }

    return count++;
}

function drawGameOfLife(ctx, world) {
    ctx.fillStyle="white";
    for(let i = 0; i < globalWorld.length; i++) {
        for(let j = 0; j < globalWorld[i].length; j++) {
            if (globalWorld[i][j] == 1) {
                ctx.fillRect((i*5)+(i*2),(j*5)+(j*2),5,5);
                ctx.fill();
            }
        }
    }
}

function update() {
    // ctx.clearRect(0,0, 1000, 1000);
    ctx.fillStyle="black";
    ctx.fillRect(0,0, 1000, 1000);

    if (state == "DRAWING") {
        ctx.strokeStyle="gray";
    } else if (state == "COPYING") {
        ctx.strokeStyle = "#878CFF";
    } else if (state == "SIMULATING") {
        ctx.strokeStyle = "green";
    }

    if (state != "SIMULATING") {
        for(let i = 0; i < gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i*7 - 1,0)
            ctx.lineTo(i*7 - 1,gridSize*7);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0,i*7 - 1)
            ctx.lineTo(gridSize*7,i*7 - 1);
            ctx.stroke();
        }
    }

    drawElectrons(ctx, globalWorld);

    if (beginning != null && ending != null) {
        ctx.fillStyle="#5865f2";

        let beginX = Math.min(beginning.x, ending.x);
        let beginY = Math.min(beginning.y, ending.y);
        let endX = Math.max(beginning.x, ending.x);
        let endY = Math.max(beginning.y, ending.y);

        for (let i = beginX; i <= endX; i++) {
            for (let j = beginY; j <= endY; j++) {
                ctx.fillRect((i*5)+(i*2),(j*5)+(j*2),5,5);
            }
        }
    }

    let offsetX = mousePosition.x;
    let offsetY = mousePosition.y;
    for(let i = 0; i < copied.length; i++) {
        let x = offsetX + copied[i].x;
        let y = offsetY + copied[i].y;
        if (copied[i].state != 0) {
            ctx.fillStyle = "green";
            ctx.fillRect((x*5)+(x*2),(y*5)+(y*2),5,5);
        }
        if (copied[i].state == 0) {
            ctx.fillStyle = "blue";
            ctx.fillRect((x*5)+(x*2),(y*5)+(y*2),5,5);
        }
    }

    globalWorld = simulateWireworld(globalWorld);

    setTimeout(update, 1000/4);
}

let mouseDown = false;
let mousePosition = {x: 0, y: 0};
let beginning = null, ending = null;
let mouseButton = null;

let typeOfWire = 0;

let copied = [];


window.onload = function() {
    // initializeGameOfLife();
    initializeWireWorld();

    canvas = document.getElementById("board");
    ctx = canvas.getContext("2d");

    canvas.addEventListener("mouseup", (ev) => {
        mouseDown = false;

        let beginX = Math.min(beginning.x, ending.x);
        let beginY = Math.min(beginning.y, ending.y);
        let endX = Math.max(beginning.x, ending.x);
        let endY = Math.max(beginning.y, ending.y);

        if (state == "COPYING") {
            for (let i = beginX; i <= endX; i++) {
                for (let j = beginY; j <= endY; j++) {
                    if (globalWorld[i][j] != 0) {
                        copied.push({
                            x: i - beginX,
                            y: j - beginY,
                            state: globalWorld[i][j]
                        });
                    }
                }
            }
        } else {
            for (let i = beginX; i <= endX; i++) {
                for (let j = beginY; j <= endY; j++) {
                    globalWorld[i][j] = typeOfWire;
                }
            }
        }

        beginning = null;
        ending = null;
    },true);

    // window.oncontextmenu = () => {
    //     return false;
    // }

    canvas.addEventListener("mousedown", (ev) => {
        let x = Math.floor(ev.offsetX / 7);
        let y = Math.floor(ev.offsetY / 7);
        if (!mouseDown) {
            mouseDown = true;
            console.log(ev);
            mouseButton = ev.button;

            beginning = {x: x, y: y};
            ending = {x: x, y: y};
        }
    }, true);

    canvas.addEventListener("mousemove", (ev) => {
        let x = Math.floor(ev.offsetX / 7);
        let y = Math.floor(ev.offsetY / 7);

        if (mouseDown) {
            ending = {x: x, y: y};
        }

        mousePosition = {x: x, y: y};
    }, true);

    window.addEventListener("keypress", (ev) => {
        if (ev.key == "Enter") {
            simulateRunning = !simulateRunning

            if (simulateRunning) {
                state = "SIMULATING"
            } else {
                state = "DRAWING"
            }
        }

        console.log(ev.key);
        if (ev.key == "0") {
            typeOfWire = 0;
        }
        if (ev.key == "1") {
            typeOfWire = 1;
        }
        if (ev.key == "2") {
            typeOfWire = 2;
        }
        if (ev.key == "3") {
            typeOfWire = 3;
        }

        if (ev.key == "f" && !simulateRunning) {
            if (state == "SIMULATING") {
                state = "DRAWING"
            } else if (state == "DRAWING") {
                state = "COPYING"
            } else if (state == "COPYING") {
                state = "DRAWING"
            }
        }

        if (ev.key == "b") {
            let offsetX = mousePosition.x;
            let offsetY = mousePosition.y;

            for (let i = 0; i < copied.length; i++) {
                let x = offsetX + copied[i].x;
                let y = offsetY + copied[i].y;
                globalWorld[x][y] = copied[i].state;
            }

            copied = [];
        }

        if (ev.key == "s") {
            localStorage.setItem("grid", JSON.stringify(globalWorld));
            alert("saved");
        }
    }, false);

    update();
}

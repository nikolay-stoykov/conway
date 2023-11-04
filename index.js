// width: 1000px; height: 800px;
let canvas;
let ctx;

let simulateRunning = false;
let state = "DRAWING"

let gridSize = 120;
let world = [];

let markedIndexes = [];

for(let i = 0; i < gridSize; i++) {
    world.push(new Array(gridSize));
    for(let j = 0; j < gridSize; j++) {
        world[i][j] = 2;
    }
}

function initialize() {
    let savedWorld =  localStorage.getItem("grid");
    if (savedWorld) {
        world = JSON.parse(savedWorld);
    }

    // world[3][6] = 1;
    // world[3][7] = 1;
    // world[4][6] = 1;
    // world[4][7] = 1;

    // world[13][6]=1;
    // world[13][7]=1;
    // world[13][8]=1;
    // world[14][5]=1;
    // world[14][9]=1;
    // world[15][10]=1;
    // world[16][10]=1;
    // world[15][4]=1;
    // world[16][4]=1;

    // world[17][7]=1;

    // world[19][6]=1;
    // world[19][7]=1;
    // world[19][8]=1;
    // world[18][5]=1;
    // world[18][9]=1;
    // world[20][7]=1;

    // world[23]


    // Glider
    // world[5][2] = 1;
    // world[5][3] = 1;
    // world[5][4] = 1;
    // world[4][4] = 1;
    // world[3][3] = 1;

    // world[5][3] = 1;
    // world[5][4] = 1;
    // world[5][2] = 1;
    // world[6][2] = 1;
    // world[10][2] = 1;
    // world[10][3] = 1;
    // world[10][4] = 1;
    // world[10][6] = 1;
    // world[8][6] = 1;
}

// Any live cell with two or three live neighbours survives.
// Any dead cell with three live neighbours becomes a live cell.
// All other live cells die in the next generation. Similarly, all other dead cells stay dead.
function simulate() {
    if (!simulateRunning) {
        return;
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

    world = newWorld;
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
    if (i + 1 < gridSize && world[i+1][j-1] == 1) {
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

function update() {
    ctx.clearRect(0,0, 1000, 800);

    if (state == "DRAWING") {
        ctx.strokeStyle="gray";
    } else if (state == "MEASURE") {
        ctx.strokeStyle = "#878CFF";
    } else if (state == "SIMULATING") {
        ctx.strokeStyle = "green";
    }

    if (state != "SIMULATING") {
        for(let i = 0; i < gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i*7 - 1,0)
            ctx.lineTo(i*7 - 1,1000);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0,i*7 - 1)
            ctx.lineTo(1000,i*7 - 1);
            ctx.stroke();
        }
    }

    ctx.fillStyle="red";
    for(let i = 0; i < world.length; i++) {
        for(let j = 0; j < world[i].length; j++) {
            if (world[i][j] == 1) {
                ctx.fillRect((i*5)+(i*2),(j*5)+(j*2),5,5);
                ctx.fill();
            }
        }
    }

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

    simulate();

    setTimeout(update, 1000/20);
}

// 600/5 = 200
// 400 = 2px

let mouseDown = false;
let beginning = null, ending = null;
let mouseButton = null;

window.onload = function() {
    initialize();
    canvas = document.getElementById("board");
    ctx = canvas.getContext("2d");

    canvas.addEventListener("click", (ev) => {
        if (state != "DRAWING") {
            return;
        }

        let x = Math.round(ev.offsetX / 7);
        let y = Math.round(ev.offsetY / 7);
        if (world[x][y] == 1) {
            world[x][y] = 2;
        } else {
            world[x][y] = 1;
        }
    }, false);

    canvas.addEventListener("mouseup", (ev) => {
        mouseDown = false;

        let beginX = Math.min(beginning.x, ending.x);
        let beginY = Math.min(beginning.y, ending.y);
        let endX = Math.max(beginning.x, ending.x);
        let endY = Math.max(beginning.y, ending.y);

        for (let i = beginX; i <= endX; i++) {
            for (let j = beginY; j <= endY; j++) {
                if (mouseButton == 0) {
                    world[i][j] = 1;
                } else {
                    world[i][j] = 2;
                }
            }
        }

        beginning = null;
        ending = null;
    },true);

    window.oncontextmenu = () => {
        return false;
    }

    canvas.addEventListener("mousedown", (ev) => {
        let x = Math.round(ev.offsetX / 7);
        let y = Math.round(ev.offsetY / 7);
        if (!mouseDown) {
            mouseDown = true;
            console.log(ev);
            mouseButton = ev.button;

            beginning = {x: x, y: y};
            ending = {x: x, y: y};
        }
    }, true);

    canvas.addEventListener("mousemove", (ev) => {
        if (mouseDown) {
            let x = Math.round(ev.offsetX / 7);
            let y = Math.round(ev.offsetY / 7);

            ending = {x: x, y: y};
        }
    }, true);

    window.addEventListener("keypress", (ev) => {
        if (ev.key == "Enter") {
            // simulateRunning = !simulateRunning
            if (state == "DRAWING") {
                state = "SIMULATING"
            } else if (state == "SIMULATING") {
                state = "MEASURE"
            } else if (state == "MEASURE") {
                state = "DRAWING"
            }

            simulateRunning = (state == "SIMULATING")
        }

        if (ev.key == "s") {
            localStorage.setItem("grid", JSON.stringify(world));
            alert("saved");
        }
    }, false);

    update();
}

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
    } else if (state == "COPYING") {
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

let mouseDown = false;
let mousePosition = {x: 0, y: 0};
let beginning = null, ending = null;
let mouseButton = null;

let copied = [];


window.onload = function() {
    initialize();
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
                    copied.push({
                        x: i - beginX,
                        y: j - beginY,
                        state: world[i][j]
                    });
                }
            }
        } else {
            for (let i = beginX; i <= endX; i++) {
                for (let j = beginY; j <= endY; j++) {
                    if (mouseButton == 0) {
                        world[i][j] = 1;
                    } else {
                        world[i][j] = 2;
                    }
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
        let x = Math.round(ev.offsetX / 7);
        let y = Math.round(ev.offsetY / 7);

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
            }
        }

        if (ev.key = "f") {
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
                world[x][y] = copied[i].state;
            }
        }

        if (ev.key == "s") {
            localStorage.setItem("grid", JSON.stringify(world));
            alert("saved");
        }
    }, false);

    update();
}

// A Wireworld cell can be in one of four different states, usually numbered 0–3 in software, modeled by colors in the examples here:

// empty (black),
// electron head (blue),
// electron tail (red),
// conductor (yellow).
// As in all cellular automata, time proceeds in discrete steps called generations (sometimes "gens" or "ticks"). Cells behave as follows:

// empty → empty,
// electron head → electron tail,
// electron tail → conductor,
// conductor → electron head if exactly one or two of the neighbouring cells are electron heads, otherwise remains conductor.
function simulateWireworld(world) {
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
            if (world[i][j] == 0) {
                newWorld[i][j] = 0;
            } else if (world[i][j] == 1) {
                newWorld[i][j] = 2;
            } else if (world[i][j] == 2) {
                newWorld[i][j] = 3;
            } else if (world[i][j] == 3) {
                let heads = countElectronHeads(world, i, j);
                if (heads == 1 || heads == 2) {
                    newWorld[i][j] = 1;
                } else {
                    newWorld[i][j] = 3;
                }
            }
        }
    }

    return newWorld;
}

function drawElectrons(ctx, world) {
    for(let i = 0; i < world.length; i++) {
        for(let j = 0; j < world[i].length; j++) {
            if (world[i][j] == 0) {
                ctx.fillStyle="black";
            } else if (world[i][j] == 1) {
                ctx.fillStyle="blue";
            } else if (world[i][j] == 2) {
                ctx.fillStyle="red";
            } else if (world[i][j] == 3) {
                ctx.fillStyle="yellow";
            }

            ctx.fillRect((i*5)+(i*2),(j*5)+(j*2),5,5);
            ctx.fill();
        }
    }
}

function countElectronHeads(world, i, j) {
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

function initializeWireWorld() {
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

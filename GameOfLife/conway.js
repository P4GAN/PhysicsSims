const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.height = 500;
canvas.width = 500;

directions = [[-1, -1], [-1, 0], [0, -1], [-1, 1], [1, -1], [1, 0], [0, 1], [1, 1]]

rows = 30;
columns = 30;

grid = []
for (let i = 0; i < rows; i++) {
    row = [];
    grid.push(row)
    for (let j = 0; j < columns; j++) {
        row.push(0)
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let [width, height] = [canvas.width, canvas.height]
    for (let i = 0; i < rows; i++) {
        ctx.moveTo(0, i * width / columns);
        ctx.lineTo(width, i * width / columns);
    }
    for (let j = 0; j < columns; j++) {
        ctx.moveTo(j * height / rows, 0);
        ctx.lineTo(j * height / rows, height);
    }
    ctx.strokeStyle = "black";
    ctx.stroke();
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if (grid[i][j]) {
                ctx.beginPath();
                ctx.rect(j * width / columns, i * height /rows, width / columns, height / rows);
                ctx.fill();
            }
        }
    }
    requestAnimationFrame(draw)
}

document.addEventListener("mousedown", function(e) {
    let [width, height] = [canvas.width, canvas.height]

    let row = Math.round(e.y / (height / rows)) - 1;
    let column = Math.round(e.x / (width / columns)) - 1;

    console.log(row, column)
    grid[row][column] = !grid[row][column]
})

requestAnimationFrame(draw);

function update() {
    newGrid = []
    for (let i = 0; i < rows; i++) {
        row = [];
        newGrid.push(row)
        for (let j = 0; j < columns; j++) {
            newGrid[i][j] = grid[i][j]
            neighbours = 0;
            for (let n = 0; n < directions.length; n++) {
                [x, y] = [j + directions[n][0], i + directions[n][1]];
                if (0 < x && x < columns && 0 < y && y < rows) {
                    neighbours += grid[y][x]
                }
                console.log(neighbours)
            }
            if (grid[i][j]) {
                if (neighbours < 2 || neighbours > 3) {
                    newGrid[i][j] = 0
                }
            }
            else {
                if (neighbours == 3) {
                    newGrid[i][j] = 1
                }
            }
        }
    }
    grid = newGrid
}
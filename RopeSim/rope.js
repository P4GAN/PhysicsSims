const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const simulationHeight = 10;
const simulationWidth = 15;

const g = 9.8;
const substeps = 8;
const friction = 0.3;
const particleList = [];
const springList = [];

let mouseX = 0;
let mouseY = 0;

let mousedown = false;

let lastTime = 0;

function getCanvasCoords(x, y) {
    let canvasX = x * ctx.canvas.width / simulationWidth;
    let canvasY = ctx.canvas.height - y * ctx.canvas.height / simulationHeight;
    return [canvasX, canvasY];
}

function getSimulationCoords(canvasX, canvasY) {
    let x = canvasX * simulationWidth / ctx.canvas.width;
    let y = simulationHeight - canvasY * simulationHeight / ctx.canvas.height;
    return [x, y];
}

class Particle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        particleList.push(this)
    }
    physicsStep(dt) {}
    applyForce(fx, fy) {}
    draw() {
        let [drawX, drawY] = getCanvasCoords(this.x, this.y)
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.r, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class DynamicParticle extends Particle {
    constructor(x, y, r, m) {
        super(x, y, r)
        this.m = m;
        this.prevX = x;
        this.prevY = y;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
    }
    physicsStep(dt) {
        let [tempX, tempY] = [this.x, this.y];
        this.x = 2 * this.x - this.prevX + this.ax * dt ** 2
        this.y = 2 * this.y - this.prevY + this.ay * dt ** 2
        this.vx = (this.x - this.prevX) / dt
        this.vy = (this.y - this.prevY) / dt
        this.ax = 0;
        this.ay = 0;
        this.prevX = tempX;
        this.prevY = tempY;
    }
    applyForce(fx, fy) {
        this.ax += fx / this.m;
        this.ay += fy / this.m;
    }
}

class Spring {
    constructor(k, springLength, a, b) {
        this.k = k;
        this.springLength = springLength;
        this.a = a;
        this.b = b;
        springList.push(this);
    }
    springStep() {
        let fx = 0;
        let fy = 0;
        let length = Math.sqrt((this.a.x - this.b.x) ** 2 + (this.a.y - this.b.y) ** 2);
        fx += -this.k * (length - this.springLength) * (this.a.x - this.b.x) / length;
        fy += -this.k * (length - this.springLength) * (this.a.y - this.b.y) / length;
        this.a.applyForce(fx, fy);
        this.b.applyForce(-fx, -fy);
    }
    draw() {
        let [drawXa, drawYa] = getCanvasCoords(this.a.x, this.a.y)
        let [drawXb, drawYb] = getCanvasCoords(this.b.x, this.b.y)

        ctx.beginPath();
        ctx.moveTo(drawXa, drawYa);
        ctx.lineTo(drawXb, drawYb); 
        ctx.stroke();
    }
}

let static = new Particle(7.5, 9, 1);
for (let i = 1; i < 50; i++) {
    p = new DynamicParticle(7.5 - i * 0.05, 9 - i * 0.05, 1, 1);
    s = new Spring(5000, 0.01, p, particleList[i - 1]);
}
particleList[particleList.length - 1].r = 5
particleList[particleList.length - 1].m = 10

end = particleList[particleList.length - 1];

function moveEnd(e) {
    mouseX = e.x;
    mouseY = e.y
}

function applyGravity(particle) {
    particle.applyForce(0, -g * particle.m)
}

function applyFriction(particle) {
    particle.applyForce(friction * particle.vx, friction * particle.vy);
}

document.addEventListener("mousemove", moveEnd);
document.addEventListener("mousedown", () => {
    let [x, y] = getSimulationCoords(mouseX, mouseY);
    if ((x - end.x) ** 2 + (y - end.y) ** 2 < 1) {
        mousedown = true;
    }
});
document.addEventListener("mouseup", () => {mousedown = false});

function step(time) {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let dt = (lastTime - time) / 1000;
    lastTime = time;
    if (mousedown) {
        let [x, y] = getSimulationCoords(mouseX, mouseY);
        end.x = x;
        end.y = y;
        end.prevX = x;
        end.prevY = y;
    }

    for (let n = 0; n < substeps; n++) {
        for (let i = 0; i < springList.length; i++) {
            springList[i].springStep();
        }
        for (let i = 0; i < particleList.length; i++) {
            applyGravity(particleList[i]);
            applyFriction(particleList[i]);
            particleList[i].physicsStep(dt / substeps);
        }
    }

    for (let i = 0; i < particleList.length; i++) {
        particleList[i].draw();
    }
    for (let i = 0; i < springList.length; i++) {
        springList[i].draw();
    }
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);

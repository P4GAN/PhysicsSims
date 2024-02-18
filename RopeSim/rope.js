const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const simulationHeight = 10;
const simulationWidth = 15;

const g = 9.8;
const substeps = 16;
const friction = 0.5;
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
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        particleList.push(this)
        console.log(this)
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
    constructor(k, springLength, a, b, damping) {
        this.k = k;
        this.springLength = springLength;
        this.a = a;
        this.b = b;
        this.damping = damping;
        springList.push(this);
    }
    applyForces() {
        let f = 0;
        let length = Math.sqrt((this.a.x - this.b.x) ** 2 + (this.a.y - this.b.y) ** 2);
        let dvx = this.a.vx - this.b.vx;
        let dvy = this.a.vy - this.b.vy;
        f += -this.k * (length - this.springLength)
        f += this.damping * ((this.a.x - this.b.x) * dvx + (this.a.x - this.b.x) * dvy) / length
        
        let fx = 0;
        let fy = 0;
        if (length > 1e-3) {
            fx = f * (this.a.x - this.b.x) / length;
            fy = f * (this.a.y - this.b.y) / length;
        }

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
for (let i = 1; i < 30; i++) {
    console.log(i)
    p = new DynamicParticle(7.5 - i * 0.1, 9 - i * 0.1, 1, 1);
    s = new Spring(2000, 0.1, p, particleList[i - 1], 0.5);
}

let end = particleList[particleList.length - 1];
end.m = 10;
end.r = 10;

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
            springList[i].applyForces();
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

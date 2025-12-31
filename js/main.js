
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

let stars = [];
let particles = [];
let confetti = [];
let textPoints = [];
let textIndex = 0;
let state = "LAUNCH";
let timer = 0;
let textProgress = 0;
let currentGlow = "#ffffff";
let dissolveTimer = 0;

const TEXTS = ["Feliz Año Nuevo", "2026"];
const TEXT_COLOR = "white";

function getFontSize() { return Math.max(canvasWidth / 10, 30); }
const TEXT_FONT = () => `bold ${getFontSize()}px Arial`;

const TEXT_SPEED = [80, 70];               // velocidad de dibujo del texto
const TEXT_DISSOLVE_DURATION = 20;         // cantidad de frames para desintegrarse
const TEXT_DISPLAY_DURATION = [100, 160];  // cantidad de frames que permanece visible

const GLOW_COLORS = ["#00ffcc", "#3399ff", "#00ff66", "#66ffcc", "#ffffff", "#99ccff"];
const CONFETTI_COLORS = ["#ff0040", "#00ff00", "#ffff00", "#00ffff", "#ff99ff", "#ff6600"];

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    initStars();
    initConfetti();
    if (textPoints.length > 0) createTextPoints(TEXTS[textIndex]);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function initStars() {
    stars = Array.from({ length: Math.floor(canvasWidth / 3) }, () => ({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        r: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01
    }));
}

function drawStars() {
    stars.forEach(s => {
        s.phase += s.speed;
        const glow = (Math.sin(s.phase) + 1) / 2;
        ctx.globalAlpha = 0.3 + glow * 0.7;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r + glow, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function initConfetti() {
    confetti = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        size: Math.random() * 3 + 1,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        speed: Math.random() * 1 + 0.5,
        angle: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.5 + 0.2
    }));
}

function drawConfetti() {
    confetti.forEach(c => {
        ctx.fillStyle = c.color;
        ctx.globalAlpha = c.alpha;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size / 2, 0, Math.PI * 2);
        ctx.fill();
        c.y += c.speed;
        c.x += Math.sin(c.angle) * 0.5;
        c.angle += 0.02;
        if (c.y > canvasHeight) c.y = -c.size;
        if (c.x > canvasWidth) c.x = 0;
        if (c.x < 0) c.x = canvasWidth;
    });
    ctx.globalAlpha = 1;
}

function CENTER_X() { return canvasWidth / 2; }
function CENTER_Y() { return canvasHeight / 2; }

function createTextPoints(text) {
    const temp = document.createElement("canvas");
    const tctx = temp.getContext("2d");
    temp.width = canvasWidth;
    temp.height = canvasHeight;
    tctx.font = TEXT_FONT();
    tctx.textAlign = "center";
    tctx.fillStyle = "white";
    tctx.fillText(text, CENTER_X(), CENTER_Y());
    const data = tctx.getImageData(0, 0, temp.width, temp.height).data;
    textPoints = [];
    for (let x = 0; x < temp.width; x += 3) {
        for (let y = 0; y < temp.height; y += 3) {
            if (data[(y * temp.width + x) * 4 + 3] > 150) {
                textPoints.push({ x, y });
            }
        }
    }
    textPoints = textPoints.sort(() => Math.random() - 0.5);
    textProgress = 0;
    currentGlow = GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)];
    dissolveTimer = 0;
}

function launchTrail() {
    particles.push({ x: CENTER_X() + Math.random() * 4 - 2, y: canvasHeight, vx: Math.random() * 0.3 - 0.15, vy: -8, life: 50 });
}

function explodeFirework() {
    for (let i = 0; i < 280; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        particles.push({ x: CENTER_X(), y: CENTER_Y(), vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, gravity: 0.08, life: 160, color: `hsl(${Math.random() * 120 + 160},100%,70%)` });
    }
}

function drawParticles() {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        ctx.fillStyle = p.color || "white";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.gravity) p.vy += p.gravity;
        p.life--;
    });
}

function drawText() {
    ctx.fillStyle = TEXT_COLOR;
    ctx.shadowBlur = 20;
    if (Math.random() < 0.03) {
        currentGlow = GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)];
    }
    ctx.shadowColor = currentGlow;
    const max = Math.min(textProgress, textPoints.length);
    for (let i = 0; i < max; i++) {
        const p = textPoints[i];
        ctx.fillRect(p.x, p.y, 2, 2);
    }
    ctx.shadowBlur = 0;
    if (textProgress < textPoints.length) textProgress += TEXT_SPEED[textIndex];
}

function dissolveText() {
    dissolveTimer++;
    const removeCount = Math.ceil(textPoints.length / TEXT_DISSOLVE_DURATION);
    textPoints.splice(0, removeCount);
}

function animate() {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    drawStars();
    drawConfetti();
    drawParticles();

    switch (state) {
        case "LAUNCH":
            launchTrail();
            timer++;
            if (timer > 60) { timer = 0; explodeFirework(); state = "EXPLOSION_WAIT"; }
            break;
        case "EXPLOSION_WAIT":
            timer++;
            if (timer > 40) { createTextPoints(TEXTS[textIndex]); state = "WRITE_TEXT"; }
            break;
        case "WRITE_TEXT":
            drawText();
            if (textProgress >= textPoints.length) {
                timer++;
                if (timer > TEXT_DISPLAY_DURATION[textIndex]) {
                    state = "TEXT_DISSOLVE";
                    timer = 0;
                }
            }
            break;
        case "TEXT_DISSOLVE":
            drawText();
            dissolveText();
            if (textPoints.length === 0) {
                textIndex++;
                if (textIndex < TEXTS.length) { explodeFirework(); state = "EXPLOSION_WAIT"; }
                else { textIndex = 0; particles = []; state = "LAUNCH"; }
            }
            break;
    }
    requestAnimationFrame(animate);
}

animate();
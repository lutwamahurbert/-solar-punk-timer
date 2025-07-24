let timer = null;
let seconds = 0;
let quoteInterval = null;

const display = document.getElementById('display');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');
const quoteElem = document.getElementById('quote');
const authorElem = document.getElementById('author');

// Local list of quotes
const quotes = [
    { content: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { content: "Don’t let yesterday take up too much of today.", author: "Will Rogers" },
    { content: "It’s not whether you get knocked down, it’s whether you get up.", author: "Vince Lombardi" },
    { content: "If you are working on something exciting, it will keep you motivated.", author: "Steve Jobs" },
    { content: "Success is not in what you have, but who you are.", author: "Bo Bennett" },
    { content: "The harder you work for something, the greater you’ll feel when you achieve it.", author: "Unknown" },
    { content: "Dream bigger. Do bigger.", author: "Unknown" },
    { content: "Don’t watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { content: "Great things never come from comfort zones.", author: "Unknown" },
    { content: "Push yourself, because no one else is going to do it for you.", author: "Unknown" }
];

function getRandomQuote() {
    const idx = Math.floor(Math.random() * quotes.length);
    return quotes[idx];
}

function showQuote() {
    const quote = getRandomQuote();
    quoteElem.textContent = quote.content;
    authorElem.textContent = quote.author ? `— ${quote.author}` : '';
}

function startQuoteInterval() {
    showQuote();
    quoteInterval = setInterval(showQuote, 10000); // 10 seconds
}

function stopQuoteInterval() {
    clearInterval(quoteInterval);
    quoteInterval = null;
}

function resetQuote() {
    stopQuoteInterval();
    showQuote();
}

function updateDisplay() {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    display.textContent = `${mins}:${secs}`;
}

function startTimer() {
    if (timer) return;
    timer = setInterval(() => {
        seconds++;
        updateDisplay();
    }, 1000);
    startQuoteInterval();
}

function pauseTimer() {
    clearInterval(timer);
    timer = null;
    stopQuoteInterval();
}

function resetTimer() {
    pauseTimer();
    seconds = 0;
    updateDisplay();
    resetQuote();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize display and first quote
updateDisplay();
showQuote();

// --- Animated Solarpunk Park Background ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W = window.innerWidth;
let H = window.innerHeight;

function resizeCanvas() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Mouse interaction
let mouse = { x: -1000, y: -1000 };
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});
canvas.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

// Helper: random float in range
function rand(a, b) { return a + Math.random() * (b - a); }

// --- Leaves ---
const leafColors = ['#7ec850', '#b6e388', '#aee9c5', '#e6ffe6'];
const leaves = Array.from({length: 18}, () => ({
    x: rand(0, W),
    y: rand(-H, H),
    r: rand(12, 24),
    speed: rand(0.3, 1.1),
    sway: rand(0.8, 2.2),
    swayPhase: rand(0, Math.PI * 2),
    color: leafColors[Math.floor(rand(0, leafColors.length))],
    angle: rand(-0.2, 0.2),
    vx: 0,
    vy: 0,
    repelRadius: rand(120, 260)
}));

// --- Insects (e.g., bees/butterflies) ---
const insectColors = ['#ffd600', '#ffb347', '#ffecb3', '#b3e6ff'];
const insects = Array.from({length: 7}, (_, i) => ({
    x: rand(0, W),
    y: rand(0, H),
    dx: rand(-0.7, 0.7),
    dy: rand(-0.7, 0.7),
    size: rand(7, 13),
    color: insectColors[Math.floor(rand(0, insectColors.length))],
    t: rand(0, 1000),
    vx: 0,
    vy: 0,
    repelRadius: rand(160, 320),
    followsCursor: i === 0 // First insect follows cursor
}));

// --- Rodents (e.g., mice) ---
const rodents = Array.from({length: 3}, (_, i) => ({
    x: rand(0, W),
    y: rand(H * 0.7, H * 0.95),
    dx: rand(-0.5, 0.5),
    dy: rand(-0.2, 0.2),
    size: rand(18, 28),
    color: '#bca37f',
    t: rand(0, 1000),
    vx: 0,
    vy: 0,
    repelRadius: rand(200, 400),
    followsCursor: i === 0 // First rodent follows cursor
}));

function rippleEffect(x, y, radius, color = '#b3e6ff', vivid = false) {
    ctx.save();
    ctx.globalAlpha = vivid ? 0.45 : 0.25;
    ctx.beginPath();
    ctx.arc(x, y, radius * (vivid ? 1.25 : 1), 0, Math.PI * 2);
    ctx.fillStyle = vivid ? '#fffbe6' : color;
    ctx.shadowColor = vivid ? '#ffd600' : color;
    ctx.shadowBlur = vivid ? 32 : 16;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}

function repel(obj, strength = 7.5, radius = 70) {
    // Use object's own random radius
    radius = obj.repelRadius || radius;
    const dx = obj.x - mouse.x;
    const dy = obj.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < radius) {
        // Ripple/glow effect (more vivid if very close)
        rippleEffect(obj.x, obj.y, radius * 0.8, undefined, dist < radius * 0.5);
        // Repel with a force inversely proportional to distance
        const force = (radius - dist) / radius * strength * (dist < radius * 0.5 ? 2.2 : 1);
        const angle = Math.atan2(dy, dx);
        obj.vx += Math.cos(angle) * force;
        obj.vy += Math.sin(angle) * force;
        // Add shake/wiggle if very close
        if (dist < radius * 0.35) {
            obj.vx += rand(-2, 2);
            obj.vy += rand(-2, 2);
        }
    }
    // Apply velocity with friction
    obj.x += obj.vx;
    obj.y += obj.vy;
    obj.vx *= 0.82;
    obj.vy *= 0.82;
}

function followCursor(obj, strength = 3.5, maxSpeed = 5.5) {
    const dx = mouse.x - obj.x;
    const dy = mouse.y - obj.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 500 && mouse.x > 0 && mouse.y > 0) {
        // Ripple/glow effect (more vivid if very close)
        rippleEffect(obj.x, obj.y, obj.repelRadius * 0.8, '#ffd600', dist < 120);
        // Move toward cursor
        const angle = Math.atan2(dy, dx);
        obj.vx += Math.cos(angle) * strength * (1 - dist / 500) * (dist < 120 ? 2.2 : 1);
        obj.vy += Math.sin(angle) * strength * (1 - dist / 500) * (dist < 120 ? 2.2 : 1);
        // Clamp speed
        obj.vx = Math.max(-maxSpeed, Math.min(maxSpeed, obj.vx));
        obj.vy = Math.max(-maxSpeed, Math.min(maxSpeed, obj.vy));
        // Add shake/wiggle if very close
        if (dist < 80) {
            obj.vx += rand(-2.5, 2.5);
            obj.vy += rand(-2.5, 2.5);
        }
    }
    obj.x += obj.vx;
    obj.y += obj.vy;
    obj.vx *= 0.82;
    obj.vy *= 0.82;
}

function drawLeaf(l) {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.angle + Math.sin(l.y / 40 + l.swayPhase) * 0.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, l.r * 0.6, l.r, 0, 0, Math.PI * 2);
    ctx.fillStyle = l.color;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}

function drawInsect(i) {
    ctx.save();
    ctx.translate(i.x, i.y);
    ctx.beginPath();
    ctx.arc(0, 0, i.size, 0, Math.PI * 2);
    ctx.fillStyle = i.color;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    // Wings (simple ellipses)
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#fff';
    ctx.ellipse(-i.size * 0.7, -i.size * 0.3, i.size * 0.7, i.size * 0.3, Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(i.size * 0.7, -i.size * 0.3, i.size * 0.7, i.size * 0.3, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}

function drawRodent(r) {
    ctx.save();
    ctx.translate(r.x, r.y);
    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, r.size * 0.7, r.size * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = r.color;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.arc(r.size * 0.5, -r.size * 0.1, r.size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    // Ear
    ctx.beginPath();
    ctx.arc(r.size * 0.65, -r.size * 0.22, r.size * 0.11, 0, Math.PI * 2);
    ctx.globalAlpha = 0.6;
    ctx.fill();
    // Tail
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(-r.size * 0.7, r.size * 0.1);
    ctx.quadraticCurveTo(-r.size, r.size * 0.5, -r.size * 1.2, r.size * 0.2);
    ctx.strokeStyle = '#d8b48a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
}

function updateLeaves() {
    for (const l of leaves) {
        l.y += l.speed;
        l.x += Math.sin(l.y / 30 + l.swayPhase) * l.sway;
        repel(l, 8.2); // Much stronger repelling
        if (l.y > H + 30) {
            l.y = rand(-40, -10);
            l.x = rand(0, W);
        }
    }
}

function updateInsects() {
    for (const i of insects) {
        // Brownian motion
        i.dx += rand(-0.08, 0.08);
        i.dy += rand(-0.08, 0.08);
        i.dx = Math.max(-1.2, Math.min(1.2, i.dx));
        i.dy = Math.max(-1.2, Math.min(1.2, i.dy));
        if (i.followsCursor) {
            followCursor(i, 5.2, 7.5);
        } else {
            i.x += i.dx;
            i.y += i.dy;
            repel(i, 10.5);
        }
        // Bounce off edges
        if (i.x < 0 || i.x > W) i.dx *= -1;
        if (i.y < 0 || i.y > H) i.dy *= -1;
    }
}

function updateRodents() {
    for (const r of rodents) {
        // Brownian motion, but mostly horizontal
        r.dx += rand(-0.03, 0.03);
        r.dy += rand(-0.01, 0.01);
        r.dx = Math.max(-0.7, Math.min(0.7, r.dx));
        r.dy = Math.max(-0.2, Math.min(0.2, r.dy));
        if (r.followsCursor) {
            followCursor(r, 3.5, 5.2);
        } else {
            r.x += r.dx;
            r.y += r.dy;
            repel(r, 12.5);
        }
        // Stay near the bottom
        if (r.x < 0) r.x = W;
        if (r.x > W) r.x = 0;
        if (r.y < H * 0.7) r.y = H * 0.7;
        if (r.y > H * 0.97) r.y = H * 0.97;
    }
}

function animatePark() {
    ctx.clearRect(0, 0, W, H);
    // Draw leaves
    for (const l of leaves) drawLeaf(l);
    // Draw insects
    for (const i of insects) drawInsect(i);
    // Draw rodents
    for (const r of rodents) drawRodent(r);
    updateLeaves();
    updateInsects();
    updateRodents();
    requestAnimationFrame(animatePark);
}
animatePark();

const CACHE_NAME = 'solarpunk-timer-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
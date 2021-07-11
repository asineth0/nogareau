const gameEl = document.querySelector(".game");
const canvasEl = gameEl.querySelector("canvas");
const splashEl = document.querySelector("#splash");
const statsEl = document.querySelector("#stats");
const inputEl = document.querySelector("#input");
const ctx = canvasEl.getContext("2d");

let enemies;
let projectiles;
let debris;
let intervals;
let running;
let colors;
let score;

const palettes = [
  //
  ["#f55", "#f5f", "#ff5", "#55f", "#5f5", "#5ff"],
];

const start = () => {
  enemies = [];
  projectiles = [];
  debris = [];
  intervals = [];
  events = [];
  running = true;
  colors = palettes[Math.floor(Math.random() * palettes.length)];
  score = 0;

  intervals.push(
    setInterval(() => {
      const radius = Math.random() * 24 + 12;

      let x, y;

      if (Math.random() < 0.5) {
        x = Math.random() > 0.5 ? 0 : innerWidth;
        y = Math.random() * innerHeight;
      } else {
        x = Math.random() * innerWidth;
        y = Math.random() > 0.5 ? 0 : innerHeight;
      }

      const angle = Math.atan2(innerHeight / 2 - y, innerWidth / 2 - x);

      enemies.push({
        x,
        y,
        xv: Math.cos(angle),
        yv: Math.sin(angle),
        radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() < 0.9 ? "circle" : "square",
      });
    }, 1000)
  );

  ctx.fillStyle = "#121212";
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  render();

  statsEl.className = "hidden";
  splashEl.className = "hidden";
  gameEl.className = "game";
  inputEl.className = "input";
};

const end = () => {
  running = false;

  for (const interval of intervals) {
    clearInterval(interval);
  }

  gameEl.className = "hidden";
  inputEl.className = "hidden";
  statsEl.className = "splash";
  statsEl.querySelector("h2").innerHTML = `Score: ${score}`;
};

const shrinkEnemy = (e, i) => {
  e.radius -= 1;

  if (i > 1) {
    setTimeout(() => {
      shrinkEnemy(e, i - 1);
    }, 10);
  }
};

const render = () => {
  if (canvasEl.width !== innerWidth) canvasEl.width = innerWidth;
  if (canvasEl.height !== innerHeight) canvasEl.height = innerHeight;
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  ctx.restore();

  // player
  ctx.beginPath();
  ctx.arc(innerWidth / 2, innerHeight / 2, 16, Math.PI * 2, 0);
  ctx.fillStyle = "#fff";
  ctx.fill();

  // enemies
  for (const e of enemies) {
    ctx.fillStyle = e.color;

    if (e.shape === "circle") {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, Math.PI * 2, 0);
      ctx.fill();
    }

    if (e.shape === "square") {
      ctx.fillRect(e.x - e.radius / 2, e.y - e.radius / 2, e.radius, e.radius);
    }

    e.x += e.xv * 2;
    e.y += e.yv * 2;

    const dist = Math.hypot(e.x - innerWidth / 2, e.y - innerHeight / 2);

    if (dist - 16 - e.radius < 0) {
      end();
    }

    if (e.x < 0 || e.x > innerWidth || e.y < 0 || e.y > innerHeight) {
      enemies = enemies.filter((i) => i !== e);
    }
  }

  // projectiles
  for (const p of projectiles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, Math.PI * 2, 0);
    ctx.fillStyle = "#fff";
    ctx.fill();

    p.x += p.xv * 2;
    p.y += p.yv * 2;

    for (const e of enemies) {
      const dist = Math.hypot(p.x - e.x, p.y - e.y);

      if (dist - 8 - e.radius < 0) {
        for (let i = 0; i < 8; i++) {
          debris.push({
            x: e.x,
            y: e.y,
            xv: (Math.random() - 0.5) * 4,
            yv: (Math.random() - 0.5) * 4,
            color: e.color,
            alpha: 0.8,
          });
        }

        if (e.radius - 10 > 8) {
          shrinkEnemy(e, 8);
        } else {
          enemies = enemies.filter((i) => i !== e);
        }

        projectiles = projectiles.filter((i) => i !== p);
        score++;
      }
    }
  }

  // debris
  for (const d of debris) {
    ctx.save();
    ctx.globalAlpha = d.alpha;
    ctx.beginPath();
    ctx.arc(d.x, d.y, 2, Math.PI * 2, 0);
    ctx.fillStyle = d.color;
    ctx.fill();
    ctx.restore();

    d.x += d.xv;
    d.y += d.yv;
    d.alpha -= 0.01;

    if (d.alpha < 0) {
      debris = debris.filter((i) => i !== d);
    }
  }

  if (running) {
    requestAnimationFrame(render);
  }
};

inputEl.addEventListener("click", (e) => {
  const angle = Math.atan2(e.y - innerHeight / 2, e.x - innerWidth / 2);

  projectiles.push({
    x: innerWidth / 2,
    y: innerHeight / 2,
    xv: Math.cos(angle) * 4,
    yv: Math.sin(angle) * 4,
  });
});

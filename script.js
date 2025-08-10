const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreLeftEl = document.getElementById('scoreLeft');
const scoreRightEl = document.getElementById('scoreRight');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const modeSelect = document.getElementById('modeSelect');
const aiRange = document.getElementById('aiRange');

let DPR = Math.max(1, window.devicePixelRatio || 1);
function resize(){
  DPR = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(Math.min(window.innerWidth, 1200) * DPR);
  canvas.height = Math.floor((window.innerHeight - 160) * DPR);
  canvas.style.width = `${Math.min(window.innerWidth,1200)}px`;
  canvas.style.height = `${Math.max(200, window.innerHeight - 160)}px`;
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener('resize', resize);
resize();

const paddleWidth = 12;
const paddleHeight = 90;
const paddleSpeed = 8;
const ballRadius = 8;
const winScore = 11;

let mode = modeSelect.value; // 'ai' or 'local'
let aiDifficulty = parseFloat(aiRange.value); // 0..1
let running = false;
let paused = false;

const leftPaddle = { x: 20, y: 200, w: paddleWidth, h: paddleHeight, vy: 0 };
const rightPaddle = { x: 0, y: 200, w: paddleWidth, h: paddleHeight, vy: 0 }; // x set in reset
let ball = { x: 0, y:0, vx:0, vy:0, r: ballRadius };

let keys = { w:false, s:false, up:false, down:false };
let score = { left:0, right:0 };
let lastTimestamp = 0;

window.addEventListener('keydown', (e)=>{
  if (e.key === 'w') keys.w = true;
  if (e.key === 's') keys.s = true;
  if (e.key === 'ArrowUp') keys.up = true;
  if (e.key === 'ArrowDown') keys.down = true;
  if (e.key === ' '){ // space toggle pause
    e.preventDefault();
    togglePause();
  }
});
window.addEventListener('keyup', (e)=>{
  if (e.key === 'w') keys.w = false;
  if (e.key === 's') keys.s = false;
  if (e.key === 'ArrowUp') keys.up = false;
  if (e.key === 'ArrowDown') keys.down = false;
});
modeSelect.addEventListener('change', ()=> {
  mode = modeSelect.value;
  reset();
});
aiRange.addEventListener('input', ()=> aiDifficulty = parseFloat(aiRange.value));

startBtn.addEventListener('click', ()=> {
  if (!running) start();
});
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', ()=> { reset(); draw(); });

function start(){
  running = true;
  paused = false;
  lastTimestamp = performance.now();
  requestAnimationFrame(loop);
}
function togglePause(){
  if (!running) return;
  paused = !paused;
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  if (!paused) {
    lastTimestamp = performance.now();
    requestAnimationFrame(loop);
  }
}
function reset(){
  score.left = 0; score.right = 0;
  scoreLeftEl.textContent = score.left;
  scoreRightEl.textContent = score.right;
  const cw = canvas.clientWidth;
  leftPaddle.x = 20;
  leftPaddle.y = (canvas.clientHeight/2) - paddleHeight/2;
  rightPaddle.x = cw - 20 - paddleWidth;
  rightPaddle.y = leftPaddle.y;
  ballReset(Math.random() < 0.5 ? 1 : -1);
  draw();
}
function ballReset(dir=1){
  ball.x = canvas.clientWidth/2;
  ball.y = canvas.clientHeight/2;
  const speed = 6; // base
  const angle = (Math.random() * 0.6 - 0.3); // slight angle
  ball.vx = speed * dir * Math.cos(angle);
  ball.vy = speed * Math.sin(angle);
}
function update(dt){
  // paddles: left controlled by W/S
  if (keys.w) leftPaddle.y -= paddleSpeed;
  if (keys.s) leftPaddle.y += paddleSpeed;
  // right paddle: either AI or player
  if (mode === 'local'){
    if (keys.up) rightPaddle.y -= paddleSpeed;
    if (keys.down) rightPaddle.y += paddleSpeed;
  } else { // AI
    // simple predictive AI factor by difficulty
    const targetY = ball.y - rightPaddle.h/2 + (ball.vy * (aiDifficulty*12));
    const diff = targetY - rightPaddle.y;
    rightPaddle.y += Math.sign(diff) * Math.min(Math.abs(diff), paddleSpeed * (0.6 + aiDifficulty));
  }

 leftPaddle.y = Math.max(0, Math.min(canvas.clientHeight - leftPaddle.h, leftPaddle.y));
  rightPaddle.y = Math.max(0, Math.min(canvas.clientHeight - rightPaddle.h, rightPaddle.y));

  // update ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // top/bottom wall bounce
  if (ball.y - ball.r < 0){
    ball.y = ball.r;
    ball.vy = -ball.vy;
  } else if (ball.y + ball.r > canvas.clientHeight){
    ball.y = canvas.clientHeight - ball.r;
    ball.vy = -ball.vy;
  }
  if (ball.x - ball.r < leftPaddle.x + leftPaddle.w &&
      ball.x - ball.r > leftPaddle.x &&
      ball.y > leftPaddle.y && ball.y < leftPaddle.y + leftPaddle.h){
    ball.x = leftPaddle.x + leftPaddle.w + ball.r;
    // reflect and add 'spin' depending on hit position
    const rel = (ball.y - (leftPaddle.y + leftPaddle.h/2)) / (leftPaddle.h/2);
    const bounceAngle = rel * 0.6; // max angle
    const speed = Math.hypot(ball.vx, ball.vy) * 1.03; // slight speed up
    ball.vx = Math.abs(Math.cos(bounceAngle) * speed);
    ball.vy = Math.sin(bounceAngle) * speed;
  }
  if (ball.x < -50){ // right scores
    score.right += 1;
    scoreRightEl.textContent = score.right;
    if (score.right >= winScore){ running = false; alert('Right player wins!'); }
    ballReset(1);
  } else if (ball.x > canvas.clientWidth + 50){
    score.left += 1;
    scoreLeftEl.textContent = score.left;
    if (score.left >= winScore){ running = false; alert('Left player wins!'); }
    ballReset(-1);
  }
}

// draw
function draw(){
  // background
  ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);
  // court center line
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  const w = canvas.clientWidth, h = canvas.clientHeight;
  for (let y = 0; y < h; y += 24){
    ctx.fillRect(w/2 - 2, y + 8, 4, 12);
  }

  // paddles
  ctx.fillStyle = '#e6eef8';
  roundRect(ctx, leftPaddle.x, leftPaddle.y, leftPaddle.w, leftPaddle.h, 6, true, false);
  roundRect(ctx, rightPaddle.x, rightPaddle.y, rightPaddle.w, rightPaddle.h, 6, true, false);

  // ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.closePath();

  // small scoreboard text displayed on canvas (optional)
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.font = '12px system-ui';
  ctx.fillText('Ping Pong — JS Canvas', 12, 18);
}

// small round rect util
function roundRect(ctx, x, y, w, h, r=6, fill=true, stroke=false){
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// main loop
function loop(ts){
  if (!running || paused) return;
  const dt = Math.min(1/30, (ts - lastTimestamp) / 1000);
  lastTimestamp = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// init
reset();

// expose simple keyboard start
window.addEventListener('keydown', (e)=> {
  if ((e.key === 'Enter' || e.key === ' ') && !running) { start(); }
});
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



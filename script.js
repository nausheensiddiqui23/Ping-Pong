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

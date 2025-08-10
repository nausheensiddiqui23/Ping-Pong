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
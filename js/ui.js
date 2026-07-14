// ============================================================
// ui.js — mBlock3
// ============================================================

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function injectBlockCounter(maxBlocks) {
  let el = document.getElementById('block-counter');
  if (!el) {
    el = document.createElement('div');
    el.id = 'block-counter';
    document.getElementById('blockly-panel').appendChild(el);
  }
  el.textContent = '0 / ' + maxBlocks;
}

function resizeBlockly() {
  if (window.workspace) Blockly.svgResize(window.workspace);
}

function animateLogoRobot() {
  const robot = document.querySelector('.logo-robot');
  if (!robot) return;
  let up = true;
  setInterval(() => {
    robot.style.transform = up
      ? 'translateY(-10px) rotate(-3deg)'
      : 'translateY(0px) rotate(3deg)';
    up = !up;
  }, 700);
}

function animatePaintbrush() {
  const pb = document.querySelector('.paintbrush-icon');
  if (!pb) return;
  let angle = -15;
  setInterval(() => {
    pb.style.transform = `rotate(${angle}deg) scale(1.1)`;
    angle = angle === -15 ? 15 : -15;
  }, 600);
}

function createStartParticles() {
  const bg = document.querySelector('.start-bg');
  if (!bg) return;
  for (let i = 0; i < 12; i++) {
    const star = document.createElement('div');
    star.className = 'bg-star';
    star.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*60}%;
      animation-delay:${Math.random()*3}s;
      width:${Math.random()*6+3}px;height:${Math.random()*6+3}px;`;
    bg.appendChild(star);
  }
}

// Cargar nivel guardado y jugarlo directamente
function loadSavedLevel() {
  const saved = loadCustomLevel();
  if (!saved) return;
  window.customLevel = saved;
  // Restaurar estado del editor también
  editorState.cols  = saved.cols;
  editorState.rows  = saved.rows;
  editorState.grid  = saved.grid.map(r => [...r]);
  editorState.theme = saved.theme || 'sky';
  startCustomLevel();
}

window.addEventListener('DOMContentLoaded', () => {
  animateLogoRobot();
  animatePaintbrush();
  createStartParticles();

  // Mostrar botón de cargar si hay nivel guardado
  const saved = loadCustomLevel();
  const loadBtn = document.getElementById('load-btn');
  if (saved && loadBtn) loadBtn.style.display = 'flex';

  window.addEventListener('resize', resizeBlockly);
});

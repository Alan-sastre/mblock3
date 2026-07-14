// ============================================================
// game.js — mBlock3
// Ejecuta el nivel que el niño diseñó en el editor.
// Lee window.customLevel en lugar de un array LEVELS fijo.
// ============================================================

let phaserGame = null;
let gameScene  = null;

const robotState = {
  col: 0, row: 0,
  container: null,
  moving: false,
};

const ABS_DELTA = {
  up:    { dc:  0, dr: -1 },
  down:  { dc:  0, dr:  1 },
  left:  { dc: -1, dr:  0 },
  right: { dc:  1, dr:  0 },
};

// ── Crear juego Phaser ────────────────────────────────────
function createPhaserGame() {
  if (phaserGame) { phaserGame.destroy(true); phaserGame = null; }

  const panel = document.getElementById('phaser-panel');
  const W = panel.clientWidth  || window.innerWidth * 0.6;
  const H = panel.clientHeight || window.innerHeight;

  phaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    width: W, height: H,
    backgroundColor: '#1a1a2e',
    parent: 'game-container',
    scene: { create: sceneCreate, update: () => {} },
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  });
}

// ── Crear escena ──────────────────────────────────────────
function sceneCreate() {
  gameScene = this;
  const level = window.customLevel;
  if (!level) return;

  const W = this.scale.width;
  const H = this.scale.height;

  const maxCellW = Math.floor((W * 0.92) / level.cols);
  const maxCellH = Math.floor((H * 0.92) / level.rows);
  CELL_SIZE = Math.min(maxCellW, maxCellH, 90);

  const mapW = level.cols * CELL_SIZE;
  const mapH = level.rows * CELL_SIZE;
  this.mapOffsetX = Math.floor((W - mapW) / 2);
  this.mapOffsetY = Math.floor((H - mapH) / 2);

  drawBackground(this, level);
  drawDecorations(this, level, mapW, mapH, this.mapOffsetX, this.mapOffsetY);
  drawGrid(this, level, this.mapOffsetX, this.mapOffsetY);

  // Meta
  const goalPos = findTileInGrid(level.grid, TILE.GOAL);
  if (goalPos) {
    drawGoal(this,
      this.mapOffsetX + goalPos.col * CELL_SIZE,
      this.mapOffsetY + goalPos.row * CELL_SIZE
    );
  }

  // Robot
  const startPos = findTileInGrid(level.grid, TILE.START);
  if (startPos) {
    robotState.col = startPos.col;
    robotState.row = startPos.row;
    robotState.moving = false;
    robotState.container = drawRobot(this,
      this.mapOffsetX + startPos.col * CELL_SIZE,
      this.mapOffsetY + startPos.row * CELL_SIZE
    );
    robotState.container.setAngle(0);
  }

  window.sceneReady = true;
}

// ── Iniciar el nivel personalizado ───────────────────────
function startCustomLevel() {
  window.sceneReady   = false;
  window.stepCount    = 0;

  showScreen('game-screen');
  initBlockly(window.customLevel.allowedBlocks);
  injectBlockCounter(window.customLevel.maxBlocks);
  createPhaserGame();
}

// ── Ejecutar código Blockly ───────────────────────────────
async function runCode() {
  if (robotState.moving) return;
  if (!window.customLevel) return;

  let tries = 0;
  while (!window.sceneReady && tries < 50) { await delay(100); tries++; }

  const code = generateCode();
  if (!code.trim()) return;

  await resetRobotPosition();
  window.stepCount  = 0;
  robotState.moving = true;

  const asyncFn = new Function(
    'moveUp','moveDown','moveLeft','moveRight','delay',
    `return (async()=>{ ${code} })()`
  );

  try {
    await asyncFn(moveUp, moveDown, moveLeft, moveRight, delay);
  } catch(e) {
    console.warn('Error al ejecutar:', e.message);
  }

  robotState.moving = false;
}

// ── Resetear robot ────────────────────────────────────────
async function resetRobotPosition() {
  const level    = window.customLevel;
  const startPos = findTileInGrid(level.grid, TILE.START);
  if (!startPos || !robotState.container || !gameScene) return;

  robotState.col = startPos.col;
  robotState.row = startPos.row;

  robotState.container.setPosition(
    gameScene.mapOffsetX + startPos.col * CELL_SIZE + CELL_SIZE / 2,
    gameScene.mapOffsetY + startPos.row * CELL_SIZE + CELL_SIZE / 2
  );
  robotState.container.setAngle(0);
  await delay(50);
}

// ── Movimientos absolutos ─────────────────────────────────
function makeMover(dir) {
  return function() {
    return new Promise(resolve => {
      if (!gameScene || !robotState.container) { resolve(); return; }

      const { dc, dr } = ABS_DELTA[dir];
      const newCol = robotState.col + dc;
      const newRow = robotState.row + dr;
      const level  = window.customLevel;
      window.stepCount++;

      if (isWall(level.grid, newRow, newCol)) {
        shakeRobot(gameScene, robotState.container, resolve);
        return;
      }

      robotState.col = newCol;
      robotState.row = newRow;

      const tx = gameScene.mapOffsetX + newCol * CELL_SIZE;
      const ty = gameScene.mapOffsetY + newRow * CELL_SIZE;

      animateRobotMove(gameScene, robotState.container, tx, ty, () => {
        checkGoal(newRow, newCol);
        resolve();
      });
    });
  };
}

const moveUp    = makeMover('up');
const moveDown  = makeMover('down');
const moveLeft  = makeMover('left');
const moveRight = makeMover('right');

function checkGoal(row, col) {
  const level = window.customLevel;
  if (!level) return;
  if (level.grid[row] && level.grid[row][col] === TILE.GOAL) {
    setTimeout(onLevelComplete, 300);
  }
}

function onLevelComplete() {
  if (!gameScene) return;
  playWinAnimation(gameScene, robotState.container);

  const stars = calcStars(window.stepCount, window.customLevel.optimalSteps);
  ['ws1','ws2','ws3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = i < stars ? '1' : '0.2';
  });

  setTimeout(() => {
    document.getElementById('success-overlay').classList.remove('hidden');
  }, 800);
}

// ── Navegación ────────────────────────────────────────────
function replayLevel() {
  document.getElementById('success-overlay').classList.add('hidden');
  document.getElementById('fail-overlay').classList.add('hidden');
  startCustomLevel();
}

function backToEditor() {
  document.getElementById('success-overlay').classList.add('hidden');
  document.getElementById('fail-overlay').classList.add('hidden');
  showScreen('editor-screen');
  if (phaserGame) { phaserGame.destroy(true); phaserGame = null; }
  // Re-renderizar el editor
  resizeEditorCanvas();
  renderEditor();
}

function goHome() {
  showScreen('start-screen');
  if (phaserGame) { phaserGame.destroy(true); phaserGame = null; }
}

function goToEditor() {
  showScreen('editor-screen');
  // Inicializar el editor la primera vez
  setTimeout(() => {
    initEditor();
    showValidationMsg();
  }, 50);
}

// ── Helpers ───────────────────────────────────────────────
function isWall(grid, row, col) {
  if (row < 0 || col < 0 || row >= grid.length || col >= grid[0].length) return true;
  return grid[row][col] === TILE.WALL;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function shakeRobot(scene, container, onDone) {
  const origX = container.x;
  scene.tweens.add({
    targets: container, x: origX + 8,
    duration: 55, yoyo: true, repeat: 3,
    ease: 'Sine.easeInOut',
    onComplete: () => { container.x = origX; onDone(); },
  });
}

window.addEventListener('resize', () => {
  if (phaserGame) {
    const panel = document.getElementById('phaser-panel');
    phaserGame.scale.resize(panel.clientWidth, panel.clientHeight);
  }
});

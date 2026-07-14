// ============================================================
// editor.js — Editor de niveles de mBlock3
// El niño pinta tiles con clic/drag en un <canvas> 2D.
// Tiles: suelo (0), pared (1), inicio robot (4), meta (3)
// ============================================================

// ── Estado del editor ─────────────────────────────────────
const editorState = {
  cols:         9,    // grilla fija grande
  rows:         9,
  grid:         null,
  selectedTile: TILE.EMPTY,
  painting:     false,
  theme:        'sky',
};

// Colores del canvas 2D del editor (más vivos que Phaser)
const ED_COLORS = {
  wall:    '#5D4037',
  floor:   '#81C784',
  start:   '#1565C0',
  goal:    '#FFD600',
  empty:   '#2a2a4a',
  grid:    'rgba(255,255,255,0.1)',
};

const THEME_FLOOR = {
  sky:    '#81C784',
  sunset: '#FFCC80',
  night:  '#9575CD',
  candy:  '#CE93D8',
};
const THEME_WALL = {
  sky:    '#5D4037',
  sunset: '#BF360C',
  night:  '#1A237E',
  candy:  '#880E4F',
};

let edCanvas = null;
let edCtx    = null;

// ── Inicializar el editor ─────────────────────────────────
function initEditor() {
  edCanvas = document.getElementById('editor-canvas');
  edCtx    = edCanvas.getContext('2d');

  if (!editorState.grid) {
    editorState.grid = createEmptyGrid(editorState.cols, editorState.rows);
  }

  resizeEditorCanvas();
  renderEditor();
  bindEditorEvents();
}

// ── Redimensionar canvas al tamaño del contenedor ─────────
function resizeEditorCanvas() {
  const wrap = document.getElementById('editor-canvas-wrap');
  if (!wrap || !edCanvas) return;
  // El canvas ocupa el espacio disponible del wrap menos la barra inferior
  const W = wrap.clientWidth;
  const H = wrap.clientHeight;

  // Calcular CELL_SIZE para que la grilla quepa
  const maxCW = Math.floor((W * 0.96) / editorState.cols);
  const maxCH = Math.floor((H * 0.96) / editorState.rows);
  CELL_SIZE = Math.min(maxCW, maxCH, 80);

  const mapW = editorState.cols * CELL_SIZE;
  const mapH = editorState.rows * CELL_SIZE;
  edCanvas.width  = W;
  edCanvas.height = H;

  // Guardar offsets centrados
  edCanvas._ox = Math.floor((W - mapW) / 2);
  edCanvas._oy = Math.floor((H - mapH) / 2);
}

// ── Dibujar la grilla en el canvas 2D ────────────────────
function renderEditor() {
  if (!edCtx || !editorState.grid) return;
  const { cols, rows, grid, theme } = editorState;
  const W = edCanvas.width, H = edCanvas.height;
  const ox = edCanvas._ox, oy = edCanvas._oy;
  const cs = CELL_SIZE;

  // Fondo
  edCtx.fillStyle = '#1a1a2e';
  edCtx.fillRect(0, 0, W, H);

  // Tiles
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ox + c * cs;
      const y = oy + r * cs;
      const tile = grid[r][c];
      drawEditorTile(x, y, cs, tile, theme);
    }
  }

  // Líneas de grilla
  edCtx.strokeStyle = ED_COLORS.grid;
  edCtx.lineWidth   = 1;
  for (let r = 0; r <= rows; r++) {
    edCtx.beginPath();
    edCtx.moveTo(ox, oy + r * cs);
    edCtx.lineTo(ox + cols * cs, oy + r * cs);
    edCtx.stroke();
  }
  for (let c = 0; c <= cols; c++) {
    edCtx.beginPath();
    edCtx.moveTo(ox + c * cs, oy);
    edCtx.lineTo(ox + c * cs, oy + rows * cs);
    edCtx.stroke();
  }

  // Borde exterior
  edCtx.strokeStyle = 'rgba(255,255,255,0.3)';
  edCtx.lineWidth   = 2;
  edCtx.strokeRect(ox, oy, cols * cs, rows * cs);
}

function drawEditorTile(x, y, cs, tile, theme) {
  const ctx = edCtx;

  if (tile === TILE.WALL) {
    // Pared con efecto 3D simple
    ctx.fillStyle = THEME_WALL[theme] || '#5D4037';
    ctx.fillRect(x, y, cs, cs);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x, y, cs, 4);
    ctx.fillRect(x, y, 4, cs);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + cs - 4, y + 4, 4, cs - 4);
    ctx.fillRect(x + 4, y + cs - 4, cs - 4, 4);
    // Patrón ladrillo
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y + (cs/4)*i);
      ctx.lineTo(x + cs, y + (cs/4)*i);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(x+cs/2, y);       ctx.lineTo(x+cs/2, y+cs/4);   ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+cs/4, y+cs/4);  ctx.lineTo(x+cs/4, y+cs/2);   ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+cs*3/4,y+cs/4); ctx.lineTo(x+cs*3/4,y+cs/2);  ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+cs/2, y+cs/2);  ctx.lineTo(x+cs/2, y+cs*3/4); ctx.stroke();

  } else if (tile === TILE.EMPTY) {
    ctx.fillStyle = THEME_FLOOR[theme] || '#81C784';
    ctx.fillRect(x, y, cs, cs);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x+2, y+2, cs-4, 4);

  } else if (tile === TILE.START) {
    // Suelo + ícono de robot
    ctx.fillStyle = THEME_FLOOR[theme] || '#81C784';
    ctx.fillRect(x, y, cs, cs);
    ctx.fillStyle = 'rgba(21,101,192,0.35)';
    ctx.fillRect(x, y, cs, cs);
    // Borde azul
    ctx.strokeStyle = '#42A5F5';
    ctx.lineWidth   = 3;
    ctx.strokeRect(x+2, y+2, cs-4, cs-4);
    // Emoji robot centrado
    ctx.font         = `${Math.floor(cs*0.52)}px Apple Color Emoji, Segoe UI Emoji, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = 'white';
    ctx.fillText('🤖', x + cs/2, y + cs/2);

  } else if (tile === TILE.GOAL) {
    // Suelo + estrella
    ctx.fillStyle = THEME_FLOOR[theme] || '#81C784';
    ctx.fillRect(x, y, cs, cs);
    ctx.fillStyle = 'rgba(255,214,0,0.3)';
    ctx.fillRect(x, y, cs, cs);
    ctx.strokeStyle = '#FFD600';
    ctx.lineWidth   = 3;
    ctx.strokeRect(x+2, y+2, cs-4, cs-4);
    ctx.font         = `${Math.floor(cs*0.52)}px Apple Color Emoji, Segoe UI Emoji, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', x + cs/2, y + cs/2);
  }
}

// ── Eventos de pintar con clic y drag ─────────────────────
function bindEditorEvents() {
  if (!edCanvas) return;

  // Mouse
  edCanvas.addEventListener('mousedown', e => {
    editorState.painting = true;
    paintAt(e.clientX, e.clientY);
  });
  edCanvas.addEventListener('mousemove', e => {
    if (editorState.painting) paintAt(e.clientX, e.clientY);
  });
  window.addEventListener('mouseup', () => { editorState.painting = false; });

  // Touch (móvil)
  edCanvas.addEventListener('touchstart', e => {
    e.preventDefault();
    editorState.painting = true;
    const t = e.touches[0];
    paintAt(t.clientX, t.clientY);
  }, { passive: false });

  edCanvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!editorState.painting) return;
    const t = e.touches[0];
    paintAt(t.clientX, t.clientY);
  }, { passive: false });

  window.addEventListener('touchend', () => { editorState.painting = false; });

  // Resize
  window.addEventListener('resize', () => {
    resizeEditorCanvas();
    renderEditor();
  });
}

// Convertir coordenadas de pantalla a (row, col) de la grilla
function screenToCell(px, py) {
  const rect = edCanvas.getBoundingClientRect();
  const x    = px - rect.left;
  const y    = py - rect.top;
  const ox   = edCanvas._ox, oy = edCanvas._oy;
  const col  = Math.floor((x - ox) / CELL_SIZE);
  const row  = Math.floor((y - oy) / CELL_SIZE);
  const { cols, rows } = editorState;
  if (col < 0 || row < 0 || col >= cols || row >= rows) return null;
  return { row, col };
}

function paintAt(px, py) {
  const cell = screenToCell(px, py);
  if (!cell) return;
  const { row, col } = cell;
  const tile = editorState.selectedTile;

  // Solo puede haber UN inicio y UNA meta
  if (tile === TILE.START) {
    clearTileType(TILE.START);
  }
  if (tile === TILE.GOAL) {
    clearTileType(TILE.GOAL);
  }

  editorState.grid[row][col] = tile;
  renderEditor();
  showValidationMsg();
}

function clearTileType(type) {
  const { grid, rows, cols } = editorState;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] === type) grid[r][c] = TILE.EMPTY;
}

// ── Controles de paleta ───────────────────────────────────
function selectTile(tile) {
  editorState.selectedTile = tile;
  document.querySelectorAll('.tile-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.tile) === tile);
  });
}

function setBgTheme(theme) {
  editorState.theme = theme;
  document.querySelectorAll('.bg-color-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === theme);
  });
  renderEditor();
}

function clearGrid() {
  editorState.grid = createEmptyGrid(editorState.cols, editorState.rows);
  renderEditor();
  showValidationMsg();
}

function fillBorder() {
  const { grid, rows, cols } = editorState;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (r === 0 || r === rows-1 || c === 0 || c === cols-1)
        grid[r][c] = TILE.WALL;
  renderEditor();
}

// ── Validación del nivel ──────────────────────────────────
function validateLevel() {
  const { grid } = editorState;
  const hasStart = countTile(grid, TILE.START) === 1;
  const hasGoal  = countTile(grid, TILE.GOAL)  === 1;
  return { valid: hasStart && hasGoal, hasStart, hasGoal };
}

function showValidationMsg() {
  const msg = document.getElementById('editor-msg');
  const btn = document.getElementById('play-btn');
  if (!msg) return;

  const { valid, hasStart, hasGoal } = validateLevel();

  if (valid) {
    msg.textContent = '';
    msg.className   = '';
    if (btn) btn.classList.add('ready');
  } else {
    const parts = [];
    if (!hasStart) parts.push('🤖');
    if (!hasGoal)  parts.push('⭐');
    msg.textContent = parts.join(' ') + ' ← ¡Coloca esto!';
    msg.className   = 'msg-warn';
    if (btn) btn.classList.remove('ready');
  }
}

// ── Jugar el nivel diseñado ───────────────────────────────
function playLevel() {
  const { valid } = validateLevel();
  if (!valid) {
    // Sacudir el mensaje de validación
    const msg = document.getElementById('editor-msg');
    if (msg) {
      msg.classList.add('shake');
      setTimeout(() => msg.classList.remove('shake'), 500);
    }
    return;
  }

  // Construir el objeto de nivel a partir del estado del editor
  const themeData = BG_THEMES[editorState.theme] || BG_THEMES.sky;

  window.customLevel = {
    cols:       editorState.cols,
    rows:       editorState.rows,
    grid:       editorState.grid.map(row => [...row]),  // copia profunda
    startDir:   'right',
    maxBlocks:  20,
    optimalSteps: estimateOptimalSteps(),
    allowedBlocks: ['move_up','move_down','move_left','move_right'],
    bgColor:    themeData.bgColor,
    floorColor: themeData.floorColor,
    wallColor:  themeData.wallColor,
    theme:      editorState.theme,
  };

  // Guardar en localStorage
  saveCustomLevel(window.customLevel);

  // Ir a la pantalla de juego
  startCustomLevel();
}

// Estimación simple del camino mínimo (Manhattan distance)
function estimateOptimalSteps() {
  const { grid } = editorState;
  const start = findTileInGrid(grid, TILE.START);
  const goal  = findTileInGrid(grid, TILE.GOAL);
  if (!start || !goal) return 5;
  return Math.abs(start.row - goal.row) + Math.abs(start.col - goal.col);
}

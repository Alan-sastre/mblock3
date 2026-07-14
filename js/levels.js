// ============================================================
// levels.js — mBlock3
// No hay niveles fijos. El niño diseña su propio nivel.
// Este archivo solo define las constantes y helpers.
// ============================================================

const TILE = { EMPTY:0, WALL:1, STAR:2, GOAL:3, START:4 };

let CELL_SIZE = 64;

// Temas de fondo disponibles en el editor
const BG_THEMES = {
  sky:    { bgColor:0x4FC3F7, floorColor:0x81C784, wallColor:0x6D4C41 },
  sunset: { bgColor:0xFF7043, floorColor:0xFFCC80, wallColor:0xBF360C },
  night:  { bgColor:0x1A0533, floorColor:0x9575CD, wallColor:0x1A237E },
  candy:  { bgColor:0xF06292, floorColor:0xCE93D8, wallColor:0x880E4F },
};

// Nivel activo diseñado por el niño
// Se llena desde editor.js y se lee en game.js
window.customLevel = null;

const PROGRESS_KEY = 'mblock3_saved';

function saveCustomLevel(levelData) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(levelData)); } catch(e){}
}

function loadCustomLevel() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

// Crear una grilla vacía con paredes en el borde
function createEmptyGrid(cols, rows) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) =>
      (r === 0 || r === rows-1 || c === 0 || c === cols-1) ? TILE.WALL : TILE.EMPTY
    )
  );
}

// Contar cuántos tiles de un tipo hay en la grilla
function countTile(grid, type) {
  return grid.flat().filter(t => t === type).length;
}

// Calcular estrellas según pasos usados
function calcStars(stepsUsed, optimalSteps) {
  if (stepsUsed <= optimalSteps)     return 3;
  if (stepsUsed <= optimalSteps * 2) return 2;
  return 1;
}

// Buscar un tile en la grilla
function findTileInGrid(grid, tileType) {
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[r].length; c++)
      if (grid[r][c] === tileType) return { row:r, col:c };
  return null;
}

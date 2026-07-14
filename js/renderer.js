// ============================================================
// renderer.js — Ilustraciones mBlock Kids (Phaser 3)
// ============================================================

// ── Fondo por nivel ───────────────────────────────────────
function drawBackground(scene, levelData) {
  const W = scene.scale.width, H = scene.scale.height;
  const g = scene.add.graphics();

  if (levelData.id === 1) {
    g.fillStyle(0x4FC3F7, 1); g.fillRect(0, 0, W, H * 0.55);
    g.fillStyle(0x0288D1, 1); g.fillRect(0, H*0.55, W, H*0.45);
    g.fillStyle(0x388E3C, 1); g.fillRect(0, H*0.75, W, H*0.25);
    g.fillStyle(0x43A047, 1); g.fillRect(0, H*0.72, W, H*0.06);
    // Sol
    g.fillStyle(0xFFF176, 0.45); g.fillCircle(W*0.85, H*0.12, 60);
    g.fillStyle(0xFFEE58, 1);    g.fillCircle(W*0.85, H*0.12, 42);
    g.lineStyle(3, 0xFFEE58, 0.55);
    for (let a = 0; a < 8; a++) {
      const ang = (a/8)*Math.PI*2;
      g.beginPath();
      g.moveTo(W*0.85+Math.cos(ang)*64, H*0.12+Math.sin(ang)*64);
      g.lineTo(W*0.85+Math.cos(ang)*82, H*0.12+Math.sin(ang)*82);
      g.strokePath();
    }
    // Nubes
    drawCloudBg(g, W*0.14, H*0.08, 1.2);
    drawCloudBg(g, W*0.46, H*0.14, 0.9);
    drawCloudBg(g, W*0.72, H*0.06, 1.0);
    // Montañas
    g.fillStyle(0x5C6BC0, 1);
    g.fillTriangle(W*0.05,H*0.75, W*0.23,H*0.75, W*0.14,H*0.47);
    g.fillTriangle(W*0.16,H*0.75, W*0.36,H*0.75, W*0.26,H*0.42);
    g.fillStyle(0x7986CB, 1);
    g.fillTriangle(W*0.08,H*0.75, W*0.25,H*0.75, W*0.16,H*0.50);
    g.fillStyle(0xffffff, 0.8);
    g.fillTriangle(W*0.14,H*0.47, W*0.11,H*0.56, W*0.17,H*0.56);
    g.fillTriangle(W*0.26,H*0.42, W*0.23,H*0.51, W*0.29,H*0.51);

  } else if (levelData.id === 2) {
    g.fillStyle(0xFF7043, 1); g.fillRect(0, 0, W, H*0.5);
    g.fillStyle(0xFFA726, 1); g.fillRect(0, H*0.5, W, H*0.5);
    g.fillStyle(0xFFCC02, 0.85); g.fillCircle(W*0.5, H*0.56, 58);
    g.fillStyle(0xFFE082, 0.35); g.fillCircle(W*0.5, H*0.56, 86);
    g.fillStyle(0xBF360C, 1);
    g.fillEllipse(W*0.2, H*0.79, W*0.5, H*0.22);
    g.fillEllipse(W*0.76, H*0.82, W*0.4, H*0.18);
    g.fillStyle(0xE65100, 1); g.fillRect(0, H*0.8, W, H*0.2);

  } else {
    g.fillStyle(0x1A0533, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0x311B92, 1); g.fillRect(0, H*0.6, W, H*0.4);
    // Estrellas del fondo (aleatorias pero con seed fijo)
    const rng = mulberry32(42);
    for (let i = 0; i < 40; i++) {
      g.fillStyle(0xffffff, rng()*0.6+0.3);
      g.fillCircle(rng()*W, rng()*H*0.6, rng()*1.5+0.5);
    }
    g.fillStyle(0xFFF9C4, 1); g.fillCircle(W*0.82, H*0.1, 30);
    g.fillStyle(0x1A0533, 1); g.fillCircle(W*0.87, H*0.08, 24);
    g.fillStyle(0x4A148C, 1); g.fillRect(0, H*0.82, W, H*0.18);
  }
  return g;
}

// RNG determinista (evita que las estrellas salten al resize)
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function drawCloudBg(g, cx, cy, s) {
  g.fillStyle(0xffffff, 0.85);
  g.fillCircle(cx,           cy,           22*s);
  g.fillCircle(cx+28*s, cy+4*s,  17*s);
  g.fillCircle(cx-22*s, cy+4*s,  15*s);
  g.fillCircle(cx+10*s, cy-14*s, 18*s);
}

// ── Grilla ────────────────────────────────────────────────
function drawGrid(scene, levelData, offsetX, offsetY) {
  const { grid, rows, cols, floorColor, wallColor } = levelData;
  const g = scene.add.graphics();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = offsetX + col*CELL_SIZE, y = offsetY + row*CELL_SIZE;
      if (grid[row][col] === TILE.WALL) drawWallTile(g, x, y, wallColor);
      else                              drawFloorTile(g, x, y, floorColor, levelData.id);
    }
  }
  return g;
}

// ── Tile pared 3D ─────────────────────────────────────────
function drawWallTile(g, x, y, color) {
  const s = CELL_SIZE;
  const light  = Phaser.Display.Color.ValueToColor(color).lighten(28).color;
  const dark   = Phaser.Display.Color.ValueToColor(color).darken(30).color;
  const darker = Phaser.Display.Color.ValueToColor(color).darken(55).color;

  g.fillStyle(color,  1); g.fillRect(x, y, s, s);
  g.fillStyle(light,  1); g.fillRect(x, y, s, 5);       // tope iluminado
  g.fillStyle(light,  1); g.fillRect(x, y, 5, s);       // lado izq iluminado
  g.fillStyle(darker, 1); g.fillRect(x+s-5, y+5, 5, s-5); // sombra derecha
  g.fillStyle(darker, 1); g.fillRect(x+5, y+s-5, s-5, 5); // sombra abajo

  // Ladrillo
  g.lineStyle(1, dark, 0.35);
  for (let i = 1; i < 4; i++) {
    g.beginPath(); g.moveTo(x, y+(s/4)*i); g.lineTo(x+s, y+(s/4)*i); g.strokePath();
  }
  [[s/2,0,s/4],[s/4,s/4,s/4],[s*3/4,s/4,s/4],[s/2,s/2,s/4],[s/4,s*3/4,s/4],[s*3/4,s*3/4,s/4]]
    .forEach(([ox,oy,h]) => {
      g.beginPath(); g.moveTo(x+ox, y+oy); g.lineTo(x+ox, y+oy+h); g.strokePath();
    });

  g.fillStyle(0xffffff, 0.1); g.fillRect(x+1, y+1, s*0.4, 3);
}

// ── Tile suelo con textura ────────────────────────────────
function drawFloorTile(g, x, y, color, levelId) {
  const s = CELL_SIZE;
  g.fillStyle(color, 1); g.fillRect(x, y, s, s);

  if (levelId === 1) {
    const dark = Phaser.Display.Color.ValueToColor(color).darken(18).color;
    g.fillStyle(dark, 0.45);
    g.fillCircle(x+s*0.25, y+s*0.3,  s*0.09);
    g.fillCircle(x+s*0.70, y+s*0.65, s*0.07);
    g.fillCircle(x+s*0.50, y+s*0.18, s*0.06);
  } else if (levelId === 2) {
    g.fillStyle(0xffffff, 0.13);
    g.fillCircle(x+s*0.3, y+s*0.4, 2);
    g.fillCircle(x+s*0.6, y+s*0.7, 2);
    g.fillCircle(x+s*0.8, y+s*0.25,2);
  } else {
    g.lineStyle(1, 0x000000, 0.1);
    g.beginPath(); g.moveTo(x+s*0.2, y+s*0.1); g.lineTo(x+s*0.45, y+s*0.5);
    g.lineTo(x+s*0.6, y+s*0.4); g.strokePath();
  }

  g.lineStyle(1, 0x000000, 0.07); g.strokeRect(x, y, s, s);
  g.fillStyle(0xffffff, 0.08);    g.fillRect(x+2, y+2, s-4, 3);
}

// ── Meta: estrella FIJA en su celda ───────────────────────
// El glow es un graphics estático. La estrella vive en un
// container cuyo origen ES el centro de la celda, así la
// rotación ocurre exactamente ahí y no se mueve de lugar.
function drawGoal(scene, tileX, tileY) {
  const cx = tileX + CELL_SIZE / 2;
  const cy = tileY + CELL_SIZE / 2;

  // Un solo container centrado en la celda.
  // TODOS los hijos usan coords relativas (0,0).
  // El tween de pulso se aplica al CONTAINER completo,
  // no al glow por separado, para evitar el desplazamiento.
  const cont = scene.add.container(cx, cy);

  // Resplandor (coords relativas al container)
  const glow = scene.add.graphics();
  glow.fillStyle(0xFFD700, 0.20);
  glow.fillCircle(0, 0, CELL_SIZE * 0.50);
  glow.fillStyle(0xFFFDE7, 0.12);
  glow.fillCircle(0, 0, CELL_SIZE * 0.32);

  // Estrella (coords relativas al container)
  const sg = scene.add.graphics();
  drawStarAt(sg, 0, 0, 5, CELL_SIZE*0.36, CELL_SIZE*0.15, 0xFFD700, 0xFFA000);
  drawStarAt(sg, 0, 0, 5, CELL_SIZE*0.18, CELL_SIZE*0.08, 0xFFFDE7, 0xFFEE58);

  cont.add([glow, sg]);

  // Pulso: escala del container completo (glow + estrella juntos)
  // → el origen de escala es el centro del container = centro de la celda
  scene.tweens.add({
    targets: cont,
    scaleX: 1.18, scaleY: 1.18,
    duration: 700, yoyo: true, repeat: -1,
    ease: 'Sine.easeInOut',
  });

  // Rotación solo de la estrella (el glow no rota, queda estático)
  scene.tweens.add({
    targets: sg,
    angle: 360,
    duration: 2800, repeat: -1, ease: 'Linear',
  });

  // Rebote vertical del container
  scene.tweens.add({
    targets: cont,
    y: cy - 6,
    duration: 900, yoyo: true, repeat: -1,
    ease: 'Sine.easeInOut',
  });

  return cont;
}

function drawStarAt(g, cx, cy, pts, outerR, innerR, fill, stroke) {
  const points = [];
  for (let i = 0; i < pts*2; i++) {
    const r   = i%2===0 ? outerR : innerR;
    const ang = (Math.PI/pts)*i - Math.PI/2;
    points.push(new Phaser.Geom.Point(cx+r*Math.cos(ang), cy+r*Math.sin(ang)));
  }
  g.fillStyle(fill, 1);   g.fillPoints(points, true);
  g.lineStyle(2, stroke, 1); g.strokePoints(points, true);
}

// ── Robot mejorado (sin rotación) ─────────────────────────
function drawRobot(scene, tileX, tileY) {
  const cont = scene.add.container(tileX + CELL_SIZE/2, tileY + CELL_SIZE/2);
  const g = scene.add.graphics();
  const s = CELL_SIZE;
  const bw = s*0.52, bh = s*0.42, hw = s*0.44, hh = s*0.32;

  // Sombra
  const sh = scene.add.graphics();
  sh.fillStyle(0x000000, 0.2);
  sh.fillEllipse(0, bh*0.9, bw*1.35, bh*0.24);

  // Piernas
  g.fillStyle(0x455A64, 1);
  g.fillRoundedRect(-bw*0.28-5, bh*0.36, 13, bh*0.40, 4);
  g.fillRoundedRect( bw*0.28-8, bh*0.36, 13, bh*0.40, 4);
  g.fillStyle(0x90A4AE, 0.35);
  g.fillRect(-bw*0.28-3, bh*0.37, 3, bh*0.38);
  g.fillRect( bw*0.28-6, bh*0.37, 3, bh*0.38);

  // Pies
  g.fillStyle(0x263238, 1);
  g.fillRoundedRect(-bw*0.28-7, bh*0.67, 20, 10, 5);
  g.fillRoundedRect( bw*0.28-11,bh*0.67, 20, 10, 5);

  // Sombra cuerpo
  g.fillStyle(0x0D47A1, 1);
  g.fillRoundedRect(-bw/2+3, -bh*0.06+3, bw, bh, 9);
  // Cuerpo
  g.fillStyle(0x1976D2, 1);
  g.fillRoundedRect(-bw/2, -bh*0.08, bw, bh, 9);
  g.fillStyle(0x42A5F5, 0.4);
  g.fillRoundedRect(-bw/2, -bh*0.08, 6, bh, {tl:9,tr:0,br:0,bl:9});
  g.fillStyle(0xffffff, 0.1);
  g.fillRoundedRect(-bw/2+6, -bh*0.08, bw-12, 7, 4);

  // Panel pecho
  g.fillStyle(0x0D47A1, 1);
  g.fillRoundedRect(-bw*0.35, bh*0.04, bw*0.70, bh*0.56, 6);
  g.fillStyle(0x1565C0, 1);
  g.fillRoundedRect(-bw*0.33, bh*0.06, bw*0.66, bh*0.52, 5);

  // LEDs de colores
  g.fillStyle(0xFF1744, 1); g.fillCircle(-bw*0.18, bh*0.18, 3);
  g.fillStyle(0xFFEA00, 1); g.fillCircle(0,         bh*0.18, 3);
  g.fillStyle(0x00E676, 1); g.fillCircle( bw*0.18, bh*0.18, 3);

  // Corazón
  g.fillStyle(0xFF1744, 1);
  g.fillCircle(-4, bh*0.34, 4); g.fillCircle(4, bh*0.34, 4);
  g.fillTriangle(-7, bh*0.37, 7, bh*0.37, 0, bh*0.46);
  g.fillStyle(0xFF8A80, 0.65); g.fillCircle(-4, bh*0.32, 2);

  // Brazos
  g.fillStyle(0x1565C0, 1);
  g.fillRoundedRect(-bw/2-12, -bh*0.05, 12, bh*0.54, 5);
  g.fillRoundedRect( bw/2,    -bh*0.05, 12, bh*0.54, 5);
  g.fillStyle(0x42A5F5, 0.28);
  g.fillRect(-bw/2-10, -bh*0.03, 4, bh*0.50);
  g.fillRect( bw/2+2,  -bh*0.03, 4, bh*0.50);

  // Manos
  g.fillStyle(0x78909C, 1);
  g.fillCircle(-bw/2-8, bh*0.46, 8); g.fillCircle(bw/2+8, bh*0.46, 8);
  g.fillStyle(0x90A4AE, 0.45);
  g.fillCircle(-bw/2-8, bh*0.43, 4); g.fillCircle(bw/2+8, bh*0.43, 4);

  // Cuello
  g.fillStyle(0x455A64, 1); g.fillRect(-7, -bh*0.20, 14, bh*0.16);
  g.fillStyle(0x546E7A, 0.45); g.fillRect(-5, -bh*0.20, 4, bh*0.16);

  // Cabeza
  const hY = -bh*0.20 - hh;
  g.fillStyle(0x0D47A1, 1); g.fillRoundedRect(-hw/2+3, hY+3, hw, hh, 11);
  g.fillStyle(0x42A5F5, 1); g.fillRoundedRect(-hw/2, hY, hw, hh, 11);
  g.fillStyle(0x90CAF9, 0.45); g.fillRoundedRect(-hw/2, hY, 6, hh, {tl:11,tr:0,br:0,bl:11});
  g.fillStyle(0xffffff, 0.13); g.fillRoundedRect(-hw/2+6, hY+2, hw-12, 7, 4);
  g.lineStyle(2, 0x1565C0, 0.75); g.strokeRoundedRect(-hw/2, hY, hw, hh, 11);

  // Ojos
  const eY = hY + hh*0.44, eR = hh*0.24, pR = hh*0.13;
  [-hw*0.24, hw*0.24].forEach((ex, i) => {
    g.fillStyle(0xffffff, 1); g.fillCircle(ex, eY, eR);
    g.fillStyle(0xE3F2FD, 1); g.fillCircle(ex, eY+eR*0.14, eR*0.88);
    g.fillStyle(0x1565C0, 1); g.fillCircle(ex, eY, pR*1.3);
    g.fillStyle(0x0D0D0D, 1); g.fillCircle(ex, eY, pR);
    g.fillStyle(0xffffff, 1); g.fillCircle(ex+(i===0?4:-4), eY-pR*0.7, hh*0.065);
    g.fillStyle(0xffffff, 0.65); g.fillCircle(ex-(i===0?3:-3), eY+pR*0.2, hh*0.03);
  });

  // Cejas
  g.lineStyle(2, 0x1A237E, 1);
  [-hw*0.24, hw*0.24].forEach(ex => {
    g.beginPath(); g.arc(ex, hY+hh*0.12, hh*0.2, Math.PI*1.2, Math.PI*1.8, false);
    g.strokePath();
  });

  // Antena
  g.fillStyle(0x455A64, 1); g.fillRect(-2, hY-16, 4, 16);
  g.fillStyle(0x546E7A, 1); g.fillCircle(0, hY, 5);
  g.fillStyle(0xFF6F00, 1); g.fillCircle(0, hY-18, 7);
  g.fillStyle(0xFFCC02, 1); g.fillCircle(0, hY-18, 5);
  g.fillStyle(0xffffff, 0.8); g.fillCircle(-2, hY-20, 2);

  // Boca con dientes
  const mY = hY + hh*0.80, mR = hh*0.19;
  g.lineStyle(3, 0x0D47A1, 1);
  g.beginPath(); g.arc(0, mY, mR, 0, Math.PI, false); g.strokePath();
  g.fillStyle(0xffffff, 1);
  g.fillRect(-mR*0.5, mY-2, mR*0.4, 5);
  g.fillRect( mR*0.1, mY-2, mR*0.4, 5);

  cont.add([sh, g]);
  return cont;
}

// ── Animaciones ───────────────────────────────────────────
function animateRobotMove(scene, cont, toX, toY, onComplete) {
  scene.tweens.add({ targets:cont, scaleY:0.88, scaleX:1.06,
    duration:70, yoyo:true, ease:'Sine.easeOut' });
  scene.tweens.add({
    targets: cont,
    x: toX + CELL_SIZE/2, y: toY + CELL_SIZE/2,
    duration: 290, ease: 'Quad.easeInOut',
    onComplete: onComplete || (()=>{}),
  });
}

function animateRobotTurn(scene, cont, angleDelta, onComplete) {
  // No se usa con movimiento absoluto, pero se mantiene por compatibilidad
  if (onComplete) onComplete();
}

function playWinAnimation(scene, cont) {
  scene.tweens.add({ targets:cont, scaleX:1.35, scaleY:1.35,
    duration:160, yoyo:true, repeat:3, ease:'Back.easeOut' });

  const colors = [0xFF4081,0xFFD740,0x69F0AE,0x40C4FF,0xE040FB,0xFF6D00];
  for (let i = 0; i < 28; i++) {
    const tx = cont.x + Phaser.Math.Between(-100,100);
    const ty = cont.y + Phaser.Math.Between(-100,60);
    const pg = scene.add.graphics();
    pg.fillStyle(Phaser.Utils.Array.GetRandom(colors), 1);
    if (i%2===0) pg.fillCircle(0,0,Phaser.Math.Between(4,9));
    else { const w=Phaser.Math.Between(5,12); pg.fillRect(-w/2,-w/2,w,w*0.6); }
    pg.setPosition(cont.x, cont.y);
    pg.setAngle(Phaser.Math.Between(0,360));
    scene.tweens.add({
      targets:pg, x:tx, y:ty, angle:pg.angle+Phaser.Math.Between(-180,180),
      alpha:0, scaleX:0.1, scaleY:0.1,
      duration:Phaser.Math.Between(500,950), ease:'Cubic.easeOut',
      onComplete:()=>pg.destroy(),
    });
  }
}

// ── Decoraciones ──────────────────────────────────────────
function drawDecorations(scene, levelData, mapW, mapH, offsetX, offsetY) {
  const g = scene.add.graphics();
  const W = scene.scale.width, H = scene.scale.height;

  if (levelData.id === 1) {
    if (offsetX > 45)          drawTree(g, offsetX-44,       offsetY+mapH-CELL_SIZE*0.5);
    if (offsetX+mapW+14 < W-10) drawTree(g, offsetX+mapW+14, offsetY+mapH-CELL_SIZE*0.5);
    drawFlowers(g, W*0.05, H*0.78);
    drawFlowers(g, W*0.90, H*0.76);
  } else if (levelData.id === 2) {
    drawCactus(g, W*0.06, H*0.72);
    drawCactus(g, W*0.89, H*0.70);
  } else {
    drawMushroom(g, W*0.05, H*0.75);
    drawMushroom(g, W*0.88, H*0.77);
    drawCrystal(g,  W*0.93, H*0.60);
    drawCrystal(g,  W*0.04, H*0.62);
  }
}

function drawTree(g, x, y) {
  g.fillStyle(0x6D4C41,1); g.fillRoundedRect(x+12, y-22, 11, 30, 3);
  g.fillStyle(0x8D6E63,0.45); g.fillRect(x+14, y-22, 4, 30);
  g.fillStyle(0x2E7D32,1); g.fillCircle(x+18, y-30, 20);
  g.fillStyle(0x43A047,1); g.fillCircle(x+18, y-34, 18);
  g.fillStyle(0x66BB6A,1); g.fillCircle(x+10, y-28, 12);
  g.fillCircle(x+26, y-28, 11);
  g.fillStyle(0xA5D6A7,0.45); g.fillCircle(x+13, y-40, 6);
}

function drawFlowers(g, x, y) {
  const cols = [0xFF80AB,0xFF4081,0xFFD740,0xFF6D00];
  for (let i = 0; i < 5; i++) {
    const fx = x+i*14-28, fy = y+Math.sin(i)*5;
    g.fillStyle(0x66BB6A,1); g.fillRect(fx+2, fy, 2, 12);
    g.fillStyle(cols[i%cols.length],1); g.fillCircle(fx+3, fy, 6);
    g.fillStyle(0xFFFF00,1); g.fillCircle(fx+3, fy, 3);
  }
}

function drawCactus(g, x, y) {
  g.fillStyle(0x2E7D32,1); g.fillRoundedRect(x+7, y-40, 12, 48, 5);
  g.fillRoundedRect(x-4, y-26, 12, 8, 3); g.fillRoundedRect(x-4, y-34, 8, 10, 3);
  g.fillRoundedRect(x+18,y-22, 12, 8, 3); g.fillRoundedRect(x+22,y-30, 8, 10, 3);
  g.fillStyle(0x4CAF50,0.55); g.fillRoundedRect(x+10, y-38, 4, 44, 2);
  g.lineStyle(1, 0xffffff, 0.45);
  [[x+5,y-30],[x+5,y-15],[x+21,y-25],[x+21,y-12]].forEach(([sx,sy])=>{
    g.beginPath(); g.moveTo(sx,sy); g.lineTo(sx-5,sy-4); g.strokePath();
    g.beginPath(); g.moveTo(sx,sy); g.lineTo(sx-5,sy+4); g.strokePath();
  });
}

function drawMushroom(g, x, y) {
  g.fillStyle(0xFFF9C4,1); g.fillRoundedRect(x+8, y-20, 14, 22, 4);
  g.fillStyle(0xE53935,1); g.fillEllipse(x+15, y-22, 40, 26);
  g.fillStyle(0xEF9A9A,0.45); g.fillEllipse(x+15, y-28, 36, 16);
  g.fillStyle(0xffffff,0.9);
  g.fillCircle(x+9,y-24,4); g.fillCircle(x+20,y-20,3); g.fillCircle(x+24,y-28,3);
  g.fillStyle(0x212121,1);
  g.fillCircle(x+12,y-14,2); g.fillCircle(x+18,y-14,2);
  g.lineStyle(1,0x212121,1);
  g.beginPath(); g.arc(x+15, y-12, 3, 0, Math.PI, false); g.strokePath();
}

function drawCrystal(g, x, y) {
  const pts = [
    new Phaser.Geom.Point(x,    y-30), new Phaser.Geom.Point(x+10, y-10),
    new Phaser.Geom.Point(x+8,  y),    new Phaser.Geom.Point(x-8,  y),
    new Phaser.Geom.Point(x-10, y-10),
  ];
  g.fillStyle(0xCE93D8,0.8); g.fillPoints(pts,true);
  g.lineStyle(1,0xE040FB,0.9); g.strokePoints(pts,true);
  g.fillStyle(0xffffff,0.32);
  g.fillPoints([new Phaser.Geom.Point(x,y-30),
    new Phaser.Geom.Point(x+4,y-12), new Phaser.Geom.Point(x-4,y-12)], true);
}

// ============================================================
// blocks.js — mBlock3 (solo movimiento, igual que mBlock1)
// ============================================================

function createArrowSVG(direction, bgColor) {
  const arrows = {
    up:    'M24,8 L40,34 L29,34 L29,44 L19,44 L19,34 L8,34 Z',
    down:  'M24,44 L8,18 L19,18 L19,8 L29,8 L29,18 L40,18 Z',
    left:  'M8,24 L34,8 L34,19 L44,19 L44,29 L34,29 L34,40 Z',
    right: 'M44,24 L18,40 L18,29 L8,29 L8,19 L18,19 L18,8 Z',
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 52 52">
    <rect width="52" height="52" rx="12" fill="${bgColor}"/>
    <path d="${arrows[direction]}" fill="white" opacity="0.95"/>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

Blockly.Blocks['move_up'] = {
  init: function() {
    this.setColour('#43A047');
    this.appendDummyInput()
      .appendField(new Blockly.FieldImage(createArrowSVG('up','#2E7D32'),52,52,'↑'));
    this.setPreviousStatement(true,null); this.setNextStatement(true,null);
  }
};
Blockly.Blocks['move_down'] = {
  init: function() {
    this.setColour('#E53935');
    this.appendDummyInput()
      .appendField(new Blockly.FieldImage(createArrowSVG('down','#B71C1C'),52,52,'↓'));
    this.setPreviousStatement(true,null); this.setNextStatement(true,null);
  }
};
Blockly.Blocks['move_left'] = {
  init: function() {
    this.setColour('#1E88E5');
    this.appendDummyInput()
      .appendField(new Blockly.FieldImage(createArrowSVG('left','#1565C0'),52,52,'←'));
    this.setPreviousStatement(true,null); this.setNextStatement(true,null);
  }
};
Blockly.Blocks['move_right'] = {
  init: function() {
    this.setColour('#8E24AA');
    this.appendDummyInput()
      .appendField(new Blockly.FieldImage(createArrowSVG('right','#6A1B9A'),52,52,'→'));
    this.setPreviousStatement(true,null); this.setNextStatement(true,null);
  }
};

function registerGenerators() {
  let gen = null;
  if (typeof javascript !== 'undefined' && javascript.javascriptGenerator) {
    gen = javascript.javascriptGenerator;
  } else if (typeof Blockly !== 'undefined' && Blockly.JavaScript) {
    gen = Blockly.JavaScript;
  }
  if (!gen) return null;
  gen.forBlock = gen.forBlock || {};
  function reg(name, code) { gen.forBlock[name] = ()=>code; gen[name]=()=>code; }
  reg('move_up',    'await moveUp();\n');
  reg('move_down',  'await moveDown();\n');
  reg('move_left',  'await moveLeft();\n');
  reg('move_right', 'await moveRight();\n');
  window._jsGenerator = gen;
  return gen;
}

window.workspace = null;

function initBlockly(allowedBlocks) {
  if (!window._jsGenerator) registerGenerators();
  if (window.workspace) { try{ window.workspace.dispose(); }catch(e){} window.workspace=null; }
  document.getElementById('blockly-workspace').innerHTML = '';

  const toolboxXML = `<xml xmlns="https://developers.google.com/blockly/xml">
    ${allowedBlocks.map(b=>`<block type="${b}"></block>`).join('')}
  </xml>`;

  window.workspace = Blockly.inject('blockly-workspace', {
    toolbox: toolboxXML,
    scrollbars: true, trashcan: false,
    zoom:   { controls:false, wheel:false, startScale:1.1 },
    grid:   { spacing:20, length:3, colour:'rgba(255,255,255,0.1)', snap:true },
    renderer: 'zelos',
    theme: buildKidsTheme(),
  });
  window.workspace.addChangeListener(onWorkspaceChange);
}

function buildKidsTheme() {
  return Blockly.Theme.defineTheme('kidsTheme', {
    base: Blockly.Themes.Classic,
    componentStyles: {
      workspaceBackgroundColour:'#1a1a2e', toolboxBackgroundColour:'#16213e',
      toolboxForegroundColour:'#ffffff',   flyoutBackgroundColour:'#16213e',
      flyoutForegroundColour:'#ffffff',    flyoutOpacity:0.9, scrollbarColour:'#4a4a8a',
    },
    fontStyle: { family:'sans-serif', weight:'bold', size:14 },
  });
}

function onWorkspaceChange() {
  if (!window.customLevel || !window.workspace) return;
  const count = window.workspace.getAllBlocks(false).length;
  const max   = window.customLevel.maxBlocks;
  const el    = document.getElementById('block-counter');
  if (el) { el.textContent = count+' / '+max; el.style.color = count>max?'#ff4444':'#fff'; }
}

function clearWorkspace() { if(window.workspace) window.workspace.clear(); }

function generateCode() {
  if (!window.workspace) return '';
  const gen = window._jsGenerator;
  if (!gen) return '';
  try { return gen.workspaceToCode(window.workspace); } catch(e) { return ''; }
}

document.addEventListener('DOMContentLoaded', registerGenerators);

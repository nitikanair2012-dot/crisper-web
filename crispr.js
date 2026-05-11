const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const baseWidth = 1000, baseHeight = 700;
let WIDTH = baseWidth, HEIGHT = baseHeight;
let scale = 1;

function resizeCanvas() {
  const wrapper = canvas.parentElement;
  const rect = wrapper.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  
  // Logic scale: How much we are stretching the 1000x700 map
  scale = Math.min(rect.width / baseWidth, rect.height / baseHeight);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// --- UPDATED THEME COLORS (White & Blue) ---
const DARK_BG = '#050A15';
const PRIMARY_BLUE = '#00B4FF'; // Brighter cyan-blue
const SOFT_BLUE = '#A0D8EF';
const WHITE = '#FFFFFF';
const GLASS_WHITE = 'rgba(255, 255, 255, 0.1)';
const ENZYME_COLOR = '#FFD700'; // Cas9 stays gold for contrast

const SCIENCE_LOG = {
  SCANNING: { title: 'PHASE: TARGETING', body: ['Scanning genome with gRNA...', 'Identifying PAM sequences.']},
  BINDING: { title: 'PHASE: BINDING', body: ['DNA double helix unwinding...', 'RNA-DNA heteroduplex forming.']},
  CLEAVAGE: { title: 'PHASE: CLEAVAGE', body: ['Cas9 nuclease domains active.', 'Inducing Double-Strand Break (DSB).']},
  FIXING: { title: 'PHASE: REPAIRING', body: ['Cellular repair machinery recruited.', 'Processing DNA ends...']},
  NHEJ: { title: 'RESULT: NHEJ', body: ['Non-Homologous End Joining.', 'Error-prone repair complete.']},
  HDR: { title: 'RESULT: HDR', body: ['Homology-Directed Repair.', 'Template-based precision edit.']}
};

let state = 'SCANNING';
let repair_choice = null;
let repair_progress = 0;
let cas9_pos = 150;
let target_pos = 150;
let show_break = false;

// --- FIXED INPUT HANDLING ---
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  
  // Calculate EXACT logical coordinates (0-1000)
  const x = (e.clientX - rect.left) / scale;
  const y = (e.clientY - rect.top) / scale;
  
  // Nav buttons logic
  if (y > 620) {
    if (x > 50 && x < 170) { state = 'SCANNING'; show_break = false; repair_choice = null; }
    else if (x > 180 && x < 300) { state = 'BINDING'; }
    else if (x > 310 && x < 430) { state = 'CLEAVAGE'; show_break = true; }
  }
  
  // Repair choices logic
  if (state === 'CLEAVAGE' && x > 650 && x < 950) {
    if (y > 400 && y < 450) { state = 'FIXING'; repair_choice = 'NHEJ'; repair_progress = 0; }
    if (y > 470 && y < 520) { state = 'FIXING'; repair_choice = 'HDR'; repair_progress = 0; }
  }
});

function draw() {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);

  // Background
  ctx.fillStyle = DARK_BG;
  ctx.fillRect(0, 0, baseWidth, baseHeight);
  
  const time = Date.now() * 0.002;

  // Title
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 28px "Courier New"';
  ctx.fillText('CRISPR-CAS9 // GENE EDIT', 50, 60);

  // --- LOGIC ---
  if (state === 'SCANNING') {
    if (Math.random() < 0.01) target_pos = 150 + Math.random() * 300;
    cas9_pos += (target_pos - cas9_pos) * 0.05;
  } else if (state === 'FIXING') {
    repair_progress += 0.8;
    if (repair_progress >= 100) { state = repair_choice; show_break = false; }
  } else {
    cas9_pos += (300 - cas9_pos) * 0.1;
  }

  // --- 3D HELIX DRAWING ---
  const cx = 500;
  for (let i = 0; i < 18; i++) {
    const y = 100 + i * 30;
    const rot = time + i * 0.4;
    const sin = Math.sin(rot);
    const cos = Math.cos(rot);
    
    // Perspective sizing
    const size = 6 + cos * 3;
    const lx = cx + sin * 60;
    const rx = cx - sin * 60;

    const isBreaking = show_break && i > 7 && i < 11;
    const gap = isBreaking ? (state === 'FIXING' ? 50 - (repair_progress/2) : 50) : 0;

    // Draw Strands
    ctx.lineWidth = 2;
    ctx.strokeStyle = cos > 0 ? PRIMARY_BLUE : SOFT_BLUE;
    ctx.beginPath();
    ctx.moveTo(lx - gap, y);
    ctx.lineTo(rx + gap, y);
    ctx.stroke();

    // Draw Nucleotides (3D spheres)
    ctx.fillStyle = cos > 0 ? WHITE : PRIMARY_BLUE;
    ctx.beginPath(); ctx.arc(lx - gap, y, size, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rx + gap, y, size, 0, Math.PI * 2); ctx.fill();
  }

  // --- CAS9 PROTEIN ---
  ctx.save();
  ctx.translate(450, cas9_pos);
  ctx.shadowBlur = 20;
  ctx.shadowColor = PRIMARY_BLUE;
  ctx.fillStyle = ENZYME_COLOR;
  ctx.beginPath();
  ctx.arc(50, 50, 40 + Math.sin(time)*5, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = WHITE;
  ctx.font = '14px Arial';
  ctx.fillText("CAS9", 33, 55);
  ctx.restore();

  // --- HUD BOX ---
  const currentData = SCIENCE_LOG[repair_choice || state] || SCIENCE_LOG.SCANNING;
  ctx.fillStyle = 'rgba(20, 30, 50, 0.8)';
  ctx.strokeStyle = PRIMARY_BLUE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(50, 400, 350, 180, 10);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = PRIMARY_BLUE;
  ctx.font = 'bold 18px Arial';
  ctx.fillText(currentData.title, 70, 435);
  ctx.fillStyle = WHITE;
  ctx.font = '15px Arial';
  currentData.body.forEach((line, idx) => {
    ctx.fillText(line, 70, 470 + idx * 25);
  });

  // --- ACTION BUTTONS (CLEAVAGE STATE) ---
  if (state === 'CLEAVAGE') {
    drawButton(650, 400, 300, 50, 'TRIGGER NHEJ', 'red');
    drawButton(650, 470, 300, 50, 'TRIGGER HDR', PRIMARY_BLUE);
  }

  // --- NAV BUTTONS (BOTTOM) ---
  drawButton(50, 630, 120, 40, 'SCAN', state === 'SCANNING' ? PRIMARY_BLUE : 'grey');
  drawButton(180, 630, 120, 40, 'BIND', state === 'BINDING' ? PRIMARY_BLUE : 'grey');
  drawButton(310, 630, 120, 40, 'CUT', state === 'CLEAVAGE' ? PRIMARY_BLUE : 'grey');

  requestAnimationFrame(draw);
}

function drawButton(x, y, w, h, label, color) {
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 5);
  ctx.fill(); ctx.stroke();
  
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 14px "Courier New"';
  ctx.fillText(label, x + 15, y + h/2 + 5);
}

draw();


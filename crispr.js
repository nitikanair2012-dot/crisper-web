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
const DARK_BG = '#030A14';
const PRIMARY_BLUE = '#00B8FF'; // Brighter cyan-blue
const SOFT_BLUE = '#92E7FF';
const SCIFI_GREEN = '#5BF6D1';
const NEON_TEAL = '#2DF1D9';
const PANEL_BORDER = 'rgba(45, 241, 217, 0.5)';
const PANEL_GLOW = 'rgba(45, 241, 217, 0.18)';
const WHITE = '#FFFFFF';
const GLASS_WHITE = 'rgba(255, 255, 255, 0.08)';
const ENZYME_COLOR = '#FFD700'; // Cas9 stays gold for contrast

const PANEL_X = 620;
const PANEL_Y = 90;
const PANEL_W = 340;
const PANEL_H = 520;

const SCIENCE_LOG = {
  SCANNING: { title: 'PHASE: TARGETING', body: ['In the targeting phase, the Cas9-gRNA complex scans the genome', 'to find a specific DNA sequence. It first identifies a short "tag"', 'called the PAM, which allows the protein to briefly bind and unzip', 'the DNA. If the guide RNA matches the unzipped DNA sequence,', 'they "zip" together to form an R-loop; this precise match triggers', 'a final shape change in the Cas9 protein, positioning its molecular', '"scissors" to make a cut.']},
  BINDING: { title: 'PHASE: BINDING', body: ['In the binding phase, the Cas9-gRNA complex scans the DNA for a', 'specific "landing pad" called the PAM. Once found, Cas9 unzips the', 'DNA so the guide RNA can test for a match. If the sequences align', 'perfectly, they lock together into a stable R-loop, anchoring the', 'enzyme in place and priming it to make the cut.']},
  CLEAVAGE: { title: 'PHASE: CLEAVAGE', body: ['During cleavage, the Cas9 enzyme uses its two molecular "scissors"—', 'the HNH and RuvC domains—to snap both strands of the DNA. This occurs', 'precisely three nucleotides upstream of the PAM, creating a clean', 'double-strand break that triggers the cell\'s natural repair systems.']},
  FIXING: { title: 'PHASE: REPAIRING', body: ['Cellular DNA repair machinery is recruited to the break site...', 'Processing DNA ends and preparing for repair mechanisms...', 'Cell chooses between NHEJ or HDR repair pathways.']},
  NHEJ: { title: 'RESULT: NHEJ', body: ['NHEJ is the cell’s "quick-fix" response that simply glues the broken', 'DNA ends back together. Because it’s prone to errors, it often adds', 'or removes random bases, creating mutations that effectively knock', 'out or disable the target gene.']},
  HDR: { title: 'RESULT: HDR', body: ['HDR is the "precise" repair route that uses a matching DNA template', 'to fix the break. By providing a custom template, scientists can guide', 'the cell to rewrite the genetic code, allowing for the knock-in of', 'specific new sequences or the correction of mutations.']}
};

let state = 'SCANNING';
let repair_choice = null;
let repair_progress = 0;
let cas9_pos = 150;
let target_pos = 150;
let show_break = false;
let stateTimer = 0;
let lastTimestamp = Date.now();

function enterState(newState) {
  state = newState;
  stateTimer = 0;
  if (newState !== 'FIXING') repair_choice = null;
  show_break = newState === 'CLEAVAGE' || newState === 'FIXING';
}

// --- FIXED INPUT HANDLING ---
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  
  // Calculate EXACT logical coordinates (0-1000)
  const x = (e.clientX - rect.left) / scale;
  const y = (e.clientY - rect.top) / scale;
  
  // Nav buttons logic
  if (y > 620) {
    if (x > 30 && x < 170) { enterState('SCANNING'); }
    else if (x > 180 && x < 320) { enterState('BINDING'); }
    else if (x > 330 && x < 470) { enterState('CLEAVAGE'); }
  }
  
  // Repair choices logic
  if (state === 'CLEAVAGE' && x > PANEL_X + 20 && x < PANEL_X + 320) {
    if (y > PANEL_Y + PANEL_H - 140 && y < PANEL_Y + PANEL_H - 90) { enterState('FIXING'); repair_choice = 'NHEJ'; repair_progress = 0; }
    if (y > PANEL_Y + PANEL_H - 70 && y < PANEL_Y + PANEL_H - 20) { enterState('FIXING'); repair_choice = 'HDR'; repair_progress = 0; }
  }
});

function draw() {
  const now = Date.now();
  const dt = Math.min(0.04, (now - lastTimestamp) / 1000);
  lastTimestamp = now;
  stateTimer += dt;

  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);

  const time = now * 0.002;
  const currentData = SCIENCE_LOG[state] || SCIENCE_LOG.SCANNING;

  // Background with gradient
  const gradient = ctx.createLinearGradient(0, 0, baseWidth, baseHeight);
  gradient.addColorStop(0, DARK_BG);
  gradient.addColorStop(0.35, '#06111F');
  gradient.addColorStop(0.5, '#02101B');
  gradient.addColorStop(1, DARK_BG);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  // Grid overlay
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= baseWidth; gx += 50) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, baseHeight);
    ctx.stroke();
  }
  for (let gy = 0; gy <= baseHeight; gy += 50) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(baseWidth, gy);
    ctx.stroke();
  }

  drawHudExtras();

  // Add some glowing particles
  for (let i = 0; i < 26; i++) {
    const px = Math.sin(time * 0.4 + i * 0.9) * 320 + 500;
    const py = Math.cos(time * 0.6 + i * 0.7) * 220 + 350;
    const alpha = (Math.sin(time + i * 1.3) + 1) * 0.15;
    ctx.fillStyle = `rgba(45, 241, 217, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Title with glow
  ctx.shadowBlur = 20;
  ctx.shadowColor = PRIMARY_BLUE;
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 32px "Courier New"';
  ctx.fillText('CRISPR-CAS9 // GENE EDIT', 50, 60);
  ctx.shadowBlur = 0;

  // --- LOGIC ---
  if (state === 'SCANNING') {
    if (Math.random() < 0.01) target_pos = 150 + Math.random() * 300;
    cas9_pos += (target_pos - cas9_pos) * 0.05;
  } else if (state === 'BINDING') {
    cas9_pos += (target_pos - cas9_pos) * 0.08;
    if (stateTimer > 1.6) {
      enterState('CLEAVAGE');
    }
  } else if (state === 'FIXING') {
    repair_progress += 0.8;
    if (repair_progress >= 100) { enterState(repair_choice); }
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
    ctx.lineWidth = 3;
    ctx.strokeStyle = cos > 0 ? '#FF4444' : SOFT_BLUE; // One strand red
    ctx.beginPath();
    ctx.moveTo(lx - gap, y);
    ctx.lineTo(rx + gap, y);
    ctx.stroke();

    // Draw Nucleotides (3D spheres)
    ctx.fillStyle = cos > 0 ? '#FF6666' : PRIMARY_BLUE; // Red nucleotides on one side
    ctx.beginPath(); ctx.arc(lx - gap, y, size, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rx + gap, y, size, 0, Math.PI * 2); ctx.fill();
  }

  // --- Cutting hint during binding ---
  if (state === 'BINDING') {
    ctx.fillStyle = NEON_TEAL;
    ctx.font = 'bold 24px "Courier New"';
    ctx.fillText('CUTTING SEQUENCE...', 520, 120);
  }

  // --- CAS9 PROTEIN ---
  ctx.save();
  ctx.translate(450, cas9_pos);
  
  // Outer glow
  ctx.shadowBlur = 30;
  ctx.shadowColor = ENZYME_COLOR;
  ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.beginPath();
  ctx.arc(50, 50, 50 + Math.sin(time * 2) * 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Main Cas9 body
  ctx.shadowBlur = 15;
  ctx.shadowColor = PRIMARY_BLUE;
  ctx.fillStyle = ENZYME_COLOR;
  ctx.beginPath();
  ctx.arc(50, 50, 40 + Math.sin(time) * 5, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(45, 45, 15, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = DARK_BG;
  ctx.font = 'bold 16px Arial';
  ctx.fillText("CAS9", 33, 55);
  ctx.restore();

  ctx.fillStyle = 'rgba(4, 12, 24, 0.94)';
  ctx.strokeStyle = PANEL_BORDER;
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 24;
  ctx.shadowColor = PANEL_GLOW;
  ctx.beginPath();
  ctx.roundRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 18);
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  // Panel top bar
  ctx.fillStyle = 'rgba(6, 20, 40, 0.95)';
  ctx.fillRect(PANEL_X + 2, PANEL_Y + 2, PANEL_W - 4, 42);
  ctx.strokeStyle = 'rgba(45, 241, 217, 0.35)';
  ctx.lineWidth = 1.8;
  ctx.strokeRect(PANEL_X + 2, PANEL_Y + 2, PANEL_W - 4, 42);

  ctx.fillStyle = SCIFI_GREEN;
  ctx.font = 'bold 18px "Courier New"';
  ctx.fillText(currentData.title, PANEL_X + 20, PANEL_Y + 30);

  ctx.fillStyle = WHITE;
  ctx.shadowBlur = 4;
  ctx.shadowColor = 'rgba(45, 241, 217, 0.16)';
  ctx.font = '14px "Courier New"';

  let textY = PANEL_Y + 75;
  currentData.body.forEach(line => {
    textY = wrapText(ctx, line, PANEL_X + 20, textY, PANEL_W - 40, 24);
    textY += 10;
  });
  ctx.shadowBlur = 0;

  // --- ACTION BUTTONS (CLEAVAGE STATE) ---
  if (state === 'CLEAVAGE') {
    drawButton(PANEL_X + 20, PANEL_Y + PANEL_H - 140, 300, 50, 'NHEJ REPAIR', 'red');
    drawButton(PANEL_X + 20, PANEL_Y + PANEL_H - 70, 300, 50, 'HDR REPAIR', PRIMARY_BLUE);
  }

  if (state === 'CLEAVAGE' || state === 'FIXING') {
    drawRepairActors(state === 'FIXING' ? repair_choice : null, stateTimer, time);
  }

  // --- NAV BUTTONS (BOTTOM) ---
  drawButton(30, 620, 140, 50, 'SCAN', state === 'SCANNING' ? PRIMARY_BLUE : 'grey');
  drawButton(180, 620, 140, 50, 'BIND', state === 'BINDING' ? PRIMARY_BLUE : 'grey');
  drawButton(330, 620, 140, 50, 'CUT', state === 'CLEAVAGE' ? PRIMARY_BLUE : 'grey');

  requestAnimationFrame(draw);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line ? `${line} ${words[n]}` : words[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = words[n];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

function drawRepairActors(choice, stateTimer, time) {
  const targetX = 500;
  const targetY = 360;
  const breakY = 100 + 9 * 30;
  const breakRot = time + 9 * 0.4;
  const sin = Math.sin(breakRot);
  const leftX = targetX + sin * 60;
  const rightX = targetX - sin * 60;
  const gap = show_break ? (state === 'FIXING' ? 50 - (repair_progress / 2) : 50) : 0;
  const midX = (leftX + rightX) / 2;

  // Draw actual break spark at the helix center
  if (show_break) {
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = 'rgba(255, 120, 80, 0.9)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4 + time * 1.8;
      const radius = 18 + Math.sin(time * 6 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(midX, breakY);
      ctx.lineTo(midX + Math.cos(angle) * radius, breakY + Math.sin(angle) * radius);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255, 210, 110, 0.98)';
    ctx.beginPath();
    ctx.arc(midX, breakY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw active cutting enzyme near the break site
  drawEnzymeIcon(targetX + 110, breakY - 80, ENZYME_COLOR, time, 'CAS9');

  if (choice === 'NHEJ') {
    for (let i = 0; i < 5; i++) {
      const progress = Math.min(1, stateTimer / 2 + i * 0.08);
      const sx = 140 + (targetX - 140) * progress;
      const sy = 240 + i * 24 + Math.sin(time * 3 + i) * 5;
      ctx.fillStyle = 'rgba(255, 190, 70, 0.95)';
      ctx.beginPath(); ctx.arc(sx, sy, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255, 230, 160, 0.95)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx, sy, 15, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(sx - 10, sy + 16, 20, 4);
    }
    ctx.fillStyle = WHITE;
    ctx.font = '13px "Courier New"';
    ctx.fillText('NHEJ enzymes approaching', PANEL_X + 20, PANEL_Y + PANEL_H - 168);
  }

  if (choice === 'HDR') {
    const progress = Math.min(1, stateTimer / 2);
    const px = PANEL_X + PANEL_W + 100 - 240 * progress;
    const py = 260;
    const boxW = 120;
    const boxH = 50;
    ctx.fillStyle = 'rgba(0, 210, 255, 0.16)';
    ctx.fillRect(px - boxW / 2, py - boxH / 2, boxW, boxH);
    ctx.strokeStyle = 'rgba(0, 220, 255, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(px - boxW / 2, py - boxH / 2, boxW, boxH);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = '12px "Courier New"';
    ctx.fillText('HDR donor', px - 26, py + 5);
    ctx.strokeStyle = NEON_TEAL;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px - boxW / 2, py);
    ctx.lineTo(midX, breakY - 10);
    ctx.stroke();
  }
}

function drawEnzymeIcon(x, y, color, time, label) {
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 22, 14, Math.sin(time) * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(x + 6, y - 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = DARK_BG;
  ctx.font = 'bold 12px "Courier New"';
  ctx.fillText(label, x - 16, y + 4);
  ctx.restore();
}

function drawHudExtras() {
  ctx.save();
  ctx.strokeStyle = 'rgba(45, 241, 217, 0.35)';
  ctx.lineWidth = 2;

  // top left mini HUD
  ctx.strokeRect(38, 78, 184, 44);
  ctx.strokeRect(44, 86, 80, 14);
  ctx.strokeRect(44, 108, 120, 10);

  // top center accent
  ctx.beginPath();
  ctx.moveTo(420, 40);
  ctx.lineTo(480, 40);
  ctx.moveTo(520, 40);
  ctx.lineTo(580, 40);
  ctx.stroke();

  // right side small vertical panel
  ctx.beginPath();
  ctx.moveTo(930, 120);
  ctx.lineTo(930, 520);
  for (let i = 0; i < 7; i++) {
    ctx.moveTo(930, 140 + i * 60);
    ctx.lineTo(958, 140 + i * 60);
  }
  ctx.stroke();

  // left helix accent
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(180, 80);
  ctx.lineTo(180, 560);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

function drawButton(x, y, w, h, label, color) {
  // Button glow
  ctx.shadowBlur = 16;
  ctx.shadowColor = color;
  
  // Button background with gradient
  const btnGradient = ctx.createLinearGradient(x, y, x, y + h);
  btnGradient.addColorStop(0, 'rgba(15, 40, 65, 0.96)');
  btnGradient.addColorStop(1, 'rgba(10, 24, 42, 0.96)');
  ctx.fillStyle = btnGradient;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill(); ctx.stroke();
  
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 2, w - 4, h / 2 - 2, 8);
  ctx.fill();
  
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 14px "Courier New"';
  ctx.fillText(label, x + 18, y + h / 2 + 6);
}

draw();


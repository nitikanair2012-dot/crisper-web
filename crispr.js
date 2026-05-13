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
const DARK_BG = '#050A18';
const PRIMARY_BLUE = '#0D3F8B';
const DEEP_RED = '#E51F29';
const VIBRANT_YELLOW = '#FFD23A';
const GLOW_BLUE = '#58B5FF';
const PANEL_BORDER = 'rgba(255, 210, 90, 0.28)';
const PANEL_GLOW = 'rgba(255, 210, 90, 0.14)';
const WHITE = '#FFFFFF';
const GLASS_WHITE = 'rgba(255, 255, 255, 0.08)';
const ENZYME_COLOR = VIBRANT_YELLOW;

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

  // High-tech laboratory background details
  ctx.save();
  ctx.strokeStyle = 'rgba(90, 150, 255, 0.10)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const x = 80 + i * 180;
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, baseHeight - 40);
    ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    const y = 120 + i * 140;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(baseWidth - 40, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 18; i++) {
    const bx = 120 + (i % 6) * 140 + Math.cos(time * 0.5 + i) * 12;
    const by = 90 + Math.floor(i / 6) * 150 + Math.sin(time * 0.7 + i) * 8;
    const radius = 8 + (i % 3) * 3;
    const alpha = 0.08 + Math.abs(Math.sin(time + i * 0.9)) * 0.12;
    ctx.fillStyle = `rgba(80, 170, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(bx, by, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  drawHudExtras();

  // Add subtle glow particles for bloom
  for (let i = 0; i < 14; i++) {
    const px = Math.sin(time * 0.35 + i * 1.1) * 320 + 500;
    const py = Math.cos(time * 0.55 + i * 0.9) * 220 + 350;
    const alpha = 0.06 + (Math.sin(time + i * 1.2) + 1) * 0.06;
    ctx.fillStyle = `rgba(255, 210, 90, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Title with glow
  ctx.shadowBlur = 20;
  ctx.shadowColor = PRIMARY_BLUE;
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 32px "Audiowide"';
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
  const breakY = 100 + 9 * 30;
  for (let i = 0; i < 18; i++) {
    const y = 100 + i * 30;
    const rot = time * 1.05 + i * 0.4;
    const sin = Math.sin(rot);
    const cos = Math.cos(rot);
    const lx = cx + sin * 76;
    const rx = cx - sin * 76;
const isBreaking = i >= 7 && i <= 10;
  const edgeGap = isBreaking ? 12 + Math.abs(9 - i) * 8 : 0;
  const splitGap = isBreaking ? (state === 'FIXING' ? 120 - repair_progress : 136) : 0;
  const leftX = lx - splitGap * 0.55 - edgeGap;
  const rightX = rx + splitGap * 0.55 + edgeGap;

  ctx.lineWidth = isBreaking ? 6 : 4;
  ctx.strokeStyle = cos > 0 ? DEEP_RED : PRIMARY_BLUE;
  ctx.beginPath();
  ctx.moveTo(leftX, y);
  ctx.lineTo(rightX, y);
  ctx.stroke();

  ctx.fillStyle = cos > 0 ? '#D9362A' : '#1E6FAA';
  ctx.beginPath(); ctx.arc(leftX, y, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(rightX, y, 6, 0, Math.PI * 2); ctx.fill();

    if (!isBreaking) {
      ctx.strokeStyle = VIBRANT_YELLOW;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(lx, y);
      ctx.lineTo(rx, y);
      ctx.stroke();
    }
  }

  if (show_break) {
    ctx.save();
    ctx.shadowBlur = 34;
    ctx.shadowColor = 'rgba(255, 215, 110, 0.65)';
    ctx.fillStyle = 'rgba(255, 245, 210, 0.12)';
    ctx.beginPath();
    ctx.arc(cx, breakY, 72, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 245, 180, 0.95)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 34, breakY - 34);
    ctx.lineTo(cx + 34, breakY + 34);
    ctx.moveTo(cx - 34, breakY + 34);
    ctx.lineTo(cx + 34, breakY - 34);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.font = 'bold 16px "Share Tech Mono"';
    ctx.fillText('DOUBLE-STRAND BREAK', cx - 100, breakY + 72);
    ctx.restore();
  }

  if (state === 'BINDING') {
    ctx.fillStyle = GLOW_BLUE;
    ctx.font = 'bold 24px "Share Tech Mono"';
    ctx.fillText('TARGETING AND BINDING', 520, 120);
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

  ctx.fillStyle = VIBRANT_YELLOW;
  ctx.font = 'bold 18px "Share Tech Mono"';
  ctx.fillText(currentData.title, PANEL_X + 20, PANEL_Y + 30);

  ctx.fillStyle = WHITE;
  ctx.shadowBlur = 4;
  ctx.shadowColor = 'rgba(45, 241, 217, 0.16)';
  ctx.font = '14px "Share Tech Mono"';

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
  const breakY = 100 + 9 * 30;

  if (show_break) {
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = 'rgba(255, 220, 120, 0.9)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4 + time * 1.7;
      const radius = 18 + Math.sin(time * 6 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(targetX, breakY);
      ctx.lineTo(targetX + Math.cos(angle) * radius, breakY + Math.sin(angle) * radius);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255, 245, 200, 0.96)';
    ctx.beginPath();
    ctx.arc(targetX, breakY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawEnzymeIcon(targetX + 110, breakY - 90, ENZYME_COLOR, time, 'CAS9');

  ctx.save();
  ctx.strokeStyle = GLOW_BLUE;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(targetX + 40, breakY - 45);
  ctx.lineTo(430, cas9_pos + 12);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 12px "Share Tech Mono"';
  ctx.fillText('gRNA guide', 360, cas9_pos + 4);
  ctx.restore();

  if (choice === 'NHEJ') {
    for (let i = 0; i < 5; i++) {
      const progress = Math.min(1, stateTimer / 2 + i * 0.08);
      const sx = 140 + (targetX - 140) * progress;
      const sy = 240 + i * 24 + Math.sin(time * 3 + i) * 5;
      ctx.fillStyle = 'rgba(255, 180, 70, 0.92)';
      ctx.beginPath(); ctx.arc(sx, sy, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255, 225, 150, 0.95)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx, sy, 15, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(sx - 10, sy + 16, 20, 4);
    }
    ctx.fillStyle = WHITE;
    ctx.font = '13px "Share Tech Mono"';
    ctx.fillText('NHEJ repair machinery', PANEL_X + 20, PANEL_Y + PANEL_H - 168);
  }

  if (choice === 'HDR') {
    const progress = Math.min(1, stateTimer / 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(PANEL_X + 12, PANEL_Y + 160, 316, 130);
    ctx.strokeStyle = 'rgba(255, 210, 90, 0.25)';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(PANEL_X + 12, PANEL_Y + 160, 316, 130);
    ctx.fillStyle = WHITE;
    ctx.font = '12px "Share Tech Mono"';
    wrapText(ctx, 'HDR donor template is aligned to the cut site', PANEL_X + 24, PANEL_Y + 186, 280, 18);
    drawDonorTemplate(PANEL_X + 20, PANEL_Y + 210);
  }
}

function drawEnzymeIcon(x, y, color, time, label) {
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 22, 14, Math.sin(time) * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.arc(x + 6, y - 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = DARK_BG;
  ctx.font = 'bold 12px "Share Tech Mono"';
  ctx.fillText(label, x - 16, y + 4);
  ctx.restore();
}

function drawDonorTemplate(x = 20, y = 130) {
  const w = 200;
  const h = 100;
  ctx.save();
  ctx.shadowBlur = 22;
  ctx.shadowColor = 'rgba(255, 215, 80, 0.25)';
  ctx.fillStyle = 'rgba(12, 22, 44, 0.96)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 215, 80, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.stroke();
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 13px "Share Tech Mono"';
  ctx.fillText('DONOR TEMPLATE', x + 14, y + 24);
  ctx.font = '12px "Share Tech Mono"';
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.fillText('5\' - A A T C G - 3\'', x + 14, y + 46);
  ctx.fillText('3\' - T T A G C - 5\'', x + 14, y + 66);
  ctx.fillText('for HDR repair', x + 14, y + 88);
  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 210, 90, 0.95)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w - 12, y + h / 2);
  ctx.lineTo(500, 370);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 210, 90, 0.95)';
  ctx.beginPath();
  ctx.moveTo(500, 370);
  ctx.lineTo(492, 362);
  ctx.lineTo(492, 378);
  ctx.fill();
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 12px "Share Tech Mono"';
  ctx.fillText('HDR template', x + 14, y - 8);
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
  ctx.font = 'bold 14px "Share Tech Mono"';
  ctx.fillText(label, x + 18, y + h / 2 + 6);
}

draw();


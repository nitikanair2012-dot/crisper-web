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
  
  // Calculate the scale to map screen pixels back to your 1000x700 logic
  scale = Math.min(rect.width / baseWidth, rect.height / baseHeight);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// COLORS - Your Original Neon/White Theme
const DARK_BG = '#0A0F19';
const PRIMARY_BLUE = '#0099FF';
const WHITE = '#FFFFFF';
const ACCENT_WHITE = '#E3F2FD';
const ENZYME_COLOR = '#FFD700';
const NEON_CYAN = PRIMARY_BLUE;

// YOUR EXPLANATIONS
const SCIENCE_LOG = {
  SCANNING: { title: 'PHASE: TARGETING', body: [
    'The Cas9 protein complex utilizes guide',
    'RNA to scan the genome. It identifies',
    'the target DNA site by locating',
    'complementary base pairs, ensuring',
    'high specificity in the process.']},
  BINDING: { title: 'PHASE: BINDING', body: [
    'Upon finding a matching sequence, the',
    'Cas9 protein undergoes a conformational',
    'change. It unwinds the DNA double helix,',
    'exposing the target strands and',
    'preparing for enzymatic cleavage.']},
  CLEAVAGE: { title: 'PHASE: CLEAVAGE', body: [
    'Cas9 functions as molecular scissors,',
    'inducing a double-strand break (DSB)',
    'at the precise genomic location. This',
    'signals the cell to initiate its',
    'DNA damage response mechanisms.']},
  FIXING: { title: 'PHASE: REPAIRING', body: ['The cell detects the DNA break and','recruits repair machinery to the site.','The chosen pathway will determine the','final genetic outcome, whether through','random mutations or precise editing.']},
  NHEJ: { title: 'RESULT: NHEJ', body: ['Non-Homologous End Joining (NHEJ) is','the primary repair pathway. It ligates','broken DNA ends directly. This is rapid','but error-prone, often resulting in','insertions or deletions (indels).']},
  HDR: { title: 'RESULT: HDR', body: ['Homology-Directed Repair (HDR) uses a','donor DNA template to repair the','break. By following this template,','the cell achieves precise, error-free','gene correction.']}
};

// State
let state = 'SCANNING';
let repair_choice = null;
let repair_progress = 0;
let cas9_pos = 150;
let target_pos = 150;
let show_break = false;

// --- FIXED BUTTON CLICKS ---
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  // Map mouse clicks to your 1000x700 logic space
  const x = (e.clientX - rect.left) / scale;
  const y = (e.clientY - rect.top) / scale;
  
  if (state === 'CLEAVAGE') {
    if (650 < x && x < 950) {
      if (400 < y && y < 450) { state = 'FIXING'; repair_choice = 'NHEJ'; repair_progress = 0; show_break = true; }
      if (470 < y && y < 520) { state = 'FIXING'; repair_choice = 'HDR'; repair_progress = 0; show_break = true; }
    }
  }

  // Nav Buttons (Matches the drawing positions exactly now)
  if (y >= 640 && y <= 700) {
    if (x >= 50 && x < 170) { state = 'SCANNING'; show_break = false; repair_choice = null; repair_progress = 0; }
    else if (x >= 180 && x < 300) { state = 'BINDING'; }
    else if (x >= 310 && x <= 430) { state = 'CLEAVAGE'; show_break = true; }
  }
});

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawHUD(x, y, w, title, body) {
  const h = body.length * 28 + 60;
  ctx.fillStyle = '#141927'; ctx.strokeStyle = NEON_CYAN; ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 10, true, true);
  ctx.fillStyle = NEON_CYAN; ctx.font = '18px "Courier New"'; ctx.fillText(title, x+15, y+35);
  ctx.fillStyle = WHITE; ctx.font = '16px Arial';
  body.forEach((line,i)=> ctx.fillText(line, x+15, y+65 + i*28));
}

function draw() {
  const dpr = window.devicePixelRatio || 1;
  // Apply logic scaling so all coordinates use your 1000x700 system
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  
  ctx.fillStyle = DARK_BG;
  ctx.fillRect(0, 0, baseWidth, baseHeight);
  
  const time_factor = Date.now() * 0.003;
  ctx.fillStyle = NEON_CYAN; ctx.font = '32px "Courier New"';
  const title = 'CRISPR-CAS9 MECHANISM';
  ctx.fillText(title, 500 - ctx.measureText(title).width/2, 50);

  // Logic
  if (state === 'SCANNING') {
    if (Math.random() < 0.02) target_pos = 150 + Math.random()*300;
    cas9_pos += (target_pos - cas9_pos) * 0.05;
  } else if (state === 'FIXING') {
    repair_progress += 1;
    if (repair_progress >= 100) { show_break = false; state = repair_choice; repair_progress = 0; }
  } else {
    cas9_pos += (300 - cas9_pos) * 0.1;
  }

  // --- 3D HELIX (Your Original Depth Logic) ---
  const rotation3d = time_factor * 1.5;
  const helixSegments = [];
  for (let i=0; i<16; i++){
    const y = 150 + i*35;
    const phase = i*0.5;
    const rotX = Math.sin(rotation3d + phase);
    const depth1 = rotX;
    const depth2 = -rotX;
    const scale1 = 0.7 + (depth1 + 1) * 0.15;
    const scale2 = 0.7 + (depth2 + 1) * 0.15;
    const x1 = Math.sin(time_factor + phase) * 40 * scale1;
    const x2 = Math.sin(time_factor + phase + Math.PI) * 40 * scale2;
    const gap = (show_break && 6<=i && i<=9 && state==='FIXING') ? (40 - (repair_progress*0.4)) : (show_break && ['CLEAVAGE','FIXING'].includes(state) ? 40 : 0);
    helixSegments.push({ i, y, x1, x2, depth1, depth2, scale1, scale2, gap });
  }
  
  // Draw Helix Strands & Bases
  helixSegments.forEach(seg => {
    ctx.lineWidth = 3;
    const center_x = 500;
    // Connect strands
    ctx.strokeStyle = seg.depth1 > 0 ? PRIMARY_BLUE : 'rgba(0,153,255,0.3)';
    if (!(show_break && seg.gap > 5)) {
      ctx.beginPath(); ctx.moveTo(center_x + seg.x1 - seg.gap, seg.y); ctx.lineTo(center_x + seg.x2 + seg.gap, seg.y); ctx.stroke();
    }
    // Nucleotides
    ctx.fillStyle = seg.depth1 > 0 ? WHITE : 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.arc(center_x + seg.x1 - seg.gap, seg.y, 6 * seg.scale1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = seg.depth2 > 0 ? WHITE : 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.arc(center_x + seg.x2 + seg.gap, seg.y, 6 * seg.scale2, 0, Math.PI*2); ctx.fill();
  });

  // --- REPAIR ANIMATION ---
  if (state==='FIXING'){
    const ez_offset = 300 - (repair_progress*3);
    ctx.fillStyle = ENZYME_COLOR;
    ctx.beginPath(); ctx.arc(500 - ez_offset, 350, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(500 + ez_offset, 350, 8, 0, Math.PI*2); ctx.fill();
  }

  // --- CAS9 PROTEIN (Your 3D Scissor Blades) ---
  ctx.save();
  ctx.translate(440, cas9_pos);
  ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.beginPath(); ctx.arc(60, 60, 40, 0, Math.PI*2); ctx.fill();
  if (state !== 'SCANNING'){
    const spin = Math.sin(time_factor*2)*10;
    ctx.strokeStyle = WHITE; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(50+spin, 40); ctx.lineTo(50-spin, 80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(70+spin, 40); ctx.lineTo(70-spin, 80); ctx.stroke();
  }
  ctx.fillStyle = WHITE; ctx.font = '16px Arial'; ctx.fillText('Cas9 Protein', 0, -10);
  ctx.restore();

  // --- UI & BUTTONS ---
  if (state === 'CLEAVAGE'){
    [[400,'1. CLICK HERE: NHEJ'],[470,'2. CLICK HERE: HDR']].forEach(([rect_y,label])=>{
      ctx.fillStyle = '#1565C0'; ctx.strokeStyle = WHITE;
      roundRect(ctx, 650, rect_y, 300, 50, 8, true, true);
      ctx.fillStyle = WHITE; ctx.font = '16px "Courier New"'; ctx.fillText(label, 665, rect_y + 32);
    });
  }

  const current_key = (repair_choice && state !== 'FIXING') ? repair_choice : state;
  const data = SCIENCE_LOG[current_key] || SCIENCE_LOG['SCANNING'];
  drawHUD(50, 380, 350, data.title, data.body);

  // Navigation Bar
  const navs = [{l:'Scan',x:50},{l:'Bind',x:180},{l:'Cut',x:310}];
  navs.forEach(n => {
    ctx.fillStyle = '#1565C0'; ctx.strokeStyle = WHITE;
    roundRect(ctx, n.x, 650, 120, 40, 8, true, true);
    ctx.fillStyle = WHITE; ctx.font = '14px "Courier New"'; ctx.fillText(n.l, n.x + 15, 675);
  });

  requestAnimationFrame(draw);
}
draw();
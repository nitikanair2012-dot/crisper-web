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

// --- FIXED INPUT HANDLING ---
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  
  // Calculate EXACT logical coordinates (0-1000)
  const x = (e.clientX - rect.left) / scale;
  const y = (e.clientY - rect.top) / scale;
  
  // Nav buttons logic
  if (y > 620) {
    if (x > 30 && x < 170) { state = 'SCANNING'; show_break = false; repair_choice = null; }
    else if (x > 180 && x < 320) { state = 'BINDING'; }
    else if (x > 330 && x < 470) { state = 'CLEAVAGE'; show_break = true; }
  }
  
  // Repair choices logic
  if (state === 'CLEAVAGE' && x > 600 && x < 950) {
    if (y > 380 && y < 440) { state = 'FIXING'; repair_choice = 'NHEJ'; repair_progress = 0; }
    if (y > 460 && y < 520) { state = 'FIXING'; repair_choice = 'HDR'; repair_progress = 0; }
  }
});

function draw() {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);

  const time = Date.now() * 0.002;
  const currentData = SCIENCE_LOG[state] || SCIENCE_LOG.SCANNING;

  // Background with gradient
  const gradient = ctx.createLinearGradient(0, 0, baseWidth, baseHeight);
  gradient.addColorStop(0, DARK_BG);
  gradient.addColorStop(0.5, '#0A1525');
  gradient.addColorStop(1, DARK_BG);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, baseWidth, baseHeight);
  
  // Add some glowing particles
  for (let i = 0; i < 20; i++) {
    const px = Math.sin(time * 0.5 + i) * 200 + 500;
    const py = Math.cos(time * 0.3 + i) * 150 + 350;
    const alpha = (Math.sin(time + i) + 1) * 0.3;
    ctx.fillStyle = `rgba(0, 180, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
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

  ctx.fillStyle = 'rgba(20, 30, 50, 0.9)';
  ctx.strokeStyle = PRIMARY_BLUE;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.shadowColor = PRIMARY_BLUE;
  ctx.beginPath();
  ctx.roundRect(30, 350, 450, 300, 15);
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = PRIMARY_BLUE;
  ctx.font = 'bold 20px "Courier New"';
  ctx.fillText(currentData.title, 50, 390);
  ctx.fillStyle = WHITE;
  ctx.shadowBlur = 5;
  ctx.shadowColor = PRIMARY_BLUE;
  ctx.font = '16px "Courier New"';
  currentData.body.forEach((line, idx) => {
    ctx.fillText(line, 50, 430 + idx * 25);
  });
  ctx.shadowBlur = 0;

  // --- ACTION BUTTONS (CLEAVAGE STATE) ---
  if (state === 'CLEAVAGE') {
    drawButton(600, 380, 350, 60, 'TRIGGER NHEJ REPAIR', 'red');
    drawButton(600, 460, 350, 60, 'TRIGGER HDR REPAIR', PRIMARY_BLUE);
  }

  // --- NAV BUTTONS (BOTTOM) ---
  drawButton(30, 620, 140, 50, 'SCAN', state === 'SCANNING' ? PRIMARY_BLUE : 'grey');
  drawButton(180, 620, 140, 50, 'BIND', state === 'BINDING' ? PRIMARY_BLUE : 'grey');
  drawButton(330, 620, 140, 50, 'CUT', state === 'CLEAVAGE' ? PRIMARY_BLUE : 'grey');

  requestAnimationFrame(draw);
}

function drawButton(x, y, w, h, label, color) {
  // Button glow
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  
  // Button background with gradient
  const btnGradient = ctx.createLinearGradient(x, y, x, y + h);
  btnGradient.addColorStop(0, 'rgba(255,255,255,0.1)');
  btnGradient.addColorStop(1, 'rgba(255,255,255,0.05)');
  ctx.fillStyle = btnGradient;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill(); ctx.stroke();
  
  // Button highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 2, w - 4, h/2 - 2, 6);
  ctx.fill();
  
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 16px "Courier New"';
  ctx.fillText(label, x + 20, y + h/2 + 6);
}

draw();


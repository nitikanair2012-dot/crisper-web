// Converted from pygame sketch to HTML Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width, HEIGHT = canvas.height;

// COLORS
const DARK_BG = '#0A0F19';
const NEON_CYAN = '#00FFFF';
const WHITE = '#DCDCDC';
const BUTTON_COLOR = '#323C5A';
const HIGHLIGHT = '#64C8FF';
const ENZYME_COLOR = '#FF3232';
const TEMPLATE_COLOR = '#32FF32';

// Fonts
ctx.font = '18px "Courier New"';

// SCIENCE LOG
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

// Input handling
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left; const y = e.clientY - rect.top;
  if (state === 'CLEAVAGE') {
    if (650 < x && x < 950) {
      if (400 < y && y < 450) { state = 'FIXING'; repair_choice = 'NHEJ'; repair_progress = 0; show_break = true; }
      if (470 < y && y < 520) { state = 'FIXING'; repair_choice = 'HDR'; repair_progress = 0; show_break = true; }
    }
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === '1') { state = 'SCANNING'; show_break = false; repair_choice = null; repair_progress = 0 }
  if (e.key === '2') { state = 'BINDING' }
  if (e.key === '3') { state = 'CLEAVAGE'; show_break = true }
});

function drawHUD(x, y, w, title, body) {
  const h = body.length * 28 + 60;
  ctx.fillStyle = '#141927'; ctx.strokeStyle = NEON_CYAN; ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 10, true, false);
  ctx.strokeStyle = NEON_CYAN; ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = NEON_CYAN; ctx.font = '18px "Courier New"'; ctx.fillText(title, x+15, y+35);
  ctx.fillStyle = WHITE; ctx.font = '16px Arial';
  body.forEach((line,i)=> ctx.fillText(line, x+15, y+65 + i*28));
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof r === 'undefined') r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) { ctx.fill(); }
  if (stroke) { ctx.stroke(); }
}

function draw() {
  ctx.fillStyle = DARK_BG; ctx.fillRect(0,0,WIDTH,HEIGHT);
  const time_factor = Date.now() * 0.003;
  // Title
  ctx.fillStyle = NEON_CYAN; ctx.font = '32px "Courier New"';
  const title = 'CRISPR-CAS9 MECHANISM';
  ctx.fillText(title, WIDTH/2 - ctx.measureText(title).width/2, 50);

  // Movement & Logic
  if (state === 'SCANNING') {
    if (Math.random() < 0.02) target_pos = 150 + Math.random()*300;
    cas9_pos += (target_pos - cas9_pos) * 0.05;
  } else if (state === 'FIXING') {
    repair_progress += 1;
    if (repair_progress >= 100) { show_break = false; state = repair_choice; repair_progress = 0 }
  } else {
    cas9_pos += (300 - cas9_pos) * 0.1;
  }

  // Draw Helix
  const center_x = 500;
  for (let i=0;i<16;i++){
    const y = 150 + i*35;
    const phase = i*0.5;
    const x1 = Math.sin(time_factor + phase)*40;
    const x2 = Math.sin(time_factor + phase + Math.PI)*40;
    const gap = (show_break && 6<=i && i<=9 && state==='FIXING') ? (40 - (repair_progress*0.4)) : (show_break && ['CLEAVAGE','FIXING'].includes(state) ? 40 : 0);
    const left_x = center_x + x1 - gap;
    const right_x = center_x + x2 + gap;
    if (!(show_break && gap > 5)) {
      ctx.strokeStyle = WHITE; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(left_x,y); ctx.lineTo(right_x,y); ctx.stroke();
    }
    ctx.fillStyle = NEON_CYAN; ctx.beginPath(); ctx.arc(left_x,y,6,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(right_x,y,6,0,Math.PI*2); ctx.fill();
  }

  // Draw Repair Animation
  if (state==='FIXING'){
    const ez_offset = 300 - (repair_progress*3);
    ctx.fillStyle = ENZYME_COLOR; ctx.beginPath(); ctx.arc(500 - ez_offset,350,8,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(500 + ez_offset,350,8,0,Math.PI*2); ctx.fill();
    if (repair_choice==='HDR'){
      const template_x = 350 + (repair_progress*1.5);
      ctx.fillStyle = TEMPLATE_COLOR; roundRect(ctx, template_x, 330, 80, 20, 5, true, false);
      ctx.fillStyle = TEMPLATE_COLOR; ctx.font = '14px Arial'; ctx.fillText('Donor Template', template_x, 320);
    }
  }

  // Draw Cas9
  ctx.save();
  ctx.translate(440, cas9_pos);
  // semi-transparent outer
  ctx.fillStyle = 'rgba(255,215,0,0.4)'; ctx.beginPath(); ctx.arc(60,60,50,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,215,0,0.8)'; ctx.beginPath(); ctx.arc(60,60,30,0,Math.PI*2); ctx.fill();
  if (state !== 'SCANNING'){
    const spin = Math.sin(time_factor*2)*10;
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(50+spin,40); ctx.lineTo(50-spin,80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(70+spin,40); ctx.lineTo(70-spin,80); ctx.stroke();
  }
  ctx.restore();
  // Protein label
  ctx.fillStyle = WHITE; ctx.font = '16px Arial'; ctx.fillText('Cas9 Protein', 440, cas9_pos - 10);

  const current_key = (repair_choice && state !== 'FIXING') ? repair_choice : state;
  const data = SCIENCE_LOG[current_key] || SCIENCE_LOG['SCANNING'];
  drawHUD(50,400,350,data.title,data.body);

  if (state === 'CLEAVAGE'){
    [[400,'1. CLICK HERE: NHEJ'],[470,'2. CLICK HERE: HDR']].forEach(([rect_y,label])=>{
      ctx.fillStyle = BUTTON_COLOR; roundRect(ctx,650,rect_y,300,50,8,true,false);
      ctx.strokeStyle = HIGHLIGHT; ctx.lineWidth = 2; ctx.strokeRect(650,rect_y,300,50);
      ctx.fillStyle = WHITE; ctx.font='18px "Courier New"'; ctx.fillText(label,660,rect_y+32);
    });
  }

  // Keys box
  ctx.fillStyle = '#1E1E1E'; roundRect(ctx,50,650,400,40,5,true,false);
  ctx.fillStyle = WHITE; ctx.font = '16px "Courier New"'; ctx.fillText('KEYS: [1] Scan | [2] Bind | [3] Cut', 60, 675);

  requestAnimationFrame(draw);
}

draw();

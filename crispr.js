// Converted from pygame sketch to HTML Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const baseWidth = 1000, baseHeight = 700;
let WIDTH = baseWidth, HEIGHT = baseHeight;
let scale = 1;

function resizeCanvas() {
  const wrapper = canvas.parentElement;
  const rect = wrapper.getBoundingClientRect();
  
  // Set canvas resolution - use actual pixel dimensions
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  
  // Calculate scale to fit logical canvas (1000x700) into display area
  const scaleX = rect.width / baseWidth;
  const scaleY = rect.height / baseHeight;
  scale = Math.min(scaleX, scaleY);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
  setTimeout(resizeCanvas, 100);
});

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
  // Convert click coordinates to logical canvas coordinates
  const x = (e.clientX - rect.left) / rect.width * baseWidth;
  const y = (e.clientY - rect.top) / rect.height * baseHeight;
  
  if (state === 'CLEAVAGE') {
    if (650 < x && x < 950) {
      if (400 < y && y < 450) { state = 'FIXING'; repair_choice = 'NHEJ'; repair_progress = 0; show_break = true; }
      if (470 < y && y < 520) { state = 'FIXING'; repair_choice = 'HDR'; repair_progress = 0; show_break = true; }
    }
  }
  // Navigation buttons
  if (650 <= y && y <= 690) {
    if (50 <= x && x <= 170) { state = 'SCANNING'; show_break = false; repair_choice = null; repair_progress = 0; }
    if (180 <= x && x <= 300) { state = 'BINDING'; }
    if (310 <= x && x <= 430) { state = 'CLEAVAGE'; show_break = true; }
  }
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
  // Reset context - account for device pixel ratio
  const dpr = window.devicePixelRatio || 1;
  ctx.resetTransform?.() || ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  // Clear entire physical canvas
  ctx.fillStyle = '#0A0F19';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Apply device pixel ratio and scale
  ctx.scale(dpr, dpr);
  ctx.scale(scale, scale);
  
  // Now draw the logical content at 1000x700 coordinates
  const bgGradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  bgGradient.addColorStop(0, '#0A0F19');
  bgGradient.addColorStop(1, '#1A1F29');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
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

  // Draw Helix with 3D effect
  const center_x = 500;
  const rotation3d = time_factor * 1.5; // Add 3D rotation
  
  // Create gradient for helix
  const helixGradient = ctx.createLinearGradient(0, 150, 0, 150 + 16*35);
  helixGradient.addColorStop(0, '#FFFFFF');
  helixGradient.addColorStop(0.5, '#00FFFF');
  helixGradient.addColorStop(1, '#FFFFFF');
  
  ctx.shadowColor = 'rgba(0,255,255,0.6)'; 
  ctx.shadowBlur = 8;
  
  // Create depth array for sorting (back to front)
  const helixSegments = [];
  for (let i=0;i<16;i++){
    const y = 150 + i*35;
    const phase = i*0.5;
    
    // 3D rotation effect
    const rotX = Math.sin(rotation3d + phase);
    const rotY = Math.cos(rotation3d + phase);
    
    // Calculate depth (z-position)
    const depth1 = rotX;
    const depth2 = -rotX;
    
    // Scale based on depth (perspective)
    const scale1 = 0.7 + (depth1 + 1) * 0.15;
    const scale2 = 0.7 + (depth2 + 1) * 0.15;
    
    // Position with 3D perspective
    const x1 = Math.sin(time_factor + phase) * 40 * scale1;
    const x2 = Math.sin(time_factor + phase + Math.PI) * 40 * scale2;
    
    const gap = (show_break && 6<=i && i<=9 && state==='FIXING') ? (40 - (repair_progress*0.4)) : (show_break && ['CLEAVAGE','FIXING'].includes(state) ? 40 : 0);
    
    const left_x = center_x + x1 - gap;
    const right_x = center_x + x2 + gap;
    
    helixSegments.push({
      i, y, left_x, right_x, depth1, depth2, scale1, scale2, phone_gap: gap, rotX, rotY
    });
  }
  
  // Draw back strands first (negative depth)
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.5;
  for (let seg of helixSegments) {
    if (seg.depth1 < 0) {
      ctx.strokeStyle = '#0066FF';
      ctx.shadowColor = 'rgba(0, 100, 255, 0.4)';
      if (!(show_break && seg.phone_gap > 5)) {
        ctx.beginPath(); ctx.moveTo(seg.left_x, seg.y); ctx.lineTo(seg.left_x + 3, seg.y); ctx.stroke();
      }
    }
    if (seg.depth2 < 0) {
      ctx.strokeStyle = '#0066FF';
      ctx.shadowColor = 'rgba(0, 100, 255, 0.4)';
      if (!(show_break && seg.phone_gap > 5)) {
        ctx.beginPath(); ctx.moveTo(seg.right_x, seg.y); ctx.lineTo(seg.right_x + 3, seg.y); ctx.stroke();
      }
    }
  }
  
  // Draw front strands (positive depth) with full opacity
  ctx.globalAlpha = 1;
  for (let seg of helixSegments) {
    if (seg.depth1 >= 0) {
      ctx.strokeStyle = helixGradient;
      ctx.shadowColor = 'rgba(0,255,255,0.8)';
      if (!(show_break && seg.phone_gap > 5)) {
        ctx.beginPath(); ctx.moveTo(seg.left_x, seg.y); ctx.lineTo(seg.right_x, seg.y); ctx.stroke();
      }
    }
  }
  
  // Draw nucleotides with 3D effect
  for (let seg of helixSegments) {
    const baseRadius = 6 * Math.max(0.5, seg.scale1);
    
    if (seg.depth1 < 0) {
      ctx.fillStyle = 'rgba(0, 100, 255, 0.6)';
    } else {
      ctx.fillStyle = seg.depth1 > 0.3 ? '#00FFFF' : 'rgba(0, 255, 255, 0.8)';
      ctx.shadowColor = 'rgba(0,255,255,0.9)';
      ctx.shadowBlur = 10;
    }
    ctx.beginPath(); ctx.arc(seg.left_x, seg.y, baseRadius, 0, Math.PI*2); ctx.fill();
    
    const baseRadius2 = 6 * Math.max(0.5, seg.scale2);
    if (seg.depth2 < 0) {
      ctx.fillStyle = 'rgba(0, 100, 255, 0.6)';
    } else {
      ctx.fillStyle = seg.depth2 > 0.3 ? '#00FFFF' : 'rgba(0, 255, 255, 0.8)';
      ctx.shadowColor = 'rgba(0,255,255,0.9)';
      ctx.shadowBlur = 10;
    }
    ctx.beginPath(); ctx.arc(seg.right_x, seg.y, baseRadius2, 0, Math.PI*2); ctx.fill();
  }
  
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Draw Repair Animation with 3D effect
  if (state==='FIXING'){
    const repairRotation = time_factor * 2;
    const ez_offset = 300 - (repair_progress*3);
    
    // Left enzyme
    const leftDepth = Math.sin(repairRotation) * 0.5 + 0.5;
    const leftScale = 0.7 + leftDepth * 0.3;
    ctx.shadowColor = 'rgba(255, 50, 50, 0.8)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = `rgba(255, ${50 + leftDepth*100}, ${50 + leftDepth*50}, ${0.5 + leftDepth*0.5})`;
    ctx.beginPath();
    ctx.arc(500 - ez_offset, 350, 8 * leftScale, 0, Math.PI*2);
    ctx.fill();
    
    // Right enzyme
    const rightDepth = Math.cos(repairRotation) * 0.5 + 0.5;
    const rightScale = 0.7 + rightDepth * 0.3;
    ctx.fillStyle = `rgba(255, ${50 + rightDepth*100}, ${50 + rightDepth*50}, ${0.5 + rightDepth*0.5})`;
    ctx.beginPath();
    ctx.arc(500 + ez_offset, 350, 8 * rightScale, 0, Math.PI*2);
    ctx.fill();
    
    if (repair_choice==='HDR'){
      const template_x = 350 + (repair_progress*1.5);
      const templateDepth = Math.sin(time_factor + repair_progress*0.05) * 0.5 + 0.5;
      
      // Template shadow/back
      ctx.fillStyle = `rgba(50, 255, 100, 0.2)`;
      roundRect(ctx, template_x + 3, 330 + 3, 80, 20, 5, true, false);
      
      // Template main
      ctx.shadowColor = `rgba(50, 255, 100, 0.8)`;
      ctx.shadowBlur = 10;
      ctx.fillStyle = `rgba(50, 255, 100, ${0.6 + templateDepth*0.4})`;
      roundRect(ctx, template_x, 330, 80, 20, 5, true, false);
      
      // Template text
      ctx.fillStyle = '#00FF00';
      ctx.font = '12px Arial';
      ctx.fillText('Donor', template_x + 8, 343);
    }
  }

  // Draw Cas9 with 3D effect
  ctx.save();
  ctx.translate(440, cas9_pos);
  
  const cas9Rotation = time_factor;
  const cas9DepthX = Math.sin(cas9Rotation) * 0.4;
  const cas9DepthY = Math.cos(cas9Rotation) * 0.3;
  const cas9Scale = 0.8 + cas9DepthX * 0.2;
  
  ctx.shadowColor = 'rgba(255,215,0,0.9)';
  ctx.shadowBlur = 20;
  
  // Draw layered 3D effect
  // Back layer
  ctx.fillStyle = 'rgba(100, 120, 200, 0.2)';
  ctx.beginPath();
  ctx.arc(60 + 8, 60 + 8, 50 * cas9Scale * 0.9, 0, Math.PI*2);
  ctx.fill();
  
  // Mid layer (outer glow)
  ctx.fillStyle = 'rgba(255,215,0,0.2)';
  ctx.beginPath();
  ctx.arc(60, 60, 50 * cas9Scale, 0, Math.PI*2);
  ctx.fill();
  
  // Main body
  ctx.fillStyle = 'rgba(255,215,0,0.7)';
  ctx.beginPath();
  ctx.arc(60, 60, 30 * cas9Scale, 0, Math.PI*2);
  ctx.fill();
  
  // Inner highlight
  ctx.fillStyle = 'rgba(255,255,150,0.5)';
  ctx.beginPath();
  ctx.arc(60 - 8, 60 - 8, 12 * cas9Scale, 0, Math.PI*2);
  ctx.fill();
  
  if (state !== 'SCANNING'){
    const spin = Math.sin(time_factor*2)*10;
    const rotZ = time_factor * 3;
    
    // Draw rotating scissor blades with 3D effect
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    // Left blade
    ctx.globalAlpha = 0.7 + Math.abs(Math.cos(rotZ)) * 0.3;
    ctx.beginPath();
    ctx.moveTo(50+spin, 40);
    ctx.lineTo(50-spin, 80);
    ctx.stroke();
    
    // Right blade
    ctx.globalAlpha = 0.7 + Math.abs(Math.sin(rotZ)) * 0.3;
    ctx.beginPath();
    ctx.moveTo(70+spin, 40);
    ctx.lineTo(70-spin, 80);
    ctx.stroke();
    
    ctx.globalAlpha = 1;
  }
  
  ctx.shadowBlur = 0;
  // Protein label
  ctx.fillStyle = WHITE; ctx.font = '16px Arial'; ctx.fillText('Cas9 Protein', 440, cas9_pos - 10);

  // Draw CLEAVAGE buttons BEFORE HUD so they're visible on top
  if (state === 'CLEAVAGE'){
    [[400,'1. CLICK HERE: NHEJ'],[470,'2. CLICK HERE: HDR']].forEach(([rect_y,label],idx)=>{
      const btnRotation = time_factor + idx;
      const btnDepth = Math.sin(btnRotation) * 0.4 + 0.6;
      
      // Button shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      roundRect(ctx,652,rect_y+2,300,50,8,true,false);
      
      // Button gradient with depth
      const btnGradient = ctx.createLinearGradient(650, rect_y, 650, rect_y + 50);
      btnGradient.addColorStop(0, `rgba(50, 60, 90, ${0.6 + btnDepth*0.4})`);
      btnGradient.addColorStop(1, `rgba(30, 37, 57, ${0.6 + btnDepth*0.4})`);
      ctx.fillStyle = btnGradient;
      roundRect(ctx,650,rect_y,300,50,8,true,false);
      
      // Button border glow
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.6 + btnDepth*0.4})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(650,rect_y,300,50);
      
      // Highlight edge for 3D effect
      ctx.strokeStyle = `rgba(150, 220, 255, ${0.3 + btnDepth*0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(652, rect_y+2);
      ctx.lineTo(950, rect_y+2);
      ctx.stroke();
      
      ctx.fillStyle = WHITE;
      ctx.font='16px \"Courier New\"';
      ctx.fillText(label,660,rect_y+32);
    });
  }

  const current_key = (repair_choice && state !== 'FIXING') ? repair_choice : state;
  const data = SCIENCE_LOG[current_key] || SCIENCE_LOG['SCANNING'];
  drawHUD(50,400,350,data.title,data.body);

  // Navigation buttons with 3D effect
  const buttons = [
    { x: 50, y: 650, w: 120, h: 40, label: 'Scan', action: () => { state = 'SCANNING'; show_break = false; repair_choice = null; repair_progress = 0; } },
    { x: 180, y: 650, w: 120, h: 40, label: 'Bind', action: () => { state = 'BINDING'; } },
    { x: 310, y: 650, w: 120, h: 40, label: 'Cut', action: () => { state = 'CLEAVAGE'; show_break = true; } }
  ];
  buttons.forEach((btn, idx) => {
    const navRotation = time_factor + idx * 1.5;
    const navDepth = Math.sin(navRotation) * 0.3 + 0.7;
    
    // Button shadow for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    roundRect(ctx, btn.x + 2, btn.y + 2, btn.w, btn.h, 8, true, false);
    
    // Button gradient
    const btnGradient = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.h);
    btnGradient.addColorStop(0, `rgba(50, 60, 90, ${0.5 + navDepth*0.5})`);
    btnGradient.addColorStop(1, `rgba(30, 37, 57, ${0.5 + navDepth*0.5})`);
    ctx.fillStyle = btnGradient;
    roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 8, true, false);
    
    // Border with glow
    ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 + navDepth*0.5})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
    
    // 3D highlight edge
    ctx.strokeStyle = `rgba(150, 220, 255, ${0.2 + navDepth*0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(btn.x + 2, btn.y + 2);
    ctx.lineTo(btn.x + btn.w - 2, btn.y + 2);
    ctx.stroke();
    
    ctx.fillStyle = WHITE;
    ctx.font = '14px \"Courier New\"';
    ctx.fillText(btn.label, btn.x + 15, btn.y + 25);
  });

  requestAnimationFrame(draw);
}

draw();

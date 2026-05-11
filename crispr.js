// 1. MOBILE SCALING SETUP
const meta = document.createElement('meta');
meta.name = "viewport";
meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
document.head.appendChild(meta);

const style = document.createElement('style');
style.innerHTML = `
  body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0A0F19; font-family: sans-serif; }
  #canvas-container { display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh; }
  canvas { display: block; touch-action: none; -webkit-touch-callout: none; -webkit-user-select: none; }
`;
document.head.appendChild(style);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const baseWidth = 1000, baseHeight = 700;
let scale = 1;

function resize() {
    const dpr = window.devicePixelRatio || 1;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    
    scale = Math.min(screenW / baseWidth, screenH / baseHeight);
    
    canvas.width = baseWidth * dpr * scale;
    canvas.height = baseHeight * dpr * scale;
    canvas.style.width = (baseWidth * scale) + "px";
    canvas.style.height = (baseHeight * scale) + "px";
}

window.addEventListener('resize', resize);
resize();

// 2. DATA & STATE
const SCIENCE_LOG = {
  SCANNING: { title: 'PHASE: TARGETING', body: ['Cas9 scans the genome with guide RNA.', 'Identifies target DNA sequences.']},
  BINDING: { title: 'PHASE: BINDING', body: ['Cas9 unwinds the DNA double helix.', 'Preparing for enzymatic cleavage.']},
  CLEAVAGE: { title: 'PHASE: CLEAVAGE', body: ['Molecular scissors induce a break.', 'Triggers cellular repair response.']},
  FIXING: { title: 'PHASE: REPAIRING', body: ['Cell detects break and recruits repair.', 'Pathway choice determines outcome.']},
  NHEJ: { title: 'RESULT: NHEJ', body: ['GENE EDIT SUCCESS: Mutation Induced.', 'DNA ends ligated via error-prone pathway.']},
  HDR: { title: 'RESULT: HDR', body: ['GENE EDIT SUCCESS: Precise Correction.', 'Template used for error-free repair.']}
};

let state = 'SCANNING', repair_choice = null, repair_progress = 0;
let cas9_pos = 150, target_pos = 150, show_break = false;

// 3. INPUT (Touch + Mouse)
const getCoords = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
};

const handlePress = (e) => {
    const {x, y} = getCoords(e);
    // Navigation
    if (y >= 630 && y <= 700) {
        if (x >= 40 && x < 170) { state = 'SCANNING'; show_break = false; repair_choice = null; }
        else if (x >= 180 && x < 310) { state = 'BINDING'; }
        else if (x >= 320 && x <= 450) { state = 'CLEAVAGE'; show_break = true; }
    }
    // Choices
    if (state === 'CLEAVAGE' && x > 640 && x < 960) {
        if (y > 390 && y < 460) { state = 'FIXING'; repair_choice = 'NHEJ'; repair_progress = 0; }
        if (y > 470 && y < 540) { state = 'FIXING'; repair_choice = 'HDR'; repair_progress = 0; }
    }
};

canvas.addEventListener('mousedown', handlePress);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handlePress(e); }, {passive: false});

// 4. DRAWING
function draw() {
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.fillStyle = '#0A0F19';
    ctx.fillRect(0, 0, baseWidth, baseHeight);
    
    const time = Date.now() * 0.003;

    // 3D Helix
    for (let i=0; i<16; i++) {
        const y = 120 + i*35;
        const rot = time + (i * 0.5);
        const depth = Math.sin(rot);
        const perspective = 0.7 + (depth + 1) * 0.15;
        const x1 = Math.sin(time + i*0.5) * 40 * perspective;
        const x2 = Math.sin(time + i*0.5 + Math.PI) * 40 * perspective;
        const gap = (show_break && i > 6 && i < 10) ? (state === 'FIXING' ? 40 - repair_progress*0.4 : 40) : 0;

        ctx.strokeStyle = depth > 0 ? '#0099FF' : 'rgba(0,153,255,0.3)';
        if (!(show_break && gap > 5)) {
            ctx.beginPath(); ctx.moveTo(500 + x1 - gap, y); ctx.lineTo(500 + x2 + gap, y); ctx.stroke();
        }
        ctx.fillStyle = depth > 0 ? '#FFF' : 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.arc(500 + x1 - gap, y, 6*perspective, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(500 + x2 + gap, y, 6*perspective, 0, Math.PI*2); ctx.fill();
    }

    // Logic updates
    if (state === 'SCANNING') {
        if (Math.random() < 0.02) target_pos = 150 + Math.random()*300;
        cas9_pos += (target_pos - cas9_pos) * 0.05;
    } else if (state === 'FIXING') {
        repair_progress += 1;
        if (repair_progress >= 100) { show_break = false; state = repair_choice; }
    } else {
        cas9_pos += (300 - cas9_pos) * 0.1;
    }

    // Cas9
    ctx.save();
    ctx.translate(440, cas9_pos);
    ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
    ctx.beginPath(); ctx.arc(60, 60, 45, 0, Math.PI*2); ctx.fill();
    if (state !== 'SCANNING') {
        const spin = Math.sin(time*2)*10;
        ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(50+spin, 40); ctx.lineTo(50-spin, 80); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(70+spin, 40); ctx.lineTo(70-spin, 80); ctx.stroke();
    }
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 16px Arial'; ctx.fillText('Cas9 Protein', 10, -10);
    ctx.restore();

    // HUD + REPAIR SUCCESS ENDING
    const isEnd = (state === 'NHEJ' || state === 'HDR');
    const data = SCIENCE_LOG[state] || SCIENCE_LOG.SCANNING;
    
    ctx.fillStyle = '#141927'; 
    ctx.strokeStyle = isEnd ? '#00FF00' : '#0099FF'; // Glow green if it's the end
    ctx.lineWidth = 3;
    
    // Draw Box
    ctx.beginPath();
    ctx.roundRect(50, 400, 350, 180, 10);
    ctx.fill(); ctx.stroke();
    
    ctx.fillStyle = isEnd ? '#00FF00' : '#0099FF';
    ctx.font = 'bold 18px "Courier New"'; 
    ctx.fillText(data.title, 70, 435);
    
    ctx.fillStyle = '#FFF'; 
    ctx.font = '15px Arial';
    data.body.forEach((l, i) => ctx.fillText(l, 70, 465 + i*28));

    if (isEnd) {
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('--- SIMULATION COMPLETE ---', 70, 560);
    }

    // Buttons
    if (state === 'CLEAVAGE') {
        [['1. TRIGGER NHEJ', 400], ['2. TRIGGER HDR', 480]].forEach(([txt, y]) => {
            ctx.fillStyle = '#1565C0'; ctx.strokeStyle = '#FFF';
            ctx.beginPath(); ctx.roundRect(650, y, 300, 55, 8); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#FFF'; ctx.font = 'bold 16px "Courier New"';
            ctx.fillText(txt, 675, y + 35);
        });
    }

    const navs = [['SCAN', 50], ['BIND', 190], ['CUT', 330]];
    navs.forEach(([l, x]) => {
        ctx.fillStyle = '#1565C0'; ctx.strokeStyle = '#FFF';
        ctx.beginPath(); ctx.roundRect(x, 640, 120, 45, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FFF'; ctx.font = 'bold 14px "Courier New"';
        ctx.fillText(l, x+22, 668);
    });

    requestAnimationFrame(draw);
}
draw();
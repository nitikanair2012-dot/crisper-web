const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const baseWidth = 1000, baseHeight = 700;
let scale = 1;

function resizeCanvas() {
  const wrapper = canvas.parentElement;
  const rect = wrapper.getBoundingClientRect();
  
  const dpr = window.devicePixelRatio || 1;
  // Set physical resolution
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  
  // Logical scale (how much we shrink/grow 1000x700 to fit the screen)
  const scaleX = rect.width / baseWidth;
  const scaleY = rect.height / baseHeight;
  scale = Math.min(scaleX, scaleY);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Input handling - FIXED coordinate math
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  
  // Calculate exactly where on the 1000x700 map the user clicked
  // This accounts for both CSS scaling and the canvas internal scaling
  const clickX = (e.clientX - rect.left) * (baseWidth / rect.width);
  const clickY = (e.clientY - rect.top) * (baseHeight / rect.height);
  
  // Debug (Optional): console.log(clickX, clickY);

  // 1. Logic for NHEJ/HDR Selection buttons
  if (state === 'CLEAVAGE') {
    if (clickX >= 650 && clickX <= 950) {
      if (clickY >= 400 && clickY <= 450) { 
          state = 'FIXING'; repair_choice = 'NHEJ'; repair_progress = 0; show_break = true; 
      } else if (clickY >= 470 && clickY <= 520) { 
          state = 'FIXING'; repair_choice = 'HDR'; repair_progress = 0; show_break = true; 
      }
    }
  }

  // 2. Logic for Bottom Navigation buttons (Scan, Bind, Cut)
  // We use the same Y range for all three: 650 to 690
  if (clickY >= 650 && clickY <= 690) {
    if (clickX >= 50 && clickX <= 170) { 
        state = 'SCANNING'; show_break = false; repair_choice = null; repair_progress = 0; 
    }
    else if (clickX >= 180 && clickX <= 300) { 
        state = 'BINDING'; 
    }
    else if (clickX >= 310 && clickX <= 430) { 
        state = 'CLEAVAGE'; show_break = true; 
    }
  }
});

// ... [Keep your COLORS, Fonts, and SCIENCE_LOG constants the same] ...

function draw() {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Clear transformations
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply scaling once for everything
  // This ensures the "Cut" button drawn at 310 is at the same spot the click logic looks for 310
  ctx.scale(dpr * scale, dpr * scale);

  const time_factor = Date.now() * 0.003;
  
  // Background
  const bgGradient = ctx.createLinearGradient(0, 0, 0, baseHeight);
  bgGradient.addColorStop(0, '#0A0F19');
  bgGradient.addColorStop(1, '#1A1F29');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  // [ ... INSERT YOUR HELIX AND CAS9 DRAWING CODE HERE ... ]

  // Navigation buttons - REMOVED the "resetTransform" from inside here
  // because we want them to stay in the 1000x700 coordinate system
  const buttons = [
    { x: 50, y: 650, w: 120, h: 40, label: 'Scan' },
    { x: 180, y: 650, w: 120, h: 40, label: 'Bind' },
    { x: 310, y: 650, w: 120, h: 40, label: 'Cut' }
  ];

  buttons.forEach((btn, idx) => {
    const navDepth = Math.sin(time_factor + idx) * 0.1 + 0.9;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    roundRect(ctx, btn.x + 2, btn.y + 2, btn.w, btn.h, 8, true, false);
    
    ctx.fillStyle = `rgba(30, 37, 57, ${navDepth})`;
    ctx.strokeStyle = `rgba(100, 200, 255, ${navDepth})`;
    roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 8, true, true);
    
    ctx.fillStyle = WHITE;
    ctx.font = '14px "Courier New"';
    ctx.fillText(btn.label, btn.x + 15, btn.y + 25);
  });

  requestAnimationFrame(draw);
}

draw();
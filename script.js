document.addEventListener('DOMContentLoaded', function() {
  const homeBtn = document.getElementById('homeBtn');
  const rolesBtn = document.getElementById('rolesBtn');
  const homePanel = document.getElementById('homePanel');
  const rolesPanel = document.getElementById('rolesPanel');
  const navBtns = document.querySelectorAll('.nav-btn');

  function hidePanels() {
    homePanel.style.display = 'none';
    rolesPanel.style.display = 'none';
    navBtns.forEach(btn => btn.classList.remove('active'));
  }

  homeBtn.addEventListener('click', function() {
    if (homePanel.style.display === 'block') {
      hidePanels();
    } else {
      hidePanels();
      homePanel.style.display = 'block';
      homeBtn.classList.add('active');
    }
  });

  rolesBtn.addEventListener('click', function() {
    if (rolesPanel.style.display === 'block') {
      hidePanels();
    } else {
      hidePanels();
      rolesPanel.style.display = 'block';
      rolesBtn.classList.add('active');
    }
  });

  // Закриття панелей при кліку поза ними
  document.addEventListener('click', function(e) {
    if (!homePanel.contains(e.target) && !rolesPanel.contains(e.target) && !e.target.classList.contains('nav-btn')) {
      hidePanels();
    }
  });
});

// Lava lamp (metaballs) animation for hero section
(function lavaLamp() {
  const canvas = document.getElementById('blob-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = canvas.offsetWidth;
  let height = canvas.height = canvas.offsetHeight;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);

  // Padding for metaballs (so they don't touch the edge)
  const PAD = 0.03; // менше padding

  // Metaball params
  const balls = Array.from({length: 9}, (_, i) => ({
    x: Math.random() * (1 - 2*PAD) + PAD,
    y: Math.random() * (1 - 2*PAD) + PAD,
    r: Math.random() * 0.07 + 0.13,
    dx: (Math.random() - 0.5) * 0.007,
    dy: (Math.random() - 0.5) * 0.007
  }));

  function draw() {
    ctx.clearRect(0, 0, width, height);
    // Metaball field
    const img = ctx.createImageData(width, height);
    const data = img.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let v = 0;
        // Normalized coordinates with padding
        const nx = x / width;
        const ny = y / height;
        for (const b of balls) {
          const dx = (nx - b.x);
          const dy = (ny - b.y);
          v += b.r * b.r / (dx*dx + dy*dy + 0.0007);
        }
        // Threshold for smooth edge
        const t = 0.95; // ближче до 1 для круглих форм
        let alpha = Math.max(0, Math.min(1, (v - t + 0.04) / 0.08));
        // Fade out near edge
        const edgeFade = Math.min(
          1,
          Math.min(
            (nx - PAD) / PAD,
            (1 - PAD - nx) / PAD,
            (ny - PAD) / PAD,
            (1 - PAD - ny) / PAD
          )
        );
        alpha *= Math.max(0, Math.min(1, edgeFade));
        // Color gradient
        const c1 = [0,255,178]; // #00ffb2
        const c2 = [26,92,255]; // #1a5cff
        const mix = (nx + ny) / 2;
        const r = c1[0] * (1-mix) + c2[0] * mix;
        const g = c1[1] * (1-mix) + c2[1] * mix;
        const b = c1[2] * (1-mix) + c2[2] * mix;
        const idx = (y * width + x) * 4;
        data[idx] = r;
        data[idx+1] = g;
        data[idx+2] = b;
        data[idx+3] = alpha * 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    // Move balls
    for (const b of balls) {
      b.x += b.dx;
      b.y += b.dy;
      if (b.x < PAD || b.x > 1 - PAD) b.dx *= -1;
      if (b.y < PAD || b.y > 1 - PAD) b.dy *= -1;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// --- Animated nav underline on scroll ---
(function navUnderlineScroll() {
  const underline = document.querySelector('.nav-underline');
  const homeBtn = document.getElementById('homeBtnNav');
  const rolesBtn = document.getElementById('rolesBtnNav');
  if (!underline || !homeBtn || !rolesBtn) return;

  function getBtnRect(btn) {
    const menuRect = btn.parentElement.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    return {
      left: btnRect.left - menuRect.left,
      width: btnRect.width
    };
  }

  function moveUnderline(left, width) {
    underline.style.left = left + 'px';
    underline.style.width = width + 'px';
  }

  // Initial position
  const homeRect = getBtnRect(homeBtn);
  moveUnderline(homeRect.left, homeRect.width);

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Scroll logic
  function onScroll() {
    const rolesSection = document.getElementById('roles');
    const heroSection = document.getElementById('hero');
    const scrollY = window.scrollY || window.pageYOffset;
    const winH = window.innerHeight;
    const heroBottom = heroSection.getBoundingClientRect().bottom + scrollY;
    const rolesTop = rolesSection.getBoundingClientRect().top + scrollY;
    const winMid = scrollY + winH/2;
    // Прогрес між секціями (0 - home, 1 - roles)
    let t = 0;
    if (winMid <= heroBottom) t = 0;
    else if (winMid >= rolesTop + 60) t = 1;
    else t = (winMid - heroBottom) / (rolesTop + 60 - heroBottom);
    t = Math.max(0, Math.min(1, t));
    // Interpolate underline
    const home = getBtnRect(homeBtn);
    const roles = getBtnRect(rolesBtn);
    const left = lerp(home.left, roles.left, t);
    const width = lerp(home.width, roles.width, t);
    moveUnderline(left, width);
    // Active class
    homeBtn.classList.toggle('active', t < 0.5);
    rolesBtn.classList.toggle('active', t >= 0.5);
  }
  window.addEventListener('scroll', onScroll);
  window.addEventListener('resize', onScroll);
  // Click nav: move underline
  homeBtn.addEventListener('click', () => setTimeout(onScroll, 350));
  rolesBtn.addEventListener('click', () => setTimeout(onScroll, 350));
})();

// --- Custom animated blob cursor ---
(function customCursor() {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;
  let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
  let currX = mouseX, currY = mouseY;
  const speed = 0.18;
  function animate() {
    currX += (mouseX - currX) * speed;
    currY += (mouseY - currY) * speed;
    cursor.style.transform = `translate(${currX}px, ${currY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  // Hide on mobile/touch
  window.addEventListener('touchstart', () => {
    cursor.style.display = 'none';
  }, {once:true});
})(); 
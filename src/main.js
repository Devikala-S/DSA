const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Cursor
if (!prefersReduced) {
  const cursor = document.querySelector('.cursor');
  if (cursor) {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });

    requestAnimationFrame(tick);

    // subtle emphasis on interactive elements
    const interactive = document.querySelectorAll('a, button, input, textarea, select, label');
    interactive.forEach((el) => {
      el.addEventListener('pointerenter', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(1.35)';
      });
      el.addEventListener('pointerleave', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      });
    });
  }
}

// Reveal on scroll (intentional + subtle)
const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
if (!prefersReduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

// Minimal smooth page transitions
const page = document.querySelector('[data-transition]');
const overlay = document.querySelector('.transition');
if (overlay && page && !prefersReduced) {
  const duration = 280;

  const internalLinks = document.querySelectorAll('a[href^="#"], a[data-resume-download]');
  internalLinks.forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return; // for mailto etc

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      overlay.style.transition = `opacity ${duration}ms cubic-bezier(.2,.8,.2,1)`;
      overlay.style.opacity = '1';

      window.setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(() => {
          overlay.style.opacity = '0';
        }, duration);
      }, duration);
    });
  });
}

// Mobile menu toggle
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('navMenu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on link click
  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Typing effect for hero line (subtle, accessibility-aware)
if (!prefersReduced) {
  const typingEl = document.querySelector('[data-typing]');
  if (typingEl) {
    const fullText = typingEl.textContent.trim();

    const charDelay = 14;
    const startDelay = 350;
    const holdFull = 1200;
    const holdEmpty = 350;

    let i = 0;
    let deleting = false;

    typingEl.textContent = '';

    const loopTick = () => {
      if (!fullText) return;

      if (!deleting) {
        i += 1;
        typingEl.textContent = fullText.slice(0, i);

        if (i >= fullText.length) {
          deleting = true;
          window.setTimeout(loopTick, holdFull);
          return;
        }
      } else {
        i -= 1;
        typingEl.textContent = fullText.slice(0, Math.max(0, i));

        if (i <= 0) {
          deleting = false;
          window.setTimeout(loopTick, holdEmpty);
          return;
        }
      }

      window.setTimeout(loopTick, charDelay);
    };

    window.setTimeout(loopTick, startDelay);
  }
}








// Profile bubble burst effect (premium glass burst)
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const img = document.getElementById('profileImage');
  if (!img) return;

  const bg = document.querySelector('.bg');
  if (!bg) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'bubble-canvas';
  bg.appendChild(canvas);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const DPR = Math.min(2, window.devicePixelRatio || 1);

  let w = 0;
  let h = 0;

  function resize() {
    w = bg.clientWidth || window.innerWidth;
    h = bg.clientHeight || window.innerHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(bg);

  // Accent palette (gold/white/soft amber)
  const palette = [
    { r: 201, g: 167, b: 106 }, // gold
    { r: 244, g: 245, b: 247 }, // warm white
    { r: 201, g: 167, b: 106 }, // soft amber (same hue family)
  ];

  const bubbles = [];
  const particles = [];
  const smoke = [];

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickColor() {
    const c = palette[(Math.random() * palette.length) | 0];
    return c;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function createBubble(x, y) {
    bubbles.push({
      x,
      y,
      t0: performance.now(),
      r: 4,
      rTarget: rand(34, 58),
      popAt: 0.42,
      phase: 'expand',
    });
  }

  function burst(x, y) {
    const count = Math.floor(rand(40, 61));
    for (let i = 0; i < count; i++) {
      const ang = rand(0, Math.PI * 2);
      const sp = rand(1.6, 5.2);
      const c = pickColor();
      particles.push({
        x,
        y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - rand(0, 0.8),
        ax: 0,
        ay: 0.06,
        size: rand(1.6, 3.2),
        c,
        t0: performance.now(),
        life: rand(18000, 26000),
        sparkle: Math.random() < 0.35,
        driftW: rand(0.8, 1.6),
        driftPhase: rand(0, Math.PI * 2),
      });
    }

    const sCount = Math.floor(rand(10, 16));
    for (let i = 0; i < sCount; i++) {
      const ang = rand(-Math.PI * 0.8, Math.PI * 0.8);
      const sp = rand(0.3, 1.2);
      smoke.push({
        x,
        y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - rand(0.2, 0.6),
        size: rand(10, 18),
        alpha: rand(0.14, 0.28),
        t0: performance.now(),
        life: rand(3200, 5200),
        wobbleA: rand(0.6, 1.2),
        wobbleF: rand(0.006, 0.012),
      });
    }
  }

  function playPop() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ac = new AudioCtx();
      const t = ac.currentTime;

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const noise = ac.createBufferSource();

      const bufferSize = Math.max(1, Math.floor(ac.sampleRate * 0.06));
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      noise.buffer = buffer;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

      osc.connect(gain);
      noise.connect(gain);
      gain.connect(ac.destination);

      osc.start(t);
      noise.start(t);
      osc.stop(t + 0.13);
      noise.stop(t + 0.07);

      window.setTimeout(() => {
        try {
          ac.close();
        } catch (e) {}
      }, 250);
    } catch (e) {}
  }

  function draw(now) {
    ctx.clearRect(0, 0, w, h);

    // particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const age = now - p.t0;
      const t = age / p.life;
      if (t >= 1) {
        particles.splice(i, 1);
        continue;
      }

      p.vx += p.ax;
      p.vy += p.ay;
      p.x += p.vx;
      p.y += p.vy;

      const wave = Math.sin(t * 10 + p.driftPhase) * (p.driftW * 0.45);
      p.x += wave;

      const alpha = (1 - t) * 0.95;
      const { r, g, b } = p.c;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${r},${g},${b},${0.55 * alpha})`;
      ctx.fillStyle = `rgba(${r},${g},${b},${0.55 * alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.sparkle) {
        const s = 2.1 * (1 - t);
        ctx.strokeStyle = `rgba(244,245,247,${0.45 * alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x - s, p.y);
        ctx.lineTo(p.x + s, p.y);
        ctx.moveTo(p.x, p.y - s);
        ctx.lineTo(p.x, p.y + s);
        ctx.stroke();
      }
      ctx.restore();
    }

    // smoke
    for (let i = smoke.length - 1; i >= 0; i--) {
      const s = smoke[i];
      const age = now - s.t0;
      const t = age / s.life;
      if (t >= 1) {
        smoke.splice(i, 1);
        continue;
      }

      const wob = Math.sin(t * 100 + s.wobbleF * age) * s.wobbleA;
      s.x += s.vx;
      s.y += s.vy;
      s.x += wob * 0.05;
      s.vy += 0.01;

      const alpha = s.alpha * (1 - t);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(201,167,106,${alpha})`;
      ctx.filter = 'blur(1.2px)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (1 + t * 0.6), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // bubbles
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      const age = (now - b.t0) / 1000;
      const tExp = Math.min(1, age / b.popAt);
      const eased = easeOutCubic(tExp);
      const r = b.r + (b.rTarget - b.r) * eased;

      if (age >= b.popAt && b.phase !== 'bursted') {
        b.phase = 'bursted';
        burst(b.x, b.y);
      }

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowBlur = 18;
      ctx.shadowColor = 'rgba(201,167,106,0.35)';

      if (b.phase === 'bursted') {
        const rippleT = (age - b.popAt) / 0.2;
        if (rippleT <= 1) {
          const rr = r + rippleT * 26;
          ctx.strokeStyle = `rgba(244,245,247,${0.25 * (1 - rippleT)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(b.x, b.y, rr, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        ctx.filter = 'blur(1.2px)';
        ctx.strokeStyle = 'rgba(255,255,255,0.40)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(255,255,255,${0.08 * (1 - tExp)})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r * 0.72, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (age > 0.85) bubbles.splice(i, 1);
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

  function onBurstClick(evt) {
    const rect = bg.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    createBubble(x, y);
    playPop();
  }

  img.addEventListener('click', onBurstClick, { passive: true });

  const sparkleBtn = document.getElementById('sparkleBtn');
  if (sparkleBtn) {
    sparkleBtn.addEventListener('click', () => {
      // sparkle centered around image for a consistent “bonus” burst
      const rect = img.getBoundingClientRect();
      const x = rect.left + rect.width / 2 - bg.getBoundingClientRect().left;
      const y = rect.top + rect.height / 2 - bg.getBoundingClientRect().top;
      createBubble(x, y);
      // burst sooner for button sparkle
      burst(x, y);
      playPop();
    });
  }
})();


// Contact form: open mail draft in user's email client
// (Recruiter-friendly: message is actually sent to email, no backend required)
const sendBtn = document.querySelector('[data-send-message]');
const hint = document.querySelector('[data-form-hint]');
if (sendBtn && hint) {
  sendBtn.addEventListener('click', () => {
    const form = sendBtn.closest('form');
    const name = form?.querySelector('input[name="name"]')?.value?.trim() || '';
    const email = form?.querySelector('input[name="email"]')?.value?.trim() || '';
    const message = form?.querySelector('textarea[name="message"]')?.value?.trim() || '';

    if (!message) {
      hint.textContent = 'Please write a message first.';
      return;
    }

    const to = (form?.querySelector('a[href^="mailto:"]')?.getAttribute('href') || 'mailto:devikala@example.com').replace('mailto:', '');

    const subject = encodeURIComponent(`Portfolio message from ${name || 'Devikala visitor'}`);
    const body = encodeURIComponent(
      `Name: ${name || '-'}\nEmail: ${email || '-'}\n\nMessage:\n${message}\n`
    );

    // Set hint briefly, then open mail client
    hint.textContent = 'Opening your email client…';

    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });
}







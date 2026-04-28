/* ============================================================
   ANTHEM JEWELS 
   ambient light, magnetic cursor, constellation particles,
   split-text reveal, smooth page transitions, parallax layers
   ============================================================ */

// ===== GLOBAL UTILITY — rand() must be global for sparkle burst =====
function rand(a, b) { return Math.random() * (b - a) + a; }

// ===== MOBILE NAV =====
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
    document.getElementById('navHamburger').classList.toggle('open');
}
function closeMenu() {
    document.getElementById('navLinks').classList.remove('open');
    document.getElementById('navHamburger').classList.remove('open');
}

// ===== AMBIENT MOUSE LIGHT =====
(function() {
    const light = document.createElement('div');
    light.id = 'ambient-light';
    document.body.appendChild(light);

    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let cx = tx, cy = ty;

    document.addEventListener('mousemove', e => {
        tx = e.clientX; ty = e.clientY;
    });

    function animateLight() {
        cx += (tx - cx) * 0.06;
        cy += (ty - cy) * 0.06;
        light.style.left = cx + 'px';
        light.style.top  = cy + 'px';
        requestAnimationFrame(animateLight);
    }
    animateLight();
})();

// ===== ENHANCED CURSOR (magnetic) =====
(function() {
    const cursor = document.getElementById('cursor');
    const ring   = document.getElementById('cursorRing');
    if (!cursor || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top  = my + 'px';
    });

    function animateRing() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(0.7)';
        ring.style.transform   = 'translate(-50%,-50%) scale(0.85)';
    });
    document.addEventListener('mouseup', () => {
        cursor.style.transform = '';
        ring.style.transform   = '';
    });

    function attachCursorHover() {
        document.querySelectorAll('button, a, .gallery-item, .filter-btn, .team-card-new, .value-item').forEach(el => {
            if (el.dataset.cursorBound) return;
            el.dataset.cursorBound = '1';
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-hover');
                ring.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover');
                ring.classList.remove('cursor-hover');
            });
        });
    }
    attachCursorHover();
    setTimeout(attachCursorHover, 800);
})();

// ===== HERO PARTICLE CANVAS — enhanced with constellation lines =====
(function() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    let mouseX = -9999, mouseY = -9999;

    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouseX = e.clientX - r.left;
        mouseY = e.clientY - r.top;
    });

    const TYPES = ['dot', 'cross', 'diamond'];
    // rand() is global — defined at top of file

    function createParticle() {
        const type = TYPES[Math.floor(Math.random() * TYPES.length)];
        return {
            x: rand(0, W), y: rand(0, H),
            ox: 0, oy: 0,
            size: rand(1, type === 'dot' ? 2.5 : 6),
            speedX: rand(-0.12, 0.12),
            speedY: rand(-0.35, -0.08),
            opacity: rand(0.1, 0.65),
            fadeSpeed: rand(0.002, 0.005),
            growing: true,
            maxOpacity: rand(0.3, 0.75),
            type,
            twinkle: Math.random() > 0.45,
            twinkleSpeed: rand(0.008, 0.025),
            twinklePhase: rand(0, Math.PI * 2),
        };
    }

    const isMobile = window.innerWidth <= 768;
    const PARTICLE_COUNT = isMobile ? 55 : 130;
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());

    function drawDiamond(ctx, x, y, s) {
        ctx.beginPath();
        ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.6, y);
        ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.6, y);
        ctx.closePath(); ctx.fill();
    }

    function drawCross(ctx, x, y, s) {
        const h = s * 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
        ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
        ctx.moveTo(x - h, y - h); ctx.lineTo(x + h, y + h);
        ctx.moveTo(x + h, y - h); ctx.lineTo(x - h, y + h);
        ctx.stroke();
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);

        // Draw constellation lines between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p = particles[i], q = particles[j];
                const dx = p.x - q.x, dy = p.y - q.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 110) {
                    const alpha = (1 - dist / 110) * 0.08;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(201,168,76,${alpha})`;
                    ctx.lineWidth = 0.4;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }
        }

        particles.forEach((p, i) => {
            // Twinkle / fade
            if (p.twinkle) {
                p.twinklePhase += p.twinkleSpeed;
                p.opacity = p.maxOpacity * (0.35 + 0.65 * Math.abs(Math.sin(p.twinklePhase)));
            } else {
                if (p.growing) {
                    p.opacity += p.fadeSpeed;
                    if (p.opacity >= p.maxOpacity) p.growing = false;
                } else {
                    p.opacity -= p.fadeSpeed;
                    if (p.opacity <= 0) {
                        particles[i] = createParticle();
                        particles[i].y = H + 10;
                        return;
                    }
                }
            }

            // Subtle mouse repulsion
            const dx = p.x - mouseX, dy = p.y - mouseY;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < 120) {
                const force = (120 - d) / 120;
                p.x += dx / d * force * 1.2;
                p.y += dy / d * force * 1.2;
            }

            p.x += p.speedX;
            p.y += p.speedY;
            if (p.y < -20) { particles[i] = createParticle(); return; }
            if (p.x < -10)  p.x = W + 10;
            if (p.x > W+10) p.x = -10;

            const useWhite = Math.random() > 0.88;
            const gold  = `rgba(201,168,76,${p.opacity})`;
            const white = `rgba(255,255,255,${p.opacity * 0.5})`;
            const color = useWhite ? white : gold;

            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.7;

            if (p.type === 'dot') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                if (p.size > 1.5) {
                    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4.5);
                    grd.addColorStop(0, `rgba(201,168,76,${p.opacity * 0.28})`);
                    grd.addColorStop(1, 'transparent');
                    ctx.beginPath();
                    ctx.fillStyle = grd;
                    ctx.arc(p.x, p.y, p.size * 4.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = color;
                }
            } else if (p.type === 'cross') {
                drawCross(ctx, p.x, p.y, p.size);
            } else {
                drawDiamond(ctx, p.x, p.y, p.size);
            }
        });

        requestAnimationFrame(animate);
    }
    animate();
})();

// ===== PAGE NAVIGATION — with cinematic transition =====
function showPage(name) {
    const outgoing = document.querySelector('.page.active');

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active', 'page-enter'));

    const page = document.getElementById(name);
    page.classList.add('active', 'page-enter');
    setTimeout(() => page.classList.remove('page-enter'), 750);

    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active-link'));
    const navEl = document.getElementById('nav-' + name);
    if (navEl) navEl.classList.add('active-link');

    if (name === 'gallery') {
        renderGallery('all');
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        const allBtn = document.querySelector('.filter-btn');
        if (allBtn) allBtn.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(attachReveal, 300);
    return false;
}

// ===== FORM SUBMIT =====
function submitForm() {
    const fname   = (document.getElementById('fname')?.value || '').trim();
    const lname   = (document.getElementById('lname')?.value || '').trim();
    const phone   = (document.getElementById('phone')?.value || '').trim();
    const email   = (document.getElementById('email')?.value || '').trim();
    const inquiry = document.getElementById('inquiry-type')?.value || '';
    const budget  = document.getElementById('budget')?.value || '';
    const message = (document.getElementById('message')?.value || '').trim();

    if (!fname) { showToast('Please enter your name.', 'error'); return; }
    if (!inquiry && !message) { showToast('Please tell us what you are looking for.', 'error'); return; }

    // Build WhatsApp message
    const parts = [
        'Hi Anthem Jewels! I have an inquiry.',
        '',
        '*Name:* ' + fname + (lname ? ' ' + lname : ''),
        phone   ? '*Phone:* ' + phone   : null,
        email   ? '*Email:* ' + email   : null,
        inquiry ? '*Looking for:* ' + inquiry : null,
        budget  ? '*Budget:* ' + budget  : null,
        message ? '*Message:* ' + message : null,
        '',
        '_Sent via Anthem Jewels website_'
    ].filter(l => l !== null).join('\n');

    const waUrl = 'https://wa.me/918800806032?text=' + encodeURIComponent(parts);

    // Show loading on button
    const btn = document.querySelector('.submit-btn');
    if (btn) { btn.textContent = 'Opening WhatsApp…'; btn.disabled = true; }

    const suc = document.getElementById('form-success');
    if (suc) { suc.style.display = 'block'; }

    setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        ['fname','lname','phone','email','inquiry-type','budget','message'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        if (btn) { btn.textContent = 'Send Inquiry ◆'; btn.disabled = false; }
        setTimeout(() => { if (suc) suc.style.display = 'none'; }, 5000);
    }, 500);
}

// ===== SCROLL TO TOP =====
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
}

// ===== GALLERY DATA — 50 UNIQUE DIAMONDS =====
const diamonds = [
    { id: 1,  name: 'Celestial Round',       cat: 'round',   sub: 'Round Brilliant · 2.10 ct · D/IF',       img: './images/celestial-round-brilliant-cut-diamond-210-carat-d-__1_-removebg-preview.png' },
    { id: 2,  name: 'Classic Solitaire',      cat: 'round',   sub: 'Round Brilliant · 1.50 ct · E/VS2',      img: '' },
    { id: 3,  name: 'Arctic Light',           cat: 'round',   sub: 'Round Brilliant · 3.00 ct · D/VVS1',     img: '' },
    { id: 4,  name: 'Solar Blaze',            cat: 'round',   sub: 'Round Brilliant · 1.75 ct · F/VS1',      img: '' },
    { id: 5,  name: 'Polar Star',             cat: 'round',   sub: 'Round Brilliant · 2.40 ct · E/VVS2',     img: '' },
    { id: 6,  name: 'Ivory Halo',             cat: 'round',   sub: 'Round Brilliant · 1.20 ct · G/VS1',      img: '' },
    { id: 7,  name: 'Zenith Round',           cat: 'round',   sub: 'Round Brilliant · 4.10 ct · D/FL',       img: '' },
    { id: 8,  name: 'Silver Moon',            cat: 'round',   sub: 'Round Brilliant · 0.90 ct · E/VS2',      img: '' },
    { id: 9,  name: 'Nova Spark',             cat: 'round',   sub: 'Round Brilliant · 2.80 ct · F/VVS1',     img: '' },
    { id: 10, name: 'Eternal White',          cat: 'round',   sub: 'Round Brilliant · 1.60 ct · D/IF',       img: '' },
    { id: 11, name: 'Empress Cut',            cat: 'fancy',   sub: 'Princess Cut · 1.80 ct · E/VVS1',        img: '' },
    { id: 12, name: 'Ocean Oval',             cat: 'fancy',   sub: 'Oval Shape · 2.50 ct · G/VS1',           img: '' },
    { id: 13, name: 'Pear Blossom',           cat: 'fancy',   sub: 'Pear Shape · 1.70 ct · F/VS1',           img: '' },
    { id: 14, name: 'Emerald Isle',           cat: 'fancy',   sub: 'Emerald Cut · 3.00 ct · G/VVS1',         img: '' },
    { id: 15, name: 'Marquise Mirage',        cat: 'fancy',   sub: 'Marquise Cut · 2.20 ct · E/VS2',         img: '' },
    { id: 16, name: 'Radiant Dawn',           cat: 'fancy',   sub: 'Radiant Cut · 2.70 ct · D/VVS2',         img: '' },
    { id: 17, name: 'Cushion Cloud',          cat: 'fancy',   sub: 'Cushion Cut · 3.10 ct · F/VS1',          img: '' },
    { id: 18, name: 'Asscher Royale',         cat: 'fancy',   sub: 'Asscher Cut · 1.90 ct · E/VVS1',         img: '' },
    { id: 19, name: 'Trillion Dream',         cat: 'fancy',   sub: 'Trillion Cut · 1.40 ct · G/VS2',         img: '' },
    { id: 20, name: 'Baguette Grace',         cat: 'fancy',   sub: 'Baguette Cut · 0.80 ct · F/VS1',         img: '' },
    { id: 21, name: 'Teardrop Serenity',      cat: 'fancy',   sub: 'Pear Shape · 2.10 ct · D/IF',            img: '' },
    { id: 22, name: 'Princess Aurora',        cat: 'fancy',   sub: 'Princess Cut · 2.60 ct · E/VVS2',        img: '' },
    { id: 23, name: 'Sahara Rose',            cat: 'colored', sub: 'Fancy Pink · 1.20 ct · Intense',          img: '' },
    { id: 24, name: 'Midnight Blue',          cat: 'colored', sub: 'Fancy Blue · 0.90 ct · Vivid',            img: '' },
    { id: 25, name: 'Canary Dream',           cat: 'colored', sub: 'Fancy Yellow · 2.20 ct · VVS1',           img: '' },
    { id: 26, name: 'Forest Green',           cat: 'colored', sub: 'Fancy Green · 1.10 ct · Intense',         img: '' },
    { id: 27, name: 'Blush Eternal',          cat: 'colored', sub: 'Fancy Pink · 0.75 ct · Deep',             img: '' },
    { id: 28, name: 'Cobalt Prince',          cat: 'colored', sub: 'Fancy Blue · 1.50 ct · Deep',             img: '' },
    { id: 29, name: 'Sunset Orange',          cat: 'colored', sub: 'Fancy Orange · 0.65 ct · Vivid',          img: '' },
    { id: 30, name: 'Champagne Glow',         cat: 'colored', sub: 'Fancy Brown · 2.30 ct · Light',           img: '' },
    { id: 31, name: 'Lavender Mist',          cat: 'colored', sub: 'Fancy Purple · 0.55 ct · Intense',        img: '' },
    { id: 32, name: 'Cognac Reserve',         cat: 'colored', sub: 'Fancy Brown · 3.10 ct · Deep',            img: '' },
    { id: 33, name: 'Goldenrod',              cat: 'colored', sub: 'Fancy Yellow · 1.80 ct · Vivid',          img: '' },
    { id: 34, name: 'Rose Lumiere',           cat: 'colored', sub: 'Fancy Pink · 1.40 ct · Vivid',            img: '' },
    { id: 35, name: 'The Koh-i-Noor Reserve', cat: 'rare',    sub: 'Cushion · 5.20 ct · D/Flawless',          img: '' },
    { id: 36, name: 'Eternal Marquise',        cat: 'rare',    sub: 'Marquise Cut · 3.10 ct · F/VVS2',         img: '' },
    { id: 37, name: 'Heart of Eternity',       cat: 'rare',    sub: 'Heart Shape · 1.00 ct · E/VS2',           img: '' },
    { id: 38, name: 'The Regent',              cat: 'rare',    sub: 'Cushion · 8.00 ct · D/IF',                img: '' },
    { id: 39, name: 'Golconda Legacy',         cat: 'rare',    sub: 'Round Brilliant · 6.50 ct · D/FL',        img: '' },
    { id: 40, name: 'The Florentine',          cat: 'rare',    sub: 'Antique Oval · 7.20 ct · E/VVS1',         img: '' },
    { id: 41, name: 'Orlov Star',              cat: 'rare',    sub: 'Rose Cut · 4.80 ct · D/IF',               img: '' },
    { id: 42, name: 'The Darya-i-Nur',        cat: 'rare',    sub: 'Table Cut · 9.10 ct · Fancy Pink',         img: '' },
    { id: 43, name: 'Sancy Reserve',           cat: 'rare',    sub: 'Shield Cut · 3.70 ct · F/VVS1',           img: '' },
    { id: 44, name: "The Idol's Eye",          cat: 'rare',    sub: 'Pear Shape · 5.50 ct · D/FL',             img: '' },
    { id: 45, name: 'Dresden Green',           cat: 'rare',    sub: 'Antique Pear · 4.20 ct · Fancy Green',    img: '' },
    { id: 46, name: 'Hope Heritage',           cat: 'rare',    sub: 'Cushion · 6.00 ct · Fancy Blue',          img: '' },
    { id: 47, name: 'The Steinmetz',           cat: 'rare',    sub: 'Oval · 5.11 ct · Fancy Red',              img: '' },
    { id: 48, name: 'Jubilee Crown',           cat: 'rare',    sub: 'Cushion · 4.50 ct · D/IF',                img: '' },
    { id: 49, name: 'The Agra',               cat: 'rare',    sub: 'Cushion · 3.90 ct · Fancy Pink',           img: '' },
    { id: 50, name: 'Victoria Sovereign',      cat: 'rare',    sub: 'Round · 11.00 ct · D/Flawless',           img: '' },
];

const shapeIcons = {
    round: '⬤', princess: '◼', oval: '⬭', marquise: '◈', cushion: '◆',
    pear: '💧', heart: '♥', emerald: '▬', asscher: '⬛', radiant: '◇',
    trillion: '△', baguette: '▭', default: '◆'
};

const catColors = {
    round:   { bg: 'rgba(232,201,122,0.08)', border: 'rgba(232,201,122,0.25)', icon: '#E8C97A' },
    fancy:   { bg: 'rgba(180,210,255,0.06)', border: 'rgba(180,210,255,0.2)',  icon: '#aaddff' },
    colored: { bg: 'rgba(255,170,200,0.06)', border: 'rgba(255,170,200,0.2)',  icon: '#f4a0c0' },
    rare:    { bg: 'rgba(201,168,76,0.12)',  border: 'rgba(201,168,76,0.4)',   icon: '#C9A84C' },
};

function getShapeFromSub(sub) {
    const s = sub.toLowerCase();
    if (s.includes('round'))    return 'round';
    if (s.includes('princess')) return 'princess';
    if (s.includes('oval'))     return 'oval';
    if (s.includes('marquise')) return 'marquise';
    if (s.includes('cushion'))  return 'cushion';
    if (s.includes('pear'))     return 'pear';
    if (s.includes('heart'))    return 'heart';
    if (s.includes('emerald'))  return 'emerald';
    if (s.includes('asscher'))  return 'asscher';
    if (s.includes('radiant'))  return 'radiant';
    if (s.includes('trillion')) return 'trillion';
    if (s.includes('baguette')) return 'baguette';
    return 'default';
}

function makePlaceholder(d) {
    const c = catColors[d.cat] || catColors.rare;
    const shape = getShapeFromSub(d.sub);
    const icon = shapeIcons[shape] || shapeIcons.default;
    const ct = d.sub.match(/[\d.]+\s*ct/)?.[0] || '';
    const grade = d.sub.match(/[A-Z]\/[A-Z0-9]+/)?.[0] || '';
    const catLabel = { round:'Round Brilliant', fancy:'Fancy Cut', colored:'Colored Diamond', rare:'Rare & Collector' }[d.cat] || '';
    return `
    <div class="placeholder-card" style="background:${c.bg};border-color:${c.border};">
      <div class="placeholder-icon" style="color:${c.icon};">${icon}</div>
      ${ct ? `<div class="placeholder-ct" style="color:${c.icon};">${ct}</div>` : ''}
      ${grade ? `<div class="placeholder-grade">${grade}</div>` : ''}
      <div class="placeholder-cat" style="color:${c.icon};">${catLabel}</div>
    </div>`;
}

function renderGallery(filter = 'all') {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = '';
    const filtered = filter === 'all' ? diamonds : diamonds.filter(d => d.cat === filter);
    filtered.forEach((d, idx) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-cat', d.cat);
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        const content = d.img
            ? `<img src="${d.img}" style="width:100%;height:100%;object-fit:cover;" alt="${d.name}" />`
            : makePlaceholder(d);
        item.innerHTML = `
        <div class="gallery-item-inner">
            ${content}
            <div class="gallery-overlay">
                <div class="gallery-overlay-title">${d.name}</div>
                <div class="gallery-overlay-sub">${d.sub}</div>
            </div>
        </div>`;
        item.onclick = () => openLightbox(d);
        grid.appendChild(item);

        // Staggered entry animation
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, idx * 30);
    });
}

function filterGallery(cat, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Fade out grid, swap, fade in
    const grid = document.getElementById('galleryGrid');
    grid.style.transition = 'opacity 0.25s ease';
    grid.style.opacity = '0';
    setTimeout(() => {
        renderGallery(cat);
        grid.style.opacity = '1';
    }, 250);
}

function openLightbox(d) {
    document.getElementById('lightbox-title').textContent = d.name;
    document.getElementById('lightbox-sub').textContent = d.sub;
    const imgEl = document.getElementById('lightbox-img');
    if (d.img) {
        imgEl.innerHTML = `<img src="${d.img}" style="max-width:280px;max-height:280px;object-fit:contain;" alt="${d.name}" />`;
    } else {
        const c = catColors[d.cat] || catColors.rare;
        const shape = getShapeFromSub(d.sub);
        const icon = shapeIcons[shape] || shapeIcons.default;
        imgEl.innerHTML = `
        <div style="width:220px;height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px dashed rgba(201,168,76,0.3);gap:14px;background:rgba(201,168,76,0.04);">
            <div style="font-size:4.5rem;color:${c.icon};opacity:0.75;filter:drop-shadow(0 0 12px ${c.icon});">${icon}</div>
            <div style="font-size:0.58rem;letter-spacing:0.28em;color:rgba(201,168,76,0.5);text-transform:uppercase;">Photo Coming Soon</div>
        </div>`;
    }
    document.getElementById('lightbox').classList.add('open');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
}

// Close lightbox on backdrop click
document.addEventListener('click', function(e) {
    const lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('open') && e.target === lb) closeLightbox();
});

// ===== PRELOADER =====
window.addEventListener('load', function() {
    setTimeout(function() {
        const pre = document.getElementById('preloader');
        if (pre) {
            pre.classList.add('done');
            setTimeout(() => pre.remove(), 900);
        }
    }, 1500);
});

// ===== NAV SCROLL GLASSMORPHISM =====
(function() {
    const nav = document.querySelector('nav');
    function handleScroll() {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
})();

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

function attachReveal() {
    document.querySelectorAll('.feature-card, .value-item, .team-card-new, .contact-info-item, .about-text p, .about-text h2, .gallery-item').forEach(function(el, i) {
        if (!el.classList.contains('reveal')) {
            el.classList.add('reveal');
            if (i % 3 === 1) el.classList.add('reveal-delay-1');
            if (i % 3 === 2) el.classList.add('reveal-delay-2');
            revealObserver.observe(el);
        }
    });
}
attachReveal();
setTimeout(attachReveal, 500);
setTimeout(attachReveal, 1200); // one-time delayed init, MutationObserver handles the rest

// ===== CLICK SPARKLE — gold burst =====
document.addEventListener('click', function(e) {
    const burst = document.createElement('div');
    burst.className = 'sparkle-burst';
    burst.style.left = e.clientX + 'px';
    burst.style.top  = e.clientY + 'px';
    const count = 10;
    for (let i = 0; i < count; i++) {
        const s = document.createElement('span');
        const angle = (360 / count) * i + rand(-15, 15);
        const dist  = 24 + Math.random() * 28;
        const rad   = (angle * Math.PI) / 180;
        s.style.setProperty('--tx', Math.cos(rad) * dist + 'px');
        s.style.setProperty('--ty', Math.sin(rad) * dist + 'px');
        s.style.animationDelay = Math.random() * 0.08 + 's';
        // Vary sparkle color slightly
        s.style.background = Math.random() > 0.5 ? '#C9A84C' : '#E8C97A';
        s.style.width  = (2 + Math.random() * 4) + 'px';
        s.style.height = s.style.width;
        burst.appendChild(s);
    }
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 800);
});

// rand() is defined globally at top of file

// ===== ANIMATED STAT COUNTERS =====
function animateCounters() {
    document.querySelectorAll('.stat-num').forEach(function(el) {
        if (el.dataset.counted) return;
        el.dataset.counted = '1';
        const text = el.textContent.trim();
        const match = text.match(/^(\d+)([K+%]*)$/);
        if (!match) return;
        const target = parseInt(match[1]);
        const suffix = match[2] || '';
        let current = 0;
        const duration = 1800;
        const step = duration / target;
        el.classList.add('counting');
        const timer = setInterval(function() {
            current += Math.ceil(target / 70);
            if (current >= target) {
                current = target;
                clearInterval(timer);
                el.classList.remove('counting');
            }
            el.textContent = current + suffix;
        }, Math.max(step, 16));
    });
}

(function() {
    const statsEl = document.querySelector('.hero-stats');
    if (!statsEl) return;
    const obs = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(statsEl);
})();

// ===== 3D TILT EFFECT — feature cards & team cards =====
(function() {
    function addTilt(cards) {
        cards.forEach(function(card) {
            if (card.dataset.tilt) return;
            card.dataset.tilt = '1';
            card.addEventListener('mousemove', function(e) {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width  - 0.5;
                const y = (e.clientY - r.top)  / r.height - 0.5;
                card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(6px)`;
            });
            card.addEventListener('mouseleave', function() {
                card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
                card.style.transform = '';
                setTimeout(() => card.style.transition = '', 500);
            });
            card.addEventListener('mouseenter', function() {
                card.style.transition = 'transform 0.1s ease';
            });
        });
    }

    function initTilt() {
        addTilt(document.querySelectorAll('.team-card-new'));
        addTilt(document.querySelectorAll('.feature-card'));
    }
    initTilt();
    setTimeout(initTilt, 900);
})();

// ===== 3D DIAMOND — THREE.JS =====
(function() {
    // Load Three.js from CDN then init
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = initDiamond3D;
    document.head.appendChild(script);

    function initDiamond3D() {
        const canvas = document.getElementById('diamondCanvas3d');
        if (!canvas) return;

        const W = 440, H = 440;
        canvas.width  = W;
        canvas.height = H;

        // Scene
        const scene    = new THREE.Scene();
        const camera   = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
        camera.position.set(0, 0, 4.2);

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        // ---- BUILD BRILLIANT-CUT DIAMOND GEOMETRY ----
        // A brilliant cut has: crown (top), girdle (middle ring), pavilion (bottom)
        const goldColor  = new THREE.Color(0xC9A84C);
        const goldLight  = new THREE.Color(0xE8C97A);
        const goldDark   = new THREE.Color(0x8a6f2e);
        const white      = new THREE.Color(0xffffff);

        const group = new THREE.Group();

        // Helper: build a faceted cone-like shape using BufferGeometry triangles
        function buildDiamondGeometry() {
            const vertices = [];
            const colors   = [];

            const segments = 8; // octagonal brilliant cut
            const R  = 1.0;    // girdle radius
            const cr = 0.65;   // crown top radius (table)
            const crownH  =  0.55;  // crown height above girdle
            const pavH    = -1.05;  // pavilion bottom (culet)
            const girdleY =  0.0;
            const tableY  =  crownH;
            const culetY  =  pavH;
            const girdleThick = 0.06; // thin girdle band

            // Girdle ring points (top and bottom of girdle band)
            const gTop = [], gBot = [];
            for (let i = 0; i < segments; i++) {
                const a = (i / segments) * Math.PI * 2;
                gTop.push(new THREE.Vector3(Math.cos(a) * R, girdleY + girdleThick, Math.sin(a) * R));
                gBot.push(new THREE.Vector3(Math.cos(a) * R, girdleY - girdleThick, Math.sin(a) * R));
            }

            // Table (flat top octagon)
            const tableVerts = [];
            for (let i = 0; i < segments; i++) {
                const a = (i / segments) * Math.PI * 2;
                tableVerts.push(new THREE.Vector3(Math.cos(a) * cr, tableY, Math.sin(a) * cr));
            }
            const tableCenter = new THREE.Vector3(0, tableY + 0.02, 0);

            // Culet (bottom point)
            const culet = new THREE.Vector3(0, culetY, 0);

            // ---- FACE COLORS ----
            const faceColors = [
                [goldLight, white,   white],    // top crown bright
                [goldColor, goldLight, white],   // crown mid
                [goldColor, goldColor, goldDark], // girdle
                [goldDark,  goldColor, goldColor], // upper pavilion
                [new THREE.Color(0x6a5020), goldDark, goldColor], // lower pavilion dark
            ];

            function pushTri(a, b, c, col1, col2, col3) {
                vertices.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
                colors.push(col1.r, col1.g, col1.b, col2.r, col2.g, col2.b, col3.r, col3.g, col3.b);
            }

            // --- TABLE (top face) ---
            for (let i = 0; i < segments; i++) {
                const next = (i + 1) % segments;
                // Alternate bright/slightly dark for facet effect
                const brightness = i % 2 === 0 ? white : goldLight;
                pushTri(tableCenter, tableVerts[i], tableVerts[next], white, brightness, goldLight);
            }

            // --- CROWN FACETS (table edge -> girdle top) ---
            for (let i = 0; i < segments; i++) {
                const next = (i + 1) % segments;
                const bright = i % 2 === 0 ? goldLight : white;
                const mid    = i % 2 === 0 ? goldColor : goldLight;
                // Main crown kite facet
                pushTri(tableVerts[i], gTop[i], tableVerts[next], bright, goldColor, mid);
                pushTri(tableVerts[next], gTop[i], gTop[next],    mid, goldColor, goldDark);
            }

            // --- GIRDLE BAND ---
            for (let i = 0; i < segments; i++) {
                const next = (i + 1) % segments;
                pushTri(gTop[i], gTop[next], gBot[i],    goldColor, goldLight, goldDark);
                pushTri(gTop[next], gBot[next], gBot[i], goldLight, goldDark, goldColor);
            }

            // --- PAVILION FACETS (girdle bottom -> culet) ---
            for (let i = 0; i < segments; i++) {
                const next = (i + 1) % segments;
                const dark1 = i % 2 === 0 ? goldDark : new THREE.Color(0x6a5020);
                const dark2 = i % 2 === 0 ? new THREE.Color(0x6a5020) : goldDark;
                pushTri(gBot[i], gBot[next], culet, goldColor, goldColor, dark1);
                // Extra half facet for more detail
                const mid3D = new THREE.Vector3(
                    (gBot[i].x + gBot[next].x) * 0.5,
                    (gBot[i].y + gBot[next].y) * 0.5 - 0.25,
                    (gBot[i].z + gBot[next].z) * 0.5
                );
                pushTri(gBot[i], culet, mid3D, goldColor, dark1, dark2);
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors,   3));
            geo.computeVertexNormals();
            return geo;
        }

        const geo = buildDiamondGeometry();
        const mat = new THREE.MeshPhongMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.92,
            shininess: 280,
            specular: new THREE.Color(0xffffff),
            side: THREE.DoubleSide,
        });

        const diamond = new THREE.Mesh(geo, mat);
        group.add(diamond);

        // Inner refraction ghost (slightly smaller, different opacity — gives depth)
        const matInner = new THREE.MeshPhongMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.18,
            shininess: 500,
            specular: new THREE.Color(0xE8C97A),
            side: THREE.FrontSide,
        });
        const inner = new THREE.Mesh(geo, matInner);
        inner.scale.setScalar(0.84);
        group.add(inner);

        scene.add(group);
        group.rotation.x = 0.15; // slight tilt

        // ---- LIGHTS ----
        // Key light (gold warm)
        const keyLight = new THREE.DirectionalLight(0xE8C97A, 2.2);
        keyLight.position.set(3, 4, 3);
        scene.add(keyLight);

        // Fill light (cool white)
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
        fillLight.position.set(-4, 2, 2);
        scene.add(fillLight);

        // Rim light (deep gold from behind)
        const rimLight = new THREE.DirectionalLight(0xC9A84C, 1.4);
        rimLight.position.set(0, -3, -4);
        scene.add(rimLight);

        // Top highlight
        const topLight = new THREE.PointLight(0xffffff, 1.0, 12);
        topLight.position.set(0, 5, 2);
        scene.add(topLight);

        // Ambient
        scene.add(new THREE.AmbientLight(0x8a6f2e, 0.5));

        // ---- SPARKLE PARTICLES ----
        const sparkGeo = new THREE.BufferGeometry();
        const sparkCount = 60;
        const sparkPos = new Float32Array(sparkCount * 3);
        const sparkCol = new Float32Array(sparkCount * 3);
        for (let i = 0; i < sparkCount; i++) {
            const r = 1.4 + Math.random() * 0.8;
            const theta = Math.random() * Math.PI * 2;
            const phi   = Math.random() * Math.PI;
            sparkPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
            sparkPos[i*3+1] = r * Math.cos(phi);
            sparkPos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
            const bright = Math.random();
            sparkCol[i*3]   = bright > 0.5 ? 0.91 : 0.78;
            sparkCol[i*3+1] = bright > 0.5 ? 0.79 : 0.66;
            sparkCol[i*3+2] = bright > 0.5 ? 0.48 : 0.18;
        }
        sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
        sparkGeo.setAttribute('color',    new THREE.BufferAttribute(sparkCol, 3));
        const sparkMat = new THREE.PointsMaterial({
            size: 0.035, vertexColors: true,
            transparent: true, opacity: 0.85, sizeAttenuation: true,
        });
        const sparks = new THREE.Points(sparkGeo, sparkMat);
        scene.add(sparks);

        // ---- MOUSE DRAG ----
        let isDragging = false;
        let prevMouse = { x: 0, y: 0 };
        let velX = 0, velY = 0;
        let autoRotY = 0.008;

        canvas.addEventListener('mousedown', e => {
            isDragging = true;
            prevMouse = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        });
        window.addEventListener('mouseup', () => {
            isDragging = false;
            canvas.style.cursor = 'grab';
        });
        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            const dx = e.clientX - prevMouse.x;
            const dy = e.clientY - prevMouse.y;
            velX = dy * 0.008;
            velY = dx * 0.008;
            prevMouse = { x: e.clientX, y: e.clientY };
        });

        // Touch support
        let prevTouch = null;
        canvas.addEventListener('touchstart', e => {
            prevTouch = e.touches[0];
            isDragging = true;
        }, { passive: true });
        canvas.addEventListener('touchmove', e => {
            if (!prevTouch) return;
            const dx = e.touches[0].clientX - prevTouch.clientX;
            const dy = e.touches[0].clientY - prevTouch.clientY;
            velX = dy * 0.008;
            velY = dx * 0.008;
            prevTouch = e.touches[0];
        }, { passive: true });
        canvas.addEventListener('touchend', () => { isDragging = false; prevTouch = null; });

        canvas.style.cursor = 'grab';

        // ---- ANIMATE ----
        let t = 0;
        function animate() {
            requestAnimationFrame(animate);
            t += 0.012;

            // Auto rotate with inertia
            if (!isDragging) {
                velX *= 0.93;
                velY *= 0.93;
                group.rotation.y += autoRotY + velY;
                group.rotation.x += velX;
            } else {
                group.rotation.y += velY;
                group.rotation.x += velX;
            }

            // Keep X tilt roughly natural
            group.rotation.x = Math.max(-0.7, Math.min(0.7, group.rotation.x));

            // Sparks slowly counter-rotate for halo effect
            sparks.rotation.y -= 0.003;
            sparks.rotation.x  = Math.sin(t * 0.3) * 0.12;

            // Animate sparkle opacity (twinkle)
            sparkMat.opacity = 0.55 + Math.sin(t * 2.1) * 0.3;

            // Animate key light orbit
            keyLight.position.x = Math.cos(t * 0.4) * 3;
            keyLight.position.z = Math.sin(t * 0.4) * 3;
            rimLight.position.x = Math.sin(t * 0.3) * 3;

            // Inner refraction pulse
            inner.scale.setScalar(0.80 + Math.sin(t * 1.8) * 0.05);
            matInner.opacity = 0.12 + Math.sin(t * 2.5) * 0.08;

            renderer.render(scene, camera);
        }
        animate();
    }
})();

// ===== KEYBOARD NAV =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { closeLightbox(); closeGemLightbox(); closeMenu(); }
});

// ===== GALLERY INIT =====
document.addEventListener('DOMContentLoaded', function() {
    renderGallery('all');
});

// ===== RE-TRIGGER COUNTERS ON HOME REVISIT =====
document.querySelectorAll('[onclick*="showPage(\'home\'"]').forEach(function(el) {
    el.addEventListener('click', function() {
        setTimeout(animateCounters, 250);
    });
});

// ===== HERO TITLE SHIMMER (data-text mirror) =====
document.addEventListener('DOMContentLoaded', function() {
    const em = document.querySelector('.hero-title em');
    if (em) em.setAttribute('data-text', em.textContent);
});

// ===== BUTTON RIPPLE — track mouse position for radial gradient =====
(function() {
    function attachRipple() {
        document.querySelectorAll('.btn-gold, .btn-outline, .submit-btn, .filter-btn').forEach(function(btn) {
            if (btn.dataset.rippleBound) return;
            btn.dataset.rippleBound = '1';
            btn.addEventListener('mousemove', function(e) {
                const r = btn.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%';
                const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
                btn.style.setProperty('--rx', x);
                btn.style.setProperty('--ry', y);
            });
        });
    }
    attachRipple();
    setTimeout(attachRipple, 1000);
})();

// ===== MICRO: FORM INPUT CHARACTER SHIMMER =====
(function() {
    document.querySelectorAll('.form-input, .form-textarea').forEach(function(inp) {
        inp.addEventListener('input', function() {
            inp.style.borderColor = inp.value.length > 0 ? 'rgba(201,168,76,0.5)' : '';
        });
        inp.addEventListener('blur', function() {
            if (!inp.value.length) inp.style.borderColor = '';
        });
    });
})();

// (blog stagger removed — no blog page)

// ===== MICRO: TEAM DIAMOND ACCENT SPIN ON CARD HOVER =====
(function() {
    function attachDiamondSpin() {
        document.querySelectorAll('.team-card-new').forEach(function(card) {
            if (card.dataset.diamondSpin) return;
            card.dataset.diamondSpin = '1';
            const accent = card.querySelector('.team-diamond-accent');
            if (!accent) return;
            accent.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), color 0.3s';
            card.addEventListener('mouseenter', function() {
                accent.style.transform = 'rotate(180deg) scale(1.3)';
                accent.style.color = '#E8C97A';
            });
            card.addEventListener('mouseleave', function() {
                accent.style.transform = '';
                accent.style.color = '';
            });
        });
    }
    attachDiamondSpin();
    setTimeout(attachDiamondSpin, 800);
})();

// ===== MICRO: FOOTER BRAND LETTER SPACING RESTORE =====
// (already handled via CSS hover — no JS needed)

// ===== MICRO: WHATSAPP FLOAT TOOLTIP =====
(function() {
    const wa = document.querySelector('.whatsapp-float');
    if (!wa) return;
    const tip = document.createElement('div');
    tip.textContent = 'Chat with us';
    tip.style.cssText = `
        position:absolute; right:68px; top:50%; transform:translateY(-50%);
        background:#1a1a1a; color:#E8C97A; font-family:'Montserrat',sans-serif;
        font-size:0.58rem; letter-spacing:0.1em; padding:7px 14px;
        white-space:nowrap; pointer-events:none; opacity:0;
        transition:opacity 0.3s, right 0.3s; border:1px solid rgba(201,168,76,0.2);
    `;
    wa.style.position = 'fixed';
    wa.appendChild(tip);
    wa.addEventListener('mouseenter', function() {
        tip.style.opacity = '1';
        tip.style.right = '72px';
    });
    wa.addEventListener('mouseleave', function() {
        tip.style.opacity = '0';
        tip.style.right = '68px';
    });
})();

// ===========================
// ===== FEATURE 1: GOLD PAGE WIPE TRANSITION =====

// ===========================
// ===== GOLD PAGE WIPE (called from central showPage) =====
// ===========================
function _triggerPageWipe() {
    const wipe = document.querySelector('.wipe-bar');
    if (wipe) {
        wipe.classList.remove('wipe-active');
        void wipe.offsetWidth;
        wipe.classList.add('wipe-active');
        setTimeout(() => wipe.classList.remove('wipe-active'), 700);
    }
}

// ===========================
// ===== FEATURE 2: CURSOR SPARKLE TRAIL =====
// ===========================
(function() {
    const trail = document.getElementById('cursorTrail');
    if (!trail) return;

    const SYMBOLS = ['✦', '◆', '✧', '◇', '✦', '◈'];
    let lastX = 0, lastY = 0, frameCount = 0;

    document.addEventListener('mousemove', function(e) {
        frameCount++;
        if (frameCount % 3 !== 0) return; // throttle — every 3rd move

        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const speed = Math.sqrt(dx*dx + dy*dy);
        if (speed < 4) return; // only when moving fast enough

        lastX = e.clientX;
        lastY = e.clientY;

        const gem = document.createElement('div');
        gem.className = 'trail-diamond';
        gem.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        gem.style.left = e.clientX + 'px';
        gem.style.top  = e.clientY + 'px';
        gem.style.fontSize = (0.4 + Math.random() * 0.5) + 'rem';
        gem.style.color = Math.random() > 0.4 ? '#C9A84C' : '#E8C97A';
        gem.style.animationDuration = (0.6 + Math.random() * 0.5) + 's';
        gem.style.animationDelay = '0s';
        trail.appendChild(gem);

        gem.addEventListener('animationend', () => gem.remove());
    });
})();

// ===========================
// ===== FEATURE 3: FLOATING DIAMOND PARTICLES ON SCROLL =====
// ===========================
(function() {
    const container = document.createElement('div');
    container.id = 'floatParticles';
    document.body.appendChild(container);

    const GEMS = ['◆', '◇', '✦', '◈', '✧'];
    let lastScroll = 0;
    let scrollVelocity = 0;
    let particlePool = [];

    function spawnGem(count) {
        for (let i = 0; i < count; i++) {
            const gem = document.createElement('div');
            gem.className = 'float-gem';
            gem.textContent = GEMS[Math.floor(Math.random() * GEMS.length)];
            gem.style.left = (5 + Math.random() * 90) + '%';
            gem.style.bottom = '-20px';
            const dur = 4 + Math.random() * 5;
            gem.style.animationDuration = dur + 's';
            gem.style.animationDelay = (Math.random() * 0.8) + 's';
            gem.style.fontSize = (0.4 + Math.random() * 0.7) + 'rem';
            gem.style.color = Math.random() > 0.5 ? '#C9A84C' : '#E8C97A';
            gem.style.opacity = (0.3 + Math.random() * 0.5).toString();
            container.appendChild(gem);
            gem.addEventListener('animationend', () => gem.remove());
        }
    }

    let ticking = false;
    window.addEventListener('scroll', function() {
        const current = window.scrollY;
        scrollVelocity = Math.abs(current - lastScroll);
        lastScroll = current;

        if (!ticking && scrollVelocity > 8) {
            ticking = true;
            requestAnimationFrame(() => {
                const count = Math.min(Math.floor(scrollVelocity / 15) + 1, 4);
                spawnGem(count);
                ticking = false;
            });
        }
    }, { passive: true });
})();

// ===========================
// ===== FEATURE 4: ABOUT PAGE COUNTER ANIMATION =====
// ===========================
(function() {
    function animateAboutCounter(el) {
        if (el.dataset.done) return;
        el.dataset.done = '1';
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        const interval = duration / steps;

        el.style.color = 'var(--gold-light)';
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
                el.style.color = '';
            }
            el.textContent = Math.floor(current) + suffix;
        }, interval);
    }

    const counterObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            entry.target.querySelectorAll('.about-counter-num').forEach(animateAboutCounter);
        });
    }, { threshold: 0.4 });

    function initCounterObs() {
        const section = document.getElementById('aboutCounters');
        if (section && !section.dataset.obsAttached) {
            section.dataset.obsAttached = '1';
            counterObs.observe(section);
        }
    }
    initCounterObs();
    // Also trigger when about page is visited
    setTimeout(initCounterObs, 1000);
})();

// ===========================
// ===== FEATURE 5: DARK / NAVY THEME TOGGLE =====
// ===========================
function toggleTheme() {
    const isNavy = document.body.classList.toggle('theme-navy');
    const icon = document.querySelector('.theme-toggle-icon');
    const btn  = document.getElementById('themeToggle');
    if (icon) icon.style.transform = isNavy ? 'rotate(180deg)' : '';
    localStorage.setItem('anthem-theme', isNavy ? 'navy' : 'black');
}

// Restore saved theme
(function() {
    const saved = localStorage.getItem('anthem-theme');
    if (saved === 'navy') {
        document.body.classList.add('theme-navy');
        const icon = document.querySelector('.theme-toggle-icon');
        if (icon) icon.style.transform = 'rotate(180deg)';
    }
})();

// ===========================
// ===== FEATURE 6: HERO VIDEO BACKGROUND =====
// ===========================
(function() {
    const video = document.getElementById('heroVideo');
    const wrap  = document.getElementById('heroVideoWrap');
    if (!video || !wrap) return;

    // Show video once it can play
    video.addEventListener('canplay', function() {
        wrap.classList.add('loaded');
    });

    // Fallback: show after 3s even if event doesn't fire
    setTimeout(() => wrap.classList.add('loaded'), 3000);
})();

let videoEnabled = true;
function toggleVideo() {
    const video = document.getElementById('heroVideo');
    const wrap  = document.getElementById('heroVideoWrap');
    const label = document.getElementById('videoToggleLabel');
    if (!video) return;

    videoEnabled = !videoEnabled;
    if (videoEnabled) {
        video.play();
        wrap.style.opacity = '';
        if (label) label.textContent = 'Disable Video';
    } else {
        video.pause();
        wrap.style.opacity = '0';
        if (label) label.textContent = 'Enable Video';
    }
}

// ============================================================
// BATCH 3 — ALL NEW FEATURES
// ============================================================

// ===== 1. TESTIMONIALS SLIDER =====
(function() {
    function initTesti() {
        const track = document.getElementById('testimonialsTrack');
        const dotsEl = document.getElementById('testiDots');
        if (!track || !dotsEl || track.dataset.init) return;
        track.dataset.init = '1';

        const cards = track.querySelectorAll('.testi-card');
        let perView = window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 2 : 3;
        let current = 0;
        const total = Math.ceil(cards.length / perView);

        // Build dots
        dotsEl.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const d = document.createElement('div');
            d.className = 'testi-dot' + (i === 0 ? ' active' : '');
            d.onclick = () => goTo(i);
            dotsEl.appendChild(d);
        }

        function goTo(idx) {
            current = Math.max(0, Math.min(idx, total - 1));
            const cardW = cards[0].getBoundingClientRect().width + 28;
            track.style.transform = `translateX(-${current * perView * cardW}px)`;
            dotsEl.querySelectorAll('.testi-dot').forEach((d, i) => {
                d.classList.toggle('active', i === current);
            });
        }

        // Auto advance
        const autoTimer = setInterval(() => goTo((current + 1) % total), 5000);

        // Touch swipe
        let touchStartX = 0;
        track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
        });

        window.addEventListener('resize', () => {
            perView = window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 2 : 3;
            goTo(0);
        });
    }
    initTesti();
    setTimeout(initTesti, 800);
})();

// ===== 2. STICKY QUOTE BAR =====
(function() {
    const bar = document.getElementById('stickyQuoteBar');
    if (!bar) return;
    let shown = false;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 450 && !shown) {
            shown = true;
            bar.classList.add('visible');
        } else if (window.scrollY < 200 && shown) {
            shown = false;
            bar.classList.remove('visible');
        }
    }, { passive: true });
})();

// ===== 3. WHATSAPP PREFILL FROM GALLERY LIGHTBOX =====
// Patch openLightbox to set the WA button href
const _origOpenLightbox = openLightbox;
window.openLightbox = function(d) {
    _origOpenLightbox(d);
    const waBtn = document.getElementById('lightboxWaBtn');
    if (waBtn) {
        const msg = encodeURIComponent(`Hi, I'm interested in the ${d.name} (${d.sub}) from Anthem Jewels. Can you please share more details?`);
        waBtn.href = `https://wa.me/918800806032?text=${msg}`;
    }
    // Randomize viewer count between 1–4
    const vc = document.getElementById('viewersCount');
    if (vc) vc.textContent = Math.floor(Math.random() * 3) + 1;
};

// ===== 4. "CURRENTLY VIEWING" BADGES ON GALLERY CARDS =====
function addViewingBadges() {
    document.querySelectorAll('.gallery-item').forEach(function(item) {
        if (item.dataset.badged) return;
        item.dataset.badged = '1';
        // Only ~40% of cards get a badge
        if (Math.random() > 0.4) return;
        const badge = document.createElement('div');
        badge.className = 'viewing-badge';
        badge.innerHTML = `<span class="viewing-badge-dot"></span>${Math.floor(Math.random() * 3) + 1} viewing`;
        item.querySelector('.gallery-item-inner').appendChild(badge);
    });
}
// Hook into renderGallery
const _origRenderGallery = renderGallery;
window.renderGallery = function(filter) {
    _origRenderGallery(filter);
    setTimeout(addViewingBadges, 400);
};

// ===== 5. MAGNETIC BUTTONS =====
(function() {
    function attachMagnetic() {
        document.querySelectorAll('.btn-gold, .btn-outline, .submit-btn').forEach(function(btn) {
            if (btn.dataset.magnetic) return;
            btn.dataset.magnetic = '1';

            btn.addEventListener('mousemove', function(e) {
                const r = btn.getBoundingClientRect();
                const cx = r.left + r.width  / 2;
                const cy = r.top  + r.height / 2;
                const dx = (e.clientX - cx) * 0.28;
                const dy = (e.clientY - cy) * 0.28;
                btn.style.transform = `translate(${dx}px, ${dy}px)`;
            });

            btn.addEventListener('mouseleave', function() {
                btn.style.transition = 'transform 0.5s var(--ease-spring)';
                btn.style.transform = '';
                setTimeout(() => btn.style.transition = '', 500);
            });

            btn.addEventListener('mouseenter', function() {
                btn.style.transition = 'transform 0.1s ease';
            });
        });
    }
    attachMagnetic();
    setTimeout(attachMagnetic, 1000);
})();

// ===== 6. DIAMOND RAIN ON PRELOADER =====
(function() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const rain = document.createElement('div');
    rain.className = 'preloader-rain';
    preloader.appendChild(rain);

    const GEMS = ['◆', '◇', '✦', '◈', '✧', '◆'];
    let spawned = 0;

    function spawnRainGem() {
        if (spawned > 28) return;
        spawned++;
        const gem = document.createElement('div');
        gem.className = 'rain-gem';
        gem.textContent = GEMS[Math.floor(Math.random() * GEMS.length)];
        gem.style.left = (Math.random() * 100) + '%';
        gem.style.fontSize = (0.5 + Math.random() * 0.9) + 'rem';
        gem.style.color = Math.random() > 0.5 ? '#C9A84C' : '#E8C97A';
        const dur = 1.2 + Math.random() * 1.2;
        gem.style.animationDuration = dur + 's';
        gem.style.animationDelay = (Math.random() * 1.2) + 's';
        rain.appendChild(gem);
        gem.addEventListener('animationend', () => gem.remove());
    }

    const rainInterval = setInterval(spawnRainGem, 80);
    setTimeout(() => clearInterval(rainInterval), 1800);
})();

// ===== 7. HERO TEXT SHIMMER ENHANCEMENT =====
// (already handled via CSS — boost shimmer speed on hover)
(function() {
    const em = document.querySelector('.hero-title em');
    if (!em) return;
    em.addEventListener('mouseenter', function() {
        em.style.animationDuration = '1s';
    });
    em.addEventListener('mouseleave', function() {
        em.style.animationDuration = '';
    });
})();

// ===== 8. SCROLL PARALLAX ON HERO LAYERS =====
(function() {
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function() {
            const s = window.scrollY;
            const bg = document.querySelector('.hero-bg');
            const canvas = document.getElementById('heroCanvas');
            const videoWrap = document.getElementById('heroVideoWrap');
            if (bg)        bg.style.transform        = `translateY(${s * 0.25}px)`;
            if (canvas)    canvas.style.transform    = `translateY(${s * 0.15}px)`;
            if (videoWrap) videoWrap.style.transform = `translateY(${s * 0.2}px)`;
            ticking = false;
        });
    }, { passive: true });
})();

// ===== 9. MOBILE SWIPE BETWEEN PAGES =====
(function() {
    const pages = ['home', 'about', 'gallery', 'gemstones',  'contact'];
    let touchStartX = 0, touchStartY = 0;
    let isSwiping = false;

    // Add swipe hint
    const hint = document.createElement('div');
    hint.className = 'swipe-hint';
    hint.textContent = '← swipe to navigate →';
    document.body.appendChild(hint);

    document.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = false;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);

        // Only horizontal swipes (dx > 110px, more horizontal than vertical)
        if (Math.abs(dx) < 110 || dy > Math.abs(dx) * 0.4) return;

        // Don't trigger on gallery filter or testimonials slider
        if (e.target.closest('.gallery-filter') ||
            e.target.closest('.testimonials-track-wrap') ||
            e.target.closest('.lightbox')) return;

        const activePage = document.querySelector('.page.active');
        if (!activePage) return;
        const currentIdx = pages.indexOf(activePage.id);
        if (currentIdx === -1) return;

        if (dx < 0 && currentIdx < pages.length - 1) {
            showPage(pages[currentIdx + 1]);
        } else if (dx > 0 && currentIdx > 0) {
            showPage(pages[currentIdx - 1]);
        }
    }, { passive: true });
})();

// ===== 10. HAPTIC-STYLE BUTTON FLASH ON MOBILE TAP =====
(function() {
    if (!('ontouchstart' in window)) return;
    document.addEventListener('touchstart', function(e) {
        const btn = e.target.closest('.btn-gold, .btn-outline, .submit-btn, .filter-btn, .sticky-quote-btn');
        if (!btn) return;
        btn.style.transition = 'background 0.05s, color 0.05s, transform 0.05s';
        btn.style.filter = 'brightness(1.3)';
        btn.style.transform = 'scale(0.96)';
        setTimeout(() => {
            btn.style.filter = '';
            btn.style.transform = '';
        }, 120);
    }, { passive: true });
})();

// (Stock badges removed)

// ESC closes gem lightbox too (merged into existing keydown listener above)
// Note: closeLightbox() and closeGemLightbox() are both called from the existing keydown handler

// ===== BIRTHSTONE FINDER =====
function initBirthstone() {
    const container = document.getElementById('birthstoneMonths');
    if (!container || container.dataset.init) return;
    container.dataset.init = '1';
    birthstoneData.forEach((b, i) => {
        const btn = document.createElement('button');
        btn.className = 'birthstone-month-btn';
        btn.style.setProperty('--gem-mc', b.color);
        btn.innerHTML = `<span class="birthstone-month-emoji">${b.emoji}</span><span class="birthstone-month-name">${b.month}</span>`;
        btn.onclick = () => showBirthstone(b, btn);
        container.appendChild(btn);
    });
}

function showBirthstone(b, btn) {
    // Update active button
    document.querySelectorAll('.birthstone-month-btn').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');

    // Update orb colour
    const orb = document.getElementById('birthstoneGemOrb');
    if (orb) {
        orb.style.setProperty('--orb-color', b.color);
        orb.style.background = `radial-gradient(circle at 38% 38%, ${b.color}cc 0%, ${b.color}44 50%, transparent 75%)`;
        orb.style.boxShadow = `0 0 40px ${b.color}55, 0 0 80px ${b.color}22`;
        orb.style.borderColor = `${b.color}66`;
    }
    const emoji = document.getElementById('birthstoneGemEmoji');
    if (emoji) emoji.textContent = b.emoji;

    // Update text fields
    const monthEl = document.getElementById('birthstoneResultMonth');
    if (monthEl) {
        monthEl.textContent = b.month;
        monthEl.style.color = b.color;
    }
    document.getElementById('birthstoneGemName').textContent = b.stone;
    document.getElementById('birthstoneGemFact').textContent = b.fact;

    // Update WhatsApp link
    const wa = document.getElementById('birthstoneWaBtn');
    const msg = encodeURIComponent(`Hi, I'm looking for a ${b.stone} — the birthstone for ${b.month}. Can you help?`);
    wa.href = `https://wa.me/918800806032?text=${msg}`;
    wa.style.setProperty('--btn-glow', b.color + '55');

    // Show result with animation
    const result = document.getElementById('birthstoneResult');
    result.classList.remove('bs-visible');
    void result.offsetWidth; // force reflow
    result.classList.add('bs-visible');
}

// Run initBirthstone on DOMContentLoaded if gemstones page is default
document.addEventListener('DOMContentLoaded', function() { initBirthstone(); });

// ===== TOAST NOTIFICATION (replaces alert()) =====
function showToast(message, type) {
    let toast = document.getElementById('anthem-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'anthem-toast';
        toast.style.cssText = `
            position:fixed; bottom:100px; left:50%; transform:translateX(-50%) translateY(20px);
            background:#1a1a1a; border:1px solid rgba(201,168,76,0.4);
            color:#E8C97A; font-family:'Montserrat',sans-serif;
            font-size:0.65rem; letter-spacing:0.14em; padding:14px 28px;
            z-index:999999; pointer-events:none; opacity:0;
            transition:opacity 0.3s ease, transform 0.3s ease;
            text-align:center; white-space:nowrap;
        `;
        document.body.appendChild(toast);
    }
    if (type === 'error') {
        toast.style.borderColor = 'rgba(255,100,100,0.5)';
        toast.style.color = '#ff8080';
    } else {
        toast.style.borderColor = 'rgba(201,168,76,0.4)';
        toast.style.color = '#E8C97A';
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3500);
}

// ===== CLOSE LIVE CHAT BUBBLE =====
function closeLiveChat() {
    const bubble = document.getElementById('liveChatBubble');
    if (bubble) {
        bubble.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        bubble.style.opacity = '0';
        bubble.style.transform = 'translateY(20px)';
        setTimeout(() => bubble.style.display = 'none', 350);
    }
}

// Auto-show live chat after 8 seconds
setTimeout(function() {
    const bubble = document.getElementById('liveChatBubble');
    if (bubble) {
        bubble.style.display = 'flex';
        setTimeout(() => {
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateY(0)';
        }, 50);
    }
}, 8000);

// ===== BIRTHSTONE DATA =====
const birthstoneData = [
    { month:'January',   stone:'Garnet',      emoji:'🔴', color:'#c0392b', fact:'Deep red garnets symbolise trust, friendship, and protection. Prized since ancient Egypt.' },
    { month:'February',  stone:'Amethyst',    emoji:'💜', color:'#8e44ad', fact:'Regal purple amethyst was once as precious as rubies. A stone of clarity and calm.' },
    { month:'March',     stone:'Aquamarine',  emoji:'🩵', color:'#2980b9', fact:'The colour of tropical seas — sailors carried aquamarine for safe voyages.' },
    { month:'April',     stone:'Diamond',     emoji:'💎', color:'#C9A84C', fact:'April\'s stone is the hardest substance on earth — pure brilliance, formed over billions of years.' },
    { month:'May',       stone:'Emerald',     emoji:'💚', color:'#27ae60', fact:'Cleopatra\'s favourite gem. Colombian emeralds command some of the highest per-carat prices in the world.' },
    { month:'June',      stone:'Pearl',       emoji:'🤍', color:'#bdc3c7', fact:'The only gem created by a living creature — a symbol of purity and wisdom across cultures.' },
    { month:'July',      stone:'Ruby',        emoji:'❤️', color:'#e74c3c', fact:'Burma rubies are the world\'s most valuable coloured stones. The "king of gems" — passion and vitality.' },
    { month:'August',    stone:'Peridot',     emoji:'🟢', color:'#2ecc71', fact:'Formed in volcanic lava and even found in meteorites — one of the few gems born of fire.' },
    { month:'September', stone:'Sapphire',    emoji:'💙', color:'#2c3e9e', fact:'Kashmir sapphires are extraordinarily rare — only mined for a few decades in the 1880s.' },
    { month:'October',   stone:'Opal',        emoji:'🌈', color:'#e67e22', fact:'Each opal contains a unique universe of colour — no two are ever alike.' },
    { month:'November',  stone:'Topaz',       emoji:'🟡', color:'#f39c12', fact:'Imperial topaz in deep orange-gold is among the rarest and most coveted of gemstones.' },
    { month:'December',  stone:'Tanzanite',   emoji:'🔵', color:'#4361ee', fact:'Found only near Mount Kilimanjaro — tanzanite is 1,000 times rarer than diamonds.' },
];

// ===== GEMSTONE GRID DATA =====
const gemstoneItems = [
    // Rubies
    { id:'r1', type:'ruby',        name:'Mogok Pigeon Blood',    origin:'Burma (Mogok)',       weight:'2.18 ct', grade:'AAA Unheated', cert:'GRS',     color:'#e63946', icon:'🔴', note:'No-heat · Pigeon blood colour · GRS "Pigeon Blood" report' },
    { id:'r2', type:'ruby',        name:'Burmese Ruby Oval',     origin:'Burma',               weight:'1.42 ct', grade:'AA Heated',    cert:'GIA',     color:'#e63946', icon:'❤️', note:'Minor heat only · Vivid red · Eye-clean' },
    { id:'r3', type:'ruby',        name:'Mozambique Ruby',       origin:'Mozambique',          weight:'3.05 ct', grade:'AA Unheated',  cert:'Gübelin', color:'#c1121f', icon:'🔴', note:'Unheated · Strong red fluorescence · Collector grade' },
    { id:'r4', type:'ruby',        name:'Vivid Red Cushion',     origin:'Thailand',            weight:'0.88 ct', grade:'A Heated',     cert:'IGI',     color:'#e63946', icon:'❤️', note:'Calibrated size · Excellent for jewellery setting' },
    // Sapphires
    { id:'s1', type:'sapphire',    name:'Kashmir Royal Blue',    origin:'Kashmir',             weight:'1.12 ct', grade:'AAA Unheated', cert:'Gübelin', color:'#2a6be0', icon:'💙', note:'Velvety cornflower blue · Extremely rare Kashmir origin' },
    { id:'s2', type:'sapphire',    name:'Ceylon Cornflower',     origin:'Sri Lanka',           weight:'2.56 ct', grade:'AAA Unheated', cert:'GRS',     color:'#3a86ff', icon:'🔵', note:'Cornflower blue · Sri Lanka · Unheated · Eye-clean' },
    { id:'s3', type:'sapphire',    name:'Royal Blue Oval',       origin:'Madagascar',          weight:'4.10 ct', grade:'AA Heated',    cert:'GIA',     color:'#1d3557', icon:'💙', note:'Deep royal blue · Minor heat · Excellent brilliance' },
    { id:'s4', type:'sapphire',    name:'Padparadscha Sapphire', origin:'Sri Lanka',           weight:'0.95 ct', grade:'AAA Unheated', cert:'GRS',     color:'#f4a261', icon:'🌸', note:'Rare pinkish-orange hue · "Lotus flower" colour · GRS certified' },
    // Emeralds
    { id:'e1', type:'emerald',     name:'Muzo Colombian',        origin:'Colombia (Muzo)',     weight:'1.88 ct', grade:'AAA',          cert:'GRS',     color:'#2d9e5f', icon:'💚', note:'Muzo mine · Minor oil · Vivid green · Top collector grade' },
    { id:'e2', type:'emerald',     name:'Zambian Deep Green',    origin:'Zambia',              weight:'3.20 ct', grade:'AA',           cert:'Gübelin', color:'#1b7a40', icon:'🟢', note:'Deep bluish-green · Insignificant clarity enhancement' },
    { id:'e3', type:'emerald',     name:'Vivid Green Pear',      origin:'Colombia',            weight:'0.92 ct', grade:'A',            cert:'AGL',     color:'#40916c', icon:'💚', note:'Calibrated pear shape · Suitable for pendant setting' },
    // Alexandrite
    { id:'a1', type:'alexandrite', name:'Russian Alexandrite',   origin:'Ural, Russia',        weight:'0.78 ct', grade:'AAA',          cert:'GRS',     color:'#9b5de5', icon:'🔮', note:'Strong colour change: emerald green → raspberry red' },
    { id:'a2', type:'alexandrite', name:'Brazilian Alexandrite', origin:'Brazil',              weight:'1.30 ct', grade:'AA',           cert:'GIA',     color:'#7b2d8b', icon:'💜', note:'Good colour change · Brazilian origin · Eye-clean' },
    // Tanzanite
    { id:'t1', type:'tanzanite',   name:'AAA Tanzanite Oval',    origin:'Tanzania',            weight:'4.55 ct', grade:'AAA',          cert:'IGI',     color:'#4361ee', icon:'🔵', note:'Vivid blue-violet · Top D-block colour · Excellent cutting' },
    { id:'t2', type:'tanzanite',   name:'Deep Violet Tanzanite', origin:'Tanzania',            weight:'2.80 ct', grade:'AA',           cert:'GIA',     color:'#560bad', icon:'💙', note:'Rich violet hue · Merelani Hills · Eye-clean' },
    // Spinel
    { id:'sp1', type:'spinel',     name:'Burma Red Spinel',      origin:'Burma (Mogok)',       weight:'1.62 ct', grade:'AAA',          cert:'GRS',     color:'#d62828', icon:'❤️', note:'Unheated · Vivid red · Mogok · No treatment whatsoever' },
    { id:'sp2', type:'spinel',     name:'Hot Pink Spinel',       origin:'Burma / Vietnam',     weight:'0.95 ct', grade:'AA',           cert:'GIA',     color:'#e91e8c', icon:'💗', note:'Bright pinkish-red · Highly sought for modern jewellery' },
    // Paraiba
    { id:'p1', type:'paraiba',     name:'Brazilian Paraíba',     origin:'Paraíba, Brazil',     weight:'0.55 ct', grade:'AAA',          cert:'GRS',     color:'#00b4d8', icon:'🩵', note:'Neon electric blue · Copper-bearing · Extremely rare · GRS "Paraíba"' },
    { id:'p2', type:'paraiba',     name:'Mozambique Paraíba',    origin:'Mozambique',          weight:'1.10 ct', grade:'AA',           cert:'GIA',     color:'#0077b6', icon:'💙', note:'Vivid blue-green · Larger size · Excellent for statement pieces' },
];

// ===== RENDER GEMSTONE GRID =====
function renderGemGrid(filter) {
    const grid = document.getElementById('gemGrid');
    if (!grid) return;

    const filtered = filter === 'all' ? gemstoneItems : gemstoneItems.filter(g => g.type === filter);
    grid.innerHTML = '';

    filtered.forEach((g, idx) => {
        const card = document.createElement('div');
        card.className = 'gem-card';
        card.style.setProperty('--gem-color', g.color);
        card.style.setProperty('--gem-glow', g.color + '55');
        card.style.setProperty('--gem-bg', g.color + '18');
        card.style.setProperty('--stagger', idx);
        card.innerHTML = `
          <div class="gem-card-visual">
            <div class="gem-card-icon">${g.icon}</div>
          </div>
          <div class="gem-card-body">
            <div class="gem-card-type" style="color:${g.color};">${g.type.charAt(0).toUpperCase()+g.type.slice(1)}</div>
            <div class="gem-card-name">${g.name}</div>
            <div class="gem-card-sub">${g.weight} · ${g.grade}</div>
            <div class="gem-card-origin">${g.origin}</div>
            <div class="gem-cert-badges">
              <span class="gem-cert">${g.cert}</span>
            </div>
          </div>`;
        card.onclick = () => openGemLightbox(g);
        grid.appendChild(card);
    });
}

// ===== FILTER GEMSTONES =====
function filterGemstones(filter, btn) {
    document.querySelectorAll('.gem-swatch').forEach(s => s.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const grid = document.getElementById('gemGrid');
    if (grid) {
        grid.style.opacity = '0';
        grid.style.transition = 'opacity 0.22s ease';
        setTimeout(() => {
            renderGemGrid(filter);
            grid.style.opacity = '1';
        }, 220);
    }
}

// ===== OPEN GEM LIGHTBOX =====
function openGemLightbox(g) {
    document.getElementById('gem-lightbox-visual').innerHTML =
        `<div class="gem-lightbox-visual-inner" style="--gem-c:${g.color};">${g.icon}</div>`;
    document.getElementById('gem-lightbox-title').textContent = g.name;
    document.getElementById('gem-lightbox-sub').textContent   = g.weight + ' · ' + g.origin;
    document.getElementById('gem-lightbox-badges').innerHTML  =
        `<span class="gem-cert" style="border-color:${g.color}66;color:${g.color};">${g.grade}</span>` +
        `<span class="gem-cert">${g.cert} Certified</span>` +
        `<span class="gem-cert">${g.type.toUpperCase()}</span>`;
    document.getElementById('gem-lightbox-details').innerHTML =
        `<div class="gem-detail-item"><div class="gem-detail-key">Origin</div><div class="gem-detail-val">${g.origin}</div></div>` +
        `<div class="gem-detail-item"><div class="gem-detail-key">Weight</div><div class="gem-detail-val">${g.weight}</div></div>` +
        `<div class="gem-detail-item"><div class="gem-detail-key">Grade</div><div class="gem-detail-val">${g.grade}</div></div>` +
        `<div class="gem-detail-item"><div class="gem-detail-key">Certificate</div><div class="gem-detail-val">${g.cert}</div></div>` +
        `<div class="gem-detail-item" style="grid-column:1/-1"><div class="gem-detail-key">Notes</div><div class="gem-detail-val">${g.note}</div></div>`;
    const wa = document.getElementById('gem-lightbox-wa');
    const msg = encodeURIComponent(`Hi Anthem Jewels! I'm interested in:\n\n${g.name}\n${g.weight} · ${g.origin}\n${g.grade} · ${g.cert} Certified\n\nPlease send more details and pricing.`);
    wa.href = `https://wa.me/918800806032?text=${msg}`;
    document.getElementById('gemLightbox').classList.add('open');
}

// ===== CLOSE GEM LIGHTBOX =====
function closeGemLightbox() {
    document.getElementById('gemLightbox').classList.remove('open');
}

// Close gem lightbox on backdrop click
document.addEventListener('click', function(e) {
    const lb = document.getElementById('gemLightbox');
    if (lb && lb.classList.contains('open') && e.target === lb) closeGemLightbox();
});

// ===== BUNDLE BUILDER =====
function sendBundleToWhatsApp() {
    const diamond = document.getElementById('bundleDiamond').value;
    const gem     = document.getElementById('bundleGem').value;
    if (!diamond || !gem) {
        showToast('Please select both a diamond and a gemstone first.', 'error');
        return;
    }
    const msg = encodeURIComponent(`Hi! I'd like to create a custom piece with:\n💎 Diamond: ${diamond}\n💎 Gemstone: ${gem}\n\nCan you help me design this from Anthem Jewels?`);
    window.open(`https://wa.me/918800806032?text=${msg}`, '_blank');
}

// ===== INIT GEM GRID ON PAGE LOAD (if already on gemstones) =====
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('gemGrid')) renderGemGrid('all');
});

/* ============================================================
   ANTHEM JEWELS — PRICE CALCULATOR LOGIC
   ============================================================ */

// ===== TAB SWITCHER =====
function switchCalcTab(tab) {
  document.querySelectorAll('.calc-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.calc-panel').forEach(p => p.classList.toggle('active', p.id === 'calc-' + tab));
  // Trigger stone viewer + price update for the newly active tab
  setTimeout(function() {
    if (tab === 'natural' && window._updateNDStone)  { window._updateNDStone(); if(window.updateNDCalc) window.updateNDCalc(); }
    if (tab === 'lab'     && window._updateLGStone)  { window._updateLGStone(); if(window.updateLGCalc) window.updateLGCalc(); }
    if (tab === 'gem'     && window._updateGemStone) { window._updateGemStone(); if(window.updateGemCalc) window.updateGemCalc(); }
  }, 80);
}

// ===== CHIP SELECTOR =====
function selectChip(el, groupId) {
  document.querySelectorAll('#' + groupId + ' .calc-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

function getChipVal(groupId) {
  const el = document.querySelector('#' + groupId + ' .calc-chip.active');
  return el ? el.dataset.val : '';
}

// ===== USD ↔ INR =====
const USD_INR = 84.5; // approximate rate

function fmt(val, currency) {
  if (currency === 'INR') {
    return '₹' + Math.round(val * USD_INR).toLocaleString('en-IN');
  }
  return '$' + Math.round(val).toLocaleString('en-US');
}

// ===== NATURAL DIAMOND PRICING =====
// Base price per carat (USD) by colour × clarity (Rapaport-aligned, approx)
const ND_BASE = {
  D:  { FL:8000, IF:7200, VVS1:6400, VVS2:5800, VS1:5000, VS2:4400, SI1:3200, SI2:2100 },
  E:  { FL:7200, IF:6500, VVS1:5800, VVS2:5200, VS1:4400, VS2:3800, SI1:2800, SI2:1900 },
  F:  { FL:6500, IF:5800, VVS1:5200, VVS2:4600, VS1:3900, VS2:3400, SI1:2500, SI2:1700 },
  G:  { FL:5600, IF:5000, VVS1:4400, VVS2:3900, VS1:3300, VS2:2900, SI1:2200, SI2:1500 },
  H:  { FL:4800, IF:4200, VVS1:3700, VVS2:3200, VS1:2800, VS2:2400, SI1:1900, SI2:1300 },
  I:  { FL:3900, IF:3400, VVS1:3000, VVS2:2600, VS1:2300, VS2:2000, SI1:1600, SI2:1100 },
  J:  { FL:3100, IF:2700, VVS1:2400, VVS2:2100, VS1:1900, VS2:1700, SI1:1400, SI2: 950 },
};
// Carat weight multiplier (price per carat increases non-linearly)
function caratMult(ct) {
  if (ct < 0.5)  return 0.55;
  if (ct < 0.75) return 0.75;
  if (ct < 1.0)  return 0.90;
  if (ct < 1.5)  return 1.00;
  if (ct < 2.0)  return 1.35;
  if (ct < 3.0)  return 1.80;
  if (ct < 4.0)  return 2.40;
  if (ct < 5.0)  return 3.10;
  return 4.00;
}
// Shape mult (rounds trade at premium)
const ND_SHAPE_MULT = { round:1.0, princess:0.88, oval:0.92, emerald:0.87, pear:0.89, cushion:0.86, marquise:0.88, radiant:0.85 };
// Cut mult
const ND_CUT_MULT = { Excellent:1.0, 'Very Good':0.92, Good:0.82 };

function updateNDCalc() {
  const ct       = parseFloat(document.getElementById('nd-carat').value);
  const color    = getChipVal('nd-color');
  const clarity  = getChipVal('nd-clarity');
  const shape    = getChipVal('nd-shape');
  const cut      = getChipVal('nd-cut');
  const currency = getChipVal('nd-currency');

  document.getElementById('nd-carat-val').textContent = ct.toFixed(2);

  const basePerCt = (ND_BASE[color] || ND_BASE.D)[clarity] || 5000;
  const shapeMult = ND_SHAPE_MULT[shape] || 1;
  const cutMult   = ND_CUT_MULT[cut]   || 1;
  const wMult     = caratMult(ct);

  const pricePerCt = basePerCt * shapeMult * cutMult * wMult;
  const total      = pricePerCt * ct;
  const low        = total * 0.92;
  const high       = total * 1.18;

  // Animate
  const priceEl = document.getElementById('nd-price');
  priceEl.classList.remove('updating');
  void priceEl.offsetWidth;
  priceEl.classList.add('updating');

  priceEl.textContent = fmt(low, currency) + ' – ' + fmt(high, currency);
  document.getElementById('nd-stone-desc').textContent =
    shape.charAt(0).toUpperCase()+shape.slice(1) + ' · ' + ct.toFixed(2) + ' ct · ' + color + ' / ' + clarity + ' · ' + cut;
  document.getElementById('nd-base-pct').textContent  = fmt(pricePerCt, currency) + '/ct';
  document.getElementById('nd-weight-show').textContent = ct.toFixed(2) + ' ct';
  document.getElementById('nd-total-range').textContent = fmt(low, currency) + ' – ' + fmt(high, currency);
}

// ===== LAB GROWN DIAMOND PRICING =====
// Lab prices are ~80-88% lower than natural on average (2024-25 market)
const LG_BASE = {
  D:  { FL: 900, IF: 800, VVS1: 700, VVS2: 640, VS1: 570, VS2: 510, SI1: 380, SI2: 260 },
  E:  { FL: 800, IF: 720, VVS1: 640, VVS2: 580, VS1: 510, VS2: 460, SI1: 340, SI2: 240 },
  F:  { FL: 720, IF: 640, VVS1: 570, VVS2: 520, VS1: 460, VS2: 410, SI1: 310, SI2: 220 },
  G:  { FL: 620, IF: 560, VVS1: 500, VVS2: 450, VS1: 400, VS2: 360, SI1: 270, SI2: 195 },
  H:  { FL: 540, IF: 480, VVS1: 430, VVS2: 390, VS1: 350, VS2: 310, SI1: 240, SI2: 175 },
  I:  { FL: 460, IF: 410, VVS1: 370, VVS2: 330, VS1: 300, VS2: 270, SI1: 210, SI2: 155 },
  J:  { FL: 380, IF: 340, VVS1: 305, VVS2: 275, VS1: 250, VS2: 225, SI1: 180, SI2: 135 },
};
function caratMultLG(ct) {
  // Lab prices scale less aggressively with carat
  if (ct < 0.5)  return 0.70;
  if (ct < 0.75) return 0.85;
  if (ct < 1.0)  return 0.95;
  if (ct < 1.5)  return 1.00;
  if (ct < 2.0)  return 1.20;
  if (ct < 3.0)  return 1.45;
  if (ct < 4.0)  return 1.75;
  if (ct < 5.0)  return 2.10;
  return 2.60;
}

function updateLGCalc() {
  const ct       = parseFloat(document.getElementById('lg-carat').value);
  const color    = getChipVal('lg-color');
  const clarity  = getChipVal('lg-clarity');
  const shape    = getChipVal('lg-shape');
  const type     = getChipVal('lg-type');
  const currency = getChipVal('lg-currency');

  document.getElementById('lg-carat-val').textContent = ct.toFixed(2);

  const basePerCt  = (LG_BASE[color] || LG_BASE.D)[clarity] || 600;
  const shapeMult  = ND_SHAPE_MULT[shape] || 1;
  const typeMult   = type === 'HPHT' ? 1.05 : 1.0;
  const wMult      = caratMultLG(ct);

  const pricePerCt = basePerCt * shapeMult * typeMult * wMult;
  const total      = pricePerCt * ct;
  const low        = total * 0.88;
  const high       = total * 1.22;

  const priceEl = document.getElementById('lg-price');
  priceEl.classList.remove('updating');
  void priceEl.offsetWidth;
  priceEl.classList.add('updating');

  priceEl.textContent = fmt(low, currency) + ' – ' + fmt(high, currency);
  document.getElementById('lg-stone-desc').textContent =
    shape.charAt(0).toUpperCase()+shape.slice(1) + ' · ' + ct.toFixed(2) + ' ct · ' + color + ' / ' + clarity + ' · ' + type;
  document.getElementById('lg-base-pct').textContent   = fmt(pricePerCt, currency) + '/ct';
  document.getElementById('lg-weight-show').textContent = ct.toFixed(2) + ' ct';
  document.getElementById('lg-total-range').textContent = fmt(low, currency) + ' – ' + fmt(high, currency);
}

// ===== GEMSTONE PRICING =====
// Base per carat for AAA unheated standard origin (USD)
const GEM_BASE_PER_CT = {
  ruby:        8000,
  sapphire:    4000,
  emerald:     3500,
  alexandrite: 6000,
  paraiba:    12000,
  spinel:      1800,
  tanzanite:    800,
  tsavorite:   2200,
};
const GEM_QUALITY_MULT = { AAA:1.00, AA:0.65, A:0.40, B:0.22 };
const GEM_TREAT_MULT   = { unheated:1.00, heated:0.55 };
const GEM_ORIGIN_MULT  = { premium:1.80, standard:1.00 };

function caratMultGem(ct) {
  if (ct < 0.5)  return 0.65;
  if (ct < 1.0)  return 0.85;
  if (ct < 2.0)  return 1.00;
  if (ct < 3.0)  return 1.55;
  if (ct < 5.0)  return 2.20;
  return 3.20;
}

const GEM_ORIGIN_NOTES = {
  ruby:        'e.g. Burma (Mogok), Mozambique',
  sapphire:    'e.g. Kashmir, Ceylon (Sri Lanka)',
  emerald:     'e.g. Colombian (Muzo), Zambian',
  alexandrite: 'e.g. Russian, Brazilian',
  paraiba:     'e.g. Brazilian, Mozambique',
  spinel:      'e.g. Burma, Tajikistan',
  tanzanite:   'Standard: Tanzania only',
  tsavorite:   'Standard: East Africa only',
};

function updateGemCalc() {
  const ct        = parseFloat(document.getElementById('gem-carat').value);
  const type      = getChipVal('gem-type');
  const quality   = getChipVal('gem-quality');
  const treatment = getChipVal('gem-treatment');
  const origin    = getChipVal('gem-origin');
  const currency  = getChipVal('gem-currency');

  document.getElementById('gem-carat-val').textContent = ct.toFixed(2);
  document.getElementById('gem-origin-note').textContent = GEM_ORIGIN_NOTES[type] || '';

  const basePerCt  = GEM_BASE_PER_CT[type] || 2000;
  const qualMult   = GEM_QUALITY_MULT[quality] || 1;
  const treatMult  = GEM_TREAT_MULT[treatment] || 1;
  const originMult = GEM_ORIGIN_MULT[origin] || 1;
  const wMult      = caratMultGem(ct);

  const pricePerCt = basePerCt * qualMult * treatMult * originMult * wMult;
  const total      = pricePerCt * ct;
  const low        = total * 0.80;
  const high       = total * 1.30;

  const priceEl = document.getElementById('gem-price');
  priceEl.classList.remove('updating');
  void priceEl.offsetWidth;
  priceEl.classList.add('updating');

  const typeName = type.charAt(0).toUpperCase() + type.slice(1);
  priceEl.textContent = fmt(low, currency) + ' – ' + fmt(high, currency);
  document.getElementById('gem-stone-desc').textContent =
    typeName + ' · ' + ct.toFixed(2) + ' ct · ' + quality + ' · ' + (treatment === 'unheated' ? 'Unheated' : 'Heated') + ' · ' + (origin === 'premium' ? 'Premium Origin' : 'Standard Origin');
  document.getElementById('gem-base-pct').textContent    = fmt(basePerCt * qualMult * treatMult * originMult, currency) + '/ct base';
  document.getElementById('gem-quality-mult').textContent = qualMult.toFixed(2) + '×';
  document.getElementById('gem-treat-mult').textContent   = treatMult.toFixed(2) + '×';
  document.getElementById('gem-origin-mult').textContent  = originMult.toFixed(2) + '×';
  document.getElementById('gem-total-range').textContent  = fmt(low, currency) + ' – ' + fmt(high, currency);
}

// ===== WHATSAPP INQUIRY =====
function inquireCalcWhatsApp(mode) {
  let msg = '';
  if (mode === 'natural') {
    const ct      = parseFloat(document.getElementById('nd-carat').value).toFixed(2);
    const color   = getChipVal('nd-color');
    const clarity = getChipVal('nd-clarity');
    const shape   = getChipVal('nd-shape');
    const cut     = getChipVal('nd-cut');
    const price   = document.getElementById('nd-price').textContent;
    msg = `Hi Anthem Jewels, I used your Price Calculator and I'm interested in a Natural Diamond:\n\n` +
          `Shape: ${shape}\nCarat: ${ct} ct\nColour: ${color}\nClarity: ${clarity}\nCut: ${cut}\n\nEstimated Range: ${price}\n\nPlease send me an exact quote.`;
  } else if (mode === 'lab') {
    const ct      = parseFloat(document.getElementById('lg-carat').value).toFixed(2);
    const color   = getChipVal('lg-color');
    const clarity = getChipVal('lg-clarity');
    const shape   = getChipVal('lg-shape');
    const type    = getChipVal('lg-type');
    const price   = document.getElementById('lg-price').textContent;
    msg = `Hi Anthem Jewels, I used your Price Calculator and I'm interested in a Lab Grown Diamond:\n\n` +
          `Shape: ${shape}\nCarat: ${ct} ct\nColour: ${color}\nClarity: ${clarity}\nGrowth: ${type}\n\nEstimated Range: ${price}\n\nPlease send me an exact quote.`;
  } else {
    const ct        = parseFloat(document.getElementById('gem-carat').value).toFixed(2);
    const type      = getChipVal('gem-type');
    const quality   = getChipVal('gem-quality');
    const treatment = getChipVal('gem-treatment');
    const origin    = getChipVal('gem-origin');
    const price     = document.getElementById('gem-price').textContent;
    msg = `Hi Anthem Jewels, I used your Price Calculator and I'm interested in a Gemstone:\n\n` +
          `Type: ${type}\nCarat: ${ct} ct\nQuality: ${quality}\nTreatment: ${treatment}\nOrigin: ${origin}\n\nEstimated Range: ${price}\n\nPlease send me an exact quote.`;
  }
  window.open('https://wa.me/918800806032?text=' + encodeURIComponent(msg), '_blank');
}


/* ============================================================
   CALCULATOR — INIT & AUTO-TRIGGER
   Called directly by HTML onclick, also triggered on page show
   ============================================================ */

// Trigger calcs when calculator tab is opened
// We patch showPage ONCE after all other code has run

/* ============================================================
   3D STONE VIEWER — lazy init when calculator page is shown
   ============================================================ */
var _stoneViewersReady = false;

function waitAndInitViewers() {
  if (_stoneViewersReady) return;
  // Don't try to init if canvases have zero size (page hidden)
  var cv = document.getElementById('cv-nd-stone');
  if (!cv) return;
  // Force page visible temporarily to get real dimensions
  var calcPage = document.getElementById('calculator');
  var wasHidden = calcPage && calcPage.style.display === 'none';

  if (window.THREE) {
    initStoneViewers();
  } else {
    var tries = 0;
    var iv = setInterval(function() {
      tries++;
      if (window.THREE) { clearInterval(iv); initStoneViewers(); }
      if (tries > 80)   { clearInterval(iv); }
    }, 200);
  }
}

// Only init when calculator page is actually shown (not on window load — page is hidden then)

function initStoneViewers() {
  var THREE = window.THREE;
  if (!THREE) return;
  if (_stoneViewersReady) return;

  /* ---- colour palettes [base hex, emissive hex, specular hex] ---- */
  var PAL = {
    // Diamond shapes — icy white/blue
    round:       [0xe8f5ff, 0xaadeff, 0xffffff],
    princess:    [0xeaf6ff, 0xb0dcff, 0xffffff],
    oval:        [0xe4f4ff, 0xacd8f8, 0xffffff],
    emerald:     [0xdcecff, 0xa0c8f0, 0xffffff],
    pear:        [0xeaf8ff, 0xb4d8ff, 0xffffff],
    cushion:     [0xe4f2ff, 0xaacce8, 0xffffff],
    marquise:    [0xe8f4ff, 0xaed0f8, 0xffffff],
    radiant:     [0xe2eeff, 0xa8c4e8, 0xffffff],
    // Gemstones — rich saturated
    ruby:        [0xff1133, 0xff0022, 0xffaacc],
    sapphire:    [0x1133ff, 0x0022ee, 0x88aaff],
    emerald_gem: [0x00cc44, 0x009933, 0x66ffaa],
    alexandrite: [0xcc00ff, 0xaa00dd, 0xee88ff],
    paraiba:     [0x00eedd, 0x00ccbb, 0x88ffee],
    spinel:      [0xff1155, 0xdd0033, 0xff99bb],
    tanzanite:   [0x6633ff, 0x5522ee, 0xccbbff],
    tsavorite:   [0x00cc33, 0x009922, 0x66ff88],
  };

  /* ---- geometry helpers ---- */
  function ring(n, rx, rz, y) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * rx, y, Math.sin(a) * rz));
    }
    return pts;
  }

  function addTri(vArr, cArr, a, b, c, br) {
    vArr.push(a.x,a.y,a.z, b.x,b.y,b.z, c.x,c.y,c.z);
    br = br === undefined ? 0.85 : br;
    cArr.push(br,br,br, br*0.80,br*0.80,br*0.80, br*0.60,br*0.60,br*0.60);
  }

  function mkGeo(v, c) {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    g.setAttribute('color',    new THREE.Float32BufferAttribute(c, 3));
    g.computeVertexNormals();
    return g;
  }

  function geoRound(rx, rz) {
    rx = rx||0.88; rz = rz||0.88;
    var n=10, v=[], c=[];
    var gT=ring(n,rx,rz,0.05), gB=ring(n,rx,rz,-0.05);
    var tV=ring(n,rx*0.58,rz*0.58,0.44);
    var tC=new THREE.Vector3(0,0.46,0), cu=new THREE.Vector3(0,-0.82,0);
    for(var i=0;i<n;i++){var j=(i+1)%n; addTri(v,c,tC,tV[i],tV[j],0.98);}
    for(var i=0;i<n;i++){var j=(i+1)%n; addTri(v,c,tV[i],gT[i],tV[j],i%2?0.95:0.75); addTri(v,c,tV[j],gT[i],gT[j],i%2?0.70:0.88);}
    for(var i=0;i<n;i++){var j=(i+1)%n; addTri(v,c,gT[i],gT[j],gB[i],0.55); addTri(v,c,gT[j],gB[j],gB[i],0.55);}
    for(var i=0;i<n;i++){var j=(i+1)%n; addTri(v,c,gB[i],gB[j],cu,i%2?0.45:0.60);}
    return mkGeo(v,c);
  }

  function geoStep(w, d) {
    w=w||0.88; d=d||0.62;
    var v=[], c=[];
    function sq(fw,fd,y){ return [new THREE.Vector3(-fw,y,-fd),new THREE.Vector3(fw,y,-fd),new THREE.Vector3(fw,y,fd),new THREE.Vector3(-fw,y,fd)]; }
    var t=sq(w*0.60,d*0.60,0.55), g0=sq(w,d,0.05), g1=sq(w,d,-0.05), cu=new THREE.Vector3(0,-0.82,0), tC=new THREE.Vector3(0,0.57,0);
    addTri(v,c,tC,t[0],t[1],0.98); addTri(v,c,tC,t[1],t[2],0.98); addTri(v,c,tC,t[2],t[3],0.98); addTri(v,c,tC,t[3],t[0],0.98);
    for(var i=0;i<4;i++){var j=(i+1)%4; addTri(v,c,t[i],g0[i],t[j],i%2?0.80:0.65); addTri(v,c,t[j],g0[i],g0[j],i%2?0.65:0.80);}
    for(var i=0;i<4;i++){var j=(i+1)%4; addTri(v,c,g0[i],g0[j],g1[i],0.55); addTri(v,c,g0[j],g1[j],g1[i],0.55);}
    for(var i=0;i<4;i++){var j=(i+1)%4; addTri(v,c,g1[i],g1[j],cu,i%2?0.45:0.60);}
    return mkGeo(v,c);
  }

  function geoPear() {
    var n=12, v=[], c=[];
    var gT=[],gB=[],tV=[];
    for(var i=0;i<n;i++){
      var a=(i/n)*Math.PI*2, px=Math.cos(a)*0.80*(1-0.24*Math.cos(a)), pz=Math.sin(a)*0.62;
      gT.push(new THREE.Vector3(px,0.05,pz)); gB.push(new THREE.Vector3(px,-0.05,pz)); tV.push(new THREE.Vector3(px*0.60,0.42,pz*0.60));
    }
    var tC=new THREE.Vector3(-0.08,0.44,0), cu=new THREE.Vector3(0,-0.80,0);
    for(var i=0;i<n;i++){var j=(i+1)%n; addTri(v,c,tC,tV[i],tV[j],0.98);}
    for(var i=0;i<n;i++){var j=(i+1)%n; addTri(v,c,tV[i],gT[i],tV[j],i%2?0.90:0.70); addTri(v,c,tV[j],gT[i],gT[j],i%2?0.70:0.85);}
    for(var i=0;i<n;i++){var j=(i+1)%n; addTri(v,c,gT[i],gT[j],gB[i],0.55); addTri(v,c,gT[j],gB[j],gB[i],0.55);}
    for(var i=0;i<n;i++){var j=(i+1)%n; addTri(v,c,gB[i],gB[j],cu,0.48);}
    return mkGeo(v,c);
  }

  function geoCushion() {
    var n=12, v=[], c=[];
    function cp(i,y){ var a=(i/n)*Math.PI*2, s=1-0.09*Math.pow(Math.abs(Math.cos(a*2)),4); return new THREE.Vector3(Math.cos(a)*0.88*s,y,Math.sin(a)*0.88*s); }
    var gT=[],gB=[],tV=[];
    for(var i=0;i<n;i++){ gT.push(cp(i,0.05)); gB.push(cp(i,-0.05)); var p=cp(i,0.43); p.x*=0.60; p.z*=0.60; tV.push(p); }
    var tC=new THREE.Vector3(0,0.45,0), cu=new THREE.Vector3(0,-0.80,0);
    for(var i=0;i<n;i++){var j=(i+1)%n; addTri(v,c,tC,tV[i],tV[j],0.98);}
    for(var i=0;i<n;i++){var j=(i+1)%n; addTri(v,c,tV[i],gT[i],tV[j],i%2?0.90:0.70); addTri(v,c,tV[j],gT[i],gT[j],i%2?0.70:0.85);}
    for(var i=0;i<n;i++){var j=(i+1)%n; addTri(v,c,gT[i],gT[j],gB[i],0.55); addTri(v,c,gT[j],gB[j],gB[i],0.55);}
    for(var i=0;i<n;i++){var j=(i+1)%n; addTri(v,c,gB[i],gB[j],cu,0.48);}
    return mkGeo(v,c);
  }

  /* shape key → geometry builder */
  var GEO = {
    round:       function(){ return geoRound(); },
    princess:    function(){ return geoStep(0.84,0.84); },
    oval:        function(){ return geoRound(1.08,0.70); },
    emerald:     function(){ return geoStep(0.88,0.62); },
    pear:        geoPear,
    cushion:     geoCushion,
    marquise:    function(){ return geoRound(1.14,0.50); },
    radiant:     function(){ var n=8,v=[],c=[]; var gT=ring(n,0.84,0.78,0.05),gB=ring(n,0.84,0.78,-0.05),tV=ring(n,0.50,0.46,0.42); var tC=new THREE.Vector3(0,0.44,0),cu=new THREE.Vector3(0,-0.80,0); for(var i=0;i<n;i++){var j=(i+1)%n;addTri(v,c,tC,tV[i],tV[j],0.98);} for(var i=0;i<n;i++){var j=(i+1)%n;addTri(v,c,tV[i],gT[i],tV[j],i%2?0.90:0.70);addTri(v,c,tV[j],gT[i],gT[j],i%2?0.70:0.85);} for(var i=0;i<n;i++){var j=(i+1)%n;addTri(v,c,gT[i],gT[j],gB[i],0.55);addTri(v,c,gT[j],gB[j],gB[i],0.55);} for(var i=0;i<n;i++){var j=(i+1)%n;addTri(v,c,gB[i],gB[j],cu,0.48);} return mkGeo(v,c); },
    ruby:        function(){ return geoRound(); },
    sapphire:    function(){ return geoRound(); },
    emerald_gem: function(){ return geoStep(0.88,0.62); },
    alexandrite: function(){ return geoRound(); },
    paraiba:     function(){ return geoRound(); },
    spinel:      function(){ return geoRound(); },
    tanzanite:   function(){ return geoRound(1.08,0.70); },
    tsavorite:   function(){ return geoRound(); },
  };

  /* ---- Single viewer factory ---- */
  function makeViewer(canvasEl) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 280, H = 280;
    canvasEl.width  = W * dpr;
    canvasEl.height = H * dpr;
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    cam.position.set(0, 0.1, 3.6);
    var ren = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
    ren.setSize(W, H);
    ren.setPixelRatio(dpr);
    ren.setClearColor(0, 0);

    var kL=new THREE.DirectionalLight(0xffffff,2.8); kL.position.set(3,4,3); scene.add(kL);
    var sL=new THREE.DirectionalLight(0xffffff,1.2); sL.position.set(-3,2,2); scene.add(sL);
    var rL=new THREE.DirectionalLight(0xffffff,1.4); rL.position.set(0,-3,-3); scene.add(rL);
    var fL=new THREE.DirectionalLight(0xffffff,0.8); fL.position.set(0,0,5); scene.add(fL);
    scene.add(new THREE.AmbientLight(0xffffff,0.6));

    var grp=new THREE.Group(); scene.add(grp);
    var mesh=null, iMesh=null;

    // sparkles
    var spkN=30, spkArr=new Float32Array(spkN*3);
    for(var i=0;i<spkN;i++){var r=1.3+Math.random()*0.5,ta=Math.random()*Math.PI*2,pa=Math.random()*Math.PI;spkArr[i*3]=r*Math.sin(pa)*Math.cos(ta);spkArr[i*3+1]=r*Math.cos(pa);spkArr[i*3+2]=r*Math.sin(pa)*Math.sin(ta);}
    var spkGeo=new THREE.BufferGeometry(); spkGeo.setAttribute('position',new THREE.BufferAttribute(spkArr,3));
    var spkMat=new THREE.PointsMaterial({size:0.04,color:0xffffff,transparent:true,opacity:0.7,sizeAttenuation:true});
    scene.add(new THREE.Points(spkGeo,spkMat));

    function setStone(pk, sk) {
      if(mesh)  { grp.remove(mesh);  mesh.geometry.dispose();  mesh.material.dispose(); }
      if(iMesh) { grp.remove(iMesh); iMesh.geometry.dispose(); iMesh.material.dispose(); }
      var pal = PAL[pk] || PAL.round;
      var bC=new THREE.Color(pal[0]), eC=new THREE.Color(pal[1]), sC=new THREE.Color(pal[2]);
      var builder = GEO[sk] || GEO[pk] || GEO.round;
      var geo = builder();
      // tint vertex colours
      var ca=geo.getAttribute('color');
      for(var i=0;i<ca.count;i++){
        var br=ca.getX(i);
        var fc = br>0.88 ? bC : (br>0.72 ? bC : eC);
        ca.setXYZ(i, fc.r*br, fc.g*br, fc.b*br);
      }
      ca.needsUpdate=true;
      mesh  = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({vertexColors:true,color:bC,emissive:new THREE.Color(pal[1]).multiplyScalar(0.20),specular:sC,shininess:340,transparent:true,opacity:0.90,side:THREE.DoubleSide}));
      iMesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({vertexColors:true,color:bC,transparent:true,opacity:0.14,shininess:500,specular:sC,side:THREE.FrontSide}));
      mesh.position.y=0.08; iMesh.scale.setScalar(0.83); iMesh.position.y=0.08;
      grp.add(mesh); grp.add(iMesh);
      kL.color.set(sC); rL.color.set(bC); spkMat.color.set(pal[2]);
    }

    // drag
    var drag=false, pM={x:0,y:0}, vx=0, vy=0;
    canvasEl.addEventListener('mousedown',function(e){drag=true;pM={x:e.clientX,y:e.clientY};canvasEl.style.cursor='grabbing';});
    window.addEventListener('mouseup',function(){drag=false;canvasEl.style.cursor='grab';});
    window.addEventListener('mousemove',function(e){if(!drag)return;vy=(e.clientX-pM.x)*0.009;vx=(e.clientY-pM.y)*0.009;pM={x:e.clientX,y:e.clientY};});
    var pT=null;
    canvasEl.addEventListener('touchstart',function(e){pT=e.touches[0];drag=true;},{passive:true});
    canvasEl.addEventListener('touchmove',function(e){if(!pT)return;vy=(e.touches[0].clientX-pT.clientX)*0.009;vx=(e.touches[0].clientY-pT.clientY)*0.009;pT=e.touches[0];},{passive:true});
    canvasEl.addEventListener('touchend',function(){drag=false;pT=null;});
    canvasEl.style.cursor='grab';

    var t=0;
    (function loop(){
      requestAnimationFrame(loop); t+=0.014;
      if(!drag){vx*=0.92;vy*=0.92;grp.rotation.y+=0.009+vy;grp.rotation.x+=vx;}
      else{grp.rotation.y+=vy;grp.rotation.x+=vx;}
      grp.rotation.x=Math.max(-0.7,Math.min(0.7,grp.rotation.x));
      spkMat.opacity=0.45+Math.sin(t*2.2)*0.30;
      kL.position.x=Math.cos(t*0.38)*3; kL.position.z=Math.sin(t*0.38)*3;
      if(iMesh) iMesh.scale.setScalar(0.80+Math.sin(t*1.9)*0.04);
      ren.render(scene,cam);
    })();

    return { setStone: setStone };
  }

  /* ---- inject canvases ---- */
  function getCanvas(cvId) {
    var cv = document.getElementById(cvId);
    if (!cv) return null;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Force physical size — 280px display, scaled by dpr for HiDPI
    cv.width  = 280 * dpr;
    cv.height = 280 * dpr;
    cv.style.width  = '280px';
    cv.style.height = '280px';
    return cv;
  }

  var cvND  = getCanvas('cv-nd-stone');
  var cvLG  = getCanvas('cv-lg-stone');
  var cvGem = getCanvas('cv-gem-stone');

  // If any canvas failed, abort — will retry next time showPage('calculator') is called
  if (!cvND || !cvLG || !cvGem) return;

  _stoneViewersReady = true;

  var vND  = cvND  ? makeViewer(cvND)  : null;
  var vLG  = cvLG  ? makeViewer(cvLG)  : null;
  var vGem = cvGem ? makeViewer(cvGem) : null;

  if(vND)  vND.setStone('round','round');
  if(vLG)  vLG.setStone('round','round');
  if(vGem) vGem.setStone('ruby','ruby');

  /* ---- expose updaters so calc functions can call them ---- */
  window._updateNDStone = function() {
    if(!vND) return;
    var el=document.querySelector('#nd-shape .calc-chip.active');
    var shape = el ? el.dataset.val : 'round';
    // Use shape as palette key (diamond shapes have their own palette entries)
    vND.setStone(shape, shape);
  };
  window._updateLGStone = function() {
    if(!vLG) return;
    var el=document.querySelector('#lg-shape .calc-chip.active');
    var shape = el ? el.dataset.val : 'round';
    vLG.setStone(shape, shape);
  };
  window._updateGemStone = function() {
    if(!vGem) return;
    var el=document.querySelector('#gem-type .calc-chip.active');
    if(!el) return;
    var gv=el.dataset.val||'ruby';
    var pk = gv==='emerald' ? 'emerald_gem' : gv;
    var sk = gv==='tanzanite'?'tanzanite':(gv==='emerald'?'emerald_gem':gv);
    vGem.setStone(pk, sk);
  };
}

/* ---- Hook stone updates into existing calc functions ---- */
/* These run AFTER initStoneViewers sets up window._update*Stone */
var _ndOrig  = window.updateNDCalc;
var _lgOrig  = window.updateLGCalc;
var _gemOrig = window.updateGemCalc;

window.updateNDCalc = function() {
  if(_ndOrig)  _ndOrig();
  if(window._updateNDStone)  window._updateNDStone();
};
window.updateLGCalc = function() {
  if(_lgOrig)  _lgOrig();
  if(window._updateLGStone)  window._updateLGStone();
};
window.updateGemCalc = function() {
  if(_gemOrig) _gemOrig();
  if(window._updateGemStone) window._updateGemStone();
};


/* ============================================================
   CENTRAL showPage DISPATCHER — replaces all scattered wraps
   All page-change side effects live here.
   ============================================================ */
(function() {
    var _coreShowPage = window.showPage;

    window.showPage = function(name) {
        // 1. Gold wipe animation
        _triggerPageWipe();

        // 2. Call core navigation
        var result = _coreShowPage(name);

        // 3. Per-page hooks
        if (name === 'gemstones') {
            renderGemGrid('all');
            initBirthstone(); // idempotent — checks dataset.init
            document.querySelectorAll('.gem-swatch').forEach(function(s) { s.classList.remove('active'); });
            var firstSwatch = document.querySelector('.gem-swatch');
            if (firstSwatch) firstSwatch.classList.add('active');
        }

        if (name === 'calculator') {
            // Trigger price calculations
            setTimeout(function() {
                if (typeof updateNDCalc  === 'function') updateNDCalc();
                if (typeof updateLGCalc  === 'function') updateLGCalc();
                if (typeof updateGemCalc === 'function') updateGemCalc();
            }, 80);

            // Init 3D stone viewers (lazy, once)
            setTimeout(function() {
                if (!_stoneViewersReady) waitAndInitViewers();
            }, 120);
        }

        return result;
    };
})();

/* ============================================================
   CALCULATOR — initial run on page load
   ============================================================ */
window.addEventListener('load', function() {
    // Run calcs once so values are ready even before user visits calculator
    if (typeof updateNDCalc  === 'function') updateNDCalc();
    if (typeof updateLGCalc  === 'function') updateLGCalc();
    if (typeof updateGemCalc === 'function') updateGemCalc();
});

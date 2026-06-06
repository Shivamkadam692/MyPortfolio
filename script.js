// ============================================
// Shivam Kadam Portfolio — Enhanced script.js
// Three.js + GSAP + Advanced Interactions
// ============================================

// ── GSAP Registration ────────────────────────
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// ── Theme Setup ──────────────────────────────
const html       = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');
syncThemeIcon(savedTheme);

themeToggle?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    syncThemeIcon(next);
});

function syncThemeIcon(theme) {
    if (themeIcon) themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ── Loader ───────────────────────────────────
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        setTimeout(() => {
            loader.remove();
            initHeroAnimations();
        }, 500);
    }, 1400);
});

// ── Three.js Hero Background ─────────────────
function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    camera.position.z = 30;

    // ─ Particles ─
    const particleCount = 180;
    const positions     = new Float32Array(particleCount * 3);
    const colors        = new Float32Array(particleCount * 3);

    const palette = [
        [0.49, 0.23, 0.93],   // purple #7c3aed
        [0.02, 0.71, 0.83],   // cyan   #06b6d4
        [0.96, 0.25, 0.37],   // rose   #f43f5e
        [0.96, 0.62, 0.04],   // gold   #f59e0b
    ];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 80;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3]     = c[0];
        colors[i * 3 + 1] = c[1];
        colors[i * 3 + 2] = c[2];
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

    const particleMat = new THREE.PointsMaterial({
        size:          0.18,
        vertexColors:  true,
        transparent:   true,
        opacity:       0.75,
        sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ─ Floating Geometric Shapes ─
    const shapes = [];

    function addShape(geometry, color, x, y, z) {
        const mat  = new THREE.MeshPhongMaterial({
            color,
            transparent: true,
            opacity:     0.15,
            wireframe:   true,
            emissive:    color,
            emissiveIntensity: 0.3,
        });
        const mesh = new THREE.Mesh(geometry, mat);
        mesh.position.set(x, y, z);
        mesh.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.005,
            rotSpeedY: (Math.random() - 0.5) * 0.005,
            floatAmp:  Math.random() * 1.5,
            floatFreq: 0.5 + Math.random() * 0.5,
            phase:     Math.random() * Math.PI * 2,
        };
        scene.add(mesh);
        shapes.push(mesh);
        return mesh;
    }

    addShape(new THREE.IcosahedronGeometry(4, 1),  0x7c3aed, 12, 5, -10);
    addShape(new THREE.OctahedronGeometry(3, 0),   0x06b6d4, -14, -4, -8);
    addShape(new THREE.TorusGeometry(3, 0.5, 8, 24), 0xf43f5e, 18, -8, -15);
    addShape(new THREE.TetrahedronGeometry(2.5, 0), 0xf59e0b, -18, 7, -12);
    addShape(new THREE.BoxGeometry(4, 4, 4),        0xa855f7, -8, -12, -5);

    // ─ Lighting ─
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const ptLight1 = new THREE.PointLight(0x7c3aed, 2, 50);
    ptLight1.position.set(10, 10, 5);
    scene.add(ptLight1);

    const ptLight2 = new THREE.PointLight(0x06b6d4, 1.5, 50);
    ptLight2.position.set(-10, -5, 5);
    scene.add(ptLight2);

    // ─ Mouse parallax ─
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ─ Animation loop ─
    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        t += 0.01;

        // Smooth camera parallax
        targetX += (mouseX * 3 - targetX) * 0.04;
        targetY += (mouseY * 2 - targetY) * 0.04;
        camera.position.x = targetX;
        camera.position.y = -targetY;
        camera.lookAt(scene.position);

        // Rotate particle cloud
        particles.rotation.y = t * 0.05;
        particles.rotation.x = t * 0.02;

        // Animate shapes
        shapes.forEach(mesh => {
            mesh.rotation.x += mesh.userData.rotSpeedX;
            mesh.rotation.y += mesh.userData.rotSpeedY;
            mesh.position.y += Math.sin(t * mesh.userData.floatFreq + mesh.userData.phase) * 0.005;
        });

        // Pulse lights
        ptLight1.intensity = 1.5 + Math.sin(t * 0.8) * 0.5;
        ptLight2.intensity = 1.2 + Math.cos(t * 0.6) * 0.4;

        renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Scroll fade
    window.addEventListener('scroll', () => {
        const progress = Math.min(window.scrollY / window.innerHeight, 1);
        canvas.style.opacity = 1 - progress * 0.9;
    }, { passive: true });
}

initThreeJS();

// ── Hero Animations (GSAP) ───────────────────
function initHeroAnimations() {
    if (typeof gsap === 'undefined') {
        // Fallback CSS animations
        ['hero-eyebrow','hero-name','hero-role','hero-desc','hero-actions','hero-socials','hero-visual'].forEach((id, i) => {
            const el = document.getElementById(id);
            if (el) {
                el.style.transition = `opacity 0.8s ease ${i * 0.12}s, transform 0.8s ease ${i * 0.12}s`;
                el.style.opacity = '1';
                el.style.transform = 'none';
            }
        });
        return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1 } });

    tl.to('#hero-eyebrow', { opacity: 1, y: 0, duration: 0.8 }, 0.1)
      .to('#hero-name',    { opacity: 1, y: 0, duration: 0.9 }, 0.25)
      .to('#hero-role',    { opacity: 1, y: 0, duration: 0.8 }, 0.4)
      .to('#hero-desc',    { opacity: 1, y: 0, duration: 0.8 }, 0.55)
      .to('#hero-actions', { opacity: 1, y: 0, duration: 0.8 }, 0.65)
      .to('#hero-socials', { opacity: 1, y: 0, duration: 0.8 }, 0.75)
      .to('#hero-visual',  { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out' }, 0.3);
}

// ── Typing Animation ─────────────────────────
const typingEl = document.getElementById('typing-text');
const phrases  = ['Full Stack Developer', 'MERN Stack Specialist', 'Python Developer', 'AI Developer', 'UI/UX Enthusiast'];
let pi = 0, ci = 0, deleting = false, speed = 100;

function typeLoop() {
    const phrase = phrases[pi];
    typingEl.textContent = deleting ? phrase.slice(0, --ci) : phrase.slice(0, ++ci);

    if (!deleting && ci === phrase.length) {
        speed = 2400; deleting = true;
    } else if (deleting && ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        speed = 480;
    } else {
        speed = deleting ? 42 : 95;
    }
    setTimeout(typeLoop, speed);
}
if (typingEl) setTimeout(typeLoop, 1800);

// ── Mobile Nav ────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('active');
        document.body.style.overflow = '';
    });
});

document.addEventListener('click', e => {
    if (!hamburger?.contains(e.target) && !navMenu?.contains(e.target)) {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ── Navbar scroll effect ──────────────────────
const navbar    = document.getElementById('navbar');
const scrollTop = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar?.classList.toggle('scrolled', y > 60);
    scrollTop?.classList.toggle('visible', y > 400);
    updateActiveLink();
}, { passive: true });

// ── Smooth scroll ─────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = target.getBoundingClientRect().top + window.scrollY - 72;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }
    });
});

scrollTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Active nav link ───────────────────────────
function updateActiveLink() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const pos      = window.scrollY + 130;
    let current    = '';
    sections.forEach(s => { if (pos >= s.offsetTop) current = s.id; });
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
}

// ── AOS-like Scroll Reveal ────────────────────
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = entry.target.dataset.aosDelay || 0;
            setTimeout(() => entry.target.classList.add('aos-animate'), parseInt(delay));
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-aos]').forEach(el => revealObserver.observe(el));

// ── Skill Bar Animation ───────────────────────
const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const w   = bar.dataset.width || 0;
            setTimeout(() => { bar.style.width = w + '%'; }, 250);
            skillObserver.unobserve(bar);
        }
    });
}, { threshold: 0.4 });

document.querySelectorAll('.skill-bar-fill').forEach(b => skillObserver.observe(b));

// ── Counter Animation ─────────────────────────
const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el     = entry.target;
            const target = parseInt(el.dataset.target);
            if (isNaN(target)) return;
            let start = 0;
            const dur  = 2000;
            const step = target / (dur / 16);
            const tick = () => {
                start = Math.min(start + step, target);
                el.textContent = Math.floor(start) + (start >= target ? '+' : '');
                if (start < target) requestAnimationFrame(tick);
            };
            tick();
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ── 3D Card Tilt Effect (desktop only) ───────
function initTilt() {
    // Skip on touch devices
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    document.querySelectorAll('[data-tilt]').forEach(card => {
        const inner = card.querySelector('.skill-card-inner');

        card.addEventListener('mousemove', e => {
            const rect   = card.getBoundingClientRect();
            const cx     = rect.left + rect.width  / 2;
            const cy     = rect.top  + rect.height / 2;
            const dx     = (e.clientX - cx) / (rect.width  / 2);
            const dy     = (e.clientY - cy) / (rect.height / 2);

            const rotX   = -dy * 12;
            const rotY   =  dx * 12;

            card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-10px)`;

            // Move inner content slightly for depth
            if (inner) {
                inner.style.transform = `translateZ(10px) translateX(${dx * 4}px) translateY(${dy * 4}px)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
            if (inner) {
                inner.style.transform = '';
                inner.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
            }
            setTimeout(() => {
                card.style.transition = '';
                if (inner) inner.style.transition = '';
            }, 500);
        });
    });
}

initTilt();

// ── Project Card 3D Hover (desktop only) ──────
if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    document.querySelectorAll('.project-card-3d').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx   = rect.left + rect.width  / 2;
            const cy   = rect.top  + rect.height / 2;
            const dx   = (e.clientX - cx) / (rect.width  / 2);
            const dy   = (e.clientY - cy) / (rect.height / 2);
            card.style.transform = `perspective(800px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) translateY(-12px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
            card.style.transform  = '';
            setTimeout(() => card.style.transition = '', 500);
        });
    });

    // ── Contact Card Magnetic Effect ──────────────
    document.querySelectorAll('.contact-card-3d').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const dx   = (e.clientX - rect.left - rect.width  / 2) / 10;
            const dy   = (e.clientY - rect.top  - rect.height / 2) / 10;
            card.style.transform = `translateX(${dx * 0.3}px) translateY(${-5 + dy * 0.2}px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease';
            card.style.transform  = '';
        });
    });
}

// ── Button Ripple Effect ──────────────────────
const rippleCSS = document.createElement('style');
rippleCSS.textContent = `@keyframes ripple{to{transform:scale(4);opacity:0}}`;
document.head.appendChild(rippleCSS);

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const r    = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        Object.assign(r.style, {
            position:     'absolute',
            width:        size + 'px',
            height:       size + 'px',
            left:         (e.clientX - rect.left - size / 2) + 'px',
            top:          (e.clientY - rect.top  - size / 2) + 'px',
            borderRadius: '50%',
            background:   'rgba(255,255,255,0.3)',
            transform:    'scale(0)',
            animation:    'ripple 0.55s ease-out',
            pointerEvents:'none',
        });
        this.appendChild(r);
        setTimeout(() => r.remove(), 600);
    });
});

// ── Hero Parallax (desktop only) ─────────────
if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    window.addEventListener('scroll', () => {
        const y    = window.scrollY;
        const hero = document.querySelector('.hero-content');
        if (hero && y < window.innerHeight) {
            const progress = y / window.innerHeight;
            hero.style.transform = `translateY(${y * 0.2}px)`;
            hero.style.opacity   = Math.max(0, 1 - progress * 1.2);
        }
    }, { passive: true });
}

// ── GSAP Scroll Animations (if available) ────
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {

    // Section title reveals
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.fromTo(title,
            { opacity: 0, y: 50, skewY: 2 },
            {
                opacity: 1, y: 0, skewY: 0,
                duration: 0.9,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: title,
                    start: 'top 85%',
                    once: true,
                }
            }
        );
    });

    // Stagger skill cards
    ScrollTrigger.create({
        trigger: '.skills-grid-3d',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            gsap.fromTo('.skill-card-3d',
                { opacity: 0, y: 60, scale: 0.9 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.7,
                    stagger: 0.07,
                    ease: 'back.out(1.4)',
                }
            );
        }
    });

    // Stagger project cards
    ScrollTrigger.create({
        trigger: '.projects-grid',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            gsap.fromTo('.project-card-3d',
                { opacity: 0, y: 80 },
                {
                    opacity: 1, y: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out',
                }
            );
        }
    });

    // Resume card
    ScrollTrigger.create({
        trigger: '.resume-card-3d',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            gsap.fromTo('.resume-card-3d',
                { opacity: 0, scale: 0.9, y: 50 },
                { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'expo.out' }
            );
        }
    });
}



// ── Toast Notification ────────────────────────
function toast(msg, type = 'info') {
    document.querySelector('.toast')?.remove();

    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    Object.assign(t.style, {
        position:     'fixed',
        top:          '90px',
        right:        '20px',
        background:   type === 'success'
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
        color:        '#fff',
        padding:      '1rem 1.6rem',
        borderRadius: '14px',
        boxShadow:    '0 12px 40px rgba(0,0,0,0.3)',
        zIndex:       '10000',
        fontSize:     '0.92rem',
        fontWeight:   '600',
        maxWidth:     '360px',
        animation:    'toastSlideIn 0.4s cubic-bezier(0.16,1,0.3,1)',
        border:       '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
    });
    t.innerHTML = `<span>${msg}</span>`;

    const toastCSS = document.createElement('style');
    toastCSS.textContent = `
        @keyframes toastSlideIn {
            from { opacity:0; transform:translateX(60px) scale(0.9); }
            to   { opacity:1; transform:translateX(0) scale(1); }
        }
    `;
    document.head.appendChild(toastCSS);
    document.body.appendChild(t);

    setTimeout(() => {
        t.style.transition = 'all 0.4s ease';
        t.style.opacity    = '0';
        t.style.transform  = 'translateX(60px)';
        setTimeout(() => t.remove(), 400);
    }, 4500);
}

// ── Cursor Glow Effect (desktop only) ────────
if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    const cursorGlow = document.createElement('div');
    Object.assign(cursorGlow.style, {
        position:     'fixed',
        width:        '300px',
        height:       '300px',
        borderRadius: '50%',
        background:   'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
        pointerEvents:'none',
        zIndex:       '999',
        transform:    'translate(-50%, -50%)',
        transition:   'transform 0.1s ease',
        left:         '-300px',
        top:          '-300px',
    });
    document.body.appendChild(cursorGlow);

    document.addEventListener('mousemove', e => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top  = e.clientY + 'px';
    });
}

// ── Glitch on logo hover ──────────────────────
const logoEl = document.querySelector('.logo-icon');
if (logoEl) {
    const glitchCSS = document.createElement('style');
    glitchCSS.textContent = `
        @keyframes glitch {
            0%   { clip-path: inset(0 0 80% 0); transform: skewX(-5deg) translate(-3px,0); }
            10%  { clip-path: inset(40% 0 40% 0); transform: skewX(5deg) translate(3px,0); }
            20%  { clip-path: inset(80% 0 0 0); transform: skewX(-3deg) translate(-2px,0); }
            30%  { clip-path: inset(0 0 60% 0); transform: skewX(4deg) translate(2px,0); }
            100% { clip-path: inset(0); transform: none; }
        }
        .logo:hover .logo-icon::after {
            content: 'SK';
            position: absolute;
            inset: 0;
            color: #06b6d4;
            display: grid;
            place-items: center;
            animation: glitch 0.5s steps(1) forwards;
        }
        .logo-icon { position: relative; }
    `;
    document.head.appendChild(glitchCSS);
}

// ── Console greeting ──────────────────────────
console.log('%c👋 Shivam Kadam — Portfolio v2.0', 'font-size:18px;font-weight:900;background:linear-gradient(135deg,#7c3aed,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;');
console.log('%cMERN · Python · Docker · Three.js · GSAP · AI', 'font-size:13px;color:#06b6d4;');

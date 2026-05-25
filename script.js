// ==========================================
// Portfolio Website JavaScript
// ==========================================

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeDefault();
    initThemeToggle();
    initScrollAnimations();
    initMobileMenu();
    initScrollToTop();
    init3DCardTilt();
    initCounterAnimations();
    initTypewriter();
    initProjectFilter();
    initPageCanvas();
    initChatbot();
    initScrollClamp();
    initLightbox();
});

// ==========================================
// Lightbox — full-size image preview
// ==========================================
function initLightbox() {
    const overlay  = document.getElementById('lightboxOverlay');
    const imgEl    = document.getElementById('lightboxImg');
    const caption  = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');
    if (!overlay) return;

    // Inject magnify button into every project-image that has a real img
    document.querySelectorAll('.project-image').forEach(container => {
        if (!container.querySelector('.project-img')) return;
        const btn = document.createElement('button');
        btn.className  = 'project-magnify';
        btn.setAttribute('aria-label', 'View full image');
        btn.innerHTML  = '<i class="fas fa-search-plus"></i>';
        container.appendChild(btn);
    });

    function openLightbox(src, alt) {
        imgEl.src = src;
        imgEl.alt = alt;
        caption.textContent = alt;
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        // Clear src after fade-out so next open doesn't flash old image
        setTimeout(() => { imgEl.src = ''; }, 280);
    }

    // Click on image or magnify button to open
    document.querySelectorAll('.project-image').forEach(container => {
        const img    = container.querySelector('.project-img');
        const magnify = container.querySelector('.project-magnify');
        if (!img) return;

        [img, magnify].filter(Boolean).forEach(el => {
            el.addEventListener('click', e => {
                e.stopPropagation();
                openLightbox(img.src, img.alt);
            });
        });
    });

    // Close on overlay background click
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeLightbox();
    });

    // Close button
    closeBtn.addEventListener('click', closeLightbox);

    // Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeLightbox();
    });
}

// ==========================================
// Scroll Clamp — prevent scrolling past footer
// ==========================================
function initScrollClamp() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    let busy = false;

    function clamp() {
        if (busy) return;
        // Use getBoundingClientRect for accurate position regardless of transforms/offsets
        const footerBottom = window.scrollY + footer.getBoundingClientRect().bottom;
        const max = Math.max(0, footerBottom - window.innerHeight);
        if (window.scrollY > max) {
            busy = true;
            window.scrollTo(0, max);
            requestAnimationFrame(() => { busy = false; });
        }
    }

    window.addEventListener('scroll', clamp, { passive: true });
    window.addEventListener('resize', clamp, { passive: true });
}

// ==========================================
// Navigation
// ==========================================
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');

    // Slide the navbar in shortly after page load
    requestAnimationFrame(() => {
        setTimeout(() => {
            navbar.classList.add('nav-visible');
        }, 120);
    });

    // Scroll state: enhanced frosted-glass when not at top
    function updateNavState() {
        const scrolled = window.pageYOffset > 60;
        navbar.classList.toggle('scrolled', scrolled);
    }
    window.addEventListener('scroll', updateNavState, { passive: true });
    updateNavState();

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const mobileMenu = document.querySelector('.mobile-menu');
                    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
                    if (mobileMenu && mobileMenu.classList.contains('active')) {
                        mobileMenu.classList.remove('active');
                        mobileMenuBtn.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                    window.scrollTo({ top: target.offsetTop - navbar.offsetHeight, behavior: 'smooth' });
                }
            }
        });
    });

    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionId = section.getAttribute('id');
            if (scrollY > sectionTop && scrollY <= sectionTop + section.offsetHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// ==========================================
// Theme — default dark, respect saved pref
// ==========================================
function initThemeDefault() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    function updateIcon() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        btn.innerHTML = isDark
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    updateIcon();

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateIcon();
    });
}

// ==========================================
// Scroll Animations (IntersectionObserver)
// ==========================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.timeline-item, .project-card, .award-card, .edu-card, .cert-card, .skill-group'
    );

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = `opacity 0.55s ease ${(index % 6) * 0.07}s, transform 0.55s ease ${(index % 6) * 0.07}s`;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        observer.observe(el);
    });

    const revealElements = document.querySelectorAll(
        '.section-header, .about-text, .about-image, .contact-content, .section-description, .subsection-title'
    );

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(el);
    });
}

// ==========================================
// Mobile Menu
// ==========================================
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ==========================================
// Scroll To Top Button
// ==========================================
function initScrollToTop() {
    const btn = document.getElementById('scrollToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.pageYOffset > 400);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==========================================
// Parallax — Hero Orbs
// ==========================================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    if (scrolled < window.innerHeight) {
        document.querySelectorAll('.gradient-orb').forEach((orb, i) => {
            orb.style.transform = `translate(0, ${scrolled * (0.3 + i * 0.08)}px)`;
        });
    }
});

// ==========================================
// 3D Card Tilt
// ==========================================
function init3DCardTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch

    const cards = document.querySelectorAll('.award-card, .edu-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotX = ((y - cy) / cy) * -7;
            const rotY = ((x - cx) / cx) * 7;

            // dynamic shine position
            const pctX = (x / rect.width) * 100;
            const pctY = (y / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${pctX}%`);
            card.style.setProperty('--mouse-y', `${pctY}%`);

            card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
            card.style.boxShadow = `${-rotY * 2}px ${rotX * 2}px 35px rgba(14,165,233,0.18)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.55s ease';
            card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
            card.style.boxShadow = '';
        });
    });
}

// ==========================================
// Magnetic Buttons
// ==========================================
function initMagneticButtons() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const magnets = document.querySelectorAll('.btn-primary, .btn-outline');

    magnets.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'transform 0.1s ease, box-shadow 0.2s ease, background 0.25s ease, color 0.25s ease';
        });

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
            btn.style.transform = `translate(${x}px, ${y}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.2s ease, background 0.25s ease, color 0.25s ease';
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

// ==========================================
// Animated Stat Counters
// ==========================================
function initCounterAnimations() {
    const statsSection = document.querySelector('.about-stats');
    if (!statsSection) return;

    const counters = [
        { index: 0, from: 7.5, to: 8.7,  duration: 1400, html: (v) => `${v.toFixed(1)}<span class="stat-sub">/9.0</span>` },
        { index: 1, from: 0,   to: 2,    duration: 900,  html: (v) => `${Math.floor(v)}x` },
        { index: 2, from: 480, to: 535,  duration: 1200, html: (v) => `${Math.floor(v)}+` },
    ];

    let fired = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !fired) {
                fired = true;
                const statEls = document.querySelectorAll('.stat-item .stat-number');
                counters.forEach(({ index, from, to, duration, html }) => {
                    const el = statEls[index];
                    if (!el) return;
                    const start = performance.now();
                    const tick = (now) => {
                        const p = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - p, 3);
                        el.innerHTML = html(from + (to - from) * eased);
                        if (p < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
}

// ==========================================
// Typewriter — Hero
// ==========================================
function initTypewriter() {
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    const phrases = [
        'Building Web3 apps and AI platforms.',
        'CS student at the University of Auckland.',
        'Hackathon builder. 2x winner.',
        'Frontend dev with a thing for ML.',
        'Technical Executive at GDG on Campus UoA.',
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const TYPING_SPEED = 48;
    const DELETE_SPEED = 24;
    const PAUSE_END = 2000;
    const PAUSE_START = 400;

    function tick() {
        const current = phrases[phraseIndex];

        if (!deleting) {
            el.textContent = current.slice(0, charIndex + 1);
            charIndex++;
            if (charIndex === current.length) {
                deleting = true;
                setTimeout(tick, PAUSE_END);
                return;
            }
            setTimeout(tick, TYPING_SPEED);
        } else {
            el.textContent = current.slice(0, charIndex - 1);
            charIndex--;
            if (charIndex === 0) {
                deleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(tick, PAUSE_START);
                return;
            }
            setTimeout(tick, DELETE_SPEED);
        }
    }

    setTimeout(tick, 900);
}

// ==========================================
// Project Filter
// ==========================================
function initProjectFilter() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards   = document.querySelectorAll('.project-card[data-category]');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            cards.forEach(card => {
                const cats = card.dataset.category || '';
                const visible = filter === 'all' || cats.split(' ').includes(filter);

                if (visible) {
                    // show: restore display first, then fade in
                    card.style.display = '';
                    requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                        card.style.pointerEvents = '';
                    });
                } else {
                    // hide: fade out, then remove from flow
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.93)';
                    card.style.pointerEvents = 'none';
                    setTimeout(() => {
                        if (card.style.opacity === '0') card.style.display = 'none';
                    }, 320);
                }
            });
        });
    });
}

// ==========================================
// Full-page background canvas (stars + lines)
// ==========================================
function initPageCanvas() {
    const canvas = document.getElementById('pageCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const STAR_COUNT = 100;
    const MAX_LINK   = 130;
    let W, H;
    let stars  = [];
    let mouse  = { x: -9999, y: -9999 };
    let raf    = null;
    let active = true;

    function isDark() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        spawnStars();
    }

    function spawnStars() {
        stars = Array.from({ length: STAR_COUNT }, () => ({
            x:  Math.random() * W,
            y:  Math.random() * H,
            r:  Math.random() * 1.3 + 0.3,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
            a:  Math.random() * 0.5 + 0.2,
        }));
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);

        const dark    = isDark();
        const dotRgb  = dark ? '180,220,255' : '14,165,233';
        const lineRgb = dark ? '14,165,233'  : '14,165,233';

        // Update positions
        stars.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;

            // Mouse repel
            const dx = s.x - mouse.x;
            const dy = s.y - mouse.y;
            const d  = Math.hypot(dx, dy);
            if (d < 90 && d > 0) {
                const f = (90 - d) / 90;
                s.x += (dx / d) * f * 1.6;
                s.y += (dy / d) * f * 1.6;
            }

            // Wrap edges
            if (s.x < 0) s.x = W;
            else if (s.x > W) s.x = 0;
            if (s.y < 0) s.y = H;
            else if (s.y > H) s.y = 0;
        });

        // Constellation lines
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const dx = stars[i].x - stars[j].x;
                const dy = stars[i].y - stars[j].y;
                const d  = Math.hypot(dx, dy);
                if (d < MAX_LINK) {
                    const alpha = (1 - d / MAX_LINK) * (dark ? 0.18 : 0.13);
                    ctx.beginPath();
                    ctx.moveTo(stars[i].x, stars[i].y);
                    ctx.lineTo(stars[j].x, stars[j].y);
                    ctx.strokeStyle = `rgba(${lineRgb},${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Star dots
        stars.forEach(s => {
            const alpha = dark ? s.a * 0.7 : s.a * 0.35;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${dotRgb},${alpha})`;
            ctx.fill();
        });

        if (active) raf = requestAnimationFrame(loop);
    }

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            active = false;
            cancelAnimationFrame(raf);
        } else {
            active = true;
            loop();
        }
    });

    // Track mouse across the whole page
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('resize', resize);

    resize();
    loop();
}

// ==========================================
// Chatbot Widget
// ==========================================
function initChatbot() {
    const widget   = document.getElementById('chatbotWidget');
    const toggle   = document.getElementById('chatbotToggle');
    const panel    = document.getElementById('chatbotPanel');
    const closeBtn = document.getElementById('chatbotCloseBtn');
    const messages = document.getElementById('chatbotMessages');
    const input    = document.getElementById('chatbotInput');
    const sendBtn  = document.getElementById('chatbotSend');

    if (!widget || !toggle || !panel) return;

    // ---- Knowledge base ----
    const kb = {
        email:    'puranjay.gambhir@gmail.com',
        linkedin: 'linkedin.com/in/pg142/',
        github:   'github.com/Puranjay2006',
        about:    "I started building for the web at 14. My team and I built the first ever digital magazine of our school: over 20,000 lines of code from scratch. I'm a CS student, hackathon builder, and frontend developer with a growing passion for AI and ML, currently studying at the University of Auckland.",
        degree:   'Bachelor of Science in Computer Science at the University of Auckland (2nd Year, Mar 2026 - Nov 2027)',
        prevEdu:  'Diploma in Science and Technology at Massey University, GPA 8.7/9.0 (A+ average)',
        minor:    'Minor in Artificial Intelligence & Data Science from IIT Mandi × Masai School',
        gpa:      '8.7/9.0 (A+ average) at Massey University',
        hackathons: "I've won 2 hackathons. 1st place at the DEVS x SESA 2026 Beginners Hackathon with StarGaze. Dual Sponsor Track Winner at WEB3UOA Hackathon. Won both the Avalanche and NewMoney tracks with L2Earn.",
        awards:   '1st Place DEVS x SESA 2026, Dual Sponsor Winner WEB3UOA, Youth Solves for India Contest Winner, Regional Finalist Wharton Global High School Investment Competition (Top 10 of 972 global teams), Grand Finale of Toycathon 2021, Most Studious Student 2025 at Massey.',
        projects: [
            'L2Earn: Web3 learn-to-earn DApp. Humans and AI agents earn NFT credentials and settle dNZD stablecoin rewards on Base Sepolia. Dual Sponsor Winner at WEB3UOA Hackathon.',
            'StarGaze: Stargazing planning app unifying cloud cover, light pollution, and live ISS tracking. 1st place, DEVS x SESA 2026 Hackathon.',
            'Civic Connect: AI-powered civic platform. Auto-categorises issues via Gemini API, visualises via Google Maps. Youth Solves for India Contest Winner.',
            'Route Continuity Gap Detector: Geospatial ML tool (IsolationForest + Shapely) built in a 24-hour hackathon sprint.',
            'noso Company Platform: Frontend of a full-stack web app with auth, bookings, payments, and admin dashboards.',
            'Capital Media Partners Website: Responsive company website with 300+ business records synced via Python automation.',
            'Community Wall Planners: 2025-2026 wall planners for 4 Auckland regions, designed in Adobe InDesign.',
            'Flying High Digital Magazine: My team and I built the first ever digital magazine of our school. Over 20,000 lines of code, 400+ hours of work.',
            'Yatree: Tourism app concept that reached the Grand Finale of Toycathon 2021 (Ministry of Education, India).',
        ],
        skills:       'Python, Java, JavaScript, TypeScript, C, C++, SQL, R, HTML, CSS. React, Next.js, Vite, Tailwind CSS, FastAPI, Streamlit, Pandas, NumPy, scikit-learn, TensorFlow. Web3: ENS, EAS, MetaMask, wagmi, viem, Base/Sepolia. Design: Adobe InDesign, Photoshop, Canva.',
        experience:   'Digital & Design Executive Intern at Capital Media Partners (Nov 2025 - Mar 2026): I built their website, automated 300+ business records via Python, led digital marketing to 535+ posts, and designed regional Wall Planners.',
        volunteering: "Technical Executive at Google Developer Groups on Campus, UoA (Mar 2026 - Present): I lead workshops and hackathons for a 180+ member community, organised ALLUNI 2026 (23 clubs, 9 cities), and delivered an NFC workshop to 40+ attendees. I'm also a TalkCampus Ambassador for mental health awareness since Aug 2025.",
        certifications: 'Supervised Machine Learning (DeepLearning.AI, Coursera), Advanced Learning Algorithms (DeepLearning.AI, Coursera), Certified Game Developer (WhiteHat Jr, 2021).',
        location:     'Auckland, New Zealand',
    };

    // ---- Follow-up map: topic -> suggested next questions ----
    const followUpMap = {
        greet:    ['Who are you?', 'What have you built?', 'What are your skills?'],
        identity: ['What have you built?', 'What is your experience?', 'How can I contact you?'],
        projects: ['Tell me about L2Earn', 'What hackathons have you won?', 'What tech do you use?'],
        l2earn:   ['What else have you built?', 'What are your Web3 skills?', 'What hackathons have you won?'],
        stargaze: ['What else have you built?', 'What is your education?', 'How can I contact you?'],
        civic:    ['What are your AI skills?', 'What other hackathons have you won?', 'What is your education?'],
        skills:   ['What have you built with these?', 'What are your ML skills?', 'What Web3 tools do you know?'],
        hackathon:['Tell me about L2Earn', 'Tell me about StarGaze', 'What other awards have you won?'],
        awards:   ['What hackathon projects have you built?', 'What is your education?', 'What are your skills?'],
        education:['What is your GPA?', 'What experience do you have?', 'What have you built?'],
        experience:['What projects came from your work?', 'What is GDG on Campus?', 'What are your skills?'],
        gdg:      ['What workshops have you run?', 'What other experience do you have?', 'What have you built?'],
        contact:  ['What are your skills?', 'What have you built?', 'What hackathons have you won?'],
        gpa:      ['What is your full education?', 'What have you built?', 'What are your skills?'],
        certs:    ['What are your other skills?', 'What have you built?', 'How can I contact you?'],
        location: ['What is your education?', 'What experience do you have?', 'How can I contact you?'],
        resume:   ['What are your skills?', 'What have you built?', 'How can I contact you?'],
        thanks:   ['What have you built?', 'What are your skills?', 'How can I contact you?'],
        fallback: ['Who are you?', 'What have you built?', 'How can I contact you?'],
    };

    // ---- Response logic — returns { text, topic } ----
    function getResponse(msg) {
        const m = msg.toLowerCase().trim();

        if (/^(hi|hey|hello|sup|yo|hiya|howdy|greetings)/.test(m))
            return { topic: 'greet', text: "Hey! Ask me anything: my projects, skills, experience, or how to get in touch." };

        if (/who (is|are) (puranjay|you|this)|tell me about (you|yourself|puranjay)|about you|introduce/.test(m))
            return { topic: 'identity', text: `${kb.about}\n\nI've won 2 hackathons and I'm currently the Technical Executive at GDG on Campus UoA.` };

        if (/l2earn/.test(m))
            return { topic: 'l2earn', text: `L2Earn is my Web3 learn-to-earn DApp, built at WEB3UOA Hackathon. Humans and AI agents complete learning modules, earn NFT credentials via EAS attestation, and settle dNZD stablecoin rewards on Base Sepolia. It won both the Avalanche and NewMoney sponsor tracks.\n\nStack: Next.js, React, TypeScript, Tailwind, wagmi, viem, ENS, EAS.` };

        if (/stargaze/.test(m))
            return { topic: 'stargaze', text: `StarGaze is a stargazing planning app that won 1st place at the DEVS x SESA 2026 Beginners Hackathon. It unifies cloud cover (Open-Meteo), light pollution maps, and live ISS tracking into one tool. Built in 48 hours.\n\nStack: React, TypeScript, Vite, Tailwind CSS, Framer Motion.` };

        if (/civic connect/.test(m))
            return { topic: 'civic', text: `Civic Connect is an AI-powered civic platform that won the Youth Solves for India contest (IIT Mandi × Masai). It auto-categorises civic issues using the Gemini API and visualises them on Google Maps in real time. Built in a 48-hour hackathon sprint.\n\nStack: TypeScript, React, Vite, Gemini API, Google Maps API.` };

        if (/project|built|build|made|shipped|portfolio|route|magazine|yatree|noso|wall planner/.test(m)) {
            const list = kb.projects.map((p, i) => `${i + 1}. ${p}`).join('\n');
            return { topic: 'projects', text: `Here's what I've built:\n\n${list}\n\nFull list on GitHub: ${kb.github}` };
        }

        if (/web3|blockchain|nft|solidity|wagmi|viem|ens|eas|stablecoin/.test(m))
            return { topic: 'skills', text: `My Web3 stack: ENS, EAS, MetaMask, NFT minting, wagmi, viem, Base/Sepolia, dNZD stablecoin integration. I built L2Earn at WEB3UOA Hackathon using this stack and won both sponsor tracks.` };

        if (/machine learning|ml|ai skill|scikit|tensorflow|neural|random forest|xgboost/.test(m))
            return { topic: 'skills', text: `My ML skills: supervised and unsupervised learning, neural networks, ensemble methods (XGBoost, random forests), anomaly detection, transfer learning, model evaluation. I use Python with scikit-learn, TensorFlow, Pandas, and NumPy. My ML minor is from IIT Mandi × Masai School.` };

        if (/skill|tech|stack|language|framework|know|use|tools/.test(m))
            return { topic: 'skills', text: `My full stack:\n\n${kb.skills}\n\nI'm strongest in React/Next.js (frontend), Python (ML and automation), and Web3 tooling.` };

        if (/hackathon|win|won|winner|devs|sesa|web3uoa|avalanche|newmoney/.test(m))
            return { topic: 'hackathon', text: `${kb.hackathons}\n\nI also won the Youth Solves for India contest at IIT Mandi × Masai, and reached the Grand Finale of Toycathon 2021 (Ministry of Education, India).` };

        if (/award|achiev|accomplish|wharton|toycathon|studious|recognition/.test(m))
            return { topic: 'awards', text: `My awards:\n\n${kb.awards}` };

        if (/educ|study|studying|university|auckland|massey|degree|course|iit|minor/.test(m))
            return { topic: 'education', text: `I'm currently studying: ${kb.degree}.\n\nPreviously: ${kb.prevEdu}.\n\nI'm also completing: ${kb.minor}.` };

        if (/gpa|grade|marks|score|result|academic/.test(m))
            return { topic: 'gpa', text: `At Massey University I achieved ${kb.gpa}. I was awarded Most Studious Student 2025 and received "Excelling" academic progress in both semesters.` };

        if (/experience|intern|work|job|capital media|career/.test(m))
            return { topic: 'experience', text: `Work: ${kb.experience}\n\nVolunteering: ${kb.volunteering}` };

        if (/gdg|google|developer group|gdgc|tech exec|leadership|workshop|alluni/.test(m))
            return { topic: 'gdg', text: `I'm the Technical Executive at Google Developer Groups on Campus, UoA (since March 2026). I lead workshops and hackathons for a 180+ member community, organised ALLUNI 2026 (23 clubs, 9 cities), and delivered an NFC workshop to 40+ attendees.` };

        if (/contact|reach|email|linkedin|social|hire|hiring|available|get in touch|connect/.test(m))
            return { topic: 'contact', text: `Best ways to reach me:\n\nEmail: ${kb.email}\nLinkedIn: ${kb.linkedin}\nGitHub: ${kb.github}\n\nI'm pretty quick to respond.` };

        if (/where|location|city|country|based|live|nz|new zealand/.test(m))
            return { topic: 'location', text: `I'm based in ${kb.location}, studying at the University of Auckland.` };

        if (/cert|certif|coursera|deeplearning|tensorflow|game dev/.test(m))
            return { topic: 'certs', text: `My certifications: ${kb.certifications}` };

        if (/resume|cv/.test(m))
            return { topic: 'resume', text: "You can download my resume using the Resume button in the top navigation. It covers my full education, experience, projects, and skills." };

        if (/hobby|hobbies|interest|fun|personal|free time|enjoy|passion/.test(m))
            return { topic: 'identity', text: "I enjoy building hackathon projects, exploring AI and ML, working on frontend development, and running workshops through GDGC." };

        if (/thank|thanks|ty|appreciate|great|cool|awesome|nice|helpful/.test(m))
            return { topic: 'thanks', text: "Happy to chat! Feel free to ask anything else, or reach me directly at puranjay.gambhir@gmail.com." };

        if (/bye|goodbye|see ya|later|cya/.test(m))
            return { topic: null, text: "Take care! Feel free to reach me directly at puranjay.gambhir@gmail.com." };

        return { topic: 'fallback', text: "Not sure about that one. You can reach me at puranjay.gambhir@gmail.com or on LinkedIn for anything specific. What else can I help with?" };
    }

    // ---- DOM helpers ----
    function addMsg(text, isUser) {
        const div = document.createElement('div');
        div.className = `chatbot-msg ${isUser ? 'chatbot-msg--user' : 'chatbot-msg--bot'}`;
        div.innerHTML = text.replace(/\n/g, '<br>');
        messages.appendChild(div);
        scrollBottom();
        return div;
    }

    function addFollowUps(topic) {
        const options = followUpMap[topic];
        if (!options || !options.length) return;
        const row = document.createElement('div');
        row.className = 'chatbot-followups';
        options.forEach(q => {
            const btn = document.createElement('button');
            btn.className = 'chatbot-chip';
            btn.textContent = q;
            btn.addEventListener('click', () => sendMessage(q));
            row.appendChild(btn);
        });
        messages.appendChild(row);
        scrollBottom();
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'chatbot-msg chatbot-msg--typing';
        div.id = 'chatbotTyping';
        div.innerHTML = '<div class="chatbot-typing-dots"><span></span><span></span><span></span></div>';
        messages.appendChild(div);
        scrollBottom();
    }

    function removeTyping() {
        const t = document.getElementById('chatbotTyping');
        if (t) t.remove();
    }

    function scrollBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    // ---- Render initial welcome state ----
    function renderWelcome() {
        const welcome = document.createElement('div');
        welcome.className = 'chatbot-msg chatbot-msg--bot';
        welcome.innerHTML = "Hey, I'm Puranjay. Ask me anything: my projects, experience, skills, or just how to reach me.";
        messages.appendChild(welcome);

        const row = document.createElement('div');
        row.className = 'chatbot-followups';
        ['Who are you?', 'What have you built?', 'What are your skills?', 'How can I contact you?'].forEach(q => {
            const btn = document.createElement('button');
            btn.className = 'chatbot-chip';
            btn.textContent = q;
            btn.addEventListener('click', () => sendMessage(q));
            row.appendChild(btn);
        });
        messages.appendChild(row);
    }

    // ---- Send message ----
    function sendMessage(text) {
        const trimmed = text.trim();
        if (!trimmed) return;

        addMsg(trimmed, true);
        input.value = '';

        showTyping();
        setTimeout(() => {
            removeTyping();
            const { text: reply, topic } = getResponse(trimmed);
            addMsg(reply, false);
            if (topic) addFollowUps(topic);
        }, 550);
    }

    // ---- Open / close ----
    function openPanel() {
        widget.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        setTimeout(() => input.focus(), 280);
    }

    function closePanel() {
        widget.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
    }

    toggle.addEventListener('click', () =>
        widget.classList.contains('open') ? closePanel() : openPanel()
    );
    closeBtn.addEventListener('click', closePanel);

    sendBtn.addEventListener('click', () => sendMessage(input.value));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(input.value); });

    // Render initial state
    renderWelcome();
}

// ==========================================
// Console Easter Egg
// ==========================================
console.log('%c👋 Hello there!', 'font-size: 24px; font-weight: bold;');
console.log('%cThanks for checking out my portfolio!', 'font-size: 14px;');
console.log('%cFeel free to reach out: https://www.linkedin.com/in/pg142/', 'font-size: 12px; color: #0ea5e9;');

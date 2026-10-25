/* ============================================
   Ivan Abdurrafie - Portfolio Scripts
   Modular, accessible, performant
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // DARK MODE
    // ============================================
    function initDarkMode() {
        var html = document.documentElement;
        var toggle = document.getElementById('themeToggle');
        var currentTheme = localStorage.getItem('theme');

        // Restore saved theme
        if (currentTheme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else if (currentTheme === 'light') {
            html.removeAttribute('data-theme');
        }

        // Event listener
        if (toggle) {
            toggle.addEventListener('click', function() {
                if (html.getAttribute('data-theme')) {
                    html.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'light');
                } else {
                    html.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                }
            });
        }
    }

    // ============================================
    // MOBILE MENU
    // ============================================
    function initMobileMenu() {
        var hamburger = document.getElementById('hamburger');
        var navLinks = document.getElementById('navLinks');

        if (!hamburger || !navLinks) return;

        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('open');
            var isOpen = navLinks.classList.contains('open');
            hamburger.setAttribute('aria-expanded', isOpen);
            hamburger.textContent = isOpen ? '✕' : '☰';
        });

        // Close menu on link click
        navLinks.querySelectorAll('.nav-link').forEach(function(link) {
            link.addEventListener('click', function() {
                navLinks.classList.remove('open');
                hamburger.setAttribute('aria-expanded', false);
                hamburger.textContent = '☰';
            });
        });
    }

    // ============================================
    // SCROLL PROGRESS
    // ============================================
    function initScrollProgress() {
        const progressBar = document.getElementById('scrollProgress');
        if (!progressBar) return;

        let ticking = false;

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    const scrollTop = window.scrollY;
                    const docHeight = document.body.scrollHeight - window.innerHeight;
                    const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
                    progressBar.style.width = scrollPercent + '%';
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ============================================
    // GSAP ANIMATIONS
    // ============================================
    function initGSAPAnimations() {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP not loaded, skipping animations');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // Hero entrance timeline
        var heroTimeline = gsap.timeline({
            defaults: { ease: 'power2.out' },
            delay: 0.1
        });

        heroTimeline
            .from('.nav-logo', {
                opacity: 0,
                scale: 0.8,
                duration: 0.5,
                ease: 'back.out(1.7)'
            })
            .from('.tag', {
                y: 25,
                opacity: 0,
                duration: 0.55
            }, '-=0.3')
            .from('.hero-title .title-line', {
                yPercent: 100,
                duration: 0.7,
                stagger: 0.12,
                ease: 'power3.out'
            }, '-=0.35')
            .from('.hero-subtitle-col', {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1
            }, '-=0.3')
            .from('.hero-actions .btn', {
                y: 20,
                opacity: 0,
                duration: 0.45,
                stagger: 0.1
            }, '-=0.25')
            .from('.nav-toggle', {
                opacity: 0,
                rotation: -15,
                duration: 0.35
            }, '-=0.2');

        // Nav links
        gsap.from('.nav-link', {
            opacity: 0,
            y: 10,
            duration: 0.3,
            stagger: 0.05,
            delay: 0.5,
            onComplete: function() {
                gsap.set('.nav-link', { opacity: 1, y: 0 });
            }
        });

        // Scroll-triggered animations
        initScrollAnimations();
    }

    function initScrollAnimations() {
        // Metrics
        gsap.from('.stat-item', {
            x: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            scrollTrigger: { trigger: '.metrics-strip', start: 'top 85%', once: true }
        });

        // Section titles
        document.querySelectorAll('.section-header').forEach(function(header) {
            var title = header.querySelector('.section-title');
            if (title) {
                gsap.from(title, {
                    y: 15,
                    opacity: 0,
                    duration: 0.5,
                    scrollTrigger: { trigger: header, start: 'top 85%', once: true }
                });
            }
        });

        // About
        gsap.from('.about-text', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            scrollTrigger: { trigger: '#about', start: 'top 80%', once: true }
        });

        // Skills
        gsap.from('.skill-card', {
            y: 25,
            opacity: 0,
            duration: 0.6,
            stagger: 0.12,
            scrollTrigger: { trigger: '.skills-grid', start: 'top 80%', once: true }
        });

        // Projects
        gsap.from('.project-card', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.15,
            scrollTrigger: { trigger: '.projects-grid', start: 'top 80%', once: true }
        });

        gsap.from('.project-metric', {
            scale: 0.98,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            scrollTrigger: { trigger: '.projects-grid', start: 'top 70%', once: true }
        });

        // Timeline
        gsap.from('.timeline-row', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.12,
            scrollTrigger: { trigger: '.timeline-table', start: 'top 80%', once: true }
        });

        // Contact
        gsap.from('.contact-link', {
            y: 20,
            opacity: 0,
            duration: 0.4,
            stagger: 0.08,
            scrollTrigger: { trigger: '.contact-links', start: 'top 85%', once: true }
        });

        // Footer
        gsap.from('.footer', {
            y: 15,
            opacity: 0,
            duration: 0.4,
            scrollTrigger: { trigger: '.footer', start: 'top 90%', once: true }
        });
    }

    // ============================================
    // ACTIVE SECTION HIGHLIGHTING
    // ============================================
    function initSectionHighlighting() {
        if (typeof ScrollTrigger === 'undefined') return;

        var sections = ['about', 'metrics', 'capabilities', 'systems', 'timeline', 'education', 'connect'];
        var activeSection = null;
        var debounceTimer = null;
        var DEBOUNCE_DELAY = 100;

        function setActive(sectionId) {
            document.querySelectorAll('.nav-link').forEach(function(link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });
        }

        function clearActive() {
            document.querySelectorAll('.nav-link.active').forEach(function(link) {
                link.classList.remove('active');
            });
        }

        sections.forEach(function(sectionId) {
            ScrollTrigger.create({
                trigger: '#' + sectionId,
                start: 'top 70%',
                end: 'top 30%',
                onEnter: function() {
                    if (debounceTimer) clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(function() {
                        clearActive();
                        activeSection = sectionId;
                        setActive(sectionId);
                    }, DEBOUNCE_DELAY);
                },
                onEnterBack: function() {
                    if (debounceTimer) clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(function() {
                        clearActive();
                        activeSection = sectionId;
                        setActive(sectionId);
                    }, DEBOUNCE_DELAY);
                }
            });
        });
    }

    // ============================================
    // SCRAMBLE EFFECT (minimal ":" hover)
    // ============================================
    function initScrambleEffect() {
        var heroTitle = document.getElementById('heroTitle');
        if (!heroTitle || typeof gsap === 'undefined') return;

        var splitElements = heroTitle.querySelectorAll('[data-split]');
        var allChars = [];

        splitElements.forEach(function(el) {
            var text = el.textContent;
            el.innerHTML = '';
            Array.from(text).forEach(function(char) {
                var span = document.createElement('span');
                span.className = 'char';
                span.dataset.content = char;
                span.textContent = char;
                el.appendChild(span);
                allChars.push(span);
            });
        });

        heroTitle.addEventListener('pointermove', function(e) {
            allChars.forEach(function(char) {
                var rect = char.getBoundingClientRect();
                var cx = rect.left + rect.width / 2;
                var cy = rect.top + rect.height / 2;
                var dx = e.clientX - cx;
                var dy = e.clientY - cy;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    var intensity = 1 - dist / 120;
                    var duration = 1.2 + (1 - intensity) * 0.8;
                    var original = char.dataset.content;
                    var frame = 0;
                    var totalFrames = Math.floor(12 + intensity * 18);

                    gsap.killTweensOf(char);
                    gsap.to(char, {
                        duration: duration,
                        ease: 'power2.out',
                        onUpdate: function() {
                            frame++;
                            char.textContent = frame < totalFrames ? ':' : original;
                        }
                    });
                }
            });
        });
    }

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    function initSmoothScroll() {
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                var href = this.getAttribute('href');
                if (href === '#') return;

                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: reducedMotion.matches ? 'instant' : 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ============================================
    // INIT
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Lucide Icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        initDarkMode();
        initMobileMenu();
        initScrollProgress();
        initSmoothScroll();

        if (!reducedMotion.matches && typeof gsap !== 'undefined') {
            initGSAPAnimations();
            initScrambleEffect();
            initSectionHighlighting();
        }

        // Reduced motion fallback
        reducedMotion.addEventListener('change', function(e) {
            if (e.matches && typeof gsap !== 'undefined') {
                gsap.globalTimeline.timeScale(0);
            } else if (typeof gsap !== 'undefined') {
                gsap.globalTimeline.timeScale(1);
            }
        });
    });

})();

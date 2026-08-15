/**
 * FORMA STUDIO — JavaScript
 * Handles parallax, scroll reveals, navigation, and interactions
 */

(function() {
    'use strict';

    // --------------------------------------------
    // Configuration
    // --------------------------------------------
    const CONFIG = {
        parallaxIntensity: {
            desktop: 1,
            tablet: 0.5,
            mobile: 0.25
        },
        revealThreshold: 0.2,
        counterDuration: 2000,
        scrollThrottle: 16, // ~60fps
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    // --------------------------------------------
    // Utility Functions
    // --------------------------------------------
    function throttle(fn, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // --------------------------------------------
    // Theme Toggle
    // --------------------------------------------
    const ThemeToggle = {
        init() {
            this.button = document.querySelector('.theme-toggle');
            if (!this.button) return;

            this.button.addEventListener('click', () => this.toggle());
        },

        toggle() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
        }
    };

    // --------------------------------------------
    // Scroll Progress Indicator
    // --------------------------------------------
    const ScrollProgress = {
        init() {
            this.element = document.querySelector('.scroll-progress');
            if (!this.element) return;

            window.addEventListener('scroll', throttle(() => this.update(), CONFIG.scrollThrottle), { passive: true });
            this.update();
        },

        update() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            this.element.style.width = `${progress}%`;
        }
    };

    // --------------------------------------------
    // Header State
    // --------------------------------------------
    const Header = {
        init() {
            this.header = document.querySelector('.header');
            if (!this.header) return;

            window.addEventListener('scroll', throttle(() => this.update(), CONFIG.scrollThrottle), { passive: true });
            this.update();
        },

        update() {
            const scrollY = window.pageYOffset;
            if (scrollY > 50) {
                this.header.classList.add('header--scrolled');
            } else {
                this.header.classList.remove('header--scrolled');
            }
        }
    };

    // --------------------------------------------
    // Mobile Menu
    // --------------------------------------------
    const MobileMenu = {
        init() {
            this.toggle = document.querySelector('.mobile-menu-toggle');
            this.menu = document.getElementById('mobile-menu');
            this.backdrop = document.querySelector('.mobile-menu-backdrop');
            this.links = document.querySelectorAll('.mobile-menu__link');
            
            if (!this.toggle || !this.menu) return;

            this.toggle.addEventListener('click', () => this.toggleMenu());
            this.backdrop?.addEventListener('click', () => this.close());
            
            this.links.forEach(link => {
                link.addEventListener('click', () => this.close());
            });

            // Close on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        },

        toggleMenu() {
            this.isOpen ? this.close() : this.open();
        },

        open() {
            this.isOpen = true;
            this.menu.classList.add('mobile-menu--open');
            this.backdrop?.classList.add('mobile-menu-backdrop--visible');
            document.body.classList.add('mobile-menu-open');
            this.toggle.setAttribute('aria-expanded', 'true');
        },

        close() {
            this.isOpen = false;
            this.menu.classList.remove('mobile-menu--open');
            this.backdrop?.classList.remove('mobile-menu-backdrop--visible');
            document.body.classList.remove('mobile-menu-open');
            this.toggle.setAttribute('aria-expanded', 'false');
        }
    };

    // --------------------------------------------
    // Active Navigation Highlighting
    // --------------------------------------------
    const ActiveNav = {
        init() {
            this.sections = document.querySelectorAll('section[id]');
            this.navLinks = document.querySelectorAll('.nav__link');
            
            if (!this.sections.length || !this.navLinks.length) return;

            window.addEventListener('scroll', throttle(() => this.update(), CONFIG.scrollThrottle), { passive: true });
            this.update();
        },

        update() {
            const scrollY = window.pageYOffset + (window.innerHeight / 3);

            this.sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    this.navLinks.forEach(link => {
                        link.classList.remove('nav__link--active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('nav__link--active');
                        }
                    });
                }
            });
        }
    };

    // --------------------------------------------
    // Scroll Reveal Animations
    // --------------------------------------------
    const ScrollReveal = {
        init() {
            if (CONFIG.reducedMotion) {
                // Show all items immediately if reduced motion is preferred
                document.querySelectorAll('.reveal-item').forEach(item => {
                    item.classList.add('reveal-item--visible');
                });
                return;
            }

            this.items = document.querySelectorAll('.reveal-item');
            if (!this.items.length) return;

            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                { threshold: CONFIG.revealThreshold, rootMargin: '0px 0px -50px 0px' }
            );

            this.items.forEach(item => this.observer.observe(item));
        },

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-item--visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }
    };

    // --------------------------------------------
    // Parallax Manager
    // --------------------------------------------
    const ParallaxManager = {
        layers: [],
        cards: [],
        mouseParallax: null,
        ticking: false,
        currentIntensity: 1,

        init() {
            // Detect device and set intensity
            this.setIntensity();

            // Collect parallax layers
            document.querySelectorAll('[data-parallax]').forEach(el => {
                this.layers.push({
                    element: el,
                    speed: parseFloat(el.dataset.parallax) || 0.2,
                    offset: 0,
                    initialY: 0
                });
            });

            // Collect parallax cards
            document.querySelectorAll('[data-parallax-card]').forEach(el => {
                this.cards.push({
                    element: el,
                    speed: parseFloat(el.dataset.parallaxCard) || 0.2,
                    offset: 0,
                    initialY: 0
                });
            });

            // Setup hero mouse parallax
            this.setupMouseParallax();

            // Start animation loop
            if (!CONFIG.reducedMotion && (this.layers.length || this.cards.length || this.mouseParallax)) {
                this.bindEvents();
                this.update();
            }
        },

        setIntensity() {
            const width = window.innerWidth;
            if (width < 768) {
                this.currentIntensity = CONFIG.parallaxIntensity.mobile;
            } else if (width < 1024) {
                this.currentIntensity = CONFIG.parallaxIntensity.tablet;
            } else {
                this.currentIntensity = CONFIG.parallaxIntensity.desktop;
            }
        },

        setupMouseParallax() {
            const heroLayers = document.querySelector('.hero__layers');
            if (!heroLayers || window.matchMedia('(max-width: 768px)').matches) return;

            this.mouseParallax = {
                element: heroLayers,
                layers: [],
                centerX: window.innerWidth / 2,
                centerY: window.innerHeight / 2,
                mouseX: 0,
                mouseY: 0,
                targetX: 0,
                targetY: 0
            };

            // Get all hero parallax layers
            const heroLayerElements = heroLayers.querySelectorAll('[data-parallax]');
            heroLayerElements.forEach(layer => {
                this.mouseParallax.layers.push({
                    element: layer,
                    speed: parseFloat(layer.dataset.parallax) || 0.2,
                    depth: parseFloat(layer.dataset.parallax) * 20
                });
            });

            // Track mouse position
            document.addEventListener('mousemove', (e) => {
                if (this.mouseParallax) {
                    this.mouseParallax.mouseX = e.clientX;
                    this.mouseParallax.mouseY = e.clientY;
                }
            });
        },

        bindEvents() {
            window.addEventListener('scroll', throttle(() => this.onScroll(), CONFIG.scrollThrottle), { passive: true });
            window.addEventListener('resize', throttle(() => {
                this.setIntensity();
                this.onResize();
            }, 100), { passive: true });
        },

        onScroll() {
            this.scrollY = window.pageYOffset;
            if (!this.ticking) {
                requestAnimationFrame(() => this.update());
                this.ticking = true;
            }
        },

        onResize() {
            if (this.mouseParallax) {
                this.mouseParallax.centerX = window.innerWidth / 2;
                this.mouseParallax.centerY = window.innerHeight / 2;
            }
        },

        update() {
            this.ticking = false;

            // Update scroll-based parallax
            this.layers.forEach(layer => {
                const rect = layer.element.getBoundingClientRect();
                const viewportCenter = window.innerHeight / 2;
                const elementCenter = rect.top + rect.height / 2;
                const distanceFromCenter = elementCenter - viewportCenter;
                
                layer.offset = distanceFromCenter * layer.speed * this.currentIntensity * -1;
                layer.element.style.transform = `translateY(${layer.offset}px)`;
                layer.element.style.setProperty('--parallax-offset', layer.offset);
            });

            this.cards.forEach(card => {
                const rect = card.element.getBoundingClientRect();
                const viewportCenter = window.innerHeight / 2;
                const elementCenter = rect.top + rect.height / 2;
                const distanceFromCenter = elementCenter - viewportCenter;
                
                card.offset = distanceFromCenter * card.speed * this.currentIntensity * -1;
                card.element.style.transform = `translateY(${card.offset}px)`;
                card.element.style.setProperty('--parallax-offset', card.offset);
            });

            // Update mouse-based parallax
            if (this.mouseParallax && !CONFIG.reducedMotion) {
                const dx = this.mouseParallax.mouseX - this.mouseParallax.centerX;
                const dy = this.mouseParallax.mouseY - this.mouseParallax.centerY;

                this.mouseParallax.targetX = lerp(this.mouseParallax.targetX, dx * 0.1, 0.05);
                this.mouseParallax.targetY = lerp(this.mouseParallax.targetY, dy * 0.1, 0.05);

                this.mouseParallax.layers.forEach(layer => {
                    const moveX = this.mouseParallax.targetX * layer.depth;
                    const moveY = this.mouseParallax.targetY * layer.depth;
                    layer.element.style.transform = `translate(${moveX}px, ${moveY}px)`;
                });
            }
        }
    };

    // --------------------------------------------
    // Counter Animation
    // --------------------------------------------
    const CounterAnimation = {
        init() {
            this.counters = document.querySelectorAll('[data-counter]');
            if (!this.counters.length) return;

            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                { threshold: 0.5 }
            );

            this.counters.forEach(counter => this.observer.observe(counter));
        },

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    this.animateCounter(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        },

        animateCounter(element) {
            element.classList.add('counted');
            
            const target = parseInt(element.dataset.counter, 10);
            const duration = CONFIG.counterDuration;
            const startTime = performance.now();
            
            const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutQuart(progress);
                const current = Math.round(target * easedProgress);
                
                element.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.textContent = target;
                }
            };

            requestAnimationFrame(update);
        }
    };

    // --------------------------------------------
    // Smooth Scroll for Navigation
    // --------------------------------------------
    const SmoothScroll = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => this.handleClick(e, anchor));
            });
        },

        handleClick(e, anchor) {
            const href = anchor.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: CONFIG.reducedMotion ? 'auto' : 'smooth'
            });

            // Update URL without jumping
            history.pushState(null, '', href);
        }
    };

    // --------------------------------------------
    // Initialize Everything
    // --------------------------------------------
    function init() {
        ThemeToggle.init();
        ScrollProgress.init();
        Header.init();
        MobileMenu.init();
        ActiveNav.init();
        ScrollReveal.init();
        ParallaxManager.init();
        CounterAnimation.init();
        SmoothScroll.init();

        // Log initialization complete (remove in production)
        console.log('Forma Studio — Initialized');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

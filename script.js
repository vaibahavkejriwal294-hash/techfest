/* ============================================
   TECH FEST 2K26 - JAVASCRIPT
   ============================================ */

// ============================================
// THREE.JS 3D SCENE
// ============================================
class HeroScene {
    constructor() {
        this.canvas = document.getElementById('hero-canvas');
        if (!this.canvas) return; // Exit if no canvas

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.objects = [];
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);

        // Camera position
        this.camera.position.z = 30;

        // Create objects
        this.createGeometries();
        this.createParticles();

        // Event listeners
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Start animation
        this.animate();
    }

    createGeometries() {
        // Materials with glowing effect
        const materials = [
            new THREE.MeshBasicMaterial({
                color: 0x00f0ff,
                wireframe: true,
                transparent: true,
                opacity: 0.6
            }),
            new THREE.MeshBasicMaterial({
                color: 0xff00ff,
                wireframe: true,
                transparent: true,
                opacity: 0.6
            }),
            new THREE.MeshBasicMaterial({
                color: 0x8b5cf6,
                wireframe: true,
                transparent: true,
                opacity: 0.6
            })
        ];

        // Create multiple geometric shapes
        const geometries = [
            new THREE.IcosahedronGeometry(8, 1),
            new THREE.TorusGeometry(6, 2, 16, 100),
            new THREE.OctahedronGeometry(5, 0),
            new THREE.DodecahedronGeometry(4, 0)
        ];

        // Main large shape in center
        const mainGeometry = new THREE.IcosahedronGeometry(12, 1);
        const mainMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
        mainMesh.position.set(0, 0, -10);
        this.scene.add(mainMesh);
        this.objects.push({ mesh: mainMesh, rotationSpeed: { x: 0.001, y: 0.002 } });

        // Secondary torus
        const torusGeometry = new THREE.TorusGeometry(18, 0.5, 16, 100);
        const torusMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
        torusMesh.rotation.x = Math.PI / 2;
        torusMesh.position.set(0, 0, -10);
        this.scene.add(torusMesh);
        this.objects.push({ mesh: torusMesh, rotationSpeed: { x: 0, y: 0, z: 0.003 } });

        // Additional floating shapes
        for (let i = 0; i < 8; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = materials[Math.floor(Math.random() * materials.length)].clone();
            material.opacity = 0.3 + Math.random() * 0.3;

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30 - 20
            );
            mesh.scale.setScalar(0.3 + Math.random() * 0.5);

            this.scene.add(mesh);
            this.objects.push({
                mesh,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.01,
                    y: (Math.random() - 0.5) * 0.01,
                    z: (Math.random() - 0.5) * 0.005
                },
                floatOffset: Math.random() * Math.PI * 2,
                floatSpeed: 0.5 + Math.random() * 0.5
            });
        }
    }

    createParticles() {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorOptions = [
            new THREE.Color(0x00f0ff),
            new THREE.Color(0xff00ff),
            new THREE.Color(0x8b5cf6)
        ];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 50 - 25;

            const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        this.particles.push(particles);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // Animate objects
        this.objects.forEach((obj, index) => {
            obj.mesh.rotation.x += obj.rotationSpeed.x || 0;
            obj.mesh.rotation.y += obj.rotationSpeed.y || 0;
            obj.mesh.rotation.z += obj.rotationSpeed.z || 0;

            // Floating animation
            if (obj.floatOffset !== undefined) {
                obj.mesh.position.y += Math.sin(time * obj.floatSpeed + obj.floatOffset) * 0.01;
            }
        });

        // Animate particles
        this.particles.forEach(particle => {
            particle.rotation.y += 0.0002;
            particle.rotation.x += 0.0001;
        });

        // Camera follows mouse slightly
        this.camera.position.x += (this.mouse.x * 3 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouse.y * 2 - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
}

// ============================================
// NAVIGATION
// ============================================
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');

        if (!this.navbar || !this.navToggle || !this.navMenu) return;

        this.init();
    }

    init() {
        // Scroll effect
        window.addEventListener('scroll', () => this.onScroll());

        // Mobile menu toggle
        this.navToggle.addEventListener('click', () => this.toggleMenu());

        // Close menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
    }

    onScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    toggleMenu() {
        this.navToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    }

    closeMenu() {
        this.navToggle.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// COUNTDOWN TIMER
// ============================================
class CountdownTimer {
    constructor() {
        // Set event date (January 15, 2026)
        this.eventDate = new Date('January 15, 2026 09:00:00').getTime();
        this.daysEl = document.getElementById('days');
        this.hoursEl = document.getElementById('hours');
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');

        // Only initialize if all elements exist
        if (!this.daysEl || !this.hoursEl || !this.minutesEl || !this.secondsEl) return;

        this.init();
    }

    init() {
        this.update();
        setInterval(() => this.update(), 1000);
    }

    update() {
        const now = new Date().getTime();
        const distance = this.eventDate - now;

        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            this.daysEl.textContent = String(days).padStart(2, '0');
            this.hoursEl.textContent = String(hours).padStart(2, '0');
            this.minutesEl.textContent = String(minutes).padStart(2, '0');
            this.secondsEl.textContent = String(seconds).padStart(2, '0');
        } else {
            this.daysEl.textContent = '00';
            this.hoursEl.textContent = '00';
            this.minutesEl.textContent = '00';
            this.secondsEl.textContent = '00';
        }
    }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.section-header, .about-text, .about-visual, .feature-card, .stat-card, .team-card, .event-card, .register-info, .register-form-container, .info-card, .highlight-card, .vm-card, .faq-item, .advisor-card, .team-card-simple');

        if (this.elements.length === 0) return;

        this.init();
    }

    init() {
        // Add reveal class to all elements
        this.elements.forEach(el => el.classList.add('reveal'));

        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(el => observer.observe(el));
    }
}

// ============================================
// STATS COUNTER
// ============================================
class StatsCounter {
    constructor() {
        this.stats = document.querySelectorAll('.stat-card');
        this.animated = false;

        if (this.stats.length === 0) return;

        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animated = true;
                    this.animateStats();
                }
            });
        }, { threshold: 0.5 });

        this.stats.forEach(stat => observer.observe(stat));
    }

    animateStats() {
        this.stats.forEach(stat => {
            const targetValue = parseInt(stat.dataset.count);
            const numberEl = stat.querySelector('.stat-number');
            if (!numberEl || isNaN(targetValue)) return;

            let currentValue = 0;
            const increment = targetValue / 60;
            const duration = 2000;
            const stepTime = duration / 60;

            const counter = setInterval(() => {
                currentValue += increment;
                if (currentValue >= targetValue) {
                    numberEl.textContent = targetValue.toLocaleString() + '+';
                    clearInterval(counter);
                } else {
                    numberEl.textContent = Math.floor(currentValue).toLocaleString();
                }
            }, stepTime);
        });
    }
}

// ============================================
// EVENTS FILTER
// ============================================
class EventsFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.eventCards = document.querySelectorAll('.event-card');

        if (this.filterBtns.length === 0) return;

        this.init();
    }

    init() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.filter(btn));
        });
    }

    filter(activeBtn) {
        // Update active button
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');

        const filterValue = activeBtn.dataset.filter;

        this.eventCards.forEach(card => {
            if (filterValue === 'all' || card.dataset.category === filterValue) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// ============================================
// CURSOR GLOW
// ============================================
class CursorGlow {
    constructor() {
        this.cursor = document.getElementById('cursorGlow');

        if (!this.cursor) return;

        if (window.matchMedia('(pointer: fine)').matches) {
            this.init();
        }
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
        });
    }
}

// ============================================
// REGISTRATION FORM
// ============================================
class RegistrationForm {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.modal = document.getElementById('successModal');

        if (!this.form) return;

        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        // Simple validation - check for firstName or name field
        const firstName = data.firstName || data.name;
        if (!firstName || !data.email || !data.phone || !data.school || !data.grade) {
            this.showError('Please fill in all required fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        // Simulate form submission
        this.showLoading();

        setTimeout(() => {
            this.hideLoading();
            this.showSuccess();
            this.form.reset();
        }, 1500);
    }

    showError(message) {
        alert(message);
    }

    showLoading() {
        const submitBtn = this.form.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.innerHTML = '<span>Processing...</span>';
            submitBtn.disabled = true;
        }
    }

    hideLoading() {
        const submitBtn = this.form.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.innerHTML = `
                <span>Complete Registration</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            `;
            submitBtn.disabled = false;
        }
    }

    showSuccess() {
        if (this.modal) {
            this.modal.classList.add('active');
        }
    }
}

// Close modal function
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// PARALLAX EFFECTS
// ============================================
class ParallaxEffects {
    constructor() {
        this.floatingCards = document.querySelectorAll('.float-card');

        if (this.floatingCards.length === 0) return;

        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.onScroll());
    }

    onScroll() {
        const scrollY = window.scrollY;

        this.floatingCards.forEach((card, index) => {
            const speed = 0.02 + (index * 0.01);
            card.style.transform = `translateY(${scrollY * speed}px)`;
        });
    }
}

// ============================================
// TYPING EFFECT (Optional enhancement)
// ============================================
class TypingEffect {
    constructor(element, words, waitTime = 3000) {
        this.element = element;
        this.words = words;
        this.waitTime = waitTime;
        this.wordIndex = 0;
        this.txt = '';
        this.isDeleting = false;

        this.type();
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.element.textContent = this.txt;

        let typeSpeed = 100;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.waitTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// ============================================
// INITIALIZE ALL COMPONENTS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize 3D Scene (only if Three.js is loaded and canvas exists)
    if (typeof THREE !== 'undefined' && document.getElementById('hero-canvas')) {
        try {
            new HeroScene();
        } catch (error) {
            console.log('Error initializing 3D scene:', error);
        }
    }

    // Initialize other components (they handle missing elements internally)
    new Navigation();
    new CountdownTimer();
    new ScrollAnimations();
    new StatsCounter();
    new EventsFilter();
    new CursorGlow();
    new RegistrationForm();
    new ParallaxEffects();

    // Setup modal click handler if modal exists
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                closeModal();
            }
        });
    }

    // Remove loading state
    document.body.classList.add('loaded');
});

// ============================================
// PRELOADER (Optional)
// ============================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

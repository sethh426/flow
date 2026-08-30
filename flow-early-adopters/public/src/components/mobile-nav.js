export class MobileNavigation {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createMobileMenu();
        this.addEventListeners();
        this.addStyles();
    }

    createMobileMenu() {
        const navHTML = `
            <nav class="mobile-nav" aria-label="Mobile navigation">
                <button class="mobile-nav-toggle" aria-expanded="false" aria-label="Toggle navigation menu">
                    <span class="hamburger"></span>
                    <span class="hamburger"></span>
                    <span class="hamburger"></span>
                </button>
                <div class="mobile-nav-menu">
                    <a href="#hero">Home</a>
                    <a href="#workflow">Workflow</a>
                    <a href="#signup">Join Waitlist</a>
                </div>
            </nav>
        `;
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .mobile-nav {
                position: fixed;
                top: 0;
                right: 0;
                z-index: 9999;
                padding: 1rem;
            }

            .mobile-nav-toggle {
                display: none;
                background: rgba(99, 102, 241, 0.9);
                border: none;
                border-radius: 8px;
                padding: 12px;
                cursor: pointer;
                flex-direction: column;
                gap: 4px;
                width: 44px;
                height: 44px;
                justify-content: center;
                align-items: center;
            }

            .mobile-nav-toggle .hamburger {
                width: 20px;
                height: 2px;
                background: white;
                transition: all 0.3s ease;
            }

            .mobile-nav-menu {
                display: none;
                position: fixed;
                top: 0;
                right: -100%;
                width: 80%;
                max-width: 300px;
                height: 100vh;
                background: rgba(4, 2, 15, 0.98);
                backdrop-filter: blur(10px);
                padding: 80px 2rem 2rem;
                transition: right 0.3s ease;
                flex-direction: column;
                gap: 1.5rem;
            }

            .mobile-nav-menu.active {
                right: 0;
            }

            .mobile-nav-menu a {
                color: white;
                text-decoration: none;
                font-size: 1.25rem;
                font-weight: 500;
                padding: 1rem;
                border-radius: 8px;
                transition: background 0.2s;
            }

            .mobile-nav-menu a:hover,
            .mobile-nav-menu a:focus {
                background: rgba(99, 102, 241, 0.2);
            }

            @media (max-width: 768px) {
                .mobile-nav-toggle {
                    display: flex;
                }
                .mobile-nav-menu {
                    display: flex;
                }
            }
        `;
        document.head.appendChild(style);
    }

    addEventListeners() {
        const toggle = document.querySelector('.mobile-nav-toggle');
        const menu = document.querySelector('.mobile-nav-menu');
        const links = menu.querySelectorAll('a');

        toggle.addEventListener('click', () => this.toggleMenu());
        
        // Close on link click
        links.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mobile-nav') && this.isOpen) {
                this.closeMenu();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        const toggle = document.querySelector('.mobile-nav-toggle');
        const menu = document.querySelector('.mobile-nav-menu');
        
        toggle.setAttribute('aria-expanded', this.isOpen);
        menu.classList.toggle('active');
        document.body.style.overflow = this.isOpen ? 'hidden' : '';
    }

    closeMenu() {
        this.isOpen = false;
        const toggle = document.querySelector('.mobile-nav-toggle');
        const menu = document.querySelector('.mobile-nav-menu');
        
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new MobileNavigation();
    });
}

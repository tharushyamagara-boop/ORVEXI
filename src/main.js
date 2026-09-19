import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/animations.css';

// Firebase — initialises app & analytics on load
import './firebase.js';

import { renderNavbar }  from './components/Navbar.js';
import { renderHero }    from './components/Hero.js';
import { renderAbout }   from './components/Architecture.js';
import { renderServices } from './components/Solutions.js';
import { renderContact } from './components/ConsultationModal.js';
import { renderFooter }  from './components/Footer.js';

function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="ambient-background">
      <div class="ambient-grid"></div>
      <div class="ambient-orb ambient-orb-1"></div>
      <div class="ambient-orb ambient-orb-2"></div>
      <div class="ambient-orb ambient-orb-3"></div>
    </div>

    ${renderNavbar()}

    <main id="mainContent">
      ${renderHero()}
      ${renderAbout()}
      ${renderServices()}
      ${renderContact()}
    </main>

    ${renderFooter()}
  `;

  initNavbarScroll();
  initMobileDrawer();
  initContactForm();
  initScrollReveal();
  initActiveNavLinks();
}

/* -------------------------------------------------------------------------- */
/* 1. Navbar Scroll Effect                                                     */
/* -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById('headerNavbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* -------------------------------------------------------------------------- */
/* 2. Mobile Drawer                                                            */
/* -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer  = document.getElementById('mobileDrawer');
  if (!menuBtn || !drawer) return;

  menuBtn.addEventListener('click', () => drawer.classList.toggle('open'));

  drawer.querySelectorAll('.mobile-link, .btn').forEach(el => {
    el.addEventListener('click', () => drawer.classList.remove('open'));
  });
}

/* -------------------------------------------------------------------------- */
/* 3. Contact Form                                                             */
/* -------------------------------------------------------------------------- */
function initContactForm() {
  const form      = document.getElementById('contactForm');
  const container = document.getElementById('contactFormContainer');
  const success   = document.getElementById('contactSuccess');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = document.getElementById('contactName').value.trim();
    const email   = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) return;

    // Show success state (no backend yet — UI only)
    container.style.display = 'none';
    success.style.display   = 'block';

    // Reset after 10 seconds
    setTimeout(() => {
      form.reset();
      container.style.display = 'block';
      success.style.display   = 'none';
    }, 10000);
  });
}



/* -------------------------------------------------------------------------- */
/* 5. Scroll Reveal                                                            */
/* -------------------------------------------------------------------------- */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
  } else {
    els.forEach(el => el.classList.add('active'));
  }
}

/* -------------------------------------------------------------------------- */
/* 6. Active Nav Link Highlighting on Scroll                                  */
/* -------------------------------------------------------------------------- */
function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  function highlightActive() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', highlightActive, { passive: true });
  highlightActive();
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/animations.css';
import './styles/slider.css';
import './styles/admin.css';

// Firebase — initialises app & analytics on load
import './firebase.js';

// Content Store
import { contentStore } from './store/contentStore.js';

// Components
import { renderNavbar }         from './components/Navbar.js';
import { renderHeroSlider, initHeroSlider } from './components/HeroSlider.js';
import { renderAbout }          from './components/Architecture.js';
import { renderServices }       from './components/Solutions.js';
import { renderPortfolio }      from './components/Portfolio.js';
import { renderContact }        from './components/ConsultationModal.js';
import { renderFooter }         from './components/Footer.js';
import { renderAdminPortal, initAdminEvents, renderFloatingAdminBar } from './components/Admin/AdminDashboard.js';

function isCurrentRouteAdmin() {
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  return hash === '#admin' || path === '/admin';
}

function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const content = contentStore.getContent();
  const isAdmin = contentStore.isAdminAuthenticated();

  if (isCurrentRouteAdmin()) {
    // Render Admin Portal / CMS View
    app.innerHTML = renderAdminPortal();
    initAdminEvents(renderApp);
    return;
  }

  // Render Public Website
  app.innerHTML = `
    <div class="ambient-background">
      <div class="ambient-grid"></div>
      <div class="ambient-orb ambient-orb-1"></div>
      <div class="ambient-orb ambient-orb-2"></div>
      <div class="ambient-orb ambient-orb-3"></div>
    </div>

    ${renderNavbar(isAdmin)}

    <main id="mainContent">
      ${renderHeroSlider(content.heroSlider)}
      ${renderAbout(content.about)}
      ${renderServices(content.services)}
      ${renderPortfolio(content.portfolio)}
      ${renderContact(content.contact)}
    </main>

    ${renderFooter(content.settings, content.contact)}
    ${renderFloatingAdminBar()}
  `;

  // Initialize interactive behaviors
  initNavbarScroll();
  initMobileDrawer();
  initHeroSlider();
  initContactForm();
  initScrollReveal();
  initActiveNavLinks();
  initAdminEvents(renderApp);
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
    const name    = document.getElementById('contactName')?.value.trim();
    const email   = document.getElementById('contactEmail')?.value.trim();
    const message = document.getElementById('contactMessage')?.value.trim();

    if (!name || !email || !message) return;

    // Show success state (UI confirmation)
    if (container) container.style.display = 'none';
    if (success) success.style.display   = 'block';

    setTimeout(() => {
      form.reset();
      if (container) container.style.display = 'block';
      if (success) success.style.display   = 'none';
    }, 10000);
  });
}

/* -------------------------------------------------------------------------- */
/* 4. Scroll Reveal                                                            */
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
/* 5. Active Nav Link Highlighting on Scroll                                  */
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

/* -------------------------------------------------------------------------- */
/* 6. Routing & Store Subscriptions                                            */
/* -------------------------------------------------------------------------- */
window.addEventListener('hashchange', () => {
  renderApp();
  if (!isCurrentRouteAdmin() && window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

// Keyboard shortcut: Ctrl + Shift + A to open Admin Console
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    if (isCurrentRouteAdmin()) {
      window.location.hash = '#home';
    } else {
      window.location.hash = '#admin';
    }
  }
});

// Subscribe to store updates for automatic reactivity
contentStore.subscribe(() => {
  // If not currently typing in a modal or form, re-render
  const activeEl = document.activeElement;
  const isInputActive = activeEl && ['INPUT', 'TEXTAREA'].includes(activeEl.tagName);
  if (!isInputActive) {
    renderApp();
  }
});

// Bootstrap application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

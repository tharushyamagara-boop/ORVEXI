import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/animations.css';
import './styles/slider.css';
import './styles/admin.css';

// Firebase — initialises app & analytics on load
import './firebase.js';

// Content & Booking Stores
import { contentStore } from './store/contentStore.js';
import { bookingStore } from './store/bookingStore.js';
import { zohoEmailService } from './services/zohoEmailService.js';

// Components
import { renderNavbar }         from './components/Navbar.js';
import { renderHeroSlider, initHeroSlider } from './components/HeroSlider.js';
import { renderAbout }          from './components/Architecture.js';
import { renderServices }       from './components/Solutions.js';
import { renderPortfolio }      from './components/Portfolio.js';
import { renderContact }        from './components/ConsultationModal.js';
import { renderFooter }         from './components/Footer.js';
import { renderAdminPortal, initAdminEvents, renderFloatingAdminBar } from './components/Admin/AdminDashboard.js';
import { renderPrivacyPolicy }  from './components/PrivacyPolicy.js';
import { renderUnsubscribePage, initUnsubscribeEvents } from './components/Unsubscribe.js';

function isCurrentRouteAdmin() {
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  return hash === '#admin' || path === '/admin';
}

function isCurrentRoutePrivacy() {
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  if (hash === '#privacy') return true;
  if (path === '/privacy') {
    if (hash && hash !== '#privacy' && hash !== '#' && hash !== '#top') return false;
    return true;
  }
  return false;
}

function isCurrentRouteUnsubscribe() {
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  if (hash === '#unsubscribe') return true;
  if (path === '/unsubscribe') {
    if (hash && hash !== '#unsubscribe' && hash !== '#' && hash !== '#top') return false;
    return true;
  }
  return false;
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

  if (isCurrentRoutePrivacy()) {
    app.innerHTML = `
      <div class="ambient-background">
        <div class="ambient-grid"></div>
        <div class="ambient-orb ambient-orb-1"></div>
        <div class="ambient-orb ambient-orb-2"></div>
        <div class="ambient-orb ambient-orb-3"></div>
      </div>

      ${renderNavbar(isAdmin)}

      <main id="mainContent" style="padding-top: 5.5rem; min-height: 80vh;">
        ${renderPrivacyPolicy()}
      </main>

      ${renderFooter(content.settings, content.contact)}
      ${renderFloatingAdminBar()}
    `;

    initNavbarScroll();
    initMobileDrawer();
    initScrollReveal();
    window.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }

  if (isCurrentRouteUnsubscribe()) {
    app.innerHTML = `
      <div class="ambient-background">
        <div class="ambient-grid"></div>
        <div class="ambient-orb ambient-orb-1"></div>
        <div class="ambient-orb ambient-orb-2"></div>
        <div class="ambient-orb ambient-orb-3"></div>
      </div>

      ${renderNavbar(isAdmin)}

      <main id="mainContent" style="padding-top: 5.5rem; min-height: 80vh;">
        ${renderUnsubscribePage()}
      </main>

      ${renderFooter(content.settings, content.contact)}
      ${renderFloatingAdminBar()}
    `;

    initNavbarScroll();
    initMobileDrawer();
    initUnsubscribeEvents();
    initScrollReveal();
    window.scrollTo({ top: 0, behavior: 'auto' });
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
  scrollToHashOrPath('auto');
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
/* 2. Mobile Collapse Navigation Drawer                                        */
/* -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const menuBtn  = document.getElementById('mobileMenuBtn');
  const drawer   = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('mobileNavBackdrop');
  if (!menuBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    menuBtn.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggleDrawer() {
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDrawer();
  });

  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  drawer.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => {
      closeDrawer();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && drawer.classList.contains('open')) {
      closeDrawer();
    }
  }, { passive: true });
}

/* -------------------------------------------------------------------------- */
/* 3. Online Service Request & Appointment Booking Form                        */
/* -------------------------------------------------------------------------- */
function initContactForm() {
  const form      = document.getElementById('contactForm');
  const container = document.getElementById('contactFormContainer');
  const success   = document.getElementById('contactSuccess');
  const bookAnotherBtn = document.getElementById('bookAnotherBtn');

  // Pre-select service when clicking "Request Service" on any service card
  document.querySelectorAll('.service-request-link').forEach(link => {
    link.addEventListener('click', () => {
      const serviceName = link.getAttribute('data-service');
      const select = document.getElementById('bookingService');
      if (select && serviceName) {
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].value.toLowerCase().includes(serviceName.toLowerCase()) || 
              serviceName.toLowerCase().includes(select.options[i].value.toLowerCase())) {
            select.selectedIndex = i;
            break;
          }
        }
      }
    });
  });

  if (bookAnotherBtn) {
    bookAnotherBtn.onclick = () => {
      if (form) form.reset();
      if (success) success.style.display = 'none';
      if (container) container.style.display = 'block';
    };
  }

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name          = document.getElementById('contactName')?.value.trim();
    const phone         = document.getElementById('contactPhone')?.value.trim();
    const email         = document.getElementById('contactEmail')?.value.trim();
    const service       = document.getElementById('bookingService')?.value.trim();
    const preferredDate = document.getElementById('bookingDate')?.value;
    const timeSlot      = document.getElementById('bookingTimeSlot')?.value;
    const channel       = document.getElementById('bookingChannel')?.value;
    const notes         = document.getElementById('contactMessage')?.value.trim();
    const locationUrl   = document.getElementById('bookingLocationUrl')?.value.trim();

    if (!name || !email || !phone || !service) {
      alert('Please fill in your Name, Phone Number, Email Address, and Requested Service.');
      return;
    }

    const submitBtn = document.getElementById('contactSubmitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Submitting Request...</span>';
    }

    try {
      const booking = bookingStore.addBooking({
        customerName: name,
        phone,
        email,
        service,
        preferredDate: preferredDate || new Date().toISOString().slice(0, 10),
        timeSlot: timeSlot || 'Flexible / Any Time',
        channel: channel || 'Website Direct',
        notes: notes || 'General service inquiry & technical consultation request.',
        locationUrl
      });

      // Dispatch automated notification to CEO if Zoho is configured
      if (zohoEmailService.isConfigured()) {
        zohoEmailService.sendEmail({
          to: ['ceo@orvexi.rw'],
          subject: `[New Inquiry] ${booking.service} - ${booking.customerName}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#07090f; color:#ffffff; padding:2rem;">
              <div style="max-width:540px; margin:0 auto; background:#0b101f; border:1px solid rgba(132,204,22,0.3); border-radius:10px; padding:1.75rem;">
                <h2 style="color:#84cc16; margin-top:0;">New Service Request Received</h2>
                <div style="line-height:1.7; font-size:0.9rem; color:#cbd5e1;">
                  <div><strong>Client Name:</strong> ${booking.customerName}</div>
                  <div><strong>Email:</strong> ${booking.email}</div>
                  <div><strong>Phone:</strong> ${booking.phone}</div>
                  <div><strong>Requested Service:</strong> ${booking.service}</div>
                  <div><strong>Attribution Channel:</strong> ${booking.channel}</div>
                  <div><strong>Appointment:</strong> ${booking.preferredDateFormatted} (${booking.timeSlot})</div>
                  <div><strong>Reference:</strong> <code style="color:#84cc16;">${booking.reference}</code></div>
                  <div style="margin-top:0.75rem; padding:0.75rem; background:rgba(255,255,255,0.03); border-radius:6px;">
                    <strong>Inquiry Notes:</strong><br>${booking.notes}
                  </div>
                </div>
              </div>
            </div>
          `
        }).catch(err => console.warn('Could not dispatch booking admin notification:', err));
      }

      // Update success card details
      const refEl = document.getElementById('successRefCode');
      const srvEl = document.getElementById('successService');
      const apptEl = document.getElementById('successAppointment');

      if (refEl) refEl.textContent = booking.reference;
      if (srvEl) srvEl.textContent = booking.service;
      if (apptEl) apptEl.textContent = `${booking.preferredDateFormatted} (${booking.timeSlot})`;

      if (container) container.style.display = 'none';
      if (success) {
        success.style.display = 'block';
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      console.error('Error submitting service request:', err);
      alert('Could not submit request. Please try again or email us directly.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Submit Service Request</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>`;
      }
    }
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
      if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
    });
    links.forEach(link => {
      const href = link.getAttribute('href');
      const isMatch = href === `#${current}` || 
        ((current === 'get-in-touch' || current === 'contact') && (href === '#get-in-touch' || href === '#contact'));
      link.classList.toggle('active', isMatch);
    });
  }

  window.addEventListener('scroll', highlightActive, { passive: true });
  highlightActive();
}

/* -------------------------------------------------------------------------- */
/* 6. Routing & Indexable In-Page Navigation                                    */
/* -------------------------------------------------------------------------- */
function scrollToHashOrPath(behavior = 'smooth') {
  if (isCurrentRouteAdmin() || isCurrentRoutePrivacy() || isCurrentRouteUnsubscribe()) return;

  const hash = window.location.hash.toLowerCase();
  const rawPath = window.location.pathname.toLowerCase().replace(/^\/|\/$/g, '');

  let targetId = '';
  if (hash) {
    targetId = hash.replace(/^#/, '');
  } else if (rawPath && ['home', 'about', 'services', 'portfolio', 'contact', 'get-in-touch'].includes(rawPath)) {
    targetId = rawPath;
  }

  if (targetId) {
    let target = document.getElementById(targetId);
    if (!target && (targetId === 'contact' || targetId === 'get-in-touch')) {
      target = document.getElementById('get-in-touch') || document.getElementById('contact');
    }

    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior });
      }, 80);
    }
  }
}

window.addEventListener('hashchange', () => {
  renderApp();
  scrollToHashOrPath('smooth');
});

window.addEventListener('popstate', () => {
  renderApp();
  scrollToHashOrPath('smooth');
});

// SPA client-side routing delegation for relative links and section anchors
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href) return;

  // Internal path links (/privacy, /unsubscribe, /contact, etc.)
  if (href.startsWith('/') && !href.startsWith('//') && !link.hasAttribute('target') && !link.hasAttribute('download')) {
    const raw = href.toLowerCase().replace(/\/$/, '');
    if (['/privacy', '/unsubscribe', '/contact', '/get-in-touch', '/about', '/services', '/portfolio', '/home', ''].includes(raw)) {
      e.preventDefault();
      if (raw === '/privacy' || raw === '/unsubscribe') {
        window.history.pushState(null, '', raw);
        renderApp();
      } else {
        const targetId = raw.replace(/^\//, '');
        window.history.pushState(null, '', raw ? raw : '/');
        renderApp();
        if (targetId) {
          scrollToHashOrPath('smooth');
        }
      }
    }
  } else if (href.startsWith('#')) {
    // If currently on /privacy or /unsubscribe and user clicks a section anchor
    const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '');
    if (currentPath === '/privacy' || currentPath === '/unsubscribe') {
      const targetHash = href;
      if (targetHash !== '#' + currentPath.replace('/', '')) {
        e.preventDefault();
        window.history.pushState(null, '', '/' + targetHash);
        renderApp();
        scrollToHashOrPath('smooth');
      }
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

bookingStore.subscribe(() => {
  const badge = document.querySelector('.admin-booking-badge');
  if (badge) {
    const count = bookingStore.getPendingCount();
    badge.textContent = `${count} new`;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
});

// Bootstrap application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

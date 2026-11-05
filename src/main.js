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
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  if (hash === '#admin') {
    window.history.replaceState(null, '', '/admin');
    return true;
  }
  return path === '/admin';
}

function isCurrentRoutePrivacy() {
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  if (hash === '#privacy') {
    window.history.replaceState(null, '', '/privacy');
    return true;
  }
  return path === '/privacy';
}

function isCurrentRouteUnsubscribe() {
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  if (hash === '#unsubscribe') {
    window.history.replaceState(null, '', '/unsubscribe');
    return true;
  }
  return path === '/unsubscribe';
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
  syncSocialMetaTags(content);
  initNavbarScroll();
  initMobileDrawer();
  initHeroSlider();
  initContactForm();
  initScrollReveal();
  initActiveNavLinks();
  initAdminEvents(renderApp);
  scrollToHashOrPath('auto');
}

function syncSocialMetaTags(content) {
  try {
    const firstSlide = content?.heroSlider?.find(s => s.enabled !== false) || content?.heroSlider?.[0];
    let photoUrl = firstSlide?.image || '/images/slide1_kigali_tech.jpg';
    if (!photoUrl.startsWith('http')) {
      photoUrl = `https://orvexi.rw${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
    }

    const setMeta = (selector, attr, val) => {
      const el = document.querySelector(selector);
      if (el) {
        el.setAttribute(attr, val);
      }
    };

    setMeta('meta[property="og:image"]', 'content', photoUrl);
    setMeta('meta[property="og:image:secure_url"]', 'content', photoUrl);
    setMeta('meta[name="twitter:image"]', 'content', photoUrl);
    setMeta('meta[property="twitter:image"]', 'content', photoUrl);
  } catch (e) {}
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

  // Pre-fill and scroll to contact form when clicking "Order Similar Website" on any portfolio project
  document.querySelectorAll('.portfolio-order-link').forEach(link => {
    link.addEventListener('click', () => {
      const projectTitle = link.getAttribute('data-project-title') || 'Platform';
      const projectQuote = link.getAttribute('data-project-quote') || '';
      const projectCategory = link.getAttribute('data-project-category') || '';

      // Auto-select corresponding service
      const select = document.getElementById('bookingService');
      if (select) {
        let matched = false;
        const candidateKeywords = [projectCategory, 'Web Portals & Enterprise Platforms', 'Software Publishing', 'Custom Development'];
        for (const kw of candidateKeywords) {
          if (!kw) continue;
          for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value.toLowerCase().includes(kw.toLowerCase()) || 
                kw.toLowerCase().includes(select.options[i].value.toLowerCase())) {
              select.selectedIndex = i;
              matched = true;
              break;
            }
          }
          if (matched) break;
        }
        if (!matched && select.options.length > 1) {
          select.selectedIndex = 1;
        }
      }

      // Pre-fill message textarea with project inquiry
      const msgTextarea = document.getElementById('contactMessage');
      if (msgTextarea) {
        const quoteNote = projectQuote ? ` (Estimated Quote: ${projectQuote})` : '';
        msgTextarea.value = `Hello ORVEXI Team,\n\nI would like to order a platform/website similar to "${projectTitle}"${quoteNote}.\nPlease reach out to confirm specifications and delivery schedule.`;
      }

      // Smoothly scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const headerOffset = 70;
        const elementPosition = contactSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }

      // Focus the customer name input
      setTimeout(() => {
        const nameInput = document.getElementById('contactName');
        if (nameInput) nameInput.focus();
      }, 450);
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
        const notifRecipient = contentStore.getContent()?.contact?.notificationEmail || 'ceo@orvexi.rw';
        zohoEmailService.sendEmail({
          to: [notifRecipient],
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
        const btnLabel = contentStore.getContent()?.contact?.submitBtnText || 'Submit Service Request';
        submitBtn.innerHTML = `<span>${btnLabel}</span>
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

  const sectionRouteMap = {
    'home': '/',
    'about': '/about',
    'services': '/services',
    'portfolio': '/portfolio',
    'contact': '/contact',
    'get-in-touch': '/contact'
  };

  function highlightActive() {
    let current = 'home';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
    });

    const currentPath = sectionRouteMap[current] || '/';

    links.forEach(link => {
      const href = link.getAttribute('href');
      const isMatch = href === currentPath || 
        (href === '/' && current === 'home') ||
        (href === '/contact' && (current === 'contact' || current === 'get-in-touch'));
      link.classList.toggle('active', isMatch);
    });
  }

  window.addEventListener('scroll', highlightActive, { passive: true });
  highlightActive();
}

/* -------------------------------------------------------------------------- */
/* 6. Routing & Indexable In-Page Navigation (No Hashes Exposed)               */
/* -------------------------------------------------------------------------- */
function scrollToHashOrPath(behavior = 'smooth') {
  if (isCurrentRouteAdmin() || isCurrentRoutePrivacy() || isCurrentRouteUnsubscribe()) return;

  const hash = window.location.hash.toLowerCase();
  const rawPath = window.location.pathname.toLowerCase().replace(/^\/|\/$/g, '');

  // Alias /get-in-touch cleanly to /contact
  if (rawPath === 'get-in-touch' || hash === '#get-in-touch' || hash === '#contact') {
    window.history.replaceState(null, '', '/contact');
  } else if (hash && ['#home', '#about', '#services', '#portfolio'].includes(hash)) {
    const cleanRoute = hash === '#home' ? '/' : hash.replace('#', '/');
    window.history.replaceState(null, '', cleanRoute);
  }

  let targetId = '';
  if (rawPath) {
    targetId = (rawPath === 'get-in-touch') ? 'contact' : rawPath;
  } else if (hash) {
    targetId = hash.replace(/^#/, '');
    if (targetId === 'get-in-touch') targetId = 'contact';
  }

  if (targetId && targetId !== 'home') {
    let target = document.getElementById(targetId);
    if (!target && (targetId === 'contact' || targetId === 'get-in-touch')) {
      target = document.getElementById('contact') || document.getElementById('get-in-touch');
    }

    if (target) {
      setTimeout(() => {
        const headerOffset = 70;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior
        });
      }, 90);
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

// SPA client-side routing delegation: clean paths only, no hashes exposed
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href) return;

  // Relative path links (/contact, /about, /services, /portfolio, /, /privacy, /unsubscribe, /admin)
  if (href.startsWith('/') && !href.startsWith('//') && !link.hasAttribute('target') && !link.hasAttribute('download')) {
    const raw = href.toLowerCase().replace(/\/$/, '') || '/';
    const validRoutes = ['/', '/about', '/services', '/portfolio', '/contact', '/get-in-touch', '/privacy', '/unsubscribe', '/admin', '/home'];

    if (validRoutes.includes(raw)) {
      e.preventDefault();
      const canonicalRoute = (raw === '/get-in-touch' || raw === '/contact') ? '/contact' : (raw === '/home' ? '/' : raw);

      const isStandaloneRoute = canonicalRoute === '/admin' || canonicalRoute === '/privacy' || canonicalRoute === '/unsubscribe';
      const wasStandaloneRoute = isCurrentRouteAdmin() || isCurrentRoutePrivacy() || isCurrentRouteUnsubscribe();

      window.history.pushState(null, '', canonicalRoute);

      if (isStandaloneRoute || wasStandaloneRoute) {
        renderApp();
      }

      if (canonicalRoute === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (!isStandaloneRoute) {
        const targetId = canonicalRoute.replace(/^\//, '');
        const target = document.getElementById(targetId) || 
                       (targetId === 'contact' ? document.getElementById('get-in-touch') : null);
        if (target) {
          const headerOffset = 70;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  } else if (href.startsWith('#')) {
    // If a legacy hash link was somehow triggered, normalize cleanly to HTML5 pathname
    e.preventDefault();
    const targetId = href.replace(/^#/, '');
    const pathMap = {
      'home': '/',
      'about': '/about',
      'services': '/services',
      'portfolio': '/portfolio',
      'contact': '/contact',
      'get-in-touch': '/contact',
      'admin': '/admin',
      'privacy': '/privacy',
      'unsubscribe': '/unsubscribe'
    };
    const cleanPath = pathMap[targetId] || '/';
    window.history.pushState(null, '', cleanPath);
    renderApp();
    scrollToHashOrPath('smooth');
  }
});

// Keyboard shortcut: Ctrl + Shift + A to open Admin Console
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    if (isCurrentRouteAdmin()) {
      window.history.pushState(null, '', '/');
    } else {
      window.history.pushState(null, '', '/admin');
    }
    renderApp();
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

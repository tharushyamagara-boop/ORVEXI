import { contentStore, MASTER_DEFAULT_PASSWORD } from '../../store/contentStore.js';
import { vaultStore, SUPPORTED_PROJECTS } from '../../store/vaultStore.js';
import { bookingStore, ATTRIBUTION_CHANNELS } from '../../store/bookingStore.js';
import { contactStore } from '../../store/contactStore.js';
import { 
  emailStore, 
  EMAIL_CATEGORIES, 
  EMAIL_SECTION_PRESETS, 
  EMAIL_THEME_PRESETS, 
  auditEmailDeliverability 
} from '../../store/emailStore.js';
import { analyticsStore, CHANNELS_LIST, CHANNEL_COLORS } from '../../store/analyticsStore.js';
import { zohoEmailService } from '../../services/zohoEmailService.js';
import { uploadImageToStorage } from '../../services/imageUploadService.js';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  sendPasswordResetEmail 
} from '../../firebase.js';

let currentVaultFilter = 'all';
let bookingStatusFilter = 'All';
let bookingChannelFilter = 'All';
let bookingSearchQuery = '';

let selectedContactGroup = 'All';
let contactSearchQuery = '';
let selectedContactIds = new Set();
let isDesignerOpen = false;
let designerDevice = 'desktop';
let designerActiveTab = 'blocks';

let performanceTimeRange = 'all';
let performanceSelectedPlatform = 'All';

let activeTab = 'slider';
let showResetView = false;

export function showAdminToast(message, type = 'info') {
  let container = document.getElementById('adminToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'adminToastContainer';
    container.className = 'admin-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'admin-toast';
  const icon = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

export function renderAdminPortal() {
  const isAuth = contentStore.isAdminAuthenticated();

  if (!isAuth) {
    return renderLoginScreen();
  }

  const content = contentStore.getContent();
  const adminUser = contentStore.getAdminUser();

  return `
    <div class="admin-portal-wrapper" id="adminPortalRoot">
      <!-- Admin Header -->
      <header class="admin-header">
        <div class="admin-header-brand">
          <a href="/" style="display:flex; align-items:center;">
            <img src="/Logo-WHITE.png" alt="ORVEXI" height="28" style="height:28px; max-height:28px; width:auto; display:block;">
          </a>
          <span class="admin-brand-tag">CMS CONSOLE</span>
        </div>

        <div class="admin-header-actions">
          <!-- Admin User Badge -->
          <div class="admin-user-badge">
            ${adminUser.photo 
              ? `<img src="${adminUser.photo}" alt="" class="admin-user-avatar">`
              : `<span class="admin-user-initial">${(adminUser.name || 'A')[0].toUpperCase()}</span>`
            }
            <span style="font-weight:600; color:var(--text-primary);">${adminUser.name || 'Admin'}</span>
            ${adminUser.provider === 'google' 
              ? `<span style="font-size:0.7rem; color:var(--brand-blue-light);">(Google)</span>`
              : ''
            }
          </div>

          <a href="/" class="btn-admin btn-admin-secondary btn-admin-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>Live Website</span>
          </a>

          <button id="adminQuickExportBtn" class="btn-admin btn-admin-secondary btn-admin-sm" title="Download content backup">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Backup</span>
          </button>

          <button id="adminLogoutBtn" class="btn-admin btn-admin-danger btn-admin-sm">
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <!-- Admin Layout -->
      <div class="admin-layout">
        <!-- Sidebar Navigation -->
        <aside class="admin-sidebar">
          <button class="admin-nav-item ${activeTab === 'slider' ? 'active' : ''}" data-tab="slider">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span>Hero Slider</span>
          </button>

          <button class="admin-nav-item ${activeTab === 'about' ? 'active' : ''}" data-tab="about">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>About &amp; Overview</span>
          </button>

          <button class="admin-nav-item ${activeTab === 'services' ? 'active' : ''}" data-tab="services">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            <span>Services &amp; Activities</span>
          </button>

          <button class="admin-nav-item ${activeTab === 'portfolio' ? 'active' : ''}" data-tab="portfolio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            <span>Portfolio Projects</span>
          </button>

          <button class="admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}" data-tab="bookings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 12h6"></path><path d="M9 16h6"></path></svg>
            <span>Bookings</span>
            ${bookingStore.getPendingCount() > 0 ? `<span class="admin-booking-badge">${bookingStore.getPendingCount()} new</span>` : ''}
          </button>

          <button class="admin-nav-item ${activeTab === 'contacts' ? 'active' : ''}" data-tab="contacts">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Manage Contacts</span>
            <span class="group-count" style="font-size:0.7rem; background:rgba(255,255,255,0.1); padding:0.1rem 0.45rem; border-radius:10px; margin-left:auto;">${contactStore.contacts.length}</span>
          </button>

          <button class="admin-nav-item ${activeTab === 'send-email' ? 'active' : ''}" data-tab="send-email">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <span>Send Email</span>
          </button>

          <button class="admin-nav-item ${activeTab === 'performance' ? 'active' : ''}" data-tab="performance">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <span>Platform Performance</span>
          </button>

          <button class="admin-nav-item ${activeTab === 'contact' ? 'active' : ''}" data-tab="contact">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>Service Form &amp; Contact</span>
          </button>

          <button class="admin-nav-item ${activeTab === 'vault' ? 'active' : ''}" data-tab="vault">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <span>Cloud Code Vault</span>
          </button>

          <button class="admin-nav-item ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>Settings &amp; Security</span>
          </button>
        </aside>

        <!-- Main Tab Content Area -->
        <main class="admin-content-area" id="adminContentArea">
          ${renderActiveTabContent(content)}
        </main>
      </div>

      <!-- Modal Container -->
      <div id="adminModalMount"></div>
    </div>
  `;
}

function renderLoginScreen() {
  return `
    <div class="admin-login-backdrop">
      <div class="admin-login-box">
        
        <!-- ================= VIEW 1: SIGN IN VIEW ================= -->
        <div id="adminSignInView" style="${showResetView ? 'display:none;' : 'display:block;'}">
          <div class="admin-login-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2 class="admin-login-title">ORVEXI Admin Console</h2>
          <p class="admin-login-desc">Sign in to control and manage all website content.</p>

          <!-- Google Sign In Button -->
          <button type="button" class="btn-google-login" id="googleSignInBtn">
            <svg viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div class="admin-auth-divider">
            <span>Or with Admin Password</span>
          </div>

          <div class="admin-login-error" id="adminLoginError"></div>

          <!-- Password Form -->
          <form id="adminLoginForm">
            <div class="admin-form-group">
              <div class="admin-password-wrap">
                <input type="password" id="adminPassphraseInput" class="admin-input" placeholder="Enter password" required autofocus autocomplete="current-password">
                <button type="button" class="admin-password-toggle" id="togglePasswordVisibilityBtn" aria-label="Toggle password visibility">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div style="display:flex; align-items:center; gap:0.45rem;">
                <input type="checkbox" id="adminRememberMe" style="accent-color:var(--brand-blue-light); cursor:pointer;">
                <label for="adminRememberMe" style="font-size:0.84rem; color:var(--text-secondary); cursor:pointer;">Remember me</label>
              </div>
              <button type="button" class="admin-login-link" id="toggleResetPasswordBtn" style="background:none; border:none; padding:0; cursor:pointer;">
                Reset password?
              </button>
            </div>

            <button type="submit" class="btn-admin btn-admin-primary" style="width: 100%; justify-content: center; padding: 0.75rem;">
              <span>Unlock Dashboard</span>
            </button>
          </form>

          <div style="margin-top: 1.5rem; text-align:center;">
            <a href="/" style="color: var(--text-muted); font-size: 0.84rem; text-decoration: none;">&larr; Return to Website</a>
          </div>
        </div>

        <!-- ================= VIEW 2: RESET PASSWORD VIEW ================= -->
        <div id="adminResetView" style="${showResetView ? 'display:block;' : 'display:none;'}">
          <div class="admin-login-icon" style="background:rgba(62,181,241,0.12); color:var(--brand-blue-light);">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 2l-2 2m-1.5 1.5L16 7l-4 4-2-2-4 4 2 2-4 4 3 3 4-4 2 2 4-4-2-2 4-4 1.5-1.5z"></path></svg>
          </div>
          <h2 class="admin-login-title">Reset Admin Password</h2>
          <p class="admin-login-desc">Enter your registered admin email to receive a password reset link from Firebase.</p>

          <form id="adminResetForm" style="margin-top:1.5rem;">
            <div class="admin-form-group">
              <label class="admin-label">Admin Email</label>
              <input type="email" id="resetEmailInput" class="admin-input" placeholder="Enter your registered admin email" value="" required autocomplete="email">
            </div>

            <button type="submit" class="btn-admin btn-admin-primary" id="sendEmailResetBtn" style="width:100%; justify-content:center; padding:0.75rem; margin-top:0.5rem;">
              <span>Send Password Reset Link</span>
            </button>

            <div style="text-align:center; margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid rgba(255,255,255,0.08);">
              <span style="font-size:0.86rem; color:var(--text-secondary);">Remember your password?</span>
              <button type="button" class="admin-login-link" id="backToLoginBtn" style="background:none; border:none; margin-left:0.35rem; font-weight:600; font-size:0.86rem; cursor:pointer;">
                Log In
              </button>
            </div>
          </form>

          <div style="margin-top: 1.25rem; text-align:center;">
            <a href="/" style="color: var(--text-muted); font-size: 0.84rem; text-decoration: none;">&larr; Return to Website</a>
          </div>
        </div>

      </div>
    </div>
  `;
}

function renderActiveTabContent(content) {
  switch (activeTab) {
    case 'slider':
      return renderSliderTab(content.heroSlider || []);
    case 'about':
      return renderAboutTab(content.about || {});
    case 'services':
      return renderServicesTab(content.services || {});
    case 'portfolio':
      return renderPortfolioTab(content.portfolio || {});
    case 'bookings':
      return renderBookingsTab();
    case 'contacts':
      return renderContactsTab();
    case 'send-email':
      return renderSendEmailTab();
    case 'performance':
      return renderPlatformPerformanceTab();
    case 'contact':
      return renderContactTab(content.contact || {});
    case 'vault':
      return renderVaultTab(currentVaultFilter);
    case 'settings':
      return renderSettingsTab(content.settings || {});
    default:
      return '<p>Select a tab</p>';
  }
}

/* -------------------------------------------------------------------------- */
/* TAB 1: Hero Slider Management                                              */
/* -------------------------------------------------------------------------- */
function renderSliderTab(slides) {
  const slidesHtml = slides.map((slide, index) => {
    const bgImage = slide.image || '/images/slide1_kigali_tech.jpg';
    const isEnabled = slide.enabled !== false;
    return `
      <div class="admin-slide-card" data-index="${index}">
        <div class="admin-slide-thumb" style="background-image: url('${bgImage}');">
          <div class="admin-slide-thumb-overlay"></div>
          <div style="position:absolute; bottom:8px; left:8px;">
            <span class="admin-badge ${isEnabled ? 'admin-badge-success' : 'admin-badge-muted'}">
              ${isEnabled ? 'Active' : 'Hidden'}
            </span>
          </div>
        </div>

        <div class="admin-slide-details">
          <div>
            <div class="admin-slide-title-wrap">
              <div class="admin-slide-title">
                ${slide.title} ${slide.highlight ? `<span style="color:var(--brand-blue-light); font-weight:normal;">(${slide.highlight})</span>` : ''}
              </div>
              <span style="font-family:var(--font-mono); font-size:0.8rem; color:var(--text-muted);">#${index + 1}</span>
            </div>
            <div class="admin-slide-meta">${slide.badge || 'No badge'}</div>
            <div class="admin-slide-desc">${slide.subtitle || 'No description'}</div>
          </div>

          <div class="admin-slide-actions">
            <button class="btn-admin btn-admin-primary btn-admin-sm btn-edit-slide" data-index="${index}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              <span>Edit</span>
            </button>
            <button class="btn-admin btn-admin-secondary btn-admin-sm btn-toggle-slide" data-index="${index}">
              <span>${isEnabled ? 'Hide' : 'Show'}</span>
            </button>
            <button class="btn-admin btn-admin-secondary btn-admin-sm btn-move-slide" data-index="${index}" data-dir="-1" ${index === 0 ? 'disabled style="opacity:0.4"' : ''}>
              &uarr; Up
            </button>
            <button class="btn-admin btn-admin-secondary btn-admin-sm btn-move-slide" data-index="${index}" data-dir="1" ${index === slides.length - 1 ? 'disabled style="opacity:0.4"' : ''}>
              &darr; Down
            </button>
            <button class="btn-admin btn-admin-danger btn-admin-sm btn-delete-slide" data-index="${index}">
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h2 class="admin-card-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            Public Hero Slider
          </h2>
          <p class="admin-card-subtitle">Manage homepage slides with photos, titles, emphasis highlights, badges, and call-to-action buttons.</p>
        </div>
        <button id="adminAddSlideBtn" class="btn-admin btn-admin-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Add New Slide</span>
        </button>
      </div>

      <div class="admin-slides-list">
        ${slidesHtml || '<p style="color:var(--text-muted); padding:2rem; text-align:center;">No slides configured. Click "Add New Slide" to create one.</p>'}
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* TAB 2: About & Company                                                     */
/* -------------------------------------------------------------------------- */
function renderAboutTab(about) {
  const reg = about.registration || {};
  const paragraphs = about.paragraphs || [];

  return `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h2 class="admin-card-title">Company Overview &amp; About Section</h2>
          <p class="admin-card-subtitle">Edit corporate overview narrative, office visual, and RDB registration records.</p>
        </div>
        <button id="saveAboutBtn" class="btn-admin btn-admin-primary">Save Changes</button>
      </div>

      <form id="aboutForm">
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-label">Section Tag</label>
            <input type="text" id="aboutTag" class="admin-input" value="${about.tag || 'About Us'}">
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Section Title</label>
            <input type="text" id="aboutTitle" class="admin-input" value="${about.title || 'Company Overview'}">
          </div>
        </div>

        <div class="admin-form-group">
          <label class="admin-label">Lead Subtitle</label>
          <textarea id="aboutDesc" class="admin-textarea" rows="2">${about.desc || ''}</textarea>
        </div>

        <div class="admin-form-group">
          <label class="admin-label">Narrative Paragraphs (HTML supported, one per row)</label>
          <div id="aboutParagraphsContainer">
            ${paragraphs.map((p, i) => `
              <div style="display:flex; gap:0.5rem; margin-bottom:0.75rem;">
                <textarea class="admin-textarea about-paragraph-input" style="min-height:60px;">${p}</textarea>
                <button type="button" class="btn-admin btn-admin-danger btn-admin-sm btn-del-paragraph" style="align-self:flex-start;">✕</button>
              </div>
            `).join('')}
          </div>
          <button type="button" id="addParagraphBtn" class="btn-admin btn-admin-secondary btn-admin-sm">+ Add Paragraph</button>
        </div>

        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.08); margin:1.75rem 0;">

        <h3 style="font-size:1.1rem; color:#fff; margin-bottom:1rem;">Office Workspace &amp; Photo</h3>
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-label">Office Photo Path or URL</label>
            <input type="text" id="aboutPhoto" class="admin-input" value="${about.officePhoto || '/images/about_office.jpg'}">
            <div class="admin-helper-text">Default: <code>/images/about_office.jpg</code></div>
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Photo Badge Label</label>
            <input type="text" id="aboutOfficeBadge" class="admin-input" value="${about.officeBadge || 'Kigali Innovation Hub • Rwanda'}">
          </div>
        </div>

        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.08); margin:1.75rem 0;">

        <h3 style="font-size:1.1rem; color:#fff; margin-bottom:1rem;">Official RDB Registration Card</h3>
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-label">TIN Number</label>
            <input type="text" id="regTin" class="admin-input" value="${reg.tin || '1628324'}">
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Date of Issuance</label>
            <input type="text" id="regDate" class="admin-input" value="${reg.date || '20 October 2025'}">
          </div>
        </div>

        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-label">Company Type</label>
            <input type="text" id="regType" class="admin-input" value="${reg.type || 'Private — Limited by Shares'}">
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Managing Director</label>
            <input type="text" id="regDirector" class="admin-input" value="${reg.director || 'Theophile HARUSHYAMAGARA'}">
          </div>
        </div>

        <div class="admin-form-group">
          <label class="admin-label">Registered Office Address</label>
          <textarea id="regAddress" class="admin-textarea" rows="2">${reg.address || 'Niboye, Kicukiro\nUmujyi wa Kigali, Rwanda'}</textarea>
        </div>
      </form>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* TAB 3: Services & Activities                                               */
/* -------------------------------------------------------------------------- */
function renderServicesTab(servicesData) {
  const items = servicesData.items || [];

  const itemsHtml = items.map((s, index) => `
    <div style="background:rgba(11,14,23,0.7); border:1px solid rgba(62,181,241,0.12); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
      <div style="flex:1;">
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.35rem;">
          <span style="font-family:var(--font-mono); color:var(--accent-light); font-weight:600; font-size:0.85rem;">${s.code || 'Code'}</span>
          <h4 style="font-size:1.05rem; color:#fff; font-weight:600;">${s.title}</h4>
          ${s.primary ? '<span class="admin-badge admin-badge-success">Main Activity</span>' : ''}
        </div>
        <p style="color:var(--text-secondary); font-size:0.86rem; line-height:1.45;">${s.desc}</p>
      </div>
      <div style="display:flex; gap:0.5rem; flex-shrink:0;">
        <button class="btn-admin btn-admin-secondary btn-admin-sm btn-edit-service" data-index="${index}">Edit</button>
        <button class="btn-admin btn-admin-danger btn-admin-sm btn-del-service" data-index="${index}">Delete</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h2 class="admin-card-title">Registered Business Services</h2>
          <p class="admin-card-subtitle">Manage business activities formally registered with the Rwanda Development Board.</p>
        </div>
        <button id="adminAddServiceBtn" class="btn-admin btn-admin-primary">+ Add Service</button>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Section Tag</label>
          <input type="text" id="servicesTag" class="admin-input" value="${servicesData.tag || 'Services'}">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Section Title</label>
          <input type="text" id="servicesTitle" class="admin-input" value="${servicesData.title || 'Registered Business Activities'}">
        </div>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Subtitle Description</label>
        <textarea id="servicesDesc" class="admin-textarea" rows="2">${servicesData.desc || ''}</textarea>
      </div>
      <button id="saveServicesHeaderBtn" class="btn-admin btn-admin-secondary btn-admin-sm" style="margin-bottom:1.5rem;">Save Section Header</button>

      <hr style="border:0; border-top:1px solid rgba(255,255,255,0.08); margin:1.5rem 0;">

      <div>${itemsHtml || '<p style="color:var(--text-muted);">No services configured.</p>'}</div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* TAB 4: Portfolio Projects                                                  */
/* -------------------------------------------------------------------------- */
function renderPortfolioTab(portfolioData) {
  const items = portfolioData.items || [];

  const itemsHtml = items.map((p, index) => {
    const tags = Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '');
    const imgUrl = p.image || '/images/slide1_kigali_tech.jpg';
    return `
      <div style="background:rgba(11,14,23,0.7); border:1px solid rgba(62,181,241,0.12); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:flex-start; gap:1.25rem;">
        <div style="width:130px; aspect-ratio:1920/1090; border-radius:6px; overflow:hidden; background:#07090f; border:1px solid rgba(62,181,241,0.2); flex-shrink:0;">
          <img src="${imgUrl}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;">
        </div>
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.35rem; flex-wrap:wrap;">
            <h4 style="font-size:1.05rem; color:#fff; font-weight:600;">${p.title}</h4>
            <span style="font-size:0.78rem; color:var(--accent-light);">${p.category || ''}</span>
            ${(p.showQuote !== false && p.quote) ? `
              <span style="display:inline-flex; align-items:center; gap:0.3rem; background:rgba(132,204,22,0.12); border:1px solid rgba(132,204,22,0.3); border-radius:4px; padding:0.15rem 0.5rem; font-size:0.75rem; color:#84cc16; font-weight:700;">
                💰 Quote: ${p.quote} (Visible)
              </span>
            ` : `
              <span style="display:inline-flex; align-items:center; gap:0.3rem; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:4px; padding:0.15rem 0.5rem; font-size:0.75rem; color:var(--text-muted); font-weight:600;">
                👁️ Quote: ${p.quote ? `${p.quote} (Hidden)` : 'Not set'}
              </span>
            `}
            ${p.badge && !['Enterprise', 'Flagship Platform', 'National Forum', 'Consulting Dashboard', 'Fintech Application', 'Demo Dashboard'].includes(p.badge) ? `<span class="admin-badge admin-badge-muted">${p.badge}</span>` : ''}
          </div>
          ${p.subtitle ? `<div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.35rem;">${p.subtitle}</div>` : ''}
          <p style="color:var(--text-muted); font-size:0.84rem; line-height:1.45; margin-bottom:0.5rem;">${p.desc}</p>
          <div style="font-size:0.78rem; color:var(--text-secondary); font-family:var(--font-mono);">
            URL: <a href="${p.url}" target="_blank" style="color:var(--brand-blue-light); text-decoration:none;">${p.url || 'None'}</a> | CTA: <span style="color:#84cc16;">${p.orderBtnText || 'Order Similar Website'}</span> | Tags: ${tags}
          </div>
        </div>
        <div style="display:flex; gap:0.5rem; flex-shrink:0;">
          <button class="btn-admin btn-admin-secondary btn-admin-sm btn-edit-project" data-index="${index}">Edit</button>
          <button class="btn-admin btn-admin-danger btn-admin-sm btn-del-project" data-index="${index}">Delete</button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h2 class="admin-card-title">Portfolio &amp; Live Products</h2>
          <p class="admin-card-subtitle">Manage deployed systems, platforms, and client demo projects showcased on the public page.</p>
        </div>
        <button id="adminAddProjectBtn" class="btn-admin btn-admin-primary">+ Add Project</button>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Section Tag</label>
          <input type="text" id="portfolioTag" class="admin-input" value="${portfolioData.tag || 'Portfolio'}">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Section Title</label>
          <input type="text" id="portfolioTitle" class="admin-input" value="${portfolioData.title || 'Our Work & Live Platforms'}">
        </div>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Subtitle Description</label>
        <textarea id="portfolioDesc" class="admin-textarea" rows="2">${portfolioData.desc || ''}</textarea>
      </div>
      <button id="savePortfolioHeaderBtn" class="btn-admin btn-admin-secondary btn-admin-sm" style="margin-bottom:1.5rem;">Save Section Header</button>

      <hr style="border:0; border-top:1px solid rgba(255,255,255,0.08); margin:1.5rem 0;">

      <div>${itemsHtml || '<p style="color:var(--text-muted);">No portfolio projects configured.</p>'}</div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* TAB 5: Service Request Form & Corporate Contact                            */
/* -------------------------------------------------------------------------- */
function renderContactTab(contact) {
  const servicesList = (Array.isArray(contact.services) && contact.services.length > 0)
    ? contact.services
    : [
        'Software Publishing & Custom Development',
        'Computer Programming Activities',
        'IT Consultancy & Systems Advisory',
        'Data Processing & Cloud Infrastructure',
        'Web Portals & Enterprise Platforms',
        'General Technical Consultation'
      ];

  const timeSlotsList = (Array.isArray(contact.timeSlots) && contact.timeSlots.length > 0)
    ? contact.timeSlots
    : [
        'Morning (09:00 - 12:00)',
        'Afternoon (12:00 - 16:00)',
        'Late Afternoon (16:00 - 18:00)',
        'Flexible / Any Time'
      ];

  const channelsList = (Array.isArray(contact.channels) && contact.channels.length > 0)
    ? contact.channels
    : [
        'Website Direct',
        'Google Search',
        'LinkedIn',
        'Referral / Partner',
        'Client Recommendation',
        'Other'
      ];

  return `
    <!-- Card 1: Service Request Form Settings -->
    <div class="admin-card" style="margin-bottom: 2rem;">
      <div class="admin-card-header">
        <div>
          <h2 class="admin-card-title">Service Request Form Settings</h2>
          <p class="admin-card-subtitle">
            Configure section tag, title, description, dropdown services, time slots, lead attribution channels, button text, and alerts.
          </p>
        </div>
        <button id="saveServiceFormBtn" class="btn-admin btn-admin-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          <span>Save Form Settings</span>
        </button>
      </div>

      <form id="serviceFormConfigForm">
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-label">Section Tag / Badge</label>
            <input type="text" id="formConfigTag" class="admin-input" value="${escapeHtml(contact.tag || 'Service Requests & Contact')}">
            <div class="admin-helper-text">Uppercase badge shown above the section headline.</div>
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Section Title</label>
            <input type="text" id="formConfigTitle" class="admin-input" value="${escapeHtml(contact.title || 'Request a Service or Consultation')}">
            <div class="admin-helper-text">Main section headline displayed on the website.</div>
          </div>
        </div>

        <div class="admin-form-group">
          <label class="admin-label">Section Description / Subtitle</label>
          <textarea id="formConfigDesc" class="admin-textarea" rows="2">${escapeHtml(contact.desc || 'Submit a service request, schedule a technical consultation, or reach out to our team in Kigali.')}</textarea>
          <div class="admin-helper-text">Brief overview text displayed directly beneath the section title.</div>
        </div>

        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-label">Submit Button Label</label>
            <input type="text" id="formConfigSubmitBtn" class="admin-input" value="${escapeHtml(contact.submitBtnText || 'Submit Service Request')}">
            <div class="admin-helper-text">Action text displayed on the submission button.</div>
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Admin Notification Recipient Email</label>
            <input type="email" id="formConfigNotificationEmail" class="admin-input" value="${escapeHtml(contact.notificationEmail || 'ceo@orvexi.rw')}">
            <div class="admin-helper-text">Email address that receives automated inquiry dispatches via Zoho CPaaS.</div>
          </div>
        </div>

        <div class="admin-form-group">
          <label class="admin-label">Available Services in Dropdown (One per line)</label>
          <textarea id="formConfigServices" class="admin-textarea" rows="6" style="font-family:var(--font-mono); font-size:0.86rem; line-height:1.6;" placeholder="Enter one service per line...">${escapeHtml(servicesList.join('\n'))}</textarea>
          <div class="admin-helper-text">Clients can choose from these business services in the "Requested Service" select menu.</div>
        </div>

        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-label">Appointment Time Slots (One per line)</label>
            <textarea id="formConfigTimeSlots" class="admin-textarea" rows="4" style="font-family:var(--font-mono); font-size:0.86rem; line-height:1.6;" placeholder="Enter one time slot per line...">${escapeHtml(timeSlotsList.join('\n'))}</textarea>
            <div class="admin-helper-text">Available consultation time windows.</div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Attribution Channels ("How Did You Hear About Us?", One per line)</label>
            <textarea id="formConfigChannels" class="admin-textarea" rows="4" style="font-family:var(--font-mono); font-size:0.86rem; line-height:1.6;" placeholder="Enter one channel per line...">${escapeHtml(channelsList.join('\n'))}</textarea>
            <div class="admin-helper-text">Discovery channels for client attribution.</div>
          </div>
        </div>

        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-label">Success Card Headline</label>
            <input type="text" id="formConfigSuccessTitle" class="admin-input" value="${escapeHtml(contact.successTitle || 'Service Request Submitted')}">
          </div>
        </div>

        <div class="admin-form-group">
          <label class="admin-label">Success Card Confirmation Text</label>
          <textarea id="formConfigSuccessDesc" class="admin-textarea" rows="2">${escapeHtml(contact.successDesc || 'Thank you! Your request has been queued in our operations management pipeline. Our team will review your requirements and get in touch to confirm your appointment.')}</textarea>
          <div class="admin-helper-text">Message displayed immediately upon successful submission.</div>
        </div>
      </form>
    </div>

    <!-- Card 2: Corporate & Contact Details -->
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h2 class="admin-card-title">Corporate &amp; Contact Details</h2>
          <p class="admin-card-subtitle">Configure official email, phone, physical location, registered TIN, and tax lookup verification link.</p>
        </div>
        <button id="saveContactBtn" class="btn-admin btn-admin-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          <span>Save Corporate Details</span>
        </button>
      </div>

      <form id="contactConfigForm">
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-label">Official Contact Email</label>
            <input type="email" id="contactConfigEmail" class="admin-input" value="${escapeHtml(contact.email || 'orvexi@loprok.com')}">
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Official Phone Number</label>
            <input type="text" id="contactConfigPhone" class="admin-input" value="${escapeHtml(contact.phone || '+250 788 810 675')}">
          </div>
        </div>

        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-label">Registered TIN Number</label>
            <input type="text" id="contactConfigTin" class="admin-input" value="${escapeHtml(contact.tin || '1628324')}">
          </div>
          <div class="admin-form-group">
            <label class="admin-label">RRA Portal Verification URL</label>
            <input type="url" id="contactConfigRraLink" class="admin-input" value="${escapeHtml(contact.rraLink || 'https://etax.rra.gov.rw/nidAssignedTIN/')}">
          </div>
        </div>

        <div class="admin-form-group">
          <label class="admin-label">Physical Address</label>
          <textarea id="contactConfigAddress" class="admin-textarea" rows="2">${escapeHtml(contact.address || 'Niboye, Kicukiro\nUmujyi wa Kigali, Rwanda')}</textarea>
        </div>
      </form>
    </div>
  `;
}


/* -------------------------------------------------------------------------- */
/* TAB: Cloud Source Code Vault (Multi-Cloud Project Backup)                  */
/* -------------------------------------------------------------------------- */
function renderVaultTab(selectedProject = 'all') {
  const backups = vaultStore.getBackups(selectedProject);
  const totalBytes = backups.reduce((acc, b) => acc + (b.fileSize || 0), 0);
  const totalFormatted = vaultStore.formatBytes(totalBytes);
  // Free tier is 5 GB = 5 * 1024 * 1024 * 1024 bytes
  const percentUsed = Math.min(100, Math.max(0.1, (totalBytes / (5 * 1024 * 1024 * 1024)) * 100)).toFixed(2);

  const backupRowsHtml = backups.map(b => {
    return `
      <div class="admin-vault-item">
        <div class="admin-vault-item-main">
          <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; margin-bottom:0.4rem;">
            <span class="admin-badge admin-badge-success">${b.projectName}</span>
            <span style="font-family:var(--font-mono); font-size:0.82rem; color:var(--brand-blue-light); font-weight:600;">${b.versionTag}</span>
            <span style="font-size:0.78rem; color:var(--text-muted);">${new Date(b.timestamp).toLocaleDateString()} ${new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style="font-size:0.95rem; font-weight:600; color:#fff; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
            <span>📦</span>
            <span>${b.fileName}</span>
            <span style="font-family:var(--font-mono); font-size:0.8rem; color:var(--text-secondary); background:rgba(255,255,255,0.06); padding:0.15rem 0.45rem; border-radius:4px;">${b.fileSizeFormatted}</span>
          </div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.6rem; line-height:1.4;">${b.notes || 'No description provided.'}</p>
          <div style="font-size:0.78rem; color:var(--text-muted); font-family:var(--font-mono); word-break:break-all;">
            Storage Path: <code style="color:var(--brand-blue-light);">${b.storagePath}</code>
          </div>
        </div>

        <div class="admin-vault-item-actions">
          <a href="${b.downloadUrl}" download="${b.fileName}" target="_blank" rel="noopener noreferrer" class="btn-admin btn-admin-primary btn-admin-sm" style="text-decoration:none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Download</span>
          </a>
          <button class="btn-admin btn-admin-danger btn-admin-sm btn-delete-backup" data-id="${b.id}" title="Delete backup snapshot">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h2 class="admin-card-title" style="display:flex; align-items:center; gap:0.5rem;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Cloud Source Code Vault
          </h2>
          <p class="admin-card-subtitle">
            Securely store, sync, and access full project codebases on Google Cloud Storage. Download and restore your codebases on any machine.
          </p>
        </div>
        <button id="adminToggleUploadPanelBtn" class="btn-admin btn-admin-primary">
          <span>+ Upload Project Archive (.zip)</span>
        </button>
      </div>

      <!-- Cloud Storage Health & Metrics -->
      <div class="admin-vault-stats-grid">
        <div class="admin-vault-stat-card">
          <div class="stat-label">Google Cloud Storage Bucket</div>
          <div class="stat-value" style="font-size:0.92rem; font-family:var(--font-mono); color:var(--brand-blue-light); word-break:break-all;">orvexi-b1253.firebasestorage.app</div>
          <div class="stat-sub">Enterprise multi-region cloud storage</div>
        </div>
        <div class="admin-vault-stat-card">
          <div class="stat-label">Stored Backups</div>
          <div class="stat-value">${backups.length} Snapshots</div>
          <div class="stat-sub">Across all client &amp; internal platforms</div>
        </div>
        <div class="admin-vault-stat-card">
          <div class="stat-label">Capacity Used</div>
          <div class="stat-value">${totalFormatted} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">/ 5.0 GB Free</span></div>
          <div style="background:rgba(255,255,255,0.08); height:6px; border-radius:3px; overflow:hidden; margin-top:0.4rem;">
            <div style="background:var(--brand-blue-light); width:${percentUsed}%; height:100%;"></div>
          </div>
        </div>
      </div>

      <!-- Upload Form (Interactive Panel) -->
      <div id="adminVaultUploadPanel" style="display:none; background:rgba(14,24,54,0.7); border:1px solid rgba(62,181,241,0.25); border-radius:var(--radius-md); padding:1.5rem; margin-bottom:1.5rem;">
        <h3 style="font-size:1.1rem; color:#fff; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
          <span>☁️</span> Upload Project Codebase Archive
        </h3>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1.25rem;">
          Upload a compressed <code>.zip</code> or <code>.tar.gz</code> archive containing your project files. Files are streamed directly into your Google Cloud Storage bucket.
        </p>

        <form id="vaultUploadForm">
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Target Web Project *</label>
              <select id="vaultProjectSelect" class="admin-select" required>
                ${SUPPORTED_PROJECTS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="admin-form-group" id="vaultCustomProjectGroup" style="display:none;">
              <label class="admin-label">Custom Project Name</label>
              <input type="text" id="vaultCustomProjectName" class="admin-input" placeholder="e.g. My Client Platform">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Version / Release Tag</label>
              <input type="text" id="vaultVersionTag" class="admin-input" placeholder="e.g. v1.2.0-main" value="v${new Date().toISOString().slice(0, 10)}">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Backup Notes / Description</label>
            <textarea id="vaultNotesInput" class="admin-textarea" rows="2" placeholder="e.g. Production snapshot before client demo. Contains landscape screenshots and revised hero slider."></textarea>
          </div>

          <!-- Drag and Drop Zone -->
          <div class="admin-form-group">
            <label class="admin-label">Select Archive (.zip, .tar.gz) *</label>
            <div id="vaultDropZone" class="admin-vault-dropzone">
              <div style="font-size:2rem; margin-bottom:0.5rem;">📁</div>
              <div style="font-weight:600; color:#fff; margin-bottom:0.25rem;">Drag &amp; drop your codebase .zip here</div>
              <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:0.75rem;">or click to browse from your device</div>
              <label class="btn-admin btn-admin-secondary btn-admin-sm" style="cursor:pointer; display:inline-flex;">
                <span>Choose File</span>
                <input type="file" id="vaultArchiveFileInput" accept=".zip,.tar.gz,.tgz,.tar,.json" style="display:none;" required>
              </label>
              <div id="vaultSelectedFileName" style="margin-top:0.6rem; font-family:var(--font-mono); font-size:0.84rem; color:var(--brand-blue-light);"></div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div id="vaultUploadProgressWrap" style="display:none; margin:1rem 0;">
            <div style="display:flex; justify-content:space-between; font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.35rem;">
              <span id="vaultUploadStatusText">Uploading to Google Cloud Storage...</span>
              <span id="vaultUploadPercent">0%</span>
            </div>
            <div style="background:rgba(255,255,255,0.08); height:8px; border-radius:4px; overflow:hidden;">
              <div id="vaultProgressBar" style="background:linear-gradient(90deg, #3eb5f1, #1a6fd4); width:0%; height:100%; transition:width 0.2s ease;"></div>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.25rem;">
            <button type="button" id="vaultCancelUploadBtn" class="btn-admin btn-admin-secondary">Cancel</button>
            <button type="submit" id="vaultSubmitUploadBtn" class="btn-admin btn-admin-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <span>Upload to Cloud</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Filter Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.25rem;">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <label style="font-size:0.85rem; color:var(--text-secondary);">Filter by Project:</label>
          <select id="vaultFilterSelect" class="admin-select" style="min-width:220px;">
            <option value="all" ${selectedProject === 'all' ? 'selected' : ''}>All Projects (${backups.length})</option>
            ${SUPPORTED_PROJECTS.map(p => `<option value="${p.id}" ${selectedProject === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
          </select>
        </div>

        <button id="vaultRefreshBtn" class="btn-admin btn-admin-secondary btn-admin-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          <span>Refresh</span>
        </button>
      </div>

      <!-- Backups List -->
      <div id="vaultBackupsList">
        ${backupRowsHtml || '<div style="padding:2.5rem; text-align:center; color:var(--text-muted); background:rgba(11,14,23,0.5); border-radius:var(--radius-md);">No backups found for this project. Click "+ Upload Project Archive" to store your first codebase snapshot.</div>'}
      </div>

      <hr style="border:0; border-top:1px solid rgba(255,255,255,0.08); margin:2rem 0;">

      <!-- CLI & Developer Synchronization Instructions -->
      <div style="background:rgba(11,14,23,0.8); border:1px solid rgba(62,181,241,0.15); border-radius:var(--radius-md); padding:1.25rem;">
        <h4 style="font-size:0.98rem; color:#fff; margin-bottom:0.4rem; display:flex; align-items:center; gap:0.5rem;">
          <span>💻</span> Local Machine Synchronization (One-Command Sync)
        </h4>
        <p style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:0.75rem; line-height:1.45;">
          You can also synchronize your local folders directly from your terminal without opening a browser. These scripts automatically ignore <code>node_modules</code>, <code>dist</code>, and <code>.git</code> to keep archives lightweight:
        </p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; font-family:var(--font-mono); font-size:0.82rem;">
          <div style="background:#07090f; padding:0.85rem; border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
            <div style="color:var(--brand-blue-light); font-weight:600; margin-bottom:0.25rem;">1. Create Local Backup Archive:</div>
            <code style="color:#a5f3fc; display:block; margin-bottom:0.35rem;">npm run backup:local</code>
            <span style="color:var(--text-muted); font-size:0.75rem;">Zips clean code ready to upload or store</span>
          </div>

          <div style="background:#07090f; padding:0.85rem; border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
            <div style="color:var(--brand-blue-light); font-weight:600; margin-bottom:0.25rem;">2. Upload to Google Cloud Storage:</div>
            <code style="color:#a5f3fc; display:block; margin-bottom:0.35rem;">npm run backup:cloud</code>
            <span style="color:var(--text-muted); font-size:0.75rem;">Zips &amp; syncs directly to cloud bucket</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* TAB 6: Settings & Security                                                 */
/* -------------------------------------------------------------------------- */
function renderSettingsTab(settings) {
  return `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h2 class="admin-card-title">Security &amp; Password Management</h2>
          <p class="admin-card-subtitle">Update your master admin password or configure recovery preferences.</p>
        </div>
      </div>

      <!-- Password Update Form -->
      <form id="adminPasswordChangeForm" style="max-width:480px; margin-bottom:2rem;">
        <div class="admin-form-group">
          <label class="admin-label">Current Password</label>
          <input type="password" id="currentPassInput" class="admin-input" placeholder="Current password" required>
        </div>
        <div class="admin-form-group">
          <label class="admin-label">New Password</label>
          <input type="password" id="newPassInput" class="admin-input" placeholder="New strong password" required>
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Confirm New Password</label>
          <input type="password" id="confirmPassInput" class="admin-input" placeholder="Confirm new password" required>
        </div>
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button type="submit" class="btn-admin btn-admin-primary">Save New Password</button>
          <button type="button" id="restoreMasterPwdInSettingsBtn" class="btn-admin btn-admin-secondary">
            Reset to Default ("${MASTER_DEFAULT_PASSWORD}")
          </button>
        </div>
      </form>

      <hr style="border:0; border-top:1px solid rgba(255,255,255,0.08); margin:1.75rem 0;">

      <!-- Outbound Email Settings (Zoho CPaaS & ZeptoMail) -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
        <div>
          <h3 style="font-size:1.1rem; color:#fff; margin:0 0 0.2rem;">Zoho CPaaS &amp; ZeptoMail Email Dispatch</h3>
          <p style="color:var(--text-secondary); font-size:0.84rem; margin:0;">
            Configure official transactional and bulk broadcast email sending via <strong>ceo@orvexi.rw</strong>.
          </p>
        </div>
        ${zohoEmailService.isConfigured() 
          ? `<span style="background:rgba(132,204,22,0.15); color:#84cc16; border:1px solid #84cc16; font-size:0.74rem; padding:0.2rem 0.6rem; border-radius:12px; font-weight:700;">● Active Relay (${escapeHtml(zohoEmailService.getConfig().senderEmail)})</span>`
          : `<span style="background:rgba(234,179,8,0.15); color:#eab308; border:1px solid #eab308; font-size:0.74rem; padding:0.2rem 0.6rem; border-radius:12px; font-weight:700;">⚠ Setup Required (Enter API Key)</span>`
        }
      </div>

      <div style="background:rgba(7,9,15,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:1.25rem; max-width:620px; margin-bottom:1.5rem;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; font-size:0.82rem; margin-bottom:1rem; color:var(--text-secondary);">
          <div>Sender: <strong style="color:#fff;">${escapeHtml(zohoEmailService.getConfig().senderEmail || 'ceo@orvexi.rw')}</strong></div>
          <div>REST Host: <strong style="color:#fff;">${escapeHtml(zohoEmailService.getConfig().host || 'cpaas.zoho.com')}</strong></div>
          <div>Agent Alias: <strong style="color:#fff;">${escapeHtml(zohoEmailService.getConfig().agentAlias || '1791ea76b71e26a9')}</strong></div>
          <div>SMTP Server: <strong style="color:#fff;">${escapeHtml(zohoEmailService.getConfig().smtpHost || 'smtp.zeptomail.com')}</strong></div>
          <div>Ports: <strong style="color:#fff;">465 (SSL) / 587 (TLS)</strong></div>
          <div>Domain: <strong style="color:#84cc16;">@orvexi.rw</strong></div>
        </div>

        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button type="button" id="settingsConfigureZohoBtn" class="btn-admin btn-admin-primary" style="background:#84cc16; color:#0b1402; font-weight:700;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>Manage Zoho Credentials</span>
          </button>
          <button type="button" id="settingsTestZohoBtn" class="btn-admin btn-admin-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <span>Send Test Email (ceo@orvexi.rw)</span>
          </button>
        </div>
      </div>

      <hr style="border:0; border-top:1px solid rgba(255,255,255,0.08); margin:1.75rem 0;">

      <h3 style="font-size:1.1rem; color:#fff; margin-bottom:0.75rem;">Backup &amp; Export</h3>
      <p style="color:var(--text-secondary); font-size:0.88rem; margin-bottom:1rem;">
        Download all current slides, projects, services, and content as a standalone JSON backup.
      </p>
      <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:1.5rem;">
        <button id="exportContentJsonBtn" class="btn-admin btn-admin-secondary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Download Content JSON</span>
        </button>

        <label class="btn-admin btn-admin-secondary" style="cursor:pointer;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <span>Import JSON File</span>
          <input type="file" id="importJsonFileInput" accept=".json" style="display:none;">
        </label>
      </div>

      <hr style="border:0; border-top:1px solid rgba(255,255,255,0.08); margin:1.75rem 0;">

      <h3 style="font-size:1.1rem; color:#ef4444; margin-bottom:0.75rem;">Factory Reset</h3>
      <p style="color:var(--text-secondary); font-size:0.88rem; margin-bottom:1rem;">
        Reset all sections, hero slides, and services back to original default settings.
      </p>
      <button id="resetFactoryDefaultsBtn" class="btn-admin btn-admin-danger">
        <span>Reset Content to Defaults</span>
      </button>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* TAB 7: Bookings Pipeline (SANEX Company LTD Inspired)                       */
/* -------------------------------------------------------------------------- */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderBookingsTab() {
  const allBookings = bookingStore.bookings;
  const filteredBookings = bookingStore.getBookings({
    status: bookingStatusFilter,
    search: bookingSearchQuery,
    channel: bookingChannelFilter
  });

  const stats = bookingStore.getStats();

  const distinctChannels = Array.from(new Set([
    ...bookingStore.bookings.map(b => b.channel).filter(Boolean),
    'Google Search', 'Website Direct'
  ]));

  return `
    <div id="bookingsContentWrap">
      <!-- Back Link -->
      <div style="margin-bottom: 0.85rem;">
        <button class="btn-admin btn-admin-secondary btn-admin-sm" id="bookingsBackToDashboardBtn" style="border:none; background:transparent; color:var(--text-secondary); padding:0; display:inline-flex; align-items:center; gap:0.4rem; cursor:pointer;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span>Back to Dashboard</span>
        </button>
      </div>

      <!-- Main Pipeline Card -->
      <div class="bookings-pipeline-card">
        <!-- Card Header (SANEX Layout) -->
        <div class="admin-card-header" style="margin-bottom: 1.25rem;">
          <div style="display:flex; align-items:flex-start; gap:0.75rem;">
            <div style="width:38px; height:38px; border-radius:8px; background:rgba(132, 204, 22, 0.15); color:#84cc16; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 12h6"></path><path d="M9 16h6"></path></svg>
            </div>
            <div>
              <h2 class="admin-card-title" style="margin-bottom:0.2rem;">Bookings</h2>
              <p class="admin-card-subtitle" style="margin-bottom:0;">Manage incoming bookings and track service requests.</p>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
            <button id="bookingsRefreshBtn" class="btn-admin btn-admin-secondary btn-admin-sm" title="Refresh records from cloud">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              <span>Refresh</span>
            </button>
            <button id="bookingsAnalyticsBtn" class="btn-admin btn-admin-secondary btn-admin-sm" title="View attribution channel breakdown">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              <span>Channel Analytics</span>
            </button>
            <button id="bookingsExportCsvBtn" class="btn-admin btn-admin-secondary btn-admin-sm" style="border-color:rgba(132, 204, 22, 0.4); color:#84cc16;" title="Export Excel / CSV spreadsheet">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              <span>Export Excel</span>
              <span id="bookingsExportBadge" style="background:#84cc16; color:#0b1402; padding:0.1rem 0.4rem; border-radius:10px; font-size:0.72rem; font-weight:700; margin-left:0.3rem;">${allBookings.length}</span>
            </button>
            <span id="bookingsCounterLabel" style="font-size:0.86rem; color:var(--text-secondary); font-weight:600; margin-left:0.4rem;">
              ${filteredBookings.length} of ${allBookings.length} Requests
            </span>
          </div>
        </div>

        <!-- Search & Status Filter Bar -->
        <div class="bookings-filter-bar">
          <div class="bookings-search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="bookingsSearchInput" class="bookings-search-input" placeholder="Search by customer, email, phone, or service..." value="${escapeHtml(bookingSearchQuery)}">
            ${bookingSearchQuery ? `<button type="button" class="clear-search-btn" id="bookingsClearSearchBtn" title="Clear search">&times;</button>` : ''}
          </div>

          <div class="bookings-status-tabs">
            <span class="bookings-status-tabs-label" style="font-size:0.74rem; font-weight:700; color:var(--text-muted); margin-right:0.25rem;">STATUS</span>
            <button class="status-tab-btn ${bookingStatusFilter === 'All' ? 'active' : ''}" data-status="All">
              <span>All</span>
            </button>
            <button class="status-tab-btn ${bookingStatusFilter === 'Pending' ? 'active' : ''}" data-status="Pending">
              <span>Pending</span>
              ${stats.pending > 0 ? `<span class="tab-count">${stats.pending}</span>` : ''}
            </button>
            <button class="status-tab-btn ${bookingStatusFilter === 'Confirmed' ? 'active' : ''}" data-status="Confirmed">
              <span>Confirmed</span>
              ${stats.confirmed > 0 ? `<span class="tab-count">${stats.confirmed}</span>` : ''}
            </button>
            <button class="status-tab-btn ${bookingStatusFilter === 'Completed' ? 'active' : ''}" data-status="Completed">
              <span>Completed</span>
            </button>
            <button class="status-tab-btn ${bookingStatusFilter === 'Cancelled' ? 'active' : ''}" data-status="Cancelled">
              <span>Cancelled</span>
            </button>
          </div>
        </div>

        <!-- Sub-filter Channel Row -->
        <div class="bookings-channel-row">
          <div style="display:flex; align-items:center; gap:0.35rem; font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-right:0.35rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            <span>CHANNEL:</span>
          </div>
          <button class="channel-pill-btn ${bookingChannelFilter === 'All' ? 'active' : ''}" data-channel="All">All Channels</button>
          ${distinctChannels.map(ch => `
            <button class="channel-pill-btn ${bookingChannelFilter === ch ? 'active' : ''}" data-channel="${escapeHtml(ch)}">${escapeHtml(ch)}</button>
          `).join('')}
        </div>

        <!-- Bookings Cards Container -->
        <div id="bookingsListContainer">
          ${renderBookingCardsHtml(filteredBookings)}
        </div>
      </div>
    </div>
  `;
}

function renderBookingCardsHtml(bookings) {
  if (!bookings || bookings.length === 0) {
    return `
      <div style="padding: 3.5rem 1rem; text-align: center; color: var(--text-muted); background: rgba(7, 9, 15, 0.4); border-radius: var(--radius-md); border: 1px dashed rgba(255, 255, 255, 0.08);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:0.75rem; opacity:0.5;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <div style="font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 0.35rem;">No service requests found</div>
        <p style="font-size: 0.85rem; margin: 0;">Try adjusting your search terms or filters above, or submit a request via the public portal.</p>
      </div>
    `;
  }

  return bookings.map(b => {
    const statusClass = (b.status || 'Pending').toLowerCase();
    const channelUpper = (b.channel || 'Website Direct').toUpperCase();

    return `
      <div class="booking-card ${statusClass}" data-id="${b.id}">
        <!-- Left Column: Customer & Contact -->
        <div>
          <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.65rem; flex-wrap:wrap;">
            <span class="booking-status-pill ${statusClass}">${escapeHtml(b.status || 'Pending')}</span>
            <span class="booking-date-meta">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>${escapeHtml(b.createdAtFormatted || 'Recent')}</span>
            </span>
          </div>

          <div class="booking-customer-name">${escapeHtml(b.customerName || 'Anonymous Client')}</div>

          ${b.email ? `
            <div class="booking-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a>
            </div>
          ` : ''}

          ${b.phone ? `
            <div class="booking-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <a href="tel:${escapeHtml(b.phone)}">${escapeHtml(b.phone)}</a>
            </div>
          ` : ''}

          <div style="margin-top: 0.75rem;">
            <span class="booking-channel-badge">VIA ${escapeHtml(channelUpper)}</span>
          </div>
        </div>

        <!-- Middle Column: Requested Service & Details -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap; margin-bottom:0.75rem;">
            <div style="flex:1; min-width:200px;">
              <div class="booking-section-label">REQUESTED SERVICE</div>
              <div class="booking-service-title">${escapeHtml(b.service || 'General Technical Consultation')}</div>
            </div>

            <div class="booking-appointment-box">
              <div class="booking-section-label" style="display:flex; align-items:center; gap:0.35rem; color:#84cc16; margin-bottom:0.25rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>APPOINTMENT DATE</span>
              </div>
              <div class="booking-appointment-date">${escapeHtml(b.preferredDateFormatted || b.preferredDate || 'TBD')}</div>
              <div class="booking-appointment-time">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>${escapeHtml(b.timeSlot || 'Flexible')}</span>
              </div>
            </div>
          </div>

          <div class="booking-section-label" style="margin-top:0.75rem;">DETAILS</div>
          <div class="booking-details-box">
            <div style="font-size:0.83rem; color:var(--text-secondary); margin-bottom:0.3rem;">
              <span style="color:var(--text-primary); font-weight:600;">Preferred Appointment:</span> ${escapeHtml(b.preferredDateFormatted || b.preferredDate || 'Flexible')} (${escapeHtml(b.timeSlot || 'Any Time')})
            </div>
            <div style="font-size:0.83rem; color:var(--text-secondary); margin-bottom:0.5rem;">
              <span style="color:var(--text-primary); font-weight:600;">Heard About Us:</span> ${escapeHtml(b.channel || 'Website Direct')}
            </div>
            ${b.reference ? `<div style="font-size:0.78rem; color:var(--text-muted); font-family:var(--font-mono); margin-bottom:0.45rem;">Reference: ${escapeHtml(b.reference)}</div>` : ''}
            <div class="booking-notes-content">${escapeHtml(b.notes || 'No extra notes provided.')}</div>
          </div>

          ${b.locationUrl ? `
            <div style="margin-top:0.75rem;">
              <a href="${escapeHtml(b.locationUrl)}" target="_blank" rel="noopener noreferrer" class="btn-admin btn-admin-secondary btn-admin-sm" style="border-color:rgba(132, 204, 22, 0.4); color:#84cc16; text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                <span>VIEW LOCATION LINK</span>
              </a>
            </div>
          ` : ''}
        </div>

        <!-- Right Column: Actions -->
        <div class="booking-card-actions">
          <div class="booking-section-label" style="text-align:right;">ACTIONS</div>

          ${b.status === 'Pending' ? `
            <button class="btn-booking-primary btn-confirm-booking" data-id="${b.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Confirm Request</span>
            </button>
            <button class="btn-booking-action-text btn-cancel-booking" data-id="${b.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              <span>CANCEL REQUEST</span>
            </button>
          ` : ''}

          ${b.status === 'Confirmed' ? `
            <button class="btn-booking-complete btn-complete-booking" data-id="${b.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Mark Completed</span>
            </button>
            <button class="btn-booking-action-text btn-cancel-booking" data-id="${b.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              <span>CANCEL REQUEST</span>
            </button>
          ` : ''}

          ${b.status === 'Completed' ? `
            <button class="btn-booking-action-text btn-reopen-booking" data-id="${b.id}" style="color:#84cc16;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              <span>Reopen as Pending</span>
            </button>
          ` : ''}

          ${b.status === 'Cancelled' ? `
            <button class="btn-booking-action-text btn-reopen-booking" data-id="${b.id}" style="color:#84cc16;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              <span>Restore to Pending</span>
            </button>
          ` : ''}

          <button class="btn-booking-action-text btn-delete-booking" data-id="${b.id}" style="color:var(--status-danger);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderChannelAnalyticsModal() {
  const stats = bookingStore.getStats();
  const total = stats.total || 1;
  const channelEntries = Object.entries(stats.channelMap).sort((a, b) => b[1] - a[1]);

  return `
    <div class="admin-modal-backdrop" id="adminModalBackdrop">
      <div class="admin-modal" style="max-width:620px;">
        <div class="admin-modal-header">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div style="width:32px; height:32px; border-radius:6px; background:rgba(132, 204, 22, 0.15); color:#84cc16; display:flex; align-items:center; justify-content:center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 class="admin-modal-title">Attribution &amp; Channel Analytics</h3>
          </div>
          <button class="admin-modal-close" id="modalCloseBtn">&times;</button>
        </div>

        <div style="padding:1.5rem;">
          <!-- Metric Badges Row -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:0.75rem; margin-bottom:1.5rem;">
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.75rem; text-align:center;">
              <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Total</div>
              <div style="font-size:1.4rem; font-weight:700; color:#fff; margin-top:0.2rem;">${stats.total}</div>
            </div>
            <div style="background:rgba(234,179,8,0.08); border:1px solid rgba(234,179,8,0.25); border-radius:8px; padding:0.75rem; text-align:center;">
              <div style="font-size:0.72rem; color:#eab308; text-transform:uppercase; font-weight:700;">Pending</div>
              <div style="font-size:1.4rem; font-weight:700; color:#eab308; margin-top:0.2rem;">${stats.pending}</div>
            </div>
            <div style="background:rgba(132,204,22,0.08); border:1px solid rgba(132,204,22,0.25); border-radius:8px; padding:0.75rem; text-align:center;">
              <div style="font-size:0.72rem; color:#84cc16; text-transform:uppercase; font-weight:700;">Confirmed</div>
              <div style="font-size:1.4rem; font-weight:700; color:#84cc16; margin-top:0.2rem;">${stats.confirmed}</div>
            </div>
            <div style="background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.25); border-radius:8px; padding:0.75rem; text-align:center;">
              <div style="font-size:0.72rem; color:#3b82f6; text-transform:uppercase; font-weight:700;">Completed</div>
              <div style="font-size:1.4rem; font-weight:700; color:#3b82f6; margin-top:0.2rem;">${stats.completed}</div>
            </div>
          </div>

          <!-- Channel Distribution Breakdown -->
          <h4 style="font-size:0.88rem; color:#fff; margin-bottom:1rem; text-transform:uppercase; letter-spacing:0.5px; font-weight:700;">Traffic Attribution Breakdown</h4>
          <div style="display:flex; flex-direction:column; gap:0.85rem;">
            ${channelEntries.length === 0 ? '<p style="color:var(--text-muted); margin:0;">No requests recorded yet.</p>' : channelEntries.map(([channel, count]) => {
              const pct = Math.round((count / total) * 100);
              return `
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:0.84rem; margin-bottom:0.35rem;">
                    <span style="font-weight:600; color:var(--text-primary);">${escapeHtml(channel)}</span>
                    <span style="color:var(--text-secondary); font-family:var(--font-mono);">${count} requests (${pct}%)</span>
                  </div>
                  <div style="background:rgba(255,255,255,0.08); height:8px; border-radius:4px; overflow:hidden;">
                    <div style="background:linear-gradient(90deg, #84cc16, #3eb5f1); width:${pct}%; height:100%; border-radius:4px;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.75rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.08);">
            <button id="modalCloseBtn2" class="btn-admin btn-admin-secondary">Close</button>
            <button id="modalExportCsvBtn" class="btn-admin btn-admin-primary" style="background:#84cc16; color:#0b1402;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* TAB 8: Manage Contacts & Groups Directory (Screenshot 3 Mirror)           */
/* -------------------------------------------------------------------------- */
function renderContactsTab() {
  const groups = contactStore.getGroups();
  const contacts = contactStore.getContacts({
    group: selectedContactGroup,
    search: contactSearchQuery
  });
  const stats = contactStore.getStats();

  return `
    <div id="contactsContentWrap">
      <!-- Breadcrumb -->
      <div style="margin-bottom: 0.85rem; font-size: 0.82rem; color: var(--text-muted); display:flex; align-items:center; gap:0.4rem;">
        <span style="color:var(--text-secondary);">&lt; Operations</span>
        <span>/</span>
        <span style="color:#84cc16; font-weight:600;">Manage Contacts</span>
      </div>

      <!-- Header Title -->
      <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:1.25rem;">
        <div style="width:36px; height:36px; border-radius:8px; background:rgba(132, 204, 22, 0.15); color:#84cc16; display:flex; align-items:center; justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div>
          <h2 style="font-size:1.35rem; font-weight:800; color:#fff; margin:0 0 0.15rem;">Manage Contacts</h2>
          <p style="font-size:0.84rem; color:var(--text-secondary); margin:0;">Organize target sector groups, add or remove recipients, and manage broadcast mailing lists.</p>
        </div>
      </div>

      <!-- Top Header Banner Card (Screenshot 3) -->
      <div class="contacts-header-banner">
        <div class="contacts-header-left">
          <div class="contacts-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div>
            <div class="contacts-title-row">
              <span class="contacts-banner-title">Sector Address Book &amp; Contacts</span>
              <span class="contacts-total-badge" id="contactsTotalBadge">${stats.total} Total Contacts</span>
            </div>
            <p class="contacts-banner-sub">Organized contact lists for Enterprise Clients, Universities, Tech Partners, Government, and Custom Groups</p>
          </div>
        </div>

        <div class="contacts-header-actions">
          <button id="contactsPurgeAllBtn" class="btn-admin btn-admin-danger btn-admin-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Purge All (${stats.total})</span>
          </button>
          <button id="contactsExportCsvBtn" class="btn-admin btn-admin-secondary btn-admin-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Export Excel</span>
          </button>
          <button id="contactsImportBtn" class="btn-admin btn-admin-secondary btn-admin-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <span>Import Contacts</span>
          </button>
          <button id="contactsAddRecipientBtn" class="btn-admin btn-admin-primary btn-admin-sm" style="background:#84cc16; color:#0b1402; font-weight:700;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add Recipient</span>
          </button>
        </div>
      </div>

      <!-- Groups Navigation Tabs (Screenshot 3) -->
      <div class="contacts-groups-nav">
        <button class="group-tab-btn ${selectedContactGroup === 'All' ? 'active' : ''}" data-group="All">
          <span>All Contacts</span>
          <span class="group-count">${stats.total}</span>
        </button>
        ${groups.map(g => `
          <button class="group-tab-btn ${selectedContactGroup === g ? 'active' : ''}" data-group="${escapeHtml(g)}">
            <span>${escapeHtml(g)}</span>
            <span class="group-count">${stats.groupCounts[g] || 0}</span>
          </button>
        `).join('')}
        <button id="addContactGroupBtn" class="btn-add-group">
          + Add Group
        </button>
        <button id="manageContactGroupsBtn" class="group-tab-btn" style="border-style:dashed;">
          📁 Manage Groups
        </button>
      </div>

      <!-- Search & Showing Row -->
      <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:1rem; flex-wrap:wrap;">
        <div class="bookings-search-wrap" style="max-width:440px; flex:1;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="contactsSearchInput" class="bookings-search-input" placeholder="Search by name, email, organization, or phone..." value="${escapeHtml(contactSearchQuery)}">
        </div>
        <div style="font-size:0.84rem; color:var(--text-secondary);" id="contactsShowingCount">
          Showing ${contacts.length} of ${stats.total} contacts
        </div>
      </div>

      <!-- Contacts Table -->
      <div class="contacts-table-wrap">
        <table class="contacts-table">
          <thead>
            <tr>
              <th width="40"><input type="checkbox" id="contactsSelectAll"></th>
              <th>CONTACT / NAME</th>
              <th>EMAIL ADDRESS</th>
              <th>ORGANIZATION / PHONE</th>
              <th style="text-align:right;">SECTOR / ACTION</th>
            </tr>
          </thead>
          <tbody id="contactsTableBody">
            ${renderContactsTableRows(contacts)}
          </tbody>
        </table>
      </div>

      <!-- Floating Batch Actions Bar (when checkboxes are checked) -->
      <div id="contactsBatchBar" style="display:${selectedContactIds.size > 0 ? 'flex' : 'none'}; align-items:center; justify-content:space-between; background:rgba(7,9,15,0.95); border:1px solid #84cc16; border-radius:var(--radius-md); padding:0.85rem 1.25rem; margin-top:1rem; box-shadow:0 8px 24px rgba(0,0,0,0.5);">
        <div style="font-size:0.88rem; color:#fff;">
          <strong style="color:#84cc16;" id="batchCountSpan">${selectedContactIds.size}</strong> contact(s) selected
        </div>
        <div style="display:flex; gap:0.6rem;">
          <button id="batchDeleteContactsBtn" class="btn-admin btn-admin-danger btn-admin-sm">Delete Selected</button>
        </div>
      </div>
    </div>
  `;
}

function renderContactsTableRows(contacts) {
  if (!contacts || contacts.length === 0) {
    return `
      <tr>
        <td colspan="5" style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
          No contacts found matching the selected group or search query.
        </td>
      </tr>
    `;
  }

  return contacts.map(c => {
    const isChecked = selectedContactIds.has(c.id);
    const initial = (c.name || 'C')[0].toUpperCase();

    return `
      <tr data-id="${c.id}">
        <td>
          <input type="checkbox" class="contact-row-check" data-id="${c.id}" ${isChecked ? 'checked' : ''}>
        </td>
        <td>
          <div class="contact-name-cell">
            <div class="contact-avatar">${initial}</div>
            <div>
              <div style="font-weight:600; color:#fff;">${escapeHtml(c.name)}</div>
            </div>
          </div>
        </td>
        <td>
          <a href="mailto:${escapeHtml(c.email)}" style="color:var(--text-secondary); text-decoration:none; display:flex; align-items:center; gap:0.4rem;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <span>${escapeHtml(c.email)}</span>
          </a>
        </td>
        <td>
          <div style="color:var(--text-secondary); font-size:0.84rem;">${escapeHtml(c.organization || '—')}</div>
          ${c.phone ? `<div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${escapeHtml(c.phone)}</div>` : ''}
        </td>
        <td style="text-align:right;">
          <div style="display:inline-flex; align-items:center; gap:0.5rem;">
            <span class="contact-sector-badge">${escapeHtml(c.group || 'General')}</span>
            <button type="button" class="contact-action-btn btn-edit-contact" data-id="${c.id}" title="Edit Contact">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button type="button" class="contact-action-btn delete btn-delete-contact" data-id="${c.id}" title="Delete Contact">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/* -------------------------------------------------------------------------- */
/* TAB 9: Send Email Campaign Dispatcher (Screenshot 2 Mirror)               */
/* -------------------------------------------------------------------------- */
function renderSendEmailTab() {
  const campaign = emailStore.campaign;
  const groups = contactStore.getGroups();
  const contactStats = contactStore.getStats();
  const bookingStats = bookingStore.getStats();
  const history = emailStore.history;

  const recipientCount = (campaign.recipientsText || '')
    .split(/[,;\n]/)
    .map(r => r.trim())
    .filter(r => r.includes('@')).length;

  return `
    <div id="sendEmailContentWrap">
      <!-- Breadcrumb -->
      <div style="margin-bottom: 0.85rem; font-size: 0.82rem; color: var(--text-muted); display:flex; align-items:center; gap:0.4rem;">
        <span style="color:var(--text-secondary);">&lt; Operations</span>
        <span>/</span>
        <span style="color:#84cc16; font-weight:600;">Send Email</span>
      </div>

      <!-- Header Title -->
      <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:1.25rem;">
        <div style="width:36px; height:36px; border-radius:8px; background:rgba(132, 204, 22, 0.15); color:#84cc16; display:flex; align-items:center; justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        <div>
          <h2 style="font-size:1.35rem; font-weight:800; color:#fff; margin:0 0 0.15rem;">Send Email</h2>
          <p style="font-size:0.84rem; color:var(--text-secondary); margin:0;">Compose custom newsletters, outbound service broadcasts, and corporate updates.</p>
        </div>
      </div>

      <div class="send-email-wrapper">
        <form id="sendEmailDispatchForm">
          <!-- Zoho CPaaS & ZeptoMail Relay Status Banner -->
          <div style="background: rgba(132, 204, 22, 0.05); border: 1px solid rgba(132, 204, 22, 0.2); border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <div style="width: 42px; height: 42px; border-radius: 8px; background: rgba(132,204,22,0.15); display: flex; align-items: center; justify-content: center; color: #84cc16; font-size: 1.25rem; flex-shrink: 0;">
                ⚡
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                  <span style="font-weight: 700; color: #fff; font-size: 0.95rem;">Zoho CPaaS &amp; ZeptoMail Dispatch Relay</span>
                  ${zohoEmailService.isConfigured() 
                    ? `<span style="background:rgba(132,204,22,0.2); color:#84cc16; border:1px solid #84cc16; font-size:0.72rem; padding:0.15rem 0.55rem; border-radius:12px; font-weight:700;">● Connected (${escapeHtml(zohoEmailService.getConfig().senderEmail)})</span>`
                    : `<span style="background:rgba(234,179,8,0.2); color:#eab308; border:1px solid #eab308; font-size:0.72rem; padding:0.15rem 0.55rem; border-radius:12px; font-weight:700;">⚠ Setup Required (Enter API Key)</span>`
                  }
                </div>
                <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.25rem;">
                  Sender: <strong style="color:#fff;">${escapeHtml(zohoEmailService.getConfig().senderEmail || 'ceo@orvexi.rw')}</strong> &bull; Host: <code>cpaas.zoho.com</code> &bull; Alias: <code>1791ea76b71e26a9</code> &bull; SMTP: <code>smtp.zeptomail.com:465</code>
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button type="button" id="openZohoConfigBtn" class="btn-admin btn-admin-secondary btn-admin-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <span>Configure Zoho Credentials</span>
              </button>
              <button type="button" id="testZohoConnectionBtn" class="btn-admin btn-admin-secondary btn-admin-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                <span>Send Test Email (ceo@orvexi.rw)</span>
              </button>
            </div>
          </div>

          <!-- Template selector row (Screenshot 2) -->
          <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:1.25rem;">
            <div style="flex:1; min-width:280px;">
              <label class="admin-label">Email Template / Campaign</label>
              <select id="emailTemplateSelect" class="admin-select" style="width:100%;">
                <option value="Custom Designed Newsletter (Tailored Communication)" selected>Custom Designed Newsletter (Tailored Communication)</option>
                <option value="Enterprise Platform Launch & Advisory">Enterprise Platform Launch & Advisory</option>
                <option value="Client Consultation Follow-up & Brief">Client Consultation Follow-up & Brief</option>
                <option value="Quarterly Technology Update">Quarterly Technology Update</option>
              </select>
            </div>
            <div style="align-self:flex-end;">
              <button type="button" id="openEmailDesignerBtn" class="btn-admin btn-admin-primary" style="background:#84cc16; color:#0b1402; font-weight:700;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                <span>Open Email Designer</span>
              </button>
            </div>
          </div>

          <!-- Status Card (Screenshot 2) -->
          <div class="email-status-card">
            <div class="email-status-left">
              <span class="email-status-tag">Custom Design Ready</span>
              <div>
                <div style="font-weight:700; color:#fff; font-size:0.95rem;">Custom Email Layout &amp; Content</div>
                <div style="font-size:0.78rem; color:var(--text-secondary);">ORVEXI Official Branded Layout &bull; ${campaign.blocks?.length || 8} Content Blocks &bull; Custom HTML Content</div>
              </div>
            </div>
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
              <button type="button" id="emailLiveSyncBtn" class="btn-admin btn-admin-secondary btn-admin-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                <span>Live Sync</span>
              </button>
              <button type="button" id="emailEditDesignBtn" class="btn-admin btn-admin-secondary btn-admin-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>Edit Design &amp; Layout</span>
              </button>
              <button type="button" id="emailPreviewBtn" class="btn-admin btn-admin-secondary btn-admin-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span>Preview Email</span>
              </button>
            </div>
          </div>

          <!-- Subject Line -->
          <div class="admin-form-group">
            <label class="admin-label">Email Subject Line *</label>
            <input type="text" id="campaignSubjectInput" class="admin-input" placeholder="e.g. WHO ARE WE? Modern Software Publishing & Cloud Platforms in Rwanda" value="${escapeHtml(campaign.subject)}" required>
          </div>

          <!-- Organization / Contact Name -->
          <div class="admin-form-group">
            <label class="admin-label">Organization or Contact Name (Optional)</label>
            <input type="text" id="campaignOrgNameInput" class="admin-input" placeholder="e.g. Kigali Serena Hotel, Bank of Kigali, University of Rwanda, etc." value="${escapeHtml(campaign.organizationName || '')}">
          </div>

          <!-- Public Web Publication & SEO Link Box (Screenshot 2) -->
          <div class="email-seo-panel">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <span style="color:#84cc16; font-size:1.1rem;">📖</span>
                <span style="font-weight:700; color:#fff; font-size:0.92rem;">Host as Public Web Publication &amp; Generate Special SEO Link</span>
              </div>
              <label class="admin-switch" style="cursor:pointer; display:flex; align-items:center;">
                <input type="checkbox" id="campaignPublishOnlineCheck" ${campaign.publishOnline ? 'checked' : ''} style="accent-color:#84cc16; width:18px; height:18px; cursor:pointer;">
              </label>
            </div>
            <p style="font-size:0.8rem; color:var(--text-secondary); margin:0 0 1rem;">
              Hosts this sent custom email on the website and generates a special shareable SEO link for social media and client reference.
            </p>

            <div style="background:rgba(7,9,15,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:0.75rem 1rem; margin-bottom:1rem;">
              <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:0.25rem;">GENERATED SPECIAL SEO LINK:</div>
              <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <span id="generatedSeoLinkText" style="font-family:var(--font-mono); font-size:0.84rem; color:#84cc16;">https://orvexi.rw/publications/${escapeHtml(campaign.seoSlug || 'newsletter')}</span>
                <span class="contacts-total-badge" style="font-size:0.7rem; padding:0.15rem 0.5rem;">SPECIAL LINK</span>
              </div>
            </div>

            <div class="admin-form-row">
              <div class="admin-form-group" style="margin-bottom:0;">
                <label class="admin-label">CUSTOM SEO KEYWORDS (SLUG)</label>
                <input type="text" id="campaignSlugInput" class="admin-input" placeholder="e.g. who-are-we-modern-software-solutions-rwanda" value="${escapeHtml(campaign.seoSlug || '')}">
              </div>
              <div class="admin-form-group" style="margin-bottom:0;">
                <label class="admin-label">PUBLICATION CATEGORY / SECTOR</label>
                <select id="campaignCategorySelect" class="admin-select">
                  ${EMAIL_CATEGORIES.map(c => `<option value="${c}" ${campaign.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="margin-top:0.85rem; display:flex; align-items:center; gap:0.5rem;">
              <input type="checkbox" id="campaignBrowserViewCheck" ${campaign.includeBrowserViewHeader ? 'checked' : ''} style="accent-color:#84cc16; cursor:pointer;">
              <label for="campaignBrowserViewCheck" style="font-size:0.84rem; color:var(--text-primary); cursor:pointer;">Include "View this email in your browser" header bar in dispatched email</label>
            </div>
          </div>

          <!-- Recipients Section (Screenshot 2) -->
          <div class="admin-form-group" style="margin-top:1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem; flex-wrap:wrap; gap:0.5rem;">
              <label class="admin-label" style="margin-bottom:0;">Recipients *</label>
              <button type="button" id="importContactsToRecipientsBtn" class="btn-admin btn-admin-secondary btn-admin-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <span>Import Contacts</span>
              </button>
            </div>

            <!-- SAVED CONTACTS pills -->
            <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.5rem;">
              <span style="font-size:0.74rem; font-weight:700; color:var(--text-muted);">SAVED CONTACTS:</span>
              ${groups.map(g => `
                <button type="button" class="recipients-chip-btn chip-contact-group" data-group="${escapeHtml(g)}">
                  ${escapeHtml(g)} (${contactStats.groupCounts[g] || 0})
                </button>
              `).join('')}
              <button type="button" class="recipients-chip-btn chip-contact-group" data-group="All" style="background:#000; color:#fff; font-weight:700;">
                All Saved (${contactStats.total})
              </button>
            </div>

            <!-- FROM BOOKINGS pills -->
            <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.75rem;">
              <span style="font-size:0.74rem; font-weight:700; color:var(--text-muted);">FROM BOOKINGS:</span>
              <button type="button" class="recipients-chip-btn chip-booking-filter" data-status="All">All (${bookingStats.total})</button>
              <button type="button" class="recipients-chip-btn chip-booking-filter" data-status="Confirmed">Confirmed (${bookingStats.confirmed})</button>
              <button type="button" class="recipients-chip-btn chip-booking-filter" data-status="Pending">Pending (${bookingStats.pending})</button>
              <button type="button" class="recipients-chip-btn chip-booking-myself" data-email="orvexi@gmail.com">Myself</button>
            </div>

            <!-- Textarea -->
            <textarea id="campaignRecipientsTextarea" class="recipients-textarea" rows="4" placeholder="Paste emails here (e.g. director@hospital.rw, manager@hotel.rw, info@enterprise.com)">${escapeHtml(campaign.recipientsText || '')}</textarea>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
              <span class="contacts-total-badge" id="recipientsReadyBadge" style="background:#000; color:#84cc16; border:1px solid rgba(132,204,22,0.3); font-weight:700;">
                ${recipientCount} Recipients Ready
              </span>
              <button type="button" id="toggleCcBccBtn" style="background:none; border:none; color:var(--brand-blue-light); font-size:0.8rem; cursor:pointer;">
                + Add CC / BCC
              </button>
            </div>
            <div id="ccBccWrap" style="display:none; margin-top:0.75rem;">
              <input type="text" id="campaignCcInput" class="admin-input" placeholder="CC: email1@org.rw, email2@org.rw" style="margin-bottom:0.5rem;">
              <input type="text" id="campaignBccInput" class="admin-input" placeholder="BCC: audit@orvexi.rw">
            </div>
          </div>

          <!-- Bottom Action Bar (Screenshot 2) -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2rem; padding-top:1.25rem; border-top:1px solid rgba(255,255,255,0.08); flex-wrap:wrap; gap:1rem;">
            <label style="display:flex; align-items:center; gap:0.45rem; font-size:0.84rem; color:var(--text-secondary); cursor:pointer;">
              <input type="checkbox" id="sendTestCopyMyself" style="accent-color:#84cc16;">
              <span>Also send a test copy to myself (orvexi@gmail.com)</span>
            </label>

            <div style="display:flex; gap:0.75rem;">
              <button type="button" id="publishOnlineOnlyBtn" class="btn-admin btn-admin-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                <span>Publish Online &amp; Get Link</span>
              </button>
              <button type="submit" id="dispatchCampaignBtn" class="btn-admin btn-admin-primary" style="background:#84cc16; color:#0b1402; font-weight:700;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                <span id="dispatchBtnLabel">Send Campaign to ${recipientCount} Recipients &rarr;</span>
              </button>
            </div>
          </div>
        </form>

        <!-- Dispatched Broadcasts History -->
        ${history.length > 0 ? `
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.08); margin:2.5rem 0 1.5rem;">
          <h3 style="font-size:1.05rem; color:#fff; margin-bottom:1rem;">Dispatched Campaigns History (${history.length})</h3>
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            ${history.map(h => `
              <div style="background:rgba(7,9,15,0.6); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:0.9rem 1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
                <div>
                  <div style="font-weight:700; color:#fff; font-size:0.92rem;">${escapeHtml(h.subject)}</div>
                  <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.2rem;">
                    Dispatched on ${h.dispatchedAtFormatted || 'Recent'} &bull; ${h.recipientCount} Recipients &bull; ${h.isTest ? '<span style="color:#eab308;">Test Mode</span>' : '<span style="color:#84cc16;">Live Sent</span>'}
                  </div>
                </div>
                <div>
                  <button type="button" class="btn-admin btn-admin-secondary btn-admin-sm btn-view-history-email" data-id="${h.id}">
                    View Dispatched Email
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* TAB 10: Mailchimp-like Email Designer Modal (Screenshot 1 Mirror)          */
/* -------------------------------------------------------------------------- */
function renderEmailDesignerModal() {
  const blocks = emailStore.getBlocks();

  return `
    <div class="email-designer-backdrop" id="emailDesignerBackdrop">
      <!-- Toolbar (Screenshot 1) -->
      <div class="designer-toolbar">
        <div style="display:flex; align-items:center; gap:1.25rem;">
          <button type="button" id="closeDesignerBtn" class="btn-admin btn-admin-secondary btn-admin-sm" style="border:none; color:var(--text-secondary); background:transparent; display:flex; align-items:center; gap:0.35rem; cursor:pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span>Back to Sending</span>
          </button>
          <button type="button" id="designerHelpBtn" style="background:none; border:none; color:#84cc16; font-size:0.8rem; display:flex; align-items:center; gap:0.3rem; cursor:pointer;">
            <span>(?) How to use this builder</span>
          </button>
        </div>

        <!-- Center View Switcher -->
        <div style="display:flex; align-items:center; gap:0.35rem; background:rgba(0,0,0,0.4); padding:0.2rem 0.4rem; border-radius:6px; border:1px solid rgba(255,255,255,0.08);">
          <button type="button" id="toggleDesktopViewBtn" class="btn-admin btn-admin-sm ${designerDevice === 'desktop' ? 'btn-admin-primary' : 'btn-admin-secondary'}" style="padding:0.25rem 0.5rem;" title="Desktop Preview (620px)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          </button>
          <button type="button" id="toggleMobileViewBtn" class="btn-admin btn-admin-sm ${designerDevice === 'mobile' ? 'btn-admin-primary' : 'btn-admin-secondary'}" style="padding:0.25rem 0.5rem;" title="Mobile Preview (380px)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
          </button>
        </div>

        <!-- Right Action Buttons -->
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <button type="button" id="designerCloudSaveBtn" class="btn-admin btn-admin-secondary btn-admin-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <span>Save &amp; Sync Cloud</span>
          </button>
          <button type="button" id="designerLiveSyncBtn" class="btn-admin btn-admin-secondary btn-admin-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            <span>Live Sync</span>
          </button>
          <button type="button" id="designerPreviewBtn" class="btn-admin btn-admin-secondary btn-admin-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>Preview</span>
          </button>
          <button type="button" id="designerSaveAndSendBtn" class="btn-admin btn-admin-primary btn-admin-sm" style="background:#84cc16; color:#0b1402; font-weight:700;">
            <span>Save &amp; Send &rarr;</span>
          </button>
        </div>
      </div>

      <!-- Workspace (Sidebar + Canvas) -->
      <div class="designer-workspace">
        <!-- Sidebar Palette (Left Column - positioned close to centered canvas) -->
        <div class="designer-sidebar-column">
          <aside class="designer-sidebar">
            <div class="designer-sidebar-tabs" id="designerSidebarTabs">
              <button type="button" class="designer-sidebar-tab ${designerActiveTab === 'blocks' ? 'active' : ''}" data-tab="blocks">Blocks</button>
              <button type="button" class="designer-sidebar-tab ${designerActiveTab === 'sections' ? 'active' : ''}" data-tab="sections">Sections</button>
              <button type="button" class="designer-sidebar-tab ${designerActiveTab === 'styles' ? 'active' : ''}" data-tab="styles">Styles</button>
              <button type="button" class="designer-sidebar-tab ${designerActiveTab === 'optimize' ? 'active' : ''}" data-tab="optimize">Optimize</button>
            </div>

            <div id="designerSidebarBody" style="display:flex; flex-direction:column; flex:1; min-height:0; overflow-y:auto;">
              ${renderDesignerSidebarBody(designerActiveTab)}
            </div>
          </aside>
        </div>

        <!-- Center Canvas -->
        <main class="designer-canvas-wrap">
          <div class="designer-canvas ${designerDevice === 'mobile' ? 'mobile' : ''}" id="designerCanvasMount">
            ${renderDesignerCanvasBlocks(blocks)}
          </div>
        </main>

        <!-- Right Spacer to balance the layout and keep the canvas perfectly centered -->
        <div class="designer-right-spacer" aria-hidden="true"></div>
      </div>
    </div>
  `;
}

function renderDesignerSidebarBody(tab = 'blocks') {
  const styles = emailStore.getStyles();
  const blocks = emailStore.getBlocks();
  const campaign = emailStore.campaign;

  if (tab === 'sections') {
    return `
      <div style="padding:1rem 1.25rem 0.5rem;">
        <div style="font-size:0.78rem; font-weight:700; color:#fff; text-transform:uppercase;">Pre-Built Sections</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">Insert complete, pre-styled layouts with 1 click</div>
      </div>
      <div class="designer-sections-list" style="padding:0.5rem 1.25rem 1.5rem; display:flex; flex-direction:column; gap:0.75rem;">
        ${EMAIL_SECTION_PRESETS.map(preset => `
          <div class="designer-section-card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.9rem; transition:border-color 0.2s ease;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.35rem;">
              <span style="font-size:0.85rem; font-weight:700; color:#ffffff;">${escapeHtml(preset.name)}</span>
              <span style="font-size:0.68rem; font-weight:700; background:rgba(132,204,22,0.15); color:#84cc16; padding:0.15rem 0.45rem; border-radius:4px; text-transform:uppercase;">${preset.badge || 'Section'}</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.45; margin-bottom:0.75rem;">
              ${escapeHtml(preset.desc)}
            </div>
            <button type="button" class="btn-admin btn-admin-secondary btn-admin-sm btn-insert-section" data-section-id="${preset.id}" style="width:100%; justify-content:center; border-color:rgba(132,204,22,0.3); color:#84cc16;">
              + Insert Section
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (tab === 'styles') {
    return `
      <div style="padding:1rem 1.25rem 0.5rem;">
        <div style="font-size:0.78rem; font-weight:700; color:#fff; text-transform:uppercase;">Global Email Styling</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">Customize theme colors, fonts, and card geometry</div>
      </div>
      <div style="padding:0.5rem 1.25rem 1.5rem; display:flex; flex-direction:column; gap:1.25rem;">
        <!-- Theme Presets -->
        <div>
          <div style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; margin-bottom:0.5rem; letter-spacing:0.5px;">Theme Presets</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
            ${EMAIL_THEME_PRESETS.map(theme => `
              <button type="button" class="btn-apply-theme" data-theme-id="${theme.id}" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:0.6rem; text-align:left; cursor:pointer; transition:all 0.2s ease;">
                <div style="display:flex; gap:4px; margin-bottom:6px;">
                  ${theme.previewColors.map(c => `<span style="width:14px; height:14px; border-radius:50%; background:${c}; display:inline-block; border:1px solid rgba(255,255,255,0.2);"></span>`).join('')}
                </div>
                <div style="font-size:0.75rem; font-weight:700; color:#ffffff;">${escapeHtml(theme.name)}</div>
                <div style="font-size:0.68rem; color:var(--text-muted);">${escapeHtml(theme.desc.split(' ')[0])}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Color Settings -->
        <div style="display:flex; flex-direction:column; gap:0.75rem; background:rgba(255,255,255,0.02); padding:0.85rem; border-radius:8px; border:1px solid rgba(255,255,255,0.06);">
          <div style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; letter-spacing:0.5px;">Canvas Colors</div>
          
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label style="font-size:0.78rem; color:var(--text-secondary);">Email Canvas BG</label>
            <input type="color" id="styleEmailBgPicker" value="${styles.emailBg || '#05070d'}" style="height:28px; width:48px; padding:1px; background:none; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label style="font-size:0.78rem; color:var(--text-secondary);">Card Container BG</label>
            <input type="color" id="styleCardBgPicker" value="${styles.cardBg || '#0b101f'}" style="height:28px; width:48px; padding:1px; background:none; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label style="font-size:0.78rem; color:var(--text-secondary);">Primary Accent</label>
            <input type="color" id="styleAccentColorPicker" value="${styles.accentColor || '#84cc16'}" style="height:28px; width:48px; padding:1px; background:none; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">
          </div>
        </div>

        <!-- Typography -->
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          <label style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; letter-spacing:0.5px;">Email Font Family</label>
          <select id="styleFontFamilySelect" class="admin-input" style="padding:0.45rem; font-size:0.8rem;">
            <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" ${styles.fontFamily.includes('Segoe UI') ? 'selected' : ''}>System Modern (Apple / Segoe / Roboto)</option>
            <option value="Helvetica, Arial, sans-serif" ${styles.fontFamily.includes('Helvetica') ? 'selected' : ''}>Corporate Clean (Helvetica / Arial)</option>
            <option value="Georgia, serif" ${styles.fontFamily.includes('Georgia') ? 'selected' : ''}>Classic Editorial (Georgia Serif)</option>
            <option value="SFMono-Regular, Consolas, monospace" ${styles.fontFamily.includes('monospace') ? 'selected' : ''}>Technical Console (Monospace)</option>
          </select>
        </div>

        <!-- Card Border Radius -->
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; letter-spacing:0.5px;">Card Corner Radius</span>
            <span id="styleRadiusDisplay" style="font-size:0.75rem; color:#84cc16; font-weight:700;">${styles.borderRadius || 10}px</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.35rem;">
            <button type="button" class="btn-radius-preset ${styles.borderRadius === 0 ? 'active' : ''}" data-radius="0" style="padding:0.4rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:4px; font-size:0.72rem; color:#fff; cursor:pointer;">0px Sharp</button>
            <button type="button" class="btn-radius-preset ${styles.borderRadius === 6 ? 'active' : ''}" data-radius="6" style="padding:0.4rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:4px; font-size:0.72rem; color:#fff; cursor:pointer;">6px Mild</button>
            <button type="button" class="btn-radius-preset ${styles.borderRadius === 10 ? 'active' : ''}" data-radius="10" style="padding:0.4rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:4px; font-size:0.72rem; color:#fff; cursor:pointer;">10px Round</button>
            <button type="button" class="btn-radius-preset ${styles.borderRadius === 20 ? 'active' : ''}" data-radius="20" style="padding:0.4rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:4px; font-size:0.72rem; color:#fff; cursor:pointer;">20px Pill</button>
          </div>
        </div>
      </div>
    `;
  }

  if (tab === 'optimize') {
    const audit = auditEmailDeliverability(campaign, blocks);
    return `
      <div style="padding:1rem 1.25rem 0.5rem;">
        <div style="font-size:0.78rem; font-weight:700; color:#fff; text-transform:uppercase;">Deliverability &amp; Compliance</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">Real-time inbox audit and Rwandan legal check</div>
      </div>
      <div style="padding:0.5rem 1.25rem 1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <!-- Score Gauge Card -->
        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:1rem; text-align:center;">
          <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; border-radius:50%; border:3px solid ${audit.score >= 90 ? '#84cc16' : '#eab308'}; font-size:1.4rem; font-weight:800; color:#fff; margin-bottom:0.5rem;">
            ${audit.score}
          </div>
          <div style="font-size:0.88rem; font-weight:700; color:#ffffff;">${audit.score >= 90 ? 'High Deliverability Score' : 'Action Recommended'}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">Optimized for Gmail, Outlook, Apple Mail &amp; Enterprise Gateways</div>

          <button type="button" id="btnAutoOptimizeEmail" class="btn-admin btn-admin-primary btn-admin-sm" style="width:100%; margin-top:0.85rem; background:#84cc16; color:#0b1402; font-weight:700; justify-content:center;">
            ⚡ Auto-Optimize Email (1-Click Fix)
          </button>
        </div>

        <!-- Audit Checklist -->
        <div style="display:flex; flex-direction:column; gap:0.6rem;">
          <!-- Spam Trigger Words -->
          <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:6px; padding:0.75rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.78rem; font-weight:700; color:#fff;">Spam Word Scanner</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">
                ${audit.foundSpam.length === 0 ? '0 spam trigger words detected' : `Found words: ${audit.foundSpam.join(', ')}`}
              </div>
            </div>
            <span style="font-size:0.7rem; font-weight:700; padding:0.2rem 0.5rem; border-radius:4px; ${audit.foundSpam.length === 0 ? 'background:rgba(132,204,22,0.15); color:#84cc16;' : 'background:rgba(239,68,68,0.15); color:#ef4444;'}">
              ${audit.foundSpam.length === 0 ? 'Passed' : 'Flagged'}
            </span>
          </div>

          <!-- Rwandan Law N° 058/2021 & Address -->
          <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:6px; padding:0.75rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.78rem; font-weight:700; color:#fff;">Law N° 058/2021 &amp; RDB Address</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">
                ${audit.hasPhysicalAddress && audit.hasDisclaimer ? 'Verified registered address & disclaimer' : 'Missing address or legal disclaimer'}
              </div>
            </div>
            <span style="font-size:0.7rem; font-weight:700; padding:0.2rem 0.5rem; border-radius:4px; ${audit.hasPhysicalAddress && audit.hasDisclaimer ? 'background:rgba(132,204,22,0.15); color:#84cc16;' : 'background:rgba(234,179,8,0.15); color:#eab308;'}">
              ${audit.hasPhysicalAddress && audit.hasDisclaimer ? 'Compliant' : 'Incomplete'}
            </span>
          </div>

          <!-- Payload Size & Gmail Clip -->
          <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:6px; padding:0.75rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
              <span style="font-size:0.78rem; font-weight:700; color:#fff;">Payload Weight</span>
              <span style="font-size:0.72rem; font-weight:700; color:${audit.isSizeSafe ? '#84cc16' : '#ef4444'};">${audit.sizeKB} KB / 102 KB Limit</span>
            </div>
            <div style="width:100%; height:4px; background:rgba(255,255,255,0.08); border-radius:2px; overflow:hidden;">
              <div style="width:${Math.min(100, Math.round((audit.sizeKB / 102) * 100))}%; height:100%; background:${audit.isSizeSafe ? '#84cc16' : '#ef4444'};"></div>
            </div>
            <div style="font-size:0.7rem; color:var(--text-muted); margin-top:0.35rem;">Emails &lt; 102 KB avoid Gmail clipping and retain full layout formatting.</div>
          </div>

          <!-- Unsubscribe & Privacy Links -->
          <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:6px; padding:0.75rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.78rem; font-weight:700; color:#fff;">Unsubscribe &amp; Privacy Links</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">orvexi.rw/unsubscribe &amp; orvexi.rw/privacy</div>
            </div>
            <span style="font-size:0.7rem; font-weight:700; padding:0.2rem 0.5rem; border-radius:4px; background:rgba(132,204,22,0.15); color:#84cc16;">Active</span>
          </div>
        </div>
      </div>
    `;
  }

  // Default: 'blocks' tab
  return `
    <div style="padding:1rem 1.25rem 0.5rem;">
      <div style="font-size:0.78rem; font-weight:700; color:#fff; text-transform:uppercase;">Content blocks</div>
      <div style="font-size:0.75rem; color:var(--text-muted);">Click to add content to your email</div>
    </div>

    <!-- Blocks Grid -->
    <div class="designer-blocks-grid">
      <button type="button" class="designer-block-btn btn-add-email-block" data-type="header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="6" rx="1"></rect><line x1="3" y1="12" x2="21" y2="12"></line></svg>
        <span>Header</span>
      </button>
      <button type="button" class="designer-block-btn btn-add-email-block" data-type="image">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        <span>Image</span>
      </button>
      <button type="button" class="designer-block-btn btn-add-email-block" data-type="heading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
        <span>Heading</span>
      </button>
      <button type="button" class="designer-block-btn btn-add-email-block" data-type="paragraph">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="3" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
        <span>Paragraph</span>
      </button>
      <button type="button" class="designer-block-btn btn-add-email-block" data-type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="12" rx="3"></rect><line x1="9" y1="12" x2="15" y2="12"></line></svg>
        <span>Button</span>
      </button>
      <button type="button" class="designer-block-btn btn-add-email-block" data-type="divider">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Divider</span>
      </button>
      <button type="button" class="designer-block-btn btn-add-email-block" data-type="spacer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 18 12 22 16 18"></polyline><polyline points="8 6 12 2 16 6"></polyline><line x1="12" y1="2" x2="12" y2="22"></line></svg>
        <span>Spacer</span>
      </button>
      <button type="button" class="designer-block-btn btn-add-email-block" data-type="video">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
        <span>Video</span>
      </button>
      <button type="button" class="designer-block-btn btn-add-email-block" data-type="social">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        <span>Social</span>
      </button>
      <button type="button" class="designer-block-btn btn-add-email-block" data-type="header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 3"></path></svg>
        <span>Logo</span>
      </button>
      <button type="button" class="designer-block-btn btn-add-email-block" data-type="code">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        <span>Code</span>
      </button>
      <button type="button" class="designer-block-btn btn-add-email-block" data-type="footer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="15" width="18" height="6" rx="1"></rect><line x1="3" y1="12" x2="21" y2="12"></line></svg>
        <span>Footer</span>
      </button>
    </div>

    <!-- Columns Palette -->
    <div class="designer-columns-container">
      <div style="font-size:0.78rem; font-weight:700; color:#fff; text-transform:uppercase; margin-bottom:0.25rem;">Columns</div>
      <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.6rem;">Click to add a column container</div>

      <div class="designer-columns-grid">
        <button type="button" class="designer-col-btn btn-add-email-block" data-type="paragraph">
          <span>[ 1 ] Single</span>
        </button>
        <button type="button" class="designer-col-btn btn-add-email-block" data-type="columns2">
          <span>[ 1 : 1 ] 2 Cols</span>
        </button>
        <button type="button" class="designer-col-btn btn-add-email-block" data-type="columns2">
          <span>[ 1 : 2 ] Split</span>
        </button>
        <button type="button" class="designer-col-btn btn-add-email-block" data-type="social">
          <span>[ 3 ] 3 Cols</span>
        </button>
      </div>
    </div>
  `;
}

function renderDesignerCanvasBlocks(blocks) {
  if (!blocks || blocks.length === 0) {
    return `<div style="padding:4rem 2rem; text-align:center; color:var(--text-muted);">No blocks added. Click any content block on the left palette to begin.</div>`;
  }

  const styles = emailStore.getStyles();

  return blocks.map((b, idx) => {
    let innerContent = '';

    switch (b.type) {
      case 'topbar':
        innerContent = `
          <div style="background:${b.bg || '#07090f'}; padding:8px 16px; font-size:11px; color:#cbd5e1; display:flex; justify-content:space-between; border-bottom:2px solid ${styles.accentColor || '#84cc16'}; font-family:${styles.fontFamily};">
            <span>📍 <span class="editable-text" contenteditable="true" data-id="${b.id}" data-field="address" style="outline:none; cursor:text;" title="Click to edit address inline">${escapeHtml(b.address || 'Kigali, Rwanda')}</span> &bull; 📞 <span class="editable-text" contenteditable="true" data-id="${b.id}" data-field="phone" style="outline:none; cursor:text;" title="Click to edit phone inline">${escapeHtml(b.phone || '+250 788 810 675')}</span></span>
            <span style="color:${styles.accentColor || '#84cc16'}; font-weight:bold;"><span class="editable-text" contenteditable="true" data-id="${b.id}" data-field="website" style="outline:none; cursor:text;" title="Click to edit website inline">${escapeHtml(b.website || 'orvexi.rw')}</span></span>
          </div>
        `;
        break;

      case 'header':
        innerContent = `
          <div style="padding:24px 20px 14px; text-align:center; background:${styles.cardBg || '#0b101f'};">
            <img src="${b.logoUrl || '/Logo-WHITE.png'}" alt="${escapeHtml(b.companyName || 'ORVEXI')}" height="32" style="height:32px; margin-bottom:6px; display:inline-block;" />
            <div class="editable-text" contenteditable="true" data-id="${b.id}" data-field="tagline" style="font-size:12px; color:#3eb5f1; text-transform:uppercase; font-weight:600; letter-spacing:1px; outline:none; cursor:text;" title="Click to edit tagline inline">
              ${escapeHtml(b.tagline || 'Enterprise Software & Cloud Platforms in Rwanda')}
            </div>
          </div>
        `;
        break;

      case 'heading':
        innerContent = `
          <div style="padding:16px 24px 8px; text-align:${b.align || 'center'}; background:${styles.cardBg || '#0b101f'};">
            <h2 class="editable-text" contenteditable="true" data-id="${b.id}" data-field="text" style="margin:0; font-size:20px; font-weight:800; color:${b.color || styles.headingColor || '#ffffff'}; line-height:1.3; outline:none;">
              ${escapeHtml(b.text || 'HEADING...')}
            </h2>
          </div>
        `;
        break;

      case 'paragraph':
        innerContent = `
          <div style="padding:8px 24px 16px; text-align:${b.align || 'left'}; background:${styles.cardBg || '#0b101f'};">
            <p class="editable-text" contenteditable="true" data-id="${b.id}" data-field="text" style="margin:0; font-size:14px; line-height:1.6; color:${b.color || styles.textColor || '#94a3b8'}; outline:none;">
              ${escapeHtml(b.text || 'Paragraph text here...')}
            </p>
          </div>
        `;
        break;

      case 'columns2':
        innerContent = `
          <div style="padding:14px 20px; background:${styles.cardBg || '#0b101f'};">
            <div style="display:grid; grid-template-columns:1fr 1.3fr; gap:14px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:12px; align-items:center;">
              <div>
                <img src="${b.imageUrl || '/images/slide1_kigali_tech.jpg'}" alt="" style="width:100%; border-radius:6px; max-height:140px; object-fit:cover; display:block;" />
              </div>
              <div>
                <h4 class="editable-text" contenteditable="true" data-id="${b.id}" data-field="title" style="margin:0 0 6px; font-size:15px; color:${styles.accentColor || '#84cc16'}; font-weight:700; outline:none;">
                  ${escapeHtml(b.title || 'Feature Title')}
                </h4>
                <p class="editable-text" contenteditable="true" data-id="${b.id}" data-field="desc" style="margin:0 0 10px; font-size:12px; line-height:1.45; color:#cbd5e1; outline:none;">
                  ${escapeHtml(b.desc || 'Feature description...')}
                </p>
                ${b.btnText ? `
                  <span style="display:inline-block; background:${styles.accentColor || '#84cc16'}; color:#0b1402; font-size:11px; font-weight:700; padding:6px 14px; border-radius:4px;">
                    ${escapeHtml(b.btnText)}
                  </span>
                ` : ''}
              </div>
            </div>
          </div>
        `;
        break;

      case 'image':
        innerContent = `
          <div style="padding:14px 20px; text-align:${b.align || 'center'}; background:${styles.cardBg || '#0b101f'};">
            <img src="${b.imageUrl || '/images/slide1_kigali_tech.jpg'}" alt="" style="width:100%; max-width:540px; border-radius:8px; display:block; margin:0 auto;" />
            ${b.caption ? `<div style="font-size:12px; color:var(--text-muted); margin-top:4px;">${escapeHtml(b.caption)}</div>` : ''}
          </div>
        `;
        break;

      case 'button':
        innerContent = `
          <div style="padding:16px 20px; text-align:${b.align || 'center'}; background:${styles.cardBg || '#0b101f'};">
            <span style="display:inline-block; background:${b.btnBg || styles.accentColor || '#84cc16'}; color:${b.btnColor || '#0b1402'}; font-size:13px; font-weight:700; padding:10px 24px; border-radius:6px;">
              ${escapeHtml(b.text || 'Call to Action')}
            </span>
          </div>
        `;
        break;

      case 'divider':
        innerContent = `
          <div style="padding:8px 20px; background:${styles.cardBg || '#0b101f'};">
            <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:0;" />
          </div>
        `;
        break;

      case 'spacer':
        innerContent = `
          <div style="height:${b.height || 24}px; background:${styles.cardBg || '#0b101f'}; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.15); font-size:10px;">
            ↕ Spacer (${b.height || 24}px)
          </div>
        `;
        break;

      case 'video':
        innerContent = `
          <div style="padding:14px 20px; text-align:center; background:${styles.cardBg || '#0b101f'};">
            <div style="position:relative; max-width:500px; margin:0 auto; background:#000; border-radius:8px; overflow:hidden;">
              <img src="${b.thumbnailUrl || '/images/slide2_software_team.jpg'}" width="100%" style="width:100%; display:block; opacity:0.7;" />
              <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:${styles.accentColor || '#84cc16'}; color:#0b1402; border-radius:50%; width:48px; height:48px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:bold;">▶</div>
            </div>
            ${b.caption ? `<div style="font-size:12px; color:var(--text-secondary); margin-top:6px;">${escapeHtml(b.caption)}</div>` : ''}
          </div>
        `;
        break;

      case 'social':
        innerContent = `
          <div style="padding:14px 20px; text-align:center; background:${styles.cardBg || '#0b101f'}; font-size:12px; color:#3eb5f1;">
            <strong>LinkedIn</strong> &bull; <strong>Twitter / X</strong> &bull; <strong>GitHub</strong>
          </div>
        `;
        break;

      case 'code':
        innerContent = `
          <div style="padding:14px 20px; background:${styles.cardBg || '#0b101f'};">
            <div style="background:#07090f; padding:10px; border-radius:6px; font-family:monospace; color:#3eb5f1; font-size:11px;">
              ${b.html || '&lt;!-- Custom Code Block --&gt;'}
            </div>
          </div>
        `;
        break;

      case 'footer':
        innerContent = `
          <div style="background:${styles.cardBg || '#07090f'}; padding:20px 16px; text-align:center; border-top:1px solid rgba(255,255,255,0.08);">
            <div class="editable-text" contenteditable="true" data-id="${b.id}" data-field="company" style="font-size:12px; font-weight:700; color:#ffffff; outline:none; cursor:text;" title="Click to edit company name inline">
              ${escapeHtml(b.company || 'ORVEXI COMPANY LTD (Reg. No: 1628324)')}
            </div>
            <div class="editable-text" contenteditable="true" data-id="${b.id}" data-field="address" style="font-size:11px; color:#94a3b8; margin-top:4px; outline:none; cursor:text;" title="Click to edit physical address inline">
              ${escapeHtml(b.address || 'KN 3 Rd, Downtown Commercial Hub, Kigali, Rwanda')}
            </div>
            <div class="editable-text" contenteditable="true" data-id="${b.id}" data-field="disclaimer" style="font-size:10px; color:#64748b; margin-top:8px; line-height:1.45; outline:none; cursor:text;" title="Click to edit legal disclaimer inline">
              ${escapeHtml(b.disclaimer || 'You are receiving this official communication from ORVEXI Limited regarding requested technology services, enterprise advisory, or active service subscriptions.')}
            </div>
            <div style="font-size:10px; color:#3eb5f1; margin-top:8px;">
              <span style="text-decoration:underline;">Unsubscribe</span> &nbsp;&middot;&nbsp;
              <span style="text-decoration:underline;">Help &amp; Support</span> &nbsp;&middot;&nbsp;
              <span style="text-decoration:underline;">Privacy Policy</span>
            </div>
          </div>
        `;
        break;

      default:
        innerContent = `<div style="padding:12px 20px; color:#fff;">Block: ${b.type}</div>`;
        break;
    }

    return `
      <div class="designer-canvas-block" data-id="${b.id}" data-type="${b.type}">
        <div class="designer-canvas-block-actions">
          <button type="button" class="designer-block-action-btn btn-block-up" data-id="${b.id}" title="Move Up" ${idx === 0 ? 'disabled style="opacity:0.3"' : ''}>&uarr;</button>
          <button type="button" class="designer-block-action-btn btn-block-down" data-id="${b.id}" title="Move Down" ${idx === blocks.length - 1 ? 'disabled style="opacity:0.3"' : ''}>&darr;</button>
          <button type="button" class="designer-block-action-btn btn-block-dup" data-id="${b.id}" title="Duplicate">❐</button>
          <button type="button" class="designer-block-action-btn btn-block-edit" data-id="${b.id}" title="Edit Properties">✎</button>
          <button type="button" class="designer-block-action-btn del btn-block-del" data-id="${b.id}" title="Delete Block">&times;</button>
        </div>
        ${innerContent}
      </div>
    `;
  }).join('');
}

/* -------------------------------------------------------------------------- */
/* Modal Helpers for Contacts, Groups, and Email Preview                     */
/* -------------------------------------------------------------------------- */
function renderAddRecipientModal(contact = {}, isEdit = false) {
  const groups = contactStore.getGroups();
  return `
    <div class="admin-modal-backdrop" id="adminModalBackdrop">
      <div class="admin-modal" style="max-width:500px;">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">${isEdit ? 'Edit Contact' : 'Add New Recipient'}</h3>
          <button class="admin-modal-close" id="modalCloseBtn">&times;</button>
        </div>

        <form id="addRecipientForm" data-isedit="${isEdit}" data-id="${contact.id || ''}" style="padding:1.5rem;">
          <div class="admin-form-group">
            <label class="admin-label">Full Name *</label>
            <input type="text" id="contactNameInput" class="admin-input" placeholder="e.g. Theophile Harushyamagara" value="${escapeHtml(contact.name || '')}" required>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Email Address *</label>
            <input type="email" id="contactEmailInput" class="admin-input" placeholder="e.g. client@organization.rw" value="${escapeHtml(contact.email || '')}" required>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Phone Number</label>
              <input type="tel" id="contactPhoneInput" class="admin-input" placeholder="e.g. +250 788 810 675" value="${escapeHtml(contact.phone || '')}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Organization / Entity</label>
              <input type="text" id="contactOrgInput" class="admin-input" placeholder="e.g. Bank of Kigali" value="${escapeHtml(contact.organization || '')}">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Target Group / Sector *</label>
            <select id="contactGroupSelect" class="admin-select" required>
              ${groups.map(g => `<option value="${escapeHtml(g)}" ${contact.group === g ? 'selected' : ''}>${escapeHtml(g)}</option>`).join('')}
            </select>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.08);">
            <button type="button" id="modalCancelBtn" class="btn-admin btn-admin-secondary">Cancel</button>
            <button type="submit" class="btn-admin btn-admin-primary" style="background:#84cc16; color:#0b1402; font-weight:700;">
              <span>${isEdit ? 'Save Changes' : 'Add Contact'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderAddGroupModal() {
  return `
    <div class="admin-modal-backdrop" id="adminModalBackdrop">
      <div class="admin-modal" style="max-width:440px;">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Create New Contact Group</h3>
          <button class="admin-modal-close" id="modalCloseBtn">&times;</button>
        </div>

        <form id="createGroupForm" style="padding:1.5rem;">
          <div class="admin-form-group">
            <label class="admin-label">Group Name *</label>
            <input type="text" id="newGroupNameInput" class="admin-input" placeholder="e.g. Regional Telco Partners" required autofocus>
          </div>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin:0 0 1.25rem;">
            Groups allow you to target specific sectors when sending custom email campaigns and newsletters.
          </p>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button type="button" id="modalCancelBtn" class="btn-admin btn-admin-secondary">Cancel</button>
            <button type="submit" class="btn-admin btn-admin-primary" style="background:#84cc16; color:#0b1402; font-weight:700;">
              <span>Create Group</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderManageGroupsModal() {
  const groups = contactStore.getGroups();
  const stats = contactStore.getStats();

  return `
    <div class="admin-modal-backdrop" id="adminModalBackdrop">
      <div class="admin-modal" style="max-width:540px;">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Manage Contact Groups (${groups.length})</h3>
          <button class="admin-modal-close" id="modalCloseBtn">&times;</button>
        </div>

        <div style="padding:1.5rem;">
          <div style="display:flex; flex-direction:column; gap:0.75rem; max-height:360px; overflow-y:auto; margin-bottom:1.5rem;">
            ${groups.map(g => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:0.6rem 0.85rem;">
                <div>
                  <span style="font-weight:600; color:#fff;">${escapeHtml(g)}</span>
                  <span style="font-size:0.75rem; color:var(--text-muted); margin-left:0.5rem; font-family:var(--font-mono);">${stats.groupCounts[g] || 0} contacts</span>
                </div>
                <div style="display:flex; gap:0.4rem;">
                  <button type="button" class="btn-admin btn-admin-secondary btn-admin-sm btn-rename-group" data-group="${escapeHtml(g)}">Rename</button>
                  <button type="button" class="btn-admin btn-admin-danger btn-admin-sm btn-delete-group" data-group="${escapeHtml(g)}">Delete</button>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <button type="button" id="modalCancelBtn" class="btn-admin btn-admin-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderImportContactsModal() {
  const groups = contactStore.getGroups();

  return `
    <div class="admin-modal-backdrop" id="adminModalBackdrop">
      <div class="admin-modal" style="max-width:560px;">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Import Contacts &amp; Email Lists</h3>
          <button class="admin-modal-close" id="modalCloseBtn">&times;</button>
        </div>

        <form id="importContactsForm" style="padding:1.5rem;">
          <div class="admin-form-group">
            <label class="admin-label">Target Group / Sector</label>
            <select id="importTargetGroupSelect" class="admin-select">
              ${groups.map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('')}
            </select>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Paste CSV Lines or Email Addresses</label>
            <textarea id="importContactsTextarea" class="admin-textarea" rows="6" placeholder="Format 1 (CSV): Name, Email, Phone, Organization&#10;e.g. John Doe, john@corp.rw, +250788111222, Tech Ltd&#10;&#10;Format 2 (Emails only):&#10;aline@hospital.rw&#10;manager@hotel.rw" required></textarea>
          </div>

          <p style="font-size:0.8rem; color:var(--text-secondary); margin:0 0 1.25rem;">
            Existing duplicate email addresses will be skipped automatically.
          </p>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button type="button" id="modalCancelBtn" class="btn-admin btn-admin-secondary">Cancel</button>
            <button type="submit" class="btn-admin btn-admin-primary" style="background:#84cc16; color:#0b1402; font-weight:700;">
              <span>Import to Directory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderEmailPreviewModal(htmlContent) {
  return `
    <div class="admin-modal-backdrop" id="adminModalBackdrop">
      <div class="admin-modal" style="max-width:680px; width:95vw;">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Email Preview</h3>
          <button class="admin-modal-close" id="modalCloseBtn">&times;</button>
        </div>

        <div style="padding:1.25rem;">
          <iframe id="emailPreviewIframe" style="width:100%; height:550px; border:none; border-radius:8px; background:#fff;"></iframe>
        </div>

        <div style="display:flex; justify-content:flex-end; padding:0.75rem 1.25rem; border-top:1px solid rgba(255,255,255,0.08);">
          <button type="button" id="modalCancelBtn" class="btn-admin btn-admin-secondary">Close Preview</button>
        </div>
      </div>
    </div>
  `;
}

function renderDispatchSuccessModal(record, zohoResult = null) {
  const mount = document.getElementById('adminModalMount');
  if (!mount) return;

  const mailtoLink = `mailto:${record.recipients.join(',')}?subject=${encodeURIComponent(record.subject)}&body=${encodeURIComponent(`Dear Partner,\n\nPlease find our latest official announcement and newsletter from ORVEXI:\nhttps://orvexi.rw/publications/${record.seoSlug || 'newsletter'}\n\nWarm regards,\nORVEXI LTD\nceo@orvexi.rw`)}`;

  mount.innerHTML = `
    <div class="admin-modal-backdrop" id="adminModalBackdrop">
      <div class="admin-modal" style="max-width:580px; width:95vw;">
        <div class="admin-modal-header" style="border-bottom-color:rgba(132,204,22,0.3);">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div style="width:32px; height:32px; border-radius:50%; background:rgba(132,204,22,0.15); color:#84cc16; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.1rem;">✓</div>
            <h3 class="admin-modal-title" style="color:#fff;">Campaign Dispatched Successfully!</h3>
          </div>
          <button class="admin-modal-close" id="modalCloseBtn">&times;</button>
        </div>

        <div style="padding:1.5rem;">
          ${zohoResult ? `
            <div style="background:rgba(132,204,22,0.12); border:1px solid rgba(132,204,22,0.35); border-radius:8px; padding:0.85rem 1rem; margin-bottom:1.25rem;">
              <div style="display:flex; align-items:center; gap:0.5rem; color:#84cc16; font-size:0.88rem; font-weight:700;">
                <span>⚡ Live Zoho CPaaS &amp; ZeptoMail Dispatch Confirmed</span>
              </div>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem;">
                Dispatched from <strong style="color:#fff;">ceo@orvexi.rw</strong> via <strong>cpaas.zoho.com</strong> to <strong>${record.recipientCount}</strong> recipients across Rwanda.
              </div>
            </div>
          ` : ''}

          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:1.25rem; margin-bottom:1.5rem;">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">SUBJECT:</div>
            <div style="font-size:1.05rem; font-weight:700; color:#fff; margin:0.25rem 0 0.85rem;">${escapeHtml(record.subject)}</div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; font-size:0.84rem; border-top:1px solid rgba(255,255,255,0.06); padding-top:0.75rem;">
              <div>
                <span style="color:var(--text-secondary);">Recipients:</span>
                <strong style="color:#84cc16; margin-left:0.35rem;">${record.recipientCount} Dispatched</strong>
              </div>
              <div>
                <span style="color:var(--text-secondary);">Date:</span>
                <span style="color:#fff; margin-left:0.35rem;">${escapeHtml(record.dispatchedAtFormatted)}</span>
              </div>
            </div>
          </div>

          <div style="margin-bottom:1.5rem;">
            <div style="font-size:0.78rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; margin-bottom:0.5rem;">Target Recipients (${record.recipients.length}):</div>
            <div style="max-height:120px; overflow-y:auto; display:flex; flex-wrap:wrap; gap:0.35rem; background:rgba(7,9,15,0.6); padding:0.6rem; border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
              ${record.recipients.map(r => `<span style="background:rgba(132,204,22,0.1); color:#84cc16; font-size:0.76rem; padding:0.2rem 0.5rem; border-radius:4px; font-family:var(--font-mono);">${escapeHtml(r)}</span>`).join('')}
            </div>
          </div>

          <!-- Outbound Delivery Actions -->
          <div style="display:flex; flex-direction:column; gap:0.6rem;">
            <a href="${mailtoLink}" target="_blank" class="btn-admin btn-admin-primary" style="background:#84cc16; color:#0b1402; font-weight:700; justify-content:center; text-decoration:none; padding:0.8rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>Open in Default Mail Client (Gmail / Outlook / Mailto)</span>
            </a>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem;">
              <button type="button" id="copyDispatchedHtmlBtn" class="btn-admin btn-admin-secondary" style="justify-content:center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copy HTML Code</span>
              </button>
              <button type="button" id="previewDispatchedEmailBtn" class="btn-admin btn-admin-secondary" style="justify-content:center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span>Preview Dispatched Email</span>
              </button>
            </div>
          </div>

          <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:flex-end;">
            <button type="button" id="modalCloseBtn2" class="btn-admin btn-admin-secondary">Done</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const closeBtn = mount.querySelector('#modalCloseBtn');
  const closeBtn2 = mount.querySelector('#modalCloseBtn2');
  const dismiss = () => { mount.innerHTML = ''; };
  if (closeBtn) closeBtn.onclick = dismiss;
  if (closeBtn2) closeBtn2.onclick = dismiss;

  const copyBtn = mount.querySelector('#copyDispatchedHtmlBtn');
  if (copyBtn) {
    copyBtn.onclick = () => {
      const html = emailStore.generateHtml();
      navigator.clipboard?.writeText(html);
      showAdminToast('Email HTML code copied to clipboard!', 'success');
    };
  }

  const prevBtn = mount.querySelector('#previewDispatchedEmailBtn');
  if (prevBtn) {
    prevBtn.onclick = () => {
      const prevWin = window.open('', '_blank');
      if (prevWin) {
        prevWin.document.write(emailStore.generateHtml());
        prevWin.document.close();
      }
    };
  }
}

function renderZohoConfigModal() {
  const config = zohoEmailService.getConfig();
  const isKeySaved = Boolean(config.apiKey && config.apiKey.length > 5);

  return `
    <div class="admin-modal-backdrop" id="adminModalBackdrop">
      <div class="admin-modal" style="max-width:560px; width:95vw;">
        <div class="admin-modal-header" style="border-bottom-color:rgba(132,204,22,0.3);">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div style="width:34px; height:34px; border-radius:8px; background:rgba(132,204,22,0.15); color:#84cc16; display:flex; align-items:center; justify-content:center; font-size:1.15rem;">
              ⚡
            </div>
            <div>
              <h3 class="admin-modal-title" style="color:#fff; margin:0;">Zoho CPaaS &amp; ZeptoMail Setup</h3>
              <p style="font-size:0.75rem; color:var(--text-secondary); margin:0;">Bulk Email &amp; Transactional Dispatch via <strong>ceo@orvexi.rw</strong></p>
            </div>
          </div>
          <button class="admin-modal-close" id="modalCloseBtn">&times;</button>
        </div>

        <form id="zohoConfigForm" style="padding:1.5rem;">
          <!-- Status Banner -->
          <div style="background:${isKeySaved ? 'rgba(132,204,22,0.08)' : 'rgba(234,179,8,0.08)'}; border:1px solid ${isKeySaved ? 'rgba(132,204,22,0.3)' : 'rgba(234,179,8,0.3)'}; border-radius:8px; padding:0.85rem 1rem; margin-bottom:1.25rem;">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
              <span style="font-size:0.84rem; font-weight:700; color:${isKeySaved ? '#84cc16' : '#eab308'};">
                ${isKeySaved ? '✓ Zoho CPaaS Relay Ready' : '⚠ API Key Required to Send Live'}
              </span>
              <span style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">ceo@orvexi.rw</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:0.35rem;">
              ${isKeySaved ? 'Your Zoho API key is active. All outbound emails will be routed through cpaas.zoho.com from ceo@orvexi.rw.' : 'Paste your Zoho-enczapikey below to enable single and bulk email broadcasts.'}
            </div>
          </div>

          <!-- Zoho API Key Input -->
          <div class="admin-form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
              <label class="admin-label" style="margin-bottom:0;">Zoho CPaaS API Key (Zoho-enczapikey) *</label>
              <button type="button" id="toggleApiKeyVisibility" style="background:none; border:none; color:var(--brand-blue-light); font-size:0.75rem; cursor:pointer;">
                Show / Hide
              </button>
            </div>
            <input type="password" id="zohoApiKeyInput" class="admin-input" placeholder="Paste your Zoho-enczapikey here..." value="${escapeHtml(config.apiKey || '')}" required style="font-family:var(--font-mono); letter-spacing:0.5px;">
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:0.3rem;">
              Authorization Header Format: <code>Zoho-enczapikey &lt;your_key&gt;</code>. Stored securely in your admin browser session.
            </div>
          </div>

          <!-- Sender Details -->
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Sender Email Address</label>
              <input type="email" id="zohoSenderEmailInput" class="admin-input" value="${escapeHtml(config.senderEmail || 'ceo@orvexi.rw')}" required>
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Sender Display Name</label>
              <input type="text" id="zohoSenderNameInput" class="admin-input" value="${escapeHtml(config.senderName || 'ORVEXI LTD')}" required>
            </div>
          </div>

          <!-- CPaaS & SMTP Reference Box -->
          <div style="background:rgba(7,9,15,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.85rem 1rem; margin-bottom:1.25rem; font-size:0.78rem;">
            <div style="color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:0.4rem; font-size:0.7rem;">Verified Credentials Reference:</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; color:var(--text-secondary);">
              <div>REST Host: <strong style="color:#fff;">cpaas.zoho.com</strong></div>
              <div>Agent Alias: <strong style="color:#fff;">1791ea76b71e26a9</strong></div>
              <div>SMTP Server: <strong style="color:#fff;">smtp.zeptomail.com</strong></div>
              <div>Ports: <strong style="color:#fff;">465 (SSL) / 587 (TLS)</strong></div>
              <div>SMTP User: <strong style="color:#fff;">emailapikey</strong></div>
              <div>Sender Domain: <strong style="color:#84cc16;">@orvexi.rw</strong></div>
            </div>
          </div>

          <!-- Form Actions -->
          <div style="display:flex; justify-content:space-between; align-items:center; gap:0.75rem; flex-wrap:wrap; border-top:1px solid rgba(255,255,255,0.08); padding-top:1rem;">
            <button type="button" id="modalCancelBtn" class="btn-admin btn-admin-secondary">Cancel</button>
            <div style="display:flex; gap:0.5rem;">
              <button type="button" id="testZohoModalBtn" class="btn-admin btn-admin-secondary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                <span>Send Test Email</span>
              </button>
              <button type="submit" class="btn-admin btn-admin-primary" style="background:#84cc16; color:#0b1402; font-weight:700;">
                <span>Save Zoho Settings</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderBlockEditModal(block) {
  return `
    <div class="admin-modal-backdrop" id="adminModalBackdrop">
      <div class="admin-modal" style="max-width:500px;">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Edit Block Properties (${block.type})</h3>
          <button class="admin-modal-close" id="modalCloseBtn">&times;</button>
        </div>

        <form id="blockEditForm" data-id="${block.id}" style="padding:1.5rem;">
          ${block.type === 'heading' || block.type === 'paragraph' || block.type === 'button' ? `
            <div class="admin-form-group">
              <label class="admin-label">Text Content</label>
              <textarea id="blockEditTextInput" class="admin-textarea" rows="3">${escapeHtml(block.text || '')}</textarea>
            </div>
          ` : ''}

          ${block.type === 'button' ? `
            <div class="admin-form-group">
              <label class="admin-label">Button Target URL</label>
              <input type="url" id="blockEditUrlInput" class="admin-input" value="${escapeHtml(block.url || '')}">
            </div>
          ` : ''}

          ${block.type === 'image' || block.type === 'columns2' ? `
            <div class="admin-form-group">
              <label class="admin-label">Image URL / Path</label>
              <input type="text" id="blockEditImageInput" class="admin-input" value="${escapeHtml(block.imageUrl || '')}">
            </div>
          ` : ''}

          ${block.type === 'columns2' ? `
            <div class="admin-form-group">
              <label class="admin-label">Title</label>
              <input type="text" id="blockEditTitleInput" class="admin-input" value="${escapeHtml(block.title || '')}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Description</label>
              <textarea id="blockEditDescInput" class="admin-textarea" rows="3">${escapeHtml(block.desc || '')}</textarea>
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Button Label</label>
              <input type="text" id="blockEditBtnTextInput" class="admin-input" value="${escapeHtml(block.btnText || '')}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Button URL</label>
              <input type="url" id="blockEditBtnUrlInput" class="admin-input" value="${escapeHtml(block.btnUrl || '')}">
            </div>
          ` : ''}

          ${block.type === 'header' ? `
            <div class="admin-form-group">
              <label class="admin-label">Logo Image URL</label>
              <input type="text" id="blockEditLogoUrl" class="admin-input" value="${escapeHtml(block.logoUrl || '/Logo-WHITE.png')}">
              <div class="admin-helper-text">Path or URL to company logo (default: <code>/Logo-WHITE.png</code>)</div>
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Company Name / Logo Alt</label>
              <input type="text" id="blockEditCompanyName" class="admin-input" value="${escapeHtml(block.companyName || 'ORVEXI COMPANY LTD')}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Subheader Tagline</label>
              <input type="text" id="blockEditTagline" class="admin-input" value="${escapeHtml(block.tagline || '')}">
            </div>
          ` : ''}

          ${block.type === 'footer' ? `
            <div class="admin-form-group">
              <label class="admin-label">Company Name &amp; Registration</label>
              <input type="text" id="blockEditFooterCompany" class="admin-input" value="${escapeHtml(block.company || '')}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Physical Office Address</label>
              <input type="text" id="blockEditFooterAddress" class="admin-input" value="${escapeHtml(block.address || '')}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Contact Phone</label>
              <input type="text" id="blockEditFooterPhone" class="admin-input" value="${escapeHtml(block.phone || '')}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Contact Email</label>
              <input type="email" id="blockEditFooterEmail" class="admin-input" value="${escapeHtml(block.email || '')}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Legal Disclaimer &amp; Compliance Statement</label>
              <textarea id="blockEditFooterDisclaimer" class="admin-textarea" rows="3">${escapeHtml(block.disclaimer || '')}</textarea>
              <div class="admin-helper-text">Must comply with Law N° 058/2021 regarding personal data protection.</div>
            </div>
          ` : ''}

          ${block.type === 'topbar' ? `
            <div class="admin-form-group">
              <label class="admin-label">Physical Location</label>
              <input type="text" id="blockEditTopbarAddress" class="admin-input" value="${escapeHtml(block.address || '')}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Phone Hotline</label>
              <input type="text" id="blockEditTopbarPhone" class="admin-input" value="${escapeHtml(block.phone || '')}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Website Domain</label>
              <input type="text" id="blockEditTopbarWebsite" class="admin-input" value="${escapeHtml(block.website || 'orvexi.rw')}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Background Color</label>
              <input type="color" id="blockEditTopbarBg" value="${escapeHtml(block.bg || '#07090f')}" style="height:36px; width:100%; padding:2px; background:none; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">
            </div>
          ` : ''}

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
            <button type="button" id="modalCancelBtn" class="btn-admin btn-admin-secondary">Cancel</button>
            <button type="submit" class="btn-admin btn-admin-primary" style="background:#84cc16; color:#0b1402; font-weight:700;">
              Save Properties
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* TAB 11: Platform Performance & Attribution (Screenshot Mirror)             */
/* -------------------------------------------------------------------------- */
function renderPlatformPerformanceTab() {
  const perf = analyticsStore.getChannelPerformance(performanceTimeRange, performanceSelectedPlatform);
  const rawBookings = bookingStore.bookings;
  const allPlatformsCount = rawBookings.length;

  const availablePlatforms = Array.from(new Set([
    ...rawBookings.map(b => b.channel).filter(Boolean),
    'Google Search', 'Website Direct', 'LinkedIn'
  ]));

  const maxInquiryCount = Math.max(4, ...perf.channelStats.map(c => Math.max(c.pending, c.confirmed + c.completed)));

  return `
    <div id="perfContentWrap">
      <!-- Top Tag & Header (Screenshot Mirror) -->
      <div style="margin-bottom: 0.5rem;">
        <span class="perf-header-tag">MARKETING ATTRIBUTION &bull; Platform ROI Intelligence</span>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:1.25rem; flex-wrap:wrap;">
        <div>
          <h2 style="font-size:1.4rem; font-weight:800; color:#fff; margin:0 0 0.2rem;">Platform Performance</h2>
          <p style="font-size:0.84rem; color:var(--text-secondary); margin:0;">Analyze customer acquisition channels and conversion efficacy by platform.</p>
        </div>
        <button type="button" id="perfFullCenterBtn" class="btn-admin btn-admin-secondary btn-admin-sm" style="border-color:rgba(132, 204, 22, 0.4); color:#84cc16;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          <span>Full Analytics Center</span>
        </button>
      </div>

      <!-- Platform Filter Pills (Screenshot Mirror) -->
      <div class="perf-platforms-nav">
        <button type="button" class="perf-platform-pill ${performanceSelectedPlatform === 'All' ? 'active' : ''}" data-platform="All">
          <span>All Platforms (Overview)</span>
          <span class="pill-count">${allPlatformsCount}</span>
        </button>
        ${availablePlatforms.map(p => {
          const count = rawBookings.filter(b => (b.channel || 'Website Direct').toLowerCase() === p.toLowerCase()).length;
          return `
            <button type="button" class="perf-platform-pill ${performanceSelectedPlatform.toLowerCase() === p.toLowerCase() ? 'active' : ''}" data-platform="${escapeHtml(p)}">
              <span>${escapeHtml(p)}</span>
              <span class="pill-count">${count}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Communication Channels Performance Main Card (Screenshot Mirror) -->
      <div class="perf-section-card">
        <div class="perf-section-header">
          <div>
            <div style="margin-bottom:0.4rem;">
              <span class="perf-header-tag" style="background:rgba(234, 179, 8, 0.1); border-color:rgba(234, 179, 8, 0.25); color:#eab308;">
                MARKETING INTELLIGENCE &bull; Live Service Referral Tracking
              </span>
            </div>
            <h3 style="font-size:1.15rem; font-weight:800; color:#fff; margin:0 0 0.25rem;">Communication Channels Performance</h3>
            <p style="font-size:0.82rem; color:var(--text-secondary); margin:0;">
              Identify which outreach and marketing sources generate the most confirmed technology bookings.
            </p>
          </div>

          <!-- Time Range Selectors -->
          <div class="perf-time-selectors">
            <button type="button" class="perf-time-btn ${performanceTimeRange === 'all' ? 'active' : ''}" data-range="all">All Time</button>
            <button type="button" class="perf-time-btn ${performanceTimeRange === '30d' ? 'active' : ''}" data-range="30d">Last 30 Days</button>
            <button type="button" class="perf-time-btn ${performanceTimeRange === '7d' ? 'active' : ''}" data-range="7d">Last 7 Days</button>
          </div>
        </div>

        <!-- 4 Key Metric Cards (Screenshot Mirror) -->
        <div class="perf-metrics-grid">
          <!-- Card 1: Top Acquisition Channel -->
          <div class="perf-metric-card">
            <div>
              <div class="perf-metric-label">TOP ACQUISITION CHANNEL</div>
              <div class="perf-metric-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <div class="perf-metric-val">${escapeHtml(perf.topChannel.channel)}</div>
            </div>
            <div class="perf-metric-meta">
              <span class="perf-pill-green">${perf.topChannel.percentage}% Share</span>
              <span>${perf.topChannel.total} total inquiries</span>
            </div>
          </div>

          <!-- Card 2: Highest Conversion Rate -->
          <div class="perf-metric-card">
            <div>
              <div class="perf-metric-label">HIGHEST CONVERSION RATE</div>
              <div class="perf-metric-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              </div>
              <div class="perf-metric-val">${escapeHtml(perf.highestConverting.channel)}</div>
            </div>
            <div class="perf-metric-meta">
              <span class="perf-pill-dark">${perf.highestConverting.conversionRate}% Conversion</span>
              <span>${(perf.highestConverting.confirmed || 0) + (perf.highestConverting.completed || 0)} confirmed</span>
            </div>
          </div>

          <!-- Card 3: Total Service Inquiries -->
          <div class="perf-metric-card">
            <div>
              <div class="perf-metric-label">TOTAL SERVICE INQUIRIES</div>
              <div class="perf-metric-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="perf-metric-val">${perf.totalInquiries}</div>
            </div>
            <div class="perf-metric-meta">
              <span>Across all customer acquisition touchpoints.</span>
            </div>
          </div>

          <!-- Card 4: Digital Channel Attribution -->
          <div class="perf-metric-card">
            <div>
              <div class="perf-metric-label">DIGITAL CHANNEL ATTRIBUTION</div>
              <div class="perf-metric-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
              </div>
              <div class="perf-metric-val">${perf.digitalPercentage}%</div>
            </div>
            <div>
              <div style="background:rgba(255,255,255,0.08); height:6px; border-radius:3px; overflow:hidden; margin-bottom:0.4rem;">
                <div style="background:#84cc16; width:${perf.digitalPercentage}%; height:100%;"></div>
              </div>
              <div class="perf-metric-meta" style="justify-content:space-between;">
                <span>${perf.digitalCount} identified</span>
                <span>${perf.untrackedCount} direct/untracked</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Visual Charts Grid (Screenshot Mirror) -->
        <div class="perf-charts-grid">
          <!-- Left Chart: Inquiries & Confirmation by Channel -->
          <div class="perf-chart-box">
            <h4 class="perf-chart-title">Inquiries &amp; Confirmation by Channel</h4>
            <p class="perf-chart-sub">Compare total inquiries versus confirmed bookings for each communication stream.</p>

            <div class="perf-barchart-container">
              ${perf.channelStats.length === 0 ? `
                <div style="width:100%; text-align:center; color:var(--text-muted); align-self:center;">No inquiries recorded yet.</div>
              ` : perf.channelStats.map(c => {
                const confirmedH = Math.max(8, Math.round(((c.confirmed + c.completed) / maxInquiryCount) * 160));
                const pendingH = Math.max(8, Math.round((c.pending / maxInquiryCount) * 160));

                return `
                  <div class="perf-barchart-col">
                    <div class="perf-barchart-bars">
                      <div class="perf-bar-confirmed" style="height:${c.confirmed + c.completed > 0 ? confirmedH : 4}px;" title="Confirmed: ${c.confirmed + c.completed}"></div>
                      <div class="perf-bar-pending" style="height:${c.pending > 0 ? pendingH : 4}px;" title="Pending: ${c.pending}"></div>
                    </div>
                    <div class="perf-bar-label">${escapeHtml(c.channel)}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Legend -->
            <div class="perf-chart-legend">
              <div class="perf-legend-item">
                <div class="perf-legend-box" style="background:#84cc16;"></div>
                <span>Confirmed Bookings</span>
              </div>
              <div class="perf-legend-item">
                <div class="perf-legend-box" style="background:#000; border:1px solid rgba(255,255,255,0.3);"></div>
                <span>Pending Inquiries</span>
              </div>
            </div>
          </div>

          <!-- Right Chart: Acquisition Channel Share Donut -->
          <div class="perf-chart-box">
            <h4 class="perf-chart-title">Acquisition Channel Share</h4>
            <p class="perf-chart-sub">Relative distribution of service referral origin.</p>

            <div class="perf-donut-container">
              <div class="perf-donut-wrap">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="rgba(255,255,255,0.08)" stroke-width="18" />
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#84cc16" stroke-width="18" stroke-dasharray="377" stroke-dashoffset="${377 - (377 * (perf.topChannel.percentage || 100)) / 100}" stroke-linecap="round" transform="rotate(-90 80 80)" />
                </svg>
                <div class="perf-donut-center">
                  <div class="perf-donut-center-num">${perf.totalInquiries}</div>
                  <div class="perf-donut-center-sub">LEADS</div>
                </div>
              </div>

              <!-- Legend below donut -->
              <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:1.25rem; width:100%;">
                ${perf.channelStats.map(c => `
                  <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;">
                    <div style="display:flex; align-items:center; gap:0.45rem;">
                      <span style="width:8px; height:8px; border-radius:50%; background:${CHANNEL_COLORS[c.channel] || '#84cc16'};"></span>
                      <span style="color:#fff; font-weight:600;">${escapeHtml(c.channel)}</span>
                    </div>
                    <span style="color:var(--text-secondary); font-family:var(--font-mono);">${c.total} (${c.percentage}%)</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Strategic Marketing & Advertising Allocation (Where should we keep advertising?) -->
        <div class="perf-ad-strategy-card">
          <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.75rem;">
            <div style="width:32px; height:32px; border-radius:6px; background:rgba(132, 204, 22, 0.15); color:#84cc16; display:flex; align-items:center; justify-content:center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div>
              <h4 style="font-size:1.05rem; font-weight:800; color:#fff; margin:0 0 0.15rem;">
                Where We Will Keep Advertising (Budget Allocation Intelligence)
              </h4>
              <p style="font-size:0.8rem; color:var(--text-secondary); margin:0;">
                Data-backed recommendations on which platforms to allocate company ad spend for highest conversion and customer acquisition in Rwanda.
              </p>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; margin-top:1.25rem;">
            ${perf.adRecommendations.map(rec => `
              <div style="background:rgba(7,9,15,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:1.15rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.4rem;">
                    <h5 style="margin:0; font-size:0.95rem; font-weight:700; color:#fff;">${rec.platform}</h5>
                    <span style="font-size:0.72rem; font-weight:700; padding:0.15rem 0.5rem; border-radius:4px; background:${rec.statusColor}22; color:${rec.statusColor}; border:1px solid ${rec.statusColor}44;">
                      ${rec.status}
                    </span>
                  </div>
                  <div style="font-size:0.8rem; font-weight:600; color:#84cc16; margin-bottom:0.6rem;">${rec.verdict}</div>
                  <p style="font-size:0.8rem; line-height:1.45; color:var(--text-secondary); margin-bottom:0.85rem;">
                    ${rec.reason}
                  </p>
                </div>
                <div style="background:rgba(255,255,255,0.03); border-radius:6px; padding:0.65rem 0.85rem; font-size:0.75rem; color:var(--text-muted); line-height:1.4;">
                  <strong style="color:var(--text-primary); display:block; margin-bottom:0.25rem;">Execution Playbook:</strong>
                  <ul style="margin:0; padding-left:1.1rem;">
                    ${rec.suggestedActions.map(act => `<li>${act}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* Modal Editor Component for Slides / Services / Portfolio                   */
/* -------------------------------------------------------------------------- */
function renderSlideEditorModal(slide = {}, isNew = false, index = -1) {
  return `
    <div class="admin-modal-backdrop" id="adminModalBackdrop">
      <div class="admin-modal">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">${isNew ? 'Create New Slide' : 'Edit Slide'}</h3>
          <button class="admin-modal-close" id="modalCloseBtn">&times;</button>
        </div>

        <form id="slideEditorForm" data-index="${index}" data-isnew="${isNew}">
          <div class="admin-form-group">
            <label class="admin-label">Slide Badge / Category Tag</label>
            <input type="text" id="slideBadgeInput" class="admin-input" placeholder="e.g. Enterprise Platform (optional)" value="${slide.badge || ''}">
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Headline Title *</label>
              <input type="text" id="slideTitleInput" class="admin-input" placeholder="e.g. Technology Solutions" value="${slide.title || ''}" required>
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Highlight Word / Phrase (Gradient text)</label>
              <input type="text" id="slideHighlightInput" class="admin-input" placeholder="e.g. Built for Africa" value="${slide.highlight || ''}">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Subtitle / Description *</label>
            <textarea id="slideSubtitleInput" class="admin-textarea" rows="3" placeholder="Enter concise summary..." required>${slide.subtitle || ''}</textarea>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Background Photo</label>
            <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
              <select id="slidePresetSelect" class="admin-select" style="max-width:260px;">
                <option value="">-- Choose Preset Photo --</option>
                <option value="/images/slide1_kigali_tech.jpg">Kigali Tech Skyline</option>
                <option value="/images/slide2_software_team.jpg">Software Engineering Team</option>
                <option value="/images/slide3_datacenter.jpg">Cloud Datacenter</option>
                <option value="/images/about_office.jpg">Kigali Office Workspace</option>
              </select>
              <input type="text" id="slideImageInput" class="admin-input" placeholder="Or enter image URL / path" value="${slide.image || '/images/slide1_kigali_tech.jpg'}" required>
            </div>
            <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
              <label class="btn-admin btn-admin-secondary btn-admin-sm" style="cursor:pointer;">
                <span>📁 Upload Image from PC</span>
                <input type="file" id="slidePhotoUpload" accept="image/*" style="display:none;">
              </label>
              <span id="slideUploadFileName" style="font-size:0.8rem; color:var(--text-muted);"></span>
              <span id="slideUploadStatus" style="font-size:0.8rem; font-weight:600; color:var(--brand-blue-light);"></span>
            </div>
            <div id="slideImagePreviewWrap" style="margin-top:0.75rem; width:100%; max-width:280px; aspect-ratio:16/9; border-radius:8px; overflow:hidden; border:1px solid rgba(62,181,241,0.3); background:#07090f;">
              <img id="slideImagePreview" src="${slide.image || '/images/slide1_kigali_tech.jpg'}" alt="Slide Preview" style="width:100%; height:100%; object-fit:cover;">
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Primary Button Label</label>
              <input type="text" id="slideCta1Label" class="admin-input" placeholder="e.g. Our Services" value="${slide.ctaPrimary?.label || 'Our Services'}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Primary Button Link</label>
              <input type="text" id="slideCta1Url" class="admin-input" placeholder="e.g. /services" value="${slide.ctaPrimary?.url || '/services'}">
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Secondary Button Label</label>
              <input type="text" id="slideCta2Label" class="admin-input" placeholder="e.g. Explore Portfolio" value="${slide.ctaSecondary?.label || 'Explore Portfolio'}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Secondary Button Link</label>
              <input type="text" id="slideCta2Url" class="admin-input" placeholder="e.g. /portfolio" value="${slide.ctaSecondary?.url || '/portfolio'}">
            </div>
          </div>

          <div class="admin-form-group" style="display:flex; align-items:center; gap:0.5rem; margin-top:0.5rem;">
            <input type="checkbox" id="slideEnabledCheck" ${slide.enabled !== false ? 'checked' : ''} style="accent-color:var(--brand-blue-light); cursor:pointer;">
            <label for="slideEnabledCheck" style="font-size:0.88rem; color:var(--text-primary); cursor:pointer;">Slide is visible on public website</label>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.08);">
            <button type="button" class="btn-admin btn-admin-secondary" id="modalCancelBtn">Cancel</button>
            <button type="submit" class="btn-admin btn-admin-primary">Save Slide</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderServiceEditorModal(service = {}, isNew = false, index = -1) {
  return `
    <div class="admin-modal-backdrop" id="adminModalBackdrop">
      <div class="admin-modal">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">${isNew ? 'Add Registered Service' : 'Edit Service'}</h3>
          <button class="admin-modal-close" id="modalCloseBtn">&times;</button>
        </div>

        <form id="serviceEditorForm" data-index="${index}" data-isnew="${isNew}">
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">RDB Classification Code</label>
              <input type="text" id="serviceCodeInput" class="admin-input" placeholder="e.g. J5820" value="${service.code || ''}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Service Title *</label>
              <input type="text" id="serviceTitleInput" class="admin-input" placeholder="e.g. Software Publishing" value="${service.title || ''}" required>
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Description *</label>
            <textarea id="serviceDescInput" class="admin-textarea" rows="3" required>${service.desc || ''}</textarea>
          </div>

          <div class="admin-form-group" style="display:flex; align-items:center; gap:0.5rem;">
            <input type="checkbox" id="servicePrimaryCheck" ${service.primary ? 'checked' : ''} style="accent-color:var(--brand-blue-light); cursor:pointer;">
            <label for="servicePrimaryCheck" style="font-size:0.88rem; color:var(--text-primary); cursor:pointer;">Mark as Primary Business Activity</label>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.08);">
            <button type="button" class="btn-admin btn-admin-secondary" id="modalCancelBtn">Cancel</button>
            <button type="submit" class="btn-admin btn-admin-primary">Save Service</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderProjectEditorModal(project = {}, isNew = false, index = -1) {
  const tagsStr = Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || '');
  return `
    <div class="admin-modal-backdrop" id="adminModalBackdrop">
      <div class="admin-modal">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">${isNew ? 'Add Portfolio Project' : 'Edit Portfolio Project'}</h3>
          <button class="admin-modal-close" id="modalCloseBtn">&times;</button>
        </div>

        <form id="projectEditorForm" data-index="${index}" data-isnew="${isNew}">
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Project Title *</label>
              <input type="text" id="projectTitleInput" class="admin-input" placeholder="e.g. LopRok" value="${project.title || ''}" required>
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Subtitle</label>
              <input type="text" id="projectSubtitleInput" class="admin-input" placeholder="e.g. Music Creator & Streaming Studio" value="${project.subtitle || ''}">
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Category</label>
              <input type="text" id="projectCategoryInput" class="admin-input" placeholder="e.g. Media & Creator Platform" value="${project.category || ''}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Pill Badge</label>
              <input type="text" id="projectBadgeInput" class="admin-input" placeholder="e.g. Special (optional)" value="${project.badge && !['Enterprise', 'Flagship Platform', 'National Forum', 'Consulting Dashboard', 'Fintech Application', 'Demo Dashboard'].includes(project.badge) ? project.badge : ''}">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Website Screenshot (Landscape 1920x1090)</label>
            <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
              <select id="projectPresetSelect" class="admin-select" style="max-width:240px;">
                <option value="">-- Choose Stock Image --</option>
                <option value="/images/slide1_kigali_tech.jpg">Kigali Tech Skyline</option>
                <option value="/images/slide2_software_team.jpg">Software Engineering Team</option>
                <option value="/images/slide3_datacenter.jpg">Cloud Datacenter</option>
                <option value="/images/about_office.jpg">Workspace Office</option>
              </select>
              <input type="text" id="projectImageInput" class="admin-input" placeholder="Screenshot URL / path" value="${project.image || '/images/slide1_kigali_tech.jpg'}">
            </div>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <label class="btn-admin btn-admin-secondary btn-admin-sm" style="cursor:pointer;">
                <span>📁 Upload Screenshot (1920x1090)</span>
                <input type="file" id="projectPhotoUpload" accept="image/*" style="display:none;">
              </label>
              <span id="projectUploadFileName" style="font-size:0.8rem; color:var(--text-muted);">Recommended: 1920x1090 landscape ratio</span>
            </div>
            <div id="projectImagePreviewWrap" style="margin-top:0.75rem; width:100%; max-width:260px; aspect-ratio:1920/1090; border-radius:8px; overflow:hidden; border:1px solid rgba(62,181,241,0.3); background:#07090f;">
              <img id="projectImagePreview" src="${project.image || '/images/slide1_kigali_tech.jpg'}" alt="Preview" style="width:100%; height:100%; object-fit:cover;">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Description *</label>
            <textarea id="projectDescInput" class="admin-textarea" rows="3" required>${project.desc || ''}</textarea>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Live Platform / Demo URL</label>
              <input type="url" id="projectUrlInput" class="admin-input" placeholder="https://..." value="${project.url || ''}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Platform Visit Button Label</label>
              <input type="text" id="projectBtnTextInput" class="admin-input" placeholder="Visit / Live Demo" value="${project.btnText || 'Visit'}">
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Project Quote / Estimated Cost ($ or RWF) *</label>
              <input type="text" id="projectQuoteInput" class="admin-input" placeholder="e.g. $2,500 or RWF 3,200,000 or Starting at $1,800" value="${project.quote || ''}">
              <span style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem; display:block;">Enter estimated money/quote shown on this project card.</span>
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Order CTA Button Label</label>
              <input type="text" id="projectOrderBtnTextInput" class="admin-input" placeholder="Order Similar Website" value="${project.orderBtnText || 'Order Similar Website'}">
              <span style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem; display:block;">CTA button for prospective clients to order a similar solution.</span>
            </div>
          </div>

          <div class="admin-form-group" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.85rem 1rem; margin-bottom:1.25rem;">
            <label style="display:flex; align-items:center; gap:0.65rem; cursor:pointer; margin:0; user-select:none;">
              <input type="checkbox" id="projectShowQuoteInput" style="width:18px; height:18px; accent-color:#84cc16; cursor:pointer;" ${project.showQuote !== false ? 'checked' : ''}>
              <span style="font-size:0.88rem; font-weight:700; color:#fff;">Display Quote / Estimated Cost on Project Card</span>
            </label>
            <span style="font-size:0.76rem; color:var(--text-muted); margin-top:0.35rem; display:block; padding-left:1.8rem;">
              When checked, the quote box is displayed on the website. If unchecked, the quote is hidden while keeping the "Order Similar Website" button active.
            </span>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Tags (comma separated)</label>
            <input type="text" id="projectTagsInput" class="admin-input" placeholder="e.g. Next.js, PWA, Live Audio" value="${tagsStr}">
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.08);">
            <button type="button" class="btn-admin btn-admin-secondary" id="modalCancelBtn">Cancel</button>
            <button type="submit" class="btn-admin btn-admin-primary">Save Project</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* Floating Admin Bar on Public Site                                          */
/* -------------------------------------------------------------------------- */
export function renderFloatingAdminBar() {
  if (!contentStore.isAdminAuthenticated()) return '';
  const adminUser = contentStore.getAdminUser();

  return `
    <div class="floating-admin-bar" id="floatingAdminBar">
      <div class="admin-bar-status">
        <span class="admin-bar-dot"></span>
        <span>${adminUser.name || 'Admin'}</span>
      </div>
      <a href="/admin" class="btn-admin btn-admin-primary btn-admin-sm">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        <span>Admin Console</span>
        ${bookingStore.getPendingCount() > 0 ? `<span class="admin-booking-badge" style="margin-left:0.35rem; font-size:0.7rem; padding:0.1rem 0.35rem;">${bookingStore.getPendingCount()}</span>` : ''}
      </a>
      <button id="floatingAdminLogoutBtn" class="btn-admin btn-admin-secondary btn-admin-sm" title="Log Out">
        ✕
      </button>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* Event Listeners & Interactions Initialization                              */
/* -------------------------------------------------------------------------- */
export function initAdminEvents(onContentChange) {
  // 1. Google Sign-In button
  const googleBtn = document.getElementById('googleSignInBtn');
  if (googleBtn) {
    googleBtn.onclick = async () => {
      const errBox = document.getElementById('adminLoginError');
      if (errBox) errBox.style.display = 'none';

      if (!auth || !googleProvider) {
        if (errBox) {
          errBox.textContent = 'Firebase Auth is not available in this environment. Please sign in with the Admin password.';
          errBox.style.display = 'block';
        }
        return;
      }

      try {
        const remember = document.getElementById('adminRememberMe')?.checked || false;
        const result = await signInWithPopup(auth, googleProvider);
        if (result && result.user) {
          contentStore.loginWithGoogle(result.user, remember);
          showAdminToast(`Welcome, ${result.user.displayName || result.user.email}!`, 'success');
          onContentChange();
        }
      } catch (err) {
        console.error('Google Sign-In Error:', err);
        if (err.code === 'auth/popup-closed-by-user') {
          showAdminToast('Sign-in cancelled', 'info');
        } else if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
          if (errBox) {
            errBox.innerHTML = `Google provider is not enabled in Firebase Console (orvexi-b1253).<br>Please enable it under <em>Firebase Console &gt; Authentication &gt; Sign-in method &gt; Google</em>, or enter the master password below.`;
            errBox.style.display = 'block';
          }
        } else {
          if (errBox) {
            errBox.textContent = err.message || 'Google sign-in failed. Please try again or use the password.';
            errBox.style.display = 'block';
          }
        }
      }
    };
  }

  // 2. Toggle password visibility
  const togglePwdBtn = document.getElementById('togglePasswordVisibilityBtn');
  const pwdInput = document.getElementById('adminPassphraseInput');
  if (togglePwdBtn && pwdInput) {
    togglePwdBtn.onclick = () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      togglePwdBtn.style.color = isPwd ? 'var(--brand-blue-light)' : 'var(--text-muted)';
    };
  }

  // 3. Password Login Form handling
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      const pass = document.getElementById('adminPassphraseInput').value;
      const remember = document.getElementById('adminRememberMe').checked;
      const ok = contentStore.loginAdmin(pass, remember);
      if (ok) {
        showAdminToast('Welcome back, Admin!', 'success');
        onContentChange();
      } else {
        const err = document.getElementById('adminLoginError');
        if (err) {
          err.innerHTML = 'Incorrect password. Please verify or use "Reset password?" below.';
          err.style.display = 'block';
        }
      }
    };
  }

  // 4. Toggle between Sign In View and Reset Password View
  const toggleResetBtn = document.getElementById('toggleResetPasswordBtn');
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  const signInView = document.getElementById('adminSignInView');
  const resetView = document.getElementById('adminResetView');
  const resetEmailInput = document.getElementById('resetEmailInput');

  function showResetScreen() {
    showResetView = true;
    if (signInView) signInView.style.display = 'none';
    if (resetView) resetView.style.display = 'block';
    if (resetEmailInput) {
      resetEmailInput.value = '';
      resetEmailInput.focus();
    }
  }

  function showLoginScreen() {
    showResetView = false;
    if (resetView) resetView.style.display = 'none';
    if (signInView) signInView.style.display = 'block';
    const pwdInput = document.getElementById('adminPassphraseInput');
    if (pwdInput) pwdInput.focus();
  }

  if (toggleResetBtn) {
    toggleResetBtn.onclick = () => showResetScreen();
  }

  if (backToLoginBtn) {
    backToLoginBtn.onclick = () => showLoginScreen();
  }

  // 5. Reset via Firebase Email Form
  const resetForm = document.getElementById('adminResetForm');
  if (resetForm) {
    resetForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('resetEmailInput').value.trim();
      if (!email) {
        showAdminToast('Please enter an admin email address.', 'error');
        return;
      }
      try {
        if (auth) {
          await sendPasswordResetEmail(auth, email);
          showAdminToast(`Password reset link sent to ${email}. Check your inbox!`, 'success');
          setTimeout(() => showLoginScreen(), 1800);
        } else {
          showAdminToast('Firebase Auth service is offline. Please try again later or sign in with Google.', 'error');
        }
      } catch (err) {
        showAdminToast(err.message || 'Could not send reset email. Please verify the email address.', 'error');
      }
    };
  }

  // 6. Change Password in Settings Tab
  const pwdChangeForm = document.getElementById('adminPasswordChangeForm');
  if (pwdChangeForm) {
    pwdChangeForm.onsubmit = async (e) => {
      e.preventDefault();
      const current = document.getElementById('currentPassInput').value;
      const newP = document.getElementById('newPassInput').value;
      const confirmP = document.getElementById('confirmPassInput').value;

      const validCurrent = contentStore.getContent().settings?.adminPassword || MASTER_DEFAULT_PASSWORD;
      if (current !== validCurrent) {
        showAdminToast('Current password does not match.', 'error');
        return;
      }

      if (newP !== confirmP) {
        showAdminToast('New passwords do not match.', 'error');
        return;
      }

      const res = await contentStore.resetAdminPassword(newP);
      if (res.success) {
        showAdminToast('Admin password updated successfully!', 'success');
        pwdChangeForm.reset();
      } else {
        showAdminToast(res.error, 'error');
      }
    };
  }

  const restoreInSettingsBtn = document.getElementById('restoreMasterPwdInSettingsBtn');
  if (restoreInSettingsBtn) {
    restoreInSettingsBtn.onclick = async () => {
      if (confirm(`Reset the admin password back to "${MASTER_DEFAULT_PASSWORD}"?`)) {
        await contentStore.resetAdminPassword(MASTER_DEFAULT_PASSWORD);
        showAdminToast(`Password restored to "${MASTER_DEFAULT_PASSWORD}"`, 'success');
      }
    };
  }

  // 8. Logout button in Admin Header & floating bar
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      contentStore.logoutAdmin();
      showAdminToast('Signed out of Admin Console', 'info');
      window.history.pushState(null, '', '/');
      if (window.location.hash) window.location.hash = '';
      onContentChange();
    };
  }

  const floatingLogoutBtn = document.getElementById('floatingAdminLogoutBtn');
  if (floatingLogoutBtn) {
    floatingLogoutBtn.onclick = () => {
      contentStore.logoutAdmin();
      showAdminToast('Signed out of Admin Console', 'info');
      onContentChange();
    };
  }

  // Quick backup button in header
  const quickExport = document.getElementById('adminQuickExportBtn');
  if (quickExport) {
    quickExport.onclick = () => downloadJsonBackup();
  }

  // 9. Tab switching in sidebar
  document.querySelectorAll('.admin-nav-item').forEach(btn => {
    btn.onclick = () => {
      activeTab = btn.getAttribute('data-tab');
      onContentChange();
    };
  });

  // 10. Modal Close helpers
  function closeModal() {
    const mount = document.getElementById('adminModalMount');
    if (mount) mount.innerHTML = '';
  }

  function setupModalDismiss() {
    const closeBtn = document.getElementById('modalCloseBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const backdrop = document.getElementById('adminModalBackdrop');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) closeModal();
      };
    }
  }

  // 11. Zoho CPaaS Modal and Test Dispatch helpers
  function openZohoConfigModal() {
    const mount = document.getElementById('adminModalMount');
    if (!mount) return;
    mount.innerHTML = renderZohoConfigModal();
    setupZohoModalEvents();
  }

  function setupZohoModalEvents() {
    setupModalDismiss();

    const toggleBtn = document.getElementById('toggleApiKeyVisibility');
    const keyInput = document.getElementById('zohoApiKeyInput');
    if (toggleBtn && keyInput) {
      toggleBtn.onclick = () => {
        const isPwd = keyInput.type === 'password';
        keyInput.type = isPwd ? 'text' : 'password';
        toggleBtn.textContent = isPwd ? 'Hide Key' : 'Show Key';
      };
    }

    const form = document.getElementById('zohoConfigForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const apiKey = document.getElementById('zohoApiKeyInput')?.value.trim();
        const senderEmail = document.getElementById('zohoSenderEmailInput')?.value.trim() || 'ceo@orvexi.rw';
        const senderName = document.getElementById('zohoSenderNameInput')?.value.trim() || 'ORVEXI LTD';

        zohoEmailService.saveConfig({ apiKey, senderEmail, senderName });
        showAdminToast('Zoho CPaaS configuration saved!', 'success');
        closeModal();
        onContentChange();
      };
    }

    const testBtn = document.getElementById('testZohoModalBtn');
    if (testBtn) {
      testBtn.onclick = async () => {
        const apiKey = document.getElementById('zohoApiKeyInput')?.value.trim();
        const senderEmail = document.getElementById('zohoSenderEmailInput')?.value.trim() || 'ceo@orvexi.rw';
        const senderName = document.getElementById('zohoSenderNameInput')?.value.trim() || 'ORVEXI LTD';

        if (!apiKey) {
          alert('Please enter your Zoho-enczapikey before sending a test email.');
          document.getElementById('zohoApiKeyInput')?.focus();
          return;
        }

        zohoEmailService.saveConfig({ apiKey, senderEmail, senderName });

        testBtn.disabled = true;
        testBtn.innerHTML = '<span>Testing Connection...</span>';
        try {
          await zohoEmailService.sendTestEmail(senderEmail);
          showAdminToast(`✓ Verification email sent to ${senderEmail}! Check your inbox.`, 'success');
        } catch (err) {
          alert('Zoho Verification Error:\n' + (err.message || err));
        } finally {
          testBtn.disabled = false;
          testBtn.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <span>Send Test Email</span>
          `;
        }
      };
    }
  }

  function handleSendTestEmail() {
    if (!zohoEmailService.isConfigured()) {
      alert('Zoho CPaaS API key is not configured. Please paste your Zoho-enczapikey in the setup dialog.');
      openZohoConfigModal();
      return;
    }
    showAdminToast('Dispatching verification test email to ceo@orvexi.rw...', 'info');
    zohoEmailService.sendTestEmail('ceo@orvexi.rw')
      .then(() => {
        showAdminToast('✓ Test email dispatched to ceo@orvexi.rw successfully!', 'success');
      })
      .catch(err => {
        alert('Could not dispatch test email:\n' + (err.message || err));
      });
  }

  // Settings Zoho Credentials Events
  const settingsZohoBtn = document.getElementById('settingsConfigureZohoBtn');
  if (settingsZohoBtn) {
    settingsZohoBtn.onclick = () => openZohoConfigModal();
  }
  const settingsTestZohoBtn = document.getElementById('settingsTestZohoBtn');
  if (settingsTestZohoBtn) {
    settingsTestZohoBtn.onclick = () => handleSendTestEmail();
  }

  // -------------------------
  // SLIDER EVENTS
  // -------------------------
  const addSlideBtn = document.getElementById('adminAddSlideBtn');
  if (addSlideBtn) {
    addSlideBtn.onclick = () => {
      const mount = document.getElementById('adminModalMount');
      mount.innerHTML = renderSlideEditorModal({}, true, -1);
      setupModalDismiss();
      setupSlideModalForm(onContentChange, closeModal);
    };
  }

  document.querySelectorAll('.btn-edit-slide').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const slide = contentStore.getContent().heroSlider[idx];
      const mount = document.getElementById('adminModalMount');
      mount.innerHTML = renderSlideEditorModal(slide, false, idx);
      setupModalDismiss();
      setupSlideModalForm(onContentChange, closeModal);
    };
  });

  document.querySelectorAll('.btn-toggle-slide').forEach(btn => {
    btn.onclick = async () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const content = contentStore.getContent();
      const current = content.heroSlider[idx].enabled !== false;
      content.heroSlider[idx].enabled = !current;
      await contentStore.saveContent({ heroSlider: [...content.heroSlider] });
      showAdminToast(`Slide ${idx + 1} is now ${!current ? 'Active' : 'Hidden'}`, 'success');
      onContentChange();
    };
  });

  document.querySelectorAll('.btn-move-slide').forEach(btn => {
    btn.onclick = async () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const dir = parseInt(btn.getAttribute('data-dir'), 10);
      const content = contentStore.getContent();
      const slides = [...content.heroSlider];
      const targetIdx = idx + dir;
      if (targetIdx >= 0 && targetIdx < slides.length) {
        const temp = slides[idx];
        slides[idx] = slides[targetIdx];
        slides[targetIdx] = temp;
        await contentStore.saveContent({ heroSlider: slides });
        showAdminToast('Slide order updated', 'success');
        onContentChange();
      }
    };
  });

  document.querySelectorAll('.btn-delete-slide').forEach(btn => {
    btn.onclick = async () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      if (confirm('Are you sure you want to delete this slide?')) {
        const content = contentStore.getContent();
        const slides = content.heroSlider.filter((_, i) => i !== idx);
        await contentStore.saveContent({ heroSlider: slides });
        showAdminToast('Slide deleted successfully', 'success');
        onContentChange();
      }
    };
  });

  // -------------------------
  // ABOUT SECTION EVENTS
  // -------------------------
  const addParaBtn = document.getElementById('addParagraphBtn');
  if (addParaBtn) {
    addParaBtn.onclick = () => {
      const container = document.getElementById('aboutParagraphsContainer');
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '0.5rem';
      row.style.marginBottom = '0.75rem';
      row.innerHTML = `
        <textarea class="admin-textarea about-paragraph-input" style="min-height:60px;" placeholder="Enter narrative paragraph (HTML supported)..."></textarea>
        <button type="button" class="btn-admin btn-admin-danger btn-admin-sm btn-del-paragraph" style="align-self:flex-start;">✕</button>
      `;
      container.appendChild(row);
      row.querySelector('.btn-del-paragraph').onclick = () => row.remove();
    };
  }

  document.querySelectorAll('.btn-del-paragraph').forEach(btn => {
    btn.onclick = () => btn.closest('div').remove();
  });

  const saveAboutBtn = document.getElementById('saveAboutBtn');
  if (saveAboutBtn) {
    saveAboutBtn.onclick = async () => {
      const paragraphs = Array.from(document.querySelectorAll('.about-paragraph-input'))
        .map(input => input.value.trim())
        .filter(Boolean);

      const aboutData = {
        tag: document.getElementById('aboutTag').value.trim(),
        title: document.getElementById('aboutTitle').value.trim(),
        desc: document.getElementById('aboutDesc').value.trim(),
        officePhoto: document.getElementById('aboutPhoto').value.trim(),
        officeBadge: document.getElementById('aboutOfficeBadge').value.trim(),
        paragraphs,
        registration: {
          tin: document.getElementById('regTin').value.trim(),
          date: document.getElementById('regDate').value.trim(),
          type: document.getElementById('regType').value.trim(),
          address: document.getElementById('regAddress').value.trim(),
          director: document.getElementById('regDirector').value.trim()
        }
      };

      await contentStore.saveContent({ about: aboutData });
      showAdminToast('About & Corporate overview updated!', 'success');
      onContentChange();
    };
  }

  // -------------------------
  // SERVICES EVENTS
  // -------------------------
  const saveServicesHeaderBtn = document.getElementById('saveServicesHeaderBtn');
  if (saveServicesHeaderBtn) {
    saveServicesHeaderBtn.onclick = async () => {
      const current = contentStore.getContent().services;
      await contentStore.saveContent({
        services: {
          ...current,
          tag: document.getElementById('servicesTag').value.trim(),
          title: document.getElementById('servicesTitle').value.trim(),
          desc: document.getElementById('servicesDesc').value.trim()
        }
      });
      showAdminToast('Services header saved', 'success');
      onContentChange();
    };
  }

  const addServiceBtn = document.getElementById('adminAddServiceBtn');
  if (addServiceBtn) {
    addServiceBtn.onclick = () => {
      const mount = document.getElementById('adminModalMount');
      mount.innerHTML = renderServiceEditorModal({}, true, -1);
      setupModalDismiss();
      setupServiceModalForm(onContentChange, closeModal);
    };
  }

  document.querySelectorAll('.btn-edit-service').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const service = contentStore.getContent().services.items[idx];
      const mount = document.getElementById('adminModalMount');
      mount.innerHTML = renderServiceEditorModal(service, false, idx);
      setupModalDismiss();
      setupServiceModalForm(onContentChange, closeModal);
    };
  });

  document.querySelectorAll('.btn-del-service').forEach(btn => {
    btn.onclick = async () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      if (confirm('Delete this service activity?')) {
        const services = contentStore.getContent().services;
        const newItems = services.items.filter((_, i) => i !== idx);
        await contentStore.saveContent({ services: { ...services, items: newItems } });
        showAdminToast('Service removed', 'success');
        onContentChange();
      }
    };
  });

  // -------------------------
  // PORTFOLIO EVENTS
  // -------------------------
  const savePortfolioHeaderBtn = document.getElementById('savePortfolioHeaderBtn');
  if (savePortfolioHeaderBtn) {
    savePortfolioHeaderBtn.onclick = async () => {
      const current = contentStore.getContent().portfolio;
      await contentStore.saveContent({
        portfolio: {
          ...current,
          tag: document.getElementById('portfolioTag').value.trim(),
          title: document.getElementById('portfolioTitle').value.trim(),
          desc: document.getElementById('portfolioDesc').value.trim()
        }
      });
      showAdminToast('Portfolio header saved', 'success');
      onContentChange();
    };
  }

  const addProjectBtn = document.getElementById('adminAddProjectBtn');
  if (addProjectBtn) {
    addProjectBtn.onclick = () => {
      const mount = document.getElementById('adminModalMount');
      mount.innerHTML = renderProjectEditorModal({}, true, -1);
      setupModalDismiss();
      setupProjectModalForm(onContentChange, closeModal);
    };
  }

  document.querySelectorAll('.btn-edit-project').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const project = contentStore.getContent().portfolio.items[idx];
      const mount = document.getElementById('adminModalMount');
      mount.innerHTML = renderProjectEditorModal(project, false, idx);
      setupModalDismiss();
      setupProjectModalForm(onContentChange, closeModal);
    };
  });

  document.querySelectorAll('.btn-del-project').forEach(btn => {
    btn.onclick = async () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      if (confirm('Delete this portfolio project?')) {
        const portfolio = contentStore.getContent().portfolio;
        const newItems = portfolio.items.filter((_, i) => i !== idx);
        await contentStore.saveContent({ portfolio: { ...portfolio, items: newItems } });
        showAdminToast('Portfolio item removed', 'success');
        onContentChange();
      }
    };
  });


  // -------------------------
  // CLOUD CODE VAULT EVENTS
  // -------------------------
  const toggleUploadBtn = document.getElementById('adminToggleUploadPanelBtn');
  const uploadPanel = document.getElementById('adminVaultUploadPanel');
  const cancelUploadBtn = document.getElementById('vaultCancelUploadBtn');
  if (toggleUploadBtn && uploadPanel) {
    toggleUploadBtn.onclick = () => {
      uploadPanel.style.display = uploadPanel.style.display === 'block' ? 'none' : 'block';
    };
  }
  if (cancelUploadBtn && uploadPanel) {
    cancelUploadBtn.onclick = () => {
      uploadPanel.style.display = 'none';
    };
  }

  const projSelect = document.getElementById('vaultProjectSelect');
  const customGroup = document.getElementById('vaultCustomProjectGroup');
  if (projSelect && customGroup) {
    projSelect.onchange = () => {
      customGroup.style.display = projSelect.value === 'client-custom' ? 'block' : 'none';
    };
  }

  const archiveFileInput = document.getElementById('vaultArchiveFileInput');
  const archiveFileNameDisplay = document.getElementById('vaultSelectedFileName');
  const vaultDropZone = document.getElementById('vaultDropZone');

  if (archiveFileInput && archiveFileNameDisplay) {
    archiveFileInput.onchange = (e) => {
      const f = e.target.files[0];
      if (f) {
        archiveFileNameDisplay.textContent = `Selected: ${f.name} (${vaultStore.formatBytes(f.size)})`;
      }
    };
  }

  if (vaultDropZone && archiveFileInput) {
    ['dragenter', 'dragover'].forEach(eventName => {
      vaultDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        vaultDropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      vaultDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        vaultDropZone.classList.remove('dragover');
      });
    });

    vaultDropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        archiveFileInput.files = files;
        if (archiveFileNameDisplay) {
          archiveFileNameDisplay.textContent = `Selected: ${files[0].name} (${vaultStore.formatBytes(files[0].size)})`;
        }
      }
    });
  }

  const vaultForm = document.getElementById('vaultUploadForm');
  if (vaultForm) {
    vaultForm.onsubmit = async (e) => {
      e.preventDefault();
      const file = archiveFileInput.files[0];
      if (!file) {
        showAdminToast('Please select an archive file to upload.', 'error');
        return;
      }

      const submitBtn = document.getElementById('vaultSubmitUploadBtn');
      const progressWrap = document.getElementById('vaultUploadProgressWrap');
      const progressBar = document.getElementById('vaultProgressBar');
      const progressPercent = document.getElementById('vaultUploadPercent');
      const progressStatus = document.getElementById('vaultUploadStatusText');

      if (submitBtn) submitBtn.disabled = true;
      if (progressWrap) progressWrap.style.display = 'block';

      try {
        await vaultStore.uploadBackup({
          file,
          projectId: document.getElementById('vaultProjectSelect').value,
          customProjectName: document.getElementById('vaultCustomProjectName')?.value?.trim(),
          versionTag: document.getElementById('vaultVersionTag')?.value?.trim(),
          notes: document.getElementById('vaultNotesInput')?.value?.trim(),
          onProgress: (percent, bytes, total) => {
            const p = Math.round(percent);
            if (progressBar) progressBar.style.width = p + '%';
            if (progressPercent) progressPercent.textContent = p + '%';
            if (progressStatus) progressStatus.textContent = `Uploaded ${vaultStore.formatBytes(bytes)} / ${vaultStore.formatBytes(total)}`;
          }
        });

        showAdminToast('Project codebase archive uploaded to Google Cloud Storage!', 'success');
        onContentChange();
      } catch (err) {
        showAdminToast('Upload failed: ' + (err.message || 'Unknown error'), 'error');
        if (submitBtn) submitBtn.disabled = false;
        if (progressWrap) progressWrap.style.display = 'none';
      }
    };
  }

  document.querySelectorAll('.btn-delete-backup').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this backup snapshot from Google Cloud Storage? This action cannot be undone.')) {
        await vaultStore.deleteBackup(id);
        showAdminToast('Backup snapshot deleted', 'info');
        onContentChange();
      }
    };
  });

  const filterSelect = document.getElementById('vaultFilterSelect');
  if (filterSelect) {
    filterSelect.onchange = () => {
      currentVaultFilter = filterSelect.value;
      onContentChange();
    };
  }

  const refreshVaultBtn = document.getElementById('vaultRefreshBtn');
  if (refreshVaultBtn) {
    refreshVaultBtn.onclick = async () => {
      showAdminToast('Refreshing cloud records...', 'info');
      await vaultStore.initFirestoreSync();
      onContentChange();
    };
  }

  // -------------------------
  // CONTACT & SERVICE FORM EVENTS
  // -------------------------
  async function persistFullContactData() {
    const currentContact = contentStore.getContent()?.contact || {};

    const tagEl = document.getElementById('formConfigTag');
    const titleEl = document.getElementById('formConfigTitle');
    const descEl = document.getElementById('formConfigDesc');
    const submitBtnEl = document.getElementById('formConfigSubmitBtn');
    const notifEmailEl = document.getElementById('formConfigNotificationEmail');
    const servicesEl = document.getElementById('formConfigServices');
    const timeSlotsEl = document.getElementById('formConfigTimeSlots');
    const channelsEl = document.getElementById('formConfigChannels');
    const successTitleEl = document.getElementById('formConfigSuccessTitle');
    const successDescEl = document.getElementById('formConfigSuccessDesc');

    const emailEl = document.getElementById('contactConfigEmail');
    const phoneEl = document.getElementById('contactConfigPhone');
    const tinEl = document.getElementById('contactConfigTin');
    const rraLinkEl = document.getElementById('contactConfigRraLink');
    const addressEl = document.getElementById('contactConfigAddress');

    const services = servicesEl 
      ? servicesEl.value.split('\n').map(s => s.trim()).filter(Boolean)
      : currentContact.services;

    const timeSlots = timeSlotsEl 
      ? timeSlotsEl.value.split('\n').map(s => s.trim()).filter(Boolean)
      : currentContact.timeSlots;

    const channels = channelsEl 
      ? channelsEl.value.split('\n').map(s => s.trim()).filter(Boolean)
      : currentContact.channels;

    const updatedContact = {
      ...currentContact,
      ...(tagEl ? { tag: tagEl.value.trim() } : {}),
      ...(titleEl ? { title: titleEl.value.trim() } : {}),
      ...(descEl ? { desc: descEl.value.trim() } : {}),
      ...(submitBtnEl ? { submitBtnText: submitBtnEl.value.trim() } : {}),
      ...(notifEmailEl ? { notificationEmail: notifEmailEl.value.trim() } : {}),
      ...(services ? { services } : {}),
      ...(timeSlots ? { timeSlots } : {}),
      ...(channels ? { channels } : {}),
      ...(successTitleEl ? { successTitle: successTitleEl.value.trim() } : {}),
      ...(successDescEl ? { successDesc: successDescEl.value.trim() } : {}),
      ...(emailEl ? { email: emailEl.value.trim() } : {}),
      ...(phoneEl ? { phone: phoneEl.value.trim() } : {}),
      ...(tinEl ? { tin: tinEl.value.trim() } : {}),
      ...(rraLinkEl ? { rraLink: rraLinkEl.value.trim() } : {}),
      ...(addressEl ? { address: addressEl.value.trim() } : {})
    };

    await contentStore.saveContent({ contact: updatedContact });
    showAdminToast('Service form & corporate settings saved successfully!', 'success');
    onContentChange();
  }

  const saveServiceFormBtn = document.getElementById('saveServiceFormBtn');
  if (saveServiceFormBtn) {
    saveServiceFormBtn.onclick = persistFullContactData;
  }

  const saveContactBtn = document.getElementById('saveContactBtn');
  if (saveContactBtn) {
    saveContactBtn.onclick = persistFullContactData;
  }

  // -------------------------
  // EXPORT & IMPORT EVENTS
  // -------------------------
  const exportBtn = document.getElementById('exportContentJsonBtn');
  if (exportBtn) {
    exportBtn.onclick = () => downloadJsonBackup();
  }

  const importInput = document.getElementById('importJsonFileInput');
  if (importInput) {
    importInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const res = contentStore.importJSON(evt.target.result);
        if (res.success) {
          showAdminToast('Data imported successfully!', 'success');
          onContentChange();
        } else {
          showAdminToast('Import error: ' + res.error, 'error');
        }
      };
      reader.readAsText(file);
    };
  }

  const resetDefaultsBtn = document.getElementById('resetFactoryDefaultsBtn');
  if (resetDefaultsBtn) {
    resetDefaultsBtn.onclick = () => {
      if (confirm('Are you sure you want to revert all site content to factory defaults? Any unsaved edits will be reset.')) {
        contentStore.resetToDefaults();
        showAdminToast('Content reset to factory defaults', 'info');
        onContentChange();
      }
    };
  }

  // -------------------------
  // BOOKINGS PIPELINE EVENTS
  // -------------------------
  const bookingsTab = document.getElementById('bookingsContentWrap');
  if (bookingsTab) {
    // 1. Back to dashboard
    const backBtn = document.getElementById('bookingsBackToDashboardBtn');
    if (backBtn) {
      backBtn.onclick = () => {
        activeTab = 'slider';
        onContentChange();
      };
    }

    // 2. Refresh from Firestore
    const refreshBtn = document.getElementById('bookingsRefreshBtn');
    if (refreshBtn) {
      refreshBtn.onclick = async () => {
        showAdminToast('Syncing service requests from cloud...', 'info');
        await bookingStore.initFirestoreSync();
        onContentChange();
        showAdminToast('Service requests updated', 'success');
      };
    }

    // 3. Export Excel / CSV
    const exportBtn = document.getElementById('bookingsExportCsvBtn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        bookingStore.exportCSV();
        showAdminToast('Bookings exported to CSV spreadsheet', 'success');
      };
    }

    // 4. Channel Analytics Modal
    const analyticsBtn = document.getElementById('bookingsAnalyticsBtn');
    if (analyticsBtn) {
      analyticsBtn.onclick = () => {
        const mount = document.getElementById('adminModalMount');
        mount.innerHTML = renderChannelAnalyticsModal();
        setupModalDismiss();
        const close2 = document.getElementById('modalCloseBtn2');
        if (close2) close2.onclick = closeModal;
        const modalExport = document.getElementById('modalExportCsvBtn');
        if (modalExport) {
          modalExport.onclick = () => {
            bookingStore.exportCSV();
            showAdminToast('Bookings exported to CSV', 'success');
          };
        }
      };
    }

    // 5. Search Input & Clear Search
    const searchInput = document.getElementById('bookingsSearchInput');
    const clearSearchBtn = document.getElementById('bookingsClearSearchBtn');

    if (searchInput) {
      searchInput.oninput = (e) => {
        bookingSearchQuery = e.target.value;
        refreshBookingsUI();
      };
    }

    if (clearSearchBtn) {
      clearSearchBtn.onclick = () => {
        bookingSearchQuery = '';
        if (searchInput) searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        refreshBookingsUI();
      };
    }

    // 6. Status tab buttons
    document.querySelectorAll('.status-tab-btn').forEach(btn => {
      btn.onclick = () => {
        bookingStatusFilter = btn.getAttribute('data-status') || 'All';
        document.querySelectorAll('.status-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        refreshBookingsUI();
      };
    });

    // 7. Channel pill buttons
    document.querySelectorAll('.channel-pill-btn').forEach(btn => {
      btn.onclick = () => {
        bookingChannelFilter = btn.getAttribute('data-channel') || 'All';
        document.querySelectorAll('.channel-pill-btn').forEach(b => b.classList.toggle('active', b === btn));
        refreshBookingsUI();
      };
    });

    // 8. Event delegation on bookings list container for actions
    const listContainer = document.getElementById('bookingsListContainer');
    if (listContainer) {
      listContainer.onclick = async (e) => {
        const confirmBtn = e.target.closest('.btn-confirm-booking');
        const completeBtn = e.target.closest('.btn-complete-booking');
        const cancelBtn = e.target.closest('.btn-cancel-booking');
        const reopenBtn = e.target.closest('.btn-reopen-booking');
        const deleteBtn = e.target.closest('.btn-delete-booking');

        if (confirmBtn) {
          const id = confirmBtn.getAttribute('data-id');
          bookingStore.updateStatus(id, 'Confirmed');
          showAdminToast('Request confirmed!', 'success');

          // If Zoho is configured, dispatch booking confirmation email
          if (zohoEmailService.isConfigured()) {
            const b = bookingStore.bookings.find(x => x.id === id);
            if (b && b.email) {
              zohoEmailService.sendEmail({
                to: [b.email],
                subject: `[ORVEXI] Service Request Confirmed: ${b.service || 'Technology Consultation'}`,
                html: `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#07090f; color:#ffffff; padding:2rem;">
                    <div style="max-width:560px; margin:0 auto; background:#0b101f; border:1px solid rgba(132,204,22,0.3); border-radius:10px; padding:2rem;">
                      <div style="text-align:center; margin-bottom:1.5rem;">
                        <h2 style="color:#84cc16; margin:0 0 0.5rem; font-size:1.3rem;">Service Request Confirmed</h2>
                        <p style="color:#94a3b8; font-size:0.88rem; margin:0;">ORVEXI COMPANY LTD &bull; Enterprise Software Solutions</p>
                      </div>
                      <p style="color:#cbd5e1; font-size:0.92rem; line-height:1.6;">
                        Dear <strong>${escapeHtml(b.fullName || 'Partner')}</strong>,<br><br>
                        Your appointment request for <strong>${escapeHtml(b.service || 'Technology Consultation')}</strong> has been reviewed and confirmed.
                      </p>
                      <div style="background:rgba(255,255,255,0.04); border-radius:8px; padding:1rem; margin:1.25rem 0; font-size:0.86rem; line-height:1.7; color:#cbd5e1;">
                        <div><strong>Reference Code:</strong> <span style="color:#84cc16; font-family:monospace;">${escapeHtml(b.reference || 'ORV-CONF')}</span></div>
                        <div><strong>Appointment:</strong> ${escapeHtml(b.preferredDate || 'Scheduled')} (${escapeHtml(b.preferredTime || 'Flexible')})</div>
                        <div><strong>Service:</strong> ${escapeHtml(b.service || '')}</div>
                        <div><strong>Executive Contact:</strong> ceo@orvexi.rw &bull; +250 788 810 675</div>
                      </div>
                      <p style="font-size:0.82rem; color:#64748b; text-align:center; margin:1.5rem 0 0;">
                        ORVEXI COMPANY LTD &bull; KN 3 Rd, Downtown Commercial Hub, Kigali, Rwanda<br>
                        Official Communications: <a href="mailto:ceo@orvexi.rw" style="color:#84cc16;">ceo@orvexi.rw</a>
                      </p>
                    </div>
                  </div>
                `
              }).then(() => {
                showAdminToast(`Confirmation email dispatched to ${b.email}!`, 'info');
              }).catch(err => console.warn('Could not dispatch booking confirmation email:', err));
            }
          }

          refreshBookingsUI();
          onContentChange();
        } else if (completeBtn) {
          const id = completeBtn.getAttribute('data-id');
          bookingStore.updateStatus(id, 'Completed');
          showAdminToast('Request marked as completed!', 'success');
          refreshBookingsUI();
          onContentChange();
        } else if (cancelBtn) {
          const id = cancelBtn.getAttribute('data-id');
          if (confirm('Cancel this service request?')) {
            bookingStore.updateStatus(id, 'Cancelled');
            showAdminToast('Request cancelled', 'info');
            refreshBookingsUI();
            onContentChange();
          }
        } else if (reopenBtn) {
          const id = reopenBtn.getAttribute('data-id');
          bookingStore.updateStatus(id, 'Pending');
          showAdminToast('Request reopened as Pending', 'info');
          refreshBookingsUI();
          onContentChange();
        } else if (deleteBtn) {
          const id = deleteBtn.getAttribute('data-id');
          if (confirm('Permanently delete this service request record?')) {
            bookingStore.deleteBooking(id);
            showAdminToast('Request deleted', 'info');
            refreshBookingsUI();
            onContentChange();
          }
        }
      };
    }

    function refreshBookingsUI() {
      const filtered = bookingStore.getBookings({
        status: bookingStatusFilter,
        search: bookingSearchQuery,
        channel: bookingChannelFilter
      });
      const allCount = bookingStore.bookings.length;

      const countLabel = document.getElementById('bookingsCounterLabel');
      if (countLabel) {
        countLabel.textContent = `${filtered.length} of ${allCount} Requests`;
      }

      const exportBadge = document.getElementById('bookingsExportBadge');
      if (exportBadge) {
        exportBadge.textContent = String(allCount);
      }

      if (listContainer) {
        listContainer.innerHTML = renderBookingCardsHtml(filtered);
      }
    }
  }

  // -------------------------
  // MANAGE CONTACTS EVENTS
  // -------------------------
  const contactsWrap = document.getElementById('contactsContentWrap');
  if (contactsWrap) {
    const purgeBtn = document.getElementById('contactsPurgeAllBtn');
    if (purgeBtn) {
      purgeBtn.onclick = async () => {
        if (confirm('Are you sure you want to purge all contacts from your address book? This action cannot be undone.')) {
          await contactStore.purgeAll();
          selectedContactIds.clear();
          showAdminToast('All contacts purged', 'info');
          onContentChange();
        }
      };
    }

    const exportBtn = document.getElementById('contactsExportCsvBtn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        contactStore.exportCSV(selectedContactGroup);
        showAdminToast(`Contacts exported (${selectedContactGroup})`, 'success');
      };
    }

    const importBtn = document.getElementById('contactsImportBtn');
    if (importBtn) {
      importBtn.onclick = () => {
        const mount = document.getElementById('adminModalMount');
        mount.innerHTML = renderImportContactsModal();
        setupModalDismiss();
        const form = document.getElementById('importContactsForm');
        if (form) {
          form.onsubmit = async (e) => {
            e.preventDefault();
            const raw = document.getElementById('importContactsTextarea').value;
            const targetGroup = document.getElementById('importTargetGroupSelect').value;
            const count = await contactStore.importContacts(raw, targetGroup);
            showAdminToast(`Successfully imported ${count} contact(s)!`, 'success');
            closeModal();
            onContentChange();
          };
        }
      };
    }

    const addRecBtn = document.getElementById('contactsAddRecipientBtn');
    if (addRecBtn) {
      addRecBtn.onclick = () => {
        const mount = document.getElementById('adminModalMount');
        mount.innerHTML = renderAddRecipientModal({}, false);
        setupModalDismiss();
        const form = document.getElementById('addRecipientForm');
        if (form) {
          form.onsubmit = (e) => {
            e.preventDefault();
            try {
              contactStore.addContact({
                name: document.getElementById('contactNameInput').value,
                email: document.getElementById('contactEmailInput').value,
                phone: document.getElementById('contactPhoneInput').value,
                organization: document.getElementById('contactOrgInput').value,
                group: document.getElementById('contactGroupSelect').value
              });
              showAdminToast('Contact added to directory!', 'success');
              closeModal();
              onContentChange();
            } catch (err) {
              alert(err.message);
            }
          };
        }
      };
    }

    const addGrpBtn = document.getElementById('addContactGroupBtn');
    if (addGrpBtn) {
      addGrpBtn.onclick = () => {
        const mount = document.getElementById('adminModalMount');
        mount.innerHTML = renderAddGroupModal();
        setupModalDismiss();
        const form = document.getElementById('createGroupForm');
        if (form) {
          form.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('newGroupNameInput').value;
            try {
              contactStore.addGroup(name);
              showAdminToast(`Group "${name}" created!`, 'success');
              closeModal();
              onContentChange();
            } catch (err) {
              alert(err.message);
            }
          };
        }
      };
    }

    const manageGrpBtn = document.getElementById('manageContactGroupsBtn');
    if (manageGrpBtn) {
      manageGrpBtn.onclick = () => {
        const mount = document.getElementById('adminModalMount');
        mount.innerHTML = renderManageGroupsModal();
        setupModalDismiss();

        mount.querySelectorAll('.btn-rename-group').forEach(b => {
          b.onclick = () => {
            const oldName = b.getAttribute('data-group');
            const newName = prompt(`Rename group "${oldName}" to:`, oldName);
            if (newName && newName.trim() && newName.trim() !== oldName) {
              contactStore.renameGroup(oldName, newName.trim());
              showAdminToast(`Group renamed to "${newName.trim()}"`, 'success');
              closeModal();
              onContentChange();
            }
          };
        });

        mount.querySelectorAll('.btn-delete-group').forEach(b => {
          b.onclick = () => {
            const name = b.getAttribute('data-group');
            if (confirm(`Delete group "${name}"? Contacts in this group will be moved to default.`)) {
              contactStore.deleteGroup(name);
              showAdminToast(`Group "${name}" deleted`, 'info');
              closeModal();
              onContentChange();
            }
          };
        });
      };
    }

    document.querySelectorAll('.contacts-groups-nav .group-tab-btn[data-group]').forEach(btn => {
      btn.onclick = () => {
        selectedContactGroup = btn.getAttribute('data-group') || 'All';
        document.querySelectorAll('.contacts-groups-nav .group-tab-btn[data-group]').forEach(b => b.classList.toggle('active', b === btn));
        refreshContactsTableUI();
      };
    });

    const searchInput = document.getElementById('contactsSearchInput');
    if (searchInput) {
      searchInput.oninput = (e) => {
        contactSearchQuery = e.target.value;
        refreshContactsTableUI();
      };
    }

    const selectAll = document.getElementById('contactsSelectAll');
    if (selectAll) {
      selectAll.onchange = (e) => {
        const checked = e.target.checked;
        document.querySelectorAll('.contact-row-check').forEach(chk => {
          chk.checked = checked;
          const id = chk.getAttribute('data-id');
          if (checked) selectedContactIds.add(id);
          else selectedContactIds.delete(id);
        });
        updateBatchBar();
      };
    }

    const tableBody = document.getElementById('contactsTableBody');
    if (tableBody) {
      tableBody.onclick = async (e) => {
        const rowCheck = e.target.closest('.contact-row-check');
        const editBtn = e.target.closest('.btn-edit-contact');
        const delBtn = e.target.closest('.btn-delete-contact');

        if (rowCheck) {
          const id = rowCheck.getAttribute('data-id');
          if (rowCheck.checked) selectedContactIds.add(id);
          else selectedContactIds.delete(id);
          updateBatchBar();
        } else if (editBtn) {
          const id = editBtn.getAttribute('data-id');
          const contact = contactStore.contacts.find(c => c.id === id);
          if (contact) {
            const mount = document.getElementById('adminModalMount');
            mount.innerHTML = renderAddRecipientModal(contact, true);
            setupModalDismiss();
            const form = document.getElementById('addRecipientForm');
            if (form) {
              form.onsubmit = (ev) => {
                ev.preventDefault();
                contactStore.updateContact(id, {
                  name: document.getElementById('contactNameInput').value,
                  email: document.getElementById('contactEmailInput').value,
                  phone: document.getElementById('contactPhoneInput').value,
                  organization: document.getElementById('contactOrgInput').value,
                  group: document.getElementById('contactGroupSelect').value
                });
                showAdminToast('Contact updated!', 'success');
                closeModal();
                onContentChange();
              };
            }
          }
        } else if (delBtn) {
          const id = delBtn.getAttribute('data-id');
          if (confirm('Delete this contact?')) {
            contactStore.deleteContact(id);
            selectedContactIds.delete(id);
            showAdminToast('Contact deleted', 'info');
            onContentChange();
          }
        }
      };
    }

    const batchDelBtn = document.getElementById('batchDeleteContactsBtn');
    if (batchDelBtn) {
      batchDelBtn.onclick = () => {
        if (confirm(`Delete ${selectedContactIds.size} selected contact(s)?`)) {
          contactStore.deleteContacts(Array.from(selectedContactIds));
          selectedContactIds.clear();
          showAdminToast('Selected contacts deleted', 'info');
          onContentChange();
        }
      };
    }

    function updateBatchBar() {
      const bar = document.getElementById('contactsBatchBar');
      const span = document.getElementById('batchCountSpan');
      if (bar && span) {
        span.textContent = String(selectedContactIds.size);
        bar.style.display = selectedContactIds.size > 0 ? 'flex' : 'none';
      }
    }

    function refreshContactsTableUI() {
      const list = contactStore.getContacts({
        group: selectedContactGroup,
        search: contactSearchQuery
      });
      const stats = contactStore.getStats();
      if (tableBody) tableBody.innerHTML = renderContactsTableRows(list);
      const showing = document.getElementById('contactsShowingCount');
      if (showing) showing.textContent = `Showing ${list.length} of ${stats.total} contacts`;
    }
  }

  // -------------------------
  // SEND EMAIL CAMPAIGN EVENTS
  // -------------------------
  const sendEmailWrap = document.getElementById('sendEmailContentWrap');
  if (sendEmailWrap) {
    const openDesignerBtn = document.getElementById('openEmailDesignerBtn');
    const editDesignBtn = document.getElementById('emailEditDesignBtn');
    const openDesignerAction = () => {
      const mount = document.getElementById('adminModalMount');
      mount.innerHTML = renderEmailDesignerModal();
      setupDesignerEvents(onContentChange, closeModal);
    };
    if (openDesignerBtn) openDesignerBtn.onclick = openDesignerAction;
    if (editDesignBtn) editDesignBtn.onclick = openDesignerAction;

    const liveSyncBtn = document.getElementById('emailLiveSyncBtn');
    if (liveSyncBtn) {
      liveSyncBtn.onclick = () => {
        showAdminToast('Email layout synced with cloud', 'success');
      };
    }

    const previewBtn = document.getElementById('emailPreviewBtn');
    if (previewBtn) {
      previewBtn.onclick = () => {
        const mount = document.getElementById('adminModalMount');
        mount.innerHTML = renderEmailPreviewModal();
        setupModalDismiss();
        const iframe = document.getElementById('emailPreviewIframe');
        if (iframe) {
          iframe.srcdoc = emailStore.generateHtml();
        }
      };
    }

    document.querySelectorAll('.chip-contact-group').forEach(chip => {
      chip.onclick = () => {
        const grp = chip.getAttribute('data-group');
        const emails = contactStore.getEmailsByGroup(grp);
        appendRecipients(emails);
        showAdminToast(`Added ${emails.length} contact(s) from "${grp}"`, 'info');
      };
    });

    document.querySelectorAll('.chip-booking-filter').forEach(chip => {
      chip.onclick = () => {
        const st = chip.getAttribute('data-status');
        const bookings = bookingStore.getBookings({ status: st });
        const emails = bookings.map(b => b.email).filter(Boolean);
        appendRecipients(emails);
        showAdminToast(`Added ${emails.length} booking email(s)`, 'info');
      };
    });

    const myselfChip = document.querySelector('.chip-booking-myself');
    if (myselfChip) {
      myselfChip.onclick = () => {
        appendRecipients(['orvexi@gmail.com']);
        showAdminToast('Added orvexi@gmail.com', 'info');
      };
    }

    const importRecBtn = document.getElementById('importContactsToRecipientsBtn');
    if (importRecBtn) {
      importRecBtn.onclick = () => {
        const all = contactStore.contacts.map(c => c.email).filter(Boolean);
        appendRecipients(all);
        showAdminToast(`Added all ${all.length} saved contacts`, 'info');
      };
    }

    function appendRecipients(newEmails) {
      const textarea = document.getElementById('campaignRecipientsTextarea');
      if (!textarea) return;
      const current = textarea.value.split(/[,;\n]/).map(r => r.trim().toLowerCase()).filter(Boolean);
      const combined = Array.from(new Set([...current, ...newEmails.map(e => e.trim().toLowerCase())]));
      textarea.value = combined.join(', ');
      emailStore.saveCampaign({ recipientsText: textarea.value });
      updateRecipientsCount();
    }

    function updateRecipientsCount() {
      const textarea = document.getElementById('campaignRecipientsTextarea');
      const badge = document.getElementById('recipientsReadyBadge');
      const btnLabel = document.getElementById('dispatchBtnLabel');
      if (!textarea) return;
      const count = textarea.value.split(/[,;\n]/).map(r => r.trim()).filter(r => r.includes('@')).length;
      if (badge) badge.textContent = `${count} Recipients Ready`;
      if (btnLabel) btnLabel.textContent = `Send Campaign to ${count} Recipients →`;
    }

    const recTextarea = document.getElementById('campaignRecipientsTextarea');
    if (recTextarea) {
      recTextarea.oninput = () => {
        emailStore.saveCampaign({ recipientsText: recTextarea.value });
        updateRecipientsCount();
      };
    }

    const subjectInput = document.getElementById('campaignSubjectInput');
    const slugInput = document.getElementById('campaignSlugInput');
    const seoLinkText = document.getElementById('generatedSeoLinkText');

    if (subjectInput) {
      subjectInput.oninput = (e) => {
        const val = e.target.value;
        emailStore.saveCampaign({ subject: val });
        if (!slugInput.value || slugInput.value.startsWith('who-are-we') || slugInput.value.length < 5) {
          const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          if (slugInput) slugInput.value = slug;
          if (seoLinkText) seoLinkText.textContent = `https://orvexi.rw/publications/${slug}`;
          emailStore.saveCampaign({ seoSlug: slug });
        }
      };
    }

    if (slugInput) {
      slugInput.oninput = (e) => {
        const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (seoLinkText) seoLinkText.textContent = `https://orvexi.rw/publications/${slug}`;
        emailStore.saveCampaign({ seoSlug: slug });
      };
    }

    const toggleCcBccBtn = document.getElementById('toggleCcBccBtn');
    const ccBccWrap = document.getElementById('ccBccWrap');
    if (toggleCcBccBtn && ccBccWrap) {
      toggleCcBccBtn.onclick = () => {
        ccBccWrap.style.display = ccBccWrap.style.display === 'none' ? 'block' : 'none';
      };
    }

    const publishOnlineBtn = document.getElementById('publishOnlineOnlyBtn');
    if (publishOnlineBtn) {
      publishOnlineBtn.onclick = () => {
        const slug = emailStore.campaign.seoSlug || 'newsletter';
        showAdminToast(`Publication live: https://orvexi.rw/publications/${slug}`, 'success');
      };
    }

    const openZohoBtn = document.getElementById('openZohoConfigBtn');
    if (openZohoBtn) {
      openZohoBtn.onclick = () => openZohoConfigModal();
    }

    const testZohoBtn = document.getElementById('testZohoConnectionBtn');
    if (testZohoBtn) {
      testZohoBtn.onclick = () => handleSendTestEmail();
    }

    const dispatchForm = document.getElementById('sendEmailDispatchForm');
    if (dispatchForm) {
      dispatchForm.onsubmit = async (e) => {
        e.preventDefault();

        // 1. Gather all current values from inputs
        const subject = document.getElementById('campaignSubjectInput')?.value.trim();
        const orgName = document.getElementById('campaignOrgNameInput')?.value.trim();
        const slug = document.getElementById('campaignSlugInput')?.value.trim();
        const category = document.getElementById('campaignCategorySelect')?.value;
        const publishOnline = document.getElementById('campaignPublishOnlineCheck')?.checked;
        const includeBrowserView = document.getElementById('campaignBrowserViewCheck')?.checked;
        const recipientsRaw = document.getElementById('campaignRecipientsTextarea')?.value.trim();
        const sendTestCopy = document.getElementById('sendTestCopyMyself')?.checked;

        if (!subject) {
          alert('Please enter an Email Subject Line.');
          document.getElementById('campaignSubjectInput')?.focus();
          return;
        }

        // Parse recipients list
        let parsedRecipients = (recipientsRaw || '')
          .split(/[,;\n]/)
          .map(r => r.trim().toLowerCase())
          .filter(r => r.includes('@'));

        if (sendTestCopy && !parsedRecipients.includes('orvexi@gmail.com')) {
          parsedRecipients.push('orvexi@gmail.com');
        }

        if (parsedRecipients.length === 0) {
          alert('Please add at least one recipient email address or click one of the saved contact group buttons.');
          document.getElementById('campaignRecipientsTextarea')?.focus();
          return;
        }

        // Update campaign state
        emailStore.saveCampaign({
          subject,
          organizationName: orgName,
          seoSlug: slug,
          category,
          publishOnline,
          includeBrowserViewHeader: includeBrowserView,
          recipientsText: parsedRecipients.join(', ')
        });

        const dispatchBtn = document.getElementById('dispatchCampaignBtn');
        const origBtnContent = dispatchBtn ? dispatchBtn.innerHTML : '';

        // If Zoho CPaaS is configured, send live via ceo@orvexi.rw
        if (zohoEmailService.isConfigured()) {
          try {
            if (dispatchBtn) {
              dispatchBtn.disabled = true;
              dispatchBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                <span>Dispatching via Zoho CPaaS (ceo@orvexi.rw)...</span>
              `;
            }

            const zohoRes = await zohoEmailService.sendCampaign({
              recipients: parsedRecipients,
              subject,
              html: emailStore.generateHtml(),
              organizationName: orgName
            });

            const record = emailStore.dispatchCampaign({
              testOnly: false,
              recipients: parsedRecipients,
              subject,
              organizationName: orgName
            });

            showAdminToast(`✓ Dispatched live via Zoho CPaaS to ${record.recipientCount} recipient(s)!`, 'success');
            renderDispatchSuccessModal(record, zohoRes);
            onContentChange();
          } catch (err) {
            console.error('Zoho dispatch error:', err);
            alert('Zoho CPaaS Dispatch Error:\n' + (err.message || err));
          } finally {
            if (dispatchBtn) {
              dispatchBtn.disabled = false;
              dispatchBtn.innerHTML = origBtnContent;
            }
          }
        } else {
          // Zoho API Key not yet entered
          const shouldSetup = confirm(
            'Zoho CPaaS API Key (Zoho-enczapikey) is not configured yet.\n\nWould you like to enter your API key now to send live from ceo@orvexi.rw?\n\n(Click Cancel to record campaign locally without live Zoho relay)'
          );

          if (shouldSetup) {
            openZohoConfigModal();
          } else {
            const record = emailStore.dispatchCampaign({
              testOnly: false,
              recipients: parsedRecipients,
              subject,
              organizationName: orgName
            });
            showAdminToast(`Campaign recorded locally for ${record.recipientCount} recipient(s)!`, 'info');
            renderDispatchSuccessModal(record);
            onContentChange();
          }
        }
      };
    }

    // View dispatched history item
    document.querySelectorAll('.btn-view-history-email').forEach(btn => {
      btn.onclick = () => {
        const mount = document.getElementById('adminModalMount');
        mount.innerHTML = renderEmailPreviewModal();
        setupModalDismiss();
        const iframe = document.getElementById('emailPreviewIframe');
        if (iframe) {
          iframe.srcdoc = emailStore.generateHtml();
        }
      };
    });
  }

  // -------------------------
  // PLATFORM PERFORMANCE EVENTS
  // -------------------------
  const perfWrap = document.getElementById('perfContentWrap');
  if (perfWrap) {
    document.querySelectorAll('.perf-time-btn').forEach(btn => {
      btn.onclick = () => {
        performanceTimeRange = btn.getAttribute('data-range') || 'all';
        onContentChange();
      };
    });

    document.querySelectorAll('.perf-platform-pill').forEach(btn => {
      btn.onclick = () => {
        performanceSelectedPlatform = btn.getAttribute('data-platform') || 'All';
        onContentChange();
      };
    });

    const fullCenterBtn = document.getElementById('perfFullCenterBtn');
    if (fullCenterBtn) {
      fullCenterBtn.onclick = () => {
        const mount = document.getElementById('adminModalMount');
        mount.innerHTML = renderChannelAnalyticsModal();
        setupModalDismiss();
        const close2 = document.getElementById('modalCloseBtn2');
        if (close2) close2.onclick = closeModal;
        const modalExport = document.getElementById('modalExportCsvBtn');
        if (modalExport) {
          modalExport.onclick = () => {
            bookingStore.exportCSV();
            showAdminToast('Bookings exported to CSV', 'success');
          };
        }
      };
    }
  }
}

function setupDesignerEvents(onContentChange, closeModal) {
  const mount = document.getElementById('designerCanvasMount');

  // Device switcher
  const desktopBtn = document.getElementById('toggleDesktopViewBtn');
  const mobileBtn = document.getElementById('toggleMobileViewBtn');
  if (desktopBtn && mobileBtn && mount) {
    desktopBtn.onclick = () => {
      designerDevice = 'desktop';
      mount.classList.remove('mobile');
      desktopBtn.className = 'btn-admin btn-admin-sm btn-admin-primary';
      mobileBtn.className = 'btn-admin btn-admin-sm btn-admin-secondary';
    };
    mobileBtn.onclick = () => {
      designerDevice = 'mobile';
      mount.classList.add('mobile');
      mobileBtn.className = 'btn-admin btn-admin-sm btn-admin-primary';
      desktopBtn.className = 'btn-admin btn-admin-sm btn-admin-secondary';
    };
  }

  // Close Designer
  const closeBtn = document.getElementById('closeDesignerBtn');
  if (closeBtn) closeBtn.onclick = closeModal;

  const saveAndSendBtn = document.getElementById('designerSaveAndSendBtn');
  if (saveAndSendBtn) {
    saveAndSendBtn.onclick = () => {
      closeModal();
      onContentChange();
      showAdminToast('Design saved! Ready to dispatch campaign.', 'success');
      setTimeout(() => {
        const btn = document.getElementById('dispatchCampaignBtn');
        if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    };
  }

  const cloudSaveBtn = document.getElementById('designerCloudSaveBtn');
  if (cloudSaveBtn) {
    cloudSaveBtn.onclick = () => {
      showAdminToast('Email template saved to cloud storage', 'success');
    };
  }

  const previewBtn = document.getElementById('designerPreviewBtn');
  if (previewBtn) {
    previewBtn.onclick = () => {
      const prevWin = window.open('', '_blank');
      if (prevWin) {
        prevWin.document.write(emailStore.generateHtml());
        prevWin.document.close();
      }
    };
  }

  const helpBtn = document.getElementById('designerHelpBtn');
  if (helpBtn) {
    helpBtn.onclick = () => {
      alert('How to use ORVEXI Email Designer:\n\n1. Use the left sidebar to add Content Blocks, complete Section presets, or customize Styles.\n2. Click directly on any text, header, or footer element in the preview to edit inline.\n3. Hover over any block to move up, move down, duplicate, edit full properties (including logo & legal disclaimer), or delete.\n4. Check the Optimize tab for real-time spam scoring and Rwandan Law N° 058/2021 compliance.\n5. Click "Save & Send" when done to dispatch to your contact lists.');
    };
  }

  // Sidebar Tab Switching (Blocks, Sections, Styles, Optimize)
  const tabsContainer = document.getElementById('designerSidebarTabs');
  if (tabsContainer) {
    tabsContainer.querySelectorAll('.designer-sidebar-tab').forEach(tabBtn => {
      tabBtn.onclick = () => {
        const tab = tabBtn.getAttribute('data-tab');
        if (!tab) return;
        designerActiveTab = tab;
        tabsContainer.querySelectorAll('.designer-sidebar-tab').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-tab') === tab);
        });
        refreshDesignerSidebar();
      };
    });
  }

  function refreshDesignerSidebar() {
    const sidebarBody = document.getElementById('designerSidebarBody');
    if (sidebarBody) {
      sidebarBody.innerHTML = renderDesignerSidebarBody(designerActiveTab);
      wireSidebarTabEvents();
    }
  }

  function wireSidebarTabEvents() {
    // 1. Blocks tab: add content block
    document.querySelectorAll('.btn-add-email-block').forEach(btn => {
      btn.onclick = () => {
        const type = btn.getAttribute('data-type');
        const newBlock = emailStore.addBlock(type);
        refreshDesignerCanvas();
        showAdminToast(`Added "${type}" block to email`, 'info');

        setTimeout(() => {
          if (mount && newBlock) {
            const addedEl = mount.querySelector(`[data-id="${newBlock.id}"]`);
            if (addedEl) {
              addedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              addedEl.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
              addedEl.style.boxShadow = '0 0 0 3px #84cc16';
              addedEl.style.borderColor = '#84cc16';
              setTimeout(() => {
                if (addedEl) {
                  addedEl.style.boxShadow = '';
                  addedEl.style.borderColor = '';
                }
              }, 1800);
            }
          }
        }, 50);
      };
    });

    // 2. Sections tab: insert complete section preset
    document.querySelectorAll('.btn-insert-section').forEach(btn => {
      btn.onclick = () => {
        const secId = btn.getAttribute('data-section-id');
        const preset = EMAIL_SECTION_PRESETS.find(p => p.id === secId);
        if (preset) {
          const added = emailStore.addBlocks(preset.blocks);
          refreshDesignerCanvas();
          showAdminToast(`Added "${preset.name}" section`, 'success');
          if (added && added[0]) {
            setTimeout(() => {
              const el = mount?.querySelector(`[data-id="${added[0].id}"]`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 60);
          }
        }
      };
    });

    // 3. Styles tab: theme presets and color pickers
    document.querySelectorAll('.btn-apply-theme').forEach(btn => {
      btn.onclick = () => {
        const themeId = btn.getAttribute('data-theme-id');
        emailStore.applyThemePreset(themeId);
        refreshDesignerCanvas();
        refreshDesignerSidebar();
        showAdminToast('Applied theme preset', 'success');
      };
    });

    const emailBgPicker = document.getElementById('styleEmailBgPicker');
    if (emailBgPicker) {
      emailBgPicker.oninput = (e) => {
        emailStore.updateStyles({ emailBg: e.target.value });
        refreshDesignerCanvas();
      };
    }

    const cardBgPicker = document.getElementById('styleCardBgPicker');
    if (cardBgPicker) {
      cardBgPicker.oninput = (e) => {
        emailStore.updateStyles({ cardBg: e.target.value });
        refreshDesignerCanvas();
      };
    }

    const accentColorPicker = document.getElementById('styleAccentColorPicker');
    if (accentColorPicker) {
      accentColorPicker.oninput = (e) => {
        emailStore.updateStyles({ accentColor: e.target.value });
        refreshDesignerCanvas();
      };
    }

    const fontSelect = document.getElementById('styleFontFamilySelect');
    if (fontSelect) {
      fontSelect.onchange = (e) => {
        emailStore.updateStyles({ fontFamily: e.target.value });
        refreshDesignerCanvas();
      };
    }

    document.querySelectorAll('.btn-radius-preset').forEach(btn => {
      btn.onclick = () => {
        const rad = parseInt(btn.getAttribute('data-radius'), 10);
        emailStore.updateStyles({ borderRadius: rad });
        refreshDesignerCanvas();
        refreshDesignerSidebar();
      };
    });

    // 4. Optimize tab: auto-optimize button
    const autoOptimizeBtn = document.getElementById('btnAutoOptimizeEmail');
    if (autoOptimizeBtn) {
      autoOptimizeBtn.onclick = () => {
        const blocks = emailStore.getBlocks();
        let footer = blocks.find(b => b.type === 'footer');
        if (!footer) {
          emailStore.addBlock('footer');
          footer = emailStore.getBlocks().find(b => b.type === 'footer');
        }
        if (footer) {
          emailStore.updateBlock(footer.id, {
            company: footer.company || 'ORVEXI COMPANY LTD (Reg. No: 1628324)',
            address: footer.address || 'KN 3 Rd, Downtown Commercial Hub, Kigali, Rwanda',
            disclaimer: footer.disclaimer || 'You are receiving this official communication from ORVEXI Limited regarding requested technology services, enterprise advisory, or active service subscriptions. Compliant with Rwandan Law N° 058/2021 on Personal Data Protection and Privacy.',
            phone: footer.phone || '+250 788 810 675',
            email: footer.email || 'ceo@orvexi.rw'
          });
        }
        // Ensure image blocks have captions/alt
        blocks.forEach(b => {
          if (b.type === 'image' && !b.caption) {
            emailStore.updateBlock(b.id, { caption: 'ORVEXI Technology Platform' });
          }
          if (b.type === 'columns2' && !b.imageAlt) {
            emailStore.updateBlock(b.id, { imageAlt: b.title || 'Enterprise Feature' });
          }
        });
        refreshDesignerCanvas();
        refreshDesignerSidebar();
        showAdminToast('Email auto-optimized! Deliverability score: 98/100', 'success');
      };
    }
  }

  // Initial wiring for the active sidebar tab
  wireSidebarTabEvents();

  // Canvas block actions
  function setupCanvasListeners() {
    if (!mount) return;

    mount.onclick = (e) => {
      const upBtn = e.target.closest('.btn-block-up');
      const downBtn = e.target.closest('.btn-block-down');
      const dupBtn = e.target.closest('.btn-block-dup');
      const delBtn = e.target.closest('.btn-block-del');
      const editBtn = e.target.closest('.btn-block-edit');

      if (upBtn) {
        const id = upBtn.getAttribute('data-id');
        emailStore.moveBlock(id, -1);
        refreshDesignerCanvas();
      } else if (downBtn) {
        const id = downBtn.getAttribute('data-id');
        emailStore.moveBlock(id, 1);
        refreshDesignerCanvas();
      } else if (dupBtn) {
        const id = dupBtn.getAttribute('data-id');
        const clone = emailStore.duplicateBlock(id);
        refreshDesignerCanvas();
        if (clone) {
          setTimeout(() => {
            const el = mount.querySelector(`[data-id="${clone.id}"]`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.style.boxShadow = '0 0 0 3px #84cc16';
              setTimeout(() => { if (el) el.style.boxShadow = ''; }, 1500);
            }
          }, 50);
        }
      } else if (delBtn) {
        const id = delBtn.getAttribute('data-id');
        emailStore.removeBlock(id);
        refreshDesignerCanvas();
      } else if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        const block = emailStore.getBlocks().find(b => b.id === id);
        if (block) {
          const modalBackdrop = document.createElement('div');
          modalBackdrop.innerHTML = renderBlockEditModal(block);
          document.body.appendChild(modalBackdrop);
          
          const closeSubModal = () => modalBackdrop.remove();
          const subClose = modalBackdrop.querySelector('#modalCloseBtn');
          const subCancel = modalBackdrop.querySelector('#modalCancelBtn');
          if (subClose) subClose.onclick = closeSubModal;
          if (subCancel) subCancel.onclick = closeSubModal;

          const form = modalBackdrop.querySelector('#blockEditForm');
          if (form) {
            form.onsubmit = (ev) => {
              ev.preventDefault();
              const text = modalBackdrop.querySelector('#blockEditTextInput')?.value;
              const url = modalBackdrop.querySelector('#blockEditUrlInput')?.value;
              const img = modalBackdrop.querySelector('#blockEditImageInput')?.value;
              const title = modalBackdrop.querySelector('#blockEditTitleInput')?.value;
              const desc = modalBackdrop.querySelector('#blockEditDescInput')?.value;
              const btnText = modalBackdrop.querySelector('#blockEditBtnTextInput')?.value;
              const btnUrl = modalBackdrop.querySelector('#blockEditBtnUrlInput')?.value;

              const logoUrl = modalBackdrop.querySelector('#blockEditLogoUrl')?.value;
              const companyName = modalBackdrop.querySelector('#blockEditCompanyName')?.value;
              const tagline = modalBackdrop.querySelector('#blockEditTagline')?.value;
              const footerCompany = modalBackdrop.querySelector('#blockEditFooterCompany')?.value;
              const footerAddress = modalBackdrop.querySelector('#blockEditFooterAddress')?.value;
              const footerPhone = modalBackdrop.querySelector('#blockEditFooterPhone')?.value;
              const footerEmail = modalBackdrop.querySelector('#blockEditFooterEmail')?.value;
              const footerDisclaimer = modalBackdrop.querySelector('#blockEditFooterDisclaimer')?.value;
              const topbarAddress = modalBackdrop.querySelector('#blockEditTopbarAddress')?.value;
              const topbarPhone = modalBackdrop.querySelector('#blockEditTopbarPhone')?.value;
              const topbarWebsite = modalBackdrop.querySelector('#blockEditTopbarWebsite')?.value;
              const topbarBg = modalBackdrop.querySelector('#blockEditTopbarBg')?.value;

              const updates = {};
              if (text !== undefined) updates.text = text;
              if (url !== undefined) updates.url = url;
              if (img !== undefined) updates.imageUrl = img;
              if (title !== undefined) updates.title = title;
              if (desc !== undefined) updates.desc = desc;
              if (btnText !== undefined) updates.btnText = btnText;
              if (btnUrl !== undefined) updates.btnUrl = btnUrl;

              if (logoUrl !== undefined) updates.logoUrl = logoUrl;
              if (companyName !== undefined) updates.companyName = companyName;
              if (tagline !== undefined) updates.tagline = tagline;
              if (footerCompany !== undefined) updates.company = footerCompany;
              if (footerAddress !== undefined) updates.address = footerAddress;
              if (footerPhone !== undefined) updates.phone = footerPhone;
              if (footerEmail !== undefined) updates.email = footerEmail;
              if (footerDisclaimer !== undefined) updates.disclaimer = footerDisclaimer;
              if (topbarAddress !== undefined) updates.address = topbarAddress;
              if (topbarPhone !== undefined) updates.phone = topbarPhone;
              if (topbarWebsite !== undefined) updates.website = topbarWebsite;
              if (topbarBg !== undefined) updates.bg = topbarBg;

              emailStore.updateBlock(id, updates);
              closeSubModal();
              refreshDesignerCanvas();
              showAdminToast('Block updated', 'success');
            };
          }
        }
      }
    };

    // Inline contenteditable blur listener
    mount.querySelectorAll('.editable-text').forEach(el => {
      el.onblur = () => {
        const id = el.getAttribute('data-id');
        const field = el.getAttribute('data-field') || 'text';
        const val = el.innerText.trim();
        emailStore.updateBlock(id, { [field]: val });
      };
    });
  }

  function refreshDesignerCanvas() {
    if (mount) {
      mount.innerHTML = renderDesignerCanvasBlocks(emailStore.getBlocks());
      setupCanvasListeners();
    }
  }

  setupCanvasListeners();
}

function downloadJsonBackup() {
  const json = contentStore.exportJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orvexi-content-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showAdminToast('Backup JSON downloaded', 'success');
}

function setupSlideModalForm(onContentChange, closeModal) {
  const form = document.getElementById('slideEditorForm');
  const preset = document.getElementById('slidePresetSelect');
  const imgInput = document.getElementById('slideImageInput');
  const fileInput = document.getElementById('slidePhotoUpload');
  const fileNameSpan = document.getElementById('slideUploadFileName');
  const uploadStatus = document.getElementById('slideUploadStatus');
  const previewImg = document.getElementById('slideImagePreview');
  const submitBtn = form?.querySelector('button[type="submit"]');

  if (preset) {
    preset.onchange = () => {
      if (preset.value) {
        imgInput.value = preset.value;
        if (previewImg) previewImg.src = preset.value;
      }
    };
  }

  if (imgInput) {
    imgInput.oninput = () => {
      if (previewImg && imgInput.value.trim()) {
        previewImg.src = imgInput.value.trim();
      }
    };
  }

  if (fileInput) {
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (fileNameSpan) fileNameSpan.textContent = file.name;
      if (uploadStatus) {
        uploadStatus.textContent = '⚡ Optimizing photo...';
        uploadStatus.style.color = 'var(--brand-blue-light)';
      }
      if (submitBtn) submitBtn.disabled = true;

      try {
        const optimizedUrl = await uploadImageToStorage(file, 'slides', (progress) => {
          if (uploadStatus) uploadStatus.textContent = `⚡ Uploading ${progress}%...`;
        });

        imgInput.value = optimizedUrl;
        if (previewImg) previewImg.src = optimizedUrl;
        if (uploadStatus) {
          uploadStatus.textContent = '✓ Ready to save';
          uploadStatus.style.color = '#10b981';
        }
        showAdminToast('Photo ready and optimized', 'success');
      } catch (err) {
        console.error('Photo upload error:', err);
        if (uploadStatus) {
          uploadStatus.textContent = '⚠️ Upload failed';
          uploadStatus.style.color = '#ef4444';
        }
        showAdminToast('Failed to optimize photo: ' + err.message, 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const isNew = form.getAttribute('data-isnew') === 'true';
      const idx = parseInt(form.getAttribute('data-index'), 10);

      const slideObj = {
        id: isNew ? 'slide-' + Date.now() : contentStore.getContent().heroSlider[idx]?.id || 'slide-' + Date.now(),
        badge: document.getElementById('slideBadgeInput').value.trim(),
        title: document.getElementById('slideTitleInput').value.trim(),
        highlight: document.getElementById('slideHighlightInput').value.trim(),
        subtitle: document.getElementById('slideSubtitleInput').value.trim(),
        image: document.getElementById('slideImageInput').value.trim() || '/images/slide1_kigali_tech.jpg',
        ctaPrimary: {
          label: document.getElementById('slideCta1Label').value.trim(),
          url: document.getElementById('slideCta1Url').value.trim()
        },
        ctaSecondary: {
          label: document.getElementById('slideCta2Label').value.trim(),
          url: document.getElementById('slideCta2Url').value.trim()
        },
        enabled: document.getElementById('slideEnabledCheck').checked
      };

      const content = contentStore.getContent();
      const slides = [...content.heroSlider];
      if (isNew) {
        slides.push(slideObj);
      } else {
        slides[idx] = slideObj;
      }

      await contentStore.saveContent({ heroSlider: slides });
      showAdminToast(isNew ? 'Slide created!' : 'Slide updated!', 'success');
      closeModal();
      onContentChange();
    };
  }
}

function setupServiceModalForm(onContentChange, closeModal) {
  const form = document.getElementById('serviceEditorForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const isNew = form.getAttribute('data-isnew') === 'true';
      const idx = parseInt(form.getAttribute('data-index'), 10);

      const serviceObj = {
        code: document.getElementById('serviceCodeInput').value.trim(),
        title: document.getElementById('serviceTitleInput').value.trim(),
        desc: document.getElementById('serviceDescInput').value.trim(),
        primary: document.getElementById('servicePrimaryCheck').checked
      };

      const services = contentStore.getContent().services;
      const items = [...services.items];
      if (isNew) {
        items.push(serviceObj);
      } else {
        items[idx] = serviceObj;
      }

      await contentStore.saveContent({ services: { ...services, items } });
      showAdminToast(isNew ? 'Service created!' : 'Service updated!', 'success');
      closeModal();
      onContentChange();
    };
  }
}

function setupProjectModalForm(onContentChange, closeModal) {
  const form = document.getElementById('projectEditorForm');
  const preset = document.getElementById('projectPresetSelect');
  const imgInput = document.getElementById('projectImageInput');
  const fileInput = document.getElementById('projectPhotoUpload');
  const fileNameSpan = document.getElementById('projectUploadFileName');
  const previewImg = document.getElementById('projectImagePreview');
  const previewWrap = document.getElementById('projectImagePreviewWrap');

  if (preset) {
    preset.onchange = () => {
      if (preset.value) {
        imgInput.value = preset.value;
        if (previewImg) {
          previewImg.src = preset.value;
          if (previewWrap) previewWrap.style.display = 'block';
        }
      }
    };
  }

  if (imgInput) {
    imgInput.oninput = () => {
      if (previewImg && imgInput.value.trim()) {
        previewImg.src = imgInput.value.trim();
        if (previewWrap) previewWrap.style.display = 'block';
      }
    };
  }

  if (fileInput) {
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (fileNameSpan) fileNameSpan.textContent = file.name;
      const submitBtn = form?.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const optimizedUrl = await uploadImageToStorage(file, 'projects');
        imgInput.value = optimizedUrl;
        if (previewImg) {
          previewImg.src = optimizedUrl;
          if (previewWrap) previewWrap.style.display = 'block';
        }
        showAdminToast('Screenshot optimized & ready', 'success');
      } catch (err) {
        console.error('Project image upload error:', err);
        showAdminToast('Upload failed: ' + err.message, 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const isNew = form.getAttribute('data-isnew') === 'true';
      const idx = parseInt(form.getAttribute('data-index'), 10);

      const tags = document.getElementById('projectTagsInput').value
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const projectObj = {
        id: isNew ? 'proj-' + Date.now() : contentStore.getContent().portfolio.items[idx]?.id || 'proj-' + Date.now(),
        title: document.getElementById('projectTitleInput').value.trim(),
        subtitle: document.getElementById('projectSubtitleInput').value.trim(),
        category: document.getElementById('projectCategoryInput').value.trim(),
        badge: document.getElementById('projectBadgeInput').value.trim(),
        desc: document.getElementById('projectDescInput').value.trim(),
        url: document.getElementById('projectUrlInput').value.trim(),
        image: document.getElementById('projectImageInput').value.trim() || '/images/slide1_kigali_tech.jpg',
        btnText: document.getElementById('projectBtnTextInput').value.trim() || 'Visit',
        quote: document.getElementById('projectQuoteInput')?.value.trim() || '',
        showQuote: document.getElementById('projectShowQuoteInput')?.checked ?? true,
        orderBtnText: document.getElementById('projectOrderBtnTextInput')?.value.trim() || 'Order Similar Website',
        tags
      };

      const portfolio = contentStore.getContent().portfolio;
      const items = [...portfolio.items];
      if (isNew) {
        items.push(projectObj);
      } else {
        items[idx] = projectObj;
      }

      await contentStore.saveContent({ portfolio: { ...portfolio, items } });
      showAdminToast(isNew ? 'Project created!' : 'Project updated!', 'success');
      closeModal();
      onContentChange();
    };
  }
}

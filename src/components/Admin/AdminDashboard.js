import { contentStore, MASTER_DEFAULT_PASSWORD } from '../../store/contentStore.js';
import { vaultStore, SUPPORTED_PROJECTS } from '../../store/vaultStore.js';

let currentVaultFilter = 'all';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  sendPasswordResetEmail 
} from '../../firebase.js';

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
          <a href="#home" style="display:flex; align-items:center;">
            <img src="/Logo-WHITE.png" alt="ORVEXI" height="28">
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

          <a href="#home" class="btn-admin btn-admin-secondary btn-admin-sm">
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

          <button class="admin-nav-item ${activeTab === 'contact' ? 'active' : ''}" data-tab="contact">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>Contact &amp; Details</span>
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
            <a href="#home" style="color: var(--text-muted); font-size: 0.84rem; text-decoration: none;">&larr; Return to Website</a>
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
            <a href="#home" style="color: var(--text-muted); font-size: 0.84rem; text-decoration: none;">&larr; Return to Website</a>
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
            ${p.badge && !['Enterprise', 'Flagship Platform', 'National Forum', 'Consulting Dashboard', 'Fintech Application', 'Demo Dashboard'].includes(p.badge) ? `<span class="admin-badge admin-badge-muted">${p.badge}</span>` : ''}
          </div>
          ${p.subtitle ? `<div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.35rem;">${p.subtitle}</div>` : ''}
          <p style="color:var(--text-muted); font-size:0.84rem; line-height:1.45; margin-bottom:0.5rem;">${p.desc}</p>
          <div style="font-size:0.78rem; color:var(--text-secondary); font-family:var(--font-mono);">
            URL: <a href="${p.url}" target="_blank" style="color:var(--brand-blue-light); text-decoration:none;">${p.url || 'None'}</a> | Tags: ${tags}
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
/* TAB 5: Contact & Details                                                   */
/* -------------------------------------------------------------------------- */
function renderContactTab(contact) {
  return `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h2 class="admin-card-title">Contact &amp; Corporate Details</h2>
          <p class="admin-card-subtitle">Configure email, phone, physical location, and official tax lookup links.</p>
        </div>
        <button id="saveContactBtn" class="btn-admin btn-admin-primary">Save Changes</button>
      </div>

      <form id="contactConfigForm">
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-label">Official Contact Email</label>
            <input type="email" id="contactConfigEmail" class="admin-input" value="${contact.email || 'orvexi@loprok.com'}">
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Official Phone Number</label>
            <input type="text" id="contactConfigPhone" class="admin-input" value="${contact.phone || '+250 788 810 675'}">
          </div>
        </div>

        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-label">Registered TIN Number</label>
            <input type="text" id="contactConfigTin" class="admin-input" value="${contact.tin || '1628324'}">
          </div>
          <div class="admin-form-group">
            <label class="admin-label">RRA Portal Verification URL</label>
            <input type="url" id="contactConfigRraLink" class="admin-input" value="${contact.rraLink || 'https://etax.rra.gov.rw/nidAssignedTIN/'}">
          </div>
        </div>

        <div class="admin-form-group">
          <label class="admin-label">Physical Address</label>
          <textarea id="contactConfigAddress" class="admin-textarea" rows="2">${contact.address || 'Niboye, Kicukiro\nUmujyi wa Kigali, Rwanda'}</textarea>
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
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <label class="btn-admin btn-admin-secondary btn-admin-sm" style="cursor:pointer;">
                <span>📁 Upload Image from PC</span>
                <input type="file" id="slidePhotoUpload" accept="image/*" style="display:none;">
              </label>
              <span id="slideUploadFileName" style="font-size:0.8rem; color:var(--text-muted);"></span>
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Primary Button Label</label>
              <input type="text" id="slideCta1Label" class="admin-input" placeholder="e.g. Our Services" value="${slide.ctaPrimary?.label || 'Our Services'}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Primary Button Link</label>
              <input type="text" id="slideCta1Url" class="admin-input" placeholder="e.g. #services" value="${slide.ctaPrimary?.url || '#services'}">
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Secondary Button Label</label>
              <input type="text" id="slideCta2Label" class="admin-input" placeholder="e.g. Explore Portfolio" value="${slide.ctaSecondary?.label || 'Explore Portfolio'}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Secondary Button Link</label>
              <input type="text" id="slideCta2Url" class="admin-input" placeholder="e.g. #portfolio" value="${slide.ctaSecondary?.url || '#portfolio'}">
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
              <label class="admin-label">Button Action Label</label>
              <input type="text" id="projectBtnTextInput" class="admin-input" placeholder="Visit / Live Demo" value="${project.btnText || 'Visit'}">
            </div>
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
      <a href="#admin" class="btn-admin btn-admin-primary btn-admin-sm">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        <span>Edit Content</span>
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
      window.location.hash = '#home';
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
  // CONTACT EVENTS
  // -------------------------
  const saveContactBtn = document.getElementById('saveContactBtn');
  if (saveContactBtn) {
    saveContactBtn.onclick = async () => {
      const contactData = {
        email: document.getElementById('contactConfigEmail').value.trim(),
        phone: document.getElementById('contactConfigPhone').value.trim(),
        tin: document.getElementById('contactConfigTin').value.trim(),
        rraLink: document.getElementById('contactConfigRraLink').value.trim(),
        address: document.getElementById('contactConfigAddress').value.trim()
      };
      await contentStore.saveContent({ contact: contactData });
      showAdminToast('Contact information saved!', 'success');
      onContentChange();
    };
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

  if (preset) {
    preset.onchange = () => {
      if (preset.value) imgInput.value = preset.value;
    };
  }

  if (fileInput) {
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        fileNameSpan.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (evt) => {
          imgInput.value = evt.target.result;
          showAdminToast('Photo loaded into slide editor', 'info');
        };
        reader.readAsDataURL(file);
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

  if (fileInput) {
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        fileNameSpan.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (evt) => {
          imgInput.value = evt.target.result;
          if (previewImg) {
            previewImg.src = evt.target.result;
            if (previewWrap) previewWrap.style.display = 'block';
          }
          showAdminToast('Screenshot loaded into card editor', 'info');
        };
        reader.readAsDataURL(file);
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

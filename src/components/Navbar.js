export function renderNavbar(isAdmin = false) {
  return `
    <header class="header-navbar" id="headerNavbar">
      <div class="container nav-container">
        <a href="#home" class="nav-brand" aria-label="ORVEXI Home">
          <img src="/Logo-WHITE.png" alt="ORVEXI" class="brand-logo-full" height="34">
        </a>

        <nav class="nav-desktop" aria-label="Primary Navigation">
          <ul class="nav-links">
            <li><a href="#home"         class="nav-link">Home</a></li>
            <li><a href="#about"        class="nav-link">About</a></li>
            <li><a href="#services"     class="nav-link">Services</a></li>
            <li><a href="#portfolio"    class="nav-link">Portfolio</a></li>
            <li><a href="#get-in-touch" class="nav-link">Get in Touch</a></li>
            ${isAdmin ? `<li><a href="#admin" class="nav-link admin-nav-link" style="color: var(--brand-blue-light); font-weight: 600;"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; margin-right:6px;"></span>Admin Panel</a></li>` : ''}
          </ul>
        </nav>

        <div class="nav-actions">
          <a href="#get-in-touch" class="btn btn-primary btn-sm nav-cta-desktop" id="navCtaBtn">
            <span>Get in Touch</span>
          </a>
          <button class="mobile-toggle-btn" id="mobileMenuBtn" aria-label="Toggle navigation" aria-expanded="false" aria-controls="mobileDrawer">
            <span class="hamburger-bar bar-1"></span>
            <span class="hamburger-bar bar-2"></span>
            <span class="hamburger-bar bar-3"></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Navigation Drawer & Backdrop (Rendered outside header to avoid backdrop-filter stacking trap) -->
    <div class="mobile-nav-backdrop" id="mobileNavBackdrop" aria-hidden="true"></div>
    <aside class="mobile-nav-drawer" id="mobileDrawer" aria-label="Mobile Navigation">
      <div class="mobile-drawer-header">
        <span class="mobile-drawer-title">Navigation</span>
        <span class="mobile-drawer-badge">ORVEXI LTD</span>
      </div>
      <nav class="mobile-drawer-nav">
        <a href="#home"         class="nav-link mobile-nav-link"><span class="mobile-nav-num">01</span><span>Home</span></a>
        <a href="#about"        class="nav-link mobile-nav-link"><span class="mobile-nav-num">02</span><span>About</span></a>
        <a href="#services"     class="nav-link mobile-nav-link"><span class="mobile-nav-num">03</span><span>Services</span></a>
        <a href="#portfolio"    class="nav-link mobile-nav-link"><span class="mobile-nav-num">04</span><span>Portfolio</span></a>
        <a href="#get-in-touch" class="nav-link mobile-nav-link"><span class="mobile-nav-num">05</span><span>Get in Touch</span></a>
        ${isAdmin ? `<a href="#admin" class="nav-link mobile-nav-link admin-link" style="color: var(--brand-blue-light); font-weight: 600;"><span class="mobile-nav-num">★</span><span>Admin Panel</span></a>` : ''}
      </nav>
      <div class="mobile-drawer-footer">
        <a href="#get-in-touch" class="btn btn-primary btn-mobile-cta">
          <span>Get in Touch</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
        <div class="mobile-drawer-contact-info">
          <a href="mailto:ceo@orvexi.rw" class="mobile-contact-item">ceo@orvexi.rw</a>
          <span class="mobile-contact-sep">•</span>
          <a href="tel:+250788647038" class="mobile-contact-item">+250 788 647 038</a>
        </div>
      </div>
    </aside>
  `;
}

export function renderNavbar() {
  return `
    <header class="header-navbar" id="headerNavbar">
      <div class="container nav-container">
        <a href="#home" class="nav-brand" aria-label="ORVEXI Home">
          <img src="/Logo-WHITE.png" alt="ORVEXI" class="brand-logo-full" height="36">
        </a>

        <nav aria-label="Primary Navigation">
          <ul class="nav-links">
            <li><a href="#home"      class="nav-link">Home</a></li>
            <li><a href="#about"     class="nav-link">About</a></li>
            <li><a href="#services"  class="nav-link">Services</a></li>
            <li><a href="#portfolio" class="nav-link">Portfolio</a></li>
            <li><a href="#contact"   class="nav-link">Contact</a></li>
          </ul>
        </nav>

        <div class="nav-actions">
          <a href="#contact" class="btn btn-primary btn-sm" id="navCtaBtn">
            <span>Get in Touch</span>
          </a>
          <button class="mobile-toggle-btn" id="mobileMenuBtn" aria-label="Toggle navigation">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div class="mobile-nav-drawer" id="mobileDrawer">
        <a href="#home"      class="nav-link mobile-link">Home</a>
        <a href="#about"     class="nav-link mobile-link">About</a>
        <a href="#services"  class="nav-link mobile-link">Services</a>
        <a href="#portfolio" class="nav-link mobile-link">Portfolio</a>
        <a href="#contact"   class="nav-link mobile-link">Contact</a>
        <a href="#contact"  class="btn btn-primary" style="width:100%; margin-top:0.5rem; text-align:center;">Get in Touch</a>
      </div>
    </header>
  `;
}

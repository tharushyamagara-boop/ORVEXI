export function renderFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">

          <!-- Brand col -->
          <div class="footer-col">
            <div style="margin-bottom: 1rem;">
              <img src="/Logo-WHITE.png" alt="ORVEXI" class="brand-logo-full" height="34">
            </div>
            <p style="font-size: 0.88rem; max-width: 280px; color: var(--text-muted); line-height: 1.6;">
              We deliver technology solutions from Kigali &mdash; software, IT consultancy, data hosting, and web services.
            </p>

          </div>

          <!-- Navigation -->
          <div class="footer-col">
            <h4 class="footer-col-title">Navigation</h4>
            <ul class="footer-links">
              <li><a href="#home"     class="footer-link">Home</a></li>
              <li><a href="#about"    class="footer-link">About</a></li>
              <li><a href="#services" class="footer-link">Services</a></li>
              <li><a href="#contact"  class="footer-link">Contact</a></li>
            </ul>
          </div>

          <!-- Services -->
          <div class="footer-col">
            <h4 class="footer-col-title">Services</h4>
            <ul class="footer-links">
              <li><a href="#services" class="footer-link">Software Publishing</a></li>
              <li><a href="#services" class="footer-link">Computer Programming</a></li>
              <li><a href="#services" class="footer-link">IT Consultancy</a></li>
              <li><a href="#services" class="footer-link">Data Processing &amp; Hosting</a></li>
              <li><a href="#services" class="footer-link">Web Portals</a></li>
            </ul>
          </div>

          <!-- Contact details -->
          <div class="footer-col">
            <h4 class="footer-col-title">Contact</h4>
            <ul class="footer-links" style="gap: 0.7rem;">
              <li style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.55;">
                Niboye, Kicukiro<br>Umujyi wa Kigali, Rwanda
              </li>
              <li>
                <a href="tel:+250788810675" class="footer-link">+250 788 810 675</a>
              </li>
              <li>
                <a href="mailto:orvexi@loprok.com" class="footer-link">orvexi@loprok.com</a>
              </li>

            </ul>
          </div>

        </div>

        <div class="footer-bottom">
          <div>&copy; ${currentYear} ORVEXI Technologies Ltd. &mdash; Kigali, Rwanda</div>
          <div class="compliance-badges">
            <span class="badge-tag">TIN 1628324</span>
            <span class="badge-tag">PRIVATE LIMITED</span>
            <span class="badge-tag">RWANDA</span>
          </div>
        </div>
      </div>
    </footer>
  `;
}

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
            <div style="margin-top: 1.25rem;">
              <p class="footer-col-title">Kigali Office</p>
              <div class="office-clocks">
                <div class="clock-card">
                  <span class="clock-city">Kigali (CAT)</span>
                  <span class="clock-time" id="clockKGL">--:--:--</span>
                </div>
                <div class="clock-card">
                  <span class="clock-city">London (GMT)</span>
                  <span class="clock-time" id="clockLON">--:--:--</span>
                </div>
                <div class="clock-card">
                  <span class="clock-city">Dubai (GST)</span>
                  <span class="clock-time" id="clockDXB">--:--:--</span>
                </div>
                <div class="clock-card">
                  <span class="clock-city">Singapore (SGT)</span>
                  <span class="clock-time" id="clockSGP">--:--:--</span>
                </div>
              </div>
            </div>
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
                <a href="mailto:hatheophile2020@yahoo.fr" class="footer-link">hatheophile2020@yahoo.fr</a>
              </li>
              <li style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-subtle);">
                <span style="font-size: 0.75rem; color: var(--text-dim); display:block; margin-bottom:0.2rem;">RDB Certificate</span>
                <span style="font-family: var(--font-mono); font-size: 0.8rem; color: #7b96fb;">No. 1628324</span>
                <span style="font-size: 0.75rem; color: var(--text-dim); display:block; margin-top:0.1rem;">Issued 20 Oct 2025</span>
              </li>
            </ul>
          </div>

        </div>

        <div class="footer-bottom">
          <div>&copy; ${currentYear} ORVEXI Technologies Ltd. &mdash; Kigali, Rwanda</div>
          <div class="compliance-badges">
            <span class="badge-tag">RDB 1628324</span>
            <span class="badge-tag">PRIVATE LIMITED</span>
            <span class="badge-tag">RWANDA</span>
          </div>
        </div>
      </div>
    </footer>
  `;
}

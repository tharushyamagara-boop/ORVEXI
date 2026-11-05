export function renderFooter(settings = {}, contact = {}) {
  const currentYear = new Date().getFullYear();
  const brandName = settings.brandName || 'ORVEXI';
  const logoUrl = settings.logoUrl || '/Logo-WHITE.png';
  const footerText = settings.footerText || 'We deliver technology solutions from Kigali — software, IT consultancy, data hosting, and web services.';
  const address = contact.address || 'Niboye, Kicukiro\nUmujyi wa Kigali, Rwanda';
  const phone = contact.phone || '+250 788 810 675';
  const email = contact.email || 'orvexi@loprok.com';
  const tin = contact.tin || '1628324';

  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">

          <!-- Brand col -->
          <div class="footer-col">
            <div style="margin-bottom: 1rem;">
              <img src="${logoUrl}" alt="${brandName}" class="brand-logo-full" height="34">
            </div>
            <p style="font-size: 0.88rem; max-width: 280px; color: var(--text-muted); line-height: 1.6;">
              ${footerText}
            </p>
          </div>

          <!-- Navigation -->
          <div class="footer-col">
            <h4 class="footer-col-title">Navigation</h4>
            <ul class="footer-links">
              <li><a href="/"             class="footer-link">Home</a></li>
              <li><a href="/about"        class="footer-link">About</a></li>
              <li><a href="/services"     class="footer-link">Services</a></li>
              <li><a href="/portfolio"    class="footer-link">Portfolio</a></li>
              <li><a href="/contact"      class="footer-link">Get in Touch</a></li>
              <li><a href="/privacy"      class="footer-link">Privacy Policy</a></li>
              <li><a href="/unsubscribe"  class="footer-link">Unsubscribe</a></li>
              <li><a href="/sitemap.xml" target="_blank" class="footer-link">Sitemap</a></li>
              <li><a href="/admin"        class="footer-link footer-admin-link" style="opacity: 0.6; display: inline-flex; align-items: center; gap: 0.4rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Admin Portal
              </a></li>
            </ul>
          </div>

          <!-- Services -->
          <div class="footer-col">
            <h4 class="footer-col-title">Services</h4>
            <ul class="footer-links">
              <li><a href="/services" class="footer-link">Software Publishing</a></li>
              <li><a href="/services" class="footer-link">Computer Programming</a></li>
              <li><a href="/services" class="footer-link">IT Consultancy</a></li>
              <li><a href="/services" class="footer-link">Data Processing &amp; Hosting</a></li>
              <li><a href="/services" class="footer-link">Web Portals</a></li>
            </ul>
          </div>

          <!-- Contact details & Support -->
          <div class="footer-col">
            <h4 class="footer-col-title">Contact &amp; Support</h4>
            <ul class="footer-links" style="gap: 0.7rem;">
              <li style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.55;">
                ${address.replace(/\n/g, '<br>')}
              </li>
              <li>
                <a href="tel:${phone.replace(/\s+/g, '')}" class="footer-link">${phone}</a>
              </li>
              <li>
                <a href="mailto:${email}" class="footer-link">${email}</a>
              </li>
              <li style="margin-top: 0.25rem;">
                <a href="/contact" class="footer-link" style="color: var(--brand-blue-light); font-weight: 600;">Help &amp; Support &rarr;</a>
              </li>
            </ul>
          </div>

        </div>

        <div class="footer-bottom">
          <div>&copy; ${currentYear} ${brandName} Technologies Ltd. &mdash; Kigali, Rwanda</div>
          <div class="compliance-badges">
            <span class="badge-tag">TIN ${tin}</span>
            <span class="badge-tag">PRIVATE LIMITED</span>
            <span class="badge-tag">RWANDA</span>
            <a href="/privacy" class="badge-tag" title="Data Protection & Privacy Policy" style="text-decoration: none; color: inherit;">
              🔒 Privacy Policy
            </a>
            <a href="/unsubscribe" class="badge-tag" title="Email Preferences & Opt-Out" style="text-decoration: none; color: inherit;">
              ✉ Unsubscribe
            </a>
            <a href="/sitemap.xml" target="_blank" class="badge-tag" title="XML Sitemap for Search Indexing" style="text-decoration: none; color: inherit;">
              🗺 Sitemap
            </a>
            <a href="/admin" class="badge-tag admin-badge-btn" title="Open Admin Panel" style="cursor: pointer; text-decoration: none; color: inherit;">
              ⚙ Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  `;
}

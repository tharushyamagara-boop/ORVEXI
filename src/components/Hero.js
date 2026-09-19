export function renderHero() {
  return `
    <section class="section hero-section" id="home">
      <div class="container">
        <div class="hero-content reveal active">

          <div class="hero-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            RDB Registered &mdash; Serial No. 1628324
          </div>

          <h1 class="hero-title">
            Technology Solutions<br>
            Built for <em>East Africa</em>
          </h1>

          <p class="hero-subtitle">
            We are a privately registered Rwandan technology company delivering
            software publishing, IT consultancy, data processing and web services
            from Kigali.
          </p>

          <div class="hero-cta-group">
            <a href="#services" class="btn btn-primary">
              <span>Our Services</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#contact" class="btn btn-secondary">Contact Us</a>
          </div>

          <div class="hero-divider"></div>

          <div class="hero-meta">
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Niboye, Kicukiro, Kigali
            </span>
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Incorporated 20 October 2025
            </span>
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Private Limited by Shares
            </span>
          </div>

        </div>
      </div>
    </section>
  `;
}

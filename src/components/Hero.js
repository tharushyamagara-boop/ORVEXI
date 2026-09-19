export function renderHero() {
  return `
    <section class="section hero-section" id="home">
      <!-- Animated background elements -->
      <div class="hero-bg-effects">
        <div class="hero-glow"></div>
        <div class="hero-ring hero-ring-1"></div>
        <div class="hero-ring hero-ring-2"></div>
        <div class="hero-ring hero-ring-3"></div>
        <div class="hero-float-shape hero-shape-1"></div>
        <div class="hero-float-shape hero-shape-2"></div>
        <div class="hero-float-shape hero-shape-3"></div>
        <div class="hero-float-shape hero-shape-4"></div>
        <div class="hero-scan-line"></div>
      </div>

      <div class="container">
        <div class="hero-content reveal active">
          <div class="hero-badge">
            <span class="hero-badge-dot"></span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            RDB Registered &mdash; TIN 1628324
          </div>

          <h1 class="hero-title">
            <span class="hero-title-line hero-anim-1">Technology Solutions</span>
            <span class="hero-title-line hero-anim-2">Built for <em>Africa</em></span>
          </h1>

          <p class="hero-subtitle hero-anim-3">
            A privately registered Rwandan technology company delivering
            software publishing, IT consultancy, data processing, and web
            services from Kigali.
          </p>

          <div class="hero-cta-group hero-anim-4">
            <a href="#services" class="btn btn-primary btn-hero">
              <span>Our Services</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#portfolio" class="btn btn-secondary btn-hero">Explore Portfolio</a>
          </div>
        </div>
    </section>
  `;
}


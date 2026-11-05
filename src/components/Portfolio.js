export function renderPortfolio(portfolioData = {}) {
  const tag = portfolioData.tag || 'Portfolio';
  const title = portfolioData.title || 'Our Work & Live Platforms';
  const desc = portfolioData.desc || 'Explore live digital products, web portals, and software systems designed and deployed by our team.';
  const projects = portfolioData.items || [];

  const cardsHtml = projects.map(p => {
    const tags = Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? p.tags.split(',').map(t => t.trim()) : []);
    const imgUrl = p.image || p.screenshot || '';
    
    let hostname = 'orvexi.rw';
    try {
      if (p.url && p.url.startsWith('http')) {
        hostname = new URL(p.url).hostname;
      }
    } catch (e) {}

    return `
      <div class="portfolio-card reveal">
        <!-- Landscape Website Screenshot (1920x1090) -->
        ${imgUrl ? `
          <div class="portfolio-media">
            <div class="portfolio-browser-header">
              <span class="browser-dot dot-red"></span>
              <span class="browser-dot dot-yellow"></span>
              <span class="browser-dot dot-green"></span>
              <span class="browser-address-pill">${hostname}</span>
            </div>
            <a href="${p.url || '#'}" target="_blank" rel="noopener noreferrer" class="portfolio-screenshot-link" tabindex="-1" aria-label="Visit ${p.title}">
              <img src="${imgUrl}" alt="${p.title} Website Screenshot" class="portfolio-screenshot" loading="lazy">
              <div class="portfolio-screenshot-hover">
                <span class="portfolio-hover-badge">
                  <span>Visit Platform</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </span>
              </div>
            </a>
          </div>
        ` : ''}

        <div class="portfolio-header">
          <span class="portfolio-category">${p.category || 'Platform'}</span>
          ${p.badge && !['Enterprise', 'Flagship Platform', 'National Forum', 'Consulting Dashboard', 'Fintech Application', 'Demo Dashboard'].includes(p.badge) ? `<span class="portfolio-badge-pill">${p.badge}</span>` : ''}
        </div>

        <div class="portfolio-body">
          <h3 class="portfolio-title">
            <a href="${p.url || '#'}" target="_blank" rel="noopener noreferrer" class="portfolio-title-link">
              ${p.title}
              <svg class="portfolio-arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 17l9.2-9.2M17 17V8H8"/>
              </svg>
            </a>
          </h3>
          ${p.subtitle ? `<p class="portfolio-subtitle">${p.subtitle}</p>` : ''}
          <p class="portfolio-desc">${p.desc || ''}</p>
        </div>

        <div class="portfolio-footer">
          <div class="portfolio-tags">
            ${tags.map(t => `<span class="portfolio-tag">${t}</span>`).join('')}
          </div>
          ${p.url ? `
            <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="portfolio-visit-btn">
              <span>${p.btnText || 'Visit'}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="section" id="portfolio">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-tag">${tag}</div>
          <h2 class="section-title">${title}</h2>
          <p class="section-desc">${desc}</p>
        </div>

        <div class="portfolio-grid">
          ${cardsHtml}
        </div>
      </div>
    </section>
  `;
}

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

        <!-- Project Quote & Pricing Box -->
        <div class="portfolio-quote-box">
          <div class="portfolio-quote-meta">
            <span class="portfolio-quote-label">Estimated Quote / Budget</span>
            <span class="portfolio-quote-amount">${p.quote ? p.quote : 'Custom Quote'}</span>
          </div>
          <div class="portfolio-quote-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>Project Baseline</span>
          </div>
        </div>

        <div class="portfolio-footer">
          <div class="portfolio-tags">
            ${tags.map(t => `<span class="portfolio-tag">${t}</span>`).join('')}
          </div>
          
          <div class="portfolio-card-actions">
            ${p.url ? `
              <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="portfolio-visit-btn" title="View live ${p.title} platform">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span>${p.btnText || 'Visit'}</span>
              </a>
            ` : ''}
            <a href="/contact" class="portfolio-order-btn portfolio-order-link" data-project-title="${p.title}" data-project-quote="${p.quote || ''}" data-project-category="${p.category || ''}" title="Order a website or platform similar to ${p.title}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>${p.orderBtnText || 'Order Similar Website'}</span>
            </a>
          </div>
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

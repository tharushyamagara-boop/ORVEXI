export function renderPortfolio(portfolioData = {}) {
  const tag = portfolioData.tag || 'Portfolio';
  const title = portfolioData.title || 'Our Work & Live Platforms';
  const desc = portfolioData.desc || 'Explore live digital products, web portals, and software systems designed and deployed by our team.';
  const projects = portfolioData.items || [];

  const cardsHtml = projects.map(p => {
    const imgUrl = p.image || p.screenshot || '';
    const isQuoteVisible = p.showQuote !== false && Boolean(p.quote && p.quote.trim());
    const hasDiscount = isQuoteVisible && Boolean(p.discountPrice && p.discountPrice.trim());
    const features = Array.isArray(p.features)
      ? p.features.filter(Boolean)
      : (typeof p.features === 'string' ? p.features.split('\n').map(f => f.trim()).filter(Boolean) : []);

    return `
      <div class="portfolio-card reveal">
        <!-- Landscape Website Screenshot (1920x1090) -->
        ${imgUrl ? `
          <div class="portfolio-media">
            <div class="portfolio-browser-header">
              <span class="browser-dot dot-red"></span>
              <span class="browser-dot dot-yellow"></span>
              <span class="browser-dot dot-green"></span>
            </div>
            <a href="${p.url || '#'}" target="_blank" rel="noopener noreferrer" class="portfolio-screenshot-link" tabindex="-1" aria-label="Visit ${p.title}">
              <img src="${imgUrl}" alt="${p.title} Website Screenshot" class="portfolio-screenshot" width="800" height="500" loading="lazy">
              <div class="portfolio-screenshot-hover">
                <span class="portfolio-hover-badge">
                  <span>Visit Platform</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </span>
              </div>
            </a>
          </div>
        ` : ''}

        <div class="portfolio-body">
          <div class="portfolio-title-row">
            <h3 class="portfolio-title">
              <a href="${p.url || '#'}" target="_blank" rel="noopener noreferrer" class="portfolio-title-link">
                ${p.title}
                <svg class="portfolio-arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 17l9.2-9.2M17 17V8H8"/>
                </svg>
              </a>
            </h3>
            ${isQuoteVisible ? `
              <div class="portfolio-card-price ${hasDiscount ? 'has-discount' : ''}">
                <span class="portfolio-price-label">
                  ${hasDiscount ? `<span class="portfolio-discount-badge">${p.discountBadge || 'Sale'}</span> Offer Price` : 'Price'}
                </span>
                <div class="portfolio-price-group">
                  ${hasDiscount ? `
                    <span class="portfolio-price-original" title="Original Price: ${p.quote}"><s>${p.quote}</s></span>
                    <span class="portfolio-price-val portfolio-price-discounted">${p.discountPrice}</span>
                  ` : `
                    <span class="portfolio-price-val">${p.quote}</span>
                  `}
                </div>
              </div>
            ` : ''}
          </div>
          <p class="portfolio-desc">${p.desc || ''}</p>

          ${features.length > 0 ? `
            <div class="portfolio-features">
              <ul class="portfolio-features-list">
                ${features.map(f => `
                  <li class="portfolio-feature-item">
                    <svg class="portfolio-feature-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>${f}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <div class="portfolio-footer">
          <div class="portfolio-card-actions">
            ${p.url ? `
              <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="portfolio-visit-btn" title="Visit ${p.title}" aria-label="Visit live platform for ${p.title}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span>${p.btnText || 'Visit'}</span>
              </a>
            ` : ''}
            <a href="/contact" class="portfolio-order-btn portfolio-order-link" data-project-title="${p.title}" data-project-quote="${hasDiscount ? `${p.discountPrice} (Discounted from ${p.quote})` : (p.quote || '')}" data-project-category="${p.category || ''}" title="Get a website similar to ${p.title}" aria-label="Order website similar to ${p.title}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>${p.orderBtnText && p.orderBtnText !== 'Order Similar Website' ? p.orderBtnText : 'Get Similar'}</span>
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

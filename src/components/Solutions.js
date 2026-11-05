export function renderServices(servicesData = {}) {
  const tag = servicesData.tag || 'Services';
  const title = servicesData.title || 'Registered Business Activities';
  const desc = servicesData.desc || 'The following services are formally registered with the Rwanda Development Board as our authorised business activities (effective 30 July 2025).';
  const services = servicesData.items || [];

  const cardsHtml = services.map(s => `
    <div class="service-card reveal">
      <h3 class="service-title">${s.title}</h3>
      <p class="service-desc">${s.desc}</p>
      <a href="#get-in-touch" class="service-request-link" data-service="${s.title}">
        <span>Request Service</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </a>
    </div>
  `).join('');

  return `
    <section class="section services-section" id="services">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-tag">${tag}</div>
          <h2 class="section-title">${title}</h2>
          <p class="section-desc">${desc}</p>
        </div>

        <div class="services-grid">
          ${cardsHtml}
        </div>
      </div>
    </section>
  `;
}

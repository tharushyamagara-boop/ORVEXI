export function renderAbout(aboutData = {}) {
  const tag = aboutData.tag || 'About Us';
  const title = aboutData.title || 'Company Overview';
  const desc = aboutData.desc || 'We are a privately incorporated Rwandan technology company, registered with the Rwanda Development Board and engaged in software and IT services.';
  const paragraphs = aboutData.paragraphs || [
    'We were incorporated on <strong>20 October 2025</strong> under Rwandan company law as a private company limited by shares, with our registered office in Niboye, Kicukiro, Umujyi wa Kigali.',
    'Our primary business activity is <strong>Software Publishing</strong> (RDB code J5820), complemented by a range of computer programming, IT consultancy, data processing, and web portal services.'
  ];
  const photo = aboutData.officePhoto || '/images/about_office.jpg';
  const badge = aboutData.officeBadge || 'Kigali Innovation Hub • Rwanda';
  const reg = aboutData.registration || {
    tin: '1628324',
    date: '20 October 2025',
    type: 'Private — Limited by Shares',
    address: 'Niboye, Kicukiro\nUmujyi wa Kigali, Rwanda',
    director: 'Theophile HARUSHYAMAGARA'
  };

  const paragraphsHtml = paragraphs.map(p => `<p>${p}</p>`).join('');

  return `
    <section class="section" id="about">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-tag">${tag}</div>
          <h2 class="section-title">${title}</h2>
          <p class="section-desc">${desc}</p>
        </div>

        <div class="about-grid">
          <!-- Left: narrative -->
          <div class="about-intro reveal">
            ${paragraphsHtml}
          </div>

          <!-- Right: Visual Office Photo -->
          <div class="about-side-col reveal">
            <div class="about-photo-card">
              <img src="${photo}" alt="ORVEXI Technology Workspace in Kigali" class="about-photo" loading="lazy">
              <div class="about-photo-overlay">
                <div class="about-photo-badge">
                  <span class="photo-pulse-dot"></span>
                  <span>${badge}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderPortfolio() {
  const projects = [
    {
      id: "loprok",
      title: "LopRok",
      subtitle: "Music Creator & Streaming Studio",
      category: "Media & Creator Platform",
      desc: "Comprehensive digital studio and social platform for artists, producers, and beatmakers. Enables creators to stream instrumentals, record vocals, share beats, and collaborate worldwide.",
      url: "https://loprok.com/home",
      tags: ["Next.js", "PWA", "Live Audio Streaming", "Mobile Studio"],
      badge: "Flagship Platform",
      btnText: "Visit"
    },
    {
      id: "sanex",
      title: "SANEX Core",
      subtitle: "Liquid Waste & Sanitation Systems",
      category: "Environmental & Sanitation Tech",
      desc: "Specialized enterprise web platform powering sustainable liquid waste management, decentralized wastewater treatment monitoring, and professional sanitation logistics across Rwanda.",
      url: "https://sanex.rw/",
      tags: ["Enterprise Web", "Environmental Systems", "Operations Tracker"],
      badge: "Enterprise",
      btnText: "Visit"
    },
    {
      id: "asserwa",
      title: "ASSERWA",
      subtitle: "Forum of Sewage Emptiers in Rwanda",
      category: "Institutional & Industry Portal",
      desc: "Official institutional web platform uniting Rwanda's professional sewage emptiers and sanitation service providers. Features certified member directories, compliance frameworks, and national advocacy initiatives.",
      url: "https://asserwa.com/",
      tags: ["Member Directory", "Institutional Portal", "Governance"],
      badge: "National Forum",
      btnText: "Visit"
    },
    {
      id: "equiterra",
      title: "Equiterra Consulting",
      subtitle: "Multi-Sectoral Advisory Dashboard",
      category: "Analytics & Strategic Advisory",
      desc: "Executive consultancy analytics platform delivering data-driven insights, capacity-building intelligence, and strategic advisory across climate change finance, universal health systems, and public governance.",
      url: "https://equiterraconsulting.com/",
      tags: ["Analytics Dashboard", "Strategic Intelligence", "SDGs & Climate"],
      badge: "Consulting Dashboard",
      btnText: "Visit"
    },
    {
      id: "tontine",
      title: "Ikimina (SCDT Tontine)",
      subtitle: "Cooperative Savings & Loan App",
      category: "Fintech & Cooperative Savings",
      desc: "Cloud-hosted community microfinance system designed to track cooperative tontine contribution cycles, member balances, rotating savings, and group loan distributions seamlessly.",
      url: "https://studio--studio-1670844393-18cbb.us-central1.hosted.app/",
      tags: ["Cloud Hosted", "Microfinance App", "Cooperative Tontine"],
      badge: "Fintech Application",
      btnText: "Live Demo"
    },
    {
      id: "nbs-dashboard",
      title: "SUNCASA Kigali (NbS)",
      subtitle: "Nature-Based Solutions Impact Dashboard",
      category: "Environmental & Climate Analytics",
      desc: "Interactive environmental impact PWA and GIS dashboard communicating Nature-based Solutions (NbS) across the Lower Nyabarongo watershed, tracking terracing, afforestation, flood resilience, and green employment.",
      url: "https://nbs-455962--nbs-project-7deac.us-central1.hosted.app/",
      tags: ["Impact Dashboard", "GIS Mapping", "PWA", "Climate Analytics"],
      badge: "Demo Dashboard",
      btnText: "Live Demo"
    }
  ];

  const cardsHtml = projects.map(p => `
    <div class="portfolio-card reveal">
      <div class="portfolio-header">
        <span class="portfolio-category">${p.category}</span>
        <span class="portfolio-badge-pill">${p.badge}</span>
      </div>

      <div class="portfolio-body">
        <h3 class="portfolio-title">
          <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="portfolio-title-link">
            ${p.title}
            <svg class="portfolio-arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 17l9.2-9.2M17 17V8H8"/>
            </svg>
          </a>
        </h3>
        <p class="portfolio-subtitle">${p.subtitle}</p>
        <p class="portfolio-desc">${p.desc}</p>
      </div>

      <div class="portfolio-footer">
        <div class="portfolio-tags">
          ${p.tags.map(t => `<span class="portfolio-tag">${t}</span>`).join('')}
        </div>
        <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="portfolio-visit-btn">
          <span>${p.btnText}</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
      </div>
    </div>
  `).join('');

  return `
    <section class="section" id="portfolio">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-tag">Portfolio</div>
          <h2 class="section-title">Our Work &amp; Live Platforms</h2>
          <p class="section-desc">
            Explore live digital products, web portals, and software systems designed and deployed by our team.
          </p>
        </div>

        <div class="portfolio-grid">
          ${cardsHtml}
        </div>
      </div>
    </section>
  `;
}

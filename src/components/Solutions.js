export function renderServices() {
  const services = [
    {
      code: 'J5820',
      title: 'Software Publishing',
      desc: 'Development and publishing of software products, including licensing, distribution, and maintenance of proprietary software applications.',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
             </svg>`,
      primary: true
    },
    {
      code: 'J6201',
      title: 'Computer Programming Activities',
      desc: 'Custom software design, coding, testing, and maintenance services tailored to client requirements across web, mobile, and desktop platforms.',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
             </svg>`,
      primary: false
    },
    {
      code: 'J6202',
      title: 'IT Consultancy & Facilities Management',
      desc: 'Professional advisory on IT infrastructure planning, systems architecture, and management of client computer facilities and technology environments.',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
             </svg>`,
      primary: false
    },
    {
      code: 'J6209',
      title: 'Other IT & Computer Services',
      desc: 'Supplementary technology services including system integration, technical support, IT training, and other computer-related professional activities.',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
             </svg>`,
      primary: false
    },
    {
      code: 'J6311',
      title: 'Data Processing & Hosting',
      desc: 'Management and processing of client data, cloud hosting solutions, database administration, and related data infrastructure services.',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
             </svg>`,
      primary: false
    },
    {
      code: 'J6312',
      title: 'Web Portals',
      desc: 'Design, development, and management of web portals and online platforms that aggregate content and provide internet-based services to users.',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
             </svg>`,
      primary: false
    }
  ];

  const cardsHtml = services.map(s => `
    <div class="service-card ${s.primary ? 'primary-activity' : ''} reveal">
      <div class="service-icon">${s.icon}</div>
      ${s.primary ? '<span class="service-tag">Main Activity</span>' : ''}
      <div class="service-code">${s.code}</div>
      <h3 class="service-title">${s.title}</h3>
      <p class="service-desc">${s.desc}</p>
    </div>
  `).join('');

  return `
    <section class="section services-section" id="services">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-tag">Services</div>
          <h2 class="section-title">Registered Business Activities</h2>
          <p class="section-desc">
            The following services are formally registered with the Rwanda Development Board
            as our authorised business activities (effective 30 July 2025).
          </p>
        </div>

        <div class="services-grid">
          ${cardsHtml}
        </div>
      </div>
    </section>
  `;
}

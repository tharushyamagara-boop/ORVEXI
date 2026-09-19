export function renderMetrics() {
  const brands = [
    { name: "NEXUS CAPITAL", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
    { name: "APEX DYNAMICS", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
    { name: "VORTEX CLOUD", icon: "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" },
    { name: "HYPERION BIO", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
    { name: "QUANTUM SYSTEMS", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
    { name: "TITAN DEFENSE", icon: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A7.003 7.003 0 0 1 5.07 11H5a1 1 0 0 1 0-2h.07A7.003 7.003 0 0 1 11 5.07V5a1 1 0 0 1 2 0v.07A7.003 7.003 0 0 1 18.93 11H19a1 1 0 0 1 0 2h-.07A7.003 7.003 0 0 1 13 16.93z" }
  ];

  const brandItemsHtml = brands.map(b => `
    <div class="marquee-item">
      <svg class="marquee-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="${b.icon}"/>
      </svg>
      <span>${b.name}</span>
    </div>
  `).join('');

  return `
    <section class="metrics-section" aria-label="Enterprise Trust & Partnerships">
      <div class="marquee-container">
        <div class="marquee-track">
          ${brandItemsHtml}
          ${brandItemsHtml}
        </div>
      </div>
    </section>
  `;
}

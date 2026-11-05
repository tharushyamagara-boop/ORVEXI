export function renderContact(contactData = {}) {
  const address = contactData.address || 'Niboye, Kicukiro\nUmujyi wa Kigali, Rwanda';
  const phone = contactData.phone || '+250 788 810 675';
  const email = contactData.email || 'orvexi@loprok.com';
  const tin = contactData.tin || '1628324';
  const rraLink = contactData.rraLink || 'https://etax.rra.gov.rw/nidAssignedTIN/';

  const tag = contactData.tag || 'Service Requests & Contact';
  const title = contactData.title || 'Request a Service or Consultation';
  const desc = contactData.desc || 'Submit a service request, schedule a technical consultation, or reach out to our team in Kigali.';
  const submitBtnText = contactData.submitBtnText || 'Submit Service Request';
  const successTitle = contactData.successTitle || 'Service Request Submitted';
  const successDesc = contactData.successDesc || 'Thank you! Your request has been queued in our operations management pipeline. Our team will review your requirements and get in touch to confirm your appointment.';

  const defaultServices = [
    'Software Publishing & Custom Development',
    'Computer Programming Activities',
    'IT Consultancy & Systems Advisory',
    'Data Processing & Cloud Infrastructure',
    'Web Portals & Enterprise Platforms',
    'General Technical Consultation'
  ];
  const servicesList = (Array.isArray(contactData.services) && contactData.services.length > 0)
    ? contactData.services
    : defaultServices;

  const servicesOptionsHtml = servicesList.map(s => {
    const val = typeof s === 'string' ? s.trim() : (s.name || s.title || '');
    return `<option value="${val}">${val}</option>`;
  }).join('');

  const defaultChannels = [
    'Website Direct',
    'Google Search',
    'LinkedIn',
    'Referral / Partner',
    'Client Recommendation',
    'Other'
  ];
  const channelsList = (Array.isArray(contactData.channels) && contactData.channels.length > 0)
    ? contactData.channels
    : defaultChannels;

  const channelsOptionsHtml = channelsList.map(ch => {
    const val = typeof ch === 'string' ? ch.trim() : '';
    const isSelected = val.toLowerCase().includes('google') ? 'selected' : '';
    return `<option value="${val}" ${isSelected}>${val}</option>`;
  }).join('');

  const defaultTimeSlots = [
    'Morning (09:00 - 12:00)',
    'Afternoon (12:00 - 16:00)',
    'Late Afternoon (16:00 - 18:00)',
    'Flexible / Any Time'
  ];
  const timeSlotsList = (Array.isArray(contactData.timeSlots) && contactData.timeSlots.length > 0)
    ? contactData.timeSlots
    : defaultTimeSlots;

  const timeSlotsOptionsHtml = timeSlotsList.map((slot, idx) => {
    const val = typeof slot === 'string' ? slot.trim() : '';
    const isSelected = idx === 1 ? 'selected' : '';
    return `<option value="${val}" ${isSelected}>${val}</option>`;
  }).join('');

  const todayStr = new Date().toISOString().slice(0, 10);

  return `
    <section class="section" id="contact" data-alias="get-in-touch">
      <!-- Hidden anchor to ensure backwards compatibility with #get-in-touch -->
      <div id="get-in-touch" style="position:relative; top:-90px; visibility:hidden; pointer-events:none;"></div>
      <div class="container">
        <div class="section-header reveal">
          <div class="section-tag">${tag}</div>
          <h2 class="section-title">${title}</h2>
          <p class="section-desc">${desc}</p>
        </div>

        <div class="contact-grid">
          <!-- Left (Mobile 1st): Interactive Service Request & Appointment Booking Form -->
          <div class="reveal contact-form-col">
            <div class="contact-form-card">
              <div id="contactFormContainer">
                <form id="contactForm" novalidate>
                  <div class="form-row-2">
                    <div class="form-field">
                      <label class="form-label" for="contactName">Full Name *</label>
                      <input type="text" id="contactName" class="form-input" placeholder="e.g. Theophile Harushyamagara" required>
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="contactPhone">Phone Number *</label>
                      <input type="tel" id="contactPhone" class="form-input" placeholder="e.g. +250 788 810 675" required>
                    </div>
                  </div>

                  <div class="form-row-2">
                    <div class="form-field">
                      <label class="form-label" for="contactEmail">Email Address *</label>
                      <input type="email" id="contactEmail" class="form-input" placeholder="you@company.com" required>
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="bookingChannel">How Did You Hear About Us?</label>
                      <select id="bookingChannel" class="form-select">
                        ${channelsOptionsHtml}
                      </select>
                    </div>
                  </div>

                  <div class="form-field">
                    <label class="form-label" for="bookingService">Requested Service *</label>
                    <select id="bookingService" class="form-select" required>
                      <option value="">-- Choose Registered Business Service --</option>
                      ${servicesOptionsHtml}
                    </select>
                  </div>

                  <div class="form-row-2">
                    <div class="form-field">
                      <label class="form-label" for="bookingDate">Preferred Appointment Date *</label>
                      <input type="date" id="bookingDate" class="form-input" min="${todayStr}" value="${todayStr}" required>
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="bookingTimeSlot">Preferred Time Slot</label>
                      <select id="bookingTimeSlot" class="form-select">
                        ${timeSlotsOptionsHtml}
                      </select>
                    </div>
                  </div>

                  <div class="form-field">
                    <label class="form-label" for="contactMessage">Project Scope &amp; Requirements *</label>
                    <textarea id="contactMessage" class="form-textarea" rows="3" placeholder="Describe your software objectives, scale, timeline, or technical requirements..." required></textarea>
                  </div>

                  <div class="form-field">
                    <label class="form-label" for="bookingLocationUrl">Project Document / Location Link (Optional)</label>
                    <input type="url" id="bookingLocationUrl" class="form-input" placeholder="https://... (e.g. Google Drive, Figma, GitHub, or location)">
                  </div>

                  <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.85rem;" id="contactSubmitBtn">
                    <span>${submitBtnText}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </form>
              </div>

              <!-- Success Card -->
              <div class="form-success" id="contactSuccess" style="display:none; text-align:left; padding:1.5rem; background:rgba(24,150,234,0.06); border:1px solid rgba(24,150,234,0.25); border-radius:var(--radius-md);">
                <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                  <div style="width:40px; height:40px; border-radius:50%; background:rgba(16,185,129,0.15); color:#10b981; display:flex; align-items:center; justify-content:center; font-size:1.3rem;">✓</div>
                  <div>
                    <h4 style="font-size:1.1rem; color:#fff; margin:0;">${successTitle}</h4>
                    <span style="font-size:0.8rem; color:#10b981; font-weight:600;">STATUS: PENDING REVIEW</span>
                  </div>
                </div>

                <div style="background:rgba(7,9,15,0.7); border-radius:6px; padding:1rem; margin-bottom:1rem; font-size:0.84rem; line-height:1.6; border:1px solid rgba(255,255,255,0.06);">
                  <div><strong>Reference Code:</strong> <span id="successRefCode" style="font-family:var(--font-mono); color:var(--brand-blue-light);">ORV-2026-081</span></div>
                  <div><strong>Service:</strong> <span id="successService">-</span></div>
                  <div><strong>Preferred Appointment:</strong> <span id="successAppointment">-</span></div>
                </div>

                <p style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:1rem; line-height:1.45;">
                  ${successDesc}
                </p>

                <button type="button" class="btn btn-secondary btn-sm" id="bookAnotherBtn" style="width:100%; justify-content:center;">
                  Submit Another Request
                </button>
              </div>
            </div>
          </div>

          <!-- Right (Mobile 2nd): Contact Details & Compliance -->
          <div class="contact-info reveal">
            <div class="contact-detail">
              <div class="contact-detail-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="contact-detail-body">
                <span class="contact-detail-label">Registered Address</span>
                <span class="contact-detail-value">
                  ${address.replace(/\n/g, '<br>')}
                </span>
              </div>
            </div>

            <div class="contact-detail">
              <div class="contact-detail-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div class="contact-detail-body">
                <span class="contact-detail-label">Phone</span>
                <span class="contact-detail-value">
                  <a href="tel:${phone.replace(/\s+/g, '')}">${phone}</a>
                </span>
              </div>
            </div>

            <div class="contact-detail">
              <div class="contact-detail-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div class="contact-detail-body">
                <span class="contact-detail-label">Email</span>
                <span class="contact-detail-value">
                  <a href="mailto:${email}">${email}</a>
                </span>
              </div>
            </div>

            <div class="contact-detail">
              <div class="contact-detail-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div class="contact-detail-body">
                <span class="contact-detail-label">TIN Number</span>
                <span class="contact-detail-value" style="font-family: var(--font-mono); font-size: 0.88rem;">
                  <a href="${rraLink}" target="_blank" rel="noopener noreferrer">${tin}</a>
                </span>
              </div>
            </div>

            <div class="rdb-verify">
              <p class="rdb-verify-text">
                Verify our TIN on the Rwanda Revenue Authority (RRA) portal using
                <strong>TIN Number ${tin}</strong>.
              </p>
              <a href="${rraLink}" target="_blank" rel="noopener noreferrer">
                Verify on RRA Portal
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderContact() {
  return `
    <section class="section" id="contact">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-tag">Contact</div>
          <h2 class="section-title">Get in Touch</h2>
          <p class="section-desc">
            Reach out to discuss how we can support your technology needs.
          </p>
        </div>

        <div class="contact-grid">
          <!-- Contact details -->
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
                  Niboye, Kicukiro<br>
                  Umujyi wa Kigali, Rwanda
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
                  <a href="tel:+250788810675">+250 788 810 675</a>
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
                  <a href="mailto:orvexi@loprok.com">orvexi@loprok.com</a>
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
                <span class="contact-detail-label">RDB Registration</span>
                <span class="contact-detail-value" style="font-family: var(--font-mono); font-size: 0.88rem;">
                  Serial No. 1628324
                </span>
              </div>
            </div>

            <div class="rdb-verify">
              <p class="rdb-verify-text">
                Verify our certificate on the Rwanda Development Board portal using
                <strong>Serial No. 1628324</strong>.
              </p>
              <a href="http://www.rdb.rw/" target="_blank" rel="noopener noreferrer">
                Verify at RDB
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Contact form -->
          <div class="reveal">
            <div class="contact-form-card">
              <h3>Send a Message</h3>
              <div id="contactFormContainer">
                <form id="contactForm" novalidate>
                  <div class="form-field">
                    <label class="form-label" for="contactName">Full Name *</label>
                    <input type="text" id="contactName" class="form-input" placeholder="Your name" required>
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="contactEmail">Email Address *</label>
                    <input type="email" id="contactEmail" class="form-input" placeholder="you@example.com" required>
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="contactSubject">Subject</label>
                    <input type="text" id="contactSubject" class="form-input" placeholder="How can we help?">
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="contactMessage">Message *</label>
                    <textarea id="contactMessage" class="form-textarea" rows="4" placeholder="Tell us about your project or enquiry&hellip;" required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary" style="width:100%;" id="contactSubmitBtn">
                    <span>Send Message</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </form>
              </div>

              <div class="form-success" id="contactSuccess">
                <svg class="form-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <h4>Message Sent</h4>
                <p>Thank you for reaching out. We will get back to you shortly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

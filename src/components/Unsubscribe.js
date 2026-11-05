export function renderUnsubscribePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const prefilledEmail = urlParams.get('email') || '';

  return `
    <div class="legal-page-container">
      <div class="legal-page-header">
        <a href="#home" class="legal-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 19"></polyline></svg>
          <span>Return to Homepage</span>
        </a>
        <div class="section-tag" style="margin-top: 1rem;">Communication Preferences</div>
        <h1 class="legal-page-title">Manage Email Preferences</h1>
        <p class="legal-page-subtitle">
          We respect your inbox. You can update your subscription preferences or opt out of outbound email communications from ORVEXI Limited below.
        </p>
      </div>

      <div class="legal-card" style="max-width: 640px; margin: 0 auto;">
        
        <div id="unsubFormContainer">
          <form id="unsubscribeForm" novalidate>
            <div class="form-field" style="margin-bottom: 1.25rem;">
              <label class="form-label" for="unsubEmail">Your Email Address *</label>
              <input 
                type="email" 
                id="unsubEmail" 
                class="form-input" 
                placeholder="you@company.com" 
                value="${prefilledEmail}" 
                required
              >
              <span style="font-size: 0.76rem; color: var(--text-dim); margin-top: 0.25rem; display: block;">
                Enter the email address at which you received our communication.
              </span>
            </div>

            <div class="form-field" style="margin-bottom: 1.5rem;">
              <label class="form-label" style="margin-bottom: 0.75rem;">Select Your Communication Preference</label>
              
              <div class="pref-option">
                <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer;">
                  <input type="radio" name="unsubOption" value="marketing" checked style="margin-top: 0.25rem; accent-color: var(--brand-blue-light);">
                  <div>
                    <strong style="color: #fff; font-size: 0.95rem; display: block;">Unsubscribe from Promotional &amp; Technology Newsletters</strong>
                    <span style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45; display: block; margin-top: 0.2rem;">
                      You will no longer receive announcements, platform releases, or technical newsletters, but will still receive essential appointment confirmations and direct project correspondence.
                    </span>
                  </div>
                </label>
              </div>

              <div class="pref-option" style="margin-top: 0.85rem;">
                <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer;">
                  <input type="radio" name="unsubOption" value="all" style="margin-top: 0.25rem; accent-color: var(--brand-blue-light);">
                  <div>
                    <strong style="color: #fff; font-size: 0.95rem; display: block;">Unsubscribe from All Communications (Complete Opt-Out)</strong>
                    <span style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45; display: block; margin-top: 0.2rem;">
                      Permanently remove your email address from all ORVEXI automated systems and lists.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div class="form-field" style="margin-bottom: 1.5rem;">
              <label class="form-label" for="unsubReason">Optional Feedback (Help Us Improve)</label>
              <select id="unsubReason" class="form-select">
                <option value="">-- Choose reason (optional) --</option>
                <option value="Too many emails">Emails are too frequent</option>
                <option value="Not relevant">Content is no longer relevant to my business</option>
                <option value="Did not sign up">I never signed up for this communication</option>
                <option value="Prefer direct phone">I prefer direct phone or WhatsApp contact</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary" id="unsubSubmitBtn" style="width: 100%; justify-content: center; padding: 0.85rem 1.5rem;">
              <span>Confirm &amp; Update Preferences</span>
            </button>
          </form>
        </div>

        <!-- Success Confirmation State -->
        <div id="unsubSuccessState" style="display: none; text-align: center; padding: 2rem 1rem;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem auto; font-size: 1.5rem;">
            ✓
          </div>
          <h2 style="font-size: 1.4rem; color: #ffffff; margin-bottom: 0.5rem;">Preferences Updated Successfully</h2>
          <p style="font-size: 0.92rem; color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.5rem auto; line-height: 1.6;">
            Your email address (<strong id="confirmedUnsubEmail" style="color: var(--brand-blue-light);"></strong>) has been updated in our records. Please allow up to 24 hours for all queued dispatches to synchronize.
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <a href="#home" class="btn btn-primary btn-sm">Return to Homepage</a>
            <a href="#get-in-touch" class="btn btn-secondary btn-sm">Need Help? Contact Us</a>
          </div>
        </div>

      </div>

      <div style="max-width: 640px; margin: 1.5rem auto 0 auto; text-align: center; font-size: 0.82rem; color: var(--text-muted); line-height: 1.5;">
        You can also review our <a href="#privacy" style="color: var(--brand-blue-light); text-decoration: underline;">Privacy Policy</a> or reach out to our team at <a href="mailto:ceo@orvexi.rw" style="color: var(--brand-blue-light);">ceo@orvexi.rw</a>.
      </div>
    </div>
  `;
}

export function initUnsubscribeEvents() {
  const form = document.getElementById('unsubscribeForm');
  const formContainer = document.getElementById('unsubFormContainer');
  const successState = document.getElementById('unsubSuccessState');
  const emailInput = document.getElementById('unsubEmail');
  const confirmedEmailEl = document.getElementById('confirmedUnsubEmail');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput?.value.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      emailInput?.focus();
      return;
    }

    const selectedOption = form.querySelector('input[name="unsubOption"]:checked')?.value || 'marketing';
    const reason = document.getElementById('unsubReason')?.value || '';

    // Record unsubscribe preference in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('orvexi_unsubscribed_emails_v1') || '[]');
      existing.push({
        email,
        option: selectedOption,
        reason,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('orvexi_unsubscribed_emails_v1', JSON.stringify(existing));
    } catch (err) {
      console.warn('Could not save to localStorage:', err);
    }

    // Toggle view
    if (formContainer && successState) {
      formContainer.style.display = 'none';
      if (confirmedEmailEl) confirmedEmailEl.textContent = email;
      successState.style.display = 'block';
    }
  });
}

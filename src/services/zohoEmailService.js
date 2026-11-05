// Zoho CPaaS & ZeptoMail Email Dispatch Service
// Dispatches transactional emails and bulk outbound newsletters
// via Zoho REST API (https://cpaas.zoho.com/v1.1/email) with ceo@orvexi.rw sender.

const ZOHO_CONFIG_KEY = 'orvexi_zoho_config_v1';

export const DEFAULT_ZOHO_CONFIG = {
  senderEmail: 'ceo@orvexi.rw',
  senderName: 'ORVEXI LTD',
  host: 'cpaas.zoho.com',
  endpoint: 'https://cpaas.zoho.com/v1.1/email',
  agentAlias: '1791ea76b71e26a9',
  apiKey: 'Zoho-enczapikey wSsVR60i+UP1Cf95mjWqJe5pkVpUBw7wE0t8igel6SD0S6iW8MczkBadUQCiGfgXGGdtHDIRorkpyRlShjVfh9wvyF8HWyiF9mqRe1U4J3x17qnvhDzKWGRVlhaML4kJxQttm2JjFMkl+g==',
  smtpHost: 'smtp.zeptomail.com',
  smtpPorts: '465 (SSL), 587 (TLS)',
  smtpUsername: 'emailapikey',
  lastVerifiedAt: new Date().toISOString()
};

class ZohoEmailService {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const stored = localStorage.getItem(ZOHO_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_ZOHO_CONFIG,
          ...parsed,
          apiKey: (parsed.apiKey && parsed.apiKey.trim().length > 10) ? parsed.apiKey.trim() : DEFAULT_ZOHO_CONFIG.apiKey
        };
      }
    } catch (e) {}
    return { ...DEFAULT_ZOHO_CONFIG };
  }

  saveConfig(updates) {
    this.config = { ...this.config, ...updates };
    try {
      localStorage.setItem(ZOHO_CONFIG_KEY, JSON.stringify(this.config));
    } catch (e) {}
    return this.config;
  }

  getConfig() {
    return { ...this.config };
  }

  isConfigured() {
    return Boolean(this.config.apiKey && this.config.apiKey.trim().length > 5);
  }

  /**
   * Format a list of email strings into Zoho CPaaS recipient objects:
   * [{ email_address: { address: '...', name: '...' } }]
   */
  formatRecipients(recipientsList, namesMap = {}) {
    if (!Array.isArray(recipientsList)) return [];

    return recipientsList
      .map(r => (typeof r === 'string' ? r.trim() : r.email || '').toLowerCase())
      .filter(email => email.includes('@'))
      .map(email => {
        const name = namesMap[email] || email.split('@')[0];
        return {
          email_address: {
            address: email,
            name: name
          }
        };
      });
  }

  /**
   * Send single or bulk email through the Zoho CPaaS API endpoint
   */
  async sendEmail({ to, subject, html, fromName = null, cc = null, bcc = null }) {
    const config = this.getConfig();

    if (!config.apiKey || !config.apiKey.trim()) {
      throw new Error(
        'Zoho API Key is not configured. Please enter your Zoho-enczapikey in Admin Settings or Send Email tab.'
      );
    }

    // Convert to recipient objects
    let toPayload = [];
    if (Array.isArray(to)) {
      if (to.length > 0 && typeof to[0] === 'object' && to[0].email_address) {
        toPayload = to;
      } else {
        toPayload = this.formatRecipients(to);
      }
    } else if (typeof to === 'string') {
      toPayload = this.formatRecipients([to]);
    }

    if (toPayload.length === 0) {
      throw new Error('No valid recipient email addresses provided.');
    }

    const payload = {
      apiKey: config.apiKey.trim(),
      from: {
        address: config.senderEmail || 'ceo@orvexi.rw',
        name: fromName || config.senderName || 'ORVEXI LTD'
      },
      to: toPayload,
      subject: subject || 'ORVEXI Announcement',
      htmlbody: html || '<div>Official message from ORVEXI LTD.</div>'
    };

    if (cc && Array.isArray(cc) && cc.length > 0) {
      payload.cc = this.formatRecipients(cc);
    }
    if (bcc && Array.isArray(bcc) && bcc.length > 0) {
      payload.bcc = this.formatRecipients(bcc);
    }

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Handle Zoho CPaaS specific error responses
        const errorMsg = result.message || 
          (result.error && result.error.message) || 
          result.error || 
          `Zoho API Error (HTTP ${response.status})`;
        throw new Error(errorMsg);
      }

      this.saveConfig({ lastVerifiedAt: new Date().toISOString() });
      return {
        success: true,
        data: result,
        recipientCount: toPayload.length,
        sender: payload.from.address
      };
    } catch (err) {
      console.error('Zoho Email Service Error:', err);
      throw err;
    }
  }

  /**
   * Dispatch full outbound campaign
   */
  async sendCampaign({ recipients, subject, html, organizationName = '' }) {
    const config = this.getConfig();

    const distinct = Array.from(new Set(
      (recipients || [])
        .map(r => (typeof r === 'string' ? r.trim() : r.email || '').toLowerCase())
        .filter(e => e.includes('@'))
    ));

    if (distinct.length === 0) {
      throw new Error('Please specify at least one recipient email address.');
    }

    // Zoho CPaaS allows up to 50 recipients per single call.
    // For larger lists, split into chunks of 50.
    const CHUNK_SIZE = 50;
    const chunks = [];
    for (let i = 0; i < distinct.length; i += CHUNK_SIZE) {
      chunks.push(distinct.slice(i, i + CHUNK_SIZE));
    }

    const results = [];
    for (const chunk of chunks) {
      const res = await this.sendEmail({
        to: chunk,
        subject,
        html,
        fromName: organizationName || config.senderName || 'ORVEXI LTD'
      });
      results.push(res);
    }

    return {
      success: true,
      totalDispatched: distinct.length,
      chunksCount: chunks.length,
      sender: config.senderEmail || 'ceo@orvexi.rw',
      results
    };
  }

  /**
   * Send a test verification email to confirm credentials
   */
  async sendTestEmail(targetEmail = 'ceo@orvexi.rw') {
    const config = this.getConfig();
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>ORVEXI Email Verification</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#07090f; color:#ffffff; padding:2rem;">
        <div style="max-width:560px; margin:0 auto; background:#0b101f; border:1px solid rgba(132,204,22,0.3); border-radius:10px; padding:2rem;">
          <div style="text-align:center; margin-bottom:1.5rem;">
            <h1 style="color:#84cc16; font-size:1.4rem; margin:0 0 0.5rem;">✓ Zoho CPaaS Integration Verified</h1>
            <p style="color:#94a3b8; font-size:0.88rem; margin:0;">Outbound email service is live and properly connected.</p>
          </div>
          <div style="background:rgba(255,255,255,0.03); border-radius:8px; padding:1rem; font-size:0.84rem; line-height:1.6; color:#cbd5e1;">
            <div><strong>Sender:</strong> ${config.senderEmail}</div>
            <div><strong>Host:</strong> ${config.host}</div>
            <div><strong>Agent Alias:</strong> ${config.agentAlias}</div>
            <div><strong>Dispatched At:</strong> ${new Date().toLocaleString()}</div>
          </div>
          <p style="font-size:0.8rem; color:#64748b; margin-top:1.5rem; text-align:center;">
            This verification email confirms your Zoho ZeptoMail CPaaS API key is active.
          </p>
          <div style="font-size:10px; color:#475569; text-align:center; padding-top:12px; margin-top:16px; border-top:1px solid rgba(255,255,255,0.06); line-height:1.5;">
            You are receiving this official communication from ORVEXI Limited regarding requested technology services, enterprise advisory, or active service subscriptions.<br/>
            <a href="https://orvexi.rw/unsubscribe" style="color:#3eb5f1; text-decoration:underline;">Unsubscribe</a> &nbsp;&middot;&nbsp;
            <a href="https://orvexi.rw/contact" style="color:#3eb5f1; text-decoration:underline;">Help &amp; Support</a> &nbsp;&middot;&nbsp;
            <a href="https://orvexi.rw/privacy" style="color:#3eb5f1; text-decoration:underline;">Privacy Policy</a>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: [targetEmail],
      subject: `[ORVEXI Test] Zoho Email Connection Verified (${new Date().toLocaleTimeString()})`,
      html: testHtml
    });
  }
}

export const zohoEmailService = new ZohoEmailService();


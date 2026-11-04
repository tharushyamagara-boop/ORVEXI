// Email Campaign, Mailchimp-like Builder, and Outbound Dispatch Store
// Handles drag/click content blocks, HTML email generation, 
// public web publication linking, and dispatch history.

import { db } from '../firebase.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const CAMPAIGN_STORAGE_KEY = 'orvexi_email_campaign_v1';
const HISTORY_STORAGE_KEY = 'orvexi_dispatched_history_v1';

export const EMAIL_CATEGORIES = [
  'Company Announcements',
  'Technology Innovations',
  'Product Releases & Updates',
  'Client Case Studies',
  'Service Offerings & Advisory',
  'System Maintenance & Security'
];

export const INITIAL_EMAIL_BLOCKS = [
  {
    id: 'blk-topbar',
    type: 'topbar',
    bg: '#07090f',
    textColor: '#84cc16',
    address: 'KN 3 Rd, Kigali, Rwanda',
    phone: '+250 788 810 675',
    email: 'info@orvexi.com',
    website: 'orvexi.com'
  },
  {
    id: 'blk-header',
    type: 'header',
    logoUrl: '/Logo-WHITE.png',
    companyName: 'ORVEXI COMPANY LTD',
    tagline: 'Enterprise Software & Cloud Engineering in Rwanda'
  },
  {
    id: 'blk-heading-1',
    type: 'heading',
    text: 'ENTERPRISE TECHNOLOGY SOLUTIONS & SOFTWARE ARCHITECTURE',
    align: 'center',
    color: '#ffffff'
  },
  {
    id: 'blk-p-1',
    type: 'paragraph',
    text: 'ORVEXI is a premier Rwandan technology firm licensed for software publishing, custom computer programming activities, and cloud systems advisory. We engineer resilient digital platforms designed for long-term scalability and business impact.',
    align: 'center',
    color: '#94a3b8'
  },
  {
    id: 'blk-columns-1',
    type: 'columns2',
    imageUrl: '/images/slide2_software_team.jpg',
    imageAlt: 'Software Engineering Team',
    title: 'Custom Software & Enterprise Platforms',
    desc: 'From mission-critical databases and web portals to cloud microservices and mobile ecosystems, our engineering squad delivers high-velocity solutions tailored to your operational workflows.',
    btnText: 'Read More >>',
    btnUrl: 'https://orvexi.com/#services'
  },
  {
    id: 'blk-divider-1',
    type: 'divider',
    style: 'solid',
    color: 'rgba(62, 181, 241, 0.2)'
  },
  {
    id: 'blk-columns-2',
    type: 'columns2',
    imageUrl: '/images/slide3_datacenter.jpg',
    imageAlt: 'Cloud Datacenter Infrastructure',
    title: 'Data Processing & Cloud Infrastructure',
    desc: 'High-availability server infrastructure, automated multi-region backups, real-time Firestore synchronization, and enterprise-grade data protection complying with Rwandan and international data regulations.',
    btnText: 'Explore Cloud Vault >>',
    btnUrl: 'https://orvexi.com/#admin'
  },
  {
    id: 'blk-btn-cta',
    type: 'button',
    text: 'Schedule Technical Consultation',
    url: 'https://orvexi.com/#contact',
    align: 'center',
    btnBg: '#84cc16',
    btnColor: '#0b1402'
  },
  {
    id: 'blk-footer',
    type: 'footer',
    company: 'ORVEXI COMPANY LTD (Reg. No: 1628324)',
    address: 'KN 3 Rd, Downtown Commercial Hub, Kigali, Rwanda',
    phone: '+250 788 810 675',
    email: 'info@orvexi.com',
    disclaimer: 'You are receiving this communication as a registered institutional partner or client of ORVEXI Company LTD.'
  }
];

const DEFAULT_CAMPAIGN = {
  subject: 'WHO ARE WE? Modern Software Publishing & Cloud Platforms in Rwanda',
  organizationName: 'Corporate & Institutional Partners',
  templateName: 'Custom Designed Newsletter (Tailored Communication)',
  publishOnline: true,
  seoSlug: 'who-are-we-modern-software-publishing-cloud-platforms-rwanda',
  category: 'Company Announcements',
  linkedNewsletters: ['ORVEXI Official Enterprise Platform Launch'],
  includeBrowserViewHeader: true,
  recipientsText: 'aline.ikibasumba@oneandonlyresorts.com, nathan.chiroma@act.ac.rw, info@ur.ac.rw, orvexi@gmail.com',
  blocks: INITIAL_EMAIL_BLOCKS,
  lastSavedAt: new Date().toISOString()
};

class EmailStore {
  constructor() {
    this.campaign = this.loadCampaign();
    this.history = this.loadHistory();
    this.listeners = [];
    this.initFirestoreSync();
  }

  loadCampaign() {
    try {
      const stored = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.blocks) return parsed;
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_CAMPAIGN));
  }

  loadHistory() {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  }

  saveCampaign(data) {
    this.campaign = {
      ...this.campaign,
      ...data,
      lastSavedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(this.campaign));
    } catch (e) {}
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.campaign); } catch (e) {}
    });
  }

  async initFirestoreSync() {
    if (!db) return;
    try {
      const q = query(collection(db, 'email_campaigns'), orderBy('dispatchedAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const remote = [];
        snap.forEach(d => remote.push({ id: d.id, ...d.data() }));
        if (remote.length > 0) {
          const map = new Map(this.history.map(h => [h.id, h]));
          remote.forEach(r => {
            const existing = map.get(r.id);
            map.set(r.id, existing ? { ...r, ...existing } : r);
          });
          this.history = Array.from(map.values());
          try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.history));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('Could not sync email campaigns from Firestore:', e.message || e);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Mailchimp-like Builder Block Operations                                  */
  /* ------------------------------------------------------------------------ */
  getBlocks() {
    return this.campaign.blocks || [];
  }

  setBlocks(blocks) {
    this.campaign.blocks = blocks;
    this.saveCampaign({ blocks });
  }

  addBlock(type) {
    const id = 'blk-' + Date.now() + '-' + Math.floor(Math.random() * 100);
    let newBlock = { id, type };

    switch (type) {
      case 'heading':
        newBlock.text = 'NEW SECTION HEADING...';
        newBlock.align = 'left';
        newBlock.color = '#ffffff';
        break;
      case 'paragraph':
        newBlock.text = 'Enter your custom paragraph content here. You can highlight your technical achievements, product updates, or service advisory.';
        newBlock.align = 'left';
        newBlock.color = '#cbd5e1';
        break;
      case 'image':
        newBlock.imageUrl = '/images/slide1_kigali_tech.jpg';
        newBlock.caption = 'Kigali Innovation Hub';
        newBlock.align = 'center';
        break;
      case 'button':
        newBlock.text = 'Read Full Article >>';
        newBlock.url = 'https://orvexi.com';
        newBlock.align = 'left';
        newBlock.btnBg = '#84cc16';
        newBlock.btnColor = '#0b1402';
        break;
      case 'columns2':
        newBlock.imageUrl = '/images/slide1_kigali_tech.jpg';
        newBlock.imageAlt = 'Feature Highlight';
        newBlock.title = 'New Feature / Service Highlight';
        newBlock.desc = 'Explain the key technical and strategic benefits of this feature for institutional and enterprise clients.';
        newBlock.btnText = 'Learn More >>';
        newBlock.btnUrl = 'https://orvexi.com/#services';
        break;
      case 'divider':
        newBlock.style = 'solid';
        newBlock.color = 'rgba(255, 255, 255, 0.12)';
        break;
      case 'spacer':
        newBlock.height = 30;
        break;
      case 'video':
        newBlock.thumbnailUrl = '/images/slide2_software_team.jpg';
        newBlock.videoUrl = 'https://youtube.com';
        newBlock.caption = 'Watch Technical Architecture Overview (Video)';
        break;
      case 'social':
        newBlock.links = [
          { name: 'LinkedIn', url: 'https://linkedin.com' },
          { name: 'Twitter / X', url: 'https://x.com' },
          { name: 'GitHub', url: 'https://github.com' }
        ];
        break;
      case 'code':
        newBlock.html = '<div style="background:#07090f; padding:12px; border-radius:6px; font-family:monospace; color:#3eb5f1; font-size:12px;">&lt;!-- Custom Embedded Widget or Code --&gt;</div>';
        break;
      default:
        newBlock.text = 'Content block';
        break;
    }

    const existing = [...this.getBlocks()];
    // If footer block exists, insert right before the footer so the new block is in the email body
    const footerIdx = existing.findIndex(b => b.type === 'footer');
    if (footerIdx !== -1 && type !== 'footer') {
      existing.splice(footerIdx, 0, newBlock);
    } else {
      existing.push(newBlock);
    }
    this.setBlocks(existing);
    return newBlock;
  }

  updateBlock(id, fields) {
    const blocks = this.getBlocks().map(b => {
      if (b.id === id) {
        return { ...b, ...fields };
      }
      return b;
    });
    this.setBlocks(blocks);
  }

  removeBlock(id) {
    const blocks = this.getBlocks().filter(b => b.id !== id);
    this.setBlocks(blocks);
  }

  moveBlock(id, direction) {
    const blocks = [...this.getBlocks()];
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const temp = blocks[index];
    blocks[index] = blocks[targetIndex];
    blocks[targetIndex] = temp;
    this.setBlocks(blocks);
  }

  duplicateBlock(id) {
    const blocks = [...this.getBlocks()];
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return null;

    const clone = JSON.parse(JSON.stringify(blocks[index]));
    clone.id = 'blk-' + Date.now();
    blocks.splice(index + 1, 0, clone);
    this.setBlocks(blocks);
    return clone;
  }

  /* ------------------------------------------------------------------------ */
  /* Generate Production-Grade Responsive Email HTML                          */
  /* ------------------------------------------------------------------------ */
  generateHtml() {
    const b = this.campaign;
    const blocks = this.getBlocks();

    const blocksHtml = blocks.map(block => {
      switch (block.type) {
        case 'topbar':
          return `
            <tr>
              <td style="background:${block.bg || '#07090f'}; padding:10px 20px; font-size:11px; color:#94a3b8; font-family:sans-serif; border-bottom:2px solid #84cc16;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left" style="color:#cbd5e1;">📍 ${block.address || 'Kigali, Rwanda'} &nbsp;|&nbsp; 📞 ${block.phone || '+250 788 810 675'}</td>
                    <td align="right" style="color:#84cc16; font-weight:bold;"><a href="https://${block.website || 'orvexi.com'}" style="color:#84cc16; text-decoration:none;">${block.website || 'orvexi.com'}</a></td>
                  </tr>
                </table>
              </td>
            </tr>
          `;

        case 'header':
          return `
            <tr>
              <td align="center" style="padding:28px 20px 16px; background:#0b101f; text-align:center;">
                <img src="${block.logoUrl || '/Logo-WHITE.png'}" alt="ORVEXI" height="34" style="height:34px; margin-bottom:8px; display:inline-block;" />
                <div style="font-size:12px; color:#3eb5f1; letter-spacing:1px; text-transform:uppercase; font-weight:600;">${block.tagline || ''}</div>
              </td>
            </tr>
          `;

        case 'heading':
          return `
            <tr>
              <td align="${block.align || 'center'}" style="padding:16px 24px 8px; background:#0b101f;">
                <h1 style="margin:0; font-size:22px; line-height:1.3; font-weight:800; color:${block.color || '#ffffff'}; font-family:sans-serif; letter-spacing:-0.3px;">
                  ${block.text}
                </h1>
              </td>
            </tr>
          `;

        case 'paragraph':
          return `
            <tr>
              <td align="${block.align || 'left'}" style="padding:8px 24px 16px; background:#0b101f;">
                <p style="margin:0; font-size:14px; line-height:1.6; color:${block.color || '#94a3b8'}; font-family:sans-serif;">
                  ${block.text}
                </p>
              </td>
            </tr>
          `;

        case 'columns2':
          return `
            <tr>
              <td style="padding:16px 24px; background:#0b101f;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:8px;">
                  <tr>
                    <td width="42%" valign="top" style="padding:14px;">
                      <img src="${block.imageUrl || '/images/slide1_kigali_tech.jpg'}" alt="${block.imageAlt || ''}" width="100%" style="width:100%; border-radius:6px; display:block; object-fit:cover; max-height:160px;" />
                    </td>
                    <td width="58%" valign="top" style="padding:14px 16px;">
                      <h3 style="margin:0 0 8px; font-size:16px; color:#84cc16; font-weight:700; font-family:sans-serif;">${block.title || ''}</h3>
                      <p style="margin:0 0 14px; font-size:13px; line-height:1.5; color:#cbd5e1; font-family:sans-serif;">${block.desc || ''}</p>
                      ${block.btnText ? `
                        <a href="${block.btnUrl || '#'}" style="display:inline-block; background:#84cc16; color:#0b1402; font-size:12px; font-weight:700; padding:8px 16px; border-radius:4px; text-decoration:none; font-family:sans-serif;">
                          ${block.btnText}
                        </a>
                      ` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `;

        case 'image':
          return `
            <tr>
              <td align="${block.align || 'center'}" style="padding:16px 24px; background:#0b101f;">
                <img src="${block.imageUrl || '/images/slide1_kigali_tech.jpg'}" alt="" width="100%" style="width:100%; max-width:550px; border-radius:8px; display:block;" />
                ${block.caption ? `<div style="font-size:12px; color:#64748b; margin-top:6px; text-align:center;">${block.caption}</div>` : ''}
              </td>
            </tr>
          `;

        case 'button':
          return `
            <tr>
              <td align="${block.align || 'center'}" style="padding:18px 24px; background:#0b101f;">
                <a href="${block.url || '#'}" style="display:inline-block; background:${block.btnBg || '#84cc16'}; color:${block.btnColor || '#0b1402'}; font-size:14px; font-weight:700; padding:12px 28px; border-radius:6px; text-decoration:none; font-family:sans-serif; box-shadow:0 4px 12px rgba(132,204,22,0.25);">
                  ${block.text}
                </a>
              </td>
            </tr>
          `;

        case 'divider':
          return `
            <tr>
              <td style="padding:10px 24px; background:#0b101f;">
                <hr style="border:0; border-top:1px ${block.style || 'solid'} ${block.color || 'rgba(255,255,255,0.1)'}; margin:0;" />
              </td>
            </tr>
          `;

        case 'spacer':
          return `
            <tr>
              <td height="${block.height || 24}" style="height:${block.height || 24}px; background:#0b101f;"></td>
            </tr>
          `;

        case 'video':
          return `
            <tr>
              <td align="center" style="padding:16px 24px; background:#0b101f;">
                <div style="position:relative; max-width:550px; margin:0 auto; background:#000; border-radius:8px; overflow:hidden;">
                  <img src="${block.thumbnailUrl || '/images/slide2_software_team.jpg'}" width="100%" style="width:100%; display:block; opacity:0.75;" />
                  <a href="${block.videoUrl || '#'}" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:#84cc16; color:#0b1402; border-radius:50%; width:56px; height:56px; display:inline-flex; align-items:center; justify-content:center; text-decoration:none; font-size:22px; font-weight:bold;">▶</a>
                </div>
                ${block.caption ? `<div style="font-size:12px; color:#94a3b8; margin-top:6px;">${block.caption}</div>` : ''}
              </td>
            </tr>
          `;

        case 'social':
          return `
            <tr>
              <td align="center" style="padding:16px 24px; background:#0b101f; text-align:center;">
                <div style="display:inline-block;">
                  <a href="https://linkedin.com" style="color:#3eb5f1; text-decoration:none; margin:0 8px; font-size:13px; font-weight:600;">LinkedIn</a>
                  <span style="color:#475569;">•</span>
                  <a href="https://x.com" style="color:#3eb5f1; text-decoration:none; margin:0 8px; font-size:13px; font-weight:600;">Twitter/X</a>
                  <span style="color:#475569;">•</span>
                  <a href="https://github.com" style="color:#3eb5f1; text-decoration:none; margin:0 8px; font-size:13px; font-weight:600;">GitHub</a>
                </div>
              </td>
            </tr>
          `;

        case 'footer':
          return `
            <tr>
              <td style="background:#07090f; padding:24px; text-align:center; font-family:sans-serif; border-top:1px solid rgba(255,255,255,0.08);">
                <div style="font-size:13px; font-weight:700; color:#ffffff; margin-bottom:4px;">${block.company || 'ORVEXI COMPANY LTD'}</div>
                <div style="font-size:11px; color:#64748b; line-height:1.5; margin-bottom:12px;">
                  ${block.address || 'Kigali, Rwanda'}<br/>
                  Phone: ${block.phone || '+250 788 810 675'} &nbsp;|&nbsp; Email: ${block.email || 'info@orvexi.com'}
                </div>
                <div style="font-size:10px; color:#475569; line-height:1.4;">
                  ${block.disclaimer || 'Official company outbound broadcast.'}<br/>
                  <a href="https://orvexi.com/#unsubscribe" style="color:#64748b; text-decoration:underline;">Unsubscribe / Manage Preferences</a>
                </div>
              </td>
            </tr>
          `;

        default:
          return '';
      }
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${b.subject || 'ORVEXI Communication'}</title>
</head>
<body style="margin:0; padding:0; background-color:#05070d; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  ${b.includeBrowserViewHeader ? `
    <div style="background:#020408; padding:8px; text-align:center; font-size:11px; color:#64748b; font-family:sans-serif;">
      Having trouble viewing this email? <a href="https://orvexi.com/publications/${b.seoSlug || 'newsletter'}" style="color:#3eb5f1; text-decoration:underline;">View this email in your browser</a>
    </div>
  ` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#05070d; padding:20px 0;">
    <tr>
      <td align="center">
        <!-- Container Table -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#0b101f; border-radius:10px; overflow:hidden; box-shadow:0 12px 36px rgba(0,0,0,0.5); border:1px solid rgba(62,181,241,0.18);">
          ${blocksHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /* ------------------------------------------------------------------------ */
  /* Dispatch Campaign & Track Outbound Broadcast                             */
  /* ------------------------------------------------------------------------ */
  dispatchCampaign({ testOnly = false, recipients = null, subject = null, organizationName = null } = {}) {
    const b = this.campaign;
    const finalSubject = (subject !== null && subject !== undefined) ? subject : (b.subject || 'ORVEXI Outbound Communication');

    let recipientList = [];
    if (Array.isArray(recipients) && recipients.length > 0) {
      recipientList = recipients.map(r => r.trim().toLowerCase()).filter(r => r.includes('@'));
    } else {
      recipientList = (b.recipientsText || '')
        .split(/[,;\n]/)
        .map(r => r.trim().toLowerCase())
        .filter(r => r.includes('@'));
    }

    if (testOnly) {
      if (!recipientList.includes('orvexi@gmail.com')) {
        recipientList.push('orvexi@gmail.com');
      }
    }

    const distinctRecipients = Array.from(new Set(recipientList));
    if (distinctRecipients.length === 0) {
      throw new Error('Please add at least one recipient email address.');
    }

    const htmlContent = this.generateHtml();
    const id = 'camp-' + Date.now();
    const nowIso = new Date().toISOString();

    const record = {
      id,
      subject: finalSubject,
      organizationName: organizationName || b.organizationName || '',
      templateName: b.templateName || 'Custom Designed Newsletter',
      publishOnline: b.publishOnline !== false,
      seoSlug: b.seoSlug || 'newsletter',
      category: b.category || 'Company Announcements',
      recipientCount: distinctRecipients.length,
      recipients: distinctRecipients,
      isTest: testOnly,
      status: 'Sent',
      dispatchedAt: nowIso,
      dispatchedAtFormatted: new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    };

    // 1. Immediately persist locally (instant, non-blocking)
    this.history = [record, ...this.history];
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.history));
    } catch (e) {}
    this.notify();

    // 2. Background Firestore sync
    if (db) {
      try {
        setDoc(doc(db, 'email_campaigns', id), record, { merge: true })
          .catch(err => console.warn('Firestore email campaign sync skipped:', err.message || err));
      } catch (e) {}
    }

    return record;
  }
}

export const emailStore = new EmailStore();


import { db, auth, firebaseSignOut } from '../firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { uploadDataUrlToStorage } from '../services/imageUploadService.js';

const STORAGE_KEY = 'orvexi_site_content_v1';
const AUTH_KEY = 'orvexi_admin_session';
const AUTH_USER_KEY = 'orvexi_admin_user';

export const MASTER_DEFAULT_PASSWORD = 'Gavyn#123@Olga';

export const DEFAULT_CONTENT = {
  heroSlider: [
    {
      id: "slide-1",
      title: "Technology Solutions",
      highlight: "Built for Africa",
      badge: "",
      subtitle: "A privately registered Rwandan technology company delivering software publishing, IT consultancy, data processing, and web services from Kigali.",
      image: "/images/slide1_kigali_tech.jpg",
      ctaPrimary: { label: "Our Services", url: "/services" },
      ctaSecondary: { label: "Explore Portfolio", url: "/portfolio" },
      enabled: true
    },
    {
      id: "slide-2",
      title: "Software Engineering & Architecture",
      highlight: "Scalable Platforms",
      badge: "",
      subtitle: "Empowering businesses across Rwanda and East Africa with robust digital architecture, modern cloud solutions, and user-centric systems.",
      image: "/images/slide2_software_team.jpg",
      ctaPrimary: { label: "View Services", url: "/services" },
      ctaSecondary: { label: "Contact Us", url: "/contact" },
      enabled: true
    },
    {
      id: "slide-3",
      title: "Data Processing & Cloud Infrastructure",
      highlight: "Resilient Operations",
      badge: "",
      subtitle: "Enterprise data processing, cloud virtualization, secure database pipelines, and high-availability operations for leading institutions.",
      image: "/images/slide3_datacenter.jpg",
      ctaPrimary: { label: "Explore Portfolio", url: "/portfolio" },
      ctaSecondary: { label: "Get in Touch", url: "/contact" },
      enabled: true
    }
  ],

  about: {
    tag: "About Us",
    title: "Company Overview",
    desc: "We are a privately incorporated Rwandan technology company, registered with the Rwanda Development Board and engaged in software and IT services.",
    paragraphs: [
      "We were incorporated on <strong>20 October 2025</strong> under Rwandan company law (Law N° 007/2021 of 05/02/2021) as a private company limited by shares, with our registered office in Niboye, Kicukiro, Umujyi wa Kigali.",
      "Our primary business activity is <strong>Software Publishing</strong> (RDB code J5820), complemented by a range of computer programming, IT consultancy, data processing, and web portal services.",
      "We are led by our <strong>Managing Director and Chair, Theophile HARUSHYAMAGARA</strong>, and were co-founded with shareholder <strong>Yvette NSABARUGIRA</strong>.",
      "We hold an authorised share capital of <strong>RWF 1,000,000,000</strong> (one billion Rwandan francs) divided across ordinary, preferential, non-voting, and redeemable share classes."
    ],
    officePhoto: "/images/about_office.jpg",
    officeBadge: "Kigali Innovation Hub • Rwanda",
    registration: {
      tin: "1628324",
      date: "20 October 2025",
      type: "Private — Limited by Shares",
      address: "Niboye, Kicukiro\nUmujyi wa Kigali, Rwanda",
      director: "Theophile HARUSHYAMAGARA"
    }
  },

  services: {
    tag: "Services",
    title: "Registered Business Activities",
    desc: "The following services are formally registered with the Rwanda Development Board as our authorised business activities (effective 30 July 2025).",
    items: [
      {
        code: "J5820",
        title: "Software Publishing",
        desc: "Development and publishing of software products, including licensing, distribution, and maintenance of proprietary software applications.",
        primary: true
      },
      {
        code: "J6201",
        title: "Computer Programming Activities",
        desc: "Custom software design, coding, testing, and maintenance services tailored to client requirements across web, mobile, and desktop platforms.",
        primary: false
      },
      {
        code: "J6202",
        title: "IT Consultancy & Facilities Management",
        desc: "Professional advisory on IT infrastructure planning, systems architecture, and management of client computer facilities and technology environments.",
        primary: false
      },
      {
        code: "J6209",
        title: "Other IT & Computer Services",
        desc: "Supplementary technology services including system integration, technical support, IT training, and other computer-related professional activities.",
        primary: false
      },
      {
        code: "J6311",
        title: "Data Processing & Hosting",
        desc: "Management and processing of client data, cloud hosting solutions, database administration, and related data infrastructure services.",
        primary: false
      },
      {
        code: "J6312",
        title: "Web Portals",
        desc: "Design, development, and management of web portals and online platforms that aggregate content and provide internet-based services to users.",
        primary: false
      }
    ]
  },

  portfolio: {
    tag: "Portfolio",
    title: "Our Work & Live Platforms",
    desc: "Explore live digital products, web portals, and software systems designed and deployed by our team.",
    items: [
      {
        id: "loprok",
        title: "LopRok",
        subtitle: "Music Creator & Streaming Studio",
        category: "Media & Creator Platform",
        desc: "Comprehensive digital studio and social platform for artists, producers, and beatmakers. Enables creators to stream instrumentals, record vocals, share beats, and collaborate worldwide.",
        url: "https://loprok.com/home",
        image: "/images/slide1_kigali_tech.jpg",
        tags: ["Next.js", "PWA", "Live Audio Streaming", "Mobile Studio"],
        badge: "",
        quote: "$2,800",
        showQuote: true,
        orderBtnText: "Get Similar",
        btnText: "Visit",
        features: [
          "A live website & web application",
          "One year management and consultancy",
          "Audio streaming studio & social creator platform"
        ]
      },
      {
        id: "sanex",
        title: "SANEX Core",
        subtitle: "Liquid Waste & Sanitation Systems",
        category: "Environmental & Sanitation Tech",
        desc: "Specialized enterprise web platform powering sustainable liquid waste management, decentralized wastewater treatment monitoring, and professional sanitation logistics across Rwanda.",
        url: "https://sanex.rw/",
        image: "/images/about_office.jpg",
        tags: ["Enterprise Web", "Environmental Systems", "Operations Tracker"],
        badge: "",
        quote: "$3,500",
        showQuote: true,
        orderBtnText: "Get Similar",
        btnText: "Visit",
        features: [
          "A live enterprise operations & logistics portal",
          "One year management and consultancy",
          "Decentralized wastewater treatment monitoring system"
        ]
      },
      {
        id: "asserwa",
        title: "ASSERWA",
        subtitle: "Forum of Sewage Emptiers in Rwanda",
        category: "Institutional & Industry Portal",
        desc: "Official institutional web platform uniting Rwanda's professional sewage emptiers and sanitation service providers. Features certified member directories, compliance frameworks, and national advocacy initiatives.",
        url: "https://asserwa.com/",
        image: "/images/slide2_software_team.jpg",
        tags: ["Member Directory", "Institutional Portal", "Governance"],
        badge: "",
        quote: "$2,200",
        showQuote: true,
        orderBtnText: "Get Similar",
        btnText: "Visit",
        features: [
          "A live institutional portal & member directory",
          "One year management and consultancy",
          "National sanitation advocacy & compliance framework"
        ]
      },
      {
        id: "equiterra",
        title: "Equiterra Consulting",
        subtitle: "Multi-Sectoral Advisory Dashboard",
        category: "Analytics & Strategic Advisory",
        desc: "Executive consultancy analytics platform delivering data-driven insights, capacity-building intelligence, and strategic advisory across climate change finance, universal health systems, and public governance.",
        url: "https://equiterraconsulting.com/",
        image: "/images/slide3_datacenter.jpg",
        tags: ["Analytics Dashboard", "Strategic Intelligence", "SDGs & Climate"],
        badge: "",
        quote: "$2,500",
        showQuote: true,
        orderBtnText: "Get Similar",
        btnText: "Visit",
        features: [
          "A live strategic advisory & analytics platform",
          "One year management and consultancy",
          "Multi-sectoral intelligence dashboards & reporting tools"
        ]
      },
      {
        id: "tontine",
        title: "Ikimina (SCDT Tontine)",
        subtitle: "Cooperative Savings & Loan App",
        category: "Fintech & Cooperative Savings",
        desc: "Cloud-hosted community microfinance system designed to track cooperative tontine contribution cycles, member balances, rotating savings, and group loan distributions seamlessly.",
        url: "https://studio--studio-1670844393-18cbb.us-central1.hosted.app/",
        image: "/images/slide1_kigali_tech.jpg",
        tags: ["Cloud Hosted", "Microfinance App", "Cooperative Tontine"],
        badge: "",
        quote: "$1,800",
        showQuote: true,
        orderBtnText: "Get Similar",
        btnText: "Live Demo",
        features: [
          "A live cooperative microfinance web app",
          "One year management and consultancy",
          "Automated contribution cycles & rotating savings ledger"
        ]
      },
      {
        id: "nbs-dashboard",
        title: "SUNCASA Kigali (NbS)",
        subtitle: "Nature-Based Solutions Impact Dashboard",
        category: "Environmental & Climate Analytics",
        desc: "Interactive environmental impact PWA and GIS dashboard communicating Nature-based Solutions (NbS) across the Lower Nyabarongo watershed, tracking terracing, afforestation, flood resilience, and green employment.",
        url: "https://nbs-455962--nbs-project-7deac.us-central1.hosted.app/",
        image: "/images/slide2_software_team.jpg",
        tags: ["Impact Dashboard", "GIS Mapping", "PWA", "Climate Analytics"],
        badge: "",
        quote: "$3,200",
        showQuote: true,
        orderBtnText: "Get Similar",
        btnText: "Live Demo",
        features: [
          "A live watershed impact PWA & GIS platform",
          "One year management and consultancy",
          "Interactive GIS mapping & climate resilience tracking"
        ]
      }
    ]
  },

  contact: {
    tag: "Service Requests & Contact",
    title: "Request a Service or Consultation",
    desc: "Submit a service request, schedule a technical consultation, or reach out to our team in Kigali.",
    submitBtnText: "Submit Service Request",
    notificationEmail: "ceo@orvexi.rw",
    services: [
      "Software Publishing & Custom Development",
      "Computer Programming Activities",
      "IT Consultancy & Systems Advisory",
      "Data Processing & Cloud Infrastructure",
      "Web Portals & Enterprise Platforms",
      "General Technical Consultation"
    ],
    timeSlots: [
      "Morning (09:00 - 12:00)",
      "Afternoon (12:00 - 16:00)",
      "Late Afternoon (16:00 - 18:00)",
      "Flexible / Any Time"
    ],
    channels: [
      "Website Direct",
      "Google Search",
      "LinkedIn",
      "Referral / Partner",
      "Client Recommendation",
      "Other"
    ],
    successTitle: "Service Request Submitted",
    successDesc: "Thank you! Your request has been queued in our operations management pipeline. Our team will review your requirements and get in touch to confirm your appointment.",
    address: "Niboye, Kicukiro\nUmujyi wa Kigali, Rwanda",
    phone: "+250 788 810 675",
    email: "orvexi@loprok.com",
    tin: "1628324",
    rraLink: "https://etax.rra.gov.rw/nidAssignedTIN/"
  },

  settings: {
    brandName: "ORVEXI",
    tagline: "Software & IT Solutions | Kigali, Rwanda",
    logoUrl: "/Logo-WHITE.png",
    footerText: "We deliver technology solutions from Kigali — software, IT consultancy, data hosting, and web services.",
    adminPassword: MASTER_DEFAULT_PASSWORD,
    recoveryEmail: "orvexi@loprok.com"
  }
};

class ContentStore {
  constructor() {
    this.listeners = new Set();
    this.cloudSyncStatus = { status: 'connecting', error: null, lastSynced: 0 };
    this.content = this.loadInitialContent();
    this.initFirestoreSync();
  }

  getSyncStatus() {
    return this.cloudSyncStatus;
  }

  loadInitialContent() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const settings = { ...DEFAULT_CONTENT.settings, ...(parsed.settings || {}) };

        // Guarantee password is set to user's desired password
        if (!settings.adminPassword ||
          settings.adminPassphrase === 'admin' ||
          settings.adminPassphrase === 'orvexi' ||
          settings.adminPassphrase === 'orvexi2026' ||
          settings.adminPassword === 'admin') {
          settings.adminPassword = MASTER_DEFAULT_PASSWORD;
        }

        let heroSlider = Array.isArray(parsed.heroSlider) && parsed.heroSlider.length > 0
          ? parsed.heroSlider
          : DEFAULT_CONTENT.heroSlider;

        // Strip out "RDB Registered", TINs, and classification codes from cached slider
        heroSlider = heroSlider.map(s => {
          if (s.badge && (
            s.badge.includes('1628324') ||
            s.badge.includes('RDB Registered') ||
            s.badge.includes('Code') ||
            s.badge.includes('J6311') ||
            s.badge.includes('J5820')
          )) {
            return { ...s, badge: '' };
          }
          return s;
        });

        // Strip out wrapping / inconsistent badges (Enterprise, Flagship Platform, etc.) and ensure image exists
        let portfolio = { ...DEFAULT_CONTENT.portfolio, ...(parsed.portfolio || {}) };
        if (Array.isArray(portfolio.items)) {
          const unwantedBadges = ['Enterprise', 'Flagship Platform', 'National Forum', 'Consulting Dashboard', 'Fintech Application', 'Demo Dashboard'];
          portfolio.items = portfolio.items.map((p, idx) => {
            const defItem = DEFAULT_CONTENT.portfolio.items[idx] || {};
            const rawBadge = p.badge || defItem.badge || '';
            const badge = unwantedBadges.includes(rawBadge) ? '' : rawBadge;
            return {
              ...defItem,
              ...p,
              image: p.image || defItem.image || '/images/slide1_kigali_tech.jpg',
              badge,
              quote: (p.quote !== undefined && p.quote !== null && p.quote !== '') ? p.quote : (defItem.quote || ''),
              showQuote: p.showQuote !== undefined ? Boolean(p.showQuote) : (defItem.showQuote !== false),
              orderBtnText: (p.orderBtnText && p.orderBtnText !== 'Order Similar Website') ? p.orderBtnText : (defItem.orderBtnText || 'Get Similar'),
              features: Array.isArray(p.features) ? p.features : (defItem.features || [])
            };
          });
        }

        const merged = {
          ...DEFAULT_CONTENT,
          ...parsed,
          _lastModified: parsed._lastModified || 0,
          about: { ...DEFAULT_CONTENT.about, ...(parsed.about || {}) },
          services: { ...DEFAULT_CONTENT.services, ...(parsed.services || {}) },
          portfolio,
          contact: { ...DEFAULT_CONTENT.contact, ...(parsed.contact || {}) },
          settings,
          heroSlider
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch (e) { }
        return merged;
      }
    } catch (e) {
      console.warn('Could not parse stored content:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  }

  async initFirestoreSync() {
    if (!db) {
      this.cloudSyncStatus = { status: 'error', error: 'Firestore uninitialized' };
      return;
    }
    try {
      const docRef = doc(db, 'settings', 'site_content');
      const docSnap = await getDoc(docRef);

      let remoteContent = null;
      let remoteTime = 0;

      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        if (remoteData && remoteData.content) {
          remoteContent = remoteData.content;
          remoteTime = remoteData.lastModified || (remoteData.updatedAt ? new Date(remoteData.updatedAt).getTime() : 0);
        }
      }

      // Also check dedicated section documents to bypass single-doc 1MB quotas
      try {
        const portSnap = await getDoc(doc(db, 'content', 'portfolio'));
        if (portSnap.exists()) {
          const portData = portSnap.data();
          if (portData && portData.portfolio) {
            if (!remoteContent) remoteContent = {};
            remoteContent.portfolio = portData.portfolio;
            const pTime = portData.lastModified || 0;
            if (pTime > remoteTime) remoteTime = pTime;
          }
        }
      } catch (pe) { }

      try {
        const slideSnap = await getDoc(doc(db, 'content', 'heroSlider'));
        if (slideSnap.exists()) {
          const slideData = slideSnap.data();
          if (slideData && slideData.heroSlider) {
            if (!remoteContent) remoteContent = {};
            remoteContent.heroSlider = slideData.heroSlider;
            const sTime = slideData.lastModified || 0;
            if (sTime > remoteTime) remoteTime = sTime;
          }
        }
      } catch (se) { }

      try {
        const srvSnap = await getDoc(doc(db, 'content', 'services'));
        if (srvSnap.exists()) {
          const srvData = srvSnap.data();
          if (srvData && srvData.services) {
            if (!remoteContent) remoteContent = {};
            remoteContent.services = srvData.services;
            const svTime = srvData.lastModified || 0;
            if (svTime > remoteTime) remoteTime = svTime;
          }
        }
      } catch (sve) { }

      this.cloudSyncStatus = { status: 'synced', lastSynced: Date.now(), error: null };

      if (remoteContent) {
        const localTime = this.content._lastModified || 0;
        const hasUnsyncedPhotos = this.hasBase64Images();

        // If local content was saved more recently than remote Firestore data,
        // or contains local base64 images that must be migrated to Firebase Storage,
        // do NOT overwrite local changes with stale cloud data.
        if (localTime > remoteTime || hasUnsyncedPhotos) {
          console.info('Preserving newer local content / unsynced images and uploading to Cloud Storage & Firestore.');
          await this.syncAllContent();
          return;
        }

        this.content = {
          ...this.content,
          ...remoteContent,
          _lastModified: remoteTime,
          settings: {
            ...this.content.settings,
            ...(remoteContent.settings || {}),
            adminPassword: remoteContent.settings?.adminPassword || this.content.settings.adminPassword
          }
        };
        this.persistLocally();
        this.notify();
      } else {
        // First cloud sync on newly created Firestore database: push all current local content up to cloud
        await this.syncAllContent();
      }
    } catch (err) {
      console.warn('Firestore remote sync unavailable:', err.message);
      this.cloudSyncStatus = {
        status: 'error',
        error: err.code || err.message
      };
      this.notify();
    }
  }

  hasBase64Images() {
    if (!this.content) return false;
    if (this.content.portfolio?.items?.some(it => it.image && typeof it.image === 'string' && it.image.startsWith('data:image/'))) return true;
    if (this.content.heroSlider?.some(s => s.image && typeof s.image === 'string' && s.image.startsWith('data:image/'))) return true;
    if (this.content.about?.officePhoto && typeof this.content.about.officePhoto === 'string' && this.content.about.officePhoto.startsWith('data:image/')) return true;
    if (this.content.team?.members?.some(m => m.image && typeof m.image === 'string' && m.image.startsWith('data:image/'))) return true;
    return false;
  }

  async migrateDataUrlsToStorage() {
    if (!this.content) return;
    let modified = false;

    // 1. Portfolio items
    if (this.content.portfolio?.items?.length) {
      for (let i = 0; i < this.content.portfolio.items.length; i++) {
        const item = this.content.portfolio.items[i];
        if (item.image && typeof item.image === 'string' && item.image.startsWith('data:image/')) {
          const safeTitle = (item.title || 'project').toLowerCase().replace(/[^a-z0-9]/g, '_');
          const url = await uploadDataUrlToStorage(item.image, 'projects', `${safeTitle}.jpg`);
          if (url && url !== item.image) {
            item.image = url;
            modified = true;
          }
        }
      }
    }

    // 2. Hero slides
    if (this.content.heroSlider?.length) {
      for (let i = 0; i < this.content.heroSlider.length; i++) {
        const slide = this.content.heroSlider[i];
        if (slide.image && typeof slide.image === 'string' && slide.image.startsWith('data:image/')) {
          const url = await uploadDataUrlToStorage(slide.image, 'slides', `slide_${i + 1}.jpg`);
          if (url && url !== slide.image) {
            slide.image = url;
            modified = true;
          }
        }
      }
    }

    // 3. About office photo
    if (this.content.about?.officePhoto && typeof this.content.about.officePhoto === 'string' && this.content.about.officePhoto.startsWith('data:image/')) {
      const url = await uploadDataUrlToStorage(this.content.about.officePhoto, 'about', 'office.jpg');
      if (url && url !== this.content.about.officePhoto) {
        this.content.about.officePhoto = url;
        modified = true;
      }
    }

    // 4. Team members
    if (this.content.team?.members?.length) {
      for (let i = 0; i < this.content.team.members.length; i++) {
        const mem = this.content.team.members[i];
        if (mem.image && typeof mem.image === 'string' && mem.image.startsWith('data:image/')) {
          const safeName = (mem.name || 'member').toLowerCase().replace(/[^a-z0-9]/g, '_');
          const url = await uploadDataUrlToStorage(mem.image, 'team', `${safeName}.jpg`);
          if (url && url !== mem.image) {
            mem.image = url;
            modified = true;
          }
        }
      }
    }

    if (modified) {
      this.persistLocally();
      this.notify();
    }
  }

  /**
   * Comprehensive synchronization of all website sections to Cloud Firestore
   */
  async syncAllContent() {
    if (!db) return false;
    try {
      // 0. Auto-migrate any local base64 images to permanent Firebase Storage URLs
      await this.migrateDataUrlsToStorage();

      const now = Date.now();
      const nowIso = new Date().toISOString();

      // Deep clone and clean to eliminate any undefined values or non-serializable entities
      const cleanContent = JSON.parse(JSON.stringify(this.content));

      // 1. Save main content document
      await setDoc(doc(db, 'settings', 'site_content'), {
        content: cleanContent,
        updatedAt: nowIso,
        lastModified: now
      }, { merge: true });

      // 2. Also save section documents to prevent single-doc 1MB quotas
      const sections = ['portfolio', 'heroSlider', 'services', 'about', 'team', 'testimonials', 'contact', 'faq', 'settings'];
      for (const sec of sections) {
        if (cleanContent[sec]) {
          await setDoc(doc(db, 'content', sec), {
            [sec]: cleanContent[sec],
            updatedAt: nowIso,
            lastModified: now
          }, { merge: true });
        }
      }

      this.cloudSyncStatus = { status: 'synced', lastSynced: now, error: null };
      this.notify();
      return true;
    } catch (err) {
      console.warn('Firestore write failed:', err.message);
      this.cloudSyncStatus = {
        status: 'error',
        error: err.code || err.message
      };
      this.notify();
      return false;
    }
  }

  async syncToFirestore(timestamp = Date.now()) {
    return await this.syncAllContent();
  }

  getContent() {
    return this.content;
  }

  async saveContent(newContent) {
    const now = Date.now();
    this.content = {
      ...this.content,
      ...newContent,
      _lastModified: now
    };
    this.persistLocally();
    this.notify();

    const cloudOk = await this.syncToFirestore(now);
    return cloudOk;
  }

  persistLocally() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.content));
    } catch (e) {
      console.warn('Failed to save to localStorage (quota or restriction), attempting cleanup:', e);
      try {
        // Prune temporary keys from localStorage
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('temp_') || key.startsWith('cache_'))) {
            localStorage.removeItem(key);
          }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.content));
      } catch (err2) {
        console.error('Critical localStorage save failure:', err2);
      }
    }
  }

  resetToDefaults() {
    this.content = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
    this.persistLocally();
    this.notify();
    if (db) {
      try {
        const docRef = doc(db, 'settings', 'site_content');
        setDoc(docRef, { content: this.content, updatedAt: new Date().toISOString() });
      } catch (e) { }
    }
    return this.content;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.content);
      } catch (err) {
        console.error('Error in content subscriber:', err);
      }
    }
  }

  exportJSON() {
    return JSON.stringify(this.content, null, 2);
  }

  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON format');
      this.content = {
        ...DEFAULT_CONTENT,
        ...data,
        settings: {
          ...DEFAULT_CONTENT.settings,
          ...(data.settings || {}),
          adminPassword: data.settings?.adminPassword || this.content.settings.adminPassword
        }
      };
      this.persistLocally();
      this.notify();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // --- Auth Session Management ---
  isAdminAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === 'true' || localStorage.getItem(AUTH_KEY) === 'true';
  }

  getAdminUser() {
    try {
      const stored = sessionStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(AUTH_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) { }
    return { name: 'Admin', email: this.content.settings?.recoveryEmail || 'orvexi@loprok.com', provider: 'password' };
  }

  loginAdmin(password, remember = false) {
    const validPassword = this.content.settings?.adminPassword || MASTER_DEFAULT_PASSWORD;
    if (password === validPassword) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(AUTH_KEY, 'true');
      storage.setItem(AUTH_USER_KEY, JSON.stringify({
        name: 'Administrator',
        email: this.content.settings?.recoveryEmail || 'orvexi@loprok.com',
        provider: 'password'
      }));
      this.notify();
      return true;
    }
    return false;
  }

  loginWithGoogle(user, remember = false) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(AUTH_KEY, 'true');
    storage.setItem(AUTH_USER_KEY, JSON.stringify({
      name: user.displayName || 'Google Admin',
      email: user.email || '',
      photo: user.photoURL || '',
      provider: 'google'
    }));
    this.notify();
    return true;
  }

  async resetAdminPassword(newPassword) {
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }
    const settings = {
      ...this.content.settings,
      adminPassword: newPassword
    };
    await this.saveContent({ settings });
    return { success: true };
  }

  logoutAdmin() {
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_USER_KEY);

    if (auth) {
      firebaseSignOut(auth).catch(() => { });
    }

    this.notify();
  }
}

export const contentStore = new ContentStore();

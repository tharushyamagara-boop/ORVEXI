import { db, auth, firebaseSignOut } from '../firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
        orderBtnText: "Order Similar Website",
        btnText: "Visit"
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
        orderBtnText: "Order Similar Website",
        btnText: "Visit"
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
        orderBtnText: "Order Similar Website",
        btnText: "Visit"
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
        orderBtnText: "Order Similar Website",
        btnText: "Visit"
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
        orderBtnText: "Order Similar Website",
        btnText: "Live Demo"
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
        orderBtnText: "Order Similar Website",
        btnText: "Live Demo"
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
    this.content = this.loadInitialContent();
    this.initFirestoreSync();
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
              orderBtnText: p.orderBtnText || defItem.orderBtnText || 'Order Similar Website'
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
        } catch (e) {}
        return merged;
      }
    } catch (e) {
      console.warn('Could not parse stored content:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  }

  async initFirestoreSync() {
    if (!db) return;
    try {
      const docRef = doc(db, 'settings', 'site_content');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        if (remoteData && remoteData.content) {
          const localTime = this.content._lastModified || 0;
          const remoteTime = remoteData.lastModified || (remoteData.updatedAt ? new Date(remoteData.updatedAt).getTime() : 0);

          // If local content was saved more recently than remote Firestore data,
          // do NOT overwrite local changes with stale cloud data.
          // Instead, sync our newer local content up to Firestore.
          if (localTime > remoteTime) {
            console.info('Local content is newer than Firestore remote data. Preserving local edits and syncing to cloud.');
            try {
              await setDoc(docRef, {
                content: this.content,
                updatedAt: new Date().toISOString(),
                lastModified: localTime
              }, { merge: true });
            } catch (e) {}
            return;
          }

          this.content = {
            ...this.content,
            ...remoteData.content,
            _lastModified: remoteTime,
            settings: {
              ...this.content.settings,
              ...(remoteData.content.settings || {}),
              // Preserve the correct password if not explicitly set
              adminPassword: remoteData.content.settings?.adminPassword || this.content.settings.adminPassword
            }
          };
          this.persistLocally();
          this.notify();
        }
      }
    } catch (err) {
      console.info('Firestore remote sync unavailable, using local persistence.');
    }
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

    if (db) {
      try {
        const docRef = doc(db, 'settings', 'site_content');
        await setDoc(docRef, { 
          content: this.content, 
          updatedAt: new Date().toISOString(),
          lastModified: now 
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore write notice (local changes preserved):', err.message);
      }
    }
    return true;
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
      } catch (e) {}
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
    } catch (e) {}
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
      firebaseSignOut(auth).catch(() => {});
    }

    this.notify();
  }
}

export const contentStore = new ContentStore();

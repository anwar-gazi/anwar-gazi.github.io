// mega-header.js
// CASE_STUDIES is expected to be available globally from case-data.js

class MegaHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._initialized = false;
  }

  _initGroups() {
    if (window.CASE_STUDIES && window.CASE_STUDIES.length > 0) {
      this._groups = this._groupItems(window.CASE_STUDIES);
      return true;
    }
    return false;
  }

  _groupItems(items) {
    const groups = {};
    items.forEach(item => {
      const tag = item.tag || 'Others';
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(item);
    });
    return groups;
  }

  connectedCallback() {
    // Retry logic in case case-data.js loads late or hasn't run yet
    const maxRetries = 50;
    let attempts = 0;

    const tryInit = () => {
      attempts++;
      if (this._initGroups()) {
        this.render();
        this._setupEventListeners();
      } else {
        if (attempts < maxRetries) {
          setTimeout(tryInit, 100);
        } else {
          console.error('MegaHeader: Failed to load CASE_STUDIES after multiple attempts.');
          // Render a fallback or empty state if needed, but for now just log error
          // Could render a simple header without the mega menu part
          this.renderFallback();
        }
      }
    };

    tryInit();
  }

  _setupEventListeners() {
    const trigger = this.shadowRoot.querySelector('.nav-trigger');
    const menu = this.shadowRoot.querySelector('.mega-menu');
    const header = this.shadowRoot.querySelector('header');

    if (trigger && menu) {
      // Hover for desktop
      trigger.addEventListener('mouseenter', () => this._openMenu());
      header.addEventListener('mouseleave', () => this._closeMenu());

      // Click for mobile/touch or keyboard
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this._toggleMenu();
      });
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this._closeMenu();
    });
  }

  _openMenu() {
    const menu = this.shadowRoot.querySelector('.mega-menu');
    const trigger = this.shadowRoot.querySelector('.nav-trigger');
    if (menu) menu.classList.add('active');
    if (trigger) trigger.classList.add('active');
    this.setAttribute('open', '');
  }

  _closeMenu() {
    const menu = this.shadowRoot.querySelector('.mega-menu');
    const trigger = this.shadowRoot.querySelector('.nav-trigger');
    if (menu) menu.classList.remove('active');
    if (trigger) trigger.classList.remove('active');
    this.removeAttribute('open');
  }

  _toggleMenu() {
    const menu = this.shadowRoot.querySelector('.mega-menu');
    if (menu && menu.classList.contains('active')) {
      this._closeMenu();
    } else {
      this._openMenu();
    }
  }

  renderFallback() {
    // Just render the header part without the mega menu items if data fails
    this._groups = {}; // Empty groups
    this.render();
    // Hide the trigger or make it just a link? 
    // For now, render standard header. The menu will just be empty.
  }

  render() {
    // Flatten items from window.CASE_STUDIES (already sorted in source via case-data.js)
    const items = window.CASE_STUDIES || [];

    const gridHtml = items.map((item, index) => {
      const weight = parseInt(item.weight) || 0;
      let spanClass = '';

      if (weight >= 95) {
        spanClass = 'span-both';
      } else if (weight >= 90) {
        spanClass = 'span-col-2';
      }

      // Mapping tags to contextual gradient classes
      let colorClass = '';
      let darkTextClass = ''; // For high-contrast text on dark backgrounds
      const tag = item.tag;
      if (['GovTech', 'Infrastructure'].includes(tag)) {
        colorClass = 'cat-govtech';
        darkTextClass = 'dark-text';
      } else if (['Fintech', 'Logistics'].includes(tag)) {
        colorClass = 'cat-fintech';
        darkTextClass = 'dark-text';
      } else if (['Media'].includes(tag)) {
        colorClass = 'cat-media';
        darkTextClass = 'dark-text';
      } else if (['System Architecture', 'Backend Engineering', 'Engineering RCA', 'Performance Eng.', 'Frontend Performance'].includes(tag)) {
        colorClass = 'cat-eng';
        darkTextClass = 'dark-text';
      } else if (['Healthcare', 'Telephony'].includes(tag)) {
        colorClass = 'cat-specialist';
        darkTextClass = 'dark-text';
      }

      // For compact bento, we'll show first 3 tech tags as small badges
      const techBadges = (item.tech_stack || []).slice(0, 3)
        .map(tech => `<span class="tech-tag">${tech}</span>`)
        .join('');

      return `
        <a href="${item.href}" class="menu-card ${spanClass} ${colorClass}">
          <div class="menu-card-header">
            <span class="menu-icon">${item.icon || '📄'}</span>
            <span class="menu-tag">${item.tag || 'Work'}</span>
          </div>
          <div class="menu-content">
            <div class="menu-title">${item.title}</div>
            <div class="tech-stack-mini">${techBadges}</div>
          </div>
        </a>
      `;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: sticky;
          top: 0;
          z-index: 1000;
          --primary: #039BE5; /* Firebase Blue */
          --primary-hover: #0288D1;
          --accent: #FFCA28; /* Firebase Amber */
          --accent-dark: #F57C00; /* Firebase Orange */
          --text-main: #0F172A;
          --text-muted: #475569;
          --border: #E2E8F0;
          --header-bg: rgba(255, 255, 255, 0.98);
          --menu-bg: #FFFFFF;
          --radius: 12px;
          --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          --shadow-lg: 0 10px 15px -3px rgba(255, 202, 40, 0.2), 0 4px 6px -4px rgba(255, 202, 40, 0.1);
        }

        header {
          background: var(--header-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          transition: all 0.3s ease;
          box-shadow: 0 1px 2px 0 rgba(60,64,67,0.05);
        }

        .header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.25rem;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          justify-content: space-between;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--text-main);
          min-width: fit-content;
        }

        .brand-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: conic-gradient(from 225deg, #4f46e5, #818cf8, #c7d2fe, #e0e7ff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #fff;
          font-size: 1rem;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.25);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        
        .brand-name { font-weight: 600; font-size: 14px; color: var(--text-main); }
        .brand-sub { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

        .nav-container { flex-grow: 1; display: flex; justify-content: center; }
        nav ul { display: flex; list-style: none; gap: 4px; margin: 0; padding: 0; }
        .header-right { display: flex; align-items: center; gap: 10px; }

        .nav-link {
          text-decoration: none;
          color: var(--text-main);
          font-size: 0.85rem;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          cursor: pointer;
        }

        .nav-link:hover, .nav-link.active {
          background: #F1F3F4;
          color: var(--accent);
        }

        .nav-trigger span { transition: transform 0.2s ease; font-size: 0.6em; margin-left: 4px; opacity: 0.7; }
        .nav-trigger.active span { transform: rotate(180deg); }

        /* Mega Menu - Premium Floating Pane */
        .mega-menu {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-10px);
          width: calc(100% - 40px);
          max-width: 1200px;
          background: var(--menu-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          padding: 1.5rem;
          box-shadow: 
            0 20px 50px -12px rgba(0, 0, 0, 0.15),
            0 10px 20px -5px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(0, 0, 0, 0.02);
          overflow-y: auto;
          max-height: 80vh;
          margin-top: 12px;
          z-index: 1001;
        }

        .mega-menu.active {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }

        .mega-container {
          max-width: 100%;
          margin: 0;
        }

        .mega-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        /* Menu Card Styling */
        .menu-card {
           display: flex;
           flex-direction: column;
           background: #FFFFFF;
           border: 1px solid var(--border-subtle);
           border-radius: 6px;
           padding: 12px;
           text-decoration: none;
           transition: all 0.2s ease;
           height: 100%;
           position: relative;
           justify-content: center;
           align-items: center;
           text-align: center;
        }

        .menu-card:hover {
           box-shadow: var(--shadow-lg);
           border-color: #cbd5e1;
           transform: translateY(-2px);
           z-index: 1;
        }

        .menu-card.span-col-2 {
           grid-column: span 2;
           background: #F8FAFC;
        }

        .menu-card.span-row-2 {
           grid-row: span 2;
        }

        .menu-card.span-both {
           grid-column: span 2;
           grid-row: span 2;
           background: linear-gradient(135deg, #FFFFFF 0%, #FFF9E6 100%);
           border-color: #FFE082;
        }

        /* Contextual Industry Gradients */
        
        /* GovTech / Infrastructure - Professional Blues */
        .cat-govtech {
          background: linear-gradient(135deg, #039BE5 0%, #01579B 100%) !important;
          border-color: #0288D1 !important;
        }
        .cat-govtech .menu-title, .cat-govtech .menu-desc { color: white !important; }
        .cat-govtech .menu-tag { background: #FFCA28 !important; color: #B26B00 !important; }
        .cat-govtech .tech-tag { background: rgba(255,255,255,0.1) !important; color: white !important; border-color: rgba(255,255,255,0.2) !important; }
        .cat-govtech .menu-icon { color: #FFCA28 !important; }

        /* Fintech / Logistics - Deep Teals/Greens */
        .cat-fintech {
          background: linear-gradient(135deg, #00897B 0%, #004D40 100%) !important;
          border-color: #00695C !important;
        }
        .cat-fintech .menu-title, .cat-fintech .menu-desc { color: white !important; }
        .cat-fintech .menu-tag { background: #80CBC4 !important; color: #004D40 !important; }
        .cat-fintech .tech-tag { background: rgba(255,255,255,0.1) !important; color: white !important; border-color: rgba(255,255,255,0.2) !important; }

        /* Media / Content - Vibrant Purples */
        .cat-media {
          background: linear-gradient(135deg, #673AB7 0%, #4527A0 100%) !important;
          border-color: #512DA8 !important;
        }
        .cat-media .menu-title, .cat-media .menu-desc { color: white !important; }
        .cat-media .menu-tag { background: #B39DDB !important; color: #311B92 !important; }
        .cat-media .tech-tag { background: rgba(255,255,255,0.1) !important; color: white !important; border-color: rgba(255,255,255,0.2) !important; }

        /* Engineering / Architecture / Performance - Modern Slates */
        .cat-eng {
          background: linear-gradient(135deg, #455A64 0%, #263238 100%) !important;
          border-color: #37474F !important;
        }
        .cat-eng .menu-title, .cat-eng .menu-desc { color: white !important; }
        .cat-eng .menu-tag { background: #90A4AE !important; color: #263238 !important; }
        .cat-eng .tech-tag { background: rgba(255,255,255,0.1) !important; color: white !important; border-color: rgba(255,255,255,0.2) !important; }

        /* Specialist (Healthcare/Telephony) - Cool Greys */
        .cat-specialist {
          background: linear-gradient(135deg, #546E7A 0%, #37474F 100%) !important;
          border-color: #455A64 !important;
        }
        .cat-specialist .menu-title, .cat-specialist .menu-desc { color: white !important; }
        .cat-specialist .menu-tag { background: #CFD8DC !important; color: #37474F !important; }
        .cat-specialist .tech-tag { background: rgba(255,255,255,0.1) !important; color: white !important; border-color: rgba(255,255,255,0.2) !important; }
        
        .menu-card.span-both .tech-stack-mini {
           justify-content: center;
        }
        
        .menu-card-header {
           display: flex;
           justify-content: center;
           align-items: center;
           gap: 8px;
           margin-bottom: 10px;
           width: 100%;
        }

        .menu-card-header .menu-tag {
           order: 2;
        }

        .menu-icon { font-size: 18px; }

        .menu-tag {
           font-size: 10px;
           text-transform: uppercase;
           background: #FFF9E6; /* Light Amber */
           color: #B26B00; /* Deep Burnt Orange */
           padding: 2px 8px;
           border-radius: 4px;
           font-weight: 700;
           letter-spacing: 0.05em;
        }

        .menu-title {
           font-size: 14px;
           font-weight: 600;
           color: var(--text-main);
           margin-bottom: 8px;
           line-height: 1.25;
        }

        .tech-stack-mini {
           display: flex;
           flex-wrap: wrap;
           gap: 4px;
           justify-content: center;
        }

         .tech-tag {
            font-size: 9px;
            background: #F1F5F9;
            color: var(--primary);
            padding: 1px 6px;
            border-radius: 4px;
            font-weight: 600;
            border: 1px solid #E2E8F0;
         }

        .menu-desc {
           font-size: 12px;
           color: var(--text-muted);
           line-height: 1.5;
           display: -webkit-box;
           -webkit-line-clamp: 2;
           -webkit-box-orient: vertical;
           overflow: hidden;
        }
        
        /* Mobile handling */
        @media (max-width: 768px) {
           .mega-grid { grid-template-columns: 1fr; }
           .menu-card.span-col-2 { grid-column: auto; }
           .header-inner { padding: 0 1rem; }
           .nav-link span { display: none; } /* Hide arrow on mobile if needed */
        }

      </style>

      <header>
        <div class="header-inner">
          <a href="/" class="brand">
            <div class="brand-avatar">AG</div>
            <div class="brand-text">
              <span class="brand-name">Anwar Gazi</span>
              <span class="brand-sub">Software Engineer</span>
            </div>
          </a>

          <div class="nav-container">
            <nav>
              <ul>
                <li>
                   <a href="#" class="nav-link nav-trigger">
                     Portfolio <span>▼</span>
                   </a>
                </li>
                <li><a href="/about.html" class="nav-link">About</a></li>
                <li><a href="/Uses.html" class="nav-link">Uses</a></li>
              </ul>
            </nav>
          </div>
          
          <div class="header-right">
            <slot name="right-content"></slot>
          </div>
        </div>

        <div class="mega-menu">
          <div class="mega-container">
            <div class="mega-grid">
              ${gridHtml}
            </div>
          </div>
        </div>
      </header>
    `;
  }
}

customElements.define('mega-header', MegaHeader);

// mega-header.js
// CASE_STUDIES is expected to be available globally from case-data.js

class MegaHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._initialized = false;
    this._closeTimeout = null;
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

    if (trigger && menu) {
      // Click for mobile/touch or keyboard
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent immediate close from document click
        this._toggleMenu();
      });

      // Prevent clicks inside menu from closing it
      menu.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Close button specific listener
      const closeBtn = this.shadowRoot.querySelector('.close-menu-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._closeMenu();
        });
      }
    }

    // Close on click anywhere else
    document.addEventListener('click', () => {
      if (this.hasAttribute('open')) {
        this._closeMenu();
      }
    });

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
    if (this.hasAttribute('disintegrating')) return; // Already closing

    this.setAttribute('disintegrating', '');
    this._disintegrate();

    // Final cleanup after animation (1.5s) completes
    // Using 1.6s to ensure all frames are rendered
    setTimeout(() => {
      const menu = this.shadowRoot.querySelector('.mega-menu');
      const trigger = this.shadowRoot.querySelector('.nav-trigger');

      if (menu) {
        // Suppress transition to prevent flicker upon class removal
        menu.style.transition = 'none';
        menu.classList.remove('active');
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
      }

      if (trigger) trigger.classList.remove('active');
      this.removeAttribute('open');
      this.removeAttribute('disintegrating');
      this._clearParticles();

      // Reset menu style for next opening after attributes are cleared
      requestAnimationFrame(() => {
        if (menu) {
          menu.style.transition = '';
          menu.style.opacity = '';
          menu.style.visibility = '';
          menu.style.setProperty('--mask-pos', '100%');
        }
      });
    }, 1600);
  }

  _disintegrate() {
    const canvas = this.shadowRoot.querySelector('#particle-canvas');
    if (!canvas) return;

    const menu = this.shadowRoot.querySelector('.mega-menu');
    const cards = this.shadowRoot.querySelectorAll('.menu-card');
    const ctx = canvas.getContext('2d');

    canvas.width = menu.offsetWidth;
    canvas.height = menu.offsetHeight;

    const particles = [];

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const relativeTop = rect.top - menuRect.top;
      const relativeLeft = rect.left - menuRect.left;

      const cardStyle = getComputedStyle(card);
      const color = cardStyle.backgroundColor;

      for (let i = 0; i < 60; i++) {
        particles.push({
          x: relativeLeft + Math.random() * rect.width,
          y: relativeTop + Math.random() * rect.height,
          vx: Math.random() * 4 - 1, // Mostly drift right
          vy: Math.random() * -5 - 2, // Drift up (ash)
          size: Math.random() * 4 + 1,
          opacity: 1,
          life: 1 + Math.random(),
          color: color
        });
      }
    });

    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / 1500;

      // Update mask
      const maskSize = Math.max(0, 100 - progress * 130);
      menu.style.setProperty('--mask-pos', `${maskSize}%`);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx + (Math.random() - 0.5); // Add jitter
        p.y += p.vy;
        p.opacity -= 0.008;

        if (p.opacity > 0) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  _clearParticles() {
    const canvas = this.shadowRoot.querySelector('#particle-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
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
    // Flatten items from window.CASE_STUDIES and sort by weight for optimal bento packing
    const rawItems = window.CASE_STUDIES || [];
    const items = [...rawItems].sort((a, b) => (parseInt(b.weight) || 0) - (parseInt(a.weight) || 0));

    // Calculate grid columns basically to detect gaps
    // repeat(auto-fill, minmax(450px, 1fr))
    const containerWidth = window.innerWidth - 128; // Subtracting the 4rem padding (64px each side)
    const cols = Math.floor(containerWidth / 450) || 1;

    const fillerPool = [
      { msg: "Staff-Level Infrastructure", flavor: "cta-indigo", icon: "🚀" },
      { msg: "Scale Your Architecture", flavor: "cta-emerald", icon: "💎" },
      { msg: "Backend Performance RCA", flavor: "cta-slate", icon: "🛠️" },
      { msg: "Hire for Strategic Impact", flavor: "cta-purple", icon: "🎯" },
      { msg: "Let's Build the Future", flavor: "cta-amber", icon: "📈" }
    ];

    // REDO: Let's just generate the HTML in one go including injections
    let finalHtml = '';
    let currentSlots = 0;
    let fillerIndex = 0;

    items.forEach((item, index) => {
      const weight = parseInt(item.weight) || 0;
      let span = (weight >= 90) ? 2 : 1;
      let spanClass = (weight >= 95) ? 'span-both' : (weight >= 90 ? 'span-col-2' : '');

      if ((currentSlots % cols) + span > cols && (currentSlots % cols) !== 0) {
        const gapSize = cols - (currentSlots % cols);
        for (let g = 0; g < gapSize; g++) {
          const f = fillerPool[fillerIndex % fillerPool.length];
          finalHtml += `
            <div class="menu-card cta-card ${f.flavor}" style="transition-delay: ${(items.length + fillerIndex) * 0.05 + 0.1}s">
              <div class="menu-icon">${f.icon}</div>
              <div class="menu-title">${f.msg}</div>
              <a href="mailto:anwar.gazi@gmail.com" class="cta-mini-btn">Get in Touch</a>
            </div>
          `;
          fillerIndex++;
          currentSlots++;
        }
      }

      // Render the item
      let colorClass = '';
      const tag = item.tag;
      if (['GovTech', 'Infrastructure'].includes(tag)) colorClass = 'cat-govtech';
      else if (['Fintech', 'Logistics'].includes(tag)) colorClass = 'cat-fintech';
      else if (['Media'].includes(tag)) colorClass = 'cat-media';
      else if (['System Architecture', 'Backend Engineering', 'Engineering RCA', 'Performance Eng.', 'Frontend Performance'].includes(tag)) colorClass = 'cat-eng';
      else if (['Healthcare', 'Telephony'].includes(tag)) colorClass = 'cat-specialist';

      const techBadges = (item.tech_stack || []).slice(0, 3).map(tech => `<span class="tech-tag">${tech}</span>`).join('');

      finalHtml += `
        <a href="${item.href}" class="menu-card ${spanClass} ${colorClass}" style="transition-delay: ${index * 0.05 + 0.1}s">
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
      currentSlots += span;
    });

    // Final row fillers
    const remaining = (cols - (currentSlots % cols)) % cols;
    for (let g = 0; g < remaining; g++) {
      const f = fillerPool[fillerIndex % fillerPool.length];
      finalHtml += `
        <div class="menu-card cta-card ${f.flavor}" style="transition-delay: ${(items.length + fillerIndex) * 0.05 + 0.1}s">
          <div class="menu-icon">${f.icon}</div>
          <div class="menu-title">${f.msg}</div>
          <a href="mailto:anwar.gazi@gmail.com" class="cta-mini-btn">Get in Touch</a>
        </div>
      `;
      fillerIndex++;
      currentSlots++;
    }

    const gridHtml = finalHtml;

    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
        }

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
          --menu-bg: rgba(255, 255, 255, 0.95);
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
          position: fixed;
          top: 64px;
          left: 0;
          width: 100vw;
          height: calc(100vh - 64px);
          background: var(--menu-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border);
          opacity: 0;
          visibility: hidden;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 4rem 0;
          overflow-y: auto;
          z-index: 1001;
        }

        .mega-menu.active {
          opacity: 1;
          visibility: visible;
        }

        :host([disintegrating]) .mega-menu {
          pointer-events: none;
          transition: none !important; /* Prevent transition conflicts with mask */
          mask-image: radial-gradient(circle at center, 
            rgba(0,0,0,1) 0%, 
            rgba(0,0,0,1) var(--mask-pos, 100%), 
            rgba(0,0,0,0) calc(var(--mask-pos, 100%) + 10%)
          );
          -webkit-mask-image: radial-gradient(circle at center, 
            rgba(0,0,0,1) 0%, 
            rgba(0,0,0,1) var(--mask-pos, 100%), 
            rgba(0,0,0,0) calc(var(--mask-pos, 100%) + 10%)
          );
          opacity: 1;
        }

        :host([disintegrating]) .menu-card {
          opacity: 0;
          transition: opacity 0.8s ease-out;
        }

        #particle-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1020;
        }

        .mega-container {
          max-width: none;
          margin: 0;
          padding: 0 4rem;
        }

        .mega-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 0;
        }

        /* Menu Card Styling */
        .menu-card {
           display: flex;
           flex-direction: column;
           background: #FFFFFF;
           border: 1px solid var(--border-subtle);
           margin: 0 -1px -1px 0;
           padding: 40px 24px;
           text-decoration: none;
           transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
           height: 100%;
           position: relative;
           justify-content: center;
           align-items: center;
           text-align: center;
           opacity: 0;
           transform: translateY(30px);
        }

        .mega-menu.active .menu-card {
           opacity: 1;
           transform: translateY(0);
        }

        .menu-card:hover {
           box-shadow: var(--shadow-lg);
           border-color: #cbd5e1;
           transform: translateY(-2px);
           z-index: 10;
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
           font-size: 22px;
           font-weight: 700;
           color: var(--text-main);
           margin-bottom: 12px;
           line-height: 1.2;
        }

        .tech-stack-mini {
           display: flex;
           flex-wrap: wrap;
           gap: 4px;
           justify-content: center;
        }

        /* Premium CTA Filler Flavors */
        .cta-card {
           padding: 40px;
           border: 1px solid rgba(255, 255, 255, 0.1);
           color: white;
           display: flex;
           flex-direction: column;
           justify-content: center;
           align-items: center;
        }
        
        .cta-card .menu-icon { font-size: 32px; margin-bottom: 16px; }
        .cta-card .menu-title { font-size: 18px; margin-bottom: 20px; color: white; opacity: 0.9; }
        
        .cta-mini-btn {
           font-size: 11px;
           text-transform: uppercase;
           letter-spacing: 0.1em;
           padding: 8px 16px;
           border-radius: 4px;
           background: rgba(255, 255, 255, 0.15);
           color: white;
           border: 1px solid rgba(255, 255, 255, 0.2);
           font-weight: 700;
           transition: all 0.2s;
        }
        
        .cta-mini-btn:hover {
           background: white;
           color: #0F172A;
           text-decoration: none;
        }

        .cta-indigo { background: linear-gradient(135deg, #312E81 0%, #1E1B4B 100%); }
        .cta-emerald { background: linear-gradient(135deg, #064E3B 0%, #064E3B 100%); }
        .cta-slate { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); }
        .cta-purple { background: linear-gradient(135deg, #4C1D95 0%, #2E1065 100%); }
        .cta-amber { background: linear-gradient(135deg, #78350F 0%, #451A03 100%); }

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

        .close-menu-btn {
          position: absolute;
          top: 32px;
          right: 32px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1010;
          color: var(--text-muted);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .close-menu-btn:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: rotate(90deg) scale(1.1);
          color: var(--text-main);
          border-color: rgba(0, 0, 0, 0.2);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .close-menu-btn svg {
          width: 20px;
          height: 20px;
        }
        
        /* Mobile handling */
        @media (max-width: 768px) {
           .mega-grid { grid-template-columns: 1fr; }
           .menu-card { grid-column: auto !important; grid-row: auto !important; }
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
          <canvas id="particle-canvas"></canvas>
          <button class="close-menu-btn" aria-label="Close Case Study Explorer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
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

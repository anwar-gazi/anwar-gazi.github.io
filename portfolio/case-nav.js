// case-nav.js
import { CASE_STUDIES } from './case-data.js';

class CaseNav extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._base = new URL('.', import.meta.url);
    this._items = CASE_STUDIES.map(item => ({
      ...item,
      absHref: new URL(item.href, this._base).href,
    }));
    this._homeHref = new URL('index.html', this._base).href;
    this._resumeHref = new URL('../index.html', this._base).href;
    this._navEl = null;
    this._toggleBtn = null;
    this._floatingToggle = null;
    this._scrim = null;
    this._expandedWidth = 260;
    this._collapsedWidth = 88;
    this._mediaQuery = window.matchMedia('(max-width: 900px)');
    this._isMobile = this._mediaQuery.matches;
    this._open = !this._isMobile;
    this._handleMediaChange = (event) => {
      this._isMobile = event.matches;
      this._open = !this._isMobile;
      this.updateState();
    };
  }

  connectedCallback() {
    this.render();
    if (this._mediaQuery?.addEventListener) {
      this._mediaQuery.addEventListener('change', this._handleMediaChange);
    } else if (this._mediaQuery?.addListener) {
      this._mediaQuery.addListener(this._handleMediaChange);
    }
  }

  disconnectedCallback() {
    if (this._mediaQuery?.removeEventListener) {
      this._mediaQuery.removeEventListener('change', this._handleMediaChange);
    } else if (this._mediaQuery?.removeListener) {
      this._mediaQuery.removeListener(this._handleMediaChange);
    }
    this.resetBodyOffset();
  }

  render() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        position: fixed;
        inset: 0 auto 0 0;
        z-index: 1200;
        display: block;
        pointer-events: none;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .case-nav {
        --nav-width: 351px;
        --nav-collapsed-width: 119px;
        height: 100vh;
        width: var(--nav-width);
        background: linear-gradient(180deg, rgba(7, 11, 24, 0.96), rgba(9, 14, 30, 0.94));
        border-right: 1px solid rgba(148, 163, 184, 0.32);
        box-shadow: 10px 0 38px rgba(2, 6, 23, 0.5);
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px 12px 18px 14px;
        transition: width 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
        backdrop-filter: blur(10px);
        position: relative;
        z-index: 2;
        pointer-events: auto;
      }

      .case-nav.collapsed {
        width: var(--nav-collapsed-width);
      }

      .case-nav.is-mobile {
        width: min(86vw, 320px);
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.55);
      }

      .case-nav.is-mobile.mobile-hidden {
        transform: translateX(-105%);
        box-shadow: none;
        pointer-events: none;
      }

      .brand-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .brand-actions {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        flex: 1;
      }

      .brand-link {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 9px 10px;
        border-radius: 12px;
        background: rgba(148, 163, 184, 0.12);
        border: 1px solid rgba(148, 163, 184, 0.28);
        color: #e5e7eb;
        text-decoration: none;
        flex: 1;
        min-width: 0;
      }

      .brand-link:hover {
        border-color: rgba(99, 102, 241, 0.6);
        background: rgba(99, 102, 241, 0.12);
      }

      .brand-actions .brand-link {
        flex: 1;
        min-width: 0;
        width: 100%;
      }

      .brand-logo {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: linear-gradient(135deg, #6366f1, #22d3ee);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        color: #020617;
        box-shadow: 0 12px 30px rgba(99, 102, 241, 0.45);
        flex-shrink: 0;
      }

      .brand-copy {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
        gap: 2px;
        min-width: 0;
      }

      .brand-title {
        font-size: 13px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        font-weight: 650;
      }

      .brand-sub {
        font-size: 11px;
        color: #cbd5f5;
        opacity: 0.8;
      }

      .toggle {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.45);
        background: linear-gradient(150deg, #0b1220, #0f172a);
        color: #e5e7eb;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
        flex-shrink: 0;
      }

      .toggle:hover {
        border-color: rgba(99, 102, 241, 0.65);
      }

      .section-title {
        font-size: 11px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #94a3b8;
        padding: 0 2px;
      }

      .list {
        flex: 1;
        overflow-y: auto;
        padding: 6px 4px 6px 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        scrollbar-gutter: stable;
      }

      .item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 10px;
        border-radius: 12px;
        text-decoration: none;
        color: #e5e7eb;
        border: 1px solid transparent;
        transition: background 0.14s ease, border-color 0.14s ease, transform 0.14s ease;
      }

      .item:hover {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.35);
        transform: translateX(2px);
      }

      .item.active {
        background: rgba(99, 102, 241, 0.16);
        border-color: rgba(99, 102, 241, 0.55);
        box-shadow: 0 12px 28px rgba(99, 102, 241, 0.15);
      }

      .item-icon {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: rgba(99, 102, 241, 0.16);
        border: 1px solid rgba(99, 102, 241, 0.35);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }

      .label {
        flex: 1;
        font-size: 13px;
        line-height: 1.35;
      }

      .tag {
        font-size: 11px;
        padding: 4px 7px;
        border-radius: 999px;
        background: rgba(99, 102, 241, 0.14);
        color: #cbd5f5;
        border: 1px solid rgba(99, 102, 241, 0.35);
        white-space: nowrap;
      }

      .case-nav.collapsed .brand-copy,
      .case-nav.collapsed .label,
      .case-nav.collapsed .tag,
      .case-nav.collapsed .section-title {
        opacity: 0;
        max-width: 0;
        transform: translateX(-8px);
        pointer-events: none;
      }

      .case-nav.collapsed .brand-link {
        justify-content: center;
        padding: 9px;
      }

      .case-nav.collapsed .brand-actions {
        gap: 6px;
        align-items: center;
      }

      .case-nav.collapsed .item {
        justify-content: center;
      }

      .case-nav.collapsed .item:hover {
        transform: none;
      }

      .scrim {
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.55);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.18s ease;
        z-index: 1;
      }

      .scrim.visible {
        opacity: 1;
        pointer-events: auto;
      }

      .floating-toggle {
        position: fixed;
        top: 14px;
        left: 14px;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.55);
        background: linear-gradient(150deg, #0b1220, #111827);
        color: #e5e7eb;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
        z-index: 3;
        pointer-events: auto;
      }

      .floating-toggle:hover {
        border-color: rgba(99, 102, 241, 0.65);
      }

      @media (max-width: 900px) {
        .case-nav {
          padding-top: 18px;
          padding-bottom: 18px;
        }

        .toggle {
          display: none;
        }

        .floating-toggle {
          display: inline-flex;
        }
      }
    `;

    const wrapper = document.createElement('nav');
    wrapper.className = 'case-nav';

    const brandRow = document.createElement('div');
    brandRow.className = 'brand-row';

    const brandActions = document.createElement('div');
    brandActions.className = 'brand-actions';

    const home = document.createElement('a');
    home.className = 'brand-link';
    home.href = this._homeHref;
    home.setAttribute('aria-label', 'Back to portfolio home');
    home.innerHTML = `
      <span class="brand-logo">⌂</span>
      <div class="brand-copy">
        <span class="brand-title">Case studies</span>
        <span class="brand-sub">Portfolio home</span>
      </div>
    `;

    const resume = document.createElement('a');
    resume.className = 'brand-link';
    resume.href = this._resumeHref;
    resume.target = '_blank';
    resume.rel = 'noreferrer';
    resume.setAttribute('aria-label', 'Go to resume site');
    resume.innerHTML = `
      <span class="brand-logo">R</span>
      <div class="brand-copy">
        <span class="brand-title">Resume ↗</span>
        <span class="brand-sub">Root site</span>
      </div>
    `;

    const toggle = document.createElement('button');
    toggle.className = 'toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Toggle case study navigation');
    toggle.addEventListener('click', () => this.toggle());
    toggle.textContent = '◀';

    brandActions.append(home, resume);
    brandRow.append(brandActions, toggle);

    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'section-title';
    sectionTitle.textContent = 'Case studies';

    const list = document.createElement('div');
    list.className = 'list';
    list.setAttribute('role', 'navigation');
    list.setAttribute('aria-label', 'Case studies');

    const current = window.location.href.split('#')[0];

    this._items.forEach(item => {
      const link = document.createElement('a');
      link.className = 'item';
      link.href = item.absHref;
      link.title = item.label;

      const target = new URL(item.absHref);
      const active = current === target.href || current.endsWith(target.pathname);
      if (active) link.classList.add('active');

      const icon = document.createElement('span');
      icon.className = 'item-icon';
      icon.textContent = item.icon || '•';

      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = item.label;

      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = item.tag;

      link.append(icon, label, tag);
      list.appendChild(link);
    });

    wrapper.append(brandRow, sectionTitle, list);

    const scrim = document.createElement('div');
    scrim.className = 'scrim';
    scrim.addEventListener('click', () => {
      if (this._isMobile && this._open) this.toggle(false);
    });

    const floatingToggle = document.createElement('button');
    floatingToggle.className = 'floating-toggle';
    floatingToggle.type = 'button';
    floatingToggle.setAttribute('aria-label', 'Open case study navigation');
    floatingToggle.addEventListener('click', () => this.toggle());
    floatingToggle.textContent = '☰';

    this._shadow.innerHTML = '';
    this._shadow.append(style, wrapper, scrim, floatingToggle);

    this._navEl = wrapper;
    this._toggleBtn = toggle;
    this._floatingToggle = floatingToggle;
    this._scrim = scrim;
    this.updateState();
  }

  toggle(force) {
    this._open = typeof force === 'boolean' ? force : !this._open;
    this.updateState();
  }

  updateState() {
    if (!this._navEl || !this._toggleBtn || !this._floatingToggle || !this._scrim) return;
    this._navEl.classList.toggle('collapsed', !this._open && !this._isMobile);
    this._navEl.classList.toggle('is-mobile', this._isMobile);
    this._navEl.classList.toggle('mobile-hidden', this._isMobile && !this._open);

    this._toggleBtn.setAttribute('aria-expanded', String(this._open));
    this._toggleBtn.setAttribute('aria-label', this._open ? 'Collapse navigation' : 'Expand navigation');
    this._toggleBtn.textContent = this._open ? '◀' : '▶';

    this._floatingToggle.setAttribute('aria-label', this._open ? 'Close navigation' : 'Open navigation');
    this._floatingToggle.textContent = this._open ? '✕' : '☰';

    this._scrim.classList.toggle('visible', this._isMobile && this._open);
    this.applyBodyOffset();
  }

  applyBodyOffset() {
    const body = document.body;
    if (!body) return;

    if (this._isMobile) {
      body.style.paddingLeft = '0px';
      body.style.removeProperty('--case-nav-space');
      body.style.overflow = this._open ? 'hidden' : '';
      return;
    }

    body.style.overflow = '';
    const offset = this._open ? this._expandedWidth : this._collapsedWidth;
    body.style.setProperty('--case-nav-space', `${offset}px`);
    body.style.paddingLeft = `${offset}px`;
  }

  resetBodyOffset() {
    const body = document.body;
    if (!body) return;
    body.style.removeProperty('padding-left');
    body.style.removeProperty('--case-nav-space');
    body.style.removeProperty('overflow');
  }
}

customElements.define('case-nav', CaseNav);

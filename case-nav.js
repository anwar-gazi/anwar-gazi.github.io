// case-nav.js
const CASE_STUDIES = [
  { label: 'AmiProbashi – Migrant Services', href: 'amiprobashi/index.html', tag: 'GovTech' },
  { label: 'Multi-tenant News CMS (DoptorITMart)', href: 'dailyniropekkho_doptorit/index.html', tag: 'Media' },
  { label: 'ShurjoPay – Gateway Reliability', href: 'shurjopay/index.html', tag: 'Fintech' },
  { label: 'ShurjoPay – Brac Bank COF', href: 'shurjopay/shurjopay_bracbank_cof_case_study.html', tag: 'Fintech' },
  { label: 'CPC/CPA/CPM Bid Prediction (SulacoTec)', href: 'sulacotec/index.html', tag: 'AdTech' },
  { label: 'Freight Operations Portal (OneIXchange)', href: 'freightforwarding_oneixchange/index.html', tag: 'Logistics' },
  { label: 'Healthcare Plan Operations (MS Concitus)', href: 'healthcare/index.html', tag: 'Healthcare' },
  { label: 'Twilio + Asterisk IVR Automation', href: 'telephony/index.html', tag: 'Telephony' },
  { label: 'eBay Inventory & Packing Automation', href: 'dropshipping/index.html', tag: 'Ecommerce' },
  { label: 'IIG Ticketing & Notifications Prototype', href: 'IIG/index.html', tag: 'Infrastructure' },
  { label: 'Notion-Clone – Login RCA', href: 'projects/notion-clone-login-issue.html', tag: 'RCA' },
  { label: 'Zustand Migration – Re-render Analysis', href: 'projects/zustand-migration-rerender-analysis.html', tag: 'RCA' },
  { label: 'BoardContext → Zustand Migration Docs', href: 'projects/zustand-migration-docs.html', tag: 'State Mgmt' },
  { label: 'TaskPane Flicker Investigation', href: 'projects/taskpane-flicker-investigation.html', tag: 'Next.js' },
];

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
    this._navEl = null;
    this._toggleBtn = null;
    this._open = !window.matchMedia('(max-width: 1100px)').matches;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        position: fixed;
        top: 86px;
        left: 12px;
        z-index: 1200;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        display: block;
        pointer-events: auto;
      }

      .case-nav {
        width: 248px;
        background: linear-gradient(160deg, rgba(15,23,42,0.96), rgba(3,7,18,0.94));
        border: 1px solid rgba(148, 163, 184, 0.3);
        border-radius: 14px;
        box-shadow: 0 18px 60px rgba(3, 7, 18, 0.65);
        overflow: hidden;
        backdrop-filter: blur(12px);
        transform: translateX(0);
        transition: transform 0.22s ease, box-shadow 0.22s ease;
      }

      .case-nav.collapsed {
        transform: translateX(calc(-100% + 48px));
        box-shadow: none;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 12px 6px 14px;
        gap: 10px;
      }

      .title {
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #c7d2fe;
        font-weight: 600;
      }

      .home-link {
        font-size: 12px;
        color: #e5e7eb;
        padding: 6px 10px;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.3);
        background: rgba(148, 163, 184, 0.14);
        text-decoration: none;
        display: inline-flex;
        gap: 6px;
        align-items: center;
      }

      .home-link:hover {
        border-color: rgba(99, 102, 241, 0.5);
        background: rgba(99, 102, 241, 0.12);
      }

      .list {
        padding: 4px 6px 10px;
        max-height: calc(100vh - 170px);
        overflow-y: auto;
      }

      .item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 8px;
        margin: 4px 0;
        border-radius: 10px;
        text-decoration: none;
        color: #e5e7eb;
        border: 1px solid transparent;
        transition: background 0.14s ease, border-color 0.14s ease, transform 0.14s ease;
      }

      .item:hover {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.4);
        transform: translateX(2px);
      }

      .item.active {
        background: rgba(99, 102, 241, 0.16);
        border-color: rgba(99, 102, 241, 0.6);
        box-shadow: 0 10px 28px rgba(99, 102, 241, 0.12);
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #c7d2fe, #6366f1);
        flex-shrink: 0;
      }

      .label {
        flex: 1;
        font-size: 13px;
        line-height: 1.3;
      }

      .tag {
        font-size: 10px;
        padding: 3px 7px;
        border-radius: 999px;
        background: rgba(99, 102, 241, 0.14);
        color: #cbd5f5;
        border: 1px solid rgba(99, 102, 241, 0.35);
        white-space: nowrap;
      }

      .toggle {
        position: absolute;
        right: -16px;
        top: 16px;
        width: 32px;
        height: 32px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.4);
        background: linear-gradient(150deg, #0b1220, #0f172a);
        color: #e5e7eb;
        cursor: pointer;
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.4);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.18s ease;
      }

      .toggle:hover {
        transform: translateX(2px);
        border-color: rgba(99, 102, 241, 0.6);
      }

      @media (max-width: 1100px) {
        :host {
          top: 68px;
          left: 8px;
        }

        .case-nav {
          width: min(86vw, 300px);
        }
      }
    `;

    const wrapper = document.createElement('div');
    wrapper.className = 'case-nav';

    const header = document.createElement('div');
    header.className = 'header';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = 'Case Studies';

    const home = document.createElement('a');
    home.className = 'home-link';
    home.href = this._homeHref;
    home.innerHTML = '⌂ Home';

    header.append(title, home);

    const list = document.createElement('div');
    list.className = 'list';
    list.setAttribute('role', 'navigation');
    list.setAttribute('aria-label', 'Case studies');

    const current = window.location.href.split('#')[0];

    this._items.forEach(item => {
      const link = document.createElement('a');
      link.className = 'item';
      link.href = item.absHref;

      const target = new URL(item.absHref);
      const active = current === target.href || current.endsWith(target.pathname);
      if (active) link.classList.add('active');

      const dot = document.createElement('span');
      dot.className = 'dot';

      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = item.label;

      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = item.tag;

      link.append(dot, label, tag);
      list.appendChild(link);
    });

    const toggle = document.createElement('button');
    toggle.className = 'toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Toggle case study navigator');
    toggle.addEventListener('click', () => this.toggle());
    toggle.textContent = '◀';

    wrapper.append(header, list, toggle);

    this._shadow.innerHTML = '';
    this._shadow.append(style, wrapper);

    this._navEl = wrapper;
    this._toggleBtn = toggle;
    this.updateState();
  }

  toggle() {
    this._open = !this._open;
    this.updateState();
  }

  updateState() {
    if (!this._navEl || !this._toggleBtn) return;
    this._navEl.classList.toggle('collapsed', !this._open);
    this._toggleBtn.setAttribute('aria-expanded', String(this._open));
    this._toggleBtn.textContent = this._open ? '◀' : '▶';
  }
}

customElements.define('case-nav', CaseNav);

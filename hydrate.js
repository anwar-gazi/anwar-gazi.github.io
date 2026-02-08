(() => {
  let tabsInitialized = false;

  async function fetchCv() {
    try {
      const res = await fetch('cv.json', { cache: 'no-store', credentials: 'same-origin' });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('Unable to load cv.json', err);
      return null;
    }
  }

  function setContact(cv) {
    const c = cv?.contact || {};
    const phone = c.phone || '';
    const email = c.email || '';
    const loc = c.location || '';
    const phoneHref = 'tel:' + phone.replace(/[^0-9+]/g, '').replace(/^\+?/, '+');
    const e = document.getElementById('side-email'); if (e && email) { e.textContent = email; e.href = `mailto:${email}`; }
    const p = document.getElementById('side-phone'); if (p && phone) { p.textContent = phone; p.href = phoneHref; }
    const locEl = document.getElementById('side-location'); if (locEl && loc) locEl.textContent = loc;
    const gh = document.getElementById('side-github'); if (gh && c.links?.github) gh.href = c.links.github;
    const pf = document.getElementById('side-portfolio'); if (pf && c.links?.portfolio) pf.href = c.links.portfolio;
    const nameEl = document.getElementById('side-name'); if (nameEl && cv?.name) nameEl.textContent = cv.name;
    const titleEl = document.getElementById('side-title'); if (titleEl && cv?.title) titleEl.textContent = cv.title;
  }

  function renderSummary(cv) {
    const el = document.getElementById('summary');
    if (el && cv?.summary) el.textContent = cv.summary;
  }

  function renderDomains(cv) {
    const wrap = document.getElementById('domains');
    if (!wrap) return;
    wrap.innerHTML = '';
    const domains = cv?.domains && typeof cv.domains === 'object' ? Object.entries(cv.domains) : [];
    domains.forEach(([name, detail], idx) => {
      const card = document.createElement('div');
      card.className = 'service-card';
      const icon = ['💻', '🧭', '🛠️', '📈', '🔒', '⚡', '📦', '☎️', '🩺'][idx % 9];
      const url = detail?.url || '#';
      const summary = detail?.summary || 'Hands-on delivery across this domain.';
      card.innerHTML = `
        <div style="display:flex; gap:12px;">
          <div style="font-size:18px; color:#f5b84a;">${icon}</div>
          <div>
            <h4>${name}</h4>
            <p>${summary}</p>
            ${detail?.url ? `<div style="margin-top:6px;"><a href="${url}" class="contact-value" target="_blank" rel="noreferrer">Related work ↗</a></div>` : ''}
          </div>
        </div>
      `;
      wrap.appendChild(card);
    });
  }

  function renderSkills(cv) {
    const container = document.getElementById('skills');
    if (!container) return;
    container.innerHTML = '';
    const groups = cv?.skills && typeof cv.skills === 'object' ? Object.entries(cv.skills) : [];
    groups.forEach(([group, items]) => {
      const card = document.createElement('div');
      card.className = 'skill-card';
      const tags = items && typeof items === 'object' ? Object.entries(items) : [];
      card.innerHTML = `
        <h5>${group.replace(/([A-Z])/g, ' $1').trim()}</h5>
        <div class="skill-tags">
          ${tags.map(([name, info]) => {
        const href = info?.url || '#';
        const title = info?.summary ? ` title="${info.summary.replace(/"/g, '&quot;')}"` : '';
        const isLink = info?.url;
        return isLink
          ? `<a class="tag" href="${href}" target="_blank" rel="noreferrer"${title}>${name} ↗</a>`
          : `<span class="tag"${title}>${name}</span>`;
      }).join('')}
        </div>
      `;
      container.appendChild(card);
    });
  }

  function renderTimeline(entries, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    entries.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'timeline-item';
      row.innerHTML = `
        <div class="timeline-header">
          <div>
            <p class="timeline-title">${item.title || item.degree || ''}</p>
            <p class="timeline-sub">${item.company || item.school || ''}${item.location ? ' · ' + item.location : ''}</p>
          </div>
          <span class="timeline-period">${item.period || ''}</span>
        </div>
        ${item.bullets ? `<ul class="timeline-bullets">${item.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
      `;
      container.appendChild(row);
    });
  }

  function renderPortfolio(items = []) {
    const container = document.getElementById('portfolio-list');
    if (!container) return;
    container.innerHTML = '';
    items.forEach(item => {
      const period = item.period || '';
      const href = item.url || '#';
      const row = document.createElement('div');
      row.className = 'timeline-item';
      row.innerHTML = `
        <div class="timeline-header">
          <div>
            <p class="timeline-title">${item.title}</p>
            <p class="timeline-sub">${item.blurb}</p>
          </div>
          <span class="timeline-period">${period}</span>
        </div>
        <div style="margin-top:8px;">
          <a href="${href}" class="contact-value" target="_blank" rel="noreferrer">Open case study ↗</a>
        </div>
      `;
      container.appendChild(row);
    });
  }

  function initTabs() {
    if (tabsInitialized) return;
    tabsInitialized = true;
    const buttons = document.querySelectorAll('.tab-btn');
    const pages = document.querySelectorAll('[data-page]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        pages.forEach((p) => p.classList.add('hidden'));
        const page = document.querySelector(`[data-page="${btn.dataset.tab}"]`);
        if (page) page.classList.remove('hidden');
      });
    });
  }

  async function hydrate() {
    const cv = await fetchCv();
    if (!cv) {
      window.location.href = 'index.static.html';
      return;
    }
    setContact(cv);
    renderSummary(cv);
    renderDomains(cv);
    renderSkills(cv);
    renderTimeline(cv.experience || [], 'experience');
    renderTimeline(cv.education || [], 'education');
    renderPortfolio(cv.portfolioItems || []);
    initTabs();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', hydrate)
    : hydrate();
})();

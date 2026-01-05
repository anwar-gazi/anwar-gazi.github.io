// cta-bot.js
class CtaBot extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._shell = null;
    this._state = 'bar'; // enforced state: 'bar' | 'open' | 'toast'
    this._preferredState = 'bar'; // user last chosen state
    this._userCollapsed = false;
    this._lastScrollY = 0;
    this._onScroll = null;
    this._onResize = null;
    this._stateKey = 'ctaState';
    this._collapsedKey = 'ctaCollapsed';
    this._posKey = 'ctaPos';
    // Default fallback: professional, Muslim-themed male avatar (can be overridden via photo-src)
    this._photoSrc = 'https://api.dicebear.com/6.x/adventurer/svg?seed=Imran&accessories=turban&hairColor=black&skinColor=brown';
    this._audioSrc = null;
    this._storagePrefix = '';
    this._hasAttrEmail = false;
    this._hasAttrPhone = false;
    this._hasAttrPhoto = false;
    this._cvJsonPath = null;
    this._cvPriority = 'primary';
    this._cvData = null;
    this._cvLoading = false;
    this._contact = {
      email: 'polarglow06@gmail.com',
      phoneDisplay: '+88 01534-303074',
      phoneHref: 'tel:+8801534303074',
    };
    this._dragging = false;
    this._dragStart = null;
    this._hasCustomPos = false;
    this._pos = null;
    this._progressFill = null;
    this._dragEnabled = false;
    this._idleTimer = null;
    this._idleDelay = 15000;
    this._lastAnimate = 0;
    this._animateCooldown = 90000;
    this._activityHandler = null;
    this._chime = null;
    this._muted = false;
    this._startMuted = false;
    this._idleActive = false;
    this._idleLoopTimer = null;
    this._audioPrimed = false;
    this._ringtonePlaying = false;
    this._incomingActive = false;
    this._actionDelay = 260;
    this._assetBase = null;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this._applyAttributes();

    // Default to bar on fresh load; user collapse will set toast later
    this._preferredState = 'bar';
    this._userCollapsed = false;

    this._contact = this._extractContact();

    this.innerHTML = `
      <footer class="cta-shell" data-state="bar">
          <div class="cta-surface">
            <div class="cta-surface-inner">
              <button class="cta-toast-expand" data-action="expand" type="button" aria-label="Expand">‹</button>
              <div class="cta-bar">
                <div class="cta-avatar">
                  <img class="cta-avatar-img" src="${this._photoSrc}" alt="Profile" loading="lazy" />
                  <span class="cta-status-dot" aria-hidden="true"></span>
                </div>
                <div class="cta-bar-text">
                  <div class="cta-kicker">Let’s work together</div>
                <div class="cta-bar-title">Open to Senior/Staff backend roles <span class="cta-status-pill inline-pill">● Available</span></div>
              </div>
              <div class="cta-bar-actions">
                <button class="cta-btn primary" data-action="open" type="button">Let’s talk</button>
                <button class="cta-icon-btn cta-close" data-action="dismiss" type="button" aria-label="Hide contact bar">✕</button>
              </div>
            </div>

            <div class="cta-panel">
              <div class="cta-panel-copy">
                <div class="cta-kicker">Available now</div>
                <div class="cta-title">Ship reliable systems together</div>
                <p class="cta-body">Backend-focused, senior leadership available now. <span class="cta-highlight">Dhaka (UTC+6)</span> · Replies within 1 business day.</p>
              </div>
            <div class="cta-panel-actions">
              <a class="cta-btn primary cta-action cta-email" data-prefix="Email " href="${this._contact.email ? `mailto:${this._contact.email}` : '#'}">Email ${this._contact.email}</a>
              <a class="cta-btn ghost cta-action cta-phone" data-prefix="Call / WhatsApp " href="${this._contact.phoneHref}">Call / WhatsApp ${this._contact.phoneDisplay}</a>
            </div>
            <button class="cta-minimize" data-action="collapse" type="button">Minimize</button>
          </div>
        </div>
        <div class="cta-sparkles" aria-hidden="true">
            <span class="sp1"></span><span class="sp2"></span><span class="sp3"></span>
            <span class="sp4"></span><span class="sp5"></span><span class="sp6"></span>
          </div>
          <div class="cta-idle-progress" aria-hidden="true">
            <div class="cta-idle-fill"></div>
          </div>
            <div class="cta-incoming-overlay" aria-hidden="true">
            <div class="incoming-wave">
              <img class="incoming-photo" src="${this._photoSrc}" alt="Minhaj" loading="lazy" />
              <span class="cta-status-dot incoming" aria-hidden="true"></span>
            </div>
            <div class="incoming-kicker">Incoming call</div>
            <div class="incoming-title">Let’s work together</div>
            <p class="incoming-sub">Minhaj is available — pick a channel to connect.</p>
            <button class="incoming-mute cta-action" type="button" aria-label="Mute ringtone" data-action="mute">🔊</button>
            <div class="incoming-actions">
              <a class="cta-btn primary cta-action cta-email" data-prefix="Answer via email: " href="${this._contact.email ? `mailto:${this._contact.email}` : '#'}">Answer via email: ${this._contact.email}</a>
              <a class="cta-btn ghost cta-action cta-phone" data-prefix="Call / WhatsApp: " href="${this._contact.phoneHref}">Call / WhatsApp: ${this._contact.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </footer>
    `;

    this._shell = this.querySelector('.cta-shell');
    if (!this._shell) return;
    this._progressFill = this.querySelector('.cta-idle-fill');

    this._setState(this._preferredState, { persistPreferred: false });
    this._applyResponsiveState();
    this._applySavedPosition();
    this._wireEvents();
    this._startIdleTracking();
    this._setupAudio();
    this._applyContactOnly();
    this._hydrateCvIfNeeded();
  }

  disconnectedCallback() {
    if (this._onScroll) {
      window.removeEventListener('scroll', this._onScroll);
    }
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
    }
    if (this._activityHandler) {
      window.removeEventListener('pointerdown', this._activityHandler);
      window.removeEventListener('pointermove', this._activityHandler);
      window.removeEventListener('touchstart', this._activityHandler);
      window.removeEventListener('keydown', this._activityHandler);
      window.removeEventListener('scroll', this._activityHandler);
    }
    if (this._idleTimer) {
      clearTimeout(this._idleTimer);
    }
    this._chime = null;
    this._progressFill = null;
    if (this._idleLoopTimer) {
      clearInterval(this._idleLoopTimer);
    }
    this._audioPrimed = false;
    this._ringtonePlaying = false;
    this._stopRingtone();
  }

  _resolveUrl(input, base) {
    if (!input) return input;
    const trimmed = String(input).trim();
    try {
      // Absolute URLs (http/https/data/blob/etc) go through as-is
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
        return new URL(trimmed).href;
      }
      // Leading slash: resolve relative to cta-bot.js directory
      if (trimmed.startsWith('/')) {
        const scriptBase = this._getScriptBase();
        if (scriptBase) {
          return new URL(trimmed.slice(1), scriptBase).href;
        }
        return trimmed;
      }
      // ./ or ../ : resolve relative to the current document
      if (trimmed.startsWith('./') || trimmed.startsWith('../')) {
        return new URL(trimmed, window.location.href).href;
      }
      // Fallback: resolve relative to current document
      return new URL(trimmed, window.location.href).href;
    } catch (_) {
      return trimmed;
    }
  }

  _getScriptBase() {
    if (this._assetBase) return this._assetBase;
    const scriptEl =
      document.currentScript ||
      Array.from(document.getElementsByTagName('script')).find((s) =>
        s.src && s.src.includes('cta-bot.js')
      );
    if (scriptEl && scriptEl.src) {
      try {
        this._assetBase = new URL('.', scriptEl.src).href;
      } catch (_) {
        this._assetBase = null;
      }
    }
    return this._assetBase;
  }

  _applyAttributes() {
    const prefixAttr = this.getAttribute('storage-prefix') || '';
    this._storagePrefix = prefixAttr || '';
    const prefix = this._storagePrefix ? `${this._storagePrefix}_` : '';
    this._stateKey = `${prefix}ctaState`;
    this._collapsedKey = `${prefix}ctaCollapsed`;
    this._posKey = `${prefix}ctaPos`;

    const photoAttr = this.getAttribute('photo-src');
    if (photoAttr) {
      this._hasAttrPhoto = true;
      this._photoSrc = this._resolveUrl(photoAttr);
    }
    const audioAttr = this.getAttribute('audio-src');
    if (audioAttr) {
      this._audioSrc = this._resolveUrl(audioAttr);
    }

    const cvJsonAttr = this.getAttribute('cvjson-src');
    if (cvJsonAttr) {
      this._cvJsonPath = this._resolveUrl(cvJsonAttr);
    }

    const cvPriorityAttr = this.getAttribute('cvjson-priority');
    if (cvPriorityAttr !== null) {
      const val = (cvPriorityAttr || '').trim().toLowerCase();
      // Anything other than explicit "primary" is treated as fallback/secondary (attrs win)
      this._cvPriority = val === 'primary' ? 'primary' : 'fallback';
    }

    const playAttr = this.getAttribute('audio-play');
    if (playAttr === null) {
      // attribute absent -> treat as false (muted)
      this._startMuted = true;
    } else {
      const val = (playAttr || '').trim().toLowerCase();
      if (val === '' || val === 'true') {
        this._startMuted = false;
      } else {
        this._startMuted = true;
      }
    }

    const idleAttr = this.getAttribute('idle-timeout');
    if (idleAttr) {
      const parsed = parseInt(idleAttr, 10);
      if (!Number.isNaN(parsed) && parsed > 500) {
        this._idleDelay = parsed;
      }
    }

    const dragAttr = this.getAttribute('drag-enabled');
    if (dragAttr !== null) {
      const val = (dragAttr || '').trim().toLowerCase();
      this._dragEnabled = val === 'true';
    }

    const emailAttr = this.getAttribute('email');
    const phoneAttr = this.getAttribute('phone');
    if (emailAttr) {
      this._hasAttrEmail = true;
      this._contact.email = emailAttr;
    }
    if (phoneAttr) {
      this._hasAttrPhone = true;
      this._contact.phoneDisplay = phoneAttr;
      this._contact.phoneHref = this._normalizePhoneHref(phoneAttr);
    }
  }

  _wireEvents() {
    const openBtn = this.querySelector('[data-action="open"]');
    const collapseBtn = this.querySelector('[data-action="collapse"]');
    const dismissBtn = this.querySelector('[data-action="dismiss"]');
    const expandBtn = this.querySelector('[data-action="expand"]');
    const emailLinks = this.querySelectorAll('.cta-email');
    const phoneLinks = this.querySelectorAll('.cta-phone');

    const stopBubble = (el) => {
      if (!el) return;
      el.addEventListener('pointerdown', (e) => e.stopPropagation(), { passive: false });
      el.addEventListener('click', (e) => e.stopPropagation());
    };

    if (openBtn) {
      stopBubble(openBtn);
      openBtn.addEventListener('click', () => {
        this._primeAudio();
        this._userCollapsed = false;
        this._lastAnimate = Date.now();
        this._stopIdleLoop();
        this._startIdleLoop();
      });
    }
    if (collapseBtn) {
      stopBubble(collapseBtn);
      collapseBtn.addEventListener('click', () => this._collapse(true));
    }
    if (dismissBtn) {
      stopBubble(dismissBtn);
      dismissBtn.addEventListener('click', () => this._toast());
    }
    if (expandBtn) {
      stopBubble(expandBtn);
      expandBtn.addEventListener('click', () => {
        this._userCollapsed = false;
        this._setState('bar');
      });
    }

    const muteBtn = this.querySelector('[data-action="mute"]');
    if (muteBtn) {
      stopBubble(muteBtn);
      muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleMute(muteBtn);
      });
    }
    emailLinks.forEach(stopBubble);
    phoneLinks.forEach(stopBubble);

    // Hover intent on desktop
    this._shell.addEventListener('mouseenter', () => {
      if (this._isMobile()) return;
      if (!this._userCollapsed) this._setState('open');
    });
    this._shell.addEventListener('mouseleave', () => {
      if (this._isMobile()) return;
      if (!this._userCollapsed) this._setState('bar');
      if (this._userCollapsed) this._setState('toast');
    });

    this._lastScrollY = window.scrollY;
    this._onScroll = () => {
      const doc = document.documentElement;
      const progress = (window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1);

      if (this._isMobile()) {
        this._setState('toast', { persistPreferred: false });
        return;
      }

      if (progress > 0.92) {
        this._setState('toast', { persistPreferred: false });
        return;
      }

      if (!this._userCollapsed) {
        this._setState('bar', { persistPreferred: false });
      }
    };
    window.addEventListener('scroll', this._onScroll, { passive: true });

    this._onResize = () => {
      this._applyResponsiveState();
      if (this._hasCustomPos && this._pos) {
        const clamped = this._clampPosition(this._pos.left, this._pos.top);
        this._setCustomPosition(clamped.left, clamped.top, { persist: true });
      }
    };
    window.addEventListener('resize', this._onResize, { passive: true });

    this.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this._resetIdleTimer();
      }
    });

    const dragHandle = this.querySelector('.cta-bar');
    if (dragHandle && this._dragEnabled) {
      dragHandle.addEventListener('pointerdown', (e) => this._startDrag(e));
    }
  }

  _openFromUser() {
    this._userCollapsed = false;
    this._setState('open');
  }

  _collapse(userInitiated = false) {
    if (userInitiated) {
      this._userCollapsed = true;
    }
    this._setState('bar');
  }

  _toast() {
    this._userCollapsed = true;
    this._setState('toast');
  }

  _setState(next, opts = {}) {
    const persistPreferred = opts.persistPreferred !== false;
    if (persistPreferred) {
      this._preferredState = next;
    }

    const enforced = this._isMobile() ? 'toast' : next;
    this._state = enforced;
    if (this._shell) {
      this._shell.setAttribute('data-state', enforced);
    }

    this._persistState(persistPreferred ? next : this._preferredState);
  }

  _isMobile() {
    return window.matchMedia('(max-width: 760px)').matches;
  }

  _applyResponsiveState() {
    if (this._isMobile()) {
      this._setState('toast', { persistPreferred: false });
      return;
    }
    if (!this._userCollapsed && this._state === 'toast') {
      this._setState(this._preferredState || 'bar', { persistPreferred: false });
    }
  }

  _persistState(preferredState) {
    this._writeStorage(this._stateKey, preferredState);
    this._writeStorage(this._collapsedKey, String(this._userCollapsed));
  }

  _readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  _writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      // ignore write failures
    }
  }

  _removeStorage(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
  }

  _extractContact() {
    const email = this._contact.email;
    const phoneDisplay = this._contact.phoneDisplay;
    const phoneHref = this._normalizePhoneHref(phoneDisplay || this._contact.phoneDisplay);
    return {
      email,
      phoneDisplay,
      phoneHref,
    };
  }

  _normalizePhoneHref(phone) {
    if (!phone) return this._contact.phoneHref;
    const digits = phone.replace(/[^0-9+]/g, '');
    const normalized = digits.startsWith('+') ? digits : `+${digits}`;
    return `tel:${normalized.replace(/[^0-9+]/g, '')}`;
  }

  _applyContactOnly() {
    this._contact = this._extractContact();
    this._applyContact();
  }

  _hydrateCvIfNeeded() {
    if (!this._cvJsonPath || this._cvLoading) return;
    this._cvLoading = true;
    fetch(this._cvJsonPath, {
      credentials: 'same-origin',
      cache: 'no-store',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((cv) => {
        this._cvLoading = false;
        if (cv) this._applyCvData(cv);
      })
      .catch(() => {
        this._cvLoading = false;
      });
  }

  _applyCvData(cv) {
    if (!cv || typeof cv !== 'object') return;
    this._cvData = cv;
    const cvContact = cv.contact || {};
    const emailFromCv = cvContact.email || this._contact.email;
    const phoneFromCv = cvContact.phone || cvContact.phoneDisplay || this._contact.phoneDisplay;
    const phoneHrefFromCv = this._normalizePhoneHref(phoneFromCv || this._contact.phoneDisplay);

    const cvCta = cv.ctaBot || {};
    const ctaPhoto = cvCta.photoSrc || cvCta.photo;
    const ctaAudioSrc = cvCta.audioSrc;
    const ctaAudioPlay = typeof cvCta.audioPlay === 'boolean' ? cvCta.audioPlay : null;
    const ctaIdle = typeof cvCta.idleTimeout === 'number' ? cvCta.idleTimeout : null;
    let audioChanged = false;

    // cvjson-priority: primary (default) or fallback
    if (this._cvPriority === 'primary') {
      this._contact = {
        ...this._contact,
        email: emailFromCv,
        phoneDisplay: phoneFromCv,
        phoneHref: phoneHrefFromCv,
      };
      if (ctaPhoto || cv.photoSrc || cv.photo) {
        this._photoSrc = ctaPhoto || cv.photoSrc || cv.photo;
      }
      if (ctaAudioSrc) {
        this._audioSrc = this._resolveUrl(ctaAudioSrc);
        audioChanged = true;
      }
      if (ctaAudioPlay !== null) {
        this._startMuted = !ctaAudioPlay;
        audioChanged = true;
      }
      if (ctaIdle !== null && ctaIdle > 500) {
        this._idleDelay = ctaIdle;
      }
    } else {
      // fallback: only fill missing fields
      this._contact = {
        ...this._contact,
        email: this._contact.email || emailFromCv,
        phoneDisplay: this._contact.phoneDisplay || phoneFromCv,
        phoneHref: this._contact.phoneHref || phoneHrefFromCv,
      };
      if (!this._hasAttrPhoto && (ctaPhoto || cv.photoSrc || cv.photo)) {
        this._photoSrc = ctaPhoto || cv.photoSrc || cv.photo;
      }
      if (!this._audioSrc && ctaAudioSrc) {
        this._audioSrc = this._resolveUrl(ctaAudioSrc);
        audioChanged = true;
      }
      if (ctaAudioPlay !== null && this.getAttribute('audio-play') === null) {
        this._startMuted = !ctaAudioPlay;
        audioChanged = true;
      }
      if (ctaIdle !== null && this.getAttribute('idle-timeout') === null && ctaIdle > 500) {
        this._idleDelay = ctaIdle;
      }
    }

    if (audioChanged) {
      this._setupAudio();
    }

    this._applyContact();
  }

  _applyContact() {
    if (!this._shell) return;
    const emails = this._shell.querySelectorAll('.cta-email');
    const phones = this._shell.querySelectorAll('.cta-phone');
    const photoEl = this._shell.querySelector('.incoming-photo');
    const avatarEl = this._shell.querySelector('.cta-avatar-img');
    const subEl = this._shell.querySelector('.incoming-sub');
    emails.forEach((el) => {
      const prefix = el.dataset.prefix || '';
      el.textContent = `${prefix}${this._contact.email || ''}`;
      if (this._contact.email) {
        el.href = `mailto:${this._contact.email}`;
      }
    });
    phones.forEach((el) => {
      const prefix = el.dataset.prefix || '';
      el.textContent = `${prefix}${this._contact.phoneDisplay || ''}`;
      if (this._contact.phoneHref) {
        el.href = this._contact.phoneHref;
      }
    });
    if (photoEl && this._photoSrc) {
      photoEl.src = this._photoSrc;
    }
    if (avatarEl && this._photoSrc) {
      avatarEl.src = this._photoSrc;
    }
    if (subEl && this._cvData?.shortName) {
      subEl.textContent = `${this._cvData.shortName} is available — pick a channel to connect.`;
    } else if (subEl && this._cvData?.name) {
      subEl.textContent = `${this._cvData.name} is available — pick a channel to connect.`;
    }
  }

  _startDrag(e) {
    if (!this._dragEnabled) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.target.closest('button,a')) return;
    if (!this._shell) return;

    e.preventDefault();
    const rect = this._shell.getBoundingClientRect();
    const startLeft = this._hasCustomPos ? this._pos?.left ?? rect.left : rect.left;
    const startTop = this._hasCustomPos ? this._pos?.top ?? rect.top : rect.top;

    this._dragging = true;
    this._dragStart = {
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      left: startLeft,
      top: startTop,
    };

    this._setCustomPosition(startLeft, startTop, { persist: false });

    window.addEventListener('pointermove', this._onDragMove, { passive: false });
    window.addEventListener('pointerup', this._endDrag, { passive: false });
    window.addEventListener('pointercancel', this._endDrag, { passive: false });
  }

  _onDragMove = (e) => {
    if (!this._dragging || !this._dragStart || e.pointerId !== this._dragStart.pointerId) return;
    if (!this._shell) return;
    e.preventDefault();

    const deltaX = e.clientX - this._dragStart.x;
    const deltaY = e.clientY - this._dragStart.y;

    const { left, top } = this._clampPosition(
      this._dragStart.left + deltaX,
      this._dragStart.top + deltaY
    );

    this._setCustomPosition(left, top, { persist: false });
  };

  _endDrag = (e) => {
    if (!this._dragging || !this._dragStart || e.pointerId !== this._dragStart.pointerId) return;
    e.preventDefault();
    this._dragging = false;
    this._dragStart = null;
    window.removeEventListener('pointermove', this._onDragMove);
    window.removeEventListener('pointerup', this._endDrag);
    window.removeEventListener('pointercancel', this._endDrag);
    this._persistPosition();
  };

  _setCustomPosition(left, top, { persist = true } = {}) {
    if (!this._shell) return;
    const clamped = this._clampPosition(left, top);
    this._pos = clamped;
    this._hasCustomPos = true;

    this._shell.classList.add('custom-pos');
    this._shell.style.setProperty('--cta-left', `${Math.round(clamped.left)}px`);
    this._shell.style.setProperty('--cta-top', `${Math.round(clamped.top)}px`);
    this._shell.style.removeProperty('right');
    this._shell.style.removeProperty('bottom');
    this._shell.style.removeProperty('left');
    this._shell.style.removeProperty('top');

    if (persist) {
      this._persistPosition();
    }
  }

  _applySavedPosition() {
    const saved = this._readStorage(this._posKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (typeof parsed.left === 'number' && typeof parsed.top === 'number') {
        this._setCustomPosition(parsed.left, parsed.top, { persist: false });
      }
    } catch (_) {
      // ignore
    }
  }

  _persistPosition() {
    if (!this._hasCustomPos || !this._pos) return;
    this._writeStorage(this._posKey, JSON.stringify(this._pos));
  }

  _clampPosition(left, top) {
    const rect = this._shell?.getBoundingClientRect();
    const width = rect?.width || 320;
    const height = rect?.height || 120;
    const maxLeft = Math.max(0, window.innerWidth - width);
    const maxTop = Math.max(0, window.innerHeight - height);
    return {
      left: Math.min(Math.max(0, left), maxLeft),
      top: Math.min(Math.max(0, top), maxTop),
    };
  }

  _clearPosition(clearStorage = false) {
    if (this._shell) {
      this._shell.classList.remove('custom-pos');
      this._shell.style.removeProperty('--cta-left');
      this._shell.style.removeProperty('--cta-top');
      this._shell.style.removeProperty('left');
      this._shell.style.removeProperty('top');
      this._shell.style.removeProperty('right');
      this._shell.style.removeProperty('bottom');
    }
    this._hasCustomPos = false;
    this._pos = null;
    if (clearStorage) {
      this._removeStorage(this._posKey);
    }
  }

  _startIdleTracking() {
    this._activityHandler = (evt) => {
      this._primeAudio();
      const target = evt?.target || window.event?.target;
      const path = evt?.composedPath ? evt.composedPath() : [];
      const isAction = (el) => el && el.closest && el.closest('.cta-action');
      const hitAction = isAction(target) || path.some((n) => isAction(n));

      if (hitAction) {
        if (this._incomingActive) return;
        setTimeout(() => this._resetIdleTimer(), this._actionDelay);
        return;
      }

      const type = evt?.type || window.event?.type || '';
      if (this._incomingActive && type === 'pointermove') return;
      this._resetIdleTimer();
    };
    const opts = { passive: true };
    window.addEventListener('pointerdown', this._activityHandler, opts);
    window.addEventListener('pointermove', this._activityHandler, opts);
    window.addEventListener('touchstart', this._activityHandler, opts);
    window.addEventListener('keydown', this._activityHandler, false);
    window.addEventListener('scroll', this._activityHandler, opts);
    this._resetIdleTimer();
  }

  _resetIdleTimer() {
    this._stopIdleLoop();
    if (this._idleTimer) clearTimeout(this._idleTimer);
    this._idleTimer = setTimeout(() => this._maybeAnimate(), this._idleDelay);
    this._restartIdleProgress();
  }

  _maybeAnimate() {
    if (this._prefersReducedMotion()) return;
    if (this._idleActive) return;
    const now = Date.now();
    if (now - this._lastAnimate < this._animateCooldown) {
      this._resetIdleTimer();
      return;
    }
    this._startIdleLoop();
    this._lastAnimate = now;
  }

  _playAttentionAnimation(playSound = true) {
    if (!this._shell) return;
    this._shell.classList.remove('cta-animate');
    // force reflow
    void this._shell.offsetWidth;
    this._shell.classList.add('cta-animate');
    setTimeout(() => this._shell && this._shell.classList.remove('cta-animate'), 1700);
    if (playSound) this._playChime();
  }

  _prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  _restartIdleProgress() {
    if (!this._progressFill) return;
    const el = this._progressFill;
    el.classList.remove('running');
    el.style.animationDuration = `${this._idleDelay}ms`;
    el.style.transform = 'scaleX(1)';
    // force reflow
    void el.offsetWidth;
    el.classList.add('running');
  }

  _enterIncomingMode() {
    this._incomingActive = true;
    this._clearPosition(true);
    if (this._shell) {
      this._shell.classList.add('incoming');
    }
  }

  _exitIncomingMode() {
    if (!this._incomingActive) return;
    if (this._shell) {
      this._shell.classList.remove('incoming');
    }
    this._incomingActive = false;
  }

  _startIdleLoop() {
    this._idleActive = true;
    this._enterIncomingMode();
    if (this._progressFill) {
      this._progressFill.classList.remove('running');
      this._progressFill.style.transform = 'scaleX(0)';
    }
    this._startRingtone();
    this._playAttentionAnimation(false);
    this._idleLoopTimer = setInterval(() => this._playAttentionAnimation(false), 2200);
    if (this._idleTimer) {
      clearTimeout(this._idleTimer);
      this._idleTimer = null;
    }
  }

  _stopIdleLoop() {
    if (!this._idleActive) return;
    this._idleActive = false;
    if (this._idleLoopTimer) {
      clearInterval(this._idleLoopTimer);
      this._idleLoopTimer = null;
    }
    if (this._shell) {
      this._shell.classList.remove('cta-animate');
    }
    this._stopRingtone();
    this._exitIncomingMode();
    this._incomingActive = false;
    this._forceMute();
  }

  _setupAudio() {
    try {
      if (!this._audioSrc) {
        this._chime = null;
        this._applyMuteState(true, null, { autoPlay: false });
        return;
      }
      const audio = new Audio(this._audioSrc);
      audio.preload = 'auto';
      audio.volume = 0.22;
      audio.loop = true;
      this._muted = this._startMuted;
      audio.muted = this._muted;
      this._chime = audio;
      this._applyMuteState(this._muted, null, { autoPlay: false });
    } catch (e) {
      this._chime = null;
    }
  }

  _primeAudio() {
    if (this._audioPrimed || !this._chime) return;
    try {
      const res = this._chime.play();
      if (res && typeof res.then === 'function') {
        res.then(() => {
          this._chime.pause();
          this._chime.currentTime = 0;
          this._audioPrimed = true;
        }).catch(() => {});
      } else {
        this._audioPrimed = true;
      }
    } catch (e) {
      // ignore
    }
  }

  _playChime() {
    if (!this._chime) return;
    try {
      this._chime.currentTime = 0;
      const res = this._chime.play();
      if (res && typeof res.catch === 'function') {
        res.catch(() => {});
      }
    } catch (e) {
      // ignore playback errors (e.g., autoplay restrictions)
    }
  }

  _startRingtone() {
    if (!this._chime || this._muted) return;
    try {
      this._chime.currentTime = 0;
      this._ringtonePlaying = true;
      const res = this._chime.play();
      if (res && typeof res.catch === 'function') {
        res.catch(() => {});
      }
    } catch (e) {
      // ignore
    }
  }

  _stopRingtone() {
    if (!this._chime) return;
    try {
      this._chime.pause();
      this._chime.currentTime = 0;
      this._ringtonePlaying = false;
    } catch (e) {
      // ignore
    }
  }

  _toggleMute(btn) {
    const newMuted = !this._muted;
    this._applyMuteState(newMuted, btn);
  }

  _forceMute() {
    this._applyMuteState(true);
  }

  _applyMuteState(muted, btnOverride = null, opts = {}) {
    const { autoPlay = true } = opts;
    this._muted = muted;
    if (this._chime) {
      this._chime.muted = muted;
      if (muted) {
        this._chime.pause();
        this._chime.currentTime = 0;
        this._ringtonePlaying = false;
      } else if (autoPlay) {
        this._ringtonePlaying = true;
        const res = this._chime.play();
        if (res && typeof res.catch === 'function') {
          res.catch(() => {});
        }
      }
    }
    const muteBtn = btnOverride || this.querySelector('[data-action="mute"]');
    if (muteBtn) {
      muteBtn.textContent = muted ? '🔇' : '🔊';
      muteBtn.setAttribute('aria-label', muted ? 'Unmute ringtone' : 'Mute ringtone');
    }
  }
}

customElements.define('cta-bot', CtaBot);

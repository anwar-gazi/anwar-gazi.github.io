// footer.js
class AppFooter extends HTMLElement {
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
    this._dragging = false;
    this._dragStart = null;
    this._hasCustomPos = false;
    this._pos = null;
    this._progressFill = null;
    this._idleTimer = null;
    this._idleDelay = 15000;
    this._lastAnimate = 0;
    this._animateCooldown = 90000;
    this._activityHandler = null;
    this._chime = null;
    this._idleActive = false;
    this._idleLoopTimer = null;
    this._audioPrimed = false;
    this._ringtonePlaying = false;
    this._incomingActive = false;
    this._actionDelay = 260;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    const storedState = this._readStorage(this._stateKey);
    if (storedState === 'bar' || storedState === 'open' || storedState === 'toast') {
      this._preferredState = storedState;
    }
    this._userCollapsed =
      this._readStorage(this._collapsedKey) === 'true' || this._preferredState === 'toast';
    if (this._userCollapsed) {
      this._preferredState = 'toast';
    }

    this.innerHTML = `
      <footer class="cta-shell" data-state="bar">
          <div class="cta-surface">
            <div class="cta-surface-inner">
              <div class="cta-bar">
                <div class="cta-bar-text">
                  <div class="cta-kicker">Let’s work together</div>
                <div class="cta-bar-title">Open to Senior/Staff backend roles</div>
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
              <a class="cta-btn primary cta-action" href="mailto:minhaj.me.bd@gmail.com">Email minhaj.me.bd@gmail.com</a>
              <a class="cta-btn ghost cta-action" href="tel:+8801716734974">Call / WhatsApp +88 01716-734974</a>
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
              <img class="incoming-photo" src="/minhaj.jpg" alt="Minhaj" loading="lazy" />
            </div>
            <div class="incoming-kicker">Incoming call</div>
            <div class="incoming-title">Let’s work together</div>
            <p class="incoming-sub">Minhaj is available — pick a channel to connect.</p>
            <button class="incoming-mute cta-action" type="button" aria-label="Mute ringtone" data-action="mute">🔊</button>
            <div class="incoming-actions">
              <a class="cta-btn primary cta-action" href="mailto:minhaj.me.bd@gmail.com">Answer via email: minhaj.me.bd@gmail.com</a>
              <a class="cta-btn ghost cta-action" href="tel:+8801716734974">Call / WhatsApp: +88 01716-734974</a>
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

  _wireEvents() {
    const openBtn = this.querySelector('[data-action="open"]');
    const collapseBtn = this.querySelector('[data-action="collapse"]');
    const dismissBtn = this.querySelector('[data-action="dismiss"]');

    const stopBubble = (el) => {
      if (!el) return;
      el.addEventListener('pointerdown', (e) => e.stopPropagation(), { passive: false });
      el.addEventListener('click', (e) => e.stopPropagation());
    };

    if (openBtn) {
      stopBubble(openBtn);
      openBtn.addEventListener('click', () => {
        this._primeAudio();
        if (this._isMobile()) {
          this._userCollapsed = false;
          if (!this._idleActive) {
            this._lastAnimate = Date.now();
            this._startIdleLoop();
          }
          return;
        }
        this._openFromUser();
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

    const muteBtn = this.querySelector('[data-action="mute"]');
    if (muteBtn) {
      stopBubble(muteBtn);
      muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleMute(muteBtn);
      });
    }

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
      if (this._isMobile()) {
        this._setState('toast', { persistPreferred: false });
        return;
      }

      const doc = document.documentElement;
      const progress = (window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1);
      const direction = window.scrollY > this._lastScrollY ? 'down' : 'up';
      this._lastScrollY = window.scrollY;

      if (!this._userCollapsed && progress > 0.72) {
        this._setState('open');
      } else if (direction === 'up' && progress < 0.5) {
        this._setState('bar');
      } else if (this._userCollapsed && this._state !== 'toast') {
        this._setState('toast');
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
    if (dragHandle) {
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

  _startDrag(e) {
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
  }

  _setupAudio() {
    try {
      const audio = new Audio('/cta-chime.wav');
      audio.preload = 'auto';
      audio.volume = 0.22;
      audio.loop = true;
      this._chime = audio;
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
    if (!this._chime) return;
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
    if (!this._chime) return;
    const muted = !this._chime.muted;
    this._chime.muted = muted;
    if (btn) {
      btn.textContent = muted ? '🔇' : '🔊';
      btn.setAttribute('aria-label', muted ? 'Unmute ringtone' : 'Mute ringtone');
    }
  }
}

customElements.define('app-footer', AppFooter);

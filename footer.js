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
                <div class="cta-bar-sub">14+ yrs • PHP • Go • Node • React • Remote-friendly</div>
              </div>
              <div class="cta-bar-actions">
                <button class="cta-btn primary" data-action="open" type="button">Let’s talk</button>
                <button class="cta-icon-btn" data-action="dismiss" type="button" aria-label="Hide contact bar">✕</button>
              </div>
            </div>

            <div class="cta-panel">
              <div class="cta-panel-copy">
                <div class="cta-kicker">Available now</div>
                <div class="cta-title">Ship reliable systems together</div>
                <p class="cta-body">Fast fixes, calm launches, pragmatic architecture. <span class="cta-highlight">Dhaka (UTC+6)</span> · Replies within 1 business day.</p>
              </div>
              <div class="cta-panel-actions">
                <a class="cta-btn primary" href="mailto:minhaj.me.bd@gmail.com">Email Minhaj</a>
                <a class="cta-btn ghost" href="tel:+8801716734974">Call / WhatsApp</a>
              </div>
              <button class="cta-minimize" data-action="collapse" type="button">Minimize</button>
            </div>
          </div>
        </div>
      </footer>
    `;

    this._shell = this.querySelector('.cta-shell');
    if (!this._shell) return;

    this._setState(this._preferredState, { persistPreferred: false });
    this._applyResponsiveState();
    this._applySavedPosition();
    this._wireEvents();
  }

  disconnectedCallback() {
    if (this._onScroll) {
      window.removeEventListener('scroll', this._onScroll);
    }
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
    }
  }

  _wireEvents() {
    const openBtn = this.querySelector('[data-action="open"]');
    const collapseBtn = this.querySelector('[data-action="collapse"]');
    const dismissBtn = this.querySelector('[data-action="dismiss"]');

    if (openBtn) openBtn.addEventListener('click', () => this._openFromUser());
    if (collapseBtn) collapseBtn.addEventListener('click', () => this._collapse(true));
    if (dismissBtn) dismissBtn.addEventListener('click', () => this._toast());

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
        this._collapse(true);
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
}

customElements.define('app-footer', AppFooter);

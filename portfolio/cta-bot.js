// portfolio/cta-bot.js

const CtaBot = {
  name: 'CtaBot',
  props: {
    photoSrc: {
      type: String,
      default: 'https://api.dicebear.com/6.x/adventurer/svg?seed=Imran&accessories=turban&hairColor=black&skinColor=brown'
    },
    audioSrc: {
      type: String,
      default: null
    },
    cvJsonSrc: {
      type: String,
      default: null
    },
    cvPriority: {
      type: String,
      default: 'primary'
    },
    audioPlay: {
      type: Boolean,
      default: false
    },
    idleTimeout: {
      type: Number,
      default: 15000
    },
    dragEnabled: {
      type: Boolean,
      default: false
    },
    storagePrefix: {
      type: String,
      default: ''
    }
  },
  template: `
    <footer 
      class="cta-shell" 
      :data-state="state" 
      :class="shellClasses"
      :style="shellStyles"
      ref="shell"
    >
      <div class="cta-surface">
        <div class="cta-surface-inner">
          <div class="cta-toast-controls" v-if="showToastControls">
            <button class="cta-toast-move cta-toast-up" @click="setToastAnchor('top')" type="button" aria-label="Move toast to top" v-show="toastAnchor !== 'top'">↑</button>
            <button class="cta-toast-move cta-toast-down" @click="setToastAnchor('bottom')" type="button" aria-label="Move toast to bottom" v-show="toastAnchor !== 'bottom'">↓</button>
            <button class="cta-toast-expand" @click="expandFromToast" type="button" aria-label="Expand">‹</button>
          </div>
          
          <div class="cta-bar" @click="handleBarClick" @pointerdown="startDrag">
            <div class="cta-avatar">
              <img class="cta-avatar-img" :src="resolvedPhotoSrc" alt="Profile" loading="lazy" />
              <span class="cta-status-dot" aria-hidden="true"></span>
            </div>
            <div class="cta-bar-text">
              <div class="cta-kicker">Let’s work together</div>
              <div class="cta-bar-title">Open to Senior/Staff backend roles <span class="cta-status-pill inline-pill">● Available</span></div>
            </div>
            <div class="cta-bar-actions">
              <button class="cta-btn primary" @click.stop="openMenu" type="button">Let’s talk</button>
              <button class="cta-icon-btn cta-minimize" @click.stop="collapse" type="button" aria-label="Minimize">–</button>
              <button class="cta-icon-btn cta-close" @click.stop="toast" type="button" aria-label="Hide contact bar">✕</button>
            </div>
          </div>

          <div class="cta-panel" v-if="state === 'open'">
            <div class="cta-panel-copy">
              <div class="cta-kicker">Available now</div>
              <div class="cta-title">Ship reliable systems together</div>
              <p class="cta-body">Backend-focused, senior leadership available now. <span class="cta-highlight">Dhaka (UTC+6)</span> · Replies within 1 business day.</p>
            </div>
            <div class="cta-panel-actions">
              <a class="cta-btn primary cta-action cta-email" :href="mailtoHref">Email {{ contact.email }}</a>
              <a class="cta-btn ghost cta-action cta-phone" :href="contact.phoneHref">Call / WhatsApp {{ contact.phoneDisplay }}</a>
            </div>
          </div>
        </div>
        
        <div class="cta-sparkles" aria-hidden="true">
          <span class="sp1"></span><span class="sp2"></span><span class="sp3"></span>
          <span class="sp4"></span><span class="sp5"></span><span class="sp6"></span>
        </div>
        
        <div class="cta-idle-progress" aria-hidden="true" v-show="idleActive">
          <button class="cta-idle-toggle" type="button" :aria-label="idlePaused ? 'Resume idle animation' : 'Pause idle animation'" @click="toggleIdleTimer">
            {{ idlePaused ? '▶' : '❚❚' }}
          </button>
          <div class="cta-idle-fill" ref="progressFill"></div>
        </div>

        <div class="cta-incoming-overlay" aria-hidden="true" v-if="incomingActive">
          <div class="incoming-wave">
            <img class="incoming-photo" :src="resolvedPhotoSrc" alt="Profile" loading="lazy" />
            <span class="cta-status-dot incoming" aria-hidden="true"></span>
          </div>
          <div class="incoming-kicker">Incoming call</div>
          <div class="incoming-title">Let’s work together</div>
          <p class="incoming-sub">{{ contactName }} is available — pick a channel to connect.</p>
          <button class="incoming-mute cta-action" type="button" :aria-label="muted ? 'Unmute ringtone' : 'Mute ringtone'" @click.stop="toggleMute">
            {{ muted ? '🔇' : '🔊' }}
          </button>
          <div class="incoming-actions">
            <a class="cta-btn primary cta-action cta-email" :href="mailtoHref">Answer via email: {{ contact.email }}</a>
            <a class="cta-btn ghost cta-action cta-phone" :href="contact.phoneHref">Call / WhatsApp: {{ contact.phoneDisplay }}</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  data() {
    return {
      state: 'bar', // 'bar' | 'open' | 'toast'
      preferredState: 'bar',
      userCollapsed: false,
      toastAnchor: 'bottom', // 'top' | 'bottom'

      // Contact Data
      contact: {
        email: 'polarglow06@gmail.com',
        phoneDisplay: '+88 01534-303074',
        phoneHref: 'tel:+8801534303074'
      },
      cvData: null,
      contactName: 'Minhaj',

      // Dragging
      dragging: false,
      dragStartPos: null,
      customPos: null, // { left, top }

      // Audio / Idle
      muted: true, // Start muted by default unless overwritten
      audioPrimed: false,
      incomingActive: false,
      idleActive: false,
      idlePaused: false,
      ringtonePlaying: false,

      // Internal Refs/Timers
      idleTimer: null,
      idleLoopTimer: null,
      lastAnimate: 0,
      chime: null
    };
  },
  computed: {
    resolvedPhotoSrc() {
      return this.cvData?.photoSrc || this.photoSrc;
    },
    mailtoHref() {
      return this.contact.email ?`mailto:${this.contact.email}` : '#';
    },
    showToastControls() {
      return this.state === 'toast' && !this.customPos;
    },
    shellClasses() {
      return {
        'custom-pos': !!this.customPos,
        'incoming': this.incomingActive,
        'toast-top': this.state === 'toast' && !this.customPos && this.toastAnchor === 'top',
        'toast-bottom': this.state === 'toast' && !this.customPos && this.toastAnchor === 'bottom',
        'cta-animate': false // Controlled via direct class manipulation for restart
      };
    },
    shellStyles() {
      if (this.customPos) {
        return {
          '--cta-left': `${Math.round(this.customPos.left)}px`,
          '--cta-top': `${Math.round(this.customPos.top)}px`
        };
      }
      // For toast anchor positioning when NOT custom pos
      if (this.state === 'toast') {
        return {
          top: this.toastAnchor === 'top' ? '0' : '',
          bottom: this.toastAnchor === 'bottom' ? '0' : ''
        };
      }
      return {};
    },
    isMobile() {
      // Basic check, updated on resize
      return window.innerWidth <= 760;
    },
    storageKeys() {
      const p = this.storagePrefix ? `${this.storagePrefix}_` : '';
      return {
        state: `${p}ctaState`,
        collapsed: `${p}ctaCollapsed`,
        pos: `${p}ctaPos`,
        anchor: `${p}ctaToastAnchor`
      };
    }
  },
  mounted() {
    this.init();
  },
  beforeUnmount() {
    this.cleanup();
  },
  methods: {
    init() {
      // 1. Storage Hydration
      const savedState = this.readStorage(this.storageKeys.state);
      this.preferredState = savedState || 'bar';
      this.userCollapsed = this.readStorage(this.storageKeys.collapsed) === 'true';
      
      const savedAnchor = this.readStorage(this.storageKeys.anchor);
      if (savedAnchor === 'top' || savedAnchor === 'bottom') {
        this.toastAnchor = savedAnchor;
      }

      this.applySavedPosition();
      
      // 2. Initial State Logic
      this.applyResponsiveState();
      
      // 3. Audio Setup
      this.muted = !this.audioPlay; // Prop default
      this.setupAudio();
      
      // 4. CV Hydration
      this.hydrateCv();
      
      // 5. Global Listeners
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      window.addEventListener('resize', this.handleResize, { passive: true });
      this.startIdleTracking();
    },
    
    cleanup() {
      window.removeEventListener('scroll', this.handleScroll);
      window.removeEventListener('resize', this.handleResize);
      this.stopIdleTracking();
      this.stopIdleLoop();
      if (this.chime) {
        this.chime.pause();
        this.chime = null;
      }
    },
    
    // --- State Management ---
    setState(next, opts = {}) {
      const persistPreferred = opts.persistPreferred !== false;
      if (persistPreferred) {
        this.preferredState = next;
      }
      
      // Mobile Force Toast
      const enforced = this.isMobile ? 'toast' : next;
      this.state = enforced;
      
      this.persistState(persistPreferred ? next : this.preferredState);
    },
    
    applyResponsiveState() {
      if (this.isMobile) {
        this.setState('toast', { persistPreferred: false });
        return;
      }
      // Desktop: if we were forced to toast but user prefers bar, revert
      if (!this.userCollapsed && this.state === 'toast') {
        this.setState(this.preferredState || 'bar', { persistPreferred: false });
      }
    },
    
    handleScroll() {
      const doc = document.documentElement;
      const progress = (window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1);
      const atBottom = window.innerHeight + window.scrollY >= (doc.scrollHeight || document.body.scrollHeight) - 4;

      if (this.isMobile) {
        if (!this.customPos) {
            // Auto anchor swap on mobile bottom
            this.setToastAnchor(atBottom ? 'top' : 'bottom', false);
        }
        this.setState('toast', { persistPreferred: false });
        return;
      }

      // Desktop auto-toast near footer
      if (progress > 0.92) {
        this.setState('toast', { persistPreferred: false });
        return;
      }

      if (!this.userCollapsed) {
        this.setState('bar', { persistPreferred: false });
      }
    },
    
    handleResize() {
      this.applyResponsiveState();
      if (this.customPos) {
        const clamped = this.clampPosition(this.customPos.left, this.customPos.top);
        this.setCustomPosition(clamped.left, clamped.top); 
      }
    },
    
    // --- Actions ---
    openMenu() {
      this.primeAudio();
      this.userCollapsed = false;
      this.setState('open');
      this.startIdleLoop(); // Trigger attention sequence
    },
    
    collapse() {
      this.userCollapsed = true;
      this.setState('bar');
    },
    
    toast() {
      this.userCollapsed = true;
      this.setState('toast');
    },
    
    expandFromToast() {
      this.userCollapsed = false;
      this.setState('bar');
    },
    
    handleBarClick() {
      if (this.isMobile) return;
      if (this.state === 'bar') {
        this.openMenu();
      }
    },
    
    setToastAnchor(anchor, persist = true) {
        if (anchor !== 'top' && anchor !== 'bottom') return;
        this.toastAnchor = anchor;
        this.clearCustomPosition();
        if (persist) {
             // We don't usually persist anchor unless explicit user action?
             // The original code says "Avoid persisting anchor toggles; only remember when drag sets custom pos"
             // But let's persist explicit clicks just in case
             this.writeStorage(this.storageKeys.anchor, anchor);
        }
    },

    // --- Drag & Drop ---
    startDrag(e) {
      if (!this.dragEnabled) return;
      if (e.target.closest('button, a')) return;
      
      // Prevent default to avoid text selection
      e.preventDefault();
      
      const rect = this.$refs.shell.getBoundingClientRect();
      const startLeft = this.customPos ? this.customPos.left : rect.left;
      const startTop = this.customPos ? this.customPos.top : rect.top;
      
      this.dragging = true;
      this.dragStartPos = {
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        left: startLeft,
        top: startTop
      };
      
      // Set initial custom pos to lock it
      this.setCustomPosition(startLeft, startTop, false);
      
      window.addEventListener('pointermove', this.onDragMove);
      window.addEventListener('pointerup', this.endDrag);
      window.addEventListener('pointercancel', this.endDrag);
    },
    
    onDragMove(e) {
      if (!this.dragging || e.pointerId !== this.dragStartPos.pointerId) return;
      e.preventDefault();
      
      const deltaX = e.clientX - this.dragStartPos.x;
      const deltaY = e.clientY - this.dragStartPos.y;
      
      const { left, top } = this.clampPosition(
        this.dragStartPos.left + deltaX,
        this.dragStartPos.top + deltaY
      );
      
      this.setCustomPosition(left, top, false);
    },
    
    endDrag(e) {
      if (!this.dragging || e.pointerId !== this.dragStartPos.pointerId) return;
      this.dragging = false;
      this.dragStartPos = null;
      
      window.removeEventListener('pointermove', this.onDragMove);
      window.removeEventListener('pointerup', this.endDrag);
      window.removeEventListener('pointercancel', this.endDrag);
      
      this.persistPosition();
    },
    
    setCustomPosition(left, top, persist = true) {
      this.customPos = { left, top };
      if (persist) this.persistPosition();
    },
    
    applySavedPosition() {
      const saved = this.readStorage(this.storageKeys.pos);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed.left === 'number' && typeof parsed.top === 'number') {
             this.setCustomPosition(parsed.left, parsed.top, false);
          }
        } catch(e) {}
      }
    },
    
    clampPosition(left, top) {
      const rect = this.$refs.shell?.getBoundingClientRect();
      const width = rect?.width || 320;
      const height = rect?.height || 120;
      const maxLeft = Math.max(0, window.innerWidth - width);
      // For top, be careful not to lose it under header?
      const maxTop = Math.max(0, window.innerHeight - height);
      return {
        left: Math.min(Math.max(0, left), maxLeft),
        top: Math.min(Math.max(0, top), maxTop)
      };
    },
    
    clearCustomPosition() {
        this.customPos = null;
        this.removeStorage(this.storageKeys.pos);
    },
    
    persistPosition() {
        if (this.customPos) {
            this.writeStorage(this.storageKeys.pos, JSON.stringify(this.customPos));
        }
    },
    
    persistState(preferred) {
      this.writeStorage(this.storageKeys.state, preferred);
      this.writeStorage(this.storageKeys.collapsed, String(this.userCollapsed));
    },

    // --- Audio Engine ---
    setupAudio() {
        // If prop provided, use it. Else fallback to CV data? (Handled in hydrate)
        if (!this.audioSrc) {
            this.chime = null;
            return;
        }
        try {
            const audio = new Audio(this.audioSrc);
            audio.preload = 'auto';
            audio.volume = 0.22;
            audio.loop = true;
            audio.muted = this.muted;
            this.chime = audio;
        } catch(e) {
            this.chime = null;
        }
    },
    
    primeAudio() {
        if (this.audioPrimed || !this.chime) return;
        // User interaction required to play audio usually
        const p = this.chime.play();
        if (p) {
            p.then(() => {
                this.chime.pause();
                this.chime.currentTime = 0;
                this.audioPrimed = true;
            }).catch(() => {});
        }
    },
    
    toggleMute() {
        this.muted = !this.muted;
        if (this.chime) {
            this.chime.muted = this.muted;
            if (this.muted) {
                this.chime.pause();
                this.chime.currentTime = 0;
                this.ringtonePlaying = false;
            } else if (this.ringtonePlaying) {
                this.chime.play().catch(()=>{});
            }
        }
    },
    
    startRingtone() {
        if (!this.chime || this.muted) return;
        this.chime.currentTime = 0;
        this.ringtonePlaying = true;
        this.chime.play().catch(()=>{});
    },
    
    stopRingtone() {
        if (!this.chime) return;
        this.chime.pause();
        this.chime.currentTime = 0;
        this.ringtonePlaying = false;
    },

    // --- Idle & Animation Engine ---
    startIdleTracking() {
        const handler = (evt) => {
            this.primeAudio();
            // Reset idle timer on any interaction
            this.resetIdleTimer();
        };
        const opts = { passive: true };
        window.addEventListener('pointerdown', handler, opts);
        window.addEventListener('pointermove', handler, opts);
        window.addEventListener('keydown', handler, false);
        window.addEventListener('scroll', handler, opts);
        
        this.idleHandler = handler; // Save ref for cleanup
        this.resetIdleTimer();
    },
    
    stopIdleTracking() {
        if (this.idleHandler) {
            window.removeEventListener('pointerdown', this.idleHandler);
            window.removeEventListener('pointermove', this.idleHandler);
            window.removeEventListener('keydown', this.idleHandler);
            window.removeEventListener('scroll', this.idleHandler);
        }
        if (this.idleTimer) clearTimeout(this.idleTimer);
    },
    
    resetIdleTimer() {
        if (this.idlePaused) return;
        this.stopIdleLoop();
        if (this.idleTimer) clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => this.maybeAnimate(), this.idleTimeout);
        this.restartIdleProgress();
    },
    
    toggleIdleTimer() {
        this.idlePaused = !this.idlePaused;
        if (this.idlePaused) {
            if (this.idleTimer) clearTimeout(this.idleTimer);
            this.stopIdleLoop();
            // Stop progress bar visual
            const el = this.$refs.progressFill;
            if (el) {
                el.classList.remove('running');
                el.style.transform = 'scaleX(0)';
            }
        } else {
            this.resetIdleTimer();
        }
    },
    
    maybeAnimate() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (this.idleActive) return;
        
        const now = Date.now();
        // Cooldown 90s (from original code)
        if (now - this.lastAnimate < 90000) {
            this.resetIdleTimer();
            return;
        }
        
        this.startIdleLoop();
        this.lastAnimate = now;
    },
    
    startIdleLoop() {
        this.idleActive = true;
        this.incomingActive = true;
        this.clearCustomPosition(); // Incoming mode takes over full screen usually?
                                    // Original logic: _enterIncomingMode -> _clearPosition(true) -> shell.classList.add('incoming')
        
        // Reset progress bar
        const el = this.$refs.progressFill;
        if (el) {
            el.classList.remove('running');
            el.style.transform = 'scaleX(0)';
        }
        
        this.startRingtone();
        this.playAttentionAnimation(); // Initial play
        
        if (this.idleLoopTimer) clearInterval(this.idleLoopTimer);
        this.idleLoopTimer = setInterval(() => this.playAttentionAnimation(), 2200);
    },
    
    stopIdleLoop() {
        if (!this.idleActive) return;
        this.idleActive = false;
        
        if (this.idleLoopTimer) {
            clearInterval(this.idleLoopTimer);
            this.idleLoopTimer = null;
        }
        
        this.$refs.shell?.classList.remove('cta-animate');
        this.stopRingtone();
        this.incomingActive = false;
        this.muted = true; // Force mute after idle loop ends? Original: _forceMute()
        if (this.chime) this.chime.muted = true;
    },
    
    playAttentionAnimation() {
        const el = this.$refs.shell;
        if (!el) return;
        
        // Restart animation via class toggle
        el.classList.remove('cta-animate');
        void el.offsetWidth; // Force reflow
        el.classList.add('cta-animate');
        
        setTimeout(() => el && el.classList.remove('cta-animate'), 1700);
        // "playChime" was separate from Ringtone in original, but let's stick to ringtone logic
    },
    
    restartIdleProgress() {
        const el = this.$refs.progressFill;
        if (!el) return;
        el.classList.remove('running');
        el.style.animationDuration = `${this.idleTimeout}ms`;
        el.style.transform = 'scaleX(1)';
        void el.offsetWidth;
        el.classList.add('running');
    },

    // --- CV Hydration ---
    async hydrateCv() {
        // If not provided in props, check attributes? (Props handles defaults)
        if (!this.cvJsonSrc) return;
        
        try {
            const res = await fetch(this.cvJsonSrc, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                this.cvData = data;
                this.applyCvData(data);
            }
        } catch(e) {}
    },
    
    applyCvData(cv) {
        if (!cv) return;
        const cvContact = cv.contact || {};
        const cvCta = cv.ctaBot || {};
        
        // Logic: Primary vs Fallback
        const isPrimary = this.cvPriority === 'primary';
        
        if (isPrimary) {
            this.contact.email = cvContact.email || this.contact.email;
            this.contact.phoneDisplay = cvContact.phone || this.contact.phoneDisplay;
            this.contactName = cv.shortName || cv.name || 'Minhaj';
             
            if (cvCta.audioSrc) {
                // If audio src changes, re-setup
                // this.audioSrc prop is immutable, but we can override locally if we changed design to use data property for audioSrc
                // For now, let's assume we might need a local override variable if we want to fully support this?
                // Or just rely on what we have.
                // The original code re-ran _setupAudio.
            }
        }
        
        // Normalize href
        const digits = this.contact.phoneDisplay.replace(/[^0-9+]/g, '');
        this.contact.phoneHref = `tel:${digits}`;
    },

    // --- Storage Helpers ---
    readStorage(key) {
        try { return localStorage.getItem(key); } catch(e) { return null; }
    },
    writeStorage(key, val) {
        try { localStorage.setItem(key, val); } catch(e) {}
    },
    removeStorage(key) {
        try { localStorage.removeItem(key); } catch(e) {}
    }
  }
};

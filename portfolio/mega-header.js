const MegaHeader = {
  name: 'MegaHeader',
  template: `
    <div :class="['mega-header-root', { disintegrating: isDisintegrating }]">
      <header>
        <div class="header-inner">
          <a href="/" class="brand">
            <div class="brand-avatar">AG</div>
            <div class="brand-text">
              <slot name="brand-content">
                <span class="brand-name">Anwar Gazi</span>
                <span class="brand-sub">Software Engineer</span>
              </slot>
            </div>
          </a>

          <div class="nav-container">
            <nav>
              <ul>
                <li>
                   <a href="#" :class="['nav-link', 'nav-trigger', { active: isOpen }]" @click.prevent="toggleMenu">
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

        <div :class="['mega-menu', { active: isOpen }]">
          <div class="mega-scroll-view">
            <div class="mega-container">
              <div class="mega-grid">
                <template v-for="(item, idx) in gridItems">
                  <!-- Case Study Card -->
                  <a v-if="!item.isFiller" 
                     :key="'study-' + idx" 
                     :href="item.href" 
                     :class="['menu-card', getSpanClass(item.weight), getCategoryClass(item.tag)]"
                     :style="{ transitionDelay: (idx * (isMobile ? 0.05 : 0.12) + 0.1) + 's' }">
                    <div class="menu-card-header">
                      <span class="menu-icon">{{ item.icon || '📄' }}</span>
                      <span class="menu-tag">{{ item.tag || 'Work' }}</span>
                    </div>
                    <div class="menu-content">
                      <div class="menu-title">{{ item.title }}</div>
                      <div class="tech-stack-mini">
                        <span v-for="tech in (item.tech_stack || []).slice(0, 3)" class="tech-tag">{{ tech }}</span>
                      </div>
                    </div>
                  </a>
                  <!-- CTA Filler Card -->
                  <div v-else 
                       :key="'filler-' + idx"
                       :class="['menu-card', 'cta-card', item.flavor]"
                       :style="{ transitionDelay: (idx * (isMobile ? 0.05 : 0.12) + 0.1) + 's' }">
                    <div class="menu-icon">{{ item.icon }}</div>
                    <div class="menu-title">{{ item.msg }}</div>
                    <a href="mailto:anwar.gazi@gmail.com" class="cta-mini-btn">Get in Touch</a>
                  </div>
                </template>
              </div>
            </div>
          </div>
          
          <canvas ref="particleCanvas" id="particle-canvas"></canvas>
          
          <button class="close-menu-btn" aria-label="Close Case Study Explorer" @click.stop="closeMenu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>
    </div>
  `,
  data() {
    return {
      isOpen: false,
      isDisintegrating: false,
      currentCols: 1,
      isMobile: false,
      fillerPool: [
        { msg: "Staff-Level Infrastructure", flavor: "cta-indigo", icon: "🚀" },
        { msg: "Scale Your Architecture", flavor: "cta-emerald", icon: "💎" },
        { msg: "Backend Performance RCA", flavor: "cta-slate", icon: "🛠️" },
        { msg: "Hire for Strategic Impact", flavor: "cta-purple", icon: "🎯" },
        { msg: "Let's Build the Future", flavor: "cta-amber", icon: "📈" }
      ]
    }
  },
  computed: {
    gridItems() {
      const rawItems = window.CASE_STUDIES || [];
      const items = [...rawItems].sort((a, b) => (parseInt(b.weight) || 0) - (parseInt(a.weight) || 0));
      const cols = this.currentCols;

      const finalItems = [];
      let currentSlots = 0;
      let fillerIndex = 0;
      let studyCount = 0;

      items.forEach((item) => {
        const weight = parseInt(item.weight) || 0;
        let span = (weight >= 90) ? 2 : 1;

        if (studyCount > 0 && studyCount % 4 === 0) {
          const f = this.fillerPool[fillerIndex % this.fillerPool.length];
          finalItems.push({ ...f, isFiller: true });
          fillerIndex++;
          currentSlots += 1;
          studyCount = 0;
        }

        if ((currentSlots % cols) + span > cols && (currentSlots % cols) !== 0) {
          const gapSize = cols - (currentSlots % cols);
          for (let g = 0; g < gapSize; g++) {
            const f = this.fillerPool[fillerIndex % this.fillerPool.length];
            finalItems.push({ ...f, isFiller: true });
            fillerIndex++;
            currentSlots++;
          }
        }

        finalItems.push({ ...item, isFiller: false });
        currentSlots += span;
        studyCount++;
      });

      const remaining = (cols - (currentSlots % cols)) % cols;
      for (let g = 0; g < remaining; g++) {
        const f = this.fillerPool[fillerIndex % this.fillerPool.length];
        finalItems.push({ ...f, isFiller: true });
        fillerIndex++;
        currentSlots++;
      }

      return finalItems;
    }
  },
  methods: {
    updateCols() {
      this.isMobile = window.innerWidth <= 768;
      const containerWidth = window.innerWidth - (this.isMobile ? 0 : 128);
      this.currentCols = Math.floor(containerWidth / 450) || 1;
    },
    toggleMenu() {
      if (this.isOpen) this.closeMenu();
      else this.openMenu();
    },
    openMenu() {
      this.isOpen = true;
      this.clearParticles();
      document.documentElement.classList.add('no-scroll');
    },
    closeMenu() {
      if (this.isDisintegrating) return;
      this.isDisintegrating = true;
      this.disintegrate();

      setTimeout(() => {
        this.isOpen = false;
        this.isDisintegrating = false;
        document.documentElement.classList.remove('no-scroll');
        this.clearParticles();

        const menu = this.$el.querySelector('.mega-menu');
        if (menu) menu.style.setProperty('--mask-pos', '100%');
      }, 1600);
    },
    disintegrate() {
      const canvas = this.$refs.particleCanvas;
      if (!canvas) return;
      const menu = this.$el.querySelector('.mega-menu');
      const cards = this.$el.querySelectorAll('.menu-card');
      const ctx = canvas.getContext('2d');

      canvas.width = menu.offsetWidth;
      canvas.height = menu.offsetHeight;

      const particles = [];
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const relativeTop = rect.top - menuRect.top;
        const relativeLeft = rect.left - menuRect.left;
        const color = getComputedStyle(card).backgroundColor;

        for (let i = 0; i < 60; i++) {
          particles.push({
            x: relativeLeft + Math.random() * rect.width,
            y: relativeTop + Math.random() * rect.height,
            vx: Math.random() * 4 - 1,
            vy: Math.random() * -5 - 2,
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
        menu.style.setProperty('--mask-pos', `${Math.max(0, 100 - progress * 130)}%`);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.x += p.vx + (Math.random() - 0.5);
          p.y += p.vy;
          p.opacity -= 0.008;
          if (p.opacity > 0) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
          }
        });
        if (progress < 1 && this.isDisintegrating) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    },
    clearParticles() {
      const canvas = this.$refs.particleCanvas;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    getSpanClass(weight) {
      const w = parseInt(weight) || 0;
      if (w >= 95) return 'span-both';
      if (w >= 90) return 'span-col-2';
      return '';
    },
    getCategoryClass(tag) {
      if (['GovTech', 'Infrastructure'].includes(tag)) return 'cat-govtech';
      if (['Fintech', 'Logistics'].includes(tag)) return 'cat-fintech';
      if (['Media'].includes(tag)) return 'cat-media';
      if (['System Architecture', 'Backend Engineering', 'Engineering RCA', 'Performance Eng.', 'Frontend Performance'].includes(tag)) return 'cat-eng';
      if (['Healthcare', 'Telephony'].includes(tag)) return 'cat-specialist';
      return '';
    }
  },
  mounted() {
    this.updateCols();
    window.addEventListener('resize', this.updateCols);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.closeMenu();
    });
    document.addEventListener('click', (e) => {
      if (window.innerWidth > 768 && this.isOpen && !this.$el.contains(e.target)) {
        this.closeMenu();
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateCols);
  }
};

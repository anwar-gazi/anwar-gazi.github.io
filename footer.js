// footer.js
class AppFooter extends HTMLElement {
    constructor() {
        super();
        this._footerEl = null;
        this._onScroll = null;
        this._lastScrollY = 0;
        this._dockedMode = 'bottom'; // 'bottom' or 'top'
        this._threshold = 40;        // px from bottom
        this._animDuration = 550;    // ms, keep in sync with CSS
        this._initialized = false;
    }

    connectedCallback() {
        // Avoid re-initializing if the element is re-attached
        if (this._initialized) return;
        this._initialized = true;

        // Inject the footer markup
        this.innerHTML = `
      <footer class="cta-footer">
        <div class="cta-footer-inner">
          <p class="cta-eyebrow">Let’s work together</p>

          <div class="cta-contact">
            <div class="cta-contact-name">Minhajul Anwar</div>

            <a class="cta-contact-row" href="tel:+8801716734974">
              <span class="cta-contact-text">+88 01716 734974</span>
            </a>

            <a class="cta-contact-row" href="mailto:minhaj.me.bd@gmail.com">
              <span class="cta-contact-text">minhaj.me.bd@gmail.com</span>
            </a>
          </div>
        </div>
      </footer>
    `;

        this._footerEl = this.querySelector('.cta-footer');
        if (!this._footerEl) return;

        this._lastScrollY = window.scrollY;

        const isNearBottom = () => {
            const scrollBottom = window.innerHeight + window.scrollY;
            const pageHeight = document.documentElement.scrollHeight;
            return scrollBottom >= pageHeight - this._threshold;
        };

        this._onScroll = () => {
            const currentY = window.scrollY;
            const direction = currentY > this._lastScrollY ? 'down' : 'up';
            const nearBottom = isNearBottom();

            // Scroll down & reach bottom → fly footer up under header
            if (direction === 'down' && nearBottom && this._dockedMode === 'bottom') {
                this._dockedMode = 'top';

                this._footerEl.classList.remove('cta-footer--drop-down');
                this._footerEl.classList.add('cta-footer--top', 'cta-footer--fly-up');

                setTimeout(() => {
                    this._footerEl.classList.remove('cta-footer--fly-up');
                }, this._animDuration);
            }

            // Scroll up away from bottom → drop footer back down
            if (direction === 'up' && !nearBottom && this._dockedMode === 'top') {
                this._dockedMode = 'bottom';

                this._footerEl.classList.remove('cta-footer--top');
                this._footerEl.classList.add('cta-footer--drop-down');

                setTimeout(() => {
                    this._footerEl.classList.remove('cta-footer--drop-down');
                }, this._animDuration);
            }

            this._lastScrollY = currentY;
        };

        window.addEventListener('scroll', this._onScroll, { passive: true });
    }

    disconnectedCallback() {
        if (this._onScroll) {
            window.removeEventListener('scroll', this._onScroll);
        }
    }
}

customElements.define('app-footer', AppFooter);

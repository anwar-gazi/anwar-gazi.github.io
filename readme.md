# Engineering Portfolio – Developer Guide

This repo is a multi-variant, data-driven portfolio for Minhajul Anwar. All dynamic variants read from `cv.json`; the static snapshot is pre-rendered from the same source for maximum fallback safety.

---

## Page Variants

| File | Stack | Notes |
| --- | --- | --- |
| `index.html` | Vanilla + `hydrate.js` | Primary hydrated page; falls back to Babel if needed. |
| `index.static.html` | Pre-rendered HTML | No data fetch; fastest/legacy/offline fallback. |
| `index.react.html` | React 18 UMD + Babel in-browser | JSX transpiled at runtime. |
| `index.react.bundled.html` | React 18 UMD (no Babel) | Pure `createElement` runtime. |
| `index.vue.html` | Vue 3 CDN | Client-rendered from `cv.json`. |
| `index.svelte.html` | Plain JS renderer (Svelte-inspired) | Client-rendered from `cv.json` without a build. |

All footers cross-link the variants and include a modal describing the current page. Non-static variants redirect to `index.static.html` on data/load failure.

---

## Data Model (`cv.json`)

Top-level fields:
- `name`, `shortName`, `photoSrc`, `title`
- `contact`: `phone`, `email`, `location`, `links.{github,portfolio}`
- `summary`: short professional bio
- `domains`: object keyed by domain name → `{ summary, url }`
- `skills`: object keyed by skill group → entries keyed by skill name → `{ summary, url }`
- `experience`: array of roles `{ title, company, location, period, bullets[] }`
- `education`: array `{ school, location, degree, period }`
- `portfolioItems`: array `{ title, url, period, blurb }`
- `ctaBot`: `{ photoSrc, audioSrc, audioPlay, idleTimeout }` (currently unused in UI)

### How variants consume data
- Hydrated/React/Vue/Svelte pages fetch `cv.json` (`no-store`, same-origin) and render domains, skills (with summaries/tooltips and deep links), experience, education, and portfolio.
- `index.static.html` is regenerated from `cv.json` so every nested value is inlined; tabs still toggle with a tiny script.

---

## Runtime Behavior

- **Tabs:** About / Experience / Portfolio. Controlled via JS listeners; `hidden` class toggles visibility.
- **Domains:** Rendered as cards with icon, summary, and “Related work” links when `url` present.
- **Skills:** Rendered as tags; link out when `url` present; summaries surface as `title` tooltips.
- **Portfolio:** Timeline of `portfolioItems` with period + link.
- **Experience/Education:** Timeline with bullets (experience) and entries (education).
- **Version modals:** Click “This page: …” in footer; modal closes on button, backdrop, or Esc; text references the data source/pipeline, not file names.
- **Fallbacks:** Non-static variants redirect to `index.static.html` on data load failure. Hydrated page also falls back to Babel if native features unavailable.

---

## Updating Content

1) Edit `cv.json`. Keep object shapes for `domains` and `skills` (each entry is `{ summary, url }`).  
2) Regenerate `index.static.html` (static snapshot) after content changes to keep it in sync.  
   - Currently done manually by rewriting `index.static.html` from `cv.json` (no build step).

Adding portfolio items:
- Append to `portfolioItems` in `cv.json` with `title`, `url`, `period`, `blurb`.
- Hydrated/React/Vue/Svelte pages pick this up automatically; regenerate static snapshot.

---

## Adding/Modifying Variants

- **Hydrated (`index.html`):** JS in `hydrate.js`; uses runtime feature check, optional Babel fallback. Fetches `cv.json`.
- **React (Babel) / React (bundled):** UMD React/ReactDOM from CDN; Babel version transpiles JSX in-browser; bundled version uses `createElement`.
- **Vue:** Single-file HTML; Vue 3 CDN; fetches `cv.json` and renders computed sections.
- **Svelte (plain JS renderer):** No compiler; fetches `cv.json`, builds DOM via template strings, wires tabs and modal manually.
- **Static:** Pure HTML; no fetch; tab toggle script only.

---

## Deployment Notes

- No build or deps; everything is static assets.  
- GitHub Pages: serve the repo root; `index.html` is default.  
- Use `CNAME` if you need a custom domain. Add `.nojekyll` if you ever add underscore-prefixed paths.

---

## Testing/Validation Tips

- Open each variant locally to confirm fetch/modal/tab behaviors; verify footers link across all versions.
- For static snapshot regression: diff `index.static.html` against `cv.json` after edits.
- Network-offline check: `index.static.html` should still load and toggle tabs; other variants should fail gracefully or redirect.

---

## Quick Reference

- Primary data source: `cv.json`.
- Static snapshot: `index.static.html` (manually regenerated).
- Fallback redirect: non-static pages → `index.static.html` on load failure.
- Variants listed in `package.json` under `pages`.

# Portfolio README

## Overview
- Static case studies and project writeups live in this folder. Each page is a self-contained HTML with inline styles that match its theme.
- Shared UI bits: `case-nav.js` (header nav), `cta-bot.js`/`cta-bot.css` (contact widget), and optional `narrative.css` (Problem → Solution → Impact rail styling).

## Structure
- `/portfolio/index.html` — portfolio landing with filters.
- `/portfolio/<case>/index.html` — individual case studies (e.g., `amiprobashi`, `healthcare`, `shurjopay`, etc.).
- `/portfolio/projects/` — deep-dive docs for specific investigations/migrations.
- `/portfolio/tools/` — small utility/demo pages (kept lightweight, no narrative rail).
- `/portfolio/narrative.css` — shared styles for narrative rails used on case/project pages.

## Adding a new case study
1) Copy an existing case page closest to your desired theme (color system is defined in the `<style>` block of each page).
2) Keep the shared includes near the top:
   - `cta-bot.css` / `cta-bot.js`
   - `case-nav.js`
   - `narrative.css` (if you want the Problem → Solution → Impact rail).
3) Update the `<style>` theme tokens to match the brand/domain.
4) Add a concise hero (title, subtitle, meta pills, summary), then the layout sections:
   - Problem, Solution/Execution, Impact/Outcomes
   - Context, Constraints, Timeline if relevant
   - Charts or screenshots go in a `chart-block` wrapper for consistent spacing.
5) If you use the narrative rail, follow the pattern: Problem → Solution → Impact cards, delta metrics, flow ribbon, and an impact spotlight.

## Adding a project/tool page
- Projects (`/projects`) can use `narrative.css` if you want a quick summary rail.
- Tools (`/tools`) are intentionally minimal; avoid pulling in `narrative.css` unless you redesign the page for it.

## Local viewing
- Pages are plain HTML. Open directly in a browser or run a simple server (e.g., `python -m http.server`) from repo root if you need relative asset loading.

## Assets
- Icons referenced from root: `/icon.png`, `/shortcut.png`, `/apple-icon.png`.
- Case-specific charts/images live alongside their page (e.g., `/portfolio/amiprobashi/chart_error_rate_relative.png`).

## Conventions
- Keep copy concise and scannable; lead with business context and impact.
- Stick to ASCII in source; avoid embedding large base64 assets.
- Respect existing themes; reuse accent colors to maintain consistency per page.

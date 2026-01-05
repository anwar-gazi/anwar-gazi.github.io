<!-- Documentation for the magic CTA footer component -->

# Magic CTA Footer – Developer Guide

## What it is
- A self-contained Web Component (`<app-footer>`) that renders a floating/collapsible CTA with multiple modes: toast, bar, open panel, and an “incoming call” overlay with ringtone/animation.
- Lives in `footer.js` (logic) and `footer.css` (styles) at the project root. No build tooling required—just include the files.
- Remembers state and position in `localStorage`, plays an idle animation with an optional ringtone, and hydrates contact details from attributes (attributes are the source of truth).

## Quick start
```html
<!-- 1) Include styles + script -->
<link rel="stylesheet" href="/footer.css">
<script src="/footer.js" defer></script>

<!-- 2) Drop the element near end of <body> -->
<app-footer
  photo-src="/minhaj.jpg"
  audio-src="/cta-chime.wav"
  audio-play="true"
  idle-timeout="15000"
  email="you@example.com"
  phone="+8801716734974"
  storage-prefix="portfolio">
</app-footer>
```

## Attributes (configuration surface)
- `photo-src` (default `/minhaj.jpg`): Image for the incoming-call overlay.
- `audio-src` (default resolves to `cta-chime.wav` alongside `footer.js`): Ringtone for idle/incoming mode.
- `audio-play` (optional, boolean): Accepts only `true` or `false`. Empty/present (e.g., `audio-play`) is treated as `true`; omitting the attribute is treated as `false`.
- `cvjs-path` (optional): Path/URL to a `cv.js` script (resolved with the same rules as other asset paths). Currently stored for future contact hydration; attributes remain the source of truth.
- `idle-timeout` (optional, ms; default `15000`): Idle delay before triggering the incoming/animation state.
- `drag-enabled` (optional, boolean; default `false`): Controls whether the CTA can be dragged. Accepts only `true` or `false`; any other value is treated as `false`.
- `email` (optional): Email text + mailto link.
- `phone` (optional): Phone text + tel link.
- `storage-prefix` (optional): Namespaces `localStorage` keys. Final keys are `<prefix>_ctaState`, `<prefix>_ctaCollapsed`, `<prefix>_ctaPos`.

Path resolution:
- If the value starts with `/`, it resolves relative to the folder that serves `footer.js` (e.g., `/minhaj.jpg` → `<folder-of-footer.js>/minhaj.jpg`).
- If it starts with `./` or `../`, it resolves relative to the HTML page containing `<app-footer>`.
- Absolute URLs (`https://…`) are used as-is.

## Modes and state
- `toast`: Minimal pill in a corner; used when user dismisses/minimizes on mobile or when collapsed preference is saved.
- `bar`: Compact bar with CTA text and buttons.
- `open`: Expanded panel showing title/body and action buttons.
- `incoming`: Full-screen/large overlay with photo, “incoming call” layout, and ringtone. Triggered by idle timer or by clicking “Let’s talk.”
- State is persisted in `localStorage` under the keys noted above. Position is also persisted when the user drags it.

## Idle/attention behavior
- Idle timer: 15 seconds (`_idleDelay`). After inactivity, enters `incoming` mode, plays animation + ringtone, shows a slim progress bar at the bottom of the CTA.
- Animation loops until user interaction. Any user interaction (except inside action buttons) resets the timer and stops sound/overlay.
- Ringtone respects browser autoplay rules; playback is primed on first interaction.

## Interaction rules
- Click “Let’s talk”: Immediately enters `incoming` mode (desktop and mobile), starts idle loop and ringtone.
- “Minimize” → switches to toast and saves preference.
- “Hide” (✕) → switches to toast.
- Dragging: grab the bar to drag; position is clamped to the viewport and saved to `localStorage`.
- Mute button: toggles ringtone mute; clicking does not close the overlay.
- Action buttons (email / call) stop event bubbling so clicks are not treated as overlay-dismiss events.
- Escape key and general interactions exit incoming mode and mute.

## Accessibility and safety
- Uses semantic buttons/links; aria-labels on mute.
- Honors `prefers-reduced-motion` for idle animation (won’t auto-animate if reduce is set).
- Pointer/touch/scroll/keydown listeners reset idle timer; overlay is not hidden on desktop mouse move during incoming (so buttons remain accessible).

## Dependencies & assumptions
- Runs in a plain browser; no module system required.
- Needs `footer.css` and `footer.js` loaded before `<app-footer>` is parsed.
- Defaults expect assets at:
  - `/minhaj.jpg` (photo)
  - a ringtone you provide via `audio-src` (no built-in audio is loaded unless you set it)
- Social/favicon assets are unrelated; the component only needs the above.

## Extensibility tips
- To change copy, edit the template strings in `footer.js` (`this.innerHTML` block).
- To change colors/spacing/animations, edit CSS variables and rules in `footer.css`.
- To add new actions, append buttons/links with class `.cta-action` (they’re exempt from idle resets).
- To override idle timings or cooldowns, tweak `_idleDelay` and `_animateCooldown` in the constructor.
- To namespace storage in multi-tenant pages, always set `storage-prefix`.

## Troubleshooting
- **Ringtone not playing**: Ensure `audio-src` points to a valid media file and user has interacted (autoplay policies). Check network path relative to the page.
- **Custom email/phone not showing**: Confirm attributes are set on `<app-footer>`.
- **Overlay closes when clicking buttons**: Make sure new buttons use `.cta-action` and stop propagation if added manually.
- **Asset 404s**: If the site is not served from root, use absolute URLs for `photo-src` and `audio-src`.

## Minimal drop-in
```html
<link rel="stylesheet" href="/footer.css">
<script src="/footer.js" defer></script>
<app-footer
  email="hire@company.com"
  phone="+1 555-123-4567"
  photo-src="/assets/avatar.jpg"
  audio-src="/assets/ringtone.mp3">
</app-footer>
```

# Mega Header Integration Guide

This guide details how to integrate the immersive, edge-to-edge `mega-header` into any page within the portfolio.

## 1. Dependencies
Ensure the following resources are included in your `<head>`:

```html
<!-- 1. Fonts (Must include Inter) -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- 2. Vue 3 (Global Build) -->
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>

<!-- 3. Component Styles & Script -->
<link rel="stylesheet" href="mega-header.css">
<script src="mega-header.js"></script>
```

## 2. HTML Structure
The `<mega-header>` component must be the **first child** of your Vue app container (`#app`), outside of any grid or container wrappers. This ensures it can Span the full width of the viewport.

```html
<body>
  <div id="app">
    <!-- PLACEMENT: Top level, before any content containers -->
    <mega-header>
        <!-- Slot: Brand (Left) -->
        <div slot="brand-content">
            <div class="brand-text-main">Your Title</div>
            <div class="brand-text-sub">Your Subtitle</div>
        </div>

        <!-- Slot: Right Content (Actions) -->
        <div slot="right-content" class="header-actions">
            <div class="pill">Context • 2024</div>
            <!-- Move global actions like Theme Toggle here -->
            <button class="theme-toggle" onclick="toggleTheme()">
                <span id="theme-icon">☀️</span> Theme
            </button>
        </div>
    </mega-header>

    <!-- Page Content -->
    <div class="container">
        <!-- ... -->
    </div>
  </div>
</body>
```

## 3. Layout Integration (CSS)

Since the header is `sticky` (or fixed in specific modes) with a height of `64px`, you may need to adjust your page layout to prevent overlaps.

### Sticky Sidebar Adjustment
If your page has a sticky sidebar (like the whitepaper), you must offset its `top` position by the header height so it doesn't slide underneath.

```css
.sidebar {
    position: sticky;
    /* OLD: top: 0; */
    /* NEW: Offset by header height (64px) */
    top: 64px; 
    
    /* Adjust height to fit visible area */
    height: calc(100vh - 64px); 
}
```

### Main Content Padding
If you are not using a grid system that naturally pushes content down, ensure your main content container has top padding or margin if the header overlaps.

*Note: The current `mega-header` is `position: sticky; top: 0;`, so it naturally pushes static content down. Adjustments are mostly needed for other sticky/fixed elements.*

## 4. Initialization
Ensure the Vue app works with the component.

```javascript
const { createApp } = Vue;
createApp({
  components: {
    'mega-header': MegaHeader,
  }
}).mount('#app');
```

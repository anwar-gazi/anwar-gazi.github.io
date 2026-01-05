# Growth Gauge Wheel

An interactive, mobile-friendly “growth gauge” built with plain HTML, CSS, and JavaScript.

- A **32-level wheel** you can rotate by drag (mouse/touch).
- A fixed **pointer on the left** that indicates the current level.
- A **level display box** showing the active level.
- Category **tabs** at the top:  
  - Software Engineer  
  - Software Architect  
  - Entrepreneur / Businessman  
  - Islam / Muslim
- A **“monitor” panel** at the bottom that shows **3 tailored development tips** for the current level and category, with a simple animation as if instructions appeared on a terminal.

Everything lives in a single `index.html` file.

---

## Features

### Wheel & Pointer

- 32 segments labeled `1` to `32` around a circular wheel.
- Wheel can be **rotated by drag**:
  - Desktop: mouse drag.
  - Mobile: touch drag (via Pointer Events).
- A fixed **needle** goes from the center towards the **left side** of the wheel.
- The number under this pointer is the **current level** and is shown in the “Current Level” box.

### Category Tabs (Advice Decks)

At the top of the page are tabs:

- **Software Engineer**
- **Software Architect**
- **Entrepreneur / Businessman**
- **Islam / Muslim**

Each tab:

- Activates a different **advice deck**.
- Each deck has **32 levels × 3 points** (three bullet points per level).
- As you change the **level** with the wheel, the corresponding **3 tips** appear in the monitor.

### Monitor (Instruction Panel)

At the bottom:

- A “monitor”-styled panel shows:
  - A header with **active deck name** and **current level**.
  - A body area where **3 bullet points** are displayed.
- The lines appear with a **small staggered animation**, giving a “new instructions appeared on screen” feel.
- There is a small blinking **cursor bar** in the monitor for extra “terminal” vibe.

### Mobile-Friendly Layout

On mobile / narrow screens:

- The **Current Level box** moves **above** the wheel.
- The wheel expands to use about **90% of the screen width**, keeping small margins.
- Tabs remain at the top, monitor below the gauge.
- The whole layout is vertically stacked and thumb-friendly.

On desktop:

- Tabs on top.
- Wheel + pointer on the left, level box on the right.
- Monitor panel below.

---

## File Structure

Single-page app:

```text
.
├── index.html   # All HTML, CSS, and JavaScript
└── LICENSE      # BUET License (similar to MIT)

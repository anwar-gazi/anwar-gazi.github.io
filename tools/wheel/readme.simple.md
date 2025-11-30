# Rotating Level Gauge Wheel

A small, dependency-free web widget that renders a **32-segment wheel** you can rotate with **mouse or touch drag**, with a **fixed pointer** on the left acting like a gauge needle.

Wherever the pointer intersects the wheel, the **corresponding segment number** is shown in a **value box** on the right.

---

## Overview

This project consists of a single `index.html` file that:

- Draws a circular wheel segmented into **32 equal parts**.
- Labels each segment with a **number (1–32)** around the perimeter.
- Lets the user **rotate the wheel** via mouse/touch (using Pointer Events).
- Shows a **fixed horizontal needle** on the **left** side (like a gauge pointer).
- Continuously calculates which segment is currently under the pointer.
- Displays that selected segment number in a **“Selected Level”** box.

Everything is implemented with **plain HTML, CSS, and JavaScript**, no external libraries.

---

## Features

- 🎯 **32 numeric segments** (`1` to `32`) around the wheel.
- 🖱️ **Drag to rotate** – supports mouse and touch via Pointer Events.
- 📍 **Fixed pointer/needle** on the **left** side of the wheel.
- 📦 **Selected level display** – numeric value in a box to the right.
- 🎨 Simple, clean styling that you can easily customize.

---

## File Structure

The project is a single page:

```text
.
└── index.html   # Contains HTML, CSS, and JS for the gauge wheel

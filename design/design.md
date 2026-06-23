---
name: Lumina Learn
colors:
  surface: '#fcf8ff'
  surface-dim: '#dad8e9'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#eeecfe'
  surface-container-high: '#e9e6f8'
  surface-container-highest: '#e3e0f2'
  on-surface: '#1a1a27'
  on-surface-variant: '#484554'
  inverse-surface: '#2f2f3c'
  inverse-on-surface: '#f2efff'
  outline: '#797586'
  outline-variant: '#c9c4d7'
  surface-tint: '#6043d3'
  primary: '#5e41d0'
  on-primary: '#ffffff'
  primary-container: '#775ceb'
  on-primary-container: '#fffbff'
  inverse-primary: '#cabeff'
  secondary: '#a3336c'
  on-secondary: '#ffffff'
  secondary-container: '#ff7db8'
  on-secondary-container: '#780b4a'
  tertiary: '#00647c'
  on-tertiary: '#ffffff'
  tertiary-container: '#007f9d'
  on-tertiary-container: '#fafdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e6deff'
  primary-fixed-dim: '#cabeff'
  on-primary-fixed: '#1c0062'
  on-primary-fixed-variant: '#4825ba'
  secondary-fixed: '#ffd9e5'
  secondary-fixed-dim: '#ffb0cf'
  on-secondary-fixed: '#3d0023'
  on-secondary-fixed-variant: '#841853'
  tertiary-fixed: '#b7eaff'
  tertiary-fixed-dim: '#5bd5fc'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#004e61'
  background: '#fcf8ff'
  on-background: '#1a1a27'
  surface-variant: '#e3e0f2'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 32px
  gutter: 24px
  card-gap: 20px
  sidebar-width: 260px
---

## Brand & Style

The design system is centered around a modern, playful, and high-energy learning experience. It targets students and lifelong learners who seek a motivating, non-intimidating environment to master a new language.

The aesthetic is a sophisticated blend of **Glassmorphism** and **Soft-3D**. It utilizes semi-transparent surfaces, vibrant mesh gradients, and significant depth to create an interface that feels tactile and immersive. The mood is optimistic and "bubbly," using rounded forms and light-refracting elements to reduce the cognitive load often associated with education. High-contrast typography ensures that while the background is whimsical, the educational content remains clear and authoritative.

## Colors

The palette is driven by "Candy-Tech" gradients. The primary brand color is a vibrant violet-purple, supported by a warm pink and a bright sky blue.

- **Primary:** `#8a70ff` — Actionable items and active states.
- **Secondary:** `#ff7db8` — Data visualization, category tagging, decorative elements.
- **Tertiary:** `#4cc9f0` — Accent and decorative 3D elements.
- **Neutral:** `#2d2d3a` — High-contrast dark for text.
- **Glass Effects:** Use `rgba(255, 255, 255, 0.7)` with `blur(20px)` for primary containers.

## Typography

**Plus Jakarta Sans** — friendly, open apertures, modern geometric structure.

- **Weight Strategy:** Bold (700) or ExtraBold (800) for all headings.
- **Readability:** Body text Medium (500) on semi-transparent surfaces.
- **Color:** Neutral Dark for primary text. 60% opacity for secondary/meta info.

## Layout & Spacing

**Fluid-Fixed Hybrid** model. Fixed-width left sidebar (260px) with dark aesthetic. Fluid main content area with glassmorphic cards.

- **Grid:** 12-column, 24px gutters.
- **Rhythm:** 8px base unit.
- **Safe Areas:** 32px internal padding on main containers.
- **Mobile:** Sidebar collapses to bottom nav or hamburger menu.

## Elevation & Depth

1. **Level 0 (Canvas):** Soft multi-colored mesh gradients.
2. **Level 1 (Main Panels):** White 70% opacity, blur 20–40px, 1px white inner-border.
3. **Level 2 (Active Cards):** Ambient glows — colored shadows matching element color, 0px spread, 20px blur.
4. **Level 3 (Pop-overs):** Fully opaque, Y:10px / Blur:20px / Alpha:0.1 shadows.

## Shapes

Extra-Rounded philosophy:

- **Primary Containers:** `rounded-3xl` (24–32px)
- **Interactive Elements:** Pill-shape (`rounded-full`) or minimum `rounded-2xl` (16px)
- **Icons:** Rounded caps, no sharp 90° angles.

## Components

### Buttons
- **Primary:** Pill-shaped, vibrant gradient (Purple-to-Pink), white text.
- **Secondary:** Semi-transparent white, 1px solid white border (Ghost-glass).

### Cards
- **Word Set Cards:** Mesh gradient top, high-contrast white text bottom.
- **Data Cards:** Glass surfaces, blurred backgrounds, rounded stroke lines (4px+).

### Navigation (Sidebar)
Dark, high-contrast. Active states use "cut-out" inverted-radius tab effect.

### Input Fields
Pill-shaped, inner shadow (recessed into glass surface).

### Progress Indicators
Thick rounded-cap bars. Unfilled portion = low-opacity version of filled color.

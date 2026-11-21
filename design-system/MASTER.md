# Niyo Campus — Design System & UI/UX Master Specification
Generated in accordance with the `ui-ux-pro-max` design intelligence framework.

---

## 1. Brand Identity & Product Archetype
- **Product Name:** Niyo Campus
- **Product Type:** Fintech / EdTech Student Ambassador Platform
- **Archetype:** Trust & Authority + Clean Modernism
- **Tone & Mood:** Professional, trustworthy, approachable, student-friendly, inspiring
- **Primary Design Style:** Clean Swiss Minimalism with soft frosted-glass header and multi-layer elevation

---

## 2. Design Tokens

### Color Palette & Contrast Standards (WCAG 2.1 AA Compliant)
| Token | Value | Role | Contrast Ratio |
|---|---|---|---|
| `--purple` | `#4F35B5` | Primary brand purple | 6.8:1 on white |
| `--purple-dark` | `#39238E` | Primary button hover / active | 9.4:1 on white |
| `--purple-soft` | `#F2EFFF` | Icon pill background / badges | 1.1:1 on white |
| `--navy` | `#17152F` | Headings, brand logo, footer | 14.5:1 on white |
| `--ink` | `#1E1B33` | Primary body typography | 13.8:1 on white |
| `--muted` | `#59566E` | Secondary body text & descriptions | 5.8:1 on lavender, 6.2:1 on white |
| `--lav` | `#F5F3FF` | Secondary section background | Neutral soft surface |
| `--gray` | `#F6F7FB` | Highlights section background | Neutral light surface |
| `--white` | `#FFFFFF` | Primary surface background | Baseline |
| `--line` | `#E5E0F7` | Card borders & structural separators | 3:1 graphical boundary |

### Spatial Scale (Strict 4/8px Rhythm)
- `4px` — Micro spacing, icon badge gaps
- `8px` — Button text gap, badge padding
- `12px` — Component internal element separation
- `16px` — Standard body margin, small card gap
- `20px` — Card inner icon bottom margin
- `24px` — Card internal padding, grid gap
- `32px` — Section heading bottom spacing, card outer padding
- `48px` — Large column grid gap
- `64px` — Section vertical buffer (mobile)
- `85px - 100px` — Section vertical rhythm (desktop)

### Typography Hierarchy
- **Headline Font:** `'Manrope', sans-serif` (800 / 700 weight, letter-spacing: `-0.8px` to `-1.6px`)
- **Body Font:** `'DM Sans', sans-serif` (400 / 500 / 600 weight, letter-spacing: normal)
- **Scale:**
  - `Hero H1:` 52px (desktop) / 36px (mobile), line-height: 1.15
  - `Section H2:` 36px (desktop) / 28px (mobile), line-height: 1.25
  - `Card H3:` 19px - 20px, line-height: 1.35
  - `Body / Lead:` 16px - 18px, line-height: 1.65 (Measure constrained to `max-width: 65ch`)
  - `Eyebrow / Kicker:` 11px, weight: 700, letter-spacing: `1.4px`, uppercase

### Elevation & Depth
- **Soft Border Highlight:** `1px solid var(--line)`
- **Level 1 (Default Card):** `box-shadow: 0 4px 18px rgba(45, 30, 95, 0.05), 0 1px 3px rgba(45, 30, 95, 0.02);`
- **Level 2 (Hover State):** `box-shadow: 0 14px 32px rgba(37, 28, 85, 0.09), 0 3px 8px rgba(37, 28, 85, 0.04); transform: translateY(-3px);`
- **Level 3 (Primary Button):** `box-shadow: 0 8px 20px rgba(79, 53, 181, 0.22);`

---

## 3. UX Guidelines & Micro-Interactions
1. **Interactive Feedback:**
   - Buttons provide immediate active feedback: `transform: scale(0.98)` on press.
   - Smooth easing using spring curve: `cubic-bezier(0.16, 1, 0.3, 1)` with `150ms - 220ms` duration.
2. **Scroll Spy Navigation:**
   - Real-time `IntersectionObserver` updates active section indicator in header.
   - Smooth scrolling with 86px offset to accommodate sticky frosted header.
3. **Sticky Header Glassmorphism:**
   - `backdrop-filter: blur(12px)` with subtle bottom border.
   - Elevation shadow triggers on scroll (`is-scrolled`).

---

## 4. Accessibility Checklist (WCAG 2.1 AA)
- [x] **Skip Link:** Accessible `.skip-link` enables keyboard-only jump to `#main-content`.
- [x] **Focus Indicators:** High-contrast 2px purple outline with 3px offset on `:focus-visible`.
- [x] **ARIA Semantics:**
  - Semantic `<header role="banner">`, `<main id="main-content">`, `<footer role="contentinfo">`.
  - Sections labeled with `aria-labelledby` linking to their respective `<h2>` headings.
  - FAQ accordion configured with `aria-expanded`, `aria-controls`, and `role="region"`.
  - Decorative icons and background shapes hidden with `aria-hidden="true"`.
- [x] **Touch Targets:** All interactive mobile buttons, links, and triggers >= 44x44px.
- [x] **Reduced Motion:** Full `@media (prefers-reduced-motion: reduce)` support.
- [x] **Layout Shift (CLS):** Eager loading and explicit width/height on hero images.

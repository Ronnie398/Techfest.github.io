# Parallax Scrolling Experience — Specification

## Concept & Vision

A premium editorial-style parallax website for a fictional creative studio called "Forma". The experience feels like leafing through a high-end design magazine — generous whitespace, thoughtful typography, and layered depth that rewards exploration. Every scroll reveals new visual relationships between elements, creating a sense of discovery without overwhelming the viewer.

The mood is calm, confident, and sophisticated — the kind of site that makes you trust the people behind it.

## Design Language

### Aesthetic Direction
Inspired by Scandinavian editorial design and luxury print collateral. Clean geometry meets organic curves. Think Kinfolk magazine meets a Copenhagen design studio.

### Color Palette
```
--bg-primary: #FAF9F7        /* Warm off-white */
--bg-secondary: #F0EEEB      /* Subtle warm gray */
--text-primary: #1A1A1A      /* Near-black */
--text-secondary: #6B6B6B    /* Medium gray */
--text-muted: #9A9A9A        /* Light gray */
--accent: #C17F59            /* Warm terracotta */
--accent-hover: #A86B47      /* Darker terracotta */
--surface: #FFFFFF           /* Pure white cards */
--border: #E5E3E0            /* Subtle borders */

/* Dark mode */
--dark-bg-primary: #1A1A1A
--dark-bg-secondary: #242424
--dark-text-primary: #F5F4F2
--dark-text-secondary: #A8A8A8
--dark-surface: #2A2A2A
--dark-border: #3A3A3A
```

### Typography
- **Headings**: "Cormorant Garamond", Georgia, serif — elegant, high-contrast serifs
- **Body**: "Inter", system-ui, sans-serif — highly readable, modern humanist
- **Accent/Labels**: "Inter" with letter-spacing for small caps effect

### Spatial System
- Base unit: 8px
- Section padding: clamp(80px, 12vw, 160px) vertical
- Content max-width: 1200px
- Text max-width: 680px for readability
- Generous whitespace between elements

### Motion Philosophy
- All motion uses `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- Parallax speeds: far background 0.2x, midground 0.5x, foreground 0.8x
- Scroll reveals: 600-800ms duration, staggered 100ms
- Hover transitions: 300ms
- Respect `prefers-reduced-motion`

### Visual Assets
- Decorative SVG shapes (circles, arcs, lines)
- Abstract geometric illustrations via CSS/SVG
- Placeholder images from picsum.photos (seeded for consistency)
- No emoji anywhere

## Layout & Structure

### Page Flow
1. **Hero** (100vh) — Immersive entry with layered parallax, floating shapes, bold typography
2. **About** (100vh) — Staggered text reveal, subtle depth layers, studio introduction
3. **Process** (~150vh) — Alternating left/right compositions, scroll-linked reveals
4. **Work** (~100vh) — Showcase grid with floating parallax cards
5. **Impact** (80vh) — Animated statistics with motion accents
6. **Contact** (100vh) — Final CTA with layered parallax finish

### Navigation
- Fixed header with logo and nav links
- Scroll progress indicator (thin line at top)
- Active section highlighting
- Mobile: hamburger menu with slide-in drawer
- Light/dark mode toggle (sun/moon icon)

### Responsive Strategy
- Desktop: Full parallax experience
- Tablet: Reduced parallax intensity (50%)
- Mobile: Minimal parallax, focus on text readability

## Features & Interactions

### Parallax System
- Each section defines data attributes for layer speeds
- `data-parallax-speed` on containers: "slow", "medium", "fast"
- Individual layers use CSS transforms, translated via JS
- requestAnimationFrame loop, not scroll event
- Will-change hints for GPU acceleration

### Scroll Reveals
- Intersection Observer triggers at 20% visibility
- Elements animate: opacity 0→1, translateY 40px→0, 700ms
- Staggered children with 100ms delays
- Text reveals use clip-path for elegant wipe effect

### Hero Interactions
- Mouse parallax on desktop: layers shift subtly based on cursor position
- Scroll indicator bounces gently
- First scroll initiates smooth transition to content

### Navigation
- Links smooth-scroll to sections
- Active state updates on scroll (Intersection Observer)
- Mobile menu: slide from right, backdrop blur

### Dark Mode Toggle
- Click toggles `.dark` class on `<html>`
- Smooth 300ms transition on colors
- Icon animates rotation
- No persistence (resets on refresh per requirements)

### Stats Counter
- Numbers count up when section enters viewport
- Uses requestAnimationFrame for smooth counting
- Easing: ease-out for natural deceleration

## Component Inventory

### Header
- States: default (transparent), scrolled (solid with shadow), mobile-open
- Logo: text-based "Forma" in Cormorant Garamond
- Nav links: subtle hover underline animation

### Section Title
- Large display heading (clamp(2.5rem, 6vw, 4.5rem))
- Optional subtitle in muted text
- Decorative element (small accent line or shape)

### Text Block
- Max-width 680px
- Line-height 1.7 for body, 1.2 for headings
- States: hidden (pre-reveal), visible (post-reveal)

### Card
- White surface with subtle shadow
- Rounded corners (12px)
- Hover: lift (translateY -8px), shadow increase
- Contains image, title, description

### Button
- Primary: filled with accent color
- Secondary: outlined
- States: default, hover (darken), active (scale 0.98), focus (ring)
- Min 44px touch target

### Stat Item
- Large number with counter animation
- Small label below
- Decorative accent

### Footer
- Minimal, centered layout
- Social links with hover states
- Copyright and legal links

## Technical Approach

### HTML Structure
- Semantic sections with ARIA labels
- Single H1 for page title
- Skip link as first focusable element
- Deferred JS with DOMContentLoaded

### CSS Architecture
- Custom properties for all theme values
- Mobile-first with min-width breakpoints
- Utility classes for common patterns
- No utility framework

### JavaScript Modules (conceptual, single file)
- `ParallaxManager`: handles all parallax calculations
- `ScrollReveal`: Intersection Observer for reveals
- `Navigation`: scroll spy, mobile menu
- `ThemeToggle`: dark mode switching
- `ScrollProgress`: progress indicator
- `CounterAnimation`: stats counting
- `MouseParallax`: hero cursor tracking

### Performance
- CSS transforms only (no layout thrashing)
- will-change on animated elements
- Lazy loading for images below fold
- Debounced resize handler
- Passive scroll listeners

### Accessibility
- Skip to content link
- Focus visible on all interactive elements
- prefers-reduced-motion support
- Semantic heading hierarchy
- Alt text on all images
- Keyboard navigable throughout

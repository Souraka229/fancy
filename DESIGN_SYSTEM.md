# DAYDAY'S FANCY Design System

## Design Philosophy

Inspired by the discipline of Aesop, the product-first approach of Nike, and the technical precision of Linear. This system prioritizes restraint, clarity, and premium quality over decoration.

### Core Principles

1. **Restraint Over Addition** - Every element must earn its place
2. **Photography-First** - Products are the hero; UI stays invisible
3. **Monochrome Foundation** - Single accent color reserved for semantic meaning only
4. **Surface Ladder** - Hierarchy through subtle background shifts, not shadows
5. **Typography as Voice** - Dual-typeface system: serif for editorial, sans for UI
6. **Generous Whitespace** - 96px+ section spacing, no dividers
7. **Sharp Geometry** - 0px corners on cards, pills on buttons
8. **Mobile-First** - Design for smallest screen, progressively enhance

---

## Color System

### Light Theme (Primary)

```css
/* Foundation */
--color-canvas: #ffffff;           /* Page background, card surfaces */
--color-ink: #0a0a0a;             /* Primary text, UI icons, primary buttons */
--color-ink-muted: #6b6b6b;       /* Secondary text, helper copy */
--color-ink-subtle: #a0a0a0;      /* Tertiary text, disabled states */
--color-ink-tertiary: #d4d4d4;    /* Borders, hairlines, dividers */

/* Surface Ladder */
--color-surface-1: #fafafa;        /* Secondary surfaces, section backgrounds */
--color-surface-2: #f5f5f5;        /* Tertiary surfaces, card hover states */
--color-surface-3: #eeeeee;        /* Quaternary surfaces, dropdowns */
--color-surface-4: #e8e8e8;        /* Modal backdrops, overlays */

/* Brand Accent */
--color-accent: #f97316;           /* Orange - brand mark, focus rings, primary CTAs */
--color-accent-hover: #ea580c;     /* Orange hover state */
--color-accent-subtle: #fed7aa;    /* Accent backgrounds, badges */

/* Semantic Colors */
--color-success: #22c55e;          /* Success states, positive feedback */
--color-error: #ef4444;            /* Error states, destructive actions */
--color-warning: #f59e0b;          /* Warning states, attention needed */
```

### Dark Theme

```css
/* Foundation */
--color-canvas-dark: #0a0a0a;     /* Page background */
--color-ink-dark: #ffffff;         /* Primary text */
--color-ink-muted-dark: #a0a0a0;  /* Secondary text */
--color-ink-subtle-dark: #6b6b6b; /* Tertiary text */
--color-ink-tertiary-dark: #404040; /* Borders */

/* Surface Ladder */
--color-surface-1-dark: #141414;   /* Secondary surfaces */
--color-surface-2-dark: #1a1a1a;   /* Tertiary surfaces */
--color-surface-3-dark: #202020;   /* Quaternary surfaces */
--color-surface-4-dark: #262626;   /* Modal backdrops */

/* Brand Accent (same values, different context) */
--color-accent: #f97316;
--color-accent-hover: #ea580c;
--color-accent-subtle: #7c2d12;
```

### Usage Rules

- **Never** use accent color for decorative purposes
- **Never** use more than one chromatic accent per section
- **Always** derive hierarchy from opacity/surface ladder, not hue
- **Reserve** semantic colors for their intended purpose only
- **No** gradients, no atmospheric effects, no decorative shadows

---

## Typography System

### Typefaces

```css
/* Editorial Headlines */
--font-display: 'Playfair Display', serif;  /* Luxury, editorial voice */
--font-display-weight: 400;
--font-display-style: normal;

/* UI Text */
--font-ui: 'Inter', system-ui, sans-serif;  /* Neutral, legible workhorse */
--font-ui-weight: 400;
--font-ui-weight-medium: 500;
--font-ui-weight-semibold: 600;
```

### Type Scale

```css
/* Display - Editorial */
--text-display-2xl: 72px;    /* Hero headlines */
--text-display-xl: 56px;     /* Section titles */
--text-display-lg: 42px;     /* Subsection titles */
--text-display-md: 32px;     /* Card headlines */

/* UI - Body */
--text-xl: 24px;             /* Large emphasis */
--text-lg: 18px;             /* Section subtitles */
--text-base: 16px;           /* Body text, buttons */
--text-sm: 14px;             /* Secondary text, labels */
--text-xs: 12px;             /* Metadata, captions */
--text-2xs: 10px;            /* Fine print */

/* Line Heights */
--leading-tight: 1.1;        /* Display text */
--leading-snug: 1.25;        /* Headlines */
--leading-normal: 1.5;        /* Body text */
--leading-relaxed: 1.75;     /* Long-form content */
```

### Letter Spacing

```css
/* Display - Negative tracking for premium feel */
--tracking-tighter: -0.05em;  /* 72px */
--tracking-tight: -0.03em;    /* 56px */
--tracking-snug: -0.02em;     /* 42px */

/* UI - Neutral tracking */
--tracking-normal: 0em;        /* Body text */
--tracking-wide: 0.025em;      /* Small caps, labels */
```

### Usage Rules

- **Display typeface** (Playfair Display) exclusively for editorial headlines
- **UI typeface** (Inter) for everything else
- **Never** mix display typeface with body text in same component
- **Use** negative letter-spacing on display text sparingly
- **Maintain** consistent line-height ratios across sizes

---

## Spacing System

### Base Unit: 4px

```css
--space-0: 0;
--space-1: 4px;      /* Micro spacing, icon padding */
--space-2: 8px;      /* Tight spacing, related elements */
--space-3: 12px;     /* Compact spacing, form fields */
--space-4: 16px;     /* Default spacing, card padding */
--space-5: 20px;     /* Comfortable spacing */
--space-6: 24px;     /* Section padding */
--space-8: 32px;     /* Large spacing */
--space-10: 40px;    /* Extra large spacing */
--space-12: 48px;    /* Component separation */
--space-16: 64px;    /* Section separation */
--space-20: 80px;    /* Major section separation */
--space-24: 96px;    /* Hero section spacing */
```

### Container Widths

```css
--container-sm: 640px;   /* Mobile */
--container-md: 768px;   /* Tablet */
--container-lg: 1024px;  /* Desktop */
--container-xl: 1280px;  /* Large desktop */
--container-2xl: 1536px; /* Ultra wide */
```

### Usage Rules

- **Always** use spacing tokens, never arbitrary values
- **Section spacing**: minimum 96px between major sections
- **Card padding**: 24px minimum for touch targets
- **No** decorative spacing - every gap serves a purpose

---

## Border Radius System

```css
--radius-none: 0px;      /* Cards, containers */
--radius-sm: 4px;        /* Small elements, badges */
--radius-md: 8px;        /* Form inputs */
--radius-lg: 16px;       /* Large cards */
--radius-xl: 24px;       /* Hero elements */
--radius-full: 9999px;   /* Pills, buttons, avatars */
```

### Usage Rules

- **Sharp corners (0px)** for cards, containers, editorial elements
- **Pill radius (full)** for buttons, tags, interactive elements
- **Consistent** radius usage across component types

---

## Component Specifications

### Buttons

#### Primary Button
```css
background: var(--color-ink);
color: var(--color-canvas);
border-radius: var(--radius-full);
padding: 12px 24px;
font-family: var(--font-ui);
font-size: var(--text-base);
font-weight: var(--font-ui-weight-medium);
border: none;
transition: background 150ms ease;
```

#### Secondary Button
```css
background: transparent;
color: var(--color-ink);
border: 1px solid var(--color-ink-tertiary);
border-radius: var(--radius-full);
padding: 12px 24px;
font-family: var(--font-ui);
font-size: var(--text-base);
font-weight: var(--font-ui-weight-medium);
transition: all 150ms ease;
```

#### Ghost Button
```css
background: transparent;
color: var(--color-ink);
border: none;
border-radius: var(--radius-full);
padding: 12px 24px;
font-family: var(--font-ui);
font-size: var(--text-base);
font-weight: var(--font-ui-weight-medium);
```

### Cards

#### Product Card
```css
background: var(--color-canvas);
border-radius: var(--radius-none);
border: 1px solid var(--color-ink-tertiary);
padding: 0;
overflow: hidden;
transition: border-color 150ms ease;
```

#### Content Card
```css
background: var(--color-surface-1);
border-radius: var(--radius-none);
padding: var(--space-6);
border: none;
```

### Form Elements

#### Input Field
```css
background: var(--color-canvas);
border: 1px solid var(--color-ink-tertiary);
border-radius: var(--radius-md);
padding: 12px 16px;
font-family: var(--font-ui);
font-size: var(--text-base);
color: var(--color-ink);
transition: border-color 150ms ease;
```

#### Focus State
```css
border-color: var(--color-accent);
outline: 2px solid var(--color-accent-subtle);
outline-offset: 2px;
```

---

## Motion System

### Duration Tokens

```css
--duration-instant: 100ms;    /* Micro interactions */
--duration-fast: 200ms;       /* Hover states */
--duration-normal: 300ms;     /* UI transitions */
--duration-slow: 500ms;       /* Page transitions */
--duration-slower: 700ms;     /* Complex animations */
```

### Easing Curves

```css
--ease-out: cubic-bezier(0.215, 0.61, 0.355, 1);
--ease-in: cubic-bezier(0.55, 0.055, 0.675, 0.19);
--ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);
```

### Animation Patterns

#### Hover Lift
```css
transform: translateY(-2px);
```

#### Focus Ring
```css
box-shadow: 0 0 0 2px var(--color-accent-subtle);
```

#### Fade In
```css
opacity: 0;
transform: translateY(12px);
animation: fadeIn var(--duration-normal) var(--ease-out) forwards;
```

### Usage Rules

- **Animate** transform and opacity only (performance)
- **Never** animate layout properties (width, height, top, left)
- **Respect** `prefers-reduced-motion` media query
- **Keep** animations subtle - felt, not seen

---

## Responsive Breakpoints

```css
--breakpoint-mobile: 390px;    /* iPhone SE */
--breakpoint-mobile-lg: 428px; /* iPhone Pro Max */
--breakpoint-tablet: 768px;    /* iPad */
--breakpoint-tablet-lg: 1024px; /* iPad Pro */
--breakpoint-desktop: 1280px;  /* Desktop */
--breakpoint-desktop-lg: 1536px; /* Large desktop */
```

### Mobile-First Approach

1. **Design for 390px** first (base styles)
2. **Enhance for tablet** at 768px
3. **Enhance for desktop** at 1280px
4. **Never** hide content on mobile - restructure instead

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

- **Color contrast**: minimum 4.5:1 for normal text, 3:1 for large text
- **Touch targets**: minimum 44x44px for interactive elements
- **Keyboard navigation**: full keyboard support, visible focus states
- **Screen readers**: proper ARIA labels, semantic HTML
- **Reduced motion**: respect user preferences

### Focus Management

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

---

## Icon System

### Icon Sizing

```css
--icon-xs: 16px;
--icon-sm: 20px;
--icon-md: 24px;
--icon-lg: 32px;
--icon-xl: 40px;
```

### Icon Usage

- **Stroke width**: 1.5px for consistency
- **Color**: inherit from text color
- **Alignment**: centered within touch targets

---

## Layout Patterns

### Grid System

```css
--grid-cols-2: repeat(2, 1fr);
--grid-cols-3: repeat(3, 1fr);
--grid-cols-4: repeat(4, 1fr);
--grid-gap: var(--space-6);
```

### Container Pattern

```css
max-width: var(--container-xl);
margin: 0 auto;
padding: 0 var(--space-6);
```

---

## Brand Voice

### Tone

- **Confident** - Not aggressive
- **Premium** - Not pretentious
- **Clear** - Not simplistic
- **Warm** - Not casual

### Copy Guidelines

- **Headlines**: Short, impactful, display typeface
- **Body**: Concise, benefit-focused, UI typeface
- **CTAs**: Direct, action-oriented, no exclamation marks
- **Product descriptions**: Editorial storytelling, not feature lists

---

## Implementation Priority

### Phase 1: Foundation
1. Color system implementation
2. Typography system
3. Spacing tokens
4. Base component styles

### Phase 2: Components
1. Buttons (all variants)
2. Cards (product, content)
3. Form elements
4. Navigation components

### Phase 3: Patterns
1. Homepage layout
2. Product grid
3. Product detail page
4. Cart and checkout

### Phase 4: Experiences
1. Mobile optimization
2. Tablet enhancement
3. Desktop refinement
4. Animations and micro-interactions

---

## Quality Checklist

Before any component is approved:

- [ ] Uses design tokens only (no hardcoded values)
- [ ] Works in both light and dark themes
- [ ] Meets WCAG AA accessibility standards
- [ ] Respects reduced motion preferences
- [ ] Performs well on mobile (390px)
- [ ] Has proper focus states
- [ ] Follows typography hierarchy
- [ ] Uses correct border radius pattern
- [ ] Has appropriate spacing
- [ ] Includes proper ARIA labels

---

## References

This design system is inspired by:

- **Aesop** - Apothecary minimalism, dual-typeface system
- **Nike** - Photography-first chrome, monochrome discipline
- **Linear** - Surface ladder, single accent restraint
- **Apple** - Editorial storytelling, calm CTAs
- **Framer** - Display typography, gradient spotlights

The goal is not to copy, but to achieve the same level of discipline, restraint, and quality.

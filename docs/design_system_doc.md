# Design System

> **Modern, sleek, mobile-first design system for College ERP**

---

## 🎨 Color Palette

### Primary Colors
```css
--primary-blue: #0066FF;          /* Main brand color */
--primary-blue-light: #3385FF;    /* Hover states */
--primary-blue-dark: #0052CC;     /* Active states */
```

### Secondary Colors
```css
--secondary-indigo: #6366F1;      /* Complementary */
--secondary-indigo-light: #818CF8;
--secondary-indigo-dark: #4F46E5;
```

### Accent Colors
```css
--accent-teal: #14B8A6;           /* Accent highlights */
--accent-emerald: #10B981;        /* Success states */
--accent-orange: #F97316;         /* Warnings */
```

### Status Colors
```css
--success: #10B981;               /* Present, Approved, Paid */
--warning: #F97316;               /* Pending, Due Soon */
--error: #EF4444;                 /* Absent, Rejected, Overdue */
--info: #3B82F6;                  /* Neutral info */
```

### Role-Based Accents
```css
--admin-accent: #6366F1;          /* Admin Portal - Indigo */
--professor-accent: #0066FF;      /* Professor Portal - Blue */
--student-accent: #14B8A6;        /* Student Portal - Teal */
```

### Neutral/Grayscale
```css
--neutral-950: #0A0A0F;           /* Darkest background */
--neutral-900: #1A1A2E;           /* Dark background */
--neutral-800: #16213E;           /* Dark elements */
--neutral-700: #334155;           /* Dark text */
--neutral-600: #475569;           /* Medium text */
--neutral-500: #64748B;           /* Secondary text */
--neutral-400: #94A3B8;           /* Light text */
--neutral-300: #CBD5E1;           /* Light borders */
--neutral-200: #E2E8F0;           /* Light backgrounds */
--neutral-100: #F1F5F9;           /* Very light backgrounds */
--neutral-50: #F8FAFC;            /* Lightest backgrounds */
--white: #FFFFFF;
```

### Background Layers
```css
--bg-primary: #0A0A0F;            /* Main background */
--bg-secondary: #1A1A2E;          /* Cards, panels */
--bg-tertiary: #16213E;           /* Nested elements */
--bg-elevated: #1E293B;           /* Modals, dropdowns */
```

### Text Colors
```css
--text-primary: #FFFFFF;
--text-secondary: #CBD5E1;
--text-tertiary: #94A3B8;
--text-muted: #64748B;
```

---

## 🌈 Gradients

```css
--gradient-primary: linear-gradient(135deg, #0066FF, #6366F1);
--gradient-success: linear-gradient(135deg, #10B981, #14B8A6);
--gradient-hero: linear-gradient(135deg, #0A1929, #1A2B3D);
--gradient-card: linear-gradient(135deg, rgba(0, 102, 255, 0.05), rgba(99, 102, 241, 0.05));
--gradient-accent: linear-gradient(135deg, #0066FF, #14B8A6);
```

---

## 📐 Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Scale
```css
/* Headings */
.heading-1 { font-size: 32px; font-weight: 700; line-height: 1.2; }
.heading-2 { font-size: 24px; font-weight: 600; line-height: 1.3; }
.heading-3 { font-size: 20px; font-weight: 600; line-height: 1.4; }
.heading-4 { font-size: 18px; font-weight: 600; line-height: 1.4; }
.heading-5 { font-size: 16px; font-weight: 600; line-height: 1.5; }

/* Body */
.body-large { font-size: 16px; font-weight: 400; line-height: 1.6; }
.body { font-size: 14px; font-weight: 400; line-height: 1.6; }
.body-small { font-size: 12px; font-weight: 400; line-height: 1.5; }

/* Labels */
.label { font-size: 14px; font-weight: 500; letter-spacing: 0.3px; }
.caption { font-size: 12px; font-weight: 400; color: var(--text-tertiary); }
.overline { font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
```

---

## 📏 Spacing System

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
--space-4xl: 96px;
```

---

## 🔲 Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-2xl: 32px;
--radius-full: 9999px;
```

---

## ✨ Shadows

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 12px rgba(0, 102, 255, 0.15);
--shadow-lg: 0 8px 24px rgba(0, 102, 255, 0.2);
--shadow-xl: 0 16px 48px rgba(0, 102, 255, 0.25);

/* Colored shadows */
--shadow-blue: 0 4px 16px rgba(0, 102, 255, 0.3);
--shadow-indigo: 0 4px 16px rgba(99, 102, 241, 0.3);
--shadow-teal: 0 4px 16px rgba(20, 184, 166, 0.3);
```

---

## 🎯 Components

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #0066FF, #6366F1);
  border: none;
  border-radius: var(--radius-md);
  padding: 16px 24px;
  font-weight: 600;
  font-size: 16px;
  color: white;
  box-shadow: var(--shadow-blue);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active {
  transform: scale(0.96);
  box-shadow: var(--shadow-md);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  border: 1px solid rgba(0, 102, 255, 0.3);
  border-radius: var(--radius-md);
  padding: 16px 24px;
  font-weight: 600;
  font-size: 16px;
  color: var(--primary-blue);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-secondary:hover {
  background: rgba(0, 102, 255, 0.1);
  border-color: var(--primary-blue);
}
```

#### Icon Button
```css
.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}
```

#### FAB (Floating Action Button)
```css
.fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #0066FF, #6366F1);
  box-shadow: 0 6px 20px rgba(0, 102, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.3s ease;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 28px rgba(0, 102, 255, 0.5);
}
```

---

### Cards

#### Base Card (Mobile)
```css
.card-mobile {
  background: linear-gradient(135deg, 
    rgba(26, 26, 46, 0.95), 
    rgba(22, 33, 62, 0.95));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-mobile:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-sm);
}
```

#### Elevated Card (Desktop)
```css
.card-desktop {
  background: linear-gradient(135deg, 
    rgba(26, 26, 46, 0.95), 
    rgba(22, 33, 62, 0.95));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-desktop:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(0, 102, 255, 0.3);
}
```

#### Timetable Card (Mobile)
```css
.timetable-card {
  background: linear-gradient(135deg, 
    rgba(26, 26, 46, 0.95), 
    rgba(22, 33, 62, 0.95));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 102, 255, 0.2);
  border-left: 4px solid var(--primary-blue);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  box-shadow: 0 4px 16px rgba(0, 102, 255, 0.15);
}

/* Variants */
.timetable-card.theory { border-left-color: #0066FF; }
.timetable-card.lab { border-left-color: #14B8A6; }
.timetable-card.break { border-left-color: #94A3B8; }
```

---

### Inputs

#### Text Input
```css
.input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-blue);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

#### Checkbox (Attendance)
```css
.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox:checked {
  background: linear-gradient(135deg, #0066FF, #6366F1);
  border-color: #0066FF;
}

.checkbox:checked::after {
  content: '✓';
  color: white;
  font-size: 16px;
  font-weight: bold;
}
```

---

### Navigation

#### Bottom Navigation (Mobile)
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(26, 26, 46, 0.98);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 50;
  padding: 0 var(--space-md);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-sm);
  color: var(--text-tertiary);
  transition: all 0.2s ease;
}

.bottom-nav-item.active {
  color: var(--primary-blue);
}

.bottom-nav-item .icon {
  font-size: 24px;
}

.bottom-nav-item .label {
  font-size: 10px;
  font-weight: 500;
}
```

#### Sidebar (Desktop - Admin)
```css
.sidebar {
  width: 240px;
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  padding: var(--space-lg);
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all 0.2s ease;
  cursor: pointer;
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.sidebar-item.active {
  background: rgba(0, 102, 255, 0.1);
  color: var(--primary-blue);
}
```

---

## 🎬 Animations

### Page Transitions
```css
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.page-enter {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Skeleton Loading
```css
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}
```

### Pulse (Loading Indicator)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) { /* sm - Large phones */ }
@media (min-width: 768px) { /* md - Tablets */ }
@media (min-width: 1024px) { /* lg - Laptops */ }
@media (min-width: 1280px) { /* xl - Desktops */ }
@media (min-width: 1536px) { /* 2xl - Large desktops */ }
```

---

## 🎯 Design Tokens (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066FF',
          light: '#3385FF',
          dark: '#0052CC',
        },
        secondary: {
          DEFAULT: '#6366F1',
          light: '#818CF8',
          dark: '#4F46E5',
        },
        accent: {
          teal: '#14B8A6',
          emerald: '#10B981',
          orange: '#F97316',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'glow-blue': '0 4px 16px rgba(0, 102, 255, 0.3)',
        'glow-indigo': '0 4px 16px rgba(99, 102, 241, 0.3)',
      },
    },
  },
}
```

---

## ♿ Accessibility

### Focus States
```css
*:focus-visible {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}
```

### Minimum Touch Target
```css
/* All interactive elements */
.touchable {
  min-width: 44px;
  min-height: 44px;
}
```

### ARIA Labels
```html
<button aria-label="Mark attendance">
  <Icon name="check" />
</button>
```

---

## 🚀 Performance

### Image Optimization
- Use WebP format
- Lazy load below-the-fold images
- Compress to max 200KB for UI elements

### Font Loading
```css
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('/fonts/inter.woff2') format('woff2');
}
```

### CSS Bundle Size
- Use PurgeCSS/Tailwind purge
- Critical CSS inline
- Non-critical CSS deferred

---

**Next**: Review `USER_FLOWS.md` for detailed interaction patterns.

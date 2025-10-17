# Design Rules for This Project

## Project Design Pattern: ---

## Visual Style

### Color Palette:
- Primary background: Deep charcoal #18191C
- Secondary background/panels: Slightly lighter charcoal #222326
- Card backgrounds: Dark gray #232427
- Borders and separators: Subtle gray #2D2E31
- Primary accent: Electric blue #3B82F6 (used for selected/active states and icons)
- Secondary accent: Soft green #22D3EE (used for project tags)
- Text primary: High-contrast white #F9FAFB
- Text secondary: Muted gray #A1A1AA
- Icon and button accents: Light gray #D1D5DB
- Graph/chart accents: Red #F87171 and white #F9FAFB
- Hover/focus: Slight gradient or soft highlight using #2D2E31

### Typography & Layout:
- Font family: Sans-serif (e.g., Inter, Helvetica Neue, or similar)
- Font weights: Regular for body, bold for headings and navigation
- Headings: Large, left-aligned, clear hierarchy (H1 > H2 > H3)
- Body text: Medium size, high readability, generous letter-spacing
- Spacing: Consistent 16px–24px paddings and margins, with tight vertical rhythm
- Layout: Grid-based, modular, clear separation of sidebar, main content, and secondary panels
- Alignment: Left-aligned text; centralized cards and charts

### Key Design Elements
#### Card Design:
- Background: Solid dark gray (#232427)
- Borders: Thin, subtle (#2D2E31), with slightly rounded corners (6px–8px radius)
- Shadows: Minimal or none, flat with slight elevation via border contrast
- Hover state: Slight lift or outline highlight (#3B82F6)
- Visual hierarchy: Title bold and prominent, description subdued, actions at the bottom

#### Navigation:
- Sidebar: Vertical, fixed, with grouped sections (Essentials, Projects, Support)
- Active state: Blue highlight (#3B82F6), bold text, pill-shaped background
- Collapsible sections for projects/support
- Search and filter above main navigation, using rounded input fields

#### Data Visualization:
- Chart backgrounds: Transparent or match panel (#18191C)
- Lines and points: Bright accent colors (Red #F87171, White #F9FAFB)
- Axis/grid lines: Subtle, low-opacity gray (#2D2E31)
- Pie charts: Flat, bold color blocks; minimal legends; clean separation

#### Interactive Elements:
- Buttons: Flat style, rounded corners, high-contrast text, accent border or background on hover (#3B82F6)
- Form fields: Rounded, dark backgrounds, subtle inner shadows, placeholder text in muted gray
- Micro-interactions: Soft color transitions, subtle scaling or highlighting for hover/focus states

### Design Philosophy
This interface embodies:
- A modern, sleek, and professional aesthetic with a focus on clarity and minimalism
- Design principles: High contrast for readability, generous spacing, modularity, and clear visual hierarchy
- User experience goals: Reduce cognitive load, promote intuitive navigation, deliver a premium and trustworthy feel, and support rapid task completion with minimal distractions
- Visual strategy: Emphasizes functional elegance, accessibility in dark mode, and a workspace-like environment tailored for high-productivity teams

---

This project follows the "---

## Visual Style

### Color Palette:
- Primary background: Deep charcoal #18191C
- Secondary background/panels: Slightly lighter charcoal #222326
- Card backgrounds: Dark gray #232427
- Borders and separators: Subtle gray #2D2E31
- Primary accent: Electric blue #3B82F6 (used for selected/active states and icons)
- Secondary accent: Soft green #22D3EE (used for project tags)
- Text primary: High-contrast white #F9FAFB
- Text secondary: Muted gray #A1A1AA
- Icon and button accents: Light gray #D1D5DB
- Graph/chart accents: Red #F87171 and white #F9FAFB
- Hover/focus: Slight gradient or soft highlight using #2D2E31

### Typography & Layout:
- Font family: Sans-serif (e.g., Inter, Helvetica Neue, or similar)
- Font weights: Regular for body, bold for headings and navigation
- Headings: Large, left-aligned, clear hierarchy (H1 > H2 > H3)
- Body text: Medium size, high readability, generous letter-spacing
- Spacing: Consistent 16px–24px paddings and margins, with tight vertical rhythm
- Layout: Grid-based, modular, clear separation of sidebar, main content, and secondary panels
- Alignment: Left-aligned text; centralized cards and charts

### Key Design Elements
#### Card Design:
- Background: Solid dark gray (#232427)
- Borders: Thin, subtle (#2D2E31), with slightly rounded corners (6px–8px radius)
- Shadows: Minimal or none, flat with slight elevation via border contrast
- Hover state: Slight lift or outline highlight (#3B82F6)
- Visual hierarchy: Title bold and prominent, description subdued, actions at the bottom

#### Navigation:
- Sidebar: Vertical, fixed, with grouped sections (Essentials, Projects, Support)
- Active state: Blue highlight (#3B82F6), bold text, pill-shaped background
- Collapsible sections for projects/support
- Search and filter above main navigation, using rounded input fields

#### Data Visualization:
- Chart backgrounds: Transparent or match panel (#18191C)
- Lines and points: Bright accent colors (Red #F87171, White #F9FAFB)
- Axis/grid lines: Subtle, low-opacity gray (#2D2E31)
- Pie charts: Flat, bold color blocks; minimal legends; clean separation

#### Interactive Elements:
- Buttons: Flat style, rounded corners, high-contrast text, accent border or background on hover (#3B82F6)
- Form fields: Rounded, dark backgrounds, subtle inner shadows, placeholder text in muted gray
- Micro-interactions: Soft color transitions, subtle scaling or highlighting for hover/focus states

### Design Philosophy
This interface embodies:
- A modern, sleek, and professional aesthetic with a focus on clarity and minimalism
- Design principles: High contrast for readability, generous spacing, modularity, and clear visual hierarchy
- User experience goals: Reduce cognitive load, promote intuitive navigation, deliver a premium and trustworthy feel, and support rapid task completion with minimal distractions
- Visual strategy: Emphasizes functional elegance, accessibility in dark mode, and a workspace-like environment tailored for high-productivity teams

---" design pattern.
All design decisions should align with this pattern's best practices.

## 🌓 Dark/Light Mode Requirements (CRITICAL)

**THIS PROJECT MUST SUPPORT BOTH DARK AND LIGHT MODES**

- Never create single-mode UI (light-only or dark-only)
- Use CSS custom properties for all theme colors
- Theme toggle component is implemented and accessible
- Support: light, dark, and system (follows OS preference)
- Persist user's theme choice in localStorage
- Smooth transitions between themes (200-300ms)
- Test all components in both themes
- Maintain WCAG AA contrast in both modes

**Implementation:**
- Theme provider available at `src/components/theme-provider.tsx`
- Theme toggle available at `src/components/ui/theme-toggle.tsx`
- All colors use `hsl(var(--variable))` pattern
- Light mode defined in `:root`
- Dark mode defined in `.dark` class

---

## General Design Principles

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Dark mode with elevated surfaces

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)
- Test colors in both light and dark modes

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)
- Adjust shadow intensity based on theme (lighter in dark mode)

---

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast (both themes)
- Respect reduced motion preferences

---

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions
9. **Be Themeable** - Support both dark and light modes seamlessly

---


# PHT Group Website Design Analysis
## Complete Design Documentation for Next.js Recreation

---

## Screenshots Captured

1. **Hero Section**: `/workspace/pht-hero-section.webp`
2. **Mid-Page Cards**: `/workspace/pht-midpage-cards.webp`
3. **Footer Section**: `/workspace/pht-footer-section.webp`

---

## Logo Appearance

### Design Details
- **Text**: Bold, uppercase sans-serif "PHT"
- **Colors**: 
  - Letters "P", "H", and "T": **Vibrant Red** (#E10023 approximately)
  - Geometric element: **Dark Navy Blue** (#003366 approximately)
- **Graphic Element**: Right-angled triangle/trapezoid shape to the right of the "T"
- **Style**: Heavy, blocky, modern industrial aesthetic

---

## Header Style

### Design Specifications
- **Background**: Transparent on hero (allowing background image through), or solid white on content sections
- **Navigation Items**: 
  - Center-right aligned
  - Links: "Home", "Lösungen", "Service", "Über uns", "Aktuelles", "Kontakt"
  - Typography: White on dark backgrounds, dark gray on light backgrounds
  - Medium-weight sans-serif font
  - Dropdown indicators: Small downward carets next to "Lösungen" and "Über uns"
- **Language Selector**: Small British flag icon
- **Search Icon**: White magnifying glass icon
- **Hamburger Menu**: 
  - **Red square button** with three white horizontal lines
  - Prominent placement on far right
  - Sharp corners (0px border-radius)

---

## Hero Section

### Background Image
- **Content**: High-quality industrial photography showing:
  - Primary hero: Hands being washed with water splashes
  - Secondary hero: Industrial floor with worker in blue boots and blue lighting
  - Sterile food processing environment imagery
- **Color Tone**: Cool blues, teals, and dark navy tones
- **Overlay**: Dark blue semi-transparent gradient (approx 30-40% opacity) to ensure text legibility

### Typography
- **Pre-headline**: Small white "PHT" label
- **Main Headline**: 
  - Large white sans-serif text
  - Examples: "Personalhygiene sicher gestalten." / "Lebensmittelhygiene mit Konzept."
  - Weight: Medium to bold
  - Left-aligned
  - Clean, airy spacing
- **Typography Color**: White (#FFFFFF)
- **Font Size Feel**: Very large (likely 48-64px equivalent)

### Call-to-Action Button
- **Background**: Solid vibrant red
- **Text**: White sans-serif "Lösungen entdecken"
- **Icon**: Thin horizontal arrow pointing right (→)
- **Shape**: Sharp rectangular corners (0px border-radius)
- **Size**: Large, prominent

---

## Primary Accent Colors

### Color Palette
1. **Vibrant Red**: #E10023 (approximate)
   - Used for: Logo, primary CTA buttons, hamburger menu, accent text, bullet points
   
2. **Dark Navy Blue**: #003366 (approximate)
   - Used for: Logo geometric element, footer background, active nav underlines
   
3. **White**: #FFFFFF
   - Used for: Main backgrounds, text on dark backgrounds, cards
   
4. **Light Gray**: #F5F5F5 (approximate)
   - Used for: Section backgrounds, subtle dividers
   
5. **Dark Gray/Black**: #333333 - #000000
   - Used for: Primary body text, headlines on light backgrounds

---

## Button Styles

### Primary CTA Button
- **Shape**: Rectangular with sharp corners (border-radius: 0px)
- **Background**: Solid red (#E10023)
- **Text**: White, sans-serif, medium weight
- **Icon**: Thin line arrow (→) on the right side
- **Hover State**: Likely slightly darker red

### Secondary Buttons (Cookie Modal)
- **Shape**: Rectangular with slight rounding (border-radius: 4-6px)
- **Background**: Royal blue (#2B5DE4 approximately)
- **Text**: White, centered, sans-serif

### Hamburger Menu Button
- **Shape**: Square
- **Background**: Solid red
- **Icon**: Three white horizontal lines
- **Size**: Large, prominent

### Back-to-Top Button
- **Shape**: Small square
- **Background**: Solid red
- **Icon**: White upward-pointing chevron

---

## Mid-Page Section (Product/Solution Cards)

### Layout
- Four-column grid layout
- Even spacing between cards
- Cards: "Planung", "Konzept", "Montage & Service", "Wartung"

### Card Design
- **Background**: White with subtle drop shadow
- **Border**: Very light gray or subtle shadow
- **Shape**: Tall rectangles with slight rounding
- **Icon**: 
  - Black line-art icon
  - Red and blue geometric triangle accents (matching logo style)
- **Title**: Bold black sans-serif
- **Body Text**: Medium gray, smaller sans-serif font

### Content Section
- **Background**: White (#FFFFFF)
- **Headline**: Large bold black sans-serif
- **Vertical Accent**: Small red vertical text "Über PHT"
- **Sub-headline**: Bold text with red highlights
- **Body Text**: Medium gray for readability

---

## Footer Area

### Design Structure
- **Background**: Deep dark navy blue (matches logo blue)
- **Layout**: Multi-column grid layout

### Left Column
- White PHT logo
- EHEDG certification seal (circular, white/red/blue)

### Middle Columns
- **Text Color**: White
- **Content**: Company tagline and navigation links
- **Bullet Style**: Small red square bullet points
- **Links**: 
  - "Lösungen"
  - "Service"
  - "Kontakt"
  - "Folgen Sie uns auf LinkedIn"

### Right Column
- **Links**: Legal/administrative
  - "Datenschutzerklärung"
  - "Impressum"
  - "AGB"
- **Bullet Style**: Red square bullets

### Bottom Bar
- **Background**: Black
- **Content**: 
  - LinkedIn icon (blue square)
  - Red scroll-to-top button (right side)

---

## Overall Aesthetic Summary

### Design Philosophy
**"Modern Industrial / Clinical Tech"**

The PHT Group website embodies a professional B2B corporate aesthetic specifically tailored for the food hygiene and safety industry. The design conveys:
- **Precision and cleanliness** (clinical photography, sterile environments)
- **Trust and reliability** (cool blue tones, structured layouts)
- **Action and energy** (vibrant red accents)

### Key Design Principles

1. **High Contrast**: Sharp contrast between dark hero sections and bright white content areas
2. **Generous White Space**: Breathing room around all elements
3. **Grid-Based Layout**: Strict alignment and structured component placement
4. **Sharp Edges**: 0px border-radius on primary elements for industrial feel
5. **Quality Photography**: High-resolution industrial/hygiene-themed imagery
6. **Bold Typography**: Sans-serif throughout with varied weights for hierarchy

### Typography System
- **Font Family**: Clean geometric sans-serif (similar to Roboto, Inter, or Helvetica)
- **Weights Used**: 
  - Light/Regular (300-400): Body text
  - Medium (500): Navigation
  - Bold (700): Headlines
  - Heavy (800): Logo text
- **Hierarchy**: Clear size differentiation between headlines, sub-headlines, and body text

### Component Patterns

#### Overlapping Sections
White content boxes overlap hero images at the bottom, creating depth and visual interest

#### Vertical Accent Labels
Small red vertical text used as section markers ("Über PHT", "Newsletter")

#### Arrow Icons
Consistent use of thin horizontal arrows (→) for CTAs and "read more" links

#### Icon Style
Minimalist line-art icons with geometric red/blue accents matching the logo

---

## Next.js Recreation Guidelines

### Recommended Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Typography**: Inter or Roboto font family
- **Icons**: Heroicons or custom SVGs
- **Image Optimization**: next/image for all photography

### Tailwind Configuration
```javascript
colors: {
  'pht-red': '#E10023',
  'pht-blue': '#003366',
  'pht-gray-light': '#F5F5F5',
  'pht-gray-dark': '#333333',
}
borderRadius: {
  'none': '0px',
  'subtle': '4px',
}
```

### Component Architecture
1. **Header**: Sticky navigation with transparent/solid state toggle
2. **Hero**: Full-width with background image and overlay
3. **ContentBox**: Overlapping white cards with grid layout
4. **ServiceCard**: Reusable card component with icon/title/description
5. **Footer**: Multi-column dark footer with white text
6. **Button**: Primary (red) and secondary (blue) variants

### Responsive Approach
- Desktop-first design
- Breakpoints at 1280px, 1024px, 768px, 640px
- Card grid: 4 columns → 2 columns → 1 column
- Hamburger menu reveals full navigation on mobile

---

## Screenshot Paths (Absolute)

- **Hero Section**: `/workspace/pht-hero-section.webp` (59KB)
- **Mid-Page Cards**: `/workspace/pht-midpage-cards.webp` (43KB)
- **Footer Section**: `/workspace/pht-footer-section.webp` (25KB)

---

*Analysis completed: September 8, 2026*

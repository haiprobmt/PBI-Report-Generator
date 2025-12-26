# Power BI Theme Generator

A dynamic tool for creating customized Power BI theme JSON files with live preview and instant export capabilities.

**Experience Qualities**:
1. **Efficient** - Users can quickly generate and export professional Power BI themes without manual JSON editing
2. **Visual** - Real-time color preview and visual feedback make it easy to see exactly how themes will look
3. **Professional** - Clean, polished interface that reflects the quality of output users expect for business intelligence tools

**Complexity Level**: Light Application (multiple features with basic state)
This app provides theme customization, live preview, and export functionality but maintains a focused single-page experience without complex state management or multiple views.

## Essential Features

### Color Palette Customization
- **Functionality**: Interactive color pickers for all Power BI theme color slots (primary, secondary, accent colors, data colors, etc.)
- **Purpose**: Allows users to create cohesive, branded themes for their Power BI reports
- **Trigger**: User clicks on any color swatch
- **Progression**: Click color swatch → Color picker opens → User selects color → Preview updates instantly → Color value saved
- **Success criteria**: All color changes reflect immediately in preview and in exported JSON

### Live Theme Preview
- **Functionality**: Visual representation showing how selected colors appear in typical Power BI report elements (charts, cards, tables)
- **Purpose**: Eliminates guesswork by showing real-time preview of theme appearance
- **Trigger**: Automatic on any color change
- **Progression**: Color selected → Preview components update → User evaluates appearance → Makes adjustments as needed
- **Success criteria**: Preview accurately represents Power BI's rendering of the theme colors

### JSON Export
- **Functionality**: One-click download of complete Power BI theme JSON file
- **Purpose**: Provides ready-to-use theme file that can be imported directly into Power BI
- **Trigger**: User clicks export/download button
- **Progression**: Click export → JSON generated from current colors → File downloads with descriptive name → User imports into Power BI
- **Success criteria**: Exported JSON is valid and imports successfully into Power BI Desktop

### Preset Templates
- **Functionality**: Pre-configured color schemes users can apply as starting points
- **Purpose**: Speeds up theme creation by providing professional starting points
- **Trigger**: User selects a preset template from gallery
- **Progression**: Browse presets → Click desired preset → All colors update → User customizes as needed → Export final theme
- **Success criteria**: Presets load instantly and provide diverse, professional color combinations

### Reset Functionality
- **Functionality**: Restore all colors to default Power BI theme
- **Purpose**: Allows users to start fresh without page reload
- **Trigger**: User clicks reset button
- **Progression**: Click reset → Confirmation prompt → Colors revert to defaults → Preview updates
- **Success criteria**: All customizations cleared, returning to default Power BI theme state

## Edge Case Handling
- **Invalid Color Input** - Validate hex codes and prevent invalid color values from breaking the theme
- **Browser Compatibility** - Ensure color pickers work across all modern browsers with fallbacks
- **Large Export** - Handle JSON generation efficiently even with extensive color customization
- **Accessibility** - Provide keyboard navigation and screen reader support for color selection
- **Mobile Experience** - Adapt color picker interface for touch devices with appropriate sizing

## Design Direction
The design should evoke precision, professionalism, and creative control. It should feel like a sophisticated design tool that business analysts and data professionals trust. The interface should have a studio-quality feel—clean, organized, and purposeful—with visual elements that suggest data visualization and business intelligence.

## Color Selection

- **Primary Color**: Rich indigo `oklch(0.45 0.15 265)` - Communicates intelligence, professionalism, and analytics expertise
- **Secondary Colors**: 
  - Warm slate background `oklch(0.96 0.01 265)` - Subtle, professional canvas
  - Deep charcoal `oklch(0.25 0.02 265)` - For headings and emphasis
- **Accent Color**: Electric cyan `oklch(0.65 0.18 215)` - Attention-grabbing highlight for CTAs and active states, suggests technology and innovation
- **Foreground/Background Pairings**:
  - Background (Warm Slate #F7F7F9): Deep charcoal (#3A3A40) - Ratio 11.2:1 ✓
  - Primary (Rich Indigo #4A4EDB): White (#FFFFFF) - Ratio 6.8:1 ✓
  - Accent (Electric Cyan #2DB8D8): Deep charcoal (#3A3A40) - Ratio 5.2:1 ✓
  - Card (White #FFFFFF): Deep charcoal (#3A3A40) - Ratio 14.5:1 ✓

## Font Selection
Typography should convey technical precision while maintaining approachability, using modern sans-serif typefaces that work well for both UI and data display.

- **Typographic Hierarchy**:
  - H1 (App Title): Space Grotesk Bold / 32px / tight letter spacing (-0.02em) - Distinctive, technical character
  - H2 (Section Headers): Space Grotesk SemiBold / 20px / normal spacing - Clear hierarchy
  - H3 (Subsections): Space Grotesk Medium / 16px / normal spacing - Organized structure
  - Body (Instructions, Labels): Inter Regular / 14px / relaxed line-height (1.6) - Maximum readability
  - UI Labels (Color Values): JetBrains Mono Regular / 13px / tabular numbers - Technical precision for hex codes

## Animations
Animations should feel precise and responsive, reinforcing the professional tool aesthetic. Color transitions should be smooth (200ms ease) when swapping between palettes or adjusting individual colors. The color picker should open with a subtle scale and fade (150ms). Export button should have a satisfying microinteraction with a slight bounce on success. Preview elements should update with a brief highlight flash (300ms) when colors change to draw attention to the update.

## Component Selection
- **Components**:
  - `Card` - Main theme editor container with elevated shadow
  - `Button` - Primary (export), secondary (reset), and ghost variants (presets)
  - `Input` - For hex code entry with validation styling
  - `Label` - Color field identifiers with clear typography
  - `Tabs` - Organize color categories (data colors, background colors, sentiment colors)
  - `Dialog` - Preset template selection gallery
  - `Tooltip` - Explain Power BI color slot purposes
  - `ScrollArea` - Smooth scrolling for long color lists
  - `Badge` - Category tags for preset templates
  
- **Customizations**:
  - **ColorSwatch Component** - Custom interactive color display showing current color with click-to-edit functionality
  - **ThemePreview Component** - Custom visualization showing bar chart, donut chart, and card mockups styled with current theme
  - **PresetCard Component** - Visual preset template cards showing miniature color palettes
  
- **States**:
  - Buttons: Hover lifts slightly (translateY -2px) with shadow increase; active scales down (0.95); disabled reduces opacity to 50%
  - Color swatches: Hover shows edit icon overlay; active shows prominent ring; focus has keyboard-accessible outline
  - Inputs: Focus has cyan accent ring; error shows red border with shake animation; valid shows subtle green check
  
- **Icon Selection**:
  - Download (export functionality) - `ArrowDown` or `DownloadSimple`
  - Reset - `ArrowCounterClockwise`
  - Palette/templates - `Palette`
  - Edit color - `Pencil`
  - Preview - `Eye`
  - Info/help - `Info`
  - Copy - `Copy`
  - Check (validation) - `Check`
  
- **Spacing**:
  - Page padding: `p-6` on mobile, `p-8` on desktop
  - Card padding: `p-6`
  - Color grid gap: `gap-4`
  - Section spacing: `space-y-6`
  - Button group gap: `gap-3`
  - Form field spacing: `space-y-4`
  
- **Mobile**:
  - Color grid switches from 4 columns to 2 columns below 768px
  - Preview section stacks below controls on mobile
  - Preset gallery shows 1 card per row on mobile vs 3 on desktop
  - Floating export button on mobile positioned at bottom
  - Touch targets minimum 44px for all interactive elements

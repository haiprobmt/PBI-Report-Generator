# Power BI Report Generator

**Experience Qualities**:

**Experience Qualities**:
1. **Intelligent** - AI agent automatically generates comprehensive reports from semantic models, understanding data relationships and creating meaningful visualizations
2. **Transparent** - Real-time progress updates show exactly what the agent is doing at each step, building confidence and understanding
3. **Professional** - Enterprise-grade interface combining sophisticated AI capabilities with polished, intuitive design

- **Progression**: Select folder → Files validate → Upload progress indicator → Model parsed → Ready stat


- **Trigger**: User c

### Custom Theme Selection
- **Purpose**: Allows users to apply branded, professional themes to generated reports
- **Progression**: Browse preset themes → Filter/search options → Preview theme → Customi

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
## Design Direction
- **Purpose**: Speeds up theme creation by providing professional starting points that users can easily discover
- **Trigger**: User selects a preset template from gallery, optionally filtering by category or searching
- **Progression**: Browse presets → Filter by category or search → Click desired preset → All colors update → User customizes as needed → Export final theme
- **Success criteria**: Presets load instantly, provide diverse professional color combinations, and are easily discoverable through search and filtering

### Theme Search and Filtering
- **Functionality**: Real-time search and category-based filtering of preset themes
## Font Selection
- **Trigger**: User types in search box or clicks category badge
- **Progression**: Open preset dialog → Type search query or select category → Results filter instantly → User reviews filtered presets → Select desired preset
- **Success criteria**: Search matches theme names, descriptions, and tags; category filters work accurately; results update instantly

### Reset Functionality

- **Purpose**: Allows users to start fresh without page reload
  - `Button` - Primary (generate, downl
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

  - Add item - `Pl

- **Primary Color**: Rich indigo `oklch(0.45 0.15 265)` - Communicates intelligence, professionalism, and analytics expertise
- **Secondary Colors**: 
  - Warm slate background `oklch(0.96 0.01 265)` - Subtle, professional canvas
  - Deep charcoal `oklch(0.25 0.02 265)` - For headings and emphasis
  - Card padding: `p-8` for main areas, `p-6` for compact sections
  - Requirements form spacing: `gap-6
  - Progress log gap: `gap-3` between log entries
  - Action button gap: `gap-4`
- **Mobile**:
  - Upload zone reduces padding but maintains min-height of 200px

  - Progress pane
  - Theme selector shows compact grid with 2 columns vs 4 on desktop


























































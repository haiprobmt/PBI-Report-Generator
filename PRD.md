# Power BI Report Generator

An intelligent tool for generating complete Power BI reports from semantic models with custom themes, featuring AI-powered report creation with real-time progress tracking.

**Experience Qualities**:
1. **Intelligent** - AI agent automatically generates comprehensive reports from semantic models, understanding data relationships and creating meaningful visualizations
2. **Transparent** - Real-time progress updates show exactly what the agent is doing at each step, building confidence and understanding
3. **Professional** - Enterprise-grade interface combining sophisticated AI capabilities with polished, intuitive design

**Complexity Level**: Complex Application (advanced functionality with multiple views and AI integration)
This app orchestrates semantic model uploads, custom theme generation, AI-powered report creation with streaming progress updates, and multiple export options across different views and workflows.

## Essential Features

### Semantic Model Upload
- **Functionality**: Drag-and-drop or click-to-browse file upload for Power BI semantic model folders (containing .bim or dataset files)
- **Purpose**: Provides the data structure foundation for AI-powered report generation
- **Trigger**: User drags folder to drop zone or clicks browse button
- **Progression**: Select folder → Files validate → Upload progress indicator → Model parsed → Ready state confirmed → User proceeds to theme selection
- **Success criteria**: Successfully accepts semantic model folders, validates structure, provides clear feedback on upload status and any issues

### Custom Theme Selection
- **Functionality**: Access to the full theme generator with presets, customization, and live preview
- **Purpose**: Allows users to apply branded, professional themes to generated reports
- **Trigger**: User navigates to theme step or clicks "Choose Theme" button
- **Progression**: Browse preset themes → Filter/search options → Preview theme → Customize if needed → Select theme → Theme applied to generation workflow
- **Success criteria**: All existing theme functionality works seamlessly, selected theme persists and applies to generated report

### AI Report Generation
- **Functionality**: AI agent analyzes semantic model and generates comprehensive Power BI report with multiple visualizations
- **Purpose**: Automatically creates professional, insight-rich reports without manual design work
- **Trigger**: User clicks "Generate Report" button after uploading model and selecting theme
- **Progression**: Click generate → Agent initializes → Progress stream begins → Agent analyzes model → Creates visualizations → Applies theme → Finalizes report → Download ready
- **Success criteria**: Agent successfully generates valid Power BI report file, process completes within reasonable time, result matches theme and model structure

### Real-time Progress Display
- **Functionality**: Live streaming updates showing agent's current task, step-by-step progress with status indicators
- **Purpose**: Maintains user engagement and confidence by showing transparent, real-time generation progress
- **Trigger**: Automatic when report generation begins
- **Progression**: Generation starts → Progress panel appears → Status updates stream in real-time → Visual progress indicators advance → Completion state shows → Actions become available
- **Success criteria**: Progress updates appear smoothly without lag, clearly communicate current status, provide time estimates, handle errors gracefully

### Report Download
- **Functionality**: One-click download of generated .pbix Power BI report file
- **Purpose**: Provides the generated report file for import into Power BI Desktop
- **Trigger**: User clicks "Download Report" button after generation completes
- **Progression**: Click download → File generates → Browser download initiates → File saved locally → User can open in Power BI Desktop
- **Success criteria**: Downloaded .pbix file is valid, opens successfully in Power BI Desktop, contains expected visualizations and applied theme

### Open in Power BI
- **Functionality**: Direct link or button to open generated report in Power BI web service
- **Purpose**: Provides immediate preview and editing access without desktop software
- **Trigger**: User clicks "Open in Power BI" button after generation completes
- **Progression**: Click open → Authentication if needed → Report opens in new tab → User can view/edit in Power BI Service
- **Success criteria**: Successfully opens report in Power BI web interface, maintains theme and visualizations, provides full editing capabilities

## Edge Case Handling
- **Invalid Model Files** - Detect and provide clear error messages for unsupported or corrupted semantic model files
- **Large File Uploads** - Handle large semantic models with chunked upload progress and validation
- **Generation Failures** - Gracefully handle AI generation errors with retry options and helpful troubleshooting
- **Network Interruptions** - Persist progress state and allow resumption if connection drops during generation
- **Browser Compatibility** - Ensure file upload and download work across all modern browsers
- **Timeout Handling** - Provide clear feedback and options if generation takes unexpectedly long

## Design Direction
The design should evoke intelligence, capability, and trust. It should feel like a sophisticated AI-powered tool that enterprise teams rely on for mission-critical reporting. The interface should balance technical sophistication with approachability—powerful enough for data professionals but intuitive for business users. Progress and status should be communicated with clarity and visual polish that reinforces the quality of the AI-generated output.

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
  - `Card` - Semantic model upload area, theme selector, progress panel with elevated styling
  - `Button` - Primary (generate, download), secondary (choose theme, open PBI), and outline variants
  - `Input` - File path display and theme name with validation
  - `Label` - Step identifiers and field labels with clear hierarchy
  - `Tabs` - Organize generation workflow steps (upload, theme, generate)
  - `Dialog` - Theme preset selection gallery
  - `Progress` - Visual progress bar for file upload and generation stages
  - `Badge` - Status indicators (uploading, analyzing, generating, complete)
  - `ScrollArea` - Progress log viewer and theme preview
  - `Separator` - Visual breaks between workflow sections
  
- **Customizations**:
  - **FileUploadZone Component** - Custom drag-and-drop area with visual feedback for hover/drop states
  - **ProgressStream Component** - Real-time log display with auto-scroll and status icons
  - **GenerationStatus Component** - Multi-stage progress indicator with current step highlighting
  - **ThemeSelector Component** - Compact theme preview with quick access to full customization
  
- **States**:
  - Buttons: Hover elevates with shadow; active scales slightly; disabled shows opacity 50% with cursor not-allowed; loading shows spinner
  - Upload zone: Hover shows border pulse; drag-over shows highlighted border and background; uploading shows progress overlay
  - Progress items: In-progress shows animated spinner; complete shows green check; error shows red warning icon
  - Steps: Active step has primary color; completed steps show check; upcoming steps are muted
  
- **Icon Selection**:
  - Upload - `UploadSimple` or `CloudArrowUp`
  - Generate - `Sparkle` or `MagicWand`
  - Download - `DownloadSimple`
  - Open - `ArrowSquareOut` or `WindowsLogo`
  - Progress states - `CircleNotch` (spinning), `CheckCircle`, `Warning`
  - Theme - `Palette`
  - Model - `Database` or `FileArrowUp`
  - Steps - `NumberCircle` series
  
- **Spacing**:
  - Page padding: `p-6` on mobile, `p-10` on desktop
  - Card padding: `p-8` for main areas, `p-6` for compact sections
  - Upload zone padding: `p-12` to create generous target area
  - Progress log gap: `gap-3` between log entries
  - Step indicator gap: `gap-8` between steps
  - Action button gap: `gap-4`
  
- **Mobile**:
  - Workflow switches from horizontal steps to vertical on mobile
  - Upload zone reduces padding but maintains min-height of 200px
  - Progress panel becomes full-width below main content
  - Action buttons stack vertically with full width
  - Theme selector shows compact grid with 2 columns vs 4 on desktop

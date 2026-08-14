# Power BI Report Generator

An intelligent web application that automates Power BI report generation from semantic models using AI, with customizable themes and template layouts.

**Experience Qualities**:
1. **Intelligent** - AI agent automatically generates comprehensive reports from semantic models, understanding data relationships and creating meaningful visualizations with layout suggestions
2. **Transparent** - Real-time progress updates show exactly what the agent is doing at each step, building confidence and understanding
3. **Professional** - Enterprise-grade interface combining sophisticated AI capabilities with polished, intuitive design

**Complexity Level**: Complex Application - Advanced functionality with multiple views, AI integration, file handling, persistent state management, and multi-step workflow orchestration

## Essential Features

### Semantic Model Upload
- **Functionality**: Drag-and-drop or click-to-browse file upload zone accepting semantic model files
- **Purpose**: Enables users to provide their data model that the AI will analyze for report generation
- **Trigger**: User drags files onto upload zone or clicks to browse
- **Progression**: Select files → Validation → Upload indicator → Model parsed → Confirmation → Continue button enabled
- **Success criteria**: Files validate, upload completes, model metadata extracted and stored

### Report Requirements Definition
- **Functionality**: Structured form for users to specify report goals, desired visualizations, key metrics, and custom instructions
- **Purpose**: Guides AI generation with user intent and business context
- **Trigger**: User proceeds from upload step
- **Progression**: View form → Enter description → Select visualization types → Add key metrics → Optional custom instructions → Save
- **Success criteria**: Requirements saved with persistence, can be edited later, used as context for AI generation

### Custom Theme Selection
- **Functionality**: Browse and select from preset Power BI themes or create custom themes with full color control
- **Purpose**: Ensures generated reports match brand guidelines and visual preferences
- **Trigger**: User proceeds from requirements step
- **Progression**: Browse presets → Filter/search options → Preview theme → Customize colors → Download theme JSON → Continue
- **Success criteria**: Theme selection persisted, preview updates in real-time, JSON export works correctly

### Template Layout Selection (AI-Powered)
- **Functionality**: AI generates 3 diverse layout templates based on requirements and selected theme, user selects preferred option with drag-and-drop editing and AI-powered auto-optimization
- **Purpose**: Provides users with intelligent layout options optimized for their specific needs, with ability to manually customize or let AI automatically arrange visuals
- **Trigger**: User proceeds from theme step, clicks "Generate Layout Suggestions"
- **Progression**: Click generate → AI analyzes requirements + theme → 3 layouts displayed with previews → User reviews options → Select layout → Optional: Enter edit mode to drag/drop visuals → Optional: Click "AI Optimize" to automatically arrange → Continue to generation
- **Success criteria**: AI generates diverse layouts (simple/moderate/complex), layouts are contextually relevant, selection is saved, drag-and-drop editing works smoothly, AI optimization improves layout score and eliminates overlaps, generation can be retried

### AI Layout Optimization
- **Functionality**: Automatically arranges all visualizations and slicers on the canvas for optimal readability, hierarchy, and spacing
- **Purpose**: Eliminates manual positioning work and ensures professional layout following Power BI best practices
- **Trigger**: User clicks "AI Optimize" button in the layout editor
- **Progression**: Click optimize → AI analyzes current layout + requirements + theme → AI calculates optimal positions → Visuals smoothly reposition → Score displayed → Improvements listed → Toast notification confirms success
- **Success criteria**: No overlaps remain, proper spacing maintained, visual hierarchy respected (KPIs at top, charts below), elements aligned to grid, layout score improves significantly (80+/100), user can undo if needed

### Report Preview
- **Functionality**: Visual mockup showing how the selected theme will look in a Power BI report context
- **Purpose**: Eliminates guesswork by providing visual confirmation before generation
- **Trigger**: Automatic when theme is selected or customized
- **Progression**: Theme selected → Preview renders with sample visualizations → User evaluates → Makes theme adjustments if needed
- **Success criteria**: Preview accurately represents Power BI rendering, updates in real-time with theme changes

### Agent Build Package Generation
- **Functionality**: Packages source evidence, requirements, theme, approved `.pen` layout, and Power BI authoring instructions for a build agent
- **Purpose**: Creates a grounded, repeatable handoff for PBIP generation while the automated Windows build worker is being developed
- **Trigger**: User approves the Codex-refined pen.dev layout and selects export
- **Progression**: Approve layout → Validate required artifacts → Build ZIP package → Download package
- **Success criteria**: The ZIP contains source data, knowledge, requirements, theme, editable layout, and agent build instructions; it does not claim to be a completed `.pbix`

### Automated PBIP Generation — Target Milestone
- **Functionality**: A DeepSeek Harness build agent consumes the approved package and creates a validated PBIP project through Power BI authoring tools and a Windows worker
- **Purpose**: Complete the end-to-end automation without requiring the user to run a separate agent manually
- **Success criteria**: The PBIP opens without repair prompts, passes available schema and semantic-model validations, and matches the approved layout contract

### Progress Streaming
- **Functionality**: Real-time display of generation progress with descriptive step messages and status indicators
- **Purpose**: Provides transparency into AI operations and estimated completion
- **Trigger**: Automatically during report generation
- **Progression**: Generation starts → Steps appear sequentially → Each step shows in-progress → Completes with checkmark → Next step begins → All steps complete
- **Success criteria**: Progress updates are accurate, timing feels natural, user understands what's happening

### Report Download and Access
- **Functionality**: Download generated .pbix file locally or open directly in Power BI Service
- **Purpose**: Provides flexible access to the generated report
- **Trigger**: Report generation completes successfully
- **Progression**: Generation complete → Success screen → Two options presented → Download or Open in PBI → Action completes → Option to generate another report
- **Success criteria**: Download works correctly with proper filename, Open PBI action initiates correctly, can restart workflow

### State Persistence
- **Functionality**: Theme selection, requirements, and layout selection persist between sessions using Spark KV store
- **Purpose**: Users don't lose work if they close the browser or navigate away
- **Trigger**: Automatic on any state change
- **Progression**: User makes selection → State saves automatically → User closes tab → Returns later → Previous selections restored
- **Success criteria**: Theme, requirements, and layout persist across sessions, semantic model doesn't persist (file upload is session-only)

## Edge Case Handling
- **Invalid File Upload** - Validate file types and sizes, show clear error messages for unsupported formats
- **AI Generation Failure** - Provide fallback layout suggestions if AI call fails, allow retry with clear error messaging
- **AI Optimization Failure** - Falls back to rule-based optimization if LLM call fails, still provides improvements
- **Empty Requirements** - Allow proceeding with minimal requirements, AI adapts to limited context
- **No Visuals on Canvas** - AI Optimize button disabled until at least one visual added
- **Overlapping Visuals** - Display warning badge with overlap count, AI optimization eliminates all overlaps
- **Browser Compatibility** - Ensure file upload and download work across modern browsers
- **Large Semantic Models** - Handle file size validation before upload, provide feedback for files that are too large
- **Incomplete Workflow** - Allow navigation back to previous steps, preserve all entered data
- **Network Interruption** - Handle API failures gracefully with user-friendly error messages and retry options

## Design Direction
The design should evoke intelligence, precision, and enterprise professionalism. It should feel like a powerful AI-assisted tool that data professionals trust. The interface combines the sophistication of business intelligence platforms with the approachability of modern web applications. Visual elements should suggest data visualization, analytical thinking, and automated intelligence while maintaining clarity and ease of use.

## Color Selection
Modern, professional palette with tech-forward accent colors that suggest intelligence and data analytics.

- **Primary Color**: Deep indigo `oklch(0.45 0.15 260)` - Conveys intelligence, analytics expertise, and technological sophistication
- **Secondary Colors**: 
  - Light slate background `oklch(0.98 0.002 240)` - Clean, professional canvas
  - Dark charcoal `oklch(0.10 0.005 240)` - For headings and high-contrast text
  - Soft gray `oklch(0.96 0.005 240)` - For muted backgrounds and cards
- **Accent Color**: Primary indigo used for CTAs, active states, and key interactive elements
- **Foreground/Background Pairings**:
  - Background (White #FFFFFF): Foreground (Charcoal oklch(0.10 0.005 240)) - Ratio 16.1:1 ✓
  - Primary (Indigo oklch(0.45 0.15 260)): White text - Ratio 6.2:1 ✓
  - Muted (Soft Gray oklch(0.96 0.005 240)): Muted Foreground (oklch(0.45 0.01 240)) - Ratio 4.9:1 ✓
  - Accent (Charcoal oklch(0.10 0.005 240)): White text - Ratio 16.1:1 ✓

## Font Selection
Typography should balance technical precision with approachability, using modern sans-serif typefaces that feel both professional and contemporary.

- **Primary Font**: Inter - Clean, highly legible sans-serif for body text and UI elements
- **Display Font**: Space Grotesk (referenced in theme.json but not loaded) - Could be used for headings for a more distinctive technical feel, but currently defaults to Inter
- **Monospace Font**: JetBrains Mono - For code-like elements, file names, and technical details

**Typographic Hierarchy**:
- H1 (Page Title): Inter Bold/36-40px/tight letter-spacing
- H2 (Section Headers): Inter Bold/24-28px/normal
- H3 (Card Titles): Inter Semibold/18-20px/normal
- Body Text: Inter Regular/14-16px/relaxed leading
- Small Text: Inter Regular/12-14px/normal
- Button Text: Inter Medium/14-16px/normal

## Animations
Animations should enhance the feeling of intelligence and responsiveness. Use purposeful, physics-based motion for state transitions, with special attention to the progress streaming animation which should feel like an AI "thinking" in real-time. Avoid gratuitous animation; every motion should serve usability or delight.

- **Step Transitions**: 300ms ease-out transitions when moving between workflow steps
- **Progress Streaming**: Smooth 200ms fade-in for each new progress item, with staggered timing for organic feel
- **Card Interactions**: Subtle 150ms scale and shadow transitions on hover for layout cards
- **Button States**: Quick 100ms transitions for hover and active states
- **Upload Zone**: Gentle pulse animation on drag-over to indicate drop target
- **Success States**: Satisfying 300ms scale-up animation for checkmarks and completion indicators

## Component Selection

**Components**:
- `Card` - Primary container for all major sections (upload, theme selector, generation settings, results)
- `Button` - Primary (generate, download, continue), Secondary (back navigation), Outline (customize, regenerate)
- `Input` - Text fields in requirements form
- `Textarea` - Description and custom instructions fields
- `Badge` - Complexity indicators (simple/moderate/complex), feature tags, theme categories
- `Skeleton` - Loading placeholders during layout generation
- `Progress` - Linear progress for file upload (if needed)
- Custom `FileUploadZone` - Drag-and-drop interface for semantic model
- Custom `StepIndicator` - Workflow progress visualization (6 steps)
- Custom `ProgressStream` - Real-time generation progress display
- Custom `ThemeSelector` - Preset theme browsing with preview
- Custom `ThemeCustomizer` - Full color customization interface
- Custom `LayoutCard` - Layout template display with selection
- Custom `TemplateLayoutSelector` - AI layout suggestion container

**Customizations**:
- Upload zone uses custom styling with dashed borders and hover states
- Layout cards have custom hover effects with ring highlighting when selected
- Progress stream uses custom status indicators (in-progress/complete/error)
- Step indicator uses custom circular badges with check icons for completed steps
- Theme preview shows custom mockup of Power BI report elements

**States**:
- Buttons: Hover (slight brightness increase), Active (scale down slightly), Disabled (opacity 50%, no cursor)
- Cards: Hover (subtle shadow lift), Selected (primary ring border, scale up slightly)
- Inputs: Focus (primary ring), Error (destructive ring), Filled (subtle background change)
- Upload Zone: Default (dashed border), Hover (primary border), Drag-over (primary background tint), Uploaded (success state with checkmark)
- Progress Steps: Pending (gray), In-Progress (primary color, animated), Complete (green checkmark), Error (red x icon)

**Icon Selection**:
- Upload: CloudArrowUp (phosphor-icons)
- Generate: Sparkle (phosphor-icons, filled variant)
- AI Optimize: Sparkle (phosphor-icons, filled variant)
- Download: DownloadSimple (phosphor-icons)
- Open PBI: ArrowSquareOut (phosphor-icons)
- Continue: ArrowRight (phosphor-icons)
- Back: ArrowLeft (phosphor-icons)
- Complete: CheckCircle (phosphor-icons, filled, green)
- Customize: MagicWand or Palette (phosphor-icons)
- Layout: GridFour (phosphor-icons)
- Warning: Warning (phosphor-icons, filled) - for overlap detection
- Info: FileText, ChartBar (phosphor-icons)

**Spacing**:
- Container padding: `p-6` for cards, `p-8` for main content areas
- Section gaps: `gap-6` for major sections, `gap-4` for related elements
- Grid gaps: `gap-6` for layout cards, `gap-4` for form fields
- Button spacing: `gap-2` for icon + text combinations
- Stack spacing: `space-y-6` for major vertical sections, `space-y-4` for related content
- Inline spacing: `gap-2` for badges and small elements

**Mobile**:
- Upload zone maintains minimum height of 200px, reduces padding to `p-4`
- Layout card grid switches from 3 columns to 1 column on mobile, 2 on tablet
- Theme selector grid reduces from 4 columns desktop to 2 columns mobile
- Step indicator font size reduces, spacing tightens for better fit
- Navigation buttons stack vertically on mobile with full width
- Progress stream maintains full width, may scroll horizontally if needed
- Requirements form switches to single column layout on mobile
- Generation settings cards stack vertically instead of side-by-side

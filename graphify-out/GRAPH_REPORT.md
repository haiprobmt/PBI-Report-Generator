# Graph Report - .  (2026-08-10)

## Corpus Check
- Corpus is ~38,288 words - fits in a single context window. You may not need a graph.

## Summary
- 658 nodes · 1273 edges · 35 communities (32 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core UI Types and Editor|Core UI Types and Editor]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_Layout and Requirements UI|Layout and Requirements UI]]
- [[_COMMUNITY_App Workflow and Actions|App Workflow and Actions]]
- [[_COMMUNITY_Sidebar UI Components|Sidebar UI Components]]
- [[_COMMUNITY_Shared UI Utilities|Shared UI Utilities]]
- [[_COMMUNITY_Product Design Documentation|Product Design Documentation]]
- [[_COMMUNITY_Package Build Configuration|Package Build Configuration]]
- [[_COMMUNITY_Backend API Client|Backend API Client]]
- [[_COMMUNITY_Layout Components and Types|Layout Components and Types]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_UI Component Configuration|UI Component Configuration]]
- [[_COMMUNITY_Menubar Components|Menubar Components]]
- [[_COMMUNITY_Context Menu Components|Context Menu Components]]
- [[_COMMUNITY_Dropdown Menu Components|Dropdown Menu Components]]
- [[_COMMUNITY_Theme Color Utilities|Theme Color Utilities]]
- [[_COMMUNITY_Report Configuration Generation|Report Configuration Generation]]
- [[_COMMUNITY_Carousel Components|Carousel Components]]
- [[_COMMUNITY_Form Components|Form Components]]
- [[_COMMUNITY_Azure OpenAI Client|Azure OpenAI Client]]
- [[_COMMUNITY_App Entry and Errors|App Entry and Errors]]
- [[_COMMUNITY_Chart Components|Chart Components]]
- [[_COMMUNITY_Drawer Components|Drawer Components]]
- [[_COMMUNITY_Sheet Components|Sheet Components]]
- [[_COMMUNITY_Navigation Components|Navigation Components]]
- [[_COMMUNITY_HTML App Shell|HTML App Shell]]
- [[_COMMUNITY_Accordion Components|Accordion Components]]
- [[_COMMUNITY_Security Policy|Security Policy]]
- [[_COMMUNITY_Tailwind Configuration|Tailwind Configuration]]
- [[_COMMUNITY_Dev Container Updates|Dev Container Updates]]
- [[_COMMUNITY_npm Dependency Updates|npm Dependency Updates]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 234 edges
2. `PowerBITheme` - 22 edges
3. `Card()` - 20 edges
4. `Button()` - 18 edges
5. `compilerOptions` - 17 edges
6. `ReportRequirements` - 16 edges
7. `Badge()` - 15 edges
8. `BackendAPI` - 12 edges
9. `VisualizationConfig` - 12 edges
10. `SlicerConfig` - 11 edges

## Surprising Connections (you probably didn't know these)
- `DraggableLayoutEditor` --semantically_similar_to--> `Drag-and-Drop Layout Editor`  [INFERRED] [semantically similar]
  LAYOUT_EDITOR_IMPROVEMENTS.md → README.md
- `Power BI Report Generator` --semantically_similar_to--> `Power BI Report Generator`  [INFERRED] [semantically similar]
  PRD.md → README.md
- `Report Requirements Definition` --semantically_similar_to--> `AI Requirements Assistant`  [INFERRED] [semantically similar]
  PRD.md → README.md
- `AI Layout Optimization` --semantically_similar_to--> `AI Layout Optimization`  [INFERRED] [semantically similar]
  PRD.md → README.md
- `ReportRequirementsFormProps` --references--> `ReportRequirements`  [EXTRACTED]
  frontend/src/components/ReportRequirementsForm.tsx → frontend/src/lib/types.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **AI Report Generation Workflow** — frontend_prd_semantic_model_upload, frontend_prd_report_requirements_definition, frontend_prd_custom_theme_selection, frontend_prd_ai_template_layout_selection, frontend_prd_ai_report_generation, frontend_prd_report_download_and_access [EXTRACTED 1.00]
- **Layout Editor Interaction Improvements** — frontend_layout_editor_improvements_drag_offset_positioning, frontend_layout_editor_improvements_saved_layout, frontend_layout_editor_improvements_layout_history_state, frontend_layout_editor_improvements_eight_point_resizing, frontend_layout_editor_improvements_canvas_resizing [EXTRACTED 1.00]
- **AI-Assisted Report Design** — frontend_readme_ai_requirements_assistant, frontend_readme_drag_and_drop_layout_editor, frontend_readme_ai_layout_optimization, frontend_readme_layout_scoring [EXTRACTED 1.00]

## Communities (35 total, 3 thin omitted)

### Community 0 - "Core UI Types and Editor"
Cohesion: 0.07
Nodes (52): AIChatRequirements(), AIChatRequirementsProps, Message, DraggableLayoutEditor(), DraggableLayoutEditorProps, LayoutHistoryState, ResizeHandle, SavedLayout (+44 more)

### Community 1 - "Runtime Dependencies"
Cohesion: 0.03
Nodes (64): dependencies, class-variance-authority, clsx, cmdk, d3, date-fns, embla-carousel-react, framer-motion (+56 more)

### Community 2 - "Layout and Requirements UI"
Cohesion: 0.06
Nodes (42): ReportRequirementsFormProps, SUGGESTED_METRICS, SUGGESTED_VISUALIZATIONS, PLACEMENT_OPTIONS, SlicerPlacementCustomizer(), SlicerPlacementCustomizerProps, ThemeCustomizerProps, DEFAULT_THEME (+34 more)

### Community 3 - "App Workflow and Actions"
Cohesion: 0.06
Nodes (34): ConfigurationSpecViewer(), ConfigurationSpecViewerProps, FileUploadZone(), FileUploadZoneProps, buildSteps, FloatingVisual, ReportBuildingAnimationProps, visualTypes (+26 more)

### Community 4 - "Sidebar UI Components"
Cohesion: 0.07
Nodes (34): useIsMobile(), Separator(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup() (+26 more)

### Community 5 - "Shared UI Utilities"
Cohesion: 0.12
Nodes (23): cn(), Avatar(), AvatarFallback(), AvatarImage(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList() (+15 more)

### Community 6 - "Product Design Documentation"
Cohesion: 0.08
Nodes (28): Bounded Undo/Redo History, Canvas Resizing, Drag Offset Positioning, DraggableLayoutEditor, Eight-Point Visual Resizing, Global Mouse Resize Listeners, LayoutHistoryState, SavedLayout (+20 more)

### Community 7 - "Package Build Configuration"
Cohesion: 0.07
Nodes (27): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, tailwindcss, @tailwindcss/postcss (+19 more)

### Community 8 - "Backend API Client"
Cohesion: 0.07
Nodes (15): BackendAPI, CompleteEvent, DAGNode, GenerateReportRequest, GenerationStartResponse, GenerationStatus, LayoutConfiguration, PageConfig (+7 more)

### Community 9 - "Layout Components and Types"
Cohesion: 0.11
Nodes (14): LayoutCard(), LayoutCardProps, LayoutPreview(), LayoutPreviewProps, ReportLayout, Checkbox(), HoverCardContent(), ResizableHandle() (+6 more)

### Community 10 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 11 - "UI Component Configuration"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "Menubar Components"
Cohesion: 0.12
Nodes (11): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator(), MenubarShortcut() (+3 more)

### Community 13 - "Context Menu Components"
Cohesion: 0.12
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+1 more)

### Community 14 - "Dropdown Menu Components"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 15 - "Theme Color Utilities"
Cohesion: 0.20
Nodes (11): ColorPicker(), ColorPickerProps, downloadTheme(), generateThemeJSON(), getContrastRatio(), hexToRgb(), isValidHexColor(), normalizeHexColor() (+3 more)

### Community 16 - "Report Configuration Generation"
Cohesion: 0.23
Nodes (12): LayoutExportPreview, LayoutExportPreviewProps, SLICER_ICONS, VISUAL_ICONS, calculateAvailableWidth(), calculateContentStartY(), calculateCustomPageSize(), generateReportConfiguration() (+4 more)

### Community 17 - "Carousel Components"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 18 - "Form Components"
Cohesion: 0.23
Nodes (10): FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext, FormItemContextValue, FormLabel() (+2 more)

### Community 19 - "Azure OpenAI Client"
Cohesion: 0.22
Nodes (6): azureOpenAI, AzureOpenAIConfig, AzureOpenAIService, ChatCompletionResponse, ChatMessage, isLLMConfigured()

### Community 20 - "App Entry and Errors"
Cohesion: 0.29
Nodes (7): ErrorFallback(), ErrorFallbackProps, Alert(), AlertDescription(), AlertTitle(), alertVariants, Toaster()

### Community 21 - "Chart Components"
Cohesion: 0.22
Nodes (8): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), THEMES, useChart()

### Community 22 - "Drawer Components"
Cohesion: 0.18
Nodes (6): DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle()

### Community 23 - "Sheet Components"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 24 - "Navigation Components"
Cohesion: 0.22
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 25 - "HTML App Shell"
Cohesion: 0.40
Nodes (5): Google Fonts Stylesheet, /src/main.css, /src/main.tsx, Power BI Report Generator HTML Shell, Root Application Mount

### Community 26 - "Accordion Components"
Cohesion: 0.40
Nodes (3): AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 28 - "Security Policy"
Cohesion: 0.67
Nodes (3): Coordinated Disclosure, GitHub Safe Harbor Policy, Open Source Bug Bounty Scope

## Knowledge Gaps
- **195 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+190 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Shared UI Utilities` to `Core UI Types and Editor`, `Layout and Requirements UI`, `App Workflow and Actions`, `Sidebar UI Components`, `Layout Components and Types`, `Menubar Components`, `Context Menu Components`, `Dropdown Menu Components`, `Theme Color Utilities`, `Carousel Components`, `Form Components`, `App Entry and Errors`, `Chart Components`, `Drawer Components`, `Sheet Components`, `Navigation Components`, `Accordion Components`?**
  _High betweenness centrality (0.327) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `Package Build Configuration`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `Button()` connect `App Workflow and Actions` to `Core UI Types and Editor`, `Layout and Requirements UI`, `Sidebar UI Components`, `Shared UI Utilities`, `Carousel Components`, `App Entry and Errors`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _200 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core UI Types and Editor` be split into smaller, more focused modules?**
  _Cohesion score 0.06533646322378717 - nodes in this community are weakly interconnected._
- **Should `Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03125 - nodes in this community are weakly interconnected._
- **Should `Layout and Requirements UI` be split into smaller, more focused modules?**
  _Cohesion score 0.059227921734531994 - nodes in this community are weakly interconnected._
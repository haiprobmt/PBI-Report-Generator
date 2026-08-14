# Power BI Report Generator

An AI-assisted workflow that turns mixed business files into a grounded knowledge base, automatically analyzes Power BI requirements, produces a pen.dev-compatible report layout, and exports an agent-ready report build package.

## Getting Started

### Prerequisites

- Node.js 20.19 or later (Node.js 22.12 or later is also supported)
- npm
- A DeepSeek API key with access to DeepSeek V4
- pen.dev desktop app or its VS Code/Cursor extension
- A local Codex CLI; stage 3 can connect it directly to your ChatGPT account

### Run Locally

From the repository root:

```bash
cd frontend
npm ci
```

Copy `frontend/.env.example` to `frontend/.env`, then add your server-side DeepSeek settings:

```dotenv
DEEPSEEK_API_KEY=<your-deepseek-api-key>
DEEPSEEK_MODEL=deepseek-v4-pro
DEEPSEEK_BASE_URL=https://api.deepseek.com
CODEX_AUTH_MODE=chatgpt
CODEX_API_KEY=
CODEX_MODEL=
```

Then start the development server:

```bash
npm run dev
```

Open the URL printed by Vite, normally <http://localhost:5173>.

All DeepSeek requests run through Vite's server middleware, so the API key is never bundled into browser code. The app fails with a clear configuration error when `DEEPSEEK_API_KEY` is missing.

The included middleware runs with `npm run dev` and `npm run preview`. A production static host must provide equivalent `/api/ai/*` and `/api/pen/*` server routes and enforce the same upload limits.

For the real pen.dev canvas step, start pen.dev, open the prepared `.pen` file through VS Code or Cursor, and confirm that the local `pencil` MCP server is available to Codex. Stage 3 includes **Connect Codex**, which starts the official ChatGPT device-login flow and polls `codex login status`. The Codex SDK runs server-side with `modelReasoningEffort: "high"`; credentials stay in the Codex CLI credential store and are never returned to the browser.

With `CODEX_AUTH_MODE=chatgpt`, leave `CODEX_MODEL` blank. Codex selects a model supported by the signed-in ChatGPT account. To intentionally use usage-based API access, set `CODEX_AUTH_MODE=api-key`, provide `CODEX_API_KEY`, and optionally set `CODEX_MODEL` to a model available to that API project.

### Production Build

```bash
npm run build
npm run preview
```

## Features

### English and Vietnamese

- The language selector persists between sessions and defaults from the browser locale.
- Core workflow screens, DeepSeek responses, requirements, `.pen` annotations, sample-data fields, and `BUILD_REPORT.md` can be generated in Vietnamese.
- Image uploads run both Vietnamese and English OCR so mixed-language business documents remain usable.

### 🚀 Core Functionality
- **Multi-format Knowledge Intake**: CSV/TSV, text, JSON/XML/YAML, PDF, DOCX, XLSX, PPTX, and common image formats with OCR
- **DeepSeek V4 Knowledge Base**: Grounded domain, metric, dimension, relationship, and report-question extraction
- **Automatic Requirement Analysis**: One-pass source analysis that finalizes a detailed Requirements Summary without asking follow-up questions
- **Codex pen.dev Designer**: Describe the desired visual identity and let a high-reasoning Codex thread refine the actual `.pen` canvas
- **Simulated Report Preview**: Render generated visuals and layout against uploaded sample data
- **Real Report Layout Workspace**: Prepare a native `.pen` document, open it in the official VS Code/Cursor canvas, and display the pen.dev-rendered snapshot in the workflow
- **Codex SDK Canvas Agent**: Refine the live canvas through pen.dev's local `pencil` MCP server with high reasoning
- **Progress Tracking**: Real-time AI agent progress updates during report generation
- **Agent Build Package**: Export source files, knowledge JSON, requirements, theme, `.pen` layout, sample data when needed, and `BUILD_REPORT.md`

### 🤖 AI-Powered Features

#### Automatic Requirement Analysis
- Runs automatically when stage two opens and analyzes the uploaded-source knowledge base and detected fields in one pass
- Finalizes purpose, audience, decisions, questions, KPI definitions and targets, analysis dimensions, time behavior, pages, visual contracts, filters, interactions, design identity, data grain, refresh, governance, and acceptance criteria
- Preserves source-supported facts and labels unsupported design choices as explicit assumptions instead of asking follow-up questions
- Carries the complete structured Requirements Summary into the pen.dev prompt, `report-requirements.md`, and `BUILD_REPORT.md`
- Lets the user regenerate the analysis or continue directly to layout design

#### AI Layout Optimization
- Automatically arranges all visualizations for optimal layout
- Eliminates overlaps and ensures proper spacing
- Follows Power BI best practices (KPIs at top, proper hierarchy)
- Calculates layout quality score (0-100)
- Provides improvement feedback
- Falls back to rule-based optimization if AI unavailable

### 🎨 Layout Editor Features
- **Visual Gallery**: Drag visuals from sidebar to canvas
  - KPI Cards, Bar Charts, Line Charts, Pie Charts
  - Tables, Matrix, Area Charts, Scatter Plots
  - Gauges, Maps
- **Slicer Types**: Date, Category, Numeric, Text
- **Real-time Overlap Detection**: Visual warnings for overlapping elements
- **Layout Score**: Calculate quality score of your layout
- **Duplicate & Delete**: Quick actions for selected elements

## How It Works

1. **Source Knowledge**: Upload data, documents, or images; local extractors and OCR prepare text for DeepSeek V4 analysis
2. **Requirement Analysis**: DeepSeek V4 automatically finalizes a source-grounded Requirements Summary. Missing documentary details become labeled assumptions; the stage does not ask follow-up questions
3. **Report Layout**: Create a grounded baseline and pass the complete analyzed contract into the real pen.dev workflow. Use the Codex adjustment textarea to request changes against the current canvas at any time
4. **pen.dev Workspace**: Prepare the `.pen` source and open the actual canvas in the pen.dev VS Code/Cursor extension
   - Keep the prepared file open so the local `pencil` MCP server targets the correct canvas
   - Run the server-side Codex SDK design turn with high reasoning; successful `pencil` MCP activity is required before continuing
   - Review the snapshot rendered by pen.dev; the resulting `.pen` document flows into the export package
5. **Agent Instructions**: Download a ZIP that tells an agent which Power BI authoring skills to invoke and includes generated sample CSV data when no usable table was uploaded

## Technical Details

### AI Optimization Algorithm
The AI optimizer considers:
- Report requirements and key metrics
- Visual hierarchy (KPIs prioritized)
- Proper spacing and alignment
- Grouping of related visualizations
- Page size constraints (1280x720px)
- No overlaps
- Grid-based alignment

### Fallback Strategy
If AI optimization fails, the system uses a rule-based algorithm that:
- Places slicers horizontally at the top
- Positions KPI cards in a row below slicers
- Arranges charts in a grid layout
- Ensures consistent spacing throughout

### Layout Scoring
Layouts are scored based on:
- **Overlaps**: -10 points per overlap
- **Bounds**: -5 points per element out of bounds
- **Alignment**: +10 points for good alignment
- **Final Score**: 0-100 scale

## Technologies Used
- **React + TypeScript**: Modern UI framework
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality component library
- **Phosphor Icons**: Beautiful icon set
- **Framer Motion**: Smooth animations
- **Spark Runtime SDK**: AI and persistence capabilities
- **DeepSeek V4 API**: Server-side knowledge extraction and automatic requirement analysis
- **pen.dev + pencil MCP**: Real local canvas editing and a Git-friendly `.pen` report layout handoff
- **OpenAI Codex SDK**: Server-side, high-reasoning control of the pen.dev MCP workflow
- **PDF.js, Mammoth, read-excel-file, Tesseract.js**: Local source extraction and OCR before AI analysis

## Development

This is a Spark template project optimized for the Spark runtime environment.

📄 **License**: The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

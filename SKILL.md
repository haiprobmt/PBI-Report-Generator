---
name: generate-pbip-report
description: "Generate a Power BI PBIP report from requirements. Reads the report spec from ./requirements/requirements.md, uses data from ./data/. Imports data into Power BI, designs the semantic model via PBI Model MCP, then builds visuals using the pbip MCP. WHEN: create report, generate report, build report, Power BI report, PBIP report, dashboard, create dashboard, build dashboard, new report."
---

# Generate PBIP Report

> Orchestrates **pbip-mcp** (scaffolding & visuals) and **powerbi-model** (semantic model) to produce a complete PBIP project from requirements.

---

## Input Paths

| Resource | Path |
|---|---|
| **Data (CSVs)** | `./data/` |
| **Requirements** | `./requirements/requirements.md` |

---

## Workflow Overview

```
PHASE 0: Read requirements + CSV headers
       ↓
PHASE 1: Scaffold PBIP → Open PBI Desktop → Connect via PBI Model MCP
       ↓
PHASE 2: Star schema model (rename → extract dims → dim_date → relationships → measures → save & close)
       ↓
PHASE 3: Visuals (page bg → add visuals → format → open report)
       ↓
output/<ProjectName>/
```

---

## PHASE 0: Read Inputs

Read `./requirements/requirements.md` — this is the **source of truth** for report name, metrics, visual types, exact layout coordinates (x, y, width, height), and slicer fields. Do NOT invent layout — use the file's values directly.

List all CSVs in `./data/` and read each header row to understand available columns.

---

## PHASE 1: Scaffold & Connect

**1.1 — Scaffold** via `mcp_pbip-mcp_scaffold_pbip_project`:
- `output_path`: absolute path to `output/` in the workspace
- `project_name`: from requirements
- `semantic_model_tables`: raw CSV table names (original names, no `fact_`/`dim_` prefixes), plus a `_Measures` table with a `MeasureHelper` placeholder column
- `skip_default_visuals`: **true**
- Do NOT pass relationships or `dim_date` — these are built in Phase 2

**1.2 — Open & Connect**:
1. Run `Invoke-Item "<output_path>/<ProjectName>.pbip"` — wait ~30 seconds
2. Call `mcp_powerbi-model_connection_operations` → `ListLocalInstances` to find the port
3. Call it again → `Connect` with the discovered port

---

## PHASE 2: Semantic Model (PBI Model MCP)

Design a **star schema**: facts hold numeric/transactional data; dimensions hold descriptive/lookup attributes. All relationships are **one-to-many, OneDirection** (dim PK → fact FK). Every fact table must connect to at least one dim.

### 2.1 — Plan the Model

Using the CSV headers from Phase 0:
- **Classify** each table: fact (transactions + numeric measures) or dim (descriptive, low-cardinality)
- **Split flat tables**: if a single CSV has repeating categorical columns (e.g. `Category`, `Department`), plan to extract them as dim tables via Power Query
  - Good candidates: columns with far fewer unique values than total rows, or columns used as slicers
- **Identify relationships**: shared columns between tables (IDs, names, dates) → fact FK → dim PK
- **Design measures** from requirements Key Metrics: SUM/AVERAGE/DIVIDE/COUNTROWS, all in `_Measures` table, all with `formatString` (`$#,##0.00` / `0.00%;-0.00%;0.00%` / `#,##0`)
- **Never** name a measure the same as an existing column
- **Layout spec**: map each requirement visual to a measure/column, and note exact x/y/width/height from requirements

### 2.2 — Build the Tabular Model

**CRITICAL ORDER — always in this exact sequence:**

**① Rename imported tables** (`mcp_powerbi-model_table_operations` → Rename):
- Fact tables → `fact_<name>`, Dimension tables → `dim_<name>`, strip redundant source prefixes; `_Measures` stays as-is

**② Extract dim tables from flat data** (`mcp_powerbi-model_table_operations` → Create):
- Use **Power Query (MExpression) only** — NEVER DaxExpression. Always provide `Columns` with Name+DataType.
- M expressions MUST reference the **already-renamed** fact table. Creating dims before renaming breaks the M reference with "import matches no exports".
- Example: `let Source = fact_finance, Selected = Table.SelectColumns(Source, {"Category"}), Unique = Table.Distinct(Selected) in Unique`

**③ Create `dim_date`** (`mcp_powerbi-model_table_operations` → Create, MExpression):
- Columns: `Date` (dateTime), `Year` (int64), `Month` (int64), `MonthName` (string), `Quarter` (string), `YearMonth` (string)

**④ Column hygiene** (`mcp_powerbi-model_column_operations` → Update, batch all in one call):
- Hide FK columns in fact tables (`IsHidden: true`)
- Hide `MeasureHelper` in `_Measures`
- Set `SummarizeBy: "None"` on non-numeric columns (IDs, names, categories, dates)

### 2.3 — Create Relationships

Call `mcp_powerbi-model_relationship_operations` → Create for all fact-to-dim pairs (including `dim_date`):
- `FromTable` = fact (many side), `ToTable` = dim (one side)
- `CrossFilteringBehavior`: `"OneDirection"` always

### 2.4 — Create Measures

Call `mcp_powerbi-model_measure_operations` → Create (batch all in one call):
- `TableName`: `"_Measures"` for every measure
- Reference renamed table names in DAX (e.g. `COUNTROWS(fact_finance)`)
- Use `DIVIDE()` for ratios, `SUMX()` for row-level arithmetic — never `SUM(Table[A] * Table[B])`
- Every measure needs a `FormatString`

### 2.5 — Save, Verify & Close

```powershell
$wshell = New-Object -ComObject wscript.shell
$wshell.AppActivate('<ProjectName>') | Out-Null; Start-Sleep -Milliseconds 500
$wshell.SendKeys('^s'); Start-Sleep -Seconds 10
Stop-Process -Name "PBIDesktop" -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 5
```

**CRITICAL — Verify the save actually flushed to disk:**
After closing PBI Desktop, read `<output>/<ProjectName>.SemanticModel/model.bim` and confirm it contains the renamed table names (e.g. `fact_*`, `dim_*`). PBI Desktop may be killed before the file write completes, leaving the original scaffold content.

- **If `model.bim` shows renamed tables** → save succeeded, continue to Phase 3.
- **If `model.bim` still shows the original scaffold table names** → save did NOT flush. Write `model.bim` directly on disk with the complete model definition based on the plan from step 2.1: all renamed tables (with correct M expressions, `isHidden`, `summarizeBy`), all measures (with `formatString`), and all relationships. This is a reliable fallback that fully replaces the unreliable keyboard save.

---

## PHASE 3: Visual Build (pbip MCP)

**3.1 — Set page canvas size**: The scaffold always creates a page with the default size (1280×720), regardless of requirements. Edit `page.json` directly to set the correct canvas dimensions:
- Find the page path from `mcp_pbip-mcp_list_report_pages`
- Edit `<page_path>/page.json`: set `"height"` and `"width"` to match the requirements page size
- Do this **before** adding visuals so coordinates are interpreted correctly

**3.2 — Page background**: `mcp_pbip-mcp_set_page_background`

**3.3 — Add all visuals**: `mcp_pbip-mcp_add_multiple_visuals` with every visual from requirements (exact x/y/width/height). All entity references use **renamed** table names.

**CRITICAL — Verify visual positions after adding:**
Immediately after `add_multiple_visuals`, call `mcp_pbip-mcp_list_page_visuals` and check each visual's `x`/`y`. If any visual shows `x: 0, y: 0` when it should have a non-zero position (this happens when `add_multiple_visuals` encounters an internal error), fix each affected visual using `mcp_pbip-mcp_move_visual` with the correct coordinates from requirements. Do NOT skip this check.

**Visual type selection:**

| Need | Use |
|---|---|
| KPI number | `card` |
| Category comparison (vertical) | `clusteredColumnChart` |
| Category comparison (horizontal) | `clusteredBarChart` |
| Stacked columns / bars | `columnChart` / `barChart` |
| Time trend | `lineChart` / `areaChart` |
| Parts of whole | `donutChart` / `pieChart` |
| Detailed data | `table` / `matrix` |
| Filter | `slicer` (**MANDATORY: 1-2 per report**) |
| Two measures over time | `comboChart` |
| Title / annotation | `textbox` |

**Config formats:**

| Visual | Config keys |
|---|---|
| `card` | `entity`, `value` (measure name), `title` |
| `clusteredColumnChart` / `clusteredBarChart` / `lineChart` / `columnChart` / `barChart` | `entity`, `category`, `values` (array), `title` |
| `donutChart` / `pieChart` / `funnel` | `entity`, `category`, `value` (string), `title` |
| `slicer` | `entity`, `field`, `title` |
| `table` | `entity`, `columns` (array), `measures` (array), `title` |
| `comboChart` | `entity`, `category`, `column_values` (array), `line_values` (array), `title` |
| `textbox` | `text`, `font_size`, `bold`, `color` |

**3.4 — Format**: `mcp_pbip-mcp_set_visual_formatting` per visual:
- Cards & charts: `{"background": "#FFFFFF", "border": true, "border_color": "#D1E5F0"}`

Font sizes by visual height:

| Visual | Height | Font size |
|---|---|---|
| Title textbox | 28-36px | 20pt bold |
| Subtitle textbox | 18-24px | 11pt |
| Card (KPI) | ≤70 / 71-90 / 91-120 / >120px | 16pt / 20pt / 24pt / 28pt |
| Chart title | any | 12pt (PBI default) |
| Slicer | 40-50px | 10-12pt |
| Annotation | 16-20px | 7pt |

**3.5 — Open report**:
```powershell
Invoke-Item "<workspace>/output/<ProjectName>/<ProjectName>.pbip"
```

---

## Output Location

```
<workspace>/output/<ProjectName>/
```

---

## Error Prevention

| Rule | Detail |
|---|---|
| **Rename before extracting dims** | M expressions reference table names — extract dims after renaming, or "import matches no exports" |
| **MExpression only for new tables** | Never DaxExpression. Always provide `Columns` with Name+DataType when using MExpression |
| **Measures in `_Measures`** | Visual entity/queryRef for measures = `_Measures.MeasureName`, never the source table |
| **No measure-column name collisions** | Check CSV columns before naming measures; prefix/suffix if needed |
| **Visual type names** | `stackedColumnChart`/`stackedBarChart` don't exist → use `columnChart`/`barChart`; non-stacked → `clustered*` |
| **value vs values key** | `barChart`/`lineChart` use `"values": []` (array); `donutChart`/`pieChart` use `"value": ""` (string) |
| **Slicers are mandatory** | Every report needs 1-2 slicers; always include `title` |
| **Build model before visuals** | Complete Phase 2 before Phase 3 — measures must exist before visuals reference them |
| **Relationships mandatory** | Every model needs at least one; missing relationships = wrong aggregations |
| **DAX arithmetic** | Never `SUM(T[A] * T[B])` — use `SUMX(T, T[A] * T[B])` |
| **Connection** | ListLocalInstances first to discover port; never guess |
| **Scaffold** | No `fact_`/`dim_` prefixes, no relationships, no `dim_date` in scaffold call |
| **Slicer dropdown** | `data.mode = "'Dropdown'"` in objects; use `visualContainerObjects.title` to hide title, not `objects.header.show` |
| **Save verification** | After killing PBI Desktop, read `model.bim` to confirm renamed tables exist. If the original scaffold names are still there, the save didn't flush — write `model.bim` directly on disk |
| **Visual position check** | After `add_multiple_visuals`, always call `list_page_visuals` to confirm positions. If any visual has `x:0, y:0`, use `move_visual` to correct each one with coordinates from requirements |
| **Page canvas size** | Scaffold default is 1280×720. Always edit `page.json` before adding visuals to set the correct `height`/`width` from requirements |

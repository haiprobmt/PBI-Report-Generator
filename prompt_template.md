Use the Pen.dev/Pencil MCP tools to create a complete, professional Power BI finance report mockup.

INPUT

* Read `finance_data.csv` from the current project folder.
* Inspect its columns, date range, categories, and numeric values before designing.
* Use only calculations and labels supported by the dataset. Do not invent financial results.
* Save the design as `finance-dashboard.pen`.

IMPORTANT EXECUTION RULES

* Do not create only an empty frame.
* Create every visible element as a child of the main report frame.
* Build the dashboard section by section and verify that each section is visible before continuing.
* Use reusable components for KPI cards, slicers, chart containers, and navigation buttons.
* Use Pen variables for colors, spacing, border radius, and typography.
* Prevent overlapping objects, clipped text, cropped charts, and disconnected labels.
* After building, zoom to fit the complete dashboard and inspect the final result visually.
* If any section is empty or incorrectly positioned, fix it before finishing.

REPORT PURPOSE
Design a personal-finance dashboard that answers:

1. How much money came in?
2. How much was spent?
3. What is the current net cash flow?
4. Where is the money going?
5. How is spending changing over time?
6. Which categories require attention?

CANVAS

* Desktop Power BI report page
* Size: 1280 × 720 pixels
* Light professional theme
* 24-pixel outer margins
* 16-pixel spacing between major containers
* Use an 8-pixel spacing system
* All elements must remain within the canvas

VISUAL DIRECTION
Create a polished “Corporate Finance Intelligence” appearance:

* Page background: very light cool gray
* Primary color: deep navy
* Income/accent color: teal
* Expense color: coral red
* Warning color: amber
* Card background: white
* Main text: dark slate
* Secondary text: medium gray
* Subtle borders and shadows
* Corner radius: approximately 10 pixels
* Font: Inter or another clean sans-serif
* Strong information hierarchy with generous whitespace
* Avoid decorative gradients, excessive colors, and heavy shadows

PAGE STRUCTURE

1. HEADER

* Left: title “Where Is My Money Going?”
* Subtitle: “Personal finance performance and spending trends”
* Right: compact “Last refreshed” indicator
* Add a small finance-related icon beside the title

2. FILTER BAR
   Place directly below the header:

* Date range slicer
* Year slicer
* Account slicer, if available
* Transaction type slicer, if available
* Category slicer
* Reset filters button

Style slicers as compact Power BI dropdown controls.

3. KPI ROW
   Create five equal reusable KPI cards:

* Total Income
* Total Expenses
* Net Cash Flow
* Savings Rate
* Average Monthly Spending

Each KPI card must contain:

* Short label
* Large formatted value
* Small comparison or context label
* Relevant line icon
* Optional miniature sparkline when supported by the data

Use green/teal for positive movement and coral/red for negative movement. Do not rely on color alone—also show an arrow or text label.

4. MAIN TREND CHART
   Create a large line or area chart titled:

“Income and Expenses Over Time”

Requirements:

* Month on the X-axis
* Currency on the Y-axis
* Separate lines for income and expenses
* Income shown in teal
* Expenses shown in coral
* Clear legend
* Minimal gridlines
* Highlight the latest month
* Include a small chart subtitle explaining the selected period

This should be the most visually prominent chart.

5. CATEGORY ANALYSIS
   Create a horizontal bar chart titled:

“Top Spending Categories”

Requirements:

* Rank categories by total expense
* Display the top 7 categories
* Show currency data labels
* Use one consistent color, with the largest category highlighted
* Keep category names readable without truncation
* Add a small “View all” text action

6. EXPENSE COMPOSITION
   Create a donut chart titled:

“Expense Distribution”

Requirements:

* Show the largest 5 expense categories
* Combine remaining categories into “Other”
* Show the total expense value in the center
* Display category name and percentage
* Use a restrained, accessible color palette

7. MONTHLY COMPARISON
   Create a clustered column chart titled:

“Monthly Spending Comparison”

Requirements:

* Compare monthly expenses across available years
* Use a clear legend
* Highlight the current or latest year
* Include a short annotation for the month with the highest expense

8. TRANSACTION TABLE
   At the bottom, create a detailed table titled:

“Recent Transactions”

Use available fields such as:

* Date
* Description
* Category
* Account
* Transaction Type
* Amount

Requirements:

* Show approximately 6–8 rows
* Right-align currency values
* Use subtle alternating row backgrounds
* Use red text or a minus sign for expenses
* Use teal text or a plus sign for income
* Add a search icon and “See all transactions” action

POWER BI PRACTICALITY
The design must be implementable using native Power BI visuals. Use visual containers that clearly map to:

* Cards
* Dropdown slicers
* Line chart
* Horizontal bar chart
* Donut chart
* Clustered column chart
* Table

Do not create effects that cannot reasonably be reproduced in Power BI.

FINAL VALIDATION
Before finishing:

1. Confirm that the main frame is not empty.
2. Confirm that all objects are inside the 1280 × 720 report frame.
3. Confirm that no objects overlap.
4. Confirm that all text is readable.
5. Confirm that the design uses actual values from `finance_data.csv`.
6. Confirm consistent margins, spacing, fonts, and colors.
7. Rename layers and groups logically.
8. Present the complete dashboard at zoom-to-fit.
9. Export a PNG preview named `finance-dashboard-preview.png`.
10. Briefly summarize the components and variables created.

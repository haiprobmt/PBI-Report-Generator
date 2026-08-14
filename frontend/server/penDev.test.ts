import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzePenMcpActivity,
  classifyPenEditorAccess,
  createPenCodexOptions,
  createPenDesignPrompt,
  createPenExecuteRepairPrompt,
  extractPenScreenshot,
  extractPenExecuteRepair,
  safeReportFileName,
  runPenDesignTurns,
} from './penDev.ts';

test('creates a safe pen.dev filename without allowing path traversal', () => {
  assert.equal(safeReportFileName('../../Executive Sales / Q4'), 'Executive-Sales-Q4.pen');
  assert.equal(safeReportFileName(''), 'power-bi-report.pen');
});

test('grounds the Codex pen.dev prompt in requirements and source knowledge', () => {
  const prompt = createPenDesignPrompt({
    targetPath: 'designs/generated/sales.pen',
    language: 'vi',
    requirements: { description: 'Theo dõi doanh thu', keyMetrics: ['Doanh thu'] },
    knowledgeBase: { domain: 'Bán lẻ', summary: 'Dữ liệu bán hàng' },
    reportConfig: { reportName: 'Sales' },
    dataContext: [{ fileName: 'sales.csv', headers: ['Tháng', 'Doanh thu'] }],
    userPrompt: 'Ưu tiên xu hướng theo tháng',
  });

  assert.match(prompt, /pencil MCP/i);
  assert.match(prompt, /designs\/generated\/sales\.pen/);
  assert.match(prompt, /Theo dõi doanh thu/);
  assert.match(prompt, /Bán lẻ/);
  assert.match(prompt, /Doanh thu/);
  assert.match(prompt, /Vietnamese/i);
  assert.match(prompt, /get_screenshot/);
  assert.match(prompt, /call get_editor_state/i);
  assert.match(prompt, /active document is exactly/i);
  assert.match(prompt, /cannot open an IDE document through MCP/i);
  assert.match(prompt, /latest layout adjustment/);
  assert.match(prompt, /execute input self-contained/i);
  assert.match(prompt, /edits parameter/i);
});

test('passes the complete analyzed Requirements Summary to the pen.dev design agent', () => {
  const prompt = createPenDesignPrompt({
    targetPath: 'designs/generated/maintenance.pen',
    language: 'en',
    requirements: {
      description: 'Support weekly maintenance intervention decisions.',
      audience: 'Plant managers',
      decisions: ['Escalate overdue work'],
      businessQuestions: ['Which plant is below target?'],
      keyMetrics: ['Completion rate'],
      metricDefinitions: [{ name: 'Completion rate', definition: 'Completed divided by planned', target: '95%' }],
      analysisDimensions: ['Plant'],
      timeContext: { dateField: 'Month', grain: 'Month' },
      pageRequirements: [{ name: 'Overview', purpose: 'Monitor performance', businessQuestions: ['Where is the gap?'], visualTitles: ['Completion KPI'], pageShape: 'monitoring' }],
      visualRequirements: [{ title: 'Completion KPI', visualType: 'KPI', purpose: 'Show target gap', fields: ['Completion rate'] }],
      filters: [],
      filterStrategy: 'Use the filter pane for secondary dimensions.',
      interactions: ['Cross-filter charts'],
      drillthrough: [],
      tooltips: ['Target and gap'],
      design: { tone: 'restrained', signature: 'deep-blue accent', canvas: '1280x720', brandGuidance: 'None', accessibility: 'No color-only meaning' },
      dataRequirements: { grain: 'One row per work order', sourceStrategy: 'Uploaded data', requiredFields: ['Plant'], relationships: [], refreshCadence: 'Weekly', dataQualityRules: [], sampleDataPolicy: 'Label sample data' },
      security: { rowLevelSecurity: 'Not required', sensitivity: 'Internal' },
      acceptanceCriteria: ['No overlap', 'KPI shows target', 'Uses available fields', 'Readable labels'],
      assumptions: [],
      visualizations: ['Completion KPI'],
      slicerCount: 0,
    },
    knowledgeBase: { domain: 'Maintenance', summary: 'Work-order data' },
    reportConfig: { reportName: 'Maintenance' },
    dataContext: [{ fileName: 'work-orders.csv', headers: ['Plant', 'Month', 'Completion rate'] }],
  });

  assert.match(prompt, /Analyzed Requirements Summary/);
  assert.match(prompt, /Audience and decisions/);
  assert.match(prompt, /Plant managers/);
  assert.match(prompt, /KPI and measure contract/);
  assert.match(prompt, /Acceptance criteria/);
});

test('extracts the latest pen.dev screenshot from Codex MCP results', () => {
  const screenshot = extractPenScreenshot([
    {
      type: 'mcp_tool_call',
      server: 'pencil',
      tool: 'get_screenshot',
      status: 'completed',
      result: { content: [{ type: 'image', mimeType: 'image/png', data: 'first' }] },
    },
    {
      type: 'mcp_tool_call',
      server: 'pencil',
      tool: 'get_screenshot',
      status: 'completed',
      result: { content: [{ type: 'image', mimeType: 'image/png', data: 'latest' }] },
    },
  ]);

  assert.equal(screenshot, 'data:image/png;base64,latest');
});

test('does not treat a readable Pencil canvas as successfully edited when execute is cancelled', () => {
  const activity = analyzePenMcpActivity([
    {
      type: 'mcp_tool_call',
      server: 'pencil',
      tool: 'get_screenshot',
      status: 'completed',
      result: { content: [{ type: 'image', mimeType: 'image/png', data: 'canvas' }] },
    },
    {
      type: 'mcp_tool_call',
      server: 'pencil',
      tool: 'execute',
      status: 'failed',
      error: { message: 'user cancelled MCP tool call' },
    },
  ]);

  assert.equal(activity.canvasReadable, true);
  assert.equal(activity.canvasEdited, false);
  assert.equal(activity.executeAttempted, true);
  assert.match(activity.failureMessage || '', /user cancelled MCP tool call/i);
});

test('detects when Pencil is connected but no pen file is open in the editor', () => {
  const activity = analyzePenMcpActivity([
    {
      type: 'mcp_tool_call',
      server: 'pencil',
      tool: 'get_editor_state',
      status: 'failed',
      error: { message: 'A file needs to be open in the editor.' },
    },
  ]);

  assert.equal(activity.canvasReadable, false);
  assert.equal(activity.canvasEdited, false);
  assert.equal(activity.requiresOpenFile, true);
  assert.equal(activity.failureMessage, 'A file needs to be open in the editor.');
});

test('classifies a confirmed visible canvas plus no active MCP file as an editor endpoint mismatch', () => {
  assert.equal(classifyPenEditorAccess({ requiresOpenFile: true }, true), 'editor-endpoint-mismatch');
  assert.equal(classifyPenEditorAccess({ requiresOpenFile: true }, false), 'file-not-open');
  assert.equal(classifyPenEditorAccess({ requiresOpenFile: false }, true), 'ready');
});

test('pre-approves only the Pencil execute tool for a non-interactive Codex SDK run', () => {
  const options = createPenCodexOptions();

  assert.deepEqual(options.config, {
    mcp_servers: {
      pencil: {
        default_tools_approval_mode: 'approve',
        tools: { execute: { approval_mode: 'approve' } },
      },
    },
  });
});

test('turns a rolled-back Pencil execute failure into a targeted same-thread edit repair', () => {
  const failure = "tool call error: tool call failed for `pencil/execute` Caused by: Mcp error: -32603: Failure during operation execution. Failed to execute: ReferenceError: 'overviewId' is not defined. All operations in this block have been rolled back. IMPORTANT: Fix this by calling `execute` again with the `edits` parameter instead of regenerating the whole snippet. `editId`: \"vJ0gS\"";
  const repair = extractPenExecuteRepair([
    {
      type: 'mcp_tool_call',
      server: 'pencil',
      tool: 'execute',
      status: 'failed',
      error: { message: failure },
    },
  ]);

  assert.deepEqual(repair, {
    editId: 'vJ0gS',
    errorMessage: failure,
    undefinedSymbol: 'overviewId',
  });

  const prompt = createPenExecuteRepairPrompt(repair!, 'vi');
  assert.match(prompt, /same Codex thread/i);
  assert.match(prompt, /editId[\s\S]*vJ0gS/i);
  assert.match(prompt, /edits parameter/i);
  assert.match(prompt, /overviewId/);
  assert.match(prompt, /Do not regenerate/i);
});

test('runs the editId repair as a second turn in the same Pencil thread', async () => {
  const prompts: string[] = [];
  const turns = [
    {
      items: [{ type: 'mcp_tool_call', server: 'pencil', tool: 'execute', status: 'failed', error: { message: "ReferenceError: 'overviewId' is not defined. `editId`: \"vJ0gS\"" } }],
      finalResponse: 'failed',
      usage: null,
    },
    {
      items: [{ type: 'mcp_tool_call', server: 'pencil', tool: 'execute', status: 'completed' }],
      finalResponse: 'repaired',
      usage: null,
    },
  ];

  const result = await runPenDesignTurns(async (prompt) => {
    prompts.push(prompt);
    return turns[prompts.length - 1]!;
  }, 'initial design', 'vi');

  assert.equal(prompts.length, 2);
  assert.equal(prompts[0], 'initial design');
  assert.match(prompts[1]!, /vJ0gS/);
  assert.equal(result.finalTurn.finalResponse, 'repaired');
  assert.equal(result.allItems.length, 2);
});

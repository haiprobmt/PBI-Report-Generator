import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assessRequirementsCoverage,
  formatRequirementsBrief,
  normalizeReportRequirements,
} from '../src/lib/requirements.ts';

const completeInput = {
  description: 'Help regional operations managers identify missed maintenance work and decide where to intervene each week.',
  audience: 'Regional operations managers in the weekly maintenance review',
  decisions: ['Prioritize plants with the largest completion gap', 'Escalate overdue critical work orders'],
  businessQuestions: ['Which plants are below target?', 'Is completion improving over time?'],
  keyMetrics: ['Completion rate', 'Overdue work orders'],
  metricDefinitions: [
    { name: 'Completion rate', definition: 'Completed planned work divided by planned work', calculation: 'Completed / Planned', target: 'At least 95%', comparison: 'Previous month', format: '0.0%', favorableDirection: 'higher' },
    { name: 'Overdue work orders', definition: 'Open work orders past due date', calculation: 'Count of overdue open work orders', target: 'Zero', comparison: 'Previous week', format: '#,0', favorableDirection: 'lower' },
  ],
  analysisDimensions: ['Plant', 'Equipment group', 'Priority'],
  timeContext: { dateField: 'Due date', grain: 'Week', defaultPeriod: 'Current quarter', comparisonPeriod: 'Previous period' },
  pageRequirements: [{ name: 'Maintenance overview', purpose: 'Weekly exception monitoring', businessQuestions: ['Where are the largest gaps?'], visualTitles: ['Completion KPI', 'Monthly completion trend'], pageShape: 'monitoring' }],
  visualRequirements: [
    { title: 'Completion KPI', visualType: 'KPI', purpose: 'Show status against target', fields: ['Completion rate', 'Target'], encoding: 'Value, target, and trend', sort: 'Not applicable' },
    { title: 'Monthly completion trend', visualType: 'Line chart', purpose: 'Show direction over time', fields: ['Month', 'Completion rate'], encoding: 'Month on X and percentage on Y', sort: 'Chronological' },
  ],
  filters: [{ field: 'Plant', control: 'Dropdown slicer', defaultSelection: 'All', scope: 'Report' }],
  filterStrategy: 'Plant slicer plus date filter; other fields use the filter pane.',
  interactions: ['Charts cross-filter the page', 'Select a plant to update all KPIs'],
  drillthrough: ['Work-order detail by plant'],
  tooltips: ['Show target, gap, and prior-period value'],
  design: { tone: 'restrained', signature: 'single deep-blue accent', canvas: '1280x720', brandGuidance: 'Use supplied brand colors when available', accessibility: 'WCAG contrast, readable labels, and no color-only meaning' },
  dataRequirements: { grain: 'One row per work order', sourceStrategy: 'Use uploaded work-order data', requiredFields: ['Plant', 'Due date', 'Status'], relationships: ['Work orders join plants by Plant ID'], refreshCadence: 'Weekly before review', dataQualityRules: ['Due date is required'], sampleDataPolicy: 'Create labeled sample data only when usable tabular data is absent' },
  security: { rowLevelSecurity: 'Not required for the prototype; confirm before deployment', sensitivity: 'Internal operational data' },
  acceptanceCriteria: ['Every KPI has target context', 'All visuals use available fields', 'No overlaps', 'The report supports the stated decisions'],
  assumptions: ['A complete date field is available'],
  visualizations: ['Completion KPI', 'Monthly completion trend'],
  slicerCount: 1,
  customInstructions: 'Keep exception status prominent.',
};

test('rejects shallow requirements even when legacy fields are populated', () => {
  const requirements = normalizeReportRequirements({
    description: 'Track maintenance.',
    visualizations: ['Trend'],
    keyMetrics: ['Completion'],
    slicerCount: 1,
  });
  const coverage = assessRequirementsCoverage(requirements);

  assert.equal(coverage.complete, false);
  assert.ok(coverage.percentage < 40);
  assert.ok(coverage.missingSections.includes('audienceAndDecisions'));
  assert.ok(coverage.missingSections.includes('metricDefinitions'));
  assert.ok(coverage.missingSections.includes('pageAndVisualPlan'));
});

test('accepts a detailed, implementation-ready BI discovery brief', () => {
  const requirements = normalizeReportRequirements(completeInput);
  const coverage = assessRequirementsCoverage(requirements);

  assert.equal(coverage.complete, true);
  assert.equal(coverage.percentage, 100);
  assert.deepEqual(coverage.missingSections, []);
});

test('formats a detailed neutral brief for pen.dev without template business content', () => {
  const brief = formatRequirementsBrief(normalizeReportRequirements(completeInput), 'vi');

  assert.match(brief, /# Tóm tắt yêu cầu/);
  assert.match(brief, /## Đối tượng và quyết định/);
  assert.match(brief, /Completion rate/);
  assert.match(brief, /1280x720/);
  assert.match(brief, /## Tiêu chí nghiệm thu/);
  assert.doesNotMatch(brief, /Where Is My Money Going/);
});

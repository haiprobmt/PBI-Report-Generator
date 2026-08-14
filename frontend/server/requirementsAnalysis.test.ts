import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAutomaticRequirementsPrompt } from './requirementsAnalysis.ts';
import { assessRequirementsCoverage, finalizeAutomaticRequirements } from '../src/lib/requirements.ts';

const knowledgeBase = {
  summary: 'Maintenance work orders are tracked by plant, equipment group, status, due date, and completion date.',
  domain: 'Maintenance operations',
  businessProcesses: ['Preventive maintenance'],
  entities: ['Work order', 'Plant'],
  metrics: ['Completion rate', 'Overdue work orders'],
  dimensions: ['Plant', 'Equipment group'],
  dateFields: ['Due date'],
  relationships: ['Work orders belong to plants'],
  sourceInsights: ['Managers review completion performance'],
  suggestedReportQuestions: ['Which plants are below expected completion?'],
  warnings: [],
  hasUsableTabularData: true,
  sources: [],
  generatedAt: '2026-08-13T00:00:00.000Z',
  provider: 'DeepSeek V4',
};

const dataContext = [{
  fileName: 'work-orders.csv',
  headers: ['Plant', 'Equipment group', 'Status', 'Due date', 'Completion date'],
  sampleRows: [['North', 'Pump', 'Complete', '2026-08-01', '2026-07-30']],
  rowCount: 100,
}];

test('automatic requirements prompt forbids follow-up questions and requires explicit assumptions', () => {
  const prompt = buildAutomaticRequirementsPrompt({
    language: 'en',
    dataContext,
    knowledgeBase,
    schema: { type: 'object' },
  });

  assert.match(prompt, /one-pass requirement analysis/i);
  assert.match(prompt, /Do not ask the user/i);
  assert.match(prompt, /explicit assumption/i);
  assert.match(prompt, /finalized Requirements Summary/i);
});

test('finalizes a sparse document analysis into a complete downstream contract', () => {
  const finalized = finalizeAutomaticRequirements({
    description: knowledgeBase.summary,
    keyMetrics: ['Completion rate'],
  }, knowledgeBase, dataContext, 'en');
  const coverage = assessRequirementsCoverage(finalized);

  assert.equal(coverage.complete, true);
  assert.equal(coverage.percentage, 100);
  assert.equal(finalized.audience.includes('Assumption'), true);
  assert.ok(finalized.visualRequirements.length >= 2);
  assert.ok(finalized.assumptions.length >= 1);
  assert.equal(finalized.dataRequirements.requiredFields.includes('Plant'), true);
});

test('keeps detected source facts while labeling unsupported KPI targets as assumptions', () => {
  const finalized = finalizeAutomaticRequirements({}, knowledgeBase, dataContext, 'vi');

  assert.equal(finalized.keyMetrics[0], 'Completion rate');
  assert.equal(finalized.analysisDimensions.includes('Plant'), true);
  assert.match(finalized.metricDefinitions[0].target, /không phát hiện|chưa/i);
  assert.match(finalized.assumptions.join(' '), /mục tiêu|target/i);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createPenDevBaselineLayout, generateReportConfiguration } from '../src/lib/configGenerator.ts';

test('creates a single-page pen.dev baseline directly from analyzed requirements', () => {
  const requirements = {
    description: 'Track monthly preventive-maintenance completion.',
    visualizations: ['Monthly completion trend', 'Completed versus overdue work'],
    keyMetrics: ['Completion rate', 'Completed on time', 'Overdue work'],
    slicerCount: 3,
  };
  const layout = createPenDevBaselineLayout(requirements);

  assert.equal(layout.id, 'pen-dev-codex-canvas');
  assert.equal(layout.pageCount, 1);
  assert.equal(layout.slicerCount, 3);
  assert.ok(layout.visualizationCount >= 5);

  const config = generateReportConfiguration('Maintenance', {
    name: 'Default',
    dataColors: ['#2457B2'],
    background: '#FFFFFF',
    foreground: '#172033',
  }, layout, requirements);

  assert.equal(config.pages.length, 1);
  assert.equal(config.layout.id, 'pen-dev-codex-canvas');
  assert.match(config.pages[0].visualizations[0].title, /Completion rate/i);
});

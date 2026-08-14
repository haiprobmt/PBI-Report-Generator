import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareReportSimulation } from './aiPlugin.ts';

const positioned = (id: string, x: number, y: number, width: number, height: number) => ({ id, x, y, width, height });

test('repairs overlapping DeepSeek slicers and visuals before validation', () => {
  const result = {
    theme: { name: 'Test', dataColors: ['#123456'] },
    layouts: [{ id: 'summary' }],
    recommendedLayoutId: 'summary',
    rationale: 'Fixture',
    page: {
      id: 'summary',
      name: 'Summary',
      width: 1280,
      height: 720,
      reportHeader: { height: 64 },
      slicers: [
        { ...positioned('slicer-month', 24, 88, 390, 48), field: 'Month' },
        { ...positioned('slicer-category', 24, 88, 390, 48), field: 'Category' },
        { ...positioned('slicer-item', 24, 88, 390, 48), field: 'Item' },
      ],
      visualizations: [
        { ...positioned('card-current-spend', 24, 88, 282, 100), dataFields: ['Spend'] },
        { ...positioned('card-rolling-average', 330, 88, 282, 100), dataFields: ['Spend'] },
        { ...positioned('card-variance-amount', 636, 88, 282, 100), dataFields: ['Variance'] },
        { ...positioned('card-variance-percent', 942, 88, 282, 100), dataFields: ['Variance'] },
        { ...positioned('chart-monthly-actual-baseline', 24, 212, 588, 220), dataFields: ['Month', 'Spend'] },
        { ...positioned('chart-category-composition', 636, 212, 282, 220), dataFields: ['Category', 'Spend'] },
        { ...positioned('chart-category-variance', 942, 212, 282, 220), dataFields: ['Category', 'Variance'] },
        { ...positioned('table-transaction-detail', 24, 456, 1200, 240), dataFields: ['Item', 'Spend'] },
      ],
    },
  };
  const dataContext = [{
    fileName: 'fixture.csv',
    headers: ['Month', 'Category', 'Item', 'Spend', 'Variance'],
    sampleRows: [],
    rowCount: 0,
  }];

  const prepared = prepareReportSimulation(result, dataContext);
  const page = prepared.page as typeof result.page;
  const items = [...page.slicers, ...page.visualizations];

  assert.deepEqual(page.slicers.map((slicer) => slicer.y), [88, 88, 88]);
  assert.ok(page.visualizations.every((visual) => visual.y >= 152));

  for (let left = 0; left < items.length; left += 1) {
    for (let right = left + 1; right < items.length; right += 1) {
      const a = items[left];
      const b = items[right];
      const overlaps = a.x < b.x + b.width && a.x + a.width > b.x
        && a.y < b.y + b.height && a.y + a.height > b.y;
      assert.equal(overlaps, false, `${a.id} overlaps ${b.id}`);
    }
  }
});

test('repairs minor generated field-name drift using uploaded headers', () => {
  const result = {
    layouts: [{ id: 'summary' }],
    recommendedLayoutId: 'summary',
    page: {
      width: 1280,
      height: 720,
      reportHeader: { height: 64 },
      slicers: [{ ...positioned('slicer-month', 24, 88, 300, 48), field: 'Month2025' }],
      visualizations: [{ ...positioned('transaction-detail', 24, 152, 1232, 544), type: 'table', dataFields: ['Item', 'Spend25'] }],
    },
  };
  const dataContext = [{
    fileName: 'fixture.csv',
    headers: ['Month', 'Item', 'Spend'],
    sampleRows: [],
    rowCount: 0,
  }];

  const prepared = prepareReportSimulation(result, dataContext);
  const page = prepared.page as typeof result.page;
  assert.equal(page.slicers[0].field, 'Month');
  assert.deepEqual(page.visualizations[0].dataFields, ['Item', 'Spend']);
});

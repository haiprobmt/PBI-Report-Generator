import assert from 'node:assert/strict';
import test from 'node:test';
import { generateBuildInstructions, generatePenDocument, generateSampleCsv } from '../src/lib/reportArtifacts.ts';
import type { KnowledgeBase, ReportConfigurationSpec, ReportRequirements } from '../src/lib/types.ts';

const requirements: ReportRequirements = {
  description: 'Help finance leaders track revenue performance and act on variance.',
  visualizations: ['Revenue KPI', 'Monthly trend'],
  keyMetrics: ['Revenue', 'Variance'],
  slicerCount: 1,
  customInstructions: 'Show sample-data provenance.',
};

const knowledgeBase: KnowledgeBase = {
  summary: 'Planning documents describe monthly revenue management.',
  domain: 'Finance',
  businessProcesses: ['Monthly close'],
  entities: ['Revenue plan'],
  metrics: ['Revenue', 'Variance'],
  dimensions: ['Region'],
  dateFields: ['Month'],
  relationships: ['Revenue plan is grouped by region and month'],
  sourceInsights: ['Leaders compare actuals with plan'],
  suggestedReportQuestions: ['Where is variance outside tolerance?'],
  warnings: [],
  hasUsableTabularData: false,
  sources: [],
  generatedAt: '2026-08-12T00:00:00.000Z',
  provider: 'DeepSeek V4 · deepseek-v4-pro',
};

const config: ReportConfigurationSpec = {
  reportName: 'Finance Overview',
  description: requirements.description,
  theme: { name: 'Executive', dataColors: ['#3344AA'], background: '#FFFFFF', foreground: '#111827', tableAccent: '#3344AA' },
  layout: { id: 'summary', name: 'Summary', complexity: 'simple' },
  pages: [{
    id: 'page-1',
    name: 'Overview',
    width: 1280,
    height: 720,
    reportHeader: { enabled: true, height: 64, backgroundColor: '#3344AA', titleText: 'Finance Overview', includeLogo: false, includeDate: true },
    slicers: [{ id: 'slicer-1', type: 'date', field: 'Month', label: 'Month', x: 24, y: 88, width: 260, height: 48 }],
    visualizations: [{ id: 'visual-1', type: 'card', title: 'Revenue', x: 24, y: 152, width: 260, height: 100, dataFields: ['Revenue'], altText: 'Revenue KPI' }],
  }],
  requirements: { ...requirements },
  metadata: { generatedAt: '2026-08-12T00:00:00.000Z', version: '1.0.0' },
};

test('creates usable KPI sample data when uploaded sources are non-tabular', () => {
  const csv = generateSampleCsv(knowledgeBase);
  assert.match(csv.split('\n')[0], /^Month,Region,Revenue,Variance$/);
  assert.equal(csv.split('\n').length, 13);
});

test('exports the approved report page as a pen.dev 2.14 workspace', () => {
  const pen = generatePenDocument(config, knowledgeBase);
  assert.equal(pen.version, '2.14');
  assert.equal(pen.children[0].id, 'power-bi-report-page');
  assert.equal(pen.children[0].children.length, 3);
});

test('build instructions route an agent through Power BI skills and sample-data disclosure', () => {
  const markdown = generateBuildInstructions({ config, requirements, knowledgeBase, sourceFileNames: ['brief.pdf'] });
  assert.match(markdown, /`pbir-cli` and `pbip`/);
  assert.match(markdown, /`semantic-model` and `tmdl`/);
  assert.match(markdown, /data\/sample-data\.csv/);
  assert.match(markdown, /Sample data/);
  assert.match(markdown, /design\/report-layout\.pen/);
});

test('creates localized Vietnamese sample fields and agent instructions', () => {
  const vietnameseKnowledge = { ...knowledgeBase, metrics: [], dimensions: [], dateFields: [] };
  const csv = generateSampleCsv(vietnameseKnowledge, 'vi');
  const markdown = generateBuildInstructions({
    config,
    requirements,
    knowledgeBase: vietnameseKnowledge,
    sourceFileNames: ['de-bai.pdf'],
    language: 'vi',
  });
  assert.match(csv.split('\n')[0], /^Ngày,Danh mục,KPI chính,Mục tiêu$/);
  assert.match(markdown, /# Hướng dẫn AI Agent xây dựng Báo cáo Power BI/);
  assert.match(markdown, /Định tuyến kỹ năng bắt buộc/);
  assert.match(markdown, /Dữ liệu mẫu/);
});

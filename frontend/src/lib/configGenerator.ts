import { 
  ReportConfigurationSpec, 
  PowerBITheme, 
  ReportLayout, 
  ReportRequirements,
  PageConfig,
  SlicerConfig,
  VisualizationConfig,
  ReportHeaderConfig,
  SlicerPlacement
} from './types';

const BASE_PAGE_WIDTH = 1280;
const BASE_PAGE_HEIGHT = 720;
const REPORT_HEADER_HEIGHT = 60;
const SLICER_HEIGHT = 50;
const SLICER_WIDTH_HORIZONTAL = 200;
const SLICER_WIDTH_VERTICAL = 180;
const SLICER_HEIGHT_VERTICAL = 100;
const MARGIN = 20;
const MIN_VISUAL_WIDTH = 250;
const MIN_VISUAL_HEIGHT = 180;

export function createPenDevBaselineLayout(requirements: ReportRequirements): ReportLayout {
  const requestedVisuals = requirements.visualizations.length;
  const kpis = requirements.keyMetrics.length;
  const visualizationCount = Math.min(8, Math.max(4, requestedVisuals + kpis));
  return {
    id: 'pen-dev-codex-canvas',
    name: 'pen.dev Codex Canvas',
    description: 'A grounded single-page starting canvas refined directly in pen.dev by Codex.',
    structure: '1280×720 executive page with header, slicers, KPI row, analytical visuals, and detail.',
    visualizationCount,
    pageCount: 1,
    complexity: visualizationCount <= 5 ? 'simple' : 'moderate',
    features: ['Live pen.dev canvas', 'Codex high reasoning', 'Power BI-ready hierarchy'],
    slicerCount: Math.min(3, Math.max(0, requirements.slicerCount)),
    hasReportHeader: true,
    slicerPlacement: 'top-horizontal',
  };
}

function generateReportHeader(theme: PowerBITheme): ReportHeaderConfig {
  return {
    enabled: true,
    height: REPORT_HEADER_HEIGHT,
    backgroundColor: theme.background || theme.dataColors[0],
    titleText: 'Report Title',
    includeLogo: true,
    includeDate: true,
  };
}

function generateSlicers(
  count: number, 
  placement: SlicerPlacement = 'top-horizontal',
  startY: number = REPORT_HEADER_HEIGHT + MARGIN,
  pageWidth: number = BASE_PAGE_WIDTH
): SlicerConfig[] {
  const slicers: SlicerConfig[] = [];
  const slicerTypes: Array<SlicerConfig['type']> = ['date', 'category', 'category', 'text', 'numeric'];
  
  if (placement === 'top-horizontal') {
    const totalWidth = count * SLICER_WIDTH_HORIZONTAL + (count - 1) * MARGIN;
    const startX = (pageWidth - totalWidth) / 2;
    
    for (let i = 0; i < count; i++) {
      slicers.push({
        id: `slicer-${i + 1}`,
        type: slicerTypes[i % slicerTypes.length],
        label: i === 0 ? 'Date' : `Filter ${i + 1}`,
        width: SLICER_WIDTH_HORIZONTAL,
        height: SLICER_HEIGHT,
        x: startX + i * (SLICER_WIDTH_HORIZONTAL + MARGIN),
        y: startY,
      });
    }
  } else if (placement === 'left-vertical') {
    for (let i = 0; i < count; i++) {
      slicers.push({
        id: `slicer-${i + 1}`,
        type: slicerTypes[i % slicerTypes.length],
        label: i === 0 ? 'Date' : `Filter ${i + 1}`,
        width: SLICER_WIDTH_VERTICAL,
        height: SLICER_HEIGHT_VERTICAL,
        x: MARGIN,
        y: startY + i * (SLICER_HEIGHT_VERTICAL + MARGIN),
      });
    }
  } else if (placement === 'right-vertical') {
    const x = pageWidth - SLICER_WIDTH_VERTICAL - MARGIN;
    for (let i = 0; i < count; i++) {
      slicers.push({
        id: `slicer-${i + 1}`,
        type: slicerTypes[i % slicerTypes.length],
        label: i === 0 ? 'Date' : `Filter ${i + 1}`,
        width: SLICER_WIDTH_VERTICAL,
        height: SLICER_HEIGHT_VERTICAL,
        x,
        y: startY + i * (SLICER_HEIGHT_VERTICAL + MARGIN),
      });
    }
  } else if (placement === 'top-left-corner') {
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      slicers.push({
        id: `slicer-${i + 1}`,
        type: slicerTypes[i % slicerTypes.length],
        label: i === 0 ? 'Date' : `Filter ${i + 1}`,
        width: SLICER_WIDTH_HORIZONTAL,
        height: SLICER_HEIGHT,
        x: MARGIN + col * (SLICER_WIDTH_HORIZONTAL + MARGIN),
        y: startY + row * (SLICER_HEIGHT + MARGIN),
      });
    }
  } else if (placement === 'top-right-corner') {
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      slicers.push({
        id: `slicer-${i + 1}`,
        type: slicerTypes[i % slicerTypes.length],
        label: i === 0 ? 'Date' : `Filter ${i + 1}`,
        width: SLICER_WIDTH_HORIZONTAL,
        height: SLICER_HEIGHT,
        x: pageWidth - (2 - col) * SLICER_WIDTH_HORIZONTAL - (1 - col) * MARGIN - MARGIN,
        y: startY + row * (SLICER_HEIGHT + MARGIN),
      });
    }
  }
  
  return slicers;
}

function generateVisualizations(
  count: number,
  complexity: string,
  startY: number,
  availableWidth: number,
  availableHeight: number,
  requirements?: ReportRequirements
): VisualizationConfig[] {
  const visualizations: VisualizationConfig[] = [];
  const vizTypes: Array<VisualizationConfig['type']> = ['card', 'bar', 'line', 'pie', 'table'];
  
  if (complexity === 'simple') {
    const kpiCount = Math.min(4, Math.floor(count / 2));
    const kpiWidth = Math.max(MIN_VISUAL_WIDTH, 180);
    const kpiHeight = 100;
    const totalKpiWidth = kpiCount * kpiWidth + (kpiCount - 1) * MARGIN;
    const kpiStartX = (availableWidth - totalKpiWidth) / 2;
    
    for (let i = 0; i < kpiCount; i++) {
      visualizations.push({
        id: `viz-kpi-${i + 1}`,
        type: 'card',
        title: requirements?.keyMetrics[i] || `KPI ${i + 1}`,
        x: kpiStartX + i * (kpiWidth + MARGIN),
        y: startY,
        width: kpiWidth,
        height: kpiHeight,
      });
    }
    
    const chartStartY = startY + kpiHeight + MARGIN;
    const chartCount = count - kpiCount;
    const cols = 2;
    const rows = Math.ceil(chartCount / cols);
    const chartWidth = Math.max(MIN_VISUAL_WIDTH, (availableWidth - (cols + 1) * MARGIN) / cols);
    const chartHeight = Math.max(MIN_VISUAL_HEIGHT, (availableHeight - chartStartY - MARGIN * (rows + 1)) / rows);
    
    for (let i = 0; i < chartCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      visualizations.push({
        id: `viz-chart-${i + 1}`,
        type: vizTypes[(i % (vizTypes.length - 1)) + 1],
        title: requirements?.visualizations[i] || `Chart ${i + 1}`,
        x: MARGIN + col * (chartWidth + MARGIN),
        y: chartStartY + row * (chartHeight + MARGIN),
        width: chartWidth,
        height: chartHeight,
      });
    }
  } else if (complexity === 'moderate') {
    const cols = 3;
    const rows = Math.ceil(count / cols);
    const vizWidth = Math.max(MIN_VISUAL_WIDTH, (availableWidth - (cols + 1) * MARGIN) / cols);
    const vizHeight = Math.max(MIN_VISUAL_HEIGHT, (availableHeight - startY - (rows + 1) * MARGIN) / rows);
    
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      visualizations.push({
        id: `viz-${i + 1}`,
        type: vizTypes[i % vizTypes.length],
        title: requirements?.visualizations[i] || `Visualization ${i + 1}`,
        x: MARGIN + col * (vizWidth + MARGIN),
        y: startY + row * (vizHeight + MARGIN),
        width: vizWidth,
        height: vizHeight,
      });
    }
  } else {
    const cols = 4;
    const rows = Math.ceil(count / cols);
    const vizWidth = Math.max(MIN_VISUAL_WIDTH, (availableWidth - (cols + 1) * MARGIN) / cols);
    const vizHeight = Math.max(MIN_VISUAL_HEIGHT, (availableHeight - startY - (rows + 1) * MARGIN) / rows);
    
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      visualizations.push({
        id: `viz-${i + 1}`,
        type: vizTypes[i % vizTypes.length],
        title: requirements?.visualizations[i] || `Visualization ${i + 1}`,
        x: MARGIN + col * (vizWidth + MARGIN),
        y: startY + row * (vizHeight + MARGIN),
        width: vizWidth,
        height: vizHeight,
      });
    }
  }
  
  return visualizations;
}

function calculateContentStartY(
  slicerPlacement: SlicerPlacement,
  slicerCount: number
): number {
  let startY = REPORT_HEADER_HEIGHT + MARGIN;
  
  if (slicerPlacement === 'top-horizontal') {
    startY += SLICER_HEIGHT + MARGIN;
  } else if (slicerPlacement === 'top-left-corner' || slicerPlacement === 'top-right-corner') {
    const rows = Math.ceil(slicerCount / 2);
    startY += rows * (SLICER_HEIGHT + MARGIN);
  }
  
  return startY;
}

function calculateAvailableWidth(slicerPlacement: SlicerPlacement, pageWidth: number): number {
  if (slicerPlacement === 'left-vertical') {
    return pageWidth - SLICER_WIDTH_VERTICAL - 3 * MARGIN;
  } else if (slicerPlacement === 'right-vertical') {
    return pageWidth - SLICER_WIDTH_VERTICAL - 3 * MARGIN;
  }
  return pageWidth - 2 * MARGIN;
}

function calculateCustomPageSize(
  layout: ReportLayout,
  slicerPlacement: SlicerPlacement,
  vizsPerPage: number
): { width: number; height: number } {
  let width = BASE_PAGE_WIDTH;
  let height = BASE_PAGE_HEIGHT;

  const contentStartY = calculateContentStartY(slicerPlacement, layout.slicerCount);
  
  if (layout.complexity === 'simple') {
    const kpiCount = Math.min(4, Math.floor(vizsPerPage / 2));
    const chartCount = vizsPerPage - kpiCount;
    const rows = Math.ceil(chartCount / 2);
    
    const requiredHeight = contentStartY + 100 + MARGIN + (rows * (MIN_VISUAL_HEIGHT + MARGIN)) + MARGIN;
    height = Math.max(BASE_PAGE_HEIGHT, requiredHeight);
    
    const kpiWidth = Math.max(MIN_VISUAL_WIDTH, 180);
    const totalKpiWidth = kpiCount * kpiWidth + (kpiCount - 1) * MARGIN;
    width = Math.max(BASE_PAGE_WIDTH, totalKpiWidth + 4 * MARGIN);
  } else if (layout.complexity === 'moderate') {
    const cols = 3;
    const rows = Math.ceil(vizsPerPage / cols);
    
    const requiredWidth = (cols * MIN_VISUAL_WIDTH) + ((cols + 1) * MARGIN);
    const requiredHeight = contentStartY + (rows * (MIN_VISUAL_HEIGHT + MARGIN)) + MARGIN;
    
    width = Math.max(BASE_PAGE_WIDTH, requiredWidth);
    height = Math.max(BASE_PAGE_HEIGHT, requiredHeight);
  } else {
    const cols = 4;
    const rows = Math.ceil(vizsPerPage / cols);
    
    const requiredWidth = (cols * MIN_VISUAL_WIDTH) + ((cols + 1) * MARGIN);
    const requiredHeight = contentStartY + (rows * (MIN_VISUAL_HEIGHT + MARGIN)) + MARGIN;
    
    width = Math.max(BASE_PAGE_WIDTH, requiredWidth);
    height = Math.max(BASE_PAGE_HEIGHT, requiredHeight);
  }

  if (slicerPlacement === 'left-vertical' || slicerPlacement === 'right-vertical') {
    width += SLICER_WIDTH_VERTICAL + MARGIN;
  }

  return { width, height };
}

export function generateReportConfiguration(
  reportName: string,
  theme: PowerBITheme,
  layout: ReportLayout,
  requirements: ReportRequirements
): ReportConfigurationSpec {
  const pages: PageConfig[] = [];
  const slicerPlacement = layout.slicerPlacement || 'top-horizontal';
  const vizsPerPage = Math.ceil(layout.visualizationCount / layout.pageCount);
  
  const actualSlicerCount = requirements.slicerCount;
  
  const pageSize = calculateCustomPageSize(
    { ...layout, slicerCount: actualSlicerCount }, 
    slicerPlacement, 
    vizsPerPage
  );
  
  for (let i = 0; i < layout.pageCount; i++) {
    const reportHeader = generateReportHeader(theme);
    const slicers = generateSlicers(
      actualSlicerCount,
      slicerPlacement,
      REPORT_HEADER_HEIGHT + MARGIN,
      pageSize.width
    );
    
    const contentStartY = calculateContentStartY(slicerPlacement, actualSlicerCount);
    const availableWidth = calculateAvailableWidth(slicerPlacement, pageSize.width);
    const contentStartX = slicerPlacement === 'left-vertical' 
      ? SLICER_WIDTH_VERTICAL + 2 * MARGIN 
      : MARGIN;
    
    const visualizations = generateVisualizations(
      vizsPerPage,
      layout.complexity,
      contentStartY,
      availableWidth,
      pageSize.height,
      requirements
    ).map(viz => ({
      ...viz,
      x: viz.x + (slicerPlacement === 'left-vertical' ? SLICER_WIDTH_VERTICAL + MARGIN : 0),
    }));
    
    pages.push({
      id: `page-${i + 1}`,
      name: i === 0 ? 'Overview' : `Page ${i + 1}`,
      width: pageSize.width,
      height: pageSize.height,
      reportHeader,
      slicers,
      visualizations,
    });
  }
  
  return {
    reportName,
    description: requirements.description,
    theme,
    layout: {
      id: layout.id,
      name: layout.name,
      complexity: layout.complexity,
    },
    pages,
    requirements: {
      description: requirements.description,
      visualizations: requirements.visualizations,
      keyMetrics: requirements.keyMetrics,
      customInstructions: requirements.customInstructions,
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

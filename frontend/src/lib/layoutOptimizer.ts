import { VisualizationConfig, SlicerConfig, ReportHeaderConfig, ReportRequirements, PowerBITheme } from './types';

export interface OptimizationResult {
  visualizations: VisualizationConfig[];
  slicers: SlicerConfig[];
  score: number;
  improvements: string[];
}

export interface LayoutConstraints {
  pageWidth: number;
  pageHeight: number;
  reportHeaderHeight: number;
  slicerAreaHeight: number;
  minSpacing: number;
  preferredSpacing: number;
}

const DEFAULT_CONSTRAINTS: LayoutConstraints = {
  pageWidth: 1280,
  pageHeight: 720,
  reportHeaderHeight: 60,
  slicerAreaHeight: 120,
  minSpacing: 10,
  preferredSpacing: 20,
};

export async function optimizeLayoutWithAI(
  visualizations: VisualizationConfig[],
  slicers: SlicerConfig[],
  reportHeader: ReportHeaderConfig,
  requirements: ReportRequirements,
  theme: PowerBITheme,
  constraints: Partial<LayoutConstraints> = {}
): Promise<OptimizationResult> {
  const finalConstraints = { ...DEFAULT_CONSTRAINTS, ...constraints };
  
  const currentLayout = {
    visualizations: visualizations.map(v => ({
      id: v.id,
      type: v.type,
      title: v.title,
      x: v.x,
      y: v.y,
      width: v.width,
      height: v.height,
    })),
    slicers: slicers.map(s => ({
      id: s.id,
      type: s.type,
      label: s.label,
      x: s.x,
      y: s.y,
      width: s.width,
      height: s.height,
    })),
  };

  const promptText = `You are an expert Power BI report designer. Analyze the current layout and suggest optimal positioning for all visualizations and slicers.

**Report Requirements:**
${requirements.description}
Key Metrics: ${requirements.keyMetrics.join(', ')}
Required Visualizations: ${requirements.visualizations.join(', ')}

**Layout Constraints:**
- Page Size: ${finalConstraints.pageWidth}x${finalConstraints.pageHeight}px
- Report Header Height: ${finalConstraints.reportHeaderHeight}px (fixed at top)
- Available Content Area: ${finalConstraints.pageWidth}x${finalConstraints.pageHeight - finalConstraints.reportHeaderHeight}px
- Minimum Spacing: ${finalConstraints.minSpacing}px
- Preferred Spacing: ${finalConstraints.preferredSpacing}px

**Current Layout:**
${JSON.stringify(currentLayout, null, 2)}

**Optimization Goals:**
1. Prioritize important visualizations (KPI cards should be prominent at top)
2. Group related visualizations together
3. Ensure proper visual hierarchy (larger visuals for more important data)
4. Maintain consistent spacing and alignment
5. Avoid overlaps completely
6. Use the full available space efficiently
7. Keep slicers accessible (typically at top after header)
8. Align items to a grid for a clean look

**Design Best Practices:**
- KPI/Card visualizations: Typically 200-300px wide, 100-120px tall, placed at top
- Charts (bar, line, area): Typically 400-600px wide, 250-350px tall
- Tables/Matrix: Can be wider, 500-800px wide, 200-400px tall
- Pie/Donut charts: Square aspect ratio, 250-350px each dimension
- Slicers: 150-200px wide, 80-100px tall, horizontal row at top

Return a JSON object with:
- "visualizations": array of optimized visualization positions
- "slicers": array of optimized slicer positions  
- "improvements": array of strings describing what was improved
- "score": optimization score from 0-100

Each visualization/slicer must have: id, type, title/label, x, y, width, height.
Ensure NO overlaps and all elements fit within the page bounds.

Format:
{
  "visualizations": [
    {"id": "viz-1", "type": "card", "title": "KPI 1", "x": 20, "y": 80, "width": 250, "height": 100}
  ],
  "slicers": [
    {"id": "slicer-1", "type": "date", "label": "Date", "x": 20, "y": 80, "width": 180, "height": 90}
  ],
  "improvements": ["Moved KPI cards to prominent top position", "Grouped related charts together"],
  "score": 95
}`;

  try {
    const response = await fetch('/api/ai/optimize-layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText, language: document.documentElement.lang === 'vi' ? 'vi' : 'en' }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `DeepSeek layout optimization failed with status ${response.status}.`);

    const optimizedVisualizations: VisualizationConfig[] = result.visualizations.map((v: any) => {
      const original = visualizations.find(viz => viz.id === v.id);
      return {
        ...original,
        x: Math.max(0, Math.min(v.x, finalConstraints.pageWidth - v.width)),
        y: Math.max(finalConstraints.reportHeaderHeight, Math.min(v.y, finalConstraints.pageHeight - v.height)),
        width: v.width,
        height: v.height,
        title: v.title || original?.title || '',
        type: v.type || original?.type || 'card',
      } as VisualizationConfig;
    });

    const optimizedSlicers: SlicerConfig[] = result.slicers.map((s: any) => {
      const original = slicers.find(slicer => slicer.id === s.id);
      return {
        ...original,
        x: Math.max(0, Math.min(s.x, finalConstraints.pageWidth - s.width)),
        y: Math.max(finalConstraints.reportHeaderHeight, Math.min(s.y, finalConstraints.pageHeight - s.height)),
        width: s.width,
        height: s.height,
        label: s.label || original?.label || '',
        type: s.type || original?.type || 'category',
      } as SlicerConfig;
    });

    return {
      visualizations: optimizedVisualizations,
      slicers: optimizedSlicers,
      score: result.score || 0,
      improvements: result.improvements || [],
    };
  } catch (error) {
    console.error('AI optimization failed:', error);
    
    return fallbackOptimization(visualizations, slicers, finalConstraints);
  }
}

function fallbackOptimization(
  visualizations: VisualizationConfig[],
  slicers: SlicerConfig[],
  constraints: LayoutConstraints
): OptimizationResult {
  const optimizedVisualizations: VisualizationConfig[] = [];
  const optimizedSlicers: SlicerConfig[] = [];
  
  let currentY = constraints.reportHeaderHeight + constraints.preferredSpacing;
  let currentX = constraints.preferredSpacing;
  
  const sortedSlicers = [...slicers].sort((a, b) => a.id.localeCompare(b.id));
  sortedSlicers.forEach((slicer, index) => {
    const width = 180;
    const height = 90;
    
    if (currentX + width > constraints.pageWidth - constraints.preferredSpacing) {
      currentX = constraints.preferredSpacing;
      currentY += height + constraints.preferredSpacing;
    }
    
    optimizedSlicers.push({
      ...slicer,
      x: currentX,
      y: currentY,
      width,
      height,
    });
    
    currentX += width + constraints.preferredSpacing;
  });
  
  if (slicers.length > 0) {
    currentY += 90 + constraints.preferredSpacing * 2;
    currentX = constraints.preferredSpacing;
  }
  
  const cards = visualizations.filter(v => v.type === 'card');
  const charts = visualizations.filter(v => v.type !== 'card');
  
  cards.forEach((card) => {
    const width = 240;
    const height = 100;
    
    if (currentX + width > constraints.pageWidth - constraints.preferredSpacing) {
      currentX = constraints.preferredSpacing;
      currentY += height + constraints.preferredSpacing;
    }
    
    optimizedVisualizations.push({
      ...card,
      x: currentX,
      y: currentY,
      width,
      height,
    });
    
    currentX += width + constraints.preferredSpacing;
  });
  
  if (cards.length > 0) {
    currentY += 100 + constraints.preferredSpacing * 2;
    currentX = constraints.preferredSpacing;
  }
  
  charts.forEach((chart) => {
    const width = 580;
    const height = 300;
    
    if (currentX + width > constraints.pageWidth - constraints.preferredSpacing) {
      currentX = constraints.preferredSpacing;
      currentY += height + constraints.preferredSpacing;
    }
    
    optimizedVisualizations.push({
      ...chart,
      x: currentX,
      y: currentY,
      width,
      height,
    });
    
    currentX += width + constraints.preferredSpacing;
  });

  return {
    visualizations: optimizedVisualizations,
    slicers: optimizedSlicers,
    score: 75,
    improvements: [
      'Applied automatic grid-based layout',
      'Grouped KPI cards at the top',
      'Arranged charts in optimal viewing order',
      'Ensured consistent spacing throughout',
    ],
  };
}

export function detectOverlaps(
  visualizations: VisualizationConfig[],
  slicers: SlicerConfig[]
): Array<{ id1: string; id2: string; type: string }> {
  const overlaps: Array<{ id1: string; id2: string; type: string }> = [];
  const allElements = [
    ...visualizations.map(v => ({ ...v, elementType: 'visualization' })),
    ...slicers.map(s => ({ ...s, id: s.id, elementType: 'slicer' })),
  ];

  for (let i = 0; i < allElements.length; i++) {
    for (let j = i + 1; j < allElements.length; j++) {
      const el1 = allElements[i];
      const el2 = allElements[j];

      const overlap =
        el1.x < el2.x + el2.width &&
        el1.x + el1.width > el2.x &&
        el1.y < el2.y + el2.height &&
        el1.y + el1.height > el2.y;

      if (overlap) {
        overlaps.push({
          id1: el1.id,
          id2: el2.id,
          type: `${el1.elementType}-${el2.elementType}`,
        });
      }
    }
  }

  return overlaps;
}

export function calculateLayoutScore(
  visualizations: VisualizationConfig[],
  slicers: SlicerConfig[],
  constraints: LayoutConstraints
): number {
  let score = 100;

  const overlaps = detectOverlaps(visualizations, slicers);
  score -= overlaps.length * 10;

  visualizations.forEach(v => {
    if (v.x < 0 || v.y < constraints.reportHeaderHeight || 
        v.x + v.width > constraints.pageWidth || 
        v.y + v.height > constraints.pageHeight) {
      score -= 5;
    }
  });

  slicers.forEach(s => {
    if (s.x < 0 || s.y < constraints.reportHeaderHeight || 
        s.x + s.width > constraints.pageWidth || 
        s.y + s.height > constraints.pageHeight) {
      score -= 5;
    }
  });

  const alignmentScore = calculateAlignmentScore(visualizations, slicers);
  score += alignmentScore * 10;

  return Math.max(0, Math.min(100, score));
}

function calculateAlignmentScore(
  visualizations: VisualizationConfig[],
  slicers: SlicerConfig[]
): number {
  const allElements = [...visualizations, ...slicers];
  let alignedCount = 0;
  const tolerance = 5;

  for (let i = 0; i < allElements.length; i++) {
    for (let j = i + 1; j < allElements.length; j++) {
      const el1 = allElements[i];
      const el2 = allElements[j];

      if (Math.abs(el1.x - el2.x) < tolerance || 
          Math.abs(el1.y - el2.y) < tolerance ||
          Math.abs((el1.x + el1.width) - (el2.x + el2.width)) < tolerance) {
        alignedCount++;
      }
    }
  }

  return Math.min(1, alignedCount / Math.max(1, allElements.length));
}

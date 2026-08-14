import { DataFileContext, ReportSimulation, VisualizationConfig } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChartBar, ChartLine, Eye, Faders, MapPin, Table as TableIcon } from '@phosphor-icons/react';

interface SimulatedReportPreviewProps {
  simulation: ReportSimulation;
  dataContext: DataFileContext[];
}

function luminance(hex: string) {
  const color = hex.replace('#', '');
  const [red, green, blue] = [0, 2, 4].map((index) => parseInt(color.slice(index, index + 2), 16));
  return (red * 299 + green * 587 + blue * 114) / 1000;
}

function hashValue(value: string, minimum: number, maximum: number) {
  const hash = Array.from(value).reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 7);
  return minimum + (hash % Math.max(1, maximum - minimum + 1));
}

function compactNumber(value: number) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function extractNumericValues(dataContext: DataFileContext[]) {
  return dataContext.flatMap((file) => file.sampleRows.flatMap((row) => row))
    .map((value) => Number(String(value).replace(/[$,%\s]/g, '')))
    .filter((value) => Number.isFinite(value));
}

function VisualContent({
  visual,
  index,
  dataContext,
  accent,
  palette,
  foreground,
}: {
  visual: VisualizationConfig;
  index: number;
  dataContext: DataFileContext[];
  accent: string;
  palette: string[];
  foreground: string;
}) {
  const numericValues = extractNumericValues(dataContext);
  const sourceValue = numericValues[index % Math.max(1, numericValues.length)] ?? hashValue(visual.title, 120, 9800);
  const fields = visual.dataFields?.length ? visual.dataFields : dataContext[0]?.headers.slice(0, 2) ?? [];
  const labels = dataContext[0]?.sampleRows.map((row) => row[0]).filter(Boolean).slice(0, 5) ?? [];
  const values = [0, 1, 2, 3, 4].map((offset) => (
    numericValues[(index + offset) % Math.max(1, numericValues.length)] ?? hashValue(`${visual.title}-${offset}`, 25, 100)
  ));
  const maximum = Math.max(...values, 1);

  if (visual.type === 'card') {
    const change = hashValue(visual.title, -12, 24);
    return (
      <div className="flex h-full flex-col justify-between">
        <div className="text-[clamp(0.65rem,1vw,0.9rem)] font-medium opacity-70">{fields[0] || 'Metric'}</div>
        <div className="text-[clamp(1.2rem,2.3vw,2.2rem)] font-semibold tracking-tight" style={{ color: accent }}>
          {compactNumber(sourceValue)}
        </div>
        <div className="flex items-center justify-between text-[clamp(0.55rem,0.8vw,0.72rem)]">
          <span className="opacity-60">vs target</span>
          <span className="font-semibold" style={{ color: change >= 0 ? '#256D4A' : '#B42318' }}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
          </span>
        </div>
      </div>
    );
  }

  if (visual.type === 'bar') {
    return (
      <div className="flex h-full flex-col justify-around gap-1 pt-1">
        {values.slice(0, 5).map((value, barIndex) => (
          <div key={barIndex} className="flex items-center gap-2 text-[clamp(0.45rem,0.65vw,0.65rem)]">
            <span className="w-12 truncate opacity-60">{labels[barIndex] || `Item ${barIndex + 1}`}</span>
            <div className="h-2.5 flex-1 rounded-sm bg-black/5">
              <div className="h-full rounded-sm" style={{ width: `${Math.max(8, (value / maximum) * 100)}%`, backgroundColor: accent }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === 'line' || visual.type === 'area') {
    const points = values.map((value, pointIndex) => `${pointIndex * 25},${90 - ((value / maximum) * 70)}`).join(' ');
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible pt-1">
        <line x1="0" y1="90" x2="100" y2="90" stroke={foreground} strokeOpacity="0.12" />
        {visual.type === 'area' && <polygon points={`0,90 ${points} 100,90`} fill={accent} fillOpacity="0.12" />}
        <polyline points={points} fill="none" stroke={accent} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        {values.map((value, pointIndex) => (
          <circle key={pointIndex} cx={pointIndex * 25} cy={90 - ((value / maximum) * 70)} r="2.2" fill={accent} />
        ))}
      </svg>
    );
  }

  if (visual.type === 'pie') {
    return (
      <div className="flex h-full items-center justify-center gap-3">
        <div
          className="aspect-square h-[80%] rounded-full"
          style={{ background: `conic-gradient(${palette[0]} 0 42%, ${palette[1]} 42% 72%, ${palette[2]} 72% 100%)` }}
        >
          <div className="m-[28%] h-[44%] rounded-full bg-white/95" />
        </div>
        <div className="space-y-1 text-[clamp(0.45rem,0.65vw,0.65rem)]">
          {palette.slice(0, 3).map((color, colorIndex) => (
            <div key={color} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: color }} />
              <span className="opacity-65">{labels[colorIndex] || `Segment ${colorIndex + 1}`}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual.type === 'table' || visual.type === 'matrix') {
    const headers = dataContext[0]?.headers.slice(0, 3) ?? fields.slice(0, 3);
    const rows = dataContext[0]?.sampleRows.slice(0, 4) ?? [];
    return (
      <div className="h-full overflow-hidden text-[clamp(0.42rem,0.62vw,0.62rem)]">
        <div className="grid gap-1 rounded-sm px-1.5 py-1 font-semibold" style={{ gridTemplateColumns: `repeat(${Math.max(headers.length, 1)}, minmax(0, 1fr))`, backgroundColor: `${accent}18` }}>
          {headers.map((header) => <span key={header} className="truncate">{header}</span>)}
        </div>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid gap-1 border-b border-black/5 px-1.5 py-1" style={{ gridTemplateColumns: `repeat(${Math.max(headers.length, 1)}, minmax(0, 1fr))` }}>
            {headers.map((_, cellIndex) => <span key={cellIndex} className="truncate opacity-70">{row[cellIndex] || '—'}</span>)}
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === 'map') {
    return (
      <div className="relative h-full rounded bg-black/[0.03]">
        {[18, 37, 62, 78].map((left, pointIndex) => (
          <MapPin key={left} size={14 + pointIndex * 2} weight="fill" className="absolute" style={{ left: `${left}%`, top: `${20 + ((pointIndex * 19) % 55)}%`, color: palette[pointIndex % palette.length] }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center gap-2 opacity-55">
      {visual.type === 'scatter' ? <ChartLine size={28} /> : <ChartBar size={28} />}
      <span className="text-xs">{fields.join(' · ') || 'Data visual'}</span>
    </div>
  );
}

export function SimulatedReportPreview({ simulation, dataContext }: SimulatedReportPreviewProps) {
  const { page, theme } = simulation;
  const palette = theme.dataColors.length >= 3 ? theme.dataColors : ['#2563EB', '#64748B', '#94A3B8'];
  const headerText = luminance(page.reportHeader.backgroundColor) < 145 ? '#FFFFFF' : theme.foreground || '#111827';

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><Eye size={22} className="text-primary" /></div>
          <div>
            <h3 className="font-semibold">Generated Power BI simulation</h3>
            <p className="max-w-3xl text-sm text-muted-foreground">{simulation.rationale}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{simulation.provider}</Badge>
          <Badge>{theme.name}</Badge>
        </div>
      </div>

      <ScrollArea className="max-h-[780px] p-5">
        <div
          className="relative mx-auto aspect-video w-full min-w-[760px] overflow-hidden rounded-md border shadow-sm"
          style={{ backgroundColor: theme.background || '#FFFFFF', color: theme.foreground || '#111827' }}
        >
          <div
            className="absolute left-0 top-0 flex w-full items-center justify-between px-[2%]"
            style={{ height: `${(page.reportHeader.height / page.height) * 100}%`, backgroundColor: page.reportHeader.backgroundColor, color: headerText }}
          >
            <div>
              <div className="text-[clamp(0.75rem,1.5vw,1.4rem)] font-semibold tracking-tight">{page.reportHeader.titleText}</div>
              <div className="text-[clamp(0.45rem,0.65vw,0.65rem)] opacity-75">Decision summary · simulated from uploaded data</div>
            </div>
            {page.reportHeader.includeDate && <span className="text-[clamp(0.45rem,0.65vw,0.65rem)] opacity-75">Latest available data</span>}
          </div>

          {page.slicers.map((slicer) => (
            <div
              key={slicer.id}
              className="absolute flex items-center justify-between rounded border bg-white/90 px-2 text-[clamp(0.45rem,0.7vw,0.7rem)] shadow-sm"
              style={{
                left: `${(slicer.x / page.width) * 100}%`,
                top: `${(slicer.y / page.height) * 100}%`,
                width: `${(slicer.width / page.width) * 100}%`,
                height: `${(slicer.height / page.height) * 100}%`,
              }}
            >
              <span className="truncate font-medium">{slicer.label}</span>
              <Faders size={13} className="opacity-50" />
            </div>
          ))}

          {page.visualizations.map((visual, index) => {
            const accent = palette[index % palette.length];
            return (
              <div
                key={visual.id}
                role="img"
                aria-label={visual.altText || `${visual.title} ${visual.type} visual`}
                className="absolute overflow-hidden rounded border bg-white/95 p-[0.8%] shadow-sm"
                style={{
                  left: `${(visual.x / page.width) * 100}%`,
                  top: `${(visual.y / page.height) * 100}%`,
                  width: `${(visual.width / page.width) * 100}%`,
                  height: `${(visual.height / page.height) * 100}%`,
                  borderTopColor: accent,
                  borderTopWidth: 3,
                }}
              >
                <div className="mb-[2%] flex items-center justify-between gap-1">
                  <span className="truncate text-[clamp(0.5rem,0.75vw,0.78rem)] font-semibold">{visual.title}</span>
                  {(visual.type === 'table' || visual.type === 'matrix') && <TableIcon size={13} style={{ color: accent }} />}
                </div>
                <div style={{ height: 'calc(100% - 1.1rem)' }}>
                  <VisualContent visual={visual} index={index} dataContext={dataContext} accent={accent} palette={palette} foreground={theme.foreground || '#111827'} />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}

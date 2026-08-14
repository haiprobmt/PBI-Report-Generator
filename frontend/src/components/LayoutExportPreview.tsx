import { forwardRef } from 'react';
import { PageConfig, PowerBITheme } from '@/lib/types';
import {
  ChartBar,
  ChartLine,
  ChartPie,
  Table,
  Hash,
  MapPin,
  ChartScatter,
  Gauge,
  GridFour,
  Calendar,
  Funnel,
  TextAa,
} from '@phosphor-icons/react';

interface LayoutExportPreviewProps {
  page: PageConfig;
  theme: PowerBITheme;
}

const VISUAL_ICONS: Record<string, { icon: typeof ChartBar; color: string }> = {
  card: { icon: Hash, color: 'text-blue-600' },
  bar: { icon: ChartBar, color: 'text-purple-600' },
  line: { icon: ChartLine, color: 'text-green-600' },
  pie: { icon: ChartPie, color: 'text-orange-600' },
  table: { icon: Table, color: 'text-gray-600' },
  matrix: { icon: GridFour, color: 'text-indigo-600' },
  area: { icon: ChartLine, color: 'text-teal-600' },
  scatter: { icon: ChartScatter, color: 'text-pink-600' },
  gauge: { icon: Gauge, color: 'text-red-600' },
  map: { icon: MapPin, color: 'text-cyan-600' },
};

const SLICER_ICONS: Record<string, { icon: typeof Calendar; color: string }> = {
  date: { icon: Calendar, color: 'text-blue-600' },
  category: { icon: Funnel, color: 'text-purple-600' },
  numeric: { icon: Hash, color: 'text-green-600' },
  text: { icon: TextAa, color: 'text-orange-600' },
};

export const LayoutExportPreview = forwardRef<HTMLDivElement, LayoutExportPreviewProps>(
  ({ page, theme }, ref) => {
    const { width: PAGE_WIDTH, height: PAGE_HEIGHT } = page;
    const headerHeight = page.reportHeader.enabled ? page.reportHeader.height : 0;

    return (
      <div
        ref={ref}
        className="relative bg-white border-2 border-border rounded-lg overflow-hidden"
        style={{
          width: '100%',
          aspectRatio: `${PAGE_WIDTH} / ${PAGE_HEIGHT}`,
        }}
      >
        {/* Report Header */}
        {page.reportHeader.enabled && (
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-center text-white font-semibold text-sm"
            style={{
              height: `${(headerHeight / PAGE_HEIGHT) * 100}%`,
              backgroundColor: page.reportHeader.backgroundColor || theme.dataColors[0],
            }}
          >
            {page.reportHeader.titleText}
          </div>
        )}

        {/* Slicers */}
        {page.slicers.map((slicer) => {
          const slicerIcon = SLICER_ICONS[slicer.type] || SLICER_ICONS.category;
          const Icon = slicerIcon.icon;
          return (
            <div
              key={slicer.id}
              className="absolute border-2 border-purple-300 bg-purple-50 rounded-md flex flex-col items-center justify-center"
              style={{
                left: `${(slicer.x / PAGE_WIDTH) * 100}%`,
                top: `${(slicer.y / PAGE_HEIGHT) * 100}%`,
                width: `${(slicer.width / PAGE_WIDTH) * 100}%`,
                height: `${(slicer.height / PAGE_HEIGHT) * 100}%`,
              }}
            >
              <Icon size={16} weight="duotone" className={slicerIcon.color} />
              <span className="text-xs font-medium mt-0.5">{slicer.label}</span>
            </div>
          );
        })}

        {/* Visualizations */}
        {page.visualizations.map((visual) => {
          const visualIcon = VISUAL_ICONS[visual.type] || VISUAL_ICONS.bar;
          const Icon = visualIcon.icon;
          return (
            <div
              key={visual.id}
              className="absolute border-2 border-gray-300 bg-gray-50 rounded-md flex flex-col items-center justify-center"
              style={{
                left: `${(visual.x / PAGE_WIDTH) * 100}%`,
                top: `${(visual.y / PAGE_HEIGHT) * 100}%`,
                width: `${(visual.width / PAGE_WIDTH) * 100}%`,
                height: `${(visual.height / PAGE_HEIGHT) * 100}%`,
              }}
            >
              <Icon size={20} weight="duotone" className={visualIcon.color} />
              <span className="text-xs font-medium mt-1">{visual.title}</span>
            </div>
          );
        })}
      </div>
    );
  }
);

LayoutExportPreview.displayName = 'LayoutExportPreview';

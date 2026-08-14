import { ReportLayout } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  ChartBar, 
  ChartLine, 
  ChartPie, 
  Table, 
  TrendUp, 
  Hash,
  MapPin,
  ChartDonut,
  Funnel,
  ChartLineUp,
  Textbox,
  Faders
} from '@phosphor-icons/react';

interface LayoutPreviewProps {
  layout: ReportLayout;
  className?: string;
}

export function LayoutPreview({ layout, className }: LayoutPreviewProps) {
  const renderReportHeader = () => (
    <div className="h-[10%] bg-accent/80 rounded flex items-center justify-center border-b-2 border-accent">
      <Textbox size={14} weight="bold" className="text-accent-foreground/40" />
    </div>
  );

  const renderSlicer = () => (
    <div className="bg-muted/80 rounded border border-border flex items-center justify-center">
      <Faders size={12} weight="bold" className="text-muted-foreground/50" />
    </div>
  );

  const renderKPICard = (Icon: typeof Hash) => (
    <div className="flex-1 bg-primary/20 rounded flex items-center justify-center">
      <Icon size={12} weight="bold" className="text-primary/60" />
    </div>
  );

  const renderVisualization = (Icon: typeof ChartBar, size: 'sm' | 'md' | 'lg' = 'md') => {
    const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
    return (
      <div className="bg-primary/10 rounded border border-primary/20 flex items-center justify-center">
        <Icon size={iconSize} weight="duotone" className="text-primary/50" />
      </div>
    );
  };

  const renderSlicersSection = (slicerCount: number) => {
    const slicers = Array.from({ length: slicerCount }, (_, i) => (
      <div key={i}>{renderSlicer()}</div>
    ));
    return slicers;
  };

  const renderSimpleLayout = () => {
    const slicerCount = layout.slicerCount || 2;
    const placement = layout.slicerPlacement || 'top-horizontal';

    if (placement === 'left-vertical') {
      return (
        <div className="w-full h-full flex flex-col">
          {renderReportHeader()}
          
          <div className="flex-1 p-3 flex gap-2">
            <div className="w-[15%] space-y-2">
              {renderSlicersSection(slicerCount)}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex gap-2 h-[20%]">
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
              </div>
              
              <div className="grid grid-cols-2 gap-2 h-[75%]">
                {renderVisualization(ChartBar, 'lg')}
                {renderVisualization(ChartPie, 'lg')}
                {renderVisualization(ChartLine, 'lg')}
                {renderVisualization(Table, 'lg')}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (placement === 'right-vertical') {
      return (
        <div className="w-full h-full flex flex-col">
          {renderReportHeader()}
          
          <div className="flex-1 p-3 flex gap-2">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2 h-[20%]">
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
              </div>
              
              <div className="grid grid-cols-2 gap-2 h-[75%]">
                {renderVisualization(ChartBar, 'lg')}
                {renderVisualization(ChartPie, 'lg')}
                {renderVisualization(ChartLine, 'lg')}
                {renderVisualization(Table, 'lg')}
              </div>
            </div>
            
            <div className="w-[15%] space-y-2">
              {renderSlicersSection(slicerCount)}
            </div>
          </div>
        </div>
      );
    }

    if (placement === 'top-left-corner') {
      return (
        <div className="w-full h-full flex flex-col">
          {renderReportHeader()}
          
          <div className="flex-1 p-3 space-y-2">
            <div className="flex gap-2 items-start">
              <div className="w-[20%] grid grid-cols-2 gap-1">
                {renderSlicersSection(slicerCount)}
              </div>
              <div className="flex-1 flex gap-2 h-[12%]">
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 h-[83%]">
              {renderVisualization(ChartBar, 'lg')}
              {renderVisualization(ChartPie, 'lg')}
              {renderVisualization(ChartLine, 'lg')}
              {renderVisualization(Table, 'lg')}
            </div>
          </div>
        </div>
      );
    }

    if (placement === 'top-right-corner') {
      return (
        <div className="w-full h-full flex flex-col">
          {renderReportHeader()}
          
          <div className="flex-1 p-3 space-y-2">
            <div className="flex gap-2 items-start">
              <div className="flex-1 flex gap-2 h-[12%]">
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
              </div>
              <div className="w-[20%] grid grid-cols-2 gap-1">
                {renderSlicersSection(slicerCount)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 h-[83%]">
              {renderVisualization(ChartBar, 'lg')}
              {renderVisualization(ChartPie, 'lg')}
              {renderVisualization(ChartLine, 'lg')}
              {renderVisualization(Table, 'lg')}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col">
        {renderReportHeader()}
        
        <div className="flex-1 p-3 space-y-2">
          <div className={`grid gap-2 h-[12%]`} style={{ gridTemplateColumns: `repeat(${slicerCount}, 1fr)` }}>
            {renderSlicersSection(slicerCount)}
          </div>
          
          <div className="flex gap-2 h-[20%]">
            {renderKPICard(Hash)}
            {renderKPICard(TrendUp)}
            {renderKPICard(Hash)}
            {renderKPICard(TrendUp)}
          </div>
          
          <div className="grid grid-cols-2 gap-2 h-[63%]">
            {renderVisualization(ChartBar, 'lg')}
            {renderVisualization(ChartPie, 'lg')}
            {renderVisualization(ChartLine, 'lg')}
            {renderVisualization(Table, 'lg')}
          </div>
        </div>
      </div>
    );
  };

  const renderModerateLayout = () => {
    const slicerCount = layout.slicerCount || 3;
    const placement = layout.slicerPlacement || 'top-horizontal';

    if (placement === 'left-vertical') {
      return (
        <div className="w-full h-full flex flex-col">
          {renderReportHeader()}
          
          <div className="flex-1 p-3 flex gap-2">
            <div className="w-[15%] space-y-2">
              {renderSlicersSection(slicerCount)}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex gap-2 h-[16%]">
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
                {renderKPICard(Hash)}
              </div>
              
              <div className="flex gap-2 h-[40%]">
                <div className="flex-[2] bg-primary/10 rounded border border-primary/20 flex items-center justify-center">
                  <ChartLineUp size={28} weight="duotone" className="text-primary/50" />
                </div>
                {renderVisualization(ChartDonut, 'lg')}
              </div>
              
              <div className="grid grid-cols-3 gap-2 h-[38%]">
                {renderVisualization(ChartBar, 'md')}
                {renderVisualization(Funnel, 'md')}
                {renderVisualization(MapPin, 'md')}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (placement === 'right-vertical') {
      return (
        <div className="w-full h-full flex flex-col">
          {renderReportHeader()}
          
          <div className="flex-1 p-3 flex gap-2">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2 h-[16%]">
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
                {renderKPICard(Hash)}
              </div>
              
              <div className="flex gap-2 h-[40%]">
                <div className="flex-[2] bg-primary/10 rounded border border-primary/20 flex items-center justify-center">
                  <ChartLineUp size={28} weight="duotone" className="text-primary/50" />
                </div>
                {renderVisualization(ChartDonut, 'lg')}
              </div>
              
              <div className="grid grid-cols-3 gap-2 h-[38%]">
                {renderVisualization(ChartBar, 'md')}
                {renderVisualization(Funnel, 'md')}
                {renderVisualization(MapPin, 'md')}
              </div>
            </div>
            
            <div className="w-[15%] space-y-2">
              {renderSlicersSection(slicerCount)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col">
        {renderReportHeader()}
        
        <div className="flex-1 p-3 space-y-2">
          <div className={`grid gap-2 h-[10%]`} style={{ gridTemplateColumns: `repeat(${slicerCount}, 1fr)` }}>
            {renderSlicersSection(slicerCount)}
          </div>
          
          <div className="flex gap-2 h-[16%]">
            {renderKPICard(Hash)}
            {renderKPICard(TrendUp)}
            {renderKPICard(Hash)}
          </div>
          
          <div className="flex gap-2 h-[34%]">
            <div className="flex-[2] bg-primary/10 rounded border border-primary/20 flex items-center justify-center">
              <ChartLineUp size={28} weight="duotone" className="text-primary/50" />
            </div>
            {renderVisualization(ChartDonut, 'lg')}
          </div>
          
          <div className="grid grid-cols-3 gap-2 h-[34%]">
            {renderVisualization(ChartBar, 'md')}
            {renderVisualization(Funnel, 'md')}
            {renderVisualization(MapPin, 'md')}
          </div>
        </div>
      </div>
    );
  };

  const renderComplexLayout = () => {
    const slicerCount = layout.slicerCount || 3;
    const placement = layout.slicerPlacement || 'top-horizontal';

    if (placement === 'left-vertical') {
      return (
        <div className="w-full h-full flex flex-col">
          {renderReportHeader()}
          
          <div className="flex-1 p-3 flex gap-2">
            <div className="w-[15%] space-y-2">
              {renderSlicersSection(slicerCount)}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex gap-2 h-[15%]">
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
              </div>
              
              <div className="flex gap-2 h-[40%]">
                <div className="flex-[3] bg-primary/10 rounded border border-primary/20 flex items-center justify-center">
                  <ChartLineUp size={32} weight="duotone" className="text-primary/50" />
                </div>
                <div className="flex-1 space-y-2">
                  {renderVisualization(ChartPie, 'md')}
                  {renderVisualization(ChartDonut, 'md')}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 h-[38%]">
                {renderVisualization(ChartBar, 'sm')}
                {renderVisualization(Table, 'sm')}
                {renderVisualization(Funnel, 'sm')}
                {renderVisualization(MapPin, 'sm')}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (placement === 'right-vertical') {
      return (
        <div className="w-full h-full flex flex-col">
          {renderReportHeader()}
          
          <div className="flex-1 p-3 flex gap-2">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2 h-[15%]">
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
                {renderKPICard(Hash)}
                {renderKPICard(TrendUp)}
              </div>
              
              <div className="flex gap-2 h-[40%]">
                <div className="flex-[3] bg-primary/10 rounded border border-primary/20 flex items-center justify-center">
                  <ChartLineUp size={32} weight="duotone" className="text-primary/50" />
                </div>
                <div className="flex-1 space-y-2">
                  {renderVisualization(ChartPie, 'md')}
                  {renderVisualization(ChartDonut, 'md')}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 h-[38%]">
                {renderVisualization(ChartBar, 'sm')}
                {renderVisualization(Table, 'sm')}
                {renderVisualization(Funnel, 'sm')}
                {renderVisualization(MapPin, 'sm')}
              </div>
            </div>
            
            <div className="w-[15%] space-y-2">
              {renderSlicersSection(slicerCount)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col">
        {renderReportHeader()}
        
        <div className="flex-1 p-3 space-y-2">
          <div className="flex gap-2 h-[12%]">
            <div className="w-[15%] bg-muted/80 rounded border border-border flex items-center justify-center">
              <div className="space-y-1">
                <div className="w-full h-1 bg-muted-foreground/30 rounded" />
                <div className="w-full h-1 bg-muted-foreground/30 rounded" />
                <div className="w-full h-1 bg-muted-foreground/30 rounded" />
              </div>
            </div>
            <div className={`flex-1 grid gap-2`} style={{ gridTemplateColumns: `repeat(${slicerCount}, 1fr)` }}>
              {renderSlicersSection(slicerCount)}
            </div>
          </div>
          
          <div className="flex gap-2 h-[15%]">
            {renderKPICard(Hash)}
            {renderKPICard(TrendUp)}
            {renderKPICard(Hash)}
            {renderKPICard(TrendUp)}
          </div>
          
          <div className="flex gap-2 h-[34%]">
            <div className="flex-[3] bg-primary/10 rounded border border-primary/20 flex items-center justify-center">
              <ChartLineUp size={32} weight="duotone" className="text-primary/50" />
            </div>
            <div className="flex-1 space-y-2">
              {renderVisualization(ChartPie, 'md')}
              {renderVisualization(ChartDonut, 'md')}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 h-[33%]">
            {renderVisualization(ChartBar, 'sm')}
            {renderVisualization(Table, 'sm')}
            {renderVisualization(Funnel, 'sm')}
            {renderVisualization(MapPin, 'sm')}
          </div>
        </div>
      </div>
    );
  };

  const renderLayoutByStructure = () => {
    const structure = layout.structure?.toLowerCase() || '';
    const id = layout.id?.toLowerCase() || '';

    if (structure.includes('single page') && structure.includes('grid')) {
      return renderSimpleLayout();
    }

    if (structure.includes('multi-page') || structure.includes('drill-through')) {
      return renderModerateLayout();
    }

    if (structure.includes('three pages') || structure.includes('bookmarks') || layout.complexity === 'complex') {
      return renderComplexLayout();
    }

    if (id.includes('executive') || id.includes('summary')) {
      return renderSimpleLayout();
    }

    if (id.includes('detailed') || id.includes('analytics')) {
      return renderModerateLayout();
    }

    if (id.includes('comprehensive') || id.includes('advanced')) {
      return renderComplexLayout();
    }

    if (layout.complexity === 'simple') {
      return renderSimpleLayout();
    } else if (layout.complexity === 'moderate') {
      return renderModerateLayout();
    } else if (layout.complexity === 'complex') {
      return renderComplexLayout();
    }
    
    return renderSimpleLayout();
  };

  return (
    <div
      className={cn(
        'w-full aspect-video bg-gradient-to-br from-muted/50 to-muted rounded-lg border-2 border-border overflow-hidden',
        className
      )}
    >
      {renderLayoutByStructure()}
    </div>
  );
}

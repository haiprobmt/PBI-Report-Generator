import { PowerBITheme, ReportRequirements } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChartBar, ChartLine, ChartPie, Table as TableIcon, SquaresFour, Eye } from '@phosphor-icons/react';

interface ReportPreviewLayoutProps {
  theme: PowerBITheme;
  requirements: ReportRequirements | null;
}

const getVisualizationIcon = (vizType: string) => {
  const type = vizType.toLowerCase();
  if (type.includes('bar')) return ChartBar;
  if (type.includes('line')) return ChartLine;
  if (type.includes('pie')) return ChartPie;
  if (type.includes('table') || type.includes('matrix')) return TableIcon;
  return SquaresFour;
};

export function ReportPreviewLayout({ theme, requirements }: ReportPreviewLayoutProps) {
  const primaryColor = theme.dataColors[0] || '#4A4EDB';
  const secondaryColor = theme.dataColors[1] || '#2DB8D8';
  const tertiaryColor = theme.dataColors[2] || '#8B5CF6';
  const backgroundColor = theme.background || '#FFFFFF';
  const foregroundColor = theme.foreground || '#1A1A1A';

  const displayVisualizations = requirements?.visualizations.slice(0, 6) || [
    'Bar Chart',
    'Line Chart',
    'Pie Chart',
    'Card',
    'Table',
    'KPI'
  ];

  const displayMetrics = requirements?.keyMetrics.slice(0, 4) || [
    'Total Sales',
    'Revenue',
    'Growth Rate',
    'Customer Count'
  ];

  return (
    <Card className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Eye size={24} weight="duotone" className="text-primary" />
          <h3 className="font-semibold text-lg">Report Preview</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Live preview of your report with the selected theme and requirements
        </p>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="p-4 rounded-lg overflow-hidden border-2 shadow-inner" style={{ backgroundColor }}>
        <div className="space-y-4">
          <div 
            className="px-4 py-3 rounded-lg flex items-center justify-between"
            style={{ 
              backgroundColor: primaryColor,
              color: theme.foreground || '#FFFFFF'
            }}
          >
            <h4 className="font-semibold text-lg">
              {requirements?.description.slice(0, 50) || 'Power BI Report'}
              {requirements?.description && requirements.description.length > 50 ? '...' : ''}
            </h4>
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white hover:bg-white/30 border-white/30"
            >
              {theme.name}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {displayMetrics.map((metric, index) => {
              const colors = [primaryColor, secondaryColor, tertiaryColor, theme.dataColors[3] || primaryColor];
              return (
                <Card 
                  key={metric}
                  className="p-4 border"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    borderColor: colors[index % colors.length],
                    borderWidth: '2px'
                  }}
                >
                  <p className="text-xs text-muted-foreground mb-1">{metric}</p>
                  <p className="text-2xl font-bold" style={{ color: colors[index % colors.length] }}>
                    {(Math.random() * 1000).toFixed(0)}
                    {metric.toLowerCase().includes('rate') ? '%' : 'K'}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <div 
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ 
                        backgroundColor: theme.good ? `${theme.good}20` : '#10B98120',
                        color: theme.good || '#10B981'
                      }}
                    >
                      ↑ {(Math.random() * 20).toFixed(1)}%
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayVisualizations.slice(0, 4).map((viz, index) => {
              const Icon = getVisualizationIcon(viz);
              const colors = [primaryColor, secondaryColor, tertiaryColor, theme.dataColors[3] || primaryColor];
              const barColor = colors[index % colors.length];
              
              return (
                <Card key={viz} className="p-4 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={18} style={{ color: barColor }} weight="duotone" />
                    <h5 className="font-medium text-sm" style={{ color: foregroundColor }}>
                      {viz}
                    </h5>
                  </div>
                  
                  {viz.toLowerCase().includes('bar') && (
                    <div className="space-y-2">
                      {[65, 45, 80, 55, 70].map((value, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs w-12 text-muted-foreground">Q{i + 1}</span>
                          <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                            <div
                              className="h-full rounded transition-all"
                              style={{
                                width: `${value}%`,
                                backgroundColor: barColor
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {viz.toLowerCase().includes('line') && (
                    <div className="h-32 flex items-end gap-1">
                      {[30, 45, 35, 60, 55, 70, 65, 80].map((value, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full rounded-t transition-all"
                            style={{
                              height: `${value}%`,
                              backgroundColor: `${barColor}40`
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {viz.toLowerCase().includes('pie') && (
                    <div className="flex items-center justify-center h-32">
                      <div className="relative w-28 h-28">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={primaryColor}
                            strokeWidth="20"
                            strokeDasharray="75 25"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={secondaryColor}
                            strokeWidth="20"
                            strokeDasharray="25 75"
                            strokeDashoffset="-75"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  {(viz.toLowerCase().includes('table') || viz.toLowerCase().includes('matrix')) && (
                    <div className="space-y-1">
                      <div 
                        className="grid grid-cols-3 gap-2 p-2 rounded text-xs font-medium"
                        style={{ backgroundColor: `${barColor}20`, color: barColor }}
                      >
                        <span>Category</span>
                        <span>Value</span>
                        <span>%</span>
                      </div>
                      {[1, 2, 3, 4].map((row) => (
                        <div key={row} className="grid grid-cols-3 gap-2 p-2 text-xs text-muted-foreground">
                          <span>Item {row}</span>
                          <span>${(Math.random() * 1000).toFixed(0)}</span>
                          <span>{(Math.random() * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(viz.toLowerCase().includes('card') || viz.toLowerCase().includes('kpi')) && (
                    <div className="flex flex-col items-center justify-center h-32">
                      <div 
                        className="text-4xl font-bold mb-2"
                        style={{ color: barColor }}
                      >
                        {(Math.random() * 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-muted-foreground">vs Last Period</div>
                      <div 
                        className="text-sm font-medium mt-2"
                        style={{ color: theme.good || '#10B981' }}
                      >
                        ↑ {(Math.random() * 30).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  
                  {!['bar', 'line', 'pie', 'table', 'matrix', 'card', 'kpi'].some(type => 
                    viz.toLowerCase().includes(type)
                  ) && (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <div className="text-center">
                        <Icon size={32} weight="duotone" style={{ color: barColor }} />
                        <p className="text-xs mt-2">Visualization Preview</p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {displayVisualizations.length > 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayVisualizations.slice(4, 6).map((viz, index) => {
                const Icon = getVisualizationIcon(viz);
                const colors = [theme.dataColors[4] || primaryColor, theme.dataColors[5] || secondaryColor];
                const barColor = colors[index % colors.length];
                
                return (
                  <Card key={viz} className="p-4 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon size={18} style={{ color: barColor }} weight="duotone" />
                      <h5 className="font-medium text-sm" style={{ color: foregroundColor }}>
                        {viz}
                      </h5>
                    </div>
                    <div className="flex items-center justify-center h-24 text-muted-foreground">
                      <div className="text-center">
                        <Icon size={28} weight="duotone" style={{ color: barColor }} />
                        <p className="text-xs mt-2">Preview</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {requirements?.customInstructions && (
            <Card className="p-3 bg-muted/50 border-dashed">
              <p className="text-xs text-muted-foreground mb-1 font-medium">Additional Requirements:</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {requirements.customInstructions}
              </p>
            </Card>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center mt-4">
        <span className="text-xs text-muted-foreground">Theme Colors:</span>
        {theme.dataColors.slice(0, 6).map((color, index) => (
          <div
            key={index}
            className="w-8 h-8 rounded border-2 border-border shadow-sm"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      </ScrollArea>
    </Card>
  );
}

import { PowerBITheme } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { TrendUp, TrendDown, CurrencyDollar, Users, ShoppingCart, ChartBar } from '@phosphor-icons/react';

interface ReportPreviewProps {
  theme: PowerBITheme;
}

export function ReportPreview({ theme }: ReportPreviewProps) {
  const dataColors = theme.dataColors;
  const background = theme.background ?? '#FFFFFF';
  const foreground = theme.foreground ?? '#000000';
  const good = theme.good ?? '#00B050';
  const bad = theme.bad ?? '#FF0000';
  const neutral = theme.neutral ?? '#FFC000';

  const salesData = [
    { month: 'Jan', value: 45 },
    { month: 'Feb', value: 52 },
    { month: 'Mar', value: 48 },
    { month: 'Apr', value: 61 },
    { month: 'May', value: 55 },
    { month: 'Jun', value: 67 },
    { month: 'Jul', value: 72 },
    { month: 'Aug', value: 65 },
    { month: 'Sep', value: 78 },
    { month: 'Oct', value: 82 },
    { month: 'Nov', value: 88 },
    { month: 'Dec', value: 95 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 35, color: dataColors[0] },
    { name: 'Clothing', value: 25, color: dataColors[1] },
    { name: 'Food', value: 20, color: dataColors[2] },
    { name: 'Home', value: 12, color: dataColors[3] },
    { name: 'Other', value: 8, color: dataColors[4] },
  ];

  const regionData = [
    { region: 'North America', value: 85, color: dataColors[0] },
    { region: 'Europe', value: 72, color: dataColors[1] },
    { region: 'Asia', value: 95, color: dataColors[2] },
    { region: 'South America', value: 58, color: dataColors[3] },
    { region: 'Africa', value: 42, color: dataColors[4] },
  ];

  const maxValue = Math.max(...salesData.map(d => d.value));
  const maxRegionValue = Math.max(...regionData.map(d => d.value));

  return (
    <div className="space-y-4">
      <Card 
        className="p-8 space-y-6 shadow-lg transition-all"
        style={{ backgroundColor: background, color: foreground }}
      >
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: dataColors[0] + '20' }}>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: foreground }}>
              Sales Performance Dashboard
            </h2>
            <p className="text-sm mt-1" style={{ color: foreground, opacity: 0.6 }}>
              Q4 2024 Report
            </p>
          </div>
          <div className="flex gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: dataColors[0] }}
            />
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: dataColors[1] }}
            />
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: dataColors[2] }}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: '$2.4M', change: '+12.5%', trend: 'up', icon: CurrencyDollar },
            { label: 'Active Users', value: '18.2K', change: '+8.3%', trend: 'up', icon: Users },
            { label: 'Orders', value: '4,892', change: '-3.2%', trend: 'down', icon: ShoppingCart },
            { label: 'Conversion', value: '3.8%', change: '+0.5%', trend: 'up', icon: ChartBar },
          ].map((kpi, index) => {
            const Icon = kpi.icon;
            const trendColor = kpi.trend === 'up' ? good : bad;
            const bgColor = dataColors[index % dataColors.length];
            
            return (
              <div
                key={index}
                className="p-4 rounded-lg border transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: background,
                  borderColor: bgColor + '30'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: bgColor + '15' }}
                  >
                    <Icon size={20} weight="bold" style={{ color: bgColor }} />
                  </div>
                  {kpi.trend === 'up' ? (
                    <TrendUp size={16} weight="bold" style={{ color: trendColor }} />
                  ) : (
                    <TrendDown size={16} weight="bold" style={{ color: trendColor }} />
                  )}
                </div>
                <div className="text-2xl font-bold mb-1" style={{ color: foreground }}>
                  {kpi.value}
                </div>
                <div className="text-xs" style={{ color: foreground, opacity: 0.6 }}>
                  {kpi.label}
                </div>
                <div className="text-xs font-semibold mt-2" style={{ color: trendColor }}>
                  {kpi.change}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: foreground }}>
              Monthly Sales Trend
            </h3>
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: background,
                borderColor: dataColors[0] + '20'
              }}
            >
              <div className="flex items-end justify-between h-48 gap-1">
                {salesData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full rounded-t transition-all hover:opacity-80 cursor-pointer relative group"
                      style={{
                        height: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: dataColors[index % dataColors.length],
                      }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold whitespace-nowrap"
                        style={{ color: foreground }}
                      >
                        ${item.value}K
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: foreground, opacity: 0.6 }}>
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: foreground }}>
              Sales by Category
            </h3>
            <div 
              className="p-4 rounded-lg border h-full"
              style={{ 
                backgroundColor: background,
                borderColor: dataColors[1] + '20'
              }}
            >
              <div className="flex items-center justify-center h-48">
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <g transform="translate(90, 90)">
                    {categoryData.map((item, index) => {
                      const total = categoryData.reduce((sum, d) => sum + d.value, 0);
                      const startAngle = categoryData
                        .slice(0, index)
                        .reduce((sum, d) => sum + (d.value / total) * 360, 0);
                      const endAngle = startAngle + (item.value / total) * 360;
                      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

                      const startRad = (startAngle - 90) * (Math.PI / 180);
                      const endRad = (endAngle - 90) * (Math.PI / 180);

                      const innerRadius = 50;
                      const outerRadius = 80;

                      const x1 = Math.cos(startRad) * outerRadius;
                      const y1 = Math.sin(startRad) * outerRadius;
                      const x2 = Math.cos(endRad) * outerRadius;
                      const y2 = Math.sin(endRad) * outerRadius;
                      const x3 = Math.cos(endRad) * innerRadius;
                      const y3 = Math.sin(endRad) * innerRadius;
                      const x4 = Math.cos(startRad) * innerRadius;
                      const y4 = Math.sin(startRad) * innerRadius;

                      return (
                        <path
                          key={index}
                          d={`M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`}
                          fill={item.color}
                          className="transition-all hover:opacity-80 cursor-pointer"
                        />
                      );
                    })}
                  </g>
                </svg>
              </div>
              <div className="mt-4 space-y-2">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span style={{ color: foreground, opacity: 0.8 }}>
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold" style={{ color: foreground }}>
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4" style={{ color: foreground }}>
            Regional Performance
          </h3>
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: background,
              borderColor: dataColors[2] + '20'
            }}
          >
            <div className="space-y-4">
              {regionData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium" style={{ color: foreground }}>
                      {item.region}
                    </span>
                    <span className="font-semibold" style={{ color: item.color }}>
                      ${item.value}K
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: foreground + '10' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.value / maxRegionValue) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div 
            className="p-4 rounded-lg border text-center transition-all hover:shadow-md"
            style={{ 
              backgroundColor: background,
              borderColor: good + '30'
            }}
          >
            <div className="text-3xl font-bold mb-2" style={{ color: good }}>
              ↑ 24%
            </div>
            <div className="text-sm font-medium mb-1" style={{ color: foreground }}>
              Growth Rate
            </div>
            <div className="text-xs" style={{ color: foreground, opacity: 0.6 }}>
              vs last quarter
            </div>
          </div>

          <div 
            className="p-4 rounded-lg border text-center transition-all hover:shadow-md"
            style={{ 
              backgroundColor: background,
              borderColor: neutral + '30'
            }}
          >
            <div className="text-3xl font-bold mb-2" style={{ color: neutral }}>
              → 2.1%
            </div>
            <div className="text-sm font-medium mb-1" style={{ color: foreground }}>
              Market Share
            </div>
            <div className="text-xs" style={{ color: foreground, opacity: 0.6 }}>
              stable position
            </div>
          </div>

          <div 
            className="p-4 rounded-lg border text-center transition-all hover:shadow-md"
            style={{ 
              backgroundColor: background,
              borderColor: bad + '30'
            }}
          >
            <div className="text-3xl font-bold mb-2" style={{ color: bad }}>
              ↓ 8%
            </div>
            <div className="text-sm font-medium mb-1" style={{ color: foreground }}>
              Return Rate
            </div>
            <div className="text-xs" style={{ color: foreground, opacity: 0.6 }}>
              needs attention
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

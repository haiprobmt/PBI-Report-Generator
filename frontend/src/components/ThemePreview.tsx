import { PowerBITheme } from '@/lib/types';
import { Card } from '@/components/ui/card';

interface ThemePreviewProps {
  theme: PowerBITheme;
}

export function ThemePreview({ theme }: ThemePreviewProps) {
  const dataColors = theme.dataColors.slice(0, 8);
  const background = theme.background ?? '#FFFFFF';
  const foreground = theme.foreground ?? '#000000';
  const tableAccent = theme.tableAccent ?? '#118DFF';
  const good = theme.good ?? '#00B050';
  const neutral = theme.neutral ?? '#FFC000';
  const bad = theme.bad ?? '#FF0000';

  return (
    <Card className="p-6 space-y-6" style={{ backgroundColor: background, color: foreground }}>
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: foreground }}>
          Live Preview
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          See how your theme colors will appear in Power BI
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium mb-3" style={{ color: foreground }}>
            Data Colors
          </p>
          <div className="flex gap-2 flex-wrap">
            {dataColors.map((color, index) => (
              <div
                key={index}
                className="w-16 h-16 rounded-lg shadow-sm border border-border transition-transform hover:scale-105"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium mb-3" style={{ color: foreground }}>
            Bar Chart Preview
          </p>
          <div className="flex items-end gap-2 h-40 p-4 bg-card rounded-lg border border-border">
            {dataColors.slice(0, 6).map((color, index) => {
              const heights = [85, 65, 95, 70, 60, 80];
              return (
                <div
                  key={index}
                  className="flex-1 rounded-t transition-all hover:opacity-80"
                  style={{
                    backgroundColor: color,
                    height: `${heights[index]}%`,
                  }}
                />
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium mb-3" style={{ color: foreground }}>
            Donut Chart Preview
          </p>
          <div className="flex justify-center p-4 bg-card rounded-lg border border-border">
            <svg width="140" height="140" viewBox="0 0 140 140" className="transition-transform hover:scale-105">
              <circle
                cx="70"
                cy="70"
                r="50"
                fill="none"
                stroke={dataColors[0]}
                strokeWidth="20"
                strokeDasharray="94.2 314"
                transform="rotate(-90 70 70)"
              />
              <circle
                cx="70"
                cy="70"
                r="50"
                fill="none"
                stroke={dataColors[1]}
                strokeWidth="20"
                strokeDasharray="78.5 314"
                strokeDashoffset="-94.2"
                transform="rotate(-90 70 70)"
              />
              <circle
                cx="70"
                cy="70"
                r="50"
                fill="none"
                stroke={dataColors[2]}
                strokeWidth="20"
                strokeDasharray="62.8 314"
                strokeDashoffset="-172.7"
                transform="rotate(-90 70 70)"
              />
              <circle
                cx="70"
                cy="70"
                r="50"
                fill="none"
                stroke={dataColors[3]}
                strokeWidth="20"
                strokeDasharray="78.5 314"
                strokeDashoffset="-235.5"
                transform="rotate(-90 70 70)"
              />
            </svg>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium mb-3" style={{ color: foreground }}>
            KPI Cards
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-card rounded-lg border border-border text-center transition-all hover:shadow-md">
              <div className="text-2xl font-bold" style={{ color: good }}>
                ↑ 24%
              </div>
              <div className="text-xs mt-1" style={{ color: foreground, opacity: 0.6 }}>
                Good
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border text-center transition-all hover:shadow-md">
              <div className="text-2xl font-bold" style={{ color: neutral }}>
                → 5%
              </div>
              <div className="text-xs mt-1" style={{ color: foreground, opacity: 0.6 }}>
                Neutral
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border text-center transition-all hover:shadow-md">
              <div className="text-2xl font-bold" style={{ color: bad }}>
                ↓ 12%
              </div>
              <div className="text-xs mt-1" style={{ color: foreground, opacity: 0.6 }}>
                Bad
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium mb-3" style={{ color: foreground }}>
            Table Accent
          </p>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="h-2 transition-colors" style={{ backgroundColor: tableAccent }} />
            <div className="p-4 bg-card space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 rounded"
                  style={{ backgroundColor: background }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

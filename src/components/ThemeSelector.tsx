import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PowerBITheme } from '@/lib/types';
import { Palette, Pencil, DownloadSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ThemeSelectorProps {
  selectedTheme: PowerBITheme;
  onCustomize: () => void;
}

export function ThemeSelector({ selectedTheme, onCustomize }: ThemeSelectorProps) {
  const handleDownloadTheme = () => {
    const themeJson = JSON.stringify(selectedTheme, null, 2);
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Theme downloaded successfully!');
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">Selected Theme</h3>
          <p className="text-sm text-muted-foreground">Applied to generated report</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadTheme} className="gap-2">
            <DownloadSimple size={18} weight="bold" />
            Download
          </Button>
          <Button variant="outline" onClick={onCustomize} className="gap-2">
            <Pencil size={18} />
            Customize
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette size={20} className="text-primary" />
            <span className="font-medium">{selectedTheme.name}</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Data Colors</p>
              <div className="flex flex-wrap gap-2">
                {selectedTheme.dataColors.map((color, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-md border-2 border-border shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Background</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border-2 border-border"
                    style={{ backgroundColor: selectedTheme.background }}
                  />
                  <span className="text-xs font-mono">{selectedTheme.background}</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-2">Foreground</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border-2 border-border"
                    style={{ backgroundColor: selectedTheme.foreground }}
                  />
                  <span className="text-xs font-mono">{selectedTheme.foreground}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Sentiment</p>
              <div className="flex gap-2">
                <Badge variant="outline" className="gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedTheme.good }}
                  />
                  Good
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedTheme.neutral }}
                  />
                  Neutral
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedTheme.bad }}
                  />
                  Bad
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

import { ThemePreset } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PresetCardProps {
  preset: ThemePreset;
  onSelect: () => void;
}

export function PresetCard({ preset, onSelect }: PresetCardProps) {
  const categoryColors: Record<string, string> = {
    business: 'bg-blue-500/10 text-blue-700 border-blue-200',
    creative: 'bg-purple-500/10 text-purple-700 border-purple-200',
    nature: 'bg-green-500/10 text-green-700 border-green-200',
    minimal: 'bg-gray-500/10 text-gray-700 border-gray-200',
    bold: 'bg-red-500/10 text-red-700 border-red-200',
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group" onClick={onSelect}>
      <div className="space-y-3">
        <div className="flex gap-1.5 h-20 rounded-md overflow-hidden">
          {preset.theme.dataColors.slice(0, 8).map((color, index) => (
            <div
              key={index}
              className="flex-1 transition-transform group-hover:scale-105"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{preset.name}</h4>
            <Badge 
              variant="outline" 
              className={`text-[10px] px-1.5 py-0 h-4 capitalize ${categoryColors[preset.category] || ''}`}
            >
              {preset.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{preset.description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {preset.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}

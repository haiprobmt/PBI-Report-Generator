import { ThemePreset } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PresetCardProps {
  preset: ThemePreset;
  onSelect: () => void;
}

export function PresetCard({ preset, onSelect }: PresetCardProps) {
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
          <h4 className="font-semibold text-sm mb-1">{preset.name}</h4>
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

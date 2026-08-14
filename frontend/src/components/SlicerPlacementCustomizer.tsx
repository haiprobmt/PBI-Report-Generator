import { SlicerPlacement } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Faders, Check } from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n';

interface SlicerPlacementCustomizerProps {
  slicerCount: number;
  selectedPlacement: SlicerPlacement;
  onPlacementChange: (placement: SlicerPlacement) => void;
}

const PLACEMENT_OPTIONS: Array<{
  value: SlicerPlacement;
  labelKey: 'topHorizontal' | 'leftVertical' | 'rightVertical' | 'topLeftCorner' | 'topRightCorner';
  descriptionKey: 'topHorizontalDescription' | 'leftVerticalDescription' | 'rightVerticalDescription' | 'topLeftCornerDescription' | 'topRightCornerDescription';
}> = [
  {
    value: 'top-horizontal',
    labelKey: 'topHorizontal',
    descriptionKey: 'topHorizontalDescription',
  },
  {
    value: 'left-vertical',
    labelKey: 'leftVertical',
    descriptionKey: 'leftVerticalDescription',
  },
  {
    value: 'right-vertical',
    labelKey: 'rightVertical',
    descriptionKey: 'rightVerticalDescription',
  },
  {
    value: 'top-left-corner',
    labelKey: 'topLeftCorner',
    descriptionKey: 'topLeftCornerDescription',
  },
  {
    value: 'top-right-corner',
    labelKey: 'topRightCorner',
    descriptionKey: 'topRightCornerDescription',
  },
];

export function SlicerPlacementCustomizer({
  slicerCount,
  selectedPlacement,
  onPlacementChange,
}: SlicerPlacementCustomizerProps) {
  const { t } = useLanguage();
  const renderPlacementPreview = (placement: SlicerPlacement) => {
    const renderSlicer = (key: number) => (
      <div key={key} className="bg-primary/30 rounded flex items-center justify-center">
        <Faders size={8} weight="bold" className="text-primary/70" />
      </div>
    );

    const slicers = Array.from({ length: Math.min(slicerCount, 4) }, (_, i) => renderSlicer(i));

    switch (placement) {
      case 'top-horizontal':
        return (
          <div className="w-full h-full p-2 flex flex-col gap-1">
            <div className="h-2 bg-accent/50 rounded" />
            <div className={`grid gap-1 h-3`} style={{ gridTemplateColumns: `repeat(${slicers.length}, 1fr)` }}>
              {slicers}
            </div>
            <div className="flex-1 bg-muted/30 rounded" />
          </div>
        );

      case 'left-vertical':
        return (
          <div className="w-full h-full p-2 flex gap-1">
            <div className="flex flex-col gap-1 w-5">
              <div className="h-2 bg-accent/50 rounded" />
              <div className="flex-1 space-y-1">
                {slicers.map((slicer, i) => (
                  <div key={i} className="h-3">
                    {slicer}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="h-2 bg-accent/50 rounded" />
              <div className="flex-1 bg-muted/30 rounded" />
            </div>
          </div>
        );

      case 'right-vertical':
        return (
          <div className="w-full h-full p-2 flex gap-1">
            <div className="flex-1 flex flex-col gap-1">
              <div className="h-2 bg-accent/50 rounded" />
              <div className="flex-1 bg-muted/30 rounded" />
            </div>
            <div className="flex flex-col gap-1 w-5">
              <div className="h-2 bg-accent/50 rounded" />
              <div className="flex-1 space-y-1">
                {slicers.map((slicer, i) => (
                  <div key={i} className="h-3">
                    {slicer}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'top-left-corner':
        return (
          <div className="w-full h-full p-2 flex flex-col gap-1">
            <div className="flex gap-1">
              <div className="w-10 space-y-1">
                <div className="h-2 bg-accent/50 rounded" />
                <div className="grid gap-1" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {slicers.slice(0, 4)}
                </div>
              </div>
              <div className="flex-1 h-2 bg-accent/50 rounded" />
            </div>
            <div className="flex-1 bg-muted/30 rounded" />
          </div>
        );

      case 'top-right-corner':
        return (
          <div className="w-full h-full p-2 flex flex-col gap-1">
            <div className="flex gap-1">
              <div className="flex-1 h-2 bg-accent/50 rounded" />
              <div className="w-10 space-y-1">
                <div className="h-2 bg-accent/50 rounded" />
                <div className="grid gap-1" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {slicers.slice(0, 4)}
                </div>
              </div>
            </div>
            <div className="flex-1 bg-muted/30 rounded" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">{t('slicerPlacement')}</Label>
        <p className="text-sm text-muted-foreground mt-1">
          {t('slicerPlacementHint', { count: slicerCount, label: t(slicerCount === 1 ? 'slicer' : 'slicers') })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {PLACEMENT_OPTIONS.map((option) => (
          <Card
            key={option.value}
            className={cn(
              'relative cursor-pointer transition-all hover:shadow-md hover:border-primary/50',
              selectedPlacement === option.value
                ? 'ring-2 ring-primary border-primary'
                : ''
            )}
            onClick={() => onPlacementChange(option.value)}
          >
            {selectedPlacement === option.value && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-primary rounded-full p-1">
                  <Check size={16} weight="bold" className="text-primary-foreground" />
                </div>
              </div>
            )}

            <div className="p-4 space-y-3">
              <div
                className="w-full aspect-video bg-gradient-to-br from-muted/50 to-muted rounded border-2 border-border overflow-hidden"
              >
                {renderPlacementPreview(option.value)}
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-sm">{t(option.labelKey)}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(option.descriptionKey)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

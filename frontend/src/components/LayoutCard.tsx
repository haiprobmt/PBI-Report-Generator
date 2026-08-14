import { ReportLayout } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, ChartBar, Sparkle, Lightning, FadersHorizontal, Faders, Textbox } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { LayoutPreview } from '@/components/LayoutPreview';
import { useLanguage } from '@/lib/i18n';

interface LayoutCardProps {
  layout: ReportLayout;
  isSelected: boolean;
  onSelect: () => void;
}

export function LayoutCard({ layout, isSelected, onSelect }: LayoutCardProps) {
  const { language, t } = useLanguage();
  const complexityConfig = {
    simple: { 
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: Sparkle,
    },
    moderate: { 
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Lightning,
    },
    complex: { 
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: FadersHorizontal,
    },
  };

  const ComplexityIcon = complexityConfig[layout.complexity].icon;

  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all hover:shadow-lg',
        isSelected
          ? 'ring-2 ring-primary shadow-lg'
          : 'hover:border-primary/50'
      )}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10">
          <CheckCircle size={32} weight="fill" className="text-primary" />
        </div>
      )}
      
      <div className="p-6 space-y-4">
        <LayoutPreview layout={layout} />

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg">{layout.name}</h3>
            <Badge className={cn('text-xs border flex items-center gap-1', complexityConfig[layout.complexity].color)}>
              <ComplexityIcon size={12} weight="bold" />
              {language === 'vi' ? ({ simple: 'đơn giản', moderate: 'vừa', complex: 'phức tạp' } as const)[layout.complexity] : layout.complexity}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {layout.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText size={16} />
            <span>{layout.pageCount} {t('pages').toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChartBar size={16} />
            <span>{layout.visualizationCount} {t('visualizations').toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Faders size={16} />
            <span>{layout.slicerCount} {t(layout.slicerCount === 1 ? 'slicer' : 'slicers')}</span>
          </div>
          {layout.hasReportHeader && (
            <div className="flex items-center gap-1">
              <Textbox size={16} />
              <span>{t('reportHeader')}</span>
            </div>
          )}
        </div>

        {layout.features.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex flex-wrap gap-1">
              {layout.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {layout.features.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{layout.features.length - 3} {t('more')}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

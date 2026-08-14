import { useState } from 'react';
import { ReportConfigurationSpec } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Copy, 
  Check, 
  CaretDown, 
  CaretUp,
  FileCode,
  DownloadSimple 
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n';

interface ConfigurationSpecViewerProps {
  config: ReportConfigurationSpec;
}

export function ConfigurationSpecViewer({ config }: ConfigurationSpecViewerProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(config, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success(t('configCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t('configCopyFailed'));
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.reportName.replace(/\s+/g, '-').toLowerCase()}-config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t('configDownloaded'));
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileCode size={24} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{t('configSpec')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('configSpecDescription')}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <DownloadSimple size={16} weight="bold" />
            {t('download')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            {isExpanded ? (
              <>
                <CaretUp size={16} />
                {t('collapse')}
              </>
            ) : (
              <>
                <CaretDown size={16} />
                {t('expand')}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">{t('pages')}</p>
            <p className="font-semibold">{config.pages.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">{t('pageSize')}</p>
            <p className="font-semibold text-xs">
              {config.pages[0]?.width || 1280}×{config.pages[0]?.height || 720}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">{t('visualizations')}</p>
            <p className="font-semibold">
              {config.pages.reduce((sum, page) => sum + page.visualizations.length, 0)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">{t('slicers')}</p>
            <p className="font-semibold">
              {config.pages[0]?.slicers.length || 0} {t('perPage')}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">{t('complexity')}</p>
            <Badge variant="secondary" className="capitalize">
              {config.layout.complexity}
            </Badge>
          </div>
        </div>

        {isExpanded && (
          <div className="relative">
            <div className="absolute top-2 right-2 z-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="gap-2 shadow-sm"
              >
                {copied ? (
                  <>
                    <Check size={14} weight="bold" />
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    {t('copy')}
                  </>
                )}
              </Button>
            </div>
            <div className="bg-slate-950 text-slate-50 rounded-lg p-4 overflow-auto max-h-[600px] font-mono text-xs">
              <pre className="pr-20">{jsonString}</pre>
            </div>
          </div>
        )}

        {!isExpanded && (
          <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Code size={20} weight="duotone" />
              <span>
                {t('expandHint')}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

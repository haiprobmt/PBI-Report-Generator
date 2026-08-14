import type { KnowledgeBase } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle, Warning } from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n';

export function KnowledgeBasePreview({ knowledgeBase }: { knowledgeBase: KnowledgeBase }) {
  const { t } = useLanguage();
  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5"><Brain size={24} weight="duotone" className="text-primary" /></div>
          <div>
            <h3 className="font-semibold text-lg">{t('knowledgeBase')}</h3>
            <p className="text-sm text-muted-foreground">{knowledgeBase.summary}</p>
          </div>
        </div>
        <Badge variant="outline">{knowledgeBase.domain || t('domainPending')}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('candidateMetrics')}</p><p className="mt-1 text-sm">{knowledgeBase.metrics.join(', ') || t('toClarify')}</p></div>
        <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('dimensions')}</p><p className="mt-1 text-sm">{knowledgeBase.dimensions.join(', ') || t('toClarify')}</p></div>
        <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('businessProcesses')}</p><p className="mt-1 text-sm">{knowledgeBase.businessProcesses.join(', ') || t('toClarify')}</p></div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {knowledgeBase.hasUsableTabularData ? (
          <><CheckCircle size={18} weight="fill" className="text-green-600" /><span>{t('tabularDetected')}</span></>
        ) : (
          <><Warning size={18} weight="fill" className="text-amber-600" /><span>{t('sampleFallback')}</span></>
        )}
      </div>
    </Card>
  );
}

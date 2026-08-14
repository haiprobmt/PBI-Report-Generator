import type { DataFileContext, KnowledgeBase, PenDocument, ReportConfigurationSpec, ReportRequirements } from '@/lib/types';
import { PenDevWorkspace } from '@/components/PenDevWorkspace';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, PenNib } from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n';

interface TemplateLayoutSelectorProps {
  requirements: ReportRequirements | null;
  knowledgeBase: KnowledgeBase | null;
  dataContext: DataFileContext[];
  reportConfig: ReportConfigurationSpec | null;
  penDocument: PenDocument | null;
  onDownloadPen: () => void;
  onPenDocumentUpdated: (document: PenDocument) => void;
}

export function TemplateLayoutSelector({
  requirements,
  knowledgeBase,
  dataContext,
  reportConfig,
  penDocument,
  onDownloadPen,
  onPenDocumentUpdated,
}: TemplateLayoutSelectorProps) {
  const { language } = useLanguage();
  const copy = language === 'vi' ? {
    title: 'Thiết kế bố cục trên pen.dev',
    description: 'Codex sử dụng kiến thức nguồn và Tóm tắt yêu cầu được phân tích tự động để thiết kế trực tiếp trên canvas pen.dev; bạn có thể nhập điều chỉnh bất kỳ lúc nào.',
    grounded: 'Ngữ cảnh đã sẵn sàng',
    requirements: 'Yêu cầu thiết kế',
    metrics: 'KPI ưu tiên',
    fields: 'Trường dữ liệu khả dụng',
    waiting: 'Đang chuẩn bị cấu hình canvas từ yêu cầu BI…',
  } : {
    title: 'Design the layout in pen.dev',
    description: 'Codex uses the source knowledge and automatically analyzed Requirements Summary to design on the actual pen.dev canvas; you can enter adjustments at any time.',
    grounded: 'Grounded context ready',
    requirements: 'Design requirements',
    metrics: 'Priority KPIs',
    fields: 'Available data fields',
    waiting: 'Preparing the canvas configuration from BI requirements…',
  };

  const fieldCount = new Set(dataContext.flatMap((file) => file.headers)).size;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <PenNib size={26} weight="duotone" className="text-primary" />
              <h2 className="text-2xl font-bold">{copy.title}</h2>
            </div>
            <p className="mt-2 text-muted-foreground">{copy.description}</p>
          </div>
          <Badge className="w-fit gap-1.5" variant="secondary">
            <CheckCircle size={15} weight="fill" /> {copy.grounded}
          </Badge>
        </div>

        {requirements && knowledgeBase && (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-lg bg-muted/45 p-4">
              <p className="text-sm font-semibold">{copy.requirements}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{requirements.description}</p>
            </div>
            <div className="space-y-3 rounded-lg border p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{copy.metrics}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {requirements.keyMetrics.slice(0, 5).map((metric) => <Badge key={metric} variant="outline">{metric}</Badge>)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 border-t pt-3">
                <Badge variant="secondary">{knowledgeBase.domain}</Badge>
                <Badge variant="secondary">{fieldCount} {copy.fields.toLowerCase()}</Badge>
              </div>
            </div>
          </div>
        )}
      </Card>

      {requirements && knowledgeBase && reportConfig && penDocument ? (
        <PenDevWorkspace
          penDocument={penDocument}
          reportConfig={reportConfig}
          requirements={requirements}
          knowledgeBase={knowledgeBase}
          dataContext={dataContext}
          onDownloadPen={onDownloadPen}
          onDocumentUpdated={onPenDocumentUpdated}
        />
      ) : (
        <Card className="p-12 text-center text-muted-foreground">{copy.waiting}</Card>
      )}
    </div>
  );
}

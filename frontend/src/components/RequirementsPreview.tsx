import type { ReportRequirements } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChartBar, Database, FileText, ShieldCheck, Target } from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n';

function TextList({ values, empty }: { values: string[]; empty: string }) {
  if (!values.length) return <p className="text-sm italic text-muted-foreground">{empty}</p>;
  return <ul className="space-y-1 text-sm text-muted-foreground">{values.map((value) => <li key={value}>• {value}</li>)}</ul>;
}

export function RequirementsPreview({ requirements }: { requirements: ReportRequirements }) {
  const { language, t } = useLanguage();
  const vi = language === 'vi';
  const empty = vi ? 'Không yêu cầu hoặc chưa xác định' : 'Not required or not established';
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <CheckCircle size={28} weight="fill" className="text-green-600" />
        <div>
          <h3 className="text-2xl font-bold">{t('requirementsSummary')}</h3>
          <p className="text-sm text-muted-foreground">{vi ? 'Bản đặc tả chi tiết sẽ được chuyển nguyên vẹn sang pen.dev và hướng dẫn cho Agent.' : 'This detailed brief is passed intact to pen.dev and the agent instructions.'}</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-3 flex items-start gap-3"><FileText size={24} className="text-blue-600" /><div><h4 className="font-semibold">{vi ? 'Mục đích, đối tượng và quyết định' : 'Purpose, audience, and decisions'}</h4><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{requirements.description}</p><p className="mt-3 text-sm"><span className="font-medium">{vi ? 'Đối tượng:' : 'Audience:'}</span> {requirements.audience}</p></div></div>
        <div className="grid gap-4 md:grid-cols-2"><div><p className="mb-2 text-xs font-semibold uppercase tracking-wide">{vi ? 'Quyết định / hành động' : 'Decisions / actions'}</p><TextList values={requirements.decisions} empty={empty} /></div><div><p className="mb-2 text-xs font-semibold uppercase tracking-wide">{vi ? 'Câu hỏi nghiệp vụ' : 'Business questions'}</p><TextList values={requirements.businessQuestions} empty={empty} /></div></div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3"><Target size={24} className="text-green-600" /><h4 className="font-semibold">{vi ? 'Hợp đồng KPI và measure' : 'KPI and measure contract'}</h4></div>
        <div className="grid gap-3 md:grid-cols-2">
          {requirements.metricDefinitions.map((metric) => <div key={metric.name} className="rounded-lg border p-4"><p className="font-semibold">{metric.name}</p><p className="mt-1 text-sm text-muted-foreground">{metric.definition}</p><div className="mt-3 space-y-1 text-xs text-muted-foreground"><p><b>{vi ? 'Cách tính:' : 'Calculation:'}</b> {metric.calculation}</p><p><b>{vi ? 'Mục tiêu:' : 'Target:'}</b> {metric.target}</p><p><b>{vi ? 'So sánh:' : 'Comparison:'}</b> {metric.comparison}</p><p><b>{vi ? 'Định dạng:' : 'Format:'}</b> {metric.format}</p><p><b>{vi ? 'Chiều tốt:' : 'Favorable:'}</b> {metric.favorableDirection}</p></div></div>)}
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3"><ChartBar size={24} className="text-purple-600" /><h4 className="font-semibold">{vi ? 'Kiến trúc trang và visual' : 'Page and visual architecture'}</h4></div>
        <div className="mb-4 flex flex-wrap gap-2">{requirements.analysisDimensions.map((dimension) => <Badge key={dimension} variant="outline">{dimension}</Badge>)}</div>
        <p className="mb-4 text-sm text-muted-foreground">{requirements.timeContext.dateField} · {requirements.timeContext.grain} · {requirements.timeContext.defaultPeriod} · {requirements.timeContext.comparisonPeriod}</p>
        <div className="space-y-4">
          {requirements.pageRequirements.map((page) => <div key={page.name} className="rounded-lg border p-4"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{page.name}</p><Badge variant="secondary">{page.pageShape}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{page.purpose}</p><p className="mt-2 text-xs text-muted-foreground">{page.visualTitles.join(' · ')}</p></div>)}
          <div className="grid gap-3 md:grid-cols-2">{requirements.visualRequirements.map((visual) => <div key={visual.title} className="rounded-lg bg-muted/50 p-4"><p className="font-medium">{visual.title} <span className="font-normal text-muted-foreground">({visual.visualType})</span></p><p className="mt-1 text-sm text-muted-foreground">{visual.purpose}</p><p className="mt-2 text-xs text-muted-foreground">{visual.fields.join(', ')} · {visual.encoding} · {visual.sort}</p></div>)}</div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6"><h4 className="mb-3 font-semibold">{vi ? 'Bộ lọc và tương tác' : 'Filters and interactions'}</h4><p className="mb-3 text-sm text-muted-foreground">{requirements.filterStrategy}</p><TextList values={[...requirements.interactions, ...requirements.tooltips, ...requirements.drillthrough]} empty={empty} /></Card>
        <Card className="p-6"><h4 className="mb-3 font-semibold">{vi ? 'Định hướng thiết kế' : 'Design direction'}</h4><p className="text-sm text-muted-foreground">{requirements.design.tone} · {requirements.design.signature} · {requirements.design.canvas}</p><p className="mt-2 text-sm text-muted-foreground">{requirements.design.brandGuidance}</p><p className="mt-2 text-sm text-muted-foreground">{requirements.design.accessibility}</p></Card>
      </div>

      <Card className="p-6"><div className="mb-4 flex items-center gap-3"><Database size={24} className="text-orange-600" /><h4 className="font-semibold">{vi ? 'Hợp đồng dữ liệu' : 'Data contract'}</h4></div><div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2"><p><b>Grain:</b> {requirements.dataRequirements.grain}</p><p><b>Refresh:</b> {requirements.dataRequirements.refreshCadence}</p><p><b>{vi ? 'Nguồn:' : 'Source:'}</b> {requirements.dataRequirements.sourceStrategy}</p><p><b>{vi ? 'Dữ liệu mẫu:' : 'Sample data:'}</b> {requirements.dataRequirements.sampleDataPolicy}</p><p className="md:col-span-2"><b>{vi ? 'Trường bắt buộc:' : 'Required fields:'}</b> {requirements.dataRequirements.requiredFields.join(', ')}</p></div></Card>

      <Card className="p-6"><div className="mb-4 flex items-center gap-3"><ShieldCheck size={24} className="text-slate-600" /><h4 className="font-semibold">{vi ? 'Quản trị và tiêu chí nghiệm thu' : 'Governance and acceptance criteria'}</h4></div><p className="mb-1 text-sm text-muted-foreground"><b>RLS:</b> {requirements.security.rowLevelSecurity}</p><p className="mb-4 text-sm text-muted-foreground"><b>{vi ? 'Độ nhạy:' : 'Sensitivity:'}</b> {requirements.security.sensitivity}</p><TextList values={requirements.acceptanceCriteria} empty={empty} /></Card>

      {(requirements.assumptions.length > 0 || requirements.customInstructions) && <Card className="p-6"><h4 className="mb-3 font-semibold">{vi ? 'Giả định và hướng dẫn bổ sung' : 'Assumptions and additional direction'}</h4><TextList values={[...requirements.assumptions, ...(requirements.customInstructions ? [requirements.customInstructions] : [])]} empty={empty} /></Card>}
    </div>
  );
}

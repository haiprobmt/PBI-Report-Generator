import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, CircleNotch, Robot, Sparkle, WarningCircle } from '@phosphor-icons/react';
import { analyzeRequirements, getAIStatus } from '@/lib/openAI';
import type { DataFileContext, KnowledgeBase, ReportRequirements, RequirementsCoverage } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { RequirementsPreview } from '@/components/RequirementsPreview';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface RequirementAnalysisProps {
  onComplete: (requirements: ReportRequirements) => void;
  onBack: () => void;
  dataContext?: DataFileContext[];
  knowledgeBase?: KnowledgeBase | null;
}

export function RequirementAnalysis({ onComplete, onBack, dataContext = [], knowledgeBase }: RequirementAnalysisProps) {
  const { language } = useLanguage();
  const [requirements, setRequirements] = useState<ReportRequirements | null>(null);
  const [coverage, setCoverage] = useState<RequirementsCoverage | null>(null);
  const [summary, setSummary] = useState('');
  const [provider, setProvider] = useState('DeepSeek V4');
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const startedFor = useRef('');

  const copy = language === 'vi' ? {
    title: 'Phân tích yêu cầu',
    description: 'DeepSeek V4 tự động phân tích toàn bộ tài liệu và dữ liệu đã tải lên để hoàn thiện Tóm tắt yêu cầu cho bước thiết kế bố cục.',
    analyzing: 'Đang phân tích yêu cầu BI…',
    analyzingDescription: 'Đang phát hiện mục đích, KPI, đối tượng, câu hỏi nghiệp vụ, cấu trúc trang, visual, dữ liệu và các giả định cần ghi nhãn.',
    complete: 'Đã hoàn tất phân tích',
    ready: 'Tóm tắt yêu cầu đã sẵn sàng cho pen.dev. Mọi điều chỉnh bổ sung sẽ được nhập trực tiếp cho Codex ở bước Bố cục báo cáo.',
    assumptions: 'Các mục không có bằng chứng rõ trong tài liệu được giữ dưới dạng giả định có nhãn để Codex có thể điều chỉnh ở bước tiếp theo.',
    retry: 'Phân tích lại',
    back: 'Quay lại tải tệp',
    continue: 'Tiếp tục tới bố cục báo cáo',
    failed: 'Không thể phân tích yêu cầu',
  } : {
    title: 'Requirement Analysis',
    description: 'DeepSeek V4 automatically analyzes all uploaded documents and data to finalize the Requirements Summary for layout design.',
    analyzing: 'Analyzing BI requirements…',
    analyzingDescription: 'Detecting purpose, KPIs, audience, business questions, page structure, visuals, data behavior, and assumptions that must be labeled.',
    complete: 'Analysis complete',
    ready: 'The Requirements Summary is ready for pen.dev. Enter any additional adjustment directly for Codex in the Report Layout stage.',
    assumptions: 'Items without clear documentary evidence remain visibly labeled assumptions so Codex can adjust them in the next stage.',
    retry: 'Analyze again',
    back: 'Back to upload',
    continue: 'Continue to report layout',
    failed: 'Requirement analysis failed',
  };

  const runAnalysis = async () => {
    if (!knowledgeBase || isAnalyzing) return;
    setIsAnalyzing(true);
    setError('');
    try {
      const result = await analyzeRequirements(dataContext, knowledgeBase, language);
      setRequirements(result.requirements);
      setCoverage(result.coverage);
      setSummary(result.reply);
      setProvider(result.provider);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : copy.failed);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    getAIStatus().then((status) => setProvider(`DeepSeek V4 · ${status.model}`)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!knowledgeBase) return;
    const analysisKey = `${knowledgeBase.generatedAt}:${language}`;
    if (startedFor.current === analysisKey) return;
    startedFor.current = analysisKey;
    void runAnalysis();
  }, [knowledgeBase, language]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><Robot size={26} weight="duotone" className="text-primary" /></div>
            <div>
              <h2 className="text-2xl font-bold">{copy.title}</h2>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{copy.description}</p>
            </div>
          </div>
          <Badge variant="outline" className="w-fit font-normal">{provider}</Badge>
        </div>

        {isAnalyzing && (
          <div className="py-14 text-center" aria-live="polite">
            <CircleNotch size={42} className="mx-auto animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-semibold">{copy.analyzing}</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">{copy.analyzingDescription}</p>
            <Progress value={68} className="mx-auto mt-5 h-2 max-w-md animate-pulse" />
          </div>
        )}

        {error && !isAnalyzing && (
          <Alert variant="destructive" className="mt-6">
            <WarningCircle size={18} />
            <AlertTitle>{copy.failed}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {requirements && !isAnalyzing && (
          <div className="mt-6 space-y-5">
            <Alert>
              <CheckCircle size={18} />
              <AlertTitle>{copy.complete}</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{summary || copy.ready}</p>
                <p>{copy.assumptions}</p>
              </AlertDescription>
            </Alert>
            {coverage && (
              <div className="rounded-lg border bg-muted/25 p-4">
                <div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium">Requirements Summary</span><span className="font-semibold tabular-nums">{coverage.percentage}%</span></div>
                <Progress value={coverage.percentage} className="h-2" />
              </div>
            )}
          </div>
        )}
      </Card>

      {requirements && !isAnalyzing && <Card className="p-8"><RequirementsPreview requirements={requirements} /></Card>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" size="lg" onClick={onBack} className="gap-2"><ArrowLeft size={18} />{copy.back}</Button>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={() => void runAnalysis()} disabled={isAnalyzing || !knowledgeBase} className="gap-2"><Sparkle size={18} />{copy.retry}</Button>
          <Button size="lg" onClick={() => requirements && onComplete(requirements)} disabled={!requirements || isAnalyzing} className="gap-2">{copy.continue}<ArrowRight size={18} /></Button>
        </div>
      </div>
    </div>
  );
}

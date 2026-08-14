import { useState } from 'react';
import { Brain, Check, ChatCircleDots, CircleNotch, PaperPlaneTilt, Sparkle } from '@phosphor-icons/react';
import { refineSourceKnowledge, type SourceKnowledgeChatMessage } from '@/lib/openAI';
import type { KnowledgeBase } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface SourceKnowledgeChatProps {
  files: File[];
  knowledgeBase: KnowledgeBase;
  onApply: (knowledgeBase: KnowledgeBase) => void;
}

export function SourceKnowledgeChat({ files, knowledgeBase, onApply }: SourceKnowledgeChatProps) {
  const { language } = useLanguage();
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<SourceKnowledgeChatMessage[]>([]);
  const [draft, setDraft] = useState<KnowledgeBase | null>(null);
  const [isSending, setIsSending] = useState(false);

  const copy = language === 'vi' ? {
    title: 'Trao đổi cách AI phân tích nguồn',
    description: 'Hướng dẫn DeepSeek V4 tập trung, diễn giải hoặc phân nhóm thông tin từ chính các file đã tải lên. AI sẽ đọc lại inputs ở mỗi lượt và tạo một bản kiến thức nguồn đề xuất.',
    placeholder: 'Ví dụ: Tập trung vào mục tiêu Phase 2, tiến độ theo tháng, trách nhiệm từng bên và các KPI có thể đo được…',
    send: 'Phân tích theo hướng này',
    sending: 'Đang đọc lại inputs…',
    apply: 'Áp dụng vào kiến thức nguồn',
    applied: 'Đã cập nhật kiến thức nguồn',
    draft: 'Bản đề xuất mới',
    evidence: 'Luôn bám bằng chứng trong file; yêu cầu không được nguồn hỗ trợ sẽ được ghi vào cảnh báo.',
    empty: 'Hãy mô tả góc nhìn, phạm vi hoặc nguyên tắc bạn muốn AI dùng khi phân tích.',
    user: 'Bạn',
    assistant: 'BI Assistant',
    starters: [
      'Ưu tiên các mục tiêu kinh doanh, KPI và chiều phân tích có thể triển khai trong Power BI.',
      'Phân biệt rõ dữ kiện trong nguồn, giả định và thông tin còn thiếu.',
      'Tập trung vào đối tượng sử dụng báo cáo và các quyết định họ cần đưa ra.',
    ],
  } : {
    title: 'Guide how AI analyzes the sources',
    description: 'Tell DeepSeek V4 how to focus, interpret, or group information from the uploaded files. AI rereads the inputs on every turn and proposes a revised source knowledge base.',
    placeholder: 'Example: Focus on Phase 2 objectives, monthly progress, ownership, and measurable KPIs…',
    send: 'Analyze with this direction',
    sending: 'Rereading inputs…',
    apply: 'Apply to source knowledge',
    applied: 'Source knowledge updated',
    draft: 'New proposal',
    evidence: 'All conclusions remain grounded in file evidence; unsupported requests are recorded as warnings.',
    empty: 'Describe the perspective, scope, or rules AI should use for the analysis.',
    user: 'You',
    assistant: 'BI Assistant',
    starters: [
      'Prioritize business objectives, KPIs, and analysis dimensions that can be implemented in Power BI.',
      'Clearly separate source facts, assumptions, and missing information.',
      'Focus on report audiences and the decisions they need to make.',
    ],
  };

  const handleSend = async () => {
    const userMessage = message.trim();
    if (!userMessage || isSending) return;
    setIsSending(true);
    try {
      const result = await refineSourceKnowledge({
        files,
        knowledgeBase: draft ?? knowledgeBase,
        message: userMessage,
        history,
        language,
      });
      setHistory((current) => [
        ...current,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: result.reply },
      ]);
      setDraft(result.knowledgeBase);
      setMessage('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Source-knowledge chat failed.');
    } finally {
      setIsSending(false);
    }
  };

  const handleApply = () => {
    if (!draft) return;
    onApply(draft);
    setDraft(null);
    toast.success(copy.applied);
  };

  return (
    <Card className="overflow-hidden border-primary/20">
      <div className="border-b bg-primary/[0.035] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <ChatCircleDots size={24} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{copy.title}</h3>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{copy.description}</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1.5"><Sparkle size={14} /> DeepSeek V4</Badge>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-lg border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
          <Brain size={16} className="mr-1.5 inline text-primary" />{copy.evidence}
        </div>

        {history.length > 0 ? (
          <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border bg-muted/10 p-3">
            {history.map((item, index) => (
              <div key={`${item.role}-${index}`} className={item.role === 'user' ? 'ml-8' : 'mr-8'}>
                <p className="mb-1 text-xs font-medium text-muted-foreground">{item.role === 'user' ? copy.user : copy.assistant}</p>
                <div className={item.role === 'user'
                  ? 'rounded-lg bg-primary px-3 py-2 text-sm leading-relaxed text-primary-foreground'
                  : 'whitespace-pre-wrap rounded-lg border bg-background px-3 py-2 text-sm leading-relaxed'}>
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{copy.empty}</p>
            <div className="flex flex-wrap gap-2">
              {copy.starters.map((starter) => (
                <button key={starter} type="button" onClick={() => setMessage(starter)} className="rounded-full border bg-background px-3 py-1.5 text-left text-xs transition-colors hover:border-primary/50 hover:bg-primary/5">
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          placeholder={copy.placeholder}
          rows={4}
          disabled={isSending}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {draft && (
            <Button variant="outline" onClick={handleApply} className="gap-2">
              <Check size={17} /> {copy.apply} <Badge variant="secondary">{copy.draft}</Badge>
            </Button>
          )}
          <Button onClick={handleSend} disabled={isSending || !message.trim()} className="gap-2">
            {isSending ? <CircleNotch size={17} className="animate-spin" /> : <PaperPlaneTilt size={17} />}
            {isSending ? copy.sending : copy.send}
          </Button>
        </div>
      </div>
    </Card>
  );
}

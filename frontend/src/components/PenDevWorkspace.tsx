import { useEffect, useRef, useState } from 'react';
import { ArrowSquareOut, CheckCircle, ChatCircleDots, CircleNotch, Code, Copy, Desktop, DownloadSimple, PaperPlaneTilt, PenNib, ShieldCheck, SignIn, WarningCircle, XCircle } from '@phosphor-icons/react';
import {
  getCodexAuthStatus,
  getCodexDeviceLoginState,
  getPenCodexWorkspace,
  preparePenCanvas,
  resolvePenCodexApproval,
  sendPenCodexTurn,
  startCodexDeviceLogin,
  startPenCodexWorkspace,
} from '@/lib/openAI';
import type { CodexAuthStatus, CodexDeviceLoginState, CodexWorkspaceSession, DataFileContext, KnowledgeBase, PenCanvasSession, PenDocument, ReportConfigurationSpec, ReportRequirements } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface PenDevWorkspaceProps {
  penDocument: PenDocument;
  reportConfig: ReportConfigurationSpec;
  requirements: ReportRequirements;
  knowledgeBase: KnowledgeBase;
  dataContext: DataFileContext[];
  onDownloadPen: () => void;
  onDocumentUpdated: (document: PenDocument) => void;
}

export function PenDevWorkspace({
  penDocument,
  reportConfig,
  requirements,
  knowledgeBase,
  dataContext,
  onDownloadPen,
  onDocumentUpdated,
}: PenDevWorkspaceProps) {
  const { language } = useLanguage();
  const [canvas, setCanvas] = useState<PenCanvasSession | null>(null);
  const [workspace, setWorkspace] = useState<CodexWorkspaceSession | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isStartingTurn, setIsStartingTurn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authStatus, setAuthStatus] = useState<CodexAuthStatus | null>(null);
  const [loginState, setLoginState] = useState<CodexDeviceLoginState | null>(null);
  const [isCanvasActive, setIsCanvasActive] = useState(false);
  const [resolvingApprovalId, setResolvingApprovalId] = useState<string | null>(null);
  const appliedDocumentRef = useRef('');
  const [designPrompt, setDesignPrompt] = useState(() => language === 'vi'
    ? 'Tạo bố cục ban đầu từ Tóm tắt yêu cầu đã phân tích. Tuân thủ trường dữ liệu khả dụng, thứ bậc KPI, khoảng cách và accessibility.'
    : 'Create the initial layout from the analyzed Requirements Summary. Honor available fields, KPI hierarchy, spacing, and accessibility.');

  const copy = language === 'vi' ? {
    title: 'Canvas pen.dev và Codex Workspace',
    description: 'Thiết kế canvas ở bên trái và điều khiển một Codex App Server thread tương tác ở bên phải. Mọi yêu cầu ghi cần quyền sẽ dừng lại để bạn quyết định.',
    official: 'pen.dev chính thức',
    high: 'Codex App Server · suy luận cao',
    download: 'Tải tệp .pen',
    codexAccount: 'Tài khoản Codex',
    authChecking: 'Đang kiểm tra đăng nhập…',
    authConnected: 'Codex đã kết nối',
    connect: 'Kết nối Codex',
    connecting: 'Đang bắt đầu đăng nhập…',
    openLogin: 'Mở trang đăng nhập',
    deviceCode: 'Mã dùng một lần',
    copyCode: 'Sao chép mã',
    completeLogin: 'Hoàn tất đăng nhập trong trình duyệt; trạng thái sẽ tự cập nhật.',
    prepare: 'Chuẩn bị canvas .pen',
    preparing: 'Đang chuẩn bị…',
    openVsCode: 'Mở canvas trong VS Code',
    confirmCanvas: 'Tôi đang thấy canvas trong pen.dev',
    canvasConfirmed: 'Canvas đã được xác nhận active',
    activateHint: 'Mở tệp trong VS Code, đợi canvas pen.dev hiển thị, rồi xác nhận trước khi gửi prompt.',
    snapshot: 'Canvas do pen.dev kết xuất',
    waitingCanvas: 'Ảnh canvas sẽ xuất hiện sau khi Pencil đọc và chỉnh sửa thành công.',
    workspace: 'Codex Workspace',
    newThread: 'Thread mới sẽ được tạo khi gửi prompt đầu tiên.',
    prompt: 'Điều chỉnh bố cục',
    promptPlaceholder: 'Ví dụ: Chuyển slicer sang bên trái, giữ bốn KPI ở hàng đầu và tăng độ tương phản…',
    send: 'Gửi cho Codex',
    running: 'Codex đang làm việc…',
    authRequired: 'Hãy kết nối Codex trước khi thiết kế.',
    canvasRequired: 'Hãy chuẩn bị, mở và xác nhận canvas trước khi chạy Codex.',
    approval: 'Codex đang chờ phê duyệt',
    allowOnce: 'Cho phép lần này',
    allowSession: 'Cho phép trong session',
    decline: 'Từ chối',
    completed: 'Lượt Codex đã hoàn tất',
    verified: 'Pencil execute thành công và tệp .pen đã thay đổi.',
    unverified: 'Lượt chạy hoàn tất nhưng chưa xác minh được thay đổi thật trên canvas.',
    started: 'Đã bắt đầu Codex Workspace',
    prepared: 'Đã chuẩn bị tệp canvas',
  } : {
    title: 'pen.dev Canvas and Codex Workspace',
    description: 'Design on the left and control an interactive Codex App Server thread on the right. Any write that needs permission pauses for your decision.',
    official: 'Official pen.dev',
    high: 'Codex App Server · high reasoning',
    download: 'Download .pen file',
    codexAccount: 'Codex account',
    authChecking: 'Checking sign-in…',
    authConnected: 'Codex connected',
    connect: 'Connect Codex',
    connecting: 'Starting sign-in…',
    openLogin: 'Open sign-in page',
    deviceCode: 'One-time code',
    copyCode: 'Copy code',
    completeLogin: 'Complete sign-in in the browser; this status updates automatically.',
    prepare: 'Prepare .pen canvas',
    preparing: 'Preparing…',
    openVsCode: 'Open canvas in VS Code',
    confirmCanvas: 'I can see this canvas in pen.dev',
    canvasConfirmed: 'Canvas confirmed active',
    activateHint: 'Open the file in VS Code, wait for the pen.dev canvas, then confirm before sending a prompt.',
    snapshot: 'Canvas rendered by pen.dev',
    waitingCanvas: 'The canvas image appears after Pencil reads and edits it successfully.',
    workspace: 'Codex Workspace',
    newThread: 'A new thread will be created with the first prompt.',
    prompt: 'Layout adjustment',
    promptPlaceholder: 'Example: Move slicers to the left, keep four KPIs in the first row, and increase contrast…',
    send: 'Send to Codex',
    running: 'Codex is working…',
    authRequired: 'Connect Codex before designing.',
    canvasRequired: 'Prepare, open, and confirm the canvas before running Codex.',
    approval: 'Codex is waiting for approval',
    allowOnce: 'Allow once',
    allowSession: 'Allow for session',
    decline: 'Decline',
    completed: 'Codex turn completed',
    verified: 'Pencil execute succeeded and the .pen file changed.',
    unverified: 'The turn completed without a verified canvas file change.',
    started: 'Codex Workspace started',
    prepared: 'Canvas file prepared',
  };

  const applyWorkspaceSnapshot = (next: CodexWorkspaceSession) => {
    setWorkspace(next);
    if (next.canvasEdited && next.penDocument) {
      const signature = JSON.stringify(next.penDocument);
      if (signature !== appliedDocumentRef.current) {
        appliedDocumentRef.current = signature;
        onDocumentUpdated(next.penDocument);
      }
    }
  };

  useEffect(() => {
    setCanvas(null);
    setWorkspace(null);
    setIsCanvasActive(false);
    appliedDocumentRef.current = '';
  }, [reportConfig.metadata.generatedAt, reportConfig.layout.id]);

  useEffect(() => {
    let active = true;
    getCodexAuthStatus()
      .then((status) => { if (active) setAuthStatus(status); })
      .catch((error) => { if (active) setAuthStatus({ authenticated: false, mode: 'unknown', message: error instanceof Error ? error.message : 'Codex login check failed.' }); })
      .finally(() => { if (active) setIsCheckingAuth(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!loginState || !['starting', 'waiting'].includes(loginState.state)) return;
    let active = true;
    const poll = async () => {
      try {
        const state = await getCodexDeviceLoginState();
        if (!active) return;
        setLoginState(state);
        if (state.state === 'complete') setAuthStatus(await getCodexAuthStatus());
      } catch {
        // Keep the device-code instructions visible and retry.
      }
    };
    const timer = window.setInterval(poll, 1_500);
    void poll();
    return () => { active = false; window.clearInterval(timer); };
  }, [loginState?.state]);

  useEffect(() => {
    if (!workspace?.workspaceId) return;
    let active = true;
    const poll = async () => {
      try {
        const next = await getPenCodexWorkspace(workspace.workspaceId);
        if (active) applyWorkspaceSnapshot(next);
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : 'Codex Workspace polling failed.');
      }
    };
    const timer = window.setInterval(poll, 1_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [workspace?.workspaceId]);

  const handleConnectCodex = async () => {
    setIsCheckingAuth(true);
    try {
      setLoginState(await startCodexDeviceLogin());
      setAuthStatus(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start Codex login.');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handlePrepare = async () => {
    setIsPreparing(true);
    try {
      setCanvas(await preparePenCanvas(reportConfig.reportName, penDocument));
      setWorkspace(null);
      setIsCanvasActive(false);
      toast.success(copy.prepared);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not prepare pen.dev.');
    } finally {
      setIsPreparing(false);
    }
  };

  const handleSend = async () => {
    if (!authStatus?.authenticated) return toast.error(copy.authRequired);
    if (!canvas || !isCanvasActive) return toast.error(copy.canvasRequired);
    const prompt = designPrompt.trim();
    if (!prompt) return;
    setIsStartingTurn(true);
    try {
      const next = workspace && workspace.status !== 'failed'
        ? await sendPenCodexTurn(workspace.workspaceId, prompt)
        : await startPenCodexWorkspace({
            fileName: canvas.fileName,
            requirements,
            knowledgeBase,
            reportConfig,
            dataContext,
            language,
            userPrompt: prompt,
            ...(workspace?.threadId ? { resumeThreadId: workspace.threadId } : {}),
          });
      applyWorkspaceSnapshot(next);
      setCanvas((current) => current ? { ...current, threadId: next.threadId } : current);
      setDesignPrompt('');
      toast.success(copy.started);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start the Codex turn.');
    } finally {
      setIsStartingTurn(false);
    }
  };

  const handleApproval = async (approvalId: string, decision: 'accept' | 'acceptForSession' | 'decline') => {
    if (!workspace) return;
    setResolvingApprovalId(approvalId);
    try {
      applyWorkspaceSnapshot(await resolvePenCodexApproval(workspace.workspaceId, approvalId, decision));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not resolve Codex approval.');
    } finally {
      setResolvingApprovalId(null);
    }
  };

  const isRunning = isStartingTurn || workspace?.status === 'running' || workspace?.status === 'waiting-approval' || workspace?.status === 'starting';
  const screenshot = workspace?.screenshotDataUrl || canvas?.screenshotDataUrl;

  return (
    <Card className="overflow-hidden border-primary/25">
      <div className="flex flex-col gap-4 border-b bg-muted/25 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <PenNib size={24} weight="duotone" className="text-primary" />
            <h3 className="text-lg font-semibold">{copy.title}</h3>
            <Badge variant="outline">{copy.official}</Badge>
            <Badge>{copy.high}</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{copy.description}</p>
        </div>
        <Button variant="outline" onClick={onDownloadPen} className="gap-2">
          <DownloadSimple size={16} /> {copy.download}
        </Button>
      </div>

      <div className="grid gap-3 border-b bg-background p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
        <div className="flex items-center gap-3">
          {authStatus?.authenticated
            ? <CheckCircle size={22} weight="fill" className="text-green-600" />
            : <SignIn size={22} className="text-muted-foreground" />}
          <div>
            <p className="text-sm font-semibold">{copy.codexAccount}</p>
            <p className="text-xs text-muted-foreground">
              {isCheckingAuth ? copy.authChecking : authStatus?.authenticated ? `${copy.authConnected} · ${authStatus.mode}` : authStatus?.message}
            </p>
          </div>
        </div>
        {!authStatus?.authenticated && (
          <Button onClick={handleConnectCodex} disabled={isCheckingAuth || loginState?.state === 'starting'} variant="outline" className="gap-2">
            {isCheckingAuth || loginState?.state === 'starting' ? <CircleNotch size={17} className="animate-spin" /> : <SignIn size={17} />}
            {isCheckingAuth || loginState?.state === 'starting' ? copy.connecting : copy.connect}
          </Button>
        )}
        <Button onClick={handlePrepare} disabled={isPreparing || isRunning} className="gap-2">
          {isPreparing ? <CircleNotch size={17} className="animate-spin" /> : <Code size={17} />}
          {isPreparing ? copy.preparing : copy.prepare}
        </Button>
      </div>

      {loginState && ['waiting', 'complete'].includes(loginState.state) && !authStatus?.authenticated && (
        <div className="grid gap-3 border-b bg-muted/20 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
          {loginState.verificationUrl && (
            <Button asChild size="sm" className="gap-2">
              <a href={loginState.verificationUrl} target="_blank" rel="noreferrer"><ArrowSquareOut size={16} /> {copy.openLogin}</a>
            </Button>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {loginState.userCode && <><span>{copy.deviceCode}</span><code className="rounded border bg-background px-3 py-1.5 font-semibold tracking-widest">{loginState.userCode}</code><Button size="icon" variant="ghost" title={copy.copyCode} onClick={() => navigator.clipboard.writeText(loginState.userCode || '')}><Copy size={16} /></Button></>}
            <span>{copy.completeLogin}</span>
          </div>
        </div>
      )}

      {canvas && (
        <div className="flex flex-col gap-3 border-b bg-primary/[0.025] p-4 lg:flex-row lg:items-center">
          <code className="min-w-0 flex-1 break-all rounded border bg-background px-3 py-2 text-xs">{canvas.absolutePath}</code>
          <Button asChild variant="outline" className="gap-2">
            <a href={canvas.vscodeUrl} onClick={() => setIsCanvasActive(false)}><Desktop size={16} /> {copy.openVsCode}</a>
          </Button>
          <Button type="button" variant={isCanvasActive ? 'secondary' : 'outline'} className="gap-2" onClick={() => setIsCanvasActive(true)}>
            <CheckCircle size={17} weight={isCanvasActive ? 'fill' : 'regular'} />
            {isCanvasActive ? copy.canvasConfirmed : copy.confirmCanvas}
          </Button>
          <p className="text-xs text-muted-foreground lg:max-w-56">{copy.activateHint}</p>
        </div>
      )}

      <div className="grid min-h-[650px] xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="border-b bg-[#15171c] p-5 xl:border-b-0 xl:border-r">
          <div className="mb-3 flex items-center justify-between text-xs text-white/65">
            <span>{copy.snapshot}</span><span>1280 × 720</span>
          </div>
          <div className="flex min-h-[565px] items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#20232b] shadow-inner">
            {screenshot
              ? <img src={screenshot} alt={copy.snapshot} className="h-full w-full object-contain" />
              : <div className="max-w-md p-8 text-center text-sm leading-relaxed text-white/55"><PenNib size={44} weight="duotone" className="mx-auto mb-4 text-white/35" />{copy.waitingCanvas}</div>}
          </div>
        </div>

        <div className="flex min-h-[650px] flex-col bg-background">
          <div className="flex items-center justify-between gap-2 border-b p-4">
            <div className="flex items-center gap-2"><ChatCircleDots size={21} className="text-primary" /><h4 className="font-semibold">{copy.workspace}</h4></div>
            <div className="flex flex-wrap justify-end gap-1.5">
              {workspace?.threadId && <Badge variant="outline" className="max-w-36 truncate">{workspace.threadId}</Badge>}
              <Badge variant={workspace?.status === 'failed' ? 'destructive' : 'secondary'}>{workspace?.status || 'idle'}</Badge>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {!workspace && <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{copy.newThread}</p>}
            {workspace?.events.map((event) => (
              <div key={event.sequence} className={event.type === 'user' ? 'ml-8' : event.type === 'assistant' ? 'mr-5' : ''}>
                {event.type === 'user' || event.type === 'assistant' ? (
                  <div className={event.type === 'user' ? 'rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground' : 'whitespace-pre-wrap rounded-lg border bg-muted/20 px-3 py-2 text-sm leading-relaxed'}>{event.text || copy.running}</div>
                ) : (
                  <div className={`flex items-start gap-2 rounded-md px-2 py-1.5 text-xs ${event.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-muted/30 text-muted-foreground'}`}>
                    {event.type === 'tool' ? <Code size={14} /> : event.type === 'error' ? <WarningCircle size={14} /> : <CircleNotch size={14} className={event.status === 'inProgress' ? 'animate-spin' : ''} />}
                    <span className="break-all">{event.text}{event.status ? ` · ${event.status}` : ''}</span>
                  </div>
                )}
              </div>
            ))}

            {workspace?.approvals.map((approval) => (
              <Alert key={approval.id} className="border-amber-500/50 bg-amber-500/5">
                <ShieldCheck size={18} />
                <AlertTitle>{copy.approval}: {approval.title}</AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>{approval.reason}</p>
                  {approval.command && <code className="block max-h-24 overflow-auto rounded bg-background p-2 text-xs">{approval.command}</code>}
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Button size="sm" variant="outline" disabled={resolvingApprovalId === approval.id} onClick={() => handleApproval(approval.id, 'accept')}>{copy.allowOnce}</Button>
                    <Button size="sm" disabled={resolvingApprovalId === approval.id} onClick={() => handleApproval(approval.id, 'acceptForSession')}>{copy.allowSession}</Button>
                    <Button size="sm" variant="destructive" disabled={resolvingApprovalId === approval.id} onClick={() => handleApproval(approval.id, 'decline')}><XCircle size={15} /> {copy.decline}</Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}

            {workspace?.status === 'completed' && (
              <Alert variant={workspace.canvasEdited ? 'default' : 'destructive'}>
                {workspace.canvasEdited ? <CheckCircle size={18} /> : <WarningCircle size={18} />}
                <AlertTitle>{copy.completed}</AlertTitle>
                <AlertDescription>{workspace.canvasEdited ? copy.verified : workspace.failureMessage || copy.unverified}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-3 border-t p-4">
            <div className="space-y-1.5">
              <Label htmlFor="codex-workspace-prompt">{copy.prompt}</Label>
              <Textarea id="codex-workspace-prompt" value={designPrompt} onChange={(event) => setDesignPrompt(event.target.value)} placeholder={copy.promptPlaceholder} rows={4} disabled={isRunning} />
            </div>
            <Button className="w-full gap-2" onClick={handleSend} disabled={isRunning || !designPrompt.trim() || !canvas || !isCanvasActive || !authStatus?.authenticated}>
              {isRunning ? <CircleNotch size={18} className="animate-spin" /> : <PaperPlaneTilt size={18} />}
              {isRunning ? copy.running : copy.send}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

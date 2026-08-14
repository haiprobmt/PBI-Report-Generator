import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';
import { analyzePenMcpActivity, createPenDesignPrompt, extractPenScreenshot, fileLocation, type PenLanguage } from './penDev.ts';
import { getCodexAuthStatus, resolveCodexModel } from './codexAuth.ts';

type JsonObject = Record<string, unknown>;
type RequestId = number | string;
export type CodexApprovalDecision = 'accept' | 'acceptForSession' | 'decline';

interface PendingRequest {
  resolve: (result: JsonObject) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export interface CodexAppServerMessage extends JsonObject {
  id?: RequestId;
  method?: string;
  params?: JsonObject;
  result?: JsonObject;
  error?: { code?: number; message?: string };
}

export class CodexAppServerProtocol {
  private nextId = 1;
  private readonly pending = new Map<RequestId, PendingRequest>();

  constructor(
    private readonly sendMessage: (message: JsonObject) => void,
    private readonly onServerMessage?: (message: CodexAppServerMessage) => void,
  ) {}

  private request(method: string, params: JsonObject, timeoutMs = 60_000) {
    const id = this.nextId++;
    const promise = new Promise<JsonObject>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Codex App Server request timed out: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
    });
    this.sendMessage({ method, id, params });
    return promise;
  }

  async initialize() {
    const result = await this.request('initialize', {
      clientInfo: {
        name: 'pbi_report_generator',
        title: 'Power BI Report Generator',
        version: '1.0.0',
      },
      capabilities: { experimentalApi: true },
    });
    this.sendMessage({ method: 'initialized', params: {} });
    return result;
  }

  async startThread(input: { cwd: string; model?: string }) {
    const result = await this.request('thread/start', {
      cwd: input.cwd,
      ...(input.model ? { model: input.model } : {}),
      approvalPolicy: 'on-request',
      approvalsReviewer: 'user',
      sandbox: 'workspace-write',
      serviceName: 'pbi_report_generator',
      config: {
        mcp_servers: {
          pencil: {
            default_tools_approval_mode: 'prompt',
            tools: { execute: { approval_mode: 'prompt' } },
          },
        },
      },
    });
    const thread = result.thread as { id?: string } | undefined;
    if (!thread?.id) throw new Error('Codex App Server did not return a thread id.');
    return thread.id;
  }

  async resumeThread(input: { threadId: string; cwd: string; model?: string }) {
    const result = await this.request('thread/resume', {
      threadId: input.threadId,
      cwd: input.cwd,
      ...(input.model ? { model: input.model } : {}),
      approvalPolicy: 'on-request',
      approvalsReviewer: 'user',
      sandbox: 'workspace-write',
      config: {
        mcp_servers: {
          pencil: {
            default_tools_approval_mode: 'prompt',
            tools: { execute: { approval_mode: 'prompt' } },
          },
        },
      },
    });
    const thread = result.thread as { id?: string } | undefined;
    if (!thread?.id) throw new Error('Codex App Server did not resume the requested thread.');
    return thread.id;
  }

  async startTurn(input: { threadId: string; cwd: string; prompt: string }) {
    const result = await this.request('turn/start', {
      threadId: input.threadId,
      input: [{ type: 'text', text: input.prompt }],
      cwd: input.cwd,
      approvalPolicy: 'on-request',
      approvalsReviewer: 'user',
      sandboxPolicy: {
        type: 'workspaceWrite',
        writableRoots: [input.cwd],
        networkAccess: false,
        excludeTmpdirEnvVar: false,
        excludeSlashTmp: false,
      },
      effort: 'high',
      summary: 'concise',
    });
    const turn = result.turn as { id?: string } | undefined;
    if (!turn?.id) throw new Error('Codex App Server did not return a turn id.');
    return turn.id;
  }

  receive(message: CodexAppServerMessage) {
    if (message.id !== undefined && !message.method) {
      const request = this.pending.get(message.id);
      if (!request) return;
      clearTimeout(request.timer);
      this.pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message || 'Codex App Server request failed.'));
      else request.resolve(message.result || {});
      return;
    }
    this.onServerMessage?.(message);
  }

  respond(id: RequestId, result: JsonObject) {
    this.sendMessage({ id, result });
  }

  resolveApproval(request: CodexAppServerMessage, decision: CodexApprovalDecision) {
    if (request.id === undefined) throw new Error('The Codex approval request is missing an id.');
    if (request.method === 'item/commandExecution/requestApproval'
      || request.method === 'item/fileChange/requestApproval') {
      this.respond(request.id, { decision });
      return;
    }
    if (request.method === 'item/tool/requestUserInput') {
      const questions = Array.isArray(request.params?.questions)
        ? request.params.questions as Array<{ id?: string; options?: Array<{ label?: string }> | null }>
        : [];
      const answers = Object.fromEntries(questions.flatMap((question) => {
        if (!question.id) return [];
        const labels = (question.options || []).map((option) => String(option.label || '')).filter(Boolean);
        const matches = (pattern: RegExp) => labels.find((label) => pattern.test(label));
        const selected = decision === 'acceptForSession'
          ? matches(/session/i) || matches(/allow|accept|approve|yes/i) || labels[0]
          : decision === 'accept'
            ? labels.find((label) => !/session/i.test(label) && /allow|accept|approve|yes/i.test(label)) || labels[0]
            : matches(/decline|deny|reject|cancel|no/i) || labels.at(-1);
        return selected ? [[question.id, { answers: [selected] }]] : [];
      }));
      this.respond(request.id, { answers });
      return;
    }
    throw new Error(`Unsupported Codex approval request: ${request.method || 'unknown'}`);
  }

  close(reason = 'Codex App Server connection closed.') {
    for (const request of this.pending.values()) {
      clearTimeout(request.timer);
      request.reject(new Error(reason));
    }
    this.pending.clear();
  }
}

export type CodexWorkspaceStatus = 'starting' | 'ready' | 'running' | 'waiting-approval' | 'completed' | 'failed';

export interface CodexWorkspaceEvent {
  sequence: number;
  type: 'status' | 'user' | 'assistant' | 'tool' | 'error';
  text: string;
  status?: string;
  itemId?: string;
}

export interface CodexWorkspaceApproval {
  id: string;
  method: string;
  title: string;
  reason: string;
  command?: string;
  options: CodexApprovalDecision[];
}

export interface CodexWorkspaceSnapshot {
  workspaceId: string;
  threadId: string;
  activeTurnId?: string;
  status: CodexWorkspaceStatus;
  model: string;
  reasoningEffort: 'high';
  events: CodexWorkspaceEvent[];
  approvals: CodexWorkspaceApproval[];
  summary?: string;
  canvasReadable: boolean;
  canvasEdited: boolean;
  executeAttempted: boolean;
  documentChanged: boolean;
  mcpCallCount: number;
  failureMessage?: string;
  screenshotDataUrl?: string;
  penDocument?: Record<string, unknown>;
}

interface StartWorkspaceInput {
  projectRoot: string;
  env: Record<string, string>;
  fileName: string;
  language: PenLanguage;
  requirements: unknown;
  knowledgeBase: unknown;
  reportConfig: unknown;
  dataContext?: unknown;
  userPrompt: string;
  resumeThreadId?: string;
}

class PenCodexWorkspace {
  readonly workspaceId = randomUUID();
  private readonly child: ChildProcessWithoutNullStreams;
  private readonly protocol: CodexAppServerProtocol;
  private readonly events: CodexWorkspaceEvent[] = [];
  private readonly approvals = new Map<string, { public: CodexWorkspaceApproval; raw: CodexAppServerMessage }>();
  private readonly assistantEvents = new Map<string, CodexWorkspaceEvent>();
  private turnItems: JsonObject[] = [];
  private sequence = 0;
  private status: CodexWorkspaceStatus = 'starting';
  private activeTurnId?: string;
  private summary?: string;
  private originalDocumentText = '';
  private penDocument?: Record<string, unknown>;
  private screenshotDataUrl?: string;
  private canvasReadable = false;
  private canvasEdited = false;
  private executeAttempted = false;
  private documentChanged = false;
  private mcpCallCount = 0;
  private failureMessage?: string;
  private disposed = false;
  threadId = '';

  private constructor(
    private readonly input: StartWorkspaceInput,
    private readonly model: string,
    child: ChildProcessWithoutNullStreams,
  ) {
    this.child = child;
    this.protocol = new CodexAppServerProtocol(
      (message) => this.child.stdin.write(`${JSON.stringify(message)}\n`),
      (message) => this.handleServerMessage(message),
    );

    const lines = readline.createInterface({ input: child.stdout });
    lines.on('line', (line) => {
      try {
        this.protocol.receive(JSON.parse(line) as CodexAppServerMessage);
      } catch {
        this.addEvent('error', `Invalid Codex App Server message: ${line.slice(0, 500)}`);
      }
    });
    child.stderr.on('data', (chunk) => {
      const text = String(chunk).trim();
      if (text) this.addEvent('status', text.slice(-2_000));
    });
    child.once('error', (error) => {
      this.status = 'failed';
      this.addEvent('error', `Could not start Codex App Server: ${error.message}`);
      this.protocol.close(error.message);
    });
    child.once('close', (code) => {
      if (!this.disposed && this.status !== 'completed') {
        this.status = 'failed';
        this.addEvent('error', `Codex App Server exited with code ${code ?? 'unknown'}.`);
      }
      this.protocol.close('Codex App Server exited.');
    });
  }

  static async create(input: StartWorkspaceInput) {
    const location = fileLocation(input.projectRoot, input.fileName);
    const originalDocumentText = await readFile(location.absolutePath, 'utf8');
    const directApiKey = input.env.CODEX_AUTH_MODE?.trim().toLowerCase() === 'api-key';
    const apiKey = directApiKey ? input.env.CODEX_API_KEY?.trim() || input.env.OPENAI_API_KEY?.trim() : undefined;
    const authStatus = apiKey
      ? { authenticated: true, mode: 'api-key' as const, message: 'Using a server-side API key.' }
      : await getCodexAuthStatus();
    if (!authStatus.authenticated) {
      throw new Error('Codex is not connected. Complete the ChatGPT login before opening the Codex Workspace.');
    }
    const resolvedModel = resolveCodexModel({
      authMode: authStatus.mode,
      configuredModel: input.env.CODEX_MODEL,
      hasDirectApiKey: Boolean(apiKey),
    });
    const cli = fileURLToPath(new URL('../node_modules/@openai/codex/bin/codex.js', import.meta.url));
    const child = spawn(process.execPath, [cli, 'app-server'], {
      cwd: location.directory,
      shell: false,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ...(apiKey ? { OPENAI_API_KEY: apiKey } : {}),
      },
    });
    const workspace = new PenCodexWorkspace(input, resolvedModel || 'ChatGPT account default', child);
    workspace.originalDocumentText = originalDocumentText;
    try {
      await workspace.protocol.initialize();
      workspace.threadId = input.resumeThreadId
        ? await workspace.protocol.resumeThread({ threadId: input.resumeThreadId, cwd: location.directory, model: resolvedModel })
        : await workspace.protocol.startThread({ cwd: location.directory, model: resolvedModel });
      workspace.status = 'ready';
      workspace.addEvent('status', input.resumeThreadId
        ? `Resumed Codex thread ${workspace.threadId}.`
        : `Started Codex thread ${workspace.threadId}.`);
      await workspace.startTurn(input.userPrompt);
      return workspace;
    } catch (error) {
      workspace.dispose();
      throw error;
    }
  }

  private addEvent(type: CodexWorkspaceEvent['type'], text: string, extra: Partial<CodexWorkspaceEvent> = {}) {
    const event = { sequence: ++this.sequence, type, text, ...extra };
    this.events.push(event);
    if (this.events.length > 250) this.events.splice(0, this.events.length - 250);
    return event;
  }

  private handleServerMessage(message: CodexAppServerMessage) {
    if (message.id !== undefined && message.method) {
      this.registerApproval(message);
      return;
    }
    const params = message.params || {};
    if (message.method === 'turn/started') {
      const turn = params.turn as { id?: string } | undefined;
      this.activeTurnId = turn?.id || this.activeTurnId;
      this.status = 'running';
      return;
    }
    if (message.method === 'item/agentMessage/delta') {
      const itemId = String(params.itemId || 'assistant');
      const delta = String(params.delta || '');
      let event = this.assistantEvents.get(itemId);
      if (!event) {
        event = this.addEvent('assistant', '', { itemId });
        this.assistantEvents.set(itemId, event);
      }
      event.text += delta;
      return;
    }
    if (message.method === 'item/completed') {
      const item = params.item as JsonObject | undefined;
      if (!item) return;
      this.turnItems.push(item);
      const type = String(item.type || '');
      if (type === 'agentMessage') {
        const text = String(item.text || '');
        if (text) {
          this.summary = text;
          const itemId = String(item.id || 'assistant');
          const event = this.assistantEvents.get(itemId);
          if (event) event.text = text;
          else this.addEvent('assistant', text, { itemId });
        }
      }
      if (type === 'mcpToolCall' || type === 'mcp_tool_call') {
        this.addEvent('tool', `${String(item.server || 'MCP')}/${String(item.tool || 'tool')}`, {
          itemId: String(item.id || ''),
          status: String(item.status || ''),
        });
        void this.refreshCanvasState();
      }
      return;
    }
    if (message.method === 'serverRequest/resolved') {
      const requestId = String(params.requestId || '');
      if (requestId) this.approvals.delete(requestId);
      if (this.approvals.size === 0 && this.status === 'waiting-approval') this.status = 'running';
      return;
    }
    if (message.method === 'turn/completed') {
      const turn = params.turn as { status?: string; error?: { message?: string } | null } | undefined;
      const failed = turn?.status === 'failed';
      this.status = failed ? 'failed' : 'completed';
      if (failed && turn?.error?.message) this.addEvent('error', turn.error.message);
      else this.addEvent('status', failed ? 'Codex turn failed.' : 'Codex turn completed.');
      void this.refreshCanvasState();
      return;
    }
    if (message.method === 'error') {
      const error = params.error as { message?: string } | undefined;
      this.status = 'failed';
      this.addEvent('error', error?.message || 'Codex App Server reported an error.');
    }
  }

  private registerApproval(message: CodexAppServerMessage) {
    const method = message.method || '';
    if (!/requestApproval|requestUserInput|elicitation\/request/i.test(method)) {
      if (message.id !== undefined) this.protocol.respond(message.id, {});
      return;
    }
    const questions = Array.isArray(message.params?.questions)
      ? message.params.questions as Array<{ header?: string; question?: string }>
      : [];
    const firstQuestion = questions[0];
    const id = String(message.id);
    const reason = String(message.params?.reason || firstQuestion?.question || 'Codex requires your approval to continue.');
    const commandValue = message.params?.command;
    const command = Array.isArray(commandValue) ? commandValue.join(' ') : commandValue ? String(commandValue) : undefined;
    const approval: CodexWorkspaceApproval = {
      id,
      method,
      title: firstQuestion?.header || (/fileChange/i.test(method) ? 'File change' : /commandExecution/i.test(method) ? 'Command execution' : 'Pencil tool request'),
      reason,
      ...(command ? { command } : {}),
      options: ['accept', 'acceptForSession', 'decline'],
    };
    this.approvals.set(id, { public: approval, raw: message });
    this.status = 'waiting-approval';
    this.addEvent('status', `${approval.title}: waiting for approval.`);
  }

  async startTurn(prompt: string) {
    if (this.status === 'running' || this.status === 'waiting-approval') {
      throw new Error('Wait for the current Codex turn to finish before sending another adjustment.');
    }
    const userPrompt = prompt.trim();
    if (!userPrompt) throw new Error('Enter a layout adjustment before starting Codex.');
    const location = fileLocation(this.input.projectRoot, this.input.fileName);
    this.originalDocumentText = await readFile(location.absolutePath, 'utf8');
    this.turnItems = [];
    this.assistantEvents.clear();
    this.canvasEdited = false;
    this.documentChanged = false;
    this.failureMessage = undefined;
    this.addEvent('user', userPrompt);
    this.status = 'running';
    const promptWithContext = createPenDesignPrompt({
      targetPath: location.fileName,
      language: this.input.language,
      requirements: this.input.requirements,
      knowledgeBase: this.input.knowledgeBase,
      reportConfig: this.input.reportConfig,
      dataContext: this.input.dataContext,
      userPrompt,
    });
    try {
      this.activeTurnId = await this.protocol.startTurn({
        threadId: this.threadId,
        cwd: location.directory,
        prompt: promptWithContext,
      });
      return this.snapshot();
    } catch (error) {
      this.status = 'failed';
      this.addEvent('error', error instanceof Error ? error.message : 'Could not start the Codex turn.');
      throw error;
    }
  }

  resolveApproval(approvalId: string, decision: CodexApprovalDecision) {
    const approval = this.approvals.get(approvalId);
    if (!approval) throw new Error('This Codex approval is no longer pending.');
    this.protocol.resolveApproval(approval.raw, decision);
    this.approvals.delete(approvalId);
    this.addEvent('status', `${approval.public.title}: ${decision}.`);
    if (this.approvals.size === 0) this.status = 'running';
    return this.snapshot();
  }

  private async refreshCanvasState() {
    try {
      const location = fileLocation(this.input.projectRoot, this.input.fileName);
      const documentText = await readFile(location.absolutePath, 'utf8');
      const document = JSON.parse(documentText) as Record<string, unknown>;
      const activity = analyzePenMcpActivity(this.turnItems);
      this.documentChanged = documentText !== this.originalDocumentText;
      this.canvasReadable = activity.canvasReadable;
      this.canvasEdited = activity.canvasEdited && this.documentChanged;
      this.executeAttempted = activity.executeAttempted;
      this.failureMessage = activity.failureMessage;
      this.mcpCallCount = activity.mcpCallCount;
      this.screenshotDataUrl = extractPenScreenshot(this.turnItems);
      this.penDocument = document;
    } catch {
      // Pencil can be between writes while an item event arrives; the next poll/tool event retries.
    }
  }

  snapshot(): CodexWorkspaceSnapshot {
    return {
      workspaceId: this.workspaceId,
      threadId: this.threadId,
      ...(this.activeTurnId ? { activeTurnId: this.activeTurnId } : {}),
      status: this.status,
      model: this.model,
      reasoningEffort: 'high',
      events: this.events.map((event) => ({ ...event })),
      approvals: [...this.approvals.values()].map((approval) => ({ ...approval.public })),
      ...(this.summary ? { summary: this.summary } : {}),
      canvasReadable: this.canvasReadable,
      canvasEdited: this.canvasEdited,
      executeAttempted: this.executeAttempted,
      documentChanged: this.documentChanged,
      mcpCallCount: this.mcpCallCount,
      ...(this.failureMessage ? { failureMessage: this.failureMessage } : {}),
      ...(this.screenshotDataUrl ? { screenshotDataUrl: this.screenshotDataUrl } : {}),
      ...(this.penDocument ? { penDocument: this.penDocument } : {}),
    };
  }

  dispose() {
    this.disposed = true;
    this.protocol.close('Codex Workspace was closed.');
    if (!this.child.killed) this.child.kill();
  }
}

export class PenCodexWorkspaceManager {
  private readonly workspaces = new Map<string, PenCodexWorkspace>();

  async start(input: StartWorkspaceInput) {
    if (this.workspaces.size >= 5) {
      const oldest = this.workspaces.entries().next().value as [string, PenCodexWorkspace] | undefined;
      if (oldest) {
        oldest[1].dispose();
        this.workspaces.delete(oldest[0]);
      }
    }
    const workspace = await PenCodexWorkspace.create(input);
    this.workspaces.set(workspace.workspaceId, workspace);
    return workspace.snapshot();
  }

  get(workspaceId: string) {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) throw new Error('Codex Workspace session was not found. Start a new session.');
    return workspace;
  }

  closeAll() {
    for (const workspace of this.workspaces.values()) workspace.dispose();
    this.workspaces.clear();
  }
}

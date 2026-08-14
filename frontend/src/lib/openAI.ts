import type { CodexAuthStatus, CodexDeviceLoginState, CodexWorkspaceSession, DataFileContext, KnowledgeBase, PenCanvasSession, PenDocument, ReportConfigurationSpec, ReportRequirements, ReportSimulation, RequirementsCoverage } from './types';
import type { AppLanguage } from './types';

export interface RequirementsAnalysisResult {
  hasEnoughInfo: boolean;
  reply: string;
  requirements: ReportRequirements;
  missingInfo: string;
  coverage: RequirementsCoverage;
  provider: string;
}

export interface AIStatus {
  provider: 'deepseek-v4';
  model: string;
}

export interface FileAnalysisResult {
  knowledgeBase: KnowledgeBase;
  dataContext: DataFileContext[];
}

export interface SourceKnowledgeChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SourceKnowledgeChatResult {
  reply: string;
  knowledgeBase: KnowledgeBase;
  provider: string;
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || `AI request failed with status ${response.status}.`);
  }
  return payload as T;
}

export function getAIStatus(): Promise<AIStatus> {
  return requestJson<AIStatus>('/api/ai/status');
}

export function analyzeRequirements(
  dataContext: DataFileContext[] = [],
  knowledgeBase?: KnowledgeBase | null,
  language: AppLanguage = 'en',
): Promise<RequirementsAnalysisResult> {
  return requestJson<RequirementsAnalysisResult>('/api/ai/requirements-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataContext, knowledgeBase, language }),
  });
}

async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const chunkSize = 0x8000;
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

async function encodeFiles(files: File[]) {
  return Promise.all(files.map(async (file) => ({
    name: file.name,
    type: file.type,
    size: file.size,
    contentBase64: await fileToBase64(file),
  })));
}

export async function analyzeFiles(files: File[], language: AppLanguage = 'en'): Promise<FileAnalysisResult> {
  const encodedFiles = await encodeFiles(files);
  return requestJson<FileAnalysisResult>('/api/ai/analyze-files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: encodedFiles, language }),
  });
}

export async function refineSourceKnowledge(input: {
  files: File[];
  knowledgeBase: KnowledgeBase;
  message: string;
  history: SourceKnowledgeChatMessage[];
  language: AppLanguage;
}): Promise<SourceKnowledgeChatResult> {
  const encodedFiles = await encodeFiles(input.files);
  return requestJson<SourceKnowledgeChatResult>('/api/ai/source-knowledge-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: encodedFiles,
      knowledgeBase: input.knowledgeBase,
      message: input.message,
      history: input.history,
      language: input.language,
    }),
  });
}

export function generateReportSimulation(
  requirements: ReportRequirements,
  dataContext: DataFileContext[],
  themeBrief: string,
  knowledgeBase?: KnowledgeBase | null,
  language: AppLanguage = 'en',
): Promise<ReportSimulation> {
  return requestJson<ReportSimulation>('/api/ai/report-simulation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirements, dataContext, themeBrief, knowledgeBase, language }),
  });
}

export function preparePenCanvas(reportName: string, penDocument: PenDocument): Promise<PenCanvasSession> {
  return requestJson<PenCanvasSession>('/api/pen/prepare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportName, penDocument }),
  });
}

export function designPenCanvasWithCodex(input: {
  fileName: string;
  requirements: ReportRequirements;
  knowledgeBase: KnowledgeBase;
  reportConfig: ReportConfigurationSpec;
  dataContext: DataFileContext[];
  language: AppLanguage;
  userPrompt: string;
  editorConfirmed: boolean;
}): Promise<PenCanvasSession> {
  return requestJson<PenCanvasSession>('/api/pen/design', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function startPenCodexWorkspace(input: {
  fileName: string;
  requirements: ReportRequirements;
  knowledgeBase: KnowledgeBase;
  reportConfig: ReportConfigurationSpec;
  dataContext: DataFileContext[];
  language: AppLanguage;
  userPrompt: string;
  resumeThreadId?: string;
}): Promise<CodexWorkspaceSession> {
  return requestJson<CodexWorkspaceSession>('/api/pen/workspace/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function getPenCodexWorkspace(workspaceId: string): Promise<CodexWorkspaceSession> {
  return requestJson<CodexWorkspaceSession>(`/api/pen/workspace?workspaceId=${encodeURIComponent(workspaceId)}`);
}

export function sendPenCodexTurn(workspaceId: string, prompt: string): Promise<CodexWorkspaceSession> {
  return requestJson<CodexWorkspaceSession>('/api/pen/workspace/turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId, prompt }),
  });
}

export function resolvePenCodexApproval(
  workspaceId: string,
  approvalId: string,
  decision: 'accept' | 'acceptForSession' | 'decline',
): Promise<CodexWorkspaceSession> {
  return requestJson<CodexWorkspaceSession>('/api/pen/workspace/approval', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId, approvalId, decision }),
  });
}

export function getCodexAuthStatus(): Promise<CodexAuthStatus> {
  return requestJson<CodexAuthStatus>('/api/codex/auth/status');
}

export function startCodexDeviceLogin(): Promise<CodexDeviceLoginState> {
  return requestJson<CodexDeviceLoginState>('/api/codex/auth/device', { method: 'POST' });
}

export function getCodexDeviceLoginState(): Promise<CodexDeviceLoginState> {
  return requestJson<CodexDeviceLoginState>('/api/codex/auth/device');
}
